// ================================================================= IZIZ VERNACULAR — dwellings
// Three wealth tiers, front toward +z. Poor: stilts, boards, salvage, thatch,
// no light. Middle: timber frame, plaster, wooden stepped cornice, shutter
// strips, salvaged-sheet roofs, no light. Rich: battered stone, stone cornice
// and deco strips, hardwood upper storey, copper roof, courtyard wall,
// electric lamps and lit glazing.
const VTAG_SF={type:['single-family dwelling']},VTAG_MF={type:['multi-family dwelling']};

// ---------------------------------------------------------------- POOR
// A — stilt hut: a board box on stilts under a steep thatch gable, ladder up to a front platform
function buildVernPoorA(G,o){reseed(7101+(o.v|0));const W=5.6,D=6.2,FL=1.7,H=2.5;const wood=vC(vPick(VPAL.woodPoor)),th=vC(vPick(VPAL.thatch));
 vnReg('Stilt hut (poor)',0,0,5.6,FL+H+3.6);
 vnStilts(0,0,0,W-.7,D-.7,FL,0,wood);
 vB('vWood',0,FL-.2,0,W,.2,D,0,wood);                                   // floor
 vB('vWood',0,FL,0,W-.3,H,D-.3,0,wood.clone().multiplyScalar(.94));     // board walls
 vnPatch(0,FL,D/2-.15,0,W-.3,H,3);vnPatch(-W/2+.15,FL,0,-Math.PI/2,D-.3,H,2);vnPatch(0,FL,-D/2+.15,Math.PI,W-.3,H,2);
 vnGableRoof(0,FL+H,0,W-.3,D-.3,2.7,0,'vGableT',th,1.15,'vGableW',wood,.5);
 vB('vWood',0,FL-.2,D/2+.75,2.6,.2,1.5,0,wood);                         // front platform
 for(const s of[-1,1])vPst('vPostB',s*1.2,-.2,D/2+1.35,.14,FL,wood);
 vnLadder(0,0,D/2+1.9,0,FL+.3,wood);
 vnDoor(0,FL,D/2-.15,0,.95,1.85,'vWood',wood,vC(0x7a6a58),false);
 vnWin(-1.7,FL+1.2,D/2-.15,0,.85,.7,'open','vWood',wood);vPl('vTarp',-1.7,FL+1.25,D/2+.03,.95,.62,0,vC(0xb8a070),-.35);   // woven blind, rolled half down
 vnWin(W/2-.15,FL+1.2,-.6,Math.PI/2,.85,.7,'open','vWood',wood);
 for(let k=0;k<4;k++)vBall('vGourd',-W/2+.6+k*1.2,FL+H-.35,D/2+.9,.17,vC(vPick([0xb08a4a,0x8a9a3a,0xc09a5a])),.24);   // gourds under the eave
 vnWaterButt(W/2+1.0,0,D/2-.9,.42,1.1);vnDryingRack(-W/2-1.6,0,.8,Math.PI/2,3.2);vnCrate(W/2+1.1,0,-1.4,.9,.3);
 vnFolk(2.2,D/2+3.4,2,1.2);}
// B — corrugate shack: a salvage box on a rubble pad under a shed roof weighted with stones, lean-to on one side
function buildVernPoorB(G,o){reseed(7111+(o.v|0));const W=6,D=5,H=2.6;const wood=vC(vPick(VPAL.woodPoor));
 vnReg('Corrugate shack (poor)',0,0,5.6,H+2.2);
 vnPaving(0,.05,0,W+2,D+2,0,vC(0x8a7a6a),14);vB('vStone',0,0,0,W+.6,.35,D+.6,0,vC(0x9a8a78));
 vnFrame(0,.35,0,W,H,D,0,wood,.12);
 vB('vCorr',0,.35,0,W-.2,H,D-.2,0);                                     // corrugate skin inside the frame
 vnPatch(0,.35,D/2-.1,0,W,H,4);vnPatch(W/2-.1,.35,0,Math.PI/2,D,H,3);vnPatch(0,.35,-D/2+.1,Math.PI,W,H,3);
 vnShedRoof(0,.35+H,0,W,D,1.1,0,'vCorr',null,.8,.12);
 for(let k=0;k<7;k++){const zz=rr(-D/2+.6,D/2-.6);kput('vRock',[rr(-W/2,W/2),.35+H+1.1*(zz+D/2)/D+.14,zz],qEuler(rng(),rng(),0),[.3,.22,.28],vC(vPick([0x8a8078,0x6a625a,0x9a9088])));}   // stones holding the sheet down
 vnDoor(-1.4,.35,D/2-.1,0,.95,1.9,'vWood',wood,vC(0x8a7a66));
 vnWin(1.5,.35+1.2,D/2-.1,0,.9,.6,'shut','vWood',wood);
 vnChimney(W/2-.8,.35+H+.6,-D/2+.9,1.6,.14,true);
 // lean-to: tarp on poles against the +x wall
 for(const z of[-D/2+.2,D/2-.2])vPst('vPost',W/2+2.4,0,z,.07,2.1,wood);
 kput('vTarpB',[W/2+1.25,.35+H-.5,0],vQ(0,0,.28),[2.7,.06,D-.2],vC(0xb0a080));
 vnBarrel(W/2+1.6,0,-1.2,.42,1.0,wood);vnCrate(W/2+1.9,0,.6,.8,.2,wood);vnSacks(W/2+1.1,0,1.4,4);
 vnFolk(-2.5,D/2+3,2,1);}
