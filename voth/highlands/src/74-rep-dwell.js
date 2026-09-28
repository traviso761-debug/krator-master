// ================================================================= HIGHLANDS / REPUBLICAN — dwellings
// The Iron Republic's houses, three wealth tiers. Poor: the log izba of the hill towns — round logs, a steep
// shingle gable to the street, white-painted nalichniki, salvage sheet where the shingle has failed (the Iziz
// note). Middle: the Transylvanian-Saxon townhouse — fieldstone socle, rendered ground storey in a painted
// colour, a jettied half-timbered upper storey, steep scale roof gable-end to the street. Rich: the Peles villa —
// rubble socle, cream stucco with quoins, red-brown half-timber above, slate roofs and a loggia tower; electric.
// Seeds 20100–20399.

// ---------------------------------------------------------------- POOR
// A — log izba: gable to the street, two nalichnik windows on the gable wall, door and a small porch on the side
function buildHlRepPoorA(G,o){reseed(20101+(o.v|0));const W=6.4,D=6.8,H=2.7,F=.45;
 const log=hC(vPick(HPAL.pine)).multiplyScalar(rr(.82,.95)),trim=hC(vPick([HPAL.white,HPAL.white,HPAL.blue,HPAL.teal])),sh=hC(vPick(HPAL.shingle));
 vnReg('Log izba (poor)',0,0,5.4,F+H+4.2);
 vB('hRubB',0,0,0,W+.3,F,D+.3,0,hC(vPick(HPAL.rubble)));
 hnLogBox(0,F,0,W,H,D,0,log);
 const top=hnGable(0,F+H,0,D,W,1.25,Math.PI/2,'vShingleB',sh,.7,'vGableW',log.clone().multiplyScalar(.9));
 hnBarge(0,F+H,0,D,W,1.25*W/2,Math.PI/2,.7,trim,'lace');
 for(const s of[-1,1])hnNal(s*1.45,F+.95,D/2,0,.8,1.05,'shut',trim,{shutters:false});
 vnWin(0,F+H+.9,D/2+.02,0,.55,.6,'open','hPaint',trim);                                      // attic window in the gable
 vnDoor(W/2,F,1.3,Math.PI/2,.95,1.9,'vWood',log,hC(0x6a5040),false);
 vB('vWood',W/2+.8,F-.2,1.3,1.6,.2,1.9,0,log);vnStairs(W/2+1.9,0,1.3,Math.PI/2,1.1,F,3,'vWood',log);   // porch deck + steps
 for(const s of[-1,1])vPst('vPost',W/2+1.45,F,1.3+s*.85,.08,2.2,log);vnShedRoof(W/2+.9,F+2.2,1.3,1.8,2,.35,-Math.PI/2,'vShingleB',sh,.2,.1);
 if(rng()<.6){kput('vSheet',[-1.2,F+H+1.3,-1.1],vQ(Math.PI,-Math.atan(1.25),0),[2.2,1.6,1],null);}   // a salvage sheet over a leak (the Iziz note)
 hnStoneChimney(-1.2,F+H+.6,-.9,2.1,.6);
 hnWoodpile(-W/2-.8,0,-.6,Math.PI/2,2.6,1.4);vnBarrel(W/2+.9,0,-1.9,.35,.9,log);
 vnFence(0,0,1.2,W+6,D+6.5,0,hC(vPick(HPAL.aged)),2.2,1.1);vnFolk(1.5,D/2+2.2,1,1);}
