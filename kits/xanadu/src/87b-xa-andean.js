// ================================================================= XANADU — the Andean note (package X-O, round 9)
// Travis: a poor, a middle and a rich residence after the cholets of El Alto (Freddy Mamani) — tall painted
// facades of stepped, bracketed frames round great glazed bays, lozenges and Andean-cross motifs, a rooftop house
// (the chalet) on the top, chrome-and-colour railings — and the blue-and-lozenge shops of Santa Catarina Palopó
// (the poor one). Seeds 32600–32699.

const XAN={red:0xd0282a,orange:0xf07020,yellow:0xf2c12e,green:0x3fbf4a,lime:0xa8d040,blue:0x1e3fa8,sky:0x2a9ad8,cobalt:0x1c2fb8,turq:0x36c0c8,magenta:0xd04a8a,cream:0xf0ead8,black:0x1a1614};
// a stepped Andean frame round a bay: three nested rectangles in three colours with mitred steps at the corners, the
// glass inside, a bracket lintel; (x,z) ON the wall face, ry outward, w x h the outer frame
function xnXOFrame(x,y,z,ry,w,h,cols,lit){const P=(u,v,d)=>loc(x,z,u,v+(d||0),ry);
 const steps=[[w,h,cols[0],.10],[w-.6,h-.6,cols[1],.16],[w-1.2,h-1.2,cols[2],.22]];
 for(const [ww,hh,c,d] of steps){const p=P(0,d);const t=.3;const cc=xC(c);
  vB('xPaint',p[0],y+hh-t,p[1],ww,t,.1,ry,cc);vB('xPaint',p[0],y,p[1],ww,t,.1,ry,cc);for(const s of[-1,1]){const q=P(s*(ww/2-t/2),d);vB('xPaint',q[0],y,q[1],t,hh,.1,ry,cc);}
  for(const s of[-1,1]){const q=P(s*(ww/2-.5),d);vB('xPaint',q[0],y+hh-.6,q[1],.5,.3,.1,ry,cc);vB('xPaint',q[0],y+.3,q[1],.5,.3,.1,ry,cc);}}   // the mitre steps at the corners
 const g=P(0,.04);vB(lit?'vWinLit':'vWinGlass',g[0],y+.35,g[1],w-1.5,h-1.5,.08,ry);const gw=w-1.5,gh=h-1.5;
 for(let k=1;k<Math.round(gw/1.2);k++){const q=P(-gw/2+k*gw/Math.round(gw/1.2),.09);vB('xPaint',q[0],y+.35,q[1],.06,gh,.04,ry,xC(XAN.black));}
 for(let k=1;k<Math.round(gh/1.4);k++){const q=P(0,.09);vB('xPaint',q[0],y+.35+k*gh/Math.round(gh/1.4),q[1],gw,.06,.04,ry,xC(XAN.black));}}
// a lozenge motif: a diamond of paint in two colours, with a smaller diamond inside
function xnXOLozenge(x,y,z,ry,s,c1,c2){const p=loc(x,z,0,.08,ry),q=qEuler(0,ry,0).multiply(qEuler(0,0,Math.PI/4));kput('xPaint',[p[0],y,p[1]],q,[s,s,.06],xC(c1));const p2=loc(x,z,0,.12,ry);kput('xPaint',[p2[0],y,p2[1]],q,[s*.5,s*.5,.06],xC(c2));}
// a zigzag band: alternating diamonds along a face
function xnXOZigzag(x,y,z,ry,w,s,c1,c2){const n=Math.max(2,Math.round(w/(s*1.1)));for(let i=0;i<n;i++){const u=-w/2+w*(i+.5)/n;const p=loc(x,z,u,0,ry);xnXOLozenge(p[0],y,p[1],ry,s,i%2?c1:c2,i%2?c2:c1);}}
// an Andean cross (chakana): a stepped cross of paint
function xnXOChakana(x,y,z,ry,s,c){const p=loc(x,z,0,.09,ry),q=qEuler(0,ry,0);kput('xPaint',[p[0],y,p[1]],q,[s,s*.34,.06],xC(c));kput('xPaint',[p[0],y,p[1]],q,[s*.34,s,.06],xC(c));kput('xPaint',[p[0],y,p[1]],q,[s*.7,s*.7,.05],xC(c));}
// a chrome-and-colour railing along a roof edge or balcony
function xnXORail(x,y,z,ry,w,c){const P=(u,v)=>loc(x,z,u,v,ry);const a=P(-w/2,0),b=P(w/2,0);vBeam([a[0],y+1.0,a[1]],[b[0],y+1.0,b[1]],.05,xC(0xd8dce0),'vIron');
 const n=Math.max(2,Math.round(w/.5));for(let k=0;k<=n;k++){const p=P(-w/2+w*k/n,0);vPst('vPipe',p[0],y,p[1],.02,1.0,xC(k%2?c:0xd8dce0));}}

