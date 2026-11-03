// ================================================================= REPUBLICAN — the scrap and industrial district (round 9)
// Travis: "Create more salvage-forward buildings and use them and the recently made scrap buildings to flesh out the
// port-ward side of town as a large scrap and industrial district." Five more, built on the biggest wrecks: a rocket
// stage, a furnace of hull plate, a fuselage over a market, a sawtooth press shed, a gasholder. Born reclaimed.
// a market stall: four posts, a striped cloth roof, a trestle table and goods (used here and on the town's plazas).
// Furniture, the catalog's striped market stall; its cloth (unless given) and goods drew 1 + 35 numbers. Outside any
// builder (Roketstad's open-air markets) it is placed in world coordinates.
function hnStall(x,y,z,ry,c){hlRngSkip((c?0:1)+35);return FURNISH('hl_rep_market_stall',x,y,z,ry,VERN.cur?{}:{world:'rk_market'});}

// ---------------------------------------------------------------- 1. the stage tenement
// A spent rocket stage lying on concrete cradles — fins at the tail, the engine bell still on — made a row of homes:
// windows and doors cut along its flank, a plank walk on trestles in front, two frame storeys riding its back under
// steep gables, stairs up to them, washing and a stovepipe.
function buildHlRepStageTenement(G,o){reseed(22101+(o.v|0));const R=2.6,L=26,yc=.8+R;
 const hull=hC(vPick([0xd8d4c8,0xc8c4b8,0xb8b4a8])),red=hC(HPAL.red),rust=hC(vPick(HSV.rust)),log=hC(vPick(HPAL.aged)),lit=vLit()?'lit':'glass',corr=hC(vPick(HSV.corr));
 vnReg('Stage tenement',0,0,14,11);
 for(const x of[-9,-3,3,9])vB('boxCR',x,0,0,1,1.6,4.6,0,hC(vPick(HSV.conc)));
 kput('hTankC',[0,yc,0],qEuler(0,0,Math.PI/2),[R,L,R],hull);for(const x of[-10,-2,6])kput('vHoop',[x,yc,0],qEuler(0,Math.PI/2,0),[R*.99,R*.99,1.2],red);
 kput('vConeI',[-L/2-1.6,yc,0],qEuler(0,0,Math.PI/2),[R*.8,1.8,R*.8],rust);kput('hTankEnd',[L/2,yc,0],null,[R*.6,R,R],hull);                     // bell and nose
 for(let k=0;k<4;k++){const a=k*Math.PI/2+Math.PI/4;const p=[-L/2+1.6,yc+Math.sin(a)*(R+.9),Math.cos(a)*(R+.9)];kput('hPaint',p,qEuler(a,0,0),[3,.1,1.8],red);}   // fins
 for(let k=0;k<6;k++){const x=-8+k*3.4;if(k%2)vnDoor(x,.9,R*.98,0,.9,2,'hPaint',hC(vPick(HFRAME.postPoor)),hC(vPick(HPAL.tar)),false);else hnLatWin(x,yc-.3,R*.99,0,1,.9,lit,null);}
 vB('vWood',0,.8,R+.8,22,.12,1.4,0,log);for(let k=0;k<8;k++)vB('vWood',-10.5+k*3,0,R+.8,.14,.8,1.3,0,log);
 for(const x of[-5.5,5.5]){hnFachBox(x,yc+R-.35,0,7,2.6,4.2,0,null,null,lit);hnGable(x,yc+R+2.25,0,7,4.2,1.5,0,'vCorr',corr,.5,'vGableW',log);}
 vnStairs(11.4,.8,R+.1,Math.PI/2,1,R*2-.4,9,'vWood',log);vnChimney(-3.2,yc+R+1.6,-1.2,3,.12,true);
 hnCable([-8,yc+R+1.4,1.8],[-3,yc+R+1.4,1.8]);for(let k=0;k<4;k++)kput('vCloth',[-7.2+k*1.2,yc+R+1,1.8],null,[.7,.8,1],hC(vPick([0xefe7d6,0x3a6aa8,0xc0302a])));}

