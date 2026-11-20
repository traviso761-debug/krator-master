#!/usr/bin/env python3
"""Headless WebGL verification for Dilihan (settlements/dilihan/PLAN.md).

  python3 verify.py dist/dilihan.html --assert [--views "Overview,Summer solstice sunset,..."] [--all-views] [--out shots]

Uses tools/harness.py (verify_page with checks=harness.SURVEY): waits for window._ready and library PBR textures, runs
Dilihan's layout/placement/tag/solstice/area-ratio/cornice/palace checks and their negative controls (_api.hostChecks,
_api.hostNegatives, _api.solsticeCheck, _api.areaRatioCheck, _api.corniceCheck), captures preset views and eye checks,
then runs all universal asserts (shader programs, samplers < 16, NaN sweep, registered volumes, KWALK, key map,
drawn-ground, instance cap, and page budget).
"""
import argparse
import asyncio
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'tools'))
import harness  # noqa: E402  (imported at the top: the watchdog and the verify cache)

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass


ASSERT_JS = r"""() => {
  const A = window._api;
  if (!A || !A.hostChecks) return [{name: 'hostChecks', ok: false, detail: 'missing _api.hostChecks'}];
  const R = [];
  for (const c of A.hostChecks()) R.push(c);
  for (const n of (A.hostNegatives ? A.hostNegatives() : [])) {
    R.push({name: 'negative: ' + n.name, ok: !!n.ok, detail: n.ok ? 'fails as it should' : 'did not fail'});
  }
  if (A.solsticeCheck) {
    const s = A.solsticeCheck();
    R.push({name: 'solstice sunset portal check', ok: !!s.pass, detail: String(s.detail || '')});
  }
  if (A.areaRatioCheck) {
    const ar = A.areaRatioCheck();
    R.push({name: '1:4 colonia to vernacular area check', ok: !!ar.pass, detail: String(ar.detail || '')});
  }
  if (A.corniceCheck) {
    const cc = A.corniceCheck();
    R.push({name: 'wall-street cornice alignment check', ok: !!cc.pass, detail: String(cc.detail || '')});
  }
  return R;
}"""


async def main(a):
    os.makedirs(a.out, exist_ok=True)
    async with harness.verify_page(a.html, here=HERE, size=a.size, settle_ms=800, checks=harness.SURVEY) as V:
        pg = V.page
        fails = V.fails
        try:
            await pg.wait_for_function("(window._texPending || 0) === 0", timeout=120000)
        except Exception:
            fails.append('textures still decoding after 120 s')
        await pg.wait_for_timeout(250)

        panel = await pg.evaluate("() => { const e = document.getElementById('errs'); return e ? e.textContent.trim() : ''; }")
        if panel:
            print('ERROR PANEL:', panel, flush=True)
        for err in V.errs[:8]:
            print('PAGE ERROR:', err, flush=True)

        info = await pg.evaluate("() => window._api && window._api.dilihan ? window._api.dilihan() : null")
        print('dilihan:', json.dumps(info), flush=True)

        if a.assert_:
            checks = await pg.evaluate(ASSERT_JS)
            for c in checks:
                tag = '  PASS  ' if c.get('ok') else '  FAIL  '
                det = str(c.get('detail') or '')
                print(tag + c['name'] + (' : ' + det[:400] if det else ''), flush=True)
                if not c.get('ok'):
                    fails.append(c['name'])

        if a.eval:
            print(json.dumps(await pg.evaluate(a.eval), indent=2)[:6000], flush=True)

        has_api = await pg.evaluate("() => !!(window._api && window._api.go)")
        if has_api:
            if a.cam:
                vals = [float(t) for t in a.cam.split(',')]
                await pg.evaluate("(v) => window._api.setView(...v)", vals)
                await pg.wait_for_timeout(250)
                await V.shot(os.path.join(a.out, 'cam.png'))
                print('shot cam.png', flush=True)

            known = await pg.evaluate("() => window._api ? window._api.views() : []")
            views = known if a.all_views else harness.parse_views(a.views, known)
            for vn in views:
                await pg.evaluate("(v) => window._api.go(v)", vn)
                await pg.wait_for_timeout(300)
                slug = ''.join(ch if ch.isalnum() else '_' for ch in vn).strip('_')
                fn = os.path.join(a.out, '%s.png' % slug)
                await V.shot(fn, view=vn)
                print('shot', fn.replace(os.sep, '/'), flush=True)

        if V.samples:
            print('\n--- view render samples (calls, tris) ---', flush=True)
            for name, calls, tris in V.samples:
                print('  %-34s calls=%s  tris=%s' % (name, calls, tris), flush=True)

    return V.exit()


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('html')
    ap.add_argument('--assert', dest='assert_', action='store_true')
    ap.add_argument('--views', default='')
    ap.add_argument('--all-views', action='store_true')
    ap.add_argument('--cam', default='')
    ap.add_argument('--eval', default='')
    ap.add_argument('--out', default='shots')
    ap.add_argument('--size', default='1280x800')
    ap.add_argument('--no-cache', action='store_true')
    sys.exit(asyncio.run(main(ap.parse_args())))
