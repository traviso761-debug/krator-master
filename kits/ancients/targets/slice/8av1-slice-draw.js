// ================================================================= SLICE — the drawing (records in, geometry out)  [draw]
// Draws SLICE.plan() intact (d = 0) and ruined (d = 1, with SLICE.ruin deltas), registering every building, structural
// component, interior program unit, tree, lamp, boat and citizen in core/tags (KTAGS.slice) before emitting geometry.

const SL_SITE={};

/* ---- Bespoke Procedural Textures (canvasTex + createImageData, deterministic on h3/fbm) ---- */
/* 1. Columnar-jointed upper cliff rock (Soleri's tall vertical desert monolith columns above y = 220 m) */
TEX.slColRock=canvasTex(512,512,(g,w,h)=>{
 const id=g.createImageData(w,h),D=id.data;
 const NC=16,CB=[0];
 {
  const cw=[];let s=0;
  for(let i=0;i<NC;i++){const t=0.65+h3(i,3.7,9.1)*0.95;cw.push(t);s+=t;}
  for(let i=0;i<NC;i++)CB.push(CB[i]+cw[i]/s*w);
 }
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const i=(y*w+x)*4,fx=x/w,fy=y/h;
  const xw=((x+3.5*(fbm(fx*3,fy*6,2.7,2)-0.5)+w)%w);
  let c=0;while(c<NC-1&&CB[c+1]<=xw)c++;
  const c0=CB[c],c1=CB[c+1],tx=(xw-c0)/(c1-c0);
  const edge=Math.min(xw-c0,c1-xw);
  let v=0.79+(h3(c,5.2,1.8)-0.5)*0.12;
  /* Subtle vertical prism shading across each column facet + faint cross-joints */
  v+=(tx-0.5)*0.08+(fbm(fx*10,fy*4,6.1,3)-0.5)*0.14+(fbm(fx*28,fy*18,8.3,2)-0.5)*0.07;
  if(edge<1.5)v-=0.28*(1-edge/1.5);
  else if(edge<3.2)v+=0.05;
  const hz=Math.floor(fy*9+h3(c,2.9,4.4)*2);
  if(Math.abs((fy*9+h3(c,2.9,4.4)*2)-hz)<0.035&&h3(c,hz,7.7)<0.45)v-=0.11;
  /* Brow mineral streaking near top */
  const streak=fbm(fx*38,fy*2.2,5.5,2);
  if(streak>0.56)v-=(streak-0.56)*0.55;
  const r=clamp(v,0,1);
  D[i]=r*236;D[i+1]=r*218;D[i+2]=r*194;D[i+3]=255;
 }
 g.putImageData(id,0,0);
});

/* 2. Dark mineral-streaked cave ceiling inside the Lenticular Eye & Specimen Caverns (image_2.png upper eye) */
TEX.slCaveStreak=canvasTex(512,512,(g,w,h)=>{
 const id=g.createImageData(w,h),D=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const i=(y*w+x)*4,fx=x/w,fy=y/h;
  const st1=fbm(fx*26,fy*1.8,3.9,3),st2=fbm(fx*64,fy*3.5,9.2,2);
  let v=0.24+(fbm(fx*8,fy*8,1.7,2)-0.5)*0.10;
  /* Dramatic pale mineral / calcite vertical seepage bands matching Soleri's ink wash */
  if(st1>0.58)v+=(st1-0.58)*1.15*(0.4+0.6*st2);
  const r=clamp(v,0,1);
  D[i]=r*225;D[i+1]=r*208;D[i+2]=r*188;D[i+3]=255;
 }
 g.putImageData(id,0,0);
});

/* 3. Closely-ruled horizontally-stratified canyon bench rock (y = 0..220 m in image_2.png) */
TEX.slStratRock=canvasTex(512,512,(g,w,h)=>{
 const id=g.createImageData(w,h),D=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const i=(y*w+x)*4,fx=x/w,fy=y/h;
  const yw=y+4*(fbm(fx*5,fy*3,4.8,2)-0.5);
  const bed=Math.sin(yw*0.85)*0.5+0.5;
  const fine=Math.sin(yw*2.6)*0.5+0.5;
  let v=0.60+bed*0.14+fine*0.07+(fbm(fx*12,fy*16,7.1,3)-0.5)*0.14;
  if((Math.floor(yw)%14)===0)v-=0.16;
  const r=clamp(v,0,1);
  D[i]=r*222;D[i+1]=r*188;D[i+2]=r*156;D[i+3]=255;
 }
 g.putImageData(id,0,0);
});

TEX.slTop=canvasTex(256,256,(g,w,h)=>{
 const id=g.createImageData(w,h),D=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const i=(y*w+x)*4;
  const m1=fbm(x/28,y/28,3.3,3),m2=fbm(x/7,y/7,8.7,2);
  const v=clamp(0.74+(m1-0.5)*0.24+(m2-0.5)*0.11,0,1);
  D[i]=v*228;D[i+1]=v*204;D[i+2]=v*176;D[i+3]=255;
 }
 g.putImageData(id,0,0);
});

/* 4. Warm board-formed architectural travertine concrete */
function slTravTex(dec){
 return canvasTex(512,512,(g,w,h)=>{
  const id=g.createImageData(w,h),D=id.data;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   const i=(y*w+x)*4;
   let v=228+(fbm(x/52,y/52,2.9,3)-0.5)*20+(fbm(x/9,y/9,5.7,2)-0.5)*10;
   if(y%32<1)v-=13;else if(y%32<3)v+=5;
   if(x%64<1)v-=9;
   if(dec){
    const st=fbm(x/8,y/120,7.8,3);
    v=v*0.80-Math.max(0,st-0.46)*145;
   }
   D[i]=clamp(v+8,0,255);D[i+1]=clamp(v-2,0,255);D[i+2]=clamp(v-18,0,255);D[i+3]=255;
  }
  g.putImageData(id,0,0);
 });
}

/* 5. Turquoise-emerald ceramic basin tile */
TEX.slTile=canvasTex(256,256,(g,w,h)=>{
 const id=g.createImageData(w,h),D=id.data;
 const ts=8;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const i=(y*w+x)*4,tx=Math.floor(x/ts),ty=Math.floor(y/ts);
  if(x%ts===0||y%ts===0){
   D[i]=154;D[i+1]=176;D[i+2]=168;D[i+3]=255;
  }else{
   const h1=h3(tx,ty,4.1),m=fbm(x/32,y/32,2.5,2);
   D[i]=clamp(32+h1*24+m*18,0,255);
   D[i+1]=clamp(112+h1*46+m*24,0,255);
   D[i+2]=clamp(98+h1*38+m*18,0,255);
   D[i+3]=255;
  }
 }
 g.putImageData(id,0,0);
});

/* 6. Multi-storey shaft, honeycomb & residential window atlas + night emissive */
function slWinCell(ci,cj){
 const lot=h3(ci*3.9,cj*5.1,4.7);
 return {lit:lot>=0.12&&lot<0.46,warm:h3(ci*2.1,cj*2.9,8.5)};
}
function slWinTex(dec){
 return canvasTex(512,512,(g,w,h)=>{
  const id=g.createImageData(w,h),D=id.data;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   const i=(y*w+x)*4,ci=Math.floor(x/64),cj=Math.floor(y/64),cx=x%64,cy=y%64;
   const C=slWinCell(ci,cj),n=(fbm(x/14,y/14,3.1,2)-0.5)*14;
   const frame=(cx<4||cx>59||cy<5||cy>57||(cx===31||cx===32));
   let r,gg,b;
   if(frame){
    const v=dec?90+n:152+n;r=v+10;gg=v+2;b=v-12;
   }else if(dec){
    const brk=h3(ci*2.7,cj*4.3,1.9)<0.46;
    r=brk?46+n:26+n;gg=brk?42+n:32+n;b=36+n;
   }else if(C.lit){
    const f=0.68+0.32*C.warm,band=(cy>38)?0.80:1.0;
    r=198*f*band;gg=148*f*band;b=90*f*band;
   }else{
    const sky=Math.max(0,1-cy/48);
    r=26+sky*32+n*0.4;gg=40+sky*44+n*0.4;b=48+sky*54+n*0.4;
   }
   D[i]=clamp(r,0,255);D[i+1]=clamp(gg,0,255);D[i+2]=clamp(b,0,255);D[i+3]=255;
  }
  g.putImageData(id,0,0);
 });
}
function slWinEmissive(){
 return canvasTex(256,256,(g,w,h)=>{
  const id=g.createImageData(w,h),D=id.data;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   const i=(y*w+x)*4,X=x*2,Y=y*2,ci=Math.floor(X/64),cj=Math.floor(Y/64),cx=X%64,cy=Y%64;
   const C=slWinCell(ci,cj);
   const frame=(cx<4||cx>59||cy<5||cy>57||(cx===31||cx===32));
   const a=(C.lit&&!frame)?(0.58+0.42*C.warm):0;
   D[i]=240*a;D[i+1]=174*a;D[i+2]=96*a;D[i+3]=255;
  }
  g.putImageData(id,0,0);
 });
}

TEX.slTrav=slTravTex(0);TEX.slTravR=slTravTex(1);
TEX.slWin=slWinTex(0);TEX.slWinR=slWinTex(1);TEX.slWinE=slWinEmissive();

MAT.slColRock=new THREE.MeshStandardMaterial({map:TEX.slColRock,color:0xd8bea2,roughness:0.95,metalness:0,side:DS});
MAT.slStratRock=new THREE.MeshStandardMaterial({map:TEX.slStratRock,color:0xa88264,roughness:0.97,metalness:0,side:DS});
MAT.slCaveShade=new THREE.MeshStandardMaterial({map:TEX.slCaveStreak,color:0x6e5d4e,emissive:0x3d3228,emissiveMap:TEX.slCaveStreak,emissiveIntensity:0.75,roughness:0.98,metalness:0,side:DS});
MAT.slTop=new THREE.MeshStandardMaterial({map:TEX.slTop,color:0xc4a688,roughness:0.98,metalness:0,side:DS});
MAT.slBed=new THREE.MeshStandardMaterial({map:TEX.slTop,color:0x6d5d4f,roughness:0.96,metalness:0,side:DS});

MAT.slTrav=new THREE.MeshStandardMaterial({map:TEX.slTrav,roughnessMap:TEX.concreteRM,color:0xe8d8bf,roughness:0.90,metalness:0,side:DS});
MAT.slTravR=new THREE.MeshStandardMaterial({map:TEX.slTravR,roughnessMap:TEX.concreteRM,color:0xa3927d,roughness:0.97,metalness:0,side:DS});
/* Shaded belly soffit of the 720 m cantilevered Eye so the hung hull reads dark over the 400 m drop */
MAT.slUnder=new THREE.MeshStandardMaterial({map:TEX.slTrav,roughnessMap:TEX.concreteRM,color:0x5c5145,roughness:0.96,metalness:0,side:DS});
MAT.slUnderR=new THREE.MeshStandardMaterial({map:TEX.slTravR,roughnessMap:TEX.concreteRM,color:0x423a31,roughness:0.98,metalness:0,side:DS});

