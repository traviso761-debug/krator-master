# Texture prompts: delivered (archive)

Everything that was on `PROMPTS-NEEDED.md` and has since arrived, with its prompt and delivery notes, kept so no set is generated twice. Verified 2026-10-19 against `origin/main`. Check here before writing a new prompt; the open list is `PROMPTS-NEEDED.md`.

Delivered under other names: `tile.hex.glazed` is `tile.hex.ceramic`, `mosaic.honeycomb` is `mosaic.orange.honeycomb`, `plaster.painted.worn` is `render.orange.worn`, `patterns/talia/rose-window` is `patterns/talia/rose-star`, `patterns/talia/jali` came as `jali-arabesque` and `jali-geometric`. Korona's nineteen (wired in `biomes/korona/materials.json`, with `patterns/korona/hum-carving`) are in "Delivered 2026-10-19, Korona". Redos delivered 2026-10-15 are in the library but several are not wired (the entries below say which build to re-pack before the Godot export).


#### `ground.travertine.white`
- Installed: the geyser `ground.tufa`. Why again: turquoise water was painted in the pools (the shader lays the water).
- **Redo delivered 2026-10-15** (`Downloads/vothtex.zip`, "Dry Travertine Terrace Texture.png"; batch `redos-2026-10-15.json`): in `library/ground.travertine.white`, replacing the first take. **Not wired:** `biomes/geyser/tex/` still holds the first take. Re-pack it (`python3 tools/textures/pack.py biomes/geyser`), rebuild and verify **before the Godot export**.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Travertine terraces seen from directly above, like Pamukkale: bright white calcite (#f2f0ea) laid down by flowing spring water in scalloped rimstone dams, each dam a smooth rounded lip a hand wide curving in lobes, its outer face draped with fine vertical drip ridges and small stalactite fringes; between the dams shallow pools of pale milky turquoise water (#9ad8d8) over a smooth white floor; faint cream (#e8dcc0) and pale orange-brown (#c8905a) stains where the water slows. Full colour. Correction: the pools are empty and dry: bare white and cream crust in the hollows, no water, no turquoise, no reflections.
```

#### `hide.sleek`
- Installed: fauna `sleek`. Why again: came mid-brown (installed muted 0.8); the vertex colour gives the hue.
- **Redo delivered 2026-10-15** ("Seamless Grayscale Fur Texture.png"): in `library/hide.sleek`, neutral grey, processed with no muting (the first take needed 0.8). **Not wired:** re-pack `kits/fauna` (and drop its `sleek` mute if it carries one), rebuild and verify **before the Godot export**.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Short sleek animal coat seen close up, as on a horse or a deer: very short dense glossy hairs all lying in one direction, faint swirls where the hair changes direction, a soft sheen along the hair, no spots, stripes or markings. Light neutral warm grey-tan so it can be tinted. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. Correction: neutral mid-grey (#8a8a8a), fully desaturated: no brown, tan or warm cast; only the light and dark of the hide.
```

#### `patterns/islander/storyboard`
- Installed: Islanders `patStory`. Why again: one frigate bird is cut by the left/right seam.
- **Redo delivered 2026-10-15** ("Polynesian Canoe and Sea Life Mural.png"): in `patterns/islander/storyboard`; the figures sit clear of the seams. **Not wired:** re-pack `kits/islanders`, rebuild and verify **before the Godot export**.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Flat, front-on decorative panel of a Palauan bai storyboard, a carved and painted gable relief in two registers between black and white toothed bands: in the upper register a red canoe with five black paddlers under a white full moon, in the lower one red and white fish and black frigate birds in flight, outlined black (#1e1a18) on an ochre (#c8922e) ground, the relief shallow and hand-cut. The pattern repeats horizontally. Full colour. Correction: every figure whole inside the frame, none touching or crossing an edge; a strip of plain ground runs along the left and right edges so the seam falls on empty ground.
```

#### `patterns/common/grime-streaks`
- Installed: the breakup hook's `grime` parameter. Why again: came as 20 x 8 cells, dark on white (asked: 16 x 8 on transparent).
- **Redo delivered 2026-10-15** ("Grayscale Drip Texture Grid.png", on magenta): keyed to white and processed into `patterns/common/grime-streaks` (the installed form: dark on white). **It is 20 columns by 8 rows again**, not the 16 by 8 asked: whatever reads it must take 20 x 8. No build on this branch packs it yet; wire it (the break-up hook's `grime`) **before the Godot export**.

```
A sheet of 128 separate grime streak masks in a grid of 16 columns by 8 rows, square, 2048x2048, each cell twice as tall as it is wide, on a solid flat pure white background. Front-on, flat, even, shadowless lighting; no text, no border, no grid lines. Each cell holds one vertical stain as on a wall below a window sill or a cornice: it starts at the top edge of its cell as a soft band and runs down, fading out before the bottom edge, nothing crossing into the next cell. Vary them: soot, damp, rust run-off, narrow drips, wide washes, single, forked and several parallel runs, some short, some long. Greyscale only, from pale grey to near-black where the stain is strongest, no colour at all. Correction: exactly 16 columns by 8 rows of separate streaks, each in its own cell with a margin, on a solid magenta (#ff00ff) ground, no white.
```

#### `patterns/islander/gable-east-b`
- Installed: Islanders `patGableE2` (the great uma). Why again: drifts: no exact period, a soft seam.
- **Redo delivered 2026-10-15** ("Seamless Geometric Bamboo Weave.png"): in `patterns/islander/gable-east-b`, an exact period both ways. **Not wired:** re-pack `kits/islanders` (`patGableE2`), rebuild and verify **before the Godot export**.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Flat, front-on decorative panel of a woven split-bamboo house facade as on an Ede or Sumba house: a cream (#e6d8b8) woven field in horizontal bands, alternating rows of large nested diamonds in black (#1e1a18) and ochre (#c8922e) with a small dark red (#6e1a12) heart, and rows of triple zigzag lines, thin black bands between the rows, visible weave in every strip. The pattern repeats horizontally. Full colour. Correction: exactly three diamonds across and two rows down, the repeat lining up exactly at the edges, no drift in spacing or size across the image.
```
## 1. Visibly worse without (open in a KNOWN_ISSUES)

### The geyser basin (`biomes/geyser`)

*All delivered 2026-10-14 (see "Delivered 2026-10-14" below).*

`biomes/geyser/KNOWN_ISSUES.md`: "Six surfaces are procedural until the owner's textures arrive." The two surfaces' stand-ins
are rows in `biomes/geyser/materials.json` (swap their `lib`); the four cards are the kit's own slots. `PLAN.md`, "The
geyser basin", has each set's reuse.

### The Fauna kit (`kits/fauna`)

*All delivered 2026-10-14 (see "Delivered 2026-10-14" below).*

### The Islanders kit (`kits/islanders`)

*All delivered 2026-10-14 (see "Delivered 2026-10-14" below).*

`kits/islanders/KNOWN_ISSUES.md`: "The painted motifs are canvas stand-ins" (`28-is-paint.js`), and "no hinggi sheet yet".
Full colour. Palette `ISP_C`: red earth #9a2a1e, dark red #6e1a12, black #1e1a18, white #efe6d2, ochre #c8922e, sea teal
#2a7a7a, sand #c49a5a, bark #8a5a32, cream #e6d8b8. Each sheet lands at `patterns/islander/<name>`; add its family key
(below) to `kits/islanders/materials.json` and repack: the canvas is then never drawn (`KIT_HAS`), no code change.

### The Scyvoi kit (`kits/scyvoi`)

*All delivered 2026-10-14 (see "Delivered 2026-10-14" below).*

### Iziz (`settlements/iziz`)

*All delivered 2026-10-14 (see "Delivered 2026-10-14" below).*

`settlements/iziz/KNOWN_ISSUES.md`, "Two surfaces have no good library texture" (the second material pilot, 2026-10-13).
Both near-colourless, tinted.

### The Resources kit (`kits/resources`)

`kits/resources/KNOWN_ISSUES.md`: "The veins, crusts, seams, pools and grains are vertex colours on simple shapes: the
library has no ore or mineral sets". The nodes are boxes and ellipsoids, so a set is laid on the face that shows the
mineral (a seam band, a crust patch, a pool rim): each lands as a family in `kits/resources/materials.json`, and
`44r-res-nodes.js` draws that face with its key in place of `plain` (a small code change per kind, after delivery). Full
colour: the colour is the point. Sulfur needs no image: `ground.sulphur` is in the library (wired 2026-10-15).

### The Ring Sea isles biome (`biomes/ringisles`)

`biomes/ringisles/KNOWN_ISSUES.md`, "Stand-ins": the lagoon floor, the reef, the coral and seven leaf cards are procedural or near library sets. Each lands as a family in `biomes/ringisles/materials.json` (a card through `BIO.libSwap`). The banana, rice, cane and greens leaves have no prompt yet (see "Gaps with no prompt yet").

## 2. Still owed (no open known issue; the build draws its own today)

### Highlands (`settlements/highlands`)

*All delivered 2026-10-14 (see "Delivered 2026-10-14" below).*

The two other harlequin colourways in the source (`73b-hl-frame.js:239-240`, `hlHarl(ground, diamond, seam)`); only the
green one (`patterns/highlands/harlequin`, `hHarlG`) was delivered. Glazed roof tile on the tents (`hTentHR`, `hTentHG`)
and the bulb domes (`hBulbHG`), drawn by the canvas painter today. Full colour, repeats both ways.

### Ys (`settlements/ys`)

*All delivered 2026-10-14 (see "Delivered 2026-10-14" below).*

From `settlements/ys/MATERIAL-PROMPTS.md`, "The ocean's rust" (Travis, 2026-10-05: "the ancient buildings here are quite
rusty"); every other set in that file was delivered. Not tinted. Since 2026-10-06 Ys' ruined concrete takes
`concrete.ancient` (`KMAT.bindMat`), so the drowned Ancients are textured, just not rusty; `MAT.rust` stays procedural.

### The Fauna kit (`kits/fauna`)

*All delivered 2026-10-14 (see "Delivered 2026-10-14" below).*

From `PLAN.md`, "The Fauna kit": "Still needed for fauna". Triplanar detail maps under each animal's vertex colours, so
both are near-colourless.

### The Pylon kit (`kits/pylon`)

The kit draws in the Iziz Vernacular's sets and the library's (`kits/pylon/materials.json`); these three it has no set for
(`kits/pylon/PLAN.md` section 8). Each lands in the library or `patterns/pylon/`; add its family to
`kits/pylon/materials.json` and repack.

#### `tile.hex.glazed`
- Kind: tileable material, near-colourless (tinted amber by the kit); 1 m tile. The honeycomb-tiled walls and street of
  the owner's `refs/1b13731cac223929fb36a94b49c88603.jpg`: rich interiors, the scrap exchange's floors, hex paving.
- Reuse: any glazed hexagonal tile floor or wall (a bath house, a Yuni kitchen, a Hykkousoi hall), tinted to taste.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Glazed ceramic hexagonal tiles about 10 cm across, set flat-side to flat-side in a honeycomb, about twenty tiles across the image: each tile slightly domed with a soft glaze sheen, faint variation of glaze thickness from tile to tile, a few hairline crazing cracks, one or two chipped corners, narrow dark grout lines between them. Pale grey glaze, dark grey grout. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained.
```

#### `patterns/pylon/hex-grille`
- Kind: cut-out sheet on magenta, near-colourless; 1 m across. The Ancients' grille in the portholes and lattice
  screens (`refs/ancient office.jpg`, `ancient 2.jpg`, `honeycomb arch.jpg`), drawn now as two crossed iron bars.
- Reuse: any metal hex lattice: vents, gates, window grilles, a dome's skin, catwalk floors.

```
A flat, front-on decorative panel, square, 2048x2048, on a solid flat magenta background (#ff00ff). Orthographic, flat even shadowless lighting, no cast shadows, no perspective, no text, no border. The pattern must repeat: the left edge continues into the right edge and the top into the bottom. The panel: a metal honeycomb grille, a lattice of flat bars about a finger wide forming regular hexagonal openings about a hand across, eight openings across the image, the bars bevelled at their edges with a little wear on the corners and faint machining lines along them; every opening shows only the solid magenta background through it. Dark neutral grey metal. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta, pink or purple anywhere in the metal.
```

#### `plaster.painted.worn`
- Kind: tileable material, full colour; 2 m tile. The salvage tier's and the folk houses' orange paint, flaking to the grey
  render and concrete beneath (the kit tints white stucco orange today, so wear does not show).
- Reuse: any painted render worn back to its base: Talia's poor orange quarter (`talia (6).jpg`), weathered Iziz shops.
- **Check:** `plaster.white_stucco_02` tinted orange may be enough at a distance; judge both on the folk houses first.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: An old rendered wall painted bright orange (#e07a2a), the paint faded and chalky and flaking away in irregular patches to show smooth grey cement render (#8e8b86) beneath, about a third of the surface bare; the paint edges lifted and cracked, a few hairline cracks in the render, faint vertical streaks of grime below the patches. Full colour (do not mute).
```

### Longsong (`settlements/longsong`, 2026-10-19)

All fourteen delivered on 2026-10-19 ("Delivered 2026-10-19, Longsong's exterior" and "Delivered 2026-10-19, Longsong's depths
and interiors"). The register's plaques, boards and the dial stay painted in code: a generated image does not keep the Order's
English legible.


## Delivered 2026-10-20, the Eternian kit's furniture and common walls (pasted into the chat as WebP, 1254 px; batch `eternian-2026-10b-furniture.json`)

The six prompts of `PROMPTS-NEEDED.md` section 8 (written at the kit's P3), ten images: the cast block came in five
takes. Processed by `tools/textures/process.py`, wired in `kits/eternian/materials.json` and packed:

| Set | Family | Where |
|---|---|---|
| `concrete.block.relief`, `.b`, `.c`, `.d`, `.e` | `block`, `blockB`-`blockE` | the cast pattern block, one take per placed instance (`src/38-et-alt.js` `ET_ALTS.block`): the block hut, the canal row's ground floor, the court house's screens, the corner turret's ground floor; 1.6 m to the tile (four 40 cm blocks). Take `.e` is a hexagonal interlace, for the civic buildings with hexagonal symmetry (the owner, 2026-10-20) |
| `roof.tile.celadon` | `celadon` | the rich roofs (`etHip` maps each slope along its eave and up its fall; the drawn tile rolls came off), roughness lifted .45; 2.4 m to the tile |
| `ceramic.celadon.crackle` | `glaze`, `f_ceramic` | the villa's planters (full colour); the furniture's ceramic (tinted: the stove's celadon, the masks' terracotta) |
| `reed.mat.woven` | `f_thatch` (new) | the furniture's `thatch` surfaces: the poor's reed mats |
| `cloth.damask.maze` | `f_cloth` | the furniture's cloth on the Eternian page (coverlets, cushions, linen), tinted |
| `wood.timber.stringing` | `f_lacquer` | the court's lacquered pieces (the canopy bed), tinted |

The prompts as written:

### The Eternian kit (`kits/eternian`, P3, 2026-10-20)

The furniture and the common town's walls (the owner: "don't be afraid to ask for textures to punch up the furniture").
The kit's pieces draw on generic tinted detail maps today (`f_cloth` twill, `f_wood`, `f_lacquer`, `f_ceramic` plain
glaze), and its cast block is plain cut stone, so up close the Eternian pieces read as painted boxes. Each lands as a
family in `kits/eternian/materials.json` (no catalog core change), then `python3 tools/textures/pack.py kits/eternian`
and a rebuild. `kits/eternian/KNOWN_ISSUES.md`, "Surfaces waiting on textures", names what each replaces.

##### `concrete.block.relief`
- Kind: surface, tintable. Replaces `block`'s `stone.cut`: the block hut, the canal row's ground floor, the court
  house's screens and walls, the corner turret's ground floor, the cast-block bench. Reuse: any textile-block wall
  (Highlands' Deco, Pylon's render). The biggest win for the poor and common tiers.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: a wall of cast concrete blocks in the manner of Frank Lloyd Wright's textile blocks: a grid of exactly 4 x 4 square blocks with thin recessed mortar joints, every block cast with the same stepped geometric relief, concentric stepped squares crossed by short raised bars, sharp-edged and deep enough to read; purely geometric, no glyphs, no faces, no lettering. Fine sandy aggregate in the faces, a few small casting pores, the odd chipped arris. Near-colourless: pale grey-beige only. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. One tile covers 1.6 metres (four 40 cm blocks).
```

##### `roof.tile.celadon`
- Kind: surface, full colour. Replaces `celadon`'s `ceramic.glaze` on the roofs (the merchant's house, the villa's hall,
  the ministries in P4); `etHip`'s drawn tile rolls (`o.ribs`) come off when it lands. Reuse: any glazed green roof.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: a roof of glazed celadon barrel tiles seen from directly above, eight parallel rows of half-round tiles running top to bottom, laid in courses with each tile lapping the one below; the glaze a pale jade green #8fb8a0, pooling darker #6a9a82 in the channels between the rolls and thinning to #b4d0bc on their crowns, a fine crackle in the glaze, a few tiles a shade greener or greyer than their neighbours. Glossy glaze. One tile covers 2.4 metres.
```

##### `ceramic.celadon.crackle`
- Kind: surface, full colour. Replaces `f_ceramic` (the celadon-tiled stove, the poor's clay pots keep terracotta) and
  the garden's celadon planters. Reuse: any celadon ware.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: celadon-glazed stoneware, a thick smooth glaze in pale jade green #8fb8a0 drifting softly to #9cc4ac and #7fae96, crossed by a fine irregular crackle network of thin darker lines #5e8a76, a few tiny pinholes, the glaze pooling a little darker in faint ripples. Glossy. One tile covers 0.5 metres.
```

##### `reed.mat.woven`
- Kind: surface, tintable. Lands as a new family `f_thatch` (the furniture's `thatch` surfaces: the poor's reed mat and
  its bolster). Reuse: any woven floor mat or reed screen (the Islanders, Reedlake).

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: a floor mat woven of flat split reed strips about 2 cm wide in a herringbone twill, each strip with fine lengthwise fibres and a slightly glossy skin, a few broken strip ends and a few darker bruised strips. Near-colourless: pale straw only. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. One tile covers 0.8 metres.
```

##### `cloth.damask.maze`
- Kind: surface, tintable. Replaces `f_cloth`'s twill on the Eternian page (coverlets, cushions, the bed's panel, the
  court's linen). Reuse: any brocade or damask; with the costume's circuit-maze brocade (LORE.md 6.19) for the
  character kit.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: heavy silk damask, tone on tone: a satin ground woven with a circuit-maze figure, thin right-angled lines that turn, branch and end in small squares like a printed circuit or a key-fret maze, evenly spaced over the whole cloth, never letters or glyphs; the figure shows only by the change of sheen between satin and twill weave, the fine weave visible throughout. Near-colourless: pale grey-white only. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. One tile covers 0.6 metres.
```

##### `wood.timber.stringing`
- Kind: surface, full colour. Replaces `f_lacquer` (the court's pieces: the canopy bed, and the cabinets P4 adds).
  Reuse: any Deco cabinetwork (Highlands' Republic, Pylon's offices).

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: dark stained hardwood veneer #4a3426 with a close straight grain running top to bottom under a thin satin lacquer, inlaid with thin straight brass stringing lines #b89a58 about 3 mm wide that divide the surface into tall rectangular panels, two across and three down, each panel's corners stepped inward in two small Art Deco steps; straight lines only, no curves, no figures. One tile covers 1 metre.
```


## Delivered 2026-10-19, the Iziz palace (pasted into the chat as WebP, 1254 px, 1774 x 887 and 793 x 1983; batch `izpalace-2026-10-19.json`)

The five the palace page had no set for, processed by `tools/textures/process.py` and packed into the palace's own pack
(`settlements/iziz/palace/materials.json`, `python3 tools/textures/pack.py settlements/iziz/palace`), wired in
`targets/palace/78r-palace-draw.js`:

| Set | Family | Where |
|---|---|---|
| `patterns/iziz/coffer` | `palCoffer` | the decor-4 ceilings (world tiles of 2.4 m; the plain gold ribs went) |
| `patterns/iziz/fresco-legions` | `palFresco` | the frieze of the feast rooms and the Hall of the Standards (decor 3 and 4): one 2:1 sheet per panel, 1.1 m high |
| `patterns/iziz/bronze-door` | `palDoorLeaf` | the leaves of the decor-4 doors and the great door into the Aula (one sheet per leaf; its dark margin cropped) |
| `patterns/iziz/crater-map` | `palMap` | inlaid in the floors of the map rooms (the Map of the Empire, the Map Rooms of the Legions and the Staff); the map tables stand at its ends |
| `metal.deck.hangar` | `palDeck` | the Depot's working floors (the mech bays, the concourse, the Hangar Lift, the shops, the stores), grey, tinted; three plates to the tile, so 6 m |

## Delivered 2026-10-19, Longsong's depths and interiors (the owner's `longsong.zip` and one pasted WebP, 1254 px, 2172 x 724, 1024 x 1536)

Nine images, processed by `tools/textures/process.py` (batch `longsong-2026-10-19b.json`): `patterns/order/glyph-band` (the 3:1
banner cropped by hand to its two rows and to nineteen glyph pitches, so it wraps; kept whole), `patterns/order/thangka-register`,
`patterns/order/mandala-floor`, `patterns/order/mural-cataclysm` (3:1, not the 4:1 asked: a single frieze, kept whole) and
`patterns/order/rug` (a whole rug with its border: a picture, not a tile) as pictures; `patterns/order/valance` and
`patterns/order/column-paint` wrapped across; `patterns/order/book-spines` and `metal.lead.sheet` tiled. **Wired** in
`settlements/longsong/materials.json`: `thangka` (the great thangka on the White Palace's face), `glyphband` (the Procrastinator's
burning bands), `mandala` (its hall's floor), `lead` (the sealed doors), `valance` (the rich windows). **Not wired yet**: the column
paint, the mural, the rug and the book spines wait for the interiors (`settlements/longsong/PLAN.md` P4).

## Delivered 2026-10-19, Longsong's exterior (pasted into the chat as WebP, 1254 px and 1774 x 887)

Five images from the owner, processed by `tools/textures/process.py` (batch `longsong-2026-10-19.json`, every prompt recorded in each
set's `meta.json`): `patterns/order/glyph-relief` (pattern-cropped, four rows of four panels: 4.4 m a tile), `patterns/order/mosaic-band`
(a band, wrapped across only, `keep_aspect`), `plaster.limewash.red`, `patterns/order/prayer-wheel` (a band, wrapped across only),
`patterns/order/mani-stone`. All tiled on arrival or after the crop (seams 0.7 to 1.3). **Wired:** `settlements/longsong/materials.json`
(families `glyph`, `mosaic`, `redwash`, `wheel`, `mani`): the Great Gate's pylons, the Chapterhouse Court's wall and the stele carry the
glyph panels; the mosaic course is on every building of the Order and round every drum; the Red Palace is the red limewash; the prayer
wheels turn in the repousse band; the mani wall is the carved stones.

## Delivered 2026-10-19, Korona (the owner's twenty images in `Downloads`, batches `korona-2026-10-19.json` and `korona-2026-10-19-cards.json`)

All nineteen prompts of the Korona list (section 7, now removed: the tepui station's nine, the pitcher hollow's ten) came back the
same day and are in the library: `rock.quartzite.tepui`, `ground.quartzite.black`, `ground.peat.black`, `ground.bladder.bed`,
`organic.pitcher.giant`, `organic.pitcher.throat` (wraps across only: its gradient is mapped once down the throat),
`organic.tendril.banded`, `patterns/korona/hum-carving` (tintable), and the cards `card.pitcher.lace`, `card.sundew.great`,
`card.coin.tree`, `card.fan.rainbow`, `card.lacefan.tree`, `card.stormpod`, `card.pitcher.cobra` and `card.pitcher.cobra.b`
(two takes of the cobra lily, both kept for the meadow's variety), `card.pitcher.trumpet`, `card.trap.star`, `card.lure.flower`,
`card.bulb.blood`. Two came off their prompts and are noted in their `meta.json`: `ground.quartzite.black` is pale quartzite with
black patches rather than a black crust (the kit darkens it by vertex colour), and `ground.peat.black` is a rusty moss-and-stick
bog floor rather than black peat (a darker wet peat may still be wanted for the pools' margins). **Not wired:** `biomes/korona` has
no build yet; its `materials.json` takes them when station 1 is built. The reference images are in
`OneDrive/Pictures/krator/korona/`.

## Delivered 2026-10-18 (`Downloads/tex2.zip`, batches `owner-tex2-2026-10-18*.json`)

- **Surfaces:** `rock.coal`, `ground.tar.seep`, `ground.efflorescence`, `rock.malachite`, `rock.quartz.vein`, `rock.cassiterite`, `rock.galena`, `rock.gossan`, `rock.pegmatite` (Resources kit nodes), `glass.bottle.wall` (Post-Apoc), `ground.lagoon.seagrass`, `ground.reef.flat`, `organic.coral.brain` (Ring Sea isles).
- **Cards (nine cells):** `card.seagrass`, `card.creeper.beach`, `card.naupaka`, `card.seagrape`, `card.breadfruit`, `card.tamarisk`, `card.croptree.glossy`.
- **Came unasked, not installed:** an amber mosaic, a Greek-key band, two magenta lattices (arabesque, geometric), an industrial honeycomb grid, a stained-glass rose, a hexagonal ceramic tile, a peeling terracotta wall, a second naupaka-style sheet.

## Delivered 2026-10-14

The owner delivered thirty-five images in seven batches (WebP, 1254 px; the caihua 1774 x 887). Each was processed as `core/materials/PLAN.md` says (batches `tools/textures/batches/owner-2026-10-14.json` and `-cards.json`) and wired; `PLAN.md`, "Delivered 2026-10-14", has the checks and the details. The entries are kept here with their prompts.

#### `ground.travertine.white`
- **Delivered 2026-10-14:** 6.webp. `library/ground.travertine.white`, full colour. Wired: biomes/geyser `ground.tufa` (the Stair), kept at 0.2 of its colour so its painted pools read as pale crust under the shader's own water.
- Kind: tileable material, full colour. Seen from above.
- Used by: the Stair's terraces. Stands in today: `stone.travertine.tufa`, greyed and whitened (Pamukkale's rims are
  whiter and smoother). Reuse: any travertine spring.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Travertine terraces seen from directly above, like Pamukkale: bright white calcite (#f2f0ea) laid down by flowing spring water in scalloped rimstone dams, each dam a smooth rounded lip a hand wide curving in lobes, its outer face draped with fine vertical drip ridges and small stalactite fringes; between the dams shallow pools of pale milky turquoise water (#9ad8d8) over a smooth white floor; faint cream (#e8dcc0) and pale orange-brown (#c8905a) stains where the water slows. Full colour.
```

#### `stone.geyserite`
- **Delivered 2026-10-14:** 8.webp. `library/stone.geyserite`, tinted. Wired: biomes/geyser `sinter` (the cones and beads), in place of ground.clay.popcorn.
- Kind: tileable material, near-colourless (tinted).
- Used by: the geysers' cones and beads. Stands in today: `ground.clay.popcorn` (a badland clay whose nodules read as
  geyserite). Reuse: spring rims, a silica-crusted snag; the Throne's geyser isle.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Geyserite (siliceous sinter) on a geyser's cone seen close up: grey-white silica built up in knobbly beaded crusts like cauliflower and popcorn, rounded beads from a few millimetres to a few centimetres clustered in ridges, a faint pearly sheen on the beads, small dark pits between them, faint buff and salmon stains in streaks. Near-colourless: keep the stains faint so the image reads as grey-white. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained.
```

#### `card.streamer`
- **Delivered 2026-10-14:** 7.webp. `library/card.streamer` (nine cells, keyed by unmixing). Wired: biomes/geyser `streamer` (the straight combed clump, flipped onto the ribbon), full colour.
- Kind: cut-out card sheet, 3 x 3 on magenta, full colour; base at the bottom of each cell.
- Used by: the flame streamers in the run-off. Stands in today: procedural strands. Reuse: any thermophile streamer,
  waterweed in a current.

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: a clump of long silky streamers of thermophile filaments, the kind that grow in warm runoff from hot springs, combed out straight and parallel by flowing water, rooted together at the bottom of the cell and streaming up to the top, wet and glossy, bright orange (#e0782a) shading to golden (#f0a040) at the tips, a few strands olive-green (#7a8a34); vary the width and the length of the nine clumps. Full colour: not tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta, pink or purple anywhere in the subject; no grey or white background.
```

#### `card.clubmoss`
- **Delivered 2026-10-14:** 9.webp. `library/card.clubmoss` (nine cells, keyed by unmixing). Wired: biomes/geyser `club`, full colour.
- Kind: cut-out card sheet, 3 x 3 on magenta, full colour; base at the bottom.
- Used by: the nodding clubmoss on the warm crust. Stands in today: procedural sprigs. Reuse: any clubmoss or horsetail
  understorey.

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: a small clump of nodding clubmoss (Lycopodiella cernua): three to six upright stems like miniature pine trees, each densely clothed in tiny needle-like leaves, yellow-green (#7aa038) with paler new growth, a small pale yellow cone nodding at each branch tip, rooted at the bottom of the cell; vary the heights and the counts between the nine. Full colour: not tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta, pink or purple anywhere in the subject; no grey or white background.
```

#### `card.steamcomb`
- **Delivered 2026-10-14:** 4.webp. `library/card.steamcomb` (nine cells). Wired: biomes/geyser `comb` (one fan, its hub at the cell's foot), grey under the comb palette.
- Kind: cut-out card sheet, 3 x 3 on magenta, full colour; hub at the bottom middle of each cell.
- Used by: the steam combs' fans (they comb water out of a fumarole's steam). Stands in today: procedural filaments.
  Reuse: sea fans, alien filter feeders.

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: a fan of very fine, almost hair-thin pale grey-white filaments (#e4e8e0) radiating in a half circle from a small hub at the bottom middle of the cell, like a sea fan or a fine comb, the filaments a little translucent and beaded all over with tiny clear water droplets that catch the light; vary the width and the fullness of the nine fans. Full colour: not tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta, pink or purple anywhere in the subject; no grey or white background.
```

#### `card.strap.pandan`
- **Delivered 2026-10-14:** 10.webp. `library/card.strap.pandan` (nine leaves). Wired: biomes/geyser `strap` (one leaf, flipped onto the frond), full colour.
- Kind: cut-out card sheet, 3 x 3 on magenta, full colour; one leaf per cell, base at the bottom.
- Used by: the stilt pandans' strap leaves (their crowns seen from above are `card.screwpine`). Stands in today:
  procedural leaves. Reuse: screwpines, yuccas, bromeliad leaves.

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, each sprite centred in its cell with magenta all round it and nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: a single long strap leaf of a screwpine (Pandanus), standing upright from its base at the bottom of the cell to its tip near the top, the last third drooping a little to one side, narrow and keeled down the middle, its edges finely toothed, glossy green (#4e7432) shading to yellow-green (#8aa040) toward the base; vary the curve and the width between the nine. Full colour: not tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta, pink or purple anywhere in the subject; no grey or white background.
```

#### `feather.flight`
- **Delivered 2026-10-14:** 15.webp. `library/feather.flight`. Wired: kits/fauna `flight` (every wing part's feathers; the runtime picks it by part), with `feather` (feather.plumage) on the bodies.
- Kind: tileable material, near-colourless (tinted by each bird's vertex colours; a triplanar detail map).
- Used by: every bird's folded and spread wings (`kits/fauna/KNOWN_ISSUES.md`: "smooth white hens and ducks read as
  plastic until the `feather.plumage` and `feather.flight` sets arrive"). `feather.plumage` is delivered (not yet wired as a
  `feather` family in `kits/fauna/materials.json`); this is its partner. Stands in today: nothing (flat vertex colour).
  Reuse: wings on banners and crests, fletching, feather fans.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Folded bird flight feathers seen from above, as on a closed wing: long primary and secondary feathers about 25 cm long lying parallel and overlapping like roof shingles, each with a visible pale central shaft, smooth vanes and a slightly ragged tip, narrow dark gaps between them. Light neutral grey so it can be tinted. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained.
```

#### `patterns/islander/gable-west`
- **Delivered 2026-10-14:** 31.webp (and 34.webp, a second board: `patterns/islander/gable-west-b`). Wired: kits/islanders `patGableW`; the variant `patGableW2` on the rumah gadang.
- Kind: pattern sheet, repeats both ways. Family `patGableW`: the West's (Batak) gable boards. Stands in: a canvas.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Flat, front-on decorative panel of a painted and lightly carved Batak gable board (gorga): on a red earth (#9a2a1e) ground, pairs of large interlocking spirals drawn as bold black (#1e1a18) lines edged in white (#efe6d2), a white lozenge between each pair with a black diamond at its heart, and toothed borders of black triangles between thin white and black bands. Hand-painted on adzed wood, slightly worn and uneven. The pattern repeats horizontally and vertically. Full colour.
```

#### `patterns/islander/gable-east`
- **Delivered 2026-10-14:** 14.webp (and 35.webp, a second take: `patterns/islander/gable-east-b`; 14 tiles exactly and is the main one). Wired: kits/islanders `patGableE`; the variant `patGableE2` on the great uma.
- Kind: pattern sheet, repeats horizontally. Family `patGableE`: the East's (Kautoa, Sumba) woven facades; also one of the
  ikat stand-ins on the weaver's rail. Stands in: a canvas.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Flat, front-on decorative panel of a woven split-bamboo house facade as on an Ede or Sumba house: a cream (#e6d8b8) woven field in horizontal bands, alternating rows of large nested diamonds in black (#1e1a18) and ochre (#c8922e) with a small dark red (#6e1a12) heart, and rows of triple zigzag lines, thin black bands between the rows, visible weave in every strip. The pattern repeats horizontally. Full colour.
```

#### `patterns/islander/kowhaiwhai`
- **Delivered 2026-10-14:** 13.webp. Wired: kits/islanders `patBand` (0.72 m a sheet: one scroll band in 0.36 m).
- Kind: pattern sheet, a band that repeats horizontally. Family `patBand`: rafter and beam bands. Stands in: a canvas.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Flat, front-on decorative panel of a Maori kowhaiwhai rafter painting: flowing white (#efe6d2) koru scrolls outlined in black (#1e1a18) on red earth (#9a2a1e), each scroll's stem curling into the next in a continuous running pattern, painted on smooth wood. The pattern repeats horizontally. Full colour.
```

#### `patterns/islander/storyboard`
- **Delivered 2026-10-14:** 20.webp. Wired: kits/islanders `patStory`.
- Kind: pattern sheet, two registers, repeats horizontally. Family `patStory`: the Palauan-style gable relief. Stands in:
  a canvas.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Flat, front-on decorative panel of a Palauan bai storyboard, a carved and painted gable relief in two registers between black and white toothed bands: in the upper register a red canoe with five black paddlers under a white full moon, in the lower one red and white fish and black frigate birds in flight, outlined black (#1e1a18) on an ochre (#c8922e) ground, the relief shallow and hand-cut. The pattern repeats horizontally. Full colour.
```

#### `patterns/islander/weave`
- **Delivered 2026-10-14:** 12.webp. Wired: kits/islanders `patWeave`.
- Kind: pattern sheet, repeats both ways. Family `patWeave`: the East's woven walls; also an ikat stand-in. Stands in: a
  canvas.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Flat, front-on panel of a woven split-bamboo wall: flat strips about four centimetres wide in a twill, pale natural bamboo (#d8c294) and smoked dark strips (#6a5236) stepping into a pattern of nested diamonds, the strips' edges catching a little light. The pattern repeats in both directions. Full colour.
```

#### `patterns/islander/medallion-moon`
- **Delivered 2026-10-14:** 11.webp (the owner delivered it, so `patterns/common/medallion-moonface` was not tried). Wired: kits/islanders `medMoon`.
- Kind: single panel, centred with clear margin (map once). Family `medMoon`: the moon discs on the West's hall and the
  chief's house. Stands in: a canvas. Try first: `patterns/common/medallion-moonface` (in the library, unwired, noted as
  fit for the Islanders' white island moon); if it serves, wire it and drop this entry.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Flat, front-on decorative panel of one round painted emblem, centred, clear margin: the white island moon, a pale full moon (#f6f0e2) with soft grey seas, on a sea-teal (#2a7a7a) disc ringed with white shell discs, inside a black (#1e1a18) ring and an ochre (#c8922e) rim, painted on wood with a little wear. A single motif, not a repeat. Full colour.
```

#### `patterns/islander/hinggi`
- **Delivered 2026-10-14:** 16.webp. Wired: kits/islanders `patHinggi`, the four cloths on the Kautoa weaver's rail (63-ie-trade.js).
- Kind: pattern sheet, repeats horizontally. **New prompt** (none existed): the ikat cloths drying on the Kautoa
  weaver's rail (`ie-weaver`, `63-ie-trade.js`; the weaver's note names indigo and morinda vats). Stands in today:
  `patGableE`, `patWeave` and `tapa`. The kit's palette has no indigo, so #23304a is chosen here.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Flat, front-on decorative panel of a Sumba hinggi, a hand-woven warp-ikat cloth: the motifs were dyed into the threads before weaving, so every edge is soft and feathered along the vertical threads. Horizontal registers mirrored about the middle of the cloth: wide bands of stylised horses with riders, deer, roosters and crayfish in cream (#e6d8b8) and ochre (#c8922e) on a deep indigo ground (#23304a), separated by narrow bands of small hooked diamonds and stripes in morinda red (#9a2a1e) and dark red (#6e1a12), with thin black (#1e1a18) lines between the bands. Visible plain weave, slightly faded and uneven dye. The pattern repeats horizontally. Full colour.
```

#### `patterns/scyvoi/applique-roof`
- **Delivered 2026-10-14:** 17.webp. Wired: kits/scyvoi `patRoof`, the three Tibetan tents' roofs (patApp stays on walls and bands).
- Kind: pattern sheet, repeats both ways, full colour. **New prompt** (`kits/scyvoi/KNOWN_ISSUES.md`: "not asked for
  yet").
- Used by: the Tibetan tents' roofs. Stands in today: the dense blue appliqué sheet (`patApp`,
  `patterns/scyvoi/applique-blue`); the references show a white roof sewn with a few large blue knots. Colours from
  `SVPAL` (`26k-kit.js`: cream felt, indigo).

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Flat, front-on decorative panel of a Tibetan appliqué tent roof: plain heavy white-cream cotton (#f2ece0) sewn with a few large endless knots cut from indigo cloth (#23345a, a little lighter #2a3c66 where the cloth is worn), each knot about a fifth of the frame across with a thin cream couched outline and visible running stitches, the knots spaced widely in a half-drop grid with plenty of plain white cloth between them; faint fold creases and a little smoke grey along the seams. The pattern repeats in both directions. Full colour.
```

#### `metal.bronze.cast`
- **Delivered 2026-10-14:** 18.webp. Wired: settlements/iziz `cityBronze` (MAT.bronze, bronzeDark: the statues) and `cityBrass` (vpGilt, vpBrass).
- Kind: tileable material, near-colourless (tinted). Isotropic: the statues' kit UVs stretch with each instance's
  scale, so the image must have no direction.
- Used by: the heroic statues (`izBronze`, `izBronzeCyl`, `izBronzeD` on `MAT.bronze`, `bronzeDark`) and the embassy's
  `vpGilt` and `vpBrass`. Stands in today: plain metal (`metal.bronze` is a riveted, seamed panel: wrong on a cast
  figure). Reuse: Ys' Citadel spires (`hkVerd`, now the riveted `metal.bronze.verdigris`; a plain patina suits them
  better), any statue, bell or cast fitting.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Cast bronze surface of a large outdoor statue: smooth cast metal with very fine casting porosity and a soft hammer-dressed undulation, a thin warm brown patina with small mottled patches of pale green verdigris gathered in the hollows; no seams, rivets, panels, letters or edges, isotropic with no direction. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained.
```

#### `concrete.rust.streaked`
- **Delivered 2026-10-14:** 19.webp. Wired: settlements/iziz `cityConcRust` (MAT.concRust). Ys took its own sea version (30.webp).
- Kind: tileable material, near-colourless (tinted); vertical streaks run down the image.
- Used by: `MAT.concRust`, the rust-streaked skyscraper skin (112k triangles). Stands in today: the procedural map (no
  library concrete carries the streaks). Ys asks for a salt-sea version of the same surface: `concrete.rust.streaked.sea`
  in section 2.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Weathered poured concrete stained by rust: smooth grey board-formed concrete with faint horizontal formwork lines and small round tie holes, long vertical rust-brown streaks and drips running down from small rusted bolts near the top edge, water stains and a little grime in the board joints. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained.
```

---

#### `patterns/highlands/harlequin-red`
- **Delivered 2026-10-14:** 25.webp. Wired: settlements/highlands `hHarlR`.
- Kind: pattern sheet. Used by: `MAT.hHarlR` (`hTentHR`).

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Flat, front-on decorative panel of glazed harlequin roof tile: a field of diamond lozenges, each a cream (#d8cfbe) diamond with its points touching the cell edges, set in a deep red (#9a2420) ground, with a thin gold (#c89a30) seam line just inside each diamond's edge and a small soft pale glint on the upper half of each. The pattern repeats in both directions. Full colour, glossy glazed look.
```

#### `patterns/highlands/harlequin-dark`
- **Delivered 2026-10-14:** 24.webp. Wired: settlements/highlands `hHarlGt`.
- Kind: pattern sheet. Used by: `MAT.hHarlGt` (`hTentHG`, `hBulbHG`).

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Flat, front-on decorative panel of glazed harlequin roof tile: a field of diamond lozenges, each a mid green (#5f9a50) diamond with its points touching the cell edges, set in a dark bottle-green (#1f5a40) ground, with a thin gold (#c89a30) seam line just inside each diamond's edge and a small soft pale glint on the upper half of each. The pattern repeats in both directions. Full colour, glossy glazed look.
```

#### `metal.rust.heavy`
- **Delivered 2026-10-14:** 23.webp. Wired: settlements/ys `rust` and `pipeRust` (79z gives pipeRust world UVs).
- Kind: tileable material, full colour (not tinted); one tile = 2 m.
- Used by: the struts, legs, pipes and iron of the drowned Ancients (`MAT.pipeRust`, the Conocylinder's strut ring, the
  Capsule Stalks' tubes). Stands in today: the procedural rust.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Heavily corroded steel plate, decades in salt water and spray: flaking layers of orange, red-brown and near-black rust, blistered and scaled, pits and holes eaten through in places showing dark shadow beneath, lines of rusted rivets along a plate seam, a few barnacle clusters and white salt crust at the edges. Keep the rust muted and even in brightness so it reads at a distance as a dark red-brown surface rather than a bright orange one.
```

#### `concrete.rust.streaked.sea`
- **Delivered 2026-10-14:** 30.webp. Wired: settlements/ys `concreteR`.
- Kind: tileable material, full colour (not tinted); one tile = 8 m across and 8 m up; the streaks run strictly down.
  (`MATERIAL-PROMPTS.md` names it `concrete.rust.streaked`; renamed here because Iziz's tintable inland version, section 1,
  holds that id. If one image is to serve both, deliver Iziz's and tint it rusty on Ys.)
- Used by: the ruined concrete of the Monolith, the Warden and the stumps (`MAT.concreteR`) and the Conocylinder stumps'
  rust skin (`MAT.rust`). Stands in today: `concrete.ancient` (clean board marks) and the procedural rust.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Board-formed grey concrete of a tall ruined tower, seen face-on, weathered for centuries beside the sea: long rust streaks running straight down the face from rows of corroded fixings and rebar ends, orange-brown bleeding into dark brown, between them pale salt bloom and grey-green algae staining, small spalls where the concrete has broken off round rusting bars, hairline cracks, the board marks still faintly visible. The streaks run strictly vertical (down the image) so the tile can run up a wall. Keep the base concrete a muted mid grey and the rust a muted orange-brown, with no single streak so distinct that it would repeat visibly on a 300 m tower.
```

#### `hide.sleek`
- **Delivered 2026-10-14:** 22.webp (mid-brown, processed muted 0.8). Wired: kits/fauna `sleek`.
- Kind: tileable material, near-colourless (tinted).
- Used by: the `sleek` family: horse, mule deer, cattle, water buffalo, dromedary, coyote, arena tiger, grazer, stalker,
  strider. Stands in today: `hide.strider` (lighter and streakier than a sleek coat). Reuse: hair-on hide on saddle skirts,
  drum skins, quivers, upholstery.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Short sleek animal coat seen close up, as on a horse or a deer: very short dense glossy hairs all lying in one direction, faint swirls where the hair changes direction, a soft sheen along the hair, no spots, stripes or markings. Light neutral warm grey-tan so it can be tinted. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained.
```

#### `skin.smooth`
- **Delivered 2026-10-14:** 21.webp. Wired: kits/fauna `skin`.
- Kind: tileable material, near-colourless (tinted).
- Used by: fire salamander, bay swimmer, sky ray, pig (tinted pink), the frilled and pit lizards' bellies. Stands in
  today: `hide.leather033c` (the `skin` family). Reuse: eels, frogs, cave creatures, scaleless fish, oiled leather.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Smooth moist animal skin as on a salamander, a frog or a whale: fine pores, soft wrinkles and creases in loose bands, a few tiny raised bumps, slightly glossy, no scales and no hair. Neutral mid grey so it can be tinted. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained.
```

---

#### `patterns/tribal/formline`
- **Delivered 2026-10-14:** 2.webp. Wired: settlements/highlands `formF`, the frieze boards of every branch (a 0.5 m panel).
- Kind: pattern sheet, full colour, repeats horizontally. Highlands' Tribal (Northwest-coast) branch; the catalog's
  `Painted` formline colours. Listed "prompted earlier and still owed" in `PLAN.md` (catalog audit). **Check:**
  `patterns/republic/folk-formline-a`/`-b` and the friezes `patterns/highlands/frieze-nw-totemic`, `frieze-asian-nw` may
  already serve. A white-ground variant: swap the cedar ground for white (#efe7d6).

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Flat, front-on decorative panel of Northwest-coast formline painting on cedar: bold swelling black (#171311) formlines with ovoids and U-shapes, the inner shapes in red (#b3322a) and teal (#2e9488), on a cedar-wood ground (#b27a4c, shading to #8a5634), hand-painted and slightly worn, the wood grain faintly showing. Abstract: no readable figures. The pattern repeats horizontally. Full colour.
```

#### `patterns/highlands/caihua`
- **Delivered 2026-10-14:** 1.webp (three bands; one installed). Wired: settlements/highlands `hCaihua`, mapped once per bay. The four friezes stay unused.
- Kind: pattern sheet, a long band about 8:1, full colour, repeats horizontally. Highlands' painted beams. **Check:** the
  four wide friezes delivered 2026-10-03 (`frieze-asian-nw`, `frieze-teal-gold`, `frieze-cloud-lotus`,
  `frieze-nw-totemic`) were filed as caihua candidates and are not used yet; if one reads as caihua, wire it instead.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Flat, front-on decorative panel of a Chinese painted beam (caihua), a long horizontal band about eight times wider than tall: ground blue (#3a6aa8) with green (#3f7a4a) stripes along the top and bottom edges. At each end a teal (#2e9488) block holding a large whorl-flower of concentric rings in white (#efe7d6), teal, blue and ochre (#d19a3a), with black (#201a18) petal scrolls and a smaller whorl either side. In the middle a long white-edged panel with pointed ends, red (#b3322a) inside, filled with six ochre cloud scrolls; ochre dots at the joints and a thin black outline. The pattern repeats horizontally. Full colour, painted.
```

#### `wool.fleece`
- **Delivered 2026-10-14:** 33.webp. Wired: kits/fauna `fleece`, the sheep's wool. `surface.fleece` stays the eastern highlands' woolly plants (it was never on the fauna).
- Kind: tileable material, near-colourless. Fauna: sheep, yak undercoat, goat kids; reuse fleece rugs, felt, saddle
  pads. **Check:** `surface.fleece` (delivered for the eastern highlands' woolly plants, reuse "sheepskin, felt, any
  woolly plant or animal coat") may serve.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Sheep's fleece on the living animal seen close up: dense crimped wool staples about 5 cm long packed side by side, each a twisted lock with a slightly darker weathered tip, small dark gaps between the locks, a few bits of dry grass caught in it. Off-white, evenly muted. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained.
```

#### `card.grass.panic`
- **Delivered 2026-10-14:** 29.webp (nine base-anchored tufts). Wired: biomes/geyser `grass`, grey under the panic grass palette. The reeds stay procedural.
- Kind: cut-out card sheet, 3 x 3 on magenta, near-grey green (tinted); **base on the bottom edge of each cell**. New
  prompt. `biomes/geyser/KNOWN_ISSUES.md`: "the grass and the reeds are procedural: the library's grass and reed cards are
  centre-anchored, and the kit's tufts stand on the card's bottom edge. A base-anchored panic-grass card would do."
  **Check:** `card.grass.dry` (asked for "standing up from the bottom of each cell") may already be base-anchored. The
  reeds want the same fix (`card.reed`).

```
A sheet of nine separate cut-out plant sprites in a 3x3 grid on a solid flat magenta background (#ff00ff), square, 2048x2048, nothing crossing into the next cell. Front-on, orthographic, flat even shadowless lighting, no cast shadows, no ground, no text. Each sprite: a tuft of panic grass, a loose fountain of narrow soft blades arching outward and a few open airy seed panicles on thin stems, the tuft's base sitting exactly on the bottom edge of its cell (not floating in the middle), its top reaching about nine tenths of the cell's height; vary the height, the spread and the number of panicles between the nine. Plain muted grey-green so the sprites can be tinted. Hard clean edges against the magenta, no anti-aliased fringe of other colours. No magenta, pink or purple anywhere in the subject; no grey or white background.
```

#### `patterns/scyvoi/salamander-ember` and `patterns/scyvoi/salamander-dun`
- **Delivered 2026-10-14:** 28.webp (ember) and 26.webp (`patterns/scyvoi/salamander-dun`). Wired: kits/fauna `salEmber`, `salDun`, a new FULL-colour slot in the runtime, by variant.
- Kind: pattern sheets, full colour, repeat both ways. New prompts. `kits/fauna/KNOWN_ISSUES.md`: the salamander's
  markings are vertex colours on 16-sided rings and read blocky up close; "a painted skin sheet would be finer". Colours
  from `faSalSkin` (`kits/fauna/krator-fauna-mounts.js`). **Check:** the fauna kit maps grey detail sets under vertex
  colours and has no hook for a full-colour skin; the salamander needs UVs and a slot first.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: The back skin of a giant fire salamander seen from above: smooth, moist, slightly glossy skin with fine pores and soft wrinkles, no scales and no hair, fire-black (#161414) with irregular rounded blotches of ember orange (#f07418) and amber (#f4a020) of different sizes, some merging into short broken stripes running along the body, the blotches' edges soft. The pattern repeats in both directions. Full colour.
```

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: The back skin of a giant fire salamander seen from above: smooth, moist, slightly glossy skin with fine pores and soft wrinkles, no scales and no hair, dun red-brown (#5a2414) crossed by regular narrow bands of saffron (#d8a028) and gold (#e8c040) running across the body, the bands slightly broken and uneven at their ends. The bands run left to right across the image. The pattern repeats in both directions. Full colour.
```

#### `patterns/iziz/sun-banner` (a periodic redo)
- **Delivered 2026-10-14:** 27.webp: repeats exactly (two periods each way). Replaced the old sheet; kits/mechs tiles it now (mechs-runtime.js).
- Kind: pattern sheet, full colour, must repeat exactly. `kits/mechs/KNOWN_ISSUES.md`: the delivered sheet "is not
  periodic"; banners show a window from one tile, so one wider than 1.8 m or taller than 1.3 m would clamp. **Check:** no
  banner is that large today. The first prompt was not kept verbatim (`chatgpt-2026-10g-mechs.json` records its gist);
  this one is rebuilt from it.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Flat, front-on decorative panel of hand-woven Iziz banner cloth with a visible plain weave, slightly faded and uneven dye: cream (#f1dba6) sixteen-rayed suns in a half-drop grid on Iziz orange (#e07a2a), each sun outlined in deep red (#9c2d2d), with teal (#2f8f8a) stripes running along the top and bottom of each row of suns. Exactly two suns across and two rows down, so the sheet repeats exactly in both directions. Full colour.
```

#### `patterns/common/grime-streaks`
- **Delivered 2026-10-14:** 32.webp: 20 x 8 cells on white (the prompt asked 16 x 8 on transparent). Installed only: the breakup hook's grime parameter is not built.
- Kind: a mask atlas, greyscale, 16 cells across by 8 down (each cell twice as tall as wide). New prompt (`PLAN.md`,
  "Culture pattern sheets", Shared; `TODO.md`: "One generated image; prompt to write in PLAN.md"). Each opening, sill or
  cornice picks a cell by hash. **Check:** the `grime` parameter on `breakup` that reads it is not built yet.

```
A sheet of 128 separate grime streak masks in a grid of 16 columns by 8 rows, square, 2048x2048, each cell twice as tall as it is wide, on a solid flat pure white background. Front-on, flat, even, shadowless lighting; no text, no border, no grid lines. Each cell holds one vertical stain as on a wall below a window sill or a cornice: it starts at the top edge of its cell as a soft band and runs down, fading out before the bottom edge, nothing crossing into the next cell. Vary them: soot, damp, rust run-off, narrow drips, wide washes, single, forked and several parallel runs, some short, some long. Greyscale only, from pale grey to near-black where the stain is strongest, no colour at all.
```

#### `patterns/reedlake/reed-lattice` (cut-out)
- **Delivered 2026-10-14:** 5.webp. `patterns/reedlake/reed-lattice`, an alpha cut-out. Wired: settlements/reedlake `rlLattice`.
- Kind: cut-out pattern sheet on magenta, full colour, repeats both ways. The mudhif fronts' open diamond lattice
  (`MAT.rlLattice`, `74-rl-mat.js`); `PLAN.md` "Reed Lake" prompted it on a dark key and it never came. **Check:** the
  procedural alpha lattice works and no known issue asks for it; the cut-outs stay procedural because the delivered reed
  sheets are opaque, so this is only worth it on magenta.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Flat, front-on decorative panel of an open diamond lattice, like the front of a reed mudhif: flat reed strips crossing diagonally at 45 degrees in both directions, spaced so the gaps are square diamonds that show a solid flat bright magenta (#ff00ff) background, so the lattice can be cut out. One set of strips is straw gold (#c9b06a), the other slightly darker (#b89c5a). A thin dark brown shadow line (#3c2814) runs along one edge of each strip. No magenta, pink or purple anywhere in the strips. The pattern repeats in both directions. Full colour.
```

#### `patterns/reedlake/fringe` (a cut-out redo)
- **Delivered 2026-10-14:** 3.webp. The cut-out redo replaced `patterns/reedlake/fringe`. Wired: settlements/reedlake `rlFringe`.
- Kind: cut-out pattern sheet on magenta, full colour, repeats horizontally. The delivered `fringe` is on a dark ground
  and opaque, so the eave fringe (`MAT.rlFringe`) stays procedural. **Check:** as the lattice above.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Flat, front-on decorative panel of loose reed ends hanging from an eave: about seventy thin, slightly curved strands, each hanging straight down from the top edge. Lengths are uneven, between half and full height. Each strand leans a little to one side. The strands are pale straw (#cbb36e) or darker straw (#b39c5c), spread randomly on a solid flat bright magenta (#ff00ff) background, so they can be cut out. The strands end ragged and loose. No magenta, pink or purple anywhere in the strands. The pattern repeats horizontally. Full colour.
```

---

## Delivered 2026-10-19, the Oidong Valley and two Northern Highlands cards (pasted into the chat as WebP, 1254 px and 1536 x 1024)

Fifteen images from the owner, processed by `tools/textures/cards.py` and `process.py` (batches `oidong-cards-2026-10.json` and
`oidong-surfaces-2026-10.json`, every prompt recorded in each set's `meta.json`).
- **Cards (magenta keyed, 1024 px):** `card.lily.iridescent`, `card.peyote`, `card.mooncap`, `card.beads.bell`, `card.heartleaf`,
  `card.lace.birch`, `card.blossom.cherry`, `card.giantpad`, `card.sunwheel`, `card.staghorn` (rotated a quarter turn so its base is
  at the top: a frond card's v runs along it).
- **Surfaces:** `bark.marble` (full colour), `bark.bamboo.jade` (`keep_aspect`, 1:2), `bark.cedar.red`, `organic.chalicecap`,
  `organic.mossball`.
- **Wired:** `biomes/oidong/materials.json` (the cards by material slot through `BIO.libSwap`; the surfaces by family) and
  `biomes/nhighlands/materials.json` (`staghorn`, `wheel`); `biomes/oidong/KNOWN_ISSUES.md` and `biomes/nhighlands/KNOWN_ISSUES.md` updated.
- **Kept the kit's own:** the ribbed lotus stalks and the daisies, the iridescent bark canvases, the haze blossom's and the wisteria's cards.

## Delivered 2026-10-18, the Beast Riders kit and two more (pasted into the chat as WebP, 1254 px)

Batches `tools/textures/batches/owner-2026-10-18-beast-riders.json` (surfaces, `process.py`) and
`owner-2026-10-18-beast-riders-cards.json` (the card, `cards.py`); sets in `core/materials/library/`.
- `straw.bedding`, `wood.guano`, `ground.stable.yard`: kits/beast-riders (`materials.json`). `wood.guano`'s drips are
  top-heavy in the source, so a tall surface shows a band of drips each tile.
- `rock.sandstone.bedded.red`: for settlements/pinnacle-rock, not built yet: in the library only until it is wired.
- `card.crop.indigo`: for kits/crops (Jungle indigo): in the library only until the Crops kit wires it.

## Delivered 2026-10-19, necanyons

Five prompts of section 6, pasted into the chat as 1254 px WebPs: `ground.slickrock`, `rock.sandstone.varnish` (batch
`necanyons-2026-10-19.json`) and `card.carnivore.monkeycup`, `organic.trap.lobe`, `card.carnivore.sundew` (batch
`necanyons-2026-10-19-cards.json`, keyed off magenta and kept whole, anchor `none`). The sundew's glandular hairs came hot
pink, close to the key: keyed with `spill: all`, which turns the pink left in them red, as the prompt asked. Wired in
`biomes/necanyons/materials.json`.

## Delivered 2026-10-18, the Throne's new flora

Section 6's six prompts, pasted into the chat as 1254 px WebPs: `ground.moss.crimson`, `organic.cap.medusa`, `organic.coil.ribbed`
(batch `throne-flora-2026-10-18.json`) and `card.blade.pyre`, `card.fan.lace`, `organic.lattice.cage` (batch
`throne-flora-2026-10-18-cards.json`, keyed off magenta and kept whole: `cards.py` anchor `none`, so the sheets' cells stay
equal thirds and the lattice still tiles). Wired in `biomes/throne/materials.json` (`ground.velvet`, `cap.medusa`, `bark.coil`,
`card.pyreblade`, `card.lacefan`, `card.lattice`). Reused, not owed: the chalice stalk, moss domes and geode shells keep
their procedural or existing surfaces; the braid cap stays on the tinted parasol skin.

## Delivered 2026-10-18, crops

Twelve prompts delivered (13 pasted images; the owner's numbering): `card.crop.plume`, `card.crop.clover`, `card.crop.bean`, `card.crop.grainhead`, `card.crop.rosette`, `card.crop.umbrella` (came as a papaya-like spotted trunk with a cut-leaf crown; kept), `card.orchard.broad`, `card.crop.tea`, `card.sunthorn`, `card.orchard.small`, `card.crop.palmate` and `ground.tilled`, all in `core/materials/library/` (batches `crops-2026-10-18-cards.json`, `crops-2026-10-18-ground.json`). **Not wired:** the crops kit is not built yet; no `materials.json` names them. The grain and plume cards carry a faint pink spill (they are tintable, so the tint covers it). One extra image (grey-silver leaf sprays with a pink fringe, image 11) was not used: it duplicates `card.orchard.small`.

Second delivery 2026-10-18 (images 14 to 21; batch `crops-2026-10-18-cards2.json`): `card.crop.flax`, `card.crop.nettle`, `card.crop.cotton`, `card.mushroom.pale`, `card.crop.annatto` (two takes came; the second, image 19, is installed, the first, image 18, is unused), `card.crop.woad`, `card.crop.saffron` (lilac-white as asked; keyed with `spill: edge` to keep the lilac). Not wired, as above.


## Stale notes found in the sweep (already delivered)

- `biomes/ehighlands/KNOWN_ISSUES.md` still says `ground.puna` is not delivered: it is (`library/ground.puna`).
- `biomes/throne/KNOWN_ISSUES.md` (the geyser isle) still points at the sinter and mat gaps: `ground.sinter` and
  `ground.mat.thermal` are in the library.
- `TODO.md`'s Girder "four texture gaps (leafy, web, ghostwood, prism gum)": three have sets in `girder/materials.json`;
  the web stays procedural by choice (`PLAN.md`, Girder hookup).
- `settlements/ys/KNOWN_ISSUES.md` says the Ancient towers' `MAT.white` has "no prompt": it binds to `metal.ancient.white`
  since 2026-10-06; the rust is section 2 above.
- `feather.plumage` is delivered but `kits/fauna/materials.json` has no `feather` family yet (wiring, not an image).

## The Eternian kit and the Sanctum (`kits/eternian`, `kits/ancients` target `sanctum`): delivered 2026-10-20

The True Heirs' court (`LORE.md` §6.19, `kits/eternian/PLAN.md` §2 and §10): translucent stone in bronze tracery, the
talking heads, the sign. The arcology draws all of these procedurally until they arrive. Reuse first, no prompt needed:
`metal.bronze`, `metal.bronze.cast`, `metal.gold`, `metal.pewter` (the heads' metals by rank), `roof.scale.gilt` (the
court's fish-scale roofs, tinted per metal), `metal.ancient.white` (the kept host), `glass.clear` (the surviving plate
glass).

#### `stone.onyx`
- **Delivered 2026-10-20** (pasted; batches `eternian-2026-10.json`, `eternian-cards-2026-10.json`): in library/stone.onyx; wired in kits/ancients (the Sanctum target, family `snOnyx`: the bays' onyx, glowing). For kits/eternian: its `materials.json` at P1.
- Used by: the bays' and the court's lights behind the bronze tracery (lit from behind by the cyan strips). Reuse: any
  palace, temple or bath that glazes in stone.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: a thin polished slab of honey onyx cut across its layers: soft wavy parallel bands running mostly horizontally, cream (#efe4c8) through pale honey (#d9b884) to amber (#b7884a), a few fine milky-white veins (#f6f1e6) crossing the bands at a shallow angle, faint cloudy depth in the paler bands. Polished but shown matte: no reflections, not backlit. One tile covers 1 metre. Full colour: not tinted.
```

#### `stone.alabaster`
- **Delivered 2026-10-20** (pasted; batches `eternian-2026-10.json`, `eternian-cards-2026-10.json`): in library/stone.alabaster; wired in kits/ancients (`snAlab`: the Withdrawn's bays). For kits/eternian: its `materials.json` at P1.
- Used by: the court's palest lights, the Withdrawn's blind bays, lamp shades. Reuse: any culture's translucent lamps.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: a polished slab of white alabaster: a soft waxy near-white (#f1ece2) with large cloudy drifts of cream (#e4dccd) and pale grey (#d6d0c4), a few fine thread-like grey veins (#c2bbae) wandering across it, a faint granular depth. Shown matte: no reflections, not backlit. One tile covers 1 metre. Full colour: not tinted.
```

#### `metal.titanium`
- **Delivered 2026-10-20** (pasted; batches `eternian-2026-10.json`, `eternian-cards-2026-10.json`): in library/metal.titanium; wired in kits/ancients (`snTitan`: the colossus). For kits/eternian: its `materials.json` at P1.
- Used by: the colossus on the Sanctum's crown and the Heirs' metal figures (the owner's Gagarin reference). Reuse:
  any polished modern metal monument.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: brushed and lightly polished titanium plate: fine straight horizontal brushing in a cool mid grey (#9aa1a8), broad soft clouds of very faint straw and blue heat tint (#a8a08a, #8c9aae) drifting across it, a few flat panel seams (#6d737a) dividing it into large rectangles. No rivets, no rust, no scratches, no dents. One tile covers 4 metres. Full colour: not tinted.
```

#### `patterns/eternian/screen-pierced`
- **Delivered 2026-10-20** (pasted; batches `eternian-2026-10.json`, `eternian-cards-2026-10.json`): in patterns/eternian/screen-pierced and screen-pierced.b (a second take, an alternate per bay; cards.py, keyed); wired in kits/ancients (`snScreen`, `snScreenB`: the Sealed House). For kits/eternian: its `materials.json` at P1.
- Used by: the pierced bronze screens where a wall must breathe, the sealed bays of the Withdrawn. A cut-out:
  `cards.py` keys the magenta to alpha.

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: a pierced cast-bronze screen: a continuous geometric lattice of interlocking stepped squares and right-angle maze turns, like a circuit board drawn as Art Deco fretwork, the bars about one fortieth of the tile wide, every opening cut clean through to a solid flat bright magenta (#ff00ff) background. The bronze is a warm polished brown-gold (#9c7a3c) with slightly darker bevelled edges (#6e5428). No curves, no animals, no faces, no letters or glyphs. No magenta, pink or purple in the bronze, no grey or white background. The pattern repeats in both directions. Full colour: not tinted.
```

#### `patterns/eternian/talking-heads`
- **Delivered 2026-10-20** (pasted; batches `eternian-2026-10.json`, `eternian-cards-2026-10.json`): in patterns/eternian/talking-heads; wired in kits/ancients (`snFaces`: the terminals, one cell each, the deranged in the bottom row's middle). For kits/eternian: its `materials.json` at P1.
- Used by: the Ancient terminal faces the Machine Talkers wake (the petition walls, the gates, the Regent's hall). A
  sheet of nine; the build cuts the cells.

```
A sheet of nine separate screen panels in a 3x3 grid, square, 2048x2048, each panel filling its cell edge to edge, a thin black gap between the cells. Front-on, orthographic, flat even lighting, no reflections, no text, no watermark. Each panel: a dark glass display (#0b1215) showing a calm, serene face drawn in glowing cyan line art (#39d6e8), built from flat faceted planes like an Art Deco cubist sculpture: closed eyes as two downward-curved lids, a straight nose, a small closed mouth, a stepped geometric headdress, faint horizontal scan lines across the glass. Eight of the nine are calm and differ in face (long, broad, aged, young, male, female) and headdress. The ninth is subtly deranged: the same kind of face with one eye open, its lines doubled and slipping sideways, a few horizontal tear bands, still cyan only. No red, no skulls, no snarls, no sun rays, no letters. Full colour: not tinted.
```

#### `patterns/eternian/sign`
- **Delivered 2026-10-20** (pasted; batches `eternian-2026-10.json`, `eternian-cards-2026-10.json`): in patterns/eternian/sign; wired in kits/ancients (`snBanner`: the banners). For kits/eternian: its `materials.json` at P1.
- Used by: the State's banners on the gates and walls (the sign, `LORE.md` §6.19: a gold face with its eyes closed on
  black, green highlights). Not tiled.

```
A flat, front-on hanging banner, portrait, 1024x2048, filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette. No perspective, no text, no letters, no watermark. A matte black cloth field (#141416). In the upper middle, a large serene face in gold (#d8b24a) with its eyes closed, built from flat faceted planes in the Art Deco cubist manner, a stepped Deco headdress above it; green (#3f8a5a) highlights pick out the planes of the cheeks and brow and draw a thin line under the closed lids. Below the face a narrow vertical band of gold right-angle maze pattern, like a circuit board, runs down to the hem; a thin gold border just inside the edge. Faint woven and embroidered cloth texture. No sun rays or ray halo, no red, no skull, no weapons. Full colour: not tinted.
```

#### `patterns/eternian/circuit-maze`
- **Delivered 2026-10-20** (pasted; batches `eternian-2026-10.json`, `eternian-cards-2026-10.json`): in patterns/eternian/circuit-maze, .b and .c (two extra takes, alternates per bay); wired in kits/ancients (`snMaze`, `snMazeB`, `snMazeC`: the balconies' fascias, the crown rim). For kits/eternian: its `materials.json` at P1.
- Used by: the circuit-maze brocade (rank by the number of turns), stone bands on the ministries, the banners' edges.
  Tinted per use: gold on black for the court, white on black for the ministers. Reuse: the Ancients' own trim.

```
Seamless tileable texture, 2048x512, the pattern repeating horizontally. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge. Material: a woven brocade band of a right-angle maze pattern like an Ancient circuit board: continuous lines turning at right angles, small square pads and stepped corners, laid out as a running border between a straight rule above and below; the lines light (#e8e6e0) on a near-black ground (#1a1a1c), a faint woven texture. Geometric only: no glyphs, no letters, no faces. Near-colourless: greys only, so it can be tinted.
```

#### `patterns/eternian/face-frieze`
- **Delivered 2026-10-20** (pasted; batches `eternian-2026-10.json`, `eternian-cards-2026-10.json`): in patterns/eternian/face-frieze; wired in kits/ancients (`snFrieze`: the podium's frieze). For kits/eternian: its `materials.json` at P1.
- Used by: the friezes of the podium, the gate pylons and the ministries (the Bayon done in Deco). Tinted pale stone
  for the State, bronze for the court.

```
Seamless tileable texture, 2048x1024, the pattern repeating horizontally. Orthographic top-down view, a flat, front-on decorative panel filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge. Material: a carved stone relief frieze: a row of three large serene faces with closed eyes, each built from flat faceted planes in the Art Deco cubist manner (a straight nose, flat cheek planes, a stepped geometric headdress), alternating with narrow fluted pilasters and stepped Deco chevrons; crisp shallow carving, pale stone (#ddd6c8) with soft grey in the recesses (#a9a296). Calm and serene: no snarls, no skulls, no weapons, no letters. Near-colourless: pale grey only, so it can be tinted.
```

## Delivered 2026-11-12, generated through Codex (`tools/textures/batches/codex-2026-11-12*.json`, core/materials/PLAN.md "Delivered 2026-11-12")

Sections 37, 40, 41, 43, 44, 45, 48, 49 and 50 whole, as they stood; the delivered rows of sections 51 and 52. Section 38's `ground.coral.rubble` had been in the library since 2026-11-03 (a stale entry). Their wiring notes are kept here for the builds' next turn.

## 38. The Ring Sea isles' lagoon station (`biomes/ringisles --station lagoon`, 2026-11-03)

Numbered 32 until 2026-11-08 (three branches each took 32; a stale second copy of section 32 was dropped then). `ground.coral.rubble` is in the library
(the owner's 2026-11-03 batch, `tools/textures/batches/owner-2026-11-03.json`, which cites it as "section 32 on claude/..."): prune this section once its build wires it.

The motu's storm ridges and the reef flat's back edge are coral rubble thrown up by the swells; the station paints them as the beach's sand
(`ground.coast_sand_01`, the paint's beach weight) until this set comes. Wire it as a `ground.rubble` slot in `biomes/ringisles/materials.json` and a layer in
`src/84-host-ground.js` (the station's storm ridge as its mask) at the next turn; with it the ground reads 17 units, so it must replace `shingle`, not join it.

`ground.coral.rubble`:
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no Subject: a storm ridge of coral rubble on a tropical atoll islet: broken branching-coral sticks, finger and staghorn fragments 2-15 cm long, worn smooth and bleached to bone white, cream and pale grey, with a few rounded brain-coral cobbles and pink-grey pieces of coralline crust, packed loosely so dark gaps show between them, a little coarse white coral sand in the hollows; no shells larger than a thumbnail, no seaweed, no plants, no water. Even scale across the frame (about 1.5 m across the image).
```

## 37. The southern highlands' upper stations (`biomes/shighlands --station conifers` and `--station fellfield`, 2026-11-09)

Stations 2 and 3 (`biomes/shighlands/PLAN-STATIONS.md`, "Built") are wired on library sets that already exist (`bark.twisted.red`, `bark.whorled`,
`bark.juniper`, `card.pine`, `card.spruce`, `card.juniper`, `ground.needles`, `ground.snow.drift`, `ground.lichen.crust`, `rock.rubble.sturzstrom`,
`surface.cushion`, `ice.glacier`; the spiral cones are geometry, not a card). One surface is still the kit's stand-in (the fines and the snail
rosettes' leaf arrived 2026-11-10: `ground.fellfield.fines`, `card.rosette.snail`, in the library and not yet wired: `PLAN.md`, "Delivered 2026-11-10"):

`card.heath.whorl` (station 2's dwarf whorl-heath on the forest floor and the crest, drawn now as the kit's plain shrub lobes: `dwarf` in
`stations/conifers/62-biome-shigh-conifers.js`; a sheet of nine sprigs on the clump, `"sheet": "geometry"`):
```
Square, 2048x2048. Orthographic view looking straight down on nine separate sprigs in a 3x3 grid, each centred in its third of the frame with magenta all round it, on a solid flat bright magenta (#ff00ff) background that fills everything outside the objects, with no shadow cast on the background. Flat, even, shadowless lighting: no highlights, no vignette. No perspective, no text, no border, no watermark. Objects: sprigs of a dwarf alpine heath, each a short woody shoot densely clothed in tiny needle-like leaves set in tight whorls of four up the stem so the leaves spiral round it, dark green leaves with paler tips, three of the sprigs carrying a few small nodding pink bell flowers, seen from above. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained.
```

## 40. The hyperjungle's lands and the savannah rims (`biomes/hyperjungle` stations `savage` and `north`, `biomes/abyssal-savannah` stations `serim`, `erim` and `north`; J2-J6, 2026-11-08)

`biomes/hyperjungle/PLAN-LANDS.md` section 10's list, for the species built on 2026-11-08 with a stand-in each (named in the build's
KNOWN_ISSUES.md, "J2-J6"). The library sets already wired are not listed (bark.strangler, organic.pod.honeycomb, wood.silver,
bark.bamboo.jade, card.bamboo.giant, earth.termite and the rest). Wire each into the named build's `materials.json` when it comes (the rims' sets into `biomes/abyssal-savannah/materials.json`, on the rim stations' families: `build.py` `RIM_PACK`; the rims were built as `biomes/savannarim` and folded in there on 2026-11-08). **2026-11-10:** seven of the fifteen arrived (`bark.palm.spined`, `bark.tualang`,
`card.ghostpipe`, `card.grass.elephant`, `card.grass.themeda`, `ground.ironstone`, `card.leaf.miombo`: `PLAN.md`, "Delivered 2026-11-10"); the two grasses are wired,
the other five are in the library for the builds' next turn.

### The savage land (J2)

`organic.comb.bee` (the giant bees' combs; now organic.pod.honeycomb, a stand-in):
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: the open face of a wild giant-bee honeycomb seen straight on: hexagonal wax cells 1 to 1.5 cm across in slightly irregular rows, some capped with pale cream wax, many open and filled with glossy amber-gold honey, darker brown old cells in patches, a few dark empty cells; the wall edges thin and pale. Full colour: not tinted.
```

`card.arum.carrion` (the carrion arum's spathe; now a modelled vertex-coloured spathe):
```
Square, 2048x2048. Orthographic view of a single cut-out object centred in the frame, on a solid flat bright magenta (#ff00ff) background that fills everything outside the object, with no shadow cast on the background. Flat, even, shadowless lighting: no highlights, no vignette. No perspective, no text, no border, no watermark. Object: a giant corpse flower (Amorphophallus titanum) seen from the side: a tall pale yellow-cream spadix spire rising from the centre of a single frilled spathe that wraps round it like a ruffled cup, deep maroon-red with a velvety sheen inside and pale green flecked with maroon outside, the rim frilled and turned back. Full colour: not tinted.
```

### The north, Screamer wood (J3)

`bark.watcher` (the watcher's eye-scarred bark; now a canvas painted in `src/57`):
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: the pale bark of an aspen (Populus tremuloides) grown huge: smooth chalky grey-white with a faint green-grey cast, covered in dark almond-shaped branch scars like eyes, each a black lens 5 to 15 cm long with a raised grey rim and darker lids, more of them lower down, thin black horizontal lenticel lines, a few rough dark patches. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained.
```

`bark.bloodwood` (the bloodwood's bark; now a canvas painted in `src/57`):
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: the bark of a kiaat tree (Pterocarpus angolensis): dark grey-brown, coarsely fissured into rough vertical plates, with thick blood-red sap welling from wounds and running down the fissures in glossy streaks that dry dark red-brown, older runs crusted almost black. Full colour: not tinted.
```

`bark.bamboo.bored` (the howl bamboo's culms; now bark.bamboo.jade and BIO.bamboo's coarse stains):
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: the surface of a giant bamboo culm, olive-grey to dull jade green, faint vertical fibres, a dark node ring with a pale waxy band across the top of the image, the internode bored through by beetles in a row of round fist-sized holes with frayed edges and dark insides, pale grey-white stains running straight down from each hole. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained.
```

`card.bamboo.leaf` (the howl bamboo's sprays; now card.bamboo.giant, the Cut's sheet):
```
Square, 2048x2048. Orthographic view of a single cut-out object centred in the frame, on a solid flat bright magenta (#ff00ff) background that fills everything outside the object, with no shadow cast on the background. Flat, even, shadowless lighting: no highlights, no vignette. No perspective, no text, no border, no watermark. Object: a hanging spray of giant bamboo leaves on fine twigs, seen from the side: long lanceolate leaves 20 to 30 cm, bright to mid green, drooping from thin pale twigs in fans of five to nine, a few yellowing leaf tips, nothing touching the frame. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained.
```

`card.flower.hand` (the hand-flower; now a modelled vertex-coloured flower):
```
Square, 2048x2048. Orthographic view of a single cut-out object centred in the frame, on a solid flat bright magenta (#ff00ff) background that fills everything outside the object, with no shadow cast on the background. Flat, even, shadowless lighting: no highlights, no vignette. No perspective, no text, no border, no watermark. Object: one flower of the devil's hand tree (Chiranthodendron pentadactylon) seen from above at an angle: five long curved crimson stamens joined at the base like a clawed hand held palm up, their tips hooked, rising from a cup of five leathery brown-red sepals, a felted grey-green leaf behind it. Full colour: not tinted.
```

`card.pod.skull` (the skull-pod's seed pods; now modelled pods):
```
Square, 2048x2048. Orthographic view of a single cut-out object centred in the frame, on a solid flat bright magenta (#ff00ff) background that fills everything outside the object, with no shadow cast on the background. Flat, even, shadowless lighting: no highlights, no vignette. No perspective, no text, no border, no watermark. Object: a cluster of dry snapdragon seed pods (Antirrhinum) grown to the size of fists, each a pale bone-coloured papery capsule with two dark round openings and a small dark slit below them, so each looks like a tiny skull, on brittle brown stalks. Full colour: not tinted.
```

### The savannah's base (`biomes/abyssal-savannah` rim stations, `blind` and `grass`, J4)

### The se rim (`biomes/abyssal-savannah` station `serim`, J6)

## 41. Erewhon's citadel: the Pleasure Domes and the Moorish and Mughal palaces (`kits/xanadu`, `settlements/xanadu/citadel`, 2026-11-09)

The owner's references (`settlements/xanadu/citadel/refs/`) and brief: the Pleasure Domes in black and white (the citadel's dome black over white, the Dome of the Bay white over black); the rest of the citadel Moorish and Mughal, psychedelic in its own way. **Reuse, so no prompt:** `metal.gold` (gilt trim, joints, rails), `rock.sandstone.red` (Mughal red sandstone), `plaster.white_stucco_02`, `rock.marble.white` where the marble is plain. The stripes, checkers and chevrons of the domes are geometry, not images. **2026-11-10:** ten of the eleven arrived and are wired in both
`materials.json` (`PLAN.md`, "Delivered 2026-11-10"), and `wood.cedar.moorish` (section 42, now pruned) with them, in the library for the kit to take up; the
jali card below is the one still owed.

`patterns/xanadu/jali` (pierced marble window screens (keyed card)):
```
Square, 2048x2048. Orthographic view of a single cut-out object centred in the frame, on a solid flat bright magenta (#ff00ff) background that fills everything outside the object, with no shadow cast on the background. Flat, even, shadowless lighting: no highlights, no vignette. No perspective, no text, no border, no watermark. Object: a rectangular pierced white marble jali screen seen straight on, 1:1, filling the frame: a dense geometric lattice of interlaced hexagons and six-pointed stars cut right through the stone, so every opening shows the magenta background; the stone's edges crisp, a thin plain border round the screen.
```

## 43. The gypsum maze under Cube's plateau (`biomes/rift --station maze`, 2026-11-09)

`biomes/rift/PLAN-STATIONS.md` section 11; `biomes/KARST-SITES-5.1.md` site 3. The library has no bedded gypsum, the maze's whole rock (its
walls, roofs and the scarp's face), so the Hearths' pack stands in, read in place: `crystal.selenite` (`stone.alabaster`, massive gypsum: it
reads as veined marble up close) for the gypsum, `ground.gypsum` (`ground.gypsum.crust`) on the floors, `rock.limestone`
(`rock.limestone.karst`) on the stromatolite beds. Wire the new set as a `rock.gypsum` family in `biomes/rift/materials.json`, run
`python3 tools/textures/pack.py biomes/rift`, add `rock.gypsum` to `stations/maze/station.json` `own`, and point the base layer of
`stations/maze/84-host-rock.js` at it in place of `crystal.selenite`. Full colour (the colour is the point). Reuse: any gypsum or evaporite
wall (the Hearth hold's upper storey, Korona's gypsum rims, KARST-SITES site 7).

`rock.gypsum.bedded` (2 m; up is the bedding's up):

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view,
perfectly flat surface filling the whole frame edge to edge. Flat, even,
shadowless lighting, as if scanned: no highlights, no vignette, no shading
gradient across the image. No perspective, no objects, no text, no border,
no watermark. The left edge must continue into the right edge and the top
into the bottom. Material: a dry cave wall cut in bedded gypsum rock, the
beds running straight across the image from left to right: sugary
fine-grained white to pale grey gypsum (#d8d4cc, #c9c4ba) in beds 10 to 40
cm thick, thin darker grey-green marl partings between some beds (#8f948a),
a few beds of larger interlocking clear-grey gypsum crystals with a faint
glitter, short hairline cracks across the beds, small shallow solution
pockets and smooth scalloped hollows, a light dusting of buff clay in the
lowest hollows; matte, dry.
```

## 44. The Hearth field's warm ground (`biomes/riftrim --station hearths`, 2026-11-09)

`biomes/riftrim/PLAN.md`, "Station 7, the Hearth field". Inside each disc the snow never lies and the library has no warm bare soil, so the
ground there is the kit's paint (black-brown, 4 m texels: soft up close). Wire the set as a `ground.warmsoil` family in
`biomes/riftrim/materials.json`, run `python3 tools/textures/pack.py biomes/riftrim`, add it to `GLW` in `src/45-host-stage.js` on the mask
`smooth(.06,.2,F.geo)*smooth(.6,.45,F.geo)` (the disc, not the sinter apron) and name it in the station's `groundLayers` in place of `lenswort`
(the station has four layers: the bare-snow mask holds the fifth unit). Full colour. Reuse: the Cold Hearths (oidong), Godstep's hearth, any
geothermal ground off the sinter (the Throne's vent country's warm flats).

`ground.warmsoil` (3 m):

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view,
perfectly flat surface filling the whole frame edge to edge. Flat, even,
shadowless lighting, as if scanned: no highlights, no vignette, no shading
gradient across the image. No perspective, no objects, no text, no border,
no watermark. The left edge must continue into the right edge and the top
into the bottom. Material: warm geothermal ground on a cold plateau: damp
fine black-brown volcanic soil (#2a2420, #1e1a17) with a low dark fleshy
turf in irregular cushions over a third of it (#23211f, #34302a), scattered
pale grey-white sinter crumbs and flakes (#c8c2b4), a few small rust and
dull sulphur-yellow stains (#8a5a34, #b8a046), fine cracks; no snow, no
grass, no leaves; matte, slightly moist.
```

## 45. Raw clay (`kits/islanders`, the clay pit, 2026-11-09)

`kits/islanders/KNOWN_ISSUES.md`, "The clay pit": the clay diggers' pit (`ie-claypit`, `src/69-ie-hamlet.js`) draws its cut
blocks, its heap and its pit floor with the library's `clay` set, which is fired clay, tinted grey (`IE_RAWCLAY`). Lands as
`earth.clay.raw` in `core/materials/library/`, then the family `rawclay` in `kits/islanders/materials.json`.

#### `earth.clay.raw`

```
Seamless tileable texture, 2048x2048, front orthographic, flat even lighting, no shadows: freshly dug wet potter's clay, a cut face of dense smooth grey-ochre clay #9a9284 and #b0a48e with darker damp patches #7e786c, spade cuts and finger smears across it, a few small grey pebbles and root threads, a faint sheen of moisture; no grass, no stones larger than a fingernail, no text
```
## 48. The NE outer wall (`biomes/neouterwall`, station 1 Vitreous Hollow, 2026-11-10)

The Glass-Skarn Bastion (`biomes/neouterwall/PLAN.md` sections 2 and 8). Station 1 stands on stand-ins until these come: the cauldron's
wall is `rock.megabreccia` (the impact rim's host rock, under KSTRATA's megabreccia blocks) where it should be banded skarn, and the
pseudotachylite mirrors are not drawn (station 4's slump faces need them most). Reused: `ground.sinter`, `ground.mat.thermal`,
`ground.grass.lush`, `ground.moss001`, `ground.gravel019`, `ground.tundra`, `rock.basalt.polygonal` (the dikes), `card.treefern`,
`card.reed`, `bark.mossy`; the contact marble is `rock.marble.white` until a closer set is wanted. Full colour (the bands are the rock's own).

`rock.skarn.banded` (the cauldrons' walls and the Epidote Badlands' ribs: KGROUND's rock layer on the steep, read from the side):
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: a weathered rock face of contact-metamorphic skarn, seen square-on: irregular lensing bands from a finger to a forearm thick that pinch and swell and bend round each other, never flat beds: apple-to-olive green epidote (#7a8a3a, #5e7030), red-brown grossular garnet in granular sugary masses with a few clear dodecahedral crystals (#7a3a2a, #8e4a32), black metallic magnetite seams with a faint blue-grey sheen (#1e2024), and white to pale grey coarse-crystalline marble (#e8e4dc, #c8c4bc); thin rusty orange iron stains bleeding down from the magnetite, a few hairline fractures filled with white calcite; sharp contacts between the bands; dry rock, no lichen, no moss.
```

`rock.pseudotachylite.mirror` (the slump faults' glassy faces: station 4's mirror scarp, and the rim's inner face at station 1 when it is drawn; a KGROUND rock layer, roughness low):
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: a natural fault surface of black pseudotachylite friction-melt glass, polished to a dull mirror by the fault's slip: smooth, very dark glassy black-brown (#14110f, #221c18), long straight parallel slickenside grooves and fine striations all running the same way across the whole image, a few thin pale grey host-rock gneiss slivers (#8a8780) and small angular clasts dragged out into streaks along the grooves, thin black glass veins branching into the grey host rock at one or two places, faint iridescent oily blue-green and bronze tints on the smoothest patches, a few small chips where the glass has spalled off showing grey rock under it; no lichen, no dirt.

## 49. The Great Chasm (`biomes/greatchasm`, 2026-11-11)

The Deep's floor (`biomes/greatchasm/PLAN.md` sections 2 and 7: the code's paint is "dark komatiite and obsidian on the floor"). Until it
comes, the Deep's ground draws `ground.sand.black` with `ground.obsidian` in patches (`biomes/greatchasm/materials.json`, `ground.black`
and `ground.obsidian`): a named stand-in. Full colour, 2 m a tile; it replaces `ground.black` in the Deep's four layers (the slot keeps its
name).

`ground.komatiite.pavement`:
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: a hot desert pavement on an ancient ultramafic lava floor: closely packed angular to sub-rounded pebbles and small cobbles of dark green-black komatiite (#24261f, #2e3128, #3a3c31) with a few with a faint bladed spinifex texture of crossed needle-like crystals on their faces, a dull desert varnish sheen on the stones' tops (#4a4232, #3e3628), scattered chips of black glassy obsidian (#121214, #1c1a1e), a fine grey-brown dust (#6a6254, #7a7062) in the gaps between the stones, and here and there a pale white salt crust (#d8d2c4) in the lowest gaps. No plants. Full colour.
```

## 50. The Tiers (`biomes/tiers`, planned 2026-11-10)

The Tiers' plan (`biomes/tiers/PLAN.md` sections 4 and 11): the flora's rule is that everything grows in tiers. Until these
come, the kit draws `card.broadleaf.dry`, `bark.smooth` and `rock.lichen.circles`, tinted (its `KNOWN_ISSUES.md` will say so).

`card.shelfoak` (the shelf oak's tier plates: a sheet of nine, one cell a plate, wired as a family with `"cell"`; near-colourless, the
kit's palette tints it):
```
Square, 2048x2048. Orthographic view looking straight down on nine separate flat leaf sprays in a 3x3 grid, each centred in its third of the frame with magenta all round it, on a solid flat bright magenta (#ff00ff) background that fills everything outside the objects, with no shadow cast on the background. Flat, even, shadowless lighting: no highlights, no vignette. No perspective, no text, no border, no watermark. Objects: the level, plate-like branch tiers of a "wedding-cake" tree seen from above, each one a roughly oval fan of fine twigs radiating from a short stub at the bottom of its cell, covered in small, leathery, rounded leaves held flat and overlapping like shingles, dense in the middle and breaking into separate sprays toward the rim with magenta showing between them; all nine about the same size, a little different in outline. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained.
```

`bark.tiered` (the shelf oak's bole; near-colourless, 1.5 m a tile):
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: smooth, thin, pale grey tree bark with fine horizontal lenticels in short dashes, broken every so often by a raised horizontal ring of wrinkled bark where a whorl of branches grew (two or three rings across the tile, running left to right), faint vertical stress cracks between the rings, a few small round branch scars, patches of thin crust lichen. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained.
```

`rock.lichen.ledges` (the band lichen on a riser; full colour, 2 m a tile, the bands running left to right as the beds do):
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: a weathered pale buff sandstone cliff face (#c9b48e, #a8946e) in thin horizontal beds running left to right, each bed a slightly different tone, crossed by level bands of crust lichen that follow the bedding: a band of bright orange lichen (#d9822b) along a ledge, a band of grey-green foliose lichen (#8a9a78) above it, thin black streaks of tar lichen (#2a2a26) where water runs over the lip of a bed, the bare rock between the bands; small dark pits and a few hairline vertical joints. Full colour: not tinted.
```
| `ground.sulfide.oxidised` | Oxidising sulfide mud on a dry lake strand, seen from above: dense grey-black mud (#3a3836, #4a4642) glittering faintly with fine brassy pyrite grains, its top centimetre rusted orange-brown (#8a4a26, #a65e2e) in patches, cracked into shallow polygons 10 to 20 cm across whose rims curl, a white efflorescence of zinc salts (#e8e6de) and a few pale blue copper-salt specks (#9ac4d0) along the cracks, a little yellow sulfur (#d8c040) in one corner. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. |
| `rock.sphalerite` | A broken face of massive sulfide ore: resinous dark brown-black sphalerite (#2a1e16, #3e2c1e) with honey-yellow translucent grains (#b8862e) where it is thin, brassy chalcopyrite veinlets (#c0a040) and pale pyrite cubes (#c8b878) through it, rust staining (#8a4a26) along the fractures. Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained. |
| `rock.serpentinite` | A slickensided serpentinite outcrop: glossy green-black rock (#1e2a22, #2c3a2e, #3e5040) broken into scaly, lens-shaped shear flakes 2 to 10 cm long with a waxy sheen, pale apple-green patches (#7a9a6a) where the flakes are polished, a few thin white veins of magnesite and calcite (#e8e6dc) crossing at angles, one fine fibrous vein of pale gold chrysotile. Full colour: not tinted. |
| `rock.peridotite.rind` | Weathered peridotite (harzburgite): a rough buff-orange to tan weathering rind (#b8864e, #a07040, #c89a62) with a sandpaper grain, small knobbly crystals of pyroxene standing proud in relief, and two chipped patches where the fresh dark olive-green rock shows through (#4a5a32, #3a4628). Full colour: not tinted. |
| `mineral.travertine.brucite` | A fresh hyperalkaline travertine crust from a serpentinite spring: bright chalk-white and bluish-white carbonate and brucite (#f2f4f2, #dfe8ec, #c8d8e0), finely rippled in shallow rimstone ridges, with thin translucent calcite rafts like ice skins in the low parts and a faint pale-turquoise wet sheen in the hollows. Full colour: not tinted. |
| `rock.basalt.pillow` | Seen from above, a field of basalt pillow lavas: rounded black-grey pillows 40 to 90 cm across (#2a2a2c, #3a3836), each with a glassy darker rind cracked in radial joints and a thin brown palagonite skin (#6a4a2c) in the seams between pillows, small white barnacle and shell crusts in a few seams. Full colour: not tinted. |
| `mineral.curtain` | A thin mineral membrane seen face-on, as from a chemical garden: a glossy black-green film of iron-nickel sulphide and green rust (#141c16, #22302a, #3a5240) with fine vertical ribs and wavy growth lines, small blistered bubbles, and a few rust-orange spots (#9a5a2a) where it has oxidised; the upper edge of the tile pale green (#9ab88a) and fleshy, as a living hem. Full colour: not tinted. |
