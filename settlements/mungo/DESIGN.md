# Mungo — design (the brief, as decisions)

The owner's brief (2026-10-05), with what each sentence became. Where a reading was needed it is marked *(reading)*.

## Environs

| Brief | Built |
|---|---|
| Bottom of the eastern abyss; the eastern shore of one of the salt lakes | The water plane is y = 0 (Locus's convention, which the eastern-abyss biome assumes). The shore runs north-south at x ≈ −50; the lake is to the west. Its colour is its own (`EASTABYSS_LAKE.hue = 0.47`, a blue-green salt lake), not Locus's red one *(reading: "one of the salt lakes" is not Locus's)*. |
| North and south: open abyssal floor | `forestK` thins to an open floor of marsh, salt pans and pools beyond ~700 m north and south (`10-core.js`); the two highways cross it. |
| East: the rim of the abyss rises in the distance | The painted horizon (`20-stage.js`): the east wall at about 6° (Locus's close shelf is 10.5°), and the floor tips up from x ≈ 1.5 km. |
| West: the western rim across the lake, then the salt flats much farther west | A cliff band across the lake at 2–3°, bluer for its distance, strata on its face; above its crest a pale glare, the salt flats beyond *(reading: from the floor one cannot see onto the plateau; the flats show as glare over the rim)*. |
| The landward side at the mouth of a small river | `RIVER`: one channel, ~15 m wide, widening toward its mouth just south of the bridgehead. The south highway bridges it. |
| (2026-10-05, a later request) An extensive marsh with reeds at the river mouth | `marshK` / `marshH` (`10-core.js`): a fan round the mouth south of the town (≈ 260 × 325 m), a band up both banks of the river to x ≈ 500, and a strip along the south shore to z ≈ 700; the ground let down to just above the water with pools and channels through it. About 8,500 reed beds (`REED_BEDS`, 30-layout §7b), drawn with the Reed Lake kit's living reed (`hRLReed`, one draw call), green in the wet, straw-dry on the higher ground; the biome thinned to scattered trees there. Every road and track that crosses it runs on a causeway (`CAUSEWAYS`). The fields moved out to drier ground by themselves (their test refuses ground under 0.5 m). Life: 10 reed cutters and the weavers (at first light) work the reed beds (`CUT_REED`) and carry the reed to the workshops. |

## The two districts and the bridge

| Brief | Built |
|---|---|
| A reed village, about 2x the size of the existing one, just offshore | The Reed Lake kit's own composite village (6 islands, 13 buildings, 160 × 126 m) twice: the north cluster as the kit builds it, the south cluster mirrored with weavers, docks and dwellings in place of the halls; joined through the island of Reed's Local. 13 islands, 34 buildings on them and 6 on their own pads, about 190 × 260 m (2.5× the kit village's area). 110–380 m offshore in three metres of water. Drawn by the kit itself (`65r`, `01-reedkit.html`). |
| A single reed pontoon bridge to a smaller village | One pontoon, 87 m, from the landing of Reed's Local to the shore at the bridgehead. The walk graph joins the reed village to the land by that one edge (`verify.py`: one-pontoon-to-the-land). Short pontoons join the islands to each other and to the pads (the kit village leaves its pads to the boats; Mungo's people walk). |
| ... about 1/2 the size, primarily eastern abyssal buildings | The landward town on a low terrace north of the river: ~110 buildings of the Eastern Abyssal kit (salvage shacks, family houses, stilt houses on the low ground by the water) *(reading: "half the size" as half the people of the reed village's district plus its trades; the brief's list of civic buildings sets the floor)*. |
| One new, large tavern in the Reed style, "Reed's Local" | `rl_tavern` in the Reed Lake kit (`settlements/reedlake/src/81-rl-tavern.js`): a 28 m great mudhif with an annex kitchen and store, a terrace, a landing on the water and a woven REED'S LOCAL sign. Its interiors: `kits/interiors/sets/reedlake.js`. |
| The reed village: fishing, many fishing docks and weaving shops | 5 fishing docks and 4 weavers' workshops on the islands; 2 more docks on the shore. |
| The landward side: farming, lumber and fruit from the forest, catering to nomads and caravaneers | Fields on the river flats (salt-rice paddies, three farmsteads, a salt-rice farm, a granary, a windpump); 5 logging landings at the forest's edge on tracks; 5 fruit groves; the caravanserai, the inns, the warehouses. |
| Several warehouses, a caravanserai, 2 inns, a headman's house, a city watch | Caravan warehouse (abyss), salt-and-goods warehouse (Locus), fish warehouse (abyss) on the shore; the Eastern Abyssal caravanserai on the north road; two Eastern Abyssal courtyard inns; the headman's house is the Eastern Abyssal *great house* (`abyss_house_rich`) *(reading: the kit's 92 m Headman's palace is a city's; a village headman gets the great house)*; the city watch is the Eastern Abyssal barracks. |
| Between the districts, weapon, armour, general, food, alchemy and building-material shops | Round the bridgehead market: the Abyssal kit's weaponsmith, armourer, general goods, cookshop, alchemist, and the new **Builders' yard** (`abyss_shop_builder`, `settlements/locus/src/65-abyss-40-shops.js`), which doubles as the lumberjacks' timber yard; and the salt-and-fish merchant on the shore. |
| A Geomancer's chapterhouse surrounded by half a dozen Yuni houses | The Locus kit's chapterhouse east of the headman's, the six Yuni middle-class house types round it (their interiors: `kits/interiors/sets/yuni.js`, new). |
| Firelight at night; only the chapterhouse and the Yuni houses electrified | Oil lanterns on posts down the main street, round the market, along the quay, the inn and caravanserai gates; the reed village's fires (the kit's firelight items, switched at night, lighting the night-light volume). The generator house beside the chapterhouse feeds a line round the chapterhouse's ring street only (`71g-mungo-grid.js`): electric lamps there, wired windows in the chapterhouse and the six Yuni houses only (`verify.py`: electric-light-only-in-the-geomancer-quarter). |
| A small parking lot for dune buggies (a new model; start a Motor Vehicles kit) | The buggy park on the chapterhouse's forecourt, a fuel station beside it. The buggy is the first vehicle of the new kit `kits/motor-vehicles/` (`geo_dune_buggy`: Scout, Crew, Drill rig), taken into the page as `KratorVehicles`. |
| Street layout chaotic and organic, but one main street (headman to pontoon) and highways north and south off the map | Lanes are GROWN off the main street and the roads (`30-layout.js` §6): they wander, branch and join where they meet. The main street runs straight (within 2 m) from the market to the headman's door; the pontoon lands at the market's other side. The north and south highways are routed over the ground to the map edge (MAP_R 1150). |

## The life layer: "a test of the new scheduling system"

Built on `core/simulation` (Phase 1 of `core/simulation/PLAN.md`, written for this) and `core/clock` (`KCLOCK`):
decisions are stepped once per simulated minute from the schedules and the places' slots; motion is a pure function
of the motion clock. The data is `settlements/mungo/world/*.json`.

| Brief | Built |
|---|---|
| Fishermen, farmers, lumberjacks and gatherers who go out to work by day and home at night | Roles `fisher_boat`, `fisher_shore`, `farmer`, `lumberjack`, `gatherer` with 24-hour schedules; their places are the fishing water, the shore spots, the fields, the logging landings, the groves; they deliver to the fish market, the builders' yard, the market. |
| Shop and tavern keepers tend their shops | `shopkeeper` (pinned to a shop, 7:00–20:00), `innkeeper` and `innkeeper_eve` (the inns and Reed's Local, day and evening shifts). |
| A handful of Geomancers hang out round their compound and maintain their buggies; periodically one sets off off the map and returns a short time later | 8 `geomancer`s: work and study in the chapterhouse, MAINTAIN at the buggy park and the fuel station, SOCIALIZE on the forecourt. The `geo_trip` event (every 2–5 world hours, 8:00–17:00) sends one on duty at the park: he walks to his buggy, drives to the north or the south highway's end, is away 1–3 hours, drives back. |
| Caravans pass through and stop at the caravanserai; up to 3 draft animals, per animal one driver, two guards and one merchant; animals left behind; they buy and sell at the shops, spend the night at an inn or tavern, move on off the other side of the map the next day | Events `caravan_yuni`, `caravan_abyss`, `caravan_iziz`, `caravan_monks`: 1–3 units of {driver, 2 guards, merchant} with a pack lizard each, in from one highway's end; they walk in as a column to the caravanserai (STABLE: the lizards stay in its court), then follow their roles' schedules (merchants TRADE round the shops, the market and the warehouses; guards GUARD and DRINK; drivers TEND_BEASTS), LODGE at an inn, the tavern or the caravanserai, and at 7:00 the next day leave together by the other highway. |
| Nomads riding lizards come in cross country in groups of 3–5 and behave similarly | Event `nomad_riders`: 3–5 riders from a country port (east, north-east, south-east, north, south), ridden across the floor on the `animal` layer (inside the town only on its streets) to the caravanserai, the mounts left in the court; they trade, buy, drink and lodge, and ride out by another port at 8:00 the next day. |
| Fishermen work on the shorelines and take boats out; they come back and leave the boats docked at night | Each `fisher_boat` has a boat at a dock (the nearest with room): at 5:00 he walks to it, rows out to a spot on the fishing water (the `water` layer, round the islands), fishes till 11:00, rows back and walks the catch to the fish market; afternoons at the nets and the shore; the boat stays tied at its dock till morning. |
| History: a trade centre; friendly to Yuni, the eastern nomads and the Geomancers, less so the History Monks and Iziz; neutral to others | `world/relations.json`: Mungo → yuni, eastern_nomads, geomancers `friendly`; monks_of_history, iziz `cordial` (one step less); everyone else `neutral` (no record). Places are `public` to anyone not hostile; the chapterhouse admits only friends of the Geomancers. |

## Who lives there

About 470 residents (the census): the reed folk (fishers, weavers, gardeners, the shaman, the reed warriors at the
watchtowers), the shore folk (farmers, lumberjacks, gatherers, shore fishers, craftsmen, children, townsfolk), the
traders, the watch, the headman's household, 8 Geomancers and 22 Yuni householders; plus the visitors the events
bring (a caravan of 3 units is 12 people and 3 lizards).