MAT.slGoldCoffer=new THREE.MeshStandardMaterial({map:TEX.slTrav,color:0xd89f68,emissive:0x542e12,emissiveIntensity:0.52,roughness:0.82,metalness:0.06,side:DS});
MAT.slBronze=new THREE.MeshStandardMaterial({map:TEX.slTrav,color:0xc49566,roughness:0.74,metalness:0.12,side:DS});
MAT.slBronzeR=new THREE.MeshStandardMaterial({map:TEX.slTravR,color:0x876749,roughness:0.90,metalness:0.06,side:DS});

MAT.slTile=new THREE.MeshStandardMaterial({map:TEX.slTile,color:0x86dec8,roughness:0.24,metalness:0.06,side:DS});
MAT.slPave=new THREE.MeshStandardMaterial({map:TEX.slTrav,color:0xdec7ad,roughness:0.86,metalness:0,side:DS});
MAT.slLawn=new THREE.MeshStandardMaterial({map:TEX.slTop,color:0x537c3b,roughness:0.95,metalness:0,side:DS});
MAT.slLawnR=new THREE.MeshStandardMaterial({map:TEX.slTop,color:0x647743,roughness:0.98,metalness:0,side:DS});

MAT.slFacade=new THREE.MeshStandardMaterial({map:TEX.slWin,emissive:0xffffff,emissiveMap:TEX.slWinE,emissiveIntensity:0.56,roughness:0.42,metalness:0.24,side:DS});
MAT.slFacadeKeep=new THREE.MeshStandardMaterial({map:TEX.slWinR,emissive:0xffcf8a,emissiveMap:TEX.slWinE,emissiveIntensity:0.28,roughness:0.64,metalness:0.18,side:DS});
MAT.slFacadeR=new THREE.MeshStandardMaterial({map:TEX.slWinR,roughness:0.78,metalness:0.12,side:DS});

MAT.slRoomLit=new THREE.MeshStandardMaterial({map:TEX.slTrav,color:0xd1946b,emissive:0x61351a,emissiveIntensity:0.58,roughness:0.88,metalness:0,side:DS});
MAT.slRoomDim=new THREE.MeshStandardMaterial({map:TEX.slTravR,color:0x766656,roughness:0.94,metalness:0,side:DS});
MAT.slDarkSteel=new THREE.MeshStandardMaterial({color:0x24282d,roughness:0.44,metalness:0.56,side:DS});
MAT.slIndGlow=new THREE.MeshStandardMaterial({color:0xffcb82,emissive:0xff9636,emissiveIntensity:1.15,roughness:0.35,metalness:0.25,side:DS});
MAT.slLampOff=new THREE.MeshStandardMaterial({color:0x54463b,roughness:0.76,metalness:0.38});

kdef('slLampOn',new THREE.SphereGeometry(0.85,10,8),MAT.slIndGlow);
kdef('slLampDead',new THREE.SphereGeometry(0.85,10,8),MAT.slLampOff);
kdef('slBoat',(function(){
 const s=new THREE.Shape();
 s.moveTo(-4.5,0);s.quadraticCurveTo(0,1.6,4.5,0);s.quadraticCurveTo(0,-1.6,-4.5,0);
 const g=new THREE.ExtrudeGeometry(s,{depth:1.1,bevelEnabled:false});
 g.rotateX(-Math.PI/2);return g;
})(),MAT.slBronze);

/* ---- Geometry Helpers for Merged Buffers ---- */
function slBoxGeo(x0,y0,z0,x1,y1,z1,uvScale){
 const w=x1-x0,h=y1-y0,d=z1-z0,k=uvScale==null?16:uvScale;
 const g=new THREE.BoxGeometry(w,h,d);
 const uv=g.attributes.uv,nrm=g.attributes.normal;
 for(let i=0;i<uv.count;i++){
  const nx=Math.abs(nrm.getX(i)),ny=Math.abs(nrm.getY(i));
  const su=nx>0.5?d:w;
  const sv=ny>0.5?d:h;
  uv.setXY(i,uv.getX(i)*su/k,uv.getY(i)*sv/k);
 }
 g.translate((x0+x1)*0.5,(y0+y1)*0.5,(z0+z1)*0.5);
 return g;
}

function slWorldUV(geo,scale){
 const k=scale==null?18:scale;
 const pos=geo.attributes.position,nrm=geo.attributes.normal,uv=geo.attributes.uv;
 if(!uv||!nrm)return geo;
 for(let i=0;i<pos.count;i++){
  const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);
  const nx=Math.abs(nrm.getX(i)),ny=Math.abs(nrm.getY(i));
  if(ny>0.7)uv.setXY(i,x/k,z/k);
  else if(nx>0.7)uv.setXY(i,z/k,y/k);
  else uv.setXY(i,x/k,y/k);
 }
 return geo;
}

function slPiercedWallGeo(x0,x1,y0,y1,z0,z1,arches,circles,uvScale){
 const s=new THREE.Shape();
 s.moveTo(x0,y0);s.lineTo(x1,y0);s.lineTo(x1,y1);s.lineTo(x0,y1);s.closePath();
 if(arches){
  for(const a of arches){
   const p=new THREE.Path();
   const hw=a.w*0.5,sy=a.springY;
   p.moveTo(a.cx-hw,y0-0.05);
   p.lineTo(a.cx+hw,y0-0.05);
   p.lineTo(a.cx+hw,sy);
   p.absarc(a.cx,sy,hw,0,Math.PI,false);
   p.lineTo(a.cx-hw,y0-0.05);
   s.holes.push(p);
  }
 }
 if(circles){
  for(const c of circles){
   const p=new THREE.Path();
   p.absarc(c.cx,c.cy,c.r,0,Math.PI*2,true);
   s.holes.push(p);
  }
 }
 const g=new THREE.ExtrudeGeometry(s,{depth:z1-z0,bevelEnabled:false,curveSegments:20});
 g.translate(0,0,z0);
 g.computeVertexNormals();
 return slWorldUV(g,uvScale==null?16:uvScale);
}

/* Regular polygon ring slab [rIn..rOut] with nSides in XZ plane from y0 to y1 */
function slPolyRingGeo(cx,cz,rIn,rOut,y0,y1,nSides,rot0,uvScale){
 const sides=nSides==null?6:nSides,a0=rot0==null?0:rot0;
 const s=new THREE.Shape();
 for(let i=0;i<=sides;i++){
  const a=a0+(i/sides)*TAU,px=cx+Math.cos(a)*rOut,pz=-(cz+Math.sin(a)*rOut);
  if(i===0)s.moveTo(px,pz);else s.lineTo(px,pz);
 }
 if(rIn>0.5){
  const h=new THREE.Path();
  for(let i=sides;i>=0;i--){
   const a=a0+(i/sides)*TAU,px=cx+Math.cos(a)*rIn,pz=-(cz+Math.sin(a)*rIn);
   if(i===sides)h.moveTo(px,pz);else h.lineTo(px,pz);
  }
  s.holes.push(h);
 }
 const g=new THREE.ExtrudeGeometry(s,{depth:y1-y0,bevelEnabled:false,curveSegments:sides>12?24:1});
 g.rotateX(-Math.PI/2);
 g.translate(0,y0,0);
 g.computeVertexNormals();
 return slWorldUV(g,uvScale==null?14:uvScale);
}

/* Semicircular or horseshoe arc ring from ang0 to ang1 around (cx, cz) */
function slArcRingGeo(cx,cz,rIn,rOut,y0,y1,ang0,ang1,segs,uvScale){
 const n=segs==null?24:segs;
 const s=new THREE.Shape();
 for(let i=0;i<=n;i++){
  const a=lerp(ang0,ang1,i/n);
  const px=cx+Math.sin(a)*rOut,pz=-(cz+Math.cos(a)*rOut);
  if(i===0)s.moveTo(px,pz);else s.lineTo(px,pz);
 }
 for(let i=n;i>=0;i--){
  const a=lerp(ang0,ang1,i/n);
  const px=cx+Math.sin(a)*rIn,pz=-(cz+Math.cos(a)*rIn);
  s.lineTo(px,pz);
 }
 s.closePath();
 const g=new THREE.ExtrudeGeometry(s,{depth:y1-y0,bevelEnabled:false});
 g.rotateX(-Math.PI/2);
 g.translate(0,y0,0);
 g.computeVertexNormals();
 return slWorldUV(g,uvScale==null?14:uvScale);
}

