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
