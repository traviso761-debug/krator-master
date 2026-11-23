// ================================================================= THE HOUSE OF THE TEMPEST — the drawing (steps 1-2)
// TEMPEST.plan() (80t) drawn by the Xanadui fort's own builders (kits/xanadu/src/80g-xa-fort.js, read in place: xfCurtain, xfTower,
// xfGate, xfWalks, xfRange, xfSmall, xfKeep, xfHeap), as xfDraw composes them, in two defs: the OUTER ward (its curtain, towers, the
// Main Gate with the gilt pavilion, the sally gates, the Storm Tower, the barbican, the ranges, the talus the inner ward stands on, and
// the utse astride the inner front, the inner gate through its base) and the INNER ward (its curtain and towers, the infirmary, the
// bath, the cistern, the Field of the Fallen and the Founder's Chorten), placed 4 m up on the talus. The violet great monastery is
// the Qiblai kit's own qb_monastery (o.v 6), placed by the page (90r) in the inner ward.
// Step 2, the states (o.v 0 kept, 1 damaged, 2 ruined; XF_STATES): each ward's damage is XFORT.damage on its own plan, hashed from
// core/rand by (seed, piece, salt): a raid that reached the House breaches a curtain, fells a tower's top storey, burns the Main
// Gate and fires a stable range's roof; a generation abandoned leaves the curtains in stubs, the towers shells, the utse a storey or
// two, the ranges low walls, the gates gone, the rubble on KRUBBLE. The curtains' breaches are drawn as xfDraw draws them (the fort
// asset's xfDrawPlan, asked for in KNOWN_ISSUES.md, would take this over). [draw]: three.js through the kit's helpers.
const TP_PLAN=TEMPEST.plan(),TP_OUTER=TEMPEST.outer(TP_PLAN),TP_INNER=TEMPEST.inner(TP_PLAN),TP_SEED=32611;
/* a ward's walks (none on a ruin), its record for the walk audit (kits/xanadu xfReach reads window._xaForts) */
function tpWalks(Q,C,key,V,Dm){const tag='fort:'+key+'/'+V,Wk=XFORT.walks(Q,Dm),WD=xfWalks(Q,Wk,C,tag);
 if(typeof KWALK!=='undefined'&&WD.n){const W=(x,y,z)=>IZDOOR._w(x,y,z),xs=Q.wards[0].poly.map(p=>p[0]),zs=Q.wards[0].poly.map(p=>p[1]),
  a=W(Math.min(...xs)-20,0,Math.min(...zs)-30),b=W(Math.max(...xs)+20,0,Math.max(...zs)+40);
  (window._xaForts=window._xaForts||[]).push({key,v:V,state:Dm.state,tag,feet:WD.feet,walks:WD.n,box:[Math.min(a[0],b[0]),Math.max(a[0],b[0]),Math.min(a[2],b[2]),Math.max(a[2],b[2])]});}
 return Wk;}
/* a curtain whole, breached (ragged courses stepping down into the gap, a course at its foot) or in stubs (xfDraw's) */
function tpCurtain(c,C,Dm,dseed){const L=Math.hypot(c.b[0]-c.a[0],c.b[1]-c.a[1]);
 if(Dm.stubs[c.id]){Dm.stubs[c.id].forEach(s=>{if(s.h>.05)xfCurtain(c,s.u0,s.u1,s.h,C,{});});return;}
 const br=Dm.breaches.filter(b=>b.curtain===c.id),cuts=[0];br.forEach(b=>cuts.push(b.u0,b.u1));cuts.push(1);
 for(let i=0;i<cuts.length;i+=2)xfCurtain(c,cuts[i],cuts[i+1],c.h,C,{merlons:true,band:true});
 br.forEach(b=>{xfCurtain(c,b.u0,b.u1,1.2,C,{});const s=KRAND.stream(KRAND.child(dseed,'breach.'+c.id+'.'+b.u0));
  for(const side of[-1,1]){const u=side<0?b.u0:b.u1;let hh=c.h,du=0;
   for(let k=0;k<4;k++){const w=s.range(.6,1.1)/L;hh*=s.range(.62,.82);if(hh<1.6||du+w>(b.u1-b.u0)*.3)break;const ua=side<0?u+du:u-du-w,ub=side<0?u+du+w:u-du;
    xfCurtain(c,Math.max(b.u0,Math.min(ua,ub)),Math.min(b.u1,Math.max(ua,ub)),hh,C,{});du+=w;}}});}
