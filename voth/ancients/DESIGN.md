# Krator Ancients — design doc for the queued work

Three new families, in the order they were asked for. This doc makes the
decisions; `API.md` stays the contract and is updated as each lands.

Everything here obeys the existing contract: metres, `x` east / `z` south / `y`
up, a person is 1.75 m, one builder per `src/` fragment, `reseed(N)` at the head
of every builder, geometry through `mesh`/`meshMerged`/`kput`, and no top-level
name that another fragment also declares.

---

## 0. Where each family lives

All three get **their own build target**, so none of them loads unless you ask
for it and none of them competes with the 32-type showcase for budget.

| target | output | why separate |
|---|---|---|
| ~~`repaired`~~ | retired | folded into `kit` on 2026-09-28 (DECAYS=[0,1,2,3]); the user accepted the kit running over its 6M soft ceiling |
| `canyon` | `dist/canyon.html` | its own site (a canyon), nothing to do with the row layout |
| `dalab` | `dist/dalab.html` | belongs to the DALAB settlement, not to this kit |

A target is two fragments (`89z-rows.js`, `91z-views.js`) plus whatever new
`src/` fragments it needs; `EXTRA_BUILDERS` registers builders without touching
`90-scene.js`. Seed blocks reserved: **canyon 9320–9329**, **DALAB 9330–9339**,
**hanging modules 9340–9369**. `repaired` needs none — it is the same builders
at a new decay level.

---

## 1. Rehabilitated structures — decay level 3

### The idea
Not "less ruined". A ruin that **people came back to and patched with what they
had**. The ancient fabric is still legible and still failing; everything added
since is cruder, mismatched, and obviously later. The story should be readable
in one frame: *this building outlived its builders, and someone is living in it
now.*

### The decay model
`d` today is `0` intact, `1` ruined, `2` toppled. Add `d === 3` **repaired**.

This is deliberately *not* a new axis. The existing helpers already key off
`d > 0`, and a repaired building is still a weathered one, so `SHELL(3)`,
`CONC(3)`, `WIN(3)` all correctly return the rusted/dead forms with no change.
The one thing to audit is every `d === 2` test — there are 9 of them, all
guarding the toppled branch — and every `d === 1` test, which must not silently
exclude 3. `build.py` gets a check for bare `d==1` / `d>1` comparisons.

`STATE(d)` becomes `d===3?'repaired':d>0?'ruined':'intact'`.

### What "repaired" is made of
Ancient shell, at roughly **60% of the ruin's hole density** — then a fraction
of the remaining holes *filled* with salvage that does not match:

* **Patches.** Corrugated sheet, flat plate, timber boarding, brick infill, and
  stretched tarpaulin, riveted over the hole with a visible overlap and fixings.
  Each patch is a quad slightly proud of the shell, rotated a few degrees off
  the panel grid, in a material that is plainly not the original.
* **Accretion.** Lean-to shanties on the terraces and ledges, stovepipe
  chimneys, water butts fed by gutters cut into the ancient parapets, washing
  lines, roof gardens and planters in the old balcony troughs, timber stairs and
  ladders bridging the flights that failed.
* **Services.** The ancient cyan light strips stay **dead** — that is the point.
  New lighting is warm and sparse: lamps at doorways, firelight through patched
  glazing, cable runs stapled along walls between buildings.
* **Glazing.** Mismatched: a few original blue panes, some clear salvage, some
  boarded, some open with a shutter.

### New material and kit vocabulary
`MAT.corrugate` (galvanised, dented, streaked), `MAT.timber` (sawn boards),
`MAT.tarp` (faded woven sheet, slightly translucent), `MAT.salvagePlate`.
Kit items: `patchSheet`, `patchPlate`, `plank`, `ladder`, `stovepipe`,
`waterButt`, `lampWarm`, `planter`, `shantyBox`, `cableRun`.

### Helpers (shared, so all 33 types get it from one edit)
```js
patchHoles(geos, d, n)      // sample the shell, rivet salvage over the gaps
accrete(geos, d, n)         // lean-tos and clutter on the flat surfaces
```
Both ride the **existing** `upFaces`/`ledgePoints` sampler from round 5 — that
is already the machinery for "where is this building's ledge", which is exactly
where a shanty gets built and where a water butt sits. `patchHoles` needs the
complementary sampler for *vertical* faces; that is the same walk with the
normal test inverted.

