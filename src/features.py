"""
Feature engineering module (Phase 2).
Extracts:
1. Linguistic features (syntax, punctuation, absolute phrasing, sensationalism, hedging, stats)
2. Source-credibility features (smoothed historical misleading rate, log history, party/venue encodings)
3. Text signal via out-of-fold TF-IDF + Logistic Regression
4. Claim consistency placeholders (populated in Phase 7)
"""

from pathlib import Path
import re
from typing import Dict, List, Tuple
import joblib
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold

# Explicit feature groups mapping for SHAP aggregation and model modularity
FEATURE_GROUPS: Dict[str, List[str]] = {
    "linguistic": [
        "ling_char_len",
        "ling_word_len",
        "ling_exclamation_cnt",
        "ling_question_cnt",
        "ling_caps_ratio",
        "ling_absolute_cnt",
        "ling_sensational_cnt",
        "ling_hedging_cnt",
        "ling_num_stat_cnt",
        "ling_quote_cnt",
    ],
    "source": [
        "src_smoothed_misleading_rate",
        "src_log_history",
        "src_party_democrat",
        "src_party_republican",
        "src_party_other",
        "src_venue_social_media",
        "src_venue_broadcast_speech",
        "src_venue_mailer_print",
        "src_venue_other",
    ],
    "consistency": [],  # Starts empty; populated in Phase 7
    "text": ["text_score"],
}

# Regex patterns for linguistic cues
PATTERNS = {
    "absolute": re.compile(
        r"\b(always|never|all|none|100%|everyone|everybody|nobody|no one|completely|totally|entirely)\b",
        re.IGNORECASE,
    ),
    "sensational": re.compile(
        r"\b(shocking|bombshell|unbelievable|exposed|secret|conspiracy|crisis|disaster|scandal|corrupt|outrageous|mind-blowing|destroy|destructive)\b",
        re.IGNORECASE,
    ),
    "hedging": re.compile(
        r"\b(maybe|perhaps|possibly|allegedly|reportedly|appears|seems|claimed|supposedly|might|could|suggests|unconfirmed)\b",
        re.IGNORECASE,
    ),
    "numbers_stats": re.compile(
        r"(\b\d+([,.]\d+)?%?\b|\$\d+([,.]\d+)?|\b(trillion|billion|million|percent|percentage)\b)",
        re.IGNORECASE,
    ),
    "quotes": re.compile(r'["\'“”‘’]'),
}


def extract_linguistic_features(statements: pd.Series) -> pd.DataFrame:
    """Extracts rule-based stylistic and lexical signals from claim text."""
    feats = pd.DataFrame(index=statements.index)

    cleaned = statements.fillna("").astype(str)

    # 1. Statement length in characters and words
    feats["ling_char_len"] = cleaned.str.len()
    feats["ling_word_len"] = cleaned.str.split().apply(len)

    # 2. Punctuation indicators
    feats["ling_exclamation_cnt"] = cleaned.apply(lambda s: s.count("!"))
    feats["ling_question_cnt"] = cleaned.apply(lambda s: s.count("?"))

    # 3. All-caps ratio (uppercase letters / total alphabetic letters)
    def calc_caps_ratio(s: str) -> float:
        alphas = [c for c in s if c.isalpha()]
        if not alphas:
            return 0.0
        return sum(1 for c in alphas if c.isupper()) / len(alphas)

    feats["ling_caps_ratio"] = cleaned.apply(calc_caps_ratio)

    # 4. Lexical categories counts
    feats["ling_absolute_cnt"] = cleaned.apply(lambda s: len(PATTERNS["absolute"].findall(s)))
    feats["ling_sensational_cnt"] = cleaned.apply(lambda s: len(PATTERNS["sensational"].findall(s)))
    feats["ling_hedging_cnt"] = cleaned.apply(lambda s: len(PATTERNS["hedging"].findall(s)))
    feats["ling_num_stat_cnt"] = cleaned.apply(lambda s: len(PATTERNS["numbers_stats"].findall(s)))
    feats["ling_quote_cnt"] = cleaned.apply(lambda s: len(PATTERNS["quotes"].findall(s)))

    return feats