// C — panel house: timber frame filled with cut Ancient panels, ghost-white and rust, under a thatch hip roof; low veranda
function buildVernPoorC(G,o){reseed(7121+(o.v|0));const W=6.6,D=6.4,FL=.6,H=2.7;const wood=vC(vPick(VPAL.woodPoor)),th=vC(vPick(VPAL.thatch));
 vnReg('Panel house (poor)',0,0,6.2,FL+H+3.4);
 vnStilts(0,0,0,W-.5,D-.5,FL,0,wood,.15);vB('vWood',0,FL-.18,0,W,.18,D,0,wood);
 vnFrame(0,FL,0,W-.2,H,D-.2,0,wood,.13);
 // infill: one panel per bay, alternating ghost-white and rusted plate, each a little off
 const bays=[[0,D/2-.1,W-.2,0],[0,-D/2+.1,W-.2,Math.PI],[W/2-.1,0,D-.2,Math.PI/2],[-W/2+.1,0,D-.2,-Math.PI/2]];
 for(const b of bays){const n=Math.round(b[2]/2.2);for(let i=0;i<n;i++){const lx=-b[2]/2+b[2]*(i+.5)/n;const p=loc(b[0],b[1],lx,-.05,b[3]);
  kput(rng()<.6?'vPanelB':'vRustB',[p[0],FL+H/2,p[1]],vQ(b[3],0,rr(-.03,.03)),[b[2]/n-.3,H-.25,.08],null);}}
 vnHipRoof('vHipT',0,FL+H,0,W,D,2.4,0,th,1.25);
 vnVeranda(0,0,D/2+1.0,W-.8,2.0,0,FL,2.5,wood);vnStairs(1.6,0,D/2+2.3,0,1.1,FL,3,'vWood',wood);
 vnShedRoof(0,FL+2.5,D/2+1.0,W-.8,2.0,.5,0,'vThatchB',th,.5,.3);
 vnDoor(-.6,FL,D/2-.1,0,.95,1.9,'vWood',wood,vC(0x6a5a4a),false);
 vnWin(1.9,FL+1.3,D/2-.1,0,.9,.8,'open','vWood',wood,true);vnWin(-W/2+.1,FL+1.4,.4,-Math.PI/2,.9,.7,'shut','vWood',wood);
 vnWaterButt(-W/2-.9,0,D/2-1.2,.4,1.0);vnPlanter(W/2+.9,0,D/2-.5,1.6,.7,0,wood);vnCrate(-W/2-1.1,0,-1.6,.8,.5,wood);
 vnFolk(-2.4,D/2+3.6,2,1.1);}

