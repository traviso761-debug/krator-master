// Jimjam shared palette and procedural surface maps. Prefix: J/JJ only.
// Round 2b: textures carry their own colour (bricks AND mortar), so an instance tint is only a
// small multiplier (default white). Every tiled material is world-UV'd: a box or a cylinder of
// any size tiles in METRES (jjWorldUV), so a brick is 0.24 m long on a 3 m wall and a 30 m wall.
const JPAL={
 brickRed:0xA8322A,brickDeep:0x7E2220,brickDark:0x3E2A26,brickYellow:0xD9A33A,
 ochre:0xE4B54A,marble:0xF1ECE2,marbleVein:0xD8D0C4,gold:0xD9A520,
 slate:0x2F3440,terracotta:0xC4602F,canvasCream:0xE8D7B1,canvasRed:0xA8322A,
 canvasTurquoise:0x3AA6A0,turquoise:0x3AA6A0,ink:0x282321,shadow:0x231F20,
 skyBlue:0x89B8DB,leaf:0x56744C
};
function jjColor(jjHex,jjFactor){const jjC=new THREE.Color(jjHex).convertSRGBToLinear();if(jjFactor!==undefined)jjC.multiplyScalar(jjFactor);return jjC;}
function jjCanvasEl(jjW,jjH,jjDraw){const jjC=document.createElement('canvas');jjC.width=jjW;jjC.height=jjH;const jjG=jjC.getContext('2d');jjDraw(jjG,jjW,jjH);return jjC;}
function jjTex(jjC,jjColour){const jjT=new THREE.CanvasTexture(jjC);jjT.wrapS=jjT.wrapT=THREE.RepeatWrapping;jjT.anisotropy=8;if(jjColour!==false)jjT.encoding=THREE.sRGBEncoding;return jjT;}
function jjCanvas(jjW,jjH,jjDraw){return jjTex(jjCanvasEl(jjW,jjH,jjDraw));}
// deterministic 0..1 hash (no Math.random: the kit must be identical on every load)
function jjHash(jjA,jjB,jjC){const jjS=Math.sin(jjA*127.1+jjB*311.7+(jjC||0)*74.7)*43758.5453;return jjS-Math.floor(jjS);}
function jjMix(jjA,jjB,jjT){const jjCa=new THREE.Color(jjA),jjCb=new THREE.Color(jjB);return '#'+jjCa.lerp(jjCb,jjT).getHexString();}
function jjShadeHex(jjHex,jjK){const jjC=new THREE.Color(jjHex);jjC.multiplyScalar(jjK);jjC.r=Math.min(1,jjC.r);jjC.g=Math.min(1,jjC.g);jjC.b=Math.min(1,jjC.b);return '#'+jjC.getHexString();}

