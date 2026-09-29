# Xanadu — notes

## Round 1 (Sep 28 2026) — the kit

Brief from Travis: a new building kit, **Xanadu**, for the remote southern Sultanate — Tibetan forms and massing
with Indian bay windows, Turkish ornament and overhanging storeys, Persian mosaics and baths; more colourful;
gold on the wealthy, religious and civic; hilly terrain (buildings must read on an incline); space at a premium
(tenements and manors). Twenty-eight reference images in the upload (Tibetan/Bhutanese dzongs and temple fronts,
prayer-wheel rows, Hawa Mahal, Persian mosaic courts, a blue-and-gold hill city, Andean "cholet" colour).

Decisions:
* New repo `xanadu/` on the Ancients fragment contract, vendoring the Ancients core and the Iziz Vernacular
  helpers byte-identical from `../highlands/src` (which vendors them from `../ancients` and `../iziz`): one placer
  (`VERN.place`), one inspector, one label atlas and one set of blocks serve every kit, and a settlement target can
  reuse Iziz's city machinery.
* `XA.def` wraps `VERN.def` with `family` and the **slope footing**: any def placed with `o.drop` grows a battered
  rubble footing under its plot before it builds (`xnFooting`), so hillside siting is a placer option, not a
  per-building feature. The **Hillside quarter** def stands six kit houses astride four terrace edges through
  `xnSub(..., {drop})` as the proof.
* The batter is real geometry: four battered wedges (`xBat*96/92/86/80`) picked from a block's proportions, and a
  fifth wedge battered across its thickness only (`xWall*`) for curtain walls, so long segments meet at the top.
* Two colour-carrying mosaics, a frieze band and a sun-and-moon roundel are painted once (`70-xa-tex.js`); every
  other map is near-grey and tinted per instance, so one tile map serves turquoise, lapis and white domes.
* The showcase lays rows out from the registry (`xaLayout`) and generates its views (`xaAutoViews`); a target file
  is three lines.
* `verify.py` / `jscheck.py` accept `PW_CHROME` (an already-installed Chromium) because the sandbox's playwright
  and its browser build did not match.

### Round 1 result
Nine packages, **39 defs**, one target (`dist/xanadu.html`): housing 3 × 3 tiers, bazaar / workshop / scrap
smithy, terraced fields / farmstead / granary / asbad windmill / watermill, temple / monastery / Grand Temple,
Sultan's Palace / Pleasure Dome with baths and gardens, five guilds + generator, barracks / wall / gate / fortress
/ city watch / mustering ground, arena / amphitheatre / baths / public garden, the hillside quarter. Whole kit
≈ 0.62 M scene triangles, 109 draw calls, 31 k instances; every registered volume non-empty; heaviest the Grand
Temple at 78 k. Verify clean. Row cameras were standing inside the next row on short rows — the layout now widens
every gap by the previous row's camera distance.

Next: the settlement target (the capital on its hillsides with Iziz's terrain/painted-ground/occupancy
machinery), the Krator sky, reclaimed variants if wanted, and a second variant (`o.v`) pass on the housing.

## Round 2 (Sep 28 2026) — inverted roofs, closed courts, the variant pass

Travis: inverted polygons on the roofs of the sacred, guild, fortress, gate, mustering-ground, palace and manor
buildings; a variant phase; courtyard fences to run all the way round; a z conflict on the tenement.

* Every listed building carries a gilt roof, and `MAT.xGold` was FrontSide on the vernacular wedge geometry, whose
  winding faces inward — the roofs showed their backs. Gold is double-sided now (`71-xa-mat.js`).
* Courts close: the courtyard house's wall runs behind the house, the manor's court walls reach the house with
  short returns, the konak's garden wall runs back to the house.
* Tenement: the shop arcade sat inside the battered ground face and the storeys above started at the full plan,
  past the block's top; the arcade is on the face and the storeys start on the block's top (`W*.96`), windows and
  cumbas on the real storey faces.