// ---------------------------------------------------------------- MIDDLE
// A — plaster townhouse: two storeys, exposed corner posts and string course, shutter strips above, salvaged-sheet gable roof
function buildVernMidA(G,o){reseed(7201+(o.v|0));const W=8.4,D=8.8,H1=3.3,H2=3.0,Y0=.4;const wood=vC(vPick(VPAL.woodMid)),pl=vC(vPick(VPAL.sand));
 vnReg('Plaster townhouse (middle)',0,0,7.6,Y0+H1+H2+3.6);
 vB('vStone',0,-.1,0,W+.5,.5,D+.5,0,vC(vPick(VPAL.stoneDark)));
 vB('vPlaster',0,Y0,0,W,H1,D,0,pl);vB('vWood',0,Y0+H1,0,W+.34,.3,D+.34,0,wood);vB('vPlaster',0,Y0+H1+.3,0,W,H2,D,0,pl.clone().multiplyScalar(1.04));
 for(const sx of[-1,1])for(const sz of[-1,1])vPst('vPost',sx*(W/2-.02),Y0,sz*(D/2-.02),.17,H1+H2+.32,wood);
 const top=vnCornice('vWood',0,Y0+H1+.3+H2,0,W,D,0,wood,2);
 vnGableRoof(0,top,0,W,D,2.5,0,'vGableC',null,1.0,'vGablePl',pl,.16);
 // ground floor: door left, shuttered window right, side windows
 vnDoor(-1.6,Y0,D/2,0,1.15,2.3,'vWood',wood,vC(0x6a4a30));
 vnWin(2.1,Y0+1.1,D/2,0,1.3,1.3,'open','vWood',wood,true);
 vnWin(W/2,Y0+1.2,-1.8,Math.PI/2,1.1,1.2,'shut','vWood',wood);vnWin(W/2,Y0+1.2,1.8,Math.PI/2,1.1,1.2,'open','vWood',wood,true);
 vnWin(-W/2,Y0+1.2,0,-Math.PI/2,1.1,1.2,'open','vWood',wood,true);vnWin(0,Y0+1.3,-D/2,Math.PI,1.1,1.1,'shut','vWood',wood);
 // upper floor: three deco shutter strips on the front, two each side
 for(const x of[-2.5,0,2.5])vnStrip(x,Y0+H1+.7,D/2,0,.75,2.2,'vWood',wood);
 for(const s of[-1,1])for(const z of[-2.2,2.2])vnStrip(s*W/2,Y0+H1+.7,z,s*Math.PI/2,.7,2.0,'vWood',wood);
 // porch over the door and an awning over the window
 vnVeranda(-1.6,Y0,D/2+1.1,3.6,2.2,0,.04,2.7,wood);vnShedRoof(-1.6,Y0+2.7,D/2+1.1,3.6,2.2,.7,0,'vPanelB',null,.4,.1);
 vnAwning(2.1,Y0+2.6,D/2,0,2.0,1.2,vC(vPick(VPAL.awning)));
 vnPlanter(3.6,Y0-.1,D/2+.9,1.4,.6,0,wood);vnPlanter(-4.0,Y0-.1,D/2+.9,1.2,.6,0,wood);vnBarrel(W/2+.8,0,-D/2+1.2,.4,1.0,wood);
 vnPaving(0,.02,D/2+2.6,W,2.2,0,vC(vPick(VPAL.stoneDark)),10);vnFolk(1.5,D/2+4,3,1.4);}
