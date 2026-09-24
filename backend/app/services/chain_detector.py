import re
from typing import List, Optional, Dict, Any
from simhash import Simhash

class ChainMessageDetector:
    """
    Detects viral WhatsApp/Telegram forward triggers, automated bot propagation,
    and near-duplicate variants using SimHash Locality-Sensitive Hashing (LSH).
    """
    
    def __init__(self):
        self.viral_triggers = [
            r"forward(ed)? (this|to all|to everyone)",
            r"share before (it is deleted|taken down|it gets removed)",
            r"urgent notice",
            r"secret leaked",
            r"whatsapp will be closed",
            r"send to \d+ (people|groups|contacts|friends)",
            r"pass this on",
            r"spread (this|maximum|widely)",
            r"breaking alert",
            r"do not ignore",
            r"alert everyone in tamil nadu",
            r"forwarded many times"
        ]

    def get_simhash(self, text: str) -> int:
        """Computes 64-bit SimHash fingerprint for text near-duplicate matching."""
        clean = re.sub(r'[^\w\s]', '', text.lower()).strip()
        if not clean:
            clean = "empty_message"
        return Simhash(clean).value

    def calculate_distance(self, hash1: int, hash2: int) -> int:
        """Calculates bitwise Hamming distance between two 64-bit SimHash fingerprints."""
        return bin((hash1 ^ hash2) & ((1 << 64) - 1)).count('1')

    def analyze(self, message: str, known_clusters: Optional[List[int]] = None, distance_threshold: int = 6) -> Dict[str, Any]:
        """
        Analyzes message text for forwarding markers and bot cascade characteristics.
        """
        matched_triggers = [
            t for t in self.viral_triggers 
            if re.search(t, message, re.IGNORECASE)
        ]
        
        msg_hash = self.get_simhash(message)
        is_near_duplicate = False
        min_cluster_distance = 64

        if known_clusters:
            for chash in known_clusters:
                d = self.calculate_distance(msg_hash, chash)
                if d < min_cluster_distance:
                    min_cluster_distance = d
                if d <= distance_threshold:
                    is_near_duplicate = True
                    break

        # Cascade score calculation: Each viral marker adds 0.25, duplication adds 0.40
        cascade_score = 0.25 * len(matched_triggers) + (0.40 if is_near_duplicate else 0.0)
        cascade_score = min(1.0, max(0.05, round(cascade_score, 2)))

        bot_risk = "CRITICAL" if cascade_score >= 0.70 else ("ELEVATED" if cascade_score >= 0.40 else "NORMAL")

        return {
            "modality": "chain_text",
            "simhash": str(msg_hash),
            "is_chain_forward": len(matched_triggers) > 0 or is_near_duplicate,
            "bot_cascade_risk": cascade_score,
            "bot_risk_tier": bot_risk,
            "matched_triggers": matched_triggers,
            "linguistic_markers": {
                "forwarding_imperatives_count": len(matched_triggers),
                "near_duplicate_cluster": is_near_duplicate,
                "cluster_hamming_distance": min_cluster_distance if known_clusters else None,
                "synthesized_velocity": f"{min(9.9, round(cascade_score * 10, 1))}x viral multiplier"
            }
        }
