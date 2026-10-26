# settlements/isle-demo: known issues (the site planner)

- [x] **After merging main (2026-10-20): the Vernacular's workshop failed to build** (`vnPlate is not defined`): Iziz added
      `69e5-iziz-openings.js` (real doors and glass: vnPlate, vnHole, IZDOOR), which the vernacular fragments call, and
      `bundles.py izv_files` did not take it. It does now. `settlements/verge/build.py izv_files` has the same gap (its
      71-vern-trade.js calls vnPlate): not changed here, it is Verge's to rebuild.
- [x] **The Beast Riders' own buildings read flat next to their kit** (2026-10-20, checked after the Governor's House fix,
      which had already put the Iziz Vernacular right): the raptor stable, the great byre and the rookery tower carried
      no maps here. The kit's page draws them with the catalog's detail maps (kits/catalog/krator-furniture-detail.js
      over the kit's KF_TEX: each material's texture family projected triplanar, its mean divided out); CAT now takes the
      same (bundles.py: KF_TEX in the page's .tex.kftex.js sidecar, the detail code, catProto details every non-port
      building) and tags each such material userData.courtTri, the triplanar hook core/export carries to Godot. The two
      ported buildings (Mav's shrine and roost) were right already (their towns' own maps).
- [x] **The pieces read washed out next to their kits** (the owner, 2026-10-20, the Governor's House): `isleFlatten`
      (58) dropped each instance's colour (the fix from origin/main c31288c2f, taken here alone: the rest of that commit
      fixed the towns' KMAT swap another way, which this branch fixed in towns.py) and lost the Iziz Vernacular's
      world-unit tiling (core/materials/opt/69a-world-uv.js scales an instance's uvs by its own size; the flatten baked
      the size into the positions, so a 20 m wall tiled like a 0.2 m beam). The instance's face scale is now baked into
      the uvs (a plain mesh's divided by K), so the hook's * K gives the kit's tiling. Both Godot cases cut again.
- [x] **The city page drew the Islanders and the Vernacular without their library packs** (fixed 2026-10-20, found by
      M7's comparison of the two pages' exports: the Islanders' UVs were 1.5x apart). The Beast Riders towns sealed in
      `CAT` set `window.KMAT` to their own, so the `islanders` and `iziz` packs registered before CAT were lost: `ISK`
      fell back to untextured keys and its painted sheets' canvas stand-ins (patWeave 2.4 m a tile, the kit's own 1.6 m),
      and `IZV.bindMat('iziz')` found no pack. `kits/beast-riders/towns.py` now keeps a town's KMAT and TEX in its closure
      and hands its pack to the page's; the export finds each material in its own kit's pack (`62` `ISLE.libraryOf`,
      `58` `isleMatPack`), since the Islanders' and Iziz's packs name some of the same sets. Kautoa's case and Valapo's
      were cut again (the Islanders' maps now by reference in `tex/`; `tools/harness.py` copies a file name two packs
      share as `<pack>.<name>`); Kautoa's items hash as the open world page's (`openworld/isle-demo/KNOWN_ISSUES.md`).
- [ ] **Four of Valapo's case's textures have no image** (`from: 'none'`, `tex:isle:png82`-`85`, materials 36-39 with
      no library set): they were in the case before the 2026-10-20 cut too. Godot draws those materials from their colour.

- [x] **`IZV.proto` carried every Vernacular piece built before it** (fixed 2026-10-20, found by M7's comparison of the
      two pages' exports): the Iziz kit's `kbake` (settlements/iziz/src/30-kit.js) bakes every item put so far and keeps
      them, so each piece grew by all the earlier ones and a piece depended on the order the page built them in.
      `bundles.py` empties the kit's items before and after each piece; Kautoa's case was cut again (285 items, 1,461
      instances; it was 359 and 1,535).
- [x] **City page: the towns read pale** (2026-10-19; fixed the same day). The kits draw their detail as InstancedMeshes
      with a colour PER INSTANCE (the kit's `kput` colour becomes `instanceColor` at `kbake`: the Islanders' patterned
      walls and thatch, the Vernacular's timber), and the flatten (`src/58-isle-protos.js` `isleFlatten`, `DRAW.flatten`)
      copied each instance's geometry and matrix but not its colour, so every tinted piece came out in its material's
      base colour, white. Found by the owner on Hook's town, built on the same pattern (`settlements/hook/src/
      90b-hook-city-draw.js` has the same fix). Now every flattened part gets a `color` attribute (the source's, times the
      instance's colour, white where it has neither), the material groups are keyed without `color` so parts with and
      without one merge, and every material the parts use reads vertex colours. `DRAW.near` draws the flattened parts as
      they are and the massing's tints (`DRAW.records` KC) are set per instance on their own meshes, so neither lost a
      colour. The open world's hamlets (`openworld/isle-demo`) and Pinnacle Rock's cavern town read this fragment in
      place and take the fix on their next rebuild. A second loss sat under it: the two Beast Rider towns sealed in
      `CAT` (`bundles.py`, `kits/beast-riders/towns.py`) each load `core/materials/record/23-mat-record.js`, whose last
      line sets `window.KMAT` to the town's own, so the page's `KMAT` (the Islanders' and Iziz's packs registered on it)
      was the last town's by the time `ISK` and `IZV` ran, and neither bound a library map: no thatch or pattern sheets
      on the Islanders, no brick or render on the Vernacular, each surface its palette tint alone. `CAT` now shadows the
      page's window as `ISK` and `IZV` do, keeping that one write off it (`CAT_WINDOW`). The export profile's
      `materials` section had been met by that leak too (the last town's record table): now `ISK` registers the
      Islanders' records as the kit's own page does (93-anim.js, lifted into `ISK_TAIL`) and `IZV` takes Iziz's own
      `88y-iziz-matlib.js` (its aliases, tiles and records) in place of the tail's plain bind, so the section holds
      the two towns' own materials (51 and 43 records).
- [x] **Ridertown took two of the catalog's hand-made copies** (2026-10-18; switched the same day):
      `br_bldg_nature_shrine` (class `shrine`) and `br_bldg_roost_gallery` (class `rookery`). Now the Beast Riders kit's
      ports of Mav's Refuge's own buildings, drawn by the town's own builders: `shrine: br_port_mavs_shrine`, `rookery:
      br_bldg_rookery_tower` or `br_port_mavs_roost` (the great roost, v0); the stables stay the kit's own. `CAT`
      (`bundles.py`) seals `kits/beast-riders/towns.py` `bundle(side)` and `src/60-br-ports.js` after the catalog's core
      (the catalog's buildings file is no longer read); the towns' maps (`BR_TOWN_IMG`, 8 MB) are the sidecar
      `dist/isle-city.tex.brtowns.js`, the page 4.6 MB. The plan's boxes for the ports (`ISLE_DIMS`) are the ports' declared
      boxes (`60-br-ports.js` DIMS, the largest variant), checked by verify. The draw (`src/60-isle-draw.js`):
      `DRAW.portMats` puts the towns' shader hooks (world UVs, sway, contact shading, night light) on their plain-mesh
      branch, since the ports' shapes come with those baked and are drawn instanced here; `DRAW.flatten` now scales a
      normalized integer attribute (the ports' furniture colours are `Uint8`), which had drawn that furniture white.
      Left: a roost is a lip and a stall on a level's rim, so on the ground it reads as a yard with a hoist (the tower is
      the better stand-alone rookery; the owner may drop the roost); and the city page has no tone mapping where the
      kit's page and the towns use ACES, so the ports read a little lighter here than in their towns.

- [x] **Valapo's frame was inland** (2026-10-15). Its settlement point (one 2 km scale-model pixel) is 5.2 km from the
      sea, so its square held none. On the owner's word the origin moved 3.7 km toward the coast, north-north-west
      (`ISLE.SHIFT`, and the frame in `site/isle-site.json`). Now:
      - the shore is 1.6 km from the origin (Kautoa's is 1.8 km), and about a fifth of the square is sea: a bay to the
        north-west;
      - the original point stays inside the square, near its south-east corner, in the XA forest.
      A verify check holds every town's frame to land, with its settlement point and a shore in the square.
- [ ] **Some of Voth's words remain** in the tools' panels: "copy as Voth DISTRICTS entry" in a district's editor (it
      copies the polygon in Voth's format), and "Ferry stop", "Ferry line" and "Elephant bug" in a stop's or line's
      editor. The buttons and hints use the isles' words. Changing the editor's words means vendoring 55-site-tools.js.
- [ ] **Drawn causeways are stand-ins:** a plain deck or fill box per segment (`VOTH.span`, `VOTH.reclaimedCauseway` in
      10-isle-frame.js), not Voth's arches and piers. The Islanders' own jetties and causeways come from the kit in the
      city plan (P6).
- [ ] **The ground's detail textures are Voth's** (settlements/voth/tex: stone, ground, rock, sand), read in place as
      Voth's editor takes them. The isles' own library sets would suit better (a materials.json for this build).
- [ ] **No geyser relief here.** The planner's ground leaves out the geyser fields' relief (openworld/isle-demo's
      89-world-geysers.js needs the geyser kit). The nearest vent is 6 km from Kautoa and 28 km from Valapo, beyond the
      square, so neither town's ground differs.
- [ ] **City page (P6) stand-ins.** Ridertown is the Beast Riders kit's (its stables, byre and rookery tower, and its ports
      of Mav's Refuge's shrine and roost). The
      Islanders have no caravanserai (the guest house stands in), no bloomery for Valapo's smelter (the smithy), and no
      cooperage or rope walk for the works quarter.
- [ ] **City page: no furniture, no crop stands.** FURNISH places nothing on this page (P6b's export profile brings the
      furniture); the farmland is drawn as tinted ground and simple orchard trees, not kits/crops' stands.
- [ ] **City page: the white sand beaches** are tinted, not widened: the terrain edit (the strand's sand recoloured white)
      is still to do.
- [ ] **City page: the Vernacular's file list** is Verge's (`settlements/verge/build.py izv_files`) plus the fragments Iziz
      has added since; one shared list in settlements/iziz is a follow-up (Verge's misses 71a-c and 73b-c).
- [ ] **City page: headless verify draws fewer pieces** in full for its screenshots (the nearest 600): software GL times
      out on the full near set.
- [ ] **City page: the first drawing's programme items not in the redrawing** are left out until the owner draws them:
      Warrior's Square (the native military stands in the harbour's eastern third instead), Market 3, Park 2 and its
      loop, the envoy markers (the envoys are placed round the ring).
- [ ] **City page: Valapo's raised beach** (the owner's ground edits) stands as a sand bar in the shallows south of the
      village; it is what the strokes make of the sea floor there.
- [ ] **The in-app browser pane can stall** loading this page while several world pages are open in other tabs (GPU).
      Close them first. Headless and alone it loads in under a second.
- [x] **2026-10-20: rebuilt with core/tags' new cultures (jimjam, dalab).** `isle-city.html` took the refreshed tags vocabulary
      (+137 bytes); `isle-site.html` and the city page take no geyser fragments (they read the world's ground only), so the
      geyser water change does not reach them. `verify.py dist/isle-site.html --assert` passes; `node tests/test-isle-city.js` passes.

## The towns on core/simulation (P7b, 2026-10-19)

- [ ] **The citizens are stand-ins** (`59`): an instanced body and head per figure, coloured by their kind of work (the
      kin by their house's class), up to 120 within 260 m of the camera's target, posed from `SIM.pose`; no walk cycle, no
      clothes. core/charactermodels has no light path into a settlement yet (its README asks for a crowd cost plan first:
      instancing or impostors, LOD, a download budget), so its bodies replace these later. A place's workers stand round
      its door's spot (the posts have no spots of their own: no interiors), so a market's traders cluster.
- [ ] **The canoe line's want is a town's use, not its shelves** (P7c): each town draws hourly on its warehouses what it
      uses of the other's non-food goods (`ISLE.TUNE.sim.trade.uses`: Valapo's salt, cloves and cacao, Kautoa's sugar), as
      an abstract use. The imported foods are on the shelves since 2026-10-26: Valapo sells and eats Kautoa's rice at its
      ration (`trade.diet`, 0.05 a person a day, core's SIM.itemsDiet: about 140 eaten and 150 landed a day over 21
      days; a week-test check with its negative). The lakatoi lands it in lumps (it fills six days of a one-day use that
      swings with the restocking round), so Valapo holds about ten days of rice; and the weavers of Kautoa still
      lack cotton (a recipe whose input never was made is not declared). Valapo makes no coffee yet (its upland farms are
      a world record), so the oruwa comes back from Valapo empty.
- [x] **Kautoa's kin mostly stayed home in their free hours** (2026-10-19): 425 places to be in company for 3,700. The
      plan's pocket parks, plazas, park and beach districts are now places, and the markets, taverns, hall and square
      hold more: everyone who wants company at 10:30 finds it (a verify check).
- [ ] **Ages are drawn, not lived:** a person's age is a hash within its band and never changes; nobody is born, ages or
      dies, and children under five are not counted (the census's five a household holds no infants). Housework is a
      schedule at home and makes nothing; school teaches nothing yet (no skills). The pupils are the town's STUDY places'
      worth (Valapo 32% of its children, Kautoa 24%), the youngest by band, not by who lives nearest a school.
- [ ] **Valapo needs 20 carts** (was 14): with the cane and cotton to haul as well, 14 left coconut, meat and bread on the
      sites for a day once the households changed.
- [x] **Kautoa ran out of pork and milk; Valapo of cloves and cacao** (two weeks' books, 2026-10-19). A household buys its
      days of food at its nearest seller, each food in proportion to the warehouses' stock, and the butchers sold only
      pork and milk: their neighbours bought nothing else, and from day 9 both were gone. Every food seller now sells the
      town's whole list. The oruwa landed its cloves and cacao a few dozen at a time, under the 40 a cart waits for, so
      they sat at Valapo's canoe stop: they now take a load of 5 (`ISLE.TUNE.sim.economy.minLoad`). The land animals'
      food is now one good, meat (owner), and a town opens with each food in its share of what the town makes.
- [ ] **Still piling up** (2026-10-19, after the pots, the stone tools and the salt): Valapo's cotton (+122 a day) and
      cloth (+34), and a little stone (+7). The governor's floor (0.3 of the full rate) keeps a producer working with
      little use for what it makes; the potters' and the quarry's rates were cut to their custom. Stone wants building.
- [x] **The governor and spoilage were the page's hooks** (`49`, on `SIM.stepHooks`): since 2026-10-26 they are
      core/simulation's (`77-sim-6-govern.js`: `SIM.economy({govern, spoil, keep, season})`), with the ships' buys as the
      governor's `buys`; `49` only maps the tuning. The week test's books are byte-identical on core's rules.
- [ ] **Demand follows supply in the households** (except the imported foods, bought at their diet share since
      2026-10-26): a household buys each food in proportion to the warehouses' stock,
      so the more a town holds of a food the more of it is eaten; the governor's demand chases that. It holds (each
      town's food within 2% over three weeks), but the households' stores shrink slowly as the warehouses settle.
- [x] **The material meter pinned at 100 by day 14** (needs on, 2026-10-19): only replacements were bought. The treats
      (kava, mats, lamps, jewellery; Voth's `items.treat`) hold it near 33, happiness near 79.
- [ ] **The page registers the `sim` export section** (`50`, `by: 'isle-sim'`): core/simulation should register it
      itself for every page that declares settlements, as core/city registers `city`, with the settlements, routes and
      books the isle page adds to `SIM.export()` (a core change: through the core session). The export is about 3.1 MB
      (8,450 actors, 2,839 places with their stores); the nav graph is left out.
- [ ] **The Kautoa case's world.glb is 37 MB** (godot/data/world-isle-kautoa): the Islanders' pieces are detailed and
      each part is its own item (359). A level of detail in Godot, or the kits' simpler pieces for the export, would cut it.
      The Islanders kit's doors, windows and lamps are exported (recorded while it builds); a building of the Iziz
      Vernacular or the Beast Riders gets one door at its front face (their kits record no openings on this page);
      interiors and furniture read empty (shells); the canoes are stand-in hulls and the citizens capsules in Godot (the Ring Sea kit's
      lakatoi is drawn on the page only while docked, and charactermodels has no crowd export yet).
- [ ] **Valapo has no carver's workshop:** its stone and wooden tools and its jewellery come from Kautoa by the lakatoi
      (PLAN.md 9b); a carver's workshop in the Islanders kit and on Valapo's plan is owed.
- [ ] **Racks wear nothing:** the dockers' hooks and the soldiers' spears and shields are drawn from a rack (core's
      `toolRack`), so no smith or dockyard makes or replaces them; the fishers' nets last 1,500 worked hours, so the
      weavers' net places make almost nothing (the governor's floor, `minBy`).
- [ ] **Core's treat is one item a wealth:** the last of `treat.items` whose least wealth a person has, so a class buys
      one treat; the isles spread each class's wealth a little a person (`items.wealthSpread`) so the middle splits
      between mats and lamps and the rich between lamps and jewellery. The poor drink kava and nothing else.
- [x] **Core counted a good nobody could buy as never running out** (a producer of several goods picks the one with
      fewest days left, and a good whose buyers all failed had no use, so it was never made: Kautoa's potters made no
      lamps once the opening lamps were gone). The isles gave such goods places of their own (`alternate`). Since
      2026-10-26 core counts the unmet draws as use (`SIM.economy({useShort})`), so the weavers and potters make all their
      goods again; dropping `alternate` showed two governor faults on a recipe of several goods, fixed in core too: a good
      never made asked for the most rate whether wanted or not (the kilns ran flat out and the pots piled), and a maker
      chose by warehouse days, blind to what sat at its own store (Valapo's cloth piled at the weavers): a governed maker
      now chooses the good furthest below its target over the whole supply line. And over 21 days the piles had hidden two
      more: Kautoa's weavers had no recipe at all (a maker needed every good of its list makeable, and Kautoa grows no
      cotton: it now makes those it can, mats and hats), and a town at the abstract level buys no treats, so nothing was
      made of them and, watched again, its shelves were bare: the governor keeps a shelf stock with no demand (`least`).
      21 days: one shortfall (21 lamps on one day) where there were 10 (8,131 jewellery).
- [x] **Kautoa's mats and hats opened high** (about 2,000): its weavers ran at the full rate on the first day, as every
      producer did before the governor had a history. Once the abstract town bought mats, the carts chose those piles
      (36 days of mats against 522 of meat) and left Kautoa's meat unhauled on the first day. Since 2026-10-26 a recipe
      whose every good already holds its shelf stock (`least`) runs at its floor on the first day; mats and hats hold
      near 300-500.
- [x] **The abstract level bought no treats or wear** (2026-10-26): core's abstract day (77-sim-6-items.js
      SIM.itemsAbstractDay) wears each person's clothes and tool, takes a hurt, raises the material meter, and buys what
      that wants at the nearest seller in the town (no trip), each person at an hour hashed from it. With both towns
      unwatched or both watched for 12 days, the wear bought agrees within a few a day (a day earlier unwatched: the
      abstract day books yesterday); the treats run about 25% higher unwatched (every errand succeeds; watched, some go
      stale on the way). It showed three more things, fixed: the material meters opened between 5 and 30 and rose
      together, so every treat was first bought in one wave around day 9 (the meter now opens spread to the treat's
      `at`, 0-55); the potters' lamps sat at 44 kilns in lots under a cart's minLoad while the shelves were empty (core's
      `cart.urgent`: a good its buyers went short of, under a day on the shelves, is fetched in any amount; any good
      under a day kept the carts on small lots and left Kautoa's meat unhauled on the first day); the weavers short of cotton filled their
      hours with mats and hats (12,000 of each by day 21: a governed maker makes nothing over target while one of its goods
      is under). Valapo opens with 1,000 cloth (the target is about 1,600); both towns keep a shelf of 400 lamps (`least`, and the opening lot).
- [x] **The food supply-line check failed over 21 days** (before 2026-10-26): it passes since the abstract day.
- [ ] **Three small shortfalls over 21 days** (2026-10-26; the 7-day week test passes): Kautoa 9 lamps on day 14, and
      Valapo, unwatched, 31 and 49 kava on days 29-30. The treats are bought about 25% more unwatched than watched.
- [ ] **Contemplation settles near 60:** few choose worship in their free hours (the temples, shrines and squares are
      few and far for most).
- [ ] **A pot does not feed the cooking:** a household without its pot still cooks (core's meal does not look for one),
      and a cook without a cooking pot works at half pace like any tool. Once needs run, a pot-less kitchen should cook
      worse meals.
- [x] **Core asked for a tool only when it broke** (the page asked again each hour, `ISLE.simToolRetry`): core's
      `SIM.items({retry: 60})` since 2026-10-26.
- [x] **The seasoning was a getter** on the food kinds' `quality` (43): core's `season` rule since 2026-10-26 (a meal's
      foods count `mult` times their quality while the town's warehouses hold salt).
- [x] **Kautoa's farm ring went hungry** (2026-10-19): the farmhands work in the fields till 17:00, far from home; the
      first free hour's walk reached a shop after it closed, the errand went stale, and from day 13 about 370 meals a day
      were eaten from empty stores (the no-shortfall check missed it: the warehouses had the food). The staples shops and
      the market now stay open till 21:00; none since.
- [x] **The households restocked on a three-day round, in step** (the warehouses swung about 16% a day, the food
      bought a day by 0.7 of its mean). Since 2026-10-26 each house buys 1.5 to 4.5 days of food (core's `items.stagger`,
      0.5, a hash of the home) and the stores open with 1 to 3.5 days (the same mean as before, 2.25): the food bought a day varies by about 0.18 in
      each town over ten days, the warehouses about 7% a day; a week-test check holds the watched town's buying within 0.25. The
      governor still reads its demand over three whole days (`govern.window`), which could now be shortened.
- [ ] **The ships are timers, not vessels:** they buy on their days at the landing; the moored foreign vessels are drawn
      as before, and no ship comes or goes. Their goods leave the map (exported) for nothing in return yet: no money.
- [ ] **No sea route is drawn.** The lines run on SIM.trade's timer: a vessel shows at its berth while docked and is gone
      at sea. A `SIM.transport` line on a water layer between the two landings (122 km) would let the open world draw
      the voyage (P8). The berths stand up to 160 m from the landing, in the nearest water deep and clear enough.
- [ ] **The run loop is the page's own** (`57`); a generic sim clock for core/host (Voth's 56c lifted) is a follow-up. The
      stocks id map (`46`) waits for the page to take core/host (PLAN.md section 10).
- [x] **The meals by town, the nearest-job deal, the ring search and the lag at minute 0** (2026-10-19): fixed in
      core/simulation on `claude/isle-p7a-rest` and merged here. The checks read each town's own meals
      (`SIM.ITEMS.statsBy[town].meals`), every role takes `work.near`, the 01:00 start is gone; `SIM.REACH` (6 km) stays
      as a walking limit (nobody looks for a place in the other town).
- [ ] **Kautoa's farm ring is a stand-in.** The programme leaves it a world record beyond the wall (40 sites) for the open
      world; the sim declares each site a holding (`ISLE.TUNE.sim.ring`: one crop by a hash, 20 or 13 hands) with a track
      from the highways, until core/hamlet's farming villages (H6) take it. Valapo's farms beyond the village (its
      `farms` record) are not in the sim: its parcels inside the zone feed it.
- [ ] **The walking graph is built here** (`41-isle-nav.js`) from `{cls, w, pts}` of the plan's ways: it fits any
      core/city plan, so it belongs on core/city's data side (asked of the city-layout work) or core/simulation; kept here
      until then so no other page moves.
- [ ] **Food, clothes and soldiers' armour are items; tools, injuries and household goods are not yet** (PLAN.md 9b, the
      wear plan). The clothes are one set count for everyone (Voth's rises with class) and wear out in 90-120 days
      (Voth's owner rule is a year or more: the owner's call). The smithies make only leather armour until the iron mine
      (a hinterland village, core/hamlet H5) brings ore; Kautoa's weavers make nothing (the cotton is Valapo's, and the
      garments come by canoe).
- [ ] **No needs** (`SIM.needs`): schedules only, no meters, moods or efficiency.
- [x] **The second morning's buying wave** (gone since 2026-10-26: the stores open with 1 to 3.5 days). Every house opened with 1.5 to 3 days of food, so on day 2 most of them bought at
      once and the warehouses' days of fish and sweet potato dip (above a day with the present rates, five days run).
      Over five days Kautoa makes about a third more food than it eats (151,717 servings to 114,956), Valapo likewise.
