// ================================================================= IZIZ VERNACULAR — civic
// School, hospital, barracks + drill yard, the alchemist's compound. Civic
// buildings are built in stone with copper roofs where the Empire still can,
// and they are the buildings (with the rich) that carry electric light.
const VTAG_CIV={type:['civic'],wealth:'civic',lit:true};

// stone civic block helper: stone box, stepped cornice, deco strips between lit windows on the front face
function vnCivicBlock(x,y,z,w,h,d,ry,st,stD,winY,winH,nWin,strips){vB('vStone',x,y,z,w,h,d,ry,st);const top=vnCornice('vStone',x,y+h,z,w,d,ry,st,2);
 for(let i=0;i<nWin;i++){const lx=-w/2+w*(i+.5)/nWin;const p=loc(x,z,lx,d/2,ry);vnWin(p[0],y+winY,p[1],ry,1.2,winH,'lit','vStone',st);
  if(strips&&i<nWin-1){const q=loc(x,z,lx+w/(2*nWin),d/2+.02,ry);vnStrip(q[0],y+winY-.5,q[1],ry,.55,winH+1.1,'vStone',stD);}}
 return top;}

// ---------------------------------------------------------------- school: hall with a bell tower, two classroom wings round a shaded yard
function buildVernSchool(G,o){reseed(7501+(o.v|0));const st=vC(vPick(VPAL.stone)),stD=vC(vPick(VPAL.stoneDark)),wood=vC(vPick(VPAL.woodRich)),th=vC(vPick(VPAL.thatch)),cu=vC(0xffffff);
 vnReg('School',0,0,17,15);
 const HW=16,HD=8,HZ=-7,Y0=.5;vB('vStone',0,0,0,30,Y0,26,0,stD);
 // main hall: two storeys of stone
 vB('vStone',0,Y0,HZ,HW,4.0,HD,0,st);const c1=vnCornice('vStone',0,Y0+4.0,HZ,HW,HD,0,st,1,false);
 const top=vnCivicBlock(0,c1,HZ,HW-.4,3.6,HD-.4,0,st.clone().multiplyScalar(1.03),stD,1.0,1.6,5,true);
 for(const x of[-5,-2.5,2.5,5])vnWin(x,Y0+1.3,HZ+HD/2,0,1.2,1.8,'lit','vStone',st);vnDoor(0,Y0,HZ+HD/2,0,1.7,2.9,'vStone',st,vC(0x4a2e1c));
 for(const s of[-1,1])for(const z of[-2,2]){vnWin(s*HW/2,Y0+1.3,HZ+z,s*Math.PI/2,1.1,1.7,'lit','vStone',st);vnWin(s*(HW/2-.2),c1+1.0,HZ+z,s*Math.PI/2,1.1,1.5,'lit','vStone',st);}
 for(const x of[-5,-2.5,0,2.5,5])vnWin(x,c1+1.0,HZ-HD/2+.2,Math.PI,1.1,1.5,'glass','vStone',st);
 vnHipRoof('vHipCu',0,top,HZ,HW-.4,HD-.4,2.6,0,cu,1.2);
 // bell tower at the hall's corner: stone shaft, open timber belfry, copper pyramid, bell
 {const tx=HW/2-1.2,tz=HZ-HD/2+1.2,TH=top+3.2;vB('vStone',tx,Y0,tz,3.2,TH-Y0,3.2,0,st);vnCornice('vStone',tx,TH,tz,3.2,3.2,0,st,1);
  for(const sx of[-1,1])for(const sz of[-1,1])vPst('vPost',tx+sx*1.3,TH+.6,tz+sz*1.3,.14,2.6,wood);vB('vWood',tx,TH+3.2,tz,3.2,.25,3.2,0,wood);
  kput('vPyrCu',[tx,TH+3.45,tz],null,[3.8,2.2,3.8],cu);vBall('vFinial',tx,TH+5.9,tz,.22);
  vB('vWood',tx,TH+2.9,tz,.1,.4,.1,0,wood);kput('vBall',[tx,TH+2.0,tz],null,[.5,.6,.5],vC(0x7a6a2a));}
 // classroom wings: single storey stone with timber verandas facing the yard, copper shed roofs
 for(const s of[-1,1]){const wx=s*10.5,WW=7,WD=13,wz=1.5;vB('vStone',wx,Y0,wz,WW,3.6,WD,0,st);const t=vnCornice('vStone',wx,Y0+3.6,wz,WW,WD,0,st,1);
  vnShedRoof(wx,t,wz,WD,WW,1.4,s*Math.PI/2,'vCopperB',cu,.9,.16);
  const fx=wx-s*WW/2;for(const z of[-4.2,-1.4,1.4,4.2])vnWin(fx,Y0+1.2,wz+z,-s*Math.PI/2,1.3,1.7,'lit','vStone',st);vnDoor(fx,Y0,wz-5.6,-s*Math.PI/2,1.2,2.4,'vStone',st,vC(0x4a2e1c),false);
  vnVeranda(fx-s*1.3,Y0,wz,WD,2.6,-s*Math.PI/2,.04,3.0,wood);vnShedRoof(fx-s*1.3,Y0+3.0,wz,WD,2.6,.6,-s*Math.PI/2,'vCopperB',cu,.4,.12);
  for(const z of[-3,0,3])vnWin(wx+s*WW/2,Y0+1.4,wz+z,s*Math.PI/2,1.1,1.3,'glass','vStone',st);}
 // the yard: paving, a thatch shade on posts with benches under it, planters, lamps, a low wall with a gate to the front
 vnPaving(0,Y0+.02,2,12,12,0,st,26);
 {for(const sx of[-1,1])for(const sz of[-1,1])vPst('vPostB',sx*2.6,Y0,3+sz*2.2,.16,3.2,wood);vnHipRoof('vHipT',0,Y0+3.2,3,5.2,4.4,1.6,0,th,1.0);
  for(const x of[-1.4,1.4])vB('vWood',x,Y0,3,.5,.45,3.6,0,wood);}
 for(const s of[-1,1]){vnPlanter(s*5.5,Y0,-2,3.0,.9,0,wood);vnLampPost(s*4.6,Y0,9.4,3.4);}
 {const CW=30,h=1.4;for(const s of[-1,1]){const L=CW/2-2.2;vB('vStone',s*(2.2+L/2),Y0,11.5,L,h,.5,0,stD);vB('vStone',s*(2.2+L/2),Y0+h,11.5,L+.2,.22,.7,0,st);vB('vStone',s*2.4,Y0,11.5,.8,h+.7,.8,0,st);}
  for(const s of[-1,1])vB('vStone',s*CW/2,Y0,-.5,.5,h,24,0,stD);}
 vnLamp(-1.3,Y0+3.4,HZ+HD/2,0);vnLamp(1.3,Y0+3.4,HZ+HD/2,0);vnBannerPole(0,Y0,9,0,7,vC(0xe07a2a));
 vnFolk(0,4,8,4);}

