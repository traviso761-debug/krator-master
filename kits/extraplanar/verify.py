#!/usr/bin/env python3
"""Headless verification of the Extraplanar kit (dist/extraplanar.html, dist/krator-extraplanar.js) on the shared harness.

  python3 verify.py dist/extraplanar.html [--assert] [--seeds 2] [--out shots] [--views "A|B"] [--only key,key] [--size 1280x800]

--assert, for EVERY hunter, seeds 1..--seeds, built through KratorExtraplanar.build and posed by update (the skin evaluated on the
CPU, bone by bone, as the GPU does; after kits/mechs/verify.py):
    builds            a group with SkinnedMeshes on one skeleton, a 'body' bone, legs
    no-nan            no NaN in any bone or skinned vertex through idle, walking and the attack
    feet-on-ground    standing: each foot's lowest vertex is on the ground and nothing is below it; WALKING over the page's swell
                      (the host sets the group's height, the kit plants the feet on ground(x, z)): every planted foot within
                      GROUND_TOL of the ground under it
    declared-size     at rest the skin fits the declared box (x in [-w/2, w/2], y in [0, h], z in [-d/2, d/2], within TOL_M)
    gait              three cycles at the kit's speed: IK reach < REACH_MAX, every leg steps, no planted foot slides
    attack            attack() runs its clip, the TELL (a `call` of kind `tell`) comes first, every event of the clip is given, it ends standing
    budget            at most MAX_DRAWS meshes, MAX_TRIS triangles, MAX_BONES bones
    tags              class, type, drive, pilot, weapon from the kit's vocabularies; the data a host reads; a silhouette set
    z-fighting        at rest, at most ZFIGHT_MAX coplanar overlapping triangles of different colours (audit)
    deterministic     two builds with one seed are identical, vertex for vertex
  the field (the page's own checks, hostChecks, each kind with a negative): every phenomenon and portal registered before it is
  drawn, the pose deterministic and bounded, the hum bounded, the openness in 0..1 and by state, the tint, the weather on
  core/atmos, the silhouettes;
  bundle-alone: in a blank page with three.min.js, core/rand, core/space and core/tags, dist/krator-extraplanar.js adds exactly
  one global (KratorExtraplanar), builds every hunter, makes and registers a record and draws it.
--out: screenshots, one per view (or --views "A|B"). KRATOR_GL=gpu runs on the real GPU, under the lock.
Exit code non-zero if the error panel is dirty, the page threw, or an assertion fails (plus the harness's universal asserts).
"""
import argparse, asyncio, json, os, sys

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
from harness import verify_page, local_three, Abort  # noqa: E402

TOL_M, GROUND_TOL = 0.06, 0.04
REACH_MAX, SLIDE_TOL = 0.995, 0.03
ZFIGHT_MAX = 40
MAX_DRAWS, MAX_TRIS, MAX_BONES = 12, 32000, 96

