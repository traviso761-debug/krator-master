# kits/islanders: the Islanders kit

The Ring Sea Islanders (catalog and core/tags culture `islander`, new on 2026-10-12): the denizens of the shores and islands
of the Ring Sea, a Polynesian and Austronesian people, skilled voyagers and lately pirates. The island kingdom of Kautoa once
rivalled the Hykkousoi for naval hegemony, before the Izani Empire; the Islanders are no longer one power, but they are
everywhere on the sea (LORE.md §6.17). Their sign is the **white island moon**; their colours bark, sand and sea teal.

Two related styles, one people (the owner's brief and reference folders, 2026-10-12):

- **The West** (`style:'west'`, the western Ring Sea): after the Indonesian *rumah*. Long houses on piles under saddle roofs
  whose ridges sag and sweep up into horns: Minangkabau gonjong spikes, Batak gables leaning out over the ends, Toraja prows
  carried on a post hung with buffalo horns. Black palm-fibre thatch, dark tarred timber, gables and boards painted red,
  black and white, carved red posts. The village assembly hall follows the owner's "hall" picture: seven horned roof tiers
  stacked into a spire over carved arcades and grand stairs.
- **The East, Kautoa** (`style:'east'`): after Sumba. Square houses on piles behind verandas, a wide skirt of golden grass
  thatch and a tower of thatch rising out of it to a ridge with carved finials, woven facades in nested diamonds, megalith
  tombs before the steps. Its village hall follows the owner's "plaza" picture (a hall on carved pillars and arches under
  horned roofs), its ceremonial square the "square" picture, and its **palace** the "palace" picture.
- **Shared:** carved ancestor posts, buffalo horns, carved figures, the white moon on discs and flags, the painted bands.
  **Scrap** on the poor in both: roofs patched or wholly of corrugated iron and tin (`roof.patch`), held down with tyres,
  walls of salvage, tarps and drums.

```
cd kits/islanders && python3 build.py                      # dist/islanders.html
python3 build.py --vendor-check                             # the engine against kits/scyvoi/src (must read OK)
python3 verify.py dist/islanders.html --assert             # invariants (headless Chromium, about two minutes)
python3 verify.py dist/islanders.html --cut --views "Rumah (West) - inside (cut-away)"
python3 ../../tools/textures/pack.py kits/islanders        # (from the repo root) after a change to materials.json
```

## What is in it

| Row | West | Kautoa (East) |
|---|---|---|
| Poor houses | scrap hut, fisher's hut, shared longhut | scrap hut, garden hut, shared house |
| Houses | rumah, Batak house, tongkonan | uma, twin-peaked house, clan house |
| Rich houses | rumah gadang, chief's house, great tongkonan | wealthy house, great uma, noble compound |
| Civic | assembly hall, ceremonial square, school | village hall, ceremonial square, school |
| Trade | rice farm, smallholding, rice barn, clan granaries, windmill, warehouse, smithy, market hall, kava house, trader's shophouse, weaver, potter, boat-chandler | farmstead, smallholding, granary, village granary, windmill, warehouse, smithy, market hall, palm-wine and kava house, trader's shop, ikat weaver, potter, chandler |
| Defence | palisade, palisade gate, watch tower, barracks | coral wall, town gate, watch tower, barracks |
| Palace | | the palace of Kautoa: a walled compound of seven courts (gate court, ceremonial court, the great audience hall under a 44 m ribbed spire, the inner court with the king's, queen's and heir's houses, the kitchens and granaries, the ancestors' shrine, the treasury and garden) |
| Harbours (on the shore) | fishing dock, dockyard (two slipway sheds, hulls on the slips, ring piers), harbour warehouse | fishing dock, dockyard (a double canoe half built, ring piers) |
| Gardens and stock | placeholder flora: coconut, banana, taro, breadfruit, rice paddy; the fauna kit's pig, hen, duck, water buffalo | |

Every building is tagged with culture, types, wealth, style (`west` | `east`) and role (and a job where one fits); every one
with an interior opens in the cut-away and is furnished from the catalog (`islander_common_*`, `islander_court_*`, the poor
and trade sets, scrap and the jobs file) through core/furnish. The windmills' sails turn. The larger Islander vessels (the
drua, the kora-kora, the pirates' lanong) are in `kits/ringsea`.

## How it is made

Forked from `kits/scyvoi`: the engine fragments are the Scyvoi kit's, VENDORED unchanged (`build.py --vendor-check`). The
kit's identity and palette are `src/26k-kit.js`; the shared toolkit `40-42` (piles, walls, the horned saddle roof and the
spire roof as thick shells with scrap patching, carved posts and finials, rooms); the West's houses `50`, its civic, trade,
harbour and defence buildings `52-55`; the East's `60`, `62-65`; the palace `66`; the shore and the sea `90h`. See `API.md`
for the fragments and the rules, `KNOWN_ISSUES.md` for what is open.

**Textures.** The library's thatch, bamboo, reed mat, corrugated iron, tin, carved wood, tarred timber, coral stone, sand and
the tapa sheet (`materials.json`). The painted motifs are canvas STAND-INS (`28-is-paint.js`) until the owner's sheets come;
the prompts are in `core/materials/PLAN.md` (Islanders).
