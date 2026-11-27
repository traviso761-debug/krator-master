// ================================================================= SHUMAR HIGHLAND FLORA BAND: BUILD & SPECIMEN GUARANTEE (Phase SM4)
// Runs SHIGH.build (--station shumar: helixpoplar, whorlapricot, ropepine, coiljuniper, spiralsage, ichu bunchgrass),
// ensures deterministic hero specimens along the northern showcase band when a narrow band misses a large cell,
// bakes once into the scene, and exposes window._flora for verify.py (?flora=0 skips).

window._flora=null;
if(SM_FLORA&&new URLSearchParams(location.search).get('flora')!=='0'){
 const t0=performance.now();
 try{
  const Lp=typeof KMAT!=='undefined'&&KMAT.mode==='lib'?KMAT.packed(KIT.pack,'f_plant'):null;
  if(Lp&&Lp.map&&typeof KHOOK!=='undefined'&&SHIGH.MAT){
   const Tp=KMAT.textures(Lp,{aniso:TEXANISO}),pgain=1/Math.max(.05,Math.pow(Lp.mean==null?.55:Lp.mean,2.2)),ptile=1/((Lp.scale&&Lp.scale[0])==null?.6:Lp.scale[0]);
   for(const mk of ['vcol','vsway','vhang']){
    const m=SHIGH.MAT[mk];
    if(!m||m.map)continue;
    m.map=Tp.map;
    KHOOK.add(m,'sm-bio-vdet',{
     uniforms:{uSmBioTile:{value:ptile},uSmBioGain:{value:pgain}},
     fragment:{
      head:'uniform float uSmBioTile;\nuniform float uSmBioGain;\n',
      at:[{at:'map_fragment',replace:'#ifdef USE_MAP\nvec4 texelColor=texture2D(map,vFlWP.xz*uSmBioTile)*.5+texture2D(map,(vFlWP.xy+vFlWP.zy)*.5*uSmBioTile)*.5;texelColor=mapTexelToLinear(texelColor);diffuseColor.rgb*=texelColor.rgb*uSmBioGain;\n#endif'}]
     }
    });
   }
  }
  const Ls=typeof KMAT!=='undefined'&&KMAT.mode==='lib'?KMAT.packed(KIT.pack,'f_fruitSkin'):null;
  if(Ls&&Ls.map&&typeof KHOOK!=='undefined'&&SHIGH.MAT&&SHIGH.MAT.solid&&!SHIGH.MAT.solid.map){
   const Ts=KMAT.textures(Ls,{aniso:TEXANISO}),sgain=1/Math.max(.05,Math.pow(Ls.mean==null?.6:Ls.mean,2.2)),stile=1/((Ls.scale&&Ls.scale[0])==null?.15:Ls.scale[0]);
   SHIGH.MAT.solid.map=Ts.map;
   KHOOK.add(SHIGH.MAT.solid,'sm-bio-sdet',{
    uniforms:{uSmSolTile:{value:stile},uSmSolGain:{value:sgain}},
    vertex:{
     head:'varying vec3 vSmSolWP;\n',
     at:[{at:'begin_vertex',after:'vec4 _smSolP=vec4(transformed,1.0);\n#ifdef USE_INSTANCING\n_smSolP=instanceMatrix*_smSolP;\n#endif\nvSmSolWP=(modelMatrix*_smSolP).xyz;'}]
    },
    fragment:{
     head:'varying vec3 vSmSolWP;\nuniform float uSmSolTile;\nuniform float uSmSolGain;\n',
     at:[{at:'map_fragment',replace:'#ifdef USE_MAP\nvec4 texelColor=texture2D(map,vSmSolWP.xz*uSmSolTile)*.5+texture2D(map,(vSmSolWP.xy+vSmSolWP.zy)*.5*uSmSolTile)*.5;texelColor=mapTexelToLinear(texelColor);diffuseColor.rgb*=texelColor.rgb*uSmSolGain;\n#endif'}]
    }
   });
  }
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
