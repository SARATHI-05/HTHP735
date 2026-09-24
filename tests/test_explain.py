"""
Unit tests for plain-English rationale generation and SHAP aggregation.
"""

import unittest
import numpy as np
import pandas as pd
from src.explain import (
    aggregate_shap_by_group,
    format_plain_english_rationale,
)
from src.features import get_all_feature_names


class TestExplainEngine(unittest.TestCase):
    def test_aggregate_shap_by_group(self):
        feature_names = get_all_feature_names()
        # Mock SHAP row
        shap_row = np.zeros(len(feature_names))
        # Set positive SHAP value on first feature (linguistic)
        shap_row[0] = 0.35
        
        group_sums = aggregate_shap_by_group(shap_row, feature_names)
        self.assertIn("linguistic", group_sums)
        self.assertAlmostEqual(group_sums["linguistic"], 0.35, places=2)

    def test_format_plain_english_rationale(self):
        top_drivers = [
            {"feature": "src_smoothed_misleading_rate", "value": 0.82, "shap": 0.34},
            {"feature": "ling_sensational_cnt", "value": 2, "shap": 0.18},
        ]
        
        row = pd.Series({
            "statement": "Breaking shocking news about national election fraud.",
            "src_smoothed_misleading_rate": 0.82,
            "src_log_history": 3.4,
            "venue_tier": "social_media",
            "ling_absolute_cnt": 0,
            "ling_num_stat_cnt": 0,
            "ling_caps_ratio": 0.0,
            "ling_exclamation_cnt": 0,
            "ling_sensational_cnt": 2,
        })
        
        rationale = format_plain_english_rationale(
            risk=0.88,
            group_contributions={"source": 0.34, "linguistic": 0.18},
            top_drivers=top_drivers,
            row=row,
        )
        
        self.assertIsInstance(rationale, str)
        self.assertTrue(len(rationale) > 20)
        self.assertIn("88%", rationale)


if __name__ == "__main__":
    unittest.main()
