# The Iziz cluster: known issues

- [ ] **Links cross rivers as causeways.** Mav's Refuge to Girder (137 km) and Girder to Talia (154 km) are laid; the
      world rides a road 2 m over a river's water (core/world 42) and the river check passes (64 stations, all with
      water), but there is no bridge piece. Region 2's links stay unlaid for a deeper fill (its `KNOWN_ISSUES.md`).
- [ ] **No shrine in the villages.** The Vernacular has none: `vern_shrine` is a pending key (a pale stand-in box).
- [ ] **The villages have no names.** `core/hamlet`'s name lists hold the Islanders' only (`16-hamlet-names.js`); an
      Izani list (as `tools/names/sikau.py` writes the Islanders') would name them.
- [ ] **Talia's villages are built in the Vernacular, not Talia's own kit.** The Talei keep their architecture in the
      city (`kits/talia`); whether the farms follow it is the owner's call, and the kit has no bundle for a world page yet.
- [ ] **A village draws in about 370 meshes.** The Vernacular's pieces come through the shared instancer with a material
      per piece, so the merge by material (`88s` `vmerge`) groups little. The performance pass should share them.
- [ ] **The savannah reads `upland` its own way** (`fields:{upland:'abyssUp'}`). Pinnacle's savannah reads the world's
      upland; the two regions' rims will look different until the kit's world fragment settles which it reads.
- [ ] **One kit on several overlays is a shim** (`src/47-world-kits.js` replaces `WORLD_KITS.findIndex`) until
      `core/world/41-world-fields.js` takes a list (`TODO.md`, "Ride along with the next all-builds rebuild").
- [ ] **The hyperjungle's giants are heavy** (as at Pinnacle: its `KNOWN_ISSUES.md`; the pinnacle-perf session).
- [ ] **The savannah kit's world adapter lives here** (`src/49-world-absav.js`, a copy of Pinnacle's), not in the kit.
- [ ] **The tents and the Vernacular come through `settlements/isle-demo/bundles.py`** (`cat_bundle`, `izv_bundle`) and
      its piece instancer (`58-isle-protos.js`): lateral dependencies, allow-listed. The kits should own their bundles.
- [ ] **No floor patches** for the savannah kits (`floor: null`).
