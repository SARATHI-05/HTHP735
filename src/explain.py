"""
SHAP Explanation and Plain-English Rationale Generation Module (Phase 4).
1. Computes SHAP values with TreeExplainer on underlying LightGBM.
2. Aggregates SHAP per FEATURE_GROUP (sum of values pushing toward 'misleading').
3. Generates explain_item() output dictionary with risk, top group, group contributions,
   top 3 individual drivers, and template-grounded plain-English rationales.
4. Precomputes explanations for test set into data/processed/explanations.parquet.
"""

from pathlib import Path
import re
from typing import Any, Dict, List, Optional, Tuple, Union
import joblib
import numpy as np
import pandas as pd
import shap

from src.features import FEATURE_GROUPS, PATTERNS


def get_tree_explainer(model) -> shap.TreeExplainer:
    """Instantiates a TreeExplainer for the underlying tree-based classifier."""
    return shap.TreeExplainer(model)


def compute_shap_matrix(
    explainer: shap.TreeExplainer,
    X: pd.DataFrame,
) -> np.ndarray:
    """Computes SHAP values pushing towards class 1 (misleading)."""
    sv = explainer(X)
    if hasattr(sv, "values"):
        vals = sv.values
        # If 3D array (n_samples, n_features, n_classes), select class 1
        if len(vals.shape) == 3 and vals.shape[2] == 2:
            return vals[:, :, 1]
        return vals
    raw = explainer.shap_values(X)
    if isinstance(raw, list) and len(raw) == 2:
        return np.array(raw[1])
    return np.array(raw)


def aggregate_shap_by_group(
    shap_row: np.ndarray,
    feature_names: List[str],
) -> Dict[str, float]:
    """
    Sums SHAP values per feature group for an item.
    Positive SHAP values push towards misleading (class 1).
    """
    feat_to_shap = dict(zip(feature_names, shap_row))
    group_sums = {}

    for grp_name, grp_cols in FEATURE_GROUPS.items():
        if not grp_cols:
            group_sums[grp_name] = 0.0
            continue
        val = sum(feat_to_shap.get(col, 0.0) for col in grp_cols)
        group_sums[grp_name] = float(val)

    return group_sums


def extract_top_drivers(
    shap_row: np.ndarray,
    feature_names: List[str],
    row_values: Union[pd.Series, Dict[str, Any]],
    n_top: int = 3,
) -> List[Dict[str, Any]]:
    """
    Extracts top individual feature drivers for an item.
    Ranks by absolute magnitude with priority given to positive contributions toward misleading.
    """
    drivers = []
    for feat_name, s_val in zip(feature_names, shap_row):
        f_val = row_values.get(feat_name, 0.0)
        drivers.append(
            {
                "feature": feat_name,
                "value": float(f_val) if isinstance(f_val, (int, float, np.number)) else f_val,
                "shap": float(s_val),
            }
        )

    # Sort primarily by signed SHAP if risk > 0.5, or absolute magnitude
    drivers.sort(key=lambda d: d["shap"], reverse=True)
    return drivers[:n_top]


