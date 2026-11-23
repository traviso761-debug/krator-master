# core/hamlet/fellgang: the Fellgang row (opt-in)

`22-hamlet-fellgang.js` registers, at load, `KHAMLET.CULTURES.fellgang` (`kits/tungang/PLAN.md` section 3.3.1; `WEST-RIFT-SCOPE.md` section 3d):

- **Preserved stand-in focuses (`fowling`, `ice`):** identical keys and shares to riftrim's `FELLGANG.ROW` (`fowling`: `fg-ropehouse`, `fg-eggstore`, `fg-pens`; `ice`: `fg-icehouse`, `fg-sledgeshed`), proven bit-for-bit equal in `core/hamlet/test-hamlet.js`.
- **Standard hamlet focuses (`farming`, `ranch`, `quarry`):** `fg-barn`, `fg-granary`, `fg-smokehouse`, `fg-pens`, `fg-sledgeshed`, `fg-store`.
- **Additional West Rift Fellgang focuses (`stair`, `copper`, `gold`, `pass`):**
  - `stair`: gorge stairhead hoists & break-bulk (`fg-ropehouse`, `fg-sledgeshed`, `fg-smithy`, `fg-store`)
  - `copper`: Copper Glacier skarn smiths (`fg-smithy`, `fg-store`, `fg-barn`)
  - `gold`: summer fell gold outposts (`fg-smithy`, `fg-store`, `fg-pens`)
  - `pass`: high river pass & fishery (`fg-halting-house`, `fg-ropehouse`, `fg-smokehouse`, `fg-store`)

**Why a subfolder.** Every build that takes `core/hamlet` names its fragments one by one, and `test-hamlet.js` loads
`core/hamlet/NN-hamlet-*.js` only: a file here reaches no page unless its build lists it, so adding the row changed no
other page's bytes. A build that wants the Fellgang villages lists it after `20-hamlet-cultures.js`:

```
'core/hamlet/20-hamlet-cultures.js', 'core/hamlet/fellgang/22-hamlet-fellgang.js', 'core/hamlet/30-hamlet-village.js'
```

**Test:** `node core/hamlet/test-hamlet.js`.

Plain data, `[G data]`: no three.js, no DOM.
