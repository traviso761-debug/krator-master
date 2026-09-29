// ================================================================= THE WHEEL — the ring city on eight towers
// A raised ANNULAR BAND of forested parkland and buildings, 2 840 m across its
// outer edge and 320 m wide, carried 300 m over the plain on EIGHT inhabited
// rim towers that rise 256 m through it; a CENTRAL TOWER 1 115 m to the tip of
// its spire on the axis; and EIGHT SPOKES of parkland — 76 m wide promenade
// bridges, 740 m long — running from a round hub on the central tower out to
// the rim towers. From above the whole thing is a wheel. Under and inside it
// is a LOWER CITY on a radial-and-ring street plan, and the band, the spokes
// and the hub are pierced by LIGHT WELLS — round and slotted — each with a
// garden on the ground under it where its daylight lands.
//
// THE SECTION of the band, radially, inside out:
//   r 1100..1122  inner edge beam, its face 54 m of windows (y 246..300)
//   r 1122..1358  the plate: deck y 300 (parkland), soffit y 262 (coffered, lit)
//   r 1358..1420  the rim beam hanging to y 205, 95 m of windows facing out,
//                 and on the deck above it a terraced wall of dwellings 22-30 m
//                 tall, broken into blocks with gaps between them
// The band swells 30 m each way at every rim tower, so in plan the rim has
// eight knuckles. The deck: a tree-lined promenade along the inner edge, then
// woods and meadows (the forest is a noise field), lakes, pavilion clusters
// round small plazas, and seven light wells per sector.
//
// THE FORM IS ORIGINAL. The references were a famous fictional plate city on
// pillars and a render of pale towers linked by ring decks; what is taken is
// the idea (a raised ring, a dominant centre, a world above and a world below
// that the wells connect), not a layout, a reactor or a logo. The towers are
// white stone and glass with a flared, buttressed foot and a blade fin on the
// outer face that runs up past the roof; the centre is eight-lobed, the lobes
// pointing down the spokes.
//
// SHADE IS PAINTED. Nothing in this scene casts a shadow, so the ground under
// the plate is dark by construction: the plate's own outline (with its wells
// cut out) is laid on the ground as a dark pavement decal, and every lower-city
// building under it takes a darker wall and roof material. The wells are holes
// in that decal, so the gardens under them are the only bright ground there.
// The soffit carries painted bounce light and a grid of lamps (emissive), and
// swaps to lamps-only at night.
//
// RUINED: the sector between rim towers 3 and 4 (the south-west) has fallen
// onto the city in five tilted slabs with a debris field round them, leaving
// torn stubs at the towers; rim tower 4 has broken off 395 m up and its top lies
// in two pieces on the plain outside the rim, fin in the air; spoke 2 has lost
// its middle 470 m, which lies on the avenue under it, one piece leaning; the
// central tower is broken at ~880 m, its crown ring and spire gone, the spire
// lying on the hub. The forest has taken the band — meadows, paths and plazas
// wooded over, lakes gone to marsh — vines hang off every edge, the windows
// are dead and the lower city is buried under the fallen sector.

function whTile(fn,x,y,w,h){ // a seamless tile from a non-periodic field
 const a=x/w,b=y/h;
 return fn(x,y)*(1-a)*(1-b)+fn(x-w,y)*a*(1-b)+fn(x,y-h)*(1-a)*b+fn(x-w,y-h)*a*b;}
// Ancient white stone: ashlar courses 2 m tall, 6 m blocks, at 16 m a tile.
function whStoneTex(dec){
 return canvasTex(512,512,(g,w,h)=>{const id=g.createImageData(w,h),D=id.data;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
   let v=234+(whTile((X,Y)=>fbm(X/80,Y/80,5.1,3),x,y,w,h)-.5)*18+(fbm(x/7,y/7,5.7,2)-.5)*8;
   const row=y>>6,bx=(x+(row&1)*96)%192;
   if((y&63)<2||bx<2)v-=20;else if((y&63)<4)v+=4;
   let r=v+2,gg=v,b=v-5;
   if(dec){const st=fbm(x/6,y/140,6.3,3);v=v*.74-Math.max(0,st-.44)*170;
    r=v+3;gg=v;b=v-7;
    const li=fbm(x/22,y/22,7.1,3);if(li>.6){const k=(li-.6)*3;r-=34*k;gg-=8*k;b-=36*k;}}
   D[i]=clamp(r,0,255);D[i+1]=clamp(gg,0,255);D[i+2]=clamp(b,0,255);D[i+3]=255;}
  g.putImageData(id,0,0);});}
// The window wall: an 8 x 8 atlas of bays, each 6.4 m wide and one 4.2 m storey
// tall. White stone frames and spandrels, blue glass with a sky gradient, a
// planter on a quarter of the sills, and a lottery per cell for lit rooms and
// blank stone.
function whWinCell(ci,cj){const lot=h3(ci*3.1+.4,cj*5.3+.2,4.4);
 return{lit:lot>=.03&&lot<.20,solid:lot<.03,cur:h3(ci*1.9,cj*2.7,8.1),pl:h3(ci*4.7,cj*1.3,2.6)<.22};}
function whWinTex(dec){
 return canvasTex(512,512,(g,w,h)=>{const id=g.createImageData(w,h),D=id.data;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
   const ci=x>>6,cj=y>>6,cx=x&63,cy=y&63,C=whWinCell(ci,cj);
   const n=(fbm(x/14,y/14,2.9,2)-.5)*14;let r,gg,b;
   const frame=cx<2||cx>61||cy>45||cy<1;
   if(frame||C.solid){let v=dec?124+n-Math.max(0,fbm(x/5,y/80,8.6,2)-.45)*120:236+n*.6;if(cy>45&&cy<48)v-=dec?20:40;
    r=v+2;gg=v;b=v-5;
    if(!dec&&C.pl&&cy>47&&cy<54&&!(cx<2||cx>61)){r=70+n;gg=118+n;b=52+n;}}
   else if(dec){const br=h3(ci*2.3,cj*4.1,1.7);
    if(br<.22){r=38+n;gg=46+n;b=52+n;}else{r=13;gg=13;b=12;}
    if(h3(ci*5.1,cj*.7,3.3)<.14&&cy>28){r=44+n;gg=72+n;b=30+n;}}
   else if(C.lit){const f=.8+.2*C.cur;r=62*f;gg=58*f;b=56*f;}
   else{const sky=clamp(1-cy/40,0,1);r=40+sky*52+n*.3;gg=60+sky*62+n*.3;b=82+sky*70+n*.3;
    if(cx>31&&cx<33){r=200;gg=198;b=192;}}
   D[i]=clamp(r,0,255);D[i+1]=clamp(gg,0,255);D[i+2]=clamp(b,0,255);D[i+3]=255;}
  g.putImageData(id,0,0);});}
function whWinLit(){
 return canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),D=id.data;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,X=x*2,Y=y*2;
   const ci=X>>6,cj=Y>>6,cx=X&63,cy=Y&63,C=whWinCell(ci,cj);
   let a=0;if(C.lit&&!(cx<2||cx>61||cy>45||cy<1))a=.5+.5*C.cur;
   D[i]=255*a;D[i+1]=184*a;D[i+2]=112*a;D[i+3]=255;}
  g.putImageData(id,0,0);});}
// The soffit: 8 m coffers at 32 m a tile, a lamp in each. mode 0 albedo, 1 the
// day emissive (painted bounce + lamps), 2 the night emissive (lamps only).
function whSoffTex(dec,mode){
 return canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),D=id.data;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
   const cx=x&63,cy=y&63,rib=cx<6||cy<6,lx=cx-35,ly=cy-35,lamp=lx*lx+ly*ly<20&&((x>>6)+(y>>6))%2===0&&!(dec&&h3(x>>6,y>>6,3.7)<.8);
   const n=(fbm(x/12,y/12,3.3,2)-.5)*14;let r,gg,b;
   if(mode===0){let v=rib?206+n:172+n;if(dec)v=v*.7-Math.max(0,fbm(x/4,y/40,5.5,2)-.45)*120;
    if(lamp)v=250;r=v+2;gg=v;b=v-4;}
   else if(mode===1){let v=(dec?(rib?74:62):(rib?112:94))+n*.3;r=v*.90;gg=v*.95;b=v;if(lamp){r=255;gg=226;b=170;}}
   else{r=gg=b=0;if(lamp){r=255;gg=212;b=150;}else if(rib){r=gg=b=3;}}
   D[i]=clamp(r,0,255);D[i+1]=clamp(gg,0,255);D[i+2]=clamp(b,0,255);D[i+3]=255;}
  g.putImageData(id,0,0);});}
// Parkland: mottled grass with meadow flowers, 24 m a tile, seamless. The ruin's
// is rank and brown in patches.
function whGrassTex(dec){
 return canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),D=id.data;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
   const n=whTile((X,Y)=>fbm(X/40,Y/40,1.7,3),x,y,w,h),n2=fbm(x/5,y/5,2.3,2);
   let r=64+(n-.5)*50+(n2-.5)*22,gg=128+(n-.5)*56+(n2-.5)*26,b=48+(n-.5)*24;
   if(!dec&&h3(x*.9,y*.7,3.1)<.010){r=236;gg=226;b=160;}
   if(dec){const br=whTile((X,Y)=>fbm(X/28,Y/28,4.4,3),x,y,w,h);r=r*.9+Math.max(0,br-.5)*140;gg=gg*.8+Math.max(0,br-.5)*50;b=b*.8;}
   D[i]=clamp(r,0,255);D[i+1]=clamp(gg,0,255);D[i+2]=clamp(b,0,255);D[i+3]=255;}
  g.putImageData(id,0,0);});}
// A section through the plate or a building, laid open: four storeys a 16.8 m
// tile, each a pale slab over a dark gutted room, a column here and there.
function whSectTex(){
 return canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),D=id.data;
  for(let y=0;y<h;y++){const sy=y&63,si=y>>6;
   for(let x=0;x<w;x++){const i=(y*w+x)*4,n=(fbm(x/10,y/10,3.9,2)-.5)*30;
    const edge=9+5*fbm(x/7,si*3.1,4.4,2);let v;
    if(sy<edge)v=158+n;
    else{v=20+n*.3;const px=(x+si*57)%97;
     if(px<5&&h3(Math.floor((x+si*57)/97),si,6.7)<.55)v=96+n*.6;
     if(sy>57&&fbm(x/5,y/3,8.3,2)>.55)v=72+n;}
    D[i]=clamp(v+4,0,255);D[i+1]=clamp(v,0,255);D[i+2]=clamp(v-6,0,255);D[i+3]=255;}}
  g.putImageData(id,0,0);});}
function whKitTex(){
 return canvasTex(128,128,(g,w,h)=>{const id=g.createImageData(w,h),D=id.data;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
   let v=238+(fbm(x/12,y/12,1.9,2)-.5)*16;const e=Math.min(x,y,w-1-x,h-1-y);
   if(e<2)v=170;else if(e<4)v=250;
   D[i]=clamp(v+2,0,255);D[i+1]=clamp(v,0,255);D[i+2]=clamp(v-5,0,255);D[i+3]=255;}
  g.putImageData(id,0,0);});}
