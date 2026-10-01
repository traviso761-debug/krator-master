# alt-civic — alternate civic builders (queue item 3, civic group)

From-scratch ALTERNATE versions of the civic types, after the user's `arco1`
and `arco2` reference sets. No existing builder was copied: each is a new
form, in its own fragment `src/8al-alt-NN-*.js`, on shared helpers in
`src/8al-alt-00-lib.js` (all prefixed `alt`).

```
python3 build.py --target alt-civic
python3 jscheck.py .syntax-alt-civic.js
python3 verify.py dist/alt-civic.html --assert --views "<preset>,..."
```

Reference numbers are the line numbers in `refs/arco1-index.txt` /
`refs/arco2-index.txt` (sheet `arcoN-sheetK.jpg` holds 30 per sheet, so
arco1 #46 is sheet 1, cell 16).

## Layout of the target

One row per builder along +z, every decay side by side across x:
intact (0) at `x=-s`, rehabilitated (3) at `x=0`, ruined (1) at `x=+s`,
reclaimed (2) at `x=t=2s`. A row appears only if its builder function exists
(`typeof window[fn]`), so the target builds at every step. Presets per type:
the row, `· intact`, `· ruined`, `· reclaimed by day`, `· reclaimed at night`
(night preset, firelight on) and `· rehabilitated`, plus the opening overview.

## Decay contract (all 13)

`builder(scene,gx,gz,d)` local to its own group (`KOFF`), one literal
`reseed()` at the head, materials from `MAT`/`CONC`/`SHELL`/`PLATE`, kit items.

| d | meaning | how |
|---|---|---|
| 0 | intact | clean concrete / white metal, lit glass (`darkPane` + `cell`) |
| 1 | ruined | `dd` materials, holes, a collapse that changes the silhouette (`fall`), fallen pieces placed with `dropFragment`, rubble, moss, vines, trees |
| 2 | reclaimed / reinhabited | the same ruin (`fall`), plus `altReclaim()`: huts and lean-tos on the flat roofs, gardens, water butts, washing, fire pits and fire in the openings (shown at night), a ring of stalls and plots round the foot, people. On its own literal seed, run last |
| 3 | rehabilitated | ruined materials but no collapse (cleared and patched); the scene loop halves the holes (`HOLES`) and runs `repairPass()` |

Decay 2 is called only because each row sets `t` (the scene loop skips d=2
without it). Ruins share their layout draws with the intact building: every
decay-only choice is drawn after the layout or is a position hash (`altH`).

## Seeds

Builders 9905-9917 (one literal each), reclaimed passes 9930-9942.
**9900-9904 are not free**: `buildGovernment` claims `9900+d`. The rest of
9900-9949 (9918-9929, 9943-9949) is unused.

## Builders

Triangles are per-type scene content from `verify.py --assert` (instances
expanded); see the table at the end.

### 1. Office alt 1 — the Terrace Wedge (`8al-alt-01-office-terrace.js`, seed 9905)
A stepped office mass of 18 trays wedged between two blind service slabs
(124 m), each tray edged with a sloped louvre plate so the steps read as one
ribbed slope; a louvred crown slung between the slab heads; podium colonnade.
- Refs: arco1 #30 (stepped louvred pyramid between concrete shafts), arco1 #72
  (same type, from above).
- Ruin: the east slab snapped at 78 m and lies east on the plain; the crown hangs
  tilted off its lost bearing; a bite out of the front-east trays down to the
  podium, slabs hanging off their rebar. Reclaimed: fires in a block of west
  trays, huts on the trays and podium, stalls.
- Weak: the fallen slab is a clean box (no broken end); the louvre plates are
  flat boxes, so close up the slope reads ribbed rather than louvred.

### 2. Office alt 2 — the Stacked Piers (`8al-alt-02-office-stack.js`, seed 9906)
A glazed shaft between four piers of offset stacked blocks of different
heights, one deep window per block face, a few blocks left out as gardens; a
planted podium with a pier arcade.
- Refs: arco1 #41 (stacked-block tower round a glazed core), arco1 #47
  (cantilevered block heads).
- Ruin: the south-east pier fell from 50 m, its blocks scattered on the plain;
  glass gone, the shaft shows floors, desks and broken mullions.
- Weak: the blocks are plain boxes (no stone coursing); intact, the shaft is
  one dark pane per face.

### 3. Office alt 3 — the Sail Fins (`8al-alt-03-office-fins.js`, seed 9907)
A slab bowed in plan (radius 130 m), its convex face hung with balconies and
coloured awnings, struck through every second bay by a sail-shaped fin that
sweeps up in a hollow curve to a point above the roof; a pool along the front.
- Refs: arco1 #6 (bowed slab of sawtooth fins and stacked balconies).
- Ruin: three bays east of centre pancaked to two storeys; three fins snapped,
  their heads lying in the forecourt; balconies half gone.
- Weak: the fins are 1.4 m thick, so from far off they read as spikes rather
  than sails; the slab's back face is blank.

### 4. Starport alt — the Saucer Deck (`8al-alt-04-starport.js`, seed 9908)
A 186 m landing dish (upturned rim, coned soffit) 72 m up on four raking legs
and a core; a terminal of four glazed rings stepping up underneath; a control
saucer and two delta craft on the deck; three pad towers (stalk, stacked
discs, saucer head) to the north.
- Refs: arco1 #80 (disc on raking pylons over a tiered terminal), arco1 #8
  (pads stacked on a stalk), arco1 #13 (saucer pads on towers).
- Ruin: a front-east sector of the deck broke away with its leg and lies on
  the plain; the deck lists; a craft fell into the debris; a pad tower is down.
  Reclaimed: a hut village round the deck rim, fires round the foot and in the
  terminal rings.
- Weak: the deck's broken edges are clean radial cuts; the legs are flat slabs.

### 5. Bunker alt — the Bastion Drum (`8al-alt-05-bunker.js`, seed 9909)
A flared concrete drum open through an oculus, girdled by slit bands, reached
only by four stairs that climb between pairs of wedge buttresses to doors at
15 m; a palisade of stepped slabs with four gates, and a berm.
- Refs: arco1 #43 (flared drum on stair-carrying buttresses), arco2 #9 (walled
  precinct of stepped slabs).
