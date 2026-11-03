// ================================================================= HIGHLANDS — openings: real doors and real glass (the owner, 2026-11-03)
// "Remove all dark voids and make all windows, doors and portals actual doors or windows that have transparency". The kit
// takes the Vernacular's openings (kits/iziz-vernacular 69e5, read in place: vnDoor a shut leaf registered in core/door's
// KDOOR, vnWin glass from core/door's KGLASS over the room card) and draws its own the same way. Every Highlands body is
// SOLID (the kit takes no 69e hollow walls: in Roketstad's ?interiors=1 the interiors kit's rooms stand inside the solid
// boxes), so every door is a LOCKED leaf in KDOOR and every window glass in front of the room's dim back.
//   hnDoorway(x,y,z,ry,w,h,o)   a doorway a builder drew as a dark plate: a shut leaf in it (two, mirrored, when w >= 1.8 or
//                               o.double), registered in KDOOR through IZDOOR.leaf. (x,z) on the face, ry outward, y the sill;
//                               o {c leaf colour, t thickness (.08), out: the leaf's back stands that far out of the face (.01)}
//   hnPane(x,y,z,w,h,d,ry,kind) a window a builder drew as a plate (vB's arguments, ry outward): the room card in the plate's
//                               back half, the pane ('glass' clear, 'lit' the warm pane, 'stained', 'frosted') in its front
//                               half; 'open' (an unglazed hole) the card alone
//   hnRoom(x,y,z,w,h,d,ry)      an unglazed opening drawn as a box (a louvre, a loggia's core, a slit): the room's dim back
//   hnRoomQ(p,q,s)              the same for a rotated plate (kput's arguments)
//   hnPlate(x,y,z,w,h,d,ry)     a glazed band drawn as a box (north lights, a ship's ports): the card inside a glass box a
//   hnPlateQ(p,q,s)             little larger (69e5's vnPlate with the room's colour); hnPlateQ for a rotated plate
// The Vernacular's room card is the room's dim colour (69e5's IZ_ROOMC, KGLASS.SPEC.room's 0x6e5a46): a window reads as a room.
// Not openings, and kept dark on purpose: flues, fireboxes and furnace mouths behind their embers, wells and shafts, trenches
// and scorch marks (vDarkB, which stays the Vernacular's unlit void).
const HL_STAINED=KGLASS.material(THREE,'stained',{color:0x7a2e3e});   // the grand halls' fanlights (core/door: stained)
kdef('hKeelGlass',HKEEL,HL_STAINED);                                  // a keel fanlight's glass, in front of its room card
kdef('hArchRoom',arcWindowGeo(1.1,2,.4),MAT.izRoom);kdef('hArchGlass',arcWindowGeo(1.1,2,.4),MAT.izGlass);   // an arched opening's back, its glass
// the keel recess (71's hKeelDark: kokoshniks, porch gables, the portals' keel heads) is the room's dim back, not a void.
// 71 is vendored by Reed Lake, Dalab and Ys, so the item is re-pointed here and 71 stays as they have it
KIT.defs.hKeelDark.mat=MAT.izRoom;
// a door's id is IZDOOR.leaf's: the def's key, where the placement stands and the door's number in it (69e5)
// a door's step: the kit's builders draw their own flights and stoops, so a door keeps the old threshold step (69c: one
// step under the sill, unless the builder passed step false), not 69e5's landing and flight from the ground
let HL_DOORSTEP=true;
{const d0=vnDoor;vnDoor=function(x,y,z,ry,w,h,frameItem,c,leafC,step){const s0=HL_DOORSTEP;HL_DOORSTEP=step!==false;
  try{return d0.apply(this,arguments);}finally{HL_DOORSTEP=s0;}};}
vnStoop=function(x,y,z,ry,w,item,c){if(!HL_DOORSTEP)return;const s=loc(x,z,0,.5,ry);vB(item,s[0],y-.18,s[1],w+.6,.18,.8,ry,c);};
function hnDoorway(x,y,z,ry,w,h,o){o=o||{};const t=o.t==null?.08:o.t,out=o.out==null?.01:o.out,c=o.c||null;
 const two=o.double==null?w>=1.8:!!o.double;
 if(!two){const m=loc(x,z,0,out+t/2,ry);return[IZDOOR.leaf(m[0],y,m[1],ry,w,h,t,c,{locked:true})];}
 return[-1,1].map(s=>{const m=loc(x,z,s*w/4,out+t/2,ry);return IZDOOR.leaf(m[0],y,m[1],ry,w/2-.01,h,t,c,{locked:true,mirror:s>0});});}
function hnPane(x,y,z,w,h,d,ry,kind){kind=kind||'glass';const b=loc(x,z,0,kind==='open'?0:-d/4,ry);
 vB('vPlaster',b[0],y,b[1],w,h,kind==='open'?d:d/2,ry,IZ_ROOMC);if(kind==='open')return;
 const g=loc(x,z,0,d/4,ry),it=kind==='lit'?'vWinLit':kind==='stained'?'hStainedB':kind==='frosted'?'hFrostedB':'vWinClear';
 vB(it,g[0],y,g[1],w,h,d/2,ry);}
kdef('hStainedB',VBOX,HL_STAINED);kdef('hFrostedB',VBOX,KGLASS.material(THREE,'frosted'));
function hnRoom(x,y,z,w,h,d,ry){vB('vPlaster',x,y,z,w,h,d,ry,IZ_ROOMC);}
function hnRoomQ(p,q,s){kput('vPlaster',p,q,s,IZ_ROOMC);}
function hnPlate(x,y,z,w,h,d,ry){vB('vPlaster',x,y,z,w,h,d,ry,IZ_ROOMC);vB('vWinClear',x,y-.01,z,w+.02,h+.02,d+.04,ry);}
function hnPlateQ(p,q,s){kput('vPlaster',p,q,s,IZ_ROOMC);kput('vWinClear',p,q,[s[0]+.02,s[1]+.02,s[2]+.04]);}