// ---------------------------------------------------------------- 2. the smelter
// A furnace block of rubble clad in hull plate, a glowing tap-hole and a slag heap still hot; two stacks; a timber
// conveyor climbing from the scrap bins to the charging hopper; a frame cast-house under a steep corrugated gable.
function buildHlRepSmelter(G,o){reseed(22111+(o.v|0));const rust=hC(vPick(HSV.rust)),iron=hC(0x3a3430),log=hC(vPick(HPAL.aged)),corr=hC(vPick(HSV.corr)),lit=vLit()?'lit':'glass';
 vnReg('Smelter',0,0,14,20);
 vB('hRubB',-3,0,0,9,7,8,0,hC(vPick(HPAL.rubble)));vnPatch(-3,.5,4.05,0,8,5.5,9);vnPatch(-7.55,.5,0,-Math.PI/2,7,5.5,8);
 vB('vDarkB',-3,.4,4.08,1.6,1.4,.06,0);kput('vEmber',[-3,.8,4.02],null,[.6,.45,.2]);kput('hRCHeap',[-3,-.05,7.5],null,[2.4,1.1,2],hC(0x3a3028));for(let k=0;k<5;k++)kput('vEmber',[-3+rr(-1.4,1.4),.35,7.5+rr(-1,1)],null,[.35,.18,.35]);
 for(const x of[-5.6,-.4]){vPst('vPipeR',x,7,-2.5,.7,11,null);for(let k=1;k<4;k++)kput('vHoop',[x,7+k*2.8,-2.5],qEuler(Math.PI/2,0,0),[.72,.72,2],iron);}
 kput('hTankC',[-3,8.2,1.4],null,[1.6,2.4,1.6],rust);kput('vConeI',[-3,6.4,1.4],qEuler(Math.PI,0,0),[1.6,1.2,1.6],rust);                             // the charging hopper
 beam('vWood',[8,1.2,3],[-1.4,9.2,1.4],.9,.12,log);for(let k=0;k<4;k++){const t=(k+.5)/4;vB('vWood',8-9.4*t,0,3-1.6*t,.2,1.2+8*t,.2,0,log);}   // the conveyor on trestles
 for(let k=0;k<3;k++)FURNISH('hl_rep_scrap_bin',8+k*2.2,0,5,0);   // the scrap bins at the conveyor's foot
 hnFachBox(6,0,-3,7,3.4,6,0,null,null,lit);hnGable(6,3.4,-3,7,6,1.5,0,'vCorr',corr,.6,'vGableW',log);}

// ---------------------------------------------------------------- 3. the wreck market hall
// A stretch of fuselage laid over the market: stalls under a hull vault on bracketed posts, open at the sides; a painted
// board over each end, lanterns under the vault.
function buildHlRepWreckMarket(G,o){reseed(22121+(o.v|0));const L=22,R=7,arc=Math.PI*.84,he=Math.cos(arc/2)*R,hw=Math.sin(arc/2)*R,eave=3.8,yc=eave-he;
 const hull=hC(vPick([0x9a968c,0x8e8a80,0xa49e90])),rust=hC(vPick(HSV.rust)),post=hC(vPick(HFRAME.post));
 vnReg('Wreck market hall',0,0,12,yc+R);
 kput('hVault',[0,yc,0],null,[L,R,R],hull);for(let k=0;k<=6;k++)kput('hVaultR',[-L/2+L*k/6,yc,0],null,[.3,R+.06,R+.06],rust);
 for(const s of[-1,1])for(let i=0;i<=6;i++){const x=-L/2+.3+(L-.6)*i/6,z=s*(hw-.2);kput('hCol',[x,0,z],null,[.16,eave-.35,.16],post);hnDougong(x,eave-.35,z,s>0?0:Math.PI,.34);}
 for(let k=0;k<4;k++)for(const s of[-1,1])hnStall(-8+k*5.3,0,s*2.8,s>0?0:Math.PI);
 for(let k=0;k<6;k++)hnLantern(-8+k*3.2,yc+R-1.2,0);
 for(const e of[-1,1])hnSignBoard(e*(L/2+.1),eave+1.2,0,e>0?Math.PI/2:-Math.PI/2,4,.9,vPick(['scales','sack','bread']));}

// ---------------------------------------------------------------- 4. the press works
// A long shed under a sawtooth of corrugated roofs (their glazed faces to the north), a rolling gantry over plate stacks
// in the yard, a frame office with its gable at the gate end.
function buildHlRepPressWorks(G,o){reseed(22131+(o.v|0));const W=24,D=14,H=4.4,corr=hC(vPick(HSV.corr)),log=hC(vPick(HPAL.aged)),iron=hC(0x3a3430),rust=hC(vPick(HSV.rust)),lit=vLit()?'lit':'glass';
 vnReg('Press works',0,0,14,8);
 vB('vCorr',0,0,0,W,H,D,0,corr.clone().multiplyScalar(.85));vnPatch(0,.5,D/2+.02,0,18,3,10);
 for(let k=0;k<5;k++){const x=-W/2+W*(k+.5)/5;kput('vCorr',[x,H+1.1,0],qEuler(0,0,.55),[W/5*1.12,.1,D+.4],corr);vB('vWinGlass',x+W/10-.15,H,0,.08,2.1,D-.4,0);}   // sawtooth roofs, glazed north lights
 vB('vDarkB',0,0,D/2+.03,5,3.6,.06,0);vB('vIron',0,3.8,D/2+.1,6,.2,.12,0,iron);
 for(const s of[-1,1]){beam('vIron',[s*9,0,D/2+2],[s*9,6,D/2+5],.25,.25,iron);beam('vIron',[s*9,0,D/2+8],[s*9,6,D/2+5],.25,.25,iron);}vB('vIron',0,6,D/2+5,19,.4,.5,0,rust);
 for(let k=0;k<3;k++){hlRngSkip(5);FURNISH('hl_rep_plate_stack',-5+k*5,0,D/2+5,0,{v:0});}   // plate stacks under the gantry
 hnFachBox(W/2+2.6,0,-2,4.2,2.8,5,0,null,null,lit);hnGable(W/2+2.6,2.8,-2,5,4.2,1.5,Math.PI/2,'vCorr',corr,.4,'vGableW',log);}

