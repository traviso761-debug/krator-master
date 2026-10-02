# Handoff: find the material-library sources on the owner's drive

For a Claude Code session running **on the owner's machine**, in their clone of krator-master. Pull `main`
first. The cloud session that wrote this cannot see the drive. The files below are too big to upload, so the
reduction happens on the machine where they are.

Read first, and nothing else unless you need it: `CLAUDE.md`, then `core/materials/PLAN.md` sections
"The base library", "Poly Haven ingest", "Neutral copies", "Cloth", "Checking a set", "Pattern-sheet prompts
by culture" and "Still needed for Girder". The tools are in `tools/textures/`; each one's docstring is its manual.

## The job

1. **Find** three kinds of source on the drive (below). Look only where the owner points you, plus the obvious
   places (Downloads, Desktop, Pictures, any folder named for Poly Haven, textures or ChatGPT). Ask before
   scanning a whole drive.
2. **Inventory** what you find without opening images one at a time. Use file names, sizes and pixel sizes
   (Pillow reads the header without decoding), and contact sheets, never single image reads.
3. **Show the owner** the inventory and your proposed picks, then reduce and commit only what they approve.

## What to look for

### A. Poly Haven texture downloads (many GB)

Files are named `<slug>_<map>_<res>.<ext>`, for example `rock_wall_08_diff_2k.jpg` and
`rock_wall_08_nor_gl_2k.png`. They may be in per-asset folders, in `textures/` subfolders, or in zips. Run the
catalog pass on each download root. It reads only the colour maps, at reduced size:

```
python3 tools/textures/ingest_polyhaven.py "<download root>" <scratch>/ph-out --catalog-only
```

It writes `catalog/sheet-NN.jpg` (thumbnails labelled with the slug, a tint guess and a suggested library id)
and `catalog/summary.tsv`. Look at the sheets and pick against this list. Keep the best one or two per id. New
`bark.*` and `leaf.*` ids are welcome, because the biome kits use many.

| Priority | ids |
|---|---|
| Girder first | `wood.plank`, `wood.beam`, `rock`, `steel.rust`, `concrete`, `ground.moss` |
| Iziz and Voth (need `neutral: true`) | `stone.cut`, `stone.rubble`, `plaster`, `earth.adobe`, `brick`, `paving`, `ground.dirt`, `ground.sand`, `roof.tile`, `metal.corrugated` |
| Everyone else | `concrete.cracked`, `steel.painted`, `metal.grating`, `metal.iron`, `metal.bronze`, `metal.gold`, `wood.log`, `wood.bamboo`, `tile.glazed`, `ground.turf`, `stone.coral`, `bark.*`, `leaf.*` |

Poly Haven has little cloth. Don't look for it there: the base weaves are procedural (`cloth.weave.*`) and
already committed.

Then reduce only the picks, adopt them, and check them:

```
python3 tools/textures/ingest_polyhaven.py "<download root>" <scratch>/ph-out --only slug1,slug2,...
# write tools/textures/batches/polyhaven.json: [{slug, id, tint, scale:[m,m], neutral, note}, ...]
#   scale = metres per tile, from the asset's Poly Haven page (the ingest's [2,2] is a placeholder)
python3 tools/textures/adopt.py --polyhaven <scratch>/ph-out tools/textures/batches/polyhaven.json
python3 tools/textures/preview.py <scratch>/ph-sheet.jpg core/materials/library/<id> ...   # look at it
```

List every unpicked slug that would be useful in PLAN.md's "Available, not committed" section, grouped by id.

### B. The Iziz and Voth images (ChatGPT, from an earlier session)

These are square PNG or JPG files, about 1024 to 2048 px. Earlier deliveries had descriptive titles, for example
"Weathered Tropical Thatch Texture.png". Match each image to a row in PLAN.md "Iziz and Voth":

- Iziz: banco plaster with straw (`earth.adobe`, neutral), riveted patchwork metal (`metal.scrap`), bleached
  reclaimed boards (`wood.reclaimed`), patched tarp (`cloth.tarp`), star-and-diamond mosaic, square painted tile,
  banner, gilt.
- Voth: lime stucco over mud-brick (`plaster`, neutral), mushroom cap and stalk (`organic.fungus`), insect-shell
  plates (`organic.chitin`), fish-scale dome plating (`metal.scale`), stone inlay band, banner cloth.

The exact prompt text should be in the earlier session's transcript or next to the images. Ask the owner if it
is not found. Do not guess it: the meta records the exact prompt, or says it was not recorded.

### C. Other ChatGPT cloth and pattern deliveries

Beast Rider cloth colourways 3 to 5, awning stripes, `cloth.plain` (undyed linen), `cloth.canvas`,
`wood.lacquer`, and any culture sheet from PLAN.md's prompt tables (Xanadu, Highlands, Reed Lake, Dalab, Yuni,
Port, nacre).

For B and C, write a batch file like `tools/textures/batches/beast-riders.json`: one per delivery, the exact
prompt in `_source.prompt`, and `"pattern": true` for pattern sheets, which crops them to their period. Near-
colourless base surfaces for Iziz and Voth get `"mute": 0.9`. Then:

```
python3 tools/textures/process.py --batch tools/textures/batches/<delivery>.json "<folder of the images>"
python3 tools/textures/preview.py <scratch>/sheet.jpg <the output set dirs>
```

## Rules (from the owner)

- Never commit an original download or anything over 1024 px. The sources stay where they are; `meta.json`
  records their sha1.
- Every set has a `meta.json` with its source and licence: CC0 for Poly Haven, and for generated images the
  exact prompt.
- Check every set before committing it: look at its `preview.py` sheet (3x3 tiling plus lit). Show the owner one
  contact sheet per batch.
- No renderer work and no build changes. Hooking sets into Girder is the separate Phase 3 pilot.
- No Git LFS (decided; see PLAN.md). Keep the library lean: about 3 MB per set, and neutral copies are albedo
  only.
- Keep PLAN.md's "Built so far", "Next steps", "Still needed" and "Available, not committed" current.
- Do not open `dist/`, `*.html`, `archive/`, `host/` or other generated files (CLAUDE.md, "Keep token use down").
- Commit on a branch and push it. Push to `main` only if the owner says so.

## Report back

End with a short table of what was found, what was committed (id, source, size) and what was left as
available. Also list anything that needs the owner: a missing prompt, an image that doesn't tile, or a set that
looks wrong on its contact sheet.
