# The spike on a real machine: what to do and what to look at

Everything below ran tonight (2026-10-05) in a cloud container: Godot 4.5 headless, plus the Compatibility renderer on
a software GPU. What that could not show is the **look on a real GPU in Forward+**, the **editor's import route**, and
**speed**. Those are tomorrow's. Write what you find straight into `GODOT-PLAN.md`, "The spike: first findings"
(a line per finding, struck through or ticked when fixed).

## 0. Before you start (2 minutes)

- [ ] Pull the branch. Godot 4.3 or later (4.5 is what was tested).
- [ ] `godot --headless --path godot --script res://tests/rand/krand_test.gd` prints `all passed` (it did here: the
      first bit-exactness proof inside Godot).
- [ ] `godot --headless --path godot --script res://tests/atmos/atmos_test.gd` prints `all passed` (the weather port).
- [ ] `godot --headless --path godot -- --check` lists five cases with no `SCRIPT ERROR`.

## 1. hyperjungle (key 1): the biome export, foliage

- [ ] Leaf cards cut out (not solid triangles). That was broken by the exporter until tonight's fix (DataTexture atlases
      had no image); if they are solid, the data predates the fix.
- [ ] Leaves the right way up: compare a clump against the browser (`biomes/hyperjungle/dist/hyperjungle.html`). Canvas
      textures flip v, DataTextures do not (`flipY` on each texture record).
- [ ] Wind: cards sway and lean downwind together. `T` (time-lapse) does not change sway; `P` freezes it.
- [ ] The prism gum's iridescence (green to the sun, the second colour away from it and at grazing angles).
- [ ] Colours against the browser: too pale means a colour-space mistake (the biome export is linear, the atmosphere's
      sRGB; material colours are read as sRGB here, an assumption).
- [ ] fps with the whole tile in view (Forward+). Then F2 and read the gap list.

## 2. rift (key 2): LOD chunks and hooked materials

- [ ] Fly 1 km away: the chunked meshes should fade out near their range (they are placed at the chunk centre with the
      range widened by the chunk half-diagonal). Popping or holes: note where.
- [ ] Iridescent bark shifts tint with the view angle (`bark.gdshader` mode 1). Fly 1 km out: the far impostors
      should keep the valley's colours (mode 3).

## 3. girder (key 3): glTF, the friend's route

