# Locus — building kit (Sep 2026; second pass adds power, fuel and the town pieces)

Locus is the Geomancers' oil town on a river delta at the edge of an abyssal salt lake (see the brief in the
project memory). This pass is ONLY the new building kit, built as a separate sheet so it can be judged before
the city is laid out. It is built on a fork of the Yuni source tree (`locus/` = the Yuni tree + `64-locus-*.js`,
`76-locus-anim.js` and a handful of small patches), because Locus is "mostly Yuni" and the city pass will need
every Yuni asset anyway.

## What is on the sheet (target `locus`, file `locus-kit.html`)

| group | key | name | w x d x h | variants | culture · types |
|---|---|---|---|---|---|
| Abyssal-desert dwellings | `stilt_poor` | Marsh stilt house | 11 x 10 x 8 | 3 (reed/thatch · washed mud/canvas gable · two rooms/flat roof + sail) | abyssal-desert · single-family dwelling |
| | `stilt_mid` | Pastel stilt house | 16 x 16 x 12 | 3 (wind-catcher + loggia · two storeys under a sail · L-plan with verandah) | abyssal-desert · single-family dwelling |
| Abyssal-desert canvas | `tent_pavilion` | Great pavilion tent | 18 x 14 x 7 | 3 (striped ridge · rolled walls · round bell tent) | abyssal-desert · prop + tavern/inn |
| | `sunshade_poles` | Four-pole sun shade | 9 x 9 x 4.5 | 3 (square · twin sails · striped with bench) | abyssal-desert · prop |
| Salt-rice farm | `farm_saltrice` | Salt-rice farm | 48 x 38 x 9 | 2 (mirrored plans) | abyssal-desert · farm + dwelling |
| Petroleum | `ind_pumpjack` | Pumpjack (ANIMATED) | 8 x 15 x 8 | 2 (rusted · tarnished white-metal gear) | geomancer · industry + infrastructure |
| | `ind_oil_tank` | Oil storage tank | 24 x 27 x 13 | 3 (riveted cone roof · squat floating roof + spiral stair · banco-clad in the Yuni manner) | geomancer · industry + infrastructure |
| | `prop_pipe_rack` | Pipe rack segment | 12 x 3 x 3.4 | 2 | geomancer · infrastructure + prop |
| | `ind_refinery` | Geomancers' still-house (refinery) | 66 x 50 x 27 | 1 | geomancer · industry + civic |
| | `prop_drum_stack` | Drum stack | 5 x 4 | 3 | geomancer · industry + prop |
| Power and fuel | `ind_generator_house` | Geomancers' generator house (ANIMATED flywheel) | 32 x 22 x 18 | 1 | geomancer · industry + infrastructure |
| | `trade_fuel_station` | Fuel station | 24 x 18 x 9 | 1 | geomancer · market/shop + infrastructure |
| Chapterhouse | `civic_geomancer_chapterhouse` | Geomancers' Chapterhouse | 48 x 42 x 27 | 1 | geomancer · civic + religious |
| Town | `locus_warehouse` | Salt-and-oil warehouse | 42 x 22 x 12 | 1 | yuni · industry + market/shop |
| | `infra_fishing_dock` | Fishing dock | 12 x 34 x 5 | 2 (straight · T-head) | abyssal-desert · infrastructure |

Plants (registered PLANTs, tagged hypertropic · humid · wet · abyssal · riparian): `salt_rice_stand` (2: green / ripe),
`salt_reed` (2: green / silvered), `marsh_palmetto` (2: single / clumped). The farm places 120 rice stands and its
reeds through `buildPlant`; the Chapterhouse forecourt places palmettos the same way. Nothing draws a plant itself.

## The style, as built

**Abyssal-desert.** Houses on piles (bark-textured, grey-brown) with plank decks, rails and a straight stair to the
front; walls are reed mat (thatch texture tinted pale) on the poor house, pastel lime-wash on everything else with a
`pastelDeep` plinth band and cornice; openings are Yuni's parabola (loggia arcades on the middle-class house), upper
windows are timber lattice screens; roofs are flat terraces under CANVAS — a sagging sail on four poles is the
signature of the middle-class house, a porch canopy on two poles the signature of the poor one; one variant carries
a Persian wind-catcher. Tents are striped canvas on a ridge pole with rolled or hung side walls and a polychrome rug
inside. Palette: `PAL.pastel` (rose, apricot, mint, sky, lilac, sand, chalk, seafoam, blush, celadon-straw) and
`PAL.canvas` / `PAL.canvasDye`. New material family `canvas` (taut, no wind sway; `cloth` still sways for hung walls
and washing).

**Petroleum.** Mud-brown Yuni banco (`PAL.mudBrown`) for every building — battered fr8 blocks with pilaster-pinnacles,
toron rows and triangular vents — carrying rusted Ancient steel (`rust` family: plated, riveted, streaked): lathe
columns with walkways and caged ladders, a horizontal separator on saddles, a fired heater under a tall stack, a
guyed flare with a glow flame and a night lamp, riveted tanks in mud bunds, drums everywhere. The control shed and
the pumpjack's motor are tarnished Ancient white metal with a blue battery glow; the refinery has two ELECTRIC
(cool) lamps because the Geomancers have batteries. Oil stains (`PAL.oil`) on the ground.

