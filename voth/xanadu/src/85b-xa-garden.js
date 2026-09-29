// ================================================================= XANADU — the garden tiles (package X-P, round 9)
// The garden agent's brief from twenty-one photographs (Majorelle, Fin, Shazdeh, Dowlatabad, Le Jardin Secret, Jnan
// Sbil, the Barcelona gardens, a Sicilian shrine pool): thirteen more 8 m modules on the rill grid — a T-junction, a
// jet allée, a weir terrace, a star basin court, a long tiled plunge pool, a lily pond, a cactus court, a pergola walk,
// a brick-and-mosaic court, an octagonal kiosk, a painted-vault pavilion, a bath pool and a gate waterfall — and the
// five tile maps they wear. Every one keeps the rill on the plot's centre line so the network runs through it; the
// plants are the Vale's own (xaPlant). Seeds 32700–32799.

// ---------------------------------------------------------------- the five tile maps
// 1 the cobalt-turquoise checker (Majorelle's steps), 2 the Fin turquoise with a dashed cobalt-and-cream border, 3 the
// sun-shrine leaf tile (ochre with cobalt and red quarter-circles that meet in four-petal flowers), 4 the chevron
// panel (green, cobalt, cream zigzag), 5 the herringbone brick
TEX.xChecker=canvasTex(128,128,(g,w,h)=>{const c=16;for(let i=0;i<8;i++)for(let j=0;j<8;j++){g.fillStyle=(i+j)%2?'#1e24a8':'#2e8b6e';g.fillRect(i*c,j*c,c,c);}
 g.strokeStyle='#0f1030';g.lineWidth=1.5;for(let k=0;k<=w;k+=c){g.beginPath();g.moveTo(k,0);g.lineTo(k,h);g.stroke();g.beginPath();g.moveTo(0,k);g.lineTo(w,k);g.stroke();}},[1,1]);
TEX.xFin=canvasTex(128,128,(g,w,h)=>{g.fillStyle='#2e9c94';g.fillRect(0,0,w,h);const c=32;g.strokeStyle='#3fb0a8';g.lineWidth=2;for(let k=0;k<=w;k+=c){g.beginPath();g.moveTo(k,0);g.lineTo(k,h);g.stroke();g.beginPath();g.moveTo(0,k);g.lineTo(w,k);g.stroke();}
 for(let i=0;i<4;i++)for(let j=0;j<4;j++){g.fillStyle='#38a89f';g.fillRect(i*c+8,j*c+8,c-16,c-16);}},[1,1]);
TEX.xFinBorder=canvasTex(128,32,(g,w,h)=>{for(let i=0;i<8;i++){g.fillStyle=i%2?'#2650b5':'#f2ead6';g.fillRect(i*16,0,16,h);}g.fillStyle='#1a2a5a';g.fillRect(0,0,w,3);g.fillRect(0,h-3,w,3);},[1,1]);
TEX.xLeafTile=canvasTex(128,128,(g,w,h)=>{const c=32;for(let i=0;i<4;i++)for(let j=0;j<4;j++){const x=i*c,y=j*c;g.fillStyle='#e3a23a';g.fillRect(x,y,c,c);const r=(i+j)%4;
  const corners=[[x,y],[x+c,y],[x+c,y+c],[x,y+c]];const a=corners[r],b=corners[(r+2)%4];
  g.fillStyle='#3b2fa8';g.beginPath();g.moveTo(a[0],a[1]);g.arc(a[0],a[1],c*.55,0,TAU);g.fill();g.fillStyle='#c8321e';g.beginPath();g.arc(b[0],b[1],c*.4,0,TAU);g.fill();
  g.fillStyle='#e3a23a';g.fillRect(x-40,y-40,0,0);}
 g.save();g.beginPath();g.rect(0,0,w,h);g.clip();g.strokeStyle='rgba(60,30,10,.5)';g.lineWidth=1.5;for(let k=0;k<=w;k+=c){g.beginPath();g.moveTo(k,0);g.lineTo(k,h);g.stroke();g.beginPath();g.moveTo(0,k);g.lineTo(w,k);g.stroke();}g.restore();},[1,1]);
