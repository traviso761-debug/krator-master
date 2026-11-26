# biomes/farside: notes

Farside, the crater's one ocean shore in the north-west, where the sea's plants have come ashore (`PLAN.md`; the owner's
idea, 2026-10-23). Built 2026-10-26 to the plan's sections 1 to 9 on the branch `claude/farside-biome-71703c`.

## The four stations

| Page | Station | Scale model | What is on it |
|---|---|---|---|
| `dist/farside.html` | 1, Farport's kelp coast (rebuilt on map 5.1, 2026-11-04: the tsunami) | 5.1 px 294,588 (Farport's plateau, 212 m; the city is a settlement build: its site held clear and registered) | the sea on core/water with a shore grid and a tint field, Līng-Mā's silt as a plume out of the harbour mouth; the harbour in the drowned estuary (a still arm: quays, jetties, the dockyard's slip, the factory quarter's site); the tsunami's scour bench (salt-bleached bedrock, chevron ridges and backwash chutes, a perched saline lagoon), the bluff and the plateau; the run-up line (100 m) and the bench's top (65 m) drawn on the ground, five tsunami stones on the line, younger kelp under it; the spray coral terraces either side of the mouth; kelp kilns, lime kilns, wrack, terraces and a fold |
| `dist/farside-strand.html` | 3, the strand | 5.1 px 293,573 (re-sited 2026-11-04; was 4.23 px 30,240) | a long strand under the full spray: eelgrass dunes lying flat inland, windrows of dead leaf, coral reefs standing out of the sand above the waterline, the point's surf rocks, wrack heaped on the beach; the kelp beginning behind the dunes; kilns, heaps, a cart, racks, a fold |
| `dist/farside-front.html` | 2, the front | px ~45,200 | the front compressed into 3 km: the last kelp stands in the west, the dead belt (drowned kauri and meranti, silvered, hung with wine weed and wrack; kelp seedlings; burned strips; goat-cropped ground), the native forest (`biomes/nwlowlands`, read in place) in the east with the first wine weed on it; a stream down through it on core/water |
| `dist/farside-cloud.html` | 4, the fog belt | px 74,88 (Yith) | Yith's ridge in the fog that hardly lifts (the page opens in the weather's `fog` mode): the native wet forest, its trunks crusted with fog sponges, wine weed hung in its crowns; fog sponge towers on the rock; a valley stream; Yith's walled terraces, a fold, a rack (the village is a settlement build) |

## How it is made

- **The ground** is each station's closed function of the survey's numbers (PLAN.md section 1: a steep coast, ~420 m at
  10 km, ~2.4 km at 50 km), in coast coordinates (u inland down the north-west wind, v along the coast). Every field the
  kits read is a function too (`STAGE.fields`). The far country carries the coast on and lifts the land to the outer wall's
  foothills on the horizon.
- **The kit** (`FARSIDE`) draws the nine species and the dead (`55`, `60`, `65`); the land's own forest is the north-western
  lowlands' kit read in place in its own registry under the host's mask (`88-host-build.js`), then dressed by FARSIDE with
  the sea's outriders.
- **The blades stream inland**: every kelp blade hangs from its bladder or the stipe's top along the wind's direction,
  lying flatter the stronger the spray (a host check proves 85 % or more lean down the wind, and fails on the reversed wind).
- **The sky** is the shared sky (`ATMOS.sky`) at each station's pixel, with the weather (`ATMOS.bindWeather`) fed into its
  colour script so the fog's thickening survives the sky setting the fog each frame.
- **The works** are host geometry tagged as Eternian furniture (the owner, 2026-10-26), to move into `kits/eternian`
  (its `KNOWN_ISSUES.md`).

## Crops and resources (PLAN.md section 7)

`kits/crops`: a `farside` biome (strand, kelpcoast, front, cloud, lee) and six rows: `kelp` (the staple greens, dried as
kombu), `wineweed` (nori and agar; its crimson a red dye, proposed so the biome has a dye), `sea-lettuce`, `kelp-ash`
(potash and soda: the third source of the alkali salts beside the Catch), `coral-lime`, `eelgrass` (thatch).
`kits/resources`: no node (the alkali and the lime come from the flora: a note in its `KNOWN_ISSUES.md`).

## The State's view (the owner, 2026-10-26)

A managed harvest: the Eternal State taxes the kelp ash, the lime and the goat meat and keeps the front where it is. The
traders' invasion is a resource, not a blight.
