# Sky demo

The shared sky (`core/atmos/sky/`, `SKY-PLAN.md` step S0) on one page, for the owner to judge before any biome takes it.

```
cd core/atmos/demo && python3 build.py      # dist/sky-demo.html (about 670 KB, three.js r128 inlined)
```

**Controls.** Hour, day (from game start, -182..182: the whole year), time held or running (a 72-minute day, x20,
x200), site, air pressure, cloud cover, weather (clear, overcast, fog). Drag to look, wheel to zoom.
**Views:** game start at sunrise (06:00 on 17 Ceppaṭampar, the southern spring equinox), its dusk (the Pleiades high
in the evening), a winter midnight (21 Jūn: the cluster overhead), a summer night (17 Ṭicampar: the cluster gone, near
the sun), the next eclipse at the site (in the seasons round the equinoxes), the Double Dark (the night
before game start: the Week and the Thirteen new), noon, Day's transit of the giant (on the current day). **Look at:** the giant, the sun, the cluster, the zenith, each moon
(the Companion, the Week, the Thirteen), level.
The readout gives the date in Jimjam's months and counts, and where the sun, the giant, both moons and the cluster stand.

**URL hash** for repeatable shots: `#site=rim&view=winter&look=cluster&day=-88&hour=0&fov=50`.

**The smog** (2026-11-09, `core/atmos/README.md` "The smog"): **Mood** picks the clouds' mood: none; smog (dark .6, a brown-purple
tint, violent turbulence .7, the fires' orange glow at night); ash (dark .8, ash grey, unnaturally ordered rows, lightning under
one patch at a time at night); sickly green (glitched: sectors of sky each on their own wind, an ethereal teal breathe at night);
or the shifting episodes (`ATMOS.cloudMood`, a new episode each minute here: the three effects together or apart, the readout
names the episode). **Smog mist** turns on a height fog whose mist has a field: a "city" 3 km to the north-west where the smog is
universal, thinning to a tenth by 4 km out, all day (`#mood=smog&smog=1&az=325`, then `hour=22` for the glow). The ground and the
test pieces take it; the sky pass does not (the far ridges stand clear of it, as they would behind a valley's smog).

**Sites** are scale-model pixels through the site frame (`ATMOS.siteAt`): Voth (446,690, the reference), the
hyperjungle at Pinnacle Rock (755,351), Korona (814,189), the Throne's glacier (545,560, 0.5 atm) and an Outer Wall crest
(450,1040, 0.3 atm). The glacier and the rim pixels are approximate. **The ridges are demo stand-ins**, not any biome's.

What the page is for: the colour script through the day, the giant (on the celestial equator, NE ~25 degrees up at
Voth, bobbing ~2 degrees a day with its rings opening and closing; eclipse seasons round the equinoxes, its ice-giant face and sky-plankton bands, its phases, its hairline ring with the far half behind the disc, its eclipse rim),
the ring's structure, the four moons on the ring line (Ceres-like Companion, Iapetus-like Week, carbon-world Thirteen, Io-like Day,
whose daily transit has its own view), the procedural Pleiades night
(nebula, bright members, field, the galaxy's band in the far half), stars by day in thin air, the clouds, and the chrome
sphere showing the sky's light (`ATMOS.skylight`) on a standard material.

The ground and the test pieces take the clouds' shadows and the rain (`ATMOS.cloudShade`); `#alt=600&pitch=-0.5` looks down on
the shadows. Not yet here: the per-hour grade (split tone), the plume
and cloud-sea landmarks, ATMOS.weather's rain and lightning (the weather select only greys and fogs the sky).
