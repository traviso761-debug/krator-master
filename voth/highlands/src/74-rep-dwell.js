// ================================================================= HIGHLANDS / REPUBLICAN — dwellings
// The Iron Republic's houses, three wealth tiers. Poor: the log izba of the hill towns — round logs, a steep
// shingle gable to the street, white-painted nalichniki, salvage sheet where the shingle has failed (the Iziz
// note). Middle: the Transylvanian-Saxon townhouse — fieldstone socle, rendered ground storey in a painted
// colour, a jettied half-timbered upper storey, steep scale roof gable-end to the street. Rich: the Peles villa —
// rubble socle, cream stucco with quoins, red-brown half-timber above, slate roofs and a loggia tower; electric.
// Seeds 20100–20399 (dwellings; 75-rep-trade.js uses 20400–20699).

// ---------------------------------------------------------------- R-A kit items and helpers (prefix hRA / hnRA)
// Round-arched frame (arcade bay, carriage gate): a U-shaped slab, width 1 x height 1, opening 70% of the width,
// its semicircular head drawn for a bay 1.2x as tall as wide (scale [bayW, H, depth]; H ≈ 1.2·bayW keeps it round).
// Origin at the bottom centre, depth centred on z.
function hnRAArchGeo(asp,ow,spring){const s=new THREE.Shape();s.moveTo(-.5,0);s.lineTo(-ow/2,0);s.lineTo(-ow/2,spring);s.absarc(0,spring,ow/2,Math.PI,0,true);
 s.lineTo(ow/2,0);s.lineTo(.5,0);s.lineTo(.5,asp);s.lineTo(-.5,asp);s.lineTo(-.5,0);
 const g=new THREE.ExtrudeGeometry(s,{depth:1,bevelEnabled:false,curveSegments:8});g.translate(0,0,-.5);g.scale(1,1/asp,1);return g;}
// "Eyelid" dormer (the eyes of Sibiu): a bell-shaped hump, width 1 x height 1, extruded 1 along z (centred), its
// front face (+z) carries the slit. Placed by hnRAEyelid so its back runs into the roof.
function hnRAEyeGeo(){const s=new THREE.Shape();const N=14;s.moveTo(-.5,0);for(let i=1;i<=N;i++){const x=-.5+i/N;s.lineTo(x,Math.pow(.5*(1+Math.cos(2*Math.PI*x)),.8));}s.lineTo(-.5,0);
 return new THREE.ExtrudeGeometry(s,{depth:1,bevelEnabled:false}).translate(0,0,-.5);}
const HRA_ARCH=hnRAArchGeo(1.2,.7,.66);
kdef('hRAArchS',HRA_ARCH,MAT.stone);kdef('hRAArchP',HRA_ARCH,MAT.plaster);kdef('hRAArchW',HRA_ARCH,MAT.wood);
kdef('hRAEye',hnRAEyeGeo(),MAT.scale);kdef('hRAVoid',VBALL,MAT.void);
kdef('hRAKeelL',HKEEL,MAT.logs);kdef('hRAKeelPt',HKEEL,MAT.paint);   // keel boards in log and in paint

// A gable roof laid by hnGable(x0,Y,z0,len,span,p,ry,…): a point on one slope. side ±1 (the +z / −z slope of the
// ry frame), u along the ridge, t the horizontal distance out from the ridge, off the distance out of the slab
// (0 = on the slab's upper face). Returns {p:[x,y,z], q (a box lying on the slope), n (outward normal)}.
function hnRASlope(x0,Y,z0,ry,span,p,side,u,t,off){const a=Math.atan(p),ry2=ry+(side<0?Math.PI:0);const n=hRot(ry2,[0,Math.cos(a),Math.sin(a)]);
 const P=loc(x0,z0,u,side*t,ry);const k=.25+(off||0);return{p:[P[0]+n[0]*k,Y+p*(span/2-t)+n[1]*k,P[1]+n[2]*k],q:vQ(ry2,a,0),n,ry2};}
// A salvage sheet or a board patch lying on a slope (item a box: vCorr / vRustB / vShingleB / vWood)
function hnRARoofPatch(item,x0,Y,z0,ry,span,p,side,u,t,w,L,c){const S=hnRASlope(x0,Y,z0,ry,span,p,side,u,t,.03);
 kput(item,S.p,S.q.clone().multiply(qEuler(0,rr(-.06,.06),0)),[w,.05,L],c||null);}
// Eyelid dormer on a slope: front face at t from the ridge, width w, height h.
function hnRAEyelid(x0,Y,z0,ry,span,p,side,u,t,w,h,c){const a=Math.atan(p),ry2=ry+(side<0?Math.PI:0),L=h/p+.6;
 const ys=Y+p*(span/2-t)+.24/Math.cos(a)-.06;const P=loc(x0,z0,u,side*(t-L/2),ry);kput('hRAEye',[P[0],ys,P[1]],qEuler(0,ry2,0),[w,h,L],c||null);
 const F=loc(x0,z0,u,side*(t+.005),ry);kput('hRAVoid',[F[0],ys+h*.34,F[1]],qEuler(0,ry2,0),[w*.2,h*.13,.02]);}
