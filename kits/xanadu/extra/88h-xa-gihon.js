// ================================================================= XANADU — Gihon's pieces: the Mint, the assessors, the treasury, the gold-and-opal dress, the violet dress
// OPT-IN (kits/xanadu/extra: a page reads it in place through its kit.json "external", so no other page changes; it folds into
// the kit's src at the next all-builds rebuild, TODO.md "Ride along"). For settlements/gihon (PLAN.md sections 3 and 8; the owner,
// 2026-11-17: "the garrison fortress, which doubles as the headquarters of the Sultan's Mint and tax assessors ... its temple is
// spectacularly decorated with both [gold and opals]. the White and Violet orders have monasteries here"). Every piece is drawn
// with the kit's own helpers (72-xa-helpers) and items, in the def's frame (x east, +z the front); load after 88f (its white
// dress wraps kput first; this wraps it again).
//   xa_mint_hall          the Sultan's Mint: a hall on a dressed plinth, the furnaces' stacks along its back, an iwan door under a
//                         gilt roof (the striking floor, the furnaces, the die room)
//   xa_assessors_hall     the assessors' hall: a domed hall (a gilt dome on a drum) with a portico, where the gold is weighed and
//                         the opals graded for the Fifth
//   xa_treasury           the treasury: a squat dressed-stone strong house, slit windows, an iron-banded door, a gilt kiosk
//   xa_grand_temple_gold  the Grand Temple (77-xa-sacred) in Gihon's dress: its tiled and red parts gilt, its bands, friezes and
//                         mosaics opal inlay, opal-set stelae before its stair
//   xa_monastery_violet   the monastery (77-xa-sacred) in the Violet Storm's violet wash (the Tempest's daughter house)
// THE OPAL INLAY IS A STAND-IN: MAT.xOpal is a plain milky, slightly metallic material tinted per instance from a few opal hues,
// until the opal inlay set is delivered (core/materials/PROMPTS-NEEDED.md section 58); the gilt is the kit's own (MAT.xGold).
// No THREE beyond the kit's materials; no rnd() outside reseed (each build reseeds from its own number).
MAT.xOpal=xStd({roughness:.14,metalness:.18});   /* a stand-in (above) */
kdef('xOpalB',VBOX,MAT.xOpal);kdef('xOpalP',VPLANE,MAT.xOpal);
const XH_OPAL=[0xd8ecf2,0xe4f0dc,0xf0e2ee,0xdde3f6,0xece8d6];   /* milky opal with its play of colour: blue, green, rose, violet, cream */
const xhOpal=(p)=>xC(XH_OPAL[Math.abs(Math.floor((p[0]*3.7+p[2]*5.3+p[1]*1.1)))%XH_OPAL.length]);
// ---------------------------------------------------------------- the dresses (a wrap of kput, as 88f's white dress)
const XH_WALLS=new Set(['xWashB','xEarthB','vPlaster','xWallW','xWallE','xWallS','xWallD']);
const XH_INLAY=new Set(['xBandB','xFriezeB','xFriezeC','xMosAB','xMosBB']),XH_INLAYP=new Set(['xMosA','xMosB','xMosC','xMosD']);
const _xhKputGihon=kput;
kput=function(name,p,q,s,c){const C=VERN.cur,o=C&&C.o;if(!o||(!o.goldDress&&!o.violetDress))return _xhKputGihon(name,p,q,s,c);
 const red=c&&c.r>.38&&c.g<.3&&c.b<.3&&name!=='xGoldB'&&name!=='xGold';
 if(o.violetDress){const wall=XH_WALLS.has(name)||/^xBat[WESD]\d\d$/.test(name);
  if(wall||(red&&Array.isArray(s)&&Math.max(s[0],s[2])>2)){const w=C.violet.clone().multiplyScalar(.96+.04*((p[0]*7.1+p[2]*3.3)%1+1)%1);return _xhKputGihon(name,p,q,s,w);}
  return _xhKputGihon(name,p,q,s,c);}
 /* the gold dress: the roofs, the domes and bulbs and the red palace gilt; the bands, friezes and murals opal inlay */
 const gold=C.gold;
 if(name==='xTilesB')return _xhKputGihon('xGoldB',p,q,s,gold);
 if(name==='xDomeT'||name==='xDomeW')return _xhKputGihon('xDomeG',p,q,s,gold);
 if(name==='xBulbT'||name==='xBulbW')return _xhKputGihon('xBulbG',p,q,s,gold);
 if(name==='xHipT'||name==='xHipE')return _xhKputGihon('xHipG',p,q,s,gold);
 if(red&&Array.isArray(s)&&Math.max(s[0],s[2])>2&&(XH_WALLS.has(name)||/^xBat[WESD]\d\d$/.test(name)))return _xhKputGihon('xGoldB',p,q,s,gold);
 if(XH_INLAY.has(name))return _xhKputGihon('xOpalB',p,q,s,xhOpal(p));
 if(XH_INLAYP.has(name))return _xhKputGihon('xOpalP',p,q,s,xhOpal(p));
 return _xhKputGihon(name,p,q,s,c);};