// B — setback house: a big plaster ground storey, a smaller upper storey set back behind a roof terrace; two households, outside stair
function buildVernMidB(G,o){reseed(7211+(o.v|0));const W=9.4,D=9,H1=3.4,W2=6.2,D2=5.6,H2=2.9,Y0=.35;const wood=vC(vPick(VPAL.woodMid)),pl=vC(vPick(VPAL.sand)),pl2=vC(vPick(VPAL.adobe));const Z2=-(D-D2)/2+.25;
 vnReg('Setback house (middle, two households)',0,0,8.2,Y0+H1+H2+3.2);
 vB('vStone',0,-.1,0,W+.5,.45,D+.5,0,vC(vPick(VPAL.stoneDark)));
 vB('vPlaster',0,Y0,0,W,H1,D,0,pl);const t1=vnCornice('vWood',0,Y0+H1,0,W,D,0,wood,2,false);
 vB('vWood',0,t1,0,W+.3,.2,D+.3,0,wood);                                // terrace deck edge
 vB('vPlaster',0,t1+.2,Z2,W2,H2,D2,0,pl2);vnCornice('vWood',0,t1+.2+H2,Z2,W2,D2,0,wood,2);
 vnHipRoof('vHipC',0,t1+.2+H2+.84,Z2,W2,D2,2.0,0,null,1.1);
 for(const sx of[-1,1])for(const sz of[-1,1])vPst('vPost',sx*(W/2-.02),Y0,sz*(D/2-.02),.17,H1+.7,wood);
 // terrace rail (front and sides), a cloth awning on poles over the terrace
 {const y=t1+.2,zf=D/2-.12;for(let i=0;i<=6;i++){vPst('vPost',-W/2+.3+(W-.6)*i/6,y,zf,.07,1.0,wood);}
  vB('vWood',0,y+.95,zf,W-.4,.1,.1,0,wood);for(const s of[-1,1]){const x=s*(W/2-.12);for(let j=0;j<=2;j++)vPst('vPost',x,y,Z2+D2/2+.3+(zf-Z2-D2/2-.3)*j/2,.07,1.0,wood);vB('vWood',x,y+.95,(Z2+D2/2+.3+zf)/2,.1,.1,zf-(Z2+D2/2+.3),0,wood);}
  for(const s of[-1,1])vPst('vPost',s*2.6,y,D/2-.6,.07,2.5,wood);kput('vClothB',[0,y+2.55,Z2+D2/2+1.5],vQ(0,.12,0),[6.2,.06,3.4],vC(vPick(VPAL.awning)));}
 // doors: two on the ground front; the upper household's door opens onto the terrace
 vnDoor(-2.6,Y0,D/2,0,1.1,2.2,'vWood',wood,vC(0x6a4a30));vnDoor(2.6,Y0,D/2,0,1.1,2.2,'vWood',wood,vC(0x8a5a36));
 vnDoor(0,t1+.2,Z2+D2/2,0,1.0,2.0,'vWood',wood,vC(0x6a4a30),false);
 vnWin(0,Y0+1.2,D/2,0,1.3,1.2,'open','vWood',wood,true);
 for(const s of[-1,1]){vnWin(s*W/2,Y0+1.2,-2,s*Math.PI/2,1.1,1.2,'open','vWood',wood,true);vnWin(s*W/2,Y0+1.2,2,s*Math.PI/2,1.1,1.2,'shut','vWood',wood);
  vnWin(s*W2/2,t1+.2+1.0,Z2,s*Math.PI/2,1.0,1.1,'open','vWood',wood,true);}
 vnStrip(-1.9,t1+.6,Z2+D2/2,0,.7,1.9,'vWood',wood);vnStrip(1.9,t1+.6,Z2+D2/2,0,.7,1.9,'vWood',wood);vnWin(0,t1+.2+1.1,Z2-D2/2,Math.PI,1.1,1.0,'shut','vWood',wood);
 // outside stair up the +x side to the terrace
 {const steps=11,run=steps*.32;vnStairs(W/2+.7,Y0,D/2-run/2-.4,0,1.1,t1-Y0,steps,'vWood',wood);
  vB('vWood',W/2+.7,t1-.05,-D/2+1.1,1.2,.15,2.2,0,wood);for(let k=0;k<=3;k++)vPst('vPostB',W/2+.7+(k%2?.5:-.5),0,D/2-run*(k/3)-.4,.12,Y0+(t1-Y0)*(k/3)+.4,wood);}
 vnPlanter(-3.8,t1+.2,D/2-.5,1.4,.6,0,wood);vnPlanter(3.8,t1+.2,D/2-.5,1.4,.6,0,wood);vnBarrel(-W/2-.8,0,D/2-1,.4,1.0,wood);vnCrate(-W/2-1,0,-1.5,.9,.4,wood);
 vnDryingRack(0,t1+.2,Z2-D2/2-1.2,0,3.6);vnFolk(0,D/2+3.6,3,1.6);}
