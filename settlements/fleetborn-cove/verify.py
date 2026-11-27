#!/usr/bin/env python3
"""Headless verification & view shooter for Fleetborn Cove (`settlements/fleetborn-cove`).

    python3 settlements/fleetborn-cove/verify.py settlements/fleetborn-cove/dist/fleetborn-cove.html --assert
    python3 settlements/fleetborn-cove/verify.py settlements/fleetborn-cove/dist/fleetborn-cove.html --assert --all-views --out /tmp/fcove-shots
"""
import argparse, asyncio, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'tools'))
import harness                                                  # noqa: E402
from harness import check_profile, parse_views, verify_page     # noqa: E402

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

EXPORT_BOX = [-700, -900, 900, 750]
EXPORT_PROFILE = [
    'registry', 'items', 'buckets', 'materials', 'textures',
    'terrain', 'stage', 'atmos', 'water', 'fixtures',
    'interiors', 'furniture', 'sim',
]

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

  /* Exercise live Tide, Drydock, Dynamic Fleet & P6 Citizen Crowds across Double Dark Moot, Great Ebb, and Neap */
  if (window.FCOVE_PANEL) {
    const scRef = typeof FCOVE_SCENE !== 'undefined' ? FCOVE_SCENE : window.FCOVE_SCENE;
    const lfRef = typeof FCOVE_LIFE !== 'undefined' ? FCOVE_LIFE : window.FCOVE_LIFE;
    const countVis = () => scRef && scRef.fleetGroups
      ? Object.keys(scRef.fleetGroups).filter(k => scRef.fleetGroups[k] && scRef.fleetGroups[k].visible).length
      : -1;

    const stFlood = window.FCOVE_PANEL.setTide('doubleDark').fcove;
    const visMoot = countVis();
    const mootPop = stFlood && stFlood.sim ? stFlood.sim.mootPop : 0;
    const arkFloodY = scRef && scRef.careened.length ? scRef.careened[0].group.position.y : null;
    const audFlood = lfRef ? lfRef.audit() : null;
    const panelEl = document.getElementById('fcove-tide-panel');
    const panelTxt = panelEl ? panelEl.textContent : '';

    const stEbb = window.FCOVE_PANEL.setTide('greatEbb').fcove;
    if (typeof TICKS !== 'undefined' && TICKS) TICKS.forEach(fn => { try { fn(0.016, 0); } catch (e) {} });
    const arkEbbY = scRef && scRef.careened.length ? scRef.careened[0].group.position.y : null;
    const audEbb = lfRef ? lfRef.audit() : null;

    /* Test 12 px hover/click ray-pick on an active careening shipwright at Great Ebb */
    let pickOk = false, pickDetail = 'no poses';
    if (lfRef && lfRef.poses().length > 0) {
      const poses = lfRef.poses();
      const target = poses.find(p => p.cohort === 'careening_crew') || poses[0];
      const testCam = { position: new THREE.Vector3(target.x + 8.0, target.y + 3.2, target.z + 8.0), fov: 52 };
      const aim = new THREE.Vector3(target.x + 0.14, target.y + 0.88, target.z).sub(testCam.position).normalize();
      const picked = A.pickCitizen({ origin: testCam.position, direction: aim }, 12);
      const hitInsp = lfRef.inspectHit({ point: new THREE.Vector3(target.x + 0.12, target.y + 0.85, target.z) }, testCam);
      pickOk = !!(
        picked && picked.citizen && picked.citizen.name &&
        picked.t && picked.t.indexOf('People:') >= 0 && picked.t.indexOf('Dive:') >= 0 && picked.t.indexOf('Task:') >= 0 &&
        picked.rec && hitInsp && hitInsp.citizen && hitInsp.citizen.id === picked.citizen.id
      );
      pickDetail = picked ? (picked.citizen.name + ' (' + picked.citizen.people + ', ' + picked.citizen.diveClass + ')') : 'pick returned null';
    }

    const stNeap = window.FCOVE_PANEL.setTide('neap').fcove;
    if (typeof TICKS !== 'undefined' && TICKS) TICKS.forEach(fn => { try { fn(0.016, 0); } catch (e) {} });
    const visNeap = countVis();
    const neapPop = stNeap && stNeap.sim ? stNeap.sim.mootPop : 0;
    const audNeap = lfRef ? lfRef.audit() : null;

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

    const sFlood = audFlood ? audFlood.summary : null;
    const sEbb = audEbb ? audEbb.summary : null;
    const sNeap = audNeap ? audNeap.summary : null;
    const p6RelocOk = !!(
      audFlood && audFlood.ok && sFlood && sFlood.submergedNonDivers === 0 && sFlood.careeningInPit === 0 && sFlood.byssusOnCauseway === 0 &&
      sFlood.totalActive >= 680 && sFlood.totalActive <= 860 &&
      audEbb && audEbb.ok && sEbb && sEbb.submergedNonDivers === 0 && sEbb.careeningInPit >= 34 && sEbb.byssusOnCauseway >= 22 && sEbb.diversInWater >= 25 &&
      audNeap && audNeap.ok && sNeap && sNeap.submergedNonDivers === 0 && sNeap.byssusOnCauseway === 0 &&
      sNeap.totalActive >= 280 && sNeap.totalActive <= 355 &&
      sFlood.totalActive > sNeap.totalActive * 1.8 &&
      panelTxt.indexOf('Citizens Active:') >= 0 && pickOk
    );
    R.push({
      name: 'p6-tide-citizen-relocation-and-pick',
      ok: p6RelocOk,
      detail: 'mootActive=' + (sFlood && sFlood.totalActive) + ' (pit=' + (sFlood && sFlood.careeningInPit) + ', cwy=' + (sFlood && sFlood.byssusOnCauseway) + ', subm=' + (sFlood && sFlood.submergedNonDivers) + '), ebbPit=' + (sEbb && sEbb.careeningInPit) + ' ebbCwy=' + (sEbb && sEbb.byssusOnCauseway) + ' divers=' + (sEbb && sEbb.diversInWater) + ' (subm=' + (sEbb && sEbb.submergedNonDivers) + '), neapActive=' + (sNeap && sNeap.totalActive) + ', pick=' + pickDetail
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

  /* P7: Exercise EXPORT.world + EXPORT.check + EXPORT.glb binary glTF & JSON manifest */
  if (typeof EXPORT !== 'undefined' && EXPORT && typeof EXPORT.world === 'function') {
    const prof = ['registry', 'items', 'buckets', 'materials', 'textures', 'terrain', 'stage', 'atmos', 'water', 'fixtures', 'interiors', 'furniture', 'sim'];
    const w = EXPORT.world({ box: [-700, -900, 900, 750], build: 'settlements/fleetborn-cove', sky: 64 });
    const chk = EXPORT.check(w, { uid: KTAGS.uid, profile: prof });
    const g = EXPORT.glb(w);
    const bytes = (g && g.glb) ? (g.glb instanceof Uint8Array ? g.glb : (g.glb instanceof ArrayBuffer ? new Uint8Array(g.glb) : null)) : null;
    const dv = (bytes && bytes.byteLength >= 12) ? new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength) : null;
    const magic = dv ? dv.getUint32(0, true) : 0;
    const ver = dv ? dv.getUint32(4, true) : 0;
    const j = g ? g.json : null;
    const tideMeta = j && j.water && j.water.tide ? j.water.tide : null;
    const glbOk = !!(
      chk.ok && (!w.errors || w.errors.length === 0) && chk.problems.length === 0 &&
      dv && magic === 0x46546C67 && ver === 2 && bytes.byteLength > 10000 &&
      j && j.format === 'krator-world' &&
      tideMeta && tideMeta.px === 236 && tideMeta.py === 242 && tideMeta.meanRange === 11 &&
      j.fixtures && j.interiors && j.furniture && j.sim
    );
    R.push({
      name: 'p7-export-world-and-glb-manifest',
      ok: glbOk,
      detail: 'chk.ok=' + chk.ok + ' errs=' + (w.errors ? w.errors.length : -1) + ' probs=' + chk.problems.length +
        ' glbBytes=' + (bytes ? bytes.byteLength : 0) + ' magic=0x' + magic.toString(16) +
        ' tidePx=' + (tideMeta ? (tideMeta.px + ',' + tideMeta.py + '@' + tideMeta.meanRange + 'm') : 'missing') +
        (chk.problems.length ? (' probs:' + chk.problems.slice(0, 4).join('; ')) : '')
    });
  } else {
    R.push({ name: 'p7-export-world-and-glb-manifest', ok: false, detail: 'EXPORT missing' });
  }

  return R;
}"""


async def run(a):
    bad = False
    html_path = a.html or os.path.join(HERE, 'dist', 'fleetborn-cove.html')
    sw = not harness.is_gpu()
    q = ['t=4']
    if a.tide:
        q.append('tide=' + a.tide)
    async with verify_page(html_path, here=HERE, size=a.size, query='?' + '&'.join(q),
                           init=(harness.STAGE_HOOK,), settle_ms=0 if sw else 1500,
                           checks=harness.SURVEY) as V:
        pg, fails = V.page, V.fails
        if not V.ready:
            print('never ready', flush=True)
            fails.append('build timeout')
        try:
            await pg.wait_for_function("(window._texPending||0)===0", timeout=120000)
        except Exception:
            print('textures still decoding after 120 s', flush=True)
        if sw:
            await pg.evaluate(
                "() => { if (!window.__origRAF) {"
                " const _r = window.__origRAF = window.requestAnimationFrame.bind(window);"
                " window.__drawNow = () => new Promise(res => _r(t => { if (window.__frameFn) window.__frameFn(t); _r(() => res()); }));"
                " window.requestAnimationFrame = cb => { window.__frameFn = cb; return 0; };"
                "} }"
            )
            await pg.evaluate("() => window.__drawNow()")
        else:
            await pg.wait_for_timeout(700)

        async def settle_frame(ms=450):
            if sw:
                await pg.evaluate("() => window.__drawNow()")
            else:
                await pg.wait_for_timeout(ms)

        e = await pg.evaluate("document.getElementById('errs') ? document.getElementById('errs').textContent : ''")
        print('ERROR PANEL:', e.strip() or '(clean)', flush=True)
        print('build:', json.dumps(await pg.evaluate("window._build||null")), flush=True)

        errs = list(V.errs) + ['console: ' + t for k, t in pg.krator_console if k == 'error']
        if e.strip() or errs:
            bad = True
        for x in errs[:8]:
            print('pageerror:', x, flush=True)

        if a.assert_:
            for r in await pg.evaluate(ASSERT_JS):
                print(('PASS ' if r['ok'] else 'FAIL ') + r['name'] + ' - ' + str(r.get('detail', ''))[:900], flush=True)
                bad |= not r['ok']
            await settle_frame(200)
            prof_ok, prof_lines = await check_profile(pg, EXPORT_BOX, EXPORT_PROFILE)
            print(('PASS ' if prof_ok else 'FAIL ') + 'export-profile-check - ' + ' | '.join(prof_lines), flush=True)
            bad |= not prof_ok

        if a.tide_cmd:
            await pg.evaluate("c => window.FCOVE_PANEL && window.FCOVE_PANEL.setTide(c)", a.tide_cmd)
            await pg.evaluate("() => { if (typeof TICKS !== 'undefined' && TICKS) TICKS.forEach(fn => { try { fn(0.016, 0); } catch (e) {} }); if (typeof SKY !== 'undefined' && SKY.view) SKY.view(); }")
            await settle_frame(450)

        all_v = await pg.evaluate("() => { try { return Object.keys(VIEWS); } catch (e) { return []; } }")
        views = all_v if a.all_views else (parse_views(a.views, all_v) if a.views else [])
        if views:
            os.makedirs(a.out, exist_ok=True)
            for i, vn in enumerate(views):
                ok = await pg.evaluate("n => KHOST.go(n)", vn)
                if not ok:
                    print('no view', vn, flush=True)
                    continue
                await settle_frame(350)
                fn = os.path.join(a.out, ('%02d-' % i) + ''.join(c if c.isalnum() else '_' for c in vn)[:44] + '.png')
                await V.shot(fn, view=vn)
                print('shot', fn, flush=True)

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
                    await settle_frame(450)
                    fn = os.path.join(a.out, slug)
                    await pg.screenshot(path=fn)
                    print('shot', fn, flush=True)

                await pg.evaluate("""() => {
                  const clk = window.KHOST && window.KHOST.host ? window.KHOST.host.clock : null;
                  if (clk) { clk.day = 90; if (clk.set) clk.set(9.3); else clk.hour = 9.3; }
                  if (window.FCOVE_PANEL) window.FCOVE_PANEL.setTide('live');
                  if (typeof TICKS !== 'undefined' && TICKS) TICKS.forEach(fn => { try { fn(0.016, 0); } catch (e) {} });
                  if (typeof SKY !== 'undefined' && SKY.view) SKY.view();
                }""")
                await settle_frame(250)

        if a.p4p5_shots:
            os.makedirs(a.p4p5_shots, exist_ok=True)
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
                await settle_frame(450)
                fp = os.path.join(a.p4p5_shots, fname)
                await pg.screenshot(path=fp)
                print('shot', fp, flush=True)

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
            await settle_frame(450)
            fp_neap = os.path.join(a.p4p5_shots, 'fcove_p5_neap_anchorage.png')
            await pg.screenshot(path=fp_neap)
            print('shot', fp_neap, flush=True)

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
            await settle_frame(450)
            fp_moot = os.path.join(a.p4p5_shots, 'fcove_p5_double_dark_moot_fleets.png')
            await pg.screenshot(path=fp_moot)
            print('shot', fp_moot, flush=True)

        if a.p6_shots:
            os.makedirs(a.p6_shots, exist_ok=True)
            # 1. Great Ebb Careening Crews around careened 89c Ark-Catamaran on -3 m blocks
            await pg.evaluate("""() => {
              const clk = window.KHOST && window.KHOST.host ? window.KHOST.host.clock : null;
              if (clk) { clk.day = 90; if (clk.set) clk.set(10.3); else clk.hour = 10.3; }
              if (window.FCOVE_PANEL) window.FCOVE_PANEL.setTide('greatEbb', {keepDay: true});
              if (typeof FCOVE_LIFE !== 'undefined' && FCOVE_LIFE) FCOVE_LIFE.update(0.25);
              if (typeof TICKS !== 'undefined' && TICKS) TICKS.forEach(fn => { try { fn(0.016, 0); } catch (e) {} });
              const LY = FCOVE_LAYOUT, c0 = LY.cradles[0];
              const eye = LY.XZ(c0.s - 2, c0.a0 - 18);
              const tgt = LY.XZ(c0.s + 1, c0.a0 + 26);
              if (KHOST && KHOST.cam && KHOST.cam.setView) {
                KHOST.cam.setView(eye[0], 15.5, eye[1], tgt[0], -2.2, tgt[1]);
                if (KHOST.cam.apply) KHOST.cam.apply();
              } else {
                camera.position.set(eye[0], 15.5, eye[1]);
                camera.lookAt(tgt[0], -2.2, tgt[1]);
              }
              if (typeof SKY !== 'undefined' && SKY.view) SKY.view();
            }""")
            await settle_frame(500)
            fp1 = os.path.join(a.p6_shots, 'fcove_p6_careening_crews_ebb.png')
            await pg.screenshot(path=fp1)
            print('shot', fp1, flush=True)

            # 2. Great Ebb White Stacks -6 m Causeway Sea-Byssus Gatherers & Free-Divers
            await pg.evaluate("""() => {
              const LY = FCOVE_LAYOUT, cw = LY.causeway;
              const eye = LY.XZ(cw.s - 28, cw.aStart + 14);
              const tgt = LY.XZ(cw.s + 8, cw.aEnd - 12);
              if (KHOST && KHOST.cam && KHOST.cam.setView) {
                KHOST.cam.setView(eye[0], 4.2, eye[1], tgt[0], -5.2, tgt[1]);
                if (KHOST.cam.apply) KHOST.cam.apply();
              } else {
                camera.position.set(eye[0], 4.2, eye[1]);
                camera.lookAt(tgt[0], -5.2, tgt[1]);
              }
              if (typeof FCOVE_LIFE !== 'undefined' && FCOVE_LIFE) FCOVE_LIFE.update(0.25);
              if (typeof SKY !== 'undefined' && SKY.view) SKY.view();
            }""")
            await settle_frame(500)
            fp2 = os.path.join(a.p6_shots, 'fcove_p6_byssus_gatherers_ebb.png')
            await pg.screenshot(path=fp2)
            print('shot', fp2, flush=True)

            # 3. Double Dark Moot Crowds on Harbour Bench / Client Moot Hall looking NNW toward moored Fleets & Arcoforte
            await pg.evaluate("""() => {
              const clk = window.KHOST && window.KHOST.host ? window.KHOST.host.clock : null;
              if (clk) { clk.day = 90; if (clk.set) clk.set(9.7); else clk.hour = 9.7; }
              if (window.FCOVE_PANEL) window.FCOVE_PANEL.setTide('doubleDark');
              if (clk) { clk.day = 90; if (clk.set) clk.set(9.7); else clk.hour = 9.7; }
              if (typeof FCOVE_SCENE !== 'undefined' && FCOVE_SCENE.syncFleetsForDay) FCOVE_SCENE.syncFleetsForDay(90);
              if (typeof FCOVE_LIFE !== 'undefined' && FCOVE_LIFE) FCOVE_LIFE.update(0.25);
              if (window.FCOVE_PANEL) window.FCOVE_PANEL.paint();
              if (typeof TICKS !== 'undefined' && TICKS) TICKS.forEach(fn => { try { fn(0.016, 0); } catch (e) {} });
              const LY = FCOVE_LAYOUT;
              const eye = LY.XZ(98, LY.quayA(98) + 70);
              const tgt = LY.XZ(42, LY.quayA(42) + 96);
              if (KHOST && KHOST.cam && KHOST.cam.setView) {
                KHOST.cam.setView(eye[0], 22.0, eye[1], tgt[0], 11.5, tgt[1]);
                if (KHOST.cam.apply) KHOST.cam.apply();
              } else {
                camera.position.set(eye[0], 22.0, eye[1]);
                camera.lookAt(tgt[0], 11.5, tgt[1]);
              }
              if (typeof SKY !== 'undefined' && SKY.view) SKY.view();
            }""")
            await settle_frame(500)
            fp3 = os.path.join(a.p6_shots, 'fcove_p6_moot_crowds.png')
            await pg.screenshot(path=fp3)
            print('shot', fp3, flush=True)

            # Restore live morning spring state
            await pg.evaluate("""() => {
              const clk = window.KHOST && window.KHOST.host ? window.KHOST.host.clock : null;
              if (clk) { clk.day = 90; if (clk.set) clk.set(9.3); else clk.hour = 9.3; }
              if (window.FCOVE_PANEL) window.FCOVE_PANEL.setTide('live');
              if (typeof TICKS !== 'undefined' && TICKS) TICKS.forEach(fn => { try { fn(0.016, 0); } catch (e) {} });
              if (typeof SKY !== 'undefined' && SKY.view) SKY.view();
            }""")
            await settle_frame(200)

        e2 = await pg.evaluate("document.getElementById('errs') ? document.getElementById('errs').textContent : ''")
        if e2.strip() and e2 != e:
            print('ERROR PANEL after views:', e2, flush=True)
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
    ap.add_argument('--p6-shots', default='')
    ap.add_argument('--out', default=os.path.join(HERE, 'shots'))
    ap.add_argument('--size', default='1280x800')
    sys.exit(asyncio.run(run(ap.parse_args())))