// ---------------------------------------------------------------- the Sultan's Mint
function buildXaMintHall(G,o){reseed(41961+(o.v|0));const stone=xC(xPick(XPAL.stone)),wash=xC(xPick(XPAL.wash)),red=xC(XPAL.redwall[0]),tim=xC(xPick(XPAL.dark)),iron=xC(0x3a3632);
 const W=30,D=20,P=1.2;vnReg('The Sultan\'s Mint',0,0,18,16);
 xnWall(0,0,0,W+2,P,D+2,0,stone,'dressed');vB('vStone',0,P-.14,0,W+2.3,.14,D+2.3,0,stone.clone().multiplyScalar(1.06));
 const S=xnStack(0,P,0,W,D,0,[4.8,4.2],wash,'dressed');
 const top=xnFlatRoof(0,S.y,0,S.w,S.d,0,wash,{band:xC(XPAL.maroon[0]),gold:true});xnCrenel(0,top,0,S.w+.1,S.d+.1,0,1,wash,{pointed:true});
 /* the furnaces' stacks along the back, their iron caps; the die room's lantern over the middle */
 for(const s of[-1,0,1]){const x=s*9,z=-D/2+3.2;vB('xRubB',x,top,z,2.4,7.5,2.4,0,xC(0x7a6a5a));vB('vIron',x,top+7.5,z,2.9,.3,2.9,0,iron);}
 xnGiltRoof(0,top,1.5,7,5,0,{frame:1.4,over:.8});
 /* the front: an iwan over the door, the roundel, slit windows either side, the stair up the plinth */
 const zf=D/2*.995;xnIwan(0,P,zf,0,8,7.6,1.6,wash,{guldasta:true});vnDoor(0,P,zf+.02,0,2.6,3.4,'xPaint',red,tim,false);xnRoundel(0,P+6.3,zf+.05,0,1.2);
 for(const s of[-1,1])for(let k=1;k<=3;k++){const x=s*(4.6+k*2.8);vB('vDarkB',x,P+2,zf+.03,.6,1.8,.05,0,null);vB('vDarkB',x,P+6.6,zf+.03,.5,1.2,.05,0,null);}
 {const run=Math.max(2,Math.round(P/.17))*.34;xnFlight(0,0,D/2+1+run+.1,0,6,P,'vStone',stone);}
 xnFlagpole(W/2-1.5,top,D/2-1.5,6,xC(XPAL.saffron[0]));}
// ---------------------------------------------------------------- the assessors' hall
function buildXaAssessorsHall(G,o){reseed(41967+(o.v|0));const stone=xC(xPick(XPAL.stone)),wash=xC(xPick(XPAL.wash)),red=xC(XPAL.redwall[0]),tim=xC(xPick(XPAL.dark));
 const W=26,D=22,P=1.2;vnReg('The assessors\' hall',0,0,16,22);
 xnWall(0,0,0,W+2,P,D+2,0,stone,'dressed');vB('vStone',0,P-.14,0,W+2.3,.14,D+2.3,0,stone.clone().multiplyScalar(1.06));
 const S=xnStack(0,P,0,W,D,0,[5.2,4.4],wash,'dressed');
 const top=xnFlatRoof(0,S.y,0,S.w,S.d,0,wash,{band:xC(XPAL.maroon[0]),gold:true});xnCrenel(0,top,0,S.w+.1,S.d+.1,0,1,wash,{pointed:true});
 xnDome(0,top,0,5.2,'G',{drum:2.6,fin:2});
 const zf=D/2*.995;xnPortico(0,P,zf,0,12,3.2,4.6,wash,{band:true,valC:xC(XPAL.saffron[0])});vnDoor(0,P,zf+.02,0,2.4,3.2,'xPaint',red,tim,false);
 for(const s of[-1,1])xnIwan(s*9,P,zf,0,4.6,6.8,1.1,wash,{guldasta:true});
 {const run=Math.max(2,Math.round(P/.17))*.34;xnFlight(0,0,D/2+3.2+1+run+.1,0,10,P,'vStone',stone);}}
