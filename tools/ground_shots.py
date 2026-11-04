#!/usr/bin/env python3
"""Ground before-and-after shots (core/terrain/GROUND.md): near, mid and far cameras from one preset view, the same for every
query, each with the world pass's draw calls, triangles and GPU ms (perf_views' measure), and the material channel audit.

    KRATOR_GL=gpu python3 tools/ground_shots.py "biomes/ebadlands/dist/ebadlands.html|Painted badlands" ... \
        [--queries "|kgrelief=1|kgrelief=1&kgtri=1"] [--out DIR] [--size 1280x720] [--frames 9]

The near camera stands 1.7 m over the ground 8 m short of where the view looks, looking down the same line; the far one backs
off three times as far and rises. The view is set by KHOST.go; the ground is found by rays at the KGROUND meshes. Takes the GPU lock (harness.gpu_lock).
Writes DIR/<page>-<view>-<query>-<near|mid|far>.png and DIR/ground_shots.json.
"""
import argparse, asyncio, json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import harness
from perf_views import MEASURE_JS

CAMS_JS = r"""async (v)=>{if(!KHOST.go(v))return null;for(let i=0;i<3;i++)await new Promise(r=>requestAnimationFrame(r));camera.updateMatrixWorld(true);
 document.querySelectorAll('body > div').forEach(d=>{if(!d.querySelector('canvas'))d.style.display='none';});
 const C=camera.position.clone(),d=new THREE.Vector3();camera.getWorldDirection(d);
 /* the ground: the KGROUND meshes, by rays (the page's height function is not a global on every page) */
 const G=[];scene.traverse(o=>{if(o.isMesh&&o.material&&o.material.userData&&o.material.userData.kground)G.push(o);});
 const R=new THREE.Raycaster(),down=new THREE.Vector3(0,-1,0);
 const H=(x,z)=>{R.set(new THREE.Vector3(x,1e5,z),down);const h=R.intersectObjects(G,false)[0];return h?h.point.y:C.y-50;};
 R.set(C,d);const hit=R.intersectObjects(G,false)[0];let T=hit?hit.point.clone():C.clone().addScaledVector(d,300);
 const h=new camera.position.constructor(d.x,0,d.z).normalize(),D=C.distanceTo(T);
 const n=T.clone().addScaledVector(h,-8);n.y=H(n.x,n.z)+1.7;const nt=T.clone().addScaledVector(h,4);nt.y=H(nt.x,nt.z)+.3;
 const f=T.clone().addScaledVector(h,-D*3);f.y=Math.max(H(f.x,f.z)+20,C.y+(C.y-T.y)*2);
 return {mid:[C.x,C.y,C.z,T.x,T.y,T.z],near:[n.x,n.y,n.z,nt.x,nt.y,nt.z],far:[f.x,f.y,f.z,T.x,T.y,T.z]};}"""

# which packed maps each ground and rock material reads (the material channel audit)
AUDIT_JS = r"""()=>{const out=[],seen=new Set();scene.traverse(o=>{if(!o.isMesh)return;const ms=Array.isArray(o.material)?o.material:[o.material];
 ms.forEach(m=>{if(!m||seen.has(m.uuid))return;seen.add(m.uuid);const g=o.geometry,tri=g.index?g.index.count/3:(g.attributes.position?g.attributes.position.count/3:0);
  if(!m.userData.kground&&tri<20000)return;
  out.push({label:o.userData.inspectLabel||o.name||'',type:m.type,tris:tri|0,inst:o.isInstancedMesh?o.count:0,map:!!m.map,normalMap:!!m.normalMap,
   roughnessMap:!!m.roughnessMap,aoMap:!!m.aoMap,kground:m.userData.kground||null,kinds:m.userData.kgroundKinds||null,relief:m.userData.kgroundRelief||null,
   cavity:g.attributes&&g.attributes.aKGAO?(()=>{const a=g.attributes.aKGAO.array;let s=0,m=0;for(let i=0;i<a.length;i++){s+=a[i];if(a[i]>m)m=a[i];}
    return {mean:+(s/a.length).toFixed(3),max:+m.toFixed(3)};})():null});});});
 /* the ground programs as linked: which of KGROUND's parts made it in */
 const gl=renderer.getContext(),progs=(renderer.info.programs||[]).map(p=>{try{const sh=gl.getAttachedShaders(p.program),fs=sh.map(x=>gl.getShaderSource(x)).join('\n');
  return /kgWP/.test(fs)?{bump:/normal=kgBump|kgNb=kgBump/.test(fs),occ:/\*=kgOcc/.test(fs),beds:/ksRelief\(vSWP/.test(fs),tri:/kgTS\(uKG/.test(fs),mesh:/vKGAO=aKGAO/.test(fs)}:null;}catch(e){return null;}}).filter(Boolean);
 return {mats:out,progs};}"""


