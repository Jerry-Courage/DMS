import requests
import json

BASE = 'http://localhost:8000/api'

# Login
token = requests.post(f'{BASE}/auth/login/', json={'username': 'admin', 'password': 'admin123'}).json()['access']
headers = {'Authorization': f'Bearer {token}'}
print('Logged in OK\n')

# 1. AI Insights
print('=== AI INSIGHTS ===')
r = requests.get(f'{BASE}/ai/insights/', headers=headers)
d = r.json()
print('Status:', r.status_code)
if 'insight' in d:
    print(d['insight'])
else:
    print(d)

# 2. Natural Language Search
print('\n=== AI SEARCH ===')
r = requests.post(f'{BASE}/ai/search/', json={'query': 'mining companies with expired permits'}, headers=headers)
d = r.json()
print('Status:', r.status_code)
if 'parsed_filters' in d:
    print('Parsed filters:', d['parsed_filters'])
    print('Results count:', d['count'])
else:
    print(d)

# 3. Permit Alerts
print('\n=== PERMIT ALERTS ===')
r = requests.get(f'{BASE}/ai/permit-alerts/', headers=headers)
d = r.json()
print('Status:', r.status_code)
print('Expired:', len(d.get('expired', [])), '| Expiring soon:', len(d.get('expiring_soon', [])))

# 4. Anomaly Scan
print('\n=== ANOMALY SCAN ===')
r = requests.get(f'{BASE}/ai/anomalies/', headers=headers)
d = r.json()
print('Status:', r.status_code)
if 'anomalies' in d:
    print('Anomalies found:', d['total'])
    for a in d['anomalies'][:3]:
        atype = a.get('type', '')
        name = a.get('company_name', '')
        msg = a.get('message', '')
        print(f'  [{atype}] {name}: {msg}')
else:
    print(d)

# 5. AI Report
print('\n=== AI REPORT ===')
r = requests.post(f'{BASE}/ai/report/', json={'sector': 'mining'}, headers=headers)
d = r.json()
print('Status:', r.status_code)
if 'report' in d:
    print(d['report'][:500], '...')
else:
    print(d)