// C — long house: timber frame and plaster under a broad shingle hip roof, full-width veranda, fenced front yard
function buildVernMidC(G,o){reseed(7221+(o.v|0));const W=11,D=7.2,H=3.7,FL=.5;const wood=vC(vPick(VPAL.woodMid)),pl=vC(vPick(VPAL.adobe)),sh=vC(vPick([0x8a6a4a,0x7a5a3e,0x9a7a56]));
 vnReg('Long house (middle)',0,0,9.5,FL+H+3.6);
 vnStilts(0,0,0,W-.6,D-.6,FL,0,wood,.16);vB('vWood',0,FL-.2,0,W+.2,.2,D+.2,0,wood);
 vnFrame(0,FL,0,W,H,D,0,wood,.15);vB('vPlaster',0,FL,0,W-.12,H,D-.12,0,pl);
 vnCornice('vWood',0,FL+H,0,W,D,0,wood,1,false);
 vnHipRoof('vHipS',0,FL+H+.32,0,W,D,2.8,0,sh,1.3);
 vnVeranda(0,0,D/2+1.15,W-.4,2.3,0,FL,2.7,wood);vnStairs(-3.2,0,D/2+2.6,0,1.3,FL,3,'vWood',wood);
 vnShedRoof(0,FL+2.7,D/2+1.15,W-.4,2.3,.6,0,'vShingleB',sh,.5,.14);
 vnDoor(-1.8,FL,D/2-.06,0,1.1,2.2,'vWood',wood,vC(0x6a4a30),false);vnDoor(2.8,FL,D/2-.06,0,1.0,2.1,'vWood',wood,vC(0x7a5a36),false);
 vnWin(0.5,FL+1.2,D/2-.06,0,1.2,1.2,'open','vWood',wood,true);vnWin(-4.2,FL+1.2,D/2-.06,0,1.1,1.2,'shut','vWood',wood);
 for(const s of[-1,1])vnWin(s*W/2,FL+1.3,0,s*Math.PI/2,1.1,1.1,'open','vWood',wood,true);
 for(const x of[-3.5,0,3.5])vnWin(x,FL+1.3,-D/2+.06,Math.PI,1.1,1.1,'shut','vWood',wood);
 vnFence(0,0,D/2+3.6,W+3,3.4,0,wood,1.6,1.1);vnPaving(0,.02,D/2+3.5,1.6,3.2,0,vC(vPick(VPAL.stoneDark)),6);
 vnPlanter(-W/2+1.2,0,D/2+2.5,1.6,.7,0,wood);vnPlanter(W/2-1.2,0,D/2+2.5,1.6,.7,0,wood);vnWaterButt(W/2+.9,0,-1.5,.42,1.1);vnDryingRack(-W/2-1.6,0,0,Math.PI/2,3.4);
 for(let k=0;k<3;k++)vBall('vGourd',-W/2+1.4+k*1.1,FL+H-.2,D/2+2.2,.16,vC(vPick([0xb08a4a,0x8a9a3a])),.22);
 vnFolk(2,D/2+5.6,3,1.4);}

