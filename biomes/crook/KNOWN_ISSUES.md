# biomes/crook: known issues & planned follow-ups

All production quality gates on `crook` (`dist/crook.html`, `dist/crook-wash.html`, `dist/crook-head.html`) pass with `0` untextured meshes, `< 14` active ground samplers, `0` coplanar rimstone or snow-well z-fighting overlaps, and `KSHADOW` off at load.

## Planned future tie-ins (out of scope for the biome kit)
- **Cultural kits & settlements (`kits/hueru-kuran/`, `kits/dzagh-vardzi/`):** Permanent *Nuraghi* / whale-rib *chise* villages on `Crookshore` `>= +65 m` terraces (`site:hueru-kuran-kopa`) and `Dzagh-Vardzi` polychrome tuff/basalt needle-towers & chasm sky-bridges (`site:dzagh-vardzi-chasm`) are held clear as registered `KTAGS` `site` reserves.
- **Bespoke material-library sets (`PLAN.md` §6.3):** Currently mapped onto genuine existing library sets (`organic.cap.porous`, `organic.sponge`, `organic.chalicecap`, `card.fern`, `bark.armored`, `ground.rust.terrace`, `card.crop.rosette`, `ground.snow.algae`). When bespoke `organic.sponge.basalt` or `card.fern.porcelain` sets land in `core/materials/library/`, swap their `"lib"` entries in `materials.json` and rerun `python3 tools/textures/pack.py biomes/crook`.