// ---- brick: 512 px tile = JJ_BRICK_TILE metres; 8 stretchers (0.24 m) x 24 courses (0.08 m) ----
const JJ_BRICK_TILE=1.92;
function jjBrickPair(jjSpec){
 // jjSpec: {faces:[hex...], mortar:hex, headerEvery:n, headerFaces:[hex...], speckle:k}
 const jjW=512,jjH=512,jjCols=8,jjRows=24,jjBW=jjW/jjCols,jjCH=jjH/jjRows,jjJ=3.2;
 const jjBricks=[];
 for(let jjR=0;jjR<jjRows;jjR++){const jjHeader=jjSpec.headerEvery&&jjR%jjSpec.headerEvery===jjSpec.headerEvery-1;
  const jjUnit=jjHeader?jjBW/2:jjBW,jjOff=jjHeader?0:(jjR%2)*jjBW/2,jjN=Math.round(jjW/jjUnit)+1;
  for(let jjI=-1;jjI<jjN;jjI++){const jjX=jjI*jjUnit+jjOff;jjBricks.push({x:jjX,y:jjR*jjCH,w:jjUnit,h:jjCH,r:jjR,i:jjI,header:jjHeader});}}
 const jjCol=jjCanvasEl(jjW,jjH,(jjG)=>{
  jjG.fillStyle=jjSpec.mortar;jjG.fillRect(0,0,jjW,jjH);
  // mortar grain
  for(let jjK=0;jjK<5000;jjK++){const jjX=jjHash(jjK,1)*jjW,jjY=jjHash(jjK,2)*jjH;jjG.fillStyle=jjHash(jjK,3)<.5?'rgba(0,0,0,.07)':'rgba(255,255,255,.08)';jjG.fillRect(jjX,jjY,1.5,1.5);}
  for(const jjB of jjBricks){const jjPal=jjB.header&&jjSpec.headerFaces?jjSpec.headerFaces:jjSpec.faces;const jjT=jjHash(jjB.r,jjB.i,7);
   let jjBase=jjPal[Math.floor(jjHash(jjB.r,jjB.i,3)*jjPal.length)];jjBase=jjShadeHex(jjBase,.9+jjT*.2);
   const jjX=jjB.x+jjJ/2,jjY=jjB.y+jjJ/2,jjBw=jjB.w-jjJ,jjBh=jjB.h-jjJ;
   // wrap horizontally so the tile is seamless
   for(const jjDx of [0,-jjW,jjW]){const jjXX=jjX+jjDx;if(jjXX>jjW||jjXX+jjBw<0)continue;
    jjG.fillStyle=jjBase;jjG.fillRect(jjXX,jjY,jjBw,jjBh);
    // fired-face variation: a darker scorched end on some bricks, speckle everywhere
    if(jjHash(jjB.r,jjB.i,11)<.28){const jjGr=jjG.createLinearGradient(jjXX,0,jjXX+jjBw,0);const jjL=jjHash(jjB.r,jjB.i,12)<.5;jjGr.addColorStop(jjL?0:1,'rgba(30,10,5,.32)');jjGr.addColorStop(jjL?.45:.55,'rgba(30,10,5,0)');jjG.fillStyle=jjGr;jjG.fillRect(jjXX,jjY,jjBw,jjBh);}
    for(let jjK=0;jjK<14*(jjSpec.speckle||1);jjK++){const jjPx=jjXX+jjHash(jjB.r*31+jjK,jjB.i,5)*jjBw,jjPy=jjY+jjHash(jjB.r,jjB.i*17+jjK,6)*jjBh;jjG.fillStyle=jjHash(jjK,jjB.r,jjB.i)<.6?'rgba(20,8,4,.18)':'rgba(255,240,220,.16)';jjG.fillRect(jjPx,jjPy,2,1.5);}
    // a lit top arris and a shadowed bottom arris so courses read in raking light
    jjG.fillStyle='rgba(255,245,230,.16)';jjG.fillRect(jjXX,jjY,jjBw,1.4);
    jjG.fillStyle='rgba(0,0,0,.22)';jjG.fillRect(jjXX,jjY+jjBh-1.6,jjBw,1.6);}}
 });
 const jjBump=jjCanvasEl(256,256,(jjG)=>{jjG.fillStyle='#202020';jjG.fillRect(0,0,256,256);const jjS=.5;
  for(const jjB of jjBricks){const jjX=(jjB.x+jjJ/2)*jjS,jjY=(jjB.y+jjJ/2)*jjS,jjBw=(jjB.w-jjJ)*jjS,jjBh=(jjB.h-jjJ)*jjS;const jjV=170+Math.floor(jjHash(jjB.r,jjB.i,9)*60);
   for(const jjDx of [0,-256,256]){jjG.fillStyle='rgb('+jjV+','+jjV+','+jjV+')';jjG.fillRect(jjX+jjDx,jjY,jjBw,jjBh);jjG.fillStyle='rgba(0,0,0,.25)';jjG.fillRect(jjX+jjDx,jjY+jjBh-1,jjBw,1);}}});
 return {map:jjTex(jjCol),bump:jjTex(jjBump,false)};
}
// ---- marble: near-white ashlar, 1.2 x 0.6 m blocks, soft diagonal veins; 512 px = 2.4 m ----
const JJ_MARBLE_TILE=2.4;
function jjMarblePair(jjBaseHex,jjVeinHex){
 const jjN=512,jjBlocks=[];for(let jjR=0;jjR<4;jjR++)for(let jjI=-1;jjI<3;jjI++)jjBlocks.push({x:jjI*256+(jjR%2)*128,y:jjR*128,r:jjR,i:jjI});
 const jjVeins=jjG=>{for(let jjV=0;jjV<26;jjV++){let jjX=jjHash(jjV,1)*jjN,jjY=jjHash(jjV,2)*jjN,jjA=-.7+jjHash(jjV,3)*.5;const jjLen=60+jjHash(jjV,4)*260;
  jjG.beginPath();jjG.moveTo(jjX,jjY);for(let jjS=0;jjS<jjLen;jjS+=6){jjA+=(jjHash(jjV,jjS)-.5)*.5;jjX+=Math.cos(jjA)*6;jjY+=Math.sin(jjA)*6;jjG.lineTo(jjX,jjY);}
  jjG.lineWidth=jjV%4===0?2.2:1;jjG.stroke();}};
 const jjCol=jjCanvasEl(jjN,jjN,(jjG)=>{jjG.fillStyle=jjBaseHex;jjG.fillRect(0,0,jjN,jjN);
  // cloudy body
  for(let jjK=0;jjK<220;jjK++){const jjX=jjHash(jjK,21)*jjN,jjY=jjHash(jjK,22)*jjN,jjR=12+jjHash(jjK,23)*46;const jjGr=jjG.createRadialGradient(jjX,jjY,0,jjX,jjY,jjR);jjGr.addColorStop(0,jjHash(jjK,24)<.5?'rgba(200,190,175,.10)':'rgba(255,255,255,.12)');jjGr.addColorStop(1,'rgba(255,255,255,0)');jjG.fillStyle=jjGr;jjG.fillRect(jjX-jjR,jjY-jjR,jjR*2,jjR*2);}
  // per-block tone
  for(const jjB of jjBlocks){jjG.fillStyle='rgba('+(jjHash(jjB.r,jjB.i,1)<.5?'120,105,90':'255,250,240')+','+(.03+jjHash(jjB.r,jjB.i,2)*.05)+')';for(const jjDx of [0,-jjN,jjN])jjG.fillRect(jjB.x+jjDx,jjB.y,256,128);}
  jjG.strokeStyle='rgba(118,108,98,.28)';jjVeins(jjG);jjG.save();jjG.translate(jjN,0);jjVeins(jjG);jjG.restore();jjG.save();jjG.translate(-jjN,0);jjVeins(jjG);jjG.restore();
  jjG.strokeStyle='rgba(150,138,124,.18)';jjG.save();jjG.translate(0,jjN/2);jjG.scale(1,-1);jjVeins(jjG);jjG.restore();
  // joints
  for(const jjB of jjBlocks)for(const jjDx of [0,-jjN,jjN]){jjG.fillStyle='rgba(95,85,75,.42)';jjG.fillRect(jjB.x+jjDx,jjB.y,256,2);jjG.fillRect(jjB.x+jjDx,jjB.y,2,128);jjG.fillStyle='rgba(255,255,255,.35)';jjG.fillRect(jjB.x+jjDx,jjB.y+2,256,1);}
 });
 const jjBump=jjCanvasEl(256,256,(jjG)=>{jjG.fillStyle='#d0d0d0';jjG.fillRect(0,0,256,256);jjG.fillStyle='#303030';for(const jjB of jjBlocks)for(const jjDx of [0,-512,512]){jjG.fillRect((jjB.x+jjDx)/2,jjB.y/2,128,1.5);jjG.fillRect((jjB.x+jjDx)/2,jjB.y/2,1.5,64);}});
 return {map:jjTex(jjCol),bump:jjTex(jjBump,false)};
}
// ---- lime plaster (poor houses): ochre wash, mottled, a few cracks; 512 px = 4 m ----
const JJ_PLASTER_TILE=4;
function jjPlasterMap(jjHex){return jjTex(jjCanvasEl(512,512,(jjG)=>{jjG.fillStyle=jjHex;jjG.fillRect(0,0,512,512);
 for(let jjK=0;jjK<380;jjK++){const jjX=jjHash(jjK,41)*512,jjY=jjHash(jjK,42)*512,jjR=10+jjHash(jjK,43)*60;const jjGr=jjG.createRadialGradient(jjX,jjY,0,jjX,jjY,jjR);jjGr.addColorStop(0,jjHash(jjK,44)<.55?'rgba(90,60,30,.09)':'rgba(255,245,220,.11)');jjGr.addColorStop(1,'rgba(0,0,0,0)');jjG.fillStyle=jjGr;jjG.fillRect(jjX-jjR,jjY-jjR,jjR*2,jjR*2);}
 for(let jjK=0;jjK<9000;jjK++){jjG.fillStyle=jjHash(jjK,45)<.5?'rgba(0,0,0,.05)':'rgba(255,255,255,.05)';jjG.fillRect(jjHash(jjK,46)*512,jjHash(jjK,47)*512,1.5,1.5);}
 jjG.strokeStyle='rgba(70,45,25,.28)';jjG.lineWidth=1;for(let jjC=0;jjC<7;jjC++){let jjX=jjHash(jjC,51)*512,jjY=jjHash(jjC,52)*512;jjG.beginPath();jjG.moveTo(jjX,jjY);for(let jjS=0;jjS<9;jjS++){jjX+=(jjHash(jjC,jjS)-.5)*22;jjY+=8+jjHash(jjS,jjC)*10;jjG.lineTo(jjX,jjY);}jjG.stroke();}}));}
