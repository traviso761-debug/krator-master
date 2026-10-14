# Clothing textures: what the characters' clothes need

Every garment `tools/make_garments.py` makes (and every Cosmetic Lab and Animation Lab outfit built from it) is painted
today from flat colours, bands and motifs with a little noise: no weave, nap, sheen or wear. These are the texture
sets that would give it those, one per kind of cloth, shared by every culture that wears it.

**Not wired in yet.** The garment painter does not read the library: these sets are the material for that step, which
comes after they arrive. A missing set leaves its garments as they are now.

How to use this file: the first table lists sets the library already has (`core/materials/library/`) and which clothes
they serve; nothing to make there. The prompts below are the gaps, each a complete prompt ready to paste (the base
template from `core/materials/PLAN.md`, the material line, and for the tintable ones the neutral sentence: the
painter multiplies the grain into the garment's own colours, so those want to be near-colourless). One image per
prompt; name the file after the `id`. They go through the usual processing (`core/materials/PLAN.md`, Processing
pipeline) into `core/materials/library/<id>/`.

**Delivered 2026-10-14: all 17 are in the library now** (`core/materials/library/<id>/`, processed by
`tools/textures/batches/chatgpt-2026-10f-clothes.json`; the prompts below are kept as the record of what was asked).

## Already in the library: use these

| Set | For |
|---|---|
| `cloth.plain` | linen: Voth and Izani peasants, Republic shirts and blouses, Hykkousoi sea-linen (the chiton, exomis) |
| `cloth.silk` | Beast Rider deel, court silks, Yuni gowns, Izani court gowns |
| `cloth.weave.twill` | tartan and checked cloth (Free Giant braccae), work trousers and breeches (procedural) |
| `cloth.weave.plain` | any plain-weave cloth without a better set (procedural) |
| `cloth.felt` | felt boots (valenki), felt caps, nomad felt (procedural) |
| `cloth.knit` | knitted socks and caps (procedural) |
| `cloth.weave.burlap` | maguey (ixtle) cloth: the Voth peasants' field cloak (tilma), loincloth and sandals |
| `cloth.canvas` | aprons, work wraps |
| `hide.leather008`, `009`, `033c` | belts, aprons, jerkins, sandals, work boots |
| `hide.fur.brown` | long fur: the Beast Rider horned fur cap, fur cloaks |
| `fibre.rope` | the Hykkousoi rope belts, the Free Giants' boot wraps |
| `shell.nacre` | the Hykkousoi nacre cuirass |
| `metal.gold`, `metal.bronze` | crowns, gilded sandals, the Dalab pectoral; the Free Giants' helmet (the finer temple-gold and La Tene rows are in `core/materials/PLAN.md`, "Characters: cybernetic arms and the giants' metal") |
| `patterns/<culture>` | the culture pattern sheets (Voth banners and inlay, the Republic's folk sheets, and the rest) for borders and panels |

## Made from these 17 prompts (delivered 2026-10-14)

| id | For | Tinted |
|---|---|---|
| `cloth.wool` | Republic greatcoats, coats and dresses; Free Giant tunics; cloaks everywhere | yes |
| `cloth.velvet` | Republic gowns and the Borten, Izani and Voth court robes, Yuni silk babouches | yes |
| `cloth.quilted` | Republic padded guild jackets, gambesons | yes |
| `cloth.cotton.coarse` | Dalab and Yuni commoners, Voth cotton (huipil, xicolli, wrap skirts), Izani peasants | yes |
| `cloth.bazin` | Yuni grand boubou and mosaic gown | yes |
| `cloth.oiled` | Izani rain hood, travelling cloaks | yes |
| `leather.polished` | Republic riding and tall boots, belts and the cross-belt, officers' gear | yes |
| `leather.buckskin` | Beast Rider fringed shirt, leggings and knee moccasins | yes |
| `fur.short` | fur trims, the ushanka, Beast Rider caps | yes |
| `fur.astrakhan` | the papakha (Republic officers), astrakhan collars | yes |
| `straw.plaited` | Yuni cone hat, Hykkousoi petasos | yes |
| `feather.quetzal` | the Quetzal headdress, Voth court capes and mantles | no: the colour is the point |
| `beads.glass` | Dalab bead cap, collars and armbands | yes |
| `metal.brass.braid` | officers' frogging and epaulettes (Republic) | no: the colour is the point |
| `embroidery.cross` | Republic collars, cuffs and hems (festive set) | no: the colour is the point |
| `embroidery.saxon` | Republic aprons and skirts, the Borten's band (festive set) | no: the colour is the point |
| `pattern.bogolan` | Yuni mud-cloth boubou and blouse | no: the colour is the point |

### Cloth

**`cloth.wool`**: for Republic greatcoats, coats and dresses; Free Giant tunics; cloaks everywhere.
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Fulled wool broadcloth seen close: a soft felted surface where the weave barely shows, fine fuzz, a little pilling. Fine scale: the whole frame is about 20 cm of cloth. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. Near-colourless: pale grey only, so it can be tinted.
```

**`cloth.velvet`**: for Republic gowns and the Borten, Izani and Voth court robes, Yuni silk babouches.
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Cotton velvet pile seen close: a soft directional sheen, crushed patches where the pile lies the other way. Fine scale: the whole frame is about 20 cm of cloth. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. Near-colourless: pale grey only, so it can be tinted.
```

**`cloth.quilted`**: for Republic padded guild jackets, gambesons.
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Quilted padded cotton: puffed rows between straight stitched seams about 3 cm apart, small creases in each row. Fine scale: the whole frame is about 20 cm of cloth. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. Near-colourless: pale grey only, so it can be tinted.
```

**`cloth.cotton.coarse`**: for Dalab and Yuni commoners, Voth cotton (huipil, xicolli, wrap skirts), Izani peasants.
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Coarse hand-spun cotton: an irregular open plain weave with uneven, slubby thread and a few thick and thin places. Fine scale: the whole frame is about 20 cm of cloth. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. Near-colourless: pale grey only, so it can be tinted.
```

**`cloth.bazin`**: for Yuni grand boubou and mosaic gown.
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Bazin riche: heavily beaten damask cotton with a woven tone-on-tone pattern of small lozenges and scrolls, a stiff polished surface with a glazed sheen that catches the light in the pattern. Fine scale: the whole frame is about 20 cm of cloth. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. Near-colourless: pale grey only, so it can be tinted.
```

**`cloth.oiled`**: for Izani rain hood, travelling cloaks.
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Oiled waxed cotton cloth: a dense plain weave sealed with wax, darker waxy patches, fine crinkles and pale scuffed lines where it has been folded. Fine scale: the whole frame is about 20 cm of cloth. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. Near-colourless: pale grey only, so it can be tinted.
```


### Leather and fur

**`leather.polished`**: for Republic riding and tall boots, belts and the cross-belt, officers' gear.
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Polished boot leather seen close: a smooth fine grain under a waxed shine, soft creases where it flexes, a few fine scuffs through the polish. Fine scale: the whole frame is about 20 cm of cloth. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. Near-colourless: pale grey only, so it can be tinted.
```

**`leather.buckskin`**: for Beast Rider fringed shirt, leggings and knee moccasins.
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Smoked brain-tanned buckskin: soft suede nap with no shine, uneven smoke tone, faint stretch marks and a few small holes and scars in the hide. Fine scale: the whole frame is about 20 cm of cloth. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. Near-colourless: pale grey only, so it can be tinted.
```

**`fur.short`**: for fur trims, the ushanka, Beast Rider caps.
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Short dense fur seen from above: the hairs lying one way in soft overlapping tufts, a lighter underfur showing in places. Fine scale: the whole frame is about 20 cm of cloth. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. Near-colourless: pale grey only, so it can be tinted.
```

**`fur.astrakhan`**: for the papakha (Republic officers), astrakhan collars.
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Astrakhan (karakul lambskin): tight glossy curls of fleece packed close in small whorls and ridges, dark shadows between the curls. Fine scale: the whole frame is about 20 cm of cloth. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. Near-colourless: pale grey only, so it can be tinted.
```


### Fibre, straw, feathers, beads

**`straw.plaited`**: for Yuni cone hat, Hykkousoi petasos.
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Plaited straw hat braid seen flat: narrow braids of flattened wheat straw in a herringbone plait, sewn edge to edge in parallel rows, a few split straws. Fine scale: the whole frame is about 20 cm of cloth. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. Near-colourless: pale grey only, so it can be tinted.
```

**`feather.quetzal`**: for the Quetzal headdress, Voth court capes and mantles.
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Layered quetzal plumage seen flat: long overlapping tail and covert feathers lying in one direction, iridescent emerald green (#1f8a5a) shading to blue-green (#1d6f7a) with golden-green highlights, fine barbs visible on each feather.
```

**`beads.glass`**: for Dalab bead cap, collars and armbands.
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Rows of tiny glass seed beads stitched close on cloth, seen flat: round beads about 2 mm, each with a small highlight and a dark hole, slight irregular spacing, in pale grey glass. Fine scale: the whole frame is about 20 cm of cloth. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. Near-colourless: pale grey only, so it can be tinted.
```


### Trims and pattern bands (not tinted)

**`metal.brass.braid`**: for officers' frogging and epaulettes (Republic).
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Gold-brass braid trim seen flat: tight twisted metallic cord in parallel rows, worn brighter on the ridges. Metal. Repeats horizontally.
```

**`embroidery.cross`**: for Republic collars, cuffs and hems (festive set).
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Slavic red cross-stitch embroidery on linen, seen flat: stepped diamonds and crosses built from tiny X stitches, red (#84121a) on cream (#ebe0c7). Repeats horizontally.
```

**`embroidery.saxon`**: for Republic aprons and skirts, the Borten's band (festive set).
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Transylvanian Saxon embroidery: six-petal rosettes and leaves in satin stitch, ochre (#c78c2e) and red (#84121a) on black (#121012). Repeats horizontally.
```

**`pattern.bogolan`**: for Yuni mud-cloth boubou and blouse.
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Malian bogolan mud cloth: hand-painted geometric motifs (rows of dots, crosses, zigzags and ladders in a grid of bands) in cream (#e8dcc2) on dark brown-black (#2b2118), on coarse hand-spun cotton with the weave showing through, the paint edges slightly uneven.
```
