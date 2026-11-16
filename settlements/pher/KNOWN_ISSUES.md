# settlements/pher: known issues

- **The town stands in the world as ground only.** Step P7: `openworld/xanadu-north-shore` takes the page's ground inside
  its footprint (R 3.9 km; `core/world/bake_towns.py pher`), its lake and its stream; the town's buildings are not drawn
  there yet (a town tile: `drawn: false`, as Voth's).
- **The Swīṭ Siṭrīm is not joined to the model's stream.** In the world the town's stream runs down its ravine at its own
  height (`core/world` 41t `over`) from a spring above the upper town; the model's `r_pher_swit` ends at the band, about
  45 m under the rim plain, so it cannot run in (PLAN.md question 17).
- **The heir's palace is the Grand Vizier's design.** The kit's hollow citadel palace (`xa_cit_vizier`, walk-in with
  `?interiors=1`) stands for the heir's seat. A palace of the heir's own is a later commission. The kit's plain palace
  (`xa_palace`) is solid inside, so it was not used.
- **The opt-in pieces.** The caravanserai, the lake craft and the caravanserai's rooms live in `kits/xanadu/extra/` until
  the kit's next all-builds rebuild (TODO.md, "Ride along"); only this page takes them.
- **The boats run on loops, not the timetable.** The runs go round their loops at 12 km/h from a phase each; the fair's
  launches run only on the fair's days (P6), but lake.cross's launch every two hours and the rounds' calls are not
  followed. Out of the page's ground (4.5 km) the boats are hidden.
- **The fair's days** (P6): the page's day (`?day=N`, else day 122, a fair day) picks the weekday; on the fair's days
  (`PH.FAIR.days`, the tune's proposed 3 and 6: question 16) the fair's stalls and launches are out; the daily market's two
  rows stand every day. No crowds are drawn beyond the stalls' own keepers.
- **No interiors in the caravanserai's gate and towers.** Its five ranges have rooms (`xanadu-extra`); the gate block and
  the corner towers stay solid.
- **Interiors: floors the walk cannot reach** (before the entry flights; the count after them: README.md). With `?interiors=1` the audit plans 1,156 buildings, 31,865 floors, and
  finds 3,527 floors unreached in 669 buildings (the shop rows' and workshops' ground floors, the shacks' entries). The
  likely cause is the slope: core/city's 'high' stance puts a house's floor at its plot's highest corner, so on the wall
  (7 degrees) a door can stand above the street with no flight up to it. The Xanadu sheet, on flat ground, keeps 43. A fix:
  the frontage-courts strategy taking the 'door' stance (the floor at the street's level at the door, its back cut into the
  slope) or an entry flight drawn at every raised door. The audit reports; it does not fail.
- **The stair avenue's grade.** Lower Phēr's stair avenue climbs straight up the wall (about 12 %): a stepped street for
  people and pack animals. The carts take the switchbacks.