// ---------------------------------------------------------------- POOR: the Palopó shop-house
// two storeys of cobalt render on a stone-and-block base, a shop with a roll-front on the ground, a balcony on the
// upper floor with lozenge zigzags in yellow and green along every band, an orange roof slab, a water tank
function buildXaAndeanPoor(G,o){reseed(32601+(o.v|0));const V=xV(o),W=8,D=7,H1=3.0,H2=2.8,lit=xLit();
 const base=xC(xPick([XAN.cobalt,XAN.sky,XAN.turq,0x2060c0,XAN.blue])),trim=xC(xPick([XAN.orange,XAN.yellow,XAN.red])),z1=xPick([XAN.yellow,XAN.lime,XAN.cream]),z2=xPick([XAN.green,XAN.sky,XAN.magenta]);
 vnReg('Palopó shop-house (poor)',0,0,5,H1+H2+3);
 vB('vStone',0,0,0,W+.3,.5,D+.3,0,xC(xPick(XPAL.stone)));vB('vPlaster',0,.5,0,W,H1,D,0,base);vB('vPlaster',0,.5+H1,0,W+(V===2?1.4:0),H2,D,0,base);
 // the shop: a roll-front and a door, goods stacked, a sign board
 vB('vDarkB',-1.4,.5,D/2+.05,3.2,2.4,.1,0);vB('xPaint',-1.4,.5,D/2+.1,3.2,.3,.06,0,trim);for(let k=0;k<5;k++)vB('xPaint',-1.4,.9+k*.45,D/2+.09,3.2,.06,.04,0,xC(0x1a3a80));
 vnDoor(2.4,.5,D/2,0,1.0,2.2,'xPaint',trim,xC(0x5a3a1a),false);vB('xPaint',0,.5+H1-.5,D/2+.08,W-.6,.6,.06,0,xC(XAN.cream));vB('xPaint',0,.5+H1-.4,D/2+.12,W-1.4,.4,.04,0,trim);
 // the bands of lozenges: under each floor's cornice and along the balcony
 xnXOZigzag(0,.5+H1-1.0,D/2,0,W-1,.5,z1,z2);xnXOZigzag(0,.5+H1+H2-.9,D/2,0,W-1,.5,z1,z2);for(const s of[-1,1])xnXOZigzag(s*W/2,.5+H1+H2-.9,0,s*Math.PI/2,D-1,.5,z1,z2);
 // the balcony across the front: a slab, a painted rail, a door and two windows behind
 const Y=.5+H1;vB('vStone',0,Y-.1,D/2+.7,W-1,.2,1.4,0,base.clone().multiplyScalar(.9));xnXORail(0,Y+.1,D/2+1.35,0,W-1.2,xPick([XAN.yellow,XAN.orange]));for(const s of[-1,1])xnXORail(s*(W/2-.6),Y+.1,D/2+.7,s*Math.PI/2,1.3,XAN.yellow);
 vnDoor(0,Y,D/2,0,1.0,2.2,'xPaint',trim,xC(0x5a3a1a),false);for(const s of[-1,1])xnTibWin(s*2.4,Y+.7,D/2,0,1.1,1.3,lit?'lit':'glass',trim,{noVal:true});
 for(const s of[-1,1])for(const yy of[1.4,Y+.8])xnTibWin(s*W/2,yy,-1,s*Math.PI/2,1.0,1.2,lit?'lit':'glass',trim,{noVal:true});
 // the roof: an orange slab with a parapet, a water tank and a drying line; v1 a tiled pitched roof instead
 const YT=Y+H2;if(V===1)vnGableRoof(0,YT,0,W+.6,D+.6,1.6,0,'xGableT',xC(0xb8563a),.5);
 else{vB('xPaint',0,YT,0,W+.5,.35,D+.5,0,trim);xnXORail(0,YT+.35,D/2+.2,0,W-.4,XAN.sky);vPst('xDrumS',W/2-1.2,YT+.35,-D/2+1.2,.7,1.4,xC(xPick([XAN.orange,0x2a2a2a])));
  vnDryingRack(-1,YT+.35,0,0,4);}
 if(V===3){vnAwning(-1.4,.5+H1-.2,D/2+.2,0,3.6,1.6,xC(xPick([XAN.magenta,XAN.sky,XAN.yellow])));}
 for(const s of[-1,1])vPst('vClayPot',s*3.6,.5,D/2+.6,.28,.5,xC(0x9a5a38));vnFolk(1,D/2+3,2,1.5);}

