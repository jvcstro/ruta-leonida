#!/usr/bin/env python3
"""Recoge material nuevo (gratis, sin claves) y lo deja en updater/inbox/<fecha>.jsonl.
Fuentes: Reddit RSS (r/GTA6 y otros), Google News RSS (es + en), YouTube vía yt-dlp (búsqueda + subtítulos automáticos).
Uso: python3 fetch.py [--reddit] [--news] [--youtube "consulta"] [--yt-max 5] [--transcripts]
Sin flags = reddit + news. No usa créditos de TubeAlfred."""
import argparse, json, os, re, subprocess, sys, time, urllib.request, urllib.parse, xml.etree.ElementTree as ET, html
HERE = os.path.dirname(os.path.abspath(__file__))
UA = 'Mozilla/5.0 (X11; Linux x86_64) ruta-leonida-updater/0.1'
SUBS = ['GTA6', 'GTAVI', 'GrandTheftAutoVI']
NEWS_Q = [('GTA 6', 'es', 'ES', 'ES:es'), ('GTA 6', 'en', 'US', 'US:en'), ('"GTA 6" Rockstar Newswire', 'en', 'US', 'US:en')]

def get(url, timeout=20):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=timeout) as r: return r.read().decode('utf-8', 'replace')

def strip(s): return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', s or ''))).strip()

def reddit():
    out = []
    ns = {'a': 'http://www.w3.org/2005/Atom'}
    for sub in SUBS:
        for sort in ('new', 'top/?t=day'):
            try: root = ET.fromstring(get(f'https://www.reddit.com/r/{sub}/{sort.split("/")[0]}/.rss' + ('?t=day' if 'top' in sort else '')))
            except Exception as e: print('reddit', sub, sort, 'ERROR', e, file=sys.stderr); continue
            for en in root.findall('a:entry', ns):
                link = en.find('a:link', ns).attrib.get('href')
                out.append({'type': 'reddit', 'source': f'r/{sub}', 'url': link, 'title': (en.findtext('a:title', '', ns) or '').strip(),
                            'text': strip(en.findtext('a:content', '', ns))[:4000], 'published': en.findtext('a:updated', '', ns),
                            'author': (en.find('a:author/a:name', ns).text if en.find('a:author/a:name', ns) is not None else '')})
            time.sleep(2)
    return out

def news():
    out = []
    for q, hl, gl, ceid in NEWS_Q:
        url = 'https://news.google.com/rss/search?' + urllib.parse.urlencode({'q': q + ' when:1d', 'hl': hl, 'gl': gl, 'ceid': ceid})
        try: root = ET.fromstring(get(url))
        except Exception as e: print('news', q, 'ERROR', e, file=sys.stderr); continue
        for it in root.iter('item'):
            out.append({'type': 'news', 'source': (it.findtext('source') or '').strip(), 'url': it.findtext('link'), 'title': strip(it.findtext('title')),
                        'text': strip(it.findtext('description'))[:1500], 'published': it.findtext('pubDate'), 'lang': hl})
    return out

def youtube(query, n, transcripts):
    out = []
    try:
        res = subprocess.run(['yt-dlp', '--flat-playlist', '--print', '%(id)s\t%(title)s\t%(channel)s', f'ytsearchdate{n}:{query}'], capture_output=True, text=True, timeout=120)
    except Exception as e: print('yt', 'ERROR', e, file=sys.stderr); return out
    for line in res.stdout.strip().splitlines():
        vid, title, chan = (line.split('\t') + ['', ''])[:3]
        item = {'type': 'youtube', 'source': chan, 'url': f'https://www.youtube.com/watch?v={vid}', 'title': title, 'text': '', 'published': ''}
        if transcripts:
            tmp = os.path.join(HERE, 'inbox', '_subs'); os.makedirs(tmp, exist_ok=True)
            subprocess.run(['yt-dlp', '--skip-download', '--write-auto-subs', '--write-subs', '--sub-langs', 'es.*,en.*', '--sub-format', 'vtt', '-o', f'{tmp}/%(id)s.%(ext)s', item['url']], capture_output=True, text=True, timeout=180)
            for f in sorted(os.listdir(tmp)):
                if f.startswith(vid) and f.endswith('.vtt'):
                    lines, seen = [], set()
                    for l in open(os.path.join(tmp, f), encoding='utf-8', errors='replace'):
                        l = re.sub(r'<[^>]+>', '', l).strip()
                        if not l or '-->' in l or l.startswith(('WEBVTT', 'Kind:', 'Language:')) or l in seen: continue
                        seen.add(l); lines.append(l)
                    item['text'] = ' '.join(lines)[:20000]; item['transcript_lang'] = f.split('.')[-2]; break
        out.append(item)
    return out

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--reddit', action='store_true'); ap.add_argument('--news', action='store_true')
    ap.add_argument('--youtube', action='append', default=[]); ap.add_argument('--yt-max', type=int, default=5); ap.add_argument('--transcripts', action='store_true')
    a = ap.parse_args()
    if not (a.reddit or a.news or a.youtube): a.reddit = a.news = True
    items = []
    if a.reddit: items += reddit()
    if a.news: items += news()
    for q in a.youtube: items += youtube(q, a.yt_max, a.transcripts)
    path = os.path.join(HERE, 'inbox', time.strftime('%Y%m%d-%H%M') + '.jsonl')
    with open(path, 'w', encoding='utf-8') as f:
        for it in items: f.write(json.dumps(it, ensure_ascii=False) + '\n')
    print(f'{len(items)} elementos -> {path}')
