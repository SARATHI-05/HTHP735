import json
import urllib.request
import urllib.parse

def test_samples():
    url = "http://127.0.0.1:8000/api/v1/investigate/samples"
    with urllib.request.urlopen(url) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        print(f"PASS: Samples endpoint returned {len(data)} items")
        for s in data:
            print(f"  • [{s['modality']}] {s['title']}")

def test_multimodal_text():
    url = "http://127.0.0.1:8000/api/investigate/multimodal"
    payload = urllib.parse.urlencode({
        "text_content": "URGENT: forward to all contacts! Government is canceling Magalir Urimai scheme tomorrow. Share before deleted!",
        "reach": 75000,
        "topic": "Elections"
    }).encode('utf-8')
    req = urllib.request.Request(url, data=payload, method="POST")
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode('utf-8'))
        print("PASS: Multimodal text analysis:")
        print(f"  • Media Type: {res['media_type']}")
        print(f"  • Priority Score: {res['triage']['priority_score']}")
        print(f"  • Action: {res['triage']['action']}")
        print(f"  • Harm Weight: {res['triage']['harm_weight']}")
        print(f"  • SimHash: {res['forensics']['chain']['simhash']}")
        print(f"  • Bot Cascade Risk: {res['forensics']['chain']['bot_cascade_risk']}")
        print(f"  • Fact Checks Found: {len(res['fact_checks'])}")

if __name__ == "__main__":
    test_samples()
    test_multimodal_text()
