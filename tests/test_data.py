"""
Unit tests for data ingestion, synthetic reach generator, and topic harm mapping.
"""

import unittest
import pandas as pd
import numpy as np
from src.data import (
    compute_harm_topic_weight,
    generate_synthetic_reach,
    generate_synthetic_timestamps,
    infer_venue_tier,
    MISLEADING_LABELS,
    TRUTHFUL_LABELS,
)


class TestDataIngestion(unittest.TestCase):
    def test_binary_label_sets(self):
        # Misleading labels
        self.assertIn("pants-fire", MISLEADING_LABELS)
        self.assertIn("false", MISLEADING_LABELS)
        self.assertIn("barely-true", MISLEADING_LABELS)

        # Truthful labels
        self.assertIn("half-true", TRUTHFUL_LABELS)
        self.assertIn("mostly-true", TRUTHFUL_LABELS)
        self.assertIn("true", TRUTHFUL_LABELS)

    def test_compute_harm_topic_weight(self):
        # Critical harm topics (1.5x)
        self.assertEqual(compute_harm_topic_weight("public health, vaccines"), 1.5)
        self.assertEqual(compute_harm_topic_weight("elections, voting"), 1.5)
        self.assertEqual(compute_harm_topic_weight("national economy, jobs"), 1.5)

        # Sensitive topics (1.2x)
        self.assertEqual(compute_harm_topic_weight("foreign policy, military"), 1.2)
        self.assertEqual(compute_harm_topic_weight("climate, taxes"), 1.2)

        # Default topics (1.0x)
        self.assertEqual(compute_harm_topic_weight("celebrity gossip, entertainment"), 1.0)
        self.assertEqual(compute_harm_topic_weight(""), 1.0)

    def test_infer_venue_tier(self):
        self.assertEqual(infer_venue_tier("a viral tweet on twitter"), "social_media")
        self.assertEqual(infer_venue_tier("a speech on national television broadcast"), "broadcast_speech")
        self.assertEqual(infer_venue_tier("a direct campaign flier mailer"), "mailer_print")
        self.assertEqual(infer_venue_tier("in a private book chapter"), "other")

    def test_generate_synthetic_reach(self):
        contexts = pd.Series(["social_media", "broadcast_speech", "mailer_print", "other"])
        reach = generate_synthetic_reach(contexts, seed=42)
        
        self.assertEqual(len(reach), 4)
        self.assertTrue((reach >= 10).all())
        self.assertIsInstance(reach.iloc[0], (int, np.integer))

    def test_generate_synthetic_timestamps(self):
        n_samples = 100
        timestamps, days = generate_synthetic_timestamps(n_samples, seed=42)
        
        self.assertEqual(len(days), n_samples)
        self.assertEqual(len(timestamps), n_samples)
        self.assertTrue((days >= 1).all())
        self.assertTrue((days <= 30).all())


if __name__ == "__main__":
    unittest.main()
