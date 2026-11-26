# Krator biome kit — the abyssal savannah (Oct 2026)

## What this is

The dry grassland of the Eastern Abyss as its own kit (`PLAN.md`), out of the eastern abyss's sketch
(`biomes/eastabyss/KNOWN_ISSUES.md`: "the savannah is a sketch ... meant to be its own kit"). The owner, 2026-10-26: "do e
abyss savannah". Station 1, the rim slope, is built: `dist/abyssal-savannah.html`.

## The site (PLAN.md section 1)

Surveyed on the live scale model (4.22) on 2026-10-26: the model's abyssal savanna class (XV) is the floor's belt between
the lakes' jungle and the salt steppe, at ~2 atm; the gentle east rim above climbs through Am, Aw (tropical savanna) and
BSh (hot steppe) to the plateau. Station 1 is the climb at px ~1021,350 (row 350's transect: -1,673 m on the floor at
px 1013, -506 m at px 1019, -46 m on the bench at px 1023). The page's y 0 is -600 m on the model (1.72 atm at the foot,
1.61 on the bench); x runs up the slope (east), z south.

## The map (45-host-stage.js)

6.4 by 5 km. The profile is the survey's grade, with the page's own detail on it: the foot (the jungle's last terrace,
y 0-40), a first riser (~135 m), the parkland tread (y ~160-200) with granite kopjes, the caprock rim (~265 m: a face of
bedded rock between x ~560 and 770 in the warped coordinate), the bench (y ~460-500) with a pan 14 m deep. Three gullies
run from the bench to the foot, deepest where the slope is steep; the middle one carries a seasonal stream. The scarps
wander in plan (a warp of x by z). The heights are KRAND's noise (core/rand), baked once to a 12.5 m grid that terrainH
and the ground mesh share; the fields are cached on 25 m. The far country (30 km, 100 m cells) carries the floor falling
away west to the savanna belt and the lake 1.7 km down, and the plateau rising east.

## The flora (50, 55, 60)

Kept and grown from the sketch: the **shelf umbrella-tree** (tiered flat plates on a corky bole, charred at the foot by
the last fire, lower and wider on the bench, saplings in fresh burns), the **Vain fronds** (purple, canon; a fire-follower),
the **ember rosettes**, the **thatch grass** (to 3.2 m in the dense air). New: the **tongue tree** (Glossopteris; in part
bare or orange in the dry season), the **stub lycopsid** (Pleuromeia; colonies on the bench), the **ember cycad**, the
**kopje fig**, **blue pan-grass**, **pan saltbush**, **ember lilies** on the fresh burns, bench forbs on the young ones,
charred stems. The eastern abyss's jungle climbs out of the floor at the foot and up the gullies: rope araucarias,
bell-barks, crown ferns, fan palmettos, strap cordaites, salt cycads, read in place (`EASTABYSS.make` / `grow`).

## The burn mosaic (55)

`ABSAV.burn(x,z)`: the years since the patch burned (0..12), from a jittered 480 m grid hashed by cell, its edges warped.
The ground colour, the grass state, the Vain fronds, the lilies, the charred stems, the cycads' fronds, the umbrella
trees' char band and the saplings read it. A static mosaic, not a fire model (PLAN.md S6).

## Lessons this build cost

- **The model's XV is not where the sketch put the savannah.** The class map says the abyssal savanna is a belt on the
  floor at 2 atm, between the lakes' wet shores and the dry salt; the rim's climb is Aw and BSh. Survey first: the plan
  covers both (PLAN.md section 12, Q1).
- **Seed every placement cell, not every pass.** `ABSAV.cells` reseeds the core stream from `KRAND.hash(seed, salt, ix, iz)`
  per cell, so a builder that draws more numbers (a tier more on an umbrella tree) moves nothing in the next cell. The
  eastern abyss's passes are one stream each, which is why its savannah could not be swapped for this kit's without
  moving everything after it (PLAN.md, Q8).
- **Read another kit in place for an ecotone.** Its `make` / `grow` (one tree alone) were enough: the jungle at the foot is
  the eastern abyss's own trees, in its registry and its buckets, with its library pack beside this kit's.
- **Full-colour cards want a near-white instance colour.** The lilies, forbs and charred stems keep their own colour
  (`keep` 1); the palette colours only the procedural fallback (`cardCol` in 60).
- **A bash heredoc eats backslashes** (`'s` in a JS string): write such lines with the Edit tool or avoid the apostrophe.
