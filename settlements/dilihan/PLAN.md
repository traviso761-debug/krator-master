# Dilihan: the plan (draft, 2026-10-18)

Dilihan is the premier settlement of the Cut, the Izani veterans' colony that stayed loyal and became a state of its
own by distance. Its lore is `LORE.md` §6.2 (the Dilihan entry under "Settlements"), with the Cut's geography there,
Jimjam's side in §6.14 and the Hykkousoi road in §6.16. It is the third vassal-city page after Pylon and Talia and is
written on their contract (`settlements/iziz/VASSAL-KITS.md`), with one difference: its own style is not a new kit
but the **Jimjam kit** already built (`settlements/jimjam`), standing as the old quarter inside Vernacular districts.

Owner's brief (2026-10-18): premiere settlement of the Cut; during the waxing years of the empire the Cut was one of
the regions settled by Izani ex-legionnaires; a core of Jimjam-style buildings (the old quarter) is surrounded by
districts in the Iziz Vernacular style taking up four times the area; a governor's palace similar to Pylon's and
Talia's but with Jimjamite flourish; the region was loyalist, but its remoteness has made it a de facto independent
state; Iziz maintains extensive diplomatic contact, increasing lately as relations with the Hykkousoi have improved,
allowing the Izani to cross their territory.

## 0. What the build is

| | |
|---|---|
| Folder | `settlements/dilihan/` (`src/`, `targets/`, `build.py`, `verify.py`, `materials.json`, `site/`, `palace/`) |
| Pages | `dist/dilihan.html` (the city), `dist/dilihan-site.html` (the site editor, Voth's read in place) |
| The old quarter | the **Jimjam kit** (`settlements/jimjam/src`, the `JJ.def` registry: 39 buildings, houses in three tiers, shops, inn, tavern, caravanserai, library, school, amphitheater, temple, palace, fortress, barracks, wall pieces, farms), read in place, never copied; its kit page stays as it is |
| The districts | the Iziz Vernacular and its Ancients core as the shared **IZV bundle** (`VASSAL-KITS.md` §1: the one file list Verge, Pylon and Talia call) |
| The palace | the vassal cities' programme (`VASSAL-KITS.md` §3) drawn on the shared generator (`settlements/voth/palace/blueprint.py`) as `settlements/dilihan/palace/`, built in Jimjam's materials (section 2) |
| Town | `core/city` steps 0-12 on the site layer: the old quarter on the `frontage-courts` strategy inside its wall, the districts on `alleys` and main streets, as Verge's two levels are |
| Biome | the Cut's biome polygon has **no kit yet: a Cut kit is to come later** (the owner, 2026-10-18). Until it does, the page reads `biomes/nhighlands` for the bowl's cut sides and `biomes/nwlowlands` for its floor in place, and the bowl's own ground (the sphere's curve, the bare cut faces) is drawn by this build's terrain fragment on `core/terrain`, to be lifted into the Cut kit when it is written |
| Core | `core/rand`, `core/mask`, `core/tags`, `core/space`, `core/lod`, `core/host`, the shared sky; `core/furnish` with the Iziz furniture set, and a Jimjam set once the catalog has one (section 5, question 4) |

Dilihan is a settlement and goes in the gallery when it first reaches `main` (`gallery/README.md`).

## 1. The site

The scale model has Dilihan at px 472,333 (`solqo7hz7s`, a city point) at the southern end of the Cut's polygon
(px 427-502 by 264-340; the biome polygon "the cut" matches it), 226 km south of Jimjam (px 474,220) and 780 km from
Iziz. Neighbours: Lipp, a village, 138 km; Trigon, the Hykkousoi arcology, 160 km south; the Hexahedron 166 km east;
Ys 175 km; Roketstad 273 km west. No river is named through the Cut yet (`tools/scale-model/river-names-4.21.md`); the
plan assumes a stream down the trench to the League's coast and a road beside it, the **pass road** the colony was
planted to hold.

