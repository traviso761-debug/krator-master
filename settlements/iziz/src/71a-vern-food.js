// ================================================================= IZIZ VERNACULAR — the food trades (the trades round, 2026-10-16)
// The bakery, the butcher's shop and smokehouse, the brewery and the provisioner, after Voth's census trades
// (voth_bldg_bakery / _butcher / _brewery, voth_shop_provisioner). Middle-class plaster and timber on the same street as
// the shop row and the tavern; no electric light (the oven and the smoke are fire). Every enclosed body is a vnBody, so
// with interiors on its rooms are the trade's (kits/interiors/sets/iziz.js, the food-trades block). Seeds 8101-8199.

// ---------------------------------------------------------------- props
// a log (or any cylinder item) lying from a to b, local points: the kit's cylinders stand on their base, so it is centred on a
function vfdLog(a,b,r,c,item){const h=[(b[0]-a[0])/2,(b[1]-a[1])/2,(b[2]-a[2])/2];beam(item||'vPost',[a[0]-h[0],a[1]-h[1],a[2]-h[2]],[a[0]+h[0],a[1]+h[1],a[2]+h[2]],r,r,c||null);}
// a stacked woodpile, the logs running along local z (their ends to the street), n logs in the bottom course
function vfdWoodpile(x,y,z,ry,L,n,rows){for(let k=0;k<rows;k++)for(let i=0;i<n-k;i++){const lx=(i-(n-k-1)/2)*.24,yy=y+.11+k*.2,e=rr(-.12,.12);
 const a=loc(x,z,lx,-L/2+e,ry),b=loc(x,z,lx,L/2+e,ry);vfdLog([a[0],yy,a[1]],[b[0],yy,b[1]],rr(.09,.12),vC(vPick([0x8a6a48,0x7a5a3a,0x9a7a52,0x6a4e34])));}}
// loaves on a counter or tray: n crusty ovals over w x d
function vfdLoaves(x,y,z,w,d,n){for(let i=0;i<n;i++)kput('vGourd',[x+rr(-w/2,w/2),y+.06,z+rr(-d/2,d/2)],qEuler(0,rr(0,TAU),0),[rr(.09,.12),rr(.06,.08),rr(.14,.2)],vC(vPick([0xffd8a0,0xf0c080,0xffe0b0])));}
// a joint of meat on an iron hook, hanging from y
function vfdMeat(x,y,z,s){s=s||1;vB('vIron',x,y-.16,z,.025,.16,.025,0,vC(0x2e2a26));kput('vGourd',[x,y-.16-.24*s,z],qEuler(0,rr(0,TAU),rr(-.1,.1)),[.12*s,.26*s,.1*s],vC(vPick([0xff9a8a,0xf08878,0xffb0a0,0xd87868])));}
// an unlit oil lantern hanging from y (goods, not light: the middle class has no electric)
function vfdLantern(x,y,z){vB('vIron',x,y-.3,z,.02,.3,.02,0,vC(0x2e2a26));vB('vIron',x,y-.34,z,.2,.04,.2,0,vC(0x2e2a26));vB('vWinGlass',x,y-.56,z,.14,.22,.14);vB('vIron',x,y-.6,z,.2,.05,.2,0,vC(0x2e2a26));}
// a coil of rope lying flat (n turns), or standing against a wall when ry is given (the coil's face to ry)
function vfdCoil(x,y,z,r,n,ry){const c=vC(vPick([0xe8d0a0,0xd8c090,0xf0d8b0]));for(let k=0;k<n;k++){
 if(ry==null)vBq('vHoop',x,y+.05+k*.075,z,r-k*.015,r-k*.015,1.3,qEuler(Math.PI/2,0,0),c);else{const p=loc(x,z,0,.05+k*.06,ry);vBq('vHoop',p[0],y,p[1],r-k*.02,r-k*.02,1.3,qEuler(0,ry,0),c);}}}
// a barrel lying with its ends to local z, on two chocks, hooped
function vfdCask(x,y,z,r,L,ry,c){const a=loc(x,z,0,-L/2,ry),b=loc(x,z,0,L/2,ry);vfdLog([a[0],y+r,a[1]],[b[0],y+r,b[1]],r,c,'vBarrel');
 for(const t of[-.3,.3]){const p=loc(x,z,0,t*L,ry);vBq('vHoop',p[0],y+r,p[1],r*1.04,r*1.04,1,qEuler(0,ry,0),vC(0x2e2a26));}}

