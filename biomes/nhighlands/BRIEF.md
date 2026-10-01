# Brief: the Northern Highlands biome kit (`biomes/nhighlands/`)

For Codex. Build a new biome kit on the shared biome core: the northern and
northwestern highlands of the Inner Wall. Old-growth temperate forest low down,
boreal forest high up, a stream down the middle, and one ruined Girder tower to
hang flora from. Artifact title: **Krator Northern Highlands**. Output
`dist/nhighlands.html`.

Before writing code, read these in this order:
1. `CLAUDE.md` (token rules: never open `dist/`, read big fragments by section).
2. `README.md` (tags, inspector, polygon tool, standard skybox).
3. `biomes/README.md`, then `biomes/xanadu/BIOME-API.md`, `NOTES.md` and `KNOWN_ISSUES.md`.
4. `biomes/rift/NOTES.md` (the trumpet tree, the cloud forest, the lessons list).
5. `biomes/nwlowlands/NOTES.md` (the lowlands this biome looks down on, and the glow-willow lanterns).
6. `painting-to-3d-world/SKILL.md` inside `painting-to-3d-world.skill` (a zip).
7. The reference board in `refs/` (below). Look at `refs/sheet0..3.jpg` first, then open single images as you need them.

## 1. The place

The Inner Wall is the mountain ring round Krator's central crater. This kit is its
outer flank in the north and northwest: the ground climbs from the edge of the
northwestern lowlands up toward the range's crest. The map has one axis. It runs
from the low NW corner up to the high SE corner.

- **Low (NW):** temperate old-growth rainforest. Use the Pacific Northwest (Hoh,
  redwoods), the Black Forest and the primeval forests of Eastern Europe as models.
  Giant trees and great closed canopies. Moss and ferns on everything.
- **Middle:** mixed montane forest. Fir and spruce analogues mixed with
  beech-like broadleaves, plus gnarled old woods on rocky spurs and boulder
  fields (Wistman's Wood, Fangorn).
- **High (SE):** boreal forest. Use Scandinavian taiga and the woods north of
  the Wall as models. Spire conifers, birch and larch stands, lichen and moss
  floor, blue mist. The coldest corner has snow patches and stunted,
  wind-shaped trees, but it is still forest. There is no bare alpine summit on
  the map; the summits are in the sky.

**Mood:** ancient, sometimes gnarled, never hostile. Fog or mist is usually
present. Light comes through in shafts (refs 06, 13). The player should feel
small under the trees, but welcome there.

**Palette:** the scene is green. Use every green from chartreuse moss
to bottle-green and blue-green conifer. **Dark blues and dark purples seep in
occasionally, in the understory only:**
- black-violet grass (44)
- smoke-bush purple (11)
- dark spurge (12)
- purple millet spikes (15)
- blue-teal aroid leaves (07)
- bluebell carpets in the glades (24)
- the purple-and-green painted understory (01)

These colours cover no more than about 15% of the floor, in patches, and never
reach the canopy. The bark carries the cool notes: blue-grey beech (18), teal
plated bark (30), blue-and-rust flaking bark (09), and white birch (38, 39).

**The alien touches (consult `refs/25-alienflora.jpg`):** most of what the
player sees should read as an Earth forest. Every so often something should
not:

| alienflora panel | what it becomes here |
|---|---|
| top-left: fringed, ribbed funnels on twisted mossy trunks | **the great trumpet tree** (below) |
| top-middle: lacy, fractal bright-green fronds | **lace fern**: an understory fern with a recursive frond (2–3 levels of branching), brighter than the terrestrial ferns |
| top-right: clusters of pale bulbs hanging on threads from mossy boughs | **bell-bulb epiphytes**: these glow faintly at night (below) |
| bottom-left: pleated round fans on red stems, by water | **red-stem fan**: a riparian understory plant, a cluster of pleated round fans on dark red petioles |
| bottom-right: golden discs on tall thin stalks | **disc stalks**: clumps of slender stalks topped with flat ribbed discs. Use them in glades and on stream gravel. Gold, shading to amber in the boreal band |

Ref 05 (purple lantern pods with droplets) is a second glowing epiphyte: violet
pods that hang from understory branches and trumpet rims. Ref 20 (a zebra-striped
rosette) is permitted as one rare understory rosette.

## 2. The trumpet trees

The Rift's trumpet tree (`biomes/rift/src/55-biome-rift-trees.js`, builder
`B[3]`; species record `/*3*/` in `50-biome-rift-species.js`) is a slim ribbed
stalk under one wide ribbed funnel, 12–26 m tall. Here it takes a larger, more
gnarled, older form, and it makes up **a significant part of the understory**.

