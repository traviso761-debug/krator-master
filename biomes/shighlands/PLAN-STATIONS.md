# shighlands: the upper stations (plan, 2026-10-23)

The kit draws the spiral cloud forest and the paramo above it: the temperate parts of the `s highlands` polygon. The
owner (2026-10-23): the polygon is mostly arctic only by the way it is drawn, but **the higher parts may need fleshing
out**. Two stations carry the spiral theme up the wall. The page as built stays station 1.

**Status (2026-11-09):** re-surveyed on map 5.1 (below); stations 2 and 3 built on the owner's go (2026-11-09: "do it now; then let's do station 2 + 3 plus the prompts").

## The ground (surveyed 2026-10-23)

| Band | km² | Air | Rain | Mean (warm/cold) | Climate |
|---|---|---|---|---|---|
| Under 2 km | 12.6k | 1.37 atm | ~890 mm | +18 (28/9) | Cfa, Csb, Cfb (the kit) |
| 2-3.5 km | 18.5k | 1.12 | ~550 mm | +10 (23/-3) | Dsb 46%, Dfb (the kit's paramo) |
| **3.5-5 km** | **26k** | 0.93 | ~530 mm | 0 (13/-13) | Dsc 49%, Dfc 24%, ET 13% |
| **5-9 km** | **29k** | 0.76 | ~280 mm | -9 (4/-22) | ET 79%, EF 18% |

## Station 2: the spiral conifers (3.5-5 km)

A subalpine forest where the conifers grow in spirals too: trunks twisted like rope (the Bristlecone's and the wind-twisted
pines' grain, taken to a rule), whorled branches climbing in a helix, cones in strict spirals made large and showy;
snowbeds lingering in the shade; the same handedness as the cloud forest, with the rare mirror tree.

## Station 3: the spiral fellfield and the ice (5-7 km)

Fellfield and glacier: cushion plants that grow as spiral domes, sorted-stone circles laid as spirals by frost (a ground
pattern, not a plant), coiled lichen rosettes, snail-shell rosettes in the scree, an icefall whose crevasses curve; the
Whorl Stone's theme carried onto a summit tor.

## Order

H0 sites from the model, prompts; H1 station 2; H2 station 3; verified and baselined; `kits/crops` `shighlands` gains a
`subalpine` zone.

## The re-survey on map 5.1 (Round 3, 68b6aa22b; 2026-11-09)

`python3 biomes/shighlands/survey/survey51.py` reads the 5.1 grids (`tools/scale-model/model/data/`) and the `s highlands`
polygon (`openworld/isle-demo/source/regions.json`, old canvas + (272, 330)). Pressure is 1.6 atm x e^(-h/8 km).

| Band | km² | Rain | Mean (warm/cold) | Classes |
|---|---|---|---|---|
| under 2 km | 26.3k | 486 mm | +18 (28/7) | Csa 29%, BSk 19, Cfa 18, BSh 14 |
| 2-3.5 km | 66.6k | 565 | +10 (22/-3) | Dsb 37, Cfa 19, BSk 11, Csa 10 |
| **3.5-5 km** | **50.5k** | 439 | +2 (15/-11) | Dsc 37, Dsb 23, ET 22, Dfc 9 |
| **5-9 km** | **33.9k** | 376 | -9 (4/-22) | ET 48, Dfc 35, EF 7 |

**Station 1 no longer matches its site.** At its old px (486,697; 5.1 px 758,1027) the ground is now 550 m, Af: the
hyperjungle's floor under Round 3's southern Inner Wall scarp. That scarp is one face about 3 km tall: from ~400 m at its foot
to a 3.5-3.9 km ET rim within 6 km (two model pixels), the Cfb band (the cloud forest) on the face between ~1.3 and ~2.4 km.
No 1.4 km rim over a cloud deck is left anywhere in the polygon (the search for Cfb/Cwb ground at 1.3-1.75 km with a drop below
850 m to the north finds only mid-face points, ~50 px east, with the face climbing on to 3 km behind them). The page's stage
(a rim at ~1.4 km, the paramo at 1.4-1.6 km) is therefore an ideal type 5.1 does not have: on 5.1 the cloud forest is a band on
the face and the paramo-like ground (ET, ~1.0 atm) is the rim's plateau at 3.5 km, which is where station 2 stands.
**Re-staged 2026-11-09 on the owner's word, option (b)** (KNOWN_ISSUES.md, "Station 1 re-staged on the 3 km face"). The options were: either (a) station 1 keeps its
ideal type and its sky site (old px 486,697) as a known divergence, or (b) its stage is rebuilt as a band of the 3 km face
(the deck at ~1.1 km below, the face rising past the map's south edge) and the paramo moves up to the rim. KNOWN_ISSUES.md
carries it.

**Station 2's site:** 5.1 px 762,1059 (old 490,729), 3,786 m, Dsc, 439 mm, +4 °C (17/-9), 1.00 atm; 30 km relief 3.4-4.8 km
(ET on the higher ground round it, Dsb below): the plateau just behind the scarp's rim, 64 km south of station 1's old site.
**Station 3's site:** 5.1 px 816,1058 (old 544,728), 5,208 m, ET, 957 mm, -5 °C (8/-18), 0.83 atm, rising east to 6.4 km
within 20 km (6,420 m at px 829,1058). The nearest EF is 66 km south-east (7.1 km, px 832,1081): the station's ice is a small
summit ice field and its icefall in a cirque (at ~6.2 km the warm month is near 0 °C), not the ice cap.

## Built (2026-11-09)

Both are `--station` pages on src/'s host (`stations/<name>/`, nhighlands' convention): each keeps the stage's contract (TERR,
CLOUD_Y, RAV, TOR, TARN, BOGS, the fields) so 84, 85, 89zw and 89zx run on them, and brings its own species, floor, sky site,
atmosphere and take. `python3 build.py --station conifers` -> `dist/shighlands-conifers.html`; `--station fellfield` ->
`dist/shighlands-fellfield.html`. What each draws, and what is owed: `stations/<name>/station.json` and KNOWN_ISSUES.md,
"Stations 2 and 3".
