// ================================================================= 70q. PYLON: the poor dwellings, the salvage tier (PLAN.md section 4)
// Built of the Vernacular's own poor materials (corrugate, Ancient panel, rust plate, timber, tarps) in Pylon's forms
// (tanks, pods, reused Ancient rings, hex cells): the bridge between the two kits (VASSAL-KITS.md section 2). No lights
// (the lighting rule). Seeds 9051-9089.
const PY_TAG_POOR={culture:'pylon',style:'salvage',type:['single-family dwelling'],wealth:'poor',lit:false};

// Tank house (refs/ancient 3.jpg): a reclaimed capsule tank on pipe legs, a railed ring deck at its foot, a round hatch
// for a door, portholes, a lean-to of corrugate and a smaller tank piped to it.
function buildPylTankHouse(G,o){reseed(9051+(o.v|0));const Z=-.4,R=2.2,LEG=1.4,H=4.6;
 const rust=vC(vPick(PYPAL.rust)),gun=vC(vPick(PYPAL.gunmetal)),wood=vC(vPick(VPAL.woodPoor)),or=vC(vPick(PYPAL.orange));
 vnReg('Tank house (poor)',0,Z,4.8,LEG+H+R*.75+2,{style:'salvage'});
 for(let k=0;k<4;k++){const a=Math.PI/4+k*Math.PI/2;vPst('vPipe',Math.sin(a)*1.5,0,Z+Math.cos(a)*1.5,.13,LEG+.05,gun);}
 kput('pyDiscR',[0,LEG-.06,Z],qEuler(Math.PI/2,0,0),[3.3,3.3,.12],rust.clone().multiplyScalar(.8));
 pynTank(0,LEG,Z,R,H,rust);
 for(const y of[LEG+1.2,LEG+2.5,LEG+3.8])kput('vHoop',[0,y,Z],qEuler(Math.PI/2,0,0),[R+.04,R+.04,R+.04],gun);
 // the deck rail: posts round the deck's rim and an iron hoop on them
 for(let k=0;k<10;k++){const a=k*TAU/10;if(Math.abs(Math.sin(a/2))<.12)continue;vPst('vPipe',Math.sin(a)*3.2,LEG,Z+Math.cos(a)*3.2,.04,1,gun);}
 kput('vHoop',[0,LEG+1,Z],qEuler(Math.PI/2,0,0),[3.2,3.2,3.2],gun);
 pynPorthole(0,LEG+1.05,Z+R+.02,0,.78,gun,'D',0);
 for(const a of[-.75,.75])pynPorthole(Math.sin(a)*(R+.02),LEG+3.1,Z+Math.cos(a)*(R+.02),a,.36,or,'G',2);
 vnLadder(0,0,Z+3.55,0,LEG+.1,wood);
 // the small tank and its pipe, an aerial on the cap
 pynTank(3.4,0,Z-1.5,1.05,2.3,rust.clone().multiplyScalar(.9));vBeam([1.9,LEG+2.4,Z-.9],[3.1,2.2,Z-1.4],.16,gun,'vPipe');
 vPst('vPipe',.7,LEG+H+.9,Z-.6,.05,2.4,gun);kput('pyDiscD',[.7,LEG+H+2.2,Z-.35],vQ(0,-.5,0),[.4,.4,.05],null);vBall('vBall',.7,LEG+H+3.3,Z-.6,.08,gun);
 // the lean-to on the west: corrugate walls on timber posts, a tarp for a door, a shed roof
 const lx=-3.7,lz=Z+.4;vnFrame(lx,0,lz,2.4,2.2,3.2,0,wood,.1);
 vB('vCorr',lx-1.15,0,lz,.08,2.2,3.2,0,null);vB('vCorr',lx,0,lz-1.55,2.4,2.2,.08,0,null);
 vPl('vTarp',lx,1.1,lz+1.6,2.2,2.2,0,vC(0x9a7a4a));
 vnShedRoof(lx,2.2,lz,2.6,3.4,.45,Math.PI/2,'vCorr',null,.3,.1);
 vnWaterButt(1.9,0,Z+2.9,.38,.9);vnCrate(-1.8,0,Z+3.3,.7,.3,wood);vnSacks(2.6,0,Z+2.2,3);}