// ---------------------------------------------------------------- 5. the gasholder tenement
// An Ancient gasholder — a great drum in its lattice guide frame — its crown now a village roof: frame dwellings ring the
// base on a plank deck with carved balustrades, a second ring of little houses sits on the drum's top under gables,
// ladders and a stair climb the frame.
function buildHlRepGasholder(G,o){reseed(22141+(o.v|0));const R=9,H=10,iron=hC(0x4a4440),drum=hC(vPick([0x6a7a6a,0x7a6a5a,0x5a6a7a])),log=hC(vPick(HPAL.aged)),corr=hC(vPick(HSV.corr)),lit=vLit()?'lit':'glass';
 vnReg('Gasholder tenement',0,0,R+3,H+8);
 kput('hTankC',[0,H/2,0],null,[R,H,R],drum);kput('hTankCap',[0,H,0],null,[R,1.4,R],drum.clone().multiplyScalar(.9));
 for(let k=0;k<12;k++){const a=k/12*TAU;const p=[Math.sin(a)*(R+.6),Math.cos(a)*(R+.6)];vPst('vIron',p[0],0,p[1],.14,H+3,iron);
  const q=[Math.sin(a+TAU/12)*(R+.6),Math.cos(a+TAU/12)*(R+.6)];for(const y of[H*.5,H+3])beam('vIron',[p[0],y,p[1]],[q[0],y,q[1]],.1,.1,iron);}
 for(let k=0;k<5;k++){const a=-1.1+k*.55,p=[Math.sin(a)*(R+2.6),Math.cos(a)*(R+2.6)];hnFachBox(p[0],0,p[1],3.6,2.6,3.2,a,null,null,lit);hnGable(p[0],2.6,p[1],3.2,3.6,1.6,a+Math.PI/2,'vCorr',corr,.35,'vGableW',log);}
 for(let k=0;k<4;k++){const a=k*Math.PI/2+.4,p=[Math.sin(a)*R*.55,Math.cos(a)*R*.55];hnFachBox(p[0],H+.5,p[1],3.4,2.4,3,a,null,null,lit);hnGable(p[0],H+2.9,p[1],3,3.4,1.6,a+Math.PI/2,'vShingleB',hC(vPick(HPAL.shingle)),.35,'vGableW',log);}
 for(let k=0;k<16;k++){const a=k/16*TAU;const p=[Math.sin(a)*(R+.2),Math.cos(a)*(R+.2)];kput('hRailC',[p[0],H+1.9,p[1]],qEuler(0,a,0),[TAU*R/16,.7,1],log);}
 vnStairs(R+1.4,0,-3,Math.PI,1.1,H+.6,30,'vWood',log);vnLadder(-R-.7,0,1,0,H,log);}

const HTAG_SCRAP=(wealth,type,more)=>Object.assign({type,wealth,lit:false,salvage:true},more||{});
HL.def({key:'hl_rep_stage_tenement',name:'Stage tenement',branch:'republican',family:'Dwellings',tags:HTAG_SCRAP('poor',['multi-family dwelling']),w:32,d:9,h:11,build:buildHlRepStageTenement});
HL.def({key:'hl_rep_smelter',name:'Smelter',branch:'republican',family:'Industry',tags:HTAG_SCRAP('poor',['industry']),w:24,d:18,h:18,build:buildHlRepSmelter});
HL.def({key:'hl_rep_wreck_market',name:'Wreck market hall',branch:'republican',family:'Shops and workshops',tags:HTAG_SCRAP('poor',['market/shop'],{lit:true}),w:24,d:14,h:10,build:buildHlRepWreckMarket});
HL.def({key:'hl_rep_press_works',name:'Press works',branch:'republican',family:'Industry',tags:HTAG_SCRAP('poor',['industry']),w:32,d:28,h:8,build:buildHlRepPressWorks});
HL.def({key:'hl_rep_gasholder',name:'Gasholder tenement',branch:'republican',family:'Dwellings',tags:HTAG_SCRAP('poor',['multi-family dwelling']),w:26,d:26,h:16,build:buildHlRepGasholder});
