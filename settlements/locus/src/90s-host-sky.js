/* ============================== HOST: Krator's sky over Locus (and Mungo), the shared sky (W7) ==============================
   W7 (STAGE-8/G-weather.md; core/atmos/SKY-PLAN.md section 9; PLAN-ONMAP.md), 2026-11-24. ATMOS.sky draws the sky as a background
   pass at the page's place on the scale model (LOCUS_SITE, 09-locus-site.js: the map 5.1 pixel; the sky's site frame takes the
   old canvas px, 5.1 less 272, 330), in the site's air (its pressure, humid), with the real sun, giant, ring, moons, station,
   cluster and clouds at the page clock's hour, and sets the sun, the hemisphere, the fog and the exposure from the colour
   script, with its own giantshine light. Made here, after ATMOS.init (90-atmos-host.js). Mungo reads this fragment by name and
   brings its own site record (its pin, 1322, 828).
   THE FAR LAND: the model's own ground, nothing painted (the owner, 2026-11-24: "real terrain only"). Near: the far field
   (76f-locus-far.js: the abyss wall, the lake's far shore, to 42 km); past it, the site's ridge bands (region/site.py): Locus's
   60-160 and 160-450 km, Mungo's 6-30, 30-120 and 120-450 km (it has no far field).
   THE NIGHT: the old page's cool night fill, part of the way (preset.nightFill, as Girder's; the owner: "raise fill partway").
   THE LAKE's skylight (90w-lake.js) captures this sky's scene (skyScene). */
var GSKY_SITE = LOCUS_SITE.site;
var GSKY_CLOCK = { get hour(){ return skyHour(); }, get day(){ return skyDayOfYear() - 80; }, get t(){ return SKY_T; } };
/* the ridge bands, far to near (hazier with distance); forest below 0 m (the abyss floor and the wall's jungle), snow over 4,500 m:
   both as heights over the eye */
var GSKY_RIDGES = (LOCUS_SITE.ridges || []).slice().reverse().map(function(b, i, all){ var eye = GSKY_SITE.base + GSKY_SITE.eye;
  return { profile:b.profile.slice(), dist:b.dist, haze:[.7,.55,.4][i + 3 - all.length] || .5, forestH:0 - eye, snowH:4500 - eye,
           rock:[.50,.44,.38], forest:[.18,.27,.20], snow:[.92,.94,.97] }; });
/* THE CATARACTS past the far field (LOCUS_SITE.cataracts, from the model's river profiles; the owner took "the Bigga's cataract"):
   each a white streak down the far wall from its top to its foot, in the sky behind the ground, so the land in front hides it
   where the model's land does (the Bigga's main fall, 46 km NNE, stands behind the wall's NE limb from the town). The falls
   nearer than the far field's 42 km are on its ground (76f-locus-far.js). At most the sky's six landmarks. */
var GSKY_FALLS = (LOCUS_SITE.cataracts || []).filter(function(c){ return c.dist > 42000; }).slice(0, 6).map(function(c){
  var top = [c.az[0], c.el[1]], foot = [c.az[1], c.el[0]], via = [(c.az[0]+c.az[1])/2, (c.el[0]+c.el[1])/2];
  return { kind:'plume', from:top, via:via, to:foot, width:[.12,.22], lit:[.92,.94,.97], belly:[.70,.74,.78], alpha:.55, haze:.5, drift:.03 }; });
/* the refinery's and the electric town's glow under low cloud at night (Locus only: its REFINERY; LORE.md:181, one of the two
   fully electrified cities): the sky's cloud glow, round the town, orange-white */
var GSKY_GLOW = typeof REFINERY!=='undefined' && REFINERY ? { glow:.35, glowColour:[1,.66,.36], glowLocus:[0, 0, 2600, .1] } : {};
GSKY = ATMOS.sky(ATMOS.skyPreset('standard', { site:{ px:GSKY_SITE.px - 272, py:GSKY_SITE.py - 330 },
  air:{ pressure:SKY.pressureAtm, humidity:.85 }, clouds:Object.assign({ cover:.5 }, GSKY_GLOW), fogDensity:PAL.fogDensity, ridges:GSKY_RIDGES, landmarks:GSKY_FALLS,
  nightFill:{ k:.75, colour:[.337,.416,.549], ground:[.20,.18,.17] } }),   /* the old page's night fill (82-daynight's 0x566a8c) and soil, part of the way */
  { renderer:renderer, camera:camera, scene:scene, sun:sun, hemi:hemiLight, clock:GSKY_CLOCK, fog:true });
var skyScene = GSKY.scene;
updateSky();
