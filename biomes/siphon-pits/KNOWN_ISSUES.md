# biomes/siphon-pits: known issues

Built 2026-11-11 in the cloud: every check ran on software GL (SwiftShader), none on the two GPU lanes yet.

## Stand-ins (owed: `core/materials/PROMPTS-NEEDED.md` section 46)

- [ ] **The woolly siphon's pelt** draws `wool.fleece` (slot `fleece`, tinted amber by the vertex colours): a sheep's fleece standing in for
  the machine-wax pelt (`surface.fleece.machinewax` owed). Its hanging fleece (`spfringe`) is a **procedural** strand card (`TX.strand`,
  `50-biome-siphon-species.js`): no library card of waxed locks exists.
- [ ] **The siphon felt** draws `cloth.felt` (a woven felt) on the ground and on its patches (`ground.feltturf.siphon` owed).
- [ ] **Machine wax** (the suture galls) draws `wax.tallow` (`wax.machine` owed).

## The look and the physics

- [ ] **The deck's amber is the page's.** `core/atmos`'s height fog mist takes the fog colour (`sky/89-atmos-j-fog.js`: `cM = fc`), so the page
  tints the fog colour toward amber, and dims the sun, each frame after the sky sets them, by how deep the eye is under the lid (`89b`:
  `deckView`). A mist colour of its own in the chunk (`atmFogMistC`, compiled only on a page that asks, as the belt is) would be the core fix; it
  was not made here because the chunk's text is in every biome page and each would have to be rebuilt. The lid (a sheet at 2,580 m) stands in
  for the deck's underside, since the sky dome takes no fog.
- [ ] **The road on the Scarp is a pack track**: 16 switchbacks on the ravine's scree climb ~1,500 m in ~4.4 km, a grade near 30%. A wagon
  road would need ten times the length; the plan's "freight exchange for pack beasts" fits a track.
- [ ] **The model's lapse across the stations** is 9.5 degC a km (Station 1 +15 at 2,157 m, Station 4 -5 at 4,269 m), steeper than the dry
  adiabat (7.4). The kit takes the model's numbers (`PLAN.md` section 0); the page's air field lapses at the model's 6.5 from each station's
  own record, so it agrees with the record at the station's height only.
- [ ] **Stations 1 and 2 stand where the model is level or gentle**: the Terraces' page has no wall in it (the model is level within 16 km;
  the Stalker Peaks and the Ostrukh Wall are the shared sky's ridges), and the Scarp's page puts 1,850 m of wall where the model's 4 km cells
  give ~1,000 m within 2 km. The plan's section 2 edits (the graben, the wall, the pits) are a to-do for the next scale model update.
- [ ] **No lava tube** of the model reaches Region 98, so the plan's "lava tube portals" are not drawn; the Pipe-Borer's burrows stand for them.

## Not done yet (`PLAN.md` section 7)

- [ ] **S8, the animals drawn.** The Ghaunt-Ox, the Flenser-Hound and the Pipe-Borer are records in `kits/fauna` (`krator-fauna-xeno.js`);
  the pages publish the flensers' lairs as hazard records (`life.species`) but draw no animal. `fauna-lands.js` with a bundle of `hyperjungle`,
  `wild` and `xeno` is the way (`biomes/hyperjungle`'s stations).
- [ ] **The people's sites are placeholders** (boxes, cones): the farmsteads, the tollhouse, the beacons, the roper camp, the gantry. They are
  site records for a building kit and a hamlet pass; the culture is undecided. The Arete's stanchions and chains are the trail's own.
- [ ] **The fauna vocabulary has no Cwb or Dsc** (`kits/fauna/fauna-core.js` `FAUNA_VOCAB.koppen`): the three animals carry their nearest
  classes. Adding the two is a change every fauna bundle would carry.
- [ ] **`kits/crops` has no Region 98 entry**: Station 1 queries `CROPS.at` on its axes; the plan's frost-barley and frost-wheat are the crops
  kit's frost oat and emmer (it has neither barley nor wheat by those names).