// ---------------------------------------------------------------- the bakery: the family over the bakehouse, the oven bulging from the side
function buildVernBakery(G,o){reseed(8101+(o.v|0));const W=10,D=8,H1=3.3,H2=2.9,Y0=.4,Y2=Y0+H1+.3,zf=D/2;
 const wood=vC(vPick(VPAL.woodMid)),pl=vC(vPick(VPAL.sand)),tr=vC(vPick(VPAL.trim)),brick=vC(vPick([0xb8643e,0xa85a36,0xc0704a]));
 vnReg('Bakery (middle)',.8,0,8.8,11);
 vB('vStone',0,-.1,0,W+.5,.5,D+.5,0,vC(vPick(VPAL.stoneDark)));
 vnBody('vPlaster',0,Y0,0,W,H1,D,0,pl,{t:.3});vnBand('vWood',0,Y0+H1,0,W+.34,.3,D+.34,0,wood,.47);vnBody('vPlaster',0,Y2,0,W,H2,D,0,pl.clone().multiplyScalar(1.04),{t:.3});
 for(const sx of[-1,1])for(const sz of[-1,1])vPst('vPost',sx*(W/2-.02),Y0,sz*(D/2-.02),.17,H1+H2+.32,wood);
 const top=vnCornice('vWood',0,Y2+H2,0,W,D,0,wood,2);
 vnGableRoof(0,top,0,W,D,2.5,0,'vGableC',null,1.0,'vGablePl',pl,.16);
 // the shop front (-x half): the street door, the counter hatch over a board counter of loaves, the orange awning, the sign
 vnDoor(-4.0,Y0,zf,0,1.0,2.2,'vWood',tr,vC(0x6a4a30));
 vnWin(-1.5,Y0+.95,zf,0,2.4,1.45,'open','vWood',tr);
 vB('vWood',-1.5,Y0,zf+.32,2.9,.92,.62,0,wood);vB('vWood',-1.5,Y0+.92,zf+.3,3.1,.07,.8,0,wood.clone().multiplyScalar(.8));
 vfdLoaves(-2.3,Y0+.99,zf+.3,1.1,.5,7);for(const x of[-.9,-.2]){vPst('vStave',x,Y0+.99,zf+.32,.2,.18,vC(0xc8a060));vfdLoaves(x,Y0+1.1,zf+.32,.22,.22,3);}   // loaves and two baskets
 vnAwning(-1.5,Y0+2.85,zf,0,3.8,1.6,vC(0xe07a2a));vnSign(-W/2+.3,Y0+3.05,zf,0,vC(0xe0a030));
 vnWin(2.8,Y0+1.1,zf,0,1.4,1.3,'open','vWood',tr,true);                                      // the bakehouse window
 // upper floor: the household's shuttered windows and a deco strip between them; windows on every side
 vnWin(-3.0,Y2+.9,zf,0,1.1,1.25,'open','vWood',tr,true);vnWin(3.0,Y2+.9,zf,0,1.1,1.25,'open','vWood',tr,true);vnStrip(0,Y2+.55,zf,0,.7,2.0,'vWood',wood);
 for(const z of[-1.8,1.8]){vnWin(-W/2,Y0+1.2,z,-Math.PI/2,1.1,1.2,'open','vWood',tr,true);vnWin(-W/2,Y2+.9,z,-Math.PI/2,1.0,1.15,z>0?'open':'shut','vWood',tr,true);}
 vnWin(W/2,Y0+1.2,2.5,Math.PI/2,1.1,1.2,'open','vWood',tr,true);vnWin(W/2,Y2+.9,1.6,Math.PI/2,1.0,1.15,'open','vWood',tr,true);vnWin(W/2,Y2+.9,-2.0,Math.PI/2,1.0,1.15,'shut','vWood',tr);
 vnDoor(2.8,Y0,-zf,Math.PI,1.0,2.1,'vWood',tr,vC(0x5a3a24));vnWin(-2.4,Y0+1.2,-zf,Math.PI,1.1,1.1,'shut','vWood',tr);
 vnWin(-2.6,Y2+.9,-zf,Math.PI,1.0,1.1,'open','vWood',tr,true);vnWin(2.6,Y2+.9,-zf,Math.PI,1.0,1.1,'shut','vWood',tr);
 // the bread oven: a brick dome on a clay base bulging from the +x wall, an iron ash door, its salvage-pipe flue strapped up past the eave
 {const ox=W/2+1.05,oz=-1.4;vB('vClayB',ox,0,oz,2.1,1.05,2.5,0,vC(0xf0c8a8));vB('vStone',ox,1.0,oz,2.3,.12,2.7,0,vC(vPick(VPAL.stoneDark)));
  kput('vDomeP',[ox-.1,1.1,oz],null,[1.05,1.05,1.2],brick);vB('vClayB',ox-.1,1.08,oz,2.1,.14,2.4,0,vC(0xe0b090));   // the dome and its ring course
  vB('vIron',ox+1.06,.2,oz,.05,.55,.8,0,vC(0x2e2a26));vB('vDarkB',ox+1.07,.3,oz,.04,.32,.5,0);                    // the ash door
  vnChimney(ox+.35,1.9,oz,7.8,.15,true);for(const y of[4.6,7.2])vB('vIron',(W/2+ox+.35)/2,y,oz,ox+.35-W/2,.06,.08,0,vC(0x2e2a26));
  for(let k=0;k<3;k++)kput('vSheet',[ox-.2+k*.4,1.9+k*.5,oz+rr(-.4,.4)],vQ(Math.PI/2,0,0),[.5,.5,1],vC(0x3a3430));   // soot on the dome's crown
  // the lean-to over oven and woodpile, the woodpile, the chopping block, the peel against the oven
  vnShedRoof(W/2+1.95,2.95,.5,5.8,2.6,.55,Math.PI/2,'vCorr',null,.35,.1);
  for(const z of[-2.3,3.3])vPst('vPost',W/2+3.5,0,z,.1,3.0,wood);vB('vWood',W/2+3.5,2.85,.5,.16,.16,5.8,0,wood);
  vfdWoodpile(W/2+1.6,0,2.0,0,1.6,7,4);vPst('vStave',W/2+3.0,0,3.9,.28,.55,vC(0x7a5a3a));
  vBeam([W/2+3.0,.55,3.9],[W/2+3.25,1.05,4.05],.04,vC(0x6a4a30));vB('vIron',W/2+3.0,.5,3.88,.04,.14,.22,0,vC(0x3a3430));
  vBeam([ox+1.25,0,oz+1.2],[ox+1.05,2.4,oz+1.1],.04,vC(0x9a7a56));vB('vWood',ox+1.06,2.2,oz+1.1,.32,.42,.03,0,vC(0x9a7a56));}
 // the -x side: a cooling rack of bread trays under a cloth hood; the back: flour sacks, a water butt, a barrel
 {const x=-W/2-.75,z=1.2;for(const sx of[-1,1])for(const sz of[-1,1])vPst('vPost',x+sx*.45,0,z+sz*.7,.04,2.2,wood);
  for(let k=0;k<4;k++){vB('vWood',x,.5+k*.42,z,1.0,.04,1.5,0,wood);vfdLoaves(x,.54+k*.42,z,.8,1.2,6);}kput('vClothB',[x,2.25,z],vQ(-Math.PI/2,.25,0),[1.8,.05,1.4],vC(0xf2a24a));}
 vnSacks(1.6,0,-zf-.8,5);vnWaterButt(4.2,0,-zf-.7,.42,1.1);vnBarrel(-4.2,0,-zf-.6,.38,.9,wood);vnCrate(-3.2,0,-zf-.7,.7,.3,wood);
 vnPlanter(-W/2-.2,0,zf+.9,1.2,.6,0,wood);vnPaving(-.5,.02,zf+2.6,W+1,2.4,0,vC(vPick(VPAL.stoneDark)),11);vnFolk(-1,zf+3.6,3,2);}

