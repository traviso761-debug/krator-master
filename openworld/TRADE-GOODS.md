# Long-range trade goods: who makes them, who buys them, and what each region has that others lack

The owner (2026-11-12): "calculate specifically where the largest producers and customers of long range trade goods would be? I want
to have a setup where each region has at least some things others don't so trade is encouraged." The numbers are in
`openworld/trade-goods.json` (goods, polities, per good, per settlement); this file reads them. It builds on the resource census
(`openworld/RESOURCES-SETTLEMENTS.md`, `resources-settlements.json`), re-scanned with the same scripts for today's pins.

## 1. Method and caveats

**Settlements (92 living, 495,336 people).** The census's living settlements at the pins of batch **5.1e8** (2026-11-12):
Ardent at 830,553, Strongwall at 912,1640 and the Tabist town at 1285,655 moved; the **Iziz iron mine** (936,1013), the **Voth iron mine**
(732,1014), **Reed's upriver fields** (1297,683) and **Pylon's tin outpost** (875,1015) added. Their reaches were scanned fresh
(`res_scan.py` and `crops_pass.js` of the census, same rules: city 30 km, town and arcology 20 km, the rest 10 km). Ruins are left out.

**Polities.** By the political polygons of `tools/scale-model/model/src/51-region-store.js` where they agree with the census;
by the lore where a pin is outside every polygon or in two:
- **Zeijani** (Dhelv and the three Zeijani caverns) is its own polity, though Dhelv's pin is inside the League of Amphitriton's polygon.
- **Loj Twenny** goes to the **Tungang Union** (a Tungang loj), **Ledge** to Dalab; **Port Goto** to **Shell Province** (its lifeline, LORE.md:268).
- **Mav's Refuge, Pinnacle Rock, Girder and Talon** (the polygon "Region 87") are the **Beast Riders**; **Tallwalls and Tallhouse** the **Free
  Giants** (the Vrivolci, LORE.md:579, 953); **Longsong** the **Order of Historians**; **Zey'danin** the **Vothic Kingdom** (LORE.md:435).
- **Unaligned:** Bastion, Boatmurder, The Gate, Yith and the planned Singing Gjar outpost. They trade but are not judged for uniqueness.
- **The Lizardmen** "never trade or treat" (LORE.md:813, 1072): their balance is shown, but they are left out of every route and share.

**Population.** 132,586 of 495,336 people (27%) are known figures: Voth 53,387, Erehwon 20,000, Qiblai 12,000,
Roketstad and Yuni ~10,000, Kautoa 6,235, Dhelv ~5,000 (to confirm), Pinnacle Rock ~3,800 (town and bands), Strongbow ~3,500, Locus
2,650, Valapo 2,155, Longsong 1,344, Shade and Port Visas ~1,000, Mungo 515 (sources in the json, `pop_source`). The rest are
**estimated by type**: city 8,000, arcology 10,000 inhabited (the Hexahedron's 170,000 in LORE.md:132 is the Ancients' figure), town
2,500, village 300, outpost 150, cavern 500; the capitals of large polities (Iziz, Dalab, Jimjam, Ys, Fulcrum) 20,000.

**The goods** (`goods` in the json): what is worth carrying hundreds of km. Metals and ores (iron, copper, tin, bronze, gold, silver,
nickel, rare earths), fuels (coal, oil), salt, saltpeter, sulfur, potash, Ancient scrap; thirteen crop groups (cacao, coffee, tea,
tropical and highland spice, sugar, silk, cotton, tobacco, two dye groups, medicines, reagents); mounts and hides; pearls; timber (to
treeless places only); and fifteen **cultural specialties** from the lore (section 2). **Food staples** are in the json too, but
**bulk grain is local**: its routes are capped at 250 km and it counts for nothing in uniqueness. Gypsum, marble, stone and clay
are left out as building bulk (Jimjam leads gypsum: see section 4).

