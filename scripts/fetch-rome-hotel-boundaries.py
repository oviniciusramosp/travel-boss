#!/usr/bin/env python3
"""uv run --with shapely --with pyproj python scripts/fetch-rome-hotel-boundaries.py [--input /tmp/rome-zones.geojson]
Import cartographic urban zones, preserving shared vertices. No radial fallback or per-ring simplification.
Special-use zones 1X/2X retain source outlines; central editorial areas are partitioned without overlap.
"""
import argparse, json, urllib.request
from pathlib import Path
from shapely.geometry import shape, Polygon, Point, MultiPoint
from shapely.ops import unary_union, transform
from pyproj import Transformer
from shapely import make_valid
ROOT = Path(__file__).resolve().parents[1]
SOURCE = 'https://services-eu1.arcgis.com/LvSKkxRTxIZUFA0X/arcgis/rest/services/Perimetrazioni_Comune_di_Roma/FeatureServer/0'
GROUPS = {
 'balduina-trionfale': ['19A','17C'], 'aurelio': ['18A','18D'],
 'trieste-salario': ['2E'], 'porta-pia': ['2D','1F'], 'nomentano': ['3A'],
 'flaminio-parioli': ['2A','2B','2C'], 'ponte-milvio': ['20D'], 'fleming': ['20A'],
 'monte-sacro': ['4A','4H'], 'pietralata': ['5C','5G'], 'monteverde': ['16A','16D'],
}
p=argparse.ArgumentParser();p.add_argument('--input');args=p.parse_args()
raw=json.loads(Path(args.input).read_text()) if args.input else json.load(urllib.request.urlopen(SOURCE+'/query?where=1%3D1&outFields=Name,codice_zona&outSR=4326&f=geojson',timeout=60))
features={f['properties']['codice_zona']:f for f in raw['features']}
old=json.loads((ROOT/'src/data/travel-stay-polygons.json').read_text())
# Special-use urban zones keep their source outline; editorial rioni cannot cut holes in them.
protected=unary_union([make_valid(shape(features[c]['geometry'])) for c in ['1X','2X']])
editorial={}
for key,value in old.items():
 if not key.startswith('roma-'): continue
 rings=[value] if isinstance(value[0][0],(int,float)) else value
 editorial[key]=unary_union([make_valid(Polygon([(lng,lat) for lat,lng in r])) for r in rings])
# Termini east is an editorial street corridor, not the whole Castro Pretorio rione.
streets=json.loads((ROOT/'src/data/rome-termini-streets.json').read_text())
points=[(p['lon'],p['lat']) for way in streets['elements'] for p in way['geometry']]
editorial['roma-termini']=MultiPoint(points).convex_hull.intersection(editorial['roma-esquilino'])
# Resolve original overlaps once; more specific/cautious areas take precedence.
priority=['roma-termini','roma-esquilino','roma-ghetto','roma-corso-trevi','roma-ponte-regola']
order=priority+[k for k in editorial if k not in priority]
occupied=protected
for key in order:
 editorial[key]=make_valid(editorial[key].difference(occupied))
 occupied=unary_union([occupied,editorial[key]])
central=unary_union(list(editorial.values()))
result={};geometries=[];occupied=central
def polys(g):
 if g.geom_type=='Polygon': return [g]
 return [p for child in getattr(g,'geoms',[]) for p in polys(child)]
def ring(coords): return [[float(y),float(x)] for x,y,*_ in coords]
# Fill every residual urban zone intersecting the actual 5 km Roma search footprint.
projection=Transformer.from_crs('EPSG:4326','+proj=aeqd +lat_0=41.9028 +lon_0=12.4964 +datum=WGS84 +units=m',always_xy=True)
footprint=Point(0,0).buffer(5000,quad_segs=128)
used={code for codes in GROUPS.values() for code in codes}
for code,feature in features.items():
 if code not in used and transform(projection.transform,make_valid(shape(feature['geometry']))).intersects(footprint):
  GROUPS['coverage-'+code.lower()]=[code]
profiles={f'{slug}-{code.lower()}': 'roma-'+slug for slug,codes in GROUPS.items() for code in codes}
GROUPS={f'{slug}-{code.lower()}':[code] for slug,codes in GROUPS.items() for code in codes}
for slug,codes in GROUPS.items():
 source=unary_union([make_valid(shape(features[c]['geometry'])) for c in codes])
 geometry=make_valid(source.difference(occupied))
 parts=polys(geometry)
 if not parts or geometry.area < 1e-12: continue
 assert geometry.is_valid,slug
 anchor=max(parts,key=lambda p:p.area).representative_point()
 result['roma-'+slug]={'profileId':profiles[slug],'codes':codes,'names':[features[c]['properties']['Name'] for c in codes], 'lat':anchor.y,'lng':anchor.x,'polygons':[[ring(p.exterior.coords),*[ring(h.coords) for h in p.interiors]] for p in parts]}
 geometries.append((slug,geometry))
 occupied=unary_union([occupied,geometry])
for i,(name,g) in enumerate(geometries):
 assert g.intersection(central).area < 1e-10,name
 for other,h in geometries[i+1:]:
  assert g.intersection(h).area < 1e-10,(name,other)
contacts=[[a,b] for i,(a,g) in enumerate(geometries) for b,h in geometries[i+1:] if g.boundary.intersection(h.boundary).length > 1e-6]
assert contacts, 'No shared borders were preserved'
covered=transform(projection.transform,occupied).intersection(footprint)
expected=transform(projection.transform,unary_union([make_valid(shape(f['geometry'])) for f in features.values()]+[central])).intersection(footprint)
uncovered=expected.difference(covered).area
assert uncovered < 1, f'Uncovered area inside search: {uncovered} m2'
editorialOutput={key:{'lat':max(polys(g),key=lambda p:p.area).representative_point().y,'lng':max(polys(g),key=lambda p:p.area).representative_point().x,'polygons':[[ring(p.exterior.coords),*[ring(h.coords) for h in p.interiors]] for p in polys(g)]} for key,g in editorial.items()}
output={'editorialZones':editorialOutput,'coverage':{'radiusM':5000,'center':[41.9028,12.4964],'uncoveredMappedAreaM2':round(uncovered,4)},'contacts':contacts,'source':SOURCE,'retrievedAt':'2026-09-20','method':'Urban zones with shared boundaries and holes retained. 1X/2X keep source outlines; editorial rioni are partitioned without overlap. Termini east is the OSM Giolitti/Turati street corridor clipped to Esquilino, not an administrative district.','zones':result}
(ROOT/'src/data/rome-hotel-boundaries.json').write_text(json.dumps(output,ensure_ascii=False,separators=(',',':'))+'\n')
print(f'Imported {len(result)} areas; {len(contacts)} shared borders; no overlapping interiors; holes retained.')
