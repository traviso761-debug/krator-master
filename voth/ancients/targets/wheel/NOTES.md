# The Wheel — hand-back

- `src/89j-wheel.js` — `buildWheel(scene,gx,gz,d)`, `reseed(9750+d)`; the plan
  (wells, lakes, pavilion clusters, rim terrace blocks, spoke wells and
  pavilions, the torn-edge jitter) is drawn from `reseed(9753)`, inside the
  claimed range 9750..9754, so both decays share one plan. Prefix `WH`/`wh`.
- `targets/wheel/` — `DECAYS=[0,1]`, intact at x=-3800, ruin at x=+3800.

## Form (as built)
| | |
|---|---|
| band | annulus r 1100..1420 (2 840 m across), deck y 300, soffit y 262, rim beam to y 205; swells 30 m each way at every tower (eight knuckles in plan) |
| rim towers | eight, at r 1260, 22.5+45k deg; superellipse plan 196 x 148 m, flared buttress foot (x1.62 at ground), drawn in to x0.73 at the roof (556 m); outer blade fin to 634 m, inner fin to 590 |
| central tower | eight-lobed, lobes down the spokes; 534 m foot, 284 m at the hub; sky-ring garden at 640, halo at 950, roof 1000, spire 1115 |
| hub | disc r 330 at y 300 (soffit 232) round the central tower, eight round wells |
| spokes | eight, 76 m wide, 740 m long, deck y 300; fish-belly soffit 38 m deep at the ends, 82 at mid-span; five slot wells each |
| wells | 39 on the band (round r 18-42 and curved slots 30-46 wide, 80-180 long), 40 on the spokes, 8 on the hub |
| lower city | r < 1850, five ring roads, sixteen avenues (eight run out to 2.7 km), ~5 500 blocks |

### Deviations from the suggested form, and why
- Band 320 m wide and 300 m up: the suggested ranges' middle. Rim towers 556 m
  to the roof and 634 to the fin tip; central tower 1 115 m to the spire.
- The interior of the ring between the spokes is OPEN SKY, not a plate: with
  a full plate the wheel would not read as a wheel from above, and it would be
  Midgar. So the lower city has two conditions — sunlit inside the ring,
  shaded under the band/spokes/hub and lit by the wells — which is the
  "world above, world below" idea without the slum.
- Spokes are unsupported 740 m bridges between the hub and the band; their
  fish-belly soffit is the structural gesture. No intermediate piers.

## Painted light
Nothing casts shadows. The plate's own outline (wells cut out) is laid on the
ground as a dark decal (`MAT.whShade`), so the undercity is dark exactly under
the plate and the well gardens are the bright holes in it. Buildings under
the plate use darker wall/roof materials but keep lit windows. Soffits carry a
painted, slightly cool bounce light plus sparse lamps (emissive) and swap to
lamps-only at night. Ground decals are kept apart by polygon offset, not
height, because at 4 km centimetres are inside the depth resolution.

## Ruin
- Sector 3-4 (south-west, facing the hero camera) fallen: the slab next to
  tower 3's stub still hinged on the torn edge and hanging 72 deg down; the
  rest split into inner and outer halves that tipped and slid apart onto the
  city, debris-topped, with a debris field and the city under them buried.
- Rim tower 4 broken at ~395 m; its top lies in two pieces on the plain
  outside the rim, outer fin sticking up.
- Spoke 2 has lost its middle 470 m: stubs at hub and band, three pieces on
  the avenue, one leaning steeply.
- Central tower broken at ~880 m, dark core showing through holes; halo and
  spire gone, the spire lying on the hub; sky ring partly collapsed.
- Wild forest over meadows and paths, lakes to marsh, vines off every edge,
  dead windows, stained stone.

## Measured
(pending final run)

## Views
(pending final run)

## Weaknesses
(pending)
