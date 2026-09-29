// ================================================================= REED LAKE — materials, geometry, kit items (prefix hRL / RPAL)
// The floating reed villages of the lake tribes: everything is REED — cut reed piled into floating islands, reed
// bundles lashed into columns, arches, boats and bridges, woven reed matting for walls, thatch for roofs. Timber
// is scarce (a few eucalyptus poles for anchors and stilts); stone only as a hearth slab; iron only salvage. The
// painted vocabulary is woven, Andean: stepped diamonds, zigzags, step-frets and the chakana, in madder, ochre, black and white.
// The painted vocabulary is ANDEAN textile geometry (stepped diamonds, zigzags, step-frets, the chakana), woven and
// dyed, never carved — see the RAND palette below. Palette: sRGB hex, tint with hC(). Straw and gold on the water's teal.
const RPAL={
 straw:[0xd8c27e,0xcfb46e,0xe2cc8a,0xc8ac62],          // fresh cut reed, bundles, matting
 strawOld:[0xb8a068,0xa89058,0xc0a870,0x9c8650],       // last season's reed, the island's older layers
 strawGrey:[0x9a8e70,0x8e8266,0xa69a7a],               // weathered mat and thatch
 island:[0xc9b36c,0xbfa862,0xd2bc78],                  // the island's cut-reed top
 reedGreen:[0x6f8f3a,0x7a9a44,0x5f7f32,0x88a050],      // living reed beds
 mud:[0x6a5a44,0x5e4e3a,0x74644c],                     // the mud of the garden rafts
 pole:[0x8a7a62,0x7a6a54,0x968670],                    // eucalyptus poles: anchors, stilts, dock posts
 rope:[0x9a8a6a,0x8a7a5a],
 water:0x2f6a72,
 teal:HPAL.teal,red:HPAL.red,white:HPAL.white,black:HPAL.black,ochre:HPAL.ochre,
};
const hRLC=hC;

// ---------------------------------------------------------------- textures
// Reed BUNDLE: stalks running along y (vertical), rope lashings every half tile. Ku tiles round the bundle, Kv along it.
TEX.rlBundle=canvasTex(64,128,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const st=Math.floor(x/3);
  let v=190+(h3(st*1.7,0,2.2)-.5)*54+(fbm(x/1.5,y/26,5.1,2)-.5)*26;
  if(x%3===0)v-=48;                                                    // the gap between stalks
  const node=fbm(x/3,y/6,st*.7,1);if(node>.74)v-=30;                   // stalk nodes
  const band=(y%64);let r=v,gg=v*.88,b=v*.62;                          // straw
  if(band<7){const k=band<1||band>5?.55:.78;r=112*k+40;gg=96*k+30;b=70*k+20;}   // lashing: dark rope, lit ridge
  d[i]=r;d[i+1]=gg;d[i+2]=b;d[i+3]=255;}
 g.putImageData(id,0,0);});
// Woven reed MATTING: a 2 m tile of 0.12 m strips in a twill weave, straw with darker shadow under each strip.
TEX.rlMat=canvasTex(128,128,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const S=8;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const cx=Math.floor(x/S),cy=Math.floor(y/S),fx=x%S,fy=y%S;
  const over=((cx+cy)%2===0);                                          // which strip lies on top in this cell
  let v=196+(h3(over?cx:cy,over?0:1,3.3)-.5)*40+(fbm(x/3,y/3,6.6,1)-.5)*14;
  const e=over?fy:fx;if(e<1)v-=56;else if(e<2)v-=24;else if(e>S-2)v+=10;   // the strip's shadowed edge and lit edge
  const grain=over?fbm(x/1.2,y/9,1.1,1):fbm(x/9,y/1.2,1.1,1);v+=(grain-.5)*18;
  d[i]=v;d[i+1]=v*.88;d[i+2]=v*.6;d[i+3]=255;}
 g.putImageData(id,0,0);});
// Reed LATTICE (alpha): the open diamond lattice of a mudhif front — flat reed strips crossing diagonally.
TEX.rlLattice=canvasTex(128,128,(g,w,h)=>{g.clearRect(0,0,w,h);const S=32,T=7;
 for(let k=-4;k<8;k++){for(const dir of[1,-1]){g.save();g.translate(w/2,h/2);g.rotate(dir*Math.PI/4);g.fillStyle=dir>0?'#c9b06a':'#b89c5a';g.fillRect(-w,k*S-T/2,2*w,T);
  g.fillStyle='rgba(60,40,20,.35)';g.fillRect(-w,k*S+T/2-2,2*w,2);g.restore();}}});
