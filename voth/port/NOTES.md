# Notes

## Round 1 — the foundation (seed block 20000-20099)

**Engine.** Shared ancients fragments copied byte-identical (see README for
the list and commit); `90-scene`, `91-probe`, `92-camera`, `build.py`,
`verify.py`, `run.sh` adapted. Port fragments renumbered 70-74 because the
kit items use `MAT.timber` (defined in 69); anything numbered below 70 that
names a salvage material fails at load.

**Terrain.** Tensor grid (x lines, z lines) with base 10 m spacing near the
port, 12 %/line growth to 90 m, held to 3.5 km, then 35 %/line to the
horizon; exact lines on every rect stamp edge and 0.3/1.5/5 m either side.
Minmod normals so plateaus stay flat-shaded to their edge; chunks of 96
columns for culling. Colours are computed in an sRGB-ish table and raised to
1.9 into the linear vertex colours (the first pass was washed-out because the
table was used as linear). Fine colour noise fades with cell size: without
that, long thin far-field cells aliased noise into radial streaks.

**Stamp boundary rule.** "Interior later-wins, boundary lowest-of-probes"
was chosen after walking the cases: quay line (flat apron + dig berth ->
cliff inside the wall), flush neighbours (two flats -> flush), stepped
neighbours (dig vs flat across the x edge -> cliff inside the protruding
segment's side wall), mole root (needs a 1 m overlap), pier mole side (cliff
inside the mole wall).

**Sea.** First version: runs of wet cells per z-row. Showed hairline cracks
across open water. Cause was actually the normal map: one of its wave terms
had a non-integer frequency, so every 46 m tile edge was a seam. Fixed both:
integer-frequency waves, and the sea is now one sheet (a dry stamp still
splits it into rows). Depth reads through an **underwater fade** injected into
every MAT MeshStandardMaterial (below y=0 things fade to deep water) rather
than any depth texture - works under SwiftShader, one uniform swings at night.

**Probe.** `pbFlush` merges a segment's walls into one mesh per material, so
the ancients' bbox-corner sampling found registered volumes (a hulk) empty.
The probe now also samples up to 3000 vertices per mesh.

**Vessel hook** proven with a throwaway box vessel (registered, built in the
segment target moored off three quays, and placed by the pier in the showcase
slip basin), then removed. `portPlaceVessel` flushes the host's batch first -
the first try charged the pier's walls to the vessel.

**Anchors.** `quay` (60 + 40) and `pier` (80 + 420): measured 24-93 k
triangles per decay, 45-115 draw calls per view, showcase 0.82 M triangles
with env (terrain, sea, 3 k natural trees) 0.52 M.