// ---------------------------------------------------------------- the butcher: the open meat shop under its deep eave, the smokehouse, the cottage behind
function buildVernButcher(G,o){reseed(8111+(o.v|0));const SX=-2.4,SZ=1.0,W=7.6,D=6.4,H=3.2,Y0=.35,zf=SZ+D/2,zb=SZ-D/2;
 const CX=-2.4,CZ=-5.4,CW=7.0,CD=4.4,CH=2.9,KX=4.6,KZ=-1.4,KW=3.6,KD=3.6,KH=4.2,KY=.15;
 const wood=vC(vPick(VPAL.woodMid)),pl=vC(vPick(VPAL.adobe)),pl2=vC(vPick(VPAL.sand)),tr=vC(vPick(VPAL.trim)),smk=vC(vPick([0x5a4838,0x4e3e30,0x62503e])),sh=vC(vPick([0x8a6a4a,0x7a5a3e]));
 vnReg('Butcher\'s shop and smokehouse (middle)',0,-1,9.5,7.5);
 // the shop: plaster on a stone plinth, the meat hatch across most of the front, the door at its +x end
 vB('vStone',SX,-.1,SZ,W+.4,.45,D+.4,0,vC(vPick(VPAL.stoneDark)));
 vnBody('vPlaster',SX,Y0,SZ,W,H,D,0,pl,{t:.25});
 for(const sx of[-1,1])for(const sz of[-1,1])vPst('vPost',SX+sx*(W/2-.02),Y0,SZ+sz*(D/2-.02),.16,H+.1,wood);
 const top=vnCornice('vWood',SX,Y0+H,SZ,W,D,0,wood,1);
 vnGableRoof(SX,top,SZ,W,D,2.0,0,'vGableC',null,.9,'vGablePl',pl,.16);
 vnWin(-3.1,Y0+.9,zf,0,4.2,1.55,'open','vWood',tr);vnDoor(.35,Y0,zf,0,1.0,2.2,'vWood',tr,vC(0x6a4a30));
 vB('vWood',-3.1,Y0,zf+.34,4.6,.9,.64,0,wood);vB('vStone',-3.1,Y0+.9,zf+.32,4.8,.08,.8,0,vC(0xd8d0c4));          // the counter, a pale slab on it
 for(let k=0;k<5;k++)kput('vGourd',[-4.8+k*.8+rr(-.1,.1),Y0+1.03,zf+.32],qEuler(0,rr(0,TAU),Math.PI/2),[.1,.2,.09],vC(vPick([0xff9a8a,0xf08878,0xd87868])));
 // the deep eave over the counter on three posts, the hook rail with its joints, the block and its cleaver
 vnShedRoof(SX,Y0+2.8,zf+1.15,W+.4,2.3,.4,0,'vCorr',null,.25,.1);
 for(const x of[SX-W/2,SX,SX+W/2])vPst('vPost',x,0,zf+2.2,.1,Y0+2.85,wood);vB('vWood',SX,Y0+2.7,zf+2.2,W+.3,.16,.16,0,wood);
 vB('vIron',-3.1,Y0+2.5,zf+1.0,4.6,.05,.05,0,vC(0x2e2a26));for(const x of[-5.2,-1.0])vBeam([x,Y0+2.5,zf+1.0],[x,Y0+2.95,zf+.05],.04,vC(0x2e2a26),'vIron');
 for(let k=0;k<9;k++){const x=-5.0+k*.48;if(rng()<.8)vfdMeat(x,Y0+2.5,zf+1.0,rr(.8,1.25));else vB('vIron',x,Y0+2.34,zf+1.0,.025,.16,.025,0,vC(0x2e2a26));}
 vPst('vStave',SX-W/2+.6,0,zf+1.1,.4,.85,vC(0x7a5838));vB('vIron',SX-W/2+.6,.85,zf+1.1,.03,.16,.24,0,vC(0x8a8a8a));vB('vWood',SX-W/2+.6,1.01,zf+1.1,.04,.05,.18,0,vC(0x4a3424));
 vnSign(SX+W/2-.2,Y0+3.0,zf,0,vC(0xc9442a));
 // the shop's sides and back: windows, the yard door into the passage
 vnWin(SX-W/2,Y0+1.2,SZ,-Math.PI/2,1.1,1.1,'open','vWood',tr,true);vnWin(SX+W/2,Y0+1.2,SZ+.4,Math.PI/2,1.0,1.1,'shut','vWood',tr);
 vnDoor(-.9,Y0,zb,Math.PI,.95,2.1,'vWood',tr,vC(0x5a3a24),false);vnWin(-4.2,Y0+1.3,zb,Math.PI,1.0,1.0,'shut','vWood',tr);
 for(const x of[-4.4,-1.6,1.2])vnStrip(x+.3,top+.25,zf,0,.5,1.1,'vWood',wood);
 // the butcher's cottage behind, across a narrow passage: plaster under a shingle hip, entered from the -x side
 vB('vStone',CX,-.1,CZ,CW+.4,.45,CD+.4,0,vC(vPick(VPAL.stoneDark)));
 vnBody('vPlaster',CX,Y0,CZ,CW,CH,CD,0,pl2,{t:.25});vnCornice('vWood',CX,Y0+CH,CZ,CW,CD,0,wood,1,false);
 vnHipRoof('vHipS',CX,Y0+CH+.32,CZ,CW,CD,1.8,0,sh,.75);
 vnDoor(CX-CW/2,Y0,CZ,-Math.PI/2,.95,2.1,'vWood',tr,vC(0x6a4a30));vnWin(CX-CW/2,Y0+1.1,CZ-1.2,-Math.PI/2,.8,.9,'open','vWood',tr,true);
 for(const x of[-4.4,-.4])vnWin(x,Y0+1.1,CZ-CD/2,Math.PI,1.0,1.0,'open','vWood',tr,true);vnWin(CX+CW/2,Y0+1.1,CZ,Math.PI/2,1.0,1.0,'shut','vWood',tr);
 vnWin(CX+1.6,Y0+1.5,CZ+CD/2,0,.8,.6,'open','vWood',tr);vnChimney(CX+2.2,Y0+CH+.8,CZ-.5,2.4,.13,true);
 vnDryingRack(CX-CW/2-1.4,0,CZ+.4,Math.PI/2,2.8);vnWaterButt(CX+CW/2+.6,0,CZ-1.2,.4,1.0);
 // the smokehouse: a tall closed shed of smoke-dark boards, slatted vents on two faces with the meat racks seen through them,
 // a firebox at the back feeding it, a vent cap over the ridge
 vB('vStone',KX,-.1,KZ,KW+.3,.25,KD+.3,0,vC(0x8a7a68));
 vnBody('vWood',KX,KY,KZ,KW,KH,KD,0,smk,{t:.15});
 for(const sx of[-1,1])for(const sz of[-1,1])vPst('vPost',KX+sx*(KW/2-.02),KY,KZ+sz*(KD/2-.02),.12,KH+.05,wood);
 vnWin(KX,KY+2.75,KZ+KD/2,0,2.6,1.05,'open','vWood',smk);vnWin(KX+KW/2,KY+2.75,KZ,Math.PI/2,2.6,1.05,'open','vWood',smk);
 for(let i=0;i<9;i++){const u=-1.2+i*.3;vB('vWood',KX+u,KY+2.75,KZ+KD/2+.04,.13,1.05,.05,0,smk);vB('vWood',KX+KW/2+.04,KY+2.75,KZ-u,.05,1.05,.13,0,smk);}
 for(const z of[KZ-.7,KZ+.6]){vB('vWood',KX,KY+3.55,z,KW-.3,.08,.08,0,smk);for(let k=0;k<6;k++)vfdMeat(KX-1.25+k*.5+rr(-.05,.05),KY+3.55,z,rr(.9,1.4));}
 for(let k=0;k<7;k++)vPst('vRope',KX-1.2+k*.4,KY+3.0,KZ+1.25,.035,.5,vC(0xb06050));   // sausage strings
 vnDoor(KX-.6,KY,KZ+KD/2,0,.95,2.05,'vWood',smk,vC(0x3a2e24));
 vnPatch(KX-KW/2,KY,KZ,-Math.PI/2,KD,KH,2);
 vnGableRoof(KX,KY+KH,KZ,KW,KD,1.4,0,'vGableC',null,.45,'vGableW',smk,.12);
 for(const sx of[-1,1])for(const sz of[-1,1])vPst('vPost',KX+sx*.8,KY+KH+1.3,KZ+sz*.35,.04,.4,smk);
 vnGableRoof(KX,KY+KH+1.68,KZ,2.0,1.0,.32,0,'vGableC',null,.15,null,null,.07);
 vB('vClayB',KX+.7,0,KZ-KD/2-.5,1.1,.8,.9,0,vC(0xd8a888));vB('vIron',KX+.7,.15,KZ-KD/2-.96,.5,.4,.04,0,vC(0x2e2a26));
 vfdLog([KX+.7,.6,KZ-KD/2-.4],[KX+.7,.6,KZ-KD/2+.05],.12,null,'vPipeR');vnChimney(KX+.95,.8,KZ-KD/2-.6,1.4,.08,true);
 vfdWoodpile(KX+KW/2+.6,0,KZ-.6,0,2.2,4,3);
 // the yard between: brine barrels, a crate of salt, the scales
 vnBarrel(1.9,0,zf-1.0,.38,.95,wood);vnBarrel(2.2,0,zf-1.9,.36,.9,wood);vnCrate(2.2,0,zf+.2,.7,.2,wood);vnSacks(2.3,0,-3.8,3);
 vnPaving(-1.2,.02,zf+3.2,W+4,2.2,0,vC(vPick(VPAL.stoneDark)),11);vnFolk(-2.6,zf+4.2,3,2);}

