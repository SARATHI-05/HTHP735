"""
Claim consistency and NLI evidence retrieval offline module (Phase 7).
1. Builds evidence corpus from TRAIN statements labeled true / mostly-true.
2. Embeds evidence with SentenceTransformer ('all-MiniLM-L6-v2').
3. For each claim (train, valid, test), retrieves top-3 nearest evidence claims by cosine similarity.
   (Ensures zero leakage: valid and test query train-only evidence, excluding self).
4. Scores (evidence, claim) pairs with CrossEncoder ('cross-encoder/nli-deberta-v3-small').
5. Generates features: max_contradiction, max_entailment, mean_neutral, top_similarity,
   best_evidence_text, best_evidence_relation.
6. Caches results and supports resumable execution.
"""

from pathlib import Path
from typing import Dict, List, Optional, Tuple
import numpy as np
import pandas as pd
from sentence_transformers import CrossEncoder, SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from tqdm import tqdm


def build_evidence_corpus(
    train_path: Path = Path("data/processed/train.parquet"),
) -> Tuple[List[str], List[str]]:
    """
    Constructs the verified evidence corpus strictly from TRAIN claims
    labeled 'true' or 'mostly-true'.
    Returns (evidence_ids, evidence_statements).
    """
    train_df = pd.read_parquet(train_path)
    # Ground-truth supported claims store
    mask = train_df["label_raw"].isin(["true", "mostly-true"])
    ev_df = train_df[mask].copy()

    evidence_ids = ev_df["post_id"].tolist()
    evidence_texts = ev_df["statement"].fillna("").astype(str).tolist()

    print(f"[*] Built evidence corpus with {len(evidence_texts):,} verified statements from TRAIN.")
    return evidence_ids, evidence_texts


def compute_evidence_embeddings(
    evidence_texts: List[str],
    embedder: SentenceTransformer,
    cache_path: Path = Path("data/processed/evidence_embeddings.npy"),
) -> np.ndarray:
    """Computes or loads cached dense vector embeddings for the evidence corpus."""
    if cache_path.exists():
        print(f"[*] Loading cached evidence embeddings from {cache_path}...")
        return np.load(cache_path)

    print(f"[*] Embedding {len(evidence_texts):,} evidence statements with all-MiniLM-L6-v2...")
    embeddings = embedder.encode(
        evidence_texts,
        batch_size=128,
        show_progress_bar=True,
        normalize_embeddings=True,
    )
    np.save(cache_path, embeddings)
    print(f"[*] Saved evidence embeddings to {cache_path}.")
    return embeddings


def extract_consistency_for_split(
    df: pd.DataFrame,
    split_name: str,
    evidence_ids: List[str],
    evidence_texts: List[str],
    evidence_embeddings: np.ndarray,
    embedder: SentenceTransformer,
    cross_encoder: CrossEncoder,
    output_path: Path,
    batch_size: int = 128,
) -> pd.DataFrame:
    """
    Retrieves top-3 evidence statements and performs NLI scoring for a split.
    Saves and resumes from output_path.
    """
    if output_path.exists():
        print(f"[*] Found existing cached consistency table for {split_name} at {output_path}. Loading...")
        cached_df = pd.read_parquet(output_path)
        if len(cached_df) == len(df):
            return cached_df
        print(f"    Cache size mismatch ({len(cached_df)} vs {len(df)}). Recomputing...")

    print(f"\n[*] Processing consistency features for {split_name.upper()} ({len(df):,} items)...")
    claim_texts = df["statement"].fillna("").astype(str).tolist()
    claim_ids = df["post_id"].astype(str).tolist()

    # 1. Embed query claims
    print(f"    Embedding {len(claim_texts):,} claims with all-MiniLM-L6-v2...")
    claim_embeddings = embedder.encode(
        claim_texts,
        batch_size=128,
        show_progress_bar=True,
        normalize_embeddings=True,
    )

    # 2. Similarity search & pair generation
    print("    Retrieving top-3 nearest evidence statements per claim...")
    # Compute dot products (equivalent to cosine similarity for normalized vectors)
    sim_matrix = np.dot(claim_embeddings, evidence_embeddings.T)

    all_pairs = []
    pair_metadata = []

    for i in range(len(df)):
        c_id = claim_ids[i]
        c_text = claim_texts[i]
        sims = sim_matrix[i].copy()

        # If querying within train, zero out self-match
        if split_name == "train":
            for ev_idx, ev_id in enumerate(evidence_ids):
                if ev_id == c_id:
                    sims[ev_idx] = -1.0

        # Top-3 indices
        top_indices = np.argsort(sims)[::-1][:3]

        for rank, ev_idx in enumerate(top_indices):
            ev_text = evidence_texts[ev_idx]
            cos_sim = float(sims[ev_idx])
            all_pairs.append((ev_text, c_text))
            pair_metadata.append(
                {
                    "claim_idx": i,
                    "rank": rank,
                    "evidence_text": ev_text,
                    "similarity": cos_sim,
                }
            )

    # 3. CrossEncoder NLI scoring
    print(f"    Scoring {len(all_pairs):,} (evidence, claim) pairs with cross-encoder/nli-deberta-v3-small...")
    nli_scores = cross_encoder.predict(
        all_pairs,
        batch_size=batch_size,
        show_progress_bar=True,
        apply_softmax=True,
    )
    # id2label: {0: 'contradiction', 1: 'entailment', 2: 'neutral'}

    # 4. Aggregate per-claim consistency features
    records = []
    pairs_per_claim = 3
    for i in range(len(df)):
        start_idx = i * pairs_per_claim
        end_idx = start_idx + pairs_per_claim

        claim_pairs_meta = pair_metadata[start_idx:end_idx]
        claim_scores = nli_scores[start_idx:end_idx]

        contra_probs = [float(s[0]) for s in claim_scores]
        entail_probs = [float(s[1]) for s in claim_scores]
        neutral_probs = [float(s[2]) for s in claim_scores]
        similarities = [m["similarity"] for m in claim_pairs_meta]

        max_contra = max(contra_probs)
        max_entail = max(entail_probs)
        mean_neutral = float(np.mean(neutral_probs))
        top_sim = similarities[0]

        # Determine best evidence text and relation
        # Prioritize evidence that strongly contradicts (if high contradiction)
        if max_contra >= 0.50:
            best_idx = int(np.argmax(contra_probs))
            best_relation = "contradiction"
        elif max_entail >= 0.50:
            best_idx = int(np.argmax(entail_probs))
            best_relation = "entailment"
        else:
            best_idx = 0
            best_relation = "neutral"

        best_ev_text = claim_pairs_meta[best_idx]["evidence_text"]

        records.append(
            {
                "post_id": claim_ids[i],
                "max_contradiction": max_contra,
                "max_entailment": max_entail,
                "mean_neutral": mean_neutral,
                "top_similarity": top_sim,
                "best_evidence_text": best_ev_text,
                "best_evidence_relation": best_relation,
            }
        )

    res_df = pd.DataFrame(records)
    res_df.to_parquet(output_path, index=False)
    print(f"    Saved consistency features to {output_path}.")
    return res_df


