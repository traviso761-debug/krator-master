# kits/eternian: known issues

- [ ] **No library textures yet.** The kit draws in vertex colours (`material-records`: 0 from the library). P1 writes
      `materials.json` (lime, block, brick, stone, tile, celadon, timber, shutter, paving, bronze, verdigris, onyx) and packs
      `tex/`; the onyx, alabaster, titanium, pierced screen, talking heads, sign, circuit maze and face frieze are owed
      (`core/materials/PROMPTS-NEEDED.md` §8).
- [ ] **No culture pack in core/sockets** (`FURN_CULTURE('eternian', {pack: null})`): the State's banners (the gold
      closed-eyed face on black, green highlights) want an `eternian` pack and a closed-eyed-face symbol in
      `core/sockets/80-cultures.js` and `38-symbols.js`. P1.
- [ ] **The mask over the door is the toolkit's few-plane stand-in** (`etMask`); the head generator (P2) replaces it.
- [ ] **The flutes are thin at a distance**: `etFlutes` draws half-round reeds of at most 0.16 m; a fluted pier with a
      library normal map (P1) will read better.
- [ ] **The catalog's `verify.py --assert` fails on two generic fruit pieces** (`generic_fruit_bell_pod`,
      `generic_fruit_cherry`: materials missing stone, timber). Not this kit's: it fails the same without the Eternian
      file (checked 2026-10-20).