TEX.xChevron=canvasTex(128,128,(g,w,h)=>{g.fillStyle='#f2ead6';g.fillRect(0,0,w,h);const cols=['#2e8b6e','#2650b5','#f2ead6'];const s=20;
 for(let b=-2;b<8;b++){const y0=b*s*1.6;for(let k=0;k<3;k++){g.fillStyle=cols[k];g.beginPath();for(let x=0;x<=w;x+=s){const y=y0+k*s*.5+((x/s)%2?s:0);if(x===0)g.moveTo(x,y);else g.lineTo(x,y);}
  for(let x=w;x>=0;x-=s){const y=y0+k*s*.5+((x/s)%2?s:0)+s*.5;g.lineTo(x,y);}g.closePath();g.fill();g.strokeStyle='#1a1614';g.lineWidth=1;g.stroke();}}},[1,1]);
TEX.xBrick=canvasTex(128,128,(g,w,h)=>{g.fillStyle='#d9c29a';g.fillRect(0,0,w,h);const bw=26,bh=9,cols=['#a8674a','#b5714f','#98583e','#b06a48'];
 for(let j=0;j<20;j++)for(let i=-2;i<8;i++){const odd=j%2;g.save();g.translate(i*bw*2+(odd?bw:0),j*bw*.5);g.rotate(odd?-Math.PI/4:Math.PI/4);g.fillStyle=cols[(i*3+j)%4];g.fillRect(0,0,bw,bh);g.restore();}},[1,1]);
MAT.xChecker=xStd({map:TEX.xChecker,roughness:.3});MAT.xFin=xStd({map:TEX.xFin,roughness:.3});MAT.xFinBorder=xStd({map:TEX.xFinBorder,roughness:.35});MAT.xLeafTile=xStd({map:TEX.xLeafTile,roughness:.3});MAT.xChevron=xStd({map:TEX.xChevron,roughness:.5});MAT.xBrick=xStd({map:TEX.xBrick,roughness:.9});
xWorldUV(MAT.xChecker,1.2,1.2);xWorldUV(MAT.xFin,.8,.8);xWorldUV(MAT.xFinBorder,1.6,1.6);xWorldUV(MAT.xLeafTile,1,1);xWorldUV(MAT.xChevron,.8,.8);xWorldUV(MAT.xBrick,.9,.9);
kdef('xCheckerB',VBOX,MAT.xChecker);kdef('xFinB',VBOX,MAT.xFin);kdef('xFinBorderB',VBOX,MAT.xFinBorder);kdef('xLeafTileB',VBOX,MAT.xLeafTile);kdef('xChevronB',VBOX,MAT.xChevron);kdef('xBrickB',VBOX,MAT.xBrick);
MAT.xDarkWater=xStd({color:0x123a2e,roughness:.06,metalness:.3});kdef('xDarkWaterB',VBOX,MAT.xDarkWater);
MAT.xMilk=xStd({color:0xbfe8ec,roughness:.1,metalness:.05,transparent:true,opacity:.85});kdef('xMilkB',VBOX,MAT.xMilk);
const XGP={cobalt:0x1e24a8,turq:0x33b8b0,yellow:0xf2c518,terracotta:0xb85b32,cream:0xe4d4b4,rust:0xa8412e,teal:0x2e8b6e,iron:0x1a1a1a,bamboo:0xc9a55a,hedge:0x2f6a34};
// a pot: a tapering drum in one of the garden's colours, a shrub in it
function xnXPPot(x,y,z,r,c,plant){vPst('xDrumS',x,y,z,r,r*1.4,xC(c));kput('xDisc',[x,y+r*1.4,z],null,[r*1.05,.08,r*1.05],xC(c).multiplyScalar(1.15));
 if(plant!==false&&!(typeof xaPlant==='function'&&xaPlant('shrub',x,y+r*1.4,z,r*3)))kput('xLeaf',[x,y+r*1.7,z],null,[r*1.6,r*1.4,r*1.6],xC(xPick(XPAL.leaf)));}
