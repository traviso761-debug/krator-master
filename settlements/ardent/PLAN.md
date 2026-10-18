# Ardent: the plan (draft, 2026-10-18)

Ardent is the main city and meeting place of the Free Clans, the Rustic Clansmen of the northern highlands, where the
Clanthing meets. Its lore is `LORE.md` §6.4 (the Clansmen; the Ardent entry) with the Republic in §6.3 and the
alliance with Dilihan in §6.2 and §11. It is built on the **Highlands kit's Rustic branch** (`settlements/highlands`,
`HL.def` with `branch:'rustic'`, fragments `80-rus-dwell.js` and `81-rus-village.js`), read in place, and is the first
settlement page the Highlands kit drops into after Roketstad.

Owner's brief (2026-10-18): main city and meeting place of the Free Clans; the Clanthing meets here; major nearby
sources of copper and tin result in widespread bronze use; will use the Rustic Highlands kit; allied with Dilihan
against the Republic, which has sought to control both.

## 0. What the build is

| | |
|---|---|
| Folder | `settlements/ardent/` (`src/`, `targets/`, `build.py`, `verify.py`, `materials.json`, `site/`) |
| Pages | `dist/ardent.html` (the town), `dist/ardent-site.html` (the site editor, Voth's read in place) |
| The buildings | the Highlands kit's Rustic set (poor, middle and rich houses, the stave temple, the longhall, shops, the mustering ground, the scrap smithy, granary and mill, farmhouse and farm, pens, tavern and inn), read in place with the kit's vendored Vernacular helpers; **new Rustic defs** for what Ardent needs and a village does not (section 2): the thing-stead, the law-speaker's hall, the bronze foundry, the ore sheds, the clan lodges |
| The ore | the Resources kit's nodes (`kits/resources`: `copper_ore`, `tin_ore`, three grades) placed on the hills round the town by the nearest-node rule, the mines on them |
| Town | `core/city` steps 0-12 on the site layer; `frontage-courts` for the clan lodges round the thing-stead, `alleys` for the town; the lots take `HL` keys with `branch:'rustic'` only (a Republican or Tribal def is a lint error on this page) |
| Biome | the northern highlands kit (`biomes/nhighlands`), read in place; the Tribal branch's cliff rule is not used here |
| Core | `core/rand`, `core/mask`, `core/tags`, `core/space`, `core/lod`, `core/host`, the shared sky; `core/furnish` with the rustic catalog set (`kits/catalog/krator-master-furniture-rustic.js`) |

Ardent is a settlement and goes in the gallery when it first reaches `main` (`gallery/README.md`).

## 1. The site

The scale model has Ardent at px 579,242 (`sn6y4sx8tr`, a city point), inside the Free Clans' political polygon
toward its eastern end and the northern highlands biome polygon. Neighbours: Serai, a village, 195 km; the Hexahedron
198 km south-west (Screamer Country begins about 40 km south); Jimjam 215 km west over the Wall's northern flank;
Dilihan 281 km south-west; the Republic's eastern border about 200 km west (Lipp, 334 km, is the Republic's). The
Beast Riders' and the Painted Men's polygons begin about 60 km south-east and east. No river is named through it
yet; the plan assumes a highland valley with a stream, the town on its sunny side, the ore hills across it.

