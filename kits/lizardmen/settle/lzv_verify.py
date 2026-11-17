#!/usr/bin/env python3
"""The shared GPU verify of a Lizardmen village built on kits/lizardmen/settle (core/simulation/PLAN-LIZARDMEN.md step 7).
A town's verify.py is three lines: it imports this and calls main(__file__). Gila's own verify (settlements/gila/verify.py)
is the model: the same asserts, its expectations read from the town's spec (LZV_SPEC.expect, shown on window._lzv):

  the kit's invariants   footprints, heights, NaNs, building types, the core/tags vocabulary, triangle budgets, front doors,
                         catalog furniture keys and counts, caste-sized doors, life records, library materials
  lzv-laid               the rhombic squared-spiral street (75 / 105 degree corners, each winding 1.25 times the last, every
                         spiral door facing the nest hall), the nest hall, the wells, the spiral's dwellings and the spec's
                         keys (expect.keys) all placed with no error
  on-the-model           at the pin the drawn ground agrees with the model's bicubic height within 3 m; KDRAWN agrees with
                         terrainH to 1 mm
  people                 residents counted from the placed dwellings within 15 % of the spec's number (a budget), every caste
  water-on-core          the lake or sea on WATER.open where the town has one; the wells (and tank, pans) on WATER.still
  ley-aims               the ley stone aims at its cluster's reliquary (< 0.25 degree)
  no-overlap             no two top-level buildings overlap
  on-the-ground          every plinth and floor meets the drawn ground: none floating, none buried
  hamlet                 the outwork laid on core/hamlet's Lizardmen row, every building placed (where the spec has one)
  records-held           the town's records held to LZ_TUNE (people by caste, works by good) and a works placed for each good

    KRATOR_GL=gpu python3 settlements/<town>/verify.py settlements/<town>/dist/<town>.html --assert --views "Overview,The nest hall"
"""
import argparse, asyncio, json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import harness                                      # noqa: E402
from harness import parse_views, verify_page        # noqa: E402
try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