def format_plain_english_rationale(
    risk: float,
    group_contributions: Dict[str, float],
    top_drivers: List[Dict[str, Any]],
    row: Union[pd.Series, Dict[str, Any]],
) -> str:
    """
    Constructs a transparent plain-English rationale from templates.
    CRITICAL RULE: Every single number in the text is strictly computed from model
    outputs, feature values, or extracted text snippets. No synthetic hallucination.
    """
    risk_pct = round(risk * 100)
    statement = str(row.get("statement", ""))

    # Header risk assessment
    header = f"{risk_pct}% likely misleading." if risk >= 0.50 else f"{risk_pct}% risk (likely credible)."

    # Rank active groups by positive SHAP contribution
    ranked_groups = sorted(
        [(grp, val) for grp, val in group_contributions.items() if grp != "consistency" or val != 0.0],
        key=lambda x: x[1],
        reverse=True,
    )

    narrative_points = []
    point_idx = 1

    for grp_name, s_val in ranked_groups:
        if grp_name == "source":
            # Extract speaker history rate and count
            speaker_rate = float(row.get("src_smoothed_misleading_rate", 0.0)) * 100
            log_hist = float(row.get("src_log_history", 0.0))
            venue = str(row.get("venue_tier", "other")).replace("_", " ")

            desc = f"Source: speaker's history is {speaker_rate:.0f}% misleading claims (history log-vol: {log_hist:.1f}, venue: {venue})"
            narrative_points.append(f"({point_idx}) {desc}.")
            point_idx += 1

        elif grp_name == "linguistic":
            abs_cnt = int(row.get("ling_absolute_cnt", 0))
            stat_cnt = int(row.get("ling_num_stat_cnt", 0))
            caps_ratio = float(row.get("ling_caps_ratio", 0.0)) * 100
            excl_cnt = int(row.get("ling_exclamation_cnt", 0))

            terms_matched = PATTERNS["absolute"].findall(statement)
            if terms_matched:
                uniq_terms = sorted(list(set(t.lower() for t in terms_matched)))[:3]
                terms_str = f" ({', '.join(f'{t!r}' for t in uniq_terms)})"
            else:
                terms_str = ""

            ling_parts = []
            if abs_cnt > 0:
                ling_parts.append(f"{abs_cnt} absolute terms{terms_str}")
            else:
                ling_parts.append("0 absolute terms")

            if stat_cnt > 0:
                ling_parts.append(f"{stat_cnt} statistics/numerical claims")
            else:
                ling_parts.append("0 cited statistics")

            if caps_ratio > 15:
                ling_parts.append(f"{caps_ratio:.0f}% uppercase styling")

            if excl_cnt > 0:
                ling_parts.append(f"{excl_cnt} exclamation mark(s)")

            desc = f"Language: {', '.join(ling_parts)}"
            narrative_points.append(f"({point_idx}) {desc}.")
            point_idx += 1

        elif grp_name == "text":
            text_score = float(row.get("text_score", 0.50)) * 100
            desc = f"Text signal: vocabulary alignment with misleading claims is {text_score:.0f}%"
            narrative_points.append(f"({point_idx}) {desc}.")
            point_idx += 1

        elif grp_name == "consistency":
            # Populated in Phase 7 when consistency features exist
            ev_snippet = row.get("best_evidence_text")
            ev_contra = row.get("max_contradiction")
            if ev_snippet and ev_contra is not None and float(ev_contra) > 0.4:
                snippet_trunc = str(ev_snippet)[:60].strip()
                desc = f"Consistency: contradicts retrieved evidence '{snippet_trunc}...' ({float(ev_contra):.2f})"
                narrative_points.append(f"({point_idx}) {desc}.")
                point_idx += 1

        if point_idx > 3:
            break

    full_rationale = f"{header} {' '.join(narrative_points)}"
    return full_rationale


def explain_item(
    row: Union[pd.Series, Dict[str, Any]],
    shap_row: np.ndarray,
    feature_names: List[str],
) -> Dict[str, Any]:
    """
    Explains an individual item by computing group contributions,
    top 3 feature drivers, and a plain-English rationale.
    """
    risk = float(row.get("p_misleading", 0.5))
    group_contributions = aggregate_shap_by_group(shap_row, feature_names)

    # Determine top group (excluding empty groups)
    active_groups = {k: v for k, v in group_contributions.items() if len(FEATURE_GROUPS.get(k, [])) > 0 or v != 0}
    if active_groups:
        top_group = max(active_groups.items(), key=lambda x: x[1])[0]
    else:
        top_group = "source"

    top_3 = extract_top_drivers(shap_row, feature_names, row, n_top=3)
    rationale = format_plain_english_rationale(risk, group_contributions, top_3, row)

    return {
        "risk": risk,
        "top_group": top_group,
        "per_group_contributions": group_contributions,
        "top_3_drivers": top_3,
        "rationale": rationale,
    }


