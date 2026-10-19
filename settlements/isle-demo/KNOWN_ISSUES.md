# settlements/isle-demo: known issues (the site planner)

- [ ] **Ridertown still takes two of the catalog's hand-made copies** (2026-10-18): `br_bldg_nature_shrine` (class
      `shrine`) and `br_bldg_roost_gallery` (class `rookery`) in `src/30-isle-programme.js` (ISLE.CLASSES), drawn through
      `CAT` (`bundles.py`, which reads `kits/catalog/krator-master-buildings-beast-rider.js`). The Beast Riders kit now
      has the towns' own buildings as ports (kits/beast-riders README, "The ports"). The switch:
      - `shrine: [['br_port_mavs_shrine', 0]]` (Mav's Refuge's nature shrine) and, if the class should vary, the deck
        lots' `br_port_mavs_lot` home (v0) or fine house (v1) are rider dwellings too;
      - `rookery: [['br_bldg_rookery_tower', 0], ['br_port_mavs_roost', 0]]` (the great roost; v1 the main roost); a
        roost is a lip and a stall on a level's rim, not a free-standing gallery, so the tower may be the better
        stand-alone rookery and the roost a second choice;
      - the stables stay the kit's own (`br_bldg_raptor_stable`, `br_bldg_great_byre`).
      What it needs: `CAT` takes `kits/beast-riders/towns.py` `bundle()` (the two towns sealed, about 9.5 MB, nearly all
      their library maps: put `BR_TOWN_IMG` in a sidecar, as the page's other packs, to stay under the gallery's 16 MB)
      and `kits/beast-riders/src/60-br-ports.js` after its core; and the draw (`src/60-isle-draw.js`, which flattens a
      proto per material) has to take the ports' own materials (the towns' MeshStandardMaterial with library maps, not
      the catalog's vertex-colour families). Not switched yet: the page is unchanged.

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
- [ ] **City page (P6) stand-ins.** Ridertown takes the Beast Riders kit's stables, byre and rookery tower; its shrines
      and roost galleries are the catalog's copies of Mav's Refuge's (lossy until the kit's faithful port). The
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
