#!/usr/bin/env python3
"""Verify the Xanadu, Oidong and High Rift region of the open world (openworld/PLAN-SITES.md, the second region).

    python3 verify.py dist/xanadu-oidong-highrift.html --assert [--views 0,1,4] [--out DIR]
    python3 verify.py dist/xanadu-oidong-highrift.html --list

On the GPU (KRATOR_GL=gpu, under tools/harness.py lock --lane auto) the harness's universal asserts name the renderer.
The checks, each with a negative:
  - the world's own (core/world/91-world-probe.js, round Qiblai's first village): order-free seeding, the land
    continuous, nothing in water or outside the region, spacing across tiles, the rivers that carry water (a dry course
    and a river's stations outside the polygon are not judged), the villages' roads on the land at their grade, nothing
    growing on a road or a village, no NaN;
  - the region: each site where the cut put it (Erehwon px 805,1516 (on its caldera lake's south shore since edit 5.1-512) and Qiblai 922,1595 (at the cataracts since 2026-11-11) in the 'xanadu' overlay, Longsong
    1228.88,1621.23 in the 'oidong valley' since the 2026-11-16 recut), on dry land, its kit growing there (the negative reads Erehwon at Longsong's spot,
    in the Oidong Valley, where the Xanadu kit does not grow); Thalaba 840,1463 (since 2026-11-16, scale model 5.1e12) in the 'xanadu' overlay;
  - the lake's small islands (src/44-world-landforms.js, the scale model's landform records): each over its lake at its
    centre with the lake round it, the Pleasure Dome's isle at the Erewhon page's island (the negative reads each island
    3 km out in the open lake);
  - the sites (core/world/88s-world-sites.js _sites.checks): the baked plan is the plan made again in the browser (the
    negative changes the world seed), every village whole, its buildings apart and on good ground, every road at its lane
    end (the negative stacks two buildings), every village cleared of flora, tagged and drawn with the kit's pieces (the
    negative reads the world without the villages' clearing).
  - the caverns (core/world 42k, 88k: Route A's tubes, src/48k-world-tubes.js):
    - the plan's checks on the drawn ground (WTUBES.check: every tube meets the surface, each opening where the spec puts it,
      the floor and the roof under the ground but at the openings, the grade); negatives: a tube with its openings taken
      away, a floor raised over the ground mid-tube;
    - the ground opens at each portal and only there: a ray down at each portal's open ramp meets the tube, not the ground
      (the terrain's chunk opened); a ray down over each tube between the openings meets the ground; every chunk opened lies
      on a hole (negatives: the open probe at a mid-tube point, the closed probe at a portal);
    - the walker (core/world 90's G, wrapped by 88k) enters the south feeder at its portal, walks it end to end on the floor
      and comes out at the other portal; along it the drawn floor is under its feet and the rock over its head; steered into
      the wall it is stopped (the negative steers it along the tube, and it goes);
    - the frame time at a portal and inside a tube (reported).
"""
import argparse, asyncio, json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'tools'))
import harness  # noqa: F401
from harness import verify_page, Abort
sys.path.insert(0, os.path.join(HERE, '..', '..', 'core', 'world'))
import verify_world as VW  # noqa: E402  (the resources' and proposals' checks every region shares)
try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

APPLIES = {'flora placement is seeded by cell (order-free)': 'kits', 'nothing roots in the water or outside the region': 'kits',
           'trees keep their spacing, across tile edges': 'kits', 'the named rivers carry water to their mouths': 'rivers',
           'the highways lie on the land and keep their grade': 'roads', 'nothing grows on a highway or in a town': 'kits'}
