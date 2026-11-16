// ================================================================= CORE/REGION DATA — the Xanadu Sultanate's tune (X0)
// [G data] core/simulation/PROPOSAL-XANADU.md, step X0 (the owner, 2026-11-15 and 16: about 350,000 people, the lake on
// Lake Atitlán's pattern, eight provinces, Dalab a fourth gateway, the sky poppy the opium, Strongbow the Sultan's). The
// Sultanate as data for core/region's valley host (core/region/50-region-valley.js, H.simValley), as Longsong's table
// (settlements/longsong/src/15-ls-tune.js) is the Order's; both join one valley at X2. Read in place (never vendored) by
// the open-world regions, Longsong's page and the tests (core/region/tests/test-xan-economy.js).
//   XAN_TUNE.px(px, py)      the xanadu-oidong-highrift region's frame: metres from px 1191,1569 (2 km a pixel)
//   XAN_TUNE.goods           every good and its unit (kg unless named)
//   XAN_TUNE.diet            a person's day by the kind of settlement (city, town, lake, rural, court, dome, camp)
//   XAN_TUNE.calendar        the Vale's year: the rice and grain harvest, the tea flush, the poppy's lancing, cacao, silk, saffron
//   XAN_TUNE.provinces       the eight provinces (section 2): seat, rural people, yield, what the land makes besides grain
//   XAN_TUNE.lake            the 21 lake towns and 4 islands (section 2a): bearing, px, people, trade, hub
//   XAN_TUNE.gateways        the four gateways (Iziz, Yuni, the Dasri, Dalab: the owner's rule of 2026-11-12 and 16)
//   XAN_TUNE.dues            the provinces' fixed yearly dues to the Sultan's Treasury, Qiblai's grant of fealty and the
//                            Sultan's grants of esteem (section 5; Qiblai's bill is proposed: the owner has not set it)
//   XAN_TUNE.valley(P, o)    the valley spec; P the region's plan (openworld/xanadu-oidong-highrift/plan/sites.json: the
//                            rings of Erehwon and Qiblai), o {scale (people an actor stands for: 50), edit hooks}
// X0 takes the valley host as it is: two-stop roads, one scale, no depleting sites (X1 adds them). A province's countryside
// is one settlement (its bulk villages, never drawn) that eats its harvest and tithes a share to its seat; the drawn
// villages, the lake towns and the work camps are their own. Rates are set so a year makes what the arithmetic below says.
var XAN_TUNE=(function(){'use strict';
const T={},D=1/365;
T.px=(px,py)=>({x:(px-1191)*2000,z:(py-1569)*2000});
T.goods={grain:{unit:'kg',crops:['vale-rice','emmer','basin-amaranth']},fish:{unit:'kg'},fruit:{unit:'kg'},dairy:{unit:'kg'},honey:{unit:'kg'},
 salt:{unit:'kg'},tea:{unit:'kg'},cacao:{unit:'kg'},cacaocake:{unit:'kg'},saffron:{unit:'kg'},opium:{unit:'kg',crop:'sky-poppy'},silk:{unit:'kg'},brocade:{unit:'kg'},
 timber:{unit:'kg'},charcoal:{unit:'kg'},copper:{unit:'kg'},goldore:{unit:'kg'},gold:{unit:'kg'},goldwork:{unit:'piece'},wheels:{unit:'wheel'},
 coin:{unit:'dinar'},opal:{unit:'kg'},moonglass:{unit:'kg'},scrap:{unit:'kg'},iron:{unit:'kg'},tools:{unit:'kg'},arms:{unit:'piece'},pearls:{unit:'kg'},wine:{unit:'kg'},oil:{unit:'kg'},
 sulfur:{unit:'kg'},pottery:{unit:'kg'},mats:{unit:'kg'},wax:{unit:'kg'},rarities:{unit:'piece'},hearthseed:{unit:'kg'},power:{unit:'kWh'},powder:{unit:'kg'},
 latex:{unit:'kg',crop:'sky-poppy'}};   /* latex: the poppy's raw latex, dried to opium at Kirstabal's latex house (K1) */

/* the lake's and the capital's households also buy the market's wares (X1: what the market boats carry between the towns): the pots of Pāṭari, the mats of Lōṭas, the honey of Hāibh */
T.diet={city:{grain:150*D,fish:15*D,fruit:12*D,salt:6*D,tea:1.5*D,cacao:.4*D,tools:.4*D,pottery:2*D,mats:1*D,honey:.3*D},
 town:{grain:160*D,fish:8*D,salt:6*D,tea:1*D,tools:.4*D},
 lake:{grain:125*D,fish:45*D,fruit:8*D,salt:6*D,tea:1*D,tools:.3*D,pottery:2*D,mats:1*D,honey:.3*D},
 rural:{grain:165*D,salt:5*D,tea:.3*D,tools:.3*D},
 court:{grain:140*D,fish:25*D,fruit:25*D,salt:7*D,tea:3*D,cacao:2*D,saffron:.05*D,silk:.4*D,tools:.3*D,arms:.002*D},
 dome:{grain:120*D,fish:30*D,fruit:40*D,salt:7*D,tea:4*D,cacao:6*D,saffron:.3*D,silk:3*D,pearls:.2*D,wine:8*D,oil:6*D,honey:4*D},
 camp:{grain:190*D,salt:7*D,tea:1*D,tools:1.2*D},
 shore:{grain:125*D,fish:45*D,fruit:8*D,salt:6*D,tea:1*D,tools:.3*D,mats:1*D},   /* the Lower Xanadu Lake's villages: the lake's table without the capital's pots and honey (no Pāṭari or Hāibh on that lake) */
 fort:{grain:180*D,salt:7*D,tea:1*D,tools:.8*D,arms:.05*D,powder:2*D}};   /* powder (the owner, 2026-11-16: "enough gunpowder for a few cannon but musketeers are mostly hired from the north"): drill and the guns' proof, 2 kg a head a year (settlements/strongwall/PLAN.md, W1) */
/* the year (core/clock's 365 days; windows [from, to] in year days, 77-sim-6-season.js). The Vale is Cfa at about +25 °C:
   one long grain and rice harvest, tea flushed through spring, the poppy lanced at the end of the dry season, cacao
   picked through the wet, silk's spring rearing, saffron's autumn bloom */
T.calendar={windows:{harvest:[150,200],'tea-flush':[40,130],lancing:[20,50],cacao:[150,250],silk:[60,120],saffron:[280,310],'summer-pasture':[120,240],expedition:[120,240],'rift-season':[300,60]}};
T.farm={inCropHa:1.5,seed:1/6,farmShare:.78,hh:5.5};   /* a household's land and seed; the share of the countryside's households that farm */
T.netKgHH=y=>T.farm.inCropHa*y*1000*(1-T.farm.seed);
/* THE PROVINCES (section 2). rural: the province's countryside people (the bulk district holds what the named places do
   not); y: grain t/ha; extra: what the land makes besides grain, kg a year, sent to the seat as a share */
T.provinces=[
 {id:'p1',name:'Lēk-Shor (the Lake Shore)',seat:'s57bkv9741',rural:70000,y:1.6,px:[841,1526],extra:{fruit:900000,silk:9000}},
 {id:'p2',name:'Bhēl (the Vale)',seat:'s4zvgepuru',rural:75000,y:2.2,px:[870,1530],extra:{cacao:180000,saffron:2200,tea:60000,opium:150000,silk:30000,fruit:600000}},
 {id:'p3',name:'Qāṭarāq (the Cataracts)',seat:'skm4jjo2vl',rural:80000,y:1.9,px:[930,1585],extra:{cacao:260000,timber:4000000,charcoal:600000,honey:30000,dairy:400000,fruit:800000}},
 {id:'p4',name:'Gōlḍ-Mārch (the Gold March)',seat:'sxan7r1sln',rural:10000,y:1.1,px:[912,1652],extra:{copper:240000}},
 {id:'p5',name:'Siqārp (the Scarp)',seat:'sl758m2396',rural:25000,y:1.3,px:[992,1606],extra:{tea:200000,cacao:90000,latex:150000,saffron:600}},   /* K1: the poppy's latex (150 t, 120 t of opium dried), to the White Monastery's latex house at Kirstabal (the owner, 2026-11-16) */
 {id:'p6',name:'Ōpal-Bhālī (Opal Valley)',seat:'slaitwal0001',rural:7500,y:.9,px:[1036,1668],extra:{}},
 {id:'p7',name:'Nōrth-Shor (the North Shore)',seat:'xan.pher',rural:25000,y:1.5,px:[845,1484],extra:{silk:14000,cacao:60000,honey:12000,fruit:300000}},
 {id:'p8',name:'Mārchiz (the Marches)',seat:'s57bkv9741',rural:5000,y:1.2,px:[825,1541],extra:{}}];
/* THE LAKE (section 2a): bearing from the lake's centre, the shore cell, people, trade (a work: kg a year), the province it
   belongs to and its hub (Erehwon in the south, Phēr in the north). The lake as the owner re-made it (scale model 5.1 edit 7
   re-run, 5f659c054, 2026-11-16: "a little narrower and ... more toward the center of the valley? settlements can move with
   it"): 66 x 25 px round 845,1504 (was 60 x 32 round 810,1499.5), its level -520 m; every shore cell below is dry with the
   lake beside it on that model, every isle dry with the lake round it */
T.lake=[
 ['alph-head','Ālph-Hēḍ',358,876,1503,4000,{grain:900000},'p1'],['hot-bath','Hoṭ-Bāṭh',16,876,1513,1800,{sulfur:40000},'p1'],
 ['tea-terraces','Ṭī-Ṭeras',26,872,1517,2000,{tea:45000},'p1'],['pottery','Pāṭari',35,865,1518,1500,{pottery:120000},'p1'],
 ['saffron','Saphran',51,857,1519,1800,{saffron:900},'p1'],['weaver','Wībhar',65,852,1519,2500,{brocade:0},'p1'],
 ['boatyard','Boṭ-Yārḍ',86,846,1519,2000,{},'p1'],['garden','Gārḍan',125,836,1517,1800,{fruit:300000},'p1'],
 ['quarry','Qorī',137,832,1516,1500,{},'p1'],['orchard','Ōrcharḍ',156,827,1512,1600,{fruit:420000},'p1'],
 ['lotus','Lōṭas',173,822,1507,1500,{mats:60000,fruit:120000},'p1'],['fish-market','Phish-Mārkiṭ',186,815,1501,4000,{},'p1'],
 ['stack','Siṭāq',195,812,1495,900,{},'p1'],['hive','Hāibh',207,817,1490,1200,{honey:24000},'p7'],
 ['mulberry','Malbari',219,825,1488,2200,{silk:16000},'p7'],['net','Nēṭ',233,833,1488,1400,{},'p7'],
 ['cocoa','Qōqō',245,838,1489,1800,{cacao:50000},'p7'],['pher','Phēr',261,843,1491,6000,{},'p7'],
 ['mouth','Māuṭh',305,852,1494,1500,{},'p7'],['old-thalaba','Ōlḍ-Thalaba (the fishing village left on Thalaba\'s shore)',332,860,1496,600,{},'p7'],
 ['dyer','Ḍāiyar',351,870,1500,1400,{},'p7']]
 .map(([key,name,brg,px,py,people,make,prov])=>({key,name,brg,px,py,people,make,prov,hub:prov==='p7'?'xan.pher':'s57bkv9741'}));
/* the isles: Grēṭ-Āil is now the long isle in the lake's middle (24 x 8 px, 300 m high; the owner, 2026-11-16: "add one large
   oblong island in the middle of the lake"), the small isles moved with the lake */
/* the long isle's 900 (the owner, 2026-11-16; settlements/azure-dream/PLAN.md, 5e5d46b88): the monastery with its Station Watch
   (304, at the isle's middle), and its three villages as records of their own (the owner, 2026-11-16: "give economy Sim
   records"), where the Azure Dream session laid them on core/hamlet: the best of the 15 spots on the isle that are dry and
   gentle 120 m round with the water within 450 m at 1:1 (most of its coast is steep). West End (250) on the west coast,
   North Shore (200) on the north-east coast, East End (150) on the south shore 5.4 km east of the cove */
T.islands=[['great-isle','Grēṭ-Āil (the long isle: the head monastery of the Order of the Azure Dream, Qiblai\'s blue monastery)',846.075,1508.493,304],   /* at the cove's head; the Station Watch on the summit (845.05,1504.35) */
 ['great-isle-west','Wesṭ-Ēn (West End: the long isle\'s fishing village, on the west coast below the tip)',834.5,1503.5,250],
 ['great-isle-north','Nōṛ-Shōr (the long isle\'s north shore village, on the north-east coast facing Phēr)',849.7,1501.3,200],
 ['great-isle-east','Īsṭ-Ēn (East End: the long isle\'s fishing and herding village, on the south shore east of the cove)',851.5,1508.8,150],
 ['bay-isle','Bē-Āil (the Sultan\'s fishponds)',844.1,1511.5,300],
 ['west-isle','Wesṭ-Āil (the fishermen\'s isle)',831,1499,400],['east-isle','Lāiṭ-Hāus (the light and the customs)',864,1503,200]]
 .map(([key,name,px,py,people])=>({key,name,px,py,people}));
/* PHĒR'S RING (the owner, 2026-11-16, settlements/pher/PLAN.md section 4: "the plain's farms as named villages"): KHAMLET
   farming villages on the rim plain behind Phēr (the plain rises north at 6-7 m a km from the rim at -20 m), tithing to
   Phēr as Erehwon's and Qiblai's rings do, their people taken out of Nōrth-Shor's bulk district. Each spot is dry on the
   re-run model (5f659c054). Where core/hamlet laid them out in the Phēr session's bake of openworld/xanadu-north-shore
   (claude/pher-plan-55d3f2 a2c5d1a56, plan/sites.json, site spher0north1; its frame's origin px 845,1479), until that
   region reaches this branch and the tune reads its plan as it reads Erehwon's and Qiblai's */
T.pherRing=[['farm-1',839.37,1489.31],['farm-2',839.85,1486.49],['farm-3',844.29,1486.17],['farm-4',846.18,1487.82],['farm-5',841.12,1484],['farm-6',848.64,1488.95]]
 .map(([key,px,py])=>({id:'xan.pher/hamlet/'+key,name:'farming village',focus:'farming',px,py,census:{pop:240,households:44}}));
/* THE FAIR'S DAYS AND THE PILGRIMS' LAUNCHES (the owner, 2026-11-16): core/simulation transport records (77-sim-5r), declared
   here for the page that draws Phēr at 1:1 (its step P6). The valley runs its towns at the abstract level with no water
   layer, so it does not run them: they move people, and the lake's goods already move by its rounds and the cross-lake run.
   The fair: two days a week the north shore's launches loop from their towns to Phēr's landing and back. The pilgrims' launch:
   Phēr's landing to Grēṭ-Āil's cove and back, 26 km, for the Azure Dream's pilgrims (they wait in its house at Phēr) */
T.loops=[{id:'loop.pher.fair-west',layer:'water',vehicle:'launch',stops:['xan.pher','lk.cocoa','lk.net','lk.mulberry','lk.hive','xan.pher'],days:'fair',faction:'xanadu'},
 {id:'loop.pher.fair-east',layer:'water',vehicle:'launch',stops:['xan.pher','lk.mouth','lk.old-thalaba','lk.dyer','xan.pher'],days:'fair',faction:'xanadu'},
 {id:'loop.pher.pilgrims',layer:'water',vehicle:'launch',stops:['xan.pher','lk.great-isle','xan.pher'],km:26,faction:'xanadu',org:'qb.azure'}];
T.fairDays=[3,6];   /* the fair's two days in the week (proposed: the plan leaves them to the page) */
/* KIRSTABAL'S LAKE (settlements/kirstabal/PLAN.md section 2a; the owner, 2026-11-16: "it has its own, smaller atitlan-like
   hinterland", "villages sound fine", "Landing belongs to Scarp province"): the Lower Xanadu Lake's nine villages round its
   230 km shore, every one in the Scarp (P5) with Kirstabal its hub; ids 'll.' (the capital's lake keeps 'lk.'). The Landing at
   the outflow is the barges' stop and the portage road's head to Qiblai; Sekriḍ is the Red Monastery's (Qiblai's crimson).
   Names coined (proposed); people and trades proposed, the survey's shore cells */
T.lowerLake=[['sekrid','Sekriḍ (the Red Monastery\'s village)',986,1588,800,{}],['phishari','Phisharī (the fishery)',975,1587,1400,{}],
 ['kako-bagh','Kāko-Bāgh (the cacao garden)',963,1586,1200,{cacao:30000,fruit:120000}],['rid','Rīḍ (the reeds)',948,1589,700,{mats:30000}],
 ['landing','The Landing (the barges\' stop and the portage road\'s head)',932,1600,600,{}],['timbar','Ṭimbar (timber)',938,1606,700,{timber:600000}],
 ['opal-mouth','Ōpal-Māuṭh (the Opal River\'s mouth)',955,1607,1200,{}],['rais-teras','Rāis-Ṭeras (the rice terraces)',967,1606,1000,{grain:300000}],
 ['kattal','Kaṭal (cattle)',979,1605,700,{dairy:60000}]]
 .map(([key,name,px,py,people,make])=>({key,name,px,py,people,make,prov:'p5',hub:'sl758m2396',diet:'shore',pre:'ll.'}));
T.lowerRounds=[['round.lower-north','sl758m2396',['sekrid','phishari','kako-bagh','rid','landing'],'ll.'],['round.lower-south','sl758m2396',['kattal','rais-teras','opal-mouth','timbar'],'ll.']];
/* Kirstabal's ring (the proposal's section 3e; settlements/kirstabal/PLAN.md section 3): three farming villages and a ranch on
   the floor south of the town, at core/hamlet's census sizes (a village 240 people in 44 households, a ranch 145) */
T.ksRing=[['ks.ring.mil','Mil (the mill)',987.5,1601.8,'farming',240,44],['ks.ring.kanal','Kanāl (the canal)',986.5,1603,'farming',240,44],
 ['ks.ring.grenz','Grēnz (the grain)',988.8,1602.6,'farming',240,44],['ks.ring.baiyar','Bāiyar (the byre)',985.5,1604.5,'ranching',145,26]];   /* 4-11 km out, as Erehwon's and Qiblai's rings */
/* the White Monastery's house at Kirstabal (the owner, 2026-11-16: "The White Monastery (name TBD) runs the latex house", "yes the
   white and crimson of qiblai", "takes a share and a small fee"): the Scarp's latex comes to it, is dried to opium, and all but
   its share goes to Kirstabal; the seat pays it a fee a year. The share and the fee's size are proposed */
T.whiteHouse={share:1/20,fee:{coin:200},crew:100,house:['qb.white.kirstabal','The White Monastery\'s house at Kirstabal (Qiblai\'s white; it runs the latex house)','sl758m2396',992,1602,150]};
T.portage={km:22,lake:112};   /* the barge road to Qiblai: the lake to the Landing, then the portage road past the cataracts */
T.lift=240;                   /* the Strongbow lift's minutes, foot to lip */
T.fishKgPerson=260;   /* a fishing town's catch a year, a head of its people: about a third of them fish (the dugouts) */
T.lakeTerraces=.6;    /* the share of a lake town's grain its own terraces grow */
/* X1: a town's fishing ground, a site: half a year's catch in the water, a day's catch back each night, so fishing at the
   town's rate holds it and a fleet twice the size empties it */
T.fishery=catchYr=>({kind:'fishery',amount:Math.round(catchYr/2),regen:Math.round(catchYr/365)});
/* X1: the lake's market boats: a round each from a hub along its shore, a call at every town (SIM.trade's round: at each
   town a boat buys what the next one wants), legs of about an hour and a half */
T.rounds=[['round.south-east','s57bkv9741',['boatyard','weaver','saffron','pottery','tea-terraces','hot-bath','alph-head']],
 ['round.west','s57bkv9741',['garden','quarry','orchard','lotus','fish-market','stack']],
 ['round.north-west','xan.pher',['cocoa','net','mulberry','hive']],
 ['round.north-east','xan.pher',['mouth','old-thalaba','dyer']]];
/* THALABA MOVED (the owner, 2026-11-16: "we can move thalaba to the mouth of godshearth and put a new village on the lake in
   its place"): up from the shore to the bench where Godshearth's spillway gorge opens (biomes/godshearth/PLAN.md: the
   basin "runs south to px 845,1451, the spillway"; the bench at 1,450-1,700 m, about 12 C, px 834-850 by 1462-1470). The
   town of the summer road into the basin (no longer a caravan terminus: Yuni's caravans end at Qiblai); its terraces on
   the bench grow half its grain, Phēr sends the rest. Ōlḍ-Thalaba, a fishing village of 600, keeps the shore.
   Its own sulfur (the owner, 2026-11-16, settlements/thalaba/PLAN.md): "its own small sulfur node but most of its sulfur
   would come by expedition", a steady works, then "30 t from the deposit"; the crew halved with the make (`sulfurCrew`, a
   share of the town), so a digger's year is what it was */
/* L1 (settlements/lightwall/PLAN.md section 4; the owner, 2026-11-16: Lāiṭwāl is the seat of Ōpal-Bhālī, not the Sultan's
   mines, which become one of its works villages across the lake): Lāiṭwāl, the Light Wall, on the north shore of the middle
   terrace's great lake, half Glaziers in the wall (the eastern loj's main hold) and half Xanadui on the bench. The Great Potch
   Line's adits (a field of veins, about 600 miners), the glass shops (potch to moonglass), the lake's dugouts, the bench
   terraces (a quarter of its grain; the rest bought down the valley with opal, by Kirstabal). The Glaziers pay the Fifth in
   opals at the assay house on the bench; the mines' opal comes over by the ferry (27 km) and goes on with the town's */
T.laitwal={id:'slaitwal0001',name:'Lāiṭwāl (the Light Wall: the Glaziers\' hold and the seat of Ōpal-Bhālī)',px:[1028,1653],people:5000,
 make:{opal:300,moonglass:6000},adits:600,glass:80,terraces:.25,fishK:1.2,ferryKm:27,kirstabalKm:150};
T.thalaba={id:'xan.thalaba',name:'Thalaba (at the mouth of Godshearth, over the spillway)',px:[840,1463],people:2400,make:{sulfur:30000},sulfurCrew:.075,terraces:.5,roadKm:105};
/* the first stores are last year's harvest: they last to the end of the first harvest the clock reaches and a month over.
   core/clock's day 0 is year day 259 (77-sim-6-season.js's year; the test checks it), so the harvest (year days 150-200)
   ends on clock day 306 */
T.yearDay0=259;
T.clockDay=yd=>(yd-T.yearDay0+365)%365;
T.startDays=T.clockDay(T.calendar.windows.harvest[1])+30;
/* THE GATEWAYS (the owner: the East Rift trades directly with Iziz, Yuni, the Dasri and Dalab only). Off the map, each a
   market with a pool; the road's days are its whole route to the capital's market (X1 makes Strongbow and Thalaba its
   stages). out: what Xanadu sends; in: what comes back */
/* X1: each gateway enters at its staging town: the Catch caravans (Iziz, the Dasri) at Strongbow's lift, Dalab's great
   caravan at the capital. The Catch's salt feeds the south (Qiblai's side), the north's comes with Dalab (`side`).
   Changed 2026-11-16 (the owner): "I don't think Thalaba should be a Yuni terminus", then "Yuni's caravans should go to
   qiblai": they come from the north-east by the Geomancers' road (Yuni and Locus are neighbours, LORE.md 6.9) and end at
   Qiblai beside the Geomancers' oil caravans; their salt is a third of the south's.
   THE GREAT CARAVAN (the owner, 2026-11-16): "the great caravan will leave in the spring from Xanadu every year, go to south
   Dalab for the summer visiting Blakhed, Nulab, and Shelf, then return in the fall, spending the winter in Xanadu visiting
   Erewhon, Theodiga, and Qiblai". One carrier on a round of seven stops, a leg each ~52 days (SIM.trade's round: one leg
   time). The clock opens on year day 259, early autumn, with the caravan leaving Shelf: Erehwon at year day ~311 (the
   winter's start), Theodiga ~3, Qiblai ~55, back to Erehwon ~107 (the spring) to load what the capital's market has
   gathered, Blakhed ~159, Nulab ~211, Shelf ~263 (the fall). The three Dalab stops are off the map; Blakhed takes the
   exports, Shelf holds the goods Dalab sends. (A round buys at each stop only what the next one wants, and a town that
   eats a good keeps it, so the exports load at the capital, where the roads gather them, as the old gateway did) */
T.gateways=[
 {id:'gate.iziz',name:'Iziz (by the Catch, the Twins and Strongbow)',entry:'sfgtxw10kr',side:'south',days:64,carriers:8,cap:40000,out:['goldwork','cacao','opium','tea','silk','wheels'],in:['salt','iron','arms','pearls','oil','powder']},
 {id:'gate.dasri',name:'The Dasri (by the Catch oases and Stair)',entry:'sfgtxw10kr',side:'south',days:22,carriers:6,cap:30000,out:['cacao','tea','silk','opium'],in:['salt']},
 {id:'gate.yuni',name:'Yuni (from the north-east by the Geomancers\' road, to Qiblai)',entry:'skm4jjo2vl',side:'south',days:48,carriers:10,cap:20000,out:['goldwork','saffron','brocade','opal','moonglass','silk'],in:['salt','iron','arms','wine','oil','powder']},
 {id:'gate.dalab',name:'Dalab (the Annual Great Caravan: south Dalab in summer, Xanadu in winter)',entry:'s57bkv9741',side:'north',round:true,days:52,carriers:1,cap:900000,
  dalab:[['gate.dalab.blakhed','Blakhed (south Dalab: the rim\'s market town)'],['gate.dalab.nulab','Nulab (south Dalab)'],['gate.dalab.shelf','Shelf (south Dalab)']],
  winter:['s57bkv9741','s4zvgepuru','skm4jjo2vl'],
  out:['cacao','cacaocake','saffron','opium','tea','brocade','silk','sulfur','wax','rarities','hearthseed'],in:['salt','iron','wine','pearls']},
 {id:'gate.geomancers',name:'The Geomancers (their oil caravans from Locus, stopping at Qiblai)',entry:'skm4jjo2vl',side:'oil',days:40,carriers:4,cap:30000,out:['oil','wheels','cacao'],in:['iron','tools']}];
/* X2: the Geomancers' concession on Qiblai's oil field (about 6 km from the city; the region's oil marker within its reach) */
T.oil={px:[925,1598],people:300,kgYr:400000,licence:.2,council:.1};
/* THE ORDER'S MONASTERY (the owner, 2026-11-16, a proposal: "one of the monasteries of Qiblai (and therefore of the
   Prismatic Council) is a History Monk monastery, and uses the Order's banner and color. as such the order gets 1/8 of the
   council income"): one of the eight great monasteries (the saffron one, the owner settled it: LORE.md l.561, "their
   saffron is the Order's colour"), about 300 of Qiblai's ~2,400 monks, its Prismarch on the council. It takes an eighth of what the
   council receives: the Prismarchy's cut of the oil (a road `cut` where it lands) and the Sultan's grants of esteem (a
   transfer of its own) */
T.orderHouse={share:1/8,house:['qb.order','The Order\'s monastery at Qiblai (the History Monks: one of the eight great monasteries, under the Order\'s saffron banner)','skm4jjo2vl',922.107,1594.893,300]};   /* the saffron spoke (spoke 1, NE of the Temple Mountain), settled by the owner: "Yes, saffron"; the Qiblai page's monastery at x 213.8, z -213.8 m from the centre (922,1595) */
/* THE ORDER OF VIRIDIAN THOUGHT (the owner, 2026-11-16: "find a site that's a great tea production site and place the head
   monastery of Qiblai's green monastery there, the Order of Viridian Thought"). Its head monastery and tea estate on the
   scarp's mist slopes, chosen by a scan of the scale model: px 962,1562, 813 m, Cfb, mean 18 C (coldest month 11 C),
   ~2,300 mm of rain, a 20 % west-facing slope under the scarp. 104 km from Qiblai, 93 km from Kirstabal (the Scarp's tea
   province). Its tea goes to the Order's monastery in Qiblai, the council's green spoke; Qiblai sends it grain, salt and
   tools. Each monastery holds its own estates (PROPOSAL-XANADU Q6). *Proposed:* 400 people, 40 t of tea a year */
T.viridian={id:'qb.viridian',name:'The Order of Viridian Thought: its head monastery and tea estate on the scarp (Qiblai\'s green monastery)',px:[962,1562],people:400,tea:40000};
T.mission=['yuni.mission','Yuni\'s mission at the oil field (its cloister and lodging beside the Geomancers\' wells)','skm4jjo2vl',926,1597,40];   /* the owner: the field is both */
/* THE POWER (the owner, 2026-11-16): "if the geomancers have a presence at qiblai it will likely be partly electrified. the
   council will take its cut"; "Qiblai will be electrified along all major avenues and in buildings except in poor areas;
   elsewhere in Xanadu only the major avenues of large settlements, for defense, and in the richest of homes. just enough to
   use the cut of oil they get from Yuni". The concession is Yuni's mission (the Geomancers, "mostly Yuni", LORE.md 6.9), so
   the oil the Sultanate keeps is its two cuts: the Prismarchy's (`council`), burned in Qiblai's generator, and the Sultan's
   licence (`licence`), sent to the generators of the large towns in the shares of `T.lit` (their avenues' lamps and the
   richest homes). Each generator burns its cut at `T.chain.dynamo`'s kWh a kg, and its town uses the power all year */
T.lit={s57bkv9741:.43,s4zvgepuru:.15,sl758m2396:.1,sfgtxw10kr:.15,'xan.pher':.15,'march.e':.02};   /* the licence's split: the capital (the citadel and the avenues), Theodiga, Kirstabal, Strongbow (the gate), Phēr; the beacon fort over the Rift (the owner, 2026-11-16: "a refurbished Ancient high-intensity beacon ... connected to a generator", kept by the Yellow Monastery, the Order of the Beacon), its fiftieth from the capital's share */
/* X2: the summer expedition from Thalaba to Godshearth's vents (Gemini's 218 km summer road; the camp's place is approximate,
   north over the rim toward the Godthrone) */
T.expedition={id:'exp.godshearth',name:'The Rare Devisers\' expedition camp at Godshearth (Thalaba\'s summer road)',faction:'devisers',home:'devisers.thalaba',px:[828,1380],km:200,people:150,make:{sulfur:90000,wax:40000,rarities:60}};
/* X2 (the owner, 2026-11-16): two houses that compete with the Two Horns (*proposed*, no lore yet beyond the owner's words):
   THE GOLDEN TEARS, "a bit more militaristic, running expeditions into Lizard country to seek out unclaimed gold lodes": their
   house in the Gold March and a factor in the capital; an armed prospecting camp in the Rift floor working a field of short
   lodes in the cool months, its ore home to the house and on to the Sultan's assay, where the Fifth is taken of the gold;
   and they escort Dalab's Annual Great Caravan, a share of what it lands at the capital.
   THE RARE DEVISERS, "whose specialty is running the expeditions to the Godshearth": their house at Thalaba and a factor in
   the capital; the Godshearth camp is theirs (T.expedition), its sulfur, wax and rarities home to their house, which sells
   them on to Yuni's caravans at Thalaba */
/* settlements/strongwall/PLAN.md, W1 (the owner's answers, 2026-11-16): the Golden Tears' house stands inside the fort
   ("move them into the fort"); the forts hire their musketeers from the north (Izani, Yuni and free companies of the
   Crater), paid by the Treasury once a year after the dues (`pay.muskets.*`: owed when the Treasury is short, the
   Grand Vizier's guard patrols, LORE 6.13); the House of the Tempest, the Order of the Violet Storm's central monastery
   (Qiblai's violet house is its daughter), a martial order of sword and bow on the West Arm, 600 strong, in the Gold
   March, its terraces two fifths of its grain and the rest from Strongwall */
T.muskets={wage:12,men:{sxan7r1sln:30,'march.w':10,'march.s':10,'march.e':10},day:240};   /* wage: dinars a man a year (a dinar is 4 g of the Mint's gold) */
T.tempest={id:'xan.tempest',name:'The House of the Tempest (the Order of the Violet Storm\'s central monastery, on the West Arm)',px:[886,1619],people:600,terraces:.4,km:80};
/* settlements/beacon/PLAN.md, B4 (the owner, 2026-11-16: the beacon fort "will become the head monastery of the Order of the
   Beacon"; ~300, the gold Prismarch there, Qiblai's gold house the daughter; the Sultan's watch fort above and the monastery
   below): the Yellow Monastery's head house stands beside the beacon fort (`fort`, wherever its px is), fed from the capital,
   its terraces two fifths of its grain. Its monks bear no arms and burn no powder; the lamp's oil stays the fort's
   (T.lit['march.e']): the Sultan's licence pays for the light, the order's hands keep it */
T.beacon={id:'xan.beacon',name:'The Order of the Beacon\'s head house (the Yellow Monastery, below the beacon fort over the Rift)',fort:'march.e',people:300,terraces:.4};
/* settlements/flashing-eye/PLAN.md section 4 (the owner, 2026-11-16: the east volcano, facing the Rift; "Agreed" to its ~320):
   the Order of the Flashing Eye's head house (the Red Monastery) on the south flank's bench below the crater. The fort diet
   less arms and powder; its terraces three tenths of its grain; the rest from the capital by launch to Ṭī-Ṭeras and up the
   west road; tea from Ṭī-Ṭeras by want. The plan's sulfur for the rites and its daughter house in Qiblai (qb.crimson) wait:
   no diet eats sulfur yet, and the council's other houses are an open question (the plan's question 11) */
T.flashingeye={id:'xan.flashingeye',name:'The Order of the Flashing Eye\'s head house (the Red Monastery, on the east volcano\'s south flank)',
 px:[881,1527],people:320,terraces:.3,lakeKm:62,roadKm:45};
/* the rings of Thalaba and Lāiṭwāl (the owner, 2026-11-16: "give economy Sim records"): their hamlets in the region's plan
   (openworld/xanadu-oidong-highrift/plan/sites.json, sites shvo49k0y2 and slaitwal0001), tithing to their towns as Erehwon's
   and Qiblai's rings do. Salphar, Thalaba's diggers' hamlet, is left out: its sulfur is the town's own diggings (tb.sulfur) */
T.ringSites={'xan.thalaba':{site:'shvo49k0y2',prov:'p7',y:1.5},slaitwal0001:{site:'slaitwal0001',prov:'p6',y:.9}};
T.tears={escort:.04,houses:[['tears.strongwall','The Golden Tears: their house in the Gold March (the Tears\' court, inside Strongwall)','sxan7r1sln',912,1640,80],['tears.erehwon','The Golden Tears\' factor house, Erehwon','s57bkv9741',841,1518,30]],
 camp:{id:'exp.rift-gold',name:'The Golden Tears\' armed prospecting camp in Lizard country (the Rift floor; approximate)',px:[850,1628],km:110,people:120,kgYr:70,years:30}};   /* kgYr: the gold its ore holds (30 kg of ore a kg) */
/* THE BORE (the owner, 2026-11-16: "we can leave in the stair to theodiga tunnel", then Theodiga's end "as written",
   settlements/theodiga/PLAN.md "The bore to Stair"): the Ancients' dead bore from Theodiga to Stair, its portal in the east
   canyon wall at the foot of the Salvage Road; the Rare Devisers work it under their royal licence from their lodge at the
   portal (the Salvagers, who take only what the Dome lets fall, hire on as haulers and lamp-men). Its yield, *proposed*:
   salvaged scrap and Ancient rarities, a finite site (a dead tunnel does not refill), `years` of it */
T.bore={scrap:20000,rarities:15,crew:40,years:80};
/* the owner, 2026-11-16: "the rare devisers will have their main guild house at Theodiga; they are royally licensed in the
   scrap and rare artifact trade". Every kilo of the Salvagers' scrap passes through their house at Theodiga, which sells it
   on to the smelter. The Sultan's share of every Godshearth haul is `T.haul` */
T.devisers={houses:[['devisers.theodiga','The Rare Devisers: their guild house at Theodiga (the royal licence in scrap and rare artifacts)','s4zvgepuru',909,1535,80],
 ['devisers.thalaba','The Rare Devisers\' house at Thalaba (the Godshearth expeditions)','xan.thalaba',841,1463,40],['devisers.erehwon','The Rare Devisers\' factor house, Erehwon','s57bkv9741',840,1519,15]]};
/* THE SULTAN'S SHARE OF THE GODSHEARTH HAULS (the owner, 2026-11-16, settlements/thalaba/PLAN.md section 4): "the sultan
   takes his 10% of the overall haul and 20% of the rarities", "20% total not 30", "on dalab party too": a tenth of every
   good an expedition brings home to Thalaba, a fifth of the rarities, taken where it lands for the Treasury; no toll on
   the road. [good]: share, `all` for the rest */
T.haul={all:.1,rarities:.2};
/* THE DALAB MISSION AT THALABA (the owner, 2026-11-16): "there is a small Dalab mission here of about 30 people", built
   in Dalab's style; the genepriests (who come over the rim for the hearth trees: biomes/godshearth/PLAN.md section 5)
   "do their own expedition and hire locals". The party works the Grove (Godshearth station 2) in the expedition season for
   hearth seed and specimens (`hearthseed`) and a little wax; the Sultan's share is taken of it as of the Devisers'; what
   the mission keeps goes home to Dalab with the Great Caravan ("yes", the owner). The party's size and make are proposed:
   ~10 genepriests and their servants, ~30 hired Thalaba men; the road ~180 km (1.2 x the straight line) */
T.dalab={mission:['dalab.thalaba','The Dalab mission at Thalaba (the genepriests\' house, in Dalab\'s style)','xan.thalaba',840,1462,30],
 party:{id:'exp.dalab',name:'The Dalab mission\'s party at the Grove (Godshearth station 2; hired Thalaba men)',faction:'dalab',home:'dalab.thalaba',px:[836,1388],km:180,people:40,make:{hearthseed:40,wax:8000}}};
/* X2: the Brotherhood of the Two Horns: [id, name, the town it stands in (null: off the map), px, py, people] */
T.horns={tally:.04,margin:.03,houses:[
 ['horns.strongbow','The Brotherhood of the Two Horns: the guild house at the Strongbow gate','sfgtxw10kr',1001,1597,300],
 ['horns.stair','The Brotherhood\'s house at the Stair gate (off the map; its table is Stair\'s)',null,1106,1442,0],
 ['horns.erehwon','The Two Horns\' factor house, Erehwon','s57bkv9741',842,1518,40],['horns.qiblai','The Two Horns\' factor house, Qiblai','skm4jjo2vl',922,1594,40],
 ['horns.theodiga','The Two Horns\' factor house, Theodiga','s4zvgepuru',908,1534,20],['horns.kirstabal','The Two Horns\' factor house, Kirstabal','sl758m2396',989,1599,20],
 ['horns.pher','The Two Horns\' factor house, Phēr','xan.pher',843,1490,20],['horns.thalaba','The Two Horns\' factor house, Thalaba','xan.thalaba',839,1463,20]]};
T.toll=.05;   /* the Sultan's toll at the Strongbow lift, on what the Catch caravans land there */
T.gatePool={salt:1e7,iron:1e6,arms:1e5,pearls:1e4,wine:1e6,oil:1e6,tools:1e5,powder:1e5};
T.gateWant={goldwork:2,cacao:1200,cacaocake:55,opium:650,saffron:8,tea:400,silk:80,brocade:40,opal:.9,moonglass:12,wheels:3,oil:870,sulfur:230,wax:105,rarities:.15,hearthseed:.1};   /* the gateways' take a day, all four together: what the country makes less its own use (Gemini's exports scaled to it) */
/* THE DUES: a fixed yearly bill each province's seat sends the Treasury after the harvest (the Chancellor's assessment,
   bound by tradition, never answering a bad year); Qiblai's grant of fealty and the Sultan's grants of esteem */
T.dues={day:T.clockDay(215),bills:{skm4jjo2vl:{grain:120000,cacao:4000,honey:800},s4zvgepuru:{grain:90000,saffron:60,tea:1500,silk:600},
 sl758m2396:{grain:15000,tea:2500,opium:2000},sxan7r1sln:{copper:6000},'xan.pher':{grain:30000,silk:300,honey:400}},
 fealty:{from:'skm4jjo2vl',goods:{wheels:40,goldwork:12,honey:600},day:T.clockDay(210)},esteem:{to:'skm4jjo2vl',goods:{grain:20000,silk:200,coin:500},day:T.clockDay(230)}};
/* THE CHAINS (section 4): batch recipes. hours are a crew's hours for one batch */
/* a crew's hours set its most a year (crew x 12 h x 365 / hours); the input binds below that: the gold (the goldsmiths,
   the mint, the wheels), the scrap (the smelter), the iron (the smiths). The weavers' hours bind them, so raw silk is left
   for the gateways */
T.chain={cacaoPress:{in:{cacao:1.25},out:{cacaocake:1},hours:4},   /* Phēr's cacao house: beans roasted, ground and pressed into cakes (the owner, 2026-11-16) */
 assay:{in:{goldore:30},out:{gold:1},hours:20},goldsmith:{in:{gold:.1},out:{goldwork:1},hours:600},mint:{in:{gold:1},out:{coin:250},hours:12},
 wheel:{in:{copper:4,gold:.02},out:{wheels:1},hours:580},weave:{in:{silk:1.2},out:{brocade:1},hours:110},
 smelt:{in:{scrap:1,charcoal:1},out:{iron:1},hours:2},smith:{in:{iron:1},out:{tools:1},hours:3},
 dynamo:{in:{oil:1},out:{power:3}},
 latex:{in:{latex:1.25},out:{opium:1},hours:2}};   /* K1: the latex house: raw latex dried on racks, balled and sealed (a fifth of its weight lost) */   /* a kg of oil to 3 kWh (a generator's hours set by what it burns, in valley()) */
T.mine={goldore:6400,copper:0,scrap:120000,opal:180};   /* a year's make: the gold mines' ore (about 210 kg of gold), the salvagers' scrap, Opal Valley's opal */
T.fifth=.2;
T.lodeYears=40;    /* X1: the March's copper band's ore in the ground, in years of its make */
/* X2 (the owner, 2026-11-16: the gold and opal lodes collectively last over 200 years, a lode may dry up in 2-3 years): a field
   of veins, each 2 to 3 years of the work's make (spread by the golden ratio, so no draw), enough of them for years */
T.field=(kind,kgYr,years)=>{const veins=[];let tot=0;for(let i=0;tot<kgYr*years;i++){const a=Math.round(kgYr*(2+((i*0.6180339887)%1)));veins.push({amount:a});tot+=a;}return{kind,grade:'rich',veins};};
T.fieldYears=210;
T.scaleBulk=200;   /* X1: people an actor stands for in a province's countryside (the drawn places keep the valley's 50) */
T.valley=function(P,o){o=o||{};const K=o.scale==null?50:o.scale,yr=365,win=w=>{const W=T.calendar.windows[w];return(W[1]-W[0]+yr)%yr;};
 const rate=(kgYr,crew,days,k)=>{k=k==null?K:k;return kgYr/(Math.max(1,Math.round(crew/k))*k*(days==null?yr:days)*12);};
 const eats=k=>Object.assign({},T.diet[k]),at=(px,py)=>T.px(px,py),site=id=>P.sites.find(s=>s.id===id);
 const S=[],R=[],X=[],seats={},need={};   /* need: grain a seat must pass on to the places it feeds, kg a year */
 const add=(s)=>{S.push(s);return s;},eatYr=(k,n)=>n*T.diet[k].grain*yr;
 const crewOf=(n,cap)=>Math.min(cap,Math.round(n*.45));
 const bump=(seat,kg)=>{need[seat]=(need[seat]||0)+kg;};
 /* ---- THE TOWNS: their markets first (a road lands in a settlement's first work) */
 const town=(id,name,px,py,people,diet,works,o2)=>{const p=at(px,py);const s=add(Object.assign({id,name,faction:'xanadu',people,x:p.x,z:p.z,eats:eats(diet),keepDays:20,
  start:{grain:Math.round(eatYr(diet,people)*T.startDays/yr),salt:Math.round(people*6*.4),tea:people,tools:people*.3,fish:Math.round(people*(T.diet[diet].fish||0)*yr*.1)},
  works:[{id:id+'.market',kind:'market',name:'the market and its warehouses',crew:20,out:[],rate:0}].concat(works||[])},o2||{}));seats[id]=s;
  bump(o2&&o2.feeder||id,eatYr(diet,people));return s;};   /* a town fed by another (the court and the Dome by the capital, Strongbow by Kirstabal) counts on its feeder's grain */
 const E=town('s57bkv9741','Erehwon',841,1517,25000,'city',[   /* on the new lake's south shore (5f659c054; was 806,1516) */
  {id:'er.goldsmiths',kind:'goldsmiths',name:'the Goldsmiths\' quarter',crew:300,batch:T.chain.goldsmith},
  {id:'er.weavers',kind:'weavers',name:'the weavers and dyers of the industry quarters',crew:200,batch:T.chain.weave},
  {id:'er.smithy',kind:'smithy',name:'the smiths (tools from the iron)',crew:120,batch:T.chain.smith},
  {id:'er.dockyard',kind:'dockyard',name:'the dockyard and the waterfront',crew:150,out:[],rate:0},
  {id:'er.caves',kind:'ice-caves',name:'the Caves of Ice',crew:20,out:[],rate:0}]);
 E.start.gold=40;E.start.iron=3000;
 town('xan.citadel','The Citadel (the Sultan\'s Treasury, the court and the gate company)',840,1518,1200,'court',[
  {id:'cit.mint',kind:'mint',name:'the Mint and assay (the Master of Mines and Mints)',crew:20,batch:T.chain.mint}],{parent:'s57bkv9741',feeder:'s57bkv9741'});
 town('xan.dome','The Pleasure Dome (the harem and the Dome of the Bay)',840.9,1516.8,260,'dome',[],{parent:'s57bkv9741',feeder:'s57bkv9741'});
 town('skm4jjo2vl','Qiblai',922,1595,15000-T.orderHouse.house[5],'city',[
  {id:'qb.wheels',kind:'wheel-works',name:'the kora\'s prayer-wheel works',crew:200,batch:T.chain.wheel},
  {id:'qb.goldsmiths',kind:'goldsmiths',name:'the Goldsmiths\' hall of Qiblai',crew:120,batch:T.chain.goldsmith},
  {id:'qb.smithy',kind:'smithy',name:'the smiths',crew:80,batch:T.chain.smith}]);
 town('s4zvgepuru','Theodiga',908,1535,6000,'town',[
  {id:'th.salvage',kind:'salvage-floor',name:'the Salvagers\' guild: the breakers\' floor (only what the Dome has let fall)',crew:400,out:['scrap'],rate:rate(T.mine.scrap,400),site:{kind:'dome-fall',amount:Math.round(T.mine.scrap/12),regen:Math.round(T.mine.scrap/365)}},   /* X1: only what the Dome lets fall: a month's fall on the floor at most, a day's more each night */
  {id:'th.smelter',kind:'smelter',name:'the Salvagers\' smelter (scrap and charcoal to iron)',crew:60,batch:T.chain.smelt}]);
 town('sfgtxw10kr','Strongbow (the Royal Opal Gate)',1001,1596,4000,'town',[
  {id:'sb.terraces',kind:'tea-terraces',name:'the lift town\'s tea and silk terraces',crew:300,out:['tea','silk'],rate:rate(30000,300)}],{parent:'sl758m2396',feeder:'sl758m2396'});
 /* Kirstabal (settlements/kirstabal/PLAN.md, K1): the barge port at the lake's head, the Scarp's seat; its dugouts feed it and
    Strongbow, its boatyard and serai are stores the sim counts; the seat's chest pays the White Monastery's fee */
 town('sl758m2396','Kirstabal',989,1600,3000,'town',[
  {id:'ks.fishing',kind:'fishing',name:'the dugouts at the head of the lake',crew:150,out:['fish'],rate:rate(60000,150),site:T.fishery(60000)},
  {id:'ks.boatyard',kind:'dockyard',name:'the boatyard and the barge quays',crew:60,out:[],rate:0},
  {id:'ks.serai',kind:'serai',name:'the caravanserai by the Strongbow road',crew:40,out:[],rate:0}]).start.coin=400;
 town('sxan7r1sln','Strongwall (the Master of Mines\' fort)',912,1640,250,'fort',[
  {id:'sw.assay',kind:'assay-house',name:'the assay house',crew:20,batch:T.chain.assay}],{state:'kept'});   /* state: the fort asset's kept, damaged or ruined (settlements/strongwall/PLAN.md 5.6), which a raid's outcome sets */
 /* Phēr (settlements/pher/PLAN.md, the owner's answers 2026-11-16: "i likE all these"): the cacao house pressing the north
    shore's beans into cakes for the Great Caravan, and the boat slip where the hub's launches and cargo boats are repaired */
 town('xan.pher','Phēr (the north shore\'s fair)',843,1491,6000,'lake',[{id:'ph.fishing',kind:'fishing',name:'the dugouts',crew:600,out:['fish'],rate:rate(6000*T.fishKgPerson*.6,600),site:T.fishery(6000*T.fishKgPerson*.6)},
  {id:'ph.cacao',kind:'cacao-house',name:'the cacao house (roasting and pressing the beans into cakes)',crew:40,batch:T.chain.cacaoPress},
  {id:'ph.slip',kind:'boat-slip',name:'the boat slip (caulkers and sailmakers; the hulls are laid down at Boṭ-Yārḍ)',crew:60,out:[],rate:0}]);
 {const Lw=T.laitwal,id=Lw.id,fc=Math.round(Lw.people*.06),tc=Math.round(Lw.people*.08),fish=Lw.people*T.diet.lake.fish*365*Lw.fishK;
  town(id,Lw.name,Lw.px[0],Lw.px[1],Lw.people,'lake',[
   {id:'lw.potch',kind:'adit',name:'the Great Potch Line\'s adits (the wall\'s foot)',crew:Lw.adits,out:['opal'],rate:rate(Lw.make.opal,Lw.adits),site:T.field('opal-diggings',Lw.make.opal,T.fieldYears)},
   {id:'lw.glass',kind:'glass-shop',name:'the Glaziers\' glass shops (potch to moonglass)',crew:Lw.glass,out:['moonglass'],rate:rate(Lw.make.moonglass,Lw.glass)},
   {id:'lw.fishing',kind:'fishing',name:'the dugouts on the lake',crew:fc,out:['fish'],rate:rate(fish,fc),site:T.fishery(fish)},
   {id:'lw.terraces',kind:'terraces',name:'the bench terraces\' fields',crew:tc,out:['grain'],rate:rate(eatYr('lake',Lw.people)*Lw.terraces,tc,win('harvest')),season:'harvest'},
   {id:'lw.assay',kind:'assay-house',name:'the assay house on the bench (the Fifth in opals)',crew:12,out:[],rate:0}]);
  bump(id,-eatYr('lake',Lw.people)*Lw.terraces);}
 {const Tb=T.thalaba,c=Math.round(Tb.people*Tb.sulfurCrew),tc=Math.round(Tb.people*.3);   /* Thalaba at the mouth of Godshearth: the vents' sulfur, the bench's terraces */
  town(Tb.id,Tb.name,Tb.px[0],Tb.px[1],Tb.people,'town',[{id:'tb.sulfur',kind:'sulfur-works',name:'the spillway\'s sulfur diggings',crew:c,out:['sulfur'],rate:rate(Tb.make.sulfur,c)},
   {id:'tb.terraces',kind:'terraces',name:'the terraces on the bench',crew:tc,out:['grain'],rate:rate(eatYr('town',Tb.people)*Tb.terraces,tc,win('harvest')),season:'harvest'}],{parent:'xan.pher',feeder:'xan.pher'});}
 /* the work camps on the March */
 const mine=(id,name,px,py,people,parent,out,kgYr)=>{const p=at(px,py);seats[id]=add({id,name,faction:'xanadu',parent,people,x:p.x,z:p.z,eats:eats('camp'),keepDays:10,
  start:{grain:Math.round(eatYr('camp',people)*T.startDays/yr),salt:people*2,tea:people*.3,tools:people*.4},works:[{id:id+'.works',kind:'adit',name,crew:Math.round(people*.8),out:[out],rate:rate(kgYr,Math.round(people*.8)),site:T.field(out==='goldore'?'lode':'opal-diggings',kgYr,T.fieldYears)}]});bump(parent,eatYr('camp',people));};   /* the camps' grain counts on their parent's (L1: the opal mines on Lāiṭwāl's) */
 mine('smgxtultfq','The gold mines on the lode',911,1665,950,'sxan7r1sln','goldore',T.mine.goldore);
 mine('sjuarjbku0','Opal Valley Mines (the Sultan\'s factor)',1038,1662,850,'slaitwal0001','opal',T.mine.opal);   /* Lāiṭwāl's works village across the lake (L1); its opal ferried to Lāiṭwāl (the owner, 2026-11-16: "Ferry to laitwal", over W1's "opal goes to Strongbow first") */
 /* the forts of the Marches */
 [['march.w','The west watch fort',818,1531],['march.s','The south watch fort',847,1549],['march.e','The beacon fort over the Rift (the refurbished Ancient beacon, kept by the Yellow Monastery)',853,1540]]   /* march.w and march.s moved with Erehwon (+35,+1 px), each on dry ground; march.e on the east shoulder's knoll, the Order of the Beacon's head house below it (the owner, 2026-11-16: the site, then "Restore the knoll" when edit 7's re-run lowered it; settlements/beacon/PLAN.md) */.forEach(([id,name,px,py])=>{const p=at(px,py);
  add({id,name,faction:'xanadu',parent:'s57bkv9741',people:150,state:'kept',x:p.x,z:p.z,eats:eats('fort'),keepDays:30,start:{grain:Math.round(eatYr('fort',150)*.4),salt:300,tea:60,tools:40,arms:20,powder:100},
   works:[{id:id+'.store',kind:'fort',name:'the fort\'s store',crew:10,out:[],rate:0}]});bump('s57bkv9741',eatYr('fort',150));
  R.push({id:'road.'+id,from:'s57bkv9741',to:id,minutes:Math.round(Math.hypot(p.x-E.x,p.z-E.z)/1000/25*1440),cap:20000,want:40,goods:{s57bkv9741:['grain','salt','tea','tools','arms']}});});
 /* the House of the Tempest: the Order of the Violet Storm's monks of sword and bow (no powder), fed through Strongwall
    less what its terraces on the West Arm make */
 {const Tm=T.tempest,tc=Math.round(Tm.people*.3),terr=eatYr('fort',Tm.people)*Tm.terraces;
  const s=town(Tm.id,Tm.name,Tm.px[0],Tm.px[1],Tm.people,'fort',[{id:'tp.terraces',kind:'terraces',name:'the monks\' terraces on the West Arm',crew:tc,out:['grain'],rate:rate(terr,tc,win('harvest')),season:'harvest'}],
   {parent:'sxan7r1sln',feeder:'sxan7r1sln',keepDays:30,state:'kept'});
  delete s.eats.powder;s.start.arms=30;bump('sxan7r1sln',-terr);}   /* a year of arms in its armoury */
 /* B4: the Order of the Beacon's head house beside the beacon fort (settlements/beacon/PLAN.md section 5): the fort diet
    less arms and powder, its terraces two fifths of its grain, the rest from the capital on the fort's road */
 {const Bc=T.beacon,F=S.find(q=>q.id===Bc.fort),tc=Math.round(Bc.people*.3),terr=eatYr('fort',Bc.people)*Bc.terraces;
  const s=add({id:Bc.id,name:Bc.name,faction:'xanadu',parent:'s57bkv9741',people:Bc.people,x:F.x,z:F.z,eats:eats('fort'),keepDays:30,state:'kept',
   start:{grain:Math.round(eatYr('fort',Bc.people)*T.startDays/yr),salt:Math.round(Bc.people*6*.4),tea:Bc.people,tools:Bc.people*.3},
   works:[{id:Bc.id+'.market',kind:'market',name:'the granary and its stores',crew:10,out:[],rate:0},
    {id:'bc.terraces',kind:'terraces',name:'the monks\' terraces on the saddle',crew:tc,out:['grain'],rate:rate(terr,tc,win('harvest')),season:'harvest'}]});
  seats[Bc.id]=s;delete s.eats.powder;delete s.eats.arms;bump('s57bkv9741',eatYr('fort',Bc.people)-terr);
  R.push({id:'road.er-beacon',from:'s57bkv9741',to:Bc.id,minutes:Math.round(Math.hypot(F.x-E.x,F.z-E.z)/1000/25*1440),cap:20000,want:40,goods:{s57bkv9741:['grain','salt','tea','tools']}});}
 /* ---- THE LAKE TOWNS AND ISLANDS: fish and their trade to the hub by share; grain, salt and tools back by want */
 const lakeTown=(L)=>{const pf=L.pre||'lk.',dk=L.diet||'lake',p=at(L.px,L.py),fishing=L.key!=='weaver'&&L.key!=='pottery'&&L.key!=='quarry'&&L.key!=='boatyard'&&L.key!=='landing',works=[],sh={};
  const crew=crewOf(L.people,400);
  if(fishing)works.push({id:pf+L.key+'.fishing',kind:'fishing',name:'the dugouts',crew:Math.round(crew*.5),out:['fish'],rate:rate(L.people*T.fishKgPerson*.6,Math.round(crew*.5)),site:T.fishery(L.people*T.fishKgPerson*.6)});
  else works.push({id:pf+L.key+'.store',kind:'warehouse',name:'the landing',crew:10,out:[],rate:0});
  Object.keys(L.make).forEach(g=>{if(g==='brocade')return;const c=Math.round(crew*.5);works.push({id:pf+L.key+'.'+g,kind:g+'-works',name:L.name+'\'s '+g,crew:c,out:[g],rate:rate(L.make[g],c,g==='tea'?win('tea-flush'):g==='saffron'?win('saffron'):g==='silk'?win('silk'):g==='cacao'?win('cacao'):null),
   season:g==='tea'?'tea-flush':g==='saffron'?'saffron':g==='silk'?'silk':g==='cacao'?'cacao':undefined});sh[g]=g==='grain'?.5:.85;});
  if(L.key==='weaver')works.unshift({id:'lk.weaver.looms',kind:'weavers',name:'Wībhar\'s looms',crew:300,batch:T.chain.weave});
  if(fishing)sh.fish=.55;
  if(L.key==='alph-head')sh.grain=.6;
  const id=pf+L.key;add({id,name:L.name,faction:'xanadu',parent:L.hub,people:L.people,x:p.x,z:p.z,eats:eats(dk),keepDays:15,
   start:{grain:Math.round(eatYr(dk,L.people)*T.startDays/yr),salt:L.people*2.5,tea:L.people*.3,tools:L.people*.2,fish:L.people*5},works});
  /* the terraces above every lake town: about three fifths of its own grain (Atitlán's milpa on the slopes); the hub sends the rest */
  const terr=eatYr(dk,L.people)*T.lakeTerraces,tc=Math.round(crew*.4);
  works.push({id:pf+L.key+'.terraces',kind:'terraces',name:'the terraces above the shore',crew:tc,out:['grain'],rate:rate(terr,tc,win('harvest')),season:'harvest'});
  const own=terr+(L.make.grain?L.make.grain*(1-.6):0);bump(L.hub,Math.max(0,eatYr(dk,L.people)-own));
  const km=Math.max(3,Math.hypot(p.x-seats[L.hub].x,p.z-seats[L.hub].z)/1000);
  R.push({id:(pf==='lk.'?'lake.':'lowerlake.')+L.key,from:id,to:L.hub,minutes:Math.round(km/12*60)+60,cap:8000,carriers:Math.max(1,Math.round(L.people/800)),share:{[id]:sh},want:10,
   goods:{[L.hub]:['grain','salt','tea','tools','fruit'].concat(L.key==='weaver'?['silk']:[])},expect:L.key==='weaver'?{[id]:{silk:6}}:undefined});
  X.push({id,hub:L.hub,km,fishing});};
 T.lake.filter(L=>L.key!=='pher').forEach(lakeTown);
 T.islands.forEach(I=>lakeTown({key:I.key,name:I.name,px:I.px,py:I.py,people:I.people,make:{},prov:'p1',hub:'s57bkv9741'}));
 T.lowerLake.forEach(lakeTown);   /* K1: Kirstabal's lake, hub Kirstabal (its ids 'll.', its roads 'lowerlake.') */
 /* the Order of the Flashing Eye's head house on the east volcano (settlements/flashing-eye/PLAN.md section 4), after the lake
    towns: its tea road starts at Ṭī-Ṭeras. Grain, salt and tools from the capital: the lake leg by launch, then the west road */
 {const Fe=T.flashingeye,p=at(Fe.px[0],Fe.px[1]),tc=Math.round(Fe.people*.3),terr=eatYr('fort',Fe.people)*Fe.terraces;
  const s=add({id:Fe.id,name:Fe.name,faction:'xanadu',parent:'s57bkv9741',people:Fe.people,x:p.x,z:p.z,eats:eats('fort'),keepDays:30,state:'kept',
   start:{grain:Math.round(eatYr('fort',Fe.people)*T.startDays/yr),salt:Math.round(Fe.people*6*.4),tea:Fe.people,tools:Fe.people*.3},
   works:[{id:Fe.id+'.market',kind:'market',name:'the Foot House\'s stores',crew:10,out:[],rate:0},
    {id:'fe.terraces',kind:'terraces',name:'the monks\' terraces on the cone',crew:tc,out:['grain'],rate:rate(terr,tc,win('harvest')),season:'harvest'}]});
  seats[Fe.id]=s;delete s.eats.powder;delete s.eats.arms;bump('s57bkv9741',eatYr('fort',Fe.people)-terr);
  const up=Math.round(Fe.roadKm/25*1440);
  R.push({id:'road.er-eye',from:'s57bkv9741',to:Fe.id,minutes:Math.round(Fe.lakeKm/12*60)+up,cap:20000,want:40,goods:{s57bkv9741:['grain','salt','tools']}});
  R.push({id:'road.eye-tea',from:'lk.tea-terraces',to:Fe.id,minutes:up,cap:4000,want:40,goods:{'lk.tea-terraces':['tea']}});}
 /* the hubs: the cross-lake run, Erehwon to Phēr, measured from the two (52 km straight over; a tenth more round the long isle) */
 const crossKm=Math.hypot(E.x-seats['xan.pher'].x,E.z-seats['xan.pher'].z)/1000*1.1;
 R.push({id:'lake.cross',from:'s57bkv9741',to:'xan.pher',minutes:Math.round(crossKm/12*60)+60,cap:20000,carriers:6,want:12,goods:{s57bkv9741:['grain','salt','tea','tools','pottery','mats'],'xan.pher':['fish','silk','cacao','cacaocake','honey','sulfur','fruit']}});
 /* ---- THE RINGS (the open world's plan): Erehwon's and Qiblai's farming villages and ranches, a tithe road each */
 /* the ring follows its town: the region plan still has Erehwon on the first lake's shore (805,1516) until the region is recut
    on the re-run model, so each hamlet keeps its place relative to the town (farm-1 would fall in the new lake: a cell inland) */
 const ringFix={'s57bkv9741/hamlet/farm-1':[843,1520]};
 const ringY={s57bkv9741:1.6,skm4jjo2vl:1.9,'xan.pher':1.5},ringPop={};
 Object.keys(T.ringSites).forEach(sid=>{ringY[sid]=T.ringSites[sid].y;});
 ['s57bkv9741','skm4jjo2vl','xan.pher'].concat(Object.keys(T.ringSites)).forEach(sid=>{const RS=T.ringSites[sid];
  let St=sid==='xan.pher'?{x:seats[sid].x,z:seats[sid].z,hamlets:T.pherRing.map(V=>Object.assign({},V,{site:at(V.px,V.py)}))}:site(RS?RS.site:sid);if(!St||!seats[sid])return;const dx=seats[sid].x-St.x,dz=seats[sid].z-St.z;
  if(RS){St=Object.assign({},St,{hamlets:(St.hamlets||[]).filter(V=>V.focus==='farming'||V.focus==='ranch')});St.hamlets.forEach(V=>{ringPop[RS.prov]=(ringPop[RS.prov]||0)+V.census.pop;});}
  St=Object.assign({},St,{hamlets:St.hamlets.map(V=>{const f=ringFix[V.id],p=f?at(f[0],f[1]):{x:V.site.x+dx,z:V.site.z+dz};return Object.assign({},V,{site:Object.assign({},V.site,{x:p.x,z:p.z})});})});
  St.hamlets.forEach(V=>{const id=V.id.replace(/\//g,'.'),y=ringY[sid];
  const hh=V.census.households,crew=Math.round(V.census.pop*.45);
  if(V.focus==='farming'){const made=hh*T.netKgHH(y),own=eatYr('rural',V.census.pop),share=Math.max(0,Math.min(.9,(made-own)*.8/made));
   add({id,name:V.name+' ('+seats[sid].name+'\'s ring)',faction:'xanadu',parent:sid,people:V.census.pop,x:V.site.x,z:V.site.z,eats:eats('rural'),
    start:{grain:Math.round(own*T.startDays/yr),salt:200,tea:30,tools:30},works:[{id:id+'.fields',kind:'farmstead',name:'the fields',crew,out:['grain'],rate:rate(made,crew,win('harvest')),season:'harvest'}]});
   R.push({id:'tithe.'+id,from:id,to:sid,minutes:240,cap:40000,share:{[id]:{grain:share}},goods:{[sid]:['salt','tea','tools']}});bump(sid,-(made-own)*.8);}
  else{add({id,name:V.name+' ('+seats[sid].name+'\'s ring)',faction:'xanadu',parent:sid,people:V.census.pop,x:V.site.x,z:V.site.z,eats:eats('rural'),
    start:{grain:Math.round(eatYr('rural',V.census.pop)*.5),dairy:500,salt:200,tea:30,tools:30},
    works:[{id:id+'.byre',kind:'byre',name:'the byres',crew,herd:{out:['dairy'],rate:.4/24,animals:300},pasture:{id:id+'.pasture',window:'summer-pasture'}}]});
   R.push({id:'tithe.'+id,from:id,to:sid,minutes:240,cap:20000,share:{[id]:{dairy:.6}},goods:{[sid]:['grain','salt','tea','tools']}});}});});
 /* K1: Kirstabal's ring (T.ksRing): its farming villages and its ranch on the floor south of the town, a tithe road each, as the rings above */
 T.ksRing.forEach(([id,name,px,py,focus,pop,hh])=>{const sid='sl758m2396',p=at(px,py),crew=Math.round(pop*.45),y=1.3;
  if(focus==='farming'){const made=hh*T.netKgHH(y),own=eatYr('rural',pop),share=Math.max(0,Math.min(.9,(made-own)*.8/made));
   add({id,name:name+' (Kirstabal\'s ring)',faction:'xanadu',parent:sid,people:pop,x:p.x,z:p.z,eats:eats('rural'),
    start:{grain:Math.round(own*T.startDays/yr),salt:200,tea:30,tools:30},works:[{id:id+'.fields',kind:'farmstead',name:'the fields',crew,out:['grain'],rate:rate(made,crew,win('harvest')),season:'harvest'}]});
   R.push({id:'tithe.'+id,from:id,to:sid,minutes:240,cap:40000,share:{[id]:{grain:share}},goods:{[sid]:['salt','tea','tools']}});bump(sid,-(made-own)*.8);}
  else{add({id,name:name+' (Kirstabal\'s ring)',faction:'xanadu',parent:sid,people:pop,x:p.x,z:p.z,eats:eats('rural'),
    start:{grain:Math.round(eatYr('rural',pop)*.5),dairy:300,salt:120,tea:20,tools:20},
    works:[{id:id+'.byre',kind:'byre',name:'the byres',crew,herd:{out:['dairy'],rate:.4/24,animals:200},pasture:{id:id+'.pasture',window:'summer-pasture'}}]});
   R.push({id:'tithe.'+id,from:id,to:sid,minutes:240,cap:20000,share:{[id]:{dairy:.6}},goods:{[sid]:['grain','salt','tea','tools']}});}});
 /* ---- THE INTERNAL ROADS (net51's xanadu class and Gemini's barge links; minutes at 25 km a day by road, 60 by barge) */
 const road=(id,a,b,km,mode,goods,o3)=>R.push(Object.assign({id,from:a,to:b,minutes:Math.round(km/(mode==='barge'?60:25)*1440),cap:mode==='barge'?60000:30000,carriers:o3&&o3.carriers!=null?o3.carriers:3,stagger:Math.round(km/25*1440/3),want:o3&&o3.want!=null?o3.want:30,goods},o3&&o3.expect?{expect:o3.expect}:{}));
 road('road.er-qb','s57bkv9741','skm4jjo2vl',321,'road',{s57bkv9741:['salt','iron','tools','arms','wine','pearls','gold'],skm4jjo2vl:['grain','cacao','goldwork','wheels','honey','dairy','timber','charcoal','tea','opium','saffron','silk','opal']},{carriers:6});   /* opal: in from Strongbow by Kirstabal (W1) */
 road('road.er-th','s57bkv9741','s4zvgepuru',228,'barge',{s57bkv9741:['salt','tools','arms','charcoal'],s4zvgepuru:['grain','cacao','saffron','tea','opium','silk','iron','fruit','rarities']},{carriers:4,expect:{s4zvgepuru:{charcoal:330}}});   /* rarities: the bore's, for the Great Caravan */
 road('road.qb-th','skm4jjo2vl','s4zvgepuru',155,'barge',{skm4jjo2vl:['charcoal','grain','salt'],s4zvgepuru:['iron','tools']},{carriers:3,expect:{s4zvgepuru:{charcoal:330},skm4jjo2vl:{iron:40}}});
 road('road.qb-sw','skm4jjo2vl','sxan7r1sln',83,'road',{skm4jjo2vl:['grain','salt','tea','tools','dairy','arms','powder'],sxan7r1sln:['gold','copper']},{carriers:3,expect:{skm4jjo2vl:{gold:.12,copper:20}}});
 /* K1: the barges down the lake to the Landing (T.portage.lake km), then the portage road past the cataracts to Qiblai
    (T.portage.km); the road to Strongbow's foot over the bridge (15 km), then the lift to the lip (T.lift minutes) */
 road('road.qb-ks','skm4jjo2vl','sl758m2396',T.portage.lake,'barge',{skm4jjo2vl:['grain','salt','tools'],sl758m2396:['tea','cacao','opium','saffron','silk','dairy']},{carriers:3});
 R[R.length-1].minutes+=Math.round(T.portage.km/25*1440);   /* through the Landing (ll.landing): one road, timed by both legs */
 road('road.ks-sb','sl758m2396','sfgtxw10kr',15,'road',{sl758m2396:['grain','salt','tools','fish'],sfgtxw10kr:['tea','silk']},{carriers:2});
 R[R.length-1].minutes+=T.lift;
 road('road.sw-gold','sxan7r1sln','smgxtultfq',50,'road',{sxan7r1sln:['grain','salt','tea','tools']},{carriers:2});
 road('road.sw-tempest','sxan7r1sln',T.tempest.id,T.tempest.km,'road',{sxan7r1sln:['grain','salt','tea','tools','arms']},{carriers:2});
 R.push({id:'mine.gold',from:'smgxtultfq',to:'sxan7r1sln',minutes:Math.round(50/25*1440),cap:20000,carriers:2,share:{smgxtultfq:{goldore:1}},goods:{sxan7r1sln:['grain','salt','tea','tools']}});
 /* L1 (the owner, 2026-11-16: "Ferry to laitwal"): the mines' opal over the lake to Lāiṭwāl by its ferry (27 km), the mines'
    bread back; from Lāiṭwāl it goes down the valley with the town's own (road.lw-ks). The Fifth goes straight to the Treasury */
 R.push({id:'mine.opal',from:'sjuarjbku0',to:'slaitwal0001',minutes:Math.round(T.laitwal.ferryKm/60*1440),cap:20000,carriers:2,want:30,share:{sjuarjbku0:{opal:1-T.fifth}},
  goods:{'slaitwal0001':['grain','salt','tea','tools']},expect:{sjuarjbku0:{grain:eatYr('camp',850)/yr,salt:850*2/yr,tea:60/yr,tools:120/yr}}});
 /* L1: the Glaziers' Fifth in opals from the assay house on the bench; Lāiṭwāl's opal and moonglass down the valley by
    Kirstabal (its grain up the same road) and the barges to Qiblai, where Yuni's caravans take them */
 R.push({id:'fifth.opal.lw',from:'slaitwal0001',to:'xan.citadel',minutes:Math.round(560/25*1440),cap:1000,carriers:1,share:{'slaitwal0001':{opal:T.fifth}},goods:{'xan.citadel':[]}});
 {const lw=T.laitwal,dn=(lw.make.opal*(1-T.fifth)+T.mine.opal*(1-T.fifth))/365*.9,mg=lw.make.moonglass/365*.9;
  road('road.lw-ks','slaitwal0001','sl758m2396',lw.kirstabalKm,'road',{'slaitwal0001':['opal','moonglass','fish'],sl758m2396:['grain','salt','tea','tools']},{carriers:3,expect:{sl758m2396:{opal:dn,moonglass:mg}}});
  const qk=R.find(r=>r.id==='road.qb-ks');qk.goods.sl758m2396=qk.goods.sl758m2396.concat(['opal','moonglass']);qk.expect=Object.assign({},qk.expect||{},{skm4jjo2vl:{opal:dn*.95,moonglass:mg*.95}});}   /* the Fifth goes straight to the Treasury (below) */
 /* the Sultan's Fifth: a fifth of the gold the assay makes and of the opal, to the Treasury */
 R.push({id:'fifth',from:'sxan7r1sln',to:'xan.citadel',minutes:Math.round(404/25*1440),cap:5000,carriers:2,share:{sxan7r1sln:{gold:T.fifth}},goods:{'xan.citadel':[]}});
 R.push({id:'fifth.opal',from:'sjuarjbku0',to:'xan.citadel',minutes:Math.round(560/25*1440),cap:1000,carriers:1,share:{sjuarjbku0:{opal:T.fifth}},goods:{'xan.citadel':[]}});
 /* the rest of the gold and opal down to the capital's goldsmiths and market */
 road('road.sw-er','sxan7r1sln','s57bkv9741',404,'road',{sxan7r1sln:['gold','copper'],s57bkv9741:['salt','tools','arms']},{carriers:3,expect:{s57bkv9741:{gold:.3,copper:10}}});   /* the opal reaches the capital by Strongbow, Kirstabal and Qiblai now (W1) */
 /* the capital feeds its court and its Dome; the court sends the mint's coin back to the market */
 road('road.er-cit','s57bkv9741','xan.citadel',1,'road',{s57bkv9741:['grain','fish','fruit','salt','tea','cacao','saffron','silk','tools','arms','gold'],'xan.citadel':['coin']},{carriers:4,want:20,expect:{'xan.citadel':{gold:.1}}});
 road('road.er-dome','s57bkv9741','xan.dome',1,'road',{s57bkv9741:['grain','fish','fruit','salt','tea','cacao','saffron','silk','pearls','wine','oil','honey']},{carriers:2,want:20});
 /* ---- THE PROVINCES' COUNTRYSIDES: the bulk district of each, tithing grain and its land's goods to its seat */
 const named={};T.lake.forEach(L=>{named[L.prov]=(named[L.prov]||0)+L.people;});T.islands.forEach(I=>{named.p1=(named.p1||0)+I.people;});
 T.lowerLake.forEach(L=>{named.p5=(named.p5||0)+L.people;});T.ksRing.forEach(r=>{named.p5=(named.p5||0)+r[5];});   /* K1 */
 named.p1=(named.p1||0)+1345+150*3;named.p3=(named.p3||0)+1345;named.p4=(named.p4||0)+950+T.tempest.people;named.p6=(named.p6||0)+850+T.laitwal.people+(ringPop.p6||0);named.p7=(named.p7||0)+(ringPop.p7||0);named.p7=(named.p7||0)+T.thalaba.people+T.pherRing.reduce((n,V)=>n+V.census.pop,0);   /* Phēr is in P7's lake towns: its seat, counted once */
 T.provinces.forEach(Pv=>{const people=Math.max(1000,Pv.rural-(named[Pv.id]||0)),hh=people/T.farm.hh,made=hh*T.farm.farmShare*T.netKgHH(Pv.y),own=eatYr('rural',people);
  const id='prov.'+Pv.id,p=at(Pv.px[0],Pv.px[1]),crew=Math.min(2000,Math.round(people*.45));
  const works=[{id:id+'.fields',kind:'farmstead',name:'the province\'s fields (its villages, in bulk)',crew,out:['grain'],rate:rate(made,crew,win('harvest'),T.scaleBulk),season:'harvest'}],sh={};
  Object.keys(Pv.extra).forEach(g=>{const c=Math.min(600,Math.round(crew*.3)),w=g==='tea'?'tea-flush':g==='saffron'?'saffron':g==='silk'?'silk':g==='cacao'?'cacao':g==='opium'||g==='latex'?'lancing':null;
   works.push(Object.assign({id:id+'.'+g,kind:g+'-works',name:'the province\'s '+g,crew:c,out:[g],rate:rate(Pv.extra[g],c,w?win(w):null,T.scaleBulk),season:w||undefined},g==='copper'?{site:{kind:'lode',grade:'rich',amount:Pv.extra[g]*T.lodeYears}}:{}));sh[g]=g==='timber'?.3:g==='dairy'?.5:.85;});
  add({id,name:Pv.name+': its countryside',faction:'xanadu',parent:Pv.seat,scale:T.scaleBulk,people,x:p.x,z:p.z,eats:eats('rural'),keepDays:30,start:{grain:Math.round(own*T.startDays/yr),salt:people*2,tea:people*.2,tools:people*.15},works});
  const surplus=made-own;Pv._made=made;Pv._own=own;Pv._people=people;Pv._id=id;Pv._sh=sh;Pv._surplus=surplus;});
 /* the grain tithe: each seat's need (its own table, the lake towns and camps it feeds, the dues it owes) covered with a
    margin, from its province's surplus, never more than four fifths of what the countryside made */
 const dueGrain=s=>((T.dues.bills[s]||{}).grain||0),cap={},bySeat={};
 T.provinces.forEach(Pv=>{(bySeat[Pv.seat]=bySeat[Pv.seat]||[]).push(Pv);cap[Pv.seat]=(cap[Pv.seat]||0)+Math.max(0,Pv._surplus)*.85;});
 /* a seat whose provinces cannot feed what it feeds passes the rest up its road (the March's camps to Qiblai, the capital's
    lake to the Vale and the Cataracts); the road between expects it, a floor on the hungry end's want */
 const NEED={};Object.keys(need).forEach(s=>{NEED[s]=need[s]*1.15+dueGrain(s);});
 const moved=[],passTo={'slaitwal0001':'sl758m2396',sxan7r1sln:'skm4jjo2vl',sl758m2396:'skm4jjo2vl','xan.pher':'s57bkv9741'};
 ['slaitwal0001','sxan7r1sln','sl758m2396','xan.pher'].forEach(s=>{const d=(NEED[s]||0)-(cap[s]||0);if(d>0&&passTo[s]){NEED[passTo[s]]=(NEED[passTo[s]]||0)+d;NEED[s]-=d;moved.push([passTo[s],s,d]);}});
 {const d=(NEED[E.id]||0)-(cap[E.id]||0);if(d>0){const spare=s=>Math.max(0,(cap[s]||0)-(NEED[s]||0)),sv=['s4zvgepuru','skm4jjo2vl'],tot=sv.reduce((n,s)=>n+spare(s),0);
  sv.forEach(s=>{const k=tot>0?d*spare(s)/tot:d/2;NEED[s]=(NEED[s]||0)+k;moved.push([s,E.id,k]);});NEED[E.id]-=d;}}
 moved.forEach(([from,to,kg])=>{const Rd=R.find(r=>(r.from===from&&r.to===to)||(r.to===from&&r.from===to));if(!Rd)return;Rd.expect=Rd.expect||{};
  Rd.expect[to]=Object.assign({},Rd.expect[to]||{});Rd.expect[to].grain=(Rd.expect[to].grain||0)+kg/365;Rd._grainKg=(Rd._grainKg||0)+kg;
  if(Rd.goods&&Rd.goods[from]&&Rd.goods[from].indexOf('grain')<0)Rd.goods[from].push('grain');});
 T._moved=moved;
 T.provinces.forEach(Pv=>{const sum=bySeat[Pv.seat].reduce((n,q)=>n+Math.max(1,q._surplus),0),n=(NEED[Pv.seat]||0)*Math.max(1,Pv._surplus)/sum;
  const share=Math.max(.05,Math.min(.85,Math.min(Pv._surplus*.9,n)/Pv._made));
  Pv._sh.grain=share;Pv._share=share;
  const sp=seats[Pv.seat],km=Math.max(5,Math.hypot(sp.x-at(Pv.px[0],Pv.px[1]).x,sp.z-at(Pv.px[0],Pv.px[1]).z)/1000);
  R.push({id:'tithe.'+Pv._id,from:Pv._id,to:Pv.seat,minutes:Math.round(km/25*1440)+240,cap:200000,carriers:4,share:{[Pv._id]:Pv._sh},goods:{[Pv.seat]:['salt','tea','tools']}});});
 /* the seats send on what the capital's market exports and the court's dues need: Phēr's and Theodiga's goods come by the
    lake and the barge roads above; Kirstabal's by Qiblai */
 /* ---- THE GATEWAYS: off the map, a pool each, reached from its staging town (X1). The caravans start at the gateway, so
    the first salt lands within their first passage. Each exported good's take is split among the gateways that carry it */
 const carriedBy={};T.gateways.forEach(G=>G.out.forEach(g=>{carriedBy[g]=(carriedBy[g]||0)+1;}));
 const pool=G=>Object.fromEntries(G.in.filter(g=>T.gatePool[g]).map(g=>[g,T.gatePool[g]]));   /* a gateway's pool holds only what it brings in */
 const offMap=(id,name,start)=>add({id,name:name+' (off the map)',faction:'gate',people:0,x:E.x,z:E.z-1e6,eats:{},keepDays:0,start,
   works:[{id:id+'.market',kind:'bazaar',name:'the gateway\'s bazaar',crew:0,out:[],rate:0}]});
 T.gateways.forEach(G=>{const exp={};G.out.forEach(g=>{if(T.gateWant[g])exp[g]=T.gateWant[g]/carriedBy[g];});G._exp=exp;
  if(G.round){   /* the Great Caravan: Shelf first (the clock opens in the fall), the winter towns, back to the capital in the
                    spring to load the exports its market has gathered, then Blakhed and Nulab */
   G.dalab.forEach(([id,name],i)=>offMap(id,name,i===G.dalab.length-1?pool(G):{}));
   const [bl,nu,sh]=G.dalab.map(d=>d[0]),stops=[sh].concat(G.winter,[G.winter[0],bl,nu]),goods={},expect={};
   G.winter.forEach(w=>{goods[w]=[];});goods[G.winter[0]]=G.out.slice();goods[bl]=[];goods[nu]=[];goods[sh]=G.in.slice();
   expect[G.winter[0]]={iron:30,wine:3,pearls:.06};expect[bl]=Object.assign({},exp);
   R.push({id:'caravan.great',stops,minutes:G.days*1440,carriers:G.carriers,cap:G.cap,keep:20,want:365,goods,expect});G._stops=stops;return;}
  offMap(G.id,G.name,pool(G));
  R.push({id:'trade.'+G.id,from:G.id,to:G.entry,minutes:G.days*1440,carriers:G.carriers,stagger:Math.round(G.days*1440/G.carriers),cap:G.cap,keep:20,want:Math.max(60,G.days*2),
   goods:{[G.entry]:G.out,[G.id]:G.in},expect:{[G.id]:exp,[G.entry]:{iron:30,arms:.5,pearls:.06,wine:3,oil:2,powder:.5}}});});
 /* the staging towns gather their gateways' goods from behind them: Strongbow from Kirstabal from Qiblai, Thalaba from Phēr
    from the capital (a road for goods beside Thalaba's tithe road, which carries nothing for want out of Thalaba) */
 const takeAt=entry=>{const e={};T.gateways.filter(G=>G.entry===entry).forEach(G=>{for(const g in G._exp)e[g]=(e[g]||0)+G._exp[g];});return e;};
 const TB=T.thalaba.id,sbTake=takeAt('sfgtxw10kr'),thTake=takeAt(TB),gList=o=>Object.keys(o);
 /* Phēr up to Thalaba on the bench by the Qol valley (the owner, 2026-11-16: "up into the qol valley"; traced by the Phēr
    plan on the re-run model: 42 km west-north-west over the plain to the Qol at 822.7,1480, 34 km up the valley to its head
    at 826.7,1463.6, 27 km along the bench: about 105 km, 4 days): the gateways' goods and Thalaba's grain up, the northern
    salt and the sulfur down */
 {const km=T.thalaba.roadKm,tbDay=eatYr('town',T.thalaba.people)*(1-T.thalaba.terraces)/yr;
  R.push({id:'road.pher-thalaba',from:'xan.pher',to:TB,minutes:Math.round(km/25*1440),cap:10000,carriers:6,stagger:Math.round(km/25*1440/6),want:25,
   goods:{'xan.pher':gList(thTake).concat(['grain','tea','tools']),[TB]:['sulfur','wax','rarities','hearthseed']},expect:{[TB]:Object.assign({grain:tbDay},thTake)}});}
 const addGoods=(id,from,gs)=>{const Rd=R.find(r=>r.id===id);gs.forEach(g=>{if(Rd.goods[from].indexOf(g)<0)Rd.goods[from].push(g);});return Rd;};
 const addExpect=(Rd,at,o)=>{Rd.expect=Rd.expect||{};Rd.expect[at]=Object.assign({},Rd.expect[at]||{});for(const g in o)Rd.expect[at][g]=(Rd.expect[at][g]||0)+o[g];};
 addExpect(addGoods('road.ks-sb','sl758m2396',gList(sbTake)),'sfgtxw10kr',sbTake);
 addExpect(addGoods('road.qb-ks','skm4jjo2vl',gList(sbTake)),'sl758m2396',sbTake);
 addExpect(addGoods('lake.cross','s57bkv9741',gList(thTake)),'xan.pher',thTake);
 /* the salt comes in at the staging towns, so it goes inward: Strongbow to Kirstabal to Qiblai, Thalaba to Phēr to the
    capital; the capital and Qiblai no longer send it to each other */
 addGoods('road.ks-sb','sfgtxw10kr',['salt','iron','arms','opal']);addGoods('road.qb-ks','sl758m2396',['salt','iron','arms','opal']);   /* opal inward from Strongbow (W1) */
 addExpect(R.find(r=>r.id==='road.ks-sb'),'sl758m2396',{opal:T.gateWant.opal});addExpect(R.find(r=>r.id==='road.qb-ks'),'skm4jjo2vl',{opal:T.gateWant.opal});   /* nothing inward eats opal: Kirstabal and Qiblai draw a day's make on, for Yuni's caravans and the capital's market */
 addGoods('road.pher-thalaba',TB,[]);addGoods('lake.cross','xan.pher',['sulfur','wax','rarities','hearthseed']);   /* the vents' goods down to the capital for the Great Caravan */
 /* ... and asked for on the way down (a road moves a good only when its receiver wants it, and nothing below Thalaba uses
    these): Phēr and the capital each expect Thalaba's year of them a day, its own deposit's and both camps' make home,
    less the Sultan's share (`T.haul`), so the vents' goods and the Dalab mission's hearth seed reach the Great Caravan */
 {const H=T.haul,own=g=>H[g]!=null?H[g]:H.all,Xd=T.expedition.make,Dd=T.dalab.party.make,
   tbDown={sulfur:(T.thalaba.make.sulfur+Xd.sulfur*.95*(1-own('sulfur')))/yr,wax:(Xd.wax+Dd.wax)*.95*(1-own('wax'))/yr,
    rarities:Xd.rarities*.95*(1-own('rarities'))/yr,hearthseed:Dd.hearthseed*.95*(1-own('hearthseed'))/yr};
  addExpect(R.find(r=>r.id==='road.pher-thalaba'),'xan.pher',tbDown);addExpect(R.find(r=>r.id==='lake.cross'),'s57bkv9741',tbDown);}
 ['road.ks-sb','road.qb-ks'].forEach(id=>{const Rd=R.find(r=>r.id===id),down=Rd.from;Rd.goods[down]=Rd.goods[down].filter(g=>g!=='salt');});
 {const Rd=R.find(r=>r.id==='road.er-qb');Rd.goods.s57bkv9741=Rd.goods.s57bkv9741.filter(g=>g!=='salt');}
 /* ---- THE LAKE'S MARKET BOATS (X1: multi-stop rounds) */
 T.rounds.concat(T.lowerRounds).forEach(([id,hub,keys,pre])=>{const stops=[hub].concat(keys.map(k=>(pre||'lk.')+k)),pts=stops.map(s=>S.find(q=>q.id===s));
  let km=0;for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];km+=Math.hypot(a.x-b.x,a.z-b.z)/1000;}
  /* SIM.trade's round lands a boat's whole load at the next stop, so the wares go round as a relay: every stop holds the
     round's use of the market's wares (half of it), not only its own, and keeps few days back (Atitlán's boats: the pots
     of one town in every town by the week's end) */
  const wares=['pottery','mats','honey','fruit','fish'],use={};wares.forEach(g=>{use[g]=pts.reduce((n,s)=>n+s.people*((s.eats||{})[g]||0),0);});
  const expect={};stops.forEach(s=>{expect[s]={};wares.forEach(g=>{if(use[g]>0)expect[s][g]=use[g]*.5;});});
  R.push({id,stops,minutes:Math.round(km/pts.length/12*60)+30,cap:6000,carriers:3,stagger:120,want:8,keep:3,goods:null,expect});});
 /* ---- X2: THE GEOMANCERS' OIL (the owner, 2026-11-16: "The geomancers run the oil near Qiblai no? maybe their caravans
    should tend to stop there"). The Geomancers' concession (the drilling guild of Locus, LORE.md "The Geomancers") works
    Qiblai's field as Yuni's mission (the owner: "the yuni mission/oilfield near town"): a fifth of the oil to the Sultan by
    the licence and a tenth to the Prismarchy, both burned for power (THE POWER, above), the rest to Qiblai's market, where
    their own caravans stop for it and trade (a gateway entering at Qiblai) */
 {const p=at(T.oil.px[0],T.oil.px[1]);add({id:'geo.oilfield',name:'The Geomancers\' concession (Qiblai\'s oil field, beside Yuni\'s mission)',faction:'geomancer',parent:'skm4jjo2vl',people:T.oil.people,x:p.x,z:p.z,eats:eats('camp'),keepDays:20,
   start:{grain:Math.round(eatYr('camp',T.oil.people)*T.startDays/yr),salt:T.oil.people*2,tea:60,tools:120},
   works:[{id:'geo.wells',kind:'pumpjacks',name:'the wells and the still-house',crew:Math.round(T.oil.people*.7),out:['oil'],rate:rate(T.oil.kgYr,Math.round(T.oil.people*.7))},
  ]});
  bump('skm4jjo2vl',eatYr('camp',T.oil.people));
  /* the generators: a town's cut of the oil burned all year, its power used by the town (Qiblai's avenues and all but its
     poor quarters; elsewhere the avenues and the richest homes) */
  const dynamo=(town,kgYr)=>{const s=S.find(q=>q.id===town);if(!s)return;const k=s.scale==null?K:s.scale,kWh=T.chain.dynamo.out.power;
   s.works.push({id:town+'.dynamo',kind:'dynamo',name:'the generator (the Geomancers\' make, on an Ancient engine)',crew:k,batch:{in:{oil:1},out:{power:kWh},hours:12*k/(kgYr/yr)}});
   s.eats=Object.assign({},s.eats,{power:kgYr*kWh/yr/s.people});s.start=Object.assign({},s.start,{power:Math.round(kgYr*kWh/yr*5),oil:Math.round((s.start.oil||0)+kgYr/yr*10)});};
  const oilYr=T.oil.kgYr;dynamo('skm4jjo2vl',oilYr*T.oil.council);
  R.push({id:'oil.qiblai',from:'geo.oilfield',to:'skm4jjo2vl',minutes:Math.round(12/25*1440),cap:30000,carriers:2,share:{'geo.oilfield':{oil:1-T.oil.licence-T.oil.council}},goods:{skm4jjo2vl:['grain','salt','tea','tools']}});
  R.push({id:'oil.council',from:'geo.oilfield',to:'skm4jjo2vl',minutes:Math.round(12/25*1440),cap:10000,carriers:1,share:{'geo.oilfield':{oil:T.oil.council}},goods:{skm4jjo2vl:[]}});   /* the Prismarchy's cut */
  /* the Sultan's licence, by the Treasury's tankers straight to the large towns' generators */
  Object.keys(T.lit).forEach(town=>{const a=S.find(q=>q.id==='geo.oilfield'),b=S.find(q=>q.id===town);if(!b)return;const km=Math.hypot(a.x-b.x,a.z-b.z)/1000*1.3;
   dynamo(town,oilYr*T.oil.licence*T.lit[town]);
   R.push({id:'oil.licence.'+town,from:'geo.oilfield',to:town,minutes:Math.round(km/25*1440)+60,cap:10000,carriers:2,share:{'geo.oilfield':{oil:T.oil.licence*T.lit[town]}},goods:{[town]:[]}});});
  addExpect(addGoods('road.er-qb','skm4jjo2vl',['oil']),'s57bkv9741',{oil:6});}
 /* ---- X2: THE MERCHANT HOUSES: a house is a settlement of its faction beside its town, a counting house with no make,
    that sells what it holds back into its town by want (the road's expect names what the town takes from it) */
 const house=faction=>([id,name,parent,px,py,people],expect)=>{const p=at(px,py);add({id,name,faction,parent,people,x:p.x,z:p.z,eats:eats('town'),keepDays:10,
   start:{grain:Math.round(eatYr('town',people)*T.startDays/yr),salt:people*3,tea:people,tools:people*.3},
   works:[{id:id+'.house',kind:'counting-house',name:'the counting house and its warehouses',crew:Math.min(20,people),out:[],rate:0}]});
  if(parent&&S.find(q=>q.id===parent))R.push(Object.assign({id:faction+'.sell.'+id.split('.')[1],from:id,to:parent,minutes:60,cap:20000,carriers:2,want:10,keep:5,goods:null},expect?{expect:{[parent]:expect}}:{}));};
 /* ---- X2: YUNI'S MISSION at the oil field (the owner, 2026-11-16, by way of the Qiblai kit's session: the field is "both",
    Yuni's mission and the Geomancers' concession side by side): the mission's cloister and lodging beside the wells,
    supplied from Qiblai's market as a house is */
 house('yuni')(T.mission);
 /* the Order of Viridian Thought's head monastery and its tea estate on the scarp: the estate's tea to Qiblai by share, the
    town's grain, salt and tools back by want */
 {const V2=T.viridian,p=at(V2.px[0],V2.px[1]),q=seats.skm4jjo2vl,crew=Math.round(V2.people*.6),km=Math.hypot(p.x-q.x,p.z-q.z)/1000*1.3;
  add({id:V2.id,name:V2.name,faction:'xanadu',parent:'skm4jjo2vl',people:V2.people,x:p.x,z:p.z,eats:eats('rural'),keepDays:30,
   start:{grain:Math.round(eatYr('rural',V2.people)*T.startDays/yr),salt:V2.people*3,tea:200,tools:V2.people*.3},
   works:[{id:V2.id+'.tea',kind:'tea-terraces',name:'the monks\' tea terraces on the scarp',crew,out:['tea'],rate:rate(V2.tea,crew,win('tea-flush')),season:'tea-flush'}]});
  bump('skm4jjo2vl',eatYr('rural',V2.people));
  R.push({id:'road.viridian',from:V2.id,to:'skm4jjo2vl',minutes:Math.round(km/25*1440),cap:20000,carriers:3,stagger:Math.round(km/25*1440/3),want:40,share:{[V2.id]:{tea:.85}},goods:{skm4jjo2vl:['grain','salt','tools']},   /* a 5-day road: its want covers the gap between carriers (Longsong's lesson) */
   expect:{[V2.id]:{grain:eatYr('rural',V2.people)/yr,salt:V2.people*5/yr,tools:V2.people*.3/yr}}});}
 /* the Order's monastery, one of the council's eight: an eighth of the Prismarchy's oil where it lands at Qiblai */
 house('order')(T.orderHouse.house);
 /* K1: the White Monastery's house at Kirstabal runs the latex house (T.whiteHouse; the owner, 2026-11-16): the Scarp's latex
    comes to it on a road of its own beside the province's tithe, is dried to opium there, and all but the house's share goes to
    Kirstabal; the house sells its share back into the town by want, as a merchant house does. The fee is a transfer (below) */
 {const W=T.whiteHouse,hid=W.house[0],Rt=R.find(r=>r.id==='tithe.prov.p5'),sh=Rt&&Rt.share['prov.p5'];
  house('xanadu')(W.house);S.find(q=>q.id===hid).works.push({id:'ks.latex',kind:'latex-house',name:'the latex house (the White Monastery\'s, in Kirstabal\'s works quarter)',crew:W.crew,batch:T.chain.latex});
  if(sh&&sh.latex){const k=sh.latex;delete sh.latex;
   R.push({id:'tithe.prov.p5.latex',from:'prov.p5',to:hid,minutes:Rt.minutes,cap:50000,carriers:2,share:{'prov.p5':{latex:k}},goods:{[hid]:[]}});}
  R.push({id:'white.opium',from:hid,to:'sl758m2396',minutes:60,cap:20000,carriers:2,share:{[hid]:{opium:1-W.share}},goods:{sl758m2396:[]}});}
 R.find(r=>r.id==='oil.council').cut=[{at:'skm4jjo2vl',to:T.orderHouse.house[0],share:T.orderHouse.share,why:'the Order\'s eighth of the council\'s income'}];
 /* ---- X2: THE RARE DEVISERS: their guild house at Theodiga holds the royal licence in scrap and rare artifacts (the owner,
    2026-11-16): the Salvagers' scrap passes through it to the smelter. Their expeditions take Thalaba's summer road into
    Godshearth (about 200 km from Thalaba's new place at the spillway's mouth): their camp works the vents in the expedition
    season, its sulfur, wax and rarities home to their house at Thalaba, which sells them into the town's market (down by
    Phēr and the lake to the capital and out with the Great Caravan); the Sultan's share of the haul (`T.haul`) is taken
    where it lands. The Dalab mission's party goes the same way to the Grove (`T.dalab`) */
 {const Xp=T.expedition,scrapDay=T.mine.scrap/yr;
  T.devisers.houses.forEach(h=>house('devisers')(h,h[0]===Xp.home?{sulfur:Xp.make.sulfur/yr,wax:Xp.make.wax/yr,rarities:Xp.make.rarities/yr}:h[0]==='devisers.theodiga'?{scrap:scrapDay+T.bore.scrap/yr,rarities:T.bore.rarities/yr}:null));
  /* the bore, worked by the Devisers from their lodge at its portal (the guild house stands for it in the sim) */
  {const dt=S.find(q=>q.id==='devisers.theodiga'),B=T.bore;['scrap','rarities'].forEach(g=>dt.works.push({id:'devisers.bore.'+g,kind:'bore-salvage',
   name:'the Theodiga bore\'s '+g+' (the Ancients\' dead tunnel to Stair, under the royal licence)',crew:B.crew,out:[g],rate:rate(B[g],B.crew),site:{kind:'bore',amount:B[g]*B.years}}));}
  R.push({id:'devisers.scrap',from:'s4zvgepuru',to:'devisers.theodiga',minutes:60,cap:20000,carriers:2,share:{s4zvgepuru:{scrap:1}},goods:{'devisers.theodiga':[]}});   /* the licence: every kilo of the floor's scrap to the house */
  /* a Godshearth camp: its works in the expedition season, its grain bumped onto Thalaba and sent up from there, 95 % of its
     make home to its house, the Sultan's share cut where it lands (a cut a share: `T.haul`'s goods, then the rest) */
  const camp=(Xp,road,supply,kind,why)=>{const p=at(Xp.px[0],Xp.px[1]),gs=Object.keys(Xp.make),crew=Math.round(Xp.people*.4);
   add({id:Xp.id,name:Xp.name,faction:Xp.faction,parent:Xp.home,people:Xp.people,x:p.x,z:p.z,eats:eats('camp'),keepDays:20,
    start:{grain:Math.round(eatYr('camp',Xp.people)*T.startDays/yr),salt:Xp.people*2,tea:30,tools:60},
    works:gs.map(g=>({id:Xp.id+'.'+g,kind:g+'-'+kind,name:'the vents\' '+g,crew,out:[g],rate:rate(Xp.make[g],crew,win('expedition')),season:'expedition'}))});
   bump(TB,eatYr('camp',Xp.people));
   const sh={};gs.forEach(g=>{sh[g]=.95;});
   const own=gs.filter(g=>T.haul[g]!=null),rest=gs.filter(g=>T.haul[g]==null);
   const cut=own.map(g=>({at:Xp.home,to:'xan.citadel',share:T.haul[g],goods:[g],why})).concat(rest.length?[{at:Xp.home,to:'xan.citadel',share:T.haul.all,goods:rest,why}]:[]);
   R.push({id:road,from:Xp.id,to:Xp.home,minutes:Math.round(Xp.km/25*1440),cap:20000,carriers:3,stagger:Math.round(Xp.km/25*1440/3),want:60,share:{[Xp.id]:sh},goods:{[Xp.home]:['grain','salt','tea','tools']},cut});
   R.push({id:supply,from:TB,to:Xp.home,minutes:60,cap:20000,carriers:1,want:30,keep:5,goods:{[TB]:['grain','salt','tea','tools'],[Xp.home]:[]},
    expect:{[Xp.home]:{grain:eatYr('camp',Xp.people)/yr,salt:Xp.people*2/yr,tea:30/yr,tools:60/yr}}});};
  camp(Xp,'expedition.godshearth','devisers.supply','diggings','the Sultan\'s share of the Godshearth haul (a tenth, a fifth of the rarities)');
  /* the Dalab mission beside the town (a house of its faction, selling what it keeps into Thalaba's market), and its party */
  const Dp=T.dalab.party;house('dalab')(T.dalab.mission,{hearthseed:Dp.make.hearthseed*(1-T.haul.all)/yr,wax:Dp.make.wax*(1-T.haul.all)/yr});
  bump(TB,eatYr('town',T.dalab.mission[5]));
  camp(Dp,'expedition.dalab','dalab.supply','gathering','the Sultan\'s share of the Godshearth haul (the Dalab party\'s, a tenth)');}
 /* ---- X2: THE GOLDEN TEARS: their house in the Gold March sends an armed camp into Lizard country in the cool months to
    work the unclaimed lodes it finds (a field of short veins, as the Sultan's mines), the ore home to the house and on to
    the Sultan's assay at the Gold March (where the Fifth is taken of the gold); their factor at the capital escorts Dalab's
    Annual Great Caravan for a share of what it lands */
 {const Tg=T.tears,C=Tg.camp,p=at(C.px[0],C.px[1]),home=Tg.houses[0][0],crew=Math.round(C.people*.6),ore=C.kgYr*30;
  Tg.houses.forEach(h=>house('tears')(h));
  add({id:C.id,name:C.name,faction:'tears',parent:home,people:C.people,x:p.x,z:p.z,eats:Object.assign(eats('camp'),{arms:.0005}),keepDays:45,
   start:{grain:Math.round(eatYr('camp',C.people)*T.startDays/yr),salt:C.people*2,tea:30,tools:60,arms:40},
   works:[{id:C.id+'.diggings',kind:'adit',name:'the prospectors\' diggings',crew,out:['goldore'],rate:rate(ore,crew,win('rift-season')),season:'rift-season',site:T.field('lode',ore,C.years)}]});
  bump('sxan7r1sln',eatYr('camp',C.people));
  R.push({id:'tears.rift',from:C.id,to:home,minutes:Math.round(C.km/20*1440),cap:10000,carriers:3,stagger:Math.round(C.km/20*1440/3),want:90,share:{[C.id]:{goldore:.95}},goods:{[home]:['grain','salt','tea','tools','arms']},
   expect:{[C.id]:{arms:C.people*.0005}}});
  /* the house sells its ore to the Sultan's assay as it lands (a cut of all of it), and buys the camp's stores in the town */
  R.find(r=>r.id==='tears.rift').cut=[{at:home,to:'sxan7r1sln',share:1,goods:['goldore'],why:'the house sells its ore to the Sultan\'s assay'}];
  R.push({id:'tears.supply',from:'sxan7r1sln',to:home,minutes:60,cap:10000,carriers:1,want:45,keep:5,goods:{sxan7r1sln:['grain','salt','tea','tools','arms'],[home]:[]},
   expect:{[home]:{grain:eatYr('camp',C.people)/yr*1.5,salt:C.people*2/yr,tea:30/yr,tools:60/yr,arms:C.people*.0005}}});}
 /* ---- X2: THE BROTHERHOOD OF THE TWO HORNS (Ṭā'ifat Dalīl al-Qaranayn: the Xanadui guides of the Twins' two routes,
    biomes/twins/PLAN.md section 4; the owner, 2026-11-16: "the guilds of the twins as merchant houses with a presence
    throughout Xanadu who additionally try to profit from trade"). Their guild houses at Strongbow and Stair (the gates of
    the crossing), their factor houses in six towns. Their take, as cuts on what roads land:
      the Custom of the Split Tally: a share of every Catch caravan, at Strongbow's gate inbound and at Stair outbound;
      the merchant houses' margin: a share of what the trunk roads land where a factor house stands;
    and the factors sell it back into their towns (a road by want). The Sultan's toll at the Strongbow lift is a cut too */
 const H=T.horns;H.houses.forEach(h=>house('horns')(h));
 const factorAt={};H.houses.forEach(([id,,parent])=>{if(parent)factorAt[parent]=id;});
 const cutOn=(roadId,cuts)=>{const Rd=R.find(r=>r.id===roadId);if(!Rd)return;Rd.cut=(Rd.cut||[]).concat(cuts);};
 ['trade.gate.iziz','trade.gate.dasri'].forEach(id=>cutOn(id,[
  {at:'sfgtxw10kr',to:'horns.strongbow',share:H.tally,why:'the guides\' tally, half at the gate'},
  {at:id.slice(6),to:'horns.stair',share:H.tally,why:'the guides\' tally outbound, at Stair'},
  {at:'sfgtxw10kr',to:'xan.citadel',share:T.toll,why:'the Sultan\'s toll at the Strongbow lift'}]));
 ['trade.gate.geomancers','trade.gate.yuni','road.er-qb','road.er-th','road.qb-ks','road.qb-sw','road.sw-er','lake.cross','road.pher-thalaba'].forEach(id=>{const Rd=R.find(r=>r.id===id);if(!Rd)return;
  [Rd.from,Rd.to].forEach(end=>{if(factorAt[end])cutOn(id,[{at:end,to:factorAt[end],share:H.margin,why:'the merchant house\'s margin'}]);});});
 cutOn('caravan.great',[{at:'s57bkv9741',to:'tears.erehwon',share:T.tears.escort,why:'the Golden Tears\' escort of the Annual Great Caravan'},
  {at:'s57bkv9741',to:'horns.erehwon',share:H.margin,why:'the merchant house\'s margin'}]);
 /* ---- THE CHAIN OF SUPPLY: who feeds whom (the capital the root). X0's roads are two-stop, and a town's want is its own
    use: a seat that passes salt, tea and tools on to its villages wants more than it eats, so the road into it expects
    its whole subtree's use a day (X1's multi-stop roads take this over) */
 const up={'xan.citadel':'s57bkv9741','xan.dome':'s57bkv9741','xan.pher':'s57bkv9741','s4zvgepuru':'s57bkv9741','skm4jjo2vl':'s57bkv9741',
  'sl758m2396':'skm4jjo2vl','sfgtxw10kr':'sl758m2396','sxan7r1sln':'skm4jjo2vl','smgxtultfq':'sxan7r1sln','sjuarjbku0':'sfgtxw10kr'};
 S.forEach(s=>{if(up[s.id]||s.id==='s57bkv9741'||s.faction==='gate')return;up[s.id]=s.parent;});
 const day={};S.forEach(s=>{if(s.faction==='gate')return;const d={};['salt','tea','tools'].forEach(g=>{d[g]=s.people*((s.eats||{})[g]||0);});day[s.id]=d;});
 const sub={};const subOf=id=>{if(sub[id])return sub[id];const t=Object.assign({},day[id]);S.forEach(c=>{if(up[c.id]===id){const k=subOf(c.id);for(const g in k)t[g]=(t[g]||0)+k[g];}});return sub[id]=t;};
 S.forEach(c=>{const p=up[c.id];if(!p)return;if(!S.some(k=>up[k.id]===c.id))return;   /* only the seats that feed others */
  const Rd=R.find(r=>(r.from===p&&r.to===c.id)||(r.to===p&&r.from===c.id));if(!Rd)return;
  Rd.expect=Rd.expect||{};Rd.expect[c.id]=Object.assign({},Rd.expect[c.id]||{},subOf(c.id));});
 /* the capital's market gathers the country's exports: the roads into it expect the gateways' take (a floor; the seats keep
    their own days first) */
 ['road.er-qb','road.er-th','lake.cross'].forEach(id=>{const Rd=R.find(r=>r.id===id),from=Rd.from==='s57bkv9741'?Rd.to:Rd.from,list=Rd.goods[from]||[],e={};
  list.forEach(g=>{if(T.gateWant[g])e[g]=T.gateWant[g];});Rd.expect=Rd.expect||{};Rd.expect.s57bkv9741=Object.assign({},Rd.expect.s57bkv9741||{},e);});
 /* the salt (X1; the owner's changes of 2026-11-16): the Catch's and Yuni's, staged at Strongbow, for the south (Qiblai's
    subtree); the Great Caravan's for the north (the rest), landed at the capital at the winter's start and sent out from
    there, by the lake to Phēr and up to Thalaba (the chain of supply's subtree expects). Each road inward expects what
    lies beyond it */
 const all=subOf('s57bkv9741').salt,south=subOf('skm4jjo2vl').salt,north=all-south,sb=subOf('sfgtxw10kr').salt,ks=subOf('sl758m2396').salt;
 const salters=T.gateways.filter(G=>G.side==='south'&&G.in.indexOf('salt')>=0);
 salters.forEach(G=>{R.find(r=>r.id==='trade.'+G.id).expect[G.entry].salt=south/salters.length;});
 R.find(r=>r.id==='caravan.great').expect.s57bkv9741.salt=north;
 addExpect(R.find(r=>r.id==='road.ks-sb'),'sl758m2396',{salt:south-sb});
 addExpect(R.find(r=>r.id==='road.qb-ks'),'skm4jjo2vl',{salt:south-ks});
 /* the staging towns keep a month of their own before they send inward: the roads inward drained Strongbow and Kirstabal
    short (2 t each in a year), and a town short of a good sends none of it on, to Longsong's caravan either (2026-11-16) */
 R.find(r=>r.id==='road.ks-sb').keep=30;R.find(r=>r.id==='road.qb-ks').keep=30;
 addGoods('lake.cross','s57bkv9741',['salt','iron','arms']);addGoods('road.pher-thalaba','xan.pher',['salt']);
 /* the iron and arms the gateways bring, inward to the smiths and the forts (a batch that waits on its input shows no want) */
 addExpect(R.find(r=>r.id==='road.ks-sb'),'sl758m2396',{iron:20,arms:.2});addExpect(R.find(r=>r.id==='road.qb-ks'),'skm4jjo2vl',{iron:20,arms:.2});
 /* the north shore's pots and mats come over from the south (Pāṭari, Lōṭas) by the capital: Phēr holds its towns' use */
 {const nPeople=S.filter(s=>s.parent==='xan.pher'&&/^lk\./.test(s.id)).reduce((n,s)=>n+s.people,0)+6000;
  addExpect(R.find(r=>r.id==='lake.cross'),'xan.pher',{pottery:nPeople*T.diet.lake.pottery,mats:nPeople*T.diet.lake.mats});}
 T._salt={all,south,north};
 /* W1: the powder the gateways bring travels with the arms, on every road that carries them (settlements/strongwall/PLAN.md) */
 R.forEach(r=>{if(!r.goods)return;for(const k in r.goods){const L=r.goods[k];if(L&&L.indexOf('arms')>=0&&L.indexOf('powder')<0)L.push('powder');}});
 /* ---- THE DUES AND THE GRANTS */
 const tr=[];Object.keys(T.dues.bills).forEach(s=>tr.push({id:'dues.'+s,from:s,to:'xan.citadel',goods:T.dues.bills[s],first:T.dues.day,every:365}));
 tr.push({id:'fealty.qiblai',from:T.dues.fealty.from,to:'xan.citadel',goods:T.dues.fealty.goods,first:T.dues.fealty.day,every:365});
 {const g=T.dues.esteem.goods,k=T.orderHouse.share,part=f=>Object.fromEntries(Object.entries(g).map(([n,v])=>[n,v*f]));   /* the Sultan's grants of esteem to the council: the Order's eighth to its monastery */
  tr.push({id:'esteem.qiblai',from:'xan.citadel',to:T.dues.esteem.to,goods:part(1-k),first:T.dues.esteem.day,every:365});
  tr.push({id:'esteem.qiblai.order',from:'xan.citadel',to:T.orderHouse.house[0],goods:part(k),first:T.dues.esteem.day,every:365});}
 tr.push({id:'fee.white.kirstabal',from:'sl758m2396',to:T.whiteHouse.house[0],goods:T.whiteHouse.fee,first:T.dues.day,every:365});   /* K1: the seat's small fee to the White Monastery for the latex house */
 /* W1: the hired musketeers' pay, from the Treasury to each fort once a year (owed when the Treasury is short) */
 Object.keys(T.muskets.men).forEach(s=>tr.push({id:'pay.muskets.'+s,from:'xan.citadel',to:s,goods:{coin:T.muskets.men[s]*T.muskets.wage},first:T.clockDay(T.muskets.day),every:365}));
 const V={seed:20261116,scale:K,start:0,calendar:T.calendar,goods:T.goods,
  factions:[{id:'xanadu',name:'The Sultanate of Xanadu'},{id:'gate',name:'The gateways (Iziz, Yuni, the Dasri, Dalab, the Geomancers)'},
   {id:'geomancer',name:'The Geomancers (the drilling guild of Locus)'},{id:'horns',name:'The Brotherhood of the Two Horns (the Twins\' guides and merchant houses)'},
   {id:'tears',name:'The Golden Tears (a merchant house: armed prospecting in Lizard country, caravan escorts)'},{id:'devisers',name:'The Rare Devisers (a merchant house: the Godshearth expeditions)'},
   {id:'yuni',name:'Yuni (its mission at Qiblai\'s oil field)'},{id:'order',name:'The History Monks (the Order of Longsong)'},
   {id:'dalab',name:'Dalab (the genepriests\' mission at Thalaba)'}],
  /* the three houses compete: wary of one another, friendly to the Sultanate, the gateways, the Geomancers and Yuni */
  relations:(()=>{const F=['xanadu','gate','geomancer','yuni','order','horns','tears','devisers','dalab'],house=f=>['horns','tears','devisers'].indexOf(f)>=0;
   return[].concat(...F.map(a=>F.filter(b=>b!==a).map(b=>({a,b,stance:house(a)&&house(b)?'wary':'friendly'}))));})(),
  settlements:S,roads:R,transfers:tr,_lake:X,_need:need};
 return V;};
return T;})();
if(typeof module!=='undefined')module.exports=XAN_TUNE;
