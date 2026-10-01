// ---------------------------------------------------------------- JIMJAM CULTURE PACK (sockets: awning, banner, flag, emblem, sign)
// Long red banners with a gold sun, striped canvas awnings (cream/red, cream/turquoise, red/gold) and red shop boards with gold
// pictographs. Registered here with cultDef() (37-sockets.js) and made the active pack, so every Jimjam building's sockets are
// dressed by it. Prefix: jjCult / JJ_CULT.
//
// Why cultDef() and not mkCulture() (80-cultures.js):
//  * 80 runs AFTER this fragment, and mkCulture() reads SYMBOLS (a const in 80), so calling it here throws (temporal dead zone).
//    cultDef() lives in 37, which has run. The fills below only run inside fillSockets(), after every fragment has loaded.
//  * mkCulture() draws through the post-apoc primitives, which 61's adapter ports with two bugs (see KNOWN ISSUES in the report):
//    jjSockQuad/Plane4/Poly add every mesh TWICE (the second copy unplaced, at the socket anchor: a banner shows a ghost half
//    above its rod), and jjSockBox reads y as the box centre while the packs pass the base. mkCulture also has one stripe
//    texture per pack. So this pack draws with its own instanced pieces (one draw call per material for the whole sheet).
// The pack is a fully custom one in the README's sense ("skip the factory and call cultDef").
//
// Socket options this pack reads (all in the socket frame: +z out of the wall, y up, origin at the anchor):
//  awning {w,d,drop,h,scheme,posts}: canopy from the wall (top edge at the anchor) out d and down drop. h = post length below the
//         front edge (pass anchorY-drop to reach the street; 0 or posts:false hangs it on iron brackets). scheme: 'red' (cream/red),
//         'turq' (cream/turquoise), 'gold' (red/gold); omitted, it is picked from the socket's position (deterministic).
//  banner {w,h}: a rod 0.14 m off the wall, red cloth with a gold sun hanging h below the anchor, swallow-tailed.
//  flag   {w,h}: a pole below the anchor (1.6 m) and a swallow-tailed sun flag.
//  emblem {w}:   a gold sun plate.
//  sign   {w,h,trade}: a framed red board with a gold pictograph. Trades: WEAPONS ARMOR GENERAL FOOD (80) and ALCHEMY TEXTILES
//         JEWELER SPICE (here). The icons are added to 80's SIGN_ICONS on first use, so other packs can draw them too.
const JJ_CULT_COL={red:'#a8322a',deep:'#6e1c1a',gold:'#e0b03a',goldDark:'#a87a1c',cream:'#efe2c2',turq:'#3aa6a0'};
const JJ_CULT_AWN={red:['#efe2c2','#b8322a'],turq:['#efe2c2','#2f9a94'],gold:['#b8322a','#e0ae3a']};
const JJ_CULT_STRIPE=.56; // metres per stripe pair
const JJ_CULT_MATS={};
function jjCultMat(jjKey,jjMake){return JJ_CULT_MATS[jjKey]||(JJ_CULT_MATS[jjKey]=jjMake());}
function jjCultClothMat(jjCanvasEl,jjO){jjO=jjO||{};const jjT=jjTex(jjCanvasEl,true);if(!jjO.repeat){jjT.wrapS=jjT.wrapT=THREE.ClampToEdgeWrapping;}
 return new THREE.MeshStandardMaterial({map:jjT,color:0xffffff,roughness:jjO.rough||.92,metalness:jjO.metal||0,side:THREE.DoubleSide,alphaTest:jjO.alpha?.5:0});}
