# Scrap Xanadu: the plan

The owner, 2026-11-11: a "scrap Xanadu" set, Xanadu-style buildings made with reclaimed materials. "Unlike the post-apoc set,
there is nothing ramshackle about them, they incorporate reclaimed materials in a well-ordered and vaguely orientalist way."
The first user is the Xanadui town in the lower decks and at the foot of **Strongbow**, the Ancients' cliff arcology at the
Oidong Valley's east end (a `kits/ancients` target, built by another session). There the Sultanate's road ends in a caravan
terminus and a garrison. The set is general: any Xanadui place near Ancient ruins can take it.

## 1. Why the scrap is handsome

LORE 6.13: the Sultanate is "rather deficient in iron ore and scrap". So Ancient metal and glass at Strongbow are not junk.
They are a precious stone, quarried from the hull under licence and dressed by masons. They are set the way Xanadu sets
gold and tile: in courses, framed, and on show. The post-apoc set (`kits/post-apoc`) patches with whatever comes to hand:
containers, tyres, bottles, sheet nailed over holes. Scrap Xanadu does none of that:

| Reclaimed from the hull | Set in Xanadu as | Never |
|---|---|---|
| whole white shell panels (the Ancients' seamed sheet, one sheet per panel) | facings in regular courses with shadow joints, checker and band patterns in the Sultanate's paints (Casa Vicens, the cholets) | a panel cut, bent, lapped or nailed over a hole |
| verdigris panels (the hull's copper skin) | the green drums and towers, banded in bronze | rust as a colour |
| the Ancients' shaped glazing | lantern clerestories, glass domes on bronze ribs, jali grilles of small panes in bronze frames, shop fronts | dead or broken panes |
| girders | dressed columns (painted shaft, bronze collars, bracket capitals) and lintels | raw stubs, scaffolds |
| cable | balustrades: girder posts, three taut cables, a bronze rail | slack lines, lashings |
| bronze (fittings, pipe) | finials, crowns, collars, the eight-spoked Wheel | |

The Xanadu body stays: battered whitewash, the maroon twig band, flat roofs, pointed arches, iwans, mosaic pools. The
salvage replaces the timber and the stone of the upper works.

The references the owner sent with the brief (2026-11-11), and what each gives the set:
- A riad's mosaic canal between arcades under lanterns: the caravanserai's court and the pavilion's pool.
- A carved timber house with octagonal corner bays: the corner towers and the bays.
- Casa Vicens (Gaudí): the panels in checker courses with painted bands.
- A blue-and-white mosaic gazebo over a wave-patterned pool: the Cistern Pavilion.
- Green copper towers with glass domes and brass rings: the Glass-Crowned Tower and the verdigris drums.
- Garden balconies joined by curving iron bridges: the cable bridge and the galleries.
- A Bhutanese dzong, and a lapis city stepping up a cliff under domes: the massing, the town stepping up the hull's foot.
- The El Alto cholets: the stepped painted frames round the glazing.
- Painted Palopó houses and an umbrella street: the colours, the strung lights.
- Bas-relief façades: some panels laid as a relief frieze (the Ancients' stamped sheets set as ornament).

## 2. Open questions to the owner (with the defaults built)

1. **Where it lives.** *Default built:* a package inside `kits/xanadu` (`src/87s-xs-mat.js`, `87t-xs-helpers.js`,
   `87u-xs-build.js`), listed apart as `xanadu.py` `SCRAP`. It is opt-in. `FILES` does not change, so the Xanadu and
   Erewhon pages and every `XAK` taker (Longsong, the Xanadu-Oidong region) stay byte-identical. `kit_bundle.bundle(scrap=True)`
   adds it to `XAK` for Strongbow. The other choice is a kit of its own (`kits/xanadu-scrap`). It would be cleaner as a
   catalog entry, but it would have to vendor or bundle the whole Xanadu vocabulary it draws through.
2. **Catalog culture id.** *Default:* `xanadu-scrap` (the tag `culture`; `kit` stays `xanadu`). Keys are `xa_scrap_*`, so
   `XAK.dims()` lists them.
3. **Building types.** *Default built:* the ten below, for a town of a few thousand with a terminus and a garrison. Not
   built yet, and asked: a bathhouse, a guildhall (the Salvagers' Guild, who hold the licence on the hull?), a
   granary and the farms. Strongbow's terraces below the hull may want them.
4. **Who quarries the hull.** *Proposed:* the Salvagers' Guild, under licence from the Sultanate and the History Monks.
   The Order keeps the upper hull sealed and says what may be cut (lore, not drawn).

## 3. The set (built)

| Key | Name | Family | What |
|---|---|---|---|
| `xa_scrap_house` | Panel House | Scrap: houses | a common town house: whitewash ground storey, panel-faced upper storeys in courses, a girder-bracketed bay of glazing, cable-railed roof terrace with a glazed lantern |
| `xa_scrap_row` | Panel Row | Scrap: houses | three narrow houses in one frontage, each in its own checker or band, girder porches, a shared cornice of panels |
| `xa_scrap_court` | Lantern House | Scrap: houses | a rich courtyard house: a mosaic pool in a girder arcade, a hall under a glass lantern dome on bronze ribs, a verdigris corner tower with a glass cap |
| `xa_scrap_bazaar` | Girder Arcade | Scrap: trade | a row of shops behind a pointed arcade on dressed girder columns, glazed shop fronts in bronze, a cable-railed gallery above, awnings and strung lanterns |
| `xa_scrap_serai` | Terminus Serai | Scrap: trade | the caravan terminus: a court ringed by two storeys of girder arcades, an iwan gate faced in panel courses, stable bays, a glazed kiosk over a well |
| `xa_scrap_gate` | Garrison Gate | Scrap: garrison | a gate between two battered towers faced in panel courses, a girder-framed gate, bronze crowns, a barracks block behind |
| `xa_scrap_tower` | Glass-Crowned Tower | Scrap: civic | a watch and signal tower: a drum of verdigris panels in bronze bands, a glazed strip up its face, a gallery on cable rails, a glass dome |
| `xa_scrap_shrine` | Wheel Shrine | Scrap: civic | the Decree's shrine: a glazed lantern drum (the clerestory), a verdigris dome on bronze ribs crowned by the eight-spoked Wheel, prayer wheels of panel drums round it |
| `xa_scrap_pavilion` | Cistern Pavilion | Scrap: civic | an octagonal pavilion on eight girder columns over a mosaic pool, under a glass dome with a bronze finial |
| `xa_scrap_bridge` | Cable Bridge | Scrap: civic | a footbridge between two stair towers: a girder span with a panel deck and cable balustrades, for the town's steps up the hull |

Each has three variants (`o.v`): the pattern and paints of the panel courses, the storeys and the crowns change.

## 4. Core adoption

The set is a package of the Xanadu kit, so it takes what the kit takes and writes nothing the core owns.

| Need | Taken from | How |
|---|---|---|
| registry, tags | `VERN` / `XA.def` (the kit's registry), read into `core/tags` on the sheet (`91t-xanadu-tags.js`), core/rand for the tag uid | every def registers its inspector volume (`vnReg`) before it is drawn; tags `culture: 'xanadu-scrap'`, `type`, `wealth`, `lit` |
| randomness | the kit's builder contract: each builder opens with `reseed(33001 + k*10 + v)` (seed block 33000-33099); per-panel variation is `KRAND.hash` of (def, face, row, column), never the draw order | `KRAND.hash` where core/rand is on the page, else the reseeded `rng()` (the bundle without core/rand) |
| materials | `core/materials` (the Ancients' `MAT.white` panel sheet, `MAT.verdigris`, `MAT.glass`, `MAT.pipe`) and the kit's `MAT.xPaint`, `MAT.xGold` | `87s-xs-mat.js` names kit items over them (prefix `xs`); one new geometry: the I-girder, and a box whose UVs show exactly one Ancient sheet |
| doors and glass | core/door (`KDOOR`, `KGLASS`) through the kit's `vnDoor`, `xnDoorway`, `xnPane` | every door a locked leaf, every window glass over the room card: no dark voids |
| the sheet's host | core/host, core/lod, core/atmos, core/water: the Xanadu page shell | the `scrap` target of `settlements/xanadu` |
| placement in a world | `XAK.proto` (`kit_bundle.bundle(scrap=True)`), and `core/city` for the town's lots when Strongbow is laid out | the set places nothing by itself |

No own PRNG, noise, `getImageData`, sky or water shader. `tools/check_core_use.py` passes on `settlements/xanadu`.

## 5. The sheet and the check

`python3 settlements/xanadu/build.py --target scrap` writes `dist/xanadu-scrap.html`: the kit's foundation and the
scrap package only, in rows by family, every variant. `verify.py dist/xanadu-scrap.html --assert` is the check (GPU lane).