// Gabled dormer on a slope: a rendered box with a window, its own little gable (ridge running up the roof).
function hnRADormer(x0,Y,z0,ry,span,p,side,u,t,w,h,wallC,roofC,trimC,kind){const ry2=ry+(side<0?Math.PI:0);const ys=Y+p*(span/2-t);const L=(h+.3)/p+.5;
 const P=loc(x0,z0,u,side*(t-L/2),ry);vB('vPlaster',P[0],ys-.3,P[1],w,h+.3,L,ry2,wallC);
 const F=loc(x0,z0,u,side*t,ry);vnWin(F[0],ys+.15,F[1],ry2,w*.5,h*.62,kind||'glass','hPaint',trimC);
 const R=loc(x0,z0,u,side*(t-L/2+.15),ry);vnGableRoof(R[0],ys+h,R[1],L+.3,w,w*.6,ry2+Math.PI/2,'hGableSc',roofC,.18,'vGablePl',wallC);}
// Painted shutters folded back beside a window placed by vnWin at (x,y,z,ry,w,h): two leaves in colour c with a
// lighter fielded panel (vnWin's own shutters take the frame colour, grey on stone frames).
function hnRAShutters(x,y,z,ry,w,h,c){const pc=c.clone().lerp(hC(HPAL.white),.35);for(const s of[-1,1]){const q=loc(x,z,s*(w/2+.2+w*.24),.2,ry);const qq=vQ(ry,0,0).multiply(qEuler(0,-s*.5,0));
 kput('hPaint',[q[0],y+h/2,q[1]],qq,[w*.48,h,.05],c);const n=hRot(ry-s*.5,[0,0,1]);kput('hPaint',[q[0]+n[0]*.035,y+h/2,q[1]+n[2]*.035],qq,[w*.3,h*.7,.03],pc);}}
// Grand kryltso: a straight stair climbing to a landing in front of the door at (x,z) on the face ry (the landing
// at y+rise), carved bulbous posts, lace side boards, a bochka roof over the landing with a keel board on its face.
function hnRAKryltso(x,y,z,ry,w,rise,c,roofItem,roofC,trimC,postH){postH=postH||2.6;const steps=Math.max(3,Math.round(rise/.19)),run=steps*.32,LD=1.9;trimC=trimC||hC(HPAL.white);
 const lc=loc(x,z,0,LD/2,ry);vB('vWood',lc[0],y+rise-.22,lc[1],w+.9,.22,LD,ry,c);
 for(const s of[-1,1]){const p=loc(x,z,s*(w/2+.3),LD-.15,ry);vPst('vPostB',p[0],y,p[1],.14,rise-.2,c);}
 const sc=loc(x,z,0,LD+run/2,ry);vnStairs(sc[0],y,sc[1],ry,w,rise,steps,'vWood',c);
 const N=hRot(ry,[1,0,0]);
 for(const s of[-1,1]){const a=hnOn(x,y+rise,z,ry,s*(w/2+.06),LD),b=hnOn(x,y,z,ry,s*(w/2+.06),LD+run);const X=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],L=Math.hypot(...X);
  hnOri('hLaceB',[(a[0]+b[0])/2,(a[1]+b[1])/2+.5,(a[2]+b[2])/2],X,N,[L,.85,1],trimC);beam('vWood',[a[0],a[1]+.95,a[2]],[b[0],b[1]+.95,b[2]],.09,.09,c);
  const f=loc(x,z,s*(w/2+.06),LD+run-.1,ry);vPst('vPostB',f[0],y,f[1],.1,1.15,c);kput('hPaintBall',[f[0],y+1.2,f[1]],null,[.14,.18,.14],trimC);}
 for(const sx of[-1,1])for(const sz of[0,1]){const p=loc(x,z,sx*(w/2+.3),.15+sz*(LD-.3),ry);vPst('vPostB',p[0],y+rise,p[1],.12,postH,c);
  kput('hPaintBall',[p[0],y+rise+postH*.36,p[1]],null,[.22,.32,.22],c);kput('hPaintBall',[p[0],y+rise+postH*.62,p[1]],null,[.18,.22,.18],trimC);}
 const rc=loc(x,z,0,LD/2+.1,ry);vB('vWood',rc[0],y+rise+postH-.12,rc[1],w+1.1,.14,LD+.7,ry,c);
 hnBochka(rc[0],y+rise+postH,rc[1],LD+.9,w+1.4,w*.8+.9,ry+Math.PI/2,roofItem||'hKeelSc',roofC);
 const f=loc(x,z,0,LD+.6,ry),f2=loc(x,z,0,LD+.66,ry),yk=y+rise+postH-.14;kput('hKeelP',[f[0],yk,f[1]],qEuler(0,ry,0),[w+1.8,w*.8+1.3,.06],trimC);
 kput('hKeelW',[f2[0],yk,f2[1]],qEuler(0,ry,0),[w+1.25,w*.8+.8,.06],c);
 const g=loc(x,z,0,LD+.71,ry);kput('hKeelDark',[g[0],yk+.3,g[1]],qEuler(0,ry,0),[w*.55,w*.42,.04]);
 return LD+run;}

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
 hnBracketRow(0,S+2.72,D/2+2.8,0,4.2,2,.5);vnHipRoof('hHipSc',0,S+3.62,D/2+1.9,4.6,2.8,1.2,0,slate,.4);   // brackets tucked under the eave
 // the corner tower (Peles): loggia and spire
 hnTower(-W/2+.6,0,D/2-1.2,4.4,S+H1+H2+2.4,0,{loggia:true,roof:'spire',roofC:slate,beamC,c:cream,lit:vLit()});
 hnStoneChimney(4.5,y3+1.4,-1.8,2.8,.9);hnStoneChimney(-3,y3+1.4,-1.8,2.8,.9);
 // garden wall with gate piers, lamps
 for(const s of[-1,1]){vB('hRubB',s*(W/2+2.5),0,D/2+5.5,.6,1.3,.6,0);vB('hRubB',s*(W/2+2.5)/2+s*2.1,0,D/2+5.5,(W/2+2.5)-2.6,.9,.45,0);}
 if(vLit())for(const s of[-1,1])vnLampPost(s*2.4,0,D/2+5.2,3.2);
 vnFolk(1,D/2+7,2,2);}