// a hedge ribbon
function xnXPHedge(x,y,z,ry,L){const p=loc(x,z,0,0,ry);vB('xPaint',p[0],y,p[1],L,.8,.5,ry,xC(XGP.hedge));}
// a jet: a thin white column and a splash
function xnXPJet(x,y,z,h){vPst('vTankW',x,y,z,.04,h,xC(0xe8f4f8));for(let k=0;k<4;k++)vBall('vBallW',x+rr(-.2,.2),y+rr(.1,h*.5),z+rr(-.2,.2),rr(.04,.09),xC(0xe8f4f8));}
// a stone bowl fountain: pedestal, bowl, a small upper bowl, a jet
function xnXPBowl(x,y,z,c){c=c||xC(XGP.cream);vPst('xColS',x,y,z,.28,1.0,c);kput('xDiscS',[x,y+1.0,z],null,[1.3,.22,1.3],c);kput('xDiscWater',[x,y+1.18,z],null,[1.15,.08,1.15],null);vPst('xColS',x,y+1.2,z,.1,.6,c);kput('xDiscS',[x,y+1.8,z],null,[.6,.14,.6],c);xnXPJet(x,y+1.9,z,1.0);}
// a cusped (multifoil) arch head: three small discs over a flat arch, in paint
function xnXPCusp(x,y,z,ry,w,h,c){const p=loc(x,z,0,.04,ry),q=qEuler(0,ry,0);kput('xArcP',[p[0],y,p[1]],q,[w,h,.1],c);for(const u of[-w*.3,0,w*.3])kput('xDisc',[loc(x,z,u,.06,ry)[0],y+h*.78,loc(x,z,u,.06,ry)[1]],qEuler(Math.PI/2,ry,0),[w*.28,.04,w*.28],c);}
const xaGardenDef=(key,name,fn,o)=>{o=o||{};XA.def(Object.assign({key,name,family:'Garden tiles',tags:{type:['infrastructure','religious'],wealth:'civic',lit:false},w:8,d:8,h:(o.rise||0)+4,fw:8,fd:8,snap:8,rise:o.rise||0,eye:[5,-9,0,0,.6],nv:3,build:fn},o));};
const xgCurb=V=>V===1?'xCheckerB':V===2?'xLeafTileB':'vStone';

// 1 T-junction: the rill through, a branch to +x, a 3 m basin with a bowl fountain at the meeting, pots at its corners
xaGardenDef('xa_rill_tee','Rill T-junction',function(G,o){reseed(32701+(o.v|0));const V=xV(o),c=xC(xPick(XPAL.stone)),curb=xgCurb(V);vnReg('Rill T',0,0,4.2,2.6);xnPave(0,0,8,8,0,c,2);
 xnRill(0,0,0,0,8,{c,curb});xnRill(2,0,0,Math.PI/2,4,{c,curb});xnRillBasin(0,0,0,3,3,0,curb,c);xnXPBowl(0,0,0,c);for(const s of[[-1,-1],[-1,1],[1,-1],[1,1]])xnXPPot(s[0]*2.1,0,s[1]*2.1,.3,XGP.terracotta);});
// 2 the jet allée: the rill widened to a 4 m shallow pool with four low jets, hedge ribbons, a cypress pair at the corners
xaGardenDef('xa_rill_jets','Jet allée',function(G,o){reseed(32711+(o.v|0));const V=xV(o),c=xC(xPick(XPAL.stone)),curb=xgCurb(V);vnReg('Jet allée',0,0,4.2,3);xnPave(0,0,8,8,0,c,2);
 xnRillBasin(0,0,0,4,7.8,0,curb,c);for(let k=0;k<4;k++)xnXPJet(0,0,-3+k*2,rr(.9,1.4));for(const s of[-1,1]){xnXPHedge(s*2.9,0,0,0,8);xnCypress(s*3.6,-3.4,rr(5,7));xnCypress(s*3.6,3.4,rr(5,7));}});
