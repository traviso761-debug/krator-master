# Ys: material prompts (each one complete: paste it as it stands)

The textures the city still paints in code. Every block below is the whole prompt: the preface, the material and its
modifiers are already in it. Generate it, or find a scan that matches; drop the images in a folder and
`tools/textures/process.py` makes them seamless and writes the normal and roughness maps. Square 2048 px.

Under each prompt: the size one tile covers in the world, what it replaces in the code, and (for a tinted surface) the
colours the code will tint it to. Those are for you, not for the generator: do not paste them.

Already in the library and usable as they are: `rock.coral_stone_wall` (quays and moles), `rock.large_sandstone_blocks`
(a stand-in for the Arcades), `metal.rusty_metal_04/05` (the Bastion's rust panels), `concrete.*`, `ground.coast_sand_01`,
`ground.moss00*`, `leaf.forest_leaves_*`. The nacre pearl mosaic (`patterns/nacre/pearl-mosaic`) is in `core/materials/PLAN.md`.

## The Hykkousoi (the grown city)

### `shell.ribbed`

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Thick calcareous shell wall of a giant sea creature, matte chalky surface with fine parallel growth lines running across it and a stronger raised ridge every few lines, faint pitting and a few hairline cracks, slightly uneven like hand-built plaster. Keep the colours near-neutral pale grey-cream, slightly muted and even, so the texture can be tinted to different palettes without looking stained.
```

*one tile = 4 m; tinted by the code; replaces TEX.hkShell: the body of every pod, house and temple (also hkFloor, hkIn); tinted to shell cream #f3ece0, warm #e9d9c2, coral #e8a08c, sea teal #3e9c96, sea green #6aa892.*

### `organic.barnacle`

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: A dense colony of acorn barnacles grown wall to wall, each a small volcano-shaped cone of six grey-white plates with a dark slit at its top, cones of mixed sizes from fingernail to fist, packed and overlapping, with small gaps of bare rough stone between them. Keep the colours near-neutral pale grey-cream, slightly muted and even, so the texture can be tinted to different palettes without looking stained.
```

*one tile = 3 m; tinted by the code; replaces TEX.hkBarn: the poor houses, the Wet Cells; tinted to barnacle greys #cdc8bd, #b3aea3.*

### `organic.bone`

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Weathered whale bone surface, smooth ivory with long fine longitudinal grain, small scattered pores, faint darker growth bands and a few shallow cracks along the grain, polished where hands would touch. Keep the colours near-neutral pale grey-cream, slightly muted and even, so the texture can be tinted to different palettes without looking stained.
```

*one tile = 2 m; tinted by the code; replaces TEX.hkBone: the ribs, bridges, rails, stalks; tinted to ivory #f1e9d8, #e4dac6.*

### `shell.tideline`

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: The intertidal crust on a sea wall: dense black and blue-black mussel shells (#2a2622, #1f1c19, #333a44) packed together, scattered small white barnacles (#cdc8bd), thin strands of dark green weed (#3c5a3a) caught between them, a faint white salt bloom in patches.
```

*one tile = 3 m; full colour; replaces TEX.hkCrust: the band at the waterline on every host and pod.*

### `cloth.seaweed`

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Coarse hand-woven cloth made of dried seaweed and kelp fibre, a loose plain weave of flat ribbon-like strands of uneven width, slightly translucent, a few frayed ends and knots. Keep the colours near-neutral pale grey-cream, slightly muted and even, so the texture can be tinted to different palettes without looking stained.
```

*one tile = 2 m; tinted by the code; replaces TEX.hkWeed as cloth: awnings, slings, the dyer's hangings (must be neutral: the current map turns coral cloth to mud); tinted to teal, sea green, pale shell, murex purple #6a2a5a, coral.*

### `paving.shell.terrazzo`

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Polished floor of shell terrazzo: broken pieces of cream and white sea shell, mother-of-pearl flakes and small pale pebbles set in a smooth pale lime binder, ground flat and polished, a few worn hollows. Keep the colours near-neutral pale grey-cream, slightly muted and even, so the texture can be tinted to different palettes without looking stained.
```

*one tile = 3 m; tinted by the code; replaces hkFloor: every floor plate, landing and terrace; tinted to floor #d9cfbc, #cfc4b0.*

### `shell.nacre`

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Soft even lighting that shows the natural colour bands, no specular highlights. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Polished mother-of-pearl, cut nacre sheet, soft creamy white with flowing bands of pale pink, lavender, mint and silver-blue, fine wavy growth lines, slightly milky depth.
```

*one tile = 2 m; full colour; replaces hkNacre: rich and civic shells (the code adds the play of colour with the view).*

### `card.kelp`

```
A single sheet of nine separate pieces of the same kind, seen straight on, on a solid flat bright magenta (#ff00ff) background, flat even lighting, no shadows, no overlap, each piece fully visible and well separated with a clear margin of background around it, natural variation in size and shape. Square, 2048x2048. Pieces: Long ribbons of brown and olive kelp and green sea lettuce (#3c5a3a, #4a6a42, #5a5a2e), each a single ragged frond hanging straight down, wet and slightly translucent, some split into two or three tails. No magenta anywhere inside the pieces, and no soft glow, blur or halo at their edges: the background is cut out hard. Every piece hangs from its top edge, its attachment point at the top centre of its cell.
```

*pieces 1.2-3.4 m long; cutout card (magenta key, cut hard); replaces hkWeedCard: weed hanging at every tideline.*

## The karst (Krabi)

### `rock.limestone.karst`

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: A sheer tropical limestone cliff face: pale grey-cream limestone (#c9c2b2, #b5ad9c) streaked top to bottom with long vertical runnels of rust orange and tan (#b9773e, #9a6236) and black water stains (#3a3630), small solution pockets and flutes, a few tufts of green clinging in cracks. The streaks run straight down the image.
```

*one tile = 8 m; full colour; replaces the karst walls' vertex colour (ysGroundTint in 84-city-geo).*

### `ground.jungle.canopy`

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Dense tropical rainforest canopy seen from directly above: tightly packed rounded tree crowns of many greens (#2f5a24, #3f6e2c, #567f34, #24461d), small dark gaps of shadow between them, a few lighter yellow-green crowns, no ground visible.
```

*one tile = 20 m; full colour; replaces the karst crowns' vertex colour.*

### `card.vine.hanging`

```
A single sheet of nine separate pieces of the same kind, seen straight on, on a solid flat bright magenta (#ff00ff) background, flat even lighting, no shadows, no overlap, each piece fully visible and well separated with a clear margin of background around it, natural variation in size and shape. Square, 2048x2048. Pieces: Curtains of tropical vines and strangler-fig roots hanging down a cliff, each a narrow tangle of thin dark roots and leafy lianas with small glossy leaves (#2f5a24, #4a7a30), denser at the top, thinning to single strands at the bottom. No magenta anywhere inside the pieces, and no soft glow, blur or halo at their edges: the background is cut out hard. Every piece hangs from its top edge, its attachment point at the top centre of its cell.
```

*pieces 4-12 m long; cutout card (magenta key, cut hard); replaces the karst walls (the biome binds them later).*

### `card.jungle.clump`

```
A single sheet of nine separate pieces of the same kind, seen straight on, on a solid flat bright magenta (#ff00ff) background, flat even lighting, no shadows, no overlap, each piece fully visible and well separated with a clear margin of background around it, natural variation in size and shape. Square, 2048x2048. Pieces: Clumps of small tropical trees and shrubs that grow on limestone ledges, each a rounded mass of glossy leaves (#2f5a24, #3f6e2c, #567f34) on a few twisted pale trunks. No magenta anywhere inside the pieces, and no soft glow, blur or halo at their edges: the background is cut out hard. Every piece stands rooted at the bottom centre of its cell.
```

*pieces 3-6 m; cutout card (magenta key, cut hard); replaces the karst crowns' edges.*

## The new Ancient hosts

### `stone.travertine`

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Cladding of pale travertine slabs, each 1.2 by 0.6 m, laid in a running bond with thin tight joints; the stone cream-beige with fine horizontal banding and many small open pores and pits, a few slabs slightly darker or warmer than their neighbours. Keep the colours near-neutral pale grey-cream, slightly muted and even, so the texture can be tinted to different palettes without looking stained.
```

*one tile = 2.4 m (two slabs); tinted by the code; replaces the Bell Hall's skin (HBH_MAT, tinted concrete today); tinted to #d9cdb6, #cfc2a8.*

### `stone.sandstone.ashlar`

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Smooth-dressed warm sandstone ashlar in courses 0.6 m high, blocks 0.9 to 1.5 m long, thin recessed mortar joints, faint fine cross-bedding in the stone, gently weathered edges. Keep the colours near-neutral pale grey-cream, slightly muted and even, so the texture can be tinted to different palettes without looking stained.
```

*one tile = 2.4 m; tinted by the code; replaces the Arcades' skin (HAC_MAT); or use the library's rock.large_sandstone_blocks; tinted to sand beige #d6c3a2, #c9b38c.*

### `metal.bronze.verdigris`

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Weathered architectural bronze cladding panels, large flat sheets with thin seams and rows of rivets, the bronze brown-gold (#8a6a3a, #a07a44) going to pale verdigris green (#6f9a86, #8ab5a0) in streaks and blooms that run down from the seams, darker where water never reaches.
```

*one tile = 6 m; full colour; replaces the Facet's panels (HFA_MAT).*

## The ocean's rust (Oct 5 2026, Travis: "the ancient buildings here are quite rusty")

### `concrete.rust.streaked`

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Board-formed grey concrete of a tall ruined tower, seen face-on, weathered for centuries beside the sea: long rust streaks running straight down the face from rows of corroded fixings and rebar ends, orange-brown bleeding into dark brown, between them pale salt bloom and grey-green algae staining, small spalls where the concrete has broken off round rusting bars, hairline cracks, the board marks still faintly visible. The streaks run strictly vertical (down the image) so the tile can run up a wall. Keep the base concrete a muted mid grey and the rust a muted orange-brown, with no single streak so distinct that it would repeat visibly on a 300 m tower.
```

*one tile = 8 m (vertical streaks: tile across 8 m, up 8 m); not tinted; replaces the ruined concrete of the Monolith, the Warden and the stumps (`MAT.concreteR`), and the rust skin of the Conocylinder's stumps (`MAT.rust`).*

### `metal.rust.heavy`

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: Heavily corroded steel plate, decades in salt water and spray: flaking layers of orange, red-brown and near-black rust, blistered and scaled, pits and holes eaten through in places showing dark shadow beneath, lines of rusted rivets along a plate seam, a few barnacle clusters and white salt crust at the edges. Keep the rust muted and even in brightness so it reads at a distance as a dark red-brown surface rather than a bright orange one.
```

*one tile = 2 m; not tinted; the struts, legs, pipes and iron of the drowned Ancients (`MAT.pipeRust`, the Conocylinder's strut ring, the Capsule Stalks' tubes).*

## The Wet Cells' rock (Oct 5 2026, Travis: "bigger and more ominous")

### `rock.wet.dark`

```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material: dark wet sea rock at the tide line, near-black grey-green stone with a thin wet film that darkens it evenly (the wetness as colour, not as specular highlights), fine pitting and small pocks all over, a sparse crust of small grey barnacles and a few limpets in patches, thin streaks and smears of black-green algae running one way, pale salt rime caught in the crevices, hairline cracks. No large shapes: nothing wider than a tenth of the frame.
```

*one tile = 4 m (hykSurf's tile; vertical streaks run up); not tinted; the Wet Cells' rock and cones (`hkBarn` there) and
any other barnacle rock that should read dark and wet (the drowned moles' tide crust, `hkCrust`, could take it darkened).
Process it with `tools/textures/process.py` like the other sets (albedo, normal from the albedo, roughness high and flat:
the wet look comes from the colour, so keep roughness ~.7 or the specular hook will make it a mirror).*
