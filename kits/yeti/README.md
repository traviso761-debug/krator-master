# kits/yeti: the Yeti kit

The building kit of the Khaayken, the people of Khaay Qantir, the High Country on the north-western Outer Wall (the
lowlanders' "Yeti Kingdom"; `LORE.md` section 6.19, `biomes/nwouterwall/PLAN.md`). Catalog and `core/tags` culture
`khaayken`. **Read `PLAN.md` first**: the shell rule (pycrete or stone by climate and use), the dome, the tunnels, and
section 4's heat, air and cold rules, which every building follows.

## Build and verify

```
cd kits/yeti
python3 build.py                      # dist/yeti.html (+ dist/yeti.tex.*.js, the library pack beside it)
python3 build.py --vendor-check       # the vendored Scyvoi engine against kits/scyvoi/src
python3 verify.py dist/yeti.html --assert
python3 verify.py dist/yeti.html --cut --views "Pycrete dome (a poor family's) (variant 1) - inside (cut-away)"
python3 ../../tools/textures/pack.py kits/yeti   # from the repo root, after any change to materials.json
```

## How it is made

- **The engine** is the Scyvoi kit's, vendored (as `kits/islanders` and `kits/eternian` took it): defs, `place()`, the
  geometry kit (`lathe`, `psurf`, `sector`, `prism`...), the materials, the furniture pass on `core/furnish`, the host.
  `src/10-core.js` is the one engine file not vendored: it is the engine's on `core/rand` (`KNOWN_ISSUES.md`).
- **The kit's own fragments**: `26k-kit.js` (identity, the library families, the palette, `YT_S`, the Khaayken's 1.15x
  scale), `28-yt-mat.js` (ice, gut and pycrete materials), `40-yt-kit.js` (the toolkit: the catenary dome, the cold-trap
  entry, the platform outline, the lamp, the crown vent, the ice window), `50-yt-dwell.js` (the dwellings),
  `89-rows.js` (the sheet's rows), `90y-yt-ground.js` (the sheet's plane, holed for the sunk floors and trenches),
  `41-yt-heat.js` (the mass heater: stoking chamber, flued platform, chimney), `42-yt-tunnel.js` (the tunnels and their
  junction and warming domes), `51-yt-cluster.js` (the family cluster and its satellite domes), `55-yt-samples.js` (the
  ribbed hall dome, the slump, the tunnel sections, a covered-way network), `43-yt-craft.js` (the serge, hangings, rugs),
  `52-yt-rich.js` (the clan compound), `53-yt-balagan.js` (the forest-steppe house), `56-yt-street.js` (the winter street),
  `91y-yt-night.js` (the night glow: ice lenses and pycrete lit from inside), `44-yt-props.js` (forge, anvil, loom, racks,
  ice blocks, drum, benches, masks, fences, stone stoves), `60-yt-state.js` (`ytRoomDef`; the halls, song house, shrine,
  tomb), `61-yt-works.js` (bath, smithy, kitchen, the works), `62-yt-stores.js`, `63-yt-land.js` (quarry, pycrete works,
  byre, corral), `64-yt-war.js` (the winter fort, tower, cairn), `68-yt-trades.js` (`YT_TRADES`, the census check).
- **Covered variants**: every dome house and cluster takes `o.covered` (its passage ends at the mouth on a tunnel) and says
  where that mouth is (`def.mouth`), so a town joins its houses with `ytDoorNetPlan` / `ytDoorNetBuild` (`42-yt-tunnel.js`).
- **core/city's covered ways**: the tunnel network is laid by `KCITY.covered` (`core/city/36-city-covered.js`, the one
  core/city file the kit takes), plain records the kit draws.
- **Every building is registered before it is drawn** (`core/tags`, through `place()`), and carries what a heat or
  economy pass reads: `rec.layers` (the wall, inside to outside), `rec.frost` (the frost rule for a heated pycrete shell:
  its inner face's temperature at the crown and the base), `rec.heat` (stove, lamps, fuel, the crown vent, the inlet,
  whether it is heated this season), `rec.season`. `verify.py --assert` checks them (`heat-records`, `frost-rule`,
  `mass-inside`), and `walk-reach` walks core/walk's floors from each building's door to every room, platform, satellite
  and stoking chamber it registered (`ytWalkTarget`).
- **Seasons**: a building's `v` is its season where it has one (0 winter, banked with drift snow; 1 autumn, bare and
  freshly re-skinned; 2 summer, capped in turf and unheated).
- **Textures** come from the library through `materials.json` and `tex/` (the sets delivered 2026-10-25: the pycrete,
  the slab stone, soapstone, the furs, gut and hide, the seven `patterns/khaayken` sheets).

## Status

Y1 to Y4 (PLAN.md section 9): the scaffold, the toolkit, the tunnels; the dwellings of every tier in three seasons; the
winter street on one covered network; the night glow; the state, the trades (`YT_TRADES`), the stores, the stock and
war; the three dome caps mapped from the crown. Every `--assert` check passes but
`tags-vocabulary`: `khaayken` is registered in core/tags in Y5, with its catalog culture file (`KNOWN_ISSUES.md`).
