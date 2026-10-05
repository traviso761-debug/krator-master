// ---------------------------------------------------------------- probe (window._api)
// Everything verify.py --assert measures from inside the page. The Ancients kit's six invariants (the port's
// version, which samples merged-mesh vertices), the Iziz tag audit, the port checks when the layout places
// segments, and the Ys registries (marks, rooms, spots, hosts) for the interiors and Godot passes.
const BUDGET={
 showcase:{tris:30000000,calls:220},   // 30 M (Travis, Oct 5 2026: for now; Godot is the showroom)
 cls:{env:2500000,small:60000,medium:250000,landmark:600000,host:400000,seg:200000,vessel:250000},
 type:{},   // stat-key base -> cls; then a HYK.def's cls (cls:'landmark'), a port registration's cls; else 'medium'
};
function ysClsOf(statKey){const base=statKey.split('/')[0];if(base==='env')return 'env';if(BUDGET.type[base])return BUDGET.type[base];if(HYK.defs[base]&&HYK.defs[base].cls)return HYK.defs[base].cls;
 const R=portRegOf(base);return R?R.cls:'medium';}
function _probePoints(){
 const pts=[],m=new THREE.Matrix4(),pos=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();const bb=new THREE.Box3();
 scene.traverse(o=>{if(o.userData&&o.userData.probeSkip)return;
  if(o.isInstancedMesh){for(let i=0;i<o.count;i++){o.getMatrixAt(i,m);m.decompose(pos,q,sc);pts.push([pos.x,pos.y,pos.z]);}return;}
  if(!o.isMesh)return;bb.setFromObject(o);if(!isFinite(bb.min.x)||!isFinite(bb.max.x))return;
  pts.push([(bb.min.x+bb.max.x)/2,(bb.min.y+bb.max.y)/2,(bb.min.z+bb.max.z)/2]);
  for(const x of [bb.min.x,bb.max.x])for(const y of [bb.min.y,bb.max.y])for(const z of [bb.min.z,bb.max.z])pts.push([x,y,z]);
  const pa=o.geometry&&o.geometry.attributes&&o.geometry.attributes.position;
  if(pa&&pa.count>8){o.updateMatrixWorld();const st=Math.max(1,Math.floor(pa.count/3000)),v=new THREE.Vector3();
   for(let i=0;i<pa.count;i+=st){v.fromBufferAttribute(pa,i).applyMatrix4(o.matrixWorld);pts.push([v.x,v.y,v.z]);}}});
 return pts;}
function regOccupancy(){const BK=250,by={};REG.forEach((r,i)=>{const z0=Math.floor((r.z-r.r)/BK),z1=Math.floor((r.z+r.r)/BK);for(let b=z0;b<=z1;b++)(by[b]||(by[b]=[])).push(i);});
 const n=new Array(REG.length).fill(0);
 for(const p of _probePoints()){const cand=by[Math.floor(p[2]/BK)];if(!cand)continue;for(const i of cand){const r=REG[i];const dx=p[0]-r.x,dz=p[2]-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p[1]>=r.y-2&&p[1]<=r.y+r.h+5)n[i]++;}}
 return REG.map((r,i)=>({name:r.name,type:r.type,n:n[i]}));}
function nanSweep(){const bad=[];scene.traverse(o=>{if(!o.isMesh||(o.userData&&o.userData.probeSkip&&o.name!=='terrain'))return;
  const p=o.geometry&&o.geometry.attributes&&o.geometry.attributes.position;if(!p)return;const a=p.array;for(let i=0;i<a.length;i++)if(!isFinite(a[i])){bad.push({geo:o.geometry.type,name:o.name,at:i,n:a.length});break;}});
 return {meshes:bad.length,first:bad.slice(0,8),instances:TSTAT.bad.length,firstInstances:TSTAT.bad.slice(0,8)};}
// a type is budgeted per placement: a host type (ysPlaceHost marks it and counts its placements) under the 'host' class,
// and any type the city's draw pass places many times (it counts them in t.n) under its own class, once per copy
function typeStats(){const out={};for(const k in TSTAT.by){const t=TSTAT.by[k];const cls=t.host?'host':ysClsOf(k);const lim=BUDGET.cls[cls]||BUDGET.cls.medium;
 const n=t.n||1;out[k]={tris:t.tris,inst:t.inst,meshes:t.meshes,cls,limit:lim*n,over:t.tris>lim*n,n};}return out;}