// Totora THATCH: finer and paler than the highland thatch — long straws laid down the slope in loose courses.
TEX.rlThatch=canvasTex(128,128,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const row=Math.floor(y/32),fy=y%32;
  let v=184+(h3(Math.floor(x/1.5)*1.3,row,2.2)-.5)*48+(fbm(x/1.3,y/22,3.1,2)-.5)*30+(fbm(x/24,y/24,7.7,2)-.5)*14;
  v-=clamp((fy-22)/10,0,1)*30;if(fy<2)v+=12;
  d[i]=v;d[i+1]=v*.87;d[i+2]=v*.6;d[i+3]=255;}
 g.putImageData(id,0,0);});
// ISLAND TOP: the cut reed of the island surface — a dense mat of short pale straws lying every way, damp patches, green tufts.
TEX.rlIsland=canvasTex(256,256,(g,w,h)=>{g.fillStyle='#b8a262';g.fillRect(0,0,w,h);
 for(let k=0;k<2600;k++){const x=h3(k,1,2)*w,y=h3(k,3,4)*h,a=h3(k,5,6)*Math.PI,L=6+h3(k,7,8)*16;const t=h3(k,9,1);
  g.strokeStyle=t<.15?'#8a7440':t<.5?'#d8c27e':t<.85?'#c4ac66':'#e6d494';g.lineWidth=1+h3(k,2,3);
  g.beginPath();g.moveTo(x-Math.cos(a)*L,y-Math.sin(a)*L);g.lineTo(x+Math.cos(a)*L,y+Math.sin(a)*L);g.stroke();}
 for(let k=0;k<90;k++){const x=h3(k,11,2)*w,y=h3(k,13,4)*h;g.fillStyle='rgba(60,50,30,'+(.08+h3(k,1,1)*.14)+')';g.beginPath();g.ellipse(x,y,6+h3(k,2,2)*18,4+h3(k,3,3)*10,h3(k,4,4)*3,0,TAU);g.fill();}
 for(let k=0;k<120;k++){const x=h3(k,21,2)*w,y=h3(k,23,4)*h;g.strokeStyle=h3(k,1,2)<.5?'#6f8f3a':'#88a050';g.lineWidth=1.2;
  for(let j=0;j<4;j++){const a=-Math.PI/2+(j-1.5)*.35;g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a)*7,y+Math.sin(a)*7);g.stroke();}}});
// ISLAND SIDE: layers of reed lying horizontally, older and darker down toward the water.
TEX.rlLayer=canvasTex(128,128,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const st=Math.floor(y/2.5);
  let v=172+(h3(st*1.9,0,3.1)-.5)*60+(fbm(x/28,y/1.5,2.2,2)-.5)*30;if(y%13<1)v-=40;   // a course line every 0.2 m
  const damp=1-Math.min(1,y/h*1.4);v*=.72+.28*damp;
  d[i]=v;d[i+1]=v*.86;d[i+2]=v*.58;d[i+3]=255;}
 g.putImageData(id,0,0);});
// FRINGE (alpha): loose reed ends hanging from an eave or the island's edge — strands from the top, ragged below.
TEX.rlFringe=canvasTex(128,64,(g,w,h)=>{g.clearRect(0,0,w,h);for(let k=0;k<70;k++){const x=h3(k,1,1)*w,L=h*(.45+h3(k,2,2)*.55),lean=(h3(k,3,3)-.5)*8;
 g.strokeStyle=h3(k,4,4)<.5?'#cbb36e':'#b39c5c';g.lineWidth=1.4+h3(k,5,5)*1.4;g.beginPath();g.moveTo(x,0);g.quadraticCurveTo(x+lean*.4,L*.5,x+lean,L);g.stroke();}});
