# biomes/greenstep: notes

Working notes for the kit (`PLAN.md` is the plan; `BIOME-API.md` the contract; `KNOWN_ISSUES.md` what is open).

## How it was started (2026-11-09)

From `biomes/riftrim` (CLAUDE.md: start a new build from the nearest finished one): its `build.py` (stations, `kin` read in place
through `station.json`), its stage (`45-host-stage.js`: the field cache, the painted ground on KGROUND, the strata on the steep), its
far field, sky, atmosphere and water fragments, its land library (`44v`, here `stepLand()`: two rivers instead of one) and its probe's
checks. What is Greenstep's own:

- **No variants** (riftrim's `86-host-variants.js`): the kit has no tree of its own. The trees are the neighbours' kin, grown by
  `87-host-kin.js` in nwlowlands' way: near the LOD spine a hero form shown within `LAND.kinLT` of the camera and the source's far
  form past it (the core's runtime LOD: `BIO.owner`, `range`, `minRange`); elsewhere the far form only. So the forest reaches the
  page's edge without a hero tree where nobody stands.
- **A crown's reach is checked, not only its bole**: a row's tree is dropped when its crown would hang over the water (`overWater`,
  the share of `crownR` it may lean out: the veil willow's .55) or over a settlement's site. The first run had 471 sprawl-oak leaves
  under the Clodosriba and 40 over Tallwalls' promontory.
- **The site field** (`FIELD.site`, the land's `site(x, z)`): a settlement's footprint. BIO.init's mask and the zones keep the floor
  off it, the kin keep their crowns off it, and the probe checks it (with a negative control).
- **Two rivers** (`RIVERS_SPEC`): the Clodosriba (a slot rille through Terrace III, then Terrace II) and the Western Rille's stream;
  both fall at the promontory's prow as the Great Veil's twin curtains.

## The ground (stations/tallwalls/44w-host-land.js)

Analytic, not baked: the benches are levels (Terrace III rising 70 m over its width), the risers are a `stair(d, run, steps, cliff)`
profile off a lobate plan line (each front a cliff over about half its share, then a ledge), jogged in and out by a noise across the
front so the colonnade shows buttresses and bays. The rilles are a cross-section (`rille(q, floor, top, fw)`: the floor, near-vertical
walls in ~26 m, a talus fan) on lines parametrised by z (the Clodosriba) and by x (the Western Rille), so the ground costs no
nearest-point search. The falls' notches are the channel cut through the riser to the level below, as riftrim's gorge cuts them.

## What the look runs taught (2026-11-09, software GL)

- **The falls' notch must not run down the wall.** The first cut carried the Clodosriba's channel from the lip to the basin along the
  river's line, which made a ~90 m gash down the Great Veil; the fall sat in a V-slot. Now the channel stops 18 m past the lip (a notch)
  and the river is two flows: to the brink, and from the basin's mouth north; the falls join them.
- **The Great Veil is sheer at the prow** (`VEIL_K`): the three-front stair is mixed into one wall between and round the two lips, so
  the twin curtains fall free; the stair returns either side (the colonnade's benches, as the far view shows).
- **A river must fall a little faster than its plain.** Terrace II falls .014 north; a river at .012 ran perched above its banks
  (71 ferns "under the water"). The basin's level is taken from the plain at its rim, and the river falls .0145.
- **The zones' cold bands are this page's**, not riftrim's: with the model's +15 °C at 1,985 m and 6.5 °C/km, Terrace II is cold 0,
  Terrace III ~.03-.05 and Terrace IV ~.16; riftrim's bands put the trumpets on Terrace IV and no frill anywhere.
- **The ground's grain is decoded** (`pow(.., 2.2) * 1.26`): riftrim samples its detail map raw (its RAWTEX finding is baselined);
  a new file may not add one (`tools/check_source.py`).