HAS = "({kits:WORLD_KITS.length>0,rivers:(WORLD_DATA.meta.rivers||[]).length>0,roads:!!WORLD_DATA.roads,towns:!!WORLD_DATA.towns})"
REGION = r"""(neg)=>{const R=[],M=WORLD_DATA.meta,bad=[],lines=[];
 const want={s57bkv9741:{px:[805,1516],biome:'xanadu',kit:'xanadu'},skm4jjo2vl:{px:[922,1595],biome:'xanadu',kit:'xanadu'},sq80bzd7ep:{px:[1228.88,1621.23],biome:'oidong valley',kit:'oidong'},shvo49k0y2:{px:[840,1463],biome:'xanadu',kit:'xanadu'}};   /* Longsong at its 2026-11-11 pin since the 2026-11-16 recut */
 for(const id in want){const S=(M.sites||[]).find(s=>s.id===id),W=want[id];if(!S){bad.push('no site '+id);continue;}
  const L=(M.sites||[]).find(s=>s.id==='sq80bzd7ep'),moved=neg==='site'&&id==='s57bkv9741'&&L;   /* the negative: Erehwon read at Longsong's spot, in the Oidong Valley */
  const x=moved?L.x:S.x,z=moved?L.z:S.z,k=WORLD_KITS.findIndex(q=>q.name===W.kit);
  if(S.px!==W.px[0]||S.py!==W.px[1])bad.push(S.name+' at px '+S.px+','+S.py);
  if(!WORLD.inside(x,z)){bad.push(S.name+' outside the cut');continue;}
  const A=WORLD.at(x,z),b=WORLD.biomeAt(x,z),w=WORLD.kitW(k,x,z);
  if(!(A.depth<0))bad.push(S.name+' in water');if(!b||b.name.toLowerCase()!==W.biome)bad.push(S.name+' in '+(b&&b.name));if(!(w>.5))bad.push(S.name+': the '+W.kit+' kit weighs '+w.toFixed(2));
  lines.push(S.name+' px '+S.px+','+S.py+' in '+(b&&b.name)+' ('+W.kit+' '+w.toFixed(2)+')');}
 R.push({name:'the region: each site where the cut put it, on dry land, its kit growing there',ok:!bad.length,detail:bad.length?bad.join('; '):lines.join('; ')});
 /* Lāiṭwāl (settlements/lightwall/PLAN.md, steps L0 and L5): on the bench, the great lake at its feet to the south, the north
    boundary fault's wall rising behind it (Opal Valley grows no kit here yet: KNOWN_ISSUES.md). The negative reads it 40 km out
    in the lake's middle */
 {const S=(M.sites||[]).find(s=>s.id==='slaitwal0001');if(!S)R.push({name:'Lāiṭwāl on its bench under the wall, the lake at its feet',ok:false,detail:'no site slaitwal0001'});
  else{const x=S.x,z=S.z+(neg==='site'?14000:0),dry=WORLD.at(x,z).depth<0,h=WORLD.H(x,z);   /* WORLD.at's record is shared: read it at once */let lake=null;for(let d=500;d<=8000&&lake==null;d+=250){const B=WORLD.at(x,z+d);if(B.depth>0)lake=d;}
   const wall=Math.max(...[3000,6000,9000].map(d=>WORLD.H(x,z-d)))-h;
   R.push({name:'Lāiṭwāl on its bench under the wall, the lake at its feet',ok:S.px===1028&&S.py===1653&&dry&&lake!=null&&wall>1500,
    detail:'px '+S.px+','+S.py+', ground '+Math.round(h)+' m'+(dry?' (dry)':' (in water)')+', the lake '+(lake==null?'not within 8 km south':(lake/1000).toFixed(2)+' km south')+', the wall '+Math.round(wall)+' m higher within 9 km north'});}}
 /* the lake's small islands (src/44): each stands over its lake at its centre, the lake goes on round it (1.9 radii out,
    four ways), and the Pleasure Dome's isle is the Erewhon page's island (its ISLAND_C, 70,-613 m from the page's centre
    on Erehwon's pin). The negative reads each island 3 km out toward the lake's middle (px 810,1499.5), in open water: every
    centre then under the water. (It switched the region's stamp off until 2026-11-16, but core/coast (44c, islandsOf) stamps
    the same records too since, so the islands stood with it off and the negative could not fail) */
 const LF=WORLD.LANDFORMS,bad2=[],l2=[];
 const E=(M.sites||[]).find(s=>s.id==='s57bkv9741'),LCX=(810-1191)*2000,LCZ=(1499.5-1569)*2000;
 if(!LF.length)bad2.push('no landforms stamped');
 for(const I0 of LF){let I=I0;if(neg==='landforms'){const dx=LCX-I0.x,dz=LCZ-I0.z,d=Math.hypot(dx,dz)||1;I=Object.assign({},I0,{x:I0.x+dx/d*3000,z:I0.z+dz/d*3000});}
  const h=WORLD.H(I.x,I.z),wl=WORLD.water(I.x,I.z);
  if(!(h>wl+.5*(I.crest-I.water)))bad2.push(I.id+' at '+h.toFixed(1)+' m under its lake '+wl);
  for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){const x=I.x+a*1.9*I.rx*1.25,z=I.z+b*1.9*I.rz*1.25;if(!(WORLD.H(x,z)<WORLD.water(x,z)))bad2.push(I.id+': dry '+Math.round(Math.hypot(x-I.x,z-I.z))+' m off');}
  l2.push(I.id+' '+(h-wl).toFixed(1)+' m over the lake');}
 const PD=LF.find(I=>I.id==='lf_pleasure_dome_isle');
 if(!PD||!E)bad2.push('no Pleasure Dome isle or no Erehwon');else{const d=Math.hypot(PD.x-(E.x+70),PD.z-(E.z-613));if(d>10)bad2.push('the Pleasure Dome isle '+d.toFixed(0)+' m off the page\'s island');else l2.push('the Pleasure Dome isle '+d.toFixed(1)+' m off the page\'s island');}
 LF.off=false;
 R.push({name:'the lake\'s small islands stand over the water at their records, the Pleasure Dome\'s at the page\'s island',ok:!bad2.length,detail:bad2.length?bad2.join('; '):l2.join('; ')});
 return R;}"""


