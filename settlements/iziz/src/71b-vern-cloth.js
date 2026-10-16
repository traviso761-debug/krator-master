// ================================================================= 71b. IZIZ VERNACULAR — cloth, leather and letters (the trades round)
// The Voth census trades in the Vernacular (74z-vern-trades.js): the weaver and dyer (voth_bldg_weaver), the tannery
// (voth_bldg_tannery), the tailor and clothier (voth_shop_clothier), the scribe and bookseller (voth_shop_scribe).
// None is rich or civic, so none carries electric light. Each draws its walls through vnBody (69e) so its rooms show
// when the sheet has interiors on; the items are in kits/interiors/sets/iziz.js (ag-cloth). Seeds 8201-8299.

const VCL_DYE=[0xe07a2a,0xd8893c,0x2f8f8a,0x27706c,0x2f3a7a,0x3b4a8a,0xc9442a,0xe8d9b8];   // Iziz orange, teal, indigo, madder, undyed
const VCL_HIDE=[0x9a6a42,0x8a5a36,0xb08a5a,0x7a5232];
const VCL_BOOK=[0x7a2028,0x5c4028,0x2a4d80,0x3f6b56,0x4a3220,0x6a2434,0xcbb08e,0xc4813f];
// a clay dye vat on a ring of stones, its liquor a flat disc a hand below the rim
function vclVat(x,y,z,r,h,dye){vPst('vClayPot',x,y,z,r,h,vC(vPick([0x9a5a38,0xa86a44,0x8a4e30])));vBq('vHoop',x,y+h-.02,z,r*1.0,r*1.0,1,qEuler(Math.PI/2,0,0),vC(0x7a4a30));
 vPst('vTankW',x,y+h-.12,z,r*.8,.05,vC(dye,.9));}
// a dyed length hung over a pole along local x: two drops of cloth, the near one longer
function vclHang(x,y,z,ry,w,L,c){c=c.clone().multiplyScalar(1.55);const a=loc(x,z,0,.03,ry),b=loc(x,z,0,-.03,ry);kput('vTarp',[a[0],y-L/2,a[1]],vQ(ry,rr(-.05,.05),rr(-.03,.03)),[w,L,1],c);
 kput('vTarp',[b[0],y-L*.36,b[1]],vQ(ry,0,0),[w,L*.72,1],c.clone().multiplyScalar(.82));}
// a hide laced into a pole frame (two posts, two bars), the lacing a few cords from its edge to the frame
function vclHideFrame(x,z,ry,w,h,c){const wood=vC(vPick(VPAL.woodPoor));for(const s of[-1,1]){const p=loc(x,z,s*w/2,0,ry);vPst('vPost',p[0],0,p[1],.07,h+.5,wood);}
 for(const yy of[.45,h+.35]){const a=loc(x,z,-w/2-.1,0,ry),b=loc(x,z,w/2+.1,0,ry);vBeam([a[0],yy,a[1]],[b[0],yy,b[1]],.08,wood);}
 const hw=w-.55,hh=h-.6,yc=.45+(h-.1)/2;const p=loc(x,z,0,.02,ry);kput('vTarp',[p[0],yc,p[1]],vQ(ry,0,rr(-.06,.06)),[hw,hh,1],c);
 kput('vTarp',[p[0],yc+rr(-.1,.1),p[1]],vQ(ry,0,rr(.5,.8)),[hw*.62,hh*.62,1],c.clone().multiplyScalar(.92));   // the hide's ragged outline: a second, turned sheet
 const cord=vC(0xb8a888);for(let k=0;k<4;k++){const t=-.5+(k+.5)/4;for(const s of[-1,1]){const a=loc(x,z,s*hw/2,.02,ry),b=loc(x,z,s*(w/2-.05),.02,ry);vBeam([a[0],yc+t*hh*.9,a[1]],[b[0],yc+t*hh*.9,b[1]],.02,cord,'vRope');}
  const a=loc(x,z,t*hw*.9,.02,ry);vBeam([a[0],yc+hh/2,a[1]],[a[0],h+.33,a[1]],.02,cord,'vRope');vBeam([a[0],yc-hh/2,a[1]],[a[0],.47,a[1]],.02,cord,'vRope');}}
// a row of books standing along local x (spines to +z), from x0 to x1, on a shelf or table top at y
function vclBooks(x0,x1,y,z,ry,dep){let u=x0;while(u<x1-.05){const t=rr(.035,.08),h=rr(.17,.3);const p=loc(0,z,u+t/2,0,ry);
  vB('vPanelB',p[0],y,p[1],t,h,dep*rr(.8,1),ry+rr(-.04,.04),vC(vPick(VCL_BOOK)));u+=t+.006;}}