// the gold sun: 16 rays (alternately long and short), a gold disc, a red ring and a gold face
function jjCultSun(jjG,jjCx,jjCy,jjR,jjInk,jjGround){jjG.fillStyle=jjInk;for(let jjK=0;jjK<16;jjK++){const jjA=jjK*TAU/16,jjL=jjK%2?jjR*.84:jjR,jjS=jjK%2?.16:.13;jjG.beginPath();
  jjG.moveTo(jjCx+Math.cos(jjA-jjS)*jjR*.5,jjCy+Math.sin(jjA-jjS)*jjR*.5);jjG.lineTo(jjCx+Math.cos(jjA)*jjL,jjCy+Math.sin(jjA)*jjL);jjG.lineTo(jjCx+Math.cos(jjA+jjS)*jjR*.5,jjCy+Math.sin(jjA+jjS)*jjR*.5);jjG.fill();}
 jjG.beginPath();jjG.arc(jjCx,jjCy,jjR*.56,0,TAU);jjG.fill();jjG.fillStyle=jjGround;jjG.beginPath();jjG.arc(jjCx,jjCy,jjR*.46,0,TAU);jjG.fill();
 jjG.fillStyle=jjInk;jjG.beginPath();jjG.arc(jjCx,jjCy,jjR*.36,0,TAU);jjG.fill();jjG.fillStyle=jjGround;for(const jjS of [-1,1]){jjG.beginPath();jjG.arc(jjCx+jjS*jjR*.13,jjCy-jjR*.07,jjR*.045,0,TAU);jjG.fill();}
 jjG.strokeStyle=jjGround;jjG.lineWidth=Math.max(1,jjR*.04);jjG.beginPath();jjG.arc(jjCx,jjCy+jjR*.02,jjR*.17,.25*Math.PI,.75*Math.PI);jjG.stroke();}
function jjCultGrain(jjG,jjW,jjH,jjN,jjSeed){let jjS=jjSeed;const jjR=()=>{jjS=(jjS*16807)%2147483647;return jjS/2147483647;};for(let jjI=0;jjI<jjN;jjI++){jjG.fillStyle=`rgba(0,0,0,${.03+jjR()*.07})`;jjG.fillRect(jjR()*jjW,jjR()*jjH,1+jjR()*2,2+jjR()*6);}}
// ---- materials (made on first use)
function jjCultAwnMat(jjScheme){return jjCultMat('awn_'+jjScheme,()=>{const jjC=JJ_CULT_AWN[jjScheme]||JJ_CULT_AWN.red;
 const jjM=jjCultClothMat(jjCanvasEl(64,32,(jjG,jjW,jjH)=>{jjG.fillStyle=jjC[0];jjG.fillRect(0,0,jjW/2,jjH);jjG.fillStyle=jjC[1];jjG.fillRect(jjW/2,0,jjW/2,jjH);
  jjG.fillStyle='rgba(0,0,0,.12)';jjG.fillRect(jjW/2-1,0,2,jjH);jjG.fillRect(jjW-1,0,1,jjH);jjCultGrain(jjG,jjW,jjH,60,jjScheme.length*31+7);}),{repeat:true});
 return jjWorldUV(jjM,1/JJ_CULT_STRIPE);});}
function jjCultBannerMat(jjRatio){return jjCultMat('ban_'+jjRatio,()=>{const jjW=96,jjH=Math.round(96*jjRatio);return jjCultClothMat(jjCanvasEl(jjW,jjH,(jjG)=>{const C=JJ_CULT_COL,jjTail=Math.min(jjH*.16,jjW*.42);
 jjG.fillStyle=C.red;jjG.fillRect(0,0,jjW,jjH);jjG.fillStyle=C.deep;jjG.fillRect(0,0,jjW*.08,jjH);jjG.fillRect(jjW*.92,0,jjW*.08,jjH);
 jjG.fillStyle=C.gold;jjG.fillRect(jjW*.1,0,jjW*.03,jjH);jjG.fillRect(jjW*.87,0,jjW*.03,jjH);jjG.fillRect(0,0,jjW,jjW*.07);jjG.fillRect(0,jjW*.1,jjW,jjW*.02);
 const jjCy=jjW*.62;jjCultSun(jjG,jjW/2,jjCy,jjW*.36,C.gold,C.red);
 for(let jjK=0;jjK<3;jjK++)jjG.fillRect(jjW*.24,jjCy+jjW*.52+jjK*jjW*.09,jjW*.52,jjW*.03);
 for(let jjY=jjCy+jjW*.9;jjY<jjH-jjTail-jjW*.12;jjY+=jjW*.22){jjG.beginPath();jjG.moveTo(jjW/2,jjY);jjG.lineTo(jjW*.6,jjY+jjW*.09);jjG.lineTo(jjW/2,jjY+jjW*.18);jjG.lineTo(jjW*.4,jjY+jjW*.09);jjG.closePath();jjG.fill();}
 jjG.fillRect(0,jjH-jjTail-jjW*.06,jjW,jjW*.03);jjCultGrain(jjG,jjW,jjH,90,jjH);
 jjG.globalCompositeOperation='destination-out';jjG.beginPath();jjG.moveTo(jjW*.12,jjH+1);jjG.lineTo(jjW/2,jjH-jjTail);jjG.lineTo(jjW*.88,jjH+1);jjG.closePath();jjG.fill();jjG.globalCompositeOperation='source-over';}),{alpha:true});});}
