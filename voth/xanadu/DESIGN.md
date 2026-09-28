# Xanadu — design doc

The **Xanadu** building kit builds the Sultanate of Xanadu: a remote, wealthy, hilly southern valley. One culture,
one vocabulary, in three wealth tiers and a civic/sacred register.

## The vocabulary (what makes it read as Xanadu from across the valley)

* **Tibetan massing.** Walls lean in (`xnWall`, four batters picked from the block's proportions; `xnStack`
  carries the batter through the storeys with a dark reveal line at each floor). Rammed earth (`XPAL.earth`) for
  the poor and the farms; whitewash (`XPAL.wash`) for the middle, the rich and the civic; ochre wash and the
  red-earth upper sanctum on the sacred. **Flat roofs** with a parapet (`xnFlatRoof`), mud on top, fodder stacked
  on the parapet of a farmhouse; the maroon **twig band** (`xnBand`) under the roof of anything rich or sacred,
  with gold roundels. **Black trapezoid windows** (`xnTibWin`): a surround wider at the sill, a painted frame, a
  timber lintel on little stepped corbels, a pleated valance. **Corbel eaves** (`xnEave`, `xnCorbels`) and
  painted columns with the bow-shaped bracket capital (`xnCol`, `xnPortico`). **Gilded roofs** (`xnGiltRoof`): a
  gold hip roof with flared corner horns on a painted timber frame, bells along the ridge — on temples, palaces,
  the Goldsmiths and the rich. Pennant lines, shrines (`xnShrine`) and the row of turning drums (`xnXDDrums`) at
  a temple's foot.
* **Indian bays.** The jharokha (`xnJharokha`): a stone oriel on curved brackets, jali screens on three faces, a
  sloping chhajja eave and a bulb dome (tile or gold). Chhatri kiosks (`xnChhatri`) in gardens and on walls.
* **Turkish overhangs and ornament.** The cumba (`xnCumba`): an upper storey oversailing the street on raked
  timber struts, a close row of painted windows, a cloth valance. Painted frames in blue, red, turquoise, saffron
  (`XPAL.trim`), tiled copings on garden walls.
* **Persian arches, tiles, domes, water.** Pointed four-centred arches (`xnArch`, `xnArcade`), iwan portals in a
  rectangular frame with mosaic (`xnIwan`), two colour-carrying mosaics (`xMosA` star-and-cross, `xMosB`
  arabesque) and a gold-on-maroon frieze band (`xFriezeB`); bulbous domes on drums (`xnDome`: tiles, gold, white,
  mosaic); baths under domes with gold oculus bosses; the chahar bagh (`xnCharBagh`), rills (`xnChannel`), pools,
  fountains, cypresses.
* **Gold.** `MAT.xGold` tinted from `XPAL.gold`: roofs, domes, finials, roundels (`xnRoundel`, the sun-and-moon),
  bands, the emblems over the guild doors. Poor buildings carry none.
* **The Iziz note** stays in industry: the scrap smithy and the generator wear corrugate and rust.

## The slope rule (project brief: buildings must read well on an incline)

Every def placed with `o.drop = D` grows a battered rubble **footing** from `y = -D` to `y = 0` under its plot
(`xnFooting`, wrapped into every builder by `XA.def`; the footprint is the def's `fw × fd`, default 92% of
`w × d`). A house set on a hillside with its base at the uphill grade therefore shows a closed, leaning stone base
on the downhill side. The **Hillside quarter** (`82-xa-hill.js`) proves it: terraces, and kit houses stood astride
each terrace edge through `xnSub(key, x, y, z, ry, {drop})`. Several defs are themselves hillside pieces: the
hillside manor (a lower hall and a raised block on a terrace), the terraced fields, the monastery on its terrace,
the amphitheatre cut into a slope, the fortress on its rock, the Grand Temple on its podium.

## Lighting rule (canon, as in the other kits)

Electric light only on **rich and civic** defs (`lit:true`); `xLit()` = `vLit()` inside a builder; `vnDoor`,
`vnLamp`, `vnLampPost` emit bulbs only when true; window kind `'lit'` only under it. Forge and kiln fire
(`vEmber`) is not electric.

## Tags (project rule)

Every def: `culture:'xanadu'`, `kit:'xanadu'` (added by `XA.def`), `type` (one or more of the project's types),
`wealth` (`poor|middle|rich|civic`), `lit`. Every placed instance registers inspector volume(s) through `vnReg`.

## The building list and who owns it (round 1)

| package | file | seeds | buildings |
|---|---|---|---|
| **X-A** dwellings | `74-xa-dwell.js` | 30100–30399 | poor: earth farmhouse block, hill tenement row, timber shack · middle: town house, courtyard house, tenement · rich: manor, hillside manor, merchant's konak |
| **X-B** trade | `75-xa-trade.js` | 30400–30599 | bazaar row (shops), workshop (dyer and potter), scrap smithy |
| **X-C** farms | `76-xa-farm.js` | 30600–30799 | terraced fields, farmstead, granary, windmill (the Persian asbad), watermill |
| **X-D** sacred | `77-xa-sacred.js` | 30800–30999 | temple, monastery, Grand Temple of the capital |
| **X-E** the Sultan | `78-xa-palace.js` | 31000–31199 | Sultan's Palace, Pleasure Dome with its grounds (baths, gardens, fountains) |
| **X-F** guilds | `79-xa-guild.js` | 31200–31399 | Farmers, Miners, Goldsmiths, Alchemists, Masons; the generator |
| **X-G** military | `80-xa-military.js` | 31400–31599 | barracks, city wall, gate, fortress (dzong), city watch, mustering ground |
| **X-H** public | `81-xa-public.js` | 31600–31799 | arena, amphitheatre, public baths, public garden |
| **X-I** hillside | `82-xa-hill.js` | 31800–31899 | the hillside quarter (the slope-siting proof) |
