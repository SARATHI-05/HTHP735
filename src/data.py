"""
Data ingestion, cleaning, and synthetic metadata synthesis module.
Loads the LIAR dataset splits, applies binary target labeling, synthesizes
reach and timestamp columns, and maps harm topic weights.
"""

from pathlib import Path
from typing import Dict, List, Optional, Tuple
import numpy as np
import pandas as pd

# Raw LIAR dataset schema (14 columns, no header)
LIAR_COLUMNS: List[str] = [
    "id",
    "label",
    "statement",
    "subject",
    "speaker",
    "speaker_job",
    "state",
    "party",
    "count_barely_true",
    "count_false",
    "count_half_true",
    "count_mostly_true",
    "count_pants_fire",
    "context",
]

# Binary target mapping
# misleading = 1 for {pants-fire, false, barely-true}
# misleading = 0 for {half-true, mostly-true, true}
MISLEADING_LABELS = {"pants-fire", "false", "barely-true"}
TRUTHFUL_LABELS = {"half-true", "mostly-true", "true"}

# Centralized harm topic weight definitions
# 1.5 for high-harm public interest topics: health, elections, immigration, crime, economy
# 1.2 for sensitive public policy topics: foreign policy, taxes, environment, education
# 1.0 default for all other subjects
HARM_WEIGHT_TIERS: Dict[str, float] = {
    "critical": 1.5,
    "sensitive": 1.2,
    "default": 1.0,
}

HARM_TOPIC_KEYWORDS: Dict[str, List[str]] = {
    "critical": [
        "health",
        "healthcare",
        "medical",
        "medicare",
        "medicaid",
        "drugs",
        "pandemic",
        "coronavirus",
        "election",
        "elections",
        "voting",
        "campaign",
        "ballot",
        "voter",
        "immigration",
        "immigrant",
        "border",
        "refugee",
        "crime",
        "criminal",
        "gun",
        "guns",
        "homicide",
        "police",
        "economy",
        "job",
        "jobs",
        "inflation",
        "unemployment",
        "recession",
    ],
    "sensitive": [
        "foreign-policy",
        "military",
        "defense",
        "war",
        "terrorism",
        "tax",
        "taxes",
        "budget",
        "deficit",
        "environment",
        "climate",
        "energy",
        "pollution",
        "education",
        "school",
        "schools",
        "civil-rights",
        "abortion",
    ],
}


def infer_venue_tier(context: Optional[str]) -> str:
    """Classifies context text into venue tiers for reach modeling."""
    if not isinstance(context, str) or not context.strip():
        return "other"
    c = context.lower()

    # Tier 1: Social Media platforms (highest organic viral potential)
    if any(
        term in c
        for term in [
            "tweet",
            "twitter",
            "facebook",
            "fb",
            "instagram",
            "tiktok",
            "youtube",
            "social media",
            "online",
            "blog",
            "web",
            "internet",
            "post",
            "meme",
        ]
    ):
        return "social_media"

    # Tier 2: Broadcast / Speeches / Debates (medium-high mass reach)
    if any(
        term in c
        for term in [
            "tv",
            "television",
            "speech",
            "interview",
            "debate",
            "press conference",
            "radio",
            "rally",
            "floor speech",
            "address",
            "news",
            "broadcast",
        ]
    ):
        return "broadcast_speech"

    # Tier 3: Direct Mail / Print Flyers / Local Letters (constrained targeted reach)
    if any(
        term in c
        for term in [
            "mailer",
            "flier",
            "flyer",
            "leaflet",
            "pamphlet",
            "letter",
            "newsletter",
            "print",
            "handout",
            "campaign ad",
        ]
    ):
        return "mailer_print"

    return "other"