# ---------------------------------------------------------------- the caverns (core/world 42k, 88k)
# the camera over (x, z), the terrain and the tubes there streamed; then a ray straight down: the tube (opened ground) or the ground
TUBE_AT = r"""async([x,z,agl])=>{CAM.st.walk=false;CAM.setView(x+30,z+30,agl,.8,-.9);_api.settle(120000);_tubes.settle(120000);
 HOST.scene.updateMatrixWorld();const g=_tubes.ground(x,z),rc=new THREE.Raycaster(new THREE.Vector3(x,g+60,z),new THREE.Vector3(0,-1,0),0,600);
 const h=rc.intersectObjects(TERRAIN.meshes(),false)[0],cuts=(%s)();
 return h?{hit:h.object.userData.terrain?'terrain':h.object.userData.tubeGround?'tube ground':'rock',y:h.point.y,g,open:h.point.y<g-1,cuts}:{hit:null,g,open:true,cuts};}"""
# the probe points: at each portal the open ramp (the floor 2 m or more under the ground, the roof over it); between the openings,
# stations at a fifth, a half and four fifths of each tube with no hole near
TUBE_POINTS = r"""()=>{const P=_tubes.plan,GD=_tubes.ground,out={open:[],closed:[]};
 for(const T of P.tubes){const st=T.st,h=i=>Math.max(...T.sec.filter(s=>s.a<=i&&i<=s.b).map(s=>s.h));
  for(const O of T.open){if(O.kind!=='portal')continue;let best=null,bd=-1;
   for(let i=O.a;i<=O.b;i++){const g=GD(st[i][0],st[i][1]),d=g-st[i][2];if(d>=2&&st[i][2]+h(i)>g+1&&d>bd){bd=d;best=i;}}
   if(best==null)for(let i=O.a;i<=O.b;i++){const g=GD(st[i][0],st[i][1]),d=g-st[i][2];if(d>bd){bd=d;best=i;}}
   out.open.push({id:O.id,tube:T.id,x:st[best][0],z:st[best][1],floor:st[best][2],depth:+bd.toFixed(2)});}
  for(const f of [.2,.5,.8]){const i=Math.floor(st.length*f),s=st[i];if(_tubes.holeAt(s[0],s[1]))continue;out.closed.push({id:T.id+'@'+f,tube:T.id,x:s[0],z:s[1],floor:s[2]});}}
 return out;}"""
TUBE_CUTS = r"""()=>{const P=_tubes.plan,H=[];P.tubes.forEach(T=>T.open.forEach(O=>O.holes.forEach(h=>H.push([h[0],h[1],h[2]+O.rim]))));let bad=[],keys={};
 for(const m of TERRAIN.meshes()){const k=m.userData.tubeCut;if(!k)continue;const c=m.userData.terrain.chunk,s=m.userData.terrain.s,key=Math.round(c.x0)+','+Math.round(c.z0);keys[key]=k;
  if(!H.some(h=>h[0]+h[2]>c.x0&&h[0]-h[2]<c.x0+s&&h[1]+h[2]>c.z0&&h[1]-h[2]<c.z0+s))bad.push(key);}
 return {keys,bad};}"""
