# kits/resources: API

Units, frames, the def, `place()` and the probe are the Scyvoi kit's engine (`kits/scyvoi/API.md`), read in place.

## Fragments

| Fragment | Prefix | What |
|---|---|---|
| `26k-kit.js` | | `KIT` (id `resources`, culture `generic`), `SV_LIB` (stone, earth, sand: library sets), `SVPAL`, `P(k)` |
| `42r-res-ore.js` | res | **[G data]** `RES_ORE` (`kinds`: item, name, cls, works; `grades`: yield, size, rank; `works`: mine and derrick, each base 0.05 lots a worker-hour, radius 400 m, cap 2000, keys), `resNodeKey(kind, grade)`, `resWorksOf(rec)`, `resRate(grade, works, o)`, `resSource(works, nodes, o)` |
| `44r-res-nodes.js` | res | `RES_LOOK` (per kind: its colours), `resOutcrop`, `resLoose`, `resNode(kind, grade)`, `resNodeDef`, `RES_NAME`, `RES_H`; the 30 defs `node-<kind>-<grade>` |
| `89-rows.js` | | `FAMILIES`: a row per kind, low to high |

## The rule

```
resSource({x, z, works:'mine'|'derrick'}, [{id, kind, grade, x, z}, ...], {radius?, base?})
  -> {node, kind, item, grade, efficiency, rate, dist}   the nearest node of a kind that works can take, within the radius
                                                         (a tie: the higher grade)
  -> null                                                none in reach: the works stands idle
resRate('low' | 'medium' | 'high', 'mine' | 'derrick', {base?})  -> lots a worker-hour (0.025, 0.05, 0.1 at Voth's base)
resWorksOf(rec)  -> 'mine' | 'derrick' | null   (rec.works; a role tag; or rec.key in RES_ORE.works[*].keys: 'ind_pumpjack')
```

Nodes never run out (owner, 2026-10-15, for now). A building kit reads both fragments in place and calls `resSource` with
its placed works and nodes (`kits/islanders/src/43-is-yards.js` `isOreLinks`).

## Build and verify

```
cd kits/resources && python3 build.py
python3 verify.py dist/resources.html --assert    # footprint, height, no-nan, tags, coverage, budget, fronts, resource-nodes
```

`resource-nodes` checks that all 30 nodes are placed and tagged (rock, level, harvest with its works, culture generic).
It also checks the rule's cases:
- the nearest node comes first;
- a tie goes to the higher grade;
- nothing is found beyond the radius;
- a mine never takes oil;
- a derrick takes only oil, and with no oil in reach it stands idle;
- `resWorksOf` names the pumpjack a derrick;
- the yields are x0.5, x1 and x2.
