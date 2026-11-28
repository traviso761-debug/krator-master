// ================================================================= THE MARCHES — the forts' outside works the kit lacks (PLAN.md section 3, M1)
// Three small defs on the Xanadu kit's contract (XA.def on VERN.def, the xn* helpers), drawn beside each watch fort on the sheet:
// the wayside shrine at the gate, the stable yard's cistern beside the corral (kits/xanadu xa_corral), and the road down from the
// gate. The kit has none of them (PLAN.md section 4 names `xa_wayside_shrine`): they are written here, in the Marches' own src,
// and belong in kits/xanadu when its owner takes them (KNOWN_ISSUES.md). No gold: the fort's rule is gold on the main gate's
// pavilion and the keep's chapel only (settlements/strongwall/PLAN.md 5.5), and these stand at its gate. Local frame: origin at the
// plot centre on the ground, +z the front. Seeds 32411-32431.
const MR_TAG=(type)=>({type:[type],wealth:'poor',lit:false});
// ---------------------------------------------------------------- the wayside shrine: a whitewashed chorten on a stepped plinth,
// its bell dome and a stepped spire in wash (the Marches' plain shrines), an offering ledge, mani stones, a line of prayer flags
function buildMrShrine(G,o){reseed(32411);const wash=xC(xPick(XPAL.wash)),rub=xC(xPick(XPAL.rubble)),maroon=xC(xPick(XPAL.maroon));
 vnReg('Wayside shrine',0,0,2.2,6.2,{part:'shrine'});
 xnWall(0,0,0,3.6,.35,3.6,0,rub,'stone');
 const S=xnStack(0,.35,0,3.0,3.0,0,[.7,.55,.45],wash,'wash',maroon);
 vB('xBandB',0,S.y,0,S.w+.1,.22,S.d+.1,0,maroon);
 const top=xnDome(0,S.y+.22,0,.95,'W',{fin:0});
 let y=top-.05;for(let i=0;i<5;i++){const r=.34-i*.05;kput('xDrumW',[0,y,0],null,[r,.2,r],wash);y+=.22;}   /* the thirteen wheels, five here */
 kput('xConeW',[0,y,0],null,[.12,.5,.12],wash);
 vB('vStone',0,0,2.25,2.2,.55,.5,0,rub);   /* the offering ledge before it */
 for(let i=0;i<4;i++)vB('vStone',-1.4+i*.95,0,-2.3,.7,.28+rng()*.2,.45,rng()*.4-.2,rub);   /* mani stones along the back */
 vPst('vPost',1.9,0,1.9,.06,5.2,xC(0x5a4632));xnPennants([1.9,5.1,1.9],[0,top-.2,0],7);xnPennants([1.9,5.1,1.9],[-1.9,.9,-1.9],8);}
XA.def({key:'mr_wayside_shrine',name:'Wayside shrine (the Marches\')',family:'Marches works',tags:MR_TAG('religious'),w:6,d:6,h:6.4,fw:4,fd:4,nv:1,build:buildMrShrine});
// ---------------------------------------------------------------- the stable yard's cistern: a rubble-walled tank under a wash
// coping, its well head and windlass, a stone trough for the horses and the dzo beside it
function buildMrCistern(G,o){reseed(32421);const wash=xC(xPick(XPAL.wash)),rub=xC(xPick(XPAL.rubble)),tim=xC(xPick(XPAL.aged)),water=xC(XPAL.water);
 vnReg('Cistern',0,-.6,3.4,2.4,{part:'cistern'});
 for(const s of[-1,1]){vB('xRubB',0,0,-.6+s*1.65,5.4,.85,.5,0,rub);vB('xRubB',s*2.45,0,-.6,.5,.85,2.8,0,rub);}   /* the tank's four walls */
 vB('xWashB',0,.85,-.6,5.6,.12,3.9,0,wash);vB('xWaterB',0,.35,-.6,4.4,.05,2.8,0,water);   /* the coping, the water inside */
 vB('xWashB',0,.97,-.6,1.6,.06,1.2,0,wash);   /* the well head's slab over the draw hole */
 for(const s of[-1,1])vPst('vPost',s*.8,.97,-.6,.07,1.5,tim);vBeam([-.85,2.4,-.6],[.85,2.4,-.6],.12,tim);kput('xDrumE',[0,2.2,-.6],qEuler(0,0,Math.PI/2),[.18,.7,.18],tim);
 vB('vStone',0,0,2.2,4.2,.6,.8,0,rub);vB('xWaterB',0,.52,2.2,3.8,.06,.5,0,water);}   /* the trough */
XA.def({key:'mr_cistern',name:'Cistern and trough (the stable yard\'s)',family:'Marches works',tags:MR_TAG('infrastructure'),w:7,d:7,h:3,fw:5.6,fd:5.4,nv:1,build:buildMrCistern});
// ---------------------------------------------------------------- the road down: a gravel bed (o.len metres, 150 by default) with a
// kerb of set stones every few metres, a milestone at its foot
function buildMrRoad(G,o){reseed(32431);const L=o.len==null?150:o.len,W=o.width==null?4.5:o.width,grav=xC(0xa59a84),rub=xC(xPick(XPAL.rubble));
 vnReg('Road',0,0,W/2,.2,{part:'road'});
 vB('xEarthB',0,-.03,0,W,.06,L,0,grav);
 for(let z=-L/2+2;z<L/2-1;z+=6)for(const s of[-1,1])vB('vStone',s*(W/2+.15),0,z+rng()*2,.4,.22,.5,rng()*.6-.3,rub);
 vB('vStone',W/2+.9,0,L/2-1.5,.45,1.1,.3,0,xC(xPick(XPAL.stone)));}
XA.def({key:'mr_road',name:'Road down from the gate',family:'Marches works',tags:MR_TAG('infrastructure'),w:6,d:150,h:1,fw:5,fd:150,nv:1,build:buildMrRoad});
