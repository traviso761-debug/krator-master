// ---------- inside the blocks, and the small things in the open: courtyards, fountains, ruins ----------
// Courtyards: every courtyard the map draws (a building's inner ring, kept with "courtyards" in the city file) gets a
// floor - travertine flags, gravel, or a garden of box-edged beds - and, by its size, a wellhead, a fountain, a
// citrus tree or a palm in the middle, terracotta pots along its walls, and, in the bigger ones, a portico of columns
// along the longest side.
// Fountains: every fountain OpenStreetMap names in the city that is not a landmark model of its own gets a basin, a
// pedestal and a bowl, the water in it, round or oblong by its hash.
// Ruins: a footprint mapped as ruins has its wall tops broken - stones left standing at odd heights along the edges -
// and the open ground of the archaeological zones (C.ruinZones) is strewn with column stumps, fallen drums and
// cornice blocks.
//
// All of it is merged by tile and coloured by vertex; it is small, so a tile is drawn only within C.courts.far metres.
export function courts(api){
  const {THREE,C,scene,FOOTPRINTS,POIS,P,groundH,inWater,inPoly,buildingsAt,roadsNear,animHooks,camera}=api;const K=C.courts;if(!K)return;
  const FAR=K.far||900,TILE=300;
  let seed=K.seed||40;const R=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const tiles=new Map(),tileOf=(x,z)=>{const k=Math.floor(x/TILE)+','+Math.floor(z/TILE);let t=tiles.get(k);if(!t){t={p:[],n:[],c:[]};tiles.set(k,t);}return t;};
  const col=new THREE.Color(),m4=new THREE.Matrix4(),nm=new THREE.Matrix3(),v=new THREE.Vector3();
  // put a geometry (non-indexed copy) into the tile, moved by a matrix, in one colour
  function put(geo,colour,x,y,z,ry=0,sx=1,sy=1,sz=1,rx=0,rz=0){const g=geo.index?geo.toNonIndexed():geo,p=g.attributes.position,n=g.attributes.normal,t=tileOf(x,z);
    m4.compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx,ry,rz)),new THREE.Vector3(sx,sy,sz));nm.getNormalMatrix(m4);col.set(colour);
    for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(m4);t.p.push(v.x,v.y,v.z);v.fromBufferAttribute(n,i).applyMatrix3(nm).normalize();t.n.push(v.x,v.y,v.z);t.c.push(col.r,col.g,col.b);}}
  // a flat polygon (a courtyard floor, a bed) at height y
  function floor(ring,y,colour,holes=[]){const v2=r=>r.map(([x,z])=>new THREE.Vector2(x,z));let f;try{f=THREE.ShapeUtils.triangulateShape(v2(ring),holes.map(v2));}catch(e){return;}
    const pts=[ring,...holes].flat(),cx=ring.reduce((s,q)=>s+q[0],0)/ring.length,cz=ring.reduce((s,q)=>s+q[1],0)/ring.length,t=tileOf(cx,cz);col.set(colour);
    for(const tr of f){for(const k of [tr[0],tr[2],tr[1]]){t.p.push(pts[k][0],y,pts[k][1]);t.n.push(0,1,0);t.c.push(col.r,col.g,col.b);}}}
  const BOX=new THREE.BoxGeometry(1,1,1),CYL=new THREE.CylinderGeometry(0.5,0.5,1,12),CYL8=new THREE.CylinderGeometry(0.5,0.5,1,8),POT=new THREE.CylinderGeometry(0.5,0.36,1,8),
    SPH=new THREE.IcosahedronGeometry(0.5,1),SPH0=new THREE.IcosahedronGeometry(0.5,0),RING=new THREE.TorusGeometry(1,0.12,6,20).rotateX(Math.PI/2),BOWL=new THREE.CylinderGeometry(0.5,0.2,1,14),CONE=new THREE.ConeGeometry(0.5,1,8);
  const area=r=>{let a=0;for(let i=0;i<r.length;i++){const p=r[i],q=r[(i+1)%r.length];a+=p[0]*q[1]-q[0]*p[1];}return a/2;};
  const TRAV='#d9d0bd',TRAV2='#c9bfa8',WATER='#3d8794',TERRA='#b0583a',LEAF='#4f6e3a',LEAF2='#3e5a2e',BOXH='#3f5c32',GRAVEL='#cfc3a6',IRON='#2e2e30';
  // ---- the fountain: a basin (round or oblong), the water, a pedestal and a bowl (and a second, smaller, on big ones) ----
  function fountain(x,z,r,ry,h=0){const g=(h||groundH(x,z)),oblong=R()<0.35;
    if(oblong){const L=r*1.8,W=r*1.1;for(const s of [-1,1]){put(BOX,TRAV,x+Math.cos(ry)*s*L/2,g+0.35,z-Math.sin(ry)*s*L/2,ry,0.35,0.7,W);put(BOX,TRAV,x-Math.sin(ry)*s*W/2,g+0.35,z-Math.cos(ry)*s*W/2,ry,L,0.7,0.35);}
      put(BOX,WATER,x,g+0.5,z,ry,L-0.3,0.05,W-0.3);}
    else{put(CYL,TRAV,x,g+0.3,z,0,r*2,0.6,r*2);put(RING,TRAV2,x,g+0.62,z,0,r,1.4,r);put(CYL,WATER,x,g+0.62,z,0,r*2-0.4,0.04,r*2-0.4);}
    put(CYL8,TRAV2,x,g+1.1,z,0,0.5,1.0,0.5);put(BOWL,TRAV,x,g+1.75,z,0,r*0.9,0.35,r*0.9);put(CYL,WATER,x,g+1.93,z,0,r*0.8,0.03,r*0.8);
    if(r>2.2){put(CYL8,TRAV2,x,g+2.3,z,0,0.3,0.8,0.3);put(BOWL,TRAV,x,g+2.8,z,0,r*0.45,0.25,r*0.45);}
    put(CONE,'#cfe6ee',x,g+(r>2.2?3.2:2.3),z,0,0.25,0.7,0.25);}
  const tree=(x,z,g,palm)=>{if(palm){put(CYL8,'#7a6650',x,g+3,z,0,0.35,6,0.35);for(let k=0;k<7;k++){const a=k/7*Math.PI*2;put(BOX,LEAF,x+Math.cos(a)*1.3,g+6,z+Math.sin(a)*1.3,-a,2.8,0.08,0.5,0,-0.35);}}
    else{put(CYL8,'#6a5440',x,g+0.9,z,0,0.25,1.8,0.25);put(SPH,R()<0.5?LEAF:LEAF2,x,g+2.6,z,R()*3,2.6,2.2,2.6);for(let k=0;k<5;k++)put(SPH0,'#e8902a',x+(R()-0.5)*2,g+2.2+R()*1.0,z+(R()-0.5)*2,0,0.16,0.16,0.16);}};
  // ---- courtyards ----
  let nCourt=0,nPortico=0,nPots=0;
  for(const f of FOOTPRINTS){if(!f.holes||!f.holes.length||f.tall)continue;
    for(const hr of f.holes){const A=Math.abs(area(hr));if(A<(K.minCourt||40))continue;
      const cx=hr.reduce((s,q)=>s+q[0],0)/hr.length,cz=hr.reduce((s,q)=>s+q[1],0)/hr.length;if(!inPoly(cx,cz,hr))continue;
      const g=Math.max(groundH(cx,cz),...hr.map(q=>groundH(q[0],q[1]))),hs=(f.hsh*91.7)%1,garden=A>260&&hs<0.35;nCourt++;
      floor(hr,g+0.06,garden?'#a99d84':(hs<0.7?'#ada391':'#a8977c'));   // darker than the stone itself: a floor in the open sun reads pale enough
      if(garden){// four beds of box round the middle, a fountain or a tree at the crossing
        const s=Math.sqrt(A)*0.18;for(const [dx,dz] of [[-1,-1],[1,-1],[1,1],[-1,1]]){const bx=cx+dx*s*1.2,bz=cz+dz*s*1.2;if(!inPoly(bx,bz,hr))continue;
          put(BOX,BOXH,bx,g+0.3,bz,0,s*1.6,0.6,s*1.6);put(BOX,'#5d7d3e',bx,g+0.62,bz,0,s*1.45,0.05,s*1.45);}
        if(hs<0.2)fountain(cx,cz,1.6,0,g+0.06);else tree(cx,cz,g,false);}
      else if(A>120){if(hs<0.85&&hs>=0.65)tree(cx,cz,g,true);else if(hs<0.5){put(CYL,TRAV2,cx,g+0.5,cz,0,1.5,0.9,1.5);put(CYL,'#1a2024',cx,g+0.96,cz,0,1.2,0.02,1.2);
          put(BOX,IRON,cx-0.6,g+1.8,cz,0,0.06,1.8,0.06);put(BOX,IRON,cx+0.6,g+1.8,cz,0,0.06,1.8,0.06);put(BOX,IRON,cx,g+2.7,cz,0,1.26,0.06,0.06);}   // a wellhead
        else if(A>200)fountain(cx,cz,1.3,0,g+0.06);else tree(cx,cz,g,false);}
      // pots along the walls, a metre in
      const sg=Math.sign(area(hr))||1;
      for(let i=0;i<hr.length;i++){const a=hr[i],b=hr[(i+1)%hr.length],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<4)continue;const ex=(b[0]-a[0])/L,ez=(b[1]-a[1])/L;
        let nx=-ez,nz=ex;if(!inPoly(a[0]+ex*L/2+nx*1.2,a[1]+ez*L/2+nz*1.2,hr)){nx=-nx;nz=-nz;}   // into the court
        for(let s=2;s<L-1.5;s+=5+((i*3+s)%3)){if(R()<0.35)continue;const x=a[0]+ex*s+nx*0.9,z=a[1]+ez*s+nz*0.9;put(POT,TERRA,x,g+0.5,z,0,0.85,1.0,0.85);put(SPH0,R()<0.5?LEAF:LEAF2,x,g+1.4,z,R()*3,1.3,1.1,1.3);nPots++;}
        // a portico along the longest side of a big court
        if(A>250&&L>=12&&L===Math.max(...hr.map((p,k)=>Math.hypot(hr[(k+1)%hr.length][0]-p[0],hr[(k+1)%hr.length][1]-p[1])))){const d=2.6,H=4.6,n=Math.floor((L-2)/3.6);nPortico++;
          for(let k=0;k<=n;k++){const s=1+k*(L-2)/n,x=a[0]+ex*s+nx*d,z=a[1]+ez*s+nz*d;put(CYL8,'#e2dacb',x,g+H/2,z,0,0.5,H,0.5);put(BOX,'#d6ccb6',x,g+H+0.15,z,0,0.8,0.3,0.8);}
          const mx=a[0]+ex*L/2+nx*d,mz=a[1]+ez*L/2+nz*d,ry=-Math.atan2(ez,ex);put(BOX,'#d8cfbb',mx,g+H+0.6,mz,ry,L-1,0.7,0.9);
          put(BOX,'#a85a3c',a[0]+ex*L/2+nx*d/2,g+H+1.2,a[1]+ez*L/2+nz*d/2,ry,L-0.6,0.18,d+0.9);}}}}
  // ---- the named fountains ----
  const FMOD=new Set(K.fountainModels||[]),LM=(C.landmarks||[]).filter(l=>l.at).map(l=>[...P(l.at),FMOD.has(l.model)?30:10]);let nFount=0;
  const BIG=new Set(K.bigFountains||[]);
  for(const p of POIS){if(p.kind!=='fountain')continue;if(LM.some(([x,z,r])=>Math.hypot(x-p.x,z-p.z)<r))continue;if(inWater(p.x,p.z))continue;
    if(buildingsAt(p.x,p.z,0).some(b=>inPoly(p.x,p.z,b.ring)&&!(b.holes||[]).some(h=>inPoly(p.x,p.z,h))))continue;
    fountain(p.x,p.z,BIG.has(p.name)?4.6:1.6+R()*1.6,p.ang||R()*Math.PI);nFount++;}
  // ---- the campi's wellheads (C.courts.campoWells: the least campo, m²): the vera da pozzo in the middle of a campo -
  // a carved drum of Istrian stone on two steps, its iron lid, where the rain the campo gathered was drawn ----
  let nWell=0;if(K.campoWells){const AR=a=>{let s2=0;for(let i=0;i<a.length;i++){const p=a[i],q=a[(i+1)%a.length];s2+=p[0]*q[1]-q[0]*p[1];}return Math.abs(s2)/2;};
    for(const a of api.AREAS||[]){if(a.kind!=='plaza'||AR(a.o)<K.campoWells)continue;let cx=0,cz=0;for(const p of a.o){cx+=p[0];cz+=p[1];}cx/=a.o.length;cz/=a.o.length;
      if(!inPoly(cx,cz,a.o)||inWater(cx,cz)||buildingsAt(cx,cz,1).some(b=>inPoly(cx,cz,b.ring)))continue;if(LM.some(([x,z])=>Math.hypot(x-cx,z-cz)<25))continue;nWell++;
      const g=groundH(cx,cz),oct=R()<0.5;put(CYL8,'#d8d2c4',cx,g+0.1,cz,0,3.6,0.2,3.6);put(CYL8,'#e0dacc',cx,g+0.3,cz,0,2.8,0.2,2.8);
      put(oct?CYL8:CYL,'#ece6d8',cx,g+0.9,cz,0,1.7,1.0,1.7);put(oct?CYL8:CYL,'#e4ddce',cx,g+1.45,cz,0,1.9,0.12,1.9);put(CYL,'#2a2a2c',cx,g+1.52,cz,0,1.4,0.04,1.4);}}
  // ---- ruins: broken wall tops, and the strewn ground of the archaeological zones ----
  const RUIN='#cdb89a',RUIN2='#b8a283',MARB='#e4dfd4';let nRuin=0,nStrewn=0;
  for(const f of FOOTPRINTS){if(f.t!=='ruins')continue;const r=f.ring;nRuin++;
    for(let i=0;i<r.length;i++){const a=r[i],b=r[(i+1)%r.length],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<1.5)continue;const ex=(b[0]-a[0])/L,ez=(b[1]-a[1])/L,ry=-Math.atan2(ez,ex);
      for(let s=0;s<L;s+=1.4+R()*1.6){const w=Math.min(1.2+R()*1.6,L-s);if(w<0.4)break;const hh=R()<0.3?0:0.3+R()*2.2;if(!hh)continue;
        put(BOX,R()<0.5?RUIN:RUIN2,a[0]+ex*(s+w/2),f.h+hh/2-0.05,a[1]+ez*(s+w/2),ry,w,hh,0.9);}}}
  const ZONES=(C.ruinZones||[]).map(([a,b,c,d])=>{const [x0,z0]=P([a,b]),[x1,z1]=P([c,d]);return [Math.min(x0,x1),Math.min(z0,z1),Math.max(x0,x1),Math.max(z0,z1)];});
  // in clusters - where a building came down - rather than evenly over the zone
  const seeds=ZONES.flatMap(([x0,z0,x1,z1])=>Array.from({length:Math.round((x1-x0)*(z1-z0)/9000)},()=>[x0+R()*(x1-x0),z0+R()*(z1-z0),12+R()*22]));
  for(const [x0,z0,x1,z1] of ZONES)for(let x=x0;x<x1;x+=5)for(let z=z0;z<z1;z+=5){const px=x+R()*5,pz=z+R()*5,near=seeds.some(([sx,sz,sr])=>Math.hypot(px-sx,pz-sz)<sr);
    if(R()>(near?(K.strew||0.22)*2.2:0.015))continue;
    if(inWater(px,pz)||buildingsAt(px,pz,2).some(b=>inPoly(px,pz,b.ring))||roadsNear(px,pz,3).length)continue;const g=groundH(px,pz),k=R();nStrewn++;
    if(k<0.35){const h=0.6+R()*3.5,rr=0.35+R()*0.25;put(CYL,MARB,px,g+h/2,pz,0,rr*2,h,rr*2);put(BOX,RUIN2,px,g+0.2,pz,0,rr*2.8,0.4,rr*2.8);}   // a stump on its plinth
    else if(k<0.7){const rr=0.35+R()*0.25,L=0.8+R()*1.4;put(CYL,MARB,px,g+rr,pz,R()*Math.PI,rr*2,L,rr*2,0,Math.PI/2);}                  // a fallen drum
    else put(BOX,R()<0.5?RUIN:MARB,px,g+0.3,pz,R()*Math.PI,1.2+R()*1.6,0.5+R()*0.4,0.7+R()*0.5);}                                   // a cornice block
  // ---- into meshes, a tile each, drawn only near ----
  const mat=new THREE.MeshLambertMaterial({vertexColors:true}),MS=[];let tris=0;
  for(const t of tiles.values()){if(!t.p.length)continue;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(t.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(t.n,3));
    g.setAttribute('color',new THREE.Float32BufferAttribute(t.c,3));g.computeBoundingSphere();const m=new THREE.Mesh(g,mat);m.receiveShadow=true;m.castShadow=true;scene.add(m);MS.push(m);tris+=t.p.length/9;}
  {let last=-1e9;animHooks.push(now=>{if(now-last<300)return;last=now;for(const m of MS){const s=m.geometry.boundingSphere;m.visible=camera.position.distanceTo(s.center)-s.radius<FAR;}});}
  api.ctx.details=Object.assign(api.ctx.details||{},{courtyards:nCourt,campoWells:nWell,porticoes:nPortico,courtPots:nPots,fountains:nFount,ruinFootprints:nRuin,ruinStrewn:nStrewn,courtsTris:Math.round(tris)});
}
