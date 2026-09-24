# 🎬 2-Minute Demo Script: Evidence-Grounded Misinformation Triage (ML-09)

This script is designed for a concise, compelling 2-minute presentation or screen recording showcasing the **Evidence-Grounded Misinformation Triage System**.

---

## ⏱️ Video / Presentation Timeline Summary

| Time | Segment | Core Message / Action in UI |
| :---: | :--- | :--- |
| **0:00 – 0:25** | **The Operational Dilemma** | Why pure accuracy / risk sorting fails fact-checking teams under capacity constraints. |
| **0:25 – 0:50** | **The Core Demonstration** | Concrete Case Study: A ~69% risk, 20k-reach post outranking a 98% risk, 500-reach post. |
| **0:50 – 1:15** | **Explainability & Grounded Evidence** | Tab 3: TreeSHAP decomposition, NLI semantic evidence contradiction, and plain-English rationales. |
| **1:15 – 1:40** | **Source Credibility & Volatility Alerts** | Tab 4: 7-day EWMA trendlines, +23% 5-day spike alerts, and automated surveillance policies. |
| **1:40 – 2:00** | **Business Impact & Baseline Lift** | Tab 1 / Tab 5: +21.2% harm exposure lift over Risk-Only triage; +94.9% lift over Random triage. |

---

## 🎙️ Spoken Script & Screen Actions

### [0:00 – 0:25] Segment 1: The Problem (Tab 1: Overview)
* **[Screen Action]:** Navigate to **Tab 1: 📊 Overview**. Point out the KPI cards (*1,283 claims, 56.4% misinfo rate, 20 items/day review capacity*).
* **[Spoken Script]:**
> *"Digital platforms are flooded with misleading claims, but human fact-checking capacity is strictly limited. Most content moderation systems sort queues solely by model confidence. But what happens when you prioritize purely by risk? You waste precious human labor fact-checking obscure claims with 99% falsehood probability seen by twenty people, while viral misinformation reaching hundreds of thousands slips through into the public consciousness.  
> Our system solves this by prioritizing claims through a calibrated formula: **Calibrated Misleading Risk $\times$ Normalized Reach $\times$ Harm Topic Weight**."*

---

### [0:25 – 0:50] Segment 2: The Proof — Why Reach $\times$ Risk Wins (Tab 2: Moderation Queue)
* **[Screen Action]:** Switch to **Tab 2: 📋 Moderation Queue**. In the filter search or queue table, highlight the side-by-side priority difference between Post `5017.json` and Post `10223.json`.
* **[Spoken Script]:**
> *"Here is the critical proof in our live moderation queue. Look at these two claims:*
> 1. ***Post B (`10223.json`):*** *'The State Department says 42,000 jobs created by the pipeline are ongoing, enduring jobs.' The model is nearly 98% certain this is misleading ($p = 0.980$). But its estimated reach is only **521 impressions**. Naive systems would put this at the very top of the queue.*
> 2. ***Post A (`5017.json`):*** *'The Social Security trust fund is already facing imminent bankruptcy.' The calibrated risk is moderate at **68.7%**, but its viral reach is **20,555 impressions** in a sensitive policy topic ($1.2\times$).*
> 
> *Our system assigns Post A a priority of **0.6192**, pushing it to position #12 for immediate action, while Post B receives a priority of **0.5326** and is waitlisted. By reviewing Post A first, we mitigate forty times more societal harm exposure before the claim goes unchecked."*

---

### [0:50 – 1:15] Segment 3: Explainability & Grounded Evidence (Tab 3: Item Detail)
* **[Screen Action]:** Switch to **Tab 3: 🔍 Item Detail & Rationale**. Select Post `5017.json`. Scroll through the Calibrated Probability Gauge, SHAP bar chart, and Grounded Plain-English Rationale.
* **[Spoken Script]:**
> *"Content moderators don't trust black boxes. In Tab 3, every claim is accompanied by a complete mathematical breakdown.  
> Moderators see the calibrated probability gauge, a SHAP attribution chart decomposing risk across **Source Credibility**, **Linguistic Sensationalism**, **Lexical Text Scores**, and **Semantic Consistency**.  
> Below, our grounded explanation engine translates these exact SHAP values into an auditable plain-English narrative without LLM hallucinations, referencing official historical records and NLI contradiction scores."*

---

### [1:15 – 1:40] Segment 4: Source Credibility Trends & Volatility Alerts (Tab 4: Source Trends)
* **[Screen Action]:** Switch to **Tab 4: 📈 Source Trends**. Toggle on the risk threshold bands (60% and 80%) and show the multi-line Plotly chart with red alert stars. Scroll down to the Alert Feed.
* **[Spoken Script]:**
> *"Misinformation doesn't happen in isolation—it happens in campaigns. In Tab 4, our dynamic tracking engine computes a rolling 7-day exponentially weighted misleading rate for all high-volume sources over a 30-day operational timeline.  
> When a source experiences rapid credibility degradation—like a sharp jump over 20% in 5 days—the system fires a **Rapid Degradation Alert**, automatically elevating incoming claims from that source to heightened surveillance before viral damage spreads."*

---

### [1:40 – 2:00] Segment 5: Quantifiable Business Lift (Tab 5: Method & Baseline Comparison)
* **[Screen Action]:** Switch to **Tab 5: 📑 Method & Limitations**. Highlight the Baseline Comparison Table.
* **[Spoken Script]:**
> *"What is the bottom-line operational impact?  
> When simulated over 30 days at 20 reviews per day, our system achieves **87.8% harm exposure coverage**, capturing over 2.7 million misleading impressions.  
> Compared to conventional Risk-Only triage, our system delivers a **+21.2% net lift in mitigated harm exposure**, and a **+94.9% lift** over random triage, all while maintaining over 65% precision.  
> Thank you!"*

---

## 📊 Summary Reference Card for Presenters

```
========================================================================================
                      TRIAGE COMPARISON SUMMARY (600 REVIEWS / 30 DAYS)
========================================================================================
Strategy                Reviewed  Misleading  Precision  Harm Caught (Reach)  Harm Lift
----------------------------------------------------------------------------------------
Random Triage             600        267        44.5%        1,395,136          Baseline
Risk-Only Triage          600        403        67.2%        2,242,985         +21.2%
Our System (Risk x Reach) 600        391        65.2%        2,718,815         OPTIMAL
========================================================================================
Outranking Case Study:
  Post A (ID: 5017.json)  : Risk = 68.7% | Reach = 20,555 | Priority = 0.6192 -> REVIEW
  Post B (ID: 10223.json) : Risk = 98.0% | Reach =    521 | Priority = 0.5326 -> WAITLIST
========================================================================================
```