function jjCultFlagMat(){return jjCultMat('flag',()=>jjCultClothMat(jjCanvasEl(128,80,(jjG,jjW,jjH)=>{const C=JJ_CULT_COL;jjG.fillStyle=C.red;jjG.fillRect(0,0,jjW,jjH);jjG.fillStyle=C.gold;jjG.fillRect(0,0,jjW,5);jjG.fillRect(0,jjH-5,jjW,5);jjG.fillRect(0,0,6,jjH);
 jjCultSun(jjG,jjW*.38,jjH/2,jjH*.38,C.gold,C.red);jjCultGrain(jjG,jjW,jjH,70,41);jjG.globalCompositeOperation='destination-out';jjG.beginPath();jjG.moveTo(jjW+1,jjH*.12);jjG.lineTo(jjW*.8,jjH/2);jjG.lineTo(jjW+1,jjH*.88);jjG.closePath();jjG.fill();jjG.globalCompositeOperation='source-over';}),{alpha:true}));}
function jjCultEmblemMat(){return jjCultMat('emblem',()=>jjCultClothMat(jjCanvasEl(128,128,(jjG,jjW,jjH)=>{jjG.clearRect(0,0,jjW,jjH);jjCultSun(jjG,jjW/2,jjH/2,jjW*.48,JJ_CULT_COL.gold,JJ_CULT_COL.red);}),{alpha:true,rough:.35,metal:.6}));}
// ---- sign pictographs this pack adds (same signature as 80's SIGN_ICONS: (g,cx,cy,s,fg))
const JJ_CULT_ICONS={
 ALCHEMY:(g,cx,cy,s,fg)=>{g.fillStyle=fg;g.beginPath();g.arc(cx,cy+s*.16,s*.3,0,TAU);g.fill();g.fillRect(cx-s*.09,cy-s*.36,s*.18,s*.3);g.fillRect(cx-s*.14,cy-s*.42,s*.28,s*.08);
  g.fillStyle='rgba(0,0,0,.45)';g.beginPath();g.arc(cx,cy+s*.16,s*.22,.1*Math.PI,.9*Math.PI);g.fill();g.fillStyle=fg;for(const [dx,dy,r] of [[.22,-.5,.06],[.34,-.36,.045],[-.24,-.46,.05]]){g.beginPath();g.arc(cx+dx*s,cy+dy*s,r*s,0,TAU);g.fill();}},
 TEXTILES:(g,cx,cy,s,fg)=>{g.fillStyle=fg;g.fillRect(cx-s*.3,cy-s*.4,s*.6,s*.72);g.strokeStyle=fg;g.lineWidth=s*.035;for(let k=0;k<7;k++){const x=cx-s*.27+k*s*.09;g.beginPath();g.moveTo(x,cy+s*.32);g.lineTo(x,cy+s*.44);g.stroke();}
  g.fillStyle='rgba(0,0,0,.5)';g.beginPath();g.moveTo(cx,cy-s*.28);g.lineTo(cx+s*.18,cy-s*.04);g.lineTo(cx,cy+s*.2);g.lineTo(cx-s*.18,cy-s*.04);g.closePath();g.fill();g.fillStyle=fg;g.beginPath();g.arc(cx,cy-s*.04,s*.06,0,TAU);g.fill();
  g.fillStyle='rgba(0,0,0,.5)';g.fillRect(cx-s*.26,cy-s*.36,s*.52,s*.03);g.fillRect(cx-s*.26,cy+s*.25,s*.52,s*.03);},
 JEWELER:(g,cx,cy,s,fg)=>{g.fillStyle=fg;g.beginPath();g.moveTo(cx-s*.42,cy-s*.12);g.lineTo(cx-s*.24,cy-s*.36);g.lineTo(cx+s*.24,cy-s*.36);g.lineTo(cx+s*.42,cy-s*.12);g.lineTo(cx,cy+s*.42);g.closePath();g.fill();
  g.strokeStyle='rgba(0,0,0,.5)';g.lineWidth=s*.035;g.beginPath();g.moveTo(cx-s*.42,cy-s*.12);g.lineTo(cx+s*.42,cy-s*.12);g.moveTo(cx-s*.12,cy-s*.36);g.lineTo(cx-s*.2,cy-s*.12);g.lineTo(cx,cy+s*.42);g.lineTo(cx+s*.2,cy-s*.12);g.lineTo(cx+s*.12,cy-s*.36);g.stroke();},
 SPICE:(g,cx,cy,s,fg)=>{g.fillStyle=fg;g.beginPath();g.moveTo(cx-s*.36,cy+s*.08);g.quadraticCurveTo(cx-s*.06,cy-s*.46,cx,cy-s*.44);g.quadraticCurveTo(cx+s*.06,cy-s*.46,cx+s*.36,cy+s*.08);g.closePath();g.fill();
  g.beginPath();g.moveTo(cx-s*.46,cy+s*.1);g.lineTo(cx+s*.46,cy+s*.1);g.quadraticCurveTo(cx+s*.4,cy+s*.42,cx,cy+s*.42);g.quadraticCurveTo(cx-s*.4,cy+s*.42,cx-s*.46,cy+s*.1);g.fill();
  g.fillStyle='rgba(0,0,0,.45)';for(const [dx,dy] of [[-.12,-.1],[.1,-.18],[.02,0],[-.2,.02],[.2,-.02]]){g.beginPath();g.arc(cx+dx*s,cy+dy*s,s*.035,0,TAU);g.fill();}g.fillRect(cx-s*.46,cy+s*.1,s*.92,s*.04);}
};
let jjCultIconsMerged=false;
function jjCultIcon(jjTrade){if(!jjCultIconsMerged&&typeof SIGN_ICONS!=='undefined'){for(const jjK in JJ_CULT_ICONS)if(!SIGN_ICONS[jjK])SIGN_ICONS[jjK]=JJ_CULT_ICONS[jjK];jjCultIconsMerged=true;}
 return JJ_CULT_ICONS[jjTrade]||(typeof SIGN_ICONS!=='undefined'?SIGN_ICONS[jjTrade]:null);}