// ---------------------------------------------------------------- RICH
// battered face helper: half-width of a batter wedge (taper .86) at height y above its base
const vBatHalf=(W,H,y)=>W/2*(1-.14*clamp(y/H,0,1));
// A — stone manor: battered ashlar ground storey with stepped stone cornice and fluted strips, hardwood gallery storey, copper hip roof, corner tower, walled court
function buildVernRichA(G,o){reseed(7301+(o.v|0));const W=14,D=12,H1=4.6,W2=11,D2=9.4,H2=3.4,Y0=.6;const st=vC(vPick(VPAL.stone)),stD=vC(vPick(VPAL.stoneDark)),wood=vC(vPick(VPAL.woodRich)),cu=vC(0xffffff);
 vnReg('Stone manor (rich)',0,0,15,Y0+H1+H2+4.5);vnReg('Manor courtyard wall',0,0,14.5,2.6,{type:['single-family dwelling'],part:'wall'});
 // court: paving, wall, gate, lamps
 vB('vStone',0,0,0,W+2,Y0,D+2,0,stD);                                                  // raised stone terrace
 {const CW=26,CD=22,h=2.4;for(const s of[-1,1]){vB('vStone',s*CW/2,0,0,.6,h,CD,0,stD);vB('vStone',s*CW/2,h,0,.9,.3,CD+.3,0,st);}
  vB('vStone',0,0,-CD/2,CW,h,.6,0,stD);vB('vStone',0,h,-CD/2,CW+.3,.3,.9,0,st);
  for(const s of[-1,1]){const L=CW/2-2;vB('vStone',s*(2+L/2),0,CD/2,L,h,.6,0,stD);vB('vStone',s*(2+L/2),h,CD/2,L+.3,.3,.9,0,st);
   vB('vStone',s*2.3,0,CD/2,1.0,h+.9,1.0,0,st);kput('vPyrCu',[s*2.3,h+.9,CD/2],null,[1.2,.7,1.2],cu);vnLampPost(s*3.4,0,CD/2+1.2,3.2);}
  for(let k=-3;k<=3;k++)vB('vIron',k*.5,0,CD/2,.06,h-.3,.06,0,vC(0x2e2a26));vB('vIron',0,h-.5,CD/2,3.6,.08,.08,0,vC(0x2e2a26));vB('vIron',0,.6,CD/2,3.6,.08,.08,0,vC(0x2e2a26));   // iron gate
  vnPaving(0,.02,(D/2+1+CD/2)/2,2.6,CD/2-D/2-1,0,st,6);vnPlanter(-5,0,D/2+2.8,2.4,.9,0,wood);vnPlanter(5,0,D/2+2.8,2.4,.9,0,wood);}
 // ground storey
 vnPlinth('vBatterS',0,Y0,0,W,H1,D,0,st);
 const c1=vnCornice('vStone',0,Y0+H1+.2,0,W*.86,D*.86,0,st,3);
 // fluted deco strips and lit windows on the battered face (face recedes with height: offset by vBatHalf)
 {const y=Y0+1.6,hf=vBatHalf(W,H1,1.6),df=vBatHalf(D,H1,1.6);
  // each window sits in a flat REVEAL block: its front is vertical and flush with the face at the sill, its back buried
  // where the face recedes, so the frame no longer stands proud at the head and sinks at the sill (Round 1 issue)
  const bw=(px,pz,ry,L,kind)=>{const nx=Math.sin(ry),nz=Math.cos(ry),tx=Math.cos(ry),tz=-Math.sin(ry),al=px*tx+pz*tz;
   const f0=vBatHalf(L,H1,1.6-.3)+.04,f1=vBatHalf(L,H1,1.6+1.7+.35),dep=f0-f1+.25;
   vB('vStone',tx*al+nx*(f0-dep/2),y-.3,tz*al+nz*(f0-dep/2),1.2+.7,1.7+.65,dep,ry,st);vnWin(tx*al+nx*f0,y,tz*al+nz*f0,ry,1.2,1.7,kind,'vStone',st);};
  for(const x of[-4.6,-2.3,2.3,4.6])bw(x,df,0,D,'lit');for(const x of[-3.45,0,3.45])vnStrip(x,Y0+.9,df+.02,0,.7,3.2,'vStone',stD);
  for(const s of[-1,1])for(const z of[-3.2,0,3.2])bw(s*hf,z,s*Math.PI/2,W,'lit');for(const x of[-3.5,0,3.5])bw(x,-df,Math.PI,D,'glass');}
 vnStairs(0,0,D/2+1.9,0,3.2,Y0,3,'vStone',st);vnDoor(0,Y0,vBatHalf(D,H1,1.3),0,1.7,2.9,'vStone',st,vC(0x4a2e1c));
 // gallery storey in hardwood, balcony to the front
 vB('vWood',0,c1,0,W2,H2,D2,0,wood);for(const sx of[-1,1])for(const sz of[-1,1])vPst('vPost',sx*(W2/2-.02),c1,sz*(D2/2-.02),.2,H2,wood.clone().multiplyScalar(.8));
 for(const x of[-3.6,-1.2,1.2,3.6])vnWin(x,c1+1.0,D2/2,0,1.2,1.6,'lit','vWood',wood);for(const s of[-1,1])for(const z of[-2.8,0,2.8])vnWin(s*W2/2,c1+1.0,z,s*Math.PI/2,1.1,1.6,'lit','vWood',wood);
 for(const x of[-3.6,0,3.6])vnWin(x,c1+1.0,-D2/2,Math.PI,1.1,1.5,'glass','vWood',wood);
 {const bz=D2/2+.9,bw=W2-1;vB('vWood',0,c1-.25,bz,bw,.25,1.8,0,wood);for(let i=0;i<=5;i++)vPst('vPost',-bw/2+bw*i/5,c1,bz+.8,.09,1.05,wood);vB('vWood',0,c1+1.0,bz+.8,bw,.1,.1,0,wood);
  for(let i=0;i<=5;i++)vBeam([-bw/2+bw*i/5,c1-.3,bz+.7],[-bw/2+bw*i/5,c1-1.3,D*.86/2+.2],.14,wood);}
 const top=vnCornice('vWood',0,c1+H2,0,W2,D2,0,wood,2);vnHipRoof('vHipCu',0,top,0,W2,D2,2.7,0,cu,1.3);
 // corner tower with a copper pyramid cap and finial
 {const tx=-W/2+1.4,tz=-D/2+1.4,TH=Y0+H1+H2+3.2;vB('vStone',tx,Y0,tz,3.8,TH-Y0,3.8,0,st);vnCornice('vStone',tx,TH,tz,3.8,3.8,0,st,2);
  for(let k=0;k<4;k++){const a=k*Math.PI/2;const p=loc(tx,tz,0,1.9,a);vnWin(p[0],TH-2.6,p[1],a,.8,1.4,'lit','vStone',st);}
  kput('vPyrCu',[tx,TH+.9,tz],null,[4.4,2.6,4.4],cu);vBall('vFinial',tx,TH+3.7,tz,.3);}
 for(const x of[-2.4,2.4])vnLamp(x,Y0+3.4,vBatHalf(D,H1,2.8),0);
 vnFolk(0,D/2+6,3,1.6);}