// B — two-room log house with a lean-to workshop and a plank roof held by poles: the poorest urban housing
function buildHlRepPoorB(G,o){reseed(20111+(o.v|0));const W=8.2,D=5.4,H=2.6,F=.35;
 const log=hC(vPick(HPAL.aged)),trim=hC(vPick([HPAL.white,HPAL.teal,HPAL.red])),sh=hC(vPick(HPAL.shingle)).multiplyScalar(.9);
 vnReg('Two-room log house (poor)',0,0,6,F+H+3.6);
 vB('hRubB',0,0,0,W+.3,F,D+.3,0,hC(vPick(HPAL.rubble)));hnLogBox(0,F,0,W,H,D,0,log);
 hnGable(0,F+H,0,W,D,1.1,0,'vShingleB',sh,.6,'vGableW',log);
 for(let k=0;k<4;k++)beam('vWood',[-W/2-.4+k*(W+.8)/3,F+H+.35,-D/2-.5],[-W/2-.4+k*(W+.8)/3,F+H+.35,D/2+.5],.08,.08,log);   // roof poles laid over the plank
 vnDoor(-1.2,F,D/2,0,.95,1.9,'vWood',log,hC(0x5a4a3a),false);hnNal(1.4,F+.95,D/2,0,.75,.95,'shut',trim);hnNal(-3.1,F+.95,D/2,0,.7,.9,'open',trim);
 // lean-to workshop: board walls, salvage roof
 vnFrame(W/2+1.4,0,0,2.6,2.3,D-.6,0,log,.1);vB('vWood',W/2+1.4,0,-D/2+.4,2.6,2.2,.1,0,log);vnShedRoof(W/2+1.4,2.3,0,2.8,D-.2,.6,Math.PI/2,'vCorr',null,.3,.1);
 vnPatch(W/2+2.7,0,0,Math.PI/2,D-.8,2.1,2);vnCrate(W/2+1.2,0,1,.8,.2);vnBarrel(W/2+2,0,-.8,.3,.8,log);
 hnStoneChimney(2.6,F+H+.3,-.6,2.2,.55);vnDryingRack(-W/2-1.3,0,1.2,Math.PI/2,2.6);vnFolk(0,D/2+2.4,2,1.5);}

// ---------------------------------------------------------------- MIDDLE
// A — Saxon townhouse: gable to the street, painted render below, jettied half-timber above, scale roof
function buildHlRepMidA(G,o){reseed(20201+(o.v|0));const W=8,D=11,S=.7,H1=3.3,H2=2.9;
 const wall=hC(vPick(HPAL.saxon)),beamC=hC(vPick(HPAL.redwood)),roof=hC(vPick([...HPAL.roofRed,...HPAL.slate])),trim=hC(vPick([HPAL.white,HPAL.teal,HPAL.ochre]));
 vnReg('Saxon townhouse (middle)',0,0,7.5,S+H1+H2+6.5);
 hnSocle(0,0,0,W,S,D,0);
 hnStucco(0,S,0,W,H1,D,0,wall,hC(vPick(HPAL.ashlar)));
 // the carriage gate: a tall arched opening with a boarded leaf, stone surround
 kput('winSmD',[1.6,S+1.35,D/2+.02],null,[1.9/1.1,2.7/2,.25]);vB('vStone',1.6,S,D/2+.05,2.4,.2,.25,0,hC(vPick(HPAL.ashlar)));
 kput('vWood',[1.6,S+1.1,D/2+.06],null,[1.7,2.2,.06],hC(vPick(HPAL.tar)));
 for(const u of[-2.3,-.6]){vnWin(u,S+1.1,D/2,0,.8,1.3,'glass','vStone',hC(vPick(HPAL.ashlar)),true);}
 hnForm('hFormA',1.6,S+2.75,D/2+.02,0,1.8,.9);                                                   // the painted crest over the gate
 for(const z of[-3,0,3])vnWin(W/2,S+1.1,z,Math.PI/2,.8,1.3,'glass','vStone',hC(vPick(HPAL.ashlar)),false);
 // jettied upper storey
 const y2=S+H1+.12;hnJetty(0,y2,0,W,D,0,beamC,.35);hnFachBox(0,y2,0,W+.1,H2,D+.7,0,hC(vPick(HPAL.stucco)),beamC,'glass');
 const y3=y2+H2;const top=hnGable(0,y3,0,D+.7,W+.1,1.55,Math.PI/2,'hGableSc',roof,.55,'vGablePl',hC(vPick(HPAL.stucco)));
 hnBarge(0,y3,0,D+.7,W+.1,1.55*(W+.1)/2,Math.PI/2,.55,trim,'lace');
 // gable: a hoist beam and loft door (the Saxon storage attic), a small crest board
 vnWin(0,y3+.5,(D+.7)/2+.02,0,1,1.4,'shut','vWood',beamC);vB('vWood',0,y3+2.1,(D+.7)/2+.5,.2,.2,1.2,0,beamC);
 hnForm('hFormT',0,y3+2.5,(D+.7)/2+.02,0,1.6,.8);
 // a dormer on the long side, a stone chimney through the ridge
 vB('vPlaster',W/2-.9,y3+.6,-1.5,1.6,1.2,1.6,0,hC(vPick(HPAL.stucco)));vnWin(W/2-.1,y3+.8,-1.5,Math.PI/2,.6,.7,'glass','vWood',trim);vnGableRoof(W/2-.9,y3+1.8,-1.5,1.6,1.8,.8,Math.PI/2,'hGableSc',roof,.15);
 hnStoneChimney(-.8,top-1.2,-2.8,1.9,.7);
 vnBarrel(-W/2-.6,0,D/2-1,.35,.9);vnFolk(0,D/2+2.5,2,2);}