ASSERT_JS = r"""(cfg)=>{
const KM=KratorExtraplanar, out={per:[]}, f2=x=>(Math.round(x*100)/100).toFixed(2);
const V=new THREE.Vector3(), W=new THREE.Vector3();
const only=cfg.only&&cfg.only.length?cfg.only:null, ground=terrainH;
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
  g.traverse(o=>{ if(!o.isMesh)return; draws++; tris+=(o.geometry.index?o.geometry.index.count:o.geometry.attributes.position.count)/3; });
  return {box,nan,draws,tris:Math.round(tris)};
}
function feetMin(g){
  const legs=g.userData.legs, bi={}, mn={}; g.userData.bones.forEach((n,i)=>bi[n]=i); for(const L of legs)mn[L.name]=1e9; let all=1e9;
  skinned(g,(p,b)=>{ if(p.y<all)all=p.y; for(const L of legs) if(b===bi[L.name+'_ankle']&&p.y<mn[L.name])mn[L.name]=p.y; });
  return {mn,all};
}
function sig(g){let h=0;g.traverse(o=>{if(!o.isMesh)return;const a=o.geometry.attributes.position.array;for(let i=0;i<a.length;i+=7)h=(h*31+Math.round(a[i]*1e4))|0;h=(h*31+a.length)|0;});return h;}
const inList=(v,L)=>L.indexOf(v)>=0, step=(g,s,dt,gr)=>{const ev=[];for(let t=0;t<s;t+=dt)ev.push.apply(ev,KM.update(g,dt,gr?{ground:gr}:undefined));return ev;};
for(const E of KM.list()){
  if(only&&only.indexOf(E.key)<0)continue;
  for(let seed=1;seed<=cfg.seeds;seed++){
    const r={key:E.key,seed,fail:[],warn:[]};
    let g;
    try{g=KM.build(E.key,{seed});}catch(e){r.fail.push('build threw: '+e.message);out.per.push(r);continue;}
    if(!g){r.fail.push('build returned null');out.per.push(r);continue;}
    const sm=[];g.traverse(o=>{if(o.isSkinnedMesh)sm.push(o);});
    if(!sm.length)r.fail.push('build: no skinned meshes');
    if(sm.some(o=>o.skeleton!==sm[0].skeleton))r.fail.push('build: more than one skeleton');
    if(g.userData.bones.indexOf('body')<0)r.fail.push('build: no body bone');
    if(!g.userData.legs.length)r.fail.push('build: no legs');
    const m0=measure(g), b=m0.box;
    r.size=[f2(b.max.x-b.min.x),f2(b.max.y-b.min.y),f2(b.max.z-b.min.z)]; r.box=[f2(b.min.x),f2(b.max.x),f2(b.min.y),f2(b.max.y),f2(b.min.z),f2(b.max.z)];
    r.draws=m0.draws; r.tris=m0.tris; r.bones=g.userData.bones.length;
    if(m0.nan)r.fail.push('NaN in the rest pose');
    const t=cfg.tol;
    if(b.min.x<-E.w/2-t||b.max.x>E.w/2+t||b.min.z<-E.d/2-t||b.max.z>E.d/2+t||b.max.y>E.h+t)
      r.fail.push('outside declared '+E.w+' x '+E.d+' x '+E.h+': x '+r.box[0]+'..'+r.box[1]+' y ..'+r.box[3]+' z '+r.box[4]+'..'+r.box[5]);
    if(m0.draws>cfg.maxDraws||m0.tris>cfg.maxTris||r.bones>cfg.maxBones)r.fail.push('budget: '+m0.draws+' draws, '+m0.tris+' tris, '+r.bones+' bones');
    /* feet on the ground, standing (flat) */
    step(g,1.5,1/30);
    const fm=feetMin(g);
    for(const L of g.userData.legs) if(Math.abs(fm.mn[L.name])>cfg.ground)r.fail.push('ground: '+L.name+' lowest at '+f2(fm.mn[L.name]));
    if(fm.all<-cfg.ground)r.fail.push('ground: something at y '+f2(fm.all));
    /* the gait over the swell: a fresh build (reset() plants at the group's height), the host setting the group's height each step */
    KM.dispose(g); g=KM.build(E.key,{seed}); g.position.set(20+seed*7,0,0); g.position.y=ground(g.position.x,0); KM.setState(g,'walk');
    const sp=KM.speed(g), G=E.data.gait, dt=1/30, T=G.period*3;
    const ank=g.userData.legs.map(L=>g.getObjectByName(L.name+'_ankle'));
    const prev=ank.map(()=>null), slide=ank.map(()=>0), steps={}; let nan=false, footOff=0;
    for(let tt=0;tt<T;tt+=dt){
      g.position.z+=sp*dt; g.position.y=ground(g.position.x,g.position.z);
      for(const e of KM.update(g,dt,{ground})) if(e.type==='step')steps[e.leg]=(steps[e.leg]||0)+1;
      const F=KM.feet(g);
      ank.forEach((a,i)=>{const p=new THREE.Vector3().setFromMatrixPosition(a.matrixWorld);
        if(!isFinite(p.x+p.y+p.z))nan=true;
        if(F[i].planted&&prev[i])slide[i]=Math.max(slide[i],prev[i].distanceTo(p));
        prev[i]=F[i].planted?p:null;
        if(F[i].planted)footOff=Math.max(footOff,Math.abs(F[i].pos[1]-ground(F[i].pos[0],F[i].pos[2])));});
    }
    const st=KM.state(g); r.reach=f2(st.reach); r.speed=f2(sp); r.footOff=f2(footOff);
    if(nan)r.fail.push('NaN while walking');
    if(st.reach>cfg.reachMax)r.fail.push('gait: a leg reaches '+f2(st.reach)+' of its length');
    g.userData.legs.forEach((L,i)=>{ if(!steps[L.name])r.fail.push('gait: '+L.name+' never stepped');
      if(slide[i]>cfg.slide)r.fail.push('gait: '+L.name+' slides '+f2(slide[i])+' m while planted'); });
    if(footOff>cfg.ground)r.fail.push('ground: a planted foot '+f2(footOff)+' m off the ground while walking');
    r.slide=f2(Math.max.apply(null,slide));
    /* the attack: the tell first, every event, standing after */
    KM.setState(g,'idle'); step(g,G.period*1.5,dt,ground);
    const dur=KM.attack(g), A=KM.clip(E.key,0), want={};
    for(const e of (A.events||[]))want[e.type]=(want[e.type]||0)+1;
    if(!(dur>0))r.fail.push('attack: no clip');
    const got={}, order=[]; for(const e of step(g,dur+0.6,dt,ground)) if(e.type!=='step'){got[e.type]=(got[e.type]||0)+1; order.push(e.type+(e.kind?':'+e.kind:'')); if(!isFinite(e.pos[0]+e.pos[1]+e.pos[2]))nan=true;}
    for(const k in want) if((got[k]||0)<want[k])r.fail.push('attack: '+want[k]+' '+k+' events in the clip, '+(got[k]||0)+' given');
    if(order[0]!=='call:tell')r.fail.push('attack: the tell is not first ('+order.join(', ')+')');
    if(KM.state(g).attacking)r.fail.push('attack: still attacking after its clip');
    const m1=measure(g); if(m1.nan||nan)r.fail.push('NaN after the attack');
    r.events=order.join(', ');
    /* tags and data */
    const T2=E.tags||{}, D=E.data, u=g.userData;
    if(!inList(T2.class,KM.CLASSES))r.fail.push('tags: class '+T2.class);
    if(!Array.isArray(T2.type)||!T2.type.length||T2.type.some(x=>!inList(x,KM.TYPES)))r.fail.push('tags: type '+T2.type);
    if(!inList(T2.drive,KM.DRIVES))r.fail.push('tags: drive '+T2.drive);
    if(!inList(T2.pilot,KM.PILOTS))r.fail.push('tags: pilot '+T2.pilot);
    const VT=u.tags||{};
    if(!Array.isArray(VT.weapon)||!VT.weapon.length||VT.weapon.some(x=>!inList(x,KM.WEAPONS)))r.fail.push('tags: weapon '+VT.weapon);
    for(const k of ['height','mass','crew','pilot','weapon'])if(D[k]==null)r.fail.push('tags: data.'+k+' missing');
    if(!(D.speed>0))r.fail.push('tags: data.speed');
    if(u.key!==E.key||u.culture!=='extraplanar'||!u.tags||u.tags.class!==T2.class)r.fail.push('tags: userData does not carry key/culture/tags');
    const S=KM.silhouetteOf(E.key); if(!S||!KM.SILHOUETTES[S.set]||!(S.h>0))r.fail.push('tags: no silhouette set'); else r.silhouette=S.set;
    /* z-fighting */
    const za=KM.audit(E.key,{seed}), zt=za.reduce((a,x)=>a+x.n,0); r.zfight=zt;
    if(zt>cfg.zmax)r.fail.push('zfight: '+zt+' triangles; worst '+za.slice(0,3).map(x=>x.bone+' '+x.a+' vs '+x.b+' ('+x.n+')').join(', '));
    /* deterministic */
    const g2=KM.build(E.key,{seed});
    if(sig(KM.build(E.key,{seed}))!==sig(g2))r.fail.push('deterministic: two builds with seed '+seed+' differ');
    KM.dispose(g); KM.dispose(g2);
    out.per.push(r);
  }
}
out.list=KM.list().map(E=>({key:E.key,name:E.name,w:E.w,d:E.d,h:E.h}));
return out;}"""

