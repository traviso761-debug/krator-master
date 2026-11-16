# Erewhon's citadel: the style of the palaces (owner, 2026-11-09)

The owner's brief: everything in the citadel but the two Pleasure Domes **takes after Moorish and Mughal influences and
should also be psychedelic in its own way**. The domes keep their black-and-white style
(`../pleasure-dome/STYLE.md`). These references lift the hold on the rest of the citadel: the Sultan's palace, the
Grand Vizier's palace, the officers' houses, the envoys' house, the court temple, the gates and courts. The room plans
are the blueprint's (`../../BLUEPRINT.md`); this file sets how they are dressed.

## The references

| File | What it gives |
|---|---|
| `01-mughal-gilt-ceiling.jpg` | Akbar's tomb: a star-and-polygon ceiling, its panels painted gold on lapis, white-ground floral, terracotta borders; ribs in raised red-brown frames |
| `02-peacock-room-vaults.jpg` | the Peacock Room (Sammezzano): a vaulted hall whose every rib, fan and cell is painted in tight rainbow bands, black and gold dot rows, arches receding to a lit door |
| `03-moroccan-court-stucco-zellige.jpg` | a Moroccan court: a pointed horseshoe arch in carved ochre stucco (yeseria), slender paired marble columns, a fountain basin, a zellige channel down the axis, star-pattern tile floors, green tile roofs beyond |
| `04-turquoise-muqarnas-portal.jpg` | a Timurid-Persian portal (iwan): a muqarnas half-dome in turquoise and cobalt tile cells, a pierced star window, framed by tile panels and borders in turquoise, violet and orange |
| `05-isfahan-tiled-arcade.jpg` | an Isfahan arcade: pointed arches in a long run, the vaults and spandrels covered edge to edge in cobalt haft-rangi tile with yellow and white arabesques, a yellow stone dado |

## The rules

1. **Every surface carries pattern, and the pattern is dense.** Psychedelic here means saturation and intricacy, not
   black and white: cobalt and turquoise tile, gold on lapis, rainbow banding, ochre stucco, red sandstone with white
   marble lines. The eye should find no plain wall above the dado.
2. **Mughal for the state, Moorish for the courts.** The Sultan's palace and the Divan: red sandstone and white marble,
   pietra dura, jali screens, chhatris and cusped arches, painted and gilded ceilings (`01`). The courts, the harem's
   approaches, the temple and the houses: horseshoe and pointed arches, yeseria stucco, zellige, paired columns,
   fountains and rills on the axis (`03`). The great portals: iwans with muqarnas half-domes (`04`). The long passages
   and arcades: tiled vaults (`05`). The private halls: painted banded vaults (`02`).
3. **Geometry carries the ornament.** Muqarnas, star-polygon ceilings, cusped and horseshoe arches, ribs and fans are
   modelled; the textures fill their faces. Repeats line up on the axes, as in the domes.
4. **Water and light.** Rills, basins and fountains on the axes of the courts; pierced screens and star windows casting
   patterned light; lamps in niches.
5. **Tie to the domes.** Where a palace meets a Pleasure Dome (the Golden Way), the palette narrows to black, white and
   gold over a few bays.

## Textures

Owed in `core/materials/PROMPTS-NEEDED.md` section 41 (asked of the owner 2026-11-09): zellige, haft-rangi tile,
the Mughal gilt ceiling, yeseria stucco, muqarnas tile, the rainbow band, pietra dura, the jali card, the op-art
wallcovering, black and Calacatta marble. Reuse `metal.gold`, `rock.sandstone.red`, `plaster.white_stucco_02`. Until a set
is delivered, wire the material key to the nearest library set and say so in KNOWN_ISSUES.md; do not paint a procedural
stand-in silently.
