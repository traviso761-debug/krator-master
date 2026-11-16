// ================================================================= HOST — an oasis's ground model (the Five Steaming Stones: PLAN.md sections 3.2 and 5)
// The data half of a geothermal oasis (stations 2 and 6), plain functions of (x, z) a station's 45b-host-model.js builds its ground with:
// OASIS_MODEL(spec) -> {heatAt, classAt, relief, springs, geysers, mudpots, fumaroles, rills, therm, bakeTherm()}. Nothing here draws;
// 89c-host-oasis.js draws it (core/water's springs and geysers, the steam, the hazards). Station 1 has no oasis and never calls it.
//   THE HEAT     core/terrain's KTHERM (47-core-therm.js, a station's "reads"): the fault-fissure as a line vent, each spring, geyser, mud pot
//                and fumarole a point vent, over the country's frozen soil; baked once over the oasis's box (4 m nodes). Every zone of the
//                plan's diagram (section 5) is a band of it: the sinter and the mats on 45-90 C, the turf on 15-35, the cushions 3-15, the snow's
//                edge at 0 (the warm field melts it: 45c's FIELD.warm reads OASIS.warmAt)
//   THE RELIEF   each spring a low sinter mound with its pool sunk in it (the pool's level a hand's breadth under the lip), each geyser a
//                sinter mound under its cone, each mud pot a pit, each rill a shallow cut down the runoff's line
//   THE CLASSES  sinter round the vents and down the rills' heads, the mats (orange to black as the water cools) along the rills and on
//                the sinter's warm margin, the mud round the pots, sulphur round the fumaroles, the warm turf where the ground is 15-35 C
// spec: {name, c: [x, z] (the oasis's middle), soil (C: the frozen country's ground), fault: [[x, z], ...] (the fissure, a line vent),
//        faultT, faultReach, springs: [{key, name, x, z, r, T (C), temp (0..1: core/water's), mineral, milky, boil, apron (m)}],
//        geysers: [{key, name, x, z, H, style, period, T, mound}], mudpots: [{key, x, z, r, T}], fumaroles: [{x, z, T, reach, name}],
//        rills: [[[x, z], ...], ...] (each from a spring downhill), box: [x0, z0, x1, z1] (the bake's), air (C: the oasis's air at 1 m)}
function OASIS_MODEL(S){const K=KRAND,W=WORLD,O={spec:S,springs:S.springs||[],geysers:S.geysers||[],mudpots:S.mudpots||[],fumaroles:S.fumaroles||[],rills:S.rills||[]};
 const segD=(P,x,z)=>{let b=1e9,t0=0,acc=0,tb=0;for(let i=1;i<P.length;i++){const a=P[i-1],c=P[i],ex=c[0]-a[0],ez=c[1]-a[1],L=Math.hypot(ex,ez),t=clamp(((x-a[0])*ex+(z-a[1])*ez)/Math.max(L*L,1e-9),0,1),d=Math.hypot(x-a[0]-ex*t,z-a[1]-ez*t);
   if(d<b){b=d;tb=(acc+t*L);}acc+=L;}return{d:b,s:tb,L:acc};};
 O.segD=segD;
 /* the vents as KTHERM records (core/terrain/47-core-therm.js): every heat the oasis has, one field */
 const V=[];if(S.fault)V.push({id:'fault',kind:'line',pts:S.fault,T:S.faultT==null?40:S.faultT,reach:S.faultReach==null?140:S.faultReach,decay:2.2});
 O.springs.forEach(s=>V.push({id:s.key,kind:'point',x:s.x,z:s.z,T:s.T,reach:s.r+(s.reach==null?90:s.reach),decay:2.6}));
 O.geysers.forEach(g=>V.push({id:g.key,kind:'point',x:g.x,z:g.z,T:g.T==null?92:g.T,reach:g.reach==null?110:g.reach,decay:2.6}));
 O.mudpots.forEach(m=>V.push({id:m.key,kind:'point',x:m.x,z:m.z,T:m.T==null?78:m.T,reach:m.r+40,decay:2.8}));
 O.fumaroles.forEach((f,i)=>V.push({id:'fumarole'+i,kind:'point',x:f.x,z:f.z,T:f.T==null?95:f.T,reach:f.reach==null?45:f.reach,decay:3}));
 /* the rills carry the heat down their line: a line vent each, cooling along it (its T the spring's less the run's cooling, set per rill) */
 O.rills.forEach((P,i)=>V.push({id:'rill'+i,kind:'line',pts:P,T:S.rillT==null?40:S.rillT,reach:S.rillReach==null?26:S.rillReach,decay:2}));
 O.therm=KTHERM.create({soil:S.soil,vents:V,detail:{amp:1.5,scale:.03,seed:K.hash(W,7,7,0x7E37)},world:W});
 O.F=null;O.bakeTherm=()=>{if(!O.F)O.F=O.therm.bake({box:S.box,cell:4});return O.F;};
 O.heatAt=(x,z)=>{if(x<S.box[0]||x>S.box[2]||z<S.box[1]||z>S.box[3])return S.soil;return KTHERM.fieldAt(O.bakeTherm(),x,z);};
 O.warmAt=(x,z)=>smooth(0,8,O.heatAt(x,z));   /* the snow's edge near 0 C, none on ground over 8 C */
 // ---- the relief (added to the station's ground g before the bake): the mounds, the pools, the pits, the rills
 O.relief=(x,z,g)=>{let y=g;
  for(const s of O.springs){const d=Math.hypot(x-s.x,z-s.z),A=s.apron==null?s.r*2.2:s.apron;if(d>s.r+A+4)continue;
   /* the mound: a lip of sinter 0.5-0.9 m over the ground round the pool, easing out over the apron */
   const lip=(s.lip==null?.7:s.lip),mound=lip*smooth(s.r+A,s.r+1.2,d);y+=mound;
   if(d<s.r+.6){const bed=s.level0==null?null:s.level0;const deep=(s.depth==null?1.6:s.depth)*(1-Math.pow(clamp(d/(s.r+.6),0,1),2));y=Math.min(y,(s.yLip==null?g+lip:s.yLip)-.25-deep);}}
  for(const G of O.geysers){const d=Math.hypot(x-G.x,z-G.z),R=G.mound==null?9:G.mound;if(d<R)y+=1.2*Math.pow(1-d/R,1.6);}
  for(const m of O.mudpots){const d=Math.hypot(x-m.x,z-m.z);if(d<m.r+3)y-=1.1*smooth(m.r+3,m.r*.6,d);}
  for(const P of O.rills){const q=segD(P,x,z);if(q.d<2.5)y-=.35*smooth(2.5,.4,q.d)*smooth(0,12,q.s);}
  return y;};
 // ---- the classes (FIELD.cls: TWINS.groundAt merges them; 45c's MODEL.classAt hands them on)
 O.classAt=(x,z,o)=>{const t=O.heatAt(x,z),n=K.vnoise(x*.07,0,z*.07,W+80),n2=K.vnoise(x*.022,0,z*.022,W+81);
  let si=smooth(48,70,t)*.9,ma=smooth(32,46,t)*smooth(80,62,t),mu=0,su=0;
  for(const s of O.springs){const d=Math.hypot(x-s.x,z-s.z),A=s.apron==null?s.r*2.2:s.apron;si=Math.max(si,smooth(s.r+A,s.r+A*.4,d));}
  for(const G of O.geysers){const d=Math.hypot(x-G.x,z-G.z);si=Math.max(si,smooth((G.mound==null?9:G.mound)+6,3,d));}
  for(const P of O.rills){const q=segD(P,x,z),k=smooth(3.5,.6,q.d);if(k<=0)continue;const f=q.s/Math.max(1,q.L);
   si=Math.max(si,k*smooth(.25,0,f));ma=Math.max(ma,k*smooth(0,.12,f)*smooth(1,.75,f)*(.75+.35*n));}
  for(const m of O.mudpots){const d=Math.hypot(x-m.x,z-m.z);mu=Math.max(mu,smooth(m.r+9,m.r+1,d)*(.8+.3*n));}
  for(const f of O.fumaroles){const d=Math.hypot(x-f.x,z-f.z);su=Math.max(su,smooth(7,1.5,d)*(.7+.4*n));}
  ma*=1-mu;si*=1-mu;
  const tu=smooth(13,17,t)*smooth(38,33,t)*(.55+.6*smooth(.3,.6,n2))*(1-si)*(1-mu);
  o.sinter=Math.max(o.sinter||0,clamp(si-ma*.4,0,1));o.mat=Math.max(o.mat||0,clamp(ma,0,1));o.mud=Math.max(o.mud||0,clamp(mu,0,1));
  o.sulph=Math.max(o.sulph||0,clamp(su,0,1));o.turf=Math.max(o.turf||0,clamp(tu,0,1));return o;};
 // the pools' rims and levels once the field is baked (45b's MODEL.after calls it): the lip read off the ground as drawn
 O.after=()=>{for(const s of O.springs){let lo=1e9;for(let k=0;k<24;k++){const a=k/24*TAU;lo=Math.min(lo,terrainH(s.x+Math.cos(a)*(s.r+.8),s.z+Math.sin(a)*(s.r+.8)));}
   s.rim=lo;s.level=lo-.12;s.bed=terrainH(s.x,s.z);}
  for(const m of O.mudpots){m.bed=terrainH(m.x,m.z);m.level=m.bed+.45;}
  for(const G of O.geysers)G.y=terrainH(G.x,G.z);};
 // the wet places nothing is planted in (the pools, the pots, the cones, the rills' beds)
 O.wet=(x,z)=>{for(const s of O.springs)if(Math.hypot(x-s.x,z-s.z)<s.r+1.5)return true;for(const m of O.mudpots)if(Math.hypot(x-m.x,z-m.z)<m.r+1.5)return true;
  for(const G of O.geysers)if(Math.hypot(x-G.x,z-G.z)<4)return true;for(const P of O.rills)if(segD(P,x,z).d<1.2)return true;return false;};
 return O;}
