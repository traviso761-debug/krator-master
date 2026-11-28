# Double Delta: known issues

Open items are `- [ ]`; read them before changing the kit.

## Stand-ins & future integration (`PLAN.md` §9, §10)

- [ ] **Bespoke library card slots** (`PLAN.md` §9.2): `materials.json` maps `100%` of ground, mud, shell-lag, peat, blue amber-clay, bitumen tar-seep, limestone/loess bluff, colonial sponge, sea-pen, reed, driftwood, amber, and bluff-forest surfaces onto genuine existing Krator library textures (`organic.sponge`, `organic.coral.brain`, `organic.lattice.cage`, `organic.chitin.iridescent`, `card.flora.coral`, `card.fan.rainbow`, `rock.marl.blue`, `ground.tar.seep`, `fruit.skin.amber`, etc.; `0` untextured meshes). Dedicated custom-generated slots (`organic.sponge.chimney`, `card.seapen.feather`, `card.byssus.penshell`) can swap in via `materials.json` once generated.
- [ ] **`Ria Sound` (`626, 140`) permanent city architecture is out of scope for the biome kit** (`PLAN.md` §0, §7.4): Station 3 (`--station throat`) registers `site:ria-sound` in `KTAGS` on the safe `+65..+140 m` loess-capped bluff above Ghost-Tsunami runup and holds the town terrace clear for its future `settlements/` / `core/city` build.
- [ ] **Fauna meshes (`kits/fauna`)**: `DDELTA_PHYS.FAUNA` ships the six vertebrate-grade hexapod, benthic ray, mudfish, and wading-bird records and 24-hour schedules as `[G data]`; animated 3D fauna rigging belongs to `kits/fauna`.
- [ ] **Additional peripheral stations (`bar` `516, 172` and `lip` `512, 160`)**: Site data records are defined in `src/41-biome-ddelta-sites.js`; the three primary production showcase pages built in `dist/` are `bioherm` (`dist/doubledelta.html`), `bitumen` (`dist/doubledelta-bitumen.html`), and `throat` (`dist/doubledelta-throat.html`).
