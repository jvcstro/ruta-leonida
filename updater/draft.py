#!/usr/bin/env python3
"""Convierte el inbox en borradores para revisión. NO publica nada.
Lee updater/inbox/*.jsonl, descarta lo ya visto (seen.json), clasifica por sección y señal de fiabilidad,
y añade borradores a updater/drafts/queue.json con su fuente y citas literales (evidence) para que un revisor IA
redacte el texto final en español y lo apruebe con approve.py.
Uso: python3 draft.py [--min-score 2]"""
import argparse, glob, hashlib, json, os, re, time
HERE = os.path.dirname(os.path.abspath(__file__))
QUEUE = os.path.join(HERE, 'drafts', 'queue.json'); SEEN = os.path.join(HERE, 'seen.json')
RULES = {
 'ganar-dinero': r'\b(money|dinero|cash|rich|rico|millon|million|heist|golpe|atraco|business|negocio|stock market|bolsa|grind|farm(ing)?|\$\d)',
 'trucos': r'\b(cheat|cheats|truco|trucos|c[oó]digo|code|glitch|exploit|infinite|infinito|god ?mode)\b',
 'coleccionables': r'\b(collectible|collectibles|coleccionable|coleccionables|all \d+|todas? las? \d+|locations?|ubicaci[oó]n|hidden package|paquete|scrap|signal jammer|trophy|logro|achievement)\b',
 'secretos': r'\b(easter ?egg|secret|secreto|hidden|oculto|reference|referencia|ufo|ovni|ghost|fantasma|bigfoot|myth|mito)\b',
 'misiones': r'\b(mission|misi[oó]n|misiones|walkthrough|gu[ií]a completa|chapter|cap[ií]tulo|gold medal|ending|final)\b',
}
OFFICIAL = r'(rockstargames\.com|blog\.playstation\.com|news\.xbox\.com|playstation\.com|xbox\.com)'
TRUSTED = r'(ign|gamespot|eurogamer|vandal|meristation|3djuegos|vgc|videogameschronicle|polygon|kotaku|pcgamer|theverge|ign\.com|elconfidencial|as\.com|pushsquare|purexbox|rockstarintel|gamesradar)'
RUMOR = r'\b(leak|leaked|filtraci[oó]n|rumou?r|rumor|insider|supuestamente|allegedly|reportedly|could|might|podr[ií]a)\b'

def load(p, d):
    try: return json.load(open(p, encoding='utf-8'))
    except Exception: return d

def score(it):
    t = f"{it.get('url','')} {it.get('source','')}".lower(); s = 1
    if re.search(OFFICIAL, t): s = 5
    elif re.search(TRUSTED, t): s = 3
    if it['type'] == 'reddit': s = 1
    if re.search(RUMOR, (it.get('title','') + ' ' + it.get('text','')[:600]).lower()): s -= 1
    return s

def evidence(it, pat, n=3):
    text = it.get('text', '') or ''
    sents = re.split(r'(?<=[.!?])\s+', text)
    hits = [s.strip()[:280] for s in sents if re.search(pat, s.lower())][:n]
    return hits or ([text[:280]] if text else [])

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--min-score', type=int, default=1); a = ap.parse_args()
    seen = set(load(SEEN, [])); queue = load(QUEUE, []); added = 0
    for f in sorted(glob.glob(os.path.join(HERE, 'inbox', '*.jsonl'))):
        for line in open(f, encoding='utf-8'):
            it = json.loads(line); key = hashlib.sha1((it.get('url') or it.get('title','')).encode()).hexdigest()[:12]
            if key in seen: continue
            seen.add(key)
            blob = (it.get('title','') + ' ' + it.get('text','')).lower()
            if not re.search(r'gta ?(6|vi)|grand theft auto vi|leonida|vice city|jason|luc[ií]a', blob): continue
            hubs = [h for h, pat in RULES.items() if re.search(pat, blob)] or ['noticias']
            sc = score(it)
            if sc < a.min_score: continue
            for h in hubs:
                queue.append({'id': f'{h}-{key}', 'hub': h, 'status': 'draft', 'score': sc,
                              'kind': 'oficial' if sc >= 5 else 'prensa' if sc >= 3 else 'comunidad',
                              'title_seed': it.get('title',''), 'evidence': evidence(it, RULES.get(h, r'gta')),
                              'source': {'label': it.get('source') or it['type'], 'url': it.get('url'), 'type': it['type'], 'published': it.get('published','')},
                              'created': time.strftime('%Y-%m-%dT%H:%M:%S%z')})
                added += 1
        os.rename(f, f + '.done')
    queue.sort(key=lambda d: (-d['score'], d['created']))
    os.makedirs(os.path.dirname(QUEUE), exist_ok=True)
    json.dump(queue, open(QUEUE, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    json.dump(sorted(seen), open(SEEN, 'w'), indent=0)
    pend = [d for d in queue if d['status'] == 'draft']
    print(f'+{added} borradores; pendientes {len(pend)}: ' + ', '.join(f"{h}={sum(1 for d in pend if d['hub']==h)}" for h in list(RULES) + ['noticias']))