// ---------------------------------------------------------------- MIDDLE: the cholet
// four storeys: a shop and a hall behind big stepped frames on the ground, two floors of stepped-frame bays under
// chevron cornices, lozenges between, the chalet on the roof with its own pitched roof and a railed terrace
function buildXaAndeanMid(G,o){reseed(32621+(o.v|0));const V=xV(o),W=12,D=10,NS=V===2?3:4,SH=3.2,lit=xLit();
 const pal=xPick([[XAN.orange,XAN.yellow,XAN.green,XAN.red],[XAN.lime,XAN.green,XAN.cream,XAN.sky],[XAN.red,XAN.yellow,XAN.blue,XAN.cream],[XAN.sky,XAN.blue,XAN.yellow,XAN.orange]]);
 const wall=xC(pal[0]),f=[pal[1],pal[2],pal[3]];
 vnReg('Cholet (middle)',0,0,7,NS*SH+6);
 vB('vStone',0,0,0,W+.4,.4,D+.4,0,xC(xPick(XPAL.stone)));
 for(let k=0;k<NS;k++){const y=.4+k*SH;vB('vPlaster',0,y,0,W,SH,D,0,wall);
  // the cornice: a chevron band in the second colour, stepped out
  vB('xPaint',0,y+SH-.35,0,W+.4,.35,D+.4,0,xC(f[0]));xnXOZigzag(0,y+SH-.85,D/2,0,W-1.5,.45,f[1],f[2]);
  if(k===0){xnXOFrame(-3.0,y+.3,D/2,0,4.4,SH-.7,[f[0],f[1],f[2]],false);vB('vDarkB',-3.0,y+.6,D/2+.06,3,2.2,.08,0);   // the shop front, its glass dark
   xnXOFrame(2.8,y+.3,D/2,0,3.6,SH-.7,[f[1],f[2],f[0]],false);vnDoor(2.8,y+.4,D/2+.12,0,1.2,2.4,'xPaint',xC(f[2]),xC(0x2a1a10),false);}
  else{for(const u of[-3.2,3.2])xnXOFrame(u,y+.2,D/2,0,4.6,SH-.5,k%2?[f[0],f[1],f[2]]:[f[2],f[0],f[1]],lit);xnXOLozenge(0,y+SH/2,D/2,0,1.4,f[1],f[2]);
   for(const s of[-1,1]){xnXOFrame(s*W/2,y+.2,-1.5,s*Math.PI/2,3.4,SH-.5,[f[1],f[0],f[2]],lit);xnXOChakana(s*W/2,y+SH/2,2.6,s*Math.PI/2,1.3,f[2]);}}}
 // the chalet on the roof: a little gabled house set back, a terrace with a painted rail round it, planters
 const YT=.4+NS*SH;vB('xPaint',0,YT,0,W+.4,.3,D+.4,0,xC(f[0]));xnXORail(0,YT+.3,D/2+.15,0,W-.4,pal[3]);for(const s of[-1,1])xnXORail(s*(W/2+.15),YT+.3,0,s*Math.PI/2,D-.4,pal[3]);
 {const cw=6.5,cd=5.5,cx=-1.5,cz=-1;vB('vPlaster',cx,YT+.3,cz,cw,2.8,cd,0,xC(f[1]));xnTibWin(cx,YT+1.0,cz+cd/2,0,1.2,1.4,lit?'lit':'glass',xC(f[2]),{noVal:true});xnTibWin(cx+cw/2,YT+1.0,cz,Math.PI/2,1.0,1.3,lit?'lit':'glass',xC(f[2]),{noVal:true});
  vnDoor(cx-2,YT+.3,cz+cd/2,0,.9,2.0,'xPaint',xC(f[2]),xC(0x2a1a10),false);vnGableRoof(cx,YT+3.1,cz,cw+.8,cd+.8,1.6,0,'xGableT',xC(V===1?0x2a6a3a:0xb8563a),.5);}
 vnPlanter(3.5,YT+.3,2,2.2,.6,0,xC(0x8a5a3a));vPst('xDrumS',4.2,YT+.3,-3.2,.6,1.3,xC(0x2a2a2a));
 vnFolk(0,D/2+3,3,2);}