// ---- roof tile / dome scales (UV 0..1 around a dome: repeat set on the texture) ----
function jjScaleMap(jjHex,jjEdgeHex){return jjTex(jjCanvasEl(256,256,(jjG)=>{jjG.fillStyle=jjEdgeHex;jjG.fillRect(0,0,256,256);const jjR=16;
 for(let jjRow=0;jjRow<12;jjRow++)for(let jjI=-1;jjI<9;jjI++){const jjX=jjI*32+(jjRow%2)*16+16,jjY=jjRow*22;const jjGr=jjG.createLinearGradient(0,jjY-4,0,jjY+jjR+6);const jjB=jjShadeHex(jjHex,.86+jjHash(jjRow,jjI,3)*.26);jjGr.addColorStop(0,jjB);jjGr.addColorStop(1,jjShadeHex(jjB,.62));jjG.fillStyle=jjGr;
  jjG.beginPath();jjG.moveTo(jjX-jjR,jjY);jjG.lineTo(jjX-jjR,jjY+6);jjG.arc(jjX,jjY+6,jjR,Math.PI,0,true);jjG.lineTo(jjX+jjR,jjY);jjG.closePath();jjG.fill();}}));}

// shaft relief patterns (unchanged look, round 2 approved): 256 px wraps a whole number of times
function jjPatternMap(jjKey,jjBase,jjInk){return jjCanvas(256,256,(jjG,jjW,jjH)=>{jjG.fillStyle=jjBase;jjG.fillRect(0,0,jjW,jjH);
 for(let jjK=0;jjK<2400;jjK++){jjG.fillStyle=jjHash(jjK,61)<.5?'rgba(0,0,0,.08)':'rgba(255,240,220,.07)';jjG.fillRect(jjHash(jjK,62)*256,jjHash(jjK,63)*256,2,1.4);}
 jjG.strokeStyle='rgba(60,25,15,.25)';jjG.lineWidth=1;for(let jjY=0;jjY<256;jjY+=10.67){jjG.beginPath();jjG.moveTo(0,jjY);jjG.lineTo(256,jjY);jjG.stroke();}
 jjG.strokeStyle=jjInk;jjG.fillStyle=jjInk;jjG.lineWidth=7;jjG.lineJoin='round';jjG.globalAlpha=.9;
 if(jjKey==='spiral'){for(let jjRow=0;jjRow<2;jjRow++){jjG.beginPath();for(let jjI=0;jjI<=90;jjI++){const jjT=jjI/90,jjA=jjT*Math.PI*4+jjRow*Math.PI,jjX=jjT*256,jjY=jjRow*128+64+Math.sin(jjA)*43;if(jjI)jjG.lineTo(jjX,jjY);else jjG.moveTo(jjX,jjY);}jjG.stroke();}}
 else if(jjKey==='chevron'){for(let jjY=-64;jjY<jjH+64;jjY+=64){jjG.beginPath();jjG.moveTo(0,jjY);for(let jjX=0;jjX<=jjW;jjX+=32)jjG.lineTo(jjX,jjY+(jjX/32%2?32:0));jjG.stroke();}}
 else if(jjKey==='diamond'){for(let jjY=-64;jjY<jjH+64;jjY+=96)for(let jjX=-64;jjX<jjW+64;jjX+=96){jjG.beginPath();jjG.moveTo(jjX,jjY-44);jjG.lineTo(jjX+44,jjY);jjG.lineTo(jjX,jjY+44);jjG.lineTo(jjX-44,jjY);jjG.closePath();jjG.stroke();}}
 else if(jjKey==='ogee'){for(let jjX=-64;jjX<jjW+64;jjX+=64){jjG.beginPath();jjG.moveTo(jjX,0);jjG.bezierCurveTo(jjX+48,42,jjX-48,86,jjX,128);jjG.bezierCurveTo(jjX+48,170,jjX-48,214,jjX,256);jjG.stroke();}}
 else if(jjKey==='fleur'){for(let jjY=40;jjY<jjH;jjY+=96)for(let jjX=40;jjX<jjW;jjX+=96){jjG.beginPath();jjG.moveTo(jjX,jjY+32);jjG.bezierCurveTo(jjX-42,jjY+2,jjX-28,jjY-32,jjX,jjY-7);jjG.bezierCurveTo(jjX+28,jjY-32,jjX+42,jjY+2,jjX,jjY+32);jjG.stroke();jjG.beginPath();jjG.moveTo(jjX,jjY+32);jjG.lineTo(jjX,jjY+48);jjG.stroke();}}
 else if(jjKey==='tracery'){for(let jjY=0;jjY<jjH;jjY+=64){jjG.beginPath();jjG.moveTo(0,jjY+32);for(let jjX=0;jjX<=jjW;jjX+=32)jjG.lineTo(jjX,jjY+32+Math.sin(jjX/32*Math.PI)*24);jjG.stroke();}}
 jjG.globalAlpha=1;});}

