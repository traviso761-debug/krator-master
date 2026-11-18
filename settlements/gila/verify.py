#!/usr/bin/env python3
"""Headless GPU verification of Gila, the Lizardmen's salt village on its lake (PLAN.md section 7, steps G1-G5).

    KRATOR_GL=gpu python3 settlements/gila/verify.py settlements/gila/dist/gila.html --assert --views "Overview,The nest hall"

Runs on tools/harness.py with checks=harness.SURVEY (items 22, 27, 28, 30, 31), checking:
  - the Lizardmen kit's invariants on every placed site (footprints, heights, NaNs, types, core/tags vocabulary,
    triangle budgets, front doors, catalog furniture keys and counts, caste-sized doors, life records, library materials);
  - Gila's settlement invariants:
      gila-laid          rhombic squared-spiral street (75 / 105 deg corners, 1.25x windings, 20 blocks, every spiral
                         door facing inward toward the nest hall), nest hall, great tank, wells, craft halls, lookouts,
                         windmills, farms, stone circle and reliquary all placed with no error
      on-the-model       at the pin (px 653,1485) the drawn ground agrees with the model's bicubic height (-1,613.6 m)
                         within 3 m, and KDRAWN agrees with terrainH to 1 mm across the village
      people             residents counted from placed dwellings within 15 % of 3,000 (budget), all six castes housed
      water-on-core      Gila's salt lake on WATER.open at -1,723 m, the brick wells, the great tank and the salt pans'
                         brine on WATER.still
      ley-aims           lz-ley aims straight at the west reliquary (< 0.25 deg), ~3.8 km SW and hidden behind the shoulder
      no-overlap         no two top-level building footprints overlap
      on-the-ground      every building's plinth and floor meet KDRAWN with zero floating or buried corners
      salt-hamlet        the east-shore salt-works camp laid on KHAMLET.village ('lizardmen' row, focus 'salt') with
                         gl-pans and gl-saltstore, none pending
      records-balance    GL_REC's seasonal books balance across all ten goods and Coil Rounds obey intermediate stops
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
  const A = window._api, G = window._gila || {}, R = [];
  const topRegs = A.REG.filter(r => !r.parent);
  const F = A.footprints().map((f, i) => {
    const r = topRegs[i], ry = r ? r.ry : 0, c = Math.abs(Math.cos(ry)), s = Math.abs(Math.sin(ry));
    const ew = f.w * c + f.d * s, ed = f.w * s + f.d * c;
    return Object.assign({}, f, { ew: +ew.toFixed(2), ed: +ed.toFixed(2), rex: +Math.max(0, f.bw - ew).toFixed(2), rez: +Math.max(0, f.bd - ed).toFixed(2) });
  });
  const over = F.filter(f => f.rex > 1.6 || f.rez > 1.6);
  R.push({ name: 'inside-declared-footprint', ok: !over.length,
    detail: over.length ? over.map(f => `${f.key} ${f.bw}x${f.bd} vs ${f.ew}x${f.ed}`).join(' | ') : F.length + ' sites within their rotated footprint + 1.6 m' });
  const hh = F.filter(f => f.eh > 1.5);
  R.push({ name: 'inside-declared-height', ok: !hh.length,
    detail: hh.length ? hh.map(f => `${f.key} h ${f.bh} vs ${f.h}`).join(' | ') : 'ok' });
  R.push({ name: 'no-nan', ok: A.nanSweep() === 0, detail: 'nan meshes: ' + A.nanSweep() });
  const bad = Object.keys(A.DEFS).filter(k => A.DEFS[k].cls === 'building' && !(A.DEFS[k].tags.types || []).length);
  R.push({ name: 'buildings-typed', ok: !bad.length, detail: bad.length ? bad.join(', ') : 'every building def has culture and types' });
  const T = A.tags().audit;
  R.push({ name: 'tags-vocabulary', ok: T.unknown === 0 && T.missingCulture === 0 && T.missingTypes === 0,
    detail: T.records + ' records, unknown ' + T.unknown + (T.unknown ? ' ' + JSON.stringify(T.unknownValues) + JSON.stringify(T.unknownKeys) : '') });
  const wantVillageKeys = [
    'lz-nest', 'lz-warren', 'lz-makers', 'lz-longhouse', 'lz-lodge', 'lz-tower',
    'lz-hall-bronze', 'lz-hall-reed', 'lz-hall-bone', 'lz-bakehouse', 'lz-fermentery', 'lz-granary', 'lz-windmill', 'lz-farm', 'lz-orchard',
    'lz-quarry', 'lz-skimmer', 'lz-waystone', 'lz-barracks', 'lz-muster', 'lz-lookout', 'lz-seer', 'lz-medicine', 'lz-warehouse',
    'lz-stela-pair', 'lz-stela-turned', 'lz-obelisk', 'lz-circle', 'lz-ley', 'lz-bells', 'lz-reliquary',
    'gl-well', 'gl-tank', 'gl-pans', 'gl-saltstore', 'frilled', 'burden'
  ];
  const placedSet = new Set(A.REG.map(r => r.key));
  const missGila = wantVillageKeys.filter(k => !placedSet.has(k));
  R.push({ name: 'gila-kit-pieces', ok: !missGila.length,
    detail: missGila.length ? 'missing village pieces: ' + missGila.join(', ') : 'all ' + wantVillageKeys.length + ' village and Gila works defs placed' });
  const heavy = F.filter(f => f.tris > (f.budget || 120000));
  R.push({ name: 'triangle-budget', ok: !heavy.length,
    detail: heavy.length ? heavy.map(f => f.key + ' ' + f.tris + ' > ' + f.budget).join(' | ') : 'heaviest ' + Math.max(...F.map(f => f.tris)) });
  const nf = A.doors().filter(d => !d.front || ![d.front.local.x, d.front.local.z, d.front.local.yaw].every(isFinite) || d.front.source === 'default');
  R.push({ name: 'front-door', ok: !nf.length,
    detail: nf.length ? nf.map(d => d.key + ' (' + (d.front && d.front.source) + ')').join(', ') : A.doors().length + ' top-level sites carry a declared or door() front' });
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
  R.push({ name: 'life-records', ok: !nol.length && lifeRecs.length > 0,
    detail: nol.length ? nol.map(r => r.key).join(', ') : lifeRecs.length + ' beasts with life records' });
  const M = A.materials();
  R.push({ name: 'material-records', ok: !!(M && M.records && M.records.length > 15),
    detail: M ? M.records.length + ' records' : 'none' });

  /* Gila settlement asserts (PLAN.md section 7) */
  const sp = G.spiral || {}, angs = sp.cornerAnglesDeg || [], wd = sp.windingDepths || [];
  const anglesOk = angs.length >= 20 && angs.every(a => Math.abs(a - 75) < 0.5 || Math.abs(a - 105) < 0.5);
  const ratiosOk = wd.length === 5 && Math.abs(wd[0] - 36) < 1 && wd.slice(1).every((d, i) => Math.abs(d / wd[i] - 1.25) < 0.02);
  const K = G.byKind || {};
  R.push({
    name: 'gila-laid',
    ok: !G.err && sp.blocks === 20 && anglesOk && ratiosOk && sp.inwardBad === 0 &&
        K.nest === 1 && K.tank === 1 && (K.well || 0) >= 15 && (K.spiral || 0) >= 80 && K.reliquary === 1,
    detail: G.err ? ('error: ' + G.err) : (G.sites + ' sites (' + JSON.stringify(K) + '); depths ' + wd.join(' -> ') + ' m; inwardBad ' + sp.inwardBad)
  });

  const P = G.pin || {};
  const cmp = KDRAWN.compare(terrainH, [[0, 0], [180, -120], [-240, 160], [1460, 300], [-2160, 3380]]);
  R.push({
    name: 'on-the-model',
    ok: Math.abs((P.drawn || 0) - (P.model || 0)) < 3 && Math.abs((P.model || 0) - (-1614)) < 5 && cmp.max < 0.001,
    detail: 'pin model ' + P.model + ' m, drawn ' + P.drawn + ' m, KDRAWN vs terrainH max diff ' + cmp.max.toFixed(5) + ' m'
  });

  const pp = G.people || {}, bc = pp.byCaste || {};
  const allCastes = [1, 2, 3, 4, 5, 6].every(c => (bc[c] || 0) > 0);
  R.push({
    name: 'people',
    ok: Math.abs((pp.total || 0) - 3000) <= 0.15 * 3000 && allCastes,
    budget: true,
    detail: 'total ' + pp.total + ' / 3,000 (spiral ' + pp.spiral + ', salt hamlet ' + pp.hamlet + '); by caste ' + JSON.stringify(bc)
  });

  const W = G.water || {};
  R.push({
    name: 'water-on-core',
    ok: !!(W.lake && W.tanks === 1 && W.wells >= 15 && W.pans >= 6 && typeof WATER !== 'undefined' && Math.abs(WATER.heightAt(2200, 1000, 0) - (-1723)) < 0.25),
    detail: 'lake ' + (W.lake ? 'open at -1723 m' : 'MISSING') + ', tank ' + W.tanks + ', wells ' + W.wells + ', pans ' + W.pans + ' (' + W.stills + ' still records)'
  });

  const ly = G.ley || {};
  R.push({
    name: 'ley-aims',
    ok: !!ly.ok,
    detail: 'aim error ' + ly.errDeg + ' deg over ' + ly.distM + ' m; hidden behind shoulder: ' + ly.hiddenBehindShoulder + ' (+' + ly.shoulderClearM + ' m)'
  });

  R.push({
    name: 'no-overlap',
    ok: G.overlapPairs === 0,
    detail: G.overlapPairs + ' overlapping top-level building pairs'
  });

  const gr = G.ground || { floating: ['unrun'], buried: [] };
  R.push({
    name: 'on-the-ground',
    ok: gr.checked > 100 && gr.floating.length === 0 && gr.buried.length === 0,
    detail: gr.checked + ' plinths checked, floating ' + gr.floating.length + ', buried ' + gr.buried.length
  });

  const sh = G.saltHamlet || {};
  R.push({
    name: 'salt-hamlet',
    ok: !sh.error && sh.records >= 14 && sh.placed === sh.records,
    detail: sh.error ? sh.error : (sh.id + ': ' + sh.placed + '/' + sh.records + ' hamlet buildings placed, census ' + (sh.census && sh.census.pop) + ' people')
  });

  const bk = G.books || {};
  R.push({
    name: 'records-balance',
    ok: !!bk.balanced && bk.people === 3000,
    detail: bk.balanced ? ('balanced across ' + Object.keys(bk.byGood || {}).length + ' goods, salt out ' + bk.byGood.salt.allottedOut + ' t, bronze in ' + bk.byGood.bronze.allottedIn + ' t') : (bk.problems || []).join('; ')
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
        await pg.wait_for_timeout(800)
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
            fails.append('gila checks (error panel, page errors or an assert)')
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