### Budget
`repaired` is a full 32-type showcase, so it inherits the kit's ceilings: 6M
scene triangles, 900 draw calls. Patches and clutter are small and repeated, so
**everything goes through `kput`**, never its own mesh. Expect it to land near
the kit's numbers since the shell geometry is identical.

---

## 2. Hanging canyon structures

### The idea
Colossal pipes span a canyon. Beneath them, structures hang on cables like
pendants on a chandelier — at different drops, in different geometries, some
single, some in clustered tiers. Read from the reference: the pipes are the
infrastructure and the dwellings are *parasitic* on them.

### The armature
* **Pipe.** A long cylinder, 14–22 m in diameter, with segment flanges every
  ~30 m, riveted bands, and a walkway rail along the top. It sags slightly
  between abutments (a catenary, not a straight line — a dead-straight pipe
  reads as a prop). Rock abutments at each canyon wall, keyed into the cliff.
  Two or three pipes at different heights and angles, as in the reference.
* **Canyon.** Reuse the technique from `77-dam.js`: two rock masses with a
  rough, wobbled inner face. Needs to be rougher than Theodiga's — that is
  already a logged complaint about the dam.
* **Hangers.** Attachment collars clamped round the pipe at intervals, each
  carrying one to four cables.

### Modularity — the part that matters
A pipe does not know what hangs from it. It is built from a **spec array**, so
swapping payloads is data, not code:

```js
const SPAN = {
  a:[-1400,300,-200], b:[1500,330,180], r:18,       // abutment to abutment
  hangs:[
    {t:'pod',    u:.18, drop: 55, s:1.0, seed:3},
    {t:'prison', u:.42, drop:120, s:1.4, seed:7},
    {t:'drum',   u:.63, drop: 40, s:0.8, seed:11},
    {t:'lift',   u:.80, drop:210},                   // the climbing car's cable
  ]};
```
`u` is position along the pipe (0..1), `drop` the cable length, `s` a scale.
Each `t` is a key into a registry:

```js
const HANG = {
  pod   (P,o,d){…}, prism (P,o,d){…}, drum(P,o,d){…},
  ring  (P,o,d){…}, cluster(P,o,d){…}, prison(P,o,d){…},
  lift  (P,o,d){…},
};
```
Every entry takes `(parent, opts, decay)` and returns its own bounds, so a new
payload type is one function and one line in a spec — no builder edits. This is
the same trick as `EXTRA_BUILDERS`, one level down.

### The payload shapes
Variety is the requirement, so no two share a primitive:

| key | form |
|---|---|
| `pod` | geodesic sphere, porthole lenses, a ring gallery round its equator — closest to the reference |
| `prism` | elongated octahedron / cut diamond, glazed facets, hung point-down |
| `drum` | stacked cylinders of decreasing radius, a carousel with balconies |
| `ring` | a torus hung flat, open in the middle, cabin blocks round the rim |
| `cluster` | a hub with radiating arms, each arm a smaller pendant — the chandelier, explicitly |
| `prison` | below |
| `lift` | the climbing car |

### The prison
It must be **alienating and foreboding**, and it gets there by refusing what the
others offer:

* A blank, heavy, faceted mass — no gallery, no balcony, no visible door.
* Openings are slits, too small and too high, and there are far too few of them
  for its size. Where the others glow warm, its few lit cells are cold.
* An external cage of ribs clamped over the shell, obviously added and obviously
  not for the benefit of the inhabitants.
* **Cell pods hung beneath it** on short cables, in a dense bunch — each barely
  bigger than a person. That is the image that should do the work: the building
  is a thing that holds other, smaller things.
* A single cable to the pipe, and a winch instead of a stair. Nothing about it
  suggests anyone leaves.
* Scale: the largest payload, and hung lowest, so it sits alone in the void.

### The climbing elevator
One hanger's cable is a **track**: a heavier twin cable with rack teeth, a
guide rail, and a counterweight on the return side. The car is a small drum
with a lit cabin, clamped to the track with roller arms, parked at a fixed
height per variant (there is no animation system in this kit — the car is
static, and the variants use different heights so it reads as a thing that
moves). The pipe end gets a winch house.

