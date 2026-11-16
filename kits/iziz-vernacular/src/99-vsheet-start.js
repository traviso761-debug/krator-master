// ================================================================= 99. THE KIT SHEET: the take, on core/host
// The sheet hands core/host (core/host/README.md) its views, ground, walker (core/walk), records (KTAGS.page: the sites the
// kit's targets/sheet/91t-*-tags.js read REG into, and the furniture where a kit places it) and its frame: FRAME_HOOKS,
// f(dt, nowMs), before the camera is placed; the placeholder sky follows the eye after it. The probe (window._api) is the
// host's (95-host-probe.js: regOccupancy, nanSweep, typeStats from REG and TSTAT); SHEET_API adds what verify.py --assert
// reads of the kit: its defs, what failed to build, the tag audit, the doors, the trades table and the material records.
var NIGHT=false;   /* what the salvage fire flicker (69-mat-salvage.js) reads; the sheet's hour has no night, so only FIRE_T runs */
const SHEET_BUDGET={showcase:Object.assign({tris:4500000,calls:500},(SHEET.budget||{}).showcase),
 cls:{small:60000,medium:250000,sky:400000,mega:700000},type:{}};   // every def defaults to 'medium' (sheetTypes)
function sheetTypes(){const out={};for(const k in TSTAT.by){const t=TSTAT.by[k];out[k]={tris:t.tris,inst:t.inst,meshes:t.meshes};SHEET_BUDGET.type[k]=SHEET_BUDGET.type[k]||'medium';}return out;}
function sheetWalking(){return !!(KHOST.cam&&KHOST.cam.ctl&&KHOST.cam.ctl.walk);}
const SHEET_API={
 get totals(){let tris=0,inst=0,meshes=0;for(const k in TSTAT.by){tris+=TSTAT.by[k].tris;inst+=TSTAT.by[k].inst;meshes+=TSTAT.by[k].meshes;}
  return{tris,inst,meshes,registered:REG.length,types:Object.keys(TSTAT.by).length,sites:SITES.length};},
 // every def of the kit (the keys the target's rows name, or every key with the target's prefix) and the ones the sheet placed
 defs:()=>VERN.order.filter(k=>SHEET.owns(k)).map(k=>{const D=VERN.defs[k];return{key:k,name:D.name,family:D.family,tags:D.tags,w:D.w,d:D.d,h:D.h};}),
 coverage(){const placed=new Set(SITES.map(S=>S.key));return VERN.order.filter(k=>SHEET.owns(k)&&!placed.has(k));},
 fails:()=>window._sheetFails.slice(),
 // a placed site whose build registered nothing: the inspector could not name it
 unregistered(){const has=new Set(REG.map(r=>r.type));return [...new Set(SITES.map(S=>S.key))].filter(k=>!has.has(k));},
 tags(){return{audit:KTAGS.page.audit(),records:KTAGS.page.export().records.length};},
 tagExport:()=>KTAGS.page.export(),
 tagAudit(){const bad=REG.filter(r=>!r.cls||!r.tags||!r.tags.culture||!r.tags.type||!r.tags.wealth);return{bad:bad.length,first:bad.slice(0,6).map(r=>r.name)};},
 doors:()=>Object.assign({},window._doors),
 doorExport:()=>KDOOR.export(),
 doorState:()=>KDOOR.state(),
 trades:()=>SHEET.trades?SHEET.trades():null,
 materials:()=>window._materials||null,
 texPending:()=>window._texPending||0};
const SHEET_HOST=KHOST.take({
 build:SHEET.build,title:SHEET.title,
 hint:'I hovers the inspector, a click inspects, P marks, M the map, F walks at eye height, E opens the door in reach',
 ticks:TICKS,scene,camera,renderer,ground:terrainH,walk:KWALK,clear:1.2,minR:2,maxR:3000,views:VIEWS,
 registry:REG,types:sheetTypes,budget:SHEET_BUDGET,
 inspect:(hit,hits,rec)=>{if(rec)return null;const o=hit.object,p=hit.point;
  return(o===groundM?'ground':'unregistered '+(o.isInstancedMesh?'instance':'mesh'))+'\n'+p.x.toFixed(1)+', '+p.y.toFixed(1)+', '+p.z.toFixed(1);},
 minimap:{title:SHEET.title},
 exporters:{tags:()=>KTAGS.page.export(),doors:()=>KDOOR.export()},
 api:SHEET_API,
 // E opens or shuts the door within reach (core/door: KDOORHOST.toggleNear); flying, E still climbs as well
 keys:{e:()=>KDOORHOST.toggleNear(camera.position,sheetWalking())},
});
FRAME_HOOKS.push(KDOORHOST.tip(()=>camera.position,sheetWalking));   // "E: open the door" at the foot of the page
KHOST.on(function sheetHooks(dt){const now=performance.now();for(const f of FRAME_HOOKS)f(dt,now);},'tick');
KHOST.on(function sheetSkyView(){sheetSky();},'view');
KHOST.hover(true);
document.title=SHEET.title;