// LIVING REEDS (alpha): a clump of tall green stalks with brown seed heads, for the reed beds round every island.
TEX.rlReed=canvasTex(128,128,(g,w,h)=>{g.clearRect(0,0,w,h);for(let k=0;k<26;k++){const x=w*(.15+h3(k,1,1)*.7),lean=(h3(k,2,2)-.5)*26,top=h*(.02+h3(k,3,3)*.3);
 const gr=h3(k,4,4);g.strokeStyle=gr<.4?'#6f8f3a':gr<.8?'#8aaa4c':'#a8b860';g.lineWidth=2.4+h3(k,5,5)*1.4;g.beginPath();g.moveTo(x,h);g.quadraticCurveTo(x+lean*.3,h*.55,x+lean,top);g.stroke();
 if(h3(k,6,6)<.55){g.fillStyle=h3(k,7,7)<.5?'#6a4a2a':'#8a6a3a';g.beginPath();g.ellipse(x+lean,top+6,2.2,7,lean*.02,0,TAU);g.fill();}
 for(let j=0;j<2;j++){const t=.35+j*.25;const px=x+lean*t*t,py=h-(h-top)*t;g.strokeStyle='#6f8f3a';g.lineWidth=1;g.beginPath();g.moveTo(px,py);g.lineTo(px+(j?-9:9),py-12);g.stroke();}}});
// NET (alpha): a fishing net — a square mesh of thin dark cord.
TEX.rlNet=canvasTex(128,128,(g,w,h)=>{g.clearRect(0,0,w,h);g.strokeStyle='#3a3226';g.lineWidth=1.2;for(let k=0;k<=8;k++){const p=k*16;g.beginPath();g.moveTo(p,0);g.lineTo(p,h);g.stroke();g.beginPath();g.moveTo(0,p);g.lineTo(w,p);g.stroke();}});
// WATER: teal-green lake water with a ripple field; 90-rl-scene.js scrolls it.
TEX.rlWater=canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;   // periodic (sums of whole-tile sinusoids), so the 8 m tiles show no seam
 const W=[[1,2,0],[3,1,1.3],[2,5,2.1],[5,3,.7],[7,2,3.3],[4,7,1.9],[9,6,2.6],[6,10,.4]];
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;let n=0;for(const [fx,fy,ph] of W)n+=Math.sin(TAU*(fx*x/w+fy*y/h)+ph)/Math.sqrt(fx*fx+fy*fy);
  const k=.86+n*.09;d[i]=70*k;d[i+1]=118*k;d[i+2]=122*k;d[i+3]=255;}
 g.putImageData(id,0,0);});
// ---------------------------------------------------------------- the painted vocabulary: ANDEAN textile geometry
// Nothing carved, nothing curvilinear: the lake people weave and dye. Stepped diamonds, zigzags, step-frets and the
// stepped cross (chakana) in madder red, ochre, black and undyed white, with a little indigo — the bands of an
// awayo cloth. Colour-carrying maps: never tint them.
const RAND={red:'#a8352a',ochre:'#d19a3a',black:'#221c18',white:'#efe4cc',indigo:'#2f4a7a',green:'#3f7a5a',plum:'#6a2a4a'};
// a stepped diamond (the Andean "rombo") of half-size r at (cx,cy), n steps
function hRLStepDiamond(g,cx,cy,r,n,col){g.fillStyle=col;const st=r/n;for(let k=0;k<n;k++){const w=(k+1)*st,y=r-k*st;g.fillRect(cx-w,cy-y,2*w,st);g.fillRect(cx-w,cy+y-st,2*w,st);}}
// a zigzag row across [x0,x1] at y, amplitude a, period per, line width lw
function hRLZig(g,x0,x1,y,a,per,lw,col){g.beginPath();for(let x=x0,k=0;x<=x1;x+=per/2,k++)k?g.lineTo(x,y+(k%2?-a:a)):g.moveTo(x,y+a);g.lineWidth=lw;g.strokeStyle=col;g.lineJoin='miter';g.stroke();}
// a step-fret (greca escalonada) row: stepped hooks marching across
function hRLFret(g,x0,x1,y,h,col){g.fillStyle=col;const s=h/4;for(let x=x0;x<x1;x+=h*1.5){g.fillRect(x,y,s,h);g.fillRect(x,y+h-s,h,s);g.fillRect(x+h-s,y+h*.45,s,h*.55-s);g.fillRect(x+h*.45,y+h*.45,h*.55,s);}}
// a stepped cross (chakana) of half-size r
function hRLChakana(g,cx,cy,r,col,hole){g.fillStyle=col;const t=r/3;g.fillRect(cx-r,cy-t,2*r,2*t);g.fillRect(cx-t,cy-r,2*t,2*r);g.fillRect(cx-2*t,cy-2*t,4*t,4*t);if(hole){g.fillStyle=hole;g.beginPath();g.arc(cx,cy,t*.7,0,TAU);g.fill();}}
// BAND: a woven band (4:1) — a red field with a row of stepped diamonds, zigzags above and below, black selvedges
TEX.rlBand=canvasTex(256,64,(g,w,h)=>{g.fillStyle=RAND.red;g.fillRect(0,0,w,h);g.fillStyle=RAND.black;g.fillRect(0,0,w,h*.08);g.fillRect(0,h*.92,w,h*.08);
 g.fillStyle=RAND.ochre;g.fillRect(0,h*.1,w,h*.05);g.fillRect(0,h*.85,w,h*.05);
 for(let k=0;k<4;k++){const cx=w*(k+.5)/4;hRLStepDiamond(g,cx,h/2,h*.3,3,RAND.black);hRLStepDiamond(g,cx,h/2,h*.19,2,RAND.white);hRLStepDiamond(g,cx,h/2,h*.08,1,RAND.indigo);}
 hRLZig(g,0,w,h*.22,h*.035,w/16,h*.03,RAND.white);hRLZig(g,0,w,h*.78,h*.035,w/16,h*.03,RAND.white);});
