// ================================================================= HOST — the dress: KSPELEO's limestone records, one geometry
// Draws CAVE.dress (48: KSPELEO.LIMESTONE over the passages and under the cenote's bell: stalactites, stalagmites, columns, soda straws, curtains,
// flowstone, rimstone, grown when the sea stood lower) as KSPELEO.mesh makes them, in one draw, calcite cream; the calcite set on it by world
// position (the material's own map in the shader would need UVs KSPELEO's mesh does not make). Decides nothing.
const DRESS=(function(){const t0=performance.now();if(!CAVE.dress.length)return {mesh:null,tris:0,n:{},ms:0};
 const Mx=KSPELEO.mesh(CAVE.dress),g=new THREE.BufferGeometry();
 g.setAttribute('position',new THREE.BufferAttribute(Mx.pos,3));g.setAttribute('normal',new THREE.BufferAttribute(Mx.nrm,3));
 g.setIndex(new THREE.BufferAttribute(Mx.idx,1));g.computeBoundingSphere();
 const mat=new THREE.MeshStandardMaterial({color:0xe6dcc6,roughness:.5,metalness:0});
 if(typeof KGROUND!=='undefined'&&Q.get('kground')!=='0'){mat.onBeforeCompile=sh=>{sh.fragmentShader=sh.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\n/*KGROUND*/');};
  KGROUND.hook(mat,{key:'nwbay-caves-dress',at:'/*KGROUND*/',tri:{from:.2,to:.6,far:80},layers:[KGROUND.layer('nwbay-caves','stone.calcite',{w:'1.0',amt:.7,gain:1.0,name:'calcite'})].filter(Boolean)});}
 const m=new THREE.Mesh(g,mat);m.name='dress';m.userData.probePoints=[].concat(...CAVE.dress.map(r=>[r.x,r.y,r.z]));   /* the probe's points: every piece drawn (one mesh) */m.userData.host=true;m.userData.dress=true;m.userData.inspectLabel='Stalactites, columns, curtains and flowstone (grown dry, drowned since)';scene.add(m);
 const n={};CAVE.dress.forEach(r=>{n[r.kind]=(n[r.kind]||0)+1;});
 return {mesh:m,tris:Mx.idx.length/3,n,ms:Math.round(performance.now()-t0)};})();
window._dress={tris:DRESS.tris,kinds:DRESS.n,ms:DRESS.ms};
