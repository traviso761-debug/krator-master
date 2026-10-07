# kits/ash-nomads: known issues

`build.py` prints the open ones (`- [ ]`) after every build.

## Textures

- [ ] Owed by the owner (`core/materials/PROMPTS-nomads.md`): `cloth.tent.ash` (`ashCloth`), `patterns/ashnomad/fret-band`
      (`patFret`), `patterns/ashnomad/nazca-panel` (`patNazca`), `patterns/ashnomad/lining-ember` (`patEmber`),
      `patterns/ashnomad/medallion-sun` (`medAshSun`), `ground.ash`. Meanwhile the patterns are procedural geometry and vertex
      colour (readable but plainer than "ornate"), the lining is the star kilim, the ground `ground.burn` darkened (it reads pale).
      When `patFret` and `patNazca` arrive, `akBandRing` and `akBand` should draw them as sheets in place of the geometry
      (`KIT_HAS('patFret')`), and the chieftain's lobes and the assembly's drum can take `patNazca`.
- [ ] The parametric common tier's chitin pieces render matte (woodFam 'wood') beside the glossy bespoke chitin ('lacquer');
      the catalog file's ASHNOMAD_COMMON could take `woodFam: 'lacquer'`.

## Geometry

- [ ] The biome is a placeholder: there is no ash-plain biome kit yet (the fauna kit tags the runner to swbay and crater-drylands).
- [ ] The animals are posed, not rigged; the pack millipede's frames sit along its back by its length, not on its segments, so
      they do not follow the walk wave.
- [ ] The chieftain's lobes and the star tent's petals are separate spires standing through the ring roof: the seams between them
      are not sewn (no valley gutters).
- [ ] Shadows ignore the cut-away (the engine's, shared with the Scyvoi kit).
