# biomes/swbay: plan

## Core adoption (the final rebuild, 2026-10-27)

The kit's turn in the all-biomes rebuild (`HANDOFF-REBUILD.md`, pair 2 with the hyperjungle; `BACKPORT.md` section 1, swbay's row
and section 5). swbay is a vendor: nwbay is its fork, and Voth, the isle demo and ringisles read `50`, `55`, `60`, `65`, `70` and `75`
in place, so every look change in those fragments is on only where swbay's own host asks (`SWBAY_LOOK`, set in `45-host-stage.js`);
a reader draws as before until its own turn. **No species was added, removed or re-keyed: `SWBAY.SPECIES` keeps its 14 keys and
indices** (0 prismgum ... 13 cherry). New for the readers: `SWBAY.make(sp, x, y, z, o)` and `SWBAY.grow(T, lv)` (`55`), so a kin
(`BIO.kin('swbay.puzzle', ...)`: the crater drylands, the SW lowlands, the southern highlands) grows the bay's own tree.

Taken, each with its switch for the owner's look pass (`?x=0` turns it off):

| Item | Where | Switch |
|---|---|---|
| `BIO.INDEX_ITEMS`; `BIO.LOD.merge/minTris/fade/cull` (merge and fade were on already) | `45-host-stage.js` | `?index=0`, `?lodmerge=0`, `?lodfade=0`, `?lodcull=0` |
| Octahedral impostors (on since the pilot) with `BIO.impostorLook` gain 2.2, full wrap (nwbay's: the bake is ~4x dark, a core fix owed) | `88-host-build.js` | `?impgain=`, `?impwrap=` |
| R8 wind (`BIO.bindAtmosWind`), R7 alpha-to-coverage | `89a-host-atmos.js` | none (nhighlands' defaults) |
| R9 wet ground and puddles (`WATER.hollows`, `WATER.wetGround`), rain rings on the bay and the river | `89a`, `89w` | `?wet=0` |
| Height fog (was on), now switchable; **the fog belt** (`ATMOS.fogBelt`, 60-190 m on the rainforest's slope, windward the SW); rain cover and lightning (were on) | `89s-host-sky.js` | `?hfog=0`, `?fogbelt=0` |
| Back-light on the broadleaf cards, R5 the floor's root in the ground's colour, H7 the dry season (`BIO.bindSeason`: the savannah's grass yellows, the umbrella thorns' leaflets thin) | `50` (`SWBAY_LOOK`), `88`, `99` | `?backlit=0`, `?rootcol=0`, `?season=0` |
| **`BIO.fung` in earnest**: the mushrooms, the parasols, the bracket fungus (turned to face its wall or log) and the cap-tree's caps (a gilled dome, the lathe gone) on the core's parts, the SW highlands' own | `50`, `55`, `60`, `65` | `?fung=0` |
| KGROUND: four library layers by zone (leaf mulch, beach sand, the savannah's bare earth, the volcano's ash; `materials.json` groundLitter, groundSand, groundSav, groundAsh) | `45` | `?kground=0` |
| KFAR: the far country on the lattice (50 m cells to 3.5 km, 6% wider to 13 km, curvature, crest pass) | `45` | `?kfar=0` |
| KHORIZON: terrain shadows over the map and the far lattice | `88` | `?horizon=0` |
| **Karst springs** (`ext/54` `W.karstSpring`): three blue-green pools on the rainforest's slope, each in a bowl `terrainH` keeps for it (no tree bole over it), each with a gin-clear run to the river | `45` `SPRINGS`, `87` (keep-clear), `89w` | `?springs=0` |
| **The clear-water look** (`W.LOOKS.clear`) on the river: the springs feed it | `89w` | `?clearwater=0` |
| W2 spray by drop on the cataracts | `89w` | none |
| Card fit: `check_cells.py --fix` (15 slots: bases, tight cells, crown stems; hanging cards one strand, base top); `card.flower.bloom` left (the owner) | `materials.json`, `tex/pack.json` | none (approved by the owner) |
| **The SW highlands' cousins** (`PLAN-FLORA.md`) and **nwbay's cinder pine and flame-crown** (`EXCHANGES.md`), by `BIO.kin`, replacing a share of the bay's own trees (`87-host-kin.js`) | `build.py` NEIGH, `87`, `88` | `?kin=0` |

The budget: 10.21M triangles held at quality 1 (10.13M before the turn); the cousins' 1.07M are paid for by the cuts (each cousin
stands where a cut bay tree stood) and by lighter fungoid parts. Draw calls rose from 491 to 645 with the cousins (their items, by chunk).

Dropped, and why:

- **The log crust** (`PLAN-FLORA.md`): the bay's logs are drawn inside the floor pass, with no records a host can read; owed to a pass that
  exports them.
- **The drip cap on the jetty and the tower**: the dress pass's shells; owed to a later turn.
- **The leafset (`31b`)**: the crowns' clumps take the card fit's `stems` instead (the owner's rule of 2026-10-27).
- **Tall falls, confluences, KSTRATA, KCARVE**: not in the row; the river's risers are 1.5 m steps and it has no tributary.
- **The receivers' rows of later vendors** (`EXCHANGES.md`): the crater drylands' tree aloe and ghost gum, the SW lowlands' mangrove and
  coast oak, the southern highlands' spiral ginger and the Throne's hyper-mangrove are wired at those kits' turns (they run later).

## Scale Model 5.1 Geology & Showcase Station (`2026-11-13`)

### Lithology & `KSTRATA` Reconciliation (`core/terrain/35-core-strata.js`)
- **Outer / Southern Coastal Shelf (`carbonate-shelf`):** Away from the inner-wall dike swarms, `swbay`'s coastal benches and karst spring bowls (`KARST-SITES-5.1.md` Site #9) sit on low-relief, bedded warm-water Ring Sea **`carbonate-shelf`** (`2–5 m` cream bioclastic/coquina & oolitic limestone alternating with recessed pale marl partings and `0.6–1.8 m` wave-cut diurnal libration-tide visors; non-tower karst: sea arches, littoral blowholes, and drowned spring alcoves, zero Guilin towers).
- **Inner-Wall Contact-Metamorphic Belt (`contact-marble`):** Along the steep northwestern/western inner-wall shoreline between **Almua** (`5.1 px 718, 883`) and **Voth** (`5.1 px 742, 1018`), ring-fault basaltic/gabbroic intrusions baked the Ring Sea carbonate platform into massive **`contact-marble`** (`4–8 m` sugary white, blue-veined, and rose calcite/dolomite marble blocks interleaved with dark pistachio epidote, grossular garnet, and specular magnetite-chalcopyrite skarn selvages).

### Showcase Station: `Almua Skarn-Marble Harbour Cliffs`
- **Coordinates & Elevation (`5.1` `1821 × 1723`, `2 km/px`):** **`px (718, 883)`** (Almua harbour headland) to **`px (734, 998)`** (Almua–Voth skarn-coast station, `22 km` NNW of Voth; waterline **`-1,499 m`** Ring Sea datum, wave-cut harbour bench **`-1,465 m`**, cliff crown **`-1,260 m`**, **`1.92–1.93 atm`**, `Csb`/`XA-margin`).
- **`KSTRATA` Stack:** Lower & inner-wall headland formation `contact-marble` (`-1,515 to -1,310 m`, `4–8 m` white and graphite-blue veined marble with `epidote`/`garnet`/`magnetite` skarn bands, `fx: {sheen: 1, joints: 1}`) laterally interfingering (`lateral`, `tongue: 6 m`) seaward/southward into `carbonate-shelf` (`-1,515 to -1,440 m`, cream coquina cap & tidal visor notch).
- **Camera Framing:** Positioned at `+14 m` above the Ring Sea (`-1,485 m`) on a stepped ancient quarry mole looking NNW (`az 338°`, pitch `+4°`): foreground turquoise gin-clear karst spring outfall (`W.karstSpring`) spilling over a wave-notched `carbonate-shelf` visor; mid-ground sheer `180 m` quarry-stepped white-and-blue `contact-marble` sea cliffs streaked with dark green epidote and glinting black magnetite skarn seams, draped on upper ledges by gate baobabs, umbrella monkey puzzles, and prism gums; background Almua's marble breakwaters and the Throne's plume to the ENE.
- **Hydrology & Trade Tie-In:** Short, steep karstic spring streams discharge calcium-saturated clear water straight off the Inner Wall contact into the sheltered deep-water sound; the stepped quarry benches supply dimension stone, statuary marble, and skarn iron/copper flux barged coastwise along the western Ring Sea between **Almua** (`718, 883`), **Voth** (`742, 1018`), **Tethis** (`733, 775`), and **Ys** (`789, 738`).

### As built (2026-11-16): `stations/skarn/`, `python3 build.py --station skarn` -> `dist/swbay-skarn.html`

The kit's first station (the mechanism is nwbay's: `stations/<name>/` fragments over `src/`, `station.json` for more core, `drop`,
`neigh: false` and `region`; the bay's own page is byte-for-byte unchanged). It stands on **today's ground** (map 5.1 before Gemini's
reshaping):

- **The site.** The plan's px 734,998 is 260 m up (-1,240 m) and 15 km inland on today's raster; the station stands on the nearest
  shore to it, the Almua-Voth coast at **px 739.6,995** (the coast runs NNW, az ~328, the Ring Sea to the ENE at -1,500.2 m). The far
  country past ~2 km is the model's own relief (`stations/skarn/region.json`, 41 x 41 cells of 2 km, written by
  `biomes/godthrone/tools/region.py skarn 739.6 995 --n 41 --kit biomes/swbay`). y 0 is the sea (the plan's -1,499 m datum).
- **The coast.** A carbonate-shelf foreshore (3.8 m, its front undercut by the tide: the visor's lip over its notch) south-east of a
  quarry cove; the marble headland north-west of it: a 34 m sea cliff to **the harbour bench (+34 m, -1,465 m)**, the main cliff to
  200-226 m, **quarry-stepped** on the headland's south flank (15 m benches, 9 m treads), the crown ~26 m over it (**~240 m,
  -1,260 m**), the plateau's savannah behind.
- **The beds.** `KSTRATA`: `contact-marble` from -16 to 189 m (-1,515..-1,310 m) under the platform's `carbonate-shelf`; south-east of
  the cove's mouth the lower 75 m are `carbonate-shelf` (-1,515..-1,440 m), tonguing in by 6 m (`lateral`). The magnetite selvages are
  glossy and a little metallic (the ground's material: the plan's sheen), the epidote and garnet bands their own colours.
- **The eye.** The plan's view opens the page: on the ancient quarry mole's head (marble courses stepped back in tiers, +12.3 m), the
  eye at +14 m (-1,485 m), az 338, pitch +4. Left foreground the **karst spring** (`W.karstSpring`) on the shelf, its run over the
  visor's lip and a 2.8 m curtain (`W.fall`) into the sound; across the harbour the quarried marble; an outer marble breakwater off
  the headland's tip.
- **The flora.** The kit's own passes by the station's fields (Csb: wet .36, the spring's ground soaked, upland by height), the canopy
  ceiling at 78 m (`SWBAY_TEMPLE_H`); on the ledges the host puts the plan's trees (`SWBAY.treeAt`): monkey puzzles on the quarry's
  upper treads, prism gums and gate baobabs on the crown's lip.
- **Not as the plan says** (KNOWN_ISSUES.md): the Throne's plume is NNE on today's map (bearing 33, 387 km), outside the az-338 view
  (drawn at its bearing and angular size; a view looks at it); Almua's breakwaters are 230 km up the coast, beyond the horizon (the
  quarry's own breakwater stands in the view); the harbour bench at +34 m is drawn as the quarry's floor, not a raised wave-cut bench
  (the owner, 2026-10-26: the Ring Sea's level has not changed).