- **Great trumpet** (`greattrumpet`, a canopy-layer tree, 30–50 m). It has a
  short, massive, twisted bole, buttressed and mossy, that forks low into 3–7
  writhing limbs. Each limb ends in a ribbed funnel 4–9 m across. Each funnel
  has a fringed or frilled rim (the alienflora top-left panel: a ring of fine
  fins round the lip), tilted up and slightly outward. Some funnels are dead
  and broken, as open rings. Moss mats and bell-bulbs hang under the funnels.
  Colour: a mossy olive-green stalk, a pale yellow-green funnel inside with a
  teal-green rim, and violet in the throat.
- **Understory trumpet** (`trumpet`, 4–14 m). It is the Rift form made gnarled:
  a leaning or kinked stalk, sometimes 2–3 stems from one foot, with one funnel
  each. It grows in **colonies of 5–30** under the canopy and along the
  stream. Of all the biome's understory plants, it is the one that should catch
  the eye.
- **Boreal trumpet** (`frosttrumpet`, 3–8 m). It is squat and thick-walled,
  with a narrow funnel and a blue-grey bloom on the rim. It thins out toward
  the SE and disappears before the snow line.

Implementation: **copy** the Rift's lathe-and-ribs code into this kit, with a
comment saying where it came from. Do not import it: the biome must stay
self-contained. Build the gnarled bole and limbs with the Rift's polyline
helpers ("polyline helpers (Girder's)" in the same file). Build the rim fringe
with an instanced fin item in the style of the Rift's `frill`. Follow the Rift
lessons: at least 3 lathe segments per rib, and close the cup's floor so a
funnel is never an open pipe when seen from above.

## 3. The terrestrial flora (by band)

The builders are by **habit**, as in nwlowlands, not one per species. Heights
are about 1.3x their Earth kin, and the giants go higher still. Use roughly
22–30 tree species in all, plus floor plants. Suggested set, to be reshaped as
the references dictate:

- **Temperate low band:**
  - redwood / Sitka spruce analogues (60–95 m), with clean columns and red to teal plated bark (refs 21, 26, 30)
  - Douglas-fir / hemlock analogues
  - bigleaf-maple analogues draped in hanging moss (37)
  - Black Forest silver fir
  - great beech with blue-grey bark (18)
  - great trumpets
  - buttressed giants in the fog (19, 42)
- **Old wood:** gnarled oak and laurel analogues, low and twisted, mossed to
  the tips, on boulder fields (04, 10, 13, 32, 33, 34, 36).
- **Montane mix:** Norway spruce, fir, beech, sycamore-maple; birch on
  disturbed ground.
- **Boreal:**
  - spire spruce and fir, narrow and dark (22, 40)
  - larch
  - birch stands (38, 39)
  - Scots pine on crags and rock pillars (08)
  - an old burn patch: standing dead boles over red fireweed (14, 23)
  - near the top, snow-laden spruce (41) and krummholz
- **Riparian corridor** (the whole length of the stream): alder and willow
  analogues, mossy boulders (31), red-stem fans, understory trumpets, lace
  ferns, disc stalks on the gravel bars, and the most bell-bulbs of anywhere.
- **Floor:**
  - moss everywhere, in sheets, on boulders and on logs (27, 31, 34)
  - sword ferns, bracken, lady ferns
  - wood sorrel
  - bluebells (24)
  - heath and bilberry in the boreal band (16)
  - the dark accent plants listed above
  - fallen giants and nurse logs with saplings on them
  - a mountain cane (a hardy *Fargesia*-like clumping bamboo, refs 28, 35) in small patches in the temperate band only

  Refs 03 and 28 are for the mist and the layered hills, not for bamboo groves.

