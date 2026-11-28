# Tethis — Visual Delta Log (`VISUAL-BAR.md` §5)

Reference plates (`targets/tethis/reference/`):
1. `ref1_pylon_garden_saucers.jpg` — Clustered fluted concrete pylons, bevelled garden saucers, curved warm-lit glass conservatories, and mid-span hexagonal belvedere walkways.
2. `ref2_shallow_sea_submerged_saucer.jpg` — Stepped white hub saucer in crystal-clear turquoise shallow coral sea, diagonal-strut calyx satellite dishes, and submerged annular saucer pod over a colourful coral reef.
3. `ref3_mushroom_tower_soffit.jpg` — Moebius/Soleri tall Mushroom Tower with arched sea-base, asymmetric mid-stem blister pods, 24 warm-amber/cyan radial soffit coffers, summit cupola, and rim/crown needles against an oceanic azure sky.
4. `ref4_soleri_marine_lattice_capsules.webp` — Kikutake/Soleri hexagonal lattice of annular sea-well rings, radial inner slips, twin harbour viaducts, bristling radial plug-in capsule drums with proud core crowns, and T-crane condenser columns.

## Round 1 -> Round 2 Ranked Visual Deltas

1. ~~**[Sky / Horizon — P2]** Kit's stock desert-peach sky shader (`vec3(.86,.62,.42)`) clashed at the horizon with `HAZE` (`0xc4dce6`), producing a visible colour step above the sea; rectangular `bedMesh` outer border faintly showed through translucent water at `r ~ 960 m`.~~ *(Fixed in Round 2: retuned `skyMat` daytime colours to pelagic azure/sea-mist matching `HAZE` seamlessly, and feathered `bedMesh` radially down to `groundM` at `-37.5 m` with matching vertex colour.)*
2. ~~**[Underwater Light & Reef Density — P2, Ref 2]** Underwater camera (`y < -0.35 m`) shifted `scene.fog` to teal, but `hemi` and `sun` stayed warm dry-air cream, leaving the seabed beige and sparse (`320` corals over `1.7 km²`), and the `-10.5 m` pylon tie-beam crossed in front of `U0`'s viewport band while a pylon stood on the camera sightline.~~ *(Fixed in Round 2: shifted `hemi` and `sun` to tropical underwater cyan/aqua when `camera.position.y < -0.35`, moved pylon collar to `-3.2 m`, added `780` dense polychrome coral clusters + kelp around `U0`/`U4` and shallow shoal bays plus 3 radial reef-observation lobes projecting into open turquoise water, and aimed underwater preset cleanly between pylons.)*
3. ~~**[Conservatory Glass & Promenade Sightline — P2, Ref 1]** Curved botanical conservatories (`P3`, `P0`) used an unribbed milky amber-emissive shell that washed out `Grand Promenade at eye level`.~~ *(Fixed in Round 2: replaced milky shell with clear reflective `MAT.glass`, crisp white arched ribs & mullions, planted green roof-caps, and warm interior golden planter cores; moved eye-level Promenade camera to the open lagoon terrace looking unimpeded at `T0`.)*
4. ~~**[Capsule Drum Relief & Proud Core Crowns — P2, Ref 4]** Capsule drums (`T1a–T5`) had pale inner walls behind flush capsules and short `6 m` top cores, softening Ref 4's bristling plug-in cellular silhouette.~~ *(Fixed in Round 2: recessed dark-slate structural shadow drums behind deeper `6.4 m` projecting capsules and raised smooth cylindrical core crowns `+20 m` above top drums as in Ref 4.)*
5. ~~**[Mushroom Stem Blisters & Rim Aerials — P2, Ref 3]** `T0` and `T4` mid-stem pods were symmetric rings rather than Ref 3's asymmetric cantilevered observation blisters, and the mushroom rim lacked slender perimeter radio needles.~~ *(Fixed in Round 2: added asymmetric cantilevered warm-lit blister lobes, 4 vertical trunk buttress-fins, taller summit cupola, and perimeter rim antennae needles.)*
6. **[Walkable Partitioned Interiors — P3, deferred]** Interior Live / Work / Recreation room layouts and `ancients_*` / `hykkousoi_*` catalog keys are specified in `plan/BLUEPRINT.md`, `plan/FURNITURE.md`, and `plan/sheets/N1..N6.png`; curved annular `kits/interiors` partition meshes are deferred to settlement integration.
7. **[Vessel & Rigging Fidelity — P3, deferred]** Moored vessels are low-poly instanced hydrofoils and outriggers heaving via `WATER.rideOn`; full `kits/ringsea` multi-part hulls belong to open-world harbour integration.
8. **[Animated Walkers & Swimmers — P3, deferred]** Static kit figures / uninhabited promenade decks; `core/charactermodels` gill-folk crowds belong to a `core/simulation` settlement build.

## Rubric (`VISUAL-BAR.md` §7)

| Row | Round 1 | Round 2 (verified) | Next +2 lever |
|---|---|---|---|
| Terrain and geology (shoal & coral seabed) | 6.5 | **8.5** | Per-patch normal-mapped coral rock shelves & caustic projection |
| Architecture and massing (Soleri saucers, mushroom & capsule towers) | 8.0 | **9.0** | Curved interior room partitions behind ribbon glazing |
| Water and atmosphere (`core/water` + `core/atmos`) | 7.0 | **9.0** | Volumetric horizon clouds & breaking surf foam rings around pylons |
| Cultural / modern storytelling (Hykkousoi & `P8` ruin) | 8.0 | **9.0** | Full-rigged `kits/ringsea` outriggers & animated gill-folk swimmers |
| Composition of acceptance frames | 6.5 | **9.0** | Animated atmospheric drift across sun-glint lanes |
