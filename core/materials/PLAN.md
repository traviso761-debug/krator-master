# The material library: plan

Status: plan, 2026-10-02. Nothing here is built yet. It is the content side of GODOT-PLAN.md Phase 3
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
core/materials/library/<id>/albedo.png  normal.png  roughness.png  [height.png]  meta.json
core/materials/patterns/<culture>/<sheet>.png  meta.json
```

`meta.json` holds the record fields, the source (scan library and asset name, or "generated" with the prompt
used), the licence, and the processing run that produced the files.

**Size.** 45 surfaces x 3 maps at 2048 px is roughly 0.5 GB of PNG, too much for git. Commit 1024 px
processed sets (about 1-2 MB per map). Keep 2048 px sources outside the repo, or move to Git LFS if the
repo adopts it. An open decision; see the end.

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
| Iziz (iziz) | vernacular mosaic, tile, banner cloth, gilt work |
| Yuni, Locus (yuni, locus) | mosaic, black-and-white paint panel, colour paint panel, relief |
| Voth (voth) | to be decided with the user: today it is stone, plaster, fungus, metal and cloth, so mostly base library |
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

A script, `tools/textures/process.py` (to write), turns any source image into a library set:

1. Remove baked lighting: divide out a heavily blurred copy to flatten shading gradients.
2. Make it seamless: offset by half and blend the seams, or use a patch-based fill.
3. Derive a height map from luminance and frequency; a normal map from the height; a roughness map from the
   inverted, contrast-adjusted luminance with a per-surface base value.
4. Mute the colour for tintable surfaces (lower saturation, compress value range) so palettes tint cleanly.
5. Check tiling: render a 3x3 repeat and flag visible seams or repeating blotches.
6. Write the 1024 px set and `meta.json` with the source and the settings used.

Scan-library sets skip steps 1-3 and only get resized, muted and checked.

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

- **Where 2048 px sources live:** outside the repo, or Git LFS.
- **Voth's culture sheets:** what its patterns are.
- **The nacre culture:** its name, palette and build folder once its session is pushed; the shell rows here
  are written ahead of it.