// C — bamboo row: three one-room cottages under one roof on a log sill, the poorest urban housing of the hill
// towns. Woven bamboo-mat walls on a culm frame, one unit re-faced in salvaged boards, shingle roof mended with
// corrugated sheet, stovepipes, small door hoods; a drying line, a hand cart, water butt.
function buildHlRepPoorC(G,o){reseed(20121+(o.v|0));const N=3,U=3.8,W=U*N,D=5,F=.42,H=2.6,P=.95;
 const log=hC(vPick(HPAL.aged)),bam=hC(vPick(HPAL.bamboo)),mat=hC(vPick(HPAL.bamboo)).multiplyScalar(rr(.85,1)),sh=hC(vPick(HPAL.shingle)).multiplyScalar(.85);
 vnReg('Bamboo row cottages (poor)',0,0,7.6,F+H+P*D/2+1.2);
 // the log sill on stones
 for(const s of[-1,1]){kput('hLogX',[0,F-.2,s*(D/2-.12)],null,[W+.5,.2,.2],log);kput('hLogX',[s*(W/2-.12),F-.2,0],qEuler(0,Math.PI/2,0),[D+.4,.19,.19],log);}
 for(let i=0;i<=6;i++)for(const s of[-1,1])kput('vRock',[-W/2+W*i/6,.08,s*(D/2-.12)],null,[.28,.16,.26],hC(vPick(HPAL.rubble)));
 hnBambooBox(0,F,0,W,H,D,0,bam,mat);
 // party walls read on the front as doubled posts; roof over all three
 for(const u of[-U/2,U/2])for(const s of[-1,1])vPst('vPost',u,F-.05,s*(D/2+.1),.1,H+.1,log);
 const Y=F+H,sp=D;hnGable(0,Y,0,W,sp,P,0,'vShingleB',sh,.5,'hGableBM',mat);
 for(let k=0;k<4;k++){const x=-W/2+.4+k*(W-.8)/3;for(const s of[-1,1]){const a=hnRASlope(0,Y,0,0,sp,P,s,x,.1,.05),b=hnRASlope(0,Y,0,0,sp,P,s,x,sp/2+.4,.05);beam('vWood',a.p,b.p,.08,.08,log);}}   // weight poles
 for(let i=0;i<N;i++){const x=-W/2+U*(i+.5),kind=(i+(o.v|0))%3;
  // unit fronts: 0 bare mat, 1 salvaged boards, 2 mat with sheet patches
  if(kind===1){for(let k=0;k<7;k++)vB('vWood',x-U/2+.3+k*(U-.6)/7+.25,F+.05,D/2+.06,(U-.6)/7-.03,H-.15,.05,0,log.clone().multiplyScalar(rr(.8,1.15)));}
  if(kind===2)vnPatch(x,F,D/2+.02,0,U,H,2);
  const dx=x-U*.22;vnDoor(dx,F,D/2+.08,0,.85,1.85,'vWood',bam,hC(vPick([0x6a5040,0x5a4a3a,HPAL.teal])),false);
  vB('vWood',dx,0,D/2+.45,1.1,F,.7,0,log);                                                        // plank step
  if(kind===0){vnShedRoof(x,F+1.82,D/2+.85,U-.4,1.7,.28,0,'vCorr',null,.08,.05);for(const s of[-1,1])vPst('hBamboo',x+s*(U/2-.35),0,D/2+1.6,.06,F+1.84,bam);   // a salvaged-sheet awning on culms
   vB('vWood',x+.5,0,D/2+1.1,1.4,.42,.36,0,log);}
  else{vnShedRoof(dx,F+2.02,D/2+.3,1.3,.42,.12,0,'hBMatB',mat,.08,.05);for(const s of[-1,1])beam('hBambooC',[dx+s*.55,F+1.45,D/2+.08],[dx+s*.55,F+2.02,D/2+.48],.06,.06,bam);}
  vnWin(x+U*.24,F+.9,D/2+.08,0,.75,.75,rng()<.5?'shut':'open','vWood',bam,rng()<.6);
  vnWin(x,F+.9,-D/2-.08,Math.PI,.6,.6,'shut','vWood',bam);
  if(i!==1){const c=hnRASlope(0,Y,0,0,sp,P,-1,x+.6,1.3,0);vnChimney(c.p[0],c.p[1]-.8,c.p[2],1.9,.1,true);}
  if(kind===2||(i===0&&rng()<.7))hnRARoofPatch('vCorr',0,Y,0,0,sp,P,1,x+rr(-.4,.4),rr(1.2,1.6),rr(1.8,2.6),rr(1.4,1.9));}
 hnRARoofPatch('vRustB',0,Y,0,0,sp,P,-1,rr(-2,2),1.5,2.2,1.6);
 // yard life: a drying line, hand cart, water butt, a bamboo lean-to store at the end
 vnDryingRack(1,0,-D/2-1.6,0,4);vnWaterButt(W/2+.6,0,D/2-.8,.38,.95);
 {const lx=-W/2-1.1;hnBambooBox(lx,0,0,1.9,2.1,D-1,0,bam,mat);vnShedRoof(lx,2.1,0,2.1,D-.6,.35,-Math.PI/2,'vCorr',null,.25,.08);hnWoodpile(lx-1.3,0,0,Math.PI/2,2.6,1.2);}
 {const cx=W/2+1.4,cz=1.2;vB('vWood',cx,.55,cz,1,.08,1.6,.25,log);for(const s of[-1,1]){const p=loc(cx,cz,s*.58,.2,.25);kput('vHoop',[p[0],.42,p[1]],qEuler(0,.25+Math.PI/2,0),[.42,.42,1.4],hC(0x3a3028));}
  for(const s of[-1,1]){const a=loc(cx,cz,s*.3,-.8,.25),b=loc(cx,cz,s*.3,-1.9,.25);beam('vWood',[a[0],.6,a[1]],[b[0],.15,b[1]],.05,.05,log);}}
 vnFolk(0,D/2+3.4,3,2.5);}