def compute_harm_topic_weight(subject: Optional[str]) -> float:
    """Computes harm topic weight based on subjects tagged on the statement."""
    if not isinstance(subject, str) or not subject.strip():
        return HARM_WEIGHT_TIERS["default"]

    tokens = [t.strip().lower() for t in subject.replace(";", ",").split(",") if t.strip()]

    # Check for critical keywords first
    for token in tokens:
        if any(keyword in token for keyword in HARM_TOPIC_KEYWORDS["critical"]):
            return HARM_WEIGHT_TIERS["critical"]

    # Check for sensitive keywords
    for token in tokens:
        if any(keyword in token for keyword in HARM_TOPIC_KEYWORDS["sensitive"]):
            return HARM_WEIGHT_TIERS["sensitive"]

    return HARM_WEIGHT_TIERS["default"]


def generate_synthetic_reach(
    contexts: pd.Series,
    seed: int = 42,
    base_mu: float = 7.6009,  # ln(2000) ~ 7.6009
    sigma: float = 1.35,
) -> pd.Series:
    """
    Generates synthetic reach numbers using a log-normal distribution
    conditioned on venue tiers parsed from statement context.

    Expected properties:
    - Median ~2,000
    - Heavy tail extending into hundreds of thousands and millions
    - Social Media > Broadcast / Speech > Mailer
    """
    rng = np.random.default_rng(seed)
    n = len(contexts)
    raw_noise = rng.normal(loc=0.0, scale=sigma, size=n)

    venue_shifts = {
        "social_media": 0.55,      # median ~ 3,460
        "broadcast_speech": 0.10,  # median ~ 2,210
        "other": 0.00,             # median ~ 2,000
        "mailer_print": -0.60,     # median ~ 1,100
    }

    shifts = np.array([venue_shifts[infer_venue_tier(c)] for c in contexts])
    log_reach = base_mu + shifts + raw_noise
    reach = np.exp(log_reach)

    # Bound reach reasonably: min 10, max 10,000,000
    reach_clipped = np.clip(np.round(reach), 10, 10_000_000).astype(int)
    return pd.Series(reach_clipped, index=contexts.index, name="synthetic_reach")


