# Arcoindian III — Visual Delta Log & Rubric (`VISUAL-BAR.md`)

## 1. Reference Images & Acceptance Frames

| Reference | Acceptance Frame (`91z-views.js`) | Subject |
|---|---|---|
| `reference/ref1-vault-terraces.jpg` | `The barrel vault and flank arcades`, `The stepped arch pavilions and stair` | Warm sand-travertine barrel-vaulted crown with dark smoked-glass arch, tall narrow round-headed flank arcades, stepped semicircular arches with nested post-and-lintel pavilions, and cascading flank stairs |
| `reference/ref2-fluted-towers.jpg` | `The fluted towers and skybridges`, `The high forest arch and crowns` | Clustered fluted chalice towers with dense vertical organic ribs, swept curved-glass scoops with hanging gardens, circular rooftop woodland crowns, and flared-ribbed parabolic arch skybridges |
| `reference/ref3-terracotta-oculus-pools.jpg` | `The emerald pool court`, `The oculus loggia and skylight` | Sun-baked rose-terracotta concrete walls with stacked circular moon-gate oculi over open semicircular ground arches, cantilevered slab with circular soffit skylight, pier-mounted circular sconces, trailing vines, and paired emerald-green mosaic plunge pools |

---

## 2. Delta Loop (Round 1 -> Round 2)

1. ~~**Semicircular spine arches, flank arcades, and terracotta ground arches filled by Earcut**~~ *(Fixed in Round 2 — geometry)*: `THREE.Shape` outer contours ran CCW alongside CCW `Path` holes, causing r128 Earcut to fill the arch voids. Walked bottom-open semicircular arches directly along the outer shape perimeter (`absarc(..., Math.PI, 0, true)`) and switched closed flank-arcade holes to CW winding. Every arch and flank arcade is now cleanly open into recessed shadowed vaults.
2. ~~**Bright cyan `MAT.glass` on the Barrel Vault, Chalice Scoops, and Moon-Gate Backing**~~ *(Fixed in Round 2 — materials)*: Added dedicated `MAT.a3SmokeGlass` (`MeshStandardMaterial`, deep slate-charcoal `#233038`, roughness `0.18`, metalness `0.38`) matching the dark architectural glazing in Refs 1, 2, and 3.
3. ~~**Blocky stepped horizontal bars framing the Fluted Tower chalice scoops**~~ *(Fixed in Round 2 — geometry)*: Replaced horizontal step bars with smooth swept elliptical chalice collar segments (`28` segments around each parabolic scoop contour) and increased vertical organic fluting from `32` to `44` slender ribs per tower.
4. ~~**Court sconces aligned to oculus centers instead of terracotta piers, and sparse single-stem vines**~~ *(Fixed in Round 2 — facade detail)*: Repositioned glowing circular ring sconces onto the pier midpoints (`[-22.5, 0, 22.5]`) between ground arches and replaced single vine rods with multi-strand hanging vine curtains (`5` varied strands per oculus sill).
5. ~~**`KRUINS` floating drum wreck (`arco3.wreck.drum.0` `3.7 m` up on Quay drop-off)**~~ *(Fixed in Round 2 — ruin physics)*: Seated wrecks on the west shore bench (`x = -295..-235`, clear of the `y = 14 m` Quay edge) using exact vertex-transformed world AABBs matching `KRUINS.pieces`, and skipped river boats (`a3Boat`) in `KRUINS.watch`. `ruins` invariant now passes with `0 floating; 4 wrecks on the ground, 0 lying wrong`.
6. **Barrel-vault interior botanical trees use kit billboard/crown clusters** *(Godot / biome flora phase)*: Preview uses kit tree crowns inside the conservatory; Godot open-world port swaps to full `core/biome` specimen trees.
7. **Canyon cliff rock uses vertex-stratified procedural sandstone** *(Textures / Godot shader phase)*: Preview synthesizes stratified red-ochre canyon walls in `8au1`; Godot port binds triplanar canyon cliff detail normal/albedo sets.
8. **Water spray mist at the base of the `238 m` wild cascade** *(Godot particle phase)*: `WATER.drawFall` renders scrolling whitewater ribbons and foam pool rings; volumetric spray mist belongs to Godot particles.
9. **Ambient occlusion inside deep moon-gate loggias** *(Godot SDFGI/SSAO phase)*: Preview approximates loggia depth with recessed dark soffits and shadowed interior slabs; Godot adds real-time SDFGI/SSIL bounce.
10. **Animated figures on stairs and river boats** *(Host crowd phase)*: Boats and habitable zones are placed and tagged; animated citizens come from `core/charactermodels` when hosted in a settlement.

---

## 3. Rubric (`VISUAL-BAR.md` Section 7)

| Row | Score | Notes & Next +2 Change |
|---|---:|---|
| Terrain and geology | 7 |Horseshoe canyon niche (`540 m` rim), stratified talus benches, and West Brow rockfall scar give clear structural reason for siting; triplanar rock detail maps in Godot would raise to 9. |
| Buildings up close | 8 | Open semicircular vaults, nested post-and-lintel pavilions, 44-rib fluted towers, swept scoop collars, pier sconces, soffit skylights, and multi-strand vines inside 10 m; adding catalog balcony furniture (`KFURN`) would raise to 9+. |
| Tree and plant fidelity | 7 | Rooftop woodland groves, terrace rows, scoop gardens, and trailing oculus vines vary scale and clumping via `KRAND`; swapping in multi-species `core/biome` canopies would raise by 2. |
| Variety and clumping | 8 | Intact vs ruined states (`d=0, 1`) differentiate wet East Sanctuary groves from dry breached West courts (`ARCO3.dress` driven by spring state). |
| Ground detail density | 7 | Quay arcades, piers, stepped basins, talus boulders, and seated ruin wrecks break up shore margins; near-field cobble/litter scatter would raise by 2. |
| Light transport | 8 | `ATMOS` sky/hemisphere fill, warm amber night interiors across drums/pavilions/courts, and smoked glass avoid flat grey shadows. |
| Atmosphere and sky | 8 | Standard `ATMOS` sky dome and skylight reflections shift cleanly between golden-hour day and night views. |
| Distance fidelity | 8 | `528 m` vertical silhouette, 8 chalice crowns, and 7 parabolic bridges read distinctly at 1.5 km across the gorge. |
| Water | 8 | `core/water` gorge river with flow, 24 emerald mosaic terrace pools, spring sluices, and `238 m` ruin cascade. |
| Motion | 7 | Animated river waves and scrolling waterfall sheets via `WATER`; adding wind-sway vine shaders and ferry motion would raise by 2. |
| Colour script and composition | 9 | Unified sun-baked sand-travertine/sandstone stone family (`0xcfbba2` spine, `0xcab398` fluted ribs & bridges, `0xc7ad93` board-formed moon-gate courts) accented by dark smoked glass, 24 emerald pools, and rooftop groves. |
| Performance | 9 | `57` draw calls (`64` max) and `251.6k / 700k` tris (`d=0`), `244.2k / 700k` tris (`d=1`), well inside `mega` budgets. |
