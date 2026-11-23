// ---------------------------------------------------------------- 99. the take: Xanadu on core/host
// The kit's rows and Erewhon hand core/host (core/host/README.md; ROADMAP.md section 10, step 5) their views, ground, records
// (KTAGS.page, the registry 91t-xanadu-tags.js reads REG into: the inspector, I and a click, and the minimap, M) and their own
// frame: FRAME_HOOKS as before, f(dt, nowMs), before the camera is placed (the labels; the kit's still water and waves,
// core/atmos; Erewhon's sky, city clock, wind and chunk culling); the showcase sky and the giant kept on the eye after it.
// Erewhon's hour stays its own (ERSKY, the hour slider in 93-er-ui.js). TICKS is handed over (ticks:TICKS): its one entry, 69-mat-salvage.js's fire flicker, reads NIGHT, defined just below.
var NIGHT=false;   /* what the salvage fire flicker (69-mat-salvage.js) reads: the city page's KratorSky night (dayF<0.05, 81-sky.js); the kit pages have no night */
const XANADU_HOST=KHOST.take({
 build:window.CITY?(window.CITY_BUILD||'erewhon'):'xanadu',title:TITLE,   /* CITY_BUILD: a city target's own name (settlements/qiblai: 'qiblai') */
 walk:typeof KWALK!=='undefined'?KWALK:null,   /* a page that loads core/walk (settlements/qiblai): the walker stands on its floors, its walls stop it */
 hint:'I hovers the inspector, a click inspects, P marks, M the map, F walks at eye height',
 ticks:TICKS,scene,camera,renderer,ground:terrainH,clear:1.2,minR:2,maxR:3000,views:VIEWS,
 inspect:(hit,hits,rec)=>{if(rec)return null;const o=hit.object,p=hit.point;
  return(o===groundM||(o.userData&&o.userData.isGround)?'ground':'unregistered '+(o.isInstancedMesh?'instance':'mesh'))+'\n'+p.x.toFixed(1)+', '+p.y.toFixed(1)+', '+p.z.toFixed(1);},
 minimap:{title:TITLE},
 // with the interiors on (?interiors=1, 89y-xa-interiors.js): the walk on core/walk's floors, and X the cutaway of the furnished buildings
 /* Erewhon walks on core/walk's floors always: the citadel's rooms, flights and ramps are registered with or without the
    furnished interiors, and walking on the terrain alone went through its stairs (the owner, 2026-11-12). Its near plane follows
    the eye's height (core/host's depth): from 300 m the courts' floor layers, 1 to 2 cm apart, fought at a 0.3 m near plane */
 walk:(XAF.interiors||window.CITY)?KWALK:undefined,depth:window.CITY?{k:.04,min:.3,max:12}:undefined,cutaway:(XAF.interiors||XA_CUT.length)?{units:(XAF.interiors?xafUnits(XAF,VERN.defs):[]).concat(XA_CUT)}:undefined,   // XA_CUT: the Pleasure Dome, hollow with or without the interiors (kits/xanadu 78d)
 
 exporters:{tags:()=>KTAGS.page.export()},
 budget:BUDGET,api:window._api,
 // E opens or shuts the door within reach (core/door: KDOORHOST.toggleNear; 90-xa-doors.js); flying, E still climbs as well
 keys:{e:()=>KDOORHOST.toggleNear(camera.position,xaWalking())},
});
// walking (the host's F) or flying: the reach of the E key and its tip
function xaWalking(){return !!(KHOST.cam&&KHOST.cam.ctl&&KHOST.cam.ctl.walk);}
FRAME_HOOKS.push(KDOORHOST.tip(()=>camera.position,xaWalking));   // "E: open the door" at the foot of the page
KHOST.on(function xanaduNightFlag(){NIGHT=!!(window.CITY&&window.KratorSky&&KratorSky.state&&KratorSky.state.sun&&KratorSky.state.sun.y<-0.105);},'tick');
KHOST.on(function xanaduHooks(dt){const now=performance.now();for(const f of FRAME_HOOKS)f(dt,now);},'tick');
KHOST.on(function xanaduSky(){if(sky)sky.position.copy(camera.position);if(giant)giant.position.copy(camera.position).addScaledVector(giantDir,4000);},'view');
KHOST.hover(true);   // the inspector's hover tip on, as Xanadu's was