**The pumpjack** is the kit's one moving asset. Static parts (plinth, skid, Samson post, gearbox, motor, wellhead,
flowline) go through the ordinary kit; the walking beam, horsehead + nose, equalizer, two pitman arms, two crank
arms, two counterweight drums, bridle, carrier bar and polished rod are registered by `LOCUS.anim(F,'pumpjack',…)`
and given bodies by `76-locus-anim.js` — three InstancedMeshes shared by every pumpjack in the world, matrices
rewritten per frame. The beam angle is solved each frame as the circle-circle intersection of the tail arc
(radius Lt about the pivot) and the pitman (length Lp from the crank pin), so the motion is a real four-bar
linkage, not a sine wave. Speed 0.42–0.62 rad/s per instance (4–6 strokes a minute), random phase.

**Power and fuel (second pass).** Both in the Yuni white-and-blue manner of the caravanserai rather than the refinery's
mud-brown: whitewash (`plaster`), blue mosaic bands, parabolic arches with nested archbands, toron, cone pinnacles,
brass finials, blue-glass. The GENERATOR HOUSE is an engine hall with one great parabolic arch in its front showing a
salvaged Ancient white-metal engine (six cylinder heads, gear case) on a concrete bed; two rusted exhaust stacks with
mosaic collars and guys; three ventilator domes on slotted drums; a radiator bank of steel fins between header pipes
on the west side; a day-tank on piers behind; an open parabolic arcade on the east over the FLYWHEEL (static rim and
hub; six spokes and a crank pin turn — `LOCUS.anim(F,'flywheel',…)`, kind added to `76-locus-anim.js`) and a dynamo
with brass bands; a slate switchboard with dials and knife switches; an insulator gantry and the first pole of the
town line. Its own lamps and windows are ELECTRIC (cool). The FUEL STATION is a whitewashed slab carried on two
parabolic arch frames over a pump island with three Ancient hand-cranked pumps (white metal, mosaic band, dials, a
blue-glass globe with a small lamp, crank, hose on a hook); an attendant's kiosk under a blue mosaic dome with a
counter window and propped shutter, a bench and a price board; buried-tank fill caps and two vent pipes; a timber
cradle of lamp-oil drums with brass taps and terracotta jars; a pole sign (brown disc, brass rim, brass flame).

**The Chapterhouse.** Yuni civic forms in earth: raw-umber drum (a SECTOR ring wall with a real door gap, pilaster-
buttresses, two toron rings), burnt-sienna dome with three toron rings and two ochre relief bands, an ochre lantern
over the oculus. INSIDE it is cavernous: fourteen corbelled rings (`SECTOR` with bottom + inner faces), each stepping
inward past the one below — the outer skin is lathed 0.5 m outside the rings so nothing pokes through — a polychrome
frieze on the lowest ring, an electric oculus glow, eight electric light strips on the drum, a mosaic medallion and
a rock relief-map table at the centre. Entered through a 4.6 m deep parabolic porch with three nested archivolts
(relief · warm mosaic · relief) between two blunt towers; assay wings either side with parabolic windows and a link
passage; a tapering survey minaret behind with a brass sighting instrument; a forecourt walled all round
(the enclosure wall with pilasters and corner pinnacles continues along both sides and the back; the fountain that
blocked the door was removed, second pass), palmettos, the core rack (seven drill cores hung in a frame) and the
brass gnomon.

## Framework changes (all backward compatible for Yuni)

- `10-core.js`: `KIT` — `TARGET==='locus'` names a sub-kit sheet; `CITY_EXT` 520 on a kit sheet.
- `53-assets.js`: `ASSET` takes `kit`, `group`, `culture`, `types` (validated against `BUILDING_TYPES`), `tags`;
  the inspector label reads `building · culture: … · type: … · w x d · key`. `PLANT` takes `tags:{wet,abyssal,riparian}`
  and the label reads `flora · climate · aridity · wet · abyssal · riparian`. Furniture reads `furniture · culture: …`.
- `70-sheet.js`: on a kit target, rows are the kit's `group`s in fragment order; plain `sheet` skips kit assets.
- `05-palette.js`: the LOCUS block (pastels, canvas, reed, pile, mudBrown, umber, sienna, steelDark, pipe, oil,
  saltWater, saltCrust, saltReed, paddy, geoBrown, flare) + the `canvas` family. `47-texture.js`: the canvas weave.
- `build.py`: target `locus` → `locus-kit.html` and `publish/locus-building-kit.html`; `76-locus-anim.js` is deterministic.
- `kitshots.py`: `python3 kitshots.py OUT --dump` then `python3 kitshots.py OUT key[:variant][:f|b|p|c|n] …` — front,
  back, plan, close eye-level, night shots of any sheet item, named by key.

## Verification

`python3 verify.py locus-kit.html --assert`: error panel clean; 23 named items, names unique; 76 draw calls /
198 k triangles / 7.2 k instances on the sheet. `_locusAnim.sample()` advances between two evals (the crank turns).
Inspector on the sheet returns the culture + type tags. Looked at: every dwelling and tent variant front and plan,
the farm both variants, the pumpjack at eye level (both), all three tanks, the refinery front and back, the
Chapterhouse front, back, through the gate, and from inside the dome, and the three at night.

## The world

Everything on this sheet is placed in the Locus world (`locus.html`); see LOCUS-NOTES.md. The generator house stands
north of the still-house facing the ring road, the fuel station in the south-east of the refinery yard facing out;
each has a short street from the ring to its front, and the life layer sends Geomancers to the generator and carts
to the fuel station.
