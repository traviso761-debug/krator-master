# Brief: WEALTHY COMPOUNDS + THE EMIR'S PALACE   (agent "rich")
Read `_common.md` (same folder) first.

## You own
`src/58-rich.js` (open with `reseed(580001);`, one IIFE). family: `'rich'`.

## Goal (the user's words)
"Wealthy, central areas have Gaudi inspiration but are also inspired by Burmecia and traditional Sahelian architecture and
have extensive mosaics, low-relief ornamentation and painted patterns. Aside from mosaics, ornament takes the form of arches
and cloisters, the organic curves of the structures themselves, and in some cases, the use of wooden posts like in Timbuktu."
"Many wealthy buildings — compounds for the prominent families — are intermixed [with the Ancient buildings inside the
wall]." The city "is ruled by an Emir and is in practice an oligarchy; ... the prominent families choose a new one."

Look at: refimg/13-hotel-attraction-entrance.jpg (Gaudi: melting parabolic portals, trencadis), 11-burmecia-street.webp
+ 12-burmecia-gate.webp + 10-burmecia-hall.jpg (blue-grey, tall arched windows, balconies, blue tile inlay, bulbous
turrets), 02-hausa-palaces.jpg (polychrome relief facades, horn pinnacles, crenellated gate towers),
01-tiebele-painted-towers.jpg (painted drums with low curved forecourt walls), 16-afrobldg-terraced-painted-earth.jpg.

## Assets to deliver
1. **Family compound — Gaudi/Sahel** (about 30 x 26, 2-3 storeys, <= 1500 tris): a walled compound: gatehouse with a
   parabolic portal, a main house with undulating parapet, chimneys like Casa Mila warriors (small lathes with mosaic
   caps), a cloistered court (F.arcade), one blunt tower (F.tower) with a mosaic cap, garden trees. 4 variants that differ
   in massing (tower position, number of wings, round vs. rectangular main house) AND dominant treatment:
   (a) trencadis mosaic blue, (b) paintcol Hausa polychrome facade, (c) paintbw Tiebele painting on ochre drums,
   (d) Burmecia: blue-grey wash, tall parabolic windows, balconies, blue tile bands.
2. **Merchant prince's house** (20 x 16, 3 storeys): a single rich town palace on a street front: giant order of
   parabolic arches at street level (loggia), piano nobile with balconies, a roof pavilion; toron posts in rows on the side
   walls. 3 variants.
3. **Painted terrace apartments** ('afrobldg', 34 x 22, 4 stepped storeys, <= 3000 tris): organic earth terraces, each level set back,
   fat rounded parabolic arches carrying the terraces, a circular window or two, planted terraces (leafy blobs), the whole
   thing banded in painted pattern (paintbw / paintcol strips alternating with adobeRed). 2 variants.
4. **Emir's Palace** — THE landmark of the inner city (70 x 56, <= 8000 tris): Hausa-palace facade translated into
   Gaudi: a great gate block with a tall parabolic portal and polychrome relief (paintcol) front, flanked by two blunt
   fluted towers; an audience hall with a big shallow dome (lathe) in mosaic; two courts with cloisters; a private wing
   with balconies; horn pinnacles along every parapet; a walled garden with cypress (CYPRESS(F.p(..)) helper). Brass
   finials. Lanterns at the gate. Must read as a palace from 300 m and hold up at the gate.
5. **Oligarch's tower-house** (14 x 14, 5-6 storeys ~ 24 m): a tall slim organic tower residence — the families compete in
   height — battered, fluted, with a projecting look-out gallery near the top and a mosaic crown. 3 variants.
Windows: use F.window so they light at night. Give every compound a lantern or two at its gate.