TUBE_AT = TUBE_AT % TUBE_CUTS
# the walker: 30 m outside one end's portal on the ground, G on, W and Shift held, steered 8 m ahead along the centreline, through
# 90's own CAM.update (with 88k's wrap) to 30 m outside the other end; samples of its eye every `every` metres
TUBE_WALK = r"""(o)=>{const TB=_tubes,T=TB.plan.tubes.find(t=>t.id===o.tube),GD=TB.ground,p=HOST.camera.position;
 const st=T.st,n=st.length,dir=(a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz);return [dx/l,dz/l];},d0=dir(st[1],st[0]),d1=dir(st[n-2],st[n-1]);
 const L=[[st[0][0]+d0[0]*30,st[0][1]+d0[1]*30]].concat(st.map(s=>[s[0],s[1]]),[[st[n-1][0]+d1[0]*30,st[n-1][1]+d1[1]*30]]);
 const cum=[0];for(let i=1;i<L.length;i++)cum.push(cum[i-1]+Math.hypot(L[i][0]-L[i-1][0],L[i][1]-L[i-1][1]));const LEN=cum[cum.length-1];
 const at=s=>{let i=0;while(i<L.length-2&&cum[i+1]<s)i++;const u=Math.min(1,Math.max(0,(s-cum[i])/(cum[i+1]-cum[i])));return [L[i][0]+(L[i+1][0]-L[i][0])*u,L[i][1]+(L[i+1][1]-L[i][1])*u];};
 let j=0;const proj=()=>{let bs=0,bd=1e30;for(let i=Math.max(0,j-3);i<Math.min(L.length-1,j+6);i++){const A=L[i],B=L[i+1],dx=B[0]-A[0],dz=B[1]-A[1],l2=dx*dx+dz*dz,u=Math.min(1,Math.max(0,((p.x-A[0])*dx+(p.z-A[1])*dz)/l2));
   const d=Math.hypot(p.x-A[0]-dx*u,p.z-A[1]-dz*u);if(d<bd){bd=d;bs=cum[i]+Math.sqrt(l2)*u;j=i;}}return {s:bs,off:bd};};
 const key=(c,dn)=>dispatchEvent(new KeyboardEvent(dn?'keydown':'keyup',{code:c}));
 CAM.setView(L[0][0],L[0][1],1.7,0,0);_api.settle(120000);CAM.st.walk=true;p.set(L[0][0],Math.max(TERRAIN.heightDrawn(L[0][0],L[0][1]),WORLD.water(L[0][0],L[0][1]))+1.7,L[0][1]);const w0=TB.stats().walk;key('KeyW',true);key('ShiftLeft',true);
 let steps=0,kinds='',maxDy=0,inRock=0,lastY=p.y,s=0,best=0,since=0,maxOff=0,next=0;const samples=[];
 try{while(steps<o.max){const q=proj();s=q.s;maxOff=Math.max(maxOff,q.off);if(s>=LEN-3)break;if(s>best+.5){best=s;since=0;}else if(++since>60)break;
   /* near either end the terrain streams round the walker, as the frame loop would (the ground it steps onto is the drawn one) */
   if((s<300||s>LEN-300)&&steps%15===0)_api.settle(20000);
   const t=at(s+8);CAM.st.yaw=Math.atan2(-(t[0]-p.x),-(t[1]-p.z));CAM.st.pitch=0;CAM.update(o.dt);steps++;
   const gy=GD(p.x,p.z),k=TB.stats().walk.last;if(k&&kinds.slice(-1)!==k[0])kinds+=k[0];maxDy=Math.max(maxDy,Math.abs(p.y-lastY));lastY=p.y;
   if(p.y-1.7<gy-2&&TB.voidAt(p.x,p.y,p.z)>=0)inRock++;
   if(s>=next){samples.push([p.x,p.y,p.z,p.y-1.7<gy-2?1:0]);next+=o.every;}}}
 finally{key('KeyW',false);key('ShiftLeft',false);}
 const gEnd=Math.max(TERRAIN.heightDrawn(p.x,p.z),WORLD.water(p.x,p.z)),w1=TB.stats().walk;CAM.st.walk=false;
 return {steps,km:+(s/1000).toFixed(2),of:+(LEN/1000).toFixed(2),done:s>=LEN-3,kinds,maxDy:+maxDy.toFixed(2),inRock,blocked:w1.blocked-w0.blocked,tubeSteps:w1.tube-w0.tube,
  maxOff:+maxOff.toFixed(2),endOnGround:+(p.y-1.7-gEnd).toFixed(2),samples};}"""