// C — the Saxon corner tenement: an arcaded ground floor (the Laube) of stone round arches with shops behind, a
// rendered first floor, a jettied half-timber second floor, a steep scale roof with a row of gabled dormers and
// eyelids above, and a stair tower with a spire serving the flats.
function buildHlRepMidC(G,o){reseed(20221+(o.v|0));const W=14,D=10,H1=3.6,H2=3.2,H3=2.9,AD=2.7,bays=4;
 const wall=hC(vPick(HPAL.saxon)),wall2=hC(vPick(HPAL.stucco)),ash=hC(vPick(HPAL.ashlar)),beamC=hC(vPick(HPAL.redwood)),roof=hC(vPick([...HPAL.roofRed,...HPAL.roofRed,...HPAL.slate])),trim=hC(vPick([HPAL.teal,HPAL.green,HPAL.red,HPAL.blue]));
 vnReg('Arcaded tenement (middle)',0,0,9.5,H1+H2+H3+8.6);
 // the Laube: stone arches along the front and on the two ends, shop fronts set back behind them
 const bw=W/bays;for(let i=0;i<bays;i++)kput('hRAArchS',[-W/2+bw*(i+.5),0,D/2-.3],null,[bw,H1,.6],ash);
 for(const s of[-1,1])kput('hRAArchS',[s*(W/2-.3),0,D/2-AD/2],qEuler(0,Math.PI/2,0),[AD,H1,.6],ash);
 vB('vPlaster',0,0,-AD/2,W,H1,D-AD,0,wall);vB('vWood',0,H1-.24,D/2-AD/2,W-.2,.24,AD-.1,0,beamC);
 for(let k=0;k<=bays*2;k++)vB('vWood',-W/2+.4+(W-.8)*k/(bays*2),H1-.42,D/2-AD/2,.16,.2,AD-.7,0,beamC);   // arcade ceiling joists
 vnPaving(0,.02,D/2-AD/2,W-.8,AD-.4,0,hC(vPick(HPAL.rubble)),14);
 for(let i=0;i<bays;i++){const x=-W/2+bw*(i+.5),zf=D/2-AD;
  vnDoor(x-.8,0,zf,0,1.0,2.2,'hPaint',trim,hC(vPick(HPAL.tar)),false);vnWin(x+.7,.8,zf,0,1.2,1.4,'glass','hPaint',trim,false);
  const sb=loc(x,zf,0,.06,0);vB('hPaint',sb[0],2.62,sb[1],bw-.8,.5,.08,0,trim);kput('hFormA',[sb[0],2.87,sb[1]+.05],null,[1.1,.44,1]);}
 // first floor: painted render, paired windows with painted shutters, a string course
 hnStucco(0,H1,0,W,H2,D,0,wall,ash);vB('vStone',0,H1-.05,0,W+.2,.2,D+.2,0,ash);
 for(let i=0;i<bays;i++){const x=-W/2+bw*(i+.5);for(const s of[-1,1])vnWin(x+s*.55,H1+1,D/2,0,.7,1.35,'glass','vStone',ash,false);hnRAShutters(x,H1+1,D/2,0,1.8,1.35,trim);}
 for(const z of[-2.5,0,2.5])vnWin(-W/2,H1+1,z,-Math.PI/2,.7,1.35,'glass','vStone',ash,false);
 for(let i=0;i<bays;i++){const x=-W/2+bw*(i+.5);vnWin(x,H1+1,-D/2,Math.PI,.8,1.35,'glass','vStone',ash);                   // the courtyard side
  if(i%2)vnDoor(x,0,-D/2,Math.PI,1,2.2,'vStone',ash,hC(vPick(HPAL.tar)),true);else vnWin(x,1,-D/2,Math.PI,.9,1.2,'shut','vStone',ash);}
 // second floor: jettied half-timber
 const y3=H1+H2+.12;hnJetty(0,y3,0,W,D,0,beamC,.35);hnFachBox(0,y3,0,W+.1,H3,D+.7,0,wall2,beamC,'glass');
 // the roof: eaves to the street, a row of gabled dormers, eyelids above them
 const y4=y3+H3,span=D+.7,P=1.45;const top=hnGable(0,y4,0,W+.1,span,P,0,'hGableSc',roof,.55,'vGablePl',wall2);
 for(const s of[-1,1])hnForm('hFormT',s*(W/2+.12),y4+1.1,0,s*Math.PI/2,2.2,1.1);
 for(const u of[-4.5,0,4.5])hnRADormer(0,y4,0,0,span,P,1,u,span/2-1.1,1.3,1.5,wall2,roof,trim,'glass');
 for(const u of[-2.3,2.3])hnRAEyelid(0,y4,0,0,span,P,1,u,span/2-3.3,1.1,.55,roof);
 for(const u of[-3,3])hnRADormer(0,y4,0,0,span,P,-1,u,span/2-1.1,1.3,1.5,wall2,roof,trim,'glass');
 hnStoneChimney(-3.2,top-2.6,-.9,3,.7);hnStoneChimney(3.6,top-2.6,-.9,3,.7);
 // stair tower serving the flats, with a spire, and its street door
 const tx=W/2+1.35,tz=-1.4;hnTower(tx,0,tz,2.8,H1+H2+H3+2.6,0,{shaft:'stucco',roof:'spire',roofC:roof,c:wall2,qC:ash,trimC:trim});
 vnDoor(tx,0,tz+1.4,0,1,2.1,'vStone',ash,hC(vPick(HPAL.tar)),true);
 vnBarrel(-W/2-.7,0,D/2-1.2,.35,.9);vnCrate(-2.1,0,D/2-1.3,.7,.3);vnSacks(3.4,0,D/2-1.4,3);
 vnFolk(0,D/2+2.2,4,3);vnFolk(0,D/2-AD/2,2,4);}

