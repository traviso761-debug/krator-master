# kits/pylon: the Pylon kit

Pylon: Iziz's vassal arcology city on a savannah plateau, round the ruined Monolith; its post-Cataclysm buildings imitate the Ancients in white render and Iziz orange (built on the Iziz Vernacular contract).

The design is `PLAN.md`; what this kit shares with the Iziz Vernacular and Talia is `settlements/iziz/VASSAL-KITS.md`; the
governor's palace blueprint is `palace/BLUEPRINT.md`; the owner's reference pictures are in `refs/`.

```
cd kits/pylon && python3 build.py                     # dist/pylon.html: the kit sheet, with the Vernacular beside it
python3 verify.py dist/pylon.html --assert --views "Overview,Mixed street — eye level" --out shots
```

**How it builds.** The kit is written on the Vernacular's contract (`VERN.def`, the `vn*` helpers, the `v*` kit items;
`settlements/iziz/API.md`), so it is built on the Vernacular's own page with no copy of it: `build.py` runs the port
lint here, then `settlements/iziz/build.py --kit kits/pylon`, which merges `src/` into Iziz's one fragment order (a
fragment name that clashes stops the build), takes `targets/` and `kit.json`, and applies Iziz's build rules (a
`reseed(N)` per builder, no seed collisions, no shared-scope name clashes) to these fragments too. `verify.py` runs
`settlements/iziz/verify.py` on the page (its probe and invariants are Iziz's).

**Writing a building.** A named `function buildPyl*(G,o){reseed(9xxx+(o.v|0)); ...}` in a `src/7?p-pyl-*.js`
fragment, then `VERN.def({key:'pyl_*', ..., tags:{culture:'pylon', style, type, wealth, lit}, w, d, h, build})`.
Seeds 9001-9399 (dwellings 9001-9099). Walls through `vnBody` (a hollow body once the kit has an interior set),
openings through `vnWin` and `vnDoor`, so they match the Vernacular's sizes. Colours from `PYPAL` (`src/69p-pyl-mat.js`);
the orange is the Vernacular's own. Pylon's helpers are `pyn*` (`src/69q-pyl-helpers.js`). Add the key to a row in
`targets/kit/89z-rows.js` and, at its tier, to the mixed street.

## What is in it

| Row | Keys |
|---|---|
| Middle, folk | `pyl_folk_house` (`refs/pylon.jpg`) |
| The mixed street | `vern_house_mid_a`, `pyl_folk_house`, `vern_house_mid_b`, `vern_house_mid_c` |
