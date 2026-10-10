// ---------- the dress of Edinburgh's tenements and terraces ----------
// Two things that make the city's roofline and its streets its own:
//   chimneys   every slate roof has its stacks on the gable ends, a row of clay pots on each, and the Old Town's
//              tenements more of them (C.oldtown.chimneys: {share, oldTown: [lat, lon, radius]}); the roofs are the
//              engine's (C.pitchAll), and a footprint the engine roofed is marked gable
//   painted    the walls facing a street that is painted - Victoria Street's bow, every shopfront a colour - have their
//              lower two storeys coloured, a shop window and a fascia board in each (C.oldtown.painted: [{line, reach}])
export function oldtown(api){
  const {THREE,C,scene,FOOTPRINTS}=api;const K=C.oldtown;if(!K||!FOOTPRINTS)return;
  const ROOF=api.ROOF||{rise:4.2,pitch:0.42},parts=new Map(),M4=new THREE.Matrix4(),Qt=new THREE.Quaternion(),E=new THREE.Euler(),V=new THREE.Vector3(),S=new THREE.Vector3();
  const BOX=new THREE.BoxGeometry(1,1,1),CYL=BOX;
  const TILE=500,put=(geo,col,x,y,z,sx,sy,sz,ry)=>{const k=Math.floor(x/TILE)+','+Math.floor(z/TILE);if(!parts.has(k))parts.set(k,{geo,list:[],cx:(Math.floor(x/TILE)+0.5)*TILE,cz:(Math.floor(z/TILE)+0.5)*TILE});parts.get(k).list.push([x,y,z,sx,sy,sz,ry,col]);};
  // ---- chimneys ----
  const CH=K.chimneys||{},[ola,olo,orad]=CH.oldTown||[55.9495,-3.1900,700],[ox,oz]=api.P([ola,olo]);
  const STONE=['#6e665a','#5a544a','#7c7262','#4e4a44'],POT='#a8543a';let n=0;
  for(const f of FOOTPRINTS){if(!f.gable)continue;const r=f.ring;let cx=0,cz=0;for(const [x,z] of r){cx+=x;cz+=z;}cx/=r.length;cz/=r.length;
    const d2=(cx-ox)**2+(cz-oz)**2;if(d2>(CH.reach||1600)**2)continue;const old=d2<orad*orad,share=old?(CH.oldShare??0.95):(CH.share??0.7);if(((f.hsh*313)%1)>share)continue;
    // the roof's oriented box, as the engine's gableRoof finds it: the ridge along the long side
    let sxx=0,szz=0,sxz=0;for(const [x,z] of r){sxx+=(x-cx)**2;szz+=(z-cz)**2;sxz+=(x-cx)*(z-cz);}
    // the engine's axis when it turned the ridge to the street (f.roofAxis), else the footprint's own
    const ax0=f.roofAxis;let a=ax0!==undefined?ax0:0.5*Math.atan2(2*sxz,sxx-szz),ux=Math.cos(a),uz=Math.sin(a),u0=1e9,u1=-1e9,v0=1e9,v1=-1e9;
    for(const [x,z] of r){const u=(x-cx)*ux+(z-cz)*uz,v=-(x-cx)*uz+(z-cz)*ux;u0=Math.min(u0,u);u1=Math.max(u1,u);v0=Math.min(v0,v);v1=Math.max(v1,v);}
    if(ax0===undefined&&v1-v0>u1-u0){[ux,uz]=[-uz,ux];[u0,u1,v0,v1]=[v0,v1,-u1,-u0];}
    const rh=Math.min(ROOF.rise,(v1-v0)*ROOF.pitch),vm=(v0+v1)/2,depth=Math.min(v1-v0,14),ry=-Math.atan2(uz,ux),stone=STONE[Math.floor(f.hsh*977)%STONE.length];
    const ends=u1-u0>24?[u0+0.8,(u0+u1)/2,u1-0.8]:[u0+0.8,u1-0.8];
    for(const u of ends){const x=cx+u*ux-vm*uz,z=cz+u*uz+vm*ux,top=f.h+rh+1.4,w=Math.max(2.2,depth*0.45);
      put(BOX,stone,x,(f.h+top)/2,z,1.1,top-f.h,w,ry);put(BOX,'#3e3a36',x,top+0.1,z,1.25,0.2,w+0.15,ry);
      const pots=Math.min(4,Math.max(2,Math.round(w/0.8)));for(let p=0;p<pots;p++){const t=(p+0.5)/pots-0.5,px=x+t*w*uz,pz=z+t*w*ux;put(BOX,POT,px,top+0.55,pz,0.32,0.9,0.32,ry);}n++;}}
  // ---- the painted fronts ----
  const PAINT=['#9a2a2a','#2a4a8a','#d8b030','#2a6a4a','#c85a8a','#2a8a8a','#d8782a','#5a3a7a','#e8e2d0','#3a3a3e'];let fronts=0;
  for(const P0 of K.painted||[]){const L=P0.line.map(p=>api.P(p)),reach=P0.reach||14;
    const near=(x,z)=>{let best=1e9,dir=null;for(let i=0;i+1<L.length;i++){const [ax,az]=L[i],[bx,bz]=L[i+1],dx=bx-ax,dz=bz-az,l2=dx*dx+dz*dz||1,t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/l2)),px=ax+dx*t,pz=az+dz*t,d=Math.hypot(x-px,z-pz);if(d<best){best=d;dir=[px-x,pz-z];}}return [best,dir];};
    for(const f of FOOTPRINTS){const r=f.ring;let cx=0,cz=0;for(const [x,z] of r){cx+=x;cz+=z;}cx/=r.length;cz/=r.length;if(near(cx,cz)[0]>reach+25)continue;
      for(let i=0;i<r.length;i++){const a=r[i],b=r[(i+1)%r.length],L2=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L2<3)continue;const mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2,[d,dir]=near(mx,mz);if(d>reach)continue;
        let nx=(b[1]-a[1])/L2,nz=-(b[0]-a[0])/L2;if(nx*dir[0]+nz*dir[1]<0){nx=-nx;nz=-nz;}if(Math.abs(nx*dir[0]+nz*dir[1])<0.5*d)continue;   // facing the street
        const ry=-Math.atan2(b[1]-a[1],b[0]-a[0]),g=f.g,H=Math.min(7,f.h-g-0.5);
        for(let s=1.6;s<L2-1.6;s+=5.6){const t=s/L2,px=a[0]+(b[0]-a[0])*t+nx*0.12,pz=a[1]+(b[1]-a[1])*t+nz*0.12,c=PAINT[(fronts++*7)%PAINT.length],w=Math.min(5.2,L2-0.6);
          put(BOX,c,px,g+H/2,pz,w,H,0.2,ry);put(BOX,'#1e2228',px+nx*0.08,g+1.6,pz+nz*0.08,w*0.62,2.4,0.1,ry);put(BOX,'#e8dcb0',px+nx*0.1,g+3.3,pz+nz*0.1,w*0.8,0.5,0.1,ry);
          for(const wx of [-1,1])put(BOX,'#1e2228',px+nx*0.08+(b[0]-a[0])/L2*wx*w*0.25,g+5.3,pz+nz*0.08+(b[1]-a[1])/L2*wx*w*0.25,1,1.5,0.1,ry);}}}}
  // ---- one instanced mesh for each shape, coloured per instance ----
  const mat=new THREE.MeshLambertMaterial({color:0xffffff}),col=new THREE.Color();
  const tiles=[];for(const t of parts.values()){const im=new THREE.InstancedMesh(BOX,mat,t.list.length);
    t.list.forEach(([x,y,z,sx,sy,sz,ry,c],i)=>{M4.compose(V.set(x,y,z),Qt.setFromEuler(E.set(0,ry,0)),S.set(sx,sy,sz));im.setMatrixAt(i,M4);im.setColorAt(i,col.set(c));});
    im.castShadow=true;im.receiveShadow=true;im.frustumCulled=false;scene.add(im);tiles.push([im,t.cx,t.cz]);}
  // a tile is drawn only within K.far of the camera: the stacks are small, and there are thousands of them
  const FAR=K.far||900;let last=0;api.animHooks.push(now=>{if(now-last<400)return;last=now;const cx=api.camera.position.x,cz=api.camera.position.z;
    for(const [im,x,z] of tiles)im.visible=(x-cx)**2+(z-cz)**2<(FAR+360)**2;});
  api.ctx.details=Object.assign(api.ctx.details||{},{chimneys:n,paintedFronts:fronts});
}