// World-unit UVs (Iziz's vWorldUV, with a per-K program key so materials with different K do not
// share one compiled shader). INSTANCES are re-tiled by their scale per face normal; JJGEO.cyl /
// cyl32 carry u premultiplied by 2*PI on their sides, so u*radius = arc length. Plain meshes keep
// their own UVs times K (ExtrudeGeometry's UVs are already in metres).
// jjKy (optional): a separate v factor, for a library set whose tile is not square (60-jj-mat.js, the library block)
function jjWorldUV(jjMat,jjK,jjKy){jjMat.userData.uvK=jjK;const jjKs=jjKy===undefined?jjK.toFixed(4):'vec2('+jjK.toFixed(4)+','+jjKy.toFixed(4)+')';
 const jjCode='#ifdef USE_UV\n#ifdef USE_INSTANCING\nmat4 _im=instanceMatrix;\nvec3 _sc=vec3(length(_im[0].xyz),length(_im[1].xyz),length(_im[2].xyz));\nvec3 _an=abs(normal);\nvec2 _sw=(_an.y>0.5)?vec2(_sc.x,_sc.z):((_an.x>0.5)?vec2(_sc.z,_sc.y):vec2(_sc.x,_sc.y));\nvUv=uv*_sw*'+jjKs+';\n#else\nvUv=uv*'+jjKs+';\n#endif\n#endif';
 // built with new Function so the SOURCE TEXT carries K: three.js keys compiled programs on
 // onBeforeCompile.toString(), and kbake's material clone keeps onBeforeCompile but not a custom key
 jjMat.onBeforeCompile=new Function('jjSh','jjSh.vertexShader=jjSh.vertexShader.replace("#include <uv_vertex>",'+JSON.stringify(jjCode)+');');
 return jjMat;}

