// ---------------------------------------------------------------- 99. the take: Ys on core/host (every target: the city, the kit sheet, the mock)
// Ys hands core/host (core/host/README.md; ROADMAP.md section 10, step 5) its views (a preset's hour, compass and Inside
// through onView, as setView took them), its ground and floor (the sea surface over water: the eye and the walker never go
// under it), its records (KTAGS.page, which 91t-ys-tags.js fills from REG: the inspector, I and a click, and the minimap,
// M, read them), the inspector's words (92-camera.js ysInspect), the cutaway units and its own frame: FRAME_HOOKS as
// before, f(dt, nowMs), before the camera is placed (the sky and the clock, core/atmos, the builders' YS_TICKS and the kit's
// TICKS with NIGHT set, the labels, the compass). The cutaway (X): every building with rooms (ROOMS, grouped by the building
// they are in; the accreted pods by their host), its storeys the rooms' floor heights. The city's building editor keeps
// its own panel (Edit): a click while it is open is its own, not the inspector's.
const YS_CUT_UNITS=(function(){const by=new Map();
 for(const rm of ROOMS){const id=rm.bld!=null?'bld-'+rm.bld:String(rm.building||'room');let u=by.get(id);
  if(!u){u={id,name:String(rm.building||id),x0:Infinity,x1:-Infinity,z0:Infinity,z1:-Infinity,ys:new Map()};by.set(id,u);}
  for(const p of rm.poly){u.x0=Math.min(u.x0,p[0]);u.x1=Math.max(u.x1,p[0]);u.z0=Math.min(u.z0,p[1]);u.z1=Math.max(u.z1,p[1]);}
  const y=+(+rm.y).toFixed(1);u.ys.set(y,Math.max(u.ys.get(y)||0,rm.h||3));}
 return [...by.values()].map(u=>({id:u.id,name:u.name,x:(u.x0+u.x1)/2,z:(u.z0+u.z1)/2,w:u.x1-u.x0+1,d:u.z1-u.z0+1,
  levels:[...u.ys.keys()].sort((a,b)=>a-b).map((y,i)=>({y,h:u.ys.get(y),name:'floor '+(i+1)}))}));})();
/* core/host's inspector skips what the probe skips unless it has a label: the ground and the sea's pick plane have one, so
   a hover over open water or bare ground names it (ysInspect), as the page's own inspector did */
scene.traverse(o=>{if(o.userData&&o.userData.isGround&&!o.userData.inspectLabel)o.userData.inspectLabel=o.name==='sea'?'open sea':'ground';});
const YS_HOST=KHOST.take({
 build:'ys-'+String(TITLE).toLowerCase().replace(/[^a-z]+/g,'-').replace(/^-|-$/g,''),title:TITLE,
 hint:'I hovers the inspector, a click inspects, P marks, M the map, X a building storey by storey, F walks at eye height, N noon or night',
 scene,camera,renderer,ground:terrainH,floor:ysFloorY,clear:1.2,minR:2,maxR:9000,walk:YS_WALK,views:VIEWS,
 onView:name=>{const v=VIEWS[name]||[];ysViewExtras(v[6],v[7],v[8]);},
 inspect:(hit,hits)=>ysInspect(hits),
 click:()=>typeof ED!=='undefined'&&ED.on,   // the city's editor takes the click while it is open (94-city-editor.js)
 keys:{n:()=>{if(typeof setHour==='function')setHour(YSCLOCK.hour>6&&YSCLOCK.hour<19?22.2:12);}},
 cutaway:YS_CUT_UNITS.length?{units:YS_CUT_UNITS,cutAt:1.4}:null,
 minimap:{title:TITLE},
 exporters:{tags:()=>KTAGS.page.export()},
 budget:BUDGET,api:window._api,
});
KHOST.on(function ysHooks(dt){const now=performance.now();for(const f of FRAME_HOOKS)f(dt,now);},'tick');
KHOST.hover(true);   // the inspector's hover tip on, as Ys's was