// B — merchant's log house: a two-storey log house on a stone ground floor, a carved gallery (gulbishche) along
// the front and a kryltso porch; the Russian side of the Republic's middle class
function buildHlRepMidB(G,o){reseed(20211+(o.v|0));const W=10,D=8,S=2.6,H=3;
 const log=hC(vPick(HPAL.pine)),trim=hC(vPick([HPAL.white,HPAL.teal,HPAL.blue])),roof=hC(vPick(HPAL.roofGreen)),stone=hC(vPick(HPAL.stucco));
 vnReg("Merchant's log house (middle)",0,0,8,S+H+5.5);
 hnStucco(0,0,0,W,S,D,0,stone);for(const u of[-3,0,3])vnWin(u,.9,D/2,0,.8,1,'shut','vStone',hC(vPick(HPAL.ashlar)));   // storerooms below
 hnLogBox(0,S,0,W,H,D,0,log);
 for(const u of[-3.1,-1,1.1,3.2])hnNal(u,S+.95,D/2,0,.8,1.15,'glass',trim,{shutters:u<0,keel:true});
 for(const z of[-1.6,1.6])hnNal(W/2,S+.95,z,Math.PI/2,.8,1.15,'glass',trim);
 hnGable(0,S+H,0,W,D,1.0,0,'hGableSc',roof,.7,'hGableLog',log);
 // side gallery on posts with a keel-arch kryltso porch at the +x end
 hnKryltso(W/2+1.3,0,.4,Math.PI/2,1.3,S,'hKeelSc',roof,log);
 hnFrieze(0,S+H-.4,D/2+.02,0,W,.4);
 vnFence(0,0,.8,W+5,D+6,0,log,2.4,1.4);hnWoodpile(-W/2-1.2,0,-1,Math.PI/2,3,1.5);vnFolk(-1,D/2+2,2,2);}

