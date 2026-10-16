#!/usr/bin/env python3
"""Headless verification for the Mechs kit (dist/mechs.html, dist/krator-mechs.js).

Usage:
  python3 verify.py dist/mechs.html [--assert] [--seeds 2] [--out ./shots] [--views front34,side]
                                    [--anim] [--only key,key] [--night] [--eval "()=>..."] [--size 1280x800]

What it does (after kits/motor-vehicles/verify.py):
  1. Serves this folder over HTTP and routes three.min.js to the local r128 copy.
  2. Loads the sheet in headless Chromium with software WebGL (SwiftShader).
  3. Prints the error panel (#errs) and page errors; either fails the run.
  4. --assert, for EVERY mech, every variant, seeds 1..--seeds, built through KratorMechs.build and posed by
     KratorMechs.update (the skin is evaluated on the CPU, bone by bone, as the GPU does):
       builds            a group with SkinnedMeshes on one skeleton, a 'body' bone, at least one leg
       no-nan            no NaN in any bone or skinned vertex through idle, walking and the attack
       feet-on-ground    standing: each foot's lowest vertex is on the ground (GROUND_TOL) and nothing is below it
       declared-size     standing at rest, the skin and the banners fit the declared box centred on the origin
                         (x in [-w/2, w/2], y in [0, h], z in [-d/2, d/2], within TOL_M); much smaller is a WARN
       gait              walking at KratorMechs.speed for three cycles: no leg is stretched to its limit (IK reach
                         < REACH_MAX), every leg steps, and a planted foot does not slide (SLIDE_TOL per stance)
       attack            attack() runs its clip, gives the clip's events (fire / impact), and ends standing
       budget            at most MAX_DRAWS meshes (draw calls), MAX_TRIS triangles, MAX_BONES bones
       tags              class, type, drive, pilot, weapon from the kit's vocabularies; the data a host reads
       z-fighting        at rest, at most ZFIGHT_MAX triangles of differently coloured parts lie coplanar and overlapping
                         (KratorMechs.audit: the depth buffer cannot separate them, so they flicker)
       deterministic     two builds with the same seed are identical, vertex for vertex
     plus, in a BLANK page with only three.min.js:
       bundle-alone      dist/krator-mechs.js loads, adds exactly one global (KratorMechs), builds every mech
  5. --out: screenshots: the sheet, then per mech one per --views; --anim adds, per mech, a walking frame (side)
     and three frames of the attack (front34); --night the first lane at night.

Exit code is non-zero if the error panel is dirty, the page threw, or an assertion fails.
"""
import argparse, asyncio, http.server, json, os, socketserver, sys, threading

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

HERE = os.path.dirname(os.path.abspath(__file__))
TOL_M, UNDER_FRAC, GROUND_TOL = 0.06, 0.30, 0.04
REACH_MAX, SLIDE_TOL = 0.995, 0.03
ZFIGHT_MAX = 40          # triangles in coplanar overlap between differently coloured parts (KratorMechs.audit)
MAX_DRAWS, MAX_TRIS, MAX_BONES = 12, 32000, 96


def _exe():
    for c in (os.environ.get('PW_CHROMIUM'), '/opt/pw-browsers/chromium'):
        if c and os.path.exists(c):
            return {'executable_path': c}
    return {}


