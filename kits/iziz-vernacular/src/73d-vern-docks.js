// ================================================================= 73d. HARBOUR AND DOCKS: the Ring Sea and canal maritime set
// Built for Marr (Porta Marr, kits/marr/PLAN.md) and shared across every Izani coastal and river port (Port Tobin, Pylon, Marr).
// Completes the maritime rows of VERN_TRADES (74z-vern-trades.js): coast guard, lighthouse keepers, ferrymen, dockers and
// stevedores, porters and warehousemen, customs officers, shipwrights (cordage and sail loft), and sailors' taverns.
// The water side faces +z (the front of the plot), matching 73c's boatyard and fish landing.
// Seeds 8551-8649. Helpers are vdk*.

// ---------------------------------------------------------------- dock and vessel helpers
// a timber or stone bollard with a hawser coil wrapped round its waist
function vdkBollard(x,y,z,ironC,ropeC){vPst('vPostB',x,y,z,.18,.68,ironC||vC(0x3a3632));vPst('vPostB',x,y+.56,z,.23,.12,ironC||vC(0x3a3632));
 kput('vHoop',[x,y+.22,z],qEuler(Math.PI/2,0,0),[.24,.24,1.8],ropeC||vC(0xb8a480));}

// a moored harbour lighter or cutter hull along local x (centre x,y,z, yaw ry, length L, beam B, hullC, cabin, mastH)
function vdkVessel(x,y,z,ry,L,B,hullC,trimC,mastH,lateen){if(typeof window!=='undefined'&&window.CITY)return[x,z];
 const p=(lx,lz)=>loc(x,z,lx,lz,ry);
 const wood=vC(0x7a5838),dark=vC(0x2e2620),sail=vC(0xe8dec8),rope=vC(0xb8a480);
 // main hull body + tapered bow and stern wedges
 {const q=p(0,0);vB('vWood',q[0],y,q[1],L*.64,.95,B,ry,hullC);vB('vWood',q[0],y+.88,q[1],L*.66,.14,B+.12,ry,trimC);
  vB('vWood',q[0],y+.62,q[1],L*.58,.08,B-.22,ry,wood);}
 for(const s of[-1,1]){const q=p(s*L*.38,0);kput('vGableW',[q[0],y+.48,q[1]],vQ(ry+(s>0?0:Math.PI),0,Math.PI/2),[.95,L*.18,B],hullC);
  const tip=p(s*L*.48,0);vBeam([q[0],y+.1,q[1]],[tip[0],y+1.15,tip[1]],.12,trimC);}
 // cargo hatches or cockpit well
 {const q=p(-L*.08,0);vB('vWood',q[0],y+.7,q[1],L*.26,.28,B*.58,ry,wood);
  const c=p(L*.18,0);vB('vWood',c[0],y+.7,c[1],L*.18,.65,B*.62,ry,trimC);}
 if(mastH){const m=p(-L*.04,0);vPst('vPost',m[0],y+.7,m[1],.1,mastH,wood);
  const top=[m[0],y+.7+mastH*.86,m[1]],bow=p(-L*.44,0),stern=p(L*.42,0);
  vBeam(top,[bow[0],y+1.05,bow[1]],.03,rope,'vRope');vBeam(top,[stern[0],y+1.1,stern[1]],.03,rope,'vRope');
  if(lateen){const yA=p(-L*.32,.25),yB=p(L*.28,-.25);vBeam([yA[0],y+2.2,yA[1]],[yB[0],y+.7+mastH*.92,yB[1]],.08,wood);
   const sM=p(-L*.02,0);kput('vCloth',[sM[0],y+1.9,sM[1]],vQ(ry+.12,0,-.32),[L*.52,.38,1],sail);}
  else{const yA=p(0,-B*.7),yB=p(0,B*.7);vBeam([yA[0],y+.7+mastH*.72,yA[1]],[yB[0],y+.7+mastH*.72,yB[1]],.08,wood);
   kput('vTarpB',[m[0],y+.7+mastH*.72,m[1]],vQ(ry,0,0),[.35,.32,B*1.3],sail);}}
 const b=p(0,B*.52);return b;}

// water strip along the front (+z) of a dock plot so the quay/pier reads against harbour water on the sheet
function vdkHarbourStrip(x,z0,z1,w){if(typeof window!=='undefined'&&window.CITY)return;const zc=(z0+z1)/2,d=z1-z0;
 vB('vPlaster',x,-.45,zc,w,.38,d,0,vC(0x2d5e72));vB('vWinGlass',x,-.06,zc,w-.4,.03,d-.4,0,vC(0x4a8ca4));}

