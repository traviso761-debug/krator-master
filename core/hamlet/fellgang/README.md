# core/hamlet/fellgang: the Fellgang row (opt-in)

`22-hamlet-fellgang.js` registers, at load, `KHAMLET.CULTURES.fellgang` (the row of riftrim's Fellgang stand-ins,
`FELLGANG.ROW`, unchanged but for its works' focus names) and two focuses, **`fowling`** (works `fg-ropehouse`,
`fg-eggstore`, `fg-pens`) and **`ice`** (works `fg-icehouse`, `fg-sledgeshed`), in `KHAMLET.FOCI`
(`kits/tungang/PLAN.md` section 3.3.1; agreed by the owner 2026-11-11).

**Why a subfolder.** Every build that takes `core/hamlet` names its fragments one by one, and `test-hamlet.js` loads
`core/hamlet/NN-hamlet-*.js` only: a file here reaches no page unless its build lists it, so adding the row changed no
other page's bytes. A build that wants the Fellgang villages lists it after `20-hamlet-cultures.js`:

```
'core/hamlet/20-hamlet-cultures.js', 'core/hamlet/fellgang/22-hamlet-fellgang.js', 'core/hamlet/30-hamlet-village.js'
```

Taken by: `kits/tungang` (its sheet's sample village). The riftrim stations (Fowlers, Ice-cutters) move onto it when
their session swaps `FELLGANG.ROW` for `'fellgang'` and `ranch` / `quarry` for `fowling` / `ice`: the village is the same
(the focus name enters no seed), which `test-hamlet.js` proves on the stand-ins' row.

**Test:** `node core/hamlet/test-hamlet.js` (its last section loads this file: the two focuses, the same digest as the
borrowed focuses, and the negatives: an Islander village asked to go fowling gets no works; an unknown focus is refused).

Plain data, `[G data]`: no three.js, no DOM.
