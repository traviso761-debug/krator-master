# Locus world — known issues (Sep 2026)

## core/host (2026-10-15)

- [x] (2026-10-15) Locus on core/host (ROADMAP.md section 10, stage 3 step 5; `core/host/README.md`; Girder is the worked example),
      all four pages (`locus.html`, `locus-kit.html`, `abyss-kit.html`, `locus-plants.html`): the camera, loop, panel and probe are
      the host's (`build.py` takes `khost.FULL`); `80-camera.js` keeps a ctl shim, setView (CAM_FREE for a view below ground, through
      the host's `clampCam`), VIEWS, the world clock (LCLOCK) and the page's frame (`camFrame`, `camDraw`); `98-start.js` is the take.
      Every REGISTER()ed site is a core/tags record (45-kit.js: the buildings as turned boxes from 53-assets.js, bridges, flora; a
      catalog piece keeps core/furnish's record), and with ?interiors=1 every interior piece too (66-locus-furnish.js, ids `ixf_`).
      The inspector (I, click), marks (P), pictures (629 catalog pieces), the editor (B, the world page: pieces placed live, the
      page's own moved or removed on reload, `66-locus-furnish.js locfVetoed`) and the cutaway (X: every building, storeys of about
      3.4 m) are new. Proof: `verify.py --assert` every invariant PASS on the three committed pages, counters identical to the old
      pages', draw calls the same (179 / 94 / 110); the scene census (LOD flushed) of `locus-kit` and `abyss-kit` identical at four
      views, of `locus` at three views within the old page's own run-to-run noise (only the LOD `Mesh` total moves, as between two
      old runs); `core/furnish/fingerprint.py locus locus-kit abyss-kit` the same as before the change for all six (interiors off
      and on; only the tags' record counts grow); `audit().unknown` 0 on all four; an edits.json of three ops applied on load
      (one batched piece vetoed, one moved and drawn on its own, one added). `fingerprint.json` itself was already stale for these
      pages before the change (not rewritten).
- [x] (2026-10-15) Keys are the host's one keymap: F walks (the host's walker; the page had none), G flies to the pin, I is the
      hover tip (the old Inspector button), P marks, B edits, X cuts. On a kit sheet P still steps back (89-sheetui.js; marks stay on
      their button) and there is no editor (a sheet has no edits log). M is the page's own minimap (88b-locus-minimap.js on
      core/minimap's KMAP, which colours footprints by family and which Mungo extends): the host's minimap is not mounted; with the
      editor on and a piece selected M also starts a move. - 2026-10-20: status note, nothing open.
- [ ] (2026-10-15) The cutaway's storeys are a guess (the asset's height in steps of about 3.4 m): the assets do not record their floors.
- [ ] (2026-10-15) Mungo and Verge read Locus's fragments by name: Mungo takes 45-kit, 53-assets, 66-locus-furnish, 86-inspect and
      98-start (it moved onto core/host in the next commit); Verge's YKIT bundle takes 45-kit and 53-assets, whose REGISTER leaves
      core/tags alone when TARGET is 'verge' (rebuilt: `verify.py --assert` as before).

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
- [ ] The canonical eastern-abyss biome (`core/biome` + `biomes/eastabyss`, since 2026-10-05) has six species the old port lacked (seal-tree, cordaite, seed fern, araucaria, beard oak, water palm): about +3 M triangles headless (Locus 6.2 M -> 9.0 M, Mungo 6.0 M -> 7.8 M, which reads these fragments), and the triangle budget (`05-palette.js`, shared) went from 7 M to 10 M. The town trees are grown after the biome's passes (`EASTABYSS.make` / `grow`, 69z), so they no longer take a keep-clear entry the passes would avoid; the town is masked out of the passes anyway. If the frame rate on a weak GPU suffers, thin the new species in the kit or pass a lower `quality` in 69z.
- [x] The open lake shades with `core/atmos`'s wave field (`90-atmos-host.js`, 75-terrain `waterOpenAt`) but is not displaced: a swell would rise through the reed decks and jetties. The sky's light (`ATMOS.skylight`) is not taken: it lights MeshStandardMaterial only and this is a Lambert world. — 2026-10-13: the open lake is core/water's (`90w-lake.js`, Locus's, read by Mungo): displaced by a calm share of the wave field (at most ~6 cm, so the decks and jetties keep their waterlines), the sky's light given to the lake only. The river, the channels and the pools stay on 75-terrain's sheet (core/water's flow and still kinds, later phases); the life layer's boats ride the lake (`lakeHeave`).
- [ ] The lake and the sheet meet on the shoreline through a baked mask (`LAKE_MASK`, 8 m cells, linear across the line): both shaders split on the same texture, but the water is displaced a few centimetres and the sheet is not, so at a grazing angle the line can show as a hairline where a channel crosses the shore. Phase 2's shore field (core/water) replaces the mask.
- [x] The sky panel's own clock controls drive the world clock now (`core/clock`): its hour slider moves the clock, its 0x/1x/60x/600x row sets the day's speed while time runs; Run time / Hold time is the button. - 2026-10-20: status note, nothing open.
- [ ] The life layer (84-life.js) is Locus's own, not `core/simulation`: it reads the world clock's hour but keeps its own schedules, places and motion. Moving it onto SIM is a port of its own (Mungo is the worked example: `78b-mungo-world.js`, `84-mungo-life.js`, `world/*.json`). Locus's clock is held by default now (it ran a 2-minute day of its own): its life layer stands at 10:00 until Run time.
- [ ] Fauna ignores the life layer (flamingos don't flush from boats; emus don't avoid riders).
- [ ] The kit's own open items (LOCUS-KIT-KNOWN-ISSUES.md) still stand, except the chapterhouse wall/fountain, now fixed.
- [ ] Kit furniture is the catalog's now (API.md "Furniture"); what is left drawn is listed under "Furniture from the catalog" in ABYSS-KIT-KNOWN-ISSUES.md and LOCUS-KIT-KNOWN-ISSUES.md. (The interior-set variant gaps are closed: every kit variant has its own item or a skip.)

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
- [ ] (2026-10-06) Library adoption, first pass: 22 families (materials.json: Yuni's rows for the shared families; new rows for canvas, corrugate, tinmirror, rubble and the sail band, whose tint means are estimates). glass, leafy, dark and glowmat stay procedural. Mungo reads Locus's 45-kit and 47-texture but has no pack: it stays procedural until it gets one. Judged in three views: brightness and colour match the procedural page.

## Voth census trades (2026-10-19)

The table is `src/67-lo-trades.js` (`LO_TRADES`, on the world page; checked by `tools/check_trades.py` and `verify.py --assert` as `voth-trades`). 21 trades carried, 5 partly, 9 gaps, 9 na (no sea, no embassies, no beetles or elephant bugs, no mushroom cellars).
- [ ] Gaps (a later session builds them): bakery, butcher, brewhouse or date-wine press, tannery, wayside shrine, house of healing, date-palm orchard, quarry, dairy.
- [ ] Partly carried: shipwrights (sailmaker only; no boatyard), priests and undertakers (temple; no funerary court), miners (pumpjacks for oil; no ore mine head), granary keepers and millers (granaries; no mill), swineherds and duck keepers (animal pen; no duck coops).
