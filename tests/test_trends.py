"""
Unit tests for source credibility trend tracking and volatility alert engine.
"""

import unittest
from pathlib import Path
import pandas as pd
from src.trends import compute_source_trends_and_alerts


class TestTrendsEngine(unittest.TestCase):
    def test_compute_source_trends_and_alerts(self):
        processed_dir = Path("data/processed")
        if (processed_dir / "scored_train.parquet").exists():
            trends_df, alerts_df = compute_source_trends_and_alerts(
                processed_dir=processed_dir,
                top_n_speakers=5,
                ewm_span=7,
                spike_threshold=0.20,
            )
            
            self.assertIsInstance(trends_df, pd.DataFrame)
            self.assertIsInstance(alerts_df, pd.DataFrame)
            self.assertIn("rolling_risk_ewma", trends_df.columns)
            self.assertIn("speaker", trends_df.columns)


if __name__ == "__main__":
    unittest.main()
