// ================================================================= TRIGON — the three-faced pyramid
// A pyramid on an EQUILATERAL base three times as tall as it is wide: base edge
// 367 m, apex 1 100 m over the plain, so every face leans at 84.4 degrees and the
// whole mass reads, from 2 km, as one slender triangular spike. Apollonian again
// (see Arcube's header): the outline is the elementary solid and the city lives
// in the three faces, which are deliberately NOT alike —
//
//   THE TERRACE FACE   (normal 214 deg, WNW) a ziggurat. Eleven tiers of 92 m,
//                      each a vertical dwelling wall standing proud of the
//                      pyramid plane with a 9 m planted tread on top of it, so
//                      the face steps back all the way up and its two arrises
//                      are stepped quoins. Parapets, hedges, trees, an arcade at
//                      the foot of every wall and a switchback stair up the lot.
//   THE BALCONY FACE   (normal 94 deg, S) sheer, and covered in a regular grid of
//                      real projecting balconies — one per 6.4 m bay every second
//                      storey — grouped into 25.6 m bays by vertical fins, with a
//                      nested-chevron pattern of ochre fronts on white stone that
//                      echoes the triangle the face itself is.
//   THE PORTAL FACE    (normal 334 deg, ENE) ochre panel cladding pierced by five
//                      nested triangular portals, 240 m down to 50 m, each a deep
//                      reveal with a glazed mullion grid over a lit atrium whose
//                      floor plates can be read through the glass. The same
//                      triangle recurs at small scale as the window motif of the
//                      cladding, zero triangles, in the texture.
//
// WHY THE TERRACES ARE 92 m APART. The face plane falls back 0.098 m per metre of
// height. A tread 9 m deep therefore needs 92 m of riser; anything shallower is a
// loggia, not a terrace, and a stack of loggias reads as the balcony face again.
// Eleven readable steps beat forty invisible ones.
//
// The sun in this kit is WSW and high, so the terrace and balcony faces are both
// lit at about 0.48 and the portal face is in its own shade — which is where lit
// portals want to be. The hero stands between balcony and portal faces.
//
// RUINED: the apex is sheared off along a slanted, jagged plane at ~790 m and
// lies broken in two on the plain to the south-east; the portal face's glazing
// is gone and the atria are black caves with their floor plates hanging; the
// portal/balcony arris has spalled away between 300 and 690 m, laying its floor
// plates open; the terraces have slumped in three places with rubble cascading
// down the risers, and the balcony grid has lost whole runs with some slabs
// hanging off the wall by their inner edge.
function tgWallTex(kind,dec){
 // kind 0 terrace riser (residential), 1 balcony face (full-height glazing),
 // 2 portal face (ochre panels, triangular windows), 3 block stone.
 // One 512 px tile is 25.6 m: four 6.4 m bays, seven 3.66 m storeys.
 return canvasTex(512,512,(g,w,h)=>{const id=g.createImageData(w,h),D=id.data;
  const NB=4,NS=kind===2?4:7,bw=w/NB,sh=h/NS;
  for(let y=0;y<h;y++){const row=Math.floor(y/32),rof=Math.floor(h3(row*1.7,kind,3.3)*80);
   for(let x=0;x<w;x++){const i=(y*w+x)*4;
    const n1=fbm(x/48,y/48,3.1+kind,2)-.5;
    let r,gg,b;
    if(kind===3){
     const xx=(x+rof)%512,bk=Math.floor(xx/80),bid=h3(bk*3.1,row*1.3,7.7);
     const och=bid<.09;
     r=och?200:214;gg=och?120:206;b=och?60:192;
     const t=(bid-.5)*18+n1*22;r+=t;gg+=t*.9;b+=t*.8;
     if(y%32<2||xx%80<2){r-=48;gg-=46;b-=42;}
     else if(bid>.94&&xx%80>18&&xx%80<62&&y%32>9&&y%32<24){r=46;gg=42;b=40;}
    }else{
     const px=Math.floor(x/64),py=Math.floor(y/64),ph=h3(px*1.3+kind,py*2.1,6.6);
     const seam=(x%64<2||y%64<2)||(ph<.5&&Math.abs((y%64)-32)<1.2)||(ph>.8&&Math.abs((x%64)-32)<1.2);
     const B=kind===2?[204,116,52]:kind===1?[218,212,200]:[210,200,184];
     const t=n1*22+(ph-.5)*14;
     r=B[0]+t;gg=B[1]+t*.8;b=B[2]+t*.6;
     if(seam){r-=40;gg-=36;b-=30;}
     if(kind===2&&ph>.9&&x%64>40&&x%64<52&&y%64>8&&y%64<20){r=60;gg=38;b=26;}   // vents
     const bi=Math.floor(x/bw),si=Math.floor(y/sh),bx=x-bi*bw,by=y-si*sh;
     const cr=h3(bi*3.17+kind*1.9,si*7.71,4.4);
     let inW=false,edge=9;
     if(kind===0){const ww=bw*.5,wh=sh*.52,wx0=(bw-ww)*.5,wy0=sh*.26;
      inW=bx>wx0&&bx<wx0+ww&&by>wy0&&by<wy0+wh;
      edge=Math.min(bx-wx0,wx0+ww-bx,by-wy0,wy0+wh-by);}
     else if(kind===1){const ww=bw*.82,wh=sh*.74,wx0=(bw-ww)*.5,wy0=sh*.12;
      inW=bx>wx0&&bx<wx0+ww&&by>wy0&&by<wy0+wh;
      edge=Math.min(bx-wx0,wx0+ww-bx,by-wy0,wy0+wh-by,Math.abs(bx-bw*.5)+.4);}
     else{const tw=bw*.56,th=sh*.64,ty0=sh*.18;
      if(by>ty0&&by<ty0+th){const f=(by-ty0)/th;const hw=tw*.5*f;
       inW=Math.abs(bx-bw*.5)<hw;edge=Math.min(hw-Math.abs(bx-bw*.5),ty0+th-by);}}
     if(inW){
      if(!dec&&cr<.28){const f=.5+cr*1.3;r=236*f;gg=172*f;b=96*f;}
      else{const k2=dec?(cr<.3?8:18):(kind===1?30:24);r=k2;gg=k2+3;b=k2+(kind===1?12:6);}
      if(edge<1.6){r=(r+B[0])*.5;gg=(gg+B[1])*.5;b=(b+B[2])*.5;}
     }
    }
    if(dec){const st=(fbm(x/7,y/90,9.9,2)-.5)*44;
     if(kind===2||kind===3&&r>gg+40){r=r*.62+22+st;gg=gg*.52+14+st*.8;b=b*.5+10+st*.6;}
     else{r=r*.56+24+st;gg=gg*.55+22+st;b=b*.54+18+st;}}
    D[i]=clamp(r,0,255);D[i+1]=clamp(gg,0,255);D[i+2]=clamp(b,0,255);D[i+3]=255;}}
  g.putImageData(id,0,0);});}
// The emissive mask, same lottery as the albedo so the lit cells coincide. `p`
// is the lit fraction: the atria behind the portals burn at 62%.
function tgLitTex(kind,p){return canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),D=id.data;
 const NB=4,NS=kind===2?4:7,bw=w/NB,sh=h/NS;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
  const bi=Math.floor(x/bw),si=Math.floor(y/sh),bx=x-bi*bw,by=y-si*sh;
  const cr=h3(bi*3.17+kind*1.9,si*7.71,4.4);let inW=false;
  if(kind===0){const ww=bw*.5,wh=sh*.52,wx0=(bw-ww)*.5,wy0=sh*.26;inW=bx>wx0&&bx<wx0+ww&&by>wy0&&by<wy0+wh;}
  else if(kind===1){const ww=bw*.82,wh=sh*.74,wx0=(bw-ww)*.5,wy0=sh*.12;inW=bx>wx0&&bx<wx0+ww&&by>wy0&&by<wy0+wh;}
  else{const tw=bw*.56,th=sh*.64,ty0=sh*.18;if(by>ty0&&by<ty0+th){const f=(by-ty0)/th;inW=Math.abs(bx-bw*.5)<tw*.5*f;}}
  const a=inW&&cr<p?.45+cr*1.2:0;
  D[i]=250*a;D[i+1]=168*a;D[i+2]=90*a;D[i+3]=255;}
 g.putImageData(id,0,0);});}
// What a ruin shows where its skin is gone: floor plates every storey, a dark
// void between them, the column grid, and rust bleeding down.
TEX.tgGuts=canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),D=id.data;const sh=h/7;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const by=y%sh,n=fbm(x/9,y/60,5.5,2)-.5;
  let v=26+n*16;
  if(by<5)v=104+n*40; else if(by<8)v=14;
  if(x%64<5&&by>=5)v=Math.max(v,58+n*20);
  D[i]=clamp(v+8,0,255);D[i+1]=clamp(v,0,255);D[i+2]=clamp(v-6,0,255);D[i+3]=255;}
 g.putImageData(id,0,0);});
TEX.tgLawn=canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),D=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const n=fbm(x/14,y/14,8.1,3)-.5,n2=h3(x,y,1.3)-.5;
  D[i]=clamp(78+n*50+n2*18,0,255);D[i+1]=clamp(112+n*44+n2*20,0,255);D[i+2]=clamp(52+n*26,0,255);D[i+3]=255;}
 g.putImageData(id,0,0);});
