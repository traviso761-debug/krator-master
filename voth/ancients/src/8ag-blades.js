// ================================================================= THE BLADES — six inhabited slabs round a covered plaza
// The third of the memorial group. Six curved slabs of raw board-formed concrete
// rise from one stepped plinth round a plaza, each tapering like a leaf as it
// goes and curling OUTWARD at the top like a flame. They are unequal (450 to
// 850 m) and unevenly spaced (16 to 135 m apart), and their heights climb round
// the ring from the low south-east blade to the tallest in the north-west, so
// the group reads as one asymmetric figure, not a fountain.
//
// EACH BLADE IS A CITY: a double-loaded dwelling slab 36-46 m thick at the foot
// (27 m of rooms-corridor-rooms fits in the lower two-thirds of every one; see
// targets/blades/NOTES.md for the no-go test and its numbers). The concave face,
// the one that looks into the plaza, is all windows and galleries — every six
// storeys a continuous balcony deck with fins between, lights under its soffit,
// planting and people on it. The convex outer face is the monument: blank board
// marks and a fine rain of slot windows. Where the blade curls out, its inner
// face turns up to the sky and carries gardens.
//
// THE PLAZA is covered: a 7 m coffered canopy at 118 m spans between the blades
// and across every gap (a lintel 135 m long over the south entrance), with a
// great oculus in the middle. A monumental stair climbs from the south plain
// through the widest gap; inside, a second one climbs 36 m up the north axis,
// narrowing as it goes, into a slot portal between the two tallest blades and
// out onto a bastion over the plain. Sky bridges cross the narrower gaps.
//
// HOW A BLADE IS MADE. Each blade is a profile in (r,y) — integrated from a
// lean angle b(s) along its length s, so it bellies in a little and then curls
// out — swept across an angular width that tapers with s. A point is
// P(u,s,o): u across the width (-1..1), s up the length, o through the thickness
// (-1 the concave face, +1 the convex one), offset along the profile normal, so
// the thickness stays true through the curl. The top is not level: its length
// runs from L(1-sl) at one edge to L at the other, the slanted leaf-tip. Faces,
// the two edge ribbons and the top cap are grids in (u,s) with UVs in metres,
// so windows keep their size up a tapering, curling face.
//
// THE RUIN changes the silhouette. The tallest (north-west) blade snapped at
// 410 m and its upper 490 m lie on the plain in three pieces; the south-west one
// snapped at 280 m and fell INTO the plaza, through the canopy; the other four
// have lost their curls. Both faces are holed to a section of floor plates
// behind, galleries are broken runs with slabs hanging, bridges are stubs, the
// canopy is mostly down on the plaza, and rubble, moss, vines and trees fill it.

// ---- textures -------------------------------------------------------------------
// A window wall: 1 024 px = 32 m at 32 px/m, four-metre storeys and bays. The
// board-formed concrete under it is the kit's own TEX.concrete, drawn at the
// same 32 px/m so the boards stay 0.65 m. blWinPix is shared by the albedo and
// the emissive mask so a lit window is lit in both.
function blWinPix(X,Y){const st=Math.floor(Y/128),wy=127-(Y%128),bay=Math.floor(X/128),bx=X%128;
 const a=h3(bay*3.7+.5,st*5.1+.3,2.3),l=h3(bay*1.9+.2,st*2.7+.9,4.1),f=h3(bay*.7,st*1.3,9.1);
 if(!(bx>=12&&bx<116&&wy>=34&&wy<118))return{c:wy<3?1:wy<10?2:0,f:f,wy:wy,bx:bx};
 const e=Math.min(bx-12,115-bx,wy-34,117-wy);
 if(a<.14){// a loggia: the whole bay recessed, a door lit or not at the back, a rail
  if(wy<42)return{c:0,f:f,wy:wy,bx:bx};
  if(bx>40&&bx<88&&wy>44&&wy<110)return{c:l<.4?7:6,f:f,wy:wy,bx:bx};
  return{c:5,f:f,wy:wy,bx:bx};}
 if(e<4)return{c:3,f:f,wy:wy,bx:bx};
 if((bx-12)%26<3||(wy>100&&wy<104))return{c:4,f:f,wy:wy,bx:bx};
 return{c:l<.30?9:8,f:f,wy:wy,bx:bx};}
function blWinTex(dec){
 return canvasTex(1024,1024,(g,w,h)=>{
  for(let i=0;i<4;i++)for(let j=0;j<4;j++)g.drawImage(TEX.concrete.image,i*256,j*256,256,256);
  const id=g.getImageData(0,0,w,h),D=id.data;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,p=blWinPix(x,y);
   let v=D[i]*.3+D[i+1]*.59+D[i+2]*.11,r,gg,b;
   if(dec)v=v*.78-Math.max(0,fbm(x/11,y/120,8.2,2)-.44)*120;
   switch(p.c){
    case 1:v*=.55;break;
    case 2:v=v*.92+14;break;
    case 3:v*=.40;break;
    case 4:v=dec?26:74;break;
    case 5:v=dec?16:40;break;}
   r=gg=b=v;
   if(p.c===8||p.c===9||p.c===6||p.c===7){
    if(dec){const k=fbm(x/7,y/7,1.3,2);r=gg=b=8+k*20;
     if(h3(Math.floor(x/9),Math.floor(y/9),3.3)<.06){r=gg=b=60+k*30;}}
    else if(p.c===9||p.c===7){const f=.62+p.f*.5;r=240*f;gg=180*f;b=110*f;}
    else{const t=clamp((p.wy-34)/84,0,1);r=44+t*36;gg=54+t*42;b=64+t*50;}}
   if(dec&&p.c===0&&p.wy<34&&p.wy>9&&p.bx>=12&&p.bx<116){const k=clamp((34-p.wy)/25,0,1);r*=1-.35*k;gg*=1-.35*k;b*=1-.33*k;}
   D[i]=clamp(r+1,0,255);D[i+1]=clamp(gg,0,255);D[i+2]=clamp(b-2,0,255);D[i+3]=255;}
  g.putImageData(id,0,0);});}
function blWinLit(){
 return canvasTex(512,512,(g,w,h)=>{const id=g.createImageData(w,h),D=id.data;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,p=blWinPix(x*2,y*2);
   let a=0;if(p.c===9||p.c===7)a=.45+p.f*.65;
   D[i]=250*a;D[i+1]=172*a;D[i+2]=92*a;D[i+3]=255;}
  g.putImageData(id,0,0);});}
// The convex face: blank board marks and a slot window per 4 m bay per storey,
// 0.5 x 2.8 m, a few missing, a few lit — fine grain from afar, a wall close up.
function blSlitPix(X,Y){const st=Math.floor(Y/128),wy=127-(Y%128),bay=Math.floor(X/128),bx=X%128;
 const a=h3(bay*2.9+.1,st*4.3+.7,5.5),l=h3(bay*1.3+.4,st*3.1+.2,6.2),f=h3(bay*.9,st*1.7,2.2);
 if(a<.16||bx<56||bx>=72||wy<22||wy>=112)return{c:(st%4===0&&wy<3)?1:0,f:f};
 if(bx<58||bx>=70||wy<25||wy>=109)return{c:2,f:f};
 return{c:l<.22?4:3,f:f};}
function blSlitTex(dec){
 return canvasTex(1024,1024,(g,w,h)=>{
  for(let i=0;i<4;i++)for(let j=0;j<4;j++)g.drawImage(TEX.concrete.image,i*256,j*256,256,256);
  const id=g.getImageData(0,0,w,h),D=id.data;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,p=blSlitPix(x,y);
   let v=D[i]*.3+D[i+1]*.59+D[i+2]*.11;
   if(dec)v=v*.76-Math.max(0,fbm(x/13,y/140,4.2,2)-.42)*130;
   let r,gg,b;
   if(p.c===1)v*=.6;else if(p.c===2)v*=.45;
   r=gg=b=v;
   if(p.c===3){r=dec?12:40;gg=dec?12:46;b=dec?13:54;}
   else if(p.c===4){if(dec){r=gg=b=12;}else{const f=.6+p.f*.5;r=236*f;gg=176*f;b=104*f;}}
   D[i]=clamp(r+1,0,255);D[i+1]=clamp(gg,0,255);D[i+2]=clamp(b-2,0,255);D[i+3]=255;}
  g.putImageData(id,0,0);});}
function blSlitLit(){
 return canvasTex(512,512,(g,w,h)=>{const id=g.createImageData(w,h),D=id.data;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,p=blSlitPix(x*2,y*2);
   const a=p.c===4?.5+p.f*.6:0;D[i]=250*a;D[i+1]=170*a;D[i+2]=90*a;D[i+3]=255;}
  g.putImageData(id,0,0);});}
