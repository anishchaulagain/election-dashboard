import httpx
import json

ELECTION_API_URL = "https://result.election.gov.np/Handlers/SecureJson.ashx"
headers = {
    "x-csrf-token": "d99e6e506e8b4d5b92ad2afb8ff7ec8a",
    "x-requested-with": "XMLHttpRequest",
    "referer": "https://result.election.gov.np/",
    "cookie": "ASP.NET_SessionId=px3sjnva4pgnx4u5bcc1oksn; CsrfToken=d99e6e506e8b4d5b92ad2afb8ff7ec8a",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
}
params = {
    "file": "JSONFiles/ElectionResultCentral2082.txt",
    "_search": "false",
    "rows": "10",
    "page": "1",
    "sidx": "_id",
    "sord": "desc",
}

try:
    with httpx.Client(timeout=30.0, verify=False, headers=headers) as client:
        resp = client.get(ELECTION_API_URL, params=params)
        print(f"Status: {resp.status_code}")
        data = resp.json()
        print(f"Records: {data.get('records')}")
        print(f"Total Pages: {data.get('total')}")
        if "rows" in data and len(data["rows"]) > 0:
            first = data["rows"][0]
            print("First row keys:", list(first.keys()))
            print("First row sample:", first)
except Exception as e:
    print(f"Error: {e}")
