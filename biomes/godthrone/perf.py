#!/usr/bin/env python3
"""Frame time, draw calls and triangles per preset view (PERF.md), on the GPU Chrome renders on (KRATOR_GL=gpu).

    KRATOR_GL=gpu python3 perf.py dist/godthrone.html [--size 1024x768] [--frames 24] [--query ?lodcull=0]

Per view: the GPU time of the world's draw (EXT_disjoint_timer_query_webgl2 round SKY.draw: the sky and the world, as the
page draws them), the minimum of --frames frames (the timer swings ~25% while other sessions run), and the draw calls and
triangles of that frame; and the SYNC time (the draw and a one-pixel readback, which waits for the GPU: the minimum), which
headless Chrome always gives where the timer query often comes back empty. Take the GPU lock first (the session rules: one bash call, mkdir/run/rmdir)."""
import argparse, asyncio, json, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'tools'))
import harness

MEASURE = r"""async (frames)=>{const gl=renderer.getContext(),ext=gl.getExtension('EXT_disjoint_timer_query_webgl2');
 const info=gl.getExtension('WEBGL_debug_renderer_info'),gpu=info?gl.getParameter(info.UNMASKED_RENDERER_WEBGL):'?';
 const views=Object.keys(HOST_VIEWS),out=[];const wait=ms=>new Promise(r=>setTimeout(r,ms)),raf=()=>new Promise(r=>requestAnimationFrame(r));
 for(const v of views){const b=[...document.querySelectorAll('#ui button')].find(b=>b.textContent.trim()===v);if(!b)continue;b.click();await wait(1500);
  const ms=[];let calls=0,tris=0;
  for(let f=0;f<frames;f++){await raf();if(!ext){continue;}const q=gl.createQuery();gl.beginQuery(ext.TIME_ELAPSED_EXT,q);
   renderer.info.autoReset=false;renderer.info.reset();SKY.draw?SKY.draw(renderer,scene,camera):renderer.render(scene,camera);calls=renderer.info.render.calls;tris=renderer.info.render.triangles;renderer.info.autoReset=true;
   gl.endQuery(ext.TIME_ELAPSED_EXT);
   for(let k=0;k<60;k++){await wait(16);if(gl.getQueryParameter(q,gl.QUERY_RESULT_AVAILABLE))break;}
   if(gl.getQueryParameter(q,gl.QUERY_RESULT_AVAILABLE)&&!gl.getParameter(ext.GPU_DISJOINT_EXT))ms.push(gl.getQueryParameter(q,gl.QUERY_RESULT)/1e6);gl.deleteQuery(q);}
  /* the sync time: the draw and a one-pixel readback (it waits for the GPU), the minimum of the frames */
  const sy=[],px=new Uint8Array(4);for(let f=0;f<frames;f++){await raf();gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);const t0=performance.now();
   SKY.draw?SKY.draw(renderer,scene,camera):renderer.render(scene,camera);gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);sy.push(performance.now()-t0);}
  ms.sort((a,b)=>a-b);sy.sort((a,b)=>a-b);out.push({view:v,calls,tris,min:ms.length?+ms[0].toFixed(1):null,median:ms.length?+ms[ms.length>>1].toFixed(1):null,n:ms.length,
   sync:+sy[0].toFixed(1),syncMed:+sy[sy.length>>1].toFixed(1)});}
 return{gpu,timer:!!ext,views:out,instances:window._instances,lod:BIO.lodShown};}"""


async def main(a):
    from playwright.async_api import async_playwright
    folder = os.path.dirname(os.path.abspath(a.html))
    with harness.serve(folder) as port:
        async with async_playwright() as p:
            b = await harness.launch_chromium(p)
            pg, errs, ready = await harness.open_page(b, a.html, port, size=a.size, query=a.query)
            if not ready:
                print('the page did not build', errs[:3]); return 2
            await pg.wait_for_timeout(2500)
            r = await pg.evaluate(MEASURE, a.frames)
            print('GPU:', r['gpu'], ' timer:', r['timer'], ' query:', a.query or '(none)', ' size:', a.size)
            print('%-22s %6s %10s %8s %8s %8s %8s' % ('view', 'calls', 'tris', 'gpu min', 'gpu med', 'sync min', 'sync med'))
            for v in r['views']:
                print('%-22s %6d %10d %8s %8s %8s %8s' % (v['view'], v['calls'], v['tris'], v['min'], v['median'], v['sync'], v['syncMed']))
            if a.json:
                json.dump(r, open(a.json, 'w', encoding='utf-8'), indent=1)
            await b.close()
    return 0


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('html'); ap.add_argument('--size', default='1024x768'); ap.add_argument('--frames', type=int, default=24)
    ap.add_argument('--query', default=''); ap.add_argument('--json', default='')
    sys.exit(asyncio.run(main(ap.parse_args())))
