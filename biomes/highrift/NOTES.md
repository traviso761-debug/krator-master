# biomes/highrift: notes

- **Build:** `python3 build.py` (station 1), `--station mirror|wedge|coulee|gjar`, or `--all`. Every page reads `biomes/hearths` and
  `biomes/oidong` in place (`KIN_ALL` in `build.py`); the Mirror also reads `biomes/nhighlands` (`stations/mirror/station.json`).
- **One stage, five lands.** `src/45-host-stage.js` draws each zone's land from its site record (`src/40-biome-hrift-sites.js`); a station's
  folder only sets `STATION_KEY` (and the Mirror adds its larch). Add a sixth zone (Lake Cinnabar) as a site record and a land branch.
- **The heat** is one KTHERM bake (`src/48-host-therm.js`, after the kin and before the kit): the ground's sinter and mats, the rift's life, the
  Hearths' fields, the snow and the hazards all read `HEAT_AT`.
- **Order traps found on the way:** `35-core-strata-shade.js` must be keyed to sort after `35-core-strata.js` (`35s-`: '-' sorts before '.'),
  as godthrone does; `BIO.alphaTex` needs its fill colour (third argument).
- **Switches:** `?shadow=1` (KSHADOW, off at load), `?mirror=probe|live` (the reflections, off at load), `?plume=0`, `?kground=0`, `?strata=0`,
  `?hearths=0`, `?q=0.5`.
