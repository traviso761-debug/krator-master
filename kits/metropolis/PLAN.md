# kits/metropolis: the test bed for the metropolis system (plan, 2026-11-02)

Sixteen new Ancient buildings, eight skyscrapers and eight midrises, designed from the first line for the range tiers of
`biomes/ancientsvalley/PLAN-ANOMALIES.md` section 13. They exist to find out what shells well, what breaks, and what a
conversion of an older Ancient building would take. **The owner chooses what to convert from these findings.**

Status: step 2 and 3 of the order at the end. Everything past the spike waits for the owner's eye. Results: section 9.

## 1. Where it lives, and why

**A new kit, `kits/metropolis`, not a target of `kits/ancients`.**

- A target joins one shared script of over 150 fragments, on the old host, with a vendored biome core that has no
  `BIO.impostor` and no `BIO.LOD.fade`. Those two are what this test is about.
- The metropolis will stand in `biomes/ancientsvalley`, a biome page on `core/biome`, `core/host` and `core/atmos`. A kit on
  those same cores can be read in place there, fragment by fragment, as biome kits read each other.
- The `[G data]` fragments (records, plans, shell cages) are plain functions with a node test, and `KSHELL` lifts out to
  `core/` after the go without moving anything else.
- What it gives up: the Ancients' helpers. It keeps their look through the same library sets (`materials.json` names
  `metal.ancient.white`, `concrete.board`, `metal.bronze`, `metal.bronze.verdigris`), and their interiors through
  `kits/interiors` and `kits/ancients-interiors`, read by their own bundles.

## 2. The family

What makes the sixteen one family, so they sit beside the kit's towers and the lore's "Cyclopean, Modernist, Organic":

- **Skin:** white seamed panel on the towers' faces, board-formed concrete at the root. Blue glass, gone in a ruin.
- **Hoops:** a bronze band at every plant floor. The hoops are where the structure transfers, so a ruin breaks there first.
- **Roots:** every building flares or buttresses where it meets the ground. Nothing sits on the plaza like a box.
- **Ribbons and vaults:** windows gather in ribbons where people are; the long blank stretches are real windowless uses
  (records, hydroponics, tanks, cold stores, data). A blank band is a floor with a job, never a texture.
- **Cyan strips:** at the root, on the crown and round every sky lobby. Dead in a ruin.
- **One spine:** every tower's lifts and stairs stand in one core that runs straight from the lobby to the top storey it
  serves. Core dimensions come from a short shared list, so a floor plan's starting point is always the same.
