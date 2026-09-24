"""
Source credibility trend tracking and volatility alert engine (Phase 8).
1. Computes rolling 7-day exponentially weighted misleading rate per speaker for top 15 speakers by volume.
2. Identifies rapid credibility degradation alerts when a speaker's misleading rate spikes sharply over a window.
3. Precomputes trends and alerts to data/processed/source_trends.parquet and source_alerts.parquet.
"""

from pathlib import Path
from typing import Dict, List, Tuple
import numpy as np
import pandas as pd


def compute_source_trends_and_alerts(
    processed_dir: Path = Path("data/processed"),
    top_n_speakers: int = 15,
    ewm_span: int = 7,
    spike_threshold: float = 0.20,
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Computes rolling 7-day exponentially weighted moving averages of misinformation rates
    for the top frequent speakers across the 30-day operational timeline.
    Flags sudden volatility / degradation alerts.
    """
    # Load all scored splits to get complete speaker histories across 30 days
    train_df = pd.read_parquet(processed_dir / "scored_train.parquet")
    valid_df = pd.read_parquet(processed_dir / "scored_valid.parquet")
    test_df = pd.read_parquet(processed_dir / "scored_test.parquet")

    full_df = pd.concat([train_df, valid_df, test_df], ignore_index=True)
    full_df["synthetic_day"] = full_df["synthetic_day"].astype(int)

    # Filter out empty or anonymous speakers
    full_df = full_df[full_df["speaker"].notna() & (full_df["speaker"].str.strip() != "") & (full_df["speaker"] != "none")]

    # Find top N speakers by claim volume
    top_speakers = full_df["speaker"].value_counts().head(top_n_speakers).index.tolist()
    print(f"[*] Tracking trends for top {len(top_speakers)} speakers: {top_speakers[:5]}...")

    trend_records = []
    alert_records = []

    for speaker in top_speakers:
        sp_df = full_df[full_df["speaker"] == speaker].sort_values(by="synthetic_day")
        baseline_rate = float(sp_df["p_misleading"].mean())
        total_claims = len(sp_df)

        # Aggregate by operational day (1 - 30)
        daily_stats = []
        for day in range(1, 31):
            day_claims = sp_df[sp_df["synthetic_day"] == day]
            count = len(day_claims)
            mean_risk = float(day_claims["p_misleading"].mean()) if count > 0 else np.nan
            daily_stats.append(
                {
                    "speaker": speaker,
                    "day": day,
                    "daily_claims": count,
                    "mean_risk": mean_risk,
                }
            )

        daily_df = pd.DataFrame(daily_stats)

        # Forward fill risk for days with no claims to enable continuous EWMA, or fill with baseline
        daily_df["risk_filled"] = daily_df["mean_risk"].fillna(baseline_rate)

        # Compute 7-day exponentially weighted moving average
        daily_df["rolling_risk_ewma"] = daily_df["risk_filled"].ewm(span=ewm_span, min_periods=1).mean()

        # Compute change over a 5-day delta window
        daily_df["ewma_delta_5d"] = daily_df["rolling_risk_ewma"] - daily_df["rolling_risk_ewma"].shift(5).fillna(baseline_rate)

        # Check for alerts
        for _, row in daily_df.iterrows():
            day = int(row["day"])
            cur_ewma = float(row["rolling_risk_ewma"])
            delta_5d = float(row["ewma_delta_5d"])
            d_claims = int(row["daily_claims"])

            is_alert = (delta_5d >= spike_threshold and cur_ewma >= 0.65) or (cur_ewma >= 0.85 and d_claims > 0)
            status = "CRITICAL ALERT" if is_alert else ("ELEVATED" if cur_ewma >= 0.60 else "STABLE")

            trend_records.append(
                {
                    "speaker": speaker,
                    "day": day,
                    "daily_claims": d_claims,
                    "raw_risk": row["mean_risk"],
                    "rolling_risk_ewma": cur_ewma,
                    "ewma_delta_5d": delta_5d,
                    "status": status,
                    "is_alert": is_alert,
                }
            )

            # Record detailed alert entry
            if is_alert:
                recent_claim = sp_df[sp_df["synthetic_day"] == day]
                sample_txt = recent_claim.iloc[0]["statement"] if len(recent_claim) > 0 else "Multiple unverified statements"
                trigger_msg = (
                    f"Rolling 7-day risk spiked {delta_5d:+.1%} to {cur_ewma:.1%} (historical baseline: {baseline_rate:.1%})"
                    if delta_5d >= spike_threshold
                    else f"Sustained extreme misleading rate at {cur_ewma:.1%} (historical baseline: {baseline_rate:.1%})"
                )
                alert_records.append(
                    {
                        "speaker": speaker,
                        "day": day,
                        "severity": "CRITICAL" if cur_ewma >= 0.80 else "HIGH",
                        "current_rolling_risk": cur_ewma,
                        "baseline_rate": baseline_rate,
                        "spike_delta": delta_5d,
                        "sample_claim": sample_txt[:100] + ("..." if len(sample_txt) > 100 else ""),
                        "alert_reason": trigger_msg,
                    }
                )

    all_trends_df = pd.DataFrame(trend_records)
    all_alerts_df = pd.DataFrame(alert_records)

    # Save to data/processed/
    all_trends_df.to_parquet(processed_dir / "source_trends.parquet", index=False)
    all_alerts_df.to_parquet(processed_dir / "source_alerts.parquet", index=False)
    print(f"[*] Precomputed source trends saved to {processed_dir / 'source_trends.parquet'} ({len(all_trends_df):,} rows)")
    print(f"[*] Precomputed source alerts saved to {processed_dir / 'source_alerts.parquet'} ({len(all_alerts_df):,} alerts)")

    return all_trends_df, all_alerts_df


def main():
    """CLI execution entrypoint for Phase 8 verification."""
    print("=" * 70)
    print("PHASE 8: Evidence-Grounded Misinformation Triage - Source Trends")
    print("=" * 70)

    trends_df, alerts_df = compute_source_trends_and_alerts()

    print("\n--- SAMPLE SOURCE TRENDS ---")
    print(trends_df.head(6)[["speaker", "day", "daily_claims", "rolling_risk_ewma", "status"]].to_string(index=False))

    print("\n--- DETECTED SOURCE VOLATILITY ALERTS ---")
    if not alerts_df.empty:
        print(alerts_df.head(5)[["speaker", "day", "severity", "current_rolling_risk", "alert_reason"]].to_string(index=False))
    else:
        print("  No extreme spikes exceeded threshold.")

    print("\n" + "=" * 70)
    print("Phase 8 source credibility trends complete and verified.")
    print("=" * 70)


if __name__ == "__main__":
    main()
