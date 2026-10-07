// ================================================================= REGISTRY and PLACEMENT
// A def: {key, name, seed, cls, kind?, tags, w, d, h, budget?, cut?, front?, build(o)}.
//   cls   the core/tags class: 'building' (every dwelling, shop, civic and sacred def), 'landmark' (the temple, the portal),
//         'infrastructure' (a vent head, a stone door, the palisade), 'life' (a beetle, the cattle), 'feature' (the test block)
//   tags  core/tags vocabulary: culture 'zeijani' (filled in), types (BUILDING_TYPES), wealth, style ('carved' 'constructed'
//         'wooden'), rock ('tuff' 'basalt'), finish ('hewn' 'plaster' 'polished'), role, job
//   w,d,h the declared box in the local frame (overhangs of ~1 m allowed: guy ropes reach further and are counted in w,d)
//   cut   the def opens on the camera's side in the cut-away (27-mat.js): constructed and wooden defs; a carved def's
//         rock block opens instead (40-zj-cave.js)
//   carve a CARVED def's void plan: carve(C, x, z, ry) adds its rooms, passages and fixtures to a KCAVERN (40-zj-cave.js)
//   front {x,z,yaw}: the main door in the local frame; else the widest door() the builder declared facing +z
// The builder draws in its local frame (origin = plot centre on the ground, +z the front) and never reads the culture:
// the whole kit is one culture. place(key,x,z,ry,o) builds a def into the current frame; nested calls make compounds
// (a satellite's terraces, the outpost's palisade round its huts).
// Every top-level and nested placement is a record in REG and in core/tags (KTAGS.page): its class, kind, culture and
// types, its world position and size, its parent (a room names its building), before it is drawn.
const DEFS={};
function defBuilding(d){if(DEFS[d.key])reportErr('duplicate def '+d.key);d.cls=d.cls||'building';d.tags=Object.assign({culture:'zeijani'},d.tags||{});DEFS[d.key]=d;return d;}
const REG=[];let CURKEY=null,CURREC=null,DOORS_CUR=null;
/* door(x,y,z,yaw,w): the builder declares a doorway (local frame; yaw: the way out, 0 = +z). It draws nothing. */
function door(x,y,z,yaw,w){if(!DOORS_CUR)return;const p=new THREE.Vector3(x,y,z).applyMatrix4(CM);const e=CM.elements;DOORS_CUR.push({wx:p.x,wy:p.y,wz:p.z,yaw:Math.atan2(e[8],e[10])+(yaw||0),w:w||1});}
function zjFront(d,doors,org,wry){
 if(d.front){const c=Math.cos(wry),s=Math.sin(wry),f=d.front;return {source:'declared',local:{x:f.x||0,z:f.z===undefined?d.d/2:f.z,yaw:f.yaw||0},world:{x:org.x+(f.x||0)*c+(f.z===undefined?d.d/2:f.z)*s,y:org.y,z:org.z-(f.x||0)*s+(f.z===undefined?d.d/2:f.z)*c,yaw:wry+(f.yaw||0)}};}
 const L=doors.map(q=>({q,rel:Math.cos(q.yaw-wry)})).filter(o=>o.q.w>=.6).sort((a,b)=>(b.rel>.6)-(a.rel>.6)||b.q.w-a.q.w);
 if(L.length){const q=L[0].q,dx=q.wx-org.x,dz=q.wz-org.z,c=Math.cos(wry),s=Math.sin(wry);
  return {source:L[0].rel>.6?'door() facing +z':'door() on another face',local:{x:+(dx*c-dz*s).toFixed(3),z:+(dx*s+dz*c).toFixed(3),yaw:+(q.yaw-wry).toFixed(4)},world:{x:q.wx,y:q.wy,z:q.wz,yaw:q.yaw}};}
 return {source:'default',local:{x:0,z:d.d/2,yaw:0},world:{x:org.x+d.d/2*Math.sin(wry),y:org.y,z:org.z+d.d/2*Math.cos(wry),yaw:wry}};}
