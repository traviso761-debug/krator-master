# Brief: MIDDLE-CLASS HOUSES + TRADE   (agent "mid")
Read `_common.md` (same folder) first.

## You own
`src/56-mid.js` (open with `reseed(560001);`, one IIFE). families: `'mid'` (dwellings), `'trade'` (shops, taverns,
workshops, caravanserai, market), `'prop'` (small street things). `src/55-mid-example.js` already defines
`mid_washed_house` — do not redefine that key; build the rest of the family round it.

## Goal (the user's words)
The district at 6:30-10 o'clock is "relatively prosperous ... with many middle class houses, and a few shops, taverns, and
workshops, as well as a handful of poorer buildings." The market district has "more wealthy compounds, many shops, taverns
and workshops, and a caravanserai for nomads coming from the deserts", and "a large, circular open air market". "In less
wealthy areas, the general forms [of the rich Gaudi/Burmecia/Sahelian city] are often preserved but paint and mosaics become
much more sparse — low-relief and simple whitewashing or light or dark blue-washing tends to predominate."

Look at: refimg/08-djenne-great-mosque.webp, 09-sankore-pyramid-minaret.jpg, 07-ghardaia-stacked-castle.jpg,
02-hausa-palaces.jpg, 11-burmecia-street.webp, 01-tiebele-painted-towers.jpg. (Also imagine the white Larabanga mosque:
white, conical buttresses, black base, triangular vents — that is what the example asset does.)

## Assets to deliver
DWELLINGS (family 'mid'; 8-13 m footprints, 1-3 storeys; <= 350 tris each, 450 for the largest)
1. **Blue-wash townhouse**: 2-3 storeys, rounded corners (corner cylinders), parabolic door in a low-relief surround
   (family 'relief'), small deep windows, a projecting timber balcony/mashrabiya box on the first floor, roof terrace
   with a parapet and a stair bulkhead. Variants: light blue, indigo, white with blue trim, ochre adobe with white trim.
2. **Djenne-front house**: the Sudano-Sahelian town house: symmetrical facade with engaged buttress-pilasters, a raised
   central "potige" panel with pinnacles above the door, toron rows, battered walls. 3 variants.
3. **Stacked-cube house** (Ghardaia/M'zab): 2-3 offset cubic volumes stepping back, arcaded top-floor loggia
   (F.arcade), chimney-like corner horns, whitewash/pale ochre. 3 variants.
4. **Round-tower house**: a fat 2-storey drum with a shallow dome or a roof terrace, plus a lower rectangular wing; a
   band of low relief or (wealth > 0.55) a paintbw band under the parapet. 3 variants.
5. **Courtyard house**: a closed square with a small open court, one corner tower room. 12 x 12. 2 variants.
TRADE (family 'trade')
6. **Shop-house**: shop below (wide parabolic shopfront, striped cloth awning on poles, counter, goods crates/jars) and
   dwelling above. 4 variants (potter, cloth seller, grocer, tool-and-relic dealer with a bit of Ancient metal on display).
7. **Tavern**: bigger (14 x 12), arcaded front porch, a walled yard with a shade tree (CYPRESS/OLIVE helper or a
   leafy blob on a trunk), hanging sign, several lanterns, smoking kitchen chimney. 2 variants.
8. **Workshops**, each unmistakable: **Potter's yard** (beehive kiln — lathe — with a fire F.lamp, racks of pots),
   **Smithy** (open-fronted forge under a heavy roof, chimney, glow), **Dyer's yard** (round dye vats in blue/red/yellow —
   mosaic or plaster tinted — with cloth hung on lines; family 'cloth'), **Weaver/carpenter shed**. 12-16 m footprints.
9. **Caravanserai** — a LANDMARK for the reserved site (w 96 x d 72 exactly; <= 8000 tris): a big rectangular walled inn,
   one monumental parabolic gate tower on the +z side, two tiers of arcaded galleries round a great court (F.arcade),
   stables along one side, a well/trough in the court, corner towers (F.tower), whitewash with a blue tile band, a few
   tents and pack-animal hitching rails in the court.
10. **Market stall** (3 x 3, prop): poles + striped awning + table of goods; 4 variants. **Market tent** (nomad, 5 x 5):
    low black/brown goat-hair tent on poles with guy ropes. **Market hall** (22 x 14): open arcaded hall under a tiled or
    vaulted roof.
11. **Public fountain / well-house** (prop, 5 x 5): mosaic basin under a little domed kiosk.
