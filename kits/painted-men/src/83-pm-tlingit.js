// ================================================================= PAINTED MEN (KWÉENT'X̱) — Tlingit / Pacific-NW Formline Layer
// Dedicated Tlingit / Pacific-Northwest black-red-teal (#141619, #b63124, #1f6e6c) formline motif, crest-painting and
// totem-carving fragment for kits/painted-men. Split out of kits/highlands so the Iron Republic and Rustic cantons carry
// Slavic woodwork while the Painted Men retain ovoids, U-forms, split-Us, trigons, Raven/Thunderbird/Orca/Salmon/Bear
// crest panels, stacked Eagle-Bear-Frog totem columns, Chilkat-inspired painted fronts, and salvaged hull roundhouses.
// Pure procedural 2D canvas paths (zero getImageData) so GPU and CPU canvases agree across machines.

const PMFORM={black:'#141619',red:'#b63124',teal:'#1f6e6c',tealL:'#2e9488',white:'#efe7d6',cedar:'#b27a4c',cedarD:'#8a5634',ochre:'#d19a3a'};

function pmOvoidPath(g,cx,cy,w,h){g.beginPath();
 g.moveTo(cx-w/2,cy+h*.1);
 g.bezierCurveTo(cx-w/2,cy-h*.62,cx+w/2,cy-h*.62,cx+w/2,cy+h*.1);
 g.bezierCurveTo(cx+w/2,cy+h*.55,cx+w*.22,cy+h*.52,cx,cy+h*.36);
 g.bezierCurveTo(cx-w*.22,cy+h*.52,cx-w/2,cy+h*.55,cx-w/2,cy+h*.1);g.closePath();}
function pmOvoid(g,cx,cy,w,h,line,fill,lw){pmOvoidPath(g,cx,cy,w,h);if(fill){g.fillStyle=fill;g.fill();}if(line){g.lineWidth=lw==null?Math.max(2,w*.14):lw;g.strokeStyle=line;g.stroke();}}
function pmUForm(g,cx,cy,w,h,col,lw){g.beginPath();g.moveTo(cx-w/2,cy-h/2);g.bezierCurveTo(cx-w/2,cy+h*.7,cx+w/2,cy+h*.7,cx+w/2,cy-h/2);
 g.lineWidth=lw==null?w*.22:lw;g.strokeStyle=col;g.lineCap='round';g.stroke();g.lineCap='butt';}
function pmSplitU(g,cx,cy,w,h,col,lw){const w0=lw==null?w*.22:lw;pmUForm(g,cx,cy,w,h,col,w0);g.beginPath();g.moveTo(cx,cy-h/2);g.lineTo(cx,cy+h*.12);g.lineWidth=w0*.7;g.strokeStyle=PMFORM.white;g.stroke();}
function pmEye(g,cx,cy,w,h,socket){
 pmOvoid(g,cx,cy,w,h,PMFORM.black,socket||PMFORM.teal,w*.12);
 pmOvoid(g,cx,cy+h*.06,w*.64,h*.5,PMFORM.black,PMFORM.white,w*.07);
 pmOvoid(g,cx,cy+h*.08,w*.34,h*.3,null,PMFORM.black);}
function pmSwoop(g,pts,col,lw){g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(let i=1;i+2<pts.length+1;i+=3)g.bezierCurveTo(pts[i][0],pts[i][1],pts[i+1][0],pts[i+1][1],pts[i+2][0],pts[i+2][1]);
 g.lineWidth=lw;g.strokeStyle=col;g.lineCap='round';g.stroke();g.lineCap='butt';}
function pmTrigon(g,x,y,s,col){g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+s*.5,y+s*.1,x+s,y);g.quadraticCurveTo(x+s*.6,y+s*.4,x+s*.5,y+s);g.quadraticCurveTo(x+s*.4,y+s*.4,x,y);g.fillStyle=col;g.fill();}
function pmMirror(g,w,h,cx,fn){g.save();fn(g);g.restore();g.save();g.translate(2*cx,0);g.scale(-1,1);fn(g);g.restore();}