function jjCultSignMat(jjTrade){return jjCultMat('sign_'+jjTrade,()=>jjCultClothMat(jjCanvasEl(256,128,(jjG,jjW,jjH)=>{const C=JJ_CULT_COL;jjG.fillStyle=C.deep;jjG.fillRect(0,0,jjW,jjH);jjCultGrain(jjG,jjW,jjH,160,jjTrade.length*13+5);
 jjG.strokeStyle=C.gold;jjG.lineWidth=5;jjG.strokeRect(7,7,jjW-14,jjH-14);jjG.lineWidth=2;jjG.strokeRect(15,15,jjW-30,jjH-30);
 jjCultSun(jjG,40,jjH/2,22,C.gold,C.deep);jjCultSun(jjG,jjW-40,jjH/2,22,C.gold,C.deep);
 const jjIc=jjCultIcon(jjTrade);if(jjIc)jjIc(jjG,jjW/2,jjH/2+2,92,C.gold);else{jjG.fillStyle=C.gold;jjG.beginPath();jjG.arc(jjW/2,jjH/2,24,0,TAU);jjG.fill();}}),{rough:.7}));}
// ---- drawing in the socket frame: instanced pieces, so the whole sheet's awnings cost one draw call per scheme
const JJ_CULT_GEO={};
function jjCultGeo(jjK){if(JJ_CULT_GEO[jjK])return JJ_CULT_GEO[jjK];let jjG;if(jjK==='box')jjG=JJGEO.box;else if(jjK==='cyl')jjG=new THREE.CylinderGeometry(1,1,1,10);else if(jjK==='ball')jjG=new THREE.SphereGeometry(1,10,7);return JJ_CULT_GEO[jjK]=jjG;}
function jjCultPut(jjName,jjGeoK,jjMat,jjX,jjY,jjZ,jjSX,jjSY,jjSZ,jjQ,jjTint){if(!KIT.defs[jjName])kdef(jjName,jjCultGeo(jjGeoK),jjMat);
 const jjM=globalThis.CM.clone().multiply(new THREE.Matrix4().compose(new THREE.Vector3(jjX,jjY,jjZ),jjQ||new THREE.Quaternion(),new THREE.Vector3(1,1,1)));
 const jjP=new THREE.Vector3(),jjR=new THREE.Quaternion(),jjS=new THREE.Vector3();jjM.decompose(jjP,jjR,jjS);
 kput(jjName,[jjP.x,jjP.y,jjP.z],jjR,[jjSX*jjS.x,jjSY*jjS.y,jjSZ*jjS.z],jjTint===undefined?null:jjTint);}
