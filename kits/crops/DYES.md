# Dyes (survey and proposals, 2026-10-18)

Bucket `dye` (group `utility`, `PLAN.md`). A dye record adds `colour` (red, orange, yellow, green, blue, teal, purple, brown,
black, white), `source` (`plant`, `fungus`, `insect`, `mollusc`, `mineral`, `resin`, `soot`) and `mordant` (what fixes it, or
'none'). A mineral dye names its **resource node** (`kits/resources`: iron, copper, sulfur, oil seep) so a settlement with that
node has the dye; a plant dye names its biome affinity as any crop does. Colours are the cultures' (`LORE.md` section 10); the
biome-to-culture links are read from which settlement vendors which kit (they are not recorded in one place; check before relying).

## 1. Existing (wild, from the biome kits' `harvest` tags)

| Biome | Dye already in the kit |
|---|---|
| ebadlands | rubber rabbitbrush flowers: **yellow** (Yuni's yellow) |
| nhighlands | bark: **red and black**; smoke bush (colour unnamed) |
| nwbay | ironbark bark: tannin brown; dragon's-blood resin: **red** |
| rift | purple fan leaves: **purple**; dragon's blood: red |
| sedesert | dragon's blood: red; lichen (unnamed) |
| shighlands | rosette lichen |
| swbay | dragon's blood: red; ironbark tannin |
| swlowlands | mangrove bark: red-brown (dyes nets) |
| throne | alecap (Zeijani): **purple**, also mural pigment; nothing else |
| the rest | none: crater-drylands, eastabyss, ehighlands, geyser, hyperjungle, nwlowlands, xanadu, ringisles |

## 2. Proposals

One for every biome with none, and one more where the region's own colour is missing. Colour comes first.

| Biome | Region colour (`LORE.md` section 10) | Proposed dye | Source | Colour |
|---|---|---|---|---|
| crater-drylands | Scyvoi: none recorded; fire country | **Burn-black**: lampblack from the char of the last fire, set with frill-tree gall | soot, plant gall | black |
| eastabyss | red lacquer, teal and gold | **Abyss lac**: scale insects on the jungle trees (red lacquer and a carmine); teal from salt-flat copper (below) | insect | red |
| ehighlands | (Reed Lake: madder, ochre, black) | **Cushion cochineal**: scale insects on the thorn cushions; tola gives a yellow | insect, plant | crimson |
| geyser | (Highlands: black, red, teal) | **Flame-streamer orange**: the mat pigment of the run-off; sinter **sulfur** yellow from the fumaroles | alga, mineral (sulfur) | orange, yellow |
| hyperjungle | Iziz: orange, teal, cream; Girder | **Sunseed annatto** (an understorey shrub's seed pulp) orange; **jungle indigo** (a vine) teal-blue | plant | orange, blue |
| nwlowlands | (Dilihan, unplaced) | **Ghost-gum leaf**: eucalyptus-style leaf dye, gold to rust with an alum mordant | plant | gold, rust |
| ringisles | Islanders: bark, sand, sea teal | **Reef teal**: a reef-flat sponge or snail; **tar black** from the tar seep for tapa lines | mollusc, mineral (oil) | teal, black |
| throne | Zeijani: alecap purple, ochre, rust | **Fumarole ochre and rust**: iron-oxide clays from the stained white clay round the fumaroles | mineral (iron) | ochre, red |
| xanadu | saffron, maroon, turquoise, gold | **Vale saffron** (a crocus; also a spice) saffron; maroon from agate-wood bark | plant | saffron |
| swbay | Voth: **deep purple**, green and gold (purple is not in swbay) | **Bay purple**: a murex-like bay snail, as Tyrian purple; weld for the gold | mollusc, plant | purple, yellow |
| swlowlands | Dalab: terracotta, cream, turquoise | **Hill terracotta**: red-earth clay and madrone root; turquoise from copper | mineral (iron), plant | terracotta |
| ebadlands | Yuni: yellow (has it); **the Order: blue** | **Valley woad**: a blue from a canyon-floor plant | plant | blue |
| nwbay | **Hykkousoi** (Ys is their capital): gold, pale linen, **pale blue** (owner), slate blue | **Aril blue**: the traveller's fan's electric-blue arils, thinned to a pale sky blue; slate blue is the same dye overdyed with ironbark tannin; gold from weld | plant (the kit's own fruit), plant | pale blue, slate, gold |
| nhighlands | **Rustic Clansmen**: falu red, red-check; Painted Men: black, red, teal | **Plaid palette**, section 4: the grey alder's red and black (has), **falu red** from iron ochre, **clan woad** (blue), **heath broom** (yellow), a moss-and-lichen green | plant, mineral (iron) | red, black, blue, yellow, green |

Not needed: nwbay, nhighlands, rift, sedesert, shighlands (have a dye; red, black or purple suffices; teal for the Highlands
and Ys's colours are not recorded, so no proposal until they are).

## 3. From the resource nodes (mineral dyes, no plant)

| Node (`kits/resources`) | Dye | Colour | Biomes that have one near |
|---|---|---|---|
| iron | red ochre, rust | red, ochre | throne (clay), swlowlands (terracotta), any iron outcrop |
| copper | verdigris, malachite | green; azurite is blue | eastabyss (salt-flat brine), swlowlands (turquoise) |
| sulfur | sulfur yellow | yellow | geyser, ebadlands (sulphur flats), throne |
| oil seep | bitumen, tar black | black, brown | ringisles tar seep, Locus |

## 4. Palettes and plaids

A culture's **palette** is the set of dye colours its biome and trade give it. A **plaid** (a check or tartan: warp and weft
in several colours) needs a palette of at least three colours and a woven fibre (`cloth.weave.twill`, `cloth.wool`; wool is
animal, not a crop, and is not tracked here). The kit answers `canPlaid(biome)`.

**The free clans of the northern highlands (owner, 2026-10-18) can.** The Rustic Clansmen's colours are "falu red, red-check" (`LORE.md` section 10):

| Colour | Dye | Source in the kit |
|---|---|---|
| red | grey alder bark (has); **falu red**, the iron-ochre red of the clans' mine | `nhighlands` grey alder; iron node |
| black | grey alder bark (has) | `nhighlands` grey alder |
| blue | **clan woad**, the Valley woad grown cool (proposed above for ebadlands) | proposed; the dye plant's cool-range affinity |
| yellow | **heath broom** flower | proposed (`card.broom` is in the library) |
| green | broom over woad (an overdye), or moss and lichen | no new plant |
| cream | undyed wool | none |

That is five colours plus undyed: enough for a clan sett. The Painted Men take black, red and (with woad) teal for their formline.
The pattern for it is a sheet (`patterns/highlands/plaid`, a repeating check), not a texture of the dye. Library today:
`cloth.weave.twill` and `cloth.wool` are plain; no plaid sheet exists (`patterns/highlands/` holds friezes, lattices and
harlequins). I have not written the prompt: one plaid per clan would be a palette variant of one sheet. Say so and I will.

**The Hykkousoi** palette is gold (weld), pale linen (undyed flax, the cloth they are known for), pale blue and slate blue
(the arils): three colours with no red, so a pale-blue stripe, not a plaid.

## 5. Open

- **Where Voth, Iziz and Xanadu find theirs.** A culture's dye can be imported: Voth's purple does not grow in swbay. The kit
  should mark `trade: true` when a settlement uses a dye it cannot source locally.
- **Teal** is the commonest culture colour (Iziz, Dalab, East Abyss, Painted Men, Xanadu, Islanders) and has no plant source
  in the kits. The proposals give three: jungle indigo (hyperjungle), reef teal (ringisles) and copper verdigris (the node).
- **Art:** dyes are colours, not textures. Nothing owed.