/* Brushed red-cedar plank ground drawn with deterministic grain strokes (never getImageData) */
function pmCedar(g,w,h,base,vert){
 g.fillStyle=base||PMFORM.cedar;g.fillRect(0,0,w,h);
 const n=vert?Math.max(16,w>>2):Math.max(16,h>>2);
 for(let i=0;i<n;i++){
  const t=(i+.5)/n,v=h3(i*1.7,vert?1:2,5.3);
  g.fillStyle=v>.5?'rgba(255,232,196,'+(0.04+(v-.5)*.14).toFixed(3)+')':'rgba(36,18,8,'+(0.05+(.5-v)*.18).toFixed(3)+')';
  if(vert)g.fillRect(t*w-1.5,0,2.5,h);else g.fillRect(0,t*h-1.5,w,2.5);
 }
 const planks=vert?4:5;
 g.fillStyle='rgba(24,14,10,0.22)';
 for(let k=1;k<planks;k++){if(vert)g.fillRect(Math.round(w*k/planks),0,1.5,h);else g.fillRect(0,Math.round(h*k/planks),w,1.5);}
}
function pmGround(g,w,h,white){if(white){g.fillStyle=PMFORM.white;g.fillRect(0,0,w,h);}else pmCedar(g,w,h,PMFORM.cedar,false);}
function pmIn(g,x,y,w,h,uw,uh,fn){g.save();g.translate(x,y);g.scale(w/uw,h/uh);fn(g);g.restore();}
function pmFill(g,col){g.fillStyle=col;g.fill();}
function pmLine(g,col,lw){g.lineWidth=lw;g.strokeStyle=col;g.lineJoin='round';g.stroke();}

/* Naturalistic Tlingit / Pacific-NW crest animals in black-red-teal formline */
function pmSalmon(g){
 g.beginPath();g.moveTo(192,40);g.bezierCurveTo(172,14,96,8,44,28);g.lineTo(10,12);g.quadraticCurveTo(20,40,10,68);g.lineTo(44,52);g.bezierCurveTo(96,72,172,66,192,40);g.closePath();
 pmFill(g,PMFORM.red);pmLine(g,PMFORM.black,5);
 g.beginPath();g.moveTo(96,16);g.quadraticCurveTo(104,2,122,6);g.quadraticCurveTo(116,12,118,17);pmFill(g,PMFORM.black);
 g.beginPath();g.moveTo(104,62);g.quadraticCurveTo(110,76,126,74);g.quadraticCurveTo(120,68,122,61);pmFill(g,PMFORM.black);
 pmOvoid(g,160,40,34,34,PMFORM.black,PMFORM.teal,5);pmOvoid(g,168,34,14,11,PMFORM.black,PMFORM.white,3);pmOvoid(g,169,35,6,5,null,PMFORM.black);
 g.beginPath();g.moveTo(192,40);g.lineTo(178,44);pmLine(g,PMFORM.black,3);
 pmUForm(g,120,34,22,22,PMFORM.black,5);pmUForm(g,90,36,20,20,PMFORM.black,5);pmOvoid(g,62,40,16,12,PMFORM.black,PMFORM.teal,3);
 pmSplitU(g,26,40,14,30,PMFORM.black,5);}

function pmOrca(g){
 g.beginPath();g.moveTo(196,58);g.bezierCurveTo(186,36,150,30,110,32);g.bezierCurveTo(76,34,46,40,30,50);
 g.quadraticCurveTo(16,40,4,30);g.quadraticCurveTo(12,52,6,74);g.quadraticCurveTo(18,64,32,58);g.bezierCurveTo(62,72,120,80,160,72);g.bezierCurveTo(180,68,192,64,196,58);g.closePath();pmFill(g,PMFORM.black);
 g.beginPath();g.moveTo(98,34);g.quadraticCurveTo(90,16,84,2);g.quadraticCurveTo(108,12,122,32);pmFill(g,PMFORM.black);
 g.beginPath();g.ellipse(142,68,32,6,.05,0,TAU);pmFill(g,PMFORM.white);g.beginPath();g.ellipse(160,45,10,4,-.1,0,TAU);pmFill(g,PMFORM.white);
 pmOvoid(g,176,49,10,8,null,PMFORM.white);pmOvoid(g,177,50,5,4,null,PMFORM.black);
 g.beginPath();g.moveTo(196,58);g.quadraticCurveTo(186,62,172,60);pmLine(g,PMFORM.red,3);
 g.beginPath();g.moveTo(140,68);g.quadraticCurveTo(128,84,122,96);g.quadraticCurveTo(142,90,152,70);pmFill(g,PMFORM.black);
 pmUForm(g,137,82,10,12,PMFORM.red,3);pmOvoid(g,146,62,16,12,PMFORM.red,PMFORM.teal,3);
 pmUForm(g,100,48,22,18,PMFORM.red,4);pmUForm(g,70,50,18,16,PMFORM.red,4);pmSplitU(g,97,26,8,12,PMFORM.red,3);pmSplitU(g,16,52,8,24,PMFORM.red,3);}

