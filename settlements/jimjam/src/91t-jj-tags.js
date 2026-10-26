/* ============================== CORE TAGS: JIMJAM'S REG ==============================
   The sheet's registry (REG: every jjReg in 61-jj-helpers.js and the accessories' placer) as core/tags records, so core/host's
   inspector and minimap read what the sheet places (core/host/README.md; ROADMAP.md section 10, step 5). Built once the world
   is built and before the take (99-start.js), as Iziz's 91t-iziz-tags.js does. REG keeps working as it does (the labels, the
   probe and verify.py read it); core/tags reads it.
     cls building      building (a part keeps its part tag: dome, stair, court...)
     cls furniture     by its type: statue a landmark, fountain and pool a feature, else a prop; the kind is the type
     cls flora         flora; the kind is the type (the two placeholder plants)
   Jimjam's own spellings onto the vocabulary (core/tags/README.md: a build that adopts core/tags reads zero unknowns):
     culture 'jimjam'  is a vocabulary culture since 2026-10-20 (core/tags VOCAB.noCatalog: no catalog furniture set): kept as given
     a furniture or plant's type (bench, palm...)        its kind, not a type
     harvestable / edible false                          harvest {wood: false, edible: [], medicinal: false}
     animated true                                       the record's note ('animated': the windmill's sails)
   A record keeps REG's r and h (a round footprint), its key and name. JJ_REG_ID (a Map) gives each REG entry's record id. */
const JJ_REG_ID=new Map();
(function(){
 const T=KTAGS.page=KTAGS.create({build:'jimjam/kit'});
 const FURN_CLASS={statue:'landmark',fountain:'feature',pool:'feature'};
 for(const r of REG){
  const t=Object.assign({},r.tags||{});let cls=r.cls||'building',kind=r.key||null,note=null;
  if(t.harvestable!==undefined||t.edible!==undefined){t.harvest={wood:!!t.harvestable,edible:t.edible?[].concat(t.edible):[],medicinal:false};delete t.harvestable;delete t.edible;}
  if(t.animated){note='animated';}delete t.animated;
  if(cls==='furniture'||cls==='flora'){const ty=[].concat(t.type||[]);delete t.type;kind=ty[0]||kind;if(cls==='furniture')cls=FURN_CLASS[kind]||'prop';}
  const rec=T.add({'class':cls,kind,key:r.key||null,name:r.name||null,at:[r.x,r.y||0,r.z],r:r.r,h:r.h,tags:t,note,frag:'91t-jj-tags.js'});
  JJ_REG_ID.set(r,rec.id);
 }
})();