ALONE_JS = r"""async ()=>{
  const load=src=>new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=()=>rej(new Error('load '+src));document.head.appendChild(s);});
  const errs=[]; window.addEventListener('error',e=>errs.push(String(e.message)));
  await load('three.min.js'); await load('xcore/08-core-rand.js'); await load('xcore/20-core-space.js'); await load('xcore/50-core-tags.js'); await load('xcore/52-core-tags-vocab.js');
  const before=new Set(Object.getOwnPropertyNames(window));
  await load('dist/krator-extraplanar.js');
  const added=Object.getOwnPropertyNames(window).filter(k=>!before.has(k));
  const built=[]; let field='';
  if(window.KratorExtraplanar){const KE=KratorExtraplanar;
    for(const E of KE.list()){const g=KE.build(E.key,{seed:3}); KE.update(g,0.1); built.push(E.key+':'+(g?g.children.length:'null'));}
    try{const R=KE.registry.create({tags:KTAGS.create({build:'alone'})});const r=R.add(KE.phenomenon('solid',{seed:2}));const g=KE.draw.phenomenon(r,R);const p=R.add(KE.portal('tear',{seed:3,state:'open'}));const gp=KE.draw.portal(p,R);
      field=(R.check().ok&&g.children.length>0&&gp.children.length>0&&KE.far('tripod',11).userData.tris>0)?'ok':'bad';}catch(e){field='threw: '+e.message;}}
  const after=Object.getOwnPropertyNames(window).filter(k=>!before.has(k));
  return {added,after,built,field,errs};}"""