// ---------------------------------------------------------------- RICH
// A — Peles villa: rubble socle, stucco ground storey with quoins, half-timber upper storey, an oriel bay under a
// cross gable, slate roofs, a loggia tower with a spire, a porch on carved posts with dougong. Electric.
function buildHlRepRichA(G,o){reseed(20301+(o.v|0));const W=16,D=11,S=1.2,H1=3.8,H2=3.2;
 const cream=hC(vPick(HPAL.stucco)),beamC=hC(vPick(HPAL.redwood)),slate=hC(vPick(HPAL.slate)),ash=hC(vPick(HPAL.ashlar)),lit=vLit()?'lit':'glass';
 vnReg('Villa (rich)',0,0,11,S+H1+H2+14);
 hnSocle(0,0,0,W,S,D,0);hnStucco(0,S,0,W,H1,D,0,cream,ash);
 vB('vStone',0,S+H1-.25,0,W+.3,.3,D+.3,0,ash);                                                    // cornice band
 for(const u of[-6,-3.5,3.5,6])vnWin(u,S+1.1,D/2,0,1,1.9,lit,'vStone',ash,false);
 for(const z of[-3,0,3])for(const s of[-1,1])vnWin(s*W/2,S+1.1,z,s*Math.PI/2,1,1.9,lit,'vStone',ash,false);
 // upper storey: half-timber
 const y2=S+H1;hnFachBox(0,y2,0,W,H2,D,0,cream,beamC,lit);
 const y3=y2+H2;hnGable(0,y3,0,W,D,1.3,0,'hGableSc',slate,.7,'vGablePl',cream);
 // oriel bay + cross gable over the entrance
 const oz=D/2+.6;vB('vWood',0,y2-.4,oz,5,.4,1.3,0,beamC);for(const s of[-1,0,1])hnMember('vWood',[s*2,y2-1.6,D/2+.05],[s*2,y2-.4,oz+.4],.2,.2,[0,0,1],beamC);
 hnFachBox(0,y2,oz-.6,5,H2+.4,2.6,0,cream,beamC,lit);
 hnGable(0,y2+H2+.4,oz-.6,2.6,5,1.4,Math.PI/2,'hGableSc',slate,.4,'vGablePl',cream);hnBarge(0,y2+H2+.4,oz-.6,2.6,5,3.5,Math.PI/2,.4,beamC,'lace');
 hnForm('hFormT',0,y2+H2+1.1,oz+.72,0,2.2,1.1);
 // entrance porch: carved totem posts, dougong under a small hip, crest board over the door
 vnDoor(0,S,D/2,0,1.5,2.5,'vStone',ash,hC(vPick(HPAL.tar)),false);hnForm('hFormA',0,S+2.65,D/2+.02,0,2.2,1.1);
 vB('vStone',0,0,D/2+1.6,4.2,S,3.2,0,ash);vnStairs(0,0,D/2+3.8,0,2.6,S,5,'vStone',ash);
 for(const s of[-1,1])hnTotemPost(s*1.8,S,D/2+2.8,.2,2.7,0);
 hnBracketRow(0,S+2.7,D/2+2.8,0,4.2,2,.7);vnHipRoof('hHipSc',0,S+3.35,D/2+1.8,4.4,2.6,1.1,0,slate,.35);
 // the corner tower (Peles): loggia and spire
 hnTower(-W/2+.6,0,D/2-1.2,4.4,S+H1+H2+2.4,0,{loggia:true,roof:'spire',roofC:slate,beamC,c:cream,lit:vLit()});
 hnStoneChimney(4.5,y3+1.4,-1.8,2.8,.9);hnStoneChimney(-3,y3+1.4,-1.8,2.8,.9);
 // garden wall with gate piers, lamps
 for(const s of[-1,1]){vB('hRubB',s*(W/2+2.5),0,D/2+5.5,.6,1.3,.6,0);vB('hRubB',s*(W/2+2.5)/2+s*2.1,0,D/2+5.5,(W/2+2.5)-2.6,.9,.45,0);}
 if(vLit())for(const s of[-1,1])vnLampPost(s*2.4,0,D/2+5.2,3.2);
 vnFolk(1,D/2+7,2,2);}

const HTAG_SF={type:['single-family dwelling']},HTAG_MF={type:['multi-family dwelling']};
HL.def({key:'hl_rep_house_poor_a',name:'Log izba',branch:'republican',family:'Dwellings',tags:Object.assign({wealth:'poor',lit:false},HTAG_SF),w:13,d:14,h:8,build:buildHlRepPoorA});
HL.def({key:'hl_rep_house_poor_b',name:'Two-room log house',branch:'republican',family:'Dwellings',tags:Object.assign({wealth:'poor',lit:false},HTAG_MF),w:14,d:9,h:7,build:buildHlRepPoorB});
HL.def({key:'hl_rep_house_mid_a',name:'Saxon townhouse',branch:'republican',family:'Dwellings',tags:Object.assign({wealth:'middle',lit:false},HTAG_SF),w:9,d:13,h:13,build:buildHlRepMidA});
HL.def({key:'hl_rep_house_mid_b',name:"Merchant's log house",branch:'republican',family:'Dwellings',tags:Object.assign({wealth:'middle',lit:false},HTAG_SF),w:15,d:14,h:10,build:buildHlRepMidB});
HL.def({key:'hl_rep_house_rich_a',name:'Peles villa',branch:'republican',family:'Dwellings',tags:Object.assign({wealth:'rich',lit:true},HTAG_SF),w:22,d:20,h:24,build:buildHlRepRichA});
