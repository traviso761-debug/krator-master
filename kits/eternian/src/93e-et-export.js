// ================================================================= THE KIT'S PART OF A KRATOR-WORLD (core/export, P7)
// The sheet exports through core/export (`python3 tools/harness.py export kits/eternian/dist/eternian.html --out
// godot/data/world-eternian --box ...`): core/tags gives the registry, the KMAT adapter the materials, and this the rest:
//   terrain   the ground as sampled terrain (the isle demo's route on the same engine: core/export/README.md, "Profiles");
//   buckets   the page's merged meshes, one per material key (30-geo.js flushBuckets: mesh.userData.mk), each cropped to
//             the tile (a triangle whose centroid is in the box) and compacted, so a Godot case draws the buildings
//             (the owner's known issue, 2026-10-20);
//   materials one `standard` record per mesh material (`<pack>:<key>`, the shape the Iziz route gives: the importer's
//             library shader), from the page's own material: the vertex colours carry the palette, the roughness,
//             metal, emission, two-sidedness and transparency are the material's; the KMAT adapter's records stand beside.
// A page built without core/export queues its parts; the harness injects the exporter and drains the queue.
(function(R){const reg=a=>{if(typeof EXPORT!=='undefined'&&EXPORT&&EXPORT.register)EXPORT.register.apply(null,a);else (R.EXPORT_QUEUE=R.EXPORT_QUEUE||[]).push(a);};
 reg(['terrain',ctx=>EXPORT.terrain(ctx.box||[-50,-50,50,50],{h:(x,z)=>terrainH(x,z),step:4}),{by:'eternian'}]);
 reg(['buckets',ctx=>{const out=[],seen={};if(typeof WORLD==='undefined'||!WORLD)return out;
  WORLD.traverse(m=>{const mk=m.userData&&m.userData.mk;if(!m.isMesh||!mk||!m.geometry.index)return;
   const g=m.geometry,P=g.attributes.position.array,I=g.index.array,k=[];
   for(let t=0;t<I.length;t+=3){const a=I[t]*3,b=I[t+1]*3,c=I[t+2]*3;
    if(!ctx.box||ctx.inBox((P[a]+P[b]+P[c])/3,(P[a+2]+P[b+2]+P[c+2])/3))k.push(I[t],I[t+1],I[t+2]);}
   if(!k.length)return;const idx=Uint32Array.from(k),A={};
   for(const n of ['position','normal','uv','color']){const at=g.attributes[n];if(at)A[n]=[at.array,at.itemSize];}
   const c=EXPORT.compact(A,idx),geo={};for(const n in c.arrays)geo[n]=EXPORT.pack(c.arrays[n]);geo.index=EXPORT.pack(c.index);
   const n=seen[mk]=(seen[mk]||0)+1;
   out.push({id:'b:'+KIT.pack+':'+mk+(n>1?'~'+n:''),name:mk,kit:KIT.pack,label:mk,material:KIT.pack+':'+mk,lod:null,
    triangles:idx.length/3,geometry:geo,compacted:{vertices:c.vertices,dropped:c.dropped}});});
  return out;},{by:'eternian'}]);
 reg(['materials',ctx=>{const out=[],seen={};if(typeof WORLD==='undefined'||!WORLD)return out;
  WORLD.traverse(m=>{const mk=m.userData&&m.userData.mk;if(!m.isMesh||!mk||seen[mk])return;seen[mk]=1;const M=m.material,em=M.emissive&&(M.emissive.r||M.emissive.g||M.emissive.b);
   out.push({id:KIT.pack+':'+mk,name:mk,family:mk,source:KIT.pack,kind:'standard',kmat:'kmat:'+KIT.pack+':'+mk,colour:'#'+(M.color?M.color.getHexString():'ffffff'),
    roughness:M.roughness==null?1:M.roughness,metal:M.metalness||0,specular:.5,emissive:em?'#'+M.emissive.getHexString():null,emissiveIntensity:M.emissiveIntensity==null?1:M.emissiveIntensity,
    doubleSided:M.side===2,transparent:!!M.transparent,opacity:M.opacity==null?1:M.opacity,alphaTest:M.alphaTest||0,vertexColours:!!M.vertexColors,tint:true,unlit:!!M.isMeshBasicMaterial,
    hook:null,worldUV:null,scale:[1,1],lib:(()=>{const L=SV_LIB[mk]&&KMAT.mode==='lib'?KMAT.packed(KIT.pack,SV_LIB[mk]):null;return L&&L.lib||null;})(),breakup:null,normalScale:1,map:null,normalMap:null,roughnessMap:null});});
  return out;},{by:'eternian'}]);})(window);