// What a hole shows: 512 px = 16 m, floor plates every 4 m, columns every 8 m,
// partitions, a floor gone here and there.
function blSectTex(){
 return canvasTex(512,512,(g,w,h)=>{const id=g.createImageData(w,h),D=id.data;
  for(let y=0;y<h;y++){const st=Math.floor(y/128),wy=127-(y%128);
   for(let x=0;x<w;x++){const i=(y*w+x)*4,n=(fbm(x/14,y/14,3.7,2)-.5)*26,cx=Math.floor(x/128);
    const gone=h3(cx*2.1,st*3.3,1.9)<.14;let v;
    if(wy<14)v=gone?30+n*.5:188+n;
    else if(wy<18)v=gone?24:92;
    else if(x%256<18)v=150+n;
    else if(x%128>=60&&x%128<66&&h3(cx,st,7.3)<.6)v=96+n;
    else if(wy<30&&h3(Math.floor(x/11),st,4.4)<.3)v=70+n;
    else v=20+n*.4;
    D[i]=clamp(v+2,0,255);D[i+1]=clamp(v,0,255);D[i+2]=clamp(v-4,0,255);D[i+3]=255;}}
  g.putImageData(id,0,0);});}
// Weathered concrete for the ruin: the same boards, darker, streaked, green in
// the damp.
function blConcRTex(){
 return canvasTex(512,512,(g,w,h)=>{g.drawImage(TEX.concrete.image,0,0,512,512);
  const id=g.getImageData(0,0,w,h),D=id.data;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
   let v=(D[i]*.3+D[i+1]*.59+D[i+2]*.11)*.82-Math.max(0,fbm(x/9,y/90,6.4,2)-.45)*120;
   const m=clamp((fbm(x/40,y/40,2.8,3)-.56)*5,0,1);
   D[i]=clamp(v-m*30,0,255);D[i+1]=clamp(v+m*8,0,255);D[i+2]=clamp(v-8-m*30,0,255);D[i+3]=255;}
  g.putImageData(id,0,0);});}
// Plaza paving: 2 m flags, 512 px = 16 m.
function blPaveTex(dec){
 return canvasTex(512,512,(g,w,h)=>{const id=g.createImageData(w,h),D=id.data;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,fx=Math.floor(x/64),fy=Math.floor(y/64),jx=x%64,jy=y%64;
   let v=176+(h3(fx*1.7,fy*2.9,3.1)-.5)*22+(fbm(x/20,y/20,1.1,2)-.5)*16,r,gg,b;
   const joint=jx<2||jy<2;if(joint)v-=50;
   r=v+3;gg=v;b=v-6;
   if(dec){r*=.66;gg*=.66;b*=.66;const m=clamp((fbm(x/30,y/30,8.8,3)-.46)*3,0,1)+(joint?.7:0);
    r=lerp(r,52,clamp(m,0,1));gg=lerp(gg,74,clamp(m,0,1));b=lerp(b,34,clamp(m,0,1));
    if(fbm(x/3,y/60,2.2,2)>.7){r*=.6;gg*=.6;b*=.6;}}
   D[i]=clamp(r,0,255);D[i+1]=clamp(gg,0,255);D[i+2]=clamp(b,0,255);D[i+3]=255;}
  g.putImageData(id,0,0);});}
function blKitTex(){
 return canvasTex(128,128,(g,w,h)=>{const id=g.createImageData(w,h),D=id.data;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
   let v=226+(fbm(x/10,y/10,1.4,2)-.5)*26;const e=Math.min(x,y,w-1-x,h-1-y);
   if(e<2)v=150;else if(e<4)v=240;
   D[i]=clamp(v+1,0,255);D[i+1]=clamp(v,0,255);D[i+2]=clamp(v-3,0,255);D[i+3]=255;}
  g.putImageData(id,0,0);});}
TEX.blWin=blWinTex(0);TEX.blWinR=blWinTex(1);TEX.blWinE=blWinLit();
TEX.blSlit=blSlitTex(0);TEX.blSlitR=blSlitTex(1);TEX.blSlitE=blSlitLit();
TEX.blSect=blSectTex();TEX.blConcR=blConcRTex();TEX.blPave=blPaveTex(0);TEX.blPaveR=blPaveTex(1);TEX.blKit=blKitTex();
// Heavier and greyer than the white Ancient stone, lighter than Darco: raw
// concrete intact, dark weathered concrete ruined.
MAT.blWin  =new THREE.MeshStandardMaterial({map:TEX.blWin,roughnessMap:TEX.concreteRM,color:0xd4d1cb,emissive:0xffffff,emissiveMap:TEX.blWinE,emissiveIntensity:1,roughness:1,metalness:0,side:DS});
MAT.blWinR =new THREE.MeshStandardMaterial({map:TEX.blWinR,roughnessMap:TEX.concreteRM,color:0x9a948a,roughness:1,metalness:0,side:DS});
MAT.blSlit =new THREE.MeshStandardMaterial({map:TEX.blSlit,roughnessMap:TEX.concreteRM,color:0xc9c5be,emissive:0xffffff,emissiveMap:TEX.blSlitE,emissiveIntensity:1,roughness:1,metalness:0,side:DS});
MAT.blSlitR=new THREE.MeshStandardMaterial({map:TEX.blSlitR,roughnessMap:TEX.concreteRM,color:0x938d83,roughness:1,metalness:0,side:DS});
MAT.blConc =new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0xbdb9b2,roughness:1,metalness:0,side:DS});
MAT.blConcR=new THREE.MeshStandardMaterial({map:TEX.blConcR,roughnessMap:TEX.concreteRM,color:0xa39c91,roughness:1,metalness:0,side:DS});
MAT.blShade=new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0x5c5853,roughness:1,metalness:0,side:DS});
MAT.blShadeR=new THREE.MeshStandardMaterial({map:TEX.blConcR,roughnessMap:TEX.concreteRM,color:0x423d37,roughness:1,metalness:0,side:DS});
MAT.blSect =new THREE.MeshStandardMaterial({map:TEX.blSect,roughnessMap:TEX.concreteRM,color:0xcfc9bf,roughness:1,metalness:0,side:DS});
MAT.blPave =new THREE.MeshStandardMaterial({map:TEX.blPave,roughnessMap:TEX.concreteRM,color:0xd8d4cc,roughness:1,metalness:0,side:DS});
MAT.blPaveR=new THREE.MeshStandardMaterial({map:TEX.blPaveR,roughnessMap:TEX.concreteRM,color:0xb0a898,roughness:1,metalness:0,side:DS});
MAT.blPool =new THREE.MeshStandardMaterial({color:0x33434c,roughness:.12,metalness:.35,side:DS});
MAT.blPoolR=new THREE.MeshStandardMaterial({color:0x2c3320,roughness:.8,metalness:0,side:DS});
MAT.blKit  =new THREE.MeshStandardMaterial({map:TEX.blKit,roughnessMap:TEX.concreteRM,color:0xffffff,roughness:1,metalness:0,side:DS});
MAT.blVoid =new THREE.MeshStandardMaterial({color:0x0b0b0c,roughness:1,metalness:0,side:DS});
kdef('blBox',new THREE.BoxGeometry(1,1,1),MAT.blKit);
kdef('blDim',new THREE.BoxGeometry(1,1,1),MAT.blVoid);
// Presets are DERIVED from this: targets/blades/91z-views.js runs after
// 90-scene.js, so both builders have left their dimensions here.
const BL_SITE={};

