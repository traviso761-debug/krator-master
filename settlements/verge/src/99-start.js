// ================================================================= VERGE — the take: Verge on core/host ([web])
// The camera, the frame loop, the panel, the inspector, marks, the minimap and the probe's common fields are core/host's
// (core/host/README.md; ROADMAP.md section 10, stage 3 step 5). This replaced 90-verge-camera.js (2026-10-15). What stays
// Verge's: its views (87), the sky and the light on the world clock (a 'view' subscriber, after the camera, as before),
// its draw (the Krator sky's own scene first, then PRE_RENDER, then the city), the inspector's words for what no record
// holds (a creature, a place, the trail, the terrain), and its probe (91-verge-probe.js, handed over as `api`).
//
// THE ONE CLOCK. CLOCK (45-verge-stage.js) is read everywhere (the life layer, the rigs, the views, the probe, verify.py's
// CLOCK.set / CLOCK.run); the host owns the clock it steps and its panel drives. So CLOCK's fields are made to read and
// write the host's clock (KHOST.host.clock, set as the take begins, before its first frame), and its methods to call it:
// one clock, the host's speed buttons, hour slider and run / hold reach the sky, the lamps and the life layer.
(function(){const OWN={};for(const k of ['t','dt','hour','day','dayLength','running','scale','fixed'])OWN[k]=CLOCK[k];
 const HC=()=>KHOST.host&&KHOST.host.clock;
 for(const k in OWN)Object.defineProperty(CLOCK,k,{configurable:true,enumerable:true,get(){const C=HC();return C?C[k]:OWN[k];},set(v){const C=HC();if(C)C[k]=v;else OWN[k]=v;}});
 CLOCK.step=function(){return CLOCK;};   // the host's loop steps it
 CLOCK.set=function(h){const C=HC();if(C)C.set(h);else OWN.hour=((+h||0)%24+24)%24;return CLOCK;};
 CLOCK.run=function(on){const C=HC();if(C)C.run(on);else OWN.running=on===undefined?!OWN.running:!!on;return CLOCK;};
 CLOCK.state=function(){const C=HC();return C?C.state():Object.assign({},OWN);};
 CLOCK.load=function(s){const C=HC();if(C)C.load(s);return CLOCK;};})();
// verify.py drives the views through this global (n=>setView(...n)), as 90-verge-camera.js had it
function setView(cx,cy,cz,tx,ty,tz){KHOST.setView(cx,cy,cz,tx,ty,tz);}
const PRE_RENDER=[];          // passes that must draw before the main scene (a background sky scene)
// ---------------------------------------------------------------- the inspector's words where no record holds the point
const VERGE_SPECIES={};
for(const K of [typeof SEDESERT!=='undefined'?SEDESERT:null,typeof EASTABYSS!=='undefined'?EASTABYSS:null])if(K)(K.SPECIES||[]).forEach(s=>VERGE_SPECIES[s.name]=K===SEDESERT?'eastern high desert (sedesert)':'eastern abyss (eastabyss)');
function vergeTerrainName(x,z){const w=waterH(x,z);if(w>terrainH(x,z)-.05){if(Math.hypot(x-VG.POOL.x,z-VG.POOL.z)<VG.POOL.r+10)return'The plunge pool';
  if(x>VG.GORGE.x0&&x<VG.GORGE.x1)return'The gorge of the seven cataracts';return x<VG.lipX(z)?'The river (upper)':x>3000?'A salt lake':'The river (lower)';}
 const zn=VG.zoneAt(x,z);return{canyon:'The canyon floor','canyon-wall':'The canyon wall',plateau:VG.mesaH(x,z)>10?'A mesa':'The plateau (eastern high desert)',
  spur:'The spur (the easiest descent)',cliff:'The escarpment',floor:'The abyss floor',salt:'The salt flats'}[zn]||zn;}
function vergeWords(hit){const p=hit.point,u=hit.object.userData||{},at='\n'+p.x.toFixed(1)+', '+p.y.toFixed(1)+', '+p.z.toFixed(1)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';
 if(u.inspectFn&&hit.instanceId!=null)return u.inspectFn(hit.instanceId)+at;          // a creature: its faction and job (78)
 const lab=u.inspectLabel||(u.biome?hit.object.name:null);
 if(lab&&u.biome){const b=VERGE_SPECIES[lab];return lab+'\n[flora]'+(b?'  '+b:'')+at;}
 const pl=placeAt(p.x,p.z);if(pl){let s=pl.name+'\n[place]';if(pl.activities)s+='\n  activities: '+pl.activities.join(', ');if(pl.capacity!=null)s+='\n  capacity: '+pl.capacity;return s+at;}
 const n=VG.trailNear(p.x,p.z);
 if(n&&n.d<VG.TRAIL.bank)return 'The switchback (the Verge trail)\n[path]  grade '+VG.TRAIL.grade.toFixed(3)+' · '+Math.round(VG.TRAIL.len)+' m · here '+Math.round(n.s)+' m, '+Math.round(VG.TRAIL.yTop-n.y)+' m down'+at;
 return vergeTerrainName(p.x,p.z)+'\n[terrain]'+(lab?'  ·  '+lab:'')+at;}