**The Cut is a sphere's lower half** (settled 2026-10-18): an Ancient eigenweapon deleted a perfectly spherical
volume of matter in the Cataclysm, and the region's near-circular polygon (about 150 km across) is the bite. In the
build's ground: the floor is a smooth concave curve, lowest at the centre and rising to the rim on every side; the
cut faces on east and west are bare, smooth and curved, the Wall's strata sliced clean and barely weathered, with the
mountains' own slopes standing above the cut's lip; north and south the sphere broke the range's flanks, and those are
the two mouths, the lowlands' and the crater's. Water that falls in the bowl drains to the centre and out the lower
mouth (the plan's stream, section 1). The city sits on the southern rim's inner slope where the bowl opens toward the
crater, on a bench above the road, so the old quarter looks down the Cut's mouth to the south, the districts climb
the bench behind it, and the curved cut face stands over the whole city to the east.

| Zone | Where | What |
|---|---|---|
| **The old quarter** (the *colonia*) | the bench's nose, inside the first wall | the Jimjam-style core, about 500 by 500 m: the forum (Jimjam's raised plaza), the temple of the sun (Jimjam's temple family, its arch re-aimed: section 2), the veterans' houses (Jimjam middle and rich), the first barracks and fortress (Jimjam's), the library, the amphitheater on the slope, the old wall with its gates |
| **The governor's precinct** | the quarter's upper edge, where it meets the districts | the palace in its 70 by 56 m grounds, the Vernacular guard tower and barracks beside it, the Izani quarter (rich and civic Vernacular) round them |
| **The districts** | round the old quarter on three sides, four times its area (about 1 km2) | Vernacular housing poor to rich, taverns, workshops, shops, warehouses, the caravanserai where the Jimjam road comes in (north), the market, the muster ground |
| **The lower town** | below the bench on the road | the pass road's inns and stables, the customs post, the League's envoys' house (new since the thaw), the ferry or ford |
| **The country** | the trench floor north and south | the veterans' plots: the colony's grid of allotments, Jimjam farms and granaries, the windmill, the road to Jimjam and the road to the coast |

**Four to one.** The old quarter is one unit of area; the Vernacular districts are four. The site editor draws the
old wall first and the districts' zones to that ratio; `verify.py --assert` checks the built areas (lots by culture
tag) stay within a fifth of it.

## 2. Jimjam beside the Vernacular

The Jimjam kit was not written on the Vernacular contract: its materials are canvas-procedural (`60-jj-mat.js`), its
registry is `JJ.def` and not `VERN.def`, and its sheet turns every building to face north (`ry = π`) for the
solstice light. So the two never share a street; they share a **boundary**, the old wall, and the contract is
enforced at it:

- **Lots are one or the other.** A `core/city` zone carries the culture mix (old quarter `jimjam` 1.0; the Izani
  quarter `iziz-vernacular` 1.0; the districts `iziz-vernacular` 0.9, `jimjam` 0.1 for the Jimjam merchants' houses
  near the caravanserai). The lot filler draws the culture, then the type from that registry: a Jimjam lot calls
  `JJ.place`, a Vernacular lot the IZV placer, through one adapter in this build.
- **Cornice lines meet.** Where a Jimjam row faces a Vernacular row across the wall street, the P2 check reads both
  registries' heights and reports a mismatch over 0.5 m per the contract's table; a mismatch is a `o.scale` on the
  Jimjam side, not an edit to the kit.
- **Materials are left as they are** in P0-P2 (Jimjam procedural, the Vernacular on the library). P3 moves the Jimjam
  materials this page uses to `KMAT` records on the library's brick and marble sets if the library has them; the
  gaps go to `PROMPTS-NEEDED.md`.
- **The temple's arch.** Jimjam's temple frames the summer-solstice sunset at Jimjam's latitude. Dilihan is 226 km
  south; the arch is re-aimed from the page's sky for the site's latitude (the same step Jimjam itself owes,
  `LORE.md` §12), and `verify.py`'s solstice eval proves it.

**The palace** is the `govpalace` massing (`VASSAL-KITS.md` §3.1) and the floors of §3.3, with the forks of §3.4 taken
as Pylon and Talia took them (kin-only household, the council pavilion inside, the guard pavilion in the palace and
the Vernacular barracks outside, grounds 70 by 56 m). Dilihan builds it in Jimjam's vocabulary:

- the **terrace** a Jimjam marble podium with its stair;
- the **hall block** banded brick (red with yellow header courses) with marble string courses and surrounds, two
  storeys of brick arcades, oriels on the upper gallery, the loggia's columns on Jimjam's patterned shafts;
- the **great dome** a gold onion dome on a drum of marble-framed windows, the lantern the signal room;
- the **seven pavilions** chhatri pavilions, ribbed slate domes with lanterns on the two large, terracotta on the
  small; the kitchen pavilion a round brick kitchen under a vented dome with a clustered Tudor stack;
- the **outside stair** a straight marble flight on a brick stringer wall; Iziz orange only on the banners, the
  gate and the reveals, so the palace reads Jimjamite first and Izani second;
- **interiors** on the Iziz catalog set with Jimjam's sunray inlay on the hall floor, brick vaults in the undercroft.

Its sheets are drawn after the owner's review of section 5 (the blueprint method's step 4), one per floor, with a
furniture manifest keyed to the Iziz catalog file.

