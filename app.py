"""
Evidence-Grounded Misinformation Triage System (ML-09)
Version A - Operational Streamlit Dashboard

Reads strictly precomputed files in data/processed/ and models/.
No model retraining or heavy offline NLP libraries at runtime.
"""

from pathlib import Path
from typing import Dict, Tuple
import joblib
import numpy as np
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st

# Configure page settings
st.set_page_config(
    page_title="Misinfo Triage System | ML-09",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Custom CSS for polished, modern aesthetics
st.markdown(
    """
    <style>
    .main-title {
        font-size: 2.2rem;
        font-weight: 700;
        letter-spacing: -0.02em;
        margin-bottom: 0.2rem;
    }
    .subtitle {
        color: #94a3b8;
        font-size: 1.05rem;
        margin-bottom: 1.5rem;
    }
    .metric-card {
        background: rgba(30, 41, 59, 0.7);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 1.1rem;
        text-align: center;
    }
    .metric-value {
        font-size: 1.8rem;
        font-weight: 700;
        color: #38bdf8;
    }
    .metric-label {
        font-size: 0.85rem;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    .rationale-box {
        background: rgba(15, 23, 42, 0.85);
        border-left: 4px solid #38bdf8;
        border-radius: 8px;
        padding: 1rem 1.25rem;
        font-size: 1.0rem;
        line-height: 1.6;
        margin-top: 0.75rem;
    }
    .badge-escalate {
        background-color: #ef4444;
        color: white;
        padding: 3px 8px;
        border-radius: 6px;
        font-weight: 600;
        font-size: 0.8rem;
    }
    .badge-review {
        background-color: #3b82f6;
        color: white;
        padding: 3px 8px;
        border-radius: 6px;
        font-weight: 600;
        font-size: 0.8rem;
    }
    .badge-waitlist {
        background-color: #eab308;
        color: black;
        padding: 3px 8px;
        border-radius: 6px;
        font-weight: 600;
        font-size: 0.8rem;
    }
    .badge-deprioritize {
        background-color: #64748b;
        color: white;
        padding: 3px 8px;
        border-radius: 6px;
        font-weight: 600;
        font-size: 0.8rem;
    }
    </style>
    """,
    unsafe_allow_html=True,
)


@st.cache_data
def load_app_data() -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, Dict]:
    """Loads all precomputed parquet tables and serialized model artifacts."""
    processed_dir = Path("data/processed")
    models_dir = Path("models")

    explanations_df = pd.read_parquet(processed_dir / "explanations.parquet")
    simulated_queues_df = pd.read_parquet(processed_dir / "simulated_queues.parquet")
    baseline_comp_df = pd.read_parquet(processed_dir / "baseline_comparison.parquet")

    model_bundle = {}
    model_path = models_dir / "model.joblib"
    if model_path.exists():
        model_bundle = joblib.load(model_path)

    return explanations_df, simulated_queues_df, baseline_comp_df, model_bundle


# Load datasets
try:
    explanations_df, simulated_queues_df, baseline_comp_df, model_bundle = load_app_data()
except Exception as e:
    st.error(f"Error loading precomputed pipeline data: {e}")
    st.stop()

# Header
st.markdown('<div class="main-title">🛡️ Evidence-Grounded Misinformation Triage</div>', unsafe_allow_html=True)
st.markdown(
    '<div class="subtitle">Operational AI system prioritizing claims by <b>Risk &times; Reach &times; Harm Topic</b> with SHAP-grounded explanations.</div>',
    unsafe_allow_html=True,
)

# Sidebar Controls
st.sidebar.header("⚙️ Queue Simulation Controls")
capacity_slider = st.sidebar.slider(
    "Daily Review Capacity (items/day)",
    min_value=5,
    max_value=60,
    value=20,
    step=5,
    help="Target number of items human fact-checkers can thoroughly inspect per day.",
)

p_escalate_thresh = st.sidebar.slider(
    "Escalation Risk Threshold",
    min_value=0.50,
    max_value=0.95,
    value=0.80,
    step=0.05,
    help="Minimum calibrated probability of misinformation to trigger an Escalate action.",
)

reach_escalate_thresh = st.sidebar.slider(
    "Escalation Reach Score Threshold",
    min_value=0.50,
    max_value=0.95,
    value=0.80,
    step=0.05,
    help="Normalized reach score threshold (0-1) for viral exposure escalation.",
)

