# kits/desert-nomads: known issues

`build.py` prints the open ones (`- [ ]`) after every build.

## Textures

- [x] The sadu band and the muted lining came on 2026-10-07, each with a green alternate (the sheikh's tent and guest pavilion, the
      hookah tent); the floors are the sadu weave now (the star kilim was too bright).
- [x] `cloth.tent.brown` (family `hair`) came on 2026-10-07: the khaimas, square tents, smithy, supply tent and the sheikh's awning.
- [ ] The ground is `ground.gravelly_sand`, picked unseen for the kit sheet; a world places the biome's own ground.

## Geometry

- [ ] The animals are posed, not rigged (as in the Scyvoi kit): only what the fauna kit animates moves. The camel cart's camel
      stands in its shafts but nothing pulls.
- [ ] Shadows ignore the cut-away (the engine's, shared with the Scyvoi kit).
- [ ] The abyssal nomads share every tent with the desert ones; only their beasts and pens differ. If they want their own tents
      (reed or salvage, beside the Abyssal people), that is a further row.

## Voth census trades (2026-10-19)

The table is `src/60-dn-trades.js` (checked by `python3 tools/check_trades.py kits/desert-nomads -v` and the `voth-trades` assert in verify.py). Most census trades are `na` for a nomad camp; these have no building yet (owner scope: butcher, brewing, tannery, dairy and healer rows covered):

- [ ] butchers: a butcher's tent (slaughter post, hanging rack, drying line).
- [ ] weavers and dyers: a weaver's tent (sadu ground loom, spindles, dye pots).
- [ ] brewers: a brewing tent (fermented drink in skins and jars).
- [ ] innkeepers and grooms: a caravaneers' guest tent with a grooms' camel line (tent-pavilion is only a dwelling).
- [ ] soldiers: a war band's tent (arms racked, war-camel riders' quarters).
- [ ] healers and nurses: a healer's tent (bonesetter, herbalist, cots).
- [ ] dairymen (partial): a milking pen and cheese tent beside the zaribas.
