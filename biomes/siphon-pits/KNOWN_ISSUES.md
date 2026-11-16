# biomes/siphon-pits: known issues

Built 2026-11-11 in the cloud (station 14, 2026-11-16, too): every check ran on software GL (SwiftShader), none on the two GPU lanes yet.

## Stand-ins (owed: `core/materials/PROMPTS-NEEDED.md` section 57)

- [ ] **The woolly siphon's pelt** draws `wool.fleece` (slot `fleece`, tinted amber by the vertex colours): a sheep's fleece standing in for
  the machine-wax pelt (`surface.fleece.machinewax` owed). Its hanging fleece (`spfringe`) is a **procedural** strand card (`TX.strand`,
  `50-biome-siphon-species.js`): no library card of waxed locks exists.
- [ ] **The siphon felt** draws `cloth.felt` (a woven felt) on the ground and on its patches (`ground.feltturf.siphon` owed).
- [ ] **Machine wax** (the suture galls) draws `wax.tallow` (`wax.machine` owed).

## The look and the physics

- [ ] **The deck's amber is the page's.** `core/atmos`'s height fog mist takes the fog colour (`sky/89-atmos-j-fog.js`: `cM = fc`), so the page
  tints the fog colour toward amber, and dims the sun, each frame after the sky sets them, by how deep the eye is under the lid (`89b`:
  `deckView`). A mist colour of its own in the chunk (`atmFogMistC`, compiled only on a page that asks, as the belt is) would be the core fix; it
  was not made here because the chunk's text is in every biome page and each would have to be rebuilt: it is parked in the root `TODO.md`,
  "Ride along with the next all-builds rebuild" (the owner, 2026-11-11). The lid (a sheet at 2,580 m) stands in
  for the deck's underside, since the sky dome takes no fog. From the rim the lid reads pale cream, not amber: the air's haze over it
  (the view 'Down from the rim'); only the top 117 m of the 420 m walls stand above the deck, as the numbers say.
- [ ] **The road on the Scarp is a pack track**: 16 switchbacks on the ravine's scree climb ~1,500 m in ~4.4 km, a grade near 30%. A wagon
  road would need ten times the length; the plan's "freight exchange for pack beasts" fits a track. The road is drawn as a gravel surface on its bench with a dry-stone
  parapet on the downhill side (2026-11-11, second pass).
- [ ] **The model's lapse across the stations** is 9.5 degC a km (Station 1 +15 at 2,157 m, Station 4 -5 at 4,269 m), steeper than the dry
  adiabat (7.4). The kit takes the model's numbers (`PLAN.md` section 0); the page's air field lapses at the model's 6.5 from each station's
  own record, so it agrees with the record at the station's height only.
- [ ] **Stations 1 and 2 stand where the model is level or gentle**: the Terraces' page has no wall in it (the model is level within 16 km;
  the Stalker Peaks and the Ostrukh Wall are the shared sky's ridges), and the Scarp's page puts 1,850 m of wall where the model's 4 km cells
  give ~1,000 m within 2 km. The plan's section 2 edits (the graben, the wall, the pits) are a to-do for the next scale model update.
- [ ] **No lava tube** of the model reaches Region 98, so the plan's "lava tube portals" are not drawn; the Pipe-Borer's burrows stand for them.

- [ ] **The ground's detail mask is read raw** (`84-host-ground.js`, `uDetail`: a procedural grey multiplier, not a colour map, as
  highrift's): `tools/check_source.py`'s RAWTEX finding is baselined for it, the same as highrift's line.

## Station 14, the Ostrukh-on-Water Polynya (2026-11-16, `PLAN.md` section 8.3)