function pmThunderbird(g){
 pmMirror(g,200,100,100,g2=>{for(let k=0;k<5;k++){const x=12+k*15,y=64-k*5;pmUForm(g2,x,y,13,34,k%2?PMFORM.red:PMFORM.black,3.6);}
  pmSwoop(g2,[[4,82],[16,34],[52,22],[86,38]],PMFORM.black,7);pmOvoid(g2,62,40,16,12,PMFORM.black,PMFORM.teal,3);
  pmUForm(g2,90,90,8,16,PMFORM.black,3);});
 pmOvoid(g,100,58,30,52,PMFORM.black,PMFORM.red,5);pmUForm(g,100,52,14,12,PMFORM.black,4);pmUForm(g,100,68,12,10,PMFORM.black,4);
 for(const s of[-1,1]){g.beginPath();g.moveTo(100+s*6,82);g.lineTo(100+s*12,96);pmLine(g,PMFORM.black,3);}
 pmOvoid(g,100,22,26,22,PMFORM.black,PMFORM.white,4);pmOvoid(g,96,21,9,7,null,PMFORM.black);
 g.beginPath();g.moveTo(90,18);g.quadraticCurveTo(70,16,66,28);g.quadraticCurveTo(74,24,80,30);g.quadraticCurveTo(84,26,90,27);pmFill(g,PMFORM.black);
 g.beginPath();g.moveTo(104,12);g.quadraticCurveTo(112,0,122,4);g.quadraticCurveTo(114,8,110,14);pmFill(g,PMFORM.red);}

function pmBear(g){
 g.beginPath();g.moveTo(40,40);g.bezierCurveTo(60,20,120,18,150,30);g.quadraticCurveTo(160,24,172,30);g.lineTo(196,44);g.quadraticCurveTo(190,54,176,54);
 g.quadraticCurveTo(160,56,152,60);g.lineTo(156,94);g.lineTo(138,94);g.lineTo(134,68);g.quadraticCurveTo(100,74,70,68);g.lineTo(66,94);g.lineTo(48,94);g.lineTo(44,64);g.quadraticCurveTo(28,56,40,40);g.closePath();
 pmFill(g,PMFORM.black);
 g.beginPath();g.arc(160,26,7,0,TAU);pmFill(g,PMFORM.black);g.beginPath();g.arc(160,26,3.5,0,TAU);pmFill(g,PMFORM.red);
 pmOvoid(g,172,38,10,8,null,PMFORM.white);pmOvoid(g,173,39,5,4,null,PMFORM.black);g.beginPath();g.arc(195,45,3,0,TAU);pmFill(g,PMFORM.red);
 pmOvoid(g,140,48,22,18,PMFORM.red,PMFORM.teal,3);pmOvoid(g,62,48,22,18,PMFORM.red,PMFORM.teal,3);
 pmUForm(g,146,80,10,16,PMFORM.red,3);pmUForm(g,57,80,10,16,PMFORM.red,3);pmUForm(g,100,44,26,14,PMFORM.red,4);
 for(const x of[138,48])for(let k=0;k<3;k++){g.beginPath();g.moveTo(x+4+k*5,94);g.lineTo(x+6+k*5,99);pmLine(g,PMFORM.white,2);}}

