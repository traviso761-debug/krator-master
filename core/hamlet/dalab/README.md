# core/hamlet/dalab: the Dalab row (opt-in)

`23-hamlet-dalab.js` registers, at load, `KHAMLET.CULTURES.dalab` (the Realm of Dalab's village in the Dalab set's pieces,
`settlements/dalab/src`) and one focus, **`gene`** (the genepriests' breeding stations: works `nl_genebeds`, the priest's house,
the granaries), in `KHAMLET.FOCI` (`settlements/nulab/PLAN.md` sections 4.2 and 7; proposed, 2026-11-16).

**Why a subfolder.** As `core/hamlet/fellgang/`: every build that takes `core/hamlet` names its fragments one by one, and
`test-hamlet.js` loads `core/hamlet/NN-hamlet-*.js` only, so a file here reaches no page unless its build lists it. A build that
wants Dalab villages lists it after `20-hamlet-cultures.js`:

```
'core/hamlet/20-hamlet-cultures.js', 'core/hamlet/dalab/23-hamlet-dalab.js', 'core/hamlet/30-hamlet-village.js'
```

Taken by: `settlements/nulab` (the basin's near ring).

**The row.** Households of 6 (est.); peasants in the round earth hut, the scrap hut and the post house; the middling in
family compounds and terrace rows; the village priest's house is the head's. Works by focus: `farming` (compounds, granaries,
a windmill), `fishing` (boat sheds, fish racks, and a jetty as the `landing`), `gene`, `ranch` (the Dalab set's ranch, its
lizard pens), `lumber` (a charcoal yard), `clay` (the earth yard, the potter), `mine` (an adit, the scrap smithy).

**Pending pieces** (stand-ins at their declared boxes until the Dalab set has them; `settlements/nulab/KNOWN_ISSUES.md`):
`nl_genebeds`, `nl_boatshed`, `nl_fishracks`, `nl_jetty`, `nl_charcoal`, `nl_adit`.

**Test:** `node settlements/nulab/test-nl-town.js` lays a village of every focus on the row (and the negatives: an unknown focus
is refused; a Xanadu village asked for `gene` gets no works).

Plain data, `[G data]`: no three.js, no DOM.
