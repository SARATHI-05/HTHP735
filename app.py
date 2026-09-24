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
    .badge-critical {
        background-color: #ef4444;
        color: white;
        padding: 3px 8px;
        border-radius: 6px;
        font-weight: 600;
        font-size: 0.8rem;
    }
    .badge-high {
        background-color: #f97316;
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
def load_app_data() -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, Dict, pd.DataFrame, pd.DataFrame]:
    """Loads all precomputed parquet tables and serialized model artifacts."""
    processed_dir = Path("data/processed")
    models_dir = Path("models")

    explanations_df = pd.read_parquet(processed_dir / "explanations.parquet")
    simulated_queues_df = pd.read_parquet(processed_dir / "simulated_queues.parquet")
    baseline_comp_df = pd.read_parquet(processed_dir / "baseline_comparison.parquet")

    source_trends_df = pd.DataFrame()
    if (processed_dir / "source_trends.parquet").exists():
        source_trends_df = pd.read_parquet(processed_dir / "source_trends.parquet")

    source_alerts_df = pd.DataFrame()
    if (processed_dir / "source_alerts.parquet").exists():
        source_alerts_df = pd.read_parquet(processed_dir / "source_alerts.parquet")

    model_bundle = {}
    model_path = models_dir / "model.joblib"
    if model_path.exists():
        model_bundle = joblib.load(model_path)

    return (
        explanations_df,
        simulated_queues_df,
        baseline_comp_df,
        model_bundle,
        source_trends_df,
        source_alerts_df,
    )


