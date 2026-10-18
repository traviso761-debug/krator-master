# Shim: the plan (draft, 2026-10-17)

Shim is the old capital of the Chichani, on the shore of a lake on the Shim river in the south-west lowlands, 155 km
south-west of Voth. Its lore is `LORE.md` §6.12 ("The cities of the Kingdom"; the kingsmoot that made Tzintzun is in
§6.12's first paragraph). It is the Vothic style's home: Voth's architecture older and more weathered, round an
Ancient temple and ceremonial square, with chinampas along the shore and slave plantations round it.

Owner's brief (2026-10-17): the old capital of the Chichani; built around an ancient temple and ceremonial square
(after the model from the Ancient Iziz kit) and a small ancient town, but 90% of the buildings are in the Vothic
style; arranged along the shore of a lake in the SW lowlands, with chinampas near the shoreline; should look older and
more weathered than Voth; surrounded by vast slave plantations.

## 0. What the build is

| | |
|---|---|
| Folder | `settlements/shim/` (`src/`, `targets/`, `build.py`, `verify.py`, `materials.json`, `site/`) |
| Pages | `dist/shim.html` (the city), `dist/shim-site.html` (the site editor, Voth's read in place) |
| The Ancient core | the **Ancient Iziz style** (`kits/ancients` `src/77z-iziz-style.js`, target `iziz-style`; Iziz vendors it): its temple and civic families in the `rehab` state for the temple and the square's halls, `ruin` for the rest of the small Ancient town; the ceremonial square as a `core/city` plaza on the temple's axis |
| The Vothic town | the Voth building catalog (`settlements/voth/catalog`), whole, under an **age tune** (section 2) |
| Landmarks lifted | Voth's source library by name (`vothlift.py`): the chinampas (`55-chinampa.js`), the Temple's tiers for the clan temples, the Ancestry canton's tombs for the old chiefs' necropolis |
| The plantations | new catalog entries in the Voth registry (section 1), the fields as `core/city` fields, the cages and stocks from the catalog's post-apoc pieces (`pa_*`) |
| Town | `core/city` steps 0-12 on the site layer; the `frontage-courts` strategy (Ys's) for the old clan compounds round the square, `alleys` elsewhere |
| Biome | the south-west lowlands as Dalab builds them (`settlements/dalab`'s biome fragments, read in place; if they are not separable, naming that is P0's first finding), the lake shore and reeds from the Reed Lake kit (`settlements/reedlake`) |
| Core | `core/rand`, `core/mask`, `core/tags`, `core/space`, `core/lod`, `core/host`, the shared sky; `core/furnish` later |

## 1. The site

The scale model's 2026-10-05 export has Shim at px 382,788 (its `seed14` point; a second "Shim" at px 371,700,
inside Jimjam's polygon, was a stray). The live model (read 2026-10-18) has neither, nor Voth's point: both are to be
restored in the artifact's `settlements` collection (`LORE.md` §12), Shim at 382,788. The point is in the SW lowlands biome, inside the Vothic Kingdom 46 km from its southern border;
Nazar's ruins 164 km west, Wing 177 km north-east, Voth 265 km north-east. The Shim river (*Shim Rivrh*, 5,678 m3/s,
the greatest river of the south-west) is named for the city; **the lake is not on the model yet** (no lake is audited
near the point): the plan assumes a lake the river widens into, the city on its eastern shore, the river entering from
the south and leaving north.

| Zone | Where | What |
|---|---|---|
| **The Temple** | the rise above the shore | the Ancient temple, rehabilitated, the Chichani's Temple of the Sun before Voth's: its high priests' tombs in the lake below it |
| **The Square** | before the temple | the ceremonial square, the kingsmoot's ground: the Ancient halls round it rehabilitated as the old chiefs' clan compounds (the catalog's compounds built against Ancient walls), the sacrifice stone |
| **The Old town** | round the square | the oldest Vothic housing, the clan compounds, the Temple college, the arena (Shim's is older than Voth's) |
| **The Shore** | the lake's edge | chinampas off the shore, the fishers' and ferrymen's quarter, the old royal landing |
| **The Vothic town** | behind the old town | housing poor to rich, shops, taverns, warehouses, the governor's palace (Voth's governor rules the old capital now), the garrison |
| **The Necropolis** | the headland | the old chiefs' tombs, the Ancestry canton's pattern |
| **The Plantations** | the country, 5 km and more | slave plantations: a planter's manor, overseers' houses, slave lines (barracks), the field cages and stocks, the crop (section 1) |

**The plantations** are the one piece nothing holds yet. They are three new entries in the Voth registry
(`settlements/voth/catalog/registry/voth-plantation.js`): `voth_planter_manor` (a manor with a watch floor), `voth_slave_lines`
(long barracks in a stockade) and `voth_overseer_post` (a tower with a bell), plus the catalog's cages, stocks and
racks as furniture; the fields are `core/city` fields in rows. The crop is the **Blïtrit**, the blood-reed (section 5,
question 2): a tall dye-reed grown in wet fields and drying racks of purple-stained stems, with sugar cane as the second
crop (the isle demo's `crop-*` stands have the cane; the blood-reed is a new `crop-blitrit` stand for `biomes/swbay`,
reed-like, red-purple at the stem), and the chinampas growing the city's food. The dye works (vats, the purple on the
ground round them) stand at the shore where the reed is landed.

## 2. The age tune

Shim is Voth's style a few centuries older. The catalog gets no new builders for it; the difference is a tune the
page applies to the Voth registries' materials and dressing, as `KMAT` records (`core/materials/record/`):

- purple render faded and soot-streaked, lichen on the north faces, the gold leaf worn to brass on the crests;
- timber grey, roof tiles mossed, a share of the crests and finials broken (the catalog's walk records untouched);
- the ground a darker, older paving, the canals silted at their edges.

A faded purple render and a lichened stone want textures the library may lack: name them in
`core/materials/PROMPTS-NEEDED.md` when P2 finds the gap, not a procedural stand-in.

The Ancient temple and the square's halls are `rehab` state: the Ancients' white ceramic patched with Vothic purple
and gold, the Chichani's own paint over the Ancients' surfaces.

## 3. The order of work

- **P0. The harness and the Ancient core.** `build.py` reading the Ancient Iziz style, the Voth catalog and
  `core/city` in place; the biome question settled (section 0); the temple and the square's halls standing on the
  lake shore. Done when `dist/shim.html` shows the temple over the lake and `--assert` passes.
- **P1. The site.** The ground (the lake, the river in and out, the rise, the headland), the site editor saving
  `site/shim-site.json`: the square as a plaza on the temple's axis, the zones, the avenues, the plantations' country.
  Done when steps 0-5 run on it.
- **P2. The town and the tune.** Steps 6-12; the age tune on the Voth materials, judged at eye level beside Voth's
  own page; the chinampas. Done when the town fills the site, the tune reads as age and not dirt, and the city test is green.
- **P3. The landmarks and the plantations.** The temple's rehabilitation, the clan compounds on the Ancient halls, the
  necropolis, the arena, the governor's palace; the three plantation entries in the Voth registry (verified on the
  catalog's own sheet first) and the fields. Done when the views of section 4 read.
- **P4. The life.** Citizens (Chichani, the slaves: Nazarites, Wingmen, Agropolitans), the ferry, the night (electric
  light on the rich and civic only; the plantations dark but for the overseers' towers). Done when the night view reads.
- **P5. The record.** `README.md`, `KNOWN_ISSUES.md`, `PORT.md`, the gallery entry, the hash into `PORT-BASELINE.json`.

## 4. Views for the verify

| View | What it must show |
|---|---|
| Overview from the lake | the temple on its rise over the square and the old town, the chinampas, the necropolis headland |
| The square at eye level | the Ancient halls as clan compounds, the sacrifice stone, the temple's stair |
| The old town | Vothic housing under the age tune: faded purple, grey timber, broken crests |
| The shore | chinampas, the fishers' quarter, the royal landing |
| A plantation | the manor, the slave lines in their stockade, the overseer's tower, the cane |
| Night | the temple and palace lit, the plantations dark, one bell tower's lamp |

## 5. Open questions for the owner

1. **Settled (2026-10-18).** The lake is drawn: the region polygon **Lake of Shim** (`rshimlake0001`, kind
   geographic) in the model's `regions` collection, about 32 by 12 km (px 376-382 by 780-796), the Shim river entering
   from the south and leaving north, the city on its eastern shore at px 382,788. Still to do in the model: carve it
   (`tools/scale-model/features.py`'s bay pass, at the land's level there rather than the sea's), re-run the river
   audit so the Shim river flows through it, and refresh the little-demo export.
2. **Settled (2026-10-18).** The plantations grow the **Blïtrit**, the blood-reed (blood + reed by the Vothic table:
   *Blït*, *Rit*), the dye plant of the Kingdom's deep purple, and sugar cane second. The purple ties Shim to every
   Vothic page: its robes and banners are Shim's crop.
3. **Settled (2026-10-18).** The Old Temple is the Sun cult's first seat: the winter-solstice sacrifice began here; the
   great sacrifice is Voth's now, but the high priest lights the old fire at Shim first each winter, the high priests'
   tombs in the lake are a pilgrimage, and the kingsmoot meets on the square when a chief is judged. The Temple answers
   to Voth's high priest, not to Shim's governor. In the build: the sacrifice stone and the old fire's brazier on the
   square, a pilgrims' landing on the shore, the kingsmoot's stone seats round the square's edge.
