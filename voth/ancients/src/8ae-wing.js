// ================================================================= THE WING — a monument that is also a city
// First of the memorial group. One figure against the sky: a coffered DRUM held
// in a yoke on ONE pedestal, and two wings of stacked horizontal slabs lifting
// out of it, far past anything that holds them up. Raw board-formed concrete,
// greyer and heavier than the white Ancient stone; the one fine texture is the
// face of the drum.
//
//   THE DRUM       284 m across, its axis north-south, both faces a shallow lens
//                  covered in recessed, stepped coffers laid on a DOUBLE
//                  logarithmic spiral (56 arms each way, conformal diamonds that
//                  shrink from 15 m at the rim to 2 m at a 19 m oculus). Two
//                  spiral families of equal count keep the face mirror-symmetric
//                  about the one vertical plane, which a single spiral would not.
//                  The coffer backs are glazed: 1 848 lanterns a face.
//   THE YOKE       the lever. It sits on the pedestal, wraps the lower half of
//                  the drum, springs out on two deep concave haunches and rises
//                  on a curved back to the top slab. The drum's upper 70 m stand
//                  clear of its saddle.
//   THE SLABS      five a side, 28.8 m (eight storeys) thick with 18 m (five
//                  storey) gaps, 100 m deep tapering to 68, and in ECHELON: each
//                  starts 55 m further out and ends 55 m further out than the one
//                  below, so the wing's end leans out like a raised hand and each
//                  slab cantilevers 170 m past its root. The soffits taper up 10 m
//                  toward the tips. The slabs are the dwelling decks — ribbon
//                  windows and balconies on the faces, houses, trees, hedges and
//                  lit soffits in the gaps; the gaps are where the light gets in,
//                  and they carry on across the yoke as recessed shadow bands.
//   THE PLINTH     three 10.8 m tiers of shops and dwellings, stretched octagons
//                  900 x 500 m, with grand stairs north and south.
//
// 468 m to the top slab, 1 380 m tip to tip. Strictly bilateral about x = 0.
//
// RUINED: the east wing has broken off at the root — a jagged stump beside the
// drum, floors hanging out of it — and lies in three pieces on the plain to the
// east, on their backs. The west wing sags, its outer slabs pancaked onto one
// another and stripped to their floors, two tips snapped off onto the ground
// beneath. Coffers have fallen out of the spiral in clusters (worst on the
// east), exposing the drum's gutted interior; the concrete is weathered darker
// and streaked, windows dead, holes punched through the yoke, and the gaps are
// full of trees and hanging vines.
//
// The sun in this kit is WSW and high, so the south face of the drum is lit and
// the hero stands south-south-east of it.
function wgWallTex(kind,dec){
 // kind 0 the slab ribbon: every 3.6 m storey a continuous window band
 // kind 1 the yoke mass: loophole windows, staggered storey by storey
 // One 512 px tile is 28.8 m: eight storeys of 64 px, form boards of 11 px.
 return canvasTex(512,512,(g,w,h)=>{const id=g.createImageData(w,h),D=id.data;
  for(let y=0;y<h;y++){const st=Math.floor(y/64),sy=y%64,bd=Math.floor(y/11);
   for(let x=0;x<w;x++){const i=(y*w+x)*4;
    const n1=fbm(x/46,y/46,5.3+kind,2)-.5,n2=h3(x,y,2.2+kind)-.5;
    const bt=(h3(bd*1.37,Math.floor((x+bd*53)/150),8.8+kind)-.5)*16;
    let v=150+n1*26+n2*9+bt;
    if(y%11===0)v-=15;                         // board joints
    if(x%34===17&&y%22===6)v-=46;              // form-tie holes
    let r=v+5,gg=v+2,b=v-3,win=0;
    if(kind===0){
     if(sy<5){r+=18;gg+=18;b+=16;}                                   // slab edge
     else if(sy>=8&&sy<38){const cr=h3(Math.floor(x/64)*3.1,st*7.7,4.1);
      if(x%32<3){r=92;gg=90;b=86;}                                    // mullion
      else{win=1;const f=(sy-8)/30;
       if(!dec&&cr<.3){const k=.72+cr*.9;r=236*k;gg=176*k;b=104*k;}
       else{r=34+f*24;gg=40+f*24;b=50+f*22;}}}
     else if(sy>=38&&sy<41){r-=30;gg-=30;b-=30;}}                    // shadow line
    else{
     const ox=(st%2)*32,lx=(x+ox)%64;
     if(lx>=22&&lx<42&&sy>=16&&sy<46){const cr=h3(Math.floor((x+ox)/64)*2.3+.7,st*5.9,6.2);
      win=1;
      if(lx<25||sy<19){r=40;gg=38;b=36;}                              // reveal
      else if(!dec&&cr<.26){const k=.7+cr*1.1;r=232*k;gg=168*k;b=98*k;}
      else{r=30;gg=33;b=38;}}
     if(sy===0){r-=12;gg-=12;b-=12;}}                                // lift joint
    if(dec){const sk=(fbm(x/6,y/110,9.62+kind,2)-.5)*54;
     if(win){r=12+h3(x>>4,y>>4,3.3)*16;gg=r-1;b=r-3;}
     else{r=r*.52+16+sk;gg=gg*.52+15+sk*.95;b=b*.5+13+sk*.9;}}
    D[i]=clamp(r,0,255);D[i+1]=clamp(gg,0,255);D[i+2]=clamp(b,0,255);D[i+3]=255;}}
  g.putImageData(id,0,0);});}
// The emissive mask: the same lottery as the albedo, so the lit cells coincide.
function wgLitTex(kind){return canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),D=id.data;
 for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){const i=(yy*w+xx)*4,x=xx*2,y=yy*2,st=Math.floor(y/64),sy=y%64;let a=0;
  if(kind===0){if(sy>=8&&sy<38&&x%32>=3){const cr=h3(Math.floor(x/64)*3.1,st*7.7,4.1);if(cr<.3)a=.55+cr*1.2;}}
  else{const ox=(st%2)*32,lx=(x+ox)%64;
   if(lx>=25&&lx<42&&sy>=19&&sy<46){const cr=h3(Math.floor((x+ox)/64)*2.3+.7,st*5.9,6.2);if(cr<.26)a=.55+cr*1.4;}}
  D[i]=250*a;D[i+1]=172*a;D[i+2]=96*a;D[i+3]=255;}
 g.putImageData(id,0,0);});}
TEX.wgRib=wgWallTex(0,0);TEX.wgRibR=wgWallTex(0,1);TEX.wgRibE=wgLitTex(0);
TEX.wgMass=wgWallTex(1,0);TEX.wgMassR=wgWallTex(1,1);TEX.wgMassE=wgLitTex(1);
// A coffer's back: a 3 x 3 lantern of glazing in a concrete frame, UV 0..1 per
// coffer, so the panes scale with the coffer down the spiral.
TEX.wgLant=canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),D=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const n=fbm(x/20,y/20,7.1,2)-.5;
  const fr=x<22||x>=234||y<22||y>=234,mu=(x>=90&&x<98)||(x>=158&&x<166)||(y>=90&&y<98)||(y>=158&&y<166);
  let r,gg,b;
  if(fr||mu){const v=176+n*30;r=v+4;gg=v+1;b=v-4;}
  else{const f=((x+y)%72)/72;r=34+f*20+n*10;gg=40+f*22+n*10;b=50+f*24+n*10;}
  D[i]=clamp(r,0,255);D[i+1]=clamp(gg,0,255);D[i+2]=clamp(b,0,255);D[i+3]=255;}
 g.putImageData(id,0,0);});
TEX.wgLantE=canvasTex(128,128,(g,w,h)=>{const id=g.createImageData(w,h),D=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,X=x*2,Y=y*2;
  const fr=X<22||X>=234||Y<22||Y>=234,mu=(X>=90&&X<98)||(X>=158&&X<166)||(Y>=90&&Y<98)||(Y>=158&&Y<166);
  const a=fr||mu?0:.9;D[i]=246*a;D[i+1]=178*a;D[i+2]=104*a;D[i+3]=255;}
 g.putImageData(id,0,0);});
// The houses on the decks: two storeys, three windows a floor, on every face.
TEX.wgHut=canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),D=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const n=fbm(x/18,y/18,3.7,2)-.5;
  const fl=Math.floor(y/128),fy=y%128,cx=Math.floor(x/85),fx=x%85;
  let v=196+n*26,r=v+4,gg=v,b=v-6;
  if(fx>14&&fx<70&&fy>28&&fy<100){const f=(fy-28)/72;r=36+f*26;gg=42+f*26;b=52+f*24;}
  if(fy<6){r-=40;gg-=40;b-=40;}
  D[i]=clamp(r,0,255);D[i+1]=clamp(gg,0,255);D[i+2]=clamp(b,0,255);D[i+3]=255;}
 g.putImageData(id,0,0);});