**Supply** (capacity a year, per settlement):
- **Minerals:** the census's node-yield in reach (good ground, byte 100+, in full; low-grade ground at a tenth, since every reach has
  thin sedimentary iron; placers added) x a **labour factor** = min(1, sqrt(miners' nodes / the reach's nodes)), miners being 10%
  of the people at 40 hands a node (60% in the three mining hamlets). A district draws hands, so the factor falls slower than the
  head count; a village cannot work a whole rich field, a city of 8,000 works most of an average reach. Then x a yield per worked
  node (iron 20 t, copper 8 t, tin 2 t, gold 15 kg, silver 80 kg, nickel 2 t, rare earths 0.5 t, coal 150 t, oil 25 t, saltpeter
  6 t, sulfur 8 t, potash 15 t). **Bronze** where copper and tin both come out of one reach (x3 for the Free Clans' smiths, LORE.md:310).
- **Salt:** the census's salt score (rock salt, brine, salt steppe, sea pans) x 4 t, capped by 2% of the people at 10 t each.
- **Scrap:** every ruin's salvage (its ruin ground x 0.5 t, +100 t for a ruined arcology) shared by the living within 80 km, plus
  the lived-in Ancient hosts the ruin bit misses (Iziz, Pylon, Roketstad, Yuni, Hook; every arcology 50 t), capped by labour, x a
  salvage culture (Iziz, the Republic, the abyssal people 2; Yuni 1.5; Jimjam 0.3, which "has no scrap architecture", LORE.md:514).
- **Crops:** farmland beyond feeding the town (farm-eq km² minus 0.003 km² a head) is cash-crop land, capped by 0.004 km² a head
  (the hands); it is split among the crop groups by **fit** (the group's best `kits/crops` score over the farm-eq area) x a value
  weight, then x a yield (cacao 50 t/km², saffron-class spice 1 t/km², sugar 500 t/km² ...).
- **Mounts:** pasture x a beast culture (Beast Riders 4; Nomads, Screamers 2; Coyote 1.5; Voth, Free Clans 1; others 0.2).
  **Pearls:** sea in reach x a diving culture (the League 1, Kautoa and Hook's Hykkousoi quarter 0.3).
- **Specialties:** the makers' people x a weight per workshop town (section 2). Nobody else makes them, by definition.

**Demand** (a year, per settlement):
- Salt 5 kg a head + 3 kg for livestock (9 kg for the herding polities) + fish-salting. Iron 2 kg a head, x3 for the armies and
  industry of the Republic, Iziz and Voth (x1.5 the Eternal State). Copper, tin, bronze, silver, potash per head x **wealth**.
- **Wealth:** city or arcology 1, town 0.6, village and outpost 0.3, cavern 0.4; a capital x1.6. Luxuries (spices, beverages, dyes,
  silk, gold, silver, pearls, specialties) scale with it.
- **Culture:** Xanadu's gold x10 ("gold on everything"), silk and pearls x3-5, cacao x3; the Eternal State's gold x4, silver, bronze
  and tea x3; the Republic's and Iziz's saltpeter (gunpowder) and nickel x10, oil x4; Yuni's oil x10 (generators); the Monks'
  reagents x5; rare earths only where Ancient machines are kept running (Yuni, Iziz, the Republic, the Eternal State, Dalab, Xanadu).
- **Smelting fuel:** coal 1.5 t a tonne of iron made, a third of that where the reach is wooded (charcoal).

**Balance.** Per settlement, supply covers its own demand first; the rest is its **surplus** (a producer) or **deficit** (a
customer). Per polity, the surpluses cover the members' deficits (internal trade); what is left is the polity's net export or
import. A polity's **share** is its net export over the sum of every exporting polity's. **Routes:** each net-importing polity's
need (prorated to its members' deficits) is drawn from the net-exporting polities' members by surplus / (km + 50)^1.5, capped by
what each can spare; distances are straight lines at 2 km a px.

**Unique export:** a good of which a polity holds **30% or more** of the map's net surplus, or **20% or more with at most three
polities holding 10%**. A specialty counts, but a polity whose only unique goods are crafts is marked **craft only** (a craft can be
copied; a deposit cannot).

**Caveats.** Every figure is **notional**: it ranks within a good, never across goods. Supply is a capacity, not a harvest; the
labour rule, the yields and the per-head demands are estimates chosen to be plausible, and 70% of the people are estimated. The
geology is 4 km cells and the crop fit is climate only (the census's caveats hold). Routes ignore terrain, sea lanes, war and tolls.
**Crops barely trade in this model:** `kits/crops`' climate ranges are broad, so cacao, coffee, cotton, sugar and tropical spice grow
in every warm farm belt, and a city's spare farmland out-produces its luxury demand many times over; only the cool, dry and
high crops (highland spice, tea, silk, reagents) are concentrated. That is a finding, not a fault of the sums (section 5).

## 2. Cultural specialties from the lore

| Specialty | Who | Made at (weight) | Lore |
|---|---|---|---|
| almanacs | Jimjam | Jimjam (2), Serai (1) | Jimjam sells almanacs along the caravan routes; contracts are dated by its reckoning (LORE.md:524, 1059) |
| Jimjam brick and masons | Jimjam | Jimjam (2), Serai (1) | red and yellow silt brick, laid abroad by Jimjam masons (Dilihan's old quarter); heavy, so short range (LORE.md:515, 267) |
| Xanadu goldwork and prayer wheels | Xanadu Sultanate | Erehwon (3), Qiblai (2), Theodiga (1), Strongbow (1) | gold leaf from the Goldsmiths ("the richest house in the valley") and the great prayer wheels (LORE.md:471, 473, 500) |
| rockets and firearms | Iron Republic | Roketstad (3), Cascade (1), Glaive (0.5), Lipp (0.5) | the Arsenal's racks of rockets; "the most skilled" at muskets and cannon (LORE.md:187, 295-296) |
| telescopes and lenses | Iron Republic | Roketstad (2), Cascade (1) | the Astronomers' Guild at Roketstad grinds lenses from Ancient glass (LORE gives lenses to the Republic, not the Monks) (LORE.md:534, 540) |
| books and copied records | Order of Historians | Longsong (3) | the Order's archives and copyists (the brief's "books"; LORE says archives and relics, not a book trade) (LORE.md:552, 560) |
| electrics and generators | Yuni Emirate | Yuni (3), Locus (2), Verge (1) | Yuni and Locus are "the only fully electrified cities"; the Geomancers' generator on an Ancient engine (LORE.md:166, 400) |
| mech parts and arms | Empire of Iziz | Iziz (3), Pylon (2), Talia (1), Fridon (1), Hook (1) | the Forgemasters keep the mechs; Xanadu's best weapons come from Izizian and Yuni traders (LORE.md:146, 243, 501) |
| gene-craft and healing | Realm of Dalab | Dalab (3), Nulab (1), Shelf (0.5), Ledge (0.5) | the Genepriests sell modifications (night vision, pressure adaptation, extra limbs); Dalab healers are prized (LORE.md:47, 197) |
| recycled scrap goods | Nomad Country, Yuni Emirate | Tabist town (to be named) (3), Reed (1), Locus (1), Verge (0.5) | the abyssal people recycle the ruins "with pride and colour"; tin-mirror cladding, repurposed tanks (LORE.md:163, 391-395) |
| relics | Eternal State | Fulcrum (3), Lux (1) | the capital's relics under the Valley rule: why the caravans cross the Wall (LORE.md:741) |
| porcelain, tile and paper | Eternal State | Fulcrum (2), Lux (2), Farport (1) | a kiln country's wares beside Jimjam's brick: porcelain-grade ceramics, glazed tile, paper (LORE.md:742) |
| Spice Isles spice (re-export) | Vothic Kingdom | Temora (2), Zey'danin (2) | Voth took Zey'danin to control the rich Spice Isles; Temora and Zey'danin are the spice ports (LORE.md:435, 440, 461) |
| fungal distillates | Zeijani | Dhelv (2), Šurpu-Dhelv (1), Qarnu-Tūbu (1), Nūru-Šaplu (1) | the Zeijani fungal alchemist grows and distils (dark-grown crops need a works, not a climate) (kits/zeijani/PLAN.md:232) |
| checked wool cloth | Talovolci Chiefs | Spirladunon (2) | Talovolci wool, checked and striped in weld-yellow, woad-blue and madder-red (LORE.md:913) |

Two of the brief's list read differently in the lore: **lenses** are the Republic's (the Astronomers' Guild at Roketstad, LORE.md:534, 540),
so the Monks keep **books** (their archives, LORE.md:560); and the Republic's **Mint** (LORE.md:296) is coin, not a trade good (traders
take the Izani Talent, LORE.md:271). Others in the lore not modelled as goods: the Beast Riders' **spider silk** (silk looms, LORE.md:347),
Kautoan **shell money** (LORE.md:576), Voth's **chitin** and beetle livestock (LORE.md:453, 460), the Screamers' **millipede ranches** (LORE.md:368).

## 3. The polities

Population (known part in brackets); the top exports by share of the map's net surplus; the top imports by share of the map's net
import need; the unique goods (**bold** = natural, plain = craft). Ordered by population.

| Polity | People | Top exports (share) | Top imports (share of need) | Unique |
|---|---|---|---|---|
| Vothic Kingdom (9) | 98,137 (53,387) | Spice Isles spice (re-export) 100%, sulfur 40%, silver 30%, cacao 29%, gold 28% | saltpeter 64%, silk 48%, reagents (camphor, sky poppy) 47%, tea 46% | Spice Isles spice (re-export), **sulfur**, **silver**, **gold**, **sugar and syrup**, **myrrh and medicines**, **coal** |
| Empire of Iziz (11) | 65,200 | mech parts and arms 100%, nickel (with platinum) 65%, Ancient scrap metal 51%, coal 37%, oil and petrol 28% | rare earths 82%, mounts and hides 21%, electrics and generators 21%, relics 20% | mech parts and arms, **nickel (with platinum)**, **Ancient scrap metal**, **coal**, **oil and petrol** |
| Realm of Dalab (5) | 48,300 | gene-craft and healing 100%, bronze (copper + tin) 62%, highland spice (saffron, umbel, juniper) 43%, rare earths 22%, copper 20% | relics 23%, mounts and hides 16%, sulfur 13%, Spice Isles spice (re-export) 12% | gene-craft and healing, **bronze (copper + tin)**, **highland spice (saffron, umbel, juniper)**, **rare earths** |
| Xanadu Sultanate (5) | 45,650 (35,500) | Xanadu goldwork and prayer wheels 100%, rare earths 36%, copper 36%, oil and petrol 20%, potash 19% | gold 85%, salt 82%, Ancient scrap metal 57%, mech parts and arms 34% | Xanadu goldwork and prayer wheels, **rare earths**, **copper**, **oil and petrol** |
| League of Amphitriton (6) | 40,900 | pearls and nacre 80%, sugar and syrup 18%, myrrh and medicines 18%, salt 8%, Ancient scrap metal 7% | iron 100%, tin 62%, temperate dyes (woad, broom, lichens, barks) 45%, tobacco 45% | **pearls and nacre** |
| Eternal State (5) | 36,450 | relics 100%, porcelain, tile and paper 100%, tin 17%, cacao 16%, tropical dyes (indigo, annatto, mangrove red) 15% | potash 23%, bronze (copper + tin) 21%, pearls and nacre 17%, Xanadu goldwork and prayer wheels 16% | relics, porcelain, tile and paper (craft only) |
| Yuni Emirate (5) | 21,250 (12,650) | electrics and generators 100%, recycled scrap goods 45%, tin 21%, silver 20%, gold 20% | oil and petrol 43%, coal 19%, books and copied records 9%, sulfur 7% | electrics and generators, recycled scrap goods, **silver**, **gold** |
| Iron Republic (4) | 20,600 (10,000) | rockets and firearms 100%, telescopes and lenses 100%, silk 28%, tea 27%, reagents (camphor, sky poppy) 26% | silver 32%, coal 30%, oil and petrol 18%, rare earths 18% | rockets and firearms, telescopes and lenses (craft only) |
| Jimjam (2) | 20,300 | Jimjam brick and masons 100%, almanacs 100%, cacao 10%, tropical dyes (indigo, annatto, mangrove red) 9%, cotton and ramie 8% | copper 23%, silver 17%, telescopes and lenses 14%, Ancient scrap metal 14% | almanacs, Jimjam brick and masons (craft only) |
| Beast Riders (4) | 12,400 (3,800) | mounts and hides 64%, oil and petrol 42%, coal 21%, Ancient scrap metal 20%, salt 6% | temperate dyes (woad, broom, lichens, barks) 14%, cotton and ramie 14%, tobacco 14%, tropical spice (clove, citron) 14% | **mounts and hides**, **oil and petrol**, **coal**, **Ancient scrap metal** |
| Shell Province (2) | 10,300 | potash 31%, sugar and syrup 5%, salt 4%, myrrh and medicines 4%, coal 4% | tin 19%, temperate dyes (woad, broom, lichens, barks) 14%, tobacco 14%, tropical spice (clove, citron) 14% | **potash** |
| Screamer Country (1) | 10,000 | oil and petrol 9%, coal 8%, mounts and hides 5%, sugar and syrup 4%, myrrh and medicines 4% | tin 19%, temperate dyes (woad, broom, lichens, barks) 14%, tobacco 14%, tropical spice (clove, citron) 14% | **none (flagged)** |
| Lizardmen (5) | 9,400 | none: never trade | none | - |
| Dilihan Province (2) | 9,000 (1,000) | potash 43%, salt 9%, bronze (copper + tin) 6%, silver 6%, iron 6% | Jimjam brick and masons 31%, Ancient scrap metal 6%, silk 5%, reagents (camphor, sky poppy) 5% | **potash** |
| Kautoa (3) | 8,690 (8,390) | sulfur 42%, pearls and nacre 20%, salt 6%, silver 4%, sugar and syrup 4% | temperate dyes (woad, broom, lichens, barks) 9%, tobacco 9%, tropical spice (clove, citron) 9%, cotton and ramie 9% | **sulfur**, **pearls and nacre** |
| Free Giants (Vrivolci) (2) | 8,150 | saltpeter 63%, salt 13%, tin 12%, silk 11%, tea 11% | sugar and syrup 98%, cacao 8%, coal 7%, Ancient scrap metal 6% | **saltpeter** |
| Free Clans (1) | 8,000 | bronze (copper + tin) 20%, mounts and hides 12%, highland spice (saffron, umbel, juniper) 12%, silk 10%, reagents (camphor, sky poppy) 10% | Jimjam brick and masons 15%, coal 11%, cacao 8%, Ancient scrap metal 6% | **bronze (copper + tin)** |
| Talovolci Chiefs (1) | 8,000 | checked wool cloth 100%, nickel (with platinum) 26%, silk 11%, tea 10%, reagents (camphor, sky poppy) 10% | coal 6%, Ancient scrap metal 6%, highland spice (saffron, umbel, juniper) 4%, sulfur 3% | checked wool cloth, **nickel (with platinum)** |
| Zeijani (4) | 6,500 (5,000) | fungal distillates 100%, copper 10%, silver 9%, gold 8%, sulfur 3% | salt 15%, temperate dyes (woad, broom, lichens, barks) 3%, cotton and ramie 3%, tobacco 3% | fungal distillates (craft only) |
| Nomad Country (6) | 4,765 (1,515) | recycled scrap goods 55%, mounts and hides 17%, tin 6%, gold 6%, silver 5% | coal 6%, nickel (with platinum) 1%, Ancient scrap metal 1% | recycled scrap goods (craft only) |
| Order of Historians (1) | 1,344 (1,344) | books and copied records 100%, silk 2%, tea 2%, reagents (camphor, sky poppy) 2%, iron 1% | coal 9% | books and copied records (craft only) |
| Unaligned settlements (5) | 900 | sulfur 6%, nickel (with platinum) 3%, saltpeter 2%, copper 2%, silver 1% | coal 7% | - |
| Tungang Union (1) | 500 | bronze (copper + tin) 1%, copper 1%, rare earths 1% | timber 100%, myrrh and medicines 100%, food staples (grain, fish) 100%, sugar and syrup 2% | **none (flagged)** |
| Fellgangs (1) | 300 | copper 1%, silver 1%, gold 1% | - | **none (flagged)** |
| Coyote Kingdom (1) | 300 | saltpeter 3% | salt 1% | **none (flagged)** |

**In one line each** (the trade each region brings):
- **Vothic Kingdom** sells Spice Isles spice (re-export), sulfur, silver, gold, sugar and syrup, myrrh and medicines, coal; buys saltpeter, silk, reagents (camphor, sky poppy).
- **Empire of Iziz** sells mech parts and arms, nickel (with platinum), Ancient scrap metal, coal, oil and petrol; buys rare earths, mounts and hides, electrics and generators.
- **Realm of Dalab** sells gene-craft and healing, bronze (copper + tin), highland spice (saffron, umbel, juniper), rare earths; buys relics, mounts and hides, sulfur.
- **Xanadu Sultanate** sells Xanadu goldwork and prayer wheels, rare earths, copper, oil and petrol; buys gold, salt, Ancient scrap metal.
- **League of Amphitriton** sells pearls and nacre; buys iron, tin, temperate dyes (woad, broom, lichens, barks).
- **Eternal State** sells relics, porcelain, tile and paper; buys potash, bronze (copper + tin), pearls and nacre.
- **Yuni Emirate** sells electrics and generators, recycled scrap goods, silver, gold; buys oil and petrol, coal, books and copied records.
- **Iron Republic** sells rockets and firearms, telescopes and lenses; buys silver, coal, oil and petrol.
- **Jimjam** sells almanacs, Jimjam brick and masons; buys copper, silver, telescopes and lenses.
- **Beast Riders** sells mounts and hides, oil and petrol, coal, Ancient scrap metal; buys temperate dyes (woad, broom, lichens, barks), cotton and ramie, tobacco.
- **Shell Province** sells potash; buys tin, temperate dyes (woad, broom, lichens, barks), tobacco.
- **Screamer Country** sells nothing of its own yet; buys tin, temperate dyes (woad, broom, lichens, barks), tobacco.
- **Dilihan Province** sells potash; buys Jimjam brick and masons, Ancient scrap metal.
- **Kautoa** sells sulfur, pearls and nacre; buys temperate dyes (woad, broom, lichens, barks), tobacco, tropical spice (clove, citron).
- **Free Giants (Vrivolci)** sells saltpeter; buys sugar and syrup, cacao, coal.
- **Free Clans** sells bronze (copper + tin); buys Jimjam brick and masons, coal, cacao.
- **Talovolci Chiefs** sells checked wool cloth, nickel (with platinum); buys coal, Ancient scrap metal.
- **Zeijani** sells fungal distillates; buys salt.
- **Nomad Country** sells recycled scrap goods; buys coal.
- **Order of Historians** sells books and copied records; buys coal.
- **Tungang Union** sells nothing of its own yet; buys timber, myrrh and medicines, food staples (grain, fish).
- **Fellgangs** sells nothing of its own yet.
- **Coyote Kingdom** sells nothing of its own yet.

## 4. Each good: the largest producers, customers and routes

Amounts a year in the good's unit (notional). Producers by surplus over their own demand, customers by deficit (whoever covers it,
a neighbour of the same polity included), routes by the modelled flow between polities. px in brackets.

### Metals

**iron** (t; exporters: Eternal State 13%, Empire of Iziz 13%, Yuni Emirate 13%)
- Producers: Fulcrum (409,621; Eternal State) 1,100; Voth (742,1018; Vothic Kingdom) 1,050; Roketstad (632,716; Iron Republic) 991; Yuni (1263,1089; Yuni Emirate) 965; Spirladunon (800,1017; Talovolci Chiefs) 940
- Customers: Iziz (963,985; Empire of Iziz) 86; Ys (788,741; League of Amphitriton) 37; Drum (673,932; Vothic Kingdom) 32; Almua (718,883; Vothic Kingdom) 26; Zey'danin (795,860; Vothic Kingdom) 24
- Routes: Dilihan to Ys 179 km, 0.15; Roketstad to Ys 316 km, 0.091; Roketstad to Trigon 186 km, 0.085; Dilihan to Trigon 160 km, 0.082

**copper** (t; exporters: Xanadu Sultanate 36%, Realm of Dalab 20%, Vothic Kingdom 16%)
- Producers: Erehwon (805,1516; Xanadu Sultanate) 259; Zey'danin (795,860; Vothic Kingdom) 225; Nulab (443,1359; Realm of Dalab) 175; Qiblai (922,1595; Xanadu Sultanate) 145; Ledge (437,1330; Realm of Dalab) 124
- Customers: Voth (742,1018; Vothic Kingdom) 17; Ys (788,741; League of Amphitriton) 9.4; Iziz (963,985; Empire of Iziz) 7.7; Jimjam (745,546; Jimjam) 7.7; Fulcrum (409,621; Eternal State) 6.5
- Routes: Zey'danin to Ys 238 km, 2.8; Ardent to Jimjam 171 km, 2.4; Dhelv to Ys 125 km, 2.0; Zey'danin to Jimjam 636 km, 1.4

**tin** (t; exporters: Yuni Emirate 21%, Vothic Kingdom 19%, Eternal State 17%)
- Producers: Voth (742,1018; Vothic Kingdom) 41; Tallwalls (650,1268; Free Giants (Vrivolci)) 35; Farport (294,588; Eternal State) 34; Yuni (1263,1089; Yuni Emirate) 34; Verge (1268,949; Yuni Emirate) 18
- Customers: Dalab (477,1108; Realm of Dalab) 0.96; Iziz (963,985; Empire of Iziz) 0.96; Ys (788,741; League of Amphitriton) 0.96; Hexahedron (817,670; Screamer Country) 0.48; Shell (902,659; Shell Province) 0.48
- Routes: Dilihan to Ys 179 km, 0.27; Voth to Ys 562 km, 0.17; Dilihan to Hexahedron 147 km, 0.17; Dilihan to Trigon 160 km, 0.09

**bronze (copper + tin)** (t; exporters: Realm of Dalab 62%, Free Clans 20%, Dilihan Province 6%)
- Producers: Ledge (437,1330; Realm of Dalab) 27; Nulab (443,1359; Realm of Dalab) 17; Ardent (830,553; Free Clans) 11; Dilihan (744,663; Dilihan Province) 3.5; Strongwall (912,1640; Xanadu Sultanate) 2.2
- Customers: Ys (788,741; League of Amphitriton) 38; Fulcrum (409,621; Eternal State) 27; Voth (742,1018; Vothic Kingdom) 21; Tethis (733,775; League of Amphitriton) 12; Trigon (722,740; League of Amphitriton) 12
- Routes: Ledge to Voth 873 km, 3.7; Ledge to Fulcrum 1,419 km, 3.6; Ardent to Ys 385 km, 2.5; Nulab to Voth 907 km, 2.2

**nickel (with platinum)** (t; exporters: Empire of Iziz 65%, Talovolci Chiefs 26%, Free Clans 6%)
- Producers: Arcbeam (1016,1058; Empire of Iziz) 15; Talia (1073,939; Empire of Iziz) 9.3; Spirladunon (800,1017; Talovolci Chiefs) 9.0; Ardent (830,553; Free Clans) 2.0; Bastion (536,627; Unaligned settlements) 0.94
- Customers: Iziz (963,985; Empire of Iziz) 1.0; Pylon (869,1002; Empire of Iziz) 0.5; Fridon (1027,931; Empire of Iziz) 0.4; Cascade (568,841; Iron Republic) 0.31; Voth (742,1018; Vothic Kingdom) 0.27
- Routes: Spirladunon to Voth 116 km, 0.2; Arcbeam to Erehwon 1,009 km, 0.046; Arcbeam to Voth 554 km, 0.044; Spirladunon to Torus 56 km, 0.041

**rare earths** (t; exporters: Xanadu Sultanate 36%, Realm of Dalab 22%, Vothic Kingdom 10%)
- Producers: Erehwon (805,1516; Xanadu Sultanate) 13; Nulab (443,1359; Realm of Dalab) 8.4; Qiblai (922,1595; Xanadu Sultanate) 7.0; Ledge (437,1330; Realm of Dalab) 6.0; Voth (742,1018; Vothic Kingdom) 5.9
- Customers: Iziz (963,985; Empire of Iziz) 0.6; Pylon (869,1002; Empire of Iziz) 0.3; Arcbeam (1016,1058; Empire of Iziz) 0.3; Fridon (1027,931; Empire of Iziz) 0.24; Dalab (477,1108; Realm of Dalab) 0.2
- Routes: Voth to Iziz 447 km, 0.091; Voth to Pylon 256 km, 0.066; Erehwon to Iziz 1,108 km, 0.054; Voth to Arcbeam 554 km, 0.034

### Precious metals

**gold** (kg; exporters: Vothic Kingdom 28%, Yuni Emirate 20%, Zeijani 8%)
- Producers: Voth (742,1018; Vothic Kingdom) 170; Zey'danin (795,860; Vothic Kingdom) 163; Yuni (1263,1089; Yuni Emirate) 133; Verge (1268,949; Yuni Emirate) 131; Farport (294,588; Eternal State) 115
- Customers: Erehwon (805,1516; Xanadu Sultanate) 136; Theodiga (908,1535; Xanadu Sultanate) 47; Qiblai (922,1595; Xanadu Sultanate) 47; Dalab (477,1108; Realm of Dalab) 32; Iziz (963,985; Empire of Iziz) 16
- Routes: Tallwalls to Erehwon 585 km, 26; Voth to Erehwon 1,004 km, 19; Zey'danin to Erehwon 1,312 km, 12; Yuni to Erehwon 1,252 km, 11

**silver** (kg; exporters: Vothic Kingdom 30%, Yuni Emirate 20%, Zeijani 9%)
- Producers: Zey'danin (795,860; Vothic Kingdom) 941; Voth (742,1018; Vothic Kingdom) 876; Yuni (1263,1089; Yuni Emirate) 673; Verge (1268,949; Yuni Emirate) 614; Farport (294,588; Eternal State) 566
- Customers: Roketstad (632,716; Iron Republic) 103; Dalab (477,1108; Realm of Dalab) 96; Iziz (963,985; Empire of Iziz) 96; Jimjam (745,546; Jimjam) 96; Ys (788,741; League of Amphitriton) 96
- Routes: Dilihan to Jimjam 234 km, 26; Zey'danin to Ys 238 km, 23; Zey'danin to Roketstad 435 km, 22; Dilihan to Roketstad 248 km, 20

### Fuels

**coal** (t; exporters: Empire of Iziz 37%, Vothic Kingdom 21%, Beast Riders 21%)
- Producers: Iziz (963,985; Empire of Iziz) 11,000; Mav's Refuge (1049,841; Beast Riders) 7,040; Fridon (1027,931; Empire of Iziz) 5,760; Hexahedron (817,670; Screamer Country) 5,230; Drum (673,932; Vothic Kingdom) 4,790
- Customers: Shelf (461,1161; Realm of Dalab) 1,010; Roketstad (632,716; Iron Republic) 473; Yuni (1263,1089; Yuni Emirate) 414; Fulcrum (409,621; Eternal State) 397; Ardent (830,553; Free Clans) 330
- Routes: Iziz to Yuni 635 km, 103; Hexahedron to Ardent 235 km, 92; Hexahedron to Roketstad 381 km, 77; Mav's Refuge to Yuni 655 km, 64

**oil and petrol** (t; exporters: Beast Riders 42%, Empire of Iziz 27%, Xanadu Sultanate 21%)
- Producers: Mav's Refuge (1049,841; Beast Riders) 327; Iziz (963,985; Empire of Iziz) 254; Qiblai (922,1595; Xanadu Sultanate) 245; Pinnacle Rock (1007,686; Beast Riders) 160; Fridon (1027,931; Empire of Iziz) 145
- Customers: Yuni (1263,1089; Yuni Emirate) 159; Verge (1268,949; Yuni Emirate) 78; Voth (742,1018; Vothic Kingdom) 74; Roketstad (632,716; Iron Republic) 64; Erehwon (805,1516; Xanadu Sultanate) 59
- Routes: Mav's Refuge to Yuni 655 km, 53; Iziz to Yuni 635 km, 34; Mav's Refuge to Verge 488 km, 31; Fridon to Yuni 568 km, 23

### Minerals

**salt** (t; exporters: Vothic Kingdom 16%, Empire of Iziz 15%, Free Giants (Vrivolci) 13%)
- Producers: Tallwalls (650,1268; Free Giants (Vrivolci)) 1,420; Dilihan (744,663; Dilihan Province) 958; Almua (718,883; Vothic Kingdom) 642; Ys (788,741; League of Amphitriton) 631; Kautoa (964,725; Kautoa) 598
- Customers: Erehwon (805,1516; Xanadu Sultanate) 172; Ledge (437,1330; Realm of Dalab) 88; Theodiga (908,1535; Xanadu Sultanate) 83; Nulab (443,1359; Realm of Dalab) 77; Fulcrum (409,621; Eternal State) 71
- Routes: Tallwalls to Erehwon 585 km, 58; Tallwalls to Theodiga 743 km, 23; Hook to Erehwon 1,186 km, 8.9; Almua to Erehwon 1,278 km, 8.6

**saltpeter** (t; exporters: Free Giants (Vrivolci) 63%, Empire of Iziz 10%, Yuni Emirate 5%)
- Producers: Tallwalls (650,1268; Free Giants (Vrivolci)) 188; Arcbeam (1016,1058; Empire of Iziz) 46; Roketstad (632,716; Iron Republic) 15; Ardent (830,553; Free Clans) 11; Coyote Canyon (1265,500; Coyote Kingdom) 10
- Customers: Iziz (963,985; Empire of Iziz) 6.0; Voth (742,1018; Vothic Kingdom) 3.2; Cascade (568,841; Iron Republic) 3.0; Pylon (869,1002; Empire of Iziz) 3.0; Fridon (1027,931; Empire of Iziz) 2.4
- Routes: Tallwalls to Voth 533 km, 2.4; Tallwalls to Torus 578 km, 0.42; Tallwalls to Shim 300 km, 0.42; Tallwalls to Drum 674 km, 0.41

**sulfur** (t; exporters: Kautoa 42%, Vothic Kingdom 40%, Unaligned settlements 6%)
- Producers: Kautoa (964,725; Kautoa) 187; Almua (718,883; Vothic Kingdom) 160; Singing Gjar outpost (1572,1643; Unaligned settlements) 29; Hook (809,923; Empire of Iziz) 22; Zey'danin (795,860; Vothic Kingdom) 22
- Customers: Voth (742,1018; Vothic Kingdom) 2.2; Iziz (963,985; Empire of Iziz) 1.5; Roketstad (632,716; Iron Republic) 0.77; Dalab (477,1108; Realm of Dalab) 0.73; Erehwon (805,1516; Xanadu Sultanate) 0.73
- Routes: Almua to Cascade 312 km, 0.41; Almua to Roketstad 376 km, 0.39; Almua to Dalab 659 km, 0.37; Kautoa to Jimjam 566 km, 0.36

**potash** (t; exporters: Dilihan Province 43%, Shell Province 31%, Xanadu Sultanate 19%)
- Producers: Dilihan (744,663; Dilihan Province) 34; Qiblai (922,1595; Xanadu Sultanate) 29; Shell (902,659; Shell Province) 20; Serai (826,478; Jimjam) 14; Tallwalls (650,1268; Free Giants (Vrivolci)) 5.4
- Customers: Fulcrum (409,621; Eternal State) 29; Jimjam (745,546; Jimjam) 29; Voth (742,1018; Vothic Kingdom) 26; Dalab (477,1108; Realm of Dalab) 9.6; Erehwon (805,1516; Xanadu Sultanate) 9.6
- Routes: Dilihan to Fulcrum 675 km, 6.0; Dilihan to Voth 710 km, 4.0; Dilihan to Jimjam 234 km, 3.4; Shell to Fulcrum 989 km, 2.7

### Salvage

**Ancient scrap metal** (t; exporters: Empire of Iziz 51%, Beast Riders 20%, Iron Republic 12%)
- Producers: Iziz (963,985; Empire of Iziz) 568; Pylon (869,1002; Empire of Iziz) 390; Mav's Refuge (1049,841; Beast Riders) 346; Roketstad (632,716; Iron Republic) 268; Pinnacle Rock (1007,686; Beast Riders) 230
- Customers: Erehwon (805,1516; Xanadu Sultanate) 128; Voth (742,1018; Vothic Kingdom) 85; Qiblai (922,1595; Xanadu Sultanate) 48; Dalab (477,1108; Realm of Dalab) 32; Jimjam (745,546; Jimjam) 32
- Routes: Iziz to Erehwon 1,108 km, 21; Pylon to Erehwon 1,036 km, 16; Mav's Refuge to Erehwon 1,435 km, 9.0; Iziz to Qiblai 1,223 km, 8.1

### Bulk

**timber** (t; exporters: Empire of Iziz 17%, Vothic Kingdom 14%, Xanadu Sultanate 8%)
- Producers: Iziz (963,985; Empire of Iziz) 52,800; Jimjam (745,546; Jimjam) 43,500; Qiblai (922,1595; Xanadu Sultanate) 42,000; Roketstad (632,716; Iron Republic) 35,000; Dalab (477,1108; Realm of Dalab) 30,200
- Customers: Loj Twenny (457,1269; Tungang Union) 220; Singing Gjar outpost (1572,1643; Unaligned settlements) 75
- Routes: Nulab to Loj Twenny 182 km, 41; Ledge to Loj Twenny 128 km, 23; Dalab to Loj Twenny 324 km, 22; Tallwalls to Loj Twenny 386 km, 16

### Staples (short range)

**food staples (grain, fish)** (t; exporters: Vothic Kingdom 21%, Empire of Iziz 14%, Xanadu Sultanate 10%)
- Producers: Voth (742,1018; Vothic Kingdom) 41,000; Erehwon (805,1516; Xanadu Sultanate) 19,000; Ys (788,741; League of Amphitriton) 19,000; Iziz (963,985; Empire of Iziz) 17,700; Jimjam (745,546; Jimjam) 17,600
- Customers: Locus (1267,1043; Yuni Emirate) 252; Loj Twenny (457,1269; Tungang Union) 125; Singing Gjar outpost (1572,1643; Unaligned settlements) 38
- Routes: Nulab to Loj Twenny 182 km, 54; Shelf to Loj Twenny 216 km, 38; Ledge to Loj Twenny 128 km, 33

### Crops

**cacao** (t; exporters: Vothic Kingdom 29%, Eternal State 16%, Xanadu Sultanate 14%)
- Producers: Voth (742,1018; Vothic Kingdom) 683; Jimjam (745,546; Jimjam) 506; Dalab (477,1108; Realm of Dalab) 505; Fulcrum (409,621; Eternal State) 466; Erehwon (805,1516; Xanadu Sultanate) 369
- Customers: Iziz (963,985; Empire of Iziz) 9.6; Ys (788,741; League of Amphitriton) 9.6; Hexahedron (817,670; Screamer Country) 4.8; Roketstad (632,716; Iron Republic) 4.8; Shell (902,659; Shell Province) 4.8
- Routes: Jimjam to Ardent 171 km, 2.0; Jimjam to Ys 399 km, 1.7; Voth to Ys 562 km, 1.5; Jimjam to Hexahedron 287 km, 1.4

**coffee** (t; exporters: Vothic Kingdom 23%, Eternal State 14%, Xanadu Sultanate 14%)
- Producers: Voth (742,1018; Vothic Kingdom) 816; Jimjam (745,546; Jimjam) 608; Dalab (477,1108; Realm of Dalab) 605; Erehwon (805,1516; Xanadu Sultanate) 569; Fulcrum (409,621; Eternal State) 557
- Customers: Iziz (963,985; Empire of Iziz) 13; Ys (788,741; League of Amphitriton) 13; Hexahedron (817,670; Screamer Country) 6.4; Shell (902,659; Shell Province) 6.4; Mav's Refuge (1049,841; Beast Riders) 5.1
- Routes: Jimjam to Ys 399 km, 2.0; Voth to Ys 562 km, 1.7; Jimjam to Hexahedron 287 km, 1.6; Jimjam to Shell 387 km, 1.4

**tea** (t; exporters: Iron Republic 27%, Realm of Dalab 13%, Empire of Iziz 13%)
- Producers: Roketstad (632,716; Iron Republic) 565; Arcbeam (1016,1058; Empire of Iziz) 545; Cascade (568,841; Iron Republic) 488; Tallwalls (650,1268; Free Giants (Vrivolci)) 429; Spirladunon (800,1017; Talovolci Chiefs) 406
- Customers: Fulcrum (409,621; Eternal State) 38; Voth (742,1018; Vothic Kingdom) 34; Dalab (477,1108; Realm of Dalab) 13; Iziz (963,985; Empire of Iziz) 13; Ys (788,741; League of Amphitriton) 13
- Routes: Spirladunon to Voth 116 km, 17; Ardent to Jimjam 171 km, 4.4; Roketstad to Ys 316 km, 4.1; Cascade to Voth 496 km, 3.5

**tropical spice (clove, citron)** (t; exporters: Vothic Kingdom 23%, Xanadu Sultanate 15%, Eternal State 14%)
- Producers: Voth (742,1018; Vothic Kingdom) 365; Fulcrum (409,621; Eternal State) 274; Jimjam (745,546; Jimjam) 271; Dalab (477,1108; Realm of Dalab) 270; Erehwon (805,1516; Xanadu Sultanate) 255
- Customers: Iziz (963,985; Empire of Iziz) 4.8; Ys (788,741; League of Amphitriton) 4.8; Hexahedron (817,670; Screamer Country) 2.4; Roketstad (632,716; Iron Republic) 2.4; Shell (902,659; Shell Province) 2.4
- Routes: Dilihan to Ys 179 km, 0.75; Jimjam to Ys 399 km, 0.69; Voth to Ys 562 km, 0.58; Jimjam to Hexahedron 287 km, 0.54

**highland spice (saffron, umbel, juniper)** (t; exporters: Realm of Dalab 43%, Empire of Iziz 21%, Xanadu Sultanate 18%)
- Producers: Shelf (461,1161; Realm of Dalab) 5.5; Arcbeam (1016,1058; Empire of Iziz) 2.9; Erehwon (805,1516; Xanadu Sultanate) 1.6; Ardent (830,553; Free Clans) 1.4; Strongbow (1001,1596; Xanadu Sultanate) 0.58
- Customers: Voth (742,1018; Vothic Kingdom) 0.51; Dalab (477,1108; Realm of Dalab) 0.19; Fulcrum (409,621; Eternal State) 0.19; Iziz (963,985; Empire of Iziz) 0.19; Ys (788,741; League of Amphitriton) 0.19
- Routes: Shelf to Voth 631 km, 0.26; Arcbeam to Voth 554 km, 0.15; Ardent to Jimjam 171 km, 0.099; Ardent to Ys 385 km, 0.069

**sugar and syrup** (t; exporters: Vothic Kingdom 24%, League of Amphitriton 18%, Empire of Iziz 17%)
- Producers: Voth (742,1018; Vothic Kingdom) 25,200; Iziz (963,985; Empire of Iziz) 15,900; Ys (788,741; League of Amphitriton) 15,900; Tethis (733,775; League of Amphitriton) 7,970; Trigon (722,740; League of Amphitriton) 7,970
- Customers: Tallwalls (650,1268; Free Giants (Vrivolci)) 38; Ledge (437,1330; Realm of Dalab) 30; Nulab (443,1359; Realm of Dalab) 24; Dhelv (840,776; Zeijani) 9.6; Locus (1267,1043; Yuni Emirate) 2.4
- Routes: Voth to Tallwalls 533 km, 7.6; Iziz to Tallwalls 844 km, 2.5; Ys to Tallwalls 1,090 km, 1.8; Dalab to Tallwalls 471 km, 1.2

**silk** (t; exporters: Iron Republic 28%, Realm of Dalab 14%, Free Giants (Vrivolci) 11%)
- Producers: Roketstad (632,716; Iron Republic) 119; Cascade (568,841; Iron Republic) 102; Tallwalls (650,1268; Free Giants (Vrivolci)) 90; Spirladunon (800,1017; Talovolci Chiefs) 85; Ardent (830,553; Free Clans) 85
- Customers: Voth (742,1018; Vothic Kingdom) 2.6; Fulcrum (409,621; Eternal State) 1.9; Qiblai (922,1595; Xanadu Sultanate) 1.1; Dalab (477,1108; Realm of Dalab) 0.96; Iziz (963,985; Empire of Iziz) 0.96
- Routes: Spirladunon to Voth 116 km, 1.3; Roketstad to Ys 316 km, 0.32; Cascade to Voth 496 km, 0.27; Roketstad to Voth 643 km, 0.22

**cotton and ramie** (t; exporters: Vothic Kingdom 22%, Xanadu Sultanate 16%, Eternal State 15%)
- Producers: Voth (742,1018; Vothic Kingdom) 292; Fulcrum (409,621; Eternal State) 247; Jimjam (745,546; Jimjam) 244; Dalab (477,1108; Realm of Dalab) 242; Erehwon (805,1516; Xanadu Sultanate) 228
- Customers: Iziz (963,985; Empire of Iziz) 32; Ys (788,741; League of Amphitriton) 32; Hexahedron (817,670; Screamer Country) 16; Roketstad (632,716; Iron Republic) 16; Shell (902,659; Shell Province) 16
- Routes: Dilihan to Ys 179 km, 5.2; Jimjam to Ys 399 km, 4.8; Jimjam to Hexahedron 287 km, 3.7; Voth to Ys 562 km, 3.6

**tobacco** (t; exporters: Vothic Kingdom 22%, Xanadu Sultanate 16%, Eternal State 14%)
- Producers: Voth (742,1018; Vothic Kingdom) 1,120; Fulcrum (409,621; Eternal State) 862; Jimjam (745,546; Jimjam) 853; Dalab (477,1108; Realm of Dalab) 848; Erehwon (805,1516; Xanadu Sultanate) 803
- Customers: Iziz (963,985; Empire of Iziz) 9.6; Ys (788,741; League of Amphitriton) 9.6; Hexahedron (817,670; Screamer Country) 4.8; Roketstad (632,716; Iron Republic) 4.8; Shell (902,659; Shell Province) 4.8
- Routes: Dilihan to Ys 179 km, 1.5; Jimjam to Ys 399 km, 1.4; Voth to Ys 562 km, 1.2; Jimjam to Hexahedron 287 km, 1.1

**tropical dyes (indigo, annatto, mangrove red)** (t; exporters: Vothic Kingdom 25%, Xanadu Sultanate 15%, Eternal State 15%)
- Producers: Voth (742,1018; Vothic Kingdom) 293; Fulcrum (409,621; Eternal State) 204; Jimjam (745,546; Jimjam) 204; Dalab (477,1108; Realm of Dalab) 203; Erehwon (805,1516; Xanadu Sultanate) 169
- Customers: Iziz (963,985; Empire of Iziz) 2.6; Ys (788,741; League of Amphitriton) 2.6; Hexahedron (817,670; Screamer Country) 1.3; Roketstad (632,716; Iron Republic) 1.3; Shell (902,659; Shell Province) 1.3
- Routes: Dilihan to Ys 179 km, 0.42; Jimjam to Ys 399 km, 0.38; Voth to Ys 562 km, 0.34; Jimjam to Hexahedron 287 km, 0.3

**temperate dyes (woad, broom, lichens, barks)** (t; exporters: Xanadu Sultanate 16%, Vothic Kingdom 15%, Realm of Dalab 14%)
- Producers: Voth (742,1018; Vothic Kingdom) 241; Fulcrum (409,621; Eternal State) 204; Dalab (477,1108; Realm of Dalab) 185; Jimjam (745,546; Jimjam) 170; Erehwon (805,1516; Xanadu Sultanate) 169
- Customers: Iziz (963,985; Empire of Iziz) 2.6; Ys (788,741; League of Amphitriton) 2.6; Hexahedron (817,670; Screamer Country) 1.3; Shell (902,659; Shell Province) 1.3; Mav's Refuge (1049,841; Beast Riders) 1.0
- Routes: Dilihan to Ys 179 km, 0.41; Jimjam to Ys 399 km, 0.31; Voth to Ys 562 km, 0.28; Dilihan to Hexahedron 147 km, 0.26

**myrrh and medicines** (t; exporters: Vothic Kingdom 24%, League of Amphitriton 18%, Empire of Iziz 16%)
- Producers: Voth (742,1018; Vothic Kingdom) 380; Iziz (963,985; Empire of Iziz) 239; Ys (788,741; League of Amphitriton) 239; Tethis (733,775; League of Amphitriton) 120; Trigon (722,740; League of Amphitriton) 120
- Customers: Ledge (437,1330; Realm of Dalab) 0.2; Dhelv (840,776; Zeijani) 0.064; Locus (1267,1043; Yuni Emirate) 0.016; Loj Twenny (457,1269; Tungang Union) 0.004; Šurpu-Dhelv (806,818; Zeijani) 0.004
- Routes: Voth to Loj Twenny 760 km, 0.00075; Dalab to Loj Twenny 324 km, 0.00032; Iziz to Loj Twenny 1,161 km, 0.00026; Ys to Loj Twenny 1,246 km, 0.00023

**reagents (camphor, sky poppy)** (t; exporters: Iron Republic 26%, Empire of Iziz 15%, Realm of Dalab 13%)
- Producers: Arcbeam (1016,1058; Empire of Iziz) 67; Roketstad (632,716; Iron Republic) 59; Cascade (568,841; Iron Republic) 51; Ardent (830,553; Free Clans) 46; Tallwalls (650,1268; Free Giants (Vrivolci)) 45
- Customers: Voth (742,1018; Vothic Kingdom) 1.7; Qiblai (922,1595; Xanadu Sultanate) 0.72; Dalab (477,1108; Realm of Dalab) 0.64; Fulcrum (409,621; Eternal State) 0.64; Iziz (963,985; Empire of Iziz) 0.64
- Routes: Spirladunon to Voth 116 km, 0.84; Roketstad to Ys 316 km, 0.2; Arcbeam to Voth 554 km, 0.19; Cascade to Voth 496 km, 0.17

### Beasts

**mounts and hides** (head; exporters: Beast Riders 64%, Nomad Country 17%, Free Clans 12%)
- Producers: Mav's Refuge (1049,841; Beast Riders) 407; Pinnacle Rock (1007,686; Beast Riders) 302; Ardent (830,553; Free Clans) 154; Tabist town (to be named) (1285,655; Nomad Country) 107; Talon (1026,760; Beast Riders) 59
- Customers: Voth (742,1018; Vothic Kingdom) 475; Iziz (963,985; Empire of Iziz) 192; Fulcrum (409,621; Eternal State) 187; Dalab (477,1108; Realm of Dalab) 167; Ledge (437,1330; Realm of Dalab) 96
- Routes: Mav's Refuge to Voth 709 km, 75; Pinnacle Rock to Voth 850 km, 53; Mav's Refuge to Iziz 335 km, 44; Mav's Refuge to Dalab 1,262 km, 25

### Luxuries

**pearls and nacre** (kg; exporters: League of Amphitriton 80%, Kautoa 20%)
- Producers: Ys (788,741; League of Amphitriton) 700; Kautoa (964,725; Kautoa) 201; Hook (809,923; Empire of Iziz) 166; Tethis (733,775; League of Amphitriton) 82; Pontus (702,839; League of Amphitriton) 60
- Customers: Erehwon (805,1516; Xanadu Sultanate) 320; Fulcrum (409,621; Eternal State) 192; Voth (742,1018; Vothic Kingdom) 158; Iziz (963,985; Empire of Iziz) 128; Qiblai (922,1595; Xanadu Sultanate) 120
- Routes: Ys to Erehwon 1,550 km, 128; Ys to Fulcrum 795 km, 83; Ys to Voth 562 km, 64; Ys to Qiblai 1,729 km, 48

### Cultural specialties

**almanacs** (units; exporters: Jimjam 100%)
- Producers: Jimjam (745,546; Jimjam) 394; Serai (826,478; Jimjam) 3.0
- Customers: Voth (742,1018; Vothic Kingdom) 17; Dalab (477,1108; Realm of Dalab) 6.4; Erehwon (805,1516; Xanadu Sultanate) 6.4; Fulcrum (409,621; Eternal State) 6.4; Iziz (963,985; Empire of Iziz) 6.4
- Routes: Jimjam to Voth 944 km, 17; Jimjam to Ys 399 km, 6.4; Jimjam to Fulcrum 689 km, 6.4; Jimjam to Dalab 1,245 km, 6.4

**Jimjam brick and masons** (units; exporters: Jimjam 100%)
- Producers: Jimjam (745,546; Jimjam) 384; Serai (826,478; Jimjam) 3.0
- Customers: Dilihan (744,663; Dilihan Province) 26; Ys (788,741; League of Amphitriton) 16; Ardent (830,553; Free Clans) 13; Hexahedron (817,670; Screamer Country) 8.0; Roketstad (632,716; Iron Republic) 8.0
- Routes: Jimjam to Dilihan 234 km, 26; Jimjam to Ys 399 km, 16; Jimjam to Ardent 171 km, 13; Jimjam to Roketstad 408 km, 8.0

**Xanadu goldwork and prayer wheels** (units; exporters: Xanadu Sultanate 100%)
- Producers: Erehwon (805,1516; Xanadu Sultanate) 597; Qiblai (922,1595; Xanadu Sultanate) 239; Theodiga (908,1535; Xanadu Sultanate) 99; Strongbow (1001,1596; Xanadu Sultanate) 35
- Customers: Voth (742,1018; Vothic Kingdom) 8.5; Fulcrum (409,621; Eternal State) 6.4; Dalab (477,1108; Realm of Dalab) 3.2; Iziz (963,985; Empire of Iziz) 3.2; Jimjam (745,546; Jimjam) 3.2
- Routes: Erehwon to Voth 1,004 km, 5.7; Erehwon to Fulcrum 1,957 km, 4.2; Erehwon to Dalab 1,047 km, 2.2; Erehwon to Ys 1,550 km, 2.1

**rockets and firearms** (units; exporters: Iron Republic 100%)
- Producers: Roketstad (632,716; Iron Republic) 300; Cascade (568,841; Iron Republic) 100; Glaive (599,734; Iron Republic) 1.5; Lipp (691,619; Iron Republic) 1.5
- Customers: Voth (742,1018; Vothic Kingdom) 6.8; Erehwon (805,1516; Xanadu Sultanate) 2.6; Fulcrum (409,621; Eternal State) 2.6; Iziz (963,985; Empire of Iziz) 2.6; Dalab (477,1108; Realm of Dalab) 1.9
- Routes: Roketstad to Voth 643 km, 4.6; Cascade to Voth 496 km, 2.2; Roketstad to Fulcrum 485 km, 2.0; Roketstad to Iziz 853 km, 1.9

**telescopes and lenses** (units; exporters: Iron Republic 100%)
- Producers: Roketstad (632,716; Iron Republic) 200; Cascade (568,841; Iron Republic) 100
- Customers: Jimjam (745,546; Jimjam) 0.96; Voth (742,1018; Vothic Kingdom) 0.85; Dalab (477,1108; Realm of Dalab) 0.32; Erehwon (805,1516; Xanadu Sultanate) 0.32; Fulcrum (409,621; Eternal State) 0.32
- Routes: Roketstad to Jimjam 408 km, 0.77; Roketstad to Voth 643 km, 0.5; Cascade to Voth 496 km, 0.36; Roketstad to Ys 316 km, 0.25

**books and copied records** (units; exporters: Order of Historians 100%)
- Producers: Longsong (1229,1621; Order of Historians) 40
- Customers: Voth (742,1018; Vothic Kingdom) 1.7; Fulcrum (409,621; Eternal State) 1.3; Iziz (963,985; Empire of Iziz) 1.3; Yuni (1263,1089; Yuni Emirate) 0.96; Dalab (477,1108; Realm of Dalab) 0.64
- Routes: Longsong to Voth 1,550 km, 1.7; Longsong to Iziz 1,379 km, 1.3; Longsong to Fulcrum 2,586 km, 1.3; Longsong to Yuni 1,066 km, 0.96

**electrics and generators** (units; exporters: Yuni Emirate 100%)
- Producers: Yuni (1263,1089; Yuni Emirate) 300; Verge (1268,949; Yuni Emirate) 80; Locus (1267,1043; Yuni Emirate) 53
- Customers: Voth (742,1018; Vothic Kingdom) 5.1; Erehwon (805,1516; Xanadu Sultanate) 2.9; Iziz (963,985; Empire of Iziz) 2.9; Dalab (477,1108; Realm of Dalab) 1.9; Roketstad (632,716; Iron Republic) 1.4
- Routes: Yuni to Voth 1,052 km, 3.6; Yuni to Erehwon 1,252 km, 2.1; Yuni to Iziz 635 km, 2.0; Yuni to Dalab 1,572 km, 1.3

**mech parts and arms** (units; exporters: Empire of Iziz 100%)
- Producers: Iziz (963,985; Empire of Iziz) 600; Pylon (869,1002; Empire of Iziz) 200; Fridon (1027,931; Empire of Iziz) 80; Hook (809,923; Empire of Iziz) 80; Talia (1073,939; Empire of Iziz) 80
- Customers: Erehwon (805,1516; Xanadu Sultanate) 6.4; Voth (742,1018; Vothic Kingdom) 3.4; Qiblai (922,1595; Xanadu Sultanate) 2.4; Theodiga (908,1535; Xanadu Sultanate) 2.0; Shell (902,659; Shell Province) 1.9
- Routes: Iziz to Erehwon 1,108 km, 3.7; Iziz to Voth 447 km, 1.6; Iziz to Qiblai 1,223 km, 1.4; Pylon to Erehwon 1,036 km, 1.4

**gene-craft and healing** (units; exporters: Realm of Dalab 100%)
- Producers: Dalab (477,1108; Realm of Dalab) 600; Nulab (443,1359; Realm of Dalab) 80; Ledge (437,1330; Realm of Dalab) 50; Shelf (461,1161; Realm of Dalab) 50
- Customers: Voth (742,1018; Vothic Kingdom) 1.7; Erehwon (805,1516; Xanadu Sultanate) 1.3; Fulcrum (409,621; Eternal State) 0.96; Iziz (963,985; Empire of Iziz) 0.64; Jimjam (745,546; Jimjam) 0.64
- Routes: Dalab to Voth 560 km, 1.4; Dalab to Erehwon 1,047 km, 0.91; Dalab to Fulcrum 983 km, 0.8; Dalab to Roketstad 843 km, 0.54

**recycled scrap goods** (units; exporters: Nomad Country 55%, Yuni Emirate 45%)
- Producers: Tabist town (to be named) (1285,655; Nomad Country) 75; Verge (1268,949; Yuni Emirate) 39; Locus (1267,1043; Yuni Emirate) 26; Reed (1280,678; Nomad Country) 3.0
- Customers: Voth (742,1018; Vothic Kingdom) 8.5; Hexahedron (817,670; Screamer Country) 4.8; Dalab (477,1108; Realm of Dalab) 3.2; Erehwon (805,1516; Xanadu Sultanate) 3.2; Fulcrum (409,621; Eternal State) 3.2
- Routes: Tabist town (to be named) to Voth 1,306 km, 3.9; Tabist town (to be named) to Hexahedron 936 km, 2.8; Verge to Voth 1,061 km, 2.7; Tabist town (to be named) to Jimjam 1,102 km, 1.9

**relics** (units; exporters: Eternal State 100%)
- Producers: Fulcrum (409,621; Eternal State) 600; Lux (495,645; Eternal State) 80
- Customers: Dalab (477,1108; Realm of Dalab) 0.96; Voth (742,1018; Vothic Kingdom) 0.85; Iziz (963,985; Empire of Iziz) 0.64; Erehwon (805,1516; Xanadu Sultanate) 0.32; Jimjam (745,546; Jimjam) 0.32
- Routes: Fulcrum to Dalab 983 km, 0.84; Fulcrum to Voth 1,036 km, 0.73; Fulcrum to Iziz 1,326 km, 0.55; Fulcrum to Erehwon 1,957 km, 0.28

**porcelain, tile and paper** (units; exporters: Eternal State 100%)
- Producers: Fulcrum (409,621; Eternal State) 400; Lux (495,645; Eternal State) 160; Farport (294,588; Eternal State) 80
- Customers: Voth (742,1018; Vothic Kingdom) 8.5; Dalab (477,1108; Realm of Dalab) 3.2; Erehwon (805,1516; Xanadu Sultanate) 3.2; Iziz (963,985; Empire of Iziz) 3.2; Jimjam (745,546; Jimjam) 3.2
- Routes: Fulcrum to Voth 1,036 km, 5.2; Lux to Voth 895 km, 2.6; Fulcrum to Dalab 983 km, 2.0; Fulcrum to Erehwon 1,957 km, 2.0

**Spice Isles spice (re-export)** (units; exporters: Vothic Kingdom 100%)
- Producers: Zey'danin (795,860; Vothic Kingdom) 160; Temora (762,883; Vothic Kingdom) 6.0
- Customers: Dalab (477,1108; Realm of Dalab) 16; Erehwon (805,1516; Xanadu Sultanate) 16; Fulcrum (409,621; Eternal State) 16; Iziz (963,985; Empire of Iziz) 16; Jimjam (745,546; Jimjam) 16
- Routes: Zey'danin to Ys 238 km, 10; Zey'danin to Iziz 419 km, 10; Zey'danin to Jimjam 636 km, 10; Zey'danin to Fulcrum 908 km, 10

**fungal distillates** (units; exporters: Zeijani 100%)
- Producers: Dhelv (840,776; Zeijani) 100; Šurpu-Dhelv (806,818; Zeijani) 5.0; Qarnu-Tūbu (834,882; Zeijani) 5.0; Nūru-Šaplu (876,802; Zeijani) 5.0
- Customers: Voth (742,1018; Vothic Kingdom) 2.6; Dalab (477,1108; Realm of Dalab) 0.96; Erehwon (805,1516; Xanadu Sultanate) 0.96; Fulcrum (409,621; Eternal State) 0.96; Iziz (963,985; Empire of Iziz) 0.96
- Routes: Dhelv to Voth 522 km, 2.1; Dhelv to Ys 125 km, 0.89; Dhelv to Jimjam 498 km, 0.86; Dhelv to Fulcrum 916 km, 0.84

**checked wool cloth** (units; exporters: Talovolci Chiefs 100%)
- Producers: Spirladunon (800,1017; Talovolci Chiefs) 160
- Customers: Voth (742,1018; Vothic Kingdom) 8.5; Dalab (477,1108; Realm of Dalab) 3.2; Erehwon (805,1516; Xanadu Sultanate) 3.2; Fulcrum (409,621; Eternal State) 3.2; Iziz (963,985; Empire of Iziz) 3.2
- Routes: Spirladunon to Voth 116 km, 8.5; Spirladunon to Iziz 332 km, 3.2; Spirladunon to Fulcrum 1,113 km, 3.2; Spirladunon to Dalab 671 km, 3.2

## 5. Polities without a unique export, and the fixes

**Flagged (4):** Tungang Union (500), Fellgangs (300), Screamer Country (10,000), Coyote Kingdom (300). All four are small; each fix below
uses ground already on the map or a line already in the lore, cheapest first.

- **Tungang Union** (Loj Twenny): Cave saltpeter and the Line's salvage. Nitre scraped from the caverns is the classic underground saltpeter: the best saltpeter district in the Tungang Union's polygon is at 492,1255 (25 node-yield, 75 km from Loj Twenny, also inside the Realm of Dalab's polygon). A works pin there, with the Free Giants (63% of the surplus) the only big rival. As a craft, the Tungangs ran the Rift line (LORE.md:153, 221): Ancient cable, rail and tunnel parts salvaged from it are theirs alone. No map edit.
- **Fellgangs** (Wildcat): Gold. The unclaimed gold district at 438,1448 (10.5 node-yield, peak 140, 24 km from Wildcat, inside the Fellgangs' polygon; the census's unclaimed list has it at 442,1447). A gold camp pin (or Wildcat's reach widened to 30 km) makes the Fellgangs the only gold seller on the south-western rim; gold is one of the scarcest exports (the Vothic Kingdom and Yuni hold half of it). No map edit.
- **Screamer Country** (Hexahedron): Bloodwood red. The bloodwood's sap "is the red of their painted dots" (LORE.md:374; `biomes/hyperjungle` station `north`): a dye only Screamer wood yields, added to `kits/crops` as a `homeOnly` dye of the hyperjungle's north. Second, their millipede ranches (LORE.md:368) as a beast source (longcrawlers for capstans and caravans, LORE.md:185) would lift their 5% of the mounts. The coal at 811,698 (44 node-yield, 57 km from the Hexahedron) is not unique: Iziz and the Beast Riders hold more.
- **Coyote Kingdom** (Coyote Canyon): Salt and sulfur. A works at about 1190,463 on the Coyote Kingdom's edge: the good rock salt at 1184,466 (the nearest halite of 100+ to Coyote Canyon, Furrow and Shade, 10 km outside the polygon) beside sulfur at 1194,460 (26 node-yield, inside it). Coyote Canyon (salt 0), Shade (2.4) and Furrow (2.0) are short of salt, so it has customers at once; the Republic and Xanadu buy sulfur. A settlement pin, no map edit; the Coyote Kingdom has no lore yet, so this can be its start.

**Craft only** (a unique export, but only a craft; a natural one would make them sturdier):
- **Iron Republic**: craft only (rockets, lenses); natural option: tin at 706,628 (25 node-yield, 34 km from Lipp; a Lipp tin mine) would put it beside Yuni and the Eternal State in tin; iron cannot be unique (every polity has good ore), though the best unworked iron on the map is in the Republic at 558,883 (47 node-yield, 86 km from Cascade).
- **Eternal State**: craft only (relics, porcelain); natural option: tin at 328,606 (25 node-yield, 76 km from Farport) or the over-sea goods under State monopoly (LORE.md:741) as a third specialty.
- **Zeijani**: craft only (fungal distillates); natural option: gold and silver at 851,774, 22 km from Dhelv (10.5 and 11.3 node-yield).
- **Jimjam**: craft only (almanacs, brick); natural option: gypsum (Jimjam leads the census, 22.4 good-ground node-yield: plaster and alabaster) if gypsum is counted as long-range.
- **Order of Historians**: craft only (books); fitting for a monastery.
- **Nomad Country**: craft only (the Tabisti's scrap goods, shared with Yuni's Locus); natural option: potash at 1262,848 (32 node-yield, 126 km from Mungo) or camels counted apart from mounts.

**Other gaps the balance shows** (not flags):
- **Xanadu buys gold** (85% of the map's net gold need) and **salt** (82%): the lore's "plentiful gold mines" (LORE.md:500) are low-grade
  in the geology, and the census found no salt (Tallwalls to Erehwon, 585 km, is the main salt road). The best gold within reach of a
  Xanadu pin is at 911,1665 (10.5 node-yield, 50 km from Strongwall); the Catch's evaporites (1080,1428) are the salt fix the census
  proposed. Xanadu also buys **scrap** (57%) and **arms**, as the lore says (LORE.md:501); it sells **copper, rare earths and oil**.
- **Iron is a regional good, not a long-range one:** every polity but the League of Amphitriton covers itself from its own good ore
  (Yuni, Spirladunon, Fulcrum, Roketstad, Voth and the new iron mines), and the League's shortfall is small (Ys and Trigon on low-grade
  ore). Inside polities iron does move: Iziz is the largest iron customer on the map, fed by Talia, Hook, Arcbeam, Pylon and the new Iziz iron mine. The
  League also buys most of the map's net **tin** need (62%) and pays in pearls.
- **The Republic** buys **coal** (30%), **silver** (32%, the Mint), **oil** and **rare earths**, and sells rockets and lenses: a natural
  long-range customer of Iziz's and the Beast Riders' coal and oil.
- **Yuni** buys **oil** (43%) and **coal** for its generators from Mav's Refuge and Iziz (about 650 km).
- **Iziz** buys **rare earths** (82%) for its mechs and generators, from Erehwon, Nulab and Voth.

## 5a. Applied (the owner, 2026-11-12: "apply both")

The four fixes and Xanadu's gold field are in. This model's tables above are as computed **before** them; rerun the
scripts (scratchpad `trade\`) to see them.

| Polity | Its unique export now | How |
|---|---|---|
| Tungang Union | saltpeter (cave works) and Rift-line salvage | `SETT_ADDED['5.1e9']`: Tungang saltpeter works at 492,1255, on rich saltpeter (200) |
| Fellgangs | gold | Fellgang gold camp at 438,1448, on decent gold (140), 24 km from Wildcat |
| Screamer Country | bloodwood red | `kits/crops` record `bloodwood` (a dye, `homeOnly`, home the hyperjungle: tapped, not planted, so only its home has it) |
| Coyote Kingdom | rock salt | Coyote salt works at 1190,463, on rich rock salt (229); its sulfur is low grade (60), so salt is the export |
| Xanadu | gold, from its own mines | the gold lode `lode:xanadu-gold` (911,1665, r 16 km, peak 225; ~380 km² rich), stamped by `tools/scale-model/geology.py --lodes` from `kits/resources/data/lodes.json`, and the Xanadu gold mines village on it |

## 6. Decisions for the owner

1. **The four fixes** (section 5): a Tungang saltpeter works at 492,1255, a Fellgang gold camp at 438,1448, bloodwood red for the
   Screamers (a `kits/crops` dye), a Coyote salt and sulfur works at ~1190,463. Pins and a dye; no map edit.
2. **Xanadu's gold:** add a gold field (911,1665 is the best near a pin) so the lore's gold mines exist, or keep Xanadu a gold buyer
   whose wealth is cacao, copper and rare earths. Its salt road (Tallwalls or a Catch salt town) is the census's open question.
3. **Polity calls made here:** the Zeijani apart from the League; Loj Twenny Tungang; Port Goto in Shell Province; Talon a Beast Rider
   town; Tallwalls and Tallhouse the Free Giants; the Lizardmen outside trade. Say if any should differ.
4. **Crop trade:** with `kits/crops`' broad ranges the luxury crops grow everywhere warm. If crops should drive trade, give the
   prized crops a native list (`home`, like the dyes' `homeOnly`): cacao to the Vale of Xanadu, clove to the Spice Isles, tea to the
   Eternian lowlands; this model would then show them as unique.
5. **Populations:** 70% are estimated by type. The figures that move the tables most: Iziz, Dalab, Jimjam, Ys and Fulcrum (20,000
   each, estimated), the Hexahedron (10,000) and the 8,000 of every other city.
6. **Specialties as written:** lenses to the Republic and books to the Monks (section 2); Jimjam's brick capped at 450 km; the Spice
   Isles' spice re-exported through Temora and Zey'danin (the isles have no pins).

**The next round** (the owner, 2026-11-12) is scoped in `openworld/TRADE-SCOPE.md`: the East Rift trading through Iziz, Yuni and
the Dasri; Xanadu's salt from the Catch, the Bowl and the north; Tallwalls a town; oil and rare earths extracted only by Yuni,
the Eternians, the Order (and the Tungangs' rare earths), with Geomancer concessions and oil demand by use; Locus's oil lode;
native crops; natural exports for the Republic, the Zeijani and Jimjam; scrap to iron. Not built yet.

