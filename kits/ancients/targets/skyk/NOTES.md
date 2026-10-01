# Skyscraper K — the Sail — hand-back notes

Target `skyk` (`dist/skyk.html`), builder `buildSkyK(scene,gx,gz,d)` in
`src/89m-sky-k.js`, seed `reseed(9780+d)` (claims 9780-9784; 0-3 used).
Kit row key `skyK`, row `{z:0,s:300,r:280,t:1200}`: intact x=-300, ruined
+300, rehabilitated 0, toppled 1200. Top-level names: `buildSkyK`,
`skCampanile`, `skGrid`, `skTube`, `skGableGeo`, `SK_SITE`, kdefs `sk*`,
`MAT.skGlow/skPlate/skSoffit`, `TEX.skGlow`. FIREKIT gains `skLit`, `skGlow`.

## The form

| | |
|---|---|
| sail | 405 m to the prow. Luff straight and raked (x -80 -> 22), leech near plumb then curling in (x 58 -> 22). Back face FLAT at z=-14 (north), front BELLIED up to 44 m deep, draft forward of centre |
| rose | r=26 opening centred at y=250: a real tunnel through the sail (lined), collars + flanges on both faces, glazed disc 9 m in from the back face, 24 spokes, two tracery rings, hub, hour marks, hands at ten past ten. Night: amber glow card (FIREKIT) |
| rib | swept superellipse section 11x7 -> 6.5x4.5 on a Catmull-Rom from a footing at (98,0,12), up outboard of the leech, round behind the rose at z=-24, bracketed to the flat back; glazed web + tie struts to the leech up to 215 m |
| campanile | foot at 298 on a corbel off the front face, fluted shaft, two balconies, open belfry, dome, lantern, needle, plain glass finial + night beacon; 447 m top. No cross |
| porch | equilateral pointed arch, 30 m wide, 114 m apex, deep lined reveal to a glass wall with galleries and floors behind |
| shell hall | Bezier axis from inside the sail's west end, curving south; 50 -> 40 m wide, 70 m high at the sail dipping to 42 and flaring at the mouth; glazed inclined front on the concave side, fan-mullioned glazed mouth, transverse ribs, eave and mouth lips; own terrace where it runs off the podium |
| podium | own disc r=112 (2.5 m) + step + apron; 6 domed pavilions, ~26 balconied houses (gable or domed roofs), placed by rejection round the sail, hall, porch approach and hoop |

## Decay

- d=1 ruined: prow snapped at ~372 (jagged); campanile snapped at 355, its head lies out on the plain to the south; skin holed + two large tears (front 188 m, back 318 m) showing pale plates with dark soffits over a guts lining that shares the openings; rose glass gone, spokes whole/stubbed at hub/stubbed at rim/gone, tracery rings partly gone, collars broken into arcs, minute hand hanging, shards in the tunnel; rib broken at 0.44, upper half hangs from its brackets (rotated -16 deg about z, 24 deg back); web glass gone, half the ties; hall roof fallen in over its middle with slabs on the floor, glazing gone, mullions partial; houses roofless/collapsed, domes fallen.
- d=2 toppled: stump cut at 150 (jagged), porch intact-ruined; the upper sail lies EAST on its flat back (belly and rose to the sky) from x=135, with the snapped campanile beside its prow; rib stub to 0.28 and two rib pieces lying north of the stump.
- d=3 rehabilitated: full height, ruin materials, HOLES=0.55, repairPass.

## Numbers (verify --assert, skyk target)

All invariants PASS; error panel clean.

| decay | triangles | instances | meshes |
|---|---|---|---|
| skyK/0 | 160 499 | 2 889 | 13 |
| skyK/1 | 174 692 | 2 297 | 17 |
| skyK/2 | 229 042 | 2 803 | 20 |
| skyK/3 | 197 700 | 3 062 | 14 |

Worst draw calls over the presets: 111 (The row / The fallen sail), whole target scene.

## Views (targets/skyk/91z-views.js)

Skyscraper K (hero), The row, Ruined K, Rehabilitated K, Toppled K, The rose,
The crown, The hall at eye level, Looking up, The fallen sail, By night,
The shattered rose, The hanging rib, The hoop from the north.

## Weaknesses

- The belly reads mainly in oblique light; square-on from the south the sail is a flat silhouette.
- Window grid is still regular (paired bays); the concept sketch is blanker.
- Rib section is swept with a z-up frame, so it twists slightly where the curve leaves the xy-plane.
- Hall roof is a single-sided shell (no thickness) apart from the lips.

## Design pass (2026-10-01): belly and facade
* **The facade's rhythm changes with height** (placed by position hash; the
  old grid's rng draws are replayed first so the rose's ruin, campanile,
  houses and everything after are where they were). Front, from the foot:
  two-storey openings under deep hoods (to 124 m); bays of three under one
  sunshade with piers between, every third storey a band of recessed loggias
  with balconies, the bays shifting half a bay every six storeys (to 212 m);
  a nearly blank rose zone with small staggered squares (to 292 m); narrow
  staggered slits (to 372 m); a blank prow. Back: vertical strips banded
  every fourth storey, then sparse openings, then slits. Margins along luff
  and leech widen with height; no window sits on a batten.
* **The belly has a designed form**: a KEEL, a blade up to 7 m deep standing
  out of the belly along its draft line (42% back from the luff), springing
  from the porch's apex and broken by the rose's collar; it and its shadow
  draw the belly's crest when the sail is seen square-on. BOLT ROPES (1.25 m
  tubes) on the luff and leech edges of the belly draw the outline.
* Weaknesses struck: "window grid regular"; "belly reads only in oblique
  light" partly (square-on it now reads by the keel and the bays' hoods, not
  by shading). The keel's S-curve off the porch apex is deliberate.
