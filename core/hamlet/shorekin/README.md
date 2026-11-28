# core/hamlet/shorekin: the Shore-kin Arch hinterland & harbour-crew row, passed by name (opt-in)

`26-hamlet-shorekin.js` exports `KHAMLET.shorekinRow(opts)`, `KHAMLET.SHOREKIN_FOCI`, and `KHAMLET.SHOREKIN_FOCUS_INFO`:
the Shore-kin (`kits/shore-kin`) hinterland village row feeding Arcoforte's spring drydock and paktong smelt campaigns.
It mutates nothing on `KHAMLET.CULTURES` or `KHAMLET.FOCI` at load: a host passes the returned row object as `spec.culture`,
keeping `20-hamlet-cultures.js` and its downstream builds untouched until the next all-builds rebuild (`TODO.md`, "Ride along").

**Why a subfolder.** Every build that takes `core/hamlet` lists its fragments one by one, and `test-hamlet.js` loads only
`core/hamlet/NN-hamlet-*.js`, so a file in `core/hamlet/shorekin/` changes 0 bytes on unrelated pages (matching `shumari/`,
`dalab/`, and `fellgang/`). A settlement or open-world region lists it after `20-hamlet-cultures.js`:

```js
'core/hamlet/20-hamlet-cultures.js', 'core/hamlet/shorekin/26-hamlet-shorekin.js', 'core/hamlet/30-hamlet-village.js'
```

and calls `KHAMLET.village({..., culture: KHAMLET.shorekinRow({clientHall: true}), focus: 'ash', ...})`.

## Parameters and exports

- **`KHAMLET.shorekinRow(opts)`:** `kit: 'shore-kin'`, `household: 5.0`, `workShare: 0.48`, `slopeMax: 0.30`; dwellings across all
  7 Shore-kin residential defs (`sk_stilt_cot`, `sk_boardwalk_shack`, `sk_crib_rowhouse`, `sk_hex_lime_house`,
  `sk_serpentine_lodge`, `sk_compound_house`, `sk_byssus_court`); `civic` is `sk_client_hall` when `clientHall: true` or
  `pop >= 180` (else `sk_compound_house`), `religious` is `sk_tide_shrine`, `landing` is `{key: 'sk_boat_grid_shed', jobs: 4}`.
- **Options (`x == null ? default : x`):** `shrine` (`true`), `clientHall` (`false`), `pop` (promotes `civic` to `sk_client_hall`
  at `>= 180`), `workShare` (`0.48`), `household` (`5.0`), `slopeMax` (`0.30`), and `camp` (`false`).
- **`KHAMLET.SHOREKIN_FOCI`:** `['ash', 'spars', 'cordage', 'smelt', 'saltery', 'lime', 'fishing', 'farming']`, plus standard
  `KHAMLET.FOCI` aliases (`'lumber' -> spars`, `'mine' -> smelt`, `'salt' -> saltery`, `'quarry' -> lime`) so `KHAMLET.village`
  accepts both Shore-kin domain names and standard `KHAMLET.FOCI` keys seamlessly.
- **`KHAMLET.SHOREKIN_FOCUS_INFO`:** metadata per focus (`what`, `feeds`, `worksKeys`, `outputs`, `clientTithe`), recording that
  Shore-kin villages are clients of the Arcoforte Fleet-born caretaker house owing ash, spars, cordage, salt-fish and labour in
  return for `paktong` tools/ingots and `cradle_shallow` berths.

**Test:** `node core/hamlet/test-hamlet-shorekin-row.js`. Plain data, `[G data]`: no three.js, no DOM.
