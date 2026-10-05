# ChatGPT prompts: Iziz, Beast Riders, hyperjungle foliage and fauna (2026-10-05)

**Ready to paste: `PROMPTS-ready.md`** (every prompt expanded with its prefix and tint sentences, one code block each).
This file is the source it is generated from.

Companion to `PLAN.md` ("Prompts for generated sources"). Write the exact prompt you used into the batch file's
`_source.prompt` for every image. Process with `tools/textures/process.py` (surfaces and patterns) or
`tools/textures/cards.py` (cut-outs).

Colours are the code's (`settlements/girder/src/05-palette.js`, `biomes/hyperjungle`, `69b-vern-mat.js`).

## Prefixes (paste one at the start of each prompt)

**T (surface):**
```
Seamless tileable texture, square, 2048x2048. Orthographic top-down view, perfectly flat surface filling the whole frame edge to edge. Flat, even, shadowless lighting, as if scanned: no highlights, no vignette, no shading gradient across the image. No perspective, no objects, no text, no border, no watermark. The left edge must continue into the right edge and the top into the bottom. Material:
```
**M (add at the end of a tintable surface):** `Keep colours natural but slightly muted and even, so the texture can be tinted to different palettes without looking stained.`

**N (add at the end of a neutral surface for Iziz):** `Near-colourless: pale grey only, so it can be tinted.`

**P (pattern: replace "perfectly flat surface" in T with this):** `a flat, front-on decorative panel`

**C (leaf, flower or wing cut-out):**
```
Cut-out on a solid flat bright magenta (#ff00ff) background (no magenta anywhere in the subject), square, 2048x2048, viewed straight from above, flat even shadowless lighting, no cast shadow, no stem or branch beyond the cluster, the subject filling the middle 70% of the frame, every piece fully visible and well separated. Subject:
```
(Alpha PNG also works and is better if your tool gives it: "on a fully transparent background, PNG with alpha".)

---

## 1. Iziz

Iziz colours everything by tint, so the base surfaces are **T + line + M + N**. Give each as a grey, matte, scan-like surface.