/* Crest panels, friezes, stacked Raven/Eagle-Bear-Frog totem wraps, and spread Thunderbird wings */
TEX.pmFormA=canvasTex(512,256,(g,w,h)=>{pmGround(g,w,h,false);
 pmMirror(g,w,h,w/2,g2=>pmIn(g2,w*.03,h*.2,w*.44,h*.6,200,80,pmSalmon));pmOvoid(g,w/2,h*.52,h*.22,h*.2,PMFORM.black,PMFORM.teal,6);
 g.lineWidth=h*.03;g.strokeStyle=PMFORM.black;g.strokeRect(h*.015,h*.015,w-h*.03,h-h*.03);});
TEX.pmFormW=canvasTex(512,256,(g,w,h)=>{pmGround(g,w,h,true);pmIn(g,w*.08,h*.08,w*.84,h*.72,200,100,pmOrca);
 for(let k=0;k<8;k++){const cx=w*(k+.5)/8;pmUForm(g,cx,h*.86,w*.1,h*.12,k%2?PMFORM.teal:PMFORM.black,h*.03);}});
TEX.pmFormV=canvasTex(128,512,(g,w,h)=>{pmCedar(g,w,h,PMFORM.cedarD,true);
 for(let k=0;k<4;k++){const cy=h*(k+.5)/4;
  pmOvoid(g,w/2,cy-h*.03,w*.78,h*.12,PMFORM.black,k%2?PMFORM.teal:PMFORM.red,w*.08);
  pmOvoid(g,w/2,cy-h*.02,w*.4,h*.06,PMFORM.black,PMFORM.white,w*.05);
  pmUForm(g,w/2,cy+h*.075,w*.7,h*.05,k%2?PMFORM.red:PMFORM.black,w*.08);}});
TEX.pmFormT=canvasTex(512,256,(g,w,h)=>{pmGround(g,w,h,false);pmIn(g,w*.02,h*.04,w*.96,h*.92,200,100,pmThunderbird);});
TEX.pmFormB=canvasTex(512,256,(g,w,h)=>{pmGround(g,w,h,false);pmIn(g,w*.06,h*.06,w*.88,h*.84,200,100,pmBear);});
TEX.pmFormF=canvasTex(256,64,(g,w,h)=>{pmCedar(g,w,h,PMFORM.cedarD,false);
 for(let k=0;k<4;k++){const cx=w*(k+.5)/4;if(k%2){pmOvoid(g,cx,h*.52,w*.18,h*.6,PMFORM.black,PMFORM.teal,w*.02);pmOvoid(g,cx,h*.55,w*.08,h*.26,null,PMFORM.black);}
  else{pmSplitU(g,cx,h*.4,w*.16,h*.52,PMFORM.red,w*.035);}}
 g.fillStyle=PMFORM.black;g.fillRect(0,0,w,h*.08);g.fillRect(0,h*.92,w,h*.08);});

function pmTotemEagle(g,cx,cy,W,H,sock){
 pmMirror(g,W,H,cx,g2=>{g2.beginPath();g2.moveTo(cx-W*.16,cy-H*.02);g2.bezierCurveTo(cx-W*.5,cy+H*.02,cx-W*.5,cy+H*.36,cx-W*.3,cy+H*.46);g2.lineTo(cx-W*.12,cy+H*.46);g2.closePath();pmFill(g2,PMFORM.black);
  for(let k=0;k<3;k++)pmUForm(g2,cx-W*.34+k*W*.07,cy+H*(.22+k*.06),W*.07,H*.2,PMFORM.red,W*.025);
  pmOvoid(g2,cx-W*.3,cy+H*.08,W*.12,H*.08,PMFORM.black,sock,W*.015);});
 g.beginPath();g.ellipse(cx,cy-H*.2,W*.3,H*.2,0,0,TAU);pmFill(g,PMFORM.black);
 pmMirror(g,W,H,cx,g2=>{pmOvoid(g2,cx-W*.15,cy-H*.24,W*.16,H*.1,null,PMFORM.white);pmOvoid(g2,cx-W*.14,cy-H*.235,W*.08,H*.05,null,PMFORM.black);});
 g.beginPath();g.moveTo(cx-W*.1,cy-H*.14);g.quadraticCurveTo(cx,cy-H*.2,cx+W*.1,cy-H*.14);g.quadraticCurveTo(cx+W*.16,cy+H*.14,cx+W*.02,cy+H*.28);
 g.quadraticCurveTo(cx-W*.06,cy+H*.3,cx-W*.04,cy+H*.2);g.quadraticCurveTo(cx+W*.04,cy+H*.2,cx+W*.02,cy+H*.12);g.quadraticCurveTo(cx-W*.12,cy+H*.04,cx-W*.1,cy-H*.14);
 pmFill(g,PMFORM.ochre);pmLine(g,PMFORM.black,W*.02);g.beginPath();g.ellipse(cx,cy+H*.36,W*.12,H*.08,0,0,TAU);pmFill(g,PMFORM.red);pmLine(g,PMFORM.black,W*.02);}

