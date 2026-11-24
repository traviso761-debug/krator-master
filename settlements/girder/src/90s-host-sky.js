/* ============================== HOST: Krator's sky over Girder, the shared sky (W7) ==============================
   W7 (STAGE-8/G-weather.md; core/atmos/SKY-PLAN.md section 9, "later"), 2026-11-24. ATMOS.sky draws the sky as a
   background pass at Girder's place on the scale model (map 5.1 px 1039, 869, in the iziz-cluster region; the sky's site
   frame takes the old canvas px, 5.1 less 272, 330), with the real sun, the giant, its ring, the moons, the station, the
   cluster and the clouds at the page clock's hour and day (21-sky.js), and sets the sun, the hemisphere, the fog and the
   exposure from the colour script, with its own giantshine light. Made here, after ATMOS.init (90-atmos-host.js).
   The air: the hypertropic lee shore, 1.9 atm and humid (SKY.pressureAtm).
   THE FAR LAND: two low bands of forest all round (the canopy the old dome painted), as ridge profiles.
   THE VOLCANO: the old dome painted the Throne in the north-west. On the model it stands 390 km to the WNW (azimuth 280),
   and at Krator's radius (4,800 km) the horizon there falls about 14 km (with the thick air's refraction): its 10.9 km
   summit is below it. Only the top of its plume shows, low over the WNW horizon, drifting east on the westerlies.
   THE SKYLIGHT: the library materials' reflections capture this sky's scene (moved from 90-atmos-host.js). */
var GSKY_CLOCK = { get hour(){ return skyHour(); }, get day(){ return skyDayOfYear() - 80; }, get t(){ return SKY_T; } };
var GSKY_SITE = { px:1039-272, py:869-330 };
/* the plume's top, 390 km off: a point h km up at d km sits (h - dip)/d radians over the horizon (dip 14 km at 390 km) */
var GSKY_VOLC = (function(){ var d = 390, dip = 14, el = function(h){ return (h - dip)/d*180/Math.PI; };
  return { kind:'plume', from:[280.3, el(17)], via:[282.5, el(27)], to:[296, el(31)], width:[1.2, 4.2],
           lit:[.86,.84,.82], belly:[.46,.46,.50], alpha:.42, haze:.62, drift:.25 }; })();
/* the canopy all round: a near band and a paler one behind it, low (the old dome's two canopy strips) */
var GSKY_RIDGES = [
  { base:0.55, amp:0.35, cycles:18, octaves:3, seed:71, peaks:0, peakAmp:0, win:null, floor:0.15, dist:14000, haze:.55,
    snowH:99999, forestH:99999, rock:[.36,.40,.38], forest:[.23,.36,.34], snow:[.92,.94,.97] },
  { base:0.30, amp:0.30, cycles:34, octaves:3, seed:72, peaks:0, peakAmp:0, win:null, floor:0.05, dist:5000, haze:.35,
    snowH:99999, forestH:99999, rock:[.30,.34,.30], forest:[.14,.26,.23], snow:[.92,.94,.97] } ];
GSKY = ATMOS.sky(ATMOS.skyPreset('standard', { site:GSKY_SITE, air:{ pressure:SKY.pressureAtm, humidity:.8 },
  clouds:{ cover:.45 }, fogDensity:PAL.fogDensity, ridges:GSKY_RIDGES, landmarks:[GSKY_VOLC],
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
