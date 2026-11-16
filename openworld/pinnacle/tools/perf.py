#!/usr/bin/env python3
"""The Pinnacle region's frame cost from fixed views, on the GPU the browser renders with.

    python3 ../../tools/harness.py lock --lane arc -- python3 tools/perf.py dist/pinnacle.html [--views 1,2,ground,walk]
            [--secs 6] [--shots DIR] [--json out.json] [--detail]

KRATOR_GL=gpu is set here (a timing run is on the real GPU); run it under the lock (arc by default, as timing runs take).
For each view: the page's own frame rate over --secs seconds (its whole loop: streaming, the flora's draw, the render),
the world pass's GPU time (EXT_disjoint_timer_query_webgl2, the minimum of 12 frames), draw calls and triangles, and
what the flora drew (records by level). --detail adds the triangles by flora prototype and by camp piece; --fly SPEED
flies on from each view for --flysecs (the page's frames, the worst ones, and each streaming step's CPU ms a frame);
--ablate times the world pass with each kind of mesh hidden in turn, and at half the pixel ratio. Compare a before and an
after inside ONE lock (cmd /c "perf a & perf b"): other work on the machine swings the numbers by up to 2x.
Views: a number is a "Go to" entry (_api.go); 'ground' is 30 m over the jungle south-east of the rock, 'walk' 1.7 m on
the ground there, looking north-west.
"""
import argparse, asyncio, json, os, sys
os.environ.setdefault('KRATOR_GL', 'gpu')
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'tools'))
import harness  # noqa: E402
from harness import verify_page  # noqa: E402

FLY = r"""async (o)=>{/* a straight flight from the view's spot, o.speed m/s on its heading at its height above the ground, o.secs
 seconds: the page's own frames (streaming, growing, drawing) counted, and the worst frames */
 /* where the frame's CPU time goes while flying: each streaming step, the flora's draw, each tick, the render */
 const T={},wrap=(o,k,n)=>{const f=o[k];if(typeof f!=='function'||f._w)return;const g=function(){const a=performance.now();try{return f.apply(this,arguments);}finally{T[n]=(T[n]||0)+performance.now()-a;}};g._w=f;o[k]=g;};
 wrap(TERRAIN,'update','terrain');wrap(FLORA,'residency','flora tiles');wrap(NURSERY,'update','nursery');wrap(FLOOR,'update','floor');wrap(SEAS,'update','seas');
 wrap(FLORA,'draw','flora draw');wrap(HOST.renderer,'render','render');HOST.TICKS.forEach((f,i)=>wrap(HOST.TICKS,i,'tick'+i));
 const unwrap=()=>{for(const [o,k] of [[TERRAIN,'update'],[FLORA,'residency'],[NURSERY,'update'],[FLOOR,'update'],[SEAS,'update'],[FLORA,'draw'],[HOST.renderer,'render']])if(o[k]._w)o[k]=o[k]._w;HOST.TICKS.forEach((f,i)=>{if(f._w)HOST.TICKS[i]=f._w;});};
 const cam=HOST.camera,y0=cam.position.y-WORLD.H(cam.position.x,cam.position.z),d=new THREE.Vector3();cam.getWorldDirection(d);d.y=0;d.normalize();
 const ts=[];let last=performance.now();const t0=last;
 await new Promise(res=>{function step(){const now=performance.now();ts.push(now-last);last=now;
  const s=(now-t0)/1000*o.speed;const x=o.x0+d.x*s,z=o.z0+d.z*s;cam.position.set(x,WORLD.H(x,z)+y0,z);
  if(now-t0<o.secs*1000)requestAnimationFrame(step);else res();}requestAnimationFrame(step);});
 unwrap();ts.shift();const sorted=ts.slice().sort((a,b)=>a-b),n=ts.length,per={};for(const k in T)per[k]=Math.round(T[k]/n*10)/10;
 return{fps:Math.round(n/o.secs*10)/10,p50:Math.round(sorted[n>>1]*10)/10,p95:Math.round(sorted[Math.floor(n*.95)]*10)/10,worst:Math.round(sorted[n-1]),
  over100:ts.filter(t=>t>100).length,frames:n,msPerFrame:per};}"""