ASSERT_JS = r"""() => {
  const A = window._api, G = window._lzv || {}, X = G.expect || {}, R = [];
  const top = A.REG.filter(r => !r.parent);
  const F = A.footprints().map((f, i) => { const r = top[i], ry = r ? r.ry : 0, c = Math.abs(Math.cos(ry)), s = Math.abs(Math.sin(ry)), ew = f.w * c + f.d * s, ed = f.w * s + f.d * c;
    return Object.assign({}, f, { ew: +ew.toFixed(2), ed: +ed.toFixed(2), rex: +Math.max(0, f.bw - ew).toFixed(2), rez: +Math.max(0, f.bd - ed).toFixed(2) }); });
  const over = F.filter(f => f.rex > 1.6 || f.rez > 1.6);
  R.push({ name: 'inside-declared-footprint', ok: !over.length, detail: over.length ? over.map(f => `${f.key} ${f.bw}x${f.bd} vs ${f.ew}x${f.ed}`).join(' | ') : F.length + ' sites within their rotated footprint + 1.6 m' });
  const hh = F.filter(f => f.eh > 1.5);
  R.push({ name: 'inside-declared-height', ok: !hh.length, detail: hh.length ? hh.map(f => `${f.key} h ${f.bh} vs ${f.h}`).join(' | ') : 'ok' });
  R.push({ name: 'no-nan', ok: A.nanSweep() === 0, detail: 'nan meshes: ' + A.nanSweep() });
  const bad = Object.keys(A.DEFS).filter(k => A.DEFS[k].cls === 'building' && !(A.DEFS[k].tags.types || []).length);
  R.push({ name: 'buildings-typed', ok: !bad.length, detail: bad.length ? bad.join(', ') : 'every building def has culture and types' });
  const T = A.tags().audit;
  R.push({ name: 'tags-vocabulary', ok: T.unknown === 0 && T.missingCulture === 0 && T.missingTypes === 0, detail: T.records + ' records, unknown ' + T.unknown + (T.unknown ? ' ' + JSON.stringify(T.unknownValues) + JSON.stringify(T.unknownKeys) : '') });
  const heavy = F.filter(f => f.tris > (f.budget || 120000));
  R.push({ name: 'triangle-budget', ok: !heavy.length, detail: heavy.length ? heavy.map(f => f.key + ' ' + f.tris + ' > ' + f.budget).join(' | ') : 'heaviest ' + Math.max(...F.map(f => f.tris)) });
  const nf = A.doors().filter(d => !d.front || ![d.front.local.x, d.front.local.z, d.front.local.yaw].every(isFinite) || d.front.source === 'default');
  R.push({ name: 'front-door', ok: !nf.length, detail: nf.length ? nf.map(d => d.key + ' (' + (d.front && d.front.source) + ')').join(', ') : A.doors().length + ' top-level sites carry a declared or door() front' });
  const fu = A.furniture(), miss = Object.keys(fu.missing);
  R.push({ name: 'furniture-keys', ok: !miss.length, detail: miss.length ? 'missing catalog keys: ' + miss.join(', ') : fu.placed + ' pieces from ' + fu.keys + ' catalog keys' });
  const bare = fu.perSite.filter(s => A.DEFS[s.key].cut && s.pieces < 4);
  R.push({ name: 'buildings-furnished', ok: !bare.length, detail: bare.length ? bare.slice(0, 8).map(s => s.key + ' ' + s.pieces).join(', ') : 'every cut-away building has 4+ catalog pieces' });
  const nc = Object.keys(A.DEFS).filter(k => A.DEFS[k].cls === 'building' && !(A.DEFS[k].caste >= 1 && A.DEFS[k].caste <= 6 || A.DEFS[k].caste === 'all'));
  R.push({ name: 'caste-sized', ok: !nc.length, detail: nc.length ? nc.join(', ') : 'every building def declares its caste' });
  const life = A.REG.filter(r => r.cls === 'life'), nol = life.filter(r => !A.SV_LIFE.some(l => l.id === r.tid));
  R.push({ name: 'life-records', ok: !nol.length && (life.length > 0 || X.noLife), detail: nol.length ? nol.map(r => r.key).join(', ') : life.length + ' beasts with life records' });
  const M = A.materials();
  R.push({ name: 'material-records', ok: !!(M && M.records && M.records.length > 15), detail: M ? M.records.length + ' records' : 'none' });

  /* the village's own */
  const sp = G.spiral || {}, ang = sp.cornerAnglesDeg || [], wd = sp.windingDepths || [], K = G.byKind || {}, P = G.placed || {};
  const angOk = ang.length >= 4 * (sp.windings || 5) && ang.every(a => Math.abs(a - 75) < 0.5 || Math.abs(a - 105) < 0.5);
  const ratOk = wd.length === (sp.windings || 5) && Math.abs(wd[0] - (sp.depth0 || 36)) < 1 && wd.slice(1).every((d, i) => Math.abs(d / wd[i] - 1.25) < 0.02);
  const missK = (X.keys || []).filter(k => !P[k]);
  R.push({ name: 'lzv-laid', ok: !G.err && sp.blocks === 4 * (sp.windings || 5) && angOk && ratOk && sp.inwardBad === 0 && K.nest === 1 && (K.well || 0) >= (X.wells || 12) && (K.spiral || 0) >= (X.spiral || 60) && !missK.length,
    detail: G.err ? 'error: ' + G.err : (G.name + ': ' + G.sites + ' sites (' + JSON.stringify(K) + '); depths ' + wd.join(' -> ') + ' m; inwardBad ' + sp.inwardBad + (missK.length ? '; MISSING ' + missK.join(', ') : '')) });
  const pin = G.pin || {}, cmp = KDRAWN.compare(terrainH, [[0, 0], [180, -120], [-240, 160], [600, 300], [-900, -700]]);
  R.push({ name: 'on-the-model', ok: Math.abs((pin.drawn || 0) - (pin.model || 0)) < 3 && cmp.max < 0.001, detail: 'pin model ' + pin.model + ' m, drawn ' + pin.drawn + ' m, KDRAWN vs terrainH max ' + cmp.max.toFixed(5) + ' m' });
  const pp = G.people || {}, bc = pp.byCaste || {}, want = X.people || 3000;
  R.push({ name: 'people', ok: Math.abs((pp.total || 0) - want) <= 0.15 * want && [1, 2, 3, 4, 5, 6].every(c => (bc[c] || 0) > 0), budget: true,
    detail: 'total ' + pp.total + ' / ' + want + ' (spiral ' + pp.spiral + ', outwork ' + pp.hamlet + '); by caste ' + JSON.stringify(bc) });
  const W = G.water || {};
  R.push({ name: 'water-on-core', ok: !!((X.lake ? W.lake : true) && W.wells >= (X.wells || 12) && typeof WATER !== 'undefined' && WATER.still), detail: 'lake/sea ' + (W.lake ? 'open' : (X.lake ? 'MISSING' : 'none (no water body)')) + ', wells ' + W.wells + ', tanks ' + W.tanks + ', pans ' + W.pans + ' (' + W.stills + ' still records)' });
  const ly = G.ley || {};
  R.push({ name: 'ley-aims', ok: !!ly.ok, detail: ly.none ? 'no ley line on this page' : 'aim error ' + ly.errDeg + ' deg at ' + ly.name + ', ' + ly.distM + ' m off' });
  R.push({ name: 'no-overlap', ok: G.overlapPairs === 0, detail: G.overlapPairs + ' overlapping top-level building pairs' });
  const gr = G.ground || { floating: ['unrun'], buried: [] };
  R.push({ name: 'on-the-ground', ok: gr.checked > 50 && !gr.floating.length && !gr.buried.length, detail: gr.checked + ' plinths, floating ' + gr.floating.length + ' ' + gr.floating.slice(0, 4).join(' ') + ', buried ' + gr.buried.length + ' ' + gr.buried.slice(0, 4).join(' ') });
  if (X.hamlet) { const h = G.hamlet || {}; R.push({ name: 'hamlet', ok: !h.error && h.records >= 6 && h.placed === h.records, detail: h.error ? h.error : (h.id + ': ' + h.placed + '/' + h.records + ' buildings placed, census ' + (h.census && h.census.pop)) }); }
  const rc = G.records || {};
  R.push({ name: 'records-held', ok: !!rc.ok, detail: rc.ok ? 'the records hold to LZ_TUNE: people by caste, works by good, a works placed for each' : (rc.problems || []).join('; ') });
  return R;
}"""