// ---------------------------------------------------------------- the treasury
function buildXaTreasury(G,o){reseed(41973+(o.v|0));const stone=xC(xPick(XPAL.stone)),tim=xC(xPick(XPAL.dark)),iron=xC(0x3a3632);
 const W=20,D=16;vnReg('The treasury',0,0,12,14);
 xnWall(0,0,0,W+1.4,1.6,D+1.4,0,stone,'dressed');
 const S=xnStack(0,1.6,0,W,D,0,[4.4,3.8],stone,'dressed');
 const top=xnFlatRoof(0,S.y,0,S.w,S.d,0,stone,{band:xC(XPAL.maroon[0])});xnCrenel(0,top,0,S.w+.1,S.d+.1,0,1.1,stone,{pointed:true});
 xnGiltRoof(0,top,0,5,4,0,{frame:1.4,over:.7});
 const zf=D/2*.995;vnDoor(0,1.6,zf+.02,0,2.2,3,'vIron',iron,tim,false);for(let k=0;k<4;k++)vB('vIron',0,1.9+k*.75,zf+.08,2.3,.08,.05,0,iron);
 for(const s of[-1,1])for(const sx of[-1,1])vB('vDarkB',s*(W/2*.995),3.8,sx*3.5,.05,1.2,.25,0,null);   /* the slits */
 for(const s of[-1,1])vB('vDarkB',s*6,4.6,zf+.03,.25,1.2,.05,0,null);
 {const run=Math.max(2,Math.round(1.6/.17))*.34;xnFlight(0,0,D/2+.7+run+.1,0,4,1.6,'vStone',stone);}}
XA.def({key:'xa_mint_hall',name:'The Sultan\'s Mint',family:'Gihon',tags:{type:['industry','civic'],wealth:'civic',lit:true},w:36,d:28,h:18,fw:32,fd:26,build:buildXaMintHall});
XA.def({key:'xa_assessors_hall',name:'The assessors\' hall',family:'Gihon',tags:{type:['civic'],wealth:'civic',lit:true},w:32,d:32,h:24,fw:28,fd:28,build:buildXaAssessorsHall});
XA.def({key:'xa_treasury',name:'The treasury',family:'Gihon',tags:{type:['civic'],wealth:'civic',lit:false},w:26,d:24,h:15,fw:22,fd:22,build:buildXaTreasury});
// ---------------------------------------------------------------- the two dresses as twins of the kit's own defs
{const D=VERN.defs.xa_grand_temple;if(D){const T=Object.assign({},D.tags);
 XA.def({key:'xa_grand_temple_gold',baseKey:'xa_grand_temple',name:'Grand Temple (Gihon\'s, in gold and opal)',family:'Gihon',tags:T,w:D.w,d:D.d,h:D.h,fw:D.fw,fd:D.fd,nv:D.nv,
  build:function(G,o){const C=VERN.cur;o.goldDress=true;C.gold=xC(XPAL.gold[0]);try{D.build(G,o);}finally{o.goldDress=false;}
   /* before its stair: two rows of opal-set stelae, gilt-capped, and gilt lamp pillars (PLAN.md section 3) */
   reseed(41979+(o.v|0));const stone=xC(xPick(XPAL.stone));
   for(const s of[-1,1])for(let k=0;k<4;k++){const x=s*(7+k*4.2),z=D.d/2-4;vB('vStone',x,0,z,1.4,.5,1.4,0,stone);
    vB('xOpalB',x,.5,z,1,3.2,.5,0,xhOpal([x,0,z]));vB('xGoldB',x,3.7,z,1.2,.35,.7,0,C.gold);vBall('xGold',x,4.25,z,.24,C.gold);}}});}}
{const D=VERN.defs.xa_monastery;if(D){const T=Object.assign({},D.tags);
 XA.def({key:'xa_monastery_violet',baseKey:'xa_monastery',name:'Monastery (the Violet Storm\'s daughter house)',family:'Gihon',tags:T,w:D.w,d:D.d,h:D.h,fw:D.fw,fd:D.fd,nv:D.nv,
  build:function(G,o){const C=VERN.cur;o.violetDress=true;C.violet=xC(0x9a7bb4);try{D.build(G,o);}finally{o.violetDress=false;}}});}}