# at a sample of the walk: the tubes streamed round the eye, a ray down meets the drawn floor under the feet, a ray up the rock
TUBE_DRAWN = r"""([x,y,z])=>{const p=HOST.camera.position;p.set(x,y,z);HOST.camera.updateMatrixWorld();_tubes.settle(120000);HOST.scene.updateMatrixWorld();
 const ms=TERRAIN.meshes().filter(m=>m.userData.tube),cast=(dy)=>{const rc=new THREE.Raycaster(new THREE.Vector3(x,y,z),new THREE.Vector3(0,dy,0),0,400);const h=rc.intersectObjects(ms,false)[0];return h?h.point.y:null;};
 const dn=cast(-1),up=cast(1),f=_tubes.floorAt(x,z),hole=!!_tubes.holeAt(x,z);   /* in an opening's hole the sky may be over it */
 return {down:dn,up,floor:f?f.y:null,feet:y-1.7,hole,ok:dn!=null&&Math.abs(dn-(y-1.7))<.75&&(hole||up!=null&&up>y)};}"""
# steered into the wall from a mid-tube station (or along the tube, the negative): how far the walker gets across and along
TUBE_WALL = r"""(o)=>{const TB=_tubes,T=TB.plan.tubes.find(t=>t.id===o.tube),st=T.st,i=Math.floor(st.length*.43),a=st[i],b=st[i+1],l=Math.hypot(b[0]-a[0],b[1]-a[1]),tx=(b[0]-a[0])/l,tz=(b[1]-a[1])/l;
 const p=HOST.camera.position,key=(c,dn)=>dispatchEvent(new KeyboardEvent(dn?'keydown':'keyup',{code:c}));CAM.st.walk=true;p.set(a[0],a[2]+1.7,a[1]);
 const dx=o.along?tx:-tz,dz=o.along?tz:tx;CAM.st.yaw=Math.atan2(-dx,-dz);CAM.st.pitch=0;key('KeyW',true);
 try{for(let k=0;k<40;k++)CAM.update(.1);}finally{key('KeyW',false);CAM.st.walk=false;}
 const ax=(p.x-a[0])*tx+(p.z-a[1])*tz,ac=Math.abs((p.x-a[0])*-tz+(p.z-a[1])*tx),sec=T.sec.find(s=>s.a<=i&&i+1<=s.b);
 return {across:+ac.toFixed(2),along:+ax.toFixed(2),half:sec?sec.w/2:null,under:p.y<TB.ground(p.x,p.z)-2};}"""
# the inspector on (I), the mouse moved to (fx, fy) of the canvas: what 90's pick meets and what the panel says
PICK_JS = r"""([fx,fy])=>{CAM.st.insp=true;HOST.scene.updateMatrixWorld();const cv=HOST.renderer.domElement,r=cv.getBoundingClientRect(),e={clientX:r.left+r.width*fx,clientY:r.top+r.height*fy};
 const p=CAM.pick(e);dispatchEvent(new MouseEvent('mousemove',{clientX:e.clientX,clientY:e.clientY}));const text=document.getElementById('insp').textContent;CAM.st.insp=false;
 return {hit:p?[Math.round(p.x),Math.round(p.y),Math.round(p.z)]:null,tube:!!(p&&p.y<_tubes.ground(p.x,p.z)-1),text};}"""
# frame time where the camera is: n frames of the page's own loop
FRAMES = r"""(n)=>new Promise(res=>{const t=[];let last=performance.now();const f=()=>{const now=performance.now();t.push(now-last);last=now;
 if(t.length<n)requestAnimationFrame(f);else{t.shift();t.sort((a,b)=>a-b);const ri=HOST.renderer.info.render,calls=ri.calls,tris=ri.triangles;
  /* the frame loop is held to the display's refresh: a render with gl.finish() measures what the frame costs */
  const gl=HOST.renderer.getContext(),r=[];for(let i=0;i<24;i++){const a=performance.now();HOST.renderer.render(HOST.scene,HOST.camera);gl.finish();r.push(performance.now()-a);}r.sort((a,b)=>a-b);
  res({median:+t[Math.floor(t.length/2)].toFixed(2),p95:+t[Math.floor(t.length*.95)].toFixed(2),render:+r[12].toFixed(2),calls,tris,tubes:_tubes.stats()});}};requestAnimationFrame(f);})"""