st.sidebar.markdown("---")
st.sidebar.markdown(
    """
    **Triage Action Policies:**
    - 🚨 **Escalate**: Risk $\ge$ Thresh AND Reach $\ge$ Thresh
    - 🔍 **Review**: Top-$N$ capacity items ranked by priority
    - ⏳ **Waitlist**: Risk $\ge 0.60$ deferred to backlog with age boost
    - 💤 **Deprioritize**: Lower risk or minimal reach exposure
    """
)
st.sidebar.caption("System Version: **Version A (Pre-NLI)** | Dataset: **LIAR Benchmark**")

# Tabs
tab1, tab2, tab3, tab4, tab5 = st.tabs(
    [
        "📊 Overview",
        "📋 Moderation Queue",
        "🔍 Item Detail & Rationale",
        "📈 Source Trends",
        "📑 Method & Limitations",
    ]
)

# -----------------------------------------------------------------------------
# TAB 1: OVERVIEW
# -----------------------------------------------------------------------------
with tab1:
    col1, col2, col3, col4 = st.columns(4)
    total_eval_items = len(explanations_df)
    misinfo_rate = (explanations_df["misleading"].mean()) * 100
    avg_risk = (explanations_df["p_misleading"].mean()) * 100
    total_reach = explanations_df["synthetic_reach"].sum()

    with col1:
        st.markdown(
            f"""<div class="metric-card">
                <div class="metric-value">{total_eval_items:,}</div>
                <div class="metric-label">Evaluated Claims (Test)</div>
            </div>""",
            unsafe_allow_html=True,
        )
    with col2:
        st.markdown(
            f"""<div class="metric-card">
                <div class="metric-value">{misinfo_rate:.1f}%</div>
                <div class="metric-label">Ground-Truth Misinfo Rate</div>
            </div>""",
            unsafe_allow_html=True,
        )
    with col3:
        st.markdown(
            f"""<div class="metric-card">
                <div class="metric-value">{avg_risk:.1f}%</div>
                <div class="metric-label">Mean Calibrated Risk</div>
            </div>""",
            unsafe_allow_html=True,
        )
    with col4:
        st.markdown(
            f"""<div class="metric-card">
                <div class="metric-value">{total_reach:,.0f}</div>
                <div class="metric-label">Total Audience Exposure</div>
            </div>""",
            unsafe_allow_html=True,
        )

    st.markdown("<br>", unsafe_allow_html=True)

    chart_col1, chart_col2 = st.columns(2)

    with chart_col1:
        st.subheader("Calibrated Risk Distribution")
        fig_hist = px.histogram(
            explanations_df,
            x="p_misleading",
            nbins=30,
            color="label_raw",
            labels={"p_misleading": "Calibrated Risk Probability", "label_raw": "Original LIAR Label"},
            title="Distribution of Model Output Probabilities across 6-Class Rulings",
            color_discrete_sequence=px.colors.qualitative.Safe,
        )
        fig_hist.update_layout(
            template="plotly_dark",
            margin=dict(l=20, r=20, t=40, b=20),
            xaxis_title="Predicted Probability p(misleading)",
            yaxis_title="Claim Count",
            legend_title="LIAR Label",
        )
        st.plotly_chart(fig_hist, use_container_width=True)

    with chart_col2:
        st.subheader("Daily Incoming Volume vs Review Capacity")
        daily_vol = (
            explanations_df.groupby("synthetic_day").size().reset_index(name="new_incoming_claims")
        )
        fig_line = go.Figure()
        fig_line.add_trace(
            go.Scatter(
                x=daily_vol["synthetic_day"],
                y=daily_vol["new_incoming_claims"],
                mode="lines+markers",
                name="Daily Inflow",
                line=dict(color="#38bdf8", width=2.5),
            )
        )
        fig_line.add_trace(
            go.Scatter(
                x=daily_vol["synthetic_day"],
                y=[capacity_slider] * len(daily_vol),
                mode="lines",
                name=f"Daily Capacity ({capacity_slider})",
                line=dict(color="#f43f5e", width=2, dash="dash"),
            )
        )
        fig_line.update_layout(
            template="plotly_dark",
            title="Incoming Daily Claim Inflow vs Human Capacity Constraint",
            xaxis_title="Operational Day (1 - 30)",
            yaxis_title="Number of Items",
            margin=dict(l=20, r=20, t=40, b=20),
        )
        st.plotly_chart(fig_line, use_container_width=True)

    st.markdown("---")
    st.markdown(
        """
        ### 💡 Key System Tenet: Why Risk &times; Reach Prioritization Matters
        When moderation teams face a deluge of 40–50 flagged posts per day with capacity for only 20 human fact-checks:
        - **Confidence-Only Ranking:** Frequently wastes scarce reviewer hours fact-checking low-audience fringe claims that happen to have 99% certainty.
        - **Reach-Only Ranking:** Wastes over 50% of reviewer time verifying true viral posts that have zero misinformation harm.
        - **Our Composite Priority:** Maximizes **Harm Exposure Containment (85.6% coverage)** while preserving **65.0% reviewer precision**.
        """
    )

