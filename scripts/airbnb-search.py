"""Bounded, read-only Airbnb extraction. No login or paid service required."""
import contextlib
import json
import sys
from concurrent.futures import ThreadPoolExecutor
import pyairbnb
from pyairbnb import search, standardize
from pyairbnb.details import get as details


def run(p):
    if p.get('mode') == 'details':
        def one(room_id):
            try:
                data, _, _ = details(f'https://www.airbnb.com/rooms/{room_id}', 'en', '', timeout=20)
                # Exclude host identities and guest review bodies.
                return str(room_id), {k: data.get(k) for k in ('rating', 'amenities', 'images', 'room_type')}
            except Exception:
                return str(room_id), None
        with ThreadPoolExecutor(max_workers=3) as pool:
            return dict(pool.map(one, p['ids']))
    centre = p['centre']
    radius = min(p.get('maxKm') or 5, 20)
    import math
    dy = radius / 111.32
    dx = dy / max(0.1, math.cos(math.radians(centre['lat'])))
    # Explicit parameters avoid unrelated sample city/month defaults in pyairbnb.
    from datetime import date
    filters = {
        'cdnCacheSafe': 'false', 'channel': 'EXPLORE', 'datePickerType': 'calendar',
        'itemsPerGrid': '50', 'query': p['city'], 'searchByMap': 'true',
        'neLat': centre['lat']+dy, 'neLng': centre['lng']+dx,
        'swLat': centre['lat']-dy, 'swLng': centre['lng']-dx,
        'refinementPaths': '/homes', 'tabId': 'home_tab', 'screenSize': 'large',
        'version': '1.8.3', 'zoomLevel': '13', 'checkin': p['checkin'],
        'checkout': p['checkout'], 'adults': p.get('adults', 2), 'amenities': '4',
        'priceFilterInputType': '0',
        'priceFilterNumNights': (date.fromisoformat(p['checkout'])-date.fromisoformat(p['checkin'])).days,
    }
    raw_params = [{'filterName': k, 'filterValues': [str(v)]} for k, v in filters.items()]
    key = pyairbnb.get_api_key('', timeout=20)
    cursor, cursors, rows = '', set(), {}
    for page in range(15):
        raw = search.get(key, cursor, p['checkin'], p['checkout'], centre['lat']+dy,
                         centre['lng']+dx, centre['lat']-dy, centre['lng']-dx, 13,
                         'BRL', '', 0, 0, [4], False, p.get('adults', 2), 0, 0, 0, 0, 0,
                         'en', '', '', raw_params=raw_params, timeout=25)
        result = raw.get('data', {}).get('presentation', {}).get('staysSearch', {}).get('results')
        if not isinstance(result, dict) or not isinstance(result.get('searchResults'), list):
            raise RuntimeError('Airbnb mudou o formato da resposta ou bloqueou a consulta.')
        batch = standardize.from_search(raw)
        for row in batch:
            row['room_id'] = str(row['room_id'])  # preserve IDs beyond JS safe integer range
            rows[row['room_id']] = row
        next_cursor = result.get('paginationInfo', {}).get('nextPageCursor')
        if not next_cursor or not batch:
            return {'listings': list(rows.values()), 'pages': page+1, 'truncated': False}
        if next_cursor in cursors:
            break
        cursors.add(next_cursor)
        cursor = next_cursor
    return {'listings': list(rows.values()), 'pages': page+1, 'truncated': True}


if __name__ == '__main__':
    try:
        with contextlib.redirect_stdout(sys.stderr):
            result = run(json.loads(sys.argv[1]))
        print(json.dumps(result, ensure_ascii=False))
    except Exception as error:
        print(json.dumps({'error': type(error).__name__ + ': falha ao consultar Airbnb'}))
        sys.exit(1)
