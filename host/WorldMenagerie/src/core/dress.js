// ---------- the dress of a city's buildings ----------
// What an extruded footprint lacks, put back from the footprint itself (api.FOOTPRINTS: ring, height, ground, wall
// colour, type, a hash; gable and roofAxis where the engine pitched its roof). Each part is optional, set per city in
// C.dress, and each takes a share (how many of the buildings that qualify get it) and the heights it applies between:
//
//   cornice       a projecting band of stone along the top of every wall of a flat-roofed building, a lighter shade of
//                 the wall; {depth, height} (a Roman palazzo's is a metre deep, a Chicago walk-up's half that)
//   string        a string course over the ground floor, at {at} metres, on the same buildings
//   waterTowers   New York's: a wooden barrel on steel legs with a conical cap, on a flat roof of six to twenty floors
//   fireEscapes   the iron zigzag on the street face of a walk-up: a landing at each floor, the stairs between, a rail
//   dormers       little gabled windows on the slopes of a pitched roof, one every few metres along the ridge
//   bays          a bay window two storeys high on the street face of a house or a terrace
//   porches       a craftsman front porch on the street face: the deck on its piers, tapered columns on brick pedestals,
//                 a low rail, the steps down to the walk, and a roof (a shed, or a gable facing the street: {gable})
//   awnings       a canvas awning over the shopfront on the street face, in {colours}, and a signboard over it
//   vaults        a barrel vault along a flat roof's length, in {colours} (Water 7's red roofs)
//   belltowers    a campanile up out of the roof: the shaft, the belfry's dark openings, a cornice, a pyramid roof
//   laundry       a washing line from the street face across to the building opposite, hung with clothes
//
// Any part may take `where`: lat/lon boxes, [[s, w, n, e], ...], to keep it to a neighbourhood.
//
// Built as instanced boxes, cylinders and cones per 500 m tile, drawn within C.dress.far of the camera.
export function dress(api){
  const {THREE,C,scene,FOOTPRINTS,roadsNear,animHooks,camera,P,buildingsAt}=api;const K=C.dress;if(!K||!FOOTPRINTS)return;
  const TILE=500,FAR=K.far||900,tiles=new Map();
  const SHAPES={box:new THREE.BoxGeometry(1,1,1),cyl:new THREE.CylinderGeometry(0.5,0.5,1,12),cone:new THREE.ConeGeometry(0.5,1,12),halfcyl:new THREE.CylinderGeometry(0.5,0.5,1,14,1,false,0,Math.PI).rotateZ(Math.PI/2),pyr:new THREE.ConeGeometry(Math.SQRT1_2,1,4).rotateY(Math.PI/4),prism:(()=>{const s=new THREE.Shape();s.moveTo(-0.5,0);s.lineTo(0.5,0);s.lineTo(0,1);s.closePath();return new THREE.ExtrudeGeometry(s,{depth:1,bevelEnabled:false}).translate(0,-0.5,-0.5);})()};
  const col=new THREE.Color();
  const put=(shape,c,x,y,z,sx,sy,sz,ry=0,rz=0)=>{const k=Math.floor(x/TILE)+','+Math.floor(z/TILE);if(!tiles.has(k))tiles.set(k,{cx:(Math.floor(x/TILE)+0.5)*TILE,cz:(Math.floor(z/TILE)+0.5)*TILE,parts:{}});
    const t=tiles.get(k);(t.parts[shape]||(t.parts[shape]=[])).push([x,y,z,sx,sy,sz,ry,rz,c]);};
    // a part's `where`, its boxes once in metres
  const zone=o=>o.where&&(o._z||(o._z=o.where.map(([s,w,n,e])=>{const [x0,z1]=P([s,w]),[x1,z0]=P([n,e]);return [x0,z0,x1,z1];})));
  const inZone=(f,o)=>{const Z=zone(o);if(!Z)return true;const [x,z]=f.ring[0];return Z.some(([x0,z0,x1,z1])=>x>=x0&&x<=x1&&z>=z0&&z<=z1);};
  const share=(f,o,salt)=>o&&((f.hsh*salt)%1)<(o.share??1)&&(f.h-f.g)>=(o.minH??0)&&(f.h-f.g)<=(o.maxH??1e9)&&(!o.types||o.types.includes(f.t||'yes'))&&inZone(f,o);
  const hex=v=>'#'+v.getHexString();
  const inRing=(x,z,r)=>{let c=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const [xi,zi]=r[i],[xj,zj]=r[j];if((zi>z)!==(zj>z)&&x<(xj-xi)*(z-zi)/(zj-zi)+xi)c=!c;}return c;};
  let n={cornice:0,string:0,waterTowers:0,fireEscapes:0,dormers:0,bays:0,porches:0,awnings:0,vaults:0,belltowers:0,laundry:0};
  // the walls of a ring with their outward normals (a ring may wind either way)
  const walls=r=>{let a=0;for(let i=0;i<r.length;i++){const p=r[i],q=r[(i+1)%r.length];a+=p[0]*q[1]-q[0]*p[1];}const sg=a>0?1:-1,out=[];
    for(let i=0;i<r.length;i++){const p=r[i],q=r[(i+1)%r.length],L=Math.hypot(q[0]-p[0],q[1]-p[1]);if(L<1)continue;out.push({p,q,L,nx:(q[1]-p[1])/L*sg,nz:-(q[0]-p[0])/L*sg,ry:-Math.atan2(q[1]-p[1],q[0]-p[0]),mx:(p[0]+q[0])/2,mz:(p[1]+q[1])/2});}return out;};
  // the wall that faces a street: the longest within a few metres of one
  const streetWall=(ws)=>{let best=null;for(const w of ws){if(w.L<4)continue;if(!roadsNear(w.mx+w.nx*6,w.mz+w.nz*6,5).length)continue;if(!best||w.L>best.L)best=w;}return best;};
  for(const f of FOOTPRINTS){if(f.holes&&f.holes.length)continue;const H=f.h-f.g;if(H<3)continue;const ws=walls(f.ring);if(!ws.length)continue;
    const wall=f.c&&f.c.isColor?f.c:col.set('#a89c88'),light=hex(wall.clone().lerp(new THREE.Color('#f4efe4'),0.45)),dark=hex(wall.clone().multiplyScalar(0.7));
    // cornice and string course: flat roofs (and a city that wants them on its pitched roofs too: cornice.pitched)
    if(K.cornice&&(!f.gable||K.cornice.pitched)&&share(f,K.cornice,0.773)){const D=K.cornice.depth||0.6,Hc=K.cornice.height||0.9,cc=K.cornice.colour||light;
      for(const w of ws){if(w.L<3)continue;put('box',cc,w.mx+w.nx*D/2,f.h-Hc/2,w.mz+w.nz*D/2,w.L+D,Hc,D,w.ry);}n.cornice++;
      if(K.string&&H>=8&&H<35){const at=f.g+(K.string.at||4.2);for(const w of ws)if(w.L>=3)put('box',cc,w.mx+w.nx*0.12,at,w.mz+w.nz*0.12,w.L+0.24,0.35,0.24,w.ry);n.string++;}}
    // water towers on the flat roofs
    if(K.waterTowers&&!f.gable&&share(f,K.waterTowers,0.391)){let cx=0,cz=0;for(const [x,z] of f.ring){cx+=x;cz+=z;}cx/=f.ring.length;cz/=f.ring.length;const ox=((f.hsh*97)%1-0.5)*4,oz=((f.hsh*53)%1-0.5)*4,x=cx+ox,z=cz+oz,y=f.h;
      for(const [lx,lz] of [[-1.6,-1.6],[1.6,-1.6],[-1.6,1.6],[1.6,1.6]])put('box','#3a3a3c',x+lx,y+2,z+lz,0.25,4,0.25);put('box','#3a3a3c',x,y+4,z,4,0.3,4);
      put('cyl','#7a5a3e',x,y+6.3,z,6,4.6,6);for(const hy of [5,6.3,7.6])put('cyl','#3a3a3c',x,y+hy,z,6.08,0.12,6.08);put('cone','#5a4a3a',x,y+9.6,z,6.6,2,6.6);n.waterTowers++;}
    // fire escapes on the street face
    if(K.fireEscapes&&share(f,K.fireEscapes,0.613)){const w=streetWall(ws);if(w){const FL=K.fireEscapes.floor||3.1,W=Math.min(w.L*0.4,6),iron='#2e2e30';
      for(let y=f.g+FL+0.9,k=0;y<f.h-1;y+=FL,k++){const bx=w.mx+w.nx*0.75,bz=w.mz+w.nz*0.75;put('box',iron,bx,y,bz,W,0.12,1.4,w.ry);put('box',iron,w.mx+w.nx*1.42,y+0.5,w.mz+w.nz*1.42,W,1.0,0.06,w.ry);
        const dir=k%2?1:-1;put('box',iron,bx,y-FL/2,bz,Math.hypot(W*0.7,FL),0.12,0.7,w.ry,dir*Math.atan2(FL,W*0.7));}n.fireEscapes++;}}
    // dormers on a pitched roof, along the ridge either side
    if(K.dormers&&f.gable&&share(f,K.dormers,0.457)){const r=f.ring;let cx=0,cz=0;for(const [x,z] of r){cx+=x;cz+=z;}cx/=r.length;cz/=r.length;
      let a=f.roofAxis;if(a===undefined){let sxx=0,szz=0,sxz=0;for(const [x,z] of r){sxx+=(x-cx)**2;szz+=(z-cz)**2;sxz+=(x-cx)*(z-cz);}a=0.5*Math.atan2(2*sxz,sxx-szz);}
      let ux=Math.cos(a),uz=Math.sin(a),u0=1e9,u1=-1e9,v0=1e9,v1=-1e9;for(const [x,z] of r){const u=(x-cx)*ux+(z-cz)*uz,v=-(x-cx)*uz+(z-cz)*ux;u0=Math.min(u0,u);u1=Math.max(u1,u);v0=Math.min(v0,v);v1=Math.max(v1,v);}
      if(f.roofAxis===undefined&&v1-v0>u1-u0){[ux,uz]=[-uz,ux];[u0,u1,v0,v1]=[v0,v1,-u1,-u0];}
      const rise=Math.min((api.ROOF||{}).rise||4.2,(v1-v0)*((api.ROOF||{}).pitch||0.42)),step=K.dormers.every||5,ry=-Math.atan2(uz,ux),rc=K.dormers.roof||'#4a4e54';
      for(const side of [-1,1]){const v=side*(v1-v0)*0.22+(v0+v1)/2;for(let u=u0+step*0.8;u<u1-step*0.6;u+=step){const x=cx+u*ux-v*uz,z=cz+u*uz+v*ux,y=f.h+rise*0.32;
        put('box',light,x,y+0.7,z,1.6,1.6,1.4,ry);put('box','#2a3440',x-uz*0*side,y+0.7,z,1.0,1.0,1.42,ry);put('prism',rc,x,y+1.7,z,1.9,0.9,1.6,ry+Math.PI/2);}}n.dormers++;}
    // bay windows on the street face
    if(K.bays&&share(f,K.bays,0.271)){const w=streetWall(ws);if(w&&w.L>6){const BW=K.bays.width||3,BH=Math.min(H-1,K.bays.height||6.2),D=0.9,c=hex(wall);
      for(const t of w.L>14?[0.3,0.7]:[0.5]){const x=w.p[0]+(w.q[0]-w.p[0])*t+w.nx*D/2,z=w.p[1]+(w.q[1]-w.p[1])*t+w.nz*D/2,y=f.g+(K.bays.from||1)+BH/2;
        put('box',c,x,y,z,BW,BH,D,w.ry);for(const fy of [0.25,0.72])put('box','#22303a',x+w.nx*D*0.52,f.g+(K.bays.from||1)+BH*fy,z+w.nz*D*0.52,BW*0.7,BH*0.28,0.06,w.ry);put('box',light,x,f.g+(K.bays.from||1)+BH+0.15,z,BW+0.3,0.3,D+0.3,w.ry);}n.bays++;}}}
  // ---- porches and awnings: on the street face, along it (u) and out from it (v) ----
  const along=(w,t,v)=>[w.p[0]+(w.q[0]-w.p[0])*t+w.nx*v,w.p[1]+(w.q[1]-w.p[1])*t+w.nz*v];
  for(const f of FOOTPRINTS){if(f.holes&&f.holes.length)continue;const H=f.h-f.g;if(H<2.5)continue;
    const K1=K.porches,K2=K.awnings;const wantP=K1&&share(f,K1,0.517),wantA=K2&&share(f,K2,0.839);if(!wantP&&!wantA)continue;
    const ws=walls(f.ring),w=streetWall(ws);if(!w||w.L<5)continue;
    if(wantP){const PW=Math.min(w.L*(K1.width||0.7),8.5),D=K1.depth||2.4,DH=K1.deck||0.8,PH=DH+2.5,t0=0.5+(((f.hsh*31)%1)-0.5)*Math.max(0,1-PW/w.L)*0.8;
      const trim=K1.trim||'#f4f2ea',post=K1.post||'#f4f2ea',brick=K1.pedestal||'#8a4a3a',rf=K1.roof||'#4a4e54',deck=K1.deckColour||'#7a6a5a';
      const [cx,cz]=along(w,t0,D/2);put('box',deck,cx,f.g+DH/2,cz,PW,DH,D,w.ry);                                         // the deck on its skirting
      const cols=PW>6?3:2;for(let k=0;k<cols;k++){const u=-PW/2+0.3+k*(PW-0.6)/(cols-1),[px,pz]=along(w,t0+u/w.L,D-0.3);
        put('box',brick,px,f.g+DH+0.5,pz,0.55,1.0,0.55,w.ry);put('box',post,px,f.g+DH+1.0+(PH-DH-1.0)/2,pz,0.3,PH-DH-1.0,0.3,w.ry);}   // pedestal and column
      {const [rx,rz]=along(w,t0,D-0.3);put('box',trim,rx,f.g+DH+0.85,rz,PW-0.6,0.1,0.08,w.ry);put('box',trim,rx,f.g+DH+0.05,rz,PW-0.6,0.08,0.08,w.ry);}  // the rail
      for(let k=0;k<3;k++){const [kx,kz]=along(w,t0,D+0.18+k*0.35);put('box','#9a948a',kx,f.g+DH*(2-k)/3+DH/6,kz,1.6,DH/3,0.35,w.ry);}   // the steps
      const [ox,oz]=along(w,t0,D/2);
      if(K1.gable&&((f.hsh*7)%1)<K1.gable){put('box',trim,ox,f.g+PH+0.15,oz,PW+0.4,0.3,D+0.4,w.ry);put('prism',rf,ox,f.g+PH+0.3,oz,PW+0.6,1.6,D+0.6,w.ry);}   // a gable over the porch
      else put('box',rf,ox,f.g+PH+0.2,oz,PW+0.5,0.2,D+0.5,w.ry,0);
      n.porches++;}
    if(wantA){const AW=Math.min(w.L-1,K2.width||w.L*0.8),AC=K2.colours||['#2a4a3a','#7a2a2a','#2a3a5a','#5a4a2a'],c=AC[Math.floor(f.hsh*AC.length*13)%AC.length],y=f.g+(K2.at||3.2),[ax,az]=along(w,0.5,0.8);
      put('box',c,ax,y,az,AW,0.12,1.7,w.ry,0);put('box',c,ax+w.nx*0.8,y-0.35,az+w.nz*0.8,AW,0.6,0.06,w.ry);                     // the canvas and its valance
      if(H>5){const [bx,bz]=along(w,0.5,0.08);put('box',K2.sign||'#e8e0cc',bx,y+0.9,bz,Math.min(AW*0.7,7),0.9,0.12,w.ry);}       // the signboard
      n.awnings++;}}
  // ---- vaults, bell towers and washing lines ----
  const axisOf=f=>{const r=f.ring;let cx=0,cz=0;for(const [x,z] of r){cx+=x;cz+=z;}cx/=r.length;cz/=r.length;let sxx=0,szz=0,sxz=0;for(const [x,z] of r){sxx+=(x-cx)**2;szz+=(z-cz)**2;sxz+=(x-cx)*(z-cz);}
    const a=0.5*Math.atan2(2*sxz,sxx-szz),ux=Math.cos(a),uz=Math.sin(a);let u0=1e9,u1=-1e9,v0=1e9,v1=-1e9;for(const [x,z] of r){const u=(x-cx)*ux+(z-cz)*uz,v=-(x-cx)*uz+(z-cz)*ux;u0=Math.min(u0,u);u1=Math.max(u1,u);v0=Math.min(v0,v);v1=Math.max(v1,v);}
    return {cx:cx+ux*(u0+u1)/2-uz*(v0+v1)/2,cz:cz+uz*(u0+u1)/2+ux*(v0+v1)/2,L:u1-u0,Wd:v1-v0,ry:-a};};
  const CLOTH=['#f4f2ec','#c8302a','#3a6aa8','#e8c040','#f0a0b0','#5a9a5a','#e8e0d0','#2a2a30'];
  for(const f of FOOTPRINTS){if(f.holes&&f.holes.length)continue;const H=f.h-f.g;if(H<3)continue;
    if(K.vaults&&!f.gable&&share(f,K.vaults,0.611)){const A=axisOf(f);if(A.L>3&&A.Wd>3){const VC=K.vaults.colours||['#c8503a'],c=VC[Math.floor(f.hsh*VC.length*7)%VC.length],rise=Math.min(A.Wd*0.42,K.vaults.rise||4);
      put('halfcyl',c,A.cx,f.h,A.cz,A.L+0.4,rise*2,A.Wd+0.3,A.ry);put('box',K.vaults.trim||'#e8dcc4',A.cx,f.h+0.15,A.cz,A.L+0.6,0.3,A.Wd+0.5,A.ry);n.vaults++;}}
    if(K.belltowers&&share(f,K.belltowers,0.917)){const A=axisOf(f),s2=Math.min(A.Wd,A.L)*0.45,TH=K.belltowers.height||(8+((f.hsh*13)%1)*8),wall=hex(f.c&&f.c.isColor?f.c:col.set('#e8dcc4'));
      if(s2>2.4){const x=A.cx,z=A.cz,y=f.h;put('box',wall,x,y+TH/2,z,s2,TH,s2,A.ry);put('box','#2a2a2e',x,y+TH-2.2,z,s2+0.04,1.8,s2*0.4,A.ry);put('box','#2a2a2e',x,y+TH-2.2,z,s2*0.4,1.8,s2+0.04,A.ry);
        put('box','#e8dcc4',x,y+TH+0.2,z,s2+0.6,0.4,s2+0.6,A.ry);put('pyr',K.belltowers.roof||'#3a6aa8',x,y+TH+0.4+s2*0.6,z,s2*0.75,s2*1.2,s2*0.75,A.ry);n.belltowers++;}}
    if(K.laundry&&share(f,K.laundry,0.373)){const ws=walls(f.ring);for(const w of ws){if(w.L<4)continue;let hit=0;
      for(let d=3;d<=12;d+=1.5){const px=w.mx+w.nx*d,pz=w.mz+w.nz*d;if(buildingsAt&&buildingsAt(px,pz,0.5).some(b=>b!==f&&b.ring&&inRing(px,pz,b.ring))){hit=d;break;}}
      if(!hit)continue;const y=f.g+Math.min(H-1.5,3.4+((f.hsh*29)%1)*Math.max(0,H-5)),mx=w.mx+w.nx*hit/2,mz=w.mz+w.nz*hit/2,ry=Math.atan2(-w.nz,w.nx);
      put('box','#5a5a5a',mx,y,mz,hit,0.03,0.03,ry);const nC=Math.max(2,Math.floor(hit/1.1));
      for(let k=0;k<nC;k++){const t=(k+0.5)/nC,cxp=w.mx+w.nx*hit*t,czp=w.mz+w.nz*hit*t,hh=0.5+((k*7+f.hsh*11)%1)*0.5;put('box',CLOTH[(k*3+Math.floor(f.hsh*50))%CLOTH.length],cxp,y-hh/2-0.05,czp,0.6,hh,0.04,ry+Math.PI/2);}
      n.laundry++;break;}}}
  // ---- one instanced mesh per shape per tile ----
  const mat=new THREE.MeshLambertMaterial({color:0xffffff}),M4=new THREE.Matrix4(),Q=new THREE.Quaternion(),E=new THREE.Euler(),V=new THREE.Vector3(),S=new THREE.Vector3(),meshes=[];
  for(const t of tiles.values())for(const [shape,list] of Object.entries(t.parts)){const im=new THREE.InstancedMesh(SHAPES[shape],mat,list.length);
    list.forEach(([x,y,z,sx,sy,sz,ry,rz,c],i)=>{M4.compose(V.set(x,y,z),Q.setFromEuler(E.set(0,ry,rz,'YXZ')),S.set(sx,sy,sz));im.setMatrixAt(i,M4);im.setColorAt(i,col.set(c));});
    im.castShadow=!!K.shadows;im.receiveShadow=true;im.frustumCulled=false;   // trim this small casts no shadow worth its second draw
   im.userData.noFingerprint=true;scene.add(im);meshes.push([im,t.cx,t.cz]);}
  let last=0;animHooks.push(now=>{if(now-last<400)return;last=now;const cx=camera.position.x,cz=camera.position.z;for(const [im,x,z] of meshes)im.visible=(x-cx)**2+(z-cz)**2<(FAR+360)**2;});
  api.ctx.details=Object.assign(api.ctx.details||{},{dress:n});
}
