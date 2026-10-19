// ================================================================= HOST — the Deep Root cavern (P3d): the voids, the cap opened, the dressing
// Draws CAVERN's records (57b). The cavern's chunks (KCAVERN surface nets, 0.5 m) are split by what each triangle is:
// the ground inside an opening's rim (the cap round the court and the light well) takes the cap's own slickrock material
// and its map's world UVs, so it meets the cap with no seam, and wins where they overlap; the voids' walls, floors and
// vaults take the stacks' cross-bedded sandstone, mapped by the face's facing, darkened by the chunk's occlusion. The cap
// itself (necanyons' land fragment draws a top as five coarse rings) is re-cut over the openings: each of its top
// triangles that reaches one is split into metre triangles and those inside the hole are dropped. The dressing (the kit's
// rock-cut pieces) is instanced, the door's face scaled to the court; the ring of standing stones, the stack fig with its
// roots down the well, the rain pool and the processional are drawn here.
const CAVERN_MESH={};
const CAVERN_DRAW=(function(){if(!CAVERN)return null;try{
 const t0=performance.now(),D=CAVERN,C=D.C,grp=new THREE.Group();grp.name='the Deep Root cavern';grp.userData.cavern=true;
 const mark=o=>{o.userData.host=true;o.userData.cavern=true;return o;};
 const meshBy=lab=>{let m=null;scene.traverse(o=>{if(!m&&o.isMesh&&o.userData.rock&&String(o.userData.inspectLabel).indexOf(lab)===0)m=o;});return m;};
 const capMesh=meshBy('Slickrock'),stackMesh=meshBy('Red sandstone (a stack'),wallMesh=meshBy('Red sandstone (a mesa');
 const holes=D.openings.map(q=>({c:q.c,R:q.r+q.rim}));
 // ---------------------------------------------------------------- the cap re-cut over the openings
 let capCut=0;
 if(capMesh){const g=capMesh.geometry,P=g.attributes.position,U=g.attributes.uv,Cl=g.attributes.color,I=g.index.array,TOP=D.y.top;
  const near=(ax,az,bx,bz,cx,cz)=>holes.some(h=>{const x0=Math.min(ax,bx,cx)-h.R,x1=Math.max(ax,bx,cx)+h.R,z0=Math.min(az,bz,cz)-h.R,z1=Math.max(az,bz,cz)+h.R;return h.c[0]>x0&&h.c[0]<x1&&h.c[1]>z0&&h.c[1]<z1;});
  const keep=[],add={p:[],u:[],c:[]};
  for(let t=0;t<I.length;t+=3){const a=I[t],b=I[t+1],c=I[t+2];
   if(Math.abs(P.getY(a)-TOP)>2.5||Math.abs(P.getY(b)-TOP)>2.5||Math.abs(P.getY(c)-TOP)>2.5||!near(P.getX(a),P.getZ(a),P.getX(b),P.getZ(b),P.getX(c),P.getZ(c))){keep.push(a,b,c);continue;}
   capCut++;
   // refined where it meets a hole: split in four at its edges' middles while it is bigger than a metre and a hole's edge
   // runs near it, then dropped where its middle is in the hole (the rim less a metre: the cavern's ground overlaps the
   // cap there). Every new vertex is on the old triangle's plane (its attributes interpolated), so the different levels
   // meet with no crack
   const at=(w)=>[[P.getX(a)*w[0]+P.getX(b)*w[1]+P.getX(c)*w[2],P.getY(a)*w[0]+P.getY(b)*w[1]+P.getY(c)*w[2],P.getZ(a)*w[0]+P.getZ(b)*w[1]+P.getZ(c)*w[2]],
     [U.getX(a)*w[0]+U.getX(b)*w[1]+U.getX(c)*w[2],U.getY(a)*w[0]+U.getY(b)*w[1]+U.getY(c)*w[2]],[Cl.getX(a)*w[0]+Cl.getX(b)*w[1]+Cl.getX(c)*w[2],Cl.getY(a)*w[0]+Cl.getY(b)*w[1]+Cl.getY(c)*w[2],Cl.getZ(a)*w[0]+Cl.getZ(b)*w[1]+Cl.getZ(c)*w[2]]];
   const segD=(px,pz,ax,az,bx,bz)=>{const dx=bx-ax,dz=bz-az,t=Math.max(0,Math.min(1,((px-ax)*dx+(pz-az)*dz)/Math.max(1e-9,dx*dx+dz*dz)));return Math.hypot(px-ax-dx*t,pz-az-dz*t);};
   const refine=(A,B,Cq,depth)=>{const pa=at(A),pb=at(B),pc=at(Cq),mx=(pa[0][0]+pb[0][0]+pc[0][0])/3,mz=(pa[0][2]+pb[0][2]+pc[0][2])/3;
    const L=Math.max(Math.hypot(pa[0][0]-pb[0][0],pa[0][2]-pb[0][2]),Math.hypot(pb[0][0]-pc[0][0],pb[0][2]-pc[0][2]),Math.hypot(pc[0][0]-pa[0][0],pc[0][2]-pa[0][2]));
    // the nearest a hole's cut circle comes to the triangle (0 when it crosses it)
    const edgeNear=holes.some(h=>{const Rc=h.R-1,ds=[segD(h.c[0],h.c[1],pa[0][0],pa[0][2],pb[0][0],pb[0][2]),segD(h.c[0],h.c[1],pb[0][0],pb[0][2],pc[0][0],pc[0][2]),segD(h.c[0],h.c[1],pc[0][0],pc[0][2],pa[0][0],pa[0][2])];
     const dmin=Math.min(...ds),dmax=Math.max(Math.hypot(pa[0][0]-h.c[0],pa[0][2]-h.c[1]),Math.hypot(pb[0][0]-h.c[0],pb[0][2]-h.c[1]),Math.hypot(pc[0][0]-h.c[0],pc[0][2]-h.c[1]));
     const inside=(()=>{const s1=(pb[0][0]-pa[0][0])*(h.c[1]-pa[0][2])-(pb[0][2]-pa[0][2])*(h.c[0]-pa[0][0]),s2=(pc[0][0]-pb[0][0])*(h.c[1]-pb[0][2])-(pc[0][2]-pb[0][2])*(h.c[0]-pb[0][0]),s3=(pa[0][0]-pc[0][0])*(h.c[1]-pc[0][2])-(pa[0][2]-pc[0][2])*(h.c[0]-pc[0][0]);return (s1>=0&&s2>=0&&s3>=0)||(s1<=0&&s2<=0&&s3<=0);})();
     return (inside?0:dmin)<=Rc+.5&&dmax>=Rc-.5;});
    if(edgeNear&&L>1.1&&depth<12){const ab=[(A[0]+B[0])/2,(A[1]+B[1])/2,(A[2]+B[2])/2],bc=[(B[0]+Cq[0])/2,(B[1]+Cq[1])/2,(B[2]+Cq[2])/2],ca=[(Cq[0]+A[0])/2,(Cq[1]+A[1])/2,(Cq[2]+A[2])/2];
     refine(A,ab,ca,depth+1);refine(ab,B,bc,depth+1);refine(ca,bc,Cq,depth+1);refine(ab,bc,ca,depth+1);return;}
    if(holes.some(h=>Math.hypot(mx-h.c[0],mz-h.c[1])<h.R-1))return;
    [pa,pb,pc].forEach(q=>{add.p.push(...q[0]);add.u.push(...q[1]);add.c.push(...q[2]);});};
   refine([1,0,0],[0,1,0],[0,0,1],0);}
  if(capCut){// the new triangles appended after the old vertices (non-indexed run, indexed one by one)
   const nOld=P.count,nAdd=add.p.length/3,pos=new Float32Array((nOld+nAdd)*3),uv=new Float32Array((nOld+nAdd)*2),col=new Float32Array((nOld+nAdd)*3);
   pos.set(P.array);uv.set(U.array);col.set(Cl.array);pos.set(add.p,nOld*3);uv.set(add.u,nOld*2);col.set(add.c,nOld*3);
   const idx=new Uint32Array(keep.length+nAdd);idx.set(keep);for(let k=0;k<nAdd;k++)idx[keep.length+k]=nOld+k;
   const g2=new THREE.BufferGeometry();g2.setAttribute('position',new THREE.BufferAttribute(pos,3));g2.setAttribute('uv',new THREE.BufferAttribute(uv,2));g2.setAttribute('color',new THREE.BufferAttribute(col,3));
   g2.setIndex(new THREE.BufferAttribute(idx,1));g2.computeVertexNormals();g2.computeBoundingSphere();capMesh.geometry=g2;g.dispose();}}
 // ---------------------------------------------------------------- the cavern's chunks
 // the cap's world-UV scale, read off its own vertices (uv = x / s on the tops)
 let sTop=4;if(capMesh){const g=capMesh.geometry,P=g.attributes.position,U=g.attributes.uv;for(let i=0;i<P.count;i++){const x=P.getX(i);if(Math.abs(x)>20){sTop=x/U.getX(i);break;}}}
 let sWall=6;{const W=stackMesh||wallMesh;if(W){const P=W.geometry.attributes.position,U=W.geometry.attributes.uv;for(let i=0;i<P.count;i++){if(Math.abs(U.getY(i))>.5){sWall=P.getY(i)/U.getY(i);break;}}}}   /* walls: uv.y = y / s */
 const gMat=capMesh?capMesh.material.clone():new THREE.MeshStandardMaterial({color:0xc9906e,roughness:1});gMat.polygonOffset=true;gMat.polygonOffsetFactor=-1;gMat.polygonOffsetUnits=-1;
 const wMat=(stackMesh||wallMesh)?(stackMesh||wallMesh).material.clone():new THREE.MeshStandardMaterial({color:0xa8503a,roughness:1});wMat.side=THREE.DoubleSide;
 let tris=0,chunks=0;
 for(const key of C.chunks){const ch=C.meshChunk(key);if(!ch.idx.length)continue;chunks++;const nv=ch.pos.length/3,G=65535;
  const uv=new Float32Array(nv*2),col=new Float32Array(nv*3);
  for(let i=0;i<nv;i++){const x=ch.pos[i*3],y=ch.pos[i*3+1],z=ch.pos[i*3+2],nx=Math.abs(ch.nrm[i*3]),ny=Math.abs(ch.nrm[i*3+1]),nz=Math.abs(ch.nrm[i*3+2]);
   if(ch.prim[i]===G){uv[i*2]=x/sTop;uv[i*2+1]=z/sTop;col[i*3]=col[i*3+1]=col[i*3+2]=1;}
   else{if(ny>.7){uv[i*2]=x/sWall;uv[i*2+1]=z/sWall;}else if(nx>nz){uv[i*2]=z/sWall;uv[i*2+1]=y/sWall;}else{uv[i*2]=x/sWall;uv[i*2+1]=y/sWall;}
    const o=.5+.5*ch.occ[i];col[i*3]=o*.95;col[i*3+1]=o*.86;col[i*3+2]=o*.8;}}
  const gi=[],wi=[];for(let t=0;t<ch.idx.length;t+=3){const a=ch.idx[t],b=ch.idx[t+1],c=ch.idx[t+2];
   if(ch.prim[a]===G&&ch.prim[b]===G&&ch.prim[c]===G){const mx=(ch.pos[a*3]+ch.pos[b*3]+ch.pos[c*3])/3,mz=(ch.pos[a*3+2]+ch.pos[b*3+2]+ch.pos[c*3+2])/3;
    if(holes.some(h=>Math.hypot(mx-h.c[0],mz-h.c[1])<h.R))gi.push(a,b,c);}else wi.push(a,b,c);}
  const base=new THREE.BufferGeometry();base.setAttribute('position',new THREE.BufferAttribute(ch.pos,3));base.setAttribute('normal',new THREE.BufferAttribute(ch.nrm,3));
  base.setAttribute('uv',new THREE.BufferAttribute(uv,2));base.setAttribute('color',new THREE.BufferAttribute(col,3));
  [[gi,gMat,'The cap round the Deep Root\'s openings'],[wi,wMat,'The Deep Root (hewn sandstone)']].forEach(([ix,mat,lab])=>{if(!ix.length)return;const g=base.clone();g.setIndex(new THREE.BufferAttribute(new Uint32Array(ix),1));g.computeBoundingSphere();
   const me=mark(new THREE.Mesh(g,mat));me.userData.inspectLabel=lab;me.userData.rock=true;me.userData.cavernChunk=key;grp.add(me);tris+=ix.length/3;});}
 // ---------------------------------------------------------------- the dressing: the kit's rock-cut pieces, instanced (with their scale)
 {const by={},m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler();D.dress.forEach(d=>{const id=d.key+'#'+d.v;(by[id]||(by[id]={key:d.key,v:d.v,L:[]})).L.push(d);});
  for(const id in by){const B=by[id],P=isleProto('cat',B.key,B.v,TOWN_PROTOS);if(!P)continue;
   P.parts.forEach(pt=>{const im=mark(new THREE.InstancedMesh(pt.geo,pt.mat,B.L.length));B.L.forEach((d,i)=>{q.setFromEuler(e.set(0,d.ry,0));m4.compose(new THREE.Vector3(d.x,d.y,d.z),q,new THREE.Vector3(d.s,d.s,d.s));im.setMatrixAt(i,m4);});
    im.instanceMatrix.needsUpdate=true;im.computeBoundingSphere&&im.computeBoundingSphere();im.userData.inspectLabel=B.L.length===1?B.L[0].name:B.key;grp.add(im);tris+=pt.tris*B.L.length;});}}
 // ---------------------------------------------------------------- the ring of standing stones
 {const S=D.stones,g=new THREE.CylinderGeometry(.42,.55,1,5,1);g.translate(0,.5,0);
  const sm=new THREE.MeshStandardMaterial({color:new THREE.Color(0x9a5a40).convertSRGBToLinear(),roughness:.95,flatShading:true});
  const im=mark(new THREE.InstancedMesh(g,sm,S.length)),m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler();
  S.forEach((s,i)=>{q.setFromEuler(e.set(0,s.ry,0));m4.compose(new THREE.Vector3(s.x,s.y-.4,s.z),q,new THREE.Vector3(s.w*1.6,s.h+.4,s.d*1.6));im.setMatrixAt(i,m4);});
  im.instanceMatrix.needsUpdate=true;im.computeBoundingSphere&&im.computeBoundingSphere();im.userData.inspectLabel='The ring of twelve standing stones';grp.add(im);}
 // ---------------------------------------------------------------- the stack fig over the light well: its crown, its roots down the well
 {const F=D.fig,W=D.well,bark=new THREE.MeshStandardMaterial({color:new THREE.Color(0x6a5a48).convertSRGBToLinear(),roughness:.95}),leaf=new THREE.MeshStandardMaterial({color:new THREE.Color(0x3c5a28).convertSRGBToLinear(),roughness:.85,flatShading:true});
  const tr=new THREE.Mesh(new THREE.CylinderGeometry(.55,1.1,F.H*.55,8),bark);tr.position.set(F.x,F.y+F.H*.275,F.z);grp.add(mark(tr));
  for(let k=0;k<5;k++){const a=k*1.26,r=2.5+1.5*(k%2),cr=new THREE.Mesh(new THREE.IcosahedronGeometry(3.4+.6*(k%3),1),leaf);cr.position.set(F.x+Math.cos(a)*r,F.y+F.H*.62+(k%3)*1.4,F.z+Math.sin(a)*r);cr.scale.set(1.2,.75,1.2);grp.add(mark(cr));}
  // the roots: from the trunk's foot over the lip and down the well, 12 m
  const rg=[];for(let k=0;k<14;k++){const a=k/14*TAU,r0=.9,sx=F.x+Math.cos(a)*r0,sz=F.z+Math.sin(a)*r0,dx=W.c[0]-F.x,dz=W.c[1]-F.z,dl=Math.hypot(dx,dz)||1;
    const ex=W.c[0]-dx/dl*(D.well.r0-.6)+Math.cos(a)*.8,ez=W.c[1]-dz/dl*(D.well.r0-.6)+Math.sin(a)*.8,len=F.roots*(.8+.4*KRAND.unit(KRAND.hash(77,k)));
    const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(sx,F.y+.6,sz),new THREE.Vector3((sx+ex)/2,F.y+.2,(sz+ez)/2),new THREE.Vector3(ex,F.y-1.5,ez),new THREE.Vector3(ex+Math.cos(a)*.3,F.y-len,ez+Math.sin(a)*.3)]);
    rg.push(new THREE.TubeGeometry(curve,14,.07+.05*(k%3),5,false));}
  rg.forEach(g=>{const me=mark(new THREE.Mesh(g,bark));me.userData.inspectLabel=F.name+' (its roots)';grp.add(me);});
  tr.userData.inspectLabel=F.name;}
 // ---------------------------------------------------------------- the rain pool and the processional
 {const P=D.pool,g=new THREE.CircleGeometry(P.r,28);g.rotateX(-Math.PI/2);const me=mark(new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:new THREE.Color(0x2f4a4a).convertSRGBToLinear(),roughness:.06,metalness:.1,transparent:true,opacity:.88})));
  me.position.set(P.c[0],P.y,P.c[1]);me.userData.inspectLabel=P.name;grp.add(me);}
 if(D.way){const G=townGroundMat('sandstone','The processional (sandstone flags)'),col=townLin(0xa88068);grp.add(mark(townRibbons([D.way],G,(x,z)=>{const t=KSTACKS.topAt([MESA_B],x,z);return t>-1e8?t:D.y.top;},()=>col,.14)));}
 scene.add(grp);CAVERN_MESH.group=grp;
 D.dress.forEach(d=>REG.push({name:d.name,key:'cavern.'+d.key,x:d.x,z:d.z,y:d.y,r:Math.hypot(d.w,d.d)/2,h:d.h}));
 REG.push({name:'The Deep Root (the court, the passage of the tribes, the hall)',key:'cavern',x:D.axis.c[0]+D.axis.u[0]*40,z:D.axis.c[1]+D.axis.u[1]*40,y:D.y.hall,r:45,h:D.y.top-D.y.hall});
 return {chunks,tris:Math.round(tris),capCut,ms:Math.round(performance.now()-t0)};}
 catch(e){reportErr('cavern: '+(e&&e.stack||e));return null;}})();
_mark('cavern');
