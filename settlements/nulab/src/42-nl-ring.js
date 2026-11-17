// ================================================================= NULAB — the near ring of the basin on core/hamlet (records)
// [G data] Step N5's first part (PLAN.md section 4: the basin's 50,000 rural people in four districts, about 135 villages;
// all proposed). Here the ring the page draws: eight villages within 9 km of the town, one of each kind the basin has, on
// core/hamlet's opt-in Dalab row (core/hamlet/dalab/23-hamlet-dalab.js) and the ground NL_GROUND gives, with their farmland
// (KHAMLET.farmland: permanent irrigated fields on the lake flats, `fallow` 0; a year in two on the dry plain, `fallow` 1:
// PLAN.md 4.2, the Realm's tunables). The rest of the basin's villages are the sim's records, by district and kind
// (data/nulab-sim.js), not drawn. Names are descriptive and proposed: the Rift's names are the owner's (PLAN.md question 12).
//   NL_RING.ring                       [id, name, x, z, focus, people, fallow]
//   NL_RING.CROPS                      the staples and fibres by ground (the census's: PLAN.md section 1)
//   NL_RING.make({dims, world}) -> [{id, name, focus, people, site, census, records, lanes, farm, shore, error?}]
var NL_RING=(function(){
 const G=NL_GROUND,LAKE=G.LAKE;
 const ring=[
  ['nl.ring.beanfield','Beanfield (the south plain)',-1300,4300,'farming',440,1],
  ['nl.ring.lotusflat','Lotus Flat (the river plain)',2600,2700,'farming',440,0],
  ['nl.ring.westfarm','West Farm (the Kould road)',-4300,700,'farming',400,1],
  ['nl.ring.netshore','Net Shore (the main shore)',-3600,-4200,'fishing',300,0],
  ['nl.ring.bayhead','Bayhead (the bay\'s head)',3300,-150,'fishing',300,0],
  ['nl.ring.genefarm','The gene farm (the river valley)',6400,6200,'gene',250,0],
  ['nl.ring.lizardrun','Lizard Run (the upper plain)',-3600,5600,'ranch',250,1],
  ['nl.ring.clayyard','Clay Yard (the river bank)',3900,1500,'clay',200,0]];
 const CROPS={flat:[{crop:'giant lotus root',kind:'field',w:3,maxH:LAKE+12},{crop:'wild rice',kind:'field',w:2,maxH:LAKE+12},{crop:'helix bean',kind:'field',w:2},{crop:'sea-linen flax',kind:'field',w:1}],
  plain:[{crop:'helix bean',kind:'field',w:3},{crop:'ashroot',kind:'field',w:3},{crop:'valley woad',kind:'field',w:1},{crop:'vale mulberry',kind:'orchard',w:1}]};
 const slope=(h,x,z)=>{const e=6,gx=(h(x+e,z)-h(x-e,z))/(2*e),gz=(h(x,z+e)-h(x,z-e))/(2*e);return Math.hypot(gx,gz);};
 const okOn=h=>(x,z)=>h(x,z)>=LAKE+2&&slope(h,x,z)<.2&&G.riverAt(x,z)[0]>G.river.width/2+40;
 /* a shore village's landing: the nearest water round its site (16 bearings, out to 2.5 km), the last dry point before it */
 const landingFor=(x,z,h)=>{let best=null;for(let a=0;a<16;a++){const t=a/16*Math.PI*2,ux=Math.cos(t),uz=Math.sin(t);
   for(let r=30;r<=2500;r+=30)if(h(x+ux*r,z+uz*r)<LAKE){if(!best||r<best.r)best={r,x:x+ux*(r-30),z:z+uz*(r-30),ux,uz};break;}}
  return best?{x:best.x,z:best.z,ux:best.ux,uz:best.uz}:null;};
 function make(o){const out=[],world=o.world==null?44320:o.world,h=G.h,ok=okOn(h);
  for(const [id,name,x,z,focus,people,fallow] of ring){
   const landing=focus==='fishing'?landingFor(x,z,h):null;
   const V=KHAMLET.village(Object.assign({id,world,culture:'dalab',focus,site:{x,z},link:{x:0,z:0},popMax:Math.min(people,KHAMLET.POP_MAX),
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
 return {ring,CROPS,make,landingFor};
})();
