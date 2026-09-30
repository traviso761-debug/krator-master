// ---------------------------------------------------------------- registry, placement, cultural sockets
// A building def: {key, name, seed, tags:{type:[...],...}, w, d, h, build(o)}. The builder draws in its local frame (origin = plot centre on the
// ground, +z the front, x right, y up) and stays inside w x d (overhangs of ~1 m allowed). It never mentions a culture: it declares SOCKETS,
// and the active culture pack (core/sockets/80-cultures.js) fills them. o = {v: variant, culture-neutral options}.
const DEFS={};
function defBuilding(d){if(DEFS[d.key])reportErr('duplicate def '+d.key);d.cls=d.cls||'building';d.tags=Object.assign({culture:'post-apoc (generic)',sockets:true},d.tags||{});DEFS[d.key]=d;return d;}
const REG=[];function regClear(){REG.length=0;}
// ---- placement: place(key,x,z,ry,o) builds a def into the current frame (nested calls make compounds)
function place(key,x,z,ry,o){const d=DEFS[key];if(!d){reportErr('no def '+key);return null;}o=o||{};
 const y=o.y!==undefined?o.y:terrainH(x,z);const keepKey=CURKEY,keepSocks=SOCKS,keepCult=CULT.cur;CURKEY=key;SOCKS=[];
 if(o.culture&&CULT.packs[o.culture])CULT.cur=CULT.packs[o.culture];   // o.culture dresses THIS building (and any it places) in another culture's marks
 pushM(TF(x,y,z,ry||0));const org=new THREE.Vector3().applyMatrix4(CM);const bb=sbBegin();const t0=GSTAT.tris;
 reseed(d.seed+(o.v|0)*7);
 try{d.build(o);fillSockets();}catch(e){reportErr('build '+key+': '+(e.stack||e));}
 sbEnd();popM();CURKEY=keepKey;SOCKS=keepSocks;CULT.cur=keepCult;
 const rec={key,name:d.name,cls:d.cls,tags:d.tags,x:org.x,y:org.y,z:org.z,ry:ry||0,r:Math.hypot(d.w,d.d)/2,h:d.h,tris:GSTAT.tris-t0,bbox:bb,v:o.v|0};REG.push(rec);return rec;}