ABLATE = r"""async ()=>{/* the world pass's GPU time with each kind of mesh hidden in turn (the minimum of 10 frames) */
 const R=HOST.renderer,gl=R.getContext(),ext=gl.getExtension('EXT_disjoint_timer_query_webgl2'),sc=HOST.scene,cam=HOST.camera;if(!ext)return null;
 async function gpu(){const all=[];for(let tries=0;all.length<10&&tries<40;tries++){gl.getParameter(ext.GPU_DISJOINT_EXT);const q=gl.createQuery();gl.beginQuery(ext.TIME_ELAPSED_EXT,q);R.render(sc,cam);gl.endQuery(ext.TIME_ELAPSED_EXT);
   for(let t=0;t<300&&!gl.getQueryParameter(q,gl.QUERY_RESULT_AVAILABLE);t++)await new Promise(r=>requestAnimationFrame(r));
   if(gl.getQueryParameter(q,gl.QUERY_RESULT_AVAILABLE)&&!gl.getParameter(ext.GPU_DISJOINT_EXT))all.push(gl.getQueryParameter(q,gl.QUERY_RESULT)/1e6);gl.deleteQuery(q);}
  return all.length?Math.round(Math.min(...all)*10)/10:null;}
 const kind=o=>{if(o.userData.flora){const p=FLORA.pools.get(o.userData.flora);const k=String(o.userData.flora).split('|');return k[3]==='0'?'flora far':k[3]==='s'?'flora saplings':k[3]==='1'?'flora mid':'flora hero';}
  if(o.userData.inspectLabel==='floor')return 'floor';if(o.userData.terrain!=null||o.userData.inspectLabel==='ground')return 'ground';
  if(/^water/.test(o.name||''))return 'water';if(/^camp/.test(o.name||''))return 'camps';if(o.isLight)return null;return 'other';};
 const top=sc.children.filter(o=>kind(o)),out={all:await gpu()};
 for(const k of ['flora far','flora mid','flora hero','flora saplings','floor','ground','water','camps','other']){const L=top.filter(o=>kind(o)===k&&o.visible);if(!L.length)continue;L.forEach(o=>o.visible=false);out['no '+k]=await gpu();L.forEach(o=>o.visible=true);}
 const bg=sc.background;sc.background=null;out['no background']=await gpu();sc.background=bg;
 const pr=R.getPixelRatio();R.setPixelRatio(pr*.5);out['half pixel ratio']=await gpu();R.setPixelRatio(pr);
 return out;}"""

GO = {'ground': "(()=>{const S=WORLD_DATA.meta.sites[0];CAM.setView(S.x+2400,S.z+2400,30,.78,-.08);})()",
      'walk': "(()=>{const S=WORLD_DATA.meta.sites[0];CAM.setView(S.x+2400,S.z+2400,1.7,.78,-.02);})()"}

