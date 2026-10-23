// ---------------------------------------------------------------- 99. the take: Iziz on core/host
// Iziz hands core/host (core/host/README.md; ROADMAP.md section 10, step 3) its views, its ground, its records (KTAGS.page,
// the full registry 91t-iziz-tags.js reads REG into: the inspector, I and a click, and the minimap, M, read them), and its own
// frame: FRAME_HOOKS as before, f(dt, nowMs), before the camera is placed (the labels, the city's sky, clock, wind and
// weather, in their order); the showcase sky and the giant kept on the eye after it. The city's hour stays its own clock
// (CITY_CLOCK, the hour slider in 93-city-ui.js); the host's speed buttons set the motion time the hooks are handed.
var NIGHT=false;   /* what the salvage fire flicker (69-mat-salvage.js) reads: the city page's KratorSky night (dayF<0.05, 81-sky.js); the kit pages have no night */
const IZIZ_HOST=KHOST.take({
 build:'iziz-'+(window.CITY?'city':String(TITLE).toLowerCase().replace(/[^a-z]+/g,'-')),title:TITLE,
 hint:'I hovers the inspector, a click inspects, P marks, M the map, F walks at eye height'+(IZIX.units.length?', X cuts a building away (] [ its storeys)':''),
 ticks:TICKS,scene,camera,renderer,ground:terrainH,walk:KWALK,clear:1.2,minR:2,maxR:3000,views:VIEWS,
 inspect:(hit,hits,rec)=>{if(rec)return null;const o=hit.object,p=hit.point;
  return(o===groundM||(o.userData&&o.userData.isGround)?'ground':'unregistered '+(o.isInstancedMesh?'instance':'mesh'))+'\n'+p.x.toFixed(1)+', '+p.y.toFixed(1)+', '+p.z.toFixed(1);},
 minimap:{title:TITLE},
 cutaway:IZIX.units.length?{units:IZIX.units}:undefined,   // every furnished building (95i-iziz-interiors.js)
 exporters:{tags:()=>KTAGS.page.export()},
 budget:BUDGET,api:window._api,
 // E opens or shuts the nearest door within reach (69e5, 95j); flying, E still climbs as well
 keys:{e:()=>{const D=izNearDoor();if(D)IZDOOR.toggle(D,{by:'player'});}},
});
KHOST.on(function izizNightFlag(){NIGHT=!!(window.CITY&&window.KratorSky&&KratorSky.state&&KratorSky.state.sun&&KratorSky.state.sun.y<-0.105);},'tick');
// the door within reach of the eye: walking, the feet are the eye height below it
function izNearDoor(){const p=camera.position,walk=!!(KHOST.cam&&KHOST.cam.ctl&&KHOST.cam.ctl.walk);
 return IZDOOR.nearest(p.x,p.y-(walk?1.7:1.2),p.z,walk?2.4:3);}
{const tip=document.createElement('div');tip.id='izdoor';tip.style.cssText='position:fixed;left:50%;bottom:64px;transform:translateX(-50%);padding:4px 10px;border-radius:4px;background:rgba(20,16,12,.72);color:#f3e6cf;font:13px system-ui,sans-serif;pointer-events:none;display:none;z-index:20';
 document.body.appendChild(tip);let n=0;
 FRAME_HOOKS.push(()=>{if(n++%8)return;const D=IZDOOR.list.length?izNearDoor():null;
  if(D){tip.textContent='E: '+(D.target>.5?'shut':'open')+' the door';tip.style.display='block';}else tip.style.display='none';});}
KHOST.on(function izizHooks(dt){const now=performance.now();for(const f of FRAME_HOOKS)f(dt,now);},'tick');
KHOST.on(function izizSky(){if(sky)sky.position.copy(camera.position);if(giant)giant.position.copy(camera.position).addScaledVector(giantDir,4000);},'view');
KHOST.hover(true);   // the inspector's hover tip on, as Iziz's was
