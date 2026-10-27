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