// Pod stack (refs/pylon7.jpg): cube pods of panel, plate and corrugate stacked against a standing fragment of Ancient
// wall, one cantilevered off it on struts; ladders between, tarps, a water butt.
function buildPylPodStack(G,o){reseed(9061+(o.v|0));const ZW=-3.2;
 const wh=vC(vPick(PYPAL.white)),wood=vC(vPick(VPAL.woodPoor)),gun=vC(vPick(PYPAL.gunmetal)),rust=vC(vPick(PYPAL.rust));
 vnReg('Pod stack (poor, shared)',0,-.6,5.6,9.6,{style:'salvage',type:['multi-family dwelling']});
 // the Ancient fragment: a panel slab with a broken, stepped top
 vB('vPanelB',0,0,ZW,9.4,6.6,.9,0,wh);
 for(const [x,w,h] of[[-3.6,2.2,1.4],[-1.2,1.6,.7],[2.9,3.6,2.2],[1.0,.8,.4]])vB('vPanelB',x,6.6,ZW,w,h,.9,0,wh);
 // a pod: a box of one material with a door or a window on its front and a sheet roof
 const pod=(x,y,z,w,h,d,item,c,door)=>{vB(item,x,y,z,w,h,d,0,c);vB('vCorr',x,y+h,z,w+.3,.08,d+.3,0,null);
  if(door)vnDoor(x-w*.2,y,z+d/2,0,.85,1.85,'vWood',wood,vC(0x5a4a3a),false);else vnWin(x,y+.9,z+d/2,0,.9,.8,'open','vWood',wood,true);
  vnWin(x+w/2,y+.95,z,Math.PI/2,.7,.7,'shut','vWood',wood);};
 pod(-2.4,0,-.9,3.2,2.5,3.2,'vCorr',null,true);
 vnStilts(1.9,0,-.9,3,3,.5,0,wood,.12);pod(1.9,.5,-.9,3.2,2.5,3.2,'vRustB',rust,true);
 pod(-.4,2.75,-1.1,3.4,2.4,3.4,'vPanelB',wh,true);
 // the hanging pod: off the fragment on two struts, reached by a ladder from the roof below
 pod(2.9,5.4,-1.4,2.8,2.2,2.8,'vPanelB',wh.clone().multiplyScalar(.95),false);
 for(const s of[-1,1])vBeam([2.9+s*1.1,4.2,ZW+.5],[2.9+s*1.1,5.38,-.3],.16,gun,'vIron');
 vnLadder(-2.1,0,1.1,0,2.8,wood);vnLadder(1.6,2.8,.8,0,2.6,wood);
 vnAwning(1.9,2.4,.7,0,2.4,1.1,vC(vPick(VPAL.awning)));vnAwning(-3.1,2.05,.7,0,1.2,.9,vC(0xb0703a));
 vnWaterButt(-4.1,0,.4,.4,1.0);vnBarrel(3.9,0,.5,.32,.9,rust);vnCrate(.2,0,1.3,.6,.4,wood);}

// Ring house (refs/pylon8.jpg): a small house of white render whose door is framed by a reused Ancient ring, portholes
// for windows, a cloth awning on poles, a flanged standpipe and junction box, pots, a small dome on the roof.
function buildPylRingHouse(G,o){reseed(9071+(o.v|0));const W=6.4,D=6,H=3.2,Z=-1.0,zf=Z+D/2;
 const wh=vC(vPick(PYPAL.cream)),anc=vC(vPick(PYPAL.white)),or=vC(vPick(PYPAL.orange)),gun=vC(vPick(PYPAL.gunmetal)),wood=vC(vPick(VPAL.woodPoor));
 vnReg('Ring house (poor)',0,Z+.5,5,H+2.2,{style:'salvage'});
 vnBody('vPlaster',0,0,Z,W,H,D,0,wh,{t:.25});
 vB('vPlaster',0,H,Z,W+.1,.55,D+.1,0,wh);vB('vPlaster',0,H+.55,Z,W+.2,.08,D+.2,0,or);
 // the ring: an Ancient hoop stood in the ground round the door, half of it buried
 kput('pyRing',[-.8,1.1,zf+.22],null,[1.75,1.75,1.6],anc);
 pynTomb(-.8,0,zf,0,1.1,2.2,.04,.1,'D');
 pynPorthole(1.7,1.7,zf,0,.42,or,'G',0);pynPorthole(W/2,1.7,Z-.6,Math.PI/2,.42,anc,'G',3);
 vnWin(-W/2,1.2,Z,-Math.PI/2,.8,1,'shut','vWood',wood);
 // awning on two poles over the porthole window, clear of the ring and the standpipe
 vnAwning(1.6,2.45,zf,0,2.0,1.3,vC(vPick(VPAL.awning)));
 // the standpipe with its flanges and the junction box
 vPst('vPipe',2.9,0,zf+.35,.15,4.1,gun);for(const y of[1.3,2.8])vPst('vPipe',2.9,y,zf+.35,.24,.12,gun);
 vB('vIron',2.4,1.6,zf+.05,.5,.6,.2,0,gun);vBeam([2.9,3.6,zf+.35],[2.9,3.6,zf-.2],.1,gun,'vPipe');
 // a small dome on a drum at the back corner of the roof
 vPst('vPostS',-1.6,H+.55,Z-1.3,1.0,.5,wh);kput('vDomeP',[-1.6,H+1.05,Z-1.3],null,[1.0,.9,1.0],anc);
 for(const [x,z] of[[1.0,zf+.6],[1.4,zf+.5],[-2.6,zf+.5]])kput('vClayPot',[x,0,z],null,[.22,.5,.22],null);
 vnCrate(-2.8,0,zf+1.2,.55,.2,wood);}

