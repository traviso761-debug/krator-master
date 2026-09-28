// ================================================================= THE LEDGE — the cantilevered cliff city
// A sandstone escarpment 850 m tall and 2 km long, facing west into the sun,
// and hung off the middle of it a city of thirty-four pale limestone slab
// layers stacked as an INVERTED ZIGGURAT in section: the lowest layer, 150 m
// over the plain, reaches 40 m out of the rock; each one above reaches further;
// the top decks overhang 330 m, and a great prow at the top reaches 460. The
// top deck is flush with the plateau, so the city's roof is the cliff top.
//
// Every layer is a deep horizontal band: a slab 3.4-10.5 m thick with a gallery
// and parapet at its edge, the rooms set back 5-11 m behind it under the soffit
// of the layer above, and the underside — the one part of each slab that is
// visible from below, the strip between its own reach and the reach of the
// layer under it — ribbed, stepped and hung with pods. Each layer's plan is
// additive: 24-72 m blocks, each with its own reach, some jutting as local
// prows, some stepping back, correlated up the stack by a slow noise so they
// gather into wings rather than a stipple.
//
// THE SITE, in builder coordinates. The face is at x ~ 0 and faces -x; the rock
// is at +x, the plain at -x, the cliff runs along z. The massif is a rounded
// rectangle in plan, 1 500 m deep, so the escarpment turns back at both ends
// and a camera looking along z sees the stack in profile against the sky.
//
// RUINED: the great prow has broken off and lies across the town in pieces,
// having torn a V-shaped gash down the front of the stack as it fell; seven
// mid layers at the south end are sheared off at the rock line, leaving stubs
// with their reinforcement out; a wing at the north end has pancaked, seven
// layers down onto the eighth with their outer ends draped over its edge; a
// rockfall has bitten the cliff south of the city. Dead windows, streaked
// slabs, vines off every edge, scrub on the decks.
//
// SHADE IS PAINTED: every soffit is on its own dark material, because nothing
// in this scene casts a shadow and an unshadowed soffit reads as a lit floor.

function ldStoneTex(dec,flat){
 return canvasTex(512,512,(g,w,h)=>{const id=g.createImageData(w,h),D=id.data;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
   let v=226+(fbm(x/60,y/60,4.2,3)-.5)*24+(fbm(x/9,y/9,4.9,2)-.5)*10;
   if(!flat&&y%26<1)v-=9;
   if(x%128<2||y%128<2)v-=24;else if(y%128<4)v+=5;
   if(h3(x*.71,y*.93,3.3)<.004)v-=40;
   let r=v+5,gg=v+1,b=v-9;
   if(dec){const st=fbm(x/7,y/150,6.1,3);v=v*.80+4-Math.max(0,st-.46)*170;
    r=v+4;gg=v;b=v-8;
    const li=fbm(x/18,y/18,7.3,3);if(li>.62){const k=(li-.62)*3.2;r-=30*k;gg-=10*k;b-=34*k;}
    if(h3(x*.37,y*.53,2.9)<.01){r+=26;gg+=24;b+=20;}}
   D[i]=clamp(r,0,255);D[i+1]=clamp(gg,0,255);D[i+2]=clamp(b,0,255);D[i+3]=255;}
  g.putImageData(id,0,0);});}
// The window wall: an 8 x 8 atlas of bays, each 6.4 m wide and one storey tall.
// Pale mullions and a spandrel band, dark glass with a sky gradient, and a
// lottery per cell for lit rooms, curtained rooms and blank wall. The builder
// maps each room front so a band of rooms always holds a whole number of
// storeys.
function ldWinCell(ci,cj){const lot=h3(ci*3.3,cj*5.1,2.2);return{lot:lot,lit:lot>=.10&&lot<.30,solid:lot<.10,cur:h3(ci*1.7,cj*2.9,6.1)};}
function ldWinTex(dec){
 return canvasTex(512,512,(g,w,h)=>{const id=g.createImageData(w,h),D=id.data;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
   const ci=Math.floor(x/64),cj=Math.floor(y/64),cx=x-ci*64,cy=y-cj*64,C=ldWinCell(ci,cj);
   const n=(fbm(x/14,y/14,2.7,2)-.5)*16;
   let r,gg,b;
   const frame=cx<3||cx>60||cy>56||(cy>=14&&cy<16);
   if(frame||(C.solid&&!(cx>22&&cx<42&&cy>22&&cy<46))){
    let v=dec?118+n-Math.max(0,fbm(x/5,y/70,8.8,2)-.45)*110:196+n;if(cy>56&&cy<58)v-=40;
    r=v+4;gg=v;b=v-8;}
   else if(dec){const br=h3(ci*2.1,cj*4.3,1.9);
    if(br<.25){r=40+n;gg=46+n;b=52+n;}else{r=13;gg=12;b=11;}
    if(h3(x*.21,y*.37,5.5)<.02){r+=40;gg+=40;b+=40;}}
   else if(C.lit){const f=.55+.3*C.cur,st=((cx>>3)&1)?.85:1;r=128*f*st;gg=92*f*st;b=58*f*st;}
   else{const sky=Math.max(0,1-cy/40);r=20+sky*30+n*.5;gg=26+sky*36+n*.5;b=32+sky*44+n*.5;
    if(C.cur>.70&&cy>24){r+=46;gg+=38;b+=26;}}
   D[i]=clamp(r,0,255);D[i+1]=clamp(gg,0,255);D[i+2]=clamp(b,0,255);D[i+3]=255;}
  g.putImageData(id,0,0);});}
function ldWinLit(){
 return canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),D=id.data;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,X=x*2,Y=y*2;
   const ci=Math.floor(X/64),cj=Math.floor(Y/64),cx=X-ci*64,cy=Y-cj*64,C=ldWinCell(ci,cj);
   let a=0;if(C.lit&&!(cx<3||cx>60||cy>56||(cy>=14&&cy<16)))a=.45+.55*C.cur;
   D[i]=190*a;D[i+1]=128*a;D[i+2]=66*a;D[i+3]=255;}
  g.putImageData(id,0,0);});}
// A room band laid open: three storeys a 16 m tile, each a ragged floor plate
// over a dark gutted room, with here and there a partition wall still standing
// and debris on the floor.
function ldSectTex(){
 return canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),D=id.data;const ST=h/3;
  for(let y=0;y<h;y++){const sy=y%ST,si=Math.floor(y/ST);
   for(let x=0;x<w;x++){const i=(y*w+x)*4,n=(fbm(x/10,y/10,3.9,2)-.5)*30;
    const edge=9+5*fbm(x/7,si*3.1,4.4,2);let v;
    if(sy<edge)v=150+n;
    else{v=18+n*.3;const px=(x+si*57)%97;
     if(px<5&&h3(Math.floor((x+si*57)/97),si,6.7)<.55)v=92+n*.6;
     if(sy>ST-7&&fbm(x/5,y/3,8.3,2)>.55)v=70+n;}
    D[i]=clamp(v+4,0,255);D[i+1]=clamp(v,0,255);D[i+2]=clamp(v-6,0,255);D[i+3]=255;}}
  g.putImageData(id,0,0);});}
// Sandstone grain. Near-white: the vertex colours carry the strata and streaks.
function ldRockTex(){
 return canvasTex(512,512,(g,w,h)=>{const id=g.createImageData(w,h),D=id.data;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
   let v=214+(fbm(x/70,y/70,1.3,4)-.5)*46+(fbm(x/5,y/5,1.7,2)-.5)*16;
   v+=7*Math.sin(y*.85+fbm(x/40,y/40,2.2,2)*9);
   const cr=Math.abs(fbm(x/26,y/110,2.9,3)-.5);if(cr<.011)v-=60;
   if(h3(x*.61,y*.47,8.1)<.006)v-=35;
   D[i]=clamp(v,0,255);D[i+1]=clamp(v*.975,0,255);D[i+2]=clamp(v*.94,0,255);D[i+3]=255;}
  g.putImageData(id,0,0);});}
function ldKitTex(){
 return canvasTex(128,128,(g,w,h)=>{const id=g.createImageData(w,h),D=id.data;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
   let v=236+(fbm(x/12,y/12,1.9,2)-.5)*18;const e=Math.min(x,y,w-1-x,h-1-y);
   if(e<2)v=150;else if(e<4)v=250;
   D[i]=clamp(v+2,0,255);D[i+1]=clamp(v,0,255);D[i+2]=clamp(v-6,0,255);D[i+3]=255;}
  g.putImageData(id,0,0);});}
// A stair flight: run along +z (0..1), rise +y (0..1), width along x (-.5...5).
function ldStairGeo(){const s=new THREE.Shape(),n=10;s.moveTo(0,0);
 for(let k=0;k<n;k++){s.lineTo(k/n,(k+1)/n);s.lineTo((k+1)/n,(k+1)/n);}
 s.lineTo(1,.86);s.lineTo(.14,0);s.lineTo(0,0);
 const g=new THREE.ExtrudeGeometry(s,{depth:1,bevelEnabled:false,steps:1});
 g.rotateY(-Math.PI/2);g.translate(.5,0,0);return g;}
