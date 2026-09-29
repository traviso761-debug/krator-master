# Girder — beast-rider village in a cyclopean ruin (Krator)

Outlying Beast Rider village in the central-crater hyperjungle, built from an
ancient ruin: four identical rusted 30-storey open-frame towers (floors +
structure, no walls — a cross-section look) in a perfect square. Same engine as
Mav's Refuge / Voth (numbered `src/` fragments → `build.py` → `girder.html`,
`verify.py --assert`). Units are metres. Artifact:
https://claude.ai/artifact/EydUQGdY3CD9VbyZoy5R1x

## Brief (Travis, Sep 20 2026)
Trees a bit shorter than Mav's, hilly undergrowth, small brook. Only top 5 and
bottom 6 floors inhabited, thinning toward the middle; the rest overgrown with
vines and flora. Wooden palisade round the base, mostly farms + a few houses;
assembly hall and small market between the towers. Wooden roost platform round
each tower top, linked by rope bridges (my reading of "protected by rope
bridges" — unconfirmed); flyers come and go. Farm workers commute between
towers/houses and fields; sentries patrol. Voth-style lighting.

## As built
- Towers at (±60, ±60), half-width 24, 30 × 5 m storeys + unfinished crown;
  terrace y≈34.6, palisade R 200 with N and S gates, 8 watch posts, wall-walk.
- 340 dwelling lots (floors 1–6: 48,48,37,34,20,10; 26–30: 10,14,29,42,48),
  4 roost decks (half 39) with 68 stalls, 4 × 42 m rope bridges, 4 beast-drawn
  lifts with capstan millipedes, 48 plots, 8 houses, 16 stalls, round tajug hall.
- Forest: 46 near hypertrees (150–270 m, none within 262 m), 260 far impostors;
  rainbow bark desaturated 30 %. Brook has a fine bed-strip mesh, a 3-step
  cascade near (-200,170) and a plank footbridge on the south track at (0,292).
- Life: 289 farm workers on a skyHour schedule, 110 villagers, 56 roost hands,
  104 sentries (posted, patrols, wall-walk) with hand lanterns at night.
- Flyers: ~85 animals; outer bays (40) straight-in, slot bays (16) small species,
  court bays (12) static residents. Circuit flyers now land; bats return all night.
- 59 draw calls, 2.70 M triangles, ~50k kit instances; 7 invariants pass.

## Fragments / owners
Planner: 05,10,30,32,45,47,50,72,75(base),80,81,85–87. Subagents: 55 arch +
58 overgrowth, 60 trees + 62 jungle + brook part of 75, 78 life, 84 flyers.

## Known gaps / next
- Ground drops below brook level in a hollow below the cascade (terrainH vale
  needs widening in 10-core).
- Under the default fast clock (2-min day) worker commutes fade rather than walk;
  pause/slow the clock to watch real commutes. Sentries never change shift;
  wall-walk pacers have no way up.
- Lift-foot nav edge crosses the capstan circle (life detours round it); capstan
  bar is static.
- Vine curtains are flat ribbons, no sway. 21:00 night is bright under the giant.
- Rider-lantern / bat-eye glints unconfirmed at night.
