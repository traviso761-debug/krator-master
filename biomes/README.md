# Biomes

The home tree of every Krator biome kit. Each kit is one self-contained flora (and fauna)
system on the shared biome core (`core/biome/`, read through `CORE_BIOME` in each kit's
`build.py`; `BIOME-API.md` inside each kit), with `src/` fragments,
`build.py` (concatenates them into `dist/<name>.html` and syntax-checks), `verify.py`
(headless Chromium: error panel, probe invariants, screenshots), `NOTES.md` and
`KNOWN_ISSUES.md`. `krator-biome-<name>.zip` is the same kit, packed.

| kit | what |
|-----|------|
| `hyperjungle/` | the central hyperjungle, the core's origin: six hypertree species, understorey, epiphyte gardens, fauna |
| `eastabyss/` | the eastern abyss: salt lake, flats and marsh, coal-swamp abyssal jungle, the shelf, mat reed beds |
| `sedesert/` | the eastern high desert: red desert with Socotran flora, mesas, hoodoos, a river canyon ending in a cataract over the Abyss, fauna |
| `rift/` | the Rift: an algal salt lake, abyssal jungle, a benched ridge of mesas (cloud forest, Mediterranean crest), abyssal savannah |
| `swbay/` | the southwest bay: bay hyperjungle, rainforest, parasol savannah, the volcano, stepped cataracts, a ruined jetty, fauna |
| `swlowlands/` | the southwestern lowlands: sprawl oaks, an oak avenue, cork grove, crown-flowering trees, understorey |
| `xanadu/` | the East Rift Highlands: the Vale of Xanadu, an enclosed mountain lake and the sacred river from its chasm; ornamental wildwood (bonsai and topiary habits, agate wood, fairy rings, hornbeam arches, lotus trumpets), Hyrcanian flanks, Mediterranean uplands; the core's runtime LOD |
| `nwlowlands/` | the northwestern lowlands: lake shore, humid-subtropical tract, Mediterranean foothills, vertical Asian/Australian trees, bamboo groves, glow-willows |
| `ebadlands/` | the eastern badlands, from the abyss's east rim to the airless outer rim (BSh to EF): zoned by cold and wet first; sulphur flats and the hot waste with alien flora (ember crowns, sunspires, needle blooms, stilt pods), sagebrush and pinyon-juniper, painted badlands, Zion-like canyons and green valleys (cottonwood, maple, gambel oak, rose weepers, giant umbels), ponderosa and aspen, spruce-fir, krummholz and bristlecones, tundra; slotted into `openworld/little-demo` |
| `nhighlands/` | the northern highlands: the Inner Wall's NW flank, old-growth temperate forest rising to boreal (great spruces and cedars, the old wood, spire spruce, birch, a burn, krummholz), great trumpet trees and trumpet colonies, bell-bulbs and lantern pods that glow at night, a stream from its tarn with two falls, crag pillars; the core's `waterH`, `cold` and `rock` fields and harvest tags |
| `crater-drylands/` | the crater drylands in the Throne's rain shadow (~1.9 atm): a fire mosaic made by the kit's own fire model (fresh char, the bloom after a burn, regrowth, old scrub); prism mallees (the prism gum's small iridescent cousin, resprouting), pyre pillars, frill-trees that burst and seed the ash, long-trunked parasol pines and ghost gums, tree aloes, Joshua trees, pincushion trees, ember jade, sword spires; granite kopjes (the Scyvoi's refuges), dry washes, a seep; every tree drawn as the last fire left it |
| `throne/` | the Throne, the central volcano (`NOTES.md`): station 1, the plume's edge on the south-east shoulder. Lava flows of every age from the kit's own flow model, a rift of cinder cones, a pit crater's acid lake, hot pools and fumaroles, a lava tube's skylights; the shoulder's ash pines, frill-trees, trumpet trees and star aloes giving way under the plume to Krator's own life (pagoda caps, drizzle trumpets, bone bells, rope-trees, lamp caps, the mat); wild spice trees on the seam; it glows at night |

**One open world.** The kits are meant to be resident together and hand over at their borders.
`WORLD.md` has the regions and their neighbours, what blocks it today and the plan.

`FRUIT.md` gives one edible fruit for each fruiting plant the kits draw. Each is a catalog piece in
`kits/catalog/krator-master-furniture-generic-fruit.js`.

Build: `cd <kit> && python3 build.py`. Verify: `python3 verify.py dist/<kit>.html --assert --views "..."`.

Worlds that use a biome (`settlements/iziz/`, `settlements/screamers/`, `kits/ancients/`) carry their own vendored copies
of its fragments. Edit the kit here, then copy across; `iziz/build.py --vendor-check` reports drift.

**Merged buckets are baked indexed.** `BIO.bake` keeps one copy of each distinct vertex and draws by index
(`indexedGeo` in `core/biome/20-core-kit.js` and in each kit's own copy). The triangles and their order are unchanged, so the
picture is identical; tubes and surfaces take about half the GPU memory they did. Builders still write full
triangles as before.

## To do: frill-tree fins (the owner, 2026-10-06)

Replace every frill tree's frills with the owner's fractal frond (`card.frond.fractal`, three fronds across a landscape
sheet: the fronds fill 0.18..0.82 of its height) the next time each kit is passed over: the Rift's frill tree, carrot frill,
cloud frill and barrel frill (`rift/src/55-biome-rift-trees.js`, item 'frill'), and any kit that copies them. The Throne's
frill tree (`throne/src/55-biome-throne-trees.js`, B[17]) is the worked example: three fin materials cut from the sheet
(libCell), iridescent (teal to violet at grazing angles), on the leaf quad; longer and wider toward the top.

## To do (future, not started): a fauna kit

The owner's call (2026-10): all fauna goes to ONE fauna kit (create it if none exists; today fauna is drawn
inside each biome kit and inside some settlements), the way furniture went to `kits/catalog`. It takes each
biome kit's fauna, and the settlements' own creatures: Mav's Refuge's spiders, spider egg sacs and webs and
its other flyers (`settlements/mavs-refuge`, `KNOWN_ISSUES.md`), the flyers of Girder and the other worlds.
Tag every animal by biome (as the root `README.md` asks of flora and fauna) and place it as data, built by the
kit's own code. Not part of the 2026-10 furniture work.