const JJTX={};
JJTX.brick=jjBrickPair({faces:['#a93a2c','#b2432f','#9c3226','#b84a34','#a33828','#8f2f24'],mortar:'#cbbca6',headerEvery:6,headerFaces:['#7d2a22','#8a3026','#6e241e']});
JJTX.brickDeep=jjBrickPair({faces:['#7c2a22','#843026','#6f241e','#8c3428','#76291f'],mortar:'#a8957e',speckle:1.4});
JJTX.brickYellow=jjBrickPair({faces:['#d8a447','#cf9a3f','#e0ae55','#c99239','#d49f4a'],mortar:'#efe2c8',headerEvery:6,headerFaces:['#bf8634','#c88f3a']});
JJTX.brickDark=jjBrickPair({faces:['#3e2a26','#4a2f29','#33231f','#5a3328','#7a2e24'],mortar:'#8f8170',speckle:1.6});
JJTX.bandBrick=jjBrickPair({faces:['#a93a2c','#b2432f','#9c3226','#b84a34'],mortar:'#cbbca6',headerEvery:4,headerFaces:['#d8a447','#cf9a3f','#e0ae55']});
JJTX.marble=jjMarblePair('#f2eee6','#c9beb0');
JJTX.ochre=jjPlasterMap('#dfae55');
JJTX.domeTerracotta=jjScaleMap('#c4602f','#6e3018');JJTX.domeTerracotta.repeat.set(10,5);
JJTX.domeSlate=jjScaleMap('#3a404e','#1c1f26');JJTX.domeSlate.repeat.set(12,6);
JJTX.domeGold=jjScaleMap('#e2b33a','#8a6514');JJTX.domeGold.repeat.set(10,5);
JJTX.sunray=jjCanvas(512,512,(jjG,jjW,jjH)=>{jjG.fillStyle='#efe5cf';jjG.fillRect(0,0,jjW,jjH);jjG.translate(jjW/2,jjH/2);for(let jjI=0;jjI<32;jjI++){jjG.beginPath();jjG.moveTo(0,0);jjG.arc(0,0,245,jjI*Math.PI/16,jjI*Math.PI/16+Math.PI/32);jjG.closePath();jjG.fillStyle=jjI%2?'rgba(168,50,42,.86)':'rgba(217,165,32,.78)';jjG.fill();}jjG.beginPath();jjG.arc(0,0,76,0,Math.PI*2);jjG.fillStyle='#2f3440';jjG.fill();jjG.beginPath();jjG.arc(0,0,54,0,Math.PI*2);jjG.fillStyle='#e4b54a';jjG.fill();});
JJTX.patterns={};for(const jjPtn of ['spiral','chevron','diamond','ogee','fleur','tracery'])JJTX.patterns[jjPtn]=jjPatternMap(jjPtn,'#a94332','#e5b66a');

