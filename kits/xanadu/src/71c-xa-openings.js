// ================================================================= XANADU — openings: real doors and real glass (the owner, 2026-11-03)
// "Remove all dark voids and make all windows, doors and portals actual doors or windows that have transparency". The kit
// takes the Vernacular's openings (kits/iziz-vernacular 69e5, read in place: vnDoor a shut leaf registered in core/door's
// KDOOR, vnWin glass from core/door's KGLASS over the room card) and draws its own the same way. Every Xanadu body is SOLID
// (the kit takes no 69e hollow walls and has no interiors), so every door is a LOCKED leaf in KDOOR and every window glass
// in front of the room's dim back.
//   xnDoorway(x,y,z,ry,w,h,o)   a doorway or gate a builder drew as a dark plate: a shut leaf in it (two, mirrored, when
//                               w >= 1.8 or o.double), registered in KDOOR through IZDOOR.leaf. (x,z) on the face, ry
//                               outward, y the sill; o {c leaf colour, t thickness (.08), out: the leaf's back that far out (.01)}
//   xnPane(x,y,z,w,h,d,ry,kind) a window drawn as a plate (vB's arguments, ry outward): the room card in its back half, the
//                               pane ('glass' clear, 'lit' the warm pane, 'stained', 'frosted') in its front half; 'open' the card alone
//   xnRoom(x,y,z,w,h,d,ry)      an unglazed opening drawn as a box (a slit, a vent, an oriel's inside): the room's dim back
//   xnRoomQ(p,q,s)              the same for a rotated plate (kput's arguments)
// The Vernacular's room card is the room's dim colour (69e5's IZ_ROOMC, KGLASS.SPEC.room's 0x6e5a46): a window reads as a room.
// Not openings, and kept dark on purpose: wells and shafts, ovens and kilns behind their embers (vDarkB, the Vernacular's void).
kdef('xStainedB',VBOX,KGLASS.material(THREE,'stained',{color:0x2a5a8a}));kdef('xFrostedB',VBOX,KGLASS.material(THREE,'frosted'));
// a door's id is IZDOOR.leaf's: the def's key, where the placement stands and the door's number in it (69e5)
// a door's step: the kit's builders draw their own flights and plinths, so a door keeps the old threshold step (69c: one
// step under the sill, unless the builder passed step false), not 69e5's landing and flight from the ground
let XA_DOORSTEP=true;
{const d0=vnDoor;vnDoor=function(x,y,z,ry,w,h,frameItem,c,leafC,step){const s0=XA_DOORSTEP;XA_DOORSTEP=step!==false;
  try{return d0.apply(this,arguments);}finally{XA_DOORSTEP=s0;}};}
vnStoop=function(x,y,z,ry,w,item,c){if(!XA_DOORSTEP)return;const s=loc(x,z,0,.5,ry);vB(item,s[0],y-.18,s[1],w+.6,.18,.8,ry,c);};
function xnDoorway(x,y,z,ry,w,h,o){o=o||{};const t=o.t==null?.08:o.t,out=o.out==null?.01:o.out,c=o.c||null;
 const two=o.double==null?w>=1.8:!!o.double;
 if(!two){const m=loc(x,z,0,out+t/2,ry);return[IZDOOR.leaf(m[0],y,m[1],ry,w,h,t,c,{locked:true})];}
 return[-1,1].map(s=>{const m=loc(x,z,s*w/4,out+t/2,ry);return IZDOOR.leaf(m[0],y,m[1],ry,w/2-.01,h,t,c,{locked:true,mirror:s>0});});}
function xnPane(x,y,z,w,h,d,ry,kind){kind=kind||'glass';const b=loc(x,z,0,kind==='open'?0:-d/4,ry);
 vB('vPlaster',b[0],y,b[1],w,h,kind==='open'?d:d/2,ry,IZ_ROOMC);if(kind==='open')return;
 const g=loc(x,z,0,d/4,ry),it=kind==='lit'?'vWinLit':kind==='stained'?'xStainedB':kind==='frosted'?'xFrostedB':'vWinClear';
 vB(it,g[0],y,g[1],w,h,d/2,ry);}
function xnRoom(x,y,z,w,h,d,ry){vB('vPlaster',x,y,z,w,h,d,ry,IZ_ROOMC);}
function xnRoomQ(p,q,s){kput('vPlaster',p,q,s,IZ_ROOMC);}
