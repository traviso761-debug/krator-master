#!/usr/bin/env python3
"""Headless verification for the Motor Vehicles kit (dist/motor-vehicles.html, dist/krator-vehicles.js).

Usage:
  python3 verify.py dist/motor-vehicles.html [--assert] [--seeds 3] [--out ./shots] [--views front34,side]
                                             [--night] [--eval "()=>..."] [--size 1280x800]

What it does (cut down from kits/catalog/verify.py):
  1. Serves this folder over HTTP and routes three.min.js to the local r128 copy.
  2. Loads the sheet in headless Chromium with software WebGL (SwiftShader).
  3. Prints the error panel (#errs) and page errors; either fails the run.
  4. --assert, for EVERY vehicle, every variant, seeds 1..--seeds, built through KratorVehicles.build:
       builds            a group with at least one mesh, no exception
       no-nan-geometry   no NaN vertex or transform
       wheels-on-ground  the lowest vertex of the vehicle is at y = 0, and of each wheel at its lift (0, or a track
                         belt's thickness for a road wheel) (within GROUND_TOL)
       declared-size     the geometry fits the declared box centred on the origin: x in [-w/2, w/2], y in [0, h],
                         z in [-d/2, d/2] (within TOL_M); more than UNDER_FRAC smaller on an axis is a WARN
       budget            at most 2 + one per wheel meshes (draw calls), and MAX_TRIS triangles unless the entry
                         declares more (budget.tris, never over BIG_TRIS)
       moving-parts      wheel_* children at their declared hubs (x, r + lift, z); a tracked vehicle's belts mesh
                         runs on roll(), stays on the ground and comes back on roll(-d); steer_* pivots for the steered
                         wheels; roll() turns a wheel by metres / r; steer() turns and clamps the front pair;
                         lights() switches the lamp material's emissive; lamps listed and inside the box
       tags              class, type, drive, seats, fuel, terrain from the kit's vocabularies; the data a
                         host reads (speed, seats, cargo, fuel, tank, wheels, maxSteer)
       colour            the body's vertex colours hold the LINEAR value of the variant's paint (sRGB in the
                         palette): the conversion the runtime promises
       textures          every mesh has a detail slot per vertex (aDetS: -1 or a slot of the atlas); with the
                         bundle's maps on, every material carries the atlas hook (vehicles-detail.js)
       clearance         at full lock both ways (and straight), no steered wheel's vertex falls within 2 cm of the
                         body's surfaces (sampled into 2 cm cells)
       deterministic     two builds with the same seed are identical, vertex for vertex
     plus, in a BLANK page with only three.min.js:
       bundle-alone      dist/krator-vehicles.js loads, adds exactly one global (KratorVehicles), and builds
                         every vehicle with no scene, renderer or other global
  5. --out: screenshots: the sheet, then per instance one per --views (default front34,side), and with
     --night the first row at night with the lamps on.

Exit code is non-zero if the error panel is dirty, the page threw, or an assertion fails.

Requires: pip install playwright (Chromium at /opt/pw-browsers/chromium or PW_CHROMIUM).
"""
import argparse, asyncio, http.server, json, os, socketserver, sys, threading

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

HERE = os.path.dirname(os.path.abspath(__file__))
TOL_M, UNDER_FRAC, GROUND_TOL = 0.02, 0.30, 0.01
MAX_MESHES, MAX_TRIS = 6, 6000          # the default (a four-wheeler); an entry's budget (vehicleBudget()) can raise it
BIG_TRIS = 20000                        # the ceiling any declared budget must stay under


def _exe():
    for c in (os.environ.get('PW_CHROMIUM'), '/opt/pw-browsers/chromium'):
        if c and os.path.exists(c):
            return {'executable_path': c}
    return {}


