// ================================================================= HOST — station 2: the wrack drawn (records: 45b-host-stage.js WRACK, the dam basins' DBF read in place)
// The high line's rafted wreckage, merged by DBF.draw (biomes/dambasins/src/52-db-flotsam.js, here as 45a-db-flotsam.js so the stage can make its
// records): rusted plating, I-beams and containers half sunk in the line's silt. Textured from this overlay's own pack (materials.json `rust`:
// metal.rust.plate), plain colours without it. Each piece a registered volume; each records its lowest and highest point (the checks' "half buried").
const WRACK_MAT=(function(){const L=typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed?KMAT.packed('scablands','rust'):null,R=L?KMAT.textures(L,{aniso:4}):null;
 const base=o=>new THREE.MeshStandardMaterial(Object.assign({roughness:.95,metalness:.35,side:THREE.DoubleSide},R?{map:R.map,normalMap:R.normalMap||null,roughnessMap:R.roughnessMap||null}:{},o));
 return{rust:base({color:R?0xc8b8a8:0x6a3e26}),paint:base({color:R?0xd8d0c8:0x8a6a52,vertexColors:true}),dark:new THREE.MeshStandardMaterial({color:0x2a2622,roughness:.9,metalness:.3,side:THREE.DoubleSide})};})();
{for(const r of WRACK){const sz=r.kind==='plate'?Math.max(r.w,r.l):r.L;REGISTER({name:'Wrack on the high line: '+DBF.WHO[r.kind]+' (rafted through the west notch)',x:r.x,z:r.z,y:r.h-1,r:sz*.6,h:3});}
 const G=DBF.draw(THREE,WRACK,{ground:terrainH,materials:WRACK_MAT});G.name='wrack';G.userData.inspectLabel='The high line\'s wrack';scene.add(G);
 window._wrack=WRACK.length;}
