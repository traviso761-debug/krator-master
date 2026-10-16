// ================================================================= HOST — the page's core/tags registry (KTAGS.page)
// What Shade places, as core/tags records (core/tags/README.md), read once the world is built (88) and before the take
// (99-shade-take.js): core/host's inspector, minimap and marks read KTAGS.page. REG keeps working as it did (the probe
// counts it); this reads it. Shade's own spellings, mapped here (core/tags is not edited):
//   REG cls building        building, kind its family; culture 'eastern-nomad' is the vocabulary's 'nomad'; types the
//                           list; its place id as `district` (the vocabulary's `place` is an alias of `setting`)
//   REG cls flora           a tree (the biome's BIO.register) is flora, kind 'tree', key and tags its species' (SEDESERT);
//                           the fauna pass's volumes ('Kite thermal', 'Sand striders') are life
//   REG cls water, carve    feature, kind water | carve; their measures (depth_m, ceiling_m...) go in the note
//   PLACES                  feature, kind 'place', a box round the polygon (h 8 m, from its lowest corner); the life
//                           layer's activities and capacity in the note
const SHADE_TAG_ID=new Map();
(function(){
 const T=KTAGS.page=KTAGS.create({build:'shade'});
 const CULT=c=>c==='eastern-nomad'?'nomad':c;
 const list=t=>t==null?null:[].concat(typeof t==='string'?t.split(/\s*,\s*/):t);
 const measures=t=>{const o=[];for(const k in t||{})if(k!=='kind')o.push(k+' '+t[k]);return o.join(' · ')||null;};
 const clean=t=>{const o={};for(const k in t)if(t[k]!=null)o[k]=t[k];return o;};   // no key without a value
 const LIFE_NAMES={'Kite thermal':'kite','Sand striders':'strider'};
 const SP={};(SEDESERT.SPECIES||[]).forEach(s=>SP[s.name]=s);
 for(const r of REG){
  const t=r.tags||{};let rec;
  if(r.cls==='building')
   rec=T.add({'class':'building',kind:t.family||null,key:r.id||null,name:r.name,at:[r.x,r.y==null?0:r.y,r.z],r:r.r,h:r.h,
    tags:clean({culture:CULT(t.culture),types:list(t.types),family:t.family,district:t.place}),frag:'80-host-buildings.js'});
  else if(r.cls==='water'||r.cls==='carve')
   rec=T.add({'class':'feature',kind:r.cls,key:r.cls==='carve'?(t.kind||null):null,name:r.name,at:[r.x,r.y==null?0:r.y,r.z],r:r.r,h:r.h,
    note:measures(t),frag:'45-host-stage.js'});
  else if(LIFE_NAMES[r.name])
   rec=T.add({'class':'life',kind:LIFE_NAMES[r.name],name:r.name,at:[r.x,r.y==null?0:r.y,r.z],r:r.r,h:r.h,tags:{biome:'sedesert'},frag:'75-biome-sedesert-fauna.js'});
  else{const S=SP[r.name],st=S&&S.tags?S.tags:{};
   rec=T.add({'class':'flora',kind:'tree',key:S?S.key:null,name:r.name,at:[r.x,r.y==null?0:r.y,r.z],r:r.r,h:r.h,
    tags:clean({biome:'sedesert',climate:st.climate,aridity:st.aridity,riparian:st.riparian,abyssal:st.abyssal,harvest:st.harvest}),frag:'55-biome-sedesert-trees.js'});}
  SHADE_TAG_ID.set(r,rec.id);}
 for(const p of PLACES){
  const xs=p.poly.map(q=>q[0]),zs=p.poly.map(q=>q[1]),x0=Math.min(...xs),x1=Math.max(...xs),z0=Math.min(...zs),z1=Math.max(...zs);
  const y=Math.min(...p.poly.map(q=>terrainH(q[0],q[1])),terrainH((x0+x1)/2,(z0+z1)/2))-1,t=p.tags||{};
  T.add({'class':'feature',kind:'place',key:p.id,name:p.name,at:[(x0+x1)/2,y,(z0+z1)/2],size:[x1-x0,z1-z0,8],
   tags:clean({culture:CULT(t.culture),types:list(t.types)}),note:p.kind+' · '+p.activities.join(', ').toLowerCase()+' · up to '+p.capacity+' people',frag:'44-host-layout.js'});}
})();
