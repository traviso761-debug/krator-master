# The Ancient network road test bed

This bed checks that the network's road classes (`openworld/ANCIENT-NETWORK.md` section 8) behave on uneven ground and where
they cross each other. It uses the Ancient Transit kit read in place.

```
python build.py
python ../../../tools/harness.py lock --lane auto -- python verify.py dist/network-testbed.html --assert --out shots
```

`dist/` is not committed; `build.py` rebuilds it. The page is the kit's demo page with its stage swapped: the kit's fragments
are read by path, and this folder's `src/` provides the stage.

## The stage

The ground holds:
- a ridge 45 m high;
- a north-south valley 38 m deep;
- a marsh under water at -4 m;
- a hill of 30 m;
- a knoll of 22 m.

| Class | Width | Ruling grade | Surface | On the stage |
|---|---|---|---|---|
| Ancient way | 30 m | 4 % | concrete | cuts the ridge (30 m cutting); crosses the valley on a viaduct and the marsh on a trestle, climbing to both decks on embankments (its alignment pinned to the deck ends); its guideway on low piers over the median |
| Izani highway | 11 m + 2 m paving | 8 % | paving (ochre) | crosses the way; takes the Xanadu road, the Yuni road and the trade highway at T junctions |
| Vothic highway | 8 m | 8 % | paving (grey) | runs the valley floor under the viaduct |
| Xanadu road | 9 m | 9 % | paving (sand) | over the ridge and the hill |
| Yuni road | 7.5 m | 9 % | asphalt | from the Izani highway down into the valley to the Vothic road (two T junctions) |
| Trade highway | 7 m | 10 % | packed earth | over the ridge to the Izani highway |
| Dirt road | 5 m | 12 % | earth | over the hill, across the Xanadu road, onto the way |
| Beast Rider trail | 2.4 m | 18 % | earth | across the Xanadu road and the dirt road |

## What the bed found, and the fixes

1. **The kit's grading notched at a lone pin.** In `KTRANSIT.profile`, a pinned sample was clamped inside the grading passes and
   only restored afterwards, so a single pin left a one-sample notch: the trail's crossing dropped at 63 %. **Fixed in the kit**:
   `kits/ancient-transit/src/41-tr-path.js` now holds pinned samples inside the passes, with a test and its negative in
   `tests/test-transit.js`.
2. **Junction levels, and the order of levelling.** A junction takes the level of the first road through it, from that road's
   alignment *before* its regrade. A weak road crossing two stricter roads close together was pinned to two heights it could
   not join (the dirt road at 44 %).
   - **The rule:** build the network from the strictest classes, then add each weaker class with `KTRANSIT.join`, so it meets
     the finished levels and regrades itself. The weaker class always gives way.
   - **For `core/network`:** levelling in class order.
3. **Trails cross at grade, with no junction.** A trail joined as a junction held the dirt road flat across it on an 11 % slope,
   and the dirt road then dropped at 16 % beyond.
   - **The rule:** a trail (and a footpath) takes the crossed road's level at the crossing and never flattens that road.
4. **The ground under roads.**
   - **Overlapping cuttings:** they take the deepest single cut, not the sum (summed, a junction is carved twice). The kit's own
     demo page still sums them.
   - **Fills:** the ground is raised under a road on fill, junctions included, falling away at 1 : 1.5. The kit draws a road's
     embankment along its runs but not under a junction, so a junction on fill stood over a hole.
   - **The fill's envelope:** it is read from each road's level at the point's projection across that road. The first
     version took the highest road sample within the road's half-width of the point. On the 30 m way at 4 %, that reaches
     15 m upslope, and the ground stood up to 0.3 m through the surface in a sawtooth (at the way × Izani junction).
   - **The check:** it reads the ground as the mesh draws it (`NT_meshH`: the refined cells' 1.8 m triangles), at nine
     points across every road, every 2 m.
   - **Now in the kit:** a junction's fill pad (`draw.junctions`); the deepest-cut rule in its demo page.
6. **A trail is held at the crossed road's level from kerb to kerb** (+1 m), every 2 m. Pinned only on the road's centre
   line, the trail followed the hillside between its pins and rode up to 0.5 m over the Xanadu road's surface.
   **Now in the kit:** a road's `crosses` option (`KTRANSIT.crossPins`).
7. **Surfaces by class.** The kit drew every road surface as asphalt. The bed gave each class its own surface through
   `B.finish(name, {mats})`, and a junction took its widest arm's surface. **Now in the kit:** a road's `surface`, which
   `draw.road` and `draw.junctions` lay.

## The checks (`verify.py --assert`)

- each road holds its class grade;
- every junction has one level across its arms;
- the way meets the viaduct and the trestle decks without a step;
- the Vothic road clears the viaduct by 5 m;
- the guideway clears the way × Izani junction by 5 m;
- the trestle stands 3 m over the water;
- no road surface lies under the water;
- the trail crosses its roads at their level, with no junction;
- no trench at a junction;
- the ground mesh stays under every road's surface, edge to edge.

Negative controls:
- a road built at 25 % fails the way's grade;
- a road 2 m under the viaduct's soffit fails the under-pass;
- the summed cuttings dig deeper than the deepest single cut;
- the old disc envelope pushes the mesh through a road.
