// ================================================================= HOST — the town (P3a): its streets, its squares, its buildings
// Draws TOWN's records (54b): the ways as ribbons on the cap (the stable yard's trodden earth; an alley darker), the
// squares paved in the red sandstone, and every building of the plan built ONCE (CAT.proto, the bundle build.py makes),
// flattened into one geometry per material (the isle demo's 58-isle-protos.js, read in place: isleProto) and drawn as
// InstancedMeshes, one per prototype and material. A builder draws a record: nothing here decides where a thing goes.
const TOWN_MESH={};
const TOWN_DRAW=(function(){if(!TOWN)return null;try{
 const t0=performance.now(),TOP=MESA_B.top,lib=fam=>{const P=typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed?KMAT.packed('beast-riders',fam):null;
   const tx=P?KMAT.textures(P,{aniso:8}):{},mean=P&&P.mean!=null?P.mean:.5;return {tx,sc:P&&P.scale?P.scale[0]:2,gain:tx.map?1/Math.max(.05,Math.pow(mean,2.2)):1};};
 const groundMat=(fam,label)=>{const L=lib(fam),m=new THREE.MeshStandardMaterial({map:L.tx.map||null,normalMap:L.tx.normalMap||null,roughness:.95,metalness:0,vertexColors:true,
   polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});m.color.setScalar(L.gain);m.userData.label=label;return {m,sc:L.sc};};
 const H=(x,z)=>{const y=TOWN.h(x,z);return y>0?y:TOP;};
 // ---------------------------------------------------------------- the ways: a ribbon each, on the cap
 {const G=groundMat('yard','The town\'s streets (trodden earth)'),p=[],u=[],c=[],ix=[],lin=h=>{const c=new THREE.Color(h).convertSRGBToLinear();return [c.r,c.g,c.b];},CLS={avenue:lin(0x86705e),main:lin(0x806a58),side:lin(0x786352),alley:lin(0x695649)};   /* trodden earth, linear (the map's mean is divided back out) */
  TOWN.ways.forEach(W=>{const pts=W.closed?W.pts.concat([W.pts[0]]):W.pts,hw=W.w/2+.4,col=CLS[W.cls]||CLS.side;
   const Q=[];for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.ceil(L/3));for(let k=(i===1?0:1);k<=n;k++){const t=k/n;Q.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}}
   if(Q.length<2)return;const base=p.length/3;
   Q.forEach((q,i)=>{const A=Q[Math.max(0,i-1)],B=Q[Math.min(Q.length-1,i+1)],dx=B[0]-A[0],dz=B[1]-A[1],l=Math.hypot(dx,dz)||1,nx=-dz/l,nz=dx/l;
    [-1,1].forEach(s=>{const x=q[0]+nx*hw*s,z=q[1]+nz*hw*s;p.push(x,H(x,z)+.12,z);u.push(x/G.sc,z/G.sc);c.push(col[0],col[1],col[2]);});
    if(i){const k=base+(i-1)*2;ix.push(k,k+1,k+2,k+1,k+3,k+2);}});});
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(u,2));
  g.setAttribute('color',new THREE.Float32BufferAttribute(c,3));g.setIndex(ix);g.computeVertexNormals();
  const me=new THREE.Mesh(g,G.m);me.userData.host=true;me.userData.town=true;me.userData.inspectLabel=G.m.userData.label;scene.add(me);TOWN_MESH.streets=me;}
 // ---------------------------------------------------------------- the squares, paved
 {const G=groundMat('sandstone','The town\'s squares (sandstone flags)'),p=[],u=[],c=[],ix=[],FL=(c=>[c.r,c.g,c.b])(new THREE.Color(0xb48c70).convertSRGBToLinear());
  TOWN.squares.forEach(Q=>{const P=Q.poly,cx=P.reduce((s,q)=>s+q[0],0)/P.length,cz=P.reduce((s,q)=>s+q[1],0)/P.length,n=12;
   // a grid over the square's box, kept inside it (squares are convex quads), seated on the cap
   const xs=P.map(q=>q[0]),zs=P.map(q=>q[1]),x0=Math.min(...xs),x1=Math.max(...xs),z0=Math.min(...zs),z1=Math.max(...zs),nx=Math.ceil((x1-x0)/4),nz=Math.ceil((z1-z0)/4),base=p.length/3;
   for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){const x=x0+(x1-x0)*i/nx,z=z0+(z1-z0)*j/nz;p.push(x,H(x,z)+.16,z);u.push(x/G.sc,z/G.sc);c.push(FL[0],FL[1],FL[2]);}
   for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=base+j*(nx+1)+i;ix.push(k,k+nx+1,k+1,k+1,k+nx+1,k+nx+2);}});
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(u,2));
  g.setAttribute('color',new THREE.Float32BufferAttribute(c,3));g.setIndex(ix);g.computeVertexNormals();
  const me=new THREE.Mesh(g,G.m);me.userData.host=true;me.userData.town=true;me.userData.inspectLabel=G.m.userData.label;scene.add(me);TOWN_MESH.squares=me;}
 // ---------------------------------------------------------------- the buildings: each prototype once, instanced
 const C={protos:{},failed:{},built:0},by={},grp=new THREE.Group();grp.name='the town\'s buildings';grp.userData.town=true;
 TOWN.lots.forEach(L=>{const id=L.key+'#'+L.v;(by[id]||(by[id]={key:L.key,v:L.v,L:[]})).L.push(L);});
 const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),one=new THREE.Vector3(1,1,1);let tris=0,meshes=0;
 for(const id in by){const B=by[id],P=isleProto('cat',B.key,B.v,C);if(!P)continue;
  const label=(B.L[0].name&&B.L.length===1?B.L[0].name+' ('+B.key+')':B.key+' #'+B.v);
  P.parts.forEach(pt=>{const im=new THREE.InstancedMesh(pt.geo,pt.mat,B.L.length);
   B.L.forEach((L,i)=>{q.setFromEuler(e.set(0,L.ry,0));m4.compose(new THREE.Vector3(L.x,L.y,L.z),q,one);im.setMatrixAt(i,m4);});
   im.instanceMatrix.needsUpdate=true;im.computeBoundingSphere&&im.computeBoundingSphere();im.userData.host=true;im.userData.town=true;im.userData.inspectLabel=label;grp.add(im);meshes++;tris+=pt.tris*B.L.length;});}
 scene.add(grp);TOWN_MESH.buildings=grp;
 const failed=Object.keys(C.failed);if(failed.length)reportErr('town: '+failed.length+' buildings did not build: '+failed.slice(0,6).map(k=>k+' ('+C.failed[k]+')').join(', '));
 // the volumes the inspector and the probe read (one per lot; core/tags has each already: core/city registered it)
 TOWN.lots.forEach(L=>REG.push({name:L.name||L.key,key:'town.'+L.key,x:L.x,z:L.z,y:L.y,r:Math.hypot(L.w,L.d)/2,h:L.h}));
 return {protos:C.built,failed,meshes,tris:Math.round(tris),ms:Math.round(performance.now()-t0)};}
 catch(e){reportErr('town: '+(e&&e.stack||e));return null;}})();
_mark('town');
