# kits/ash-nomads: the Ash Nomads kit

The beetle riders of the ash plains round the great volcano (catalog and core/tags culture `ashnomad`, new on 2026-10-07):
cousins of the Chichani and of the Zeijani of Dhelv, who took to wandering after the calamity the Zeijani hid from. Split from
the Scyvoi kit on 2026-10-07 to the owner's style guide (the `ashnomad` reference folder):

- **Outside:** peaked tents of every kind, black to grey, with ORNATE yellow and red patterns: a cross of Nazca line figures
  (the hummingbird, the spiral, the beetle) and Morrowind Dunmer key-frets. Concave spires, petal-lobed great tents, Ashlander
  hide domes, ridge tents, a petal-skirted bell tent, a lean-to against the ash wind.
- **Inside:** the yellow-red palette; chitin furniture and vessels, hanging banners, paper and chitin lanterns, ash screens at
  the doors (the catalog's `ashnomad_*` pieces).
- **The chieftain's tent** takes the massing of the "nomad chief" reference: a tall central spire, four spired lobes round it
  over arched gables. **The assembly** ("nomad assembly"): the band's communal tent and mess hall, a great round tent with a
  pedimented porch and the sun disc raised over it between red banners, banner poles round it; long tables, cookpots and the
  council's fire inside.
- **Beasts:** staghorn beetles to ride, to fight from and to pack (the fauna kit's, also Dhelv's); millipedes herded for their
  chitin and grubs; the ash runner, a pig-sized six-legged runner kept for hides, eggs and meat. **No carts, no chariots, no
  vardo, no Baelu:** what the Scyvoi load on a cart goes on a beetle's back or a millipede's.

```
cd kits/ash-nomads && python3 build.py                      # dist/ash-nomads.html
python3 build.py --vendor-check                             # the engine against kits/scyvoi/src (must read OK)
python3 verify.py dist/ash-nomads.html --assert             # invariants (headless Chromium, about a minute)
python3 verify.py dist/ash-nomads.html --cut --views "Assembly and mess hall - inside (cut-away)"
python3 ../../tools/textures/pack.py kits/ash-nomads        # (from the repo root) after a change to materials.json
```

## What is in it

| Row | Defs | Class |
|---|---|---|
| Small tents | `tent-spire-small`, `tent-dome` (the Ashlander hide dome), `tent-ridge`, `tent-bell-spire` (petal skirt), `tent-lean-to` | building, dwelling-single |
| Large tents | `tent-spire-great`, `tent-star` (six lobes round a spire), `tent-twin-peak`, `tent-long-black` (a toothed valance, banners), `tent-great-dome` | building, dwelling-multi |
| Chieftain and assembly | `tent-chieftain` (civic + dwelling, rich: the carapace high seat on a dais, a ring of chitin columns), `tent-assembly` (civic + tavern: the mess hall and the council ring) | building |
| Shaman and trades | `hut-shaman` (from the Scyvoi kit: grey and black hides, red and yellow ribbons, beetle skulls), `tent-smithy`, `tent-chitinworker` (the hidemaker's counterpart: hides and millipede plates), `tent-supply` | building |
| Beetles and millipedes | `beetle-riding` (two variants on the sheet), `beetle-war`, `beetle-pack`, `millipede-pack` (the band's tents on chitin frames: the counterpart of the Scyvoi ger cart) | life |
| Herds and tethering | `millipede-corral` (a ring of cast millipede rings stood on end), `runner-pen` (stakes and painted screens, an egg basket), `millipede`, `runner`, `runner-young`, `tether-post`, `beetle-line` | feature, life, furniture |

## How it is made

Forked from `kits/scyvoi`: the engine fragments are the Scyvoi kit's, VENDORED unchanged (`build.py --vendor-check`); the kit's
identity and look are `src/26k-kit.js`. Its shapes are in `40a-ak-ash.js` (the concave spire, the five-spired chief, the dome,
the ridge, the bands of figures, banners, the sun disc), the defs in `42`-`59`.

**Textures and patterns.** Until the owner's sheets come (`core/materials/PROMPTS-nomads.md`: the ash cloth, the fret band,
the Nazca panel, the ember lining, the sun medallion, an ash ground) the patterns are procedural: the frets and figures round
the walls are thin sewn-on geometry, the roofs' bands vertex colour with the sawtooth as geometry, the ash cloth is tinted felt,
the lining the star kilim, the sun disc the amber sun. Chitin is the library's `organic.chitin` and `chitin.millipede`.

See `API.md` for the fragments and `KNOWN_ISSUES.md` for what is open.
