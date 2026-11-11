#!/usr/bin/env python3
"""What every page on the building-kit engine draws (core/engine/README.md, "Changing it").

    python3 core/engine/fingerprint.py            # compare every page with fingerprint.json; exit 1 on a difference
    python3 core/engine/fingerprint.py --write    # record the pages as they are now
    python3 core/engine/fingerprint.py islanders  # one page

A page's fingerprint, read from the built page with the clock pinned (?t=4): the registry (REG, 36-def.js) as a hash of
every placement record's fields (key, class, kind, tags, place, variant, box, triangles, doors, front), and the scene as a
hash of every drawn object's material key (the MAT entry it draws with), world matrix and vertex data (positions,
normals, uvs, colours, index, instance matrices). A change to the engine that moves no building and no material leaves
the fingerprint the same, while the hash baseline (tools/port_baseline.py) changes with any byte of the page.
Rebuild the pages first (each kit's build.py): this reads them, it does not build them.
"""
import asyncio, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
OUT = os.path.join(HERE, 'fingerprint.json')
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import harness  # noqa: E402

PAGES = {
    'scyvoi': 'kits/scyvoi/dist/scyvoi.html',
    'ash-nomads': 'kits/ash-nomads/dist/ash-nomads.html',
    'desert-nomads': 'kits/desert-nomads/dist/desert-nomads.html',
    'eternian': 'kits/eternian/dist/eternian.html',
    'islanders': 'kits/islanders/dist/islanders.html',
    'lizardmen': 'kits/lizardmen/dist/lizardmen.html',
    'yeti': 'kits/yeti/dist/yeti.html',
    'resources': 'kits/resources/dist/resources.html',
    'noahs-regret': 'settlements/noahs-regret/dist/noahs-regret.html',
}
QUERY = '?t=4'
JS = r"""() => {
 const fnv = (h, s) => { for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h; };
 const r5 = x => typeof x === 'number' ? Math.round(x * 1e5) / 1e5 : x;
 const pick = (o, ks) => o ? ks.map(k => r5(o[k])) : null;
 if (typeof REG === 'undefined' || typeof scene === 'undefined') return null;
 let rh = 2166136261 >>> 0;
 for (const r of REG) rh = fnv(rh, JSON.stringify([r.key, r.name, r.cls, r.kind, r.tags, pick(r, ['x', 'y', 'z', 'ry', 'v', 'tris', 'doorCount', 'r', 'h']),
   r.decl, r.bbox ? [pick(r.bbox.min, ['x', 'y', 'z']), pick(r.bbox.max, ['x', 'y', 'z'])] : null, r.front ? [r.front.source, pick(r.front.world, ['x', 'y', 'z', 'yaw'])] : null,
   r.parent ? r.parent.key : null, r.children.length]));
 const inv = new Map(); if (typeof MAT !== 'undefined') for (const k of Object.keys(MAT)) if (MAT[k] && !inv.has(MAT[k])) inv.set(MAT[k], k);
 const mkey = m => inv.has(m) ? inv.get(m) : m.type + ':' + (m.color ? m.color.getHexString() : '') + ':' + (m.map ? 'map' : '');
 const hbuf = (h, a) => { const u = new Uint8Array(a.buffer, a.byteOffset, a.byteLength); for (let i = 0; i < u.length; i++) { h ^= u[i]; h = Math.imul(h, 16777619) >>> 0; } return h; };
 scene.updateMatrixWorld(true);
 let gh = 2166136261 >>> 0, objects = 0, tris = 0; const byMat = {};
 scene.traverse(o => { if (!(o.isMesh || o.isPoints || o.isLine || o.isSprite)) return; objects++;
   const mats = Array.isArray(o.material) ? o.material : [o.material], k = mats.map(mkey).join('|');
   gh = fnv(gh, o.type + '|' + k + '|' + (o.visible ? 1 : 0) + '|' + Array.from(o.matrixWorld.elements, r5).join(','));
   const g = o.geometry; if (!g || !g.attributes) return;
   for (const n of Object.keys(g.attributes).sort()) { gh = fnv(gh, n); gh = hbuf(gh, g.attributes[n].array); }
   if (g.index) gh = hbuf(gh, g.index.array);
   if (o.isInstancedMesh) { gh = fnv(gh, 'inst' + o.count); gh = hbuf(gh, o.instanceMatrix.array); }
   if (o.isMesh && g.attributes.position) { const t = (g.index ? g.index.count : g.attributes.position.count) / 3 * (o.isInstancedMesh ? o.count : 1);
     tris += t; byMat[k] = (byMat[k] || 0) + Math.round(t); } });
 return { records: REG.length, registry: rh.toString(16), objects, tris: Math.round(tris), scene: gh.toString(16), trisByMaterial: byMat,
          errors: (document.getElementById('errs') || {}).textContent || '' };
}"""


async def run(names):
    from playwright.async_api import async_playwright
    out = {}
    async with async_playwright() as p:
        br = await harness.launch_chromium(p)
        with harness.serve(ROOT) as port:
            for n in names:
                pg, errs, ready = await harness.open_page(br, os.path.join(ROOT, PAGES[n]), port, size='640x400', root=ROOT, query=QUERY)
                fp = await pg.evaluate(JS) if ready else None
                if errs or not ready:
                    fp = dict(fp or {}, pageErrors=errs[:5], ready=ready)
                out[n] = fp
                print(n, json.dumps({k: v for k, v in (fp or {}).items() if k != 'trisByMaterial'}), flush=True)
                await pg.close()
        await br.close()
    return out


def main():
    names = [a for a in sys.argv[1:] if not a.startswith('--')] or list(PAGES)
    got = asyncio.run(run(names))
    if '--write' in sys.argv:
        old = json.load(open(OUT, encoding='utf-8')) if os.path.exists(OUT) else {}
        old.update(got)
        with open(OUT, 'w', encoding='utf-8', newline='\n') as fh:
            json.dump(old, fh, indent=1, sort_keys=True)
        print('wrote', os.path.relpath(OUT, ROOT).replace(os.sep, '/'))
        return 0
    want = json.load(open(OUT, encoding='utf-8'))
    bad = 0
    for n, fp in got.items():
        ok = want.get(n) == fp
        bad += not ok
        print(('same    ' if ok else 'DIFFERS ') + n)
        if not ok and want.get(n) and fp:
            for k in sorted(set(want[n]) | set(fp)):
                if want[n].get(k) != fp.get(k):
                    a, b = want[n].get(k), fp.get(k)
                    if isinstance(a, dict) and isinstance(b, dict):
                        print('   %s: %s' % (k, {m: (a.get(m), b.get(m)) for m in sorted(set(a) | set(b)) if a.get(m) != b.get(m)}))
                    else:
                        print('   %s: %s -> %s' % (k, a, b))
    print('%d pages, %d differ' % (len(got), bad))
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main())
