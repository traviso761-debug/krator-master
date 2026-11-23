# core/hamlet/xanadu: the Xanadu row, passed by name (opt-in)

`23-hamlet-xanadu-row.js` gives `KHAMLET.xanaduRow(opts)`: the shared `xanadu` row (`20-hamlet-cultures.js`) with fishing and
the foci of `core/simulation/PROPOSAL-XANADU.md` section 3e, a wayside shrine in every village and a work camp option
(`settlements/xanadu/BUILD-OUT.md` section 4b, wave 0.2). It registers nothing: a host passes the row it returns as
`spec.culture`, as Kirstabal passes its `fishingRow`. The row folds into `20-hamlet-cultures.js` at the next all-builds
rebuild (TODO.md, "Ride along").

**Why a subfolder.** Every build that takes `core/hamlet` names its fragments one by one, and `test-hamlet.js` loads
`core/hamlet/NN-hamlet-*.js` only, so a file here reaches no page unless its build lists it (as `fellgang/`). A build lists
it after `20-hamlet-cultures.js`:

```
'core/hamlet/20-hamlet-cultures.js', 'core/hamlet/xanadu/23-hamlet-xanadu-row.js', 'core/hamlet/30-hamlet-village.js'
```

and calls `KHAMLET.village({..., culture: KHAMLET.xanaduRow(), focus: 'tea', ...})`.

**Test:** `node core/hamlet/test-hamlet-xanadu-row.js`. Plain data, `[G data]`: no three.js, no DOM. The API, the keys and
the switch for Kirstabal and the Vein Camp are in `core/hamlet/README.md`, "The Xanadu row, passed by name".

**The mines' foci and the camp census** (2026-11-23, `settlements/xanadu/WORKS-PLAN.md` W1): `mill`, `diggings` and `landing`
join the foci (the pending boxes of `xa_stamp_mill`, `xa_sorting_shed` and `xa_fort_post` with them); the camp census that takes
`row.camp` when `spec.camp` is `core/hamlet/camp/26-hamlet-camp.js` (opt-in, `core/hamlet/README.md`).
