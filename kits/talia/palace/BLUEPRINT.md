# The governor's palace of Talia: a blueprint

The programme, its reasons and the owner's answers to the forks are in `settlements/iziz/VASSAL-KITS.md`, section 3
(settled 2026-10-17: the governor's kin only, the council pavilion inside the palace, a guard pavilion with the
barracks outside, grounds about 70 x 56 m). The massing is the owner's `govpalace.jpg` (`refs/`); how Talia builds it
is in `../PLAN.md`, "The governor's palace in Talia's style".

    python3 settlements/iziz/palace/vassal_blueprint.py talia     # writes floors/*.png and FURNITURE.md here

| Sheet | Level |
|---|---|
| `floors/B.png` | the undercroft under the terrace: archive, vault, stores, cells, the hidden way |
| `floors/G.png` | the ground storey and the grounds: gate, forecourt, loggia, vestibule, audience hall, cabinet, chancery, council pavilion, shrine, guard, dining, kitchen, service court, garden |
| `floors/U.png` | the upper storey: galleries, petitions, records, the envoy's suite, the residence |
| `floors/L.png` | the roofs, the dome and the signal room in its lantern |
| `floors/section.png` | the section along the axis, heights x2 |

`FURNITURE.md` is the manifest from the same room data, on the Iziz court sets (the household is Izani) with
Talia's own pieces for the council pavilion and the tribute office; its NEW list is what the catalog lacks.

## Assumptions

- Storeys: ground 5.5 m, upper 4.5 m, terrace 1.2 m, undercroft 3.5 m; the drum to y 17, the dome to 24, the lantern
  to 27. The round pavilions are drawn as the squares they stand in.
- Frame: u along the axis from the gate (u = -36) to the rear wall (u = 38); v across. Left and right in the notes
  are as seen walking in from the gate (v > 0 is left).
- The outside stair (on the chancery flank) climbs 5.5 m in three runs of at most 16 steps with landings
  (`SKILL.md` 5j); its rectangle on the sheets is its footprint, not its run lengths.
- A few slivers of the terrace between rooms are unassigned (terrace walks); the planner fills or leaves them.
