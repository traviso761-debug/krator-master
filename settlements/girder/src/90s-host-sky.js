/* ============================== HOST: Krator's sky over Girder, the shared sky (W7) ==============================
   W7 (STAGE-8/G-weather.md; core/atmos/SKY-PLAN.md section 9, "later"), 2026-11-24. ATMOS.sky draws the sky as a
   background pass at Girder's place on the scale model (map 5.1 px 1039, 869, in the iziz-cluster region; the sky's site
   frame takes the old canvas px, 5.1 less 272, 330), with the real sun, the giant, its ring, the moons, the station, the
   cluster and the clouds at the page clock's hour and day (21-sky.js), and sets the sun, the hemisphere, the fog and the
   exposure from the colour script, with its own giantshine light. Made here, after ATMOS.init (90-atmos-host.js).
   The air: the hypertropic lee shore, 1.9 atm and humid (SKY.pressureAtm).
   THE FAR LAND: the scale model's own ground round Girder, nothing painted (the owner, 2026-11-24: "no painted volcano, real
   terrain only"): region/far.py casts three bands (4-20, 20-80 and 80-450 km) of the model's ground or water surface at 1024
   azimuths from the eye, with the planet's curve, embedded as GIRDER_FAR (89r-host-far.js). Girder sits at -1,386 m in its
   basin: the near bands lie about the horizon, the far one rises to 1.75 deg in the ENE. The Throne (390 km WNW, the old
   dome's painted volcano) is below the horizon on the model, so it is not in Girder's sky.
   THE SKYLIGHT: the library materials' reflections capture this sky's scene (moved from 90-atmos-host.js). */
var GSKY_CLOCK = { get hour(){ return skyHour(); }, get day(){ return skyDayOfYear() - 80; }, get t(){ return SKY_T; } };
var GSKY_SITE = { px:1039-272, py:869-330 };
/* the far land's bands, far to near (hazier with distance); forest below the hyperjungle's treeline (3,000 m), snow over 4,500 m:
   both as heights over the eye (Girder's eye stands at -1,356 m) */
var GSKY_RIDGES = GIRDER_FAR.ridges.slice().reverse().map(function(b, i){ var eye = GIRDER_FAR.site.base + GIRDER_FAR.site.eye;
  return { profile:b.profile.slice(), dist:b.dist, haze:[.7,.55,.4][i], forestH:3000 - eye, snowH:4500 - eye,
           rock:[.44,.42,.40], forest:[.18,.29,.25], snow:[.92,.94,.97] }; });
GSKY = ATMOS.sky(ATMOS.skyPreset('standard', { site:GSKY_SITE, air:{ pressure:SKY.pressureAtm, humidity:.8 },
  clouds:{ cover:.45 }, fogDensity:PAL.fogDensity, ridges:GSKY_RIDGES,
  nightFill:{ k:.75, colour:[.365,.443,.580], ground:[.22,.19,.18] } }),   /* the owner (2026-11-24): "raise fill partway": toward the old page's cool night fill and warm soil (about 60% of it), the giantshine key kept */
  { renderer:renderer, camera:camera, scene:scene, sun:sun, hemi:hemiLight, clock:GSKY_CLOCK, fog:true });
var skyScene = GSKY.scene;
updateSky();
/* the clouds' shadows and the rain's darkening on what the build made (SKY-PLAN.md 11.1), as swbay does: every lit
   material once; skinned and animated ones are left out (their place comes from their own pose) */
(function(){ var seen = new Set(); scene.traverse(function(o){ if(!o.isMesh || !o.material || o.isSkinnedMesh) return;
  (Array.isArray(o.material) ? o.material : [o.material]).forEach(function(m){
    if(seen.has(m) || !(m.isMeshLambertMaterial || m.isMeshStandardMaterial || m.isMeshPhongMaterial)) return; seen.add(m);
    ATMOS.cloudShade(m, { porosity:.6 }); }); }); })();
/* the library materials reflect this sky (core/atmos 89-atmos-b-skylight.js): the capture's lower half is the
   hemisphere's ground colour at its strength; it recaptures as the hour moves and as the eclipse or the air changes */
var ATMOS_GROUND_COL = new THREE.Color();
ATMOS.skylight({ renderer: renderer, sky: skyScene, scene: scene,
  ground: function(){ return ATMOS_GROUND_COL.copy(hemiLight.groundColor).multiplyScalar(hemiLight.intensity); },
  key: function(){ return Math.round(SKY_STATE.ecl*20) + '|' + SKY.pressureAtm + '|' + Math.round(skyHour()*4); } });
