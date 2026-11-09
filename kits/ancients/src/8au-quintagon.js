// ================================================================= QUINTAGON — the pentagonal star arcology
// A coastal and plains megastructure on a regular PENTAGONAL base (circumradius
// 460 m at the foot, ~880 m across from corner to opposite side) out of which
// rises a bold 5-POINTED STAR superstructure whose five long, faceted white arms
// point straight to the FIVE CORNERS of the pentagon — and project past them as
// sharp triangular prows — while a slender, 5-fluted central spire rises 565 m
// above the plain from a splayed 5-legged flying-buttress collar.
//
// FIVE PARTS, locked to one 5-fold coordinate frame (corner azimuths theta_k =
// 18 + 72*k degrees, flat-side normals phi_k = 54 + 72*k degrees):
//
//   1. THE BATTERED PENTAGONAL BASE (y = 0..68 m)
//      Monolithic inward-sloping alabaster-white perimeter cliffs (460 m radius
//      at the foot battering to 415 m at the rim), ribbed with megastructure
//      panel courses, vertical weathering washes and recessed dark gallery slots,
//      crowned by a continuous raised white perimeter parapet/gallery wall
//      (y = 62..76 m) along all five flat sides of the pentagon. Stepped coastal
//      bastion aprons project from the base corners, and on the eastern seaward
//      corner (k = 0,phi = 342..18 deg) a 260 m breakwater mole and hooked jetty
//      frame a harbour basin.
//
//   2. THE FIVE TRIANGULAR GARDEN COURTS (y = 62..98 m)
//      Because the five star arms radiate to the five corners of the pentagon,
//      the upper deck between adjacent arms is divided into five vast triangular
//      parkland courts — each ~330 m wide along its outer perimeter gallery wall
//      and converging inward to the central star hub. Each court slopes gently
//      upward from 62 m at the outer wall to 98 m at the central podium, bordered
//      by ramped stone avenues along the star-arm flanks and carpeted with lush
//      green lawns, groves of trees, crisscrossing paths, reflecting pools, and
//      dozens of crisp white cubic garden pavilions and skylight kiosks.
//
//   3. THE 5-POINTED STAR SUPERSTRUCTURE (y = 68..122 m, r = 105..565 m)
//      Five long, sharp, angular white architectural arms radiating from the hub
//      along theta_k right through the five pentagon vertices and out to razor
//      spurs at r = 565 m. Each arm has steep inward-battering white sidewalls,
//      a flat alabaster upper spine bordered by green planted boulevard verges,
//      and a secondary parallel chevron wing-blade defining a deep V-shaped
//      atrium canyon with cobalt-blue glazed curtain walls and intake apertures.
//
//   4. THE CENTRAL STEPPED STAR PODIUM & SPLAYED 5-LEGGED COLLAR (y = 96..228 m)
//      At the hub where the five star arms meet rises a three-tiered pentagonal
//      citadel podium with wide dark-glazed observation/hangar mouths and green
//      roof terraces. Above it (y = 138..228 m), the foot of the central tower
//      flares into a dramatic 5-legged splayed flying-buttress collar — two tiers
//      of angled white A-frame struts over shadowed portals, with sloped green
//      garden pockets between their feet and recessed dark-blue glazed trapezoids
//      between the upper ribs.
//
//   5. THE TALL 5-FLUTED CENTRAL SPIRE & FLARED CROWN (y = 225..565 m)
//      A slender vertical shaft formed of five chamfered white megastructure
//      piers separated by five deep dark-glazed vertical flutes tied by skybridge
//      collars, stepping in at y = 325 m above vertical blue intake slits, and
//      flaring at y = 512..548 m into a 5-winged cruciform/pentagonal observation
//      crown and central lantern spire.
//
// RUINED (d = 1): the central spire has sheared off along a jagged diagonal plane
// around y = 372 m; its upper 193 m and flared 5-winged crown lie broken in two
// across the south-eastern garden court and breached perimeter wall. Two star
// arms have spalled open to their floor plates, perimeter bastions have slumped
// in talus cascades, and the five triangular gardens have grown into wild woods.

// ---------------------------------------------------------------- the skins
function qnWallTex(kind,dec){
 // kind 0: battered perimeter cliff & star-arm flank (cyclopean white panels,
 //         horizontal form joints, subtle vertical olive-grey rain washes, and
 //         two recessed dark window/vent courses per 32 m tile).
 // kind 1: bright alabaster superstructure skin (star spines, collar ribs, tower
 //         piers, pavilions) — cleaner, brighter, fine panel seams.
 return canvasTex(512,512,(g,w,h)=>{const id=g.createImageData(w,h),D=id.data;
  for(let y=0;y<h;y++){
   const py=Math.floor(y/64),by=y%64;
   for(let x=0;x<w;x++){const i=(y*w+x)*4;
    const px=Math.floor(x/128),bx=x%128;
    const ph=h3(px*1.7+kind,py*2.3,4.1);
    const n1=fbm(x/42,y/42,2.7+kind,3)-.5;
    const streak=fbm(x/7,y/110,6.3+kind,2);
    const seam=(by<2||bx<2)||(ph>.45&&Math.abs(by-32)<1.2)||(ph>.72&&Math.abs(bx-64)<1.2);
    let r=kind===1?238:224,gg=kind===1?236:221,b=kind===1?230:213;
    const dv=n1*22+(ph-.5)*14;
    r+=dv;gg+=dv*.96;b+=dv*.90;
    // subtle vertical rain/moss weathering streaks on the battered walls (Image 2)
    if(kind===0){
     const wsh=clamp((streak-.48)*2.4,0,1)*(0.35+0.65*(y/h));
     r=lerp(r,dec?112:168,wsh*(dec?.75:.42));
     gg=lerp(gg,dec?122:176,wsh*(dec?.75:.42));
     b=lerp(b,dec?98:156,wsh*(dec?.75:.42));
    }else if(streak>.56){
     const wsh=(streak-.56)*1.8*(dec?1.1:.35);
     r-=wsh*28;gg-=wsh*26;b-=wsh*22;
    }
    if(seam){r-=34;gg-=32;b-=28;}
    // recessed horizontal dark mechanical / window slit bands on kind 0
    const inSlot=(kind===0&&(py===1||py===5)&&by>=18&&by<=42&&bx>=10&&bx<=118)||
                 (kind===1&&py===3&&by>=24&&by<=38&&bx>=16&&bx<=112&&ph>.35);
    if(inSlot){
     const mull=(bx%32)<3;
     if(mull){r=120;gg=122;b=126;}
     else{
      const cell=Math.floor(x/32),cr=h3(cell*3.1,py*5.7+kind,8.2);
      if(!dec&&cr<.28){const f=.65+cr*1.1;r=235*f;gg=185*f;b=115*f;}
      else{r=dec?18:28;gg=dec?22:42;b=dec?28:68;}
     }
    }
    if(dec){
     r=r*.72+12;gg=gg*.73+12;b=b*.70+10;
    }
    D[i]=clamp(r,0,255);D[i+1]=clamp(gg,0,255);D[i+2]=clamp(b,0,255);D[i+3]=255;}}
  g.putImageData(id,0,0);});}

function qnWallEmis(kind){
 return canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),D=id.data;
  for(let y=0;y<h;y++){const py=Math.floor(y/32),by=y%32;
   for(let x=0;x<w;x++){const i=(y*w+x)*4;
    const px=Math.floor(x/64),bx=x%64,ph=h3(px*1.7+kind,py*2.3,4.1);
    const inSlot=(kind===0&&(py===1||py===5)&&by>=9&&by<=21&&bx>=5&&bx<=59)||
                 (kind===1&&py===3&&by>=12&&by<=19&&bx>=8&&bx<=56&&ph>.35);
    let a=0;
    if(inSlot&&(bx%16)>=2){
     const cell=Math.floor(x/16),cr=h3(cell*3.1,py*5.7+kind,8.2);
     if(cr<.28)a=.55+cr*1.2;
    }
    D[i]=250*a;D[i+1]=185*a;D[i+2]=105*a;D[i+3]=255;}}
  g.putImageData(id,0,0);});}

