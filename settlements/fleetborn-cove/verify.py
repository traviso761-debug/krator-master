#!/usr/bin/env python3
"""Headless verification & view shooter for Fleetborn Cove (`settlements/fleetborn-cove`).

    python3 settlements/fleetborn-cove/verify.py settlements/fleetborn-cove/dist/fleetborn-cove.html --assert
    python3 settlements/fleetborn-cove/verify.py settlements/fleetborn-cove/dist/fleetborn-cove.html --assert --all-views --out /tmp/fcove-shots
"""
import argparse, asyncio, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'tools'))
import harness                                      # noqa: E402
from harness import parse_views, verify_page        # noqa: E402

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

ASSERT_JS = r"""() => {
  const A = window._api;
  if (!A || !A.hostChecks || !A.hostNegatives) {
    return [{ name: 'api-present', ok: false, detail: 'missing window._api.hostChecks' }];
  }
  const R = A.hostChecks().slice();
  const negs = A.hostNegatives();
  negs.forEach(n => {
    const ok = n.failed != null ? !!n.failed : !!n.ok;
    R.push({ name: 'negative - ' + n.name, ok: ok, detail: n.detail || 'caught broken input' });
  });

  /* Exercise live Tide, Drydock & Dynamic Fleet Panel jumps across Double Dark Moot, Great Ebb, and Neap */
  if (window.FCOVE_PANEL) {
    const scRef = typeof FCOVE_SCENE !== 'undefined' ? FCOVE_SCENE : window.FCOVE_SCENE;
    const countVis = () => scRef && scRef.fleetGroups
      ? Object.keys(scRef.fleetGroups).filter(k => scRef.fleetGroups[k] && scRef.fleetGroups[k].visible).length
      : -1;

    const stFlood = window.FCOVE_PANEL.setTide('doubleDark').fcove;
    const visMoot = countVis();
    const mootPop = stFlood && stFlood.sim ? stFlood.sim.mootPop : 0;
    const arkFloodY = scRef && scRef.careened.length ? scRef.careened[0].group.position.y : null;

    const stEbb = window.FCOVE_PANEL.setTide('greatEbb').fcove;
    if (typeof TICKS !== 'undefined' && TICKS) TICKS.forEach(fn => { try { fn(0.016, 0); } catch (e) {} });
    const arkEbbY = scRef && scRef.careened.length ? scRef.careened[0].group.position.y : null;

    const stNeap = window.FCOVE_PANEL.setTide('neap').fcove;
    if (typeof TICKS !== 'undefined' && TICKS) TICKS.forEach(fn => { try { fn(0.016, 0); } catch (e) {} });
    const visNeap = countVis();
    const neapPop = stNeap && stNeap.sim ? stNeap.sim.mootPop : 0;

    const tideDynOk = !!(
      stFlood && stFlood.level > 6.5 && stFlood.cradleDays.cradle_deep.open && stFlood.cradleDays.cradle_great.open && stFlood.rotors.smeltActive &&
      visMoot === 5 && mootPop === 2480 &&
      stEbb && stEbb.level < -6.5 && stEbb.causeway.exposed &&
      stNeap && !stNeap.cradleDays.cradle_deep.open && !stNeap.causeway.exposed && !stNeap.rotors.smeltActive &&
      visNeap >= 1 && visNeap < 5 && neapPop < mootPop &&
      arkEbbY != null && Math.abs(arkEbbY - 2.6) < 0.08
    );
    R.push({
      name: 'live-tide-and-fleet-moot-vs-neap',
      ok: tideDynOk,
      detail: 'doubleDark=' + (stFlood && stFlood.level) + 'm (fleets=' + visMoot + '/5, pop=' + mootPop + ', arkY=' + (arkFloodY && arkFloodY.toFixed(2)) + 'm), ebb=' + (stEbb && stEbb.level) + 'm (cwy=' + (stEbb && stEbb.causeway.exposed) + ', arkY=' + (arkEbbY && arkEbbY.toFixed(2)) + 'm), neap deepOpen=' + (stNeap && stNeap.cradleDays.cradle_deep.open) + ' (fleets=' + visNeap + '/5, pop=' + neapPop + ')'
    });

    /* Restore bright morning spring high water (day 90, 09:18, Double Dark Moot, 5/5 fleets) so preset views are sunlit */
    const clk = window.KHOST && window.KHOST.host ? window.KHOST.host.clock : null;
    if (clk) {
      clk.day = 90;
      if (clk.set) clk.set(9.3); else clk.hour = 9.3;
    }
    window.FCOVE_PANEL.setTide('live');
    if (typeof TICKS !== 'undefined' && TICKS) TICKS.forEach(fn => { try { fn(0.016, 0); } catch (e) {} });
    if (typeof SKY !== 'undefined' && SKY.view) SKY.view();
  }

  /* Exercise KHOST.stocks (SIM holds integration) */
  if (typeof KHOST !== 'undefined' && KHOST.stocks && typeof KHOST.stocks.toggle === 'function') {
    KHOST.stocks.toggle(true);
    const el = document.getElementById('stocks');
    const txt = el ? el.textContent : '';
    const stkOk = txt.indexOf('paktong') >= 0 || txt.indexOf('Paktong') >= 0;
    KHOST.stocks.toggle(false);
    R.push({ name: 'sim-stocks-panel-bound', ok: stkOk, detail: 'stocks panel renders paktong chain = ' + stkOk });
  }

  /* Exercise cutaway opening on bastion_west */
  if (typeof KHOST !== 'undefined' && KHOST.cut) {
    KHOST.cut.to('bastion_west', 2);
    const cutOk = !!KHOST.cut.on && KHOST.cut.unit && KHOST.cut.unit.id === 'bastion_west';
    KHOST.cut.off();
    R.push({ name: 'cutaway-bastion-fleetborn', ok: cutOk, detail: 'cutaway bastion_west storey 2 = ' + cutOk });
  }

  return R;
}"""


