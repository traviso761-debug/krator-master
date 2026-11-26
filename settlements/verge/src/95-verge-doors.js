// ================================================================= VERGE — the doors ([web]; core/door, TODO.md "Doors and glass")
// The Iziz Vernacular's openings (69e5, in IZV) draw every door leaf as an instance of its own kit item (vDoorLeaf, a styled
// leaf's vDoorLeaf.<style> and vDoorGlass.<style>) and register it in core/door's KDOOR (a stable id: the def's key, where
// it stands, the door's number). Here, once the world is built and baked (88), Verge hosts them as Highlands'
// 95-hl-doors.js does: IZV.IZDOOR.finish drops the doors of a placement that was unwound (KDOOR.prune) and puts each door's
// walk blocks in core/walk (KDOOR.walk: shut = blocked); each door is handed to KDOORHOST (posed: IZDOOR poses its leaves
// in the kit's meshes), which eases the moving ones on the frame; E opens the one within reach (99-start.js).
// With the interiors on (the default; ?interiors=0 off), a Vernacular building that has an interior item is built hollow
// (72: IZV.VERN.interiors), so its doors are cut and unlocked; one with none keeps its solid body and its doors locked. Every
// Verge building is one walk block over its footprint (72) until its rooms are furnished (71, streamed nearest the camera
// first, which registers its floors and walls in core/walk): then vergeDoorsIn switches that block off and clears the
// building's own doorways of any other block (KDOOR.clearDoorways on a registry of its doors alone, so a far building's
// footprint is never touched). The Yuni / Locus / Abyss buildings (YKIT) keep their leaves drawn shut.
const VERGE_DOORS=(function(){
 const Z=typeof IZV!=='undefined'?IZV.IZDOOR:null;
 if(!Z||typeof KDOOR==='undefined'||typeof KDOORHOST==='undefined'){window._doors={doors:0,host:false};return null;}
 Z.finish(KWALK);
 for(const D of KDOOR.list)KDOORHOST.posed(D,D=>{Z._pose(D);Z._flush();});
 tick(dt=>KDOORHOST.tick(dt));
 for(const im of Z.meshes())im.userData.lodSkip=true;   // core/lod keeps its hands off the leaves: they move
 const L=KDOOR.list;
 window._doors={doors:L.length,locked:L.filter(D=>D.locked).length,blocks:L.reduce((a,D)=>a+D.blocks.length,0),
  posed:L.filter(D=>D.draw).length,styles:L.reduce((o,D)=>{const k=D.style||'flat';o[k]=(o[k]||0)+1;return o;},{}),host:true};
 return Z;})();
// the doors of each Vernacular building (its unlocked doors whose sill stands within its footprint, grown 1 m), for 71's tick
if(VERGE_DOORS){const open=KDOOR.list.filter(D=>!D.locked),grid=new Map(),cell=24,key=(x,z)=>Math.floor(x/cell)+','+Math.floor(z/cell);
 for(const D of open){const k=key(D.at[0],D.at[2]);(grid.get(k)||grid.set(k,[]).get(k)).push(D);}
 for(const R of PLACE.buildings){if(R.kit!=='izv')continue;const c=Math.cos(R.ry),s=Math.sin(R.ry),near=[];
  for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++)for(const D of grid.get((Math.floor(R.x/cell)+i)+','+(Math.floor(R.z/cell)+j))||[]){
   const dx=D.at[0]-R.x,dz=D.at[2]-R.z,lx=dx*c-dz*s,lz=dx*s+dz*c;if(Math.abs(lx)<=R.w/2+1&&Math.abs(lz)<=R.d/2+1&&Math.abs(D.at[1]-R.y)<R.h+1)near.push(D);}
  if(near.length)R.kdoors=near;}
 window._doors.hollow=PLACE.buildings.filter(R=>R.kdoors).length;window._doors.opened=0;}
function vergeDoorsIn(R){if(!VERGE_DOORS||!R||!R.kdoors||R.doorsIn)return 0;R.doorsIn=true;
 if(R.walkBlock)KWALK.setBlock(R.walkBlock,false);
 const K=KDOOR.create();for(const D of R.kdoors)K.add({id:D.id,at:D.at,yaw:D.yaw,w:D.w,h:D.h,t:D.t,kind:D.kind,walk:false});
 const n=K.clearDoorways(KWALK);
 for(const D of KDOOR.list)if(D.blocks.length)KWALK.setBlock(D.blocks,D.open<.5);   // the leaves' own blocks as their doors stand
 window._doors.opened++;return n;}
// walking (the host's F) or flying: the reach of the E key and its tip
function vergeWalking(){return !!(KHOST.cam&&KHOST.cam.ctl&&KHOST.cam.ctl.walk);}
