# Zeijani kit: design rules for a new def

Short rules for anyone adding a def to the kit. The reasoning is in `PLAN.md` (6.1 to 6.4, the progress log); the
contract is in `API.md`; what is still wrong is in `KNOWN_ISSUES.md`.

## 0. Where a def goes

| Family | Fragment |
|---|---|
| wooden dwellings | `43-zj-wood.js` |
| carved galleries, estates | `44-zj-gallery.js`, `45-zj-estate.js` |
| constructed houses (and `zbBody`, a planned body drawn) | `46-zj-built.js` |
| shops (generated from the trades' items) | `47-zj-shops.js` |
| sacred: kiva, shrine, catacombs, temple | `48-zj-sacred.js` |
| civic: council, cistern, portal, town hall, caravanserai | `49-zj-civic.js` |
| works and farms | `50-zj-works.js` |
| the guard and the outpost | `51-zj-guard.js` |
| tavern, inn, stalls | `52-zj-trade.js` |
| PLAN.md 13's additions | `53-zj-additions.js` |
| the square: park, row house, market hall, fountain | `54-zj-square.js` |
| shared forms (domes, arches, niches, bands, fixtures) | `42-zj-forms.js` |

A new def also needs: a row in `89-rows.js` (else `kit-coverage` fails), an interiors item in
`kits/interiors/sets/zeijani.js` if it has rooms, and a `DH.FOOT` row in Dhelv's layout if Dhelv places it.

## 1. Rock, finish and colour (PLAN.md 6.1)

- **Two host rocks.** Tuff (cream to rose, soft: the spires and the galleries) and basalt (the tubes). It is tuff, not tufa.
- **A carved surface takes its host rock's colour, with a finish by wealth:** hewn (poor: pick marks), plastered and painted
  (middle), polished (wealthy and civic: deeper colour, a satin sheen). The finish is a material over the rock's colour, not
  a new colour. Set `finish` on the def's tags and pass it to `cvFromItem`.
- **The tubes** are Raufarhólshellir's: the glazed blue-grey lining low on the walls, the oxidised breakdown (deep red, rose,
  rust, mauve; patches of purple, blue-violet, teal; sulphur specks, white crusts) above. The cavern writes these as weights;
  do not paint them on.
- **Polished oxide is prized:** the wealthy have red rooms; the poor galleries in tuff are cream. Murals use the cave's
  oxides and the alecap's purple.
- **Light:** keep the key light near white (daylight down the wells, warm-white oil lamps). Glow fungus is an accent; as
  the main light its teal turns the reds to mud.
