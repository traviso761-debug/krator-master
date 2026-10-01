// ================================================================= XANADU — the Spicers' Guild (package X-N, round 8)
// Travis: a luxurious Spicers' Guild after two pictures — a carved timber house (a grand arched porch on carved
// columns with balustraded stairs, lantern-lit, octagonal corner bays under tiered spires, deep carved gables) and
// the Hawa Mahal (a saffron facade stepping up in tiers of cream-trimmed jharokhas, every one under its own
// cupola) — with a spice market attached along its flank. Seeds 32500–32599.

const XSP={saffron:0xe8781e,saffronD:0xc85e14,cream:0xf4e8d0,timber:0xc07a3a,timberD:0x8a4e22,gold:0xe0b040};
const XSPICES=[0xe0a020,0xc8301e,0xf0c030,0x8a3a1a,0x3f7a34,0xd85a10,0xe8d0a0,0x6a2a10,0xf07020,0x9a7a30];
// a cone of spice on a tray, the trader's pyramids: a tray disc and a bright cone
function xnXNSpiceCone(x,y,z,r,c){kput('xDisc',[x,y,z],null,[r*1.3,.05,r*1.3],xC(0x8a6a48));kput('xConeP',[x,y+.05,z],null,[r,r*1.4,r],c);}
// a string of dried chillies hung from a to b (world points)
function xnXNChillies(a,b,n){vBeam(a,b,.012,xC(0x5a4632),'vRope');for(let k=0;k<n;k++){const t=(k+.5)/n;const p=[lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)];
 for(let j=0;j<3;j++)kput('xConeP',[p[0]+rr(-.05,.05),p[1]-.05-j*.06,p[2]+rr(-.05,.05)],qEuler(Math.PI+rr(-.3,.3),rng()*TAU,rr(-.3,.3)),[.05,.16,.05],xC(xPick([0xc8301e,0xd84020,0xa82818])));}}
// a market stall: a table of spice cones under a striped awning on two posts, sacks and baskets before it, a
// chilli string across the front, a trader behind
function xnXNStall(x,z,ry,lit){const P=(u,v)=>loc(x,z,u,v,ry),tim=xC(XSP.timberD);
 const t=P(0,0);vB('vWood',t[0],.78,t[1],2.8,.08,1.1,ry,xC(XSP.timber));for(const s of[-1,1])for(const v of[-.4,.4]){const p=P(s*1.2,v,ry);vPst('vPost',p[0],0,p[1],.05,.78,tim);}
 for(let i=0;i<6;i++){const p=P(-1.1+i*.44,rr(-.25,.25));xnXNSpiceCone(p[0],.86,p[1],rr(.16,.22),xC(XSPICES[(i*3+Math.floor(rng()*3))%XSPICES.length]));}
 const back=P(0,-.9);vB('vWood',back[0],.7,back[1],3,1.3,.12,ry,xC(XSP.timber));for(let i=0;i<4;i++){const p=P(-1.05+i*.7,-.86);vPst('xDrumS',p[0],1.35,p[1],.13,.32,xC(xPick(XSPICES)));}   // the shelf of jars
 for(const s of[-1,1]){const p=P(s*1.4,.7);vPst('vPost',p[0],0,p[1],.05,2.5,tim);}const aw=P(0,.6);vnAwning(aw[0],2.45,aw[1],ry,3.0,1.5,xC(xPick([0xa8382a,0x2f7a4a,0xe8a030,0x8a3aa8])));
 const c1=P(-1.4,.72),c2=P(1.4,.72);xnXNChillies([c1[0],2.35,c1[1]],[c2[0],2.35,c2[1]],7);
 const sk=P(-.6,1.3);vnSacks(sk[0],0,sk[1],3);const bk=P(1.0,1.3);vPst('vBarrel',bk[0],0,bk[1],.3,.4,xC(0xc8a068));kput('xConeP',[bk[0],.4,bk[1]],null,[.26,.3,.26],xC(xPick(XSPICES)));
 const f=P(rr(-.4,.4),-.45);kput('figB',[f[0],0,f[1]],qEuler(0,ry+Math.PI,0),1,xC(xPick([0xe8d9b8,0xc9442a,0x2f8f8a,0xf2c12e])));
 if(lit){const l=P(0,.2);vBall('vBulb',l[0],2.3,l[1],.06);}}