**Tags** (project rule, `README.md`): every species record carries
`tags:{climate:'temperate'|'cold', aridity:'humid'|'subhumid', abyssal:false,
riparian:'yes'|'no'|'both', harvest:{...}}`. No earlier biome has added the
harvest tag, so this kit sets the pattern. Use:

```
harvest:{wood:'timber'|'fuel'|'none', edible:[parts], medicinal:bool, notes:''}
```

Examples: bilberry fruit is edible, the boreal trumpet's sap is edible, and
the bell-bulbs are not edible. Document the schema in `BIOME-API.md` so later
kits copy it.

## 4. Night glow

The bell-bulbs and the lantern pods **glow faintly at night**. No biome kit has
day and night yet, so add the smallest version that shows it working:

- The host gets a **Night** toggle (a key and a button). It lowers the sun and
  the hemisphere light to moonlight, darkens the fog and the dome, and keeps
  the gas giant's night side lit the way the sky shader already does
  (`uNightC`).
- The biome exports `NHL.setNight(k)` (0..1). It raises the glow materials'
  emissive. In daylight the glow is barely visible; at night it is the main
  light in the understory.
- Use **pale warm amber** for the bell-bulbs and **violet** for the pods.
- Read the nwlowlands lantern lesson before starting: an additive halo at full
  strength reads as fog. Keep halos small and dim, only on a subset of the
  bulbs, and only at night.
- Add preset views **"Night: the stream"** and **"Night: the tower"**.

## 5. Mist

Mist is part of the look; it is not an effect added at the end.

- Scene fog that thickens with the `mist` field and with altitude.
- **Mist sheets:** large, low, noise-alpha planes with `depthWrite:false` that
  lie in the hollows and over the stream, and drift with the wind tick.
- Distant ridges fade into blue-grey layers, as in refs 03, 22 and 40.
- Ref 06 (dark trunks against an amber fog) is the target for one preset view
  ("Morning fog"), with low sun from behind the trunks.

Keep the cost low: tens of sheets, not thousands.

## 6. The map (the ideal type, `45-host-stage.js`)

- About **6.4 km square**. The axis `s` runs NW → SE. Relative height goes from
  about 0 m at the NW edge to about **+1300 m** at the SE corner.
- The country is mountainous:
  - spurs and side valleys run down to the NW
  - crags and a few rock pillars stand in the middle and upper bands, with pines on top (ref 08)
  - boulder fields lie under the crags
  - one bench or shelf in the middle band holds the old wood
- **The stream** starts at a spring or small tarn in the boreal band, near the
  SE. It runs down a side valley through every band and leaves the map at the
  NW edge. It has cascades, a waterfall over one crag step, plunge pools and
  gravel bars. The water must descend, so use the sedesert core's
  `waterH(x,z)` and `BIO.depth` (see section 8). Build the bed as the xanadu
  lesson says: monotone, built from the terrain along the line, then clamped so
  it never rises. Make the water clear and dark, tea-brown over stones in the
  pools, white at the cascades. The riparian corridor is about 30–80 m wide. It
  must read as a lusher, distinct strip. That contrast is the point of the
  stream.
- **Fields** (the climate, see the API):
  - `wet`: high everywhere, highest in the corridor and on the NW-facing slopes
  - `salt`: 0
  - `upland`: altitude, 0..1
  - `flow`: the stream's banks
  - `mist`: hollows, the corridor, and the upper slopes
  - **`cold`**: new, 0 temperate .. 1 boreal

  Define `cold` from altitude plus aspect. North- and NE-facing slopes run
  colder, so the boreal band comes down lower in the side valleys. Use it as
  the temperate/boreal switch. Add it to `BIO.fieldDefault` as 0 (an additive
  change: an older biome on this core ignores it).
- Zones derived from the fields:

  | zone | where |
  |---|---|
  | `temperate` | `cold` < .35 |
  | `montane` | .35–.65 |
  | `boreal` | > .65 |
  | `oldwood` | rocky, mid-band |
  | `riparian` | high `flow` |
  | `crag` | the mask's cliffs, with a sparse pine fringe on the lips |

  Make band edges ragged and interleaved, never straight lines.

## 7. The sky (`82-host-sky.js`)

Use the **standard Krator skybox**: the gas giant to the NE and the sun to the
WNW (both canon). Copy the dome painter from `biomes/nwlowlands/src/82-host-sky.js`
and turn it around:

- **NW: the northwestern lowlands, visible in the distance.** From the upper
  slopes the ground should fall away to the NW onto a wide, hazed lowland:
  - the green-gold plain
  - the jade lake
  - the Outer Wall low and pale on the horizon, at about 3°

  The Rift lesson: a painted dome cannot stand in front of real geometry. So
  build the near part of this view as a **host-only far-terrain skirt**: a
  coarse, vertex-coloured, fogged mesh running from the map edge out to about
  20–30 km, descending onto the lowland plain, with a flat lake plane.
  Paint only what lies beyond it on the dome. Match the nwlowlands kit's
  colours, so the two kits read as the same country.
- **SE: the Inner Wall goes on climbing.** Paint snow-capped peaks, high and
  near (about 15–22°), above the boreal crest.
- **NE and SW:** the range's flank continues in receding blue ridges.

## 8. The core

Start from the **xanadu core** (`biomes/xanadu/src/10..40`, `BIO.version`
`xanadu-1`), the newest, which has the runtime LOD. It does not have the
descending-water API: port `waterH` / `BIO.depth`, the depth-based default mask
and the `depth` window on `BIO.grid` from `biomes/sedesert/src/10-core-head.js`
and `40-core-place.js`. Add `cold` to `fieldDefault`. Set `BIO.version` to
`nhighlands-1`. Write every core change into this kit's `BIOME-API.md` as an
additive change. A Rift, xanadu or sedesert fragment must still run unchanged
on this core. Do not edit the other kits' cores.

Fragments: `00-head`, `10..40 core`, `45-host-stage`,
`50-biome-nhighlands-species`, `55-...-trees`, `60-...-floor`, `65-...-dress`,
`70-biome-nhighlands`, `82-host-sky`, `85-host-tower`, `88-host-build`,
`90-host-camera`, `91-host-probe`, `99-tail`. Split any fragment that grows past
about 60 KB. The biome's object is `NHL`. Its exports follow the Rift's:
`NHL.build`, `NHL.dress`, `NHL.canopyH`, `NHL.SPECIES`, `NHL.PAL`, `NHL.zones`,
and add `NHL.setNight`. Keep build.py's forbidden-name grep.

## 9. The Girder tower and the hanging flora (`85-host-tower.js`, `65-...-dress.js`)

Copy the ruined Girder tower from `biomes/rift/src/85-host-tower.js`. Place it in
the temperate band, on a bench about 100–150 m from the stream, so that one
preset view shows both of them. The tower is a test structure for `NHL.dress()`,
and the dress pass is the **hanging flora demo**:

- Slab soffits and girders carry curtains of hanging moss (Hoh style, ref 37),
  beard lichen, strings of bell-bulbs and lantern pods, and trailing vines,
  graded by length.
- Ledges carry moss mats, ferns, lace ferns and understory-trumpet saplings.
- Walls carry moss and climbing growth.
- The upper storeys run colder: beard lichen replaces moss. This shows the
  cold gradient on one object.
- At night the tower is hung with glow. That gives the second night preset.

## 10. Dev tools

- **Inspector.** Keep the biome camera's inspector. On hover it shows species,
  class (flora), and tags, including `harvest`.
- **Polygon tool.** Add it. The biome kits do not have one yet. Port it from
  `settlements/screamers/src/93-polytool.js`.

## 11. Budget and verification

