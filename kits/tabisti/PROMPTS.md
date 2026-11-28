# Urban Tabisti Architectural Kit (`kits/tabisti`) — Bespoke Texture Prompts

Ready-to-generate `2048x2048` texture prompts for the **Urban Tabisti Architectural Kit** (`kits/tabisti/materials.json`), replacing the kit's current shared-library stand-ins with dedicated Northern East Abyss (Sfenops, Middle Tabisti, Liikofi) surfaces matched to reference plates `refs/b1-lechner-zsolnay-roof.png` through `refs/b5-el-capricho-wind-tower.png` and Board A (`Shah-i-Zinda`, Bukhara/Khiva *ustun*/*ganch*/*kundal*, and imbricated verdigris-bronze columns).

**Count: 10 prompts** (9 seamless `2048x2048` orthographic PBR surfaces + 1 `2048x2048` `#ff00ff` cut-out ventilation screen).

## How to process & wire when generated

1. Save each generated `2048x2048` PNG named after its `id` (`brick.hazarbaf.buff_rose.png`, etc.).
2. Process surfaces via `python3 tools/textures/process.py` into `core/materials/library/<id>/` (and `brick.claustra.screen.png` via `python3 tools/textures/cards.py` for `#ff00ff` chroma-key alpha).
3. Update the `lib` field of the corresponding family in `kits/tabisti/materials.json` (listed on each heading below), run `python3 tools/textures/pack.py kits/tabisti`, and rebuild with `python3 tools/build.py kits/tabisti`. Zero builder geometry changes are required.

---

## 1. Embossed Brickwork & Banded Masonry

### `brick.hazarbaf.buff_rose`
Replaces `buffbrick` (`lib: "brick.buff"`) on `hazarbaf` walls in `kits/tabisti/materials.json` (`scale: [1.6, 1.6]`, `height: true`; full colour; Board A1 & B5):
```
Seamless tileable texture, square, 2048x2048. Orthographic view of a flat, front-on brick wall surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no directional sun shadows, no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Central Asian hazarbaf embossed basketweave brickwork built of narrow fired marl buff bricks (#d5ba92 to #c7a97e) and warm terracotta-rose bricks (#b95b45 to #a44935) laid in tight horizontal and vertical groups to form a repeating geometric weave of stepped lozenges and interlocking chevrons, alternate brick groups recessed by 12 mm in pale sandy alkaline lime mortar (#dfd4be), with small square turquoise-glazed ceramic plug inlays (#1e8c86) set at the centers of the diamond motifs, fine sandy clay grain and slight weathered chips on brick arrises. Full colour, matte brick with satin glazed plugs.
```

### `brick.band.capricho`
Replaces `bandbrick` (`lib: "brick.red.band"`) in `kits/tabisti/materials.json` (`scale: [1.5, 1.5]`, `height: true`; full colour; `refs/b5-el-capricho-wind-tower.png`):
```
Seamless tileable texture, square, 2048x2048. Orthographic view of a flat, front-on masonry wall filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Gaudí El Capricho polychrome banded brick and relief-tile masonry in strict horizontal courses continuing cleanly across left and right edges: three courses of warm sun-baked sandy buff brick (#d6bc94) alternating with two courses of rich rose-terracotta brick (#b4523d) and one narrow horizontal frieze course of square moulded ceramic relief tiles glazed in deep alkaline emerald-teal (#1b867e) embossed with raised stylized golden-ochre rosette bosses (#d49b35), thin pale cream lime mortar joints (#dfd5c2), crisp fired clay texture and fine glaze crazing on the tile band. Full colour, do not mute.
```

---

## 2. Alkaline Glazed Tilework, Zsolnay Roofs, *Escata* & *Trencadís*

