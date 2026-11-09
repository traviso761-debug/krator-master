// ================================================================= 89y. THE INTERIORS: hollow walls, real doors, furnished rooms (2026-11-09)
// The Xanadu kit's interior set (kits/interiors/sets/xanadu.js: one item per def, the citadel's held) planned and furnished
// at every top-level placement whose def has an item, as Highlands does it (kits/highlands/src/89y-hl-furnish.js): the rooms
// from the master catalog (the generated 69d bundle: the xanadu culture through its chain, eastabyss and generic, with iziz and
// scrap), through core/furnish (KFURN: the records, core/tags) into one batch per bake; their floors, walls, stairs and entry
// flights in core/walk (KWALK). With the interiors on, the def is built with the Vernacular's hollow and auto bodies (69e,
// 69e6): a wall block or battered mass (xnWall) that matches a shell of the item is four walls, cut where the kit's doors and
// windows are, and its doors are UNLOCKED leaves into the planned rooms (core/door). ?interiors=1 turns it on (off by default:
// the roofs hide the rooms, and they cost triangles); ?furniture=0 places nothing.
//   XAF                 the placement pass (KFURN.create): XAF.buildings, XAF.placed, XAF.summary()
//   xaIxWalk()          once the world is built (the sheet: 90-xa-doors.js; Erewhon: 90b-er-build.js): every door's walk
//                       blocks into KWALK (shut = blocked) and any other block in an unlocked doorway switched off
//   window._interiors   {on, buildings, rooms, pieces, hollow, matched, planDoors}
KratorFurniture.setDetail(.5);
const XAF=KFURN.create(Object.assign(KFURN.flags(false),{
 catalog:KFURN.catalogOf(KratorFurniture),interiors:KratorInteriors,walk:KWALK,
 tags:(KTAGS.page=KTAGS.page||KTAGS.create({build:window.CITY?'erewhon':'xanadu'})),
 seed:(o,ctx,R)=>R.placed.length+1,
 draw:(rec,ctx)=>{KFURN.drawRec(XAF,rec,ctx.wealth,{detail:1,after:.5});}}));
KFURN.useBatch(XAF,KratorFurniture,KratorInteriors,{indexed:true});
VERN.interiors=XAF.interiors;
function xafWealth(D){const w=D.tags&&D.tags.wealth;return w==='poor'?.2:w==='rich'?.8:w==='civic'?.65:.5;}
// a top-level placement with an item in the set: its rooms planned and furnished where it stands (plain data on the group)
{const place0=VERN.place;
 VERN.place=function(sc,key,x,z,ry,o){const top=!VERN.cur;const G=place0.call(VERN,sc,key,x,z,ry,o);
  if(top&&G&&XAF.interiors&&(!o||(o.scale||1)===1)){const it=KratorInteriors.sets.find(key);
   if(it&&!it.skip){const pre='xa.'+XAF.buildings.length+'.';
    try{const r=XAF.interior(it,x,z,ry||0,XAF.adapter,{baseY:(o&&o.y)||0,prefix:pre}).summary;
     G.userData.interior={rooms:r.rooms,pieces:r.pieces,residence:r.residence};Object.assign(XAF.buildings[XAF.buildings.length-1],{key,interior:G.userData.interior});}
    catch(e){reportErr('interior '+key+': '+((e&&e.message)||e));}}}
  return G;};}
// the kit's own mass and flights with the interiors on: a battered block that matches a shell is drawn hollow (69e6
// vaBattered, its faces in the flat box item of its kind); a flight of steps (xnFlight) is a strip in core/walk, so a
// raised door's own stair is a way in for the reachability audit
if(XAF.interiors){
 {const w0=xnWall;xnWall=function(x,y,z,w,h,d,ry,c,kind){const k=xnBatterK(w,h,d),flat={wash:'xWashB',earth:'xEarthB',stone:'xRubB',dressed:'vStone'}[kind||'wash'];
   if(vaBattered(flat,x,y,z,w,h,d,ry,c,k))return k;return w0.apply(this,arguments);};}
 {const f0=xnFlight;xnFlight=function(x,y,z,ry,w,rise,item,c){const r=f0.apply(this,arguments);const n=Math.max(2,Math.round(rise/.17)),run=n*.34;
   const W2=(lz,ly)=>{const q=loc(x,z,0,lz,ry),v=IZDOOR._w(q[0],ly,q[1]);return[v[0],v[2],v[1]];};
   KWALK.strip({a:W2(.3,y),b:W2(-run+.05,y+rise),w:Math.max(.6,w-.1),name:'xa flight',tag:'interior:xa-flight'});return r;};}
 xnDoorway=vaWrapDoorway(xnDoorway);xnPane=vaWrapPane(xnPane,{stained:'xStainedB',frosted:'xFrostedB'});xnRoom=vaWrapRoom(xnRoom);}
// the batch becomes meshes with each bake (the sheet bakes once; Erewhon chunk by chunk, each chunk's pieces into its group)
{const bake0=kbake;kbake=function(sc){if(XAF.interiors&&XAF.batch){const g=XAF.batch.flush(sc);g.userData.probeSkip=false;g.children.forEach(m=>{m.material.onBeforeCompile=KFURN.srgbHook;});}return bake0.apply(this,arguments);};}
function xaIxWalk(){if(!XAF.interiors)return 0;KDOOR.walk(KWALK);window._doorwaysCleared=KDOOR.clearDoorways(KWALK);
 const S=XAF.summary();window._interiors={on:true,buildings:XAF.buildings.length,rooms:XAF.buildings.reduce((a,b)=>a+((b.interior&&b.interior.rooms)||0),0),
  pieces:S.interiorPieces,hollow:VHOLLOW.bodies,matched:VAUTO.matched,planDoors:VAUTO.planDoors||0};return KDOOR.list.length;}
// the cutaway's units (core/host 99-host-cutaway, X; 2026-11-09): every furnished top-level building, its storeys from its set
// item (the bodies' levels and the explicit rooms' floors, one storey per distinct floor more than a metre apart)
function xafUnits(F,defs){const U=[];for(const B of F.buildings){const it=KratorInteriors.sets.find(B.key);if(!it||it.skip||!B.interior)continue;
 const ys=[];for(const b of it.bodies||[]){let y=b.y||0;for(const l of(Array.isArray(b.levels)?b.levels:Array.from({length:b.levels||1},()=>({h:3})))){ys.push([y,l.h||3]);y+=l.h||3;}}
 for(const r of it.rooms||[])ys.push([r.y||0,Math.min(r.h||3,4.8)]);ys.sort((a,b)=>a[0]-b[0]);
 const lv=[];for(const [y,h] of ys)if(!lv.length||y-lv[lv.length-1].y0>1){lv.push({y:(B.baseY||0)+y,y0:y,h,name:lv.length?'storey '+(lv.length+1):'ground'});}
 const D=defs[B.key];U.push({id:'ix.'+U.length,name:(D&&D.name)||B.key,x:B.x,z:B.z,ry:B.ry,w:(D&&(D.fw||D.w))||20,d:(D&&(D.fd||D.d))||20,levels:lv.map(L=>({y:L.y,h:L.h,name:L.name}))});}
 return U;}