// B — domed house: two storeys of ashlar under a copper dome, stone loggia across the front, corner pyramids, garden wall
function buildVernRichB(G,o){reseed(7311+(o.v|0));const W=12.4,D=11.6,H1=4.0,H2=3.5,Y0=.5;const st=vC(vPick(VPAL.stone)),stD=vC(vPick(VPAL.stoneDark)),wood=vC(vPick(VPAL.woodRich)),cu=vC(0xffffff);
 vnReg('Domed house (rich)',0,0,13,Y0+H1+H2+6);vnReg('Garden wall',0,0,13.5,2.4,{part:'wall'});
 vB('vStone',0,0,0,W+1.6,Y0,D+1.6,0,stD);
 {const CW=24,CD=21,h=2.1;for(const s of[-1,1]){vB('vStone',s*CW/2,0,0,.55,h,CD,0,stD);vB('vStone',s*CW/2,h,0,.85,.28,CD+.3,0,st);}
  vB('vStone',0,0,-CD/2,CW,h,.55,0,stD);vB('vStone',0,h,-CD/2,CW+.3,.28,.85,0,st);
  for(const s of[-1,1]){const L=CW/2-1.8;vB('vStone',s*(1.8+L/2),0,CD/2,L,h,.55,0,stD);vB('vStone',s*(1.8+L/2),h,CD/2,L+.3,.28,.85,0,st);vB('vStone',s*2.05,0,CD/2,.9,h+.8,.9,0,st);vBall('vFinial',s*2.05,h+1.05,CD/2,.28);}
  vnLampPost(-3.2,0,CD/2+1,3.0);vnLampPost(3.2,0,CD/2+1,3.0);
  for(let k=-2;k<=2;k++)vB('vIron',k*.6,0,CD/2,.06,h-.2,.06,0,vC(0x2e2a26));vB('vIron',0,h-.4,CD/2,3.2,.08,.08,0,vC(0x2e2a26));
  vnPaving(0,.02,(D/2+.8+CD/2)/2,2.4,CD/2-D/2-.8,0,st,5);for(const s of[-1,1]){vnPlanter(s*6,0,D/2+3,2.8,1.0,0,wood);vnPlanter(s*8.5,0,-2,1.0,3.0,0,wood);}}
 vB('vStone',0,Y0,0,W,H1,D,0,st);const c1=vnCornice('vStone',0,Y0+H1,0,W,D,0,st,2);
 vB('vStone',0,c1,0,W-.6,H2,D-.6,0,st.clone().multiplyScalar(1.03));const c2=vnCornice('vStone',0,c1+H2,0,W-.6,D-.6,0,st,3);
 vB('vStone',0,c2,0,W-.4,.6,D-.4,0,stD);                                                 // parapet
 for(const sx of[-1,1])for(const sz of[-1,1]){vB('vStone',sx*(W/2-1.2),c2,sz*(D/2-1.2),1.6,1.2,1.6,0,st);kput('vPyrCu',[sx*(W/2-1.2),c2+1.2,sz*(D/2-1.2)],null,[1.9,1.2,1.9],cu);}
 // drum + dome
 vPst('vPostS',0,c2+.4,0,3.9,1.7,st);vB('vStone',0,c2+2.1,0,8.4,.3,8.4,0,stD);for(let k=0;k<12;k++){const a=k/12*TAU;vB('vDarkB',Math.cos(a)*3.9,c2+.9,Math.sin(a)*3.9,.5,.8,.2,-a+Math.PI/2);}
 kput('vDomeC',[0,c2+2.4,0],null,[4.1,3.3,4.1],cu);vBall('vFinial',0,c2+5.8,0,.32);
 // loggia across the front: stone posts carrying a slab at c1
 {const lz=D/2+1.4;vB('vStone',0,Y0-.02,lz-.2,W-1,.3,2.8,0,stD);for(let i=0;i<=5;i++){const x=-(W-1.6)/2+(W-1.6)*i/5;vPst('vPostS',x,Y0,lz+.9,.24,H1-.2,st);vB('vStone',x,Y0+H1-.2,lz+.9,.7,.22,.7,0,stD);}
  vB('vStone',0,Y0+H1,lz-.1,W-.6,.32,2.6,0,st);vB('vStone',0,Y0+H1+.32,lz+1.15,W-.6,.14,.5,0,stD);}
 vnStairs(0,0,D/2+3.4,0,3.4,Y0,3,'vStone',st);vnDoor(0,Y0,D/2,0,1.6,2.8,'vStone',st,vC(0x4a2e1c),false);
 for(const x of[-4.2,-2.1,2.1,4.2])vnWin(x,Y0+1.3,D/2,0,1.1,1.8,'lit','vStone',st);for(const x of[-3.6,-1.2,1.2,3.6])vnWin(x,c1+1.0,D/2-.3,0,1.1,1.6,'lit','vStone',st);
 for(const s of[-1,1]){for(const z of[-3.5,-1.2,1.2,3.5])vnWin(s*W/2,Y0+1.3,z,s*Math.PI/2,1.1,1.7,'lit','vStone',st);for(const z of[-2.8,0,2.8])vnWin(s*(W/2-.3),c1+1.0,z,s*Math.PI/2,1.0,1.5,'lit','vStone',st);
  vnStrip(s*(W/2-.3),c1+.5,-4.4,s*Math.PI/2,.6,2.6,'vStone',stD);vnStrip(s*(W/2-.3),c1+.5,4.4,s*Math.PI/2,.6,2.6,'vStone',stD);}
 for(const x of[-4.8,-2.4,0,2.4,4.8])vnStrip(x,c1+.4,D/2-.28,0,.6,2.8,'vStone',stD);for(const x of[-3,0,3])vnWin(x,Y0+1.3,-D/2,Math.PI,1.1,1.7,'glass','vStone',st);
 vnFolk(0,D/2+7,3,1.8);}