// ---------------------------------------------------------------- RICH (cont.)
// B — the terem: stacked log volumes of different heights on a white stone storey (podklet) — a hall under a keel
// (bochka) roof with a kokoshnik face, a taller two-storey chamber wing under a steep scale gable, and a
// tent-roofed tower on an octagonal lantern; a grand kryltso climbs to the hall. Carved and painted throughout,
// dougong under the hall's keel, gold spikes. Electric.
function buildHlRepRichB(G,o){reseed(20311+(o.v|0));const S=2.2;
 const log=hC(vPick(HPAL.pine)).multiplyScalar(rr(.9,1.05)),dark=hC(vPick(HPAL.redwood)),stone=hC(vPick(HPAL.stucco)),green=hC(vPick(HPAL.roofGreen)),red=hC(vPick(HPAL.roofRed)),
  trim=hC(HPAL.white),acc=hC(vPick([HPAL.red,HPAL.teal,HPAL.blue])),gold=hC(vPick(HPAL.gold)),lit=vLit()?'lit':'glass';
 const r1=rng()<.5,roofA=r1?green:red,roofB=r1?red:green;
 vnReg('Terem mansion (rich)',0,-1,12.5,19);
 const A={x:0,z:-1,w:10,d:8,h:3.6},B={x:-7.6,z:-.6,w:5.8,d:7.2,h:6.4},C={x:7.1,z:1.6,w:4.2,h:6.6};
 // podklet under everything: rendered stone with small deep windows
 for(const V of[A,B])hnStucco(V.x,0,V.z,V.w,S,V.d,0,stone,false);hnStucco(C.x,0,C.z,C.w,S,C.w,0,stone,false);
 for(const u of[-3,3])vnWin(u,.7,A.z+A.d/2,0,.6,.7,'glass','vStone',stone);vnWin(B.x,.7,B.z+B.d/2,0,.6,.7,'glass','vStone',stone);
 // A — the hall: logs, keel-arch nalichniki, a bochka roof with a kokoshnik face carried on dougong
 hnLogBox(A.x,S,A.z,A.w,A.h,A.d,0,log);const ya=S+A.h;
 for(const u of[-3.4,-1.9,1.9,3.4])hnNal(u,S+1.05,A.z+A.d/2,0,.8,1.3,lit,trim,{keel:true,accent:acc});
 for(const z of[-3,1])hnNal(A.w/2,S+1.05,A.z+z+1,Math.PI/2,.8,1.3,lit,trim,{keel:true});
 hnFrieze(0,ya-.55,A.z+A.d/2+.02,0,A.w,.5);
 hnBracketRow(0,ya-.62,A.z+A.d/2+.1,0,A.w-1,4,.62,hC(HPAL.teal),hC(HPAL.red));
 hnBochka(A.x,ya,A.z,A.d+1.8,A.w+1,5.6,Math.PI/2,'hKeelSc',roofA);
 // the kokoshnik face: a painted keel rim, a log-boarded infill, a darker inner keel round the gable window
 kput('hRAKeelPt',[A.x,ya-.02,A.z+A.d/2+.95],null,[A.w-.4,5.2,.3],trim);kput('hRAKeelPt',[A.x,ya+.1,A.z+A.d/2+1.08],null,[A.w-.9,4.75,.1],acc);
 kput('hRAKeelL',[A.x,ya+.2,A.z+A.d/2+1.12],null,[A.w-1.4,4.4,.06],log);kput('hKeelW',[A.x,ya+.55,A.z+A.d/2+1.16],null,[3.4,3.1,.04],dark);
 vnWin(A.x,ya+1.2,A.z+A.d/2+1.12,0,1.2,1.5,lit,'hPaint',trim);hnForm('hFormT',A.x,ya+3,A.z+A.d/2+1.16,0,1.8,.9);
 hnOnion(A.x,ya+5.1,A.z-1,.62,'Sc',roofB,.9,'hOctL',log);
 // B — the chamber wing: two log storeys, a steep scale gable to the front with lace, a small balcony
 hnLogBox(B.x,S,B.z,B.w,B.h,B.d,0,log);const yb=S+B.h;
 for(const y of[S+1.05,S+4.1])for(const u of[-1.3,1.3])hnNal(B.x+u,y,B.z+B.d/2,0,.75,1.2,lit,trim,{keel:y>S+2,accent:acc});
 for(const z of[-2,1.5])hnNal(B.x-B.w/2,S+4.1,B.z+z,-Math.PI/2,.75,1.2,lit,trim,{});
 hnGable(B.x,yb,B.z,B.d,B.w,1.55,Math.PI/2,'hGableSc',roofB,.7,'hGableLog',log);
 hnBarge(B.x,yb,B.z,B.d,B.w,1.55*B.w/2,Math.PI/2,.7,trim,'lace');
 hnBalcony(B.x,yb+.35,B.z+B.d/2+.05,0,2.4,.9,dark,trim,false);vnDoor(B.x,yb+.35,B.z+B.d/2+.02,0,.8,1.8,'hPaint',trim,dark,false);
 hnForm('hFormT',B.x,yb+2.5,B.z+B.d/2+.06,0,1.4,.7);
 // C — the tower: log shaft, an octagonal lantern with a ring of small kokoshniki, a tent and a gold spike
 hnLogBox(C.x,S,C.z,C.w,C.h,C.w,0,log);const yc=S+C.h;
 for(const y of[S+1.05,S+4])hnNal(C.x,y,C.z+C.w/2,0,.7,1.15,lit,trim,{keel:true});hnNal(C.x+C.w/2,S+4,C.z,Math.PI/2,.7,1.15,lit,trim,{keel:true});
 vB('vWood',C.x,yc,C.z,C.w+.8,.22,C.w+.8,0,dark);hnBracketRow(C.x,yc-.5,C.z+C.w/2+.05,0,C.w,2,.5);
 kput('hOctL',[C.x,yc+.22,C.z],null,[1.9,2.4,1.9],log);
 for(let k=0;k<8;k++){const a=k/8*TAU;vnWin(C.x+Math.sin(a)*1.76,yc+.8,C.z+Math.cos(a)*1.76,a,.5,1.1,lit,'hPaint',trim);
  kput('hKeelSc',[C.x+Math.sin(a)*1.72,yc+2.55,C.z+Math.cos(a)*1.72],qEuler(0,a,0),[1.35,1.1,.3],roofA);}
 vB('vWood',C.x,yc+2.5,C.z,3.6,.16,3.6,Math.PI/8,dark);
 const tt=hnTent(C.x,yc+2.6,C.z,2.15,6.2,'hTentSc',roofA);vPst('vIron',C.x,tt-.3,C.z,.05,1.6,hC(0x2e2a26));vBall('hGold',C.x,tt+.4,C.z,.2,gold);kput('hConeG',[C.x,tt+.6,C.z],null,[.08,.9,.08],gold);
 // the grand kryltso up to the hall door, totem posts at its foot, lamps
 vnDoor(0,S,A.z+A.d/2,0,1.3,2.2,'hPaint',trim,dark,false);
 const run=hnRAKryltso(0,0,A.z+A.d/2,0,2.4,S,dark,'hKeelSc',roofB,trim,2.7);
 for(const s of[-1,1])hnTotemPost(s*2.1,0,A.z+A.d/2+run+.6,.22,2.8,0,true);
 if(vLit())for(const s of[-1,1])vnLampPost(s*3.6,0,A.z+A.d/2+run+.4,3.2);
 // chimneys, a carved fence with a gate, a tall totem at the corner
 hnStoneChimney(-2.6,ya+2.6,-3.5,3.4,.8);hnStoneChimney(B.x+1,yb+1.8,B.z-2,3,.7);
 vnFence(0,0,1.4,A.w+B.w+C.w+6,A.d+14,0,dark,4.5,1.3);hnTotem(B.x-1.4,0,B.z+B.d/2+3.4,.34,7.5,0,{wings:1.6,painted:true});
 vnFolk(1,A.z+A.d/2+run+2.6,3,2.5);}
