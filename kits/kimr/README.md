# The Kimr kit

The Labyrinth's people (`LORE.md` 6.24; the tongue: `lore/kimr-tongue.md`): their raised pueblos, "southwestern meets Cimmerian". The
design sheet, the rules every def follows (palette, architecture, masks, regalia, weapons, pottery, motifs), is
`biomes/labyrinth/KIMR.md`; the plan of the kit is `PLAN.md`.

```
python3 build.py                                  # dist/kimr.html: the sheet
python3 verify.py dist/kimr.html --assert         # the kit's checks, each with its negative
KRATOR_GL=gpu python3 ../../tools/harness.py lock --lane auto -- python3 verify.py dist/kimr.html --assert
```

## What the sheet holds (2026-11-11)

**One def, `km-house`: the example house, a clan's pueblo on its rock** (the owner, 2026-11-11: "grab the pueblo builder and build me
an example house"), in three yards (`v` 0, 1, 2: 12, 14 and 16 m wide).

| Part | From | Where |
|---|---|---|
| the room blocks: a U round a yard open to the front, the back block stepping up four storeys, the sides three; stores below, homes above, the hero's rooms on the back's top terrace; doors onto the terraces, roof hatches, ladders, every room reachable | `core/pueblo` (`KPUEBLO.house`), read in place | `KM_HOUSE.spec` in `src/44-km-plan.js` |
| the rock: 7-10 m, battered, faced in rough blocks largest at the foot, boulders round it; the long ladders up its front | this kit's site record (`kmSite`): core/pueblo has no platform yet | `src/44-km-plan.js`, drawn in `src/46-km-draw.js` |
| below the rock: the round room under a glyptodont's shell, the pen walled with mammoth bones under a gate of two tusks, the dung walls | the site record | same |
| the dress: the Aurochs skull on its post over the hero's roof, mammoth ribs in the outer parapets, ochre hand-prints by the doors, drying racks | the site record | same |
| the look: adobe over a stone course, the hero's rooms washed in kaolin, T-doors under painted hide screens, vigas capped in horn, ladder poles horn-capped | `biomes/labyrinth/KIMR.md` section 3 | `src/46-km-draw.js` |

**Host API** (so far, for a world that wants the house): `KM.plan(v)` the plan, `KM.site(P)` its rock and dress records, and the def
`km-house` through `place('km-house', x, z, ry, {v})`. A world registers it through `place` (core/tags: the house, its 49-56 rooms, its
ladders, the rock, the round room, the pen, the crest).

**Matrilineal:** the house's rooms pass from mother to daughter (LORE.md 6.24). The plan's census counts households; the house's
records carry no owner yet.

**For a world whose page has its own globals** (`kit_bundle.py`, 2026-11-12): `bundle()` seals the kit, `core/pueblo` and the
engine files it draws through (core/engine 10, 27, 30, 36, 36o, 36s) in one closure, `KMK`, after `kits/xanadu/kit_bundle.py`.
`KMK.proto(key, v, {rock})` the def built at the origin into a group (dry: nothing registered), `KMK.register(T, {v, rock, at, ry,
name})` the house and its parts into the page's core/tags registry, `KMK.plan(v)`, `KMK.site(v, {rock})`, `KMK.dims()`,
`KMK.bind(KMAT)`, `KMK.errors`. The page carries three.js, `core/rand`, `core/space`, `core/materials/record` and `core/tags`.
**A world's own rock:** `kmSite(P, {rock: {x0, x1, z0, z1, h, batter, drawn: false}})` stands the house on the world's knob or
bench instead of the kit's plinth (no plinth drawn; the dress below stands on the floor past the given foot). First host:
`biomes/labyrinth`'s Mesas (`src/86p-host-pueblo.js`), which reads the edges off the knob's drawn outline.

## Read in place, never copied

`core/engine` (the building-kit engine), `core/pueblo`, `core/rand`, `core/space`, `core/tags`, `core/materials/record`, `core/furnish`,
`core/atmos`, `core/door`, `core/host`, the placeholder sky. See `PLAN.md`, "Core adoption".
