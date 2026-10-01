# core/sockets: cultural sockets, banners and awnings

How a building kit stays culture-neutral and still carries a culture's marks. Built for the Post-Apoc set (`kits/post-apoc`), meant to be copied into
any future build (a Voth catalog, a Yuni district, a Beast Rider village, a Highlands kit).

**The idea.** A building never names a culture. It *declares sockets*: named anchors in its own frame where cloth, plates or boards would hang. The active
**culture pack** draws into them. Change the pack, rebuild, and the same building is Iziz, Voth, Republic, Yuni or Beast Rider. Adding a culture is one call.

## Files

| File | What |
|---|---|
| `37-sockets.js` | `sock(type,x,y,z,ry,opts)`, `fillSockets()`, the `CULT` registry, `cultDef(pack)`, `PAINT()` (livery colour from the active culture) |
| `80-cultures.js` | the drawing kit (`cvMat`, `stripeTex`, `banDecal`, `SYMBOLS`, `SIGN_ICONS`, `signBoard`), the factory `mkCulture({...})`, and the packs: `generic iziz republic voth yuni beast-rider hykkousoi xanadu ringsea-islander` (`beastriders` still resolves, as a hidden alias of `beast-rider`) |
| `example/` | a runnable sheet: the same demo wall in every pack. `python3 example/build.py` writes `example/sockets-example.html` |

## The five-minute version

```js
// 1. In a building: declare sockets. Supply what holds the cloth up (poles, beams); the socket draws only the cloth/plate/board.
sock('awning', -2.4, 2.5, -0.9, 0, {w:2.2, d:1.3, drop:.5, h:2.5});   // top edge against the wall; posts h tall
sock('banner',  3.9, 4.2,  1.25, 0, {w:.8, h:2});                       // hangs from its anchor (the top edge)
sock('flag',   -4.4, 6.2, -0.7, 0, {w:1.2, h:.7});                      // on a pole top
sock('emblem',  0.0, 2.6, -0.9, 0, {w:.9, h:.9});                       // a plate on a wall
sock('sign',    0.0, 3.45,-0.85,0, {w:2.6, h:.95, trade:'FOOD'});       // shop board with a pictograph (FOOD ARMOR WEAPONS TINKER GENERAL MESS)
// 2. In the scene: pick the culture (or dress one building): CULT.cur = CULT.packs.iziz;   place('shop-food', x, z, 0, {culture:'yuni'});
```
Socket frame: origin at the anchor, **+z out of the surface**, +x along it, y up. `fillSockets()` runs right after each builder (inside `place()`), with the building's
matrix, so sockets follow any placement, nesting (a compound places buildings, each dressed by `o.culture` or the active pack) and rotation.

## Socket types

| type | opts | draws |
|---|---|---|
| `awning` | `w d drop h` | a sloped canopy (striped texture or ragged cloth, per pack) with a scalloped valance and two posts |
| `banner` | `w h` | a rod and a hanging banner: field, edge bands, the culture's symbol |
| `flag` | `w h` | a pole below the anchor and a flag (rectangle, or a swallow-tail pennant in packs that set `flagStyle:'pennant'`) |
| `emblem` | `w h` | a square painted plate with the symbol |
| `sign` | `w h trade` | a board with the trade's pictograph in the pack's colours |
| `paint` | `w h` | reserved: a panel a culture may band or stripe (packs currently draw nothing; `PAINT()` colours livery instead) |

Banners and flags are drawn **at their own aspect ratio** (`banDecal`): canvas pixels map 1:1 to world metres, so a symbol stays round on a tall banner and a wide flag.

## Adding a culture

```js
mkCulture({key:'yuni', name:'Yuni',
  field:'#dcb42c', edge:'#5a4410', band:'#f4ecc8',      // banner cloth, its side edges, its end bands
  disc:'#f6efd0',                                        // round ground behind the symbol (or null)
  ink:'#4a3a12', sym:'hyperboloid',                      // symbol colour(s) and which SYMBOLS entry to draw
  awn:{mode:'stripes', cols:['#e0b52a','#f4ecc8','#c99a1e','#f4ecc8'], n:8},   // or {mode:'cloth', cols:[0x58924a,...]}
  paint:[0xd9b12a,0xe8c84a,0x8a6a1a,0xf4ecc8,0x4a3a12],  // livery colours for painted containers/walls (PAINT())
  signBg:'#dcb42c', signFg:'#3a2c08', signFrame:0x5a4410, pole:0x5a4410, flagStyle:'rect'});
```
A new symbol is one function in `SYMBOLS`: `(g, cx, cy, R, ink, ink2)` on a 2D canvas context, drawn inside a box of half-size R. Shipped: `sun` (Iziz),
`triskele` (Republic), `diamond` (Voth), `hyperboloid` (Yuni: a cooling-tower waist with its ruling lines), `claw` (Beast Riders: three talon slashes), `wavesun` (Hykkousoi: a half sun over three waves), `wheel` (Xanadu: the eight-spoked wheel), `moon` (Ring Sea Islanders: the white moon).
For a fully custom pack skip the factory and call `cultDef({key,name,paint,fill:{awning,banner,flag,emblem,sign,paint}})` with your own drawing functions; any `fill`
you omit falls back to the generic pack.

Shipped palettes: **Iziz** orange and teal, striped awnings. **Republic** Voth's deep red with cream, ochre and the triskelion. **Voth** deep blue with an ash-white glyph, ragged cloth.
**Yuni** yellow with the hyperboloid. **Beast Riders** green with the claw, ragged hide-and-cloth.
**Hykkousoi** pale sea-linen and slate blue with the gold wave-sun. **Xanadu** saffron bordered in maroon with the gold-hubbed wheel. **Ring Sea Islanders** bark-dyed cloth
and pandanus with the white moon, pennant streamers. These three take their colours from the sails in `kits/ringsea`, so a culture's ships and buildings match.

Pack keys are the repo's culture tags (`beast-rider`, not `beastriders`), so a building's `culture` tag can pick its pack directly.

## What the host build must provide

The packs are written against the Post-Apoc geometry engine (`kits/post-apoc/src/30-geo.js`): `box beam poly plane4 decal quad W`, the matrix stack (`CM`, `CMS`, `TF`),
`jc(hex,jitter)` and `P(name)` colours, the seeded `rng/rr/pick/reseed`, `canvasTex`, the `MAT`/`TILE` registries, `reportErr`, and materials `cloth wood plank`.
The runnable example (`example/build.py`) shows the minimum set of fragments. In a build with another engine, port those eight calls and keep `37-sockets.js` and `80-cultures.js` as they are.

## Rules that kept it clean

1. Sockets need anchors. A socket floating in air is a bug; give it the pole, beam or wall in the building. Test every building under every pack.
2. Declare at least an awning (or banner), a banner or flag, and an emblem on every building; shops add a `sign`.
3. Pictographs, not English, on signs. The trade string only picks the icon.
4. Reclaimed metal and timber are weathered by the engine and stay dull; a culture's bright colour lives only in its cloth, plates and boards.