// a timber screw press: two heavy cheeks, a head beam, the iron screw and its bar, the platen, a bed with a stack of sheets
function vclPress(x,z,ry,wood){for(const s of[-1,1]){const p=loc(x,z,s*.55,0,ry);vB('vWood',p[0],0,p[1],.24,2.1,.4,ry,wood);}
 vB('vWood',x,1.85,z,1.5,.32,.46,ry,wood);vB('vWood',x,.7,z,1.4,.26,.9,ry,wood.clone().multiplyScalar(.85));   // head, bed
 vB('vWood',x,0,z,1.4,.12,.5,ry,wood);vPst('vPipe',x,1.2,z,.06,.7,vC(0x2e2a26));vB('vIron',x,1.12,z,.7,.1,.6,ry,vC(0x3a3530));   // sill, screw, platen
 {const a=loc(x,z,-.45,0,ry),b=loc(x,z,.45,0,ry);vBeam([a[0],1.55,a[1]],[b[0],1.55,b[1]],.05,vC(0x2e2a26),'vIron');}
 vB('vPlaster',x,.96,z,.6,.14,.5,ry,vC(0xe8dcc0));}
// paper on a drying line along local x between two posts
function vclPaperLine(x,y,z,ry,L){const a=loc(x,z,-L/2,0,ry),b=loc(x,z,L/2,0,ry);vBeam([a[0],y,a[1]],[b[0],y,b[1]],.015,vC(0xb8a888),'vRope');
 for(let k=0;k<Math.round(L/.5);k++){const p=loc(x,z,-L/2+.3+k*.5,0,ry);kput('vPlateW',[p[0],y-.22,p[1]],vQ(ry,rr(-.08,.08),0),[.34,.42,1],vC(vPick([0xf0e6cc,0xe8dcc0,0xd8ccb0])));}}

