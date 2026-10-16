# Reed Lake — design doc

The **Reed Lake** kit builds the floating villages of the lake people: a reed culture on open water, the lake's
answer to the Highland tribes' cliff settlements. It is a *completely different culture* from the highlands —
nothing carved, no totems, no formline. What it shares with the Highlands kit is the fragment contract and the
plain building blocks (walls, roofs, doors, folk); what it does not share is the vocabulary.

References (Travis's set): the Marsh Arab **mudhif** (reed-bundle arches, lattice fronts, rows of free-standing
bundle columns), the Uros islands of Titicaca (islands of piled totora, thatch huts, tiered cone huts, watch
towers, reed boats with animal-head prows), reed boats.

## Materials

| what | how |
|---|---|
| **the island** | layers of piled reed from below the water to a top mat of cut reed (`hnRLIsland`), fringed with loose ends, anchored on eucalyptus poles, ringed with living reed beds |
| **bundles** | thick lashed reed bundles: columns, arches (ribs), ridges, purlins, pontoons, boats, fences, posts (`hRLBundle*`) |
| **matting** | woven reed for walls, floors, decks, awnings, doors (`hRLMatB`, `hRLMatP`) |
| **lattice** | the open diamond lattice of a mudhif's upper front (`hRLLattice`, alpha) |
| **thatch** | totora thatch on the huts, cones, the warehouse hip, the workshop gable (`hRLGableT hRLHipT hRLPyrT hRLConeT hRLThatchB`) |
| **timber** | eucalyptus poles only: anchors, stilts, dock posts, a crane (`vPost`, tint `RPAL.pole`) |
| **mud / clay** | every fire sits on a slab of lake mud; the garden rafts carry mud (`hRLMud`) |
| **iron** | salvage only, at the smithy |

## The painted vocabulary — Andean, woven

Stepped diamonds, zigzags, step-frets (greca escalonada) and the stepped cross (chakana), in **madder red, ochre,
black, undyed white** with a little indigo and green (`RAND`). It appears as woven **bands** round posts and bins
(`hRLBandCyl`, `hRLBandP`), hung **cloths** on mat walls (`hnRLCloth` — the awayo), **pennants** on posts and
poles, **chakana discs** as finials and gate signs (`hRLChakana`), the painted **cone** of the shaman's house, the
**shields** of the warrior's hall, and the painted **puma prow** of the boats. No curvilinear or carved motif.

## The buildings

| family | defs |
|---|---|
| Dwellings | `rl_small_a` thatch hut · `rl_small_b` cone hut · `rl_small_c` small mudhif · `rl_large_a` family mudhif · `rl_large_b` long dwelling on a bundle deck |
| Halls | `rl_longhouse` great mudhif · `rl_warrior_hall` (mudhif in a bundle palisade) · `rl_shaman` (painted cone) |
| Sacred and lookout | `rl_spirit_circle` (ring of banded pillars) · `rl_watchtower` |
| Work | `rl_dock` fishing dock · `rl_weaver` reed weaver's workshop · `rl_warehouse` · `rl_smithy` |
| Boats | `rl_boat_canoe` · `rl_boat_great` (two heads, a mat cabin) · `rl_boat_raft` |
| Farms | `rl_farmhouse` · `rl_farm` floating gardens · `rl_pen` · `rl_granary` · `rl_fishfarm` fish weir and duck run |
| Island platforms | `rl_island_a` small round · `rl_island_b` oval · `rl_island_c` large with a cove · `rl_island_d` long · `rl_island_e` ring with a lagoon |
| Floating village | `rl_village` — six islands, the kit on them, pontoon bridges, boats, the gardens and the weir on the open water |
| Hospitality | `rl_tavern` **Reed's Local** — the drinking hall: a great mudhif (L 28, span 11.5, crown 9.4) with built-in mat benches along both walls and a cook-fire on a mud slab, a smaller mudhif joined at its right for the kitchen and the store, a mat terrace, and a covered landing on bundle pontoons out over the water (the def's `landing: 6.5` m past the +z edge) where the canoes tie up, under the woven sign REED'S LOCAL |

## Rules

* **Ground is the island.** y = 0 is the top of the reed island a building stands on; the lake is at `RL.WATER`
  (−0.45). A def placed alone builds its own pad (`hnRLPad`); placed on a shared island it is called with
  `o.pad = false`.
* **Fire on mud.** Every hearth, brazier and forge sits on a clay slab (`hnRLHearth`, `hnRLBrazier`).
* **No electric light** — fire-cages and hearths only. `lit:false` on every def.
* **Tags**: `culture: 'reed-lake'`, `kit: 'reedlake'`, `type`, `wealth`, `lit`; every instance registers through `vnReg`.
* Seeds 25000–25999 (dwellings 250xx, halls 251xx, work 252xx, farms 253xx, islands 254xx, village 255xx, the tavern 25600–25649, scene 25990).
* **Interiors are data**, in `kits/interiors/sets/reedlake.js` (one item per def, or a `skip` with the reason). A builder
  draws structure (floors, ribs, walls, fixed benches, fire slabs); the set furnishes the rooms from the catalog's
  `reedlake` furniture. Outdoor dressing (stock, nets, boats) stays kit items.
