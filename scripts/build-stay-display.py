"""Display-only contact buffers. Never change neighborhood scores or membership."""
import json, sys
from pathlib import Path
from shapely.geometry import Polygon
from shapely.ops import unary_union, transform
from shapely import make_valid, set_precision
from pyproj import Transformer
root=Path(__file__).resolve().parents[1]
rows=json.loads(Path(sys.argv[1]).read_text())
def parts(g):
 if g.geom_type=='Polygon': return [g]
 return [p for c in getattr(g,'geoms',[]) for p in parts(c)]
def encode(g, inverse):
 def ring(r): return [[round(y,9),round(x,9)] for x,y in r.coords]
 return [[ring(p.exterior),*[ring(h) for h in p.interiors]] for p in parts(transform(inverse.transform,g))]
output={'halfWidthM':35,'method':'35 m on each side of best/caution contact. Computed before visibility filters. Visual transition only; no inferred safety score.','zones':{},'transitions':[]}
for city in ['roma','lisboa']:
 crs='EPSG:32633' if city=='roma' else 'EPSG:32629'
 forward=Transformer.from_crs('EPSG:4326',crs,always_xy=True)
 inverse=Transformer.from_crs(crs,'EPSG:4326',always_xy=True)
 geoms={r['id']:transform(forward.transform,make_valid(unary_union([Polygon([(lng,lat) for lat,lng in p[0]], [[(lng,lat) for lat,lng in h] for h in p[1:]]) for p in r['polygons']]))) for r in rows if r['city']==city}
 geoms={id:set_precision(make_valid(g),0.01) for id,g in geoms.items()}
 bands={r['id']:r['band'] for r in rows if r['city']==city}
 strips=[]
 for a,g in geoms.items():
  if bands[a]!='best': continue
  for b,h in geoms.items():
   if bands[b]!='caution' or g.distance(h)>1: continue
   # A 1 m tolerance handles source rounding; buffer only the shared contact, not whole polygons.
   contact=g.boundary.intersection(h.buffer(1))
   if contact.length<1 and g.intersection(h).area<1: continue
   strip=make_valid(contact.buffer(35).union(g.intersection(h)).intersection(g.union(h)))
   if strip.area<1: continue
   strips.append(strip)
   output['transitions'].append({'city':city,'between':[a,b],'polygons':encode(strip,inverse)})
 transition=unary_union(strips)
 for id,g in geoms.items():
  core=make_valid(g.difference(transition))
  output['zones'][id]={'band':bands[id],'polygons':encode(core,inverse)}
  assert core.intersection(transition).area<0.01,id
 # Mandatory separation remains true even when some colors are hidden.
 for a,g in geoms.items():
  if bands[a]!='best': continue
  for b,h in geoms.items():
   if bands[b]=='caution' and g.distance(h)<=1:
    assert g.difference(transition).distance(h.difference(transition))>1,(a,b)
 # Merge strips before drawing: overlapping contact buffers must not darken the map.
 output.setdefault('transitionAreas',{})[city]=encode(transition,inverse)
(root/'src/data/travel-stay-display.json').write_text(json.dumps(output,ensure_ascii=False,separators=(',',':'))+'\n')
print(f"Display geometry: {len(output['zones'])} zones, {len(output['transitions'])} best/caution contacts; separation validated.")