async def run(a):
    bad = False
    html_path = a.html or os.path.join(HERE, 'dist', 'fleetborn-cove.html')
    q = ['t=4']
    if a.tide:
        q.append('tide=' + a.tide)
    async with verify_page(html_path, here=HERE, size=a.size, query='?' + '&'.join(q), settle_ms=0,
                           checks=harness.SURVEY) as V:
        pg, fails = V.page, V.fails
        if not V.ready:
            print('never ready')
            fails.append('build timeout')
        try:
            await pg.wait_for_function("(window._texPending||0)===0", timeout=120000)
        except Exception:
            print('textures still decoding after 120 s')
        await pg.wait_for_timeout(700)

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

        if a.tide_cmd:
            await pg.evaluate("c => window.FCOVE_PANEL && window.FCOVE_PANEL.setTide(c)", a.tide_cmd)
            await pg.evaluate("() => { if (typeof TICKS !== 'undefined' && TICKS) TICKS.forEach(fn => { try { fn(0.016, 0); } catch (e) {} }); if (typeof SKY !== 'undefined' && SKY.view) SKY.view(); }")
            await pg.wait_for_timeout(450)

        all_v = await pg.evaluate("() => { try { return Object.keys(VIEWS); } catch (e) { return []; } }")
        views = all_v if a.all_views else (parse_views(a.views, all_v) if a.views else [])
        if views:
            os.makedirs(a.out, exist_ok=True)
            for i, vn in enumerate(views):
                ok = await pg.evaluate("n => KHOST.go(n)", vn)
                if not ok:
                    print('no view', vn)
                    continue
                await pg.wait_for_timeout(350)
                fn = os.path.join(a.out, ('%02d-' % i) + ''.join(c if c.isalnum() else '_' for c in vn)[:44] + '.png')
                await V.shot(fn, view=vn)
                print('shot', fn)

            if (a.all_views or a.compare_tides) and not a.tide_cmd:
                await pg.evaluate("""() => {
                  const clk = window.KHOST && window.KHOST.host ? window.KHOST.host.clock : null;
                  if (clk) { clk.day = 90; if (clk.set) clk.set(12.0); else clk.hour = 12.0; }
                  if (window.FCOVE_PANEL) window.FCOVE_PANEL.setTide('greatEbb', {keepDay: true});
                  if (typeof TICKS !== 'undefined' && TICKS) TICKS.forEach(fn => { try { fn(0.016, 0); } catch (e) {} });
                  if (typeof SKY !== 'undefined' && SKY.view) SKY.view();
                }""")
                for vn, slug in [('spring-graving-cradles', 'ebb-spring-graving-cradles.png'),
                                 ('white-stacks-causeway', 'ebb-white-stacks-causeway.png')]:
                    await pg.evaluate("n => KHOST.go(n)", vn)
                    await pg.wait_for_timeout(450)
                    fn = os.path.join(a.out, slug)
                    await pg.screenshot(path=fn)
                    print('shot', fn)

                await pg.evaluate("""() => {
                  const clk = window.KHOST && window.KHOST.host ? window.KHOST.host.clock : null;
                  if (clk) { clk.day = 90; if (clk.set) clk.set(9.3); else clk.hour = 9.3; }
                  if (window.FCOVE_PANEL) window.FCOVE_PANEL.setTide('live');
                  if (typeof TICKS !== 'undefined' && TICKS) TICKS.forEach(fn => { try { fn(0.016, 0); } catch (e) {} });
                  if (typeof SKY !== 'undefined' && SKY.view) SKY.view();
                }""")
                await pg.wait_for_timeout(250)

        if a.p4p5_shots:
            os.makedirs(a.p4p5_shots, exist_ok=True)
            # 1 & 2: P4 Shore-kin Ash-Burners Village & 3D Spar Log-Chute / Gjar Villages (sunlit morning)
            await pg.evaluate("""() => {
              const clk = window.KHOST && window.KHOST.host ? window.KHOST.host.clock : null;
              if (clk) { clk.day = 90; if (clk.set) clk.set(9.6); else clk.hour = 9.6; }
              if (window.FCOVE_PANEL) window.FCOVE_PANEL.setTide('live');
              if (typeof TICKS !== 'undefined' && TICKS) TICKS.forEach(fn => { try { fn(0.016, 0); } catch (e) {} });
              if (typeof SKY !== 'undefined' && SKY.view) SKY.view();
            }""")
            for vn, fname in [
                ('ash-burners-village', 'fcove_p4_ash_village.png'),
                ('spar-chute-gjar-villages', 'fcove_p4_spar_chute_gjar.png'),
            ]:
                await pg.evaluate("n => KHOST.go(n)", vn)
                await pg.wait_for_timeout(450)
                fp = os.path.join(a.p4p5_shots, fname)
                await pg.screenshot(path=fp)
                print('shot', fp)

            # 3: P5 Neap Anchorage (Day 68 sunlit 10:15, 1/5 visiting fleets, banked hearth, shut deep cradle)
            await pg.evaluate("""() => {
              const clk = window.KHOST && window.KHOST.host ? window.KHOST.host.clock : null;
              if (clk) { clk.day = 67; if (clk.set) clk.set(10.25); else clk.hour = 10.25; }
              if (window.FCOVE_PANEL) window.FCOVE_PANEL.setTide('live');
              if (typeof FCOVE_SCENE !== 'undefined' && FCOVE_SCENE.syncFleetsForDay) FCOVE_SCENE.syncFleetsForDay(67);
              if (window.FCOVE_PANEL) window.FCOVE_PANEL.paint();
              if (typeof TICKS !== 'undefined' && TICKS) TICKS.forEach(fn => { try { fn(0.016, 0); } catch (e) {} });
              if (typeof SKY !== 'undefined' && SKY.view) SKY.view();
            }""")
            await pg.evaluate("() => KHOST.go('double-dark-moot-fleets')")
            await pg.wait_for_timeout(450)
            fp_neap = os.path.join(a.p4p5_shots, 'fcove_p5_neap_anchorage.png')
            await pg.screenshot(path=fp_neap)
            print('shot', fp_neap)

            # 4: P5 Double Dark Great Careening Moot (Day 91 sunlit 09:35, all 5/5 fleets = 36 hulls, 2,480 Moot Pop)
            await pg.evaluate("""() => {
              const clk = window.KHOST && window.KHOST.host ? window.KHOST.host.clock : null;
              if (clk) { clk.day = 90; if (clk.set) clk.set(9.6); else clk.hour = 9.6; }
              if (window.FCOVE_PANEL) window.FCOVE_PANEL.setTide('live');
              if (typeof FCOVE_SCENE !== 'undefined' && FCOVE_SCENE.syncFleetsForDay) FCOVE_SCENE.syncFleetsForDay(90);
              if (window.FCOVE_PANEL) window.FCOVE_PANEL.paint();
              if (typeof TICKS !== 'undefined' && TICKS) TICKS.forEach(fn => { try { fn(0.016, 0); } catch (e) {} });
              if (typeof SKY !== 'undefined' && SKY.view) SKY.view();
            }""")
            await pg.evaluate("() => KHOST.go('double-dark-moot-fleets')")
            await pg.wait_for_timeout(450)
            fp_moot = os.path.join(a.p4p5_shots, 'fcove_p5_double_dark_moot_fleets.png')
            await pg.screenshot(path=fp_moot)
            print('shot', fp_moot)

        e2 = await pg.evaluate("document.getElementById('errs') ? document.getElementById('errs').textContent : ''")
        if e2.strip() and e2 != e:
            print('ERROR PANEL after views:', e2)
            bad = True
        if bad:
            fails.append('fleetborn-cove checks (error panel, page errors or an assert)')
    return V.exit()


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('html', nargs='?', default=os.path.join(HERE, 'dist', 'fleetborn-cove.html'))
    ap.add_argument('--assert', dest='assert_', action='store_true')
    ap.add_argument('--all-views', action='store_true')
    ap.add_argument('--compare-tides', action='store_true')
    ap.add_argument('--views', default='')
    ap.add_argument('--tide', default='')
    ap.add_argument('--tide-cmd', default='')
    ap.add_argument('--p4p5-shots', default='')
    ap.add_argument('--out', default=os.path.join(HERE, 'shots'))
    ap.add_argument('--size', default='1280x800')
    sys.exit(asyncio.run(run(ap.parse_args())))
