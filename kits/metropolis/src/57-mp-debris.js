// ================================================================= METROPOLIS — a ruin's rubble: the mound and what lies in it  [draw]
// MP.debris(F, state, coarse) -> a Group in the tower's own frame, or null (intact, gutted). Each mound of MP.debrisPlan (40) is a heap (core/terrain KRUBBLE: loose rubble,
// not bedded rock), drawn from KRUBBLE.mesh in the concrete, its hollows dark; each piece (a section of the shaft lying, the lamp's disc on its side, a floor slab tipped up) comes from the builder.
// One mesh a material, so the stage instances the group at every tower of the state: it is not in the hero, the shell or the impostor (it lies off the tower's axis).
// a ruin's heaps as KRUBBLE records, once a state: the mesh, the far mesh and the walk triangles read the same ones
MP.heaps=function(F,state){state=MP.look(state).state;const k=F.id+'.'+state,C=MP.heaps.cache||(MP.heaps.cache={});if(!C[k]){const P=MP.debrisPlan(F,state);C[k]=P?P.mounds.map((m,i)=>KRUBBLE.heap(Object.assign({id:k+'.m'+i,size:[1.5,5]},m))):[];}return C[k];};
/* A FALLEN TOP (the owner, 2026-11-11, of a broken Wedge's rubble: "not sure this reads as a coherent structure or ruin"; its top had been a heap and
   two concrete slabs): the tower's own storeys between y0 and y1, cut from its intact hero (lite) by clipping every triangle at the two heights, in the
   section's frame (its foot at y 0 on the tower's axis), one geometry a material, with a dark cap over the broken foot. An instanced part is laid out by
   its instances, its instance colours baked into the vertex colours. Cached by family and heights (the hero, the shell stage and the far rubble share it).
   MP.debrisTopGeo(F, y0, y1) -> {geos: {material: BufferGeometry}, xmax, tris} */
MP.debrisTopGeo=function(F,y0,y1){const C=MP.debrisTopGeo.cache||(MP.debrisTopGeo.cache={}),key=F.id+':'+y0.toFixed(2)+':'+y1.toFixed(2);if(C[key])return C[key];
 const H=MP.hero(F.id,'intact',true);H.updateMatrixWorld(true);const acc={},v=new THREE.Vector3(),nm=new THREE.Matrix3(),im=new THREE.Matrix4(),ic=new THREE.Color();
 let xmax=-1e9,xmin=1e9,zmin=1e9,zmax=-1e9,tris=0;
 /* a polygon cut by d(q) >= 0: its vertices interpolated where an edge crosses */
 const lerp=(a,b,t)=>a.map((x,i)=>x+(b[i]-x)*t),mix=(a,b,t)=>({p:lerp(a.p,b.p,t),n:lerp(a.n,b.n,t),u:lerp(a.u,b.u,t),c:lerp(a.c,b.c,t)});
 const clip=(poly,d)=>{const out=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],da=d(a),db=d(b);if(da>=0)out.push(a);if((da>=0)!==(db>=0))out.push(mix(a,b,da/(da-db)));}return out;};
 const push=(name,q)=>{const A=acc[name]||(acc[name]={p:[],n:[],u:[],c:[]}),y=q.p[1]-y0;A.p.push(q.p[0],y,q.p[2]);const l=Math.hypot(q.n[0],q.n[1],q.n[2])||1;A.n.push(q.n[0]/l,q.n[1]/l,q.n[2]/l);A.u.push(q.u[0],q.u[1]);A.c.push(q.c[0],q.c[1],q.c[2]);
  if(q.p[0]>xmax)xmax=q.p[0];if(q.p[0]<xmin)xmin=q.p[0];if(q.p[2]>zmax)zmax=q.p[2];if(q.p[2]<zmin)zmin=q.p[2];};
 const MM=MP.mats();   /* the rubble draws a geometry with MP.mats()[name]: a part in a material of its own (a dressing's plants) is left out */
 H.traverse(o=>{if(!o.isMesh||!o.visible||Array.isArray(o.material))return;const g=o.geometry,P=g.attributes.position;if(!P)return;
  const N=g.attributes.normal,U=g.attributes.uv,Cl=g.attributes.color,I=g.index,name=(o.material.name||'mp.concrete').replace(/^mp\./,''),n=I?I.count:P.count;if(!MM[name])return;
  const inst=o.isInstancedMesh?o.count:1;
  for(let k=0;k<inst;k++){const M=new THREE.Matrix4();let tint=[1,1,1];if(o.isInstancedMesh){o.getMatrixAt(k,im);M.multiplyMatrices(o.matrixWorld,im);if(o.instanceColor){o.getColorAt(k,ic);tint=[ic.r,ic.g,ic.b];}}else M.copy(o.matrixWorld);
   nm.getNormalMatrix(M);
   for(let t=0;t+2<n;t+=3){const tri=[];let lo=1e9,hi=-1e9;
    for(let j=0;j<3;j++){const i=I?I.getX(t+j):t+j;v.fromBufferAttribute(P,i).applyMatrix4(M);const p=[v.x,v.y,v.z];if(v.y<lo)lo=v.y;if(v.y>hi)hi=v.y;let nn=[0,1,0];if(N){v.fromBufferAttribute(N,i).applyMatrix3(nm);nn=[v.x,v.y,v.z];}
     tri.push({p,n:nn,u:U?[U.getX(i),U.getY(i)]:[0,0],c:Cl?[Cl.getX(i)*tint[0],Cl.getY(i)*tint[1],Cl.getZ(i)*tint[2]]:tint.slice()});}
    if(hi<y0||lo>y1)continue;
    let poly=lo<y0?clip(tri,q=>q.p[1]-y0):tri;if(hi>y1&&poly.length>=3)poly=clip(poly,q=>y1-q.p[1]);if(poly.length<3)continue;
    for(let j=1;j+1<poly.length;j++){push(name,poly[0]);push(name,poly[j]);push(name,poly[j+1]);tris++;}}}});
 /* the broken foot: a dark plate across the section's extent just inside it, facing back down the axis */
 if(xmax>xmin){const e=.4,y=.25,q=(x,z)=>({p:[x,y0+y,z],n:[0,-1,0],u:[x/4,z/4],c:[.35,.33,.3]});
  [[q(xmin+e,zmin+e),q(xmax-e,zmin+e),q(xmax-e,zmax-e)],[q(xmin+e,zmin+e),q(xmax-e,zmax-e),q(xmin+e,zmax-e)]].forEach(T=>{push('dark',T[0]);push('dark',T[1]);push('dark',T[2]);tris++;});}
 const geos={};for(const name in acc){const A=acc[name],g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(A.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(A.n,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(A.u,2));g.setAttribute('color',new THREE.Float32BufferAttribute(A.c,3));geos[name]=g;}
 return C[key]={geos,xmax:xmax>-1e8?xmax:0,tris};};