function pmTotemBear(g,cx,cy,W,H){
 pmMirror(g,W,H,cx,g2=>{g2.beginPath();g2.arc(cx-W*.28,cy-H*.34,W*.1,0,TAU);pmFill(g2,PMFORM.black);g2.beginPath();g2.arc(cx-W*.28,cy-H*.34,W*.05,0,TAU);pmFill(g2,PMFORM.red);});
 g.beginPath();g.ellipse(cx,cy-H*.1,W*.38,H*.26,0,0,TAU);pmFill(g,PMFORM.black);
 pmMirror(g,W,H,cx,g2=>{pmOvoid(g2,cx-W*.17,cy-H*.17,W*.16,H*.1,PMFORM.red,PMFORM.white,W*.02);pmOvoid(g2,cx-W*.16,cy-H*.16,W*.08,H*.05,null,PMFORM.black);
  pmUForm(g2,cx-W*.28,cy-H*.02,W*.1,H*.1,PMFORM.red,W*.025);
  g2.beginPath();g2.ellipse(cx-W*.24,cy+H*.34,W*.13,H*.09,0,0,TAU);pmFill(g2,PMFORM.black);
  for(let k=0;k<4;k++){g2.beginPath();g2.moveTo(cx-W*.33+k*W*.055,cy+H*.4);g2.lineTo(cx-W*.34+k*W*.055,cy+H*.46);pmLine(g2,PMFORM.white,W*.016);}});
 g.beginPath();g.ellipse(cx,cy+H*.02,W*.15,H*.12,0,0,TAU);pmFill(g,'#d9b48a');pmLine(g,PMFORM.red,W*.02);
 g.beginPath();g.ellipse(cx,cy-H*.05,W*.07,H*.04,0,0,TAU);pmFill(g,PMFORM.black);
 g.beginPath();g.moveTo(cx-W*.08,cy+H*.06);g.quadraticCurveTo(cx,cy+H*.11,cx+W*.08,cy+H*.06);pmLine(g,PMFORM.black,W*.02);
 g.beginPath();g.ellipse(cx,cy+H*.32,W*.12,H*.1,0,0,TAU);pmFill(g,PMFORM.red);pmLine(g,PMFORM.black,W*.02);}

function pmTotemFrog(g,cx,cy,W,H){
 pmMirror(g,W,H,cx,g2=>{pmSwoop(g2,[[cx-W*.2,cy+H*.1],[cx-W*.44,cy+H*.1],[cx-W*.46,cy+H*.34],[cx-W*.3,cy+H*.44]],PMFORM.black,W*.07);
  for(let k=0;k<3;k++){g2.beginPath();g2.arc(cx-W*.36+k*W*.05,cy+H*.45,W*.025,0,TAU);pmFill(g2,PMFORM.black);}});
 g.beginPath();g.ellipse(cx,cy+H*.06,W*.34,H*.3,0,0,TAU);pmFill(g,'#3f8f5a');pmLine(g,PMFORM.black,W*.03);
 pmMirror(g,W,H,cx,g2=>{g2.beginPath();g2.arc(cx-W*.17,cy-H*.24,W*.1,0,TAU);pmFill(g2,PMFORM.white);pmLine(g2,PMFORM.black,W*.025);
  g2.beginPath();g2.arc(cx-W*.16,cy-H*.23,W*.05,0,TAU);pmFill(g2,PMFORM.black);pmOvoid(g2,cx-W*.2,cy+H*.14,W*.1,H*.07,PMFORM.black,PMFORM.teal,W*.015);});
 g.beginPath();g.moveTo(cx-W*.26,cy-H*.04);g.quadraticCurveTo(cx,cy+H*.1,cx+W*.26,cy-H*.04);pmLine(g,PMFORM.black,W*.035);
 pmUForm(g,cx,cy+H*.22,W*.14,H*.1,PMFORM.red,W*.03);}

