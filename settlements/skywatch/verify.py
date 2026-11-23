#!/usr/bin/env python3
"""Headless verification for Skywatch (settlements/skywatch/PLAN.md).

  python3 verify.py dist/skywatch.html --assert [--views "Overview,Observatory crag,..."] [--all-views] [--out shots]

Uses tools/harness.py (verify_page with checks=harness.SURVEY): waits for window._ready and library textures, runs
Skywatch's own layout/placement/tag/solstice/horizon checks and their negative controls (_api.hostChecks,
_api.hostNegatives, _api.solsticeCheck, _api.horizonCheck), captures preset views and eye checks, then runs all
universal asserts (shader programs, samplers, NaN sweep, registered volumes, ruins, KWALK, key map, drawn-ground,
instance cap, and page budget).
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
    R.push({name: 'solstice sightline check', ok: !!s.pass, detail: String(s.detail || '')});
  }
  if (A.horizonCheck) {
    const h = A.horizonCheck();
    R.push({name: '360-deg horizon ring check', ok: !!h.pass, detail: String(h.detail || '')});
  }

  /* Live Three.js 3D scene bounding-box & mesh-socket verification across all curtain walls, towers & gatehouses */
  try {
    const wpList = A.wallPlaced ? A.wallPlaced() : [];
    const mat4 = new THREE.Matrix4();
    const tmpBox = new THREE.Box3();
    const posV = new THREE.Vector3();
    const quatQ = new THREE.Quaternion();
    const sclV = new THREE.Vector3();
    const byId = {};
    const nodes = [];
    const spans = {};
    const bad = [];

    for (const wp of wpList) {
      const worldBox = new THREE.Box3();
      const bodyBox = new THREE.Box3();
      let primCount = 0;
      let coreMat = null;
      let bestVol = 0;

      for (const [kName, i0, i1] of (wp.allSlices || [])) {
        const im = KIT.meshes[kName];
        if (!im || !im.isInstancedMesh || im.parent !== scene) {
          bad.push(wp.id + ':unbaked-kit(' + kName + ')');
          continue;
        }
        if (!im.geometry.boundingBox) im.geometry.computeBoundingBox();
        for (let idx = i0; idx < i1; idx++) {
          im.getMatrixAt(idx, mat4);
          tmpBox.copy(im.geometry.boundingBox).applyMatrix4(mat4);
          worldBox.union(tmpBox);
          primCount++;
        }
      }
      for (const [kName, i0, i1] of (wp.bodySlices || [])) {
        const im = KIT.meshes[kName];
        if (!im || !im.geometry.boundingBox) continue;
        for (let idx = i0; idx < i1; idx++) {
          im.getMatrixAt(idx, mat4);
          tmpBox.copy(im.geometry.boundingBox).applyMatrix4(mat4);
          bodyBox.union(tmpBox);
          if (wp.key === 'jj_wall_seg' && kName === 'jj_box_brick') {
            mat4.decompose(posV, quatQ, sclV);
            const vol = Math.abs(sclV.x * sclV.y * sclV.z);
            if (vol > bestVol) {
              bestVol = vol;
              coreMat = mat4.clone();
            }
          }
        }
      }
      if (wp.group) {
        wp.group.updateMatrixWorld(true);
        wp.group.traverse((m) => {
          if (m.isMesh && m.geometry) {
            if (!m.geometry.boundingBox) m.geometry.computeBoundingBox();
            tmpBox.copy(m.geometry.boundingBox).applyMatrix4(m.matrixWorld);
            worldBox.union(tmpBox);
            bodyBox.union(tmpBox);
            primCount++;
          }
        });
      }
      if (primCount === 0 || worldBox.isEmpty() || bodyBox.isEmpty()) {
        bad.push(wp.id + ':empty-3d-mesh');
      }
      const entry = Object.assign({}, wp, { worldBox, bodyBox, coreMat, primCount });
      byId[wp.id] = entry;
      if (wp.key === 'jj_wall_seg') {
        const si = wp.spanIdx == null ? -1 : wp.spanIdx;
        (spans[si] = spans[si] || []).push(entry);
      } else {
        nodes.push(entry);
      }
    }

    nodes.sort((a, b) => (a.ringIdx == null ? 0 : a.ringIdx) - (b.ringIdx == null ? 0 : b.ringIdx));
    let checked3DEnds = 0;
    let checked3DSeams = 0;

    const verify3DEndSocket = (segE, nodeE) => {
      checked3DEnds++;
      if (!segE.worldBox.intersectsBox(nodeE.worldBox) || !segE.bodyBox.intersectsBox(nodeE.bodyBox)) {
        bad.push(segE.id + '@' + nodeE.id + ':no-3d-box-intersection');
        return;
      }
      const vOv = Math.min(segE.bodyBox.max.y, nodeE.bodyBox.max.y) - Math.max(segE.bodyBox.min.y, nodeE.bodyBox.min.y);
      if (vOv < 8.5) {
        bad.push(segE.id + '@' + nodeE.id + ':low-3d-vert-overlap(' + vOv.toFixed(2) + 'm)');
      }
      const gSeg = SW_GROUND.h(segE.x, segE.z);
      const gNode = SW_GROUND.h(nodeE.x, nodeE.z);
      if (segE.worldBox.min.y > gSeg - 0.4 || nodeE.worldBox.min.y > gNode - 0.4) {
        bad.push(segE.id + '@' + nodeE.id + ':plinth-above-ground');
      }
      if (!segE.coreMat || !nodeE.group) {
        bad.push(segE.id + '@' + nodeE.id + ':missing-core-matrix');
        return;
      }
      nodeE.group.updateMatrixWorld(true);
      const invNode = nodeE.group.matrixWorld.clone().invert();
      const pNeg = new THREE.Vector3(-0.5, 0, 0).applyMatrix4(segE.coreMat);
      const pPos = new THREE.Vector3(0.5, 0, 0).applyMatrix4(segE.coreMat);
      const nodePos = new THREE.Vector3(nodeE.x, segE.y, nodeE.z);
      const ex = pNeg.distanceToSquared(nodePos) <= pPos.distanceToSquared(nodePos) ? -0.5 : 0.5;
      const toNodeLocal = (lx, ly, lz) => new THREE.Vector3(lx, ly, lz).applyMatrix4(segE.coreMat).applyMatrix4(invNode);
      const cMid = toNodeLocal(ex, 0, 0);
      const cOut = toNodeLocal(ex, 0, 0.5);
      const cIn = toNodeLocal(ex, 0, -0.5);

      if (nodeE.key === 'jj_wall_gate') {
        for (const pt of [cMid, cOut, cIn]) {
          const emb = 12.0 - Math.abs(pt.x);
          if (emb < 0.30 || emb > 0.80 || Math.abs(pt.x) < 8.4 || Math.abs(pt.z) > 2.75) {
            bad.push(segE.id + '@' + nodeE.id + ':3d-gate-socket(x=' + pt.x.toFixed(2) + ',z=' + pt.z.toFixed(2) + ')');
            break;
          }
        }
      } else {
        const rWalk = nodeE.key === 'jj_wall_corner' ? 5.35 : 4.38;
        const rMaxCorner = Math.max(Math.hypot(cOut.x, cOut.z), Math.hypot(cIn.x, cIn.z));
        const rMid = Math.hypot(cMid.x, cMid.z);
        if (rWalk - rMaxCorner < 0.30 || rMid < 2.2) {
          bad.push(segE.id + '@' + nodeE.id + ':3d-tower-socket(radEmbed=' + (rWalk - rMaxCorner).toFixed(2) + 'm,rMid=' + rMid.toFixed(2) + 'm)');
        }
      }
    };

    if (nodes.length < 20) {
      bad.push('insufficient-3d-wall-nodes(' + nodes.length + ')');
    } else {
      for (let ni = 0; ni < nodes.length; ni++) {
        const nA = nodes[ni];
        const nB = nodes[(ni + 1) % nodes.length];
        const sList = (spans[ni] || []).slice().sort((a, b) => (a.segIdx || 0) - (b.segIdx || 0));
        if (!sList.length) {
          bad.push('missing-3d-span:' + nA.id + '->' + nB.id);
          continue;
        }
        for (let j = 0; j + 1 < sList.length; j++) {
          checked3DSeams++;
          const a = sList[j], b = sList[j + 1];
          const vSeam = Math.min(a.bodyBox.max.y, b.bodyBox.max.y) - Math.max(a.bodyBox.min.y, b.bodyBox.min.y);
          if (!a.worldBox.intersectsBox(b.worldBox) || !a.bodyBox.intersectsBox(b.bodyBox) || vSeam < 8.0) {
            bad.push(a.id + '->' + b.id + ':3d-seam-gap');
          }
        }
        verify3DEndSocket(sList[0], byId[sList[0].nodeA] || nA);
        verify3DEndSocket(sList[sList.length - 1], byId[sList[sList.length - 1].nodeB] || nB);
      }
    }

    R.push({
      name: '3d scene: every curtain-wall mesh sockets into its guard towers, bastions and gatehouses',
      ok: bad.length === 0 && checked3DEnds >= 60 && wpList.length === SW_LAYOUT.plan.walls.length,
      detail: wpList.length + ' 3D wall groups, ' + checked3DEnds + ' tower/gate mesh sockets & ' +
              checked3DSeams + ' segment seams verified' + (bad.length ? '; bad: ' + bad.slice(0, 5).join(', ') : '')
    });
  } catch (e) {
    R.push({name: '3d scene: curtain-wall mesh socket check', ok: false, detail: String(e && e.stack || e)});
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

        info = await pg.evaluate("() => window._api && window._api.skywatch ? window._api.skywatch() : null")
        print('skywatch:', json.dumps(info), flush=True)

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
                await pg.wait_for_timeout(250)
                slug = ''.join(ch if ch.isalnum() else '_' for ch in vn).strip('_')
                fn = os.path.join(a.out, '%s.png' % slug)
                await V.shot(fn, view=vn)
                print('shot', fn.replace(os.sep, '/'), flush=True)

        if V.samples:
            print('\n--- view render samples (calls, tris) ---', flush=True)
            for name, calls, tris in V.samples:
                print('  %-26s calls=%s  tris=%s' % (name, calls, tris), flush=True)

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
