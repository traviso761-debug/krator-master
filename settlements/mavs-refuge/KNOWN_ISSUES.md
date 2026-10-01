# Mav's Refuge — known issues
build.py prints every unticked item on each build. Claude: when Travis asks for changes to this world,
remind him of this list first. Tick `[x]` and date an item when it is fixed.

- [x] Flyers: wingtips clip the gallery posts on landing (84-flyers; Girder's version lands on the beam outside the post line — port it)
  2026-10-01: ported. Roosts are centred between two gallery posts (30-layout); the landing lips are longer (main 3.0-3.6 m, hangar 3.6-4.2, satellite 2.2; 56-levels stores Ro.lipL); quetzals/archaeopteryx/dragonflies touch down on the lip ~2.5-3 m outside the post line, fold first, then walk in, and walk back out to the lip end to launch. Bats still fly in to hang from the ceiling, with shallow beats on the last 16 m (as Girder).
- [x] Flyers: circuit flyers never land (fixed in Girder's 84-flyers with peel-off timers — port it)
  2026-10-01: ported flyPursue / flyTryPeel / flyJoinRoute. Each circuit flyer gets a lap timer (Rookery circuits 150-420 s, patrols 260-700 s), then peels off onto a fresh arrival route (Rookery flyers home to the Rookery when it has room); perched beasts launch straight onto a short-handed circuit to refill it (one per circuit at night). Formations dissolve as flyers rotate, as in Girder.
- [x] Flyers: bats return mostly at dawn (fixed in Girder with sim-time hunt timers — port it)
  2026-10-01: ported. A bat launched in the evening or at night is owed a return 90-540 sim seconds later (flyBatDue); those still out at daybreak follow within ~2 minutes. The hour weights no longer favour bat arrivals at dawn. _flyers.batReturnHours / batsOut report it.
- [x] Flyers: rider lance stays on the saddle when the rider dismounts
  2026-10-01: the lance bone is parented to the rider's translate bone instead of the saddle, so it goes with him when he stands beside the beast and is hidden with him when only the saddle is left (same one-line fix made in Girder's copy of the model).
- [ ] Gates: carved facades stand up to ~1.5 m proud where the bark relief dips (56-levels vs 60-trees)
- [ ] Jungle pass is ~2x its triangle budget (905k) — trim if frame rate suffers (62-jungle)
- [x] Rainbow bark is too loud (Girder desaturates bark2 by 30% at runtime in 60-trees — port it)
  2026-10-01: ported: the bark2 colour texture is pulled 30 % toward its luminance at load, and the far Prism gum trunks' palette tints 45 %.
- [x] Night at 21:00 is too bright under the gas giant (21-sky / 82-daynight)
  2026-10-01: night floors cut (hemi 0.30 -> 0.07, ambient 0.22 -> 0.035, planetshine fill 0.15/0.08 -> 0.07/0.03) and the night fill turned cool blue-grey instead of a dimmed day colour (82-daynight); the giant's key 0.44 -> 0.18 x phase (21-sky); a full giant now cuts the lamps by 8 % instead of 28 %, so lamps, windows and fires are the main light. An eclipse keeps its own fill (DN_ECL_*) so it still reads as twilight. 21:00 lights: hemi 0.53 -> ~0.17, ambient 0.38 -> ~0.09, key 0.45 -> ~0.19. Same code in both builds.
- [x] verify.py --sweep is meaningless (merged meshes have city-wide bounding boxes) — fixed Oct 2026: it samples the flyers' legs against the REGISTER volumes, trunkR trunks, bridge segments and the ground, with two control legs that must hit (61 legs clear)

## Level of detail (core/lod)

The page takes the shared LOD from `core/lod/` (read `core/lod/README.md`): `build.py` adds `09-lod.js` and
`97-lod-auto.js` to the fragment list, and 97 applies it to the finished scene. Big merged meshes are cut into chunks
that switch to clustered proxies with distance and are drawn combined (one draw per level in view); instanced sets keep
one draw call, drop their smallest instances by screen size and switch detailed shapes to a simplified version far off.
The originals stay the raycast targets, so the inspector and `_api` see full detail (checked: the inspector names the
same thing at nine screen points per view with LOD on and off). The panel (`l`, `measure`) reads draw calls and
triangles; `LOD.enabled=false` or `?lod=0` puts back the exact scene. `verify.py --assert` passes with LOD on.

Left out by default: the life layer (`userData.life`) and the flyers (`userData.flyers`, interleaved instance data).

Measured 2026-10-01, 1000x640, SwiftShader (`LOD.flush()` then `LOD.measure()`: one render of the main scene, so
calls and triangles as three.js counts them; sky passes not included):

| View | LOD off: calls / triangles | LOD on: calls / triangles |
|---|---|---|
| Opening | 57 / 4.08 M | 66 / 3.50 M |
| Overview | 57 / 4.08 M | 57 / 2.83 M |
| Forest floor | 57 / 4.08 M | 65 / 3.59 M |

LOD adds up to 9 draw calls (simplified far versions of the canopy sets and the levels of the split meshes); verify's
opening view reads 66, inside the budget.
