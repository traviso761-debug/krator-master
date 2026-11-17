// ================================================================= EREWHON'S LAKE, THE LAKE SHORE — the sites' spec
// [G data] settlements/xanadu/BUILD-OUT.md (the owner, 2026-11-16: "One region per province. Can go ahead and cut
// region"). The sixth region: the Lake Shore province (p1, Lēk-Shor, seat Erehwon; core/region/data/xan-tune.js
// T.provinces, T.lake) on the south and west shore of Erewhon's caldera lake (openworld/SITES.json, xanadu-lake-shore).
// Seventeen sites: Erehwon (its city is settlements/xanadu's Erewhon page), the thirteen p1 shore towns from Ālph-Hēḍ
// round to Siṭāq (each a small square, joined in order by corridors along the shore), and the three small isles
// (Wesṭ-Āil, Lāiṭ-Hāus, Bē-Āil). The long isle (Grēṭ-Āil) is settlements/azure-dream's, not a site here. KSITES
// (core/world/48s-world-sites.js) plans it; core/world/bake_sites.py bakes it to plan/sites.json.
//   hamlets   {id, focus, near: [dx, dz] from the site | bearing (degrees from north, clockwise) and km, look (m, the
//             search round that spot), pop (the village's ceiling), name}
// Erehwon's ring is xanadu-oidong-highrift's (openworld/xanadu-oidong-highrift/src/48-world-site.js), copied, not moved,
// and planned with that region's world seed, so both regions lay the same villages; that region still lists Erehwon.
// The shore towns and the isles have no hamlets yet: their towns go on core/city later (CLAUDE.md), so nothing is drawn
// for them here but their markers and their squares of ground.
// bridges (core/world/42b-world-bridges.js): every road this region lays is bridged where it crosses a named river.
var SITE_SPEC={region:'xanadu-lake-shore',world:1191569,bridges:{culture:'xanadu'},
 sites:{
  s57bkv9741:{culture:'xanadu',road:{r:1500,hw:3,join:true},hamlets:[
   /* the caldera lake is north of the town (edit 5.1-512): the farms along the south shore east and west and up the
      slopes toward the volcanoes, the ranch on the uplands between them */
   {id:'farm-1',focus:'farming',bearing:70,km:8,pop:300},{id:'farm-2',focus:'farming',bearing:110,km:9,pop:300},
   {id:'farm-3',focus:'farming',bearing:165,km:7,pop:300},{id:'farm-4',focus:'farming',bearing:215,km:7.5,pop:300},
   {id:'farm-5',focus:'farming',bearing:265,km:8.5,pop:300},{id:'ranch-1',focus:'ranch',bearing:190,km:14,pop:200}]},
  /* the shore towns (T.lake, prov p1), Ālph-Hēḍ round to Siṭāq */
  sxanlkalph01:{culture:'xanadu'},sxanlkhotbath01:{culture:'xanadu'},sxanlktea01:{culture:'xanadu'},
  sxanlkpottery01:{culture:'xanadu'},sxanlksaffron01:{culture:'xanadu'},sxanlkweaver01:{culture:'xanadu'},
  sxanlkboatyard01:{culture:'xanadu'},sxanlkgarden01:{culture:'xanadu'},sxanlkquarry01:{culture:'xanadu'},
  sxanlkorchard01:{culture:'xanadu'},sxanlklotus01:{culture:'xanadu'},sxanlkfish01:{culture:'xanadu'},
  sxanlkstack01:{culture:'xanadu'},
  /* the small isles (T.islands) */
  sxanlkwestisle01:{culture:'xanadu'},sxanlkeastisle01:{culture:'xanadu'},sxanlkbayisle01:{culture:'xanadu'}}};
