// ================================================================= HOST: the material library on the nomad kit
// materials.json names, per NOMAD.MAT key (stone, adobe, cloth, canvas, wood), the library set; tools/textures/pack.py
// packs them into tex/ and build.py inlines them (78a-host-matlib-pack.js, KMAT.pack('shade')). The kit's materials are
// Lambert with planar UVs in metres divided by the entry's `tile`, so one UV unit is `tile` metres: the set's colour map
// is swapped in, repeated so it tiles at its own size. Lambert takes no normal map; the carved stone keeps its strata
// shader (the map only feeds its 0.55 + 0.55 * map shading). ?mat=proc swaps nothing. [web]: three.js materials.
(function(){
 if(typeof KMAT==='undefined'||KMAT.mode!=='lib'||typeof NOMAD==='undefined')return;
 const recs={};
 for(const k in NOMAD.MAT){const E=NOMAD.MAT[k],L=KMAT.packed('shade',k);
  recs[k]={id:'shade.'+k,family:k,scale:L?L.scale:[E.tile,E.tile],tint:true,roughness:1,metal:0,lib:L?L.lib:null,bake:!L,hook:'planar-uv',
   note:L?'library colour map on the kit\'s Lambert, tint keep '+L.tint:'procedural map'};
  if(!L||!E.m.map)continue;
  const T=KMAT.textures(L,{aniso:8}).map;T.repeat.set(E.tile/L.scale[0],E.tile/L.scale[1]);E.m.map=T;E.m.needsUpdate=true;}
 KMAT.adapter('shade',recs);window._materials=KMAT.table('shade');
})();
