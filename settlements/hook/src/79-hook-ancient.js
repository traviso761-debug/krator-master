/* ============================== HOOK: THE ANCIENT TOWN'S RUIN HOSTS ============================== */
/* [draw] The five Ancient host types (kits/ancients/src/8ap-host-*.js, read in place by build.py as 78*-host-*.js with
   the skyscraper helpers they call lifted from 52-sky-abc.js) registered as Port segments, so the kit's own loop
   (settlements/port/src/90-scene.js) stamps their pads, runs them, flushes and bakes them like any segment, and
   `port-every-key` counts them. A host is a land block the width of its podium; the layout (targets/hook/89z-rows.js)
   places them on the Ancient town's grid from the site's `hosts` (the named ones) and by KRAND (the rest).
   Decay is the Port's (0 intact, 1 ruined, 3 repaired: the kit's own 0, 1 and 3); a host may be cut at a storey
   (opt.cutY, the kit's Ys hook) so a 360 m tower reads as the stump the city keeps. The builder runs inside a group at
   the pad's height with the kit's group transform on, as Ys runs them (settlements/ys/src/64-hyk-accrete.js). */
var YS_CUT=null;              /* the hosts' Ys hooks: a cut storey (ysCutY), a shrunk podium (ysPodiumR); set per host below */
function ysCutY(d){return ((d===1||d===3)&&YS_CUT&&YS_CUT.cutY!=null)?YS_CUT.cutY:null;}
function ysPodiumR(R){return (YS_CUT&&YS_CUT.podium!=null)?Math.min(R,YS_CUT.podium):R;}
/* key -> the kit's spec, its builder, the pad's width (the podium with a margin, at most PORT.BLOCK) */
const HOOK_HOSTS={
 anFacet:{spec:HOSTSPEC_FACET,builder:buildHostFacet,W:84},
 anBastion:{spec:HOSTSPEC_BASTION,builder:buildHostBastion,W:110},
 anArcades:{spec:HOSTSPEC_ARCADES,builder:buildHostArcades,W:98},
 anStalks:{spec:HOSTSPEC_STALKS,builder:buildHostStalks,W:88},
 anBell:{spec:HOSTSPEC_BELLHALL,builder:buildHostBellHall,W:96}};
/* the ground a host stands on: the ridge or the natural coast under its centre, never below the quays (76-hook-ground.js) */
function hookHostPad(o){const W=HOOK_HOSTS[o.key].W;return Math.max(PORT.DECK,hookGroundH(o.gx,o.gz-W/2));}
function hookHostStamps(o){const W=HOOK_HOSTS[o.key].W,w=W/2,y=hookHostPad(o);
 return [{kind:'flat',x0:-w,x1:w,z0:-W,z1:0,y,soft:24,paint:'pave'}];}
