#!/usr/bin/env python3
"""Headless verification & view shooter for Arcoforte (`kits/arcoforte`).

    python3 kits/arcoforte/verify.py kits/arcoforte/dist/arcoforte.html --assert
    python3 kits/arcoforte/verify.py kits/arcoforte/dist/arcoforte.html --assert --all-views --out /tmp/af-shots
    python3 kits/arcoforte/verify.py kits/arcoforte/dist/arcoforte.html --assert --state intact
"""
import argparse, asyncio, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'tools'))
import harness                                      # noqa: E402  (imported at top: watchdog and verify cache)
from harness import parse_views, verify_page        # noqa: E402

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

ASSERT_JS = r"""() => {
  const A = window._api;
  if (!A || !A.hostChecks || !A.hostNegatives) return [{ name: 'api-present', ok: false, detail: 'missing window._api.hostChecks' }];
  const R = A.hostChecks().slice();
  const negs = A.hostNegatives();
  negs.forEach(n => R.push({ name: 'negative - ' + n.name, ok: !!n.ok, detail: n.detail || 'caught broken input' }));

  /* Exercise live cutaway opening & live culture socket swap (`fleetborn` / `iziz`), then restore initial socket & close cutaway */
  const initSock = window.ARCOFORTE_HOST ? window.ARCOFORTE_HOST.getSocket() : 'refurbished';
  const testSock = initSock === 'fleetborn' ? 'iziz' : 'fleetborn';
  if (typeof KHOST !== 'undefined' && KHOST.cut) {
    KHOST.cut.to('rotunda', 0);
    const cutOk = !!KHOST.cut.on && KHOST.cut.unit && KHOST.cut.unit.id === 'rotunda';
    let sockOk = true, sockDetail = 'skipped';
    if (window.ARCOFORTE_HOST) {
      const sw = window.ARCOFORTE_HOST.socket(testSock);
      sockOk = !!(sw && sw.socket === testSock && sw.missing === 0);
      sockDetail = sw ? ('socketed ' + testSock + ' (' + sw.placed + ' pcs, missing ' + sw.missing + ')') : 'socket failed';
      window.ARCOFORTE_HOST.socket(initSock);
    }
    KHOST.cut.off();
    R.push({ name: 'cutaway-and-live-culture-socket', ok: cutOk && sockOk, detail: 'cutaway ' + cutOk + '; ' + sockDetail });
  }
  return R;
}"""


async def run(a):
    bad = False
    q = ['t=4']
    if a.state:
        q.append('state=' + a.state)
    if a.socket:
        q.append('socket=' + a.socket)
    elif a.culture:
        q.append('culture=' + a.culture)
    async with verify_page(a.html, here=HERE, size=a.size, query='?' + '&'.join(q), settle_ms=0,
                           checks=harness.SURVEY) as V:
        pg, fails = V.page, V.fails
        if not V.ready:
            print('never ready')
            fails.append('build timeout')
        try:
            await pg.wait_for_function("(window._texPending||0)===0", timeout=120000)
        except Exception:
            print('textures still decoding after 120 s')
        await pg.wait_for_timeout(600)

        e = await pg.evaluate("document.getElementById('errs') ? document.getElementById('errs').textContent : ''")
        print('ERROR PANEL:', e.strip() or '(clean)')
        print('build:', json.dumps(await pg.evaluate("window._build||null")))

        errs = list(V.errs) + ['console: ' + t for k, t in pg.krator_console if k == 'error']
        if e.strip() or errs:
            bad = True
        for x in errs[:8]:
            print('pageerror:', x)

        if a.assert_:
            for r in await pg.evaluate(ASSERT_JS):
                print(('PASS ' if r['ok'] else 'FAIL ') + r['name'] + ' - ' + str(r.get('detail', ''))[:900])
                bad |= not r['ok']

        if a.cut:
            await pg.evaluate("cutSet(true)")
        if a.night:
            await pg.evaluate("nightSet(true)")
        if a.eval:
            print(json.dumps(await pg.evaluate(a.eval), indent=1)[:8000])

        if a.cam:
            os.makedirs(a.out, exist_ok=True)
            v = [float(t) for t in a.cam.split(',')]
            await pg.evaluate("v => KHOST.setView(...v)", v)
            await pg.wait_for_timeout(700)
            await V.shot(os.path.join(a.out, 'cam.png'), view='cam')
            print('shot cam.png')

        all_v = await pg.evaluate("typeof VIEWS !== 'undefined' ? Object.keys(VIEWS) : []")
        views = all_v if a.all_views else (parse_views(a.views, all_v) if a.views else [])
        if views:
            os.makedirs(a.out, exist_ok=True)
            for i, vn in enumerate(views):
                ok = await pg.evaluate("n => KHOST.go(n)", vn)
                if not ok:
                    print('no view', vn)
                    continue
                await pg.wait_for_timeout(250)
                fn = os.path.join(a.out, ('%02d-' % i) + ''.join(c if c.isalnum() else '_' for c in vn)[:44] + '.png')
                await V.shot(fn, view=vn)
                print('shot', fn)

        e2 = await pg.evaluate("document.getElementById('errs') ? document.getElementById('errs').textContent : ''")
        if e2.strip() and e2 != e:
            print('ERROR PANEL after views:', e2)
            bad = True
        if bad:
            fails.append('arcoforte checks (error panel, page errors or an assert)')
    return V.exit()


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('html')
    ap.add_argument('--views', default='')
    ap.add_argument('--all-views', action='store_true')
    ap.add_argument('--state', default='')
    ap.add_argument('--socket', default='')
    ap.add_argument('--culture', default='')
    ap.add_argument('--cut', action='store_true')
    ap.add_argument('--night', action='store_true')
    ap.add_argument('--cam')
    ap.add_argument('--eval')
    ap.add_argument('--assert', dest='assert_', action='store_true')
    ap.add_argument('--out', default='shots')
    ap.add_argument('--size', default='1280x800')
    sys.exit(asyncio.run(run(ap.parse_args())))
