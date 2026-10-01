# Jimjam City Kit

This is the staged Jimjam architecture kit for Krator. Round 1 is a reviewable helper gallery: masonry, arcades, domes, staged spires, a raised sunray plaza, chimneys, and patterned brick shafts. Later rounds add the real settlement and its temple alignment test.

## Build and preview

```sh
python3 build.py
python3 verify.py dist/jimjam-kit.html --assert --views "Opening — three-quarter,Shaft patterns — eye level" --out shots
```

The page uses the local, pinned Three.js file. `verify.py` and `jscheck.py` are unchanged copies of the repository harnesses.

## Round 1 review

Select **Shaft patterns — eye level** to compare spiral, chevron, diamond, ogee, fleur, and tracery shafts. Each pair shows a plain relief surface and its raised brick relief. **Solstice alignment is pending** because this round has no temple axis. The initial sky view uses the selected sunrise setting.
