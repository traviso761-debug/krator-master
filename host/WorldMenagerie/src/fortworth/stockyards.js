// ---------- the Stockyards: what Exchange Avenue looks like that a footprint does not say ----------
// The Fort Worth Stockyards are a National Historic District, kept as they were when this was the biggest livestock
// market in the South, and four things make the street what it is:
//   false fronts   every one- and two-storey storefront on C.stockyards.western streets has its parapet carried up
//                  above the roof, square or stepped or curved, so the street reads taller and grander than it is
//   boardwalks     a wooden awning out over the sidewalk on posts, the length of the front, a hitching rail at the
//                  kerb, a signboard on the parapet in the store's colours
//   brick          the streets named in C.stockyards.brick are paved in red brick, laid over the road
//   the pens       east of the Exchange, the wooden cattle pens in their grid (C.stockyards.pens: a polygon and a cell
//                  size), gates, water troughs, and the catwalk over them on its posts (C.stockyards.catwalk: a line)
// Instanced boxes in 400 m tiles, drawn within C.stockyards.far; none of it in the layout fingerprint.
export function stockyards(api){
  const {THREE,C,scene,FOOTPRINTS,ROADS,roadsNear,animHooks,camera,P,groundH,inPoly}=api;const K=C.stockyards;if(!K)return;
  const TILE=400,parts=new Map(),put=(x,y,z,sx,sy,sz,ry,c)=>{const k=Math.floor(x/TILE)+','+Math.floor(z/TILE);if(!parts.has(k))parts.set(k,{list:[],cx:(Math.floor(x/TILE)+0.5)*TILE,cz:(Math.floor(z/TILE)+0.5)*TILE,y});parts.get(k).list.push([x,y,z,sx,sy,sz,ry,c]);};
  const hsh=(x,z,s)=>{const k=Math.sin(x*12.9898+z*78.233+s*37.719)*43758.5453;return k-Math.floor(k);};
  const ZONE=K.zone?(()=>{const [s,w,n,e]=K.zone,[x0,z1]=P([s,w]),[x1,z0]=P([n,e]);return [x0,z0,x1,z1];})():null;
  const inZone=(x,z)=>!ZONE||(x>=ZONE[0]&&x<=ZONE[2]&&z>=ZONE[1]&&z<=ZONE[3]);
  const WEST=new RegExp(K.western||'^(East |West )?Exchange Avenue$|^North Main Street$','i');
  const WOOD=['#6a4a30','#5a3e28','#7a5838','#4e3622'],SIGN=['#8a2a22','#1e3a5a','#2a4a2a','#d8b040','#e8e0cc','#3a2a1e'],AWN='#5a4632';
  let fronts=0,posts=0,brick=0,fence=0;
  // ---- false fronts and boardwalks ----
  for(const f of FOOTPRINTS){const r=f.ring,H=f.h-f.g;if(!r||H>14||H<2.5)continue;let cx=0,cz=0;for(const [x,z] of r){cx+=x;cz+=z;}cx/=r.length;cz/=r.length;if(!inZone(cx,cz))continue;
    let ar=0;for(let i=0;i<r.length;i++){const a=r[i],b=r[(i+1)%r.length];ar+=a[0]*b[1]-b[0]*a[1];}const sgn=ar>0?1:-1;
    for(let i=0;i<r.length;i++){const a=r[i],b=r[(i+1)%r.length],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<4)continue;
      const ux=(b[0]-a[0])/L,uz=(b[1]-a[1])/L,nx=uz*sgn,nz=-ux*sgn,mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2;
      const st=roadsNear(mx+nx*7,mz+nz*7,5,q=>WEST.test(q.name||''));if(!st.length)continue;
      const ry=-Math.atan2(uz,ux),g=f.g,at=(s,d)=>[a[0]+ux*s+nx*d,a[1]+uz*s+nz*d],h=hsh(cx,cz,1),wood=WOOD[Math.floor(h*WOOD.length)];fronts++;
      // the parapet carried up over the roof: square, stepped, or with a curved crown
      const up=1.6+h*1.8,kind=Math.floor(hsh(cx,cz,2)*3);{const [x,z]=at(L/2,0.15);put(x,f.h+up/2,z,L,up,0.35,ry,f.c!==undefined?'#'+new THREE.Color(f.c).getHexString():'#a8583a');}
      if(kind===1){const [x,z]=at(L/2,0.15);put(x,f.h+up+0.4,z,L*0.5,0.8,0.35,ry,'#e8e0cc');}
      if(kind===2){for(let s=0;s<5;s++){const t=(s+0.5)/5,[x,z]=at(L*(0.3+0.4*t),0.15),hh=Math.sin(t*Math.PI)*1.2;put(x,f.h+up+hh/2,z,L*0.08+0.05,hh,0.35,ry,'#e8e0cc');}}
      {const [x,z]=at(L/2,0.3);put(x,f.h+up*0.45,z,L*0.7,up*0.55,0.08,ry,SIGN[Math.floor(hsh(cx,cz,3)*SIGN.length)]);}   // the signboard
      {const [x,z]=at(L/2,0.35);put(x,f.h-0.2,z,L+0.2,0.35,0.3,ry,'#e8e0cc');}                                            // the cornice under it
      // the boardwalk awning: a shed roof out over the sidewalk on posts, a fascia board along its edge
      const out=Math.min(3.4,(st[0].d||7)-st[0].road.w/2+2.8),yA=Math.min(f.h-0.6,g+3.6);
      {const [x,z]=at(L/2,out/2);put(x,yA,z,L,0.14,out+0.3,ry,AWN);const [fx,fz]=at(L/2,out+0.1);put(fx,yA-0.2,fz,L,0.4,0.08,ry,wood);}
      for(let s=0.4;s<=L-0.3;s+=Math.max(2.8,L/Math.ceil(L/3.4))){const [x,z]=at(s,out);put(x,g+yA/2-g/2,z,0.18,yA-g,0.18,ry,wood);posts++;}
      {const [x,z]=at(L/2,out+0.9);put(x,g+0.95,z,L*0.8,0.1,0.1,ry,'#4e3622');for(const e of [0.12,0.88]){const [px,pz]=at(L*e,out+0.9);put(px,g+0.5,pz,0.12,1.0,0.12,ry,'#4e3622');}}   // the hitching rail
      {const [x,z]=at(L/2,out/2);put(x,g+0.12,z,L,0.24,out,ry,'#7a6248');}}}                                                   // the boardwalk's planks
  // ---- the brick streets: a ribbon of red brick over each named one, the joints in the material ----
  const BRICK=new RegExp(K.brick||'^(East |West )?Exchange Avenue$','i'),bpos=[],bidx=[];let bn=0;
  for(const rd of ROADS){if(!BRICK.test(rd.name||''))continue;const pts=rd.pts,w=rd.w/2+0.3;
    for(let i=0;i+1<pts.length;i++){const [ax,az]=pts[i],[bx,bz]=pts[i+1],L=Math.hypot(bx-ax,bz-az),n=Math.max(1,Math.ceil(L/4));
      for(let k=0;k<=n;k++){const x=ax+(bx-ax)*k/n,z=az+(bz-az)*k/n,nx=-(bz-az)/L*w,nz=(bx-ax)/L*w;bpos.push(x+nx,groundH(x+nx,z+nz)+0.14,z+nz,x-nx,groundH(x-nx,z-nz)+0.14,z-nz);
        if(k)bidx.push(bn-2,bn,bn-1,bn-1,bn,bn+1);bn+=2;}bn+=0;brick++;}}
  if(bn){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');g.fillStyle='#8a3e2c';g.fillRect(0,0,128,128);
    for(let y=0;y<128;y+=8)for(let x=((y/8)%2)*8;x<128;x+=16){g.fillStyle=`hsl(${8+Math.random()*10},${45+Math.random()*15}%,${30+Math.random()*10}%)`;g.fillRect(x+1,y+1,14,6);}
    const tex=new THREE.CanvasTexture(c);tex.wrapS=tex.wrapT=THREE.RepeatWrapping;
    const uv=[];for(let i=0;i<bpos.length/3;i++)uv.push((i%2)*1.2,Math.floor(i/2)*0.6);
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(bpos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(bidx);geo.computeVertexNormals();
    const m=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({map:tex,polygonOffset:true,polygonOffsetFactor:-6,polygonOffsetUnits:-12}));m.receiveShadow=true;m.userData.noFingerprint=true;m.name='brick streets';scene.add(m);}
  // ---- the pens ----
  if(K.pens){const ring=K.pens.poly.map(p=>P(p)),[cw,cd]=K.pens.cell||[9,14],ang=(K.pens.turn||0)*Math.PI/180,ca=Math.cos(ang),sa=Math.sin(ang);
    let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const [x,z] of ring){const u=x*ca+z*sa,v=-x*sa+z*ca;x0=Math.min(x0,u);x1=Math.max(x1,u);z0=Math.min(z0,v);z1=Math.max(z1,v);}
    const W=(u,v)=>[u*ca-v*sa,u*sa+v*ca],FENCE='#7a6a52';
    // the fence lines along u every cd and along v every cw, kept to the polygon, two rails and a post every 2.4 m
    for(let v=z0;v<=z1;v+=cd)for(let u=x0;u<x1;u+=2.4){const [x,z]=W(u+1.2,v);if(!inPoly(x,z,ring))continue;const y=groundH(x,z),ry=-ang;put(x,y+0.75,z,2.4,0.12,0.1,ry,FENCE);put(x,y+1.35,z,2.4,0.12,0.1,ry,FENCE);
      const [px,pz]=W(u,v);put(px,y+0.8,pz,0.16,1.6,0.16,ry,'#5a4a36');fence++;}
    for(let u=x0;u<=x1;u+=cw)for(let v=z0;v<z1;v+=2.4){if(Math.floor((v-z0)/cd*3+u)%7===0)continue;   // a gate left open here and there
      const [x,z]=W(u,v+1.2);if(!inPoly(x,z,ring))continue;const y=groundH(x,z),ry=-ang+Math.PI/2;put(x,y+0.75,z,2.4,0.12,0.1,ry,FENCE);put(x,y+1.35,z,2.4,0.12,0.1,ry,FENCE);fence++;}
    for(let u=x0+cw/2;u<x1;u+=cw)for(let v=z0+cd/2;v<z1;v+=cd){const [x,z]=W(u,v);if(!inPoly(x,z,ring)||hsh(u,v,9)>0.35)continue;const y=groundH(x,z);put(x,y+0.35,z,2.2,0.7,0.8,-ang,'#8a8a86');}   // troughs
    if(K.catwalk){const L=K.catwalk.map(p=>P(p));for(let i=0;i+1<L.length;i++){const [ax,az]=L[i],[bx,bz]=L[i+1],len=Math.hypot(bx-ax,bz-az),ry=-Math.atan2(bz-az,bx-ax);
      for(let s=0;s<len;s+=3){const x=ax+(bx-ax)*s/len,z=az+(bz-az)*s/len,y=groundH(x,z);put(x,y+5,z,3.1,0.2,1.8,ry,'#6a5640');put(x,y+5.9,z+0,3.1,0.08,0.06,ry,'#4e3622');
        if(s%9<3)for(const sd of [-0.8,0.8])put(x-Math.sin(ry)*sd,y+2.5,z-Math.cos(ry)*sd,0.2,5,0.2,ry,'#5a4a36');}}}}
  const BOX=new THREE.BoxGeometry(1,1,1),mat=new THREE.MeshLambertMaterial({color:0xffffff}),M4=new THREE.Matrix4(),Qt=new THREE.Quaternion(),E=new THREE.Euler(),V=new THREE.Vector3(),S=new THREE.Vector3(),col=new THREE.Color();
  const tiles=[];for(const t of parts.values()){const g=BOX.clone();g.boundingSphere=new THREE.Sphere(new THREE.Vector3(t.cx,t.list[0][1],t.cz),TILE*0.75+30);
    const im=new THREE.InstancedMesh(g,mat,t.list.length);t.list.forEach(([x,y,z,sx,sy,sz,ry,c],i)=>{M4.compose(V.set(x,y,z),Qt.setFromEuler(E.set(0,ry,0)),S.set(sx,sy,sz));im.setMatrixAt(i,M4);im.setColorAt(i,col.set(c));});
    im.castShadow=im.receiveShadow=true;im.userData.noFingerprint=true;im.userData.noWire=true;scene.add(im);tiles.push([im,t.cx,t.cz]);}
  const FAR=K.far||900;let last=0;animHooks.push(now=>{if(now-last<400)return;last=now;const p=camera.position;for(const [im,x,z] of tiles)im.visible=(x-p.x)**2+(z-p.z)**2<(FAR+TILE)**2;});
  api.ctx.details=Object.assign(api.ctx.details||{},{falseFronts:fronts,boardwalkPosts:posts,brickSegments:brick,penFence:fence});
}