// Deep cobalt/sapphire-blue glazed curtain walls & tower flutes (Image 1 & 2)
function qnAtriumTex(dec,emis){
 const S=emis?256:512;
 return canvasTex(S,S,(g,w,h)=>{const id=g.createImageData(w,h),D=id.data;
  const NB=8,NF=8,bw=w/NB,fh=h/NF;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
   const bi=Math.floor(x/bw),fi=Math.floor(y/fh),bx=(x-bi*bw)/bw,by=(y-fi*fh)/fh;
   const cr=h3(bi*3.7,fi*6.1,9.4),c2=h3(bi*1.9,fi*2.7,3.8);
   const mull=bx<.09||bx>.91||by<.12||by>.88||Math.abs(bx-.5)<.035;
   const lit=!mull&&!dec&&cr<.32;
   if(emis){
    const a=lit?(.48+cr*1.1):(!mull&&!dec?.08:0);
    D[i]=190*a;D[i+1]=215*a;D[i+2]=255*a;D[i+3]=255;continue;
   }
   let r,gg,b;
   if(mull){
    r=dec?28:38;gg=dec?32:48;b=dec?38:66;
    if(by<.06){r+=26;gg+=28;b+=32;}
   }else if(dec){
    const k2=cr<.35?12+c2*10:22+c2*16;
    r=k2;gg=k2+4;b=k2+10;
   }else if(lit){
    const f=.65+cr*.9;
    r=150*f;gg=195*f;b=245*f;
   }else{
    const vg=.75+.25*(1-by);
    r=(20+c2*14)*vg;gg=(44+c2*22)*vg;b=(88+c2*36)*vg;
   }
   D[i]=clamp(r,0,255);D[i+1]=clamp(gg,0,255);D[i+2]=clamp(b,0,255);D[i+3]=255;}
  g.putImageData(id,0,0);});}

// Lush green garden lawn texture with subtle terrace stripes & botanical beds
function qnLawnTex(dec){
 return canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),D=id.data;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
   const n=fbm(x/32,y/32,14.3+dec,3),q=fbm(x/7,y/7,18.1,2),sp=h3(x,y,21.7+dec)-.5;
   let r=lerp(74,112,n)+(q-.5)*18,gg=lerp(116,154,n)+(q-.5)*22,b=lerp(46,70,n)+(q-.5)*12;
   if(!dec&&((y>>3)&1)){r*=1.03;gg*=1.05;}
   if(!dec&&(x%64<3||y%64<3)){r=lerp(r,148,.35);gg=lerp(gg,152,.35);b=lerp(b,128,.35);}
   if(dec){
    const pa=fbm(x/20,y/20,25.4,3);
    if(pa>.62){r=lerp(r,118,.55);gg=lerp(gg,98,.55);b=lerp(b,66,.55);}
    else if(pa<.36){r*=.58;gg*=.74;b*=.52;}
    r*=.82;gg*=.85;b*=.80;
   }
   D[i]=clamp(r+sp*12,0,255);D[i+1]=clamp(gg+sp*14,0,255);D[i+2]=clamp(b+sp*8,0,255);D[i+3]=255;}
  g.putImageData(id,0,0);});}

// Exposed structural floor-plate section for ruin shear & spalled star arms
function qnSectTex(){
 return canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),D=id.data;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
   const fy=y%32,cx=Math.floor(x/32),fi=Math.floor(y/32),n=fbm(x/12,y/12,31.2,2);
   let v;
   if(fy<6)v=142+n*44-(fy<2?32:0);
   else if(h3(cx,fi,33.7)<.34&&x%32<5)v=82+n*26;
   else v=24+n*22;
   D[i]=clamp(v+6,0,255);D[i+1]=clamp(v+2,0,255);D[i+2]=clamp(v-4,0,255);D[i+3]=255;}
  g.putImageData(id,0,0);});}

TEX.qnWall=qnWallTex(0,0);TEX.qnWallR=qnWallTex(0,1);TEX.qnWallE=qnWallEmis(0);
TEX.qnAlab=qnWallTex(1,0);TEX.qnAlabR=qnWallTex(1,1);TEX.qnAlabE=qnWallEmis(1);
TEX.qnAtr =qnAtriumTex(0,0);TEX.qnAtrR=qnAtriumTex(1,0);TEX.qnAtrE=qnAtriumTex(0,1);
TEX.qnLawn=qnLawnTex(0);TEX.qnLawnR=qnLawnTex(1);
TEX.qnSect=qnSectTex();

const qnStd=o=>new THREE.MeshStandardMaterial(Object.assign({roughnessMap:TEX.concreteRM,roughness:1,metalness:0,side:DS},o));
MAT.qnWall =qnStd({map:TEX.qnWall,emissive:0xffffff,emissiveMap:TEX.qnWallE,emissiveIntensity:.65});
MAT.qnWallR=qnStd({map:TEX.qnWallR});
MAT.qnAlab =qnStd({map:TEX.qnAlab,emissive:0xffffff,emissiveMap:TEX.qnAlabE,emissiveIntensity:.55,roughness:.85});
MAT.qnAlabR=qnStd({map:TEX.qnAlabR});
MAT.qnAtr  =qnStd({map:TEX.qnAtr,emissive:0xffffff,emissiveMap:TEX.qnAtrE,emissiveIntensity:.85,roughness:.35,metalness:.25});
MAT.qnAtrR =qnStd({map:TEX.qnAtrR,roughness:.75,metalness:.1});
MAT.qnLawn =qnStd({map:TEX.qnLawn,roughnessMap:null});
MAT.qnLawnR=qnStd({map:TEX.qnLawnR,roughnessMap:null});
MAT.qnPave =qnStd({map:TEX.concrete,color:0xb8b4aa});
MAT.qnPaveR=qnStd({map:TEX.concrete,color:0x7c7a6e});
MAT.qnShade =qnStd({map:TEX.concrete,color:0x484c54});
MAT.qnShadeR=qnStd({map:TEX.concrete,color:0x323438});
MAT.qnSect =qnStd({map:TEX.qnSect,roughnessMap:null});
MAT.qnWater =new THREE.MeshStandardMaterial({color:0x1b4c6b,roughness:.14,metalness:.28,side:DS});
MAT.qnWaterR=new THREE.MeshStandardMaterial({color:0x2b3e36,roughness:.65,metalness:.08,side:DS});
MAT.qnKit  =qnStd({map:TEX.qnAlab,color:0xffffff});
MAT.qnVoid =new THREE.MeshStandardMaterial({color:0x141c28,roughness:.5,metalness:.2,side:DS});

kdef('qnBox',new THREE.BoxGeometry(1,1,1),MAT.qnKit);
kdef('qnDim',new THREE.BoxGeometry(1,1,1),MAT.qnVoid);
kdef('qnCyl',new THREE.CylinderGeometry(1,1,1,10),MAT.qnKit);

// Presets are derived from QN_SITE in targets/quintagon/91z-views.js
const QN_SITE={};

