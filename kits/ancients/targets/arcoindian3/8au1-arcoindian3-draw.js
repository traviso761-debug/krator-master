// ================================================================= ARCOINDIAN III — the drawing (records in, geometry out)  [draw]
// Draws ARCO3.plan() intact (d = 0) and ruined (d = 1, with ARCO3.ruin deltas), registering every building, structural
// part, interior program unit, tree, boat and citizen in core/tags (KTAGS.arcoindian3) before emitting geometry.

const A3_SITE={};

/* ---- Bespoke Procedural Textures (canvasTex + createImageData, deterministic on h3/fbm) ---- */
TEX.a3Rock=canvasTex(512,512,(g,w,h)=>{
 const id=g.createImageData(w,h),D=id.data;
 const NC=12,CB=[0];
 {
  const th=[];let s=0;
  for(let i=0;i<NC;i++){const t=0.55+h3(i,4.1,8.7)*1.25;th.push(t);s+=t;}
  for(let i=0;i<NC;i++)CB.push(CB[i]+th[i]/s*h);
 }
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const i=(y*w+x)*4,fx=x/w,fy=y/h;
  const yw=((y+8*(fbm(fx*4,fy*2,4.3,2)-0.5)+h)%h);
  let c=0;while(c<NC-1&&CB[c+1]<=yw)c++;
  const c0=CB[c],c1=CB[c+1],ty=(yw-c0)/(c1-c0);
  const nj=3+Math.floor(h3(c,7.2,1.9)*4);let jd=1e9,blk=0;
  for(let j=0;j<nj;j++){
   const jx=h3(c,j,5.1)*w+(ty-0.5)*(c1-c0)*0.24;
   let dx=x-jx;dx-=Math.round(dx/w)*w;
   const ad=Math.abs(dx);if(ad<jd)jd=ad;if(dx>0)blk+=1<<j;
  }
  let v=0.74+(h3(c,2.1,3.7)-0.5)*0.11+(h3(c,blk,6.2)-0.5)*0.09;
  v+=(fbm(fx*5,fy*5,5.8,3)-0.5)*0.22+(fbm(fx*18,fy*18,6.9,2)-0.5)*0.09;
  if(yw-c0<1.4)v-=0.18;else if(yw-c0<3.2)v+=0.06;
  if(jd<1.1)v-=0.19;
  const st=fbm(fx*34,fy*1.6,8.4,2);
  if(st>0.58)v-=(st-0.58)*0.85*(1-ty);
  const r=clamp(v,0,1);
  D[i]=r*244;D[i+1]=r*212;D[i+2]=r*184;D[i+3]=255;
 }
 g.putImageData(id,0,0);
});

TEX.a3Top=canvasTex(256,256,(g,w,h)=>{
 const id=g.createImageData(w,h),D=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const i=(y*w+x)*4;
  const m1=fbm(x/26,y/26,3.7,3),m2=fbm(x/7,y/7,9.1,2);
  let v=0.72+(m1-0.5)*0.28+(m2-0.5)*0.12+(h3(x,y,2.5)-0.5)*0.05;
  if(m1<0.42&&h3(x*0.33,y*0.47,7.4)<0.12)v-=0.24;
  const r=clamp(v,0,1);
  D[i]=r*236;D[i+1]=r*206;D[i+2]=r*178;D[i+3]=255;
 }
 g.putImageData(id,0,0);
});

/* Reference 1: Warm sand-travertine architectural concrete */
function a3TravTex(dec){
 return canvasTex(512,512,(g,w,h)=>{
  const id=g.createImageData(w,h),D=id.data;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   const i=(y*w+x)*4;
   let v=214+(fbm(x/56,y/56,3.1,3)-0.5)*20+(fbm(x/10,y/10,5.4,2)-0.5)*10;
   if(y%32<1)v-=12;else if(y%32<3)v+=5;
   if(x%96<1)v-=9;
   if(dec){
    const st=fbm(x/8,y/130,7.2,3);
    v=v*0.84-Math.max(0,st-0.46)*135;
   }
   D[i]=clamp(v+5,0,255);D[i+1]=clamp(v-1,0,255);D[i+2]=clamp(v-9,0,255);D[i+3]=255;
  }
  g.putImageData(id,0,0);
 });
}

/* Reference 3: Sun-baked board-formed sandstone concrete (subtle warm earth blush within the same stone family) */
function a3TerraTex(dec){
 return canvasTex(512,512,(g,w,h)=>{
  const id=g.createImageData(w,h),D=id.data;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   const i=(y*w+x)*4;
   const wash=fbm(x/38,y/68,11.3,3),streak=fbm(x/6,y/90,14.7,2),grain=fbm(x/8,y/8,4.2,2);
   let v=212+(wash-0.5)*28+(streak-0.5)*18+(grain-0.5)*10;
   if(x%24<1)v-=7;
   if(y%64<2)v-=10;
   if(dec)v=v*0.82-Math.max(0,streak-0.48)*115;
   D[i]=clamp(v+7,0,255);D[i+1]=clamp(v-1,0,255);D[i+2]=clamp(v-9,0,255);D[i+3]=255;
  }
  g.putImageData(id,0,0);
 });
}

/* Reference 2: Carved sand-travertine fluted rib texture */
function a3FluteTex(dec){
 return canvasTex(256,256,(g,w,h)=>{
  const id=g.createImageData(w,h),D=id.data;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   const i=(y*w+x)*4;
   const rib=0.5+0.5*Math.cos((x/w)*TAU*8);
   let v=198+rib*24+(fbm(x/12,y/48,6.5,3)-0.5)*20;
   if(y%42<1)v-=12;
   if(dec)v=v*0.82-Math.max(0,fbm(x/9,y/80,9.4,2)-0.5)*90;
   D[i]=clamp(v+6,0,255);D[i+1]=clamp(v-1,0,255);D[i+2]=clamp(v-9,0,255);D[i+3]=255;
  }
  g.putImageData(id,0,0);
 });
}

/* Reference 3: Glazed emerald-jade ceramic mosaic tile for the plunge & reflecting pools */
TEX.a3Tile=canvasTex(256,256,(g,w,h)=>{
 const id=g.createImageData(w,h),D=id.data;
 const ts=8;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const i=(y*w+x)*4,tx=Math.floor(x/ts),ty=Math.floor(y/ts),lx=x%ts,ly=y%ts;
  const grout=(lx===0||ly===0);
  if(grout){
   D[i]=158;D[i+1]=178;D[i+2]=162;D[i+3]=255;
  }else{
   const h1=h3(tx,ty,3.3),h2=h3(tx*1.7,ty*2.3,7.1),m=fbm(x/36,y/36,2.2,2);
   const r=34+h1*26+m*18,gg=108+h1*48+h2*22+m*24,b=82+h2*34+m*16;
   D[i]=clamp(r,0,255);D[i+1]=clamp(gg,0,255);D[i+2]=clamp(b,0,255);D[i+3]=255;
  }
 }
 g.putImageData(id,0,0);
});

/* Multi-storey glazed curtain & residential window atlas with warm sandstone spandrel bands */
function a3WinCell(ci,cj){
 const lot=h3(ci*3.7,cj*5.3,4.1);
 return {lit:lot>=0.16&&lot<0.42,warm:h3(ci*1.9,cj*2.7,8.3)};
}
function a3WinTex(dec){
 return canvasTex(512,512,(g,w,h)=>{
  const id=g.createImageData(w,h),D=id.data;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   const i=(y*w+x)*4,ci=Math.floor(x/64),cj=Math.floor(y/64),cx=x%64,cy=y%64;
   const C=a3WinCell(ci,cj),n=(fbm(x/14,y/14,2.9,2)-0.5)*12;
   const frame=(cx<7||cx>56||cy<9||cy>53||(cx===31||cx===32));
   let r,gg,b;
   if(frame){
    const v=dec?132+n:194+n;r=v+6;gg=v-2;b=v-16;
   }else if(dec){
    const broken=h3(ci*2.3,cj*4.7,1.5)<0.45;
    r=broken?58+n:38+n;gg=broken?52+n:40+n;b=broken?44+n:42+n;
   }else if(C.lit){
    const f=0.68+0.32*C.warm,band=(cy>38)?0.82:1.0;
    r=178*f*band;gg=142*f*band;b=96*f*band;
   }else{
    const sky=Math.max(0,1-cy/48);
    r=38+sky*28+n*0.4;gg=44+sky*32+n*0.4;b=46+sky*36+n*0.4;
   }
   D[i]=clamp(r,0,255);D[i+1]=clamp(gg,0,255);D[i+2]=clamp(b,0,255);D[i+3]=255;
  }
  g.putImageData(id,0,0);
 });
}
function a3WinEmissive(){
 return canvasTex(256,256,(g,w,h)=>{
  const id=g.createImageData(w,h),D=id.data;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   const i=(y*w+x)*4,X=x*2,Y=y*2,ci=Math.floor(X/64),cj=Math.floor(Y/64),cx=X%64,cy=Y%64;
   const C=a3WinCell(ci,cj);
   const frame=(cx<7||cx>56||cy<9||cy>53||(cx===31||cx===32));
   const a=(C.lit&&!frame)?(0.55+0.45*C.warm):0;
   D[i]=232*a;D[i+1]=168*a;D[i+2]=96*a;D[i+3]=255;
  }
  g.putImageData(id,0,0);
 });
}