VERN.def({key:'vern_house_poor_a',name:'Stilt hut',family:'dwelling',tags:Object.assign({wealth:'poor',lit:false},VTAG_SF),w:8,d:10,h:8,build:buildVernPoorA});
VERN.def({key:'vern_house_poor_b',name:'Corrugate shack',family:'dwelling',tags:Object.assign({wealth:'poor',lit:false},VTAG_SF),w:10,d:8,h:5,build:buildVernPoorB});
VERN.def({key:'vern_house_poor_c',name:'Panel house',family:'dwelling',tags:Object.assign({wealth:'poor',lit:false},VTAG_SF),w:9,d:10,h:7,build:buildVernPoorC});
VERN.def({key:'vern_house_mid_a',name:'Plaster townhouse',family:'dwelling',tags:Object.assign({wealth:'middle',lit:false},VTAG_SF),w:10,d:13,h:11,build:buildVernMidA});
VERN.def({key:'vern_house_mid_b',name:'Setback house',family:'dwelling',tags:Object.assign({wealth:'middle',lit:false},VTAG_MF),w:12,d:11,h:11,build:buildVernMidB});
VERN.def({key:'vern_house_mid_c',name:'Long house',family:'dwelling',tags:Object.assign({wealth:'middle',lit:false},VTAG_SF),w:15,d:14,h:8,build:buildVernMidC});
VERN.def({key:'vern_house_rich_a',name:'Stone manor',family:'dwelling',tags:Object.assign({wealth:'rich',lit:true},VTAG_SF),w:28,d:24,h:16,build:buildVernRichA});
VERN.def({key:'vern_house_rich_b',name:'Domed house',family:'dwelling',tags:Object.assign({wealth:'rich',lit:true},VTAG_SF),w:26,d:23,h:16,build:buildVernRichB});