// ---------------------------------------------------------------- weaver and dyer: the loom room behind tall shutters, the dye yard behind
function buildVernWeaver(G,o){reseed(8201+(o.v|0));const W=10,D=7.6,H1=3.7,H2=2.9,Y0=.45,ZH=1.6,zf=ZH+D/2,zb=ZH-D/2;
 const wood=vC(vPick(VPAL.woodMid)),pl=vC(vPick(VPAL.sand)),trim=vC(vPick(VPAL.trim));
 vnReg('Weaver and dyer\'s house (middle)',0,-.5,8.6,Y0+H1+H2+3.4);
 vB('vStone',0,-.1,ZH,W+.5,.55,D+.5,0,vC(vPick(VPAL.stoneDark)));
 vnBody('vPlaster',0,Y0,ZH,W,H1,D,0,pl,{t:.3});vnBand('vWood',0,Y0+H1,ZH,W+.34,.3,D+.34,0,wood,.47);
 vnBody('vPlaster',0,Y0+H1+.3,ZH,W,H2,D,0,pl.clone().multiplyScalar(1.05),{t:.3});
 for(const sx of[-1,1])for(const sz of[-1,1])vPst('vPost',sx*(W/2-.02),Y0,ZH+sz*(D/2-.02),.17,H1+H2+.32,wood);
 const top=vnCornice('vWood',0,Y0+H1+.3+H2,ZH,W,D,0,wood,2);
 vnGableRoof(0,top,ZH,W,D,2.4,0,'vGableC',null,1.1,'vGablePl',pl,.16);
 // the weaving room: the street door and tall shuttered openings for the light, on the front and both sides
 vnDoor(-3.6,Y0,zf,0,1.2,2.4,'vWood',trim,vC(0x6a4a30));
 for(const x of[-1.3,1.2,3.7])vnWin(x,Y0+.6,zf,0,1.25,2.5,'open','vWood',trim,true);
 for(const s of[-1,1]){vnWin(s*W/2,Y0+.6,ZH+1.5,s*Math.PI/2,1.2,2.5,'open','vWood',trim,true);vnWin(s*W/2,Y0+.9,ZH-1.7,s*Math.PI/2,1.0,1.6,s<0?'open':'shut','vWood',trim,s<0);}
 // the dye room's back door onto the yard, a shuttered window by it
 vnDoor(3.4,Y0,zb,Math.PI,1.0,2.2,'vWood',wood,vC(0x5a3a24));vnWin(-2.6,Y0+1.1,zb,Math.PI,1.1,1.3,'open','vWood',wood,true);
 // the family above: deco shutter strips and windows
 for(const x of[-3.4,3.4])vnWin(x,Y0+H1+1.0,zf,0,1.0,1.3,'open','vWood',trim,true);
 for(const x of[-1.2,1.2])vnStrip(x,Y0+H1+.7,zf,0,.7,2.0,'vWood',trim);
 for(const s of[-1,1])vnWin(s*W/2,Y0+H1+1.0,ZH,s*Math.PI/2,1.0,1.2,'open','vWood',wood,true);
 for(const x of[-2.6,2.6])vnWin(x,Y0+H1+1.0,zb,Math.PI,1.0,1.2,x<0?'shut':'open','vWood',wood,x>0);
 // the street front: an awning over the openings, a sign, a cloth-length banner, a bench with folded bolts for sale
 vnAwning(1.2,Y0+2.95,zf,0,7.2,1.4,vC(vPick(VPAL.awning)));vnSign(-4.6,Y0+3.2,zf,0,vC(0x2f8f8a));
 vnBannerPole(-W/2-.7,0,zf+.6,0,6.2,vC(0x2f3a7a));
 vB('vWood',-1.3,0,zf+.75,1.6,.5,.45,0,wood);for(let k=0;k<4;k++)vB('vTarpB',-1.85+k*.38,.5,zf+.75,.34,.08+.04*(k%2),.36,rr(-.1,.1),vC(VCL_DYE[k*2%VCL_DYE.length]));
 vnPaving(0,.02,zf+1.7,W,2.2,0,vC(vPick(VPAL.stoneDark)),10);vnPlanter(4.2,0,zf+1.6,1.2,.55,0,wood);
 // a rack of finished lengths on the +x side, where the street sees them
 {const rx=W/2+1.3;for(const z of[ZH-2.6,ZH+2.4])vPst('vPost',rx,0,z,.07,2.6,wood);vBeam([rx,2.55,ZH-2.8],[rx,2.55,ZH+2.6],.05,wood);
  for(let k=0;k<4;k++)vclHang(rx,2.53,ZH-1.9+k*1.25,Math.PI/2,1.0,rr(1.5,2.0),vC(VCL_DYE[[0,2,4,1][k]]));}
 // the dye yard: a lean-to off the back wall over the fired vats (orange, teal, indigo), more vats in the open, the drying poles
 {const lz=zb-1.45;vnShedRoof(.6,2.55,lz,6.4,2.9,.85,Math.PI,'vCorr',null,.5,.12);
  for(const x of[-2.4,.6,3.6])vPst('vPost',x,0,lz-1.35,.1,2.55,wood);vB('vWood',.6,2.45,lz-1.35,6.6,.16,.18,0,wood);
  vB('vStone',-.6,0,lz,4.2,.55,1.2,0,vC(0x8a7a6a));                                            // the hearth bench
  for(let k=0;k<3;k++){vB('vDarkB',-1.9+k*1.3,.08,lz+.62,.4,.32,.06,0);vBall('vEmber',-1.9+k*1.3,.2,lz+.58,.1);vclVat(-1.9+k*1.3,.55,lz,.5,.75,[0xe07a2a,0x2f8f8a,0x2f3a7a][k]);}
  vnChimney(-2.6,.55,lz-.45,3.0,.16,true);
  vB('vWood',3.0,0,lz+.2,1.8,.55,.8,0,wood);vB('vPanelB',3.0,.5,lz+.2,1.6,.06,.6,0,vC(0x5a7a8a));   // the rinse trough
  for(let k=0;k<5;k++)vPst('vPostB',3.9+rr(-.1,.1),.05+k*.2,lz-1.0,.09,1.0,vC(0x6a4a30),qEuler(0,0,Math.PI/2));   // firewood under the eave
  vnSacks(-3.9,0,lz+.2,3);}
 for(let k=0;k<4;k++)vclVat(-3.6+k*2.1,0,zb-4.2,.62,.7,VCL_DYE[[0,2,4,6][k]]);
 // the drying poles: two long rails on forked posts across the back of the plot, lengths of every colour
 for(const pz of[zb-5.7,zb-7.0]){for(const x of[-6.4,0,6.4])vPst('vPost',x,0,pz,.08,2.75,wood);
  vBeam([-6.6,2.7,pz],[6.6,2.7,pz],.05,wood);
  for(let k=0;k<9;k++){const x=-5.9+k*1.45+rr(-.1,.1);vclHang(x,2.68,pz,0,rr(.9,1.2),rr(1.4,2.1),vC(VCL_DYE[(k+(pz<zb-6?3:0))%VCL_DYE.length]));}}
 vnFence(0,0,zb-4.3,W+4,7.6,0,vC(vPick(VPAL.woodPoor)),W+3.98,1.1);
 vnWaterButt(W/2+.7,0,zb+1.0,.42,1.1);vnBarrel(-W/2-.7,0,zb-1.2,.4,1.0,wood);vnBarrel(-W/2-.7,0,zb-2.1,.36,.9,wood);
 vnFolk(1,zf+3.6,3,1.6);vnFolk(0,zb-3,1,.6);}

