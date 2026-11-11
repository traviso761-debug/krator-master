# core/door: doors that open, and real glass

The owner, 2026-10-19/20 and 2026-11-03: "remove all dark voids and make all windows, doors and portals actual doors or windows
that have transparency", "doors that can open/shut with a keypress nearby or by an NPC", and "real glass". Iziz built it first
(`IZDOOR`, `kits/iziz-vernacular/src/69e5-iziz-openings.js`; `settlements/iziz/src/95j-iziz-doors.js`); this module is that
lifted into core so every kit draws its doors and windows the same way (MODULARITY-PLAN.md step 2b; TODO.md, "Real doors and
glass across the kits").

| File | Tag | What |
|---|---|---|
| `10-core-door.js` | [G data] | `KDOOR`: the records, the rules, the walk blocks. No three.js, no DOM |
| `20-core-glass.js` | [G native] | `KGLASS`: the glass kinds as data, and one three.js material per kind |
| `90-core-door-host.js` | [web] | `KDOORHOST`: posing a leaf in three.js, the frame tick, the E key and its tip |
| `test-door.js` | | `node core/door/test-door.js` |

## A door

```js
const D = KDOOR.add({ id: 'house_rich.3.front', at: [x, y, z], hinge: [hx, y, hz], yaw: ry, w: 1.1, h: 2.2, t: 0.07,
                      sign: 1, locked: false, key: 'house_rich' });
KDOOR.open(D, { by: 'npc', auto: 4 });      // or by id; false when locked
KDOOR.nearest(x, y, z, 2.2);                // the unlocked door within reach
KDOOR.walk(KWALK);                          // once the world is built: each doorway's blocks (shut = blocked)
KDOOR.clearDoorways(KWALK);                 // and no other block left standing in an open doorway
const save = KDOOR.state(); KDOOR.load(save);   // deltas by id
```

- `at` is the middle of the doorway's line at the sill; `yaw` the face's outward yaw (a builder's `ry`); `hinge` the jamb the
  leaf turns on; `sign` -1 for a right-hand leaf (a double door's other half). `p0` (default: `at`, raised `h/2`) is the leaf's
  centre when shut; `KDOOR.pose(D)` gives its centre and swing now.
- A door on a solid body (nothing behind it) is drawn shut and `locked`.
- Ids are stable: give one built from the building's key and an index. Without one a door is `door.<n>` in the order drawn.
- `KDOOR.step(dt)` eases the moving doors (1.6 rad/s over a 1.75 rad swing) and switches their walk blocks as they pass half
  open; it returns the doors that moved, which the host poses.

## Kinds of door

A record says how its leaves move; `KDOOR.leaves(D)` gives every leaf's pose now (centre, an axis and a turn about it from shut,
a scale, its shut size), and the host draws leaf i there. `KDOOR.leafCount(D)` and `KDOOR.leafSize(D)` say how many and how big.

| `kind` | moves | with `pair` |
|---|---|---|
| `swing` (default) | about the hinge jamb's vertical line, into the room (`sign` -1: hung on the +x jamb; `both`: away from whoever opens it) | a double door: the two leaves swing apart from the jambs |
| `slide` | along the doorway's line toward the hinge jamb, its own width (a pocket door, a barn door) | bi-parting: the halves slide apart |
| `lift` | straight up its `rise` (default its height: a portcullis); `roll`: rolls up into the head (a roller shutter); `drop`: sinks into the floor (a floodgate) | the halves meet across the middle height, the top rising and the bottom sinking (blast doors) |
| `tilt` | hinged at its head, its foot swings out and up (an up-and-over garage door, a flap) | |
| `fold` | two panels a side that fold to the jamb, the second turned back (a bifold) | a double bifold |
| `iris` | shrinks to its middle | |
| `hatch` | lies in a floor or a roof from its hinge edge (`at`), turns up about the doorway's line (`h` its depth); no walk blocks | |

`both` makes a swing door double-acting (it swings away from `open`'s `from: [x, z]`, the opener's place; the host passes the
player's), `spring` (seconds) shuts it by itself after every opening, `rate` sets its speed against the registry's (a blast door .35), `swing` sets the angle it opens to, `walk: false` gives it
no walk blocks. The presets (`preset` on `add`, `KDOOR.PRESET`) name the usual doors:

| preset | is |
|---|---|
| `single`, `double` | a swing door; a pair |
| `saloon` | a sprung, double-acting pair of louvred half leaves (no walk blocks: a walker pushes through) |
| `slide`, `pocket`, `barn` (plank), `biparting` | sliding doors |
| `portcullis` (grille), `roller` (slat, rolls up), `blast` (plate: a vertical pair), `floodgate` (plate, sinks) | vertical doors |
| `garage` (slat), `flap` (plank) | tilting doors |
| `blastside` (plate) | a heavy bi-parting slide |
| `bifold`, `iris` (disc), `hatch` (plank: a trapdoor) | the rest |

A pair is one record over the whole doorway (`w` the doorway's width, each leaf `w/2`): one id, one set of walk blocks, both
leaves posed together. Two mirrored single records (`sign` 1 and -1) still make a double door whose leaves open apart.

## The leaves' look

`30-core-door-leaf.js` (KDOORLEAF, THREE, no DOM; load it ahead of the builders) gives a leaf in a style as a unit geometry,
its frame and its glass apart: `flat`, `plank`, `panel`, `glazed` (French doors: a kick rail, glazing bars over one light),
`half` (panels below, glazed above), `glass` (a thin frame round one light), `louvre`, `grille`, `slat`, `plate` (a heavy plate with a rim and ribs: blast doors, floodgates), `disc`.
`KDOORLEAF.meshes(THREE, style, {frame, glass}, n)` makes the two InstancedMeshes; `KDOORHOST.instanced(D, [frame, glass],
[i0, i1], q0)` poses both (the same index, every leaf of a pair its own). The record's `style` says which a door wears.
The Vernacular's `IZDOOR.leaf` takes `style` and the kinds (`kits/iziz-vernacular/src/69e5-iziz-openings.js`): Talia's glazed
double doors and panelled leaves, Pylon's panelled pairs.

## Glass

`KGLASS.material(THREE, 'clear')` is the shared pane; the kinds are `clear` (Iziz's glass), `lit` (a night window you still see
through), `frosted`, `smoked` (the Ancients' tinted curtain walls), `stained` (`{color}`), and `room`, the dim card a pane on a
solid body stands in front of (opaque: the room you would see). `opt.emissive` gives a lit pane another glow (an electric lamp's). Every pane is transparent with depth writes off, so it sorts
after the opaque scene. `KGLASS.SPEC` is the data the Godot side reads (a StandardMaterial3D with alpha transparency).

## The host

```js
KDOORHOST.instanced(D, im, idx, q0, s);   // the leaf is instance idx of InstancedMesh im (or a function returning it;
                                          // im an array: a glazed leaf's frame and glass; idx an array: one per leaf)
KDOORHOST.object(D, mesh);                // or its own mesh
KDOORHOST.posed(D, (D, pose) => ...);     // or the page poses it itself (a leaf instanced from its hinge, a rolled mat)
FRAME_HOOKS.push(dt => KDOORHOST.tick(dt));
KHOST.take({ ..., keys: { e: () => KDOORHOST.toggleNear(camera.position, walking) } });
const tip = KDOORHOST.tip(() => camera.position, () => walking); FRAME_HOOKS.push(tip);
```

## The reachability audit

`KWALK.reach(starts, o)` (core/walk) floods from the starts (a doorstep, a spawn) over the registered floors, stairs and, with
`o.ground`, the open ground, and returns every floor no walker gets to: a sealed room, a floor no stair meets. Open the doors
first (`KDOOR.list.forEach(d => KDOOR.open(d))` and a few `KDOOR.step`s, or switch their blocks off).

## Who takes it

- Iziz (every target) and, through its page, Pylon and Talia; the Vernacular bundle (`vernacular.py bundle_files()`: Verge's and
  the isle demo's `IZV`) carries `10` and `20`. The Vernacular's `IZDOOR` is the drawing of these records.
- The Yuni engine's worlds (2026-11-03): Yuni (`settlements/yuni`: its own leaves posed through `KDOORHOST.posed`, its walker,
  `DOORS.reach` on core/walk), Locus and its two kit sheets, Mungo, and Verge's YKIT (the leaves drawn shut; Verge's KDOOR is the
  Vernacular bundle's).
- Girder and Mav's Refuge (one fork of the Yuni engine each): `src/54-openings.js` (`goLeaf`: a leaf is an instance of its own
  bucket family, `doorleaf`, which wears the plank map) and `src/81-glow.js` (the panes: KGLASS 'clear', the night's 'lit', the
  room card on a solid body). Girder's doors stand open as built and its windows are cut through the shells' walls; Mav's doors
  are drawn shut in openings cut through the lots', levels' and huts' walls. Girder puts the doors in core/walk
  (83-walk.js wkBuild: `goWalk`); Mav's has no core/walk yet.
- The Post-Apoc kit: `src/35-pa-open.js` (`poLeaf`, `poCard`; `wallOpen` records its openings, and a `door()` drawn in one is
  operable, one on a solid face a locked record that keeps its drawn leaf).
- The Ancients kit (`kits/ancients`, every target): `src/8zo-anc-open.js` is its drawing of the records, wrapping `kput` so no
  builder changes: the window items (winI/winD, winBig, oval, winSm, cellD, paneD) are one pane (KGLASS 'smoked' in the Ancients'
  blue; a ruin's pane gone in three of five) before a room card (KGLASS 'room'; two in five lit at night, by a hash of the spot),
  the arched doors (archOpen and the arcologies' dkArch, plyArch, acArch, tgArch, aiPortal) locked records with stable ids
  ('<type>/<decay>.<item>.<n>'), the arcologies' near-black void materials the card's deep shade; the interiors target's partition
  doorways get operable leaves (`anLeaf`, from `8zz-interiors.js`). Its forks read the fragment in place: Screamers (its village's
  door panels, `src/8zp-scr-open.js`), the Ancient Port kit and through it Hook and the Dam Basins (the iron doors, `src/8zp-port-open.js`).
- Noah's Regret: core/engine's `36o-open.js` read in place (`svLeaf`): the cabin doors and the deck buildings' leaves, cut with the decks.
- kits/ancients-interiors' sheet: `src/75-ai-doors.js` makes kits/interiors' shell leaves KDOOR records (posed, `KDOORHOST.posed`) and
  its panes KGLASS 'clear'.
- The other building kits come onto it in the doors-and-glass pass (TODO.md).