TEX.whStone=whStoneTex(0);TEX.whStoneR=whStoneTex(1);
TEX.whWin=whWinTex(0);TEX.whWinR=whWinTex(1);TEX.whWinE=whWinLit();
TEX.whSoff=whSoffTex(0,0);TEX.whSoffR=whSoffTex(1,0);TEX.whSoffE=whSoffTex(0,1);TEX.whSoffN=whSoffTex(0,2);TEX.whSoffRE=whSoffTex(1,1);
TEX.whGrass=whGrassTex(0);TEX.whGrassR=whGrassTex(1);TEX.whSect=whSectTex();TEX.whKit=whKitTex();
function whMat(o){return new THREE.MeshStandardMaterial(Object.assign({roughness:1,metalness:0,side:DS},o));}
// ground decals sit on the ground plane and on each other: polygon offset, not
// height, keeps them apart, because at 4 km a few centimetres is inside the
// depth buffer's resolution
function whDecal(o,f){return whMat(Object.assign({polygonOffset:true,polygonOffsetFactor:f,polygonOffsetUnits:f},o));}
MAT.whStone   =whMat({map:TEX.whStone,roughnessMap:TEX.concreteRM,color:0xf6f2ea});
MAT.whStoneR  =whMat({map:TEX.whStoneR,roughnessMap:TEX.concreteRM,color:0xa89f90});
MAT.whStoneSh =whMat({map:TEX.whStone,roughnessMap:TEX.concreteRM,color:0x57544f});
MAT.whStoneShR=whMat({map:TEX.whStoneR,roughnessMap:TEX.concreteRM,color:0x57524a});
MAT.whWin     =whMat({map:TEX.whWin,color:0xffffff,emissive:0xffffff,emissiveMap:TEX.whWinE,emissiveIntensity:.8,roughness:.55,metalness:.1});
MAT.whWinR    =whMat({map:TEX.whWinR,color:0xd8d2c8});
MAT.whWinSh   =whMat({map:TEX.whWin,color:0x5a5c64,emissive:0xffffff,emissiveMap:TEX.whWinE,emissiveIntensity:1.05,roughness:.6,metalness:.1});
MAT.whWinShR  =whMat({map:TEX.whWinR,color:0x7a756c});
MAT.whGrass   =whMat({map:TEX.whGrass,color:0xffffff});
MAT.whGrassR  =whMat({map:TEX.whGrassR,color:0xd6d6c8});
MAT.whSoff    =whMat({map:TEX.whSoff,roughnessMap:TEX.concreteRM,color:0xb8b5ae,emissive:0xffffff,emissiveMap:TEX.whSoffE});
MAT.whSoffR   =whMat({map:TEX.whSoffR,roughnessMap:TEX.concreteRM,color:0x8c877e,emissive:0xffffff,emissiveMap:TEX.whSoffRE});
MAT.whWater   =whDecal({color:0x4d7f8e,roughness:.14,metalness:.25},-2);
MAT.whMarsh   =whDecal({map:TEX.whGrassR,color:0x5d6a3c,roughness:.8},-2);
MAT.whPath    =whDecal({map:TEX.whStone,color:0xe9e2d4},-2);
MAT.whPathR   =whDecal({map:TEX.whStoneR,color:0x8f8779},-2);
MAT.whPave    =whDecal({map:TEX.concrete,color:0xc9bfae},-1);
MAT.whPaveR   =whDecal({map:TEX.concrete,color:0x8c8273},-1);
MAT.whRoad    =whDecal({map:TEX.concrete,color:0x746c62},-2);
MAT.whRoadR   =whDecal({map:TEX.concrete,color:0x5e564c},-2);
MAT.whLawn    =whDecal({map:TEX.whGrass,color:0xf0f0f0},-3);
MAT.whLawnR   =whDecal({map:TEX.whGrassR,color:0xc8c8b8},-3);
MAT.whShade   =whDecal({map:TEX.concrete,color:0x48453f},-4);
MAT.whShadeR  =whDecal({map:TEX.concrete,color:0x3c3833},-4);
MAT.whSect    =whMat({map:TEX.whSect,color:0xd6ccbb});
MAT.whDebris  =whMat({map:TEX.whGrassR,color:0x9c8c70});
MAT.whVoid    =whMat({color:0x0e0d0c});
MAT.whKit     =whMat({map:TEX.whKit,color:0xffffff});
MAT.whBark    =whMat({color:0x5b4632});
MAT.whRebar   =whMat({color:0x5d3b27,roughness:.9,metalness:.2});
kdef('whBox',new THREE.BoxGeometry(1,1,1),MAT.whKit);
kdef('whDim',new THREE.BoxGeometry(1,1,1),MAT.whVoid);
kdef('whChunk',new THREE.BoxGeometry(1,1,1),MAT.whKit);
kdef('whRebar',new THREE.BoxGeometry(1,1,1),MAT.whRebar);
kdef('whCrown',leafCardGeo(),MAT.leafCard);
// A person at 18 triangles rather than the kit's 72: there are thousands here
// and at the distances this type is seen from they are specks that give scale.
kdef('whFigB',new THREE.CylinderGeometry(.23,.19,1.5,5,1,true).translate(0,.75,0),MAT.fig);
kdef('whFigH',new THREE.OctahedronGeometry(.15,0).translate(0,1.62,0),MAT.fig);
kdef('whBole',new THREE.CylinderGeometry(.4,1,1,4,1,true).translate(0,.5,0),MAT.whBark);
// Night only: lamps along the promenades. MAT.dot is unlit, so these are
// hidden by day (setNight() shows the classes named in FIREKIT).
kdef('whLamp',new THREE.BoxGeometry(1,1,1),MAT.dot);FIREKIT.push('whLamp');
// Presets are DERIVED from this: targets/wheel/91z-views.js runs after
// 90-scene.js, so both builders have left their dimensions here.
const WH_SITE={};

function buildWheel(scene,gx,gz,d){reseed(9750+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0;
 const sm=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
 const DEG=Math.PI/180;

 // ============================================================ THE NUMBERS
 const NT=8,RC=1260,R0=1100,R1=1420;           // towers, tower ring, band inner/outer
 const YD=300,YS=262,YIB=246,YR=205,RIB=22,ROB=62; // deck, soffit, inner beam foot, rim beam foot, beam widths
 const RH=330,YHB=232,SW=38,RG=1850,RP0=360,RP1=480; // hub radius, hub soffit, spoke half-width, city, central park
 const HT=556,HC=1000,HSP=1115;                // rim tower roof, central roof, central spire tip
 const TA=[];for(let k=0;k<NT;k++)TA.push((22.5+45*k)*DEG);
 const CS=2,BT=3,FS=1,STA=6.5*DEG,STB=5.5*DEG,YBRK=395,YCC=880,SPA=150,SPB=110;
 const STEP=.4*DEG;
 const RRD=[500,820,1060,1260,1560];           // ring roads
 const AV=[];for(let k=0;k<NT;k++){AV.push({a:TA[k],hw:14,r0:RP1});AV.push({a:TA[k]+22.5*DEG,hw:10,r0:RRD[0]});}

 // ---- polar helpers
 const P2=(r,a)=>[r*Math.cos(a),r*Math.sin(a)];
 const P3=(r,a,y)=>[r*Math.cos(a),y,r*Math.sin(a)];
 const polar=(x,z)=>{let a=Math.atan2(z,x);if(a<0)a+=TAU;return{r:Math.hypot(x,z),a:a};};
 const angS=(a,b)=>{let x=((a-b)%TAU+TAU)%TAU;return x>Math.PI?x-TAU:x;};
 const angD=(a,b)=>Math.abs(angS(a,b));
 const nearT=a=>{let e=1e9,k0=0;for(let k=0;k<NT;k++){const q=angD(a,TA[k]);if(q<e){e=q;k0=k;}}return{k:k0,e:e};};
 const bump=a=>{const q=nearT(a).e*RC/190;return Math.exp(-q*q);};
 const rin=a=>R0-30*bump(a),rout=a=>R1+30*bump(a);
 const secOf=a=>Math.floor((((a-TA[0])%TAU+TAU)%TAU)/(45*DEG))%NT;
 const inRange=(a,a0,a1)=>{const q=((a-a0)%TAU+TAU)%TAU;return q>0&&q<a1-a0;};
 const TC=k=>P2(RC,TA[k]);
 const inCollapse=a=>!!dd&&secOf(a)===CS&&angS(a,TA[CS])>STA&&angS(TA[(CS+1)%NT],a)>STB;

 // ---- the rim towers: a superellipse plan 196 x 148 m, flared foot, drawn in
 // at the crown
 const TWA=98,TWB=74,TWN=2.8;
 const seR=ph=>{const c=Math.abs(Math.cos(ph))/TWA,s=Math.abs(Math.sin(ph))/TWB;return 1/Math.pow(Math.pow(c,TWN)+Math.pow(s,TWN),1/TWN);};
 const pT=y=>1+.62*Math.pow(1-clamp(y/190,0,1),2.2)-.27*sm((y-360)/(HT-360));
 const TR=(ph,y)=>seR(ph)*pT(y);
 // ---- the central tower: eight lobes pointing down the spokes, buttressed foot
 const aC=y=>.045+.2*Math.pow(1-clamp(y/200,0,1),2);
 const rC0=y=>142+125*Math.pow(1-clamp(y/220,0,1),2.2)-42*sm((y-420)/500)-30*sm((y-820)/180);
 const RCf=(ph,y)=>rC0(y)*(1+aC(y)*Math.cos(8*(ph-TA[0])));

 // ============================================================ MATERIALS AND ACCUMULATORS
 const M={stone:dd?MAT.whStoneR:MAT.whStone,win:dd?MAT.whWinR:MAT.whWin,winsh:dd?MAT.whWinShR:MAT.whWinSh,
  roofsh:dd?MAT.whStoneShR:MAT.whStoneSh,soff:dd?MAT.whSoffR:MAT.whSoff,grass:dd?MAT.whGrassR:MAT.whGrass,
  water:dd?MAT.whMarsh:MAT.whWater,path:dd?MAT.whPathR:MAT.whPath,pave:dd?MAT.whPaveR:MAT.whPave,
  road:dd?MAT.whRoadR:MAT.whRoad,shade:dd?MAT.whShadeR:MAT.whShade,lawn:dd?MAT.whLawnR:MAT.whLawn,
  sect:MAT.whSect,void:MAT.whVoid,debris:MAT.whDebris};
 const LST=new Map();const put=(m,g)=>{if(!g)return;if(!LST.has(m))LST.set(m,[]);LST.get(m).push(g);};
 const mk=(Tu,Tv)=>({P:[],U:[],Tu:Tu,Tv:Tv||Tu});
 const A={stone:mk(16),win:mk(51.2,33.6),winsh:mk(51.2,33.6),roofsh:mk(16),soff:mk(32),grass:mk(24),
  sect:mk(16.8),void:mk(16),path:mk(16),road:mk(24),water:mk(24),lawn:mk(24),debris:mk(24)};
 const tri=(Ak,a,b,c,ua,ub,uc)=>{Ak.P.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2]);
  Ak.U.push(ua[0],ua[1],ub[0],ub[1],uc[0],uc[1]);};
 const pUV=(Ak,p,ax)=>ax===1?[p[0]/Ak.Tu,p[2]/Ak.Tv]:ax===0?[p[2]/Ak.Tu,p[1]/Ak.Tv]:[p[0]/Ak.Tu,p[1]/Ak.Tv];
 const axOf=(a,b,c)=>{const u1=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],u2=[c[0]-a[0],c[1]-a[1],c[2]-a[2]];
  const nx=Math.abs(u1[1]*u2[2]-u1[2]*u2[1]),ny=Math.abs(u1[2]*u2[0]-u1[0]*u2[2]),nz=Math.abs(u1[0]*u2[1]-u1[1]*u2[0]);
  return ny>=nx&&ny>=nz?1:nx>=nz?0:2;};
 const triW=(Ak,a,b,c)=>{const ax=axOf(a,b,c);tri(Ak,a,b,c,pUV(Ak,a,ax),pUV(Ak,b,ax),pUV(Ak,c,ax));};
 const quadW=(Ak,a,b,c,e)=>{let ax=axOf(a,b,e);if(Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2])<1e-6)ax=axOf(a,c,e);
  const ua=pUV(Ak,a,ax),ub=pUV(Ak,b,ax),uc=pUV(Ak,c,ax),ue=pUV(Ak,e,ax);
  tri(Ak,a,b,c,ua,ub,uc);tri(Ak,a,c,e,ua,uc,ue);};
 const FACES=[[0,1,2,3,'b'],[4,7,6,5,'t'],[0,4,5,1,'z0'],[1,5,6,2,'x1'],[2,6,7,3,'z1'],[3,7,4,0,'x0']];
 const hexa=(c,R)=>{for(const f of FACES){const Ak=R[f[4]];if(Ak)quadW(Ak,c[f[0]],c[f[1]],c[f[2]],c[f[3]]);}};
 const rotHexa=(C,S,Q,R,X)=>{const c=[];
  for(const [sx,sy,sz] of [[-1,-1,-1],[1,-1,-1],[1,-1,1],[-1,-1,1],[-1,1,-1],[1,1,-1],[1,1,1],[-1,1,1]]){
   const v=new THREE.Vector3(sx*S[0]/2,sy*S[1]/2,sz*S[2]/2).applyQuaternion(Q),p=[C[0]+v.x,C[1]+v.y,C[2]+v.z];c.push(X?X(p[0],p[1],p[2]):p);}
  hexa(c,R);return c;};
 const yUV=g=>{const P=g.attributes.position,U=g.attributes.uv;for(let i=0;i<U.count;i++)U.setY(i,P.getY(i)/33.6);return g;};
 const planarUV=(g,T)=>{const P=g.attributes.position,U=g.attributes.uv;for(let i=0;i<U.count;i++)U.setXY(i,P.getX(i)/T,P.getZ(i)/T);return g;};
 // a window wall from p to q (plan points [x,z]); corners may have their own
 // heights, storeys counted from yRef
 const wq=(Ak,p,q,yp0,yq0,yp1,yq1,u0,yRef)=>{const L=Math.hypot(q[0]-p[0],q[1]-p[1]);
  const U=s=>(u0+s)/51.2,V=y=>(y-yRef)/33.6;
  const a=[p[0],yp0,p[1]],b=[q[0],yq0,q[1]],c=[q[0],yq1,q[1]],e=[p[0],yp1,p[1]];
  tri(Ak,a,b,c,[U(0),V(yp0)],[U(L),V(yq0)],[U(L),V(yq1)]);tri(Ak,a,c,e,[U(0),V(yp0)],[U(L),V(yq1)],[U(0),V(yp1)]);return L;};
 const ww=(Ak,p,q,y0,y1,u0)=>wq(Ak,p,q,y0,y0,y1,y1,u0,y0);
 // the same through a transform X(x,y,z) -> world, for fallen pieces
 const wwX=(Ak,X,p,q,y0,y1,u0)=>{const L=Math.hypot(q[0]-p[0],q[1]-p[1]),U=s=>(u0+s)/51.2,V=y=>(y-y0)/33.6;
  const a=X(p[0],y0,p[1]),b=X(q[0],y0,q[1]),c=X(q[0],y1,q[1]),e=X(p[0],y1,p[1]);
  tri(Ak,a,b,c,[U(0),V(y0)],[U(L),V(y0)],[U(L),V(y1)]);tri(Ak,a,c,e,[U(0),V(y0)],[U(L),V(y1)],[U(0),V(y1)]);return L;};
 const wallLoop=(Ak,pts,y0,y1)=>{let u=0;const n=pts.length;for(let i=0;i<n;i++)u+=ww(Ak,pts[i],pts[(i+1)%n],y0,y1,u);};
 const stoneLoop=(Ak,pts,y0,y1,closed)=>{const n=pts.length;for(let i=0;i<(closed?n:n-1);i++){const p=pts[i],q=pts[(i+1)%n];
  quadW(Ak,[p[0],y0,p[1]],[q[0],y0,q[1]],[q[0],y1,q[1]],[p[0],y1,p[1]]);}};
 const accGeo=Ak=>{if(!Ak.P.length)return null;const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(Ak.P,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(Ak.U,2));
  g.computeVertexNormals();return g;};
 // shapes: plan polygons [x,z] with holes, laid flat at y
 const V2=p=>new THREE.Vector2(p[0],p[1]);
 const mkShape=(pts,holes)=>{const s=new THREE.Shape(pts.map(V2));if(holes)for(const h of holes)s.holes.push(new THREE.Path(h.map(V2)));return s;};
 const shapeGeo=(sh,y,T)=>{const g=new THREE.ShapeGeometry(sh);g.rotateX(Math.PI/2);g.translate(0,y,0);
  const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)/T,uv.getY(i)/T);return g;};
 const circ=(cx,cz,R,n)=>{const P=[];for(let i=0;i<n;i++){const a=i/n*TAU;P.push([cx+R*Math.cos(a),cz+R*Math.sin(a)]);}return P;};
 const arcPts=(rf,a0,a1,st)=>{const n=Math.max(1,Math.ceil(Math.abs(a1-a0)/(st||STEP)));const P=[];
  for(let i=0;i<=n;i++){const a=lerp(a0,a1,i/n);P.push(P2(rf(a),a));}return P;};
 const mkX=(pos,Q)=>{const m=new THREE.Matrix4().compose(new THREE.Vector3(pos[0],pos[1],pos[2]),Q,new THREE.Vector3(1,1,1));
  const v=new THREE.Vector3();return{m:m,Q:Q,pos:pos,X:(x,y,z)=>{v.set(x,y,z).applyMatrix4(m);return[v.x,v.y,v.z];}};};
 const withXF=(T,fn)=>{const Pg=new THREE.Group();Pg.position.set(T.pos[0],T.pos[1],T.pos[2]);Pg.quaternion.copy(T.Q);useGroupXF(Pg);try{fn();}finally{endGroupXF();}};

 // ---- palette and small things
 const stoneC=()=>new THREE.Color().setHSL(rr(.08,.11),rr(.05,.14),dd?rr(.40,.50):rr(.84,.92));
 const stoneD=()=>new THREE.Color().setHSL(rr(.07,.10),rr(.05,.12),dd?rr(.28,.36):rr(.64,.72));
 // The kit's leaf card is a dark green; an instance colour above 1 lifts it, so
