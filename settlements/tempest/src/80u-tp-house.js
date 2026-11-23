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
// two, the ranges low walls, the gates gone, the rubble on KRUBBLE. Step 4c (2026-11-23): each ward is drawn by the fort asset's
// xfDrawPlan (its curtains, towers, gates, ranges, walks and states; the Storm Tower a signal tower with its basket and mirrors);
// the page keeps the utse (the fort's keep, the inner gate's passage through its foot), the barbican and the talus. [draw]
const TP_PLAN=TEMPEST.plan(),TP_OUTER=TEMPEST.outer(TP_PLAN),TP_INNER=TEMPEST.inner(TP_PLAN),TP_SEED=32611;
/* the state of a def's variant (o.v) and its seeds, as xfDrawPlan takes them (seedBase + V); the damage on the ward's plan */
function tpState(Q,o,base){const V=xV(o),st=o.state||XF_STATES[V]||'kept',seed=o.seed==null?base+V:o.seed,dseed=o.damageSeed==null?seed:o.damageSeed;
 return{V,st,seed,dseed,base,Dm:XFORT.damage(Q,st,dseed)};}
/* a ward drawn by the fort asset's xfDrawPlan (its curtains whole, breached or in stubs, its towers, gates, ranges, walks and the
   walk audit's record) in the House's dress and seeds */
function tpWard(Q,G,o,S,more){return xfDrawPlan(Q,G,Object.assign({},o,{seedBase:S.base,seed:S.seed,damageSeed:S.dseed,state:S.st},more));}
/* the outer ward, the talus and the utse */
function tpOuter(G,o){const P=TP_PLAN,Q=TP_OUTER,S=tpState(Q,o,TP_SEED),C=xfCols('march'),nm='The House of the Tempest',ruined=S.st==='ruined';
 /* a raid fires a stable range's roof (the fort asset burns a barracks' roof: the House's companies sleep over their horses); the
    utse and its gate are the page's (below), the barbican too (its bent entrance opens south) */
 const burnt={};if(S.st==='damaged'){const R=Q.buildings.filter(b=>b.kind==='stable-range');if(R.length)burnt[R[Math.floor(KRAND.unit(KRAND.hash(S.dseed,6,'stables'))*R.length)%R.length].id]=true;}
 tpWard(Q,G,o,S,{_key:o._key||'xa_tempest_outer',dress:'march',name:nm,mainGate:'gate.main',burnt,skip:{tower:t=>!!t.utse,gate:g=>g.kind==='utse',barbican:true}});
 /* the barbican before the Main Gate: three low walls, the road in by an opening in its south side, so it turns to reach the gate */
 {const B=P.barbican,x0=B.at[0]-B.w/2,x1=B.at[0]+B.w/2,z0=B.at[1]-B.d/2,z1=B.at[1]+B.d/2,w=(id,a,b,out)=>({id,a,b,h:B.curtH,t:B.curtT,out});
  [w('barb.f',[x0,z1],[x1,z1],[0,1]),w('barb.n',[x1,z1],[x1,z0],[1,0]),w('barb.s1',[x0,z0],[x0,z0+7],[-1,0]),w('barb.s2',[x0,z1-7],[x0,z1],[-1,0])].forEach(c=>xfCurtain(c,0,1,ruined?c.h*.35:c.h,C,{merlons:!ruined}));
  vnReg(nm+' — the barbican',B.at[0],B.at[1],B.w/2,B.curtH+1.3,{part:'wall'});}
 /* the talus: the inner ward's ground, 4 m up, battered stone (Krak's glacis): it stands in every state */
 {const T=P.inner.talusBox;xnWall((T[0]+T[2])/2,0,(T[1]+T[3])/2,T[2]-T[0],P.inner.y,T[3]-T[1],0,C.stone,'dressed');}
 /* the utse: the fort's keep (xfKeep: five storeys, the chapel with its gilt roof, the beacon), astride the inner front; the inner
    gate's outer door is its east door, its inner door opens on the inner court 4 m up. Damaged, it loses what its block loses (a
    fallen top: three storeys); ruined, a storey or two of shell */
 {const U=P.utse,T=S.Dm.towers.utse,b={id:'utse',kind:'keep',at:U.at,w:U.w,d:U.d,h:U.h,beacon:U.beacon&&!T,
   passage:ruined?null:{w:4,h:4.5,rise:P.inner.y,face:'z'}};   /* the inner gate: in at the muster court's ground, out 4 m up on the inner court (80g xfKeepWays) */
  const storeys=T?Math.max(1,Math.round(U.floors*T.keep)):null;vnReg(nm+' — the utse (the Prismarch\'s tower)',U.at[0],U.at[1],U.w/2,(storeys?storeys*4.4:U.h)+8,{part:'keep'});
  xfKeep(b,C,{seed:S.dseed,storeys,ruined});}
 window._tempestDrawn=Object.assign(window._tempestDrawn||{},{outer:S.st});}
/* the inner ward, drawn 4 m up: its curtain and towers, its buildings, the Field of the Fallen, the Founder's Chorten */
function tpInner(G,o){const P=TP_PLAN,Q=TP_INNER,S=tpState(Q,o,TP_SEED+100),nm='The House of the Tempest — the inner ward';
 tpWard(Q,G,o,S,{_key:o._key||'xa_tempest_inner',dress:'royal',name:nm});
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
