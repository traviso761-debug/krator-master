// ---------- the kit Hyrule's places are built from ----------
// Fan work: Breath of the Wild belongs to Nintendo; every shape here is this project's own.
//
// Materials (one palette, shared), the simple solids (block, cylinder, cone, ball, limb, lathe), roofs (gable, hip,
// the hipped-and-gabled roof of Kakariko), walls with merlons along the top, a house, a frame for laying things out
// round a centre at an angle, and build(): every part that does not glow or move is merged by material, so a whole
// town is a handful of draw calls. All of it returns plain meshes for a model function to gather and build.

export function kit(api){
  const {THREE,group,gh,animHooks,ctx}=api;
  const nightF=()=>api.nightF&&api.hour?api.nightF(api.hour()):0;
  const cache=new Map();
  const mat=(c,o)=>{const k=c+JSON.stringify(o||{});if(!cache.has(k))cache.set(k,new THREE.MeshLambertMaterial(Object.assign({color:c,flatShading:true},o||{})));return cache.get(k);};
  // a glowing material, brighter at night
  const glows=[];animHooks.push(()=>{const n=nightF();for(const [m,k] of glows)m.emissiveIntensity=(0.45+0.9*n)*k;});
  const glowM=(c,k)=>{const m=new THREE.MeshLambertMaterial({color:c,emissive:c,emissiveIntensity:0.6,flatShading:true});glows.push([m,k||1]);return m;};
  const M={stone:mat(0xbab2a2),stone2:mat(0x9c9486),stone3:mat(0x7e776c),pale:mat(0xe4e0d6),slate:mat(0x3e5470),slate2:mat(0x34465e),
    gold:mat(0xc8a050),wood:mat(0x8a6440),wood2:mat(0x6a4a30),wood3:mat(0xa88458),thatch:mat(0x9a8458),thatch2:mat(0x7a6a48),
    plaster:mat(0xece4d2),timber:mat(0x5a4030),tile:mat(0xa8543a),tile2:mat(0x8a4a3a),tileB:mat(0x4a6a8a),
    rock:mat(0x8a8276),rock2:mat(0x6c665e),rock3:mat(0x5a524a),sand:mat(0xe0c08a),sand2:mat(0xc8a46a),sand3:mat(0xd6b07a),
    sheikah:mat(0x4a4642),sheikah2:mat(0x5e5a54),cloth:mat(0xe8dcc0),cloth2:mat(0xb88a5a),red:mat(0xa83a2a),moss:mat(0x5a7a3a),
    blue:mat(0x6aa8c8),blue2:mat(0x4a88b8),zora:mat(0xd8e8ee),zora2:mat(0xa8c8dc),leaf:mat(0x4a7a36),leaf2:mat(0x5c8c40),
    trunk:mat(0x6a5038),bark:mat(0x5a4632),pink:mat(0xe890b0),black:mat(0x1a1418),dark:mat(0x2a2624),white:mat(0xf4f2ec),
    paper:mat(0xf0e6c8),metal:mat(0x6a6660),iron:mat(0x4a4846),lava:new THREE.MeshBasicMaterial({color:0xff6a1a})};
  const UP=new THREE.Vector3(0,1,0);
  const mesh=(g,m,x,y,z,ry)=>{const o=new THREE.Mesh(g,m);o.position.set(x||0,y||0,z||0);if(ry)o.rotation.y=ry;return o;};
  const blk=(x,y,z,lx,h,lz,m,ry)=>mesh(new THREE.BoxGeometry(lx,h,lz).translate(0,h/2,0),m,x,y,z,ry);
  const cyl=(x,y,z,r0,r1,h,m,seg)=>mesh(new THREE.CylinderGeometry(r1,r0,h,seg||10).translate(0,h/2,0),m,x,y,z);
  const cone=(x,y,z,r,h,m,seg)=>mesh(new THREE.ConeGeometry(r,h,seg||10).translate(0,h/2,0),m,x,y,z);
  const sph=(x,y,z,r,m,sx,sy,sz,det)=>{const o=mesh(new THREE.IcosahedronGeometry(r,det==null?1:det),m,x,y,z);o.scale.set(sx||1,sy||1,sz||1);return o;};
  const dome=(x,y,z,r,m,sy,seg)=>{const o=mesh(new THREE.SphereGeometry(r,seg||14,Math.max(4,(seg||14)>>1),0,Math.PI*2,0,Math.PI/2),m,x,y,z);o.scale.y=sy||1;return o;};
  const limb=(a,b,r0,r1,m,seg)=>{const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),d=B.clone().sub(A),L=d.length();
    const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r0,L,seg||8),m);o.position.copy(A).addScaledVector(d,0.5);o.quaternion.setFromUnitVectors(UP,d.normalize());return o;};
  // a turned shape: prof is [[radius, y]...] from the bottom up
  const lathe=(prof,m,x,y,z,seg)=>mesh(new THREE.LatheGeometry(prof.map(([r,h])=>new THREE.Vector2(Math.max(0.001,r),h)),seg||16),m,x,y,z);
  // a gable roof: a prism, ridge along x, its foot at y; w along the ridge, d across, h to the ridge
  const prism=(()=>{const A=[-.5,0,-.5],B=[.5,0,-.5],C=[.5,0,.5],D=[-.5,0,.5],E=[-.5,1,0],F=[.5,1,0];
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([...A,...E,...F,...A,...F,...B,...D,...C,...F,...D,...F,...E,...A,...D,...E,...B,...F,...C].map(v=>v),3));g.computeVertexNormals();return g;})();
  const gable=(x,y,z,w,d,h,m,ry)=>{const o=mesh(prism,m,x,y,z,ry);o.scale.set(w,h,d);return o;};
  const pyr=new THREE.ConeGeometry(Math.SQRT1_2,1,4,1).rotateY(Math.PI/4).translate(0,0.5,0);
  const hip=(x,y,z,w,d,h,m,ry)=>{const o=mesh(pyr,m,x,y,z,ry);o.scale.set(w,h,d);return o;};
  // Kakariko's roof: a deep hip below, a small gable riding on its top
  const irimoya=(parts,x,y,z,w,d,h,m,ry)=>{parts.push(hip(x,y,z,w,d,h*0.75,m,ry),gable(x,y+h*0.5,z,w*0.52,d*0.32,h*0.5,m,ry));};
  // a slab: a polygon of ground points [x,z] extruded up from y by h
  const slab=(pts,y,h,m)=>{const sh=new THREE.Shape(pts.map(([x,z])=>new THREE.Vector2(x,-z)));
    return mesh(new THREE.ExtrudeGeometry(sh,{depth:h,bevelEnabled:false}).rotateX(-Math.PI/2),m,0,y,0);};
  // a frame at (cx,cz) turned by yaw: F(u,w) -> [x,z], u along, w across
  const frame=(cx,cz,yaw)=>{const c=Math.cos(yaw),s=Math.sin(yaw);return (u,w)=>[cx+c*u-s*w,cz+s*u+c*w];};
  // a wall from a to b, standing on the ground at each end's lower, merlons along the top if crenel
  const wall=(parts,a,b,h,t,m,crenel,y0)=>{const L=Math.hypot(b[0]-a[0],b[1]-a[1]),yaw=-Math.atan2(b[1]-a[1],b[0]-a[0]),y=y0!=null?y0:Math.min(gh(a[0],a[1]),gh(b[0],b[1]))-1.5;
    parts.push(blk((a[0]+b[0])/2,y,(a[1]+b[1])/2,L+t*0.6,h,t,m,yaw));
    if(crenel){const n=Math.floor(L/(crenel*2));for(let k=0;k<n;k++){const u=(k+0.5)/n;parts.push(blk(a[0]+(b[0]-a[0])*u,y+h,a[1]+(b[1]-a[1])*u,crenel,crenel*0.8,t*1.05,m,yaw));}}
    return y+h;};
  // windows: a row of dark openings along a wall face (u from a to b), at height y, n of them
  const windows=(parts,a,b,y,n,w,h,off,m)=>{const yaw=-Math.atan2(b[1]-a[1],b[0]-a[0]),L=Math.hypot(b[0]-a[0],b[1]-a[1]),nx=-(b[1]-a[1])/L,nz=(b[0]-a[0])/L;
    for(let k=0;k<n;k++){const u=(k+0.5)/n;parts.push(blk(a[0]+(b[0]-a[0])*u+nx*off,y,a[1]+(b[1]-a[1])*u+nz*off,w,h,0.3,m||M.dark,yaw));}};
  // a house: walls, a door and windows on the front (+w side), a roof of the given kind, a chimney if asked
  const house=(parts,x,y,z,w,d,h,yaw,o)=>{o=o||{};const F=frame(x,z,yaw),ry=-yaw,wallM=o.wall||M.plaster,roofM=o.roof||M.tile,rh=o.rh||d*0.55;
    if(o.plinth)parts.push(blk(x,y-1.2,z,w+1,1.4+o.plinth,d+1,o.plinthM||M.stone2,ry));
    const y1=y+(o.plinth||0);parts.push(blk(x,y1,z,w,h,d,wallM,ry));
    if(o.timber){for(const s of [-1,1]){const [cx_,cz_]=F(s*(w/2-0.2),0);parts.push(blk(cx_,y1,cz_,0.5,h,d+0.1,M.timber,ry));}
      const [mx,mz]=F(0,0);parts.push(blk(mx,y1+h*0.5,mz,w+0.1,0.45,d+0.1,M.timber,ry));}
    const [dx,dz]=F(o.doorU||0,d/2+0.1);parts.push(blk(dx,y1,dz,1.6,Math.min(2.6,h*0.8),0.3,o.doorM||M.wood2,ry));
    if(h>3.2){for(const u of [-w/3,w/3]){if(Math.abs(u-(o.doorU||0))<1.6)continue;const [wx,wz]=F(u,d/2+0.12);parts.push(blk(wx,y1+h*0.45,wz,1.2,1.3,0.3,o.winM||M.dark,ry));}}
    const kind=o.kind||'gable',ov=o.over==null?0.8:o.over;
    if(kind==='gable')parts.push(gable(x,y1+h,z,w+ov*2,d+ov*2,rh,roofM,ry));
    else if(kind==='hip')parts.push(hip(x,y1+h,z,(w+ov*2)*1.05,(d+ov*2)*1.05,rh,roofM,ry));
    else if(kind==='irimoya')irimoya(parts,x,y1+h,z,(w+ov*2)*1.1,(d+ov*2)*1.1,rh,roofM,ry);
    else if(kind==='flat')parts.push(blk(x,y1+h,z,w+0.4,0.6,d+0.4,roofM,ry));
    else if(kind==='dome')parts.push(dome(x,y1+h,z,Math.min(w,d)*0.5,roofM,0.9));
    if(o.chimney){const [cx_,cz_]=F(w*0.3,-d*0.15);parts.push(blk(cx_,y1+h,cz_,1.1,rh*0.9+1.2,1.1,M.stone2,ry));}
    // Hateno's chimney: a tall stack against the gable end, wide at the foot and tapering to well over the ridge
    if(o.stack){const [cx_,cz_]=F(-w/2-1.1,0);parts.push(mesh(new THREE.CylinderGeometry(0.75,1.9,h+rh+4.5,4,1).rotateY(Math.PI/4).translate(0,(h+rh+4.5)/2,0),o.stackM||wallM,cx_,y1-0.2,cz_,ry));}
    // Kakariko's ridge: crossed boards standing up at each end of the little gable on the roof
    if(o.chigi){const top=y1+h+rh*1.0,half=(w+ov*2)*1.1*0.26;for(const s of [-1,1]){const [ex,ez]=F(s*half,0);
        for(const t of [-1,1]){const [ax,az]=F(s*half,t*0.3),[bx,bz]=F(s*half,-t*1.4);parts.push(limb([ax,top-0.6,az],[bx,top+1.6,bz],0.16,0.12,o.chigiM||M.wood2,4));}}}
    return y1+h;};
  // one mesh per material for everything that does not move or glow on its own
  function solid(parts){const keep=[],b=new Map();
    for(const p of parts){if(p.isMesh&&!p.children.length&&!Array.isArray(p.material)&&!p.material.map&&!p.userData.noMerge&&!(p.material.emissive&&p.material.emissiveIntensity>0&&glows.some(g=>g[0]===p.material))){if(!b.has(p.material))b.set(p.material,[]);b.get(p.material).push(p);}else keep.push(p);}
    for(const [m,l] of b){if(l.length<3){keep.push(...l);continue;}keep.push(api.mergeParts(l,m));}
    // glowing parts: merged too, by material, so a town's lamps are one mesh
    const gl=new Map(),rest=[];for(const p of keep){if(p.isMesh&&!p.userData.noMerge&&glows.some(g=>g[0]===p.material)&&!p.children.length){if(!gl.has(p.material))gl.set(p.material,[]);gl.get(p.material).push(p);}else rest.push(p);}
    for(const [m,l] of gl)rest.push(l.length>1?api.mergeParts(l,m):l[0]);
    return rest;}
  const build=(L,parts)=>group(L,solid(parts));
  const hz=v=>{const t=Math.sin(v*12.9898)*43758.5453;return t-Math.floor(t);};
  // a tiny seeded random, for laying out towns that come out the same every time
  const rng=seed=>{let s=Math.floor(Math.abs(seed))%2147483646+1;return ()=>{s=s*16807%2147483647;return (s-1)/2147483646;};};
  return {THREE,M,mat,glowM,mesh,slab,blk,cyl,cone,sph,dome,limb,lathe,gable,hip,irimoya,frame,wall,windows,house,solid,build,hz,rng,gh,nightF};
}