def generate_synthetic_timestamps(
    n_samples: int,
    seed: int = 42,
    start_date_str: str = "2026-08-25 00:00:00",
    window_days: int = 30,
) -> Tuple[pd.Series, pd.Series]:
    """
    Spreads statements across a continuous 30-day window with fixed seed
    to enable day-by-day moderation queue simulation.
    Returns (synthetic_timestamp, synthetic_day).
    """
    rng = np.random.default_rng(seed)
    total_seconds = window_days * 24 * 3600

    # Draw uniform second offsets across the 30-day evaluation window
    offsets_sec = rng.integers(0, total_seconds, size=n_samples)
    start_ts = pd.Timestamp(start_date_str, tz="UTC")
    timestamps = [start_ts + pd.Timedelta(seconds=int(sec)) for sec in offsets_sec]

    ts_series = pd.Series(timestamps, name="synthetic_timestamp")
    # Day index: 1 through 30
    days_series = pd.Series((offsets_sec // (24 * 3600)) + 1, name="synthetic_day")

    return ts_series, days_series


def process_split(
    file_path: Path,
    seed_offset: int = 0,
) -> pd.DataFrame:
    """
    Loads raw LIAR TSV split, formats columns, binarizes label,
    and appends synthetic reach, timestamps, and harm weights.
    """
    df = pd.read_csv(
        file_path,
        sep="\t",
        header=None,
        names=LIAR_COLUMNS,
        quoting=3,  # QUOTE_NONE to avoid misparsing raw unescaped quotes in LIAR
        keep_default_na=False,
    )

    # Ensure speaker counts are clean integers
    count_cols = [
        "count_barely_true",
        "count_false",
        "count_half_true",
        "count_mostly_true",
        "count_pants_fire",
    ]
    for c in count_cols:
        df[c] = pd.to_numeric(df[c], errors="coerce").fillna(0).astype(int)

    # Post ID
    df["post_id"] = df["id"].astype(str).str.strip()

    # Binarize label: 1 for misleading, 0 for truthful
    df["label_raw"] = df["label"].astype(str).str.strip()
    df["misleading"] = df["label_raw"].apply(lambda x: 1 if x in MISLEADING_LABELS else 0).astype(int)

    # Context venue tier for auditability
    df["venue_tier"] = df["context"].apply(infer_venue_tier)

    # Synthetic reach (fixed seed per split)
    df["synthetic_reach"] = generate_synthetic_reach(df["context"], seed=42 + seed_offset)

    # Synthetic timestamp across 30 days
    timestamps, days = generate_synthetic_timestamps(len(df), seed=42 + seed_offset)
    df["synthetic_timestamp"] = timestamps.values
    df["synthetic_day"] = days.values

    # Harm topic weight
    df["harm_topic_weight"] = df["subject"].apply(compute_harm_topic_weight).astype(float)

    return df


def prepare_datasets(
    raw_dir: Path = Path("data"),
    processed_dir: Path = Path("data/processed"),
) -> Dict[str, pd.DataFrame]:
    """Runs data pipeline for train, valid, and test splits and saves to parquet."""
    processed_dir.mkdir(parents=True, exist_ok=True)

    splits = {
        "train": (raw_dir / "train.tsv", 0),
        "valid": (raw_dir / "valid.tsv", 1),
        "test": (raw_dir / "test.tsv", 2),
    }

    processed_dfs = {}
    for split_name, (tsv_path, seed_off) in splits.items():
        if not tsv_path.exists():
            raise FileNotFoundError(f"Missing raw split file: {tsv_path}")
        print(f"[*] Processing {split_name} split from {tsv_path}...")
        df = process_split(tsv_path, seed_offset=seed_off)

        parquet_path = processed_dir / f"{split_name}.parquet"
        df.to_parquet(parquet_path, index=False)
        processed_dfs[split_name] = df
        print(f"    Saved {len(df):,} rows to {parquet_path}")

    return processed_dfs


def main():
    """CLI execution entrypoint for Phase 1 verification."""
    print("=" * 70)
    print("PHASE 1: Evidence-Grounded Misinformation Triage - Data Pipeline")
    print("=" * 70)

    datasets = prepare_datasets()

    print("\n--- CLASS BALANCE SUMMARY ---")
    for name, df in datasets.items():
        counts = df["misleading"].value_counts().to_dict()
        pct_misleading = (counts.get(1, 0) / len(df)) * 100
        print(
            f"  {name.upper():5s} | Total: {len(df):6,d} | "
            f"Misleading (1): {counts.get(1, 0):5,d} ({pct_misleading:5.1f}%) | "
            f"Truthful (0): {counts.get(0, 0):5,d} ({100 - pct_misleading:5.1f}%)"
        )

    print("\n--- REACH BY VENUE TIER (TRAIN) ---")
    train_df = datasets["train"]
    reach_summary = train_df.groupby("venue_tier")["synthetic_reach"].agg(
        ["count", "median", "mean", "min", "max"]
    )
    print(reach_summary.to_string())

    print("\n--- 5 SAMPLE ROWS (TRAIN) ---")
    sample_cols = [
        "post_id",
        "misleading",
        "label_raw",
        "venue_tier",
        "synthetic_reach",
        "harm_topic_weight",
        "synthetic_day",
        "statement",
    ]
    sample = train_df[sample_cols].head(5)
    for idx, row in sample.iterrows():
        print(f"\n[Sample {idx + 1}] Post ID: {row['post_id']} | Misleading: {row['misleading']} ({row['label_raw']})")
        print(f"  Venue Tier: {row['venue_tier']} | Reach: {row['synthetic_reach']:,} | Harm Weight: {row['harm_topic_weight']} | Day: {row['synthetic_day']}")
        print(f"  Statement: \"{row['statement'][:110]}...\"")

    print("\n" + "=" * 70)
    print("Phase 1 data processing complete and verified successfully.")
    print("=" * 70)


if __name__ == "__main__":
    main()