TEX.wgHutE=canvasTex(128,128,(g,w,h)=>{const id=g.createImageData(w,h),D=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,X=x*2,Y=y*2;
  const fl=Math.floor(Y/128),fy=Y%128,cx=Math.floor(X/85),fx=X%85;
  const a=fx>14&&fx<70&&fy>28&&fy<100&&h3(cx,fl,5.5)<.55?.8:0;D[i]=246*a;D[i+1]=180*a;D[i+2]=108*a;D[i+3]=255;}
 g.putImageData(id,0,0);});
// What a broken slab shows: a floor plate every storey (32 px of 256 at 28.8 m),
// dark rooms between, the column grid, and rust bleeding down.
TEX.wgGuts=canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),D=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const by=y%32,n=fbm(x/9,y/60,5.9,2)-.5;
  let v=24+n*16;
  if(by<5)v=108+n*40;else if(by<8)v=12;
  if(x%64<5&&by>=5)v=Math.max(v,62+n*20);
  D[i]=clamp(v+8,0,255);D[i+1]=clamp(v+2,0,255);D[i+2]=clamp(v-5,0,255);D[i+3]=255;}
 g.putImageData(id,0,0);});
TEX.wgLawn=canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),D=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const n=fbm(x/14,y/14,8.4,3)-.5,n2=h3(x,y,1.9)-.5;
  D[i]=clamp(76+n*50+n2*18,0,255);D[i+1]=clamp(108+n*44+n2*20,0,255);D[i+2]=clamp(54+n*26,0,255);D[i+3]=255;}
 g.putImageData(id,0,0);});
// Every surface the builder lays itself carries per-vertex colour, which is how
// the deep gaps get their ambient occlusion (SHADE IS PAINTED — there are no
// shadow maps here) and how the coffer walls darken toward the lanterns.
function WGM(o){return new THREE.MeshStandardMaterial(Object.assign({roughnessMap:TEX.concreteRM,roughness:1,metalness:0,side:DS,vertexColors:true},o));}
MAT.wgRib  =WGM({map:TEX.wgRib,color:0x7f7b76,emissive:0xffffff,emissiveMap:TEX.wgRibE,emissiveIntensity:.8});
MAT.wgRibR =WGM({map:TEX.wgRibR,color:0x9a9288});
MAT.wgMass =WGM({map:TEX.wgMass,color:0x7a7671,emissive:0xffffff,emissiveMap:TEX.wgMassE,emissiveIntensity:.8});
MAT.wgMassR=WGM({map:TEX.wgMassR,color:0x968e84});
MAT.wgConc =WGM({map:TEX.concrete,color:0x7e7a73});
MAT.wgConcR=WGM({map:TEX.concrete,color:0x57524c});
MAT.wgLens =WGM({map:TEX.concrete,color:0xd8d1c4});
MAT.wgLensR=WGM({map:TEX.concrete,color:0x7f786d});
MAT.wgWall =WGM({map:TEX.concrete,color:0x7a746c});
MAT.wgWallR=WGM({map:TEX.concrete,color:0x57524c});
// Soffits are lit almost entirely by the hemisphere's brown ground colour, so
// no albedo brings them back as grey concrete: at best they are brown.
// QA (arcC): BOUNCE LIGHT IS PAINTED, as on the Ledge. The soffit carries a
// little emissive through its own concrete map, multiplied by the vertex colour
// (wgBounce) so the gaps' painted occlusion still darkens it toward the back,
// and ldNightDim() (89i-ledge.js) pulls it down at night, which is what made the
// first emissive attempt glow white after dark.
function wgBounce(m){m.onBeforeCompile=sh=>{sh.fragmentShader=sh.fragmentShader.replace('#include <emissivemap_fragment>',
 '#include <emissivemap_fragment>\n#ifdef USE_COLOR\n totalEmissiveRadiance*=vColor;\n#endif');};return m;}
MAT.wgSoff =wgBounce(WGM({map:TEX.concrete,color:0x8c8c89,emissive:0x77746e,emissiveMap:TEX.concrete,roughnessMap:null}));
MAT.wgSoffR=wgBounce(WGM({map:TEX.concrete,color:0x5e5c58,emissive:0x45423e,emissiveMap:TEX.concrete,roughnessMap:null}));
MAT.wgDeck =WGM({map:TEX.concrete,color:0x57524b});
MAT.wgDeckR=WGM({map:TEX.concrete,color:0x524d46});
MAT.wgLawn =WGM({map:TEX.wgLawn});
MAT.wgLawnR=WGM({map:TEX.wgLawn,color:0x8e8c66});
MAT.wgGuts =WGM({map:TEX.wgGuts});
MAT.wgLantL=WGM({map:TEX.wgLant,emissive:0xffffff,emissiveMap:TEX.wgLantE,emissiveIntensity:.95});
MAT.wgLantD=WGM({map:TEX.wgLant});
MAT.wgHall =WGM({map:TEX.wgLant,color:0xe8dccb,emissive:0xffffff,emissiveMap:TEX.wgLantE,emissiveIntensity:1.5});
MAT.wgVoid =WGM({color:0x08090a,roughnessMap:null});
MAT.wgKit  =new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0xffffff,roughness:1,metalness:0,side:DS});
MAT.wgHutM =new THREE.MeshStandardMaterial({map:TEX.wgHut,roughnessMap:TEX.concreteRM,emissive:0xffffff,emissiveMap:TEX.wgHutE,emissiveIntensity:.85,roughness:1,metalness:0,side:DS});
MAT.wgHutR =new THREE.MeshStandardMaterial({map:TEX.wgHut,roughnessMap:TEX.concreteRM,color:0x6c665e,roughness:1,metalness:0,side:DS});
MAT.wgRubble=new THREE.MeshStandardMaterial({color:0xffffff,roughness:1,metalness:0,flatShading:true});
MAT.wgDimK =new THREE.MeshStandardMaterial({color:0x0a0b0c,roughness:1,metalness:0,side:DS});
// A quad soup: each quad its own four vertices, so the facets stay flat.
function wgQuadGeo(Q){const pos=[],uv=[],idx=[];let o=0;
 for(const t of Q){pos.push(...t);uv.push(0,0,1,0,1,1,0,1);idx.push(o,o+1,o+2,o,o+2,o+3);o+=4;}
 const g=new THREE.BufferGeometry();
 g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
 g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 g.setIndex(idx);g.computeVertexNormals();return g;}
kdef('wgBox',new THREE.BoxGeometry(1,1,1),MAT.wgKit);
kdef('wgDim',new THREE.BoxGeometry(1,1,1),MAT.wgDimK);
// The houses keep their windows off the roof: the top and bottom faces sample a
// wall pixel instead of the whole texture.
{const hb=()=>{const g=new THREE.BoxGeometry(1,1,1),u=g.attributes.uv;for(let v=8;v<16;v++)u.setXY(v,.02,.99);return g;};
 kdef('wgHut',hb(),MAT.wgHutM);kdef('wgHutR',hb(),MAT.wgHutR);}
// A balcony in the qFacing cell (+z out of the wall, +x along it, +y up): deck,
// soffit, front and two ends. 10 quads' worth of 12 triangles is the budget.
kdef('wgBalc',wgQuadGeo([
  [-.5,0,0, .5,0,0, .5,0,1, -.5,0,1],
  [-.5,-.3,0, -.5,-.3,1, .5,-.3,1, .5,-.3,0],
  [-.5,-.3,1, .5,-.3,1, .5,1,1, -.5,1,1],
  [-.5,-.3,0, -.5,-.3,1, -.5,1,1, -.5,1,0],
  [ .5,-.3,0, .5,1,0, .5,1,1, .5,-.3,1]]),MAT.wgKit);
kdef('wgRub',new THREE.DodecahedronGeometry(1,0),MAT.wgRubble);
// The presets are DERIVED from this (targets/wing/91z-views.js runs after the scene).
const WG_SITE={};

