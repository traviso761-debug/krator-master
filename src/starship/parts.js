// ---------- the pieces every hull here is made of ----------
// Fan work. Star Trek belongs to Paramount; nothing from any film, series or game is used, and every shape
// on these pages is this project's own geometry, built from the published dimensions and the silhouette.
//
// There are no textures anywhere in this project, so everything that would be a decal on a real model has
// to be geometry: the windows are little boxes, the warp grilles are stacks of slats, the pennants and the
// registry are panels of a different colour let into the hull. That sounds like a limitation and mostly is
// not - at the size a ship occupies on screen, a row of forty lit boxes reads as a row of windows better
// than any texture would, and it survives the wireframe, which a texture does not.
//
// The one thing that does suffer is lettering. There is none. A hull number would have to be forty separate
// extrusions to be legible and would be four pixels tall from anywhere you would actually look at the ship.

// A body of revolution from a profile. This is the single most useful shape here: a saucer, a deflector
// dish, a Bussard collector, a docking clamp and a station core are all one profile turned round an axis,
// and a lathe gets the subtle double curve of a saucer section in a way stacked cylinders never do.
export function lathe(THREE, profile, seg, mat, cap){
  const pts=profile.map(([r,y])=>new THREE.Vector2(Math.max(0.0001,r),y));
  const g=new THREE.LatheGeometry(pts,seg||48);
  if(cap===false)g.computeVertexNormals();
  const m=new THREE.Mesh(g,mat);
  return m;
}

// The same, squashed across one axis: a Galaxy-class saucer is not round, it is an ellipse a little longer
// than it is wide, and every hull section here is flattened or stretched somewhere.
export function ellipsoidLathe(THREE, profile, seg, mat, sx, sz){
  const m=lathe(THREE,profile,seg,mat);
  m.scale.set(sx===undefined?1:sx,1,sz===undefined?1:sz);
  return m;
}

// A hull that runs fore-and-aft rather than round an axis: a list of cross-sections along x, each one an
// ellipse with its own size and its own offset, joined up into a skin. An engineering hull, a nacelle, a
// warp pylon, a docking arm and a neck are all this shape with different numbers in the table, and writing
// them as tables rather than as stacks of cylinders is the difference between a hull and a pile of tins.
export function tube(THREE, stations, seg, mat, capFront, capBack){
  const N=stations.length, S=seg||24;
  const pos=[],idx=[];
  for(const st of stations){
    for(let j=0;j<S;j++){
      const a=j/S*Math.PI*2;
      pos.push(st.x,(st.cy||0)+Math.sin(a)*st.ry,(st.cz||0)+Math.cos(a)*st.rz);
    }
  }
  for(let i=0;i<N-1;i++)for(let j=0;j<S;j++){
    const a=i*S+j, b=i*S+(j+1)%S, c=(i+1)*S+j, d=(i+1)*S+(j+1)%S;
    idx.push(a,c,b, b,c,d);
  }
  const cap=(i,flip)=>{
    const st=stations[i], base=pos.length/3;
    pos.push(st.x,st.cy||0,st.cz||0);
    for(let j=0;j<S;j++){
      const a=i*S+j, b=i*S+(j+1)%S;
      if(flip)idx.push(base,b,a); else idx.push(base,a,b);
    }
  };
  if(capFront!==false)cap(0,true);
  if(capBack!==false)cap(N-1,false);
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g.setIndex(idx);g.computeVertexNormals();g.computeBoundingSphere();
  return new THREE.Mesh(g,mat);
}