- **A storey is 3.6 m** floor to floor (the Pile's 3.66 rounded for the bays), 2.9 m clear, with public floors at 5.4 m or 7.2 m.

## 3. The shells: what the brief's box needs to become

A box of 12-60 triangles with a parallax map fits a slab. It does not fit a cone: at 300 m a 60 m cylinder inside a
square box shows its corners as empty air. So **`KSHELL` has two modes, one heightfield idea:**

| Mode | For | The map | The bake |
|---|---|---|---|
| `polar` | anything **star-shaped about its axis**: cones, drums, spheres, twisted slabs, wedges, lobes | `(θ, y) → surface radius` | one unwrap render: a vertex shader writes `(θ, y)` as the clip position and radius as depth, so the outermost surface wins |
| `box` | slabs too long for polar to sample (aspect over about 2.5) | `(perimeter, y) → depth from the box's face` | one orthographic render per face |

The cage is a low-poly envelope that holds the building: in polar an 8-sided frustum stack (about 56 triangles), in box the
box itself (10). The fragment traces the view ray from the cage inward, by relaxed sphere tracing on the heightfield,
so **the silhouette comes from the map, not the cage.** A round tower is round on an octagonal cage. A heightfield holds
one surface per `(θ, y)`: the top of a disc, the inside of an arch and anything behind something else are not in it.
Section 8 says which buildings that hurts. A hull map from above bounds it (a roof is a real surface), and a map from below colours a soffit: a tower is hollow, so that one cannot be a bound.

Colour, normal, depth, roughness, metal and a window mask are baked at load. **Interior mapping** puts a room behind every
window mask texel; the hero's glass uses the same shader chunk, so the two read alike at the switch. Lighting is the same
`MeshStandardMaterial`, patched, so a shell cannot drift from the hero's colour under a changed sun.

## 4. The sixteen

Heights to the roof, then to the tip. "Cage" is the planned shell. Each building's record names `tris` (hero budget). The
**ruin states** are the seven of the brief: intact, gutted, crown gone, broken mid-height, stump, steel skeleton, fallen.
Each row says how this one differs; the default is below the table.

**Default ruin.** *Gutted:* glass gone, cyan dead, a share of bays burnt out, panels stained. *Crown gone:* cut at the top
hoop. *Broken:* cut at a hoop two-thirds up, torn edge, a rubble `KSTACKS` mound at the foot. *Stump:* cut at the first
plant floor, core standing higher. *Skeleton:* skin off above the stump, instanced beams on the storey grid. *Fallen:* a
`KSTACKS` mound along the direction of fall, with sections of the shaft lying in it. Built for both towers 2026-11-03 (`README.md`, "The ruins"): the rubble and what stands free of the axis are their own instanced object, not the shell's.

### Skyscrapers

| # | Key, name | Language | Height, storeys, footprint | Massing | Cage | Hero budget |
|---|---|---|---|---|---|---|
| S1 | `spindle`, the Spindle | 1 white city | 234 / 262 m, 62, r 46 m skirt | a concave rocket on a flared skirt, three root fins to a third of its height, a disc lamp and a needle | polar, 8 x 3 | 80k **built** |
| S2 | `organ`, the Organ (the Gantry until 2026-11-03: the owner tossed its ribbed slab as dull) | 7 bronze | 228 / 240 m, 60, 96 x 34 m | five bronze pipes of different heights in a shallow arc, each its own storeys and a conical cap with a dark mouth, bound by four bronze bands; a lobby at each pipe's foot (its transit tube dropped until a tube network joins buildings) | polar per pipe (5 x 8 x 3), or box, stacked | 90k |
| S3 | `wedge`, the Wedge | 2 black wedge | 188 m, 48, 64 x 56 m | a four-sided black glass frustum leaning in, one face steeper; a slot of sky lobby two-thirds up | polar 4 x 2: a frustum is its own cage, 18 tris | 45k |
| S4 | `yoke`, the Yoke | 3 pastel organic | 172 / 196 m, 44 | two bulbous swollen legs joined over a 60 m through-arch, the upper body one mass with a needle | **two** polar parts plus a bridge box; the arch is the test | 75k |
| S5 | `reed`, the Reed | 6 twisted slab | 204 m, 54, 58 x 24 m | a faceted slab turning 50 degrees over its height and widening to the top; the facets catch the sun differently on each face | polar 8 x 4: twist is star-shaped | 60k |
| S6 | `telescope`, the Telescope | 4 adobe tiers | 176 / 188 m, 44, 62 m octagon | five telescoping octagonal stages of sand ceramic, each with small dark openings, a ribbed onion cap | polar 8 x 5 | 55k |
| S7 | `stalk`, the Stalk | 3, 6 saucers on a needle | 150 / 236 m, 38 in two discs | a 16 m wide stalk carrying two saucers (r 34 m at 104 m, r 24 m at 150 m); the thinnest thing here, the impostor test | polar 8 x 5, the saucers' soffits lost | 50k |
| S8 | `swell`, the Swell | 5 pale baroque | 200 m, 50, 80 m lobed | four swollen scrolled lobes round a core, cantilevered balconies at every third storey, a rust-red carved ledge | polar 12 x 4; ornament past the map's reach is the test | 110k, the top of the range |

Uses (S1 is worked in full in section 5):

- **S2** government and offices: council chamber in the stepped crown, ministries, records in the blank mid-band, transit hall in the waist.
- **S3** corporate offices with a plant slot, a data vault in the blind north face. Almost no openable windows: the Ancients at their most alienating.
- **S4** mixed: the arch is a concourse with a market, one leg apartments, the other a hospital; school in the bridge.
- **S5** offices below, apartments above where the twist makes each floor plate a little different; a garden in each widening top storey.
- **S6** a stacked town: a market, clinics and flats in each stage, a shrine-like hall under the cap; hydroponics in stage 3.
- **S7** a stalk of lifts and stairs only; the saucers hold a restaurant and observatory (upper) and a hotel ring (lower).
- **S8** luxury flats, wide balconies, a school and clinic in the base; the most flats-per-room-kind of the set.

Ruin notes: **S2** the crown slumps as one stepped shell, bronze looted; **S3** its glass falls in sheets, leaving a dark
steel frustum, the best skeleton; **S4** the bridge falls first and the legs stand apart; **S5** breaks at a facet line, the
top half leaning on the neighbour; **S6** loses its stages from the top, each roof a ledge, the slowest to die; **S7** the
saucers tilt or drop, the stalk stands, and a stump is rare; **S8** lobes peel off one at a time.

### Midrises

| # | Key, name | Language | Height, storeys, footprint | Massing | Cage | Hero budget |
|---|---|---|---|---|---|---|
| M1 | `ledger`, the Ledger | 6 plaza, 7 flare | 50 / 58 m, 12, 126 x 24 m | a long civic slab on a great concrete arcade, bronze flared buttresses, blind relief end walls, a stepped metal roof hall | box, 10 tris | 45k **built** |
| M2 | `terrace`, the Terrace | 1, 2 ring tiers | 42 m, 10, r 64 m | five stacked terraced rings with planted decks round an open court and a roof park | polar 12 x 4, the court lost: a second cage inside | 40k |
| M3 | `cupola`, the Cupola | 1, 6 domes | 44 m, one hall + 4, r 52 m | a dome on a banded drum: a transit hall under a scalloped dome | polar 8 x 3 | 30k |
| M4 | `crescent`, the Long Curve | 1 curved slab | 36 m, 9, 180 m arc | a long curved slab with window ribbons, one end stepping down | **not star-shaped from any axis in it:** polar from the arc's centre, an annular sector, or box segments. A test | 40k |
| M5 | `terrarium`, the Terrarium | 2 sphere | 66 m, 8, r 30 m | a sphere on four splayed legs under a glass dome holding a forest | polar 8 x 4 for the sphere; legs are instanced real geometry at every range | 40k |
| M6 | `arcades`, the Arcades | 6 concrete | 26 m, 4, 84 x 52 m | great concrete arches round a court with a reflecting pool; relief walls | box; the arches' sky behind is the coverage test | 30k |
| M7 | `pods`, the Pods | 3 sky-bridges | 48 m, 6, two r 22 m pods | two round pods on stalks joined by a tube, a third low dome | two polar parts, the tube real geometry | 30k |
| M8 | `spiral`, the Spiral (the Sand Block until 2026-11-03: tossed as dull) | 4 adobe | 30 / 38 m, ramp of 5 turns, r 30 m | an adobe cone wound by an outside ramp from beside its gate to a drum and dome; a bronze-doored portal into the cone every half turn | polar 8 x 3; the ramp's overhang is the test | 30k |

Uses: **M1** below. **M2** flats round a court, a school at the bottom, a roof park. **M3** a transit hall and concourse on
the ground, offices in the drum. **M4** apartments with a clinic in the low end. **M5** a hydroponic forest (the
sphere's top half), research labs under it, a lobby at the root of each leg. **M6** a school and a clinic round a court.
**M7** a clinic in one pod, labs in the other, a canteen in the dome. **M8** a market hall with flats above.

Ruin notes: **M1** its span falls in the middle, two wings left; **M2** rings crack radially; **M3** the dome caves in, the
drum stands; **M4** falls in sections along the arc; **M5** a leg fails and the sphere rolls, the Valley's best set-piece;
**M6** the arches outlast everything; **M7** the tube falls; **M8** melts back into a mound.

## 5. The two built first

These were chosen as the hardest useful shapes: a curved tower with non-round parts (polar), and a long slab with deep
relief (box).

### S1, the Spindle: floors, uses and windows

Round plan. Skirt r 46 m at the ground to 30 m at 21.6 m; the shaft a concave curve to r 15 m at 201 m, then the lamp.

| Storeys | Use | Plan | Facade |
|---|---|---|---|
| 0-1 | **Lobby, transit concourse** (double height, 7.2 m) | ring concourse round the core, reception, four portals | four portals, arcade |
| 2-3 | **Market, clinic** (5.4 m) | stalls ring, clinic rooms | wide glazing, market; punched, clinic |
| 4 | **Plant**, bronze hoop | hall | louvres |
| 5-16 | **Apartments A**, large | ring corridor, flats (hall, kitchen, living, bedrooms, bath) | a ribbon broken by a pier at each party wall |
| 17 | **School** | classrooms round the ring | tall glazing |
| 18 | **Plant**, hoop | hall | louvres |
| 19-28 | **Offices** | open plate, meeting rooms on the ring | continuous ribbon |
| 29 | **Sky lobby** (5.4 m) | concourse, where the lifts change | tall glazing, cyan strip |
| 30-33 | **Hydroponics** | beds round the core | **blank**: the first long vault |
| 34 | **Plant**, hoop | hall | louvres |
| 35-46 | **Apartments B**, small | ring corridor, flats (studio, one bed) | ribbon, more piers |
| 47-50 | **Records** | stacks round the core | **blank**: the second vault |
| 51 | **Plant**, hoop | hall | louvres |
| 52-55 | **Apartments C**, three flats | as B | ribbon |
| 56-59 | **Tanks and lift motor rooms** | sealed | blank, the neck |
| 60 | **Lamp: observation** | ring | full glazing |
| 61 | **Lamp: roof park** under a low dome | hall | glazed dome |

The core stands in the middle, r 6.5 m to the sky lobby, r 5.2 m above it: two stairs (north, south) and two lift banks (east,
west). The low bank ends at the sky lobby; the high bank expresses to it and carries on. Stairs run the whole height.

**Windows follow rooms:** the facade is computed from the plan. Each storey's rooms give each bay a kind (living glazing,
bedroom, a pier at a party wall, a bathroom's slit). Floors with equal plans share one bay list.

### M1, the Ledger: floors, uses and windows

Slab, long axis x, 126 x 24 m, a lift core at each third of its length (two), a fire stair at each end (two).

| Storeys | Use | Plan | Facade |
|---|---|---|---|
| 0-1 | **Arcade, transit hall, lobby** (7.2 m) | arcade on the long sides, hall, reception, cores | concrete arches |
| 2-3 | **Market, clinic** | bar plate | wide; punched |
| 4 | **Plant**, hoop | | louvres |
| 5-7 | **Offices**, open plate with meeting rooms | | ribbon |
| 8-9 | **Records** | stacks and reading rooms | blank on the south, slit on the north |
| 10 | **Government**, ministries, corridor plan | | punched, paired |
| 11 | **Government**, the council chamber, across the centre (double height), committee rooms either side | hall plates | tall lights under the roof |
| roof | **Roof hall**, stepped metal | | |

The end walls are blind and carry the Ancients' relief panels (`concrete.block.relief.*`): the fire stairs are behind them.

## 6. Interiors

On `kits/interiors` and `kits/ancients-interiors`, audited the same way:

- `MP.storey(family, level)` makes one storey as an `AI` STOREY: `{rooms, walls, outline}`. It takes `AI.ringPlate`,
  `AI.barPlate`, `AI.gridPlate` and `AI.hallPlate` where they fit, and adds **flats**: `MP.flatSector` cuts one ring sector
  into hall, kitchen, living, bedroom and bath, each a room with its door and windows.
- The core is one record, `core`, cut out of every plate at the same place. `MP.audit` checks that shafts line up from
  floor to floor and that the facade's bay kinds match the rooms behind them.
- Only near towers can be entered. A plan is a pure function of `(family, level)`: nothing is made until the storey is asked for, and
  it costs nothing out of range. `MP.liveStoreys` holds at most three (the player's and the two either side).

## 7. Materials

From the library: `metal.ancient.white.macro` (the towers' white skin, 16 m panel courses), `concrete.board`, `concrete.block.relief`,
`metal.bronze`, `concrete.slab`. Delivered 2026-11-02 for the later buildings: `stone.adobe.ceramic` (S6, M8) and
`patterns/ancient/baroque-scroll` (S8). Nothing is owed.

## 8. Tier strategy for the sixteen: what each needs

| Range | Drawn | Note |
|---|---|---|
| Under 300 m | hero | a pool of about ten, by distance |
| 300 m - 1 km | shell | one instanced mesh per family and state |
| 1 - 3 km | impostor | one `BIO.impostorSet`: slots for families x states; seen from over 35 degrees above, a shell to 3.2 km instead |
| Over 3 km | district | a `KFAR` extension: not in this spike |

**Expected weak spots of a heightfield**, to be tested by the eight skyscrapers:

- S4 Yoke's arch, M2's court, M6's sky through arches: a surface behind a surface. Needs two parts or real geometry.
- S7's and S1's disc soffits and roofs: seen from under or over, they show the rim's colour. Ground-level play forgives the
  roof; a flying camera will not.
- M5's legs and S2's finials: thin parts at the edge of what a map resolves. Real instanced geometry at every range.
- M4's crescent: an arc is not star-shaped about any point within it.

## 9. Results of the spike

*Written by the spike: see `README.md`, "What the spike found".*

## 10. Order

1. Sixteen designs (this file).
2. S1 and M1 in full: hero, interiors, a `KSHELL` prototype, an impostor.
3. **The spike:** side-by-side at 300 m, the switch, numbers on the Arc 140T. **Stop for the owner's eye.**
4. After the go: the other fourteen, `KSHELL` as `core/shell` with a node test, the impostor set, the ruin states, a test-bed
   page with a few hundred towers, measured from the worst street.
