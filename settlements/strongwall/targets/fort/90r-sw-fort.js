// ================================================================= STRONGWALL — the build: the march fort on its pad
// XFORT's march plan drawn by the Xanadui fort (kits/xanadu/src/80g-xa-fort.js, read in place: kit.json "external"), kept (o.v 0),
// at its place (89zs: the gorge wall on the pin's row, the Qiblai Gate facing north) and on the pad's height; baked into its own
// group. Its wall walks, stairs and landings go to core/walk as the fort draws them (xfWalk). [web]: three.js.
const SW_B0=performance.now();
const SW_GROUP=new THREE.Group();SW_GROUP.name='Strongwall';scene.add(SW_GROUP);
TSTAT.cur=SW.key+'/0';
{const r0=REG.length,g=VERN.place(SW_GROUP,SW.key,SW.x,SW.z,SW.ry,{v:0,y:SW.pad});for(let i=r0;i<REG.length;i++)REG[i].type=SW.key;SW.G=g;}
TSTAT.cur=null;kbake(SW_GROUP);if(typeof xaDoorsBind==='function')xaDoorsBind();
LABELS=new THREE.Group();LABELS.userData.probeSkip=true;scene.add(LABELS);
window._registered=REG.length;window._buildMs=Math.round(performance.now()-SW_B0);
/* the page's record of the fort: where it stands, its pad, and the ground under its lot's corners and its gates (the verify's) */
window._strongwall=Object.assign({},window._strongwallSite,{placed:!!SW.G,
 lotGround:[[SW.box[0],SW.box[1]],[SW.box[2],SW.box[1]],[SW.box[2],SW.box[3]],[SW.box[0],SW.box[3]],[SW.x,SW.z]].map(p=>Math.round(terrainH(p[0],p[1])*100)/100),
 gates:SW.P.gates.map(g=>{const p=SW.toPage(g.at[0],g.at[1]);return{id:g.id,x:Math.round(p[0]),z:Math.round(p[1]),ground:Math.round(terrainH(p[0],p[1])*100)/100};}),
 forts:(window._xaForts||[]).length});