// ---------------------------------------------------------------- tannery: an open thatch shed over the pits, hide frames, bark store, a board store
function buildVernTannery(G,o){reseed(8211+(o.v|0));const SX=-3,SW=10.6,SD=7.4,H=3.0;const wood=vC(vPick(VPAL.woodPoor)),th=vC(vPick(VPAL.thatch));
 vnReg('Tannery (poor)',0,0,10,H+3.4);
 vnPaving(SX,.02,0,SW+.6,SD+.6,0,vC(0x7a6a58),26);
 // the shed: posts, head and tie beams, a palm-thatch gable open at both ends for the stink, rafters showing at the ends
 const nx=4;for(let i=0;i<=nx;i++)for(const s of[-1,1])vPst('vPostB',SX-SW/2+SW*i/nx,0,s*SD/2,.15,H,wood);
 for(const s of[-1,1])vB('vWood',SX,H-.2,s*SD/2,SW+.3,.22,.24,0,wood);
 for(let i=0;i<=nx;i++)vB('vWood',SX-SW/2+SW*i/nx,H-.2,0,.18,.18,SD,0,wood);
 for(const s of[-1,1]){vPst('vPost',SX+s*SW/2,H,0,.09,2.2,wood);for(const t of[-1,1])vBeam([SX+s*SW/2,H,t*SD/2],[SX+s*SW/2,H+2.3,0],.1,wood);}
 vB('vWood',SX,H+2.15,0,SW+.2,.16,.16,0,wood);
 vnGableRoof(SX,H,0,SW,SD,2.4,0,'vThatchB',th,1.0,null,null,.26);
 // the pits: two rows of four sunk vats, lime and soak in front, tan liquor behind, board rims proud of the floor
 const LQ=[[0xd8d2c0,0xcfc8b4,0x8a7e66,0x7e7460],[0x5a4a2a,0x6a4c2c,0x4a3a22,0x5e4426]];
 for(let r=0;r<2;r++)for(let k=0;k<4;k++){const px=SX-3.9+k*2.6,pz=r?-1.55:1.55,w=2.1,d=1.7;
  for(const s of[-1,1]){vB('vWood',px,0,pz+s*(d/2-.06),w,.5,.12,0,wood);vB('vWood',px+s*(w/2-.06),0,pz,.12,.5,d-.24,0,wood);}
  vB('vPlaster',px,.3,pz,w-.24,.04,d-.24,0,vC(LQ[r][k]));
  if((r+k)%2===0){vBeam([px,.62,pz-d/2],[px,.62,pz+d/2],.07,wood);for(const s of[-1,1])kput('vTarp',[px+s*.05,.5,pz+.05],vQ(Math.PI/2,s*.25,0),[1.1,.36,1],vC(vPick(VCL_HIDE),r?.85:1.2));}}
 for(let k=0;k<5;k++)vB('vWood',SX-4.2+k*2.1,.02,0,1.95,.06,.34,rr(-.03,.03),vC(vPick(VPAL.woodPoor),.9));   // the plank walk between the rows
 kput('vPost',[SX+2.9,1.1,1.55],vQ(0,.5,.4),[.04,2.6,.04],wood);kput('vPost',[SX-1.3,1.0,-1.6],vQ(0,-.4,.2),[.04,2.4,.04],wood);   // poles left in the pits
 // the scraping beam: a half log on splayed legs, a hide over it, the two-handled knife
 {const bx=SX-3.8,bz=SD/2+1.4;vBeam([bx-1.1,.25,bz],[bx+1.0,1.05,bz],.34,vC(0x7a6248));for(const s of[-1,1])vBeam([bx+.8,0,bz+s*.35],[bx+.95,1.0,bz],.08,wood);
  kput('vTarp',[bx-.05,.86,bz],vQ(Math.PI/2,0,0).multiply(qEuler(-Math.PI/2+.36,0,0)),[.9,1.6,1],vC(VCL_HIDE[2]));
  vB('vIron',bx+.3,1.0,bz+.4,.6,.04,.06,0,vC(0x3a3530));}
 // the bark store: a corrugate lean-to on the back corner over a heap of oak-bark slabs
 {const bx=SX-4.6,bz=-SD/2-2.0;vnShedRoof(bx,2.0,bz,3.8,2.6,.6,0,'vCorr',null,.4,.1);for(const x of[-1.7,1.7])for(const z of[-1.1,1.1])vPst('vPost',bx+x,0,bz+z,.08,z<0?2.55:2.05,wood);
  for(let i=0;i<46;i++){const hgt=Math.pow(rng(),1.6)*1.0;kput('vWood',[bx+rr(-1.5,1.5)*(1-hgt*.4),.06+hgt,bz+rr(-.9,.9)*(1-hgt*.4)],qEuler(rr(-.5,.5),rng()*TAU,rr(-.5,.5)),[rr(.35,.8),.05,rr(.18,.32)],vC(vPick([0x6a4a30,0x5a3e28,0x7a5a3a])));}
  for(let k=0;k<4;k++)vPst('vPostB',bx+2.2,.18+k*.34,bz-.6+(k%2)*.3,.16,1.1,vC(0x6a4a30),qEuler(Math.PI/2,0,0));}
 // the hide frames, out in the sun on the street side
 for(const [x,z,ry] of[[4.4,4.6,.5],[6.6,4.2,.35],[8.7,3.4,-.45]])vclHideFrame(x,z,ry,1.9,2.2,vC(vPick(VCL_HIDE)));
 // the board store and office: salvage-patched boards on a stone pad, a corrugate shed roof
 {const OX=6.6,OZ=-3.6,OW=5.6,OD=4.0,OY=.35,OH=2.6;vB('vStone',OX,-.1,OZ,OW+.4,.45,OD+.4,0,vC(0x8a7a6a));
  vnBody('vWood',OX,OY,OZ,OW,OH,OD,0,wood,{t:.12});vnShedRoof(OX,OY+OH,OZ,OW,OD,.7,0,'vCorr',null,.45,.12);
  for(const sx of[-1,1])for(const sz of[-1,1])vPst('vPost',OX+sx*(OW/2-.02),OY,OZ+sz*(OD/2-.02),.09,OH+(sz<0?.7:.05),wood);
  vnDoor(OX-1.4,OY,OZ+OD/2,0,.95,2.1,'vWood',wood,vC(0x6a5a48));vnWin(OX+1.3,OY+1.0,OZ+OD/2,0,1.0,1.0,'open','vWood',wood,true);
  vnWin(OX+OW/2,OY+1.0,OZ,Math.PI/2,1.0,1.0,'shut','vWood',wood);vnWin(OX-OW/2,OY+1.1,OZ-.6,-Math.PI/2,.9,.8,'open','vWood',wood);
  vnPatch(OX,OY,OZ-OD/2,Math.PI,OW,OH,3);vnPatch(OX+OW/2,OY,OZ+.2,Math.PI/2,OD,OH,1);
  vnSign(OX-2.4,OY+2.3,OZ+OD/2,0,vC(0x8a5a36));}
 // the yard: the drain to the back, water butts, tallow barrels, a lime heap, a hand cart of finished hides
 vB('vDarkB',SX+5.4,-.02,-SD/2-1.8,.35,.06,3.6,0);for(const s of[-1,1])vB('vWood',SX+5.4+s*.24,0,-SD/2-1.8,.1,.12,3.6,0,wood);
 vnWaterButt(SX+SW/2+.6,0,1.3,.45,1.1);vnWaterButt(SX-SW/2-.7,0,-1.6,.42,1.0);
 for(let k=0;k<3;k++)vnBarrel(1.4+k*.85,0,-6.4,.36,.9,wood);
 for(let i=0;i<9;i++)vBall('vRock',SX+5.4+rr(-.8,.8),rr(.05,.35),-6.4+rr(-.6,.6),rr(.3,.6),vC(0xe0dccc),.35);vnSacks(SX+4.4,0,-6.6,3);
 {const cx=1.2,cz=5.6;vB('vWood',cx,.55,cz,1.6,.12,1.0,0,wood);for(const s of[-1,1])vB('vWood',cx+s*.75,.67,cz,.08,.3,1.0,0,wood);
  for(const s of[-1,1])vBq('vStave',cx,.4,cz+s*.56,.4,.06,.4,qEuler(Math.PI/2,0,0),vC(0x5a4632));vBeam([cx-.8,.6,cz],[cx-2.0,.25,cz],.06,wood);
  for(let k=0;k<4;k++)vB('vTarpB',cx,.67+k*.07,cz,1.4,.06,.85,rr(-.12,.12),vC(vPick(VCL_HIDE),1.1));}
 vnFolk(SX,1,2,2.5);vnFolk(6.4,4,1,.4);}

