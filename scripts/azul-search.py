"""Azul search over HTTP/1.1, keeping one anonymous session throughout."""
import json
import sys
import time
import unicodedata
from curl_cffi import requests, CurlHttpVersion

BASE = 'https://www.azulviagens.com.br'


def fold(value):
    return ''.join(c for c in unicodedata.normalize('NFD', value.casefold()) if not unicodedata.combining(c))


def search(p):
    with requests.Session(impersonate='chrome', http_version=CurlHttpVersion.V1_1) as session:
        session.get(BASE + '/hotels/', timeout=20).raise_for_status()
        headers = {'X-Requested-With': 'XMLHttpRequest', 'Referer': BASE + '/hotels/'}
        response = session.get(BASE + '/include/ctlZoneSelector/ashx/jsonZoneSelector.ashx',
            params={'language':'pt', 'categorize':'simple', 'product':'hotels',
                    'onlyWithProductIn':'1', 'queryType':'zones', 'q':p['city']}, headers=headers, timeout=20)
        response.raise_for_status()
        zones = [z for z in response.json() if z.get('type') == 'zone' and z.get('name')]
        query = fold(p['city']).strip()
        zone = next((z for z in zones if fold(z['name']).split(',')[0].strip() == query), None)
        if not zone:
            zone = next((z for z in zones if fold(z['name']).split(',')[0].strip().startswith(query)), None)
        if not zone:
            raise ValueError('destination-not-found')
        response = session.get(BASE + '/handlers/searcher.ashx', params={
            'accion':'searchhotels', 'searchType':'hotels', 'destinationID':str(zone['id']),
            'startDate':p['checkin'], 'endDate':p['checkout'], 'paxs':str(p.get('adults',2))+'0',
            'hashParams':'', '_':str(int(time.time()*1000)),
        }, headers={**headers, 'Accept':'text/plain, */*; q=0.01'}, timeout=40)
        response.raise_for_status()
        session_id = response.text.strip()
        if not session_id.isdecimal() or int(session_id) <= 0:
            raise ValueError('invalid-search-session')
        for attempt in range(3):
            response = session.get(BASE + '/hotels/ashx/results.ashx', params={
                'searchSessionID':session_id, 'currency':'BRL', 'order':'etiquetaPrecio', 'page':'1',
            }, headers=headers, timeout=60)
            response.raise_for_status()
            summary = response.json().get('summary', {})
            hotels = summary.get('hotels', [])
            if hotels:
                return {'zone':zone, 'sessionId':int(session_id), 'hotels':[
                    {'id':str(h['ID']), 'uid':h['UID'], 'name':h['name'],
                     'lat':h['latitude'], 'lng':h['longitude'], 'price':h['priceFrom'],
                     'currency':h.get('currencyFrom','BRL')} for h in hotels
                ]}
            if attempt < 2:
                time.sleep(3)
        return {'zone':zone, 'sessionId':int(session_id), 'hotels':[]}


if __name__ == '__main__':
    try:
        print(json.dumps(search(json.loads(sys.argv[1])), ensure_ascii=False))
    except Exception as error:
        # Never dump response bodies, session cookies or request headers to logs.
        print(json.dumps({'error':type(error).__name__}))
        sys.exit(1)