TEX.tgRes=tgWallTex(0,0);TEX.tgResR=tgWallTex(0,1);TEX.tgResE=tgLitTex(0,.28);
TEX.tgBal=tgWallTex(1,0);TEX.tgBalR=tgWallTex(1,1);TEX.tgBalE=tgLitTex(1,.28);
TEX.tgPor=tgWallTex(2,0);TEX.tgPorR=tgWallTex(2,1);TEX.tgPorE=tgLitTex(2,.28);
TEX.tgBlk=tgWallTex(3,0);TEX.tgBlkR=tgWallTex(3,1);TEX.tgHallE=tgLitTex(1,.62);
MAT.tgRes =new THREE.MeshStandardMaterial({map:TEX.tgRes,roughnessMap:TEX.concreteRM,emissive:0xffffff,emissiveMap:TEX.tgResE,emissiveIntensity:.75,roughness:1,metalness:0,side:DS});
MAT.tgResR=new THREE.MeshStandardMaterial({map:TEX.tgResR,roughnessMap:TEX.concreteRM,color:0xb0a696,roughness:1,metalness:0,side:DS});
MAT.tgBal =new THREE.MeshStandardMaterial({map:TEX.tgBal,roughnessMap:TEX.concreteRM,emissive:0xffffff,emissiveMap:TEX.tgBalE,emissiveIntensity:.75,roughness:1,metalness:0,side:DS});
MAT.tgBalR=new THREE.MeshStandardMaterial({map:TEX.tgBalR,roughnessMap:TEX.concreteRM,color:0xaca292,roughness:1,metalness:0,side:DS});
MAT.tgBalO =new THREE.MeshStandardMaterial({map:TEX.tgBal,roughnessMap:TEX.concreteRM,color:0xe0985a,emissive:0xffffff,emissiveMap:TEX.tgBalE,emissiveIntensity:.75,roughness:1,metalness:0,side:DS});
MAT.tgBalOR=new THREE.MeshStandardMaterial({map:TEX.tgBalR,roughnessMap:TEX.concreteRM,color:0xa07a5a,roughness:1,metalness:0,side:DS});
MAT.tgPor =new THREE.MeshStandardMaterial({map:TEX.tgPor,roughnessMap:TEX.concreteRM,emissive:0xffffff,emissiveMap:TEX.tgPorE,emissiveIntensity:.7,roughness:1,metalness:0,side:DS});
MAT.tgPorR=new THREE.MeshStandardMaterial({map:TEX.tgPorR,roughnessMap:TEX.concreteRM,color:0xa89886,roughness:1,metalness:0,side:DS});
MAT.tgStone =new THREE.MeshStandardMaterial({map:TEX.tgBlk,roughnessMap:TEX.concreteRM,roughness:1,metalness:0,side:DS});
MAT.tgStoneR=new THREE.MeshStandardMaterial({map:TEX.tgBlkR,roughnessMap:TEX.concreteRM,color:0xb2a898,roughness:1,metalness:0,side:DS});
// The atria: the balcony face's full-height glazing, lit at 62% and burning
// brighter than anything on the outside, so a portal reads as a lit hall even in
// the portal face's own shade.
MAT.tgHall =new THREE.MeshStandardMaterial({map:TEX.tgBal,roughnessMap:TEX.concreteRM,color:0xe8dccb,emissive:0xffffff,emissiveMap:TEX.tgHallE,emissiveIntensity:1.35,roughness:1,metalness:0,side:DS});
MAT.tgGuts =new THREE.MeshStandardMaterial({map:TEX.tgGuts,roughness:1,metalness:0,side:DS});
MAT.tgLawn =new THREE.MeshStandardMaterial({map:TEX.tgLawn,roughness:1,metalness:0,side:DS});
MAT.tgLawnR=new THREE.MeshStandardMaterial({map:TEX.tgLawn,color:0x8a8a62,roughness:1,metalness:0,side:DS});
// SHADE IS PAINTED (see Arcube): reveals, soffits and caps.
MAT.tgShade =new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0x4a4238,roughness:1,metalness:0,side:DS});
MAT.tgShadeR=new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0x2e2a25,roughness:1,metalness:0,side:DS});
MAT.tgVoid =new THREE.MeshStandardMaterial({color:0x090a0c,roughness:1,metalness:0,side:DS});
MAT.tgKit  =new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0xffffff,roughness:1,metalness:0,side:DS});
MAT.tgPave =new THREE.MeshStandardMaterial({map:TEX.tgBlk,roughnessMap:TEX.concreteRM,color:0x7c7060,roughness:1,metalness:0,side:DS});
MAT.tgPaveR=new THREE.MeshStandardMaterial({map:TEX.tgBlkR,roughnessMap:TEX.concreteRM,color:0x8e8474,roughness:1,metalness:0,side:DS});
// Instanced pieces, in the qFacing cell: +z out of the wall, +x along it, +y up.
kdef('tgBox',new THREE.BoxGeometry(1,1,1),MAT.tgKit);
kdef('tgDim',new THREE.BoxGeometry(1,1,1),MAT.tgVoid);
// A balcony: deck, soffit, front (slab edge + balustrade) and two ends. 12 tris.
kdef('tgBalc',plymQuadGeo([
  [-.5,0,0, .5,0,0, .5,0,1, -.5,0,1],
  [-.5,-.25,0, -.5,-.25,1, .5,-.25,1, .5,-.25,0],
  [-.5,-.25,1, .5,-.25,1, .5,1,1, -.5,1,1],
  [-.5,-.25,0, -.5,-.25,1, -.5,1,1, -.5,1,0],
  [ .5,-.25,0, .5,1,0, .5,1,1, .5,-.25,1]],1,1),MAT.tgKit);
kdef('tgArch',arcWindowGeo(6,9,1.2),MAT.tgVoid);
// Rubble on its own flat-shaded material: instance colours are LINEAR, so a
// block that should read as weathered stone wants a lightness under .15.
MAT.tgRubble=new THREE.MeshStandardMaterial({color:0xffffff,roughness:1,metalness:0,flatShading:true});
kdef('tgRub',new THREE.DodecahedronGeometry(1,0),MAT.tgRubble);
// The portal glazing: thinner and warmer than MAT.glass, so the lit hall behind
// it carries through instead of coming back as a pale blue sheet.
MAT.tgGlass=new THREE.MeshStandardMaterial({color:0x9cc4d6,transparent:true,opacity:.2,metalness:.1,roughness:.1,side:DS,depthWrite:false});
const TG_TRI=(function(){const g=new THREE.BufferGeometry();
 g.setAttribute('position',new THREE.Float32BufferAttribute([-.5,0,0, .5,0,0, 0,1,0],3));
 g.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,.5,1],2));g.computeVertexNormals();return g;})();
kdef('tgTriL',TG_TRI,MAT.dot);
kdef('tgTriD',TG_TRI.clone(),MAT.tgVoid);
// Presets are DERIVED from this (targets/trigon/91z-views.js runs after the scene).
const TG_SITE={};

