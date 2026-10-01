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
| `nhighlands/` | the northern highlands: the Inner Wall's NW flank, old-growth temperate forest rising to boreal (great spruces and cedars, the old wood, spire spruce, birch, a burn, krummholz), great trumpet trees and trumpet colonies, bell-bulbs and lantern pods that glow at night, a stream from its tarn with two falls, crag pillars; the core's `waterH`, `cold` and `rock` fields and harvest tags |

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
