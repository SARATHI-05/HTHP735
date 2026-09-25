"""
Social Media Platform URL Extractor and Content Ingestion Service.
Supports live metadata extraction, OpenGraph/Twitter Card parsing,
oEmbed querying, and URL structural anomaly heuristics for:
- X / Twitter
- YouTube & YouTube Shorts
- Instagram & Threads
- Reddit
- Facebook
- Telegram
- TikTok
- News Articles & Web URLs
"""

import re
import urllib.parse
from typing import Any, Dict, Optional
import requests

try:
    from bs4 import BeautifulSoup
except ImportError:
    BeautifulSoup = None


class SocialUrlExtractor:
    def __init__(self, timeout: float = 4.0):
        self.timeout = timeout
        self.headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
            ),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9,ta;q=0.8",
        }

        # Reputable certified and public media domains
        self.known_trusted_domains = {
            "thehindu.com",
            "timesofindia.indiatimes.com",
            "indianexpress.com",
            "bbc.com",
            "reuters.com",
            "apnews.com",
            "ndtv.com",
            "hindustantimes.com",
            "dinamalar.com",
            "dinamani.com",
            "pib.gov.in",
            "eci.gov.in",
            "who.int",
        }

        # Suspicious / high-risk TLDs commonly used for disposable phishing or clickbait
        self.suspicious_tlds = {".xyz", ".top", ".click", ".buzz", ".work", ".cam", ".rest", ".online", ".live"}

        # Common URL shorteners used to conceal destination origins
        self.shorteners = {"bit.ly", "tinyurl.com", "t.co", "ow.ly", "is.gd", "buff.ly", "cutt.ly"}

    def detect_platform(self, url: str) -> Dict[str, str]:
        """Identifies social media or content publishing platform from URL."""
        domain = ""
        try:
            parsed = urllib.parse.urlparse(url)
            domain = parsed.netloc.lower().split(":")[0]
            if domain.startswith("www."):
                domain = domain[4:]
        except Exception:
            pass

        if "x.com" in domain or "twitter.com" in domain:
            return {"platform": "X / Twitter", "id": "x", "icon": "chat", "color": "#000000"}
        if "youtube.com" in domain or "youtu.be" in domain:
            return {"platform": "YouTube", "id": "youtube", "icon": "smart_display", "color": "#FF0000"}
        if "instagram.com" in domain:
            return {"platform": "Instagram", "id": "instagram", "icon": "photo_camera", "color": "#E1306C"}
        if "reddit.com" in domain or "redd.it" in domain:
            return {"platform": "Reddit", "id": "reddit", "icon": "forum", "color": "#FF4500"}
        if "facebook.com" in domain or "fb.watch" in domain or "fb.com" in domain:
            return {"platform": "Facebook", "id": "facebook", "icon": "public", "color": "#1877F2"}
        if "t.me" in domain or "telegram.org" in domain:
            return {"platform": "Telegram", "id": "telegram", "icon": "send", "color": "#24A1DE"}
        if "tiktok.com" in domain:
            return {"platform": "TikTok", "id": "tiktok", "icon": "movie", "color": "#010101"}
        if any(td in domain for td in self.known_trusted_domains):
            return {"platform": "Mainstream News", "id": "news_verified", "icon": "newspaper", "color": "#0051d5"}
        
        return {"platform": "Web Article / Blog", "id": "web", "icon": "link", "color": "#5b5e66"}

    def analyze_url_heuristics(self, url: str) -> Dict[str, Any]:
        """Calculates structural URL security and misinfo-risk indicators."""
        parsed = urllib.parse.urlparse(url)
        domain = parsed.netloc.lower().split(":")[0]
        if domain.startswith("www."):
            domain = domain[4:]

        is_shortener = any(domain == s or domain.endswith("." + s) for s in self.shorteners)
        has_suspicious_tld = any(domain.endswith(tld) for tld in self.suspicious_tlds)
        
        # Check for deceptive brand impersonation (e.g. 'bbc-news-live.com' or 'eci-gov-vote.in')
        brand_impersonation = False
        for trusted in ["bbc", "pib", "thehindu", "eci", "ndtv", "timesofindia"]:
            if trusted in domain and domain not in self.known_trusted_domains:
                brand_impersonation = True
                break

        # Check for tracking / viral referral campaign query params
        params = urllib.parse.parse_qs(parsed.query)
        viral_referral = any(k.lower() in ["utm_source", "ref", "share", "forward"] for k in params.keys())

        # Path depth & length
        path_segments = [p for p in parsed.path.split("/") if p]
        
        risk_score = 0.15
        if is_shortener:
            risk_score += 0.25
        if has_suspicious_tld:
            risk_score += 0.35
        if brand_impersonation:
            risk_score += 0.40
        if not parsed.scheme or parsed.scheme != "https":
            risk_score += 0.10

        return {
            "domain": domain,
            "is_shortener": is_shortener,
            "has_suspicious_tld": has_suspicious_tld,
            "brand_impersonation": brand_impersonation,
            "viral_referral": viral_referral,
            "path_depth": len(path_segments),
            "url_risk_score": round(min(0.99, max(0.05, risk_score)), 3),
        }

    def estimate_reach_from_url(self, url: str) -> Dict[str, Any]:
        """
        Autofills and calculates audience reach based on platform engagement tier,
        domain reputation, and viral transmission vectors.
        """
        plat = self.detect_platform(url)
        heuristics = self.analyze_url_heuristics(url)
        pid = plat["id"]

        platform_base_reach = {
            "x": 65000,
            "youtube": 95000,
            "instagram": 80000,
            "telegram": 140000,
            "facebook": 85000,
            "reddit": 45000,
            "tiktok": 110000,
            "news_verified": 25000,
            "web": 35000,
        }

        base = platform_base_reach.get(pid, 35000)
        factors = [f"Base tier for {plat['platform']}: {base:,} users"]

        if heuristics["viral_referral"]:
            base += 45000
            factors.append("+45,000 for viral referral parameters (e.g. ref=whatsapp/forward)")

        if heuristics["is_shortener"]:
            base += 30000
            factors.append("+30,000 for high-velocity URL shortener broadcast")

        if heuristics["has_suspicious_tld"]:
            base += 50000
            factors.append("+50,000 for disposable domain mass propagation vector")

        if heuristics["brand_impersonation"]:
            base += 40000
            factors.append("+40,000 for official brand impersonation reach boost")

        estimated_reach = int(min(1000000, max(5000, base)))
        return {
            "estimated_reach": estimated_reach,
            "factors": factors,
            "platform": plat["platform"],
            "tier": "Critical Exposure" if estimated_reach > 100000 else "High Exposure" if estimated_reach > 50000 else "Elevated Exposure",
        }

    def fetch_url_metadata(self, url: str) -> Dict[str, Any]:
        """
        Attempts live HTTP extraction using OpenGraph, Twitter Card, and oEmbed.
        Falls back to path heuristics and domain parsing if blocked or offline.
        """
        platform_info = self.detect_platform(url)
        heuristics = self.analyze_url_heuristics(url)
        reach_info = self.estimate_reach_from_url(url)

        metadata = {
            "url": url,
            "platform": platform_info["platform"],
            "platform_id": platform_info["id"],
            "platform_color": platform_info["color"],
            "platform_icon": platform_info["icon"],
            "domain": heuristics["domain"],
            "heuristics": heuristics,
            "estimated_reach": reach_info["estimated_reach"],
            "reach_factors": reach_info["factors"],
            "reach_tier": reach_info["tier"],
            "title": "",
            "description": "",
            "image_url": "",
            "author": "",
            "source_status": "OFFLINE_FALLBACK",
        }

        # 1. Specialized YouTube oEmbed (Free, no API key required, reliable)
        if platform_info["id"] == "youtube":
            try:
                oembed_url = f"https://www.youtube.com/oembed?url={urllib.parse.quote(url)}&format=json"
                resp = requests.get(oembed_url, timeout=self.timeout)
                if resp.status_code == 200:
                    data = resp.json()
                    metadata["title"] = data.get("title", "")
                    metadata["author"] = data.get("author_name", "")
                    metadata["image_url"] = data.get("thumbnail_url", "")
                    metadata["source_status"] = "LIVE_OEMBED_VERIFIED"
                    return metadata
            except Exception:
                pass

        # 2. General HTTP Fetch with OpenGraph / HTML Parsing
        try:
            resp = requests.get(url, headers=self.headers, timeout=self.timeout, allow_redirects=True)
            if resp.status_code == 200 and resp.text:
                title = ""
                description = ""
                image_url = ""
                author = ""

                if BeautifulSoup is not None:
                    soup = BeautifulSoup(resp.text, "html.parser")

                    # Extract Title
                    og_title = soup.find("meta", property="og:title") or soup.find("meta", attrs={"name": "twitter:title"})
                    if og_title and og_title.get("content"):
                        title = og_title["content"].strip()
                    elif soup.title and soup.title.string:
                        title = soup.title.string.strip()

                    # Extract Description
                    og_desc = soup.find("meta", property="og:description") or soup.find("meta", attrs={"name": "twitter:description"}) or soup.find("meta", attrs={"name": "description"})
                    if og_desc and og_desc.get("content"):
                        description = og_desc["content"].strip()

                    # Extract Preview Image
                    og_img = soup.find("meta", property="og:image") or soup.find("meta", attrs={"name": "twitter:image"})
                    if og_img and og_img.get("content"):
                        image_url = og_img["content"].strip()

                    # Extract Author / Handle
                    og_author = soup.find("meta", property="og:article:author") or soup.find("meta", attrs={"name": "twitter:creator"}) or soup.find("meta", attrs={"name": "author"})
                    if og_author and og_author.get("content"):
                        author = og_author["content"].strip()
                else:
                    m_title = re.search(r'<meta\s+[^>]*property=["\'](?:og:title|twitter:title)["\'][^>]*content=["\']([^"\']*)["\']', resp.text, re.IGNORECASE)
                    if not m_title:
                        m_title = re.search(r'<title[^>]*>([^<]*)</title>', resp.text, re.IGNORECASE)
                    if m_title:
                        title = m_title.group(1).strip()

                    m_desc = re.search(r'<meta\s+[^>]*property=["\'](?:og:description|twitter:description)["\'][^>]*content=["\']([^"\']*)["\']', resp.text, re.IGNORECASE)
                    if m_desc:
                        description = m_desc.group(1).strip()

                    m_img = re.search(r'<meta\s+[^>]*property=["\'](?:og:image|twitter:image)["\'][^>]*content=["\']([^"\']*)["\']', resp.text, re.IGNORECASE)
                    if m_img:
                        image_url = m_img.group(1).strip()

                metadata["title"] = title
                metadata["description"] = description
                metadata["image_url"] = image_url
                metadata["author"] = author
                metadata["source_status"] = "LIVE_OPENGRAPH_PARSED"
                return metadata
        except Exception:
            pass

        # 3. Graceful URL Path Extraction for Protected / Unreachable Social URLs
        parsed = urllib.parse.urlparse(url)
        path = parsed.path.strip("/")
        parts = path.split("/")

        if platform_info["id"] == "x":
            # https://x.com/username/status/123456
            if len(parts) >= 1:
                metadata["author"] = f"@{parts[0]}"
            metadata["title"] = f"Social post by @{parts[0] if parts else 'unknown'} on X/Twitter"
            metadata["description"] = f"Post ID: {parts[2] if len(parts) > 2 else 'status'} circulating across regional feeds."
        elif platform_info["id"] == "reddit":
            # https://reddit.com/r/tamilnadu/comments/123/title_slug
            if len(parts) >= 2 and parts[0] == "r":
                metadata["author"] = f"r/{parts[1]}"
                slug = parts[3].replace("_", " ").replace("-", " ").capitalize() if len(parts) > 3 else "Discussion"
                metadata["title"] = slug
                metadata["description"] = f"Regional community thread in r/{parts[1]} flagged for rapid virality."
        elif platform_info["id"] == "telegram":
            metadata["author"] = f"t.me/{parts[0]}" if parts else "Telegram Broadcast"
            metadata["title"] = "Forwarded Telegram Channel Broadcast"
            metadata["description"] = "Public channel forward circulating with forwarding headers and call-to-action."
        elif platform_info["id"] == "instagram":
            metadata["author"] = f"@{parts[0]}" if len(parts) > 0 and parts[0] not in ["p", "reel"] else "Instagram User"
            metadata["title"] = "Instagram Media & Reel Ingestion"
            metadata["description"] = "Visual photo/reel narrative flagged for high audience velocity."
        else:
            domain_label = heuristics["domain"].replace(".com", "").replace(".org", "").title()
            metadata["title"] = f"Article published on {domain_label}"
            metadata["description"] = f"Web narrative indexed from {heuristics['domain']}."

        return metadata