// CLOTH: an awayo hanging (1:1) — stripes of every colour with pattern bands between
TEX.rlCloth=canvasTex(256,256,(g,w,h)=>{const cols=[RAND.red,RAND.ochre,RAND.black,RAND.white,RAND.indigo,RAND.green,RAND.plum,RAND.red,RAND.white,RAND.ochre];
 let y=0;for(let k=0;y<h;k++){const bh=(k%3===1)?h*.16:h*.04+((k*7)%5)*h*.012;g.fillStyle=cols[k%cols.length];g.fillRect(0,y,w,bh);
  if(k%3===1){g.fillStyle=RAND.black;g.fillRect(0,y,w,bh*.08);g.fillRect(0,y+bh*.92,w,bh*.08);for(let j=0;j<5;j++){hRLStepDiamond(g,w*(j+.5)/5,y+bh/2,bh*.34,3,RAND.black);hRLStepDiamond(g,w*(j+.5)/5,y+bh/2,bh*.2,2,k%2?RAND.white:RAND.ochre);}}
  else if(k%3===2)hRLZig(g,0,w,y+bh/2,bh*.3,w/12,bh*.2,k%2?RAND.white:RAND.black);
  y+=bh;}
 g.fillStyle=RAND.black;g.fillRect(0,0,w*.02,h);g.fillRect(w*.98,0,w*.02,h);});
// CONE: bands for the shaman's roof (u round, v up) — step-frets, a diamond band, a zigzag, black to the peak
TEX.rlCone=canvasTex(256,256,(g,w,h)=>{g.fillStyle=RAND.black;g.fillRect(0,0,w,h);
 g.fillStyle=RAND.red;g.fillRect(0,h*.76,w,h*.24);hRLFret(g,0,w,h*.8,h*.16,RAND.white);
 g.fillStyle=RAND.ochre;g.fillRect(0,h*.5,w,h*.24);for(let k=0;k<5;k++)hRLStepDiamond(g,w*(k+.5)/5,h*.62,h*.1,3,RAND.black);
 g.fillStyle=RAND.white;g.fillRect(0,h*.46,w,h*.03);g.fillRect(0,h*.74,w,h*.02);hRLZig(g,0,w,h*.36,h*.04,w/10,h*.03,RAND.ochre);});
// SHIELD: a round hide shield — black rim, a red field, the chakana in white
TEX.rlShield=canvasTex(128,128,(g,w,h)=>{g.fillStyle=RAND.red;g.fillRect(0,0,w,h);g.beginPath();g.arc(w/2,h/2,w*.47,0,TAU);g.lineWidth=w*.07;g.strokeStyle=RAND.black;g.stroke();
 hRLChakana(g,w/2,h/2,w*.3,RAND.white,RAND.black);});