// C — the Saxon patrician house: an ashlar ground storey with an arched carriage gate, two rendered storeys with a
// corner oriel, a huge steep roof with rows of eyelid dormers (the eyes of Sibiu), crest boards and a formline
// frieze, and a walled courtyard behind. Electric.
function buildHlRepRichC(G,o){reseed(20321+(o.v|0));const W=16,D=12,H1=3.9,H2=3.3,P=1.7;
 const ash=hC(vPick(HPAL.ashlar)),wall=hC(vPick(HPAL.saxon)),roof=hC(vPick(HPAL.roofRed)).multiplyScalar(rr(.9,1.05)),
  tar=hC(vPick(HPAL.tar)),trim=hC(vPick([HPAL.teal,HPAL.green,HPAL.red,HPAL.blue])),sh=hC(vPick(HPAL.shingle)),lit=vLit()?'lit':'glass';
 vnReg('Patrician house (rich)',0,0,11,H1+2*H2+P*D/2+2.5);vnReg('Patrician house courtyard',1.5,-D/2-5,8,3.2);
 // ground storey: dressed stone, a plinth, the carriage gate and barred windows
 vB('vStone',0,0,0,W,H1,D,0,ash);vB('hRubB',0,0,0,W+.24,.7,D+.24,0,hC(vPick(HPAL.rubble)));
 const gx=W/2-3.4;kput('hRAArchS',[gx,0,D/2+.15],null,[4.2,H1-.1,.34],ash.clone().multiplyScalar(.93));
 vB('vWood',gx,0,D/2+.07,2.9,3.35,.1,0,tar);vB('vDarkB',gx+.6,0,D/2+.12,.8,1.9,.04,0);
 for(let k=0;k<5;k++)vB('vIron',gx,.5+k*.65,D/2+.13,2.8,.06,.03,0,hC(0x2e2a26));
 hnForm('hFormA',gx,H1-.82,D/2+.3,0,1.5,.75);
 for(const u of[-6,-3.6,-1.2]){vnWin(u,1.3,D/2,0,.9,1.5,lit,'vStone',ash);for(let k=0;k<4;k++)vB('vIron',u-.33+k*.22,1.3,D/2+.12,.04,1.5,.04,0,hC(0x2e2a26));}
 vnDoor(1.2,.2,D/2,0,1.2,2.4,'vStone',ash,tar,true);
 // two rendered storeys, windows in stone frames with painted shutters, a formline frieze between them
 hnStucco(0,H1,0,W,2*H2,D,0,wall,ash);vB('vStone',0,H1-.05,0,W+.25,.24,D+.25,0,ash);vB('vStone',0,H1+H2-.05,0,W+.15,.14,D+.15,0,ash);
 hnFrieze(0,H1+H2+.12,D/2+.02,0,W-1.2,.42);
 for(let f=0;f<2;f++)for(const u of[-6.2,-3.7,-1.2,1.3,3.8]){const y=H1+f*H2+.75;vnWin(u,y,D/2,0,.9,1.5,lit,'vStone',ash);hnRAShutters(u,y,D/2,0,.9,1.5,trim);}
 for(let f=0;f<2;f++)for(const z of[-3.5,0,3.5])for(const s of[-1,1])vnWin(s*W/2,H1+f*H2+.75,z,s*Math.PI/2,.9,1.5,lit,'vStone',ash,false);
 const y4=H1+2*H2;vB('vStone',0,y4-.3,0,W+.4,.3,D+.4,0,ash);
 // corner oriel on corbels, with its own little spire
 {const ox=W/2-1.3,oz=D/2+.6;for(let k=0;k<3;k++)vB('vStone',ox,H1+H2-.75+k*.25,oz-.35+k*.06,2.2-.4*(2-k),.25,.7+k*.2,0,ash);
  vB('vPlaster',ox,H1+H2,oz,2.4,H2-.1,1.3,0,wall);for(const u of[-.6,.6])vnWin(ox+u,H1+H2+.8,oz+.65,0,.6,1.4,lit,'vStone',ash);vnWin(ox+1.2,H1+H2+.8,oz,Math.PI/2,.5,1.4,lit,'vStone',ash);
  vnPyrRoof('hPyrSc',ox,y4-.2,oz,2.4,1.3,2.4,0,roof,.15);}
 // the roof: eaves to the street, three rows of eyelids on the front slope, two on the back
 const span=D+.4,top=hnGable(0,y4,0,W+.4,span,P,0,'hGableSc',roof,.42,'vGablePl',wall);
 const rows=[[span/2-1.2,[-6,-3,0,3,6]],[span/2-2.9,[-4.5,-1.5,1.5,4.5]],[span/2-4.5,[-3,0,3]]];
 for(const [t,us] of rows)for(const u of us)hnRAEyelid(0,y4,0,0,span,P,1,u,t,1.9,.8,roof);
 for(const [t,us] of rows.slice(0,2))for(const u of us)hnRAEyelid(0,y4,0,0,span,P,-1,u,t,1.9,.8,roof);
 for(const s of[-1,1]){hnForm('hFormT',s*(W/2+.03),y4+1.6,0,s*Math.PI/2,3,1.5);vnWin(s*W/2,y4+3.8,0,s*Math.PI/2,.8,1.1,'shut','vWood',tar);}
 hnStoneChimney(-4.5,top-3.8,-1.6,4.4,.9);hnStoneChimney(4,top-3.8,-1.6,4.4,.9);
 // the walled courtyard behind: rendered walls with a shingle coping, a well, a linden, a coach shed
 {const cz=-D/2-5,cw=W+3,cd=10,wh=3,cx=1.5,wc=wall.clone().multiplyScalar(.96);
  const segs=[[cx-cw/2,cz-cd/2,cx+cw/2,cz-cd/2],[cx-cw/2,cz-cd/2,cx-cw/2,-D/2],[cx+cw/2,cz-cd/2,cx+cw/2,D/2-2]];
  for(const [x0,z0,x1,z1] of segs){const L=Math.hypot(x1-x0,z1-z0),ry=Math.atan2(x1-x0,z1-z0)+Math.PI/2;const mx=(x0+x1)/2,mz=(z0+z1)/2;
   vB('vPlaster',mx,0,mz,L,wh,.5,ry,wc);vnGableRoof(mx,wh,mz,L+.3,.7,.3,ry,'vShingleB',sh,.12);}
  vB('hRubB',cx+cw/2,0,D/2-2,1.2,wh+.7,1.2,0);vB('vStone',cx+cw/2,wh+.7,D/2-2,1.4,.2,1.4,0,ash);            // gate pier at the street
  vB('vPlaster',(W/2+cx+cw/2)/2,0,D/2-2,cx+cw/2-W/2,wh,.5,0,wc);vnGableRoof((W/2+cx+cw/2)/2,wh,D/2-2,cx+cw/2-W/2,.7,.3,0,'vShingleB',sh,.12);
  const wx=cx+3,wz=cz;for(let k=0;k<10;k++){const a=k/10*TAU;kput('vStone',[wx+Math.cos(a)*.75,.4,wz+Math.sin(a)*.75],qEuler(0,-a,0),[.3,.8,.5],ash);}
  for(const s of[-1,1])vPst('vPost',wx+s*.8,0,wz,.07,2.2,tar);vnGableRoof(wx,2.2,wz,1.9,1.2,.5,0,'vShingleB',sh,.2);
  vPst('vPost',cx-5,0,cz,.22,3.2,hC(0x5a4632));for(let k=0;k<6;k++)kput('vLeaf',[cx-5+rr(-1.6,1.6),rr(3.6,5.6),cz+rr(-1.6,1.6)],null,[rr(1.2,1.9),rr(1,1.5),rr(1.2,1.9)],hC(vPick([0x3f7a34,0x4f8a3a,0x356a2a])));
  vB('vWood',cx,0,cz-cd/2+1.7,7,2.6,2.8,0,tar);vnShedRoof(cx,2.6,cz-cd/2+1.7,7,2.8,.7,0,'vShingleB',sh,.3);}
 if(vLit()){vnLampPost(gx-3,0,D/2+1.6,3.2);vnLampPost(gx+3.2,0,D/2+1.6,3.2);}
 vnFolk(-2,D/2+2.6,3,3);}

