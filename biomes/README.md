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
| `shighlands/` | the southern highlands, the spiral biome: the Inner Wall's flank above the hyperjungle's scarp, where the cloud sea laps against the Wall; every plant grows in a spiral (whorl, twist, coil or shell) and every spiral turns the same way, but for the rare mirror-handed tree. A cloud forest (coilbarks wrung like cloth, spiral trumpets with fluted, twisting funnels, volute trees whose limbs end in leafy scrolls, crozier tree ferns, screw palms in the ravines) and above the cloud a paramo of giant rosettes (whorl frill-trees, giant groundsels, spiral lobelias) and bogs, drying to spiral aloes and corkscrew cereus; the Whorl Stone, a tor whose ledges spiral to its top; the cloud sea itself |

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

## A fauna kit (started 2026-10-06: `kits/fauna`)

The owner's call (2026-10): all fauna goes to ONE fauna kit (create it if none exists; today fauna is drawn
inside each biome kit and inside some settlements), the way furniture went to `kits/catalog`. It takes each
biome kit's fauna, and the settlements' own creatures: Mav's Refuge's spiders, spider egg sacs and webs and
its other flyers (`settlements/mavs-refuge`, `KNOWN_ISSUES.md`), the flyers of Girder and the other worlds.
Tag every animal by biome (as the root `README.md` asks of flora and fauna) and place it as data, built by the
kit's own code. Started 2026-10-06 as `kits/fauna` (`KratorFauna`): the drylands goat and the fire salamander, with traits
(edible, milkable, tameable, rideable, draught, eggs), yields, life (maturity, lifespan), diet, activity and temperament on
every animal. The same day every other animal was gathered there: 48 species (each biome kit's fauna, the settlements'
livestock, mounts and beasts, Mav's and Girder's spiders, flyers and millipedes, Voth's), each with a `source` list of the
builds that draw it. Spider egg sacs and webs are not animals and stay in Mav's Refuge. The biome kits still draw their own
copies; pointing them at the bundle is next (`kits/fauna/KNOWN_ISSUES.md`).