/* a ward's curtains, towers (not the utse: a block of the wall the page draws as itself), gates and buildings, in its state */
function tpWard(Q,C,nm,Wk,Dm,dseed){const st=Dm.state,ruined=st==='ruined';
 Q.curtains.forEach(c=>{const L=Math.hypot(c.b[0]-c.a[0],c.b[1]-c.a[1]),mid=[(c.a[0]+c.b[0])/2,(c.a[1]+c.b[1])/2];vnReg(nm+' — curtain',mid[0],mid[1],L/2,c.h+1.3,{part:'wall'});
  tpCurtain(c,C,Dm,dseed);});
 Dm.heaps.forEach(H=>xfHeap(H,C.rubble));
 Q.towers.forEach(t=>{if(t.utse)return;const T=Dm.towers[t.id]||{};vnReg(nm+' — '+(t.kind==='great'?'the Storm Tower':'tower'),t.ctr[0],t.ctr[1],XFORT.half(t)+.5,t.h*(T.keep==null?1:T.keep)+2,{part:'tower'});
  xfTower(t,C,Object.assign({seed:dseed},T,{gaps:Wk.gaps[t.id]}),t.id);});
 Q.gates.forEach(g=>{if(g.kind==='utse')return;const c=Q.curtains.find(q=>q.id===g.curtain);vnReg(nm+' — '+(g.kind==='main'?'the Main Gate':'a sally gate'),g.at[0],g.at[1],g.w/2+2,c.h+4,{part:'gate'});
  xfGate(g,c,C,Dm.gates[g.id]||'kept',g.kind==='main');});
 /* a raid fires a stable range's roof (the fort asset burns a barracks' roof: the House's companies sleep over their horses) */
 const burnt=Object.assign({},Dm.roofs);if(st==='damaged'){const R=Q.buildings.filter(b=>b.kind==='stable-range');if(R.length)burnt[R[Math.floor(KRAND.unit(KRAND.hash(dseed,6,'stables'))*R.length)%R.length].id]='burnt';}
 Q.buildings.forEach(b=>{vnReg(nm+' — '+b.id.replace(/\./g,' '),b.at[0],b.at[1],Math.max(b.w,b.d)/2,(b.h==null?4:b.h)+1,{part:b.kind});
  const o={seed:dseed,ruined,burnt:burnt[b.id]==='burnt'};if(b.kind==='range'||b.kind==='stable-range')xfRange(b,C,o);else xfSmall(b,C,o);});}
/* the state of a def's variant (o.v), its damage on the ward's plan, the look's seed and the damage's */
function tpState(Q,o,base){const V=xV(o),st=o.state||XF_STATES[V]||'kept',seed=o.seed==null?base+V:o.seed,dseed=o.damageSeed==null?seed:o.damageSeed;reseed(seed);
 return{V,st,seed,dseed,Dm:XFORT.damage(Q,st,dseed)};}