async def caverns(pg, V, a, fails):
    print('--- the caverns (core/world 42k, 88k: Route A of the Twins crossing, src/48k-world-tubes.js) ---')
    if not await pg.evaluate('!!window._tubes'):
        print('  FAIL  the caverns are not on the page'); fails.append('caverns: not on the page'); return
    st = await pg.evaluate('_tubes.stats()')
    print('  plan: %d tubes, %.1f km, %d openings, %d holes, planned in %d ms' % (st['tubes'], st['km'], st['openings'], st['holes'], st['planMs']))
    for r in await pg.evaluate('_tubes.checks()'):
        if say(r): fails.append(r['name'])
    for neg, key in (({'kind': 'no-opening', 'tube': 'A-feeder'}, 'meets the surface'), ({'kind': 'raise', 'tube': 'A-feeder'}, 'floor under the ground')):
        r = [x for x in await pg.evaluate('(n)=>_tubes.checks(n)', neg) if key in x['name']][0]
        if say(r, neg['kind']): fails.append('negative ' + neg['kind'])
    # the ground opens at each portal and only there
    pts = await pg.evaluate(TUBE_POINTS)
    bad, lines, cut, cutBad = [], [], {}, set()
    for q in pts['open']:
        r = await pg.evaluate(TUBE_AT, [q['x'], q['z'], 50])
        cut.update(r['cuts']['keys']); cutBad.update(r['cuts']['bad'])
        lines.append('%s %s %.1f m into the ramp: %s' % (q['tube'], q['id'].split(':')[-1], q['depth'], r['hit']))
        if not r['open'] or r['hit'] == 'terrain':
            bad.append('%s: the ground is not open (%s at %.1f, ground %.1f)' % (q['id'], r['hit'], r.get('y') or 0, r['g']))
    if say({'name': 'the ground opens at each portal (a ray down meets the tube, not the ground)', 'ok': not bad and len(pts['open']) > 0,
            'detail': '; '.join(bad[:6]) if bad else '%d portals: %s' % (len(pts['open']), '; '.join(lines[:4]) + ' ...')}):
        fails.append('caverns: portals open')
    bad2 = []
    for q in pts['closed']:
        r = await pg.evaluate(TUBE_AT, [q['x'], q['z'], 50])
        cut.update(r['cuts']['keys']); cutBad.update(r['cuts']['bad'])
        if r['open'] or r['hit'] != 'terrain':
            bad2.append('%s: %s at %.1f, ground %.1f' % (q['id'], r['hit'], r.get('y') or 0, r['g']))
    if cutBad:
        bad2.append('chunks opened off every hole: ' + ', '.join(sorted(cutBad)[:4]))
    if say({'name': 'the ground opens only there (over each tube between the openings a ray meets the ground; every chunk opened is on a hole)',
            'ok': not bad2 and len(pts['closed']) > 0 and len(cut) > 0,
            'detail': '; '.join(bad2[:6]) if bad2 else '%d points between the openings closed; %d chunks opened, %d triangles dropped, all on holes'
            % (len(pts['closed']), len(cut), sum(cut.values()))}):
        fails.append('caverns: only at the openings')
    # the negatives: each probe reads the other kind of place the other way
    q = pts['closed'][0]
    r = await pg.evaluate(TUBE_AT, [q['x'], q['z'], 50])
    if say({'name': 'the open probe at a point between the openings', 'ok': r['open'], 'detail': '%s at %.1f' % (r['hit'], r.get('y') or 0)}, 'mid-tube'):
        fails.append('negative mid-tube')
    q = pts['open'][0]
    r = await pg.evaluate(TUBE_AT, [q['x'], q['z'], 50])
    if say({'name': 'the closed probe at a portal', 'ok': not r['open'] and r['hit'] == 'terrain', 'detail': '%s at %.1f' % (r['hit'], r.get('y') or 0)}, 'portal'):
        fails.append('negative portal')
    await tube_views(pg, V, a, fails)
    # the walker: the south feeder end to end
    w = await pg.evaluate(TUBE_WALK, {'tube': 'A-feeder', 'dt': .1, 'max': 60000, 'every': 3000})
    ok = w['done'] and w['kinds'][:1] == 'g' and 't' in w['kinds'] and w['kinds'][-1:] == 'g' and w['inRock'] == 0 and abs(w['endOnGround']) < .05
    if say({'name': 'the walker enters the south feeder at its portal, walks it end to end and comes out at the other', 'ok': ok,
            'detail': '%(km)s of %(of)s km in %(steps)d steps, ground/tube/ground "%(kinds)s", %(tubeSteps)d steps on the floor, '
                      '%(blocked)d stopped, %(inRock)d with the eye in rock, largest rise %(maxDy)s m, %(maxOff)s m off the line at most, '
                      'its feet %(endOnGround)s m off the ground at the end' % w}):
        fails.append('caverns: the walk')
    bad3, n3 = [], 0
    for sm in w['samples']:
        if not sm[3]:
            continue
        n3 += 1
        r = await pg.evaluate(TUBE_DRAWN, sm[:3])
        if not r['ok']:
            bad3.append('at %d,%d: floor drawn %s for feet %.1f, rock over %s' % (sm[0], sm[2], r['down'], r['feet'], r['up']))
    if say({'name': 'along the walk the drawn floor is under the walker\'s feet and the rock over its head', 'ok': n3 > 3 and not bad3,
            'detail': '; '.join(bad3[:5]) if bad3 else '%d samples, every 3 km' % n3}):
        fails.append('caverns: drawn along the walk')
    r = await pg.evaluate(TUBE_WALL, {'tube': 'A-feeder'})
    if say({'name': 'the walker steered into the tube\'s wall is stopped', 'ok': r['under'] and r['half'] and r['across'] <= r['half'] + .5,
            'detail': '%(across)s m across a %(half)s m half-width' % r}):
        fails.append('caverns: the wall')
    r = await pg.evaluate(TUBE_WALL, {'tube': 'A-feeder', 'along': True})
    if say({'name': 'the walker steered into the wall is stopped', 'ok': not (r['along'] > 15), 'detail': 'steered along the tube it went %(along)s m' % r}, 'along'):
        fails.append('negative along')
    st = await pg.evaluate('_tubes.stats()')
    print('  streaming: %d squares built, %.0f ms each on average (meshed a few chunks a frame, 5 ms a frame once loaded)'
          % (st['built'], st['ms'] / max(1, st['built'])))