async def run(a):
    if a.out:
        os.makedirs(a.out, exist_ok=True)
    three = local_three(os.path.dirname(os.path.abspath(a.html)), HERE)
    only = [k for k in (a.only or '').split(',') if k]
    async with verify_page(a.html, here=HERE, size=a.size, query=a.query, root=HERE, settle_ms=2500) as V:
        pg, errs, fails, b, port = V.page, V.errs, V.fails, V.browser, V.port
        pg.set_default_timeout(900000)
        if not V.ready:
            print('timed out waiting for the page'); fails.append('page timeout')
        await pg.evaluate("()=>window._xp&&window._xp.pause(true)")
        print('stage:', json.dumps(await pg.evaluate("()=>window._api?window._api.stage():null"))[:600])
        if a.assert_ and V.ready:
            res = await pg.evaluate(ASSERT_JS, {'tol': TOL_M, 'ground': GROUND_TOL, 'seeds': a.seeds, 'maxDraws': MAX_DRAWS, 'maxTris': MAX_TRIS, 'maxBones': MAX_BONES,
                                                'reachMax': REACH_MAX, 'slide': SLIDE_TOL, 'only': only, 'zmax': ZFIGHT_MAX})
            per = res['per']
            print('\n--- %d hunters, %d builds (seeds 1..%d) ---' % (len(res['list']), len(per), a.seeds))
            for r in per:
                print('  %-12s seed %d: %s draws, %s tris, %s bones, size %s, %s m/s, reach %s, slide %s, foot off %s, z-fight %s, %s, far %s' % (
                    r['key'], r['seed'], r.get('draws'), r.get('tris'), r.get('bones'), ' x '.join(r.get('size', [])), r.get('speed'), r.get('reach'), r.get('slide'), r.get('footOff'), r.get('zfight'), r.get('events'), r.get('silhouette')))
            checks = [('builds', lambda f: f.startswith('build')), ('no-nan', lambda f: 'NaN' in f), ('feet-on-ground', lambda f: f.startswith('ground:')),
                      ('declared-size', lambda f: f.startswith('outside declared')), ('gait', lambda f: f.startswith('gait:')), ('attack', lambda f: f.startswith('attack:')),
                      ('budget', lambda f: f.startswith('budget:')), ('z-fighting', lambda f: f.startswith('zfight:')), ('tags', lambda f: f.startswith('tags:')),
                      ('deterministic', lambda f: f.startswith('deterministic:'))]
            print('\n--- the hunters: invariants ---')
            for name, sel in checks:
                bad = [(r, [f for f in r['fail'] if sel(f)]) for r in per]
                bad = [(r, fs) for r, fs in bad if fs]
                print(('  PASS  ' if not bad else '  FAIL  ') + name + ' : ' + ('%d builds' % len(per) if not bad else '%d failing' % len(bad)))
                for r, fs in bad[:30]:
                    print('          %s seed %d: %s' % (r['key'], r['seed'], '; '.join(fs)))
                if bad:
                    fails.append('assert ' + name)
            print('\n--- the field: the page\'s checks ---')
            for c in await pg.evaluate('window._api.hostChecks()'):
                print(('  PASS  ' if c['ok'] else '  FAIL  ') + c['name'] + (' : ' + c['detail'] if c.get('detail') else ''))
                if not c['ok']:
                    fails.append('field: ' + c['name'])
            for e in await pg.evaluate('window._api.hostNegatives()'):
                print(('  PASS  ' if e['failed'] else '  FAIL  ') + 'NEGATIVE ' + e['name'])
                if not e['failed']:
                    fails.append('negative: ' + e['name'])
            # the bundle alone
            pg2 = await b.new_page()
            await pg2.route('**/three.min.js', lambda route: asyncio.ensure_future(route.fulfill(path=three, content_type='application/javascript')))
            for f, p in [('08-core-rand.js', 'core/rand'), ('20-core-space.js', 'core/space'), ('50-core-tags.js', 'core/tags'), ('52-core-tags-vocab.js', 'core/tags')]:
                src = os.path.join(ROOT, p, f)
                await pg2.route('**/xcore/' + f, lambda route, *, src=src: asyncio.ensure_future(route.fulfill(path=src, content_type='application/javascript')))   # keyword-only: a two-positional handler is given (route, request)
            errs2 = []
            pg2.on('pageerror', lambda e: errs2.append(str(e)))
            await pg2.route('**/blank.html', lambda route: asyncio.ensure_future(route.fulfill(body='<!doctype html><html><head><meta charset="utf-8"></head><body></body></html>', content_type='text/html')))
            await pg2.goto('http://127.0.0.1:%d/blank.html' % port)
            al = await pg2.evaluate(ALONE_JS)
            ok = al['added'] == ['KratorExtraplanar'] and al['after'] == ['KratorExtraplanar'] and not al['errs'] and not errs2 and al['field'] == 'ok' \
                and al['built'] and all(not s.endswith(':null') and not s.endswith(':0') for s in al['built'])
            print(('  PASS  ' if ok else '  FAIL  ') + 'bundle-alone : globals added %s; built %d; field %s%s' % (
                al['added'], len(al['built']), al['field'], ('; errors ' + '; '.join(al['errs'] + errs2)) if (al['errs'] or errs2) else ''))
            if not ok:
                fails.append('assert bundle-alone')
            await pg2.close()
        if a.out:
            names = await pg.evaluate('window._api.views()')
            want = a.views.split('|') if a.views else names
            await pg.evaluate("()=>{window._xp.setMode('walk');window._xp.step(1/30,40);}")
            for nm in want:
                await pg.evaluate('(n)=>window._api.go(n)', nm)
                await pg.wait_for_timeout(700)
                fn = os.path.join(a.out, nm.replace(':', '').replace(',', '').replace(' ', '-').replace('(', '').replace(')', '').replace("'", '') + '.png')
                await V.shot(fn, view=nm); print('shot', nm)
            if a.anim:
                for i, key in enumerate(await pg.evaluate('()=>window._xp.lanes.map(L=>L.key)')):
                    await pg.evaluate('([i])=>{const S=window._xp,L=S.lanes[i];window._api.go(L.title);S.setMode("idle");S.step(1/30,20);S.attack(i);const k=KratorExtraplanar.clip(L.key,0).keys;S.step(1/30,Math.round(k[Math.min(4,k.length-2)][0]*30));}', [i])
                    await pg.wait_for_timeout(500)
                    fn = os.path.join(a.out, '%s_attack.png' % key); await V.shot(fn, view=key + ' attack'); print('shot', fn)
    return V.exit()


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('html')
    ap.add_argument('--assert', dest='assert_', action='store_true')
    ap.add_argument('--seeds', type=int, default=2)
    ap.add_argument('--out', default='')
    ap.add_argument('--views', default='')
    ap.add_argument('--anim', action='store_true', help='with --out: each hunter mid-attack')
    ap.add_argument('--only', default='')
    ap.add_argument('--query', default='')
    ap.add_argument('--size', default='1280x800')
    try:
        sys.exit(asyncio.run(run(ap.parse_args())))
    except Abort as e:
        sys.exit(e.code if hasattr(e, 'code') else 1)