- [ ] **The GPU verify is owed** (the owner's machine, `KRATOR_GL=gpu`): `verify.py dist/siphon-pits-polynya.html --assert` ran on SwiftShader only.
  The ground reads 17 texture units there (`window._units.final`, against SwiftShader's 32); on a 16-unit GPU lane the rain cover and the horizon
  give way as on station 1 (`85-host-far.js`), and the frost smoke's mist field and the ice's bake are two more samplers to count.
- [ ] **The ice is the spec's, not the model's climate** (open question in `PLAN.md` 8.3): the pin's cold month is +4 degC and its record low -4 on
  the model, too warm for a lake to freeze over. The page keeps the ice to the bay at the year's coldest dawn.
- [ ] **The shore is brought to the pin** (an ideal type): on the model Lake Ostrukh's nearest water is 14 km north-east of the pin
  (1521,1466). **For the scale-model queue:** move the pin `sostrukhyuni01` onto the lake's south-west shore (about 1520,1465, ~1,850-1,940 m), or
  grow the lake's south-west bay to the pin, so "on fresh Lake Ostrukh" is true on the map; and the spec's `Ostrukh Riba` as the lake's
  15-25 m3/s outflow, where the model has it flowing in at 0.9 m3/s (`r_mb_siphon_breach`, 1528,1459).
- [ ] **The ice record has no `levelAt`**: core/water's `WATER.fields` (ext/60) reads `S.levelAt(0)` from every surface but a flow or a still, and
  ext/54's `WATER.ice` makes none, so the page gives each ice record `I.levelAt = () => I.level` (`stations/polynya/89wp-host-polynya.js`). A core fix (ext/54 or ext/60)
  would drop it; it was not made here because ext/54 is in other pages.
- [ ] **The village is placeholders**: Ostrukh-on-Water (`sostrukhyuni01`, Yuni) has no settlement kit; its edge (the quay, the granaries, the
  wax-caravan yard, the qanat mouths, nine houses) is site records tagged with its id and `culture: 'yuni'`, drawn as boxes and cones.
- [ ] **The fault springs' bench** (`tibasalt-ponded` under the loess) lies under the ice and is not drawn; the page's KSTRATA is `loess` alone.
- [ ] **The polynya's edge is the ice's flat edge**: no frazil, brash or pancake ice at the margin, no ice thickness seen from the open water.

## Not done yet (`PLAN.md` section 7)

- [ ] **The animals are drawn by `fauna-lands.js`'s maker** (2026-11-11, second pass: `src/89y-host-fauna.js`): the Ghaunt-Ox yoked in pairs
  on the terraces' fields, wild on the Scarp's ledges and the pit floor's felt, the Pipe-Borers on the felt, the Flenser-Hounds at the Arete's
  rims. They stand and walk where the plan puts them; they do not yet flee, hunt or follow a schedule (no behaviour module on a biome page).
  The Arete holds about one Flenser-Hound a lair (`density` .02; at .5 it drew 194). Drawn after the height fog was bound (89a), so 89y
  hooks the late materials again (`ATMOS.heightFogScene`; unhooked, they drew black under the deck).
- [ ] **The Ghaunt-Ox's legs are short for its bulk.** Its coat (`faXnCoat` in `kits/fauna/krator-fauna-xeno.js`, 2026-11-12: a shaggy shell to
  the knees) made it read as a woolly ox, not a bare grey slug, but the hexapod builder's legs stay stubby under it. Longer legs (a higher
  `yb` and `R`) would change its measured box (`dim`) and its gait; a pass on the fauna sheet.

- [ ] **The people's sites are placeholders** (boxes, cones): the farmsteads, the tollhouse, the beacons, the roper camp, the gantry. They are
  site records for a building kit and a hamlet pass; the culture is undecided. The Arete's stanchions and chains are the trail's own.
- [ ] **The fauna vocabulary has no Cwb or Dsc** (`kits/fauna/fauna-core.js` `FAUNA_VOCAB.koppen`): the three animals carry their nearest
  classes. Adding the two moves every fauna bundle: parked in the root `TODO.md`, "Ride along with the next all-builds rebuild".
- [ ] **The plan's frost-barley and frost-wheat** are the crops kit's frost oat and emmer (it has neither barley nor wheat by those names).
