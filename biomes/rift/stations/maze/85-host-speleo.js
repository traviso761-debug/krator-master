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
 /* KSPELEO.mesh winds its prisms' triangles clockwise about the normals it gives (2026-11-09: KNOWN_ISSUES.md), so three's front face was
    the inside and the outside drew black: each triangle whose winding disagrees with its vertices' normals is wound the other way here,
    the mesh's own normals kept */
 const I=Mx.idx.slice(),Pp=Mx.pos,Nn=Mx.nrm;let flipped=0;
 for(let t=0;t<I.length;t+=3){const a=I[t]*3,b=I[t+1]*3,c=I[t+2]*3,ux=Pp[b]-Pp[a],uy=Pp[b+1]-Pp[a+1],uz=Pp[b+2]-Pp[a+2],vx=Pp[c]-Pp[a],vy=Pp[c+1]-Pp[a+1],vz=Pp[c+2]-Pp[a+2];
  const d=(uy*vz-uz*vy)*(Nn[a]+Nn[b]+Nn[c])+(uz*vx-ux*vz)*(Nn[a+1]+Nn[b+1]+Nn[c+1])+(ux*vy-uy*vx)*(Nn[a+2]+Nn[b+2]+Nn[c+2]);if(d<0){const q=I[t+1];I[t+1]=I[t+2];I[t+2]=q;flipped++;}}
 g.setIndex(new THREE.BufferAttribute(I,1));g.computeBoundingSphere();
 const mat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.42,metalness:0,vertexColors:true});
 mat.onBeforeCompile=sh=>skyLight(sh,null);mat.customProgramCacheKey=()=>'rift-maze-dress';
 const m=new THREE.Mesh(g,mat);m.name='dress';m.userData.host=true;m.userData.crystal=true;m.userData.recs=CAVE.dress;
 m.userData.inspectLabel='Gypsum flowers, crystal crusts and selenite clusters (KSPELEO)';m.userData.probePoints=[].concat(...CAVE.dress.map(r=>[r.x,r.y,r.z]));scene.add(m);
 const n={};CAVE.dress.forEach(r=>{n[r.kind]=(n[r.kind]||0)+1;});
 return {mesh:m,tris:Mx.idx.length/3,n,flipped,ms:Math.round(performance.now()-t0)};})();
window._dress={tris:DRESS.tris,kinds:DRESS.n,flipped:DRESS.flipped,ms:DRESS.ms};
