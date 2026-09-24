"""
End-to-end integration tests verifying multi-module pipelines.
"""

import unittest
from pathlib import Path
import pandas as pd
import numpy as np
import joblib
from src.features import extract_linguistic_features, extract_source_features
from src.queue import compute_reach_score, compute_priority
from src.actions import determine_action_and_reason


class TestPipelineIntegration(unittest.TestCase):
    def setUp(self):
        self.models_dir = Path("models")
        self.processed_dir = Path("data/processed")

    def test_end_to_end_scoring_to_policy_pipeline(self):
        """
        Tests: Feature extraction -> Priority calculation -> Action policy determination.
        """
        # 1. Create a simulated viral high-risk claim
        raw_statement = "BREAKING: Secret documents confirm massive nationwide election ballot fraud!!!"
        df = pd.DataFrame({
            "statement": [raw_statement],
            "count_barely_true": [12],
            "count_false": [8],
            "count_half_true": [1],
            "count_mostly_true": [0],
            "count_pants_fire": [5],
            "party": ["other"],
            "venue_tier": ["social_media"],
            "synthetic_reach": [650000],
            "harm_topic_weight": [1.5],  # Critical elections
            "synthetic_day": [1],
        })

        # 2. Extract linguistic and source features
        ling_feats = extract_linguistic_features(df["statement"])
        src_feats = extract_source_features(df, train_prior=0.56, k=10.0)
        
        self.assertGreater(ling_feats.iloc[0]["ling_sensational_cnt"], 0)
        self.assertGreater(src_feats.iloc[0]["src_smoothed_misleading_rate"], 0.70)

        # 3. Simulate calibrated risk and reach score
        calibrated_risk = 0.88  # High risk
        reach_series = pd.Series([650000, 100, 10000000])
        reach_score = compute_reach_score(reach_series).iloc[0]

        # 4. Calculate multi-factor priority
        priority = compute_priority(
            pd.Series([calibrated_risk]),
            pd.Series([reach_score]),
            pd.Series([1.5]),
            pd.Series([1.0]),
        ).iloc[0]

        self.assertGreater(priority, 0.5)

        # 5. Evaluate policy action
        row = {
            "p_misleading": calibrated_risk,
            "reach_score": reach_score,
            "synthetic_reach": 650000,
            "harm_topic_weight": 1.5,
            "priority": priority,
            "age_boost": 1.0,
        }
        action, reason = determine_action_and_reason(
            row=row,
            is_top_capacity=True,
            rank=1,
            p_escalate_thresh=0.80,
            reach_escalate_thresh=0.70,
        )

        # With 88% risk and high reach, it should trigger Escalate
        self.assertEqual(action, "Escalate")
        self.assertIn("ESCALATE", reason)

    def test_model_bundle_artifacts_integrity(self):
        """
        Verifies that serialized model artifacts in models/ are loadable and valid.
        """
        model_path = self.models_dir / "model.joblib"
        if model_path.exists():
            bundle = joblib.load(model_path)
            self.assertIsInstance(bundle, dict)
            self.assertIn("calibrated_model", bundle)
            self.assertIn("calibration_method", bundle)
            self.assertIn("feature_names", bundle)
            self.assertIn("test_metrics", bundle)
            self.assertGreaterEqual(bundle["test_metrics"]["auc"], 0.75)


if __name__ == "__main__":
    unittest.main()