ASSERT_JS = r"""(cfg)=>{
const KM=KratorMechs, out={per:[]}, f2=x=>(Math.round(x*100)/100).toFixed(2);
const V=new THREE.Vector3(), W=new THREE.Vector3(), M=new THREE.Matrix4();
const only=cfg.only&&cfg.only.length?cfg.only:null;
/* the skin on the CPU: every vertex through its bones (bone.matrixWorld * boneInverse), as the GPU does */
function skinned(g, fn){
  g.updateMatrixWorld(true);
  g.traverse(o=>{
    if(!o.isSkinnedMesh)return;
    const sk=o.skeleton, p=o.geometry.attributes.position, si=o.geometry.attributes.skinIndex, sw=o.geometry.attributes.skinWeight;
    const mats=sk.bones.map((b,i)=>new THREE.Matrix4().multiplyMatrices(b.matrixWorld,sk.boneInverses[i]).multiply(o.bindMatrix));
    for(let i=0;i<p.count;i++){
      V.fromBufferAttribute(p,i); W.set(0,0,0);
      const ws=[sw.getX(i),sw.getY(i),sw.getZ(i),sw.getW(i)], is=[si.getX(i),si.getY(i),si.getZ(i),si.getW(i)];
      for(let k=0;k<4;k++){const w=ws[k]; if(w)W.addScaledVector(V.clone().applyMatrix4(mats[is[k]]),w);}
      fn(W,si.getX(i),o);
    }
  });
}
function measure(g){
  const box=new THREE.Box3(); let nan=false, draws=0, tris=0;
  skinned(g,(p)=>{ if(!isFinite(p.x+p.y+p.z))nan=true; else box.expandByPoint(p); });
  g.traverse(o=>{ if(!o.isMesh)return; draws++; tris+=(o.geometry.index?o.geometry.index.count:o.geometry.attributes.position.count)/3;
    if(!o.isSkinnedMesh){const p=o.geometry.attributes.position; for(let i=0;i<p.count;i++){W.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld); if(isFinite(W.x))box.expandByPoint(W); else nan=true;}}});
  return {box,nan,draws,tris:Math.round(tris)};
}
function feetMin(g){
  const legs=g.userData.legs, bi={}, mn={};
  g.userData.bones.forEach((n,i)=>bi[n]=i);
  for(const L of legs){mn[L.name]=1e9;}
  let all=1e9;
  skinned(g,(p,b)=>{ if(p.y<all)all=p.y; for(const L of legs) if(b===bi[L.name+'_ankle']&&p.y<mn[L.name])mn[L.name]=p.y; });
  return {mn,all};
}
function sig(g){let h=0;g.traverse(o=>{if(!o.isMesh)return;const a=o.geometry.attributes.position.array;
  for(let i=0;i<a.length;i+=7)h=(h*31+Math.round(a[i]*1e4))|0;h=(h*31+a.length)|0;});return h;}
const inList=(v,L)=>L.indexOf(v)>=0, step=(g,s,dt)=>{const ev=[];for(let t=0;t<s;t+=dt)ev.push.apply(ev,KM.update(g,dt));return ev;};
for(const E of KM.list()){
  if(only&&only.indexOf(E.key)<0)continue;
  for(let v=0;v<E.variants;v++)for(let seed=1;seed<=cfg.seeds;seed++){
    const r={key:E.key,variant:v,seed,fail:[],warn:[]};
    let g;
    try{g=KM.build(E.key,{variant:v,seed});}catch(e){r.fail.push('build threw: '+e.message);out.per.push(r);continue;}
    if(!g){r.fail.push('build returned null');out.per.push(r);continue;}
    const sm=[];g.traverse(o=>{if(o.isSkinnedMesh)sm.push(o);});
    if(!sm.length)r.fail.push('build: no skinned meshes');
    if(sm.some(o=>o.skeleton!==sm[0].skeleton))r.fail.push('build: more than one skeleton');
    if(g.userData.bones.indexOf('body')<0)r.fail.push('build: no body bone');
    if(!g.userData.legs.length)r.fail.push('build: no legs');
    /* declared size, at rest */
    const m0=measure(g), b=m0.box;
    r.size=[f2(b.max.x-b.min.x),f2(b.max.y-b.min.y),f2(b.max.z-b.min.z)]; r.box=[f2(b.min.x),f2(b.max.x),f2(b.min.y),f2(b.max.y),f2(b.min.z),f2(b.max.z)];
    r.draws=m0.draws; r.tris=m0.tris; r.bones=g.userData.bones.length;
    if(m0.nan)r.fail.push('NaN in the rest pose');
    const t=cfg.tol;
    if(b.min.x<-E.w/2-t||b.max.x>E.w/2+t||b.min.z<-E.d/2-t||b.max.z>E.d/2+t||b.max.y>E.h+t)
      r.fail.push('outside declared '+E.w+' x '+E.d+' x '+E.h+': x '+r.box[0]+'..'+r.box[1]+' y ..'+r.box[3]+' z '+r.box[4]+'..'+r.box[5]);
    for(const [ax,lo,hi,dec] of [['w',b.min.x,b.max.x,E.w],['h',0,b.max.y,E.h],['d',b.min.z,b.max.z,E.d]])
      if(hi-lo<dec*(1-cfg.under))r.warn.push(ax+' '+f2(hi-lo)+' of '+dec);
    if(m0.draws>cfg.maxDraws||m0.tris>cfg.maxTris||r.bones>cfg.maxBones)r.fail.push('budget: '+m0.draws+' draws, '+m0.tris+' tris, '+r.bones+' bones');
    /* feet on the ground, standing */
    step(g,1.5,1/30);
    const fm=feetMin(g);
    for(const L of g.userData.legs) if(Math.abs(fm.mn[L.name])>cfg.ground)r.fail.push('ground: '+L.name+' lowest at '+f2(fm.mn[L.name]));
    if(fm.all<-cfg.ground)r.fail.push('ground: something at y '+f2(fm.all));
    /* the gait: walk at the kit's speed for three cycles, the group moving */
    KM.reset(g); KM.setState(g,'walk');
    const sp=KM.speed(g), G=E.data.gait, dt=1/30, T=G.period*3, bi={};
    g.userData.bones.forEach((n,i)=>bi[n]=i);
    const ank=g.userData.legs.map(L=>g.getObjectByName(L.name+'_ankle'));
    const prev=ank.map(()=>null), slide=ank.map(()=>0), steps={}; let nan=false;
    for(let tt=0;tt<T;tt+=dt){
      g.position.z+=sp*dt;
      for(const e of KM.update(g,dt)) if(e.type==='step')steps[e.leg]=(steps[e.leg]||0)+1;
      const F=KM.feet(g);
      ank.forEach((a,i)=>{const p=new THREE.Vector3().setFromMatrixPosition(a.matrixWorld);
        if(!isFinite(p.x+p.y+p.z))nan=true;
        if(F[i].planted&&prev[i])slide[i]=Math.max(slide[i],Math.hypot(p.x-prev[i].x,p.z-prev[i].z,p.y-prev[i].y));
        prev[i]=F[i].planted?p:null;});
    }
    const st=KM.state(g); r.reach=f2(st.reach); r.speed=f2(sp);
    if(nan)r.fail.push('NaN while walking');
    if(st.reach>cfg.reachMax)r.fail.push('gait: a leg reaches '+f2(st.reach)+' of its length');
    g.userData.legs.forEach((L,i)=>{ if(!steps[L.name])r.fail.push('gait: '+L.name+' never stepped');
      if(slide[i]>cfg.slide)r.fail.push('gait: '+L.name+' slides '+f2(slide[i])+' m while planted'); });
    r.slide=f2(Math.max.apply(null,slide));
    /* the attack */
    KM.setState(g,'idle'); step(g,G.period*1.5,dt);
    const dur=KM.attack(g), A=KM.clip(E.key,v), want={};
    for(const e of (A.events||[]))want[e.type]=(want[e.type]||0)+1;
    if(!(dur>0))r.fail.push('attack: no clip');
    const got={}; for(const e of step(g,dur+0.6,dt)) if(e.type!=='step'){got[e.type]=(got[e.type]||0)+1; if(!isFinite(e.pos[0]+e.pos[1]+e.pos[2]))nan=true;}
    for(const k in want) if((got[k]||0)<want[k])r.fail.push('attack: '+want[k]+' '+k+' events in the clip, '+(got[k]||0)+' given');
    if(KM.state(g).attacking)r.fail.push('attack: still attacking after its clip');
    const m1=measure(g); if(m1.nan||nan)r.fail.push('NaN after the attack');
    r.events=Object.keys(got).map(k=>k+' '+got[k]).join(', ');
    /* tags and data */
    const T2=E.tags||{}, D=E.data, u=g.userData;
    if(!inList(T2.class,KM.CLASSES))r.fail.push('tags: class '+T2.class);
    if(!Array.isArray(T2.type)||!T2.type.length||T2.type.some(x=>!inList(x,KM.TYPES)))r.fail.push('tags: type '+T2.type);
    if(!inList(T2.drive,KM.DRIVES))r.fail.push('tags: drive '+T2.drive);
    if(!inList(T2.pilot,KM.PILOTS))r.fail.push('tags: pilot '+T2.pilot);
    if(!Array.isArray(T2.weapon)||!T2.weapon.length||T2.weapon.some(x=>!inList(x,KM.WEAPONS)))r.fail.push('tags: weapon '+T2.weapon);
    for(const k of ['height','mass','crew','pilot','weapon'])if(D[k]==null)r.fail.push('tags: data.'+k+' missing');
    if(!(D.speed>0))r.fail.push('tags: data.speed');
    if(u.key!==E.key||u.culture!==E.culture||!u.tags||u.tags.class!==T2.class)r.fail.push('tags: userData does not carry key/culture/tags');
    /* z-fighting: coplanar overlapping faces of different colours, at rest */
    const za=KM.audit(E.key,{variant:v,seed}), zt=za.reduce((a,x)=>a+x.n,0); r.zfight=zt;
    if(zt>cfg.zmax)r.fail.push('zfight: '+zt+' triangles; worst '+za.slice(0,3).map(x=>x.bone+' '+x.a+' vs '+x.b+' ('+x.n+')').join(', '));
    /* deterministic */
    const g2=KM.build(E.key,{variant:v,seed});
    if(sig(KM.build(E.key,{variant:v,seed}))!==sig(g2))r.fail.push('deterministic: two builds with seed '+seed+' differ');
    KM.dispose(g); KM.dispose(g2);
    out.per.push(r);
  }
}
out.list=KM.list().map(E=>({key:E.key,name:E.name,variants:E.variants,w:E.w,d:E.d,h:E.h}));
return out;}"""

