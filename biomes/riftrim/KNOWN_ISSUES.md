# biomes/riftrim: known issues

Open items, each with what is owed. The kit was built in one cloud session (2026-11-03, branch `claude/riftrim-cloud`) with no GPU:
`verify.py --assert` ran in software GL (SwiftShader) on every station; the GPU `--assert --all-views` and the owner's look pass are the
coordinator's (`HANDOFF-REBUILD.md`, the riftrim paragraph).

## Verified (2026-11-04, the cloud session: SwiftShader, no GPU)

`python3 verify.py <page> --assert --views "<one view>"` on each committed page, 1280x800, software GL (`tools/harness.py`):

| Page | Checks | Scene triangles at the view | Attach audit |
|---|---|---|---|
| `dist/riftrim.html` (Ledge) | 43 pass, 0 fail | 2.31 M | 0 of 11,491 cards float |
| `dist/riftrim-lakes.html` | 43 pass, 0 fail | 15.9 M (the glass canes' view, close over the shallows) | 0 of 411 |
| `dist/riftrim-ice.html` | 43 pass, 0 fail | 1.27 M | 0 of 145 |
| `dist/riftrim-gorge.html` | 43 pass, 0 fail | 1.22 M | 4 of 135 needle cards (the Rift's stone pine), under the 1% limit overall |
| `dist/riftrim-pass.html` | 43 pass, 0 fail | 18 k | none drawn at the view |
| `dist/riftrim-barrens.html` | 42 pass, 0 fail | 1.94 M | 0 of 17 |

What the checks caught on the way, all fixed: the river line built from (x, y) instead of (x, z) (the river was no water); the lakes'
outlet carved only to its water line; the gorge's banks under the water past its edge; a ramp reversed on the crossing (its tundra
under ice); the pack's brightness normalisation lifting the black rim's dark rock to pale (the ground layers keep their own now); the
frozen lake's ice record in the water fields; three vendors' builders whose crowns or flowers float (their rows commented, below).
**Owed to the coordinator:** the GPU `--assert --all-views`; the lakes station's 15.9 M at the canes' view is under the 19.5 M
budget but the heaviest, and worth a look on the Arc.

**2026-11-08, `dist/riftrim-pass.html` on the GPU:** `verify.py --assert --all-views` passes on the Arc (and a link-hooked run on the
RTX): all 34 programs link in every view, before and after the universal asserts. The earlier `shader-programs` failure (HANDOFF-REBUILD.md: the
ground past 16 texture units in some view's mode) does not reproduce on the current core (with `KSHADOW.units`); no kit change was made.

## The look, seen in SwiftShader (for the owner's pass)

- [ ] Station 1's cloud belt ground reads pale between the mist frills, and the fog-drip cards show as small square plates under the
  fins at mid range.
- [ ] The black barrens read dark grey-brown after the ground fix (`ground.quartzite.black` on the S stations); whether "black" enough
  is the owner's call.

## Owed to core adoption (`PLAN.md`, "Core adoption", "Not taken this turn")

- [ ] **Ledge's cliff: KCARVE cave mouths, `KSTACKS.contour` benches, and the cliff springs' cave (`KKARST`, karst site 6 of
  `biomes/KARST-SITES-5.1.md`).** The benches are cut into the ground's profile below Ledge's site; no mouth is carved. At the ground's
  11.8 m cells a mouth needs a ~40 m patch (KCARVE's pad must exceed the cell diagonal): a finer ground near the cliff, or a station that
  goes into the cave. The springs are not drawn.
- [ ] **The crossing's portal** is a cut face and a level apron with the Tungangs' lamps in a row (the lobelia's glow item), not a carved
  mouth; the waystation is not built (a settlement's).
- [ ] **The Hearths' stations** (`biomes/hearths/PLAN.md` section 11): `hearths` is built (station 7, 2026-11-09: below). `hearths-walk` (the
  western vent's walked field) is owed; the hold's two cave pages are still `biomes/hearths`' own.

## The look pass of 2026-11-09 (every station's views on the GPU, before and after)

Fixed:
- **The frozen lakes' drifts** (89w; the cold lake, station 3, and the Hearth field's lake): short slabs on a 14 m lattice tiled the ice with white
  rectangles from any height, and their wind was passed in radians where `WATER.ice` takes degrees. Now long thin streaks down the wind, fewer.
- **Ledge's great lake past the map** (83 `LAND.farWater`, `stations/ledge`): the far field held the lake at its level but coloured it by height,
  and below 300 m that is the pink waste colour: from the cliff top the lake ended at the map's edge in a pink plain. It is the lake's blue now.

Seen and left for the owner (each a look decision or a larger piece of work):
- [ ] **Ledge's cloud belt reads pale**: the rift fill's beds (KSTRATA `rift`) on the W walls are pale grey and white, so the slopes behind the mist
  frills read as snow from below (item above, "Station 1's cloud belt ground reads pale").
- [ ] **Ledge's basin plain** reads as a flat lime lawn from its outlet view (the `grass` layer at full weight on the flat), and its cliff face is
  a dark corrugated wall close up.
- [ ] **The cold lake's glacier** reads as a brown ridge in its own view (no lying snow on it: `snowBase` 0 on that station).
- [ ] **The far fields round every station are flat vertex colour** past the map, and the shared sky's snow ridges stand as a pale scalloped wall
  over them on the high stations.

## Stations 8 and 9, the Fellgang villages (2026-11-11; `PLAN.md`, "Stations 8 and 9, the Fellgang villages")

- [ ] **No building kit has the Fellgangs.** The villages are core/hamlet's records drawn as stand-ins (`stations/fowlers/84f-host-fellgang.js`):
  drystone boxes under gabled turf roofs, round stores, open sheds, pens, and barrows for the ice houses, with no texture (vertex colours only).
  A Fellgang building kit owes their real forms and the library's drystone and turf.
- [ ] **core/hamlet has no fowling or ice-cutting focus**: the Fowlers take the `ranch` slot and the Ice-cutters the `quarry` slot, each naming its
  own works in the Fellgang row. A `fowling` and an `ice` focus in `KHAMLET.FOCI` would be a core change, owed if more such villages come.
- [ ] **The Fowlers' wall faces south**, away from the sun at this latitude (~40 degrees S): it stands in its own shadow most of the day, so the
  face reads dark under the `rift` beds' red and black. That is true to the site (scale model 5.1 puts the wall north of the lake); a summer
  dawn or evening, with the sun rising or setting south of east or west, lights it obliquely.
- [ ] **The wall is the ground's 12 m cells**, so its ledges are coarse and the ropes follow a smoothed face; `KSTACKS.contour` bodies would
  give it real overhangs and ledges.
- [ ] **No flyers, no climbers, no people** (`kits/fauna`, people); the nests and eggs are placed records only.
- **The Ice-cutters' opening view frames the nearest lantern lobelia** (the S rim's beacon, 1.8 km west of the village) with the frozen lake
  and the village beyond it: the shelf round the village grows no tree, and the check that trees are drawn as variants needs one in range.

## Station 7, the Hearth field (2026-11-09; `PLAN.md`, "Station 7, the Hearth field")

- [ ] **`ATMOS.snowBare` uploads its mask with three.js's default 4-byte row alignment** (core/atmos fx/snowcover): a mask whose rows are not a
  multiple of 4 bytes (this one's 701) shears, and the discs came out snowed. The station sets `unpackAlignment = 1` on the texture snowBare returns
  (89b); the fix belongs in core (one line in `A.snowBare`), and oidong's Cold Hearths (`stations/hearths/89b`) should be checked for the same.
- [ ] **Oidong's Cold Hearths carries a vent hazard with `radiant:{reach:6}` and no `dose`**, which `KHAZ.make` rejects, so its export's hazards
  section errors when its export box takes the vent (this station had the same record, fixed here with a dose).
- [ ] **The glass forest is the N rim's frost frills and bell firs at full density** round the open shelf: ~39,000 trees, ~10.7 M floor
  triangles; the page draws 14-15.4 M triangles a view (under the 19.5 M budget). A winter look (the bell firs' closed bells, `?season=winter`)
  is not switched on by the station.
- [ ] **No fin-owl, no hearth animals** (`kits/fauna`); no heat shimmer (`ATMOS.shimmer` is a post pass in the draw slot the sky and the
  reflections switch share).
- [ ] **The disc floor is paint** where the library layers fade off (from 7 degC): close up it is the paint's 4 m texel, not a surface; a
  `ground.ash.warm` or bare-soil library set would serve the warm ground (none in the library yet; `core/materials/PROMPTS-NEEDED.md` section 42 has the prompt).
- **The four ground layers**: the bare-snow mask is a texture unit of the ground's, so this station names four (`needles`, `tundra`, `lenswort`,
  `lichen`); the reindeer lichen (`clad`) is off.
- [x] **KSHADOW's switch** is the handle's `off()`/`on()` (89z, the panel's select in 99): replace it with core's own switch when it merges.
  **Closed 2026-11-08:** 89z attaches off on core's own switch (no `off()` after attach); the panel's `shadowsel` select is gone for core's
  `shadows` button; `?shadow=1` on at load, `?shadow=0` none.

## The look (for the owner's pass; nothing measured on a GPU yet)

- [ ] **The impostors' gain** is ebadlands' 2.4 (`89z IMP_GAIN`): set it against the near crowns on the GPU.
- [ ] **The frills' fins** are `card.fin.glass` (one fan of fins a card) stood out from the column, tinted teal (N) or copper-teal (W),
  back-lit (`backlit` 1 and .6): whether they read as translucent at a low sun is the look pass's question.
- [ ] **The glass cane** is a procedural clear material on a jointed cylinder: `card.glasscane` was delivered 2026-11-03
  and waits to be wired as a card family at the kit's next turn (`core/materials/PLAN.md`, "Delivered 2026-11-03").
- [ ] **The prism heath's seasons**: one card (`card.heath`), tinted per rim; the plan's three seasons are not drawn.
- [ ] **The lantern lobelia's night glow** follows the sun's intensity (`RRIM.night`, 99): check it at dusk on the GPU.
- [ ] **The rims' ground palettes** (45's painter) and the five ground layers each station shows were chosen without a GPU look.

## Data and size

- [x] **The kin kits' packs** are trimmed to the families each station's rows draw with (measured on the page: every material a kin
  mesh uses, by its vendor slot; `station.json`): the pages are 7.4-9.1 MB, under the gallery's 16 MB. A new row needs its families added.
- [ ] **Three catalog fruit pieces are named and not in the catalog yet**: `generic_fruit_bellfir_seed` (the staple), `generic_fruit_starberry`
  (the fruit), `generic_fruit_rimroot` (the medicine): `kits/catalog/krator-master-furniture-generic-fruit.js` (`biomes/FRUIT.md`).
  The crop row reuses `generic_fruit_mast`.
- [ ] **`kits/crops` has no `riftrim` entry** (plan section 7): the starberry, bell seed and rimroot as crop records, and Dalab's crops on the
  basin plain from `CROPS.forBiome`.
- [ ] **The far fields** are each station's own function (`LAND.far`), not a re-cut of the model (`biomes/STATIONS-MAP-5.1.md`, "Regions
  needing a re-cut").
- [ ] **No Godot twin**; `PORT.md` is the audit's provisional tags.

## Borrowed species

- [ ] **The beard tree is not grown** (station 2): the Rift's `B[27]` scatters its blooms and anemones up to .8 m round a limb point; with four
  trees the attach audit failed at 1.86% (12 of 644 cards). Commented, owed as the monkey-puzzle is. Station 2's only borrowed species is now
  the S highlands' crozier: the N rim's Rift cloud forest (PLAN.md section 3) waits on the Rift's turn.
- [ ] **The monkey-puzzle is not grown** (station 2): the Rift's builder (`src/55`, `B[9]`) scatters its blooms up to .6 of a pad's width off
  the pad, and the attach audit failed at 51% on station 2 with it (1,982 of 2,039 blooms floating). Its row is commented; grow it again
  once the Rift holds them (`BIO.holdTo`).

- [ ] **The tier cedar is not grown** (stations 1 and 4): the SW lowlands' builder (`src/55`, `B[16]`) jitters its 4 m pads up to 1.2 m
  off the limbs, and the attach audit failed at 1.96% on station 1 with it (273 of 6,186 needle cards floating; the limit is 1%). Its row is
  commented in the two lands; grow it again once swlowlands holds them (`BIO.holdTo`), as ebadlands waits on sedesert's mesquite.

- [ ] The S highlands' kin (coilbark, spiral aloe, crozier) are read from a kit whose own rebuild turn (pair 12) has not run: take its
  species as they change (keys kept). Its registry is `shigh` (station.json's fourth entry).
- [ ] The kin are unique trees within 500 m of the LOD spine (87): the vendors' builders draw lite crowns past their hero range and those
  float (the attach audit, 2026-11-03). Past it no kin grows; a far tier for them (their own impostors) is owed.
