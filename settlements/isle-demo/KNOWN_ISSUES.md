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

- [ ] **Nobody is drawn yet.** The page steps the sim (`57`, held at first) but draws no citizens; a few near the camera
      are the rest of P7b. The run loop is the page's own; a generic sim clock for core/host (Voth's 56c lifted) is a
      follow-up. The stocks id map (`46`) waits for the page to take core/host (PLAN.md section 10).
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
- [ ] **Only the food is an item.** No clothes, tools or wear; the weavers' cloth and the potters' pots pile up in the
      warehouses (nobody buys them yet), the windmill's sugar waits for the canoe line (P7c), and the smithies make
      nothing until the iron mine (a hinterland village, core/hamlet H5) brings ore; Kautoa's cloves, cacao, salt, stone
      and leather pile up for the canoe line too, and its weavers lack cotton (Valapo's).
- [ ] **No needs** (`SIM.needs`): schedules only, no meters, moods or efficiency.
- [ ] **The second morning's buying wave.** Every house opens with 1.5 to 3 days of food, so on day 2 most of them buy at
      once and the warehouses' days of fish and sweet potato dip (above a day with the present rates, five days run).
      Over five days Kautoa makes about a third more food than it eats (151,717 servings to 114,956), Valapo likewise.