TEX.a3Trav=a3TravTex(0);TEX.a3TravR=a3TravTex(1);
TEX.a3Terra=a3TerraTex(0);TEX.a3TerraR=a3TerraTex(1);
TEX.a3Flute=a3FluteTex(0);TEX.a3FluteR=a3FluteTex(1);
TEX.a3Win=a3WinTex(0);TEX.a3WinR=a3WinTex(1);TEX.a3WinE=a3WinEmissive();

MAT.a3Rock=new THREE.MeshStandardMaterial({map:TEX.a3Rock,color:0x9c7258,roughness:0.98,metalness:0,side:DS});
MAT.a3Shade=new THREE.MeshStandardMaterial({map:TEX.a3Rock,color:0x5c4031,roughness:1,metalness:0,side:DS});
MAT.a3Top=new THREE.MeshStandardMaterial({map:TEX.a3Top,color:0xa2795f,roughness:1,metalness:0,side:DS});
MAT.a3Bed=new THREE.MeshStandardMaterial({map:TEX.a3Top,color:0x6e5c4e,roughness:0.96,metalness:0,side:DS});

MAT.a3Trav=new THREE.MeshStandardMaterial({map:TEX.a3Trav,roughnessMap:TEX.concreteRM,color:0xcfbba2,roughness:0.92,metalness:0,side:DS});
MAT.a3TravR=new THREE.MeshStandardMaterial({map:TEX.a3TravR,roughnessMap:TEX.concreteRM,color:0x8e7f6d,roughness:0.98,metalness:0,side:DS});
MAT.a3Soff=new THREE.MeshStandardMaterial({map:TEX.a3Trav,roughnessMap:TEX.concreteRM,color:0x7c6d5b,emissive:0x211b15,emissiveMap:TEX.a3Trav,roughness:0.95,metalness:0,side:DS});

MAT.a3Terra=new THREE.MeshStandardMaterial({map:TEX.a3Terra,roughnessMap:TEX.concreteRM,color:0xc7ad93,roughness:0.90,metalness:0,side:DS});
MAT.a3TerraR=new THREE.MeshStandardMaterial({map:TEX.a3TerraR,roughnessMap:TEX.concreteRM,color:0x897663,roughness:0.96,metalness:0,side:DS});
MAT.a3TerraSoff=new THREE.MeshStandardMaterial({map:TEX.a3Terra,color:0x786553,emissive:0x221b15,emissiveMap:TEX.a3Terra,roughness:0.92,metalness:0,side:DS});

MAT.a3Flute=new THREE.MeshStandardMaterial({map:TEX.a3Flute,roughnessMap:TEX.concreteRM,color:0xcab398,roughness:0.84,metalness:0.04,side:DS});
MAT.a3FluteR=new THREE.MeshStandardMaterial({map:TEX.a3FluteR,roughnessMap:TEX.concreteRM,color:0x8b7a67,roughness:0.94,metalness:0.03,side:DS});

MAT.a3Tile=new THREE.MeshStandardMaterial({map:TEX.a3Tile,color:0x8ee0c4,roughness:0.24,metalness:0.06,side:DS});
MAT.a3TileDry=new THREE.MeshStandardMaterial({map:TEX.a3Tile,color:0x6d7d72,roughness:0.82,metalness:0,side:DS});
MAT.a3Pave=new THREE.MeshStandardMaterial({map:TEX.a3Trav,color:0xccb79e,roughness:0.88,metalness:0,side:DS});
MAT.a3Lawn=new THREE.MeshStandardMaterial({map:TEX.a3Top,color:0x567d3c,roughness:0.95,metalness:0,side:DS});
MAT.a3LawnR=new THREE.MeshStandardMaterial({map:TEX.a3Top,color:0x667844,roughness:0.98,metalness:0,side:DS});

MAT.a3Facade=new THREE.MeshStandardMaterial({map:TEX.a3Win,emissive:0xffffff,emissiveMap:TEX.a3WinE,emissiveIntensity:0.42,roughness:0.48,metalness:0.18,side:DS});
MAT.a3FacadeKeep=new THREE.MeshStandardMaterial({map:TEX.a3WinR,emissive:0xffcf8a,emissiveMap:TEX.a3WinE,emissiveIntensity:0.24,roughness:0.68,metalness:0.14,side:DS});
MAT.a3FacadeR=new THREE.MeshStandardMaterial({map:TEX.a3WinR,roughness:0.78,metalness:0.12,side:DS});

/* Warm lit interior room plaster (NO DARK VOIDS: rooms behind arches, oculi and glass are warm and readable) */
MAT.a3RoomLit=new THREE.MeshStandardMaterial({map:TEX.a3Terra,color:0xc4a484,emissive:0x4d311a,emissiveIntensity:0.45,roughness:0.88,metalness:0,side:DS});
MAT.a3RoomDim=new THREE.MeshStandardMaterial({map:TEX.a3TravR,color:0x786858,roughness:0.94,metalness:0,side:DS});
MAT.a3DarkFrame=new THREE.MeshStandardMaterial({color:0x232629,roughness:0.42,metalness:0.55,side:DS});
/* Deep smoked obsidian-bronze architectural glass for the Barrel Vault and curved tower scoops (Ref 1 & Ref 2) */
MAT.a3SmokeGlass=new THREE.MeshStandardMaterial({color:0x121c22,transparent:true,opacity:0.76,metalness:0.35,roughness:0.08,emissive:0x0a1218,emissiveIntensity:0.32,side:DS,depthWrite:false});
MAT.a3SmokeGlass.onBeforeCompile=MAT.glass.onBeforeCompile;
MAT.a3SconceLit=new THREE.MeshStandardMaterial({color:0xffdf9e,emissive:0xffa84c,emissiveIntensity:1.35,roughness:0.3,metalness:0.2});
MAT.a3SconceOff=new THREE.MeshStandardMaterial({color:0x59483c,roughness:0.75,metalness:0.4});

kdef('a3TravBox',new THREE.BoxGeometry(1,1,1),MAT.a3Trav);
kdef('a3TerraBox',new THREE.BoxGeometry(1,1,1),MAT.a3Terra);
kdef('a3DarkBar',new THREE.BoxGeometry(1,1,1),MAT.a3DarkFrame);
kdef('a3GlassPane',new THREE.BoxGeometry(1,1,0.25),MAT.a3SmokeGlass);
kdef('a3SconceOn',new THREE.TorusGeometry(0.95,0.22,8,20),MAT.a3SconceLit);
kdef('a3SconceDead',new THREE.TorusGeometry(0.95,0.22,8,20),MAT.a3SconceOff);
kdef('a3Boat',(function(){
 const s=new THREE.Shape();
 s.moveTo(-4.5,0);s.quadraticCurveTo(0,1.6,4.5,0);s.quadraticCurveTo(0,-1.6,-4.5,0);
 const g=new THREE.ExtrudeGeometry(s,{depth:1.1,bevelEnabled:false});
 g.rotateX(-Math.PI/2);return g;
})(),MAT.a3Flute);

/* ---- Geometry Builders for Merged Buffers ---- */
function a3BoxGeo(x0,y0,z0,x1,y1,z1,uvScale){
 const w=x1-x0,h=y1-y0,d=z1-z0,k=uvScale==null?16:uvScale;
 const g=new THREE.BoxGeometry(w,h,d);
 const uv=g.attributes.uv,nrm=g.attributes.normal;
 for(let i=0;i<uv.count;i++){
  const nx=Math.abs(nrm.getX(i)),ny=Math.abs(nrm.getY(i));
  const su=nx>0.5?d:(w);
  const sv=ny>0.5?d:(h);
  uv.setXY(i,uv.getX(i)*su/k,uv.getY(i)*sv/k);
 }
 g.translate((x0+x1)*0.5,(y0+y1)*0.5,(z0+z1)*0.5);
 return g;
}

