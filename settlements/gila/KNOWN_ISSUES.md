# settlements/gila: known issues

`build.py` prints the open ones (`- [ ]`) after every build.

## Scope

- [ ] **No savanna flora yet (step G6):** the ground wears `ground.savanna.litter`, `ground.salt`, `ground.tilled` and `ground.dirt` on `KGROUND`, bare of `biomes/rift` trees and grass until the savanna species pass (PLAN.md section 1).
- [ ] **No Lizardman figures yet:** the six castes are housed and counted in `GL_REC` and `GL_SITE.people`, and the beasts (`frilled`, `burden`) animate with life records, but citizen walkers wait for the Lizardman body mods on `core/charactermodels` (`kits/lizardmen/KNOWN_ISSUES.md`).
- [ ] **Baked scale-model heightfield:** `build.py` bakes `h.png` bicubic round the pin into `gen/69g-gl-ground.js`; once the Lizardmen's country is cut as an open-world region, Gila moves onto `core/world`'s `WORLD.H`.