- [ ] Library textures on the hall: thatch, shingle, timber. Compare with `settlements/girder/girder.html` up close.
- [ ] Stalls and furniture now keep their colours (an exporter bug, fixed); only the people come in near-white
      (the life layer's attributes). Instanced pieces arrive as MultiMeshes (`krator/gltf_instancing.gd`).
- [ ] The library surfaces (hall roof, timber, planks, rope, cane, rock, ground) are rebuilt
      from Girder's pack with the break-up (`krator/kmat.gd`): compare their tiling with the browser.
- [ ] Copy `data/girder/region.glb` to a new folder `godot/editor_import/` (the editor skips `data/`: `data/.gdignore`;
      expect the import to take a long while with LOD generation on, so try it off too) and open it from the FileSystem dock (the Krator glTF plugin is on, so its instances
      should import as MultiMeshes too), open it, and look at the Import dock: is there an
      option to import extras as metadata in your version? Does the editor import differ from the runtime load?
- [ ] **Ask your friend** how the Voth kit got into Godot (GODOT-PLAN.md section 1). If it was `GLTFExporter`, this case
      is that route; if it was something else (Blender, an OBJ export), try it on Girder and write down the difference.

## 4. iziz (key 4): the atmosphere and the Atmos autoload

- [ ] It opens at 19:30: lamps and halos lit, braziers flickering, searchlights sweeping, smoke rising from chimneys.
- [ ] `[` `]` across dusk (17:00 to 19:00) and dawn: lights come on and go off by their hours; the sky and sun dim.
- [ ] Fog banks: Forward+ only (FogVolume). Turn on volumetric fog in the WorldEnvironment if they do not show; note it.
- [ ] Weather: `F3` cycles it (or `-- --case=iziz --weather=storm`): rain streaks ride the camera and slant
      with the wind, fog thickens, a bolt flashes every 5 to 14 s in a storm. Is the rain dense enough on a real GPU?
- [ ] Halo brightness under the Filmic tonemapper (the gain is 0.6 x the three.js value here, a guess).
- [ ] The city ground's texture and the five magenta stand-ins (ShaderMaterials: water, sky, glow) are expected.

## 5. yuni (key 5): records only

- [ ] Click through the scene tree: every `Building_*` node, light and wall carries its record as metadata
      (Inspector, Metadata). Doors and windows are MultiMeshes with a side table (`records` meta).
- [ ] The compound `bld_00005`: rooms, walls (solid: openings are not cut), furniture markers, 7 navigation links.
- [ ] Optional: drop a `NavigationAgent3D` in a room and ask it for a path to another room through a door link.

## 6. Then

- [ ] Run `--check` again and paste `spike-report.json`'s gap list into GODOT-PLAN.md if anything new turned up.
- [ ] Decide what M4 (the first tile with materials and tags) needs first. Tonight's list suggests: tags and ids on
      the biome records, the kit hooks as core material kinds, a terrain export, and fauna animation, in that order.

## 7. The perf table (ROADMAP.md section 11, item 4): Forward+ on the real GPU

The Godot tests prove parity, not speed, and the fps in findings 15 to 17 were read by eye. `PERF.md` in this folder is
the fixed table; the copy committed so far was written headless (its header says so) and its numbers mean nothing.

- [ ] With the project on Forward+ (the default), close other GPU work and run
      `godot --path godot --script res://tests/perf/perf_capture.gd -- --cases=world-sedesert,world-iziz`
      (README.md, "The perf capture"). It opens a 1600x900 window with vsync off, visits four poses per case and quits;
      about a minute. Do not move the mouse over the window while it runs (the fly camera listens).
- [ ] Check `PERF.md`'s header reads `forward_plus vulkan` and names your GPU, then commit `PERF.md` and the
      `perf-<case>.json` beside `spike-report.json`.
- [ ] Paste the two tables into `GODOT-PLAN.md`, "The spike: first findings" (a finding of their own, dated), with a line on
      what they say against findings 15 to 17 (hyperjungle's 30 to 60 fps by eye).
- [ ] Rerun with `--compare` after a change to `core/export`, an importer or the shader library that is meant to move the
      numbers (the ROADMAP's LOD work above all), and paste the deltas into the change's note.
- [ ] Optional: the older spike cases (`--cases=hyperjungle,rift,girder`) for a row against the eye readings. The poses are
      relative to each case's focus, so they fit any case the spike loads.

## 8. The look (GODOT-LOOK-PLAN.md steps 1 to 3, 2026-11-23): what only a real GPU can say

Steps 1 to 3 were built and tested in a cloud container on a software renderer: the counts and the pictures are real,
no time is. `README.md`, "The look", says what each piece is. In order:

- [ ] **The baseline, then the tiers, on each lane** (`KRATOR_GL=gpu`, the lane lock as usual). Three runs a lane, the
      same four stops and three hours:
      `python tools/harness.py lock --lane rtx -- <godot> --path godot --script res://tests/perf/route_harness.gd -- --look=legacy --out=res://PERF-route-rtx-legacy.json --md=res://PERF-route-rtx-legacy.md`
      then `--look=high` on the RTX and `--look=low` on the Arc (`--gpu-index 1`), each with its own `--out` and `--md`
      and `--shots=shots/route-<lane>-<tier>`. Read the GPU and CPU columns, and whether a stop is marked **over** its cap.
- [ ] **What a place costs to open with cells on.** `stream_build_ms` in the route's JSON against a run with
      `--no-cells`. Cutting reads each item's instance buffer back, which on a GPU waits for the device; if that shows,
      the cut belongs in the cook (the plan's N2).
- [ ] **Nodes.** The town ends at about ten thousand nodes with cells on. Watch the CPU column, and the frame time while
      turning on the spot.
- [ ] **Occlusion culling**: walk the avenue and the monastery's terraces watching for anything that pops in late at a
      crest (`--no-occlusion` for the A/B). The occluders sit under the ground and should hide only what the ground
      hides. It starts a few frames after a place opens. The route's CPU column says what the culling itself costs.
- [ ] **The roads.** The stream's road ribbons were wound face down and their shader culls back faces, so none drew
      from above until this change. They draw now: look for z-fighting with the ground and for the shoulders' fit.
- [ ] **Back faces.** Single-sided records now cull their back faces (`library.gdshader`). Walk the monastery and the
      town looking for a wall or a roof that is missing from one side. A place's import report counts them
      (`get_meta("report")["faces"]`: culled, two_sided, cutout, and `moved`, the nodes put back on both faces because
      their triangles wound against their normals). A record three draws from inside only (`BackSide`: none in the
      cases exported so far) would be culled: the export does not carry it (the plan's section 13).
- [ ] **Shadows.** The first split's texel is 1.2 cm (high) or 1.8 cm (low): window reveals and beams should cast a
      shape. Look for the far edge at 250 or 400 m, for the blend between splits, and for peter-panning under eaves.
- [ ] **The weathering**, in the look lab: `godot --path godot res://look_lab.tscn -- --look=high`, keys W (the stack),
      R (wet), H / J (the hour). The amounts a class are `krator/kweather.gd` `CLASSES`: tune them against reference
      photographs, family by family (`--only=plaster,stone`). Then the same in the walk, where vertex tints are on.
      What it costs: the route's GPU column with and without `--no-weather --no-detail` (five texture fetches a pixel
      of every library surface; the low tier may want fewer).
- [ ] **Detail and tangents** (keys D and N in the lab): within three metres a flat face should have a grain; turning
      the mesh's tangents off should change nothing on flat faces and steady the lighting on round ones.
- [ ] **The sky on the Arc**: `--look=low` draws the clouds at half resolution. Look at cloud edges against the sun and
      at the horizon; `--no-sky-half` for the A/B, and the GPU column for what it saved.
- [ ] **Indoors**: with SSAO on, corners and the feet of furniture should darken (`--no-room-ambient` for the A/B).
      Gilt and bronze now take a tinted reflection of the room where they took a quarter of the diffuse light.
- [ ] **AA** (the plan's L6): MSAA against `--aa=taa`, `--aa=fsr2` and `--aa=smaa` on swaying cards and thin rails.
- [ ] `xvfb-run` is not needed on a real machine: `godot --path godot --script res://tests/shaders/look_gpu_check.gd`
      should print `all passed` on both lanes (it reads every shader change back from pixels).
