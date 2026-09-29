// ================================================================= THE DRUM — memorial group, 2
// A round tower 836 m tall and 344 m across at its widest tier, standing in a
// cleared court with low monolithic walls radiating from its foot. Raw
// board-formed concrete, greyer and heavier than the white Ancient stone.
//
// THE MOTIF, at two scales. Twelve radial FINS run the full height: structure,
// and the city's vertical circulation (a glazed lift slot runs up the outer edge
// of each). Between the fins, in NINE TIERS, stand wedge-planned rectangular
// BLOCKS, the dwelling clusters: flat fluted outer faces, windows on their faces
// and on the flanks of the slots between them. Between the tiers the blocks stop
// and the fins FLARE: their outer edge swings in toward the core and back out to
// meet the tier above, so every gap between two tiers is a ring of trumpet-shaped
// brackets round a recessed, windowed core, and the block roofs below it are a
// terrace street in the air.
//
// WHAT STOPS IT BEING A FLUTED COLUMN. No two tiers are alike: 1, 2 or 3 blocks
// to a bay, blocks of staggered height in some tiers, a tier of two stacked rows
// with the upper row set back, radii from 122 m (a pinched neck at 40% of the
// height) to 172 m (an overhanging tier high up), fins proud of the blocks in
// some tiers and buried behind them in others, and gaps of 20 to 48 m between
// tiers. THREE SKY GATES — arched tunnels 56-64 m wide and 110-140 m tall — are
// bored straight through the core at three levels, each on a different axis,
// with the blocks round their mouths left out, so the tower is porous and you
// see sky through it. The base splays into twelve buttress feet with portals
// between them; the crown is the fins alone, rising free past the last tier,
// leaning outward and tied by a ring: an open coronet, unlike anything below it.
//
// INTACT: pale board-marked concrete, lit windows, glazed lift slots, terraces
// planted and peopled, a court of lawns, paths, lamps and walls. RUINED: the top
// third has broken off along a jagged surface about 548 m up. A 120 m section
// above the break has rotated ten degrees on its crushed east-north-east side
// and hangs there leaning, a wedge of sky under its far edge; everything above
// it — the top tiers, the crown, the ring — lies in the court to the east as
// fallen blocks, fin slabs and crown arcs. The sky gates are torn wider, the
// wedge under the lean has lost its blocks and fins, facades are stripped to the
// floors, the windows are dead, and moss, trees and vines have the terraces.

// ---------------------------------------------------------------- the skins
// One generator, three walls, all at a 24 m tile (512 px, 21 px a metre, so the
// kit's 0.65 m form boards are 14 px):
//   kind 0  the BLOCK FACE: eight 3 m storeys by eight 3 m bays, deep-set glass
//           between pale piers; one room in five lit.
//   kind 1  the CORE: continuous ribbon windows under a board-marked spandrel,
//           in darker concrete, because it is always in the shade of a tier.
//   kind 2  the LIFT SLOT on the fin edge (an 8 m tile): a glazed slot up the
//           middle with a lift lobby every 4 m, faintly lit all the time.
function drWallTex(kind,dec,emis){const S=emis?256:512;
 return canvasTex(S,S,(g,w,h)=>{const id=g.createImageData(w,h),D=id.data;
  const NB=kind===2?1:8,NF=kind===2?2:8,bw=w/NB,fh=h/NF,bp=w/(kind===2?8:24);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
   const bi=Math.floor(x/bw),fi=Math.floor(y/fh),bx=(x-bi*bw)/bw,by=(y-fi*fh)/fh;
   const cr=h3(bi*3.17+kind*1.9,fi*7.71,6.3),c2=h3(bi*1.1+kind*2.3,fi*3.3,6.9);
   let inWin,glow;
   if(kind===0){inWin=by>.10&&by<.76&&bx>.14&&bx<.92;glow=cr<.21?.5+cr*2.2:0;}
   else if(kind===1){inWin=by>.12&&by<.64;glow=cr<.30?.42+cr:0;}
   else{const sx=x/w;inWin=sx>.34&&sx<.66&&by<.86;glow=.28+(by<.3?.34:0);}
   if(emis){const a=inWin?glow:0;D[i]=255*a;D[i+1]=184*a;D[i+2]=110*a;D[i+3]=255;continue;}
   let r,gg,b;
   if(inWin){const vg=1-by*.25;
    if(dec){const k2=cr<.3?6+c2*8:14+c2*16;r=k2;gg=k2+1;b=k2+2;}                // dead, panes out
    else if(glow>0){r=104;gg=86;b=64;}
    else{const k2=(30+c2*24)*vg;r=k2*.84;gg=k2*.95;b=k2*1.14;}
    if(kind===0&&Math.abs(bx-.53)<.018){r*=.5;gg*=.5;b*=.5;}                         // the mullion
    if(kind===1&&((x/bp)%1.5)<.07){r*=.45;gg*=.45;b*=.45;}
   }else{
    const n=fbm(x/34,y/34,kind+61.3,3),sp=fbm(x/3,y/3,kind+62.9,1);
    let v=(kind===1?96:122)+(n-.5)*38+(sp-.5)*16;
    if(y%14<1)v-=16;                                                                // form-board joints
    if(kind===0&&bx<.14)v+=12;                                                      // the pier catches the light
    if(kind===0&&bx>.92)v-=26;                                                      // and shades the glass beside it
    if(kind!==2&&by>=.76&&by<.82)v-=24;                                             // the sill's shadow
    r=v;gg=v*.985;b=v*.95;
    if(dec){const st=fbm(x/5,y/70,kind+63.1,2),pa=fbm(x/28,y/28,kind+64.7,2);
     r*=.62;gg*=.63;b*=.60;
     const m=clamp((pa-.56)*3,0,1);r=lerp(r,50,m);gg=lerp(gg,68,m);b=lerp(b,38,m);   // lichen
     if(st>.56){r*=.58;gg*=.58;b*=.58;}}}                                            // runs from every sill
   D[i]=clamp(r,0,255);D[i+1]=clamp(gg,0,255);D[i+2]=clamp(b,0,255);D[i+3]=255;}
  g.putImageData(id,0,0);});}
TEX.drBlk=drWallTex(0,0,0);TEX.drBlkR=drWallTex(0,1,0);TEX.drBlkE=drWallTex(0,0,1);
TEX.drCore=drWallTex(1,0,0);TEX.drCoreR=drWallTex(1,1,0);TEX.drCoreE=drWallTex(1,0,1);
TEX.drSlot=drWallTex(2,0,0);TEX.drSlotR=drWallTex(2,1,0);TEX.drSlotE=drWallTex(2,0,1);
// A fracture in section: a floor slab edge-on every 3 m (a 12 m tile), the dark
// of the rooms between them, a partition now and then.
TEX.drSect=canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),D=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const fy=y%64,cx=Math.floor(x/41),fi=Math.floor(y/64);
  const n=fbm(x/14,y/14,63.7,2);let v;
  if(fy<10)v=112+n*46-(fy<2?28:0);
  else if(h3(cx,fi,64.3)<.34&&x%41<6)v=66+n*26;
  else v=20+n*24+(fy<17?-8:0);
  D[i]=v*1.02;D[i+1]=v;D[i+2]=v*.93;D[i+3]=255;}
 g.putImageData(id,0,0);});

const drStd=(o)=>new THREE.MeshStandardMaterial(Object.assign({roughnessMap:TEX.concreteRM,roughness:1,metalness:0,side:DS},o));
MAT.drBlk  =drStd({map:TEX.drBlk,emissive:0xffffff,emissiveMap:TEX.drBlkE,emissiveIntensity:.42});
MAT.drBlkR =drStd({map:TEX.drBlkR});
MAT.drCore =drStd({map:TEX.drCore,emissive:0xffffff,emissiveMap:TEX.drCoreE,emissiveIntensity:.5});
MAT.drCoreR=drStd({map:TEX.drCoreR});
MAT.drSlot =drStd({map:TEX.drSlot,emissive:0xffffff,emissiveMap:TEX.drSlotE,emissiveIntensity:.8});
MAT.drSlotR=drStd({map:TEX.drSlotR});
MAT.drConc =drStd({map:TEX.concrete,color:0x75716a});
MAT.drConcR=drStd({map:TEX.concrete,color:0x5f5d56});
// SHADE IS PAINTED: nothing here casts a shadow, so a block's underside seen
// from the terrace below comes back sunlit unless it is on a dark material.
MAT.drDeck =drStd({map:TEX.concrete,color:0x8d887e});
MAT.drDeckR=drStd({map:TEX.concrete,color:0x5f6150});
MAT.drShade=drStd({map:TEX.concrete,color:0x3d3b38});
MAT.drShadeR=drStd({map:TEX.concrete,color:0x2b2c27});
MAT.drSect =drStd({map:TEX.drSect,roughnessMap:null});
// Grass, a 40 m tile: mown and even in the intact court; in the ruin rough,
// darker, with bare and scrubby patches.
function drGrassTex(dec){return canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),D=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
  const n=fbm(x/40,y/40,dec+65.1,3),q=fbm(x/6,y/6,dec+66.3,2),sp=h3(x,y,67.7+dec);
  let r=lerp(62,92,n)+(q-.5)*18,gg=lerp(96,124,n)+(q-.5)*22,b=lerp(40,56,n)+(q-.5)*10;
  if(!dec&&((x>>3)&1))gg*=1.04;                                                // mowing stripes
  if(dec){const pa=fbm(x/22,y/22,68.9,3);
   if(pa>.6){r=lerp(r,112,.6);gg=lerp(gg,92,.6);b=lerp(b,60,.6);}             // bare, dry
   else if(pa<.36){r*=.55;gg*=.72;b*=.5;}                                       // scrub
   r*=.82;gg*=.84;b*=.8;}
  r+=(sp-.5)*14;gg+=(sp-.5)*16;
  D[i]=clamp(r,0,255);D[i+1]=clamp(gg,0,255);D[i+2]=clamp(b,0,255);D[i+3]=255;}
 g.putImageData(id,0,0);});}
