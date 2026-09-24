"""
Feature engineering module (Phase 2).
Extracts linguistic, source credibility, text signal (TF-IDF + OOF logreg), and claim consistency features.
"""

FEATURE_GROUPS = {
    "linguistic": [],
    "source": [],
    "consistency": [],
    "text": ["text_score"],
}