// ---------------------------------------------------------------- 1. HARBOUR QUAY (middle): stone seawall, water-steps, cargo apron, capstan
function buildVernQuay(G,o){reseed(8551+(o.v|0));
 const st=vC(vPick(VPAL.stone)),stD=vC(vPick(VPAL.stoneDark)),wood=vC(vPick(VPAL.woodMid)),or=vC(vPick(VPAL.orange)),iron=vC(0x322e2a);
 vnReg('Harbour quay (middle)',0,0,12,4.5,{type:['infrastructure','trade']});
 vdkHarbourStrip(0,1.2,4.8,23.6);
 // battered ashlar quay wall along z = 1.2, stone coping, recessed water-stair in the middle
 for(const sx of[-1,1]){vB('vStone',sx*6.6,-.4,-1.8,10.4,1.5,6.0,0,st);vB('vStone',sx*6.6,1.05,1.0,10.6,.22,.65,0,stD);}
 vB('vStone',0,-.4,-3.1,2.8,1.5,3.4,0,st);
 // recessed stone water-steps descending from y = 1.05 at z = -1.4 to y = -.15 at z = 1.1
 for(let k=0;k<6;k++){vB('vStone',0,-.15+k*.2,-1.2+(5-k)*.42,2.4,.22,.46,0,stD);}
 // timber fender piles along the seawall face
 for(let x=-10.5;x<=10.5;x+=3.0){if(Math.abs(x)<1.6)continue;vPst('vPostB',x,-.45,1.38,.16,1.75,vC(0x523c28));
  vB('vIron',x,.85,1.38,.36,.1,.36,0,iron);}
 // mooring bollards and hawsers
 for(const x of[-9.2,-4.4,4.4,9.2])vdkBollard(x,1.1,0.55,iron);
 // cobbled apron behind the coping
 vnPaving(0,1.12,-1.8,22.4,4.8,0,vC(0x8e8476),24);
 // wooden capstan on the west end + stacked barrels/crates/sacks under a tarp on the east end
 {const cx=-7.4,cz=-2.0;vB('vStone',cx,1.1,cz,1.8,.18,1.8,0,stD);vPst('vStave',cx,1.28,cz,.38,.95,wood);
  vPst('vPostB',cx,2.15,cz,.48,.16,wood);
  for(let k=0;k<4;k++){const a=k*Math.PI/4;vBq('vWood',cx,2.1,cz,2.2,.09,.09,qEuler(0,a,0),wood);}}
 // small arched stone harbour-master's tally booth at x = 7.2, z = -2.4
 {const bx=7.2,bz=-2.4;vnBody('vPlaster',bx,1.1,bz,3.8,2.6,3.2,0,vC(vPick(VPAL.sand)),{t:.22});
  vB('vPlaster',bx,3.7,bz,4.1,.24,3.5,0,or);vnHipRoof('vHipC',bx,3.94,bz,3.8,3.2,1.1,0,vC(0xb85838),.25);
  vnDoor(bx-.6,1.1,bz+1.6,0,.9,2.0,'vWood',or,wood,false);vnWin(bx+.85,2.0,bz+1.6,0,.9,.95,'glass','vWood',or);}
 vnSacks(-2.8,1.1,-2.2,6);vnCrate(3.2,1.1,-2.0,.9,.2,wood);vnCrate(4.2,1.1,-1.8,.75,-.15,wood);
 for(let k=0;k<3;k++)vnBarrel(2.4+k*.75,1.1,-.6,.36,.9,wood);
 // moored cargo lighter along the east quay wall
 vdkVessel(6.2,-.15,2.9,0,8.6,2.2,vC(0x68482e),or,4.8,true);
 if(typeof window==='undefined'||!window.CITY)vBeam([4.4,1.4,.55],[3.4,.4,2.2],.035,vC(0xb8a480),'vRope');
 vnLampPost(-3.2,1.1,-.4,3.4);vnLampPost(3.2,1.1,-.4,3.4);vnFolk(0,-2.0,2,1.5);}

// ---------------------------------------------------------------- 2. TIMBER HARBOUR PIER (poor): long pile jetty, plank deck, moored boat
function buildVernPier(G,o){reseed(8561+(o.v|0));
 const wood=vC(vPick(VPAL.woodMid)),woodD=vC(0x4e3a26),st=vC(vPick(VPAL.stoneDark)),or=vC(vPick(VPAL.trim));
 vnReg('Timber harbour pier (poor)',0,0,12,5.0,{type:['infrastructure','trade']});
 vdkHarbourStrip(0,-9.5,13.5,9.6);
 // stone abutment at the landward end (z = -13.5..-9.5)
 vB('vStone',0,-.4,-11.5,7.2,1.55,4.0,0,st);vnPaving(0,1.16,-11.5,6.6,3.4,0,vC(0x8a7e70),10);
 // timber pile bents every 2.8 m from z = -9.2 to z = +12.6
 const W=5.2,Z0=-9.5,Z1=12.8,Y=1.15;
 for(let z=-9.0;z<=12.5;z+=2.65){
  for(const sx of[-1,-.35,.35,1])vPst('vPostB',sx*(W/2-.22),-.55,z,.16,Y+.5,woodD);
  vB('vWood',0,Y-.28,z,W+.3,.22,.26,0,woodD);
  vBeam([-W/2+.25,-.2,z],[W/2-.25,Y-.3,z],.09,woodD);vBeam([W/2-.25,-.2,z],[-W/2+.25,Y-.3,z],.09,woodD);}
 // longitudinal stringers and transverse deck planks
 for(const sx of[-1,-.33,.33,1])vB('vWood',sx*(W/2-.28),Y-.12,(Z0+Z1)/2,.2,.14,Z1-Z0,0,woodD);
 for(let z=Z0+.18;z<Z1;z+=.36)vB('vWood',0,Y-.02,z,W,.06,.31,0,wood.clone().multiplyScalar(rr(.86,1.1)));
 // fender piles and bollards along both sides
 for(let z=-7.5;z<=11.8;z+=3.8)for(const sx of[-1,1]){
  vPst('vPostB',sx*(W/2+.16),-.5,z,.15,Y+1.1,woodD);
  if(Math.abs(z+3.7)<.5||Math.abs(z-7.7)<.5)vdkBollard(sx*(W/2-.45),Y,z);}
 // pierhead shelter / cargo hoist frame at the seaward end (z = 9.5..12.2)
 {const hz=10.8;for(const sx of[-1,1])for(const sz of[-1,1])vPst('vPost',sx*1.9,Y,hz+sz*1.2,.13,3.0,wood);
  vnGableRoof(0,Y+3.0,hz,2.8,4.2,1.1,Math.PI/2,'vGableC',or,.85,'vGableW',wood,.15);
  vBeam([0,Y+3.5,hz],[0,Y+3.5,hz+2.1],.14,woodD);vBeam([0,Y+3.45,hz+1.95],[0,Y+1.6,hz+1.95],.03,vC(0xb8a480),'vRope');
  vB('vWood',0,Y+1.25,hz+1.95,.65,.55,.65,0,wood);}
 vnCrate(-1.3,Y,-2.4,.85,.15,wood);vnCrate(-1.2,Y,-1.4,.7,-.2,wood);vnSacks(1.4,Y,3.2,5);
 for(let k=0;k<3;k++)vnBarrel(1.3,Y,-5.2+k*.85,.34,.85,wood);
 // moored fishing/cargo boat on the +x side
 vdkVessel(W/2+1.5,-.15,2.4,Math.PI/2,7.8,2.0,vC(0x5a3e28),or,4.2,true);
 vnLampPost(-W/2+.35,Y,12.2,3.2);vnFolk(0,1.0,2,1.2);}

