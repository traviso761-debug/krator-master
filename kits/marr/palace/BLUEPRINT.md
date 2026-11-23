# The governor's palace of Marr (`Palas de Govarnar`): a blueprint

The programme, its reasons and the owner's answers to the forks are in `settlements/iziz/VASSAL-KITS.md`, section 3
(settled 2026-10-17: the governor's kin only, the council pavilion inside the palace, a guard pavilion with the
barracks outside, grounds about 70 x 56 m). The massing is the owner's `govpalace.jpg` (`refs/`); how Marr builds it
in Spanish Colonial / New Orleans / Barcelona Baroque style is in `../PLAN.md`, "The governor's palace in Marr's style".
All local names follow the Izani tongue (`lore/tongues-of-krator.html` & `tools/names/izani.py`).

    python3 settlements/iziz/palace/vassal_blueprint.py marr      # writes floors/*.png and FURNITURE.md here

| Sheet | Level |
|---|---|
| `floors/B.png` | the undercroft under the terrace: archive, Admiralty & Customs vault, stores, cells, the Canal Water-Gate (`Geta de Guadar` on `Knal de Gardonz`) |
| `floors/G.png` | the ground storey and the grounds: gate, forecourt, loggia, vestibule, audience hall, cabinet, chancery & admiralty excises (`Kostomz de Porta`), Hall of the Navigators' Guild & Merchants (`Ol de Navigadarz`), shrine, guard, dining, kitchen, service court, inhabited pleasure garden (`Korta de Plejar`) |
| `floors/U.png` | the upper storey: wrought-iron and stone galleries, petitions, records, the envoy's suite, the residence |
| `floors/L.png` | the roofs, the yellow-and-terracotta ribbed dome and the signal room in its lantern |
| `floors/section.png` | the section along the axis, heights x2 |

`FURNITURE.md` is the manifest from the same room data, on the Iziz court sets (the household is Izani) with
Marr's own pieces for the council pavilion (`Ol de Navigadarz`) and the tribute office (`Harbour Excise and Prize Office`); its NEW list is what the catalog lacks.

## The building

`mar_governor_palace` (`../src/74m-mar-palace.js`) is built on these sheets' frame: the building's x = -v and z = 1 - u, so
the gate faces +z and every pavilion, court and stair stands where the sheets put it. The rooms are drawn when the kit's
interior set comes (PLAN.md P6).

## Assumptions

- Storeys: ground 5.5 m, upper 4.5 m, terrace 1.2 m, undercroft 3.5 m; the drum to y 17, the dome to 24, the lantern
  to 27. The round pavilions are drawn as octagonal/round Baroque drums in the squares they stand in.
- Frame: u along the axis from the gate (u = -36) to the rear wall (u = 38); v across. Left and right in the notes
  are as seen walking in from the gate (v > 0 is left).
- The outside stair (on the chancery flank) climbs 5.5 m in three runs of at most 16 steps with landings
  (`SKILL.md` 5j) and wrought-iron scroll railings; its rectangle on the sheets is its footprint, not its run lengths.
- The rear garden (`R34`) and forecourt (`R2`) follow Marr's inhabited-courtyard rule (`mar_patio_pleasure` / `Korta de Plejar`): diamond checkerboard walks, a polychrome tile-lined reflecting pool, scalloped stone fountains, and citrus/palm planters.
