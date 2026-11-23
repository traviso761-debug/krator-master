// ================================================================= GIHON — the ring and the Alph's hamlets on core/hamlet (records)
// [G data] Steps G2-G3 of PLAN.md (sections 4 and 7; the owner, 2026-11-22: "A ring of its own"; 2026-11-17: "at least a few
// hamlets or something along the river going towards theodiga"). Every village is core/hamlet's (KHAMLET.village) on the Xanadu
// row passed by name (core/hamlet/xanadu/23: KHAMLET.xanaduRow, with its orchard and tea foci), laid on the ground GH_GROUND
// gives: Gihon's ring (four farming villages and a ranch, 5-11 km out; on the page's ground where it is the page's, drawn) and
// the Alph's five hamlets between the Lower Lake and Theodiga (on the scale model's ground: records for the open world, not
// drawn here; they stand 30-140 km off). The ids, places and people are the economy's (core/region/data/xan-tune.js T.ghRing and
// T.alph); the node test holds the lists equal.
//   GH_RING.ring, GH_RING.alph     [id, name, px, py, focus, people]
//   GH_RING.make({dims, world, which: 'ring' | 'alph' | 'all'}) -> [{id, name, focus, site, census, records, lanes, ground, ...}]
var GH_RING=(function(){
 const G=GH_GROUND;
 const ring=[['gh.ring.padi','Paḍī (the paddies)',952.6,1608.2,'farming',240],['gh.ring.barli','Bārlī (the barley)',953.6,1609.3,'farming',240],
  ['gh.ring.binz','Bīnz (the beans)',955.4,1610.3,'farming',240],['gh.ring.ots','Ōṭs (the oats)',950.4,1609.1,'farming',240],
  ['gh.ring.bulak','Bulak (the bullocks)',958.2,1609.7,'ranch',145]];
 const alph=[['alph.weyar','Wēyar (the weir)',936.5,1585.5,'farming',240],['alph.medo','Mēḍō (the meadow)',929.5,1573.5,'ranch',145],
  ['alph.gorj','Gōrj-Phuṭ (the gorge\'s foot)',919,1565,'orchard',240],['alph.hil-ti','Hil-Ṭī (the hill tea)',916,1552,'tea',240],
  ['alph.pheri','Phērī (the ferry)',911.5,1541,'farming',240]];
 /* the ground a village may stand on: dry (2 m over the lake, or the river), not steeper than the row's 0.22 */
 const okOn=h=>(x,z)=>{const y=h(x,z);if(y<2)return false;const e=6,gx=(h(x+e,z)-h(x-e,z))/(2*e),gz=(h(x,z+e)-h(x,z-e))/(2*e);return gx*gx+gz*gz<.22*.22;};
 /* a ring village's ground: the page's where the page's near ground reaches, the model's beyond (GH_GROUND.h blends them) */
 function make(o){const out=[],which=o.which||'all',world=o.world==null?41917:o.world,row=KHAMLET.xanaduRow?KHAMLET.xanaduRow({}):'xanadu';
  const go=(list,kind)=>{for(const [id,name,px,py,focus,people] of list){const [x,z]=G.fromPx(px,py),h=kind==='ring'?G.h:G.model;
   /* the ring's lanes join the town's roads toward the centre; the Alph's toward the next one down the valley (the Landing for the first) */
   const link=kind==='ring'?{x:x*.6,z:z*.6}:{x:x+(px<930?1:-1)*1500,z:z+1500};
   const V=KHAMLET.village({id,world,culture:row,focus:focus==='ranch'?'ranch':focus,site:{x,z},link,popMax:Math.min(people,KHAMLET.POP_MAX),dims:o.dims,ground:{ok:okOn(h)}});
   out.push(Object.assign({id,name,focus,people,kind,px,py,ground:kind==='ring'?'page':'model'},V,{records:(V.records||[]).map(r=>Object.assign({},r,{y:h(r.x,r.z)}))}));}};
  if(which!=='alph')go(ring,'ring');if(which!=='ring')go(alph,'alph');return out;}
 return {ring,alph,make,okOn};
})();
