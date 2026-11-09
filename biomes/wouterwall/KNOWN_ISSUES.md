# wouterwall — known issues

- [ ] **The far land stops at the region's box.** `region/far.py` casts the sky's ridges from the `w outer wall` cut, whose box ends at
      px 270 (5.1): the airless crest (10 km and more) further west is not in the profile, so the west horizon shows the bench's upper
      steps but not the crest standing over them. Fix: cut again with `--add` a polygon reaching the crest (or the godthrone's region)
      and rerun `far.py`.
- [ ] **The terraces are on an 8 m grid.** `KRELIEF.terraces` steps 3.2 m; on the steeper flanks a riser falls between two grid
      points and reads as a slope. A finer mesh over the terraced zone only would sharpen them.
- [ ] **The loess's soil bands are a shader stand-in.** The plan draws the loess as `KSTRATA`'s `loess` recipe draped on the ground
      (`KSTRATA.vary`/`drape`), which needs the core amendment PLAN.md section 8 names (a baked offset texture). Until then the
      ground shader darkens faint bands by height on the steep (`47-host-land.js`, aW2.w).
- [ ] **No cave-house mouths** (`KCARVE`, PLAN.md section 2's last row): the gully walls are whole.
- [ ] **The flora is the NW outer wall's alone (W1).** The dust towers and the puya spikes (section 3, `card.puya` delivered) and the
      lowlands' species (crag pine, needle cypress, candle birch, tussock, saltbush; tier cedar, ember manzanita) are W3. The terraces
      carry no crop yet (section 6).