def extract_source_features(
    df: pd.DataFrame,
    train_prior: float,
    k: float = 10.0,
) -> pd.DataFrame:
    """
    Extracts credibility signals from speaker historical fact-check record
    and contextual venue/party encodings.

    NOTE: LIAR historical counts (barely_true, false, etc.) may partly include
    the current statement (mild dataset-level leakage inherent to the original
    LIAR benchmark). Documented in README limitations.
    """
    feats = pd.DataFrame(index=df.index)

    count_barely = df["count_barely_true"].fillna(0).astype(float)
    count_false = df["count_false"].fillna(0).astype(float)
    count_half = df["count_half_true"].fillna(0).astype(float)
    count_mostly = df["count_mostly_true"].fillna(0).astype(float)
    count_pants = df["count_pants_fire"].fillna(0).astype(float)

    total_history = count_barely + count_false + count_half + count_mostly + count_pants
    misleading_history = count_barely + count_false + count_pants

    # Bayesian-smoothed historical misleading rate using strictly TRAIN prior
    feats["src_smoothed_misleading_rate"] = (misleading_history + (train_prior * k)) / (total_history + k)
    feats["src_log_history"] = np.log1p(total_history)

    # Party one-hot encodings
    parties = df["party"].fillna("").astype(str).str.lower()
    feats["src_party_democrat"] = (parties == "democrat").astype(int)
    feats["src_party_republican"] = (parties == "republican").astype(int)
    feats["src_party_other"] = (~parties.isin(["democrat", "republican"])).astype(int)

    # Venue tier one-hot encodings
    venues = df["venue_tier"].fillna("other").astype(str)
    feats["src_venue_social_media"] = (venues == "social_media").astype(int)
    feats["src_venue_broadcast_speech"] = (venues == "broadcast_speech").astype(int)
    feats["src_venue_mailer_print"] = (venues == "mailer_print").astype(int)
    feats["src_venue_other"] = (venues == "other").astype(int)

    return feats


def fit_and_generate_text_scores(
    train_df: pd.DataFrame,
    valid_df: pd.DataFrame,
    test_df: pd.DataFrame,
    models_dir: Path = Path("models"),
) -> Tuple[np.ndarray, np.ndarray, np.ndarray, Dict]:
    """
    Fits TF-IDF (1-2 grams, max 20k) + Logistic Regression.
    Produces an out-of-fold (5-fold) text_score for train to prevent leakage,
    and fitted-model inference scores for valid and test.
    """
    models_dir.mkdir(parents=True, exist_ok=True)

    train_texts = train_df["statement"].fillna("").astype(str).values
    train_y = train_df["misleading"].values
    valid_texts = valid_df["statement"].fillna("").astype(str).values
    test_texts = test_df["statement"].fillna("").astype(str).values

    # 1. Out-of-fold scoring for train
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    train_oof_scores = np.zeros(len(train_texts), dtype=float)

    for fold, (trn_idx, val_idx) in enumerate(skf.split(train_texts, train_y)):
        fold_vec = TfidfVectorizer(
            ngram_range=(1, 2),
            max_features=20000,
            stop_words="english",
            sublinear_tf=True,
        )
        X_fold_trn = fold_vec.fit_transform(train_texts[trn_idx])
        X_fold_val = fold_vec.transform(train_texts[val_idx])

        fold_clf = LogisticRegression(C=1.0, max_iter=1000, random_state=42)
        fold_clf.fit(X_fold_trn, train_y[trn_idx])
        train_oof_scores[val_idx] = fold_clf.predict_proba(X_fold_val)[:, 1]

    # 2. Fit full text model on entire TRAIN split for valid/test inference
    full_vec = TfidfVectorizer(
        ngram_range=(1, 2),
        max_features=20000,
        stop_words="english",
        sublinear_tf=True,
    )
    X_train_full = full_vec.fit_transform(train_texts)
    full_clf = LogisticRegression(C=1.0, max_iter=1000, random_state=42)
    full_clf.fit(X_train_full, train_y)

    valid_scores = full_clf.predict_proba(full_vec.transform(valid_texts))[:, 1]
    test_scores = full_clf.predict_proba(full_vec.transform(test_texts))[:, 1]

    # Save artifacts for offline re-use / inference
    text_model_bundle = {
        "vectorizer": full_vec,
        "classifier": full_clf,
    }
    joblib.dump(text_model_bundle, models_dir / "text_model.joblib")

    return train_oof_scores, valid_scores, test_scores, text_model_bundle