// 3 the weir terrace: a 1 m rise — the upper pool spills over a 2 m sheet weir into the lower rill, twin stairs, two parterre beds
xaGardenDef('xa_rill_weir','Weir terrace (1 m)',function(G,o){reseed(32721+(o.v|0));const V=xV(o),c=xC(xPick(XPAL.stone)),curb=xgCurb(V),R=1;vnReg('Weir terrace',0,0,4.2,2.6);
 vB('xRubB',0,0,2,8,R-.1,4,0,xC(xPick(XPAL.rubble)));xnPave(0,2,8,4,0,c,2,R-.1);xnPave(0,-2,8,4,0,c,2,0);
 xnRillBasin(0,R,1.6,3,2.4,0,curb,c);xnRill(0,R,3.4,0,1.2,{c,curb});vB('vStone',0,R-.14,.3,2.4,.16,.5,0,c);xnWaterSheet(0,.1,.05,0,2.2,R-.15);
 xnRillBasin(0,0,-1.2,3,1.6,0,curb,c);xnRill(0,0,-3,0,2,{c,curb});
 for(const s of[-1,1]){for(let k=0;k<6;k++)vB('vStone',s*2.6,R-(k+1)*R/6,.4-k*.32,1.6,R/6,.34,0,c.clone().multiplyScalar(rr(.92,1.04)));
  vB('xEarthB',s*2.6,-.05,-2.6,2.4,.14,2,0,xC(0x5a4a34));for(let j=0;j<7;j++){const p=[s*2.6+rr(-1,1),-2.6+rr(-.8,.8)];kput('xLeaf',[p[0],.16,p[1]],null,[.3,.24,.3],xC(0x3f7a34));vBall('xPaintBall',p[0],.34,p[1],.08,xC(xPick([0x9a4aa8,0xf2c12e,0xe8a0c0])));}}},{rise:1,family:'Water — slopes'});
// 4 the star basin court: an eight-point star pool six metres across in a white kerb on a grey-blue tile apron, a bowl
// fountain with a tall jet at its centre, four flame cypress on the diagonals; the rill enters and leaves on the axis
xaGardenDef('xa_star_court','Star basin court',function(G,o){reseed(32731+(o.v|0));const V=xV(o),c=xC(xPick(XPAL.stone)),curb=xgCurb(V);vnReg('Star court',0,0,4.2,3);xnPave(0,0,8,8,0,c,2);
 vB('xFinB',0,-.04,0,7.4,.08,7.4,0,null);for(const a of[0,Math.PI/4]){const q=qEuler(0,a,0);kput('xTilesB',[0,-.22,0],q,[4.4,.2,4.4],xC(XPAL.turquoise));kput('xWaterB',[0,-.02,0],q,[4.2,.18,4.2],xC(XPAL.water));
  for(const s of[-1,1]){kput('xPaint',[s*2.25*Math.cos(a),-.05,s*2.25*Math.sin(a)],q,[.3,.3,4.8],xC(XPAL.white));kput('xPaint',[-s*2.25*Math.sin(a),-.05,s*2.25*Math.cos(a)],q,[4.8,.3,.3],xC(XPAL.white));}}
 xnXPBowl(0,.1,0,xC(XPAL.white));xnXPJet(0,2.0,0,2.4);for(const s of[[-1,-1],[-1,1],[1,-1],[1,1]])xnCypress(s[0]*3.3,s[1]*3.3,rr(5,7));
 for(const s of[-1,1])vB('xWaterB',0,-.02,s*3.4,1.2,.16,1.4,0,xC(XPAL.water));});
// 5 the long tiled plunge pool: a 3 × 7 rectangle under a broad leaf-tile coping, a patterned floor under clear water,
// pool caps at both ends
xaGardenDef('xa_plunge_pool','Tiled plunge pool',function(G,o){reseed(32741+(o.v|0));const V=xV(o),c=xC(xPick(XPAL.stone));vnReg('Plunge pool',0,0,4.2,2);xnPave(0,0,8,8,0,c,2);
 vB('xLeafTileB',0,-.1,0,5.2,.3,7.8,0,null);vB('xCheckerB',0,-.3,0,3.2,.2,6.6,0,null);vB('xEmeraldB',0,0,0,3.2,.18,6.6,0,null);
 for(const s of[-1,1]){vB('xWaterB',0,-.02,s*3.6,1.2,.16,.8,0,xC(XPAL.water));xnXPPot(s*3.2,.2,3.4,.32,XGP.turq);xnXPPot(s*3.2,.2,-3.4,.32,XGP.turq);}
 for(let k=0;k<3;k++)vB('vStone',-.4,-.4+k*.15,2.6-k*.4,1.2,.15,.4,0,xC(XGP.cream));});
