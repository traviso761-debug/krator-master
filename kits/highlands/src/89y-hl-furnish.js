// ---------------------------------------------------------------- furniture: PLACED from the catalog, not drawn
// Everything a Highlands builder puts in or around a building that is not the building itself (its main
// structure and outbuildings) is FURNITURE: a master-catalog piece (kits/catalog), placed as data and built by
// the catalog's own code through KratorFurniture (69d, generated: kits/catalog/furniture_bundle.py), merged
// into one mesh per render family for the whole page. A builder calls, in its own local frame:
//   FURNISH(key, lx, ly, lz, lry, {v, seed, setting})   -> the placement record (core/furnish; also on G.userData.furniture)
// Indoors, the rooms of every top-level building are the interiors kit's: its set (kits/interiors/sets/
// highlands.js) is planned and furnished through the same catalog (?interiors=1; off by default, as the roofs
// hide it and it adds millions of triangles). ?furniture=0 places nothing (the records are still kept).
KratorFurniture.setDetail(.5);   // settlement-scale: half the segments on round furniture parts
// the placement pass is core/furnish (50-core-furnish.js: the record, the missing count, the id); this is the Highlands
// adapter onto it: its seed rule (the record's place in the list), the murals' keep-clear boxes, full detail outside
const HLF=KFURN.create(Object.assign(KFURN.flags(false),{
 catalog:KFURN.catalogOf(KratorFurniture),interiors:KratorInteriors,walk:KWALK,
 tags:(KTAGS.page=KTAGS.create({build:'highlands'})),   // every piece registered in core/tags (core/tags/README.md)
 seed:(o,ctx,R)=>R.placed.length+1,
 onRecord:(rec,ctx,o,A,dm)=>{const c=ctx.vern;   // murals fitted after the builder (hlFlush) keep clear of the piece
  if(c&&!c.noRec)(c.inst||(c.inst=[])).push(['vWood',[rec.lx,rec.ly+dm.h/2,rec.lz],qEuler(0,rec.lry,0),[dm.w,dm.h,dm.d]]);},
 // a builder's pieces stand outside, seen whole: full detail (at half, a disc drawn as a rod, a shield or a target face,
 // is a 4-sided diamond); the interiors' many pieces keep the half detail set above
 draw:(rec,ctx)=>{KFURN.drawRec(HLF,rec,ctx.wealth,{detail:1,after:.5});}}));
KFURN.useBatch(HLF,KratorFurniture,KratorInteriors,{indexed:true});   // indexed meshes (kits/catalog/README.md)
function FURNISH(key,lx,ly,lz,lry,o){const c=VERN.cur;o=o||{};if(!c&&!o.world){reportErr('FURNISH '+key+' outside a builder');return null;}
 if(!c)return hlfWorld(key,lx,ly,lz,lry||0,o);
 const s=c.o.scale||1,p=loc(c.x,c.z,lx*s,lz*s,c.ry);
 return HLF.place(key,p[0],(c.o.y||0)+ly*s,p[1],c.ry+(lry||0),o,[lx,ly,lz,lry||0],
  {building:c.D.key,wealth:hlfWealth(c.D),vern:c,listOf:()=>c.G.userData.furniture||(c.G.userData.furniture=[])});}
// outside any builder (a town's own furniture, placed by its layout: Roketstad's market stalls), with {world: a name for
// the record's `building`}: (x, y, z, ry) are world coordinates; the record goes on HLF.placed only
function hlfWorld(key,x,y,z,ry,o){return HLF.place(key,x,y,z,ry,o,[x,y,z,ry],{building:o.world,wealth:o.wealth!=null?o.wealth:.5});}
function hlfWealth(D){const w=D.tags&&D.tags.wealth;return w==='poor'?.2:w==='rich'?.8:w==='civic'?.65:.5;}
// the interiors hook: a TOP-LEVEL placement (not a sub-building a compound places) with an interior set item
// gets its rooms planned and furnished at its placement; the plan is data on the group (userData.interior)
const hlfPlace=VERN.place;
VERN.place=function(sc,key,x,z,ry,o){const top=!VERN.cur,nd=KDOOR.list.length;const G=hlfPlace.call(VERN,sc,key,x,z,ry,o);
 if(top&&G&&HLF.interiors){const it=KratorInteriors.sets.find(key);
  if(it&&!it.skip){const pre='hl.'+HLF.buildings.length+'.',r=HLF.interior(it,x,z,ry||0,HLF.adapter,{baseY:(o&&o.y)||0,prefix:pre}).summary;
   G.userData.interior={rooms:r.rooms,pieces:r.pieces,residence:r.residence};
   Object.assign(HLF.buildings[HLF.buildings.length-1],{key,interior:G.userData.interior});
   G.userData.interior.doors=hlfDoorsIn(nd,'built:'+pre);}}
 return G;};
// the doors that open onto the rooms just planned: a door of this placement (71c, 69e5: drawn locked, as the kit's bodies are
// solid) whose sill meets one of the interior's floors 0.6 m inside it is unlocked, so a walker, an NPC or the E key opens it
// into the rooms (core/door; the reachability audit, 2026-11-03: with them locked most of the furnished rooms were sealed). The
// leaf still opens on the solid body's face: the kit draws no hollow walls (KNOWN_ISSUES.md)
function hlfDoorsIn(nd,tag){let n=0;
 for(let i=nd;i<KDOOR.list.length;i++){const D=KDOOR.list[i];if(!D.locked)continue;const ix=D.at[0]-Math.sin(D.yaw)*.6,iz=D.at[2]-Math.cos(D.yaw)*.6;
  if(KWALK.floorsAt(ix,iz).some(f=>String(f[1].tag).indexOf(tag)===0&&Math.abs(f[0]-D.at[1])<.6)){KDOOR.lock(D,false,{asBuilt:true});n++;}}
 return n;}
// the batch becomes meshes once, when the kit bakes its instances
const hlfBake=kbake;
// the catalog's colours are sRGB values taken as they are; this kit's materials are linear (hC converts every colour), so
// the furniture keeps its 8-bit vertex colours and linearises them in the vertex shader (as Girder and Locus do)
const hlfSRGB=KFURN.srgbHook;
kbake=function(sc){const g=HLF.batch.flush(sc);g.userData.probeSkip=false;HLF.group=g;g.children.forEach(m=>{m.material.onBeforeCompile=hlfSRGB;});return hlfBake(sc);};