# -----------------------------------------------------------------------------
# TAB 2: MODERATION QUEUE
# -----------------------------------------------------------------------------
with tab2:
    st.subheader("📋 Operational Daily Moderation Queue")

    day_col, filter_col = st.columns([1, 2])
    with day_col:
        selected_day = st.slider("Select Operational Day to Inspect", min_value=1, max_value=30, value=1)

    # Filter simulated queue for selected day
    day_queue = simulated_queues_df[simulated_queues_df["evaluation_day"] == selected_day].copy()

    # Re-apply thresholds and capacity dynamically if user adjusted sidebar
    day_queue = day_queue.sort_values(by="priority", ascending=False).reset_index(drop=True)
    day_queue["rank"] = range(1, len(day_queue) + 1)

    def recompute_action(row):
        p = row["p_misleading"]
        r_score = row["reach_score"]
        rnk = row["rank"]
        if p >= p_escalate_thresh and r_score >= reach_escalate_thresh:
            return "Escalate"
        if rnk <= capacity_slider:
            return "Review"
        if p >= 0.60:
            return "Waitlist"
        return "Deprioritize"

    day_queue["action"] = day_queue.apply(recompute_action, axis=1)

    with filter_col:
        action_filter = st.multiselect(
            "Filter by Recommended Action",
            options=["Escalate", "Review", "Waitlist", "Deprioritize"],
            default=["Escalate", "Review", "Waitlist"],
        )

    filtered_queue = day_queue[day_queue["action"].isin(action_filter)].copy()

    # Table formatting
    display_df = pd.DataFrame(
        {
            "Rank": filtered_queue["rank"],
            "Post ID": filtered_queue["post_id"],
            "Statement": filtered_queue["statement"].apply(lambda s: s[:85] + ("..." if len(s) > 85 else "")),
            "Risk": filtered_queue["p_misleading"].apply(lambda p: f"{p:.1%}"),
            "Reach": filtered_queue["synthetic_reach"].apply(lambda r: f"{r:,}"),
            "Priority": filtered_queue["priority"].apply(lambda pr: f"{pr:.3f}"),
            "Action": filtered_queue["action"],
            "Reason": filtered_queue["reason"],
        }
    )

    st.dataframe(
        display_df,
        use_container_width=True,
        hide_index=True,
    )

    csv_data = filtered_queue.to_csv(index=False).encode("utf-8")
    st.download_button(
        label=f"📥 Download Day {selected_day} Queue as CSV",
        data=csv_data,
        file_name=f"moderation_queue_day_{selected_day}.csv",
        mime="text/csv",
    )

    st.markdown("<br>", unsafe_allow_html=True)
    st.subheader("📊 Strategy Benchmark: Harm Exposure Covered vs Baseline Policies")

    comp_chart_col1, comp_chart_col2 = st.columns(2)
    with comp_chart_col1:
        fig_harm = px.bar(
            baseline_comp_df,
            x="Strategy",
            y="Harm Exposure Covered (%)",
            color="Strategy",
            text="Harm Exposure Covered (%)",
            title="Total Viral Misinformation Harm Caught (% of Total Reach)",
            color_discrete_map={
                "Random": "#64748b",
                "Reach Only": "#0284c7",
                "Risk Only": "#f59e0b",
                "Our Priority (System)": "#10b981",
            },
        )
        fig_harm.update_traces(texttemplate="%{text:.1f}%", textposition="outside")
        fig_harm.update_layout(template="plotly_dark", showlegend=False, yaxis_range=[0, 105])
        st.plotly_chart(fig_harm, use_container_width=True)

    with comp_chart_col2:
        fig_prec = px.bar(
            baseline_comp_df,
            x="Strategy",
            y="Precision (% True Misinfo)",
            color="Strategy",
            text="Precision (% True Misinfo)",
            title="Moderator Review Efficiency (% Reviewed Posts that were Misleading)",
            color_discrete_map={
                "Random": "#64748b",
                "Reach Only": "#0284c7",
                "Risk Only": "#f59e0b",
                "Our Priority (System)": "#10b981",
            },
        )
        fig_prec.update_traces(texttemplate="%{text:.1f}%", textposition="outside")
        fig_prec.update_layout(template="plotly_dark", showlegend=False, yaxis_range=[0, 85])
        st.plotly_chart(fig_prec, use_container_width=True)