// 6 the lily pond: a cobalt-kerbed 6 × 6 pond of dark water, lily pads with pink and white blooms, a brick viewing edge
// with a black iron rail, yellow pots on the corner piers, silver fan palms behind
xaGardenDef('xa_lily_pond','Lily pond',function(G,o){reseed(32751+(o.v|0));const V=xV(o),c=xC(xPick(XPAL.stone)),cob=xC(V===2?XGP.teal:XGP.cobalt);vnReg('Lily pond',0,0,4.2,3);
 vB('xBrickB',0,-.04,0,8,.08,8,0,null);vB('xDarkWaterB',0,-.02,0,6,.18,6,0,null);vB('xTilesB',0,-.3,0,6.2,.2,6.2,0,xC(0x1a3a30));
 for(const s of[-1,1]){vB('xPaint',s*3.2,-.05,0,.5,.45,6.6,0,cob);vB('xPaint',0,-.05,s*3.2,6.6,.45,.5,0,cob);}
 for(let k=0;k<30;k++){const x=rr(-2.7,2.7),z=rr(-2.7,2.7);kput('xDisc',[x,.17,z],qEuler(0,rng()*TAU,0),[rr(.3,.5),.03,rr(.3,.5)],xC(xPick([0x3f7a34,0x4a8a3a,0x2f6a2c])));if(rng()<.3)kput('xConeP',[x,.2,z],null,[.12,.16,.12],xC(xPick([0xe8a0c0,0xf4efe4,0xf0c0d0])));}
 for(const s of[[-1,-1],[-1,1],[1,-1],[1,1]])xnXPPot(s[0]*3.2,.4,s[1]*3.2,.28,XGP.yellow);
 {const iron=xC(XGP.iron);vBeam([-3.2,1.0,3.5],[3.2,1.0,3.5],.04,iron,'vIron');for(let k=0;k<=12;k++)vPst('vPipe',-3+k*.5,.4,3.5,.02,.6,iron);}
 for(const s of[-1,1]){vB('xWaterB',0,-.02,s*3.5,1.2,.16,1.0,0,xC(XPAL.water));}
 xnXMPalm(-3.5,-3.6,rr(4,6));xnXMPalm(3.5,-3.6,rr(4,6));});
// 7 the cactus court: rust-red gravel, a cobalt-checker path across it, columnar cacti and prickly pears, pots on cobalt
// plinths, a bamboo rail on one side; the rill runs through under a little slab bridge
xaGardenDef('xa_cactus_court','Cactus court',function(G,o){reseed(32761+(o.v|0));const V=xV(o),c=xC(xPick(XPAL.stone)),curb='vStone';vnReg('Cactus court',0,0,4.2,4);
 vB('xEarthB',0,-.06,0,8,.1,8,0,xC(XGP.rust));xnRill(0,0,0,0,8,{c,curb:'xPaint'});vB('xCheckerB',0,.02,0,8,.08,1.6,0,null);vB('xCheckerB',0,.05,0,1.8,.12,1.6,0,null);   // the path and the bridge slab
 for(let k=0;k<9;k++){const x=xPick([-1,1])*rr(1.3,3.6),z=rr(-3.6,3.6);if(Math.abs(z)<1)continue;if(!(typeof xaPlant==='function'&&xaPlant('cactus',x,0,z,rr(1.5,4)))){vPst('xDrumS',x,0,z,.2,rr(1.5,3.5),xC(0x4a8a44));}}
 for(const s of[-1,1]){vB('xPaint',s*3.4,0,-2.6,.9,.5,.9,0,xC(XGP.cobalt));xnXPPot(s*3.4,.5,-2.6,.3,XGP.terracotta);}
 {const bam=xC(XGP.bamboo);for(let k=0;k<=8;k++)vPst('vPipe',-3.9,0,-4+k,.03,.9,k%2?bam:xC(XGP.cobalt));vBeam([-3.9,.9,-4],[-3.9,.9,4],.04,bam,'vIron');}
 if(V===1)xnTree(3,3,3.2);});