// ---------------------------------------------------------------- the brewery: the long brewhouse, its tun loft, copper kettle stack, taproom and barrel yard
function buildVernBrewery(G,o){reseed(8121+(o.v|0));const HX=-.8,W=15,D=8,H=4.2,Y0=.4,zf=D/2,xl=HX-W/2,xr=HX+W/2;
 const wood=vC(vPick(VPAL.woodMid)),pl=vC(vPick(VPAL.sand)),tr=vC(vPick(VPAL.trim)),sh=vC(vPick([0x8a6a4a,0x6a4e38,0x9a7a56])),cu=vC(0xc8e0d0);
 vnReg('Brewery (middle)',0,0,11,13);
 vB('vStone',HX,-.1,0,W+.6,.5,D+.6,0,vC(vPick(VPAL.stoneDark)));
 vnBody('vPlaster',HX,Y0,0,W,H,D,0,pl,{t:.3});vnFrame(HX,Y0,0,W+.1,H,D+.1,0,wood,.16);
 const top=vnCornice('vWood',HX,Y0+H,0,W,D,0,wood,1);
 vnGableRoof(HX,top,0,W,D,3.0,0,'vGableS',sh,1.1,'vGableW',wood,.2);
 // the tun loft: a boarded tower over the brewing floor, louvred on both long faces, its own cross gable
 {const LX=HX+3.0,LW=5.0,LD=5.6,LH=4.6;vB('vWood',LX,top-.1,0,LW,LH,LD,0,wood.clone().multiplyScalar(.82));
  for(const sx of[-1,1])for(const sz of[-1,1])vPst('vPost',LX+sx*(LW/2-.02),top-.1,sz*(LD/2-.02),.13,LH,wood);
  for(const s of[-1,1]){const z=s*LD/2;vB('vDarkB',LX,top+2.3,z+s*.03,LW-1.2,1.9,.1,0);
   for(let k=0;k<7;k++)kput('vWood',[LX,top+2.42+k*.26,z+s*.12],vQ(0,s*-.55,0),[LW-1.0,.05,.26],wood);}
  vnGableRoof(LX,top+LH-.1,0,LD,LW,1.6,Math.PI/2,'vGableS',sh,.6,'vGableW',wood,.18);}
 // the copper kettle stack: the kettle's verdigris hood breaking the back slope, its stack, the rain cap on stays
 {const x=HX-2.4,z=-1.6;vPst('vPipeC',x,top+1.3,z,.8,1.0,cu);kput('vDomeC',[x,top+2.3,z],null,[.8,.55,.8],cu);
  vPst('vPipeC',x,top+2.6,z,.26,4.4,cu);for(const y of[top+3.6,top+5.2])vBq('vHoop',x,y,z,.28,.28,1.5,qEuler(Math.PI/2,0,0),vC(0x2e2a26));
  kput('vConeC',[x,top+7.25,z],null,[.62,.45,.62],cu);for(let k=0;k<3;k++){const a=k*TAU/3;vB('vIron',x+Math.cos(a)*.27,top+7.0,z+Math.sin(a)*.27,.04,.3,.04,0,vC(0x2e2a26));}}
 // the front: the taproom (-x) under its veranda, the cart door to the brewing floor, the store's window
 {const TX=xl+3.0;vnVeranda(TX,0,zf+1.2,6.0,2.4,0,Y0,3.1,wood,tr);vnShedRoof(TX,Y0+3.1,zf+1.2,6.0,2.4,.5,0,'vShingleB',sh,.4,.14);
  for(const s of[-1,1])vB('vWood',TX+s*1.7,Y0,zf+.45,1.8,.45,.42,0,wood);vnBarrel(TX+.2,Y0,zf+1.5,.36,.8,wood);
  for(const x of[-.12,.12])vPst('vStave',TX+.2+x,Y0+.8,zf+1.5+x,.06,.16,vC(0x9a6a42));}
 vnDoor(-4.55,Y0,zf,0,1.1,2.3,'vWood',tr,vC(0x5a3a24),false);
 vnWin(-7.07,Y0+1.1,zf,0,1.3,1.3,'open','vWood',tr,true);vnWin(-2.05,Y0+1.1,zf,0,1.3,1.3,'open','vWood',tr,true);
 vnDoor(.45,Y0,zf,0,1.7,2.6,'vWood',wood,vC(0x6a4a30));vnWin(2.95,Y0+1.2,zf,0,1.3,1.3,'open','vWood',tr,true);vnWin(5.45,Y0+1.2,zf,0,1.2,1.2,'shut','vWood',tr);
 vnSign(-1.85,Y0+3.75,zf,0,vC(0xc9442a));vnAwning(2.95,Y0+3.0,zf,0,2.0,1.1,vC(0xe07a2a));
 vnWin(xl,Y0+1.2,0,-Math.PI/2,1.2,1.3,'open','vWood',tr,true);vnBannerPole(xl-.9,0,zf+.6,0,6.2,vC(0xe07a2a));
 vnDoor(xr,Y0,-2.7,Math.PI/2,1.2,2.3,'vWood',tr,vC(0x5a3a24));vnWin(xr,Y0+1.3,0,Math.PI/2,1.1,1.1,'shut','vWood',tr);vnWin(xr,Y0+1.3,2.7,Math.PI/2,1.1,1.1,'open','vWood',tr,true);
 vnDoor(5.45,Y0,-zf,Math.PI,1.0,2.2,'vWood',tr,vC(0x5a3a24));for(const x of[-7.07,-4.55,-2.05,.45,2.95])vnWin(x,Y0+1.4,-zf,Math.PI,1.2,1.1,x<-3?'open':'shut','vWood',tr,x<-3);
 // the barrel yard (+x): two racked pyramids of casks, ends to the street, and standing barrels behind
 for(const z0 of[.95,2.15]){let n=3;for(let r=0;r<3;r++,n--)for(let i=0;i<n;i++)vfdCask(xr+1.6+(i-(n-1)/2)*.84,r*.7,z0,.4,1.0,0,vC(vPick(VPAL.woodMid)));
  for(const x of[xr+.75,xr+2.45])vB('vWood',x,0,z0,.2,.16,1.1,0,wood);}
 for(let k=0;k<4;k++)vnBarrel(xr+1.0+(k%2)*.95,0,-3.4+(k>>1)*.95,.4,1.0,wood);vnBarrel(xr+1.5,1.0,-2.95,.38,.95,wood);
 // the back: the malt-drying rack, two tiers of slatted trays of spread malt; sacks, a water butt
 {const x=-4.0,z=-zf-1.5,L=5.0;for(const sx of[-1,0,1])for(const sz of[-1,1])vPst('vPost',x+sx*L/2,0,z+sz*.75,.06,1.9,wood);
  for(const y of[.7,1.5]){vB('vWood',x,y,z,L+.2,.06,1.7,0,wood);vB('vPlaster',x,y+.06,z,L-.1,.05,1.5,0,vC(vPick([0xd8b070,0xc89e5a,0xe0c080])));
   for(let k=0;k<6;k++)vB('vWood',x,y+.04,z-.75+k*.3,L+.2,.03,.04,0,wood);}
  vBeam([x+L/2+.4,0,z+.9],[x+L/2+.1,1.8,z+.5],.03,vC(0x9a7a56));}
 vnSacks(2.2,0,-zf-1.0,6);vnWaterButt(-.4,0,-zf-.7,.45,1.2);vnCrate(3.8,0,-zf-.8,.8,.2,wood);
 vnPaving(-2,.02,zf+3.3,12,2.0,0,vC(vPick(VPAL.stoneDark)),12);vnFolk(-3,zf+4.2,4,2.4);}