// ---------------------------------------------------------------- hospital: a long ward block with deep verandas both sides, a domed entrance pavilion, herb court
function buildVernHospital(G,o){reseed(7511+(o.v|0));const st=vC(vPick(VPAL.stone)),stD=vC(vPick(VPAL.stoneDark)),wood=vC(vPick(VPAL.woodRich)),cu=vC(0xffffff);
 vnReg('Hospital',0,0,20,18);
 const W=26,D=9,H=4.8,Y0=.7;vB('vStone',0,0,0,34,Y0,24,0,stD);
 vB('vStone',0,Y0,-2,W,H,D,0,st);const top=vnCornice('vStone',0,Y0+H,-2,W,D,0,st,2);
 vnGableRoof(0,top,-2,W,D,2.6,0,'vGableCu',cu,1.2,'vGableSt',st,.16);
 // ward verandas both long sides: timber posts, copper shed roofs, rails; tall lit windows and doors between them
 for(const s of[-1,1]){const fz=-2+s*D/2;vnVeranda(0,Y0,fz+s*1.5,W-2,3.0,s>0?0:Math.PI,.04,3.4,wood);vnShedRoof(0,Y0+3.4,fz+s*1.5,W-2,3.0,.7,s>0?0:Math.PI,'vCopperB',cu,.5,.12);
  for(let i=0;i<7;i++){const x=-W/2+W*(i+.5)/7;if(i%3===1)vnDoor(x,Y0,fz,s>0?0:Math.PI,1.3,2.6,'vStone',st,vC(0x4a2e1c),false);else vnWin(x,Y0+1.1,fz,s>0?0:Math.PI,1.4,2.4,'lit','vStone',st);}}
 for(const s of[-1,1])for(const z of[-4.5,-2,.5])vnWin(s*W/2,Y0+1.3,z,s*Math.PI/2,1.2,2.0,'lit','vStone',st);
 // entrance pavilion on the front: two storeys, cornices, a drum and copper dome, the door between stone piers
 {const PW=8,PD=6,PZ=-2+D/2+PD/2-.3;vB('vStone',0,Y0,PZ,PW,H,PD,0,st);const c1=vnCornice('vStone',0,Y0+H,PZ,PW,PD,0,st,1,false);
  vB('vStone',0,c1,PZ,PW-.4,3.0,PD-.4,0,st.clone().multiplyScalar(1.03));const c2=vnCornice('vStone',0,c1+3.0,PZ,PW-.4,PD-.4,0,st,3);
  vPst('vPostS',0,c2,PZ,2.6,1.2,st);vB('vStone',0,c2+1.2,PZ,5.6,.25,5.6,0,stD);kput('vDomeC',[0,c2+1.45,PZ],null,[2.8,2.4,2.8],cu);vBall('vFinial',0,c2+3.95,PZ,.25);
  for(let k=0;k<8;k++){const a=k/8*TAU;vB('vDarkB',Math.cos(a)*2.6,c2+.3,PZ+Math.sin(a)*2.6,.5,.7,.2,-a+Math.PI/2);}
  vnStairs(0,0,PZ+PD/2+1.2,0,4.4,Y0,3,'vStone',st);vnDoor(0,Y0,PZ+PD/2,0,1.9,3.0,'vStone',st,vC(0x4a2e1c),false);
  for(const s of[-1,1]){vB('vStone',s*1.7,Y0,PZ+PD/2+.3,.6,H-.3,.6,0,stD);vnStrip(s*3.2,Y0+.8,PZ+PD/2,0,.6,3.2,'vStone',stD);vnWin(s*2.4,c1+.9,PZ+PD/2-.2,0,1.2,1.6,'lit','vStone',st);}
  for(const s of[-1,1]){vnWin(s*PW/2,Y0+1.3,PZ,s*Math.PI/2,1.2,2.0,'lit','vStone',st);vnWin(s*(PW/2-.2),c1+.9,PZ,s*Math.PI/2,1.1,1.6,'lit','vStone',st);}
  vnLamp(-1.9,Y0+3.6,PZ+PD/2,0);vnLamp(1.9,Y0+3.6,PZ+PD/2,0);}
 // herb court to the front: raised beds, a cistern with a spout, benches, lamps; store room at one end
 vnPaving(0,Y0+.02,7.5,20,6,0,st,30);
 for(const x of[-8,-4,4,8])vnPlanter(x,Y0,7.5,2.6,1.1,0,wood);for(const s of[-1,1])vnLampPost(s*11,Y0,7.5,3.4);
 {const cx=-W/2-2.4;vB('vStone',cx,Y0,-2,3,1.2,3,0,stD);vPst('vTankW',cx,Y0+1.2,-2,1.3,2.4,null);vBq('vHoop',cx,Y0+2.0,-2,1.34,1.34,1,qEuler(Math.PI/2,0,0),vC(0x2e2a26));vBq('vHoop',cx,Y0+3.2,-2,1.34,1.34,1,qEuler(Math.PI/2,0,0),vC(0x2e2a26));
  vB('vIron',cx,Y0+3.6,-2,2.8,.12,2.8,0,vC(0x2e2a26));vPst('vPipe',cx+1.3,Y0+.5,0,.06,.9,vC(0x2e2a26));kput('vPipe',[cx+1.3,Y0+1.4,-.9],qEuler(Math.PI/2,0,0),[.06,1.9,.06],vC(0x2e2a26));vB('vStone',cx+1.3,Y0,.9,1.2,.6,.9,0,stD);}
 {const sx=W/2+2.6;vB('vStone',sx,Y0,-2,3.2,3.2,5,0,st);vnCornice('vStone',sx,Y0+3.2,-2,3.2,5,0,st,1);vnHipRoof('vHipCu',sx,Y0+3.2+.58,-2,3.2,5,1.2,0,cu,.6);vnDoor(sx,Y0,.5,0,1.0,2.1,'vStone',st,vC(0x4a2e1c),false);}
 vnFolk(0,11,6,4);}

