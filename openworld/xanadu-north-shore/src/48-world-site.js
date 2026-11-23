// ================================================================= EREWHON'S LAKE, THE NORTH SHORE — the sites' spec
// [G data] settlements/pher/PLAN.md (the owner's answers, 2026-11-16). The fifth region: the north shore of Erewhon's
// caldera lake and Thalaba (openworld/SITES.json, xanadu-north-shore). Seven sites: Phēr, the north shore's fair (its town
// is settlements/pher's page), Thalaba at the mouth of Godshearth (settlements/thalaba/PLAN.md; no page), three lake towns
// along the shore east of Phēr (Māuṭh, Ōlḍ-Thalaba, Ḍāiyar), and the Thalaba road's two halts up the Qol Siṭrīm's valley
// (the Qol ford and the Qol head, which carry the road's corridor up the valley). KSITES (core/world/48s-world-sites.js)
// plans it; core/world/bake_sites.py bakes it to plan/sites.json.
//   hamlets   {id, focus, near: [dx, dz] from the site | bearing (degrees from north, clockwise) and km, look (m, the
//             search round that spot), pop (the village's ceiling), name}
//   links     the roads between the sites: [site a, site b, {hw, r, keep, via, stops, guide}]
// Phēr's ring (the owner, 2026-11-16: "the plain's farms as named villages"; core/region/data/xan-tune.js T.pherRing):
// farming villages on the rim plain behind the town, which rises north at 6-7 m a km from the rim at -20 m, inside the
// site's square (16 km) and clear of the town's wall and the Swīṭ Siṭrīm's vale.
// The Thalaba road (the owner: "up into the qol valley"): across the plain west-north-west to the Qol where it leaves its
// lower gorge, up the valley to its head (1,198 m), east along the bench to Thalaba (the plan's section 3, traced on the
// re-run model 5f659c054); a han every 25 km.
// bridges (core/world/42b-world-bridges.js): every road and link this region lays is bridged where it crosses a named
// river (the Qol Siṭrīm, the Swīṭ Siṭrīm), so the rivers run on under them.
var XNS_STOPS={every:25000,inn:'xa_house_turk_a',rest:'xa_teahouse',culture:'xanadu',look:5000};
var SITE_SPEC={region:'xanadu-north-shore',world:8431491,bridges:{culture:'xanadu'},
 sites:{
  spher0north1:{culture:'xanadu',road:{r:1500,hw:3,join:true},hamlets:[
   {id:'farm-1',focus:'farming',bearing:295,km:8,pop:260},{id:'farm-2',focus:'farming',bearing:325,km:11,pop:260},
   {id:'farm-3',focus:'farming',bearing:15,km:10,pop:260},{id:'farm-4',focus:'farming',bearing:45,km:9,pop:260},
   {id:'farm-5',focus:'farming',bearing:345,km:14.5,pop:240},{id:'farm-6',focus:'farming',bearing:70,km:12,pop:240}]},
  /* Thalaba at the mouth of Godshearth: the road's end; its countryside is its own plan's (settlements/thalaba/PLAN.md) */
  shvo49k0y2:{culture:'xanadu'}},
 /* the link's first guide point is the top of Phēr's own road (settlements/pher 89zp PH.THALABA_GUIDE: its hairpins up the
    town's spur, east of the Swīṭ Siṭrīm's gorge; P8, the owner: "the switchback road does need to connect in back") */
 links:[['spher0north1','shvo49k0y2',{hw:3,r:1500,keep:true,stops:XNS_STOPS,culture:'xanadu',guide:[[843.60,1489.29],[838,1487.2],
   [833,1485.6],[828,1483.6],[824.3,1481.2],[823,1479.6],[822.7,1477.6],[823.2,1475.6],[822.9,1473.6],[822.9,1471.6],
   [823.4,1469.6],[824.7,1467.6],[826.2,1465.6],[827,1463.8],[830,1463.6],[833.5,1463.6],[837,1463.3],[840,1463]]}]]};
