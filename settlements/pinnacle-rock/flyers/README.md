# Pinnacle Rock: the flyers

Girder's flying beasts (quetzalcoatlus, giant bat, giant archaeopteryx, giant dragonfly, and the riders) on Pinnacle
Rock's roosts. Girder's code is **read in place**, not copied: `build.py` (`flyers_fragment`) seals it in one closure,
`PRFLY`, with the files here, which stand in for the parts of it that are Girder's towers.

| In the closure, in order | From | What |
|---|---|---|
| `10-shim.js` | here | the helpers Girder's core and kit give the flyers (clamp, mix, wrapPi, segDist, shade, a night-lit material without Girder's glow); the setup's draws on `core/rand` (`KRAND.stream(840001)`) |
| `05-palette.js` | Girder | `PAL`: the beasts' and the riders' colours |
| `20-world.js` | here | Girder's record shapes made from this page's roost plan (`ROOST`, `43-pr-roosts.js`): `PLATS`, `ROOSTS`, `BRIDGES`, `bridgeY`; the dry gorge as Girder's brook (`riverAt`, `riverLevel`); `terrainH` raised by the forest's roof where the forest stands |
| `48-detail.js` | Girder | the detail atlas (the `fly_*` maps, packed from Girder's `tex/` by `build.py`) |
| `84-flyers.js` | Girder | the models, the skeleton, `FLY_SPEC` (it opens the closure Girder's `84d` closes) |
| `30-routes.js` | here | in place of `84a`'s obstacles and roost bays: `flyHit` against the rock (KSTACKS), the decks and stalls, the lifts, the bridges and the trees on the rock; `flyLineHit`; one `outer` bay per stall; `flyBayClear` |
| `84a`, three sections | Girder | lifted by their markers: paths; `flyCurveHit` and `flyCurveTight`; the arrival and departure builders, `flyRoute`, the meshes |
| `84b-flyers-animals.js` | Girder | the animals, transients, arrivals, departures, circuits joined and left, the state machine |
| `84c`, before "initial population" | Girder | the pose, the riders, the circuits' makers |
| `40-start.js` | here | each Wing's beasts in its own stalls (`B.allow`; Girder's `flyFreeBays` and `flySpawnArrival` wrapped so arrivals and peel-offs keep to it); in place of `84c`'s initial population: every bay proved (a clean approach and way out), beasts perched in their own Wing's bays, the circuits this rock wants (the rim, over the Garden, the gorge run, the canopy and high patrols, the bats' night hunt), the sorties (the Inner Wall, the gas giant) |
| `84c`, from "scheduler" | Girder | the scheduler and the frame update |
| `90-out.js` | here | `PRFLY`: `update(dt, hour)` (the host's hour ticks), `sim(seconds, hour)`, `land(deckId, species)`, `stats()`; the inspector's labels |

Girder's `84d` (its hooks, audits and path views) is not taken: its audits are the towers'. The page's check
(`99-host-take.js`, `HCHK.flyers`) sends a quetzal to each east fin, runs 90 s of traffic, and asks that one lands on a
perch and that no beast aloft is in the rock.

**A change to Girder's flyers reaches this page.** After editing `settlements/girder/src/84*.js`, rebuild both pages and
run both verifies. The markers `build.py` lifts by are the section comments of `84a` and `84c`; it stops with the
marker's name if one goes missing.
