// ================================================================= REGISTRY and PLACEMENT (forked from kits/scyvoi/src/36-def.js)
// A def: {key, name, seed, cls, kind?, tags, w, d, h, budget?, front?, build(o)}.
//   cls   the core/tags class: 'building' (the arcology, the deck buildings), 'part' (the arcology's zones), 'feature'
//         (the pirates' timber stairs and floats), 'flora' (placeholder park trees)
//   tags  core/tags vocabulary: culture 'ancient' (filled in), state 'reclaimed', types (BUILDING_TYPES), wealth, style, role
//   w,d,h the declared box in the local frame (overhangs of ~1 m allowed: guy ropes reach further and are counted in w,d)
//   front {x,z,yaw}: the main door in the local frame; else the widest door() the builder declared facing +z
// The builder draws in its local frame (origin = plot centre on the ground, +z the front). place(key,x,z,ry,o) builds a def
// into the current frame: the arcology is placed in the world and pushes the HULL frame (NR_HULL) for everything it
// holds, so a deck building is placed at hull coordinates and comes out listing and trimmed with the hull.
// Every top-level and nested placement is a record in REG and in core/tags (KTAGS.page): its class, kind, culture and
// types, its world position and size, its parent (a tent inside the Baelu names the Baelu), before it is drawn.
const DEFS={};
function defBuilding(d){if(DEFS[d.key])reportErr('duplicate def '+d.key);d.cls=d.cls||'building';d.tags=Object.assign(d.cls==='building'?{culture:'ancient',state:'reclaimed'}:{},d.tags||{});DEFS[d.key]=d;return d;}
const REG=[];let CURKEY=null,CURREC=null,DOORS_CUR=null;
/* door(x,y,z,yaw,w): the builder declares a doorway (local frame; yaw: the way out, 0 = +z). It draws nothing. */
function door(x,y,z,yaw,w){if(!DOORS_CUR)return;const p=new THREE.Vector3(x,y,z).applyMatrix4(CM);const e=CM.elements;DOORS_CUR.push({wx:p.x,wy:p.y,wz:p.z,yaw:Math.atan2(e[8],e[10])+(yaw||0),w:w||1});}
function svFront(d,doors,org,wry){
 if(d.front){const c=Math.cos(wry),s=Math.sin(wry),f=d.front;return {source:'declared',local:{x:f.x||0,z:f.z===undefined?d.d/2:f.z,yaw:f.yaw||0},world:{x:org.x+(f.x||0)*c+(f.z===undefined?d.d/2:f.z)*s,y:org.y,z:org.z-(f.x||0)*s+(f.z===undefined?d.d/2:f.z)*c,yaw:wry+(f.yaw||0)}};}
 const L=doors.map(q=>({q,rel:Math.cos(q.yaw-wry)})).filter(o=>o.q.w>=.6).sort((a,b)=>(b.rel>.6)-(a.rel>.6)||b.q.w-a.q.w);
 if(L.length){const q=L[0].q,dx=q.wx-org.x,dz=q.wz-org.z,c=Math.cos(wry),s=Math.sin(wry);
  return {source:L[0].rel>.6?'door() facing +z':'door() on another face',local:{x:+(dx*c-dz*s).toFixed(3),z:+(dx*s+dz*c).toFixed(3),yaw:+(q.yaw-wry).toFixed(4)},world:{x:q.wx,y:q.wy,z:q.wz,yaw:q.yaw}};}
 return {source:'default',local:{x:0,z:d.d/2,yaw:0},world:{x:org.x+d.d/2*Math.sin(wry),y:org.y,z:org.z+d.d/2*Math.cos(wry),yaw:wry}};}
/* the core/tags registry for this page (a fresh one per world build: ids restart). 91f-furnish.js registers the furniture in it. */
let SVTAGS=null;
function svTagsReset(){SVTAGS=KTAGS.page=KTAGS.create({build:'noahs-regret'});}
function place(key,x,z,ry,o){const d=DEFS[key];if(!d){reportErr('no def '+key);return null;}o=o||{};
 const y=o.y!==undefined?o.y:terrainH(x,z);
 const keep={key:CURKEY,rec:CURREC,doors:DOORS_CUR,cut:CUTC};
 pushM(TF(x,y,z,ry||0));const org=new THREE.Vector3().applyMatrix4(CM);const e=CM.elements,wry=Math.atan2(e[8],e[10]);
 const rec={key,name:o.name||d.name,cls:d.cls,kind:d.kind||null,tags:Object.assign({},d.tags,o.tags||{}),x:org.x,y:org.y,z:org.z,ry:wry,
  decl:{w:d.w,d:d.d,h:d.h,budget:d.budget},hull:(()=>{const q=nrW2H(org.x,org.y,org.z);return [+q[0].toFixed(3),+q[1].toFixed(3),+q[2].toFixed(3)];})(),v:o.v|0,parent:CURREC,children:[],furniture:[],tid:null};
 /* register before drawing (GODOT-PLAN.md rule 4): the record names its parent when it is placed inside another */
 /* a 'furniture' def is a frame round one catalog piece: FURNISH registers the piece itself (core/furnish), so the def adds no record */
 if(SVTAGS&&!PLACE_DRY&&d.cls!=='furniture'){const tr={'class':d.cls,kind:d.kind||d.key,key:d.key,name:rec.name,at:[org.x,org.y,org.z],ry:wry,size:[d.w,d.d,d.h],
   tags:rec.tags,note:d.note||'',frag:d.frag||'settlements/noahs-regret'};
  const t=CURREC&&CURREC.tid?SVTAGS.child(CURREC.tid,tr):SVTAGS.add(tr);rec.tid=t.id;}
 CURKEY=key;CURREC=rec;DOORS_CUR=[];if(keep.rec)keep.rec.children.push(rec);
 const bb=sbBegin();const t0=GSTAT.tris;
 reseed(d.seed+(o.v|0)*7);
 try{d.build(o);}catch(err){reportErr('build '+key+': '+(err.stack||err));}
 sbEnd();popM();const doors=DOORS_CUR;
 CURKEY=keep.key;CURREC=keep.rec;DOORS_CUR=keep.doors;CUTC=keep.cut;
 rec.bbox=bb;rec.tris=GSTAT.tris-t0;rec.front=svFront(d,doors,org,wry);rec.doorCount=doors.length;rec.r=Math.hypot(d.w,d.d)/2;rec.h=d.h;
 if(!PLACE_DRY)REG.push(rec);return rec;}
let PLACE_DRY=0;
/* NO LIFE LAYER YET (the brief: the arcology is furnished, its people come with the settlement). The pirates' faction data
   a world will read is kept as data here so the life layer has somewhere to start: */
const NR_FACTION={faction:'Ring Sea pirates',subFaction:"Bloody Ruephus's crew",base:"Noah's Regret",
 activities:{barracks:'SLEEP',mess:'EAT',hq:'COMMAND',dock:'LOAD',watch:'GUARD'},life:[]};