## 3. The order of work

- **P0. The harness.** `build.py` reading the Jimjam kit, the IZV bundle and `core/city` in place; the biome
  question named (section 0); the port lint; `verify.py` on `tools/harness.py`. Done when a Jimjam temple and a
  Vernacular house stand on the Cut's bench on the page and `--assert` passes.
- **P1. The site.** The ground (the trench, the bench, the road, the stream), the site editor saving
  `site/dilihan-site.json`: the old wall, the four-to-one zones, the precinct, the roads in. Done when steps 0-5 run.
- **P2. The two towns.** Steps 6-12; the culture adapter; the boundary check at the wall street; the arch re-aimed.
  Done when the old quarter fills its wall in brick and the districts fill theirs, the ratio check and the city test
  are green, and the wall street reads at eye level.
- **P3. The palace and the landmarks.** The palace sheets, then the building; the forum, the temple, the
  amphitheater, the caravanserai, the fortress; the Jimjam materials onto the library where it has them. Done when
  the views of section 4 read.
- **P4. The life.** Citizens (the colonists' Izani, Jimjam merchants, Free Clans highlanders, a few Hykkousoi at the
  envoys' house), the muster on the ground, the night (electric light on the rich and civic only). Done when the
  night view reads.
- **P5. The record.** `README.md`, `KNOWN_ISSUES.md`, `PORT.md`, the gallery entry, the hash into `PORT-BASELINE.json`.

## 4. Views for the verify

| View | What it must show |
|---|---|
| Overview from the Cut's mouth | the brick core on the bench's nose inside its wall, the Vernacular districts four times round it, the palace dome at the join |
| The forum at eye level | Jimjam's raised plaza, the temple's arch, the veterans' houses |
| The wall street | Jimjam brick on one side, Vernacular plaster and orange on the other, cornices level |
| The palace from the forecourt | the marble podium, banded brick arcades, the gold onion dome, the chhatris |
| The caravanserai | the Jimjam road's gate, the Jimjam merchants' houses among the Vernacular |
| The lower town | the pass road, the customs post, the envoys' house |
| Night | the palace and the temple lit, the districts' rich houses, the old quarter's lamps |

## 5. Open questions for the owner

1. **Settled (2026-10-18).** A Cut kit is to come later; until then the highlands and lowlands kits are read in
   place and the build draws the bowl's own ground (section 0).
2. **Who governs.** The plan and `LORE.md` propose the governorship chosen by the veterans' council and confirmed by
   Iziz by letter; the governor's title stays the Izani one. Confirm, or name a ruler and a title.
3. **Settled (2026-10-18).** The Cut is effectively a pass through the northern highlands, formed in the Cataclysm
   by an Ancient eigenweapon whose detonation deleted a perfectly spherical volume of matter (section 1). The stream
   down the bowl to the League's coast stays the plan's assumption; the model would take it as a river edit later
   (`tools/scale-model/README.md`), and the bowl's curve as a heights edit when the Cut kit comes.
4. **Settled (2026-10-18).** The old quarter takes the Iziz furniture set until a Jimjam set exists; the Jimjam set
   is its own job, after this build's P3.
5. **Settled (2026-10-18).** A Jimjam name read through an Izani accent: Jamṭōkku **Ḍeḷḷu-Hanḍu**, "**Dell-Hand**", the plots in the dell. Jamṭōkku counts things
   with measure words (`LORE.md` §6.14), and *hanḍu*, "hand", is its measure word for a plot of land, the breadth a
   man's hand spans on the day-keepers' field tally; *ḍeḷḷu* is English *dell*, the bowl the Jimjam saw from their
   lake. So the name is what Jimjam's masons and almanac-sellers called the colony: the hands of land in the dell,
   the veterans' allotments. An Izani ear flattens the retroflex *ḍ* and dark *ḷ* to plain *d* and *l*, hears the
   doubled *ḷḷ* as a higher vowel (*e* > *i*), drops the Jimjam *-u* endings and the second *d* of *-nḍu*, and the
   colony's Izani wrote **Dilihan**, keeping the *h* their own speech no longer sounds because the Jimjam say it.
   `lore/tongues-of-krator.html` is to take the pair (the Jimjam and the Izani tabs).

None open but the governor's title and name.