TEX.drGrass=drGrassTex(0);TEX.drGrassR=drGrassTex(1);
MAT.drLawn =drStd({map:TEX.drGrass,roughnessMap:null});
MAT.drLawnR=drStd({map:TEX.drGrassR,roughnessMap:null});
MAT.drPave =drStd({map:TEX.concrete,color:0x8a857a});
MAT.drPaveR=drStd({map:TEX.concrete,color:0x5c5d4e});
MAT.drVoid =drStd({color:0x0a0a0b,roughnessMap:null});
// QA (arcC): crushed earth and grit under a fallen piece
MAT.drScar =drStd({map:TEX.concrete,color:0x4a4034});
MAT.drKit  =drStd({map:TEX.concrete,color:0xffffff});
kdef('drBox',new THREE.BoxGeometry(1,1,1),MAT.drKit);
kdef('drDim',new THREE.BoxGeometry(1,1,1),MAT.drVoid);
kdef('drCyl',new THREE.CylinderGeometry(1,1,1,10),MAT.drKit);

// Presets are DERIVED from this: targets/drum/91z-views.js runs after
// 90-scene.js, so both builders have left their dimensions here.
const DR_SITE={};

function buildDrum(scene,gx,gz,d){reseed(9630+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0,D2R=Math.PI/180;

 // ---- the figure ------------------------------------------------------------------
 // RW the core, NF fins on a 30 degree bay starting at F0, TF fin thickness, GP the
 // slot between neighbouring elements. Everything is in (r, theta, y) with
 // theta measured from +x toward +z (south), so the approach axis at 95 degrees
 // runs a little west of due south.
 const RW=84,NF=12,F0=20*D2R,BAY=TAU/NF,TF=7,GP=5,YBASE=66,RFOOT=196,RPOD=214;
 // The nine tiers, bottom to top. h block height, w the gap to the next tier,
 // ro the outer face, per blocks to a bay, st staggered heights, fr the fins'
 // outer edge in the tier, rows an optional stack of rows within the tier, and
 // rm/p the waist ABOVE the tier: how far in the fins' flare swings, and how hard.
 const TIERS=[
  {h:56,w:32,ro:150,per:2,st:0,fr:154,rm:112,p:2.2},
  {h:44,w:24,ro:166,per:1,st:0,fr:160,rm:126,p:2.6},
  {h:66,w:38,ro:144,per:3,st:1,fr:148,rm:100,p:2.0},
  {h:34,w:20,ro:126,per:2,st:0,fr:130,rm:112,p:2.4},
  {h:40,w:44,ro:122,per:3,st:1,fr:126,rm:96, p:1.8},
  {h:60,w:30,ro:156,per:2,st:0,fr:150,rm:110,p:2.4,rows:[{f:.56,per:2,ro:156},{f:.44,per:3,ro:144}]},
  {h:48,w:34,ro:172,per:1,st:0,fr:166,rm:104,p:2.2},
  {h:52,w:28,ro:148,per:3,st:1,fr:152,rm:120,p:2.6},
  {h:36,w:0, ro:136,per:2,st:0,fr:140,rm:0,  p:2}];
 let yy=YBASE;
 for(const T of TIERS){T.yb=yy;T.yt=yy+T.h;yy=T.yt+T.w;
  if(!T.rows)T.rows=[{f:1,per:T.per,ro:T.ro}];
  let y0=T.yb;for(const R of T.rows){R.y0=y0;R.y1=y0+T.h*R.f;y0=R.y1;}}
 const NT=TIERS.length,TOP=TIERS[NT-1],YT=TOP.yt,YK=YT+18,YC=YT+84,RMAX=172;
 const flare=(a,b,m,p,t)=>m+(a-m)*Math.pow(1-t,p)+(b-m)*Math.pow(t,p);
 const CROWNOUT=26;
 // the fins' outer edge, bottom to top: the feet, the tiers, the waists, the crown
 const RF=y=>{if(y<=YBASE)return flare(RFOOT,TIERS[0].fr,104,2.1,clamp(y/YBASE,0,1));
  for(let i=0;i<NT;i++){const T=TIERS[i];
   if(y<=T.yt)return T.fr;
   if(i<NT-1&&y<TIERS[i+1].yb)return flare(T.fr,TIERS[i+1].fr,T.rm,T.p,(y-T.yt)/T.w);}
  return TOP.fr+CROWNOUT*Math.pow(clamp((y-YT)/(YC-YT),0,1),1.6);};
 // and its inner edge: on the core, until the core stops and the fin goes on alone
 const RI=y=>y<=YK?RW-1:lerp(RW-1,RF(y)-14,Math.pow(clamp((y-YK)/(YC-YK),0,1),.8));

 // ---- the sky gates ------------------------------------------------------------------
 // Each is on a FIN line, so the fin down its middle is the only one it cuts; it
 // swallows one tier and both gaps round it; the tunnel is a straight prism of
 // half-elliptical arch section, W wide, bored clean through the core.
 const VOIDS=[{ti:2,a:F0+BAY,W:60},{ti:5,a:F0+3*BAY,W:64},{ti:7,a:F0+5*BAY,W:56}];
 const VP=.7;
 for(const V of VOIDS){V.vy0=TIERS[V.ti-1].yt;V.vy1=TIERS[V.ti+1].yb;V.H=V.vy1-V.vy0;if(dd)V.W*=1.3;}
 const archHW=(V,y)=>{if(y<V.vy0-1e-6||y>V.vy1)return -1;const t=(y-V.vy0)/V.H;return V.W*.5*Math.sqrt(Math.max(0,1-Math.pow(t,2/VP)));};
 const wrapA=a=>{a=(a+Math.PI)%TAU;if(a<0)a+=TAU;return a-Math.PI;};
 // the angle off a gate's axis, folded onto whichever mouth is nearer
 const offAxis=(V,th)=>{let dl=wrapA(th-V.a);if(Math.abs(dl)>Math.PI/2)dl=wrapA(dl+Math.PI);return dl;};
 const finInVoid=(th,y)=>VOIDS.some(V=>Math.abs(Math.sin(th-V.a))<.01&&y>V.vy0&&y<V.vy1);

 // ---- the break (ruin) -------------------------------------------------------------------
 // cutS is the fracture the stump ends at and the leaning section begins at; cutT
 // is where the leaning section itself broke. Both are functions of azimuth only,
 // written through cos/sin so they close round the circle.
 const AF=20*D2R,LEAN=12*D2R;
 const nz=(th,s)=>fbm(Math.cos(th)*2.3+5.1,Math.sin(th)*2.3+5.7,s,3)-.5;
 const cutS=th=>548-22*Math.cos(th-AF)+30*nz(th,9633.1);
 const cutT=th=>624+8*Math.cos(th-AF-1.3)+12*nz(th,9634.7);
 const HP=new THREE.Vector3(RW*Math.cos(AF),cutS(AF),RW*Math.sin(AF));
 const qM=qAxis(-Math.sin(AF),0,Math.cos(AF),-LEAN);
 const M=new THREE.Matrix4().makeTranslation(HP.x,HP.y,HP.z)
  .multiply(new THREE.Matrix4().makeRotationFromQuaternion(qM))
  .multiply(new THREE.Matrix4().makeTranslation(-HP.x,-HP.y,-HP.z));
 // 0 stands (intact, or the stump), 1 the leaning section, 2 gone to the court
 const route=(x,y,z)=>{if(!dd)return 0;const th=Math.atan2(z,x);if(y<cutS(th))return 0;return y<cutT(th)?1:2;};

 // ---- the merge lists --------------------------------------------------------------------
 // Quads straight into per-material buffers, with world-scale UVs and a face
 // normal from the winding; a quad on the leaning section is carried through M
 // on its way in, so the lean costs no draw calls.
 const ACC={};
 const _v=new THREE.Vector3(),_n=new THREE.Vector3();
 const Q=(key,P4,UV4,cls,N4)=>{
  if(cls===undefined)cls=route((P4[0][0]+P4[2][0])*.5,(P4[0][1]+P4[2][1])*.5,(P4[0][2]+P4[2][2])*.5);
  if(cls===2)return;
  const A=ACC[key]||(ACC[key]={P:[],N:[],U:[],I:[],n:0});
  // the normal from the two diagonals, so a quad with a collapsed edge (the
  // centre of a disc) still gets one
  const a=P4[0],b=P4[1],c=P4[2],e=P4[3];
  const ux=c[0]-a[0],uy=c[1]-a[1],uz=c[2]-a[2],vx=e[0]-b[0],vy=e[1]-b[1],vz=e[2]-b[2];
  let fx=uy*vz-uz*vy,fy=uz*vx-ux*vz,fz=ux*vy-uy*vx;const fl=Math.hypot(fx,fy,fz)||1;fx/=fl;fy/=fl;fz/=fl;
  for(let k=0;k<4;k++){const p=P4[k];let nx=fx,ny=fy,nz2=fz;
   if(N4){const q=N4[k];const s=(q[0]*fx+q[1]*fy+q[2]*fz)<0?-1:1;nx=q[0]*s;ny=q[1]*s;nz2=q[2]*s;}
   if(cls===1){_v.set(p[0],p[1],p[2]).applyMatrix4(M);_n.set(nx,ny,nz2).applyQuaternion(qM);
    A.P.push(_v.x,_v.y,_v.z);A.N.push(_n.x,_n.y,_n.z);}
   else{A.P.push(p[0],p[1],p[2]);A.N.push(nx,ny,nz2);}
   A.U.push(UV4[k][0],UV4[k][1]);}
  const n=A.n;A.I.push(n,n+1,n+2,n,n+2,n+3);A.n+=4;};
 const dst=(a,b)=>Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]);
 // a vertical-ish face: u along a->b, v along a->e, offset by v0 (world height)
 const QW=(key,a,b,c,e,tile,v0,uo,cls)=>{const L1=dst(a,b),L2=dst(a,e);v0=v0||0;uo=uo||0;
  Q(key,[a,b,c,e],[[uo,v0/tile],[uo+L1/tile,v0/tile],[uo+L1/tile,(v0+L2)/tile],[uo,(v0+L2)/tile]],cls);};
 // a horizontal face in world x/z
 const QH=(key,a,b,c,e,tile,cls)=>Q(key,[a,b,c,e],[a,b,c,e].map(p=>[p[0]/tile,p[2]/tile]),cls);
 const V3=(r,th,y)=>[r*Math.cos(th),y,r*Math.sin(th)];
 // a point on the line at azimuth th, pushed sideways by off (toward +theta)
 const C3=(r,th,off,y)=>[r*Math.cos(th)-off*Math.sin(th),y,r*Math.sin(th)+off*Math.cos(th)];

 // ---- materials by state ----------------------------------------------------------------
 const MK={BLK:dd?MAT.drBlkR:MAT.drBlk,CORE:dd?MAT.drCoreR:MAT.drCore,SLOT:dd?MAT.drSlotR:MAT.drSlot,
  CONC:dd?MAT.drConcR:MAT.drConc,DECK:dd?MAT.drDeckR:MAT.drDeck,SHADE:dd?MAT.drShadeR:MAT.drShade,
  SECT:MAT.drSect,SCAR:MAT.drScar,LAWN:dd?MAT.drLawnR:MAT.drLawn,PAVE:dd?MAT.drPaveR:MAT.drPave,VOID:MAT.drVoid};

 // ---- the palette and the small things ------------------------------------------------
 const WG=new THREE.Color(0xffc478);
 const grey=()=>new THREE.Color().setHSL(rr(.08,.12),rr(.03,.08),dd?rr(.20,.28):rr(.50,.62));
 const leafC=()=>new THREE.Color().setHSL(rr(.20,.33),rr(.2,.45),dd?rr(.14,.26):rr(.20,.32));
 // kput through the lean: a thing on the leaning section goes over with it
 let PCL=null;                            // a forced state for a block's own dressing
 const put=(name,p,q,s,c)=>{const cl=PCL!==null?PCL:route(p[0],p[1],p[2]);if(cl===2)return;
  if(cl===1){KXF={m:M,q:qM};kput(name,p,q,s,c);KXF=null;}else kput(name,p,q,s,c);};
 const lit=(p,q,s)=>{if(!dd)put('strip',p,q,s,WG);};
 const person=(x,y,z,force)=>{if(dd&&!force)return;
  put('figB',[x,y,z],qEuler(0,rng()*TAU,0),1,new THREE.Color().setHSL(rr(0,.1),rr(.2,.5),rr(.25,.5)));
  put('figH',[x,y,z],null,1,new THREE.Color(0xc9a17e));};
 const TREES=[];                          // ground trees, so a preset can stand clear of them
 const plant=(x,y,z,h,conifer)=>{if(y<1)TREES.push([x,z]);put('trunk',[x,y,z],qEuler(rr(-.04,.04),rng()*TAU,rr(-.04,.04)),
   [h*.13,h*(conifer?.9:.72),h*.13],new THREE.Color().setHSL(rr(.05,.10),rr(.2,.4),rr(.12,.24)));
  if(conifer){const c=leafC();c.offsetHSL(.04,0,-.05);
   put('leafCard',[x,y+h*.42,z],qEuler(0,rng()*TAU,0),[h*.26,h*.34,h*.26],c);
   put('leafCard',[x,y+h*.78,z],qEuler(0,rng()*TAU,0),[h*.16,h*.26,h*.16],c);}
  else{const s0=h*rr(.26,.38);put('leafCard',[x+rr(-.08,.08)*h,y+h*.72,z+rr(-.08,.08)*h],
   qEuler(rr(-.07,.07),rng()*TAU,rr(-.07,.07)),[s0,s0*rr(.7,1.05),s0],leafC());}};
 const moss=(x,y,z,s)=>put('moss',[x,y+s*.2,z],qEuler(0,rng()*TAU,0),[s*rr(1,1.7),s*rr(.24,.44),s*rr(1,1.7)],
   new THREE.Color().setHSL(rr(.22,.32),rr(.3,.5),rr(.06,.13)));
 const rubble=(x,y,z,s)=>put('rubble',[x,y+s*.35,z],qEuler(rng()*3,rng()*3,rng()*3),
   [s*rr(.7,1.5),s*rr(.5,1),s*rr(.7,1.5)],new THREE.Color().setHSL(rr(.07,.12),rr(.03,.10),rr(.14,.26)));
 const heap=(cx,cz,r0,r1,n,sm,y0)=>{for(let i=0;i<n;i++){const a=rng()*TAU,q=Math.pow(rng(),2.2),r=r0+(r1-r0)*q;
  rubble(cx+Math.cos(a)*r,(y0||0)+(1-q)*(1-q)*sm*.5,cz+Math.sin(a)*r,rr(.8,sm)*(1.2-.6*q));}};

 const ST=STATE(d);
 REGISTER({name:'The Drum ('+ST+')',x:0,z:0,r:RMAX+10,h:dd?720:YC+2});
 REGISTER({name:'The Drum — the feet and portals',x:0,z:0,r:RFOOT+4,y:0,h:YBASE});

 // ---- the y samples every vertical surface shares -------------------------------------
 const YSs=new Set();
 for(let i=0;i<=14;i++)YSs.add(YBASE*i/14);
 for(let i=0;i<NT;i++){const T=TIERS[i];YSs.add(T.yb);YSs.add(T.yt);for(const R of T.rows)YSs.add(R.y1);
  if(T.h>45)YSs.add((T.yb+T.yt)*.5);
  if(i<NT-1)for(let k=1;k<12;k++)YSs.add(T.yt+T.w*k/12);}
 for(let k=1;k<=10;k++)YSs.add(YT+(YC-YT)*k/10);YSs.add(YK);
 const YS=[...YSs].map(v=>Math.round(v*1000)/1000).sort((a,b)=>a-b).filter((v,i,A)=>i===0||v-A[i-1]>.05);

 // ---- the ruin's dials -----------------------------------------------------------------
 // Fins snapped in the gaps between tiers: [fin, y0, y1] spans that are gone.
 const SNAP=[];
 if(dd)for(let f=0;f<NF;f++){const th=F0+f*BAY,near=Math.abs(wrapA(th-AF))<45*D2R;
  for(let i=0;i<NT-1;i++){const T=TIERS[i],p=(near&&(i===3||i===4||i===5))?.85:.16;
   if(rng()<p){const a=T.yt+T.w*rr(.12,.4),b=a+T.w*rr(.25,.5);SNAP.push([f,a,Math.min(b,TIERS[i+1].yb-2)]);}}}
 const snapped=(f,y)=>SNAP.some(s=>s[0]===f&&y>s[1]&&y<s[2]);
 // the wedge under the lean: its blocks fell
 const inWedge=(th,ti)=>dd&&(ti===4||ti===5)&&Math.abs(wrapA(th-AF))<42*D2R;

 // ============================================================ THE CORE
 const NU=96,CU=22;                       // 96 facets; 22 texture tiles round it
 {const hc=RW*TAU/NU*.5+.6;
  for(let j=0;j<YS.length-1;j++){const y0=YS[j],y1=YS[j+1];if(y0>=YK-1e-6)break;
   for(let i=0;i<NU;i++){const t0=i/NU*TAU,t1=(i+1)/NU*TAU,tc=(t0+t1)*.5;
    if(VOIDS.some(V=>{const hw=archHW(V,y0+.01);return hw>=0&&Math.abs(RW*Math.sin(tc-V.a))<hw+hc;}))continue;
    const n0=[Math.cos(t0),0,Math.sin(t0)],n1=[Math.cos(t1),0,Math.sin(t1)];
    Q('CORE',[V3(RW,t0,y0),V3(RW,t1,y0),V3(RW,t1,y1),V3(RW,t0,y1)],
     [[i/NU*CU,y0/24],[(i+1)/NU*CU,y0/24],[(i+1)/NU*CU,y1/24],[i/NU*CU,y1/24]],undefined,[n0,n1,n1,n0]);}}}
 // the roof of the core, a park inside the coronet, and the lantern on it
 const disc=(key,r0,r1,y,nu,nr,tile,hole)=>{for(let i=0;i<nu;i++)for(let k=0;k<nr;k++){
  const t0=i/nu*TAU,t1=(i+1)/nu*TAU,ra=lerp(r0,r1,k/nr),rb=lerp(r0,r1,(k+1)/nr);
  if(hole&&hole((t0+t1)*.5,(ra+rb)*.5))continue;
  QH(key,V3(ra,t0,y),V3(rb,t0,y),V3(rb,t1,y),V3(ra,t1,y),tile);}};
 const band=(key,r,y0,y1,nu,tile,hole,cls)=>{for(let i=0;i<nu;i++){const t0=i/nu*TAU,t1=(i+1)/nu*TAU;
  if(hole&&hole((t0+t1)*.5))continue;
  const n0=[Math.cos(t0),0,Math.sin(t0)],n1=[Math.cos(t1),0,Math.sin(t1)],cu=Math.max(1,Math.round(r*TAU/tile));
  Q(key,[V3(r,t0,y0),V3(r,t1,y0),V3(r,t1,y1),V3(r,t0,y1)],
   [[i/nu*cu,y0/tile],[(i+1)/nu*cu,y0/tile],[(i+1)/nu*cu,y1/tile],[i/nu*cu,y1/tile]],cls,[n0,n1,n1,n0]);}};
 disc('DECK',0,RW,YK,48,3,14);
 band('CONC',RW+.5,YK-.2,YK+1.6,48,8);
 band('CORE',30,YK,YK+46,32,24);band('CONC',31,YK+46,YK+49,32,8);disc('CONC',0,31,YK+49,32,1,8);
 if(!dd){put('drCyl',[0,YK+49+14,0],null,[1.2,28,1.2],grey());put('strip',[0,YK+78,0],null,[3,14,14],WG);}
 REGISTER({name:'The Drum — the core',x:0,z:0,r:RW+2,y:0,h:dd?560:YK+50});

 // ============================================================ THE SKY GATES
 for(const V of VOIDS){const ca=Math.cos(V.a),sa=Math.sin(V.a);
  const P=(s,y,t)=>[t*ca-s*sa,y,t*sa+s*ca];
  const T=s=>Math.sqrt(Math.max(1,RW*RW-s*s))+.8;
  const AP=[];for(let k=0;k<=28;k++){const ph=-Math.PI/2+Math.PI*k/28;
   AP.push([V.W*.5*Math.sin(ph),V.vy0+V.H*Math.pow(Math.max(0,Math.cos(ph)),VP)]);}
  // the lining: the walls and vault of the tunnel, windowed, the dwellings
  // looking into the gate
  for(let k=0;k<28;k++){const a=AP[k],b=AP[k+1],Ta=T(a[0]),Tb=T(b[0]);
   for(let m=0;m<6;m++){const ta0=lerp(-Ta,Ta,m/6),ta1=lerp(-Ta,Ta,(m+1)/6),tb0=lerp(-Tb,Tb,m/6),tb1=lerp(-Tb,Tb,(m+1)/6);
    Q('CORE',[P(a[0],a[1],ta0),P(a[0],a[1],ta1),P(b[0],b[1],tb1),P(b[0],b[1],tb0)],
     [[ta0/24,a[1]/24],[ta1/24,a[1]/24],[tb1/24,b[1]/24],[tb0/24,b[1]/24]]);}}
  // the floor: a public garden bored through the tower
  for(let k=0;k<6;k++){const s0=lerp(-V.W*.5,V.W*.5,k/6),s1=lerp(-V.W*.5,V.W*.5,(k+1)/6),T0=T(s0),T1=T(s1);
   for(let m=0;m<6;m++)QH('DECK',P(s0,V.vy0,lerp(-T0,T0,m/6)),P(s1,V.vy0,lerp(-T1,T1,m/6)),
    P(s1,V.vy0,lerp(-T1,T1,(m+1)/6)),P(s0,V.vy0,lerp(-T0,T0,(m+1)/6)),14);}
  // the architrave round both mouths, wrapped on the core; it also covers the
  // stepped edge where the core's facets stop
  const RFL=RW+.7,FW=8;
  for(const sg of [-1,1])for(let k=0;k<28;k++){if(dd&&h3(k,sg,9635.3)<.3)continue;
   const a=AP[k],b=AP[k+1],tx=b[0]-a[0],ty=b[1]-a[1],tl=Math.hypot(tx,ty)||1,nx=-ty/tl,ny=tx/tl;
   const W2=(s,y)=>P(s,y,sg*Math.sqrt(Math.max(1,RFL*RFL-s*s)));
   QW('CONC',W2(a[0],a[1]),W2(b[0],b[1]),W2(b[0]+nx*FW,b[1]+ny*FW),W2(a[0]+nx*FW,a[1]+ny*FW),8,0,k*tl/8);}
  // lamps and people in the gate
  for(let i=0;i<14;i++){const s=rr(-V.W*.4,V.W*.4),t=rr(-RW*.8,RW*.8);
   const p=P(s,V.vy0,t);if(rng()<.5)plant(p[0],p[1],p[2],rr(6,11));else person(p[0],p[1],p[2]);}
  if(!dd)for(const sg of [-1,1]){const p=P(0,V.vy0+V.H*.97,sg*(RW-6));put('strip',[p[0],p[1]-2,p[2]],qEuler(0,-V.a+Math.PI/2,0),[V.W*.4,10,10],WG);}
  if(dd)for(let i=0;i<40;i++){const p=P(rr(-V.W*.45,V.W*.45),V.vy0,rr(-RW,RW));moss(p[0],p[1],p[2],rr(1.5,5));}
  if(!dd||V.ti<4)REGISTER({name:'The Drum — sky gate '+(VOIDS.indexOf(V)+1),x:0,z:0,r:RW,y:V.vy0,h:V.H});}

 // ============================================================ THE FINS
 for(let f=0;f<NF;f++){const th=F0+f*BAY,ct=Math.cos(th),stt=Math.sin(th);
  const FP=(r,y,o)=>[r*ct-o*stt,y,r*stt+o*ct];
  const segCls=j=>{const y0=YS[j],y1=YS[j+1],ym=(y0+y1)*.5;
   if(y0>=YC-1e-6)return -1;
   if(finInVoid(th,ym))return -2;                     // cut clean by a gate
   if(snapped(f,ym))return -3;                        // snapped (ruin)
   return route((RW+30)*ct,ym,(RW+30)*stt);};
  const capKey=(a,b)=>(a===-2||b===-2)?'CONC':(dd?'SECT':'CONC');
  const cap=(y,cls,key)=>{const ri=RI(y),ro=RF(y);
   QH(key,FP(ri,y,-TF/2),FP(ro,y,-TF/2),FP(ro,y,TF/2),FP(ri,y,TF/2),8,cls);};
  let prev=-1;
  for(let j=0;j<YS.length-1;j++){const c=segCls(j),y0=YS[j],y1=YS[j+1];
   const live=c>=0&&c!==2;
   // caps wherever a live run starts or ends
   if(prev!==c){if(prev>=0&&prev!==2)cap(y0,prev,capKey(prev,c));if(live&&j>0)cap(y0,c,capKey(prev,c));}
   prev=c;if(!live)continue;
   const r0=RF(y0),r1=RF(y1),i0=RI(y0),i1=RI(y1);
   for(const o of [-TF/2,TF/2])Q('CONC',[FP(i0,y0,o),FP(r0,y0,o),FP(r1,y1,o),FP(i1,y1,o)],
    [[i0/8,y0/8],[r0/8,y0/8],[r1/8,y1/8],[i1/8,y1/8]],c);
   Q('SLOT',[FP(r0,y0,-TF/2),FP(r0,y0,TF/2),FP(r1,y1,TF/2),FP(r1,y1,-TF/2)],
    [[.06,y0/8],[.94,y0/8],[.94,y1/8],[.06,y1/8]],c);
   if(y0>=YK-1e-6)Q('CONC',[FP(i0,y0,TF/2),FP(i0,y0,-TF/2),FP(i1,y1,-TF/2),FP(i1,y1,TF/2)],
    [[0,y0/8],[TF/8,y0/8],[TF/8,y1/8],[0,y1/8]],c);}
  if(prev>=0&&prev!==2)cap(YS[YS.length-1]>YC?YC:YS[YS.length-1],prev,'CONC');
  // QA (arcC): the fins' flanks were blank board-marked planes wherever a gap
  // between tiers laid them open. They are inhabited walls: deep window
  // openings in storey rows (a third lit), and a balcony slab under every
  // fourth row, on both flanks, in every gap.
  for(let ti=0;ti<TIERS.length;ti++){const ya=(ti===0?YBASE:TIERS[ti-1].yt)+3,yb=TIERS[ti].yb-3;
   for(let y=ya;y<yb-3;y+=4.2){for(const sd of [-1,1]){const n=[-stt*sd,0,ct*sd],qn=qFacing(n);
     for(let r=RI(y)+8;r<RF(y)-7;r+=6.5){if(finInVoid(th,y)||snapped(f,y)||h3(f*7+sd,Math.round(y/4.2),r*.13)<.35)continue;
      const lit=!dd&&h3(r*.7,y*.3,f+sd*3)<.33;
      put(lit?'strip':'drDim',FP(r,y,sd*(TF/2+(lit?.08:.2))),qn,lit?[2.2,17,2]:[2.4,3.2,.5],lit?WG:null);}
     if(Math.round((y-ya)/4.2)%4===2&&!(dd&&rng()<.4))put('drBox',FP((RI(y)+RF(y))*.5,y-1.8,sd*(TF/2+1.2)),qn,[RF(y)-RI(y)-10,.6,2.4],grey());}}}
  // the fin's foot on the podium, and a lamp at the slot's foot
  if(!dd)put('strip',[RFOOT*ct,3,RFOOT*stt],qEuler(0,-th+Math.PI/2,0),[TF*.9,10,10],WG);}
 // the coronet: a ring tying the blade tips together
 {const yr=YC-9,rt=RF(YC)-8;
  for(let f=0;f<NF;f++){const ta=F0+f*BAY,tb=ta+BAY;
   const a0=V3(rt-2.5,ta,yr),b0=V3(rt-2.5,tb,yr),a1=V3(rt+2.5,ta,yr),b1=V3(rt+2.5,tb,yr);
   const up=p=>[p[0],p[1]+8,p[2]];
   QW('CONC',a1,b1,up(b1),up(a1),8,yr);QW('CONC',b0,a0,up(a0),up(b0),8,yr);
   QH('CONC',up(a0),up(b0),up(b1),up(a1),8);QH('SHADE',a0,a1,b1,b0,8);
   if(!dd)put('strip',V3(rt+3,ta+BAY*.5,yr+4),qEuler(0,-(ta+BAY*.5)+Math.PI/2,0),[rt*BAY*.6,8,8],WG);}
  if(!dd)REGISTER({name:'The Drum — the coronet',x:0,z:0,r:RF(YC)+4,y:YT,h:YC-YT+2});}

 // ============================================================ THE BLOCKS
 const FALLEN=[];                                        // blocks that went to the court
 let nBlk=0;
 for(let ti=0;ti<NT;ti++){const T=TIERS[ti];
  for(let ri=0;ri<T.rows.length;ri++){const R=T.rows[ri],per=R.per,lastRow=ri===T.rows.length-1;
   for(let k=0;k<NF;k++){const ta=F0+k*BAY;
    for(let j=0;j<per;j++){
     const p0=ta+BAY*j/per,p1=ta+BAY*(j+1)/per,pc=(p0+p1)*.5;
     const o0=j===0?TF/2+GP:GP/2,o1=j===per-1?TF/2+GP:GP/2;
     let y0=R.y0,y1=R.y1,ro=R.ro;
     if(T.st){const hh=h3(ti*3.1+k*.71,j*1.9,9636.1),h2=h3(ti*1.7+k*.37,j*2.3,9636.9);
      y1+=(hh-.45)*T.h*.34;y0+=(h2-.6)*T.h*.18;ro+=(h2-.5)*10;}
     if(ri>0)y0=Math.max(y0,T.rows[ri-1].y1);
     // the sky gates: a block whose middle lies inside the arch at its own top
     let gone=false;
     for(const V of VOIDS){if(Math.abs(V.ti-ti)>1)continue;
      const dl=offAxis(V,pc);if(Math.abs(dl)>=BAY)continue;
      const yt=Math.min(y1,V.vy1),hw=archHW(V,Math.max(yt,V.vy0));
      const Wo=2*ro*Math.sin(BAY)*.98,s=Math.sin(dl)/Math.sin(BAY)*Wo*.5;
      if(V.ti===ti&&hw>=0&&Math.abs(s)<hw/V.W*Wo)gone=true;
      if(dd&&V.ti!==ti&&Math.abs(dl)<BAY*.6&&h3(k,j+ti,9637.3)<.5)gone=true;}   // torn wider in the ruin
     if(gone)continue;
     const cen=V3((RW+ro)*.5,pc,(y0+y1)*.5);
     let cls=route(cen[0],cen[1],cen[2]);const cls0=cls;
     if(dd&&cls===0&&(inWedge(pc,ti)?rng()<.8:rng()<.08))cls=3;               // fallen from the stump
     if(dd&&cls===1&&rng()<.14)cls=3;                                          // and off the leaning section
     if(cls===2||cls===3){FALLEN.push({w:2*ro*Math.sin((p1-p0)*.5)-o0-o1,h:y1-y0,dp:ro-RW,ti:ti,
      src:cls===3?V3(ro,pc,(y0+y1)*.5):null});
      if(cls===3){PCL=cls0;                                                      // the socket it left
       for(let yy2=y0+3;yy2<y1-2;yy2+=9){if(rng()<.5)continue;
        put('drBox',C3(RW+rr(2,6),pc,0,yy2),qEuler(0,-pc,0),[rr(4,12),1.1,rr(8,20)],grey());}
       for(let q=0;q<5;q++)rubble(...V3(rr(RW+4,ro-4),pc+rr(-.05,.05),y0),rr(2,6));PCL=null;}
      continue;}
     nBlk++;PCL=cls;
     const stripped=dd&&rng()<.22;
     const IL0=C3(RW-1,p0,o0,y0),OL0=C3(ro,p0,o0,y0),OR0=C3(ro,p1,-o1,y0),IR0=C3(RW-1,p1,-o1,y0);
     const up=(p,y)=>[p[0],y,p[2]];
     const IL1=up(IL0,y1),OL1=up(OL0,y1),OR1=up(OR0,y1),IR1=up(IR0,y1);
     const uo=h3(k,j+ri*5,ti)*3;
     QW(stripped?'SECT':'BLK',OL0,OR0,OR1,OL1,stripped?12:24,y0,uo,cls);
     QW('BLK',IL0,OL0,OL1,IL1,24,y0,uo+.3,cls);
     QW('BLK',OR0,IR0,IR1,OR1,24,y0,uo+.6,cls);
     QH('DECK',IL1,OL1,OR1,IR1,14,cls);
     QH('SHADE',IL0,IR0,OR0,OL0,14,cls);
     // the fluting: piers standing 1.6 m proud of the face every 6 m
     const fx=OR0[0]-OL0[0],fz=OR0[2]-OL0[2],wo=Math.hypot(fx,fz),ex=fx/wo,ez=fz/wo,nx=ez,nz3=-ex;
     const nout=(nx*Math.cos(pc)+nz3*Math.sin(pc))>0?1:-1,NX=nx*nout,NZ=nz3*nout;
     if(!stripped){const nr=Math.floor(wo/6);
      for(let q=1;q<nr;q++){const l=wo*q/nr;
       const b0=[OL0[0]+ex*(l-.55),y0+.8,OL0[2]+ez*(l-.55)],b1=[OL0[0]+ex*(l+.55),y0+.8,OL0[2]+ez*(l+.55)];
       const f0=[b0[0]+NX*1.6,b0[1],b0[2]+NZ*1.6],f1=[b1[0]+NX*1.6,b1[1],b1[2]+NZ*1.6];
       const U=p=>[p[0],y1-.8,p[2]];
       QW('CONC',f0,f1,U(f1),U(f0),8,y0+.8,0,cls);
       QW('CONC',b0,f0,U(f0),U(b0),8,y0+.8,0,cls);QW('CONC',f1,b1,U(b1),U(f1),8,y0+.8,0,cls);
       QH('CONC',U(f0),U(f1),U(b1),U(b0),8,cls);}}
     else for(let yy2=y0+3;yy2<y1-2;yy2+=3){if(rng()<.55)continue;                  // floors standing out of the face
      const l=rr(.1,.9)*wo;put('drBox',[OL0[0]+ex*l+NX*rr(1,3),yy2,OL0[2]+ez*l+NZ*rr(1,3)],qEuler(0,-Math.atan2(ez,ex),0),
       [rr(4,14),.9,rr(2,6)],new THREE.Color().setHSL(.09,.05,rr(.28,.38)));}
     const mid=[(OL0[0]+OR0[0])*.5,0,(OL0[2]+OR0[2])*.5];
     // the soffit lights along the outer bottom edge
     if(!dd&&y0>YBASE-1)put('strip',[mid[0]+NX*.4,y0-.5,mid[2]+NZ*.4],qEuler(0,-Math.atan2(ez,ex),0),[wo*.85,8,8],WG);
     // a stain from every sill, in the ruin
     if(dd&&!stripped)for(let q=0;q<3;q++){const l=rr(.1,.9)*wo;
      put('stain',[OL0[0]+ex*l+NX*.3,y1-rr(8,22),OL0[2]+ez*l+NZ*.3],qFacing([NX,0,NZ]),[rr(3,8),rr(12,30),1],null);}
     // ---- the roof: a terrace where the tier ends in a gap, a garden on a set-back
     // (on a lower row only the set-back strip in front of the row above is open)
     const rIn=lastRow?RW+6:T.rows[ri+1].ro+3;
     if(ro-rIn>6){
      const nt=Math.round(wo/(dd?10:16)*(ro-rIn)/(ro-RW));
      for(let q=0;q<nt;q++){const rr1=rr(rIn,ro-4),aa=pc+rr(-.4,.4)*(p1-p0);plant(...V3(rr1,aa,y1),rr(5,dd?14:10));}
      if(!dd){for(let q=0;q<Math.round(wo/7);q++){person(...V3(rr(rIn+2,ro-3),pc+rr(-.4,.4)*(p1-p0),y1));}
       put('drBox',[mid[0]-NX*.8,y1+.6,mid[2]-NZ*.8],qEuler(0,-Math.atan2(ez,ex),0),[wo*.96,1.2,.8],grey());   // parapet
       if(rng()<.5)lit([mid[0]-NX*1.2,y1+1.4,mid[2]-NZ*1.2],qEuler(0,-Math.atan2(ez,ex),0),[wo*.8,5,5]);}
      else{for(let q=0;q<Math.round(wo*(ro-RW)/140);q++)moss(...V3(rr(rIn-3,ro-2),pc+rr(-.45,.45)*(p1-p0),y1),rr(1.5,6));
       for(let q=0;q<Math.round(wo/6);q++)put('vine',[mid[0]+ex*rr(-.45,.45)*wo+NX*.6,y1,mid[2]+ez*rr(-.45,.45)*wo+NZ*.6],
        qEuler(rr(-.1,.1),rng()*TAU,rr(-.1,.1)),[rr(1,2.2),rr(6,Math.min(28,y1-y0)),rr(1,2.2)],null);}
     }PCL=null;}}}}

 // ============================================================ THE BASE
 // the podium: three steps round the feet
 for(let s=0;s<3;s++){const r=RPOD-s*6,y0=s*.8,y1=y0+.8;
  band('CONC',r,y0,y1,96,8);disc('PAVE',r-6,r,y1,96,1,12);}
 disc('PAVE',RW,RPOD-18,2.4,96,4,12);
 // twelve portals, one in every bay, lit, each under a canopy
 for(let k=0;k<NF;k++){const th=F0+(k+.5)*BAY,er=[Math.cos(th),0,Math.sin(th)];
  put('drDim',V3(RW+.8,th,2.4+15),qFacing(er),[22,30,1.2],null);
  put('drBox',V3(RW+7,th,2.4+31),qFacing(er),[34,1.6,14],grey());
  lit(V3(RW+13.5,th,2.4+30),qFacing(er),[30,8,8]);
  if(dd){const p=V3(RW+26,th,0);heap(p[0],p[2],4,30,26,4,2.4);}}

 // ============================================================ THE COURT
 const RC=560,AX=F0+2.5*BAY;                        // the court's rim; the approach axis
 // the court floor: lawn, with the paving wherever paths run
 disc('LAWN',RPOD,RC,.12,96,6,40);
 // the allée floor: lawn between the two runs of walls, a paved way down its middle
 {const ax=Math.cos(AX),az=Math.sin(AX),lx=-az,lz=ax,P=(r,o,y)=>[r*ax+o*lx,y,r*az+o*lz];
  for(let r=RC;r<900;r+=34){const r1=Math.min(900,r+34);
   QH('LAWN',P(r,-20,.12),P(r1,-20,.12),P(r1,20,.12),P(r,20,.12),40,0);
   QH('PAVE',P(r,-5,.2),P(r1,-5,.2),P(r1,5,.2),P(r,5,.2),12,0);}
  for(let r=RPOD+2;r<RC;r+=34){const r1=Math.min(RC,r+34);QH('PAVE',P(r,-5,.2),P(r1,-5,.2),P(r1,5,.2),P(r,5,.2),12,0);}}
 disc('PAVE',RC,RC+60,.08,96,1,16,dd?(t,r)=>fbm(Math.cos(t)*4,Math.sin(t)*4,9638.1,2)>.5:null);
 // twelve paths on the fin lines, lamps along them
 for(let k=0;k<NF;k++){const th=F0+k*BAY,L=RC-RPOD,cx=(RPOD+RC)*.5;
  put('drBox',V3(cx,th,.2),qEuler(0,-th,0),[L,.2,9],dd?new THREE.Color().setHSL(.12,.06,.22):new THREE.Color().setHSL(.1,.05,.58));
  for(let r=RPOD+20;r<RC;r+=34){if(dd&&rng()<.6)continue;
   for(const o of [-7,7]){const p=C3(r,th,o,0);put('drCyl',[p[0],3,p[2]],null,[.2,6,.2],grey());lit([p[0],6.3,p[2]],null,[.8,4,4]);}}}
 // THE WALLS. A monolith is a board-marked box; a line of them radiates from the
 // foot on every bay line, stepping down as it goes out, and the approach is an
 // allée between two continuous runs of them.
 const WALLS=[];
 const wallBox=(th,ra,rb,off,hgt,thk,tilt,cls)=>{
  if(dd&&DEB&&DEB.some(q=>{const m=C3((ra+rb)*.5,th,off,0);return Math.hypot(m[0]-q.x,m[2]-q.z)<q.r;}))return;
  const y0=0,y1=hgt;
  if(dd&&tilt===2){                                                     // toppled: lying on its face
   const A0=C3(ra,th,off+thk*.5,0),B0=C3(rb,th,off+thk*.5,0),B1=C3(rb,th,off+thk*.5+hgt,0),A1=C3(ra,th,off+thk*.5+hgt,0);
   const u=p=>[p[0],thk,p[2]];
   QH('CONC',u(A0),u(B0),u(B1),u(A1),8,0);
   QW('CONC',A1,B1,u(B1),u(A1),8,0,0,0);QW('CONC',B0,A0,u(A0),u(B0),8,0,0,0);
   QW('CONC',A0,A1,u(A1),u(A0),8,0,0,0);QW('CONC',B1,B0,u(B0),u(B1),8,0,0,0);
   WALLS.push([ra,rb,th,off]);return;}
  const lean=dd&&tilt===1?rr(.08,.2)*(rng()<.5?-1:1):0;
  const A0=C3(ra,th,off-thk*.5,y0),B0=C3(rb,th,off-thk*.5,y0),B1=C3(rb,th,off+thk*.5,y0),A1=C3(ra,th,off+thk*.5,y0);
  const top=p=>{const q=C3(0,th,hgt*Math.sin(lean),0);return[p[0]+q[0],y1*Math.cos(lean),p[2]+q[2]];};
  QW('CONC',A0,B0,top(B0),top(A0),8,0,ra/8,cls);QW('CONC',B1,A1,top(A1),top(B1),8,0,rb/8,cls);
  QW('CONC',B0,B1,top(B1),top(B0),8,0,0,cls);QW('CONC',A1,A0,top(A0),top(A1),8,0,0,cls);
  QH('CONC',top(A0),top(B0),top(B1),top(A1),8,cls);
  WALLS.push([ra,rb,th,off]);};
 // ---- the ruin's debris goes down first, so the walls it landed on are not built
 let DEB=null;
 if(dd){DEB=[];
  // a piece: a box of w x h x dp, turned and laid down, its lowest corner 1.5 m
  // into the plain. The outer face keeps the block skin, the rest is fracture.
  // QA (arcC): with `brk` a piece is SHATTERED (krShard, 89d-arcube.js): torn
  // on the edges brk names, its storeys torn back unevenly from the break so the
  // floor plates step out, the section map on the tear, slab tongues and bars
  // out of it. The lantern and the coronet arcs stay boxes.
  const pushG=(key,g)=>{if(!g)return;const A=ACC[key]||(ACC[key]={P:[],N:[],U:[],I:[],n:0});
   const p=g.attributes.position,nn=g.attributes.normal,u=g.attributes.uv;
   for(let i=0;i<p.count;i++){A.P.push(p.getX(i),p.getY(i),p.getZ(i));A.N.push(nn.getX(i),nn.getY(i),nn.getZ(i));
    A.U.push(u.getX(i),u.getY(i));A.I.push(A.n+i);}
   A.n+=p.count;};
  const shard=(w,h,dp,x,z,q,outer,key2,brk)=>{
   const SH=krShard({w:w,l:dp,t:h,layers:Math.max(2,Math.min(9,Math.round(h/6.5))),brk:brk,bite:.2,tile:12,seg:7});
   const ymin=SH.low(q),ymax=SH.high(q),bury=1.5+(ymax-ymin)*rr(.06,.16);
   const M=new THREE.Matrix4().compose(new THREE.Vector3(x,-ymin-bury,z),q,new THREE.Vector3(1,1,1));
   pushG('CONC',SH.top&&SH.top.applyMatrix4(M));pushG('SHADE',SH.bot&&SH.bot.applyMatrix4(M));
   pushG(outer,SH.side&&SH.side.applyMatrix4(M));pushG(key2,SH.brk&&SH.brk.applyMatrix4(M));
   const W=(a,b,c)=>{const v=new THREE.Vector3(a,b,c).applyMatrix4(M);return[v.x,v.y,v.z];};
   for(const r of SH.rim){const n=r.n,p=r.p;
    if(r.step>1.5&&rng()<.6){const L=r.step*rr(.5,1)+rr(.8,3);
     kput('drBox',W(p[0]-n[0]*r.step*.5+n[0]*L*.5,p[1]+.35,p[2]-n[2]*r.step*.5+n[2]*L*.5),
      q.clone().multiply(qFacing([n[0],0,n[2]])).multiply(qEuler(rr(-.05,.05),0,rr(-.07,.07))),[r.len*rr(.5,.9),.7,L],grey());}
    if(rng()<.4)for(let b=0;b<2;b++){const L=rr(2.5,7);
     kput('drBox',W(p[0]+n[0]*L*.35+rr(-1.5,1.5),p[1]-rr(.4,2),p[2]+n[2]*L*.35+rr(-1.5,1.5)),
      q.clone().multiply(qFacing([n[0]+rr(-.3,.3),rr(-.3,.4),n[2]+rr(-.3,.3)])),[.3,.3,L],new THREE.Color(0x3a2a20));}}
   const R=Math.max(w,h,dp)*.5;DEB.push({x:x,z:z,r:R*.9});
   const tp=ymax-ymin-bury;
   for(let i=0;i<Math.round(R/4);i++)moss(x+rr(-.3,.3)*R,Math.max(.2,tp*rr(.3,1)),z+rr(-.3,.3)*R,rr(1,3));
   if(tp>6&&rng()<.6)plant(x+rr(-.2,.2)*R,tp*rr(.5,.9),z+rr(-.2,.2)*R,rr(5,11));
   return R;};
  const piece=(w,h,dp,x,z,yaw,rx,rz,outer,key2,brk)=>{
   if(brk)return shard(w,h,dp,x,z,new THREE.Quaternion().setFromEuler(new THREE.Euler(rx,yaw,rz,'YXZ')),outer,key2,brk);
   const m=new THREE.Matrix4().compose(new THREE.Vector3(0,0,0),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx,yaw,rz,'YXZ')),new THREE.Vector3(1,1,1));
   const cs=[];for(const a of [-1,1])for(const b of [-1,1])for(const c of [-1,1]){const v=new THREE.Vector3(a*w/2,b*h/2,c*dp/2).applyMatrix4(m);cs.push(v);}
   let ymin=1e9,ymax=-1e9;for(const v of cs){ymin=Math.min(ymin,v.y);ymax=Math.max(ymax,v.y);}
   const bury=1.5+(ymax-ymin)*rr(.08,.22);
   const X=v=>[v.x+x,v.y-ymin-bury,v.z+z];
   const c=(a,b,e)=>X(cs[(a>0?4:0)+(b>0?2:0)+(e>0?1:0)]);
   // faces: +z outer, -z inner, +-x flanks, +-y top/bottom
   QW(outer,c(-1,-1,1),c(1,-1,1),c(1,1,1),c(-1,1,1),24,0,0,0);
   QW(key2,c(1,-1,-1),c(-1,-1,-1),c(-1,1,-1),c(1,1,-1),12,0,0,0);
   QW(outer==='BLK'?'BLK':key2,c(-1,-1,-1),c(-1,-1,1),c(-1,1,1),c(-1,1,-1),24,0,0,0);
   QW(outer==='BLK'?'BLK':key2,c(1,-1,1),c(1,-1,-1),c(1,1,-1),c(1,1,1),24,0,0,0);
   QW('CONC',c(-1,1,1),c(1,1,1),c(1,1,-1),c(-1,1,-1),8,0,0,0);
   QW('SHADE',c(-1,-1,-1),c(1,-1,-1),c(1,-1,1),c(-1,-1,1),8,0,0,0);
   const R=Math.max(w,h,dp)*.5;DEB.push({x:x,z:z,r:R*.9});
   // five thousand years on it: moss on whatever faces up, a tree or two
   const tp=ymax-ymin-bury;
   for(let i=0;i<Math.round(R/4);i++)moss(x+rr(-.3,.3)*R,Math.max(.2,tp*rr(.3,1)),z+rr(-.3,.3)*R,rr(1,3));
   if(tp>6&&rng()<.6)plant(x+rr(-.2,.2)*R,tp*rr(.5,.9),z+rr(-.2,.2)*R,rr(5,11));
   return R;};
  const free=(x,z,r)=>!DEB.some(q=>Math.hypot(x-q.x,z-q.z)<(q.r+r)*.8)&&Math.hypot(x,z)>RPOD+r*.5;
  const place=(r0,r1,spread,R)=>{for(let t=0;t<40;t++){const a=AF+rr(-spread,spread)*(rng()<.7?.55:1),r=rr(r0,r1);
   const x=r*Math.cos(a),z=r*Math.sin(a);if(free(x,z,R))return[x,z];}return null;};
  // the fallen blocks: the big ones out along the line of the fall
  let nf=0;
  for(const B of FALLEN){if(nf>32)break;if(B.w<6)continue;
   const src=B.src,R=Math.max(B.w,B.h,B.dp)*.5;
   let at;
   if(src){const dr=rr(40,150),a=Math.atan2(src[2],src[0])+rr(-.25,.25);
    at=[Math.cos(a)*(RFOOT+dr),Math.sin(a)*(RFOOT+dr)];if(!free(at[0],at[1],R))at=null;}
   else at=place(260,760,.75,R);
   if(!at)continue;nf++;
   // it lies on its broadest face mostly, tipped: the smallest side goes up
   const dm=[B.w,B.h,B.dp],ord=[0,1,2].sort((a,b)=>dm[a]-dm[b]),ax=rng()<.72?ord[0]:ord[1];
   const tA=rr(.14,.42)*(rng()<.5?-1:1),tB=rr(-.2,.2);
   const rx=ax===2?Math.PI/2+tA:tB,rz=ax===0?Math.PI/2+tA:(ax===1?tA:tB);
   piece(B.w,B.h,B.dp,at[0],at[1],rng()*TAU,rx,rz,rng()<.6?'BLK':'SECT','SECT',[0,1,1,1]);}
  // the crown's blades and the fins' upper runs: long slabs
  for(let i=0;i<14;i++){const L=rr(70,150),dp=rr(26,52),R=L*.5,at=place(300,820,.9,R*.7);if(!at)continue;
   piece(TF,dp,L,at[0],at[1],rng()*TAU,rr(-.1,.1),Math.PI/2+rr(-.25,.25),'CONC','SECT',[1,0,1,0]);}
  // arcs of the coronet ring
  for(let i=0;i<7;i++){const at=place(420,900,.9,30);if(!at)continue;
   piece(rr(40,70),5,8,at[0],at[1],rng()*TAU,rr(-.3,.3),rr(-.3,.3),'CONC','SECT');}
  // the lantern, on its side
  {const at=place(500,700,.5,40);if(at)piece(56,44,56,at[0],at[1],rng()*TAU,Math.PI/2,0,'CORE','SECT');}
  // QA (arcC): the ground each piece came down on: a torn skirt of crushed earth
  // and grit under and round it (and the only contact shadow this kit has)
  for(const q of DEB.slice()){const n=14,R0=q.r*rr(1.05,1.3),ph=rng()*9;
   const rr2=a=>R0*(1+.22*Math.sin(a*3+ph)+.12*Math.sin(a*7+ph*2));
   for(let i=0;i<n;i++){const a0=i/n*TAU,a1=(i+1)/n*TAU;
    QH('SCAR',[q.x,.38,q.z],[q.x,.38,q.z],[q.x+Math.cos(a1)*rr2(a1),.38,q.z+Math.sin(a1)*rr2(a1)],[q.x+Math.cos(a0)*rr2(a0),.38,q.z+Math.sin(a0)*rr2(a0)],16,0);}}
  // rubble: a heap along the foot on the side it fell, and round every piece
  for(const q of DEB.slice())heap(q.x,q.z,q.r*.7,q.r*1.8,Math.min(60,Math.round(q.r*1.2)),5);
  for(let i=0;i<10;i++){const a=AF+rr(-.8,.8),r=rr(RFOOT-10,RFOOT+120);heap(r*Math.cos(a),r*Math.sin(a),0,50,70,9);}
  REGISTER({name:'The Drum — the fallen top',x:420*Math.cos(AF),z:420*Math.sin(AF),r:380,y:0,h:90});}
 // ---- now the walls
 for(let k=0;k<NF;k++){const th=F0+(k+.5)*BAY;
  if(Math.abs(wrapA(th-AX))<.01){
   // the allée: two runs of monoliths 44 m apart from the podium out to 900 m
   for(const off of [-22,22]){let r=RPOD+18;
    while(r<900){const L=rr(34,58),hgt=Math.max(2.6,8.5-(r-RPOD)/110)+rr(-.6,.6);
     const tilt=dd?(rng()<.18?2:rng()<.3?1:0):0;
     if(!(dd&&rng()<.12))wallBox(th,r,Math.min(r+L,900),off,hgt,4.4,tilt);
     r+=L+rr(1.2,2.5);}}
   continue;}
  const segs=[[RPOD+20,RPOD+86,11],[RPOD+98,RPOD+166,8.6],[RPOD+180,RPOD+240,6.4],[RPOD+254,RPOD+314,4.4]];
  for(const s of segs){const tilt=dd?(rng()<.14?2:rng()<.3?1:0):0;
   if(dd&&rng()<.1)continue;
   const jt=(h3(k,s[0],9639.1)-.5)*.02;
   wallBox(th+jt,s[0],s[1],0,s[2]+rr(-.5,.5),4.8,tilt);
   // a lower companion wall stepping out beside the long ones
   if(s[2]>6&&h3(k,s[1],9639.7)<.55)wallBox(th+jt,s[0]+14,s[1]-8,(h3(k,1,9639.9)<.5?-1:1)*12,s[2]*.45,3.2,dd?(rng()<.3?1:0):0);}}
 // the kerb round the court, open to the allée
 for(let i=0;i<120;i++){const t0=i/120*TAU,t1=(i+1)/120*TAU,tm=(t0+t1)*.5;
  if(Math.abs(wrapA(tm-AX))<.05)continue;if(dd&&rng()<.25)continue;
  const a0=V3(RC-1,t0,0),b0=V3(RC-1,t1,0),a1=V3(RC+1,t0,0),b1=V3(RC+1,t1,0),U=p=>[p[0],1.3,p[2]];
  QW('CONC',a1,b1,U(b1),U(a1),8,0,0,0);QW('CONC',b0,a0,U(a0),U(b0),8,0,0,0);QH('CONC',U(a0),U(b0),U(b1),U(a1),8,0);}
 REGISTER({name:'The Drum — the court',x:0,z:0,r:RC+4,y:0,h:12});
 REGISTER({name:'The Drum — the allée',x:620*Math.cos(AX),z:620*Math.sin(AX),r:60,y:0,h:10});

 // ---- planting: trees in the outer court, a forest round it; the ruin's is wild
 const onWall=(x,z)=>WALLS.some(w=>{const r=Math.hypot(x,z),a=Math.atan2(z,x),dl=wrapA(a-w[2]);
   return r>w[0]-4&&r<w[1]+4&&Math.abs(r*Math.sin(dl)-w[3])<6;});
 const onDeb=(x,z)=>DEB&&DEB.some(q=>Math.hypot(x-q.x,z-q.z)<q.r);
 const inAllee=(x,z)=>{const r=Math.hypot(x,z),dl=wrapA(Math.atan2(z,x)-AX);return Math.cos(dl)>0&&Math.abs(r*Math.sin(dl))<30;};
 for(let i=0;i<(dd?520:260);i++){const a=rng()*TAU,r=rr(dd?RPOD+10:420,RC-8),x=r*Math.cos(a),z=r*Math.sin(a);
  if(onWall(x,z)||onDeb(x,z)||inAllee(x,z))continue;plant(x,.1,z,rr(7,dd?20:13),rng()<.4);}
 for(let i=0;i<(dd?1900:1500);i++){const a=rng()*TAU,q=Math.pow(rng(),1.7),r=RC+70+q*800,x=r*Math.cos(a),z=r*Math.sin(a);
  if(onWall(x,z)||onDeb(x,z)||inAllee(x,z))continue;plant(x,0,z,rr(14,28),rng()<.75);}
 // people at the foot, in the court and up the allée
 if(!dd){for(let i=0;i<260;i++){const a=rng()*TAU,r=rr(RW+14,RPOD-4);person(r*Math.cos(a),2.4,r*Math.sin(a));}
  for(let i=0;i<220;i++){const a=rng()*TAU,r=rr(RPOD+4,RC),x=r*Math.cos(a),z=r*Math.sin(a);if(onWall(x,z))continue;person(x,.1,z);}
  for(let i=0;i<90;i++){const r=rr(RPOD+20,880),o=rr(-16,16);const p=C3(r,AX,o,0);person(p[0],.1,p[2]);}
  const f=C3(RPOD+60,AX,0,0);figures(f[0],f[2],30,14);}
 else{const f=C3(RPOD+40,AF+.3,0,0);figures(f[0],f[2],6,5);                     // explorers under the fracture
  for(let i=0;i<700;i++){const a=rng()*TAU,r=rr(RW+8,RC),x=r*Math.cos(a),z=r*Math.sin(a);
   if(onDeb(x,z)&&rng()<.5)continue;moss(x,r<RPOD?2.4:.1,z,rr(1,3.2));}}

 // ============================================================ THE FRACTURE (ruin)
 let LEANC=null;
 if(dd){
  // broken floor plates inside the core, only where the wall still stands round them
  let mnS=1e9,mxS=-1e9,mnT=1e9;for(let i=0;i<96;i++){const t=i/96*TAU;mnS=Math.min(mnS,cutS(t));mxS=Math.max(mxS,cutS(t));mnT=Math.min(mnT,cutT(t));}
  disc('CONC',0,RW,mnS-.5,48,3,8);
  for(let y=mnS+9;y<mxS;y+=9)disc('DECK',RW*.2,RW-.5,y,48,2,14,(t)=>cutS(t)<y+2);
  // the leaning section's underside, and its own floors above the lower rim
  {const yb=mxS;const bot=[];
   for(let i=0;i<48;i++)for(let k=0;k<3;k++){const t0=i/48*TAU,t1=(i+1)/48*TAU,ra=RW*k/3,rb=RW*(k+1)/3;
    Q('SHADE',[V3(ra,t0,yb),V3(rb,t0,yb),V3(rb,t1,yb),V3(ra,t1,yb)],[[0,0],[1,0],[1,1],[0,1]].map(u=>[u[0]*2,u[1]*2]),1);}
   void bot;
   for(let y=yb-9;y>mnS;y-=9){for(let i=0;i<48;i++){const t0=i/48*TAU,t1=(i+1)/48*TAU,tm=(t0+t1)*.5;if(cutS(tm)>y-2)continue;
     Q('DECK',[V3(RW*.2,t0,y),V3(RW-.5,t0,y),V3(RW-.5,t1,y),V3(RW*.2,t1,y)],[[0,0],[1,0],[1,1],[0,1]],1);}}
   // its broken top, and floors under the upper rim
   for(let i=0;i<48;i++)for(let k=0;k<3;k++){const t0=i/48*TAU,t1=(i+1)/48*TAU,ra=RW*k/3,rb=RW*(k+1)/3;
    Q('CONC',[V3(ra,t0,mnT),V3(rb,t0,mnT),V3(rb,t1,mnT),V3(ra,t1,mnT)],[[0,0],[2,0],[2,2],[0,2]],1);}}
  // rebar and slab ends out of both fracture rims, and rubble on every broken top
  for(let i=0;i<150;i++){const t=rng()*TAU,top=rng()<.5,y=top?cutT(t)-rr(1,6):cutS(t)-rr(1,4);
   const r=rr(RW-2,RW+2),cl=top?1:0,p=V3(r,t,y);
   if(rng()<.5){const q=V3(r+rr(-4,6),t+rr(-.04,.04),y+(top?rr(4,16):rr(4,18)));
    if(cl===1){KXF={m:M,q:qM};beam('drBox',p,q,.5,.5,new THREE.Color().setHSL(.07,.3,rr(.1,.16)));KXF=null;}
    else beam('drBox',p,q,.5,.5,new THREE.Color().setHSL(.07,.3,rr(.1,.16)));}
   else{if(cl===1){KXF={m:M,q:qM};kput('drBox',p,qEuler(rr(-.2,.2),-t,rr(-.2,.2)),[rr(6,16),1,rr(4,10)],grey());KXF=null;}
    else kput('drBox',p,qEuler(rr(-.2,.2),-t,rr(-.2,.2)),[rr(6,16),1,rr(4,10)],grey());}}
  PCL=0;heap(0,0,0,RW*.9,90,6,mnS-.4);PCL=null;
  // the crushed storeys under the hinge, holding the leaning section up
  for(let i=0;i<40;i++){const a=AF+rr(-.35,.35),r=rr(RW-24,RW+26),p=V3(r,a,cutS(a)-rr(0,8));
   kput('drBox',p,qEuler(rr(-.5,.5),rng()*TAU,rr(-.5,.5)),[rr(8,24),rr(3,10),rr(8,24)],grey());}
  // the stump's top: moss and saplings on the broken tiers
  const c=new THREE.Vector3(0,(mxS+mnT)*.5,0).applyMatrix4(M);LEANC=[c.x,c.y,c.z];
  REGISTER({name:'The Drum — the leaning section',x:c.x,z:c.z,r:RMAX+20,y:mnS-10,h:mnT-mnS+60});
  DR_SITE['cut'+d]={mnS:mnS,mxS:mxS,mnT:mnT};}

 // ---- a clear place to stand in the fallen field, for the people-scale preset:
 // out on the edge of it, 25 m from any piece, looking back at the stump with as
 // many pieces as possible between
 let EYE=null;
 if(DEB){let best=-1;
  // QA (arcC): inside the kerb (the court is r 560): it stood out on bare soil
  for(let i=0;i<900;i++){const a=AF+rr(-.8,.8),r=rr(380,535),x=r*Math.cos(a),z=r*Math.sin(a);
   if(DEB.some(q=>Math.hypot(x-q.x,z-q.z)<q.r*1.9+10)||onWall(x,z)||TREES.some(t=>Math.hypot(x-t[0],z-t[1])<14))continue;
   let sc=0;for(const q of DEB){const t=(q.x*x+q.z*z)/(r*r),ox=q.x-t*x,oz=q.z-t*z;
    if(t>.25&&t<.85&&Math.hypot(ox,oz)<40+q.r)sc++;}
   if(sc>best){best=sc;EYE={x:x,z:z,tx:0,tz:0};}}}
 // ---- what the presets are derived from ---------------------------------------------
 DR_SITE[d]={x:gx,z:gz,d:d,dd:dd,RW:RW,RMAX:RMAX,F0:F0,BAY:BAY,YBASE:YBASE,YT:YT,YK:YK,YC:YC,RC:RC,AX:AX,AF:AF,
  RFOOT:RFOOT,RPOD:RPOD,TIERS:TIERS.map(T=>({yb:T.yb,yt:T.yt,ro:T.ro,w:T.w})),
  VOIDS:VOIDS.map(V=>({a:V.a,vy0:V.vy0,vy1:V.vy1,W:V.W})),LEANC:LEANC,
  CUT:dd?{s:cutS(AF+Math.PI),t:cutT(AF),hinge:[HP.x,HP.y,HP.z]}:null,
  DEB:DEB?DEB.slice(0,12):null,EYE:EYE,nBlk:nBlk};

 // ---- merge ---------------------------------------------------------------------------
 for(const key in ACC){const A=ACC[key];if(!A.n)continue;
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(A.P,3));
  g.setAttribute('normal',new THREE.Float32BufferAttribute(A.N,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(A.U,2));
  g.setIndex(A.I);
  mesh(g,MK[key],G);}
 KOFF=[0,0,0];return G;}