// CHAKANA disc (alpha): the stepped cross as a finial or a gate sign
TEX.rlChakana=canvasTex(128,128,(g,w,h)=>{g.clearRect(0,0,w,h);hRLChakana(g,w/2,h/2,w*.48,RAND.black);hRLChakana(g,w/2,h/2,w*.4,RAND.red);hRLChakana(g,w/2,h/2,w*.26,RAND.ochre,RAND.black);});
// BOAT HEAD: the puma of the Titicaca prow — a simple painted face: dark ears and mask, round eyes, a stripe
TEX.rlHead=canvasTex(128,128,(g,w,h)=>{g.fillStyle='#b89a58';g.fillRect(0,0,w,h);g.fillStyle=RAND.black;g.fillRect(0,0,w,h*.14);
 for(const s of[-1,1]){g.fillStyle=RAND.white;g.beginPath();g.arc(w/2+s*w*.2,h*.42,w*.1,0,TAU);g.fill();g.fillStyle=RAND.black;g.beginPath();g.arc(w/2+s*w*.2,h*.42,w*.045,0,TAU);g.fill();
  for(let k=0;k<3;k++){g.beginPath();g.moveTo(w/2+s*w*.12,h*(.68+k*.05));g.lineTo(w/2+s*w*.42,h*(.62+k*.09));g.lineWidth=w*.015;g.strokeStyle=RAND.black;g.stroke();}}
 g.fillStyle=RAND.red;g.beginPath();g.moveTo(w*.5,h*.55);g.lineTo(w*.42,h*.68);g.lineTo(w*.58,h*.68);g.closePath();g.fill();
 hRLZig(g,0,w,h*.9,h*.03,w/8,h*.025,RAND.red);});

// ---------------------------------------------------------------- materials
MAT.rlBundle=hStd({map:TEX.rlBundle,roughness:.95});hWorldUV(MAT.rlBundle,2.2,.5);   // ~3 stalk tiles round a 0.4 m bundle, a lashing every metre
MAT.rlBundleX=hStd({map:TEX.rlBundle,roughness:.95});                                  // horizontal bundles (own UVs from the geometry)
MAT.rlMat=hStd({map:TEX.rlMat,roughness:.96});vWorldUV(MAT.rlMat,.5);
MAT.rlMatM=hStd({map:TEX.rlMat,roughness:.96});                                        // for plain meshes (mudhif skins), UVs from the surface
MAT.rlLattice=hStd({map:TEX.rlLattice,alphaTest:.5,roughness:.9});vWorldUV(MAT.rlLattice,.5);
MAT.rlThatch=hStd({map:TEX.rlThatch,roughness:1});vWorldUV(MAT.rlThatch,.5);
MAT.rlIsland=hStd({map:TEX.rlIsland,roughness:1});
MAT.rlLayer=hStd({map:TEX.rlLayer,roughness:1});
MAT.rlFringe=hStd({map:TEX.rlFringe,alphaTest:.4,roughness:1});vWorldUV(MAT.rlFringe,1);
MAT.rlReed=hStd({map:TEX.rlReed,alphaTest:.45,roughness:1});
MAT.rlNet=hStd({map:TEX.rlNet,alphaTest:.5,roughness:.9});vWorldUV(MAT.rlNet,1);
MAT.rlCone=hStd({map:TEX.rlCone,roughness:.85});MAT.rlShield=hStd({map:TEX.rlShield,roughness:.75});MAT.rlHead=hStd({map:TEX.rlHead,roughness:.9});
MAT.rlBand=hStd({map:TEX.rlBand,roughness:.9});MAT.rlCloth=hStd({map:TEX.rlCloth,roughness:.95});MAT.rlChakana=hStd({map:TEX.rlChakana,alphaTest:.5,roughness:.8});
MAT.rlWater=new THREE.MeshStandardMaterial({map:TEX.rlWater,color:0xd8e0dc,roughness:.32,metalness:.12});
MAT.rlHide=hStd({color:0x4a4038,roughness:.9});                                        // water buffalo

