# 🛠️ Antigravity IDE Development & Modification Guide

> **Project:** Evidence-Grounded Misinformation Triage System (ML-09)  
> **Target Environment:** Antigravity IDE / Python 3.10+ / Docker  
> **Repository Root:** `c:/Users/Sarathi/misinfo-triage/`

---

## 📌 1. Project Sitemap & Architecture Quick Reference

When developing or modifying features inside the **Antigravity IDE**, use this file mapping to quickly locate and edit the relevant subsystem:

```mermaid
graph TD
    App["Console UI (`app.py`)"]
    
    subgraph Core_Engine ["Domain Logic (`src/`)"]
        D["`src/data.py` - Ingestion, Synthetic Reach & Timeline"]
        F["`src/features.py` - 14-D Multi-Signal Feature Extraction"]
        C["`src/consistency.py` - Dense Vector Search & NLI Contradiction"]
        M["`src/model.py` - LightGBM GBDT & Isotonic Calibration"]
        E["`src/explain.py` - TreeSHAP Attributions & Plain Rationales"]
        Q["`src/queue.py` - Priority Scoring & Top-20 Capacity Slicing"]
        A["`src/actions.py` - Action Policies & JSONL Audit Logger"]
        T["`src/trends.py` - Rolling 7-Day EWMA & Volatility Alerts"]
    end

    subgraph Tests_And_Config ["Tests & DevOps"]
        TESTS["`tests/` - 16 Unit & Integration Tests"]
        DOCKER["`Dockerfile` & `docker-compose.yml`"]
        CI["`.github/workflows/ci.yml` - CI/CD Workflow"]
    end

    App <--> Core_Engine
    Core_Engine --> Tests_And_Config
```

---

## 🚀 2. Quick-Start Setup in Antigravity IDE

### Option A: Full-Stack Web Application (React + FastAPI)
```powershell
# 1. Start the FastAPI Backend (Port 8000)
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload

# 2. In a second terminal, start the React Frontend (Port 5173)
cd frontend
npm install
npm run dev
```
*Access the React web console at `http://localhost:5173` and interactive FastAPI Swagger docs at `http://localhost:8000/docs`.*

---

### Option B: Standalone Streamlit Console (Port 8501)
```powershell
# Launch the Streamlit dashboard
streamlit run app.py
```
*Access the Streamlit console at `http://localhost:8501`.*

---

## 🔧 3. How to Modify Specific Subsystems

### A. Modifying Machine Learning Features & Signals
- **Target File:** [`src/features.py`](file:///c:/Users/Sarathi/misinfo-triage/src/features.py)
- **To add a new linguistic feature:**
  1. Add your regex pattern or metric calculation to `extract_linguistic_features(statements: pd.Series)`.
  2. Add the column name to `FEATURE_GROUPS["linguistic"]` in `src/features.py`.
  3. Re-run feature extraction or update unit tests in `tests/test_features.py`.

```python
# Example: Adding uppercase word count in src/features.py
feats["ling_allcaps_words"] = cleaned.apply(
    lambda s: sum(1 for w in s.split() if w.isupper() and len(w) > 1)
)
```

---

### B. Modifying Prioritization Formulas & Capacity Rules
- **Target File:** [`src/queue.py`](file:///c:/Users/Sarathi/misinfo-triage/src/queue.py)
- **Core Priority Equation:**
  $$\text{Priority} = p(\text{misleading}) \times \text{Reach Score} \times W_{\text{harm}} \times B_{\text{age}}$$
- **To adjust the anti-starvation aging rate:**
  - Modify `age_boost = min(1.5, 1.0 + 0.10 * days_waiting)` in `src/queue.py`.
- **To customize topic multipliers:**
  - Modify `HARM_WEIGHT_TIERS` and `HARM_TOPIC_KEYWORDS` in [`src/data.py`](file:///c:/Users/Sarathi/misinfo-triage/src/data.py).

---

### C. Modifying Ground-Truth Knowledge Base & NLI Contradiction
- **Target File:** [`src/consistency.py`](file:///c:/Users/Sarathi/misinfo-triage/src/consistency.py)
- **To add new reference facts:**
  1. Add verified statements to `data/evidence_kb.json` or update `curate_knowledge_base()` in `src/consistency.py`.
  2. Recompute embeddings to update `data/processed/evidence_embeddings.npy`.

---

### D. Modifying Model Training & Calibration
- **Target File:** [`src/model.py`](file:///c:/Users/Sarathi/misinfo-triage/src/model.py)
- **To change LightGBM hyperparameters or calibrator:**
  - Modify `train_and_calibrate_lightgbm()` in `src/model.py`.
  - Serializes updated weights automatically to `models/model.joblib`.

---

### E. Modifying UI Tabs & Dashboard Layout
- **Target File:** [`app.py`](file:///c:/Users/Sarathi/misinfo-triage/app.py)
- **Tab Structure in `app.py`:**
  - **Tab 1:** `st.header("📊 Executive Overview & KPIs")` — Summary cards and Risk vs. Reach 2D scatter plot.
  - **Tab 2:** `st.header("📋 Interactive Moderation Queue")` — Filterable table and capacity slicing indicator.
  - **Tab 3:** `st.header("🔍 Claim Investigation & Rationale")` — TreeSHAP waterfall and CDC counter-evidence.
  - **Tab 4:** `st.header("📈 Source Credibility Trends")` — Rolling 7-day EWMA Plotly curves and volatility alert cards.
  - **Tab 5:** `st.header("📑 Method, Limitations & DSA Audit")` — ROC/PR curves, reliability diagram, and fairness table.

---

## 🧪 4. Automated Testing & Verification

Always run the test suite in Antigravity IDE after making modifications:

```powershell
# Run all unit and integration tests
python -m unittest discover -s tests -p "test_*.py" -v

# Run a specific test module
python -m unittest tests/test_queue.py
python -m unittest tests/test_features.py
python -m unittest tests/test_integration.py
```

---

## 🐳 5. Docker & Container Workflows

```powershell
# Build and start container in detached mode
docker-compose up --build -d

# View real-time container logs
docker logs -f misinfo-triage-app

# Stop the container
docker-compose down
```

---

## 💡 6. Recommended Antigravity IDE Slash Commands

When working in the Antigravity IDE, use these specialized slash commands to accelerate development:

- **/plan** — Use before implementing large new architectural features or refactoring modules.
- **/goal** — Use for running multi-step long-running tasks autonomously (e.g. dataset re-indexing or full model retraining).
- **/browser** — Use for web research or testing web application endpoints.
- **/boost** — Use for complex algorithm design, mathematical optimization, or deep debugging sessions.

---

## 📞 7. Troubleshooting & Common Issues

| Issue | Root Cause | Solution |
| :--- | :--- | :--- |
| `ImportError: cannot import name ...` | Package import path or missing export. | Check `__all__` in `src/__init__.py` and verify function signatures match exactly. |
| Streamlit page doesn't update on code edit. | Streamlit caching active. | Press `C` in browser to clear cache, or restart `streamlit run app.py`. |
| Port `8501` already in use. | Previous Streamlit process still running. | Run `Get-Process python | Stop-Process` in PowerShell or specify `--server.port 8502`. |
| Memory pressure during embedding computation. | Large batch embedding in memory. | Ensure `all-MiniLM-L6-v2` is used rather than large multi-gigabyte models. |
