"""
Action recommendation and moderation policy rules module (Phase 5).
Assigns one of four actions per item:
1. Escalate: High risk AND viral reach (emergency intervention)
2. Review: Top-N items allocated for daily human review capacity
3. Waitlist: Elevated risk deferred to subsequent day's backlog
4. Deprioritize: Sub-threshold risk or low operational exposure
"""

from typing import Dict, Tuple
import pandas as pd


def determine_action_and_reason(
    row: pd.Series,
    is_top_capacity: bool,
    rank: int,
    p_escalate_thresh: float = 0.80,
    reach_escalate_thresh: float = 0.80,
    waitlist_p_thresh: float = 0.60,
) -> Tuple[str, str]:
    """
    Applies deterministic moderation policy rules and returns (action, reason).
    All numbers in the reason string reflect actual computed scores.
    """
    p = float(row.get("p_misleading", 0.0))
    reach_score = float(row.get("reach_score", 0.0))
    reach_val = int(row.get("synthetic_reach", 0))
    harm_weight = float(row.get("harm_topic_weight", 1.0))
    priority = float(row.get("priority", 0.0))
    age_boost = float(row.get("age_boost", 1.0))

    # Rule 1: ESCALATE (Extreme risk + viral reach)
    if p >= p_escalate_thresh and reach_score >= reach_escalate_thresh:
        action = "Escalate"
        reason = (
            f"ESCALATE: Critical risk ({p:.2%}) x viral reach ({reach_val:,} users, score {reach_score:.2f}) "
            f"[harm weight {harm_weight:.1f}]"
        )
        return action, reason

    # Rule 2: REVIEW (Selected within day's human review capacity)
    if is_top_capacity:
        action = "Review"
        reason = (
            f"Ranked #{rank}: risk {p:.2f} x reach score {reach_score:.2f} x harm weight {harm_weight:.1f} "
            f"(priority: {priority:.3f})"
        )
        return action, reason

    # Rule 3: WAITLIST (Elevated risk deferred to backlog)
    if p >= waitlist_p_thresh:
        action = "Waitlist"
        reason = (
            f"WAITLIST: Elevated risk ({p:.2f}) deferred to backlog (age boost: {age_boost:.2f}x, "
            f"priority: {priority:.3f})"
        )
        return action, reason

    # Rule 4: DEPRIORITIZE (Low risk or minimal harm exposure)
    action = "Deprioritize"
    reason = f"DEPRIORITIZE: Sub-threshold risk ({p:.2f}), minimal reach exposure ({reach_val:,})"
    return action, reason


def apply_action_policies(
    df: pd.DataFrame,
    capacity: int,
    p_escalate_thresh: float = 0.80,
    reach_escalate_thresh: float = 0.80,
    waitlist_p_thresh: float = 0.60,
) -> pd.DataFrame:
    """
    Applies action assignment over a priority-ranked DataFrame.
    Assumes df is already sorted descending by 'priority'.
    """
    df = df.copy()
    actions = []
    reasons = []
    ranks = []

    for idx, (_, row) in enumerate(df.iterrows()):
        rank = idx + 1
        ranks.append(rank)
        is_top = rank <= capacity
        action, reason = determine_action_and_reason(
            row=row,
            is_top_capacity=is_top,
            rank=rank,
            p_escalate_thresh=p_escalate_thresh,
            reach_escalate_thresh=reach_escalate_thresh,
            waitlist_p_thresh=waitlist_p_thresh,
        )
        actions.append(action)
        reasons.append(reason)

    df["rank"] = ranks
    df["action"] = actions
    df["reason"] = reasons
    return df