// 8 the pergola walk: two rows of spiral-scored brick columns carrying a teal lattice, wisteria over it, a cobalt back
// wall with yellow cusped blind windows; the rill runs down the middle
xaGardenDef('xa_pergola','Pergola walk',function(G,o){reseed(32771+(o.v|0));const V=xV(o),c=xC(xPick(XPAL.stone)),curb=xgCurb(V),teal=xC(XGP.teal),brick=xC(0xa8674a);vnReg('Pergola',0,0,4.2,4);
 vB('xBrickB',0,-.04,0,8,.08,8,0,null);xnRill(0,0,0,0,8,{c,curb});
 for(const s of[-1,1])for(let k=0;k<3;k++){const z=-2.7+k*2.7;vPst('xDrumS',s*2.2,0,z,.3,3.0,brick);for(let j=0;j<6;j++)vB('xPaint',s*2.2,.2+j*.5,z,.66,.08,.66,0,brick.clone().multiplyScalar(.85));}
 for(const s of[-1,1])vB('vWood',s*2.2,3.0,0,.3,.2,8,0,teal);for(let k=0;k<9;k++)vB('vWood',0,3.05,-3.6+k*.9,5.2,.12,.14,0,teal);for(let k=0;k<7;k++)vB('vWood',-2.6+k*.87,3.1,0,.1,.1,8,0,teal);
 vB('xPaint',-3.85,0,0,.3,3.4,8,0,xC(XGP.cobalt));for(const z of[-2.2,2.2]){vB('xPaint',-3.68,.8,z,.06,2.0,1.4,0,xC(XGP.yellow));xnXPCusp(-3.66,.8,z,Math.PI/2,1.4,2.0,xC(XGP.yellow));kput('xJali',[-3.62,1.7,z],qEuler(0,Math.PI/2,0),[.9,1.2,1],xC(XPAL.white));}
 for(const s of[-1,1])if(!(typeof xaPlant==='function'&&xaPlant('wisteria',s*2.4,0,-1,3.5,{hk:1})))kput('xLeaf',[s*2.2,3.3,0],null,[1.5,.6,3],xC(0x8a6ab0));
 for(let k=0;k<6;k++)kput('xLeaf',[rr(-1.2,1.2),3.25,rr(-3.5,3.5)],null,[rr(.6,1.2),.3,rr(.6,1.2)],xC(xPick([0x9a7ac0,0x8a6ab0,0x3f7a34])));
 for(let k=0;k<5;k++)kput('xLeaf',[-3.3,rr(.2,.6),rr(-3.5,3.5)],null,[.7,.6,.7],xC(0x2f7a34));});
// 9 the brick-and-mosaic court: a herringbone field with a sun roundel four metres across, a cobalt parapet with rounded
// corner blocks, one yellow pot at each corner; the rill passes through
xaGardenDef('xa_brick_court','Brick court',function(G,o){reseed(32781+(o.v|0));const V=xV(o),c=xC(xPick(XPAL.stone)),curb=xgCurb(V),cob=xC(V===2?XGP.teal:XGP.cobalt);vnReg('Brick court',0,0,4.2,2);
 vB('xBrickB',0,-.04,0,8,.08,8,0,null);kput('xSun',[0,.01,0],qEuler(-Math.PI/2,0,0),[4,4,1],null);xnRill(0,0,0,0,8,{c,curb});
 for(const s of[-1,1]){vB('xPaint',s*3.85,0,0,.3,.6,8,0,cob);}for(const s of[[-1,-1],[-1,1],[1,-1],[1,1]]){vPst('xDrumS',s[0]*3.7,0,s[1]*3.7,.4,.7,cob);xnXPPot(s[0]*3.7,.7,s[1]*3.7,.24,XGP.yellow);}});
// 10 the octagonal kiosk: cedar posts, cusped arches, a hipped tiled roof with a gilt eave, astride the rill so the water
// runs under it; four orange trees in terracotta pots
xaGardenDef('xa_kiosk','Garden kiosk',function(G,o){reseed(32791+(o.v|0));const V=xV(o),c=xC(xPick(XPAL.stone)),curb=xgCurb(V),ced=xC(0x8a4e22),gold=xC(xPick(XPAL.gold));vnReg('Kiosk',0,0,4.2,6);xnPave(0,0,8,8,0,c,2);
 xnRill(0,0,0,0,8,{c,curb});const R=2.5,ap=R*Math.cos(Math.PI/8);kput('xOctP',[0,-.02,0],qEuler(0,Math.PI/8,0),[R+.4,.24,R+.4],c);
 for(let k=0;k<8;k++){const a=k*Math.PI/4;vPst('vPost',Math.sin(a)*R,0,Math.cos(a)*R,.14,3.2,ced);}
 for(let k=0;k<8;k++){const a=k*Math.PI/4+Math.PI/8;const p=[Math.sin(a)*ap,Math.cos(a)*ap];xnXPCusp(p[0],1.6,p[1],a,1.7,1.5,ced);}
 kput('xOctP',[0,3.2,0],qEuler(0,Math.PI/8,0),[R+.5,.24,R+.5],gold);kput('xConeT',[0,3.44,0],null,[R+.9,1.8,R+.9],xC(V===1?0x2f6a4a:0xb8563a));vBall('xGold',0,5.3,0,.2,gold);
 for(const s of[[-1,-1],[-1,1],[1,-1],[1,1]]){xnXPPot(s[0]*3.2,0,s[1]*3.2,.34,XGP.terracotta,false);if(!(typeof xaPlant==='function'&&xaPlant('tree',s[0]*3.2,.48,s[1]*3.2,2.2,{sp:32})))kput('xLeaf',[s[0]*3.2,1.3,s[1]*3.2],null,[1,1,1],xC(0x3f7a34));}});
