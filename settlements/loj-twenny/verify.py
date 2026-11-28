#!/usr/bin/env python3
"""Headless check for Loj Twenny (dist/loj-twenny.html), on tools/harness.py (the Chromium launcher, the local three.js r128,
the GPU lanes, the queue and the stall watchdog: KRATOR_GL=gpu for the real GPU, KRATOR_GPU_LANE=arc|rtx|auto).

  python3 verify.py dist/loj-twenny.html [--assert] [--views "name|name" | --all-views] [--out shots] [--size 1280x800] [--eval "()=>..."]

Waits for the page's take, prints the error panel, and with --assert runs the page's own checks (src/90-lt-checks.js,
LTCHK.run): each must pass, and each check's negative (LTCHK.negatives: a broken input) must fail:
  plan-audit                 the hold laid on core/city/cavern holds every rule (rock, headroom, frontage, grade, decks)
  carved                     KCAVERN open at every room of every site, rock behind every box
  hold-drawn                 every site's def drawn (the Tungang set), its furniture the catalog's Tungang pieces at 0.94
  tags                       every site registered in core/tags before it is drawn, the vocabulary clean
  lamp-code                  every kept door with the lamp of its code; red on the quiet deck, green on the Line deck, amber on the
                             work deck (light falls with depth)
  train-on-guideway          the branch shuttle's cars on track 1's guideway over a round trip, never past the buffers
  doors-open-at-the-platform a car's step plate is a floor in its door window and not after it (riding: core/walk/frame)
  sim                        the hold declared on core/simulation (places, people, the hold's settlement)
  walkers-on-floors          the people about stand on walk floors, out of the rock (runs to a turn change if few are about)
  aids                       the follow camera, the deck cut and the section, the deck map and the line map, the fade
Then the shots of the walk-through (kits/tungang/PLAN.md 5.5 "A line loj"), the views in order.
"""
import argparse, asyncio, json, os, sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'tools'))
import harness as _harness
from harness import parse_views, verify_page
try: sys.stdout.reconfigure(encoding='utf-8')
except Exception: pass


async def run(a):
    os.makedirs(a.out, exist_ok=True); bad = False
    async with verify_page(a.html, here=os.path.dirname(os.path.abspath(__file__)), size=a.size, query='?hour=8.4', settle_ms=0) as V:
        pg, fails = V.page, V.fails
        if not V.ready: print('never ready'); fails.append('build timeout')
        try: await pg.wait_for_function("!!(window._api&&window._api.lt)", timeout=180000)
        except Exception: print('the take never ran'); fails.append('no take')
        try: await pg.wait_for_function("(window._texPending||0)===0", timeout=120000)
        except Exception: print('textures still decoding after 120 s')
        await pg.wait_for_timeout(1500)
        e = await pg.evaluate("document.getElementById('errs').textContent")
        errs = list(V.errs) + ['console: ' + t for k, t in pg.krator_console if k == 'error']
        print('ERROR PANEL:', e.strip() or '(clean)')
        for x in errs[:8]: print('pageerror:', x)
        ok = not (e or '').strip() and not errs
        print(('PASS ' if ok else 'FAIL ') + 'error-panel - ' + ('clean' if ok else 'not clean') + '  (negative fails: a panel with an error)')
        bad |= not ok
        if a.assert_:
            for r in await pg.evaluate("()=>window._api.lt.checks()"):
                print(('PASS ' if r['ok'] else 'FAIL ') + r['name'] + ' - ' + r['detail'][:900]); bad |= not r['ok']
            for r in await pg.evaluate("()=>window._api.lt.negatives()"):
                print(('PASS ' if not r['ok'] else 'FAIL ') + 'negative ' + r['name'] + (' - fails, as it must' if not r['ok'] else ' - [the broken input passed]')); bad |= r['ok']
        if a.eval: print(json.dumps(await pg.evaluate(a.eval), indent=1)[:6000])
        names = await pg.evaluate("()=>{const v=window._api.views;const o=typeof v==='function'?v():v;return Array.isArray(o)?o:Object.keys(o||{});}")
        views = names if a.all_views else parse_views(a.views, names)
        for i, vn in enumerate(views):
            okv = await pg.evaluate("n=>{try{window._api.go(n);return true;}catch(e){return false;}}", vn)
            if not okv: print('no view', vn); continue
            await pg.wait_for_timeout(1500); fn = os.path.join(a.out, ('%02d-' % i) + ''.join(c if c.isalnum() else '_' for c in vn)[:44] + '.png'); await V.shot(fn, view=vn); print('shot', fn)
        e2 = await pg.evaluate("document.getElementById('errs').textContent")
        if e2.strip() and e2 != e: print('ERROR PANEL after views:', e2); bad = True
        if bad: fails.append('Loj Twenny checks (error panel, page errors or an assert)')
    sys.exit(V.exit())


if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('html'); ap.add_argument('--views'); ap.add_argument('--all-views', action='store_true')
    ap.add_argument('--eval'); ap.add_argument('--assert', dest='assert_', action='store_true'); ap.add_argument('--out', default='shots'); ap.add_argument('--size', default='1280x800')
    asyncio.run(run(ap.parse_args()))
