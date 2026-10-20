# settlements/isle-demo: known issues (the site planner)

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

## The towns on core/simulation (P7b, 2026-10-19)

- [ ] **The citizens are stand-ins** (`59`): an instanced body and head per figure, coloured by their kind of work (the
      kin by their house's class), up to 120 within 260 m of the camera's target, posed from `SIM.pose`; no walk cycle, no
      clothes. core/charactermodels has no light path into a settlement yet (its README asks for a crowd cost plan first:
      instancing or impostors, LOD, a download budget), so its bodies replace these later. A place's workers stand round
      its door's spot (the posts have no spots of their own: no interiors), so a market's traders cluster.
- [ ] **The canoe line's want is a town's use, not its shelves** (P7c): each town draws hourly on its warehouses what it
      uses of the other's goods (`ISLE.TUNE.sim.trade.uses`: Valapo's salt, rice, cloves and cacao, Kautoa's sugar), as an
      abstract use; the imported foods are not yet sold in its shops or eaten in its meals, and the weavers of Kautoa still
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
- [ ] **The governor and spoilage are the page's hooks** (`49`, on `SIM.stepHooks`): an order-up-to rule that sets
      `E.recipes[id].rate` hourly and the perishables' midnight loss. Both belong in `core/simulation`'s economy as
      opt-in features (`SIM.economy({govern, spoil})`) once proved here; until then a second settlement would copy them.
- [ ] **Demand follows supply in the households:** a household buys each food in proportion to the warehouses' stock,
      so the more a town holds of a food the more of it is eaten; the governor's demand chases that. It holds (each
      town's food within 2% over three weeks), but the households' stores shrink slowly as the warehouses settle.
- [ ] **The material meter pins at 100 by day 14** (needs on, 2026-10-19): it rises 7 a day and only replacements are
      bought (a garment 8, a pot 20, every few weeks a person), so material alone takes happiness from 89 to 70 and
      work to 95% efficiency. The isles want treats (Voth's `items.treat`): pandanus mats, coconut-oil lamps, shell and
      bead jewellery, kava, as goods with makers (PLAN.md 9b, household goods). Contemplation settles near 60: few
      choose worship in their free hours.
- [ ] **A pot does not feed the cooking:** a household without its pot still cooks (core's meal does not look for one),
      and a cook without a cooking pot works at half pace like any tool. Once needs run, a pot-less kitchen should cook
      worse meals.
- [ ] **Core asks for a tool only when it breaks:** an errand that fails (the town out of tools) is never tried again,
      and the worker stays at half pace. The page asks again each hour of work (`ISLE.simToolRetry`, 43); a core rule
      later.
- [ ] **The seasoning is a getter** on the food kinds' `quality` (43), read in the town's turn while its warehouses hold
      salt (`ISLE.SIM.seasoned`, 49); core could take a per-settlement seasoning rule instead.
- [x] **Kautoa's farm ring went hungry** (2026-10-19): the farmhands work in the fields till 17:00, far from home; the
      first free hour's walk reached a shop after it closed, the errand went stale, and from day 13 about 370 meals a day
      were eaten from empty stores (the no-shortfall check missed it: the warehouses had the food). The staples shops and
      the market now stay open till 21:00; none since.
- [ ] **The households restock on a three-day round,** in step, so the warehouses swing about 15% around their target
      and the governor reads its demand over three whole days. Staggered restocking would smooth both.
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
- [ ] **The second morning's buying wave.** Every house opens with 1.5 to 3 days of food, so on day 2 most of them buy at
      once and the warehouses' days of fish and sweet potato dip (above a day with the present rates, five days run).
      Over five days Kautoa makes about a third more food than it eats (151,717 servings to 114,956), Valapo likewise.