function buildBlades(scene,gx,gz,d){reseed(9640+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0,DEG=Math.PI/180;

 // ---- the numbers ------------------------------------------------------------
 const PY=24;                  // plinth top = plaza floor
 const YC0=118,YC1=125,RO=108; // the canopy: soffit, top, oculus radius
 const TW=32,TC=8;             // texture tiles in metres: window/slit walls, plain concrete
 // Six blades in RING ORDER, anticlockwise in plan (increasing atan2(z,x))
 // starting just east of the north portal. w width, t thickness, L length of the
 // profile, R radius of its mid-surface at the foot, lean the inward belly (deg),
 // curl the outward turn at the tip (deg), xk where the curl starts, sl/sg the
 // slant of the tip (how much shorter one edge is, and which), dr a sideways
 // drift of the tip (deg), gap to the next blade in metres at the foot. The
 // south entrance takes whatever angle is left, which the gaps are tuned to put
 // on the south axis; the portal gap is centred on north by construction.
 const BT=[
  {k:'north-east',w:170,t:42,L:790,R:196,lean:6,curl:64,xk:.62,sl:.22,sg:-1,dr:1.5,gap:66},
  {k:'east',      w:150,t:40,L:640,R:206,lean:4,curl:58,xk:.64,sl:.26,sg:1,dr:-2,gap:50},
  {k:'south-east',w:130,t:36,L:480,R:212,lean:3,curl:80,xk:.58,sl:.30,sg:-1,dr:2.5,gap:0},
  {k:'south-west',w:140,t:38,L:560,R:208,lean:4,curl:76,xk:.60,sl:.20,sg:1,dr:-2.5,gap:21},
  {k:'west',      w:165,t:42,L:720,R:202,lean:7,curl:60,xk:.63,sl:.16,sg:-1,dr:2,gap:31},
  {k:'north-west',w:205,t:46,L:900,R:198,lean:5,curl:72,xk:.61,sl:.18,sg:1,dr:-1.5,gap:16}];
 const PGAP=BT[5].gap/200;
 let TH_F=0;
 {let fixed=PGAP;for(let i=0;i<6;i++){fixed+=BT[i].w/BT[i].R;if(i!==2&&i!==5)fixed+=BT[i].gap/BT[i].R;}
  const front=TAU-fixed;let th=-Math.PI/2+PGAP/2;
  for(let i=0;i<6;i++){const B=BT[i];B.phi=th+B.w/(2*B.R);th=B.phi+B.w/(2*B.R);
   if(i===2){TH_F=th+front/2;B.gapA=front;}else B.gapA=i===5?PGAP:B.gap/B.R;th+=B.gapA;}}
 const TH_P=-Math.PI/2;
 // ---- the profiles ----
 for(const B of BT){const n=Math.ceil(B.L/2),ds=B.L/n;B.n=n;B.ds=ds;
  B.r=new Float64Array(n+1);B.y=new Float64Array(n+1);B.b=new Float64Array(n+1);
  let r=B.R,y=0;
  for(let k=0;k<=n;k++){const x=k/n;
   const b=x<B.xk?-B.lean*DEG*Math.sin(Math.PI*x/B.xk):B.curl*DEG*Math.pow((x-B.xk)/(1-B.xk),1.7);
   B.r[k]=r;B.y[k]=y;B.b[k]=b;
   const bm=b;r+=Math.sin(bm)*ds;y+=Math.cos(bm)*ds;}
  B.W=s=>{const x=clamp(s/B.L,0,1);return B.w*(1-.25*x-.65*x*x*x);};
  B.T=s=>{const x=clamp(s/B.L,0,1);return B.t*(1-.6*Math.pow(x,1.5));};
  B.pf=s=>{const f=clamp(s/B.ds,0,B.n-1e-6),k=Math.floor(f),t=f-k;
   return{r:lerp(B.r[k],B.r[k+1],t),y:lerp(B.y[k],B.y[k+1],t),b:lerp(B.b[k],B.b[k+1],t)};};
  B.thc=s=>B.phi+B.dr*DEG*Math.pow(clamp(s/B.L,0,1),2);
  B.th=(u,s)=>B.thc(s)+u*B.W(s)/(2*B.pf(s).r);
  B.P=(u,s,o)=>{const q=B.pf(s),th=B.thc(s)+u*B.W(s)/(2*q.r),h=o*B.T(s)/2,r=q.r+h*Math.cos(q.b);
   return[r*Math.cos(th),q.y-h*Math.sin(q.b),r*Math.sin(th)];};
  B.Ltop=u=>B.L*(1-B.sl*(1-B.sg*u)/2);
  B.sAtY=yy=>{for(let k=0;k<B.n;k++)if(B.y[k+1]>=yy)return(k+(yy-B.y[k])/(B.y[k+1]-B.y[k]))*B.ds;return B.L;};}

 // ---- materials and merge lists ----------------------------------------------
 const LW=[],LS=[],LX=[],LC=[],LH=[],LP=[],LQ=[];
 const mW=dd?MAT.blWinR:MAT.blWin,mS=dd?MAT.blSlitR:MAT.blSlit,mC=dd?MAT.blConcR:MAT.blConc;
 const mH=dd?MAT.blShadeR:MAT.blShade,mP=dd?MAT.blPaveR:MAT.blPave,mQ=dd?MAT.blPoolR:MAT.blPool;

 // ---- palette and small helpers -----------------------------------------------
 const WARMW=new THREE.Color(0xffb870);
 const stone=()=>new THREE.Color().setHSL(rr(.07,.11),rr(.02,.07),dd?rr(.40,.52):rr(.68,.78));
 const stoneD=()=>new THREE.Color().setHSL(rr(.07,.11),rr(.02,.06),dd?rr(.26,.36):rr(.44,.54));
 const shadeC=()=>new THREE.Color().setHSL(rr(.07,.10),rr(.02,.06),dd?rr(.12,.18):rr(.22,.30));
 const litC=()=>WARMW.clone().multiplyScalar(rr(.6,1));
 const leafC=()=>new THREE.Color().setHSL(rr(.18,.32),rr(.18,.42),dd?rr(.14,.26):rr(.22,.36));
 const mossC=()=>new THREE.Color().setHSL(rr(.22,.32),rr(.3,.5),rr(.05,.12));
 const rubC=()=>new THREE.Color().setHSL(rr(.07,.1),rr(.02,.08),rr(.28,.46));
 const person=(x,y,z)=>{kput('figB',[x,y,z],qEuler(0,rng()*TAU,0),1,new THREE.Color().setHSL(rr(0,.1),rr(.2,.5),rr(.25,.5)));
  kput('figH',[x,y,z],null,1,new THREE.Color(0xc9a17e));};
 const plant=(x,y,z,h)=>{kput('trunk',[x,y,z],qEuler(rr(-.05,.05),rng()*TAU,rr(-.05,.05)),
   [h*.16,h*.74,h*.16],new THREE.Color().setHSL(rr(.05,.10),rr(.2,.4),rr(.14,.28)));
  const s0=h*rr(.26,.38);
  kput('leafCard',[x+rr(-.08,.08)*h,y+h*.72,z+rr(-.08,.08)*h],
   qEuler(rr(-.07,.07),rng()*TAU,rr(-.07,.07)),[s0,s0*rr(.7,1.05),s0],leafC());};
 const QB=(xx,yy,zz)=>new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(xx,yy,zz));
 const V3=(a)=>new THREE.Vector3(a[0],a[1],a[2]);
 // a frame on a radial axis: e outward, t along the tangent
 const AXF=th=>({e:[Math.cos(th),0,Math.sin(th)],t:[-Math.sin(th),0,Math.cos(th)],
  q:QB(new THREE.Vector3(Math.sin(th),0,-Math.cos(th)),new THREE.Vector3(0,1,0),new THREE.Vector3(Math.cos(th),0,Math.sin(th)))});
 const at=(F,rho,tt,y)=>[F.e[0]*rho+F.t[0]*tt,y,F.e[2]*rho+F.t[2]*tt];
 const angN=a=>{a=(a+Math.PI)%TAU;if(a<0)a+=TAU;return a-Math.PI;};
 const setUV=(g,nu,nv,f)=>{const A=g.attributes.uv;
  for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++){const t=f(i/nu,j/nv);A.setXY(j*(nu+1)+i,t[0],t[1]);}A.needsUpdate=true;};
 // a hexahedron from 8 corners (bottom 0-3, top 4-7), flat-shaded, UVs in metres
 // projected on each face's dominant plane
 const hexa=(c,list,T)=>{T=T||TC;const pos=[],uv=[];
  for(const f of [[0,1,2,3],[4,5,6,7],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7]]){const p=f.map(i=>c[i]);
   const e1=[p[1][0]-p[0][0],p[1][1]-p[0][1],p[1][2]-p[0][2]],e2=[p[3][0]-p[0][0],p[3][1]-p[0][1],p[3][2]-p[0][2]];
   const nx=Math.abs(e1[1]*e2[2]-e1[2]*e2[1]),ny=Math.abs(e1[2]*e2[0]-e1[0]*e2[2]),nz=Math.abs(e1[0]*e2[1]-e1[1]*e2[0]);
   for(const k of [0,1,2,0,2,3]){const q=p[k];pos.push(q[0],q[1],q[2]);
    if(ny>=nx&&ny>=nz)uv.push(q[0]/T,q[2]/T);else if(nx>=nz)uv.push(q[2]/T,q[1]/T);else uv.push(q[0]/T,q[1]/T);}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();list.push(g);return g;};
 // a box in a radial frame: rho0..rho1 out, tt0..tt1 across, y0..y1
 const fbox=(F,r0,r1,t0,t1,y0,y1,list,T)=>hexa([at(F,r0,t0,y0),at(F,r1,t0,y0),at(F,r1,t1,y0),at(F,r0,t1,y0),
  at(F,r0,t0,y1),at(F,r1,t0,y1),at(F,r1,t1,y1),at(F,r0,t1,y1)],list,T);
 const rotBox=(C,S,Q,list)=>{const c=[];
  for(const [sx,sy,sz] of [[-1,-1,-1],[1,-1,-1],[1,-1,1],[-1,-1,1],[-1,1,-1],[1,1,-1],[1,1,1],[-1,1,1]]){
   const v=new THREE.Vector3(sx*S[0]/2,sy*S[1]/2,sz*S[2]/2).applyQuaternion(Q);c.push([C[0]+v.x,C[1]+v.y,C[2]+v.z]);}
  return hexa(c,list);};
 const jag=(sd,amp,fr)=>u=>amp*(fbm(u*fr+sd*1.7,sd*.37,sd*.11+3.3,3)-.5)*2.4;

 // ============================================================ A BLADE, OR A PIECE OF ONE
 // s0(u)..s1(u) is the stretch of the blade to build. o.inner/o.outer/o.edge/
 // o.top/o.bot are the lists the faces go to (null = not built); o.hI/o.hO the
 // hole predicates on (u,s) for the two faces; o.mid builds the section sheet
 // at mid-thickness wherever either face is holed.
 const piece=(B,s0,s1,o)=>{const nu=44;
  const smin=Math.min(s0(-1),s0(0),s0(1)),smax=Math.max(s1(-1),s1(0),s1(1)),nv=Math.max(3,Math.ceil((smax-smin)/6));
  const S=(a,b)=>{const u=2*a-1;return[u,lerp(s0(u),s1(u),b)];};
  const face=(f,hole,list,T)=>{const g=gridSurface((a,b)=>{const q=S(a,b);return B.P(q[0],q[1],f);},nu,nv,
    {hole:hole?(a,b)=>{const q=S(a,b);return hole(q[0],q[1]);}:null});
   setUV(g,nu,nv,(a,b)=>{const q=S(a,b);return[f*q[0]*B.W(q[1])/2/T,q[1]/T];});list.push(g);};
  if(o.inner)face(-1,o.hI,o.inner,TW);
  if(o.outer)face(1,o.hO,o.outer,TW);
  if(o.mid&&(o.hI||o.hO))face(0,(u,s)=>!((o.hI&&o.hI(u,s))||(o.hO&&o.hO(u,s))),LX,16);
  if(o.edge)for(const e of [-1,1]){const g=gridSurface((a,b)=>B.P(e,lerp(s0(e),s1(e),b),2*a-1),2,nv,{});
   setUV(g,2,nv,(a,b)=>{const s=lerp(s0(e),s1(e),b);return[(2*a-1)*B.T(s)/2/TW,s/TW];});o.edge.push(g);}
  for(const [cap,sf] of [[o.top,s1],[o.bot,s0]]){if(!cap)continue;
   const g=gridSurface((a,b)=>{const u=2*a-1;return B.P(u,sf(u),2*b-1);},nu,2,{});
   setUV(g,nu,2,(a,b)=>{const u=2*a-1,s=sf(u);return[u*B.W(s)/2/16,(2*b-1)*B.T(s)/2/16];});cap.push(g);}};

 // ============================================================ THE RUIN'S PLAN
 // Which blades stand whole, which lose their curls, which snap — decided here
 // because the galleries, bridges, canopy and presets all need to know.
 for(let i=0;i<6;i++){const B=BT[i];B.sd=11+i*7.3;
  B.s0=()=>0;B.s1=B.Ltop;B.brk=null;}
 if(dd){
  const CR=[.90,.88,.93,null,.86,null];
  for(let i=0;i<6;i++){const B=BT[i];
   if(CR[i]){const jj=jag(B.sd,16,3.2),c=CR[i];B.s1=u=>B.Ltop(u)*c+jj(u)-8;}}
  // the north-west blade: snapped at 410 m, upper part out on the plain in three
  {const B=BT[5];const j1=jag(B.sd+1,20,2.6),j2=jag(B.sd+2,14,3.4),j3=jag(B.sd+3,14,3.1),j4=jag(B.sd+4,12,2.9);
   B.brk={cut:410,dir:1,RL:350,
    lines:[u=>410+j1(u)+14*u,u=>575+j2(u),u=>735+j3(u),u=>B.Ltop(u)*.95+j4(u)-6],
    segs:[{yaw:.05,roll:.07,gap:0},{yaw:-.10,roll:-.12,gap:16},{yaw:.17,roll:.22,gap:40}]};
   B.s1=B.brk.lines[0];}
  // the south-west blade: snapped at 280 m, fell into the plaza
  {const B=BT[3];const j1=jag(B.sd+1,16,2.8),j2=jag(B.sd+2,12,3.3),j3=jag(B.sd+3,10,3);
   B.brk={cut:280,dir:-1,RL:158,
    lines:[u=>280+j1(u)-10*u,u=>430+j2(u),u=>B.Ltop(u)*.93+j3(u)-6],
    segs:[{yaw:-.12,roll:.05,gap:0},{yaw:.05,roll:-.10,gap:10}]};
   B.s1=B.brk.lines[0];}}
 // hole predicates, ruin only: more near the top of whatever is left
 const holeFor=(B,sd,thr)=>{if(!dd)return null;
  const top=Math.min(B.s1(-1),B.s1(0),B.s1(1));
  return(u,s)=>{if(s<PY+8)return false;const n=fbm(u*1.7+sd,s/64,sd*.3,3),near=clamp((s-(top-140))/140,0,1);
   return n<thr+.24*near;};};

 // ============================================================ THE STANDING BLADES
 for(const B of BT){
  B.hI=holeFor(B,B.sd,.27);B.hO=holeFor(B,B.sd+5.5,.22);
  piece(B,B.s0,B.s1,{inner:LW,outer:LS,edge:LS,top:dd?LX:LS,hI:B.hI,hO:B.hO,mid:dd});
  B.topMin=Math.min(B.s1(-1),B.s1(0),B.s1(1));}

 // ============================================================ THE FALLEN PIECES
 // Each is the SAME piece() of the same blade between two break lines, turned
 // about the tangent at its hinge until its chord lies flat, carried out (or in)
 // to where it came down, given a little yaw and roll of its own and settled
 // into the ground. The matrices are kept for dressing them afterwards.
 const FALL=[];
 const LWf=[],LSf=[],LXf=[];
 for(const B of BT){if(!B.brk)continue;const K=B.brk,dir=K.dir;
  const e=new THREE.Vector3(Math.cos(B.phi),0,Math.sin(B.phi)),k=new THREE.Vector3(0,1,0).cross(e).normalize();
  const H=V3(B.P(0,K.cut,dir>0?1:-1)),Tp=V3(B.P(0,K.lines[K.lines.length-1](0),0));
  const rH=Math.hypot(H.x,H.z),rT=Math.hypot(Tp.x,Tp.z),gam=Math.atan2(rT-rH,Tp.y-H.y);
  const ang=dir>0?Math.PI/2-gam:-(Math.PI/2+gam);
  const land=e.clone().multiplyScalar(K.RL);land.y=dir>0?0:PY;
  const M0=new THREE.Matrix4().makeTranslation(land.x,land.y,land.z)
   .multiply(new THREE.Matrix4().makeRotationAxis(k,ang))
   .multiply(new THREE.Matrix4().makeTranslation(-H.x,-H.y,-H.z));
  const along=e.clone().multiplyScalar(dir);
  let acc=0;
  for(let si=0;si<K.segs.length;si++){const sg=K.segs[si],sA=K.lines[si],sB=K.lines[si+1];
   const tmp={w:[],s:[],x:[]};
   piece(B,sA,sB,{inner:tmp.w,outer:tmp.s,edge:tmp.s,top:tmp.x,bot:tmp.x,hI:null,hO:null});
   const all=[...tmp.w,...tmp.s,...tmp.x];
   for(const g of all)g.applyMatrix4(M0);
   const bb=new THREE.Box3();for(const g of all){g.computeBoundingBox();bb.union(g.boundingBox);}
   const C=bb.getCenter(new THREE.Vector3());acc+=sg.gap;
   const Madj=new THREE.Matrix4().makeTranslation(C.x+along.x*acc,C.y,C.z+along.z*acc)
    .multiply(new THREE.Matrix4().makeRotationY(sg.yaw))
    .multiply(new THREE.Matrix4().makeRotationAxis(along,sg.roll))
    .multiply(new THREE.Matrix4().makeTranslation(-C.x,-C.y,-C.z));
   for(const g of all)g.applyMatrix4(Madj);
   const b2=new THREE.Box3();for(const g of all){g.computeBoundingBox();b2.union(g.boundingBox);}
   const floor=dir>0?-3:PY-2,dy=floor-b2.min.y;
   const Ms=new THREE.Matrix4().makeTranslation(0,dy,0);
   for(const g of all)g.applyMatrix4(Ms);
   const M=Ms.clone().multiply(Madj).multiply(M0);
   LWf.push(...tmp.w);LSf.push(...tmp.s);LXf.push(...tmp.x);
   b2.translate(new THREE.Vector3(0,dy,0));
   FALL.push({B:B,M:M,s0:sA,s1:sB,dir:dir,box:b2,up:dir>0?-1:1});}}
 LW.push(...LWf);LS.push(...LSf);LX.push(...LXf);
 const xf=(M,p)=>{const v=V3(p).applyMatrix4(M);return[v.x,v.y,v.z];};
 // the fallen pieces' footprints, as segments in plan, for the canopy and dressing
 const FOOT=[];
 for(const B of BT){if(!B.brk)continue;const fs=FALL.filter(f=>f.B===B);
  const a=xf(fs[0].M,B.P(0,B.brk.cut+8,0)),z=xf(fs[fs.length-1].M,B.P(0,B.brk.lines[B.brk.lines.length-1](0)-6,0));
  FOOT.push({B:B,a:a,b:z,hw:B.W(B.brk.cut)/2});}
 const segDist=(x,z,F)=>{const ax=F.b[0]-F.a[0],az=F.b[2]-F.a[2],L2=ax*ax+az*az;
  const t=clamp(((x-F.a[0])*ax+(z-F.a[2])*az)/L2,0,1);return Math.hypot(x-F.a[0]-ax*t,z-F.a[2]-az*t);};

 // ============================================================ THE GALLERIES
 // Every six storeys a continuous balcony deck along the concave face: deck,
 // parapet, a dark soffit (shade is painted), end caps. Fins between decks,
 // light strips under them, planting and people on them.
 let NGAL=0;
 for(const B of BT){const sMax=Math.min(B.topMin-16,B.L*.84);
  for(let s=36;s<sMax;s+=24){NGAL++;
   const Pf=(u,dOut,dy)=>{const p=B.P(u,s,-1),th=B.th(u,s);return[p[0]-Math.cos(th)*dOut,p[1]+dy,p[2]-Math.sin(th)*dOut];};
   const uA=-.965,uB=.965,len=(uB-uA)*B.W(s)/2,nu=Math.max(6,Math.round(len/7));
   const gh=dd?(a)=>fbm(lerp(uA,uB,a)*3.3+s*.07,s*.013,5.1+B.sd,2)<.40:null;
   const U=a=>lerp(uA,uB,a);
   LH.push(gridSurface((a,b)=>Pf(U(a),lerp(-1,4.2,b),-1.2),nu,1,{hole:gh?(a,b)=>gh(a):null,uS:len/TC,vS:5.2/TC}));
   const PL=[[4.2,-1.2],[4.2,1.1],[3.85,1.1],[3.85,0],[-1,0]];
   LC.push(gridSurface((a,b)=>{const f=b*4,k=Math.min(3,Math.floor(f)),t=f-k;
     return Pf(U(a),lerp(PL[k][0],PL[k+1][0],t),lerp(PL[k][1],PL[k+1][1],t));},nu,4,{hole:gh?(a,b)=>gh(a):null,uS:len/TC,vS:8/TC}));
   if(!dd)for(const u of [uA,uB]){
    LC.push(gridSurface((p,q)=>Pf(u,lerp(-1,4.2,p),lerp(-1.2,0,q)),1,1,{}));
    LC.push(gridSurface((p,q)=>Pf(u,lerp(3.85,4.2,p),lerp(0,1.1,q)),1,1,{}));}
   // strips under the soffit, every other deck
   if(!dd&&(NGAL%2===0))for(let a=0;a<nu;a+=2){const p0=Pf(U(a/nu),3.8,-1.45),p1=Pf(U((a+1)/nu),3.8,-1.45);
    kput('strip',[(p0[0]+p1[0])/2,p0[1],(p0[2]+p1[2])/2],qEuler(0,-Math.atan2(p1[2]-p0[2],p1[0]-p0[0]),0),
     [Math.hypot(p1[0]-p0[0],p1[2]-p0[2])*.9,3,3],WARMW);}
   // fins up to the next deck
   const nf=Math.max(2,Math.round(B.W(s)/19));
   if(s+24<sMax)for(let f=0;f<nf;f++){const u=-1+(2*f+1)/nf;if(Math.abs(u)>.93)continue;
    if(dd&&rng()<.35){if(rng()<.3){const p=Pf(u,1.5,-rr(2,14));
      kput('blBox',p,qEuler(rr(-.5,.5),rng()*TAU,rr(-.5,.5)),[.8,rr(6,16),3.4],stoneD());}continue;}
    const th=B.th(u,s),n=[-Math.cos(th),0,-Math.sin(th)];
    const pb=B.P(u,s,-1),pt=B.P(u,s+22.8,-1);
    const a0=[pb[0]+n[0]*.8,pb[1],pb[2]+n[2]*.8],a1=[pt[0]+n[0]*.8,pt[1],pt[2]+n[2]*.8];
    const yy=V3([a1[0]-a0[0],a1[1]-a0[1],a1[2]-a0[2]]),L=yy.length();yy.normalize();
    const xx=new THREE.Vector3(-Math.sin(th),0,Math.cos(th)),zz=new THREE.Vector3().crossVectors(xx,yy).normalize();xx.crossVectors(yy,zz);
    kput('blBox',[(a0[0]+a1[0])/2,(a0[1]+a1[1])/2,(a0[2]+a1[2])/2],QB(xx,yy,zz),[.9,L,3.6],stone());}
   // life on the deck, or what grew on it
   if(!dd){for(let j=0;j<3;j++)if(rng()<.8){const p=Pf(rr(-.9,.9),rr(.6,3),0);person(p[0],p[1],p[2]);}
    for(let j=0;j<Math.round(len/40);j++)if(rng()<.55){const p=Pf(rr(-.92,.92),3.1,0);plant(p[0],p[1],p[2],rr(2.5,4.5));}}
   else{for(let j=0;j<Math.round(len/14);j++){const u=rr(-.93,.93);if(gh((u-uA)/(uB-uA)))continue;
     const p=Pf(u,rr(.5,3.5),.35);kput('moss',p,qEuler(0,rng()*TAU,0),[rr(1.5,4),rr(.4,.9),rr(1.2,2.6)],mossC());
     if(rng()<.35){const q=Pf(u,4.25,-1.2);kput('vine',q,qEuler(rr(-.08,.08),0,rr(-.08,.08)),[1.3,rr(6,34),1.3],null);}
     if(rng()<.12){const q=Pf(u,2.5,0);plant(q[0],q[1],q[2],rr(2,5));}}
    // a run of deck hanging by one end
    if(rng()<.25){const u=rr(-.7,.7),p=Pf(u,3,-rr(4,10));
     kput('blBox',p,qEuler(rr(-.9,.9),-B.th(u,s),rr(-.3,.3)),[rr(10,24),1.2,5],stoneD());}}}}

 // gardens in the upturned face of each curl
 if(!dd)for(const B of BT){const s0=B.L*(B.xk+.12);
  for(let j=0;j<46;j++){const u=rr(-.85,.85),s=rr(s0,B.topMin-10);if(s<=s0)continue;const q=B.pf(s);if(q.b<.35)continue;
   const p=B.P(u,s,-1);plant(p[0],p[1]-.4,p[2],rr(4,8));}}

 // ============================================================ THE SKY BRIDGES
 // Inhabited box girders across the narrower gaps; the ruin keeps some, leaves
 // stubs of others and drops the rest.
 const BR=[[0,190],[0,430],[1,280],[3,160],[3,350],[4,250],[4,520],[5,300],[5,600]];
 for(const [i,y] of BR){const A=BT[i],Bn=BT[(i+1)%6];
  const sa=A.sAtY(y),sb=Bn.sAtY(y);
  const okA=sa<A.s1(.985)-10,okB=sb<Bn.s1(-.985)-10;
  const pa=A.P(.985,sa,0),pb=Bn.P(-.985,sb,0);
  const ax=V3([pb[0]-pa[0],0,pb[2]-pa[2]]).normalize(),sd=new THREE.Vector3(-ax.z,0,ax.x);
  const box=(p,q,hw,hh)=>hexa([[p[0]-sd.x*hw,p[1]-hh,p[2]-sd.z*hw],[q[0]-sd.x*hw,q[1]-hh,q[2]-sd.z*hw],
   [q[0]+sd.x*hw,q[1]-hh,q[2]+sd.z*hw],[p[0]+sd.x*hw,p[1]-hh,p[2]+sd.z*hw],
   [p[0]-sd.x*hw,p[1]+hh,p[2]-sd.z*hw],[q[0]-sd.x*hw,q[1]+hh,q[2]-sd.z*hw],
   [q[0]+sd.x*hw,q[1]+hh,q[2]+sd.z*hw],[p[0]+sd.x*hw,p[1]+hh,p[2]+sd.z*hw]],LW,TW);
  const broken=dd&&(!okA||!okB||rng()<.45);
  if(!dd||!broken){if(!okA||!okB)continue;
   box(pa,pb,5.5,7);
   if(!dd){kput('strip',[(pa[0]+pb[0])/2,y-7.4,(pa[2]+pb[2])/2],qEuler(0,-Math.atan2(pb[2]-pa[2],pb[0]-pa[0]),0),
     [Math.hypot(pb[0]-pa[0],pb[2]-pa[2])*.9,4,4],WARMW);
    for(let j=0;j<4;j++){const t=rr(.2,.8);person(lerp(pa[0],pb[0],t),y+7,lerp(pa[2],pb[2],t));}}
   else kput('moss',[(pa[0]+pb[0])/2,y+7.2,(pa[2]+pb[2])/2],null,[8,.8,4],mossC());
   continue;}
  // a stub off whichever end survives, and the rest on the ground below
  const from=okA?pa:okB?pb:null,to=okA?pb:pa;
  const f=rr(.3,.55);
  if(from){const m=[lerp(from[0],to[0],f),y,lerp(from[2],to[2],f)];box(from,m,5.5,7);
   for(let j=0;j<6;j++)kput('blBox',[m[0]+rr(-2,2),y+rr(-6,6),m[2]+rr(-2,2)],qEuler(rng(),rng(),rng()),[rr(1,3),rr(1,3),rr(1,3)],stoneD());}
  const mx=(pa[0]+pb[0])/2,mz=(pa[2]+pb[2])/2,rm=Math.hypot(mx,mz);
  const gy=rm<200?PY:rm<260?PY:12;
  const L=Math.hypot(pb[0]-pa[0],pb[2]-pa[2])*(1-f)*.9;
  rotBox([mx,gy+4,mz],[L,11,12],qEuler(rr(-.12,.12),-Math.atan2(pb[2]-pa[2],pb[0]-pa[0])+rr(-.5,.5),rr(-.25,.25)),LC);
  rubbleRing(mx,gy,mz,4,40,40,4);}

 // ============================================================ THE CANOPY
 // A coffered ring at 118-125 m spanning blade to blade and across every gap,
 // buried in each blade to its mid-surface so it reads as carried by them, with
 // a great oculus in the middle.
 const sC=BT.map(B=>B.sAtY((YC0+YC1)/2));
 const Rout=th=>{
  for(let i=0;i<6;i++){const B=BT[i],s=sC[i],q=B.pf(s),al=B.W(s)/(2*q.r);
   if(Math.abs(angN(th-B.thc(s)))<=al)return q.r;}
  for(let i=0;i<6;i++){const A=BT[i],Bn=BT[(i+1)%6],sa=sC[i],sb=sC[(i+1)%6];
   const ea=A.th(1,sa),eb=Bn.th(-1,sb),span=angN(eb-ea),off=angN(th-ea);
   if(span>0&&off>=0&&off<=span)return lerp(A.pf(sa).r,Bn.pf(sb).r,off/span);}
  return 180;};
 const NCT=360,RA=[];for(let i=0;i<=NCT;i++)RA.push(Rout(i/NCT*TAU));
 const RAt=a=>RA[Math.round(a*NCT)];
 const cHole=dd?(th,r)=>{const x=r*Math.cos(th),z=r*Math.sin(th);
   if(FOOT.some(F=>segDist(x,z,F)<F.hw+18))return true;
   return fbm(th*2.6,r/34,6.6,2)<.50;}:null;
 {const cf=(y)=>(a,b)=>{const th=a*TAU,r=lerp(RO,RAt(a),b);return[r*Math.cos(th),y,r*Math.sin(th)];};
  const hl=cHole?(a,b)=>cHole(a*TAU,lerp(RO,RA[Math.floor(a*NCT)],b)):null;
  LC.push(gridSurface(cf(YC1),NCT,3,{hole:hl,uS:TAU*150/TC,vS:70/TC}));
  LH.push(gridSurface(cf(YC0),NCT,3,{hole:hl,uS:TAU*150/TC,vS:70/TC}));
  LC.push(gridSurface((a,b)=>{const th=a*TAU;return[RO*Math.cos(th),lerp(YC0,YC1,b),RO*Math.sin(th)];},NCT,1,
   {hole:cHole?(a,b)=>cHole(a*TAU,RO+2):null,uS:TAU*RO/TC,vS:1}));
  LC.push(gridSurface((a,b)=>{const th=a*TAU,r=RAt(a);return[r*Math.cos(th),lerp(YC0,YC1,b),r*Math.sin(th)];},NCT,1,
   {hole:cHole?(a,b)=>cHole(a*TAU,RA[Math.floor(a*NCT)]-2):null,uS:TAU*190/TC,vS:1}));}
 // coffers: radial ribs and a ring beam under the soffit, an upstand round the oculus
 for(let i=0;i<120;i++){const th=(i+.5)/120*TAU,r1=Rout(th)-1,r0=RO+1;if(r1<r0+4)continue;
  const rm=(r0+r1)/2;
  if(dd&&cHole(th,rm)){if(rng()<.3)kput('blBox',[rm*Math.cos(th),YC0-rr(10,40),rm*Math.sin(th)],
    qEuler(rr(-.5,.5),-th,rr(-.6,.6)),[rr(10,30),4.5,2.2],shadeC());continue;}
  kput('blBox',[rm*Math.cos(th),YC0-2.25,rm*Math.sin(th)],qEuler(0,-th,0),[r1-r0,4.5,2.2],shadeC());}
 for(const rr0 of [RO+2,148]){const n=Math.round(TAU*rr0/9);
  for(let i=0;i<n;i++){const th=(i+.5)/n*TAU;if(Rout(th)<rr0+3)continue;
   if(dd&&cHole(th,rr0))continue;
   kput('blBox',[rr0*Math.cos(th),YC0-1.75,rr0*Math.sin(th)],qEuler(0,-th-Math.PI/2,0),[TAU*rr0/n*1.02,3.5,2.6],shadeC());
   if(!dd&&i%2===0&&rr0>RO+2)kput('strip',[rr0*Math.cos(th),YC0-3.8,rr0*Math.sin(th)],qEuler(0,-th-Math.PI/2,0),[TAU*rr0/n*.8,4,4],WARMW);}}
 {const n=96;for(let i=0;i<n;i++){const th=(i+.5)/n*TAU;if(dd&&cHole(th,RO+1))continue;
   kput('blBox',[(RO+.8)*Math.cos(th),YC1+1.3,(RO+.8)*Math.sin(th)],qEuler(0,-th-Math.PI/2,0),[TAU*RO/n*1.02,2.6,1.6],stone());
   if(!dd)kput('strip',[(RO-.4)*Math.cos(th),YC0-.3,(RO-.4)*Math.sin(th)],qEuler(0,-th-Math.PI/2,0),[TAU*RO/n*.8,4,4],WARMW);}}

 // ============================================================ THE PLINTH
 // Two stepped tiers, 12 m each, the lower one a planted terrace; the upper
 // one's top is the plaza floor, and every blade rises through it from y=0.
 const Rp1=th=>300+14*Math.sin(2*th+.7)+9*Math.sin(3*th-1.1),Rp2=th=>Rp1(th)-34;
 const RS=Rp2(TH_F);
 const stairCut=(th,r)=>Math.abs(angN(th-TH_F))*r<44;
 LC.push(gridSurface((a,b)=>{const th=a*TAU,r=Rp1(th);return[r*Math.cos(th),b*12,r*Math.sin(th)];},240,1,
  {hole:(a,b)=>stairCut(a*TAU,300),uS:TAU*300/TC,vS:12/TC}));
 LC.push(gridSurface((a,b)=>{const th=a*TAU,r=Rp2(th);return[r*Math.cos(th),12+b*12,r*Math.sin(th)];},240,1,
  {hole:(a,b)=>stairCut(a*TAU,266),uS:TAU*266/TC,vS:12/TC}));
 LP.push(gridSurface((a,b)=>{const th=a*TAU,r=lerp(Rp2(th),Rp1(th),b);return[r*Math.cos(th),12,r*Math.sin(th)];},240,2,
  {uS:TAU*283/16,vS:34/16}));
 LP.push(gridSurface((a,b)=>{const th=a*TAU,r=Rp2(th)*Math.pow(b,.8);return[r*Math.cos(th),PY,r*Math.sin(th)];},240,10,
  {uS:TAU*140/16,vS:266/16}));
 // copings on both tier lips, lit slots into the base of the city
 for(const [Rf,y] of [[Rp1,12],[Rp2,PY]]){const n=180;
  for(let i=0;i<n;i++){const th=(i+.5)/n*TAU,r=Rf(th);if(stairCut(th,r))continue;if(dd&&rng()<.2)continue;
   kput('blBox',[(r+.6)*Math.cos(th),y-.6,(r+.6)*Math.sin(th)],qEuler(0,-th-Math.PI/2,0),[TAU*r/n*1.01,1.2,1.6],stoneD());
   if(i%6===3){const F=AXF(th);
    kput('blDim',[(r+.2)*Math.cos(th),y-6.2,(r+.2)*Math.sin(th)],F.q,[4.5,8,.6],null);
    if(!dd)kput('strip',[(r+.5)*Math.cos(th),y-2,(r+.5)*Math.sin(th)],qEuler(0,-th-Math.PI/2,0),[4,4,4],WARMW);}}}

 // ============================================================ THE SOUTH STAIR AND AVENUE
 {const F=AXF(TH_F),N=80,RUN=1.3,HW=42;
  for(let k=0;k<N;k++){const rho=RS-2+(k+.5)*RUN,h=PY-k*.3;
   if(dd&&rng()<.08)continue;
   const hh=dd?h-rr(0,.5):h;
   kput('blBox',at(F,rho,0,hh/2),F.q,[HW*2,hh,RUN+.02],stone());}
  const R1=RS-2+N*RUN;
  for(const sx of [-1,1]){const t0=sx*HW,t1=sx*(HW+7);
   hexa([at(F,RS-4,t0,0),at(F,R1+3,t0,0),at(F,R1+3,t1,0),at(F,RS-4,t1,0),
    at(F,RS-4,t0,PY+1.4),at(F,R1+3,t0,1.4),at(F,R1+3,t1,1.4),at(F,RS-4,t1,PY+1.4)],LC);
   for(let j=0;j<8;j++){const rho=lerp(RS+4,R1-4,j/7),y=lerp(PY+1.4,1.4,(rho-RS+4)/(R1-RS+7));
    kput('blBox',at(F,rho,sx*(HW+3.5),y+2),F.q,[.6,4,.6],stoneD());
    if(!dd)kput('strip',at(F,rho,sx*(HW+3.5),y+4.2),null,[4,6,6],WARMW);}}
  // the avenue
  const AL=dd?380:640;
  LP.push(gridSurface((a,b)=>at(F,lerp(R1,R1+AL,b),lerp(-36,36,a),.25),4,20,
   {hole:dd?(a,b)=>fbm(a*3,b*24,4.4,2)<.40:null,uS:72/16,vS:AL/16}));
  for(const sx of [-1,1])for(let rho=R1+14;rho<R1+AL-8;rho+=18){
   if(dd&&rng()<.4)continue;
   plant(...at(F,rho,sx*44,.2),rr(9,15));}
  if(!dd){for(let j=0;j<90;j++)person(...at(F,rr(R1,R1+AL*.8),rr(-32,32),.25));
   for(let j=0;j<60;j++){const k=Math.floor(rng()*N);person(...at(F,RS-2+(k+.5)*RUN,rr(-HW+2,HW-2),PY-k*.3));}}
  else{for(let j=0;j<5;j++)person(...at(F,rr(R1,R1+200),rr(-30,30),.25));
   const pr=at(F,R1+8,0,0);rubbleRing(pr[0],0,pr[2],6,70,90,5);}}

 // ============================================================ THE PORTAL STAIR, THE PORTAL, THE BASTION
 // On the north axis: 120 steps in three flights, narrowing from 44 m to 13 m,
 // climb 36 m from the plaza into a slot between the two tallest blades; a
 // lintel caps it at 106-134 m; beyond it a bastion stands out over the plain.
 const PT={y:PY+36};
 {const F=AXF(TH_P);let rho=66;const RUN=.78,LND=6;
  for(let k=0;k<120;k++){const w=lerp(44,13,(rho-66)/106),h=(k+1)*.3;
   if(!(dd&&rng()<.1))kput('blBox',at(F,rho+RUN/2,0,PY+h/2),F.q,[w,h,RUN+.02],stone());
   rho+=RUN;
   if(k===39||k===79){const w2=lerp(44,13,(rho+LND/2-66)/106);
    kput('blBox',at(F,rho+LND/2,0,PY+h/2),F.q,[w2,h,LND+.02],stone());rho+=LND;}}
  PT.rTop=rho;
  // cheek walls
  for(const sx of [-1,1])
   hexa([at(F,64,sx*22,PY),at(F,rho,sx*6.5,PY),at(F,rho,sx*9.5,PY),at(F,64,sx*25,PY),
    at(F,64,sx*22,PY+1.3),at(F,rho,sx*6.5,PT.y+1.3),at(F,rho,sx*9.5,PT.y+1.3),at(F,64,sx*25,PY+1.3)],LC);
  // the passage through the gap, the lintel, bronze-dark jambs
  fbox(F,rho-.5,236,-11,11,PY,PT.y,LC);
  fbox(F,rho+1,234,-12,12,106,134,LC);
  for(const sx of [-1,1]){kput('blBox',at(F,rho+3,sx*6.6,(PT.y+106)/2),F.q,[1.4,106-PT.y,4],shadeC());
   if(!dd)kput('strip',at(F,rho+3,sx*5.7,(PT.y+106)/2),F.q,[.3,(106-PT.y)*.9/.18,2],WARMW);}
  // the bastion
  fbox(F,234,284,-26,26,0,PT.y,LC);
  for(const [a0,a1,b0,b1] of [[282.5,284,-26,26],[236,284,-26,-24.5],[236,284,24.5,26]])
   if(!(dd&&rng()<.4))fbox(F,a0,a1,b0,b1,PT.y,PT.y+1.2,LC);
  fbox(F,272,280,-4,4,PT.y,PT.y+6,LC);
  if(!dd){kput('strip',at(F,276,0,PT.y+6.6),null,[40,30,30],WARMW);
   for(let j=0;j<24;j++)person(...at(F,rr(238,280),rr(-22,22),PT.y));
   for(let j=0;j<50;j++){const k=Math.floor(rng()*120),r=66+k*.78+(k>39?6:0)+(k>79?6:0);
    person(...at(F,r+.4,rr(-1,1)*lerp(20,5,(r-66)/106),PY+(k+1)*.3));}
   for(let j=0;j<10;j++)person(...at(F,rr(rho+2,232),rr(-5,5),PT.y));}
  else{rubbleRing(...[F.e[0]*(rho-20),PY,F.e[2]*(rho-20)],4,40,70,4);
   for(let j=0;j<18;j++)kput('moss',at(F,rr(240,280),rr(-22,22),PT.y+.3),null,[rr(2,5),.6,rr(2,5)],mossC());
   plant(...at(F,262,-12,PT.y),rr(7,11));plant(...at(F,250,15,PT.y),rr(5,9));}
  PT.F=F;}

 // ============================================================ THE PLAZA
 // Paved floor (the tier top), a reflecting pool under the oculus with a rim,
 // planters and trees under the canopy, lamps, and a great many people.
 LQ.push(gridSurface((a,b)=>{const th=a*TAU,r=38*b;return[r*Math.cos(th),PY+.28,r*Math.sin(th)];},64,2,{}));
 for(let i=0;i<48;i++){const th=(i+.5)/48*TAU;
  kput('blBox',[39*Math.cos(th),PY+.45,39*Math.sin(th)],qEuler(0,-th-Math.PI/2,0),[TAU*39/48*1.02,.9,1.8],stone());}
 for(let i=0;i<22;i++){const th=(i+.5)/22*TAU+.07,r=rr(122,146);
  if(Math.abs(angN(th-TH_P))<.2||Math.abs(angN(th-TH_F))<.2)continue;
  const x=r*Math.cos(th),z=r*Math.sin(th);
  kput('blBox',[x,PY+.6,z],qEuler(0,-th,0),[7,1.2,7],stoneD());
  if(!dd)plant(x,PY+1.2,z,rr(9,14));}
 if(!dd){
  for(let i=0;i<260;i++){const th=rng()*TAU,r=rr(42,150);person(r*Math.cos(th),PY,r*Math.sin(th));}
  for(let i=0;i<30;i++){const th=(i+.5)/30*TAU,r=100;
   kput('blBox',[r*Math.cos(th),PY+2.5,r*Math.sin(th)],null,[.4,5,.4],stoneD());
   kput('strip',[r*Math.cos(th),PY+5.2,r*Math.sin(th)],null,[3,5,5],WARMW);}}
 // the landscaped ground round the plinth
 if(!dd){trees(0,0,330,900,110);
  for(let i=0;i<70;i++){const th=(i+.5)/70*TAU;if(stairCut(th,300))continue;
   const r=lerp(Rp2(th),Rp1(th),.55);plant(r*Math.cos(th),12,r*Math.sin(th),rr(6,10));}
  for(let i=0;i<60;i++){const th=rng()*TAU;const r=lerp(Rp2(th),Rp1(th),rr(.2,.9));person(r*Math.cos(th),12,r*Math.sin(th));}}
 else trees(0,0,300,950,260);

 // ============================================================ THE RUIN'S DRESSING
 if(dd){
  // ---- the breaks: floor-plate fragments and bars standing out of every snapped
  // or crumbled top
  for(const B of BT){const n=Math.round(B.W(B.topMin)/5);
   for(let j=0;j<n;j++){const u=rr(-.95,.95),s=B.s1(u),o=rr(-.8,.8),p=B.P(u,s,o);
    if(rng()<.55)kput('blBox',[p[0],p[1]+rr(-2,1),p[2]],qEuler(rr(-.3,.3),-B.th(u,s),rr(-.4,.4)),[rr(3,9),.8,rr(4,11)],stoneD());
    else beam('blDim',p,[p[0]+rr(-2,2),p[1]+rr(5,15),p[2]+rr(-2,2)],.35,.35,null);
    if(rng()<.3)kput('moss',[p[0],p[1]+.4,p[2]],null,[rr(2,5),.7,rr(2,5)],mossC());}}
  // ---- stains down both faces
  for(const B of BT)for(let j=0;j<Math.round(B.w*.45);j++){const u=rr(-.95,.95),s=rr(PY+10,B.topMin-10),o=rng()<.6?-1:1;
   const th=B.th(u,s),n=[o*Math.cos(th),0,o*Math.sin(th)],p=B.P(u,s,o),L=rr(12,50);
   kput('stain',[p[0]+n[0]*.4,p[1]-L*.4,p[2]+n[2]*.4],qFacing(n),[rr(3,10),L,1],null);}
  // ---- the fallen pieces: moss and trees on what is now their top face, vines
  // off their edges, rubble along both sides
  for(const f of FALL){const B=f.B,up=f.up;
   for(let j=0;j<70;j++){const u=rr(-.9,.9),t=rng(),s=lerp(f.s0(u),f.s1(u),t),p=xf(f.M,B.P(u,s,up));
    kput('moss',[p[0],p[1]+.3,p[2]],qEuler(0,rng()*TAU,0),[rr(2,6),rr(.5,1.1),rr(2,6)],mossC());
    if(rng()<.18)plant(p[0],p[1],p[2],rr(4,10));}
   for(let j=0;j<16;j++){const e=rng()<.5?-1:1,s=lerp(f.s0(e),f.s1(e),rng()),p=xf(f.M,B.P(e,s,up));
    kput('vine',p,null,[1.5,Math.max(3,p[1]-(f.dir>0?0:PY)),1.5],null);}
   const c=f.box.getCenter(new THREE.Vector3()),sz=f.box.getSize(new THREE.Vector3());
   rubbleRing(c.x,f.dir>0?0:PY,c.z,Math.min(sz.x,sz.z)*.35,Math.max(sz.x,sz.z)*.62,f.dir>0?220:120,9);}
  // the stumps' own talus, outside and in
  for(const B of BT){const bo=B.P(0,4,1),bi=B.P(0,PY+2,-1),ro=Rp1(B.phi)+6;
   rubbleRing(ro*Math.cos(B.phi),0,ro*Math.sin(B.phi),4,B.brk?160:90,B.brk?160:60,B.brk?10:7);
   rubbleRing(bi[0],PY,bi[2],3,B.brk?90:55,B.brk?150:80,B.brk?9:6);}
  // ---- the plaza, choked: the canopy down in slabs, blocks, rubble, moss, trees
  for(let j=0;j<46;j++){const th=rng()*TAU,r=rr(RO+4,Rout(th)-10);if(!cHole(th,r))continue;
   const x=r*Math.cos(th),z=r*Math.sin(th);
   rotBox([x,PY+rr(1,4),z],[rr(16,38),7,rr(10,26)],qEuler(rr(-.35,.35),rng()*TAU,rr(-.35,.35)),LC);}
  for(let j=0;j<120;j++){const th=rng()*TAU,r=rr(10,160);
   kput('blBox',[r*Math.cos(th),PY+rr(.5,3),r*Math.sin(th)],qEuler(rr(-.6,.6),rng()*TAU,rr(-.6,.6)),[rr(3,12),rr(2,7),rr(3,10)],stoneD());}
  rubbleRing(0,PY,0,40,170,420,7);
  scatterMoss(0,PY,0,5,175,260,5);
  for(let j=0;j<90;j++){const th=rng()*TAU,r=rr(15,170);plant(r*Math.cos(th),PY,r*Math.sin(th),rr(5,14));}
  for(let j=0;j<60;j++){const th=rng()*TAU;const r=lerp(Rp2(th),Rp1(th),rr(.1,.9));
   if(rng()<.5)plant(r*Math.cos(th),12,r*Math.sin(th),rr(6,13));
   else kput('moss',[r*Math.cos(th),12.3,r*Math.sin(th)],null,[rr(3,7),.8,rr(3,7)],mossC());}
  // vines down the plinth
  for(const [Rf,y] of [[Rp1,12],[Rp2,PY]])for(let j=0;j<70;j++){const th=rng()*TAU,r=Rf(th);
   kput('vine',[(r+.8)*Math.cos(th),y,(r+.8)*Math.sin(th)],qEuler(rr(-.1,.1),0,rr(-.1,.1)),[1.3,rr(4,12),1.3],null);}}

 // ============================================================ THE REGISTRY
 const topY=B=>Math.max(...[-1,0,1].map(u=>B.P(u,B.s1(u),0)[1]));
 REGISTER({name:'The Blades ('+STATE(d)+')',x:0,z:0,r:dd?900:470,h:(dd?760:880)});
 for(const B of BT){const c=B.P(0,0,0);
  REGISTER({name:'The Blades — the '+B.k+' blade'+(B.brk?' (snapped)':dd?' (its curl gone)':''),x:c[0],z:c[2],r:B.w/2+(dd?40:100),h:topY(B)+12});}
 REGISTER({name:'The Blades — the covered plaza',x:0,z:0,r:150,y:PY,h:YC0-PY});
 REGISTER({name:'The Blades — the canopy',x:0,z:0,r:200,y:YC0-6,h:YC1-YC0+10});
 {const F=PT.F,c=at(F,120,0,0),p=at(F,205,0,0),b=at(F,259,0,0),s=at(AXF(TH_F),RS+50,0,0);
  REGISTER({name:'The Blades — the portal stair',x:c[0],z:c[2],r:56,y:PY,h:40});
  REGISTER({name:'The Blades — the portal',x:p[0],z:p[2],r:32,y:PY,h:112});
  REGISTER({name:'The Blades — the bastion',x:b[0],z:b[2],r:34,h:PT.y+8});
  REGISTER({name:'The Blades — the south stair',x:s[0],z:s[2],r:62,h:PY+4});}
 for(const Fp of FOOT){const m=[(Fp.a[0]+Fp.b[0])/2,(Fp.a[2]+Fp.b[2])/2],L=Math.hypot(Fp.b[0]-Fp.a[0],Fp.b[2]-Fp.a[2]);
  REGISTER({name:Fp.B.brk.dir>0?'The Blades — the fallen '+Fp.B.k+' blade':'The Blades — the '+Fp.B.k+' blade, fallen across the plaza',
   x:m[0],z:m[1],r:L/2+40,y:Fp.B.brk.dir>0?0:PY-4,h:90});}

 // ---- what the presets are derived from ---------------------------------------
 BL_SITE[d]={x:gx,z:gz,d:d,dd:dd,PY:PY,YC0:YC0,YC1:YC1,RO:RO,THF:TH_F,THP:TH_P,RS:RS,RP1F:Rp1(TH_F),PTY:PT.y,PTR:PT.rTop,
  blades:BT.map(B=>({k:B.k,phi:B.phi,R:B.R,w:B.w,t:B.t,L:B.L,top:topY(B),
   tip:B.P(B.sg,B.s1(B.sg),0),face300:B.P(0,B.sAtY(Math.min(300,topY(B)*.5)),-1),brk:!!B.brk})),
  fall:FOOT.map(F=>({k:F.B.k,dir:F.B.brk.dir,a:F.a,b:F.b})),
  galleries:NGAL};

 // ---- merge ---------------------------------------------------------------------
 meshMerged(LW,mW,G);
 meshMerged(LS,mS,G);
 meshMerged(LX,MAT.blSect,G);
 meshMerged(LC,mC,G);
 meshMerged(LH,mH,G);
 meshMerged(LP,mP,G);
 meshMerged(LQ,mQ,G);
 KOFF=[0,0,0];return G;}