async def run(a):
    res = {'gpu': None, 'shots': []}
    with harness.serve(harness.ROOT) as port:
        for spec in a.specs:
            html, view = spec.split('|', 1)
            cams = None
            for q in a.queries:
                b = await harness.launch_chromium(a.pw)   # a fresh browser a load: a second heavy page in one renderer can die
                pg, errs, ready = await harness.open_page(b, os.path.join(harness.ROOT, html), port, size=a.size, root=harness.ROOT, query=('?' + q) if q else '')
                await pg.wait_for_timeout(3000)
                if res['gpu'] is None:
                    res['gpu'] = await pg.evaluate(harness.RENDERER_JS)
                c = await pg.evaluate("()=>typeof KHOST")
                if c != 'object':
                    print('Error: %s?%s not initialised (ready %s, errors %s, console %s)' % (html, q, ready, errs[:3], pg.krator_console[-5:]), flush=True)
                    await b.close()
                    continue
                c = await pg.evaluate(CAMS_JS, view)
                if c is None:
                    print('no view %r on %s' % (view, html), flush=True)
                    await b.close()
                    break
                cams = cams or c   # the first query's cameras serve every query
                audit = await pg.evaluate(AUDIT_JS)
                print('audit %s?%s %s' % (html, q, json.dumps({'mats': [(m['type'], m['tris'], m['relief'], m['cavity']) for m in audit['mats'] if m['kground']],
                                                             'progs': audit['progs']})), flush=True)
                for which in ('near', 'mid', 'far'):
                    v = cams[which]
                    await pg.evaluate('(v)=>KHOST.setView(...v)', v)
                    await pg.wait_for_timeout(2200)
                    name = re.sub(r'[^a-z0-9]+', '-', ('%s-%s-%s-%s' % (os.path.basename(html)[:-5], view, q or 'before', which)).lower()).strip('-')
                    path = os.path.join(a.out, name + '.png')
                    await pg.screenshot(path=path)
                    m = await pg.evaluate(MEASURE_JS, a.frames)
                    res['shots'].append({'page': html, 'view': view, 'query': q, 'cam': which, 'png': path, 'calls': m['calls'], 'tris': m['tris'],
                                         'ms': m['ms'], 'errs': errs[:3], 'gl': harness.gl_errors(pg.krator_console)[:3]})
                    print('%-60s calls %5d tris %9d gpu %s ms  errors %s %s' % (name, m['calls'], m['tris'], m['ms'] and round(m['ms'], 2), errs[:2],
                                                                            harness.gl_errors(pg.krator_console)[:2]), flush=True)
                res.setdefault('audit', {})['%s %s' % (html, q)] = audit
                await b.close()
    with open(os.path.join(a.out, 'ground_shots.json'), 'w', encoding='utf-8', newline='\n') as fh:
        json.dump(res, fh, indent=1)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('specs', nargs='+')
    ap.add_argument('--queries', default='|kgrelief=1|kgrelief=1&kgtri=1')
    ap.add_argument('--out', default=os.path.join(harness.TMP, 'ground-shots'))
    ap.add_argument('--size', default='1280x720')
    ap.add_argument('--frames', type=int, default=9)
    a = ap.parse_args()
    a.queries = a.queries.split('|')
    os.makedirs(a.out, exist_ok=True)
    from playwright.async_api import async_playwright

    async def go():
        async with async_playwright() as p:
            a.pw = p
            await run(a)
    with harness.gpu_lock(what='ground_shots ' + ' '.join(a.specs)):
        asyncio.run(go())


if __name__ == '__main__':
    main()
