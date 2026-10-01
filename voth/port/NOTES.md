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

**Width change (user, mid-build).** W is per segment: anchors 220, new
segments <= 110 (`PORT.WMAX_NEW`). `quay` got a 110 m twin, `quay110`, from
the same builder (content chosen by `opt.W`), which is now the plain
neighbour in the dev targets. `portSideClose`/`portEdgeStamps` default to the
segment's own W (the scene sets `PORT_CUR` round each build). The showcase's
offset table was re-searched so neighbours never differ by more than 40 m:
the old one put a 110 m quay 80 m proud of a 220 m one, clear of its apron.

**Anchors.** `quay` (60 + 40) and `pier` (80 + 420): measured 24-93 k
triangles per decay, 45-115 draw calls per view, showcase 0.82 M triangles
with env (terrain, sea, 3 k natural trees) 0.52 M.

## Round 3 — shared code (foundation owner, seed block 20000-20099)

**Inspector.** "unregistered mesh" is gone: `mesh()` and `kput()` are wrapped
in `70` to tag every mesh and instance with the stat key being built and a
part name (`portPart`); the scene records `PORT_OWN[stat]` (segment/vessel
name, decay, host) and hands each InstancedMesh its per-instance owner list
(`instanceId` -> item). The click names the REGISTER volume round the hit
(preferring one of the same owner), else "Owner (decay) — near <nearest
volume of that owner>" and the part / kit item or material. The sea sheet is
looked through; terrain is named by the stamp that shaped it. REGISTER
applies KXF (vessels' own pre-transformed `C.reg` passes `xf:false`).

**Floating shacks.** Cause: the reclaimed haven's two lighthouse beams
(`hbBeams`, 90 m additive cones, invisible by day) were sampled by the kit's
`repairPass`, which walks every mesh: shanties, patches and planters were
stuck along 90 m of invisible cone ~30 m up. `portRepairPass` replaces it
for the port: visible opaque standard meshes only, no noRepair/probeSkip
subtrees, nothing under y 0.4, no patches on thin members, no shanties on
open deck/paving (only raised flat faces >= 3 m), counts scaled by sampled
area not the bounding box.

**Segment boundaries.** `b` / button / 8th preset element / `_api.setBounds`.

**Grid placement.** `place:'land'|'sea'`, `nb` N/S/E/W from footprints
(`portLinkNb`, run by the scene on every layout), `portBehind`, `portOff`,
`portMoor`, `portSideOpen`, `portBlockStamps`, `portBlockClose`; the pier
registers `seaEnd` and leaves its head end open (no fascia, rail or
fenders) where a platform abuts; the platform (spYard) builds the 8 m link
span. Real land blocks (lbAuthority, lbStores, lbTanks) are placed. Showcase: land row behind each run's middle, platform chain
of two off the pier. `targets/harbour`: Long-Beach-like composition. Tested
with throwaway `tmpLand` / `tmpSea` blocks (deleted).

**Fleet.** Every vessel in every decay of the showcase: the giant in the
pier's slip, the drone carrier in the deep-water berth (the only berth it
fits), the Panamax and feeder moored along the platform chain (or off the
pier head), the submarine in its pen. `portVesselFor` honours `opt.fleet` /
`opt.vessel`; `PORT_VPLACED` records every placement; the showcase has a
preset per vessel per decay and 'Reclaimed drone carrier — flight deck'.

**Sea and dry pits.** ddSeaFix's union-cut sea folded into
`portBuildTerrain` (and removed from 82-dd-dock/82-dd-shed); the underwater
fade is masked inside `dry` stamps (up to 16 rects, a uniform array), so dry
pits can use the normal kit.

