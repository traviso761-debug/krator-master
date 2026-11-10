// ================================================================= HOST — the dress: KSPELEO's records, one geometry
// Draws CAVE.dress (48: SITE.dress's kinds over each storey) as KSPELEO.mesh makes them, in one draw: the gypsum flowers (small chandeliers)
// white, the crusts of small crystals (druse) clear white, the selenite clusters (blocks) a pale honey, the few small stalactites cream; lit
// as the rock is (the sky's share by vertex, 84's skyLight). Decides nothing: every piece is where KSPELEO put it.
const DRESS=(function(){const t0=performance.now();if(!CAVE.dress.length)return {mesh:null,tris:0,n:{},ms:0};
 const Mx=KSPELEO.mesh(CAVE.dress,{seg:5}),g=new THREE.BufferGeometry(),nv=Mx.pos.length/3,col=new Float32Array(nv*3),sky=new Float32Array(nv);
 const KC={chandelier:[.96,.95,.92],stalactite:[.86,.82,.74],druse:[.93,.93,.91],block:[.88,.82,.68]},K=KSPELEO.KINDS;
 for(let i=0;i<nv;i++){const c=KC[K[Mx.kind[i]]]||[.9,.88,.84];col[i*3]=c[0];col[i*3+1]=c[1];col[i*3+2]=c[2];sky[i]=skyAt(Mx.pos[i*3],Mx.pos[i*3+1],Mx.pos[i*3+2]);}
 g.setAttribute('position',new THREE.BufferAttribute(Mx.pos,3));g.setAttribute('normal',new THREE.BufferAttribute(Mx.nrm,3));
 g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setAttribute('aSky',new THREE.BufferAttribute(sky,1));
 g.setIndex(new THREE.BufferAttribute(Mx.idx,1));g.computeBoundingSphere();
 const mat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.42,metalness:0,vertexColors:true});
 mat.onBeforeCompile=sh=>skyLight(sh,null);mat.customProgramCacheKey=()=>'rift-maze-dress';
 const m=new THREE.Mesh(g,mat);m.name='dress';m.userData.host=true;m.userData.crystal=true;m.userData.recs=CAVE.dress;
 m.userData.inspectLabel='Gypsum flowers, crystal crusts and selenite clusters (KSPELEO)';m.userData.probePoints=[].concat(...CAVE.dress.map(r=>[r.x,r.y,r.z]));scene.add(m);
 const n={};CAVE.dress.forEach(r=>{n[r.kind]=(n[r.kind]||0)+1;});
 return {mesh:m,tris:Mx.idx.length/3,n,ms:Math.round(performance.now()-t0)};})();
window._dress={tris:DRESS.tris,kinds:DRESS.n,ms:DRESS.ms};