// ---------------------------------------------------------------- barracks and drill yard: palisade, two barrack blocks, armoury, watch tower, pells, standard
function buildVernBarracks(G,o){reseed(7521+(o.v|0));const wood=vC(vPick(VPAL.woodMid)),pl=vC(vPick(VPAL.sand)),st=vC(vPick(VPAL.stone)),stD=vC(vPick(VPAL.stoneDark));
 const CW=42,CD=32;vnReg('Barracks and drill yard',0,0,26,14,{type:['civic','military']});
 vB('vStone',0,-.12,0,CW+4,.14,CD+4,0,vC(0x8a7a66));vnPalisade(0,0,0,CW,CD,0,4.2,5);
 // gate towers either side of the gate, a bridge between them, a standard and lamps
 for(const s of[-1,1]){const gx=s*3.6;for(const sx of[-1,1])for(const sz of[-1,1])vPst('vPostB',gx+sx*1.0,0,CD/2+sz*1.0,.16,7,wood);
  vB('vWood',gx,4.6,CD/2,2.6,.2,2.6,0,wood);for(let k=0;k<8;k++){const a=k/8*TAU;vPst('vPost',gx+Math.cos(a)*1.25,4.8,CD/2+Math.sin(a)*1.25,.06,1.0,wood);}
  vnHipRoof('vHipC',gx,7,CD/2,2.6,2.6,1.3,0,null,.6);vnLampPost(s*2.0,0,CD/2+1.4,3.6);}
 vB('vWood',0,4.6,CD/2,5.0,.2,1.4,0,wood);vB('vWood',0,4.8,CD/2+.6,5.0,.9,.08,0,wood);
 for(const s of[-1,1])kput('vWood',[s*1.35,2.2,CD/2+.1],vQ(0,0,0).multiply(qEuler(0,s*.5,0)),[2.4,4.2,.1],wood.clone().multiplyScalar(.85));   // gate leaves, half open
 // two barrack blocks along the sides: timber frame + plaster, verandas to the yard, corrugate gable roofs
 for(const s of[-1,1]){const bx=s*13.5,BW=8,BD=20,Y0=.4;vB('vStone',bx,-.1,-2,BW+.5,.5,BD+.5,0,stD);vnFrame(bx,Y0,-2,BW,3.6,BD,0,wood,.16);vB('vPlaster',bx,Y0,-2,BW-.14,3.6,BD-.14,0,pl);
  const t=vnCornice('vWood',bx,Y0+3.6,-2,BW,BD,0,wood,1);vnGableRoof(bx,t,-2,BD,BW,2.4,Math.PI/2,'vGableC',null,1.0,'vGablePl',pl,.12);
  const fx=bx-s*BW/2;vnVeranda(fx-s*1.2,Y0,-2,BD-1,2.4,-s*Math.PI/2,.04,2.9,wood);vnShedRoof(fx-s*1.2,Y0+2.9,-2,BD-1,2.4,.6,-s*Math.PI/2,'vCorr',null,.4,.12);
  for(let i=0;i<6;i++){const z=-2-BD/2+BD*(i+.5)/6;if(i%3===1)vnDoor(fx,Y0,z,-s*Math.PI/2,1.2,2.3,'vWood',wood,vC(0x5a3a24),false);else vnWin(fx,Y0+1.3,z,-s*Math.PI/2,1.2,1.2,'open','vWood',wood,true);}
  for(let i=0;i<5;i++)vnWin(bx+s*BW/2,Y0+1.4,-2-BD/2+BD*(i+.5)/5,s*Math.PI/2,1.0,1.0,'shut','vWood',wood);
  vnChimney(bx,t+2.6,-2-BD/2+3,1.8,.16,true);vnDryingRack(bx,0,-2+BD/2+2.2,0,4);}
 // armoury at the back: squat stone, iron door, lamp
 {const AW=9,AD=6,az=-CD/2+AD/2+1.5;vB('vStone',0,0,az,AW,3.4,AD,0,st);vnCornice('vStone',0,3.4,az,AW,AD,0,st,2);vnHipRoof('vHipC',0,3.4+.84,az,AW,AD,1.4,0,null,.7);
  vB('vDarkB',0,0,az+AD/2,1.6,2.4,.1,0);vB('vIron',0,0,az+AD/2+.06,1.5,2.35,.08,0,vC(0x3a3632));for(const s of[-1,1])vB('vStone',s*1.05,0,az+AD/2+.1,.3,2.6,.3,0,stD);vB('vStone',0,2.6,az+AD/2+.1,2.6,.3,.4,0,stD);
  for(const x of[-3,3])vnWin(x,1.6,az+AD/2,0,.7,.6,'open','vStone',st);vnLamp(0,3.0,az+AD/2,0);
  for(let k=0;k<6;k++)kput('vWood',[-3.4+k*.5,1.6,az+AD/2+.9],vQ(0,.15,0),[.06,3.2,.06],vC(0x5a4632));vB('vWood',-2.2,1.05,az+AD/2+.6,3.0,.12,.4,0,wood);}   // spear rack
 // watch tower on the back corner
 {const tx=-CW/2+3,tz=-CD/2+3;for(const sx of[-1,1])for(const sz of[-1,1])vPst('vPostB',tx+sx*1.6,-.2,tz+sz*1.6,.18,10.5,wood,qEuler(sz*.05,0,-sx*.05));
  for(const y of[3,6])for(const s of[-1,1]){vB('vWood',tx,y,tz+s*1.5,3.2,.14,.14,0,wood);vB('vWood',tx+s*1.5,y,tz,.14,.14,3.2,0,wood);}
  vB('vWood',tx,8.8,tz,3.8,.22,3.8,0,wood);for(let k=0;k<12;k++){const a=k/12*TAU;vPst('vPost',tx+Math.cos(a)*1.85,9,tz+Math.sin(a)*1.85,.06,1.0,wood);}
  vnHipRoof('vHipC',tx,11.4,tz,3.4,3.4,1.5,0,null,.7);for(const sx of[-1,1])for(const sz of[-1,1])vPst('vPost',tx+sx*1.5,9,tz+sz*1.5,.1,2.4,wood);
  vnLadder(tx+1.2,0,tz+2.2,0,8.8,wood);}
 // the drill yard: paving, pells, a straw archery butt, weapon racks, the standard, benches, water
 vnPaving(0,.02,2,18,20,0,vC(0x8a7a66),40);
 for(let k=0;k<5;k++){vPst('vPostB',-6+k*3,0,7,.16,2.0,vC(0x6a5a48));vB('vWood',-6+k*3,1.5,7,.9,.12,.12,0,vC(0x6a5a48));}
 for(let k=0;k<3;k++){vPst('vStave',-3+k*3,0,-9,.7,1.4,vC(0xc8a870));vBq('vHoop',-3+k*3,.9,-9+.72,.4,.4,1,qEuler(0,0,0),vC(0xc9442a));}
 vnBannerPole(0,0,1,0,9,vC(0xe07a2a));vB('vStone',0,0,1,1.4,.6,1.4,0,stD);
 for(const x of[-5,5]){vB('vWood',x,0,-4,.5,.45,3.0,0,wood);}vnWaterButt(8,0,-6,.5,1.1);vnWaterButt(-8,0,-6,.5,1.1);vnCrate(8.5,0,8,.9,.2,wood);
 vnLampPost(-7,0,1,3.6);vnLampPost(7,0,1,3.6);
 vnFolk(0,2,9,5);}

