/* ============================== CORE TAGS: YS'S REG ==============================
   Ys's registry (REG: every REGISTER, the Hykkousoi kit's, the hosts', the ruins', the foreign quarter's and the biome's
   volumes) as core/tags records, so core/host's inspector and minimap read what the page places (core/host/README.md;
   ROADMAP.md section 10, step 5). Built once the world is built and before the take (99-start.js), as Iziz's
   91t-iziz-tags.js does. REG keeps working as it does (the labels, the probe, verify.py and the city's editor read it);
   core/tags reads it. The city's editor adds and removes buildings live after this: those are not records (KNOWN_ISSUES.md).
     cls building        building
     cls host            building, kind 'host' (an Ancient stump or tower the Hykkousoi grow pods on)
     cls ruin            building, state ruined, kind 'ruin'
     cls flora           flora; the kind is the plant's name (the biome's trees)
   Ys's spellings onto the vocabulary (core/tags/README.md: a build that adopts core/tags reads zero unknowns):
     culture   republic -> republican; historians -> order (the Historians' chapterhouse is the Order's: its kit is
               yuni-order); wild (the biome's) -> no culture
     types     industrial -> industry; flora (the biome's) -> none
     wealth    none (the biome's) -> no wealth
     decay     0 intact, 1 ruined, 2 toppled, 3 reclaimed (lived in again), 4 rehab (the Projects, reoccupied whole):
               the Ancients kit's levels (kits/ancients/API.md), as state
     kit       style (the foreign quarter's kit: voth, yuni-order, iziz-vernacular, highlands); foreign -> district 'foreign'
     host, ruin  the host's or ruin's own name: the record's note
   A record keeps REG's r and h (a round footprint), its key and name. YS_REG_ID (a Map) gives each REG entry's record id. */
const YS_REG_ID=new Map();
(function(){
 const T=KTAGS.page=KTAGS.create({build:'ys/'+TITLE});
 const CULTURE={republic:'republican',historians:'order',wild:null};
 const TYPE={industrial:'industry',flora:null};
 const DECAY=['intact','ruined','toppled','reclaimed','rehab'];
 for(const r of REG){
  const t=Object.assign({},r.tags||{}),notes=[];let cls=r.cls||'building',kind=r.key||null;
  if(t.culture in CULTURE){if(CULTURE[t.culture])t.culture=CULTURE[t.culture];else delete t.culture;}
  if(t.type!=null){t.type=[].concat(t.type).map(y=>y in TYPE?TYPE[y]:y).filter(Boolean);if(!t.type.length)delete t.type;}
  if(t.wealth==='none')delete t.wealth;
  if(t.decay!=null){t.state=t.state||DECAY[t.decay]||null;if(!t.state)delete t.state;}delete t.decay;
  if(t.kit!=null){t.style=t.style||t.kit;delete t.kit;}
  if(t.foreign){t.district='foreign';}delete t.foreign;
  if(t.host!=null){notes.push('host: '+t.host);delete t.host;}
  if(t.ruin!=null){notes.push('ruin: '+t.ruin);delete t.ruin;}
  if(cls==='host'){cls='building';kind='host';}
  else if(cls==='ruin'){cls='building';kind='ruin';t.state='ruined';}
  else if(cls==='flora'){kind=String(r.name||'plant').toLowerCase();}
  const rec=T.add({'class':cls,kind,key:r.key||null,name:r.name||null,at:[r.x,r.y||0,r.z],r:r.r,h:r.h,tags:t,note:notes.length?notes.join('; '):null,frag:'91t-ys-tags.js'});
  YS_REG_ID.set(r,rec.id);
 }
})();
