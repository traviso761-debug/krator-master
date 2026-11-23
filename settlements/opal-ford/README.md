# settlements/opal-ford: Ōpal-Phōrḍ, the opal road's ford

The river town of 1,500 at the mouth of Opal Valley, where the opal road crosses the Sitār Ḍrāi on its way down to the Lower Lake
(the Scarp, P5). `PLAN.md` is the plan and the owner's answers (2026-11-23). This folder is step OF1
(`settlements/xanadu/BUILD-PLAN.md`, A11): the town on `core/city`, drawn with the Xanadu kit on Xanadu's page, as Phēr's is, on
its own ground until the Siqārp region is cut (step OF2).

- `targets/town/89zp-of-site.js` (`[G data]`): the ground (a closed form of the scale model's valley: the river's slack reach at
  the ford in the middle of the cataract reach, the rapids below and above, the bow's fall 3 km up with its gorge; the north-east
  bank's flats, riser, bench and slope; the south-west bank's flats and spur) and the plan, one `core/city` instance on the bench:
  the high street (the road from Gihon up the valley), the bank street, the back lane, the cross lanes and the ford street; the
  market square at the ford street's head with the han across it (the kit's caravanserai) and its mule yard, the temple of the
  Decree and the grain office above the square, the square's teahouse and bazaar row; the toll house and the Golden Tears' post at
  the ford's head; the granaries, the watermill on its race, the footbridge's three spans below the ford, eight dugouts drawn up by
  it, 65 terraced fields and four farmsteads on the slope behind. The blocks are filled by `core/city`'s frontage-courts with the
  Xanadu kit's houses (216 houses, about 1,380 people against the tune's 1,500). Outside the town: the paddies on both banks' flats
  (about 180 basins), the ford's causeway and stones, the mill's weir, three fish weirs, the roads (down to Gihon, up the river to
  the fall, over the ford and up the south-west bank). **The Iridescent Order's precinct** at the fall's foot is kept clear for
  its design (`OF.PRECINCT`; PLAN.md section 2b, step OF1b). The people come from the tune (`XAN_TUNE.opalford`, read in place).
- `targets/town/90q-of-world.js` (`[web]`): the sky, the painted ground with the library's sets over it, the far ground, the river
  (a ribbon at its water's height, white water over the fall); the near ground registered with core/drawn.
- `targets/town/90r-of-build.js` (`[web]`): every record drawn with `VERN.place`, chunk by chunk, with the runtime LOD; the ford,
  the weir and the fish weirs from their records; the Vale of Xanadu flora over the plan's mask.
- `targets/town/91z-views.js`: the views.
- `gen/` (generated at every build, not committed): the core/city bundle, the tune under a numbered name, the biome fragment.

```
python3 tools/build.py settlements/opal-ford
node settlements/opal-ford/tests/test-of-site.js
KRATOR_GL=gpu python3 settlements/opal-ford/verify.py settlements/opal-ford/dist/opal-ford.html --assert --views "Overview,The ford"
```

`?day=N` sets the year's day (the sky).
