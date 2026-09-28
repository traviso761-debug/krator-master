// ================================================================= HIGHLANDS / RUSTIC — dwellings
// The villages south of the Republic: Norse and Alpine. Stone is only a footing or a ground storey; above it
// everything is log and board under wide, low shingle gables weighted with stones (Alpine) or steep turf and
// shingle gables with crossed horns (Norse). Balconies with cut-out boards and geraniums; the gable carries a
// painted crest. No electric light anywhere in the branch. Seeds 22000–22199.

// ---------------------------------------------------------------- MIDDLE
// A — Alpine chalet: whitewashed stone ground storey, log upper storey, a wide low gable to the front with two
// tiers of balcony, stones on the shingle, the thunderbird crest in the gable.
function buildHlRusMidA(G,o){reseed(22101+(o.v|0));const W=11,D=10,H1=2.8,H2=2.8;
 const log=hC(vPick(HPAL.tar)).multiplyScalar(rr(1,1.25)),white=hC(vPick(HPAL.stucco)),sh=hC(vPick(HPAL.shingle)),trim=hC(vPick([HPAL.red,HPAL.teal,HPAL.white]));
 vnReg('Alpine chalet (middle)',0,0,8.5,H1+H2+5.5);
 vB('hRubB',0,0,0,W+.2,.5,D+.2,0,hC(vPick(HPAL.rubble)));vB('vPlaster',0,.5,0,W,H1-.5,D,0,white);
 for(const u of[-3.2,3.2])vnWin(u,1.1,D/2,0,.9,1.1,'glass','hPaint',trim,true);vnDoor(0,.5,D/2,0,1.1,2.1,'vWood',log,log,false);
 for(const z of[-2.5,2.5])vnWin(W/2,1.1,z,Math.PI/2,.8,1,'glass','hPaint',trim,true);
 hnLogBox(0,H1,0,W,H2,D,0,log);
 for(const u of[-3.4,-1.2,1.2,3.4])vnWin(u,H1+.8,D/2,0,.8,1.1,'glass','hPaint',trim,true);
 const pitch=.58,top=hnGable(0,H1+H2,0,D,W,pitch,Math.PI/2,'vShingleB',sh,1.5,'hGableLog',log);
 for(let k=0;k<12;k++){const zz=rr(-D/2,D/2),xx=rr(.8,W/2);for(const s of[-1,1])kput('vRock',[s*xx,H1+H2+pitch*(W/2-xx)+.28,zz],qEuler(rng(),rng(),0),[.24,.16,.22],hC(vPick(HPAL.rubble)));}   // stones on the shingle
 hnBarge(0,H1+H2,0,D,W,pitch*W/2,Math.PI/2,1.5,log.clone().multiplyScalar(1.2),'horns');
 hnForm('hFormT',0,H1+H2+1.2,D/2+.02,0,2.8,1.3);
 // balconies: across the upper storey front and a small one in the gable
 const rail=log.clone().multiplyScalar(1.5);hnBalcony(0,H1+.05,D/2,0,W-.6,1.3,log,rail);hnBalcony(0,H1+H2+.05,D/2,0,3.4,.9,log,rail,false);
 // purlin ends under the eaves, carved
 for(const u of[-4.5,-1.5,1.5,4.5])vB('vWood',u,H1+H2+pitch*(W/2-Math.abs(u))-.2,D/2+.9,.24,.3,1.8,0,log);
 hnWoodpile(W/2+.9,0,0,Math.PI/2,D-2,1.8);vB('vWood',-2.2,0,D/2+.9,2,.45,.4,0,log);                    // woodpile under the eave, bench
 vnWaterButt(-W/2-.7,0,D/2-1,.4,1);vnFolk(1,D/2+3,2,1.8);}

HL.def({key:'hl_rus_house_mid_a',name:'Alpine chalet',branch:'rustic',family:'Dwellings',tags:{type:['single-family dwelling'],wealth:'middle',lit:false},w:15,d:14,h:10,build:buildHlRusMidA});