// The same thing bent: the stations follow a path in (x, y) rather than a straight line, which is what a
// warp pylon and a station's docking arm both are.
export function sweep(THREE, path, seg, mat){
  const pos=[],idx=[],S=seg||16,N=path.length;
  for(const st of path){
    // the frame at this station: along the path, and the two axes across it
    const dir=st.dir||[1,0,0];
    const up=[0,1,0];
    const rx=[dir[1]*up[2]-dir[2]*up[1],dir[2]*up[0]-dir[0]*up[2],dir[0]*up[1]-dir[1]*up[0]];
    const rl=Math.hypot(rx[0],rx[1],rx[2])||1;
    const R=[rx[0]/rl,rx[1]/rl,rx[2]/rl];
    const U=[R[1]*dir[2]-R[2]*dir[1],R[2]*dir[0]-R[0]*dir[2],R[0]*dir[1]-R[1]*dir[0]];
    for(let j=0;j<S;j++){
      const a=j/S*Math.PI*2, cx=Math.cos(a)*st.rz, cy=Math.sin(a)*st.ry;
      pos.push(st.p[0]+R[0]*cx+U[0]*cy, st.p[1]+R[1]*cx+U[1]*cy, st.p[2]+R[2]*cx+U[2]*cy);
    }
  }
  for(let i=0;i<N-1;i++)for(let j=0;j<S;j++){
    const a=i*S+j, b=i*S+(j+1)%S, c=(i+1)*S+j, d=(i+1)*S+(j+1)%S;
    idx.push(a,c,b, b,c,d);
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g.setIndex(idx);g.computeVertexNormals();g.computeBoundingSphere();
  return new THREE.Mesh(g,mat);
}

// A row of lit windows, as instances, following a line. `n` windows between `a` and `b`, standing off the
// hull along `out`, all of them the same little box. Two decks means calling it twice.
export function windowRow(THREE, parts, mat, a, b, n, size, out, jitter){
  const A=new THREE.Vector3().fromArray(a), B=new THREE.Vector3().fromArray(b);
  const O=new THREE.Vector3().fromArray(out||[0,0,0]);
  for(let i=0;i<n;i++){
    const t=n===1?0.5:i/(n-1);
    const p=A.clone().lerp(B,t).add(O);
    if(jitter&&((i*37)%7)===0)continue;         // a few of them are dark, because a few of them always are
    const w=new THREE.Mesh(new THREE.BoxGeometry(size[0],size[1],size[2]),mat);
    w.position.copy(p);
    parts.push(w);
  }
}

// Windows round an ellipse: the saucer rim, the station's promenade, the docking ring. `phase` skips the
// stretch where the hull is doing something else.
export function windowRing(THREE, parts, mat, y, rx, rz, n, size, from, to, cx){
  const a0=from===undefined?0:from, a1=to===undefined?Math.PI*2:to, x0=cx||0;
  for(let i=0;i<n;i++){
    const a=a0+(a1-a0)*(i/n);
    if(((i*53)%11)===0)continue;
    const w=new THREE.Mesh(new THREE.BoxGeometry(size[0],size[1],size[2]),mat);
    w.position.set(x0+Math.cos(a)*rx,y,Math.sin(a)*rz);
    w.rotation.y=-a;
    parts.push(w);
  }
}

// A warp grille: a stack of slats behind a recessed face. The glow is the whole point of a nacelle and it
// is the one thing on the ship that is allowed to be a flat emissive colour.
export function grille(THREE, parts, glowMat, frameMat, x, y, z, len, h, d, slats, A){
  const holder=[];
  for(let i=0;i<slats;i++){
    const t=(i+0.5)/slats;
    const s=new THREE.Mesh(new THREE.BoxGeometry(len/slats*0.62,h*0.86,d),glowMat);
    s.position.set(x+(t-0.5)*len,y,z);
    holder.push(s);
  }
  const back=new THREE.Mesh(new THREE.BoxGeometry(len*1.04,h,d*0.5),frameMat);
  back.position.set(x,y,z-d*0.4);
  holder.push(back);
  if(A){for(const m of holder){m.position.applyAxisAngle(new THREE.Vector3(0,1,0),A);m.rotation.y=A;}}
  for(const m of holder)parts.push(m);
}

// Merge a pile of static meshes into one buffer per material. The same trick the engine uses and for the
// same reason: a hull is six hundred little boxes and a page should not pay six hundred draw calls for it.
export function mergeParts(THREE, meshes, mat){
  const pos=[],nor=[],nm=new THREE.Matrix3(),v=new THREE.Vector3(),vn=new THREE.Vector3();
  for(const m of meshes){
    m.updateMatrix();
    const g=m.geometry.index?m.geometry.toNonIndexed():m.geometry;
    const p=g.attributes.position,n=g.attributes.normal;
    nm.getNormalMatrix(m.matrix);
    for(let i=0;i<p.count;i++){
      v.fromBufferAttribute(p,i).applyMatrix4(m.matrix);pos.push(v.x,v.y,v.z);
      vn.fromBufferAttribute(n,i).applyNormalMatrix(nm).normalize();nor.push(vn.x,vn.y,vn.z);
    }
    if(g!==m.geometry)g.dispose();
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));
  g.computeBoundingSphere();
  return new THREE.Mesh(g,mat);
}

// Fold everything that shares a material into one mesh and hang the lot on a group.
export function fold(THREE, group, parts){
  const by=new Map();
  for(const m of parts){let a=by.get(m.material);if(!a){a=[];by.set(m.material,a);}a.push(m);}
  for(const [mat,list] of by)group.add(mergeParts(THREE,list,mat));
  return group;
}

// The hull palette. Starfleet grey is not grey: it is a very pale blue-green that goes warm where the light
// hits it, and the panels are the same colour at slightly different values, which is why a hull reads as
// panelled rather than painted.
export function hullPalette(THREE, o){
  const k=o||{};
  return {
    hull:new THREE.MeshPhongMaterial({color:k.hull||0xc8ccc6,specular:0x3a4048,shininess:22,flatShading:false}),
    panelA:new THREE.MeshPhongMaterial({color:k.panelA||0xbcc2be,specular:0x343a40,shininess:18,flatShading:true}),
    panelB:new THREE.MeshPhongMaterial({color:k.panelB||0xd2d6cf,specular:0x30363c,shininess:18,flatShading:true}),
    dark:new THREE.MeshPhongMaterial({color:k.dark||0x565c62,specular:0x22262a,shininess:14,flatShading:true}),
    trim:new THREE.MeshPhongMaterial({color:k.trim||0x8e949a,specular:0x40464c,shininess:30,flatShading:true}),
    glass:new THREE.MeshPhongMaterial({color:k.glass||0x1e2a34,specular:0xbfd4e4,shininess:80}),
    lit:new THREE.MeshBasicMaterial({color:k.lit||0xffe9b8}),
    warp:new THREE.MeshBasicMaterial({color:k.warp||0x7fb8ff}),
    bussard:new THREE.MeshBasicMaterial({color:k.bussard||0xff6a4a,transparent:true,opacity:0.92}),
    impulse:new THREE.MeshBasicMaterial({color:k.impulse||0xff8a3a,transparent:true,opacity:0.9}),
    deflector:new THREE.MeshBasicMaterial({color:k.deflector||0xc8a24a,transparent:true,opacity:0.9}),
    nav:new THREE.MeshBasicMaterial({color:0xff4030}),
    navG:new THREE.MeshBasicMaterial({color:0x40ff70}),
    pennant:new THREE.MeshPhongMaterial({color:k.pennant||0x9aa2a8,specular:0x30363c,shininess:20,flatShading:true}),
  };
}