// ---------------------------------------------------------------- RICH: the cholet palace
// six storeys with an octagonal corner tower, great stepped frames three storeys tall, a ballroom band of round
// windows, gold lozenges, mirrored glass, the chalet on top under a gilt roof, railings everywhere, lit at night
function buildXaAndeanRich(G,o){reseed(32641+(o.v|0));const V=xV(o),W=16,D=13,NS=V===2?5:6,SH=3.3,lit=xLit();
 const pal=xPick([[XAN.orange,XAN.yellow,XAN.red,XAN.green],[XAN.green,XAN.lime,XAN.cream,XAN.orange],[XAN.blue,XAN.sky,XAN.yellow,XAN.red],[XAN.red,XAN.orange,XAN.yellow,XAN.blue]]);
 const wall=xC(pal[0]),f=[pal[1],pal[2],pal[3]],gold=xC(xPick(XPAL.gold));
 vnReg('Cholet palace (rich)',0,0,9.5,NS*SH+8);vnReg('Cholet palace — tower',W/2,D/2,3,NS*SH+10);
 vB('vStone',0,0,0,W+.6,.6,D+.6,0,xC(xPick(XPAL.stone)));xnFlight(0,0,D/2+.3+1.2,0,6,.6,'vStone',xC(xPick(XPAL.stone)));
 const YT=.6+NS*SH;vB('vPlaster',0,.6,0,W,NS*SH,D,0,wall);
 // the ground: a grand entry in a three-colour stepped portal, shopfronts either side
 xnXOFrame(0,.8,D/2,0,5.6,SH*1.6,[f[0],f[1],f[2]],false);vnDoor(0,.9,D/2+.12,0,2.0,3.0,'xPaint',xC(f[2]),xC(0x2a1a10),false);kput('xArcP',[0,3.9,D/2+.14],null,[2.6,1.2,.16],gold);
 for(const s of[-1,1]){xnXOFrame(s*5.2,.9,D/2,0,3.8,SH-.6,[f[1],f[2],f[0]],false);vB('vDarkB',s*5.2,1.2,D/2+.06,2.2,2.0,.08,0);}
 // the storeys above: cornices, two great three-storey frames on the front, the ballroom band of roundels, gold lozenges
 for(let k=1;k<NS;k++){const y=.6+k*SH;vB('xPaint',0,y-.3,0,W+.5,.3,D+.5,0,xC(f[0]));if(k%2)xnXOZigzag(0,y-.75,D/2,0,W-2,.45,f[1],f[2]);}
 for(const s of[-1,1])xnXOFrame(s*4.6,.6+SH+.3,D/2,0,5.4,SH*2.4,[f[0],f[1],f[2]],lit);
 {const yb=.6+SH*3.5;for(const u of[-4.6,0,4.6]){kput('xDisc',[u,yb+.6,D/2+.08],qEuler(Math.PI/2,0,0),[1.0,.06,1.0],xC(f[2]));vB(lit?'vWinLit':'vWinGlass',u,yb,D/2+.04,1.4,1.4,.08,0);}   // the ballroom's round windows
  xnXOZigzag(0,yb-.5,D/2,0,W-2,.5,f[1],XAN.cream);}
 for(const s of[-1,1])xnXOFrame(s*4.6,.6+SH*4+.2,D/2,0,5.4,SH*(NS-4)-.5,[f[2],f[0],f[1]],lit);
 for(let k=1;k<NS;k++)for(const s of[-1,1]){const y=.6+k*SH;xnXOFrame(s*W/2,y+.3,-2.5,s*Math.PI/2,4.0,SH-.7,[f[1],f[0],f[2]],lit);xnXOLozenge(s*W/2,y+SH/2,3,s*Math.PI/2,1.2,pal[3],XAN.cream);}
 for(const u of[-W/2+1.2,W/2-1.2])for(let k=1;k<NS;k++)xnXOLozenge(u,.6+k*SH+SH/2,D/2,0,.9,XPAL.gold[0],f[2]);
 // the octagonal corner tower with a tiled dome, storeys of arched windows
 {const bx=W/2-.2,bz=D/2-.2,R=2.6,ap=R*Math.cos(Math.PI/8),q=qEuler(0,Math.PI/8,0),TH=NS*SH+2;kput('xOctW',[bx,.6,bz],q,[R,TH,R],xC(f[0]));
  for(let k=0;k<NS;k++)for(const a of[0,Math.PI/4,Math.PI/2]){const p=loc(bx,bz,0,ap+.02,a);xnXTArchWin(p[0],.6+k*SH+.5,p[1],a,1.0,1.8,xC(f[2]),'xPaint',lit);}
  for(let k=1;k<=NS;k++)kput('xOctP',[bx,.6+k*SH-.3,bz],q,[R+.25,.3,R+.25],xC(f[1]));
  kput('xOctP',[bx,.6+TH,bz],q,[R+.4,.3,R+.4],xC(f[2]));kput('xBulbT',[bx,.6+TH+.3,bz],null,[R*.9,R*1.1,R*.9],xC(xPick([XPAL.turquoise,XAN.blue,XAN.red])));vBall('xGold',bx,.6+TH+.3+R*1.1+.1,bz,.2,gold);}
 // the roof: the chalet under a gilt roof, a terrace with railings, a garden
 vB('xPaint',0,YT,0,W+.5,.3,D+.5,0,xC(f[0]));xnXORail(0,YT+.3,D/2+.2,0,W-1,pal[3]);xnXORail(-W/2-.2,YT+.3,0,-Math.PI/2,D-.4,pal[3]);
 {const cw=8,cd=6,cx=-2,cz=-1.5;vB('vPlaster',cx,YT+.3,cz,cw,3.2,cd,0,xC(f[1]));for(const u of[-2.5,0,2.5])xnTibWin(cx+u,YT+1.1,cz+cd/2,0,1.2,1.6,lit?'lit':'glass',xC(f[2]),{noVal:true});
  if(V===1)vnGableRoof(cx,YT+3.5,cz,cw+1,cd+1,2.0,0,'xGableT',xC(0xb8563a),.6);else xnGiltRoof(cx,YT+3.5,cz,cw,cd,0,{frame:0,rise:2.2,over:.8});}
 xnTree(4.5,2.5,3.2,undefined,YT+.3);vnPlanter(5,YT+.3,-3.5,2.4,.6,0,xC(0x8a5a3a));
 if(lit){for(const s of[-1,1])vnLampPost(s*5,0,D/2+3.5,3.4);for(let k=1;k<NS;k++)vBall('vBulb',0,.6+k*SH-.5,D/2+.3,.08);}
 vnFolk(0,D/2+4.5,3,2);}

XA.def({key:'xa_andean_poor',name:'Palopó shop-house',family:'Housing — poor',tags:{type:['single-family dwelling','market/shop'],wealth:'poor',lit:false},w:16,d:14,h:10,fw:8.3,fd:7.3,build:buildXaAndeanPoor});
XA.def({key:'xa_andean_mid',name:'Cholet',family:'Housing — middle',tags:{type:['multi-family dwelling','market/shop'],wealth:'middle',lit:false},w:20,d:16,h:20,fw:12.4,fd:10.4,build:buildXaAndeanMid});
XA.def({key:'xa_andean_rich',name:'Cholet palace',family:'Housing — rich',tags:{type:['multi-family dwelling','tavern/inn'],wealth:'rich',lit:true},w:26,d:20,h:32,fw:16.6,fd:13.6,build:buildXaAndeanRich});