MEASURE = r"""async (o)=>{const R=HOST.renderer,gl=R.getContext(),ext=gl.getExtension('EXT_disjoint_timer_query_webgl2'),sc=HOST.scene,cam=HOST.camera;
 /* the page's own loop: frames counted over o.secs */
 const f0=START.frames,t0=performance.now();await new Promise(r=>setTimeout(r,o.secs*1000));const fps=(START.frames-f0)*1000/(performance.now()-t0);
 /* one frame's submission */
 FLORA.draw();R.render(sc,cam);const calls=R.info.render.calls,tris=R.info.render.triangles;
 /* the flora's own draw on the CPU */
 let fm=1e9;for(let i=0;i<5;i++){const a=performance.now();FLORA.draw();fm=Math.min(fm,performance.now()-a);}
 let ms=null;const all=[];
 if(ext){for(let i=0,tries=0;all.length<12&&tries<48;tries++){gl.getParameter(ext.GPU_DISJOINT_EXT);const q=gl.createQuery();gl.beginQuery(ext.TIME_ELAPSED_EXT,q);R.render(sc,cam);gl.endQuery(ext.TIME_ELAPSED_EXT);
   for(let t=0;t<300&&!gl.getQueryParameter(q,gl.QUERY_RESULT_AVAILABLE);t++)await new Promise(r=>requestAnimationFrame(r));
   if(gl.getQueryParameter(q,gl.QUERY_RESULT_AVAILABLE)&&!gl.getParameter(ext.GPU_DISJOINT_EXT))all.push(gl.getQueryParameter(q,gl.QUERY_RESULT)/1e6);gl.deleteQuery(q);}
  if(all.length)ms=Math.min(...all);}
 const F=FLORA.stats,out={fps:Math.round(fps*10)/10,gpuMs:ms==null?null:Math.round(ms*10)/10,floraCpuMs:Math.round(fm*10)/10,calls,tris,
  flora:{drawn:F.drawn,hero:F.levels[2],mid:F.levels[1],far:F.levels[0],records:F.records,tiles:F.tiles,pools:F.pools},
  campsFull:_sites.stats.full,pos:[cam.position.x,cam.position.y,cam.position.z].map(Math.round)};
 if(o.detail){const P=[];for(const p of FLORA.pools.values()){if(!p.n)continue;let t=0;for(const pt of p.proto.parts){const g=pt.geo;t+=(g.index?g.index.count:g.attributes.position.count)/3;}
   P.push({key:p.key,n:p.n,parts:p.proto.parts.length,triEach:Math.round(t),tris:Math.round(t*p.n)});}
  P.sort((a,b)=>b.tris-a.tris);const byLv={};for(const q of P){const lv=q.key.split('|')[3];const b=byLv[lv]||(byLv[lv]={n:0,tris:0,calls:0});b.n+=q.n;b.tris+=q.tris;b.calls+=q.parts;}
  out.byLevel=byLv;out.top=P.slice(0,14);
  /* what else is drawn: the scene's visible meshes grouped by their top-level parent */
  const G={};sc.traverseVisible(m=>{if(!m.isMesh)return;let r=m;while(r.parent&&r.parent!==sc)r=r.parent;if(m.userData.flora)return;const k=(r.name||m.userData.inspectLabel||(m.userData.floor?'floor':'')||r.type+':'+(m.material&&m.material.type)).replace(/ \S+$/,'');const g=m.geometry;
   const t=(g.index?g.index.count:g.attributes.position.count)/3*(m.isInstancedMesh?m.count:1);const b=G[k]||(G[k]={meshes:0,tris:0});b.meshes++;b.tris+=Math.round(t);});
  out.other=G;
  /* the camps' pieces by prototype: instances and triangles over the camps drawn */
  const C={};sc.children.forEach(g=>{if(!g.visible||!/^camp /.test(g.name||''))return;g.traverseVisible(m=>{if(!m.isMesh)return;const geo=m.geometry,t=(geo.index?geo.index.count:geo.attributes.position.count)/3;
   const k=(m.name||'?').replace(/\|.*$/,''),b=C[k]||(C[k]={meshes:0,inst:0,triEach:0,tris:0});b.meshes++;b.inst+=m.isInstancedMesh?m.count:1;b.tris+=Math.round(t*(m.isInstancedMesh?m.count:1));});});
  out.camps=Object.entries(C).sort((a,b)=>b[1].tris-a[1].tris).slice(0,12);}
 return out;}"""


