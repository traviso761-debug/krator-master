// ================================================================= THE HOUSE OF THE TEMPEST — the build: the House on its pad
// The two wards (src/80u: xa_tempest_outer at the pad, xa_tempest_inner 4 m up on its talus) and the Qiblai kit's violet great
// monastery (qb_monastery, o.v 6: kits/qiblai/src/89q3, read in place) in the inner ward, its gate toward the utse; baked into one
// group. The wards' walks go to core/walk as the fort's builders draw them (xfWalks). [web]: three.js.
const TP_B0=performance.now();
const TP_GROUP=new THREE.Group();TP_GROUP.name='The House of the Tempest';scene.add(TP_GROUP);
TPS.G={};
for(const[key,y,v]of[['xa_tempest_outer',TPS.pad,0],['xa_tempest_inner',TPS.pad+TPS.inner,0]]){TSTAT.cur=key+'/'+v;const r0=REG.length;
 TPS.G[key]=VERN.place(TP_GROUP,key,TPS.x,TPS.z,TPS.ry,{v,y});for(let i=r0;i<REG.length;i++)REG[i].type=key;}
/* step 4: the crest's grounds (90p), placed with the House in its frame at the pad; every piece stands on the drawn ground */
{TSTAT.cur='xa_tempest_grounds/0';const r0=REG.length;TPS.G.xa_tempest_grounds=VERN.place(TP_GROUP,'xa_tempest_grounds',TPS.x,TPS.z,TPS.ry,{v:0,y:TPS.pad});for(let i=r0;i<REG.length;i++)REG[i].type='xa_tempest_grounds';}
{const H=TP_PLAN.hosted,p=TPS.toPage(H.at[0],H.at[1]);TSTAT.cur=H.key+'/'+H.o.v;const r0=REG.length;
 TPS.G[H.key]=VERN.place(TP_GROUP,H.key,p[0],p[1],TPS.ry+H.ry,{v:H.o.v,y:TPS.pad+TPS.inner});for(let i=r0;i<REG.length;i++)REG[i].type=H.key;}
TSTAT.cur=null;kbake(TP_GROUP);if(typeof xaDoorsBind==='function')xaDoorsBind();
/* the interiors (89xs, step 3): every door's walk block into core/walk, the unlocked doorways cleared (89y xaIxWalk; window._interiors) */
if(typeof xaIxWalk==='function')xaIxWalk();
LABELS=new THREE.Group();LABELS.userData.probeSkip=true;scene.add(LABELS);
window._registered=REG.length;window._buildMs=Math.round(performance.now()-TP_B0);   /* the count after the House is placed (Xanadu's 90-scene set it before: Strongwall's page does the same; check_assembly's CLASH _registered is baselined for both) */
/* the page's record of the House: where it stands, its pad, the ground under its lot's corners and middle, its gates and the
   plan's rules as the page reads them (the verify's) */
window._tempest=Object.assign({},window._tempestSite,{placed:!!(TPS.G.xa_tempest_outer&&TPS.G.xa_tempest_inner),hosted:!!TPS.G[TP_PLAN.hosted.key],
 drawn:window._tempestDrawn||{},rules:TEMPEST.check(TP_PLAN),
 lotGround:[[TPS.box[0],TPS.box[1]],[TPS.box[2],TPS.box[1]],[TPS.box[2],TPS.box[3]],[TPS.box[0],TPS.box[3]],TPS.toPage(0,100)].map(p=>Math.round(terrainH(p[0],p[1])*100)/100),   /* the lot's corners and the muster court (the middle is the inner ward, 4 m up) */
 innerGround:Math.round(terrainH(TPS.x,TPS.z)*100)/100,
 gates:TP_PLAN.gates.map(g=>{const p=TPS.toPage(g.at[0],g.at[1]);return{id:g.id,x:Math.round(p[0]),z:Math.round(p[1])};}),
 forts:(window._xaForts||[]).length,towers:TP_PLAN.towers.length,buildings:TP_PLAN.buildings.length,
 grounds:{placed:TP_GPLACED.length,of:TP_GROUNDS.pieces.length,rules:TP_GROUNDS.check(TP_PLAN),seat:TP_GPLACED.reduce((m,p)=>Math.max(m,Math.abs(p.y-p.ground)),0),
  fields:TP_GROUNDS.fields.length,tracks:TP_GROUNDS.tracks.length,offPad:TP_GPLACED.filter(p=>Math.abs(p.ground-TPS.pad)>.05).length},
 rooms:['xa_tempest_outer','xa_tempest_inner'].reduce((s,k)=>s+((TPS.G[k]&&TPS.G[k].userData.interior)?TPS.G[k].userData.interior.rooms:0),0),
 pieces:['xa_tempest_outer','xa_tempest_inner'].reduce((s,k)=>s+((TPS.G[k]&&TPS.G[k].userData.interior)?TPS.G[k].userData.interior.pieces:0),0)});
