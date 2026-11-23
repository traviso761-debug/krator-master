/* ============================== M1 MATERIAL CLASSES (core/materials/classes) ==============================
   settlements/xanadu/STACK-PLAN.md section 5; GRAPHICS-TERRAIN-PROPOSAL.md M1; STAGE-5-REPORT.md section 4.
   [G data]: plain functions on the class table (m1-classes.json) and a build's materials.json. No THREE, no DOM, no fs:
   the caller hands in the table and the library records.

   A family's class says how Stage 8 packs it: glazed (8-bit normals on the web), relief (height, POM where hero, cavity),
   flat (Gate 1 demands no height range), card (alpha cut-out, never a height in its alpha). Today's pack.py ignores the
   field (tools/textures/mclass.py proves it by code; test-class.js runs the proof).

     var C = KMAT_CLASS.make(table)
     C.settings(fc)            -> {cls, flat, web, godot, height, pom, cavity} for one family's materials.json entry (throws)
     C.roughness(rec, fc)      -> the record's roughness lifted by the family's roughLift (as pack.py lifts the map)
     C.ruleGlazed(rec, fc)     -> the stack's rule: lit, specular >= specularMin, roughness < roughnessMax
     C.check(cfg, libs, meas)  -> {errors, byName, ruleOnly, counts}: libs maps a library id to
                                  {kind, roughness, specular, normal} (null when its meta.json is not there); meas (optional)
                                  maps a family to {roughMean}, its packed roughness map's mean (m1-measured.json)
     C.derive(fc, rec, m)      -> the class the values give (Fixes after XS0): 'card' (a library card), 'cutout' (drawn
                                  with alphaTest: fc.cutout), 'glazed' (the rule, on the packed roughness when measured),
                                  'flat' (a patterns/ sheet or a mapOnly sheet the rule does not take), else 'relief|flat'
                                  (the values do not separate the two: either is accepted)
     C.drift(build, cfg, libs, meas) -> {wrong: [...], excepted: [...], stale: [...]}: every family whose class disagrees
                                  with derive(), those the table's exceptions declare (by build), and exceptions that no
                                  longer differ from the rule or name another class than the materials.json
*/
var KMAT_CLASS = (function(){
  'use strict';

  function make(table){
    if(!table || !table.classes || !table.rule) throw new Error('KMAT_CLASS.make: a class table {rule, classes} is needed');
    var R = table.rule, CL = table.classes;

    function settings(fc){
      var c = fc && fc['class'];
      if(c == null) throw new Error('KMAT_CLASS: the family has no class');
      var d = CL[c];
      if(!d) throw new Error('KMAT_CLASS: unknown class ' + c + ' (one of ' + Object.keys(CL).join(', ') + ')');
      return { cls: c, flat: !!d.flat, web: d.web, godot: d.godot, height: d.height, pom: d.pom, cavity: d.cavity };
    }

    function roughness(rec, fc, m){
      if(m && m.roughMean != null) return m.roughMean;   /* the packed map's mean: what the page draws */
      var r = rec.roughness == null ? 1 : rec.roughness;
      var lift = fc && fc.roughLift != null ? fc.roughLift : 0;
      return r + (1 - r) * lift;
    }

    function lit(rec, fc){ return !!rec && !!rec.normal && rec.kind !== 'card' && !(fc && (fc.mapOnly || fc.card)); }

    function ruleGlazed(rec, fc, m){
      if(!lit(rec, fc)) return false;
      var sp = fc && fc.specular != null ? fc.specular : (rec.specular == null ? R.specularDefault : rec.specular);
      return sp >= R.specularMin && roughness(rec, fc, m) < R.roughnessMax;
    }

    function derive(fc, rec, m){
      if(!rec) return null;
      if(rec.kind === 'card' || fc.card) return 'card';
      if(fc.cutout) return 'cutout';
      if(ruleGlazed(rec, fc, m)) return 'glazed';
      if(fc.mapOnly || /^patterns\//.test(fc.lib)) return 'flat';
      return 'relief|flat';
    }
    function agrees(d, c){ return d === c || (d === 'relief|flat' && (c === 'relief' || c === 'flat')); }

    function drift(build, cfg, libs, meas){
      var out = { wrong: [], excepted: [], stale: [] };
      var EX = (table.exceptions && table.exceptions[build]) || {};
      var fams = (cfg && cfg.families) || {};
      Object.keys(fams).sort().forEach(function(f){
        var fc = fams[f], rec = libs[fc.lib], d = derive(fc, rec, meas && meas[f]), ex = EX[f];
        if(d == null) return;   /* the set is not there (an optional family not delivered): check() says so */
        var ok = agrees(d, fc['class']);
        if(ex){
          if(ex['class'] !== fc['class']) out.stale.push(f + ': the exception keeps ' + ex['class'] + ', the materials.json says ' + fc['class']);
          else if(ok) out.stale.push(f + ': excepted as ' + ex['class'] + ', but the values now give it (drop the exception)');
          else out.excepted.push(f);
          return;
        }
        if(!ok) out.wrong.push(f + ': classed ' + fc['class'] + ', the values give ' + d);
      });
      Object.keys(EX).forEach(function(f){ if(!fams[f]) out.stale.push(f + ': an exception for a family the materials.json lacks'); });
      return out;
    }

    function check(cfg, libs, meas){
      var out = { errors: [], byName: [], ruleOnly: [], counts: {} };
      Object.keys(CL).forEach(function(k){ out.counts[k] = 0; });
      var fams = (cfg && cfg.families) || {};
      Object.keys(fams).sort().forEach(function(f){
        var fc = fams[f], c = fc['class'], rec = libs[fc.lib];
        if(c == null){ out.errors.push(f + ': no class'); return; }
        if(!CL[c]){ out.errors.push(f + ': unknown class ' + c); return; }
        out.counts[c]++;
        if(rec == null){ if(!fc.optional) out.errors.push(f + ': library set ' + fc.lib + ' is not there'); return; }
        var isCard = rec.kind === 'card' || !!fc.card;
        if(isCard && c !== 'card') out.errors.push(f + ': ' + fc.lib + ' is a cut-out card, classed ' + c);
        if(!isCard && c === 'card') out.errors.push(f + ': classed card, but ' + fc.lib + ' is not a cut-out');
        if(!isCard && !!fc.cutout !== (c === 'cutout')) out.errors.push(f + (fc.cutout ? ': drawn as a cut-out (cutout: true), classed ' + c : ': classed cutout without "cutout": true'));
        if((c === 'card' || c === 'cutout') && fc.height) out.errors.push(f + ': a height in a cut-out\'s alpha (Gate 1)');
        if(c === 'glazed' && !lit(rec, fc)) out.errors.push(f + ': classed glazed without a lit normal to promote (mapOnly, a card, or no normal map)');
        var rule = ruleGlazed(rec, fc, meas && meas[f]);
        if(c === 'glazed' && !rule) out.byName.push(f);
        if(c !== 'glazed' && rule) out.ruleOnly.push(f);
      });
      return out;
    }

    return { version: 2, settings: settings, roughness: roughness, ruleGlazed: ruleGlazed, check: check, derive: derive,
      drift: drift, classes: Object.keys(CL) };
  }

  return { make: make };
})();
if(typeof module !== 'undefined' && module.exports) module.exports = KMAT_CLASS;
