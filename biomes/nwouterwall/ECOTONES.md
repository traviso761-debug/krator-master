# nwouterwall: the ecotones with nsemiarid and nwlowlands (a proposal, 2026-10-26)

Nothing here is wired. It proposes which related species cross each border, which way, how far, and how. It is open for the
owner's decisions at the end.

## The two borders

| Border | Kind (`WORLD.md`, "Two kinds of border") | Where on the ground |
|---|---|---|
| nsemiarid (the walking steppe) to nwouterwall | **gradual**. nsemiarid's cold end is above 2.5 km: Dsb 37%, Dfb 9%. It climbs into the Wall foot (~3.2 km, Csa/BSk, +11 °C) and then the forest-steppe (4.2 km, Dsb/Dsc, +5 °C) | the dry east of the wall, toward the dam basins (BSk, ~100 mm) |
| nwlowlands to nwouterwall | **steep**: the Outer Wall's face. Below it is nwlowlands' Mediterranean foothills (to 350 m) and subtropical tract (Csa/Cfa, ~22 °C, ~970 mm). Above the crest is the Wall foot | the wetter west (up to ~400 mm on the wall) |

On the steep border, the face is rock with each kit's cliff flora on its own side, so little crosses it. On the gradual
border, both kits' species mix through a band a few hundred metres wide.

## Shared species: one species, not two

Three plants are already in two kits under different names, on the same card. Before any ecotone, each should be **one
species record** that both kits read. Otherwise the band would plant two look-alikes side by side.

| nwouterwall | Neighbour | Same plant | Card |
|---|---|---|---|
| silverthorn (*Hippophae*) | nsemiarid `buckthorn` | sea buckthorn | `card.seabuckthorn` |
| plumegrass (*Stipa pennata*) | nsemiarid drill grass (*Stipa*, BSk) | feather grass | `card.stipa` |
| larch beard (*Bryoria/Usnea*) | nwlowlands `beard` (hanging moss) | beard lichen (drier and greyer up high) | `card.beard` |

**Proposal:** nwouterwall keeps its names. Each neighbour's entry gains an `alias` (`'nwouterwall:silverthorn'`), so the
harvest, the inspector and Godot see one plant. The palettes stay per kit (the high country's is greyer and frostier).

## nsemiarid into nwouterwall (upslope, into the Wall foot and the lower forest-steppe)

These are the Tian Shan and Altai fruit-forest and steppe plants. They are the real neighbours of larch and stone pine.

| nsemiarid species | Real plant | Where it goes in nwouterwall | How far |
|---|---|---|---|
| wild apple | *Malus sieversii*, Dsb | the Wall foot's sunny gullies and the forest-steppe's lowest swells, in groves | to ~4.0 km, thinning out |
| wild apricot | *Prunus armeniaca*, Dsb | sunny rocky slopes of the Wall foot | to ~3.6 km |
| wild walnut | *Juglans regia* | stream terraces in the Wall foot only | to ~3.4 km |
| foxtail spire | *Eremurus*, Dsb | the forest-steppe's sunny wall, among the plumegrass (a June spike: spring and summer) | to ~4.4 km |
| wormwood | *Artemisia* | the steppe's driest swells and the gravel terrace (grey-green, aromatic) | to ~4.6 km |
| tulip | wild tulips, Tian Shan | spring only, on the sunny steppe | to ~4.4 km |
| golden poplar | *Populus*, riparian | the valley streams up to the aufeis (a laurel poplar's niche) | to ~4.0 km |
| kite ash | maple and ash, Dfb | the shaded gullies of the Wall foot | to ~3.6 km |

## nwouterwall into nsemiarid (downslope, into its cold uplands above 2.5 km)

| nwouterwall species | Where it goes in nsemiarid | How far down |
|---|---|---|
| fur larch | the shaded slopes of nsemiarid's Dfb ground (open stands, short) | to ~2.8 km |
| stone pine | with the larch, scattered | to ~3.0 km |
| furflower (*Pulsatilla*) | the upland steppe, spring | to ~2.6 km |
| Ivan-chai (fireweed) | burns and disturbed ground in the uplands | to ~2.5 km |
| goldroot (*Rhodiola*) | rock cracks on the upland cliffs (wild, not a crop) | to ~2.8 km |
| sweetroot (*Hedysarum*) | wild, on the upland gravels (the crop's wild parent) | to ~3.0 km |

## nwlowlands up the Wall (the steep border)

Only cliff and montane plants cross, and only at the face's top and foot. Each kit keeps its own side.

| Species | Real plant | Direction | Where |
|---|---|---|---|
| crag pine | montane pine, `card.pine` | up | the face's ledges, to the Wall foot's lip: the pine below the stone pine |
| candle birch | *Betula* (`bark.birch`) | up | the Wall foot's damp west gullies. Above them the snow birch takes over (one genus, from tree to shrub up the slope) |
| glow-willow and woolly willow | *Salix* | both ways | a willow ladder along the streams: glow-willow below the face, woolly willow above. Neither crosses the face itself |
| rhododendron | *Rhododendron aureum* (Siberian highlands) | up | the larch wood's damp shaded floor on the west side, as a low yellow-flowered shrub. It needs nwlowlands' rhododendron re-dressed as a dwarf form |
| tussock grass | `card.grass.dry` (already shared) | up | the Wall foot's grassland |
| goldroot | *Rhodiola* | down | the face's upper ledges (it is a cliff plant) |
| beard lichen | shared (above) | both ways | on the crag pine below and the larch above |

The subtropical and rainforest plants (meranti, mist palm, tree fern, the bamboos, kauri, eucalypts, banksia, grass tree)
stay below the face, as does all of nsemiarid's alien flora. In this direction nwouterwall sends nothing beyond its cliff
plants: its taiga and tundra have no niche in a Csa/Cfa lowland.

## How it would be built

1. **The shared records.** Add the alias entries above. Then a band never plants two look-alikes.
2. **The open world.** `openworld/isle-demo/src/world/41-world-fields.js` already blends kits with `WORLD.kitW` (overlays
   blended over ~3 km and warped by noise), and `85-world-flora.js` multiplies each kit's passes by it. The crossings above
   become **climate envelopes** on each species record: an elevation band plus the Köppen tags most `PK` records already
   carry. A species then plants wherever its envelope holds, in whichever kit owns the ground, so the crossing follows the
   climate rather than a kit's name. This is the long-term form, and Godot reads the same records.
3. **A station** (now, on the page). A fourth nwouterwall station, "the Wall foot" (~3.2-3.6 km, the dry east above
   nsemiarid). It reads the nsemiarid kit in place under a mask, the way Korona's shore band reads nwlowlands
   (`korona/src/88-host-build.js`). It plants apple groves, apricot, wormwood and poplar on the low side of a noise-warped
   line, and nwouterwall's steppe, larch and stone pine on the high side, with the band between them. The western,
   steep-border version waits for a wall-face station.

## For the owner

- Confirm the three shared species (silverthorn = buckthorn, plumegrass = drill grass, beard = hanging moss) as one record
  each.
- Confirm the crossing lists, especially the wild apple and apricot groves in the Wall foot and the larch reaching down to
  ~2.8 km in nsemiarid.
- Choose whether to build a fourth station (the Wall foot ecotone) now, or leave the crossings to the open world's
  envelopes.
- The dwarf rhododendron needs a card (`card.rhododendron.dwarf`, *R. aureum*, yellow). If yes, it goes in
  `core/materials/PROMPTS-NEEDED.md` section 8.
