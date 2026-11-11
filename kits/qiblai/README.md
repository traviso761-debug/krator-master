# kits/qiblai: the Qiblai kit

**Qiblai** is the Xanadu Sultanate's holy city on the sacred river Ālph: the faith of the Decree (*Ḍikrī*) keeps *Kubla Khan* by sound
and turns its prayer wheels for the broken Wheel in the sky (`LORE.md` §6.13; `PLAN.md` section 2a). It is run by a council of abbots
under the Sultan, about 12,000 people in a mandala of nested walled squares round a central Temple Mountain. This kit is its
architecture: **Tibetan cubes with gilt crowns**, a vassal kit of the Xanadu kit (`kits/xanadu`), as Pylon and Talia are of the Iziz
Vernacular (`settlements/iziz/VASSAL-KITS.md`). `PLAN.md` is the design and the owner's answers.

## Build and verify

```
python3 build.py                                   # dist/qiblai.html: the kit sheet (Xanadu's page, with this kit merged in)
KRATOR_GL=gpu python3 verify.py dist/qiblai.html --assert --views "Overview,Mixed street,The Temple Mountain"
python3 ../../tools/build.py kits/qiblai           # the same through the repo's build wrapper (the page cap, build-inputs.json)
```

`build.py` runs `settlements/xanadu/build.py --kit kits/qiblai`: this folder's `src/` joins Xanadu's one fragment order (a clashing
name stops the build), `targets/kit/` is the sheet, and `kit.json` names the extras (core/atmos and core/water for the still water,
the furniture bundle and the interiors core for the Q6 rooms). Xanadu's own pages come out byte-identical without `--kit`.
`verify.py` runs Xanadu's verify with one more invariant: the mixed streets' overlap audit (`QB_streetAudit`).

## The contract (PLAN.md section 6; VASSAL-KITS.md section 2 applied to Xanadu)

| Rule | Xanadu kit | Qiblai |
|---|---|---|
| Engine | `XA.def` on `VERN.def`, the `xn*` helpers, `x*` items | `QB.def` is `XA.def` with `culture`/`kit` `qiblai`; `qn*` helpers; `qCube*` items |
| Keys, seeds | `xa_*`, up to 32951 | `qb_*`, 33000-33999 (houses 33100, trades 33300, sacred 33500, Temple Mountain and walls 33700, interiors 33800, streets 33900) |
| Ground and front | origin at the plot centre on the ground, +z the front, stairs inside the plot | the same |
| Plinth | 0.4-1.2 m | houses 0.45-0.9 m, civic up to 2.2 m (the Hall of the Decree) |
| Storeys | 2.5-3.6 m, civic ground storeys to 5 m | the same; the great halls' ground storeys 5-6 m |
| Footprints | poor 7-10 m, middle 9-15 m, rich 13-26 m, civic 14-60 m | the same classes |
| Ends | detached houses with yards | row houses on party walls take `o.ends` (`'l'`, `'r'`, `''`; absent = standing alone); every type is finished on four faces |
| Light | electric only on rich and civic (`xLit()`) | the same |
| Wealth tags | `poor`, `middle`, `rich`, `civic` | the same |
| Colour | wash, earth, redwall, maroon band, gold | the same palette; the colour shows the ring (`QRING`): white wash lay, red clergy, saffron-trimmed white kora, white and gold Temple Mountain |
| Materials | the Xanadu pack | the Xanadu pack (no new sets yet: `KNOWN_ISSUES.md`) |

**The mixed street** (`src/89q9-qb-street.js`): three streets, poor, middle and rich, where Qiblai's row houses in runs stand plot
to plot between Xanadu houses on one street line. `verify.py --assert` measures each house's drawn footprint from the kit's instances
and fails on two neighbours that overlap by more than 0.3 m.

## The style (PLAN.md section 4)

- **The crisp cube** (`qnCube`, `qnStack`): every volume a box with a light batter (the top 98 % of the base, or the kit's 96 % for a
  tall block), a thin string course at each floor.
- **The window grid** (`qnWins`): black trapezoid windows in strict rows and columns, the columns set by the top storey so each runs plumb.
- **Terraces** (`qnRoof`, `qnTerraces`): flat parapet roofs stacked, each step set back; the twig band and the frieze on the holy and
  the kora's buildings.
- **Gilt crowns** (`qnCrown`): a gilt pavilion roof, victory banners (`qnBanner`), the eight-spoked wheel and the two deer
  (`qnWheel`, `qnWheelDeer`): only on temples, monasteries, gate towers and the kora. Domes only on the Temple Mountain.
- **Prayer wheels instead of minarets**: drum rows (`qnDrums`), the kora's arcades, the wheel houses, the great wheel house.

## The buildings

| Family | Keys |
|---|---|
| Houses | `qb_row_poor`, `qb_row_mid`, `qb_corner_house`, `qb_row_rich`, `qb_court_house` |
| Trades | `qb_shop_row`, `qb_workshop`, `qb_bakery`, `qb_butcher`, `qb_weaver`, `qb_brewhouse`, `qb_tannery` |
| Guilds | `qb_guild_gold`, `qb_guild_mason`, `qb_guild_spice`, `qb_guild_lodge` (Farmers', Miners', Alchemists' by `o.v`) |
| Civic | `qb_gate_market`, `qb_bath`, `qb_granary` |
| Sacred | `qb_monastery` (eight dresses, `o.v` 0-7: one a spoke), `qb_college`, `qb_gate_temple`, `qb_chorten` (three sizes), `qb_kora_arcade`, `qb_kora_corner`, `qb_wheel_house` (`o.v` 2 water-driven), `qb_shrine` |
| Pilgrims | `qb_hostel`, `qb_caravanserai`, `qb_ghats` (+z is the river) |
| The Temple Mountain | `qb_temple`, `qb_hall_decree`, `qb_treasury`, `qb_great_wheel` |
| Walls and gates | `qb_wall` (`o.v` 0 outer, 1 inner low, 2 with a tower), `qb_wall_corner`, `qb_wall_gate` (`o.v` 1 the inner rings') |
| Interiors | `qb_ix_assembly`, `qb_ix_hall` (the eight abbots and the empty seat), `qb_ix_hostel`: cut-aways furnished with the catalog's Xanadu pieces through kits/interiors (`targets/kit/90q-qb-furnish.js`) |
| Mixed street | `qb_street_poor`, `qb_street_mid`, `qb_street_rich` |

The Xanadu kit's trades-table gaps it fills: the bakery, the butcher's, the weaver's and dyer's, the brewhouse, the tannery, the
caravanserai (innkeepers and grooms), the wayside shrine (shrine keepers) and the college (teachers and scholars).

## What is not here

The city (Q7): the nested-squares site on core/city, its infill, the open-world site, the bundle (`kit_bundle.py`), the Godot export
and the gallery. The site generator belongs to the core/city session (PLAN.md section 7).
