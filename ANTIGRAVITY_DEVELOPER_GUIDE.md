# 🛡️ Antigravity IDE Master Development Guide

> **Project:** Evidence-Grounded Misinformation Triage System (ML-09)  
> **Workspace Path:** `c:/Users/Sarathi/misinfo-triage/`  
> **Target Frameworks:** Python 3.10+, FastAPI, React 18 (Vite), Streamlit, LightGBM, TreeSHAP, Docker  

---

## 📌 1. Project Architecture & File Navigation Map

When developing or modifying features inside **Antigravity IDE**, use this file mapping to quickly locate the exact file to edit:

```mermaid
graph TD
    subgraph Frontend_Web ["⚛️ Frontend (React 18 + Vite) - Port 5173"]
        F_App["`frontend/src/App.jsx` - Main Container & Tab Router"]
        F_Header["`frontend/src/components/Header.jsx` - Persona & Capacity"]
        F_Overview["`frontend/src/components/TabOverview.jsx` - KPIs & Quadrant"]
        F_Queue["`frontend/src/components/TabQueue.jsx` - Interactive Queue Table"]
        F_Investigate["`frontend/src/components/TabInvestigation.jsx` - SHAP & Action Desk"]
        F_Trends["`frontend/src/components/TabSourceTrends.jsx` - 30-Day EWMA Trends"]
        F_Audit["`frontend/src/components/TabAudit.jsx` - Calibration & DSA Export"]
        F_API["`frontend/src/services/api.js` - REST API Client"]
    end

    subgraph Backend_Web ["🚀 Backend (FastAPI) - Port 8000"]
        B_Main["`backend/app/main.py` - FastAPI App, CORS, Health Probes"]
        B_Config["`backend/app/config.py` - Settings & Threshold Defaults"]
        B_Claims["`backend/app/routers/claims.py` - Single Claim Triage"]
        B_Queue["`backend/app/routers/queue.py` - Capacity Queue Slicing & Actions"]
        B_Sources["`backend/app/routers/sources.py` - Source EWMA & Alerts"]
        B_Audit["`backend/app/routers/audit.py` - Calibration & Fairness Metrics"]
        B_Service["`backend/app/services/triage_service.py` - Bridge to Core ML"]
    end

    subgraph Core_ML ["🤖 Core AI/ML Engine (`src/`)"]
        ML_Data["`src/data.py` - Ingestion, Synthetic Reach & Timeline"]
        ML_Feat["`src/features.py` - 14-D Multi-Signal Feature Pipeline"]
        ML_NLI["`src/consistency.py` - Dense Vector Search & NLI Contradiction"]
        ML_Model["`src/model.py` - LightGBM & Isotonic Calibration"]
        ML_Explain["`src/explain.py` - TreeSHAP Attributions & Rationales"]
        ML_Queue["`src/queue.py` - Multi-Factor Priority Formula"]
        ML_Actions["`src/actions.py` - Action Policies & JSONL Audit Logger"]
        ML_Trends["`src/trends.py` - Rolling 7-Day EWMA & Spike Alerts"]
    end

    subgraph Standalone ["🖥️ Standalone Console - Port 8501"]
        Streamlit["`app.py` - 5-Tab Streamlit Production Dashboard"]
    end

    Frontend_Web <--> Backend_Web
    Backend_Web <--> Core_ML
    Standalone <--> Core_ML
```

---

## ⚡ 2. Development Execution Commands

### Workflow A: Run Full-Stack Web Application (React + FastAPI)
Open two terminal instances in Antigravity IDE:

```powershell
# Terminal 1: Start the FastAPI Backend (Port 8000)
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
*Swagger API Documentation:* `http://localhost:8000/docs`

```powershell
# Terminal 2: Start the React Frontend (Port 5173)
cd frontend
npm install
npm run dev
```
*Live React Web Application:* `http://localhost:5173`

---

### Workflow B: Run Standalone Streamlit Dashboard (Port 8501)
```powershell
streamlit run app.py
```
*Live Streamlit Console:* `http://localhost:8501`

---

### Workflow C: Run Automated Test Suite
```powershell
# Run all 16 unit and integration tests
python -m unittest discover -s tests -p "test_*.py" -v
```

---

### Workflow D: Run with Docker Compose
```powershell
docker-compose up --build -d
```

---

## 🛠️ 3. Step-by-Step Code Modification Recipes

