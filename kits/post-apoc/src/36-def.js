// ---------------------------------------------------------------- registry, placement, cultural sockets
// A building def: {key, name, seed, tags:{type:[...],...}, w, d, h, build(o)}. The builder draws in its local frame (origin = plot centre on the
// ground, +z the front, x right, y up) and stays inside w x d (overhangs of ~1 m allowed). It never mentions a culture: it declares SOCKETS,
// and the active culture pack (80-cultures.js) fills them. o = {v: variant, culture-neutral options}.
const DEFS={};
function defBuilding(d){if(DEFS[d.key])reportErr('duplicate def '+d.key);d.cls=d.cls||'building';d.tags=Object.assign({culture:'post-apoc (generic)',sockets:true},d.tags||{});DEFS[d.key]=d;return d;}
const REG=[];function regClear(){REG.length=0;}
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
// ---- placement: place(key,x,z,ry,o) builds a def into the current frame (nested calls make compounds)
function place(key,x,z,ry,o){const d=DEFS[key];if(!d){reportErr('no def '+key);return null;}o=o||{};
 const y=o.y!==undefined?o.y:terrainH(x,z);const keepKey=CURKEY,keepSocks=SOCKS;CURKEY=key;SOCKS=[];
 pushM(TF(x,y,z,ry||0));const org=new THREE.Vector3().applyMatrix4(CM);const bb=sbBegin();const t0=GSTAT.tris;
 reseed(d.seed+(o.v|0)*7);
 try{d.build(o);fillSockets();}catch(e){reportErr('build '+key+': '+(e.stack||e));}
 sbEnd();popM();CURKEY=keepKey;SOCKS=keepSocks;
 const rec={key,name:d.name,cls:d.cls,tags:d.tags,x:org.x,y:org.y,z:org.z,ry:ry||0,r:Math.hypot(d.w,d.d)/2,h:d.h,tris:GSTAT.tris-t0,bbox:bb,v:o.v|0};REG.push(rec);return rec;}
// ---- cultures: a pack is {key,name,paint:[hex...],fill:{awning,banner,flag,emblem,sign,paint}}; 80-cultures.js registers them.
const CULT={packs:{},cur:null,generic:null};
function cultDef(p){CULT.packs[p.key]=p;if(p.key==='generic'){CULT.generic=p;if(!CULT.cur)CULT.cur=p;}return p;}
// livery colour from the active culture's paint list (a share of the time), else the neutral faded palette
function PAINT(){const c=CULT.cur;if(c&&c.paint&&rng()<(c.paintShare===undefined?.55:c.paintShare))return jc(pick(c.paint),.06);return P('paint');}