// ---------------------------------------------------------------- geometry
// a bundle cylinder: 8 sides, base at y=0 (posts, columns) and centred (beam() members)
const HRL_CYL=new THREE.CylinderGeometry(1,1,1,8).translate(0,.5,0);
const HRL_CYLC=new THREE.CylinderGeometry(.5,.5,1,8);
// a horizontal bundle lying along x, radius 1, length 1 (ridges, purlins, pontoons); UVs so the stalks run along it
function hRLLogGeo(){const g=new THREE.CylinderGeometry(1,1,1,8).rotateZ(Math.PI/2);const uv=g.attributes.uv;for(let i=0;i<uv.count;i++){const u=uv.getX(i),v=uv.getY(i);uv.setXY(i,v*2,u*1.5);}return g;}
const HRL_LOG=hRLLogGeo();
// a tied sheaf standing on its butt: fat at the foot, waisted at the tie, splaying above
const HRL_SHEAF=new THREE.LatheGeometry([[0,0],[1,0],[1.05,.3],[.9,.55],[.6,.72],[.75,.9],[1.1,1]].map(p=>new THREE.Vector2(p[0],p[1])),8);
// two crossed cards standing on y=0 (the reed clump); normals radial so the clump lights as one volume
function hRLCardGeo(){const P=[],N=[],U=[],v=new THREE.Vector3();
 for(let q=0;q<2;q++){const a=q*Math.PI/2,c=Math.cos(a),s=Math.sin(a);const V=[[-c,0,-s],[c,0,s],[c,1,s],[-c,0,-s],[c,1,s],[-c,1,-s]];const T=[[0,0],[1,0],[1,1],[0,0],[1,1],[0,1]];
  for(let i=0;i<6;i++){P.push(V[i][0],V[i][1],V[i][2]);v.set(V[i][0],.4,V[i][2]).normalize();N.push(v.x,v.y,v.z);U.push(T[i][0],T[i][1]);}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));return g;}
// open cylinders whose u is scaled by 2π (a painted band reads once round, a mat once per metre)
function hRLCylGeo(seg,rTop,open,uK){const g=new THREE.CylinderGeometry(rTop,1,1,seg,1,open).translate(0,.5,0);const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setX(i,uv.getX(i)*uK);return g;}
const HRL_HORN=new THREE.ConeGeometry(1,1,6).translate(0,.5,0);

// ---------------------------------------------------------------- kit items
kdef('hRLBundle',HRL_CYL,MAT.rlBundle);kdef('hRLBundleC',HRL_CYLC,MAT.rlBundle);kdef('hRLBundleX',HRL_LOG,MAT.rlBundleX);
kdef('hRLSheaf',HRL_SHEAF,MAT.rlBundle);
kdef('hRLMatB',VBOX,MAT.rlMat);kdef('hRLMatP',VPLANE,MAT.rlMat);kdef('hRLGableM',VGABLE,MAT.rlMat);kdef('hRLRoll',HRL_LOG,MAT.rlMat);
kdef('hRLLattice',VPLANE,MAT.rlLattice);kdef('hRLFringe',VPLANE,MAT.rlFringe);kdef('hRLReed',hRLCardGeo(),MAT.rlReed);kdef('hRLNet',VPLANE,MAT.rlNet);
kdef('hRLThatchB',VBOX,MAT.rlThatch);kdef('hRLGableT',VGABLE,MAT.rlThatch);kdef('hRLHipT',VHIP,MAT.rlThatch);kdef('hRLPyrT',VPYR,MAT.rlThatch);kdef('hRLConeT',VCONE,MAT.rlThatch);
kdef('hRLMatCyl',hRLCylGeo(14,1,true,TAU),MAT.rlMat);kdef('hRLBandCyl',hRLCylGeo(14,1,true,TAU),MAT.rlBand);kdef('hRLBandP',VPLANE,MAT.rlBand);kdef('hRLCloth',VPLANE,MAT.rlCloth);kdef('hRLChakana',VPLANE,MAT.rlChakana);kdef('hRLConeP',hRLCylGeo(10,.06,true,3),MAT.rlCone);
kdef('hRLDisc',new THREE.CylinderGeometry(1,1,1,14).translate(0,.5,0),MAT.woodV);kdef('hRLShield',new THREE.CircleGeometry(1,16),MAT.rlShield);
kdef('hRLHead',new THREE.SphereGeometry(1,10,8),MAT.rlHead);kdef('hRLHorn',HRL_HORN,MAT.paint);
kdef('hRLFlame',VCONE,MAT.ember);kdef('hRLLeafB',VBOX,MAT.moss);kdef('hRLStalk',VPOST,MAT.moss);kdef('hRLHide',VBOX,MAT.rlHide);kdef('hRLHideBall',VBALL,MAT.rlHide);
kdef('hRLMud',VBOX,MAT.clay);kdef('hRLWaterB',VBOX,MAT.rlWater);
