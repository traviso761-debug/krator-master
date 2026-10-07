# The material library: plan

Status, 2026-10-02: the library is started. Eleven sets plus six procedural cloth sets are processed (see "Built
so far"); the Poly Haven ingest tool is written and waits for the owner's download; the prompts for every culture's
pattern sheets are below. **2026-10-03: the record system is built and Girder is the pilot** (see "How a build adopts
the library", below). This is the content side of GODOT-PLAN.md Phase 3
("textures and materials as data"): that phase defines the record format and the exporter path; this file
defines what goes in the library, where the textures come from, and how a build adopts it.

## Why

Imported characters and props (Meshy GLBs) carry full PBR materials: colour, normal and roughness maps. The
worlds are vertex colours over small canvas-painted textures, so a Meshy character standing in a street makes
the street look flat. Renderer features (global illumination, AO, tone mapping) will come from Godot and are
not to be added to the three.js previews (GODOT-PLAN.md section 2, [G native]). What the repo can raise today
is the surfaces themselves, in a form that survives the port.

## The shape: two layers

Across the 15 settlements and kits there are about 500 named materials (`MAT.*` in the Ancients lineage,
`FAMMAT` keys in the Voth lineage, catalog family strings). Most are one of a few dozen base surfaces with a
culture's colour or pattern on top. So:

1. **A shared base library, about 45 surfaces.** Each is a full PBR set. The colour maps are kept natural but
   muted, so a culture's palette tints them, the way the builds' vertex colours already tint today's textures.
   One texture set serves every culture.
2. **Culture pattern sheets, a handful per culture.** Motifs, painted bands, weaves, murals, tile designs.
   This is what makes a culture recognisable, and it is where image generation earns its keep.

A build's material then reads: base surface + tint + optional pattern sheet + optional shader hook.

## The record

Every library entry and every build material is one record in the Phase 3 vocabulary:

```
{ id, family, colour, map, normalMap, roughnessMap, roughness, metal, emissive,
  doubleSided, alphaTest, scale:[u,v] /* world metres per tile */, tint:true|false,
  pattern /* optional sheet id */, hook /* optional library shader */ }
```

`MAT`, `FAMMAT` and the catalog's family strings become adapters onto these records. They are not merged in
three.js (GODOT-PLAN.md section 7). The exporter writes the records; Godot reads them as `StandardMaterial3D`
or a library shader.

## Files

```
core/materials/library/<id>/albedo.jpg  normal.jpg  roughness.png  meta.json
core/materials/patterns/<culture>/<sheet>/albedo.jpg  normal.jpg  roughness.png  meta.json
```

`meta.json` holds the record fields, the source (scan library and asset name, or "generated" with the prompt
used), the licence, and the processing run that produced the files.

**Size.** Committed sets are 1024 px: the colour map as JPEG quality 92 (the engine recompresses it anyway),
the normal map as JPEG quality 95 with **no chroma subsampling** (`subsampling=0`), the roughness map as lossless
PNG. A normal map keeps X and Y in red and green, so the default 4:2:0 halves their resolution (about 5 degrees
mean error, 20 at the 99th percentile); 4:4:4 at q95 holds about 1.6 (4.5). Any encoder that writes a normal map,
including the demo page, must pass `subsampling=0`. That is about 1.6 MB a set. Sources (the generated or
downloaded originals) stay outside the repo; `meta.json` records each source's sha1 so a set can be traced
and reprocessed. **Git LFS: decided no (2026-10-02), see "Git LFS" below.**

## The base library

Source: **S** = photo-scan library (ambientCG, Poly Haven; CC0). **G** = generated (ChatGPT image or similar)
then processed. **P** = procedural or a shader, no image.

| id | Surface | Main users | Source | Tint |
|---|---|---|---|---|
| `stone.cut` | dressed ashlar | Voth, Iziz, Xanadu, Ancients | S | yes |
| `stone.rubble` | rough rubble wall | Highlands, Reed Lake, Dalab, Ancients | S | yes |
| `rock` | natural rock face | all | S | yes |
| `paving` | cobbles and flagstones | most settlements | S | yes |
| `brick` | fired brick | Iziz, Xanadu, Highlands, Port, Jimjam, Ancients | S | yes |
| `earth.adobe` | adobe, banco, rammed earth | Yuni, Locus, Iziz, Dalab, Shade | S | yes |
| `plaster` | lime plaster and render | Voth, Yuni, Locus, Iziz, Xanadu, Highlands | S | yes |
| `ground.dirt` | dirt, mud | all | S | yes |
| `ground.sand` | sand | Iziz, Shade, Jimjam, Port | S | yes |
| `concrete` | cast concrete | Ancients lineage, Girder, Yuni, Locus, Port | S | yes |
| `concrete.cracked` | cracked, stained, rebar | Ancients, Girder, post-apoc | S | yes |
| `steel.rust` | rusted steel | Girder, Yuni, Locus, Port, Ancients | S | no |
| `steel.painted` | chipped painted steel, hulls | Port, Ring Sea, post-apoc | S | yes |
| `metal.corrugated` | corrugated sheet | Iziz, Xanadu, Highlands, Locus, post-apoc | S | yes |
| `metal.grating` | grates, mesh | Port, Ancients | S | no |
| `metal.iron` | wrought and cast iron | Iziz, Highlands, Xanadu | S | no |
| `metal.bronze` | bronze, brass | Iziz, Highlands, Sardaukar-style trim | S | no |
| `metal.gold` | gold, gilt | Iziz, Dalab, Xanadu, Highlands | S | no |
| `wood.plank` | planks, decking | all | S | yes |
| `wood.beam` | sawn and hewn timber | all | S | yes |
| `wood.log` | round logs with bark | Highlands, Reed Lake, Dalab | S | yes |
| `wood.bamboo` | bamboo | Highlands, Reed Lake, Dalab | S | yes |
| `wood.carved` | adze-carved surface | Girder, Mav's Refuge | G | yes |
| `wood.lacquer` | lacquered wood | Girder trim, Highlands, Xanadu | G | yes |
| `wood.tarred` | tar-sealed staves | Girder, Mav's Refuge | G | no |
| `roof.thatch` | grass and palm thatch | Girder, Mav's, Yuni, Locus, Ancients lineage | G | yes |
| `roof.reed` | reed bundles | Reed Lake | G | yes |
| `roof.shingle` | wood shingles | Girder, Mav's, Iziz, Highlands, Xanadu | S | yes |
| `roof.tile` | clay tiles | Voth, Yuni, Locus, Highlands | S | yes |
| `tile.glazed` | glazed ceramic tile | Xanadu, Yuni, Iziz | S | yes |
| `fibre.cane` | woven cane and rattan | Girder, Mav's | G | yes |
| `fibre.reedmat` | woven reed mat | Reed Lake, Dalab, Highlands | G | yes |
| `fibre.rope` | rope, net | Girder, Mav's, Reed Lake, Port | G | yes |
| `cloth.plain` | linen, cotton | all | G | yes |
| `cloth.canvas` | canvas, tarp | all with awnings and tarps | G | yes |
| `hide` | hide, leather | Reed Lake, Dalab, Highlands | G | yes |
| `organic.fungus` | fungus cap and flesh | Voth, Locus | G | yes |
| `organic.chitin` | chitin plate | Voth | G | yes |
| `organic.scale` | reptile and fish scale | Highlands, Reed Lake, characters | G | yes |
| `ground.moss` | moss | Girder, Screamers, biomes | S | yes |
| `ground.turf` | turf, grass mat | Highlands, Dalab, Reed Lake | S | yes |
| `shell.nacre` | mother-of-pearl | the nacre culture (WIP) | G + hook | no |
| `shell.abalone` | abalone | the nacre culture | G + hook | no |
| `shell.conch` | polished conch | the nacre culture | G | no |
| `stone.coral` | coral and shell limestone | the nacre culture, coasts | G | yes |
| `glass`, `water`, `glow`, `window.lit` | | all | P | |

About 45 surfaces. The scan sources cover over half of them for free, so the image-generation work sits in
fibre, organic, shell and the culture-specific woods and roofs.

## Culture pattern sheets

Flat, front-on panels that repeat at least horizontally (a frieze or a fabric swatch). A relief normal is
derived from them in processing; no hand-made normal maps.

| Culture (builds) | Sheets |
|---|---|
| Beast Riders (girder, mavs-refuge) | geometric weave cloth (5 colourways), beast-claw trim in red lacquer, gilt and verdigris, awning stripes |
| Xanadu (xanadu) | jali lattice, chevron, checker, bird, deer, star and zigzag painted bands, Persian mosaic, valance |
| Highlands (highlands) | harlequin, three lattice panels, maze band, painted beams (caihua), tiles in four styles |
| Reed Lake (reedlake) | chakana motif, reed lattice, fringe, painted hide shield |
| Dalab (dalab) | murals, god panels, checker, deco panel, relief, turquoise relief |
| Iziz (iziz) | glazed star-and-diamond mosaic, hand-painted glazed tile, banner cloth, gilt work (base surfaces near-colourless; see "Iziz and Voth") |
| Yuni, Locus (yuni, locus) | mosaic, black-and-white paint panel, colour paint panel, relief |
| Voth (voth) | stone inlay band, banner cloth; the rest is base library, near-colourless (see "Iziz and Voth") |
| Ancient Port (port; for Hook) | hazard stripes, hull paint and primer, container livery |
| The nacre culture (WIP) | shell inlay, pearl mosaic, nacre-banded trim |
| Shared (every culture) | **grime streak sheet**: a grid of 8 by 16 vertical streak masks (soot, damp, rust run-off), grey on transparent, no colour. Each opening, sill or cornice picks one cell by hash, so one small sheet gives every window its own run-off and no two neighbours match. Spiderbench (see "Shader hooks") does this as layer 16 of its wall array; here it is one generated sheet, applied by the breakup hook below or baked into a wall's vertex colours |

## Shader hooks

- **Iridescence** (`shell.nacre`, `shell.abalone`, later beetle chitin): mother-of-pearl shifts colour with
  the viewing angle, so a colour map alone renders as a flat pastel. The biome kits' foliage hook already
  mixes a second colour by viewing angle (`references/foliage-kit.md` in the skill; `core/biome`); reuse that
  technique in three.js. Godot's `StandardMaterial3D` has no iridescence, so this becomes one `.gdshader` in
  the Phase 3 shader library.
- **World-space UVs** stay as today in the previews; in Godot they are the material's built-in triplanar
  option.
- Glass Fresnel, water and glow are already in the Phase 3 shader list.

### From spiderbench (reviewed 2026-10-05)

Spiderbench (github.com/xikhar/spiderbench, a Claude-written web-swinging city, non-commercial) bakes its surfaces
offline into texture arrays and puts all the variety in one facade shader of about 3,500 lines. That whole is the
opposite of this plan (every hook here is a hand rewrite into Godot), but four of its pieces are small, portable and
fix things Voth's `47-texture.js` history records fighting:

- **[G shader] Analytic coursing instead of painted joints.** Its ashlar is pure UV math: a per-course random slide,
  a per-block tone from a hash of (course, block), joints as box-filtered step functions (`boxAA`), sills and belt
  courses the same way. No texture repeat, and no mip smear of the joints at distance, which is what Voth's 256 px
  ashlar canvas loses first. Shape here: a `TEX.kind('coursing')` whose pixel function and whose `.gdshader` are the
  same formula, parameters `{courseH, blockW, slide, joint, tone}`; the base map (`stone.cut`) stays underneath as
  the surface and the kind only draws the joints and the per-block tone. The lattice helper is already pure
  (`noiseP`, Voth 47-texture.js).
- **[G shader] Variety as world-space macro noise, extended.** `breakup` (done 2026-10-03) already blends a shifted
  copy and varies brightness. Spiderbench also varies **roughness** and **grime** from the same macro field, and
  offsets each building's UV by a hash of its seed (`gOff`), so sixteen wall layers read as hundreds: building-scale
  patches of peeling, re-pointing and stains, not per-tile ones. Add `rough` and `grime` to `breakup`'s parameters
  (`{mix, macro, cell, rough, grime}`), grime sampling the shared streak sheet above. Voth's per-instance UV offset
  in `45-kit.js` is the CPU half of the same idea; keep one hash and name it in both places.
- **[G native] A detail normal at close range.** A tiling micro-relief normal blended over the base normal, fading
  with distance (spiderbench derives the tangent frame from `dFdx`/`dFdy` so it needs no UV tangents). Godot has it
  built in (`detail_normal`, `detail_mask`, `detail_uv_layer` on `StandardMaterial3D`), so in this plan it is a
  **record field**, not a hook: `detail:{normal, scale, strength}` on the record in `23-mat-record.js`, and the
  three.js preview applies it in the world-UV hook only for the near LOD. One shared `detail.*` set in the library
  (plaster grain, stone grain, metal brush) serves every culture.
- **[G data] One hash, bit-exact on both sides.** Its window occupancy is hashed identically in JavaScript and GLSL
  (`nh3`), so the CPU-side light list agrees with what the shader draws. Rule for the port: any hash a shader shares
  with placement code (lit windows, per-block tone, streak cell) is one integer hash written once in `core/`, with its
  GDScript and `.gdshader` twins beside it, and a test that compares the three on a fixed input set.

Smaller notes from the same read: colour maps sRGB and every data map explicitly no colour space (the library's
`meta.json` already says which is which; the Girder adapter should set `colorSpace` from it, not by file name);
its image loader retries with backoff because Chromium drops decodes under load (`ERR_INSUFFICIENT_RESOURCES`), which
matters once a build loads `tex/` as files instead of data URLs; and a 4096 px ad atlas costs it 85 MB with mips,
the number to remember when a pattern sheet is tempted past 1024.

## Processing pipeline

`tools/textures/process.py` turns any source image into a library set; a batch file in
`tools/textures/batches/` lists sources, output folders, records and per-set options, so a whole delivery
reprocesses with one command:

```
python3 tools/textures/process.py --batch tools/textures/batches/beast-riders.json <folder of sources>
```

Steps:

1. Make it seamless. Pattern sheets are cropped on each axis to the pattern's own period, found by
   self-similarity, so motifs stay whole (a blend would ghost them). Other surfaces get a cross-fade of the
   far edge into the near edge.
2. Remove baked lighting: divide out a wide periodic blur of the luminance, and lift deep baked shadows a
   little, so the normal map does not shade them a second time.
3. Derive a height map from luminance and frequency; a normal map from the height; a roughness map from the
   inverted, contrast-adjusted luminance with a per-surface base value.
4. Mute the colour for tintable surfaces (lower saturation, compress value range) so palettes tint cleanly.
5. Check tiling: render a 3x3 repeat and flag visible seams or repeating blotches.
6. Write the 1024 px set and `meta.json` with the record, the source's sha1, its generator and prompt, the
   licence, and every option used. Resampling is wrap-aware, so the set still tiles after resizing.

Normal maps use the OpenGL convention (+Y up), which three.js and Godot both expect.

Scan-library sets skip steps 1-3 and only get resized, muted and checked.

## Poly Haven ingest (the S rows, and bark and leaf variants)

The owner's Poly Haven download is many gigabytes, so the reduction runs on the owner's machine and only a small
folder comes back. `tools/textures/ingest_polyhaven.py` finds each asset's maps by file name
(`<slug>_<map>_<res>.<ext>`, in folders or zips), takes the colour map, the OpenGL normal (`nor_gl`, never
`nor_dx`, never flipped) and the roughness map (or the green channel of an ARM pack), reads jpg, png, tif or exr
at any resolution (the smallest at or above 1024), resizes wrap-aware to 1024 and writes the same layout and
`meta.json` as `process.py` (source "Poly Haven", slug, URL, CC0, sha1). It needs only Python, numpy and Pillow
(OpenEXR or opencv optional, for exr-only maps) and prints a table of what it found and skipped.

Two passes keep the upload small (a catalog of hundreds of assets is a few MB; a full set is about 3 MB):

```
# 1. catalog: thumbnails on contact sheets + summary.tsv, no sets. Zip OUT and upload it.
python3 tools/textures/ingest_polyhaven.py "<downloads>" ph-out --catalog-only
# 2. only the sets chosen from the catalog (slugs from the table); zip ph-out/sets and upload it.
python3 tools/textures/ingest_polyhaven.py "<downloads>" ph-out --only slug1,slug2,...
```

**No local download?** `tools/textures/fetch_polyhaven.py` goes to the API instead: `gaps` lists the library
roles with no set and the best Poly Haven candidates for each, `search WORD...` finds assets, and
`fetch SLUG... --out DIR` downloads only the maps the ingest reads (1k colour jpg, nor_gl png, rough png; about
15 MB each, md5-checked) into DIR, plus `DIR/batch-stub.json` for `adopt.py` with `scale` taken from Poly Haven's
real dimensions. Then run the two passes above on DIR. Its candidates are keyword guesses: judge them in the
demo kit as usual.

Selection is made from the catalog: the script's suggested library id (keyword guess) is only a hint. Rules:
best one or two sets per id; a **new id** is fine for bark and leaf variants (`bark.*`, `leaf.*`; the biome kits use
many); everything else goes in "Available, not committed" below with its slug, so it can be pulled in later
without a second pass through the downloads. Chosen sets become library sets with
`python3 tools/textures/adopt.py --polyhaven <ph-out> tools/textures/batches/polyhaven.json` (a list of
`{slug, id, tint, scale, neutral, note}`): the colour map is muted lightly when the id is tintable (0.35), normal
and roughness are copied unchanged, and the real world size (metres per tile, from the Poly Haven page) goes in
`scale`; the ingest's `[2, 2]` is a placeholder.

### Neutral copies (Iziz and Voth)

Iziz and Voth colour every instance with a tint over a near-grey texture. A set that is tinted again would be
double-coloured, so a tintable surface gets a **`<id>.neutral` copy**: albedo only, near-grey (process.py's mute at
0.9, mean luminance 0.65 because a tint multiplies), its `meta.json` pointing `maps.normalMap` and `roughnessMap`
at the sibling set (`../<id>/normal.jpg`), so those maps are stored once. Make one with
`python3 tools/textures/adopt.py --neutral <id> <id>.neutral`. Done: `roof.thatch.neutral`, `roof.shingle.neutral`.
For Poly Haven picks, set `neutral: true` in the batch for every id Iziz or Voth use (stone, plaster, brick,
earth, paving, ground, wood, metal.corrugated, roof.tile).

### Git LFS: decided no (2026-10-02)

The repo is already 1.1 GB packed, so the library (about 200 MB for 60 sets) is a moderate addition, not the
tipping point. LFS would hurt more than help: every cloud session clones fresh and would spend the GitHub LFS
bandwidth quota (1 GB a month on the free tier) on textures it does not read; the LAN host, the gallery script
and the Godot importer would each need an LFS client, and a clone without one silently holds pointer text; and
`git lfs migrate` rewrites `main`. Instead:

- keep committed sets small (1024 px, JPEG colour; neutral copies albedo-only, 0.4 MB);
- never reprocess a committed set in place without a reason (each rewrite adds its size to history);
- sources and Poly Haven downloads stay outside the repo;
- trigger to revisit: the library and patterns together passing **250 MB**, or a need to reprocess many sets.
  The answer then is a separate texture repository carried as a subtree (as `host/WorldMenagerie/` is), not LFS.

## Cloth (procedural base weaves, and the ChatGPT deliveries)

Poly Haven has little cloth, so the tintable base weaves are code: `tools/textures/make_cloth.py` writes six
library sets, each a woven-thread height field (a cell grid where one thread is over and the other under; the
visible thread has a rounded cross-section and a hump that dives under at its ends; per-thread thickness, tone
and wander from the thread index; fibre noise along each thread). The grid has a whole number of threads, every
random value is keyed by thread index and every filter is periodic, so the sets **tile exactly by
construction** with no seam repair. The normal map is the height field's, so it carries the real weave. Colour is
near-neutral grey (`tint: true`), so a culture tints it.

| id | Weave | Threads per 1024 px |
|---|---|---|
| `cloth.weave.plain` | plain weave | 64 |
| `cloth.weave.twill` | 2/2 twill, diagonal rib | 64 |
| `cloth.weave.canvas` | heavy plain weave, slubs, wander | 40 |
| `cloth.weave.burlap` | loose coarse weave, open gaps | 28 |
| `cloth.felt` | pressed fibre, no weave | n/a |
| `cloth.knit` | stockinette, 24 wales x 32 courses | n/a |

These are the base cloth. `cloth.plain` and `cloth.canvas` in the base-library table stay reserved for the
ChatGPT linen and canvas below (natural fibre colour and character); `cloth.tarp` (Iziz) and the patterns
(awning, Beast Rider colourways, Voth banner) come from images. Process each delivery with `process.py`
(`--pattern` for sheets, which crops to the weave and pattern period) as a batch file, then check it with
`preview.py`.

## Checking a set

`python3 tools/textures/preview.py sheet.jpg <set dirs> [--per-sheet 4] [--tint "#b8683e"]` writes a contact sheet,
one row per set: a 3x3 tiling of the colour map, one tile lit with its normal and roughness maps (Lambert plus a
Blinn highlight from the upper left), and a lit 2x2 tiling. Seams in any map, a flipped normal and wrong glossiness
all show. Look at it before committing a set, and show the owner one sheet per batch. `--tint` shows a muted set as
a culture would use it.

## Prompts for generated sources

Base template, at the start of every request:

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view,
perfectly flat surface filling the whole frame edge to edge. Flat, even,
shadowless lighting, as if scanned: no highlights, no vignette, no shading
gradient across the image. No perspective, no objects, no text, no border,
no watermark. The left edge must continue into the right edge and the top
into the bottom. Material:
```

For tintable surfaces add: "Keep colours natural but slightly muted and even, so the texture can be tinted to
different palettes without looking stained." Leave it out where the colour is the point (patterns, shell).
For shell, replace the lighting sentence with "soft even lighting that shows the natural colour bands".

| id | Material line |
|---|---|
| `wood.carved` | Living wood carved into a wall surface, smooth adze-cut facets with broad tool marks, faint concentric grain and small knots. |
| `wood.lacquer` | Wooden panel finished in thick lacquer, worn at the edges to show wood underneath, fine crazing in the lacquer. |
| `wood.tarred` | Vertical wooden staves sealed with black-brown tar, tar drips, glossy and matte patches, grain showing where the tar has worn thin. |
| `roof.thatch` | Thick roof thatch of dried long grass and palm fronds in overlapping rows, some darker damp patches and a little moss. |
| `roof.reed` | Roof of tightly bound reed bundles laid side by side, cords lashing each bundle, sun-bleached tips. |
| `fibre.cane` | Woven wall panel of split cane and rattan in a tight basket weave, uneven strands, a few frayed ends. |
| `fibre.reedmat` | Flat woven reed mat in a twill weave, flattened reeds of slightly varying width, a few broken reeds. |
| `fibre.rope` | Thick twisted natural-fibre rope coiled in tight parallel rows, visible strand twist, a few loose fibres. |
| `cloth.plain` | Plain hand-woven linen cloth, visible weave, slight slubs and colour variation in the thread, soft creases. |
| `cloth.canvas` | Coarse heavy canvas, visible coarse weave, water stains, a mended patch. |
| `hide` | Tanned animal hide, leather grain with pores and creases, uneven tanning, a few scars in the skin. |
| `organic.fungus` | Surface of a giant mushroom cap, smooth leathery skin with fine radial fibres, small pores and pale speckles. |
| `organic.chitin` | Overlapping plates of insect chitin, smooth hard segments with fine growth ridges, slight waxy sheen. |
| `organic.scale` | Reptile skin of small overlapping rounded scales, each scale slightly raised, natural variation in scale size. |
| `shell.nacre` | Polished mother-of-pearl, cut nacre sheet, soft creamy white with flowing bands of pale pink, lavender, mint and silver-blue, fine wavy growth lines, slightly milky depth. |
| `shell.abalone` | Polished abalone shell interior, swirling bands of teal, deep blue, green and violet with silver highlights, organic ridged growth pattern. |
| `shell.conch` | Smooth conch shell surface, polished pale pink to peach with faint cream banding, glossy porcelain-like finish. |
| `stone.coral` | Coral stone building block, porous pale cream limestone full of fossil coral and small shell fragments, weathered by sea air. |
| `rubber.tyre` | Worn black rubber of an off-road tyre, the flat of the tread and sidewall: fine moulded rubber grain, faint mould lines and moulded lettering ribs, scuffs, small cuts and pits, fine sand packed into the pores. Tintable. For `kits/motor-vehicles` (every tyre and road wheel; slot `rubber` in its `materials.json`, waiting). |

Pattern sheets use the same template with "a flat, front-on decorative panel" in place of "perfectly flat
surface", the culture's palette as hex colours, and "the pattern repeats horizontally". Example (Beast Rider
cloth): "Hand-woven heavy cotton cloth with a tribal geometric pattern of stripes, zigzags and diamond bands,
dyed in deep red (#7a2028) with ochre (#c2a24e) and dark green (#2f5a3a) accents, visible weave, slightly
faded and uneven dye."

The Ys prompts (the Hykkousoi shell family, the tideline, the karst and its cards, the new Ancient hosts' travertine,
sandstone and bronze) are in `settlements/ys/MATERIAL-PROMPTS.md`, with their tints, tile sizes and the code each replaces.

### Pattern-sheet prompts by culture

Prepend the base template (pattern form: "a flat, front-on decorative panel" in place of "perfectly flat surface",
and leave out the tintable sentence: patterns are full colour). Each line below is the "Material:" part. Hex
colours were read from the build's `src/` (file:line in the notes under each table). Sheets whose motif is a
single centred figure say "clear margin"; the processing step then crops to the period or keeps one tile.
Where the build cuts the motif out with alpha (jali, lattices, valance) the prompt asks for a flat dark
background so it can be keyed in processing. Record the exact prompt in the batch's `_source.prompt`.

#### Xanadu

Palette: lapis #1e3f8a, turquoise #39b0b8, cream #f4efe4, gold #e0b040, maroon #6e2a2a (`70-xa-tex.js:15`);
Palopo bands pink #f07aa8, green #3fbf4a, yellow #f2c12e, sky #66c8f0 on turquoise #1fb5c8 or cobalt #1d3fbf
(`88-xa-dress.js:14-18`). The plan's "chevron" and "checker" bands do not exist in the build: the zigzag and
lozenge-chain bands stand in for them.

| id | Material line |
|---|---|
| `patterns/xanadu/jali` | Flat, front-on decorative panel of a pierced stone screen (jali) in pale sandstone (#e8e2d4): a square grid of four-by-four cells, each cell cut through with one upright diamond opening, and a small round hole at every grid corner where four cells meet. The openings show a flat solid black background (#1a1614), so the screen can be cut out later. The pattern repeats in both directions. Subtle stone grain only; the stone is one even tone. |
| `patterns/xanadu/lozenge` | Flat, front-on decorative panel of a painted lozenge-chain band as on a Mayan huipil: a single row of large diamonds in green (#3fbf4a) outlined in yellow (#f2c12e), each with a small pink (#f07aa8) diamond at its heart, and a small yellow diamond between neighbouring diamonds. The ground is a flat solid turquoise (#1fb5c8). The pattern repeats horizontally. Full colour, hand-painted, slightly uneven edges. |
| `patterns/xanadu/zigzag` | Flat, front-on decorative panel of a painted zigzag band: two parallel chevron lines of equal height and rounded joins, a pink (#f07aa8) zigzag line lying above a yellow (#f2c12e) one, both thick and bold. The ground is a flat solid turquoise (#1fb5c8). The pattern repeats horizontally. Full colour, hand-painted, slightly uneven edges. |
| `patterns/xanadu/bird` | Flat, front-on decorative panel of one painted quetzal-bird motif, facing right, centred: a pink (#f07aa8) oval body, round head with three short green crest lines, small green (#3fbf4a) beak, a fringed wing of five pink feather strokes fanning back, and a long forked tail of two pink lines, black dot eye. The ground is a flat solid turquoise (#1fb5c8). The motif is centred with clear margin, and the sheet repeats horizontally. Full colour, hand-painted. |
| `patterns/xanadu/deer` | Flat, front-on decorative panel of one painted stepped-silhouette deer, facing left, centred: a blocky green (#3fbf4a) body built from right-angled steps with four short legs, outlined in yellow (#f2c12e), crowned with branching green antlers, one small yellow dot for the eye. The ground is a flat solid cobalt (#1d3fbf). The motif is centred with clear margin, and the sheet repeats horizontally. Full colour, hand-painted. |
| `patterns/xanadu/star` | Flat, front-on decorative panel of one painted hooked X-star motif, centred: a sky-blue (#66c8f0) diamond heart outlined in yellow (#f2c12e) with a small pink (#f07aa8) diamond inside, four green (#3fbf4a) diagonal arms from the corners, each ending in a right-angled hook, and a yellow dot between the arms on each side. The ground is a flat solid turquoise (#1fb5c8). The motif is centred with clear margin, and the sheet repeats horizontally. Full colour, hand-painted. |
| `patterns/xanadu/frieze` | Flat, front-on decorative panel of a gilded frieze band: a row of gold (#e0b040) four-pointed stars, each with a small turquoise (#39b0b8) dot at the centre and a small cream (#f4efe4) dot on the band's centre line between stars, on maroon (#6e2a2a). A thin cream (#f4efe4) stripe runs along the top and bottom edges, each with a thin gold line just inside. The pattern repeats horizontally. Full colour, glazed-tile look. |
| `patterns/xanadu/mosaic-star` | Flat, front-on decorative panel of Persian glazed-tile mosaic: a four-by-four grid of eight-pointed stars, turquoise (#39b0b8) outer star with a smaller cream (#f4efe4) eight-pointed star inside and a gold (#e0b040) dot at the heart, on lapis (#1e3f8a). Small cream plus-shaped crosses sit where four stars meet. Faint dark tile grid lines. The pattern repeats in both directions. Full colour. |
| `patterns/xanadu/mosaic-arabesque` | Flat, front-on decorative panel of Persian glazed-tile arabesque mosaic: interlocking circles centred on a square grid, each a lapis (#1e3f8a) disc with a cream (#f4efe4) outline and an inner gold (#e0b040) ring, so neighbouring circles overlap; in each gap a small cream four-pointed star with a gold dot. The ground showing between circles is turquoise (#39b0b8). Faint dark tile grid lines. The pattern repeats in both directions. Full colour. |
| `patterns/xanadu/valance` | Flat, front-on decorative panel of a pleated cloth window valance, twice as wide as tall: vertical pleats alternating light grey (#e6e6e6) and mid grey (#b4b4b4) over the top two thirds, ending in a hem of round scallops in alternating light greys (#c8c8c8 and #d8d8d8), a dark stitched seam along the top. Neutral grey cloth, so it can be tinted later. The area below the scallops is flat solid black (#1a1614). The pattern repeats horizontally. Greyscale only (the build tints it per instance). |

#### Highlands

Palette: formline red #b3322a, teal #2e9488, white #efe7d6, black #171311, ochre #d19a3a (`70-hl-tex.js:14`);
caihua blue #3a6aa8, green #3f7a4a (`73b-hl-frame.js:45`); tile styles D, S, T, W at `73b-hl-frame.js:284-290`; maze
stone #c4bba8 (`79e-rep-arco.js:7-14`). Harlequin has two more colourways in the source: red #9a2420 on cream
#d8cfbe and dark green #1f5a40 on #5f9a50 (same gold seam); run them as `harlequin-red` and `harlequin-dark`.

| id | Material line |
|---|---|
| `patterns/highlands/harlequin` | Flat, front-on decorative panel of glazed harlequin roof tile: a field of diamond lozenges, each a lime-green (#7fa848) diamond with its points touching the cell edges, set in a deep green (#2e6e3a) ground, with a thin gold (#c89a30) seam line just inside each diamond's edge and a small soft pale glint on the upper half of each. The pattern repeats in both directions. Full colour, glossy glazed look. |
| `patterns/highlands/lattice-grid` | Flat, front-on decorative panel of a Chinese grid lattice (fangge): thin cream (#efe7d6) wooden bars forming a square grid of six-by-six open cells, with a slightly heavier frame bar along every edge. The openings show a flat solid near-black background (#171311), so the lattice can be cut out later. The pattern repeats in both directions. No wood grain. |
| `patterns/highlands/lattice-fret` | Flat, front-on decorative panel of a Chinese step-fret lattice (huiwen): thin cream (#efe7d6) bars drawn as right-angled square spirals, four fret units in a two-by-two arrangement, each unit a small square spiral winding inward, with a frame bar along every edge. The openings show a flat solid near-black background (#171311), so the lattice can be cut out later. The pattern repeats in both directions. No wood grain. |
| `patterns/highlands/lattice-lantern` | Flat, front-on decorative panel of a Chinese lantern lattice (denglong kuang): thin cream (#efe7d6) bars forming a central open rectangle, four short bars joining its edge midpoints to the frame, and a tiny cross-shaped brace in each of the four corners, with a frame bar along every edge. The openings show a flat solid near-black background (#171311), so the lattice can be cut out later. The pattern repeats in both directions. No wood grain. |
| `patterns/highlands/maze` | Flat, front-on decorative panel of a labyrinth relief on pale stone slab (#c4bba8): an eight-by-eight cell maze whose passages are wide square-ended channels in grey-brown (#6e665a), each with a lighter inner stripe (#8a8274), joined as one branching path with dead ends, wrapping at the edges, and faint pale grid lines between cells. The pattern repeats in both directions. Muted stone colours only. |
| `patterns/highlands/caihua` | Flat, front-on decorative panel of a Chinese painted beam (caihua), a long horizontal band about eight times wider than tall: ground blue (#3a6aa8) with green (#3f7a4a) stripes along the top and bottom edges. At each end a teal (#2e9488) block holding a large whorl-flower of concentric rings in white (#efe7d6), teal, blue and ochre (#d19a3a), with black (#201a18) petal scrolls and a smaller whorl either side. In the middle a long white-edged panel with pointed ends, red (#b3322a) inside, filled with six ochre cloud scrolls; ochre dots at the joints and a thin black outline. The pattern repeats horizontally. Full colour, painted. |
| `patterns/highlands/tile-d` | Flat, front-on decorative panel of Hungarian glazed fish-scale roof tile: rows of rounded scales, each outlined dark with a pale glint along its curve, alternate rows offset by half a scale, set on near-black grout (#1a1614). Colour runs in chevron bands of green (#2f7a44), gold (#d8a830), blue (#2a5aa8), cream (#e8e0cc), red (#9a2a24), teal (#2e9488). The pattern repeats in both directions. Full colour, glossy glaze. |
| `patterns/highlands/tile-s` | The same fish-scale roof tile, chevron bands leading with red (#9a2a24), then gold (#d8a830), cream (#e8e0cc), green (#2f7a44), blue (#2a5aa8), gold (#d8a830). |
| `patterns/highlands/tile-t` | The same fish-scale roof tile, chevron bands leading with green (#2f7a44), then gold (#d8a830), teal (#2e9488), cream (#e8e0cc), blue (#2a5aa8), gold (#d8a830). |
| `patterns/highlands/tile-w` | The same fish-scale roof tile, quiet and subdued: chevron bands in oxblood (#8a2a22) and bottle green (#2f5a3a), two bands of each in turn, with a single narrow ochre (#c8a040) band between. |

("The same ..." rows: send the `tile-d` prompt, then change only the colour sentence.)

#### Reed Lake

Palette (`74-rl-mat.js:88`): madder red #a8352a, ochre #d19a3a, black #221c18, undyed white #efe4cc, indigo #2f4a7a,
green #3f7a5a, plum #6a2a4a. Lattice strips #c9b06a and #b89c5a; fringe #cbb36e and #b39c5c.

| id | Material line |
|---|---|
| `patterns/reedlake/chakana` | Flat, front-on decorative panel of woven Andean textile with a stepped cross (chakana) motif: a bold stepped cross with a small round hole at its centre, drawn as blocky right-angle steps. Nested in the same cross are an outer black (#221c18) cross, a madder red (#a8352a) cross and a smaller ochre (#d19a3a) cross with a black dot, set on a plain madder red field. Hard-edged, flat dyed colours with a visible weave. Full colour. The pattern repeats in both directions. |
| `patterns/reedlake/reed-lattice` | Flat, front-on decorative panel of an open diamond lattice, like the front of a reed mudhif: flat reed strips crossing diagonally at 45 degrees in both directions, spaced so the gaps are square diamonds of plain flat dark background (#1a1614). One set of strips is straw gold (#c9b06a), the other slightly darker (#b89c5a). A thin dark brown shadow line (#3c2814) runs along one edge of each strip. Full colour. The pattern repeats in both directions. |
| `patterns/reedlake/fringe` | Flat, front-on decorative panel of loose reed ends hanging from an eave: about seventy thin, slightly curved strands, each hanging straight down from the top edge. Lengths are uneven, between half and full height. Each strand leans a little to one side. The strands are pale straw (#cbb36e) or darker straw (#b39c5c), spread randomly on a plain flat dark background (#1a1614). The strands end ragged and loose. Full colour. The pattern repeats horizontally. |
| `patterns/reedlake/shield` | Flat, front-on decorative panel of a round painted hide shield, centred in the frame: a thick black (#221c18) rim ring, a madder red (#a8352a) field, and in the middle a large white (#efe4cc) stepped cross (chakana) with a round black dot at its centre. The square corners outside the rim are madder red. Flat, hard-edged paint. Full colour. A single motif, not a repeat. |

#### Dalab

Palette (`69d-dalab-mat.js`): cream wash #e6d8b8, red ochre #a8382a, turquoise #2f9a8a, gold #d8a838, black #2a2420,
cream paint #efe6cc, deco turquoise #3f9a88, deco cream #e4c69a; checker ochre #cc8c48, turquoise #469686, cream
#e4cea6, terracotta #b86e40 (converted from per-pixel RGB, so approximate); relief greys #bcb4a8 and #847e76;
turquoise relief cream #e2c496 and turquoise #388c7c. The source has four mural variants (`dMuralTex`, lines 76-115):
the two written below are variants 1 and 2; variants 0 (god plus hero) and 3 (lizards with maize) can follow.

| id | Material line |
|---|---|
| `patterns/dalab/mural` | Flat, front-on decorative panel of a painted frieze on cream lime wash (#e6d8b8). A thin red ochre (#a8382a) stripe runs along the top and bottom edge. Inside each is a band of black (#2a2420) stepped-fret meander and a thin turquoise (#2f9a8a) line. Between the bands, three heroes in profile walk left in a procession, carrying spears and banners in gold (#d8a838), turquoise and red. Each hero has a black helmet, gold body, turquoise belt and black legs. The paint is worn and faded at the foot. The pattern repeats horizontally. Full colour. |
| `patterns/dalab/god-panel` | Flat, front-on decorative panel of a painted mural on cream lime wash (#e6d8b8). Red ochre (#a8382a) stripes and black (#2a2420) stepped-fret bands run along the top and bottom edge. Two stylised avatars of a god flank a central sun with a great eye. Each avatar has a red head block with a cream (#efe6cc) eye ringed by alternating red and gold (#d8a838) rays, a turquoise (#2f9a8a) body with gold stripes, and black staffs at its sides. The sun has gold and red triangular rays, a cream eye and a black pupil. The paint is worn. The pattern repeats horizontally. Full colour. |
| `patterns/dalab/checker` | Flat, front-on decorative panel of a diamond-lattice tile: diagonal lozenges in four colours, ochre (#cc8c48), turquoise (#469686), cream (#e4cea6) and terracotta (#b86e40), with thin dark brown grout lines between them. The lozenges alternate in a regular chequered order, with slight mottling in each tile. The pattern repeats in both directions. Full colour. |
| `patterns/dalab/deco-panel` | Flat, front-on decorative panel of a tall, narrow pier ornament (about 1 to 4 proportions): a turquoise (#3f9a88) field inside a thin cream (#e4c69a) frame. A stylised avatar is drawn in cream: a fan of seven short rays over a square head with a turquoise eye-hole and pupil, a horizontal shoulder bar, five vertical lines below, then four stacked chevrons and a small stepped base. Flat, hard-edged shapes. Full colour. A single panel, not a repeat (use it as a decal, not a tiling sheet). |
| `patterns/dalab/relief` | Flat, front-on decorative panel of carved grey andesite stone, drawn as a stepped meander: square cells, each with nested stepped square rings that alternate raised and recessed around a raised central square. Adjacent cells are offset so that the ring parity flips in a chequer, and a narrow groove separates the cells. Raised faces are light grey (#bcb4a8) with a lit top edge, and recesses are darker grey (#847e76). The surface is slightly pitted. Near-greyscale, no other colour. The pattern repeats in both directions. |
| `patterns/dalab/relief-turquoise` | Flat, front-on decorative panel of inlaid stepped meander: square cells, each with nested stepped square rings that alternate between cream (#e2c496) raised faces and turquoise (#388c7c) recessed inlay, around a cream central square. Adjacent cells are offset so the ring parity flips in a chequer, and a narrow turquoise groove separates the cells. The surface is lightly mottled. Full colour. The pattern repeats in both directions. |

#### Iziz and Voth

Iziz and Voth colour everything by per-instance tints over near-grey textures, so their **base surfaces are
near-colourless** (neutral rows below; the library's `.neutral` copies, see "Neutral copies"). Their pattern sheets
are full colour. Iziz palette from `69b-vern-mat.js`: orange #e07a2a (also #c4641e, #f2a24a), sand #e9cb8c /
#dcb474 / #e2ab5e / #e6bd7e, teal accent #2f8f8a (the only teal in the source; the "deep teal" below is a darker
value picked for the tile, #1f6f6b), cream #f1dba6, brick red #c9442a, deep red #9c2d2d, gilt #d0a53c
(`75-port-embassy.js:39`), timber #5a4632. The one mosaic in Iziz's source is blue, cream and gold, not the
orange-and-teal below: the owner's prompts below supersede it. Voth palette from `05-palette.js` (marble #e8e1d2,
jade #3f6b56, basalt #2b2a28, lapis #1f3f6e, porphyry #5e1e2d, fungus #8d6a5e..#7a6660, stalk #bdb49c, banner
#7a2028 #8a2f2a #5c4028). Voth has no painted pattern painters at all: its banners are flat tints and its inlay is
geometry in jade, lapis and porphyry, so every Voth sheet below is new art, not a copy of a painter.

Iziz, owner-written (base template with the tintable sentence for the neutral rows):

| id | Material line |
|---|---|
| `earth.adobe` (Iziz, neutral) | Banco mud plaster with chopped straw: smooth hand-troweled earth render with fine straw fibres and flecks showing through, soft trowel sweeps, hairline shrinkage cracks, small chips and a few pale lime-wash patches. Near-colourless: pale grey-beige only, so it can be tinted. |
| `metal.scrap` (new id, Iziz, neutral) | Reclaimed riveted patchwork sheet metal: overlapping salvaged sheets of different sizes and thicknesses, each fixed with rows of round rivets and bolts, some patches bent, dented or lapped at the edges, light scratches and a little rust bleeding from the rivets. Near-colourless grey only, so it can be tinted. |
| `wood.reclaimed` (new id, Iziz, neutral) | Sun-bleached reclaimed boards with old paint: horizontal weathered planks of unequal width, deep grain and nail holes, flaking remains of old paint showing the grey wood beneath. Near-colourless: pale grey only, so the paint can be tinted. |
| `cloth.tarp` (new id, Iziz, neutral) | Patched stitched tarp: heavy coated canvas in panels sewn together with visible thread seams and hems, brass-ringed eyelets along one edge, rectangular patches stitched over holes and repairs, faded creases and old water stains. Near-colourless grey only, so it can be tinted. |
| `patterns/iziz/mosaic` | Flat, front-on decorative panel of glazed star-and-diamond mosaic: eight-pointed stars in burnt orange (#e07a2a) alternating with diamonds in deep teal (#1f6f6b), set on sand (#e2b676) ground with cream (#f1dba6) tesserae around each star, thin pale grout lines, glossy glaze with slight variation between tiles. The pattern repeats in both directions. Full colour. |
| `patterns/iziz/tile` | Flat, front-on decorative panel of hand-painted square glazed tile: a grid of square tiles, each with a stylised flower or star in burnt orange (#e07a2a) and deep teal (#1f6f6b) on a sand (#e2b676) and cream (#f1dba6) ground, brush-painted with slight unevenness and a glossy glaze, thin grout between tiles. The pattern repeats in both directions. Full colour. |

Iziz, from its palette:

| id | Material line |
|---|---|
| `patterns/iziz/banner` | Flat, front-on decorative panel of hand-woven banner cloth with a visible plain weave, slightly faded and uneven dye. Ground of Iziz orange (#e07a2a) with a large cream (#f1dba6) device repeated in a half-drop grid: a ring with a vertical bar and a short horizontal bar crossing it, each device framed by a thin deep red (#9c2d2d) border line. Teal (#2f8f8a) stripes run along the top and bottom of each cell. The pattern repeats in both directions. Full colour. |
| `patterns/iziz/gilt` | Flat, front-on decorative panel of gilt work: hammered gold leaf (#d0a53c, darker #8a6a2a in the recesses and #e4c46a on the raised edges) laid over dark brown (#5a4632) timber, in a repeating ornament of a row of small round bosses between double fillets, with a ring-and-cross rosette motif between them. Slightly worn so the brown shows at the edges. The pattern repeats horizontally. Full colour. |

Voth, owner-written:

| id | Material line |
|---|---|
| `plaster` (Voth, neutral) | Lime stucco over mud-brick: smooth chalky render with the ghosted courses of the brick showing faintly through, patch repairs in slightly different finish, hairline cracks and fine weathering streaks. Near-colourless: off-white to pale grey only, so it can be tinted. |
| `organic.fungus` (Voth) | Skin of a giant mushroom, in two zones on one sheet: the cap, smooth leathery skin with fine radial fibres, small pores and pale speckles; and the stalk, pale, vertically fibrous flesh with soft ridges and a few bruised patches. Muted natural colours, so it can be tinted. |
| `organic.chitin` (Voth) | Overlapping insect-shell plates: smooth hard segments with fine growth ridges, slight waxy sheen, small pits and scratches at the edges of each plate. Muted dark tones, so it can be tinted. |
| `metal.scale` (new id, Voth, neutral) | Hammered fish-scale dome plating: rows of overlapping rounded metal scales, each hand-hammered with small dents, a rivet at the top of each scale, slight variation in size. Near-colourless metal grey, so it can be tinted gold or bronze. |
| `patterns/voth/inlay` | Flat, front-on decorative panel of a stone inlay band: stepped chevrons and hooks cut from jade (#3f6b56), lapis (#1f3f6e), red-purple porphyry (#5e1e2d) and basalt (#2b2a28), set into a polished marble ground (#e8e1d2), with thin dark joints between the stones. The pattern repeats horizontally. Full colour. |
| `patterns/voth/banner` | Flat, front-on decorative panel of banner cloth woven in stepped bands and hooked spirals in ash yellow (#e8d9a0), dark red (#7a2028) and charcoal (#2b2a28), visible weave, slightly faded and uneven dye. The pattern repeats horizontally. Full colour. |

The Ancient Port (`settlements/port`, a sibling of the Ancients kit, built mainly for the planned settlement of Hook) and, separately, the Hykkousoi of Ys (the nacre culture). They are different cultures and builds; their rows are kept apart below (`patterns/port/*` and `patterns/nacre/*`).

Port palette: container white #dcd8cf, blue #2f5f8a, oxide red #9a3a28, mustard #c89a3a (`74-port-dress.js:6`); hazard
yellow #d9a12c (`89y-sp-1-yard.js:43`); iron #2c2e32; antifouling red #8c3026, topsides slate #3c4652, red-oxide
primer #9a5c3e, shop primer #8d918f, deck #55534e (`82-dd-dock.js:24-28`); rust #7a4630. Port has no painted
hazard or livery painter: the first and last rows extrapolate its colours. Hykkousoi palette (`60-hyk-mat.js:9-24`):
shell #f3ece0, coral pink #e8a08c, teal #3e9c96, sea green #6aa892, nacre #f4f0ea, bone #f1e9d8, tideline black
#2a2622. For these, use the nacre lighting sentence ("soft even lighting that shows the natural colour bands").

| id | Material line |
|---|---|
| `patterns/port/hazard` | Flat, front-on decorative panel of industrial hazard striping: bold diagonal stripes at 45 degrees alternating safety yellow (#d9a12c) and near-black iron (#2c2e32), each stripe about equal width, painted on steel, slightly chipped and scuffed at the stripe edges with a few specks of rust (#7a4630) and faint grey dirt. Flat paint with a faint roller texture. The pattern repeats horizontally. Full colour. |
| `patterns/port/hull-paint` | Flat, front-on decorative panel of ship hull paint in three horizontal bands on riveted steel plate: antifouling red (#8c3026) at the bottom, a thin crisp white boot-stripe (#e9e8e4) in the middle, and slate topsides (#3c4652) at the top. Weld seams run vertically between plates, with a few streaks of rust (#7a4630) running down from the seams and scraped patches showing the paint below. The pattern repeats horizontally. Full colour. |
| `patterns/port/primer` | Flat, front-on decorative panel of unfinished steel hull plating in primer: overlapping patchy coats of red-oxide primer (#9a5c3e) and grey shop primer (#8d918f), visible roller and spray edges, bare dark-grey steel (#55534e) showing in scratches, vertical weld seams and rows of round rivets, a few orange rust blooms (#7a4630). Matte finish. The pattern repeats in both directions. Full colour. |
| `patterns/port/livery` | Flat, front-on decorative panel of shipping-container side livery: vertical corrugated steel ribs, ten per panel, painted in a block colour (oxide red #9a3a28; run variants in blue #2f5f8a and mustard #c89a3a), a wide off-white (#e8e4da) band across the top carrying abstract bars where lettering would be (no readable text), dark edge rails, dents, scuffs and rust (#7a4630) creeping up from the bottom. The pattern repeats horizontally. Full colour. |
| `patterns/nacre/shell-inlay` | Flat, front-on decorative panel of shell inlay: pieces of cut calcareous shell in cream and ivory (#f3ece0, #e6dccb, #f1e9d8) set into a pale warm-stone ground (#d9cfbc), arranged as a frieze of overlapping scallop and spiral forms with fine hairline joints, subtle concentric growth rings and tiny pits, with a few coral-pink (#e8a08c) and sea-teal (#3e9c96) pieces as accents. The pattern repeats horizontally. Full colour. |
| `patterns/nacre/pearl-mosaic` | Flat, front-on decorative panel of pearl mosaic: staggered rows of small fish-scale tiles, each a rounded scale with a thin dark seam around its edge and a lighter top, in pale pearl white (#f4f0ea, #eae8ee, #f0eef4) with a faint pink and lavender sheen, a scattering of sea-teal (#57b2ab) and sea-green (#6aa892) tiles, and a few coral-pink (#f0b5a2) ones. The pattern repeats in both directions. Full colour. |
| `patterns/nacre/banded-trim` | Flat, front-on decorative panel of nacre-banded trim: a horizontal frieze of three parallel bands of polished mother-of-pearl in pearl white (#f6f2ec) shading to pale pink (#f0b5a2) and sea-teal (#7fcfc6), separated by thin ivory-bone strips (#e9e0cc) and a dark tideline-black edge line (#2a2622) at the bottom, fine wavy growth lines along each band, soft pearly depth. The pattern repeats horizontally. Full colour. |

#### Yuni and Locus (one shared set)

The two builds' painters and palettes are identical (`yuni/src/47-texture.js`, `05-palette.js:61-68`). Their in-game
mosaic and relief are greyscale (tinted), so these prompts take colours from the palette.

| id | Material line |
|---|---|
| `patterns/yuni/mosaic` | Flat, front-on decorative panel of trencadis mosaic: irregular broken ceramic shards, each a different angular polygon about 3 to 5 cm across, set in thin dark grey grout (#3a3632) with no regular grid. Shard colours are glossy blues (#2a6ab0, #3a86c8, #1e4e90, #58a8d8), teal-greens (#2f8a6a, #46a080, #7ac0a0), warm gold and terracotta (#d8a030, #c8642a, #e8c860) and cream white (#f0ece0), mixed evenly with no larger design. The pattern repeats in both directions. Full colour. |
| `patterns/yuni/paintbw` | Flat, front-on decorative panel of Kassena-style geometric wall painting on plaster, in horizontal bands of equal height separated by thin black lines: zigzag chevrons, concentric diamonds, diagonal net or lattice, and rows of triangles. Colours are black (#1a1714), off-white (#f2eddb), earth red (#9e3321) and ochre (#c78f52) only, hand-painted with slight unevenness and fine grain. The pattern repeats horizontally. Full colour. |
| `patterns/yuni/paintcol` | Flat, front-on decorative panel of Hausa-style polychrome painted relief on plaster, a grid of square cells outlined in green (#247a4c), on a gold ground (#edcc5c). The cells alternate between a rosette with blue (#2973b8) petals around a red (#b83329) centre, a nested diamond knot in red and teal (#1a9ea8), a spiral in blue, red and cream (#f5f0e0), and a cross-hatched plait in green with a red dot. Slightly uneven hand-painted edges. The pattern repeats in both directions. Full colour. |
| `patterns/yuni/relief` | Flat, front-on decorative panel of low-relief moulded plaster in one pale warm sand colour (#d8c8a8), lit softly and evenly so only the form shows. Horizontal bands of equal height alternate: a row of circular spiral rosettes, and a row of square interlaced knots made from nested diamond and square raised ridges, each band separated by a plain smooth course and a thin groove. Faintly hand-finished surface. The pattern repeats horizontally. Mostly one colour (pale sand) with soft tonal depth. |

**Status (2026-10-05): Yuni has adopted the library** (`settlements/yuni/materials.json`; its `KNOWN_ISSUES.md`,
"Material library"). The base rows below are covered by sets already in the library: `plaster.washes` by `plaster`
(neutral, tinted), `tile.terracotta` by `roof.tile` (neutral pan tiles, tinted), `earth.banco`, `concrete.board`.
**Delivered 2026-10-05 and processed** (`tools/textures/batches/chatgpt-2026-10f-yuni.json`): `patterns/yuni/paintbw`,
`paintcol` (cropped to 4 x 4 whole cells first), `relief`, and the three rows below. `patterns/yuni/mosaic` (full colour)
is not needed: the game tints its mosaic per dome, so the neutral `mosaic.trencadis` serves. The rows, all reusable by
Locus (same painters and palette) and noted per row, with the base template and the tintable sentence:

| id | Material line |
|---|---|
| `mosaic.trencadis` *(supersedes the base row below; tinted in game, so neutral)* | Trencadis mosaic of irregular broken glazed ceramic shards, each a different angular polygon about 3 to 6 cm across with slightly rounded broken edges, set in thin recessed grout lines about 4 mm wide in dark warm grey (#3a3632). Every shard is the same pale off-white glazed ceramic (#e8e4da), varying only slightly in tone from shard to shard, with a faint satin glaze; no coloured shards, no larger design, no regular grid. Reuse: Locus, Iziz and Voth inlay and any culture's broken-tile work, tinted per use. |
| `metal.ancient.white` *(refines the base row below)* | Ancient white metal cladding: a grid of flat rectangular panels, exactly two across and four down, each panel twice as wide as it is tall, separated by narrow recessed seams with a thin dark shadow line. A small round recessed fastener sits near each panel corner. Near-white satin enamel (#e6e4dc), faint horizontal brushed grain, panels differing very slightly in tone, and pale grey tarnish (#b4b0a2) gathering along the seams and in soft streaks below the fasteners. No rust, no rivets, no text. Reuse: every Ancients-lineage build's white metal (`MAT.white`), Locus. |
| `rock.columnar` *(new: the butte, `FAMMAT.column`, 40 x 64 m)* | Weathered columnar-jointed volcanic rock face seen straight on, like Devil's Tower: tall vertical polygonal columns side by side, about eight columns across the image, each column a flat or slightly rounded facet separated by deep dark vertical joints, with occasional horizontal cross-fractures at irregular heights and a few broken column ends. Grey-brown phonolite (#8c8474, #7e7768, #9a917e) with faint pale lichen patches (#a39a82) and darker water stains running down the joints (#5c574c). The columns run unbroken from the top edge to the bottom edge. Reuse: any basalt or phonolite cliff (Voth's volcano flanks, Highlands gorges, Ys' karst headlands). |

**Yuni's interiors** (2026-10-05; the base template with the tintable sentence): **delivered the same day and processed**
(`tools/textures/batches/chatgpt-2026-10g-yuni-interiors.json`), and on Yuni (`settlements/yuni/KNOWN_ISSUES.md`):

| id | Material line |
|---|---|
| `wood.beam` | Rough-hewn timber beam surface seen straight on, the grain running straight from the top edge to the bottom edge: long tight growth lines, adze facets a hand's width across, a few shallow drying checks along the grain and one or two small knots. One continuous piece of wood: no plank seams, no nails, no bolts, no bark. Warm mid-brown (#6a4e34) with slightly darker grain (#4e3a28). Reuse: every build's `timber` family (beams, posts, toron, furniture legs): Girder, Voth, Locus, Mav's Refuge. |
| `cloth.rug.pile` | The pile surface of a hand-knotted wool carpet seen straight on: dense short tufts of wool yarn in tight rows of knots, slightly matted and worn flatter in patches, a faint grid of knot rows, a few loose fibres. One plain colour of undyed wool (#cfc4b0) with natural slight variation; no pattern, no border, no fringe. Reuse: every culture's carpets, cushions and saddle-blankets, tinted. |
| `fibre.coil` | Side wall of a coiled grass basket seen straight on: horizontal coils of bundled dry grass about 1.5 cm thick stacked one above the other, each coil wrapped and stitched to the one below with thin split-palm strips in short slanted stitches, the stitches staggered row to row. Straw colour (#c8b272) with slightly darker stitching (#a08850); no pattern. Reuse: Reed Lake, Beast Rider and Highlands baskets, granary lids, skeps. |

Uncertain, to check when the images come back: Iziz gilt (the build has only a plain gilt material, so its motifs are
invented); the Iziz banner (the build draws one non-tiling banner, made a repeat here); Port hazard and livery
(extrapolated); the Hykkousoi inlay and trim (the build has no such painters).

#### Prompts checked against the code (2026-10-02)

The rows from here to "Scan-library metals" were written, then checked against each build's palette and painters (a
research pass over `src/` only). Hex values below are the code's. Four rules came out of it:

- **Maps are mostly near-grey and the instance tint carries the colour** (Highlands, Voth, Yuni, Xanadu, Ancients). A
  prompt for a tintable surface says so, and its hexes are the *tints* the code applies. Jimjam, Reed Lake, Dalab and
  Ring Sea paint full colour: no tint sentence.
- **Row marked "design-only"** = the code draws no such texture (a flat colour, or geometry). Keep it only if the owner
  wants the new art. Nothing is lost if it is dropped.
- **Delivered images that go beyond the code** (peeling render, eroded adobe, tent and sail canvas) stay as design
  additions, marked.
- The painters work from 1024 px-ish canvases; "2 m tile" and similar are the code's world-unit repeat, usable as the
  record's `scale`.

#### Canvas, shared by every culture

| id | Material line |
|---|---|
| `cloth.canvas` | Coarse heavy canvas in a plain over-under weave, a 3 px thread grid, bleached in soft patches, warm tan (#c8b08a). (Code: Highlands salvage tarp. Owner additions: water stains, a stitched mended patch.) Muted, so it can be tinted. |
| `cloth.canvas.tent` *(design-only)* | Sun-bleached heavy tent canvas, patchy fading, creases from folding, a sewn seam across, a few scorch marks, warm tan (#c8b08a). Muted, so it can be tinted. |
| `cloth.canvas.sail` *(design-only)* | Old sailcloth in panels with double-stitched seams, tanbark stains, patches, a rope-reinforced edge. Ring Sea sails are plain weave with 8 to 11 faint seam lines and light speckle in faction colours, so a faithful sail is a flat weave, not this. |
| `cloth.canvas.striped` | Flat, front-on striped canvas for awnings, rugs and bolsters: off-white cloth (#ece6dc), six broad vertical stripes per tile alternating one dye colour with the off-white, each with a thin dark line beside it, fine woven grain. Dyes: madder #b0453a, indigo #3a4f7a, saffron #d4a040, cream #ece2cc, olive #7a7a48, umber #7a5034. Neutral base, so it can be tinted. |

#### Republican, Rustic and Tribal (Highlands)

The Iron Republic is Russian plus Transylvanian Saxon; Rustic is the villages; Tribal is the Northwest-coast formline branch.
Highlands textures are near-grey and tinted per instance.

| id | Material line |
|---|---|
| `stone.rendered` | Cream trowelled lime render with hairline cracks and slightly darker repair patches, no flaking and no exposed brick; ashlar quoins sit at the corners. Cream #eee3c8 (also #e8dcc0, #f2ead6, #e4d4b0); Saxon painted washes ochre #e0b870, sand #d8c0a0, sage #c8d0b0, apricot #e4c89a, rose #d8a888. Muted, so it can be tinted. |
| `stone.rendered.ruined` *(design addition, as delivered)* | The same lime render flaking in large patches to show brick and rubble, hairline cracks, damp streaks near the base. Muted, so it can be tinted. |
| `wood.log.carved` | Round horizontal logs, six courses per 2 m (about 0.33 m each), lit rounded crowns, dark moss or clay chinking between courses, drying checks along each log. Muted, so it can be tinted: fresh pine #c08850 (#b07a44, #c89a60, #a87040), aged silver-grey #8a7e70 (#7a6e60), tarred #4a3426 (#3a2a20), Falu red #8a2e22 (#9a3a28). |
| `wood.rustic.plank` | Horizontal 0.25 m boards with dark shadow gaps, staggered butt joints, grain and a few knots. Warm tint, for example aged #8a7e70 or pine #c08850. |
| `roof.shingle.onion` | Silvered split wooden shingles in staggered 0.25 by 0.5 m rows, each row with a darker shadow band at its foot. Tints #9a8a78, #8a7a68, #a8987e, #b0a28c. Onion domes use this, the fish-scale map below, or gold #d4a03a. |
| `roof.scale.tinted` (replaces `roof.tile.saxon`: the code has no clay tile here) | Rounded fish-scale roof tiles about 0.25 m across, grey, each with a shadowed rim, staggered rows. Tinted roof red #a0402a (#8a3424, #b04a30) or slate #565c66 (#4c525c). |
| `metal.verdigris` | Patinated copper sheet: brown copper (#96623e) showing through pale blue-green verdigris (#44988a) in mottled patches, with vertical run streaks heavier toward the bottom. No seams, no rivets. |
| `stone.ashlar.limestone` | Coursed limestone ashlar blocks 1.2 by 0.6 m, recessed mortar, mottled weathering, a lit arris on each block, cream-grey; tints #d8d0bc, #c8c0ac, #e0d8c4, #cfc4a8. |
| `stone.fieldstone` | Rounded fieldstones in deep mortar, grey-brown, 4 m repeat; tints #9a948a, #8a8478, #a8a296. |
| `rock.cliff.granite` | Fractured grey granite (#8a8680) with vertical joints, bedding strata, water streaks and lichen. |
| `roof.turf` | Mottled green sod with bare patches; tints #a0b080, #90a070. |
| `patterns/republic/timber-frame` *(design-only: the code builds it from geometry)* | Flat, front-on panel of half-timbered wall. The Republic: beams #5e2a1c (#6a3020, #542418, #6e3624) on cream plaster #eee3c8. The Tudor style: beams #2a221e (#322822, #3a2a22) on #f2eee4. The pattern repeats horizontally. |
| `patterns/republic/folk-painted` *(design-only)* | Flat, front-on panel of Russian folk painted wood: bold stylised flowers, leaves and scrolling vines in red #b3322a, teal #2e9488, blue #3a6aa8 and ochre #d19a3a with cream, on a black #171311 ground, hand-painted, slightly worn. The pattern repeats both ways. (Code: the white or teal-and-red lace valance, same trim colours.) |
| `patterns/tribal/formline` | Flat, front-on panel of Northwest-coast formline painting: swelling black #171311 lines with ovoid and U-shapes in red #b3322a and teal #2e9488 on a cedar ground #b27a4c (shade #8a5634); white #efe7d6 as the ground only on the white variant. No readable figures. The pattern repeats horizontally. |

#### Yuni and Locus, base surfaces

The painted pattern rows are in "Yuni and Locus" above. Yuni's textures are near-grey and tinted.

| id | Material line |
|---|---|
| `earth.banco` | Sahel banco mud plaster with arc-shaped palm-smoothing swipes, chopped-straw flecks and hairline cracks. Neutral, so it can be tinted: ochre #c89a62 (#bc8e58, #d4a66e, #b08250, #dcb27c) or laterite red #b4683e (#a85c36). |
| `earth.banco.eroded` *(design addition: the code has only a dark adobe, #8a6a48 and #7c5e40)* | Mud-brick wall eroded by rain: bare bricks showing through broken plaster, rounded edges, vertical wash gullies, a few lighter patched repairs. |
| `wood.toron` | Dark brown stub-cut palm beams projecting from a mud wall, rough grain along each post; tints #4a3624, #3e2e20, #56402c. |
| `concrete.board` | Concrete with horizontal board lines every 1 m, crack lines and darker stain bands, in dull grey-brown #9a958a (#8c887e, #a6a094, #7e7a72). No tie holes. |
| `metal.ancient.white` | Ancient white metal panels 2 by 1 m with recessed seams, a fastener at each corner, faint brushed grain and slow tarnish; tints #e6e4dc, #dad8ce, tarnish #b4b0a2. |
| `plaster.washes` | Brushy lime wash. Whitewash #f2eee2, light blue #a8cce0, indigo #2e5a8a (#28507c). |
| `tile.terracotta` | Overlapping terracotta pan tiles; tints #b8633a, #a85832, #c47044, #9c5030. |
| `mosaic.trencadis` | Broken-tile shards on dark grout, in blues #2a6ab0, #3a86c8, #1e4e90. |

#### Ancients and the kits forked from them (Screamers, Iziz's Ancient Iziz Style)

Ancients textures are near-grey and tinted per instance. The kit has no glass, stone-block, basalt or plate texture, so those
rows are cut.

| id | Material line |
|---|---|
| `concrete.ancient` | Board-formed concrete of an ancient megastructure: horizontal boards about 0.65 m deep, each poured a slightly different shade, a dark groove with a lit lip at every joint, a regular grid of round recessed form-tie holes with a rust weep below each, damp streaks running down from the joints, fine aggregate speckle. Warm pale grey #d2cec6; the ruined version is darker, #7c746c. |
| `stone.rubble.ancient` (replaces `stone.megalith`) | Mottled warm grey rough stone, fine non-directional grain, no joints or courses; tint #d6ccbe. |
| `metal.ancient` *(delivered 2026-10-05)* | Ancient white panel metal: warm near-white sheets, each a slightly different tone, recessed seam grooves with a lit lip, a round fastener at each sheet corner, faint vertical brushed grain. Neutral, so it can be tinted. |
| `metal.ancient.rust` | Tarnished steel: dull silver-grey (#7e766c) turning orange-brown rust (#723c26 to #a65a36) in runs that widen downward, a dark band under each ledge, panel seams ghosting through. Neutral, so it can be tinted. |
| `metal.worn` | The white panel metal washed with orange-brown tarnish (#b07054) at the seams, fasteners and runs. |
| `metal.verdigris` | See "Republican, Rustic and Tribal"; the Ancients use the same map (copper #96623e, patina #44988a). |
| `ground.ruin` *(delivered 2026-10-05)* | Red-brown laterite soil (#96523a) with soft mottling and fine grain, turning to moss green (#466e2d) in patches. |
| `paving.concrete` | The ancient concrete texture tinted a dull brown-grey, #8e8578. |
| `thatch.palm` (Screamers) | Palm thatch: base #6b5a33 with many short olive-brown strokes and nine darker horizontal binding lines; tint #a8996f. |
| `wood.lash` (Screamers) *(delivered 2026-10-05)* | Lashed hardwood: vertical fibre streaks on brown #6a5038, four pale cord bands (#bcaa78) across. |
| `metal.scrap.corrugated` (Screamers) | Flattened corrugated salvage sheet with 0.8 m ribs, orange-brown rust and dents; tint #8a6a52. Plain Ancients salvage is galvanised grey with rust to #a05a44. |
| `wood.timber` | Sawn boards 0.25 m wide, brown, grain along each board, dark gap between boards. |
| `cloth.tarp` (Ancients) | Sun-bleached woven tarp, fine weave, tan; tint #c8b08a. |
| `bark.ironbark` | Ironbark #5a3424: deep dark furrows with red-brown highlights and black cracks. |
| `bark.ghostwood` | Ghostwood #d9d4c4: pale birch-like peel with dark lenticels. |
| `bark.prismgum` | Prism gum #8c8666: shed strips in several colours. |
| `bark.baobab` | Baobab #7a6e5e: smooth, wrinkled across. Pale boughs #b8a494. |
| `patterns/ancients/glyph-band` *(design-only)* | Flat, front-on panel of a carved glyph frieze: rows of abstract geometric glyphs and bands (no readable text) incised into pale stone (#c4bba8). (Code: raised rectangular glyph cells in clusters on concrete facets.) The pattern repeats horizontally. |
| `patterns/screamers/daub` *(design-only)* | Tribal paint over cracked concrete: hand-smeared ochre (#b8683e), white and black handprints, tally marks, spiral daubs, flaking. |

#### Jimjam

Jimjam is full colour and untinted (instance tint is white). The textures are in `settlements/jimjam/src/60-jj-mat.js`.

| id | Material line |
|---|---|
| `brick.jimjam.red` | Fine fired red brick in running bond, each course half a brick out of step, stretchers about 24 by 8 cm. Faces vary between deep red-brown #8f2f24 and warm red #b84a34. Mortar pale grey-buff #cbbca6 in thin joints. Every sixth course is a header course of half-length bricks in darker oxblood (#7d2a22, #8a3026, #6e241e). About a quarter of the bricks have a darker scorched end; fine dark and light speckle. Full colour. |
| `brick.jimjam.yellow` | Fine fired yellow-ochre brick in running bond. Faces #c99239 to #e0ae55, mortar pale cream #efe2c8. Every sixth course is half-length headers in deeper ochre (#bf8634, #c88f3a). Scorched ends and speckle. Full colour. |
| `brick.jimjam.deep` | Dark oxblood brick in running bond: faces #6f241e to #8c3428, mortar #a8957e, heavy speckle. For plinths, copings and flat roof slabs. |
| `brick.jimjam.dark` | Very dark brown-red brick: faces #33231f, #3e2a26, #4a2f29, #5a3328, #7a2e24; mortar #8f8170. |
| `brick.jimjam.band` | Red running-bond brick with a gold-yellow header band every fourth course (#d8a447, #cf9a3f, #e0ae55); mortar #cbbca6. |
| `stone.marble.trim` | White marble ashlar in running bond, blocks 1.2 by 0.6 m, four courses to a tile. Base #f2eee6 with soft cloudy patches, meandering grey-brown veins running diagonally (about 26 per tile), thin grey-brown joint lines with a white highlight below. Polished. |
| `roof.dome.tile` | Overlapping fish-scale tiles in staggered rows, each scale lighter at the top and about 38 percent darker at the bottom, a dark gap between scales. Three colourways, full colour: terracotta #c4602f (gaps #6e3018), slate #3a404e (gaps #1c1f26), gilded #e2b33a (gaps #8a6514, metallic). |
| `plaster.jimjam.ochre` | Lime-plaster wash #dfae55 mottled with brown and cream blotches, fine grain, a few hairline cracks; 4 m tile. For poor houses. |
| `inlay.jimjam.sunray` | Round plaza inlay: 32 alternating sectors of red (#a8322a) and gold (#d9a520) on cream #efe5cf, a dark slate (#2f3440) disc at the centre with a gold (#e4b54a) disc inside. |
| `patterns/jimjam/shaft-*` (spiral, chevron, diamond, ogee, fleur, tracery) | Flat, front-on panel of fired-brick relief: a red brick ground (#a94332) with faint horizontal course lines about every 10 px and fine speckle, carved with bold pale-gold (#e5b66a) lines forming [two sine spirals / zigzag chevrons / open diamond lozenges on a regular grid / vertical ogee waves / fleur-de-lis on a grid / sine tracery waves]. The pattern repeats both ways. Full colour. (Replaces the invented `patterns/jimjam/brickwork`.) |

#### Shade and the Eastern Nomads (sedesert)

Shade and the sedesert biome share one set of painters (`settlements/shade/src/77a..e`, `35-core-strata.js`).

| id | Material line |
|---|---|
| `rock.sandstone` | Layered desert sandstone cliff face in horizontal beds of different thickness: thick cross-bedded sandstone in rust and orange (#b5643a, #c2723f, #a85a36, #bd7a4e, #c98a58), thin purple-brown shale seams (#7b4a3e, #6f4a44, #80503c), chocolate mudstone (#93553f, #8a5a48, #9c6248), pale buff bleached bands (#d9b48a, #e0c39a, #cfa27a) and rare grey-green beds (#8c8a6e, #9a9478). Beds dip gently and wander, with fine laminae. Dark desert-varnish streaks hang from the top of each bed and fade down it; pale dust (#c9a27e) sits on the ledges. |
| `rock.sandstone.carved` | Smooth chisel-cut pale grey stone with fine short diagonal tool marks, neutral grey base (#d6d6d6) with light (#f5f5f5) and mid-grey (#aaaaaa) strokes. The code tints it by world height with the cliff's strata colours. |
| `rock.sandstone.boulder` | Red sandstone with horizontal bands of varying lightness, grain and the occasional dark seam (#321e14), warm brown. |
| `earth.pueblo` | Hand-smoothed adobe plaster, warm pale sand-grey (#e2d6c8), mottled with softer darker (#beaa96) and lighter (#f0e8de) blotches, hundreds of tiny dark straw flecks, five hairline cracks. Neutral, so it can be tinted: #d8b48a, #cfa47a, #c89a70, #dcbc94. |
| `cloth.tent.black` | Coarse black-brown goat-hair cloth (#3a322c), fine horizontal thread lines, one pale brown (#786450) sewn strip seam and one dark seam (#14100e) per metre. |
| `wood.timber.pueblo` | Plain timber, grain running along it: brown #96785f with wavy darker brown #50372a grain lines; tinted #6a4a32 for vigas, ladders, poles and lintels. |
| `patterns/nomads/kilim` *(design-only)* | Flat, front-on panel of a nomad kilim rug: bold diamonds, hooks and stepped triangles in madder #b0453a, indigo #3a4f7a, saffron #d4a040 and cream #ece2cc, a visible flat weave. (Code: a block of the striped canvas.) The pattern repeats horizontally. |

#### Mav's Refuge and Girder (hypertropic jungle)

Beast Rider cloths, carved and tarred wood, thatch, cane and rope are above.

| id | Material line |
|---|---|
| `thatch.reed.mavs` | Reed thatch in courses with fibre strands and an edge shadow; tints #b09a5a, #a08a4e, #c0aa68, #8e7a44. |
| `cane.woven` | Woven split-cane over a frame, a 16 px over-under weave; tints #b89a6c, #a88a5e, #c4a878, #9a7e56, #d0b88a, dark #6e5238. |
| `roof.shingle.shakes` | Staggered dark wooden shakes; tints #6a5a44, #5a4c3a, #7a684e, #4e4234. |
| `rope.twist` | Diagonal rope twist; tints #a8966a, #98865c. |
| `trim.council` | Red lacquer #8a2f2a, gilt #b08432, verdigris #2f6a5a, deep red #7a2028. |
| `metal.rust.plate` | Plated weathering steel with seams every 1 m, rivet rows and downward streaks; tints #7a3b22, #8a4526, #6a311e, #94522c, #5a2a1a, stain #4a2a1c. |
| `concrete.girder` | Board-marked, stained, cracked concrete; tints #8a857a, #7c786e, #969084. |
| `bark.hypertree` | Ironbark #7a4630 with braided furrows; ghostwood chalk-white #e6e2d4 with dark eye-scars; prism gum with rainbow streaks (#9a8f6a, #6f9a6a, #b8683e, #5a6fa0, #8a4f78, #c2a24e); baobab #8a7a66, smooth and pitted. |
| `wood.driftwood`, `wood.bark.lashed`, `leaf.palm.thatch`, `ground.mud.wet` *(design-only)* | Not in the code. Ground is vertex colour: litter #4a3a24, red soil #7a3a26, moss #3e5a2c, river bank #4a4636. |

#### Reed Lake additions

Reed Lake is full colour (`settlements/reedlake/src/74-rl-mat.js`). The four existing rows hold, with these fixes: the chakana is three nested stepped crosses in black #221c18 (outer), madder #a8352a and ochre #d19a3a with a round black hole at the centre (the code cuts it out, so the field is yours); the lattice (#c9b06a, #b89c5a, shadow #3c2814) and the fringe (#cbb36e, #b39c5c) match.

| id | Material line |
|---|---|
| `reed.bundle` | Tightly bound reed bundles with stalks running vertically, pale straw gold (about #bea776) with dark gaps and darker nodes, two brown rope lashings per tile. |
| `ground.reedbed` | Island top: a dense mat of short straws lying every way on #b8a262, strokes of #8a7440, #d8c27e, #c4ac66 and #e6d494, dark damp patches and small green tufts (#6f8f3a, #88a050). |
| `reed.layers` | Island side: horizontal reed courses every 0.2 m, about #ac947a, darkening toward the water. |
| `fibre.reedmat.twill` | Twill weave of 0.12 m straw strips, over and under, a dark shadowed edge, straw about #c4a870. |
| `roof.thatch.totora` | Long pale straws laid down the slope in loose courses, about #b89870, the lower part of each course darker. |
| `reed.living` | Clumps of green stalks (#6f8f3a, #8aaa4c, #a8b860) with brown seed heads (#6a4a2a, #8a6a3a). |
| `fibre.net` | A square mesh of thin dark cord, #3a3226. |
| `patterns/reedlake/band` | A woven band 4:1: madder red field #a8352a, black selvedges #221c18, thin ochre lines #d19a3a, four stepped diamonds (black, white #efe4cc, indigo #2f4a7a), white zigzags above and below. |
| `patterns/reedlake/awayo` | Awayo cloth 1:1: horizontal stripes in red, ochre, black, white, indigo, green #3f7a5a and plum #6a2a4a, with black-edged bands of stepped diamonds and zigzags. |

#### Dalab additions

Dalab is full colour (`settlements/dalab/src/69d-dalab-mat.js`). The six existing rows hold, with these fixes: the checker grout is each lozenge colour darkened to 45 percent, not brown; the deco-panel pupil is cream #e4c69a; the god-panel has black feet, red staff tips and three gold stripes on the body.

| id | Material line |
|---|---|
| `earth.rammed.dalab` | Rammed earth in lifts about 0.34 m high with a dark joint line, form-board ends, pits and damp. Neutral warm grey, tinted #b5824f, #a8763f, #c4915c, #9c6d3a (foot #8a5e34). |
| `cloth.banner.dalab` | Grey cloth with a pale eye ring, rays, two bars and a fringe, tinted to the field colour. |
| `ground.turf.mound` | Cropped grass over a mound, tinted #6a9a44 or #5f8a3a, with bare mole-hill patches. |
| `mosaic.dalab` | Blue #2a6ab0 and cream diamonds with ochre centres and dark grout. |
| `patterns/dalab/mural-god-hero`, `mural-lizards` | Variant 0: a god avatar plus a hero with a red shield. Variant 3: two turquoise lizards with gold stripes either side of a gold maize sheaf. |

#### Post-apoc reclaimed set (`kits/post-apoc`)

Textures are grey and tinted per vertex. Port's rows are in the Ancient Port rows above; its code matches those hexes.

| id | Material line |
|---|---|
| `metal.container` | Corrugated container side with wide vertical ribs, four per 1.2 m, mid-grey (#bababa) with rust streaks and blotches (orange-brown) and dark specks. Livery tints #7a2e28, #9a3a2c, #2f5f8f, #3b7f6e, #4d6f3c, #c99a2e, #c5c0b4, #8a5a30, #d06a30, #6a4c7a, weathered toward rust. |
| `metal.sheet` | Patchwork sheet: overlapping rectangular patches in different greys with dark outlines, rows of dark rivets along the top and bottom of each, rust runs. Grey, tintable. |
| `glass.bottle` | Hex-packed bottle bases in mortar: round discs with a bright centre and dark rim, in green (#3f9a52, #8fe0a0), amber #c98a2a, blue #2f62b8 and clear #d5ecea, on grey-brown mortar #8e8674; 1.28 m tile. |
| `wood.plank.postapoc` | Four boards per 2 m repeat, staggered joints, nail dots, soft grain; tints #9a7a52, #8a6a44, #a88a5e, #7a5c3c, #b09468. |
| `earth.dirt` | Warm brown packed earth (#9e7e5c) mottled with crack lines. |
| `metal.steel` | Clean structural steel, brushed grey streaks with a few orange rust flecks. |
| `concrete.slab` | Pale concrete (#dcdcdc) with a 2 m grid of joint lines, corner bolts and a few vertical damp stripes. |
| `cloth.weave.sack` | Fine plain weave with a few damp patches; sack and tarp tints #b8a888, #a89a7c, #8a7a62, #c6b898, #3a6a8a, #5a7a4a, #8a4a3a, #b09a4a. |
| `metal.tyre`, `metal.drum` *(no texture in the code)* | Tyres are smooth near-black tori (#232120); drums are plain painted cylinders with two dark ring ribs (#3a3430): red #8a3a2c, grey #5a5a56, blue #2f5f8f, olive #4d6f3c, ochre #8a6a3a, mustard #c99a2e. |

#### Ring Sea watercraft (`kits/ringsea`)

Only plank, cloth, thatch, tile, hex plate, chitin and grain have painters; hull colours are per vessel.

| id | Material line |
|---|---|
| `wood.hull` | Sixteen horizontal strakes per 4 m, each a slightly different pale cream-grey, faint wavy grain lines, a dark caulking seam with a pale lit lip under each strake, two butt joints per strake with pairs of dark nail dots, scattered dark specks. Tinted per hull (the Hyk trireme #8a5a36 with a gold band #d8a640 and a blue band #3f86a6; a black waterline #3a3a30). |
| `paint.grain` | Warm near-white (#e8e4dc) with about forty faint wavy horizontal grain lines and speckle; takes the paint colour. |
| `cloth.sail` | Plain weave with 8 to 11 faint seam lines and light speckle, in the vessel's colour: Iziz #e07a2a with a #2f8f8a edge, Voth #4b2a6e, Hyk #ece6d6 with a #3f86a6 border, dhoni cream #ece2c8, moon sail #8a5a32, pandanus #c8a868, crab maroon #6a1c2a, carrack #e89a2a; generic tan #a88660. |
| `thatch.reed` | Straw strokes on #b8a67c in 8 courses with dark binding bands. |
| `tile.hull` | Staggered overlapping tiles, light centre fading to darker edges, a dark underlip. |
| `plate.hex` | Bevelled hexagonal plates, a cream-grey radial gradient with dark outlines and a centre dot, on #b8b4ac. |
| `shell.chitin` | Overlapping curved scale plates from cream (#f0e8c8) to dark (#5a503c) with dark outlines, on #6a6048. |
| `metal.hull.rivet`, `paint.antifoul`, `rope.tarred` *(design-only)* | The code has smooth metal (#3a3a3c, #2a2a2c), flat tug paint (oxide #6a2a1e, waterline #0e0e10, rust patches #8a4a2a, white band #d6d2c6) and a plain tarred rope (#3a3026). Port's antifouling red (#8c3026) and slate (#3c4652) are Port-only. |

#### Ancient Port (Hook), additions

The hexes already in the Ancient Port and Hykkousoi rows above match the code; the Hyk file is `settlements/ys/src/60-hyk-mat.js`. Container livery
colours: #dcd8cf, #2f5f8a, #9a3a28, #c89a3a, #3a6a5a, #80807c, #b8532e, #4a5070, #e8e4da, #2a4a6a; awning stripes #f4f0e6 and #c9c2b4 in 8 px bands.
Not in PLAN yet: quay concrete #cfcbc2 (coping #f0ede6, riprap #958e84), white painted steel #e9e8e4, crane steel #8a8e92, tide weed #2e3a26,
water #134a5c at 68 percent, safety yellow #d9a12c, Hyk barnacle grey #cdc8bd and weed green #3c5a3a.

#### Voth and Xanadu additions

Voth jade #3f6b56 (#35594a, #4a7d64) and porphyry #5e1e2d (#6a2434, #521826) are flat tints over the shared dressed-ashlar map, not painted textures (no veins, no crystals); the Voth ashlar is 24 warm greys (#8c8579 to #837d6f) plus marble #e8e1d2, basalt #2b2a28, lapis #1f3f6e; roof terracotta #b35a3a (#a04f32, #c36a42). `wood.willow` does not exist: the Voth willow is olive foliage (#6f7c46, #7d8a4e, #66743f, #8a9358) on a trunk of #5a4b3a with vertical grain.

| id | Material line |
|---|---|
| `stone.rammed` (Xanadu) | Rammed earth, 2 m tile, a horizontal lift every 0.375 m, each lift with a dark shadow line at its top and a lighter band below; a mottled warm tan-grey body (about #b6a995) with rain pitting. Tintable (#b89468, #a8845a, #c0a070, #9a7a52). No pebbles. |
| `plaster.xanadu.whitewash` | Lime whitewash over rubble, near-white warm grey with mottle and rain-drip streaks, 2 m tile; tintable (#f2ede2, #ece6d8, #f6f1e6, #e8e0d0). |
| `tile.xanadu.glazed` | Small glazed tiles 0.25 m square in a 2 m tile, grey-neutral with a dark grout gap and a lit arris; tinted turquoise #2aa5a0, lapis #1e3f8a, #39b0b8 or #2a80a0. |
| `stone.xanadu.rubble` | Fieldstone: irregular Voronoi stones with dark joints, grey with slight warm and cool variation, 4 m tile; tint #9a948a family. |
| `stone.xanadu.ashlar` | Dressed grey ashlar: blocks 1.2 by 0.6 m, running bond, recessed mortar, a lit arris, damp streaks; tint #b8b0a0 family. |
| `wood.xanadu.boards` | Upright and horizontal 0.25 m boards with butt joints, knots and grain; tints #a87a4e, #8a7e70, #5a3a24. |
| `band.xanadu.twig` | Penbey twig band: vertical bundled tamarisk twigs with stitched joints every half tile; tinted maroon #6e2a2a. |
| `emblem.xanadu.sun` | Sun-and-moon roundel: a gold #e0b040 disc, a maroon #6e2a2a ring, a 12-point gold star, a cream centre with a maroon crescent. |
| `roof.gilt` *(untextured in the code)* | Smooth gilded metal, no seams, tinted #e0b040, #d4a030, #f0c850, #dcae3c. |

#### Biomes

The scan library covers tileable bark (`bark_*`) and leaf litter (`forest_leaves_*`, `dry_decay_leaves`). Leaf cards need an alpha
mask, so a generated atlas is prompted on a flat key colour:

```
A single sheet of nine different leaves of one species, seen from above on a solid flat bright magenta (#ff00ff) background, flat even lighting, no shadows, no overlap, each leaf fully visible and well separated, natural variation in size and colour, visible veins. Square, 2048x2048.
```

| id | Material line |
|---|---|
| `bark.desert` | Dragon tree #8a7a66 (#7e6e5a, #968672): bands of horizontal leaf scars with fine vertical cracks. Mesquite: dark furrowed #4a3a2e (#3e3026, #564638). Bottle and boojum: pale peeling grey-olive #8a8070, #8e8e78. |
| `bark.palm` | Wadi palm #6a5a44 (#5e4e3a, #766650): many short vertical fibre strands with dark oval scars. No ring scars. Fan palmetto #4e4232. |
| `bark.mangrove` | Smooth bark #4e4640 (#5a4e44, #443c36) with pale lenticels on a cage of prop roots. (The SW lowlands version is red lacquer #8e2418, #9a2e1a, #7a1e16.) No algae, no barnacles. |
| `ground.salt` | Pale salt crust #f1ede6 over flat #e2ddd2, an irregular crack network of dark brown-grey lines; mud #3d3526 and algae #4c5c36 beside it. |
| `ground.snow`, `ground.ash` *(colour only in the code)* | Snow #e6ecf2 as patches on north faces and in hollows (species tint #eef2f6); ash #5a5452 (lava #36302e, flows #241c1a, summit cap #c8c0b4). |

#### Eastern badlands (`biomes/ebadlands`, 2026-10-05)

Gaps only. Already in the library and reused here, no prompt needed: `ground.snow011`/`snow015` (the crest's ice and
snow), `rock.rock_face` and `rock.rock_wall_11`/`12` (the range's granite crags), `rock.rock035`/`037` (basalt at the
vents), `ground.moss001..003` and `card.moss` (boreal floor, tundra), `card.fern`, `ground.sparse_grass` and
`ground.withered_grass` (steppe and tundra grass), `ground.gravel019`/`042` (canyon floor), `bark.ghostwood` tinted
greenish white for the aspen (try it before asking for `bark.aspen`), `bark.baobab` tinted pale for the sunspire,
`bark.bark_brown_01` tinted grey for the cottonwood. Surfaces use the base template plus the tintable sentence; leaf
cards use the magenta card wording (`card.crop` above). Reuse is listed per row so no set is made twice.

| id | Material line | Reuse |
|---|---|---|
| `ground.clay.popcorn` | Weathered bentonite badland clay seen from above: a crust of small puffy "popcorn" clay nodules over dry cracked mudstone, fine rills running one way where rain has washed it, a few pebbles. Neutral pale grey-buff (#c8beb0) with soft lighter and darker patches, so it can be tinted to pink, cream, gold, grey and maroon beds. | sedesert badland patches, Korona, any badland or eroded clay slope |
| `rock.sandstone.navajo` | Cross-bedded aeolian sandstone cliff face: sweeping inclined cross-beds in sets a metre or two thick, fine parallel laminae, rust-red (#b0583a) grading through salmon (#c87a58) to a bleached cream (#e2d2b4) toward the top, dark desert-varnish streaks (#4a2e24) hanging down from ledges, a few small honeycomb weathering pits. | Zion-type canyon walls here, sedesert mesas, Shade's cliffs |
| `ground.sulphur` | Volcanic sulphur flat seen from above: lumpy bright sulphur-yellow crust (#e8d040) with paler cream salt (#f0ece0) blisters, rust-orange iron oxide (#c07030) bleeding through in patches, a few small round vent holes ringed in yellow, fine polygonal cracks. Full colour (do not mute). | Korona, Throne/Volcano, any geothermal ground |
| `ground.travertine.acid` | Rim of an acid hot pool seen from above: thin terraced mineral crust in scalloped ledges, acid lime-green (#9ad030) wet film on white-cream (#e8e4d4) mineral, yellow (#d8b030) and orange-brown (#a86028) stained edges, glossy where damp. Full colour. | the sulphur pools' margins; any hot spring |
| `ground.playa.red` | Cracked desert playa seen from above: dry pinkish-red clay (#c49a7e) split into polygon plates 20-40 cm across with curled edges, pale dust (#d8b8a0) in the cracks, a few small stones. | the hot waste here, sedesert's pond rim, crater drylands, any dry lake bed |
| `ground.steppe` | Cold desert steppe soil seen from above: pale grey-tan silty soil (#a8a088) with a dark lumpy biological crust (#5a5444) in patches, scattered small angular gravel, a few dry grass stems and fallen grey sage leaves. | sagebrush steppe here, crater drylands, highland basins |
| `ground.needles` | Conifer forest floor seen from above: a thick mat of fallen brown pine and spruce needles (#7a5a3e, #8a6a48), a few cones, small twigs and bark flakes, patches of darker damp duff (#3e3226) and a little moss. | spruce-fir and ponderosa floors here, `biomes/nhighlands`, Highlands |
| `ground.tundra` | Alpine tundra seen from above: low mat of olive and russet cushion plants and moss (#6a6844, #8a5a3a), grey-green and orange crustose lichen on small flat stones, patches of grey gravel (#8a8478), a few tiny white and pink flowers. | the treeline and tundra here, `biomes/nhighlands`, the outer rim |
| `bark.ponderosa` | Ponderosa pine bark, trunk surface: large flat jigsaw-puzzle plates of cinnamon-orange (#b86a3c, #a85a34) with paler flaking scales, separated by deep black-brown fissures (#2a1e18) two to four centimetres wide, plates longer than wide, vertical. | ponderosa here; any old pine (`biomes/nhighlands`, `swlowlands`) |
| `bark.spruce` | Spruce bark: thin round grey-brown scales (#5a4e46, #6a5e54) a few centimetres across, loosely overlapping, some flaking to show reddish inner bark (#8a5040), a little grey-green lichen. | Engelmann spruce and fir here; `biomes/nhighlands` spruces |
| `bark.juniper` | Shaggy juniper bark: long loose fibrous strips peeling vertically, twisted, grey-brown (#7a6a5a) with reddish inner bark (#8a5a44) showing between, frayed ends. | Utah juniper here; cedar and cypress in any biome |
| `wood.silver` | Ancient wind-polished deadwood: bare trunk wood weathered silver-grey (#b8b0a4) with deep twisting spiral grain, rust and amber resin streaks (#a8643a), fine sand-blasted ridges, a few checks. | the bristlecone here, `wood.driftwood` (Mav's design-only row), dead snags and fallen logs anywhere |
| `card.pine` | Pine leaf card: nine short twigs of a pine, each a tuft of stiff dark green needles (#4a5e34, #55703a) in bundles radiating from the twig tip, a small brown cone on two of them, seen from above on a solid flat bright magenta (#ff00ff) background so they can be cut out. Square, 2048x2048; no other objects. | pinyon, ponderosa, bristlecone here; any pine |
| `card.spruce` | Spruce leaf card: nine flat spruce branch sprays, each a main stem with side shoots densely covered in short blue-green needles (#3a5444, #46644e), drooping slightly at the tips, seen from above on a solid flat bright magenta (#ff00ff) background so they can be cut out. Square, 2048x2048; no other objects. | spruce and fir here; `biomes/nhighlands` spruces and cedars |
| `card.juniper` | Juniper leaf card: nine sprays of juniper scale foliage, blue-grey-green (#6a7e62) braided twigs with a few powder-blue berries (#8a9ab8), seen from above on a solid flat bright magenta (#ff00ff) background so they can be cut out. Square, 2048x2048; no other objects. | Utah juniper here; cypress, cedar, any scale-leaved conifer |
| `card.aspen` | Aspen leaf card: nine short twigs of round, finely toothed aspen leaves on flat stalks, five twigs bright green (#7a9a40) and four turned gold (#e0b030), seen from above on a solid flat bright magenta (#ff00ff) background so they can be cut out. Square, 2048x2048; no other objects. | aspen and cottonwood here; poplar, birch in any temperate biome |
| `card.lobed` | Lobed leaf card: nine leafy twigs, five of deeply lobed oak leaves in dark green (#5e7a34) and four of five-pointed maple leaves in red and orange (#c84a28, #e08a34), seen from above on a solid flat bright magenta (#ff00ff) background so they can be cut out. Square, 2048x2048; no other objects. | gambel oak and bigtooth maple here; any temperate broadleaf |
| `card.sage` | Sagebrush leaf card: nine sprigs of big sagebrush, many small silvery grey-green three-toothed leaves (#9aa890, #a8b4a0) on woody grey twigs, a few with tiny yellow flower spikes, seen from above on a solid flat bright magenta (#ff00ff) background so they can be cut out. Square, 2048x2048; no other objects. | sagebrush and rabbitbrush here; saltbush and creosote in sedesert |
| `card.ember` *(alien)* | Alien leaf card: nine round pompoms of long curling flame-shaped spikes radiating from a centre, glowing orange (#f06a1a) at the base to yellow (#ffb030) at the tips, seen from above on a solid flat bright magenta (#ff00ff) background so they can be cut out. Square, 2048x2048; no other objects. Full colour. | the ember crown; any fiery alien crown |
| `card.weeper` *(alien)* | Alien leaf card: nine long hanging feathery strands like pink willow fronds, a central stem with soft fine side filaments, rose-pink (#d87888) to pale pink (#e8a0b0), each hung from the top edge of its cell, on a solid flat bright green (#00ff00) background (not magenta: the leaves are pink) so they can be cut out. Square, 2048x2048; no other objects. | the rose weeper; any pink weeping alien tree |
| `card.mirage` *(alien)* | Alien grass card: nine tall translucent feathery plumes on thin stems, pale pinkish-white (#f0d8e0) with a pearly sheen, the plumes see-through at their edges, standing upright from the bottom of each cell, on a solid flat bright green (#00ff00) background so they can be cut out. Square, 2048x2048; no other objects. | mirage grass; pampas-like plumes anywhere |
| `card.spiral` *(alien)* | Alien groundcover card: nine flat rosettes seen from directly above, frilled serrated leaves spiralling out from the centre, each leaf a different hue round the colour wheel (teal, green, gold, orange, magenta, violet) with an iridescent sheen, on a solid flat bright green (#00ff00) background (not magenta: the leaves are pink) so they can be cut out. Square, 2048x2048; no other objects. Full colour. | the spiral mat |
| `organic.gem.teal` *(alien)* *(answered by `stone.amazonite`)* | Skin of a glossy alien succulent pod: smooth taut waxy surface in deep teal (#2e7a78) with lighter aqua (#4a9a90) streaks running lengthwise, faint shallow ribs, tiny pale freckles. | the ember crown's pods, the stilt pod's head; any alien succulent |

*Delivered 2026-10-05 and processed (19 images pasted into the chat as 1254 and 1125 px WebP):* the eight surfaces
(`tools/textures/batches/chatgpt-2026-10g-ebadlands.json`: `ground.clay.popcorn`, `rock.sandstone.navajo`, `ground.sulphur`,
`ground.travertine.acid`, `ground.playa.red`, `ground.steppe`, `ground.needles`, `ground.tundra`) and eleven cards
(`chatgpt-2026-10g-ebadlands-cards.json`: `card.pine` and a second delivery as `card.pine.b`, `card.spruce`, `card.juniper`,
`card.aspen`, `card.lobed`, `card.sage`, `card.ember`, `card.weeper`, `card.mirage`, `card.spiral`). `card.ember` came as one
compound pompom filling the sheet and is used as one card. The fine needles and plumes carried the key colour into their
opaque anti-aliasing, so `cards.py` grew a `spill` option ('all': take the key's tint out of every pixel, for a sheet with
no colour of the key's family) and a green-key despill; `card.spruce` is keyed harder (key_lo 90, key_hi 240) and still
shows a faint lilac at a few tips, which the species tint covers. `biomes/ebadlands` adopts them (`materials.json`, `tex/`).
*Delivered 2026-10-06 (`ebadlands.zip`, five images) and processed* (`batches/chatgpt-2026-10h-ebadlands-barks.json`):
`bark.ponderosa`, `bark.spruce`, `bark.juniper`, `wood.silver`, and `stone.amazonite`, a polished teal crystalline stone
that came for `organic.gem.teal` and is filed as a stone (reuse: gem inlay, polished mineral, crystal outcrops; the ember
crown's pods). The eastern badlands rows are all delivered. `biomes/ebadlands` uses every one; the aspen takes the
existing `bark.ghostwood`, tinted.

#### Crater drylands (`biomes/crater-drylands`, 2026-10-05)

Gaps only. Try these library sets first, no prompt needed: `card.prismgum` (the prism mallee's and the ghost gum's lance
leaves, tinted), `bark.prismgum` (the mallee's strips, tinted), `bark.bark_bluegum` tinted pale (the ghost gum),
`bark.ponderosa` and `card.pine` (the parasol pine), `card.ember` (the pincushion's heads, tinted orange), `card.sage`
(chaparral), `wood.silver` (grey snags and old logs), `ground.playa.red`, `ground.steppe`, `ground.withered_grass` (old
scrub), `ground.gravelly_sand` (the washes), `rock.rock_boulder_dry` (the kopjes' granite: ask for `rock.granite.tor` only
if it does not read as granite), `card.fern` (the prism fern's fallback). Surfaces use the base template (plus the tintable
sentence unless marked full colour); cards use the keyed-card wording above.

| id | Material line | Reuse |
|---|---|---|
| `ground.burn` | Freshly burnt scrubland ground seen from above, a few weeks after a wildfire: black char (#1e1b18, #2c2824) over red soil (#8a5c48) that shows through in patches, drifts of fine grey-white ash (#c8c4bc) gathered in hollows and round the charred bases of burnt shrubs, short black twig stubs and a few charred pine-cone-sized seed pods, small stones blackened on one side. Full colour. | every burn in this kit; burnt ground after any fire, a battle or a raid; cold hearth and kiln floors |
| `ground.redsoil` | Dry red tropical soil seen from above: fine Tharnish red-brown earth (#9c6a54, #8a5c48), slightly crusted, with scattered small angular gravel and quartz grit, a few dry leaves and fine roots, faint wind ripples. | the drylands plain; the hyperjungle's red soil (`LORE.md`), Girder, Iziz, SW bay, any laterite ground |
| `rock.granite.tor` | Weathered granite boulder surface: coarse-grained pink-grey granite (#b4a89c) with white feldspar and black biotite flecks, rounded by weathering, shallow pits and a few joint cracks, patches of orange and grey-green crustose lichen (#d88a3a, #9aa090). | the kopjes; any granite outcrop, tor or boulder field; dressed granite blocks |
| `bark.char` | Charred tree bark after a fire: deep black (#1c1a18) bark cracked into blocky "alligator" checks a few centimetres across, a faint silvery sheen on the raised blocks, brown unburnt bark (#5a4434) showing in a few deep fissures, fine grey ash in the cracks. | the lower trunks of every survivor in this kit, snags and burnt logs; burnt beams and posts in any settlement |
| `bark.pillar` *(alien)* | Bark of a fire-proof alien column tree: tough fibrous skin in horizontal raised rings a few centimetres apart, each ring slightly scalloped like overlapping leaf bases, fine vertical fibres between the rings, a waxy sheen. Neutral grey-green so it can be tinted to teal and pale gold bands. | the pyre pillar; any ringed palm-like or cycad-like trunk |
| `card.pillar` *(alien)* | Alien frond card: nine stiff feather-like fronds, each a straight midrib with closely packed narrow leaflets angled toward the tip like a feather, teal-blue (#2e6a6a) at the tips grading to yellow-green (#8aa848) at the base, laid diagonally from the bottom-left to the top-right of its cell, on a solid flat bright magenta (#ff00ff) background so they can be cut out. Square, 2048x2048; no other objects. | the pyre pillar; any feather-frond alien plant, cycad or tree-fern variant |
| `card.irisfern` *(alien)* | Iridescent fern card: nine lacy fronds of a spikemoss, tiny scale-like leaflets on forking branches, an oily metallic sheen: deep blue (#3a6aa8) and violet (#6a4ab8) shading to copper-orange (#e89a3a) at the tips, no green anywhere, seen from above on a solid flat bright green (#00ff00) background so they can be cut out. Square, 2048x2048; no other objects. Full colour. | the prism fern; the Rift ("iridescence is the rule"), hyperjungle understorey |
| `card.firelily` | Flower card: nine single fire lilies seen from the side, each a scarlet (#d82a2a) six-petalled trumpet with recurved petal tips and a yellow-green throat on a bare green stalk, standing upright from the bottom of its cell, on a solid flat bright green (#00ff00) background so they can be cut out. Square, 2048x2048; no other objects. Full colour. | the fire lilies; any red lily or amaryllis in a garden or a bloom |
| `card.flowerspike` | Flower card: nine upright flower spikes seen from the side, three shaped like fireweed (loose open florets up a tall stem), three like lupine (dense pea-flower whorls), three like plumed celosia (a soft feathery flame-shaped plume), all in pale cream-white so they can be tinted, on short green stems standing up from the bottom of each cell, on a solid flat bright green (#00ff00) background so they can be cut out. Square, 2048x2048; no other objects. | fireweed, lupine and flame plume here; any meadow, garden border or bloom |
| `card.cupflower` | Flower card: nine open cup-shaped flowers seen from above, four like poppies (four broad crinkled petals, a dark centre), five like small daisies (many narrow petals round a raised centre), all pale cream-white so they can be tinted, on a solid flat bright green (#00ff00) background so they can be cut out. Square, 2048x2048; no other objects. | poppies and goldfields here; any wildflower carpet or garden |
| `card.charred` | Burnt shrub card: nine black charred shrub skeletons after a wildfire, bare forking twigs (#1e1b18) with a faint grey ash coating on their upper sides, a few curled brown scorched leaves on two of them, standing up from the bottom of each cell, on a solid flat bright magenta (#ff00ff) background so they can be cut out. Square, 2048x2048; no other objects. | the char and the bloom here; burnt hedges and gardens anywhere; bare winter shrubs (tinted grey-brown) |
| `card.grass.dry` | Grass card: nine tufts of dry bunchgrass standing up from the bottom of each cell, fine straw-coloured blades (#c8b47a, #b8a46a) with a few green ones at the base and slender seed heads, on a solid flat bright magenta (#ff00ff) background so they can be cut out. Square, 2048x2048; no other objects. | the old scrub here; savannah, steppe, every dry grassland kit |
| `card.broom` | Shrub card: nine sprigs of flowering broom, thin green rush-like twigs (#5a6a34) crowded with small bright yellow pea flowers (#f0d020), seen from above on a solid flat bright magenta (#ff00ff) background so they can be cut out. Square, 2048x2048; no other objects. | the ash broom here; gorse and broom in Mediterranean and highland scrub |
| `card.jade` | Succulent card: nine short branched sprigs of a jade plant, thick round glossy leaves orange-red (#e0602a) with deeper red rims and a few green-gold (#a0a040) ones near the stems, seen from above on a solid flat bright green (#00ff00) background so they can be cut out. Square, 2048x2048; no other objects. Full colour. | the ember jade; any succulent shrub or windowsill plant |

*Delivered 2026-10-05 and processed (14 images pasted into the chat as 1254 px WebP):* four surfaces
(`tools/textures/batches/chatgpt-2026-10i-craterdry.json`: `bark.char`, `bark.pillar`, `rock.granite.tor` and a second
`rock.granite.tor.b`) plus one not asked for, a scaly pine bark with lichen filed as `bark.pine.scale` (reuse: the parasol
pine, stone and Scots pine, any old scaly conifer); and nine cards (`chatgpt-2026-10i-craterdry-cards.json`: `card.charred`,
`card.cupflower`, `card.flowerspike`, `card.firelily`, `card.grass.dry`, `card.irisfern`, `card.jade`, `card.pillar`,
`card.broom`). `card.grass.dry` is keyed hard (key_lo 100, key_hi 250) and still keeps a faint pink in the finest blades;
the kit uses it as a grey detail map (keep 0), which drops it. `ground.burn` and `ground.redsoil` followed the same day
(`chatgpt-2026-10j-craterdry-ground.json`). The crater drylands rows are all delivered; `biomes/crater-drylands` uses every
one (`materials.json`, `tex/`).

#### The Throne (`biomes/throne`, 2026-10-06)

*Delivered 2026-10-06 by the owner, unprompted (four zips and six pastes, 68 images; prompts not recorded) and processed*
(`tools/textures/batches/owner-2026-10-throne.json`, `-b.json`, `-c.json`, `owner-2026-10-throne-cards.json`, `-cards-b.json`, `-cards-c.json`, `-cards-d.json`, `owner-2026-10-throne-e.json`, `-f.json`, `-cards-f.json`, `-g.json`, `-cards-g.json`). Each
set's `meta.json` carries its reuse note. `biomes/throne` uses all but `ground.sand.black`, `ground.olivine` and
`stone.petrified` (kept for the coast and the lava-cast stumps of later stations).

| id | what | used for |
|---|---|---|
| `ground.lava.aa`, `ground.lava.veins` | dark aa lava; black rock with glowing orange veins | every flow; the two-year flow (its veins glow at night) |
| `ground.ash.gravel`, `ground.ash.ripples`, `ground.ash.mycelium` | grey ash and gravel; wind-rippled ash; ash webbed with glowing mycelium | the plume's ground: gravel, deep ash, the mycelium that lights its nights |
| `ground.grass.ember`, `ground.mushroom.glow`, `ground.mushroom.toxic`, `ground.mycelium.gold` | red alien grass; a blue glowing mushroom carpet; olive mushroom cover; golden mycelium | the seam; skylights and gullies; (spare); (spare) |
| `ground.scoria`, `ground.sand.black`, `ground.olivine`, `ground.obsidian` | red and grey scoria; black volcanic sand; green olivine sand; obsidian pebbles | the young cones; (the coast); (the coast); (spare) |
| `stone.travertine.tufa`, `stone.pumice`, `stone.petrified` | porous tufa; vesicular pumice; petrified wood agate | the acid shores and hot pools; boulders and stones; (lava-cast stumps) |
| `bark.lava.charcoal`, `bark.lava.charred`, `bark.lava.molten`, `bark.armored`, `wood.sulphur`, `organic.fungus.bracket` | barks | ash pine; trumpet and frill-tree; the pagoda cap (glows at night); star aloe; dead wood; (spare) |
| `card.shelf.glow`, `card.mushroom.glow`, `card.alienflora.glow` | glowing shelf fungi, mushroom clusters, alien tufts (3 x 3) | wall and wound brackets; dark places; the plume's floor |
| `card.flower.carnivorous`, `card.fungus.specimens` (4 x 4), `card.fungus.drip`, `card.tendril` | snare flowers; sixteen alien fungi; dripping fungi; tendril rosettes | the plume's floor; hung under caps, tiers and bells; the ash creepers |
| `card.lavaleaf`, `card.leaf.distressed`, `card.succulent.spotted` | lava-veined leaves; withered leaves; spotted succulents | seam shrubs; Earth's shrubs in the acid; the shoulder's young flows |
| `card.frond.frill` | nine red-olive spiked fronds in fans (3 x 3) | **in use**: the ruff trees' collars (the ruff tree and the great ruff; four upright cells in a ring round a dark throat) |
| `card.frond.fractal`, `bark.wavy.slate` | three fractal fronds; blue-grey wave bark | **in use**: the frill tree's fins (the Rift's frill tree, brought to the kipuka) and its ribbed column |
| `bark.plates.glossy` | glossy red plated bark | **in use**: the hyperjungle's crimson kapok (`biomes/hyperjungle/materials.json`, its opt-in pack) |
| `bark.scales.hooked`, `bark.amber`, `bark.cratered`, `bark.flesh.red`, `bark.tapestry` | hooked curling scales; amber resin plates; grey cratered; red marbled flesh; carpet-patterned | (in the library, for where they fit: see each `meta.json`'s reuse) |
| `ground.lichen.crust` | rock crusted with grey-green and orange lichen | (in the library: old lava, kopjes, ruins) |
| `card.flower.angeltrumpet`, `card.flower.bluebell`, `card.flower.spiderlily`, `card.flower.wilted`, `card.flower.claw` | hanging yellow trumpets; arching teal bells; red spider lilies; wilted flowers; clawed tulip-like flowers (3 x 3) | (in the library: the spice frontier's gardens, the cloud forest, the acid fringe) |
| `card.fern.green`, `card.moss.hanging` | nine fern fronds; nine hanging moss curtains (3 x 3) | (in the library: the cloud forest station) |
| `card.leaf.wave`, `card.leaf.redvein`, `card.frond.needle` | three wave-marbled teal leaves; three red-veined spiny leaves; three needled fronds (each 3 across a landscape sheet, squared with padding: the fronds fill 0.18-0.82 of the height) | (in the library) |
| `organic.cap.orange`, `organic.cap.glossy`, `organic.cap.porous`, `organic.flesh.cells` | an orange cracked radial cap top; a glossy brown radial cap top; a cream porous fungal skin; cells parted by pale veins | the gill-parasol's and stilt parasol's caps; the pagoda's tiers (tinted red); the bone bell's dome (all mapped from above); the drizzle trumpet's pitcher (grey detail under its green) |
| `card.fungus.trumpets` | nine clusters of trumpet-capped mushrooms (3 x 3) | the plume's floor |
| `bark.honeycomb`, `bark.twisted.red`, `bark.sulphur.porous` | tan bark eaten into cells; twisted red-brown fibrous bark; sulphur-yellow porous bark | the spice tree; the rope-tree's strands; the bone bells' root curtains (it replaced `organic.fungus.bracket` there, now spare) |
| `card.carnivore.plants`, `card.flora.coral`, `card.mushroom.alien` | nine carnivorous plants; nine coral-like vent growths; nine alien mushrooms (3 x 3) | the plume's floor and the acid marsh; the vents and hot pools; the plume's floor |
| `card.succulent.molten`, `card.moss.carnivorous` | dark succulents with ember tips; hanging moss with pitchers and sundews (3 x 3) | cinder and young flows; hung from the parasols' caps |
| `ground.lava.crust`, `ground.mycelium.crimson`, `ground.mycelium.pale` | an active flow's glowing crust; crimson mycelium; pale mycelium over soil | (spare: a lava lake, the mat's ground, the plume's old soil in later stations) |

Still drawn procedurally (gaps): the mat's veins, the star aloe's star, the trumpet tree's funnels, the lamp caps' dishes,
the frill pods.

*Station 4, the geyser isle (2026-10-06):* `ground.sand.black` the beaches (and the sea bed), `card.kelp.1`, `.4`, `.7`
(Ys's kelp) the kelp in the shallows and the wrack on the sand, `bark.palm_tree_bark` the coconut's and the palm frill
tree's ringed trunks, `bark.ghostwood` the hyper-mangrove's (greyed by its colour) and the drowned trees, `roof.thatch` the
camp's lean-tos, `ground.jungle.canopy` the forest floor seen from far off, `ground.travertine.acid` the springs' rims and
the runoff terraces, `ground.brown_mud_02` the mud pots and the lagoon's mud, `ground.moss002` through the forest's litter.
Delivered the same day (`tools/textures/batches/owner-2026-10-throne-h.json`, `-cards-i.json`): `card.frond.coconut` (three
fronds across a landscape sheet, base at the top: the coconut palm's crown), `card.seaweed` (nine seaweeds, 3 x 3: the isle's
shallows and its wrack), `bark.coir` (brown coir-like fibrous bark, full colour: the coconut palm's trunk; reuse: tree-fern
trunks, coir rope and mats). Gaps, prompted in `PROMPTS-ready.md` section 5: true sinter (`ground.sinter`; the popcorn clay `ground.clay.popcorn` stands in), the runoff's microbial mats
(`ground.mat.thermal`; the ground's paint stands in).

*Station 5, the cloud forest (2026-10-06):* `card.moss.hanging` (six greener cells: the elfin trees' moss curtains) and
`card.fern.green` (its floor's ferns) are now in use, as the plan meant; `card.weeper` the veil trees' glowing veils;
`rock.wet.dark` (the ravine's walls), `ground.gravel042` (its beds), `ground.moss003`
(moss on its rocks). Delivered the same day: `bark.mossy` (`tools/textures/batches/owner-2026-10-throne-j.json`: scaly bark half under moss
and lichen, full colour), the elfin trees' bark.

#### Southern highlands (`biomes/shighlands`, 2026-10-06)

The spiral biome (a cloud forest above the cloud sea, a paramo of giant rosettes, bogs). Reused from the library, no prompt
needed: `card.sage` (the coilbark's crown), `card.moss` (moss on the limbs and the floor), `bark.palm_tree_bark` (the
screw palm), `rock.granite.tor` (the tors), `ground.moss002` (the cloud forest floor), `ground.steppe` (the paramo). The
three gaps, generated by the owner and delivered the same day (1254 px WebP in the chat;
`tools/textures/batches/chatgpt-2026-10k-shighlands.json`):

| id | Material line | Reuse |
|---|---|---|
| `bark.wrung` | Tree bark twisted like a wrung cloth, smooth mauve-brown bark in broad diagonal ridges that all run at the same slant, deep creases between the ridges, streaks of bright green moss and malachite-green lichen following the creases. Tintable. | the coilbark; any twisted or spiral-grained trunk (juniper, bristlecone, olive, a wind-wrung cliff tree), moss and all. Its ridges run diagonally, so on a lathe they wind as helices |
| `bark.skirt` | A thick shaggy skirt of dead, dried leaves hanging down a plant stem, long papery straw-coloured and pale brown leaves overlapping in dense downward-pointing layers, a few greyer and more rotted, fibrous edges. Tintable. | the giant groundsel; any rosette plant that keeps its dead leaves (Joshua tree and yucca skirts, palm thatch on a trunk, tree aloes); a shaggy thatch eave |
| `ground.sphagnum` | A mountain bog carpet of sphagnum moss seen from above, tightly packed small star-shaped moss heads in hummocks, patches of lime green, golden yellow and rusty red moss, a few dark wet hollows of peat between them, tiny sundew rosettes here and there. Full colour. | every bog and mire: the southern highlands' bogs, the northern highlands' wet hollows, Reed Lake's floating mats, any peat moor |

Seen in the kit on 2026-10-06 (the 3x3 repeat tiles cleanly; the wrung bark winds round the coilbark's trunk; the skirt
and the sphagnum read at ground level). The cloud sea needs no texture: it is a field (core/atmos/GODOT.md, "The cloud
deck").

#### Eastern highlands (`biomes/ehighlands`, 2026-10-06)

All ten delivered (below). Library sets that also serve, no prompt
needed: `card.grass.dry` tinted gold (the ichu), `card.cupflower` (gentians and the thorn cushion's flowers, tinted).
The rock here is basalt, not granite, so `rock.granite.tor` does not serve. **The complete paste-ready prompts are
`PROMPTS-ready.md` section 7**; the rows below are their material lines. Tintable: `surface.cushion`, `surface.fleece`,
`bark.ragbark`, `card.ichu`; the rest are full colour.

| id | Material line | Reuse |
|---|---|---|
| `ground.puna` | High cold plateau ground seen from above: bare brown volcanic soil (#8a7656) with fine grey pumice grit and small dark angular stones, the bases of golden bunchgrass tussocks (#b8a062) spaced a hand apart with bare soil between, a few dry blades lying flat, frost-heaved crumbs. | the puna; any cold steppe or high desert plain; the dry side of the range |
| `ground.turf.polygon` | Short alpine sedge turf seen from above, a dense olive-brown felt (#6e6a3e) a few centimetres high, cracked into irregular polygons about a metre across along dark bare-soil fissures (#2e2418), the polygon rims a little browner and drier than their centres. | the turf here; tundra, frost-patterned ground anywhere |
| `surface.cushion` | The surface of a cushion plant seen close up: thousands of tiny tight rosettes of small stiff leaves packed edge to edge into one hard continuous skin, bright lime green (#86b236) with darker green crevices, a few rosettes yellowed or brown, a faint resinous sheen. | the poured cushions and the Mother Cushion; moss cushions, bog cushions (tinted darker), topiary |
| `surface.fleece` *(alien)* | A woolly plant's surface seen close up: dense felted grey-white fleece (#d8d8d0) of fine dead leaves and hairs curled into small tufts, slightly matted, darker grey in the hollows between tufts. | the woolbacks and snow wool; sheepskin, felt, any woolly plant or animal coat |
| `bark.ragbark` | Bark of a gnarled high-mountain tree peeling in many thin papery layers: rust-red and orange-brown sheets (#a64a28, #c66c3a) curling off horizontally, paler cinnamon where fresh layers show, dark gaps between the sheets, a twisted grain. | the ragbark; paperbark and birch-like barks (tinted), Polylepis anywhere |
| `rock.basalt.vesicular` | Dark volcanic basalt seen close up: charcoal-grey stone (#4e4a48) full of small round gas holes, a rusty brown weathering crust in places, patches of bright orange, yellow and pale green crustose lichen (#e8a020, #d8c040, #a8c060). | the tors, the scree, the boulders; any lava field, volcanic outcrop or dressed basalt |
| `ground.sinter` | Geyser sinter seen from above: pale grey-white silica crust (#e6e2d6) in low scalloped terraces, a thin film of hot water, and bands of microbial mat in bright orange (#d8782a) and green (#5a8a3a) along the run-off channels. Full colour. | the geyser field; hot springs and terraces anywhere |
| `card.ichu` | Grass card: nine tufts of tall stiff high-altitude bunchgrass, a fountain of fine wiry blades with a few seed plumes, standing up from the bottom of each cell, pale cream-white so they can be tinted, on magenta. | the ichu; any steppe, puna or alpine tussock grass |
| `card.ragleaf` | Leaf card: nine leafy twig ends, small dark green compound leaves in rosettes at the tips, a few with rust-red papery twig, seen from above, full colour, on magenta. | the ragbark's crown; rowan, Polylepis and other small-leaved mountain trees |
| `card.rheumleaf` | Leaf card: nine broad heart-shaped mountain rhubarb leaves with pale veins, seen from above, full colour, on magenta. | the glass towers' basal leaves; rhubarb, dock and burdock in gardens and wet ground |

*Delivered 2026-10-06 and processed (nine images pasted into the chat as WebP):* six surfaces
(`tools/textures/batches/chatgpt-2026-10k-ehighlands.json`: `surface.cushion`, `surface.fleece`, `bark.ragbark`,
`ground.turf.polygon`, `rock.basalt.vesicular`, `ground.sinter`) and three cards (`chatgpt-2026-10k-ehighlands-cards.json`:
`card.rheumleaf` and `card.ragleaf` keyed from magenta, `card.ichu`, which came with a real transparent background and is not
keyed); `ground.puna` followed the same day (1125 px). `biomes/ehighlands` uses all ten (`materials.json`, `tex/`).

#### Furniture and city (generic, for every culture)

Gaps the scan libraries do not fill. Start each with the base template; for tintable surfaces add the muting sentence. Rows that need cut-outs
(`glass.*`, `fibre.wicker`) are prompted on a flat key colour, so a mask can be cut from them the way the leaf cards are.

| id | Material line |
|---|---|
| `glass.clear` | Old window glass, one thick slightly wavy pane seen straight on, faint green tint at the edges, a few tiny trapped bubbles, fine surface scratches and a light film of dust, on a solid flat neutral grey (#808080) background that is not part of the glass. |
| `glass.bottle` | Thick bottle glass in deep green, rough hand-blown surface with swirls, bubbles and uneven thickness, light scuffing, on a solid flat neutral grey background. |
| `glass.frosted` | Frosted glass, fine even acid-etched grain, slightly cloudy, with a few clear scratches, on a solid flat neutral grey background. |
| `ceramic.glaze` | Glazed ceramic surface in plain white, glossy, with fine crazing lines, tiny pinholes, slight thickness variation and a few small chips showing the biscuit underneath. Neutral, so it can be tinted. |
| `ceramic.terracotta` | Unglazed terracotta pottery, fine porous clay surface in warm orange, faint throwing rings running horizontally, a few darker fire clouds and scratches. Muted, so it can be tinted. |
| `fibre.wicker` | Open wicker weave of split rattan strands, over-under pattern, strands slightly uneven in width and colour, with the gaps showing a solid flat bright magenta (#ff00ff) background so the openings can be cut out. |
| `bone.ivory` | Polished bone or ivory, creamy off-white with fine parallel grain lines and tiny pores, a few hairline cracks, faint yellowing toward the edges of each plate. |
| `wax.candle` | Beeswax surface, pale warm yellow, smooth and slightly translucent-looking, with soft flow marks, small air pits and finger smudges. |
| `cloth.rug.wool` | Thick plain wool rug pile seen from above, dense short tufts with a visible pile direction, soft uneven density, a few flattened patches from wear. Neutral, so it can be tinted. |
| `wood.furniture.polished` | Polished hardwood tabletop, fine straight grain with a few small knots, a warm satin varnish with faint circular cup rings and scratches, slightly darker at the edge of each board. |
| `ground.road.ruts` | Top-down view of a packed dirt cart road, two parallel wheel ruts running top to bottom with a raised grassy crown between them, hoof prints and small stones, drying cracks in the ruts. The road runs vertically and the texture repeats vertically. |
| `paving.kerb` | A row of granite kerbstones seen from above and slightly toward the front, each a different length with fine joints, chipped corners and tyre scuffs, the row running left to right. The pattern repeats horizontally. |
| `paving.flagstone` | Large irregular flagstones laid tightly, each a different size and colour (grey, buff, brown), narrow dark joints with a few weeds and moss, worn smooth in the middle of each stone. |
| `ground.asphalt` | Old worn asphalt road surface, dark grey with small exposed stones, fine cracks, a few patched rectangles in a different tone, oil stains and faded paint chips. |

#### Beast Riders: furniture, street furniture, market goods and interiors

What the Beast Rider catalog pieces (`kits/catalog/krator-master-furniture-beast-rider.js`) and Girder's street furniture still draw as flat palette
colours. Colours below are the code's: bone #e8e0cc and #c8b898; mahogany #6a2a1e, #44190f, #8a4030; claw green #3f7a3a, claw pale #e6dcc2, moss dark #2e5a2c;
gourd ochre #b89040, green #8a9a4a, rust #b07a3a, pale #c2a05a; fruit orange #e0862a, amber #d06a20, gold #f0a040; silk #e8ecec and #d8dede;
iron #2a2620, #6a655a, #4a4038; leather #5a4630; lacquer red #8a2f2a, gilt #b08432, verdigris #2f6a5a, deep lacquer #7a2028; rope hemp #a8966a, jute #98865c;
crate tan #877558 and #6d5e45; flame #ff8a3c; lantern glow #ffb347. Beast Rider style: Amerindian and Javan influences, lashed hardwood,
hide and woven fibre, bone and horn, big animal skulls; court pieces in hyper-mahogany with bone inlay and skull crests. Start each request with the base template.
Tintable rows say so; everything else is full colour.

| id | Material line |
|---|---|
| `wood.mahogany` | Polished hyper-mahogany for court furniture: dense, close straight grain with a faint ribbon figure, deep red-brown (#6a2a1e) shading to near-black (#44190f) in the grain lines and warmer (#8a4030) in the lighter ribbons, a hand-rubbed oil finish with a soft satin sheen, a few tiny pores and hairline checks, light wear and pale scuffs at the edges. Boards about 20 cm wide with fine butt joints. |
| `patterns/beast-riders/bone-inlay` | Flat, front-on decorative panel of a bone-inlay band on hyper-mahogany (#6a2a1e, grain visible): a horizontal strip with a central row of small bone-ivory (#e8e0cc, #c8b898) diamonds and claw-shaped hooks, bordered above and below by thin bone fillets, each piece cut separately with hair-thin dark joints, slightly proud of the wood, a few chips. The pattern repeats horizontally. |
| `hide.pelt.cat` | Tanned big-cat pelt used as a rug or seat cover, seen from above: short dense fur lying in one direction, warm tawny base (#b89050) with dark rosette spots ringed in rust (#7a4a2a) and black centres, paler belly fur along one edge, a few worn bald patches and a faint pressed crease. Muted, so it can be tinted. (A second colourway, striped in tan and umber, is `hide.pelt.stripe`: the same pelt with vertical bold stripes instead of rosettes.) |
| `hide.rawhide` | Stretched rawhide drying on a frame, seen straight on: taut, slightly translucent cream-amber skin (#c9a86a) with a mottled darker spine line down the middle, fine hair roots, evenly spaced lacing holes along all four edges with twisted sinew (#a8966a) passing through them, a few small tears. |
| `bone.horn` | Polished animal horn plate for handles, lantern panels and inlays: smooth, slightly translucent honey-brown (#a8803c) fading to dark umber (#3a2a1c) along curved growth bands, fine longitudinal fibres, small cracks near the base, a warm waxy sheen. |
| `bone.antler` | Weathered antler surface, pale grey-brown (#c8b898) with long raised vertical ridges and rounded nodules, darker stained grooves (#7a6648), a worn tip showing cream bone (#e8e0cc), a few hairline cracks. |
| `bone.skull` | Surface of a very large animal skull used for crests and skullpoles, seen from above: ivory (#e8e0cc) bone with fine branching suture lines between plates, small foramen pits, a rough brow ridge, stained umber (#c8b898) in the hollows, weathered chalky patches and a few old hairline cracks. |
| `organic.gourd` | Dried gourd rind, in one tile three finishes side by side as vertical strips: smooth waxy olive green (#8a9a4a), ochre (#b89040) with tan freckles, and rust (#b07a3a) with darker mottling; all with fine warts, faint longitudinal ribs and tiny scars. Muted, so it can be tinted. |
| `fibre.basket.coiled` | Coiled basketry: a continuous bundle of grass wrapped in flat split palm strips and stitched in a tight spiral of parallel rows, honey (#c4a878) and dark brown (#6e5238) strips alternating in a stepped zigzag, visible stitches, a few frayed ends and loose fibres. |
| `patterns/beast-riders/claw-tapestry` | Flat, front-on decorative panel of a woven hanging: a claw-green (#3f7a3a) field with deeper moss (#2e5a2c) borders, a repeating motif of three parallel claw-pale (#e6dcc2) curved claw slashes in a half-drop grid, visible plain weave, slightly faded and uneven dye, a hand-sewn hem at the top. The pattern repeats in both directions. |
| `patterns/beast-riders/emblem` | Flat, front-on decorative panel of the Beast Rider house emblem on cloth: a square with a claw-green (#3f7a3a) field, a moss (#2e5a2c) edge and an olive band inside it, and a claw-pale (#e6dcc2) ink device of a stylised three-toed claw mark inside a ring, woven or painted with slight unevenness, faded. Single emblem centred; the cloth edge repeats in both directions. |
| `patterns/beast-riders/totem` | Flat, front-on panel of a carved and painted skullpole, a tall vertical band about three times higher than wide: weathered hardwood (#6a5038) carved in stacked tiers of a skull, a beak and a claw, painted in lacquer red (#8a2f2a), bone (#e8e0cc), black and a little verdigris (#2f6a5a), the paint cracked and flaking to bare wood. The pattern repeats vertically. |
| `wax.tallow` | Rendered animal tallow in a dish, seen from above: matte creamy grey-white (#e0d8c0), slightly greasy with a faint sheen, small air pits and soot-grey streaks near a central wick hollow, a thumbprint or two, a thin crust cracking at the edges. |
| `cloth.silk` | Court silk hanging: very fine plain weave in white (#e8ecec) and pale grey (#d8dede) stripes, a soft sheen that shifts with the weave direction, tiny slubs, a few gentle fold creases and a slightly crinkled hem. Neutral, so it can be tinted. |
| `metal.iron.pitted` | Hand-forged wrought iron for pots, hinges and brackets: dark (#2a2620) with grey (#6a655a) worn highlights, tiny pits, hammer facets, a thin rust-brown film (#4a4038) in the hollows, a few scale flakes. Neutral, so it can be tinted. |
| `wood.lamppost` | Weathered hardwood post for Girder's lamp posts, about 20 cm square: vertical grain, deep checks along the length, tar-dark brown (#4a3624) with a silvered lighter weathered surface in places, a few old lashing grooves and nail holes, darker at the base from damp. |
| `lantern.horn` | Glowing lantern panel seen from the front, as the unlit surface of the lamp: a flat plate of thin scraped horn, warm honey (#ffb347 lit from within, so bright centre and darker rim), fine long fibres and faint cloudy bands, a few tiny cracks; thin dark timber framing it at the edges. |
| `lantern.paper` | Oiled paper lantern panel, front-on: fibrous translucent paper in warm amber (#ffb347), visible long pulp fibres and a few small patched repairs, soft darker edges where it is glued to a timber frame, light soot staining at the top. |
| `patterns/beast-riders/pennant` | Flat, front-on decorative panel of a row of prayer flags and swallow-tail pennants strung on a cord: square flags in claw-green (#3f7a3a), rust (#8a5a2a), mustard (#c2a24e), plum (#4a3a6a) and wheat (#b0894a), each with a faint woodblock-printed claw mark in pale ink, edges frayed, on a plain pale sky background. The row repeats horizontally. |
| `patterns/beast-riders/plaque` | Flat, front-on decorative panel of a gallery plaque: a carved hardwood board (#6a5038) with a raised border and a central relief of a stylised claw and skull in gilt (#b08432) over lacquer red (#8a2f2a), worn at the edges to show wood, small verdigris (#2f6a5a) corner studs. Single plaque centred. |
| `fruit.skin.orange` | Fruit rind of the orange orchard fruit, seen close: slightly bumpy skin in glowing orange (#e0862a) with fine pores, a few darker dimples and a pale scar, a hint of amber (#d06a20) toward one edge. |
| `fruit.skin.amber` | Smooth-skinned amber fruit, close: glossy skin in amber (#d06a20) shading to gold (#f0a040) with pale freckles, a few soft bruises and a faint waxy bloom. |
| `fruit.husk` | The husk of a baobab pod: thick velvety fur in grey-brown (#8a7a66) with short dense hairs lying one way, ridges and a few pale patches where it has rubbed away, tiny dry cracks. |
| `card.crop` | Crop leaf card for market and field dressing: nine long green leaves (#5c8a3a, #7a9a3e, #4e7a32) of a maize-like plant arching in different directions, with pale central ribs and slightly torn tips, seen from above on a solid flat bright magenta (#ff00ff) background so they can be cut out. Square, 2048x2048; no other objects. |
| `fibre.net` | Fishing and hunting net of knotted cord: a regular square mesh of twisted hemp (#a8966a) cord with visible knots at every crossing, slightly uneven sizes, a few broken strands, on a solid flat bright magenta (#ff00ff) background so the openings can be cut out. |
| `fibre.mat.floor` | Woven floor mat of flat reed strips in a twill weave, strips about 2 cm wide in two shades of straw (#c4a870 and #a88a5e) forming diagonal ribs, darker worn walkways, a few broken reeds and frayed edges. |
| `earth.floor.packed` | Interior packed-earth floor, seen from above: smooth hard-trodden brown clay (#8a6c48) with faint sweeping marks from brooms, small pebbles pressed flush, hairline drying cracks, and darker greasy patches near a hearth. |

#### Catalog furniture audit (2026-10-06): what the 1635 pieces still need

`node tools/textures/audit_catalog.js` builds every catalog piece and variant headlessly and sums the surface each render family
(`mat()`'s `family`) and each palette key covers. The family is what a texture can hang on: a host gives catalog furniture a library
set as a triplanar **detail map per family** (Girder's `f_<family>` rows in its `materials.json`, `48-detail.js`), tinted by the
palette's vertex colours. So every set below must be **tintable** (near-grey) unless it says otherwise. Totals: wood 863 pieces (31% of
the area), metal 558, cloth 523, stone 367, rope 236, plaster 179, bronze 171, gold 170, glass 134, bone 129, ceramic 105, rust 102.
(Stone's area is inflated by the Eastern Abyss builders' yard block stacks; count pieces, not m2.)

**Already covered by the library** (proposed default `f_<family>` picks; Girder's own 17 rows stay as they are): `plank`
`wood.weathered_brown_planks`, `mahogany` `wood.mahogany`, `bark` `bark.bark_brown_01`, `bamboo` `wood.bamboo001c`, `lacquer`
`wood.lacquer`, `stone` `stone.cut`, `plaster` `earth.floor.packed`, `concrete` `concrete.board`, `metal` `metal.iron.pitted`, `rust`
`metal.rusty_metal_04`, `gold` `metal.gold`, `bronze` `metal.metal008` (copper is 110 of its 171 pieces), `glass` `glass.clear`, `cloth`
`cloth.weave.plain` (`cloth.silk` for court tiers), `rope` `fibre.rope`, `thatch` `roof.thatch`, `wicker` `fibre.wicker`, `hide`
`hide.leather009`, `bone` `bone.ivory`, `nacre` `shell.nacre`, `ceramic` `ceramic.glaze`, `skin` `organic.scale`, `leafy`/`plant`
`leaf.understorey`. Try `stone.amazonite` for `jade` (Lizardmen, 37 pieces) and `fibre.reedmat` for `reed` until `roof.reed` arrives.
`glow` needs no map.

**Still needed**, most pieces first. G rows start with the base template and the muting sentence unless they say full colour.
**Delivered 2026-10-06** (`tex.zip`, see "Delivered 2026-10-06: texturepalooza" below): every G row in this table. Only `metal.steel.brushed`
(a scan) is still open here. The family splits below are still needed before the new sets can hang on `feather`, `rubber` and painted wood.

| id | Src | Pieces | Material line |
|---|---|---|---|
| `wood.softwood` | S, else G | 230 (generic 75, rustic 69, republican 52) | Scan first: the `wood_cabinet_worn_long` 4k download (see "Second survey"), or any CC0 knotty pine board. Else: Planed softwood furniture boards (pine and larch) seen straight on, grain running top to bottom: wide soft growth rings, several dark round knots with grain flowing around them, a few resin streaks, a light oil finish worn matte, small dents and scratches. `wood.mahogany` stands in for every culture now, but its close ribbon figure reads as fine hardwood under pale pine, larch and birch tints. |
| `wood.painted` | G | 71 (painted 28, scrap 20, republican 9, rustic 8) | Painted wooden board seen straight on, grain running top to bottom: one coat of flat paint over planed wood, worn through to bare grain along the edges and in a few scuffed patches, fine cracks following the grain, small flakes lifted at the cracks. Paint in a light neutral grey so it tints to any colour. (Wants its own family: today the paint keys sit on `wood`, `plank` and `metal`.) |
| `plastic.moulded` | G | 77 (scrap 38, screamer 20, post-apoc 19) | Moulded plastic, the flat side of a crate or chair: fine moulded stipple texture, sun-faded and chalky in patches, scuffs, long scratches and a few grimy fingerprints in the hollows, one hairline stress crack. Light neutral grey so it tints. |
| `rubber.tyre` | G | 17 (scrap tyres) | The row above in "Prompts for generated sources" (already waited on by `kits/motor-vehicles`). Tyres share `plastic` today: give them a `rubber` family. |
| `ash.hearth` | G | 108 (every hearth, brazier, forge and stove) | Bed of wood ash in a hearth seen from above: soft pale grey powder ash with a few lumps of black charcoal, half-burnt twig ends, small cracked flakes, darker sooty patches toward one side. Full colour. (For the fire beds now drawn as flat `coal`/`ash` plaster or stone; the embers stay `glow`.) |
| `metal.pewter` | G | 62 (generic 21, rustic 21) | Hand-made pewter tableware surface: soft dull silver-grey with a satin sheen, faint hammer dimples, fine scratches in every direction, a dark grey oxide film in the scratches. Light, so it tints. (`metal.iron.pitted` is too dark and coarse for cups, plates and candlesticks.) |
| `metal.steel.brushed` | S | 163 (post-apoc 67, scrap 44, republican 24) | Scan: AmbientCG "brushed metal" or "sheet metal" with fine linear scratches. For the `steel` and `alloyWhite` keys; `metal.metal003` is painted, not bare. |
| `food.crust` | G | 80 (generic food and drink) | Baked bread crust seen close: a golden-brown crust with fine cracks and splits, a light dusting of flour in the cracks, small blisters and a few darker toasted spots. Muted, so it tints to bread, pie, roast meat and cheese rind. (Girder's `f_food` borrows `fruit.skin.amber`.) |
| `feather.plumage` | G | 23 (Screamer) | Overlapping feathers seen from above, as on a cloak or fan: rows of contour feathers about 4 cm long lying in one direction, visible central shafts and fine barbs, a few ruffled and split feathers. Light neutral grey so it tints red (#c8342a), yellow (#e0b030) and blue (#2a6aa0). (The `card.feather.*` sets are cut-outs, not a surface. Feathers sit on `hide` today: give them a `feather` family.) |
| `patterns/islander/tapa` | G | 18 (Islander) | Flat, front-on decorative panel of Polynesian tapa bark cloth: beaten mulberry bark in off-white (#f0e8d4) with visible fibres and faint felted texture, stamped and painted in rows of geometric motifs (triangles, chevrons, small crosses, leaf shapes) in brown (#8a5a32), tan (#c49a5a) and black, the rows divided by thin double lines. The pattern repeats horizontally. Full colour. |
| `stone.obsidian` | G | 17 (Voth) | Polished obsidian surface: glassy near-black (#1a1a1e) volcanic glass with faint conchoidal ripple marks, a few grey flow bands and tiny white spherulites, very slight smoky depth. Full colour. |
| `wood.endgrain` | G | 11, and the builders' yard log stock | Sawn end of a log seen straight on: concentric growth rings, darker heartwood, radial drying checks, saw marks across the face. The rings fill the frame edge to edge. Muted, so it tints. |
| `paper.parchment` | G | 15 books, 11 more with `paper*` keys | Old parchment sheet: cream (#e8dcb8) with uneven thickness, faint fibres, light foxing spots and soft creases. Muted, so it tints. |

**Prompted earlier and still owed:** `roof.reed` / `reed.bundle` (Reed Lake reed furniture, 37 pieces; `roof.thatch.reed`, delivered 2026-10-06, may
serve the reed family until then), `patterns/tribal/formline` (Painted's formline colours; `patterns/republic/folk-formline-*` may already serve).

**No pattern sheet at all** (hangings drawn by the kit's canvas painters, which work, so this is the last priority): Eastern Abyss, Lizardmen,
Nomad, Screamer. Each needs a style read of its culture file before a prompt is written.

**Family splits, done 2026-10-06, as texture families** (`kits/catalog/krator-furniture-core.js`, `FAMILY_SPLITS`, `furnFamily()`):
a part keeps its render family (its look, the batch's grouping, the declared `materials` and every check stay as they were) and gains
`userData.texFamily` by its palette key, so no culture file changed. A host maps `f_<texFamily>` and falls back to `f_<family>`, so a
host without the new row looks exactly as before. Splits: `feather*` (23 pieces), `tyre*` to `rubber` (17), `clay*` on `stone` to `clay`
(113: pots, but also clay hearths, counters and brick stacks, hence not "pottery"), `obsidian*` on `lacquer` (17), `pewter`/`tin` to
`pewter` (59), `paint*` on `wood`/`plank` to `paint` (14; the paint keys on `cloth` are painted cloth), the ash and coal keys on
`stone`/`plaster` to `ash` (15), `paper*` (10), `tapa*` (16). A part splits only when every key sharing its colour matches. The batch
(`krator-furniture-runtime.js`) buckets by family and texture family. Rows added: Girder `f_pewter`, `f_ash`, `f_clay`
(`ceramic.terracotta`), `f_paper`, and `f_food` is now `food.crust`; Scyvoi `f_ash`, `f_food` on `food.crust`. Water also rides on `glass` (fountains, troughs); it wants the shader, not a map.

#### Buildings, vehicles and biomes audit (2026-10-06): what is still missing

*Wiring audit, 2026-10-07* (`python3 tools/textures/audit_wiring.py`, static, no image library): all 7 kits that make surfaces
with an adapter (ancients, fauna, mechs, motor-vehicles, post-apoc, ringsea, scyvoi) and all 14 biomes have a `materials.json` whose
every family resolves to a delivered set, a `tex/pack.json` entry for it, and a `build.py` or bundle that reads `tex/`. The
`kits/mechs` pack only carried stale source hashes for four normal maps (the packed WebP bytes were unchanged); re-packed.
**Still unwired:** `kits/catalog`, `kits/interiors`, `kits/ancients-interiors` have no adapter of their own: catalog furniture
takes a library set only through a host's `f_<family>` rows, and only Girder (29), Scyvoi (22) and Noah's Regret (8) have them.
Mav's Refuge, Screamers, Highlands, Locus, Mungo, Verge, the Ancients kit and post-apoc bundle the furniture with vertex colours
alone. The fix is a shared detail-map pass in the furniture runtime (Girder's `48-detail.js`, Scyvoi's `svfDetail`) and a default
`f_` adapter from the picks listed under "Catalog furniture audit".

*Update, same day:* **Jimjam is wired** (`settlements/jimjam/materials.json`: 17 families, full colour, every JMAT texture
from the texturepalooza sets; README "Textures").

A read-only sweep of every build's painters (`TEX.*`, FAMMAT) and every biome's species, bark, ground and fauna sections against the
library, after the texturepalooza delivery. **The main finding: almost every building surface already has a set; what is missing is
wiring.** Only Girder, Yuni, Ys (hyk), Scyvoi, motor-vehicles, mechs, crater-drylands and ebadlands read the library. Mav's Refuge,
Locus, Voth, Iziz's vernacular, the shared vernacular (Highlands, Dalab, Reed Lake, Xanadu, Ys), Jimjam, Shade, Port, Ring Sea,
post-apoc, the Ancients kit, the interiors kit and ten biomes (hyperjungle, nhighlands, nw/swlowlands, nw/swbay, sedesert, eastabyss,
rift, xanadu) each need a `materials.json` pass; openworld/little-demo needs a terrain splat and the kits' packs.

**Paste-ready versions of everything still owed are in `PROMPTS-ready.md` (section 1 buildings, 2 biomes).**

**Buildings: prompted earlier and still owed** (rows above; most builds first): `cloth.canvas.striped` (the tinted awning: Iziz,
Highlands, Dalab, Reed Lake, Xanadu, Ys, Verge), `wood.log.carved` (round-log walls: Highlands, Dalab, Reed Lake, Ys), `concrete.ancient`
(board-formed with tie holes: the whole Ancients lineage; `concrete.board` stands in), one rammed-earth set with lifts (merges
`earth.rammed.dalab` and Xanadu's `stone.rammed`), `metal.container` (the neutral rib: Port, Ys, post-apoc), the reed set (`reed.bundle`,
`reed.layers`, `ground.reedbed`, `reed.living`), `metal.worn`, `patterns/port/hazard` and `primer`, `plate.hex` (Ring Sea), `concrete.slab`,
`wood.lash`, the stalk of `organic.fungus`, `stone.rendered.ruined`, and the culture sheets (Dalab banner, mosaic and two murals; Reed Lake
band and awayo; Xanadu twig band and sun emblem; the three nacre sheets).

**Buildings: new rows** (no set, no earlier prompt):

| id | Builds | Material line |
|---|---|---|
| `metal.tin.patchwork` | Locus (Abyss `tinmirror`) | Flattened tin cans and foil nailed edge to edge, embossed rims and ribs, crimped seams, a few mirror shards, dents, light rust at the nails. Near-colourless grey, so it tints. |
| `cloth.banner.hung` | Iziz and Dalab `vpBanner`, generic banners | Plain-woven banner cloth seen flat, a sewn hem at the top and a fringed foot, faded and creased. Neutral grey, so it tints. (Could absorb `cloth.banner.dalab`.) |
| `patterns/common/sail-band` | Locus `pattern` | Flat, front-on woven band of zigzags and stepped triangles, the motif a darker shade of the ground, greyscale so it tints. The pattern repeats horizontally. |
| `card.chainlink` | post-apoc, Port fences | Diamond chain-link mesh of galvanised wire, flat and front-on, on solid flat bright magenta (#ff00ff) so the gaps cut out. |

**Biomes: new rows** (every one confirmed in a kit's `src/`; cards on magenta #ff00ff, nine per sheet, near-grey green so they tint):

| id | Biomes | Material line |
|---|---|---|
| `card.reed` | crater, ebadlands, sedesert, eastabyss, rift, nw/swbay, nw/swlowlands, xanadu | Nine clumps of marsh reed, cattail and sedge: thin upright blades, two with brown cigar heads and two with feathery plumes, each standing from the bottom of its cell. (`card.crop` is broad strap leaves.) |
| `card.acacia` | sedesert, eastabyss, rift, nw/swbay, nw/swlowlands, xanadu | Nine flat sprays of bipinnate leaves (mesquite, acacia, flame tree): a central stem with paired pinnae of tiny oval leaflets, seen from above. |
| `card.beard` | eastabyss, rift, nhighlands, nw/swlowlands, nw/swbay, xanadu | Nine hanging tangles of beard lichen and Spanish moss, fine stringy grey-green strands, each hung from the top edge of its cell. |
| `card.palm` | sedesert, eastabyss, rift, nw/swlowlands, xanadu | Five pinnate date-palm fronds laid diagonally and four pleated fan-palm (palmetto) fans. |
| `card.sword` | sedesert, eastabyss, rift, nw/swbay, nw/swlowlands | Nine stiff sword-leaf rosettes seen from above (dragon tree, yucca, agave): rigid tapering blades radiating from a centre. (Try `card.screwpine` first.) |
| `bark.smooth` | nhighlands, xanadu, eastabyss, rift, nw/swbay, nw/swlowlands | Smooth thin bark (beech, alder): pale grey with faint horizontal rings, short dark lenticel dashes, a few soft algae blotches. Tintable. |
| `skin.cactus` | sedesert, ebadlands, xanadu | Cactus skin seen close: shallow vertical ribs, areoles in a lattice every few cm with pale wool tufts and fine spines, a matte waxy bloom. Neutral grey-green, tintable. |
| `bark.treefern` | nwlowlands, eastabyss, rift, nw/swbay | Tree-fern trunk: dark fibrous matted roots over a lattice of oval frond-base scars. Tintable. |
| `card.paddle` | nhighlands, nw/swlowlands, nw/swbay, xanadu | Nine big single leaves: banana with torn split edges, elephant-ear hearts; midrib and parallel veins. |
| `card.blossom` | nw/swlowlands, xanadu | Nine twigs dense with small five-petalled blossoms (cherry), three with hanging wisteria-like racemes; petals pale cream so they tint. |
| `card.araucaria`, `bark.araucaria` | swbay, rift, eastabyss | Monkey-puzzle branch ropes clothed in stiff overlapping triangular scale-leaves; the bark grey-brown with diamond scale scars. |
| `bark.lepido` | eastabyss, rift | Lepidodendron trunk: a diamond lattice of raised leaf cushions, each with a small scar. Near-grey, tintable. |
| `bark.birch` | nhighlands, nwlowlands | White birch bark with black horizontal lenticels, dark chevron scars at branch stubs, papery curls. |
| `card.lichen` | sedesert, ebadlands, crater | Nine ragged lichen patches, crustose and foliose rosettes, orange, grey-green and yellow. Full colour. |
| `card.lotus` | nwbay, xanadu | Lotus flowers and notched lily pads seen from above; pads near-grey green, petals pale so they tint. |
| `ground.cinder` | nw/swbay | Black volcanic beach sand and cinder grit seen from above, a few vesicular clasts and grey ash drifts. Tintable. |

Minor, one biome each: `bark.madrone`, `bark.paperbark`, `bark.cork`, `bark.strangler`, `bark.cherry`, `bark.kapok`, `card.samphire`, `card.ginkgo`,
`card.heath`, `ground.shingle` (xanadu), `skin.marine`, `wood.petrified`. Still owed from earlier rows: `bark.desert` (sedesert, crater yucca and
joshua), (the hyperjungle `FAUNATEX` hook is now full: `wing.butterfly` and `skin.sky-ray` were delivered 2026-10-06 and are in Iziz's pack). Fauna in every biome is vertex colour; `feather.plumage`,
`hide.fur.brown`, `organic.scale.*` and `membrane.bat` cover them once a biome adopts the library.

#### Wiring status and the sweep (2026-10-06, evening)

**Connected today** (materials.json + pack + code): settlements girder, yuni, ys (hyk), jimjam, mavs-refuge, locus, voth, iziz
(vernacular + fauna), xanadu, reedlake, highlands, dalab (the vernacular MAT keys through `core/materials/record/26-matlib-bind.js`,
`KMAT.bindMat`), shade (nomad kit); every biome kit (`BIO.libSwap` in core/biome 20-core-kit.js; materials.json `cell` shows one plant of
a nine-plant sheet); the vendored biome copies in iziz (city), dalab, highlands (roketstad), xanadu, ys, shade and locus (the code
change vended by hand, since those copies already drift; the biome's pack inlined before the biome code). Brightness rule: every grey
set's `tint.mean` is the measured mean of the procedural map it replaces, so palettes keep their tone.

**Still unwired, sets exist** (a full sweep of src/ found these; most valuable first):
**Wired 2026-10-06 (late): the shared Ancients MAT.** `KMAT.bindMat(build, MAT, {tile: KMAT.ANCIENT_TILES})` binds `white` ->
   `metal.ancient.white`, `verdigris` -> `metal.bronze.verdigris`, `concrete`/`concreteR` -> `concrete.ancient`, `paving` -> `concrete.ancient.b`,
   `brick` -> `brick.red`, `corrugate` -> `metal.corrugated_iron_02`, `timber` -> `wood.weathered_brown_planks`, `tarp` -> `cloth.tarp`,
   `whiteWorn` -> `metal.worn`, `rubbleK` -> `rock.rocks013` in kits/ancients, port, screamers, iziz, dalab, highlands, reedlake, xanadu, ys and
   jimjam (each its own rows in materials.json). `KMAT.ANCIENT_TILES` (26-matlib-bind.js) holds each key's procedural tile in metres for
   meshes with no world UV. **`rust` stays procedural:** the kit's beams, tanks and spheres stretch their UVs, and both `metal.rust.plate`
   and `metal.rusty_metal_04` smeared into stripes on the Rehabilitated factory. A rust set for stretched UVs (a fine, isotropic
   rust with no plate or streak direction) would fix it: `metal.rust.fine` in PROMPTS-ready.md.
2. Ring Sea is wired (2026-10-06, late: `wood.siding`, `cloth.canvas`, `roof.thatch.reed`, `roof.tile`, `plate.hex`, `organic.chitin.scale`,
   the Ancient white and verdigris; its scale is in UV tiles, see kits/ringsea/materials.json). Post-Apoc is wired for planks, earth, concrete, timber and cloth (`wood.reclaimed`, `earth.floor.packed`,
   `concrete.slab`, `wood.timber`, `cloth.weave.burlap`); its rusty metals stay procedural until a rust-streaked tintable corrugate comes
   (`metal.corrugated.rusty`, prompted): `metal.container` and `metal.tin.patchwork` are too clean for it. Verge and Mungo take the packs of the builds they assemble (no materials.json of their own):
   Verge Iziz's (not the fauna), Locus's and both biomes'; Mungo Locus's, Reed Lake's and the eastabyss biome's.
   Interiors has nothing to wire: its shells are flat-colour debug views, and the worlds that host its rooms draw their own walls.
**Sidecar packs (2026-10-06, late).** A page that carries several packs or nears the gallery's 16 MB a file keeps its maps beside it,
   one `<page>.tex.<key>.js` per pack loaded by `<script src>` (`tools/textures/matlib_pack.py`: `fragment(..., side=)`,
   `write_sidecar`); `gallery/build_gallery.py` copies them beside the page. Verge, Mungo and Ys do this.
   `tint.colour` (pack.py): a grey set takes a hue at the same brightness, for builds whose procedural maps carry their colour.
3. The vernacular's own families. Done 2026-10-06 (late): Highlands' logs (`wood.log.carved`), scale (`roof.scale.slate`), rubbleW
   (`rock.old_stone_wall`), bamboo (`wood.bamboo_wall`), bmat (`fibre.reedmat`), in Highlands, Dalab, Reed Lake and Ys; Reed Lake's rlMat,
   rlMatM (`fibre.reedmat`), rlThatch (`roof.thatch.reed`), rlIsland (`ground.reedbed`), rlLayer (`reed.layers`), rlBundleX (`reed.bundle`).
   Xanadu: xEarth (`earth.adobe`), xWash (`plaster.white_stucco_02`), xTiles (`paving.tiles144`), xRubble, xRock (`rock.rock_face`).
   Dalab: the four murals, relief-squares, relief-tile-teal, checker-harlequin, god-panel-a, mosaic, banner (patterns/dalab).
   The Voth embassy (Iziz, Dalab, Ys): vpTile (`roof.tile`), vpBanco (`earth.banco`), vpMosaic (`patterns/dalab/mosaic`). The Port kit
   (Port, Ys): pkCont (`metal.container`), pkPave (`concrete.slab`).
   Pattern sheets: Highlands hTileD/S/T/W (`tile-*`, the Temple of the Pantheon), hHarlG (`harlequin`), hMaze (`maze-weathered`);
   Reed Lake rlBand (`band`), rlShield (`chakana`), rlCloth (`chakana-textile-red`). Not used: the lattices, `fringe`, `chakana` cut-outs
   (the sets are opaque), the friezes, `crane-floral`, `maze`, the Xanadu motifs (blue ground under cut-out motifs).
   Still to do: Highlands (turf waits for `roof.turf`; rock,
   meadow have mesh UVs, the h* pattern sheets), Reed Lake (rlBundle has separate u and v tiles; the band and chakana patterns), Xanadu (x* -> the Xanadu patterns,
   `plaster.white_stucco_02`, `paving.tiles144`), vpBanner (keeps its device), pkContR and pkPaveR (rust and ruin).
4. Biome slots. Done 2026-10-06 (late): flowers (`bloom` -> `card.flower.bloom`, grey, in the eight biomes that have it); the hosts' ground
   detail and salt-pan cracks (`groundDetail` -> `ground.gravelly_sand`, `groundCrack` -> `ground.playa.red`, colour map only, through a local
   `hostGroundLib` in each host, so pages without the pack keep the procedural layers); nhighlands' bark, fallen-wood and boulder buckets (now
   built into `NHL.BKMAT` and swapped before the buckets: ponderosa, juniper, smooth, birch, ironbark, pine scale, char, `wood.gnarled`);
   hyperjungle's limb (`bark.smooth`) and dead wood (`wood.gnarled`); the girder tower hosts' concrete and iron (`concrete.ancient`,
   `metal.rust.plate`) and the bay jetties' stone (`stone.cut`). Left procedural: the iridescent trumpet and Rift barks (shader-coloured).
5. Smaller: Voth's ship hulls and sails, the catalog's painted decals (a cloth or parchment detail under the paint), mechs' leather, wood and
   rubber riding on the cloth bucket, motor-vehicles' null leather/rope/tin slots, Scyvoi's brass/bone/flag keys.

**New images the sweep found** (PROMPTS-ready.md section 3): `roof.turf`, `tile.bath.lens`, `panel.solar`, `card.pods`, `card.litter`,
`card.reef`, `bark.paperbark`, `bark.whorled`, `organic.fungus.gill`, `skin.alien.banded`. Owed from before: `earth.rammed`,
`band.xanadu.twig`, `patterns/xanadu/sun-emblem`, the two nacre sheets, `wood.petrified`, `patterns/reedlake/awayo` (`wood.lash` is made, on
claude/hexahedron-materials).

#### The Fauna kit (`kits/fauna`, 2026-10-06)

48 species, 136 builds. Each surface is a material family carrying a library set as a triplanar detail map (`kits/fauna/materials.json`;
the vertex colours keep each animal's markings, so every set must be **tintable**). Now: `coat` (thick fur) `fur.bat`, `sleek` (short hair)
`hide.strider` (a stand-in: it is lighter and streakier than a sleek coat), `skin` `hide.leather033c`, `scale` `organic.scale`, `membrane`
`membrane.bat`, `chitin` `organic.chitin`, `horn` `bone.horn`, `hair` `hair.crest`. `hide.fur.brown` was the coat until 2026-10-06: its pale
bald blotches read as spots on every deer, dog and grazer; `hide.leather008`, the old skin, is a black crocodile crackle. `feather` has no map:
17 birds and the emu's plumage wait on it.

**Still needed for fauna**, most animals first. All G rows start with the base template and the muting sentence.

| id | Animals | Material line | Reuse |
|---|---|---|---|
| `feather.plumage` | 17 birds (hen, duck, gull, kite, swift, darters, flamingo, emu, sand strider, archaeopteryx ...) | The row in the catalog audit above. | feather cloaks, fans, headdresses, fletching (Screamer furniture) |
| `feather.flight` | every bird's folded and spread wings | Folded bird flight feathers seen from above, as on a closed wing: long primary and secondary feathers about 25 cm long lying parallel and overlapping like roof shingles, each with a visible pale central shaft, smooth vanes and a slightly ragged tip, narrow dark gaps between them. Light neutral grey so it can be tinted. | wings on banners and crests, arrow fletching, feather fans |
| `hide.sleek` | horse, mule deer, cattle, water buffalo, dromedary, coyote, arena tiger, grazer, stalker, strider | Short sleek animal coat seen close up, as on a horse or a deer: very short dense glossy hairs all lying in one direction, faint swirls where the hair changes direction, a soft sheen along the hair, no spots, stripes or markings. Light neutral warm grey-tan so it can be tinted. | hair-on hide: saddle skirts, drum skins, quivers, upholstery, pelts on any culture's furniture |
| `wool.fleece` | sheep, yak (undercoat), goat kids | Sheep's fleece on the living animal seen close up: dense crimped wool staples about 5 cm long packed side by side, each a twisted lock with a slightly darker weathered tip, small dark gaps between the locks, a few bits of dry grass caught in it. Off-white, evenly muted. | fleece rugs, saddle pads, felt (the Scyvoi gers' felt walls), sheepskin cloaks and bedding |
| `skin.smooth` | fire salamander, bay swimmer, sky ray, pig (tinted pink), frilled and pit lizards' bellies | Smooth moist animal skin as on a salamander, a frog or a whale: fine pores, soft wrinkles and creases in loose bands, a few tiny raised bumps, slightly glossy, no scales and no hair. Neutral mid grey so it can be tinted. | eels, frogs, cave creatures, fish without scales, any smooth-skinned alien beast; oiled leather |
| `wing.butterfly` | jungle butterfly, cap moth (owed since the Girder flyers) | Full colour, not tintable: one butterfly forewing and hindwing pair seen flat from above, filling the square, on a solid flat bright green (#00ff00) background so it can be cut out: dark veins branching from the base, scale texture visible up close, a broad dark rim with pale spots, two large eye-spots on the hindwing, in warm rose and cream. Square, 2048x2048; no body, no other objects. | any butterfly or moth (tinted per species), fairy wings, banners |
| `skin.sky-ray` | sky ray (owed since the Girder flyers) | Skin of a giant flying ray seen from above: smooth leathery hide, fine sandpaper-like dermal denticles, faint darker mottling in soft rings, a few pale scars. Neutral slate grey so it can be tinted. | rays and skates, shark-skin grips (shagreen), any gliding membrane beast |

#### Scan-library metals (AmbientCG, added 2026-10-02)

Provisional, to be judged in the demo kit. In the owner's AmbientCG folder, each with a metalness map:

| Set | Reads as | For |
|---|---|---|
| `Metal034` | flat saturated yellow gold, no detail | `metal.gold` (needs the metalness map; add a hammered normal in the shader) |
| `Foil002`, `Metal042A` | pale champagne gold / brass | `metal.gold` or `metal.bronze` lightened |
| `Metal008` | warm brown-pink copper, mottled | `metal.bronze` |
| `Metal003` | light grey painted aluminium | `steel.painted` |
| `Metal038` | dark grey cast steel | `metal.iron` |
| `Metal049A` | near-white painted metal | `steel.painted` (tinted) |
| `Metal017`, `Metal062C` | grey metal with flaking, peeling paint | `steel.painted`, `concrete.cracked` look |
| `Metal053C`, `Metal054C` | orange rust on grey | `steel.rust` |
| `Metal058C` | turquoise verdigris paint | `metal.verdigris` |
| `MetalPlates001` | grey plates with rivet groups | `metal.plated` |


#### Second survey (2026-10-03): biomes, city streets and parks, furniture

The owner's newer downloads (44 sets: AmbientCG Ground, Rock, Gravel, Snow, Fabric, Tiles, Marble, Moss, and Poly Haven sand,
grass, mosaic and fabric) are in the demo kit under these columns. All are provisional scan picks (scale marked "scale?").

- **Hyperjungle:** Ground047 (moss on wet soil), Ground068 (red soil, moss), Ground072 (leaf mulch), Ground106 (dark floor), Moss001, Moss002/003.
- **N highlands:** Snow011, Snow015, ScatteredLeaves008 (autumn litter), Rock058 (slate), forest_leaves_02/04.
- **Desert (sedesert, Shade):** Ground080, Ground093C (sand), gravelly_sand, Rocks013, Ground111, sandstone_*.
- **Bays and coast:** damp_beach_sand, coast_sand_rocks_02, Rock035 and Rock037 (black volcanic), palm and willow bark.
- **Lowlands and savanna:** Ground037, leafy_grass, sparse_grass, withered_grass, grass_ground.
- **City parks and streets:** Ground003 (lawn), Pathway004 and grass_path_3 (paths), Gravel019/042, Rock064 and grassy_cobblestone (cobbles), Tiles144 (plaza), old_mosaic_floor, dirt, brown_mud_02.
- **Furniture:** Fabric027 (basket weave), Fabric045 (linen), denim_fabric_05, quatrefoil_jacquard (upholstery), Marble012 (tops), wood_cabinet_worn_long (did not reduce: a 700 MB 16k PNG inside a zip; needs a 4k download), the existing leather and Metal sets.

Still missing: ~~leaf cards with an alpha mask~~ (corrected 2026-10-03: the AmbientCG `Leaf*` and `LeafSet*` zips DO carry `_Opacity.png` maps; `ingest_polyhaven.py` only reads colour, so a leaf-card step must read the opacity map: LeafSet019 fronds, 023 and 024 broad leaves, 029 lobed, 013 long willow leaves); fern, palm and vine sheets; clean kerb, flagstone and asphalt
or dirt-road surfaces with ruts; glass; wicker or rattan with an alpha edge; ceramic glaze, bone and wax; iridescent canopy shader; ghostwood and prism-gum
bark (white and rainbow-streaked); water. `Foliage008` (green beans on white) and `SurfaceImperfections017` are not materials. `Fabric083`
looks like an alpha-preview checker.

**Scale review log (owner, 2026-10-03):** scale judged fine for Gravel042, Ground003, Ground095B and the grounds in the demo generally; no scale was
called questionable yet. Add any that are, here, so a "looks wrong" report can be traced to the scale guess first.
**Roughness (2026-10-03):** AmbientCG ground and pavement roughness maps average 0.45 to 0.65 and read as wet under sun and environment light;
Poly Haven dirt, mud and sand are about 0.95 and read fine. The demo's Matte slider pulls non-metals toward matte (default on). When these sets are
adopted, raise the committed roughness map for ground, pavement, plaster and stone sets (about `r + (1-r)*0.65`) instead of relying on the renderer.

Dalab: 13 generated images now exist (relief and tile sets, two god panels, five murals, a harlequin checker); processed into the demo, prompts not recorded.
Mockup: removed 2026-10-03 (the owner judged the Girder stand-in poor). The pilot is the real Girder build, starting from its baselined page.


#### Scan picks committed (2026-10-03)

The owner reviewed the scan candidates in the demo kit ("the picks looked fine") and 101 were committed to `core/materials/library`, as
`<family>.<slug>`: `ground.*`, `rock.*`, `paving.*`, `plaster.*`, `concrete.*`, `wood.*`, `metal.*`, `roof.*`, `fibre.*`, `cloth.*`, `bark.*`, `leaf.*`
(for example `ground.gravel042`, `rock.rock_face`, `metal.metal034`). Batches: `tools/textures/batches/scan-2026-10-*.json`; run
`adopt.py --polyhaven <ingest dir> <batch>` with the demo scratch folders to reproduce.
- Colour maps are unmuted (`mute: 0`) as the owner saw them; `tint` is per set. Metals carry their metalness in the record (`metal`).
- Roughness maps are baked matte: `r' = max(r + (1-r)*0.8, floor)`, floor 0.9 for natural surfaces, 0.7 for wood and the rest, 0.55 for glazed and polished
  ones (`rough_lift`, `rough_floor` in each meta). Metals keep their own roughness.
- Scales are the provisional guesses (see the scale log). The base ids in "The base library" (`wood.plank`, `rock`, `steel.rust`, ...) are the variants'
  parents: choose the one a build uses per id, or alias it.
- Not committed: `grey_plaster_03` (truncated download), `sandy_gravel_02` and `wood_cabinet_worn_long` (16k files that did not reduce), `Fabric083`
  (alpha-preview checker), `Foliage008` and `SurfaceImperfections017` (not materials).
- **Size:** `core/materials/library` is now about 350 MB and `patterns` 80 MB, so PLAN's "revisit Git LFS at 250 MB" trigger has passed. Normal maps were
  2 MB PNGs; on 2026-10-05 all 278 became 4:4:4 JPEG q95 (`normal.jpg`, 509 to 243 MB). Storing normals at 512 px is the
  next option if it needs to shrink further. (`tools/textures/pack.py` still writes its packed normals as lossy WebP, which is
  always 4:2:0: the same loss, in the packs.)


**Delivered 2026-10-03, not yet processed:** 39 ChatGPT images in the texture folder root (Highlands tile-d/s/t/w, harlequin, lattice grid, fret, maze; four wide friezes; Andean chakana textiles and emblem; golden straw fringe; four abalone, three mother-of-pearl, two pink onyx; three reptile scale, two chitin, a mushroom cap; fossil limestone; crimson lacquer, tarred planks, carved wood; golden bamboo lattice).
The cream-on-charcoal lattice is `patterns/highlands/lattice-lantern`; the cream triskelion lattice is a second fret (`patterns/highlands/lattice-triskelion`, used alongside the spiral `lattice-fret`).
`hide.leather008`, `hide.leather009` and `hide.leather033c` (AmbientCG Leather) were committed 2026-10-03 for `hide`.


**Section 8 deliveries (2026-10-03, not yet processed):** aged crackled ceramic, emerald glass swirl, mossy flagstone mosaic, pale honey wax, muddy wheel track (1024x1536, process with `--keep-aspect`), porous ivory, rattan lattice on magenta (needs a mask), two terracotta clays, and five more: a shaggy wool rug (`cloth.rug.wool`), granite kerbstones in a row (`paving.kerb`, 2:1), worn asphalt (`ground.asphalt`), a bubbled greenish glass pane (`glass.clear`) and a grey frosted glass (`glass.frosted`). Still missing from section 8: `wood.furniture.polished`.


#### Delivered 2026-10-03 and processed (committed with the history cleanup)

53 more ChatGPT sets (`tools/textures/batches/chatgpt-2026-10b.json`, sources in the owner's `texture\chatgpt-2026-10b`): Highlands `tile-d`, `tile-s`, `tile-t`, `tile-w`
(chevron, colourful, multicolour and oxblood-and-green fish-scale), `harlequin`, `lattice-grid`, `lattice-fret`, `lattice-triskelion`, `lattice-lantern`, `maze`
(and a weathered one) and four wide friezes (`frieze-nw-totemic`, `frieze-asian-nw`, `frieze-teal-gold`, `frieze-cloud-lotus`: caihua or formline candidates, trimmed of
their white margins, 4.5:1); Reed Lake `chakana`, `fringe` and two chakana textiles (awayo candidates); `wood.carved.reddish`, `wood.tarred.b`, `wood.lacquer.crimson`,
`fibre.bamboo.lattice`, `stone.coral`; `organic.scale` (three), `organic.chitin.shingle`, `organic.chitin.scale`, `organic.fungus.cap`; `shell.abalone` (four) and `shell.nacre`
(three) and `shell.conch` (two); section 8: `ceramic.glaze`, `ceramic.terracotta` (two), `glass.bottle`, `glass.clear`, `glass.frosted`, `paving.flagstone`, `paving.kerb`,
`wax.candle`, `bone.ivory`, `fibre.wicker` (magenta key still to be cut), `cloth.rug.wool`, `ground.road.ruts`, `ground.asphalt`. Still missing from section 8: `wood.furniture.polished`.
Wide or tall sheets keep their shape (`process.py --keep-aspect`); painted sheets are not de-lit.

#### Delivered 2026-10-05 and processed: Beast Rider furniture, goods and interiors (28 images)

From `PROMPTS-ready.md` (batches `chatgpt-2026-10c-beast-riders.json` and `chatgpt-2026-10c-cards.json`; the sheets on a magenta key go through
`cards.py`, which now has a chroma-key step: option `key`). Where a set is not Beast-Rider-specific it has a **generic id** so another culture takes it
without a copy; the third column says who else can use it.

| Set | Prompt row | Reuse (do not regenerate these) |
|---|---|---|
| `library/wood.mahogany` | `wood.mahogany` | the plan's `wood.furniture.polished` (section 8) for every culture's furniture; tint to taste |
| `library/metal.iron.pitted` | `metal.iron.pitted` | a rougher twin of Iziz's `metal.iron`; pots, hinges, brackets anywhere |
| `library/bone.skull`, `bone.horn`, `bone.antler` | same | Reed Lake, Dalab, Highlands bone and horn trim; `bone.horn` also reads as amber glass or resin; `bone.antler` as bleached driftwood or bark in any biome |
| `library/hide.pelt.cat` | `hide.pelt.cat` | rugs and cloaks in Reed Lake, Dalab, Highlands, Xanadu; big-cat fauna. Full colour (leopard), not tintable |
| `library/hide.fur.brown` | not in the list (an extra) | **the fauna fur**: sloths and striders (Iziz's `fauna_fur`, `fauna_hide`), rugs, cloaks. Tintable |
| `library/fibre.reedmat` | `fibre.mat.floor` | **also the plan's `fibre.reedmat`** (Reed Lake, Dalab, Highlands). A herringbone, where the row asked for a twill: fine |
| `library/cloth.silk` | `cloth.silk` | silk, fine linen and valances for Xanadu, Iziz, Voth, the nacre culture. Neutral: tint it |
| `library/wax.tallow` | `wax.tallow` | tallow, wax, cheese; tinted, plain marble or ivory resin. (`wax.candle` stays for candles) |
| `library/organic.gourd` | `organic.gourd` | gourds and squash in any settlement or biome |
| `library/earth.floor.packed` | `earth.floor.packed` | interior earth floors and dirt paths: Yuni, Locus, Shade, Reed Lake, Dalab |
| `library/fruit.skin.orange`, `fruit.skin.amber`, `fruit.capsule` | same | `kits/catalog` fruit in every biome (`biomes/FRUIT.md`); the capsule serves any dry pod or nut |
| `library/card.flower.bloom` | `card.flower.bloom` | six trumpet blooms on one card (cut cells for the butterflies' flowers, Xanadu gardens, market stalls) |
| `library/fibre.net` | `fibre.net` | a card: cargo nets, fishing nets and hammocks for Port, Ring Sea, Reed Lake, Girder |
| `patterns/common/rawhide` | `hide.rawhide` | drying frames, drums, shields, tents: Reed Lake, Dalab, Highlands. Single panel |
| `patterns/common/basket-coil` | `fibre.basket.coiled` | basket lids, mats, hat tops: Reed Lake, Dalab, Shade. A single spiral, not a tile |
| `patterns/common/lantern-horn`, `lantern-paper` | `lantern.horn`, `lantern.paper` | any lit lantern or window panel: Highlands, Xanadu, Port, Dalab. Single panels |
| `patterns/beast-riders/bone-inlay` | `bone-inlay` | also shell inlay for the nacre culture when tinted |
| `patterns/beast-riders/claw-tapestry`, `emblem`, `totem`, `pennant`, `plaque`, `saddle` | same (`saddle` is the `rider.saddle` row) | Beast Rider only; `pennant` and `saddle` can be recoloured for other cultures |

**Not in this batch:** `wood.lamppost`; every flora row (the mahogany and ironbark and baobab barks, the mahogany, vine, screwpine, bromeliad, moss and crop cards)
except the flower card; every mount and fauna row (membranes, feathers, wings, chitin, sloth, strider and ray skins) except `hide.fur.brown`.

**Look first:** `bone.horn` shows a mirrored zigzag when tiled (its bands curve); `wood.mahogany` and `fruit.skin.*` tile cleanly; `common/rawhide`, `lantern-*`
and `beast-riders/plaque` are single panels (their seam scores are high on purpose).

**Iziz delivery (same day, `iziz-2026-10-materials.json`, 11 images):** `stone.cut`, `stone.cut.b`, `plaster`, `brick`, `metal.corrugated`, `roof.tile` (all near-grey
and tintable, so they serve the other Iziz-style builds: Voth, Xanadu, Highlands, Port), `metal.iron`, `metal.bronze`, `metal.gold`, `patterns/iziz/mosaic-b`
(cobalt, turquoise, cream; the Iziz source's own mosaic colours), `glass.frosted.b`. Their tile sizes follow the cropped period (the scale's second number
is the width times the crop's height over its width). The corrugated sheet shows its lap seam as a horizontal line every tile.


#### Delivered 2026-10-05 (second part, `br.zip`) and processed: the rest of the Beast Rider set (22 images, one a duplicate)

Batches `chatgpt-2026-10d-beast-riders-rest.json` (13 surfaces) and `chatgpt-2026-10d-cards.json` (9 cut-outs, keyed from magenta).
`wood.lamppost` was pasted into the chat, not saved: its source is the 1254 px image from the session, converted to PNG. The sixth trumpet-flower image
(`... (1).png`) is byte-identical to the one already processed, so it was skipped.

| Set | Prompt row | Reuse |
|---|---|---|
| `organic.scale.terracotta` | `skin.scale.archae` | reptile scales anywhere (third of the `organic.scale` family) |
| `organic.chitin.iridescent` | `chitin.dragonfly` | any beetle, dragonfly or jewel surface; wants the iridescence hook |
| `membrane.pterosaur`, `membrane.bat` | same | leathery wings, sails, tent hide, dragon hide in any culture |
| `fur.sloth`, `hide.strider`, `fur.bat` | same | the Iziz sloths and striders (`fauna_fur`, `fauna_hide`); any furred animal, pelts, saddle blankets |
| `chitin.spider`, `chitin.millipede` | same | insect and segmented armour; the millipede also as banded wood trim |
| `bark.mahogany`, `bark.baobab`, `bark.ironbark` | same | the three hyperjungle barks; also pine, baobab-like and furrowed trunks in other biomes |
| `wood.lamppost` | `wood.lamppost` | posts, pilings and fence rails in any culture |
| `card.feather.archae`, `card.feather.crest` | `feather.archae`, `feather.quetzal-crest` | feathers for any bird, headdress, banner or fan |
| `card.bromeliad`, `card.mahogany`, `card.vine`, `card.moss`, `card.screwpine` (+ `.b`) | same | jungle and ruin dressing in any biome |
| `wing.dragonfly` | `wing.dragonfly` | a tight-cropped wing for bounding-box mapping (Girder `flywing`); any insect wing |
| `card.crop` | `card.crop` | nine maize-like strap leaves (a card): maize, cane, reeds, canna, any crop or marsh plant (pasted into the chat, batch `chatgpt-2026-10e-crop.json`) |
| `fruit.husk` | `fruit.husk` | velvet pod husk: baobab pods, felted hide, moss-bark and fuzzy fruit; a short-fur twin of `hide.strider` (pasted into the chat, batch `chatgpt-2026-10e-husk.json`) |

All delivered now: `skin.sky-ray` (2026-10-06, batch `chatgpt-2026-10n-owed.json`; Iziz `fauna_ray`), `wing.butterfly` (2026-10-06: batch `chatgpt-2026-10m-butterfly.json`, a tight-cropped card like `wing.dragonfly`; Iziz `fauna_wing`). Girder now uses `bark.ironbark` and `bark.baobab` in place of its borrowed willow and blue gum
(`bark0`, `bark3` in materials.json; 2026-10-05); `wood.lamppost` is ready for the `timber` family or a lamp-post family of its own.

**Known issues of this delivery:** `card.vine` is anchored at the top and its cut is clean but the stem colour is purple-brown; `wing.dragonfly` is stretched
square (it loses vertical resolution); `bone.horn`, `common/rawhide`, `lantern-*` and `beast-riders/plaque` are not tileable (see above); nothing in this
delivery has been judged in a render yet.

#### Delivered 2026-10-05 and processed: the Iziz mechs (4 images)

Batch `chatgpt-2026-10g-mechs.json`; sources in the owner's `texture/iziz/`. Prompts in the batch's records.

| Set | Use | Reuse |
|---|---|---|
| `metal.painted.chipped` | `kits/mechs` livery (tinted orange, cream, teal; chips shown as steel) | any painted metal: vehicles, ships' plating, shutters, post-apoc containers |
| `metal.joint.greasy` | `kits/mechs` joints, frames, pistons | machinery, engines, winches, the Ancients' mechanisms |
| `hair.crest` | `kits/mechs` horsehair crests | plumes, manes, horse tails, wigs, brushes |
| `patterns/iziz/sun-banner` | `kits/mechs` sun flags | Iziz banners and hangings anywhere (sockets, furniture); not exactly periodic: crop a window, do not wrap |

#### Delivered 2026-10-05 with the Scyvoi brief: four processed, six waiting for their files

Batch `scyvoi.json` (sources: the owner's chat images; the prompts were not given). The four below are processed and in
`kits/scyvoi/materials.json`:

| Set | Use | Reuse |
|---|---|---|
| `patterns/scyvoi/felt-scroll` | Scyvoi ger bands, door felts, floor felts, pavilion walls, saddle cloths | any steppe culture's shyrdak felt |
| `patterns/scyvoi/arch-lining` | Scyvoi pavilion and khaima linings, the chief's roof lining | Xanadu or Yuni hangings |
| `patterns/common/zellige-blue` | the stand-in for the appliqué and cold-flame sheets | zellige floors and fountains: Xanadu, Yuni court |
| `patterns/common/zellige-black` | the chief's wall bands, the shaman's floor | any court floor |

Twenty more sheets followed as files and are processed (the same batch; tiling sheets cropped to their period, the six
medallions kept whole as single panels: map each once, `kits/scyvoi/src/30-geo.js` `medallion()`):

| Set | Use in the Scyvoi kit | Reuse |
|---|---|---|
| `patterns/common/zellige-rosette`, `zellige-rosette-colour` | `patRose`; `patPoly` the chief's floor | court floors and fountains |
| `patterns/scyvoi/flame-zellige` | `patFlame`, the chief's foot band | fire temples |
| `patterns/scyvoi/fire-bloom` | `patBloom`, linings and the pavilion floor | Xanadu court cloth |
| `patterns/common/kilim-star` | `patKilim`, floors, barding, the divider | every nomad kilim (meets `patterns/nomads/kilim`) |
| `patterns/scyvoi/kilim-cold-flame` | `patCold`, the appliqué tent's panels | kilims, hangings |
| `patterns/common/celestial-giant` | `patCelest`, the chief's roof lining | ceilings and temples of any Krator culture |
| `patterns/common/tile-step-black`, `tile-quatrefoil-black` | the Baelu's gate passage and well apron | thresholds, austere courts |
| `patterns/common/tile-lotus-cross`, `tile-lattice-blue`, `-red`, `-saffron`, `zellige-lotus-teal` | not yet | floors and dados anywhere |
| `patterns/scyvoi/medallion-salamander`, `medallion-blades` | the chief's dais; the war tent's floor | the Scyvoi emblem; armouries |
| `patterns/common/medallion-moon`, `-cloud-blue`, `-star-blue`, `-sun-amber` | the shaman's hut, great ger, bell tent, pavilion | floor and dais medallions anywhere |

Then the two gaps, both processed (same batch): `library/cloth.tent.black` (the goat-hair row above: black-brown plain
weave with stray hairs; the Scyvoi black tents; reuse for Shade's Eastern Nomads) and `patterns/scyvoi/applique-blue`,
`applique-blue.b` (indigo felt flowers and leaf sprays hand-stitched on cream; the appliqué tent's panels; any steppe or
Tibetan-style tent).

#### Delivered 2026-10-06: texturepalooza (`tex.zip`, 48 images, 55 sets)

Batch `chatgpt-2026-10k-texturepalooza.json`. The images keep ChatGPT's titles; each was matched to an open prompt row by eye (the second
column). Two sheets came as several panels on one image and were cut apart before processing (the source names carry `__<panel>`):
the scallop tiles (three colourways) and the Jimjam brick reliefs (3 x 2). Ids are generic where the surface is (per "Reuse"); Jimjam's
`brick.jimjam.*` rows became `brick.*`. Tiling sheets are cropped to their own period and their `scale` follows the crop's aspect.
Not yet in any build's `materials.json`; all 55 are on the demo wall (`core/materials/demo`, status new until judged).

| Set | Prompt row | Reuse |
|---|---|---|
| `wood.softwood`, `wood.painted`, `plastic.moulded`, `rubber.tyre`, `metal.pewter`, `food.crust`, `feather.plumage`, `wood.endgrain`, `paper.parchment` (tintable) | the catalog audit rows of the same ids | catalog furniture per family (`f_<family>`); `rubber.tyre` is the motor-vehicles `rubber` slot |
| `ash.hearth`, `stone.obsidian`, `patterns/islander/tapa` (full colour) | same | hearths and fire rings anywhere; Voth and volcanic biomes; Islander cloth |
| `ground.salt`, `bark.mangrove` | Biomes rows | salt pans in any desert; mangroves and figs on any coast (tintable to the SW lowlands red) |
| `wood.siding` | `wood.hull` (Ring Sea) | hull strakes, clapboard and plank walls anywhere (tintable) |
| `patterns/common/container-red`, `hull-paint` | `patterns/port/livery`, `hull-paint` | Port, post-apoc, Ring Sea steel |
| `patterns/xanadu/zigzag`, `lozenge`, `bird`, `deer`, `star` | the Xanadu rows | Xanadu's Palopo bands |
| `patterns/common/jali-diamond`, `frieze-star-maroon`, `mosaic-star-lapis`, `mosaic-arabesque-lapis`, `valance-scallop` | `xanadu/jali`, `frieze`, `mosaic-star`, `mosaic-arabesque`, `valance` | screens, friezes and glazed tile in any court culture; the valance is greyscale and tinted |
| `brick.red`, `brick.ochre`, `brick.oxblood`, `brick.dark`, `brick.red.band` | `brick.jimjam.red`, `yellow`, `deep`, `dark`, `band` | Jimjam; brick walls in Port, Highlands, post-apoc, city streets (full colour) |
| `stone.marble.ashlar`, `plaster.ochre` | `stone.marble.trim`, `plaster.jimjam.ochre` | marble ashlar in Voth, Iziz, Xanadu, Ys; ochre wash in Dalab, Iziz, Yuni |
| `roof.scale.terracotta`, `roof.scale.slate`, `roof.scale.gilt` | `roof.dome.tile` (three colourways) | fish-scale roofs and domes: Highlands, Xanadu (`roof.gilt`), Voth, Republic |
| `patterns/common/medallion-sunray` | `inlay.jimjam.sunray` | plaza and floor medallions. A single panel: map once |
| `patterns/jimjam/shaft-spiral`, `-chevron`, `-diamond`, `-ogee`, `-fleur`, `-tracery` | `patterns/jimjam/shaft-*` | carved brick for any brick culture |
| `rock.sandstone`, `rock.sandstone.red` (full colour), `stone.chiselled`, `earth.adobe.pale`, `wood.timber` (tintable) | Shade's `rock.sandstone`, `.boulder`, `.carved`, `earth.pueblo`, `wood.timber.pueblo` | desert cliffs and boulders (sedesert, ebadlands, crater drylands); tooled stone; adobe in Yuni, Locus, Iziz, Dalab; plain timber anywhere |
| `roof.thatch.reed`, `fibre.rattan`, `roof.shingle.cedar`, `fibre.rope.twist`, `metal.rust.plate` (tintable) | Mav's `thatch.reed.mavs`, `cane.woven`, `roof.shingle.shakes`, `rope.twist`, `metal.rust.plate` | thatch also for Ring Sea `thatch.reed` and Reed Lake reed roofs; the rest in any culture |
| `patterns/common/frieze-palmette-red` | Mav's `trim.council` | lacquered friezes in Xanadu, Highlands, Iziz |

**Look first:** `wood.endgrain` has one ring centre per tile (map it per log face, not across a wall); `plastic.moulded` reads as much like
scuffed render as plastic; `wood.timber` came out grey-brown after muting (it is tinted in use); `roof.shingle.cedar` (seam score 2.3 across)
and `brick.red` (2.9 down) have the highest seam scores, though neither seam showed on the contact sheet; `common/valance-scallop` and
`common/jali-diamond` cut out on their black; `xanadu/bird` and `xanadu/deer` were cropped to their period (motifs whole, margins narrower).
Nothing in this delivery has been judged in a render yet.

#### Delivered 2026-10-06: texturepalooza 2 (`tex (2).zip`, 28 images: 21 surfaces, 7 cards)

Batches `chatgpt-2026-10l-texturepalooza2.json` (process.py) and `chatgpt-2026-10l-texturepalooza2-cards.json` (cards.py). They answer the
"Buildings, vehicles and biomes audit" rows above. Four card sheets came on flat grey, not magenta (`card.beard`, `card.reed`, `card.paddle`,
`card.blossom`): each was keyed first by a flood from the sheet's border through background-grey pixels (so the grey-green moss and the
cream petals survive), with the soft contact shadows under the reed clumps and leaves keyed too, then run through cards.py with no
chroma key (the meta's `_source.note` says so). Ask for magenta next time: the grey key is a workaround.

| Set | Prompt row | Reuse |
|---|---|---|
| `bark.birch`, `bark.birch.b` | `bark.birch` | nhighlands and nwlowlands birches; two variants for alternate trunks |
| `bark.smooth` | `bark.smooth` | beech, alder, rowan: the "pale"/k2 smooth kind in nine biomes |
| `bark.araucaria`, `bark.lepido` | same | monkey puzzles (swbay, rift); scale trees (eastabyss, rift k0) |
| `bark.cork`, `bark.madrone`, `bark.kapok`, `bark.cherry`, `bark.mosaic` | the minor bark rows | swlowlands cork, madrone, ringbark, crimson ghost and ribbon gum (`bark.mosaic`), nwlowlands paperbark, hyperjungle kapok (thorn bosses stay geometry). Madrone, cherry and mosaic are full colour |
| `bark.palm` | `bark.palm` (and `bark.treefern`) | wadi and water palms; the tree-fern trunks too (frond-base scars in fibre) |
| `leaf.araucaria` | `card.araucaria` (came as a surface) | a surface for the monkey puzzle's rope branches, which are geometry, so a surface suits them better than a card |
| `leaf.palm.thatch` | `card.palm` (came as a surface) | palm thatch and screens (Mav's design row `leaf.palm.thatch`); **`card.palm` is still owed** for frond cards |
| `skin.cactus` | `skin.cactus` | columnar cactus, prickly pear, barrel, pitaya |
| `ground.cinder` | `ground.cinder` | black sand and lava in the bays; volcanic ground in rift and eastabyss |
| `ground.lilypond` | `card.lotus` (came as a surface) | a still-water pond surface (xanadu, nwbay); full colour. A lotus card is still owed if single floating pads are wanted |
| `feather.plumage.b`, `organic.scale.olive.b` | extras | second plumage; lizard scales (sedesert, eastabyss) |
| `metal.tin.patchwork` | `metal.tin.patchwork` | Locus tinmirror; scrap and shanty walls |
| `patterns/common/sail-band` | same | Locus sail band; woven borders anywhere; greyscale, tinted |
| `patterns/common/banner-hung` | `cloth.banner.hung` | banners; a single panel, fringe at the foot: map once |
| `card.chainlink`, `card.acacia`, `card.sword`, `card.beard`, `card.reed`, `card.paddle`, `card.blossom` | same | fences; the biome cards of the audit |

Still owed from the audit after this: `card.palm` (fronds as a card), `card.lichen`, `card.lotus` (single pads), `bark.strangler`, `card.samphire`,
`card.ginkgo`, `card.heath`, `ground.shingle`, `skin.marine`, `wood.petrified`; and every building row in "prompted earlier and still owed".

#### The biome fruit (2026-10-06, late)

The catalog's fruit pieces (`krator-master-furniture-generic-fruit.js`, biomes/FRUIT.md) take texture families by palette key
(FAMILY_SPLITS in kits/catalog/krator-furniture-core.js): fruitSkin (`fruit.skin.orange`), fruitHusk (`fruit.husk`), fruitShell
(`fruit.capsule`), fruitScale (`fruit.scale`), fruitFlesh (`fruit.flesh`), fruitJelly (`fruit.jelly`), fruitSeed (`fruit.seeds`),
fungus (`organic.fungus.cap`). A key splits by an explicit list or by its last word (…Husk, …Shell, …Flesh or Pulp, …Water or Jelly,
…Seed or Kernel); shaded parts take the nearest fruit key's family. Hosts map `f_fruitSkin` and the rest (Girder, Scyvoi).
`fruit.seeds`, `fruit.flesh`, `fruit.scale` and `fruit.jelly` were generated for this (batches `chatgpt-2026-10u-fruit`, `-10v-jelly`).

#### Delivered 2026-10-06, late: the last nineteen prompts (Downloads)

Batches `chatgpt-2026-10r-owed.json` and `-cards.json`. Tintable: `earth.rammed` (lifts), `band.xanadu.twig`, `roof.turf`, `bark.whorled`,
`bark.paperbark`, `organic.fungus.gill` (the radiating gills meet in a soft band at the repeat), `skin.alien.banded`, `metal.corrugated.rusty`
(rust streaks kept), `metal.rust.fine` (came out an even pale-grey grain). Full colour: `tile.bath.lens`, `panel.solar`, `wood.petrified`,
`patterns/xanadu/sun-emblem`, `patterns/nacre/shell-inlay`, `patterns/nacre/pearl-mosaic`, `patterns/reedlake/awayo`. Cards (nine-cell
sheets, magenta keyed): `card.pods`, `card.litter`, `card.reef`. Wired the same evening: `metal.corrugated.rusty` on Post-Apoc's corr and cont. `metal.rust.fine` was tried on the Ancients kit's
rust and taken back out: it removes the stripes but reads as flat brown paint with no rust patches, and up close the stretched UVs still
pull its grain into streaks; the Ancients rust stays procedural (the stretch, not the texture, is the problem).
Also wired that evening: `earth.rammed` (Dalab dRammed; Xanadu xEarth, in place of earth.adobe), `roof.turf` (the vendored Highlands turf in
Highlands, Dalab, Reed Lake, Ys; Dalab dTurf), `band.xanadu.twig` (xPenbey), `tile.bath.lens` (xBTile, full colour), `patterns/nacre/pearl-mosaic`
(Ys hkMosaic, in place of paving.shell.terrazzo), `panel.solar` (motor-vehicles slot 10 `solar`: the Republic tractor's clam lid), and in the
biomes `card.pods` (sedesert), `card.litter` (ebadlands), `card.reef` cells (rift frill, candle, anemone; xanadu anemone, frill; nhighlands
fin; nwlowlands pen), `bark.whorled` and `wood.petrified` (xanadu bark0, bark1), `bark.paperbark` (nwlowlands bk.paper), `organic.fungus.gill`
(swbay gill), `skin.alien.banded` (ebadlands bark.alien, LIBBARK slot 5). Not wired: `patterns/xanadu/sun-emblem` (its slot is a cut-out),
`patterns/nacre/shell-inlay`, `patterns/reedlake/awayo` (the procedural stripe was kept by choice), crater drylands' litter (its own card
loader has no litter entry), `card.lotus.bloom` and `card.palm.coconut` (added 2026-10-06 late; no slot asks for them yet).
Voth (same evening): the owner's two Voth patterns, `patterns/voth/kilim-star` and `patterns/voth/kilim-tri`, as two new FAMMAT
families, `tapestry` (hanging banners: the guild hall's door banners, the weavers' loom cloth, the bridges' drop banners, banner panels,
the coastguard pennant) and `kilim` (canopies and stall awnings); full colour, the pieces drawn white over them (vothPatCol in
47-texture.js), their banner colours without the pack; they sway like cloth. 76 draw calls, within budget.
Two other sheets in Downloads (lotus blossoms, palm fronds) belong to another session and were left alone.

#### Delivered 2026-10-06: an unprompted extra (pasted into the chat)

Batch `chatgpt-2026-10p-gnarled.json`. `wood.gnarled`: weathered, wind-twisted wood with flowing grain and knots, full colour, 1 m tile.
Not wired; it is there for driftwood, burl furniture (carved tabletops, bowls, handles), old posts and stumps.

#### Delivered 2026-10-06: six owed prompts (pasted into the chat)

Batch `chatgpt-2026-10n-owed.json`. `skin.sky-ray` (Iziz `fauna_ray`; the `FAUNATEX` hook is now full), `hide.fuzz.pterosaur` (Girder
`fly_q_fuzz`, in place of the borrowed `hide.strider`), `cloth.canvas.striped` (the tinted awning stripe; not wired yet), `concrete.ancient`
(board-formed with tie holes and weeps, 1.95 m tile; not wired yet: the Ancients kit has no materials.json), `concrete.ancient.b` (an extra:
board marks without tie holes, a break-up partner), `wood.log.carved` (round-log walls; not wired yet). All tintable.

#### Delivered 2026-10-06: fourteen owed building prompts (pasted into the chat)

Batches `chatgpt-2026-10o-owed.json` and `-cards.json`. Reed Lake: `patterns/reedlake/band`, `ground.reedbed`, `reed.layers`, `reed.bundle`.
Ancients: `metal.worn` (full colour). Port and Ring Sea: `patterns/port/hazard`, `patterns/port/primer`, `plate.hex`. Post-apoc: `concrete.slab`.
Voth and Locus: `organic.fungus.stalk`. Highlands: `stone.rendered.ruined`. Dalab: `patterns/dalab/banner` (a single panel on flat grey, keyed
tight; map once over the banner quad, tinted), `patterns/dalab/mural-god-hero`, `patterns/dalab/mosaic` (the sheet's diamond grid drifts:
cropped by hand to its best two-period window first). Not wired to any build yet. **Look first:** `reed.layers` keeps a seam score of 3.0
down (the bottom course is cut through); fine on a contact sheet, judge it on an island side.

## Built so far (2026-10-02)

Nine ChatGPT-generated sources from the Beast Rider prompts above, processed by `tools/textures/process.py`
(batch `beast-riders.json`):

| Set | From | Notes |
|---|---|---|
| `library/wood.carved` | Hand-Carved Weathered Wood | distinctive knots repeat over large walls: pair with a variant or a shader break-up |
| `library/wood.tarred` | Weathered Tarred Wood Planks | dark areas made glossier (tar) |
| `library/roof.thatch` | Weathered Tropical Thatch | a lighter band near the top repeats at distance |
| `library/roof.shingle` | Weathered Rustic Wood Shingle | clean |
| `library/fibre.cane` | Weathered Bamboo Basket Weave | clean |
| `library/fibre.rope` | Seamless Weathered Hemp Rope Mat | clean |
| `patterns/beast-riders/cloth-1` | Vintage Tribal Woven Textile | cropped to the pattern period |
| `patterns/beast-riders/cloth-2` | Vintage Woven Tribal Diamond Stripe | the triangle band no longer shifts at the seam |
| `patterns/beast-riders/trim` | Crimson and Gold Ornamental Frieze | the claw motif no longer splits at the seam |

Procedural and derived (2026-10-02, no source image):

| Set | How | Notes |
|---|---|---|
| `library/cloth.weave.plain`, `.twill`, `.canvas`, `.burlap`, `cloth.felt`, `cloth.knit` | `make_cloth.py` | tile exactly by construction; near-grey, tintable; see "Cloth". The felt reads closer to a soft leather than to wool at a distance: a coarser fibre pass could follow |
| `library/roof.thatch.neutral`, `roof.shingle.neutral` | `adopt.py --neutral` | albedo only; normal and roughness are the sibling set's; for Iziz |

Tools written: `ingest_polyhaven.py` (tested on synthetic jpg, png, zip, nor_dx and ARM inputs; the EXR reader is not
exercised here, no OpenEXR available), `adopt.py`, `make_cloth.py`, `preview.py`.

These six library sets are kept at full colour (`tint: false`): they are Beast Rider surfaces. A culture that
wants the same thatch or rope in its own palette gets a muted copy (`--mute`) under its own id.

What the first delivery taught:
- The generator follows "seamless" well for surfaces (seven of nine tiled on arrival) but not for
  patterns, which need the period crop.
- It bakes in strong shading on deep-relief surfaces (thatch, tar, carving, the frieze). Ask for
  "shadowless", and expect the de-light step anyway.
- Record the exact prompt with each image. These nine only point at the plan's rows.

## How a build adopts the library (built 2026-10-03; Girder is the pilot)

- **The code** is `core/materials/record/` (not under `core/materials/`'s top level, so the Ancients-lineage builds
  that take every top-level fragment do not pick it up): `23-mat-record.js` (`KMAT`: the record above, a build's
  adapter, the pack registry, `table()` for the exporter), `24-tex-def.js` (`TEX`: a procedural texture as a record,
  `{id, kind, size, seed, params}`, with a pure pixel function; a canvas-drawn kind is marked `bake`), and
  `25-matlib-host.js` (the browser half: `?mat=proc`, data-URL images to three.js textures, `window._texPending`,
  and `KMAT.specularHook`, Godot's `specular` in three.js). `node core/materials/record/test-record.js`.
- **The build's adapter** is `<build>/materials.json`: per material family the library set, its tile size in world
  metres, `tint.keep` (how much of the set's own colour survives the build's palette tint; 0 = a grey detail map),
  `tint.mean` (the brightness to normalise to: the mean of the procedural map it replaces, so the build's palette and
  lights stay tuned), `tint.contrast`, `roughLift`, `specular`, `metal`.
- **The pack**: `python3 tools/textures/pack.py <build>` writes small processed copies (512 px WebP) into
  `<build>/tex/` with `pack.json`. The build reads only those committed files and inlines them as data URLs
  (a generated fragment), so it stays deterministic and needs no image library; `--check` says whether `tex/` is stale.
- **In the page**: a library family gets a `MeshStandardMaterial` with colour, normal and roughness maps; the others
  keep their procedural `TEX.def` map on the material they had. Geometry is unchanged: a library map repeats at its
  own tile size through the material, not through the build's UVs. `?mat=proc` shows the old look (Girder proved
  identical to its baseline: every material, texture pixel and static mesh). `window._materials` is the table.
- **Girder's choices** (`settlements/girder/materials.json`): planks, timber, cane walls, thatch and shingle
  (the neutral copies), rope, plain weave, rock face, rusty plates, board-marked concrete, willow bark for the
  ironbark (at 12 x 18 m: the trunks are 60 to 270 m tall), blue gum for the baobab, forest leaves on the ground.
  *2026-10-03, the owner's generated sets:* `bark.ghostwood` (12 x 12 m), `bark.prismgum` (24 x 30 m, full colour, the
  strips must stay about 2 m wide to read at a distance), `leaf.understorey` on the `leafy` family, and every bark
  with the break-up. The spider web stays procedural (it reads fine).
  *2026-10-05:* the generated `bark.ironbark` (12 x 18 m) and `bark.baobab` (8 x 8 m) replace the willow and the blue gum,
  and the dragonfly wing is the optional `flywing` card (`wing.dragonfly`, mapped by each wing's bounding box).
  *2026-10-05, the full Beast Rider set (89 families; settlements/girder/KNOWN_ISSUES.md lists each use):* meshes without UVs (the catalog
  furniture, the mounts, the millipedes, the gatepods) take a library set as a **detail map** (`48-detail.js`: triplanar projection of the
  mesh's own, pre-skinning position; the set's mean brightness divided back out, so the vertex colours keep theirs); a mount packs four sets
  into a 2x2 atlas chosen per colour (`FlyGeo.slots`), still one draw call. The village dressing takes new FAMMAT families, a **panel**
  family putting a whole sheet on each box face (banners, hides, plaques). The extra cards (bromeliad, screwpine, moss, maize, flowers,
  young mahogany, nets) are one merged mesh from their own generator (`64-cards.js`). `pack.py` takes pattern sheets (`patterns/...` as a
  family's `lib`) and a per-family `size`. Godot: the detail map is StandardMaterial3D's triplanar mode; the atlas quadrant a `CUSTOM0` value.
- **Cards** (alpha cut-outs: `record.kind 'card'`, written by `tools/textures/cards.py`, batch
  `girder-cards-2026-10.json`): `card.ironbark`, `card.ghostwood`, `card.prismgum`, `card.baobab` (the four species'
  leaf clumps), `card.ghostwood-flower` (the racemes, full colour), `card.fern` and `card.broadleaf` (two cells of the
  undergrowth atlas), `card.treefern` (not used yet). The card step crops to the opaque pixels, squares the image on an
  anchor (centre, bottom for a frond, top for a hanging chain) and bleeds the leaf colour out under the transparent
  pixels, so mipmaps never pull in the generator's background. `pack.py` keeps a card's alpha (lossless) and the colour
  under it, and resizes colour and alpha apart (Pillow's RGBA resize is premultiplied and blanks that colour).
  In Girder the painted leaf textures still run first, so the random stream every later tree draws from is unchanged.
- **Prompts that worked** for cards: "Leaf spray cut-out on a fully transparent background, PNG with alpha, square,
  2048x2048, viewed straight from above, flat even shadowless lighting, no stem or branch beyond the cluster, the spray
  filling the middle 70% of the frame. Leaves: ..." (each card's meta.json holds its exact line).
- **The first Ancients-lineage build: Screamers (2026-10-05).** `settlements/screamers/materials.json`: 13 families on
  the `MAT` table (board concrete for the Hexahedron at 4.2 m, rusty metal, corrugated, weathered planks, tarp, thatch,
  bark for the lashed posts, the four generated barks, packed earth for the ground, grass for the plaza lawn) and 6 on
  the Post-Apoc set's own materials (`"table": "apoc"`: its salvage homes). The lineage's UVs are in no one unit (lathe
  at 8 m a tile, kit boxes 0..1 per face), so the maps are sampled by **world-space triplanar projection**
  (`src/72c-matlib.js`): colour, a whiteout-blended normal per plane, roughness, and the break-up, all in world metres.
  It takes `23-mat-record.js` and `25-matlib-host.js` only: `24-tex-def.js`'s global `TEX` meets the lineage's canvas
  table. Every Ancients-lineage build (ancients, dalab, highlands, iziz, reedlake, xanadu) can adopt the same way:
  copy `72c-matlib.js` and `matlib_pack()`. The three gaps it named (`metal.ancient`, `wood.lash`, `ground.ruin`) were
  generated the same day (below). Not judged in the demo kit yet; `?mat=proc` is the old look.

#### Delivered 2026-10-05 (third part) and processed: the Ancients and Screamers gaps (3 images)

Batch `tools/textures/batches/chatgpt-2026-10f-screamers.json` (sources: the owner's three ChatGPT images, 1254 px).
| Set | Options | Reuse |
|---|---|---|
| `ground.ruin` | delight 0.3, cross-fade seams | every central-crater build on laterite (Screamers, Girder, Mav's Refuge, the Iziz hyperjungle); in Screamers in its own colours |
| `wood.lash` | delight 0.3, `--pattern` (period crop) | lashed post walls of any tribal culture (Screamers, Beast Riders, Ring Sea Islanders, the Highlands tribal set) |
| `metal.ancient` | delight 0.2, `--pattern`, rough 0.6 | the white panel metal of every Ancients-lineage build, and the Post-Apoc bulkhead; neutral, tinted per instance. A thin half-height panel row shows at the tile seam (the period crop), invisible at 4-6 m tiles |

#### Delivered 2026-10-06 and processed: ice (2 images)

Batch `tools/textures/batches/xanadu-ice-2026-10.json` (sources: two images the owner pasted, 1254 px). Xanadu takes
both through its first `materials.json` (families `icewall`, `icefloor`), for the Caves of Ice.
| Set | Options | Reuse |
|---|---|---|
| `ice.glacier` | delight 0.2, rough 0.35 | milky glacier ice with grit seams: ice-cave floors and crusts, frozen ground, glacier faces, snowfield edges (the Highlands, the Ring Sea's ice shelf) |
| `ice.clear` | delight 0.2, rough 0.2 | deep blue cracked clear ice: ice-cave walls and vaults, frozen lakes and falls, ice blocks and crystal props |

## Next steps

0. **Scan libraries:** catalogued (see "Available, not committed"). Nothing is reduced or committed until the demo texture
   kit (below) exists. **Culture images:** the Iziz, Voth and cloth deliveries are processed from
   `tools/textures/batches/iziz-voth-cloth.json` (19 sets, all tile on their `preview.py` sheets) and wait on the owner's
   go-ahead to commit. Still to be generated: Voth stucco, fungus cap and stem; the other prompts in this file.
   **Demo texture kit** (after the core is written): render every candidate set on a common test scene, mark the per-metre
   `scale` picks separately, then the owner rejects or keeps each one.
1. ~~**Girder hookup**~~ *Done 2026-10-03* (above). Open from it: the four procedural gaps; the owner's look
   review of `girder.html` against `girder.html?mat=proc`; GPU cost of the standard material on a real machine
   (the headless budget run counts draw calls and triangles, which did not change).
2. **The rest of Girder's surfaces**, below.
3. ~~**Repetition break-up**~~ *Done 2026-10-03 as a shader hook* (`KMAT.breakupHook`, record field `breakup:
   {mix, macro, cell}`): a world-space noise blends each map with a shifted copy of itself and varies the brightness
   slowly; colour, normal and roughness share the mask. Girder sets it per family in `materials.json` (strongest on
   the floor plates, decking and ground); `?breakup=0` turns it off to compare. Godot: one `.gdshader`, same three
   parameters.
4. **Iziz**, then the nacre culture (Ys's Hykkousoi), as the plan's order of work says.
5. ~~Decide Git LFS~~ Decided no; revisit at 250 MB (see "Git LFS").
6. **From the spiderbench read (2026-10-05, "Shader hooks"):** the `detail` record field and one shared `detail.*`
   set; `rough` and `grime` on `breakup` with the shared grime streak sheet (one generated image, prompt to write);
   a `coursing` TEX kind for ashlar and brick, piloted on Voth's canton walls, where the painted-joint history is.

## Available, not committed

**Decision (2026-10-02, owner):** nothing from the scan libraries is committed yet. Once `core/materials` is written, a **demo
texture kit** renders the candidates and the owner rejects or keeps each one. Picks that carry a per-metre `scale` are marked
separately in the demo, so the scale is judged by eye.

Candidates picked from the catalog (one or two per id; provisional): `wood.plank` old_wooden_floor_02, weathered_brown_planks;
`wood.beam` medieval_wood, wooden_gate; `rock` rock_boulder_dry, rock_face; `steel.rust` rusty_metal_04, rusty_metal_05 (and
AmbientCG Metal053C, Metal054C); `concrete` concrete_wall_009, brushed_concrete; `concrete.cracked` cracked_concrete_wall;
`ground.moss` AmbientCG Moss002, Moss003; `stone.cut` large_sandstone_blocks; `stone.rubble` old_stone_wall, rock_wall_12;
`plaster` white_stucco_02, grey_plaster_03; `earth.adobe` patterned_clay_plaster, clay_block_wall; `brick` brick_wall_001,
red_brick; `paving` cobblestone_01, pavement_01; `ground.dirt` dirt, brown_mud_02; `ground.sand` coast_sand_01, park_sand;
`roof.tile` ceramic_roof_01, clay_roof_tiles; `metal.corrugated` corrugated_iron_02, worn_corrugated_iron; `steel.painted`
blue_metal_plate; `metal.grating` metal_grate_rusty; `wood.bamboo` bamboo_wall, AmbientCG Bamboo001C; `tile.glazed`
marble_mosaic_tiles; `ground.turf` grass_ground; `stone.coral` coral_stone_wall; `bark.*` bark_brown_01, bark_willow_02,
bark_bluegum, palm_tree_bark, AmbientCG Bark015; `leaf.*` forest_leaves_02, forest_leaves_04. Sandstone for `sedesert` and Shade:
sandstone_cracks, sandstone_blocks_04, large_sandstone_blocks, rock_wall_11. The AmbientCG metals are tabulated under "Scan-library
metals" above.

Not usable: `marble_cliff_02` (truncated download); the AmbientCG `Leaf*` sets are single-leaf atlases with no alpha map (cut a
mask for leaf cards, not for the tiling library); Poly Haven has no gold or bronze.

Catalog notes: 367 Poly Haven assets (302 read first time, 24 more after the 16k fix; run with `--prefix` to split the pass),
25 AmbientCG colour sets plus the metals. The remaining slugs are in the owner's download and need no list here: rerun
`ingest_polyhaven.py --catalog-only` on it.

## Still needed for Girder

Scan library (ambientCG or Poly Haven, CC0; the ingest tool reduces them, see above):

| id | Search for |
|---|---|
| `wood.plank` | "wood planks" or "wood floor", weathered |
| `wood.beam` | "wood" rough sawn or "bark-free timber" |
| `rock` | "rock" or "cliff", grey-brown |
| `steel.rust` | "rust" or "rusted metal" |
| `concrete` | "concrete" weathered, stained |
| `ground.moss` | "moss" |

Generated (start each with the base template above; full colour, so leave out the muting sentence):

| id | Material line |
|---|---|
| `patterns/beast-riders/cloth-3` | Hand-woven heavy cotton cloth with a tribal geometric pattern of stripes, zigzags and diamond bands, dyed burnt rust orange (#b8683e) with dark brown (#4e3a28) and cream (#d8c8a0) accents, visible weave, slightly faded and uneven dye. The pattern repeats horizontally. |
| `patterns/beast-riders/cloth-4` | The same cloth, dyed deep indigo-violet (#4a3a6a) with ochre (#c2a24e) and rust (#b8683e) accents. |
| `patterns/beast-riders/cloth-5` | The same cloth, dyed ochre (#8a5a2a) with deep red (#7a2028) and dark green (#2f5a3a) accents. |
| `patterns/beast-riders/awning` | Coarse sun-faded canvas, broad stripes in burnt orange (#b8683e) and sage green (#8a9a5a), visible coarse weave, water stains and mended patches. The stripes run vertically and repeat horizontally. |
| `cloth.plain` | (the owner has this one to deliver; the procedural `cloth.weave.*` sets cover the base weaves) Plain hand-woven undyed linen cloth, visible weave, slight slubs and colour variation in the thread, soft creases. |
| `cloth.canvas` | Coarse heavy undyed canvas, visible coarse weave, water stains, a mended patch. |
| `wood.lacquer` | Wooden panel finished in thick red lacquer (#8a2f2a), worn at the edges to show wood underneath, fine crazing in the lacquer. |

For every generated image, write the exact prompt into the batch file's `_source.prompt`.

## Order of work

1. **Pilot on Girder** (the Phase 3 pilot session): `TEX.def` and the record in `core/materials`, Girder's
   `47-texture.js` painters moved onto it with an unchanged look, then its families switched to library sets
   as they arrive. Girder needs: `wood.plank`, `wood.beam`, `wood.carved`, `wood.lacquer`, `wood.tarred`,
   `roof.thatch`, `roof.shingle`, `fibre.cane`, `fibre.rope`, `cloth.plain`, `cloth.canvas`, `rock`,
   `steel.rust`, `concrete`, `ground.moss`, plus the Beast Rider pattern sheets.
2. **The processing script** and the first scan-library sets (the S rows), which unblock every build.
3. **The generated sets** (the G rows), in the order the builds adopting them need them.
4. **One build per lineage adopts:** Girder (Voth lineage), then Iziz (Ancients lineage, the M5 city in
   GODOT-PLAN.md), then the nacre culture as its first new build on the library from the start.
5. **The rest adopt** as they are next touched. A build's adapter maps its old names onto library ids; the
   old names stay valid.

## Rules, from now

- A new material is a library id plus a tint and optional pattern, or it is added to the library. A
  build-private texture is the exception and is tagged in that build's `PORT.md`.
- No new canvas painter without a `TEX.def` record or a PNG bake (GODOT-PLAN.md rule 6).
- Every library and pattern image has a `meta.json` with its source and licence. Generated images record
  the prompt.
- Every prompt handed to the owner is complete and paste-ready (`PROMPTS-ready.md`): the template, the material line and
  the tint sentence written out in each block (near-colourless "so it can be tinted", or "full colour: not tinted"), never
  "add the muting sentence". Tintable rows leave out the code's tint hexes, which only invite colour into a grey image.
- `PROMPTS-ready.md` holds only what is still owed: when a delivery is processed, its blocks are deleted there and listed under
  "Delivered and removed" (with the id it landed as). Before handing prompts to the owner, check them against the library and every
  local worktree; never append without pruning.
- Every cut-out (card, wing, sprite) is asked for on solid flat bright magenta (#ff00ff), and the prompt says so in full:
  "no magenta, pink or purple anywhere in the subject; no grey or white background". (2026-10-06: four sheets came on grey and
  had to be keyed by hand.)

## Open decisions

- **Where 2048 px sources live:** outside the repo (decided: no LFS; the owner keeps the originals, `meta.json`
  records each source's sha1).
- ~~**Voth's culture sheets:**~~ *Settled 2026-10-02:* the stone inlay band and the banner cloth, plus near-colourless
  base surfaces (plaster, fungus, chitin, scale plating); prompts above.
- **Girder's new ids:** `metal.scrap`, `wood.reclaimed`, `cloth.tarp`, `metal.scale` are not in the base-library
  table yet; add them when their images are processed.
- ~~**The nacre culture:** its name, palette and build folder once its session is pushed.~~ *Settled 2026-10-02:* it
  is the Hykkousoi, `settlements/ys` (on `main`). Ys did not start on the library: it has eight `fbm` canvas
  painters of its own in `60-hyk-mat.js` (nacre, barnacle, weed, bone, floor, lens, dark) and one shader hook,
  `hkNacreHook` (`settlements/ys/GODOT.md` item 11). The open choice is whether the `shell.*` rows here replace
  those painters, or the painters bake to PNG and the rows wait for a second shell culture.
