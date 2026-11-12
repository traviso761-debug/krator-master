// ================================================================= HOST — A SLOT'S CANOPY (the living cables across a cut: PLAN.md section 4)
// slotCanopy(o): the Loom's canopy (station 3, lifted here 2026-11-11 so Mount Caelum's rift fissures take the same code), for one cut on the page.
// o: slot {pts, w} (the cut's line and its floor's half-width), cut (its KRELIEF.stepcut record: edge), W (the world seed), prefix ('cable': the
// records' ids), band [lo, hi] (the grown cables' tiers over the floor at the anchors), tiers, low [lo, hi] (the check's band for a span's low
// point), minDepth (m: a station on the line is grown only where the cut is deeper), shootShare (the pioneer shoots' share), stryders (how many
// cable-stryders sleep on its grown cables: kits/fauna), lipName and lipSign (its lip's fall hazard), expose (false: no window._slot),
// grownR [lo, hi] (the grown cables' radius; LOOM.SPAN.grownR), label (its checks' names prefixed, for a page with more than one cut).
// -> {CABLES, CURTAINS, STRYDERS, build, hazards, checks, negatives, at, L, lipOff, rimY, out}
// What the Loom's own header says of it holds for every cut it is given:
// The host decides where; the kit draws (60: LOOM.drawCable, LOOM.drawCurtain). Every anchor is found by a RAY AT THE DRAWN WALL (45d: drawnRay,
// bucketed by the ground's cells), never at terrainH: a slot's wall is 180 m over two or three cells, and the analytic ground and the drawn
// triangles part there by tens of metres (the round's lesson).
//   THE GROWN CABLES  a station on the slot's line every ~30 m (KRAND.hash(world, k, salt): its tier, its yaw, its stage): a horizontal ray from the
//                     slot's middle out to each wall at the tier's height (80-150 m over the floor, 20-40 m a tier: PLAN.md section 4); both must
//                     strike a riser (a near-vertical face: the rock that holds a tuber), not a tread; the cable a catenary between them (KSPAN)
//   THE SHOOTS        a quarter of the stations: rays down on the two lips; the shoot arches up between them on its bladders
//   THE CURTAINS      rays out to each wall every ~11 m along it, 8-70 m under the lip, a curtain at each hit on a riser
// Each cable is a core/tags record (registered before it is drawn: build); the curtains are the kit's items (core/biome tags them). The anchors'
// pull (KSPAN.tension: the cable's weight in Krator's 7.4 m/s2) is kept on the record, for a page that will let only sound rock hold one.
function slotCanopy(o){const S=o.slot,P=S.pts,W=o.W,PFX=o.prefix==null?'cable':o.prefix,GR=o.grownR||LOOM.SPAN.grownR,u=(k,q)=>KRAND.unit(KRAND.hash(W,k,q,0x61));
 const seg=[];let L=0;for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],l=Math.hypot(b[0]-a[0],b[1]-a[1]);seg.push({a,b,l,s0:L});L+=l;}
 /* the slot's line at arc length s: its point, its tangent and its horizontal normal */
 function at(s){s=clamp(s,0,L);let g=seg[seg.length-1];for(const q of seg)if(s<=q.s0+q.l){g=q;break;}const t=(s-g.s0)/g.l,ux=(g.b[0]-g.a[0])/g.l,uz=(g.b[1]-g.a[1])/g.l;
  return{x:g.a[0]+(g.b[0]-g.a[0])*t,z:g.a[1]+(g.b[1]-g.a[1])*t,ux,uz,nx:-uz,nz:ux};}
 const lipOff=S.w+o.cut.edge;   /* the lip: the floor's half-width plus the steps' run */
 const rimY=c=>Math.min(drawnH(c.x+c.nx*(lipOff+12),c.z+c.nz*(lipOff+12)),drawnH(c.x-c.nx*(lipOff+12),c.z-c.nz*(lipOff+12)));
 const face=n=>Math.abs(n[1])<.6;   /* a riser: the drawn triangle steeper than ~53 degrees */
 function wallHit(o,dx,dz){const l=Math.hypot(dx,dz),d=[dx/l,0,dz/l],h=drawnRay(o,d,lipOff*2.2);return h&&face(h.n)?h:null;}
 const CABLES=[],CURTAINS=[],REJECT={tread:0,miss:0,clip:0,weak:0};
 /* what an anchor's bed holds (N): a tuber's root mat fused into the rock, 0.3 MN in the softest bed (a bole, a clay) to 1.5 MN in the hardest flow
    (hardness 0..1: KSTRATA's, the bed at the anchor point). The numbers are the kit's, set so the thick spans need sound basalt at both ends */
 const HOLD=p=>{const h=STRATA&&STRATA.hardnessAt?STRATA.hardnessAt(p[0],p[1],p[2]):.6;return 3e5+1.2e6*clamp(h==null?.6:h,0,1);};
 const pullOf=(S,r)=>{const t=KSPAN.tension(S,Math.PI*r*r*LOOM.SPAN.density*7.4);return Math.max(t.a,t.b);};
 // the cables: one station every ~30 m, 150 m in from either end (the cut closes round its ends)
 for(let k=0,s=150;s<L-150;k++,s+=24+12*u(k,1)){const c=at(s),floor=drawnH(c.x,c.z),rim=rimY(c);if(!(rim-floor>o.minDepth))continue;
  const yaw=(u(k,2)-.5)*.5,ca=Math.cos(yaw),sa=Math.sin(yaw),dx=c.nx*ca-c.ux*sa,dz=c.nz*ca-c.uz*sa;
  if(u(k,3)<o.shootShare){   /* a pioneer shoot: lip to lip, arching up on its bladders */
   const A=[c.x+dx*(lipOff+6),0,c.z+dz*(lipOff+6)],B=[c.x-dx*(lipOff+6),0,c.z-dz*(lipOff+6)];
   const ha=drawnRay([A[0],rim+400,A[2]],[0,-1,0],900),hb=drawnRay([B[0],rim+400,B[2]],[0,-1,0],900);if(!ha||!hb){REJECT.miss++;continue;}
   const rec={id:PFX+':'+k,stage:'shoot',a:ha.p,b:hb.p,na:ha.n,nb:hb.n,seed:KRAND.hash(W,k,3,0x62),s,floor,rim,
    r:mix(LOOM.SPAN.shootR[0],LOOM.SPAN.shootR[1],u(k,6)),slack:mix(LOOM.SPAN.shootSlack[0],LOOM.SPAN.shootSlack[1],u(k,7))};
   CABLES.push(rec);continue;}
  const tier=Math.floor(u(k,4)*o.tiers),y=floor+o.band[0]+tier*((o.band[1]-o.band[0])/(o.tiers-1))+(u(k,5)-.5)*12;
  if(y>rim-8){REJECT.miss++;continue;}
  const org=[c.x,y,c.z],ha=wallHit(org,dx,dz),hb=wallHit(org,-dx,-dz);if(!ha||!hb){REJECT.tread++;continue;}
  const rec={id:PFX+':'+k,stage:'grown',a:ha.p,b:hb.p,na:ha.n,nb:hb.n,seed:KRAND.hash(W,k,3,0x62),tier,s,floor,rim,
   r:mix(GR[0],GR[1],u(k,6)),slack:mix(LOOM.SPAN.grownSlack[0],LOOM.SPAN.grownSlack[1],u(k,7))};
  /* the span solved here, before it is a record: one that would pass through the drawn rock (a wall it crosses aslant, a tread under its sag) is not grown */
  const S0=KSPAN.solve(rec.a,rec.b,{slack:rec.slack});let ok=true;for(let i=1;i<24&&ok;i++){const p=KSPAN.at(S0,i/24);if(p[1]<drawnH(p[0],p[2])+rec.r+.3)ok=false;}
  if(!ok){REJECT.clip++;continue;}
  /* THE ROCK MUST HOLD IT (PLAN.md section 4: "a page can set anchors only where the rock would hold"): the pull at each anchor (KSPAN.tension, the
     cable's weight in Krator's gravity) against what the bed there holds (HOLD: KSTRATA's hardness of the bed at the anchor); a cable whose pull
     either anchor's bed cannot hold is not grown */
  rec.pull=pullOf(S0,rec.r);rec.holdA=HOLD(rec.a);rec.holdB=HOLD(rec.b);
  if(rec.pull>Math.min(rec.holdA,rec.holdB)){REJECT.weak++;continue;}
  CABLES.push(rec);}
 // the curtains: both walls, every ~11 m, 8-70 m under the lip
 for(let k=0,s=120;s<L-120;k++,s+=7+8*u(k,11)){const c=at(s),rim=rimY(c),floor=drawnH(c.x,c.z);if(!(rim-floor>60))continue;
  for(const sd of [1,-1]){const y=rim-8-62*u(k,12+sd),h=wallHit([c.x,y,c.z],c.nx*sd,c.nz*sd);if(!h)continue;
   CURTAINS.push({id:(PFX==='cable'?'curtain':PFX+'-curtain')+':'+k+(sd>0?'e':'w'),p:h.p,n:h.n,h:2+4*u(k,14+sd),w:1.6+1.6*u(k,16+sd),seed:KRAND.hash(W,k,sd+20,0x63)});}}
 const out={cables:0,shoots:0,curtains:0,beards:0,bladders:0,reject:REJECT,maxPull:0};
 function build(){
  // every cable a core/tags record first (its volume: the span's box), then drawn by the kit's builder
  for(const C of CABLES){const lo=Math.min(C.a[1],C.b[1])-30,hi=Math.max(C.a[1],C.b[1])+(C.stage==='shoot'?40:6),mx=(C.a[0]+C.b[0])/2,mz=(C.a[2]+C.b[2])/2;
   C.reg={name:C.stage==='shoot'?'A pioneer shoot (the cable spinner)':'A living cable (the cable spinner, tier '+(C.tier+1)+')',key:C.id,x:mx,z:mz,y:lo,
    r:Math.hypot(C.a[0]-C.b[0],C.a[2]-C.b[2])/2+4,h:hi-lo,tags:{flora:'cablespinner',stage:C.stage,kit:'loom-chasms'}};REGISTER(C.reg);}
  const c0=BIO.cur,r0=BIO.range,m0=BIO.minRange;BIO.range=6000;BIO.minRange=0;
  try{BIO.cur='loom-chasms/cables';for(const C of CABLES){const d=LOOM.drawCable(C);C.S=d.S;C.r=d.r;C.pull=d.tension?Math.max(d.tension.a,d.tension.b):0;
    out.maxPull=Math.max(out.maxPull,C.pull);out.beards+=d.beards;out.bladders+=d.bladders;if(C.stage==='shoot')out.shoots++;else out.cables++;}
   BIO.cur='loom-chasms/walls';for(const R of CURTAINS)out.curtains+=LOOM.drawCurtain(R);}
  finally{BIO.cur=c0;BIO.range=r0;BIO.minRange=m0;}
  out.maxPullMN=+(out.maxPull/1e6).toFixed(2);stryders();out.stryders=STRYDERS.length;if(o.expose!==false)window._slot=out;return out;}
 // THE CABLE-STRYDERS (kits/fauna, the `loom` group: PLAN.md section 4): nocturnal, so at the page's hour each sleeps hanging under a grown cable,
 // turned onto the span's tangent and rolled over, its feet on the cable's underside. Three, on the grown cables the hash ranks first (KRAND: world,
 // cable, salt), each at a point of its span by the same hash. Each is a core/tags record before it is built, and holds the floor under it as a
 // `hunter` hazard (KHAZ.PREDATOR.lair: what crosses below is what it drops on)
 const STRYDERS=[];
 /* the plan (before 88 reads the hazards): which cables, where on each, the pose; the span solved as the kit's builder solves it (KSPAN, the record's slack) */
 function planStryders(){if(!o.stryders||typeof KratorFauna==='undefined'||!KratorFauna.has('cable-stryder'))return;
  const g=CABLES.filter(c=>c.stage==='grown').map((c,i)=>({c,h:KRAND.hash(W,CABLES.indexOf(c),0x57)})).sort((a,b)=>a.h-b.h).slice(0,o.stryders);
  const UP=new THREE.Vector3(0,1,0),F=new THREE.Vector3(),X=new THREE.Vector3(),Y=new THREE.Vector3(),M=new THREE.Matrix4();
  for(const e of g){const C=e.c,S=KSPAN.solve(C.a,C.b,{slack:C.slack}),t=.3+.4*KRAND.unit(KRAND.hash(e.h,1,0x58)),p=KSPAN.at(S,t),p2=KSPAN.at(S,Math.min(1,t+.01));
   F.set(p2[0]-p[0],p2[1]-p[1],p2[2]-p[2]).normalize();X.crossVectors(UP,F).normalize();Y.crossVectors(F,X).normalize();
   /* rolled over: its up is the world's down, its left the other side; forward along the cable */
   M.makeBasis(X.clone().negate(),Y.clone().negate(),F);
   STRYDERS.push({id:'stryder:'+C.id,C,S,t,p:[p[0],p[1]-C.r*.9,p[2]],q:new THREE.Quaternion().setFromRotationMatrix(M),floor:drawnH(p[0],p[2]),seed:(e.h>>>8)%99991+1,variant:e.h%2});}}
 planStryders();
 function stryders(){for(const d of STRYDERS){const dp=d.p;
   REGISTER({name:'A cable-stryder, asleep under its cable (kits/fauna)',key:d.id,x:dp[0],z:dp[2],y:dp[1]-1.2,r:1.8,h:1.6,tags:{fauna:'cable-stryder',kit:'kits/fauna',on:d.C.id,pose:'rest'}});
   let gr;try{gr=KratorFauna.build('cable-stryder',{seed:d.seed,variant:d.variant})}catch(err){reportErr('fauna cable-stryder: '+err.message);continue;}
   gr.position.set(dp[0],dp[1],dp[2]);gr.quaternion.copy(d.q);try{KratorFauna.animate(gr,0,'rest',{phase:0});}catch(err){}
   gr.traverse(m=>{if(m.isMesh)m.userData.inspectLabel='Cable-stryder (kits/fauna)';});   /* counted by the probe: its core/tags volume holds it */gr.userData.fauna=true;scene.add(gr);d.g=gr;}}
 function hazards(){const H=[];
  for(const D of STRYDERS){const r=14,h=D.p[1]-D.floor+4;H.push(Object.assign(KHAZ.PREDATOR.lair(r,{fauna:'cable-stryder',count:1,note:'drops from the canopy on what crosses the floor below'}),
   {name:'Under a cable-stryder (it drops on what crosses)',x:D.p[0],z:D.p[2],y:D.floor-1,r,h:h,shape:{type:'cyl',r,h:h},tell:{fx:'bones',sound:null,sign:'bones on the slot\'s floor under a cable'}}));}
for(let s=200;s<L-200;s+=420){const c=at(s);for(const sd of [1,-1])H.push({name:o.lipName,kind:'fall',x:c.x+c.nx*sd*(lipOff+4),z:c.z+c.nz*sd*(lipOff+4),r:200,h:25,danger:.95,
   tell:{sign:o.lipSign}});
  H.push({name:'Rockfall off the slot\'s walls',kind:'crush',x:c.x,z:c.z,r:S.w,h:20,danger:.4,tell:{sign:'fresh blocks on the slot\'s floor'}});}return H;}
 // ---------------------------------------------------------------- the station's checks, each with a broken input that must fail
 const onDrawn=p=>Math.abs(p[1]-drawnH(p[0],p[2]));
 const CK={
  anchors(C){const bad=C.filter(c=>onDrawn(c.a)>.05||onDrawn(c.b)>.05);return{ok:C.length>0&&!bad.length,detail:bad.length?bad.length+' cables off the drawn rock (first '+bad[0].id+': '+onDrawn(bad[0].a).toFixed(2)+' m)':C.length+' cables, every anchor on the drawn rock (within 5 cm)'};},
  seated(R){const bad=R.filter(r=>onDrawn(r.p)>.05);return{ok:R.length>0&&!bad.length,detail:bad.length?bad.length+' curtains off the drawn wall':R.length+' wall curtains seated on the drawn walls (within 5 cm)'};},
  clear(C){let bad=null,n=0;for(const c of C){if(!c.S)continue;for(let i=1;i<20;i++){const p=KSPAN.at(c.S,i/20);n++;if(p[1]<drawnH(p[0],p[2])+(c.r==null?.1:c.r)){bad={id:c.id,p};break;}}if(bad)break;}
   return{ok:n>0&&!bad,detail:bad?'a cable through the rock: '+bad.id+' at '+bad.p.map(v=>v|0):n+' points on '+C.length+' spans, every one clear of the drawn rock'};},
  tiers(C){const g=C.filter(c=>c.stage==='grown'&&c.S),bad=g.filter(c=>{const lo=KSPAN.low(c.S).p[1]-c.floor;return lo<o.low[0]||lo>o.low[1];});
   return{ok:g.length>0&&!bad.length,detail:bad.length?bad.length+' grown cables outside the canopy\'s band (first '+bad[0].id+')':g.length+' grown cables, their low points '+o.low[0]+'-'+o.low[1]+' m over the slot\'s floor (the tiers '+o.band[0]+'-'+o.band[1]+' m at the anchors)'};},
  both(C){const s=C.filter(c=>c.stage==='shoot').length,g=C.length-s;return{ok:s>0&&g>0,detail:g+' grown cables, '+s+' pioneer shoots'};},
  held(C){const g=C.filter(c=>c.stage==='grown'),bad=g.filter(c=>!(c.pull<=Math.min(c.holdA,c.holdB)));
   return{ok:g.length>0&&!bad.length,detail:bad.length?bad.length+' cables pulling harder than their rock holds (first '+bad[0].id+')':g.length+' grown cables, each pull within its anchors\' beds (the most '+(Math.max(...g.map(c=>c.pull))/1e6).toFixed(2)+' MN; '+REJECT.weak+' stations left ungrown on weak rock)'};},
  /* each stryder hangs within its cable's radius and a metre under the span, and holds the floor below as a hunter hazard bound to it */
  stryders(D,H){if(typeof KratorFauna==='undefined')return{ok:true,detail:'no fauna bundle (--no-fauna): none placed'};
   const off=D.filter(d=>{const q=KSPAN.at(d.S,d.t);return Math.hypot(d.p[0]-q[0],d.p[1]-q[1],d.p[2]-q[2])>d.C.r+1;}),hz=H.filter(h=>h.kind==='hunter'&&h.hunter&&h.hunter.fauna.indexOf('cable-stryder')>=0);
   const lone=D.filter(d=>!hz.some(h=>Math.hypot(h.x-d.p[0],h.z-d.p[2])<2));
   return{ok:D.length>0&&!off.length&&!lone.length,detail:!D.length?'no cable-stryder placed':off.length?off.length+' stryders off their cables (first '+off[0].id+')':lone.length?lone.length+' stryders with no hunter hazard under them':D.length+' cable-stryders asleep under grown cables, each over a hunter hazard (KHAZ.PREDATOR.lair) bound to it'};}};
 function checks(add0){const add=(n,r)=>add0(o.label?o.label+': '+n:n,r);add('the cables anchored on the drawn rock (rays at the drawn walls)',CK.anchors(CABLES));add('the wall curtains seated on the drawn walls',CK.seated(CURTAINS));
  add('every span clear of the drawn rock',CK.clear(CABLES));add('the grown cables in the canopy\'s tiers',CK.tiers(CABLES));add('grown cables and pioneer shoots both',CK.both(CABLES));
  add('every grown cable held by its anchors\' rock',CK.held(CABLES));if(o.stryders)add('the cable-stryders hang on grown cables over their hunter hazards (kits/fauna)',CK.stryders(STRYDERS,hazards()));}
 function negatives(add0){const add=(n,r)=>add0(o.label?o.label+': '+n:n,r);const C=CABLES[0];if(!C)return;
  add('a cable anchored a metre off the rock',CK.anchors([Object.assign({},C,{a:[C.a[0],C.a[1]+1,C.a[2]]})]));
  add('a curtain a metre off its wall',CK.seated([{p:[CURTAINS[0].p[0],CURTAINS[0].p[1]+1,CURTAINS[0].p[2]]}]));
  const g=CABLES.find(c=>c.stage==='grown'&&c.S);if(g){add('a cable sagging through the floor',CK.clear([Object.assign({},g,{S:KSPAN.solve(g.a,g.b,{sag:400})})]));
   add('a cable outside the tiers',CK.tiers([Object.assign({},g,{floor:g.floor-500})]));}
  add('a canopy of one stage',CK.both(CABLES.filter(c=>c.stage==='grown')));
  if(g)add('a cable on rock that will not hold it',CK.held([Object.assign({},g,{holdA:g.pull*.5})]));
  if(STRYDERS.length){const d=STRYDERS[0];add('a stryder five metres off its cable',CK.stryders([Object.assign({},d,{p:[d.p[0]+5,d.p[1],d.p[2]]})],hazards()));
   add('a stryder with no hazard under it',CK.stryders([d],[]));}}
 return{CABLES,CURTAINS,STRYDERS,build,hazards,checks,negatives,at,L,lipOff,rimY,out};}