async def tube_views(pg, V, a, fails_):
    """the feeder's portals from outside, and inside the feeder: a shot each and the frame time there (the squares streamed
    afresh for each)"""
    # the resources panel (left open by the resources' checks) closed, so the shots show the tubes
    await pg.evaluate("(()=>{const b=[...document.querySelectorAll('button')].find(b=>b.textContent==='resources');"
                      "if(b&&b.getAttribute('aria-pressed')==='true')b.onclick();})()")
    views = await pg.evaluate('_api.views()')
    pick = [i for i, v in enumerate(views) if 'Tube A-feeder' in v or 'Tally-Marks' in v]
    seen = []
    for i in pick:
        await pg.evaluate('_tubes.clear()')
        await pg.evaluate('_api.go(%d)' % i)
        await pg.evaluate('_api.settle(240000)')
        await pg.evaluate('_tubes.settle(120000)')
        await pg.wait_for_timeout(800)
        tag = 'inside' if 'inside' in views[i] else 'hall' if 'Tally-Marks' in views[i] else 'portal%d' % i
        out = os.path.join(a.out, 'tube-%s.png' % tag)
        await V.shot(out, view='tube-' + tag)
        ft = await pg.evaluate(FRAMES, 120)
        first = tag.startswith('portal') and not any(t.startswith('portal') for t in seen)
        seen.append(tag)
        if tag == 'inside' or first:
            # the pick and the inspector: at the middle of the screen, inside the tube it names the tube (the rock); outside, the
            # ground below the mouth (the negative: the ground's own line, not the cavern's)
            r = await pg.evaluate(PICK_JS, [.5, .66] if tag == 'inside' else [.5, .93])   # inside: the floor some metres ahead
            line = r['text'].split('\n')[0]
            if tag == 'inside':
                if say({'name': 'underground the pick meets the rock and the inspector names the tube', 'ok': r['tube'] and line.startswith('cavern'),
                        'detail': '%s; %s' % (r['hit'], line)}):
                    fails_.append('caverns: the inspector underground')
            elif say({'name': 'underground the pick meets the rock and the inspector names the tube', 'ok': line.startswith('cavern'),
                      'detail': 'on the ground by the portal: %s' % line}, 'ground'):
                fails_.append('negative inspector ground')
        print('  view %s: %s  frame %.1f ms median, %.1f ms p95 (the loop), a render %.1f ms (with gl.finish), %d calls, %.2f M tris; '
              'tubes %d squares drawn, %.2f M tris, their tick %.2f ms a frame, %d ms a square last'
              % (views[i], out, ft['median'], ft['p95'], ft['render'], ft['calls'], ft['tris'] / 1e6, ft['tubes']['drawn'], ft['tubes']['tris'] / 1e6,
                 ft['tubes'].get('tickMs') or 0, ft['tubes']['lastMs']))