ASSERT_JS = r"""(cfg)=>{
const KV=KratorVehicles, out={per:[]}, f2=x=>(Math.round(x*1000)/1000).toFixed(3);
const lin=c=>c<=0.04045?c/12.92:Math.pow((c+0.055)/1.055,2.4);
const W=new THREE.Vector3();
function measure(g){
  g.updateMatrixWorld(true);
  const box=new THREE.Box3(); let meshes=0,tris=0,nan=false; const wheelMin={};
  g.traverse(o=>{
    if(!o.isMesh)return;
    meshes++;
    const p=o.geometry.attributes.position; tris+=(o.geometry.index?o.geometry.index.count:p.count)/3;
    if(o.matrixWorld.elements.some(e=>!isFinite(e)))nan=true;
    let mn=1e9;
    for(let i=0;i<p.count;i++){W.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld);
      if(!isFinite(W.x)||!isFinite(W.y)||!isFinite(W.z)){nan=true;continue;}
      box.expandByPoint(W); if(W.y<mn)mn=W.y;}
    if(/^wheel_/.test(o.name))wheelMin[o.name]=mn;
  });
  return {box,meshes,tris:Math.round(tris),nan,wheelMin};
}
/* full-lock clearance: the body's surfaces sampled into 2 cm cells; a steered wheel's vertices at +-maxSteer (and
   straight ahead) must fall in none of them */
function lockHits(g){
  const C=0.02,key=(x,y,z)=>Math.round(x/C)+','+Math.round(y/C)+','+Math.round(z/C),occ=new Set();
  const A=new THREE.Vector3(),B=new THREE.Vector3(),D=new THREE.Vector3(),P=new THREE.Vector3();
  g.updateMatrixWorld(true);
  g.traverse(o=>{if(!o.isMesh||!/^body/.test(o.name))return;const p=o.geometry.attributes.position;
    for(let i=0;i<p.count;i+=3){A.fromBufferAttribute(p,i);B.fromBufferAttribute(p,i+1);D.fromBufferAttribute(p,i+2);
      const n=Math.min(60,Math.ceil(Math.max(A.distanceTo(B),A.distanceTo(D),B.distanceTo(D))/(C*0.7)));
      for(let u=0;u<=n;u++)for(let v=0;v<=n-u;v++){P.copy(A).multiplyScalar(1-(u+v)/n).addScaledVector(B,u/n).addScaledVector(D,v/n);occ.add(key(P.x,P.y,P.z));}}});
  const out=[];
  for(const sg of [1,-1,0]){KV.steer(g,sg*10);g.updateMatrixWorld(true);
    for(const W of (g.userData.wheels||[]).filter(w=>w.steer)){const m=g.getObjectByName(W.name),p=m.geometry.attributes.position;let h=0;
      for(let i=0;i<p.count;i++){P.fromBufferAttribute(p,i).applyMatrix4(m.matrixWorld);if(occ.has(key(P.x,P.y,P.z)))h++;}
      if(h)out.push(W.name+(sg>0?' at +lock':sg<0?' at -lock':' straight')+': '+h+' vertices in the body');}}
  KV.steer(g,0);
  return out;
}
function sig(g){let h=0;g.updateMatrixWorld(true);g.traverse(o=>{if(!o.isMesh)return;const a=o.geometry.attributes.position.array;
  for(let i=0;i<a.length;i+=7)h=(h*31+Math.round(a[i]*1e4))|0;h=(h*31+a.length)|0;});return h;}
const C=KV, inList=(v,L)=>L.indexOf(v)>=0;
for(const E of KV.list()){
  const pal=KV.palette(E.culture);
  for(let v=0;v<E.variants;v++)for(let seed=1;seed<=cfg.seeds;seed++){
    const r={key:E.key,variant:v,seed,fail:[],warn:[]};
    let g=null;
    try{g=KV.build(E.key,{variant:v,seed});}catch(e){r.fail.push('build threw: '+(e&&e.message||e));out.per.push(r);continue;}
    if(!g){r.fail.push('build returned null');out.per.push(r);continue;}
    const m=measure(g), u=g.userData, D=u.data||{};
    r.tris=m.tris; r.meshes=m.meshes;
    if(!m.meshes)r.fail.push('no meshes');
    if(m.nan)r.fail.push('NaN in geometry or transform');
    /* ground */
    if(Math.abs(m.box.min.y)>cfg.ground)r.fail.push('ground: lowest point y = '+f2(m.box.min.y));
    for(const w of u.wheels||[]){const mn=m.wheelMin[w.name];
      if(mn==null)r.fail.push('moving: no mesh named '+w.name);
      else if(Math.abs(mn-(w.lift||0))>cfg.ground)r.fail.push('ground: '+w.name+' lowest y = '+f2(mn)+(w.lift?' (on a belt '+w.lift+' thick)':''));}
    /* declared size */
    const b=m.box, t=cfg.tol;
    if(b.min.x<-E.w/2-t||b.max.x>E.w/2+t||b.min.z<-E.d/2-t||b.max.z>E.d/2+t||b.max.y>E.h+t||b.min.y<-t)
      r.fail.push('outside declared '+E.w+' x '+E.d+' x '+E.h+': x '+f2(b.min.x)+'..'+f2(b.max.x)+' y '+f2(b.min.y)+'..'+f2(b.max.y)+' z '+f2(b.min.z)+'..'+f2(b.max.z));
    const sz=b.getSize(new THREE.Vector3());
    if(sz.x<E.w*(1-cfg.under))r.warn.push('narrow: '+f2(sz.x)+' of '+E.w);
    if(sz.z<E.d*(1-cfg.under))r.warn.push('short: '+f2(sz.z)+' of '+E.d);
    if(sz.y<E.h*(1-cfg.under))r.warn.push('low: '+f2(sz.y)+' of '+E.h);
    r.size=[f2(sz.x),f2(sz.y),f2(sz.z)];
    /* budget */
    const BG=E.budget||{meshes:cfg.maxMeshes,tris:cfg.maxTris};
    if(m.meshes>BG.meshes)r.fail.push('budget: '+m.meshes+' meshes (draw calls) > '+BG.meshes);
    if(m.tris>BG.tris)r.fail.push('budget: '+m.tris+' triangles > '+BG.tris);
    if(BG.tris>cfg.bigTris)r.fail.push('budget: declared '+BG.tris+' triangles, over the kit ceiling '+cfg.bigTris);
    /* moving parts */
    if(u.kind!=='vehicle')r.fail.push('moving: userData.kind is '+u.kind);
    for(const w of u.wheels||[]){
      const o=g.getObjectByName(w.name); if(!o)continue;
      o.getWorldPosition(W);
      if(Math.abs(W.x-w.x)>1e-6||Math.abs(W.y-w.r-(w.lift||0))>1e-6||Math.abs(W.y-w.y)>1e-6||Math.abs(W.z-w.z)>1e-6)r.fail.push('moving: '+w.name+' origin is not its hub');
      if(w.steer){const p=g.getObjectByName('steer_'+w.name.replace(/^wheel_/,''));
        if(!p||o.parent!==p)r.fail.push('moving: '+w.name+' has no steer pivot');}
      const a0=o.rotation.x; KV.roll(g,1); const da=o.rotation.x-a0; KV.roll(g,-1);
      if(Math.abs(da-1/w.r)>1e-6)r.fail.push('moving: roll(1 m) turned '+w.name+' by '+da);
    }
    if(!(u.wheels||[]).length)r.fail.push('moving: no wheels listed');
    const bm=g.getObjectByName('belts'), trk=(E.tags||{}).drive==='tracked'||(E.tags||{}).drive==='half-track';
    if(trk&&!bm)r.fail.push('moving: tracked, but no belts mesh');
    if(bm){const P=bm.geometry.attributes.position.array, a0=Array.from(P);KV.roll(g,0.07);
      let mv=false,mn=1e9;for(let i=0;i<P.length;i++){if(Math.abs(P[i]-a0[i])>1e-4)mv=true;if(i%3===1&&P[i]<mn)mn=P[i];}
      KV.roll(g,-0.07);let err=0;for(let i=0;i<P.length;i++)err=Math.max(err,Math.abs(P[i]-a0[i]));
      if(!mv)r.fail.push('moving: roll() does not run the belts');
      if(Math.abs(mn)>cfg.ground)r.fail.push('moving: a rolled belt leaves the ground (lowest y '+f2(mn)+')');
      if(err>1e-4)r.fail.push('moving: roll(+d) then roll(-d) leaves the belts '+err+' off');}
    /* textures: every mesh carries a detail slot per vertex; on the sheet (the bundle has maps) every material takes the atlas */
    const nS=KV.textures().slots.length;
    g.traverse(o=>{if(!o.isMesh)return;const a=o.geometry.attributes.aDetS;
      if(!a||a.count!==o.geometry.attributes.position.count)r.fail.push('textures: '+o.name+' has no aDetS per vertex');
      else for(let i=0;i<a.count;i++){const x=a.array[i];if(!(x===-1||(x>=0&&x<nS&&x===Math.floor(x)))){r.fail.push('textures: '+o.name+' slot '+x);break;}}
      if(cfg.tex&&!(o.material.userData&&o.material.userData.detail))r.fail.push('textures: '+o.name+' material has no detail hook');});
    if(cfg.tex&&!u.textured)r.fail.push('textures: userData.textured is false');
    const a=KV.steer(g,10), lim=D.maxSteer;
    if(Math.abs(a-lim)>1e-9)r.fail.push('moving: steer(10) gave '+a+', maxSteer '+lim);
    for(const w of (u.wheels||[]).filter(w=>w.steer)){const p=g.getObjectByName('steer_'+w.name.replace(/^wheel_/,''));
      const want=lim*(w.steerRatio!=null?w.steerRatio:1);if(p&&Math.abs(p.rotation.y-want)>1e-9)r.fail.push('moving: '+p.name+' not turned');}
    if(!(u.wheels||[]).some(w=>w.steer)&&lim!==0)r.fail.push('moving: no steered wheel but maxSteer '+lim+' (a skid-steered vehicle declares 0)');
    KV.steer(g,0);
    const mm=g.getObjectByName('body:metal');
    if(!mm)r.fail.push('moving: no body:metal mesh');
    else{KV.lights(g,true);const on=mm.material.emissive.r;KV.lights(g,false);const off=mm.material.emissive.r;
      if(!(on>0.5&&off===0))r.fail.push('moving: lights() does not switch the emissive ('+on+'/'+off+')');}
    if(!(u.lamps||[]).length)r.fail.push('moving: no lamps listed');
    for(const L of u.lamps||[])if(!(Math.abs(L.x)<=E.w/2&&L.y>=0&&L.y<=E.h&&Math.abs(L.z)<=E.d/2))r.fail.push('moving: lamp outside the box');
    /* tags and data */
    const T=E.tags||{};
    if(!E.culture||C.cultures().indexOf(E.culture)<0)r.fail.push('tags: culture '+E.culture+' not registered');
    if(!inList(T.class,C.CLASSES))r.fail.push('tags: class '+T.class);
    if(!Array.isArray(T.type)||!T.type.length||!T.type.every(x=>inList(x,C.TYPES)))r.fail.push('tags: type '+JSON.stringify(T.type));
    if(!inList(T.drive,C.DRIVES))r.fail.push('tags: drive '+T.drive);
    if(!(T.seats>=1))r.fail.push('tags: seats '+T.seats);
    if(!inList(T.fuel,C.FUELS))r.fail.push('tags: fuel '+T.fuel);
    if(!Array.isArray(T.terrain)||!T.terrain.length||!T.terrain.every(x=>inList(x,C.TERRAIN)))r.fail.push('tags: terrain '+JSON.stringify(T.terrain));
    for(const k of ['speed','seats','cargo','tank','maxSteer','wheelbase','track','mass'])if(typeof D[k]!=='number'||!(D[k]>=0))r.fail.push('tags: data.'+k+' '+D[k]);
    if(!inList(D.fuel,C.FUELS))r.fail.push('tags: data.fuel '+D.fuel);
    if(!Array.isArray(D.wheels)||D.wheels.length<3)r.fail.push('tags: data.wheels');
    if(u.key!==E.key||u.culture!==E.culture||!u.tags||u.tags.class!==T.class)r.fail.push('tags: userData does not carry key/culture/tags');
    /* colour: the variant's paint, linear, among the body's vertex colours */
    const paintKey=cfg.paint[E.key]&&cfg.paint[E.key][v];
    if(paintKey){
      const hex=pal&&pal[paintKey];
      if(hex==null)r.fail.push('colour: no palette key '+paintKey);
      else{const want=[(hex>>16&255)/255,(hex>>8&255)/255,(hex&255)/255].map(lin);
        const mt=g.getObjectByName('body:matte'), col=mt&&mt.geometry.attributes.color.array; let hit=false;
        if(col)for(let i=0;i<col.length&&!hit;i+=3)hit=Math.abs(col[i]-want[0])<1e-5&&Math.abs(col[i+1]-want[1])<1e-5&&Math.abs(col[i+2]-want[2])<1e-5;
        if(!hit)r.fail.push('colour: no linear '+paintKey+' in body:matte');}
    }
    /* clearance at full lock (seed 1: the running gear does not vary by seed) */
    if(seed===1)for(const h of lockHits(g))r.fail.push('clearance: '+h);
    /* deterministic */
    const g2=KV.build(E.key,{variant:v,seed});
    if(sig(g)!==sig(g2))r.fail.push('deterministic: two builds with seed '+seed+' differ');
    KV.dispose(g); KV.dispose(g2);
    out.per.push(r);
  }
}
out.list=KV.list().map(E=>({key:E.key,name:E.name,variants:E.variants,w:E.w,d:E.d,h:E.h}));
return out;}"""