const JJ_BK=1/JJ_BRICK_TILE,JJ_MK=1/JJ_MARBLE_TILE;
function jjBrickMat(jjPair,jjRough){return jjWorldUV(new THREE.MeshStandardMaterial({map:jjPair.map,bumpMap:jjPair.bump,bumpScale:.35,color:0xffffff,roughness:jjRough||.92}),JJ_BK);}
const JMAT={
 brick:jjBrickMat(JJTX.brick),
 brickYellow:jjBrickMat(JJTX.brickYellow),
 brickDeep:jjBrickMat(JJTX.brickDeep,.95),
 brickDark:jjBrickMat(JJTX.brickDark,.8),
 bandBrick:jjBrickMat(JJTX.bandBrick),
 ochre:jjWorldUV(new THREE.MeshStandardMaterial({map:JJTX.ochre,color:0xffffff,roughness:.95}),1/JJ_PLASTER_TILE),
 marble:jjWorldUV(new THREE.MeshStandardMaterial({map:JJTX.marble.map,bumpMap:JJTX.marble.bump,bumpScale:.5,color:0xffffff,roughness:.36,metalness:.02}),JJ_MK),
 gold:new THREE.MeshStandardMaterial({color:JPAL.gold,metalness:.75,roughness:.3}),
 domeGold:new THREE.MeshStandardMaterial({map:JJTX.domeGold,color:0xffffff,metalness:.7,roughness:.32}),
 slate:new THREE.MeshStandardMaterial({map:JJTX.domeSlate,color:0xffffff,metalness:.2,roughness:.55}),
 terracotta:new THREE.MeshStandardMaterial({map:JJTX.domeTerracotta,color:0xffffff,roughness:.8}),
 tile:jjWorldUV(new THREE.MeshStandardMaterial({map:JJTX.brickDeep.map,color:0xe8a080,roughness:.85}),JJ_BK),
 dark:new THREE.MeshStandardMaterial({color:JPAL.brickDark,roughness:.9}),
 wood:new THREE.MeshStandardMaterial({color:0x5a3a24,roughness:.8}),
 turquoise:new THREE.MeshStandardMaterial({color:JPAL.turquoise,roughness:.5}),
 cream:new THREE.MeshStandardMaterial({color:JPAL.marble,roughness:.82}),
 canvas:new THREE.MeshStandardMaterial({color:JPAL.canvasCream,roughness:1,side:THREE.DoubleSide}),
 iron:new THREE.MeshStandardMaterial({color:0x443a31,metalness:.72,roughness:.42}),
 glass:new THREE.MeshStandardMaterial({color:0x17313b,metalness:.15,roughness:.28,emissive:0x091318,side:THREE.DoubleSide}),
 glow:new THREE.MeshStandardMaterial({color:0xffd9a0,emissive:0xffb050,emissiveIntensity:1.6,roughness:.5}),
 water:new THREE.MeshStandardMaterial({color:0x2f6f86,metalness:.3,roughness:.12}),
 sunray:new THREE.MeshStandardMaterial({map:JJTX.sunray,color:0xffffff,roughness:.5,side:THREE.DoubleSide})
};
for(const jjPtn of ['spiral','chevron','diamond','ogee','fleur','tracery'])JMAT['shaft_'+jjPtn]=new THREE.MeshStandardMaterial({map:JJTX.patterns[jjPtn],bumpMap:JJTX.patterns[jjPtn],bumpScale:.12,color:0xffffff,roughness:.88});
// Palette hexes are sRGB; a MeshStandardMaterial's color is LINEAR in this renderer (outputEncoding
// sRGB), so an unconverted hex renders far too pale (dark window panes read light grey). Convert every
// untextured material once here; textured ones keep white (their maps are sRGB-encoded).
for(const jjK in JMAT){const jjM=JMAT[jjK];if(!jjM.map)jjM.color.convertSRGBToLinear();if(jjM.emissive&&jjM.emissive.getHex())jjM.emissive.convertSRGBToLinear();}