### `tile.kashi.teal_relief`
Replaces `kashi` (`lib: "tile.muqarnas.turquoise"`) in `kits/tabisti/materials.json` (`scale: [1.15, 1.15]`, `height: true`; full colour; Board A1 Shah-i-Zinda embossed terracotta):
```
Seamless tileable texture, square, 2048x2048. Orthographic view of a flat, front-on ceramic tile panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no specular glare, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Samarkand Shah-i-Zinda deeply carved high-relief glazed terracotta kashi tiles fitted in a seamless repeating grid, moulded with crisp two-level geometric eight-pointed star strapwork and scrolling split-palmette vine arabesques; coated in rich translucent alkaline turquoise-teal soda glaze (#188d88 to #2caaa2) that pools dark peacock-emerald (#0d5558) in the deep carved background recesses and thins to pale celadon-cream (#8fd2c8) along the sharp raised relief ridges, with occasional small cobalt-blue (#1d4284) and warm buff unglazed terracotta (#c89e74) inlays, fine kiln crackle crazing across the glaze and hair-thin lime joints. Full colour.
```

### `roof.tile.zsolnay.teal`
Replaces `zsolnay` (`lib: "roof.tile.celadon"`) in `kits/tabisti/materials.json` (`scale: [1.25, 1.25]`; full colour; `refs/b1-lechner-zsolnay-roof.png`):
```
Seamless tileable texture, square, 2048x2048. Orthographic view of a flat, front-on pitched roof surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no bright sun reflections, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Hungarian Secessionist Zsolnay pyrogranite glazed ceramic beaver-tail roof tiles laid in neat overlapping imbricated horizontal courses (eight courses per tile), predominantly rich alkaline turquoise-teal (#158780) and deep emerald-jade (#1b7a6e) with subtle tile-to-tile kiln variation into seafoam teal (#32a69c), deep peacock blue-green (#0f5c60), and an occasional warm honey-amber (#c9872e) accent tile; thick pooled vitreous glaze along the rounded lower drip edge of each scale, fine ceramic crazing, and subtle weathering in the overlaps. Full colour.
```

### `roof.scale.escata.polychrome`
Replaces `escata` (`lib: "roof.scale.terracotta"`) in `kits/tabisti/materials.json` (`scale: [1.2, 1.2]`; full colour; `refs/b3-catalan-escata-spires.png`):
```
Seamless tileable texture, square, 2048x2048. Orthographic view of a flat, front-on ceramic roof surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Catalan Modernisme imbricated fish-scale (escata) glazed ceramic cupola tiles with rounded lower noses laid in tight overlapping courses arranged in repeating horizontal chevron bands of warm golden-amber (#d48a2c), burnt terracotta-rose (#b84e38), pale cream-ivory (#eadcc4), and alkaline turquoise-teal (#1d8b84); vitreous lead glaze pooling slightly darker near each rounded tile lip with tiny kiln pinholes and fine crazing, thin pale mortar shadow at the overlaps. Full colour.
```

### `mosaic.trencadis.tabisti`
Replaces `trencadis` (`lib: "mosaic.trencadis"`) in `kits/tabisti/materials.json` (`scale: [1.1, 1.1]`; full colour; `refs/b4-palau-guell-trencadis-lanterns.png`):
```
Seamless tileable texture, square, 2048x2048. Orthographic view of a flat, front-on mosaic surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no glare, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Gaudí trencadís broken-tile mosaic made of irregular hand-nipped polygonal shards of glazed ceramic plates and tiles (2 to 6 cm across) bedded flush in pale warm lime-pozzolana mortar (#e4ddd0): a luminous field of milk-white (#f2ece2) and pale blush-cream (#e2bfb0) shards woven with sinuous geometric medallions and wave bands of vivid alkaline turquoise (#1b8c86), deep cobalt blue (#1d3f84), and warm saffron-ochre (#d49b30) ceramic fragments, each shard showing fine ceramic crackle and crisp nipped edges separated by 3 to 5 mm mortar joints. Full colour.
```

---

## 3. Sheltered Carved *Ganch*, Liikofi `Abyss-Lac` *Kundal* & Verdigris Bronze