function hookHostBuild(key,scene,gx,gz,d,opt){const H=HOOK_HOSTS[key],y=hookHostPad(opt),cz=gz-H.W/2;
 const G=new THREE.Group();G.position.set(gx,y,cz);G.rotation.y=opt.ry||0;scene.add(G);G.updateMatrix();
 YS_CUT=(opt.cutY!=null)?{cutY:opt.cutY}:null;
 /* the kit's full decay (1) eats 83 % of a tower's skin, which reads as a ghost lattice of window slots and ribs from
    the quays; a host the town lives in keeps its wall: a ruin a fifth holed, a repaired one a third (Ys keeps .4) */
 const hz=HOLES;HOLES=d===1?.18:d>0?.3:1;
 KOFF=[0,0,0];
 /* the kit's instanced detail (kput) takes the group transform KXF. The kit's own bodyGroup (54-mat-concrete.js) calls
    useGroupXF on a sub-group whose matrix is LOCAL to the builder's group, then endGroupXF, which would replace the
    host's frame by the sub-group's and then clear it: every strut, pane and tube of every host then stood at the
    origin, a ghost tower at the quay (the owner, 2026-10-19). While a host builds, the helpers compose from the
    WORLD matrix and fall back to the host's frame, never to none */
 const uG=useGroupXF,eG=endGroupXF,frame=P=>{P.updateWorldMatrix(true,false);return {m:P.matrixWorld.clone(),q:new THREE.Quaternion().setFromRotationMatrix(P.matrixWorld)};};
 useGroupXF=function(P){KXF=frame(P);};endGroupXF=function(){KXF=frame(G);};
 useGroupXF(G);
 const sub={add:o=>G.add(o)};      /* the builder makes its own group at the origin: it lands inside G, at the pad */
 const r0=REG.length;
 try{H.builder(sub,0,0,d);}catch(e){reportErr('host '+key+' d='+d+' '+e.stack);}
 finally{useGroupXF=uG;endGroupXF=eG;}
 YS_CUT=null;HOLES=hz;KXF=null;KOFF=[0,0,0];
 /* the kit's registered volume is generous (130 m for a tower): shrink it to the host's cap so it stays inside the pad
    and the clearance, as Ys does; the inspector then names the host only over its own ground */
 const cap=Math.min((H.spec.cap!=null?H.spec.cap:H.W/2)+2,H.W/2-PORT.CLEAR);   /* and inside the kit's clearance: KNOWN_ISSUES.md */
 for(let i=r0;i<REG.length;i++)REG[i].r=Math.min(REG[i].r,cap);
 /* a host's skin is a thin folded prism: core/lod's vertex clustering collapses it at range and the tower reads as a
    lattice of its window instances (the owner's ghost tower, 2026-10-19). The skin meshes stay out of the LOD; the
    kit's instanced detail on the host is still managed */
 G.traverse(o=>{if(o.isMesh&&!o.isInstancedMesh)o.userData.lodSkip=true;});
 return G;}
function buildAnFacet(scene,gx,gz,d,opt){reseed(79010+d);return hookHostBuild('anFacet',scene,gx,gz,d,opt);}
function buildAnBastion(scene,gx,gz,d,opt){reseed(79020+d);return hookHostBuild('anBastion',scene,gx,gz,d,opt);}
function buildAnArcades(scene,gx,gz,d,opt){reseed(79030+d);return hookHostBuild('anArcades',scene,gx,gz,d,opt);}
function buildAnStalks(scene,gx,gz,d,opt){reseed(79040+d);return hookHostBuild('anStalks',scene,gx,gz,d,opt);}
function buildAnBell(scene,gx,gz,d,opt){reseed(79050+d);return hookHostBuild('anBell',scene,gx,gz,d,opt);}
PORT_SEG({key:'anFacet',name:'Ancient host: the Facet',cls:'seg',W:84,LAND:84,SEA:0,place:'land',decays:[0,1,3],norepair:true,stamps:hookHostStamps,build:buildAnFacet});
PORT_SEG({key:'anBastion',name:'Ancient host: the Bastion',cls:'seg',W:110,LAND:110,SEA:0,place:'land',decays:[0,1,3],norepair:true,stamps:hookHostStamps,build:buildAnBastion});
PORT_SEG({key:'anArcades',name:'Ancient host: the Arcades',cls:'seg',W:98,LAND:98,SEA:0,place:'land',decays:[0,1,3],norepair:true,stamps:hookHostStamps,build:buildAnArcades});
PORT_SEG({key:'anStalks',name:'Ancient host: the Capsule Stalks',cls:'seg',W:88,LAND:88,SEA:0,place:'land',decays:[0,1,3],norepair:true,stamps:hookHostStamps,build:buildAnStalks});
PORT_SEG({key:'anBell',name:'Ancient host: the Bell Hall',cls:'seg',W:96,LAND:96,SEA:0,place:'land',decays:[0,1,3],norepair:true,stamps:hookHostStamps,build:buildAnBell});
/* a host's cut height for a named range of the spec's cuts (tall, mid, low, land), drawn by hash; null = no cut */
function hookHostCut(key,cut,h){const S=HOOK_HOSTS[key].spec,r=cut&&S.cuts&&S.cuts[cut];if(!r)return null;return Math.round(r[0]+(r[1]-r[0])*h);}