// a tiered spire on an octagonal bay: three tiled cones stepping in, gold finial
function xnXNSpire(x,y,z,R,c){let yy=y,r=R;for(let k=0;k<3;k++){kput('xOctP',[x,yy,z],qEuler(0,Math.PI/8,0),[r+.3,.22,r+.3],xC(XSP.timberD));kput('xConeP',[x,yy+.22,z],null,[r,1.0,r],c);yy+=1.0;r*=.7;}
 vPst('xGold',x,yy,z,.06,.6,xC(XSP.gold));vBall('xGold',x,yy+.7,z,.16,xC(XSP.gold));}
// one tier of the facade: a saffron storey with a cream band, jharokhas under cupolas along its front and ends
function xnXNTier(x0,y,w,h,d,z,n,lit){const saf=xC(XSP.saffron),cream=xC(XSP.cream);vB('xPaint',x0,y,z,w,h,d,0,saf);vB('xPaint',x0,y+h-.4,z,w+.16,.36,d+.16,0,cream);vB('xPaint',x0,y,z,w+.12,.3,d+.12,0,cream);
 const bw=w/n;for(let i=0;i<n;i++){const x=x0-w/2+bw*(i+.5);xnJharokha(x,y+.5,z+d/2,0,Math.min(2.2,bw-.7),h-1.3,cream,{d:.8,dome:'W',jaliC:xC(0xf8f0e0)});
  if(lit)vBall('vBulb',x,y+h-.9,z+d/2+.5,.06);}
 for(const s of[-1,1])for(let j=0;j<Math.max(1,Math.round(d/4));j++){const zz=z-d/2+d*(j+.5)/Math.max(1,Math.round(d/4));xnJharokha(x0+s*w/2,y+.5,zz,s*Math.PI/2,2.0,h-1.3,cream,{d:.7,dome:'W',jaliC:xC(0xf8f0e0)});}}