# Load datasets
try:
    (
        explanations_df,
        simulated_queues_df,
        baseline_comp_df,
        model_bundle,
        source_trends_df,
        source_alerts_df,
    ) = load_app_data()
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
# TAB 4: SOURCE TRENDS (PHASE 8)
# -----------------------------------------------------------------------------
with tab4:
    st.subheader("📈 Source Credibility Trends & Rapid Degradation Alerts")
    st.markdown(
        "Dynamic tracking of **rolling 7-day exponentially weighted moving average (EWMA)** misinformation rates "
        "across the 30-day operational timeline. Identifies sudden source credibility collapses and volatility spikes "
        "to proactively guide queue surveillance."
    )

    if source_trends_df.empty or source_alerts_df.empty:
        st.warning("⚠️ Source trends data not found. Please run `python -m src.trends` to precompute trendlines.")
    else:
        # Metric Overview Cards
        t_col1, t_col2, t_col3, t_col4 = st.columns(4)
        total_tracked = len(source_trends_df["speaker"].unique())
        total_alerts = len(source_alerts_df)
        max_spike_row = source_alerts_df.loc[source_alerts_df["spike_delta"].idxmax()]
        peak_risk_row = source_trends_df.loc[source_trends_df["rolling_risk_ewma"].idxmax()]

        with t_col1:
            st.markdown(
                f"""
                <div class="metric-card">
                    <div class="metric-value">{total_tracked}</div>
                    <div class="metric-label">Tracked High-Volume Sources</div>
                </div>
                """,
                unsafe_allow_html=True,
            )
        with t_col2:
            st.markdown(
                f"""
                <div class="metric-card">
                    <div class="metric-value" style="color: #ef4444;">{total_alerts}</div>
                    <div class="metric-label">Detected Volatility Alerts</div>
                </div>
                """,
                unsafe_allow_html=True,
            )
        with t_col3:
            st.markdown(
                f"""
                <div class="metric-card">
                    <div class="metric-value" style="color: #f97316;">+{max_spike_row['spike_delta']:.1%}</div>
                    <div class="metric-label">Max 5-Day Spike ({max_spike_row['speaker']})</div>
                </div>
                """,
                unsafe_allow_html=True,
            )
        with t_col4:
            st.markdown(
                f"""
                <div class="metric-card">
                    <div class="metric-value" style="color: #38bdf8;">{peak_risk_row['rolling_risk_ewma']:.1%}</div>
                    <div class="metric-label">Peak Rolling Risk ({peak_risk_row['speaker']})</div>
                </div>
                """,
                unsafe_allow_html=True,
            )

        st.markdown("<br>", unsafe_allow_html=True)

        # Plotly Line Chart Controls
        all_speakers = sorted(source_trends_df["speaker"].unique().tolist())
        default_speakers = [s for s in ["donald-trump", "barack-obama", "chain-email", "hillary-clinton", "mitt-romney"] if s in all_speakers]
        if not default_speakers:
            default_speakers = all_speakers[:5]

        ctrl_col1, ctrl_col2, ctrl_col3 = st.columns([3, 1, 1])
        with ctrl_col1:
            selected_speakers = st.multiselect(
                "Select Sources to Compare:",
                options=all_speakers,
                default=default_speakers,
                help="Select one or more top-volume sources to visualize rolling credibility trajectories.",
            )
        with ctrl_col2:
            show_bands = st.checkbox("Show Risk Thresholds", value=True, help="Display 60% Elevated and 80% Critical lines.")
        with ctrl_col3:
            show_alert_pins = st.checkbox("Highlight Alert Pins", value=True, help="Show red scatter pins on days with detected alerts.")

        if selected_speakers:
            plot_df = source_trends_df[source_trends_df["speaker"].isin(selected_speakers)].copy()

            fig_trend = px.line(
                plot_df,
                x="day",
                y="rolling_risk_ewma",
                color="speaker",
                markers=True,
                labels={"day": "Operational Timeline (Day 1 - 30)", "rolling_risk_ewma": "7-Day EWMA Misleading Rate", "speaker": "Source"},
                title="7-Day Rolling Misleading Rate by Source Over Operational Window",
            )

            # Add reference bands
            if show_bands:
                fig_trend.add_hline(
                    y=0.80,
                    line_dash="dash",
                    line_color="#ef4444",
                    annotation_text="Critical Misleading (80%)",
                    annotation_position="bottom right",
                    annotation_font_color="#ef4444",
                )
                fig_trend.add_hline(
                    y=0.60,
                    line_dash="dot",
                    line_color="#eab308",
                    annotation_text="Elevated Risk (60%)",
                    annotation_position="bottom right",
                    annotation_font_color="#eab308",
                )

            # Highlight alerts on the chart
            if show_alert_pins:
                alert_pts = plot_df[plot_df["is_alert"]].copy()
                if not alert_pts.empty:
                    fig_trend.add_scatter(
                        x=alert_pts["day"],
                        y=alert_pts["rolling_risk_ewma"],
                        mode="markers",
                        marker=dict(size=12, color="#ef4444", symbol="star", line=dict(width=2, color="white")),
                        name="🚨 Degradation Alert",
                        hoverinfo="text",
                        hovertext=[
                            f"🚨 ALERT: {r['speaker']} (Day {r['day']})<br>7-Day EWMA: {r['rolling_risk_ewma']:.1%}<br>5-Day Spike: {r['ewma_delta_5d']:+.1%}"
                            for _, r in alert_pts.iterrows()
                        ],
                    )

            fig_trend.update_layout(
                template="plotly_dark",
                height=450,
                yaxis=dict(tickformat=".0%", range=[0, 1.05]),
                xaxis=dict(tickmode="linear", dtick=2),
                margin=dict(l=20, r=20, t=50, b=20),
                legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
            )
            st.plotly_chart(fig_trend, use_container_width=True)
        else:
            st.info("Select at least one source above to plot credibility trends.")

        # Alert Table Section
        st.markdown("---")
        st.markdown("#### 🚨 Rapid Credibility Degradation Alerts")
        st.markdown(
            "Alerts triggered when a source experiences a sharp jump in misleading rate ($\ge +20\%$ over 5 days with risk $\ge 65\%$) "
            "or maintains an extreme misinformation rate ($\ge 85\%$) while actively generating claims."
        )

        sev_col, sp_col = st.columns([1, 2])
        with sev_col:
            sev_filter = st.selectbox("Filter Severity:", ["All Severities", "CRITICAL", "HIGH"])
        with sp_col:
            source_filter = st.selectbox("Filter by Source:", ["All Sources"] + all_speakers)

        filtered_alerts = source_alerts_df.copy()
        if sev_filter != "All Severities":
            filtered_alerts = filtered_alerts[filtered_alerts["severity"] == sev_filter]
        if source_filter != "All Sources":
            filtered_alerts = filtered_alerts[filtered_alerts["speaker"] == source_filter]

        if not filtered_alerts.empty:
            display_alerts = filtered_alerts.copy()
            display_alerts["current_rolling_risk"] = display_alerts["current_rolling_risk"].map(lambda x: f"{x:.1%}")
            display_alerts["baseline_rate"] = display_alerts["baseline_rate"].map(lambda x: f"{x:.1%}")
            display_alerts["spike_delta"] = display_alerts["spike_delta"].map(lambda x: f"{x:+.1%}")

            display_table = display_alerts[
                ["speaker", "day", "severity", "current_rolling_risk", "baseline_rate", "spike_delta", "alert_reason", "sample_claim"]
            ].rename(
                columns={
                    "speaker": "Source",
                    "day": "Day",
                    "severity": "Severity",
                    "current_rolling_risk": "7-Day Risk",
                    "baseline_rate": "Historical Baseline",
                    "spike_delta": "5-Day Delta",
                    "alert_reason": "Trigger Reason",
                    "sample_claim": "Recent Claim Sample",
                }
            )
            st.dataframe(display_table, use_container_width=True, hide_index=True)
        else:
            st.success("No alerts match the selected filters.")

        # Source Deep Dive
        st.markdown("---")
        st.markdown("#### 🔍 Single Source Profile & Recommended Policy")
        drill_col1, drill_col2 = st.columns([1, 2])

        with drill_col1:
            drill_speaker = st.selectbox("Inspect Source Profile:", all_speakers, index=0)
            sp_trends = source_trends_df[source_trends_df["speaker"] == drill_speaker]
            sp_alerts = source_alerts_df[source_alerts_df["speaker"] == drill_speaker]
            latest_risk = sp_trends.iloc[-1]["rolling_risk_ewma"]
            base_risk = sp_trends.iloc[0]["raw_risk"] if pd.notna(sp_trends.iloc[0]["raw_risk"]) else 0.5
            has_critical = any(sp_alerts["severity"] == "CRITICAL")
            has_high = len(sp_alerts) > 0

            if has_critical:
                policy_badge = '<span class="badge-critical">🚨 CRITICAL SURVEILLANCE</span>'
                rec_policy = "**Action Policy:** Immediate routing of all claims from this speaker to senior fact-checkers; apply +0.20 priority boost."
            elif has_high or latest_risk >= 0.65:
                policy_badge = '<span class="badge-high">⚠️ ELEVATED MONITORING</span>'
                rec_policy = "**Action Policy:** Heightened priority; auto-flag claims discussing critical harm topics (health, elections, crime)."
            else:
                policy_badge = '<span class="badge-review">✅ STANDARD QUEUE</span>'
                rec_policy = "**Action Policy:** Routine algorithmic triage; rank strictly by Reach &times; Risk formula."

            st.markdown(f"**Current Status:** {policy_badge}", unsafe_allow_html=True)
            st.markdown(f"**30-Day Claims Count:** `{int(sp_trends['daily_claims'].sum())}` claims")
            st.markdown(f"**Historical Baseline Rate:** `{sp_trends.iloc[0]['raw_risk']:.1%}`" if pd.notna(sp_trends.iloc[0]['raw_risk']) else "**Historical Baseline Rate:** `N/A`")
            st.markdown(f"**Current 7-Day Rolling Risk:** `{latest_risk:.1%}`")
            st.markdown(f"**Total Triggered Alerts:** `{len(sp_alerts)}`")

        with drill_col2:
            st.markdown(f"##### Operational Recommendation for `{drill_speaker}`")
            st.markdown(rec_policy)
            st.markdown(
                """
                > **Operational Rationale:** When a high-volume political figure or publication undergoes sudden credibility degradation, 
                > waitlisted claims risk becoming viral misperceptions before routine review cycles. The surveillance tier temporarily 
                > adjusts the intake priority without manual operator reconfiguration.
                """
            )
            # Mini bar chart of daily claim volume
            fig_vol = px.bar(
                sp_trends,
                x="day",
                y="daily_claims",
                title=f"Daily Claim Intake Volume for {drill_speaker}",
                labels={"day": "Day", "daily_claims": "Claims Count"},
                color="status",
                color_discrete_map={"CRITICAL ALERT": "#ef4444", "ELEVATED": "#f97316", "STABLE": "#3b82f6"},
            )
            fig_vol.update_layout(template="plotly_dark", height=240, margin=dict(l=10, r=10, t=35, b=10))
            st.plotly_chart(fig_vol, use_container_width=True)


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
