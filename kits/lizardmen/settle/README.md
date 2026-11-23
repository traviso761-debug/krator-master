# kits/lizardmen/settle: the shared Lizardmen town builder (parked, never built)

Started on `claude/lizardmen-village-d3035c` for Tuatara, Komodo, Iguana and the Tubes, then parked (2026-11-17) when the owner
said "don't have to build them all yet but let's get them in the simulation as a presence; next step, implement raiding".
**Never built or tested.** Gila's own fragments (`settlements/gila/src/89g`, `90g`, `99-m`, `verify.py`) made general. It
sat in the session notes until 2026-11-17, when it was brought here with the four towns' plans so a builder (Gemini) can
follow them; one fix on the way: `lzv.py`'s `ROOT` climbed two folders (to `kits/`), now three (the repo).

**`GUIDE.md` is how to use it** (step S0 revives it); each town's `settlements/<town>/PLAN.md` is what to build.

| File | What |
|---|---|
| `82-lzv-site.js` | `LZV_SITE` from a town's `LZV_SPEC` and `LZV_GROUND` (the spiral, the ley line, wells, court, mouth, country, hamlet, census) |
| `90w-lzv-world.js` | the ground on `KGROUND` (layers from the town's pack), the water on `core/water`, plinths, views |
| `99-m-lzv-probe.js` | `window._lzv` for the verify |
| `lzv.py` | the build: bakes `LZV_GROUND`, seals `core/city`, runs `kits/lizardmen/build.py --settlement` |
| `lzv_verify.py` | the shared GPU verify, expectations from `LZV_SPEC.expect` |
| `lz-tune-checkTown.js` | `LZ_TUNE.checkTown(rec)`: a town's records held to the tune (to paste into `lz-tune.js`) |
| `towns_plan.py` | the four towns' proposed specs and sheets (`settlements/<town>/spec.json`, `sheets/`) |

No page lists these files yet, so nothing in the repo builds from them.