/* the outer ward, the talus and the utse */
function tpOuter(G,o){const P=TP_PLAN,Q=TP_OUTER,S=tpState(Q,o,TP_SEED),C=xfCols('march'),nm='The House of the Tempest',ruined=S.st==='ruined';
 const Wk=tpWalks(Q,C,o._key||'xa_tempest_outer',S.V,S.Dm);tpWard(Q,C,nm,Wk,S.Dm,S.dseed);
 /* the barbican before the Main Gate: three low walls, the road in by an opening in its south side, so it turns to reach the gate */
 {const B=P.barbican,x0=B.at[0]-B.w/2,x1=B.at[0]+B.w/2,z0=B.at[1]-B.d/2,z1=B.at[1]+B.d/2,w=(id,a,b,out)=>({id,a,b,h:B.curtH,t:B.curtT,out});
  [w('barb.f',[x0,z1],[x1,z1],[0,1]),w('barb.n',[x1,z1],[x1,z0],[1,0]),w('barb.s1',[x0,z0],[x0,z0+7],[-1,0]),w('barb.s2',[x0,z1-7],[x0,z1],[-1,0])].forEach(c=>xfCurtain(c,0,1,ruined?c.h*.35:c.h,C,{merlons:!ruined}));
  vnReg(nm+' — the barbican',B.at[0],B.at[1],B.w/2,B.curtH+1.3,{part:'wall'});}
 /* the talus: the inner ward's ground, 4 m up, battered stone (Krak's glacis): it stands in every state */
 {const T=P.inner.talusBox;xnWall((T[0]+T[2])/2,0,(T[1]+T[3])/2,T[2]-T[0],P.inner.y,T[3]-T[1],0,C.stone,'dressed');}
 /* the utse: the fort's keep (xfKeep: five storeys, the chapel with its gilt roof, the beacon), astride the inner front; the inner
    gate's outer door is its east door, its inner door opens on the inner court 4 m up. Damaged, it loses what its block loses (a
    fallen top: three storeys); ruined, a storey or two of shell */
 {const U=P.utse,T=S.Dm.towers.utse,b={id:'utse',kind:'keep',at:U.at,w:U.w,d:U.d,h:U.h,beacon:U.beacon&&!T};
  const storeys=T?Math.max(1,Math.round(U.floors*T.keep)):null;vnReg(nm+' — the utse (the Prismarch\'s tower)',U.at[0],U.at[1],U.w/2,(storeys?storeys*4.4:U.h)+8,{part:'keep'});
  xfKeep(b,C,{seed:S.dseed,storeys,ruined});if(!ruined&&(storeys==null||storeys>1))xnDoorway(U.at[0],P.inner.y,U.at[1]-U.d/2-.02,Math.PI,2.2,3,{c:C.tim});}
 window._tempestDrawn=Object.assign(window._tempestDrawn||{},{outer:S.st});}
/* the inner ward, drawn 4 m up: its curtain and towers, its buildings, the Field of the Fallen, the Founder's Chorten */
function tpInner(G,o){const P=TP_PLAN,Q=TP_INNER,S=tpState(Q,o,TP_SEED+100),C=xfCols('royal'),nm='The House of the Tempest — the inner ward';
 const Wk=tpWalks(Q,C,o._key||'xa_tempest_inner',S.V,S.Dm);tpWard(Q,C,nm,Wk,S.Dm,S.dseed);
 /* the Field of the Fallen: small chortens of the masters in rows (Shaolin's pagoda forest); the Founder's Chorten behind the hall.
    Stone, solid and low: they stand in every state */
 {const F=P.chortens.fallen,b=F.box,n=F.n,per=Math.ceil(n/F.rows);
  for(let r=0;r<F.rows;r++)for(let i=0;i<per;i++){const x=b[0]+(b[2]-b[0])*(r+.5)/F.rows,z=b[1]+(b[3]-b[1])*(i+.5)/per;qnChorten(x,0,z,.42);}
  vnReg(nm+' — the Field of the Fallen',(b[0]+b[2])/2,(b[1]+b[3])/2,Math.max(b[2]-b[0],b[3]-b[1])/2,4,{part:'shrine'});
  const K=P.chortens.founder;qnChorten(K.at[0],0,K.at[1],K.s);vnReg(nm+' — the Founder\'s Chorten',K.at[0],K.at[1],4,9,{part:'shrine'});}
 window._tempestDrawn=Object.assign(window._tempestDrawn||{},{inner:S.st});}
const tpDef=(key,name,Q,build)=>{const xs=Q.wards[0].poly.map(p=>p[0]),zs=Q.wards[0].poly.map(p=>p[1]),w=Math.max(...xs)-Math.min(...xs),d=Math.max(...zs)-Math.min(...zs);
 XA.def({key,name,family:'Forts',tags:XTAG_FORT(['religious']),tpState:true,w:w+30,d:d+60,h:30,fw:w,fd:d,nv:3,build:(G,o)=>build(G,Object.assign({},o,{_key:key}))});};
tpDef('xa_tempest_outer','The House of the Tempest (the outer ward, the utse)',TP_OUTER,tpOuter);
tpDef('xa_tempest_inner','The House of the Tempest (the inner ward)',TP_INNER,tpInner);
