# Locus world — known issues (Sep 2026)

## Queued by Travis (done 2026-10-01)

- [x] Some roads need bridges (or causeways) over the marsh pools they currently run straight across. 2026-10-01: `68c-locus-crossings.js` finds every street-graph edge under the water plane and builds 8 plank bridges on piles (<= 30 m of water) and 4 earth causeways with 8 stone-headed culverts (338 m of open water in all, incl. the SE highway's three pool crossings); the deck is published through `bridgeDeckAt`/`XING_AT`, so walkers, riders, carts and the highway ribbons stand on it (NAV probe: 16 walk edges cross, 0 wet gaps, 0 route failures).
- [x] Salt-rice farming: five times more paddies than the present three farms. 2026-10-01: new asset `farm_saltrice_paddies` (8 paddies, feed channel, shelter, scarecrow) and layout step 7b lays nine blocks on low dry ground along the canal and river, off roads and sites, levelled, each with a lane: 18 -> 90 paddies. Field-detail rice (`salt_rice_stand` variants 2-3) keeps the scene at 6.88 M triangles (budget 7 M). Farmers 12 -> 30 work them (POI `paddy`, never a home).
- [x] The sun and the planet's ring still render on top of the painted horizon cliff (the abyss shelf) instead of behind it. 2026-10-01: `20-stage.js` paints a silhouette mask of the shelf's skyline; `21-sky.js` redraws the dome through it (`skyFront`, alphaMap, same shader/tint, renderOrder 50) after the sun, giant, ring, moons and stars, so the cliff occludes them. +1 draw call.
- [x] Electrify the town: carry the generator house's lines out to the town (poles, wiring, electric lamps and lit windows). 2026-10-01: `71g-locus-grid.js` runs a feeder from the generator's own pole to 210 timber poles along the ring, the avenues and the inner streets (spanning tree, 210 two-wire catenary spans, 164 service drops), each with an electric bracket lamp; `72-lights.js` drops oil posts on electrified streets and wires 1,235 windows (cool panes, later off-times). All kit primitives in existing families: no new draw calls.

## Other open items

- [x] Night at 21:00 is too bright under the gas giant (21-sky / 82-daynight). 2026-10-01: the Mav's Refuge / Girder fix, ported. Night floors hemi 0.30 -> 0.07, ambient 0.22 -> 0.035, planetshine fill 0.15/0.08 -> 0.07/0.03; a separate eclipse fill (DN_ECL_HEMI/AMB 0.16/0.10); the night fill lerps to a deep wet blue-grey sky (0x566a8c) over dark silt (0x221f1c); the giant's key 0.44 -> 0.18 x phase (SKY_SHINE_KEY); a full giant cuts the lamps by 8 % instead of 28 % (DN_SHINE_NL_CUT 0.28 -> 0.08), so the electric street lamps and wired windows are the main light. 21:00 under a full giant: hemi ~0.52 -> 0.161, ambient ~0.37 -> 0.086, key ~0.51 -> 0.209, nightK 0.72 -> 0.92. Noon unchanged.
- [ ] People are plain capsules (body, head, pack, hat) with no limbs; walking is a bob, not a gait.
- [ ] Caravan pack-lizards trail their leader on a straight line behind him, so on a bend the string cuts the corner.
- [ ] The riders' route is a 12 m grid path smoothed once; out in the marsh it can wade a pool edge that a road would skirt.
- [ ] Boats string-pull over the 12 m water grid; in the narrow distributaries a hull can brush the bank for a moment (a bank check nudges it back).
- [ ] Moored boats all sit on the jetty's two sides at fixed slots; with 14 boats over 3 jetties the outer slots run past the jetty head.
- [ ] Geomancers assigned to far pumpjacks (up to ~2 km) spend most of their shift walking the track.
- [ ] Town trees can overhang a roof edge: sites keep the TRUNK and a ring at crown radius (≤ 4 m) clear of the footprint raster, but boughs are not tested against buildings (the biome's 3D obstacle list is empty in Locus).
- [ ] Farmers whose home pool falls back to the farm itself stand at the farm gate overnight (now 30 farmers over 3 farmhouses + the poor quarter; the paddy blocks are never homes).
- [ ] Pool crossings: causeway pieces meet at a wet node on a round pad, so a sharp bend shows a lobe; culvert headwalls are small and read only close up.
- [ ] Town grid: poles stand one per street edge, so spacing follows the edge lengths (17-45 m); spans may cross a yard corner at a bend; service drops end at the house's nearest wall point, not a fitted bracket.
- [ ] Fauna ignores the life layer (flamingos don't flush from boats; emus don't avoid riders).
- [ ] The kit's own open items (LOCUS-KIT-KNOWN-ISSUES.md) still stand, except the chapterhouse wall/fountain, now fixed.

## Level of detail (core/lod)

The page takes the shared LOD from `core/lod/` (read `core/lod/README.md`): `build.py` adds `09-lod.js` and
`97-lod-auto.js` to the fragment list, and 97 applies it to the finished scene. Big merged meshes are cut into chunks
that switch to clustered proxies with distance and are drawn combined (one draw per level in view); instanced sets keep
one draw call, drop their smallest instances by screen size and switch detailed shapes to a simplified version far off.
The originals stay the raycast targets, so the inspector and `_api` see full detail (checked: the inspector names the
same thing at nine screen points per view with LOD on and off). The panel (`l`, `measure`) reads draw calls and
triangles; `LOD.enabled=false` or `?lod=0` puts back the exact scene. `verify.py --assert` passes with LOD on.

Left out by default: the life layer and the fauna (dynamic instance buffers). The town grid's lamps are kit instances
whose night glow is a material uniform, so they need nothing.

Measured 2026-10-01, 1000x640, SwiftShader (`LOD.flush()` then `LOD.measure()`: one render of the main scene, so
calls and triangles as three.js counts them; sky passes not included):

| View | LOD off: calls / triangles | LOD on: calls / triangles |
|---|---|---|
| Opening | 158 / 6.87 M | 136 / 5.73 M |
| Overview | 153 / 6.84 M | 116 / 5.43 M |
| Street level | 163 / 6.87 M | 168 / 6.39 M |

The gain is modest: most of Locus is dense instanced flora and stone close to every view.
