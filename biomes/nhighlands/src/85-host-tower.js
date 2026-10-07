// ================================================================= HOST — one Girder tower
// the tower's (or jetty's) concrete, iron and stone from the material library (materials.json towerConcrete, towerRust, jettyStone)
// when this page carries the kit's pack; the UVs are world metres / 6, so one UV unit is 6 m of the set
function hostTowerLib(n,fb){const L=(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('nhighlands',n):null;if(!L)return fb;
 const t=KMAT.textures(L,{aniso:8}).map;t.repeat.set(6/L.scale[0],6/L.scale[1]);return t;}
// A single ruined tower of Girder's four (30 storeys of 5 m on a 48 m square,
// 4x4 cyclopean columns, 16 m floor plates in a 3x3 grid, spandrel girders,
// X-bracing, core walls, a ragged unfinished top), rebuilt here in plain
// three.js so the biome has soffits, ledges and walls to grow on. It is a TEST
// STRUCTURE for HYPERJUNGLE.dress(): the host merges its shells per material
// and hands the geometries over; the biome samples their faces itself.
// Host-only. No plant is placed in this file.
function buildTestTower(){
 reseed(85031);   // its own stream: the mist (84) reseeds the one it would otherwise inherit
 // on its levelled bench above the stream (45-host-stage.js: TOWER, PADS)
 const TX=TOWER.x,TZ=TOWER.z,HALF=24,N=30,FH=5,SLAB=1,COLS=[-HALF+1.6,-8,8,HALF-1.6];
 const y0=terrainH(TX,TZ);
 const conc=[],rust=[];
 const box=(list,x,y,z,w,h,d,rot)=>{const g=new THREE.BoxGeometry(w,h,d);if(rot){g.rotateX(rot[0]||0);g.rotateY(rot[1]||0);g.rotateZ(rot[2]||0);}g.translate(x,y+h/2,z);list.push(g);};
 const beam=(list,ax,ay,az,bx,by,bz,w,d)=>{const L=Math.hypot(bx-ax,by-ay,bz-az);const g=new THREE.BoxGeometry(w,L,d);
  const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(bx-ax,by-ay,bz-az).normalize());
  g.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(q));g.translate((ax+bx)/2,(ay+by)/2,(az+bz)/2);list.push(g);};
 // the ruin state: floors above 18 lose plates, the top is ragged
 const floors=[];for(let k=0;k<=N;k++){const missing=[];
  if(k>10)for(let bi=-1;bi<=1;bi++)for(let bj=-1;bj<=1;bj++){const p=k>22?.55:(k>16?.30:.10);if(rng()<p)missing.push(bi+','+bj);}
  floors.push({k,y:y0+3+k*FH,missing});}
 const top=y0+3+N*FH;
 // columns, some running on past the roof as broken stubs
 COLS.forEach((cx,i)=>COLS.forEach((cz,j)=>{const over=rng()<.55?rr(2,13):.4;box(rust,TX+cx,y0-3,TZ+cz,3.2,top-y0+3+over,3.2);}));
 floors.forEach(F=>{const yb=F.y-SLAB;
  for(let bi=-1;bi<=1;bi++)for(let bj=-1;bj<=1;bj++){if(F.missing.indexOf(bi+','+bj)>=0)continue;
   if(bi||bj)box(conc,TX+bi*16,yb,TZ+bj*16,16.02,SLAB,16.02);
   else if(F.k<N){box(conc,TX-6.2,yb,TZ,3.6,SLAB,16);box(conc,TX+1.8,yb,TZ-6.1,12.4,SLAB,3.8);box(conc,TX+1.8,yb,TZ+6.1,12.4,SLAB,3.8);}}
  [[0,-1],[0,1],[-1,0],[1,0]].forEach(f=>box(rust,TX+f[0]*(HALF-.35),yb-.9,TZ+f[1]*(HALF-.35),f[0]?.7:48,1.5,f[0]?48:.7));
  [-8,8].forEach(c=>{box(rust,TX+c,yb-.8,TZ,.9,.8,47);box(rust,TX,yb-.8,TZ+c,47,.8,.9);});
  if(F.k<N&&F.k<20){box(conc,TX,F.y,TZ-7.6,16,FH,.8);box(conc,TX,F.y,TZ+7.6,16,FH,.8);box(conc,TX+7.6,F.y,TZ,.8,FH,14.4);}
 });
 // X-bracing, two storeys at a time, gaps where it has fallen
 [[0,-1],[0,1],[-1,0],[1,0]].forEach(f=>{for(let k=0;k<N;k+=2){if(rng()<.22)continue;
  const ya=floors[k].y,yb2=floors[Math.min(N,k+2)].y-SLAB,px=TX+f[0]*(HALF-.4),pz=TZ+f[1]*(HALF-.4),ax=f[0]?0:-8,az=f[1]?0:-8;
  beam(rust,px+ax,ya,pz+az,px-ax,yb2,pz-az,.55,.55);beam(rust,px-ax,ya,pz-az,px+ax,yb2,pz+az,.55,.55);}});
 // rubble at the foot
 for(let i=0;i<40;i++){const a=rng()*TAU,r=rr(26,52);const x=TX+Math.cos(a)*r,z=TZ+Math.sin(a)*r;box(conc,x,terrainH(x,z)-.5,z,rr(2,7),rr(1,3),rr(2,6),[rr(-.3,.3),rng()*TAU,rr(-.3,.3)]);}
 // merge per material
 const TEXC=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=150+(fbm(x/18,y/18,2.2,3)-.5)*60+(fbm(x/3,y/3,8,1)-.5)*20;d[i]=v*.92;d[i+1]=v*.86;d[i+2]=v*.74;d[i+3]=255;}g.putImageData(id,0,0);});
 const TEXR=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=fbm(x/14,y/9,5.5,3),u=fbm(x/4,y/4,3,2);d[i]=96+v*46+u*16;d[i+1]=70+v*34+u*8;d[i+2]=52+v*22;d[i+3]=255;}g.putImageData(id,0,0);});
 const merge=(list,mat,label)=>{const pos=[],nor=[],uv=[];
  list.forEach(g=>{const ng=g.toNonIndexed();const p=ng.attributes.position.array,n=ng.attributes.normal.array;
   for(let i=0;i<p.length;i++){pos.push(p[i]);nor.push(n[i]);}
   for(let i=0;i<p.length;i+=3){uv.push((p[i]+p[i+2])/6,p[i+1]/6);}});   // triplanar-ish world uv
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  const m=new THREE.Mesh(geo,mat);m.userData.inspectLabel=label;m.userData.host=true;scene.add(m);return geo;};
 const gC=merge(conc,new THREE.MeshLambertMaterial({map:hostTowerLib('towerConcrete',TEXC),color:0x8e8878}),'Girder tower — concrete');
 const gR=merge(rust,new THREE.MeshLambertMaterial({map:hostTowerLib('towerRust',TEXR),color:0x6e4a36}),'Girder tower — iron');
 OBSTACLES.push({x:TX,z:TZ,r:HALF*1.5+6,y0:y0-5,y1:top+20});
 REGISTER({name:'Girder tower (test structure, ruined)',x:TX,z:TZ,y:y0,r:HALF*1.5,h:top-y0+16});
 TOWER.y0=y0;TOWER.top=top;
 return [gC,gR];}
