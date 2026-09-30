// ---------------------------------------------------------------- registry, placement, cultural sockets
// A building def: {key, name, seed, tags:{type:[...],...}, w, d, h, build(o)}. The builder draws in its local frame (origin = plot centre on the
// ground, +z the front, x right, y up) and stays inside w x d (overhangs of ~1 m allowed). It never mentions a culture: it declares SOCKETS,
// and the active culture pack (core/sockets/80-cultures.js) fills them. o = {v: variant, culture-neutral options}.
const DEFS={};
function defBuilding(d){if(DEFS[d.key])reportErr('duplicate def '+d.key);d.cls=d.cls||'building';d.tags=Object.assign({culture:'post-apoc (generic)',sockets:true},d.tags||{});DEFS[d.key]=d;return d;}
const REG=[];function regClear(){REG.length=0;}
// ---- placement: place(key,x,z,ry,o) builds a def into the current frame (nested calls make compounds)
/* FRONT DOOR. Every building has an invisible front: the local yaw its main door faces (0 = +z, the frame's front), the door's local position, and where that
   came from. A def may state it: front:{x,z,yaw}. Otherwise place() picks it from the door() calls the builder made: the widest door facing within 50 degrees of +z,
   else the widest door anywhere, else the default (centre of the +z edge). Nothing is drawn; the record is data for later placement:
   rec.front = {source, local:{x,z,yaw}, world:{x,y,z,yaw}}; frontOf(key); placeFacing(key,x,z,towardX,towardZ,o) turns a building so its door faces a point (a road, a plaza). */
function pickFront(d,doors,M0inv){const L=doors.map(q=>{const p=new THREE.Vector3(q.wx,q.wy,q.wz).applyMatrix4(M0inv);const dv=new THREE.Vector3(q.dx,0,q.dz).transformDirection(M0inv);return {x:p.x,z:p.z,yaw:Math.atan2(dv.x,dv.z),dz:dv.z,w:q.w};});
 if(d.front)return {source:'declared',local:{x:d.front.x||0,z:d.front.z===undefined?d.d/2:d.front.z,yaw:d.front.yaw||0}};
 const fr=L.filter(q=>q.dz>Math.cos(50*PI/180)&&q.w>=.7).sort((a,b)=>b.w-a.w||Math.abs(a.x)-Math.abs(b.x))[0];
 if(fr)return {source:'door() facing +z',local:{x:fr.x,z:fr.z,yaw:fr.yaw}};
 const any=L.filter(q=>q.w>=.7).sort((a,b)=>b.w-a.w)[0];
 if(any)return {source:'door() on another face',local:{x:any.x,z:any.z,yaw:any.yaw}};
 return {source:'default',local:{x:0,z:d.d/2,yaw:0}};}
function place(key,x,z,ry,o){const d=DEFS[key];if(!d){reportErr('no def '+key);return null;}o=o||{};
 const y=o.y!==undefined?o.y:terrainH(x,z);const keepKey=CURKEY,keepSocks=SOCKS,keepCult=CULT.cur,keepDoors=DOORS_CUR;CURKEY=key;SOCKS=[];DOORS_CUR=[];
 if(o.culture&&CULT.packs[o.culture])CULT.cur=CULT.packs[o.culture];   /* o.culture dresses THIS building (and any it places) in another culture's marks */
 pushM(TF(x,y,z,ry||0));const M0inv=CM.clone().invert();const org=new THREE.Vector3().applyMatrix4(CM);const bb=sbBegin();const t0=GSTAT.tris;
 reseed(d.seed+(o.v|0)*7);
 try{d.build(o);fillSockets();}catch(e){reportErr('build '+key+': '+(e.stack||e));}
 sbEnd();popM();const doors=DOORS_CUR;DOORS_CUR=keepDoors;CURKEY=keepKey;SOCKS=keepSocks;CULT.cur=keepCult;
 const fr=pickFront(d,doors,M0inv);const wy=(ry||0)+fr.local.yaw;const cs=Math.cos(ry||0),sn=Math.sin(ry||0);
 fr.world={x:org.x+fr.local.x*cs+fr.local.z*sn,y:org.y,z:org.z-fr.local.x*sn+fr.local.z*cs,yaw:wy};
 const rec={key,name:d.name,cls:d.cls,tags:d.tags,x:org.x,y:org.y,z:org.z,ry:ry||0,r:Math.hypot(d.w,d.d)/2,h:d.h,tris:GSTAT.tris-t0,bbox:bb,v:o.v|0,front:fr,doorCount:doors.length};REG.push(rec);return rec;}
const _FRONT={};
/* the front (local yaw + door position) of a def, found by one throwaway build: cached */
function frontOf(key){if(_FRONT[key])return _FRONT[key];const keepG=GTARGET,keepReg=REG.length,keepSock=SOCK_ALL.length,keepP=PLANTS.list.length,keepT=GSTAT.tris,keepH=HALOS.length,keepS=SPINNERS.length,keepCMS=CMS.slice();
 GTARGET={};resetCM();let r=null;try{r=place(key,0,0,0,{v:0});}finally{GTARGET=keepG;REG.length=keepReg;SOCK_ALL.length=keepSock;PLANTS.list.length=keepP;GSTAT.tris=keepT;HALOS.length=keepH;SPINNERS.length=keepS;CMS.length=0;for(const m of keepCMS)CMS.push(m);CM=CMS[CMS.length-1];}
 return _FRONT[key]=r?r.front.local:{x:0,z:DEFS[key].d/2,yaw:0};}
/* place a building so its front door faces the point (tx,tz), e.g. the nearest road */
function placeFacing(key,x,z,tx,tz,o){const f=frontOf(key);return place(key,x,z,Math.atan2(tx-x,tz-z)-f.yaw,o);}