| id | Line |
|---|---|
| `stone.cut` (neutral) | Dressed sandstone ashlar wall: rectangular blocks in even courses, about 0.5 m by 0.3 m, with thin crisp mortar joints, fine tool marks on the faces, small chips at the arrises, faint weathering streaks, a few blocks slightly paler or darker. |
| `plaster` (neutral) | Lime plaster render over rubble: smooth chalky finish with soft trowel sweeps, hairline cracks, a few patched repairs in a slightly different finish, small flaking areas showing the coarser coat beneath, faint water streaks. |
| `brick` (neutral) | Fired clay brick wall in running bond, bricks about 22 by 7 cm, slightly irregular edges and sizes, pale lime mortar joints, a few over-fired darker bricks and chipped corners, light efflorescence. |
| `metal.corrugated` (neutral) | Corrugated sheet-metal roofing seen from above, ribs running vertically, about 7 cm pitch, overlapped sheets with a visible lap seam and round-head fixings along the ribs, dents, scratches and light rust bleeding from the fixings. |
| `roof.tile` (neutral) | Curved clay roof tiles in overlapping courses (Spanish barrel tiles: alternating concave and convex rows), slightly irregular, chipped edges, light lichen staining in a few tiles. |
| `metal.iron` | Wrought and cast iron plate for gates, grilles and bands: dark graphite grey with worn lighter highlights, hammer facets, small pits, a thin brown rust film in the hollows, a row of rivets. Neutral, so it can be tinted. |
| `metal.bronze` | Cast bronze sheet with a green-brown patina: warm bronze showing through at the raised edges, verdigris in the recesses, fine casting pits, a hairline seam and a few rivets. Full colour. |
| `metal.gold` | Hammered gold leaf over a metal plate for trim: warm gold (#d0a53c) with small hammer facets and faint scratches, darker (#8a6a2a) in the recesses, brighter (#e4c46a) on the raised edges, tiny worn spots showing brown beneath. Full colour. |

Reasons for regenerating (only if you judge them poor in the demo kit):

| id | Prompt addition |
|---|---|
| `patterns/iziz/gilt` | Use **P**: "gilt work: hammered gold leaf (#d0a53c, darker #8a6a2a in the recesses and #e4c46a on the raised edges) laid over dark brown (#5a4632) timber, in a repeating ornament of a row of small round bosses between double fillets, with a ring-and-cross rosette motif between them. Slightly worn so the brown shows at the edges. The pattern repeats horizontally." Ask for the bosses to be raised and the border to be parallel to the top and bottom edges. |
| `patterns/iziz/banner` | Use **P**: "banner cloth woven in orange (#e07a2a) with a cream (#f1dba6) ring-and-bar device framed by a deep red (#9c2d2d) line, teal (#2f8f8a) stripes at the top and bottom of each cell, visible plain weave, faded uneven dye. Repeats in both directions, half-drop grid." |

---

## 2. Beast Riders: surfaces (Girder, Mav's Refuge)

Colours are full (no M) unless the row says "tint".

| id | Prompt (after T, or P for patterns) |
|---|---|
| `wood.mahogany` | Polished hyper-mahogany for court furniture: dense, close straight grain with a faint ribbon figure, deep red-brown (#6a2a1e) shading to near-black (#44190f) in the grain lines and warmer (#8a4030) in the lighter ribbons, a hand-rubbed oil finish with a soft satin sheen, a few tiny pores and hairline checks. |
| `wood.lamppost` | Weathered hardwood post about 20 cm square, seen from the side: vertical grain, deep checks along the length, tar-dark brown (#4a3624) with a silvered lighter weathered surface in places, a few old lashing grooves and nail holes, darker at the base from damp. (The grain runs vertically; repeats vertically.) |
| `metal.iron.pitted` | Hand-forged wrought iron for pots, hinges and brackets: dark (#2a2620) with grey (#6a655a) worn highlights, tiny pits, hammer facets, a thin rust-brown film (#4a4038) in the hollows, a few scale flakes. Neutral, so it can be tinted. |
| `bone.skull` | Surface of a very large animal skull used for crests and skullpoles: ivory (#e8e0cc) bone with fine branching suture lines between plates, small foramen pits, a rough brow ridge, stained umber (#c8b898) in the hollows, weathered chalky patches, a few old hairline cracks. |
| `bone.horn` | Polished animal horn plate: smooth, slightly translucent honey-brown (#a8803c) fading to dark umber (#3a2a1c) along curved growth bands, fine longitudinal fibres, small cracks near the base, a warm waxy sheen. |
| `bone.antler` | Weathered antler surface, pale grey-brown (#c8b898) with long raised vertical ridges and rounded nodules, darker stained grooves (#7a6648), a few hairline cracks. |
| `hide.pelt.cat` | Tanned big-cat pelt seen from above: short dense fur lying in one direction, warm tawny base (#b89050) with dark rosette spots ringed in rust (#7a4a2a) and black centres, paler belly fur along one edge, a few worn bald patches. Muted, so it can be tinted. |
| `hide.rawhide` | Stretched rawhide seen straight on: taut, slightly translucent cream-amber skin (#c9a86a) with a mottled darker spine line down the middle, fine hair roots, evenly spaced lacing holes along the edges with twisted sinew (#a8966a), a few small tears. |
| `fibre.basket.coiled` | Coiled basketry: a continuous bundle of grass wrapped in flat split palm strips and stitched in a tight spiral of parallel rows, honey (#c4a878) and dark brown (#6e5238) strips alternating in a stepped zigzag, visible stitches, a few loose fibres. |
| `fibre.net` | Fishing and hunting net of knotted twisted hemp (#a8966a) cord, a regular square mesh with visible knots at every crossing, slightly uneven, a few broken strands. **Use the C prefix** so the openings can be cut out. |
| `fibre.mat.floor` | Woven floor mat of flat reed strips in a twill weave, strips about 2 cm wide in two shades of straw (#c4a870, #a88a5e) forming diagonal ribs, darker worn walkways, a few broken reeds. |
| `cloth.silk` | Court silk hanging: very fine plain weave in white (#e8ecec) and pale grey (#d8dede) stripes, a soft sheen that shifts with the weave direction, tiny slubs, a few gentle fold creases. Neutral, so it can be tinted. |
| `lantern.horn` | Glowing lantern panel seen from the front: a flat plate of thin scraped horn, warm honey (#ffb347 lit from within, bright centre, darker rim), fine long fibres and faint cloudy bands, a few tiny cracks, thin dark timber framing it at the edges. (Single panel, not tiling.) |
| `lantern.paper` | Oiled paper lantern panel, front-on: fibrous translucent paper in warm amber (#ffb347), visible long pulp fibres, a few small patched repairs, soft darker edges where glued to a timber frame, light soot at the top. (Single panel, not tiling.) |
| `wax.tallow` | Rendered animal tallow seen from above: matte creamy grey-white (#e0d8c0), slightly greasy, small air pits and soot-grey streaks near a central wick hollow, a thin crust cracking at the edges. |
| `organic.gourd` | Dried gourd rind, three finishes side by side as vertical strips: smooth waxy olive green (#8a9a4a), ochre (#b89040) with tan freckles, and rust (#b07a3a) with darker mottling; all with fine warts, faint longitudinal ribs and tiny scars. Muted, so it can be tinted. |
| `earth.floor.packed` | Interior packed-earth floor, seen from above: smooth hard-trodden brown clay (#8a6c48) with faint sweeping marks from brooms, small pebbles pressed flush, hairline drying cracks, darker greasy patches near a hearth. |

### Beast Rider patterns (use P; the repeat is stated in the line)

| id | Line |
|---|---|
| `bone-inlay` | A bone-inlay band on hyper-mahogany (#6a2a1e, grain visible): a horizontal strip with a central row of small bone-ivory (#e8e0cc, #c8b898) diamonds and claw-shaped hooks, bordered above and below by thin bone fillets, each piece cut separately with hair-thin dark joints, slightly proud of the wood, a few chips. Repeats horizontally. |
| `claw-tapestry` | A woven hanging: a claw-green (#3f7a3a) field with deeper moss (#2e5a2c) borders, a repeating motif of three parallel claw-pale (#e6dcc2) curved slashes in a half-drop grid, visible plain weave, faded uneven dye. Repeats in both directions. |
| `emblem` | The Beast Rider house emblem on cloth: a square with a claw-green (#3f7a3a) field, a moss (#2e5a2c) edge and an olive band inside it, and a claw-pale (#e6dcc2) device of a stylised three-toed claw mark inside a ring, slightly uneven, faded. One emblem centred; no text. |
| `totem` | A carved and painted skullpole, a tall vertical band three times higher than wide: weathered hardwood (#6a5038) carved in stacked tiers of a skull, a beak and a claw, painted in lacquer red (#8a2f2a), bone (#e8e0cc), black and a little verdigris (#2f6a5a), the paint cracked and flaking. Repeats vertically. |
| `pennant` | A row of prayer flags and swallow-tail pennants strung on a cord: flags in claw-green (#3f7a3a), rust (#8a5a2a), mustard (#c2a24e), plum (#4a3a6a) and wheat (#b0894a), each with a faint woodblock-printed claw mark in pale ink, edges frayed, on a plain pale sky background. Repeats horizontally. |
| `plaque` | A gallery plaque: a carved hardwood board (#6a5038) with a raised border and a central relief of a stylised claw and skull in gilt (#b08432) over lacquer red (#8a2f2a), worn at the edges to show wood, small verdigris (#2f6a5a) corner studs. One plaque centred; no text. |

---

## 3. Foliage (hyperjungle: Girder, Mav's Refuge, Iziz)

**Bark** (T + line + M; species colours are the tints in the code, so keep them muted):

| id | Line |
|---|---|
| `bark.mahogany` | Krator mahogany bark: flaky rectangular plates of dark red-brown bark (#5a3424 to #7a4630) in deep dark fissures, the plates curling slightly at their edges, rust-orange showing where plates have flaked. |
| `bark.ironbark` | Ironbark: deep dark furrows with red-brown highlights (#5a3424, #7a4630) and black cracks, braided and interlacing ridges running vertically. |
| `bark.baobab` | Baobab bark: smooth grey-brown (#8a7a66) wrinkled across the trunk like elephant skin, shallow horizontal folds, pitted patches, a few pale scars. |

**Leaf cards** (C prefix, one subject each; the result is processed by `cards.py`):

| id | Subject |
|---|---|
| `card.mahogany` | Nine pinnate compound mahogany leaves, each a long central rachis with 4 to 6 pairs of glossy elliptic leaflets, deep green (#3f6a2a to #567a30), pale midribs, a couple of leaflets damaged, arching in different directions. |
| `card.vine` | Six hanging jungle vines, each a thin dark woody stem (#3d3426) with heart-shaped leaves (#3d5a2a, #2f4a24, #4a6a30) alternating along it and a few curling tendrils. Hang vertically from a common top edge; anchor top. |
| `card.screwpine` | Three screwpine (pandanus) crowns seen from above: long stiff sword-shaped leaves in a tight spiral rosette, with fine serrated margins, olive green (#3f7a5a, #4a8a62), some leaf tips browned. |
| `card.bromeliad` | Four bromeliad rosettes seen from above: broad strap-shaped leaves with fine silver scale banding, overlapping in a tight cup, green (#4a8a4a) with a bronze flush (#8a6a3a), a hint of red at the centre. |
| `card.moss` | A single soft clump of moss cushion, dense short upright shoots in varied green (#4f6a2c, #5a7a30, #6a8a3a), a ragged edge. |
| `card.crop` | Nine long maize-like leaves (#5c8a3a, #7a9a3e, #4e7a32), arching in different directions with pale central ribs and slightly torn tips. |
| `card.flower.bloom` | Six canopy blooms for butterflies to visit: large trumpet-shaped flowers in orange (#e0862a), magenta and cream with darker throats, seen from the side and from above, each on a short stub. |

**Fruit and pod skins** (T + line + M):

| id | Line |
|---|---|
| `fruit.skin.orange` | Fruit rind of an orange orchard fruit: slightly bumpy skin in glowing orange (#e0862a) with fine pores, a few darker dimples, a hint of amber (#d06a20) toward one edge. |
| `fruit.skin.amber` | Smooth-skinned amber fruit: glossy skin in amber (#d06a20) shading to gold (#f0a040) with pale freckles, a few soft bruises, a faint waxy bloom. |
| `fruit.husk` | Husk of a baobab pod: thick velvety fur in grey-brown (#8a7a66) with short dense hairs lying one way, ridges, a few pale patches where it has rubbed away, tiny dry cracks. |
| `fruit.capsule` | Mahogany seed capsule: hard woody five-valved shell, grey-brown (#6a5038) with pale lenticels and fine longitudinal ridges, a rough dry surface. |

---

## 4. Fauna

### 4.1 The mounts (Girder and Mav's Refuge flyers: `settlements/girder/src/84-flyers.js`)

The flyers are vertex-coloured geometry today; these are the sheets they would be skinned with. Palette per
species (`PAL.beast`): quetzal body #c8b48a, membrane #8a5a3a, crest #d86a3a; bat fur #3a2e2a, membrane #5a4238, bone #8a6a5a;
archaeopteryx blue #2a4a7a, rust #b8683e, cream #e8d8a0; dragonfly teal #2f8a7a, blue #3a5a9a, wing #d8f0f0;
spider black #2a2622, red #7a2028, gold #c2a24e; millipede #4a2e22 and #b8683e.

All of these are **T + line (tileable, top-down)** except where marked **C** (cut-out).

| id | Line |
|---|---|
| `membrane.pterosaur` | Stretched pterosaur wing membrane seen from above: thin leathery skin in warm brown (#8a5a3a), fine radiating fibres (actinofibrils) running in one direction, a network of fine veins, translucent paler patches, tiny scars and a few healed tears. Muted, so it can be tinted. |
| `membrane.bat` | Bat wing membrane: thin, dark smoky brown (#5a4238) skin with branching veins, fine parallel elastic fibres, tiny tears and light freckling, slightly translucent. Muted, so it can be tinted. |
| `hide.fuzz.pterosaur` | Short dense pycnofibre fuzz of a pterosaur body: soft hair-like filaments lying one way, pale sand (#c8b48a) with darker tips (#8a5a3a), a few lighter strands. Muted, so it can be tinted. |
| `fur.bat` | Dense short bat fur, seen from above: fine soft hairs lying in one direction, dark brown (#3a2e2a) with warm lighter tips (#8a6a5a) and a few grey hairs. Muted, so it can be tinted. |
| `feather.archae` | **C.** Eight individual flight and contour feathers of a giant archaeopteryx, laid flat and apart: blue (#2a4a7a) vanes with rust (#b8683e) bars and cream (#e8d8a0) tips, fine barbs and a pale central shaft, a few frayed edges. Anchor at the feather's base. |
| `feather.quetzal-crest` | **C.** Six long crest feathers of a quetzalcoatlus: vivid orange-red (#d86a3a) shading to cream, tapered, with soft barbs, laid flat and apart. |
| `skin.scale.archae` | Small overlapping reptilian leg scales, rust (#b8683e) and cream, each scale slightly raised, natural variation. Muted, so it can be tinted. |
| `chitin.dragonfly` | Iridescent insect-body cuticle seen from above: smooth hard segments in teal (#2f8a7a) shading to blue (#3a5a9a), fine growth ridges, a waxy sheen with a subtle metallic shift, small pits at the segment edges. |
| `wing.dragonfly` | **C.** One giant dragonfly wing, a single wing, root at the left edge and tip at the right, leading edge along the top, seen from above and filling the frame: a clear glassy membrane (#d8f0f0) divided into hundreds of tiny cells by a net of dark-blue (#1c3a5a) veins, a thicker leading edge with a dark pterostigma spot near the tip, a faint iridescent tint. The same image is used for fore and hind wings, so keep the outline simple and elongated. |
| `chitin.spider` | Spider cuticle with bristles: glossy near-black (#2a2622) segments with fine growth ridges, short stiff hairs in rows, red (#7a2028) bands at the joints, small gold (#c2a24e) flecks. Muted, so it can be tinted. |
| `chitin.millipede` | Millipede segments seen from above: overlapping dark-brown (#4a2e22) rings with a smooth rim and a narrow band of orange-brown (#b8683e) at each joint, fine growth lines, tiny pores along the side. |
| `rider.saddle` | Saddle blanket: coarse hand-woven cloth in claw green (#3f7a3a) and rust (#8a5a2a) bands with small bone-white (#e6dcc2) claw marks and a fringed edge, visible weave, stained at the corners. **P**, repeats horizontally. |

### 4.2 The hyperjungle biome fauna (`biomes/hyperjungle/src/58-biome-hyperjungle-fauna.js`)

| id | Line |
|---|---|
| `fur.sloth` | Matted long fur of a tree sloth, seen from above: coarse grey-brown hair (#9a9e86, #a8987a) in loose clumps, with green algae staining (#6a7a4a) in the crevices, pale underfur showing through. Muted, so it can be tinted. |
| `hide.strider` | Hide of a long-legged grazing strider: short, fine, close-lying fur in buff (#a8987a) with a darker dorsal stripe (#6a5a44) fading into pale flanks, a few scars, a faint pelage pattern of soft spots. Muted, so it can be tinted. |
| `skin.sky-ray` | Underside skin of a broad-winged sky ray: smooth pale grey (#62666a) with faint darker vein-like marbling, a slightly leathery texture, fine ridges along the leading edge. Muted, so it can be tinted. |
| `wing.butterfly` | **C.** One butterfly wing of a hyperjungle butterfly, a single wing, the body root at the middle of the left edge and the wing opening to the right, filling the frame: a dark rim, veins in a lighter tone, two or three eye-spots, a soft dusting of scales, drawn in neutral grey (no hue) so it can be tinted per instance. |

---

## Notes

- **Order to run:** (1) the Iziz neutral set (7 prompts, unblocks Iziz); (2) the Beast Rider surfaces that already have
  catalog pieces (mahogany, horn, skull, pelt, gourd, basket); (3) the foliage cards and bark; (4) the mounts and fauna.
- **Fauna is a decision, not a gap.** The flyers and herds are vertex-coloured meshes today; those sheets have no UVs.
  The 4.1 and 4.2 sets are only worth generating if you add UVs or use the sheets as detail maps (a tinted fur or
  membrane texture sampled in object space). Ask before spending the generations.
- **Neutral rows** need the processing step `--neutral` after the usual `process.py` run.

## Where the fauna sheets plug in (2026-10-05)

Hooks exist; nothing changes until a build supplies a sheet.
- **Biome fauna** (`biomes/hyperjungle/src/58-biome-hyperjungle-fauna.js`, copied into Iziz): set `HYPERJUNGLE.FAUNATEX = {wing, fur, hide, ray}`
  (THREE.Texture or image URL) before the fragment. `wing` replaces the procedural butterfly wing (one wing, alpha, root at the left edge);
  `fur` is the sloth, `hide` the striders, `ray` the sky rays (UVs repeat twice per part). The dart/flitter wings are not textured.
- **Dragonfly wings** (`settlements/girder|mavs-refuge/src/84-flyers.js`): set `FLYTEX = {wing}` before the fragment. One alpha wing, root left,
  leading edge up, stretched over each of the four wings' bounding boxes; the hand-built vein quads are skipped when it is set.
- Not done: `pack.py` / `materials.json` do not yet pack these into `tex/` or set the globals. The mount bodies (membranes, fur, feathers, chitin) need the shader mapping.