### Variants
| `d` | state |
|---|---|
| 0 | intact — lit, glazed, cables taut, the lift car mid-climb |
| 1 | rusted and overgrown — the reference's register: moss on the upper surfaces, vines trailing off the pods, glass gone, a few cables slack |
| 2 | **destroyed** — cables snapped and hanging loose, two or three payloads **fallen to the canyon floor** and broken open, one pipe segment parted and sagging, the lift car crashed at the bottom of its track |

`d = 2` here means *fallen*, not *toppled*; it is the same slot the skyscrapers
use for their catastrophic variant. Fallen payloads use `dropFragment()` so they
sit on the canyon floor properly — that helper exists precisely because
hand-picked heights do not work for irregular shapes.

### Budget
`mega` class, 700k triangles per decay state. The pods are the risk: a geodesic
sphere at high subdivision is expensive and there are many. Build one geometry
per payload *type* and instance it through `kput` where scale allows;
`meshMerged` the rest per material. Cables are `beam()` on a kit box — never
their own meshes.

---

## 3. DALAB — the ancient lab domes

**Scope: the ancient domes only.** No settlement, no mounds, no life layer, no
streets. Those are a separate job; this builds the thing at the centre that
everything else will be laid out around.

### The complex
* **One great dome**, opaque, wider and taller than the Voth palace, with a
  ribbed Gaudí shell and a crown of lantern glazing at the apex.
* **Six to eight smaller domes** (r 16–46 m) set around it at varied distances
  and angles, no two the same size.
* **Passageways** connecting them: low tubular corridors, part buried, with
  ribbed roofs and occasional glazed clerestories.
* **A low ruined wall** round the whole compound, breached in places.
* Heavily **rusted and overgrown** throughout — this complex is never shown
  intact. Decay levels are `1` (the canonical state) and `3` (repaired, once
  that exists, since the priests occupy it).

### Style
The kit's Gaudí/Modernist ancient language, plus *Chrono Trigger* 1999: smooth
pale domes with a hard, deliberate geometry, ribbed seams picked out in a
contrasting tone, and a general sense of a facility rather than a temple. The
domes are **opaque** — this is the one place the kit does not reach for glass.

### The damaged domes — the interesting part
Two or three domes are **broken open**, showing a clean cross-section of what
was inside. This is where the original brief's "interiors visible through
openings" item finally pays for itself, and it should be done properly:

* Floor plates at 4.5 m centres, cut off at the break so the section reads.
* Partition walls making corridors and rooms — a double-loaded corridor plan.
* **Ward rooms**: rows of beds, a nurse station, curtain rails.
* **Lab rooms**: benches in rows, fume hoods, a wall of specimen tanks (the
  genetic-engineering canon — tall cylinders, some still holding something).
* Service cores: lift shafts, stairs, ducts and conduit bundles running
  vertically through the section.
* Everything in `MAT.guts` and `MAT.dark` with a few warm-dead accents, so the
  interior stays legibly *interior* against the bright shell.

This needs a new shared helper, since the kit has nothing for it:
```js
sectionInterior(parent, bounds, d, opts)   // floors, corridors, rooms, cores
```
Worth building generally — the original brief wants interiors behind openings on
every type, and this is the same machinery.

### The AI
No requirement to model The God, but the great dome should have an obvious
**centre** that a machine would occupy: a sunken circular chamber on the axis,
ringed by cabinet banks and cable trunking converging on it. It reads as a
plant room to a stranger and as a shrine to a priest, which is the point.

### Open question
**How big is the Voth palace?** "Wider and taller" needs a number and I do not
have that project's dimensions here. Until it is confirmed I will build the
great dome at **radius 110 m, height 95 m**, which is larger than anything in
this kit except the megastructures, and flag it so it can be rescaled by one
constant.

---

## Order of work

As requested:

1. **Repaired (d = 3)** — rehabilitated structures.
2. **Hanging canyon** — the pipes and their payloads.
3. **DALAB domes** — domes only, nothing else of the settlement.

One note on that order rather than an argument against it: (1) touches all 33
builders and (3) wants `sectionInterior`, which is the same machinery as the
original brief's "interiors behind openings". If the repaired pass surfaces
changes to the shared samplers, DALAB inherits them for free by coming last — so
the sequence works in that direction too.

Each lands as its own target and its own artifact, verified the usual way:
`build.py --target X` green, `verify.py --assert` green with a clean error
panel, every preset shot and *looked at*, and `KNOWN_ISSUES.md` updated.
