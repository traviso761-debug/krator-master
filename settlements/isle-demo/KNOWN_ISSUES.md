# settlements/isle-demo: known issues (the site planner)

- [ ] **Walapo's frame is inland.** Its settlement point (a 2 km scale-model pixel) is 5.2 km from the sea, north-north-west,
      outside the 7.8 km planning square. A sea-trading village wants its landing in the square. Options: move Walapo's
      frame toward the coast (the frame is saved in the site file, so a moved frame stays put), or widen the square.
      Kautoa's coast is 1.8 km south-east of its point, inside the square. **The owner's call before P5.**
- [ ] **Some of Voth's words remain** in the tools' panels: "copy as Voth DISTRICTS entry" in a district's editor (it
      copies the polygon in Voth's format), and "Ferry stop", "Ferry line" and "Elephant bug" in a stop's or line's
      editor. The buttons and hints use the isles' words. Changing the editor's words means vendoring 55-site-tools.js.
- [ ] **Drawn causeways are stand-ins:** a plain deck or fill box per segment (`VOTH.span`, `VOTH.reclaimedCauseway` in
      10-isle-frame.js), not Voth's arches and piers. The Islanders' own jetties and causeways come from the kit in the
      city plan (P6).
- [ ] **The ground's detail textures are Voth's** (settlements/voth/tex: stone, ground, rock, sand), read in place as
      Voth's editor takes them. The isles' own library sets would suit better (a materials.json for this build).
- [ ] **No geyser relief here.** The planner's ground leaves out the geyser fields' relief (openworld/isle-demo's
      89-world-geysers.js needs the geyser kit). The nearest vent is 6 km from Kautoa and 28 km from Walapo, beyond the
      square, so neither town's ground differs.
- [ ] **The in-app browser pane can stall** loading this page while several world pages are open in other tabs (GPU).
      Close them first. Headless and alone it loads in under a second.
