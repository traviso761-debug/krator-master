# The Drownlands: known issues

Open items are `- [ ]`; read them before changing the kit.

## Stand-ins & future integration (`PLAN.md` sections 6.3, 8.4)

- [ ] **Custom library material prompts** (`PLAN.md` section 6.3): `materials.json` maps `100%` of ground, brucite sinter, serpentinite, laterite, coal-measure, mangrove bark, teal nickel-latex scars, bleached tsunami snags, visor-oyster sleeves, sponge-corals, kelp, seagrass, and `?works=0` props onto genuine packed Krator library maps (`mineral.crust.brucite`, `bark.mangrove`, `bark.prismgum`, `wood.gnarled`, `organic.barnacle`, `organic.sponge`, `rock.schist.emerald`, `stone.amazonite`, `rock.coal`, `card.kelp.0`, etc.; `0` untextured meshes). Dedicated bespoke slots (`bark.mangrove.tealsap`, `rock.sinter.brucite`, `organic.sponge.shoal`, `bark.snag.oyster`) can swap in via `materials.json` once generated.
- [ ] **Mobile `cFlit-qBon` Ark-Fleet vessels & `Prou-Torre` dry-stone keeps** (`PLAN.md` Core adoption): `Station 1 shoal` registers `site:ark-ward-trench` over the `-84 m` escape graben and `Station 2 bar` registers `site:prou-torre-north` on the `+14.5 m` rib in `KTAGS` (kept clear via `KSPACE`), while `kits/ringsea/` vessels (`89c`–`89h`) and inundation keeps belong to `openworld/` / `settlements/` integration.
- [ ] **Fauna 3D rigs (`kits/fauna`)**: `DROWN_FAUNA` (`src/40-biome-drown-phys.js`) ships the six hexapod, echolocating `clickporpoise`, gannet, sirenian, and filter-whale records and 24-hour schedules as `[G data]`; animated 3D fauna rigging belongs to `kits/fauna`.