// a canopy seen from 3 km reads as woodland rather than as black specks.
 const leafC=()=>{const c=dd?new THREE.Color().setHSL(rr(.12,.26),rr(.25,.45),rr(.42,.58)):new THREE.Color().setHSL(rr(.20,.32),rr(.3,.55),rr(.55,.70));
  return c.multiplyScalar(dd?rr(1.1,1.5):rr(1.2,1.7));};
 const mossC=()=>new THREE.Color().setHSL(rr(.20,.30),rr(.3,.5),rr(.10,.18));
 const WARM=new THREE.Color(0xffc27a);
 let NTREE=0,NFIG=0,NBLD=0;
 const tree=(x,y,z,h,bole)=>{const cr=h*rr(.30,.40);
  if(rng()<.14)kput('whCrown',[x,y+h*.52,z],qEuler(0,rng()*TAU,0),[cr*.5,h*.5,cr*.5],leafC());
  else kput('whCrown',[x,y+h*.64,z],qEuler(rr(-.08,.08),rng()*TAU,rr(-.08,.08)),[cr,cr*rr(.7,.95),cr],leafC());
  if(bole)kput('whBole',[x,y,z],null,[h*.03,h*.62,h*.03],null);NTREE++;};
 const shrub=(x,y,z,s)=>kput('whCrown',[x,y+s*.35,z],qEuler(rr(-.1,.1),rng()*TAU,rr(-.1,.1)),[s,s*rr(.4,.6),s],leafC());
 const person=(x,y,z)=>{kput('whFigB',[x,y,z],qEuler(0,rng()*TAU,0),1,new THREE.Color().setHSL(rr(0,.7),rr(.2,.55),rr(.25,.55)));
  kput('whFigH',[x,y,z],null,1,new THREE.Color(0xc9a17e));NFIG++;};
 const lamp=(x,y,z)=>{if(!dd)kput('whLamp',[x,y,z],null,[.9,.9,.9],WARM);};
 const vine=(x,y,z,L)=>kput('vine',[x,y,z],qEuler(rr(-.06,.06),0,rr(-.06,.06)),[rr(1.4,3),L,rr(1.4,3)],mossC());
 const chunk=(x,y,z,s)=>kput('whChunk',[x,y+s[1]*.3,z],qEuler(rr(-.6,.6),rng()*TAU,rr(-.6,.6)),s,rng()<.5?stoneD():stoneC());
 const rubRing=(x,z,r0,r1,n,sM)=>{for(let q=0;q<n;q++){const a=rng()*TAU,t=Math.pow(rng(),2),r=lerp(r0,r1,t),sc=rr(.8,sM)*(1.2-.6*t);
  if(rng()<.7)chunk(x+r*Math.cos(a),0,z+r*Math.sin(a),[sc*rr(1,2.4),sc*rr(.4,.9),sc*rr(1,2)]);
  else kput('rubble',[x+r*Math.cos(a),sc*.35,z+r*Math.sin(a)],qEuler(rng()*3,rng()*3,rng()*3),[sc,sc*.7,sc],stoneD());}};
 const rebar=(p,dir,L)=>beam('whRebar',p,[p[0]+dir[0]*L,p[1]+dir[1]*L-rr(0,L*.35),p[2]+dir[2]*L],.3,.3,null);

 // ============================================================ THE PLAN (shared by both decays)
 reseed(9753);
 const WELLS=[],LAKES=[],CLUS=[],RIMB=[];
 const wellD=(W,x,z)=>{if(W.type===0)return Math.hypot(x-W.cx,z-W.cz)-W.R;const p=polar(x,z);
  return Math.hypot(Math.max(0,angD(p.a,W.ac)*W.rc-W.hl),p.r-W.rc)-W.hw;};
 for(let k=0;k<NT;k++){const a0=TA[k],a1=a0+45*DEG;
  let n=0;for(let tr=0;tr<600&&n<7;tr++){const slot=rng()<.42,ac=rr(a0,a1);let W;
   if(slot){const hw=rr(15,23),hl=rr(40,88),rc=rr(R0+58+hw,R1-ROB-48-hw);W={type:1,rc:rc,ac:ac,hl:hl,hw:hw,ext:hl+hw};}
   else{const R=rr(18,42),rc=rr(R0+58+R,R1-ROB-48-R);W={type:0,rc:rc,ac:ac,R:R,ext:R};}
   const c=P2(W.rc,ac);W.cx=c[0];W.cz=c[1];
   if(Math.min(angD(ac,a0),angD(ac,a1))*W.rc-W.ext<172)continue;
   if(WELLS.some(V=>Math.hypot(V.cx-W.cx,V.cz-W.cz)<V.ext+W.ext+48))continue;
   W.sec=k;WELLS.push(W);n++;}
  let nl=0;for(let tr=0;tr<300&&nl<2;tr++){const ea=rr(34,70),eb=rr(20,32),ac=rr(a0,a1),rc=rr(R0+62+eb,R1-ROB-52-eb);
   const c=P2(rc,ac),L={cx:c[0],cz:c[1],rc:rc,ac:ac,ea:ea,eb:eb,ext:ea,sec:k,ph:rng()*TAU};
   if(Math.min(angD(ac,a0),angD(ac,a1))*rc-ea<178)continue;
   if(WELLS.some(V=>Math.hypot(V.cx-L.cx,V.cz-L.cz)<V.ext+ea+30)||LAKES.some(V=>Math.hypot(V.cx-L.cx,V.cz-L.cz)<V.ext+ea+40))continue;
   LAKES.push(L);nl++;}
  let nc=0;for(let tr=0;tr<300&&nc<3;tr++){const R=rr(44,62),ac=rr(a0,a1),rc=rr(R0+64+R,R1-ROB-54-R);
   const c=P2(rc,ac),C={cx:c[0],cz:c[1],rc:rc,ac:ac,R:R,ext:R,sec:k,n:4+Math.floor(rng()*4),ph:rng()*TAU};
   if(Math.min(angD(ac,a0),angD(ac,a1))*rc-R<178)continue;
   if(WELLS.some(V=>Math.hypot(V.cx-C.cx,V.cz-C.cz)<V.ext+R+22)||LAKES.some(V=>Math.hypot(V.cx-C.cx,V.cz-C.cz)<V.ext+R+22)
    ||CLUS.some(V=>Math.hypot(V.cx-C.cx,V.cz-C.cz)<V.R+R+60))continue;
   CLUS.push(C);nc++;}
  let nh=0;for(let tr=0;tr<300&&nh<2;tr++){const R=rr(34,48),ac=rr(a0,a1),rc=rr(R0+60+R,R1-ROB-50-R);
   const c=P2(rc,ac),C={cx:c[0],cz:c[1],rc:rc,ac:ac,R:R,ext:R,sec:k,hill:1,n:3+Math.floor(rng()*2),ph:rng()*TAU};
   if(Math.min(angD(ac,a0),angD(ac,a1))*rc-R<178)continue;
   if(WELLS.some(V=>Math.hypot(V.cx-C.cx,V.cz-C.cz)<V.ext+R+20)||LAKES.some(V=>Math.hypot(V.cx-C.cx,V.cz-C.cz)<V.ext+R+20)
    ||CLUS.some(V=>Math.hypot(V.cx-C.cx,V.cz-C.cz)<V.R+R+40))continue;
   CLUS.push(C);nh++;}
  {const dl=120/RC;let a=a0+dl;while(a<a1-dl-40/RC){const e=Math.min(a+rr(70,140)/RC,a1-dl);if(e-a<30/RC)break;
    RIMB.push({a0:a,a1:e,h1:rr(22,30),h2:rr(11,15),sec:k,r:rng()});a=e+rr(16,30)/RC;}}}
 const lakePts=(L,grow)=>{const P=[],er=[Math.cos(L.ac),Math.sin(L.ac)],et=[-Math.sin(L.ac),Math.cos(L.ac)];
  for(let i=0;i<30;i++){const t=i/30*TAU,w=1+.12*Math.sin(3*t+L.ph);
   const u=(L.ea*w+grow)*Math.cos(t),v=(L.eb*w+grow)*Math.sin(t);P.push([L.cx+u*et[0]+v*er[0],L.cz+u*et[1]+v*er[1]]);}return P;};
 const lakeD=(L,x,z)=>{const er=[Math.cos(L.ac),Math.sin(L.ac)],et=[-Math.sin(L.ac),Math.cos(L.ac)],dx=x-L.cx,dz=z-L.cz;
  return(Math.hypot((dx*et[0]+dz*et[1])/L.ea,(dx*er[0]+dz*er[1])/L.eb)-1)*L.eb;};
 const sEndB=(k,t)=>{let s=rin(TA[k]);for(let q=0;q<4;q++){const a=TA[k]+Math.atan2(t,s),ri=rin(a);s=Math.sqrt(ri*ri-t*t);}return s;};
 const SPK=[];for(let k=0;k<NT;k++){const sA=RH,sB=sEndB(k,0),L=sB-sA,w=[],pav=[];
  for(let i=0;i<5;i++){const c=sA+L*(i+.5)/5;w.push([c-rr(24,34),c+rr(24,34)]);}
  for(let i=0;i<4;i++)for(const sg of [-1,1])pav.push({s:sA+L*(i+1)/5+rr(-12,12),t:sg*19.5,w:rr(22,34),dp:rr(11,14),h:rr(7,11),g:rng()<.5});
  SPK.push({k:k,sA:sA,sB:sB,L:L,wells:w,pav:pav,e:[Math.cos(TA[k]),Math.sin(TA[k])],t:[-Math.sin(TA[k]),Math.cos(TA[k])]});}
 const HWELL=[];for(let k=0;k<NT;k++){const c=P2(252,TA[k]+22.5*DEG);HWELL.push({type:0,cx:c[0],cz:c[1],R:22,ext:22});}
 const JAG=[];for(let i=0;i<64;i++)JAG.push(rr(-1,1));
 reseed(9750+d);

 const spokeLoc=(S,x,z)=>({s:x*S.e[0]+z*S.e[1],t:x*S.t[0]+z*S.t[1]});
 const spokeW=(S,s,t)=>[s*S.e[0]+t*S.t[0],s*S.e[1]+t*S.t[1]];
 const spokeGone=(k,s)=>!!dd&&k===FS&&s>RH+SPA&&s<SPK[k].sB-SPB;
 const inSpokeWell=(S,s,t)=>Math.abs(t)<9&&S.wells.some(w=>s>w[0]&&s<w[1]);
 // is a ground point in the plate's shade?
 const underPlate=(x,z)=>{const p=polar(x,z);
  if(p.r<RH){for(const W of HWELL)if(wellD(W,x,z)<0)return false;return true;}
  if(p.r>=rin(p.a)&&p.r<=rout(p.a)){if(inCollapse(p.a))return false;
   for(const W of WELLS)if(wellD(W,x,z)<0)return false;return true;}
  for(const S of SPK){const q=spokeLoc(S,x,z);if(Math.abs(q.t)<SW&&q.s>RH&&q.s<S.sB){
    if(spokeGone(S.k,q.s))return false;return!inSpokeWell(S,q.s,q.t);}}
  return false;};

 // ============================================================ THE BAND
 const slotPts=(W,grow)=>{const rc=W.rc,hw=W.hw+grow,hl=W.hl,a0=W.ac-hl/rc,a1=W.ac+hl/rc,P=[];
  const na=Math.max(2,Math.ceil(2*hl/10));
  for(let i=0;i<=na;i++){const a=lerp(a0,a1,i/na);P.push(P2(rc+hw,a));}
  const cap=(a,sg,rev)=>{const c=P2(rc,a),er=[Math.cos(a),Math.sin(a)],et=[-Math.sin(a),Math.cos(a)];
   for(let i=1;i<8;i++){const ps=(rev?8-i:i)/8*Math.PI;
    P.push([c[0]+hw*(Math.cos(ps)*er[0]+sg*Math.sin(ps)*et[0]),c[1]+hw*(Math.cos(ps)*er[1]+sg*Math.sin(ps)*et[1])]);}};
  cap(a1,1,false);
  for(let i=0;i<=na;i++){const a=lerp(a1,a0,i/na);P.push(P2(rc-hw,a));}
  cap(a0,-1,true);
  return P;};
 const wellPts=(W,grow)=>W.type===0?circ(W.cx,W.cz,W.R+(grow||0),Math.max(20,Math.round((W.R+(grow||0))*.8))):slotPts(W,grow||0);
 // a torn edge across the band at angle aE, from radius r0 to r1 (interior points)
 const jagPts=(aE,r0,r1,so)=>{const P=[],n=11;for(let j=1;j<n;j++){const f=j/n,r=lerp(r0,r1,f),amp=Math.sin(Math.PI*f)*(22+14*JAG[(j+so)%64]);
   P.push(P2(r,aE+amp*JAG[(j*3+so)%64]/r));}return P;};
 const botAt=(r,a)=>r>rout(a)-ROB?YR:r<rin(a)+RIB?YIB:YS;
 const FRACT=[];                                // torn edges, for the rebar and vines
 const bandPiece=(a0,a1,j0,j1)=>{
  const O=arcPts(rout,a0,a1),I=arcPts(rin,a1,a0);
  let pts=O.slice();if(j1)pts=pts.concat(j1);pts=pts.concat(I);if(j0)pts=pts.concat(j0);
  const Wl=WELLS.filter(W=>inRange(W.ac,a0,a1));
  const sh=mkShape(pts,Wl.map(W=>wellPts(W,0)));
  put(M.grass,shapeGeo(sh,YD,24));put(M.soff,shapeGeo(sh,YS,32));put(M.shade,shapeGeo(sh,0,24));
  const n=Math.max(2,Math.ceil((a1-a0)/STEP));let uI=0,uO=0,uB=0;
  for(let i=0;i<n;i++){const aa=lerp(a0,a1,i/n),ab=lerp(a0,a1,(i+1)/n),ia=rin(aa),ib=rin(ab),oa=rout(aa),ob=rout(ab);
   uI+=ww(A.win,P2(ia,aa),P2(ib,ab),YIB,YD,uI);
   quadW(A.soff,P3(ia,aa,YIB),P3(ib,ab,YIB),P3(ib+RIB,ab,YIB),P3(ia+RIB,aa,YIB));
   quadW(A.soff,P3(ia+RIB,aa,YIB),P3(ib+RIB,ab,YIB),P3(ib+RIB,ab,YS),P3(ia+RIB,aa,YS));
   uO+=ww(A.win,P2(oa,aa),P2(ob,ab),YR,YD,uO);
   quadW(A.soff,P3(oa-ROB,aa,YR),P3(ob-ROB,ab,YR),P3(ob,ab,YR),P3(oa,aa,YR));
   uB+=ww(A.winsh,P2(oa-ROB,aa),P2(ob-ROB,ab),YR,YS,uB);
   quadW(A.stone,P3(ia,aa,YD),P3(ib,ab,YD),P3(ib,ab,YD+1.2),P3(ia,aa,YD+1.2));
   quadW(A.stone,P3(oa-.4,aa,YD),P3(ob-.4,ab,YD),P3(ob-.4,ab,YD+1.2),P3(oa-.4,aa,YD+1.2));
   // cornices: a white band at the deck edge on both faces and two more down
   // the rim wall, which is what gives 95 m of window wall a scale
   for(const [rr0,rr1,y,t,o] of [[oa,ob,YD,3.5,2.4],[oa,ob,262,2.4,2],[oa,ob,YR+2.4,2.4,2.6],[ia,ib,YD,3,-2.2]]){
    quadW(A.stone,P3(rr0+o,aa,y-t),P3(rr1+o,ab,y-t),P3(rr1+o,ab,y),P3(rr0+o,aa,y));
    quadW(A.stone,P3(rr0,aa,y),P3(rr1,ab,y),P3(rr1+o,ab,y),P3(rr0+o,aa,y));
    quadW(A.stone,P3(rr0,aa,y-t),P3(rr1,ab,y-t),P3(rr1+o,ab,y-t),P3(rr0+o,aa,y-t));}}
  for(const W of Wl){const P=wellPts(W,0);wallLoop(A.win,P,YS,YD);stoneLoop(A.stone,P,YD,YD+1.1,true);}
  // torn ends: the section laid open, full depth
  const tornEnd=(L)=>{for(let i=0;i<L.length-1;i++){const p=L[i],q=L[i+1],m=polar((p[0]+q[0])/2,(p[1]+q[1])/2),yb=botAt(m.r,m.a);
    quadW(A.sect,[p[0],yb,p[1]],[q[0],yb,q[1]],[q[0],YD,q[1]],[p[0],YD,p[1]]);
    FRACT.push({p:p,q:q,yb:yb});}
   // cap the beams where the arc ends
  };
  if(j1)tornEnd([P2(rout(a1),a1)].concat(j1,[P2(rin(a1),a1)]));
  if(j0)tornEnd([P2(rin(a0),a0)].concat(j0,[P2(rout(a0),a0)]));};
 for(let k=0;k<NT;k++){const a0=TA[k],a1=TA[k]+45*DEG;
  if(dd&&k===CS){const e0=a0+STA,e1=a1-STB;
   bandPiece(a0,e0,null,jagPts(e0,rout(e0),rin(e0),5));
   bandPiece(e1,a1,jagPts(e1,rin(e1),rout(e1),29),null);}
  else bandPiece(a0,a1,null,null);}

 // ---- the promenades: stone along the inner edge, a walk in front of the
 // terraces along the outer
 {const n=Math.ceil(TAU/(STEP*2));
  for(let i=0;i<n;i++){const aa=i/n*TAU,ab=(i+1)/n*TAU,am=(aa+ab)/2;if(inCollapse(am))continue;
   const ia=rin(aa),ib=rin(ab);
   quadW(A.path,P3(ia+1.2,aa,YD),P3(ib+1.2,ab,YD),P3(ib+15,ab,YD),P3(ia+15,aa,YD));
   if(nearT(am).e*RC>128){const oa=rout(aa),ob=rout(ab);
    quadW(A.path,P3(oa-62,aa,YD),P3(ob-62,ab,YD),P3(ob-48,ab,YD),P3(oa-48,aa,YD));}}
  // the inner avenue of trees, lamps and people on the promenade
  for(let a=0;a<TAU;a+=13/R0){if(inCollapse(a))continue;const ri=rin(a);
   if(dd&&rng()<.25)continue;const p=P2(ri+21,a);tree(p[0],YD,p[1],dd?rr(12,22):rr(10,15),true);}
  for(let a=0;a<TAU;a+=30/R0){if(inCollapse(a))continue;const p=P2(rin(a)+2.5,a);lamp(p[0],YD+4.5,p[1]);
   if(!dd){const m=Math.floor(rng()*3);for(let q=0;q<m;q++){const pp=P2(rin(a)+rr(3,14),a+rr(-10,10)/R0);person(pp[0],YD,pp[1]);}}}}

 // ---- the terraces along the outer edge
 for(const B of RIMB){if(dd&&B.sec===CS)continue;
  const broken=dd&&B.r<.55,h1=broken?B.h1*rr(.35,.7):B.h1,h2=broken?B.h2*rr(.4,.8):B.h2;
  const prism=(r0f,r1f,y1,topK)=>{const n=Math.max(1,Math.ceil((B.a1-B.a0)/(1.6*DEG)));let uo=0,ui=0;
   for(let i=0;i<n;i++){const aa=lerp(B.a0,B.a1,i/n),ab=lerp(B.a0,B.a1,(i+1)/n);
    uo+=ww(A.win,P2(r1f(aa),aa),P2(r1f(ab),ab),YD,y1,uo);ui+=ww(A.win,P2(r0f(aa),aa),P2(r0f(ab),ab),YD,y1,ui);
    quadW(A[topK],P3(r0f(aa),aa,y1),P3(r0f(ab),ab,y1),P3(r1f(ab),ab,y1),P3(r1f(aa),aa,y1));}
   ww(A.win,P2(r0f(B.a0),B.a0),P2(r1f(B.a0),B.a0),YD,y1,0);ww(A.win,P2(r0f(B.a1),B.a1),P2(r1f(B.a1),B.a1),YD,y1,0);};
  prism(a=>rout(a)-24,rout,YD+h1,broken?'sect':'stone');
  prism(a=>rout(a)-46,a=>rout(a)-24.5,YD+h2,'grass');
  // the terrace gardens and a lamp-lit walk in front
  for(let a=B.a0+6/R1;a<B.a1-4/R1;a+=rr(7,12)/R1){const p=P2(rout(a)-rr(27,44),a);shrub(p[0],YD+h2,p[1],dd?rr(2,5):rr(1.5,3));}
  for(let a=B.a0;a<B.a1;a+=rr(8,16)/R1){if(dd){const p=P2(rout(a)+.5,a);if(rng()<.7)vine(p[0],YD+h1,p[1],rr(20,90));continue;}
   if(rng()<.5){const p=P2(rout(a)-rr(48,60),a);person(p[0],YD,p[1]);}}
  for(let a=B.a0;a<B.a1;a+=34/R1){const p=P2(rout(a)-47.5,a);lamp(p[0],YD+3.5,p[1]);}}

 // ---- the lakes
 for(const L of LAKES){if(dd&&inCollapse(L.ac))continue;
  put(M.water,shapeGeo(mkShape(lakePts(L,0)),YD+.05,24));
  stoneLoop(A.stone,lakePts(L,.8),YD,YD+.5,true);
  const R=lakePts(L,dd?-3:4);for(let i=0;i<R.length;i++)if(rng()<(dd?.9:.55))shrub(R[i][0],YD,R[i][1],dd?rr(2,4.5):rr(1.2,2.6));
  if(dd)for(let q=0;q<30;q++){const P=lakePts(L,-rr(6,Math.min(L.eb,24))),p=P[Math.floor(rng()*P.length)];shrub(p[0],YD,p[1],rr(1.5,4));}}

 // ---- the pavilion clusters: glass rooms under white stone roofs round a plaza
 const pavilion=(cx,cz,rotA,w,dp,h,y0,garden,ruin)=>{const c=Math.cos(rotA),s=Math.sin(rotA);
  const L=(lx,lz)=>[cx+lx*c-lz*s,cz+lx*s+lz*c];
  const p=[L(-w/2,-dp/2),L(w/2,-dp/2),L(w/2,dp/2),L(-w/2,dp/2)];
  if(ruin&&rng()<.45){rotHexa([cx,y0+1.2,cz],[w*.9,2.4,dp*.9],qEuler(rr(-.05,.05),-rotA+rr(-.1,.1),rr(-.05,.05)),{t:A.sect,z0:A.stone,z1:A.stone,x0:A.stone,x1:A.stone});
   for(let q=0;q<6;q++)chunk(cx+rr(-w,w)*.7,y0,cz+rr(-dp,dp)*.7,[rr(1,4),rr(.5,1.5),rr(1,4)]);return;}
  let u=rng()*51.2;const yr=y0-Math.floor(rng()*8)*4.2;
  for(let i=0;i<4;i++)u+=wq(A.win,p[i],p[(i+1)%4],y0,y0,y0+h,y0+h,u,yr);
  const o=2.4,q=[L(-w/2-o,-dp/2-o),L(w/2+o,-dp/2-o),L(w/2+o,dp/2+o),L(-w/2-o,dp/2+o)],y1=y0+h,y2=y0+h+1.3;
  hexa([[q[0][0],y1,q[0][1]],[q[1][0],y1,q[1][1]],[q[2][0],y1,q[2][1]],[q[3][0],y1,q[3][1]],
   [q[0][0],y2,q[0][1]],[q[1][0],y2,q[1][1]],[q[2][0],y2,q[2][1]],[q[3][0],y2,q[3][1]]],
   {b:A.stone,t:ruin?A.sect:garden?A.grass:A.stone,z0:A.stone,x1:A.stone,z1:A.stone,x0:A.stone});
  if(garden)for(let k2=0;k2<3;k2++){const pp=L(rr(-w/3,w/3),rr(-dp/3,dp/3));shrub(pp[0],y2,pp[1],rr(1.5,3.2));}
  NBLD++;};
 for(const C of CLUS){if(dd&&inCollapse(C.ac))continue;
  if(C.hill){// a terraced hill of dwellings: glass storeys stepping back under lawns
   const rot=C.ac+Math.PI/2+rr(-.3,.3);let W=C.R*1.5,Dp=C.R*1.2,y=YD;
   for(let t=0;t<C.n;t++){const h=rr(9,13),cc=Math.cos(rot),ss=Math.sin(rot),L=(lx,lz)=>[C.cx+lx*cc-lz*ss,C.cz+lx*ss+lz*cc];
    const p=[L(-W/2,-Dp/2),L(W/2,-Dp/2),L(W/2,Dp/2),L(-W/2,Dp/2)];let u=0;
    for(let i=0;i<4;i++)u+=wq(A.win,p[i],p[(i+1)%4],y,y,y+h,y+h,u,y);
    const brk=dd&&t===C.n-1&&rng()<.6;
    quadW(A[brk?'sect':'grass'],[p[0][0],y+h,p[0][1]],[p[1][0],y+h,p[1][1]],[p[2][0],y+h,p[2][1]],[p[3][0],y+h,p[3][1]]);
    stoneLoop(A.stone,p,y+h,y+h+1.1,true);
    for(let q=0;q<Math.round(W*Dp/(dd?120:260));q++){const pp=L(rr(-W/2+3,W/2-3),rr(-Dp/2+3,Dp/2-3));
     if(t<C.n-1&&Math.abs(pp[0]-C.cx)<W*.3&&Math.abs(pp[1]-C.cz)<Dp*.3)continue;
     if(rng()<.5)tree(pp[0],y+h,pp[1],dd?rr(8,16):rr(5,9),true);else shrub(pp[0],y+h,pp[1],rr(1.5,3));}
    if(!dd)for(let q=0;q<4;q++){const pp=L((rng()<.5?-1:1)*(W/2-1.5),rr(-Dp/2,Dp/2));person(pp[0],y+h,pp[1]);}
    y+=h;W*=.72;Dp*=.72;NBLD++;}
   continue;}
  put(M.path,shapeGeo(mkShape(circ(C.cx,C.cz,C.R,40)),YD+.05,16));
  for(let i=0;i<C.n;i++){const ph=C.ph+i/C.n*TAU+rr(-.15,.15),rr0=C.R*.64,x=C.cx+rr0*Math.cos(ph),z=C.cz+rr0*Math.sin(ph);
   pavilion(x,z,ph+Math.PI/2,rr(16,28),rr(11,16),rr(8,14),YD,rng()<.4,dd);}
  kput('whBox',[C.cx,YD+11,C.cz],qEuler(0,rng()*3,0),[3.2,22,3.2],stoneC());
  kput('whBox',[C.cx,YD+.5,C.cz],null,[14,1,14],stoneD());
  if(!dd){for(let q=0;q<12;q++){const a=rng()*TAU,r=rr(9,C.R*.5);person(C.cx+r*Math.cos(a),YD,C.cz+r*Math.sin(a));}
   for(let q=0;q<4;q++){const a=q/4*TAU+.4;lamp(C.cx+C.R*.42*Math.cos(a),YD+4,C.cz+C.R*.42*Math.sin(a));}}
  else for(let q=0;q<26;q++){const a=rng()*TAU,r=rr(8,C.R);shrub(C.cx+r*Math.cos(a),YD,C.cz+r*Math.sin(a),rr(2,5));}}

 // ---- the wells: a planted rim, a ring of trees, lamps, people at the rail
 for(const W of WELLS){if(dd&&inCollapse(W.ac))continue;
  const S=wellPts(W,5);for(let i=0;i<S.length;i+=1)if(rng()<(dd?.8:.7))shrub(S[i][0],YD,S[i][1],dd?rr(2.2,4.5):rr(1.4,2.6));
  const T=wellPts(W,14);for(let i=0;i<T.length;i+=2)if(rng()<.75)tree(T[i][0],YD,T[i][1],dd?rr(12,22):rr(9,15),true);
  const Lp=wellPts(W,2.2);for(let i=0;i<Lp.length;i+=Math.max(2,Math.floor(Lp.length/6)))lamp(Lp[i][0],YD+3.2,Lp[i][1]);
  if(!dd)for(let q=0;q<5;q++){const p=Lp[Math.floor(rng()*Lp.length)];person(p[0]+rr(-1,1),YD,p[1]+rr(-1,1));}
  else{const V=wellPts(W,.3);for(let i=0;i<V.length;i++)if(rng()<.6)vine(V[i][0],YD+.8,V[i][1],rr(12,70));}}

 // ---- the woods and meadows: a noise field, cleared round everything else
 {const forestAt=(x,z)=>fbm(x*.0042+11.3,z*.0042+7.1,9.7,3);
  const thr=dd?.43:.5;
  for(let r=R0-20;r<R1+20;r+=12){for(let a=0;a<TAU;a+=12/r){
   const aa=a+rr(-4,4)/r,rj=r+rr(-4,4);if(rj<rin(aa)+28||rj>rout(aa)-(dd?52:66))continue;
   if(inCollapse(aa))continue;
   const p=P2(rj,aa),x=p[0],z=p[1];
   let ok=true;for(let k=0;k<NT;k++){const c=TC(k);if(Math.hypot(x-c[0],z-c[1])<(dd?140:158)){ok=false;break;}}if(!ok)continue;
   const sec=secOf(aa);
   for(const W of WELLS)if(W.sec===sec&&wellD(W,x,z)<(dd?6:18)){ok=false;break;}if(!ok)continue;
   for(const L of LAKES)if(L.sec===sec&&lakeD(L,x,z)<(dd?-2:9)){ok=false;break;}if(!ok)continue;
   for(const C of CLUS)if(C.sec===sec&&Math.hypot(x-C.cx,z-C.cz)<C.R+(dd?-8:10)){ok=false;break;}if(!ok)continue;
   const f=forestAt(x,z);
   if(f>thr){if(rng()<.92)tree(x,YD,z,dd?rr(12,26):rr(10,20),f<thr+.03||rng()<.25);}
   else if(rng()<(dd?.45:.035))tree(x,YD,z,dd?rr(6,16):rr(9,16),true);
   else if(dd&&rng()<.3)shrub(x,YD,z,rr(2,5));}}}

 // ============================================================ THE SPOKES
 // Promenade bridges 76 m wide: a stone walk on each edge, two strips of
 // lawn with pavilions and rows of trees, a garden down the middle broken by
 // five slot wells; a fish-belly soffit, 38 m deep at the ends and 82 in the
 // middle, and window walls down both sides.
 const TB=[-SW,-30,-9,9,30,SW];
 const spokeBody=(S,sLo,sHi,jLo,jHi)=>{
  const yb=s=>YS-44*Math.pow(Math.sin(Math.PI*clamp((s-S.sA)/(S.sB-S.sA),0,1)),1.2);
  const N=Math.max(1,Math.ceil((sHi-sLo)/10));
  const jl=TB.map((t,j)=>JAG[(j*7+S.k*5)%64]*16),jh=TB.map((t,j)=>JAG[(j*11+S.k*3+20)%64]*16);
  const sAt=(i,j)=>{const t=TB[j];
   if(i===0)return jLo?sLo+jl[j]:(sLo<=S.sA+.01?Math.sqrt(RH*RH-t*t):sLo);
   if(i===N)return jHi?sHi+jh[j]:(sHi>=S.sB-.01?sEndB(S.k,t):sHi);
   return lerp(sLo,sHi,i/N);};
  const W=(s,t)=>spokeW(S,s,t);
  const skip=i=>{if(i<0||i>=N)return false;const sm_=(sAt(i,2)+sAt(i+1,2))/2;return S.wells.some(w=>sm_>w[0]&&sm_<w[1]);};
  let uL=0,uR=0;
  for(let i=0;i<N;i++){const sk=skip(i);
   for(let j=0;j<5;j++){if(j===2&&sk)continue;
    const s00=sAt(i,j),s01=sAt(i,j+1),s10=sAt(i+1,j),s11=sAt(i+1,j+1),t0=TB[j],t1=TB[j+1];
    const a=W(s00,t0),b=W(s10,t0),c=W(s11,t1),e=W(s01,t1),key=j===0||j===4?'stone':'grass';
    quadW(A[key],[a[0],YD,a[1]],[b[0],YD,b[1]],[c[0],YD,c[1]],[e[0],YD,e[1]]);
    quadW(A.soff,[a[0],yb(s00),a[1]],[b[0],yb(s10),b[1]],[c[0],yb(s11),c[1]],[e[0],yb(s01),e[1]]);}
   // the side walls and their parapets
   for(const [j,sg] of [[0,-1],[5,1]]){const s0=sAt(i,j),s1=sAt(i+1,j),p=W(s0,TB[j]),q=W(s1,TB[j]);
    const L=wq(A.win,p,q,yb(s0),yb(s1),YD,YD,sg<0?uL:uR,YD-8*33.6);if(sg<0)uL+=L;else uR+=L;
    quadW(A.stone,[p[0],YD,p[1]],[q[0],YD,q[1]],[q[0],YD+1.2,q[1]],[p[0],YD+1.2,p[1]]);}
   // the well shafts
   if(sk){const s0=sAt(i,2),s1=sAt(i+1,2);
    for(const t of [-9,9]){const p=W(s0,t),q=W(s1,t);wq(A.win,p,q,yb(s0),yb(s1),YD,YD,s0,YD-8*33.6);
     quadW(A.stone,[p[0],YD,p[1]],[q[0],YD,q[1]],[q[0],YD+1.1,q[1]],[p[0],YD+1.1,p[1]]);}
    for(const [ii,ss] of [[i-1,s0],[i+1,s1]])if(!skip(ii)){const p=W(ss,-9),q=W(ss,9);wq(A.win,p,q,yb(ss),yb(ss),YD,YD,0,YD-8*33.6);
     quadW(A.stone,[p[0],YD,p[1]],[q[0],YD,q[1]],[q[0],YD+1.1,q[1]],[p[0],YD+1.1,p[1]]);}}}
  // broken ends
  const torn=(i,J)=>{for(let j=0;j<5;j++){const p=W(sAt(i,j),TB[j]),q=W(sAt(i,j+1),TB[j+1]),sm_=(sAt(i,j)+sAt(i,j+1))/2;
    quadW(A.sect,[p[0],yb(sm_),p[1]],[q[0],yb(sm_),q[1]],[q[0],YD,q[1]],[p[0],YD,p[1]]);FRACT.push({p:p,q:q,yb:yb(sm_)});}};
  if(jLo)torn(0);if(jHi)torn(N);};
 const spokeDress=(S,sLo,sHi)=>{const W=(s,t)=>spokeW(S,s,t);
  const inPav=(s,t)=>S.pav.some(P=>Math.abs(s-P.s)<P.w/2+4&&Math.abs(t-P.t)<P.dp/2+4);
  for(const t of [-26,-13,13,26])for(let s=sLo+8;s<sHi-6;s+=11){if(inPav(s,t)||(dd&&rng()<.2))continue;const p=W(s+rr(-1.5,1.5),t+rr(-1,1));tree(p[0],YD,p[1],dd?rr(12,22):rr(9,13),true);}
  for(let s=sLo+5;s<sHi-4;s+=7){if(S.wells.some(w=>s>w[0]-3&&s<w[1]+3))continue;const p=W(s,rr(-5,5));shrub(p[0],YD,p[1],dd?rr(2,4):rr(1.3,2.4));}
  for(const P of S.pav)if(P.s>sLo+P.w/2&&P.s<sHi-P.w/2){const c=W(P.s,P.t);pavilion(c[0],c[1],TA[S.k],P.w,P.dp,P.h,YD,P.g,dd);}
  for(let s=sLo+12;s<sHi;s+=25)for(const t of [-35.5,35.5]){const p=W(s,t);lamp(p[0],YD+4,p[1]);}
  if(!dd)for(let q=0;q<Math.round((sHi-sLo)/9);q++){const p=W(rr(sLo,sHi),(rng()<.5?-1:1)*rr(31,37));person(p[0],YD,p[1]);}
  if(dd)for(let s=sLo;s<sHi;s+=rr(6,12))for(const t of [-SW-.4,SW+.4])if(rng()<.55){const p=W(s,t);vine(p[0],YD,p[1],rr(15,80));}};
 for(const S of SPK){
  if(dd&&S.k===FS){spokeBody(S,S.sA,S.sA+SPA,false,true);spokeBody(S,S.sB-SPB,S.sB,true,false);
   spokeDress(S,S.sA,S.sA+SPA-10);spokeDress(S,S.sB-SPB+10,S.sB);}
  else{spokeBody(S,S.sA,S.sB,false,false);spokeDress(S,S.sA,S.sB);}
  // the spoke's shade on the ground, its wells cut out
  const segs=[];if(dd&&S.k===FS){segs.push([S.sA,S.sA+SPA],[S.sB-SPB,S.sB]);}else segs.push([S.sA,S.sB]);
  for(const [s0,s1] of segs){const O=[spokeW(S,s0,-SW),spokeW(S,s1,-SW),spokeW(S,s1,SW),spokeW(S,s0,SW)];
   const H=S.wells.filter(w=>w[0]>s0+4&&w[1]<s1-4).map(w=>[spokeW(S,w[0],-9),spokeW(S,w[1],-9),spokeW(S,w[1],9),spokeW(S,w[0],9)]);
   put(M.shade,shapeGeo(mkShape(O,H),0,24));}}

 // ============================================================ THE HUB
 {const hw=HWELL.map(W=>circ(W.cx,W.cz,W.R,24));
  put(M.grass,shapeGeo(mkShape(circ(0,0,RH-14,128),[circ(0,0,200,96)].concat(hw)),YD,24));
  put(M.path,shapeGeo(mkShape(circ(0,0,RH,128),[circ(0,0,RH-14,128)]),YD,16));
  put(M.stone,shapeGeo(mkShape(circ(0,0,200,96),[circ(0,0,118,64)]),YD,16));
  put(M.soff,shapeGeo(mkShape(circ(0,0,RH,128),[circ(0,0,126,64)].concat(hw)),YHB,32));
  put(M.shade,shapeGeo(mkShape(circ(0,0,RH,128),hw),0,24));
  wallLoop(A.win,circ(0,0,RH,128),YHB,YD);stoneLoop(A.stone,circ(0,0,RH-.3,128),YD,YD+1.2,true);
  for(const P of hw){wallLoop(A.win,P,YHB,YD);stoneLoop(A.stone,P,YD,YD+1.1,true);
   for(let i=0;i<P.length;i+=2){const c=HWELL[hw.indexOf(P)],a=Math.atan2(P[i][1]-c.cz,P[i][0]-c.cx);shrub(c.cx+(c.R+5)*Math.cos(a),YD,c.cz+(c.R+5)*Math.sin(a),rr(1.4,2.4));}}
  for(const rr0 of [222,300])for(let a=0;a<TAU;a+=14/rr0){const p=P2(rr0+rr(-2,2),a);if(HWELL.some(W=>Math.hypot(p[0]-W.cx,p[1]-W.cz)<W.R+12))continue;
   if(dd&&rng()<.3)continue;tree(p[0],YD,p[1],dd?rr(10,20):rr(9,14),true);}
  for(let a=0;a<TAU;a+=20/RH){const p=P2(RH-2,a);lamp(p[0],YD+4,p[1]);}
  if(!dd)for(let q=0;q<90;q++){const r=rng()<.5?rr(160,198):rr(RH-13,RH-2),a=rng()*TAU;person(r*Math.cos(a),YD,r*Math.sin(a));}}

 // ============================================================ THE TOWERS
 // a ring ledge round any plan Rf(ph,y), through a transform X
 const ledgeX=(X,Rf,y,out,th,key,n)=>{n=n||64;const Pp=(r,a,yy)=>X(r*Math.cos(a),yy,r*Math.sin(a));
  for(let i=0;i<n;i++){const a=i/n*TAU,b=(i+1)/n*TAU,ra=Rf(a,y),rb=Rf(b,y),ra2=Rf(a,y-th),rb2=Rf(b,y-th);
   quadW(A[key||'stone'],Pp(ra-1,a,y),Pp(rb-1,b,y),Pp(rb+out,b,y),Pp(ra+out,a,y));
   quadW(A.stone,Pp(ra+out,a,y),Pp(rb+out,b,y),Pp(rb+out,b,y-th),Pp(ra+out,a,y-th));
   quadW(A.soff,Pp(ra2-1,a,y-th),Pp(rb2-1,b,y-th),Pp(rb+out,b,y-th),Pp(ra+out,a,y-th));}};
 const fanX=(X,Rf,y,sc,key,n)=>{n=n||48;const c=X(0,y,0);
  for(let i=0;i<n;i++){const a=i/n*TAU,b=(i+1)/n*TAU;
   triW(A[key],c,X(Rf(a,y)*sc*Math.cos(a),y,Rf(a,y)*sc*Math.sin(a)),X(Rf(b,y)*sc*Math.cos(b),y,Rf(b,y)*sc*Math.sin(b)));}};
 // the blade fin on the outer (sg 1) or inner (sg -1) face, running past the roof
 const finX=(X,sg,yTop,yFrom)=>{const ph=sg>0?0:Math.PI,y0=yFrom||0,n=Math.max(1,Math.ceil((yTop-y0)/12)),T=3.5;
  const fw=y=>6+9*sm(y/240);
  const prof=y=>{if(y<=HT){const r=TR(ph,y);return[r-3,r+fw(y)];}
   const t=(y-HT)/Math.max(1,yTop-HT),r=TR(ph,HT),tip=r+fw(HT)*(1-.45*t);return[lerp(r-40,tip-2.5,Math.pow(t,1.3)),tip];};
  const C=(x,y,z)=>X(sg*x,y,z);
  for(let i=0;i<n;i++){const ya=lerp(y0,yTop,i/n),yb=lerp(y0,yTop,(i+1)/n),pa=prof(ya),pb=prof(yb);
   hexa([C(pa[0],ya,-T),C(pa[1],ya,-T),C(pa[1],ya,T),C(pa[0],ya,T),C(pb[0],yb,-T),C(pb[1],yb,-T),C(pb[1],yb,T),C(pb[0],yb,T)],
    {z0:A.stone,z1:A.stone,x1:A.stone,x0:yb>HT?A.stone:null,t:i===n-1?A.stone:null,b:i===0&&y0>0?A.stone:null});}};
 const towerX=k=>{const c=TC(k),er=[Math.cos(TA[k]),Math.sin(TA[k])],et=[-Math.sin(TA[k]),Math.cos(TA[k])];
  return(lx,y,lz)=>[c[0]+lx*er[0]+lz*et[0],y,c[1]+lx*er[1]+lz*et[1]];};
 const TOW=[];
 for(let k=0;k<NT;k++){const X=towerX(k),c=TC(k),broken=dd&&k===BT;
  const top=broken?(u=>YBRK+32*(fbm(u*7,1.1,9771,2)-.5)*2+14*JAG[Math.floor(u*63)%64]):(()=>HT);
  const hf=dd?holeFn(1,9772+k,broken?YBRK:null,1.3):null;
  const nv=broken?40:52;
  put(M.win,yUV(gridSurface((u,v)=>{const ph=u*TAU,y=v*top(u),r=TR(ph,y);return X(r*Math.cos(ph),y,r*Math.sin(ph));},64,nv,
   {uS:11,vS:1,hole:hf?((u,v)=>hf(u,v*top(u))):null})));
  if(dd){const y1=broken?YBRK-40:HT-4;
   put(M.void,gridSurface((u,v)=>{const ph=u*TAU,y=lerp(8,y1,v),r=TR(ph,y)*.82;return X(r*Math.cos(ph),y,r*Math.sin(ph));},24,8,{}));
   fanX(X,TR,y1,.82,'sect',24);}
  if(!broken){fanX(X,TR,HT,1,'stone');ledgeX(X,TR,HT,5,4);}
  const LED=broken?[140]:[140,420,494];
  for(const y of LED){ledgeX(X,TR,y,4.5,3.5);
   if(y>YD){for(let a=0;a<TAU;a+=15/(TR(a,y)+2)){if(dd&&rng()<.3)continue;const r=TR(a,y)+2.2,p=X(r*Math.cos(a),y,r*Math.sin(a));tree(p[0],y,p[2],dd?rr(5,9):rr(4,6.5),false);}}}
  // the fins: the outer blade runs 78 m past the roof, the inner one 34
  const fo=broken?YBRK-rr(20,50):dd&&rng()<.5?HT+rr(0,40):HT+78,fi=broken?YBRK-rr(30,60):HT+34;
  finX(X,1,fo);finX(X,-1,fi);
  // the roof garden
  if(!broken){for(let q=0;q<10;q++){const a=rng()*TAU,r=TR(a,HT)*rr(.2,.75),p=X(r*Math.cos(a),HT,r*Math.sin(a));tree(p[0],HT,p[2],dd?rr(6,12):rr(5,8),true);}
   if(!dd)for(let q=0;q<8;q++){const a=rng()*TAU,r=TR(a,HT)*rr(.3,.9),p=X(r*Math.cos(a),HT,r*Math.sin(a));person(p[0],HT,p[2]);}}
  // the foot: a plaza, lamps, people going in
  const rf=TR(0,0);
  if(!dd){for(let q=0;q<26;q++){const a=rng()*TAU,r=TR(a,0)+rr(4,40),p=X(r*Math.cos(a),0,r*Math.sin(a));person(p[0],0,p[2]);}
   for(let a=0;a<TAU;a+=TAU/16){const r=TR(a,0)+10,p=X(r*Math.cos(a),0,r*Math.sin(a));lamp(p[0],5,p[2]);}}
  kput('whDim',X(rf+.5,9,0),qEuler(0,-TA[k],0),[2,18,16],null);
  kput('whDim',X(-rf-.5,9,0),qEuler(0,-TA[k],0),[2,18,16],null);
  TOW.push({k:k,x:c[0],z:c[1],rf:rf,top:broken?YBRK:HT,fin:fo});}

 // ---- the central tower
 {const top=dd?(u=>YCC+40*(fbm(u*6,1.3,9764,2)-.5)*2+18*JAG[Math.floor(u*95)%64]):(()=>HC);
  const hf=dd?holeFn(1,9766,YCC,1.2):null;
  put(M.win,yUV(gridSurface((u,v)=>{const ph=u*TAU,y=v*top(u),r=RCf(ph,y);return[r*Math.cos(ph),y,r*Math.sin(ph)];},96,86,
   {uS:18,vS:1,hole:hf?((u,v)=>hf(u,v*top(u))):null})));
  const I=(x,y,z)=>[x,y,z];
  for(const y of [160,470,800])if(!dd||y<YCC-60)ledgeX(I,RCf,y,5,4,'stone',96);
  // the lobes' ribs, foot to crown
  for(let k=0;k<NT;k++){const yEnd=dd?YCC-rr(30,90):960;let y=20;
   while(y<yEnd){const y2=Math.min(yEnd,y+40),ra=RCf(TA[k],y)+1.5,rb=RCf(TA[k],y2)+1.5;
    beam('whBox',P3(ra,TA[k],y),P3(rb,TA[k],y2),3.4,3.4,stoneC());y=y2;}}
  // the sky ring at 640 m: a garden annulus round the tower
  {const y=640,r0=RCf(0,y)*(1-aC(y))-3,r1=212,n=96;
   for(let i=0;i<n;i++){const a=i/n*TAU,b=(i+1)/n*TAU,am=(a+b)/2;if(dd&&angS(am,200*DEG)>-.7&&angS(am,200*DEG)<.9)continue;
    quadW(A.grass,P3(r0,a,y),P3(r0,b,y),P3(r1,b,y),P3(r1,a,y));
    quadW(A.soff,P3(r0,a,y-12),P3(r0,b,y-12),P3(r1,b,y-12),P3(r1,a,y-12));
    ww(A.win,P2(r1,a),P2(r1,b),y-12,y,i*TAU*r1/n);
    quadW(A.stone,P3(r1-.3,a,y),P3(r1-.3,b,y),P3(r1-.3,b,y+1.2),P3(r1-.3,a,y+1.2));
    if(i%2===0){const p=P2(r1-9,am);tree(p[0],y,p[1],dd?rr(8,14):rr(7,10),true);}
    if(!dd&&rng()<.5){const p=P2(rr(r0+8,r1-3),am);person(p[0],y,p[1]);}
    if(i%4===0){const p=P2(r1-1.5,am);lamp(p[0],y+3.5,p[1]);}}}
  if(!dd){// the crown: the roof, a halo on eight struts, the spire
   fanX(I,RCf,HC,1,'stone',96);ledgeX(I,RCf,HC,4,3,'stone',96);
   const yh=950,n=96;
   for(let i=0;i<n;i++){const a=i/n*TAU,b=(i+1)/n*TAU,ra=RCf(a,yh)-1,rb=RCf(b,yh)-1;
    quadW(A.stone,P3(ra,a,yh),P3(rb,b,yh),P3(172,b,yh),P3(172,a,yh));
    quadW(A.soff,P3(ra,a,yh-5),P3(rb,b,yh-5),P3(172,b,yh-5),P3(172,a,yh-5));
    quadW(A.stone,P3(172,a,yh-5),P3(172,b,yh-5),P3(172,b,yh),P3(172,a,yh));}
   for(let k=0;k<NT;k++){beam('whBox',P3(RCf(TA[k],880)+1,TA[k],880),P3(168,TA[k],yh-5),3,3,stoneC());
    beam('whBox',P3(170,TA[k],yh),P3(RCf(TA[k],HC)*.6,TA[k],HC+60),2.4,2.4,stoneC());}
   for(let a=0;a<TAU;a+=11/160){const p=P2(160,a);if(rng()<.5)person(p[0],yh,p[1]);}
   for(let a=0;a<TAU;a+=18/170){const p=P2(170,a);lamp(p[0],yh+2,p[1]);}
   put(M.stone,gridSurface((u,v)=>{const ph=u*TAU,y=lerp(HC,HSP,v),r=20*Math.pow(1-v,1.3)+.5;return[r*Math.cos(ph),y,r*Math.sin(ph)];},16,8,{uS:2,vS:6}));
   ledgeX(I,(a,y)=>16,1040,6,3,'stone',32);}
  else{// broken: a gutted top, the dark core showing through the holes
   put(M.void,gridSurface((u,v)=>{const ph=u*TAU,y=lerp(YHB,YCC-50,v),r=RCf(ph,y)*.84;return[r*Math.cos(ph),y,r*Math.sin(ph)];},32,10,{}));
   fanX(I,RCf,YCC-50,.84,'sect',48);
   for(let q=0;q<60;q++){const a=rng()*TAU,p=P3(RCf(a,YCC-60)*rr(.2,.8),a,YCC-50);kput('rubble',p,qEuler(rng()*3,rng()*3,rng()*3),[rr(2,6),rr(1,3),rr(2,6)],stoneD());}
   for(let q=0;q<40;q++){const a=rng()*TAU,y=rr(YCC-120,YCC-20),p=P3(RCf(a,y)+.3,a,y);vine(p[0],p[1],p[2],rr(20,90));}}
  // the foot: the plaza, its people
  if(!dd){for(let q=0;q<140;q++){const a=rng()*TAU,r=RCf(a,0)+rr(6,70);person(r*Math.cos(a),0,r*Math.sin(a));}
   for(let a=0;a<TAU;a+=TAU/40){const r=RCf(a,0)+14;lamp(r*Math.cos(a),5,r*Math.sin(a));}}
  for(let k=0;k<NT;k++){const a=TA[k]+22.5*DEG,r=RCf(a,0);kput('whDim',P3(r+.5,a,11),qEuler(0,-a,0),[2,22,26],null);}}

 // ============================================================ THE LOWER CITY
 // the city floor, the ring roads and the avenues, the plate's shade (laid by
 // the band, spokes and hub above), a garden where each well's light lands
 put(M.pave,planarUV(gridSurface((u,v)=>{const a=u*TAU,r=RG*v;return[r*Math.cos(a),0,r*Math.sin(a)];},96,4,{}),24));
 for(const R of RRD){const n=Math.ceil(TAU*R/24);for(let i=0;i<n;i++){const a=i/n*TAU,b=(i+1)/n*TAU;
   quadW(A.road,P3(R-10,a,0),P3(R-10,b,0),P3(R+10,b,0),P3(R+10,a,0));}}
 for(const V of AV){const r1=V.hw>12?2700:RG,e=[Math.cos(V.a),Math.sin(V.a)],t=[-e[1],e[0]];
  const p=(s,q)=>[s*e[0]+q*t[0],0,s*e[1]+q*t[1]];quadW(A.road,p(V.r0,-V.hw),p(r1,-V.hw),p(r1,V.hw),p(V.r0,V.hw));}
 put(M.lawn,shapeGeo(mkShape(circ(0,0,RP1-12,120),[circ(0,0,RP0,120)]),0,24));
 const POOLS=[];
 for(const W of WELLS){if(dd&&inCollapse(W.ac))continue;POOLS.push({pts:wellPts(W,0),x:W.cx,z:W.cz,ext:W.ext,D:(x,z)=>wellD(W,x,z)});}
 for(const S of SPK)for(const w of S.wells){if(spokeGone(S.k,(w[0]+w[1])/2))continue;const c=spokeW(S,(w[0]+w[1])/2,0);
  POOLS.push({pts:[spokeW(S,w[0],-9),spokeW(S,w[1],-9),spokeW(S,w[1],9),spokeW(S,w[0],9)],x:c[0],z:c[1],ext:(w[1]-w[0])/2+9,
   D:(x,z)=>{const q=spokeLoc(S,x,z);return Math.max(Math.abs(q.t)-9,Math.max(w[0]-q.s,q.s-w[1]));}});}
 for(const P of POOLS){put(M.lawn,shapeGeo(mkShape(P.pts),0,24));
  const n=Math.round(P.ext*P.ext/180)+3;
  for(let q=0;q<n;q++){const a=rng()*TAU,r=Math.sqrt(rng())*P.ext,x=P.x+r*Math.cos(a),z=P.z+r*Math.sin(a);if(P.D(x,z)>-3)continue;
   tree(x,0,z,dd?rr(9,20):rr(8,13),true);}
  if(!dd)for(let q=0;q<5;q++){const a=rng()*TAU,r=Math.sqrt(rng())*P.ext*.8,x=P.x+r*Math.cos(a),z=P.z+r*Math.sin(a);if(P.D(x,z)<-1)person(x,0,z);}}
 // the central park
 for(let q=0;q<(dd?420:300);q++){const a=rng()*TAU,r=rr(RP0+6,RP1-16);tree(r*Math.cos(a),0,r*Math.sin(a),dd?rr(10,22):rr(8,14),true);}
 if(!dd)for(let q=0;q<80;q++){const a=rng()*TAU,r=rr(RP0,RP1-12);person(r*Math.cos(a),0,r*Math.sin(a));}
 // the buildings
 const fallZone=(x,z)=>{if(!dd)return false;const p=polar(x,z);
  if(inCollapse(p.a)&&p.r>R0-200&&p.r<R1+300)return true;
  if(angD(p.a,TA[BT])*p.r<150&&p.r>RC+120&&p.r<RC+620)return true;
  const S=SPK[FS],q=spokeLoc(S,x,z);return Math.abs(q.t)<80&&q.s>RH+SPA-20&&q.s<S.sB-SPB+20;};
 const cityBlock=(x,z,rotA,w,dp,h,sh)=>{const c=Math.cos(rotA),s=Math.sin(rotA);
  const L=(lx,lz)=>[x+lx*c-lz*s,z+lx*s+lz*c];
  const p=[L(-w/2,-dp/2),L(w/2,-dp/2),L(w/2,dp/2),L(-w/2,dp/2)];
  const wk=sh?'winsh':'win';let u=rng()*51.2;const yr=-Math.floor(rng()*8)*4.2;
  for(let i=0;i<4;i++)u+=wq(A[wk],p[i],p[(i+1)%4],0,0,h,h,u,yr);
  const rk=dd&&rng()<.55?'void':(sh?'roofsh':'stone');
  quadW(A[rk],[p[0][0],h,p[0][1]],[p[1][0],h,p[1][1]],[p[2][0],h,p[2][1]],[p[3][0],h,p[3][1]]);NBLD++;};
 for(let r=RRD[0]+18;r<RG-14;r+=rr(30,36)){for(let a=rr(0,.02);a<TAU;a+=rr(26,34)/r){
  const w=rr(16,26),dp=rr(14,22),x0=r*Math.cos(a),z0=r*Math.sin(a);
  if(RRD.some(R=>Math.abs(r-R)<10+dp/2+3))continue;
  if(AV.some(V=>r>V.r0-20&&angD(a,V.a)<Math.PI/2&&r*Math.sin(angD(a,V.a))<V.hw+w/2+3))continue;
  if(TOW.some(T=>Math.hypot(x0-T.x,z0-T.z)<T.rf+(dd?30:48)))continue;
  if(POOLS.some(P=>Math.hypot(x0-P.x,z0-P.z)<P.ext+40&&P.D(x0,z0)<14))continue;
  if(fallZone(x0,z0))continue;
  const outer=r>R1+40,under=!outer&&r>R0-40;
  if(outer&&rng()<.35)continue;
  let h=outer?rr(7,20):under?rr(14,44)+(rng()<.12?rr(20,50):0):rr(10,30)*(1+.6*sm((1000-r)/500))+(rng()<.1?rr(25,70):0);
  if(dd){if(rng()<.42)continue;h*=rr(.25,.8);}
  const sh=underPlate(x0,z0);cityBlock(x0,z0,a+Math.PI/2,w,dp,h,sh);
  // roof gardens on a quarter of the sunlit blocks
  if(!sh&&!dd&&rng()<.25)for(let q=0;q<3;q++)shrub(x0+rr(-w,w)*.3,h,z0+rr(-w,w)*.3,rr(1.6,3.2));
  if(!dd&&!outer&&rng()<.10)for(let q=0;q<2;q++){const pp=[x0+rr(-12,12),z0+rr(-12,12)];person(pp[0],0,pp[1]);}}}
 // street trees along the avenues and the inner ring road
 for(const V of AV)for(let s=V.r0+20;s<(V.hw>12?2600:RG-10);s+=16){if(dd&&rng()<.3)continue;
  for(const sg of [-1,1]){const t=sg*(V.hw+4),x=s*Math.cos(V.a)-t*Math.sin(V.a),z=s*Math.sin(V.a)+t*Math.cos(V.a);
   if(TOW.some(T=>Math.hypot(x-T.x,z-T.z)<T.rf+12)||fallZone(x,z))continue;
   tree(x,0,z,dd?rr(9,18):rr(7,11),true);}
  if(!dd&&s<RG&&Math.round(s/16)%3===0){const x=s*Math.cos(V.a),z=s*Math.sin(V.a);lamp(x-(V.hw+1)*Math.sin(V.a),6,z+(V.hw+1)*Math.cos(V.a));}}
 if(!dd)for(let q=0;q<160;q++){const V=AV[Math.floor(rng()*AV.length)],s=rr(V.r0,RG),t=rr(-V.hw,V.hw)*.9;
  person(s*Math.cos(V.a)-t*Math.sin(V.a),0,s*Math.sin(V.a)+t*Math.cos(V.a));}

 // ============================================================ THE RUIN
 const FALL={};
 if(dd){
  // ---- the fallen sector: five slabs of the band on the city, tilted, the
  // rim beam down first, with the section showing along every break
  const e0=TA[CS]+STA,e1=TA[CS+1]-STB,NB=6,BR=[e0,e0+5.5*DEG];
  for(let i=2;i<NB;i++)BR.push(lerp(e0+5.5*DEG,e1,(i-1)/(NB-1))+rr(-1.2,1.2)*DEG);BR.push(e1);
  const cuts=BR.map((a,i)=>jagPts(a,rout(a),rin(a),40+i*7));   // each cut, outer -> inner
  FALL.plate=[];
  // one slab: runs of plan points, each run tagged with what its edge is
  // ('w' an original band face, window wall; 's' a fracture, the section)
  const slab=(runs,c,T,top,H)=>{const pts=[],kind=[];for(const [P,k] of runs)for(const p of P){pts.push([p[0]-c[0],p[1]-c[1]]);kind.push(k);}
   const sh=mkShape(pts);
   const gt=shapeGeo(sh,H,24);gt.applyMatrix4(T.m);put(top,gt);
   const gb=shapeGeo(sh,0,32);gb.applyMatrix4(T.m);put(M.soff,gb);
   let u=0;for(let j=0;j<pts.length;j++){const p=pts[j],q=pts[(j+1)%pts.length];
    if(kind[j]==='w')u+=wwX(A.win,T.X,p,q,0,H,u);
    else quadW(A.sect,T.X(p[0],0,p[1]),T.X(q[0],0,q[1]),T.X(q[0],H,q[1]),T.X(p[0],H,p[1]));}};
  const UP=new THREE.Vector3(0,1,0);
  for(let i=0;i<NB;i++){const a0=BR[i],a1=BR[i+1],am=(a0+a1)/2;
   const er=new THREE.Vector3(Math.cos(am),0,Math.sin(am)),et=new THREE.Vector3(-Math.sin(am),0,Math.cos(am));
   if(i===0){// still hinged on the stub's torn edge, hanging 72 degrees down
    const c=P2((R0+R1)/2,am);
    const ax=new THREE.Vector3(Math.cos(e0),0,Math.sin(e0)),R=new THREE.Quaternion().setFromAxisAngle(ax,1.25);
    const O=new THREE.Vector3(0,YS+19,0),p0=new THREE.Vector3(c[0],YS,c[1]).sub(O).applyQuaternion(R).add(O);
    const T=mkX([p0.x,p0.y,p0.z],R);
    slab([[arcPts(rout,a0,a1),'w'],[cuts[1],'s'],[arcPts(rin,a1,a0),'w'],[cuts[0].slice().reverse(),'s']],c,T,M.grass,38);
    withXF(T,()=>{for(let q=0;q<40;q++){const p=P2(rr(R0+20,R1-30),rr(a0,a1));tree(p[0]-c[0],38,p[1]-c[1],rr(10,22),rng()<.3);}});
    continue;}
   // split along a ragged line near the middle of the band: the outer half,
   // carrying the rim beam, went down first and slid outward; the inner half
   // tipped in toward the city centre
   const rm=a=>(R0+R1)/2+14*Math.sin(a*97+i)+9*JAG[Math.floor(a*300)%64];
   const cO=cuts[i+1].filter(p=>Math.hypot(p[0],p[1])>rm(a1)),cI=cuts[i+1].filter(p=>Math.hypot(p[0],p[1])<=rm(a1));
   const dO=cuts[i].filter(p=>Math.hypot(p[0],p[1])>rm(a0)),dI=cuts[i].filter(p=>Math.hypot(p[0],p[1])<=rm(a0));
   for(const half of [0,1]){
    const runs=half===0?[[arcPts(rout,a0,a1),'w'],[cO,'s'],[arcPts(rm,a1,a0,1.5*DEG),'s'],[dO.slice().reverse(),'s']]
                       :[[arcPts(rm,a0,a1,1.5*DEG),'s'],[cI,'s'],[arcPts(rin,a1,a0),'w'],[dI.slice().reverse(),'s']];
    const cr=half===0?(R1+rm(am))/2:(R0+rm(am))/2,c=P2(cr,am),sg=half===0?1:-1;
    const Q=new THREE.Quaternion().setFromAxisAngle(et,-sg*rr(.18,.34)).multiply(new THREE.Quaternion().setFromAxisAngle(er,(i%2?1:-1)*rr(.06,.18)))
     .multiply(new THREE.Quaternion().setFromAxisAngle(UP,rr(-.22,.22)));
    const drift=half===0?rr(70,190):-rr(30,110),slide=rr(-40,40);
    const T=mkX([c[0]+er.x*drift+et.x*slide,rr(6,16),c[1]+er.z*drift+et.z*slide],Q);
    slab(runs,c,T,MAT.whDebris,38);
    // what grows on it now, the rubble it carries, and (outer) the terraces, broken
    withXF(T,()=>{for(let q=0;q<45;q++){const p=P2(half===0?rr(rm(am)+10,R1-30):rr(R0+15,rm(am)-10),rr(a0+.01,a1-.01));
      tree(p[0]-c[0],38,p[1]-c[1],rr(8,20),rng()<.3);}
     for(let q=0;q<70;q++){const p=P2(half===0?rr(rm(am)+5,R1-10):rr(R0+5,rm(am)-5),rr(a0+.005,a1-.005));
      chunk(p[0]-c[0],38,p[1]-c[1],[rr(3,12),rr(1,4),rr(3,10)]);}});
    if(half===0)for(let q=0;q<6;q++){const aa=rr(a0+.01,a1-.01),p=P2(rout(aa)-rr(15,30),aa);
     rotHexa([p[0]-c[0],38+rr(4,9),p[1]-c[1]],[rr(20,50),rr(8,18),rr(14,22)],qEuler(rr(-.3,.3),-aa+rr(-.3,.3),rr(-.3,.3)),{t:A.sect,z0:A.win,z1:A.win,x0:A.sect,x1:A.sect},T.X);}
    rubRing(T.pos[0],T.pos[2],80,240,110,7);
    FALL.plate.push({x:T.pos[0],z:T.pos[2],a:am});}}
  // the debris field over the buried city
  for(let q=0;q<1100;q++){const aa=rr(e0-.02,e1+.02),r=rr(R0-200,R1+300),p=P2(r,aa);chunk(p[0],0,p[1],[rr(3,16),rr(1.5,6),rr(3,14)]);}
  for(let q=0;q<160;q++){const aa=rr(e0,e1),r=rr(R0-100,R1+160),p=P2(r,aa),h=rr(3,12);
   cityBlock(p[0],p[1],aa+Math.PI/2+rr(-.3,.3),rr(10,20),rr(8,16),h,false);}
  // ---- the torn stubs: reinforcement out, vines, rubble on the deck edge
  for(const F of FRACT){const L=Math.hypot(F.q[0]-F.p[0],F.q[1]-F.p[1]),n=Math.max(1,Math.round(L/4));
   for(let q=0;q<n;q++){const f=rr(0,1),x=lerp(F.p[0],F.q[0],f),z=lerp(F.p[1],F.q[1],f),m=polar(x,z);
    const nx=(F.q[1]-F.p[1])/L,nz=-(F.p[0]-F.q[0])/L;
    if(rng()<.6)rebar([x,rr(F.yb+2,YD-2),z],[nx*(rng()<.5?1:-1),rr(-.3,.1),nz*(rng()<.5?1:-1)],rr(2,9));
    if(rng()<.35)vine(x,YD,z,rr(20,80));}}
  // ---- the broken tower's top, on the plain outside the rim, fin in the air
  {const k=BT,er=new THREE.Vector3(Math.cos(TA[k]),0,Math.sin(TA[k])),et=new THREE.Vector3(-Math.sin(TA[k]),0,Math.cos(TA[k]));
   FALL.tower=[];
   const piece=(y0,y1,rBase,yaw,roll,last)=>{
    const vy=er.clone().applyAxisAngle(new THREE.Vector3(0,1,0),yaw),vt=et.clone().applyAxisAngle(new THREE.Vector3(0,1,0),yaw);
    const vx=new THREE.Vector3(0,1,0).multiplyScalar(Math.cos(roll)).addScaledVector(vt,Math.sin(roll)),vz=new THREE.Vector3().crossVectors(vx,vy);
    const Q=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(vx,vy,vz));
    const base=[er.x*rBase,72,er.z*rBase],off=new THREE.Vector3(0,y0,0).applyQuaternion(Q);
    const T=mkX([base[0]-off.x,base[1]-off.y,base[2]-off.z],Q);
    const ja=u=>y0+14*JAG[Math.floor(u*63+y0)%64],jb=u=>last?y1:y1+14*JAG[Math.floor(u*63+y1)%64];
    put(M.win,gridSurface((u,v)=>{const ph=u*TAU,y=lerp(ja(u),jb(u),v),r=TR(ph,y);return T.X(r*Math.cos(ph),y,r*Math.sin(ph));},64,Math.ceil((y1-y0)/12),{uS:11,vS:(y1-y0)/33.6}));
    put(M.void,gridSurface((u,v)=>{const ph=u*TAU,y=lerp(y0+10,y1-(last?4:10),v),r=TR(ph,y)*.82;return T.X(r*Math.cos(ph),y,r*Math.sin(ph));},24,4,{}));
    fanX(T.X,TR,y0+12,.84,'sect',24);
    if(last){fanX(T.X,TR,y1,1,'stone');ledgeX(T.X,TR,y1,5,4);finX(T.X,1,HT+78,y0+6);}
    else finX(T.X,1,y1-4,y0+6);
    const mid=T.X(0,(y0+y1)/2,0);rubRing(mid[0],mid[2],60,200,90,6);
    FALL.tower.push({x:mid[0],z:mid[2]});};
   piece(YBRK+8,478,RC+250,rr(-.05,.05),.35,false);
   piece(492,HT,RC+250+(478-YBRK-8)+30,rr(.06,.12),-.25,true);
   // the stump: rubble round its foot, reinforcement out of the break
   const X=towerX(k);for(let a=0;a<TAU;a+=.12){const r=TR(a,YBRK-10),p=X(r*Math.cos(a),YBRK-10+rr(-10,20),r*Math.sin(a));
    if(rng()<.6)rebar(p,[Math.cos(a+TA[k])*.3,1,Math.sin(a+TA[k])*.3],rr(3,12));if(rng()<.4)vine(p[0],p[1],p[2],rr(20,100));}
   {const c=TC(k);rubRing(c[0]+er.x*180,c[1]+er.z*180,40,220,200,8);}}
  // ---- the fallen spoke: its middle on the avenue, one piece leaning
  {const S=SPK[FS],s0=S.sA+SPA+14,s1=S.sB-SPB-14,NP=3;FALL.spoke=[];
   for(let i=0;i<NP;i++){const sa=lerp(s0,s1,i/NP)+6,sb=lerp(s0,s1,(i+1)/NP)-6,len=sb-sa,sc=(sa+sb)/2,lean=i===1;
    const pitch=lean?.62:rr(-.08,.08),yaw=rr(-.18,.18);
    const Q=qAxis(0,1,0,-TA[FS]+yaw).multiply(qAxis(0,0,1,pitch)).multiply(qAxis(1,0,0,rr(-.1,.1)));
    const c=spokeW(S,sc,rr(-20,20)),y=lean?len*Math.sin(pitch)/2+10:16;
    rotHexa([c[0],y,c[1]],[len,40,76],Q,{t:A.debris,b:A.soff,z0:A.win,z1:A.win,x0:A.sect,x1:A.sect});
    const up=new THREE.Vector3(0,1,0).applyQuaternion(Q),ax=new THREE.Vector3(1,0,0).applyQuaternion(Q);
    for(let q=0;q<40;q++){const f=rr(-.45,.45),g2=rr(-.4,.4),v=new THREE.Vector3(c[0],y,c[1]).addScaledVector(ax,f*len).addScaledVector(up,20.2)
      .addScaledVector(new THREE.Vector3(0,0,1).applyQuaternion(Q),g2*76);tree(v.x,v.y,v.z,rr(8,16),false);}
    rubRing(c[0],c[1],50,150,80,6);FALL.spoke.push({x:c[0],z:c[1]});}}
  // ---- the central tower's crown: the spire on the hub, pieces of the halo
  {const a=205*DEG,p0=P2(150,a),p1=P2(275,a+.08);
   const L=Math.hypot(p1[0]-p0[0],p1[1]-p0[1]);
   const Q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(p1[0]-p0[0],-6,p1[1]-p0[1]).normalize());
   const T=mkX([p0[0],YD+16,p0[1]],Q);
   put(M.stone,gridSurface((u,v)=>{const ph=u*TAU,y=v*L,r=18*Math.pow(1-v,1.3)+.5;return T.X(r*Math.cos(ph),y,r*Math.sin(ph));},16,8,{uS:2,vS:6}));
   for(let q=0;q<4;q++){const aa=rr(0,TAU),r=rr(RH+60,RH+300),p=P2(r,aa);
    rotHexa([p[0],6,p[1]],[rr(40,80),6,rr(18,30)],qEuler(rr(-.4,.4),rng()*3,rr(-.4,.4)),{t:A.stone,b:A.stone,z0:A.sect,z1:A.sect,x0:A.sect,x1:A.sect});
    rubRing(p[0],p[1],10,60,30,5);}
   for(let q=0;q<80;q++){const aa=rng()*TAU,r=rr(130,RH-20),p=P2(r,aa);chunk(p[0],YD,p[1],[rr(2,8),rr(1,4),rr(2,8)]);}}
  // ---- time: vines down every edge of the band, scrub on the paths
  for(let a=0;a<TAU;a+=9/R0){if(inCollapse(a))continue;
   if(rng()<.55){const p=P2(rin(a)-.4,a);vine(p[0],YD,p[1],rr(20,110));}
   if(rng()<.5){const p=P2(rout(a)+.4,a);vine(p[0],YD,p[1],rr(20,120));}
   if(rng()<.5){const p=P2(rin(a)+rr(2,14),a);shrub(p[0],YD,p[1],rr(2,4.5));}}
  // scrub in the streets of what is left
  for(let q=0;q<1800;q++){const a=rng()*TAU,r=rr(RP0,RG),x=r*Math.cos(a),z=r*Math.sin(a);if(fallZone(x,z))continue;shrub(x,0,z,rr(2,6));}
  // a few who come to look
  for(let q=0;q<30;q++){const a=rr(-.1,.1)+TA[CS]+22.5*DEG,r=rr(R1+260,R1+420);person(r*Math.cos(a),0,r*Math.sin(a));}
 }

 // ============================================================ THE REGISTRY
 REGISTER({name:'The Wheel ('+STATE(d)+')',x:0,z:0,r:RG,h:HSP+20});
 REGISTER({name:'The Wheel — the lower city',x:0,z:0,r:RG-20,h:120});
 REGISTER({name:'The Wheel — the central tower',x:0,z:0,r:190,y:YHB-2,h:(dd?YCC:HSP)-YHB+40});
 REGISTER({name:'The Wheel — the foot of the central tower',x:0,z:0,r:340,h:YHB-4});
 REGISTER({name:'The Wheel — the hub',x:0,z:0,r:RH+4,y:YHB-4,h:YD-YHB+30});
 REGISTER({name:'The Wheel — the sky ring',x:0,z:0,r:216,y:620,h:40});
 REGISTER({name:'The Wheel — the central park',x:0,z:0,r:RP1,h:40});
 for(let k=0;k<NT;k++){const T=TOW[k];
  REGISTER({name:'The Wheel — rim tower '+(k+1)+(dd&&k===BT?' (broken)':''),x:T.x,z:T.z,r:T.rf+12,h:Math.max(T.top,T.fin)+30});
  if(dd&&k===CS)continue;
  const am=TA[k]+22.5*DEG,c=P2(RC,am);
  REGISTER({name:'The Wheel — the band, sector '+(k+1)+'-'+((k+1)%NT+1),x:c[0],z:c[1],r:360,y:YR-5,h:YD-YR+45});}
 for(const S of SPK){if(dd&&S.k===FS){const c=spokeW(S,S.sA+SPA/2+30,0);
   REGISTER({name:'The Wheel — spoke '+(S.k+1)+', the hub stub',x:c[0],z:c[1],r:100,y:YS-70,h:YD-YS+100});continue;}
  for(const f of [.2,.5,.8]){const c=spokeW(S,lerp(S.sA,S.sB,f),0);
   REGISTER({name:'The Wheel — spoke '+(S.k+1),x:c[0],z:c[1],r:110,y:YS-70,h:YD-YS+100});}}
 if(dd){const am=(TA[CS]+TA[CS+1])/2,c=P2(RC+40,am);
  REGISTER({name:'The Wheel — the fallen sector',x:c[0],z:c[1],r:560,h:110});
  if(FALL.tower){const f=FALL.tower[0],g2=FALL.tower[1];REGISTER({name:'The Wheel — the fallen top of rim tower '+(BT+1),x:(f.x+g2.x)/2,z:(f.z+g2.z)/2,r:260,h:200});}
  if(FALL.spoke){const f=FALL.spoke[1];REGISTER({name:'The Wheel — the fallen spoke',x:f.x,z:f.z,r:280,h:200});}
  REGISTER({name:'The Wheel — the broken crown',x:0,z:0,r:150,y:YCC-150,h:210});}

 // ---- what the presets are derived from ---------------------------------------
 WH_SITE[d]={x:gx,z:gz,d:d,dd:dd,RC:RC,R0:R0,R1:R1,YD:YD,YS:YS,YR:YR,RH:RH,SW:SW,RG:RG,HT:HT,HC:HC,HSP:HSP,
  YBRK:YBRK,YCC:YCC,CS:CS,BT:BT,FS:FS,TA:TA.slice(),
  wells:WELLS.map(W=>({x:W.cx,z:W.cz,r:W.type?W.hw:W.R,rc:W.rc,ac:W.ac,type:W.type,sec:W.sec,hl:W.hl||0})),
  spokes:SPK.map(S=>({k:S.k,sA:S.sA,sB:S.sB,e:S.e,t:S.t,wells:S.wells})),
  towers:TOW.map(T=>({x:T.x,z:T.z,rf:T.rf,top:T.top})),fall:FALL,
  trees:NTREE,figs:NFIG,blds:NBLD};

 // ---- merge ---------------------------------------------------------------------
 for(const k in A)put(M[k],accGeo(A[k]));
 const soffM=M.soff;
 for(const [m,L] of LST){const o=meshMerged(L,m,G);
  if(o&&!dd&&(m===MAT.whWin||m===MAT.whWinSh)){const k0=m===MAT.whWin?.22:.45;o.onBeforeRender=()=>{m.emissiveIntensity=NIGHT?1.5:k0;};}
  if(o&&m===soffM){const day=dd?TEX.whSoffRE:TEX.whSoffE,night=dd?null:TEX.whSoffN;
   o.onBeforeRender=()=>{const t=NIGHT?night:day;if(t&&m.emissiveMap!==t)m.emissiveMap=t;m.emissiveIntensity=NIGHT&&!t?0:1;};}}
 KOFF=[0,0,0];return G;}
