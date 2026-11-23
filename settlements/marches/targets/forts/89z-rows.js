// TARGET: forts — the Marches' west and south watch forts on a sheet (settlements/marches/PLAN.md, M1). The page is Xanadu's
// showcase (90-scene: its sky, its flat meadow, its bake), with no rows of the kit (XA.families is emptied): SITES is this sheet's
// own. TITLE is read by build.py for the page <title>.
//   The records: the forts' ids, names, px, people and state are XAN_TUNE's (core/region/data/xan-tune.js, loaded before this as
//   gen/69m-mr-tune.js), read through XAN_TUNE.valley (the forts are settlements of the valley spec; they need no region plan, so
//   {sites:[]} gives the same records as the region's: the node test holds that) and the musketeers from T.muskets. Nothing copied.
//   The fort: XFORT.plan({size:'watch'}) (kits/xanadu 80f), checked by XFORT.check before anything is drawn; the def that draws it
//   (xa_fort_watch, 80g) draws the same plan. Each fort in its three states (o.v 0 kept, 1 damaged, 2 ruined: XFORT.damage), its
//   damage hashed from core/rand by its own seed (KRAND.child of its id), so the two forts fall differently.
//   The garrison's split is PROPOSED (PLAN.md section 3); it sums to the tune's people and its musketeers are the tune's.
//   The layout, per fort, in its own frame (+z the front, the gate's side): the fort at the origin, the road down from the gate, the
//   wayside shrine beside the road at the gate, the corral and the stable yard's cistern off the left flank, the relay post
//   (xa_fort_post) out on the right. A row per fort (west in front), a column per state; the works stand with the kept and the
//   damaged fort (a raid's damage is the fort's), only the road and the post's ruin with the ruined one (a generation abandoned). [G data]
const TITLE='The Marches — the west and south watch forts';
XA.families=()=>[];
const XA_EXTRA=[];
const MR=(function(){const R=MRF.records(XAN_TUNE,XFORT,KRAND);   /* src/80n-mr-forts.js: the records and the plan, node-tested */
 R.forts.forEach((F,i)=>{F.row=i;});return Object.assign(R,{states:XF_STATES,pitch:{x:210,z:330}});})();
/* a fort's works, in its frame (+z the front; the fort's plot is 82 x 68 m round the origin, its gate at z 21) */
const MR_WORKS=[
 {key:'mr_road',x:0,z:23.5+75,ry:0,o:{len:150},with:[0,1,2]},
 {key:'mr_wayside_shrine',x:8.5,z:38,ry:0,with:[0,1]},
 {key:'xa_corral',x:-60,z:24,ry:0,o:{v:0},with:[0,1]},
 {key:'mr_cistern',x:-60,z:42,ry:0,with:[0,1]},
 {key:'xa_fort_post',x:64,z:120,ry:0,state:true,with:[0,1,2]}];
const SITES=[];
MR.forts.forEach(F=>MR.states.forEach((st,v)=>{const cx=(v-1)*MR.pitch.x,cz=-F.row*MR.pitch.z;
 SITES.push({key:'xa_fort_watch',x:cx,z:cz,ry:0,o:{v,seed:F.seed},fort:F.id,state:st,label:F.name+' — '+st});
 MR_WORKS.forEach(W=>{if(W.with.indexOf(v)<0)return;SITES.push({key:W.key,x:cx+W.x,z:cz+W.z,ry:W.ry,o:Object.assign({},W.o||{},W.state?{v}:{}),fort:F.id,state:st,work:true});});}));