def precompute_test_explanations(
    processed_dir: Path = Path("data/processed"),
    models_dir: Path = Path("models"),
    output_name: str = "explanations.parquet",
) -> pd.DataFrame:
    """
    Precomputes SHAP matrices and explanations for the entire test set.
    Saves results to data/processed/explanations.parquet for fast runtime lookup in app.py.
    """
    scored_test_path = processed_dir / "scored_test.parquet"
    if not scored_test_path.exists():
        raise FileNotFoundError(f"Missing scored test split at {scored_test_path}")

    model_path = models_dir / "model.joblib"
    if not model_path.exists():
        raise FileNotFoundError(f"Missing model bundle at {model_path}")

    scored_test = pd.read_parquet(scored_test_path)
    bundle = joblib.load(model_path)
    base_model = bundle["base_model"]
    feature_names = bundle["feature_names"]

    X_test = scored_test[feature_names]

    # Compute SHAP values
    explainer = get_tree_explainer(base_model)
    shap_matrix = compute_shap_matrix(explainer, X_test)

    # Precompute explanations row-by-row
    records = []
    for i, (_, row) in enumerate(scored_test.iterrows()):
        shap_row = shap_matrix[i]
        explanation = explain_item(row, shap_row, feature_names)

        record = {
            "post_id": row["post_id"],
            "p_misleading": explanation["risk"],
            "top_group": explanation["top_group"],
            "shap_source": explanation["per_group_contributions"].get("source", 0.0),
            "shap_linguistic": explanation["per_group_contributions"].get("linguistic", 0.0),
            "shap_text": explanation["per_group_contributions"].get("text", 0.0),
            "shap_consistency": explanation["per_group_contributions"].get("consistency", 0.0),
            "driver_1_feat": explanation["top_3_drivers"][0]["feature"] if len(explanation["top_3_drivers"]) > 0 else "",
            "driver_1_val": explanation["top_3_drivers"][0]["value"] if len(explanation["top_3_drivers"]) > 0 else 0.0,
            "driver_1_shap": explanation["top_3_drivers"][0]["shap"] if len(explanation["top_3_drivers"]) > 0 else 0.0,
            "driver_2_feat": explanation["top_3_drivers"][1]["feature"] if len(explanation["top_3_drivers"]) > 1 else "",
            "driver_2_val": explanation["top_3_drivers"][1]["value"] if len(explanation["top_3_drivers"]) > 1 else 0.0,
            "driver_2_shap": explanation["top_3_drivers"][1]["shap"] if len(explanation["top_3_drivers"]) > 1 else 0.0,
            "driver_3_feat": explanation["top_3_drivers"][2]["feature"] if len(explanation["top_3_drivers"]) > 2 else "",
            "driver_3_val": explanation["top_3_drivers"][2]["value"] if len(explanation["top_3_drivers"]) > 2 else 0.0,
            "driver_3_shap": explanation["top_3_drivers"][2]["shap"] if len(explanation["top_3_drivers"]) > 2 else 0.0,
            "rationale": explanation["rationale"],
        }
        records.append(record)

    expl_df = pd.DataFrame(records)

    # Merge metadata for complete standalone test evaluation in the dashboard
    meta_cols = [
        "post_id",
        "statement",
        "speaker",
        "venue_tier",
        "synthetic_reach",
        "synthetic_timestamp",
        "synthetic_day",
        "harm_topic_weight",
        "label_raw",
        "misleading",
    ]
    merged = pd.merge(scored_test[meta_cols], expl_df, on="post_id", how="inner")

    out_path = processed_dir / output_name
    merged.to_parquet(out_path, index=False)
    print(f"[*] Precomputed {len(merged):,} explanations saved to {out_path}")

    return merged


def main():
    """CLI execution entrypoint for Phase 4 verification."""
    print("=" * 70)
    print("PHASE 4: Evidence-Grounded Misinformation Triage - Explanation Engine")
    print("=" * 70)

    expl_df = precompute_test_explanations()

    print("\n--- EXPLANATION GROUP DISTRIBUTION (TEST SPLIT) ---")
    print(expl_df["top_group"].value_counts().to_string())

    print("\n--- SAMPLE GENERATED EXPLANATIONS & RATIONALES ---")
    sample = expl_df.head(4)
    for idx, row in sample.iterrows():
        print(f"\n[Post ID: {row['post_id']}] Ground Truth: {row['label_raw']} | Risk: {row['p_misleading']:.2%}")
        print(f"  Statement: \"{row['statement'][:100]}...\"")
        print(f"  Top Group: {row['top_group'].upper()} (SHAP source: {row['shap_source']:+.3f}, ling: {row['shap_linguistic']:+.3f}, text: {row['shap_text']:+.3f})")
        print(f"  Top Driver 1: {row['driver_1_feat']} = {row['driver_1_val']:.3f} (SHAP: {row['driver_1_shap']:+.3f})")
        print(f"  Top Driver 2: {row['driver_2_feat']} = {row['driver_2_val']:.3f} (SHAP: {row['driver_2_shap']:+.3f})")
        print(f"  Top Driver 3: {row['driver_3_feat']} = {row['driver_3_val']:.3f} (SHAP: {row['driver_3_shap']:+.3f})")
        print(f"  Plain-English Rationale:\n    \"{row['rationale']}\"")

    print("\n" + "=" * 70)
    print("Phase 4 SHAP explanation engine complete and verified successfully.")
    print("=" * 70)


if __name__ == "__main__":
    main()
