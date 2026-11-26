# core/atmos/placeholder: the placeholder sky for kit viewers

`81-sky.js` (`KratorSky`, the standard Krator sky: the gas giant, the sun's path at 40° S, the stars) and `80-sky-hash.js`
(the `h3()` it reads, for builds whose core has none). Moved here unchanged on 2026-11-02 from `settlements/iziz/src` and
`kits/catalog/src`; 13 kits kept byte-identical copies of the first and five of the second (MODULARITY-PLAN.md step 1).

**What it is for.** A kit's viewer page needs a sky to light its pieces under. It is a placeholder: a kit's pieces go into
the world at an open-world site, and that site's sky (`core/atmos`, the biome's preset) lights them there. None of the kit
bundles (`KratorVehicles`, `KratorMechs`, `KratorFauna`, the interiors) carry it. So the kits share this one file by path,
not a copy each, and nobody tunes it for a kit.

**How a build takes it.** `placeholder.py` names the files (`SKY`, `SKY_H3`) and their paths, the way `core/host/host.py`
does for the host shell. The names keep their place in each build's filename order, so moving them here changed no page.
Do not copy them into a `src/`.

**What is not settled.**
- It is not the shared sky. That is `core/atmos/sky` (`ATMOS.sky`, `ATMOS.skyBiome`) on the biome rebuild. The kits keep
  this one (owner, 2026-11-03): nothing about a kit's pieces depends on which sky its viewer draws.
- `h3()` is a `Math.sin` hash. It is used only for the star field and the giant's bands, never for placement (placement draws
  from `core/rand`), and `tools/check_core_use.py` only scans a build's own `src/`, so it is not a finding here.
- The settlements that still vendor `81-sky.js` (Dalab, Jimjam, Xanadu, Ys) check their copy against this file
  (`--vendor-check`) and read it by path with MODULARITY-PLAN.md step 4. Iziz reads it here, and Pylon and Talia through Iziz.

**Taken by:** kits ash-nomads, catalog, desert-nomads, eternian, fauna, interiors, islanders, lizardmen, mechs,
motor-vehicles, resources, scyvoi, yeti, zeijani; `settlements/iziz` (and its `--kit` builds, Pylon and Talia); `settlements/noahs-regret`.