function buildXaGuildSpicer(G,o){reseed(32501+(o.v|0));const V=xV(o),lit=xLit();
 const saf=xC(XSP.saffron),cream=xC(XSP.cream),tim=xC(XSP.timber),timD=xC(XSP.timberD),gold=xC(XSP.gold),stone=xC(xPick(XPAL.stone));
 const W=20,D=14,X0=-9,NT=V===2?4:5,TH=3.3;   // the house to the left of the plot, the market along its right flank
 vnReg("Spicers' Guild",X0,0,W/2+2,NT*TH+8);vnReg("Spicers' Guild — spice market",14,4,12,7);
 // the plinth and the grand stair
 vB('vStone',X0,0,0,W+3,1.0,D+3,0,stone);xnPave(X0,0,W+3,D+3,0,stone,2.2,1.0);
 // the tiers: each steps in 2.4 m; jharokhas on every face; the top under a gilt roof
 for(let k=0;k<NT;k++){const w=W-k*2.4,d=D-k*1.2;xnXNTier(X0,1+k*TH,w,TH,d,-k*.6,Math.max(2,Math.round(w/3.4)),lit);}
 const YT=1+NT*TH,wt=W-NT*2.4+2.4,dt=D-NT*1.2+1.2;if(V===1)xnDome(X0,YT,-(NT-1)*.6,wt*.28,'G',{drum:1.2,drumItem:'xDrumS',fin:1.2});else xnGiltRoof(X0,YT,-(NT-1)*.6,wt,dt,0,{frame:1.0,rise:2.4,over:.9});
 for(const sx of[-1,1])xnChhatri(X0+sx*(wt/2-1.4),YT,-(NT-1)*.6+dt/2-1.4,.9,2.0,cream,xC(XSP.saffronD),6);
 // the carved timber porch: two storeys of carved columns, a great arch under a deep carved gable, lanterns
 {const z=D/2,pw=9,pd=4.2;vB('vWood',X0,1.0,z+pd/2,pw+1,.3,pd+.6,0,timD);
  for(const s of[-1,1]){xnCol(X0+s*(pw/2-.5),1.3,z+pd-.5,3.8,.28,0,tim,gold);xnCol(X0+s*(pw/2-.5),1.3,z+.6,3.8,.28,0,tim,gold);xnCol(X0+s*(pw/2-2.4),1.3,z+pd-.5,3.8,.22,0,tim,gold);}
  vB('vWood',X0,5.1,z+pd/2,pw+.6,.5,pd+.4,0,tim);vB('xFriezeB',X0,4.6,z+pd+.05,pw,.5,.12,0);
  kput('xArchP',[X0,1.3,z+pd-.1],null,[pw*.9,4.0,.5],tim);kput('xArcP',[X0,5.6,z+pd+.1],null,[pw*.8,2.4,.4],tim);kput('xArcP',[X0,5.7,z+pd+.32],null,[pw*.55,1.7,.16],cream);   // the arch and the carved tympanum
  vnGableRoof(X0,5.6,z+pd/2,pw+1.2,pd+1.4,2.6,0,'xGableT',timD,.9);for(const s of[-1,1])xnMember('xFriezeB',[X0,8.3,z+pd+.9],[X0+s*(pw/2+.7),5.7,z+pd+.9],.4,.1,[0,0,1],null);   // the carved barge boardsvB('xGoldB',X0,8.2,z+pd/2,.3,.8,.3,0,gold);vBall('xGold',X0,9.0,z+pd/2,.22,gold);
  vnDoor(X0,1.3,z+.02,0,2.2,3.4,'xPaint',timD,xC(0x2a1a10),false);kput('xArcP',[X0,4.7,z+.06],null,[2.8,1.2,.16],tim);
  for(const s of[-1,1]){kput('xConeP',[X0+s*2.2,4.0,z+pd-.2],qEuler(Math.PI,0,0),[.22,.4,.22],xC(0x3a2a20));if(lit)vBall('vBulb',X0+s*2.2,3.72,z+pd-.2,.1);}
  xnFlight(X0,0,z+pd+1.6,0,5.4,1.0,'vWood',tim);for(const s of[-1,1]){for(let k=0;k<3;k++){vB('vWood',X0+s*2.9,1.0-k*.3,z+pd+.3+k*.55,.36,1.1+k*.3,.36,0,timD);}
   kput('xBulbT',[X0+s*2.9,2.1,z+pd+.3],null,[.34,.42,.34],saf);vBall('xGold',X0+s*2.9,2.55,z+pd+.3,.08,gold);
   for(let k=0;k<4;k++){vPst('vPipe',X0+s*2.9,1.0-.1*k,z+pd+.75+k*.42,.03,.8,timD);}vB('vWood',X0+s*2.9,1.85-.2,z+pd+1.4,.1,.08,2.0,0,timD);}}
 // the octagonal timber bays on the front corners, rising two tiers, under tiered spires
 for(const s of[-1,1]){const bx=X0+s*(W/2-.4),bz=D/2-.6,R=1.9,yb=4.2,hb=5.6,ap=R*Math.cos(Math.PI/8);   // XOCT is unit-RADIUS: ap is the face's distancekput('xOctW',[bx,yb,bz],qEuler(0,Math.PI/8,0),[R,hb,R],tim);kput('xOctP',[bx,yb-.24,bz],qEuler(0,Math.PI/8,0),[R+.4,.26,R+.4],timD);
  for(const a of[0,s*Math.PI/4,s*Math.PI/2]){const p=loc(bx,bz,0,ap+.02,a);for(const yy of[yb+.6,yb+3.2])xnTibWin(p[0],yy,p[1],a,1.0,1.6,lit?'lit':'glass',cream,{noVal:true});}
  for(const yy of[yb+2.5,yb+hb-.5])kput('xOctP',[bx,yy,bz],qEuler(0,Math.PI/8,0),[R+.2,.3,R+.2],cream);for(const yy of[yb+2.8,yb+hb-.2]){for(let k=0;k<8;k++){const a=k*Math.PI/4+Math.PI/8;const q=loc(bx,bz,0,ap+.04,a);vB('xFriezeB',q[0],yy,q[1],R*.74,.3,.08,a);}}   // carved bands round the bay
  for(const a of[.2,s*Math.PI/4,s*Math.PI/2-.2*s]){const p=loc(bx,bz,0,R*.9,a),f=loc(bx,bz,0,R*.3,a);xnMember('vWood',[f[0],yb-1.6,f[1]],[p[0],yb-.24,p[1]],.16,.14,xRot(a,[1,0,0]),timD);}
  xnXNSpire(bx,yb+hb,bz,R*.95,xC(XSP.saffronD));}
 // the spice market: a long timber shed along the right flank, open to the front, five stalls under it, sacks,
 // barrels and a cart in the yard, chilli strings between the posts, a drying rack on the store's roof
 {const MX=14,MZ=4,ML=22,MD=7;xnPave(MX,MZ,ML+2,MD+8,0,stone,2);
  vB('xPaint',MX,0,MZ-MD/2-2.5,ML,6.4,5,0,saf);vB('xPaint',MX,6.0,MZ-MD/2-2.5,ML+.2,.36,5.2,0,cream);for(let i=0;i<5;i++)xnTibWin(MX-ML/2+ML*(i+.5)/5,3.6,MZ-MD/2,0,1.0,1.4,lit?'lit':'glass',cream,{noVal:true});   // the spice store behind
  vnDryingRack(MX-4,6.4,MZ-MD/2-2.5,0,5);vnDryingRack(MX+4,6.4,MZ-MD/2-2.5,0,5);for(let k=0;k<4;k++)vnSacks(MX-ML/2+4+k*5,6.4,MZ-MD/2-3.5,2);
  const n=Math.round(ML/3.6);for(let i=0;i<=n;i++){const x=MX-ML/2+ML*i/n;vPst('vPost',x,0,MZ+MD/2,.12,4.0,timD);vPst('vPost',x,0,MZ-MD/2+.3,.12,4.6,timD);}
  vnShedRoof(MX,4.0,MZ,ML+.6,MD,.9,Math.PI,'xGableT',xC(XSP.saffronD),.8);vB('vWood',MX,3.9,MZ+MD/2,ML+.8,.2,.25,0,tim);vB('xFriezeB',MX,3.45,MZ+MD/2+.05,ML,.4,.1,0);
  for(let i=0;i<n;i++){const x=MX-ML/2+ML*(i+.5)/n;xnXNStall(x,MZ+.6,0,lit);}
  for(let i=1;i<n;i++){const x=MX-ML/2+ML*i/n;xnXNChillies([x-1.7,3.6,MZ+MD/2],[x+1.7,3.6,MZ+MD/2],8);}
  for(let k=0;k<3;k++)vnBarrel(MX-ML/2+1+k*1.1,0,MZ+MD/2+3,.34,.9,xC(0x8a6a48));vnSacks(MX+6,0,MZ+MD/2+3.2,5);vnCrate(MX+9.5,0,MZ+MD/2+2.6,1.0,.3);vnCrate(MX+9.5,.8,MZ+MD/2+2.6,.8,.6);
  for(let k=0;k<4;k++)xnXNSpiceCone(MX+2+k*.9,0,MZ+MD/2+4.2,.38,xC(XSPICES[k*2]));
  if(lit){vnLampPost(MX-ML/2-1.2,0,MZ+MD/2+2,3.4);vnLampPost(MX+ML/2+1.2,0,MZ+MD/2+2,3.4);}}
 if(lit)for(const s of[-1,1])vnLampPost(X0+s*7,0,D/2+8,3.6);vnFolk(X0,D/2+9,3,2);vnFolk(14,10,5,4);}
XA.def({key:'xa_guild_spicer',name:"Spicers' Guild",family:'Guilds',tags:XTAG_GUILD,w:54,d:40,h:24,fw:24,fd:17,eye:[-2,40,-8,0],eyes:[['market',14,18,14,4],['porch',-6,24,-9,4]],build:buildXaGuildSpicer});
