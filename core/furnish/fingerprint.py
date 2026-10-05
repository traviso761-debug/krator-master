#!/usr/bin/env python3
"""The furniture fingerprint of every build that furnishes through the catalog batch (core/furnish/README.md).

    python3 core/furnish/fingerprint.py            # compare every page with fingerprint.json; exit 1 on a difference
    python3 core/furnish/fingerprint.py --write    # record the pages as they are now
    python3 core/furnish/fingerprint.py girder     # one build

A page's fingerprint: the number of placement records and a hash of every record's fields (key, variant, seed,
world and local transform, building, setting), the missing keys, the batch's triangles, and a hash of the
furniture meshes' vertex data, each with the interiors off and on. Moving the glue into core/furnish must leave
every fingerprint identical: the hash baseline (tools/port_baseline.py) changes with the page text, this does not.
"""
import asyncio, functools, glob, http.server, json, os, socketserver, sys, threading

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
OUT = os.path.join(HERE, 'fingerprint.json')
THREE = os.path.join(ROOT, 'kits', 'ancients', 'three.min.js')
GL_ARGS = ["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"]
# build -> (page, the query that turns the interiors on: Girder's are on unless ?interiors=0)
PAGES = {
    'girder': ('settlements/girder/girder.html', ('?interiors=0', '')),
    'mavs-refuge': ('settlements/mavs-refuge/mavs-refuge.html', ('', '?interiors=1')),
    'locus': ('settlements/locus/locus.html', ('', '?interiors=1')),
    'locus-kit': ('settlements/locus/locus-kit.html', ('', '?interiors=1')),
    'abyss-kit': ('settlements/locus/abyss-kit.html', ('', '?interiors=1')),
    'highlands': ('settlements/highlands/dist/highlands.html', ('', '?interiors=1')),
    'roketstad': ('settlements/highlands/dist/roketstad.html', ('', '?interiors=1')),
    'post-apoc': ('kits/post-apoc/dist/post-apoc.html', ('', '?interiors=1')),
}
JS = r"""() => {
 const R = (typeof KFURN_PAGE !== 'undefined' && KFURN_PAGE) || (window.girderFurniture && window.girderFurniture.GFURN) || window._brf || window._locf ||
           (typeof HLF !== 'undefined' && HLF) || (typeof PAF !== 'undefined' && PAF);
 if (!R) return null;
 const fnv = (h, s) => { for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h; };
 const F = ['key','variant','seed','x','y','z','ry','lx','ly','lz','lry','building','setting','part','deferred'];
 let h = 2166136261 >>> 0;
 for (const r of R.placed) h = fnv(h, JSON.stringify(F.map(k => r[k] === undefined ? null : r[k])));
 let gh = 2166136261 >>> 0, tris = 0, meshes = 0;
 if (R.group) R.group.traverse(m => { if (!m.isMesh) return; meshes++; const g = m.geometry;
   tris += (g.index ? g.index.count : g.attributes.position.count) / 3;
   for (const k of ['position', 'normal', 'color']) { const a = g.attributes[k]; if (!a) continue; const u = new Uint8Array(a.array.buffer, a.array.byteOffset, a.array.byteLength);
     for (let i = 0; i < u.length; i += 7) { gh ^= u[i]; gh = Math.imul(gh, 16777619) >>> 0; } }
   if (g.index) { const u = new Uint8Array(g.index.array.buffer, g.index.array.byteOffset, g.index.array.byteLength);
     for (let i = 0; i < u.length; i += 7) { gh ^= u[i]; gh = Math.imul(gh, 16777619) >>> 0; } } });
 const b = R.buildings || [];
 return { placed: R.placed.length, records: h.toString(16), missing: R.missing, batchTris: Math.round(R.batch.tris || 0),
          meshes, groupTris: Math.round(tris), geometry: gh.toString(16), lights: R.lights || 0, interiors: b.length,
          interiorPieces: b.reduce((a, x) => a + (((x.interior || x).pieces) || 0), 0) };
}"""


def chromium():
    c = sorted(glob.glob("/opt/pw-browsers/chromium-*/chrome-linux/chrome"))
    return os.environ.get("KRATOR_CHROME") or (c[-1] if c else None)


async def run(names):
    from playwright.async_api import async_playwright

    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a):
            pass
    srv = socketserver.ThreadingTCPServer(("127.0.0.1", 0), functools.partial(Q, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    out = {}
    async with async_playwright() as p:
        exe = chromium()
        br = await (p.chromium.launch(executable_path=exe, args=GL_ARGS) if exe else p.chromium.launch(args=GL_ARGS))
        for n in names:
            page, (off, on) = PAGES[n]
            out[n] = {}
            for label, q in (('interiors-off', off), ('interiors-on', on)):
                pg = await br.new_page(viewport={"width": 640, "height": 400})
                errs = []
                pg.on("pageerror", lambda e: errs.append(str(e)))
                await pg.route("**/three.min.js", lambda r: asyncio.ensure_future(r.fulfill(path=THREE, content_type="application/javascript")))
                await pg.goto(f"http://127.0.0.1:{srv.server_address[1]}/{page}{q}", timeout=900000)
                await pg.wait_for_function("window._ready===true", timeout=900000)
                fp = await pg.evaluate(JS)
                if errs:
                    fp = dict(fp or {}, pageErrors=errs[:5])
                out[n][label] = fp
                print(n, label, json.dumps(fp), flush=True)
                await pg.close()
        await br.close()
    srv.shutdown()
    return out


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    names = args or list(PAGES)
    got = asyncio.run(run(names))
    if '--write' in sys.argv:
        old = json.load(open(OUT)) if os.path.exists(OUT) else {}
        old.update(got)
        json.dump(old, open(OUT, 'w'), indent=1, sort_keys=True)
        print('wrote', os.path.relpath(OUT, ROOT))
        return
    want = json.load(open(OUT))
    bad = 0
    for n, v in got.items():
        for label, fp in v.items():
            ok = want.get(n, {}).get(label) == fp
            bad += not ok
            print(('same    ' if ok else 'DIFFERS ') + n + ' ' + label)
            if not ok:
                print('   was', json.dumps(want.get(n, {}).get(label)))
    sys.exit(1 if bad else 0)


if __name__ == '__main__':
    main()