// ---------------------------------------------------------------- 3. HARBOUR CRANE WHARF (middle): treadwheel crane, weigh-house, cargo wharf
function buildVernCraneWharf(G,o){reseed(8571+(o.v|0));
 const st=vC(vPick(VPAL.stone)),stD=vC(vPick(VPAL.stoneDark)),wood=vC(vPick(VPAL.woodMid)),woodD=vC(0x4e3a26),or=vC(vPick(VPAL.orange)),pl=vC(vPick(VPAL.sand)),iron=vC(0x2e2a26);
 vnReg('Harbour crane wharf (middle)',0,0,10,13.5,{type:['industry','infrastructure']});
 vdkHarbourStrip(0,4.2,7.8,17.6);
 // heavy stone wharf platform (z = -7.6..+4.2)
 vB('vStone',0,-.4,-1.7,17.4,1.6,11.8,0,st);vB('vStone',0,1.15,3.9,17.6,.22,.65,0,stD);
 vnPaving(0,1.22,-1.7,16.6,10.8,0,vC(0x8c8274),22);
 for(const x of[-6.8,-2.4,2.4,6.8])vdkBollard(x,1.2,3.4,iron);
 // THE GREAT TREADWHEEL HARBOUR CRANE (centred at x = -2.2, z = 1.0): octagonal stone plinth, timber drum house, twin treadwheels, slewing jib
 {const cx=-2.2,cz=1.0,Y=1.2;
  vPst('vPostS',cx,Y,cz,2.8,.85,stD);vPst('vPostS',cx,Y+.85,cz,2.55,.22,or);
  // central king-post mast rising to y = 11.2
  vPst('vPostB',cx,Y+1.0,cz,.38,9.8,woodD);
  // timber turret housing around the king-post (radius 2.2, height 4.2) with conical shingle roof
  vPst('vStave',cx,Y+1.05,cz,2.15,4.2,wood);
  for(const yy of[Y+1.2,Y+3.1,Y+5.1])kput('vHoop',[cx,yy,cz],qEuler(Math.PI/2,0,0),[2.2,2.2,1.8],iron);
  kput('vConeT',[cx,Y+5.2,cz],null,[2.55,2.6,2.55],vC(0xb85838));
  // twin visible timber treadwheels (radius 1.85 m) flanking the turret on -x and +x under projecting hoods
  for(const s of[-1,1]){const wx=cx+s*2.35;
   kput('vHoop',[wx,Y+3.1,cz],qEuler(0,Math.PI/2,0),[1.75,1.75,2.8],woodD);
   kput('vHoop',[wx,Y+3.1,cz],qEuler(0,Math.PI/2,0),[1.45,1.45,2.4],wood);
   for(let k=0;k<8;k++){const a=k*Math.PI/4;vBq('vWood',wx,Y+3.1,cz,.1,3.4,.14,qEuler(a,0,0),woodD);}}
  // twin inclined jib beams projecting out over the water (+z, from y = 6.2 to y = 11.8 at z = 5.4) + tie-back struts
  for(const s of[-.28,.28]){
   vBeam([cx+s,Y+5.8,cz+.4],[cx+s*.4,Y+11.4,cz+4.6],.22,woodD);
   vBeam([cx+s,Y+9.6,cz],[cx+s*.4,Y+11.4,cz+4.6],.15,wood);}
  vBeam([cx-.35,Y+8.4,cz+2.2],[cx+.35,Y+8.4,cz+2.2],.14,woodD);
  // iron chain, pulley block, and suspended cargo net over the water
  const hx=cx,hz=cz+4.45;
  vBeam([hx,Y+11.3,hz],[hx,Y+3.8,hz],.045,iron,'vIron');
  vB('vIron',hx,Y+3.45,hz,.45,.45,.3,0,iron);
  vB('vWood',hx,Y+2.2,hz,1.35,1.1,1.35,.25,wood);kput('vHoop',[hx,Y+2.75,hz],qEuler(0,.3,0),[.85,.85,1.8],vC(0xb8a480));}
 // Weigh-master's office & tally shed at x = 4.6, z = -3.2
 {const wx=4.6,wz=-3.2,W=6.2,D=5.4,H=3.6,Y=1.2;
  vnBody('vPlaster',wx,Y,wz,W,H,D,0,pl,{t:.25});
  vB('vPlaster',wx,Y+H,wz,W+.3,.28,D+.3,0,or);
  vnHipRoof('vHipC',wx,Y+H+.28,wz,W,D,1.7,0,vC(0xb85838),.3);
  vnDoor(wx-1.2,Y,wz+D/2,0,1.2,2.3,'vWood',or,wood,false);
  vnWin(wx+1.3,Y+1.0,wz+D/2,0,1.5,1.3,'glass','vWood',or,true);
  vnAwning(wx,Y+2.6,wz+D/2,0,W-.8,1.5,vC(vPick(VPAL.awning)));
  // iron balance weigh-beam hung under the awning
  vBeam([wx+1.2,Y+2.3,wz+D/2+.9],[wx+1.2,Y+1.5,wz+D/2+.9],.03,iron,'vIron');
  vB('vIron',wx+1.2,Y+1.45,wz+D/2+.9,1.3,.07,.07,0,iron);}
 vnCrate(2.8,1.2,1.2,1.0,.1,wood);vnCrate(4.0,1.2,1.4,.85,-.2,wood);vnSacks(5.4,1.2,1.0,7);
 for(let k=0;k<4;k++)vnBarrel(-6.4+k*.8,1.2,-3.8,.38,.95,wood);
 vnFolk(1.2,1.5,2,1.4);}