def build_feature_matrices(
    processed_dir: Path = Path("data/processed"),
    models_dir: Path = Path("models"),
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """
    Constructs complete feature sets for train, valid, and test sets.
    Saves tables as features_*.parquet.
    """
    train_df = pd.read_parquet(processed_dir / "train.parquet")
    valid_df = pd.read_parquet(processed_dir / "valid.parquet")
    test_df = pd.read_parquet(processed_dir / "test.parquet")

    # Global prior strictly from TRAIN (NO test/valid leakage)
    train_prior = float(train_df["misleading"].mean())

    # 1. Linguistic features
    ling_train = extract_linguistic_features(train_df["statement"])
    ling_valid = extract_linguistic_features(valid_df["statement"])
    ling_test = extract_linguistic_features(test_df["statement"])

    # 2. Source features
    src_train = extract_source_features(train_df, train_prior=train_prior)
    src_valid = extract_source_features(valid_df, train_prior=train_prior)
    src_test = extract_source_features(test_df, train_prior=train_prior)

    # 3. Compact text signal (out-of-fold for train, fitted for valid/test)
    text_trn, text_val, text_tst, _ = fit_and_generate_text_scores(
        train_df, valid_df, test_df, models_dir=models_dir
    )

    # Metadata and target columns to preserve
    meta_cols = [
        "post_id",
        "misleading",
        "label_raw",
        "statement",
        "speaker",
        "venue_tier",
        "synthetic_reach",
        "synthetic_timestamp",
        "synthetic_day",
        "harm_topic_weight",
    ]

    def assemble(df_meta: pd.DataFrame, ling: pd.DataFrame, src: pd.DataFrame, text_sc: np.ndarray) -> pd.DataFrame:
        out = df_meta[meta_cols].copy()
        # Join linguistic
        for col in ling.columns:
            out[col] = ling[col].values
        # Join source
        for col in src.columns:
            out[col] = src[col].values
        # Join text score
        out["text_score"] = text_sc
        return out

    feat_train = assemble(train_df, ling_train, src_train, text_trn)
    feat_valid = assemble(valid_df, ling_valid, src_valid, text_val)
    feat_test = assemble(test_df, ling_test, src_test, text_tst)

    # Persist feature tables
    feat_train.to_parquet(processed_dir / "features_train.parquet", index=False)
    feat_valid.to_parquet(processed_dir / "features_valid.parquet", index=False)
    feat_test.to_parquet(processed_dir / "features_test.parquet", index=False)

    return feat_train, feat_valid, feat_test


def get_all_feature_names() -> List[str]:
    """Returns list of active feature names across all groups."""
    names = []
    for grp in ["linguistic", "source", "consistency", "text"]:
        names.extend(FEATURE_GROUPS.get(grp, []))
    return names


def main():
    """CLI execution entrypoint for Phase 2 verification."""
    print("=" * 70)
    print("PHASE 2: Evidence-Grounded Misinformation Triage - Feature Pipeline")
    print("=" * 70)

    feat_train, feat_valid, feat_test = build_feature_matrices()

    all_feats = get_all_feature_names()
    print("\n--- FEATURE COUNTS PER GROUP ---")
    for grp, cols in FEATURE_GROUPS.items():
        print(f"  {grp.upper():12s}: {len(cols):2d} features -> {cols}")
    print(f"  TOTAL ACTIVE: {len(all_feats)} features")

    print("\n--- FEATURE TABLE SHAPES ---")
    print(f"  Train: {feat_train.shape} (Saved to data/processed/features_train.parquet)")
    print(f"  Valid: {feat_valid.shape} (Saved to data/processed/features_valid.parquet)")
    print(f"  Test:  {feat_test.shape} (Saved to data/processed/features_test.parquet)")

    print("\n--- TARGET CORRELATIONS ON TRAIN (TOP FEATURES) ---")
    corrs = feat_train[all_feats].apply(lambda c: c.corr(feat_train["misleading"])).sort_values(ascending=False)
    for col, corr in corrs.items():
        print(f"  {col:32s}: {corr:+.4f}")

    print("\n--- SAMPLE EXTRACTED FEATURES (FIRST 2 TRAIN ROWS) ---")
    preview_cols = ["post_id", "misleading", "src_smoothed_misleading_rate", "text_score", "ling_caps_ratio", "ling_absolute_cnt"]
    print(feat_train[preview_cols].head(2).to_string(index=False))

    print("\n" + "=" * 70)
    print("Phase 2 feature engineering complete and verified successfully.")
    print("=" * 70)


if __name__ == "__main__":
    main()