/* ---- Main Builder ---- */
function buildSlice(scene,gx,gz,d){reseed(12420+d);KOFF=[gx,0,gz];
 if(typeof camera!=='undefined'&&camera.far<30000){camera.far=30000;camera.updateProjectionMatrix();}
 if(typeof sky!=='undefined')sky.renderOrder=-1;
 if(typeof skyMat!=='undefined'&&skyMat.fragmentShader.indexOf('pow(h,.55)')>=0){
  skyMat.fragmentShader=skyMat.fragmentShader.replace('pow(h,.55)','pow(max(h,0.),.55)');
  skyMat.needsUpdate=true;
 }

 const dd=d>0?1:0;
 const P=SLICE.plan({seed:12420});
 const RU=dd?SLICE.ruin(P):null;
 const MG=SLICE.modernGuide(P,RU);
 const DR=SLICE.dress(P,RU);
 const D=P.dim;

 const G=new THREE.Group();
 G.position.set(gx,0,gz);
 scene.add(G);

 /* ---- 1. Register every placed record in core/tags BEFORE drawing ---- */
 {
  const T=KTAGS.slice||(KTAGS.slice=KTAGS.create({build:'ancients-slice'}));
  const pre=(dd?'ruin':'intact')+'/';
  const W=a=>[a[0]+gx,a[1],a[2]+gz];
  const st=dd?'ruined':'intact';
  const B=T.add({
   id:pre+P.id,'class':'building',kind:'arcology',key:'ancients:slice',
   name:'Slice',at:[gx,0,gz],r:380,h:P.stats.height,
   tags:{culture:'ancient',types:['dwelling-multi','civic','industry','park','infrastructure'],state:st,landmark:true}
  });
  const part=(id,kind,name,at,o)=>T.child(B.id,Object.assign({'class':'part',kind:kind,key:pre+id,name:name,at:W(at),tags:{style:st}},o||{}));
  part(P.industries.id,'industries',P.industries.name,[64,0,70],{size:[228,28,230]});
  part(P.park.id,'park',P.park.name,[52,28,72],{size:[160,192,218]});
  part(P.dwall.id,'dwellings-wall',P.dwall.name,[155,28,72],{size:[46,204,216]});
  part(P.shaft.id,'shaft',P.shaft.name,[0,28,-10],{size:[60,384,56]});
  part(P.dome.id,'dome',P.dome.name,[0,456,-18],{r:56,h:56});
  part(P.fan.id,'amphitheatre',P.fan.name,[0,416,62],{r:108,h:38});
  for(const w of P.eyeWings){
   if(dd&&w.key==='westTip')continue;
   part(w.id,'wing',w.name,[(w.x0+w.x1)*0.5,w.y0,(w.z0+w.z1)*0.5],{size:[w.x1-w.x0,w.y1-w.y0,w.z1-w.z0]});
  }
  for(const cv of P.caverns){
   const ch=cv.chamber;
   part(cv.id,'cavern',cv.name,[(ch.x0+ch.x1)*0.5,ch.y0,(ch.z0+ch.z1)*0.5],{size:[ch.x1-ch.x0,ch.y1-ch.y0,ch.z1-ch.z0]});
  }
  for(const sk of P.skylights){
   const sx=sk.cx==null?(sk.x0+sk.x1)*0.5:sk.cx,sz=sk.cz==null?(sk.z0+sk.z1)*0.5:sk.cz;
   part(sk.id,'skylight-court',sk.name,[sx,sk.y0,sz],{r:sk.r==null?80:sk.r,h:sk.y1-sk.y0});
  }
  for(const pt of P.portals){
   part(pt.id,'transit-portal',pt.name,[(pt.from[0]+pt.to[0])*0.5,pt.y0,(pt.from[1]+pt.to[1])*0.5],{r:90,h:pt.y1-pt.y0});
  }
  for(const u of P.program){
   const ux=u.shape==='circle'?u.cx:(u.x0+u.x1)*0.5;
   const uz=u.shape==='circle'?u.cz:(u.z0+u.z1)*0.5;
   T.child(B.id,{
    'class':'part',kind:'interior-'+u.category,key:pre+u.id,name:u.name,at:W([ux,u.y0,uz]),
    h:u.y1-u.y0,tags:{quarter:u.category,role:u.kind,zone:u.zone,lit:u.litM2>0}
   });
  }
  for(const dr of DR){
   if(dr.kind==='tree'||dr.kind==='vine')T.child(B.id,{'class':'flora',kind:dr.kind,key:pre+dr.id,at:W(dr.at)});
   else if(dr.kind==='figure')T.child(B.id,{'class':'life',kind:'person',key:pre+dr.id,at:W(dr.at),ry:dr.ry});
   else T.child(B.id,{'class':'prop',kind:dr.kind,key:pre+dr.id,at:W(dr.at)});
  }
  if(RU){
   for(const wr of RU.wrecks)T.child(B.id,{'class':'part',kind:'wreck',key:pre+wr.id,at:W([wr.x,12,wr.z]),tags:{style:'ruined'}});
  }
 }

 /* ---- 2. Inspector Registry Volumes (all verified non-empty) ---- */
 const sLbl=' ('+STATE(d)+')';
 REGISTER({name:'Slice — the cliff-slice arcology'+sLbl,x:0,z:-20,r:375,y:0,h:562});
 REGISTER({name:'The Coffered Geodesic City Center Dome'+sLbl,x:0,z:-18,r:62,y:450,h:68});
 REGISTER({name:'The Lenticular Cliff Eye and Honeycomb'+sLbl,x:15,z:-10,r:290,y:408,h:128});
 REGISTER({name:'Semicircular Park and Recreation Amphitheatre Fan'+sLbl,x:0,z:62,r:108,y:408,h:52});
 REGISTER({name:'The Vertical Learning and Collection Shaft'+sLbl,x:0,z:-10,r:48,y:28,h:386});
 REGISTER({name:'Rock-Cut Research, Museums and Anthropological Caverns'+sLbl,x:-20,z:-12,r:185,y:218,h:162});
 REGISTER({name:'The Sunken Canyon Park and Battered Dwellings Wall'+sLbl,x:85,z:72,r:118,y:26,h:212});
 REGISTER({name:'Subterranean Automated Industries and Cooling Sluice'+sLbl,x:64,z:95,r:128,y:0,h:30});
 REGISTER({name:'The Hexagonal Skylight Court and Rear Chambers'+sLbl,x:10,z:-215,r:225,y:460,h:106});
 REGISTER({name:'Twin Diagonal Inter-City Transportation Portals'+sLbl,x:-242,z:-212,r:96,y:462,h:102});
 if(dd)REGISTER({name:'West Brow Columnar Rockfall and Fallen Eye Wrecks',x:-195,z:110,r:95,y:215,h:35});

 /* ---- 3. Merge Accumulators by Material ---- */
 const COLROCK=[],STRATROCK=[],CAVESHADE=[],TOP=[],BED=[];
 const TRAV=[],UNDER=[],COFFER=[],BRONZE=[],TILE=[],PAVE=[],LAWN=[];
 const FAC=[],FACK=[],ROOML=[],ROOMD=[],DARK=[],GLOW=[],GLASS=[];

 const travM=dd?MAT.slTravR:MAT.slTrav;
 const underM=dd?MAT.slUnderR:MAT.slUnder;
 const bronzeM=dd?MAT.slBronzeR:MAT.slBronze;
 const lawnM=dd?MAT.slLawnR:MAT.slLawn;

 /* Shared arch curve for the rock-cut Specimen Caverns so cliff cutout and cave vault match cleanly */
 const cavernArchY=(cv,x)=>{
  const ch=cv.chamber,u=clamp((x-ch.x0)/(ch.x1-ch.x0),0,1);
  if(ch.peaks.length===2){
   const h1=Math.sin(clamp(u/0.58,0,1)*Math.PI);
   const h2=Math.sin(clamp((u-0.42)/0.58,0,1)*Math.PI);
   return ch.y0+5+(ch.y1-ch.y0-5)*Math.max(h1*0.88,h2);
  }
  return ch.y0+4+(ch.y1-ch.y0-4)*Math.pow(Math.sin(u*Math.PI),0.68);
 };
 const inCavernMouth=(x,y)=>{
  for(const cv of P.caverns){
   if(cv.key==='pavilion')continue;
   const t=cv.tunnel,c=cv.chamber;
   if(x>=t.x0&&x<=t.x1&&y>=t.y0&&y<=t.y1+0.8)return true;
   if(x>=c.x0+1&&x<=c.x1-1&&y>=c.y0&&y<=cavernArchY(cv,x)-0.8)return true;
  }
  return false;
 };

 /* ---- 4. Columnar-Jointed Upper Cliff, Stratified Lower Shoulders, Plateau & Gorge ---- */
 /* A. Upper Columnar-Jointed Cliff Escarpment (y = 220..560 m) with clean Eye, Shaft & Cavern cutouts */
 COLROCK.push(gridSurface((u,v)=>{
  const x=lerp(D.XW,D.XE,u);
  const yBot=SLICE.benchCapY(x)-2,yTop=SLICE.ctop(x);
  const y=lerp(yBot,yTop,v);
  return [x,y,SLICE.upperCliffZ(x,y,dd)];
 },216,58,{uS:36,vS:8,hole:(u,v)=>{
  const x=lerp(D.XW,D.XE,u);
  const y=lerp(SLICE.benchCapY(x)-2,SLICE.ctop(x),v);
  if(SLICE.inEye(x,y))return true;
  if(Math.abs(x)<29&&y<410)return true;
  if(inCavernMouth(x,y))return true;
  return false;
 }}));
 /* Sculpted Smooth Columnar Rock Brow Arch along the Upper Lip of the 720 m Eye (eliminates grid-hole stair-stepping!) */
 COLROCK.push(gridSurface((u,v)=>{
  const x=lerp(-D.EYE.hw-4,D.EYE.hw+4,u);
  const yLip=SLICE.eyeTopY(x);
  const zCliff=SLICE.upperCliffZ(x,yLip,dd);
  /* Wraps from cave soffit (v=0) over the overhanging lip nose (v=0.45) up onto the cliff face (v=1) */
  const y=v<0.45?lerp(yLip-1.2,yLip+0.4,v/0.45):lerp(yLip+0.4,yLip+9.5,(v-0.45)/0.55);
  const z=v<0.45?lerp(zCliff-7,zCliff+3.2,v/0.45):lerp(zCliff+3.2,zCliff-0.6,(v-0.45)/0.55);
  return [x,y,z];
 },128,4,{uS:22,vS:1}));

 /* B. Dark Mineral-Streaked Cavernous Rock Vault inside the Lenticular Eye (image_2.png upper-eye ceiling) */
 CAVESHADE.push(gridSurface((u,v)=>{
  const x=lerp(-D.EYE.hw-6,D.EYE.hw+6,u);
  const yFront=SLICE.eyeTopY(x),yEq=D.EYE.yEq;
  const zFront=SLICE.upperCliffZ(x,yFront,dd)-1.2;
  const zBack=SLICE.eyeBackZ(x);
  const z=lerp(zFront,zBack,v);
  const arch=Math.pow(1-v,0.62);
  const domeClear=10*Math.sin(v*Math.PI)*(1-clamp(Math.abs(x)/D.EYE.hw,0,1));
  const y=lerp(yEq-2,yFront+2,arch)+domeClear;
  return [x,y,z];
 },112,20,{uS:18,vS:6}));
 /* Lower cave rear wall closing the hollow behind the Eye belly (y = 408..458 m) */
 CAVESHADE.push(gridSurface((u,v)=>{
  const x=lerp(-D.EYE.hw-6,D.EYE.hw+6,u);
  const y=lerp(SLICE.eyeBotY(x)-4,D.EYE.yEq+6,v);
  return [x,y,SLICE.eyeBackZ(x)];
 },88,8,{uS:18,vS:2}));

 /* C. West & East Horizontally-Stratified Canyon Bench Shoulders (y = 0..220 m, z = 0..186 m) */
 /* West Shoulder: x from XW (-1080) to slotWestX(y) (-52 at top, -30 at bottom) */
 STRATROCK.push(gridSurface((u,v)=>{
  const x=lerp(D.XW,D.SLOT_XW,u),capY=SLICE.benchCapY(x);
  const zBack=SLICE.upperCliffZ(x,capY,dd)-4,zFront=SLICE.benchFrontZ(x,capY);
  const z=lerp(zBack,zFront,v);
  return [x,SLICE.benchSurfaceY(x,z,dd),z];
 },68,18,{uS:20,vS:6}));
 STRATROCK.push(gridSurface((u,v)=>{
  const x=lerp(D.XW,D.SLOT_XW,u),capY=SLICE.benchCapY(x),y=v*capY;
  return [x,y,SLICE.benchFrontZ(x,y)];
 },68,24,{uS:20,vS:5}));
 /* Battered West Slot Canyon Wall facing the Learning Shaft & Sunken Park (image_2.png left of shaft!) */
 STRATROCK.push(gridSurface((u,v)=>{
  const y=lerp(0,D.BENCH_Y,v),x=SLICE.slotWestX(y);
  const z=lerp(-40,SLICE.benchFrontZ(D.SLOT_XW,y),u);
  return [x,y,z];
 },24,22,{uS:6,vS:5}));

 /* East Shoulder: x from DWALL.xBack (+178) to XE (+1080) */
 STRATROCK.push(gridSurface((u,v)=>{
  const x=lerp(D.DWALL.xBack-2,D.XE,u),capY=SLICE.benchCapY(x);
  const zBack=SLICE.upperCliffZ(x,capY,dd)-4,zFront=SLICE.benchFrontZ(x,capY);
  const z=lerp(zBack,zFront,v);
  return [x,SLICE.benchSurfaceY(x,z,dd),z];
 },68,18,{uS:20,vS:6}));
 STRATROCK.push(gridSurface((u,v)=>{
  const x=lerp(D.DWALL.xBack-2,D.XE,u),capY=SLICE.benchCapY(x),y=v*capY;
  return [x,y,SLICE.benchFrontZ(x,y)];
 },68,24,{uS:20,vS:5}));
 /* Rear slot rock headwall behind the Sunken Park & Shaft (z = -42) */
 CAVESHADE.push(slBoxGeo(D.SLOT_XW-4,0,-48,D.DWALL.xBack+4,D.BENCH_Y+4,-38,18));

 /* D. Caprock Plateau with Clean Skylight & Transport Portal Cutouts (y ~ 560 m) */
 TOP.push(gridSurface((u,v)=>{
  const x=lerp(D.XW,D.XE,u),top=SLICE.ctop(x);
  const zFront=SLICE.upperCliffZ(x,top,dd)-1.0;
  const z=lerp(zFront,D.ZBK,v);
  return [x,SLICE.platY(x,z,dd),z];
 },164,52,{uS:32,vS:14,hole:(u,v)=>{
  const x=lerp(D.XW,D.XE,u),top=SLICE.ctop(x);
  const zFront=SLICE.upperCliffZ(x,top,dd)-1.0;
  const z=lerp(zFront,D.ZBK,v);
  return SLICE.inPlateauHole(x,z);
 }}));

 /* E. Foreground Shore Apron, Gorge Riverbed & Far Canyon Wall */
 BED.push(gridSurface((u,v)=>{
  const x=lerp(D.XW,D.XE,u),z=lerp(D.BENCH_Z1-6,D.FAR_Z0+8,v);
  return [x,SLICE.groundY(x,z,dd),z];
 },96,24,{uS:28,vS:8}));
 STRATROCK.push(gridSurface((u,v)=>{
  const x=lerp(D.XW,D.XE,u),z=lerp(D.FAR_Z0,D.FAR_Z1,v);
  return [x,SLICE.farWallY(x,z),z];
 },104,24,{uS:28,vS:6}));

 /* ---- 5. Subterranean Automated Industries Gallery (y = 0..28 m, image_2.png bottom) ---- */
 {
  const IND=P.industries;
  const x0=IND.x0,x1=IND.x1,y0=0,y1=IND.y1,z0=IND.z0,z1=IND.z1;
  /* Heavy bedrock foundation slab sitting directly at y = 0 + roof slab under Sunken Park & Canal (y = 25.8 m) */
  TRAV.push(slBoxGeo(x0,0,z0,x1,3.2,z1,18));
  TRAV.push(slBoxGeo(x0,y1-4.8,z0,x1,y1-2.2,z1,18));
  /* Front cornice fascia above the 6 Automated Industries bays (leaving sluice notch at x = 38..64!) */
  TRAV.push(slBoxGeo(x0,y1-2.4,z1-5,38.5,y1+0.1,z1+0.4,14));
  TRAV.push(slBoxGeo(63.5,y1-2.4,z1-5,x1,y1+0.1,z1+0.4,14));
  /* Side and rear containment walls */
  TRAV.push(slBoxGeo(x0,2.8,z0,x0+4.5,y1-2.2,z1,16));
  TRAV.push(slBoxGeo(x1-4.5,2.8,z0,x1,y1-2.2,z1,16));
  TRAV.push(slBoxGeo(x0,2.8,z0,x1,y1-2.2,z0+5,16));
  /* Coronal front facade at z1 = 186: 7 monumental Brutalist piers framing 6 deep machine bays! */
  const bayW=(x1-x0)/IND.bays;
  for(let b=0;b<=IND.bays;b++){
   const px=x0+b*bayW;
   TRAV.push(slBoxGeo(px-2.6,0,z1-16,px+2.6,y1-2.1,z1+0.5,14));
  }
  /* Horizontal spandrel gantry beam at mid-height y = 14.5 */
  DARK.push(slBoxGeo(x0+1,13.6,z1-14,x1-1,15.8,z1-0.8,12));
  /* Cyclopean turbines, automated transfer gantries, and warm reactor cores visible inside each bay */
  for(let b=0;b<IND.bays;b++){
   const cx=x0+(b+0.5)*bayW;
   ROOMD.push(slBoxGeo(cx-bayW*0.44,3.0,z1-28,cx+bayW*0.44,y1-4.5,z1-18,14));
   DARK.push(slBoxGeo(cx-7.5,3.0,z1-15,cx+7.5,13.8,z1-4,10));
   if(!dd||b>=2){
    GLOW.push(slBoxGeo(cx-4.2,5.5,z1-15.4,cx+4.2,11.2,z1-3.6,6));
   }
   GLASS.push(slBoxGeo(cx-bayW*0.42,3.1,z1-2.2,cx+bayW*0.42,y1-4.6,z1-1.6,12));
  }
  /* Gorge Outfall Sluice Apron & Boat Mooring Quay (z = 184..214, y = 0..10.5) */
  TRAV.push(slBoxGeo(-85,0,z1-2,165,9.6,D.APRON_Z1,16));
  PAVE.push(slBoxGeo(-85,9.4,z1-2,165,10.2,D.APRON_Z1+0.5,14));
  /* Two stone mooring piers projecting into the gorge river */
  for(const px of [-38,92]){
   TRAV.push(slBoxGeo(px-7,0,D.APRON_Z1-2,px+7,8.2,D.APRON_Z1+22,12));
   PAVE.push(slBoxGeo(px-7.4,8.0,D.APRON_Z1-2,px+7.4,8.5,D.APRON_Z1+22.4,10));
  }
 }

 /* ---- 6. Deep Sunken Canyon Park, Battered 26-Storey Dwellings Wall & Slot Ribs (y = 28..232 m) ---- */
 {
  const PK=P.park,CN=PK.canal,DW=P.dwall;
  /* Park paving & lawns surrounding the sunken turquoise-emerald reflecting canal (overlapping Industries roof at 25.8 m) */
  PAVE.push(slBoxGeo(PK.x0-2,PK.y0-2.5,PK.z0,CN.x0,PK.y0+0.15,PK.z1+2,14));
  PAVE.push(slBoxGeo(CN.x1,PK.y0-2.5,PK.z0,PK.x1+2,PK.y0+0.15,PK.z1+2,14));
  PAVE.push(slBoxGeo(CN.x0,PK.y0-2.5,PK.z0,CN.x1,PK.y0+0.15,CN.z0,14));
  PAVE.push(slBoxGeo(CN.x0,PK.y0-2.5,CN.z1,CN.x1,PK.y0-0.35,PK.z1+2,14));
  LAWN.push(slBoxGeo(PK.x0+4,PK.y0+0.1,PK.z0+8,CN.x0-5,PK.y0+0.55,PK.z1-8,12));
  LAWN.push(slBoxGeo(CN.x1+5,PK.y0+0.1,PK.z0+8,PK.x1-5,PK.y0+0.55,PK.z1-8,12));
  /* Front park overlook balustrade at z = 182 */
  TRAV.push(slBoxGeo(PK.x0,PK.y0,PK.z1-1.2,CN.x0+2,PK.y0+1.3,PK.z1+0.4,10));
  TRAV.push(slBoxGeo(CN.x1-2,PK.y0,PK.z1-1.2,PK.x1,PK.y0+1.3,PK.z1+0.4,10));

  /* Reflecting Canal ceramic tile basin + 3 arched footbridges */
  const cy0=CN.y-CN.depth;
  TILE.push(slBoxGeo(CN.x0-0.4,cy0-0.5,CN.z0-0.4,CN.x1+0.4,cy0+0.05,CN.z1+0.4,6));
  TILE.push(slBoxGeo(CN.x0-0.5,cy0,CN.z0,CN.x0+0.3,CN.y+0.1,CN.z1,6));
  TILE.push(slBoxGeo(CN.x1-0.3,cy0,CN.z0,CN.x1+0.5,CN.y+0.1,CN.z1,6));
  for(const bz of [24,78,132]){
   TRAV.push(slBoxGeo(CN.x0-2.5,CN.y+0.25,bz-2.6,CN.x1+2.5,CN.y+1.05,bz+2.6,10));
   PAVE.push(slBoxGeo(CN.x0-2.5,CN.y+1.0,bz-2.4,CN.x1+2.5,CN.y+1.3,bz+2.4,8));
  }

  /* Battered 26-Storey Canyon Dwellings Wall (x = 132..178, y = 28..232 m, image_2.png bottom-right!) */
  const facArr=dd?FACK:FAC;
  for(let k=0;k<P.dwallSteps.length;k++){
   const st=P.dwallSteps[k];
   /* Solid structural tier overlapping tier below by 1.2 m */
   TRAV.push(slBoxGeo(st.x0+2.2,k===0?25.6:st.y0-1.2,st.z0,st.x1+2,st.y1-0.5,st.z1,16));
   /* West-facing glazed apartment strip + crisp cantilevered balcony slab & parapet */
   facArr.push(slBoxGeo(st.x0+1.6,st.y0+0.2,st.z0+3,st.x0+2.5,st.y1-0.8,st.z1-3,12));
   TRAV.push(slBoxGeo(st.x0-0.4,st.y1-0.9,st.z0,st.x1+1,st.y1+0.15,st.z1,14));
   TRAV.push(slBoxGeo(st.x0-0.4,st.y1,st.z0,st.x0+0.7,st.y1+1.15,st.z1,10));
   if(k%2===0){
    LAWN.push(slBoxGeo(st.x0+0.7,st.y1+0.05,st.z0+4,st.x0+2.6,st.y1+0.45,st.z1-4,10));
   }
   /* Coronal south end-wall reveal showing the crisp horizontal floor plates of DWELLINGS in elevation! */
   ROOML.push(slBoxGeo(st.x0+1.2,st.y0+0.3,st.z1-3.5,st.x1-1.5,st.y1-0.9,st.z1-0.4,12));
  }
  /* Rounded sculptural wind-hood / vault crest at y = 232..239 m (visible at top of DWELLINGS wall in image_2.png!) */
  TRAV.push(gridSurface((u,v)=>{
   const ang=u*Math.PI,r=8.5;
   const cx=DW.xCrest+8.5;
   return [cx+Math.cos(ang)*r,DW.y1-0.5+Math.sin(ang)*6.8,lerp(DW.z0,DW.z1,v)];
  },16,6,{uS:4,vS:12}));

  /* West Canyon Slot Colonnade & Tie-Girder (x = 26..30.5, z = 16..172) anchoring all diagonal slot ribs south of the Shaft! */
  TRAV.push(slBoxGeo(26.0,93.5,16,30.5,112.5,172,14));
  for(const pz of [52,92,132,168]){
   TRAV.push(slBoxGeo(26.4,26.5,pz-2.2,30.2,94.5,pz+2.2,12));
  }

  /* Sleek Diagonal Tensioned Light-Veil Arch Beams & Vertical Louver Cables across the Slot (image_2.png!) */
  const goneRibs=new Set(RU?RU.goneRibs:[]);
  for(const rb of P.slotRibs){
   const ax=rb.from[0]-0.8,ay=rb.from[1],bx=rb.to[0]+1.2,by=rb.to[1],rz=rb.z;
   const ribY=u=>lerp(ay,by,u)-10*Math.sin(u*Math.PI);
   if(goneRibs.has(rb.id)){
    /* Snapped sleek sloped stubs overlapping Shaft East Pier and Dwellings Wall Crest */
    for(const seg of [[0,0.09],[0.91,1.0]]){
     BRONZE.push(gridSurface((u,v)=>{
      const t=lerp(seg[0],seg[1],u),x=lerp(ax,bx,t),yc=ribY(t);
      const ci=Math.round(v*4);
      const dy=(ci===0||ci===1||ci===4)?-0.9:0.9;
      const dz=(ci===0||ci===3||ci===4)?-0.65:0.65;
      return [x,yc+dy,rz+dz];
     },4,4,{uS:2,vS:1}));
    }
    continue;
   }
   /* Smooth continuous 4-sided sloped catenary beam (zero stair-stepping!) */
   BRONZE.push(gridSurface((u,v)=>{
    const x=lerp(ax,bx,u),yc=ribY(u);
    const ci=Math.round(v*4);
    const dy=(ci===0||ci===1||ci===4)?-0.85:0.85;
    const dz=(ci===0||ci===3||ci===4)?-0.65:0.65;
    return [x,yc+dy,rz+dz];
   },22,4,{uS:10,vS:1}));
   /* Fine vertical tension veil cables dropping from the smooth diagonal beam into the Park floor */
   for(let s=1;s<=13;s++){
    const um=s/14,vx=lerp(ax,bx,um),vyTop=ribY(um);
    if(vx<36.5||vx>65.5){
     DARK.push(slBoxGeo(vx-0.22,27.6,rz-0.22,vx+0.22,vyTop+0.2,rz+0.22,8));
    }
   }
  }
 }

 /* ---- 7. Vertical Learning & Collection Shaft (y = 0..414 m) + Four Side Caverns ---- */
 {
  const SH=P.shaft,CL=SH.collar;
  const pw=D.SHAFT.pierW,cw=D.SHAFT.coreW*0.5;
  /* Two unbroken monumental outer concrete flange piers (y = 0..404) + rear cliff-keyed spine */
  TRAV.push(slBoxGeo(SH.x0,0,SH.z0,SH.x0+pw,CL.y0+2,SH.z1,18));
  TRAV.push(slBoxGeo(SH.x1-pw,0,SH.z0,SH.x1,CL.y0+2,SH.z1,18));
  TRAV.push(slBoxGeo(SH.x0,0,SH.z0,SH.x1,CL.y0+2,SH.z0+6.5,18));

  /* Central vertical divider spine mullion (split across y = 226..264 in d=1 for the mid-shaft blowout!) */
  if(!dd){
   TRAV.push(slBoxGeo(-cw,27,SH.z0+5,cw,CL.y0+2,SH.z1-0.6,16));
  }else{
   const br=RU.shaftBreach;
   TRAV.push(slBoxGeo(-cw,27,SH.z0+5,cw,br.y0+1,SH.z1-0.6,16));
   TRAV.push(slBoxGeo(-cw,br.y1-1,SH.z0+5,cw,CL.y0+2,SH.z1-0.6,16));
   /* Dark blasted-out blowout cavity backing inside the breached neck */
   CAVESHADE.push(slBoxGeo(SH.x0+pw-0.5,br.y0-2,SH.z0+5,SH.x1-pw+0.5,br.y1+2,SH.z0+14,14));
  }

  /* 36 Stacked Horizontal Learning & Collection Floor Plates + Recessed Glazed Curtain */
  for(const bd of P.shaftBands){
   const inBreach=dd&&bd.y0>=RU.shaftBreach.y0&&bd.y1<=RU.shaftBreach.y1;
   const litBand=!dd||bd.y0>RU.shaftBreach.y1;
   const facArr=litBand?(dd?FACK:FAC):FAC;
   if(!inBreach){
    /* Crisp white/travertine horizontal floor plate overlapping both outer flange piers */
    TRAV.push(slBoxGeo(SH.x0+pw-1.2,bd.y0-0.65,SH.z0+5,SH.x1-pw+1.2,bd.y0+0.65,SH.z1-0.4,14));
    /* Recessed dark-framed window wall + warm study room backing */
    facArr.push(slBoxGeo(SH.x0+pw-0.4,bd.y0+0.5,SH.z1-4.8,SH.x1-pw+0.4,bd.y1-0.5,SH.z1-3.2,12));
    if(bd.k%2===0){
     ROOML.push(slBoxGeo(SH.x0+pw,bd.y0+0.6,SH.z1-12,SH.x1-pw,bd.y0+1.4,SH.z1-4.6,12));
    }
   }else{
    /* Jagged broken floor-slab stubs cantilevered off the left & right flange piers in the breach! */
    const stubW=7+4*SLICE.u(12420,410,bd.k,0);
    TRAV.push(slBoxGeo(SH.x0+pw-1.2,bd.y0-0.6,SH.z0+5,SH.x0+pw+stubW,bd.y0+0.6,SH.z1-2,12));
    TRAV.push(slBoxGeo(SH.x1-pw-stubW,bd.y0-0.6,SH.z0+5,SH.x1-pw+1.2,bd.y0+0.6,SH.z1-2,12));
   }
  }

  /* Flared Monumental Shaft Capital Collar (y = 400..414 m) cradling the Lenticular Eye */
  TRAV.push(slBoxGeo(CL.x0,CL.y0,CL.z0,CL.x1,CL.y1,CL.z1,16));
  UNDER.push(slBoxGeo(CL.x0-4,CL.y1-3.5,CL.z0-2,CL.x1+4,CL.y1+1.5,CL.z1+3,16));

  /* Four Horizontal Rock-Cut Specimen Caverns & West Bench Pavilion (RESEARCH, MUSEUMS, ANTHRO, FIELDHOUSE) */
  for(const cv of P.caverns){
   const t=cv.tunnel,ch=cv.chamber;
   if(cv.key==='pavilion'){
    /* West Bench Sloped-Roof Fieldhouse Pavilion at y = 220..250 m + tie plinth to Shaft at x = -30 */
    TRAV.push(slBoxGeo(ch.x1-2,218.5,t.z0,SH.x0+2,223.2,t.z1,14));
    PAVE.push(slBoxGeo(ch.x0-4,219.2,ch.z0-3,ch.x1+4,221.2,ch.z1+4,14));
    /* Brutalist pavilion walls + recessed gallery glazing + asymmetric pitched sculptural roof (image_2.png!) */
    TRAV.push(slBoxGeo(ch.x0,220.8,ch.z0,ch.x0+4.2,238,ch.z1,14));
    TRAV.push(slBoxGeo(ch.x1-4.2,220.8,ch.z0,ch.x1,238,ch.z1,14));
    TRAV.push(slBoxGeo(ch.x0,220.8,ch.z0,ch.x1,238,ch.z0+4.5,14));
    (dd?FACK:FAC).push(slBoxGeo(ch.x0+3.8,221,ch.z1-3.2,ch.x1-3.8,237.5,ch.z1-1.8,12));
    /* Pitched prismatic concrete roof rising to y = 250 m */
    TRAV.push(gridSurface((u,v)=>{
     const x=lerp(ch.x0-1.5,ch.x1+1.5,u);
     const peak=1-Math.abs(u-0.42)/0.58;
     const y=237.5+12.5*clamp(peak,0,1);
     return [x,y,lerp(ch.z0-1.5,ch.z1+1.5,v)];
    },10,4,{uS:6,vS:4}));
    continue;
   }

   /* Rock-cut cliff gallery tunnel linking the Shaft directly into the Specimen Cavern */
   const tunX0=cv.side==='west'?ch.x1-2:SH.x1-2;
   const tunX1=cv.side==='west'?SH.x0+2:ch.x0+2;
   CAVESHADE.push(slBoxGeo(tunX0-2,t.y0-4,t.z0-4,tunX1+2,t.y1+6,t.z0+2,14));
   COLROCK.push(slBoxGeo(tunX0,t.y1+0.8,-4,tunX1,t.y1+5.5,SLICE.upperCliffZ((tunX0+tunX1)*0.5,t.y1,dd)+2.2,14));
   TRAV.push(slBoxGeo(tunX0,t.y0-0.8,t.z0,tunX1,t.y0+1.2,t.z1,14));
   TRAV.push(slBoxGeo(tunX0,t.y1,t.z0,tunX1,t.y1+1.6,t.z1-1,14));
   (dd&&cv.key==='anthro'?FAC:FACK).push(slBoxGeo(tunX0,t.y0+1,t.z1-3.5,tunX1,t.y1+0.2,t.z1-2.2,10));

   /* Organic Vaulted Rock-Cut Specimen Cavern (RESEARCH, MUSEUMS, ANTHROPOLOGICAL COLLECTION) */
   /* Sculpted Columnar Rock Brow Hood framing the cavern arch so zero rectangular grid corners show! */
   COLROCK.push(gridSurface((u,v)=>{
    const x=lerp(ch.x0-5,ch.x1+5,u),yArch=cavernArchY(cv,x);
    const zCliff=SLICE.upperCliffZ(x,yArch,dd);
    const y=v<0.45?lerp(yArch-0.8,yArch+0.5,v/0.45):lerp(yArch+0.5,ch.y1+6,(v-0.45)/0.55);
    const z=v<0.45?lerp(ch.z1-3,zCliff+2.5,v/0.45):lerp(zCliff+2.5,zCliff-0.8,(v-0.45)/0.55);
    return [x,y,z];
   },28,4,{uS:6,vS:1}));
   /* Recessed dark cave roof & back wall */
   CAVESHADE.push(gridSurface((u,v)=>{
    const x=lerp(ch.x0-5,ch.x1+5,u),yTop=cavernArchY(cv,x);
    const z=lerp(ch.z1+0.5,ch.z0,v);
    const y=lerp(yTop+0.5,ch.y0+1,Math.pow(v,1.6));
    return [x,y,z];
   },28,8,{uS:6,vS:3}));
   CAVESHADE.push(slBoxGeo(ch.x0-6,ch.y0-4,ch.z0-3,ch.x1+6,ch.y1+6,ch.z0+1,14));
   /* Cave floor slab + 3 warm-lit stepped research/specimen gallery terraces inside the cavern! */
   TRAV.push(slBoxGeo(ch.x0-1,ch.y0-1.4,ch.z0,ch.x1+1,ch.y0+1.2,ch.z1+1,14));
   for(let st=0;st<3;st++){
    const sx0=ch.x0+6+st*5,sx1=ch.x1-6-st*5;
    const sy0=ch.y0+1+st*4.4,sz0=ch.z0+4,sz1=ch.z1-3-st*5;
    TRAV.push(slBoxGeo(sx0,sy0-0.5,sz0,sx1,sy0+3.8,sz1,12));
    ROOML.push(slBoxGeo(sx0+1.5,sy0+0.4,sz0+1,sx1-1.5,sy0+3.4,sz1+0.2,10));
   }
   /* Cantilevered observation balcony rail along cavern mouth */
   BRONZE.push(slBoxGeo(ch.x0,ch.y0+1.0,ch.z1-0.6,ch.x1,ch.y0+2.3,ch.z1+0.8,10));
  }
 }

 /* ---- 8. The Upper Lenticular "Slice" Eye, Coffered Dome, Cellular Belly & Front Park Fan ---- */
 {
  const E=D.EYE,DM=P.dome,FN=P.fan;
  const xMin=dd?RU.eyeWestCutX:-E.hw;
  const xMax=E.hw;

  /* A. Curved Dark Shaded Belly Hull under the Cantilevered Lenticular Eye (y = 410..456 m) */
  UNDER.push(gridSurface((u,v)=>{
   const x=lerp(xMin,xMax,u);
   const yBot=SLICE.eyeBotY(x);
   const zLip=SLICE.eyeLipZ(x),zBack=SLICE.eyeBackZ(x)*0.65;
   const z=lerp(zBack,zLip,v);
   const rise=(E.yEq-yBot)*Math.pow(v,2.2)*0.22;
   return [x,yBot+rise,z];
  },96,10,{uS:18,vS:3}));

  /* Continuous 720 m Horizontal Equator Promenade Slab (y = 453.8..456.4 m) tying the entire Eye together! */
  TRAV.push(gridSurface((u,v)=>{
   const x=lerp(xMin,xMax,u);
   const zBack=SLICE.eyeBackZ(x),zFront=SLICE.eyeLipZ(x)+2;
   return [x,E.yEq,lerp(zBack,zFront,v)];
  },96,8,{uS:18,vS:4}));
  TRAV.push(gridSurface((u,v)=>{
   const x=lerp(xMin,xMax,u);
   const zFront=SLICE.eyeLipZ(x)+2;
   return [x,lerp(E.yEq-2.8,E.yEq+1.3,v),zFront];
  },96,2,{uS:18,vS:1}));
  PAVE.push(gridSurface((u,v)=>{
   const x=lerp(xMin+4,xMax-4,u);
   const zFront=SLICE.eyeLipZ(x)+1.5;
   return [x,E.yEq+0.25,lerp(zFront-18,zFront-0.5,v)];
  },84,3,{uS:16,vS:2}));

  /* B. Stepped Continuous Crescent Shelves + Cellular Brutalist Honeycomb Modules in Lower Belly (y = 412..455 m) */
  for(let r=0;r<5;r++){
   const sy0=412+r*8.6,sy1=sy0+8.6;
   const spanX=Math.sqrt(Math.max(0,1-Math.pow((E.yEq-sy0-1)/(E.yEq-E.yBot),1/0.82)))*E.hw*0.92;
   const sxA=Math.max(xMin+4,-spanX),sxB=Math.min(xMax-4,spanX);
   if(sxB-sxA>24){
    TRAV.push(slBoxGeo(sxA,sy0-1.2,-46,sxB,sy1,14+r*3.5,16));
   }
  }
  for(const c of P.honeycomb){
   if(dd&&c.x0<xMin+3)continue;
   const litCell=!dd||c.x0>-65;
   const cFac=litCell?(dd?FACK:FAC):FAC;
   if(c.porthole){
    /* East lower lip 5 circular porthole oculi (o o o o o) straight from image_2.png! */
    const mx=(c.x0+c.x1)*0.5,my=(c.y0+c.y1)*0.5;
    TRAV.push(slPiercedWallGeo(c.x0,c.x1,c.y0-0.6,c.y1+0.4,c.z1-2.4,c.z1,null,[{cx:mx,cy:my,r:2.6}],10));
    UNDER.push(slBoxGeo(c.x0+1,c.y0,c.z0,c.x1-1,c.y1,c.z1-2.2,10));
   }else if(c.open){
    /* Open Brutalist loggia frame revealing warm lit interior terrace */
    TRAV.push(slBoxGeo(c.x0,c.y0-0.6,c.z0,c.x1,c.y0+1.1,c.z1,10));
    TRAV.push(slBoxGeo(c.x0,c.y1-1.0,c.z0,c.x1,c.y1+0.4,c.z1,10));
    TRAV.push(slBoxGeo(c.x0,c.y0,c.z0,c.x0+1.8,c.y1,c.z1,10));
    TRAV.push(slBoxGeo(c.x1-1.8,c.y0,c.z0,c.x1,c.y1,c.z1,10));
    ROOML.push(slBoxGeo(c.x0+1.6,c.y0+0.9,c.z0,c.x1-1.6,c.y1-0.9,c.z1-4.5,10));
   }else{
    /* Solid cellular apartment block with recessed window grid */
    TRAV.push(slBoxGeo(c.x0,c.y0-0.6,c.z0,c.x1,c.y1+0.4,c.z1-1.5,12));
    TRAV.push(slBoxGeo(c.x0,c.y0-0.6,c.z1-1.6,c.x1,c.y0+1.2,c.z1,10));
    TRAV.push(slBoxGeo(c.x0,c.y1-1.1,c.z1-1.6,c.x1,c.y1+0.4,c.z1,10));
    TRAV.push(slBoxGeo(c.x0,c.y0,c.z1-1.6,c.x0+1.8,c.y1,c.z1,10));
    TRAV.push(slBoxGeo(c.x1-1.8,c.y0,c.z1-1.6,c.x1,c.y1,c.z1,10));
    cFac.push(slBoxGeo(c.x0+1.6,c.y0+1.0,c.z1-2.0,c.x1-1.6,c.y1-0.9,c.z1-1.1,10));
   }
  }

  /* C. Central Coffered Geodesic Apse Dome (CITY CENTER, x = -56..+56, y = 456..512 m — image_2.png centrepiece!) */
  {
   const Ro=DM.rOuter,Ri=DM.rInner,y0=DM.y0;
   /* Monumental pale-travertine front semicircular arch ring (16 m deep) */
   const archS=new THREE.Shape();
   archS.absarc(0,y0,Ro,0,Math.PI,false);
   archS.lineTo(-Ri,y0);
   archS.absarc(0,y0,Ri,Math.PI,0,true);
   archS.closePath();
   const archG=new THREE.ExtrudeGeometry(archS,{depth:16,bevelEnabled:false,curveSegments:40});
   archG.translate(0,0,DM.z1-16);
   archG.computeVertexNormals();
   TRAV.push(slWorldUV(archG,16));
   TRAV.push(slBoxGeo(-Ro-2,y0-2.5,DM.z0,-Ri+2,y0+2,DM.z1,14));
   TRAV.push(slBoxGeo(Ri-2,y0-2.5,DM.z0,Ro+2,y0+2,DM.z1,14));

   /* Recessed Warm-Gold Spherical Apse Shell */
   COFFER.push(gridSurface((u,v)=>{
    const phi=u*Math.PI*0.48;
    const th=lerp(Math.PI,TAU,v);
    const r=Ri+1.2;
    const x=Math.cos(th)*Math.cos(phi)*r;
    const y=y0+Math.sin(phi)*r*1.12;
    const z=(DM.z1-10)+Math.sin(th)*Math.cos(phi)*r*1.15;
    return [x,y,z];
   },18,32,{uS:6,vS:12}));

   /* Explicit 3D Coffered Waffle Grid (Meridian Ribs + Latitude Coffer Rings) matching Soleri's geodesic dome! */
   const nMer=DM.meridians,nLat=DM.rings;
   for(let m=0;m<=nMer;m++){
    const th=lerp(Math.PI,TAU,m/nMer);
    TRAV.push(gridSurface((u,v)=>{
     const phi=u*Math.PI*0.48;
     const r=Ri-2.4+v*3.8;
     const x=Math.cos(th)*Math.cos(phi)*r;
     const y=y0+Math.sin(phi)*r*1.12;
     const z=(DM.z1-10)+Math.sin(th)*Math.cos(phi)*r*1.15;
     return [x,y,z];
    },16,2,{uS:6,vS:1}));
   }
   for(let l=1;l<=nLat;l++){
    const phi=(l/(nLat+0.4))*Math.PI*0.48;
    TRAV.push(gridSurface((u,v)=>{
     const th=lerp(Math.PI,TAU,u);
     const r=Ri-2.4+v*3.8;
     const x=Math.cos(th)*Math.cos(phi)*r;
     const y=y0+Math.sin(phi)*r*1.12;
     const z=(DM.z1-10)+Math.sin(th)*Math.cos(phi)*r*1.15;
     return [x,y,z];
    },28,2,{uS:10,vS:1}));
   }
   for(let st=0;st<4;st++){
    const rA=14+st*7.5,rB=rA+6.8;
    PAVE.push(slArcRingGeo(0,DM.z1-12,rA,rB,y0-0.5,y0+1.4+st*1.8,Math.PI*0.55,Math.PI*1.45,20,12));
   }
  }

  /* D. West Cultural Center Arches & Saucer Dome + East City Center & Vaulted Living Hall (image_2.png upper eye!) */
  {
   const wX0=Math.max(xMin+4,-260),wX1=-58;
   if(wX1-wX0>28){
    const wArches=[];
    const nA=Math.max(2,Math.floor((wX1-wX0)/22));
    const stepA=(wX1-wX0)/nA;
    for(let i=0;i<nA;i++){
     wArches.push({cx:wX0+(i+0.5)*stepA,w:stepA*0.68,springY:469});
    }
    TRAV.push(slPiercedWallGeo(wX0,wX1,455.2,482,7.5,13,wArches,null,14));
    TRAV.push(slBoxGeo(wX0,455.2,-78,wX1,482,-72,16));
    TRAV.push(slBoxGeo(wX0,480,-78,wX1,483.2,13.5,16));
    /* Deep shadowed gallery reveal behind the travertine arches so every semicircular arch pops like Soleri's elevation! */
    UNDER.push(slBoxGeo(wX0+2,455.6,5.0,wX1-2,480.2,6.2,14));
    (dd?FAC:FACK).push(slBoxGeo(wX0+4,456.2,5.6,wX1-4,468.5,6.6,12));
    if(-132-40>=xMin){
     TRAV.push(gridSurface((u,v)=>{
      const ang=u*TAU,r=v*42;
      const h=15.5*Math.cos(v*Math.PI*0.5);
      return [-132+Math.cos(ang)*r,482.5+h,-28+Math.sin(ang)*r*0.78];
     },28,6,{uS:10,vS:4}));
    }
   }
   if(!dd){
    for(let s=0;s<4;s++){
     const tx0=-348+s*18,tx1=-258;
     const ty0=455.2+s*4.5,ty1=ty0+4.8;
     if(SLICE.eyeTopY(tx0)>ty1-2){
      TRAV.push(slBoxGeo(tx0,ty0-0.5,-36+s*4,tx1,ty1,12-s*2,12));
      FAC.push(slBoxGeo(tx0+2,ty0+0.4,10.5-s*2,tx1-2,ty1-0.6,12.2-s*2,10));
     }
    }
   }

   /* East City Center Colonnade (x = +58..+156, y = 456..482) with deep shadowed arch reveals */
   const eArches=[];
   for(let i=0;i<5;i++){
    eArches.push({cx:68+i*19.5,w:13.5,springY:469});
   }
   TRAV.push(slPiercedWallGeo(58,156,455.2,482,7.5,13,eArches,null,14));
   TRAV.push(slBoxGeo(58,480,-78,156,483.2,13.5,16));
   UNDER.push(slBoxGeo(60,455.6,5.0,154,480.2,6.2,14));
   (dd?FACK:FAC).push(slBoxGeo(62,456.2,5.6,152,468.5,6.6,12));

   /* East Vaulted LIVING Hall (x = +156..+342, y = 456..498 m — broad white barrel/shell vault on right of image_2.png!) */
   TRAV.push(slBoxGeo(155,455.2,-68,282,478,12,16));
   (dd?FACK:FAC).push(slBoxGeo(158,456.2,10.8,278,476.8,12.4,12));
   /* Grand white curved vault shell above East LIVING (x = 156..276, y = 477..499 m) */
   TRAV.push(gridSurface((u,v)=>{
    const x=lerp(155,278,u);
    const arch=21*Math.sin(u*Math.PI)*(1-0.35*Math.abs(v-0.45));
    const maxCave=SLICE.eyeTopY(x)-2;
    return [x,Math.min(maxCave,477.5+arch),lerp(-64,12,v)];
   },24,6,{uS:10,vS:4}));
   /* Far-east tip stepped terraces tapering cleanly into the +360 m razor point */
   for(let s=0;s<3;s++){
    const tx0=276,tx1=346-s*18,ty0=455.2+s*4.2,ty1=ty0+4.4;
    TRAV.push(slBoxGeo(tx0,ty0-0.5,-32+s*4,tx1,ty1,10-s*2,12));
    (dd?FACK:FAC).push(slBoxGeo(tx0+2,ty0+0.4,8.6-s*2,tx1-2,ty1-0.5,10.2-s*2,10));
   }
  }

  /* E. Semicircular Front Radial-Buttressed PARK & RECREATION Amphitheatre Fan (image.png bottom-centre!) */
  {
   /* Solid structural bowl tying the semicircular fan down into the Shaft Capital Collar (y = 404..454 m) */
   UNDER.push(gridSurface((u,v)=>{
    const ang=lerp(-Math.PI*0.46,Math.PI*0.46,u);
    const r=lerp(18,FN.r1,v);
    const y=lerp(404,FN.y0+6,Math.pow(v,0.68));
    return [FN.cx+Math.sin(ang)*r,y,FN.cz+Math.cos(ang)*r];
   },32,8,{uS:10,vS:4}));

   /* Five concentric semicircular garden & recreation steps */
   for(const st of P.fanSteps){
    TRAV.push(slArcRingGeo(FN.cx,FN.cz,Math.max(12,st.rIn-3),st.rOut,st.y-7.5,st.y,-Math.PI*0.46,Math.PI*0.46,28,14));
    LAWN.push(slArcRingGeo(FN.cx,FN.cz,st.rIn+1.2,st.rOut-1.8,st.y-0.1,st.y+0.55,-Math.PI*0.44,Math.PI*0.44,26,12));
    /* Outer curved stone parapet kerb */
    PAVE.push(slArcRingGeo(FN.cx,FN.cz,st.rOut-1.8,st.rOut+0.3,st.y,st.y+1.15,-Math.PI*0.46,Math.PI*0.46,28,10));
   }
   /* Central upper amphitheatre plaza + semicircular reflecting pool basin (y = 450 m) */
   PAVE.push(slBoxGeo(-42,448,14,42,450.2,56,14));
   const fb=P.pools[1];
   TILE.push(slBoxGeo(fb.x0-0.5,fb.y-fb.depth-0.4,fb.z0-0.5,fb.x1+0.5,fb.y-fb.depth+0.1,fb.z1+0.5,5));
   TILE.push(slBoxGeo(fb.x0-0.6,fb.y-fb.depth,fb.z0,fb.x0+0.3,fb.y+0.1,fb.z1,5));
   TILE.push(slBoxGeo(fb.x1-0.3,fb.y-fb.depth,fb.z0,fb.x1+0.6,fb.y+0.1,fb.z1,5));
   TILE.push(slBoxGeo(fb.x0,fb.y-fb.depth,fb.z0-0.6,fb.x1,fb.y+0.1,fb.z0+0.3,5));
   TILE.push(slBoxGeo(fb.x0,fb.y-fb.depth,fb.z1-0.3,fb.x1,fb.y+0.1,fb.z1+0.6,5));

   /* Seven Monumental Radial Tapered Buttress Piers around the Semicircular Fan (image.png bottom signature!) */
   for(const pr of P.fanPiers){
    const sa=Math.sin(pr.ang),ca=Math.cos(pr.ang),nx=ca,nz=-sa;
    TRAV.push(gridSurface((u,v)=>{
     const r=lerp(22,FN.r1+8,u);
     const yBot=lerp(403,414,u),yTop=lerp(455,428,u);
     const w=(1-0.35*u)*3.8;
     /* Closed 4-face rib cross-section */
     const cIdx=Math.round(v*4);
     const ox=(cIdx===0||cIdx===3||cIdx===4)?-w:w;
     const oy=(cIdx===0||cIdx===1||cIdx===4)?yBot:yTop;
     return [FN.cx+sa*r+nx*ox,oy,FN.cz+ca*r+nz*ox];
    },8,4,{uS:4,vS:2}));
   }
  }
 }

 /* ---- 9. Excavated Rear Chambers, Hexagonal Skylight Court, Drums & Twin Transport Portals (image.png!) ---- */
 {
  /* Master Subterranean Rear Concourse Slab tying the Eye (z = -46) continuously to every Rear Court & Portal! */
  TRAV.push(slBoxGeo(-246,454.5,-242,258,464.5,-42,18));
  TRAV.push(slBoxGeo(26,462,-356,214,472.5,-236,18));

  /* 1. Concentric Horseshoe Cave-Dwelling Arcs (z = -142..-48, y = 456..504 m — image.png Plan 1 centre) */
  for(let a=0;a<4;a++){
   const rIn=48+a*12.5,rOut=rIn+9.5,yTop=474+a*7.5;
   TRAV.push(slArcRingGeo(0,-46,rIn,rOut,455.5,yTop,Math.PI*0.60,Math.PI*1.40,24,14));
   (dd?FACK:FAC).push(slArcRingGeo(0,-46,rIn-0.5,rIn+1.2,457,yTop-1.2,Math.PI*0.62,Math.PI*1.38,22,12));
  }

  /* 2. The Great Hexagonal SKYLIGHT Commercial & Promenade Court (cx = 0, cz = -205, R = 68 — image.png Plan 3!) */
  {
   const HX=D.HEX;
   PAVE.push(slPolyRingGeo(HX.cx,HX.cz,0,HX.rOuter+4,HX.y0-1.2,HX.y0+0.3,6,Math.PI/6,14));
   /* Hexagonal Mirror Basin at the centre of the Skylight Court (y = 464 m) */
   const hb=P.pools[2];
   TILE.push(slBoxGeo(hb.x0-0.5,hb.y-hb.depth-0.4,hb.z0-0.5,hb.x1+0.5,hb.y+0.1,hb.z1+0.5,5));
   /* Five stepped six-sided terraced commercial & residential rings climbing to the plateau rim (y = 563 m) */
   for(let t=0;t<HX.tiers;t++){
    const ty0=HX.y0+t*19.6,ty1=ty0+19.8;
    const rIn=28+t*8.2,rOut=HX.rOuter+10;
    TRAV.push(slPolyRingGeo(HX.cx,HX.cz,rIn,rOut,ty0-1.0,ty1,6,Math.PI/6,16));
    (dd?FACK:FAC).push(slPolyRingGeo(HX.cx,HX.cz,rIn-0.6,rIn+1.2,ty0+0.8,ty1-1.6,6,Math.PI/6,12));
    LAWN.push(slPolyRingGeo(HX.cx,HX.cz,rIn+0.8,rIn+5.5,ty1-0.1,ty1+0.45,6,Math.PI/6,10));
   }
   /* Raised Hexagonal Plateau Rim Coping Collar (y = 556..563.5 m) cleanly framing the plateau hole */
   TRAV.push(slPolyRingGeo(HX.cx,HX.cz,HX.rOuter-3,HX.rOuter+12,555,563.5,6,Math.PI/6,14));
   /* Six Cylindrical VERTICAL STRUCT Corner Drums around the Hexagon (image.png Plan 3!) */
   for(let c=0;c<6;c++){
    const ang=Math.PI/6+(c/6)*TAU;
    const dx=HX.cx+Math.cos(ang)*(HX.rOuter-2),dz=HX.cz+Math.sin(ang)*(HX.rOuter-2);
    BRONZE.push(slPolyRingGeo(dx,dz,0,HX.drumR,HX.y0,565,20,0,12));
    GLASS.push(slPolyRingGeo(dx,dz,0,HX.drumR*0.68,565,566.4,18,0,8));
   }
  }

  /* 3. West Circular RESIDENTIAL Drum & Two East Circular PUBLIC Rotunda Drums (image.png Plan 1) */
  for(const sk of P.skylights){
   if(sk.kind!=='drum')continue;
   const isDmg=dd&&sk.key==='resW';
   const dFac=isDmg?FAC:(dd?FACK:FAC);
   PAVE.push(slPolyRingGeo(sk.cx,sk.cz,0,sk.r+5,sk.y0-5,sk.y0+0.3,24,0,14));
   for(let t=0;t<4;t++){
    const ty0=sk.y0+t*23,ty1=ty0+23.4;
    const rIn=sk.rSky+t*5.2;
    TRAV.push(slPolyRingGeo(sk.cx,sk.cz,rIn,sk.r+8,ty0-1.0,ty1,24,0,14));
    dFac.push(slPolyRingGeo(sk.cx,sk.cz,rIn-0.5,rIn+1.1,ty0+0.8,ty1-1.6,24,0,12));
   }
   /* Raised plateau skylight collar ring */
   TRAV.push(slPolyRingGeo(sk.cx,sk.cz,sk.r-2,sk.r+9,555,563.2,28,0,14));
  }
  /* East Sanctuary Fountain Basin inside pubE1 */
  {
   const eb=P.pools[3];
   TILE.push(slBoxGeo(eb.x0-0.5,eb.y-eb.depth-0.4,eb.z0-0.5,eb.x1+0.5,eb.y+0.1,eb.z1+0.5,5));
  }
  /* Two North-Central Polygonal Plateau Lightwells (cx = -68, cz = -296; cx = -6, cz = -326) tied to Rear Concourse */
  for(const lw of [[-68,-296,20],[-6,-326,24]]){
   TRAV.push(slBoxGeo(lw[0]-lw[2],462,lw[1]-lw[2],lw[0]+lw[2],468,-236,16));
   TRAV.push(slPolyRingGeo(lw[0],lw[1],lw[2]-5,lw[2]+6,464,563,6,0,14));
   ROOML.push(slPolyRingGeo(lw[0],lw[1],0,lw[2]-4.5,464,468,6,0,12));
  }

  /* 4. North-East Vaulted MEETING AREAS Hypostyle Hall & Circular Council Drum (image.png Plan 1 top-right!) */
  {
   const MH=P.skylights.find(s=>s.key==='meeting'),CD=MH.council;
   PAVE.push(slBoxGeo(MH.x0-4,MH.y0-2,MH.z0-4,MH.x1+4,MH.y0+0.4,MH.z1+4,14));
   /* Containment skylight walls + plateau rim collar */
   TRAV.push(slBoxGeo(MH.x0-6,MH.y0,MH.z0-6,MH.x0+2,563.5,MH.z1+6,16));
   TRAV.push(slBoxGeo(MH.x1-2,MH.y0,MH.z0-6,MH.x1+6,563.5,MH.z1+6,16));
   TRAV.push(slBoxGeo(MH.x0-6,MH.y0,MH.z0-6,MH.x1+6,563.5,MH.z0+2,16));
   TRAV.push(slBoxGeo(MH.x0-6,MH.y0,MH.z1-2,MH.x1+6,563.5,MH.z1+6,16));
   /* Hypostyle grid of monumental columns supporting three scalloped skylight shell domes! */
   for(let ix=0;ix<4;ix++)for(let iz=0;iz<2;iz++){
    const cx=MH.x0+24+ix*34,cz=MH.z0+22+iz*34;
    TRAV.push(slBoxGeo(cx-2.4,MH.y0,cz-2.4,cx+2.4,556,cz+2.4,12));
   }
   /* Vaulted roof shell pierced by central skylight oculus */
   TRAV.push(slBoxGeo(MH.x0-4,554,MH.z0-4,MH.x1+4,562,MH.z0+22,14));
   TRAV.push(slBoxGeo(MH.x0-4,554,MH.z1-22,MH.x1+4,562,MH.z1+4,14));
   ROOML.push(slBoxGeo(MH.x0+4,MH.y0+0.3,MH.z0+4,MH.x1-4,MH.y0+12,MH.z1-4,14));
   /* Adjacent NE Circular Council Drum (cx = 198, cz = -308, r = 22) */
   TRAV.push(slPolyRingGeo(CD.cx,CD.cz,14,CD.r+6,MH.y0-2,563.8,20,0,14));
   PAVE.push(slPolyRingGeo(CD.cx,CD.cz,0,CD.r+4,MH.y0-2,MH.y0+0.5,20,0,12));
  }

  /* 5. Twin Diagonal INTER-CITY TRANSPORTATION Guideway Portals (image.png Plan 1 top-left!) */
  {
   for(const pt of P.portals){
    const ax=pt.from[0],az=pt.from[1],bx=pt.to[0],bz=pt.to[1];
    const dx=bx-ax,dz=bz-az,L=Math.hypot(dx,dz);
    const ux=dx/L,uz=dz/L,nx=-uz,nz=ux,hw=pt.w*0.5;
    /* Sloped concrete railbed descending from plateau (y = 556 at outer NW) down into transit hub (y = 476 at SE) */
    PAVE.push(gridSurface((u,v)=>{
     const cx=lerp(ax,bx,u),cz=lerp(az,bz,u);
     const y=lerp(pt.y0,556,Math.pow(u,0.85));
     const off=(v-0.5)*(pt.w+8);
     return [cx+nx*off,y,cz+nz*off];
    },24,2,{uS:18,vS:2}));
    /* Monolithic side retaining walls + wide plateau rim curb flange covering grid-hole sawtooth edges! */
    for(const sd of [-1,1]){
     TRAV.push(gridSurface((u,v)=>{
      const cx=lerp(ax,bx,u),cz=lerp(az,bz,u);
      const yBot=lerp(pt.y0-4,552,Math.pow(u,0.85));
      const off=sd*(hw+2.2);
      return [cx+nx*off,lerp(yBot,563.2,v),cz+nz*off];
     },24,2,{uS:18,vS:4}));
     TRAV.push(gridSurface((u,v)=>{
      const cx=lerp(ax-ux*14,bx+ux*14,u),cz=lerp(az-uz*14,bz+uz*14,u);
      const off=sd*lerp(hw+1.5,hw+26,v);
      const px=cx+nx*off,pz=cz+nz*off;
      return [px,SLICE.platY(px,pz,dd)+0.5*(1-v*0.4),pz];
     },26,2,{uS:18,vS:2}));
    }
    /* Brutalist portal hood over the deep rock-tunnel mouth (u = 0..0.24) + 6 transverse arch ribs */
    TRAV.push(gridSurface((u,v)=>{
     const t=u*0.24,cx=lerp(ax,bx,t),cz=lerp(az,bz,t);
     const off=(v-0.5)*(pt.w+8);
     const arch=6*Math.sin(v*Math.PI);
     return [cx+nx*off,558+arch,cz+nz*off];
    },6,6,{uS:6,vS:3}));
    DARK.push(gridSurface((u,v)=>{
     const cx=lerp(ax,bx,u),cz=lerp(az,bz,u);
     const y=lerp(pt.y0+0.4,556.4,Math.pow(u,0.85));
     const off=(v-0.5)*3.2;
     return [cx+nx*off,y,cz+nz*off];
    },24,2,{uS:18,vS:1}));
   }
   /* Tie slab connecting the SE mouth of both portals cleanly into the West Drum & Rear Concourse */
   TRAV.push(slBoxGeo(-252,462,-212,-188,482,-158,16));
  }
 }

 /* ---- 10. Merge All Accumulated Surfaces per Material (minimal draw calls!) ---- */
 meshMerged(COLROCK,MAT.slColRock,G);
 meshMerged(STRATROCK,MAT.slStratRock,G);
 meshMerged(CAVESHADE,MAT.slCaveShade,G);
 meshMerged(TOP,MAT.slTop,G);
 meshMerged(BED,MAT.slBed,G);
 meshMerged(TRAV,travM,G);
 meshMerged(UNDER,underM,G);
 meshMerged(COFFER,MAT.slGoldCoffer,G);
 meshMerged(BRONZE,bronzeM,G);
 meshMerged(TILE,MAT.slTile,G);
 meshMerged(PAVE,MAT.slPave,G);
 meshMerged(LAWN,lawnM,G);
 meshMerged(FAC,dd?MAT.slFacadeR:MAT.slFacade,G);
 meshMerged(FACK,MAT.slFacadeKeep,G);
 meshMerged(ROOML,MAT.slRoomLit,G);
 meshMerged(ROOMD,MAT.slRoomDim,G);
 meshMerged(DARK,MAT.slDarkSteel,G);
 meshMerged(GLOW,MAT.slIndGlow,G);
 meshMerged(GLASS,MAT.glass,G);

 /* ---- 11. Dress from SLICE.dress Records (Trees, Lamps, Boats, Citizens) ---- */
 for(const dr of DR){
  const p=dr.at;
  if(dr.kind==='tree'){
   VEG.tree(p[0],p[1],p[2],dr.sp,dr.h);
  }else if(dr.kind==='lamp'){
   /* Mounted directly on the Promenade parapet (y = 457.5, touching within 0.1 m) */
   const zLip=SLICE.eyeLipZ(p[0])+1.8;
   kput(dr.lit?'slLampOn':'slLampDead',[p[0],457.8,zLip],null,[1,1,1],null);
  }else if(dr.kind==='boat'){
   kput('slBoat',p,qEuler(0,dr.ry,0),[1.3,1,1.15],new THREE.Color(0x9a6d45));
  }else if(dr.kind==='figure'){
   kput('figB',p,qEuler(0,dr.ry,0),1,new THREE.Color(0xc4704c));
   kput('figH',p,null,1,new THREE.Color(0xd2a885));
  }
 }

 /* ---- 12. Ruin Pass: Physically Seated Fallen Wrecks & Basalt Talus (d = 1) ---- */
 if(dd&&RU){
  /* Seat each fallen wreck cleanly on the West Stratified Bench (y ~ 220) or Gorge Shore (y ~ 8..10)
     so box.min.y lies in [gUnder - 0.35, gUnder - 0.08] (strictly inside KRUINS [-0.5, +0.1]) */
  const slVertexBox=grp=>{
   const bx=new THREE.Box3(),vv=new THREE.Vector3();
   grp.updateMatrixWorld(true);
   grp.traverse(m=>{
    if(!m.isMesh||!m.geometry||!m.geometry.attributes.position)return;
    const pos=m.geometry.attributes.position;
    for(let i=0;i<pos.count;i++){vv.fromBufferAttribute(pos,i).applyMatrix4(m.matrixWorld);bx.expandByPoint(vv);}
   });
   return bx;
  };
  for(const wr of RU.wrecks){
   const wg=new THREE.Group();
   wg.name=wr.id;
   if(wr.kind==='basalt_col'){
    const colG=lathe({rFn:()=>wr.r,H:wr.h,flutes:6,amp:0.06,sharp:2.2,nu:12,nv:4});
    colG.translate(0,-wr.h*0.5,0);
    mesh(colG,MAT.slTravR,wg,0,0,0);
   }else if(wr.kind==='slot_truss'){
    mesh(slBoxGeo(-wr.w*0.5,-wr.h*0.5,-wr.d*0.5,wr.w*0.5,wr.h*0.5,wr.d*0.5,10),MAT.slBronzeR,wg,0,0,0);
   }else{
    mesh(slBoxGeo(-wr.w*0.5,-wr.h*0.5,-wr.d*0.5,wr.w*0.5,wr.h*0.5,wr.d*0.5,10),MAT.slTravR,wg,0,0,0);
   }
   wg.position.set(wr.x,250,wr.z);
   wg.rotation.set(wr.tilt,wr.yaw,wr.jitter);
   const bb=slVertexBox(wg);
   wg.position.x+=wr.x-(bb.min.x+bb.max.x)*0.5;
   wg.position.z+=wr.z-(bb.min.z+bb.max.z)*0.5;
   const bb2=slVertexBox(wg);
   const gMin=Math.min(
    SLICE.groundY((bb2.min.x+bb2.max.x)*0.5,(bb2.min.z+bb2.max.z)*0.5,1),
    SLICE.groundY(bb2.min.x,bb2.min.z,1),
    SLICE.groundY(bb2.max.x,bb2.max.z,1),
    SLICE.groundY(bb2.min.x,bb2.max.z,1),
    SLICE.groundY(bb2.max.x,bb2.min.z,1)
   );
   wg.position.y+=gMin-0.22-bb2.min.y;
   G.add(wg);
  }
  /* Scatter fallen columnar rock & concrete rubble on the West Bench & Shore (KRUINS.DECOR skips 'rubble' & 'vine') */
  for(let i=0;i<75;i++){
   const onBench=i<45;
   const rx=onBench?(-275+SLICE.u(12420,901,i,0)*155):(-195+SLICE.u(12420,901,i,1)*320);
   const rz=onBench?(32+SLICE.u(12420,902,i,0)*135):(190+SLICE.u(12420,902,i,1)*22);
   const ry=SLICE.groundY(rx,rz,1);
   const sc=2.0+SLICE.u(12420,903,i,0)*5.5;
   kput('rubble',[rx,ry+sc*0.32,rz],qEuler(i*0.7,i*1.3,i*0.4),[sc*1.3,sc*0.8,sc*1.1],new THREE.Color(0xa68c74));
  }
  for(let i=0;i<55;i++){
   const vx=-180+SLICE.u(12420,910,i,0)*360;
   const vz=SLICE.eyeLipZ(vx)+1.6;
   kput('vine',[vx,454.5,vz],qEuler(0,i,0),[1.5,9+16*SLICE.u(12420,911,i,0),1.5],null);
  }
 }

 /* Register site metadata for 8av2-slice-water.js and 91z-views.js */
 SLWATER.addSite(d,P,RU,gx,gz);
 SL_SITE[d]={x:gx,z:gz,d:d,plan:P,ruin:RU,modern:MG};

 TICKS.push(function slBoatDecor(){
  if(KIT&&KIT.meshes&&KIT.meshes.slBoat)KIT.meshes.slBoat.userData.decor=true;
 });

 KOFF=[0,0,0];
 return G;
}
