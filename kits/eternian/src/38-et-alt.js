// ================================================================= ALTERNATES: one key, several takes, a take per placed instance
// The owner (2026-10-20): the extra takes of a sheet are alternates that can appear on different instances of the same
// building type, for variety. A builder draws with the base key ('screen', 'maze'); this fragment swaps in the take for
// the instance being placed. The take is a hash of the def's seed, the variant and the place (core/rand: KRAND.hash),
// never a draw from the stream, so it is the same on every machine and in Godot, and placing another building moves no
// other building's take. Two wraps, as 37-wk-rec.js wraps emit, so 30-geo.js and 36-def.js stay the vendored engine.
const ET_ALTS={screen:['screen','screenB'],maze:['maze','mazeB','mazeC']};
let ET_ALT=0;   /* the placed instance's hash; 0 outside a place() (no swap) */
const _etEmit0=emit;
emit=function(mk,geo,lm,col,uvm){const v=ET_ALT&&ET_ALTS[mk];if(v){const k=v[ET_ALT%v.length];if(MAT[k])mk=k;}return _etEmit0(mk,geo,lm,col,uvm);};
const _etPlace0=place;
place=function(key,x,z,ry,o){const keep=ET_ALT,d=DEFS[key];
 ET_ALT=d?(KRAND.hash(0xe7a1,d.seed|0,(o&&o.v)|0,Math.round(x*4),Math.round(z*4))>>>1)|1:0;
 try{return _etPlace0(key,x,z,ry,o);}finally{ET_ALT=keep;}};
/* the take an instance would draw for a key, for the probe and the tests */
function etAltOf(key,mk,x,z,v){const d=DEFS[key],L=ET_ALTS[mk];if(!d||!L)return mk;
 return L[((KRAND.hash(0xe7a1,d.seed|0,v|0,Math.round(x*4),Math.round(z*4))>>>1)|1)%L.length];}