const HTAG_SF={type:['single-family dwelling']},HTAG_MF={type:['multi-family dwelling']};
HL.def({key:'hl_rep_house_poor_a',name:'Log izba',branch:'republican',family:'Dwellings',tags:Object.assign({wealth:'poor',lit:false},HTAG_SF),w:13,d:14,h:8,build:buildHlRepPoorA});
HL.def({key:'hl_rep_house_poor_b',name:'Two-room log house',branch:'republican',family:'Dwellings',tags:Object.assign({wealth:'poor',lit:false},HTAG_MF),w:14,d:9,h:7,build:buildHlRepPoorB});
HL.def({key:'hl_rep_house_poor_c',name:'Bamboo row cottages',branch:'republican',family:'Dwellings',tags:Object.assign({wealth:'poor',lit:false},HTAG_MF),w:18,d:12,h:7,build:buildHlRepPoorC});
HL.def({key:'hl_rep_house_mid_a',name:'Saxon townhouse',branch:'republican',family:'Dwellings',tags:Object.assign({wealth:'middle',lit:false},HTAG_SF),w:9,d:13,h:13,build:buildHlRepMidA});
HL.def({key:'hl_rep_house_mid_b',name:"Merchant's log house",branch:'republican',family:'Dwellings',tags:Object.assign({wealth:'middle',lit:false},HTAG_SF),w:15,d:14,h:10,build:buildHlRepMidB});
HL.def({key:'hl_rep_house_mid_c',name:'Arcaded tenement',branch:'republican',family:'Dwellings',tags:Object.assign({wealth:'middle',lit:false},HTAG_MF),w:19,d:13,h:22,build:buildHlRepMidC});
HL.def({key:'hl_rep_house_rich_a',name:'Peles villa',branch:'republican',family:'Dwellings',tags:Object.assign({wealth:'rich',lit:true},HTAG_SF),w:22,d:20,h:24,build:buildHlRepRichA});
HL.def({key:'hl_rep_house_rich_b',name:'Terem mansion',branch:'republican',family:'Dwellings',tags:Object.assign({wealth:'rich',lit:true},HTAG_SF),w:28,d:24,h:22,build:buildHlRepRichB});
HL.def({key:'hl_rep_house_rich_c',name:'Patrician house',branch:'republican',family:'Dwellings',tags:Object.assign({wealth:'rich',lit:true},HTAG_SF),w:22,d:30,h:25,build:buildHlRepRichC});