function jjCultRod(jjName,jjMat,jjA,jjB,jjR){const jjAV=new THREE.Vector3(...jjA),jjBV=new THREE.Vector3(...jjB),jjD=jjBV.clone().sub(jjAV),jjL=jjD.length();if(jjL<.001)return;
 jjCultPut(jjName,'cyl',jjMat,(jjA[0]+jjB[0])/2,(jjA[1]+jjB[1])/2,(jjA[2]+jjB[2])/2,jjR,jjL,jjR,new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),jjD.normalize()));}
function jjCultScheme(jjO,jjS){if(jjO.scheme&&JJ_CULT_AWN[jjO.scheme])return jjO.scheme;const jjE=jjS&&jjS.m?jjS.m.elements:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
 return ['red','turq','gold'][Math.abs(Math.floor(jjE[12]*.7+jjE[14]*1.3))%3];}
function jjCultAwning(jjO,jjS){const jjW=jjO.w||2.4,jjD=jjO.d||1.4,jjDrop=jjO.drop===undefined?.5:jjO.drop,jjH=jjO.posts===false?0:(jjO.h===undefined?2.2:jjO.h),jjSch=jjCultScheme(jjO,jjS),jjM=jjCultAwnMat(jjSch);
 const jjL=Math.hypot(jjD,jjDrop),jjQ=new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.atan2(jjDrop,jjD),0,0)),jjNm='jj_cult_awn_'+jjSch;
 jjCultPut(jjNm,'box',jjM,0,-jjDrop/2,jjD/2,jjW,.045,jjL,jjQ);                                  // the canopy
 jjCultPut(jjNm,'box',jjM,0,-jjDrop-.15,jjD,jjW,.3,.03);                                        // the valance
 const jjN=Math.max(3,Math.round(jjW/(JJ_CULT_STRIPE/2)));for(let jjI=0;jjI<jjN;jjI++)jjCultPut(jjNm,'box',jjM,-jjW/2+(jjI+.5)*jjW/jjN,-jjDrop-.36,jjD,jjW/jjN*.82,.12,.03); // tabs
 const jjWood=JMAT.wood,jjIron=JMAT.iron,jjGold=JMAT.gold;
 jjCultPut('jj_cult_wood','box',jjWood,0,-.04,.06,jjW+.1,.1,.1);                               // wall batten
 for(const jjSx of [-1,1])jjCultRod('jj_cult_woodrod',jjWood,[jjSx*(jjW/2-.04),-.02,.06],[jjSx*(jjW/2-.04),-jjDrop+.02,jjD-.03],.04);
 jjCultRod('jj_cult_woodrod',jjWood,[-jjW/2,-jjDrop,jjD-.03],[jjW/2,-jjDrop,jjD-.03],.045);
 if(jjH>0){for(const jjSx of [-1,1]){jjCultRod('jj_cult_woodrod',jjWood,[jjSx*(jjW/2-.05),-jjDrop,jjD-.03],[jjSx*(jjW/2-.05),-jjDrop-jjH,jjD-.03],.055);
   jjCultPut('jj_cult_gold','ball',jjGold,jjSx*(jjW/2-.05),-jjDrop+.06,jjD-.03,.08,.1,.08);}}
 else for(const jjSx of [-1,1])jjCultRod('jj_cult_ironrod',jjIron,[jjSx*(jjW/2-.08),-jjDrop-.55,.02],[jjSx*(jjW/2-.08),-jjDrop+.01,jjD-.06],.025);}
