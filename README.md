# Evidence-Grounded Misinformation Triage System (ML-09)

An operational machine learning system designed for content moderation teams under resource constraints. Rather than fact-checking every post or prioritizing solely by model confidence, this system prioritizes claims by **estimated reach $\times$ calibrated risk**, incorporates multi-signal evidence, and generates transparent, template-grounded explanations.

---

## Architecture Overview

```mermaid
flowchart LR
    A[Raw Claims / Ingestion] --> B[Feature Extraction: Linguistic, Source, Text, NLI]
    B --> C[Calibrated Classifier - LightGBM]
    C --> D[SHAP Explanation Engine]
    C --> E[Priority Queue: Risk x Reach x Harm Weight]
    E --> F[Action Engine: Escalate / Review / Waitlist / Deprioritize]
    D --> G[Streamlit Moderation Dashboard]
    F --> G
```

---

## Disclosures & Methodology

- **Dataset:** Benchmarked on the public [LIAR dataset](https://sites.cs.ucsb.edu/~william/data/liar_dataset.zip) (Wang, ACL 2017).
- **Synthetic Data:**
  - `synthetic_reach`: Modeled via log-normal distribution (median ~2,000, heavy tail up to millions) conditioned on context venue tier (Social Media > Broadcast/Speech > Mailer).
  - `synthetic_timestamp`: Modeled uniformly across a 30-day operational evaluation window to simulate daily review queues and backlogs.
- **Leakage Safeguards:** No test-set data is used in any statistic, target encoding, TF-IDF fitting, probability calibration, or evidence retrieval.
- **Explanation Integrity:** Every numerical value and rationale snippet is computed directly from feature contributions and retrieved ground-truth claims; no synthetic hallucinations.

---

## Project Structure

```
misinfo-triage/
├── app.py                     # Streamlit application dashboard
├── requirements.txt           # Pinned dependencies
├── README.md                  # System documentation
├── data/
│   ├── train.tsv, valid.tsv, test.tsv # Raw LIAR files
│   └── processed/             # Cleaned parquets with synthetic columns
├── models/                    # Serialized calibrated models
└── src/
    ├── data.py                # Ingestion and synthetic feature synthesis
    ├── features.py            # Feature engineering (linguistic, source, text)
    ├── model.py               # Model training, validation calibration, test evaluation
    ├── explain.py             # SHAP values & grounded rationales
    ├── queue.py               # Priority calculation & queue simulation
    ├── actions.py             # Action rules (Escalate/Review/Waitlist/Deprioritize)
    ├── consistency.py         # NLI claim consistency & evidence retrieval
    └── trends.py              # Source credibility trend tracking
```
