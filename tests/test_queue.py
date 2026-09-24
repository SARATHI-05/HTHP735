"""
Unit tests for priority calculation, reach normalization, and queue capacity simulation.
"""

import unittest
import pandas as pd
import numpy as np
from src.queue import (
    compute_reach_score,
    compute_priority,
    simulate_queue,
)


class TestQueueEngine(unittest.TestCase):
    def test_compute_reach_score(self):
        reach = pd.Series([100, 1000, 10000, 100000])
        scores = compute_reach_score(reach)
        
        self.assertEqual(len(scores), 4)
        self.assertAlmostEqual(scores.min(), 0.0, places=3)
        self.assertAlmostEqual(scores.max(), 1.0, places=3)
        self.assertTrue((scores >= 0.0).all() and (scores <= 1.0).all())

    def test_compute_priority(self):
        p_misleading = pd.Series([0.90, 0.50])
        reach_score = pd.Series([0.80, 0.40])
        harm_weight = pd.Series([1.5, 1.0])
        age_boost = pd.Series([1.0, 1.2])

        # Priority 1: 0.90 * 0.80 * 1.5 * 1.0 = 1.08
        # Priority 2: 0.50 * 0.40 * 1.0 * 1.2 = 0.24
        priorities = compute_priority(p_misleading, reach_score, harm_weight, age_boost)
        
        self.assertAlmostEqual(priorities.iloc[0], 1.08, places=3)
        self.assertAlmostEqual(priorities.iloc[1], 0.24, places=3)
        self.assertGreater(priorities.iloc[0], priorities.iloc[1])

    def test_queue_simulation_capacity_boundary(self):
        # Create a synthetic dataset of 50 items for Day 1
        df = pd.DataFrame({
            "id": [f"claim_{i}" for i in range(50)],
            "statement": [f"Test statement {i}" for i in range(50)],
            "p_misleading": np.random.uniform(0.1, 0.95, 50),
            "synthetic_reach": np.random.randint(500, 500000, 50),
            "harm_topic_weight": np.random.choice([1.0, 1.2, 1.5], 50),
            "synthetic_day": [1] * 50,
            "misleading": np.random.choice([0, 1], 50),
        })
        
        # Simulate Day 1 with capacity K=20
        results = simulate_queue(df, capacity_per_day=20, start_day=1, end_day=1)
        
        reviewed_df = results["reviewed_items"]
        # Exactly 20 items reviewed today
        self.assertEqual(len(reviewed_df), 20)
        
        # Exactly 30 items remaining in backlog
        self.assertEqual(results["final_backlog_count"], 30)


if __name__ == "__main__":
    unittest.main()