// tag audit (project rule): every registered volume carries a classification and the project tags
function tagAudit(){const bad=REG.filter(r=>!r.cls||!r.tags||!r.tags.culture||!r.tags.type||!r.tags.wealth);return {bad:bad.length,first:bad.slice(0,6).map(r=>r.name)};}
// the port checks (stamps inside footprints, clearance) only mean something once the layout places segments
function ysChecks(){const R=[];
 if(PORT_LAYOUT.items.length){const byOwner={};PORT_LAYOUT.items.forEach((it,i)=>{byOwner[it.key+'/'+it.d+'@'+i]=it;});const bad=[];
  for(const s of PORT_ST.list){if(s.owner==='layout'||s.outside)continue;const it=byOwner[s.owner];if(!it)continue;const G=portRegOf(it.key);const e=.02;
   if(s.x0<it.gx-G.W/2-e||s.x1>it.gx+G.W/2+e||s.z0<it.gz-G.LAND-e||s.z1>it.gz+G.SEA+e)bad.push(s.owner+' '+s.kind);}
  R.push({name:'port-stamps-inside-footprint',ok:!bad.length,detail:bad.length?bad.length+' stamps: '+bad.slice(0,4).join(' | '):PORT_ST.list.length+' stamps inside their footprints'});}
 // the sea is where the map says it is: the bay head is on land, the SE corner is under water
 if(typeof CITY!=='undefined'&&CITY.HEAD){const h1=terrainH(CITY.HEAD[0],CITY.HEAD[1]),h2=terrainH(1400,1400),h3=terrainH(-1400,-1400);
  R.push({name:'coast-as-designed',ok:h1>0&&h2<-5&&h3>2,detail:'head of the bay '+h1.toFixed(1)+' m, SE corner '+h2.toFixed(1)+' m, NW corner '+h3.toFixed(1)+' m'});}
 // the tag audit
 {const t=tagAudit();R.push({name:'tags-complete',ok:t.bad===0,detail:t.bad?t.bad+' untagged: '+t.first.join(' | '):REG.length+' volumes tagged'});}
 // marks and rooms: every registered building has a door; every room has its polygon; every residence its three spots
 {const blds=REG.filter(r=>r.cls==='building');const doors=new Set(MARKS.filter(m=>m.kind==='door'||m.kind==='wetdoor').map(m=>m.bld));
  const noDoor=blds.filter(r=>!doors.has(r.bld));
  R.push({name:'every-building-has-a-door',ok:!noDoor.length,detail:noDoor.length?noDoor.length+' of '+blds.length+': '+noDoor.slice(0,5).map(r=>r.name).join(' | '):blds.length+' buildings, '+MARKS.length+' marks'});
  const noWay=HOSTS.filter(h=>!(h.ways&&h.ways.length)||!MARKS.some(m=>m.kind==='door'&&m.into===h.n));
  R.push({name:'every-host-has-a-way-in',ok:!noWay.length,detail:noWay.length?noWay.length+' of '+HOSTS.length+': '+noWay.map(h=>h.n).join(' | '):HOSTS.length+' hosts, each entered through a grown pod'});
  const res=ROOMS.filter(r=>r.kind==='bedroom'||r.residence);const miss=[];
  for(const rm of res){const S=SPOTS.filter(s=>s.room===rm.id);const need=['bed','food','store'].filter(k=>!S.some(s=>s.kind===k));if(need.length)miss.push(rm.building+': '+need.join(','));}
  R.push({name:'residence-minimum-spots',ok:!miss.length,detail:miss.length?miss.length+' rooms short: '+miss.slice(0,4).join(' | '):res.length+' residence rooms, '+SPOTS.length+' spots'});
  // every spot fits: its corners inside the room polygon, clear of every door (1 m swing) and of every other spot
  const inPoly=(P,x,z)=>{let ins=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[j],b=P[i];if(((b[1]>z)!==(a[1]>z))&&(x<(a[0]-b[0])*(z-b[1])/(a[1]-b[1])+b[0]))ins=!ins;}return ins;};
  const corners=s=>{const c=Math.cos(s.ry),sn=Math.sin(s.ry);return [[-1,-1],[1,-1],[1,1],[-1,1]].map(k=>[s.x+k[0]*s.w/2*c+k[1]*s.d/2*sn,s.z-k[0]*s.w/2*sn+k[1]*s.d/2*c]);};
  const bad=[];for(const s of SPOTS){const rm=ROOMS[s.room];if(!rm){bad.push('spot without room');continue;}
   if(!corners(s).every(c=>inPoly(rm.poly,c[0],c[1]))){bad.push(rm.building+' '+s.kind+' outside');continue;}
   const hd=Math.hypot(s.w,s.d)/2;for(const d of rm.doors)if(Math.hypot(d.at[0]-s.x,d.at[1]-s.z)<hd+1.0){bad.push(rm.building+' '+s.kind+' in the door swing');break;}
   for(const t of SPOTS){if(t===s||t.room!==s.room)continue;if(Math.hypot(t.x-s.x,t.z-s.z)<(hd+Math.hypot(t.w,t.d)/2)*.85){bad.push(rm.building+' '+s.kind+' overlaps '+t.kind);break;}}}
  R.push({name:'spots-fit-their-rooms',ok:!bad.length,detail:bad.length?bad.length+': '+bad.slice(0,5).join(' | '):SPOTS.length+' spots inside, clear of doors and each other'});}
 return R;}
window._api={
 BUDGET,REG,
 get totals(){let tris=0,inst=0,meshes=0;for(const k in TSTAT.by){tris+=TSTAT.by[k].tris;inst+=TSTAT.by[k].inst;meshes+=TSTAT.by[k].meshes;}return {tris,inst,meshes,registered:REG.length,types:Object.keys(TSTAT.by).length};},
 typeStats,regOccupancy,nanSweep,tagAudit,extra:ysChecks,
 marks:()=>MARKS,rooms:()=>ROOMS,spots:()=>SPOTS,hosts:()=>HOSTS,berths:()=>BERTHS,decks:()=>NAV_EXTRA,
 defs:()=>HYK.order.map(k=>{const D=HYK.defs[k];return {key:k,name:D.name,family:D.family,tags:D.tags,w:D.w,d:D.d,h:D.h};}),
 terrainH:(x,z)=>terrainH(x,z),
 setHour:h=>{setHour(h);return YSCLOCK.hour;},
 setView:(cx,cy,cz,tx,ty,tz,h,c,i)=>setView(cx,cy,cz,tx,ty,tz,h,c,i),
 setInside:on=>setInside(on),
 setCompass:on=>setCompass(on),
 views:()=>Object.keys(VIEWS),
};