/* the core/tags registry for this page (a fresh one per world build: ids restart). 91f-furnish.js registers the furniture in it. */
let ZJTAGS=null;
function zjTagsReset(){ZJTAGS=KTAGS.page=KTAGS.create({build:'zeijani'});}
function place(key,x,z,ry,o){const d=DEFS[key];if(!d){reportErr('no def '+key);return null;}o=o||{};
 const y=o.y!==undefined?o.y:terrainH(x,z);
 const keep={key:CURKEY,rec:CURREC,doors:DOORS_CUR,cut:CUTC};
 pushM(TF(x,y,z,ry||0));const org=new THREE.Vector3().applyMatrix4(CM);const e=CM.elements,wry=Math.atan2(e[8],e[10]);
 const rec={key,name:o.name||d.name,cls:d.cls,kind:d.kind||null,tags:Object.assign({},d.tags,o.tags||{}),x:org.x,y:org.y,z:org.z,ry:wry,
  decl:{w:d.w,d:d.d,h:d.h,budget:d.budget},v:o.v|0,parent:CURREC,children:[],furniture:[],tid:null};
 /* register before drawing (GODOT-PLAN.md rule 4): the record names its parent when it is placed inside another */
 /* a 'furniture' def is a frame round one catalog piece: FURNISH registers the piece itself (core/furnish), so the def adds no record */
 if(ZJTAGS&&!PLACE_DRY&&d.cls!=='furniture'){const tr={'class':d.cls,kind:d.kind||d.key,key:d.key,name:rec.name,at:[org.x,org.y,org.z],ry:wry,size:[d.w,d.d,d.h],
   tags:rec.tags,note:d.note||'',frag:d.frag||'kits/zeijani'};
  const t=CURREC&&CURREC.tid?ZJTAGS.child(CURREC.tid,tr):ZJTAGS.add(tr);rec.tid=t.id;}
 CURKEY=key;CURREC=rec;DOORS_CUR=[];if(keep.rec)keep.rec.children.push(rec);
 if(d.cut)CUTC=[org.x,org.z,org.y,1];
 const bb=sbBegin();const t0=GSTAT.tris;
 reseed(d.seed+(o.v|0)*7);
 try{d.build(o);}catch(err){reportErr('build '+key+': '+(err.stack||err));}
 sbEnd();popM();const doors=DOORS_CUR;
 CURKEY=keep.key;CURREC=keep.rec;DOORS_CUR=keep.doors;CUTC=keep.cut;
 rec.bbox=bb;rec.tris=GSTAT.tris-t0;rec.front=zjFront(d,doors,org,wry);rec.doorCount=doors.length;rec.r=Math.hypot(d.w,d.d)/2;rec.h=d.h;
 /* a built def's floors and walls into core/walk, from its interiors item (37-zj-walk.js; a carved def's come from the cavern) */
 if(!PLACE_DRY&&!rec.parent){const it=zjItem(key);if(it)rec.walk=zwItem(it,rec);}
 if(!PLACE_DRY)REG.push(rec);return rec;}
let PLACE_DRY=0;
/* the life layer's data for what the kit places alive (README.md, "Life/simulation layer"): a beetle or a cow is a creature
   with a faction, a sub-faction, a job and a schedule (a dummy one: the same activity every hour until a world gives
   the kit a clock). A world reads ZJ_LIFE; nothing here moves. Activities are data a world's simulation resolves. */
const ZJ_LIFE=[];
function zjLife(rec,o){const s=Object.assign({id:rec.tid,kind:rec.kind,key:rec.key,faction:'Zeijani',subFaction:o.band||'Herders of the outpost',
 job:o.job||'mount',activity:o.activity||'REST',schedule:new Array(24).fill(o.activity||'REST'),at:[rec.x,rec.y,rec.z]},o.extra||{});ZJ_LIFE.push(s);return s;}
