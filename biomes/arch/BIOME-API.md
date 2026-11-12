# The Arch: the kit's API

Two objects. `ARCH` is the data (`[G data]`: no THREE, no DOM; runs in node), `ARCHB` the kit on `core/biome`.

## ARCH (src/40, 41, 42)

| Call | What |
|---|---|
| `ARCH.spring(kind, seed, i)` | one spring's water: `typeI`, `typeII` (pH 11-11.9, H2), `acid` (pH 1.5-3.5), `sea` |
| `ARCH.anc(w)`, `ARCH.pHof(anc, dic)` | the charge balance with the carbonate system |
| `ARCH.mix(a, b, f)` | f of a with 1-f of b: `{pH, T, dic, calcite, brucite}` |
| `ARCH.gradient(pHa, pHb, T)` | mV across a pH difference (Nernst) |
| `ARCH.canStand({alk, acid})` | can a curtain stand: `{ok, why}` (difference 5+, both under 0.4 m/s and 70 degC, acid side pH 1+) |
| `ARCH.curtainMass(flow, pHalk, pHacid, o)` | the watts and the kilograms of curtain a spring feeds |
| `ARCH.NI`, `ARCH.available(soil)`, `ARCH.uptake(species, soil)` | nickel: leaf ug/g, latex, role, hyper |
| `ARCH.syndrome(soil)`, `ARCH.stunt(soil)` | the serpentine syndrome and the height it leaves |
| `ARCH.lifeAt(c)`, `ARCH.earthOk(c)` | `none` / `native` / `earth`; whether Earth life may grow |
| `ARCH.episode(seg, year, world)` | the rifting clock: state, since, next, recur, dur, opening |
| `ARCH_SITES` | the five stations' numbers on scale model 5.1 |
| `ARCH.uOf`, `ARCH.profile(site, u)`, `ARCH.vOf(slope)`, `ARCH.meeting(site, o)` | the confluence's land and its meeting's samples |

## ARCHB (src/50, 60, 70)

| Call | What |
|---|---|
| `ARCHB.SPECIES`, `ARCHB.PAL`, `ARCHB.HARVEST`, `ARCHB.TRAP` | the species records (tags: climate, aridity, riparian, Koppen, `ph`, `native`, `partner`, `nickel`) |
| `ARCHB.buildArch(R, q, {heat, ph, soil, keep, lava, mud, strand, sand})` | the life on the ground, every plant checked against `ARCH.lifeAt` / `ARCH.earthOk` (with `lavaAge` from `lava(x, z)`); the serpentine maquis off the lava, the mud and the strand; the lava pioneers (ohia, uluhe) on flows past their lag; mangroves on the tidal mud; the strand (beach she-oak, naupaka, beach glory, drift palms) where `strand` is given. Logs each plant to `ARCHB.LOG`, the hoarders to `ARCHB.HOARD` |
| `ARCHB.curtains(meet, line, level, q)` | the curtain field along a meeting's dividing line; returns the placed curtains' records |
| `ARCHB.combs(list, q)` | the seep combs round the flames |
| `ARCHB.build(opt)` | `buildArch` in the kit's registry |
| `ARCHB.plantOfItem(item)` | the species of an item (the inspector) |
