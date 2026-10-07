# kits/ash-nomads: known issues

`build.py` prints the open ones (`- [ ]`) after every build.

## Textures

- [x] The owner's sheets came on 2026-10-07 (`tools/textures/batches/nomads-2026-10.json`): the ash cloth, the fret band, the
      Nazca panel, the ember lining, the crawlers lining (millipedes, lizards, mushrooms), the sun medallion and the ash ground. The
      bands round the walls are the fret sheet now (`akSheetRing`, `akSheetStrip`: its 2:1 aspect kept, one sheet top to bottom);
      the geometry figures remain the fallback for a pack without it. The assembly's drum and the chieftain's wall carry the Nazca
      panel, the chieftain's lining and the shaman's floor the crawlers, the chieftain's dais the sun.
- [x] The emblem is a gas giant (the owner, 2026-10-07), not the sun: the owner's `patterns/ashnomad/medallion-giant` (`medAshGiant`)
      on the assembly's frame and every banner (`akGiant` draws it as geometry for a pack without it). Its slate blue and cream
      run through the camp as trim: piping round the fret bands, a line in the roofs, a cord at the eaves, the banners' borders, a
      ring in each finial (`AK_B`).
- [ ] Outside, blue leads and red trims (the owner, 2026-10-07): `AK_P` (#3e5c9a) and `AK_T` in `40a-ak-ash.js`, `blue` in the
      palette. The fret band and the Nazca panel outside are INTERIM hue-shifted recolours of the red sheets
      (`patterns/ashnomad/fret-band.blue`, `nazca-panel.blue`) until the owner's blue sheets come (`core/materials/PROMPTS-nomads.md`).
      The catalog's outdoor pieces (ash screens, paper lanterns, the lantern pole, the war standard, the spirit pole) are still
      red and yellow; blue variants of them would be a catalog change.
- [ ] The parametric common tier's chitin pieces render matte (woodFam 'wood') beside the glossy bespoke chitin ('lacquer');
      the catalog file's ASHNOMAD_COMMON could take `woodFam: 'lacquer'`.

## Geometry

- [ ] The biome is a placeholder: there is no ash-plain biome kit yet (the fauna kit tags the runner to swbay and crater-drylands).
- [ ] The animals are posed, not rigged; the pack millipede's frames sit along its back by its length, not on its segments, so
      they do not follow the walk wave.
- [ ] The chieftain's lobes and the star tent's petals are separate spires standing through the ring roof: the seams between them
      are not sewn (no valley gutters).
- [ ] Shadows ignore the cut-away (the engine's, shared with the Scyvoi kit).
