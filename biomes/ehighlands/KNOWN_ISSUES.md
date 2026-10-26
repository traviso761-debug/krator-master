# Eastern highlands — known issues

- [ ] **Not placed on the scale model.** The region has no polygon yet (`biomes/WORLD.md`: "to be placed"); its
      neighbours and its pressure (~0.6 atm assumed) wait for it. The Koppen weights (`EHIGH.KOPPEN`) are an estimate.
- [ ] **`ground.puna` not delivered.** Nine of the ten library sets are in (`materials.json`, `tex/`, 2026-10-06); the
      puna's own ground waits for `ground.puna` (`PROMPTS-ready.md` section 7) and keeps its painted colour until then.
- [x] **No catalog fruit** (`biomes/FRUIT.md`): the cereus's fruit, the vigil spike's heart, wormwick and tower honey
      are not catalog pieces yet. 2026-10-20: they are (`generic_fruit_cereus`, `generic_fruit_vigil_heart`, `generic_fruit_wormwick`,
      `generic_fruit_tower_honey`), named in `tags.harvest.fruit` (`EHIGH.FRUIT_KEYS`) and held by the probe's `fruit tagged and catalogued` check;
      none is drawn on the stage.
- [ ] **No fauna** (the owner's plan: one fauna kit). Vicuña-like grazers, viscachas, condors, and the moths and bees of
      the glass towers' chemistry belong there.
- [ ] **Pallidine** is a placeholder name for the glass towers' alkaloid (the owner may rename it, and wormwick and tower
      honey with it).
- [ ] **The ground is 12 m a cell**: the bog's pools (5-17 m) sit in soft hollows and the gully walls are coarse. The combs
      hang on that coarse face and may stand a little off the rock.

## Export profile: sections left out (2026-10-18)

EXPORT_PROFILE in verify.py leaves out: atmos (the page has no core/atmos export: the section reads empty; sedesert fills it with 89-atmos-8-export.js); water (no core/water surface meets the box: the section reads empty). Add each back when the kit fills it.

2026-10-20: `atmos` is now bound and in the profile (migration phase 0: `89a-host-atmos.js` calls `ATMOS.bindHost`, build.py lists core/atmos's core, presets, export, waves and skylight plus `core/atmos/host/89-atmos-c-hostbind.js`; the binding alone draws nothing, and the page's own sky, fog, sun and water are unchanged). `water` waits for its phase: no core/water surface is drawn here yet.

2026-10-20: checked, nothing to wire. This page binds neither core/atmos nor core/water (its water, where it has any, is the host's own MAT_WATER shader), so there is nothing for the two sections to export and both stay out of the profile. The shared pieces are in place for the day it does: core/export's adapters (`09`) fill `atmos` from `ATMOS.export` and `water` from `WATER.surfaces`, and a kit that binds core/atmos lists `89-atmos-8-export.js` in its `CORE_ATMOS` and adds `atmos` to `EXPORT_PROFILE` (geyser, ringisles, sedesert, the Throne's stations).