async def run(a):
    res = {}
    async with verify_page(a.html, here=HERE, size=a.size, settle_ms=0, lock=False,
                           ready_js="typeof CAM==='object'&&CAM&&window._api&&window._sites") as V:
        pg = V.page
        pg.set_default_timeout(900000)
        gpu = await pg.evaluate(harness.RENDERER_JS)
        print('renderer:', gpu, flush=True)
        await pg.evaluate('_api.settle(240000)')
        for v in [t.strip() for t in a.views.split(',') if t.strip()]:
            await pg.evaluate(GO[v] if v in GO else '_api.go(%d)' % int(v))
            await pg.evaluate('_api.settle(240000)')
            await pg.wait_for_timeout(1500)
            m = await pg.evaluate(MEASURE, {'secs': a.secs, 'detail': a.detail})
            res[v] = m
            F = m['flora']
            print('view %-6s %5.1f fps  GPU %s ms  flora draw %.1f ms  %5d calls  %6.2f M tris  flora %d (hero %d, mid %d, far %d) of %d  camps full %d'
                  % (v, m['fps'], m['gpuMs'], m['floraCpuMs'], m['calls'], m['tris'] / 1e6, F['drawn'], F['hero'], F['mid'], F['far'], F['records'], m['campsFull']), flush=True)
            if a.detail:
                print('   by level:', json.dumps(m['byLevel']))
                for q in m['top']:
                    print('   %-28s n %5d  parts %d  %7d tris each  %6.2f M' % (q['key'], q['n'], q['parts'], q['triEach'], q['tris'] / 1e6))
                print('   other:', json.dumps(m['other']))
                for k, b in m.get('camps', []):
                    print('   camp piece %-34s meshes %4d  instances %5d  %6.2f M tris' % (k, b['meshes'], b['inst'], b['tris'] / 1e6))
            if a.shots:
                os.makedirs(a.shots, exist_ok=True)
                await V.shot(os.path.join(a.shots, 'perf-%s.png' % v), view='perf-%s' % v)
            if a.ablate:
                print('   GPU ms by what is hidden:', json.dumps(await pg.evaluate(ABLATE)), flush=True)
            if a.fly:
                p =await pg.evaluate('[HOST.camera.position.x,HOST.camera.position.z]')
                f = await pg.evaluate(FLY, {'x0': p[0], 'z0': p[1], 'speed': a.fly if v != 'walk' else 6, 'secs': a.flysecs})
                m['fly'] = f
                print('   flight %s m/s for %ss: %.1f fps, frame p50 %s ms, p95 %s ms, worst %s ms, %d frames over 100 ms'
                      % (a.fly if v != 'walk' else 6, a.flysecs, f['fps'], f['p50'], f['p95'], f['worst'], f['over100']), flush=True)
                print('   CPU ms a frame while flying:', json.dumps(f['msPerFrame']), flush=True)
        res['_gpu'] = gpu
        panel = await pg.evaluate("document.getElementById('errs').textContent")
        lost = await pg.evaluate("HOST.renderer.getContext().isContextLost()")
        print('error panel:', panel[:1500] if panel else '(empty)', ' context lost:', lost)
        if V.errs:
            print('page errors:', [str(e)[:500] for e in V.errs[:5]])
        res['_panel'] = panel
    if a.json:
        with open(a.json, 'w', encoding='utf-8', newline='\n') as f:
            json.dump(res, f, indent=1)
    return 0


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('html')
    ap.add_argument('--views', default='1,2,ground,walk')
    ap.add_argument('--secs', type=float, default=6)
    ap.add_argument('--size', default='1280x800')
    ap.add_argument('--shots', default='')
    ap.add_argument('--json', default='')
    ap.add_argument('--detail', action='store_true')
    ap.add_argument('--fly', type=float, default=0, help='after each view, fly on at this speed (m/s; the walk view walks at 6)')
    ap.add_argument('--flysecs', type=float, default=12)
    ap.add_argument('--ablate', action='store_true', help='GPU time with each kind of mesh hidden in turn')
    sys.exit(asyncio.run(run(ap.parse_args())))