function buildTrigon(scene,gx,gz,d){reseed(9710+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0;

 // ---- the numbers ------------------------------------------------------------
 const S3=Math.sqrt(3);
 const EDGE=367, RI=EDGE/(2*S3);          // 105.94  base edge, inradius
 const PL=18, YA=1100, YP=1030, HP=YA-PL; // plinth top, apex, pyramidion foot
 const TILE=25.6, STY=TILE/7;             // texture tile, storey
 const ALPHA=Math.atan(RI/HP);            // 5.59 deg off vertical
 const DY=y=>RI*(YA-y)/HP;                // distance of every face plane at y
 const CHY=y=>12*DY(y)/RI;                // the portal/balcony arris chamfer
 const PHI=[214,334,94].map(a=>a*Math.PI/180);
 const NX=PHI.map(Math.cos), NZ=PHI.map(Math.sin);
 const FNAME=['the terrace face','the portal face','the balcony face'];
 // a point on face k at horizontal distance r from the axis, s along the face, height y
 const FP=(k,r,s,y)=>[NX[k]*r-NZ[k]*s,y,NZ[k]*r+NX[k]*s];
 const QF=[0,1,2].map(k=>qFacing([NX[k],0,NZ[k]]));      // +x runs along -s
 const QFT=QF.map(q=>q.clone().multiply(qEuler(-ALPHA,0,0)));  // ... leaning with the face
 const TV=k=>[-NZ[k],0,NX[k]];
 const V3=a=>new THREE.Vector3(a[0],a[1],a[2]);
 const qB=(X,Y)=>{const x=V3(X).normalize(),y=V3(Y).normalize();const z=new THREE.Vector3().crossVectors(x,y).normalize();
  y.crossVectors(z,x);return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x,y,z));};
 const inside=(x,y,z,m)=>{for(let k=0;k<3;k++)if(NX[k]*x+NZ[k]*z>DY(y)-m)return false;return true;};

 // ---- the terraces -----------------------------------------------------------
 const NT=11, TH=(YP-PL)/NT;              // 92 m tiers, 9 m treads
 const TY=i=>PL+i*TH;
 const TIER=y=>Math.max(0,Math.min(NT-1,Math.floor((y-PL)/TH)));
 const RT=ym=>ym>=YP?DY(ym):DY(TY(TIER(ym)));   // the riser's distance
 // s-range of each face at height y, in the row whose middle is ym. The terrace
 // risers stand proud of the plane, so both neighbours reach out to meet them.
 const EDGES=[(y,ym)=>{const h=(2*DY(y)+RT(ym))/S3;return[-h,h];},
              (y,ym)=>[-(DY(y)+2*RT(ym))/S3,S3*DY(y)-CHY(y)],
              (y,ym)=>[-(S3*DY(y)-CHY(y)),(DY(y)+2*RT(ym))/S3]];
 const DIST=[(y,ym)=>RT(ym),y=>DY(y),y=>DY(y)];
 // the balcony face's nested chevrons: bands parallel to its two arrises
 // QA (arcC): the bands used to be |s|/half-width, i.e. lines converging on the
 // apex, which at 1.5 km read as vertical ochre stripes. A chevron is a band of
 // constant y + k|s|: nested inverted Vs stacked up the face, a third ochre.
 const chev=(s,y)=>{const e=EDGES[2](y,y+.01),v=(y+1.35*Math.abs(s-(e[0]+e[1])*.5))/78;return v-Math.floor(v)<.34;};

 // ---- the portals --------------------------------------------------------------
 const RV=10;                              // depth of the reveal, to the glass
 const PORT=[PL,340,575,750,875].map(yb=>{const D0=DY(yb),wb=.78*D0,h=2.9*wb;
  return{yb,yt:yb+h,wb,db:-.25*D0,w:y=>wb*(yb+h-y)/h};});

 // ---- the ruin -----------------------------------------------------------------
 const FALL=48*Math.PI/180, FX=Math.cos(FALL), FZ=Math.sin(FALL);
 const cutY=(x,z)=>796-.95*(x*FX+z*FZ)+18*(fbm(x*.03+3,z*.03,9711,2)-.5)*2;
 const CUTLO=714;
 const YB2=958;                            // where the fallen apex broke in two
 const cut2=(x,z)=>YB2+9*(fbm(x*.05,z*.05,9716,2)-.5)*2;
 const SPY0=300, SPY1=690;                 // the spalled arris
 const spW=y=>{if(!dd||y<SPY0||y>SPY1)return 0;const f=(y-SPY0)/(SPY1-SPY0);
  return(8+44*Math.sin(Math.PI*Math.pow(f,.8)))*(1+.3*(fbm(y*.02,1.7,9712,2)-.5)*2);};
 const spHit=(k,s,y)=>{if(k===0)return false;const w=spW(y);if(!(w>0))return false;
  const dv=k===1?S3*DY(y)-s:s+S3*DY(y);return dv<w;};
 const hfn=holeFn(d*.42,9713,null,1.4);
 const rot=(k,s,y)=>hfn?hfn(s/216+k*3.3,y+k*170):false;
 const SLUMP=[{s:-48,i:7},{s:58,i:4},{s:8,i:2}];
 const slumpRiser=(s,y)=>{if(!dd)return false;const i=TIER(y);
  for(const S of SLUMP)if(S.i===i&&Math.abs(s-S.s)<15+6*(fbm(y*.05,s*.05,9717,2)-.5)&&y>TY(i)+TH*.45)return true;return false;};
 const slumpTread=(i,s)=>{if(!dd)return false;for(const S of SLUMP)if(S.i===i&&Math.abs(s-S.s)<18)return true;return false;};
 const gone=(k,s,y)=>dd&&(spHit(k,s,y)||rot(k,s,y)||(k===0&&slumpRiser(s,y)));

 // ---- the palette ----------------------------------------------------------------
 const STONE=()=>new THREE.Color().setHSL(rr(.08,.11),rr(.05,.14),dd?rr(.20,.30):rr(.62,.76));
 const OCHRE=()=>new THREE.Color().setHSL(rr(.055,.075),rr(.55,.72),dd?rr(.17,.25):rr(.44,.52));
 const DECK=()=>new THREE.Color().setHSL(rr(.07,.10),rr(.04,.10),dd?rr(.16,.22):rr(.44,.54));
 const LEAF=()=>new THREE.Color().setHSL(rr(.18,.32),rr(.20,.45),dd?rr(.14,.26):rr(.22,.34));
 const MOSS=()=>new THREE.Color().setHSL(rr(.20,.30),rr(.3,.5),rr(.06,.14));
 const WARMW=new THREE.Color(0xffa957);
 const RUBC=()=>new THREE.Color().setHSL(rr(.05,.09),rr(.10,.28),rr(.035,.085));
 const tgRub=(cx,cz,r0,r1,n,sM)=>{for(let j=0;j<n;j++){const a=rng()*TAU,u=Math.pow(rng(),2.2),r=r0+(r1-r0)*u,sz=rr(.8,sM)*(1.2-.6*u);
  kput('tgRub',[cx+Math.cos(a)*r,sz*.3+(1-u)*(1-u)*sM*.3,cz+Math.sin(a)*r],qEuler(rng()*3,rng()*3,rng()*3),
   [sz*rr(.8,1.4),sz*rr(.4,.8),sz*rr(.8,1.4)],RUBC());}};
 const person=(p)=>{if(dd)return;
  kput('figB',p,qEuler(0,rng()*TAU,0),1,new THREE.Color().setHSL(rr(0,.1),rr(.2,.5),rr(.25,.5)));
  kput('figH',p,null,1,new THREE.Color(0xc9a17e));};
 const plant=(p,h)=>{kput('trunk',p,qEuler(rr(-.05,.05),rng()*TAU,rr(-.05,.05)),
   [h*.16,h*.74,h*.16],new THREE.Color().setHSL(rr(.05,.10),rr(.2,.4),rr(.14,.28)));
  const s0=h*rr(.28,.40);
  kput('leafCard',[p[0]+rr(-.08,.08)*h,p[1]+h*.72,p[2]+rr(-.08,.08)*h],
   qEuler(rr(-.07,.07),rng()*TAU,rr(-.07,.07)),[s0,s0*rr(.7,1.05),s0],LEAF());};

 // ---- geometry accumulators ------------------------------------------------------
 // A face of this building is a triangle, and gridSurface's UVs are its own
 // parameters, so a triangle parameterised that way squeezes its windows to
 // nothing at the top. Every surface here is instead laid as quads with WORLD
 // UVs (s/25.6, y/25.6): a window is 3.2 x 1.9 m at the foot and at the apex.
 const ACC=()=>({P:[],U:[],I:[],n:0});
 const quad=(A,a,b,c,e,ua,ub,uc,ue)=>{A.P.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2],e[0],e[1],e[2]);
  A.U.push(ua[0],ua[1],ub[0],ub[1],uc[0],uc[1],ue[0],ue[1]);
  A.I.push(A.n,A.n+1,A.n+2,A.n,A.n+2,A.n+3);A.n+=4;};
 const quadW=(A,a,b,c,e)=>quad(A,a,b,c,e,[a[0]/TILE+a[2]/TILE*.3,a[1]/TILE+a[2]/TILE],[b[0]/TILE+b[2]/TILE*.3,b[1]/TILE+b[2]/TILE],
   [c[0]/TILE+c[2]/TILE*.3,c[1]/TILE+c[2]/TILE],[e[0]/TILE+e[2]/TILE*.3,e[1]/TILE+e[2]/TILE]);
 const geoOf=A=>{if(!A.n)return null;const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(A.P,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(A.U,2));g.setIndex(A.I);g.computeVertexNormals();return g;};
 const mkSet=()=>({res:ACC(),bal:ACC(),balO:ACC(),por:ACC(),stn:ACC(),lawn:ACC(),shd:ACC(),guts:ACC(),hall:ACC(),pave:ACC(),glass:ACC()});
 const MATS={res:dd?MAT.tgResR:MAT.tgRes,bal:dd?MAT.tgBalR:MAT.tgBal,balO:dd?MAT.tgBalOR:MAT.tgBalO,por:dd?MAT.tgPorR:MAT.tgPor,
  stn:dd?MAT.tgStoneR:MAT.tgStone,lawn:dd?MAT.tgLawnR:MAT.tgLawn,shd:dd?MAT.tgShadeR:MAT.tgShade,
  guts:MAT.tgGuts,hall:dd?MAT.tgGuts:MAT.tgHall,pave:dd?MAT.tgPaveR:MAT.tgPave,glass:MAT.tgGlass};
 const flush=(S,par)=>{for(const k in S){const g=geoOf(S[k]);if(g)mesh(g,MATS[k],par);}};

 // Rows of a face between breakpoints ys, each row split into solid intervals
 // round the holes (portals, which are always interior to the face) and then
 // into columns about colW wide. Every quad is a trapezoid, so a triangular
 // portal edge is exact, not a staircase of dropped cells.
 const faceRows=(A,k,ys,holes,colW,off,shrink,drop)=>{
  for(let r=0;r<ys.length-1;r++){const y0=ys[r],y1=ys[r+1];if(y1-y0<.05)continue;const ym=(y0+y1)*.5;
   const e0=EDGES[k](y0,ym),e1=EDGES[k](y1,ym);
   const r0=DIST[k](y0,ym)+off,r1=DIST[k](y1,ym)+off;
   let iv=[[e0[0]+shrink,e0[1]-shrink,e1[0]+shrink,e1[1]-shrink]];
   for(const H of holes){if(ym<=H.yb||ym>=H.yt)continue;const w0=H.w(y0)+(off<0?-off*.6:0),w1=H.w(y1)+(off<0?-off*.6:0);
    const nv=[];for(const I of iv){nv.push([I[0],-w0,I[2],-w1]);nv.push([w0,I[1],w1,I[3]]);}iv=nv;}
   for(const I of iv){if(I[1]-I[0]<.05&&I[3]-I[2]<.05)continue;
    const n=Math.max(1,Math.ceil(Math.max(I[1]-I[0],I[3]-I[2])/colW));
    for(let c=0;c<n;c++){const u0=c/n,u1=(c+1)/n;
     const sa=lerp(I[0],I[1],u0),sb=lerp(I[0],I[1],u1),sc=lerp(I[2],I[3],u1),se2=lerp(I[2],I[3],u0);
     if(drop&&drop((sa+sb+sc+se2)*.25,ym,(r0+r1)*.5))continue;
     quad(A,FP(k,r0,sa,y0),FP(k,r0,sb,y0),FP(k,r1,sc,y1),FP(k,r1,se2,y1),
      [sa/TILE,y0/TILE],[sb/TILE,y0/TILE],[sc/TILE,y1/TILE],[se2/TILE,y1/TILE]);}}}};
 const ROWH=TH/10;
 const baseYs=[];for(let j=0;j<=100;j++)baseYs.push(PL+j*ROWH);  // 9.2 m rows, tier-aligned
 const porYs=baseYs.concat(PORT.flatMap(P=>[P.yb,P.yt])).sort((a,b)=>a-b)
  .filter((v,i,a)=>i===0||v-a[i-1]>.05);

 // ======================================================================= THE BODY
 // Everything the standing mass is made of, filtered by keep(p). The standing
 // ruin keeps what is under the shear; each fallen piece of the apex is the SAME
 // call with the complementary predicate inside a laid-down group, so the break
 // faces match cell for cell.
 const emitBody=(S,keep,piece)=>{
  const kp=(k,s,y,r)=>keep(FP(k,r,s,y));
  const colW=dd?8:12;
  // ---- the three faces ----------------------------------------------------------
  faceRows(S.res,0,baseYs,[],colW,0,0,(s,y,r)=>!kp(0,s,y,r)||gone(0,s,y));
  faceRows(S.por,1,porYs,PORT,colW,0,0,(s,y,r)=>!kp(1,s,y,r)||gone(1,s,y));
  faceRows(S.bal,2,baseYs,[],colW,0,0,(s,y,r)=>!kp(2,s,y,r)||gone(2,s,y)||chev(s,y));
  faceRows(S.balO,2,baseYs,[],colW,0,0,(s,y,r)=>!kp(2,s,y,r)||gone(2,s,y)||!chev(s,y));
  // the chamfer on the portal/balcony arris
  for(let r=0;r<baseYs.length-1;r++){const y0=baseYs[r],y1=baseYs[r+1],ym=(y0+y1)*.5;
   const a0=FP(1,DY(y0),S3*DY(y0)-CHY(y0),y0),b0=FP(2,DY(y0),-(S3*DY(y0)-CHY(y0)),y0);
   const a1=FP(1,DY(y1),S3*DY(y1)-CHY(y1),y1),b1=FP(2,DY(y1),-(S3*DY(y1)-CHY(y1)),y1);
   const m=[(a0[0]+b1[0])*.5,ym,(a0[2]+b1[2])*.5];
   if(!keep(m)||(dd&&spW(ym)>0))continue;
   quad(S.stn,a0,b0,b1,a1,[0,y0/TILE],[CHY(y0)/TILE,y0/TILE],[CHY(y1)/TILE,y1/TILE],[0,y1/TILE]);}
  // ---- the treads -----------------------------------------------------------------
  for(let i=0;i<NT;i++){const Y=TY(i+1),R=DY(TY(i)),Db=DY(Y);
   const hl0=(2*Db+R)/S3,hl1=S3*Db;
   const n=Math.max(2,Math.ceil(2*hl0/10));
   for(let c=0;c<n;c++){const u0=c/n,u1=(c+1)/n;
    const sa=lerp(-hl0,hl0,u0),sb=lerp(-hl0,hl0,u1),sc=lerp(-hl1,hl1,u1),se2=lerp(-hl1,hl1,u0);
    const sm=(sa+sb)*.5;
    if(!kp(0,sm,Y,R)||slumpTread(i,sm)||(dd&&rot(0,sm,Y+3)))continue;
    quad(S.lawn,FP(0,R,sa,Y),FP(0,R,sb,Y),FP(0,Db,sc,Y),FP(0,Db,se2,Y),
     [sa/12,R/12],[sb/12,R/12],[sc/12,Db/12],[se2/12,Db/12]);}}
  // ---- the deck at the pyramidion's foot ---------------------------------------------
  {const D=DY(YP),c=CHY(YP);
   if(keep([0,YP,0]))quad(S.shd,FP(0,D,-S3*D,YP),FP(0,D,S3*D,YP),FP(1,D,S3*D-c,YP),FP(2,D,-(S3*D-c),YP),[0,0],[1,0],[1,1],[0,1]);}
  // ---- the liner: what shows through a hole ----------------------------------------
  if(dd){for(let k=0;k<3;k++){
    const hol=k===1?PORT:[];
    const saveD=DIST[k],saveE=EDGES[k];DIST[k]=y=>DY(y);EDGES[k]=y=>[-S3*DY(y),S3*DY(y)];
    faceRows(S.guts,k,k===1?porYs:baseYs,hol,16,-5,9.5,(s,y,r)=>!keep(FP(k,r+5,s,y))||spHit(k,s,y)||
      (k===1&&spW(y)>0&&S3*DY(y)-s<spW(y)+12)||(k===2&&spW(y)>0&&s+S3*DY(y)<spW(y)+12));
    DIST[k]=saveD;EDGES[k]=saveE;}}
  // ---- the spalled arris: back wall of the notch and the floors laid open ----------
  if(dd){let lastA=null,lastB=null,lastY=0;
   for(let y=SPY0;y<=SPY1+.1;y+=ROWH*.5){const w=spW(y)+10;
    const A=FP(1,DY(y),S3*DY(y)-w,y),B=FP(2,DY(y),-(S3*DY(y)-w),y);
    if(lastA&&keep([A[0],y,A[2]]))quadW(S.guts,lastA,lastB,B,A);
    lastA=A;lastB=B;lastY=y;}
   for(let y=SPY0+STY;y<SPY1-2;y+=STY*2){const w=spW(y);if(w<10)continue;
    const V=FP(1,DY(y),S3*DY(y),y),A=FP(1,DY(y),S3*DY(y)-w-10,y),B=FP(2,DY(y),-(S3*DY(y)-w-10),y);
    const cm=[(A[0]+B[0])*.5,y,(A[2]+B[2])*.5],L=Math.hypot(A[0]-B[0],A[2]-B[2]);
    const dep=Math.hypot(V[0]-cm[0],V[2]-cm[2]);
    if(rng()<.18)continue;
    const f=rr(.2,.45),c=[lerp(cm[0],V[0],f*.6),y,lerp(cm[2],V[2],f*.6)];
    const q=qB([B[0]-A[0],0,B[2]-A[2]],[0,1,0]);
    kput('tgBox',c,q.clone().multiply(qEuler(rr(-.04,.04),0,rr(-.05,.05))),[L*rr(.4,.6),.9,dep*f*1.3],new THREE.Color(0x6e665a));
    kput('tgDim',[c[0],y-1.2,c[2]],q,[L*.4,1.4,dep*f],null);}}
  // ---- the atria ------------------------------------------------------------------------
  for(let pi=0;pi<PORT.length;pi++){const P=PORT[pi];
   const mid=FP(1,DY(P.yb),0,P.yb);if(!keep(mid))continue;
   const ny=8,nd=6;
   // floor: reveal (stone) then hall
   const dF=DY(P.yb);
   for(let j=0;j<nd;j++){const d0=lerp(dF,P.db,j/nd),d1=lerp(dF,P.db,(j+1)/nd);
    const dst=d0>dF-RV?S.stn:S.shd;
    quadW(dst,FP(1,d0,-P.wb,P.yb),FP(1,d0,P.wb,P.yb),FP(1,d1,P.wb,P.yb),FP(1,d1,-P.wb,P.yb));}
   // side walls: the first RV metres are the reveal, the rest is hall
   for(const sg of [-1,1])for(let a=0;a<ny;a++){const y0=lerp(P.yb,P.yt,a/ny),y1=lerp(P.yb,P.yt,(a+1)/ny);
    const segs=[[0,RV,S.shd],[RV,null,S.hall]];
    for(const sgm of segs){const f0=DY(y0)-sgm[0],f1=DY(y1)-sgm[0];
     const g0=sgm[1]==null?P.db:DY(y0)-sgm[1],g1=sgm[1]==null?P.db:DY(y1)-sgm[1];
     for(let j=0;j<(sgm[1]==null?nd:1);j++){const n2=sgm[1]==null?nd:1;
      const a0=lerp(f0,g0,j/n2),b0=lerp(f0,g0,(j+1)/n2),a1=lerp(f1,g1,j/n2),b1=lerp(f1,g1,(j+1)/n2);
      const pm=FP(1,(a0+b1)*.5,sg*P.w((y0+y1)*.5),(y0+y1)*.5);
      if(!keep(pm))continue;
      quad(sgm[2],FP(1,a0,sg*P.w(y0),y0),FP(1,b0,sg*P.w(y0),y0),FP(1,b1,sg*P.w(y1),y1),FP(1,a1,sg*P.w(y1),y1),
       [a0/TILE,y0/TILE],[b0/TILE,y0/TILE],[b1/TILE,y1/TILE],[a1/TILE,y1/TILE]);}}}
   // back wall
   for(let a=0;a<ny;a++){const y0=lerp(P.yb,P.yt,a/ny),y1=lerp(P.yb,P.yt,(a+1)/ny);
    if(!keep(FP(1,P.db,0,(y0+y1)*.5)))continue;
    quad(S.hall,FP(1,P.db,-P.w(y0),y0),FP(1,P.db,P.w(y0),y0),FP(1,P.db,P.w(y1),y1),FP(1,P.db,-P.w(y1),y1),
     [-P.w(y0)/TILE,y0/TILE],[P.w(y0)/TILE,y0/TILE],[P.w(y1)/TILE,y1/TILE],[-P.w(y1)/TILE,y1/TILE]);}
   // the glass, intact only
   if(!dd){const gy=P.yb+.2;
    quad(S.glass,FP(1,DY(gy)-RV,-P.w(gy),gy),FP(1,DY(gy)-RV,P.w(gy),gy),FP(1,DY(P.yt)-RV,0,P.yt),FP(1,DY(P.yt)-RV,0,P.yt),[0,0],[1,0],[.5,1],[.5,1]);}
   // the frame: a heavy architrave proud of the face on all three edges
   const fr=(s0,y0,s1,y1,w)=>{const a=FP(1,DY(y0)+w*.4,s0,y0),b=FP(1,DY(y1)+w*.4,s1,y1);
    const m=[(a[0]+b[0])*.5,(a[1]+b[1])*.5,(a[2]+b[2])*.5];if(!keep(m))return;
    if(dd&&rng()<.25)return;beam('tgBox',a,b,w,w,dd?STONE():new THREE.Color(0x8c5a34));};
   const FW=Math.max(3,P.wb*.07);
   fr(-P.wb-FW*.5,P.yb,-FW*.3,P.yt+FW*.6,FW);fr(P.wb+FW*.5,P.yb,FW*.3,P.yt+FW*.6,FW);
   fr(-P.wb-FW,P.yb+FW*.3,P.wb+FW,P.yb+FW*.3,FW);
   // mullions in the glass plane: horizontals every 12 m, verticals every 9 m
   const MG=(P.yt-P.yb)>120?12:8, MV=(P.yt-P.yb)>120?9:6;
   for(let y=P.yb+MG;y<P.yt-2;y+=MG){const w=P.w(y);
    const a=FP(1,DY(y)-RV+.5,-w,y),b=FP(1,DY(y)-RV+.5,w,y);
    if(!keep(a))continue;
    if(!dd)beam('tgBox',a,b,.9,.9,new THREE.Color(0xd8d2c4));
    else if(rng()<.14){const f=rr(.1,.35);beam('tgBox',a,[lerp(a[0],b[0],f),y-rr(0,6),lerp(a[2],b[2],f)],.9,.9,new THREE.Color(0x4a3a2e));}}
   for(let s=-Math.floor(P.wb/MV)*MV;s<=P.wb;s+=MV){if(Math.abs(s)>P.wb-2)continue;
    const yt=P.yt-(P.yt-P.yb)*Math.abs(s)/P.wb;
    const a=FP(1,DY(P.yb)-RV+.5,s,P.yb),b=FP(1,DY(yt)-RV+.5,s,yt);
    if(!keep(a))continue;
    if(!dd)beam('tgBox',a,b,.9,.9,new THREE.Color(0xd8d2c4));
    else if(rng()<.2){const f=rr(.1,.3);beam('tgBox',b,[lerp(b[0],a[0],f)+rr(-3,3),lerp(b[1],a[1],f),lerp(b[2],a[2],f)],.9,.9,new THREE.Color(0x4a3a2e));}}
   // the floor plates, read through the glass: galleries from the back wall
   // forward, leaving the front of the hall a void the full height of the portal
   const FS=STY*4;
   for(let y=P.yb+FS;y<P.yt-10;y+=FS){const w=P.w(y)-.6;if(w<5)continue;
    const dfr=lerp(P.db,DY(y)-RV,.58),dc=(P.db+dfr)*.5,dep=dfr-P.db;
    const c=FP(1,dc,0,y);if(!keep(c))continue;
    let q=QF[1],yy=y;
    if(dd){if(rng()<.35)continue;if(rng()<.35){q=QF[1].clone().multiply(qEuler(rr(.12,.34),0,rr(-.08,.08)));yy=y-rr(2,7);}}
    const cc=FP(1,dc,0,yy);
    kput('tgBox',cc,q,[2*w*rr(.92,1),1.3,dep],dd?new THREE.Color(0x3e3a33):DECK());
    kput('tgDim',[cc[0],yy-1.2,cc[2]],q,[2*w*.9,1.2,dep*.96],null);
    if(!dd){kput('strip',FP(1,dfr+.3,0,y+.9),QF[1],[2*w*.94,5,5],WARMW);
     kput('tgBox',FP(1,dfr-.2,0,y+1.1),QF[1],[2*w*.96,1.2,.4],new THREE.Color(0xe0dace));
     for(let j=0;j<Math.round(w/6);j++)person(FP(1,dc+rr(-dep*.4,dep*.4),rr(-w*.8,w*.8),y+.65));}}
   // the hall floor: a plaza under the portal
   for(let j=0;j<(dd?0:Math.round(P.wb*.6));j++){const s=rr(-P.wb*.7,P.wb*.7),dd2=rr(P.db+6,DY(P.yb)-RV-4);
    if(Math.abs(s)>P.w(P.yb)*.8)continue;person(FP(1,dd2,s,P.yb));}
   if(pi<2)for(let j=0;j<(dd?4:10);j++)plant(FP(1,rr(P.db+10,DY(P.yb)-RV-6),rr(-P.wb*.5,P.wb*.5),P.yb),rr(8,15));
   if(dd)for(let j=0;j<50;j++){const s=rr(-P.wb*.8,P.wb*.8),dd2=rr(P.db+2,DY(P.yb)-2),sz=rr(1.5,6);
    const p=FP(1,dd2,s,P.yb+sz*.35);if(keep(p))kput('tgRub',p,qEuler(rng()*3,rng()*3,rng()*3),[sz,sz*.6,sz],RUBC());}}

  // ======================================================== THE BALCONY FACE, in detail
  const balGone=(s,y)=>dd&&fbm(s*.018+2,y*.006,9714,2)<.45;
  for(let y=Math.ceil((PL+5)/STY)*STY;y<YP-6;y+=STY){const e=EDGES[2](y,y+.5),Dy=DY(y);
   const c0=(e[0]+e[1])*.5,hw=(e[1]-e[0])*.5;
   for(let j=Math.ceil(e[0]/6.4+.5);(j+.5)*6.4<e[1]-4;j++){const s=(j+.5)*6.4;
    if(s-3<e[0]+1)continue;
    const p=FP(2,Dy,s,y);if(!keep(p)||gone(2,s,y+1))continue;
    if(dd&&(balGone(s,y)||rng()<.12))continue;
    const col=chev(s,y)?OCHRE():STONE();
    let q=QF[2];
    if(dd&&rng()<.06)q=QF[2].clone().multiply(qEuler(rr(.9,1.4),0,rr(-.3,.3)));
    kput('tgBalc',p,q,[5,1.1,rr(2.2,2.7)],col);
    if(dd&&rng()<.18)kput('moss',FP(2,Dy+1.4,s+rr(-1.5,1.5),y+.2),null,[rr(1.2,2.4),rr(.4,.8),rr(.8,1.4)],MOSS());
    if(dd&&rng()<.05)kput('vine',FP(2,Dy+2.6,s,y-.2),qEuler(rr(-.1,.1),0,rr(-.1,.1)),[rr(.9,1.6),rr(6,26),rr(.9,1.6)],null);
    if(!dd&&rng()<.035)person(FP(2,Dy+1.2,s+rr(-1.5,1.5),y));
    if(!dd&&rng()<.1)kput('leafCard',FP(2,Dy+1.9,s+rr(-1.6,1.6),y+.9),qEuler(0,rng()*TAU,0),[rr(1.2,2),rr(1,1.6),rr(1.2,2)],LEAF());}}
  // the fins, in 25.6 m segments so the ruin can lose them piecemeal
  for(let m=-7;m<=7;m++){const s=m*TILE;
   for(let y0=PL;y0<YP-4;y0+=TILE){const y1=Math.min(YP,y0+TILE),ym=(y0+y1)*.5;
    const e=EDGES[2](y1,y1-.5);if(s<e[0]+3||s>e[1]-3)break;
    const p=FP(2,DY(ym)+2.1,s,ym);if(!keep(p)||gone(2,s,ym))continue;
    if(dd&&rng()<.3)continue;
    kput('tgBox',p,QFT[2],[1.3,(y1-y0)/Math.cos(ALPHA)+.2,4.2],STONE());}}
  // a cornice every 7 storeys stitches the fins into a grid of bays
  for(let y=PL+TILE;y<YP-8;y+=TILE){const e=EDGES[2](y,y+.5);
   for(let s=e[0]+6;s<e[1]-5;s+=12){const p=FP(2,DY(y)+.9,s,y-.9);
    if(!keep(p)||gone(2,s,y)||(dd&&rng()<.3))continue;
    kput('tgBox',p,QF[2],[12.1,1.2,1.8],STONE());}}

  // ======================================================== THE PORTAL FACE, in detail
  const inPort=(s,y,m)=>{for(const P of PORT)if(y>P.yb-m&&y<P.yt+m&&Math.abs(s)<P.w(y)+m)return true;return false;};
  // panel relief: ochre plates and vents, the reference's greeble
  for(let j=0;j<2400;j++){const y=rr(PL+3,YP-6),e=EDGES[1](y,y),s=rr(e[0]+3,e[1]-3);
   if(inPort(s,y,7))continue;const p=FP(1,DY(y)+.3,s,y);if(!keep(p)||gone(1,s,y))continue;
   const big=rng()<.3;
   kput(rng()<.12?'tgDim':'tgBox',p,QFT[1],big?[rr(6,14),rr(4,10),.7]:[rr(1.5,5),rr(1.2,3.5),.9],
    new THREE.Color().setHSL(rr(.05,.07),rr(.6,.8),dd?rr(.12,.18):rr(.26,.36)));}
  // horizontal ledges every 7 storeys
  for(let y=PL+TILE;y<YP-8;y+=TILE){const e=EDGES[1](y,y+.5);
   for(let s=e[0]+6;s<e[1]-5;s+=12){if(inPort(s,y,2))continue;const p=FP(1,DY(y)+.8,s,y);
    if(!keep(p)||gone(1,s,y)||(dd&&rng()<.3))continue;
    kput('tgBox',p,QF[1],[12.1,1.4,1.6],new THREE.Color().setHSL(.06,.35,dd?.16:.30));}}
  // the triangle motif at the middle scale: a pair of small portals either side
  // of each great one, and a chain of them down the rest of the face
  for(const P of PORT){const ym=P.yb+(P.yt-P.yb)*.28;
   for(const sg of [-1,1]){for(let t=0;t<3;t++){const wt=P.wb*.22*(1-t*.2),ht=wt*2.2;
     const y0=ym+t*ht*1.25-ht*.5;const s=sg*(P.w(y0)+wt*.8+6);
     const e=EDGES[1](y0,y0);if(s-wt*.5<e[0]+4||s+wt*.5>e[1]-4)continue;
     const p=FP(1,DY(y0)+.5,s,y0);if(!keep(p)||gone(1,s,y0))continue;
     kput(!dd&&rng()<.55?'tgTriL':'tgTriD',p,QFT[1],[wt,ht,1],!dd?WARMW.clone().multiplyScalar(rr(.55,.95)):null);
     kput('tgBox',FP(1,DY(y0)+.4,s,y0-.6),QF[1],[wt*1.2,1.2,1.4],new THREE.Color().setHSL(.06,.35,dd?.16:.3));}}}
  for(let y=PL+30;y<YP-40;y+=34){const e=EDGES[1](y,y);
   for(let s=e[0]+18;s<e[1]-14;s+=22){if(inPort(s,y,14)||rng()<.35)continue;
    const p=FP(1,DY(y)+.5,s,y);if(!keep(p)||gone(1,s,y))continue;
    kput(!dd&&rng()<.4?'tgTriL':'tgTriD',p,QFT[1],[8,14,1],!dd?WARMW.clone().multiplyScalar(rr(.45,.85)):null);}}

  // ======================================================== THE TERRACE FACE, in detail
  for(let i=0;i<NT;i++){const Y=TY(i+1),R=DY(TY(i)),Db=DY(Y),hl=(2*Db+R)/S3;
   const nsg=Math.max(1,Math.floor(2*hl/12)),SG=2*hl/nsg;
   for(let s=-hl+SG*.5;s<hl;s+=SG){const lip=FP(0,R,s,Y);if(!keep(lip))continue;
    const slump=slumpTread(i,s)||(dd&&SLUMP.some(S=>S.i===i&&Math.abs(s-S.s)<24));
    if(!slump){
     kput('tgBox',FP(0,R+.6,s,Y-1.4),QF[0],[SG+.05,2.8,1.8],STONE());          // cornice
     if(!(dd&&rng()<.25))kput('tgBox',FP(0,R-.5,s,Y+.7),QF[0],[SG-.2,1.4,.9],STONE());  // parapet
     for(let h=0;h<(dd?2:3);h++)kput('moss',FP(0,R-1.7,s+rr(-5,5),Y+.2),qEuler(0,rng()*TAU,0),
      dd?[rr(2,5),rr(1,2.4),rr(1.5,3)]:[rr(2,3.4),rr(.9,1.3),rr(1,1.4)],MOSS());}
    // trees along the tread
    if(rng()<(dd?.95:.6))plant(FP(0,R-rr(2.6,4.2),s+rr(-4,4),Y),dd?rr(8,16):rr(7,12));
    if(dd&&rng()<.6)plant(FP(0,rr(Db+1,R-1),s+rr(-5,5),Y),rr(5,11));
    // the path at the foot of the next wall, and the arcade in that wall
    if(i<NT-1){if(!dd||rng()<.5)kput('tgBox',FP(0,Db+2.2,s,Y+.12),QF[0],[SG*(Db/R),.3,3.4],DECK());
     if(Math.abs(s)<hl-10&&SG>8)kput('tgArch',FP(0,Db+.35,s,Y+4.6),QF[0],1,null);
     if(!dd&&Math.round(s/12)%3===0)kput('strip',FP(0,Db+.8,s,Y+10.5),QF[0],[SG*.8,6,6],CYAN);}
    if(dd&&rng()<.5)kput('vine',FP(0,R+.3,s+rr(-5,5),Y-2.4),qEuler(rr(-.08,.08),0,rr(-.08,.08)),[rr(1,2),rr(10,46),rr(1,2)],null);
    if(dd&&rng()<.4)kput('moss',FP(0,rr(Db+1,R-1),s+rr(-5,5),Y+.2),qEuler(0,rng()*TAU,0),[rr(3,7),rr(.6,1.6),rr(3,6)],MOSS());
    if(rng()<.3)person(FP(0,R-rr(4,7),s+rr(-5,5),Y));}
   // the switchback stair up the riser below this tread
   {const y0=TY(i),Rr=R,run=Math.min(130,1.25*hl),dir=i%2?1:-1;
    const s0=-dir*run*.5,s1=dir*run*.5;
    const a=FP(0,Rr+2.4,s0,y0+.6),b=FP(0,Rr+2.4,s1,Y+.3);
    const mid=[(a[0]+b[0])*.5,(a[1]+b[1])*.5,(a[2]+b[2])*.5];
    if(keep(mid)&&(!piece||(keep(a)&&keep(b)))){const dv=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],L=Math.hypot(dv[0],dv[1],dv[2]);
     const q=qB([NX[0],0,NZ[0]],dv);
     const zv=new THREE.Vector3(0,0,1).applyQuaternion(q);
     const broken=dd&&rng()<.45;
     const segs=broken?[[0,.38],[.62,1]]:[[0,1]];
     for(const sgm of segs){const f0=sgm[0],f1=sgm[1],fm=(f0+f1)*.5;
      const c=[lerp(a[0],b[0],fm),lerp(a[1],b[1],fm),lerp(a[2],b[2],fm)];
      kput('tgBox',c,q,[4.8,L*(f1-f0),1.1],STONE());
      kput('tgBox',[c[0]+NX[0]*2.3+zv.x*1.1,c[1]+zv.y*1.1,c[2]+NZ[0]*2.3+zv.z*1.1],q,[.5,L*(f1-f0),1.3],STONE());
      kput('tgDim',[c[0]-zv.x*.9,c[1]-zv.y*.9,c[2]-zv.z*.9],q,[4.6,L*(f1-f0)*.98,.7],null);}
     if(i<2){const ns=Math.floor((Y-y0)/.45);
      for(let k2=0;k2<ns;k2++){const f=(k2+.5)/ns;if(broken&&f>.38&&f<.62)continue;
       const s=lerp(s0,s1,f),y=lerp(y0+.6,Y+.3,f);
       kput('tgBox',FP(0,Rr+2.2,s,y+.7),QF[0],[Math.abs(s1-s0)/ns+.08,.45,4.4],DECK());}}
     if(!dd)for(let k2=0;k2<4;k2++){const f=rng();person(FP(0,Rr+2.4,lerp(s0,s1,f),lerp(y0+.6,Y+.3,f)+1.2));}}}}
  // ---- QA (arcC): the risers' relief ---------------------------------------------------
  // A 92 m riser was a flat wall map: graph paper from 'The terraces'. Now each
  // one carries pilasters every two bays, a string course every seven storeys,
  // and runs of real balconies in some bays and not others (a bay's run is
  // decided per 25.6 m group, so the riser reads as neighbourhoods, not a grid),
  // with planting on them intact and vines off them in the ruin.
  for(let i=0;i<NT;i++){const y0=TY(i),y1=TY(i+1),R=DY(y0),hlo=(2*DY(y1)+R)/S3-5;
   for(let s=-Math.floor(hlo/12.8)*12.8;s<=hlo;s+=12.8){const ym=(y0+y1)*.5;
    const p=FP(0,R+.7,s,ym+1);if(!kp(0,s,ym,R)||gone(0,s,ym)||(dd&&rng()<.25))continue;
    kput('tgBox',p,QF[0],[1.3,y1-y0-6,1.4],STONE());}
   for(let y=y0+TILE;y<y1-8;y+=TILE){
    for(let s=-hlo+6;s<hlo-6;s+=12){if(!kp(0,s,y,R)||gone(0,s,y)||(dd&&rng()<.3))continue;
     kput('tgBox',FP(0,R+.6,s,y),QF[0],[12.1,1.1,1.2],STONE());}}
   for(let g=Math.floor(-hlo/25.6);g*25.6<hlo;g++){
    const h=Math.abs(Math.sin(g*12.9898+i*78.233)*43758.5453)%1;if(h<.3)continue;
    const yA=y0+STY*(h<.7?4:5),col=h<.8?STONE:OCHRE;
    for(let y=yA;y<y1-STY*2;y+=STY*(h<.85?1:2))for(let b=0;b<4;b++){const s=g*25.6+(b+.5)*6.4;
     if(Math.abs(s)>hlo-4||!kp(0,s,y,R)||gone(0,s,y+1))continue;
     if(dd&&(rng()<.5||slumpRiser(s,y)))continue;
     let q=QF[0];if(dd&&rng()<.08)q=QF[0].clone().multiply(qEuler(rr(.9,1.4),0,rr(-.3,.3)));
     kput('tgBalc',FP(0,R,s,y),q,[5.4,1.1,rr(2,2.6)],col());
     if(!dd&&rng()<.14)kput('leafCard',FP(0,R+1.6,s+rr(-1.6,1.6),y+.9),qEuler(0,rng()*TAU,0),[rr(1.2,2),rr(1,1.6),rr(1.2,2)],LEAF());
     if(dd&&rng()<.07)kput('vine',FP(0,R+2.2,s,y-.2),qEuler(rr(-.1,.1),0,rr(-.1,.1)),[rr(.9,1.6),rr(6,22),rr(.9,1.6)],null);}}}
  // ---- the slumps: what came off each broken lip, all the way down -----------------
  if(dd&&!piece)for(const S of SLUMP){
   for(let j=S.i;j>=0;j--){const Yt=TY(j),wv=16+(S.i-j)*7;
    const Rj=j>0?DY(TY(j-1)):RI+38,Dj=DY(Yt);
    const n=j===S.i?40:70;
    for(let q2=0;q2<n;q2++){const u=Math.pow(rng(),1.6),s=S.s+rr(-1,1)*wv,sz=rr(1.5,7)*(1.2-.5*u);
     const dep=j>0?lerp(Dj+1,Rj-1,u):lerp(RI+2,RI+60,u);
     const p=FP(0,dep,s,Yt+sz*.35+(1-u)*sz*.8);if(!keep(p))continue;
     kput('tgRub',p,qEuler(rng()*3,rng()*3,rng()*3),[sz*rr(.8,1.4),sz*rr(.5,.9),sz*rr(.8,1.4)],
      RUBC());}
    // the curtain clinging to the riser it poured down
    const Rr=DY(TY(j));
    for(let q2=0;q2<26;q2++){const y=rr(TY(j)+2,TY(j+1)-2),s=S.s+rr(-.7,.7)*wv,sz=rr(1.2,4);
     const p=FP(0,Rr+sz*.4,s,y);if(!keep(p))continue;
     kput('tgRub',p,qEuler(rng()*3,rng()*3,rng()*3),[sz,sz*.7,sz*.6],RUBC());}}
   for(let q2=0;q2<120;q2++){const s=S.s+rr(-60,60),u=Math.pow(rng(),1.8),sz=rr(1.5,6);
    const p=FP(0,RI+38+u*110,s,sz*.35);kput('tgRub',p,qEuler(rng()*3,rng()*3,rng()*3),[sz,sz*.7,sz],
     RUBC());}}
 };

 // ---- the registry ----------------------------------------------------------------
 REGISTER({name:'Trigon ('+STATE(d)+')',x:0,z:0,r:300,h:dd?880:YA+30});
 const BANDS=[[PL,270],[270,520],[520,780],[780,YP]];
 for(let k=0;k<3;k++)for(const b of BANDS){if(dd&&b[0]>=780)continue;
  const D0=DY(b[0]),D1=DY(b[1]),hw=S3*D0,dc=D0+.5*hw;
  REGISTER({name:'Trigon — '+FNAME[k]+(k===0?', tiers '+(TIER(b[0])+1)+'-'+(TIER(b[1]-1)+1):'')+
   ', '+Math.round(b[0])+'-'+Math.round(b[1])+' m',
   x:NX[k]*dc,z:NZ[k]*dc,y:b[0],r:1.12*hw+(D0-D1)+6,h:b[1]-b[0]});}
 PORT.forEach((P,i)=>{if(dd&&P.yb>740)return;
  const c=FP(1,(DY(P.yb)+P.db)*.5,0,0);
  REGISTER({name:'Trigon — portal atrium '+(i+1)+(dd?' (a black cave)':''),x:c[0],z:c[2],y:P.yb,
   r:Math.max(P.wb,(DY(P.yb)-P.db)*.5)+4,h:(dd?Math.min(P.yt,760):P.yt)-P.yb});});
 REGISTER({name:'Trigon — the plinth',x:0,z:0,r:290,h:PL+3});
 if(!dd)REGISTER({name:'Trigon — the pyramidion and beacon',x:0,z:0,r:36,y:YP-4,h:YA-YP+40});
 else{REGISTER({name:'Trigon — the shear',x:0,z:0,r:70,y:CUTLO-4,h:130});
  const vx=Math.cos(34*Math.PI/180),vz=Math.sin(34*Math.PI/180),rv=2*DY(500);
  REGISTER({name:'Trigon — the spalled arris',x:vx*rv,z:vz*rv,r:60,y:SPY0,h:SPY1-SPY0});}

 // ======================================================================= STANDING
 const SS=mkSet();
 emitBody(SS,dd?(p=>p[1]<cutY(p[0],p[2])):(()=>true),0);
 // ---- the pyramidion -------------------------------------------------------------------
 if(!dd){const D=DY(YP),c=CHY(YP),PY=[[0,-S3*D],[0,S3*D],[1,S3*D-c],[2,-(S3*D-c)]];
  const GL=ACC(),T=[0,YA+.5,0];
  const V=PY.map(v=>FP(v[0],D,v[1],YP));
  for(let j=0;j<4;j++){const a=V[j],b=V[(j+1)%4];quad(GL,a,b,T,T,[0,0],[1,0],[.5,1],[.5,1]);}
  mesh(geoOf(GL),MAT.glass,G);
  // the ribs up the three arrises and two rings round it
  for(const v of [V[0],V[1]])beam('tgBox',v,T,1.6,1.6,new THREE.Color(0xe8e2d6));
  beam('tgBox',[(V[2][0]+V[3][0])*.5,YP,(V[2][2]+V[3][2])*.5],T,1.6,1.6,new THREE.Color(0xe8e2d6));
  for(const f of [.33,.62]){const y=YP+(YA-YP)*f;
   for(let j=0;j<4;j++){const a=V[j],b=V[(j+1)%4];
    beam('tgBox',[lerp(a[0],0,f),y,lerp(a[2],0,f)],[lerp(b[0],0,f),y,lerp(b[2],0,f)],1,1,new THREE.Color(0xe8e2d6));}}
  // the observatory inside it, and the beacon
  kput('tgBox',[0,YP+3,0],null,[6,6,6],STONE());
  kput('strip',[0,YP+6.3,0],null,[6,4,34],CYAN);
  kput('strip',[0,YP+6.3,0],qEuler(0,Math.PI/2,0),[6,4,34],CYAN);
  kput('tgBox',[0,YP+30,0],null,[1.2,48,1.2],STONE());
  kput('strip',[0,YA-4,0],null,[2.6,14,14],CYAN);
  kput('finial',[0,YA+2,0],null,[1.4,4,1.4],null);
  for(let j=0;j<10;j++){const a=rng()*TAU,r=rr(4,7);person([Math.cos(a)*r,YP+.2,Math.sin(a)*r]);}}
 // ---- the shear: a cap below every jag, floor plates standing up out of it, rubble --
 if(dd){const y=CUTLO,R=RT(y),D=DY(y),c=CHY(y),h=(2*D+R)/S3;
  quad(SS.guts,FP(0,R,-h,y),FP(0,R,h,y),FP(1,D,S3*D-c,y),FP(2,D,-(S3*D-c),y),[0,0],[4,0],[4,4],[0,4]);
  for(let fy=CUTLO+STY*2;fy<860;fy+=STY*2)for(let x=-80;x<=80;x+=12)for(let z=-80;z<=80;z+=12){
   if(!inside(x,fy,z,4)||fy>cutY(x,z)-2||rng()<.35)continue;
   kput('tgBox',[x,fy,z],qEuler(rr(-.03,.03),0,rr(-.03,.03)),[12.2,.9,12.2],new THREE.Color().setHSL(.08,.08,rr(.34,.46)));}
  for(let j=0;j<160;j++){const x=rr(-70,70),z=rr(-70,70);if(!inside(x,y,z,6))continue;const sz=rr(2,8);
   kput('tgRub',[x,y+sz*.4,z],qEuler(rng()*3,rng()*3,rng()*3),[sz,sz*.6,sz],RUBC());}
  for(let j=0;j<60;j++){const x=rr(-60,60),z=rr(-60,60);if(!inside(x,y,z,8))continue;
   if(rng()<.5)plant([x,y+.3,z],rr(4,9));else kput('moss',[x,y+.4,z],null,[rr(2,5),rr(.6,1.4),rr(2,5)],MOSS());}}
 flush(SS,G);

 // ======================================================================= THE PLINTH
 // A triangle offset 38 m out from the base with its corners cut, 18 m high, so
 // the spike meets the ground on a deliberate podium rather than on its knife
 // edges. Stairs on all three sides, widest on the portal side where the great
 // gate opens straight off the deck.
 const PS=mkSet();
 const RP=RI+38,CP=46,PLH=S3*RP-CP;
 const PV=[];for(let k=0;k<3;k++){PV.push(FP(k,RP,-PLH,0));PV.push(FP(k,RP,PLH,0));}
 for(let j=0;j<6;j++){const a=PV[j],b=PV[(j+1)%6];const L=Math.hypot(b[0]-a[0],b[2]-a[2]),n=Math.max(1,Math.ceil(L/20));
  for(let c=0;c<n;c++){const u0=c/n,u1=(c+1)/n;
   const p0=[lerp(a[0],b[0],u0),0,lerp(a[2],b[2],u0)],p1=[lerp(a[0],b[0],u1),0,lerp(a[2],b[2],u1)];
   quad(PS.stn,p0,p1,[p1[0],PL,p1[2]],[p0[0],PL,p0[2]],[u0*L/TILE,0],[u1*L/TILE,0],[u1*L/TILE,PL/TILE],[u0*L/TILE,PL/TILE]);}
  // cornice and, intact, a light line under it
  const m=[(a[0]+b[0])*.5,PL-.8,(a[2]+b[2])*.5],o=[m[0],0,m[2]];const ln=Math.hypot(o[0],o[2]);
  kput('tgBox',[m[0]+o[0]/ln*.8,PL-.9,m[2]+o[2]/ln*.8],qFacing([o[0]/ln,0,o[2]/ln]),[L,1.8,1.6],STONE());
  if(!dd)kput('strip',[m[0]+o[0]/ln*1.8,PL-2.6,m[2]+o[2]/ln*1.8],qFacing([o[0]/ln,0,o[2]/ln]),[L*.92,6,6],CYAN);}
 // the deck: a fan from the axis
 for(let j=0;j<6;j++){const a=PV[j],b=PV[(j+1)%6];
  quad(PS.pave,[0,PL,0],[0,PL,0],[b[0],PL,b[2]],[a[0],PL,a[2]],[0,0],[0,0],[b[0]/20,b[2]/20],[a[0]/20,a[2]/20]);}
 // stairs
 const STW=[60,110,44];
 for(let k=0;k<3;k++){const W=STW[k],n=Math.round(PL/.36),run=PL/Math.tan(32*Math.PI/180);
  for(let j=0;j<n;j++){const f=(j+.5)/n;
   kput('tgBox',FP(k,RP+run*(1-f),0,PL*f-.18),QF[k],[W,PL/n+.04,run/n+.3],DECK());}
  for(const sg of [-1,1])beam('tgBox',FP(k,RP+run,sg*(W*.5+1.2),1.2),FP(k,RP,sg*(W*.5+1.2),PL+1.2),2.4,2.4,STONE());
  for(let j=0;j<(dd?3:26);j++)person(FP(k,RP+run*rr(0,1),rr(-W*.45,W*.45),0));}
 // the deck itself: paving bands, benches, planters, people
 for(let j=0;j<220;j++){const x=rr(-240,240),z=rr(-240,240);
  let ok=true;for(let k=0;k<3;k++){const dk=NX[k]*x+NZ[k]*z;if(dk>RP-4||dk<RI+3)ok=false;}
  if(!ok)continue;
  const r3=rng();
  if(r3<.28)plant([x,PL,z],dd?rr(8,15):rr(6,11));
  else if(r3<.45)kput('tgBox',[x,PL+.5,z],qEuler(0,rng()*TAU,0),[rr(4,9),1,rr(1.4,2.4)],STONE());
  else if(r3<.52&&dd)kput('moss',[x,PL+.3,z],null,[rr(2,6),rr(.5,1.2),rr(2,6)],MOSS());
  else person([x,PL,z]);}
 // ---- the ground works ----------------------------------------------------------------
 // QA (arcC): the disc was one pale paving map, 860 m of it. Now it is laid out:
 // a paved ring round the plinth, a stone kerb, and beyond it three avenues on
 // the stair axes with lawns between them, each lawn edged by a paved walk.
 const GP=ACC(),GL=ACC(),GK=ACC();
 {const n=180,RB=[120,236,248,262,418,430];
  const onAve=a=>{for(let k=0;k<3;k++){let da=Math.abs(a-PHI[k])%TAU;if(da>Math.PI)da=TAU-da;if(da<(STW[k]*.5+26)/330)return true;}return false;};
  for(let j=0;j<n;j++){const a0=j/n*TAU,a1=(j+1)/n*TAU,am=(a0+a1)*.5,ave=onAve(am);
   for(let r2=0;r2<RB.length-1;r2++){const q0=RB[r2],q1=RB[r2+1];
    const L=r2===1||r2===4?GK:(r2===3&&!ave?GL:GP);
    const P=(a,r)=>[Math.cos(a)*r,L===GK?.62:(L===GL?.55:.48),Math.sin(a)*r];
    const A=P(a0,q0),B=P(a1,q0),C=P(a1,q1),E=P(a0,q1);quad(L,A,B,C,E,[A[0]/30,A[2]/30],[B[0]/30,B[2]/30],[C[0]/30,C[2]/30],[E[0]/30,E[2]/30]);}}}
 mesh(geoOf(GP),dd?MAT.tgPaveR:MAT.tgPave,G);
 mesh(geoOf(GL),dd?MAT.tgLawnR:MAT.tgLawn,G);
 mesh(geoOf(GK),dd?MAT.tgStoneR:MAT.tgStone,G);
 for(let k=0;k<3;k++)for(let r2=300;r2<640;r2+=22)for(const sg of [-1,1]){
  const p=FP(k,r2,sg*44,0);plant(p,dd?rr(9,17):rr(8,13));}
 for(let j=0;j<(dd?40:160);j++){const a=rng()*TAU,r2=rr(280,420);person([Math.cos(a)*r2,.2,Math.sin(a)*r2]);}
 flush(PS,G);

 // ======================================================================= THE RUIN, outside
 let LAND=null;
 if(dd){
  // ---- the fallen apex ------------------------------------------------------------------
  // Laid on its balcony face with the tip pointing away, broken in two at 958 m.
  // Each piece is emitBody() again with the complementary keep() inside a group
  // turned so that face lies on the plain: the break matches the stump cell for
  // cell because it is the same predicate.
  const tilt=new THREE.Vector3(FX*Math.cos(ALPHA),-Math.sin(ALPHA),FZ*Math.cos(ALPHA)).normalize();
  const q1=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),tilt);
  const Nb=new THREE.Vector3(NX[2]*Math.cos(ALPHA),Math.sin(ALPHA),NZ[2]*Math.cos(ALPHA));
  let best=null,bq=null;
  for(let a=0;a<360;a+=.5){const q=new THREE.Quaternion().setFromAxisAngle(tilt,a*Math.PI/180).multiply(q1);
   const v=Nb.clone().applyQuaternion(q).y;if(best===null||v<best){best=v;bq=q;}}
  const pieces=[{keep:p=>p[1]>=cutY(p[0],p[2])&&p[1]<cut2(p[0],p[2]),y0:CUTLO,y1:YB2+12,base:360,twist:0,cap:[860,YB2-10]},
                {keep:p=>p[1]>=cut2(p[0],p[2]),y0:YB2-12,y1:YA,base:360+(YB2-12-CUTLO)+30,twist:.16,cap:[YB2+10,null]}];
  const FS3=mkSet();
  for(const PC of pieces){
   const q=PC.twist?new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),PC.twist).multiply(bq):bq;
   // where the lowest corner of this piece lands: sit it on the plain, 3 m buried
   let lo=1e9;const Ctr=new THREE.Vector3(0,PC.y0,0);
   for(const y of [PC.y0,PC.y1])for(let k=0;k<3;k++){const D=DY(y),v=FP(k,D,S3*D,y);
    const w=new THREE.Vector3(v[0],v[1],v[2]).sub(Ctr).applyQuaternion(q);lo=Math.min(lo,w.y);}
   const T=new THREE.Vector3(FX*PC.base,-lo-3,FZ*PC.base);
   const P=new THREE.Group();P.quaternion.copy(q);
   P.position.copy(T.clone().sub(Ctr.clone().applyQuaternion(q)));G.add(P);
   useGroupXF(P);
   const FS2=mkSet();
   emitBody(FS2,PC.keep,1);
   // the break faces
   for(const cy of PC.cap){if(cy==null)continue;const R=RT(cy),D=DY(cy),c=CHY(cy),h=(2*D+R)/S3;
    quad(FS2.guts,FP(0,R,-h,cy),FP(0,R,h,cy),FP(1,D,S3*D-c,cy),FP(2,D,-(S3*D-c),cy),[0,0],[4,0],[4,4],[0,4]);}
   // the pyramidion's ribs, bent
   if(!PC.cap[1]){const D=DY(YP);for(let k=0;k<3;k++){const v=FP(k,D,S3*D,YP);
     beam('tgBox',v,[v[0]*.4+rr(-6,6),YP+(YA-YP)*.45,v[2]*.4+rr(-6,6)],1.4,1.4,new THREE.Color(0x4e4032));}}
   endGroupXF();
   flush(FS2,P);
   if(!LAND)LAND={x:T.x,z:T.z};
   // QA (arcC): THE CRUSHED SEAM. Where the piece's faces meet the plain the
   // jagged skirt floated or sank by a metre or two; now every face point within
   // a few metres of the ground gets its own fragments piled against it, so the
   // piece is bedded in what it crushed.
   {const Mw=new THREE.Matrix4().compose(P.position,P.quaternion,new THREE.Vector3(1,1,1)),v=new THREE.Vector3();
    for(let y=PC.y0;y<=Math.min(PC.y1,YA-4);y+=5)for(let k=0;k<3;k++){const D=DY(y),hs=S3*D;
     for(let s=-hs;s<=hs;s+=7){if(rng()<.45)continue;const f=FP(k,D,s,y);v.set(f[0],f[1],f[2]).applyMatrix4(Mw);
      if(v.y>9||v.y<-8)continue;const sz=rr(2,8);
      kput('tgRub',[v.x+rr(-5,5),Math.max(0,v.y)*.4+sz*.3,v.z+rr(-5,5)],qEuler(rng()*3,rng()*3,rng()*3),
       [sz*rr(.8,1.5),sz*rr(.5,.9),sz*rr(.8,1.5)],RUBC());}}}
   // and the cladding that burst off it: torn plates of face, ochre and stone,
   // thrown out either side (krShard, 89d-arcube.js)
   for(let j=0;j<9;j++){const a=FALL+rr(-.9,.9)*(j%2?1:-1),r=PC.base+rr(-60,160),w=rr(14,34),l=rr(18,46),th=rr(3,7);
    const SH=krShard({w:w,l:l,t:th,layers:2,brk:[1,1,1,j%3?0:1],bite:.25,tile:TILE,seg:8});
    const qS=qEuler(rr(-.25,.25),rng()*TAU,rr(-.25,.25)),x=Math.cos(a)*r,z=Math.sin(a)*r;
    const M=new THREE.Matrix4().compose(new THREE.Vector3(x,-SH.low(qS)-th*.3,z),qS,new THREE.Vector3(1,1,1));
    const SK=j%3===0?FS3.por:FS3.bal;
    for(const [g,L] of [[SH.top,SK],[SH.side,FS3.stn],[SH.bot,FS3.shd],[SH.brk,FS3.guts]]){if(!g)continue;
     g.applyMatrix4(M);const pa=g.attributes.position,ua=g.attributes.uv;
     for(let i=0;i<pa.count;i+=3){const P3=[0,1,2].map(o=>[pa.getX(i+o),pa.getY(i+o),pa.getZ(i+o)]),U3=[0,1,2].map(o=>[ua.getX(i+o),ua.getY(i+o)]);
      quad(L,P3[0],P3[1],P3[2],P3[2],U3[0],U3[1],U3[2],U3[2]);}}
    tgRub(x,z,Math.max(w,l)*.35,Math.max(w,l)*.8,22,4);}
   }
  flush(FS3,G);
  // ---- debris: the trail it tore, the fan it threw ---------------------------------------
  const LX=FX*520,LZ=FZ*520;
  tgRub(LX,LZ,110,380,380,8);
  for(let j=0;j<260;j++){const f=rng(),r2=lerp(150,620,f),a=FALL+rr(-.35,.35)*(1-f*.5),sz=rr(1,6);
   kput('tgRub',[Math.cos(a)*r2,sz*.35,Math.sin(a)*r2],qEuler(rng()*3,rng()*3,rng()*3),[sz,sz*.6,sz],
    RUBC());}
  for(let j=0;j<45;j++){const r2=rr(200,600),a=FALL+rr(-.5,.5),sz=rr(4,13);
   kput('tgBox',[Math.cos(a)*r2,sz*.25,Math.sin(a)*r2],qEuler(rr(-.5,.5),rng()*TAU,rr(-.5,.5)),[sz,sz*.5,sz*rr(.6,1.2)],
    rng()<.5?OCHRE():STONE());}
  // ---- the spall's cascade: down the arris, onto the plinth, onto the plain -------------
  {const V=34*Math.PI/180,vx=Math.cos(V),vz=Math.sin(V);
   for(let j=0;j<420;j++){const y=Math.pow(rng(),1.5)*SPY0,rv=2*DY(y)+rr(-8,4)+(y<30?rr(0,90):0),sz=rr(1.5,8);
    const a=V+rr(-.12,.12);
    kput('tgRub',[Math.cos(a)*rv,Math.max(y,PL*(rv<2*RP?1:0))+sz*.35,Math.sin(a)*rv],qEuler(rng()*3,rng()*3,rng()*3),
     [sz,sz*.6,sz],RUBC());}
   tgRub(vx*300,vz*300,10,170,220,6);}
  tgRub(0,0,270,470,300,5);
  scatterMoss(0,PL,0,120,280,160,5);
  trees(0,0,300,700,110);}
 else trees(0,0,580,900,70);

 // ---- what the presets are derived from ------------------------------------------------
 TG_SITE[d]={x:gx,z:gz,d:d,dd:dd,RI:RI,PL:PL,YA:YA,YP:YP,HP:HP,NT:NT,TH:TH,RP:RP,
  PHI:PHI.slice(),SPY0:SPY0,SPY1:SPY1,CUT:792,CUTLO:CUTLO,FALL:FALL,LAND:LAND,
  PORT:PORT.map(P=>({yb:P.yb,yt:P.yt,wb:P.wb,db:P.db})),
  DY:y=>DY(y),FP:(k,r,s,y)=>{const p=FP(k,r,s,y);return[gx+p[0],p[1],gz+p[2]];}};
 KOFF=[0,0,0];return G;}