| Zone | Where | What |
|---|---|---|
| **The thing-stead** | the hill above the town | the ring of standing stones where the Clanthing sits (one stone per clan, its crest carved on it), the law-speaker's mound at its head, the longhall beside it for the winter session, the fir-sign pole |
| **The lodges** | the hill's shoulder round the stead | one lodge per clan: a Norse hall with the clan's crest and antler trophies, where its chief and his following lodge for the thing; empty most of the year, with a keeper's house each |
| **The town** | the slope down to the stream | Rustic houses poor to rich, the stave temple, shops, the tavern and inn, the market, the mustering ground |
| **The bronze yard** | the stream's bank below the town | the foundry (a long hall with a cupola and bronze-casting pits), the ore sheds, the charcoal clamps, the smiths' row; the mill |
| **The mines** | the hills across the stream | the copper and tin nodes (the Resources kit), adits and spoil, the ore road down to the yard |
| **The farms** | the valley floor up and down stream | farmhouses, fields, pens; the granary |
| **The envoy's house** | by the longhall | Dilihan's envoy (an Izani in the colony's old-fashioned style: a Rustic lodge with the Izani sun on its door, no Vernacular building on this page) |

## 2. Bronze and the thing

**Bronze everywhere.** The Highlands kit's Rustic set uses iron and salvage fittings as the Republic does. Ardent's
page applies a **bronze tune** as `KMAT` records (`core/materials/record/`) over the Rustic registries' metal: hinges,
straps, door bosses, the horns and dragon heads on the bargeboards, the temple's finials and bells, all cast bronze,
new-gold on the rich and civic and green-patinated on the old; and a share of the clan crests are bronze plates on
the gable instead of paint. The tune touches materials and dressing only; the kit's builders are not edited.

**New Rustic defs** (in the Highlands kit, `branch:'rustic'`, keys `rus_*`, seeds in the Rustic block 22000-22499,
verified on the kit sheet first): `rus_thing_stones` (the ring, parametric in clan count), `rus_law_hall` (the
longhall with a speaker's platform and the law's carved pillars), `rus_clan_lodge` (a hall with a crest socket and
trophy row, `o.ends` for a row), `rus_foundry` (cupola, casting pits, a bell yard), `rus_ore_shed`. The foundry and
the sheds take the kit's industry materials (log and stone, corrugated salvage roof, the forge fire `vEmber`).
Lighting canon holds: `lit:false` on every Rustic def; forge fire and hearths only.

**The Clanthing** is drawn as a place, not a crowd: the stones carry `core/tags` records with the clan's crest and
seat, so the NPC placement `core/city` grows into can seat a thing later. The clan list is open (section 5, question
1); the generator takes any count.

## 3. The order of work

- **P0. The harness.** `build.py` reading the Highlands kit, the Resources kit and `core/city` in place (the
  Rustic-only lint); `verify.py` on `tools/harness.py`. Done when a Rustic street stands on a highland slope on the
  page and `--assert` passes.
- **P1. The site.** The valley, the stream, the hill; the site editor saving `site/ardent-site.json`: the stead, the
  lodge ring, the zones, the ore hills with their nodes. Done when steps 0-5 run.
- **P2. The town and the tune.** Steps 6-12; the bronze tune judged at eye level beside the kit's own Rustic row.
  Done when the town fills the site, the tune reads as bronze and not gold paint, and the city test is green.
- **P3. The new defs and the yard.** The five Rustic defs on the kit sheet (the Highlands page rebuilds and its
  hash changes on purpose), then placed: the stead, the hall, the lodges, the foundry, the sheds, the mines. Done when
  the views of section 4 read.
- **P4. The life.** Clansmen (`core/charactermodels`, the rustic clothes), the envoy, the smiths; the night: hearths
  and the foundry's glow, no electric light anywhere. Done when the night view reads.
- **P5. The record.** `README.md`, `KNOWN_ISSUES.md`, `PORT.md`, the gallery entry, the hash into `PORT-BASELINE.json`.

## 4. Views for the verify

| View | What it must show |
|---|---|
| Overview from across the stream | the stead's stones on the hill, the lodge ring, the town down the slope, the yard on the bank, the mine adits opposite |
| The thing-stead at eye level | the stones with their crests, the law-speaker's mound, the longhall's gable |
| A town street | chalets and Norse houses with bronze fittings and horns, the stave temple's finials |
| The bronze yard | the foundry's cupola, the casting pits, the bell yard, the ore road |
| The farms | fields and pens on the valley floor, the granary and mill |
| Night | hearth light in the windows, the foundry's glow, the stead dark |

## 5. Open questions for the owner

1. **The clans.** How many clans sit at the Clanthing, and their names and crests: the stone ring and the lodge ring
   are generated from the list. Recommended: start with nine, named by the owner.
2. **The law-speaker.** Is the Clanthing's head an elected law-speaker (recommended, as the Icelandic thing) or a
   high chief?
3. **The Republic's pressure.** Law and levy demands backed by the threat of arms (recommended: so the town is
   watchful, not fortified) or an open war, which would want a wall.
4. **The ore.** Name the copper and tin deposits on the model, or let P1 place the nodes on the hills nearest the
   point.
5. **The Highlands page.** Adding the five defs rebuilds `settlements/highlands` and changes its hash on purpose;
   confirm that is acceptable, or the defs go in a new `settlements/ardent/src` fragment on the `HL` registry instead.