function buildWing(scene,gx,gz,d){reseed(9620+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0;

 // ---- the numbers ---------------------------------------------------------------
 const TILE=28.8,CW=12;                         // window tile (8 storeys), column width
 const TH=10.8,PL=3*TH;                          // plinth tiers, plinth top 32.4
 const PX=100,PZ=66,PY=100;                      // the pedestal: half-extents, top
 const R=142,YC=PY+R,RC=130,ZR=55,BUL=30;        // drum radius, centre, coffer field, rim face, lens bulge
 const NL=56,KR=34,AL=TAU/NL;                    // spiral arms each way, rings to the oculus
 const Y0=252,SP=46.8,TS=28.8,GP=18,K=5;          // slab 0 soffit, pitch, slab, gap, count
 const YS=k=>Y0+k*SP,YT=k=>YS(k)+TS,YTOP=YT(K-1);   // 468
 const XR=k=>300+55*k,XT=k=>470+55*k,XG=k=>XR(k)-20,TAP=10;
 const U0=290,XU=400;                            // the back of the yoke: saddle, top
 const Uc=x=>x>=XU?YTOP:U0+(YTOP-U0)*Math.pow(Math.max(0,x)/XU,1.7);
 const Uinv=y=>y<=U0?0:y>=YTOP?XU:XU*Math.pow((y-U0)/(YTOP-U0),1/1.7);
 const HX0=96,HX1=XR(0);                         // the haunch: pedestal corner to slab 0 root
 const Linv=y=>{const f=clamp((y-PY)/(Y0-PY),0,1);return HX0+(HX1-HX0)*(1-Math.sqrt(1-f));};
 const W=x=>{const a=Math.abs(x);return a<=160?50:50-16*Math.min(1,(a-160)/540);};
 const ybot=(k,x)=>x<=XR(k)?YS(k):YS(k)+TAP*Math.pow(Math.min(1,(x-XR(k))/(XT(k)-XR(k))),1.3);
 const zL=r=>ZR+BUL*(1-(r/R)*(r/R));
 const inDrum=(x,y)=>x*x+(y-YC)*(y-YC)<(R-2)*(R-2);
 const sm=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
 const gapAO=(k,x,z)=>1-.64*sm(0,34,Math.min(W(x)-Math.abs(z),XT(k)-x));

 // ---- the ruin's numbers -----------------------------------------------------------
 // east: broken off at the root; the break leans in as it rises
 // QA (arcC): each break is STAGGERED slab by slab — a slab lets go at its own
 // x, stepping in and out by up to 20-36 m from its neighbours, the step made
 // in the gap between them — so the stump and every fallen piece end in a
 // ragged row of slab ends instead of one clean cut through the stack. The
 // stump and the pieces still share the predicate, so the breaks still match.
 const SLK=y=>Math.max(-1,Math.min(K-1,Math.floor((y-Y0+GP*.5)/SP)));
 const stag=(y,s,a)=>a*(h3(SLK(y)+2,s,9629)-.5)*2;
 const cutE=y=>190-.12*(y-PY)+12*(fbm(y*.035,.7,9626,2)-.5)*2+(y>Y0-GP*.5?stag(y,1.3,20):0);
 const cutAB=y=>405+14*(fbm(y*.04,2.2,9627,2)-.5)*2+stag(y,2.7,36);
 const cutBC=y=>585+12*(fbm(y*.04,4.4,9628,2)-.5)*2+stag(y,5.1,26);
 // west: the outer slabs pancaked and the whole wing sagging
 const SAG0=430,SAG1=720,SAGT=44;
 const pan=ax=>sm(470,640,ax)*.9;
 const gapsBelow=y=>{let n=0;for(let k=0;k<K-1;k++){const g0=YT(k),g1=YS(k+1);
  if(y>=g1)n+=1;else if(y>g0)n+=(y-g0)/(g1-g0);}return n;};
 const MAPW=p=>{const ax=Math.abs(p[0]);if(ax<=SAG0)return p;
  const f=(ax-SAG0)/(SAG1-SAG0),s=pan(ax);
  return[p[0],p[1]-GP*s*gapsBelow(p[1])-SAGT*f*f,p[2]+(p[1]-Y0)*.05*s];};
 const BRK={2:50,4:80};                     // west slab tips snapped off
 const hf=holeFn(d*.62,9625,null,1.3);
 // the pancaked end of the west wing has lost most of its skin: crushed floors show
 const HOLE=(sx,zs,x,y)=>!!hf&&!inDrum(x,y)&&(hf(sx*x/216+(zs>0?0:3.3),y)||
  (sx<0&&y>Y0&&h3(Math.floor(x/12),Math.floor(y/7),zs+4.4)<1.4*pan(x)));

 // ---- palette ------------------------------------------------------------------------
 const CONC=()=>new THREE.Color().setHSL(rr(.07,.10),rr(.03,.07),dd?rr(.16,.22):rr(.46,.54));
 const PALE=()=>new THREE.Color().setHSL(rr(.08,.10),rr(.05,.10),dd?rr(.18,.24):rr(.66,.74));
 const LEAF=()=>new THREE.Color().setHSL(rr(.18,.32),rr(.22,.45),dd?rr(.16,.28):rr(.24,.34));
 const MOSS=()=>new THREE.Color().setHSL(rr(.20,.30),rr(.3,.5),rr(.06,.14));
 const RUBC=()=>new THREE.Color().setHSL(rr(.06,.09),rr(.04,.12),rr(.05,.10));
 const WARMC=new THREE.Color(0xffb866);
 let MAPF=null;                                  // design -> placed (the sagging wing)
 const KP=(n,p,q,s,c)=>kput(n,MAPF?MAPF(p):p,q,s,c);
 const person=p=>{if(dd)return;
  KP('figB',p,qEuler(0,rng()*TAU,0),1,new THREE.Color().setHSL(rr(0,.1),rr(.2,.5),rr(.25,.5)));
  KP('figH',p,null,1,new THREE.Color(0xc9a17e));};
 const plant=(p,h)=>{KP('trunk',p,qEuler(rr(-.05,.05),rng()*TAU,rr(-.05,.05)),[h*.16,h*.74,h*.16],
   new THREE.Color().setHSL(rr(.05,.10),rr(.2,.4),rr(.14,.28)));
  const s0=h*rr(.28,.40);
  KP('leafCard',[p[0]+rr(-.08,.08)*h,p[1]+h*.72,p[2]+rr(-.08,.08)*h],
   qEuler(rr(-.07,.07),rng()*TAU,rr(-.07,.07)),[s0,s0*rr(.7,1.05),s0],LEAF());};
 const rub=(cx,cz,r0,r1,n,sM,yf)=>{for(let j=0;j<n;j++){const a=rng()*TAU,u=Math.pow(rng(),1.8),r=r0+(r1-r0)*u,sz=rr(.8,sM)*(1.2-.6*u);
  const x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r;
  kput('wgRub',[x,(yf?yf(x,z):0)+sz*.3,z],qEuler(rng()*3,rng()*3,rng()*3),[sz*rr(.8,1.4),sz*rr(.4,.8),sz*rr(.8,1.4)],RUBC());}};

 // ---- geometry accumulators ------------------------------------------------------
 const KEYS=['rib','mass','conc','lens','wall','soff','deck','lawn','guts','lantL','lantD','hall','void'];
 const MATS=dd?{rib:MAT.wgRibR,mass:MAT.wgMassR,conc:MAT.wgConcR,lens:MAT.wgLensR,wall:MAT.wgWallR,soff:MAT.wgSoffR,
   deck:MAT.wgDeckR,lawn:MAT.wgLawnR,guts:MAT.wgGuts,lantL:MAT.wgLantD,lantD:MAT.wgLantD,hall:MAT.wgGuts,void:MAT.wgVoid}
  :{rib:MAT.wgRib,mass:MAT.wgMass,conc:MAT.wgConc,lens:MAT.wgLens,wall:MAT.wgWall,soff:MAT.wgSoff,
   deck:MAT.wgDeck,lawn:MAT.wgLawn,guts:MAT.wgGuts,lantL:MAT.wgLantL,lantD:MAT.wgLantD,hall:MAT.wgHall,void:MAT.wgVoid};
 const TL={rib:TILE,mass:TILE,guts:TILE,lawn:20};
 const mkSet=()=>{const S={};for(const k of KEYS)S[k]={P:[],U:[],C:[],I:[],n:0};return S;};
 // mode 0 (x,y)  1 (z,y)  2 (x,z)  or an explicit [u0,v0,..u3,v3]
 const Q=(S,key,a,b,c,e,mode,ca,cb,cc,ce)=>{const A=S[key],t=TL[key]||8,pts=[a,b,c,e],cs=[ca,cb,cc,ce];
  for(let m=0;m<4;m++){const p=pts[m],w=MAPF?MAPF(p):p;A.P.push(w[0],w[1],w[2]);
   if(Array.isArray(mode))A.U.push(mode[m*2],mode[m*2+1]);
   else if(mode===0)A.U.push(p[0]/t,p[1]/t);else if(mode===1)A.U.push(p[2]/t,p[1]/t);else A.U.push(p[0]/t,p[2]/t);
   const c=cs[m]==null?1:cs[m];A.C.push(c,c,c);}
  A.I.push(A.n,A.n+1,A.n+2,A.n,A.n+2,A.n+3);A.n+=4;};
 const T3=(S,key,a,b,c,mode,ca,cb,cc)=>Q(S,key,a,b,c,c,Array.isArray(mode)?mode.slice(0,6).concat(mode.slice(4,6)):mode,ca,cb,cc,cc);
 const flush=(S,par)=>{for(const k of KEYS){const A=S[k];if(!A.n)continue;const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(A.P,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(A.U,2));
  g.setAttribute('color',new THREE.Float32BufferAttribute(A.C,3));
  g.setIndex(A.I);g.computeVertexNormals();const o=mesh(g,MATS[k],par);if(k==='soff')ldNightDim(o,MATS[k]);}};

 // ---- the rows ---------------------------------------------------------------------
 // A half-wing is a stack of horizontal rows. Each row spans x from the back of
 // the yoke (Uinv) to its outer edge: the haunch, a slab's tip, or a gap's back
 // wall. One row list serves the front and back faces, the edges, the ruin's
 // caps and the fallen pieces, so every break matches cell for cell.
 const RWS=[];
 {const NH=16,yH=s=>PY+(Y0-PY)*(1-(1-s)*(1-s));
  for(let j=0;j<NH;j++)RWS.push({t:'h',y0:yH(j/NH),y1:yH((j+1)/NH)});
  for(let k=0;k<K;k++){
   for(const f of [[0,.25],[.25,.5],[.5,.75],[.75,1]])RWS.push({t:'s',k,f0:f[0],f1:f[1],y0:lerp(YS(k),YT(k),f[0]),y1:lerp(YS(k),YT(k),f[1])});
   if(k<K-1){const g0=YT(k),g1=YS(k+1);let fs=[0,1/3,2/3,1];
    if(U0>g0&&U0<g1){const u=(U0-g0)/(g1-g0);fs=[0,u,(1+2*u)/3,(2+u)/3,1];}
    for(let j=0;j<fs.length-1;j++)RWS.push({t:'g',k,y0:lerp(g0,g1,fs[j]),y1:lerp(g0,g1,fs[j+1])});}}}
 const XB=(rw,y)=>rw.t==='h'?Linv(y):rw.t==='s'?XT(rw.k):XG(rw.k);
 const NOCLIP={lo:()=>0,hi:()=>1e9};
 // solid in the design section? (for rim hiding and placement)
 const inYoke=(x,y)=>y>=PY-1&&y<=Uc(Math.abs(x))-1;

 // ================================================================ THE HALF-WING
 const emitHalf=(S,sx,C)=>{const X=x=>sx*x;
  for(const rw of RWS){const ya=rw.y0,yb=rw.y1;
   const nb0=XB(rw,ya),nb1=XB(rw,yb),na0=Uinv(ya),na1=Uinv(yb);
   const l0=C.lo(ya,rw),l1=C.lo(yb,rw),h0=C.hi(ya,rw),h1=C.hi(yb,rw);
   let a0=Math.max(na0,l0),a1=Math.max(na1,l1),b0=Math.min(nb0,h0),b1=Math.min(nb1,h1);
   if(b0-a0<.3&&b1-a1<.3)continue;
   if(b0<a0)b0=a0;if(b1<a1)b1=a1;
   const yA=(x,top)=>rw.t==='s'?lerp(ybot(rw.k,x),YT(rw.k),top?rw.f1:rw.f0):(top?yb:ya);
   const key=rw.t==='s'?'rib':'mass';
   const n=Math.max(1,Math.ceil(Math.max(b0-a0,b1-a1)/CW));
   for(let i=0;i<n;i++){
    const p0=lerp(a0,b0,i/n),p1=lerp(a0,b0,(i+1)/n),q0=lerp(a1,b1,i/n),q1=lerp(a1,b1,(i+1)/n);
    if(inDrum(p0,ya)&&inDrum(p1,ya)&&inDrum(q0,yb)&&inDrum(q1,yb))continue;
    const xm=(p0+p1+q0+q1)*.25,ym=(ya+yb)*.5;
    // a gap carries on across the yoke as a recessed shadow band, so the
    // whole wing reads as its stack of slabs right into the drum
    const rc=rw.t==='g'?5:0,sh=rw.t==='g'?.5:1,WZ=x=>W(x)-rc;
    for(const zs of [1,-1]){
     const A=[X(p0),yA(p0,0),zs*WZ(p0)],B=[X(p1),yA(p1,0),zs*WZ(p1)],Cc=[X(q1),yA(q1,1),zs*WZ(q1)],E=[X(q0),yA(q0,1),zs*WZ(q0)];
     if(rc){const top=rw.y1>=YS(rw.k+1)-.01,bot=rw.y0<=YT(rw.k)+.01;
      if(bot)Q(S,'mass',A,B,[B[0],B[1],zs*W(p1)],[A[0],A[1],zs*W(p0)],2,sh,sh,.8,.8);
      if(top)Q(S,'mass',E,Cc,[Cc[0],Cc[1],zs*W(q1)],[E[0],E[1],zs*W(q0)],2,sh,sh,.8,.8);}
     if(dd&&HOLE(sx,zs,xm,ym)){const I=p=>[p[0],p[1],p[2]-zs*5];
      Q(S,'guts',I(A),I(B),I(Cc),I(E),0);
      Q(S,'guts',A,B,I(B),I(A),0,.5,.5,.3,.3);Q(S,'guts',B,Cc,I(Cc),I(B),1,.5,.5,.3,.3);
      Q(S,'guts',Cc,E,I(E),I(Cc),0,.5,.5,.3,.3);Q(S,'guts',E,A,I(A),I(E),1,.5,.5,.3,.3);continue;}
     Q(S,key,A,B,Cc,E,0,sh,sh,sh,sh);}}
   // ---- the outer edge: the haunch soffit, a slab's tip, a gap's back wall, or a break
   const cut=h0<nb0-.01||h1<nb1-.01;
   {const A=[X(b0),yA(b0,0),W(b0)],B=[X(b0),yA(b0,0),-W(b0)],Cc=[X(b1),yA(b1,1),-W(b1)],E=[X(b1),yA(b1,1),W(b1)];
    if(cut)Q(S,'guts',A,B,Cc,E,1);
    else if(rw.t==='h')Q(S,'soff',A,B,Cc,E,2,.8,.8,.8,.8);
    else if(rw.t==='s')Q(S,'rib',A,B,Cc,E,1);
    else{const M0=[X(b0),ya,0],M1=[X(b1),yb,0];
     Q(S,'rib',A,M0,M1,E,1,.62,.26,.26,.62);Q(S,'rib',M0,B,Cc,M1,1,.26,.62,.62,.26);}}
   // ---- the inner edge: the back of the lever, or a break
   const cutA=l0>na0+.01||l1>na1+.01;
   if(cutA){Q(S,'guts',[X(a0),yA(a0,0),W(a0)],[X(a0),yA(a0,0),-W(a0)],[X(a1),yA(a1,1),-W(a1)],[X(a1),yA(a1,1),W(a1)],1);}
   else if((na0>0||na1>0)&&!(inDrum(a0,ya)&&inDrum(a1,yb))){
    const zz=[-1,-12,12,1],ks=['lawn','deck','lawn'];
    const zv=(x,j)=>j===0?-W(x):j===3?W(x):zz[j];
    for(let j=0;j<3;j++)Q(S,ks[j],[X(a0),ya,zv(a0,j)],[X(a0),ya,zv(a0,j+1)],[X(a1),yb,zv(a1,j+1)],[X(a1),yb,zv(a1,j)],2);}}
  // ---- the horizontal faces between the bands ----------------------------------------
  const strip=(key,a,b,yf,ao)=>{if(b-a<.5)return;const n=Math.max(1,Math.ceil((b-a)/CW));
   for(let i=0;i<n;i++){const x0=lerp(a,b,i/n),x1=lerp(a,b,(i+1)/n);
    const zc=[-1,0,1];
    for(let j=0;j<2;j++){const P=(x,f)=>[X(x),yf(x),f*W(x)];
     const c=(x,f)=>ao?ao(x,f*W(x)):1;
     Q(S,key,P(x0,zc[j]),P(x1,zc[j]),P(x1,zc[j+1]),P(x0,zc[j+1]),2,c(x0,zc[j]),c(x1,zc[j]),c(x1,zc[j+1]),c(x0,zc[j+1]));}}};
  for(let k=0;k<K;k++){const ry={t:'s',k};
   // the soffit of slab k: over the gap below it, then open air to its tip
   {const y=YS(k),a=Math.max(k===0?HX1:XG(k-1),C.lo(y,ry)),b=Math.min(XT(k),C.hi(y,ry));
    strip('soff',a,b,x=>ybot(k,x),k>0?((x,z)=>x<XT(k-1)?gapAO(k-1,x,z)*.9:.9):(()=>.9));}
   // the deck on top of slab k: the floor of the gap, or the roof garden
   {const y=YT(k);
    if(k<K-1){const a=Math.max(XG(k),C.lo(y,ry)),b=Math.min(XT(k),C.hi(y,ry));strip('deck',a,b,()=>y,(x,z)=>gapAO(k,x,z));}
    else{const a=Math.max(XU,C.lo(y,ry)),b=Math.min(XT(k),C.hi(y,ry));
     if(b-a>.5){const n=Math.max(1,Math.ceil((b-a)/CW));
      for(let i=0;i<n;i++){const x0=lerp(a,b,i/n),x1=lerp(a,b,(i+1)/n);
       const zz=[-1,-12,12,1],ks=['deck','lawn','deck'],zv=(x,j)=>j===0?-W(x):j===3?W(x):zz[j]*(j===1?1:1);
       // edges paved, the middle planted
       for(let j=0;j<3;j++)Q(S,j===1?'lawn':'deck',[X(x0),y,zv(x0,j)],[X(x1),y,zv(x1,j)],[X(x1),y,zv(x1,j+1)],[X(x0),y,zv(x0,j+1)],2);}}}}}
 };

 // ================================================================ THE DRESSING
 // Balconies, houses, trees, people and lights on one half-wing, in design
 // coordinates, clipped exactly as the shell was.
 const QF={1:qFacing([0,0,1]),'-1':qFacing([0,0,-1])};
 const dressHalf=(sx,C,full)=>{const X=x=>sx*x;
  const inClip=(x,y,rw)=>x>=C.lo(y,rw)+1&&x<=C.hi(y,rw)-1;
  // ---- balconies: every storey on the cantilever, every other one on the yoke
  for(let k=0;k<K;k++){const rw={t:'s',k};
   for(let j=0;j<8;j++){const yf=YS(k)+j*3.6+.3;
    for(let x=Math.max(Uinv(yf)+10,12)+3.6;x<XT(k)-3;x+=7.2){
     const onYoke=x<XR(k);if(onYoke&&j%2&&dd)continue;
     if(yf<ybot(k,x)+.5||inDrum(x,yf)||!inClip(x,yf,rw))continue;
     for(const zs of [1,-1]){
      if(dd&&(rng()<.42||HOLE(sx,zs,x,yf)))continue;
      let q=QF[zs];
      if(dd&&rng()<.08)q=QF[zs].clone().multiply(qEuler(rr(.8,1.4),0,rr(-.3,.3)));
      KP('wgBalc',[X(x),yf,zs*W(x)],q,[5.8,1.15,rr(2.1,2.6)],PALE());
      if(!dd&&full&&rng()<.1)KP('leafCard',[X(x+rr(-2,2)),yf+.9,zs*(W(x)+1.7)],qEuler(0,rng()*TAU,0),[rr(1.2,2),rr(1,1.6),rr(1.2,2)],LEAF());
      if(dd&&rng()<.12)KP('vine',[X(x+rr(-2,2)),yf-.3,zs*(W(x)+2.2)],qEuler(rr(-.1,.1),0,rr(-.1,.1)),[rr(.9,1.6),rr(4,18),rr(.9,1.6)],null);}}}}
  // ---- QA (arcC): the soffits' ribs. 'Under the cantilever' looked up at a
  // plain plane 170 m long; now a transverse rib every 9 m (the cantilever's
  // own structure, deepening toward the root), a lamp slot on every other one.
  for(let k=0;k<K;k++){const rw={t:'s',k},x0=k===0?HX1+6:XG(k-1)+6;
   for(let x=x0;x<XT(k)-4;x+=9){const yb=ybot(k,x);if(!inClip(x,yb+1,rw)||inDrum(x,yb)||(dd&&rng()<.3))continue;
    const dp=1.2+2.4*clamp(1-(x-XR(k))/(XT(k)-XR(k)),0,1);
    let q=null,yy=yb-dp*.5;if(dd&&rng()<.12){q=qEuler(rr(-.4,.4),0,rr(-.3,.3));yy-=rr(1,4);}
    KP('wgBox',[X(x),yy,0],q,[1.4,dp,2*W(x)-3],CONC());
    if(!dd&&Math.round(x/9)%2===0)KP('strip',[X(x+4.5),yb-.35,0],qEuler(0,Math.PI/2,0),[2*W(x)-8,3,3],WARMC);}}
  // ---- the gaps: decks with houses, trees, rails, piers, and light under the soffit
  for(let k=0;k<K-1;k++){const rw={t:'s',k},y=YT(k);
   const xa=XG(k)+4,xb=XT(k)-4;
   // piers tie each slab to the next near the root: the stack acts as one lever
   for(let x=XG(k)+10;x<XR(k+1)-4;x+=22){if(!inClip(x,y,rw))continue;
    for(const zs of [1,-1]){if(dd&&rng()<.2)continue;
     KP('wgBox',[X(x),y+GP*.5,zs*(W(x)-3.5)],null,[4,GP+.2,7],CONC());}}
   for(let x=xa+8;x<xb;x+=24){if(!inClip(x,y,rw))continue;
    for(const zs of [1,-1]){const z=zs*W(x)*.44;
     if(!(dd&&rng()<.4)){let q=null,yy=y+3.6;
      if(dd&&rng()<.4){q=qEuler(rr(-.2,.2),rr(-.3,.3),rr(-.25,.25));yy-=rr(.5,2.5);}
      KP(dd?'wgHutR':'wgHut',[X(x),yy,z],q,[rr(13,17),7.2,rr(9,12)],null);}
     // the rail along the open edge
     if(!(dd&&rng()<.5))KP('wgBox',[X(x+4),y+.6,zs*(W(x)-.5)],null,[24,1.2,.35],PALE());
     if(full&&!(dd&&rng()<.5))KP('hedge',[X(x+4),y+.6,zs*(W(x)-1.6)],null,[22,dd?rr(1.4,2.6):1.1,1.3],LEAF());
     if(full&&!dd)for(let p=0;p<2;p++)person([X(x+rr(-10,10)),y,zs*rr(W(x)*.7,W(x)-2)]);}
    if(full&&rng()<(dd?.95:.8))plant([X(x+12+rr(-3,3)),y,rr(-6,6)],dd?rr(8,12.5):rr(6,9));
    if(full&&dd){KP('moss',[X(x+rr(0,20)),y+.3,rr(-30,30)],qEuler(0,rng()*TAU,0),[rr(4,9),rr(.6,1.6),rr(3,7)],MOSS());
     if(rng()<.7)plant([X(x+rr(0,20)),y,rr(-W(x)+4,W(x)-4)],rr(5,11));}}
   if(!dd&&full)for(const zs of [1,-1]){const x0=Math.max(xa,C.lo(y,rw)),x1=Math.min(xb,C.hi(y,rw));
    if(x1-x0>4)KP('strip',[X((x0+x1)*.5),YS(k+1)-.8,zs*(W(x1)-.9)],null,[x1-x0,5,5],WARMC);}
   // vines hang off every slab edge in the ruin
   if(dd&&full)for(let x=XG(k)+6;x<XT(k+1);x+=rr(6,16)){if(!inClip(x,YS(k+1),{t:'s',k:k+1}))continue;
    const zs=rng()<.5?1:-1;KP('vine',[X(x),YS(k+1)+rr(-1,1),zs*(W(x)+.8)],qEuler(rr(-.08,.08),0,rr(-.08,.08)),[rr(1,2),rr(8,34),rr(1,2)],null);}}
  if(!full)return;
  // ---- the roof garden on the top slab and the ramp up the back of the lever
  {const y=YTOP,rw={t:'s',k:K-1};
   for(let x=XU+6;x<XT(K-1)-4;x+=rr(9,16)){if(!inClip(x,y,rw))continue;
    plant([X(x),y,rr(-10,10)],dd?rr(9,16):rr(7,11));
    if(dd&&rng()<.6)KP('moss',[X(x),y+.3,rr(-W(x)+3,W(x)-3)],qEuler(0,rng()*TAU,0),[rr(4,9),rr(.6,1.6),rr(3,7)],MOSS());
    person([X(x+rr(-4,4)),y,rr(-W(x)+3,W(x)-3)]);}
   for(let x=XU;x<XT(K-1);x+=20){if(!inClip(x+10,y,rw)||(dd&&rng()<.4))continue;
    for(const zs of [1,-1])KP('wgBox',[X(x+10),y+.7,zs*(W(x+10)-.4)],null,[20.2,1.4,.6],PALE());}
   if(inClip(XT(K-1)-2,y,rw)&&!dd)KP('wgBox',[X(XT(K-1)-.4),y+.7,0],null,[.6,1.4,2*W(XT(K-1))],PALE());}
  // the processional stair up the back of the lever, from the drum to the roof
  {let yj=Uc(128);
   while(yj<YTOP-.5){const y1=Math.min(YTOP,yj+1.8),x0=Uinv(yj),x1=Uinv(y1);
    const rw=RWS.find(r=>r.y0<=yj&&r.y1>yj)||{t:'h'};
    if(!inDrum(x0,yj)&&inClip((x0+x1)*.5,yj,rw)&&!(dd&&rng()<.3))
     KP('wgBox',[X((x0+x1)*.5),(yj+y1)*.5,0],null,[Math.max(.6,x1-x0),y1-yj,22],dd?CONC():PALE());
    if(!dd&&rng()<.18)person([X(x1),y1,rr(-9,9)]);
    if(dd&&rng()<.25&&!inDrum(x0,yj)&&inClip(x0,yj,rw))KP('moss',[X(x0),yj+.5,rr(-40,40)],null,[rr(4,9),rr(.6,1.4),rr(3,7)],MOSS());
    yj=y1;}
   for(let x=130;x<XU;x+=10){const y=Uc(x);if(inDrum(x,y)||!inClip(x,y,RWS.find(r=>r.y0<=y&&r.y1>y)||{t:'h'}))continue;
    if(rng()<(dd?.7:.4))plant([X(x),y,(rng()<.5?-1:1)*rr(16,W(x)-4)],dd?rr(8,14):rr(6,10));}}
 };

 // ======================================================================= STANDING
 const SS=mkSet();
 // ---- the two halves
 for(const sx of [1,-1]){
  let C=NOCLIP;
  if(dd&&sx>0)C={lo:()=>0,hi:y=>cutE(y)};
  if(dd&&sx<0){C={lo:()=>0,hi:(y,rw)=>rw&&rw.t==='s'&&BRK[rw.k]?XT(rw.k)-BRK[rw.k]:1e9};MAPF=MAPW;}
  emitHalf(SS,sx,C);
  dressHalf(sx,C,true);
  MAPF=null;}

 // ---- the drum: its rim, both lenses, their coffers ---------------------------------
 {const NR=2*NL;
  for(let i=0;i<NR;i++){const t0=i/NR*TAU,t1=(i+1)/NR*TAU;
   const x0=R*Math.cos(t0),y0=YC+R*Math.sin(t0),x1=R*Math.cos(t1),y1=YC+R*Math.sin(t1);
   const hid=inYoke(x0,y0)&&inYoke(x1,y1);
   const zb=[-ZR,-50,50,ZR];
   for(let s=0;s<3;s++){if(s===1&&hid)continue;
    Q(SS,'conc',[x0,y0,zb[s]],[x1,y1,zb[s]],[x1,y1,zb[s+1]],[x0,y0,zb[s+1]],
     [R*t0/8,zb[s]/8,R*t1/8,zb[s]/8,R*t1/8,zb[s+1]/8,R*t0/8,zb[s+1]/8]);}}}
 const LP=(rho,th,zs,dz)=>{const r=RC*Math.exp(rho);return[r*Math.cos(th),YC+r*Math.sin(th),zs*(zL(r)-(dz||0))];};
 const L3=(a,b,t)=>[lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)];
 const rIn=RC*Math.exp(-KR*AL*.5);
 let coffersLost=0;
 for(const zs of [1,-1]){
  // the collar: the plain ring between the coffer field and the rim
  for(let i=0;i<NL;i++){const th0=i*AL,th1=(i+1)*AL,thm=(i+.5)*AL;
   const in0=LP(0,th0,zs),in1=LP(0,th1,zs);
   const o=t=>[R*Math.cos(t),YC+R*Math.sin(t),zs*ZR];
   T3(SS,'lens',in0,o(th0),o(thm),0);T3(SS,'lens',in0,o(thm),in1,0);T3(SS,'lens',in1,o(thm),o(th1),0);}
  // the coffers: diamonds between two families of log spirals
  for(let dI=-1;dI>=-(KR-1);dI--)for(let i=0;i<NL;i++){const j=i+dI;
   const P4=[[i,j],[i+1,j],[i+1,j+1],[i,j+1]].map(([p,q])=>LP((q-p)*AL*.5,(p+q)*AL*.5,zs));
   const rc=RC*Math.exp(dI*AL*.5),thc=(2*i+dI+1)*AL*.5,size=rc*AL;
   const ctr=LP(dI*AL*.5,thc,zs),xc=ctr[0];
   let miss=false,frameGone=false;
   if(dd){const n=fbm(ctr[0]/46+3,(ctr[1]-YC)/46,9629+(zs>0?0:5),3);
    miss=n<.36+.16*sm(-40,120,xc);frameGone=miss&&n<.30+.12*sm(-40,120,xc);}
   const IR=P4.map(p=>L3(p,ctr,.13));
   // stepped, as a coffer should be: a first reveal, a ledge, a deeper reveal, the lantern
   const Dp=.5*size+.6,D1=Dp*.42;
   const S1=IR.map(p=>{const q=L3(p,ctr,.08);q[2]-=zs*D1;return q;});
   const S2=S1.map(p=>L3(p,ctr,.13));
   const BK=S2.map(p=>{const q=L3(p,ctr,.12);q[2]-=zs*(Dp-D1);return q;});
   if(!frameGone)for(let m=0;m<4;m++){const n2=(m+1)%4;Q(SS,'lens',P4[m],P4[n2],IR[n2],IR[m],0);}
   if(miss){coffersLost++;continue;}
   for(let m=0;m<4;m++){const n2=(m+1)%4;
    Q(SS,'wall',IR[m],IR[n2],S1[n2],S1[m],0,.9,.9,.66,.66);
    Q(SS,'lens',S1[m],S1[n2],S2[n2],S2[m],0,.78,.78,.7,.7);
    Q(SS,'wall',S2[m],S2[n2],BK[n2],BK[m],0,.6,.6,.26,.26);}
   const lit=!dd&&h3(i*1.7,dI*3.1,zs+9.9)<.42;
   Q(SS,lit?'lantL':'lantD',BK[0],BK[1],BK[2],BK[3],[0,0,1,0,1,1,0,1]);}
  // the zigzag at each edge of the field, filled flush
  for(let i=0;i<NL;i++){
   const pt=(p,q)=>LP((q-p)*AL*.5,(p+q)*AL*.5,zs);
   T3(SS,'lens',pt(i,i),pt(i+1,i),pt(i+1,i+1),0);
   const j=i-KR;T3(SS,'lens',pt(i,j),pt(i,j+1),pt(i+1,j+1),0);}
  // the oculus: a short bore and a light at the bottom of it
  {const z0=zL(rIn),z1=z0-24;
   for(let i=0;i<NL;i++){const t0=i*AL,t1=(i+1)*AL;
    const a=[rIn*Math.cos(t0),YC+rIn*Math.sin(t0)],b=[rIn*Math.cos(t1),YC+rIn*Math.sin(t1)];
    Q(SS,'wall',[a[0],a[1],zs*z0],[b[0],b[1],zs*z0],[b[0],b[1],zs*z1],[a[0],a[1],zs*z1],0,.8,.8,.3,.3);
    T3(SS,dd?'void':'hall',[0,YC,zs*z1],[a[0],a[1],zs*z1],[b[0],b[1],zs*z1],
     [.5,.5,.5+.5*Math.cos(t0),.5+.5*Math.sin(t0),.5+.5*Math.cos(t1),.5+.5*Math.sin(t1)]);}
   if(!dd)kput('strip',[0,YC,zs*(z0+.5)],null,[4,4,4],CYAN);}
  // the ruin: the drum's gutted inside, seen through every missing coffer
  if(dd){const zi=zs*41;
   for(let i=0;i<NL;i++){const t0=i*AL,t1=(i+1)*AL;
    for(const rr2 of [[0,70],[70,R-1]]){const P=(r,t)=>[r*Math.cos(t),YC+r*Math.sin(t),zi];
     Q(SS,'guts',P(rr2[0],t0),P(rr2[1],t0),P(rr2[1],t1),P(rr2[0],t1),0,.7,.7,.7,.7);}}}}

 // ---- the pedestal ---------------------------------------------------------------------
 {const PW=14,PH=PL+44;
  for(const zs of [1,-1]){const z=zs*PZ,z2=zs*(PZ-14);
   Q(SS,'mass',[-PX,PL,z],[-PW,PL,z],[-PW,PY,z],[-PX,PY,z],0);
   Q(SS,'mass',[PW,PL,z],[PX,PL,z],[PX,PY,z],[PW,PY,z],0);
   Q(SS,'mass',[-PW,PH,z],[PW,PH,z],[PW,PY,z],[-PW,PY,z],0);
   Q(SS,'wall',[-PW,PL,z],[-PW,PL,z2],[-PW,PH,z2],[-PW,PH,z],1,.8,.4,.4,.8);
   Q(SS,'wall',[PW,PL,z],[PW,PL,z2],[PW,PH,z2],[PW,PH,z],1,.8,.4,.4,.8);
   Q(SS,'wall',[-PW,PH,z],[PW,PH,z],[PW,PH,z2],[-PW,PH,z2],2,.8,.8,.4,.4);
   Q(SS,dd?'guts':'hall',[-PW,PL,z2],[PW,PL,z2],[PW,PH,z2],[-PW,PH,z2],dd?0:[0,0,1,0,1,1,0,1]);
   if(!dd)kput('strip',[0,PH+2,z+zs*.6],null,[2*PW+4,5,5],WARMC);}
  for(const xs of [1,-1])Q(SS,'mass',[xs*PX,PL,-PZ],[xs*PX,PL,PZ],[xs*PX,PY,PZ],[xs*PX,PY,-PZ],1);
  Q(SS,'conc',[-PX,PY,-PZ],[PX,PY,-PZ],[PX,PY,PZ],[-PX,PY,PZ],2);
  // QA (arcC): the pedestal was a box. Buttress ribs every 8 m on all four
  // faces (clear of the portals), and between them rows of deep slots.
  {const rib=(x,z,q,L)=>{if(dd&&rng()<.2)return;kput('wgBox',[x,(PL+PY)/2-2,z],q,[1.8,PY-PL-8,L],new THREE.Color(dd?0x5a554e:0x8e8980));};
   for(const zs of [1,-1])for(let x=-PX+6;x<=PX-6;x+=8){if(Math.abs(x)<PW+4)continue;rib(x,zs*(PZ+1.2),null,2.4);
    for(let y=PL+12;y<PY-12;y+=9.5)if(rng()<.5)kput('wgDim',[x+4,y,zs*(PZ+.3)],null,[1.4,4.2,.8],null);}
   for(const xs of [1,-1])for(let z=-PZ+6;z<=PZ-6;z+=8){rib(xs*(PX+1.2),z,null,1.8);
    for(let y=PL+12;y<PY-12;y+=9.5)if(rng()<.5)kput('wgDim',[xs*(PX+.3),y,z+4],null,[.8,4.2,1.4],null);}}
  // the capital and base courses
  kput('wgBox',[0,PY-2.5,0],null,[2*PX+8,5,2*PZ+8],new THREE.Color(dd?0x5e5953:0xa29d94));
  kput('wgBox',[0,PL+2,0],null,[2*PX+6,4,2*PZ+6],new THREE.Color(dd?0x5e5953:0xa29d94));}

 // ---- the plinth -----------------------------------------------------------------------
 const OCT=(t,e)=>{const X=450-40*t-e,Z=250-36*t-e,c=Math.max(4,90-10*t-e*.41);
  return[[X,-(Z-c)],[X,Z-c],[X-c,Z],[-(X-c),Z],[-X,Z-c],[-X,-(Z-c)],[-(X-c),-Z],[X-c,-Z]];};
 const inOct=(t,x,z,e)=>{const X=450-40*t-(e||0),Z=250-36*t-(e||0),c=Math.max(4,90-10*t-(e||0)*.41);
  const ax=Math.abs(x),az=Math.abs(z);return ax<X&&az<Z&&ax+az<X+Z-c;};
 const tierY=(x,z)=>inOct(2,x,z)?PL:inOct(1,x,z)?2*TH:inOct(0,x,z)?TH:0;
 {const PS=SS;
  for(let t=0;t<3;t++){const V=OCT(t,0),y0=t*TH,y1=(t+1)*TH;let s=0;
   for(let m=0;m<8;m++){const a=V[m],b=V[(m+1)%8],L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.ceil(L/30));
    for(let c=0;c<n;c++){const u0=c/n,u1=(c+1)/n;
     const p0=[lerp(a[0],b[0],u0),lerp(a[1],b[1],u0)],p1=[lerp(a[0],b[0],u1),lerp(a[1],b[1],u1)];
     const s0=(s+u0*L)/TILE,s1=(s+u1*L)/TILE;
     Q(PS,'rib',[p0[0],y0,p0[1]],[p1[0],y0,p1[1]],[p1[0],y1,p1[1]],[p0[0],y1,p0[1]],[s0,y0/TILE,s1,y0/TILE,s1,y1/TILE,s0,y1/TILE]);}
    s+=L;
    T3(PS,'deck',[0,y1,0],[a[0],y1,a[1]],[b[0],y1,b[1]],2);
    // a lit coping along every tread edge
    {const o=[(a[0]+b[0])*.5,(a[1]+b[1])*.5],ln=Math.hypot(o[0],o[1]),q=qFacing([o[0]/ln,0,o[1]/ln]);
     kput('wgBox',[o[0]+o[0]/ln*.6,y1-.7,o[1]+o[1]/ln*.6],q,[L,1.4,1.4],new THREE.Color(dd?0x5a554e:0x9a948a));
     if(!dd)kput('strip',[o[0]+o[0]/ln*1.4,y1-2.2,o[1]+o[1]/ln*1.4],q,[L*.94,5,5],WARMC);}}
   // a planted band round the tread
   if(t<2){const Vo=OCT(t,7),Vi=OCT(t,27);
    for(let m=0;m<8;m++){const n2=(m+1)%8;
     Q(PS,'lawn',[Vo[m][0],y1+.12,Vo[m][1]],[Vo[n2][0],y1+.12,Vo[n2][1]],[Vi[n2][0],y1+.12,Vi[n2][1]],[Vi[m][0],y1+.12,Vi[m][1]],2);}}}
  // four beds round the pedestal
  for(const sx of [1,-1])for(const zs of [1,-1])
   Q(PS,'lawn',[sx*130,PL+.12,zs*84],[sx*300,PL+.12,zs*84],[sx*300,PL+.12,zs*150],[sx*130,PL+.12,zs*150],2);}
 // grand stairs, north and south, one flight a tier
 for(const zs of [1,-1])for(let t=0;t<3;t++){const Zt=250-36*t,SW=72-12*t,n=30,base=t*TH;
  for(let j=0;j<n;j++){const h=(j+1)*TH/n;
   kput('wgBox',[0,base+h*.5,zs*(Zt+18-(j+.5)*.6)],null,[SW,h,.62],new THREE.Color(dd?0x57524b:0x9d978c));}
  for(const s of [1,-1])beam('wgBox',[s*(SW*.5+1.4),base+1.3,zs*(Zt+18)],[s*(SW*.5+1.4),base+TH+1.3,zs*Zt],2.6,2.8,CONC());
  for(let j=0;j<(dd?0:14);j++){const f=rng();person([rr(-SW*.45,SW*.45),base+f*TH,zs*(Zt+18-f*18)]);}}
 // ---- the ground works: two avenues, north and south
 {const GS=SS;
  for(const zs of [1,-1]){const z0=268,z1=zs>0?1300:1000;
   for(let z=z0;z<z1;z+=60){const za=zs*z,zb=zs*Math.min(z1,z+60);
    Q(GS,'deck',[-38,.15,za],[38,.15,za],[38,.15,zb],[-38,.15,zb],2);}
   for(let z=z0+10;z<z1;z+=26)for(const s of [1,-1])plant([s*rr(46,50),0,zs*z],dd?rr(9,17):rr(8,12));
   for(let j=0;j<(dd?0:70);j++)person([rr(-34,34),.15,zs*rr(z0,z1)]);}}
 // ---- life on the plinth
 for(let j=0;j<(dd?260:900);j++){const x=rr(-450,450),z=rr(-250,250);
  if(!inOct(0,x,z,3))continue;
  if(Math.abs(x)<PX+4&&Math.abs(z)<PZ+4)continue;
  if(Math.abs(x)<40&&Math.abs(z)>170)continue;
  const y=tierY(x,z),r3=rng();
  if(r3<.3)plant([x,y,z],dd?rr(8,16):rr(6,10));
  else if(r3<.4)kput('wgBox',[x,y+.5,z],qEuler(0,rng()*TAU,0),[rr(4,9),1,rr(1.4,2.4)],CONC());
  else if(dd&&r3<.7)kput('moss',[x,y+.3,z],null,[rr(2,6),rr(.5,1.2),rr(2,6)],MOSS());
  else person([x,y,z]);}

 // ---- the registry -----------------------------------------------------------------------
 REGISTER({name:'The Wing ('+STATE(d)+')',x:0,z:0,r:dd?460:720,h:YTOP+10});
 REGISTER({name:'The Wing — the coffered drum'+(dd?', '+coffersLost+' coffers fallen':''),x:0,z:0,r:R+30,y:PY,h:2*R});
 REGISTER({name:'The Wing — the pedestal',x:0,z:0,r:PX+10,y:PL,h:PY-PL});
 REGISTER({name:'The Wing — the plinth',x:0,z:0,r:452,h:PL+2});
 REGISTER({name:'The Wing — the west wing'+(dd?', sagging, its outer slabs pancaked':', seven slab decks'),x:-560,z:0,r:170,y:dd?150:YS(0)-5,h:dd?330:YTOP-YS(0)+15});
 if(!dd)REGISTER({name:'The Wing — the east wing, seven slab decks',x:560,z:0,r:170,y:YS(0)-5,h:YTOP-YS(0)+15});
 else REGISTER({name:'The Wing — the stump of the east wing',x:170,z:0,r:40,y:120,h:230});
 flush(SS,G);

 // ======================================================================= THE RUIN, outside
 let FALLEN=[];
 if(dd){
  // ---- the east wing, in three pieces on the plain ----------------------------------
  // Each piece is emitHalf() again, clipped to its span, inside a group laid on
  // the ground: the break faces match the stump cell for cell.
  const pieces=[
   // all three came down on their backs: the front face, its slab bands and
   // shadow gaps, turned to the sky; the roof and the soffits are the flanks
   {lo:y=>cutE(y),hi:y=>cutAB(y),x0:150,x1:440,y0:150,y1:YTOP,q:qEuler(0,.22,0).multiply(qEuler(-Math.PI/2+.1,0,.05)),at:[700,60]},
   {lo:y=>cutAB(y),hi:y=>cutBC(y),x0:370,x1:610,y0:YS(0),y1:YTOP,q:qEuler(0,-.3,0).multiply(qEuler(-Math.PI/2+.06,0,-.1)),at:[960,-230]},
   {lo:y=>cutBC(y),hi:()=>1e9,x0:560,x1:695,y0:YS(3),y1:YTOP,q:qEuler(0,.9,0).multiply(qEuler(-Math.PI/2+.35,0,-.25)),at:[1150,40]}];
  const SHS=mkSet();
  for(const PC of pieces){
   // sit its lowest corner 3 m into the plain, centred where it came to rest
   let lo=1e9,cx=0,cz=0,nn=0;
   for(const x of [PC.x0,(PC.x0+PC.x1)*.5,PC.x1])for(const y of [PC.y0,PC.y1])for(const zs of [1,-1]){
    const v=new THREE.Vector3(x,y,zs*W(x)).applyQuaternion(PC.q);lo=Math.min(lo,v.y);cx+=v.x;cz+=v.z;nn++;}
   const P=new THREE.Group();P.quaternion.copy(PC.q);P.position.set(PC.at[0]-cx/nn,-lo-3,PC.at[1]-cz/nn);G.add(P);
   useGroupXF(P);
   const FS=mkSet(),Cp={lo:(y)=>PC.lo(y),hi:(y)=>PC.hi(y)};
   emitHalf(FS,1,Cp);dressHalf(1,Cp,false);
   endGroupXF();flush(FS,P);
   // QA (arcC): bedded in what it crushed — rubble piled wherever the piece's
   // faces come within a few metres of the plain — and torn slabs of its
   // concrete thrown out round it (krShard, 89d-arcube.js)
   {const Mw=new THREE.Matrix4().compose(P.position,P.quaternion,new THREE.Vector3(1,1,1)),v=new THREE.Vector3();
    for(let x=PC.x0;x<=PC.x1;x+=6)for(let y=PC.y0;y<=PC.y1;y+=6)for(const zs of [1,-1]){if(rng()<.5)continue;
     v.set(x,y,zs*W(x)).applyMatrix4(Mw);if(v.y>8||v.y<-8)continue;const sz=rr(2,8);
     kput('wgRub',[v.x+rr(-5,5),Math.max(0,v.y)*.4+sz*.3,v.z+rr(-5,5)],qEuler(rng()*3,rng()*3,rng()*3),[sz*rr(.8,1.5),sz*rr(.5,.9),sz*rr(.8,1.5)],RUBC());}
    for(let j=0;j<8;j++){const w=rr(12,30),l=rr(14,40),t=rr(3,7);
     const SH=krShard({w:w,l:l,t:t,layers:2,brk:[1,1,1,j%2],bite:.26,tile:TILE,seg:8});
     const a=rng()*TAU,r=rr(120,230),x=PC.at[0]+Math.cos(a)*r,z=PC.at[1]+Math.sin(a)*r,qS=qEuler(rr(-.3,.3),rng()*TAU,rr(-.3,.3));
     const MS=new THREE.Matrix4().compose(new THREE.Vector3(x,-SH.low(qS)-t*.3,z),qS,new THREE.Vector3(1,1,1));
     for(const [g,key] of [[SH.top,'rib'],[SH.side,'conc'],[SH.bot,'conc'],[SH.brk,'guts']]){if(!g)continue;g.applyMatrix4(MS);
      const pa=g.attributes.position,ua=g.attributes.uv;for(let i=0;i<pa.count;i+=3){const P3=[0,1,2].map(o=>[pa.getX(i+o),pa.getY(i+o),pa.getZ(i+o)]);
       T3(SHS,key,P3[0],P3[1],P3[2],[0,1,2].flatMap(o=>[ua.getX(i+o),ua.getY(i+o)]),1,1,1);}}}}
   FALLEN.push({x:PC.at[0],z:PC.at[1]});
   REGISTER({name:'The Wing — the fallen east wing, piece '+FALLEN.length,x:PC.at[0],z:PC.at[1],r:170,h:130});
   rub(PC.at[0],PC.at[1],90,260,260,7);
   for(let j=0;j<40;j++){const a=rng()*TAU,r=rr(100,240),sz=rr(5,16);
    kput('wgRub',[PC.at[0]+Math.cos(a)*r,sz*.2,PC.at[1]+Math.sin(a)*r],qEuler(rr(-.5,.5),rng()*TAU,rr(-.5,.5)),[sz*rr(1,2.2),sz*.5,sz*rr(.8,1.6)],CONC());}}
  flush(SHS,G);
  // ---- the stump: floors hanging out of the break, rods, the heap below it
  for(let j=0;j<70;j++){const y=rr(130,Math.min(YTOP,380)),x=cutE(y);if(!inYoke(x-6,y))continue;
   const L=rr(6,20);
   kput('wgBox',[x+L*.4,y,rr(-44,44)],qEuler(rr(-.06,.06),0,rr(-.25,.08)),[L,.9,rr(8,26)],new THREE.Color(0x6e6860));}
  for(let j=0;j<50;j++){const y=rr(130,340),x=cutE(y);if(!inYoke(x-6,y))continue;const z=rr(-44,44);
   beam('wgBox',[x-2,y,z],[x+rr(4,14),y+rr(-8,3),z+rr(-3,3)],.35,.35,new THREE.Color(0x4a3a2e));}
  rub(260,0,20,230,700,8,tierY);
  for(let j=0;j<60;j++){const x=rr(200,450),z=rr(-200,200),sz=rr(5,18);
   kput('wgBox',[x,tierY(x,z)+sz*.2,z],qEuler(rr(-.5,.5),rng()*TAU,rr(-.5,.5)),[sz*rr(1,2),sz*.5,sz*rr(.8,1.6)],CONC());}
  rub(760,0,100,560,700,7);
  // ---- the west wing's snapped tips, on the ground beneath
  for(const k in BRK){const kk=+k,xm=XT(kk)-BRK[kk]*.5;
   const p=MAPW([-xm,YS(kk),0]);
   for(let j=0;j<5;j++){const sz=rr(10,22);
    kput('wgBox',[p[0]+rr(-60,60),sz*.25,rr(-80,80)],qEuler(rr(-.6,.6),rng()*TAU,rr(-.6,.6)),[sz*rr(1.5,3),sz*.6,sz*rr(1,2)],CONC());}
   rub(p[0],0,10,120,160,6);}
  // ---- coffers that fell out of the spiral: pale blocks at the drum's feet
  for(const zs of [1,-1])for(let j=0;j<70;j++){const x=rr(-150,170),z=zs*rr(70,210),sz=rr(3,11);
   kput('wgBox',[x,tierY(x,z)+sz*.3,z],qEuler(rng()*3,rng()*3,rng()*3),[sz,sz*.7,sz],PALE());}
  // ---- the plain has had five thousand years at it
  for(let j=0;j<420;j++){const x=rr(-450,450),z=rr(-250,250);if(!inOct(0,x,z,2)||(Math.abs(x)<PX+3&&Math.abs(z)<PZ+3))continue;
   kput('moss',[x,tierY(x,z)+.3,z],qEuler(0,rng()*TAU,0),[rr(2,7),rr(.5,1.4),rr(2,6)],MOSS());}
  trees(0,0,470,1250,190);}
 else trees(0,0,520,1100,90);

 // ---- what the presets are derived from ----------------------------------------------------
 WG_SITE[d]={x:gx,z:gz,d:d,dd:dd,R:R,YC:YC,PY:PY,PL:PL,ZR:ZR,BUL:BUL,Y0:Y0,SP:SP,TS:TS,GP:GP,K:K,YTOP:YTOP,
  XR:[0,1,2,3,4].map(XR),XT:[0,1,2,3,4].map(XT),XG:[0,1,2,3,4].map(XG),W:x=>W(x),
  CUTE:dd?cutE(300):null,FALLEN:FALLEN,SAGP:dd?MAPW([-XT(K-1),YTOP,0]):null};
 KOFF=[0,0,0];return G;}
