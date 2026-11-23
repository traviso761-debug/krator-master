// ================================================================= HOST — station 2: the hulks drawn (records: 45b-host-stage.js HULKS, the dam basins' DBW read in place)
// The dam lake's boats the surge set down on the high line, each drawn by DBW.draw (biomes/dambasins/src/50-db-wrecks.js, here as 45a-db-wrecks.js)
// on the ground at its record's pose: its hull plated in rust and holed above the silt, its deck rotted through, its wheelhouse roofless or not,
// masts standing or fallen; heeled and half sunk as the stage set it. Textured from this overlay's own pack (materials.json `rust`:
// metal.rust.plate, the wrack's), plain colours without it. Each records its lowest and highest drawn point (the checks' "half buried").
const HULK_MAT=(function(){const L=typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed?KMAT.packed('scablands','rust'):null,R=L?KMAT.textures(L,{aniso:4}):null;
 const mk=c=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:1,metalness:.45,vertexColors:true,side:THREE.DoubleSide},
  R?{map:R.map,normalMap:R.normalMap||null,roughnessMap:R.roughnessMap||null}:{}));
 return{hull:mk(R?0xb4988a:0x6e4630),deck:mk(R?0x8a7466:0x5a3c2c),house:mk(R?0xa08070:0x74503a),dark:new THREE.MeshStandardMaterial({color:0x16110e,roughness:.9,side:THREE.DoubleSide})};})();
{const root=new THREE.Group();root.name='hulks';const v=new THREE.Vector3();
 for(const r of HULKS){const G=DBW.draw(THREE,r,{ground:terrainH,materials:HULK_MAT});G.userData.inspectLabel='A hulk on the high line: a '+r.kind;
  G.updateMatrixWorld(true);let lo=1e9,hi=-1e9;
  G.traverse(o=>{if(!o.isMesh)return;const A=o.geometry.attributes.position;for(let i=0;i<A.count;i+=3){v.fromBufferAttribute(A,i).applyMatrix4(o.matrixWorld);if(v.y<lo)lo=v.y;if(v.y>hi)hi=v.y;}});
  r.lo=lo;r.hi=hi;root.add(G);}
 scene.add(root);window._hulks=HULKS.length;}
