# Hook: the plan (draft, 2026-10-17)

Hook is the Ancient port city of the Ring Sea's southern shore, the Izani Empire's premier port, retaken from Voth
a few months before game start. Its lore is in `LORE.md` §6.2 (the Hook entry) and §6.12 ("Hook is lost"). This plan
says how the city is built: the Ancient Port kit (`settlements/port`) lays the waterfront, `core/city` lays the town
behind it, and six building kits dress the layers of its history.

Owner's brief (2026-10-17): the city built around the Ancient port; every segment of the Port kit used at least once;
heavy on nautical salvage architecture; a melting pot of successive rulers (Hukoa settlers, Tethys, Kautoa, Iziz, the
Pirate Emperors, Voth, and Iziz again under Vinzenda IX).

## 0. What the build is

| | |
|---|---|
| Folder | `settlements/hook/` (`src/`, `targets/`, `build.py`, `verify.py`, `materials.json`, `site/`) |
| Pages | `dist/hook.html` (the city), `dist/hook-site.html` (the site editor, Voth's read in place) |
| Waterfront | the Port kit's layout (`portRun`, `portBehind`, `portOff`, `portMoor`) in a target fragment, as `targets/harbour/89z-rows.js` does: every Port fragment read in place from `settlements/port/src`, never copied |
| Town | `core/city` steps 0-12 on the site layer, as Voth and Verge (`core/city/README.md`, "Porting a settlement") |
| Kits, read in place | `kits/islanders` (West: the Hukoa; East: the Kautoan layer), `settlements/ys` (the Hykkousoi kit: the Tethyan quarter), the Iziz Vernacular and the Ancients core as Verge's `IZV` bundle (`settlements/iziz/VASSAL-KITS.md` section 1), `settlements/voth/catalog` (the Vothic layer's lots, as `core/city` builds Voth) with `settlements/voth/src` lifted by name for its landmarks (`vothlift.py`), `kits/post-apoc` (culture-neutral salvage infill), `kits/ringsea` and the Port vessels (the harbour's ships) |
| Core | `core/rand`, `core/mask`, `core/tags`, `core/space`, `core/lod`, `core/host`, the shared sky and camera; `core/furnish` once interiors come |
| Ground | the Port kit's natural coast (`71-port-terrain.js`) extended inland by a heights ridge behind the harbour (the Vernacular's quarter sits on it, as Iziz's rich do on their mesas) |
| The Ancient town | the port's own city behind the waterfront (the owner, 2026-10-19): a grid of Ancient blocks on the Port's 110 m module, its ruins from `kits/ancients` (read in place through the `IZV` bundle; decay 0 to 5) placed as **host records**, and every later culture's additions built on and into them (section 3, "The Ancient town") |

Hook is a settlement and goes in the gallery when it first reaches `main` (`gallery/README.md`).

## 1. The site

The scale model (`openworld/little-demo/source/settlements.json`) has Hook at px 537,596, on the Ring Sea's southern
shore: the sea is to the **north**, the coast runs west-south-west to east-north-east, and the cliff that is the Crag
Men's northern border stands 4 km behind the city. The Heights are the first step of that cliff. The Port kit's local
convention (`N` land, `S` sea) is therefore turned about: the kit's "south" is the world's north, and the Hook points
north into the sea. The East Ring Isles are 45 km offshore to the east, the Throne 50 km north-east (its smoke stands
over the harbour's eastern sky), the Vothic border about 45 km west along the coast: Hook is a frontier city on a
sliver of Izani shore, which is why it changed hands so often.

**On the model's ground (2026-10-19).** The page stands on the scale model at 1:1 through the open world's ground rule
(`core/terrain/40-core-land.js`; `README.md` "The ground", `world/`). The 4.21 cut says: the Ring Sea at −1,500 m;
Hook's pixel on land 592 m above it, the 1:1 shoreline 6.7 km north of the pixel (the kit's origin stands there); the
coast's bearing −8.8° from east (ENE, the bay west of the Point, the headland east); the land behind the quays a steady
slope, +30 m at 300 m, +62 m at the Heights' back edge (760 m), +115 m at the cliff's foot line (1,180 m), +195 m at
2 km, the plateau at +740 m 6 km back; the sea bed −22 m at 500 m out, −50 m at 1 km; climate Af (tropical rainforest,
4,000 mm, 28 °C), overlay SW Bay; no escarpment in the data and no channel across the site. So the Heights and the
cliff's foot come from the slope itself (both stamps dropped), the cliff face of this section is not in the model
(`KNOWN_ISSUES.md`), and the kit's −x end (the Point) lies at the world's east.

About 2.6 km of waterfront, 1.2 km deep to the cliff's foot. From west to east:

| Zone | Ground | Layer it belongs to |
|---|---|---|
| **The Point** | a rocky spit, the haven and lighthouse | Hukoa |
| **The Strand** | the fishing harbour and marina, low ground, stilt houses over the shallows | Hukoa |
| **The Tethyan quarter** | the old passenger terminal and the shore behind it | Hykkousoi (Tethys) |
| **The Hook** | the great pier with the L of sea platforms off its end: the harbour's shelter and its name | Ancient; Iziz working harbour |
| **The Customs** | the container docks and stores either side of the pier, the Port Authority behind | Iziz |
| **The Heights** | a ridge 25-40 m above the quays, behind the Customs | Iziz (the Vernacular quarter, the governor's palace), then the Kautoan governor's house older still |
| **The Iron Court** | the deep-water berth and the carrier, the submarine pens | the Pirate Emperors, then Voth's Ordinators |
| **The Arsenal** | the graving docks and the boat yard, the shipping terminal | Iziz, kept by every ruler since |
| **The Sun Canton** | the heliport pad and the tank farm, the land blocks behind | Voth |
| **The Stacks** | the container towers, compounds and silo houses at the eastern edge | the poor of every people; Voth's slave market |

Behind every zone stands **the Ancient town** (the owner, 2026-10-19): the city the port served, on a grid of 110 m
blocks and 20 m streets aligned to the waterfront, three rows deep behind the Customs and the Arsenal (z -150 to
-540 in the kit's frame, the first row behind the shore road), two behind the Strand, the Tethyan quarter and the Sun
Canton, one behind the Point and the Stacks (`site/hook-site.json` `grid`). The site's avenues are its streets: the pier's axis was the Ancient city's main avenue, the shore road its
esplanade (the Arcades along it), and the Heights its upper terrace, reached by an Ancient stair and the stump of a
funicular (`kits/ancients/src/8ap-funicular.js`, Verge's piece). Each later ruler reclaimed what stood and built on
it in their own style, so the Ancient fabric shows in every zone: whole and repaired in the Customs and on the
Heights, ruined and toppled at the edges, grown over in the Tethyan quarter, patched with scrap in the Strand and the
Stacks.

The eastern harbour (the Iron Court, the Arsenal's east end, the Stacks' seaward row) carries the reconquest's fresh
damage; the town surrendered whole when the Iron Court fell, so the Point, the Strand, the Tethyan quarter and the
Heights are untouched (section 6, question 5).

## 2. Every Port segment, placed once

The kit registers 24 segments and 5 vessels (`grep PORT_SEG settlements/port/src`). Each has one home in Hook; the
anchors and the big docks may repeat. Decay `d` (the kit's: 0 intact, 1 ruined, 3 reclaimed). The city mixes them: an
intact working harbour in the middle, ruined where the reconquest fought (section 6, question 5), reclaimed where the
salvagers live.

| Key | Name | Where | d | What the city makes of it |
|---|---|---|---|---|
| `hbHaven` | Haven and lighthouse | the Point | 1 | the Hukoa light, kept burning; a shrine to the island moon at its foot |
| `hbFish` | Fishing harbour | the Strand | 1 | the Hukoa harbour: boats turned to houses, stilt houses, rope bridges, rafts on drums, racks |
| `hbMarina` | Marina | the Strand, east | 1 | the pilots' and pearl divers' moorings, Hykkousoi oruwa and West Islander canoes among the Ancient pontoons |
| `tmPass` | Passenger terminal | the Tethyan quarter | 1 | the Tethyan hall: the Ancient concourse grown over with Hykkousoi nacre pods (the Ys kit's host types), the sea temple on its upper deck |
| `cgStore` | Warehouses and storage | west of the pier | 0 | the Customs' bonded stores, Izani-run |
| `cgBox` | Container dock | west of the pier, flush | 0 | the working container dock; Ancient Iziz tripod markets hung off the stacks |
| `cgCrane` | Container cranes | both sides of the pier | 0 / 1 | the cranes; the Izani one working, the eastern one worn and used as a signal mast |
| `pier` | Great pier | the centre | 0 | **the Hook**: the harbour's axis, the governor's landing at its head, the gibbet stations of the Pirate Emperors kept as lamp posts |
| `quay` | Working quay (220 m) | east of the pier | 0 | the Imperial quay: the fleet's berth, the turtle ship and the wheel galley alongside |
| `quay110` | Working quay (110 m) | the Arsenal's west end and the Stacks' shore | 1 / 3 | plain quay where the city thins out |
| `lbAuthority` | Port Authority | behind the pier (land) | 0 | **the Customs House**: the Izani governor's seat at game start, with the garrison's flags |
| `lbStores` | Warehouses and silos | behind the Customs (land) | 1 | the granary canton: Voth's state granary, now the Empire's |
| `lbTanks` | Fuel-tank farm | the Sun Canton (land) | 1 | **the Vothic necropolis**: family tombs set inside the tank shells, hanging gardens on the bunds (Voth's Ancestry canton in a tank farm) |
| `slBerth` | Deep-water berth | the Iron Court | 1 | the carrier's berth; the Ordinator fortress's landward wall was built across its apron, now breached |
| `slPen` | Submarine pen | the Iron Court, east | 1 | the pens: the Pirate Emperors' navy, then the Ordinators' arsenal, the fresh breach in its roof |
| `tmShip` | Shipping terminal | the Arsenal | 0 | the Arsenal's stores and the naval yard's offices |
| `ddDock` | Graving dock | the Arsenal | 0 | **the Imperial Arsenal**: a hull on the blocks, the gantry working |
| `ddShed` | Covered graving dock | the Arsenal | 1 | the covered dock: the Vothic chitin biremes were built here; a half-built one left behind |
| `ddYard` | Boat yard and slipway | the Arsenal's east end | 1 | the small-craft yard: Hukoa boatwrights on an Ancient slipway |
| `tmHeli` | Heliport | the Sun Canton | 1 | **the Temple of the Sun**: Voth's stepped pyramid on the Ancient pad, its summit platform torn down by the Izani; the Izani sun painted over the diamond |
| `chStack` | Container towers | the Stacks (land) | 3 | the container towers, the tallest the poor's |
| `chCourt` | Container compounds | the Stacks (land) | 3 | the compounds: Voth's slave market, its cages now empty |
| `chTank` | Silo and tank houses | the Stacks (land) | 3 | the tank houses of the salvagers |
| `spYard` | Sea platform: container yard | off the pier's end | 1 | **the hook of the Hook**: two platforms seaward and two east, the breakwater; the container yard on them is the salvagers' and the Hukoa's drying ground |
| `vsGiant` | Ultra-large container ship | grounded in the pier's slip, west | 3 | **the stack town**: a floating market and slum on the grounded freighter, rope-bridged to the pier |
| `slCarrier` | Drone carrier | the deep-water berth | 1 | **the Iron Court**: the Pirate Emperors' seat, the Ordinators' barracks, now the Izani garrison's; the bridge is the governor's war room |
| `slSub` | Submarine | inside the pen, and one sunk off the platforms | 1 / 3 | the pens' last boats |
| `vsPanamax` | Panamax container ship | alongside the platforms' west face | 1 | the Empire's grain ship, unloading |
| `vsFeeder` | Container feeder | off the L's east end | 3 | a wreck on the breakwater's end, the salvagers' bridgehead |

The Ring Sea fleets alongside, from `kits/ringsea`: Iziz's turtle ship, dhoni, wheel galley and salvage lighter at the
Imperial quay; the Islanders' oruwa, karakoa and lakatoi at the Strand; a Hykkousoi pearl baghlah at the marina; a
captured Vothic chitin bireme in the covered dock; the Salvagers' refloated tug at the Stacks. No Ordinator flagship: it
left with the Vothic fleet.

The rule for the verify: `verify.py --assert` checks that every registered Port key is placed at least once
(`port-every-key`), after the kit's own `port-stamps-inside-footprint` and `port-clearance`.

## 3. The layers as kits

Every building is registered in `core/tags` with `culture` and `layer` tags before it is drawn. The layers:

| Layer | Kit | Where it stands | Share of lots |
|---|---|---|---|
| `ancient` | `kits/ancients` read in place (the `IZV` bundle carries it): the ruin hosts of the Ancient town, placed as records with a type, a footprint and a decay (0 intact, 1 ruined, 2 toppled, 3 repaired, 4 rehabilitated, 5 worn); the five host types (`8ap-host-*`: the Facet and the Bastion towers, the Arcades, the Capsule Stalks, the Bell Hall) where a culture builds onto the ruin, the kit's other types as plain ruins; the funicular stump and the Ancient stair up the Heights | everywhere behind the waterfront: the Ancient town's grid (section 1) | the hosts of about 40% of the lots in the core (the Customs, the Heights, the Tethyan quarter) and 15% at the edges; no lots of its own |
| `hukoa` | `kits/islanders` West set, `scrap` patching on; the boat houses and stilt houses of `hbFish` | the Point, the Strand, the Arsenal's boat yard, the Stacks | 30% |
| `tethys` | the Ys kit's Hykkousoi buildings (`settlements/ys`: grown pods on Ancient hosts, the moles) | the Tethyan quarter, the marina | 8% |
| `kautoa` | `kits/islanders` East set: the governor's house (a palace court, `ip`), ancestor shrines, a few rich houses | the Heights' eastern end, the Tethyan quarter's edge | 5% |
| `iziz` | the Iziz Vernacular and the Ancients core (`IZV`); Ancient Iziz style on the quays; the governor's palace of `VASSAL-KITS.md` section 3 in Hook's dress (below) | the Heights, the Customs, the Arsenal | 27% |
| `pirate` | no kit of its own: Port kit salvage dressing, Noah's Regret's pirate timber (`settlements/noahs-regret/src/62-nr-pirates.js`, read in place), the Hooked Sun in gold on black, gibbets | the Iron Court, the pier | dressing only |
| `voth` | the Voth building catalog's registries for every lot (`settlements/voth/catalog`, as `core/city` builds Voth: houses, manors, shops, the harbour tavern, the canal warehouse, the harbour fort); Voth's source library lifted by name for the landmarks only (`vothlift.py`: the temple pyramid's tiers, the Ordinator fortress's walls, the tombs); the diamond sign | the Sun Canton, the Iron Court, a townhouse canton on the Heights' west slope | 20% |
| `salvage` | `kits/post-apoc` and the Port kit's `ch*` blocks | the Stacks | 10% |

The culture mix is a `core/city` zone property; the lot filler draws a culture per lot, then a type, as
`VASSAL-KITS.md` says for Pylon and Talia. The shares above are the city's totals; the zones carry them
(settled 2026-10-17, section 6, question 6). Each zone record also carries `holder` (who runs it at game start) and
`mood`, for the NPC placement `core/city` grows into: they place nothing yet.

| Zone | Lot mix (`cultures`) | `holder` | `mood` and what shows |
|---|---|---|---|
| The Point | hukoa 90, salvage 10 | Hukoa lightkeepers; an Izani signal post | hopeful: the light burns, the moon shrine is tended |
| The Strand | hukoa 75, tethys 10, salvage 15 | the Hukoa fishers' and boatwrights' elders; the Izani harbour watch patrols the jetties | hopeful: nets out, boats working, Izani sun on the watch post only |
| The Tethyan quarter | tethys 60, hukoa 20, kautoa 10, iziz 10 | the Hykkousoi harbour-master (*akono*) under the alliance's protection | guarded: the sea temple open, pilots at work, the Izani keep out of it |
| The Hook (the pier) | no lots: dressing | the Izani garrison: two war-walkers, customs posts, the toppled statues | occupied: the Empire's face to the sea |
| The Customs | iziz 70, voth 10, hukoa 10, salvage 10 | the Izani governor and the customs; the garrison's headquarters in the Customs House | busy: the fleet unloading, flags, scaffolds |
| The Heights | iziz 50, voth 30, kautoa 10, tethys 10 | the Izani officials and merchant houses on the east; Chichani families on the west slope under curfew | divided: Izani orange and copper against purple shutters closed by day |
| The Iron Court | voth 60, iziz 40 (the garrison's new works) | the Izani legion | military: the breach, the camp of the garrison, nobody else inside |
| The Arsenal | iziz 60, hukoa 25, voth 15 | the Imperial navy's yard; Hukoa shipwrights conscripted | working: a hull on the blocks, the captured bireme |
| The Sun Canton | voth 70, iziz 20 (the legion camp), salvage 10 | the Chichani population's heart under the legion camp; the Temple closed, its priests gone or hidden; the necropolis still visited | tense: mourners on the bunds, soldiers on the apron |
| The Stacks | salvage 50, hukoa 25, voth 15, post-apoc dressing | nobody: the freedmen (Nazarites and Wingmen freed from the slave market by the Emperor's decree), the burned-out, a Salvagers' Guild bridgehead; the Izani watch stays at its edge | desperate: cooking fires, empty cages, salvage work |

People, as a share of the city (for `core/charactermodels` peoples when the citizens come): Hukoa 35%, Chichani 25%,
Izani 20% (the old port Izani and the new garrison), freedmen and salvagers 12%, Hykkousoi 5%, Kautoan descent 3%.

**Nautical salvage is the city's own style**, not a layer: a rule set in the lot filler that any layer's poor and
middle buildings may take (the owner: "heavy on nautical salvage architecture"):

- an upturned hull for a roof (the Port kit's boat house, generalised to the Islander and Vernacular poor);
- container walls and stacked containers (`74-port-dress.js`, the `ch*` blocks) as the poor's masonry;
- ships' superstructures and crane cabs as watch towers and shrines (the `tm`, `cg` and `vs` kit items);
- rope bridges, stair towers and awnings between everything (Noah's Regret's pirate timber);
- nets, buoys, anchors and chain as the ornament of every tier, gilded on Voth's and the Pirates'.

**The Ancient town** (the owner, 2026-10-19: "more ancient ruins, a small city behind the port itself, reclaimed with
additions built on in each culture's style") is the layer under every other, and its rule is the **host lot**:

- The site carries the Ancient town's ruins as `hosts`: records `{id, type, x, z, ry, decay, plan}` on the Ancient
  grid, the `plan` from the kit's `HOSTSPEC_*` data (pure data, the shape of Ys's `YS_HOST_TYPES`), placed by
  `core/rand` from the site's seed and the block's cell, never by hand except the named ones (the two towers on the
  pier's axis, the Arcades on the esplanade, the Bell Hall that became the Tethyan sea temple, the funicular). The
  city builder files them in `core/space` as footprints before step 6, so streets route round them and no lot
  overlaps one.
- A lot whose footprint meets a host becomes a **host lot**: the ruin is drawn at its decay, then the lot's culture
  builds its addition on and into it, with the culture's own kit:
  `tethys` grows Ys pods on the host's face (`hykAccrete`, the way Ys does it, with a way in on every plate);
  `hukoa` decks the shell with stilt floors and scrap patching (the Islanders' `scrap` rule) and roofs it with a hull;
  `iziz` hangs its markets from the reclaimed towers (the Ancient Iziz style, the kit's `iziz-style` target) and
  fills the shell with the Vernacular's timber and plaster, copper on the civic;
  `kautoa` sets a spire roof on a cut host (the East set's shrines);
  `voth` builds its townhouses into the shell with purple render over the concrete and the diamond on the lintel;
  `salvage` stacks containers and post-apoc scrap inside and over it.
  A lot off every host builds as before. The addition is a second record on the same lot (`host` names the ruin), so
  a builder still draws a record.
- Decay follows the zone and the culture, through a `ruin` field painted on the site like `damage`: the Izani kept
  the core whole (repaired 3 and rehabilitated 4 in the Customs and on the Heights, worn 5 on the civic they use);
  ruined 1 and toppled 2 at the edges and in the Stacks; the Tethyan quarter's hosts cut at a storey, as Ys cuts
  them. The reconquest's `damage` field adds to it on the eastern harbour.
- Interiors come with P5: a host lot's rooms are the kit's (`kits/ancients-interiors` plans, every room a socket for
  any culture's furniture), so the Customs House's and the palace's blueprints may take Ancient rooms.

**The governor's palace** is the shared vassal programme (`VASSAL-KITS.md` section 3), on the Heights, in Hook's
dress: the terrace is an Ancient deck on columns (`73-port-edges.js`), the pavilions' domes are ships' radar domes
and crane cabs in copper and orange, the forecourt's gate a pair of anchors. It was the Kautoan governor's house, the
Pirate Emperors' summer court and the Vothic viceroy's palace before it, and keeps a piece of each (a spire roof on
the back pavilion, a gibbet frame, a purple-and-gold hall).

**Texture gaps** go to `core/materials/PROMPTS-NEEDED.md` as they are found (rusted hull plate as a wall, tarred
rope, Vothic purple render on Ancient concrete are likely ones). No procedural stand-in without saying so.

## 4. The order of work

Each phase ends with a page that builds, a `verify.py --assert` that is green, one screenshot read, and a commit.
The waterfront comes first, because the Port kit is finished and the city's shape depends on it.

- **P0. The harness.** `settlements/hook/build.py` on the Port kit's build (its fragments and texture pack read in
  place, `--vendor-check` for any adapted file), `verify.py` on `tools/harness.py`, `INDEX.md`, `PORT.md` by
  `tools/audit_port.py`. A `targets/hook` with the layout of section 2 as a `PORT_LAYOUT_DEF`: one coastal run, land
  blocks two deep behind the Customs and the Sun Canton, the L of platforms, the five vessels. Done when
  `dist/hook.html` shows the whole waterfront with every key placed and `port-every-key` passes.
- **P1. The ground and the site.** The coast extended inland to the Heights' ridge; the site editor
  (`dist/hook-site.html`, Voth's read in place) saving `site/hook-site.json`; the zones of section 1 drawn as polygons
  with their roles and culture mixes, the avenues (the pier's axis up to the palace, the shore road, the Arsenal road)
  on the Ancient grid, and the Ancient town's `hosts` (section 3, "The Ancient town": the named ones by hand, the rest
  drawn on the grid by `core/rand`) drawn as plain ruins at their decay. Done when the owner has laid the site out in
  the editor and `core/city` steps 0-5 run on it with the hosts filed as footprints. **Built 2026-10-19** on the
  branch `claude/hook-p1`, except the editor page: the site file is seeded from `LAYOUT.svg` and the steps run on it
  (`README.md`, "P1"); the editor is the open item (`KNOWN_ISSUES.md`), the owner edits the JSON until it comes.
- **P2. The town on `core/city`.** Steps 6-12 with the kits' dims (`isDims`, the Vernacular's, the Ys kit's, Voth's
  catalog); the lot filler drawing a culture then a type; the salvage rule on the poor and middle lots; the host-lot
  rule (a lot on a ruin draws the ruin, then its culture's addition on it). Done when the
  town fills the site with no overlap, nothing on a street or in the water, `node core/city/test-city.js` green.
- **P3. The layers' landmarks**, placed as records with `near` scorers: the Customs House, the governor's palace, the
  Temple of the Sun, the Iron Court's fortress wall, the Tethyan hall and sea temple, the Kautoan house, the necropolis,
  the slave market. The reconquest's damage as a decay field over the eastern harbour. Done when each landmark is in
  its zone and the eye-level views of section 5 read right.
- **P4. The harbour's life.** The Ring Sea fleets at their berths, the stack town on the freighter, the citizens
  (`core/charactermodels` peoples: Hukoa drawn as Islanders, Chichani, Izani, Hykkousoi), the Izani garrison's flags,
  the painted-over diamonds. Done when the night view and the stack town read as a lived city.
- **P5. Interiors** (`core/furnish`, `kits/interiors`): the Customs House, the governor's palace (a blueprint in
  `palace/`, as Voth's and Iziz's), the Iron Court's bridge and barracks, a Hukoa boat house, a Vothic townhouse. Lazy
  furnishing as Voth's palace. Done when `fingerprint.py` reads `same` on the other five builds.
- **P6. The record.** `README.md`, `KNOWN_ISSUES.md`, the port audit, the gallery entry; the city's hash into
  `PORT-BASELINE.json`. Hook's turn on `core/simulation` (stocks, trades, the harbour's trade with Voth and Port Tobin)
  is the owner's economy work and is not in this plan.

## 5. Views for the verify

| View | Camera | What it must show |
|---|---|---|
| Overview | high, from the north-west over the Point (out at sea) | the whole waterfront, the Hook's L, the Heights and the cliff behind |
| The Hook from the sea | low, from beyond the platforms to the north | the pier's axis up to the palace, the stack town, the cranes, the Throne's smoke to the east |
| The Strand at eye level | on the fishing harbour's jetty | boat houses, stilt houses, rope bridges, the light |
| The Customs | on the pier's head, looking south | the Customs House with the garrison's flags, the Vernacular quarter above, the cliff |
| The Iron Court | on the carrier's deck | the fortress wall's breach, the pens, the fresh damage |
| The Sun Canton at dusk | from the tank farm's bund | the pyramid's cut summit, the necropolis's gardens, the diamond painted over |
| The Stacks | between two container towers | the salvage style, the compounds' empty cages |
| Night | the Overview camera | the light at the Point, electric light only on the rich and civic (the Vernacular's canon) |

## 6. Open questions for the owner

1. **Settled (2026-10-17).** Hook is on the scale model at px 537,596 (section 1): the sea to the north, the Crag
   Men's cliff behind, the Vothic border 45 km west. The Crag Men themselves have no lore yet (LORE §12).
2. **Settled (2026-10-17).** The people are the **Hukoa**; the city is *Huka* in their tongue and *Uga* in Izani
   (`tools/scale-model/river_names.py`, `PLACE`). Their records keep the catalog culture `islander` (the West set
   builds them) and carry `layer: 'hukoa'`; no new catalog culture. Their speech is the western Islander tongue,
   Hikau (`lore/tongues-of-krator.html`, "Sikau"), which kept h and k: the regular Hikau for a fish-hook is *huku*
   (east *uʻu*), so *Huka* is a name older than the rule, like *Kautoa*.
3. **Settled (2026-10-17).** The first Pirate Emperor is **Edguarda Marxal** (Edward, of the Marshal's house: the
   admiral of the western fleet, a Duxun by his mother), *Emparar de Uga*; the last is **Gualtar Marxal** (Walter),
   *Gualtar Dafal* in the Izani chronicles; three unnamed between them, five in all over about 110 years. Iziz calls
   the line the *Emparaz Pirataz*. Their sign is **the Hooked Sun**: the Izani sun in gold pierced by a fish-hook, on
   a black field (gold and black are the layer's colours; the pirates' black and red jacks descend from the field).
   In the build: the Hooked Sun survives on the Iron Court's hull, under the Vothic diamond and the Izani sun painted
   over it in turn, and carved on the gibbet stations along the Hook; `kits/ringsea`'s lanong flies a black jack.
4. **Settled (2026-10-17).** There is nothing to wait for: Voth's building kit exists as the **Voth building catalog**
   (`settlements/voth/catalog`: housing poor to rich, manors and clan compounds, eight shop kinds, taverns, warehouses,
   civic, military, and `kits/catalog/krator-master-buildings-voth.js`'s 27 first-generation entries), and
   `core/city` already builds every Voth lot from its registries (`core/city/52-city-host-buildings.js`). Hook's
   `voth` lots take the same registries, so the layer costs no new builder; the port fits are already there (the
   harbour fort, the harbour tavern, the canal warehouse with its hoist bay, the bonded grain store, the coast-guard
   berth, the watchhouse). The **source library** is lifted by name only for the landmarks the catalog lacks
   (`settlements/voth/vothlift.py`: the Temple pyramid's tiers for the Sun Canton, the Ancestry canton's tombs for the
   necropolis, the Ordinator fortress's walls for the Iron Court), as the Voth city page itself does. Pieces Hook
   needs that neither holds (a sacrifice platform torn down, a slave market's cages) are new catalog entries in the
   Voth registry, not Hook-only code.
5. **Settled (2026-10-17).** Both, by who needed what: the Izani repaired what the fleet and the customs need and
   left the rest as it fell. The Vothic garrison fought from the Iron Court and the pens; the town surrendered whole when
   the fortress fell, so the fighting marks only the eastern harbour.
   - **Open ruin** (Port decay 1, rubble and scorch dressing): the Ordinator fortress's wall across the deep-water
     berth, breached where the Izani mechs came through; the submarine pens' roof, holed; the Stacks' seaward row,
     burned (its people camp in the compounds); the covered graving dock's east end, with the half-built chitin bireme
     inside it.
   - **Torn down on purpose**: the Temple pyramid's summit platform and altar (the tiers stand, the Izani sun painted
     over the diamond); the Vothic statues on the pier's head, toppled and left; the slave market's cages, empty,
     their doors off.
   - **Repaired first** (Port decay 0, with fresh-repair dressing: new timber against old, scaffolds, Islander scrap
     patches, Izani orange on the rails): the pier, the Imperial quay, the Customs House, the working cranes and the
     container dock. The garrison's work shows: an Izani legion camp of tents on the heliport apron below the pyramid,
     two Iziz war-walkers (`kits/mechs`) standing at the pier's head and the Customs forecourt, the sun on every gate.
   - **Untouched**: the Point, the Strand, the Tethyan quarter, the Heights, the necropolis.
   - **How it is drawn**: a `damage` field (0 to 1) painted on the site as a zone property, read like any rule: a Port
     segment under it takes decay 1 at 0.5 and above (decay 3 only in the Stacks, reclaimed long before the war); a lot
     at 0.7 and above becomes a rubble lot dressed by the Port kit's salvage pass and `kits/post-apoc` scrap; a lot
     between 0.3 and 0.7 keeps its building and gets scorch and scaffold dressing records; the breach, the holed roof
     and the cut summit are explicit landmark records. The Vernacular and the Voth catalog get no ruin variants. It is
     a few months old: no regrowth, no weathering on the breaks, fresh paint over the diamonds.
6. **Settled (2026-10-17).** Section 3's zone table: the lot mix per zone, who holds it at game start and its mood.
   The Izani hold the harbour's working core (the Hook, the Customs, the Iron Court, the Arsenal) and the Heights'
   east; the Chichani are a quarter of the city, in the Sun Canton and on the Heights' west slope; the Hukoa are the
   largest people and hold the west end; the Hykkousoi quarter runs itself under the alliance; the Stacks belong to
   nobody, and hold the freedmen of the slave market.
