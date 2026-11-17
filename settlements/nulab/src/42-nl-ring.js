// ================================================================= NULAB — the town's surrounding fields and the near ring on core/hamlet
// [G data] Step N5's first part (PLAN.md section 4: the basin's 50,000 rural people in four districts, about 135 villages; plus
// the town's own farmers' wards, 1,900 hands). Here:
//   1. `NL_RING.townFarms(o)`: three KHAMLET.farmland belts right outside Nulab's outer earthen mound (the north shore flats, the
//      west rise behind the mound, and the south bay plain), keeping clear of the city's earthen mound, harbour and roads, with
//      Dalab farm compounds and tracks;
//   2. `NL_RING.make(o)`: eight near-ring villages within 9 km of the coastal city, one of each kind the basin has, on
//      core/hamlet's opt-in Dalab row (core/hamlet/dalab/23-hamlet-dalab.js), the farming ones with their farmland (`fallow` 0 on
//      the lake flats, `fallow` 1 on the dry plain).
var NL_RING=(function(){
 const G=NL_GROUND,LAKE=G.LAKE;
 const ring=[
  ['nl.ring.beanfield','Beanfield (the south plain)',-900,1900,'farming',440,1],
  ['nl.ring.lotusflat','Lotus Flat (the river plain)',2500,2400,'farming',440,0],
  ['nl.ring.westfarm','West Farm (the Kould road)',-2950,-1450,'farming',400,1],
  ['nl.ring.netshore','Net Shore (the main shore)',-2600,-4200,'fishing',300,0],
  ['nl.ring.bayhead','Bayhead (the bay\'s head)',3300,-150,'fishing',300,0],
  ['nl.ring.genefarm','The gene farm (the river valley)',6400,6200,'gene',250,0],
  ['nl.ring.lizardrun','Lizard Run (the upper plain)',-3400,4800,'ranch',250,1],
  ['nl.ring.clayyard','Clay Yard (the river bank)',3900,1500,'clay',200,0]];
 const TOWN_BELTS=[
  ['nl.townfarm.south','South bay fields',220,-80,150,0,[560,-490]],
  ['nl.townfarm.west','West mound fields',-1180,-1350,160,1,[-525,-1350]],
  ['nl.townfarm.north','North shore fields',160,-2680,140,0,[540,-2210]]];
 const CROPS={flat:[{crop:'giant lotus root',kind:'field',w:3,maxH:LAKE+16},{crop:'wild rice',kind:'field',w:2,maxH:LAKE+16},{crop:'helix bean',kind:'field',w:2},{crop:'sea-linen flax',kind:'field',w:1}],
  plain:[{crop:'helix bean',kind:'field',w:3},{crop:'ashroot',kind:'field',w:3},{crop:'valley woad',kind:'field',w:1},{crop:'vale mulberry',kind:'orchard',w:1}]};
 const slope=(h,x,z)=>{const e=6,gx=(h(x+e,z)-h(x-e,z))/(2*e),gz=(h(x,z+e)-h(x,z-e))/(2*e);return Math.hypot(gx,gz);};
 const okOn=h=>(x,z)=>h(x,z)>=LAKE+2&&slope(h,x,z)<.2&&G.riverAt(x,z)[0]>G.river.width/2+40;
 const inPoly=(P,x,z)=>{let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;};
 const segD=(p,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],l0=dx*dx+dz*dz,l=l0>0?l0:1,t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/l));
  return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dz);};
 const landingFor=(x,z,h)=>{let best=null;for(let a=0;a<16;a++){const t=a/16*Math.PI*2,ux=Math.cos(t),uz=Math.sin(t);
   for(let r=30;r<=2500;r+=30)if(h(x+ux*r,z+uz*r)<LAKE){if(!best||r<best.r)best={r,x:x+ux*(r-30),z:z+uz*(r-30),ux,uz};break;}}
  return best?{x:best.x,z:best.z,ux:best.ux,uz:best.uz}:null;};
 function townFarms(o){o=o||{};const world=o.world==null?44325:o.world,h=G.h,ok0=okOn(h),town=o.town||null;
  const outerPoly=town&&town.zones&&town.zones.outer?town.zones.outer.concat([[950,-525],[950,-2175]]):[];
  const roads=town&&town.roads?town.roads:[];
  const avoid=(px,pz,r)=>{
   if(outerPoly.length&&inPoly(outerPoly,px,pz))return true;
   if(town&&town.zones&&town.zones.outer){for(let i=1;i<town.zones.outer.length;i++)if(segD([px,pz],town.zones.outer[i-1],town.zones.outer[i])<r+26)return true;}
   if(px>G.HARBOUR.x0-90&&zIn(pz,-2300,-450))return true;
   for(const w of roads)for(let i=1;i<w.pts.length;i++)if(segD([px,pz],w.pts[i-1],w.pts[i])<(w.w==null?6:w.w)/2+r+6)return true;
   return false;};
  function zIn(z,a,b){return z>=a&&z<=b;}
  const out=[];
  for(const [id,name,x,z,hands,fallow,gate] of TOWN_BELTS){
   let farm=null;
   try{farm=KHAMLET.farmland({id,world,centre:{x,z},hands,crops:fallow===0?CROPS.flat:CROPS.plain,ground:{ok:ok0,h},avoid,fallow,rMax:1150,
    farms:{key:'dalab_compound',n:Math.max(2,Math.round(hands/28)),box:{w:20,d:20,h:7}},from:{x:gate[0],z:gate[1]}});}
   catch(e){farm={error:String(e&&e.message||e)};}
   const recs=(farm&&farm.records||[]).map(r=>Object.assign({},r,{y:h(r.x,r.z),farmhouse:true}));
   out.push({id,name,hands,fallow,farm,records:recs});}
  return out;}
 function make(o){const out=[],world=o.world==null?44320:o.world,h=G.h,ok=okOn(h);
  for(const [id,name,x,z,focus,people,fallow] of ring){
   const landing=focus==='fishing'?landingFor(x,z,h):null;
   const V=KHAMLET.village(Object.assign({id,world,culture:'dalab',focus,site:{x,z},link:{x:140,z:-1350},popMax:Math.min(people,KHAMLET.POP_MAX),
    dims:o.dims,ground:{ok},worksOut:focus==='farming'?['dalab_compound']:undefined},landing?{landing}:{}));
   const recs=(V.records||[]).map(r=>Object.assign({},r,{y:h(r.x,r.z)}));
   let farm=null;
   if(focus==='farming'&&!V.error){const hands=Math.round(people*.5*.6),out2=(V.outWorks||[]).find(w=>w.key==='dalab_compound');
    const own=(V.records||[]);const avoid=(px,pz,r)=>own.some(b=>Math.hypot(px-b.x,pz-b.z)<Math.hypot(b.w==null?10:b.w,b.d==null?10:b.d)/2+r+8);
    try{farm=KHAMLET.farmland({id:id+'.farm',world,centre:{x:V.site.x,z:V.site.z},hands,crops:G.h(V.site.x,V.site.z)<LAKE+25?CROPS.flat:CROPS.plain,
     ground:{ok,h},avoid,fallow,rMax:1800,farms:out2?{key:'dalab_compound',n:out2.n||Math.max(1,Math.round(hands/10)),box:{w:20,d:20,h:7}}:undefined,
     from:V.site});}catch(e){farm={error:String(e&&e.message||e)};}
    if(farm&&farm.records)for(const r of farm.records)recs.push(Object.assign({},r,{y:h(r.x,r.z),farmhouse:true}));}
   out.push(Object.assign({id,name,focus,people,shore:landing,fallow},V,{records:recs,farm}));}
  return out;}
 return {ring,TOWN_BELTS,CROPS,make,townFarms,landingFor};
})();
