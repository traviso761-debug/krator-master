#!/usr/bin/env python3
"""Per-view graphic load of built pages, on the GPU the browser renders with (GRAPHIC-LOAD.md, "Commands").

    KRATOR_GL=gpu python3 tools/perf_views.py biomes/rift/dist/rift.html other.html?diet=0 [--views "A|B"] [--frames 15]
                                             [--rounds 2] [--size 1024x768] [--json out.json]

For each page and each preset view (the page's #ui buttons): draw calls, triangles and instances drawn by the world pass
(`renderer.render(scene, camera)`, the sky pass left out), and its GPU time by `EXT_disjoint_timer_query_webgl2`, the
minimum over --frames frames. The timer swings ~25% while other work shares the GPU, so the pages are measured in turn,
--rounds times, and each view keeps its minimum over every round. A page may carry a query (`?diet=0`) for an A/B.
Instances drawn: the sum of `count` over the instanced meshes the renderer submitted (a per-instance cull in the shader
still runs those vertices). Run it under the GPU lock on the arc lane, so its numbers stay comparable: `python3 tools/harness.py lock -- python3 tools/perf_views.py ...`.
"""
import argparse, asyncio, json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import harness

MEASURE_JS = r"""async (frames)=>{
 const R=renderer,gl=R.getContext(),ext=gl.getExtension('EXT_disjoint_timer_query_webgl2');
 const ac=R.autoClear;R.autoClear=true;
 /* what the renderer submits: calls, triangles, instances (renderBufferDirect is public in r128) */
 const rbd=R.renderBufferDirect;let inst=0,imesh=0;
 R.renderBufferDirect=function(c,s,g,m,o,gr){if(o&&o.isInstancedMesh){inst+=o.count;imesh++;}return rbd.apply(this,arguments);};
 try{R.render(scene,camera);}finally{R.renderBufferDirect=rbd;}
 const calls=R.info.render.calls,tris=R.info.render.triangles;
 let ms=null,all=[],dis=0;
 /* one frame at a time: the disjoint flag is read before and after each query (it is sticky), and a frame it touched is dropped */
 if(ext){for(let i=0,tries=0;all.length<frames&&tries<frames*4;tries++){gl.getParameter(ext.GPU_DISJOINT_EXT);
   const q=gl.createQuery();gl.beginQuery(ext.TIME_ELAPSED_EXT,q);R.render(scene,camera);gl.endQuery(ext.TIME_ELAPSED_EXT);
   for(let t=0;t<300&&!gl.getQueryParameter(q,gl.QUERY_RESULT_AVAILABLE);t++)await new Promise(r=>requestAnimationFrame(r));
   const ok=gl.getQueryParameter(q,gl.QUERY_RESULT_AVAILABLE)&&!gl.getParameter(ext.GPU_DISJOINT_EXT);
   if(ok)all.push(gl.getQueryParameter(q,gl.QUERY_RESULT)/1e6);else dis++;gl.deleteQuery(q);}
  if(all.length)ms=Math.min(...all);}
 R.autoClear=ac;
 return {calls,tris,inst,imesh,ms,n:all.length,dis,med:all.length?all.slice().sort((a,b)=>a-b)[all.length>>1]:null};}"""

HELD_JS = """()=>{let t=0;try{const ts=window._api.typeStats();for(const k in ts)t+=ts[k].tris;}catch(e){}
 const m=renderer.info.memory;return {held:t,geometries:m.geometries,textures:m.textures};}"""


async def measure(b, html, query, views, frames, size):
    root = harness.ROOT
    with harness.serve(root) as port:
        pg, errs, ready = await harness.open_page(b, html, port, size=size, root=root, query=query)
        await pg.wait_for_timeout(3000)
        gpu = await pg.evaluate(harness.RENDERER_JS)
        held = await pg.evaluate(HELD_JS)
        names = await pg.evaluate("()=>[...document.querySelectorAll('#ui button')].map(b=>b.textContent.trim())")
        out = {}
        for v in (views or names):
            ok = await pg.evaluate("(v)=>{const b=[...document.querySelectorAll('#ui button')].find(b=>b.textContent.trim()===v);"
                                   "if(!b)return false;b.click();return true;}", v)
            if not ok:
                continue
            await pg.wait_for_timeout(1800)
            out[v] = await pg.evaluate(MEASURE_JS, frames)
        await pg.close()
    return {'gpu': gpu, 'held': held, 'ready': ready, 'errs': errs[:3], 'views': out}


async def main(a):
    from playwright.async_api import async_playwright
    pages = []
    for spec in a.pages:
        html, _, q = spec.partition('?')
        pages.append((spec, html, '?' + q if q else ''))
    views = [v.strip() for v in a.views.split('|') if v.strip()] if a.views else None
    res = {}
    async with async_playwright() as p:
        b = await harness.launch_chromium(p)
        for r in range(a.rounds):
            for spec, html, q in pages:
                m = await measure(b, html, q, views, a.frames, a.size)
                print('round %d  %s  (%s)  held %.2fM%s%s' % (r + 1, spec, m['gpu'], m['held']['held'] / 1e6,
                      '' if m['ready'] else '  NOT READY', ('  page errors: ' + '; '.join(m['errs'])[:300]) if m['errs'] else ''), flush=True)
                R = res.setdefault(spec, {'gpu': m['gpu'], 'held': m['held'], 'views': {}})
                for v, s in m['views'].items():
                    o = R['views'].setdefault(v, dict(s, n=0))
                    o['n'] += s.get('n', 0)
                    if s['ms'] is not None and (o['ms'] is None or s['ms'] < o['ms']):
                        o['ms'] = s['ms']
        await b.close()
    for spec in res:
        print('\n%s   %s   held %.2fM tris' % (spec, res[spec]['gpu'], res[spec]['held']['held'] / 1e6))
        print('  %-26s %6s %9s %10s %9s %5s' % ('view', 'calls', 'tris', 'instances', 'GPU ms', 'n'))
        for v, s in res[spec]['views'].items():
            print('  %-26s %6d %8.2fM %9.2fM %9s %5d' % (v, s['calls'], s['tris'] / 1e6, s['inst'] / 1e6,
                                                   '%.1f' % s['ms'] if s['ms'] is not None else 'n/a', s.get('n', 0)))
    if a.json:
        with open(a.json, 'w', encoding='utf-8', newline='\n') as f:
            json.dump(res, f, indent=1)


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('pages', nargs='+')
    ap.add_argument('--views', default='')
    ap.add_argument('--frames', type=int, default=15)
    ap.add_argument('--rounds', type=int, default=2)
    ap.add_argument('--size', default='1024x768')
    ap.add_argument('--json', default='')
    sys.exit(asyncio.run(main(ap.parse_args())) or 0)
