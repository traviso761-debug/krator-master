/* ============================== 18d. YUNI — planting the eastern badlands ==============================
   The order a world follows (BIOME-API.md): its own structures first, then the biome, then one bake. Yuni's own
   planted trees stay Yuni's (60-flora.js: the cypress avenues, the park trees, the olive groves; the mask keeps the
   kit off them); the wild valley is the kit's: the vale and riparian flora of a Zion floor (gambel oak, bigtooth
   maple, cottonwoods, rose weepers, giant umbels, grass and wildflowers), pinyon-juniper on the drier benches, pine
   and then spruce up the Outer Wall Mountains.
   THE BUTTE is dressed as Zion dresses its walls (EBADLANDS.dress): hanging gardens of maidenhair fern with monkeyflower
   and columbine under its ledges, grape curtains, moss streaks and lichen, plants on the ledges. The kit samples the
   butte's shell and never touches it.
   The biome's sun follows the world's sky (SKY_STATE.keyDir), and every biome mesh carries an inspector label with the
   species' tags (flora · climate · aridity · riparian). No rnd() is drawn: the kit keeps its own stream.      */
var YUNI_BADLANDS = null;
(function(){
  if(SHEET) return;
  var t0=performance.now(), out={};
  try{ out.build = EBADLANDS.build({ R:3900, quality: FAST ? 0.5 : 0.9 }); }catch(e){ ERR('badlands build: '+(e&&e.stack||e)); }
  if(butteMesh){
    try{ out.dress = EBADLANDS.dress([butteMesh.geometry], { seed:31, ledges:{ n:300, plants:160, edges:120, hang:7 },
      soffits:{ n:160, hang:6 }, walls:{ n:260, hang:4 } }); }catch(e){ ERR('badlands dress: '+(e&&e.stack||e)); }
  }
  try{ out.bake = BIO.bake(); }catch(e){ ERR('badlands bake: '+(e&&e.stack||e)); }
  /* the inspector: species by name, and the kit-wide tags for the floor and the dressing */
  var TAGBY = {};
  (EBADLANDS.SPECIES||[]).forEach(function(S){ var t=S.tags||{}; TAGBY[S.name] = (t.climate||'temperate')+' · '+(t.aridity||'semiarid')+' · riparian: '+(t.riparian||'no'); });
  (BIO.baked||[]).forEach(function(m){ var lab=m.userData.inspectLabel||'Plant', tg=null;
    for(var k in TAGBY){ if(lab.indexOf(k)>=0 || lab.toLowerCase().indexOf(k.toLowerCase().split(' ')[0])>=0){ tg=TAGBY[k]; break; } }
    m.userData.inspectLabel = lab + ' — flora (eastern badlands biome kit) · ' + (tg || 'temperate · semiarid');
    m.userData.noPickShadow = true; });
  out.ms = Math.round(performance.now()-t0);
  out.counts = EBADLANDS.COUNTS || null;
  out.totals = BIO.totals ? BIO.totals() : null;
  YUNI_BADLANDS = out;
  window._biome = out;
  TICKS.push(function(){ if(BIO.SUN && BIO.SUN.value && typeof SKY_STATE!=='undefined') BIO.SUN.value.copy(SKY_STATE.keyDir).normalize(); });
})();