// ---------------------------------------------------------------- tailor and clothier: a narrow two-storey shop, its gable to the street
function buildVernTailor(G,o){reseed(8221+(o.v|0));const W=7.2,D=9.6,H1=3.4,H2=3.0,Y0=.4,zf=D/2,zb=-D/2;
 const wood=vC(vPick(VPAL.woodMid)),pl=vC(vPick(VPAL.adobe)),trim=vC(vPick(VPAL.trim));
 vnReg('Tailor and clothier (middle)',0,0,7.6,Y0+H1+H2+3.6);
 vB('vStone',0,-.1,0,W+.5,.5,D+.5,0,vC(vPick(VPAL.stoneDark)));
 vnBody('vPlaster',0,Y0,0,W,H1,D,0,pl,{t:.25});vnBand('vWood',0,Y0+H1,0,W+.34,.3,D+.34,0,trim,.42);
 vnBody('vPlaster',0,Y0+H1+.3,0,W,H2,D,0,pl.clone().multiplyScalar(1.06),{t:.25});
 for(const sx of[-1,1])for(const sz of[-1,1])vPst('vPost',sx*(W/2-.02),Y0,sz*(D/2-.02),.16,H1+H2+.32,wood);
 const top=vnCornice('vWood',0,Y0+H1+.3+H2,0,W,D,0,wood,2);
 vnGableRoof(0,top,0,D,W,2.6,Math.PI/2,'vGableC',null,1.0,'vGablePl',pl,.16);
 // the display front: a wide opening over a board ledge, bolts and folded lengths on it, two robes hung in the opening
 vnWin(-1.0,Y0+.85,zf,0,3.9,1.75,'open','vWood',trim,false);vnDoor(2.6,Y0,zf,0,.95,2.3,'vWood',trim,vC(0x6a4a30));
 vB('vWood',-1.0,0,zf+.38,4.1,Y0+.78,.66,0,wood);vB('vWood',-1.0,Y0+.78,zf+.4,4.3,.06,.78,0,wood.clone().multiplyScalar(1.15));
 for(let k=0;k<7;k++){const x=-2.75+k*.58,c=vC(VCL_DYE[(k*3)%VCL_DYE.length]);
  if(k%2)vPst('vTankW',x,Y0+.84,zf+.42,.12,rr(.5,.7),c);
  else for(let j=0;j<3+(k%3);j++)vB('vTarpB',x+rr(-.03,.03),Y0+.84+j*.07,zf+.42,.46,.065,.4,rr(-.08,.08),vC(VCL_DYE[(k+j*2)%VCL_DYE.length]));}
 for(let k=0;k<3;k++)vBq('vTankW',-1.0+(k-1)*.3,Y0+.97,zf+.62,.1,.9,.1,qEuler(0,0,Math.PI/2),vC(VCL_DYE[k+2]));   // three bolts laid end-on to the street
 vBeam([-2.95,Y0+2.5,zf+.22],[.95,Y0+2.5,zf+.22],.04,vC(0x2e2a26),'vIron');
 for(const [x,c] of[[-2.45,0xe07a2a],[.45,0x2f8f8a]]){kput('vCloth',[x,Y0+1.78,zf+.24],vQ(0,0,0),[.62,1.36,1],vC(c));kput('vCloth',[x,Y0+2.32,zf+.25],vQ(0,0,0),[1.05,.26,1],vC(c,.9));}
 // a dress form by the door, the awning over the whole front, the sign
 vPst('vPost',1.55,0,zf+.75,.03,1.1,vC(0x3a2a1c));vBall('vBall',1.55,1.4,zf+.75,.2,vC(0x8a6a4a),.32);kput('vCloth',[1.55,1.1,zf+.76],vQ(0,0,0),[.42,.8,1],vC(0x3b4a8a));
 vnAwning(0,Y0+2.6,zf,0,7.0,1.5,vC(vPick(VPAL.awning)));vnSign(W/2-.2,Y0+3.6,zf,0,vC(0xe0a030));
 // upper front: two shuttered windows either side of a deco strip; an attic vent in the gable
 for(const x of[-1.9,1.9])vnWin(x,Y0+H1+1.0,zf,0,1.0,1.4,'open','vWood',trim,true);vnStrip(0,Y0+H1+.6,zf,0,.6,2.1,'vWood',trim);
 vnWin(0,top+.5,zf+.02,0,.8,.7,'shut','vWood',trim);
 // sides: the party walls carry little; the back: the workroom door to the yard and its window, the rooms above
 vnWin(-W/2,Y0+1.2,-1.8,-Math.PI/2,1.0,1.2,'open','vWood',wood,true);vnWin(W/2,Y0+1.2,-2.4,Math.PI/2,.9,1.0,'shut','vWood',wood);
 for(const s of[-1,1])vnWin(s*W/2,Y0+H1+1.1,s<0?-2.2:1.6,s*Math.PI/2,.9,1.2,'open','vWood',wood,true);
 vnDoor(-2.2,Y0,zb,Math.PI,.9,2.2,'vWood',wood,vC(0x5a3a24));vnWin(1.5,Y0+1.1,zb,Math.PI,1.3,1.3,'open','vWood',wood,true);
 for(const x of[-1.6,1.6])vnWin(x,Y0+H1+1.1,zb,Math.PI,1.0,1.2,x<0?'shut':'open','vWood',wood,x>0);
 vnWin(0,top+.5,zb-.02,Math.PI,.8,.7,'shut','vWood',wood);
 // the back yard: a low fence, a line of garments, a wash tub and the water butt
 vnFence(0,0,zb-1.25,W,2.3,0,vC(vPick(VPAL.woodPoor)),W-.01,1.0);
 for(const x of[-3,3])vPst('vPost',x,0,zb-1.6,.05,2.2,wood);vBeam([-3,2.1,zb-1.6],[3,2.1,zb-1.6],.02,vC(0xb8a888),'vRope');
 for(let k=0;k<5;k++)kput('vCloth',[-2.2+k*1.1,1.65,zb-1.6],vQ(0,0,rr(-.05,.05)),[.6,.9,1],vC(VCL_DYE[(k*2+1)%VCL_DYE.length]));
 vPst('vStave',1.8,0,zb-.8,.4,.5,vC(0x7a5a3a));vnWaterButt(-W/2+.6,0,zb-.6,.4,1.0);vnCrate(2.9,0,zb-.7,.7,.3,wood);
 vnPaving(0,.02,zf+1.0,W+1,1.6,0,vC(vPick(VPAL.stoneDark)),6);vnFolk(-2.2,zf+3.6,2,1.0);}