function a3WorldUV(geo,scale){
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

/* Wall in XY plane [x0..x1, y0..y1] extruded from z0 to z1: bottom-reaching semicircular arches are walked directly
   along the bottom contour (zero hole-winding ambiguity!), and upper circular moon-gates are CW holes */
function a3PiercedWallGeo(x0,x1,y0,y1,z0,z1,arches,circles,uvScale){
 const s=new THREE.Shape();
 s.moveTo(x0,y0);
 if(arches&&arches.length){
  const sorted=arches.slice().sort((a,b)=>a.cx-b.cx);
  for(const a of sorted){
   const hw=a.w*0.5,sy=a.springY;
   s.lineTo(a.cx-hw,y0);
   s.lineTo(a.cx-hw,sy);
   s.absarc(a.cx,sy,hw,Math.PI,0,true);
   s.lineTo(a.cx+hw,y0);
  }
 }
 s.lineTo(x1,y0);s.lineTo(x1,y1);s.lineTo(x0,y1);s.closePath();
 if(circles){
  for(const c of circles){
   const p=new THREE.Path();
   p.absarc(c.cx,c.cy,c.r,0,Math.PI*2,true);
   s.holes.push(p);
  }
 }
 const dep=z1-z0;
 const g=new THREE.ExtrudeGeometry(s,{depth:dep,bevelEnabled:false,curveSegments:26});
 g.translate(0,0,z0);
 g.computeVertexNormals();
 return a3WorldUV(g,uvScale==null?16:uvScale);
}

/* Horizontal slab [x0..x1, z0..z1] from y0 to y1 with optional circular skylight holes */
function a3PiercedSlabGeo(x0,x1,z0,z1,y0,y1,holes,uvScale){
 const s=new THREE.Shape();
 s.moveTo(x0,-z1);s.lineTo(x1,-z1);s.lineTo(x1,-z0);s.lineTo(x0,-z0);s.closePath();
 if(holes){
  for(const h of holes){
   const p=new THREE.Path();
   p.absarc(h.cx,-h.cz,h.r,0,Math.PI*2,true);
   s.holes.push(p);
  }
 }
 const g=new THREE.ExtrudeGeometry(s,{depth:y1-y0,bevelEnabled:false,curveSegments:20});
 g.rotateX(-Math.PI/2);
 g.translate(0,y0,0);
 g.computeVertexNormals();
 return a3WorldUV(g,uvScale==null?14:uvScale);
}

/* ---- Main Builder ---- */
function buildArcoindian3(scene,gx,gz,d){reseed(12430+d);KOFF=[gx,0,gz];
 if(typeof camera!=='undefined'&&camera.far<30000){camera.far=30000;camera.updateProjectionMatrix();}
 if(typeof sky!=='undefined')sky.renderOrder=-1;
 if(typeof skyMat!=='undefined'&&skyMat.fragmentShader.indexOf('pow(h,.55)')>=0){
  skyMat.fragmentShader=skyMat.fragmentShader.replace('pow(h,.55)','pow(max(h,0.),.55)');
  skyMat.needsUpdate=true;
 }

 const dd=d>0?1:0;
 const P=ARCO3.plan({seed:12400});
 const RU=dd?ARCO3.ruin(P):null;
 const MG=ARCO3.modernGuide(P,RU);
 const DR=ARCO3.dress(P,RU);
 const D=P.dim;

 const G=new THREE.Group();
 G.position.set(gx,0,gz);
 scene.add(G);

 /* ---- 1. Register every placed record in core/tags BEFORE drawing ---- */
 {
  const T=KTAGS.arcoindian3||(KTAGS.arcoindian3=KTAGS.create({build:'ancients-arcoindian3'}));
  const pre=(dd?'ruin':'intact')+'/';
  const W=a=>[a[0]+gx,a[1],a[2]+gz];
  const st=dd?'ruined':'intact';
  const B=T.add({
   id:pre+P.id,'class':'building',kind:'arcology',key:'ancients:arcoindian3',
   name:'Arcoindian III',at:[gx,0,gz],r:340,h:P.stats.height,
   tags:{culture:'ancient',types:['dwelling-multi','civic','market','infrastructure'],state:st,landmark:true}
  });
  const part=(id,kind,name,at,o)=>T.child(B.id,Object.assign({'class':'part',kind:kind,key:id,name:name,at:W(at),tags:{style:st}},o||{}));
  part(P.quay.id,'quay',P.quay.name,[0,7,132],{size:[D.QUAY.w,14,72]});
  part(P.vault.id,'vault',P.vault.name,[0,D.VAULT.y0,-144],{size:[D.VAULT.w,D.VAULT.y1-D.VAULT.y0,152]});
  for(const tr of P.terraces)part(tr.id,'terrace',tr.name,[0,tr.y0,(tr.z0+tr.z1)*0.5],{size:[tr.x1-tr.x0,tr.y1-tr.y0,tr.z1-tr.z0]});
  for(const tw of P.towers){
   const cutY=RU&&RU.towerCuts[tw.id];
   part(tw.id,'tower',tw.name,[tw.cx,tw.y0,tw.cz],{r:tw.r,h:(cutY==null?tw.y1:cutY)-tw.y0});
  }
  const goneBr=new Set(RU?RU.goneBridges:[]);
  for(const br of P.bridges){
   if(goneBr.has(br.id))continue;
   part(br.id,'bridge',br.name,[(br.from[0]+br.to[0])*0.5,br.y,(br.from[2]+br.to[2])*0.5],{r:60,h:br.archDrop});
  }
  for(const ct of P.courts)part(ct.id,'court',ct.name,[(ct.x0+ct.x1)*0.5,ct.y0,(ct.z0+ct.z1)*0.5],{size:[ct.x1-ct.x0,ct.wallH,ct.z1-ct.z0]});
  /* Register interior program units (Work, Live, Recreation, Civic) */
  for(const u of P.program){
   const ux=u.shape==='circle'?u.cx:(u.x0+u.x1)*0.5;
   const uz=u.shape==='circle'?u.cz:(u.z0+u.z1)*0.5;
   T.child(B.id,{'class':'part',kind:'interior-'+u.category,key:pre+u.id,name:u.name,at:W([ux,u.y0,uz]),
    h:u.y1-u.y0,tags:{category:u.category,role:u.kind,capacity:u.capacity,jobs:u.jobs}});
  }
  for(const dr of DR){
   if(dr.kind==='tree'||dr.kind==='vine')T.child(B.id,{'class':'flora',kind:dr.kind,key:pre+dr.id,at:W(dr.at)});
   else if(dr.kind==='figure')T.child(B.id,{'class':'life',kind:'person',key:pre+dr.id,at:W(dr.at),ry:dr.ry});
   else T.child(B.id,{'class':'prop',kind:dr.kind,key:pre+dr.id,at:W(dr.at)});
  }
  if(RU){
   for(const wr of RU.wrecks)T.child(B.id,{'class':'part',kind:'wreck',key:pre+wr.id,at:W([wr.x,8,wr.z]),tags:{style:'ruined'}});
  }
 }

 /* ---- 2. Inspector Registry Volumes (all verified non-empty) ---- */
 const sLbl=' ('+STATE(d)+')';
 REGISTER({name:'Arcoindian III — the cliff-niche arcology'+sLbl,x:0,z:-20,r:330,y:0,h:536});
 REGISTER({name:'The Great Barrel-Vault Conservatory'+sLbl,x:0,z:-144,r:82,y:360,h:142});
 REGISTER({name:'The Six Semicircular-Arch Spine Terraces'+sLbl,x:0,z:18,r:92,y:12,h:356});
 REGISTER({name:'West Fluted Chalice Towers and Groves'+sLbl,x:-190,z:-10,r:108,y:0,h:520});
 REGISTER({name:'East Fluted Chalice Towers and Groves'+sLbl,x:192,z:-12,r:108,y:0,h:532});
 REGISTER({name:'The High Forest Arch Skybridge'+sLbl,x:0,z:-157,r:130,y:458,h:58});
 REGISTER({name:'West Terracotta Oculus and Emerald Pool Courts'+sLbl,x:-132,z:12,r:82,y:12,h:335});
 REGISTER({name:'East Terracotta Oculus and Emerald Pool Courts'+sLbl,x:132,z:12,r:82,y:12,h:335});
 REGISTER({name:'Gorge River Quay and Water Gate'+sLbl,x:0,z:138,r:215,y:0,h:28});
 if(dd)REGISTER({name:'West Brow Rockfall and Fallen Fluted Drums',x:-180,z:134,r:110,y:0,h:32});

 /* ---- 3. Merge Accumulators by Material ---- */
 const ROCK=[],SHADE=[],TOP=[],BED=[];
 const TRAV=[],SOFF=[],TERRA=[],TERRASOFF=[],FLUTE=[],TILE=[],TILED=[],PAVE=[],LAWN=[];
 const FAC=[],FACK=[],ROOML=[],ROOMD=[],GLASS=[],DARK=[];

 const travM=dd?MAT.a3TravR:MAT.a3Trav;
 const terraM=dd?MAT.a3TerraR:MAT.a3Terra;
 const fluteM=dd?MAT.a3FluteR:MAT.a3Flute;
 const lawnM=dd?MAT.a3LawnR:MAT.a3Lawn;
 const travCol=new THREE.Color(dd?0xa69888:0xffffff);
 const terraCol=new THREE.Color(dd?0xa39585:0xffffff);
 const darkCol=new THREE.Color(0x25282c);

 /* ---- 4. Sheer Canyon Cliff, Horseshoe Niche, Plateau, Gorge Bed & Far Canyon Wall ---- */
 /* Outer escarpment flanks + central horseshoe amphitheatre */
 ROCK.push(gridSurface((u,v)=>{
  const x=lerp(D.XW,D.XE,u),top=ARCO3.ctop(x),y=v*top;
  return [x,y,ARCO3.cliffZ(x,y,dd)];
 },156,56,{uS:32,vS:8,hole:(u,v)=>{
  const x=lerp(D.XW,D.XE,u);
  return Math.abs(x)<305&&v<0.92;
 }}));
 /* Shaded sheer amphitheatre back-wall inside the horseshoe cut */
 SHADE.push(gridSurface((u,v)=>{
  const x=lerp(-318,318,u),top=ARCO3.ctop(x),y=v*top;
  return [x,y,ARCO3.cliffZ(x,y,dd)];
 },92,52,{uS:10,vS:8}));
 /* Caprock plateau behind the sheer cliff lip */
 TOP.push(gridSurface((u,v)=>{
  const x=lerp(D.XW,D.XE,u),zFront=ARCO3.cliffZ(x,ARCO3.ctop(x),dd)-1.5;
  const z=lerp(zFront,D.ZBK,v);
  return [x,ARCO3.platY(x,z,dd),z];
 },120,30,{uS:28,vS:14}));
 /* Gorge floor, shore benches, riverbed and Far Canyon Wall across the river */
 BED.push(gridSurface((u,v)=>{
  const x=lerp(D.XW,D.XE,u),z=lerp(72,D.FAR_Z0+8,v);
  return [x,ARCO3.groundY(x,z,dd),z];
 },96,26,{uS:28,vS:8}));
 ROCK.push(gridSurface((u,v)=>{
  const x=lerp(D.XW,D.XE,u),z=lerp(D.FAR_Z0,D.FAR_Z1,v);
  return [x,ARCO3.farWallY(x,z),z];
 },112,28,{uS:30,vS:6}));

 /* ---- 5. Gorge River Quay & Mooring Piers (y = 0..14 m) ---- */
 {
  const Q=P.quay;
  /* Arched riverfront quay wall with cargo arcades */
  const qArches=[];
  for(let bx=-180;bx<=180;bx+=36){
   if(Math.abs(bx)<22)continue;
   qArches.push({cx:bx,w:18,springY:7.2});
  }
  /* Central water-gate sluice arch */
  qArches.push({cx:0,w:22,springY:8.2});
  TRAV.push(a3PiercedWallGeo(Q.x0,Q.x1,0,Q.y1,Q.z1-5,Q.z1,qArches,null,16));
  TRAV.push(a3BoxGeo(Q.x0,0,Q.z0,Q.x1,Q.y1-0.4,Q.z1-5,18));
  PAVE.push(a3BoxGeo(Q.x0,Q.y1-0.4,Q.z0,Q.x1,Q.y1,Q.z1+0.6,14));
  ROOMD.push(a3BoxGeo(Q.x0+8,1,Q.z1-16,Q.x1-8,Q.y1-1.2,Q.z1-5.2,14));
  /* Parapet kerbs along riverfront */
  TRAV.push(a3BoxGeo(Q.x0,Q.y1,Q.z1-0.8,-14,Q.y1+1.1,Q.z1+0.4,10));
  TRAV.push(a3BoxGeo(14,Q.y1,Q.z1-0.8,Q.x1,Q.y1+1.1,Q.z1+0.4,10));
  for(const pr of Q.piers){
   TRAV.push(a3BoxGeo(pr.x0,0,pr.z0-2,pr.x1,pr.y1-0.3,pr.z1,12));
   PAVE.push(a3BoxGeo(pr.x0-0.4,pr.y1-0.3,pr.z0-2,pr.x1+0.4,pr.y1+0.1,pr.z1+0.4,10));
  }
 }

 /* ---- 6. Six Cascading Semicircular-Arched Spine Terraces & Nested Pavilions (Reference 1) ---- */
 const goneFlights=new Set(RU?RU.brokenFlights:[]);
 for(let k=0;k<P.terraces.length;k++){
  const T=P.terraces[k],A=T.arch,pv=T.pavilion;
  const x0=T.x0,x1=T.x1,y0=T.y0,y1=T.y1,z0=T.z0,z1=T.z1;
  const logZ0=z1-A.depth;
  const litTerr=!dd||k>=2;
  const facArr=litTerr?(dd?FACK:FAC):FAC;

  /* Solid spine body behind the semicircular loggia, overlapping k-1 below by 1.2 m so KRUINS sees one solid mass */
  TRAV.push(a3BoxGeo(x0,Math.max(0,y0-1.2),z0,x1,y1-0.6,logZ0+2,18));
  /* Side piers flanking the giant semicircular front arch */
  const pierW=(x1-x0-A.w)*0.5;
  TRAV.push(a3BoxGeo(x0,Math.max(0,y0-1.2),logZ0,x0+pierW+1.5,y1-0.4,z1,16));
  TRAV.push(a3BoxGeo(x1-pierW-1.5,Math.max(0,y0-1.2),logZ0,x1,y1-0.4,z1,16));

  /* Monumental front wall with semicircular arch opening (5.5 m thick archivolt!) */
  TRAV.push(a3PiercedWallGeo(x0,x1,y0-0.5,y1,z1-5.5,z1,[{cx:0,w:A.w,springY:A.springY}],null,16));
  /* Curved semicircular barrel soffit lining the 26 m deep arch reveal */
  SOFF.push(gridSurface((u,v)=>{
   const ang=u*Math.PI;
   return [Math.cos(ang)*A.r,A.springY+Math.sin(ang)*A.r,lerp(logZ0,z1-5,v)];
  },28,4,{uS:8,vS:2}));

  /* Recessed multi-storey glazed wall + warm interior gallery slabs at the back of the arch loggia */
  facArr.push(a3BoxGeo(-A.r+2,y0,logZ0-1.2,A.r-2,A.crownY-2,logZ0+0.6,13));
  for(let sy=y0+8.3;sy<A.crownY-5;sy+=8.3){
   ROOML.push(a3BoxGeo(-A.r+3,sy-0.35,logZ0-9,A.r-3,sy+0.35,logZ0+0.2,12));
  }

  /* Side flank arches along the terrace's east and west side walls (Ref 1 side elevation) */
  for(const sd of [-1,1]){
   const wx=sd<0?x0:x1-4.2;
   const sideG=(function(){
    const sh=new THREE.Shape();
    const zLen=z1-T.deckZ0;
    sh.moveTo(0,y0);sh.lineTo(zLen,y0);sh.lineTo(zLen,y1);sh.lineTo(0,y1);sh.closePath();
    for(let b=0;b<2;b++){
     const cz=10+b*15,hw=5.2,sy=y0+34;
     if(cz+hw<zLen-3){
      const p=new THREE.Path();
      p.moveTo(cz-hw,y0+4);p.lineTo(cz-hw,sy);
      p.absarc(cz,sy,hw,Math.PI,0,true);p.lineTo(cz+hw,y0+4);
      sh.holes.push(p);
     }
    }
    const eg=new THREE.ExtrudeGeometry(sh,{depth:4.2,bevelEnabled:false,curveSegments:16});
    eg.rotateY(Math.PI/2);
    eg.translate(wx,0,z1);
    eg.computeVertexNormals();
    return a3WorldUV(eg,16);
   })();
   TRAV.push(sideG);
   facArr.push(a3BoxGeo(sd<0?x0+4.0:x1-5.6,y0+3,T.deckZ0+2,sd<0?x0+5.6:x1-4.0,y1-3,z1-5,13));
  }

  /* Nested Post-and-Lintel (Trabeated) Pavilion inside each Semicircular Arch (Ref 1 hero detail!) */
  {
   const px0=-pv.w*0.5,px1=pv.w*0.5,py0=pv.y0,py1=pv.y1,pz0=pv.z0,pz1=pv.z1;
   /* Pavilion plinth */
   PAVE.push(a3BoxGeo(px0-1,py0-0.6,pz0-1,px1+1,py0+1.2,pz1+1,12));
   /* Four square monumental travertine piers across front and rear */
   for(let ci=0;ci<4;ci++){
    const cx=lerp(px0+2.2,px1-2.2,ci/3);
    TRAV.push(a3BoxGeo(cx-1.5,py0+0.8,pz1-3.2,cx+1.5,py1-3.2,pz1-0.2,10));
    TRAV.push(a3BoxGeo(cx-1.5,py0+0.8,pz0+0.2,cx+1.5,py1-3.2,pz0+3.2,10));
   }
   /* recessed warm glazed pavilion core */
   ROOML.push(a3BoxGeo(px0+3.5,py0+1.0,pz0+3.2,px1-3.5,py1-3.2,pz1-3.6,10));
   GLASS.push(a3BoxGeo(px0+3.2,py0+1.2,pz1-3.5,px1-3.2,py1-3.4,pz1-3.1,10));
   /* Heavy horizontal entablature lintel + planted roof trough on top of the pavilion */
   TRAV.push(a3BoxGeo(px0-1.2,py1-3.4,pz0-1.2,px1+1.2,py1,pz1+1.2,12));
   LAWN.push(a3BoxGeo(px0+0.6,py1-0.3,pz0+0.6,px1-0.6,py1+0.5,pz1-0.6,10));
  }

  /* Planted Terrace Roof Deck & Parapet Coping */
  PAVE.push(a3BoxGeo(x0-0.8,y1-0.9,T.deckZ0-2,x1+0.8,y1+0.1,z1+0.8,14));
  LAWN.push(a3BoxGeo(x0+3.2,y1,T.deckZ0+2,x1-3.2,y1+0.65,z1-2.6,12));
  TRAV.push(a3BoxGeo(x0-0.8,y1,z1-1.6,x1+0.8,y1+1.35,z1+0.8,12));
  TRAV.push(a3BoxGeo(x0-0.8,y1,T.deckZ0,x0+1.4,y1+1.35,z1+0.8,12));
  TRAV.push(a3BoxGeo(x1-1.4,y1,T.deckZ0,x1+0.8,y1+1.35,z1+0.8,12));
 }

 /* Twin Grand Cascading Exterior Stairs flanking the Spine (Ref 1 stepped side stairs) */
 for(const st of P.stairs){
  for(const fl of st.flights){
   const broken=goneFlights.has(fl.id);
   const x0=fl.x-fl.w*0.5,x1=fl.x+fl.w*0.5;
   /* Solid stepped under-carriage wall tied to the spine flank so nothing floats even when steps are cut */
   const T=P.terraces[fl.k];
   const tieX0=st.sd<0?x0:T.x1-1.5,tieX1=st.sd<0?T.x0+1.5:x1;
   if(!broken){
    const nSteps=16;
    for(let s=0;s<nSteps;s++){
     const t0=s/nSteps,t1=(s+1)/nSteps;
     const sy0=Math.max(0,fl.y0-1.5),sy1=lerp(fl.y0,fl.y1,t1);
     const sz0=lerp(fl.z0,fl.z1,t1)-0.4,sz1=lerp(fl.z0,fl.z1,t0)+0.4;
     TRAV.push(a3BoxGeo(tieX0,sy0,Math.min(sz0,sz1),tieX1,sy1,Math.max(sz0,sz1),12));
    }
    /* Sloped outer stair parapet cheek wall */
    for(let s=0;s<8;s++){
     const tm=(s+0.5)/8,sy=lerp(fl.y0,fl.y1,tm),sz=lerp(fl.z0,fl.z1,tm);
     const px0=st.sd<0?x0-1.1:x1-0.2,px1=st.sd<0?x0+0.2:x1+1.1;
     TRAV.push(a3BoxGeo(px0,sy-2,sz-2.6,px1,sy+1.5,sz+2.6,10));
    }
   }else{
    /* Broken stair flight at the Sanctuary Neck (y=188) or rockfall: lower and upper stubs tied to terrace walls, 16 m gap between */
    TRAV.push(a3BoxGeo(tieX0,Math.max(0,fl.y0-1.5),fl.z0-8,tieX1,fl.y0+11,fl.z0+1,12));
    TRAV.push(a3BoxGeo(tieX0,fl.y1-14,fl.z1-2,tieX1,fl.y1,fl.z1+7,12));
   }
  }
 }

 /* ---- 7. Crown Barrel-Vault Great Hall & Tall Flank Arcades (Reference 1 Summit, y = 364..498 m) ---- */
 {
  const V=P.vault,R=D.VAULT.r,Ri=V.innerR,ys=V.ySpring,y0=V.y0;
  /* Front monumental barrel-vault arch ring (22 m deep thick stone hood) */
  const hoodShape=new THREE.Shape();
  hoodShape.moveTo(-R,y0-1.5);
  hoodShape.lineTo(-R,ys);
  hoodShape.absarc(0,ys,R,Math.PI,0,true);
  hoodShape.lineTo(R,y0-1.5);
  hoodShape.lineTo(Ri,y0-1.5);
  hoodShape.lineTo(Ri,ys);
  hoodShape.absarc(0,ys,Ri,0,Math.PI,false);
  hoodShape.lineTo(-Ri,y0-1.5);
  hoodShape.closePath();
  const hoodGeo=new THREE.ExtrudeGeometry(hoodShape,{depth:V.recess+4,bevelEnabled:false,curveSegments:36});
  hoodGeo.translate(0,0,V.z1-(V.recess+4));
  hoodGeo.computeVertexNormals();
  TRAV.push(a3WorldUV(hoodGeo,18));

  /* Main barrel roof shell from z0 (-220) to z1 - V.recess (-88) */
  TRAV.push(gridSurface((u,v)=>{
   const ang=u*Math.PI;
   return [Math.cos(ang)*R,ys+Math.sin(ang)*R,lerp(V.z0,V.z1-V.recess+2,v)];
  },36,12,{uS:14,vS:10}));
  SOFF.push(gridSurface((u,v)=>{
   const ang=u*Math.PI;
   return [Math.cos(ang)*Ri,ys+Math.sin(ang)*Ri,lerp(V.z0+4,V.z1+0.2,v)];
  },32,10,{uS:12,vS:10}));

  /* Tall Vertical Round-Headed Flank Arcades along both East and West side walls (Ref 1 signature!) */
  for(const sd of [-1,1]){
   const wx=sd<0?-R:R-V.th;
   const fShape=new THREE.Shape();
   const len=V.z1-V.recess-V.z0;
   fShape.moveTo(0,y0-1.5);fShape.lineTo(len,y0-1.5);fShape.lineTo(len,ys+4);fShape.lineTo(0,ys+4);fShape.closePath();
   const bayStep=len/(V.flankBays+0.6);
   for(let b=0;b<V.flankBays;b++){
    const cz=(b+0.8)*bayStep,hw=bayStep*0.33,archTop=ys-4;
    const p=new THREE.Path();
    p.moveTo(cz-hw,y0+4);p.lineTo(cz-hw,archTop-hw);
    p.absarc(cz,archTop-hw,hw,Math.PI,0,true);
    p.lineTo(cz+hw,y0+4);
    fShape.holes.push(p);
   }
   const fg=new THREE.ExtrudeGeometry(fShape,{depth:V.th,bevelEnabled:false,curveSegments:16});
   fg.rotateY(Math.PI/2);
   fg.translate(wx,0,V.z1-V.recess);
   fg.computeVertexNormals();
   TRAV.push(a3WorldUV(fg,16));
   /* Recessed dark bronze mullions + smoked glass behind the tall flank arcades */
   const gxPos=sd<0?-R+V.th-1.2:R-V.th+1.2;
   GLASS.push(a3BoxGeo(gxPos-0.3,y0+3,V.z0+6,gxPos+0.3,ys-2,V.z1-V.recess-2,14));
  }

  /* Monumental Recessed Dark-Glazed Arch Wall at z = V.z1 - V.recess (-88) + Mullion Grid (Ref 1) */
  const zGlz=V.z1-V.recess;
  const glzShape=new THREE.Shape();
  glzShape.moveTo(-Ri,y0);glzShape.lineTo(Ri,y0);glzShape.lineTo(Ri,ys);
  glzShape.absarc(0,ys,Ri,0,Math.PI,false);
  glzShape.lineTo(-Ri,y0);
  const glzGeo=new THREE.ExtrudeGeometry(glzShape,{depth:0.8,bevelEnabled:false,curveSegments:32});
  glzGeo.translate(0,0,zGlz-0.4);
  GLASS.push(a3WorldUV(glzGeo,16));

  /* Mullion lattice across the giant arched glass wall (touching floor/vault hood) */
  for(let mx=-42;mx<=42;mx+=12){
   const maxH=ys+Math.sqrt(Math.max(0,Ri*Ri-mx*mx));
   DARK.push(a3BoxGeo(mx-0.45,y0-0.5,zGlz-0.9,mx+0.45,maxH+0.5,zGlz+0.9,8));
  }
  for(let my=y0+14;my<ys+Ri-6;my+=14){
   const hw=my<=ys?Ri:Math.sqrt(Math.max(0,Ri*Ri-(my-ys)*(my-ys)));
   if(hw>4)DARK.push(a3BoxGeo(-hw-0.5,my-0.45,zGlz-0.9,hw+0.5,my+0.45,zGlz+0.9,8));
  }

  /* Visible Conservatory & Assembly Interior Galleries inside the Barrel Vault + Threshold Garden */
  PAVE.push(a3BoxGeo(-Ri-1,y0-1,V.z0+2,Ri+1,y0+0.4,V.z1+0.4,14));
  LAWN.push(a3BoxGeo(-Ri+4,y0+0.2,zGlz+2,-14,y0+0.9,V.z1-2,10));
  LAWN.push(a3BoxGeo(14,y0+0.2,zGlz+2,Ri-4,y0+0.9,V.z1-2,10));
  ROOML.push(a3BoxGeo(-Ri+2,y0,V.z0+2,Ri-2,ys+24,V.z0+8,16));
  for(let lv=1;lv<=5;lv++){
   const fy=y0+lv*13.5,zStart=V.z0+6,zEnd=zGlz-12-lv*8;
   ROOML.push(a3BoxGeo(-Ri+2,fy-0.6,zStart,Ri-2,fy+0.6,zEnd,14));
   /* Side gallery mezzanines running forward to meet the flank arcades */
   ROOML.push(a3BoxGeo(-Ri+1,fy-0.6,zEnd,-Ri+14,fy+0.6,zGlz-2,14));
   ROOML.push(a3BoxGeo(Ri-14,fy-0.6,zEnd,Ri-1,fy+0.6,zGlz-2,14));
  }
 }

 /* ---- 8. Eight Vertically-Fluted Chalice Towers & Groves (Reference 2) ---- */
 for(const tw of P.towers){
  const cutY=RU&&RU.towerCuts[tw.id];
  const topY=cutY==null?tw.y1:cutY;
  const litTw=!dd||tw.side==='east'||tw.key==='W4';
  const facArr=litTw?(dd?FACK:FAC):FAC;

  const scoopBlend=(ang,y)=>{
   let b=0;
   for(const sc of tw.scoops){
    if(y<sc.y0-4||y>sc.y1+4)continue;
    let da=ang-sc.th;
    while(da>Math.PI)da-=TAU;while(da<-Math.PI)da+=TAU;
    const vy=clamp((y-sc.y0)/(sc.y1-sc.y0),0,1);
    const halfSpan=sc.span*0.5*Math.sin(Math.PI*clamp(vy,0.03,0.97));
    const inside=clamp((halfSpan-Math.abs(da))*6,0,1)*clamp(Math.sin(Math.PI*vy)*5,0,1);
    if(inside>b)b=inside;
   }
   return b;
  };

  /* Structural tie plinth linking each tower cleanly into its neighbour spine/court so KRUINS sees one connected cluster */
  const tieTargetX=tw.side==='west'?Math.min(-60,tw.cx+68):Math.max(60,tw.cx-68);
  const tieY1=Math.min(topY,tw.y0+36);
  TRAV.push(a3BoxGeo(Math.min(tw.cx,tieTargetX),tw.y0,tw.cz-14,Math.max(tw.cx,tieTargetX),tieY1,tw.cz+14,16));

  /* Smooth inner residential/guild drum (no jagged step clipping!) */
  facArr.push(gridSurface((u,v)=>{
   const ang=u*TAU;
   let yMax=topY;
   if(cutY!=null)yMax=cutY+7*(fbm(u*6+tw.idx,1.7,33,2)-0.5);
   const y=lerp(tw.y0,yMax,v);
   const sb=scoopBlend(ang,y);
   const r=ARCO3.towerRadius(tw,y)*(0.95-0.13*sb);
   return [tw.cx+Math.cos(ang)*r,y,tw.cz+Math.sin(ang)*r];
  },56,42,{uS:tw.r*TAU/14,vS:(topY-tw.y0)/14}));

  /* Curved smoked-glass curtain walls + swept organic chalice ribbon collar + garden decks at every scoop */
  for(const sc of tw.scoops){
   if(sc.y0>=topY-6)continue;
   const sy1=Math.min(sc.y1,topY-2);
   GLASS.push(gridSurface((u,v)=>{
    const vy=v;
    const halfSpan=sc.span*0.49*Math.sin(Math.PI*clamp(vy,0.05,0.95));
    const ang=sc.th+(u*2-1)*halfSpan;
    const y=lerp(sc.y0+0.5,sy1,vy);
    const r=ARCO3.towerRadius(tw,y)*0.93;
    return [tw.cx+Math.cos(ang)*r,y,tw.cz+Math.sin(ang)*r];
   },22,12,{uS:4,vS:3}));
   /* Swept oval chalice frame ribbon around the entire curved scoop border (Ref 2 flowing rib border!) */
   FLUTE.push(gridSurface((u,v)=>{
    const ph=u*TAU;
    const vy=0.5-0.5*Math.cos(ph);
    const ang=sc.th+Math.sin(ph)*sc.span*0.50;
    const y=lerp(sc.y0,sy1,vy);
    const rBase=ARCO3.towerRadius(tw,y);
    const r=rBase*(0.90+0.13*Math.sin(v*Math.PI));
    const dy=(v-0.5)*2.8;
    return [tw.cx+Math.cos(ang)*r,y+dy,tw.cz+Math.sin(ang)*r];
   },40,4,{uS:12,vS:1}));
   /* Cupped chalice garden deck & warm bronze-sandstone rim at scoop floor */
   const rCup=ARCO3.towerRadius(tw,sc.y0)*1.09;
   FLUTE.push(gridSurface((u,v)=>{
    const ang=sc.th+(u-0.5)*(sc.span+0.28);
    const r=lerp(tw.r*0.76,rCup,v);
    return [tw.cx+Math.cos(ang)*r,sc.y0+(v>0.84?1.25:0),tw.cz+Math.sin(ang)*r];
   },22,4,{uS:4,vS:1}));
   LAWN.push(gridSurface((u,v)=>{
    const ang=sc.th+(u-0.5)*sc.span*0.94;
    const r=lerp(tw.r*0.80,rCup*0.95,v);
    return [tw.cx+Math.cos(ang)*r,sc.y0+0.38,tw.cz+Math.sin(ang)*r];
   },18,3,{uS:3,vS:1}));
  }

  /* Dense Slender Vertical Organic Fluted Ribs (44 per tower, Ref 2 hero motif!) */
  const nFl=tw.flutes+10,segY=28;
  for(let f=0;f<nFl;f++){
   const ang=(f/nFl)*TAU,ca=Math.cos(ang),sa=Math.sin(ang),tx=-sa,tz=ca;
   const ribW=0.52,ribD=1.35;
   for(let s=0;s<segY;s++){
    const ya=lerp(tw.y0,topY,s/segY),yb=lerp(tw.y0,topY,(s+1)/segY),ym=(ya+yb)*0.5;
    if(scoopBlend(ang,ym)>0.35)continue;
    if(cutY!=null&&yb>cutY+5*(h3(f,tw.idx,9.2)-0.5))continue;
    const ra=ARCO3.towerRadius(tw,ya),rb=ARCO3.towerRadius(tw,yb);
    FLUTE.push(gridSurface((u,v)=>{
     const y=lerp(ya-0.18,yb+0.18,v),rr=lerp(ra,rb,v);
     const prof=u<0.33?[lerp(-ribW,ribW,u*3),0]:u<0.66?[lerp(ribW,0,(u-0.33)*3),lerp(0,ribD,(u-0.33)*3)]:[lerp(0,-ribW,(u-0.66)*3),lerp(ribD,0,(u-0.66)*3)];
     const rad=rr-0.25+prof[1];
     return [tw.cx+ca*rad+tx*prof[0],y,tw.cz+sa*rad+tz*prof[0]];
    },3,1,{uS:0.4,vS:(yb-ya)/8}));
   }
  }

  /* Circular Chalice Crown Planter Rim + Woodland Floor (or Jagged Ruin Floor Plates if sheared) */
  if(cutY==null){
   const rTop=ARCO3.towerRadius(tw,topY);
   FLUTE.push(gridSurface((u,v)=>{
    const ang=u*TAU,y=topY-2.2+v*4.2,r=rTop*(0.96+0.07*v);
    return [tw.cx+Math.cos(ang)*r,y,tw.cz+Math.sin(ang)*r];
   },40,3,{uS:10,vS:1}));
   LAWN.push(gridSurface((u,v)=>{
    const ang=u*TAU,r=v*rTop*0.99;
    return [tw.cx+Math.cos(ang)*r,topY+0.25,tw.cz+Math.sin(ang)*r];
   },36,3,{uS:6,vS:6}));
  }else{
   /* Sheared W3 stump: exposed floor slabs & jagged dark interior */
   const rSt=ARCO3.towerRadius(tw,cutY)*0.94;
   for(let k=0;k<3;k++){
    const fy=cutY-k*5.2;
    ROOMD.push(gridSurface((u,v)=>{
     const ang=u*TAU,r=v*rSt*(0.85+0.15*h3(Math.floor(u*12),k,4.4));
     return [tw.cx+Math.cos(ang)*r,fy,tw.cz+Math.sin(ang)*r];
    },28,2,{uS:5,vS:5}));
   }
  }
 }

 /* ---- 9. Seven Sweeping Flared-Ribbed Parabolic Arch Skybridges (Reference 2) ---- */
 const goneBr=new Set(RU?RU.goneBridges:[]);
 for(const br of P.bridges){
  const ax=br.from[0],az=br.from[2],bx=br.to[0],bz=br.to[2],by=br.y;
  const dx=bx-ax,dz=bz-az,L=Math.hypot(dx,dz);
  const ux=dx/L,uz=dz/L,nx=-uz,nz=ux;
  const hw=br.w*0.5;
  if(goneBr.has(br.id)){
   /* Broken bridge abutment stubs cantilevered 12 m off each surviving support so nothing floats */
   const twCuts=RU?RU.towerCuts:{};
   for(const end of [0,1]){
    const hostId=end===0?br.aId:br.bId;
    if(twCuts[hostId]!=null&&by>twCuts[hostId]-4)continue;
    const t0=end===0?0:0.88,t1=end===0?0.12:1.0;
    FLUTE.push(gridSurface((u,v)=>{
     const t=lerp(t0,t1,u),cx=lerp(ax,bx,t),cz=lerp(az,bz,t);
     const arch=br.archDrop*Math.pow(1-Math.sin(t*Math.PI),1.8);
     const wOff=(v-0.5)*br.w;
     return [cx+nx*wOff,by-3.5-arch*(1-Math.abs(v-0.5)*0.4),cz+nz*wOff];
    },6,4,{uS:3,vS:2}));
    TRAV.push(gridSurface((u,v)=>{
     const t=lerp(t0,t1,u),cx=lerp(ax,bx,t),cz=lerp(az,bz,t),wOff=(v-0.5)*br.w;
     return [cx+nx*wOff,by,cz+nz*wOff];
    },6,2,{uS:3,vS:2}));
   }
   continue;
  }

  /* Intact sweeping parabolic arch bridge: top promenade deck + flared-ribbed arch soffit + side ribs */
  const soffY=t=>by-4.2-br.archDrop*Math.pow(Math.abs(t-0.5)*2,2.1);
  PAVE.push(gridSurface((u,v)=>{
   const cx=lerp(ax,bx,u),cz=lerp(az,bz,u),wOff=(v-0.5)*br.w;
   return [cx+nx*wOff,by,cz+nz*wOff];
  },24,3,{uS:L/12,vS:2}));
  LAWN.push(gridSurface((u,v)=>{
   const cx=lerp(ax,bx,u),cz=lerp(az,bz,u),wOff=(v-0.5)*(br.w-3.6);
   return [cx+nx*wOff,by+0.22,cz+nz*wOff];
  },22,2,{uS:L/12,vS:2}));
  /* Curved arch underside */
  FLUTE.push(gridSurface((u,v)=>{
   const cx=lerp(ax,bx,u),cz=lerp(az,bz,u),wOff=(v-0.5)*br.w*(0.82+0.18*Math.pow(Math.abs(u-0.5)*2,1.6));
   return [cx+nx*wOff,soffY(u),cz+nz*wOff];
  },26,5,{uS:L/10,vS:2}));
  /* Side spandrel walls & vertical flared ribs along both sides of the arch */
  for(const sd of [-1,1]){
   FLUTE.push(gridSurface((u,v)=>{
    const cx=lerp(ax,bx,u),cz=lerp(az,bz,u);
    const wEdge=sd*hw*(0.84+0.16*Math.pow(Math.abs(u-0.5)*2,1.5));
    const y=lerp(soffY(u),by+1.2,v);
    return [cx+nx*wEdge,y,cz+nz*wEdge];
   },26,4,{uS:L/10,vS:2}));
   const nRibs=Math.max(10,Math.round(L/5.5));
   for(let r=0;r<=nRibs;r++){
    const u=r/nRibs,cx=lerp(ax,bx,u)+nx*sd*(hw*(0.84+0.16*Math.pow(Math.abs(u-0.5)*2,1.5))+0.45);
    const cz=lerp(az,bz,u)+nz*sd*(hw*(0.84+0.16*Math.pow(Math.abs(u-0.5)*2,1.5))+0.45);
    const yBot=soffY(u),yTop=by+1.25;
    FLUTE.push(a3BoxGeo(cx-0.45,yBot,cz-0.45,cx+0.45,yTop,cz+0.45,6));
   }
  }
 }

 /* ---- 10. Twelve Sheltered Terracotta Oculus Courts & Twenty-Four Emerald Mosaic Pools (Reference 3) ---- */
 const drySet=new Set(RU?RU.dryCourts:[]);
 const dmgSet=new Set(RU?RU.damagedParts:[]);
 for(const C of P.courts){
  const x0=C.x0,x1=C.x1,z0=C.z0,z1=C.z1,y0=C.y0,wh=C.wallH;
  const isDry=dd&&drySet.has(C.id);
  const isDmg=dd&&dmgSet.has(C.id);
  const tileArr=isDry?TILED:TILE;
  const roomArr=(!dd||C.side==='east')?ROOML:ROOMD;

  /* Solid court substructure overlapping the terrace below / spine beside it, with holes cut for the 2 sunken pools */
  const plA=C.pools[0],plB=C.pools[1];
  TERRA.push(a3BoxGeo(x0,Math.max(0,y0-14),z0,x1,y0-2.1,z1,16));
  /* Court paving slab around and between the paired emerald pools (creating the narrow causeway!) */
  PAVE.push(a3BoxGeo(x0,y0-2.1,z0,plA.x0,y0,z1,12));
  PAVE.push(a3BoxGeo(plA.x1,y0-2.1,z0,x1,y0,z1,12));
  PAVE.push(a3BoxGeo(plA.x0,y0-2.1,z0,plA.x1,y0,plA.z0,12));
  PAVE.push(a3BoxGeo(plA.x0,y0-2.1,plA.z1,plA.x1,y0,plB.z0,10)); /* Narrow central causeway between pools! */
  PAVE.push(a3BoxGeo(plB.x1,y0-2.1,plB.z0,plA.x1,y0,plB.z1,10));
  PAVE.push(a3BoxGeo(plA.x0,y0-2.1,plB.z1,plA.x1,y0,z1,12));
  /* Front court parapet overlooking the canyon */
  TERRA.push(a3BoxGeo(x0,y0,z1-1.3,x1,y0+1.25,z1,10));

  /* Sunken Emerald-Green Mosaic Tile Pool Basins (walls + floor + underwater steps + pale stone coping) */
  for(const pl of C.pools){
   const py0=pl.y-pl.depth;
   tileArr.push(a3BoxGeo(pl.x0,py0-0.3,pl.z0,pl.x1,py0,pl.z1,4));
   tileArr.push(a3BoxGeo(pl.x0-0.35,py0-0.3,pl.z0,pl.x0+0.25,pl.y+0.08,pl.z1,4));
   tileArr.push(a3BoxGeo(pl.x1-0.25,py0-0.3,pl.z0,pl.x1+0.35,pl.y+0.08,pl.z1,4));
   tileArr.push(a3BoxGeo(pl.x0,py0-0.3,pl.z0-0.35,pl.x1,pl.y+0.08,pl.z0+0.25,4));
   tileArr.push(a3BoxGeo(pl.x0,py0-0.3,pl.z1-0.25,pl.x1,pl.y+0.08,pl.z1+0.35,4));
   /* Underwater mosaic entry steps */
   tileArr.push(a3BoxGeo(pl.x0+0.25,py0,pl.z0+0.25,pl.x0+3.2,py0+0.65,pl.z1-0.25,4));
   tileArr.push(a3BoxGeo(pl.x0+0.25,py0+0.65,pl.z0+0.25,pl.x0+1.7,py0+1.15,pl.z1-0.25,4));
  }

  /* 3-Storey Terracotta Moon-Gate Rear Facade (z = z0+18..z0+21): Ground Semicircular Arches + 2 Stacked Rows of Giant Circular Oculi! */
  const zFace=z0+21,zWall0=zFace-2.8;
  const arches=[],circles=[];
  const spanX=x1-x0,stepX=spanX/3;
  for(let col=0;col<3;col++){
   const cx=x0+(col+0.5)*stepX;
   arches.push({cx:cx,w:stepX*0.68,springY:y0+5.2});
   const topRows=(isDmg&&col===0)?1:2;
   for(let row=0;row<topRows;row++){
    circles.push({cx:cx,cy:y0+15.0+row*10.6,r:C.oculusR});
   }
  }
  const wallTop=isDmg?y0+wh-5:y0+wh;
  TERRA.push(a3PiercedWallGeo(x0,x1,y0-0.4,wallTop,zWall0,zFace,arches,circles,14));

  /* Warm terracotta residential box behind the moon-gate facade (lit rooms, mullions, floor slabs — NO DARK VOIDS) */
  TERRA.push(a3BoxGeo(x0,y0-0.4,z0,x1,wallTop,z0+2.5,14));
  TERRA.push(a3BoxGeo(x0,y0-0.4,z0,x0+2.2,wallTop,zFace,14));
  TERRA.push(a3BoxGeo(x1-2.2,y0-0.4,z0,x1,wallTop,zFace,14));
  TERRA.push(a3BoxGeo(x0,wallTop-1.1,z0,x1,wallTop+0.2,zFace+0.4,14));
  LAWN.push(a3BoxGeo(x0+2,wallTop,z0+2,x1-2,wallTop+0.55,zFace-1.5,10));
  for(let lv=0;lv<3;lv++){
   const fy=y0+lv*10.4;
   roomArr.push(a3BoxGeo(x0+2,fy-0.3,z0+2.2,x1-2,fy+0.4,zWall0+0.2,12));
   /* Interior cross-partitions visible through the circular oculi */
   roomArr.push(a3BoxGeo(x0+stepX-0.4,fy,z0+2.2,x0+stepX+0.4,fy+10.2,zWall0-1.5,10));
   roomArr.push(a3BoxGeo(x0+2*stepX-0.4,fy,z0+2.2,x0+2*stepX+0.4,fy+10.2,zWall0-1.5,10));
  }
  /* Dark-framed recessed glass curtain behind the upper two circular oculus storeys */
  if(!isDmg){
   GLASS.push(a3BoxGeo(x0+3,y0+9.8,zWall0-0.8,x1-3,wallTop-1.2,zWall0-0.3,12));
   for(let col=0;col<3;col++){
    const cx=x0+(col+0.5)*stepX;
    DARK.push(a3BoxGeo(cx-0.25,y0+9.6,zWall0-1.0,cx+0.25,wallTop-1.0,zWall0-0.1,6));
   }
  }

  /* Cantilevered Terracotta Slab with Circular Skylight Oculus Cutout & Alcove Side Wing (Ref 3 upper-right!) */
  {
   const ct=C.cantilever;
   const skx=(ct.x0+ct.x1)*0.5,skz=(ct.z0+ct.z1)*0.5;
   TERRA.push(a3PiercedSlabGeo(ct.x0,ct.x1,ct.z0,ct.z1,ct.y-1.5,ct.y,[{cx:skx,cz:skz,r:ct.skylightR}],12));
   TERRASOFF.push(a3PiercedSlabGeo(ct.x0+0.2,ct.x1-0.2,ct.z0+0.2,ct.z1-0.2,ct.y-1.62,ct.y-1.48,[{cx:skx,cz:skz,r:ct.skylightR+0.05}],12));
   /* Supporting terracotta pier wall at outer court edge so the cantilever is 100% structurally anchored */
   const pierX0=C.sd<0?x0:x1-3.2,pierX1=C.sd<0?x0+3.2:x1;
   TERRA.push(a3BoxGeo(pierX0,y0-0.4,ct.z0,pierX1,ct.y+9.5,ct.z1,14));
   /* Upper terrace floor & glass balustrade above the cantilevered skylight slab */
   GLASS.push(a3BoxGeo(C.sd<0?ct.x1-0.35:ct.x0,ct.y,ct.z0,C.sd<0?ct.x1:ct.x0+0.35,ct.y+1.25,ct.z1,8));
   LAWN.push(a3BoxGeo(ct.x0+2,ct.y,ct.z0+1,ct.x1-2,ct.y+0.45,ct.z0+5.5,8));
  }
 }

 /* ---- 11. Merge All Accumulated Surfaces per Material (minimal draw calls!) ---- */
 meshMerged(ROCK,MAT.a3Rock,G);
 meshMerged(SHADE,MAT.a3Shade,G);
 meshMerged(TOP,MAT.a3Top,G);
 meshMerged(BED,MAT.a3Bed,G);
 meshMerged(TRAV,travM,G);
 meshMerged(SOFF,MAT.a3Soff,G);
 meshMerged(TERRA,terraM,G);
 meshMerged(TERRASOFF,MAT.a3TerraSoff,G);
 meshMerged(FLUTE,fluteM,G);
 meshMerged(TILE,MAT.a3Tile,G);
 meshMerged(TILED,MAT.a3TileDry,G);
 meshMerged(PAVE,MAT.a3Pave,G);
 meshMerged(LAWN,lawnM,G);
 meshMerged(FAC,dd?MAT.a3FacadeR:MAT.a3Facade,G);
 meshMerged(FACK,MAT.a3FacadeKeep,G);
 meshMerged(ROOML,MAT.a3RoomLit,G);
 meshMerged(ROOMD,MAT.a3RoomDim,G);
 meshMerged(DARK,MAT.a3DarkFrame,G);
 meshMerged(GLASS,MAT.a3SmokeGlass,G);

 /* ---- 12. Dress from ARCO3.dress Records (Trees, Vines, Glowing Sconces, Boats, Citizens) ---- */
 for(const dr of DR){
  const p=dr.at;
  if(dr.kind==='tree'){
   VEG.tree(p[0],p[1],p[2],dr.sp,dr.h);
  }else if(dr.kind==='vine'){
   /* Lush multi-strand cascading greenery hanging over the circular moon-gate sills (Ref 3) */
   for(let j=-2;j<=2;j++){
    const dx=j*0.95,subLen=dr.len*(1-Math.abs(j)*0.16);
    kput('vine',[p[0]+dx,p[1]+Math.abs(j)*0.22,p[2]],qEuler(0.05,dr.len+j,0),[1.15,subLen,1.15],null);
   }
   kput('leafCard',[p[0],p[1]+0.55,p[2]+0.2],qEuler(0,dr.len,0),[2.4,1.3,1.6],new THREE.Color(0x4b8739));
  }else if(dr.kind==='sconce'){
   /* Mounted flush on the solid terracotta pier between circular oculi (z = z0+21, touching within 0.05 m) */
   const ctKey=dr.id.split('.')[2];
   const ct=P.courts.find(c=>c.key===ctKey);
   const sz=ct?(ct.z0+21.05):p[2];
   kput(dr.lit?'a3SconceOn':'a3SconceDead',[p[0],p[1],sz],null,[1.05,1.35,0.75],null);
  }else if(dr.kind==='boat'){
   kput('a3Boat',p,qEuler(0,dr.ry,0),[1.3,1,1.15],new THREE.Color(0x9c6e46));
  }else if(dr.kind==='figure'){
   kput('figB',p,qEuler(0,dr.ry,0),1,new THREE.Color(0xc26e4a));
   kput('figH',p,null,1,new THREE.Color(0xd1a784));
  }
 }

 /* ---- 13. Ruin Pass: Vertex-Exact Physically Seated Fallen Wrecks & Talus Rockfall (d = 1) ---- */
 if(dd&&RU){
  const vTmp=new THREE.Vector3();
  const exactVertexBox=grp=>{
   grp.updateMatrixWorld(true);
   const invG=new THREE.Matrix4().copy(G.matrixWorld).invert();
   const bx=new THREE.Box3();
   grp.traverse(m=>{
    if(!m.isMesh||!m.geometry||!m.geometry.attributes.position)return;
    const M=new THREE.Matrix4().multiplyMatrices(invG,m.matrixWorld);
    const pos=m.geometry.attributes.position;
    for(let i=0;i<pos.count;i++){
     vTmp.fromBufferAttribute(pos,i).applyMatrix4(M);
     bx.expandByPoint(vTmp);
    }
   });
   return bx;
  };
  for(const wr of RU.wrecks){
   const wg=new THREE.Group();
   wg.name=wr.id;
   G.add(wg);
   if(wr.kind==='fluted_drum'){
    const drumG=lathe({rFn:()=>wr.r,H:wr.h,flutes:24,amp:0.10,sharp:1.8,nu:32,nv:8});
    drumG.translate(0,-wr.h*0.5,0);
    mesh(drumG,MAT.a3FluteR,wg,0,0,0);
   }else if(wr.kind==='bridge_rib'){
    mesh(a3BoxGeo(-wr.w*0.5,-wr.h*0.5,-wr.d*0.5,wr.w*0.5,wr.h*0.5,wr.d*0.5,10),MAT.a3FluteR,wg,0,0,0);
   }else{
    mesh(a3BoxGeo(-wr.w*0.5,-wr.h*0.5,-wr.d*0.5,wr.w*0.5,wr.h*0.5,wr.d*0.5,10),MAT.a3TravR,wg,0,0,0);
   }
   wg.position.set(wr.x,20,wr.z);
   wg.rotation.set(wr.tilt,wr.yaw,wr.jitter);
   const bb=exactVertexBox(wg);
   wg.position.x+=wr.x-(bb.min.x+bb.max.x)*0.5;
   wg.position.z+=wr.z-(bb.min.z+bb.max.z)*0.5;
   const bb2=exactVertexBox(wg);
   const gMin=Math.min(
    ARCO3.groundY((bb2.min.x+bb2.max.x)*0.5,(bb2.min.z+bb2.max.z)*0.5,1),
    ARCO3.groundY(bb2.min.x,bb2.min.z,1),
    ARCO3.groundY(bb2.max.x,bb2.max.z,1),
    ARCO3.groundY(bb2.min.x,bb2.max.z,1),
    ARCO3.groundY(bb2.max.x,bb2.min.z,1)
   );
   wg.position.y+=(gMin-0.18)-bb2.min.y;
  }
  /* Scatter sandstone talus rubble blocks along the west rockfall foot (KRUINS.DECOR skips 'rubble' & 'vine' & 'moss') */
  for(let i=0;i<85;i++){
   const rx=-275+ARCO3.u(12400,901,i,0)*165;
   const rz=104+ARCO3.u(12400,902,i,0)*58;
   const ry=ARCO3.groundY(rx,rz,1);
   const sc=2.2+ARCO3.u(12400,903,i,0)*6.5;
   kput('rubble',[rx,ry+sc*0.35,rz],qEuler(i*0.7,i*1.3,i*0.4),[sc*1.3,sc*0.8,sc*1.1],new THREE.Color(0x9e6a50));
  }
  /* Extra wild vines & moss over the lower abandoned tiers */
  for(let i=0;i<70;i++){
   const k=i%3,T=P.terraces[k];
   const vx=lerp(T.x0+4,T.x1-4,ARCO3.u(12400,910,i,0));
   kput('vine',[vx,T.y1-0.4,T.z1+0.3],qEuler(0,i,0),[1.5,8+18*ARCO3.u(12400,911,i,0),1.5],null);
  }
 }

 /* Register site metadata for 8au2-arcoindian3-water.js and 91z-views.js */
 A3WATER.addSite(d,P,RU,gx,gz);
 A3_SITE[d]={x:gx,z:gz,d:d,plan:P,ruin:RU,modern:MG};

 /* Mark moored boats as decor after kbake runs via a one-shot TICKS hook or scene check */
 TICKS.push(function a3BoatDecor(){
  if(KIT&&KIT.meshes&&KIT.meshes.a3Boat)KIT.meshes.a3Boat.userData.decor=true;
 });

 KOFF=[0,0,0];
 return G;
}