// ---------------------------------------------------------------- the provisioner: the caravan outfitter's two storeys, its veranda of goods and the hoist
function buildVernProvisioner(G,o){reseed(8131+(o.v|0));const W=10,D=8.4,H1=3.4,H2=3.0,Y0=.5,Y2=Y0+H1+.3,zf=D/2;
 const wood=vC(vPick(VPAL.woodMid)),pl=vC(vPick(VPAL.adobe)),pl2=vC(vPick(VPAL.sand)),tr=vC(vPick(VPAL.trim));
 vnReg('Provisioner (middle)',0,0,8.5,12);
 vB('vStone',0,-.1,0,W+.5,.6,D+.5,0,vC(vPick(VPAL.stoneDark)));
 vnBody('vPlaster',0,Y0,0,W,H1,D,0,pl,{t:.3});vnBand('vWood',0,Y0+H1,0,W+.34,.3,D+.34,0,wood,.47);vnBody('vPlaster',0,Y2,0,W,H2,D,0,pl2,{t:.3});
 for(const sx of[-1,1])for(const sz of[-1,1])vPst('vPost',sx*(W/2-.02),Y0,sz*(D/2-.02),.17,H1+H2+.32,wood);
 const top=vnCornice('vWood',0,Y2+H2,0,W,D,0,wood,2);
 vnGableRoof(0,top,0,D,W,3.0,Math.PI/2,'vGableC',null,1.0,'vGablePl',pl2,.16);           // the gable to the street
 vnWin(0,top+1.1,zf,0,.8,.6,'shut','vWood',tr);
 // the hoist: a beam out of the gable over the store's cart door, its block and rope, a bale on the hook; the loading door above
 vB('vWood',2.6,top+.45,zf-.3,.24,.26,2.6,0,wood);vB('vWood',2.6,top+.05,zf+.15,.2,.4,.2,0,wood);
 vBq('vHoop',2.6,top+.25,zf+.85,.16,.16,2.2,qEuler(0,Math.PI/2,0),vC(0x2e2a26));vPst('vRope',2.6,2.3,zf+.85,.025,top+.15-2.3,vC(0xd8c090));
 vB('vTarpB',2.6,1.5,zf+.85,.8,.8,.7,0,vC(0xa89070));for(const s of[-1,1])vBeam([2.6+s*.4,2.3,zf+.85],[2.6,2.6,zf+.85],.02,vC(0xd8c090),'vRope');
 vnDoor(2.6,Y2,zf,0,1.4,2.2,'vWood',tr,vC(0x6a4a30),false);vB('vWood',2.6,Y2+1.0,zf+.14,1.5,.08,.08,0,wood);
 // ground front: the shop door and window behind the veranda, the store's double cart door onto the loading platform
 vnDoor(-3.6,Y0,zf,0,1.0,2.2,'vWood',tr,vC(0x6a4a30),false);vnWin(-1.0,Y0+1.0,zf,0,1.6,1.4,'open','vWood',tr,true);
 vnDoor(2.6,Y0,zf,0,1.8,2.4,'vWood',wood,vC(0x5a3a24),false);
 vnWin(-3.4,Y2+.9,zf,0,1.1,1.25,'open','vWood',tr,true);vnWin(-.9,Y2+.9,zf,0,1.1,1.25,'open','vWood',tr,true);
 // the veranda (-x part of the front): no rail, the goods spill to the step; the loading platform (+x part) open to the hoist
 {const VX=-1.8,VW=6.4;vB('vStone',VX,-.1,zf+1.3,VW+.2,.32,2.6,0,vC(vPick(VPAL.stoneDark)));vnVeranda(VX,.2,zf+1.3,VW,2.6,0,.3,3.0,wood);
  vnShedRoof(VX,Y0+2.95,zf+1.3,VW,2.6,.5,0,'vCorr',null,.35,.1);vB('vWood',VX,.1,zf+2.8,VW,.2,.5,0,wood);
  vnAwning(-1.0,Y0+2.6,zf+2.6,0,2.6,.9,vC(vPick(VPAL.awning)));
  vnSacks(-4.3,Y0,zf+.9,6);vnCrate(-2.6,Y0,zf+.7,.8,.1,wood);vnCrate(-2.6,Y0+.64,zf+.7,.7,-.2,wood);vfdCoil(-2.6,Y0+1.2,zf+.7,.26,4);
  vfdCoil(-1.6,Y0,zf+2.0,.34,5);vfdCoil(-.9,Y0,zf+2.1,.28,4);vnBarrel(.7,Y0,zf+.6,.36,.85,wood);vnBarrel(.7,Y0,zf+1.4,.36,.85,wood);
  for(let k=0;k<3;k++)vfdLog([-4.8+k*.22,Y0,zf+2.2],[-4.6+k*.22,Y0+1.9,zf+.15],.07,vC(vPick([0x8a9a6a,0xa89070,0x6a7a5a])),'vRope');   // tarp rolls against the wall
  for(const x of[-4.0,-2.9,-1.8])vfdLantern(x,Y0+2.95,zf+2.15);for(const x of[-.6,.4])kput('vGourd',[x,Y0+2.4,zf+2.2],null,[.14,.2,.14],vC(0xffc890));}
 {const PX=3.25;vB('vWood',PX,Y0-.22,zf+1.0,3.5,.22,2.0,0,wood);vB('vStone',PX,-.1,zf+1.0,3.6,.32,2.0,0,vC(vPick(VPAL.stoneDark)));
  for(let k=0;k<2;k++)vB('vWood',PX,.0+k*.17,zf+2.2+(1-k)*.3,3.0,.17,.32,0,wood);vnCrate(4.4,Y0,zf+.9,.7,.4,wood);vnSacks(4.2,Y0,zf+1.4,2);}
 // the sides: rope coils on pegs on -x; the hitching rail, pack frames and a trough for the caravan mules on +x; the back
 for(const z of[-1.8,1.8]){vnWin(-W/2,Y0+1.2,z,-Math.PI/2,1.1,1.2,'open','vWood',tr,true);vnWin(-W/2,Y2+.9,z,-Math.PI/2,1.0,1.15,'open','vWood',tr,true);}
 for(const z of[-.45,.45])vfdCoil(-W/2,Y0+2.2,z,.3,3,-Math.PI/2);
 vnWin(W/2,Y0+1.3,-1.8,Math.PI/2,1.1,1.1,'shut','vWood',tr);for(const z of[-1.8,1.8])vnWin(W/2,Y2+.9,z,Math.PI/2,1.0,1.15,z>0?'open':'shut','vWood',tr,true);
 {const x=W/2+1.7;for(const z of[-2.4,0,2.4])vPst('vPost',x,0,z,.08,1.15,wood);vB('vWood',x,1.05,0,.12,.12,5.0,0,wood);
  vB('vWood',x-.7,0,-.6,.6,.5,2.0,0,wood);vB('vWinGlass',x-.7,.48,-.6,.5,.03,1.9,0);
  for(const z of[1.2,2.0]){vB('vWood',x+.5,0,z,.5,.7,.6,0,wood);vB('vTarpB',x+.5,.7,z,.55,.35,.65,0,vC(vPick([0x8a9a6a,0xa89070])));}}
 vnDoor(2.6,Y0,-zf,Math.PI,1.0,2.2,'vWood',tr,vC(0x5a3a24));vnWin(-2.6,Y0+1.2,-zf,Math.PI,1.1,1.1,'shut','vWood',tr);
 for(const x of[-2.6,2.6])vnWin(x,Y2+.9,-zf,Math.PI,1.0,1.1,x<0?'open':'shut','vWood',tr,x<0);
 vnCrate(-.4,0,-zf-.7,.8,.3,wood);vnCrate(.5,0,-zf-.8,.7,-.2,wood);vnWaterButt(-4.2,0,-zf-.7,.45,1.2);vnSacks(4.4,0,-zf-.9,3);
 vnPaving(0,.02,zf+3.5,W+1,1.8,0,vC(vPick(VPAL.stoneDark)),10);vnFolk(0,zf+4.4,4,2.5);}

VERN.def({key:'vern_bakery',name:'Bakery',family:'trade',tags:{type:['market/shop','single-family dwelling'],wealth:'middle',lit:false,role:'baker'},w:19,d:16,h:11,build:buildVernBakery});
VERN.def({key:'vern_butcher',name:'Butcher\'s shop and smokehouse',family:'trade',tags:{type:['market/shop','single-family dwelling'],wealth:'middle',lit:false,role:'butcher'},w:16,d:18,h:8,build:buildVernButcher});
VERN.def({key:'vern_brewery',name:'Brewery',family:'industry',tags:{type:['industry','tavern/inn'],wealth:'middle',lit:false,role:'brewer',job:'brewing'},w:21,d:16,h:13,build:buildVernBrewery});
VERN.def({key:'vern_provisioner',name:'Provisioner',family:'trade',tags:{type:['market/shop','single-family dwelling'],wealth:'middle',lit:false,role:'provisioner',job:'trading'},w:16,d:16,h:12,build:buildVernProvisioner});
