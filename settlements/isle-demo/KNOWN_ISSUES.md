# settlements/isle-demo: known issues (the site planner)

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
- [ ] **City page (P6) stand-ins.** The Beast Riders kit (`kits/beast-riders`, waiting on three textures:
      `core/materials/PROMPTS-NEEDED.md` section 6) brings Ridertown's stables (the Islanders' byre stands in, named in the
      census) and a free-standing rookery tower (the catalog's roost gallery stands in). The Islanders have no
      caravanserai (the guest house stands in), no bloomery for Valapo's smelter (the smithy), and no cooperage or rope walk
      for the works quarter.
- [ ] **City page: no furniture, no crop stands.** FURNISH places nothing on this page (P6b's export profile brings the
      furniture); the farmland is drawn as tinted ground and simple orchard trees, not kits/crops' stands.
- [ ] **City page: the white sand beaches** are tinted, not widened: the terrain edit (the strand's sand recoloured white)
      is still to do.
- [ ] **City page: the Vernacular's file list** is Verge's (`settlements/verge/build.py izv_files`) plus the fragments Iziz
      has added since; one shared list in settlements/iziz is a follow-up (Verge's misses 71a-c and 73b-c).
- [ ] **City page: headless verify draws fewer pieces** in full for its screenshots (the nearest 600): software GL times
      out on the full near set.
- [ ] **City page: the scaled drawing's coast pieces are snapped by a rule** (`tools/scale-site.js`); the owner checks
      them in the planner.
- [ ] **The in-app browser pane can stall** loading this page while several world pages are open in other tabs (GPU).
      Close them first. Headless and alone it loads in under a second.
