# kits/scyvoi: known issues

`build.py` prints the open ones (`- [ ]`) after every build.

## Textures

- [x] The owner's twenty further sheets (2026-10-05) are processed (`tools/textures/batches/scyvoi.json`) and in use: the six
      that first came inline (rosettes, flame zellige, fire-bloom, the two kilims), five tile sheets, the celestial giant, and six
      single-panel medallions (the salamander on the chief's dais, blades in the appliqué tent, the moon in the shaman's hut,
      cloud in the great ger, star in the bell tent, sun in the pavilion). `tile-lattice-*`, `tile-lotus-cross`,
      `zellige-lotus-teal` are in the library for other builds; the kit does not use them yet.
- [ ] The page is 11.2 MB, most of it the inlined texture pack (37 families). If it needs to be lighter, drop `size` to 256
      on the small-use families in `materials.json` and repack.
- [x] The goat-hair cloth (`library/cloth.tent.black`) and the indigo appliqué (`patterns/scyvoi/applique-blue`, `.b`) came
      2026-10-05: the black tents and the appliqué tent's panels (alternating the two sheets) use them.

## Geometry

- [x] Cushions read as boxes (2026-10-05): the catalog core gained `F.pillow` and `F.bolster`; the Scyvoi cushions, toshaks,
      bolsters and bedding are rebuilt with them, and the furniture takes library detail maps (materials.json `f_*`, projected
      triplanar in 91f-furnish.js). Furniture is now about 560k triangles on the sheet (it was 300k): the soft pieces and the
      tassels. A world that places many tents should lower `KratorFurniture.setDetail`.
- [x] The chief's celestial lining swirled: lathe UVs were arc length per ring, which shears on a cone. Roofs are now unrolled
      (30-geo.js `lathe`, one radial seam). The well's apron z-fought the court paving: lifted 4 cm.

- [ ] The Baelu's cell doors and windows are dark panels, not openings; its cells have no interiors yet (the kits/interiors
      planner could take a Baelu set: stables, stores, cells, the gatehouse).
- [ ] Shadows ignore the cut-away (the cut tents stop casting while it is on, so the interiors are lit by the sky).
- [ ] The salamanders are posed, not rigged: only the tail and the head move. A world that walks them needs a skeleton
      (kits/mechs has the pattern: skinned walkers with leg IK).
- [ ] The kit sheet stands on flat ground; the crater drylands' flora (biomes/crater-drylands, not yet on main) is not placed.

## Shared code touched

- [x] core/tags' vocabulary took the Scyvoi culture (`52-core-tags-vocab.js`, `test-tags.js`: 19 cultures, export digest
      2670333f). Every build that bundles core/tags embeds the vocabulary: their pages differ by that text until rebuilt.