### `plaster.ganch.carved`
Replaces `ganch` (`lib: "stone.stucco.yeseria"`) in `kits/tabisti/materials.json` (`scale: [1.15, 1.15]`; near-colourless tintable; Board A3–A4 sheltered *ayvan* gypsum panels):
```
Seamless tileable texture, square, 2048x2048. Orthographic view of a flat, front-on carved plaster wall panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no directional shadows, no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Bukhara and Khiva carved ganch (gypsum stucco) architectural wall relief: a crisp two-plane geometric girih lattice of interlocking ten-pointed stars, polygons and fine double-fillet strapwork enclosing delicate carved palmette scrolls and stippled honeycomb backgrounds cut 10 mm deep with sharp gouge and knife tool marks, matte chalky gypsum texture. Keep colours very muted, chalky ivory-white to pale warm grey (#eee9df on raised bands, #c6bfb2 in recessed grounds), near-colourless and even so a palette tint can colour it cleanly.
```

### `wood.kundal.abysslac`
Replaces `kundal` (`lib: "wood.painted"`) in `kits/tabisti/materials.json` (`scale: [1.2, 1.2]`; full colour; Board A3–A4 + Liikofi `abyss-lac` coffered ceiling plenums):
```
Seamless tileable texture, square, 2048x2048. Orthographic view of a flat, front-on decorative wooden ceiling panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no specular hot-spots, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Central Asian kundal polychrome painted and lacquered cedar ceiling coffers finished in rich Liikofi abyss-lac resin: a repeating geometric grid of shallow recessed octagonal and star coffers framed by moulded timber ribs, the recessed panels coated in deep lustrous vermilion-crimson lacquer (#8e2226 to #ad312d) alternating with deep alkaline Prussian-teal panels (#155d62), richly ornamented with fine raised gesso-and-gold-leaf (#d4a642) scrolling lotus vines, central gilded rosettes and thin ivory (#ece2cc) outline fillets, subtle aged lacquer craquelure and wood grain beneath. Full colour.
```

### `metal.bronze.leafscale`
Replaces `leafscale` (`lib: "metal.scale"`) in `kits/tabisti/materials.json` (`scale: [0.75, 0.75]`, `metal: 0.62`; full colour; Board A5 imbricated verdigris-bronze columns):
```
Seamless tileable texture, square, 2048x2048. Orthographic view of a flat, front-on embossed metal surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no bright reflections, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: cast architectural bronze cladding of overlapping imbricated laurel and oak-leaf scales pointing downward in regular staggered rows, each scale embossed with a crisp central midrib, herringbone veins and a tiny beaded acorn boss at the cusp; heavily patinated in chalky turquoise-malachite verdigris (#3b8c78 to #58a894) in the recessed pockets and overlaps, while the raised leaf midribs, rims and acorn bosses are rubbed back to warm dark antique bronze (#58442e) and subtle burnished gilt-brass (#b89240). Full colour.
```

---

## 4. Pierced *Claustra* Ventilation Screen (`#ff00ff` Cut-Out)

### `brick.claustra.screen`
Optional alpha-cutout sheet for perforated courtyard/gallery breeze screens in `kits/tabisti` (`scale: [1.2, 1.2]`; cut-out on `#ff00ff` magenta; `refs/b2-raichle-palace-loggia.png` & `b5`):
```
Flat cut-out pattern sheet, square, 2048x2048, on a solid flat bright magenta background (#ff00ff) filling every pierced opening cleanly with crisp hard edges and zero anti-aliased pink halo; no magenta, pink or purple anywhere on the brick or tile. Flat, even, shadowless lighting. The left edge must continue into the right edge and the top into the bottom. Material: a pierced architectural claustra breeze-screen wall built of canted warm sandy-buff bricks (#d4b88e) and terracotta-ochre bricks (#bf684c) mortared at 45-degree angles in an interlocking diamond-and-cross honeycomb lattice, with small square alkaline-teal glazed ceramic boss tiles (#1c8a84) set at every lattice intersection and pale lime mortar (#dfd5c2) at the joints, framing clean open geometric ventilation apertures (#ff00ff). No perspective, no text, no border, no watermark.
```