ALONE_JS = r"""async ()=>{
  const load=src=>new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=()=>rej(new Error('load '+src));document.head.appendChild(s);});
  const errs=[]; window.addEventListener('error',e=>errs.push(String(e.message)));
  await load('three.min.js');
  const before=new Set(Object.getOwnPropertyNames(window));
  await load('dist/krator-mechs.js');
  const added=Object.getOwnPropertyNames(window).filter(k=>!before.has(k));
  const built=[];
  if(window.KratorMechs)for(const E of KratorMechs.list()){
    const g=KratorMechs.build(E.key,{seed:3}); KratorMechs.update(g,0.1); built.push(E.key+':'+(g?g.children.length:'null'));}
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
    only = [k for k in (a.only or '').split(',') if k]
    try:
        async with async_playwright() as p:
            b = await p.chromium.launch(**_exe(), args=['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'])
            W, H = [int(t) for t in a.size.split('x')]
            pg = await b.new_page(viewport={'width': W, 'height': H})
            pg.set_default_timeout(900000)
            errs = []
            pg.on('pageerror', lambda e: errs.append(str(e)))
            await pg.route('**/three.min.js', lambda route: asyncio.ensure_future(
                route.fulfill(path=three, content_type='application/javascript')))
            await pg.goto('http://127.0.0.1:%d/%s%s' % (port, rel, a.query), timeout=900000)
            try:
                await pg.wait_for_function("window._ready===true || document.getElementById('errs').textContent.length>0", timeout=580000)
            except Exception:
                print('timed out waiting for the sheet to build'); fails.append('build timeout')
            await pg.wait_for_timeout(1500)
            await pg.evaluate("()=>window._sheet&&window._sheet.pause(true)")
            panel = await pg.evaluate("document.getElementById('errs').textContent")
            print('ERROR PANEL:', repr(panel[:2500]) if panel else 'clean')
            if panel:
                fails.append('error panel not clean')
            if errs:
                print('PAGE ERRORS:', errs[:5]); fails.append('page errors')
            info = await pg.evaluate("()=>({ready:!!window._ready,calls:renderer.info.render.calls,tris:renderer.info.render.triangles,"
                                     "instances:(window._sheet||{instances:[]}).instances.length})")
            print('ready:', info['ready'], ' instances:', info['instances'], ' draw calls:', info['calls'], ' triangles:', info['tris'])
            if a.assert_ and info['ready']:
                res = await pg.evaluate(ASSERT_JS, {'tol': TOL_M, 'under': UNDER_FRAC, 'ground': GROUND_TOL, 'seeds': a.seeds,
                                                    'maxDraws': MAX_DRAWS, 'maxTris': MAX_TRIS, 'maxBones': MAX_BONES,
                                                    'reachMax': REACH_MAX, 'slide': SLIDE_TOL, 'only': only, 'zmax': ZFIGHT_MAX})
                per = res['per']
                print('\n--- %d mechs, %d builds (every variant, seeds 1..%d) ---' % (len(res['list']), len(per), a.seeds))
                for r in per:
                    if r['seed'] == 1:
                        print('  %-14s #%d: %s draws, %s tris, %s bones, size %s (x %s..%s, y %s..%s, z %s..%s), %s m/s, reach %s, slide %s, %s' % (
                            r['key'], r['variant'] + 1, r.get('draws'), r.get('tris'), r.get('bones'), ' x '.join(r.get('size', [])),
                            *(r.get('box') or ['?'] * 6), r.get('speed'), r.get('reach'), r.get('slide'), r.get('events')) + ', z-fight %s' % r.get('zfight'))
                checks = [('builds', lambda f: f.startswith('build')),
                          ('no-nan', lambda f: 'NaN' in f),
                          ('feet-on-ground', lambda f: f.startswith('ground:')),
                          ('declared-size', lambda f: f.startswith('outside declared')),
                          ('gait', lambda f: f.startswith('gait:')),
                          ('attack', lambda f: f.startswith('attack:')),
                          ('budget', lambda f: f.startswith('budget:')),
                          ('z-fighting', lambda f: f.startswith('zfight:')),
                          ('tags', lambda f: f.startswith('tags:')),
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
                pg2 = await b.new_page()
                await pg2.route('**/three.min.js', lambda route: asyncio.ensure_future(
                    route.fulfill(path=three, content_type='application/javascript')))
                errs2 = []
                pg2.on('pageerror', lambda e: errs2.append(str(e)))
                await pg2.route('**/blank.html', lambda route: asyncio.ensure_future(
                    route.fulfill(body='<!doctype html><html><head><meta charset="utf-8"></head><body></body></html>', content_type='text/html')))
                await pg2.goto('http://127.0.0.1:%d/blank.html' % port)
                al = await pg2.evaluate(ALONE_JS)
                ok = al['added'] == ['KratorMechs'] and al['after'] == ['KratorMechs'] and not al['errs'] and not errs2 \
                    and al['built'] and all(not s.endswith(':null') and not s.endswith(':0') for s in al['built'])
                print(('  PASS  ' if ok else '  FAIL  ') + 'bundle-alone : globals added %s; built %d%s' % (
                    al['added'], len(al['built']), ('; errors ' + '; '.join(al['errs'] + errs2)) if (al['errs'] or errs2) else ''))
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
                    print('eval:', json.dumps(await pg.evaluate(ev))[:60000])
                except Exception as e:
                    print('eval failed:', str(e)[:400])
            for k, ev in enumerate(a.close or []):
                await pg.evaluate(ev)
                await pg.wait_for_timeout(400)
                fn = os.path.join(a.out or '.', 'close_%d.png' % k); await pg.screenshot(path=fn); print('shot:', fn)
            if a.out:
                await pg.evaluate("()=>{window._sheet.overview();window._sheet.step(1/30,30);}")
                await pg.wait_for_timeout(400)
                fn = os.path.join(a.out, 'sheet.png'); await pg.screenshot(path=fn); print('shot:', fn)
                lanes = await pg.evaluate("()=>window._sheet.lanes.map(L=>L.key+(L.g.userData.variant?'_v'+L.g.userData.variant:''))")
                views = [v.strip() for v in a.views.split(',') if v.strip()]
                for i, key in enumerate(lanes):
                    if only and key.split('_v')[0] not in only:
                        continue
                    for vw in views:
                        await pg.evaluate("([i,v])=>window._sheet.view(i,v)", [i, vw])
                        await pg.wait_for_timeout(300)
                        fn = os.path.join(a.out, '%s_%s.png' % (key, vw)); await pg.screenshot(path=fn); print('shot:', fn)
                    if a.anim:
                        # walking: on the spot, a third of the way into a stride
                        await pg.evaluate("([i])=>{const S=window._sheet,L=S.lanes[i];KratorMechs.reset(L.g);KratorMechs.setState(L.g,'walk');"
                                          "S.step(1/30,Math.round(KratorMechs.get(L.key).gait.period*1.35*30));S.view(i,'side');}", [i])
                        await pg.wait_for_timeout(300)
                        fn = os.path.join(a.out, '%s_walk.png' % key); await pg.screenshot(path=fn); print('shot:', fn)
                        # the attack: windup, the blow, after
                        await pg.evaluate("([i])=>{const L=window._sheet.lanes[i];KratorMechs.setState(L.g,'idle');KratorMechs.reset(L.g);window._sheet.step(1/30,20);}", [i])
                        keys = await pg.evaluate("([i])=>KratorMechs.clip(window._sheet.lanes[i].key,window._sheet.lanes[i].g.userData.variant).keys.map(k=>k[0])", [i])
                        await pg.evaluate("([i])=>KratorMechs.attack(window._sheet.lanes[i].g)", [i])
                        tprev = 0
                        for j, tk in enumerate(keys[1:3] + [keys[2] + 0.12]):
                            await pg.evaluate("([i,n])=>{window._sheet.step(1/30,n);window._sheet.view(i,'front34');}", [i, max(1, round((tk - tprev) * 30))])
                            tprev = tk
                            await pg.wait_for_timeout(300)
                            fn = os.path.join(a.out, '%s_attack%d.png' % (key, j)); await pg.screenshot(path=fn); print('shot:', fn)
                        await pg.evaluate("([i])=>{window._sheet.step(1/30,90);KratorMechs.reset(window._sheet.lanes[i].g);}", [i])
                if a.march:
                    # every lane marches for 25 s (two U-turns for the quick ones), then the overview and one mech mid-turn
                    rows = await pg.evaluate("()=>{const S=window._sheet;S.showAll();S.setMode('march');let mx=0;"
                                             "for(let i=0;i<750;i++){S.step(1/30,1);for(const L of S.lanes)mx=Math.max(mx,KratorMechs.state(L.g).reach);}"
                                             "S.overview();return S.lanes.map(L=>L.key+' z '+(L.g.position.z-L.z0).toFixed(1)+' dx '+(L.g.position.x-L.x0).toFixed(1)+"
                                             "' heading '+(L.heading/Math.PI).toFixed(2)+'pi '+L.mode+' reach '+KratorMechs.state(L.g).reach.toFixed(2)).concat(['max reach '+mx.toFixed(3)]);}")
                    print('march:\n  ' + '\n  '.join(rows))
                    await pg.wait_for_timeout(400)
                    fn = os.path.join(a.out, 'march_overview.png'); await pg.screenshot(path=fn); print('shot:', fn)
                    await pg.evaluate("()=>{const S=window._sheet;for(let k=0;k<400;k++){S.step(1/30,1);if(S.lanes.some(L=>L.mode==='turn'&&L.turned>1.2))break;}"
                                      "const L=S.lanes.find(L=>L.mode==='turn')||S.lanes[0];ctl.target.set(L.g.position.x,2.5,L.g.position.z);"
                                      "ctl.dist=17;ctl.az=0.9;ctl.el=0.28;updateCamera();sun.target.position.set(ctl.target.x,0,ctl.target.z);"
                                      "sun.position.copy(sun.target.position).addScaledVector(sun.position.clone().sub(sun.target.position).normalize(),300);}")
                    await pg.wait_for_timeout(400)
                    fn = os.path.join(a.out, 'march_turn.png'); await pg.screenshot(path=fn); print('shot:', fn)
                if a.night:
                    await pg.evaluate("()=>{window._sheet.setNight(true);window._sheet.setLights(true);window._sheet.view(0,'front34');}")
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
    ap.add_argument('--seeds', type=int, default=2, help='with --assert: build seeds 1..N of every variant (default 2)')
    ap.add_argument('--out', default='')
    ap.add_argument('--views', default='front34,side', help='with --out: views per mech (front34, side, rear34, front, top, low)')
    ap.add_argument('--anim', action='store_true', help='with --out: a walking frame and three attack frames per mech')
    ap.add_argument('--only', default='', help='comma-separated mech keys to check and shoot')
    ap.add_argument('--march', action='store_true', help='with --out: march every lane for 25 s; the overview and a mech mid-turn')
    ap.add_argument('--night', action='store_true', help='with --out: also the first lane at night, lamps on')
    ap.add_argument('--query', default='', help='appended to the page URL, e.g. ?tex=0')
    ap.add_argument('--eval', action='append')
    ap.add_argument('--close', action='append', help='an expression that sets up the camera; then a screenshot close_<n>.png')
    ap.add_argument('--size', default='1280x800')
    sys.exit(asyncio.run(run(ap.parse_args())))