def say(r, neg=None):
    if neg is None:
        print(('  PASS  ' if r['ok'] else '  FAIL  ') + r['name'] + ' : ' + r['detail'])
        return not r['ok']
    print(('  PASS  ' if not r['ok'] else '  MISSED') + ' negative (' + neg + ') ' + r['name'] + ' : ' + r['detail'])
    return r['ok']


async def run(a):
    os.makedirs(a.out, exist_ok=True)
    async with verify_page(a.html, here=HERE, size=a.size, settle_ms=0,
                           ready_js="typeof CAM==='object'&&CAM&&window._api&&window._sites") as V:
        pg, errs, fails = V.page, V.errs, V.fails
        pg.set_default_timeout(900000)
        if not V.ready:
            print('timed out waiting for the page to build'); fails.append('build timeout')
        panel = await pg.evaluate("document.getElementById('errs').textContent")
        if panel:
            print('ERROR PANEL:', panel[:1500]); fails.append('error panel'); raise Abort(1)
        if a.list:
            print('\n'.join(await pg.evaluate('_api.views()'))); raise Abort(0)
        print('settle:', json.dumps(await pg.evaluate('_api.settle(240000)')))
        if a.assert_:
            has = await pg.evaluate(HAS)
            # the world's checks read the flora round the camera: over Qiblai's first village, settled
            await pg.evaluate("(()=>{const S=WORLD_DATA.sites.sites.find(s=>s.name==='Qiblai'),V=S.hamlets[0];CAM.setView(V.site.x+1500,V.site.z+1500,400,.78,-.25);})()")
            await pg.evaluate('_api.settle(240000)')
            print("--- the world's checks (core/world/91-world-probe.js, round Qiblai's first village) ---")
            for r in await pg.evaluate('_api.hostChecks()'):
                need = APPLIES.get(r['name'])
                if need and not has[need]:
                    print('  n/a   ' + r['name'] + ' : this region has no ' + need + ' yet'); continue
                if say(r): fails.append(r['name'])
            print('--- the region ---')
            for neg in (None, 'site', 'landforms'):
                for r in await pg.evaluate(REGION, neg):
                    # a negative is judged on the check it breaks: the site's on the region, the stamp's on the islands
                    if neg and (neg == 'landforms') != ('islands' in r['name']):
                        continue
                    if say(r, neg): fails.append(('negative ' + neg + ' ' if neg else '') + r['name'])
            print('--- the sites (core/world 48s, 88s: the baked plan) ---')
            for r in await pg.evaluate('_sites.checks()'):
                if say(r): fails.append(r['name'])
            for neg, key in (('plan', 'the baked plan'), ('ground', "on the world's ground"), ('clear', 'cleared of flora')):
                r = [x for x in await pg.evaluate('_sites.checks(%r)' % neg) if key in x['name']][0]
                if say(r, neg): fails.append('negative ' + neg)
        if a.assert_:
            await VW.resources(pg, V, a.out, fails)
        if a.assert_ or a.tubes:
            await caverns(pg, V, a, fails)
        for v in [int(t) for t in a.views.split(',') if t.strip()]:
            await pg.evaluate('_api.go(%d)' % v)
            s = await pg.evaluate('_api.settle(240000)')
            out = os.path.join(a.out, 'view%02d.png' % v)
            await V.shot(out, view='view%02d' % v)
            print('view %d: %s  settle %s' % (v, out, s.get('ms') if isinstance(s, dict) else s))
        panel = await pg.evaluate("document.getElementById('errs').textContent")
        if panel: print('ERROR PANEL (after):', panel[:1500]); fails.append('error panel')
        if errs: print('PAGE ERRORS:', errs[:5]); fails.append('page errors')
    return V.exit()


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('html')
    ap.add_argument('--views', default='')
    ap.add_argument('--list', action='store_true')
    ap.add_argument('--assert', dest='assert_', action='store_true')
    ap.add_argument('--tubes', action='store_true', help='the caverns\' checks alone (they run with --assert too)')
    ap.add_argument('--out', default='./shots')
    ap.add_argument('--size', default='1280x800')
    sys.exit(asyncio.run(run(ap.parse_args())))