* Variants: `xV(o)` gives every builder its variant index (0–2; the seed already moves every pick). Structural
  switches on it in the housing (storeys, cumba side, jharokha caps, pavilion vs dome, tiled hip vs gilt flat roof,
  lean-to side), the bazaar (four shops, a rooftop pavilion) and the temple (ochre sanctum, wider portico). A
  second target, `dist/xanadu-variants.html`, places every def at v1 and v2 side by side (`XA_VARIANTS` in its
  rows file); 156 volumes, 1.24 M tris, verify clean.

## Round 3 (Sep 28 2026) — five variants for the town, distinct civic variants

Travis: another variant run ×2 on the residential and other non-civic buildings; make the civic variants more
distinct.

* `xV(o)` is the raw variant index now and every def carries `nv` (5 for residential and non-civic defs, 3 for
  civic); the variants target (`XA_VARIANTS=true`) places each def at v = 1 … nv-1. Whole variants page: 224
  volumes, 1.6 M tris, 116 draw calls, verify clean.
* v3/v4 on the town: stone ground storey + shrine / mirrored stair + byre (earth block); all-low or all-tall
  tenement row; earth gable roof / stilts (shack); two storeys + jharokha / four storeys (town house); a side wing /
  a gate tower (courtyard house); four storeys / plain ground floor with doors (tenement); a loggia / a fourth
  storey with twin gilt roofs (manor); gilt roof instead of the dome tower / the plan mirrored (hillside manor);
  a cumba on three sides / a corner dome (konak); five shops / an arcaded loggia (bazaar); storeys and kiln size
  (workshop); tiled roof, flat roof, a second forge (smithy); flat valley fields, two tall terraces, low steps
  (fields); three storeys, a pole hay barn, stone walls, the house mirrored (farmstead); round, twin, tall,
  timber-topped (granary); low, tall, stone, twin rotors (asbad); earth, two storeys, stone, tiled gable
  (watermill); the hillside's houses rotate through their own variants.
* Civic v1/v2 are structural now: temple (gold dome crown / three storeys, drums on the flanks); monastery (one
  cell block + great shrine / dome crown + open arcade gate); Grand Temple (ochre with turquoise domes / four
  storeys, big gilt roofs, no dome); palace (white with twin domes / three gilt roofs and square gilt-roofed
  towers); Pleasure Dome (gold dome, tall turrets / mosaic dome over one great pool); every guild (storeys, wall
  kind, gold corners; taller headframe, more tubs; taller strong room or a gold dome; taller tower or tiled dome;
  finished gilded hall; twin chimneys or a flat roof); barracks (three storeys / a second wing); wall (a tower /
  an earth wall); gate (square gilt towers / taller towers under a dome); fortress (dome crown / taller tower and
  square towers); watch (taller tower on the other corner / a bell cote); mustering ground (tiled stand / a
  colonnaded stand and barrack sheds); arena (smaller single-tier / four mosaic gates); amphitheatre (five or nine
  tiers, gilt stage roof); baths (gold lesser domes / three tiled domes); garden (long pool / chhatri).

## Round 4 (Sep 29 2026) — the Palopó paint

Travis: variants of the shops, residences, bathhouse and neighbourhood temple painted like Santa Catarina Palopó
(four reference photos: turquoise and cobalt houses, orange/yellow trim, huipil motifs across the walls).

`88-xa-dress.js`: twelve twins `<key>_palopo` in the row "Palopó paint", running the same builder and seed under
a paint filter on `kput` — every wall item takes the building's base colour (turquoise / cobalt / royal / teal /
sky), painted trim goes orange or yellow (black surrounds stay black), valances take a second trim — and every big
wall instance is recorded so that, after the building, each face gets a lozenge-chain or zigzag band under its
top (and above its foot), and the tall faces a motif: pink quetzal, sky quetzal, green deer, hooked X star (four
alpha-cut colour maps, world-tiled bands). Battered blocks get the planes leaned with the wall. Base colour, trim
and motif order rotate with `o.v`. Verify clean: 95 volumes, 0.75 M tris.

### Round 4b — mural fitting
Travis: relocate murals that overlap windows so both stay clear. The paint filter now records every opening
(window panes, door and jali recesses) and the fitting pass projects them — and anything standing in front of a
face (a cumba, a jharokha, a portico) — into the face frame; each motif is placed at the clear spot nearest its
preferred position, shrinking through five sizes, or left off. `window._palopo` counts faces / wanted / placed.