// ---------------------------------------------------------------- 4. PORT BONDED WAREHOUSE (middle): 2-storey plaster warehouse, hoist gables
function buildVernPortWarehouse(G,o){reseed(8581+(o.v|0));
 const pl=vC(vPick(VPAL.sand)),or=vC(vPick(VPAL.orange)),trim=vC(vPick(VPAL.trim)),st=vC(vPick(VPAL.stone)),stD=vC(vPick(VPAL.stoneDark)),wood=vC(vPick(VPAL.woodMid)),iron=vC(0x2e2a26);
 vnReg('Port bonded warehouse (middle)',0,0,12,11.0,{type:['trade','warehouse']});
 const W=18.4,D=11.6,Z0=-1.4,Y0=.55,H1=4.2,H2=3.6,ZF=Z0+D/2;
 // raised stone quay plinth + front loading apron
 vB('vStone',0,-.1,Z0,W+.8,Y0+.1,D+.8,0,stD);
 vB('vStone',0,-.1,ZF+1.6,W+.8,Y0-.1,2.8,0,st);vnPaving(0,Y0-.18,ZF+1.6,W,2.4,0,vC(0x8a8072),16);
 for(const x of[-7.2,0,7.2])vnStairs(x,0,ZF+3.1,0,2.2,Y0-.2,3,'vStone',stD);
 // ground storey (rusticated stone piers and 3 broad arched cargo bays) + upper plaster loft storey
 vnBody('vPlaster',0,Y0,Z0,W,H1,D,0,pl,{t:.32});
 vnBand('vPlaster',0,Y0+H1,Z0,W+.35,.32,D+.35,0,or,.34);
 vnBody('vPlaster',0,Y0+H1+.32,Z0,W,H2,D,0,pl.clone().multiplyScalar(1.03),{t:.28});
 const top=vnCornice('vPlaster',0,Y0+H1+.32+H2,Z0,W,D,0,or,2,false);
 vnGableRoof(0,top,Z0,W,D,2.5,0,'vGableC',vC(0xb85838),.95,'vGablePl',pl,.32);
 // stone corner and bay pilasters along the front (+z)
 for(const x of[-W/2+.35,-3.1,3.1,W/2-.35])vB('vStone',x,Y0,ZF+.04,.7,H1+H2+.32,.22,0,st);
 // three ground cargo doors + upper loft loading doors with projecting hoist beams and pulley hoods
 for(const x of[-6.0,0,6.0]){
  vnDoor(x,Y0,ZF,0,2.2,3.1,'vStone',or,wood,false);
  vnDoor(x,Y0+H1+.32,ZF,0,1.5,2.4,'vWood',trim,wood,false);
  // projecting hoist beam and small tile hood over each loft door
  vBeam([x,top+.4,ZF-.3],[x,top+.4,ZF+1.35],.16,wood);
  vnGableRoof(x,top+.5,ZF+.55,1.4,1.8,.65,Math.PI/2,'vGableC',vC(0xb85838),.85,'vGableW',wood,.12);
  vBeam([x,top+.35,ZF+1.15],[x,Y0+H1+1.6,ZF+1.15],.035,vC(0xb8a480),'vRope');}
 // side and rear barred windows
 for(const s of[-1,1])for(const z of[Z0-2.8,Z0+2.8]){
  vnWin(s*W/2,Y0+1.5,z,s*Math.PI/2,1.2,1.4,'shut','vStone',st);
  vnWin(s*W/2,Y0+H1+1.3,z,s*Math.PI/2,1.2,1.3,'glass','vWood',trim,true);}
 for(const x of[-5.5,0,5.5])vnWin(x,Y0+H1+1.3,Z0-D/2,Math.PI,1.3,1.3,'glass','vWood',trim);
 // stacked crates, barrels, and amphorae on the loading apron
 vnCrate(-3.6,Y0-.2,ZF+1.4,1.0,.12,wood);vnCrate(-2.4,Y0-.2,ZF+1.5,.85,-.18,wood);
 vnSacks(3.2,Y0-.2,ZF+1.4,8);
 for(let k=0;k<4;k++)vnBarrel(7.2-k*.75,Y0-.2,ZF+1.3,.38,.95,wood);
 vnSign(-3.1,Y0+3.2,ZF+.15,0,or);vnFolk(0,ZF+1.8,2,1.5);}

// ---------------------------------------------------------------- 5. PORT CUSTOMS HOUSE (civic, lit): weigh-loggia, registry, sun-banner turret
function buildVernCustomsHouse(G,o){reseed(8591+(o.v|0));
 const pl=vC(vPick(VPAL.sand)),or=vC(vPick(VPAL.orange)),st=vC(vPick(VPAL.stone)),stD=vC(vPick(VPAL.stoneDark)),wood=vC(vPick(VPAL.woodRich)),iron=vC(0x2a2622);
 vnReg('Port customs house (civic)',0,0,11.5,12.5,{type:['civic','trade'],role:'customs'});
 const W=16.8,D=12.4,Z0=-.6,Y0=.65,H1=4.2,H2=3.8,PD=2.6,ZF=Z0+D/2;
 vB('vStone',0,-.1,Z0,W+1.0,Y0+.1,D+1.0,0,stD);
 vnStairs(0,0,ZF+1.0,0,5.4,Y0,4,'vStone',st);
 // ground storey set back behind a 5-bay stone weigh-loggia along +z
 vnBody('vPlaster',0,Y0,Z0-PD/2,W,H1,D-PD,0,pl,{t:.3});
 for(let k=0;k<6;k++){const x=-W/2+.45+k*(W-.9)/5;vB('vStone',x,Y0,ZF-.35,.72,H1,.72,0,st);
  vB('vPlaster',x,Y0+H1-.35,ZF-.35,.88,.35,.88,0,or);}
 vnBand('vPlaster',0,Y0+H1,Z0,W+.35,.36,D+.35,0,or,.34);
 // upper registry storey (full depth over the loggia)
 vnBody('vPlaster',0,Y0+H1+.36,Z0,W,H2,D,0,pl,{t:.28});
 const top=vnCornice('vPlaster',0,Y0+H1+.36+H2,Z0,W,D,0,or,2,true);
 vnHipRoof('vHipC',0,top,Z0,W,D,2.4,0,vC(0xb85838),.38);
 // central rooftop octagonal cupola with copper dome & imperial sun-banner mast
 {const cy=top+1.6;vPst('vPostS',0,cy,Z0,2.1,2.2,pl);vPst('vPostS',0,cy+2.2,Z0,2.25,.24,or);
  kput('vDomeC',[0,cy+2.44,Z0],null,[2.15,1.55,2.15],vC(0x529a86));
  vPst('vIron',0,cy+3.95,Z0,.06,2.2,iron);vnBannerPole(0,cy+2.4,Z0+2.15,0,3.2,or);}
 // ground doors & windows inside the loggia + upper lit windows with iron balconies
 vnDoor(0,Y0,ZF-PD,0,1.8,2.8,'vStone',or,wood,false);
 for(const x of[-5.2,-2.6,2.6,5.2])vnWin(x,Y0+1.0,ZF-PD,0,1.4,1.6,'lit','vStone',st);
 for(let k=0;k<5;k++){const x=-W/2+2.1+k*(W-4.2)/4;
  vnWin(x,Y0+H1+.95,ZF,0,1.45,2.1,'lit','vPlaster',or,true);
  vB('vStone',x,Y0+H1+.72,ZF+.42,2.0,.14,.8,0,st);vB('vIron',x,Y0+H1+1.25,ZF+.78,2.0,.85,.05,0,iron);}
 for(const s of[-1,1])for(const yy of[Y0+1.1,Y0+H1+1.1]){
  vnWin(s*W/2,yy,Z0-1.8,s*Math.PI/2,1.35,1.5,'lit','vPlaster',or);
  vnWin(s*W/2,yy,Z0+2.2,s*Math.PI/2,1.35,1.5,'lit','vPlaster',or);}
 // customs weigh-scales & bonded chest in the loggia
 vB('vWood',-3.4,Y0,ZF-1.2,1.6,.85,.9,0,wood);vB('vIron',3.4,Y0,ZF-1.2,1.2,.75,.8,0,iron);
 vnLampPost(-3.4,0,ZF+1.4,3.5);vnLampPost(3.4,0,ZF+1.4,3.5);vnFolk(0,ZF-.8,2,1.2);}

