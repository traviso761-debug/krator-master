# Basilisk — the Lizardmen's stone capital at the eastern sea

Basilisk (`slrodrkrls`, agreed sabkha pin `5.1 px 766.6,1597.25`, `-2,600 m`, `2.21 atm`, `XA` hypertropic jungle shore) is the
`30,000`-resident stone capital of the Lizardmen where the West and East loops of the Coil meet (`PLAN.md`, `BLUEPRINT.md`).

## Build & verify

```bash
python3 tools/build.py settlements/basilisk
node settlements/basilisk/test-bs-records.js
KRATOR_GL=gpu python3 settlements/basilisk/verify.py settlements/basilisk/dist/basilisk.html --assert --all-views
```

## Layout & architecture

- **Platforms over the sabkha:** Seven tightly packed district spirals (`d1`–`d7`) and the Gate Quarter tongue (`gq`) stand on a
  compact `~180 ha` `+5 m` kiln-brick platform (`-2,595 m`) enclosed by battered cyclopean basalt wall (`+13 m` walk over the
  sabkha) with 13 twisted watchtowers, the South Gate (`lk-gate`), and the `1.4 m` Tender Ley Slot (`lk-slot`), housing `32,605`
  across `2,325` placed stone courtyard blocks (`lk-insula`, `lk-caravanserai`), warrens, halls and works.
- **The Mound of Intention (`+12 m`):** Polygonal-basalt citadel carrying `lk-greathall`, the Court of Intention (7 obelisks +
  `lz-ley` on the `50.6°` ley line to `reliquary-east`), `lk-college` + 21 `lk-tower`s, the Nest of Returns (`lk-nest`), and 9
  Tender `lk-warren`s.
- **Bay works, Ley Mole & scaled-back salt strand:** `175 x 36 m` Lothal dock basin (`2 x lk-dockstore`, 7 `lz-barge` reed vessels
  tagged `cls: 'vessel'`, 5 `lz-weir`s), `2 x lk-bronzehall` (smelting Tuatara's `98 t` copper with Komodo & Iguana tin), `700 m`
  basalt ley mole, and NW salt strand (`3 x gl-pans`, `3 x lk-boil`, `2 x gl-saltstore`: `85 t/yr`).
- **Dholavira water:** Cyclopean check weir on Tlahn Gill (`r762`) feeding a `2.1 km` leat and 7 cascading reservoirs outside the
  south wall, plus the Great Tank of the First Turn (`gl-tank`), court `lz-cistern`s, and `143+` `gl-well`s.
