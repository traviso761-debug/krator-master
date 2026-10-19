# Longsong — the plan

The brief (the owner, 2026-10-19): build Longsong in situ: find it on the scale map and pick a location nearby,
close to a river or stream, with a suitable hill to build on; the Oidong biome; the architecture a mix of Tibetan and
the Order's style of the chapterhouses, **with no Sahelian mud or rammed-earth construction**; the decor as if
Buddhist monks ran the SCP Foundation; in the forbidden lower depths many artifacts, among them **the
Procrastinator**, a gigantic prayer wheel with glowing glyphs that keeps several malign entities and objects sealed by
slowing their time to a virtual standstill (only the eldest monks know the full extent of what it protects them
from); the monks are known to speed and slow time; some practise a kung fu fast as lightning, and there are rumours
of more advanced techniques. `BLUEPRINT.md` (2026-10-15) remains the programme of rooms.

## 1. The site

**Where the model has Longsong.** The scale model (4.21) marks Longsong at px 957,1294 in the geographic region
'Oidong Valley' (px 725-1035 by 1234-1350, a 620 km trough running west-north-west), whose floor lies at 2,000-2,200 m
between walls rising to 5-5.5 km. Two streams run down it: the **Longsong stream** (*Lõsõ-bi Siṭrīm*, r105, the
model's name in Xanadui; 90 km, ~43 m³/s at its mouth, into the highland lake at 2,000 m 40 km west) along the foot of
the southern wall, and the *Solṭ Siṭrīm* (salt stream, r252) along the northern side; between them a medial swell
(~2,190 m). The marker sits on that swell, 8 km from either stream, on ground that rises 125 m over 8 km: no hill and
no water.

**The site chosen: px 954,1296** (world 0,0 of this page = region metres -2,000, 2,080). On the apron south of the
Longsong stream, 7 km west-south-west of the marker, where the stream runs straight east-west (z ≈ 1,790 m in the
region's frame for 3 km) and the land rises gently south (~3 %) to the valley wall 4 km off. Its virtues:

- **Water in front, mountain behind**: the stream passes 90 m north of the Great Gate (the bridge is the first
  threshold); the valley wall rises behind the rock, where the Vault digs in.
- **It faces the sun**: Krator's settlements lie near 40 S, so the sun is in the north. A north-facing White Palace is
  lit all day, as the Potala's south face is at Lhasa; the Oidong kit's light (sun at azimuth 305) shows it.
- **The hill**: the model's 4 km cells hold no hill here (nor anywhere on the valley floor), so the rock is authored
  finer than the cells, as Pinnacle Rock's gorge is: **Longsong's rock**, a granite knoll 320 by 210 m standing
  40 m over the ward (`LS.ROCK`): a level top for the palaces, a steep north face the Great Stair climbs, a cliff on the
  east (the hermits' cells), terraces on the west (the physic terraces), a slope south to the rear gardens.
- Nothing in the model's data argues against it: the climate (Cwb-like, ~1,035 mm of rain, a mean of 11 C at the
  marker) is the valley's; the apron is outside the stream's carved bed (the page checks no water inside the walls).

The model's marker is the owner's to move (to px 954,1296) or to keep as the valley's name tag: the page does not
write to the model's store.

## 2. Decisions taken (2026-10-19)

- **No earth.** The chapterhouses' Djenné vocabulary (banco, toron, laterite) does not come to Longsong: where they are
  earth, Longsong is granite and lime render. Kept from them: the parabolic gate between pylons, the paired drums,
  the drum hall under a tile cone with a lantern, round relief-ringed windows, the curved arcaded galleries, the
  blue-and-white string course, the Order's spire and bell (a granite spire, not a Sankore mud spire), the electric
  lamps, an earth palette's restraint with the Order's blue as the only strong colour (and its saffron in the cloth).
- **The massing is the Potala's**: the ward at the rock's north foot, the Great Stair zigzagging up a 40 m white base,
  the White Palace (four and five storeys) round the open Debate Court, the Great Assembly drum rising through it, the
  Red Palace (nine storeys) behind and over it with the gilded roofs, the Eastern Watch at its east end.
- **The SCP register in the Order's terms**: designation `LS-nnn`; the classes are the keepers' own words (STILL,
  SLOWED, HELD, UNWRITTEN); every containment carries a plaque (designation, class, name, procedure) in the Order's
  book hand with its evidence marks (seen, said, inferred); seal strips on every sealed door; the Order's sigil (a
  wheel of eight spokes round an hourglass) marks what is held.
- **The Procrastinator** is the deepest room: a drum-shaped hall 62 m under the ward and south of the Vault, reached
  only by the Long Stair. The wheel turns once in three minutes and is never stopped; the seals run at 1/10,000 of the
  keepers' time. Seven of the eight seals are on the register; the eighth is open and blank (the register says: do not
  inquire). Lore: LORE.md 6.15.
- **The kung fu and the rumours** are the life layer's: the operatives' drill at lightning speed with afterimages; the
  master of arms who steps through time (every 5-7 s he is elsewhere within 9 m) and slows the petals round him.

## 3. The order of work

| Stage | What | State |
|---|---|---|
| P0 | the site: the cut, the rock, the ward's terraces, the stream and bridge, the lotus pond, the Oidong kit on the model's land, the far land | done |
| P1 | the monastery's massing from the blueprint on the kit (gate, ward rows, stair, White and Red Palaces, drums, Watch, roofs, chortens, wheels, flags, lamps) | done |
| P2 | the Vault and the Procrastinator; the containment's dress | done |
| P3 | the life layer's scaffold: the people, their schedules, the drill, the master | done (placeholder figures) |
| P3b | the exterior revision toward the chapterhouses' neo-African forms, the new outbuildings (`ROOMS.md` sections 1-2; owner, 2026-10-19): the brick drums under terracotta cones and lanterns (the Assembly, the Hall of Hours, the Observatory, the Lower Gate's pair), the Debate Court's brick arcades with parabolic heads, the gate's pylons in glyph panels, the mosaic course everywhere, the red limewash, the Printing House as a small Archive, the Eastern Watch as the louvre tower, the Hall of Forms, the Chapterhouse Court, the mani wall, the chorten garden, the Garden of Held Water | done |
| P3c | the farms and gardens (`ROOMS.md` section 5; owner, 2026-10-19): the fields, terraces, pools, groves, orchards and beds as records on the Crops kit (`40b-ls-farms.js`), drawn with the library's crop cards (`85-ls-farms.js`); the leat and the mills, the herds | done (placeholder yaks) |
| P4 | interiors on `kits/interiors`, room by room from `ROOMS.md` sections 3-4, (the Assembly Hall's skylight columns, the library, the cells) and furniture from `FURNITURE.md` on the catalog | next |
| P5 | the people on `core/simulation` and `core/charactermodels` (the Order's robes), the night (butter lamps, the generator's bulbs), the festival day (the thangka, the pilgrims' camp) | to come |
| P6 | the ward on `core/city` (its lanes and lots), the valley road joined to the open world's network, the gallery entry | to come |
