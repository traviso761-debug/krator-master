#!/usr/bin/env python3
"""Headless GPU verification of Basilisk, the Lizardmen's stone capital at the eastern sea (PLAN.md section 7, step B3).

    KRATOR_GL=gpu python3 settlements/basilisk/verify.py settlements/basilisk/dist/basilisk.html --assert --all-views
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
  const A = window._api, B = window._basilisk || {}, R = [];
  const topRegs = A.REG.filter(r => !r.parent);
  const F = A.footprints().map((f, i) => {
    const r = topRegs[i], ry = r ? r.ry : 0, c = Math.abs(Math.cos(ry)), s = Math.abs(Math.sin(ry));
    const ew = f.w * c + f.d * s, ed = f.w * s + f.d * c;
    return Object.assign({}, f, { ew: +ew.toFixed(2), ed: +ed.toFixed(2), rex: +Math.max(0, f.bw - ew).toFixed(2), rez: +Math.max(0, f.bd - ed).toFixed(2) });
  });
  const over = F.filter(f => f.rex > 1.6 || f.rez > 1.6);
  R.push({ name: 'inside-declared-footprint', ok: !over.length,
    detail: over.length ? over.slice(0, 6).map(f => `${f.key} ${f.bw}x${f.bd} vs ${f.ew}x${f.ed}`).join(' | ') : F.length + ' sites within their rotated footprint + 1.6 m' });
  const hh = F.filter(f => f.eh > 1.5);
  R.push({ name: 'inside-declared-height', ok: !hh.length,
    detail: hh.length ? hh.slice(0, 6).map(f => `${f.key} h ${f.bh} vs ${f.h}`).join(' | ') : 'ok' });
  R.push({ name: 'no-nan', ok: A.nanSweep() === 0, detail: 'nan meshes: ' + A.nanSweep() });
  const bad = Object.keys(A.DEFS).filter(k => A.DEFS[k].cls === 'building' && !(A.DEFS[k].tags.types || []).length);
  R.push({ name: 'buildings-typed', ok: !bad.length, detail: bad.length ? bad.join(', ') : 'every building def has culture and types' });
  const T = A.tags().audit;
  R.push({ name: 'tags-vocabulary', ok: T.unknown === 0 && T.missingCulture === 0 && T.missingTypes === 0,
    detail: T.records + ' records, unknown ' + T.unknown + (T.unknown ? ' ' + JSON.stringify(T.unknownValues) + JSON.stringify(T.unknownKeys) : '') });

  /* Vessel tag invariant (owner rule 2026-11-17: all barges and boats carry cls vessel) */
  const vDefs = Object.keys(A.DEFS).filter(k => A.DEFS[k].cls === 'vessel');
  const badV = vDefs.filter(k => { const tg = A.DEFS[k].tags || {}; return !(tg.types && tg.types.length && tg.propulsion && tg.hull && tg.wealth && tg.crew && tg.role); });
  const vRegs = A.REG.filter(r => r.cls === 'vessel' || /barge|boat/.test(r.key));
  const badVes = vRegs.filter(r => r.cls !== 'vessel' || !r.tid || r.tid.indexOf('ves_') !== 0);
  R.push({ name: 'vessels-tagged', ok: vDefs.length > 0 && vRegs.length >= 6 && !badV.length && !badVes.length,
    detail: badV.length || badVes.length ? 'bad vessel tags/ids: ' + badV.concat(badVes.map(r => r.key + ':' + r.tid)).join(', ') : vDefs.length + ' vessel def(s), ' + vRegs.length + ' reed barges registered as ves_*' });

  const wantCapitalKeys = [
    'lk-greathall', 'lk-college', 'lk-archive', 'lk-nest', 'lk-warren', 'lk-insula', 'lk-terrace', 'lk-kilnhouse', 'lk-makers',
    'lk-guildhall', 'lk-caravanserai', 'lk-rowhouse', 'lk-longhouse', 'lk-bastion', 'lk-lodge', 'lk-tower', 'lk-granary',
    'lk-colossus-watcher', 'lk-statue-phalanx', 'lk-statue-conclave', 'lk-statue-rebirth',
    'lk-colossus-coil', 'lk-statue-ouroboros', 'lk-statue-gyre', 'lk-statue-chronicle',
    'lk-statue-manifold', 'lk-statue-paradox', 'lk-statue-tesseract', 'lk-statue-chorus',
    'lk-planter-helix', 'lk-shrubbery-coil', 'lk-planter-urn',
    'lk-bronzehall', 'lk-dockstore', 'lk-boil', 'lk-gate', 'lk-slot', 'lk-wall', 'lk-watchtower',
    'lz-hall-bronze', 'lz-hall-reed', 'lz-hall-bone', 'lz-bakehouse', 'lz-fermentery', 'lz-warehouse', 'lz-wayhalt', 'lz-waystone',
    'lz-barracks', 'lz-muster', 'lz-seer', 'lz-medicine', 'lz-cistern', 'lz-bells', 'lz-stela-pair', 'lz-stela-turned', 'lz-obelisk',
    'lz-ley', 'lz-weir', 'lz-barge', 'gl-well', 'gl-tank', 'gl-pans', 'gl-saltstore', 'frilled', 'burden'
  ];
  const placedSet = new Set(A.REG.map(r => r.key));
  const missCap = wantCapitalKeys.filter(k => !placedSet.has(k));
  R.push({ name: 'capital-kit-pieces', ok: !missCap.length,
    detail: missCap.length ? 'missing capital pieces: ' + missCap.join(', ') : 'all ' + wantCapitalKeys.length + ' stone capital, works and vessel defs placed' });

  const heavy = F.filter(f => f.tris > (f.budget || 120000));
  R.push({ name: 'triangle-budget', ok: !heavy.length,
    detail: heavy.length ? heavy.map(f => f.key + ' ' + f.tris + ' > ' + f.budget).join(' | ') : 'heaviest ' + Math.max(...F.map(f => f.tris)) });
  const nf = A.doors().filter(d => !d.front || ![d.front.local.x, d.front.local.z, d.front.local.yaw].every(isFinite) || d.front.source === 'default');
  R.push({ name: 'front-door', ok: !nf.length,
    detail: nf.length ? nf.slice(0, 8).map(d => d.key + ' (' + (d.front && d.front.source) + ')').join(', ') : A.doors().length + ' top-level sites carry a declared or door() front' });
  const fu = A.furniture();
  const miss = Object.keys(fu.missing);
  R.push({ name: 'furniture-keys', ok: !miss.length,
    detail: miss.length ? 'missing catalog keys: ' + miss.join(', ') : fu.placed + ' pieces from ' + fu.keys + ' catalog keys' });
  const bare = fu.perSite.filter(s => A.DEFS[s.key].cut && s.pieces < 4);
  R.push({ name: 'buildings-furnished', ok: !bare.length,
    detail: bare.length ? bare.slice(0, 8).map(s => s.key + ' ' + s.pieces).join(', ') : 'every cut-away building has 4+ catalog pieces' });
  const nc = Object.keys(A.DEFS).filter(k => A.DEFS[k].cls === 'building' && !(A.DEFS[k].caste >= 1 && A.DEFS[k].caste <= 6 || A.DEFS[k].caste === 'all'));
  R.push({ name: 'caste-sized', ok: !nc.length, detail: nc.length ? nc.join(', ') : 'every building def declares its caste' });
  const lifeRecs = A.REG.filter(r => r.cls === 'life');
  const nol = lifeRecs.filter(r => !A.SV_LIFE.some(l => l.id === r.tid));
  R.push({ name: 'life-records', ok: !nol.length && lifeRecs.length >= 6,
    detail: nol.length ? nol.map(r => r.key).join(', ') : lifeRecs.length + ' beasts with life records' });
  const M = A.materials();
  R.push({ name: 'material-records', ok: !!(M && M.records && M.records.length > 15),
    detail: M ? M.records.length + ' records' : 'none' });

  /* Basilisk settlement asserts (PLAN.md section 7) */
  const W0 = B.byWhere || {};
  R.push({
    name: 'basilisk-laid',
    ok: !B.err && B.manifestPlaced >= 2180 && (W0.precinct || 0) >= 60 && (W0.d1 || 0) >= 85 && (W0.d7 || 0) >= 340 && (W0.gq || 0) >= 400 && (W0.pans || 0) >= 9,
    detail: B.err ? ('error: ' + B.err) : (B.sites + ' total sites (manifest ' + B.manifestPlaced + '); byWhere ' + JSON.stringify(W0))
  });

  const P = B.pin || {};
  const cmp = KDRAWN.compare(terrainH, [[0, 0], [220, -160], [-1850, 200], [1850, 300], [-300, 1800]]);
  R.push({
    name: 'on-the-model',
    ok: Math.abs((P.model || 0) - (-2600)) < 1.5 && Math.abs((P.mound || 0) - (-2588)) < 0.25 && Math.abs((P.sabkha || 0) - (-2600)) < 1.5 && cmp.max < 0.001,
    detail: 'pin model ' + P.model + ' m, Mound ' + P.mound + ' m (+12 m), sabkha ' + P.sabkha + ' m, KDRAWN vs terrainH max diff ' + cmp.max.toFixed(5) + ' m'
  });

  const pp = B.people || {}, bc = pp.byCaste || {};
  const allCastes = [1, 2, 3, 4, 5, 6].every(c => (bc[c] || 0) > 0);
  R.push({
    name: 'people',
    ok: Math.abs((pp.city || 0) - 30000) <= 0.15 * 30000 && allCastes,
    budget: true,
    detail: 'city ' + pp.city + ' / 30,000 (+ paddy hamlet ' + pp.hamlet + ' = ' + pp.total + '); by caste ' + JSON.stringify(bc)
  });

  const W = B.water || {};
  R.push({
    name: 'water-on-core',
    ok: !!(W.sea && W.dock === 1 && W.reservoirs === 7 && W.tanks === 1 && W.wells >= 135 && W.pans === 3 && W.flows >= 2),
    detail: 'sea ' + (W.sea ? 'open at -2600.5 m' : 'MISSING') + ', dock ' + W.dock + ', reservoirs ' + W.reservoirs + ', tank ' + W.tanks + ', cisterns ' + W.cisterns + ', wells ' + W.wells + ', pans ' + W.pans + ', flows ' + W.flows
  });

  const ly = B.ley || {};
  R.push({
    name: 'ley-aims',
    ok: !!ly.ok,
    detail: 'lz-ley err ' + ly.errDeg + ' deg, Hall of Intention err ' + ly.hallErrDeg + ' deg toward reliquary-east (' + ly.distKm + ' km)'
  });

  const iw = B.inward || {};
  R.push({
    name: 'doors-face-in',
    ok: (iw.checked || 0) >= 600 && iw.bad === 0 && (iw.flaws || 0) >= 8,
    detail: iw.checked + ' inward district dwellings checked (bad ' + iw.bad + '), ' + iw.flaws + ' deliberate outward flaw dwellings'
  });

  R.push({
    name: 'no-overlap',
    ok: B.overlapPairs === 0,
    detail: B.overlapPairs + ' overlapping top-level building/vessel pairs across ' + B.sites + ' sites'
  });

  const gr = B.ground || { floating: ['unrun'], buried: [] };
  R.push({
    name: 'on-the-ground',
    ok: gr.checked >= 2150 && gr.floating.length === 0 && gr.buried.length === 0,
    detail: gr.checked + ' plinths checked, floating ' + gr.floating.length + (gr.floating.length ? ' (' + gr.floating.slice(0, 4).join(', ') + ')' : '') + ', buried ' + gr.buried.length + (gr.buried.length ? ' (' + gr.buried.slice(0, 4).join(', ') + ')' : '')
  });

  const rd = B.roads || { ok: false, siteHits: ['unrun'], furnHits: [] };
  R.push({
    name: 'roads-clear',
    ok: !!rd.ok,
    detail: rd.ok
      ? ('0 site/furniture encroachments across ' + rd.ways + ' ways (' + rd.streetFurn + ' kerbside street-furniture bays)')
      : ('siteHits ' + (rd.siteHits || []).slice(0, 5).join(', ') + ' | furnHits ' + (rd.furnHits || []).slice(0, 5).join(', ') + ' | furn ' + rd.streetFurn)
  });

  const ph = B.paddyHamlet || {};
  R.push({
    name: 'paddy-hamlet',
    ok: !ph.error && ph.records >= 8 && ph.placed === ph.records,
    detail: ph.error ? ph.error : (ph.id + ': ' + ph.placed + '/' + ph.records + ' hamlet buildings placed on southern paddy apron')
  });

  const rc = B.records || {};
  R.push({
    name: 'records-held',
    ok: !!rc.ok,
    detail: rc.ok ? 'BS_REC matches LZ_TUNE (30,000 by caste, 85 t salt, 2,800 t grain, 1,200 t fish)' : (rc.problems || []).join('; ')
  });

  return R;
}"""


