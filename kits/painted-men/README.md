# `kits/painted-men` — The Painted Men (`Payntja-Mana`) Building Kit

Standalone building kit of the **Painted Men** (*Payntja-Mana*, speaking **Payntja-Tuka**, "Paint-Talk"; catalog culture `painted`), independent cliff-dwelling raider tribes holding `80%` of the `3,000–4,000 m` **Painted Highlands** (`rmvkam8s13kwu`: banded `badland` bentonite clay hills, `danxia` sandstone hogbacks, spring superbloom playas, and the `580 m`-deep `Painted Canyon` bordering `biomes/korona`).

Rebuilt onto **`core/engine`** ([PLAN.md](PLAN.md), [LORE.md](../../LORE.md) §6.5 & §10) around an **Australian Aboriginal (Arnhem Land / Kimberley) + Amazonian (Xingu / Kayapó) + Mesa Verde / Dogon** synthesis **strictly governed by the actual geology and flora of `biomes/paintedhighlands`**:
- **Zero bamboo** (`0` bamboo species in `biomes/paintedhighlands` or `biomes/korona`) — all structural roof spans use peeled `paintedjuniper` & `paintedoak` ***viga* joists (`<= 4.20 m`)**, bent canyon-oak *maloca* cruck-ribs, and single-trunk **notched Dogon ladders**.
- **Zero kiln-fired brick, roof-tile, or pottery** (`badland` smectite/bentonite swells and shatters in a kiln) — walls use dry-laid & mud-mortared tabular **`danxia` sandstone slabs** coated in sun-baked polychrome **`badland` bentonite plaster**; vessels use **pinyon-pitch-sealed coiled willow *tus* water-jugs**, **carved burl *coolamon* troughs**, and raided lowland iron kettles.
- **Zero legacy Tlingit formlines/totems** (`83-pm-tlingit.js` migrated out to `kits/timpar-kuran`) — replaced by procedural **5-colour Arnhem *rarrk* cross-hatching, X-ray pronghorn/raptor anatomy, `Yanta-Rringka` stencilled open hands, concentric songline track-rings, mouthless Kimberley Wandjina seep-spirits, and `2.8–5.5 m` canyon-oak *Pukamani* & *Lorrkon* poles** crowned with `ATMOS`-wind-swaying iridescent Korona bird feathers (`41-pm-rarrk.js`).

## Fragments

| Fragment | Tag | Responsibility |
|---|---|---|
| `src/00-head.html` | `[web]` | Page title & error HUD shell |
| `src/26k-kit.js` | `[G data]` | `KIT` identity (`culture: 'painted'`), `PM_STYLES`, `PM_SITES`, `PM_PIGMENTS`, `SV_LIB`, `SV_CLOTH`, `SVPAL` |
| `src/27v-pm-vstack.js` | `[G shader]` | Stage 5/12d K1 uniform dedup (`< 15` samplers), M2 specular AA, M3 planar POM on `danxia` masonry, M4 base AO |
| `src/27z-pm-matfix.js` | `[draw]` | Engine fallback library maps, selenite smoke-slit translucency & Korona feather PBR sheen |
| `src/34-pm-trades.js` | `[G data]` | `PM_TRADES` (`44` Voth census rows + `5` explicit `na` craft rows, `0` gaps) + `pmRigMath` (`<= 4.20 m` *viga* span, *maloca* cruck arc, Dogon ladder pitch, wind pins) |
| `src/39-pm-furn.js` | `[draw]` | `15` bespoke `painted_*` plateau pieces registered onto `KratorFurniture` under `culture: 'painted'` (incl. `painted_drone_pipe_rack`) |
| `src/40-pm-kit.js` | `[draw]` | `// prefix: pm` — cellular `danxia`/bentonite roomblocks, projecting juniper *vigas* & willow *latillas*, Mesa Verde keyhole doors, Dogon notched ladders, *maloca* vaults, Dogon granaries, hung ledges & `WATER.still` seeps |
| `src/41-pm-rarrk.js` | `[draw]` | `// prefix: pm` — 5-pigment Arnhem *rarrk*, X-ray fauna, `Yanta-Rringka` stencilled hands, concentric track-rings, Wandjina rock-brows & feathered *Pukamani*/*Lorrkon* poles (`>= 1.8 cm` wall step-off) |
| `src/50-pm-dwell.js` | `[draw]` | `// prefix: pm` — `10` poor, middle & rich alcove, hung, and *maloca* dwellings (`36001–36010`, `6/6` wealth x single/multi matrix) |
| `src/54-pm-sacred-def.js` | `[draw]` | `// prefix: pm` — `9` civic, sacred & defence works: warrior sparring *maloca*, shamanic stone-circle kiva, overhang songline rock-art & drone-pipe gallery (`pm_songline_gallery`, `36109`), *Lorrkon* cliff ossuary, playa truce pavilion & `4` cliff-defence works (`36101–36204`) |
| `src/62-pm-works-salvage.js` | `[draw]` | `// prefix: pm` — `15` plateau works: pigment quarry (`resSource`), pitch-basketry shed, mineral paint-cake & Korona `orchil` barter press (`pm_ochre_cake_press`, `36315`), Korona obsidian/*woomera* shop, Dogon talus & cliff-niche granaries, roast oven, smokehouse, brew *maloca*, bark-dye court, healer, seep garden, pronghorn corral & *rarrk* salvage (`36301–36315`) |
| `src/70-pm-cliff-alcove.js` | `[draw]` | `// prefix: pm` — composite **Tiered Seep-Alcove and Talus-Fan Cliff Settlement** showcase (`pm_cliff_village`, `36401`) |
| `src/89-rows.js` | `[G data]` | `9` survey-clean sheet rows placing all `34` `pm_*` buildings, `pm_cliff_village`, and `54` `kits/resources` nodes |
| `src/90z-pm-atmos.js` | `[G shader]` | `ATMOS` canyon-updraught wind hook (`atmos-pm-wind`) + CPU twin `pmWindDisplace()` |
| `src/91z-pm-world.js` | `[web]` | Sculpted `KDRAWN` `danxia` cliff & bench ground, `WATER.still` seeps & `WATER.flow` rills, `pmDims()`, `pmOreLinks()` |
| `src/99-host-tz-pm.js` | `[web]` | `window._api` audits (`plateauMaterialAudit`, `zfightAudit`, `reachAudit`, `doorsAudit`, `waterAudit`, `atmosWindAudit`, `texturesAudit`, `tradesAudit`, `oreAudit`) |

## Taking the Kit in a Settlement (`PMK`)

```python
sys.path.insert(0, os.path.join(ROOT, 'kits', 'painted-men'))
import kit_bundle as kpm_bundle
js, files = kpm_bundle.bundle('PMK')
```

## Build & Verify

```bash
node kits/painted-men/tests/test-painted-men.js
python3 tools/build.py kits/painted-men
python3 tools/check_port.py kits/painted-men
python3 kits/painted-men/verify.py kits/painted-men/dist/painted-men.html --assert --no-cache
```
