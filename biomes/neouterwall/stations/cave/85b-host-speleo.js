// ================================================================= HOST — the hypogene dress: KSPELEO's records, one geometry (forked from biomes/hearths')
// Both storeys' here: the dry storey's replacement-gypsum blisters and chandeliers, the lower storey's crust band.
// Draws CAVE.hypo (48: KSPELEO.HYPOGENE over each of the active storey's crust records: gypsum chandeliers fanning down from the roofs, stalactites,
// stalagmites under the water, columns where the two meet) as KSPELEO.mesh makes them, in one draw, milky gypsum lit by the same fake scattering
// as the selenite (85's 'selenite' hook, fainter). Decides nothing: every piece is where KSPELEO put it.
const HYPO=(function(){const t0=performance.now();if(!CAVE.hypo.length)return {mesh:null,tris:0,n:0,ms:0};
 const Mx=KSPELEO.mesh(CAVE.hypo),g=new THREE.BufferGeometry();
 g.setAttribute('position',new THREE.BufferAttribute(Mx.pos,3));g.setAttribute('normal',new THREE.BufferAttribute(Mx.nrm,3));
 g.setAttribute('aGlow',new THREE.BufferAttribute(new Float32Array(Mx.pos.length/3),1));
 g.setIndex(new THREE.BufferAttribute(Mx.idx,1));g.computeBoundingSphere();
 const mat=new THREE.MeshStandardMaterial({color:GOLD?0xe8d8a8:0xe4ddcc,roughness:.42,metalness:0});crystalHook(mat,'hypogene',.4);
 const m=new THREE.Mesh(g,mat);m.name='hypogene';m.userData.host=true;m.userData.crystal=true;m.userData.recs=CAVE.hypo;
 m.userData.inspectLabel='Gypsum chandeliers, blisters and dripstone (the hypogene crust)';scene.add(m);
 const n={};CAVE.hypo.forEach(r=>{n[r.kind]=(n[r.kind]||0)+1;});
 return {mesh:m,tris:Mx.idx.length/3,n,ms:Math.round(performance.now()-t0)};})();
window._hypo={tris:HYPO.tris,kinds:HYPO.n,ms:HYPO.ms};
