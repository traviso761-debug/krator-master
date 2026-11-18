// ================================================================= SHUMAR HIGHLAND FLORA BAND: BUILD & SPECIMEN GUARANTEE (Phase SM4)
// Runs SHIGH.build (--station shumar: helixpoplar, whorlapricot, ropepine, coiljuniper, spiralsage, ichu bunchgrass),
// ensures deterministic hero specimens along the northern showcase band when a narrow band misses a large cell,
// bakes once into the scene, and exposes window._flora for verify.py (?flora=0 skips).

window._flora=null;
if(SM_FLORA&&new URLSearchParams(location.search).get('flora')!=='0'){
 const t0=performance.now();
 try{
  SHIGH.IMPOSTORS=false;
  const out=SHIGH.build({R:SM_FLORA.R,quality:1.45});
  const speciesCounts={};
  if(out.bySpecies){
   for(const part of out.bySpecies.split(' ')){
    const kv=part.split(':');
    if(kv.length===2)speciesCounts[kv[0]]=+kv[1];
   }
  }
  const anchors=[
   {key:'helixpoplar',xs:[-68,-54],salt:8521},
   {key:'whorlapricot',xs:[-28,-14],salt:8522},
   {key:'coiljuniper',xs:[36,50],salt:8523},
   {key:'ropepine',xs:[64,78],salt:8524}
  ];
  let addedHeroes=0;
  for(let i=0;i<anchors.length;i++){
   const a=anchors[i];
   if((speciesCounts[a.key]==null?0:speciesCounts[a.key])>=2)continue;
   const kb=BIO.kitBuilder('shigh',a.key);
   if(!kb)continue;
   for(let j=0;j<a.xs.length;j++){
    const ax=a.xs[j]+(KRAND.unit(KRAND.hash(a.salt,j,1))-.5)*3.0;
    const az=SM_FLORA.zMid+(KRAND.unit(KRAND.hash(a.salt,j,2))-.5)*8.0;
    if(SM_FLORA.mask(ax,az)<=0)continue;
    if(SM_FLORA.space&&SM_FLORA.space.query(ax,az,2.8).length>0)continue;
    BIO.fn.reseed(KRAND.hash(a.salt,j,3));
    const tr=kb.make(ax,0,az);
    BIO.fn.reseed(tr.seed*7919+17);
    kb.grow(tr,2);
    speciesCounts[a.key]=(speciesCounts[a.key]==null?0:speciesCounts[a.key])+1;
    addedHeroes++;
   }
  }
  const baked=BIO.bake();
  FRAME_HOOKS.push(()=>{
   camera.updateMatrixWorld();
   BIO.lodTick(camera);
  });
  const under=out.under||{};
  const totalPlants=(under.sage==null?0:under.sage)+(under.bunch==null?0:under.bunch)+(under.tussocks==null?0:under.tussocks)+(under.ferns==null?0:under.ferns)+(under.albuca==null?0:under.albuca)+(under.flowers==null?0:under.flowers)+(under.rosettes==null?0:under.rosettes);
  window._flora={
   kit:'shighlands',
   station:SHIGH.STATION||'shumar',
   trees:out.trees+addedHeroes,
   species:speciesCounts,
   under,
   plants:totalPlants,
   instances:baked?baked.inst:0,
   records:SM_FLORA.tags?SM_FLORA.tags.records.length:0,
   spaceCount:SM_FLORA.regs.length,
   ms:Math.round(performance.now()-t0)
  };
 }catch(e){
  reportErr('flora '+(e.stack||e));
 }
}