// ---------------------------------------------------------------- 6. HARBOUR LIGHTHOUSE (civic, lit): octagonal stone-and-plaster tower, arc lantern
function buildVernHarbourLight(G,o){reseed(8601+(o.v|0));
 const st=vC(vPick(VPAL.stone)),stD=vC(vPick(VPAL.stoneDark)),pl=vC(vPick(VPAL.sand)),or=vC(vPick(VPAL.orange)),iron=vC(0x2a2622),cu=vC(0x4e9682);
 vnReg('Harbour lighthouse (civic)',0,0,7.5,22.0,{type:['infrastructure','civic'],role:'lighthouse'});
 // heavy octagonal stone wave-break base (y = 0..3.6)
 vPst('vPostS',0,-.2,0,4.8,1.8,stD);vPst('vPostS',0,1.6,0,4.2,2.0,st);vPst('vPostS',0,3.5,0,4.4,.28,or);
 vnStairs(0,0,4.8,0,2.0,1.6,8,'vStone',stD);
 // three tapering octagonal shaft stages in warm sand plaster with bold Iziz-orange band courses (y = 3.78..16.8)
 const ST=[[3.78,4.6,3.4,pl],[8.38,4.4,3.0,pl],[12.78,4.0,2.65,or]];
 for(const [y,h,r,c] of ST){
  vPst('vPostS',0,y,0,r,h,c);vPst('vPostS',0,y+h-.22,0,r+.18,.26,c===or?pl:or);
  vnWin(0,y+1.4,r-.12,0,.75,1.35,'lit','vStone',stD);
  vnWin(0,y+1.4,-(r-.12),Math.PI,.75,1.35,'lit','vStone',stD);}
 // corbelled stone watch gallery & iron railing at y = 16.8
 vPst('vPostS',0,16.78,0,3.2,.42,stD);vPst('vPostS',0,17.2,0,3.35,.22,or);
 for(let k=0;k<16;k++){const a=k/16*TAU;vPst('vIron',Math.sin(a)*3.15,17.42,Math.cos(a)*3.15,.045,1.05,iron);}
 kput('vHoop',[0,18.42,0],qEuler(Math.PI/2,0,0),[3.15,3.15,1.4],iron);
 // glazed lantern drum (y = 17.42..20.1) with glowing Ancient beacon core + copper dome & weathervane
 vPst('vPostS',0,17.42,0,2.1,2.6,iron);
 for(let k=0;k<8;k++){const a=(k+.5)/8*TAU;vBq('vWinLit',Math.sin(a)*2.05,18.75,Math.cos(a)*2.05,.95,2.1,.08,vQ(a,0,0));}
 vBall('vBulb',0,18.8,0,.65);
 kput('vDomeC',[0,20.0,0],null,[2.25,1.45,2.25],cu);vPst('vIron',0,21.4,0,.06,1.1,iron);vBall('vBallW',0,21.9,0,.18,or);
 // keeper's 1-storey stone-and-plaster cottage attached on the -x flank
 {const kx=-4.4,kz=-.6,W=4.4,D=4.8,Y=1.6,H=2.8;
  vB('vStone',kx,-.2,kz,W+.4,1.8,D+.4,0,stD);
  vnBody('vPlaster',kx,Y,kz,W,H,D,0,pl,{t:.24});
  vnGableRoof(kx,Y+H,kz,W,D,1.3,0,'vGableC',vC(0xb85838),.85,'vGablePl',pl,.2);
  vnDoor(kx-.4,Y,kz+D/2,0,.95,2.0,'vWood',or,vC(0x6a4a30),false);
  vnWin(kx-W/2,Y+1.0,kz,-Math.PI/2,1.0,1.0,'lit','vWood',or);}
 vnDoor(0,1.6,4.05,0,1.2,2.2,'vStone',or,vC(0x5a3e28),false);
 vnLampPost(2.4,0,4.8,3.4);}

