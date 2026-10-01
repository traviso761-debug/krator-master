// ---------------------------------------------------------------- SOCKETS: where a culture's marks go (shared: core/sockets/)
// A building declares sockets; the ACTIVE culture pack draws into them. The building never names a culture. See core/sockets/README.md.
// Needs from the host build: CM (running matrix) + TF(x,y,z,ry) + CMS (matrix stack), rng/pick/jc/P (colour), reportErr, and the primitives the packs draw with.
// ---- sockets: where a culture's marks go. type: 'awning' 'banner' 'flag' 'emblem' 'sign' 'paint'.
// Frame of a socket: origin at the anchor, +z OUT of the surface, +x along the surface, y up.
//   awning {w,d,drop}: a canopy over a door, stall or window; the anchor is the top edge against the wall, w wide, d deep, sloping down by `drop`
//   banner {w,h}: cloth hanging from the anchor (top edge), h long
//   flag   {w,h}: a pennant/flag on a pole top; the anchor is the pole top
//   emblem {w,h}: a flat plate or painted field on a wall, centred on the anchor
//   sign   {w,h,trade}: a shop board, centred on the anchor
//   paint  {w,h}: a large panel the culture may stripe or band
let SOCKS=[],SOCK_ALL=[];
function sock(type,x,y,z,ry,o){const s={type,m:CM.clone().multiply(TF(x,y,z,ry)),o:o||{},key:CURKEY};SOCKS.push(s);SOCK_ALL.push(s);return s;}
let CURKEY=null;
function fillSockets(){const C=CULT.cur;const list=SOCKS;SOCKS=[];const keep=CMS.slice();
 for(const s of list){const f=C.fill[s.type]||CULT.generic.fill[s.type];if(!f)continue;CMS.length=0;CMS.push(s.m.clone());CM=CMS[0];
  try{f(s.o,s);}catch(e){reportErr('socket '+s.type+' in '+s.key+': '+(e.stack||e));}}
 CMS.length=0;for(const m of keep)CMS.push(m);CM=CMS[CMS.length-1];}

// ---- cultures: a pack is {key,name,paint:[hex...],fill:{awning,banner,flag,emblem,sign,paint}}; 80-cultures.js registers them.
const CULT={packs:{},cur:null,generic:null};
function cultDef(p){CULT.packs[p.key]=p;if(p.key==='generic'){CULT.generic=p;if(!CULT.cur)CULT.cur=p;}return p;}
// livery colour from the active culture's paint list (a share of the time), else the neutral faded palette
function PAINT(){const c=CULT.cur;if(c&&c.paint&&rng()<(c.paintShare===undefined?.55:c.paintShare))return jc(pick(c.paint),.06);return P('paint');}
