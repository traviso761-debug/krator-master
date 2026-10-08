#!/usr/bin/env python3
"""The cross-build geometry report (ROADMAP.md stage 1): every page's draw calls, triangles, meshes, instanced sets,
instances, materials and furniture at its opening view, with core/lod off and on where the page takes it, in one table.
Each build used to record these by hand in its README; this collects them so a regression shows across builds.

    python3 tools/geometry_report.py                    # every page in PORT-BASELINE.json (slow under software GL)
    python3 tools/geometry_report.py settlements/voth/voth.html biomes/rift/dist/rift.html    # some pages
    python3 tools/geometry_report.py --critical         # the nightly set (tools/test_all.py NIGHTLY_VERIFY)

Writes GEOMETRY.md (the table) and geometry.json (the numbers, for diffs) at the repo root; with page arguments it
updates only those rows. Numbers are from headless Chromium on SwiftShader at 1280x800, the page's opening view after
it reports ready: they compare builds and commits, not frame times on a GPU.
"""
import asyncio, json, os, sys, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
from harness import launch_chromium, serve, open_page   # noqa: E402

OUT_JSON = os.path.join(ROOT, 'geometry.json')
OUT_MD = os.path.join(ROOT, 'GEOMETRY.md')
CENSUS_JS = r"""()=>{
 if(typeof scene==='undefined'||typeof renderer==='undefined') return null;
 const r={meshes:0,instSets:0,instances:0,sceneTris:0,furnTris:0,materials:0};const mats=new Set();
 scene.traverse(o=>{ if(!o.isMesh||(o.userData&&o.userData.lodCopy)) return; const g=o.geometry; if(!g||!g.attributes||!g.attributes.position) return;
  const t=(g.index?g.index.count:g.attributes.position.count)/3; const n=o.isInstancedMesh?o.count:1;
  r.meshes++; if(o.isInstancedMesh){r.instSets++;r.instances+=o.count;} r.sceneTris+=t*n;
  let f=false;for(let p=o;p;p=p.parent)if(p.userData&&p.userData.furniture){f=true;break;} if(f) r.furnTris+=t*n;
  (Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m&&mats.add(m.uuid)); });
 r.materials=mats.size; r.sceneTris=Math.round(r.sceneTris); r.furnTris=Math.round(r.furnTris);
 renderer.render(scene,camera); r.calls=renderer.info.render.calls; r.tris=renderer.info.render.triangles;
 if(window.LOD&&LOD.measure){ try{ const m=LOD.measure(2); r.lodOff={calls:m.off.calls,tris:m.off.tris}; r.lodOn={calls:m.on.calls,tris:m.on.tris}; }catch(e){} }
 return r; }"""


def pages_from_baseline():
    return sorted(json.load(open(os.path.join(ROOT, 'PORT-BASELINE.json'), encoding='utf-8'))['pages'])


async def measure(pages):
    from playwright.async_api import async_playwright
    out = {}
    async with async_playwright() as p:
        b = await launch_chromium(p)
        with serve(ROOT) as port:
            for html in pages:
                t = time.time()
                try:
                    pg, errs, ready = await open_page(b, os.path.join(ROOT, html), port, root=ROOT)
                    await pg.wait_for_timeout(2000)
                    r = await pg.evaluate(CENSUS_JS) if ready else None
                    await pg.close()
                except Exception as e:
                    r, errs, ready = None, [str(e).splitlines()[0]], False
                rec = dict(r or {}, ready=ready, seconds=round(time.time() - t), errors=len(errs))
                out[html] = rec
                print('%-55s %s' % (html, json.dumps(rec)), flush=True)
        await b.close()
    return out


def fmt(n):
    if n is None:
        return ''
    return '%.2f M' % (n / 1e6) if n >= 1e6 else ('%.0f k' % (n / 1e3) if n >= 1e4 else str(n))


def write(data):
    json.dump(data, open(OUT_JSON, 'w', encoding='utf-8', newline='\n'), indent=1, sort_keys=True)
    rows = ['# Krator: geometry report', '',
            '*Written by `tools/geometry_report.py`. Do not edit; rerun it. Opening view, headless Chromium (SwiftShader), '
            '1280x800. "LOD off / on" is `LOD.measure()` where the page takes core/lod.*', '',
            '| Page | Draw calls | Triangles drawn | LOD off: calls / tris | LOD on: calls / tris | Scene triangles | '
            'Furniture tris | Meshes | Instanced sets | Instances | Materials |',
            '|---|---|---|---|---|---|---|---|---|---|---|']
    for page in sorted(data):
        r = data[page]
        if not r.get('ready') or r.get('calls') is None:
            rows.append('| `%s` | not ready |  |  |  |  |  |  |  |  |  |' % page)
            continue
        lo, ln = r.get('lodOff'), r.get('lodOn')
        rows.append('| `%s` | %s | %s | %s | %s | %s | %s | %s | %s | %s | %s |' % (
            page, r['calls'], fmt(r['tris']), '%s / %s' % (lo['calls'], fmt(lo['tris'])) if lo else '',
            '%s / %s' % (ln['calls'], fmt(ln['tris'])) if ln else '', fmt(r['sceneTris']), fmt(r['furnTris']) if r['furnTris'] else '',
            r['meshes'], r['instSets'], fmt(r['instances']), r['materials']))
    open(OUT_MD, 'w', encoding='utf-8', newline='\n').write('\n'.join(rows) + '\n')


def main(argv):
    if '--critical' in argv:
        import test_all
        pages = [os.path.join(b, p).replace(os.sep, '/') for b, p, _ in test_all.NIGHTLY_VERIFY]
    else:
        pages = [a for a in argv if not a.startswith('--')] or pages_from_baseline()
    data = json.load(open(OUT_JSON, encoding='utf-8')) if os.path.isfile(OUT_JSON) else {}
    data.update(asyncio.run(measure(pages)))
    write(data)
    print('wrote GEOMETRY.md and geometry.json: %d pages' % len(data))
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