// ---------------------------------------------------------------- 7. SAILORS' TAVERN (poor): overhanging timber gallery, figurehead, rum yard
function buildVernSailorsTavern(G,o){reseed(8611+(o.v|0));
 const pl=vC(vPick(VPAL.sand)),or=vC(vPick(VPAL.orange)),trim=vC(vPick(VPAL.trim)),wood=vC(vPick(VPAL.woodMid)),woodD=vC(0x4e3a26),st=vC(vPick(VPAL.stoneDark));
 vnReg('Sailors\' tavern (poor)',0,0,9.5,9.5,{type:['tavern/inn','trade'],role:'innkeeper'});
 const W=11.6,D=9.2,X0=-1.4,Z0=-.8,Y0=.35,H1=3.4,H2=3.0,ZF=Z0+D/2;
 vB('vStone',X0,-.1,Z0,W+.5,Y0+.1,D+.5,0,st);
 vnBody('vPlaster',X0,Y0,Z0,W,H1,D,0,pl,{t:.26});
 // overhanging timber-framed upper storey band + front drinking gallery
 vnBand('vWood',X0,Y0+H1-.05,Z0,W+1.0,.28,D+1.6,0,woodD,.32);
 vnBody('vPlaster',X0,Y0+H1+.23,Z0,W,H2,D,0,or,{t:.24});
 // front timber gallery along +z (depth 1.3 m) supported on posts
 for(let k=0;k<5;k++){const x=X0-W/2+.6+k*(W-1.2)/4;
  vPst('vPost',x,0,ZF+1.15,.13,Y0+H1+H2+.2,woodD);}
 vB('vWood',X0,Y0+H1+.23,ZF+1.15,W+.6,.88,.1,0,wood);
 const top=vnCornice('vWood',X0,Y0+H1+.23+H2,Z0+.1,W+1.0,D+1.8,0,woodD,1,false);
 vnGableRoof(X0,top,Z0+.1,W+1.0,D+1.8,2.2,0,'vGableC',vC(0xb85838),.9,'vGableW',woodD,.25);
 // doors, windows, awning, and carved ship's figurehead/bowsprit projecting over the tavern door
 vnDoor(X0-.8,Y0,ZF,0,1.3,2.3,'vWood',trim,woodD);
 for(const x of[X0-3.8,X0+2.4,X0+4.4])vnWin(x,Y0+1.0,ZF,0,1.3,1.3,'glass','vWood',trim,true);
 for(const x of[X0-3.6,X0,X0+3.6])vnWin(x,Y0+H1+.95,ZF,0,1.3,1.5,'glass','vWood',woodD,true);
 vBeam([X0-.8,Y0+2.65,ZF],[X0-.8,Y0+3.15,ZF+1.85],.16,woodD);
 vBall('vBallW',X0-.8,Y0+3.05,ZF+1.65,.28,or);
 vnSign(X0+1.2,Y0+2.7,ZF+1.2,0,or);
 // side beer/rum yard on +x (x = 5.4, z = -1.0) with trestle tables, barrel rack, and tarp shade
 {const yx=5.6,yz=-.6;vnPaving(yx,.02,yz,3.8,7.6,0,vC(0x8a7e70),12);
  vldRails([yx-1.8,yz-3.6],[yx+1.8,yz-3.6],0,1.1,wood,2);vldRails([yx+1.8,yz-3.6],[yx+1.8,yz+3.6],0,1.1,wood,2);
  for(const tz of[yz-1.6,yz+1.6]){vB('vWood',yx,0,tz,1.6,.75,.85,0,wood);
   for(const s of[-1,1])vB('vWood',yx,0,tz+s*.65,1.6,.45,.28,0,woodD);}
  for(let k=0;k<4;k++)vnBarrel(yx-1.2,0,yz-3.1+k*.75,.36,.9,wood);}
 vnChimney(X0-W/2+1.2,top+.4,Z0-1.8,2.6,.2,true);vnFolk(X0,ZF+2.0,3,1.6);}

// ---------------------------------------------------------------- 8. ROPEWALK & SAIL LOFT (poor): long cordage shed, spinning wheels, tar pot, sail racks
function buildVernRopewalk(G,o){reseed(8621+(o.v|0));
 const pl=vC(vPick(VPAL.sand)),or=vC(vPick(VPAL.trim)),wood=vC(vPick(VPAL.woodMid)),woodD=vC(0x4e3a26),st=vC(vPick(VPAL.stoneDark)),iron=vC(0x2e2a26),sail=vC(0xe6dcc6);
 vnReg('Ropewalk and sail loft (poor)',0,0,14,7.5,{type:['industry'],role:'shipwright'});
 // long low cordage gallery along x (-12.5..+6.5, width 19 m, depth 5.2 m) + 2-storey sail-loft head-house at +x (x = 8.8)
 const RX=-3.0,RZ=-1.2,RW=19.0,RD=5.2,RH=3.1,Y0=.25;
 vB('vStone',RX,-.1,RZ,RW+.4,Y0+.1,RD+.4,0,st);
 // half-walled open-sided ropewalk shed so the taut hemp strands and spinning wheels inside read clearly
 vB('vPlaster',RX,Y0,RZ-RD/2+.15,RW,RH,.28,0,pl);
 vB('vPlaster',RX,Y0,RZ+RD/2-.15,RW,1.15,.28,0,pl);
 for(let i=0;i<=6;i++){const x=RX-RW/2+.3+i*(RW-.6)/6;
  vPst('vPost',x,Y0+1.1,RZ+RD/2-.15,.13,RH-1.1,woodD);}
 vnGableRoof(RX,Y0+RH,RZ,RW,RD,1.5,0,'vGableC',vC(0xb85838),.9,'vGableW',woodD,.22);
 // spinning jack wheel at -x end, travelling sledge in the middle, and 3 taut hemp hawsers running the length of the walk
 {const wx=RX-RW/2+1.2;vB('vWood',wx,Y0,RZ,.8,1.2,1.6,0,woodD);
  kput('vHoop',[wx+.45,Y0+1.35,RZ],qEuler(0,Math.PI/2,0),[.85,.85,1.8],woodD);
  vB('vWood',RX+2.5,Y0,RZ,.9,.85,1.4,0,woodD);
  for(const dz of[-.45,0,.45])vBeam([wx+.5,Y0+1.2,RZ+dz],[RX+RW/2-.5,Y0+1.1,RZ+dz],.035,vC(0xc4b088),'vRope');}
 // 2-storey sail-loft & tar-house at x = 9.2, z = -.6
 {const HX=9.2,HZ=-.6,HW=6.2,HD=6.6,H1=3.1,H2=2.7;
  vB('vStone',HX,-.1,HZ,HW+.4,Y0+.1,HD+.4,0,st);
  vnBody('vPlaster',HX,Y0,HZ,HW,H1,HD,0,pl,{t:.25});
  vnBand('vPlaster',HX,Y0+H1,HZ,HW+.25,.24,HD+.25,0,or,.28);
  vnBody('vWood',HX,Y0+H1+.24,HZ,HW,H2,HD,0,wood,{t:.2});
  vnGableRoof(HX,Y0+H1+.24+H2,HZ,HD,HW,1.8,Math.PI/2,'vGableC',vC(0xb85838),.9,'vGableW',woodD,.2);
  vnDoor(HX-.8,Y0,HZ+HD/2,0,1.2,2.2,'vWood',or,woodD);
  vnWin(HX+1.4,Y0+1.0,HZ+HD/2,0,1.2,1.1,'open','vWood',or,true);
  vnWin(HX,Y0+H1+.8,HZ+HD/2,0,1.4,1.5,'open','vWood',or,true);
  // canvas sail-drying racks in front of the ropewalk (z = 2.8) + tar cauldron at x = -10.5, z = 2.8
  for(const sx of[-6.5,-1.0]){for(const s of[-1,1])vPst('vPost',sx+s*1.8,0,2.8,.08,2.7,woodD);
   vBeam([sx-1.9,2.6,2.8],[sx+1.9,2.6,2.8],.07,woodD);
   kput('vCloth',[sx,1.75,2.85],vQ(0,.06,0),[3.3,1.65,1],sail);}
  vB('vStone',-10.5,0,2.7,1.4,.55,1.4,0,st);vPst('vTankR',-10.5,.5,2.7,.55,.65,iron);vBall('vEmber',-10.5,.3,3.35,.14);}
 vnSacks(4.2,0,2.6,6);vnFolk(-2.0,2.8,2,1.4);}

