// ---------- the casas: what an Antigua house shows the street ----------
// A colonial house is a blank, thick wall to the street with everything behind it round a patio, and what the wall
// carries is the same from house to house, in its own colours:
//   the zócalo     a band of darker paint along the foot of the wall, a metre high, where the rain splashes
//   the zaguán     the big double door of wood, studded, in a frame of plaster or stone, to the entrance passage
//   the rejas      the windows: tall, deep in the wall, behind black iron grilles that stand out from the wall on
//                  a sill and carry a little tiled hood, so a window is a box of bars on the street
//   the alero      the eave: the roof's clay tiles run out over the pavement on a row of wooden rafters
// On every wall of a footprint within C.casas.zones (or C.infill.zones) that faces a street and is under
// C.casas.maxH tall. Drawn in TILE-metre tiles within C.casas.far of the camera; none of it in the fingerprint.
export function casas(api){
  const {THREE,C,scene,FOOTPRINTS,roadsNear,animHooks,camera}=api;const K=C.casas;if(!K||!FOOTPRINTS)return;
  // where: C.casas.zones ([lat, lon, radius], ...), or C.infill's, or one circle round the centre
  const ZONES=(K.zones||(C.infill&&C.infill.zones)||[K.centre||[14.5572,-90.7337,1500]]).map(([la,lo,r])=>{const [x,z]=api.P([la,lo]);return [x,z,r];}),MAXH=K.maxH||11,TILE=300;
  // two levels: what reads from down the street (the zócalo, the alero, the doors, the windows) out to C.casas.farOut,
  // and the small things (the bars, sills, hoods, rafters) only within C.casas.far. put() files a part in the level
  // `near` names at the time
  let near=false;const parts=new Map(),put=(x,y,z,sx,sy,sz,ry,c)=>{const k=(near?'n':'f')+Math.floor(x/TILE)+','+Math.floor(z/TILE);if(!parts.has(k))parts.set(k,{near,list:[],cx:(Math.floor(x/TILE)+0.5)*TILE,cz:(Math.floor(z/TILE)+0.5)*TILE});parts.get(k).list.push([x,y,z,sx,sy,sz,ry,c]);};
  const ZOC=K.zocalo||['#7a2a22','#5a3a2a','#3a3a3e','#8a5a2a','#4a5a3a','#6a6258','#2a3a5a'],WOOD=['#4a2e1a','#5a3a20','#3a2414','#6a4426'],IRON='#1e1c1a',FRAME=['#efe8d8','#d8ccb0','#c8b89a'];
  const TILEC=(C.roofColours||['#a8583a']),RAFTER='#4a3020',GLASS='#1a1e22';
  const hsh=(x,z,s)=>{const k=Math.sin(x*12.9898+z*78.233+s*37.719)*43758.5453;return k-Math.floor(k);};
  let walls=0,doors=0,windows=0;
  // the mapped houses and the infill's (src/antigua/infill.js)
  for(const f of FOOTPRINTS.concat(api.INFILL||[])){const r=f.ring;if(!r||r.length<3)continue;const H=f.h-f.g;if(H>MAXH||H<2.5)continue;
    let cx=0,cz=0;for(const [x,z] of r){cx+=x;cz+=z;}cx/=r.length;cz/=r.length;if(!ZONES.some(([zx,zz,r])=>(cx-zx)**2+(cz-zz)**2<r*r))continue;
    // the footprint's winding, so the outward normal of each edge is known
    let ar=0;for(let i=0;i<r.length;i++){const a=r[i],b=r[(i+1)%r.length];ar+=a[0]*b[1]-b[0]*a[1];}const sgn=ar>0?1:-1;
    const zoc=ZOC[Math.floor(hsh(cx,cz,1)*ZOC.length)],wood=WOOD[Math.floor(hsh(cx,cz,2)*WOOD.length)],frame=FRAME[Math.floor(hsh(cx,cz,3)*FRAME.length)],tile=TILEC[Math.floor(hsh(cx,cz,4)*TILEC.length)];
    for(let i=0;i<r.length;i++){const a=r[i],b=r[(i+1)%r.length],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<4)continue;
      const ux=(b[0]-a[0])/L,uz=(b[1]-a[1])/L,nx=uz*sgn,nz=-ux*sgn,mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2;
      // a street just outside this wall, and running along it
      const st=roadsNear(mx+nx*6,mz+nz*6,4,q=>q.c!=='trail'&&q.c!=='footway');
      if(!st.length)continue;const sr=st[0].road,[p0,p1]=[sr.pts[st[0].k],sr.pts[st[0].k+1]],sl=Math.hypot(p1[0]-p0[0],p1[1]-p0[1])||1;
      if(Math.abs(((p1[0]-p0[0])*ux+(p1[1]-p0[1])*uz)/sl)<0.7)continue;
      const ry=-Math.atan2(uz,ux),g=f.g,o=0.1,at=(s,d)=>[a[0]+ux*s+nx*d,a[1]+uz*s+nz*d];walls++;
      {const [x,z]=at(L/2,o);put(x,g+0.5,z,L,1.0,0.12,ry,zoc);}                                         // the zócalo
      const garden=f.kind==='tapia';   // a garden's wall: its coping is the infill's, and it has a door and no windows
      if(!garden){const [x,z]=at(L/2,0.5);put(x,f.h-0.05,z,L+0.6,0.14,1.1,ry,tile);                     // the alero: tiles over the street
        near=true;for(let s=0.75;s<L;s+=1.5){const [rx,rz]=at(s,0.45);put(rx,f.h-0.22,rz,0.14,0.16,0.9,ry,RAFTER);}near=false;}
      // the zaguán, once to a wall, and windows either side of it every 3.4 m
      const ds=L<9?L/2:L*(0.3+hsh(a[0],a[1],5)*0.4),dw=Math.min(2.4,L*0.35),dh=Math.min(3.4,H-1);
      {const [x,z]=at(ds,o+0.02);put(x,g+dh/2+0.15,z,dw+0.8,dh+0.6,0.16,ry,frame);const [x2,z2]=at(ds,o+0.08);put(x2,g+dh/2,z2,dw,dh,0.14,ry,wood);
        near=true;const [x3,z3]=at(ds,o+0.14);put(x3,g+dh/2,z3,0.06,dh,0.06,ry,'#2a1a10');near=false;doors++;}
      const wh=Math.min(2.1,H-2.4);if(wh<0.9||garden)continue;
      for(let s=1.6;s<L-1.2;s+=3.4){if(Math.abs(s-ds)<dw/2+1.2)continue;const wy=g+1.0+wh/2;
        {const [x,z]=at(s,o+0.02);put(x,wy,z,1.5,wh+0.5,0.14,ry,frame);const [x2,z2]=at(s,o+0.06);put(x2,wy,z2,1.1,wh,0.12,ry,GLASS);}
        {near=true;const [x,z]=at(s,0.32);put(x,g+0.95,z,1.4,0.12,0.5,ry,frame);                      // the sill
          for(const b2 of [-0.5,-0.17,0.17,0.5]){const [bx,bz]=at(s+b2,0.5);put(bx,wy,bz,0.05,wh,0.05,ry,IRON);}   // the bars
          {const [bx,bz]=at(s,0.5);put(bx,wy,bz,1.1,0.05,0.05,ry,IRON);}
          const [hx,hz]=at(s,0.42);put(hx,wy+wh/2+0.3,hz,1.6,0.12,0.7,ry,tile);near=false;}windows++;}}}
  const BOX=new THREE.BoxGeometry(1,1,1),mat=new THREE.MeshLambertMaterial({color:0xffffff}),M4=new THREE.Matrix4(),Qt=new THREE.Quaternion(),E=new THREE.Euler(),V=new THREE.Vector3(),S=new THREE.Vector3(),col=new THREE.Color();
  // each tile's mesh carries a bounding sphere round the whole tile (the instances are placed in world space, and the
  // unit box's own sphere at the origin would cull them all, or none), so the tiles off screen are skipped
  const tileGeo=(cx,cz,y)=>{const g=BOX.clone();g.boundingSphere=new THREE.Sphere(new THREE.Vector3(cx,y,cz),TILE*0.75+20);return g;};
  const tiles=[];for(const t of parts.values()){const im=new THREE.InstancedMesh(tileGeo(t.cx,t.cz,t.list[0][1]),mat,t.list.length);
    t.list.forEach(([x,y,z,sx,sy,sz,ry,c],i)=>{M4.compose(V.set(x,y,z),Qt.setFromEuler(E.set(0,ry,0)),S.set(sx,sy,sz));im.setMatrixAt(i,M4);im.setColorAt(i,col.set(c));});
    im.receiveShadow=true;im.userData.noFingerprint=true;im.userData.noWire=true;im.visible=false;scene.add(im);tiles.push([im,t.cx,t.cz,t.near]);}
  const FAR=K.far||250,OUT=K.farOut||700;let last=0;animHooks.push(now=>{if(now-last<400)return;last=now;const p=camera.position,hy=p.y-api.groundH(p.x,p.z);
    for(const [im,x,z,nr] of tiles){const F=nr?FAR:OUT;im.visible=hy<F&&(x-p.x)**2+(z-p.z)**2<(F+TILE*0.7)**2;}});
  api.ctx.details=Object.assign(api.ctx.details||{},{casaWalls:walls,zaguanes:doors,rejas:windows});
}