- **Budget:** the scene draws no more than about 15M triangles at any preset
  view and stays under about 450 draw calls (the xanadu kit's envelope). Use
  `BIO.range` and `BIO.owner` for every pass, and give every hero tree a
  stand-in. Stocking is set by counts; the budget knob does not set it (the
  nwlowlands lesson). The great trumpets and the giant conifers are the
  weight: the canopy layer gets heroes near the spine and impostors elsewhere.
- **Preset views** (find the close views in the built scene, never by
  hard-coded coordinates):
  - Overview from the SE crest looking NW over the lowlands
  - The stream (riparian)
  - The waterfall
  - The tower
  - Up the tower (soffits)
  - Old wood
  - Great trumpet
  - Trumpet colony
  - Temperate cathedral (looking up, giant boles)
  - Boreal band
  - The burn
  - Treeline and snow
  - Morning fog
  - Night: the stream
  - Night: the tower
- **`verify.py --assert`** must check all of the following:
  - no error panel
  - every species placed at least once
  - the probe finds a great trumpet, an understory trumpet colony, a bell-bulb and a lantern pod
  - the stream descends monotonically
  - no riparian plant stands in water deeper than its `depth` window
  - nothing roots on cliffs
  - the tower carries hanging items under its soffits
  - `setNight(1)` raises the glow materials' emissive
  - the triangle and draw-call budget
- **Determinism:** the build is deterministic. Record a `baseline.json`.

## 12. Deliverables

- [ ] `biomes/nhighlands/`: `src/`, `build.py`, `verify.py`, `go.sh`, `pack.sh`, `BIOME-API.md`, `NOTES.md` (with a "Lessons this build cost" section), `KNOWN_ISSUES.md`, and `INDEX.md` (`python3 tools/make_index.py`).
- [ ] A section in `NOTES.md` mapping refs to choices, as nwlowlands does.
- [ ] `biomes/krator-biome-nhighlands.zip` (`pack.sh`).
- [ ] A row in `biomes/README.md`. Regenerate the root `INDEX.md`.
- [ ] Screenshots of the preset views in the PR. Take one per meaningful change, not one per tweak.
- [ ] When it reaches `main`: add it to the gallery's `ENTRIES`, rebuild, republish (`gallery/README.md`), and add lessons to the skill file (`README.md`, "Where things are").

Out of scope: fauna (leave a stub, like the other kits) and porting into a
settlement.

## Reference board (`refs/`, numbered in the order of the user's zip)

**Weigh most heavily:**
- the alienflora panel (25)
- the mossy old growth: 04, 10, 13, 17, 21, 26, 27, 29, 31, 32, 33, 34, 36, 37
- the dark understory accents: 01, 07, 11, 12, 15, 24, 44
- the mist: 03, 06, 22, 40, 42
- the bark: 09, 18, 30
- the boreal band: 14, 22, 23, 38, 39, 40, 41
- the stream: 02, 31
- the crag: 08
- the glow: 05

**Use lightly:**
- 28 and 35 (cane, small patches only)
- 19 and 42 (buttressed giants, mist)
- 20 (one rare rosette)
- 16 (the heath palette)
- 36 (the moss avenue, for the floor)
- 43 (the white-boles avenue) is a nwlowlands image; use it only to match the lowland colours in the far skirt

| # | file | | # | file |
|---|---|---|---|---|
| 01 | painted-purple-understory | | 23 | burnt-boles-red-floor |
| 02 | stream-reflection | | 24 | bluebell-beechwood |
| 03 | mist-pond-hills | | 25 | **alienflora** |
| 04 | gnarled-fog-laurel | | 26 | oldgrowth-mossy-giant |
| 05 | purple-lantern-pods | | 27 | misty-spruce-mossfloor |
| 06 | amber-fog-trunks | | 28 | bamboo-watercolour |
| 07 | blue-teal-aroids | | 29 | moss-cathedral-trunks |
| 08 | crag-pillar-pines | | 30 | plated-teal-bark |
| 09 | blue-rust-bark | | 31 | mossy-boulder-stream |
| 10 | fern-path-gnarled | | 32 | gnarled-oak-misty-valley |
| 11 | purple-smokebush | | 33 | twisted-fog-path |
| 12 | dark-spurge | | 34 | wistmans-wood-boulders |
| 13 | gnarled-sunlit-ferns | | 35 | striped-cane |
| 14 | dark-pines-straw | | 36 | moss-avenue-stylised |
| 15 | purple-millet | | 37 | hoh-moss-drapes |
| 16 | moss-heath-rockgarden | | 38 | birch-lilies |
| 17 | oldgrowth-conifer-understory | | 39 | birch-grove |
| 18 | blue-grey-beech | | 40 | misty-conifer-slopes |
| 19 | buttress-giant-fog | | 41 | snow-spruce-night |
| 20 | zebra-rosette | | 42 | misty-canopy-emergents |
| 21 | redwoods-ferns | | 43 | white-boles-avenue |
| 22 | blue-mist-conifers | | 44 | black-mondo-grass |
