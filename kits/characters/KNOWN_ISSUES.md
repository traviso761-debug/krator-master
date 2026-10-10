# kits/characters: known issues

- **Loose garments are cinched at the cuts.** Every donor's surface near a cut is morphed onto the median ring there
  (`SEAMS` in make_pieces.py), so pieces from any two outfits meet. A loose garment at a cut (Styv's robe sash at the
  waist) gets pulled in and flares out below it. A per-outfit "loose" flag (overlap only, no pull) is not done yet.
- **The cut follows bone weights, not garments.** Belts, skirts and coat hems weighted to Hips go to the legs slot;
  the bronze outfit's scale skirt is part of its legs.
- **Face landmarks are found, not placed.** The nose tip comes from the head's front profile; the other nine points
  are fixed offsets from it. On a head with a big moustache (Styv) or a helmet (hide) they sit a little off, so the
  face sliders move a slightly different patch. Helmets hide most of what the face sliders do.
- **Skin shows the donor's own tone.** A head from one outfit and bare hands from another can differ in skin tone.
- **Hair and beards are part of each head.** No separate hair or beard choice yet.
- **Mesh density.** Meshy's remesh gives ~25k triangles per donor; the hide donor (fur) is 42k vertices. Fine for a
  hero, heavy for a crowd.
- **Clips are Styv's and Phil's**, made for their bodies: big leg or arm sliders can push a hand through a hip or a
  knee through a skirt in motion.