// ---------------------------------------------------------------- 9. FERRY SLIP (middle): counterweighted ramp, waiting pavilion, moored ferry
function buildVernFerrySlip(G,o){reseed(8631+(o.v|0));
 const st=vC(vPick(VPAL.stone)),stD=vC(vPick(VPAL.stoneDark)),pl=vC(vPick(VPAL.sand)),or=vC(vPick(VPAL.orange)),wood=vC(vPick(VPAL.woodMid)),woodD=vC(0x4e3a26),iron=vC(0x2e2a26);
 vnReg('Ferry slip (middle)',0,0,9.5,6.5,{type:['infrastructure','trade'],role:'ferryman'});
 vdkHarbourStrip(0,-.5,7.8,13.4);
 // stone quay abutment (z = -7.8..-.5)
 vB('vStone',0,-.4,-4.2,13.2,1.5,7.2,0,st);vnPaving(0,1.12,-4.2,12.4,6.4,0,vC(0x8c8274),16);
 // open-arched waiting & toll pavilion on the west side (x = -3.4, z = -4.2)
 {const px=-3.4,pz=-4.2,PW=5.2,PD=4.4,Y=1.1,H=3.0;
  for(const sx of[-1,1])for(const sz of[-1,1])vB('vStone',px+sx*(PW/2-.3),Y,pz+sz*(PD/2-.3),.55,H,.55,0,stD);
  vB('vPlaster',px,Y+H,pz,PW+.25,.28,PD+.25,0,or);
  vnHipRoof('vHipC',px,Y+H+.28,pz,PW,PD,1.35,0,vC(0xb85838),.3);
  vB('vWood',px,Y,pz-.8,3.2,.48,.55,0,wood);vnSign(px+PW/2,Y+2.4,pz+PD/2,0,or);}
 // timber guide-pile dolphins flanking the slipway (z = .5..6.8) + counterweighted gantry frame & hinged boarding ramp
 for(const sx of[-1,1])for(const z of[1.2,3.8,6.4]){
  for(const dx of[-.25,.25])vPst('vPostB',sx*3.2+dx,-.55,z,.16,2.8,woodD);
  kput('vHoop',[sx*3.2,1.65,z],qEuler(Math.PI/2,0,0),[.48,.48,1.8],iron);}
 // gantry portal at z = -.2
 for(const sx of[-1,1])vPst('vPostB',sx*2.1,1.1,-.2,.18,4.2,woodD);
 vB('vWood',0,5.1,-.2,4.6,.24,.28,0,woodD);vB('vPlaster',0,5.34,-.2,4.8,.16,.36,0,or);
 // hinged plank ramp sloping from (0, 1.1, -.2) down to (0, .35, 3.8) + counterweight chains
 vBq('vWood',0,.72,1.8,2.8,.14,4.2,qEuler(.18,0,0),wood);
 for(const sx of[-1,1]){vBeam([sx*1.3,1.2,-.2],[sx*1.3,.45,3.7],.08,woodD);
  vBeam([sx*1.8,5.1,-.2],[sx*1.3,.55,3.5],.035,iron,'vIron');}
 // flat-decked canal/harbour chain ferry moored in the slip (z = 5.4)
 {const fz=5.5;vB('vWood',0,-.1,fz,4.2,.55,4.8,0,woodD);vB('vWood',0,.45,fz,4.4,.1,5.0,0,wood);
  for(const sx of[-1,1])vldRails([sx*2.0,-1.8+fz],[sx*2.0,1.8+fz],.5,1.0,wood,2);
  vnCrate(-.9,.55,fz+.4,.75,.1,wood);vnBarrel(.9,.55,fz-.5,.34,.85,wood);}
 vnLampPost(3.6,1.1,-1.4,3.4);vnFolk(1.8,-2.8,2,1.2);}

