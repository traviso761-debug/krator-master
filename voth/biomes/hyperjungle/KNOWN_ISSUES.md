# Krator biome kit — the central hyperjungle: known issues

Read before changing anything here. `build.py` prints the open count.

## Open

- [ ] PUBLISH AFTER EVERY PASS. The claude.ai artifact is a separate copy of
      `dist/hyperjungle.html`; strip everything before `<title>` and the trailing
      `</body></html>` before publishing (00-head.html carries the page wrapper).
- [ ] `BIO.stand/standAt` was skewed (fbm is bell-shaped); the core now stretches
      the value through the bell, but 55-trees still carries its own `standSp`
      quantile split from before the fix. Reconcile: drop `standSp` and re-check
      the species mix (target ~30/25/30/15 ironbark/ghostwood/prism gum/baobab).
- [ ] The species bark textures are pre-coloured, so 55-trees normalises each
      texture's mean before tinting (`texMean`). Cleaner: paint the bark canvases
      greyscale-ish and tint from SPECIES.bark only. Until then, changing a bark
      canvas changes the rendered bole colour twice.
- [ ] Ghostwood limbs are slightly warmer than its near-white bole (the pale limb
      texture cannot be brightened past white).
- [ ] Faint horizontal seams where a bole's lathe sections change texture repeat
      (inherited from Girder).
- [ ] Saplings beyond 760 m from the origin have clumps on virtual arcs with no
      bough geometry; fine at that range, wrong if the LOD origin moves.
- [ ] The far impostor ring starts at heroR+30: a host preset that stands inside
      it sees blob crowns at close range. A host should keep cameras inside heroR
      or raise heroR (cost: ~20k tris per hero tree).
- [ ] The host's floor mesh is Lambert-lit with no shadow maps, so open floor
      between plants reads a shade too bright; the litter colour is painted dark
      to compensate. A world with shadows should lighten `MAT_GROUND`.
- [ ] `dress()` samples by triangle area: a structure with one huge roof plate
      and many small ledges puts most of its moss on the roof. Pass per-shell
      geometry lists (roof, floors, walls) with their own counts if that matters.
- [ ] No fauna yet (flyers, insects, herds are a second pass against this contract).
- [ ] Only the hyperjungle is built; the abyssal savannah, Yuni Valley, highlands
      and arctic biomes are to be written against the same core.

## Done

- [x] Leaf cards are Lambert with a two-sided light mix, an up-bent (or per-clump)
      normal and distance-boosted alpha — no white-out from below, no lace at range.
- [x] Colours are sRGB in / linear out at BIO.put and every bucket write.
- [x] Every biome fragment is grep-checked against the world kits' identifiers.
