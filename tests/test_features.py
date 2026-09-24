"""
Unit tests for linguistic stylometry and source credibility extraction.
"""

import unittest
import pandas as pd
import numpy as np
from src.features import (
    extract_linguistic_features,
    extract_source_features,
    get_all_feature_names,
)


class TestFeatureEngineering(unittest.TestCase):
    def test_extract_linguistic_features(self):
        statements = pd.Series([
            "BREAKING: Shocking bombshell revelation about secret vaccine plots!!!",
            "The committee held a regular standard meeting on Monday morning.",
        ])
        features_df = extract_linguistic_features(statements)
        
        self.assertEqual(len(features_df), 2)
        self.assertIn("ling_char_len", features_df.columns)
        self.assertIn("ling_word_len", features_df.columns)
        self.assertIn("ling_exclamation_cnt", features_df.columns)
        self.assertIn("ling_sensational_cnt", features_df.columns)

        # The sensational statement must score higher on sensational words and exclamations
        self.assertGreater(
            features_df.iloc[0]["ling_sensational_cnt"],
            features_df.iloc[1]["ling_sensational_cnt"],
        )
        self.assertGreater(
            features_df.iloc[0]["ling_exclamation_cnt"],
            features_df.iloc[1]["ling_exclamation_cnt"],
        )

    def test_extract_source_features(self):
        df = pd.DataFrame({
            "count_barely_true": [5, 0],
            "count_false": [3, 0],
            "count_half_true": [1, 5],
            "count_mostly_true": [1, 4],
            "count_pants_fire": [2, 0],
            "party": ["democrat", "republican"],
            "venue_tier": ["social_media", "broadcast_speech"],
        })
        
        train_prior = 0.56
        source_feats = extract_source_features(df, train_prior=train_prior, k=10.0)
        
        self.assertIn("src_smoothed_misleading_rate", source_feats.columns)
        self.assertIn("src_party_democrat", source_feats.columns)
        self.assertIn("src_venue_social_media", source_feats.columns)

        # Speaker with 10 misleading claims out of 12 must have higher smoothed rate than speaker with 0 misleading out of 9
        self.assertGreater(
            source_feats.iloc[0]["src_smoothed_misleading_rate"],
            source_feats.iloc[1]["src_smoothed_misleading_rate"],
        )

    def test_get_all_feature_names(self):
        names = get_all_feature_names()
        self.assertIsInstance(names, list)
        self.assertGreaterEqual(len(names), 14)


if __name__ == "__main__":
    unittest.main()