ALONE_JS = r"""async ()=>{
  const load=src=>new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=()=>rej(new Error('load '+src));document.head.appendChild(s);});
  const errs=[]; window.addEventListener('error',e=>errs.push(String(e.message)));
  await load('three.min.js');
  const before=new Set(Object.getOwnPropertyNames(window));
  await load('dist/krator-vehicles.js');
  const added=Object.getOwnPropertyNames(window).filter(k=>!before.has(k));
  const built=[];
  if(window.KratorVehicles)for(const E of KratorVehicles.list())for(let v=0;v<E.variants;v++){
    const g=KratorVehicles.build(E.key,{variant:v,seed:3});built.push(E.key+'#'+v+':'+(g?g.children.length:'null'));}
  const after=Object.getOwnPropertyNames(window).filter(k=>!before.has(k));
  return {added,after,built,errs};}"""


async def run(a):
    from playwright.async_api import async_playwright
    path = os.path.abspath(a.html)
    rel = os.path.relpath(path, HERE).replace(os.sep, '/')
    if a.out:
        os.makedirs(a.out, exist_ok=True)
    handler = lambda *x, **k: http.server.SimpleHTTPRequestHandler(*x, directory=HERE, **k)
    socketserver.TCPServer.allow_reuse_address = True
    httpd = socketserver.TCPServer(('127.0.0.1', 0), handler)
    port = httpd.server_address[1]
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    fails = []
    three = os.path.join(HERE, 'three.min.js')
    try:
        async with async_playwright() as p:
            b = await p.chromium.launch(**_exe(), args=['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'])
            W, H = [int(t) for t in a.size.split('x')]
            pg = await b.new_page(viewport={'width': W, 'height': H})
            pg.set_default_timeout(600000)
            errs = []
            pg.on('pageerror', lambda e: errs.append(str(e)))
            await pg.route('**/three.min.js', lambda route: asyncio.ensure_future(
                route.fulfill(path=three, content_type='application/javascript')))
            await pg.goto('http://127.0.0.1:%d/%s' % (port, rel), timeout=900000)
            try:
                await pg.wait_for_function("window._ready===true || document.getElementById('errs').textContent.length>0", timeout=580000)
            except Exception:
                print('timed out waiting for the sheet to build'); fails.append('build timeout')
            await pg.wait_for_timeout(1500)
            panel = await pg.evaluate("document.getElementById('errs').textContent")
            print('ERROR PANEL:', repr(panel[:1500]) if panel else 'clean')
            if panel:
                fails.append('error panel not clean')
            if errs:
                print('PAGE ERRORS:', errs[:5]); fails.append('page errors')
            info = await pg.evaluate("()=>({ready:!!window._ready,calls:renderer.info.render.calls,tris:renderer.info.render.triangles,"
                                     "instances:(window._sheet||{instances:[]}).instances.length})")
            print('ready:', info['ready'], ' instances:', info['instances'], ' draw calls:', info['calls'], ' triangles:', info['tris'])

            if a.assert_:
                paint = {'geo_dune_buggy': ['paintBrown', 'paintBlack', 'paintSand'], 'rep_crawler': ['hullCream', 'hullOchre'],
                         'iz_six_wheeler': ['ochreOrange', 'creamPaint'], 'ab_caravan_truck': ['sandPaint', 'tealPaint'],
                         'pa_crawler_hab': ['rust', 'fadedTeal']}
                res = await pg.evaluate(ASSERT_JS, {'tol': TOL_M, 'under': UNDER_FRAC, 'ground': GROUND_TOL, 'seeds': a.seeds,
                                                    'maxMeshes': MAX_MESHES, 'maxTris': MAX_TRIS, 'bigTris': BIG_TRIS, 'paint': paint,
                                                    'tex': await pg.evaluate("()=>KratorVehicles.textures().on")})
                per = res['per']
                print('\n--- %d vehicles, %d builds (every variant, seeds 1..%d) ---' % (len(res['list']), len(per), a.seeds))
                for r in per:
                    if r['seed'] == 1:
                        print('  %s #%d: %s meshes, %s tris, size %s' % (r['key'], r['variant'] + 1, r.get('meshes'), r.get('tris'), ' x '.join(r.get('size', []))))
                checks = [('builds', lambda f: f.startswith(('build', 'no meshes'))),
                          ('no-nan-geometry', lambda f: 'NaN' in f),
                          ('wheels-on-ground', lambda f: f.startswith('ground:')),
                          ('declared-size', lambda f: f.startswith('outside declared')),
                          ('budget', lambda f: f.startswith('budget:')),
                          ('moving-parts', lambda f: f.startswith('moving:')),
                          ('tags', lambda f: f.startswith('tags:')),
                          ('colour', lambda f: f.startswith('colour:')),
                          ('textures', lambda f: f.startswith('textures:')),
                          ('clearance', lambda f: f.startswith('clearance:')),
                          ('deterministic', lambda f: f.startswith('deterministic:'))]
                print('\n--- invariants ---')
                for name, sel in checks:
                    bad = [(r, [f for f in r['fail'] if sel(f)]) for r in per]
                    bad = [(r, fs) for r, fs in bad if fs]
                    print(('  PASS  ' if not bad else '  FAIL  ') + name + ' : ' + ('%d builds' % len(per) if not bad else '%d failing' % len(bad)))
                    for r, fs in bad[:30]:
                        print('          %s #%d seed %d: %s' % (r['key'], r['variant'] + 1, r['seed'], '; '.join(fs)))
                    if bad:
                        fails.append('assert ' + name)
                # the bundle alone, in a blank page with only THREE
                pg2 = await b.new_page()
                await pg2.route('**/three.min.js', lambda route: asyncio.ensure_future(
                    route.fulfill(path=three, content_type='application/javascript')))
                errs2 = []
                pg2.on('pageerror', lambda e: errs2.append(str(e)))
                await pg2.route('**/blank.html', lambda route: asyncio.ensure_future(
                    route.fulfill(body='<!doctype html><html><head><meta charset="utf-8"></head><body></body></html>', content_type='text/html')))
                await pg2.goto('http://127.0.0.1:%d/blank.html' % port)
                al = await pg2.evaluate(ALONE_JS)
                ok = al['added'] == ['KratorVehicles'] and al['after'] == ['KratorVehicles'] and not al['errs'] and not errs2 \
                    and al['built'] and all(not s.endswith(':null') and not s.endswith(':0') for s in al['built'])
                print(('  PASS  ' if ok else '  FAIL  ') + 'bundle-alone : globals added %s; built %s%s' % (
                    al['added'], ', '.join(al['built']), ('; errors ' + '; '.join(al['errs'] + errs2)) if (al['errs'] or errs2) else ''))
                if not ok:
                    fails.append('assert bundle-alone')
                await pg2.close()
                print('\n--- warnings (reported, not failed) ---')
                under = [r for r in per if r['warn']]
                print('  WARN  under-size (>%d%% smaller than declared on an axis): %d builds' % (UNDER_FRAC * 100, len(under)))
                for r in under[:20]:
                    print('          %s #%d seed %d: %s' % (r['key'], r['variant'] + 1, r['seed'], '; '.join(r['warn'])))

            for ev in (a.eval or []):
                try:
                    print('eval:', json.dumps(await pg.evaluate(ev))[:3000])
                except Exception as e:
                    print('eval failed:', str(e)[:400])

            if a.out:
                fn = os.path.join(a.out, 'sheet.png'); await pg.screenshot(path=fn); print('shot:', fn)
                n = info['instances']
                views = [v.strip() for v in a.views.split(',') if v.strip()]
                for i in range(n):
                    for vw in views:
                        nm = await pg.evaluate("([i,v])=>window._sheet.view(i,v)", [i, vw])
                        await pg.wait_for_timeout(500)
                        fn = os.path.join(a.out, '%s_%d_%s.png' % (nm.split(' ')[0], i, vw)); await pg.screenshot(path=fn); print('shot:', fn)
                if a.night:
                    await pg.evaluate("()=>{window._sheet.setNight(true);window._sheet.setLights(true);window._sheet.view(0,'front34');ctl.dist=9;ctl.az=0.45;updateCamera();}")
                    await pg.wait_for_timeout(700)
                    fn = os.path.join(a.out, 'night_lights.png'); await pg.screenshot(path=fn); print('shot:', fn)
            await b.close()
    finally:
        httpd.shutdown()
    if fails:
        print('\nFAILED: ' + '; '.join(fails))
        return 1
    print('\nOK')
    return 0


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('html')
    ap.add_argument('--assert', dest='assert_', action='store_true')
    ap.add_argument('--seeds', type=int, default=3, help='with --assert: build seeds 1..N of every variant (default 3)')
    ap.add_argument('--out', default='')
    ap.add_argument('--views', default='front34,side', help='with --out: views per instance (front34, side, rear34, front, top)')
    ap.add_argument('--night', action='store_true', help='with --out: also the first row at night, lamps on')
    ap.add_argument('--eval', action='append')
    ap.add_argument('--size', default='1280x800')
    sys.exit(asyncio.run(run(ap.parse_args())))