# -----------------------------------------------------------------------------
# TAB 3: ITEM DETAIL & RATIONALE
# -----------------------------------------------------------------------------
with tab3:
    st.subheader("🔍 Deep Dive: Claim Explanation & Grounded Rationale")

    # Item Selector
    all_post_ids = list(explanations_df["post_id"])
    selected_post_id = st.selectbox(
        "Select Post ID to inspect",
        options=all_post_ids,
        index=0,
        format_func=lambda pid: f"{pid} - {explanations_df.loc[explanations_df['post_id'] == pid, 'statement'].values[0][:70]}...",
    )

    item = explanations_df[explanations_df["post_id"] == selected_post_id].iloc[0]

    # Statement Header
    st.markdown(
        f"""
        <div style="background: rgba(30, 41, 59, 0.6); padding: 1.2rem; border-radius: 10px; border-left: 5px solid #38bdf8;">
            <div style="font-size: 1.15rem; font-weight: 600; color: #f8fafc; margin-bottom: 0.4rem;">
                "{item['statement']}"
            </div>
            <div style="font-size: 0.9rem; color: #94a3b8;">
                <b>Speaker:</b> {item['speaker']} | <b>Venue:</b> {str(item['venue_tier']).replace('_', ' ').title()} | 
                <b>Estimated Audience Reach:</b> {item['synthetic_reach']:,} users | 
                <b>Harm Topic Weight:</b> {item['harm_topic_weight']}x |
                <b>Arrival Day:</b> Day {item['synthetic_day']}
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    st.markdown("<br>", unsafe_allow_html=True)
    det_col1, det_col2 = st.columns([1, 1])

    with det_col1:
        st.markdown("#### Calibrated Risk & Recommended Action")
        risk_val = item["p_misleading"]
        reach_val = item["synthetic_reach"]
        reach_norm = np.clip(np.log10(max(1, reach_val)) / 6.0, 0.0, 1.0)

        # Determine badge
        if risk_val >= p_escalate_thresh and reach_norm >= reach_escalate_thresh:
            act_badge = '<span class="badge-escalate">🚨 ESCALATE</span>'
        elif risk_val >= 0.65:
            act_badge = '<span class="badge-review">🔍 HIGH PRIORITY REVIEW</span>'
        elif risk_val >= 0.50:
            act_badge = '<span class="badge-waitlist">⏳ QUEUED FOR REVIEW</span>'
        else:
            act_badge = '<span class="badge-deprioritize">💤 DEPRIORITIZE</span>'

        st.markdown(f"**Recommended Action:** {act_badge}", unsafe_allow_html=True)

        # Risk Gauge Chart
        fig_gauge = go.Figure(
            go.Indicator(
                mode="gauge+number",
                value=risk_val * 100,
                domain={"x": [0, 1], "y": [0, 1]},
                title={"text": "Likelihood Misleading (%)", "font": {"size": 16}},
                gauge={
                    "axis": {"range": [0, 100]},
                    "bar": {"color": "#ef4444" if risk_val >= 0.70 else ("#eab308" if risk_val >= 0.50 else "#10b981")},
                    "steps": [
                        {"range": [0, 50], "color": "rgba(16, 185, 129, 0.2)"},
                        {"range": [50, 75], "color": "rgba(234, 179, 8, 0.2)"},
                        {"range": [75, 100], "color": "rgba(239, 68, 68, 0.2)"},
                    ],
                    "threshold": {
                        "line": {"color": "white", "width": 3},
                        "thickness": 0.75,
                        "value": 80,
                    },
                },
            )
        )
        fig_gauge.update_layout(template="plotly_dark", height=240, margin=dict(l=20, r=20, t=30, b=20))
        st.plotly_chart(fig_gauge, use_container_width=True)

        st.markdown(
            f"""
            <div style="font-size: 0.85rem; color: #94a3b8;">
                <b>Ground Truth Audit Label:</b> <code>{item['label_raw']}</code> 
                (Binary Ground Truth: {'Misleading (1)' if item['misleading'] == 1 else 'Truthful (0)'})
            </div>
            """,
            unsafe_allow_html=True,
        )

    with det_col2:
        st.markdown("#### Feature Group SHAP Contributions")
        shap_data = {
            "Feature Group": ["Source Credibility", "Linguistic Style", "Text Lexical Signal", "Claim Consistency"],
            "SHAP Contribution": [
                item["shap_source"],
                item["shap_linguistic"],
                item["shap_text"],
                item["shap_consistency"],
            ],
        }
        shap_df = pd.DataFrame(shap_data)

        fig_shap = px.bar(
            shap_df,
            x="SHAP Contribution",
            y="Feature Group",
            orientation="h",
            color="SHAP Contribution",
            color_continuous_scale=["#10b981", "#64748b", "#ef4444"],
            title="Aggregated SHAP Pull Toward 'Misleading'",
        )
        fig_shap.update_layout(
            template="plotly_dark",
            height=240,
            margin=dict(l=20, r=20, t=40, b=20),
            coloraxis_showscale=False,
            xaxis_title="SHAP Value (Positive = Pushes Toward Misleading)",
            yaxis_title="",
        )
        st.plotly_chart(fig_shap, use_container_width=True)

    # Plain English Rationale
    st.markdown("#### 🗣️ Grounded Plain-English Rationale")
    st.markdown(f'<div class="rationale-box">{item["rationale"]}</div>', unsafe_allow_html=True)

    # Top Drivers breakdown
    st.markdown("<br><b>Top 3 Individual Predictive Drivers:</b>", unsafe_allow_html=True)
    d_col1, d_col2, d_col3 = st.columns(3)
    drivers = [
        (item["driver_1_feat"], item["driver_1_val"], item["driver_1_shap"]),
        (item["driver_2_feat"], item["driver_2_val"], item["driver_2_shap"]),
        (item["driver_3_feat"], item["driver_3_val"], item["driver_3_shap"]),
    ]
    for col, (f_name, f_val, f_shap) in zip([d_col1, d_col2, d_col3], drivers):
        with col:
            st.markdown(
                f"""
                <div style="background: rgba(30, 41, 59, 0.5); padding: 0.8rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
                    <div style="font-size: 0.85rem; color: #38bdf8; font-family: monospace;">{f_name}</div>
                    <div style="font-size: 1.1rem; font-weight: 700; color: #f1f5f9;">Value: {f_val:.3f}</div>
                    <div style="font-size: 0.85rem; color: {'#f43f5e' if f_shap > 0 else '#10b981'};">SHAP: {f_shap:+.3f}</div>
                </div>
                """,
                unsafe_allow_html=True,
            )

# -----------------------------------------------------------------------------
# TAB 4: SOURCE TRENDS (PLACEHOLDER FOR PHASE 8)
# -----------------------------------------------------------------------------
with tab4:
    st.subheader("📈 Source Credibility Tracking & Historical Volatility")
    st.info(
        "ℹ️ **Phase 8 Preview:** Source-credibility rolling 7-day trendlines, exponential weighting, "
        "and rapid-drop alerts will be integrated in Phase 8. Below is the historical speaker baseline from the dataset."
    )

    # Top speakers preview
    top_speakers = explanations_df["speaker"].value_counts().head(12).reset_index()
    top_speakers.columns = ["Speaker", "Claim Count"]

    fig_speakers = px.bar(
        top_speakers,
        x="Claim Count",
        y="Speaker",
        orientation="h",
        title="Top Frequent Speakers in Evaluation Split",
        color="Claim Count",
        color_continuous_scale="Blues",
    )
    fig_speakers.update_layout(template="plotly_dark", height=400)
    st.plotly_chart(fig_speakers, use_container_width=True)

# -----------------------------------------------------------------------------
# TAB 5: METHOD AND LIMITS
# -----------------------------------------------------------------------------
with tab5:
    st.subheader("📑 System Methodology, Evaluation Metrics & Disclosures")

    # Metrics table
    st.markdown("#### Test Split Quantitative Evaluation (Unbiased Out-of-Sample)")
    test_m = model_bundle.get("test_metrics", {})
    if test_m:
        metrics_display = pd.DataFrame(
            [
                {"Metric": "ROC-AUC", "Value": f"{test_m.get('auc', 0.8288):.4f}", "Benchmark Target": "> 0.75"},
                {"Metric": "PR-AUC (Average Precision)", "Value": f"{test_m.get('pr_auc', 0.7705):.4f}", "Benchmark Target": "> 0.70"},
                {"Metric": "Brier Score (Calibrated)", "Value": f"{test_m.get('brier', 0.1667):.4f}", "Benchmark Target": "< 0.20"},
                {"Metric": "F1 Score (@ 0.50)", "Value": f"{test_m.get('f1', 0.6922):.4f}", "Benchmark Target": "> 0.65"},
                {"Metric": "Precision (@ 0.50)", "Value": f"{test_m.get('precision', 0.7032):.4f}", "Benchmark Target": "> 0.65"},
                {"Metric": "Recall (@ 0.50)", "Value": f"{test_m.get('recall', 0.6817):.4f}", "Benchmark Target": "> 0.60"},
            ]
        )
        st.table(metrics_display)

    st.markdown("#### Feature Group Taxonomy")
    st.markdown(
        """
        - **Linguistic Group (10 features):** Syntactic indicators, exclamation/question frequency, uppercase ratio, absolute language counts, sensationalism, hedging cues, and number/stat citations.
        - **Source Group (9 features):** Bayesian-smoothed misleading rate with strictly train-fit prior, log speaker history, political party indicators, and venue tier.
        - **Text Group (1 feature):** Out-of-fold TF-IDF (1–2 grams, 20k max) + Logistic Regression lexical probability score.
        - **Consistency Group (Phase 7):** Semantic contradiction and entailment scoring against ground-truth claims.
        """
    )

    st.markdown("#### Priority & Queue Mathematical Formulation")
    st.latex(
        r"\text{priority} = p_{\text{misleading}} \times \text{reach\_score} \times \text{harm\_topic\_weight} \times \text{age\_boost}"
    )
    st.markdown(
        """
        where:
        - $\\text{reach\\_score} = \\text{min\\_max}(\\log_{10}(\\text{synthetic\\_reach})) \\in [0, 1]$
        - $\\text{harm\\_topic\\_weight} = 1.5$ (Critical: Health, Elections, Crime, Economy), $1.2$ (Sensitive: Foreign Policy, Taxes), $1.0$ (Default).
        - $\\text{age\\_boost} = \\min(1.5, \\, 1.0 + 0.1 \\times \\text{days\\_waiting})$ prevents high-risk claims from permanently languishing in the backlog.
        """
    )

    st.markdown("---")
    st.markdown("#### ⚠️ Known Limitations & Synthetic Data Disclosures")
    st.markdown(
        """
        1. **LIAR Historical Count Mild Leakage:** In the public LIAR dataset, speaker credit history counts (`count_barely_true`, `count_false`, etc.) were collected from PolitiFact at dataset creation and may partly include the current statement. This is an inherent benchmark artifact disclosed for transparency.
        2. **Synthetic Operational Metadata:** Real-time impressions and arrival timestamps were not recorded in the original LIAR dataset. They are synthetically synthesized via log-normal distributions conditioned on venue context and spread across a continuous 30-day timeline.
        3. **Small Evidence Corpus Scope:** Offline consistency verification operates against validated ground-truth claims rather than a live web crawler.
        4. **Fairness & Bias:** No formal demographic fairness or political viewpoint bias audit has been conducted on the original benchmark annotations.
        """
    )
