// ================================================================= CORE — hazards of a bore: rockburst, inrush, seal  [G data]
// openworld/ANCIENT-TUNNELS.md section 4 owed three hazards a bore has and no kind covered; biomes/line/PLAN.md section 6 (the owner, 2026-11-11:
// "add all three", opt-in). OPT-IN BY INCLUSION: a page that lists this file gets them; a page that does not is unchanged (no vocabulary is
// edited: each is a preset on a kind core/tags already has, with a cycle or a state function, so KHAZ.make checks it like any record).
// Needs core/hazard/20-core-hazard.js (KHAZ) loaded first.
//
//   KHAZ.rockburst(o) -> tags.hazard   the deep stretch spalls: a `crush` on a cycle. o: {period (s, 900), warn (s, 8: the rock's
//                                      ticking and dust, the tell), on (s, 3: the burst), after (s, 20: settling spall, afterK .25),
//                                      shape ({type:'box', w, h, d}: the stretch of lining that bursts), offset (s: an authored phase), seed}
//   KHAZ.inrush(o) -> tags.hazard      karst water breaks in on a cycle: a `drown` that starts with a surge. o: {period (s, 3600), warn (s, 30:
//                                      the roar, the water rising at the drains), ramp (s, 60: the gallery filling), on (s, 600: flooded),
//                                      after (s, 900: draining, afterK .4), base (0: dry between), shape, offset, seed}
//   KHAZ.seal(o) -> tags.hazard        a sealed section turns airless when its door fails: a `gas` (suffocate) whose state is its door's.
//                                      o: {door (the door record's id), shape (the section), danger (1)}. The state function
//                                      'KHAZ.seal' reads KHAZ.sealed[door]: true (sealed: harmless, k 0) or false (failed: k 1). A page
//                                      sets KHAZ.setSeal(door, sealed) when its door opens or breaks (core/door's record, or a timetable)
//
// Each returns a plain tags.hazard object (made through KHAZ.make, so it is checked and filled); a page registers it on a core/tags record
// before it is drawn, like any hazard. KHAZ.export carries them as their kinds; Godot reads them as such (core/hazard/GODOT.md).
(function(root){
  'use strict';
  var K=root.KHAZ;if(!K)throw new Error('core/hazard/22-core-hazard-bore.js: load core/hazard/20-core-hazard.js first');
  var d=function(x,v){return x==null?v:x;};
  var box=function(s){return s?JSON.parse(JSON.stringify(s)):{type:'box',w:20,h:12,d:40};};
  K.rockburst=function(o){o=o||{};
    return K.make({kind:'crush',effect:'bleed',danger:d(o.danger,1),shape:box(o.shape),falloff:'none',
      cycle:{period:d(o.period,900),warn:d(o.warn,8),ramp:.5,on:d(o.on,3),after:d(o.after,20),afterK:d(o.afterK,.25),offset:o.offset},
      tell:{colour:'#9a8f80',fx:'dust',sound:'tick',sign:'rockburst: the lining ticks and dusts before it bursts'},seed:o.seed==null?null:o.seed});};
  K.inrush=function(o){o=o||{};
    return K.make({kind:'drown',effect:'drown',danger:d(o.danger,.9),shape:box(o.shape),falloff:'none',
      cycle:{period:d(o.period,3600),warn:d(o.warn,30),ramp:d(o.ramp,60),on:d(o.on,600),after:d(o.after,900),afterK:d(o.afterK,.4),base:d(o.base,0),offset:o.offset},
      tell:{colour:'#2a5aa0',fx:'surge',sound:'roar',sign:'inrush: the drains back up and roar before the water comes'},seed:o.seed==null?null:o.seed});};
  /* a seal: sealed doors (KHAZ.sealed[door] true, the default) keep the section breathable; a failed one makes it airless */
  K.sealed=K.sealed||{};
  K.setSeal=function(door,sealed){K.sealed[door]=sealed!==false;return K.sealed[door];};
  /* the door is read off the raw record (KHAZ.of fills a copy and keeps only the hazard's own fields) */
  K.STATES['KHAZ.seal']=function(rec,h,t){var raw=rec&&rec.tags&&rec.tags.hazard,S=(raw&&raw.seal)||h.seal,door=S&&S.door,ok=door==null?true:K.sealed[door]!==false;
    return ok?{state:'sealed',k:0,on:false}:{state:'airless',k:1,on:true};};
  K.seal=function(o){o=o||{};if(!o.door)throw new Error('KHAZ.seal: o.door (the door record\'s id) required');
    var h=K.make({kind:'gas',effect:'suffocate',danger:d(o.danger,1),dose:d(o.dose,1),shape:box(o.shape),falloff:'none',stateFn:'KHAZ.seal',
      tell:{colour:'#b8c0d0',fx:'frost',sound:'hiss',sign:'seal: past this door the air is thin or gone if the door fails'}});
    h.seal={door:o.door};return h;};
})(typeof globalThis!=='undefined'?globalThis:this);