TEX.ldStone=ldStoneTex(0);TEX.ldStoneR=ldStoneTex(1);TEX.ldSoff=ldStoneTex(0,1);TEX.ldSoffR=ldStoneTex(1,1);
TEX.ldWin=ldWinTex(0);TEX.ldWinR=ldWinTex(1);TEX.ldWinE=ldWinLit();
TEX.ldSect=ldSectTex();TEX.ldRock=ldRockTex();TEX.ldKit=ldKitTex();
MAT.ldFasc =new THREE.MeshStandardMaterial({map:TEX.ldStone,roughnessMap:TEX.concreteRM,color:0xded3c1,roughness:1,metalness:0,side:DS});
MAT.ldFascR=new THREE.MeshStandardMaterial({map:TEX.ldStoneR,roughnessMap:TEX.concreteRM,color:0xb0a592,roughness:1,metalness:0,side:DS});
MAT.ldDeck =new THREE.MeshStandardMaterial({map:TEX.ldStone,roughnessMap:TEX.concreteRM,color:0xa99c86,roughness:1,metalness:0,side:DS});
MAT.ldDeckR=new THREE.MeshStandardMaterial({map:TEX.ldStoneR,roughnessMap:TEX.concreteRM,color:0x877b67,roughness:1,metalness:0,side:DS});
MAT.ldSoff =new THREE.MeshStandardMaterial({map:TEX.ldSoff,roughnessMap:TEX.concreteRM,color:0x9c9a95,roughness:1,metalness:0,side:DS});
MAT.ldSoffR=new THREE.MeshStandardMaterial({map:TEX.ldSoffR,roughnessMap:TEX.concreteRM,color:0x686660,roughness:1,metalness:0,side:DS});
MAT.ldWin  =new THREE.MeshStandardMaterial({map:TEX.ldWin,color:0xffffff,emissive:0xffffff,emissiveMap:TEX.ldWinE,emissiveIntensity:1,roughness:.7,metalness:.05,side:DS});
MAT.ldWinR =new THREE.MeshStandardMaterial({map:TEX.ldWinR,color:0xffffff,roughness:1,metalness:0,side:DS});
MAT.ldSect =new THREE.MeshStandardMaterial({map:TEX.ldSect,color:0xd2c7b4,roughness:1,metalness:0,side:DS});
MAT.ldRock =new THREE.MeshStandardMaterial({map:TEX.ldRock,vertexColors:true,color:0xffffff,roughness:1,metalness:0,side:DS});
MAT.ldVoid =new THREE.MeshStandardMaterial({color:0x0d0c0b,roughness:1,metalness:0,side:DS});
MAT.ldKit  =new THREE.MeshStandardMaterial({map:TEX.ldKit,color:0xffffff,roughness:1,metalness:0,side:DS});
MAT.ldPave =new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0xb49c7e,roughness:1,metalness:0,side:DS});
MAT.ldPaveR=new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0x86725c,roughness:1,metalness:0,side:DS});
MAT.ldRebar=new THREE.MeshStandardMaterial({color:0x5d3b27,roughness:.9,metalness:.2});
MAT.ldLawn =new THREE.MeshStandardMaterial({color:0xffffff,roughness:1,metalness:0});
kdef('ldBox',new THREE.BoxGeometry(1,1,1),MAT.ldKit);
kdef('ldDim',new THREE.BoxGeometry(1,1,1),MAT.ldVoid);
kdef('ldRebar',new THREE.BoxGeometry(1,1,1),MAT.ldRebar);
kdef('ldStair',ldStairGeo(),MAT.ldKit);
kdef('ldLawn',new THREE.BoxGeometry(1,1,1),MAT.ldLawn);
// Night only: a lit room, as a card just proud of the window wall. setNight()
// shows the classes named in FIREKIT, so these are dark by day.
kdef('ldGlow',new THREE.PlaneGeometry(1,1),MAT.dot);FIREKIT.push('ldGlow');
// Presets are DERIVED from this: targets/ledge/91z-views.js runs after
// 90-scene.js, so both builders have left their dimensions here.
const LD_SITE={};

