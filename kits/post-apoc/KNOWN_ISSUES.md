# Post-Apoc set: known issues

Open items are lines starting `- [ ]`; `build.py` prints them on every build.

- [ ] Cultural packs are stand-ins built from the brief (Iziz orange awnings, Voth banners, Republic triskelion); replace the glyphs with each culture's real sigils when settled.
- [ ] Nothing animates except turbines and fans (`spin()`); flags and cloth do not flutter, fires do not flicker, no smoke.
- [ ] No night pass: `glow` pieces are unlit-bright at all hours; there is no light volume.
- [ ] No collision or path data for the set: buildings publish their bounding box (`REG[i].bbox`) and nothing else.

## Fixed / measured