// ---------------------------------------------------------------- scribe and bookseller: a stone ground storey, a book stall under the awning, the press shed
function buildVernScribe(G,o){reseed(8231+(o.v|0));const W=9.2,D=8.4,H1=3.6,H2=3.0,Y0=.55,zf=D/2,zb=-D/2;
 const wood=vC(vPick(VPAL.woodMid)),st=vC(vPick(VPAL.stone)),sd=vC(vPick(VPAL.stoneDark)),pl=vC(vPick(VPAL.sand)),trim=vC(vPick(VPAL.trim));
 vnReg('Scribe and bookseller (middle)',1.2,0,8.4,Y0+H1+H2+3.4);
 vB('vStone',0,-.1,0,W+.6,.65,D+.6,0,sd);vB('vStone',-1.8,0,zf+.62,1.9,.3,.6,0,sd);
 vnBody('vStone',0,Y0,0,W,H1,D,0,st,{t:.35});vnBand('vStone',0,Y0+H1,0,W+.3,.3,D+.3,0,sd,.5);
 vnBody('vPlaster',0,Y0+H1+.3,0,W,H2,D,0,pl,{t:.35});
 for(const sx of[-1,1])for(const sz of[-1,1])vPst('vPost',sx*(W/2-.02),Y0+H1+.3,sz*(D/2-.02),.15,H2,wood);
 const top=vnCornice('vWood',0,Y0+H1+.3+H2,0,W,D,0,trim,2);
 vnHipRoof('vHipS',0,top,0,W,D,2.6,0,vC(vPick([0x8a6a4a,0x7a5a3e,0x9a7a56])),1.2);
 // the reading front: the shop door, its window, a deco strip in stone, the workroom's shuttered window
 vnDoor(-1.8,Y0,zf,0,1.2,2.3,'vStone',st,trim);vnWin(-3.6,Y0+.6,zf,0,1.0,1.9,'open','vStone',st,false);
 vnStrip(.5,Y0+.3,zf,0,.5,2.8,'vStone',sd);vnWin(2.7,Y0+.6,zf,0,1.6,1.9,'open','vWood',trim,true);
 vB('vStone',0,Y0+2.95,zf+.05,W-.4,.22,.2,0,vC(vPick(VPAL.orange)));   // a carved orange lintel band
 for(const s of[-1,1])for(const z of[-1.8,1.8])if(!(s>0&&z<0))vnWin(s*W/2,Y0+.9,z,s*Math.PI/2,1.0,1.5,'open','vWood',trim,true);
 vnWin(-2.4,Y0+1.1,zb,Math.PI,1.1,1.3,'shut','vWood',wood);vnWin(2.2,Y0+1.1,zb,Math.PI,1.1,1.3,'open','vWood',wood,true);
 // the scribe's rooms above: windows either side of a deco strip, more round the sides and back
 for(const x of[-2.7,2.7])vnWin(x,Y0+H1+1.0,zf,0,1.1,1.4,'open','vWood',trim,true);vnStrip(0,Y0+H1+.6,zf,0,.8,2.1,'vWood',trim);
 for(const s of[-1,1])vnWin(s*W/2,Y0+H1+1.0,s<0?0:1.4,s*Math.PI/2,1.0,1.3,'open','vWood',wood,true);
 for(const x of[-2.4,2.4])vnWin(x,Y0+H1+1.0,zb,Math.PI,1.0,1.2,x<0?'open':'shut','vWood',wood,x<0);
 // the awning over the front, the book stall table under it, a lectern with an open manuscript, a reading bench
 vnAwning(0,3.0,zf,0,9.0,1.8,vC(vPick(VPAL.awning)));
 {const tx=-3.6,tz=zf+1.05;vB('vWood',tx,.78,tz,1.9,.06,.75,0,wood);for(const sx of[-1,1])for(const sz of[-1,1])vB('vWood',tx+sx*.85,0,tz+sz*.3,.07,.78,.07,0,wood);
  vclBooks(tx-.9,tx+.1,.84,tz-.2,0,.2);for(let k=0;k<5;k++)vB('vPanelB',tx+.35+rr(-.15,.25),.84+(k%3)*.04,tz+.1+rr(-.1,.1),rr(.2,.28),.035,rr(.26,.32),rr(-.4,.4),vC(vPick(VCL_BOOK)));
  vB('vPanelB',tx+.55,.84,tz-.22,.32,.02,.24,.2,vC(0xe8e4dc));vB('vPanelB',tx-.3,.84,tz+.2,.28,.02,.22,-.3,vC(0xd8d8d0));   // salvaged Ancient slates
  vnCrate(tx,0,tz-.05,.55,.1,wood);vB('vPlaster',tx,.44,tz-.05,.4,.08,.36,.1,vC(0xe8dcc0));}
 {const lx=4.0,lz=zf+.9;vPst('vPost',lx,0,lz,.05,1.05,wood);kput('vWood',[lx,1.12,lz],vQ(0,-.5,0),[.6,.04,.45],wood);
  kput('vPlateW',[lx-.13,1.15,lz],vQ(0,-.5-Math.PI/2,0).multiply(qEuler(0,0,.08)),[.26,.36,1],vC(0xf0e6cc));kput('vPlateW',[lx+.13,1.15,lz],vQ(0,-.5-Math.PI/2,0).multiply(qEuler(0,0,-.08)),[.26,.36,1],vC(0xe8dcc0));}
 vB('vWood',2.5,0,zf+.5,2.0,.45,.45,0,wood);
 vnSign(-W/2+.3,Y0+3.3,zf,0,vC(0x2a4d80));vnPlanter(-W/2-.5,0,zf-.4,.9,.6,0,wood);
 // the press shed on +x: a lean-to off the stone wall, the screw press, sheets on drying lines, the paper store's table
 {const SX=W/2+1.5,SZ=-.3;vnShedRoof(SX,2.75,SZ,4.8,3.0,.8,Math.PI/2,'vShingleB',vC(0x8a6a4a),.4,.12);
  for(const z of[-2.5,-.3,1.9])vPst('vPost',W/2+2.9,0,z,.1,2.78,wood);vB('vWood',W/2+2.9,2.65,SZ,.2,.18,4.8,0,wood);
  vB('vStone',SX,0,SZ,3.0,.08,4.8,0,sd);
  vnDoor(W/2,Y0,-1.6,Math.PI/2,.95,2.2,'vWood',wood,vC(0x5a3a24),false);
  vclPress(SX+.2,-.8,Math.PI/2,wood);
  for(const x of[SX-.6,SX+.6])vclPaperLine(x,2.4,SZ,Math.PI/2,4.2);
  vB('vWood',SX,0,1.4,1.4,.82,.7,0,wood);vB('vPlaster',SX,.82,1.4,.7,.2,.5,.1,vC(0xe8dcc0));vB('vPlaster',SX+.3,1.02,1.45,.6,.12,.45,-.2,vC(0xddd0b4));}
 // the back: a yard of crates of salvaged manuscripts under a ghost-panel lid, the water butt
 vnCrate(-2.6,0,zb-.9,.8,.2,wood);vB('vPanelB',-2.6,.66,zb-.9,.9,.05,.8,.25,vC(0xe0e0d8));vnCrate(-1.5,0,zb-1.0,.7,-.3,wood);
 vnWaterButt(2.8,0,zb-.7,.42,1.1);vnBarrel(3.8,0,zb-.6,.36,.9,wood);
 vnPaving(-1,.02,zf+2.0,W+1,1.6,0,sd,8);vnFolk(-1.5,zf+3.4,3,1.5);}

VERN.def({key:'vern_weaver',name:'Weaver and dyer\'s house',family:'trade',tags:{type:['industry','market/shop','single-family dwelling'],wealth:'middle',lit:false,role:'weaver',job:'weaving'},w:15,d:19,h:12,build:buildVernWeaver});
VERN.def({key:'vern_tannery',name:'Tannery',family:'trade',tags:{type:['industry'],wealth:'poor',lit:false,role:'tannery',job:'tanning'},w:21,d:16,h:7,build:buildVernTannery});
VERN.def({key:'vern_tailor',name:'Tailor and clothier',family:'trade',tags:{type:['market/shop','single-family dwelling'],wealth:'middle',lit:false,role:'tailor'},w:10,d:15,h:12,build:buildVernTailor});
VERN.def({key:'vern_scribe',name:'Scribe and bookseller',family:'trade',tags:{type:['market/shop','single-family dwelling'],wealth:'middle',lit:false,role:'scribe'},w:15,d:13,h:12,build:buildVernScribe});