function jjCultBanner(jjO){const jjW=jjO.w||.8,jjH=jjO.h||2,jjRatio=Math.max(1,Math.round(jjH/jjW*2)/2),jjM=jjCultBannerMat(jjRatio);
 jjCultRod('jj_cult_goldrod',JMAT.gold,[-jjW/2-.12,0,.14],[jjW/2+.12,0,.14],.035);for(const jjSx of [-1,1])jjCultPut('jj_cult_gold','ball',JMAT.gold,jjSx*(jjW/2+.14),0,.14,.06,.06,.06);
 for(const jjSx of [-1,1])jjCultRod('jj_cult_ironrod',JMAT.iron,[jjSx*(jjW/2+.02),0,0],[jjSx*(jjW/2+.02),0,.16],.02);
 jjCultPut('jj_cult_ban_'+jjRatio,'box',jjM,0,-jjH/2-.02,.17,jjW,jjH,.015);}
function jjCultFlag(jjO){const jjW=jjO.w||1,jjH=jjO.h||.65;jjCultRod('jj_cult_woodrod',JMAT.wood,[0,-1.6,0],[0,.3,0],.04);jjCultPut('jj_cult_gold','ball',JMAT.gold,0,.34,0,.07,.07,.07);
 jjCultPut('jj_cult_flag','box',jjCultFlagMat(),jjW/2+.04,-jjH/2+.24,0,jjW,jjH,.012);}
function jjCultEmblem(jjO){const jjW=jjO.w||.9;jjCultPut('jj_cult_emblem','box',jjCultEmblemMat(),0,0,.04,jjW,jjW,.03);}
function jjCultSign(jjO){const jjW=jjO.w||2,jjH=jjO.h||.7,jjT=(jjO.trade||'').toUpperCase();
 jjCultPut('jj_cult_signframe','box',JMAT.wood,0,0,.035,jjW+.18,jjH+.18,.07);for(const jjSy of [-1,1])jjCultPut('jj_cult_goldbar','box',JMAT.gold,0,jjSy*(jjH/2+.1),.06,jjW+.26,.05,.08);
 const jjSm=jjCultSignMat(jjT);jjCultPut('jj_cult_sign_'+jjT,'box',jjSm,0,0,.08,jjW,jjH,.02);
 if(jjO.double!==false)jjCultPut('jj_cult_sign_'+jjT,'box',jjSm,0,0,-.01,jjW,jjH,.02);} // a back face too: projecting signs read from both sides
const JJ_CULT_PACK=cultDef({key:'jimjam',name:'Jimjam',paint:[0xa8322a,0x7e2220,0xd9a33a,0xe4b54a,0xf1ece2,0x3aa6a0],paintShare:.6,
 signBg:JJ_CULT_COL.deep,signFg:JJ_CULT_COL.gold,
 fill:{awning:jjCultAwning,banner:jjCultBanner,flag:jjCultFlag,emblem:jjCultEmblem,sign:jjCultSign,paint:()=>{}}});
CULT.cur=JJ_CULT_PACK; // the active pack for every Jimjam building (80's generic pack only takes over when cur is unset)