// ---------------------------------------------------------------- the alchemist's compound: walled; house with a dome-topped lab tower, still-house of copper, furnace, herb beds
function buildVernAlchemist(G,o){reseed(7531+(o.v|0));const st=vC(vPick(VPAL.stone)),stD=vC(vPick(VPAL.stoneDark)),wood=vC(vPick(VPAL.woodRich)),cu=vC(0xffffff),pl=vC(vPick(VPAL.sand));
 vnReg('Alchemist\'s compound',0,0,17,19,{type:['civic','industry']});
 const CW=28,CD=24,h=2.6;vB('vStone',0,0,0,CW+2,.4,CD+2,0,stD);
 for(const s of[-1,1]){vB('vStone',s*CW/2,0,0,.6,h,CD,0,stD);vB('vStone',s*CW/2,h,0,.9,.3,CD+.3,0,st);}vB('vStone',0,0,-CD/2,CW,h,.6,0,stD);vB('vStone',0,h,-CD/2,CW+.3,.3,.9,0,st);
 for(const s of[-1,1]){const L=CW/2-1.7;vB('vStone',s*(1.7+L/2),0,CD/2,L,h,.6,0,stD);vB('vStone',s*(1.7+L/2),h,CD/2,L+.3,.3,.9,0,st);vB('vStone',s*1.95,0,CD/2,1.0,h+1.0,1.0,0,st);kput('vPyrCu',[s*1.95,h+1.0,CD/2],null,[1.2,.8,1.2],cu);}
 for(let k=-2;k<=2;k++)vB('vIron',k*.6,0,CD/2,.06,h-.2,.06,0,vC(0x2e2a26));for(const y of[.5,h-.5])vB('vIron',0,y,CD/2,3.0,.08,.08,0,vC(0x2e2a26));vnLampPost(-3.4,0,CD/2+1.2,3.2);vnLampPost(3.4,0,CD/2+1.2,3.2);
 // the house: two storeys of stone with a round lab tower carrying a copper dome and a glass lantern
 {const HW=11,HD=8,hx=-5,hz=-5,Y0=.4;vB('vStone',hx,Y0,hz,HW,3.8,HD,0,st);const c1=vnCornice('vStone',hx,Y0+3.8,hz,HW,HD,0,st,1,false);
  vB('vWood',hx,c1,hz,HW-.3,3.2,HD-.3,0,wood);const c2=vnCornice('vWood',hx,c1+3.2,hz,HW-.3,HD-.3,0,wood,2);vnHipRoof('vHipCu',hx,c2,hz,HW-.3,HD-.3,2.4,0,cu,1.2);
  vnDoor(hx+1.5,Y0,hz+HD/2,0,1.4,2.6,'vStone',st,vC(0x4a2e1c));for(const x of[-3.5,-1.2])vnWin(hx+x,Y0+1.2,hz+HD/2,0,1.2,1.7,'lit','vStone',st);vnStrip(hx+3.9,Y0+.7,hz+HD/2+.02,0,.6,2.8,'vStone',stD);
  for(const x of[-3.6,-1.2,1.2,3.6])vnWin(hx+x,c1+.9,hz+HD/2-.15,0,1.1,1.5,'lit','vWood',wood);
  for(const s of[-1,1])for(const z of[-2,2]){vnWin(hx+s*HW/2,Y0+1.2,hz+z,s*Math.PI/2,1.1,1.7,'lit','vStone',st);vnWin(hx+s*(HW/2-.15),c1+.9,hz+z,s*Math.PI/2,1.0,1.5,'lit','vWood',wood);}
  const tx=hx+HW/2+1.2,tz=hz-HD/2+1.6,TH=c2+3.2;vPst('vPostS',tx,Y0,tz,2.6,TH-Y0,st);vB('vStone',tx,TH,tz,6.0,.35,6.0,0,stD);
  for(let k=0;k<3;k++){const y=Y0+2.2+k*3.0;for(let j=0;j<6;j++){const a=j/6*TAU+k*.3;vnWin(tx+Math.cos(a)*2.6,y,tz+Math.sin(a)*2.6,Math.PI/2-a,.8,1.4,'lit','vStone',st);}}
  for(let k=0;k<10;k++){const a=k/10*TAU;vPst('vPipeC',tx+Math.cos(a)*2.4,TH+.35,tz+Math.sin(a)*2.4,.08,1.6,cu);}
  mesh(lathe({rFn:()=>2.45,H:1.6,nu:24,nv:2}),MAT.glass,G,tx,TH+.35,tz);kput('vDomeC',[tx,TH+1.95,tz],null,[2.7,2.2,2.7],cu);vBall('vFinial',tx,TH+4.3,tz,.28);
  vBall('vBulb',tx,TH+1.1,tz,.22);}
 // still-house: open timber shed with copper stills, coils and glass retorts on a bench; furnace with a chimney behind
 {const sx=7.5,sz=-4,SW=9,SD=8;vB('vStone',sx,0,sz,SW+.4,.4,SD+.4,0,stD);vnFrame(sx,.4,sz,SW,3.6,SD,0,wood,.16);vB('vPlaster',sx,.4,sz-SD/4-.1,SW-.2,3.6,SD/2-.2,0,pl);
  const t=vnCornice('vWood',sx,4.0,sz,SW,SD,0,wood,1,false);vnGableRoof(sx,t,sz,SW,SD,2.3,0,'vGableCu',cu,1.0,'vGablePl',pl,.14);
  for(let k=0;k<3;k++){const px=sx-3+k*3,pz=sz+1.4;vB('vStone',px,.4,pz,1.8,.7,1.8,0,stD);vPst('vPipeC',px,1.1,pz,.75,1.6,cu);kput('vDomeC',[px,2.7,pz],null,[.78,.7,.78],cu);
   vPst('vPipeC',px,3.35,pz,.14,.7,cu);kput('vPipeC',[px+.8,3.9,pz],qEuler(0,0,Math.PI/2*.9),[.1,1.6,.1],cu);for(let j=0;j<4;j++)vBq('vHoop',px+1.6,3.3-j*.35,pz,.32,.32,1,qEuler(0,Math.PI/2,0),cu.clone().multiplyScalar(.8));
   vPst('vBarrel',px+1.6,.4,pz,.4,1.6,wood);vBall('vEmber',px,.75,pz+.85,.16);}
  vB('vWood',sx,.4,sz+3.4,SW-1.4,.9,.8,0,wood);for(let k=0;k<6;k++){const x=sx-3.2+k*1.28;mesh(lathe({rFn:y=>.28*Math.sqrt(clamp(1-Math.pow(y/.5-1,2),0,1))+.04,H:1.0,nu:12,nv:8}),MAT.glass,G,x,1.3,sz+3.4);vPst('vClayPot',x+.5,1.3,sz+3.4,.1,.3,vC(vPick([0x9a5a38,0x5a7a8a])));}
  vB('vStone',sx-3.2,.4,sz-3.2,2.2,1.6,1.6,0,stD);vB('vDarkB',sx-3.2,.9,sz-2.4,.9,.6,.2,0);vBall('vEmber',sx-3.2,1.1,sz-2.35,.14);vnChimney(sx-3.2,2.0,sz-3.2,5.4,.3,true);}
 // herb beds, a well, drying racks with bundles, jars along the wall
 for(let k=0;k<4;k++)vnPlanter(-9+k*3.4,0,6.5,2.8,1.2,0,wood);for(let k=0;k<3;k++)vnPlanter(-9+k*3.4,0,9.2,2.8,1.2,0,wood);
 {const wx=7,wz=6;vPst('vPostS',wx,0,wz,1.3,1.1,stD);vB('vDarkB',wx,1.1,wz,1.6,.1,1.6,0);for(const s of[-1,1])vPst('vPost',wx+s*1.2,0,wz,.09,2.6,wood);vB('vWood',wx,2.5,wz,2.8,.14,.14,0,wood);vnHipRoof('vHipCu',wx,2.8,wz,2.0,2.0,.9,0,cu,.5);vPst('vRope',wx,1.2,wz,.02,1.3,vC(0xa89878));vnBarrel(wx+.4,1.1,wz+.3,.22,.35,wood);}
 vnDryingRack(-5,0,-CD/2+1.6,0,5);for(let k=0;k<7;k++)vPst('vClayPot',-CW/2+1.2,0,-8+k*1.3,rr(.22,.32),rr(.5,.8),vC(vPick([0x9a5a38,0xb87a4a,0x7a4a30,0x5a7a8a])));
 vnPaving(0,.02,(CD/2-3)/2+2,2.6,CD/2-3,0,st,6);vnLamp(-3.5,3.4,-1,0);
 vnFolk(0,2,4,3);}

VERN.def({key:'vern_school',name:'School',family:'civic',tags:VTAG_CIV,w:34,d:30,h:15,build:buildVernSchool});
VERN.def({key:'vern_hospital',name:'Hospital',family:'civic',tags:VTAG_CIV,w:38,d:28,h:16,build:buildVernHospital});
VERN.def({key:'vern_barracks',name:'Barracks and drill yard',family:'civic',tags:{type:['civic','military'],wealth:'civic',lit:true},w:48,d:38,h:14,build:buildVernBarracks});
VERN.def({key:'vern_alchemist',name:'Alchemist\'s compound',family:'civic',tags:{type:['civic','industry'],wealth:'civic',lit:true},w:32,d:28,h:19,build:buildVernAlchemist});
