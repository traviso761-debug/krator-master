# biomes/greatchasm: the kit's surface (`GCH`)

The Great Chasm kit is small on purpose: the chasm has no species of its own (`PLAN.md` section 4). What a world takes from it:

| Name | What |
|---|---|
| `GCH.build({R, quality})` | places the ground cover over a disc of radius R round the host's centre (`60`): `{R, quality, trees: 0, under: {kind: count}}` |
| `GCH.buildTrees(R, q)` | the empty tree pass (`{trees: 0}`): the chasm's trees are its neighbours', grown by the host's kin rows (`src/87-host-kin.js`, `BIO.kin`) |
| `GCH.zones(x, z)` | the zones from the host's fields: `floor` (XW), `desert` (BWk), `wadi`, `wall` (ET and up), `high`, with `cliff`, `live`, `gentle`, `salt`, `road`, `barren` |
| `GCH.PLANTS` | the ground cover's records: name, tags (climate, aridity, abyssal, riparian, Koppen, harvest), the items that draw it, and `standin` (the key of the plant it stands for in the kit that will own it: `outlands.<key>`, `eastabyss.samphire`) |
| `GCH.plantOfItem(item)` | the record an instanced item belongs to (the inspector) |
| `GCH.KOPPEN`, `GCH.BARREN` | the polygon's classes by area, and the ones nothing grows in |
| `GCH_STRATA(o)` | the kit's KSTRATA stack (`src/44r-biome-greatchasm-strata.js`): the floor's komatiite, the flood basalt, and the ochre caps when `o.capBase` is given; it registers the recipes `chasm-trap`, `chasm-cap` and `chasm-floor` through `KSTRATA.add` |

## The fields it reads (the host binds them: `BIO.init({fields})`)

`slope`, `rock`, `cold` (0 at +16 degC, 1 at -14), `hot` (0 at +26, 1 at +40), `abyss` (under -250 m), `salt`, `wash`, `road`, `barren`,
`strata`, `talus`. A world that binds the same fields gets the same zoning. The host's own fields are `src/44v-host-landlib.js`'s
`chasmLand().fieldsAt`, cached on a grid in `src/45-host-stage.js`.

## The station contract (the host's, not the kit's)

A station's `stations/<name>/44w-host-land.js` defines `STATION` (from `chasmLand`), `terrainH`, `waterH`, `fieldsAt`, `TERR`, `LAKES`,
`SPINE`, `STRATA`, `ROCK`, and `LAND`: its name, sky site, air, ground layers (five), the ground cover it must show (`plants`), its kin
rows, its hazards (`hazards()`), its structures (`prebuild()`), its views (`views(H)`, every camera over the drawn ground), the model
tolerance (`modelTol`, and `sculpt(x, z)` where it sculpts on purpose). `src/99-host-take.js` reads it.