async def run(a, here, label):
    os.makedirs(a.out, exist_ok=True)
    bad = False
    async with verify_page(a.html, here=here, size=a.size, query='?t=4', settle_ms=0, checks=harness.SURVEY) as V:
        pg, fails = V.page, V.fails
        if not V.ready:
            print('never ready'); fails.append('build timeout')
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
        if a.eval:
            print(json.dumps(await pg.evaluate(a.eval), indent=1)[:6000])
        all_v = await pg.evaluate("Object.keys(VIEWS)")
        views = all_v if a.all_views else parse_views(a.views, all_v)
        for i, vn in enumerate(views):
            if not await pg.evaluate("n=>{if(!VIEWS[n])return false;setView(...VIEWS[n]);return true;}", vn):
                print('no view', vn); continue
            await pg.wait_for_timeout(900)
            fn = os.path.join(a.out, ('%02d-' % i) + ''.join(c if c.isalnum() else '_' for c in vn)[:44] + '.png')
            await V.shot(fn, view=vn); print('shot', fn)
        e2 = await pg.evaluate("document.getElementById('errs').textContent")
        if e2.strip() and e2 != e:
            print('ERROR PANEL after views:', e2); bad = True
        if bad:
            fails.append(label + ' checks (error panel, page errors or an assert)')
    return V.exit()


def main(verify_file):
    here = os.path.dirname(os.path.abspath(verify_file))
    ap = argparse.ArgumentParser()
    ap.add_argument('html'); ap.add_argument('--views', default=''); ap.add_argument('--all-views', action='store_true')
    ap.add_argument('--eval'); ap.add_argument('--assert', dest='assert_', action='store_true')
    ap.add_argument('--out', default=os.path.join(here, 'shots')); ap.add_argument('--size', default='1280x800')
    sys.exit(asyncio.run(run(ap.parse_args(), here, os.path.basename(here))))