function buildLedge(scene,gx,gz,d){reseed(9740+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0;
 const sm=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};

 // ============================================================ THE NUMBERS
 const NL=34,Y0=150,TOPD=840,TR0=6;          // layers, lowest slab, top deck, roof slab
 const XR=60;                                 // every root runs this far into the rock
 const ZF=820,RC=380,XB=1500,RB=300;          // massif plan: straight front, corner radii, depth
 const A1=RC*Math.PI/2,LF=XB-RB-RC,A2=RB*Math.PI/2,BH=ZF+RC-RB;
 const SE=ZF+A1+LF+A2+BH;                     // half perimeter; the seam is at the back
 const TOPB=852;                              // the natural cliff top
 const GC=-95;                                // the prow's axis (z)

 // ============================================================ THE PLAN (shared by both decays)
 reseed(9742);
 const FIS=[];for(let k=0;k<22;k++){let s;do{s=rr(-SE+220,SE-220);}while(Math.abs(s)<520);
  FIS.push({s:s,d:rr(9,26),w:rr(4,12),k:rr(3,12)});}
 const BEDS=[];{let y=190;while(y<800){BEDS.push({y:y,h:rr(7,20),a:rr(3,7)});y+=rr(55,105);}}
 const SPUR=[{s:-650,w:62,a:58},{s:-1180,w:120,a:75},{s:1220,w:110,a:62},{s:-2050,w:160,a:70},{s:2150,w:150,a:66}];
 // pitches, scaled to land the roof exactly on TOPD
 const LAY=[];
 {const pit=[],th=[];
  for(let i=0;i<NL;i++){const thick=i%7===5;th.push(thick?rr(9,12):rr(4.6,7.2));
   pit.push((i%6===3?rr(25,29):rr(16.5,21.5))+(thick?th[i]-4.5:0));}
  const sum=pit.reduce((a,b)=>a+b,0),k=(TOPD-TR0-Y0)/sum;
  let y=Y0;for(let i=0;i<NL;i++){LAY.push({i:i,y:y,t:th[i],deck:y+th[i],B:[]});y+=pit[i]*k;}
  for(let i=0;i<NL;i++)LAY[i].top=i<NL-1?LAY[i+1].y:TOPD-TR0;}
 const B0=f=>40+300*Math.pow(f,1.55);
 const prowR=(z,f)=>118*clamp((f-.72)/.24,0,1)*Math.exp(-Math.pow((z-GC)/150,2));
 for(const L of LAY){const f=L.i/(NL-1);
  L.za=-(205+245*Math.pow(f,1.15))-rr(-28,34)-(rng()<.16?rr(35,80):0);L.zb=195+255*Math.pow(f,1.15)+rr(-28,34)+(rng()<.16?rr(35,80):0);
  L.za=Math.max(L.za,-525);L.zb=Math.min(L.zb,525);
  // the ruin's zones, each boundary jittered per layer so the breaks are ragged
  const j=()=>rr(-16,16);
  L.prow=[-285+j(),95+j()];L.cake=[-455+j(),-262+j()];L.shear=[170+j(),392+j()];
  L.gw=L.i>=NL-22&&L.i<=NL-7?28+92*(L.i-(NL-22))/15:0;
  const bnd=[];
  if(L.i>=NL-6)bnd.push(...L.prow);
  if(L.gw)bnd.push(GC-L.gw,GC+L.gw);
  if(L.i>=10&&L.i<=17)bnd.push(...L.shear);
  if(L.i>=20&&L.i<=27)bnd.push(...L.cake);
  let cuts=[];for(let z=L.za+rr(24,72);z<L.zb-20;z+=rr(24,72))cuts.push(z);
  for(const q of bnd)if(q>L.za+8&&q<L.zb-8){cuts=cuts.filter(c=>Math.abs(c-q)>10);cuts.push(q);}
  cuts.sort((a,b)=>a-b);
  const zs=[L.za].concat(cuts,[L.zb]);
  const c=(L.za+L.zb)/2-40,hw=(L.zb-L.za)/2;
  for(let k=0;k<zs.length-1;k++){const z0=zs[k],z1=zs[k+1],zm=(z0+z1)/2,q=(zm-c)/hw;
   let R=B0(f)*(1-.28*q*q)*(1+.17*(fbm(zm*.0065+3.1,L.i*.16,9745,2)-.5)*2)+prowR(zm,f)+rr(-6,6);
   const u=rng();if(u<.09)R+=rr(18,42);else if(u<.16)R-=rr(12,28);
   R=Math.max(24,R);
   const sb=Math.min(rr(5,10.5),R*.3);
   const b={z0:z0,z1:z1,zm:zm,R:R,rf:R-sb,drop:rng()<.3?rr(1,3.4):0,zone:null,cut:R,
    off:[Math.floor(rng()*8)/8,Math.floor(rng()*8)/8],r1:rng(),r2:rng(),r3:rng()};
   if(L.i>=NL-6&&zm>L.prow[0]&&zm<L.prow[1]){b.zone='prow';b.cut=Math.min(R,rr(150,212));}
   else if(L.gw&&Math.abs(zm-GC)<L.gw){b.zone='gash';b.cut=R*rr(.42,.68);}
   else if(L.i>=10&&L.i<=17&&zm>L.shear[0]&&zm<L.shear[1]){b.zone='shear';b.cut=rr(7,22);}
   else if(L.i>=21&&L.i<=27&&zm>L.cake[0]&&zm<L.cake[1])b.zone='cake';
   else if(L.i===20&&zm>L.cake[0]&&zm<L.cake[1])b.zone='cakeBase';
   L.B.push(b);}}
 // the roof: the top layer's blocks again, a little further out
 const ROOF={i:NL,y:TOPD-TR0,t:TR0,deck:TOPD,B:LAY[NL-1].B.map(b=>{const R=b.R+rr(0,7);
   return{z0:b.z0,z1:b.z1,zm:b.zm,R:R,rf:R,drop:0,zone:b.zone==='prow'?'prow':null,
    cut:b.zone==='prow'?Math.min(R,b.cut+rr(-8,8)):R,off:b.off,r1:b.r1,r2:b.r2,r3:b.r3};})};
 const CORES=[{z:-488,w:24},{z:-292,w:22},{z:303,w:22},{z:492,w:24}];
 reseed(9740+d);

 // ============================================================ THE ROCK
 const perim=s=>{const sg=s<0?-1:1,a=Math.abs(s);let x,z,nx,nz;
  if(a<=ZF){x=0;z=a;nx=-1;nz=0;}
  else if(a<=ZF+A1){const an=Math.PI-(a-ZF)/RC;x=RC+RC*Math.cos(an);z=ZF+RC*Math.sin(an);nx=Math.cos(an);nz=Math.sin(an);}
  else if(a<=ZF+A1+LF){x=RC+(a-ZF-A1);z=ZF+RC;nx=0;nz=1;}
  else if(a<=ZF+A1+LF+A2){const an=Math.PI/2-(a-ZF-A1-LF)/RB;x=XB-RB+RB*Math.cos(an);z=ZF+RC-RB+RB*Math.sin(an);nx=Math.cos(an);nz=Math.sin(an);}
  else{x=XB;z=ZF+RC-RB-(a-ZF-A1-LF-A2);nx=1;nz=0;}
  return{x:x,z:z*sg,nx:nx,nz:nz*sg};};
 const cityW=s=>1-clamp((Math.abs(s)-470)/90,0,1);
 const seamW=s=>clamp((SE-Math.abs(s))/200,0,1);
 const topAt=s=>{const nat=TOPB+seamW(s)*28*(fbm(s*.0026,5.5,9753,2)-.5)*2;return lerp(nat,TOPD-1.2,cityW(s));};
 // the rockfall scar (ruin only), south of the city
 const scar=(s,y)=>dd?sm((y-420)/60)*sm((1-Math.abs(s-630)/120)*1.6)*(48+18*fbm(s*.03,y*.03,9759,2)):0;
 // DISPLACEMENT, outward from the plan line, in metres
 const disp=(s,y)=>{const tp=topAt(s),sT=seamW(s),cw=cityW(s);
  const tal=(118+sT*40*(fbm(s*.0045,.7,9746,2)-.5)*2)*(1-.8*Math.exp(-Math.pow(s/75,2)));
  const yt=165+sT*45*fbm(s*.006,2.1,9747,2);
  const T=tal*Math.pow(clamp(1-y/yt,0,1),1.75);
  let r=20*(fbm(s*.0085,y*.0105,9748,3)-.5)*2+8*(fbm(s*.031,y*.027,9749,2)-.5)*2;
  r+=3.2*Math.round(Math.sin(y*.047+fbm(s*.0028,0,9750,2)*5)*2)/2;
  for(const b of BEDS){const q=(y-b.y)/b.h;if(q>-.3&&q<1.3)r+=b.a*clamp(Math.min(q+.3,1.3-q)/.3,0,1);}
  r-=13*Math.pow(Math.abs(fbm(s*.017,y*.0058,9751,2)-.5)*2,2.2);
  r+=14*(Math.floor(fbm(s*.0065,y*.0085,9761,2)*6)/6-.5)+7*(Math.floor(fbm(s*.019,y*.024,9762,2)*5)/5-.5);
  for(const F of FIS){const e=(s-F.s-F.k*Math.sin(y*.013+F.s))/F.w;if(e>-3&&e<3)r-=F.d*Math.exp(-e*e);}
  r+=7*sm((y-(tp-24))/24);
  let sp=0;for(const P of SPUR){const e=(s-P.s)/P.w;if(e>-3&&e<3)sp+=P.a*Math.exp(-e*e)*(.55+.45*(1-y/tp));}
  const wand=42*(fbm(s*.0017,.3,9752,2)-.5)*2;
  r=r*(1-.62*cw)-7*cw;
  return T+sT*(r+(sp+wand)*(1-cw))-scar(s,y);};
 const facePt=(s,y)=>{const P=perim(s),o=disp(s,y);return[P.x+P.nx*o,y,P.z+P.nz*o];};
 const faceX=(z,y)=>-disp(z,y);                // on the straight front only
 const _c=new THREE.Color();
 const rockCol=(s,y,plat)=>{const b=fbm(y*.021+fbm(s*.0021,1.1,9755,2)*1.6,.4,9756,3);
  let h=.075+.028*(b-.5)*2,sa=.40+.20*(b-.5)*2,l=.60+.11*(b-.5)*2;
  for(const B of BEDS)if(y>B.y&&y<B.y+B.h){l+=.05;sa-=.06;}
  const st=fbm(s*.05,y*.0022,9757,3);if(st>.55){l-=(st-.55)*.95;sa-=(st-.55)*.5;h-=.012;}
  const oc=fbm(s*.035+7.7,y*.003,9758,2);if(oc>.58){sa+=(oc-.58)*1.5;h+=.006;l-=(oc-.58)*.25;}
  const tt=clamp(1-y/175,0,1);l+=.05*tt;sa-=.12*tt;
  if(plat){l+=.03;sa-=.08;}
  if(dd){l-=.03;const sc=scar(s,y);if(sc>2){const k=Math.min(1,sc/30);l+=.16*k;sa+=.10*k;h+=.012*k;}}
  const cw=cityW(s);if(cw>0&&y<TOPD&&y>120)l-=.05*cw;
  return _c.setHSL(h,clamp(sa,0,1),clamp(l,.05,.95)).convertSRGBToLinear();};
 // columns: fine on the front, coarse round the back
 const SC=[];{const st=a=>a<ZF+60?6:a<ZF+A1?9:a<ZF+A1+LF?18:34;
  for(let s=-SE;s<SE-1;s+=st(Math.abs(s)))SC.push(s);SC.push(SE);}
 const NU=SC.length-1,NVF=92,NVC=18;
 const TOPS=SC.map(topAt);
 const CAPC=[760,0];
 const capPt=(i,v)=>{const s=SC[i],tp=TOPS[i],E=facePt(s,tp);
  const dist=Math.hypot(CAPC[0]-E[0],CAPC[1]-E[1]);
  const w=Math.pow(v,1.4),x=lerp(E[0],CAPC[0],w),z=lerp(E[2],CAPC[1],w);
  const v0=(40+150*cityW(s))/Math.max(dist,1);
  const y=tp+(876-tp)*sm((w-v0)/.55)+9*(fbm(x*.0045,z*.0045,9754,2)-.5)*2*clamp(w*dist/90,0,1);
  return[x,y,z];};
 {const addCol=(geo,pl)=>{const P=geo.attributes.position,col=new Float32Array(P.count*3),uv=geo.attributes.uv;
   for(let k=0;k<P.count;k++){const i=k%(NU+1),y=P.getY(k),c=rockCol(SC[i],y,pl);
    col[k*3]=c.r;col[k*3+1]=c.g;col[k*3+2]=c.b;
    if(pl)uv.setXY(k,P.getX(k)/48,P.getZ(k)/48);else uv.setXY(k,SC[i]/40,y/40);}
   geo.setAttribute('color',new THREE.BufferAttribute(col,3));return geo;};
  const face=gridSurface((u,v)=>{const i=Math.round(u*NU);return facePt(SC[i],v*TOPS[i]);},NU,NVF,{});
  mesh(addCol(face,0),MAT.ldRock,G);
  const cap=gridSurface((u,v)=>capPt(Math.round(u*NU),v),NU,NVC,{});
  mesh(addCol(cap,1),MAT.ldRock,G);}

 // ============================================================ GEOMETRY HELPERS
 const mk=T=>({P:[],U:[],T:T});
 const A_FASC=mk(16),A_DECK=mk(16),A_SOFF=mk(16),A_WIN=mk(1),A_SECT=mk(16),A_VOID=mk(16);
 const tri=(A,a,b,c,ua,ub,uc)=>{A.P.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2]);
  A.U.push(ua[0],ua[1],ub[0],ub[1],uc[0],uc[1]);};
 const pUV=(A,p,ax)=>ax===1?[p[0]/A.T,p[2]/A.T]:ax===0?[p[2]/A.T,p[1]/A.T]:[p[0]/A.T,p[1]/A.T];
 const quadW=(A,a,b,c,e)=>{const u1=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],u2=[e[0]-a[0],e[1]-a[1],e[2]-a[2]];
  let nx=Math.abs(u1[1]*u2[2]-u1[2]*u2[1]),ny=Math.abs(u1[2]*u2[0]-u1[0]*u2[2]),nz=Math.abs(u1[0]*u2[1]-u1[1]*u2[0]);
  if(nx+ny+nz<1e-9){const w1=[c[0]-b[0],c[1]-b[1],c[2]-b[2]];
   nx=Math.abs(u1[1]*w1[2]-u1[2]*w1[1]);ny=Math.abs(u1[2]*w1[0]-u1[0]*w1[2]);nz=Math.abs(u1[0]*w1[1]-u1[1]*w1[0]);}
  const ax=ny>=nx&&ny>=nz?1:nx>=nz?0:2;
  const ua=pUV(A,a,ax),ub=pUV(A,b,ax),uc=pUV(A,c,ax),ue=pUV(A,e,ax);
  tri(A,a,b,c,ua,ub,uc);tri(A,a,c,e,ua,uc,ue);};
 const FACES=[[0,1,2,3,'b'],[4,7,6,5,'t'],[0,4,5,1,'z0'],[1,5,6,2,'x1'],[2,6,7,3,'z1'],[3,7,4,0,'x0']];
 const hexa=(c,R)=>{for(const f of FACES){const A=R[f[4]];if(A)quadW(A,c[f[0]],c[f[1]],c[f[2]],c[f[3]]);}};
 const box=(x0,x1,y0,y1,z0,z1,R)=>hexa([[x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1],
  [x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1]],R);
 const rotHexa=(C,S,Q,R)=>{const c=[];
  for(const [sx,sy,sz] of [[-1,-1,-1],[1,-1,-1],[1,-1,1],[-1,-1,1],[-1,1,-1],[1,1,-1],[1,1,1],[-1,1,1]]){
   const v=new THREE.Vector3(sx*S[0]/2,sy*S[1]/2,sz*S[2]/2).applyQuaternion(Q);c.push([C[0]+v.x,C[1]+v.y,C[2]+v.z]);}
  hexa(c,R);return c;};
 // a window wall: n whole storeys between yd and yt, 6.4 m bays
 const winX=(x,z0,z1,yd,yt,off,A)=>{const n=Math.max(1,Math.round((yt-yd)/4.6)),SH=(yt-yd)/n;
  const U=z=>z/51.2+off[0],V=y=>(y-yd)/SH/8+off[1];
  const a=[x,yd,z0],b=[x,yd,z1],c=[x,yt,z1],e=[x,yt,z0];
  tri(A||A_WIN,a,b,c,[U(z0),V(yd)],[U(z1),V(yd)],[U(z1),V(yt)]);tri(A||A_WIN,a,c,e,[U(z0),V(yd)],[U(z1),V(yt)],[U(z0),V(yt)]);};
 const winZ=(z,x0,x1,yd,yt,off)=>{const n=Math.max(1,Math.round((yt-yd)/4.6)),SH=(yt-yd)/n;
  const U=x=>x/51.2+off[0],V=y=>(y-yd)/SH/8+off[1];
  const a=[x0,yd,z],b=[x1,yd,z],c=[x1,yt,z],e=[x0,yt,z];
  tri(A_WIN,a,b,c,[U(x0),V(yd)],[U(x1),V(yd)],[U(x1),V(yt)]);tri(A_WIN,a,c,e,[U(x0),V(yd)],[U(x1),V(yt)],[U(x0),V(yt)]);};
 const finish=(A,mat)=>{if(!A.P.length)return;const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(A.P,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(A.U,2));
  g.computeVertexNormals();mesh(g,mat,G);};

 // ---- palette -----------------------------------------------------------------
 const stone=()=>new THREE.Color().setHSL(rr(.08,.11),rr(.10,.20),dd?rr(.48,.58):rr(.74,.84));
 const stoneD=()=>new THREE.Color().setHSL(rr(.07,.10),rr(.08,.16),dd?rr(.34,.42):rr(.56,.64));
 const shadeC=()=>new THREE.Color().setHSL(rr(.07,.10),rr(.02,.06),dd?rr(.24,.30):rr(.42,.52));
 const leafC=()=>new THREE.Color().setHSL(rr(.17,.30),rr(.20,.45),dd?rr(.16,.28):rr(.22,.36));
 const scrubC=()=>new THREE.Color().setHSL(rr(.12,.22),rr(.18,.34),rr(.20,.32));
 const mossC=()=>new THREE.Color().setHSL(rr(.20,.30),rr(.3,.5),rr(.06,.13));
 const rockC=()=>new THREE.Color().setHSL(rr(.06,.09),rr(.30,.45),rr(.30,.46));
 const WARMW=new THREE.Color(0xffc27a);
 const person=(x,y,z)=>{kput('figB',[x,y,z],qEuler(0,rng()*TAU,0),1,new THREE.Color().setHSL(rr(0,.12),rr(.2,.55),rr(.22,.5)));
  kput('figH',[x,y,z],null,1,new THREE.Color(0xc9a17e));};
 const plant=(x,y,z,h)=>{kput('trunk',[x,y,z],qEuler(rr(-.05,.05),rng()*TAU,rr(-.05,.05)),
   [h*.16,h*.72,h*.16],new THREE.Color().setHSL(rr(.05,.10),rr(.2,.4),rr(.14,.28)));
  const s0=h*rr(.28,.40);
  kput('leafCard',[x+rr(-.06,.06)*h,y+h*.72,z+rr(-.06,.06)*h],qEuler(rr(-.07,.07),rng()*TAU,rr(-.07,.07)),[s0,s0*rr(.7,1.05),s0],leafC());};
 const scrub=(x,y,z,s)=>kput('leafCard',[x,y+s*.35,z],qEuler(rr(-.1,.1),rng()*TAU,rr(-.1,.1)),[s,s*rr(.45,.7),s],scrubC());
 const ldRing=(x,z,r0,r1,n,sM)=>{for(let q=0;q<n;q++){const a=rng()*TAU,t=Math.pow(rng(),2.2),r=lerp(r0,r1,t),sc=rr(.6,sM)*(1.25-.55*t);
  kput('rubble',[x+r*Math.cos(a),(1-t)*(1-t)*sM*.5+sc*.35,z+r*Math.sin(a)],qEuler(rng()*3,rng()*3,rng()*3),[sc*rr(.7,1.5),sc*rr(.5,1),sc*rr(.7,1.5)],
   rng()<.5?stoneD():new THREE.Color().setHSL(rr(.06,.09),rr(.15,.3),rr(.26,.38)));}};
 const rebar=(p,dir,L)=>{const e=[p[0]+dir[0]*L,p[1]+dir[1]*L-rr(0,L*.35),p[2]+dir[2]*L];
  beam('ldRebar',p,e,.3,.3,null);};

 // ============================================================ THE CITY
 const fascM=dd?MAT.ldFascR:MAT.ldFasc,deckM=dd?MAT.ldDeckR:MAT.ldDeck,soffM=dd?MAT.ldSoffR:MAT.ldSoff;
 const winM=dd?MAT.ldWinR:MAT.ldWin;
 const effR=b=>!dd?b.R:b.zone==='cake'?0:b.zone&&b.zone!=='cakeBase'?Math.min(b.R,b.cut):b.R;
 const layerAt=i=>i<0?null:i<NL?LAY[i]:i===NL?ROOF:null;
 const reachAt=(i,z)=>{const L=layerAt(i);if(!L)return 0;
  for(const b of L.B)if(z>=b.z0&&z<b.z1)return effR(b);return 0;};
 const blockAt=(i,z)=>{const L=layerAt(i);if(!L)return null;for(const b of L.B)if(z>=b.z0&&z<b.z1)return b;return null;};
 const FRACT=[];                               // fracture edges, for the rebar and the rubble
 let NFIG=0,NPOST=0,NFIN=0;
 const ALL=LAY.concat([ROOF]);
 for(const L of ALL){const isRoof=L===ROOF;
  for(let k=0;k<L.B.length;k++){const b=L.B[k];
   const R=effR(b);if(R<=0)continue;
   const cut=dd&&R<b.R-.5;
   const yb=L.y-b.drop;
   // ---- the slab
   box(-R,XR,yb,L.deck,b.z0,b.z1,{b:A_SOFF,t:A_DECK,z0:A_FASC,z1:A_FASC,x0:A_FASC});
   if(cut)FRACT.push({x:-R,y0:yb,y1:L.deck,z0:b.z0,z1:b.z1,i:L.i,roof:isRoof});
   // ---- the rooms
   if(!isRoof&&!(dd&&b.zone==='cakeBase')){
    const rf=cut?Math.max(2,R-2-4*b.r3):b.rf;
    if(rf>3){const yt=L.top;
     if(cut){box(-rf,XR,L.deck,yt,b.z0,b.z1,{x0:A_SECT,t:A_DECK});
      winZ(b.z0,-rf,XR,L.deck,yt,b.off);winZ(b.z1,-rf,XR,L.deck,yt,b.off);}
     else{winX(-rf,b.z0,b.z1,L.deck,yt,b.off);
      if(!dd){const ns=Math.max(1,Math.round((yt-L.deck)/4.6)),SH=(yt-L.deck)/ns,QG=qFacing([-1,0,0]);
       for(let z=b.z0+3.2;z<b.z1-3;z+=6.4)for(let k2=0;k2<ns;k2++)if(rng()<.3)
        kput('ldGlow',[-rf-.35,L.deck+(k2+.55)*SH,z],QG,[rr(4.5,5.8),SH*.6,1],WARMW.clone().multiplyScalar(rr(.45,1)));}
      winZ(b.z0,-rf,XR,L.deck,yt,b.off);winZ(b.z1,-rf,XR,L.deck,yt,b.off);
      box(-rf,XR,yt-.01,yt,b.z0,b.z1,{t:A_DECK});
      // bays pushed out into the gallery
      if(b.r1<.28&&b.R-b.rf>4){const w=Math.min(b.z1-b.z0-4,rr(8,22)),zc=rr(b.z0+2+w/2,b.z1-2-w/2),xf=-(b.R-rr(1.2,2.4));
       winX(xf,zc-w/2,zc+w/2,L.deck,yt,b.off);winZ(zc-w/2,xf,-rf,L.deck,yt,b.off);winZ(zc+w/2,xf,-rf,L.deck,yt,b.off);}}}}
   // ---- what is on the gallery
   const w=b.z1-b.z0;
   if(!cut){
    // the parapet on the edge, and along any side edge a neighbour does not cover
    if(!(dd&&b.r2<.35))kput('ldBox',[-(R-.45),L.deck+.8,b.zm],null,[.9,1.6,w],stone());
    for(const [zz,nb] of [[b.z0,L.B[k-1]],[b.z1,L.B[k+1]]]){const Rn=nb?effR(nb):0;const x0=Math.max(Rn,isRoof?0:b.rf);
     if(R-x0>1.5&&!(dd&&rng()<.4))kput('ldBox',[-(R+x0)/2,L.deck+.8,zz+(zz===b.z0?.45:-.45)],null,[R-x0,1.6,.9],stone());}
    if(!isRoof){
     // loggia posts, where the slab above covers the gallery
     const up=reachAt(L.i+1,b.zm);
     if(up>=R-1)for(let z=b.z0+rr(3,7);z<b.z1-2;z+=rr(10,14)){if(dd&&rng()<.35)continue;
      kput('ldBox',[-(R-1.5),(L.deck+L.top)/2,z],null,[.9,L.top-L.deck,.9],stone());NPOST++;}
     // lamp strips in the gallery ceiling
     const ab=blockAt(L.i+1,b.zm);
     if(!dd&&up>=R-1&&b.r3<.55)kput('strip',[-(R-(R-b.rf)*.5),L.top-(ab?ab.drop:0)-.3,b.zm],qEuler(0,Math.PI/2,0),[w-4,2.2,2.2],WARMW);
     // planters
     if(b.r3>.7-.25*L.i/NL&&!dd)kput('hedge',[-(R-1.6),L.deck+.5,b.zm],null,[1.3,1,w*.8],leafC());
     // people along the edge: thicker up the stack, where the views are
     const nP=dd?(rng()<.04?1:0):Math.round(w/(26-12*L.i/NL)*rr(.5,1.3));
     for(let j2=0;j2<nP;j2++){person(-(R-rr(1.1,Math.max(1.4,R-b.rf-1))),L.deck,rr(b.z0+1,b.z1-1));NFIG++;}}}
   // ---- the underside: the strip of this soffit that the layer below leaves open
   const Rb=reachAt(L.i-1,b.zm),sw=R-Rb;
   if(sw>3){
    for(let z=b.z0+rr(2,5);z<b.z1-1.5;z+=rr(6.5,9)){if(dd&&rng()<.2)continue;
     const fd=rr(1.4,2.8);kput('ldBox',[-(Rb+R)/2,yb-fd/2,z],null,[sw-.6,fd,rr(.8,1.3)],shadeC());NFIN++;}
    if(b.r2<.45){const pd=Math.min(sw-1,rr(6,16)),ph=rr(3,9),pw=Math.min(w-3,rr(6,20));
     if(pd>2&&pw>2)kput('ldBox',[-(R-pd/2-rr(.5,3)),yb-ph/2,rr(b.z0+pw/2+1,b.z1-pw/2-1)],null,[pd,ph,pw],shadeC());}
    if(dd&&b.r3<.5){for(let j2=0;j2<3;j2++){const hw2=rr(3,10),hd=Math.min(sw-1,rr(3,9));
     if(hd>1.5)kput('ldDim',[-(Rb+R)/2+rr(-sw*.3,sw*.3),yb-.12,rr(b.z0+hw2,b.z1-hw2)],null,[hd,.3,hw2*1.6],null);}}}
   // ---- haunches at the ends of a slab that overhangs the one below it in z
   if(!isRoof&&(k===0||k===L.B.length-1)){const Lb=layerAt(L.i-1);
    const zE=k===0?b.z0:b.z1,zIn=Lb?(k===0?Lb.za:Lb.zb):(k===0?b.z1:b.z0);
    const over=k===0?zIn-zE:zE-zIn;
    if(over>4){const Hh=Math.min(L.i>0?(L.y-LAY[L.i-1].deck)*.75:24,.1*R+4),Lh=R*.5,ww=Math.min(over,9);
     const za=k===0?zE:zE-ww,zb=za+ww;
     hexa([[-Lh,yb,za],[XR*.2,yb-Hh,za],[XR*.2,yb-Hh,zb],[-Lh,yb,zb],[-Lh,yb,za],[XR*.2,yb,za],[XR*.2,yb,zb],[-Lh,yb,zb]],
      {b:A_SOFF,z0:A_FASC,z1:A_FASC});}}
  }}
 // ---- the lowest layer has nothing under it: brackets all along
 {const L=LAY[0];for(let z=L.za+8;z<L.zb-6;z+=rr(16,24)){const R=reachAt(0,z);if(R<10)continue;const Hh=16,Lh=R*.7;
  hexa([[-Lh,L.y,z-1.2],[12,L.y-Hh,z-1.2],[12,L.y-Hh,z+1.2],[-Lh,L.y,z+1.2],[-Lh,L.y,z-1.2],[12,L.y,z-1.2],[12,L.y,z+1.2],[-Lh,L.y,z+1.2]],
   {b:A_SOFF,z0:A_FASC,z1:A_FASC});}}
 // ---- stairs up the ends of every layer, inside the gallery
 for(let i=0;i<NL-1;i++){const L=LAY[i],rise=LAY[i+1].deck-L.deck,run=rise*1.25;
  for(const k of [0,L.B.length-1]){const b=L.B[k],R=effR(b);if(R<=0||(dd&&(R<b.R-.5||rng()<.35)))continue;
   const gw=R-b.rf;if(gw<4||b.z1-b.z0<run+6)continue;
   const sw2=Math.min(3.4,gw-1.6),x=-(b.rf+gw*.5);
   if(k===0)kput('ldStair',[x,L.deck,b.z0+2.5],null,[sw2,rise,run],stoneD());
   else kput('ldStair',[x,L.deck,b.z1-2.5],qEuler(0,Math.PI,0),[sw2,rise,run],stoneD());}}
 // ---- struts: raking props from the rock into the undersides of the wide upper
 // layers where they overhang the ends of the stack, and king struts under the prow
 const STRUT=[];
 for(let i=6;i<NL;i+=3){const L=LAY[i];
  for(const e of [0,1]){const b=e?L.B[L.B.length-1]:L.B[0],R=effR(b);if(R<40)continue;
   const z=e?b.z1-5:b.z0+5,xa=-R*.55,ya=L.y-b.drop,drop=Math.min(ya-60,R*.75),yb2=ya-drop;
   if(LAY.some(L2=>L2.i<i&&L2.top>yb2&&z>L2.za-4&&z<L2.zb+4))continue;
   const xr=faceX(z,yb2)+8;
   if(dd&&e===1&&i>=10&&i<=19)continue;
   beam('ldBox',[xa,ya,z],[xr,yb2,z],3.2,3.2,stoneD());STRUT.push([xa,ya,z]);
   kput('ldBox',[xr-2,yb2,z],null,[6,6,6],stoneD());}}
 if(!dd){const top=LAY[NL-6];
  for(const zz of [GC-70,GC,GC+70]){const b=blockAt(NL-6,zz),lo=blockAt(NL-14,zz);if(!b||!lo)continue;
   const a=[-(b.R-24),top.y-b.drop,zz],e=[-(lo.R-6),LAY[NL-14].deck+.5,zz];
   beam('ldBox',a,e,4,4,stoneD());kput('ldBox',[e[0],e[1]+2,e[2]],null,[7,4,7],stoneD());}}
 else{// the king struts, snapped: stubs hanging from the lower anchors
  for(const zz of [GC-70,GC+70]){const lo=blockAt(NL-14,zz);if(!lo)continue;
   const e=[-(effR(lo)-6),LAY[NL-14].deck+.5,zz];beam('ldBox',e,[e[0]-18,e[1]+42,zz+rr(-4,4)],4,4,stoneD());}}

 // ============================================================ THE TOP DECK: gardens
 {const L=ROOF;let nT=0;
  for(const b of L.B){const R=effR(b);if(R<=0)continue;const w=b.z1-b.z0;
   // lawns and planting beds, set back from the parapet
   for(let x=-R+8;x<-14;x+=rr(22,40)){const lw=rr(12,26),lz=Math.min(w-6,rr(10,30));if(lz<4)continue;
    if(rng()<.6)kput('ldLawn',[x-lw/2+rr(-3,3),L.deck+.25,b.zm+rr(-2,2)],null,[lw,.5,lz],dd?new THREE.Color().setHSL(rr(.12,.2),rr(.2,.35),rr(.18,.26)):new THREE.Color().setHSL(rr(.22,.28),rr(.35,.5),rr(.28,.36)));}
   const nt=Math.round(w*R/(dd?650:900));
   for(let j2=0;j2<nt;j2++){plant(rr(-R+4,-6),L.deck,rr(b.z0+2,b.z1-2),dd?rr(5,14):rr(4,13));nT++;}
   for(let j2=0;j2<Math.round(w*R/500);j2++)kput('hedge',[rr(-R+6,-8),L.deck+.6,rr(b.z0+3,b.z1-3)],qEuler(0,rr(-.3,.3),0),[rr(4,14),1.2,rr(1.5,3)],leafC());
   if(!dd){const np=Math.round(w*R/900);for(let j2=0;j2<np;j2++){person(rr(-R+2,-4),L.deck,rr(b.z0+1,b.z1-1));NFIG++;}
    // people lining the prow's edge
    if(b.zone==='prow')for(let z=b.z0+1;z<b.z1-1;z+=rr(2,5)){person(-(R-rr(1,2.2)),L.deck,z);NFIG++;}}
   else for(let j2=0;j2<Math.round(w*R/260);j2++)scrub(rr(-R+2,-2),L.deck,rr(b.z0+1,b.z1-1),rr(1.5,5));}
  // pavilions: low blocks with lit bands
  for(let j2=0;j2<14;j2++){const b=L.B[Math.floor(rng()*L.B.length)],R=effR(b);if(R<60)continue;
   const x=rr(-R+30,-30),z=rr(b.z0+8,b.z1-8),pw=rr(14,28),pd=rr(12,24),ph=rr(5,8);
   if(dd&&rng()<.5){kput('ldBox',[x,L.deck+1.5,z],qEuler(0,rr(-.2,.2),0),[pw,3,pd],stoneD());continue;}
   kput('ldBox',[x,L.deck+ph/2,z],null,[pw,ph,pd],stone());
   kput('ldBox',[x,L.deck+ph+.4,z],null,[pw+3,.8,pd+3],stoneD());
   if(!dd)kput('strip',[x-pd/2-.2,L.deck+ph*.5,z],qEuler(0,Math.PI/2,0),[pw-2,6,6],WARMW);}}

 // ============================================================ CORES
 // Lift shafts in slots cut into the rock, running from the talus to head houses
 // on the plateau, bridged across to the layer ends as they pass them.
 for(const C of CORES){let mo=-1e9;
  for(let y=180;y<TOPD;y+=20)for(const dz of [-C.w/2-6,0,C.w/2+6])mo=Math.max(mo,disp(C.z+dz,y));
  const xf=-(mo+6),z0=C.z-C.w/2,z1=C.z+C.w/2,tp=topAt(C.z);
  const snapped=dd&&C.z>480;const ytop=snapped?560:tp+18;
  C.xf=xf;C.top=ytop;
  box(xf+3,XR,0,Math.min(tp+2,ytop),z0-6,z1+6,{x0:A_VOID,z0:A_VOID,z1:A_VOID,t:A_VOID});
  box(xf,XR,0,ytop,z0,z1,{x0:A_FASC,z0:A_FASC,z1:A_FASC,t:snapped?A_SECT:A_DECK});
  winX(xf-.4,C.z-5,C.z+5,0,ytop-3,[.25,0]);
  for(let y=40;y<ytop-10;y+=41)kput('ldBox',[xf-.8,y,C.z],null,[1.6,1.6,C.w+1],stoneD());
  if(!snapped){box(xf-4,xf+46,tp-.5,tp+22,C.z-18,C.z+18,{x0:A_FASC,z0:A_FASC,z1:A_FASC,x1:A_FASC,t:A_DECK});
   winX(xf-4.4,C.z-15,C.z+15,tp+4,tp+18,[.5,.25]);}
  else{for(let j2=0;j2<30;j2++)kput('rubble',[xf+rr(-60,4),rr(0,8),C.z+rr(-40,40)],qEuler(rng()*3,rng()*3,rng()*3),[rr(2,7),rr(1.5,5),rr(2,7)],stoneD());}
  // bridges to the layer ends it passes
  for(const L of LAY){const e=Math.abs(L.za-C.z)<Math.abs(L.zb-C.z)?0:1,zE=e?L.zb:L.za;
   const gap=e?C.z-C.w/2-zE:zE-(C.z+C.w/2);if(gap<2||gap>70||L.deck>ytop)continue;
   const b=e?L.B[L.B.length-1]:L.B[0],R=effR(b);if(R<12||(dd&&rng()<.4))continue;
   const zc=e?zE+gap/2:zE-gap/2,xb=-Math.min(R-3,Math.max(8,-xf+6));
   kput('ldBox',[xb,L.deck-.7,zc],null,[6,1.4,gap+2],stoneD());
   kput('ldBox',[xb-3,L.deck+.6,zc],null,[.4,1.2,gap+2],stone());}}
 // the central lobby at the foot, where the road arrives
 {const tp=0;box(-78,-8,tp,28,-46,46,{x0:A_FASC,z0:A_FASC,z1:A_FASC,t:A_DECK});
  box(-40,XR,0,LAY[0].y+2,-15,15,{x0:A_FASC,z0:A_FASC,z1:A_FASC});
  winX(-40.4,-9,9,28,LAY[0].y,[0,.5]);
  winX(-78.4,-44,-12,4,24,[.375,.125]);winX(-78.4,12,44,4,24,[.625,.375]);
  kput('ldDim',[-78.5,6.5,0],null,[1.2,13,20],null);
  kput('ldBox',[-84,14.5,0],null,[14,1.6,30],stoneD());
  if(!dd)kput('strip',[-79.5,13,0],qEuler(0,Math.PI/2,0),[20,4,4],WARMW);}

 // ============================================================ CAVE ROOMS IN THE ROCK
 // The city keeps going into the cliff beyond the ends of the stack: dark
 // openings with a lintel and a sill, in a band either side of it.
 {let n=0;
  const opening=(z,yb,ow,oh)=>{let mo=-1e9;for(const dz of [-ow/2,0,ow/2])for(const dy of [0,oh/2,oh])mo=Math.max(mo,disp(z+dz,yb+dy));
   for(const C of CORES)if(Math.abs(z-C.z)<C.w/2+ow/2+10)return;
   const xf=-mo-.5;kput('ldDim',[xf+14,yb+oh/2,z],null,[28,oh,ow],null);
   kput('ldBox',[xf-.6,yb+oh+.6,z],null,[2.4,1.2,ow+2],stoneD());
   kput('ldBox',[xf-1.4,yb-.4,z],null,[4.8,.8,ow+2],stoneD());
   if(!dd&&rng()<.3)kput('strip',[xf-.2,yb+oh*.4,z],qEuler(0,Math.PI/2,0),[ow*.7,oh*2,2],WARMW);
   n++;};
  for(const L of LAY){for(const e of [0,1]){let z=e?L.zb+rr(8,20):L.za-rr(8,20);
    for(let q=0;q<2;q++){const ow=rr(10,24);z+=e?ow/2:-ow/2;
     if(Math.abs(z)<ZF-60&&rng()<.6)opening(z,L.deck+1,ow,(L.top-L.deck)*rr(.5,.75));
     z+=e?ow/2+rr(6,30):-ow/2-rr(6,30);}}}
  // cliff dwellings: rows of rooms along three of the hard beds either side,
  // each row with a walkway cut along the bed in front of it
  for(const sg of [-1,1]){const beds=BEDS.filter(B=>B.y>240&&B.y<760);
   for(let q=0;q<Math.min(3,beds.length);q++){const B=beds[Math.floor((q+.5)*beds.length/3)];
    for(let z=545;z<770;){const ow=rr(9,16),st=ow+rr(6,16);
     opening(sg*(z+ow/2),B.y+B.h+1,ow,rr(7,11));
     const zz=sg*(z+st/2),xw=faceX(zz,B.y+B.h)-1.8;
     kput('ldBox',[xw,B.y+B.h+.3,zz],null,[4,1,st+.4],stoneD());
     if(!dd&&rng()<.25){person(xw-.5,B.y+B.h+.8,zz+rr(-3,3));NFIG++;}
     z+=st;}}}}

 // ============================================================ THE CLIFF DRESSING
 // Talus boulders, scrub on the ledges and the cliff top, the plateau.
 for(let j2=0;j2<700;j2++){const s=rr(-ZF-A1,ZF+A1),y=Math.pow(rng(),1.5)*150,P=perim(s),o=disp(s,y),sc=rr(1.5,9)*(1-y/260);
  kput('rubble',[P.x+P.nx*(o+sc*.2),y+sc*.3,P.z+P.nz*(o+sc*.2)],qEuler(rng()*3,rng()*3,rng()*3),[sc*rr(.8,1.5),sc*rr(.5,.9),sc*rr(.8,1.5)],rockC());}
 for(let j2=0;j2<900;j2++){const s=rr(-ZF-A1-LF,ZF+A1+LF);const B=BEDS[Math.floor(rng()*BEDS.length)];
  const y=rng()<.55?B.y+B.h+rr(0,2):rr(170,TOPB);if(cityW(s)>.2&&y>140&&y<TOPD+5)continue;
  const P=perim(s),o=disp(s,y)+.8;scrub(P.x+P.nx*o,y,P.z+P.nz*o,rr(1.5,5));}
 for(let j2=0;j2<(dd?1800:1300);j2++){const i=Math.floor(rng()*NU),v=Math.pow(rng(),1.3)*.9,p=capPt(i,v);
  if(cityW(SC[i])>.5&&v<.18)continue;
  scrub(p[0],p[1]-.3,p[2],rr(1.8,dd?7:5.5));}
 for(let j2=0;j2<260;j2++){const i=Math.floor(rng()*NU),v=rng()*.85,p=capPt(i,v),sc=rr(2,8);
  kput('rubble',[p[0],p[1]+sc*.15,p[2]],qEuler(rng()*3,rng()*3,rng()*3),[sc*rr(.8,1.4),sc*rr(.4,.8),sc*rr(.8,1.4)],rockC());}
 // a road over the plateau to the top deck, and people walking out on it
 {let ir=0;while(ir<NU&&SC[ir]<40)ir++;
  const RD=[];for(let v=.02;v<.97;v+=.012)RD.push(capPt(ir,v));
  for(let k=0;k<RD.length-1;k++){const a=RD[k],e=RD[k+1],L=Math.hypot(e[0]-a[0],e[2]-a[2]);
   kput('ldBox',[(a[0]+e[0])/2,(a[1]+e[1])/2-.9,(a[2]+e[2])/2],qEuler(0,-Math.atan2(e[2]-a[2],e[0]-a[0]),0),[L+1,2.2,12],dd?stoneD():new THREE.Color().setHSL(.08,.14,.52));
   if(!dd&&k%2===0)for(let q=0;q<3;q++){person((a[0]+e[0])/2+rr(-4,4),(a[1]+e[1])/2+.25,(a[2]+e[2])/2+rr(-4,4));NFIG++;}}}

 // ============================================================ THE FOOT: the road and the town
 const toe=z=>disp(z,0);
 const inDebris=(x,z)=>dd&&((x>-640&&x<-170&&z>-330&&z<140)||(x>-420&&z>150&&z<420));
 // the approach road, 22 m wide, from the plain to the lobby
 {const RL=-2600;
  const hole=dd?(u,v)=>fbm(u*40,v*3,9760,2)<.37:null;
  const road=gridSurface((u,v)=>[lerp(RL,-78,u),.3,lerp(-11,11,v)],60,2,{uS:(2600-78)/24,vS:1,hole:hole});
  mesh(road,dd?MAT.ldPaveR:MAT.ldPave,G);
  const plaza=gridSurface((u,v)=>[lerp(-330,-78,u),.28,lerp(-95,95,v)],8,6,{uS:10,vS:8});
  mesh(plaza,dd?MAT.ldPaveR:MAT.ldPave,G);
  for(let x=RL+10;x<-340;x+=22){for(const sz of [-1,1]){if(dd&&rng()<.5)continue;
   kput('ldBox',[x,.7,sz*12],null,[20,1,1.2],stoneD());
   if(rng()<(dd?.3:.8))plant(x+rr(-4,4),.3,sz*rr(16,20),dd?rr(4,9):rr(7,11));}}
  if(!dd){for(let j2=0;j2<260;j2++)person(rr(-1400,-90),.3,rr(-9,9)),NFIG++;
   for(let j2=0;j2<200;j2++)person(rr(-320,-85),.3,rr(-90,90)),NFIG++;
   for(let j2=0;j2<20;j2++){const x=rr(-2200,-400);kput('ldBox',[x,1.6,rr(-8,8)],null,[rr(5,9),2.6,3],new THREE.Color().setHSL(rr(0,.12),rr(.3,.6),rr(.35,.55)));}}
  // the fountain court in the plaza
  kput('ldBox',[-200,.9,0],null,[40,1.2,40],stoneD());
  if(!dd)kput('ldLawn',[-200,1.3,0],null,[36,.4,36],new THREE.Color(0x4a6f86));
  for(let j2=0;j2<16;j2++){const a=j2/16*TAU;plant(-200+Math.cos(a)*34,.3,Math.sin(a)*34,rr(7,10));}}
 // the town: flat-roofed houses on a loose grid, densest at the foot of the cliff
 let NHOUSE=0;
 for(let x=-1180;x<-150;x+=rr(24,32))for(let z=-760;z<760;z+=rr(22,30)){
  if(Math.abs(z)<24)continue;if(x>-340&&Math.abs(z)<104)continue;
  const tz=toe(z);if(x>-tz-30)continue;
  const p=.95*Math.exp(-Math.pow((x+380)/420,2))*(1-clamp((Math.abs(z)-560)/200,0,1));
  if(rng()>p)continue;
  if(inDebris(x,z)||(dd&&rng()<.45))continue;
  const w=rr(10,19),dp=rr(10,17),h=dd?rr(3,7):rr(5,12),xx=x+rr(-3,3),zz=z+rr(-3,3),
   col=new THREE.Color().setHSL(rr(.055,.10),rr(.22,.42),dd?rr(.30,.42):rr(.42,.60));
  kput('ldBox',[xx,h/2,zz],null,[w,h,dp],col);NHOUSE++;
  if(dd){kput('ldDim',[xx,h-.3,zz],null,[w-1.6,.8,dp-1.6],null);}
  else{if(rng()<.38){const w2=w*rr(.4,.7),d2=dp*rr(.4,.7),h2=rr(3,5);kput('ldBox',[xx+rr(-1,1)*(w-w2)/2,h+h2/2,zz+rr(-1,1)*(dp-d2)/2],null,[w2,h2,d2],col);}
   kput('ldBox',[xx,h+.35,zz],null,[w+.4,.7,dp+.4],stoneD());}
  const sz=z>0?-1:1;kput('ldDim',[xx+rr(-w/4,w/4),1.6,zz+sz*(dp/2+.05)],null,[2,3.2,.3],null);
  if(!dd&&rng()<.5)kput('ldDim',[xx-w/2-.05,h*.6,zz+rr(-dp/4,dp/4)],null,[.3,1.6,2.4],null);
  if(rng()<(dd?.25:.4))plant(xx+rr(-1,1)*(w/2+5),.2,zz+rr(-1,1)*(dp/2+4),dd?rr(4,11):rr(6,10));
  if(!dd&&rng()<.6)for(let q=0;q<2;q++){person(xx+rr(-w,w),.2,zz+sz*(dp/2+rr(2,6)));NFIG++;}}
 // orchards out on the plain
 for(let j2=0;j2<(dd?150:320);j2++){const x=rr(-1900,-1150),z=rr(-700,700);if(Math.abs(z)<30)continue;plant(x,0,z,dd?rr(4,9):rr(5,8));}

 // ============================================================ THE RUIN
 if(dd){
  // ---- every fracture front: reinforcement out, rubble along the deck, streaks
  for(const F of FRACT){const w=F.z1-F.z0;
   for(let z=F.z0+1;z<F.z1-.5;z+=rr(2.2,4.5)){if(rng()<.3)continue;
    rebar([F.x,lerp(F.y0,F.y1,rr(.2,.8)),z],[-1,rr(-.25,.1),rr(-.2,.2)],rr(1.5,8));}
   for(let j2=0;j2<Math.round(w/5);j2++)kput('rubble',[F.x+rr(1,6),F.y1+rr(.2,1),rr(F.z0+1,F.z1-1)],qEuler(rng()*3,rng()*3,rng()*3),[rr(.8,2.6),rr(.5,1.6),rr(.8,2.6)],stoneD());
   if(rng()<.6)kput('stain',[F.x-.4,F.y0-rr(4,12),rr(F.z0+2,F.z1-2)],qFacing([-1,0,0]),[rr(3,9),rr(10,30),1],null);}
  // ---- the pancake: seven layers down onto the eighth, draped over its edge
  {const base=LAY[20];const cz=base.B.filter(b=>b.zone==='cakeBase');
   if(cz.length){const z0=cz[0].z0,z1=cz[cz.length-1].z1,R20=Math.min(...cz.map(b=>b.R));
    let y=base.deck+.3;
    for(let k2=0;k2<7;k2++){const L=LAY[21+k2],t=L.t*.85;
     const Rk=Math.max(R20+10,...L.B.filter(b=>b.zone==='cake').map(b=>b.R));
     box(-R20,XR,y,y+t,z0+rr(-3,3),z1+rr(-3,3),{b:A_SOFF,t:A_DECK,z0:A_SECT,z1:A_SECT,x0:A_SECT});
     // the crushed rooms between plates
     if(k2<6)box(-R20+2,XR,y+t,y+t+1.6,z0+2,z1-2,{x0:A_SECT});
     // the outer part, hinged at the lower layer's edge and hanging over it, in strips
     let zz=z0;while(zz<z1-4){const zw=Math.min(z1-zz,rr(22,46)),th=rr(.35,.85)-k2*.04,Lk=(Rk-R20)*rr(.75,1.02);
      const hx=-R20,hy=y+t,ca=Math.cos(th),sa=Math.sin(th);
      const P=(dx,dy,z)=>[hx+dx*ca-dy*sa,hy+dx*sa+dy*ca,z];
      hexa([P(-Lk,-t,zz),P(0,-t,zz),P(0,-t,zz+zw),P(-Lk,-t,zz+zw),P(-Lk,0,zz),P(0,0,zz),P(0,0,zz+zw),P(-Lk,0,zz+zw)],
       {b:A_SOFF,t:A_DECK,z0:A_SECT,z1:A_SECT,x0:A_SECT});
      for(let q=0;q<5;q++){const dx=-Lk,e=P(dx,-t/2,zz+rr(1,zw-1));rebar(e,[-ca,-sa,rr(-.2,.2)],rr(2,7));}
      zz+=zw;}
     y+=t+1.6;}
    for(let j2=0;j2<220;j2++)kput('rubble',[-rr(0,R20+8),base.deck+rr(0,y-base.deck),rr(z0,z1)],qEuler(rng()*3,rng()*3,rng()*3),[rr(1,4),rr(.8,3),rr(1,4)],stoneD());
    LD_SITE._cake={z0:z0,z1:z1,y0:base.deck,y1:y,R:R20};}}
  // ---- the great prow, on the town: eight pieces of the stack, each a few
  // layers deep, lying tilted and half-buried, and the smaller wreckage round them
  const CH=[{c:[-420,0,-95],s:[150,62,120],e:[.12,.5,.20]},{c:[-560,0,-10],s:[118,44,92],e:[-.25,1.2,.08]},
   {c:[-330,0,-235],s:[96,70,84],e:[.4,.2,-.3]},{c:[-610,0,-190],s:[84,38,70],e:[.08,-.6,.5]},
   {c:[-270,0,40],s:[70,48,64],e:[-.5,.9,.3]},{c:[-470,0,110],s:[64,30,58],e:[.2,2.1,-.15]},
   {c:[-720,0,-80],s:[50,26,46],e:[.6,.4,.7]},{c:[-380,0,-330],s:[58,34,40],e:[-.3,1.6,.45]}];
  for(const K of CH){const Q=qEuler(K.e[0],K.e[1],K.e[2]);
   let mn=1e9;for(const [sx,sy,sz] of [[-1,-1,-1],[1,-1,-1],[1,-1,1],[-1,-1,1],[-1,1,-1],[1,1,-1],[1,1,1],[-1,1,1]]){
    const v=new THREE.Vector3(sx*K.s[0]/2,sy*K.s[1]/2,sz*K.s[2]/2).applyQuaternion(Q);mn=Math.min(mn,v.y);}
   const C=[K.c[0],-mn*.78,K.c[2]];
   // plates and room bands in the chunk's own frame
   const nP=Math.max(2,Math.round(K.s[1]/19)),ph=K.s[1]/nP;
   // each plate slid and skewed a little on the one under it, as a stack that
   // hit the ground does, and the top plate often gone
   for(let p=0;p<nP;p++){const yl=-K.s[1]/2+p*ph;if(p===nP-1&&p>1&&rng()<.5)continue;
    const Qp=Q.clone().multiply(qEuler(rr(-.07,.07),rr(-.06,.06),rr(-.09,.09))),ox=rr(-.08,.08)*K.s[0],oz=rr(-.08,.08)*K.s[2];
    const sx=K.s[0]*rr(.8,1.05),sz=K.s[2]*rr(.8,1.05);
    const q1=new THREE.Vector3(ox,yl+2.5,oz).applyQuaternion(Q),q2=new THREE.Vector3(ox,yl+2.5+ph/2,oz).applyQuaternion(Q);
    rotHexa([C[0]+q1.x,C[1]+q1.y,C[2]+q1.z],[sx,5,sz],Qp,{b:A_SOFF,t:A_DECK,z0:A_FASC,z1:A_FASC,x0:A_SECT,x1:A_SECT});
    if(p<nP-1)rotHexa([C[0]+q2.x,C[1]+q2.y,C[2]+q2.z],[sx*.86,ph-5,sz*.86],Qp,{z0:A_SECT,z1:A_SECT,x0:A_SECT,x1:A_SECT});}
   for(let q=0;q<24;q++){const v=new THREE.Vector3(rr(-.5,.5)*K.s[0],rr(-.5,.5)*K.s[1],K.s[2]/2).applyQuaternion(Q);
    const n=new THREE.Vector3(0,0,1).applyQuaternion(Q);rebar([C[0]+v.x,C[1]+v.y,C[2]+v.z],[n.x,n.y,n.z],rr(2,9));}
   ldRing(K.c[0],K.c[2],Math.max(K.s[0],K.s[2])*.42,Math.max(K.s[0],K.s[2])*.42+70,110,7);}
  for(let j2=0;j2<260;j2++){const x=rr(-760,-180),z=rr(-360,160);
   kput('ldBox',[x,rr(.5,4),z],qEuler(rr(-.7,.7),rng()*TAU,rr(-.7,.7)),[rr(4,22),rr(1.5,5),rr(3,16)],rng()<.6?stoneD():stone());}
  // the debris trail down the front of the stack under the gash
  for(let i=6;i<NL-6;i++){const L=LAY[i];for(let j2=0;j2<6;j2++){const z=GC+rr(-1,1)*(L.gw||40),R=reachAt(i,z);if(R<10)continue;
   kput('rubble',[-rr(R*.3,R-2),L.deck+rr(.5,2),z],qEuler(rng()*3,rng()*3,rng()*3),[rr(2,6),rr(1.5,4),rr(2,6)],stoneD());}}
  // ---- the sheared layers, on the talus under their stubs
  for(let j2=0;j2<9;j2++){const Q=qEuler(rr(-.5,.5),rr(-.4,.4),rr(-.9,.9)),S=[rr(40,110),rr(5,14),rr(30,80)];
   const c=[rr(-360,-160),S[1]*.45,rr(190,380)];rotHexa(c,S,Q,{b:A_SOFF,t:A_DECK,z0:A_SECT,z1:A_SECT,x0:A_SECT,x1:A_SECT});}
  ldRing(-230,285,20,230,420,9);
  // ---- the rockfall, on the talus and out onto the plain
  for(let j2=0;j2<260;j2++){const z=rr(520,760),x=-toe(z)-rr(-40,260)*Math.pow(rng(),1.3),sc=rr(3,22)*Math.pow(rng(),.7);
   kput('rubble',[x,sc*.35,z],qEuler(rng()*3,rng()*3,rng()*3),[sc*rr(.8,1.5),sc*rr(.6,1),sc*rr(.8,1.5)],rockC());}
  // ---- time: vines off every slab edge, stains down the fascias, scrub on the decks
  for(const L of ALL){for(const b of L.B){const R=effR(b);if(R<=0)continue;const w=b.z1-b.z0;
   for(let j2=0;j2<Math.round(w/9);j2++)if(rng()<.55)kput('vine',[-(R+.3),L.y-b.drop,rr(b.z0+.5,b.z1-.5)],qEuler(rr(-.08,.08),0,rr(-.08,.08)),[rr(1,2.2),rr(4,26),rr(1,2.2)],null);
   for(let j2=0;j2<Math.round(w/14);j2++)kput('stain',[-(R+.35),L.y-b.drop+(L.deck-L.y+b.drop)/2-rr(0,2),rr(b.z0+2,b.z1-2)],qFacing([-1,0,0]),[rr(2,7),rr(6,16),1],null);
   for(let j2=0;j2<Math.round(w/10);j2++){const x=-rr(Math.min(b.rf,R-2),R-.6);if(L===ROOF)continue;scrub(x,L.deck,rr(b.z0+1,b.z1-1),rr(1.2,3.5));}
   if(rng()<.3)kput('moss',[-(R-2),L.deck+.2,b.zm],qEuler(0,rng()*TAU,0),[rr(2,5),.6,rr(3,8)],mossC());}}
  // a few who come to look
  for(let j2=0;j2<30;j2++){person(rr(-900,-300),.3,rr(-8,8));NFIG++;}
 }

 // ============================================================ THE REGISTRY
 const topL=LAY[NL-1],topR=Math.max(...ROOF.B.map(effR));
 REGISTER({name:'The Ledge ('+STATE(d)+')',x:300,z:0,r:1500,h:TOPB+60});
 REGISTER({name:'The Ledge — the cantilevered city',x:-200,z:-20,r:520,y:Y0-20,h:TOPD-Y0+40});
 REGISTER({name:'The Ledge — the upper decks',x:-180,z:GC,r:300,y:LAY[NL-8].y,h:TOPD-LAY[NL-8].y+20});
 if(!dd)REGISTER({name:'The Ledge — the great prow',x:-(topR-70),z:GC,r:90,y:LAY[NL-6].y,h:TOPD-LAY[NL-6].y+20});
 REGISTER({name:'The Ledge — the lower layers',x:-40,z:0,r:280,y:Y0-20,h:LAY[10].y-Y0+20});
 REGISTER({name:'The Ledge — the cliff',x:700,z:0,r:1000,h:TOPB+40});
 REGISTER({name:'The Ledge — the plateau',x:760,z:0,r:700,y:TOPD-40,h:120});
 REGISTER({name:'The Ledge — the lobby and the foot',x:-80,z:0,r:120,h:60});
 REGISTER({name:'The Ledge — the town at the foot',x:-560,z:0,r:520,h:40});
 REGISTER({name:'The Ledge — the approach road',x:-1700,z:0,r:600,h:20});
 CORES.forEach((C,i)=>REGISTER({name:'The Ledge — lift core '+(i+1),x:C.xf+10,z:C.z,r:C.w/2+8,h:C.top}));
 if(dd){
  REGISTER({name:'The Ledge — the broken prow',x:-170,z:GC,r:130,y:LAY[NL-6].y,h:TOPD-LAY[NL-6].y+20});
  REGISTER({name:'The Ledge — the fallen prow',x:-460,z:-100,r:320,h:100});
  REGISTER({name:'The Ledge — the gash',x:-160,z:GC,r:110,y:LAY[NL-22].y,h:LAY[NL-6].y-LAY[NL-22].y});
  REGISTER({name:'The Ledge — the sheared layers',x:-20,z:280,r:120,y:LAY[10].y-10,h:LAY[18].y-LAY[10].y+20});
  REGISTER({name:'The Ledge — the pancaked wing',x:-120,z:-360,r:130,y:LAY[20].deck-40,h:120});
  REGISTER({name:'The Ledge — the rockfall',x:-120,z:640,r:180,h:TOPB});}

 // ---- what the presets are derived from ---------------------------------------
 LD_SITE[d]={x:gx,z:gz,d:d,dd:dd,NL:NL,Y0:Y0,TOPD:TOPD,TOPB:TOPB,GC:GC,topR:topR,
  lay:LAY.map(L=>({y:L.y,deck:L.deck,top:L.top,za:L.za,zb:L.zb,R:Math.max(...L.B.map(effR))})),
  cores:CORES.map(C=>({z:C.z,xf:C.xf,top:C.top})),figs:NFIG,posts:NPOST,fins:NFIN,houses:NHOUSE,
  reachAt:(i,z)=>reachAt(i,z),faceX:(z,y)=>faceX(z,y),cake:LD_SITE._cake||null};
 delete LD_SITE._cake;

 // ---- merge ---------------------------------------------------------------------
 finish(A_FASC,fascM);finish(A_DECK,deckM);finish(A_SOFF,soffM);finish(A_WIN,winM);
 finish(A_SECT,MAT.ldSect);finish(A_VOID,MAT.ldVoid);
 KOFF=[0,0,0];return G;}
