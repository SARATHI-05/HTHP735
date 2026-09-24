# 🛡️ Antigravity IDE Master Development Guide

> **Project:** Evidence-Grounded Misinformation Triage System (ML-09)  
> **Workspace Path:** `c:/Users/Sarathi/misinfo-triage/`  
> **Target Frameworks:** Python 3.10+, FastAPI, React 18 (Vite), LightGBM, TreeSHAP, Docker  

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

    Frontend_Web <--> Backend_Web
    Backend_Web <--> Core_ML
```

---

## ⚡ 2. Development Execution Commands

### Run Full-Stack Web Application (React + FastAPI)
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

### Run Automated Test Suite
```powershell
# Run all 16 unit and integration tests
python -m unittest discover -s tests -p "test_*.py" -v
```

---

### Run with Docker Compose
```powershell
docker-compose up --build -d
```
