// ================================================================= HOST — the bands' grounds (P3c): tents, pens, hedges, banners
// Draws CAMPS' records (56b): the tents and pens are the Beast Riders kit's (CAT, instanced through the town's helpers,
// 89c); the thorn hedges' and the pasture fences' runs are its parametric pieces, each kind built at its runs' mean span
// with three brushes (seeds) and instanced, stretched along its run to its own span (BR_RUN cuts every edge of a line
// to one span, so the stretch is a few per cent); each band's banner a pole and a cloth in its tribe's colour; the
// floor camps' tracks to the palisade's gates as ribbons. THE HEDGES' RUNS are drawn light: the kit's run piece is
// 9.7 k triangles of cut thorn, and the nine hedges are 14 km of it (17 M triangles), so a run is a ragged band of brush
// on its line (two shapes, about 60 triangles a piece) and the kit's own pieces stand at the hedges' gates.
const CAMPS_MESH={};
const CAMPS_DRAW=(function(){if(!CAMPS)return null;try{
 const t0=performance.now(),grp=new THREE.Group();grp.name='the bands\' grounds';grp.userData.camps=true;
 const mark=o=>{o.userData.host=true;o.userData.camps=true;return o;};
 // ---------------------------------------------------------------- the tents and pens
 const items=[];CAMPS.grounds.forEach(g=>g.items.forEach(it=>items.push(it)));
 const R=townInstances(items,grp,'camps');
 // ---------------------------------------------------------------- the hedges and fences: a prototype per kind, variant and brush
 const pieces=[],runs=[];CAMPS.grounds.forEach(g=>g.hedge.concat(g.fence).forEach(p=>(p.key==='br_hedge_thorn'&&!p.v?runs:pieces).push(p)));
 const by={};pieces.forEach((p,i)=>{const id=p.key+'#'+p.v+'#'+(i%3);(by[id]||(by[id]={key:p.key,v:p.v,b:i%3,P:[]})).P.push(p);});
 const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler();let ptris=0;
 for(const id in by){const B=by[id],S0=B.P.reduce((s,p)=>s+p.span,0)/B.P.length;let G=null;
  try{G=CAT.proto(B.key,B.v,{span:S0,seed:B.b*101+7});}catch(err){reportErr('camps: '+B.key+' '+err);}
  if(!G)continue;const parts=isleFlatten(G);
  parts.forEach(pt=>{const im=mark(new THREE.InstancedMesh(pt.geo,pt.mat,B.P.length));
   B.P.forEach((p,i)=>{q.setFromEuler(e.set(0,p.ry,0));m4.compose(new THREE.Vector3(p.x,p.y,p.z),q,new THREE.Vector3(p.span/S0,1,1));im.setMatrixAt(i,m4);});
   im.instanceMatrix.needsUpdate=true;im.computeBoundingSphere&&im.computeBoundingSphere();im.userData.inspectLabel=B.key==='br_hedge_thorn'?'A band\'s thorn hedge':'A pasture\'s rail fence';grp.add(im);ptris+=pt.tris*B.P.length;});}
 // ---------------------------------------------------------------- the hedges' runs: a ragged band of cut thorn
 {const shape=b=>{const X=[-.5,-.25,0,.25,.5],P=[[-.85,0],[-.8,.7],[-.55,1.35],[-.15,1.75],[.2,1.7],[.55,1.3],[.82,.75],[.85,0]],pos=[],nor=[];
   const jit=(i,j)=>i===0||i===X.length-1?1:.82+.36*KRAND.unit(KRAND.hash(911,b,i,j));
   const V=[];X.forEach((x,i)=>V.push(P.map(([z,y],j)=>[x,j&&j<P.length-1?y*jit(i,j):y,z*(j&&j<P.length-1?jit(i,j+9):1)])));
   const tri=(a,b2,c)=>{pos.push(...a,...b2,...c);};
   for(let i=0;i+1<X.length;i++)for(let j=0;j+1<P.length;j++){const a=V[i][j],b2=V[i+1][j],c=V[i+1][j+1],d=V[i][j+1];tri(a,b2,c);tri(a,c,d);}
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();return g;};
  const mat=new THREE.MeshStandardMaterial({color:new THREE.Color(0x5a4a38).convertSRGBToLinear(),roughness:1,flatShading:true,side:THREE.DoubleSide});
  [0,1].forEach(b=>{const R2=runs.filter((p,i)=>i%2===b);if(!R2.length)return;const im=mark(new THREE.InstancedMesh(shape(b),mat,R2.length));
   R2.forEach((p,i)=>{q.setFromEuler(e.set(0,p.ry,0));m4.compose(new THREE.Vector3(p.x,p.y-.15,p.z),q,new THREE.Vector3(p.span+.3,1,1));im.setMatrixAt(i,m4);});
   im.instanceMatrix.needsUpdate=true;im.computeBoundingSphere&&im.computeBoundingSphere();im.userData.inspectLabel='A band\'s thorn hedge';grp.add(im);ptris+=48*R2.length;});}
 // ---------------------------------------------------------------- the banners: a pole and a cloth in the tribe's colour
 {const B=CAMPS.grounds.map(g=>g.banner),pole=new THREE.CylinderGeometry(.09,.12,7.5,6);pole.translate(0,3.75,0);
  const cloth=new THREE.PlaneGeometry(1.5,2.6,1,3);cloth.translate(.8,5.9,0);
  const mp=mark(new THREE.InstancedMesh(pole,new THREE.MeshStandardMaterial({color:new THREE.Color(0x4a3426).convertSRGBToLinear(),roughness:.9}),B.length));
  const mc=mark(new THREE.InstancedMesh(cloth,new THREE.MeshStandardMaterial({roughness:.95,side:THREE.DoubleSide}),B.length)),col=new THREE.Color(),one=new THREE.Vector3(1,1,1);
  B.forEach((b,i)=>{q.setFromEuler(e.set(0,(i*1.3)%TAU,0));m4.compose(new THREE.Vector3(b.x,b.y,b.z),q,one);mp.setMatrixAt(i,m4);mc.setMatrixAt(i,m4);mc.setColorAt(i,col.setHex(b.col).convertSRGBToLinear());});
  [mp,mc].forEach(m=>{m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;m.computeBoundingSphere&&m.computeBoundingSphere();m.userData.inspectLabel='A band\'s banner';grp.add(m);});}
 // ---------------------------------------------------------------- the tracks
 if(CAMPS.tracks.length){const G=townGroundMat('yard','The camps\' tracks (trodden earth)'),col=townLin(0x7a6450);grp.add(mark(townRibbons(CAMPS.tracks,G,groundH,()=>col,.35)));}
 scene.add(grp);CAMPS_MESH.group=grp;
 items.forEach(L=>REG.push({name:L.name,key:'camps.'+L.key,x:L.x,z:L.z,y:L.y,r:Math.hypot(L.w,L.d)/2,h:L.h}));
 return {items:items.length,pieces:pieces.length+runs.length,tris:Math.round(R.tris+ptris),ms:Math.round(performance.now()-t0)};}
 catch(e){reportErr('camps: '+(e&&e.stack||e));return null;}})();
_mark('camps');
