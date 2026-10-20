# The Eternian kit: the design plan (draft, 2026-10-20)

The building kit of **the Eternal State**, the civilization of the north-western lowlands (`LORE.md` §6.19: the True
Heirs, the paper state, Farport, the look). Catalog and `core/tags` culture **`eternian`**; sign a **gold face with its
eyes closed on black, with green highlights**; kit colours black, gold and green (the owner, 2026-10-19). Outsiders call
the State the Shining Kingdom, for its rulers and its glazed roofs.

Owner's brief (2026-10-19, in conversation): a bureaucratic Chinese-style kingdom ruled by a caste descended from the
Ancients' highest class, metallic skin and hair, long-lived, aloof, ancestor-worshipping, with extensive public statuary,
giant faces and heads above all; seats of power in well-maintained Ancient ruins and a vernacular style beside them;
Gothic remixed with something that keeps it off the Warhammer Imperium (the owner's three reference sets, section 1);
solid, not paper and silk; the hydraulics fit. The capital is built round an arcology, near the placeholder Centrum
(px 223,315), the name perhaps swapped with Fulcrum (px 339,266); the owner decides the site later.

Everything marked *proposed* is this draft's and waits on the owner. Read `kits/islanders/README.md` for the precedent
this kit follows (a culture kit forked from the Scyvoi engine, poor to court, every census trade, verified), and
`settlements/iziz/VASSAL-KITS.md` §1 for how a kit's sheet and a city page share one file list.

## 0. What the build is

| | |
|---|---|
| Folder | `kits/eternian/` (`src/`, `refs/`, `build.py`, `verify.py`, `materials.json`, `tex/`, `INDEX.md`, `PORT.md`, `KNOWN_ISSUES.md`) |
| Page | `dist/eternian.html`: the kit sheet, every building in rows by tier, the statuary row, a mixed canal street, a court gallery over water, one Ancient host kept with its tracery infill |
| Engine | *proposed*: the **Scyvoi engine, vendored** as `kits/islanders` and the nomad kits did (`python3 build.py --vendor-check` against `kits/scyvoi/src`), because it already carries tiers, trades, interiors, harbours and mines. The alternative is the catalog ASSET route `kits/beast-riders` took, right for a few buildings and wrong for fifty |
| Registry | `ET.def` (one def per building, tags `culture:'eternian'`, `tier`, `style`, `role`, `job`); the statuary as defs too (`role:'statue'`), so the city builder places a head as it places a house |
| The hosts | `kits/ancients` read in place, never copied: **the Sanctum** (`targets/sanctum`, the capital's arcology, built 2026-10-20 in place of Plymouth; its retrofit is `palace/BLUEPRINT.md`), the memorial set and the towers, in a new decay state **`kept`** (section 7) |
| Town | `core/city` on the site layer when the capital's page comes (section 8): the canal town on `alleys` and main streets, the ministries' quarter on `frontage-courts`, the court on the host |
| Core | `core/rand`, `core/mask`, `core/tags` (the culture added to the vocab, `core/tags/52-core-tags-vocab.js`), `core/space`, `core/lod`, `core/host`, the shared sky; `core/furnish` with an `eternian` catalog set (section 9); `core/materials/record` through `materials.json` (section 10) |
| Biome | `biomes/nwlowlands` read in place (Asian and Australian forms at 1.5x, sea pens, glow-willows) |
| Out of scope here | the **Yeti Kingdom** (its own kit on the highlands' or a cold core), the **cybernetics tribe** (the dark mechanical-organic look, `refs/machine-35`: a kit of its own on the Post-Apoc and Ancients kits), the **dam-basin bandit camps** (Post-Apoc on grounded hulls from `settlements/port` and `kits/ringsea`), **Farport**'s page and the visitors, the Eternian **tongue** (`lore/tongues-of-krator.html`), the **characters** (the costume refs go to `core/charactermodels` when the culture's clothes are drawn) |

The kit goes in the gallery when it first reaches `main` (`gallery/README.md`).

## 1. The reference board

The owner's pictures, copied into `refs/` with descriptive names (48; three sets, 2026-10-19). It is not one style: it
is **Gothic remixed with Art Deco, Soviet monumental and the faceted cubist head**, and the kit keeps the layers apart.
Deco is the lore-correct second ingredient: it is what masons produce when they copy a machine civilization by hand, so a
court that has spent a thousand years imitating the Ancients' Cyclopean Modernism in materials it can work arrives there.

| Layer | What it is | Pictures |
|---|---|---|
| **Host** (Ancient, kept) | the Ancients' own buildings maintained, not patched: white metal panels polished, cyan strips alive where the Machine Talkers have woken a circuit, the lost glass walls infilled with bronze tracery and alabaster | `statue-01` (the panelled colossal face, the tone of the whole kit), `machine-40` (setback towers) |
| **Court** (the Heirs) | the stepped pier bundle, bronze tracery with alabaster lights, galleries over water, metal fish-scale roofs, colossi | `arch-15`, `arch-16`, `arch-20`, `arch-33` (the scale roof), `arch-26` and `arch-27` (scale, not detail), `statue-10`, `statue-13` |
| **Ministries** (the human state's rich and civic) | Deco-Gothic setback towers in pale brick and dark stone, verdigris bands, figures in niches, glazed celadon roofs, Ancient parts set in as structural relics, the tube network, the Clock | `arch-17`, `arch-18`, `arch-19`, `arch-21`, `arch-22`, `arch-28`, `arch-29`, `machine-36`, `machine-37`, `machine-38` |
| **Common** (the canal town) | white lime and grey tile, cast pattern block, stepped parapets, fluted bays, shutters, a mask over every door; verdigris turrets and lanterns at night | `arch-30`, `arch-31`, `arch-32`, `arch-34`, `machine-39` |
| **Statuary** | faceted heads and figures, closed-eyed, in the metal of their rank; mechanical faces that talk | `statue-01` to `statue-13`, `statue-05` and `statue-06` (the talking heads) |
| **Costume** (for the character kit, not this one) | the disc halo, the closed-eyed white mask, the visor, the circuit-maze brocade; the Heirs in celadon and teal with bronze-orange, the ministers in the State's black | `costume-41` to `costume-48`; `costume-48` is the single best reference of the three sets |

Form only, wrong finish: `arch-23` and `arch-24` (the composite already, but the gold ratio is too high: gold stays on
the Heirs' persons and the finials), `arch-25` (its massing, not its fuss), `statue-05` (rust: the kit never rusts).
**Leave out:** `statue-14` (the striding worker with lightning bolts is the Imperium's pose and the Soviets' both).
`machine-35` (Shibuya) is the cybernetics tribe's look, not the State's.

## 2. The rules the generator follows

- **The master mass is the stepped pier bundle** (`arch-15`, `arch-16`): piers stepping up in organ-pipe ranks to a
  spire, 3 to 9 ranks, each rank a box; the gable between them a concave or stepped curve. A civic building is a
  variation of it from a gatehouse to a colossus's plinth. Storeys 4 to 5 m; a rank steps 1 to 2 m; the spire 1.5 to 2.5
  times the body's height. The ministries' towers are the same bundle with Deco setbacks and copper ribs (`arch-22`).
- **Two openings.** The **lancet** (tall and narrow, 1:5 to 1:8, in bundles of three to seven under a stepped head) and
  the **oculus**, a ring window over every door (`arch-15`, `arch-34`). The court glazes both in alabaster behind bronze
  tracery; the ministries in glass behind bronze or timber lattice; the common town shutters them.
- **The tracery's origin:** nobody can make the Ancients' blue glass, so where a glass wall went the Heirs filled the
  opening with a bronze grid of small panes. The tracery module is a grid first and a Gothic figure second: mullions,
  transoms, then a stepped or pointed head, never flamboyant curves.
- **Figures in niches at the pier tops** (`arch-21`, `arch-29`): a faceted head or a standing figure crowns each pier,
  eyes closed, in the metal of its rank (section 5). A civic door is held up by an ancestor with arms spread (`arch-18`).
  Every door below civic carries a mask.
- **Roofs by tier:** glazed celadon tile, steep, on the ministries and the rich (`arch-28`); metal fish-scale shingle on
  the court's pavilions, gold, bronze or gunmetal (`arch-33`); grey tile on the common town; reed on the poor. Ribbed
  domes are allowed on the ministries only, in celadon, so that the kingdom's crown stays the pier and Jimjam keeps the
  dome.
- **Brick fired pale**, buff and cream, laid in vertical piers. Jimjam's red and yellow brick, white marble trim, domes,
  staged spires and Tudor chimneys stay Jimjam's: a traveller knows which side of the Cut they are on by whether the
  city points up or domes over.
- **Pattern block** on the common town (`arch-31`, `arch-32`): cast silt-concrete block with a geometric relief, pierced
  where a wall must breathe. Geometric only, **never glyphic**, or it reads Mesoamerican and walks into Voth.
- **Solid, not paper** (the owner): no shoji, no silk screens; alabaster, bronze, stone, timber.
- **Never Warhammer:** no skulls, no buttress forests, no grime, no rust, no gargoyles, no weapons in the statues'
  hands, no heroic striding poses. Verticals are broken by long horizontals (the eaves, the galleries); courts are kept
  almost empty, because there are only a thousand Heirs; scale comes from the hosts and from emptiness.
- **Palette** (from the pictures): pale brick `#D9CDB4` and `#E8E0CC`, dark stone `#4A4A50`, celadon glaze `#8FB8A0`,
  verdigris `#5E9C86`, pewter `#8A8F96`, bronze `#9C7A3C`, gold `#D8B24A` (accent only), gunmetal `#4A5058`, alabaster
  `#EFE7D6` (translucent), Ancient white `#EEEBE5`, cyan strip `#39D6E8` (emissive, hosts only). The culture's sockets
  (banners, awnings, flags) take the kit colours: black `#141416`, gold, green `#3F8A5A`.

## 3. Living beside the neighbours

- **Jimjam** (`settlements/jimjam`, `JJ.def`): the same silt, the same kilns, a different grammar (section 2, brick). The
  two kits may share a street at Fulcrum or a caravanserai; the contract is the cornice-line rule of
  `VASSAL-KITS.md` §2 (a mismatch over 0.5 m is an `o.scale`, not an edit to either kit).
- **The Ancients kit** (`kits/ancients`): the hosts are read in place; this kit adds the `kept` state and the tracery
  infill as its own module that takes an Ancients body's opening list (section 7).
- **The Republic** (`settlements/highlands`, the Rustic and Republican branches): the eastern highlands; no shared
  streets, a border post at most.
- **The Post-Apoc kit** (`kits/post-apoc`): the dam-basin bandits' camps and the State's own slums take it with the
  `eternian` sockets, as Pylon's salvage tier does.
- **The port kit and the Ring Sea kit** (`settlements/port`, `kits/ringsea`): grounded Ancient hulls for the basins, and
  the Ancient parts the ministries set into their walls (a prow, a turbine casing).

## 4. What the kit holds (about 55 defs, *proposed*)

Styles in the `style` tag: `host`, `court`, `ministry`, `common`, `poor`.

**Dwellings**

| Key | Tier | What |
|---|---|---|
| `et_reed_house` | poor | silt brick under reed, one room, a painted face where the mask would be |
| `et_block_hut` | poor | a single pattern-block room with a lean-to, a lead mask over the door |
| `et_canal_row` | poor (multi) | a row of three narrow block houses on a canal, shared stair, shutters |
| `et_canal_house` | middle | two storeys, white lime over block, a fluted bay, stepped parapet, shutters, an oculus over the door (`arch-30`) |
| `et_court_house` | middle | a courtyard house behind a pierced block wall, grey tile, a household shrine niche with the family's heads (`arch-32`) |
| `et_corner_turret` | middle (multi) | a canal corner block with a verdigris turret and lantern bracket (`machine-39`) |
| `et_merchant_house` | rich | three storeys, pale brick piers, lancets in bundles, celadon roof, a bronze door with a face |
| `et_official_villa` | rich | a walled compound: hall, register room, garden court with a reflecting basin and the family gallery of heads |
| `et_heir_pavilion` | court | a pavilion of bronze tracery and alabaster on a stone podium over water, metal fish-scale roof |
| `et_heir_gallery` | court (segment) | the covered gallery: tracery on one side, solid on the other, a head niche every bay; chains across water and ruin |

**Civic and the State**

| Key | What |
|---|---|
| `et_ministry` | the stepped pier bundle in pale brick, figures in the niches, a celadon roof, the tube station in its base |
| `et_registry` | the land and census registry: a long hall of lancets, a vault, the examination court beside it |
| `et_examination_hall` | cells round a court under a tower, where the ministers are made |
| `et_customs_house` | Farport's and the Cut road's: an oculus wall over the gate, the weighing hall |
| `et_clock` | **the Clock**: an Ancient automaton facade bridging a street, ancestor figures that parade on the hour, verdigris and gold (`machine-38`) |
| `et_tube_station` | a bronze pipe head in a niche, the capsule rack, the clerk's desk; pipes run along streets as a `core/city` overlay (section 6) |
| `et_relic_hall` | a ministry built round an Ancient part: a hull's prow as the apse, a turbine casing as the gate (`machine-36`) |
| `et_gate` | a city gate held up by an ancestor with arms spread (`arch-18`) |
| `et_wall`, `et_wall_tower` | pale brick on a stone base, the tower a pier bundle; the northern frontier's version taller and blind |
| `et_barracks` | the frontier army's: a pattern-block quadrangle, distrusted and kept outside the wall |

**Religion and the Heirs**

| Key | What |
|---|---|
| `et_ancestor_gallery` | the hall of heads: niches by rank, veiled heads among them; the city's temple is this |
| `et_shrine_niche` | a street shrine: one head, closed-eyed, with a lamp |
| `et_talking_head` | an Ancient terminal face in a bronze surround on a wall; the petition stand before it (section 6) |
| `et_withdrawal_house` | the sealed house nobody names: blind piers, one oculus, a gallery in and none out |

**Trade** (every Voth census trade, `IS_TRADES`, as the Islanders kit did; the ones with a face of their own)

| Key | What |
|---|---|
| `et_kiln` | the brick and tile kiln, a bottle kiln in pale brick, the glaze shed |
| `et_tile_works` | the celadon works: drying racks, the glaze vats |
| `et_paper_mill` | on a canal: the vats, the drying loft, a waterwheel |
| `et_printer` | the block printer's shophouse, the type racks |
| `et_porcelain` | the porcelain works, the muffle kiln |
| `et_tea_house` | the lowland infusion house, a canal terrace |
| `et_warehouse` | a canal warehouse with the round windows (`arch-34`) |
| `et_market_hall` | a hall of lancets on a canal basin |
| `et_smithy`, `et_bakehouse`, `et_butcher`, `et_tannery`, `et_healer`, `et_inn`, `et_granary`, `et_farmstead`, `et_windmill`, `et_salt_works`, `et_mine`, `et_stock_pens` | the census trades in the common style |

**Hydraulics and harbour**

| Key | What |
|---|---|
| `et_canal`, `et_lock`, `et_bridge` | the canal profile, a lock with its bronze gear, a pointed-arch bridge with a head on the keystone |
| `et_reservoir_wall`, `et_spillway` | the Khmer pattern: a stepped reservoir wall; the spillway through a carved face's mouth (section 5) |
| `et_quay`, `et_dock`, `et_factory_quarter` | Farport's: quays, a dockyard, and the walled quarter the visitors are confined to |

**Statuary** (section 5)

| Key | What |
|---|---|
| `et_mask` | the door mask, 0.4 m, terracotta or lead |
| `et_head` | a faceted head, 1 to 4 m, in a niche or on a plinth |
| `et_figure` | a standing or seated figure, 3 to 8 m, in a niche or on a pier top |
| `et_colossus` | 20 to 60 m, a head or a bust, free-standing or carved into a host or a cliff |
| `et_dam_face` | a face carved into a dam breach or gorge wall, the spillway through the mouth (terrain-attached) |

## 5. The statuary

The kit's novel piece, and the reason the Deco-cubist head was chosen: a face built from planes is something a
generator can make in a hundred variants where a smooth portrait is not.

- **The head generator** (`et_head`): a parametric faceted head from a dozen planes (brow, cheek, nose, jaw, lips, lids)
  with a seed from `core/rand` (world, cell, index, salt), a few proportions (long, broad, aged, young), **eyes closed by
  default** (the dead) and open on request (the living), and a headdress socket (the stepped Deco crown, the ring, the
  fan). Every head is tagged with its ancestor's rank, which sets the material.
- **Metal by rank:** gold, silver, bronze, gunmetal, matching the Heirs' skin (`LORE.md` §6.19); stone for humans'
  ancestors; terracotta or lead for the door masks. The material is a `KMAT` record, never a per-head texture.
- **Closed eyes are the dead, open eyes the living, and the city is mostly closed eyes.** `verify.py --assert` counts
  them: on the sheet and later on the page, open-eyed heads are under a tenth.
- **Veiled heads:** a head def with a bronze veil, placed in the ancestor gallery and nowhere else, a few per gallery.
- **Where heads go** (the city builder's rules, `core/city` records): a mask on every door below civic; a head in every
  gallery bay and pier-top niche; a figure at every civic door; a colossus per host and per city gate; the dam faces on
  the terrain where the model's breach channels and the Farside gorge are (`DATA.floods`, the outlets), placed by the
  page, not the kit.
- **Poses:** standing, seated, arms spread holding a lintel, hands folded. Never striding, never armed.

## 6. The machine layer

- **The talking heads** (`et_talking_head`): an Ancient terminal face (`statue-05`, `statue-06` for the form, polished
  not rusted) in a bronze surround, with a petition stand. On the page it is a `core/tags` record with a `voice` tag the
  life pass can use; on the sheet it is lit (a cyan strip in the surround).
- **The tube network:** the kit ships the station def and a pipe segment (bronze, on brackets, 0.3 m bore); the city page
  runs the pipes along main streets between stations as a `core/city` overlay, the way Verge's levels place their
  services. The pipes cross canals on the bridges.
- **The Clock** (`et_clock`): one per city, bridging a street, a bronze automaton: on the hour the figures parade. On
  the sheet it animates; on the page its hour is the page's sky.
- **Ancient parts in new walls** (`et_relic_hall`): the ministry def takes a `relic` option naming a part from the port
  kit or the Ancients kit (a prow, a turbine casing, a ring segment) and builds its brick round it.

## 7. The Ancient hosts: the `kept` state and the tracery infill

- The Ancients kit draws its buildings in states (intact, ruined, toppled, rehabilitated, worn; Pylon added
  `repaired`). This kit adds **`kept`**: the body intact and polished, the panel joints sharp, no vines, no corrugate, the
  cyan strips alive on a fraction of runs (0.1 to 0.3, seeded), and **every lost glazed opening infilled with the bronze
  tracery module** holding alabaster. The state is implemented in this kit as a pass over an Ancients body's record (its
  opening list), not an edit to the Ancients kit.
- **The capital's host is a new arcology, the Sanctum** (the owner's name, 2026-10-20, first called the Coil; in place of the proposed
  Plymouth): an Ancient live/work arcology of Plymouth's volume (45 Mm³) but 2.5 times its height, a tapering drum on a
  six-pointed podium, three great arches in a triangle at the heads of three of its six stairs and from each a
  staircase spiralling counterclockwise up to the next arch and balcony (thirty arches in all), small entrances at the
  heads of the other three. Built in `kits/ancients/targets/sanctum` (`dist/sanctum.html`: as built, and as the Heirs
  keep it). Its retrofit as the True Heirs' forbidden city is `palace/BLUEPRINT.md`: the Forbidden City
  turned on end, height as rank. That retrofit is the first worked case of `kept`: `8aq1-sanctum-kept.js` is the Heirs'
  deltas on the Ancients' records, and moves into this kit at P0. The ministries stand at its feet, the canal town
  spreads from it.
- The memorial set and the towers appear as the kingdom's other seats in `kept` and as ruins in the countryside in the
  Ancients kit's own states.

## 8. The capital and the site

The site is the owner's to fix. What is known: the capital stands round an arcology near Centrum (px 223,315) or, if the
names are swapped, Fulcrum (px 339,266, on Jimjam's lake); from Centrum, Farport 407 km north-west, Roketstad 241 km
east, Jimjam 537 km, Dilihan 500 km, Leng 182 km north, Henge 195 km south, Carcosa 389 km south-west; the Republic's
polygon edge lies at px 226, which wants checking on the model. The capital's page is `settlements/<name>/` when it has
a name, on `core/city` and the site editor, on this kit's `ET.def`, with the hydraulics (canals as streets, the
reservoir on the high side, the spillway faces) in the site layer. Its name in the Eternians' own mouth is open.

What the page will need from the model before P5: the capital's point typed `city`, the Sanctum placed on it or an
arcology point beside it (its podium is 690 m across, its moat 790), the lake's shore and the river's course (the Farside river if the site is on Jimjam's lake), and
the political polygon (the live model no longer has a Shining Kingdom polygon; the stale export's covered the whole
quadrant).

## 9. Interiors and furniture

- **The catalog culture file** `kits/catalog/krator-master-furniture-eternian.js` in the furniture SPEC shape, three
  tiers: poor (block bench, reed mat, a clay mask shelf), common (the register desk, the tube clerk's rack, lattice
  screens, a celadon stove), court (the alabaster lamp, the bronze gallery bench, the ancestor niche with its head, the
  petition stand, the visor case). The rest from the generic containers, food and supplies.
- **The interiors set** `kits/interiors/sets/eternian.js`: the rooms of the dwellings and the halls; the chain `eternian
  -> generic` (no cousin culture to borrow from; Jimjam's set does not exist yet, `settlements/dilihan/PLAN.md` §5).
- **The ancestor gallery's interior** is the kit's showpiece room: a long hall, heads in niches both sides by rank, the
  veiled ones, the lamps.

## 10. Textures (to add to `core/materials/PROMPTS-NEEDED.md` once the owner agrees)

Reuse first: `brick` (a pale buff colourway if the set tints; else a gap), `metal.bronze`, `tile.glazed`, `roof.tile`,
`organic.scale` (the metal fish-scale roofs, tinted), `concrete`, the Ancient white panel family, `patterns/highlands/tile-*`
for the glazed scale look. Likely gaps: **pale buff brick** with lime mortar; **celadon glazed tile** (plain, crackle
glaze); **alabaster** (translucent, veined; a colour map and a thickness map); **bronze tracery** as a cut-out on magenta
(the grid, three heads: stepped, pointed, ring); **pattern block** relief (three geometric blocks, normal map); **verdigris
copper sheet**; **a culture pattern sheet**: the circuit-maze band in black and white and in gold on black. The prompts are
written when the owner agrees the list.

## 11. Phases

| Phase | What | Done when |
|---|---|---|
| P0 | `kits/eternian` scaffold: the engine vendored, `build.py` (the port lint), `verify.py` on `tools/harness.py`, the sheet target, `INDEX.md`, `PORT.md`; `eternian` in the tags vocab | the sheet builds with the first building (`et_canal_house`) and `--assert` passes. **Done 2026-10-20** on the Scyvoi engine (question 1 below taken as the draft assumed): the canal house, the toolkit's first pieces, the catalog's Eternian common tier, the culture registered; textures and the socket pack wait for P1 (`KNOWN_ISSUES.md`) |
| P1 | materials and kit items (`et*`), the profile helpers: the pier bundle, the lancet bundle, the oculus, the stepped head, the tracery grid, the pattern block; `materials.json` on the library | the helpers render on a test row; the texture gaps are listed. **Done 2026-10-20**: `materials.json` (26 keys on the library and the owner's sets, alternates per instance), the helpers and their test row, `ET_TRADES` in the repo's shape with the shared `voth-trades` check (`tools/check_trades.py`; the owner's Islanders route): 41 gaps, each naming its def and phase; the core/sockets pack moves to P4 |
| P2 | the head generator (section 5): heads, figures, masks, the closed-eye count in the verify | a row of fifty seeded heads reads as fifty people and four metals. **Done 2026-10-20**: `src/42-et-head.js` ([G data]) and `src/43-et-statue.js`; heads, figures in four poses, masks in gold, silver, bronze, gunmetal, stone, terracotta, lead and titanium; `etMask`'s stand-in replaced; `closed-eyes` in `verify.py --assert`; the Sanctum reads the generator in place (twelve variants by record id, the colossus its own, the face-stones mask shells) |
| P3 | dwellings, all tiers, and the mixed canal street | the owner's eye-level review of the street. **Done 2026-10-20** (awaiting that review): the reed house, the block hut, the canal row; the court house, the corner turret; the merchant's house, the official's villa (household service); the Heir's pavilion (three roof metals) and the Heirs' gallery; `et_canal`, `et_bridge` and `et_canal_street` (every tier on the quays); the roofs (`44-et-roof.js`); the catalog's poor and court pieces; the owner's furniture and wall sets (ten, delivered and wired 2026-10-20) |
| P4 | the State: ministries, registry, examination hall, gate, wall, the Clock, the tube station and pipe, the relic hall, the ancestor gallery, the talking head | the civic row reads; the Clock animates |
| P5 | the hosts: the `kept` state and the tracery infill moved here from the Sanctum (built first, 2026-10-20: `palace/BLUEPRINT.md`) and put on two memorial bodies; the court pavilion and gallery over water | the host row reads at night with the cyan alive |
| P6 | trade, hydraulics, harbour: the census trades, the kiln and tile works, canal, lock, bridge, spillway face, Farport's quays and factory quarter | `IS_TRADES` complete; the spillway face runs water |
| P7 | the catalog culture file, the interiors set, the furnished cut-away; the Godot export check on the sheet (`core/export`); the gallery | the sheet exports and passes its Godot case; Krator Worlds carries the page |

After P7: the capital's page (section 8) as its own plan, and the Yeti, cybernetics-tribe and bandit-camp pieces as
theirs.

**The first pass (the owner, 2026-10-20: "step 1 sounds good").** The kit ships in two passes. The first: the head
generator and the closed-eye rule, the dwellings poor to court and the mixed canal street, the State (ministry,
registry, gate and wall, the Clock, the ancestor gallery, the talking head), canal, lock and bridge, the kept host (the
the Sanctum, done first), and the trades that are Eternian (kiln, tile works, paper mill, printer, porcelain). The
second: the generic census trades, the reservoir and the dam faces (the capital's page places them), Farport's quays and
factory quarter (with Farport's page), and the interiors and furniture. The neighbours: the **Yeti Kingdom** and the
**cybernetics tribe** are kits of their own; the **dam-basin bandits** are a settlement on existing kits (Post-Apoc on
the port and Ring Sea kits' grounded hulls), not a culture.

## 12. Open questions for the owner

1. **The engine: settled** (the owner, 2026-10-20): the Islanders route, the Scyvoi engine vendored (P0 built on it),
   because it ensures a complete set of trade buildings: `ET_TRADES` (P1) lists every Voth census trade in the repo's
   shape (`tools/check_trades.py`), each carried, a gap naming the def and phase that will carry it, or na; the
   buildings fill the gaps through P3 to P6, and KNOWN_ISSUES.md lists those still open.
2. **The capital's site and name:** Centrum or Fulcrum; the city's own name; what the Eternians call the Sanctum.
3. **`kept` as a new Ancients state** implemented in this kit as a pass over a body's record, or added to the Ancients
   kit itself for every build to use?
4. **The closed-eye rule** (open-eyed heads under a tenth) and the ban on striding and armed statues: hold them as kit
   invariants in `verify.py`?
5. **Red:** the draft keeps red out of the kit entirely (the Republic's and Jimjam's); the owner's red-maze costume
   reference (`costume-41`) would then be a foreign dress or dropped.
6. **The refs:** kept in plain Git under `refs/` as Pylon's and Zeijani's are (9.8 MB, 48 files), or trimmed?
7. **Textures:** agree the gap list of section 10 before the prompts go to `PROMPTS-NEEDED.md`.
