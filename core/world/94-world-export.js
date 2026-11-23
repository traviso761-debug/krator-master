// ================================================================= OPEN WORLD — the region through core/export (GODOT-PLAN.md section 8, M7)
// [web] Opt-in: a region build lists it after core/export (07, 09, 10) when the region is a Godot case
// (openworld/oidong-highrift since 2026-11-16, the owner: "set up oidong/high rift/strongbow as a godot test"). It draws
// nothing and changes nothing the page shows. At export time it fills, for the export's box:
//   registry   the region's records as one page registry (KTAGS.page, which core/export 09's registry adapter crops to the
//              box): the registries the region's parts made (88s the sites, 88b the bridges), each record's id (and its
//              parent's) prefixed by its part ('sites:', 'bridges:'), since each part counts its ids from its own start
//   terrain    EXPORT.terrain over the box: WORLD.H (the ground the page draws: the region's heights with the rivers' and the
//              roads' carving) and WORLD.water (a surface's level, -1e9 where there is none; left out when WORLD_EXPORT.water
//              is false: a streamed chunk's ground, whose water the water section carries), on a grid WORLD_EXPORT.step
//              apart (32 m unless the export's --before step sets it), with its probes
//   items, buckets, materials, textures   EXPORT.sceneReader over the scene in the box: the villages' pieces, the bridges,
//              the flora drawn round the camera (its instances); the terrain (userData.terrain), the water surfaces and
//              the sky (userData.probeSkip: the terrain and water sections carry them) and the resource beacons (map
//              markers) are left out. The flora is drawn only within reach of the camera, so a case places the camera at
//              the box and settles the page first (openworld/<region>/tools/godot_case.py, harness.py export --before)
// The meshes stand at world coordinates (no floating origin under the villages, the bridges or the flora's pools as
// read here: their world matrices), so the box is in the region's metres, as the plan's.
var WORLD_EXPORT=window.WORLD_EXPORT||{};
(function(){'use strict';
if(typeof EXPORT==='undefined'||typeof KTAGS==='undefined')return;
const E=EXPORT,REGION=(typeof SITE_SPEC!=='undefined'&&SITE_SPEC.region)||(WORLD_DATA.meta&&WORLD_DATA.meta.region)||'region';
/* ---------------------------------------------------------------- the registry: the parts' registries as one */
/* the parts make theirs late (LATE, 98-world-start), after this fragment has run: every registry made from here on is
   kept, and the page registry reads the region's (a build named '<region>:<part>') */
const REGS=[],make=KTAGS.create;
KTAGS.create=function(o){const T=make.apply(KTAGS,arguments);REGS.push(T);return T;};
const parts=()=>REGS.filter(T=>String(T.build||'').indexOf(REGION+':')===0);
const partOf=T=>String(T.build).slice(REGION.length+1);
const pre=(p,id)=>id==null?id:p+':'+id;
const PAGE={build:REGION,
 get records(){const out=[];parts().forEach(T=>T.records.forEach(r=>out.push(r)));return out;},
 export(opt){const P=parts();if(!P.length)return{format:'krator-tags',version:1,build:REGION,records:[]};
  const first=P[0].export(opt),recs=[];
  P.forEach(T=>{const p=partOf(T),e=T===P[0]?first:T.export(opt);
   e.records.forEach(r=>{const o={};for(const k in r)o[k]=r[k];o.id=pre(p,r.id);if(r.parent!=null)o.parent=pre(p,r.parent);o.part=p;recs.push(o);});});
  return{format:first.format,version:first.version,build:REGION,convention:first.convention,vocab:first.vocab,records:recs,
   parts:P.map(T=>({part:partOf(T),build:T.build,records:T.records.length})),
   note:'the region\'s parts\' registries as one (core/world/94-world-export.js): an id is <part>:<the part\'s own id>'};},
 audit(){const a={records:0,unknown:0};parts().forEach(T=>{const x=T.audit();a.records+=x.records||0;a.unknown+=x.unknown||0;});return a;},
 /* a prefixed id resolved in its part (EXPORT.sceneReader asks get(id).uid of a bucket's records and isSet of an item's set) */
 part(id){const s=String(id),k=s.indexOf(':');if(k<0)return null;const p=s.slice(0,k),T=parts().find(t=>partOf(t)===p);return T?{T,p,id:s.slice(k+1)}:null;},
 get(id){const q=PAGE.part(id);if(!q)return null;const r=q.T.get(q.id);if(!r)return null;const o={};for(const k in r)o[k]=r[k];o.id=pre(q.p,r.id);if(r.parent!=null)o.parent=pre(q.p,r.parent);return o;},
 isSet(id){const q=PAGE.part(id);return!!(q&&q.T.isSet&&q.T.isSet(q.id));}};
if(!KTAGS.page)KTAGS.page=PAGE;
/* the owner of a mesh's triangle or instance: the smallest site record whose footprint holds it (the villages' buildings,
   tents, pens; their size [w, d] turned by ry) */
function owners(box){const vols=[];
 parts().forEach(T=>{const p=partOf(T);T.records.forEach(r=>{if(r.removed||!r.at||!r.size||r.set)return;const h=Math.max(r.size[0],r.size[1])/2+4;
  if(r.at[0]+h<box[0]||r.at[0]-h>box[2]||r.at[2]+h<box[1]||r.at[2]-h>box[3])return;
  vols.push({id:pre(p,r.id),x:r.at[0],z:r.at[2],c:Math.cos(-(r.ry||0)),s:Math.sin(-(r.ry||0)),hw:r.size[0]/2+1,hd:r.size[1]/2+1,a:r.size[0]*r.size[1]});});});
 return(x,y,z)=>{let best=null;for(const v of vols){const dx=x-v.x,dz=z-v.z,u=dx*v.c-dz*v.s,w=dx*v.s+dz*v.c;
  if(Math.abs(u)<=v.hw&&Math.abs(w)<=v.hd&&(!best||v.a<best.a))best=v;}return best?best.id:null;};}
/* ---------------------------------------------------------------- the scene, in the box */
const up=(m,f)=>{for(let p=m;p;p=p.parent)if(f(p))return true;return false;};
const hidden=m=>up(m,p=>p.visible===false);
const beacon=m=>up(m,p=>/^resource beacon/.test(p.name||''));
/* a bridge's pieces (88b: a group named 'bridge <key>') stand in its record, found by its key */
function byKey(){const M=new Map();parts().forEach(T=>{const p=partOf(T);T.records.forEach(r=>{if(r.key!=null&&!r.removed)M.set(String(r.key),pre(p,r.id));});});return M;}
const scene_=ctx=>ctx.memo('world-scene',()=>{const box=ctx.box||[-Infinity,-Infinity,Infinity,Infinity],K=byKey();
 const ownerOf=m=>{for(let p=m;p;p=p.parent){const n=p.name||'';if(n.indexOf('bridge ')===0&&K.has(n.slice(7)))return K.get(n.slice(7));}return null;};
 return E.sceneReader({name:'world:'+REGION,source:'openworld/'+REGION,scene:HOST.scene,tags:KTAGS.page,owner:owners(box),ownerOf,
  /* a flora pool's part (85: userData.flora is the pool's key, kit|species|variant|level, shared by the plant's parts) */
  kitOf:m=>m.userData&&m.userData.flora?'flora/'+m.userData.flora+'/'+(m.material&&m.material.name||'')+(m.geometry?'#'+m.geometry.id:''):null,
  itemKit:kit=>kit&&kit.indexOf('flora/')===0?'flora':'world',
  skipInstanced:m=>hidden(m)?'hidden':beacon(m)?'a resource beacon (a map marker)':null,
  skipMesh:m=>m.userData&&m.userData.terrain?'the terrain (the terrain section)':m.userData&&m.userData.probeSkip?'water or sky (their sections)':
   hidden(m)?'hidden':beacon(m)?'a resource beacon (a map marker)':null}).assemble(ctx);});
const by={by:'world'};
E.register('items',ctx=>scene_(ctx).items,by);
E.register('buckets',ctx=>scene_(ctx).buckets,by);
E.register('materials',ctx=>scene_(ctx).materials,by);
E.register('textures',ctx=>scene_(ctx).textures,by);
/* ---------------------------------------------------------------- the ground */
E.register('terrain',ctx=>{if(!ctx.box)return null;const st=WORLD_EXPORT.step==null?32:+WORLD_EXPORT.step;
 return E.terrain(ctx.box,{h:(x,z)=>WORLD.H(x,z),water:WORLD_EXPORT.water===false?null:(x,z)=>WORLD.water(x,z),step:st,probes:WORLD_EXPORT.probes==null?16:+WORLD_EXPORT.probes});},by);
window._worldExport={registries:()=>parts().map(T=>({build:T.build,records:T.records.length}))};
})();
