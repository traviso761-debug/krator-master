# The material library: plan

Status, 2026-10-02: the library is started. Eleven sets plus six procedural cloth sets are processed (see "Built
so far"); the Poly Haven ingest tool is written and waits for the owner's download; the prompts for every culture's
pattern sheets are below. The record adapters, `TEX.def` and the Girder hookup are not built yet. This is the content side of GODOT-PLAN.md Phase 3
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
core/materials/library/<id>/albedo.jpg  normal.png  roughness.png  meta.json
core/materials/patterns/<culture>/<sheet>/albedo.jpg  normal.png  roughness.png  meta.json
```

`meta.json` holds the record fields, the source (scan library and asset name, or "generated" with the prompt
used), the licence, and the processing run that produced the files.

**Size.** Committed sets are 1024 px: the colour map as JPEG quality 92 (the engine recompresses it anyway),
the normal and roughness maps as lossless PNG (JPEG blocks in a normal map show as faceting). That is about
3.3 MB a set, so the full library (about 45 sets plus patterns) lands near 180 MB. Sources (the generated or
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
| Port (port) | hazard stripes, hull paint and primer, container livery |
| The nacre culture (WIP) | shell inlay, pearl mosaic, nacre-banded trim |

## Shader hooks

- **Iridescence** (`shell.nacre`, `shell.abalone`, later beetle chitin): mother-of-pearl shifts colour with
  the viewing angle, so a colour map alone renders as a flat pastel. The biome kits' foliage hook already
  mixes a second colour by viewing angle (`references/foliage-kit.md` in the skill; `core/biome`); reuse that
  technique in three.js. Godot's `StandardMaterial3D` has no iridescence, so this becomes one `.gdshader` in
  the Phase 3 shader library.
- **World-space UVs** stay as today in the previews; in Godot they are the material's built-in triplanar
  option.
- Glass Fresnel, water and glow are already in the Phase 3 shader list.

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
at the sibling set (`../<id>/normal.png`), so the PNGs are stored once. Make one with
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

Pattern sheets use the same template with "a flat, front-on decorative panel" in place of "perfectly flat
surface", the culture's palette as hex colours, and "the pattern repeats horizontally". Example (Beast Rider
cloth): "Hand-woven heavy cotton cloth with a tribal geometric pattern of stripes, zigzags and diamond bands,
dyed in deep red (#7a2028) with ochre (#c2a24e) and dark green (#2f5a3a) accents, visible weave, slightly
faded and uneven dye."

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

Port and the Hykkousoi (nacre culture):

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

Uncertain, to check when the images come back: Iziz gilt (the build has only a plain gilt material, so its motifs are
invented); the Iziz banner (the build draws one non-tiling banner, made a repeat here); Port hazard and livery
(extrapolated); the Hykkousoi inlay and trim (the build has no such painters).

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

## Next steps

0. **Poly Haven (waiting on the owner):** run the catalog pass, pick, run `--only` for the picks, `adopt.py`, a
   contact sheet, commit. Then fill "Available, not committed".
   **Culture images:** the owner is retrieving the Iziz and Voth images from the earlier session. Process them as
   they arrive (`process.py`, patterns with `--pattern`, base surfaces with `--mute` for the near-colourless
   Iziz and Voth rows), prompt text in "Pattern-sheet prompts by culture". The other cultures' prompts are written
   and wait for images.
1. **Girder hookup** (the Phase 3 pilot session): `TEX.def` and the record adapters in `core/materials`,
   Girder's `47-texture.js` painters moved onto them with an unchanged look, then each FAMMAT family pointed
   at its library set, with normal and roughness maps on the materials and FAMMAT's world-unit `scale` kept.
2. **The rest of Girder's surfaces**, below.
3. **Repetition break-up** for large surfaces (thatch, carved wood): a second variant per set, or a
   texture-bombing hook, which Godot gets as a shader.
4. **Iziz**, then the nacre culture (Ys's Hykkousoi), as the plan's order of work says.
5. ~~Decide Git LFS~~ Decided no; revisit at 250 MB (see "Git LFS").

## Available, not committed

Poly Haven assets in the owner's download that are not in the repo, by slug, to pull in later with
`ingest_polyhaven.py --only` and `adopt.py`. (Filled in after the catalog is uploaded.)

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
