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
- [ ] Iridescent bark shifts tint with the view angle (`bark.gdshader` mode 1); the far impostors still draw plain.

## 3. girder (key 3): glTF, the friend's route

- [ ] Library textures on the hall: thatch, shingle, timber. Compare with `settlements/girder/girder.html` up close.
- [ ] What tonight showed: stalls and people come in near-white (their colours live in shader hooks and custom
      attributes glTF drops). The library surfaces (hall roof, timber, planks, rope, cane, rock, ground) are rebuilt
      from Girder's pack with the break-up (`krator/kmat.gd`): compare their tiling with the browser.
- [ ] Drag `data/girder/region.glb` into the editor's FileSystem dock, open it, and look at the Import dock: is there an
      option to import extras as metadata in your version? Does the editor import differ from the runtime load?
- [ ] **Ask your friend** how the Voth kit got into Godot (GODOT-PLAN.md section 1). If it was `GLTFExporter`, this case
      is that route; if it was something else (Blender, an OBJ export), try it on Girder and write down the difference.

## 4. iziz (key 4): the atmosphere and the Atmos autoload

- [ ] It opens at 19:30: lamps and halos lit, braziers flickering, searchlights sweeping, smoke rising from chimneys.
- [ ] `[` `]` across dusk (17:00 to 19:00) and dawn: lights come on and go off by their hours; the sky and sun dim.
- [ ] Fog banks: Forward+ only (FogVolume). Turn on volumetric fog in the WorldEnvironment if they do not show; note it.
- [ ] Weather: in the remote inspector (or a line in `spike.gd`) call `Atmos.set_weather("storm")`: rain and fog
      rise, the wind strengthens, and `Atmos.strike` fires every 5 to 14 s (nothing draws the bolt or the rain yet).
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
