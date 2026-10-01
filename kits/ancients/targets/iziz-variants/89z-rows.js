// TARGET: iziz-variants (dev) — the tower stumps (src/8an-iz-stumps.js), one row per skyscraper family:
// the ruined tower at x=+300, its stump at x=-300 (decay 0/1: snapped ruin) and the repaired stump at x=0
// (decay 3: the sibling at decay 3, camped in by repairPass). Rows are 800 apart in z, A first.
// Kit rows are the coordinator's: this target only shows the stumps beside their towers.
const TITLE='Iziz variants — tower stumps';
const DECAYS=[0,3];
const IZV_FAMS=['A','B','C','D','E','F','G','H','I','J','K'];
const GROUND_C=IZV_FAMS.length*400;
const ROWS={};
IZV_FAMS.forEach((f,i)=>{ROWS['sky'+f]={z:i*800,s:300,r:280,ds:[1]};ROWS['stump'+f]={z:i*800,s:300,r:280,ds:[0,3]};});
const RUINS=IZV_FAMS.map((f,i)=>[0,i*800,420]);
// (this file loads before src/8an-*: the stump builders are function declarations, hoisted, but STUMP_BUILDERS is a
// const not yet initialised here, so the map is spelled out)
const EXTRA_BUILDERS={skyI:buildSkyI,skyJ:buildSkyJ,skyK:buildSkyK,stumpA:buildStumpA,stumpB:buildStumpB,stumpC:buildStumpC,stumpD:buildStumpD,
 stumpE:buildStumpE,stumpF:buildStumpF,stumpG:buildStumpG,stumpH:buildStumpH,stumpI:buildStumpI,stumpJ:buildStumpJ,stumpK:buildStumpK};
// The tripod market check (src/77z-iziz-style.js tripodMarket, used by iziz-style and the Iziz city): the kit's own
// repaired Skyscraper C on its own podium, the market laid on the podium top (y+1.55 = 5.3), stalls a plain kit
// counter under a tarp. Shows the leg radius it reads off the tower (tripodLegR) and the crowd.
const IZV_AWN=[];
const IZV_TRIPOD={awnings:IZV_AWN,post:'tpole',ball:'tbulb',rope:'tpole',col:izsC,culture:'ancients-reclaimed',
 stall:(c,Gs)=>{kput('tplank',[0,.6,0],null,[3.2,1.2,1.8],null);kput('shantyRoof',[0,2.7,.2],qEuler(.18,0,0),[3.8,1,2.8],c||new THREE.Color(0xc06a3a));
  for(const sx of[-1.7,1.7])for(const sz of[-1,1.3])kput('tpole',[sx,1.3,sz],null,[1,2.6,1],null);}};
ROWS.mktC={z:IZV_FAMS.length*800,s:300,r:280,ds:[3]};
EXTRA_BUILDERS.mktC=(scene,gx,gz,d)=>{const G=buildSkyC(scene,gx,gz,d);
 tripodMarket(G,{x:gx,z:gz},3.75,1,0,gx,gz,0,IZV_TRIPOD);
 for(const w of IZV_AWN.splice(0)){const m=MAT.tarp.clone();m.color=izsC(w.c);const me=new THREE.Mesh(w.g,m);scene.add(me);}
 return G;};
