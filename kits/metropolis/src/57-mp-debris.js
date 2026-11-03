// ================================================================= METROPOLIS — a ruin's rubble: the mound and what lies in it  [draw]
// MP.debris(F, state) -> a Group in the tower's own frame, or null (intact, gutted). Each mound of MP.debrisPlan (40) is a KSTACKS butte, drawn from KSTACKS.mesh in the
// concrete, its occlusion darkening the partings; each piece (a section of the shaft lying, the lamp's disc on its side, a floor slab tipped up) comes from the builder.
// One mesh a material, so the stage instances the group at every tower of the state: it is not in the hero, the shell or the impostor (it lies off the tower's axis).
MP.debris=function(F,state){const P=MP.debrisPlan(F,state);if(!P)return null;const acc={},M=MP.mats(),m4=new THREE.Matrix4(),n3=new THREE.Matrix3(),v=new THREE.Vector3();
 // a geometry's arrays into its material's bucket, moved by m (normals by its rotation)
 const put=function(name,g,m){const q=acc[name]||(acc[name]={p:[],n:[],u:[],c:[],i:[]}),P0=g.attributes.position,N0=g.attributes.normal,U0=g.attributes.uv,C0=g.attributes.color,base=q.p.length/3;n3.getNormalMatrix(m);
  for(let i=0;i<P0.count;i++){v.fromBufferAttribute(P0,i).applyMatrix4(m);q.p.push(v.x,v.y,v.z);v.fromBufferAttribute(N0,i).applyMatrix3(n3).normalize();q.n.push(v.x,v.y,v.z);q.u.push(U0?U0.getX(i):0,U0?U0.getY(i):0);if(C0)q.c.push(C0.getX(i),C0.getY(i),C0.getZ(i));else q.c.push(1,1,1);}
  const I=g.index;if(I)for(let i=0;i<I.count;i++)q.i.push(base+I.getX(i));else for(let i=0;i<P0.count;i++)q.i.push(base+i);};
 const one=new THREE.Matrix4();
 // the mounds: rubble grey, darker in the partings and under the overhangs, each bed a shade of its own
 P.mounds.forEach(function(md,mi){const S=KSTACKS.make({id:F.id+'.'+state+'.m'+mi,kind:'butte',x:md.x,z:md.z,y0:md.y0==null?0:md.y0,seed:md.seed,ry:md.ry,tiers:md.tiers,bed:[1.6,3],lobes:.38,weather:.5}),o=KSTACKS.mesh(S,{step:8});
  const g=new THREE.BufferGeometry(),col=new Float32Array(o.pos.length);for(let i=0;i<o.pos.length/3;i++){const k=(1-.45*o.occ[i])*(.9+.16*MP.u(md.seed&0xffff,o.bed[i],61)),t=o.part[i]===1?.95:1;col[i*3]=.86*k*t;col[i*3+1]=.83*k*t;col[i*3+2]=.78*k*t;}
  g.setAttribute('position',new THREE.BufferAttribute(o.pos,3));g.setAttribute('uv',new THREE.BufferAttribute(o.uv,2));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setIndex(new THREE.BufferAttribute(o.idx,1));g.computeVertexNormals();
  /* the library's uvs are in 4 m units; KSTACKS' are metres */
  const u=g.attributes.uv;for(let i=0;i<u.count;i++)u.setXY(i,u.getX(i)/4,u.getY(i)/4);put('concrete',g,one);});
 // the pieces, each drawn about its own origin, then laid where the plan says
 P.pieces.forEach(function(pc){const B=MP.builder(),m=new THREE.Matrix4();
  if(pc.kind==='fins'){MP.spindleFins(B,F,pc.y0,pc.y1,true,true);}
  else if(pc.kind==='frame'){MP.hero(F.id,state,false,'frame').children.forEach(c=>{if(!c.isInstancedMesh)put(c.material.name.replace(/^mp\./,''),c.geometry,one);});return;}
  else if(pc.kind==='shaft'){const r=pc.r,L=pc.len/2,ri=r-.8;B.lathe('white',[[r,-L],[r,L]],20,{uv:4});B.lathe('dark',[[ri,L],[ri,-L]],20,{uv:4});B.lathe('concrete',[[r,L],[ri,L]],20,{uv:2});B.lathe('concrete',[[ri,-L],[r,-L]],20,{uv:2});
   /* the axis laid along ry, tipped by tilt; the section crushed to under half its height by its own weight, its belly sunk into the mound */
   m.makeRotationY(-pc.ry).multiply(new THREE.Matrix4().makeScale(1,.42,1)).multiply(new THREE.Matrix4().makeRotationZ(-Math.PI/2+pc.tilt));m.setPosition(pc.x,r*.42*.55,pc.z);}
  else if(pc.kind==='disc'){const r=pc.r;B.lathe('white',[[r,0],[r-2,1.6],[r*.45,2.6],[0,2.8]],40,{uv:4});B.lathe('bronze',[[0,-.6],[r,-.6]],40,{uv:2});B.lathe('bronze',[[r,-.6],[r,0]],40,{uv:2});
   m.makeRotationY(-pc.ry).multiply(new THREE.Matrix4().makeRotationX(pc.tilt));m.setPosition(pc.x,r*Math.sin(pc.tilt)*.6,pc.z);}
  else{B.obox('concrete',0,0,0,0,pc.w,pc.t,pc.d,{uv:3});m.makeRotationY(-pc.ry).multiply(new THREE.Matrix4().makeRotationX(pc.tilt));m.setPosition(pc.x,pc.y,pc.z);}
  B.finish(F,'piece').children.forEach(c=>put(c.material.name.replace(/^mp\./,''),c.geometry,m));});
 const G=new THREE.Group();G.name=F.id+'.'+state+'.debris';let tris=0;
 for(const name in acc){const q=acc[name],g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(q.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(q.n,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(q.u,2));g.setAttribute('color',new THREE.Float32BufferAttribute(q.c,3));
  g.setIndex(q.p.length/3>65535?new THREE.Uint32BufferAttribute(q.i,1):new THREE.Uint16BufferAttribute(q.i,1));g.computeBoundingSphere();const mesh=new THREE.Mesh(g,M[name]);mesh.name=G.name+'.'+name;G.add(mesh);tris+=q.i.length/3;}
 G.userData={family:F.id,state:state,tris:Math.round(tris),mounds:P.mounds.length,pieces:P.pieces.length};return G;};
