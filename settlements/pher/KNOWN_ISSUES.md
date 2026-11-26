# settlements/pher: known issues

- **The ground is the page's own.** A closed form of the survey's profile (`phH`), not the open world's ground. Placing
  the town in `openworld/xanadu-north-shore` (a town footprint on core/world, PLAN.md step P7) will need the two to meet.
- **The heir's palace is the Grand Vizier's design.** The kit's hollow citadel palace (`xa_cit_vizier`, walk-in with
  `?interiors=1`) stands for the heir's seat. A palace of the heir's own is a later commission. The kit's plain palace
  (`xa_palace`) is solid inside, so it was not used.
- **The opt-in pieces.** The caravanserai, the lake craft and the caravanserai's rooms live in `kits/xanadu/extra/` until
  the kit's next all-builds rebuild (TODO.md, "Ride along"); only this page takes them.
- **The boats move on the page's clock only.** The runs (the cross-lake run's six carriers, the two market rounds, the
  pilgrims' launch) go round their loops at 12 km/h from a phase each; the tune's schedule (lake.cross every two hours, the
  rounds' calls, the fair's days) is not followed yet (PLAN.md step P6). Out of the page's ground (4.5 km) the boats are
  hidden.
- **The fair's stalls stand every day.** About 110 stalls fill the fair ground (`xa_stall`); tying them to the fair's two days
  of the week, with the crowds and the launches coming in, is step P6.
- **No interiors in the caravanserai's gate and towers.** Its five ranges have rooms (`xanadu-extra`); the gate block and
  the corner towers stay solid.
- **Interiors: many floors the walk cannot reach.** With `?interiors=1` the audit plans 1,156 buildings, 31,865 floors, and
  finds 3,527 floors unreached in 669 buildings (the shop rows' and workshops' ground floors, the shacks' entries). The
  likely cause is the slope: core/city's 'high' stance puts a house's floor at its plot's highest corner, so on the wall
  (7 degrees) a door can stand above the street with no flight up to it. The Xanadu sheet, on flat ground, keeps 43. A fix:
  the frontage-courts strategy taking the 'door' stance (the floor at the street's level at the door, its back cut into the
  slope) or an entry flight drawn at every raised door. The audit reports; it does not fail.
- **The stair avenue's grade.** Lower Phēr's stair avenue climbs straight up the wall (about 12 %): a stepped street for
  people and pack animals. The carts take the switchbacks.
