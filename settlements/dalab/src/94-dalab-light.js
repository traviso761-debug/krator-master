// ================================================================= DALAB — the lighting system (the standard package)
// The Krator sky (81-sky.js, as the Iziz city runs it) drives the sun, fill, hemisphere and fog by the hour of day;
// an hour slider in the UI and a seventh element on a VIEWS preset set it (the Ancients kit's night-preset idea).
// Night is a visibility flip on whole InstancedMeshes (KIT.meshes, from 30-kit.js): The God's light and the hearth
// fires (DNIGHT_ITEMS) show after dusk, the dark day glass (DDAY_ITEMS) shows by day. Nothing is rebuilt.
//
// Lighting rule (canon, as Iziz): only priest, noble and civic buildings carry The God's light — vLit() answers the
// def's `lit` tag or the placer's o.lit — and it is COLD teal-white. Peasant and trade buildings have no light but
// their hearths and yard fires, which are fire, not power, and allowed anywhere.
const DSKY={hour:15.8,day:200,dens:1.35};const DSKY_DAY=15.8;   // a preset without an hour is a DAY preset (as an Ancients preset without the night flag)
{if(sky){scene.remove(sky);sky=null;}if(giant){scene.remove(giant);giant=null;}     // the showcase's static sky goes; KratorSky replaces it
 KratorSky.attach(scene,5000);scene.fog.density=window.CITY?.00013:.00045;}
if(!window.CITY)BUDGET.showcase.tris=10000000;   // the set's ceiling (Travis, round 7): room for level of detail
const dHemi=scene.children.find(o=>o.isHemisphereLight);
let DNIGHT=null;
function dalabNight(on){on=!!on;if(DNIGHT===on)return;DNIGHT=on;
 for(const n of DNIGHT_ITEMS)if(KIT.meshes[n])KIT.meshes[n].visible=on;
 for(const n of DDAY_ITEMS)if(KIT.meshes[n])KIT.meshes[n].visible=!on;}
function dalabSkyTick(){KratorSky.update(camera.position,DSKY.hour,DSKY.day,DSKY.dens);const L=KratorSky.lighting();
 sun.position.copy(L.sunDir).multiplyScalar(1500).add(camera.position);sun.target.position.copy(camera.position);sun.target.updateMatrixWorld();sun.intensity=L.sunIntensity;sun.color.copy(L.sunColor);
 fill.intensity=.22*L.dayF+.05;if(dHemi){dHemi.intensity=L.ambient;dHemi.color.setHex(L.dayF>.5?0xffe8d0:0x3c4c6a);}
 scene.fog.color.copy(L.fog);renderer.setClearColor(L.fog);renderer.toneMappingExposure=1.0+.12*(1-L.dayF);
 if(typeof BIO!=='undefined'&&BIO.host)BIO.setSun([L.sunDir.x,L.sunDir.y,L.sunDir.z]);
 dalabNight(L.dayF<.45);}
FRAME_HOOKS.push(dalabSkyTick);
if(sun.target&&!sun.target.parent)scene.add(sun.target);
dalabSkyTick();
// a seventh preset element is the hour: setView(...VIEWS[k]) from the select, the hidden buttons and window._api all pass it
const _dSetView=setView;
setView=function(cx,cy,cz,tx,ty,tz,hour){_dSetView(cx,cy,cz,tx,ty,tz);DSKY.hour=hour!=null?hour:DSKY_DAY;dalabSkyTick();dalabHourUI();};
let dalabHourUI=()=>{};
{const wrap=document.createElement('span');wrap.style.cssText='display:inline-flex;align-items:center;gap:4px;margin-left:6px;font:12px system-ui;color:#c8f0e8';
 const lab=document.createElement('span');const sl=document.createElement('input');sl.type='range';sl.min=0;sl.max=24;sl.step=.1;sl.style.width='120px';
 dalabHourUI=()=>{sl.value=DSKY.hour;lab.textContent='hour '+DSKY.hour.toFixed(1)+(DNIGHT?' · night':'');};
 sl.oninput=()=>{DSKY.hour=parseFloat(sl.value);dalabSkyTick();dalabHourUI();};wrap.appendChild(lab);wrap.appendChild(sl);ui.appendChild(wrap);dalabHourUI();}
addEventListener('keydown',e=>{if(e.target.tagName==='TEXTAREA')return;if(e.key.toLowerCase()==='n'){DSKY.hour=DNIGHT?12:22;dalabSkyTick();dalabHourUI();}});
window._api.setHour=h=>{DSKY.hour=h;dalabSkyTick();dalabHourUI();};window._api.night=()=>DNIGHT;
// ---------------------------------------------------------------- the biome (gardens), the mounds, the windmills
// The builders planted through SWLOW.treeAt / plantAt into BIO's items during the SITES loop (90-scene); the scene
// is bound and baked here, after kbake, and the wind tick joins the frame loop.
{BIO.setScene(scene);try{const b=BIO.bake();window._biome=Object.assign(window._biome||{},{calls:b.calls,inst:b.inst});}catch(e){reportErr('biome bake: '+e.stack);}
 BIO._tickWind&&BIO._tickWind();for(const f of BIO_TICKS)FRAME_HOOKS.push(f);BIO_TICKS.length=0;
 // every mound and ring bank in one mesh
 if(DMOUND_GEOS.length){const m=meshMerged(DMOUND_GEOS,MAT.dTurfMesh,scene,0,0,0);m.name='mounds';window._mounds=DMOUND_GEOS.length;DMOUND_GEOS.length=0;}}
FRAME_HOOKS.push(dt=>{for(const w of DWIND)w.grp.rotateZ(w.rate*dt);});
WALK.speed=9;   // a little faster on foot (Travis, round 9); the wheel still scales it
// LEVEL OF DETAIL (core/lod): the windmill sails turn (DWIND), so 97-lod-auto.js leaves them out
window.LOD_OPTIONS=Object.assign(window.LOD_OPTIONS||{},{skipUnder:()=>DWIND.map(w=>w.grp)});
