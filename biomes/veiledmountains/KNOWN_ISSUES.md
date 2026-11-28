# biomes/veiledmountains: known issues & ride-along items

## Ride along with the next all-builds rebuild

- [ ] **Shared `core/world`, `kits/crops`, `kits/fauna` & `biomes/botany_census.json` sync:** Left untouched during parallel workspace-isolated build so zero outside builds become stale (`AGENTS.md`). On the next all-builds rebuild:
  1. Add `STYLES.veiled`, `PAL.veiled`, and `BIOME_GROUND` keys (`'veiled mountains'`, `'veilpass'`, `'mist valley'`, `'mist valley 2'`, `'region 174'`, `'region 175'`, `'region 177'`) into `core/world/41-world-fields.js` (`PLAN.md` §3.1).
  2. Lift `CROPS.BIOMES.veiledmountains` and the `crimson-chalice` / `mire-sporespike` endemic records from `src/22-veil-crops.js` into `kits/crops/src/10-crop-core.js` & `22-crop-material.js`.
  3. Lift the `6` `VEIL_FAUNA` species from `src/24-veil-fauna.js` into `kits/fauna` (`KratorFauna`) and refresh `biomes/botany_census.json` via `python3 tools/check_botany.py`.
- [ ] **`kits/timpar-kuran` (`TKK`) settlement integration:** Stations hold registered `site:timpar-kuran-*` reserves (`landmark`, zero `class: 'building'`) ready for `core/hamlet` / `openworld/` clan plank-houses and *chasi-noow* ridge forts.