function buildQuintagon(scene,gx,gz,d){reseed(10500+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0,D2R=Math.PI/180;

 // ---- 5-fold geometry constants --------------------------------------------------
 // 5 star arms / pentagon vertices at TH[k] = 18 + 72*k deg.
 // 5 flat pentagon edges / triangular garden court centers at PH[k] = 54 + 72*k deg.
 const N5=5,STEP=TAU/N5,HALF=STEP*.5;
 const C36=Math.cos(HALF),S36=Math.sin(HALF),T36=Math.tan(HALF); // 0.8090, 0.5878, 0.7265
 const TH=[0,1,2,3,4].map(k=>(18+72*k)*D2R);
 const PH=[0,1,2,3,4].map(k=>(54+72*k)*D2R);
 const AX=TH.map(Math.cos),AZ=TH.map(Math.sin); // star arm radial unit vectors
 const TX=TH.map(a=>-Math.sin(a)),TZ=TH.map(Math.cos); // star arm tangent unit vectors
 const NX=PH.map(Math.cos),NZ=PH.map(Math.sin); // pentagon side outward normals
 const SX=PH.map(a=>-Math.sin(a)),SZ=PH.map(Math.cos); // pentagon side tangents

 // Point in star-arm k frame: r along arm axis TH[k], s perpendicular (+s toward TH[k]+90), y up
 const AP=(k,r,s,y)=>[AX[k]*r+TX[k]*s,y,AZ[k]*r+TZ[k]*s];
 // Point in pentagon-side / garden-court k frame: u along normal PH[k], v along side tangent, y up
 const SP=(k,u,v,y)=>[NX[k]*u+SX[k]*v,y,NZ[k]*u+SZ[k]*v];

 // Quaternions for kit placement
 const QA=[0,1,2,3,4].map(k=>qFacing([AX[k],0,AZ[k]]));
 const QS=[0,1,2,3,4].map(k=>qFacing([NX[k],0,NZ[k]]));

 // ---- primary dimensions (metres) ------------------------------------------------
 const RB0=460,RB1=415,YWALL=68,YPAR=76; // battered pentagon base: r=460 at y=0 -> r=415 at y=68
 const RB=y=>lerp(RB0,RB1,clamp(y/YWALL,0,1));
 const DPENT=y=>RB(y)*C36;               // apothem (center to flat side)
 const HPENT=y=>RB(y)*S36;               // half side length of pentagon

 // Garden court (sector k, between arm k and arm k+1):
 // u runs from U_IN = 112 (at central star hub) to U_OUT = 322 (inside perimeter gallery wall)
 const U_IN=112,U_OUT=322;
 const YG_OUT=62,YG_IN=98;               // garden slopes up from 62 m at outer wall to 98 m at hub
 const gardenY=(u,v)=>{
  const t=clamp((u-U_IN)/(U_OUT-U_IN),0,1);
  const vm=Math.max(12,(u-86)*T36);
  const crown=4.5*(1-Math.pow(clamp(Math.abs(v)/vm,0,1),1.8))*Math.sin(Math.PI*t);
  return lerp(YG_IN,YG_OUT,t)+crown;
 };

 // Star arms (k = 0..4):
 // Radiate from R_HUB = 102 out to pentagon corner R_COR = 415, then prow spur out to R_TIP = 568
 const R_HUB=102,R_COR=415,R_TIP=568;
 const armTopY=r=>{
  if(r<=R_COR)return lerp(124,84,Math.pow(clamp((r-R_HUB)/(R_COR-R_HUB),0,1),.88));
  return lerp(84,0,Math.pow(clamp((r-R_COR)/(R_TIP-R_COR),0,1),1.15));
 };
 const armTopW=r=>{
  if(r<=R_COR)return lerp(44,21,clamp((r-R_HUB)/(R_COR-R_HUB),0,1));
  return lerp(21,0,clamp((r-R_COR)/(R_TIP-R_COR),0,1));
 };
 const armFootW=r=>{
  if(r<=R_COR)return armTopW(r)+lerp(24,14,clamp((r-R_HUB)/(R_COR-R_HUB),0,1));
  return armTopW(r)+lerp(14,0,clamp((r-R_COR)/(R_TIP-R_COR),0,1));
 };

 // Central tower & collar heights
 const Y_POD1=114,Y_POD2=130,Y_POD3=146;
 const Y_COL0=138,Y_COLM=174,Y_COL1=228;
 const Y_SH0=225,Y_STEP=325,Y_CR0=512,Y_CR1=546,Y_TOP=566;

 // ---- ruin fracture & spall predicates -------------------------------------------
 const FALL_AZ=PH[0]; // 54 deg (SE, across garden court 0 and its outer wall)
 const FX=Math.cos(FALL_AZ),FZ=Math.sin(FALL_AZ);
 const cutTowerY=(x,z)=>372-.45*(x*FX+z*FZ)+12*(fbm(x*.04+1.7,z*.04,10501,2)-.5);
 const cutTower2=(x,z)=>468+8*(fbm(x*.05,z*.05,10502,2)-.5);
 // Spall zones on star arm 0 (r=210..295) and star arm 2 (r=175..265), plus perimeter wall k=0
 const armSpall=(k,r,s)=>{
  if(!dd)return false;
  if(k===0&&r>205&&r<295&&s>0)return true;
  if(k===2&&r>170&&r<260&&s<0)return true;
  return false;
 };
 const wallBreach=(k,v,y)=>{
  if(!dd)return false;
  if(k===0&&Math.abs(v)<58&&y>24)return true; // where the fallen spire smashed the SE perimeter wall
  if(k===2&&v>45&&v<125&&y>34)return true;
  return false;
 };

 // ---- palette & kit helpers ------------------------------------------------------
 const ALAB=()=>new THREE.Color().setHSL(rr(.10,.13),rr(.04,.10),dd?rr(.46,.58):rr(.82,.94));
 const STONE=()=>new THREE.Color().setHSL(rr(.09,.12),rr(.06,.14),dd?rr(.32,.44):rr(.66,.78));
 const DARKC=()=>new THREE.Color().setHSL(rr(.58,.63),rr(.25,.42),dd?rr(.08,.14):rr(.12,.20));
 const BLUEC=()=>new THREE.Color().setHSL(rr(.57,.62),rr(.48,.68),dd?rr(.12,.20):rr(.22,.34));
 const LEAFC=()=>new THREE.Color().setHSL(rr(.21,.33),rr(.24,.48),dd?rr(.15,.27):rr(.22,.36));
 const MOSSC=()=>new THREE.Color().setHSL(rr(.22,.32),rr(.28,.48),rr(.08,.16));
 const RUBC=()=>new THREE.Color().setHSL(rr(.08,.12),rr(.06,.16),rr(.18,.30));
 const WARML=new THREE.Color(0xffbe76);

 const plant=(p,h)=>{
  kput('trunk',p,qEuler(rr(-.05,.05),rng()*TAU,rr(-.05,.05)),
   [h*.15,h*.72,h*.15],new THREE.Color().setHSL(rr(.06,.10),rr(.22,.40),rr(.14,.26)));
  const s0=h*rr(.28,.40);
  kput('leafCard',[p[0]+rr(-.07,.07)*h,p[1]+h*.70,p[2]+rr(-.07,.07)*h],
   qEuler(rr(-.07,.07),rng()*TAU,rr(-.07,.07)),[s0,s0*rr(.72,1.06),s0],LEAFC());
 };
 const pavilion=(p,az,w,h,dp)=>{
  // Crisp white architectural garden pavilion / skylight block (Image 1 & 2)
  const q=qEuler(0,az,0);
  kput('qnBox',[p[0],p[1]+h*.5,p[2]],q,[w,h,dp],ALAB());
  kput('qnDim',[p[0],p[1]+h*.52,p[2]],q,[w*1.02,h*.32,dp*.82],null);
  kput('qnBox',[p[0],p[1]+h+.35,p[2]],q,[w*1.08,.7,dp*1.08],STONE());
  if(!dd&&rng()<.45)kput('strip',[p[0],p[1]+h*.55,p[2]],q,[w*1.03,3.5,3.5],WARML);
  if(dd&&rng()<.55)kput('moss',[p[0]+rr(-1,1),p[1]+h+.4,p[2]+rr(-1,1)],null,[w*.45,rr(.4,.9),dp*.45],MOSSC());
 };
 const person=p=>{
  if(dd)return;
  kput('figB',p,qEuler(0,rng()*TAU,0),1,new THREE.Color().setHSL(rr(0,.6),rr(.2,.5),rr(.25,.55)));
  kput('figH',p,null,1,new THREE.Color(0xc9a17e));
 };
 const rubHeap=(cx,cy,cz,r0,r1,n,sm)=>{
  for(let i=0;i<n;i++){
   const a=rng()*TAU,u=Math.pow(rng(),1.9),r=r0+(r1-r0)*u,sz=rr(1.2,sm)*(1.15-.5*u);
   kput('rubble',[cx+Math.cos(a)*r,cy+sz*.35+(1-u)*sm*.25,cz+Math.sin(a)*r],
    qEuler(rng()*3,rng()*3,rng()*3),[sz*rr(.8,1.4),sz*rr(.5,.9),sz*rr(.8,1.4)],RUBC());
  }
 };

 // ---- geometry accumulators (one merged mesh per material) -----------------------
 const TILE=32;
 const mkAcc=()=>({P:[],U:[],I:[],n:0});
 const mkSet=()=>({wall:mkAcc(),alab:mkAcc(),atr:mkAcc(),lawn:mkAcc(),pave:mkAcc(),shade:mkAcc(),sect:mkAcc(),water:mkAcc()});
 const MAT_MAP={
  wall:dd?MAT.qnWallR:MAT.qnWall,
  alab:dd?MAT.qnAlabR:MAT.qnAlab,
  atr: dd?MAT.qnAtrR :MAT.qnAtr,
  lawn:dd?MAT.qnLawnR:MAT.qnLawn,
  pave:dd?MAT.qnPaveR:MAT.qnPave,
  shade:dd?MAT.qnShadeR:MAT.qnShade,
  sect:MAT.qnSect,
  water:dd?MAT.qnWaterR:MAT.qnWater
 };
 const dst3=(a,b)=>Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]);
 const quad=(A,a,b,c,e,ua,ub,uc,ue)=>{
  A.P.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2],e[0],e[1],e[2]);
  A.U.push(ua[0],ua[1],ub[0],ub[1],uc[0],uc[1],ue[0],ue[1]);
  const n=A.n;A.I.push(n,n+1,n+2,n,n+2,n+3);A.n+=4;
 };
 // Vertical/sloped wall quad with world-metric UVs
 const quadW=(A,a,b,c,e,tile,v0)=>{
  const t=tile||TILE,L=dst3(a,b),H=dst3(a,e),vy=(v0!=null?v0:a[1])/t;
  quad(A,a,b,c,e,[0,vy],[L/t,vy],[L/t,vy+H/t],[0,vy+H/t]);
 };
 // Horizontal/plan quad with world XZ UVs
 const quadH=(A,a,b,c,e,tile)=>{
  const t=tile||TILE;
  quad(A,a,b,c,e,[a[0]/t,a[2]/t],[b[0]/t,b[2]/t],[c[0]/t,c[2]/t],[e[0]/t,e[2]/t]);
 };
 const flush=(S,par)=>{
  for(const k in S){
   const A=S[k];if(!A.n)continue;
   const g=new THREE.BufferGeometry();
   g.setAttribute('position',new THREE.Float32BufferAttribute(A.P,3));
   g.setAttribute('uv',new THREE.Float32BufferAttribute(A.U,2));
   g.setIndex(A.I);g.computeVertexNormals();
   mesh(g,MAT_MAP[k],par);
  }
 };

 const S=mkSet();

 // ================================================================= 1. PENTAGONAL BASE & PERIMETER GALLERY
 // Five battered monolithic white walls along the 5 flat sides of the pentagon,
 // topped by the raised perimeter parapet/gallery framing the 5 garden courts.
 // Continuous structural sub-deck plate across the pentagon interior at YG_OUT-2.5
 // so the upper terraces and V-canyons are 100% watertight from every angle.
 for(let k=0;k<N5;k++){
  const rSub=RB(YWALL)-6;
  quadH(S.pave,[0,YG_OUT-2.5,0],[0,YG_OUT-2.5,0],AP((k+1)%N5,rSub,0,YG_OUT-2.5),AP(k,rSub,0,YG_OUT-2.5),TILE);
 }
 const NS_SEG=18,NY_SEG=4;
 for(let k=0;k<N5;k++){
  for(let iy=0;iy<NY_SEG;iy++){
   const y0=(iy/NY_SEG)*YWALL,y1=((iy+1)/NY_SEG)*YWALL,ym=(y0+y1)*.5;
   const d0=DPENT(y0),d1=DPENT(y1),h0=HPENT(y0),h1=HPENT(y1);
   for(let is=0;is<NS_SEG;is++){
    const u0=is/NS_SEG,u1=(is+1)/NS_SEG;
    const v0a=lerp(-h0,h0,u0),v0b=lerp(-h0,h0,u1);
    const v1a=lerp(-h1,h1,u0),v1b=lerp(-h1,h1,u1);
    const vm=(v0a+v0b)*.5;
    const br=wallBreach(k,vm,ym);
    quadW(br?S.sect:S.wall,
     SP(k,d0,v0a,y0),SP(k,d0,v0b,y0),SP(k,d1,v1b,y1),SP(k,d1,v1a,y1),TILE,y0);
   }
  }
  // Battered structural buttress pilasters along each pentagon face
  const dFoot=DPENT(0),dTop=DPENT(YWALL),hTop=HPENT(YWALL);
  for(let v=-200;v<=200;v+=40){
   if(wallBreach(k,v,50))continue;
   const a=SP(k,dFoot+.8,v,2),b=SP(k,dTop+.8,v,YWALL-2);
   rbeam('qnBox',a,b,2.4,2.2,ALAB());
   // dark recessed intake slot beside each pilaster at upper gallery level
   if(Math.abs(v)<180){
    const gP=SP(k,lerp(dFoot,dTop,.82)+.3,v+20,YWALL*.82);
    kput('qnDim',gP,QS[k],[26,5.5,1.8],null);
    if(!dd&&rng()<.65)kput('strip',SP(k,lerp(dFoot,dTop,.82)+1.1,v+20,YWALL*.82),QS[k],[22,4,4],WARML);
   }
  }
  // Raised perimeter gallery / parapet wall along the top edge of side k (y = 62..76 m)
  const dOut=DPENT(YWALL),dIn=U_OUT,hRim=HPENT(YWALL)-26;
  for(let is=0;is<NS_SEG;is++){
   const u0=is/NS_SEG,u1=(is+1)/NS_SEG;
   const va=lerp(-hRim,hRim,u0),vb=lerp(-hRim,hRim,u1),vm=(va+vb)*.5;
   if(wallBreach(k,vm,70))continue;
   // outer parapet riser (y = 68..76)
   quadW(S.alab,SP(k,dOut,va,YWALL),SP(k,dOut,vb,YWALL),SP(k,dOut,vb,YPAR),SP(k,dOut,va,YPAR),TILE,YWALL);
   // top promenade deck of the perimeter gallery (y = 76)
   quadH(S.alab,SP(k,dIn,va,YPAR),SP(k,dIn,vb,YPAR),SP(k,dOut,vb,YPAR),SP(k,dOut,va,YPAR),TILE);
   // inner gallery wall facing the triangular garden court (y = 62..76)
   quadW(S.atr,SP(k,dIn,vb,YG_OUT),SP(k,dIn,va,YG_OUT),SP(k,dIn,va,YPAR),SP(k,dIn,vb,YPAR),TILE,YG_OUT);
  }
  // Colonnade fins & rooftop sentry pavilions along the perimeter gallery
  for(let v=-180;v<=180;v+=30){
   if(wallBreach(k,v,70))continue;
   kput('qnBox',SP(k,dIn+.6,v,(YG_OUT+YPAR)*.5),QS[k],[1.8,YPAR-YG_OUT,2.8],ALAB());
   if(v%90===0){
    pavilion(SP(k,(dIn+dOut)*.5,v,YPAR),PH[k],12,5.5,8);
   }
  }
 }

 // ---- Stepped coastal bastion aprons at the pentagon corners & Harbour Pier -------
 for(let k=0;k<N5;k++){
  // Lower bastion terrace apron flanking each corner (y = 0..18 m)
  const yAp=18,rIn=390,rOut=505,wIn=105,wOut=68;
  const p0=AP(k,rIn,-wIn,0),p1=AP(k,rOut,-wOut,0),p2=AP(k,rOut,wOut,0),p3=AP(k,rIn,wIn,0);
  const t0=AP(k,rIn,-wIn*.92,yAp),t1=AP(k,rOut-12,-wOut*.88,yAp),t2=AP(k,rOut-12,wOut*.88,yAp),t3=AP(k,rIn,wIn*.92,yAp);
  quadW(S.wall,p0,p1,t1,t0,TILE,0);
  quadW(S.wall,p1,p2,t2,t1,TILE,0);
  quadW(S.wall,p2,p3,t3,t2,TILE,0);
  quadH(S.lawn,t0,t1,t2,t3,TILE);
  // Parapet curb & trees on the corner bastion terrace
  beam('qnBox',t0,t1,1.8,2.2,ALAB());
  beam('qnBox',t1,t2,1.8,2.2,ALAB());
  beam('qnBox',t2,t3,1.8,2.2,ALAB());
  for(let j=0;j<14;j++){
   const rr2=rr(rIn+25,rOut-24),ss=rr(-wOut*.75,wOut*.75);
   plant(AP(k,rr2,ss,yAp),dd?rr(9,16):rr(7,12));
  }
  for(let s of [-42,42])pavilion(AP(k,rOut-36,s,yAp),TH[k],9,4.8,7);
 }

 // ---- The Great Seaward Breakwater Pier & Harbour Basin (Corner k = 0, Image 1 & 2)
 {
  const yPier=10,rP0=485,rP1=765,wP=18;
  // Main pier mole extending along corner 0 (+s offset 48 m so it runs parallel to the corner spur)
  const sOff=52;
  const b0=AP(0,rP0,sOff-wP,0),b1=AP(0,rP1,sOff-wP,0),b2=AP(0,rP1,sOff+wP,0),b3=AP(0,rP0,sOff+wP,0);
  const d0=AP(0,rP0,sOff-wP+2,yPier),d1=AP(0,rP1,sOff-wP+2,yPier),d2=AP(0,rP1,sOff+wP-2,yPier),d3=AP(0,rP0,sOff+wP-2,yPier);
  quadW(S.wall,b0,b1,d1,d0,TILE,0);
  quadW(S.wall,b1,b2,d2,d1,TILE,0);
  quadW(S.wall,b2,b3,d3,d2,TILE,0);
  quadH(S.pave,d0,d1,d2,d3,TILE);
  // Hooked dogleg jetty arm at the outer end of the pier (turning toward +s, just like Image 1!)
  const sJ0=sOff+wP-2,sJ1=sOff+128,rJ0=rP1-28,rJ1=rP1;
  const jb0=AP(0,rJ0,sJ0,0),jb1=AP(0,rJ1,sJ0,0),jb2=AP(0,rJ1,sJ1,0),jb3=AP(0,rJ0,sJ1,0);
  const jd0=AP(0,rJ0+1,sJ0,yPier),jd1=AP(0,rJ1-1,sJ0,yPier),jd2=AP(0,rJ1-1,sJ1,yPier),jd3=AP(0,rJ0+1,sJ1,yPier);
  quadW(S.wall,jb0,jb1,jd1,jd0,TILE,0);
  quadW(S.wall,jb1,jb2,jd2,jd1,TILE,0);
  quadW(S.wall,jb2,jb3,jd3,jd2,TILE,0);
  quadW(S.wall,jb3,jb0,jd0,jd3,TILE,0);
  quadH(S.pave,jd0,jd1,jd2,jd3,TILE);
  // Pier bollards, dock warehouses & beacon at jetty head
  for(let r=rP0+30;r<rP1-20;r+=36){
   kput('qnBox',AP(0,r,sOff,yPier+2.6),QA[0],[18,5.2,10],ALAB());
   kput('qnDim',AP(0,r,sOff,yPier+2.8),QA[0],[18.4,2.2,7.5],null);
  }
  pavilion(AP(0,rP1-14,sJ1-14,yPier),TH[0],10,9,10);
  if(!dd)kput('strip',AP(0,rP1-14,sJ1-14,yPier+10.5),null,[3,8,8],CYAN);
  // Harbour water basin beside the pier & coastal flank (y = 0.6 m)
  const wA=AP(0,370,35,.6),wB=AP(0,750,35,.6),wC=AP(0,750,320,.6),wE=AP(0,370,320,.6);
  quadH(S.water,wA,wB,wC,wE,40);
 }

 // ================================================================= 2. THE 5-POINTED STAR SUPERSTRUCTURE
 // Five monumental faceted white arms radiating along TH[k] from r = R_HUB (102 m)
 // through the pentagon corners (r = 415 m) out to sharp triangular prows (r = 568 m).
 const NR_ARM=16;
 for(let k=0;k<N5;k++){
  for(let ir=0;ir<NR_ARM;ir++){
   const t0=ir/NR_ARM,t1=(ir+1)/NR_ARM;
   const r0=lerp(R_HUB,R_TIP,t0),r1=lerp(R_HUB,R_TIP,t1),rm=(r0+r1)*.5;
   const yt0=armTopY(r0),yt1=armTopY(r1);
   const wt0=armTopW(r0),wt1=armTopW(r1);
   const wf0=armFootW(r0),wf1=armFootW(r1);
   const yf0=r0<=R_COR?lerp(YG_IN-4,YG_OUT,clamp((r0-R_HUB)/(R_COR-R_HUB),0,1)):0;
   const yf1=r1<=R_COR?lerp(YG_IN-4,YG_OUT,clamp((r1-R_HUB)/(R_COR-R_HUB),0,1)):0;

   // Upper spine deck: central white deck + green planted boulevard verges along both rims
   const vg0=wt0*.68,vg1=wt1*.68;
   quadH(S.alab,AP(k,r0,-vg0,yt0),AP(k,r0,vg0,yt0),AP(k,r1,vg1,yt1),AP(k,r1,-vg1,yt1),TILE);
   if(r1<=R_COR+25){
    // Green planted verge strips along the left & right spine shoulders (Image 1)
    quadH(S.lawn,AP(k,r0,-wt0,yt0-.4),AP(k,r0,-vg0,yt0),AP(k,r1,-vg1,yt1),AP(k,r1,-wt1,yt1-.4),16);
    quadH(S.lawn,AP(k,r0,vg0,yt0),AP(k,r0,wt0,yt0-.4),AP(k,r1,wt1,yt1-.4),AP(k,r1,vg1,yt1),16);
   }else{
    quadH(S.alab,AP(k,r0,-wt0,yt0-.4),AP(k,r0,-vg0,yt0),AP(k,r1,-vg1,yt1),AP(k,r1,-wt1,yt1-.4),TILE);
    quadH(S.alab,AP(k,r0,vg0,yt0),AP(k,r0,wt0,yt0-.4),AP(k,r1,wt1,yt1-.4),AP(k,r1,vg1,yt1),TILE);
   }

   // Left (-s) and Right (+s) battered white sidewalls of the star arm
   for(const sg of [-1,1]){
    const sp=armSpall(k,rm,sg);
    const matSide=sp?S.sect:S.wall;
    const a0=AP(k,r0,sg*wf0,yf0),a1=AP(k,r1,sg*wf1,yf1);
    const b1=AP(k,r1,sg*wt1,yt1-.4),b0=AP(k,r0,sg*wt0,yt0-.4);
    if(sg>0)quadW(matSide,a0,a1,b1,b0,TILE,yf0);
    else    quadW(matSide,a1,a0,b0,b1,TILE,yf0);

    // Recessed cobalt-blue glazed intake / hangar bands along the star-arm flanks
    if(!sp&&rm>135&&rm<385&&(ir%3===1)){
     const ym0=lerp(yf0,yt0,.28),ym1=lerp(yf0,yt0,.68);
     const sm0=lerp(wf0,wt0,.28)+.25,sm1=lerp(wf0,wt0,.68)+.25;
     const g0=AP(k,r0,sg*sm0,ym0),g1=AP(k,r1,sg*sm0,ym0),g2=AP(k,r1,sg*sm1,ym1),g3=AP(k,r0,sg*sm1,ym1);
     if(sg>0)quadW(S.atr,g0,g1,g2,g3,16,ym0);
     else    quadW(S.atr,g1,g0,g3,g2,16,ym0);
    }
    // Exposed floor plates & rubble cascade in spalled star-arm breaches (ruin)
    if(sp){
     for(let fy=yf0+6;fy<yt0-4;fy+=7.5){
      const sf=lerp(wf0,wt0,(fy-yf0)/(yt0-yf0));
      kput('qnBox',AP(k,rm,sg*(sf-3),fy),QA[k],[12,1.1,r1-r0+1],STONE());
     }
     rubHeap(AP(k,rm,sg*(wf0+12),yf0)[0],yf0,AP(k,rm,sg*(wf0+12),yf0)[2],4,26,18,5.5);
    }
   }
  }

  // Secondary inner chevron wing-blades & deep blue-glazed V-canyons (r = 138..296 m, Image 1)
  for(const sg of [-1,1]){
   const rW0=138,rW1=296;
   const sW0=sg*(armFootW(rW0)+8),sW1=sg*(armFootW(rW1)+34);
   const yW0=112,yW1=82,yF0=86,yF1=66;
   const wW=11;
   // Outer white face of secondary chevron wing
   const pA=AP(k,rW0,sW0+sg*wW,yF0),pB=AP(k,rW1,sW1+sg*wW,yF1);
   const pC=AP(k,rW1,sW1+sg*wW*.6,yW1),pE=AP(k,rW0,sW0+sg*wW*.6,yW0);
   if(sg>0)quadW(S.alab,pA,pB,pC,pE,TILE,yF0);
   else    quadW(S.alab,pB,pA,pE,pC,TILE,yF0);
   // Inner cobalt-blue glazed atrium wall facing the star-arm canyon slot
   const qA=AP(k,rW0,sW0,yF0),qB=AP(k,rW1,sW1,yF1);
   const qC=AP(k,rW1,sW1,yW1),qE=AP(k,rW0,sW0,yW0);
   if(sg>0)quadW(S.atr,qB,qA,qE,qC,16,yF0);
   else    quadW(S.atr,qA,qB,qC,qE,16,yF0);
   // Paved V-canyon atrium floor bridging from the main star-arm foot out to the chevron wing
   const mA=AP(k,rW0,sg*(armFootW(rW0)-4),yF0),mB=AP(k,rW1,sg*(armFootW(rW1)-4),yF1);
   if(sg>0)quadH(S.pave,mA,mB,pB,pA,20);
   else    quadH(S.pave,pA,pB,mB,mA,20);
   // Top cap of the chevron wing-blade (with green planted strip)
   quadH(S.lawn,pE,pC,qC,qE,16);
   // End walls at rW0 and rW1 closing the chevron blade
   quadW(S.alab,qB,pB,pC,qC,16,yF1);
   quadW(S.alab,pA,qA,qE,pE,16,yF0);
   // Structural flying struts spanning the blue-glazed V-canyon to the main star arm
   for(let f=.2;f<=.85;f+=.22){
    const rf=lerp(rW0,rW1,f),yf=lerp(yW0,yW1,f)-3;
    const sIn=sg*(armTopW(rf)+4),sOut=lerp(sW0,sW1,f);
    rbeam('qnBox',AP(k,rf,sIn,yf),AP(k,rf,sOut,yf),2.2,2.6,ALAB());
   }
  }

  // Spine superstructure details: ventilation fins, sky-lights & trees along the green verges
  for(let r=125;r<395;r+=24){
   const yt=armTopY(r),wt=armTopW(r);
   kput('qnBox',AP(k,r,0,yt+1.4),QA[k],[wt*.85,2.8,6.5],ALAB());
   kput('qnDim',AP(k,r,0,yt+1.6),QA[k],[wt*.78,1.2,7.0],null);
   for(const sg of [-1,1]){
    plant(AP(k,r,sg*(wt*.82),yt-.2),dd?rr(7,13):rr(5,9));
   }
  }
 }

 // ================================================================= 3. FIVE TRIANGULAR GARDEN COURTS
 // Each court k (centered on PH[k]) is a vast sloping green triangle bounded by
 // the outer perimeter gallery wall (u = U_OUT = 322) and the converging inner
 // flanks of Star Arm k and Star Arm k+1 (u = U_IN = 112..322).
 const NU_G=12,NV_G=12;
 for(let k=0;k<N5;k++){
  for(let iu=0;iu<NU_G;iu++){
   const f0=iu/NU_G,f1=(iu+1)/NU_G;
   const u0=lerp(U_IN,U_OUT,f0),u1=lerp(U_IN,U_OUT,f1),um=(u0+u1)*.5;
   // Half-width of the garden court extending cleanly under the converging star-arm flanks
   const vm0=Math.max(14,(u0-72)*T36),vm1=Math.max(14,(u1-72)*T36);
   for(let iv=0;iv<NV_G;iv++){
    const s0=lerp(-1,1,iv/NV_G),s1=lerp(-1,1,(iv+1)/NV_G),sm=(s0+s1)*.5;
    const v0a=s0*vm0,v0b=s1*vm0,v1b=s1*vm1,v1a=s0*vm1;
    const isRamp=Math.abs(sm)>.76; // paved grey side-ramps along the star-arm flanks (Image 1!)
    const isCanal=(k===4&&iu>=NU_G-3&&Math.abs(sm)<.58); // sunken harbour canal basin in court 4 (Image 1 right)
    const dy=isCanal?-4.5:(isRamp?-1.6:0);
    const p0=SP(k,u0,v0a,gardenY(u0,v0a)+dy),p1=SP(k,u0,v0b,gardenY(u0,v0b)+dy);
    const p2=SP(k,u1,v1b,gardenY(u1,v1b)+dy),p3=SP(k,u1,v1a,gardenY(u1,v1a)+dy);
    const matG=isCanal?S.water:(isRamp?S.pave:S.lawn);
    quadH(matG,p0,p1,p2,p3,isRamp?20:28);
   }
   // Low stone retaining curbs between the central green triangle and the two flank avenues
   for(const sg of [-1,1]){
    const vc0=sg*vm0*.76,vc1=sg*vm1*.76;
    const c0=SP(k,u0,vc0,gardenY(u0,vc0)-.6),c1=SP(k,u1,vc1,gardenY(u1,vc1)-.6);
    beam('qnBox',c0,c1,2.2,1.6,STONE());
   }
  }

  // Populate each triangular garden court with white architectural pavilions,
  // lush parkland tree groves, terraced stone walls, pathways & strolling figures
  for(let iu=1;iu<NU_G;iu++){
   const u=lerp(U_IN+14,U_OUT-16,iu/NU_G);
   const vm=Math.max(8,(u-86)*T36-26)*0.72;
   // Crisp white cubic garden pavilions / skylight kiosks (Image 1 & 2)
   const nPav=Math.max(1,Math.round(vm/34));
   for(let j=0;j<nPav;j++){
    const v=lerp(-vm*.82,vm*.82,(j+.5)/nPav)+rr(-8,8);
    if(k===4&&u>U_OUT-55&&Math.abs(v)<55)continue;
    const y=gardenY(u,v);
    pavilion(SP(k,u,v,y),PH[k]+rr(-.25,.25),rr(5.5,10.5),rr(3.8,6.5),rr(5.5,9.5));
   }
   // Parkland trees & groves across the green triangular slope
   const nTrees=Math.round(vm/(dd?3.6:4.8));
   for(let j=0;j<nTrees;j++){
    const v=rr(-vm*.92,vm*.92),uu=u+rr(-9,9);
    if(k===4&&uu>U_OUT-55&&Math.abs(v)<55)continue;
    const y=gardenY(uu,v);
    plant(SP(k,uu,v,y),dd?rr(9,18):rr(6.5,13.5));
    if(rng()<.35)kput('moss',SP(k,uu+rr(-3,3),v+rr(-3,3),y+.2),null,[rr(2,4.5),rr(.5,1.1),rr(2,4.5)],MOSSC());
   }
   // Strolling figures on the garden lawns & flank avenues (intact)
   if(!dd){
    for(let j=0;j<Math.round(vm/28);j++){
     const v=rr(-vm,vm),y=gardenY(u,v)+(Math.abs(v)>vm*.76?-1.5:0);
     person(SP(k,u,v,y));
    }
   }
  }
 }

 // ================================================================= 4. CENTRAL STEPPED STAR PODIUM & 5-LEGGED COLLAR
 // Where the 5 star arms converge (r < 125 m) rises the three-tiered pentagonal
 // citadel podium (y = 96..146 m) with wide blue-black observation/hangar slots
 // and green roof terraces, surmounted by the dramatic splayed 5-legged buttress
 // collar (y = 138..228 m) at the foot of the central tower.
 const POD_TIERS=[
  {y0:96, y1:Y_POD1, r0:118, r1:102, green:1},
  {y0:Y_POD1, y1:Y_POD2, r0:94, r1:80, green:1},
  {y0:Y_POD2, y1:Y_POD3, r0:74, r1:62, green:1}
 ];
 for(let ti=0;ti<POD_TIERS.length;ti++){
  const T=POD_TIERS[ti];
  for(let k=0;k<N5;k++){
   const a0=AP(k,T.r0,0,T.y0),b0=AP((k+1)%N5,T.r0,0,T.y0);
   const b1=AP((k+1)%N5,T.r1,0,T.y1),a1=AP(k,T.r1,0,T.y1);
   quadW(S.alab,a0,b0,b1,a1,TILE,T.y0);
   // Wide recessed dark-blue observation/hangar aperture in each podium face (Image 1!)
   const fL=.22,fR=.78,ym0=lerp(T.y0,T.y1,.22),ym1=lerp(T.y0,T.y1,.76);
   const g0=[lerp(a0[0],b0[0],fL),ym0,lerp(a0[2],b0[2],fL)],g1=[lerp(a0[0],b0[0],fR),ym0,lerp(a0[2],b0[2],fR)];
   const g2=[lerp(a1[0],b1[0],fR),ym1,lerp(a1[2],b1[2],fR)],g3=[lerp(a1[0],b1[0],fL),ym1,lerp(a1[2],b1[2],fL)];
   quadW(S.atr,g0,g1,g2,g3,16,ym0);
   // Roof terrace of this podium tier (planted lawn border + white inner deck)
   const rIn=ti<POD_TIERS.length-1?POD_TIERS[ti+1].r0:38;
   const c0=AP(k,rIn,0,T.y1),c1=AP((k+1)%N5,rIn,0,T.y1);
   quadH(T.green?S.lawn:S.alab,c0,c1,b1,a1,16);
   // Trees & white rooftop pavilions on the central podium terraces
   for(let j=0;j<5;j++){
    const f=.18+.16*j,rm=lerp(rIn+5,T.r1-5,.55);
    const px=lerp(AP(k,rm,0,0)[0],AP((k+1)%N5,rm,0,0)[0],f);
    const pz=lerp(AP(k,rm,0,0)[2],AP((k+1)%N5,rm,0,0)[2],f);
    if(j===2)pavilion([px,T.y1,pz],PH[k],8,4.2,6);
    else plant([px,T.y1,pz],dd?rr(7,12):rr(5,9));
   }
  }
 }
 // Close the central podium core floor at Y_POD3
 for(let k=0;k<N5;k++){
  quadH(S.alab,[0,Y_POD3,0],[0,Y_POD3,0],AP((k+1)%N5,42,0,Y_POD3),AP(k,42,0,Y_POD3),16);
 }

 // ---- Splayed 5-Legged Flying-Buttress Collar / Pyramidal Star-Skirt (y = 138..228 m)
 // Visible in both reference paintings:
 //   - Five massive splayed white A-frame buttress legs along TH[k] (from r=86 at y=138
 //     to r=29 at y=228), with a secondary lower splayed portal ring (Image 2).
 //   - Recessed cobalt-blue glazed trapezoidal panels between the 5 legs on the upper
 //     skirt (y = 174..228 m) and sloped triangular green garden pockets at the foot
 //     (y = 146..174 m, Image 1).
 for(let k=0;k<N5;k++){
  // Sloped triangular green garden pocket between leg k and leg k+1 (y = 146..174 m)
  const gA=AP(k,64,10,Y_POD3),gB=AP((k+1)%N5,64,-10,Y_POD3);
  const gC=AP((k+1)%N5,46,-5,Y_COLM),gE=AP(k,46,5,Y_COLM);
  quadH(S.lawn,gA,gB,gC,gE,16);
  for(let j=0;j<6;j++){
   const u=rr(.2,.8),v=rr(.2,.8);
   const px=lerp(lerp(gA[0],gB[0],u),lerp(gE[0],gC[0],u),v);
   const py=lerp(Y_POD3,Y_COLM,v);
   const pz=lerp(lerp(gA[2],gB[2],u),lerp(gE[2],gC[2],u),v);
   plant([px,py,pz],dd?rr(6,11):rr(4.5,8));
  }

  // Upper flared collar skirt between leg k and leg k+1 (y = 174..228 m):
  // Deep cobalt-blue glazed trapezoid framed by white collar borders
  const uA=AP(k,48,6,Y_COLM),uB=AP((k+1)%N5,48,-6,Y_COLM);
  const uC=AP((k+1)%N5,27,-3.5,Y_COL1),uE=AP(k,27,3.5,Y_COL1);
  quadW(S.atr,uA,uB,uC,uE,16,Y_COLM);
  // Horizontal collar ring beams at Y_COLM (174 m) and Y_COL1 (228 m)
  rbeam('qnBox',AP(k,50,0,Y_COLM),AP((k+1)%N5,50,0,Y_COLM),3.6,4.2,ALAB());
  rbeam('qnBox',AP(k,29,0,Y_COL1),AP((k+1)%N5,29,0,Y_COL1),3.2,3.8,ALAB());

  // Main splayed white structural buttress leg along star axis TH[k] (y = 138..228 m)
  const rL0=86,rLM=54,rL1=29.5;
  const wL0=11.5,wLM=8.5,wL1=5.8;
  const dL=10;
  // Outer face, left flank, right flank & inner soffit of lower leg segment (Y_COL0 -> Y_COLM)
  const l0L=AP(k,rL0,-wL0,Y_COL0),l0R=AP(k,rL0,wL0,Y_COL0);
  const lML=AP(k,rLM,-wLM,Y_COLM),lMR=AP(k,rLM,wLM,Y_COLM);
  const l1L=AP(k,rL1,-wL1,Y_COL1),l1R=AP(k,rL1,wL1,Y_COL1);
  const i0L=AP(k,rL0-dL,-wL0*.8,Y_COL0),i0R=AP(k,rL0-dL,wL0*.8,Y_COL0);
  const iML=AP(k,rLM-dL,-wLM*.8,Y_COLM),iMR=AP(k,rLM-dL,wLM*.8,Y_COLM);
  const i1L=AP(k,rL1-dL*.7,-wL1*.8,Y_COL1),i1R=AP(k,rL1-dL*.7,wL1*.8,Y_COL1);
  // Outer sloped backs of the 5 splayed buttress legs
  quadW(S.alab,l0L,l0R,lMR,lML,16,Y_COL0);
  quadW(S.alab,lML,lMR,l1R,l1L,16,Y_COLM);
  // Left & right side cheeks of each splayed buttress leg
  quadW(S.alab,i0L,l0L,lML,iML,16,Y_COL0);
  quadW(S.alab,l0R,i0R,iMR,lMR,16,Y_COL0);
  quadW(S.alab,iML,lML,l1L,i1L,16,Y_COLM);
  quadW(S.alab,lMR,iMR,i1R,l1R,16,Y_COLM);
  // Shaded underside of each splayed buttress leg
  quadW(S.shade,i0R,i0L,iML,iMR,16,Y_COL0);
  quadW(S.shade,iMR,iML,i1L,i1R,16,Y_COLM);

  // Secondary splayed A-frame portal struts flanking each main leg (Image 2's lower buttress arcade!)
  for(const sg of [-1,1]){
   const foot=AP(k,78,sg*24,Y_POD2);
   const knee=AP(k,52,sg*7.5,Y_COLM);
   rbeam('qnBox',foot,knee,3.8,4.4,ALAB());
   // Horizontal portal lintel tying the secondary strut back to the main leg at Y_POD3+2
   rbeam('qnBox',AP(k,68,sg*8,Y_POD3+2),AP(k,68,sg*18,Y_POD3+2),2.8,2.6,ALAB());
  }
 }

 // ================================================================= 5. TALL 5-FLUTED CENTRAL SPIRE & CROWN
 // Built via emitSpire(TSET, keepFn) so the standing tower (or stump in d=1) and
 // the two fallen upper pieces on the plain share the exact same geometry!
 const emitSpire=(TS,keep,isFallen)=>{
  const NY_T=28;
  const YS=[];
  for(let i=0;i<=NY_T;i++)YS.push(lerp(Y_SH0,Y_CR1,i/NY_T));
  // Ensure exact breakpoints at Y_STEP (325) and Y_CR0 (512)
  YS.push(Y_STEP,Y_CR0);YS.sort((a,b)=>a-b);
  const YSU=YS.filter((v,i,a)=>i===0||v-a[i-1]>.5);

  // Radius functions for the 5-fluted tower:
  //   rCore(y): dark-glazed inner fluted core
  //   rPier(y): 5 white chamfered structural piers along TH[k]
  //   wPier(y): half-width of each white pier
  const rCore=y=>lerp(18.5,14.8,clamp((y-Y_SH0)/(Y_CR1-Y_SH0),0,1));
  const rPier=y=>{
   const base=lerp(27.5,21.5,clamp((y-Y_SH0)/(Y_CR0-Y_SH0),0,1));
   const stepBoost=y<Y_STEP?3.8:0; // lower pier setback at y=325 m (Image 1)
   const crownFlare=y>Y_CR0?16.5*Math.sin(Math.PI*clamp((y-Y_CR0)/(Y_CR1-Y_CR0),0,1)):0; // 5-winged crown flare!
   return base+stepBoost+crownFlare;
  };
  const wPier=y=>y>Y_CR0?lerp(5.6,8.2,Math.sin(Math.PI*clamp((y-Y_CR0)/(Y_CR1-Y_CR0),0,1))):(y<Y_STEP?6.8:5.6);

  for(let iy=0;iy<YSU.length-1;iy++){
   const y0=YSU[iy],y1=YSU[iy+1],ym=(y0+y1)*.5;
   const rc0=rCore(y0),rc1=rCore(y1);
   const rp0=rPier(y0),rp1=rPier(y1);
   const wp0=wPier(y0),wp1=wPier(y1);
   const wc0=wp0*1.32,wc1=wp1*1.32;

   for(let k=0;k<N5;k++){
    const pm=AP(k,rp0,0,ym);
    if(!keep(pm))continue;

    // 1) White chamfered outer face of Pier k
    const p0L=AP(k,rp0,-wp0,y0),p0R=AP(k,rp0,wp0,y0);
    const p1R=AP(k,rp1,wp1,y1),p1L=AP(k,rp1,-wp1,y1);
    // In the lower setback zone (y = 262..318 m) or in the 5-winged observation
    // crown (y = 516..542 m), the center of the pier has a vertical cobalt-blue
    // glazed slit (clearly visible in Image 1!)
    const hasSlit=(ym>262&&ym<318)||(ym>Y_CR0+4&&ym<Y_CR1-4);
    if(hasSlit){
     const sw0=wp0*.40,sw1=wp1*.40;
     quadW(TS.alab,p0L,AP(k,rp0,-sw0,y0),AP(k,rp1,-sw1,y1),p1L,16,y0);
     quadW(TS.atr, AP(k,rp0,-sw0,y0),AP(k,rp0,sw0,y0),AP(k,rp1,sw1,y1),AP(k,rp1,-sw1,y1),16,y0);
     quadW(TS.alab,AP(k,rp0,sw0,y0),p0R,p1R,AP(k,rp1,sw1,y1),16,y0);
    }else{
     quadW(TS.alab,p0L,p0R,p1R,p1L,16,y0);
    }

    // 2) Left & right chamfered cheek walls of Pier k dropping back to the dark core
    const c0L=AP(k,rc0,-wc0,y0),c0R=AP(k,rc0,wc0,y0);
    const c1L=AP(k,rc1,-wc1,y1),c1R=AP(k,rc1,wc1,y1);
    quadW(TS.alab,c0L,p0L,p1L,c1L,16,y0);
    quadW(TS.alab,p0R,c0R,c1R,p1R,16,y0);

    // 3) Deep vertical dark-glazed fluted channel between Pier k (+wc) and Pier k+1 (-wc)
    const n0L=AP((k+1)%N5,rc0,-wc0,y0),n1L=AP((k+1)%N5,rc1,-wc1,y1);
    quadW(TS.atr,c0R,n0L,n1L,c1R,16,y0);

    // Horizontal step-ledge cap at Y_STEP (325 m) and crown soffit/cap
    if(Math.abs(y1-Y_STEP)<.6){
     const sL=AP(k,rp0-3.8,-5.6,y1),sR=AP(k,rp0-3.8,5.6,y1);
     quadH(TS.alab,sL,sR,p1R,p1L,16);
    }
   }

   // Horizontal skybridge / mechanical collar ties across the 5 dark flutes every ~38 m
   if(Math.abs((ym-Y_SH0)%38)<6||Math.abs(ym-Y_STEP)<5||Math.abs(ym-435)<5){
    for(let k=0;k<N5;k++){
     const a=AP(k,rc0+2.5,wc0*.85,ym),b=AP((k+1)%N5,rc0+2.5,-wc0*.85,ym);
     if(keep(a))rbeam('qnBox',a,b,2.4,2.8,ALAB());
    }
   }
  }

  // Stepped 5-sided central lantern / observation penthouse & beacon finial (y = 546..566 m)
  if(keep([0,Y_CR1+4,0])){
   for(let k=0;k<N5;k++){
    // Roof cap over the 5-winged crown at Y_CR1 (546 m)
    const w0L=AP(k,rPier(Y_CR1),-wPier(Y_CR1),Y_CR1),w0R=AP(k,rPier(Y_CR1),wPier(Y_CR1),Y_CR1);
    quadH(TS.alab,[0,Y_CR1,0],w0L,w0R,AP((k+1)%N5,rPier(Y_CR1),-wPier(Y_CR1),Y_CR1),16);
    // Lantern drum (y = 546..562 m)
    const l0=AP(k,14.5,0,Y_CR1),l1=AP((k+1)%N5,14.5,0,Y_CR1);
    const u0=AP(k,10.5,0,Y_TOP-4),u1=AP((k+1)%N5,10.5,0,Y_TOP-4);
    quadW(TS.alab,l0,l1,u1,u0,16,Y_CR1);
    quadH(TS.alab,[0,Y_TOP-4,0],[0,Y_TOP-4,0],u1,u0,16);
    if(!dd&&!isFallen){
     const m=[(l0[0]+l1[0])*.5,Y_CR1+8,(l0[2]+l1[2])*.5];
     kput('strip',m,QS[k],[12,5,5],CYAN);
    }
   }
   // Central spire mast & beacon finial at the apex (y = 562..582 m)
   kput('qnCyl',[0,Y_TOP+4,0],null,[2.2,16,2.2],ALAB());
   if(!dd&&!isFallen){
    kput('strip',[0,Y_TOP+12,0],null,[3.2,12,12],CYAN);
    kput('finial',[0,Y_TOP+15,0],null,[2.2,4.5,2.2],null);
   }
  }
 };

 // Emit standing spire (whole when intact, sheared at ~372 m when ruined)
 emitSpire(S,dd?(p=>p[1]<cutTowerY(p[0],p[2])):(()=>true),false);

 // If ruined (d = 1), cap the jagged tower shear, add bent rebar/pier stubs, and
 // lay the fallen upper spire + flared 5-winged crown in two broken pieces across
 // Garden Court 0 and the breached SE perimeter wall!
 if(dd){
  const ySh=366;
  for(let k=0;k<N5;k++){
   const a=AP(k,24,0,ySh),b=AP((k+1)%N5,24,0,ySh);
   quadH(S.sect,[0,ySh,0],[0,ySh,0],b,a,16);
   // Jagged broken pier ribs & exposed floor slabs sticking out of the shear
   kput('qnBox',AP(k,22,0,ySh+rr(4,14)),qEuler(rr(-.15,.15),TH[k],rr(-.15,.15)),[5.2,rr(10,22),5.2],ALAB());
  }
  for(let fy=ySh-12;fy<ySh+14;fy+=6){
   kput('qnBox',[rr(-6,6),fy,rr(-6,6)],qEuler(rr(-.08,.08),rng()*TAU,rr(-.08,.08)),[24,1.1,24],STONE());
  }

  // Two fallen upper tower sections lying across sector 0 (SE garden court & plain)
  const tiltDir=new THREE.Vector3(FX,-.12,FZ).normalize();
  const qFall=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),tiltDir);
  const pieces=[
   {keep:p=>p[1]>=cutTowerY(p[0],p[2])&&p[1]<cutTower2(p[0],p[2]),y0:368,y1:468,rBase:142,yBase:98,yaw:.06},
   {keep:p=>p[1]>=cutTower2(p[0],p[2]),y0:468,y1:Y_TOP+16,rBase:252,yBase:82,yaw:-.11}
  ];
  for(const PC of pieces){
   const qP=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),PC.yaw).multiply(qFall);
   const pivot=new THREE.Vector3(0,PC.y0,0);
   const target=new THREE.Vector3(FX*PC.rBase,PC.yBase,FZ*PC.rBase);
   const PG=new THREE.Group();
   PG.quaternion.copy(qP);
   PG.position.copy(target.clone().sub(pivot.clone().applyQuaternion(qP)));
   G.add(PG);
   useGroupXF(PG);
   const FS=mkSet();
   emitSpire(FS,PC.keep,true);
   for(const cy of [PC.y0+2,PC.y1-2]){
    for(let k=0;k<N5;k++)quadH(FS.sect,[0,cy,0],[0,cy,0],AP((k+1)%N5,21,0,cy),AP(k,21,0,cy),16);
   }
   endGroupXF();
   flush(FS,PG);
   rubHeap(FX*(PC.rBase+45),PC.yBase-6,FZ*(PC.rBase+45),8,52,65,6.5);
  }
  // Rubble fan outside the breached SE perimeter wall on the plain (y = 0)
  rubHeap(FX*385,0,FZ*385,15,120,140,7.5);
  // Hanging vines from the splayed collar portals & star-arm ledges
  for(let k=0;k<N5;k++){
   for(let j=0;j<12;j++){
    const r=rr(130,360),sg=j%2?1:-1;
    kput('vine',AP(k,r,sg*(armTopW(r)+1),armTopY(r)-2),qEuler(rr(-.08,.08),0,rr(-.08,.08)),[rr(1.2,2.2),rr(12,34),rr(1.2,2.2)],null);
   }
  }
 }

 // Flush all merged geometry into G
 flush(S,G);

 // Outer plain scatter: trees & boulders framing the pentagonal base
 trees(0,0,520,860,dd?95:60);

 // ---- Inspector volume registrations (all guaranteed non-empty) ------------------
 const ST=STATE(d);
 REGISTER({name:'Quintagon ('+ST+')',x:0,z:0,r:580,h:dd?400:Y_TOP+24});
 REGISTER({name:'Quintagon — central 5-fluted spire & collar',x:0,z:0,y:Y_POD1,r:95,h:(dd?390:Y_TOP+20)-Y_POD1});
 REGISTER({name:'Quintagon — central star citadel podium',x:0,z:0,y:85,r:130,h:70});
 for(let k=0;k<N5;k++){
  const armMid=AP(k,280,0,0);
  REGISTER({name:'Quintagon — star arm '+(k+1)+' & corner prow',x:armMid[0],z:armMid[2],y:0,r:145,h:130});
  const ctMid=SP(k,235,0,0);
  REGISTER({name:'Quintagon — triangular garden court '+(k+1),x:ctMid[0],z:ctMid[2],y:55,r:115,h:55});
 }
 REGISTER({name:'Quintagon — seaward harbour pier & jetty',x:AP(0,620,65,0)[0],z:AP(0,620,65,0)[2],y:0,r:155,h:30});

 QN_SITE[d]={x:gx,z:gz,d:d,dd:dd,RB0:RB0,RB1:RB1,YWALL:YWALL,YPAR:YPAR,
  Y_COL0:Y_COL0,Y_COL1:Y_COL1,Y_CR0:Y_CR0,Y_TOP:Y_TOP,
  AP:(k,r,s,y)=>{const p=AP(k,r,s,y);return[gx+p[0],p[1],gz+p[2]];},
  SP:(k,u,v,y)=>{const p=SP(k,u,v,y);return[gx+p[0],p[1],gz+p[2]];}};
 KOFF=[0,0,0];return G;
}
