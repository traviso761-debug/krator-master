# core/hamlet/shumari: the Shumari plateau row and work-camp row, passed by name (opt-in)

`25-hamlet-shumari.js` exports `KHAMLET.shumariRow(opts)` and `KHAMLET.shumariCampRow(opts)`: the Shumari (`kits/shumari`)
village and high-altitude mining/ordnance camp rows specified in `settlements/shumar/BUILD-OUT.md` section 4b (wave 0.3) and
`core/simulation/PROPOSAL-SHUMAR.md` (`SHUMAR_TUNE`). It registers nothing on `KHAMLET.CULTURES` or `KHAMLET.FOCI` at load:
a host passes the returned row object as `spec.culture`, keeping `20-hamlet-cultures.js` and its ~56 downstream builds
untouched until the next all-builds rebuild (`TODO.md`, "Ride along").

**Why a subfolder.** Every build that takes `core/hamlet` lists its fragments one by one, and `test-hamlet.js` loads only
`core/hamlet/NN-hamlet-*.js`, so a file in `core/hamlet/shumari/` changes no existing page's bytes (matching `xanadu/` and
`fellgang/`). A Shumari settlement or open-world region lists it after `20-hamlet-cultures.js`:

```
'core/hamlet/20-hamlet-cultures.js', 'core/hamlet/shumari/25-hamlet-shumari.js', 'core/hamlet/30-hamlet-village.js'
```

and calls `KHAMLET.village({..., culture: KHAMLET.shumariRow(), focus: 'orchard', ...})` or, for a lode/nitre work-camp,
`KHAMLET.village({..., culture: KHAMLET.shumariCampRow(), focus: 'mine', ...})`.

## Parameters and exports

- **`KHAMLET.shumariRow(opts)`:** `kit: 'shumari'`, `household: 5.2`, `workShare: 0.46`, `slopeMax: 0.28`; services
  `sm_sabil_shrine` (`religious`, 2), `sm_sword_villa` (`civic`, 3), `sm_bazaar_hall` (`general`, 3), `sm_brewery_teahouse`
  (`food`, 3), `sm_state_granary` (`warehouse`, 3); houses across `-ko`/`-ra` `poor`, `-ra` `middling` (`middlingShare: 0.42`)
  and `-šu` `head` (`sm_captain_bayt`); shore `landing: {key: 'sm_lake_jetty', jobs: 3}`.
- **Options (`x == null ? default : x`):** `shrine` (`true` — appends one `sm_wayside_cairn` with `share: 0` to every village's
  works without consuming focus jobs) and `camp` (`false` — switches to `shumariCampRow` overrides).
- **`KHAMLET.shumariCampRow(opts)`:** `shumariRow` with `camp: true` (`workShare: 0.88`, `household: 6.0`, `civic:
  'sm_regiment_barracks'`, `religious: 'sm_wayside_cairn'` when `shrine` is on, and `-ko` / `Gēdu-ko` Free Giant initiation
  bunks `sm_cadet_cell` & `sm_giant_cadet_cell` with `middlingShare: 0`).
- **`KHAMLET.SHUMARI_FOCI` & `KHAMLET.SHUMARI_FOCUS_INFO`:** all 10 plateau, canyon and NE-lake foci (`farming`, `orchard`,
  `ranch`, `lumber`, `quarry`, `clay`, `salt`, `fishing`, `mine`, `placer`) with their `focusJobs`, `reach`, resource notes
  and `pending` footprint boxes for every `sm_*` key.

**Test:** `node core/hamlet/test-hamlet-shumari-row.js`. Plain data, `[G data]`: no three.js, no DOM.