### Recipe 1: Adding a New Linguistic / Stylometric Signal
1. Open [`src/features.py`](file:///c:/Users/Sarathi/misinfo-triage/src/features.py).
2. Add your extraction logic inside `extract_linguistic_features(statements: pd.Series)`:
   ```python
   # Example: Count of high-certainty absolute words
   feats["ling_superlative_cnt"] = cleaned.apply(
       lambda s: len(re.findall(r"\b(best|worst|greatest|unprecedented)\b", s, re.IGNORECASE))
   )
   ```
3. Register the new feature column inside `FEATURE_GROUPS["linguistic"]` in `src/features.py`.
4. Validate by running: `python -m unittest tests/test_features.py`.

---

### Recipe 2: Modifying Priority Scoring & Anti-Starvation Dynamics
1. Open [`src/queue.py`](file:///c:/Users/Sarathi/misinfo-triage/src/queue.py).
2. Modify the priority formula in `compute_priority()`:
   $$\text{Priority} = p(\text{misleading}) \times \text{Reach Score} \times W_{\text{harm}} \times B_{\text{age}}$$
3. Adjust the aging boost multiplier:
   ```python
   # Example: Increase aging acceleration for backlogged items
   age_boost = min(1.75, 1.0 + 0.15 * days_waiting)
   ```
4. Validate by running: `python -m unittest tests/test_queue.py`.

---

### Recipe 3: Expanding the Verified Knowledge Base & NLI Grounding
1. Open [`src/consistency.py`](file:///c:/Users/Sarathi/misinfo-triage/src/consistency.py) or [`data/evidence_kb.json`](file:///c:/Users/Sarathi/misinfo-triage/data/evidence_kb.json).
2. Add authoritative consensus statements from CDC, WHO, or BLS.
3. Recompute dense embeddings using `compute_evidence_embeddings()` to update `data/processed/evidence_embeddings.npy`.

---

### Recipe 4: Adding New REST Endpoints in FastAPI
1. Open or create a router in [`backend/app/routers/`](file:///c:/Users/Sarathi/misinfo-triage/backend/app/routers/).
2. Define the endpoint using standard FastAPI decorators:
   ```python
   @router.get("/my-endpoint")
   def get_custom_data():
       return {"status": "success", "data": ...}
   ```
3. Register the router in [`backend/app/main.py`](file:///c:/Users/Sarathi/misinfo-triage/backend/app/main.py).

---

### Recipe 5: Customizing the React Frontend
1. UI Components are located in [`frontend/src/components/`](file:///c:/Users/Sarathi/misinfo-triage/frontend/src/components/).
2. To modify the Investigation Workbench (SHAP bars, action buttons, evidence cards), edit [`TabInvestigation.jsx`](file:///c:/Users/Sarathi/misinfo-triage/frontend/src/components/TabInvestigation.jsx).
3. To modify the Queue Table (columns, filters, badges), edit [`TabQueue.jsx`](file:///c:/Users/Sarathi/misinfo-triage/frontend/src/components/TabQueue.jsx).
4. API calls are managed in [`frontend/src/services/api.js`](file:///c:/Users/Sarathi/misinfo-triage/frontend/src/services/api.js).

---

## 💡 4. Recommended Antigravity IDE Slash Commands

When pair-programming with Antigravity AI in the IDE, leverage these built-in slash commands:

| Command | Recommended Usage Scenario in this Project |
| :--- | :--- |
| **/plan** | Use before executing multi-file refactors (e.g. modifying model schemas or altering the database layout). |
| **/goal** | Use for long-running autonomous workflows (e.g. running full dataset retraining or building large embedding indexes). |
| **/boost** | Use for deep mathematical optimization, probability calibration audits, or complex algorithmic tuning. |
| **/browser** | Use to preview web UI pages, test REST endpoints, or search external fact-checking feeds. |

---

## 🔍 5. Troubleshooting Matrix

| Symptom | Probable Cause | Recommended Fix |
| :--- | :--- | :--- |
| `ImportError: cannot import name ...` | Outdated cached `.pyc` or signature mismatch. | Check `src/__init__.py` and verify function signatures match `tests/`. |
| React UI displays "API unavailable, using fallback data" | FastAPI backend is not running on port 8000. | Run `uvicorn backend.app.main:app --port 8000 --reload` in Terminal 1. |
| Streamlit caching does not refresh after code edit. | Streamlit in-memory cache active. | Press `C` in the browser to clear cache, or restart the Streamlit server. |
| `Port 8000` or `5173` already in use. | Previous background process running. | In PowerShell run: `Get-Process python, node \| Stop-Process` or specify `--port 8001`. |
