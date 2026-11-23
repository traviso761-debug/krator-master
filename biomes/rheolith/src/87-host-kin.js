// ================================================================= HOST — Throne neighbours via BIO.kin (PLAN.md section 6.3a, 7)
// Demonstrates the Ranj-Rheolith volatile siloxane/selenium link directly on the ground:
//   1. Wild bearing Ranj (`throne.spice`, planted=false: glossy crown + red resin + Ranj fungus brackets) grows ONLY in the
//      warm fumarole halo (22-68 m from active throats) where RHEO_PHYS.ranjViability(...) returns fruiting === true.
//   2. Stunted sterile Ranj (`throne.spice`, planted=true: thin, yellowing, zero resin/brackets) stands on the cold upper
//      graben rim (>135 m from throats) where RHEO_PHYS.ranjViability(...) returns fruiting === false.
//   3. Bone-bell mushrooms (`throne.bonebell`) cluster along the warm steam margin.
function growKin(){
 if(new URLSearchParams(location.search).get('kin')==='0'||!BIO.kin)return null;
 if(!BIO.kits||!BIO.kits.throne||!BIO.kits.throne.api)return{missing:['throne']};
 const W=5190,out={ranjWild:0,ranjSterile:0,bonebell:0},S=KSPACE.create({cell:24});
 BIO.cur='rheolith/kin';
 window._kinTrees=[];

 const KSpice=BIO.kin('throne.spice',{key:'ranj',name:'Wild Ranj (spice tree)',tags:{borrowed:true,from:'biomes/throne'}});
 const KBell=BIO.kin('throne.bonebell',{key:'bonebell',name:'Bone-bell mushroom',tags:{borrowed:true,from:'biomes/throne'}});

 // Pass 1: Wild fruiting Ranj in the warm siloxane-vapour halo (fruiting === true)
 if(KSpice){
  const cell=18,N=10,salt=0x7101;
  for(let j=-N;j<=N;j++)for(let i=-N;i<=N;i++){
   const h=KRAND.hash(W,i,j,salt),u=k=>KRAND.unit(KRAND.hash(h,k,0,salt));
   const x=(i+u(1))*cell,z=(j+u(2))*cell;
   if(Math.hypot(x,z)<PIT.r*1.28||Math.hypot(x-BENCH.x,z-BENCH.z)<36)continue;
   const nv=NEAREST_VENT(x,z);
   const rv=RHEO_PHYS.ranjViability({throatTempC:nv.vent.T,throatDistM:nv.d,zeoliteMulch:.18,rainMm:SITE.rain});
   if(!rv.fruiting||PH_AT(x,z)<3.1||FIELD.slope(x,z)>.42)continue;
   if(u(3)>.62*rv.vapour01+.18)continue;
   if(S.some(x,z,6.5,o=>Math.hypot(x-o.x,z-o.z)<6.5+o.r)||!BIO.clearOf(x,z,5)||BIO.mask(x,z)<.9)continue;
   reseed(h);
   const T=KSpice.make(x,DRAWN_H(x,z)-.06,z);
   T.planted=false;
   KSpice.grow(T,2);
   S.insert({x,z,r:6.5},x,z,6.5);
   window._kinTrees.push({x,z,key:'ranj-wild',fruiting:true,vapour01:rv.vapour01,distM:+nv.d.toFixed(1),throatT:nv.vent.T});
   REGISTER({name:'Wild Bearing Ranj (fruiting in active rheolith siloxane halo)',key:'ranj-wild',kind:'tree',x,z,y:T.y0,r:T.crownR==null?3.5:T.crownR,h:T.H});
   out.ranjWild++;
  }

  // Pass 2: Stunted sterile Ranj up on the cold graben scarp bench (>135 m from throats, fruiting === false)
  const cellS=34,NS=7,saltS=0x7102;
  for(let j=-NS;j<=NS;j++)for(let i=-NS;i<=NS;i++){
   const h=KRAND.hash(W,i,j,saltS),u=k=>KRAND.unit(KRAND.hash(h,k,0,saltS));
   const x=(i+u(1))*cellS,z=(j+u(2))*cellS;
   if(Math.hypot(x,z)>230)continue;
   const nv=NEAREST_VENT(x,z);
   const rv=RHEO_PHYS.ranjViability({throatTempC:nv.vent.T,throatDistM:nv.d,zeoliteMulch:0,rainMm:SITE.rain});
   if(rv.fruiting||nv.d<132||FIELD.slope(x,z)>.38)continue;
   if(u(3)>.28)continue;
   if(S.some(x,z,6,o=>Math.hypot(x-o.x,z-o.z)<6+o.r)||!BIO.clearOf(x,z,4.5)||BIO.mask(x,z)<.9)continue;
   reseed(h);
   const T=KSpice.make(x,DRAWN_H(x,z)-.06,z);
   T.planted=true;
   KSpice.grow(T,2);
   S.insert({x,z,r:6},x,z,6);
   window._kinTrees.push({x,z,key:'ranj-sterile',fruiting:false,vapour01:rv.vapour01,distM:+nv.d.toFixed(1),throatT:nv.vent.T});
   REGISTER({name:'Sterile Upland Ranj (yellowing outside the rheolith vapour halo)',key:'ranj-sterile',kind:'tree',x,z,y:T.y0,r:T.crownR==null?2.8:T.crownR,h:T.H});
   out.ranjSterile++;
  }
 }

 // Pass 3: Bone-bell mushrooms on flat warm fumarole steam margins (20-38 m from vents, away from steep hornito cones)
 if(KBell){
  const cellB=22,NB=6,saltB=0x7103;
  for(let j=-NB;j<=NB;j++)for(let i=-NB;i<=NB;i++){
   const h=KRAND.hash(W,i,j,saltB),u=k=>KRAND.unit(KRAND.hash(h,k,0,saltB));
   const x=(i+u(1))*cellB,z=(j+u(2))*cellB;
   const nv=NEAREST_VENT(x,z);
   if(nv.d<20||nv.d>38||Math.hypot(x,z)<PIT.r*1.45||FIELD.slope(x,z)>.16)continue;
   if(u(3)>.34)continue;
   if(S.some(x,z,5.5,o=>Math.hypot(x-o.x,z-o.z)<5.5+o.r)||!BIO.clearOf(x,z,4.5)||BIO.mask(x,z)<.9)continue;
   reseed(h);
   const T=KBell.make(x,DRAWN_H(x,z)-.06,z);
   KBell.grow(T,2);
   S.insert({x,z,r:5.5},x,z,5.5);
   window._kinTrees.push({x,z,key:'bonebell',fruiting:false,vapour01:0,distM:+nv.d.toFixed(1),throatT:nv.vent.T});
   REGISTER({name:'Bone-bell mushroom (read in place: throne.bonebell)',key:'bonebell',kind:'tree',x,z,y:T.y0,r:T.crownR==null?2.2:T.crownR,h:T.H});
   out.bonebell++;
  }
 }

 BIO.cur=null;
 return out;
}