function pmTotemTex(cols){return canvasTex(256,1024,(g,w,h)=>{pmCedar(g,w,h,cols.base,true);
 const figs=[pmTotemEagle,pmTotemBear,pmTotemFrog];
 for(let k=0;k<3;k++){figs[k](g,w/2,h*(k+.5)/3,w*.62,h*.3,k===1?PMFORM.red:cols.socket);
  g.fillStyle=PMFORM.black;g.fillRect(0,h*(k+1)/3-h*.006,w,h*.012);}});}
TEX.pmTotem=pmTotemTex({base:PMFORM.cedar,socket:PMFORM.teal});
TEX.pmTotemP=pmTotemTex({base:'#d8cdb4',socket:PMFORM.teal});

TEX.pmWing=canvasTex(256,128,(g,w,h)=>{g.clearRect(0,0,w,h);
 g.beginPath();g.moveTo(0,h*.2);g.quadraticCurveTo(w*.5,-h*.1,w,h*.35);g.lineTo(w,h*.6);for(let k=0;k<6;k++){const x=w-(k+1)*w/6;g.quadraticCurveTo(x+w/12,h*(.95-k*.04),x,h*(.62-k*.03));}g.closePath();
 g.fillStyle=PMFORM.white;g.fill();g.save();g.clip();
 for(let k=0;k<6;k++){const x=w-(k+.5)*w/6;pmUForm(g,x,h*.62,w*.13,h*.46,k%2?PMFORM.red:PMFORM.black,w*.03);}
 pmSwoop(g,[[0,h*.3],[w*.3,h*.05],[w*.7,h*.1],[w,h*.4]],PMFORM.black,h*.1);pmEye(g,w*.16,h*.32,w*.14,h*.24,PMFORM.teal);g.restore();});

MAT.pmFormA=hStd({map:TEX.pmFormA,roughness:.8});MAT.pmFormW=hStd({map:TEX.pmFormW,roughness:.8});MAT.pmFormV=hStd({map:TEX.pmFormV,roughness:.8});
MAT.pmFormT=hStd({map:TEX.pmFormT,roughness:.8});MAT.pmFormB=hStd({map:TEX.pmFormB,roughness:.8});MAT.pmFormF=hStd({map:TEX.pmFormF,roughness:.8});
hWorldUV(MAT.pmFormF,.5,2);
MAT.pmTotem=hStd({map:TEX.pmTotem,roughness:.82,side:THREE.FrontSide});MAT.pmTotemP=hStd({map:TEX.pmTotemP,roughness:.82,side:THREE.FrontSide});
MAT.pmWing=hStd({map:TEX.pmWing,alphaTest:.5,roughness:.85});

kdef('pmFormA',VPLANE,MAT.pmFormA);kdef('pmFormW',VPLANE,MAT.pmFormW);kdef('pmFormV',VPLANE,MAT.pmFormV);
kdef('pmFormT',VPLANE,MAT.pmFormT);kdef('pmFormB',VPLANE,MAT.pmFormB);kdef('pmFormF',VBOX,MAT.pmFormF);
kdef('pmTotem',HPOLE,MAT.pmTotem);kdef('pmTotemP',HPOLE,MAT.pmTotemP);kdef('pmWing',VPLANE,MAT.pmWing);