// 11 the painted-vault pavilion: a six-metre iwan on four plaster piers, its soffit a painted diamond panel, opening on a
// turquoise-tiled square pool with a dashed border; the axis terminus — the rill ends in the pool
xaGardenDef('xa_vault_pavilion','Painted-vault pavilion',function(G,o){reseed(32801+(o.v|0));const V=xV(o),c=xC(xPick(XPAL.stone)),wash=xC(xPick(XPAL.wash));vnReg('Vault pavilion',0,-1.5,4.2,7);xnPave(0,0,8,8,0,c,2);
 vB('xFinBorderB',0,-.06,2.2,3.6,.1,3.6,0,null);vB('xFinB',0,-.28,2.2,3,.2,3,0,null);vB('xWaterB',0,-.02,2.2,3,.18,3,0,xC(0x2ab0c0));vB('xWaterB',0,-.02,3.9,1.2,.16,.6,0,xC(XPAL.water));
 for(const s of[-1,1])for(const z of[-3.4,0]){vB('vPlaster',s*2.8,0,z,1.0,4.6,1.0,0,wash);}
 for(const s of[-1,1]){xnArch('xArchP',s*2.8,0,-1.7,s*Math.PI/2,3.4,4.6,1,wash,{open:true});}xnArch('xArchP',0,0,0,0,5.6,4.6,1,wash,{open:true});xnArch('xArchP',0,0,-3.4,Math.PI,5.6,4.6,1,wash,{open:true});
 vB('vPlaster',0,4.6,-1.7,6.6,.5,4.4,0,wash);kput('xMosA',[0,4.58,-1.7],qEuler(Math.PI/2,0,0),[5.2,3.2,1],null);vB('xFriezeB',0,5.1,-1.7,6.8,.5,4.6,0);
 for(const s of[-1,1])xnXPPot(s*2.6,0,4.2,.34,XGP.turq);vnFolk(0,-1.5,2,1);},{h:7});
// 12 the bath pool: a five-metre hot pool with a checker floor, three wide steps down on one side, a colonnade of
// pointed plaster arches on two sides, milky pale water, steam, a bench slab, a cobalt-and-white dashed rim
xaGardenDef('xa_bath_pool','Bath pool',function(G,o){reseed(32811+(o.v|0));const V=xV(o),c=xC(xPick(XPAL.stone)),wash=xC(xPick(XPAL.wash));vnReg('Bath pool',0,0,4.2,6);xnPave(0,0,8,8,0,c,2);
 vB('xFinBorderB',0,-.04,-.5,6.2,.14,6.2,0,null);vB('xCheckerB',0,-1.3,-.5,5,.2,5,0,null);vB('xMilkB',0,-.15,-.5,5,1.1,5,0,null);
 for(let k=0;k<3;k++)vB('xCheckerB',-1.2,-.2-k*.36,1.4+k*.4,2.4,.2,.42,0,null);
 xnArcade(-3.7,0,-.5,-Math.PI/2,7.4,4.2,3,'xArchP',wash,.6,{open:true});xnArcade(0,0,-4.2,Math.PI,7.4,4.2,3,'xArchP',wash,.6,{open:true});
 vB('vStone',3.3,0,-.5,.9,.5,6,0,xC(XGP.cream));for(let k=0;k<8;k++)vBall('vBallW',rr(-2.2,2.2),rr(.15,.6),rr(-2.8,1.6),rr(.2,.45),xC(0xf4f8fa));
 vB('xWaterB',0,-.02,3.5,1.2,.16,1.0,0,xC(XPAL.water));vnFolk(2.4,2.6,2,.8);},{h:6});
