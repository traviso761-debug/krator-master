// ================================================================= KIRSTABAL — the ring and the lake's villages on core/hamlet (records)
// [G data] Step K4 of PLAN.md (sections 2 and 2a; the owner, 2026-11-16: "it has its own, smaller atitlan-like hinterland",
// "villages sound fine", "Landing belongs to Scarp province"). Every village is core/hamlet's (KHAMLET.village) on the Xanadu
// row, laid on the ground KS_GROUND gives: Kirstabal's ring of three farming villages and a ranch on the floor south of the
// town (on the page's own ground, drawn), and the Lower Xanadu Lake's nine villages round its shore (on the scale model's
// ground: records for the open world, step K6, not drawn here; they stand 25 to 115 km off). The ids, places and people
// are the economy's (core/region/data/xan-tune.js T.ksRing and T.lowerLake); the node test holds the two lists equal.
//   KS_RING.ring, KS_RING.lake        [id, name, px, py, focus, people]
//   KS_RING.make({dims, world, which}) -> [{id, name, focus, site, census, records, lanes, green, error?, ground}]
var KS_RING=(function(){
 const G=KS_GROUND;
 const ring=[['ks.ring.mil','Mil (the mill)',987.5,1601.8,'farming',240],['ks.ring.kanal','Kanāl (the canal)',986.5,1603,'farming',240],
  ['ks.ring.grenz','Grēnz (the grain)',988.8,1602.6,'farming',240],['ks.ring.baiyar','Bāiyar (the byre)',985.5,1604.5,'ranch',145]];
 /* the lake's villages fish, but core/hamlet's Xanadu row has no fishing works yet (no focusJobs, no boat sheds or landing: owed
    in the row, KNOWN_ISSUES.md), so each lays out as a farming village: the terraces above the shore every lake village works
    (XAN_TUNE.lakeTerraces). core/hamlet lays at most 500 (KHAMLET.POP_MAX): a bigger village is laid as its first 500 */
 const lake=[['ll.sekrid','Sekriḍ',986,1588,'farming',800],['ll.phishari','Phisharī',975,1587,'farming',1400],['ll.kako-bagh','Kāko-Bāgh',963,1586,'farming',1200],
  ['ll.rid','Rīḍ',948,1589,'farming',700],['ll.landing','The Landing',932,1600,'farming',600],['ll.timbar','Ṭimbar',938,1606,'farming',700],
  ['ll.opal-mouth','Ōpal-Māuṭh',955,1607,'farming',1200],['ll.rais-teras','Rāis-Ṭeras',967,1606,'farming',1000],['ll.kattal','Kaṭal',979,1605,'farming',700]];
 /* the ground a village may stand on: dry (2 m above the lake), not steeper than the row's 0.22; the ring's on the page's ground,
    the lake's on the model's */
 const okOn=h=>(x,z)=>{const y=h(x,z);if(y<2)return false;const e=6,gx=(h(x+e,z)-h(x-e,z))/(2*e),gz=(h(x,z+e)-h(x,z-e))/(2*e);return gx*gx+gz*gz<.22*.22;};
 /* a lake village's site: from its model cell toward the lake's water, the last dry cell before it (the model's shore cell) */
 const shoreSite=(x,z)=>{if(G.model(x,z)>2)return [x,z];for(let r=200;r<8000;r+=200)for(let a=0;a<16;a++){const t=a/16*Math.PI*2,p=[x+r*Math.cos(t),z+r*Math.sin(t)];
  if(G.model(p[0],p[1])>3)return p;}return [x,z];};
 function make(o){const out=[],which=o.which||'all',world=o.world==null?41617:o.world;
  const go=(list,kind)=>{for(const [id,name,px,py,focus,people] of list){let [x,z]=G.fromPx(px,py);const h=kind==='ring'?G.h:G.model;
   if(kind==='lake')[x,z]=shoreSite(x,z);
   const V=KHAMLET.village({id,world,culture:'xanadu',focus,site:{x,z},link:kind==='ring'?{x:0,z:0}:{x:x+(962.5-px)*400,z:z+(1597-py)*400},
    popMax:Math.min(people,KHAMLET.POP_MAX),dims:o.dims,ground:{ok:okOn(h)}});
   out.push(Object.assign({id,name,focus,people,kind,px,py,ground:kind==='ring'?'page':'model'},V,{records:(V.records||[]).map(r=>Object.assign({},r,{y:h(r.x,r.z)}))}));}};
  if(which!=='lake')go(ring,'ring');if(which!=='ring')go(lake,'lake');return out;}
 return {ring,lake,make};
})();
