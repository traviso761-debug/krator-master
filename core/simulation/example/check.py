#!/usr/bin/env python3
"""Check the SIM example sheet in headless Chromium: every check passes, every negative fails, the error panel stays
empty, and the decisions are deterministic (two loads with one seed log the same, another seed does not).

    python3 build.py && python3 check.py        # exit 1 on any failure

Requires: pip install playwright && python -m playwright install chromium (PW_CHROME=/path/to/chrome to use another).
"""
import os, pathlib, sys
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
URL = pathlib.Path(os.path.join(HERE, 'sim-example.html')).as_uri()
bad = 0
def say(ok, name, detail=''):
    global bad
    bad += 0 if ok else 1
    print(('PASS  ' if ok else 'FAIL  ') + name + (' : ' + detail if detail else ''))

with sync_playwright() as p:
    kw = {'executable_path': os.environ['PW_CHROME']} if os.environ.get('PW_CHROME') else {}
    b = p.chromium.launch(**kw)
    def load(q):
        pg = b.new_page(viewport={'width': 1100, 'height': 760}); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(URL + q); pg.wait_for_function('window._ready===true', timeout=20000)
        return pg, errs
    pg, errs = load('?hold&test')
    for r in pg.evaluate('()=>_example.checks()'):
        say(r['ok'], r['name'], r['detail'])
    for r in pg.evaluate('()=>_example.negatives()'):
        say(r['failed'], 'negative: ' + r['name'], ('fails as it must: ' if r['failed'] else 'PASSED (cannot fail): ') + r['detail'])
    panel = pg.evaluate("()=>document.getElementById('errs').textContent")
    say(not panel and not errs, 'no errors on the page', (panel + ' '.join(errs))[:300])
    hashes = []
    for q in ('?hold&test', '?hold&test', '?hold&test&seed=2'):
        pq, e2 = load(q); pq.evaluate('()=>_example.run(1440)'); hashes.append(pq.evaluate('()=>_example.hash()')); pq.close()
    say(hashes[0] == hashes[1], 'one seed, one day: the same decisions on two loads', '%08x %08x' % (hashes[0], hashes[1]))
    say(hashes[0] != hashes[2], 'negative: another seed decides otherwise', '%08x vs %08x' % (hashes[0], hashes[2]))
    b.close()
print(('%d FAILED' % bad) if bad else 'all passed')
sys.exit(1 if bad else 0)
