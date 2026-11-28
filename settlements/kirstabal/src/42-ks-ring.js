// ================================================================= KIRSTABAL — the ring and the lake's villages on core/hamlet (records)
// [G data] Step K4 of PLAN.md (sections 2 and 2a; the owner, 2026-11-16: "it has its own, smaller atitlan-like hinterland",
// "villages sound fine", "Landing belongs to Scarp province"). Every village is core/hamlet's (KHAMLET.village) on the Xanadu
// row, laid on the ground KS_GROUND gives: Kirstabal's ring of three farming villages and a ranch on the floor south of the
// town (on the page's own ground, drawn), and the Lower Xanadu Lake's nine villages round its shore (on the scale model's
// ground: records for the open world, step K6, not drawn here; they stand 25 to 115 km off). The lake's villages fish: boat sheds,
// fish racks and a quay at the shore, on core/hamlet's Xanadu row with its fishing works (the row's own). The ids, places and people
// are the economy's (core/region/data/xan-tune.js T.ksRing and T.lowerLake); the node test holds the two lists equal.
//   KS_RING.ring, KS_RING.lake        [id, name, px, py, focus, people]
//   KS_RING.make({dims, world, which}) -> [{id, name, focus, site, census, records, lanes, green, error?, ground}]
var KS_RING=(function(){
 const G=KS_GROUND;
 const ring=[['ks.ring.mil','Mil (the mill)',987.5,1601.8,'farming',240],['ks.ring.kanal','Kanāl (the canal)',986.5,1603,'farming',240],
  ['ks.ring.grenz','Grēnz (the grain)',988.8,1602.6,'farming',240],['ks.ring.baiyar','Bāiyar (the byre)',985.5,1604.5,'ranch',145]];
 /* THE LAKE'S VILLAGES FISH (the owner, 2026-11-16: "work on fishing villages"): seven fishing villages and the Landing (the
    barges' stop, its own quay: no dugouts, as in the tune). core/hamlet lays at most 500 (KHAMLET.POP_MAX): a bigger village is
    laid as its first 500, its census by the row */
 const lake=[['ll.sekrid','Sekriḍ',986,1588,'fishing',800],['ll.phishari','Phisharī',975,1587,'fishing',1400],['ll.kako-bagh','Kāko-Bāgh',963,1586,'fishing',1200],
  ['ll.rid','Rīḍ',948,1589,'fishing',700],['ll.landing','The Landing',932,1600,'farming',2500],['ll.timbar','Ṭimbar',938,1606,'fishing',700],
  ['ll.rais-teras','Rāis-Ṭeras',967,1606,'fishing',1000],['ll.kattal','Kaṭal',979,1605,'fishing',700]];
 /* settlements/gihon (G1, 2026-11-22): Ōpal-Māuṭh is the town Gihon (its own page), so seven fishing villages and the Landing,
    which grows to 2,500 (laid here as its first 500, as every big village is; Gihon's G3 lays it in full on its piers) */
 /* a lake hamlet on the town's own shore, 3 km down the south shore (one of the lake's ~25 hamlets of 150-240, which the tune holds
    in its bulk; PLAN.md section 2a): drawn on the page, so the lake's fishing villages can be seen at 1:1 */
 const shore=[['ll.hamlet.jal','Jāl (the net)',987.05,1600.45,'fishing',150]];
 /* THE FISHING WORKS are core/hamlet's Xanadu row's own since Stage 8 B8 (T11, T12; 20-hamlet-cultures.js, KHAMLET.xanaduRow):
    the dugouts' boat sheds and the fish racks with their smokehouse, the fishers' jobs and reach, and the quay as the landing a
    shore village gets, number for number what this file's fishingRow laid; every village now has its wayside shrine too (D11) */
 /* a shore village's landing: the nearest water round its site on the model (16 bearings, out to 3 km), the last dry point before it
    and the way to the water: {x, z, ux, uz} (core/hamlet's spec.landing) */
 const landingFor=(x,z,h)=>{let best=null;for(let a=0;a<16;a++){const t=a/16*Math.PI*2,ux=Math.cos(t),uz=Math.sin(t);
   for(let r=40;r<=3000;r+=40)if(h(x+ux*r,z+uz*r)<0){if(!best||r<best.r)best={r,x:x+ux*(r-40),z:z+uz*(r-40),ux,uz};break;}}
  return best?{x:best.x,z:best.z,ux:best.ux,uz:best.uz}:null;};
 /* the ground a village may stand on: dry (2 m above the lake), not steeper than the row's 0.22; the ring's on the page's ground,
    the lake's on the model's */
 const okOn=h=>(x,z)=>{const y=h(x,z);if(y<2)return false;const e=6,gx=(h(x+e,z)-h(x-e,z))/(2*e),gz=(h(x,z+e)-h(x,z-e))/(2*e);return gx*gx+gz*gz<.22*.22;};
 /* a lake village's site: from its model cell toward the lake's water, the last dry cell before it (the model's shore cell) */
 const shoreSite=(x,z)=>{if(G.model(x,z)>2)return [x,z];for(let r=200;r<8000;r+=200)for(let a=0;a<16;a++){const t=a/16*Math.PI*2,p=[x+r*Math.cos(t),z+r*Math.sin(t)];
  if(G.model(p[0],p[1])>3)return p;}return [x,z];};
 function make(o){const out=[],which=o.which||'all',world=o.world==null?41617:o.world;
  const go=(list,kind)=>{for(const [id,name,px,py,focus,people] of list){let [x,z]=G.fromPx(px,py);const h=kind==='lake'?G.model:G.h;
   if(kind==='lake')[x,z]=shoreSite(x,z);
   const landing=kind!=='ring'?landingFor(x,z,h):null;
   const V=KHAMLET.village(Object.assign({id,world,culture:'xanadu',focus,site:{x,z},link:kind==='ring'?{x:0,z:0}:{x:x+(962.5-px)*400,z:z+(1597-py)*400},
    popMax:Math.min(people,KHAMLET.POP_MAX),dims:o.dims,ground:{ok:okOn(h)}},landing?{landing}:{}));
   out.push(Object.assign({id,name,focus,people,kind,px,py,shore:landing,ground:kind==='lake'?'model':'page'},V,{records:(V.records||[]).map(r=>Object.assign({},r,{y:h(r.x,r.z)}))}));}};
  if(which!=='lake'){go(ring,'ring');go(shore,'shore');}if(which!=='ring')go(lake,'lake');return out;}
 return {ring,lake,shore,make};
})();
