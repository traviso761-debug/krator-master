# kits/beast-riders: known issues

- [ ] **The catalog's thirteen are lossy copies of Girder's and Mav's Refuge's buildings** (owner, 2026-10-18: compare
      the assembly hall: the catalog's has square pyramid tiers of pale thatch, Girder's own round conical tiers of dark
      thatch with green ribs, window bands and red trim). They were re-authored by hand when the catalog was harvested.
      The faithful port: Girder's and Mav's Refuge's builders (`settlements/girder/src/55-arch.js` and Mav's Refuge's) as
      per-building functions in a local frame, both towns proven unchanged, their engines sealed into this kit.
- [ ] **The catalog's thirteen buildings stay in the catalog** (`kits/catalog/krator-master-buildings-beast-rider.js`):
      Girder, Mav's Refuge and Voth read them there. Moving them into this kit means re-pointing those builds and
      rebuilding them; until then the kit reads them in place.
- [ ] **No interiors yet for the kit's own buildings**: the stables, byre and tower place their outdoor pieces
      (troughs, hay, tack, water butts) but have no planned rooms in `kits/interiors/sets/beast-rider.js`.
- [ ] **Software GL washes the colours out** on the catalog engine (its tone mapping on a pale ground); judge the look
      in the browser.
- [ ] **`wood.guano`'s drips are top-heavy** in the source image, so a tall surface shows a band of drips each tile
      (used on the deck and the short perch rails only).
- [ ] **The rider mounts themselves** (raptors, threehorns, quetzals...) are not placed in the stables: kits/fauna's
      mounts, a later pass.