// Hex cells (refs/honeycomb 2.jpg): a honeycomb of hexagonal pods, five columns and three rows, on a concrete plinth,
// each pod a room open at its front behind a dark or glazed hexagon, with plank walks, a steel stair and ladders.
function buildPylHexCells(G,o){reseed(9081+(o.v|0));const R=1.6,LEN=4.2,ZF=1.4,Y0=.5,COLS=5,ROWS=3,HF=Math.sqrt(3)*R;
 const wh=vC(vPick(PYPAL.white)),or=vC(vPick(PYPAL.orange)),gun=vC(vPick(PYPAL.gunmetal)),conc=vC(vPick(PYPAL.formwork)),wood=vC(vPick(VPAL.woodPoor));
 const W=1.5*R*(COLS-1)+2*R;
 vnReg('Hex cells (poor, shared)',0,ZF-LEN/2,W/2+.6,Y0+HF*(ROWS+.5)+.5,{style:'salvage',type:['multi-family dwelling']});
 vB('pyConc',0,0,ZF-LEN/2,W+.6,Y0,LEN+.6,0,conc);
 for(let c=0;c<COLS;c++)for(let r=0;r<ROWS;r++){const x=-W/2+R+c*1.5*R,yc=Y0+HF/2+r*HF+(c%2?HF/2:0);
  if(r===ROWS-1&&c%2)continue;                                         // the odd columns stop a half-cell lower: a stepped top
  const t=rng(),c0=t<.62?wh:t<.85?or:null;pynHexPod(x,yc,ZF,0,R,LEN,0,c0,rng()<.5?'G':'D',c0?'pyHex':'pyHexR');}
 // the access is at the back, where the pods' ends meet a steel gallery (a walk in front would cut the offset pods):
 // two railed decks on posts behind the honeycomb, a steel stair up the east end to the first
 const ZB=ZF-LEN-.7;for(const r of[1,2]){const y=Y0+r*HF-.05;vB('vWood',0,y-.12,ZB,W,.12,1.3,0,wood);
  vB('vIron',0,y+.95,ZB-.62,W,.05,.05,0,gun);for(let k=0;k<8;k++)vPst('vPipe',-W/2+k*W/7,y,ZB-.62,.03,.95,gun);}
 for(let k=0;k<5;k++)vPst('vPipe',-W/2+k*W/4,0,ZB-.6,.08,Y0+2*HF,gun);
 vnStairs(W/2+.7,0,ZB+.2,-Math.PI/2,1.0,Y0+HF-.05,9,'vIron',gun);vnLadder(-W/2-.4,Y0+HF,ZB,Math.PI/2,HF,wood);
 vnDryingRack(-2,0,ZF+1.6,0,2.4);vnWaterButt(2.6,0,ZF+1.3,.38,.9);}

VERN.def({key:'pyl_tank_house',name:'Tank house',family:'dwelling',tags:PY_TAG_POOR,w:11,d:9,h:10,build:buildPylTankHouse});
VERN.def({key:'pyl_pod_stack',name:'Pod stack',family:'dwelling',tags:Object.assign({},PY_TAG_POOR,{type:['multi-family dwelling']}),w:11,d:9,h:9.5,build:buildPylPodStack});
VERN.def({key:'pyl_ring_house',name:'Ring house',family:'dwelling',tags:PY_TAG_POOR,w:9,d:9,h:6,build:buildPylRingHouse});
VERN.def({key:'pyl_hex_cells',name:'Hex cells',family:'dwelling',tags:Object.assign({},PY_TAG_POOR,{type:['multi-family dwelling']}),w:15,d:7,h:10.5,build:buildPylHexCells});