/* Standalone salvage shell fallbacks + tribal branch hooks onto Tlingit crest/totem/wing items (no column-0 clashes) */
(function(){
 if(!KIT.defs.hTankEnd)kdef('hTankEnd',new THREE.SphereGeometry(1,20,8,0,TAU,0,Math.PI/2).rotateZ(-Math.PI/2),MAT.rust);
 if(!KIT.defs.hTankC)kdef('hTankC',new THREE.CylinderGeometry(1,1,1,24),MAT.rust);
 if(!KIT.defs.hSiloC)kdef('hSiloC',new THREE.CylinderGeometry(1,1,1,28,1).translate(0,.5,0),MAT.corrugate);
 if(!KIT.defs.hVault){
  const vGeo=(arc,seg)=>{const pos=[],uv=[],idx=[];for(let i=0;i<=seg;i++){const a=-arc/2+arc*i/seg;for(const x of[-.5,.5]){pos.push(x,Math.cos(a),Math.sin(a));uv.push(x+.5,i/seg);}}
   for(let i=0;i<seg;i++){const b=i*2;idx.push(b,b+2,b+1,b+1,b+2,b+3);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;};
  if(!MAT.hHull)MAT.hHull=hStd({color:0xffffff,roughness:.6,metalness:.35});
  kdef('hVault',vGeo(Math.PI*.84,28),MAT.hHull);kdef('hVaultR',vGeo(Math.PI*.84,28),MAT.rust);
 }
 if(typeof globalThis.HSV==='undefined')globalThis.HSV={rust:[0x8a5a3a,0x7a4e34,0x96643e,0x6e4a36],conc:[0x9a968c,0x8e8a80,0xa6a296],corr:[0x9a9488,0x8a867a,0xa8a294]};
 if(typeof globalThis.HCONT==='undefined')globalThis.HCONT=[0xa8382c,0xc89a30,0x3f7a4a,0x3a6aa8,0x2e8a88,0xb86a2a,0x7a6a5a,0x8a4a6a];
 if(typeof globalThis.hContC==='undefined')globalThis.hContC=()=>hC(vPick(globalThis.HCONT)).lerp(hC(0x8a7a68),rr(.15,.4));
 if(typeof globalThis.hnCont==='undefined'){
  globalThis.hnCont=function(x,y,z,ry,L,c,o){o=o||{};const H=2.6,D=2.44,dk=c.clone().multiplyScalar(.5);vB('vCorr',x,y,z,L,H,D,ry,c);
   for(const sx of[-1,1])for(const sz of[-1,1]){const p=loc(x,z,sx*(L/2-.06),sz*(D/2-.04),ry);vB('vIron',p[0],y,p[1],.16,H+.02,.16,ry,dk);}
   for(const sz of[-1,1])for(const yy of[0,H-.14]){const p=loc(x,z,0,sz*(D/2+.01),ry);vB('vIron',p[0],y+yy,p[1],L,.14,.05,ry,dk);}
   const p=loc(x,z,L/2+.02,0,ry);vB('vIron',p[0],y+.15,p[1],.04,H-.3,D-.3,ry,dk);
   for(const u of[-.75,-.35,.35,.75]){const q=loc(x,z,L/2+.06,u,ry);vB('vIron',q[0],y+.2,q[1],.04,H-.4,.04,ry,hC(0x2e2a26));}};
 }
 if(typeof globalThis.HTAG_SALV==='undefined')globalThis.HTAG_SALV=(wealth,type)=>({type,wealth,lit:false,salvage:true});

 if(MAT.hFrzT&&MAT.hFrzT.userData)delete MAT.hFrzT.userData.lib;
 if(MAT.hFrzA&&MAT.hFrzA.userData)delete MAT.hFrzA.userData.lib;

 const PM_MAP={hFormA:'pmFormA',hFormW:'pmFormW',hFormV:'pmFormV',hFormT:'pmFormT',hFormB:'pmFormB'};
 const PM_FRZ=['pmFormF','hFrzT','hFrzA'];
 const isTri=()=>!!(VERN.cur&&VERN.cur.D&&VERN.cur.D.branch==='tribal');

 const _f0=hnForm,_frz0=hnFrieze,_tp0=hnTotemPost,_tpol0=hnTotemPole,_t0=hnTotem,_bg0=hnBarge;
 hnForm=function(item,x,y,z,ry,w,h){
  if(!isTri())return _f0(item,x,y,z,ry,w,h);
  const p=loc(x,z,0,.07,ry);kput(PM_MAP[item]||item,[p[0],y+h/2,p[1]],qEuler(0,ry,0),[w,h,1],null);
 };
 hnFrieze=function(x,y,z,ry,w,h){
  if(!isTri())return _frz0(x,y,z,ry,w,h);
  const p=loc(x,z,0,.05,ry),fh=h==null?.5:h;
  vB(PM_FRZ[(Math.abs(Math.round(p[0]*3)*7+Math.round(p[1]*3)*13+Math.round(y*5)*3))%PM_FRZ.length],p[0],y,p[1],w,fh,.1,ry);
 };
 hnTotemPost=function(x,y,z,r,h,ry,painted){
  if(!isTri())return _tp0(x,y,z,r,h,ry,painted);
  kput(painted?'pmTotemP':'pmTotem',[x,y,z],qEuler(0,ry+Math.PI,0),[r,h,r],null);
  vB('hPaint',x,y+h-.02,z,r*2.6,.2,r*2.6,ry,hC(HPAL.black));vB('vStone',x,y-.1,z,r*2.4,.22,r*2.4,ry,hC(vPick(HPAL.rubble)));
 };
 hnTotemPole=function(x,y,z,r,h,ry,painted){
  if(!isTri())return _tpol0(x,y,z,r,h,ry,painted);
  hlRngSkip(1);return FURNISH('hl_tri_totem_post',x,y,z,ry,{v:h>=4.5?2:painted?1:0});
 };
 hnTotem=function(x,y,z,r,h,ry,o){
  if(!isTri())return _t0(x,y,z,r,h,ry,o);
  o=o||{};
  const [key,v,dz]=h>=8?['hl_tri_great_totem',o.painted?0:1,o.painted?.27:.204]:o.wings?(o.painted?['hl_tri_totem',1,.168]:h>=6?['hl_tri_great_totem',1,.204]:['hl_tri_totem',0,.18])
   :(o.hat||r>=.3)?['hl_tri_totem',2,.216]:['hl_tri_totem_post',o.painted?1:0,0];
  return hnFurn(key,x,y,z,ry,{v},0,dz);
 };
 hnBarge=function(x,y,z,w,d,rise,ry,over,c,style,endOver){
  if(!isTri()||style!=='bird')return _bg0(x,y,z,w,d,rise,ry,over,c,style,endOver);
  const ov=over===undefined?.9:over,col=c||hC(HPAL.black),eo=endOver===undefined?ov:endOver;
  const run=d/2+ov,drop=ov*rise/(d/2);
  for(const sx of[-1,1]){const gx=sx*(w/2+eo+.04),N=hRot(ry,[sx,0,0]),apex=[...loc(x,z,gx,0,ry)],A=[apex[0],y+rise+.05,apex[1]];
   for(const sz of[-1,1]){const e=loc(x,z,gx,sz*run,ry),E=[e[0],y-drop,e[1]],mid=[(A[0]+E[0])/2,(A[1]+E[1])/2-.26,(A[2]+E[2])/2],L=Math.hypot(E[0]-A[0],E[1]-A[1],E[2]-A[2]);
    let X=[E[0]-A[0],E[1]-A[1],E[2]-A[2]];if(hCross(N,hNorm(X))[1]<0)X=X.map(v=>-v);hnOri('hLaceV',mid,X,N,[L,.55,1],col);}
   const p=[A[0],A[1]+.55,A[2]];
   for(const s of[-1,1]){const q=loc(A[0],A[2],0,s*.8,ry);kput('pmWing',[q[0],A[1]+.6,q[1]],qEuler(0,ry+sx*Math.PI/2,0),[s*1.6,.8,1],null);}
   kput('hPaintBall',p,null,[.22,.26,.22],hC(HPAL.black));
   kput('vConeI',hAdd(p,N,.28),qFacing(N).multiply(qEuler(Math.PI/2,0,0)),[.07,.3,.07],hC(HPAL.red));}
 };
})();
