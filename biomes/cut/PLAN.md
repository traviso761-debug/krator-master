# cut: the plan (draft, 2026-10-23)

**The Cut**: the bowl an Ancient eigenweapon left in the northern Inner Wall when it deleted a perfect sphere of matter
(`LORE.md` §6.2, Dilihan). What the weapon leaves behind still acts on what grows there: **the flora is warped, mostly
harmlessly**, more strongly the nearer the bowl's centre. The kit is mostly a **warp layer over other kits' flora**, with
a few species of its own, chief among them the **hyperbamboo**.

Owner's brief (2026-10-23): something unique for the Cut, a remnant of the eigenweapon: the flora warped in some mostly
harmless way. Settled the same day: the floor takes **nwlowlands flora adapted to the dense air** (not the eastern
abyss's, which is too far away to share it), with a **hyperbamboo**; the warp ideas below were approved.

**Status: plan, awaiting the owner.** The kit does not decide what the eigenweapon was, who fired it or at what
(`LORE.md` §12 keeps that open).

## 0. What the kit is

| | |
|---|---|
| Folder | `biomes/cut/` (the usual kit layout) |
| Pages | stations: `dist/cut.html` (the floor), `-wall`, `-face` (section 5) |
| Core | the biome core, `core/host`, `core/rand`, `core/mask`, `core/tags`, `core/terrain`, the shared sky |
| Read in place | `biomes/nwlowlands` (the floor and walls), `biomes/nhighlands` (the lip) |
| Its own | the warp layer (section 2), the hyperbamboo and a few natives (section 3), the bare cut faces (lifted from Dilihan's terrain fragment, as `settlements/dilihan/PLAN.md` says) |
| Object | `CUT` (`build`, `dress`, `field`, `warp`, `SPECIES`, `PLANTS`, `HARVEST`) on the `BIOME-API.md` contract |
| Users | Dilihan's page, which until now reads nhighlands and nwlowlands in place |

## 1. The bowl (4.21, surveyed 2026-10-23)

19,000 km² (px 425-500 by 258-341), centre about px 460,302. The model already holds the sphere's lower half:

| Distance from the centre | Median height | What |
|---|---|---|
| 0-16 km | -2,190 m | the floor and its lake (2,320 km² at about -2,040 m); ~2.1 atm, XA |
| 16-48 km | -2,000 to -1,800 m | the floor; ~1,000-1,500 mm |
| 48-64 km | +180 m | the walls; Cfa, Csa |
| 64-90 km | +2,800 m | the lip and the cut faces, up to ~6 km |

- 64% of the polygon is over 8% slope at the model's scale; the climate stacks by radius: abyssal jungle and salt steppe
  on the floor, humid subtropical and Mediterranean on the walls, cold at the lip.
- **Dilihan** (px 472,333) reads -1,142 m on the model: 1.85 atm, Af, about 1,500 mm, on the lower southern wall, not
  the rim. Its plan says "the southern rim's inner slope": the two want reconciling when Dilihan is built.
- The floor's air is the densest outside the Rift, and dense air is why Krator's lowland plants run large: the
  nwlowlands' flora, carried in from Jimjam's country beyond the north mouth, grows big down there.

## 2. The warp

One field, `CUT.field(x, z)`, gives a **strength** (1 at the centre, fading to 0 at the lip) and **two axes**, toward
the centre and round it. Every effect reads it, every effect is deterministic, and every one fades with the strength.

- **Combed growth** (the lead effect). Plants stretch and lean along the field's axes, so from the rim the forests and
  bamboo groves read as **rings and spokes round the lake**, like iron filings round a magnet.
- **Fixed sizes.** Growth comes in steps: leaves in a few exact sizes, stems faceted, fruit of one kind identical. Said
  to be why Dilihan's measures are trusted.
- **Clean bites.** Crowns, boulders and old trunks missing perfect spherical bites, the surfaces smooth, the rings or
  chambers showing; leaves with perfectly round holes; lichen in perfect circles on the cut faces.
- **Straight ranks.** Leaves and seeds that would spiral grow in straight ranks and spokes (distinct from the southern
  highlands' spirals).
- **Echoes**, rare and on the floor only: a faint offset copy of a plant that shows at dusk.
- **Mostly harmless**: compasses point at the centre inside the bowl, so no one navigates by them there; some fruit
  fixed at its unripe size never ripens. Nothing hurts anyone.

## 3. The flora

| Ring | Read in place | Warp | Its own |
|---|---|---|---|
| Floor | nwlowlands, scaled up for ~2.1 atm | strong | **hyperbamboo**; the lake's shore |
| Walls | nwlowlands (Csa, Cfa) | moderate | |
| Lip | nhighlands' high band | faint, then none | the cut faces' lichen circles |

**Hyperbamboo** (from nwlowlands' sky bamboo, 26-36 m there): 60-80 m culms in the dense air, and the plant that shows
the warp best. Every internode in a clump is the same length, so the nodes line up across a grove like a level line;
whole groves lean along the field; old culms carry spherical bites that open their chambers. Harvest: the shoots (a
vegetable), the culms (Dilihan's scaffolding, pipes and the pass road's bridges), the leaves (fodder). Wired into
`kits/crops` with a `cut` biome entry (`atm: 2` on the floor, `1` on the walls).

## 4. The ground

The bowl's curve is in the model's heights already; the 1:1 ground keeps it smooth and concave on the floor. The **cut
faces** at the lip are bare, mirror-smooth curved rock where nothing has had time to weather (Dilihan's terrain fragment
draws them today; this kit takes them over). The two mouths, north to the lowlands and south to the crater, are where
the sphere broke the range's flanks.

## 5. Stations

1. **The floor**: the lake, hyperbamboo combed into rings round it, echoes at dusk.
2. **The wall**: Dilihan's slope, nwlowlands' trees warped moderately, terraces of fixed-size crops.
3. **The cut face**: the bare curved wall at the lip, lichen circles, the warp fading out into normal highland forest.

## 6. Order of work

- **C0.** The owner approves; texture prompts written (bamboo culm and leaf exist in the library: `bark.bamboo.jade`,
  `fibre.bamboo.lattice`); Dilihan's height reconciled.
- **C1.** The field and the warp layer, with a node test (the strength and the axes at known points; every effect
  deterministic).
- **C2.** The floor station: nwlowlands read in place and scaled for the air, the hyperbamboo.
- **C3.** The wall and the face.
- **C4.** The crops; Dilihan's page switched to read this kit; `verify.py --assert`; `PORT.md`; the gallery (a new biome).