// ---------------------------------------------------------------- the ticks, after the camera (as 90-verge-camera.js ran them)
// TICKS run in a 'view' subscriber, not as the host's `ticks` (which run before the camera is placed): the interiors' queue
// (71) and the life layer (78) read camera.position, and with the camera a frame behind the first frame furnished the rooms
// round the origin. Each tick isolated: one that throws reports once and the rest run, as before
KHOST.on(function vergeTicks(dt,clock){for(let i=0;i<TICKS.length;i++){try{TICKS[i](dt,clock.t);}catch(e){if(!TICKS[i]._bad){TICKS[i]._bad=true;reportErr('tick: '+e.stack);}}}},'view');
// ---------------------------------------------------------------- the sky and the light, on the one clock, after the camera
// (as 90-verge-camera.js did every frame: the Krator sky's hour IS the world clock's; the sun stands over the orbit's target)
let vergeLast=performance.now();
KHOST.on(function vergeSky(){const now=performance.now(),rdt=Math.min(.1,Math.max(0,(now-vergeLast)/1000));vergeLast=now;
 if(typeof skySetHour!=='function')return;const tg=KHOST.cam.ctl.target;
 SKY.timeScale=0;skySetHour(CLOCK.hour);updateSky();updateDayNight();
 const kd=SKY_STATE.keyDir;sun.position.copy(kd).multiplyScalar(2600).add(tg);sun.target.position.copy(tg);sun.target.updateMatrixWorld();
 BIO.setSun([kd.x,kd.y,kd.z]);MAT_WATER.uniforms.uSun.value.copy(kd);MAT_WATER.uniforms.uSky.value.copy(scene.fog.color);MAT_WATER.uniforms.uSunK.value=clamp(SKY_STATE.dayK,0,1);
 MAT_WATER.uniforms.fogDensity.value=scene.fog.density;MAT_FALL.uniforms.fogDensity.value=scene.fog.density;MAT_FALL.uniforms.uLit.value=.25+.75*clamp(SKY_STATE.dayK,0,1);
 if(VERGE_GLOW)VERGE_GLOW.updateGlow(rdt,CLOCK.hour,DAYNIGHT_NIGHT_K);},'view');
// ---------------------------------------------------------------- the page, handed to the host
KHOST.take({build:'verge',title:'Verge — the twin cities on the cataracts',
 hint:'Twin cities where the high desert falls ~860 m into the Eastern Abyss: Upper Verge in the canyon (the Governor of Iziz), the switchback and the seven cataracts, Lower Verge by the plunge pool (its elected Mayor)',
 scene,camera,renderer,ground:terrainH,walk:KWALK,clear:1.7,minR:2,maxR:16000,views:VIEWS,start:INITIAL_VIEW,
 clock:{hour:CLOCK.hour,running:CLOCK.running},
 sky:{hour(){}},   // the hour slider and run / hold; the sky itself is set every frame by vergeSky above
 // the Krator sky's own scene first, the depth cleared, then the passes before the city, then the city
 draw(){renderer.info.autoReset=false;renderer.info.reset();renderer.autoClear=true;
  if(typeof skyRender==='function'){skyRender();renderer.autoClear=false;renderer.clearDepth();}
  for(const f of PRE_RENDER)f();renderer.render(scene,camera);renderer.autoClear=true;},
 // a record (a building, a piece, a tree...) is worded by core/tags' label; else a creature, a place, the trail, the terrain
 inspect:(hit,hits,rec)=>{const u=hit.object.userData||{};if(u.inspectFn&&hit.instanceId!=null)return vergeWords(hit);return rec?null:vergeWords(hit);},
 controls:[{button:'Sky panel',id:'skyPanelToggle',on(){const box=document.getElementById('skyUI');if(!box)return;const on=box.style.display==='none';box.style.display=on?'block':'none';
  const b=document.getElementById('skyPanelToggle');if(b)b.classList.toggle('on',on);}}],
 stats:()=>'day '+CLOCK.day,
 layers:{'flora and fauna':{match:o=>!!(o.userData&&o.userData.biome)}},
 exporters:{tags:()=>KTAGS.page.export()},
 minimap:{title:'Verge'},
 api:window._api});
KHOST.hover(true);   // the inspector's hover tip on, as Verge's 'Inspector (hover)' box was