- **Textures are library sets** (`materials.json`, `tex/`). No canvas painters; if one is unavoidable, bake it to PNG. If a
  surface has no good texture, ask the owner (the repo's CLAUDE.md).
- **Metal copper reads black on large surfaces** (no environment map). Use it for finials and burners; a dome or a disc takes
  stone, or a matte bronze colour on `plain`.

## 2. Form and ornament (PLAN.md 6.2)

- Dwellings are rounded: domes, corbelled vaults, round rooms and doorways.
- Civic buildings are larger and blockier.
- Wealthy and civic surfaces are ornate: relief, labyrinth carving, pierced lattice (`jali`).
- Constructed buildings are tuff ashlar or basalt block. Wooden ones use the kipuka's timber (log, plank, thatch), with
  raised floors in the wet.
- The sources: fantasy dwarves (mass, deep lintels, banded geometry), the Pueblo and the kiva (terraces, ladders, roof
  hatches, masked figures), the Ashlanders (shell domes, bone, chitin), Cappadocia (rock-cut rooms, dovecote fronts, painted
  vaults), Petra (columned fronts), Ethiopia (monoliths, trench churches, stepped stelae), Varanasi (ghats, lanes, shrines),
  Babylon (glazed relief brick, ziggurat massing).
- **Never copy real katsinam.** Use the style (tablita headdresses, cloud terraces, rain lines, ruffs, masks) for the
  Zeijani's own spirits: the Hidden Ones, the Lamp Mother, the Serpent.
- Signs, awnings, emblems and flags are **sockets** (`sock()`), never geometry. A trade has one sign, the same on its carved
  and its constructed front.

## 3. How a carved def works (PLAN.md 6.3)

- **Two parts, both in the def's frame:** the front (drawn by the builder: relief, portal, steps, sockets) and the void plan
  (data in the def's interiors item: rooms, `voids`, fixtures).
- **The void plan is the one source.** The cavern carves it, `core/walk` takes its floors and blocks, the interiors kit
  furnishes its rooms, `core/tags` records it. Never draw a room's walls or write its floor by hand.
- **Origin at the front's foot** (`originFront: true`), the rock behind it at -z.
- **Keep 0.8 m of rock** between the plan and the outside and every other building's voids (`cavern-rock`). Voids of one
  building that meet name each other in `joins`.
- **Every opening is declared:** a `door` where a void meets the air through a face, a `well` where it meets the sky
  through the ground. An undeclared opening fails `cavern-sky`.
- **Carved furniture is structure:** bed shelves, benches, hearths, niches, pillars, the kiva's burner are room `fixtures`
  (walk blocks, drawn by `zfFixtures`), never catalog pieces. A bed shelf says `bed: n`, which the residence rule counts.
- **A round room needs a straight wall** for a back piece (an altar, a bed): use the set's `dee()` outline (the kiva's flat
  back).
- **Rock left standing** (Kailasa, Lalibela) is a `monolith` inside a `trench`; rooms carved into it come after it (phases).
- **Windows are cuts with no walk floor.**
- **Constructed and wooden defs** are ordinary builders with `IX.planBuilding` interiors (`cut: true` so the cut-away opens
  them). A planned body is drawn by `zbBody`; every reader takes the record's id prefix (`zwPrefix`), or each gets a
  different plan.

## 4. Drawn faces against carved faces

The cavern meshes the rock at 0.5 m cells; anything the builder draws must not lie on the rock's surface.

- **Frames stand 2 cm inside every cut, and lintels under its ceiling**, so no drawn face lies on the rock's. A drawn face
  on a carved face z-fights.
- **Two drawn pieces must not share a plane either** (the stone door's lintel against Dhelv's wall round it shared a soffit).
  Stand one clear of the other or over it.
- **Niche lamps stand on their sills**, not inside the face. Parapets and rails on rounded rock are set in from the edge and
  sunk 0.3 m into it, so none floats.
- **Furniture in carved rooms** is placed in the outline drawn in by 0.25 m (the cavern rounds corners and bulges at the floor).
- Water lies under its rim, never inside a solid basin.

## 5. Walk floors

The walker, the nav graph and Godot's navmesh all read the walk map, so its joins matter.

- **Every doorway strip overlaps the floors it joins** at both ends (`walk-joins`). A room's walk edge is 0.3 m inside its
  outline; a door strip runs 0.4 m into the room.
- **No exact abutments.** An exact join leaves a hairline with no floor: overlap by about 0.15 m (the temple terrace's slot
  over its stair's head). An entry strip at a ground opening runs a little past its edge onto the ground; on a ladder keep
  that overlap under 5 cm (a walker keeps to the higher floor across an overlap).
- **Stairs between stacked rooms come in from the side.** A straight stair under an upper room is lost to that room's floor
  (a walker coming down keeps to it). A stair through a room's own air has nothing under it.
- **A stair's end sits 0.25 m inside a many-sided room's walk edge** (that edge runs nearer mid-side than the radius says).
- **A stair up to a node other ways leave ends on a level landing** long enough to clear them.
- **A planned body's upper floors are cut round their stairwells** (`zwItem` does it), so a walker can go down.
- **Walk blocks are upright boxes on the world's axes.** On a turned site a long block is cut into 0.8 m pieces
  (`cvFromItem` does it for `block` voids); write your own blocks the same way.
- **Give the item a `route`** (`[[label, x, z, expect], ...]`, or `'planned'`): the probe walks it on the sheet, and a
  route's negative (a stair or passage left out) must fail.

## 6. Rules every def keeps

- All randomness through `rng()`, `rr()`, `pick()`; `place()` reseeds from the def's seed. No `Math.random`, no sin hashes
  (noise is `KRAND.h3`).
- Declare `w`, `d`, `h` honestly (verify allows 1.6 m over in plan, 1.5 m in height).
- Register before drawing: `place()` does it for the def; anything else a builder places (a room, a piece) goes through
  `FURNISH` or the interiors pass, which register it.
- Every building has `types`, a `wealth`, a `style` and a `rock`.
- Fragments pack many statements per line: use `/* */` comments, never a trailing `//`.