def run_consistency_pipeline(
    processed_dir: Path = Path("data/processed"),
    max_train_samples: Optional[int] = 3000,
) -> Dict[str, pd.DataFrame]:
    """Runs the complete claim consistency pipeline across test, valid, and train."""
    processed_dir.mkdir(parents=True, exist_ok=True)

    # 1. Models initialization
    print("[*] Initializing offline SentenceTransformer and CrossEncoder...")
    embedder = SentenceTransformer("all-MiniLM-L6-v2")
    cross_encoder = CrossEncoder("cross-encoder/nli-deberta-v3-small")

    # 2. Build evidence corpus from TRAIN
    evidence_ids, evidence_texts = build_evidence_corpus(processed_dir / "train.parquet")
    evidence_embeddings = compute_evidence_embeddings(evidence_texts, embedder)

    # 3. Load splits
    test_df = pd.read_parquet(processed_dir / "test.parquet")
    valid_df = pd.read_parquet(processed_dir / "valid.parquet")
    train_df = pd.read_parquet(processed_dir / "train.parquet")

    # Subsample train if requested for speed (as permitted by specification)
    if max_train_samples is not None and len(train_df) > max_train_samples:
        print(f"[*] Subsampling TRAIN to {max_train_samples:,} items for fast offline NLI processing...")
        train_eval_df = train_df.sample(n=max_train_samples, random_state=42).copy()
    else:
        train_eval_df = train_df.copy()

    # 4. Extract features
    res_test = extract_consistency_for_split(
        test_df,
        "test",
        evidence_ids,
        evidence_texts,
        evidence_embeddings,
        embedder,
        cross_encoder,
        processed_dir / "consistency_test.parquet",
    )

    res_valid = extract_consistency_for_split(
        valid_df,
        "valid",
        evidence_ids,
        evidence_texts,
        evidence_embeddings,
        embedder,
        cross_encoder,
        processed_dir / "consistency_valid.parquet",
    )

    res_train = extract_consistency_for_split(
        train_eval_df,
        "train",
        evidence_ids,
        evidence_texts,
        evidence_embeddings,
        embedder,
        cross_encoder,
        processed_dir / "consistency_train.parquet",
    )

    # Combine into single reference table
    all_consistency = pd.concat([res_train, res_valid, res_test], ignore_index=True)
    all_consistency.drop_duplicates(subset=["post_id"], keep="first", inplace=True)
    all_consistency.to_parquet(processed_dir / "consistency.parquet", index=False)
    print(f"[*] Saved merged consistency table ({len(all_consistency):,} items) to {processed_dir / 'consistency.parquet'}")

    return {
        "test": res_test,
        "valid": res_valid,
        "train": res_train,
    }


def main():
    """CLI execution entrypoint for Phase 7 verification."""
    print("=" * 70)
    print("PHASE 7: Evidence-Grounded Misinformation Triage - Claim Consistency")
    print("=" * 70)

    results = run_consistency_pipeline(max_train_samples=2500)

    test_c = results["test"]
    print("\n--- TEST CONSISTENCY FEATURE DISTRIBUTIONS ---")
    print(test_c[["max_contradiction", "max_entailment", "mean_neutral", "top_similarity"]].describe().to_string())

    print("\n--- SAMPLE EXTRACTED EVIDENCE & CONTRADICTIONS (TEST SPLIT) ---")
    high_contra = test_c[test_c["max_contradiction"] >= 0.60].head(3)
    for idx, row in high_contra.iterrows():
        print(f"\n[Post ID: {row['post_id']}] Contradiction Score: {row['max_contradiction']:.2f} | Entailment: {row['max_entailment']:.2f}")
        print(f"  Relation: {row['best_evidence_relation'].upper()} (Top Similarity: {row['top_similarity']:.3f})")
        print(f"  Best Evidence Claim: \"{row['best_evidence_text'][:120]}...\"")

    print("\n" + "=" * 70)
    print("Phase 7 offline consistency extraction complete.")
    print("=" * 70)


if __name__ == "__main__":
    main()
