/* ============================== THE BASIN'S AIR AND WEATHER, AND THE REFINERY'S SMOKE (W7) ==============================
   PLAN-ONMAP.md items 4-6 (the owner, 2026-11-24: every addition). After the shared sky (90s-host-sky.js). Mungo reads this
   fragment by name: its air and weather are the same basin's; the refinery is Locus's alone (REFINERY, 30-layout.js).
   THE WEATHER (core/atmos/host/89-atmos-e-weatherhost.js, W5's cells): the abyss's wet climate (XA, 3,827 mm: LOCUS_SITE.site),
     its rain and storms, the moving cells drifting over the basin (cells: the crops kit's eastabyss axes when the page has them),
     the ground wetting under them. It starts clear (verify's views stay as they were); the Weather selector picks 'live'.
   THE MIST (eastabyss's, biomes/eastabyss/src/89a-host-atmos.js): the air's height fog, long in ~2 atm; the dawn mist pooled over
     the lake, the delta and the marsh (below 6 m); the fog belt on the wall's foot (150-480 m on the lifted edge, 10-core.js
     wallLift), thicker where the lake's wind climbs it (from the west).
   THE NIGHT WIND (core/atmos/fx/89-atmos-fx-slopewind.js): the cold air off the wall drains onto the floor by night, the slopes
     draw it up by day; bound to the module's wind, so the foliage and the smoke lean with it.
   THE RAIN'S COVER and its splashes (core/atmos/fx/89-atmos-fx-raincover.js): no rain under the roofs and the crowns.
   THE REFINERY (kits/locus 64-locus-petroleum.js: the guyed flare in the yard's back corner, 22 m; the fired heater's stack):
     the flare's flame and its smoke, the stack's soot bent downwind (core/atmos/fx/89-atmos-fx-plumes.js); their glow under low
     cloud at night rides the sky's cloud glow (90s-host-sky.js). */
var LOCUS_AIR = (function(){
  if(SHEET) return null;
  var out = {}, Q = new URLSearchParams(location.search);
  if(ATMOS.bindWeather){
    out.W = ATMOS.bindWeather({ climate:{ wet:true }, sun:sun, hemi:hemiLight, grounds:[terrMat],
      cells: typeof CROPS!=='undefined' ? { biome:'eastabyss' } : true });
  }
  if(ATMOS.heightFog && Q.get('hfog')!=='0'){
    ATMOS.heightFog({ falloff:1/900, sun:.35, sky:.35, mist:{ density:.0016, y:6, depth:12, noise:.7 } });
    if(ATMOS.fogBelt && Q.get('belt')!=='0' && typeof wallLift==='function')
      out.belt = ATMOS.fogBelt({ y0:150, y1:480, windward:[-1,0], density:.0011, depth:40, lee:.3, rise:.5,
        extent:[-HW*1.05, -HW*1.05, HW*1.05, HW*1.05], res:128, steps:8 });
    ATMOS.heightFogScene(scene);
  }
  if(ATMOS.slopeWind && Q.get('slope')!=='0'){
    out.slope = ATMOS.slopeWind({ ground:function(x,z){ return terrainH(x,z); }, box:[-HW, -HW, HW, HW], cell:60, world:'locus' });
    out.slope.bake(); out.slope.attach(ATMOS, function(){ return skyHour(); });
  }
  if(ATMOS.rainCover) out.cover = ATMOS.rainCover({ renderer:renderer });
  /* the refinery's smoke: the still-house's frame (30-layout.js schedule: at REFINERY.x, z, unturned) */
  if(ATMOS.plumes && typeof REFINERY!=='undefined' && REFINERY && Q.get('plumes')!=='0'){
    var rx = REFINERY.x == null ? -36 : REFINERY.x, rz = REFINERY.z == null ? 2 : REFINERY.z;
    var at = function(lx, ly, lz){ var x = rx + lx, z = rz + lz; return [x, terrainH(x, z) + ly, z]; };
    out.plumes = ATMOS.plumes([
      { kind:'flare', at:at(29.2, 23.2, -21.6), id:'locus-flare' },                         /* the flare stack's flame */
      { kind:'stack', at:at(29.2, 25.0, -21.6), r:.6, rise:40, id:'locus-flare-smoke' },    /* the little black smoke over it */
      { kind:'stack', at:at(10.5, 14.0, -15.0), r:.8, rise:70, id:'locus-heater' }          /* the fired heater's stack */
    ], { seed:4417, reach:12000 });
  }
  return out;
})();
