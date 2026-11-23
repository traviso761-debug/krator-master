# core/hamlet/lizardmen: the Lizardmen row (opt-in)

`23-hamlet-lizardmen.js` registers, at load, `KHAMLET.CULTURES.lizardmen` (`settlements/gila/PLAN.md` sections 1 and 7, step G2;
agreed by the owner 2026-11-16): the Lizardmen building kit's dwellings by caste (`lz-warren`, `lz-makers`, `lz-longhouse`,
`lz-lodge`, `lz-tower`), services (`lz-nest`, `lz-seer`, `lz-medicine`, `lz-granary`, `lz-warehouse`: no shops or coin,
`kits/lizardmen/DESIGN.md` section 4) and works for `salt` (`gl-pans`, `gl-saltstore`), `farming`, `ranch`, `fishing`, `mine`
and `quarry`. Keys the kit does not carry yet (`lz-weir`, `lz-mine`, `lz-quarry`, and Gila's `gl-pans` / `gl-saltstore` on a
page without Gila's `src/66-gl-works.js`) have `pending` boxes so any host lays their footprints cleanly.

**Why a subfolder.** Every build that takes `core/hamlet` names its fragments one by one, and `test-hamlet.js` loads
`core/hamlet/NN-hamlet-*.js` only: a file here reaches no page unless its build lists it, so adding the row changes no other
page's bytes (`core/hamlet/fellgang/README.md`). List it after `20-hamlet-cultures.js`:

```
'core/hamlet/20-hamlet-cultures.js', 'core/hamlet/lizardmen/23-hamlet-lizardmen.js', 'core/hamlet/30-hamlet-village.js'
```

Taken by: `settlements/gila` (its east-shore salt-works hamlet, step G5), and later `core/region`'s Lizardmen environs
(`core/simulation/PROPOSAL-LIZARDMEN.md` section 5).

**Test:** `node core/hamlet/lizardmen/test-hamlet-lizardmen.js` (on `tools/ktest.js`: each check and negative, plus proof that
loading this file moves no existing Islander, Xanadu or Order village).

Plain data, `[G data]`: no three.js, no DOM.