// 13 the gate waterfall: a sandstone gate-building at a terrace edge, water sheeting from a high slot into a round
// boulder-ringed basin and over a second lip into the rill; a mosaic roundel on its wall. 4 m rise
xaGardenDef('xa_gate_fall','Gate waterfall (4 m)',function(G,o){reseed(32821+(o.v|0));const V=xV(o),c=xC(xPick(XPAL.stone)),sand=xC(xPick([0xc8a878,0xb8986a,0xd0b080])),R=4;vnReg('Gate waterfall',0,1,4.2,R+8);
 vB('xRubB',0,0,2.6,8,R-.1,2.8,0,xC(xPick(XPAL.rubble)));xnPave(0,2.6,8,2.8,0,c,2,R-.1);xnRill(0,R,3,0,2,{c,curb:'vStone'});
 for(const s of[-1,1]){vB('vStone',s*2.6,0,1.2,2.6,R+6,2.4,0,sand);kput('xBulbT',[s*2.6,R+6,1.2],null,[1.3,1.4,1.3],xC(xPick(XPAL.tile)));}vB('vStone',0,R+3.6,1.2,8,2.4,2.4,0,sand);kput('xArcDark',[0,R+.2,2.45],null,[2.4,3.4,.2]);
 kput('xSun',[0,R+4.8,2.46],null,[1.6,1.6,1],null);vB('xWaterB',0,R+.02,1.2,1.4,.12,2.4,0,xC(XPAL.water));
 xnWaterSheet(0,.3,-.1,0,1.4,R-.2);for(let k=0;k<10;k++)vBall('vBallW',rr(-1.2,1.2),rr(.1,.9),rr(-1.6,-.2),rr(.1,.22),xC(0xe8f4f8));
 kput('xDiscS',[0,-.05,-1.4],null,[2.6,.3,2.6],c);kput('xEmeraldDisc',[0,.0,-1.4],null,[2.2,.28,2.2],null);for(let k=0;k<8;k++){const a=k/8*TAU;kput('xBoulder',[Math.sin(a)*2.5,.1,-1.4+Math.cos(a)*2.5],qEuler(rng(),rng(),0),[rr(.5,.9),rr(.4,.7),rr(.5,.9)],xC(0x9a8a70));}
 xnRill(0,0,-3.4,0,1.2,{c,curb:'vStone'});},{rise:4,family:'Water — slopes',h:14});
// 14 the parterre: the planting tile between the courts — hedge ribbons on two sides, four beds of flowers round a
// cross of gravel paths, a tree of the Vale at one corner. No rill: it fills the garden grid between the axes
xaGardenDef('xa_parterre','Parterre',function(G,o){reseed(32831+(o.v|0));const V=xV(o),c=xC(xPick(XPAL.stone));vnReg('Parterre',0,0,4.2,3);
 vB('xEarthB',0,-.06,0,8,.1,8,0,xC(0xc9a06a));vB('xEarthB',0,-.02,0,8,.1,1.2,0,xC(0xd9c29a));vB('xEarthB',0,-.02,0,1.2,.1,8,0,xC(0xd9c29a));
 const cols=V===1?[0x9a4aa8,0xf2c12e,0xe8a0c0]:V===2?[0xd0302a,0xf07020,0xf8d848]:[0xe8a0c0,0xf4efe4,0xd04a8a];
 for(const s of[[-1,-1],[-1,1],[1,-1],[1,1]]){const cx=s[0]*2.3,cz=s[1]*2.3;vB('xEarthB',cx,-.02,cz,2.8,.14,2.8,0,xC(0x5a4a34));vB('xPaint',cx,0,cz+s[1]*1.3,2.8,.5,.3,0,xC(XGP.hedge));
  for(let k=0;k<8;k++){const p=[cx+rr(-1.1,1.1),cz+rr(-1.0,1.0)];kput('xLeaf',[p[0],.16,p[1]],null,[.3,.24,.3],xC(0x3f7a34));vBall('xPaintBall',p[0],.34,p[1],.08,xC(xPick(cols)));}}
 for(const s of[-1,1])xnXPHedge(s*3.85,0,0,0,8);xnTree(3.2,-3.2,rr(3,4.5));if(V===2)xnXPPot(0,0,0,.3,XGP.terracotta);},{h:5});