MP.debris=function(F,state,coarse){state=MP.look(state).state;const P=MP.debrisPlan(F,state);if(!P)return null;   /* a wild look's rubble is its state's */const acc={},M=MP.mats(),m4=new THREE.Matrix4(),n3=new THREE.Matrix3(),v=new THREE.Vector3();
 // a geometry's arrays into its material's bucket, moved by m (normals by its rotation)
 const put=function(name,g,m){const q=acc[name]||(acc[name]={p:[],n:[],u:[],c:[],i:[]}),P0=g.attributes.position,N0=g.attributes.normal,U0=g.attributes.uv,C0=g.attributes.color,base=q.p.length/3;n3.getNormalMatrix(m);
  for(let i=0;i<P0.count;i++){v.fromBufferAttribute(P0,i).applyMatrix4(m);q.p.push(v.x,v.y,v.z);v.fromBufferAttribute(N0,i).applyMatrix3(n3).normalize();q.n.push(v.x,v.y,v.z);q.u.push(U0?U0.getX(i):0,U0?U0.getY(i):0);if(C0)q.c.push(C0.getX(i),C0.getY(i),C0.getZ(i));else q.c.push(1,1,1);}
  const I=g.index;if(I)for(let i=0;i<I.count;i++)q.i.push(base+I.getX(i));else for(let i=0;i<P0.count;i++)q.i.push(base+i);};
 const one=new THREE.Matrix4();
 // the heaps (core/terrain KRUBBLE): rubble grey, darker in the hollows between the lumps; the loose blocks each a shade of their own. coarse: the far one, an 8 m grid
 // with its big blocks but not the cover's chunks or the pieces, for the ruins past 1 km
 MP.heaps(F,state).forEach(function(H){const o=KRUBBLE.mesh(H,{cell:coarse?8:4}),n=o.pos.length/3,col=new Float32Array(n*3);
  for(let i=0;i<n;i++){const k=o.part[i]?1-o.occ[i]:(coarse?.9:.7)*(1-.5*o.occ[i]);col[i*3]=.78*k;col[i*3+1]=.75*k;col[i*3+2]=.7*k;   /* the bed a shade under the chunks; the far heap, chunkless, lighter */}
  /* the bed in the rubble set (loose debris, so the heap does not read as one cast mass), the chunks and blocks in the concrete; the far heap its bed and big blocks */
  const bed=[],lumps=[];for(let i=0;i<o.idx.length;i+=3){const pt=o.part[o.idx[i]];if(coarse&&pt===2)continue;(pt?lumps:bed).push(o.idx[i],o.idx[i+1],o.idx[i+2]);}
  const g=new THREE.BufferGeometry(),uv=new Float32Array(o.uv.length);for(let i=0;i<uv.length;i++)uv[i]=o.uv[i]/4;   /* the library's uvs are in 4 m units */
  g.setAttribute('position',new THREE.BufferAttribute(o.pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setIndex(new THREE.BufferAttribute(new Uint32Array(bed),1));g.computeVertexNormals();put('rubble',g,one);
  if(lumps.length){const gc=g.clone();gc.setIndex(new THREE.BufferAttribute(new Uint32Array(lumps),1));gc.computeVertexNormals();put('concrete',gc,one);}});
 if(coarse)P.pieces.length=0;
 // the pieces, each drawn about its own origin, then laid where the plan says
 P.pieces.forEach(function(pc){const B=MP.builder(),m=new THREE.Matrix4();
  if(pc.kind==='fins'){MP.spindleFins(B,F,pc.y0,pc.y1,true,true);}
  else if(pc.kind==='frame'){MP.hero(F.id,state,false,'frame').children.forEach(c=>{if(!c.isInstancedMesh)put(c.material.name.replace(/^mp\./,''),c.geometry,one);});return;}
  else if(pc.kind==='shaft'){const r=pc.r,L=pc.len/2,ri=r-.8;B.lathe(pc.mat||'white',[[r,-L],[r,L]],20,{uv:4});B.lathe('dark',[[ri,L],[ri,-L]],20,{uv:4});B.lathe('concrete',[[r,L],[ri,L]],20,{uv:2});B.lathe('concrete',[[ri,-L],[r,-L]],20,{uv:2});
   /* the axis laid along ry, tipped by tilt; the section crushed to under half its height by its own weight, its belly sunk into the mound */
   m.makeRotationY(-pc.ry).multiply(new THREE.Matrix4().makeScale(1,.42,1)).multiply(new THREE.Matrix4().makeRotationZ(-Math.PI/2+pc.tilt));m.setPosition(pc.x,r*.42*.55,pc.z);}
  else if(pc.kind==='disc'){const r=pc.r;B.lathe('white',[[r,0],[r-2,1.6],[r*.45,2.6],[0,2.8]],40,{uv:4});B.lathe('bronze',[[0,-.6],[r,-.6]],40,{uv:2});B.lathe('bronze',[[r,-.6],[r,0]],40,{uv:2});
   m.makeRotationY(-pc.ry).multiply(new THREE.Matrix4().makeRotationX(pc.tilt));m.setPosition(pc.x,r*Math.sin(pc.tilt)*.6,pc.z);}
  else if(pc.kind==='top'){   /* the tower's own top lying (MP.debrisTopGeo): its axis along ry, the side that faced the fall underneath, crushed a little and its belly in the heap */
   const T=MP.debrisTopGeo(F,pc.y0,pc.y1),c=pc.crush==null?.58:pc.crush;   /* crushed under its own weight (an Ancient tower's 64 m width whole stood 41 m high on its side, two blocks standing) */
   m.makeTranslation(pc.x,T.xmax*c*(1-(pc.sink==null?.18:pc.sink)),pc.z).multiply(new THREE.Matrix4().makeRotationY(-pc.ry)).multiply(new THREE.Matrix4().makeScale(1,c,1)).multiply(new THREE.Matrix4().makeRotationZ(-Math.PI/2+(pc.tilt||0)));
   for(const name in T.geos)put(name,T.geos[name],m);return;}
  else{B.obox('concrete',0,0,0,0,pc.w,pc.t,pc.d,{uv:3});m.makeRotationY(-pc.ry).multiply(new THREE.Matrix4().makeRotationX(pc.tilt));m.setPosition(pc.x,pc.y,pc.z);}
  B.finish(F,'piece').children.forEach(c=>put(c.material.name.replace(/^mp\./,''),c.geometry,m));});
 const G=new THREE.Group();G.name=F.id+'.'+state+'.debris';let tris=0;
 for(const name in acc){const q=acc[name],g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(q.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(q.n,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(q.u,2));g.setAttribute('color',new THREE.Float32BufferAttribute(q.c,3));
  g.setIndex(q.p.length/3>65535?new THREE.Uint32BufferAttribute(q.i,1):new THREE.Uint16BufferAttribute(q.i,1));g.computeBoundingSphere();const mesh=new THREE.Mesh(g,M[name]);mesh.name=G.name+'.'+name;G.add(mesh);tris+=q.i.length/3;}
 G.userData={family:F.id,state:state,tris:Math.round(tris),mounds:P.mounds.length,pieces:P.pieces.length};return G;};
