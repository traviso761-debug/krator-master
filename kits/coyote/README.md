# kits/coyote: the Coyote kit

The settlement and culture kit of the Coyote Men: the four tribes of the Outlands (Valley, Peak, Sunrise, Sunset) and the
Kingdom of the Tiers (the Tierhounds). Catalog and `core/tags` culture `coyote` (registered at the next all-builds rebuild:
`TODO.md`). **Read `PLAN.md` first**: the look (section 2: the Valley after Catalhoyuk, the Peak's alcoves, the herders'
tipis, the Tierhounds' Masuleh terraces with ancient Indo-European touches, the Gate after Hattusa and Derbent), the core
adoption (section 4), the pending records it resolves (section 5) and the phases (section 9).

## Build and verify

```
python3 tools/build.py kits/coyote                       # dist/coyote.html (+ dist/coyote.tex.*.js, the library pack beside it)
python3 kits/coyote/verify.py kits/coyote/dist/coyote.html --assert       # KRATOR_GL=gpu for a GPU lane
node kits/coyote/tests/test-contour.js                   # the contour script
python3 tools/textures/pack.py kits/coyote               # after a change to materials.json
```

The page loads its texture pack beside it: serve `dist/` over HTTP, as `verify.py` does.

## How it is made

- **The engine** is `core/engine`, read by path (`engine.py`): `defBuilding`, the buckets by material key, doors and glass
  (`36o-open.js`), ladders (`36s-stair.js`), the walk records. `build.py` started from `kits/tents/build.py` with the
  new-build template's top lines (`tools/new_build/`).
- **`src/26k-kit.js`**: the kit's identity, its library families, the palette, `CY` (the stature: human, the owner
  2026-11-16; doors 2.0 m clear for the ears; the ladders' lean) and `CY_TRIBES` (each tribe's Hum name and gloss: a
  record carries its tribe as `tags.style`).
- **`src/32-cy-contour.js`** (`[G data]`): `cyContour(text)`, the contour script. A Hum text becomes a line that rises and
  falls by its syllables' tones (the onset sets the pitch, a snap consonant cuts a spike, the vowel's mark is the tone, a
  sentence ends in the howl). The same text always gives the same line; `tests/test-contour.js` holds it.
- **`src/40-cy-kit.js`**: the toolkit: `cyWall` (a socle, the brick body in its render, the plaster inside, openings that
  may overlap), `cyRing`, `cyRoof` (beams, reed mat, the earth slab with its hatch), `cyLadder`, the **ear door**
  (`cyEarHoles`, `cyEarDoor`: a doorway whose head steps up in two notches), the hearth, oven, platforms and bins, and
  `cyCarve` (the contour line raised on a face, one row or a word a row).
- **`src/50-cy-valley.js`**: the Valley's Catalhoyuk room (`cy_room`: entered through the roof, the ladder beside the hearth
  and oven, platforms north and east, bins west) and the poor house (`cy_house_poor`: the room and a side store whose ground
  door is the ear door, the tribe's Hum name carved beside it).
- **`src/60-cy-stones.js`**: the milestone (`cy_milestone`), carved on both faces with its record's text.
- **`src/99-host-tz-cy.js`**: the probe's fields for `verify.py` (carvings, doors, the walk-reach audit, the fingerprint).
- **Textures** from the library through `materials.json` and `tex/`; the brick is a stand-in until `brick.mud.coursed`
  arrives (`KNOWN_ISSUES.md`; `core/materials/PROMPTS-NEEDED.md` section 53).

## Status

**C1** (the scaffold, the toolkit, the contour script, two Valley houses and the milestone): built and verified
(`verify.py --assert`). C2 onward: `PLAN.md` section 9.