- Ruin: the south-east lip burst outward to the slit band (floors exposed),
  its slabs lying against the wall; one buttress of that stair down and the
  flight broken; a run of palisade flat.
- Weak: the floors inside are full discs; the oculus court is only a slab.

### 6. Library alt — the Reading Star (`8al-alt-06-library.js`, seed 9910)
A white ovoid hall with an oculus and six bulging barrel pods, each ending in
one great round window with a spoked frame; a long curving ramp on piers lifts
readers into the front pod.
- Refs: arco1 #46 and #105 (white spheroid with radiating porthole pods reached
  by a ramp), arco2 #50-52 (bulging shells).
- Ruin: one pod broken off onto the plinth; the shell holed; the ramp broke at
  its middle and the span lies below.
- Weak: the ramp arrives under the front pod's window rather than at a door.

### 7. Gate alt — the Horns (`8al-alt-07-gate.js`, seed 9912)
Two ribbed horns (lens section, 14 flutes) rise from one stepped plinth, swell
out and curl in so their points nearly meet 220 m up; the road passes under a
parabolic arch through the plinth; a glazed bridge at 100 m.
- Refs: arco1 #64, #65 (pair of curved horn towers leaning to a near-meeting),
  arco1 #51 (inward-curling petals).
- Ruin: the east horn snapped at 130 m, its point lying east along the plain;
  the bridge parted and both halves hang from their horns.
- Weak: the horn sections stay horizontal while the axis leans, so the upper
  horn is slightly sheared; the lit floor bands are strips on the skin.

### 8. Robotics alt — the Rig (`8al-alt-08-robotics.js`, seed 9913)
A two-deck platform 60 m up on four splayed lattice legs, crowded with shops,
two jib cranes and a domed control pod; under it a 34 m robot hangs half
assembled in chains; rails run in from a saw-tooth shed.
- Refs: arco1 #3 (tower rig on lattice legs), arco1 #0 (domed works on a
  platform).
- Ruin: the north-east leg buckled and the platform lists onto it; the robot
  broke its chains and lies on its back; a jib fell; two shed bays down.
- Weak: the robot is a block figure; the lattice is struts only (no gussets).

### 9. Data center alt — the Perforated Stacks (`8al-alt-09-datacenter.js`, seed 9914)
Three round decks on drums of server halls joined by bridges, carrying six
white stacks that swell into barrels studded with round vents.
- Refs: arco2 #1 and #2 (model city of perforated towers on round platforms
  joined by causeways), arco2 #28 (perforated stack).
- Ruin: the tallest stack snapped at its lower barrel and lies north across the
  plain; the east bridge fell; the vents are dead.
- Weak: the heaviest of the group (about 1 000 instanced vent ovals per decay);
  the plant on the decks is generic boxes.

### 10. Police alt — the Watch Cup (`8al-alt-10-police.js`, seed 9911)
A blind stem carrying a cup of three trays stepping out as they rise, the top
one belted with a lozenge frieze, glazing under the brow, a lamp mast; a
palisade of stepped slabs round the yard, one gate and a stair.
- Refs: arco2 #9 (cup on a stem inside a palisade of stepped slabs), arco1 #47
  (cantilevered heads).
- Ruin: the cup's south-east corner broke away to the foot; the stem cracked;
  a run of the east palisade lies flat.
- Weak: the trays are boxes, so the cup's underside steps but is square-cut.

### 11. Hospital alt — the Linked Blocks (`8al-alt-11-hospital.js`, seed 9915)
A dark-glass clinic tower of rounded plan with a helipad; three concrete ward
cubes stacked, each turned off the last, on tall pilotis; two glazed bridges;
a long front wing with an ambulance canopy.
- Refs: arco2 #8 (dark tower and stacked ward blocks on stilts joined by sky
  bridges).
- Ruin: the top cube slid off and lies east; the lower bridge fell; the tower's
  skin is gone and its head burnt out.
- Weak: the tower is a straight prism; the cubes' windows are bands only.

### 12. Campus alt — the Garden Bowl (`8al-alt-12-campus.js`, seed 9916)
Terraced brick bars on three sides of a sunken lawn shaped into sinuous ridges
edged in white concrete, every terrace with a planter and hanging green; a
white tensile canopy on masts over a lecture court; a thick wood round it.
- Refs: arco2 #4, #5, #16 (planted terraced brick campus round a lawn of
  curving ridges), arco2 #6 (tent roof over a garden court).
- Ruin: the middle of the north bar slumped to brick talus; the canopy hangs in
  tatters; the bowl is a young wood. Reclaimed: plots on the lawn.
- Weak: brick does not rust, so the ruin reads mainly by growth and the slump.

### 13. Government alt — the Citadel (`8al-alt-13-government.js`, seed 9917)
A blind keep 112 m tall split by a deep slot and crowned by an open cage of
beams, between two half-round finned bastions with a ring of arches; a broad
flight up the base block; lower towers behind.
- Refs: arco1 #34 (citadel of a slotted tower between round bastions), arco1
  #89 (the brutalism sampler sheet).
- Ruin: the keep broke at 76 m, its head lying back across the rear towers; the
  west bastion's front split open to its floors; the flight cracked.
- Weak: the bastions are half-drums with a flat back; few windows.