// ---- the material library (core/materials/record, materials.json; core/materials/PLAN.md "How a build adopts the
// library"): where the pack has a JMAT family, its colour, normal and roughness maps replace the procedural ones, in
// full colour (tint keep 1). ?mat=proc keeps the procedural look. The world-UV'd walls tile at the set's own size in
// metres (u and v apart: a set's tile need not be square); the domes keep their UV-around-the-dome mapping with
// repeats that keep about the procedural scale count; the shaft panels and the sunray map once over their UVs. ----
const JJ_LIB_FAMILY={tile:'brickDeep',slate:'domeSlate',terracotta:'domeTerracotta'};   // the dome materials' JMAT keys differ from their families                                  // JMAT key -> pack family, where they differ
const JJ_DOME_REPEAT={domeTerracotta:[20,12],domeSlate:[21,9],domeGold:[20,12]};
(function(){
 if(typeof KMAT==='undefined'||KMAT.mode!=='lib')return;
 for(const jjK in JMAT){const jjL=KMAT.packed('jimjam',JJ_LIB_FAMILY[jjK]||jjK);if(!jjL)continue;
  const jjM=JMAT[jjK],jjT=KMAT.textures(jjL,{aniso:8});
  jjM.map=jjT.map;jjM.bumpMap=null;
  if(jjT.normalMap){jjM.normalMap=jjT.normalMap;jjM.normalScale.set(jjL.normalScale,jjL.normalScale);}
  if(jjT.roughnessMap){jjM.roughnessMap=jjT.roughnessMap;jjM.roughness=1;}
  if(jjM.userData.uvK!==undefined)jjWorldUV(jjM,1/jjL.scale[0],1/jjL.scale[1]);
  else{const jjR=JJ_DOME_REPEAT[JJ_LIB_FAMILY[jjK]||jjK]||(jjK.startsWith('shaft_')?[1,jjL.scale[0]/jjL.scale[1]]:null);
   if(jjR)for(const jjX of [jjT.map,jjT.normalMap,jjT.roughnessMap])if(jjX)jjX.repeat.set(jjR[0],jjR[1]);}
  jjM.userData.lib=jjL;jjM.needsUpdate=true;}
})();
// the adapter: every JMAT material as a record, for the export (window._materials)
(function(){
 if(typeof KMAT==='undefined')return;
 const jjRecs={};
 for(const jjK in JMAT){const jjM=JMAT[jjK],jjL=jjM.userData.lib;
  jjRecs[jjK]={id:'jimjam.'+jjK,family:jjK,tint:false,roughness:jjL?1:Math.min(1,jjM.roughness),metal:Math.min(1,jjM.metalness||0),
   scale:jjL?jjL.scale:(jjM.userData.uvK?[1/jjM.userData.uvK,1/jjM.userData.uvK]:[1,1]),lib:jjL?jjL.lib:null,
   tex:jjL||!jjM.map?null:'jimjam.'+jjK,bake:!jjL&&!!jjM.map,hook:jjM.userData.uvK!==undefined?'world-uv':null,
   note:jjL?'library set, full colour':(jjM.map?'procedural canvas map':'untextured')};}
 KMAT.adapter('jimjam',jjRecs);window._materials=KMAT.table('jimjam');
})();
// the shared Ancients MAT (core/materials 22, 54): the generic in-place bind, KMAT.ANCIENT_TILES keeping the procedural feature size
if(typeof KMAT!=='undefined'&&KMAT.bindMat)KMAT.bindMat('jimjam',MAT,{tile:KMAT.ANCIENT_TILES});
