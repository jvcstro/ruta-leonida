#!/usr/bin/env python3
"""Publica (o rechaza) un borrador tras revisión. Escribe en data/entries/<hub>.json; no despliega.
Ejemplos:
  python3 approve.py --draft noticias-ab12cd --title "..." --summary "..." [--body-file texto.md] [--extra-source "Etiqueta|https://..."] [--spoiler] [--link /plataformas/]
  python3 approve.py --hub ganar-dinero --id atracos-banco --title "..." --body-file m.md --source "Etiqueta|https://..."   (entrada nueva sin borrador)
  python3 approve.py --collectible --category paquetes --category-name "Paquetes ocultos" --item p01 --name "Paquete 1" --region "Vice City" --hint "..." --source "Etiqueta|https://..."
  python3 approve.py --reject noticias-ab12cd --reason "rumor sin fuente"
  python3 approve.py --update ganar-dinero/atracos-banco --body-file m2.md   (edita y renueva 'updated')"""
import argparse, json, os, re, sys, time
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
QUEUE = os.path.join(HERE, 'drafts', 'queue.json'); HUBS = os.path.join(ROOT, 'data', 'hubs.json')
now = lambda: time.strftime('%Y-%m-%dT%H:%M:%S') + time.strftime('%z')[:3] + ':' + time.strftime('%z')[3:]
slug = lambda s: re.sub(r'[^a-z0-9]+', '-', s.lower().translate(str.maketrans('áéíóúñü', 'aeiounu'))).strip('-')[:60]
def jl(p, d=None):
    try: return json.load(open(p, encoding='utf-8'))
    except Exception: return d
def jw(p, o): json.dump(o, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
def src(s): l, u = s.split('|', 1); return {'label': l.strip(), 'url': u.strip()}
def touch_hub(h):
    hubs = jl(HUBS); [x.update(updated=now()) for x in hubs if x['slug'] == h]; jw(HUBS, hubs)
ap = argparse.ArgumentParser()
ap.add_argument('--draft'); ap.add_argument('--hub'); ap.add_argument('--id'); ap.add_argument('--title'); ap.add_argument('--summary')
ap.add_argument('--body-file'); ap.add_argument('--source', action='append', default=[]); ap.add_argument('--extra-source', action='append', default=[])
ap.add_argument('--spoiler', action='store_true'); ap.add_argument('--link'); ap.add_argument('--reject'); ap.add_argument('--reason', default='')
ap.add_argument('--update'); ap.add_argument('--collectible', action='store_true'); ap.add_argument('--category'); ap.add_argument('--category-name')
ap.add_argument('--category-desc'); ap.add_argument('--item'); ap.add_argument('--name'); ap.add_argument('--region'); ap.add_argument('--hint')
a = ap.parse_args(); queue = jl(QUEUE, [])
if a.reject:
    for d in queue:
        if d['id'] == a.reject: d.update(status='rejected', reason=a.reason, reviewed=now())
    jw(QUEUE, queue); print('rechazado', a.reject); sys.exit()
body = open(a.body_file, encoding='utf-8').read() if a.body_file else None
if a.collectible:
    p = os.path.join(ROOT, 'data', 'entries', 'coleccionables.json'); data = jl(p)
    cat = next((c for c in data['categories'] if c['id'] == a.category), None)
    if not cat: cat = {'id': a.category, 'name': a.category_name or a.category, 'description': a.category_desc or '', 'items': []}; data['categories'].append(cat)
    if any(i['id'] == a.item for i in cat['items']): sys.exit('ya existe ' + a.item)
    if not a.source: sys.exit('falta --source: no se publica nada sin fuente')
    cat['items'].append({'id': a.item, 'name': a.name, 'region': a.region or '', 'hint': a.hint or '', 'sources': [src(s) for s in a.source], 'updated': now()})
    jw(p, data); touch_hub('coleccionables'); print('coleccionable añadido', a.category, a.item); sys.exit()
if a.update:
    h, i = a.update.split('/'); p = os.path.join(ROOT, 'data', 'entries', h + '.json'); xs = jl(p)
    e = next(x for x in xs if x['id'] == i)
    for k, v in (('title', a.title), ('summary', a.summary), ('body', body), ('link', a.link)):
        if v: e[k] = v
    e['sources'] += [src(s) for s in a.source + a.extra_source]; e['updated'] = now(); jw(p, xs); touch_hub(h); print('actualizado', a.update); sys.exit()
d = next((x for x in queue if x['id'] == a.draft), None) if a.draft else None
hub = a.hub or (d and d['hub']); sources = ([{'label': d['source']['label'], 'url': d['source']['url']}] if d else []) + [src(s) for s in a.source + a.extra_source]
if not (hub and a.title and (a.summary or body)): sys.exit('faltan --hub/--draft, --title y --summary o --body-file')
if not sources: sys.exit('falta fuente: no se publica nada sin fuente')
p = os.path.join(ROOT, 'data', 'entries', hub + '.json'); xs = jl(p, [])
eid = a.id or slug(a.title)
if any(x['id'] == eid for x in xs): sys.exit('ya existe ' + eid + ' (usa --update)')
e = {'id': eid, 'title': a.title, 'summary': a.summary or '', 'published': now(), 'updated': now(), 'status': 'published', 'sources': sources}
if body: e['body'] = body
if a.spoiler: e['spoiler'] = True
if a.link: e['link'] = a.link
xs.append(e); jw(p, xs); touch_hub(hub)
if d: d.update(status='approved', entry=f'{hub}/{eid}', reviewed=now()); jw(QUEUE, queue)
print('publicado', f'{hub}/{eid}')