// ---------------------------------------------------------------- 10. COASTGUARD CUTTER BERTH (civic, lit): stone boathouse, watch tower, cutter
function buildVernCoastguardBerth(G,o){reseed(8641+(o.v|0));
 const st=vC(vPick(VPAL.stone)),stD=vC(vPick(VPAL.stoneDark)),pl=vC(vPick(VPAL.sand)),or=vC(vPick(VPAL.orange)),wood=vC(vPick(VPAL.woodMid)),woodD=vC(0x4e3a26),iron=vC(0x2a2622);
 vnReg('Coastguard cutter berth (civic)',0,0,11,10.5,{type:['civic','military'],role:'coastguard'});
 vdkHarbourStrip(0,1.5,8.2,18.8);
 // stone quay platform on -x (x = -4.2, z = -3.2, width 10.4, depth 9.6) + wet boat-basin on +x (x = 4.6)
 vB('vStone',-4.2,-.4,-3.2,10.4,1.6,9.6,0,st);vnPaving(-4.2,1.22,-3.2,9.6,8.8,0,vC(0x8c8274),16);
 vB('vStone',4.6,-.4,-6.8,7.4,1.6,2.4,0,stD);
 // timber jetty along +x edge of the wet basin (x = 8.2, z = -5.6..+4.2)
 vB('vWood',8.2,1.05,-.7,1.8,.2,9.8,0,wood);
 for(let z=-5.0;z<=3.8;z+=2.2)vPst('vPostB',8.2,-.5,z,.16,1.6,woodD);
 // 2-storey guardhouse on the quay (-x = -4.4, z = -3.8) + 3-storey octagonal watch-turret at (-1.2, .4)
 {const gx=-4.6,gz=-3.8,GW=7.6,GD=6.4,Y=1.2,H1=3.4,H2=3.0;
  vnBody('vPlaster',gx,Y,gz,GW,H1,GD,0,pl,{t:.28});
  vnBand('vPlaster',gx,Y+H1,gz,GW+.3,.28,GD+.3,0,or,.3);
  vnBody('vPlaster',gx,Y+H1+.28,gz,GW,H2,GD,0,pl,{t:.26});
  const top=vnCornice('vPlaster',gx,Y+H1+.28+H2,gz,GW,GD,0,or,2,true);
  vnHipRoof('vHipC',gx,top,gz,GW,GD,1.8,0,vC(0xb85838),.32);
  vnDoor(gx-.8,Y,gz+GD/2,0,1.2,2.3,'vStone',or,woodD,false);
  for(const x of[gx-2.4,gx+1.8]){vnWin(x,Y+1.0,gz+GD/2,0,1.2,1.3,'lit','vStone',st);
   vnWin(x,Y+H1+.95,gz+GD/2,0,1.2,1.4,'lit','vPlaster',or,true);}}
 // octagonal harbour watch-turret with searchlight/braziers & alarm bell
 {const tx=-.8,tz=.2,Y=1.2;
  vPst('vPostS',tx,Y,tz,2.1,7.8,st);vPst('vPostS',tx,Y+7.8,tz,2.3,.3,or);
  for(const yy of[Y+2.2,Y+5.2])vnWin(tx,yy,tz+2.0,0,.85,1.3,'lit','vStone',stD);
  kput('vDomeC',[tx,Y+8.1,tz],null,[2.1,1.35,2.1],or);
  vnBannerPole(tx,Y+7.8,tz+2.15,0,3.2,or);vBall('vBulb',tx,Y+8.3,tz+2.15,.22);}
 // vaulted boathouse roof spanning over the rear of the wet slip (x = 4.6, z = -3.8, width 6.8, depth 6.2)
 {const bx=4.6,bz=-3.8,BW=6.8,BD=6.2;
  for(const sx of[-1,1])for(let z=-6.4;z<=-1.0;z+=2.7)vB('vStone',bx+sx*(BW/2-.25),-.3,z,.55,4.8,.65,0,stD);
  vB('vPlaster',bx,4.5,bz,BW+.3,.28,BD+.3,0,or);
  vnGableRoof(bx,4.78,bz,BD,BW,1.9,Math.PI/2,'vGableC',vC(0xb85838),.9,'vGablePl',pl,.24);}
 // fast lateen-rigged Imperial revenue cutter moored in the slipway (x = 4.6, z = 1.8)
 vdkVessel(4.6,-.15,1.8,Math.PI/2,10.2,2.4,vC(0x2a4858),or,6.2,true);
 vdkBollard(-.4,1.2,.8,iron);vdkBollard(8.2,1.15,2.4,iron);
 vnLampPost(-7.4,1.2,.6,3.4);vnFolk(-4.2,.4,2,1.2);}

VERN.def({key:'vern_quay',name:'Harbour quay',family:'infrastructure',tags:{type:['infrastructure','trade'],wealth:'middle',lit:false,role:'docker',job:'hauling'},w:24,d:10,h:4.5,build:buildVernQuay});
VERN.def({key:'vern_pier',name:'Timber harbour pier',family:'infrastructure',tags:{type:['infrastructure','trade'],wealth:'poor',lit:false,role:'docker',job:'hauling'},w:10,d:28,h:5,build:buildVernPier});
VERN.def({key:'vern_crane_wharf',name:'Harbour crane wharf',family:'industry',tags:{type:['industry','infrastructure'],wealth:'middle',lit:false,role:'docker',job:'hauling'},w:18,d:16,h:13.5,build:buildVernCraneWharf});
VERN.def({key:'vern_port_warehouse',name:'Port bonded warehouse',family:'trade',tags:{type:['trade','warehouse'],wealth:'middle',lit:false,role:'warehouseman',job:'hauling'},w:22,d:16,h:11,build:buildVernPortWarehouse});
VERN.def({key:'vern_customs_house',name:'Port customs house',family:'civic',tags:{type:['civic','trade'],wealth:'civic',lit:true,role:'customs',job:'administration'},w:20,d:16,h:12.5,build:buildVernCustomsHouse});
VERN.def({key:'vern_harbour_light',name:'Harbour lighthouse',family:'civic',tags:{type:['infrastructure','civic'],wealth:'civic',lit:true,role:'lighthouse_keeper',job:'guard'},w:12,d:12,h:22,build:buildVernHarbourLight});
VERN.def({key:'vern_sailors_tavern',name:'Sailors\' tavern',family:'trade',tags:{type:['tavern/inn','trade'],wealth:'poor',lit:false,role:'innkeeper',job:'hospitality'},w:16,d:14,h:9.5,build:buildVernSailorsTavern});
VERN.def({key:'vern_ropewalk',name:'Ropewalk and sail loft',family:'industry',tags:{type:['industry'],wealth:'poor',lit:false,role:'shipwright',job:'carpentry'},w:28,d:10,h:7.5,build:buildVernRopewalk});
VERN.def({key:'vern_ferry_slip',name:'Ferry slip',family:'infrastructure',tags:{type:['infrastructure','trade'],wealth:'middle',lit:false,role:'ferryman',job:'hauling'},w:14,d:18,h:6.5,build:buildVernFerrySlip});
VERN.def({key:'vern_coastguard_berth',name:'Coastguard cutter berth',family:'civic',tags:{type:['civic','military'],wealth:'civic',lit:true,role:'coastguard',job:'guard'},w:20,d:18,h:10.5,build:buildVernCoastguardBerth});