async def run(a):
    os.makedirs(a.out, exist_ok=True)
    bad = False
    q = ['t=4']
    async with verify_page(a.html, here=HERE, size=a.size, query='?' + '&'.join(q), settle_ms=0, checks=harness.SURVEY) as V:
        pg, fails = V.page, V.fails
        if not V.ready:
            print('never ready')
            fails.append('build timeout')
        try:
            await pg.wait_for_function("(window._texPending||0)===0", timeout=120000)
        except Exception:
            print('textures still decoding after 120 s')
        await pg.wait_for_timeout(900)
        e = await pg.evaluate("document.getElementById('errs').textContent")
        errs = list(V.errs) + ['console: ' + t for k, t in pg.krator_console if k == 'error']
        print('ERROR PANEL:', e.strip() or '(clean)')
        print('build:', json.dumps(await pg.evaluate("window._build||null")))
        if e.strip() or errs:
            bad = True
        for x in errs[:8]:
            print('pageerror:', x)
        if a.assert_:
            for r in await pg.evaluate(ASSERT_JS):
                print(('PASS ' if r['ok'] else 'FAIL ') + r['name'] + ' - ' + r['detail'][:700])
                bad |= not r['ok']
        if a.cut:
            await pg.evaluate("cutSet(true)")
        if a.night:
            await pg.evaluate("nightSet(true)")
        if a.eval:
            print(json.dumps(await pg.evaluate(a.eval), indent=1)[:6000])
        if a.cam:
            v = [float(t) for t in a.cam.split(',')]
            await pg.evaluate("v=>setView(...v)", v)
            await pg.wait_for_timeout(900)
            await V.shot(os.path.join(a.out, 'cam.png'), view='cam')
            print('shot cam.png')
        all_v = await pg.evaluate("Object.keys(VIEWS)")
        views = all_v if a.all_views else parse_views(a.views, all_v)
        for i, vn in enumerate(views):
            ok = await pg.evaluate("n=>{if(!VIEWS[n])return false;setView(...VIEWS[n]);return true;}", vn)
            if not ok:
                print('no view', vn)
                continue
            await pg.wait_for_timeout(900)
            fn = os.path.join(a.out, ('%02d-' % i) + ''.join(c if c.isalnum() else '_' for c in vn)[:44] + '.png')
            await V.shot(fn, view=vn)
            print('shot', fn)
        e2 = await pg.evaluate("document.getElementById('errs').textContent")
        if e2.strip() and e2 != e:
            print('ERROR PANEL after views:', e2)
            bad = True
        if bad:
            fails.append('basilisk checks (error panel, page errors or an assert)')
    return V.exit()


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('html')
    ap.add_argument('--views', default='')
    ap.add_argument('--all-views', action='store_true')
    ap.add_argument('--cut', action='store_true')
    ap.add_argument('--night', action='store_true')
    ap.add_argument('--cam')
    ap.add_argument('--eval')
    ap.add_argument('--assert', dest='assert_', action='store_true')
    ap.add_argument('--out', default=os.path.join(HERE, 'shots'))
    ap.add_argument('--size', default='1280x800')
    sys.exit(asyncio.run(run(ap.parse_args())))
