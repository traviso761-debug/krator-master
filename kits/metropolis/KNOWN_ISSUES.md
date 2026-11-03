# kits/metropolis: known issues

- [ ] **One Arc run crashed the page on load** (`Page.goto: Page crashed`), once in about ten; the retry passed. Not understood; it may be the same fault as above.
- [ ] **The shell has no shadow and casts none,** and neither does the hero; the page has no sun shadows. The valley may want them.
- [ ] **Ruin states:** `intact` and `gutted` (crown gone, with breaches) are built, for both buildings, as a test of coverage. The other five are designed in the records and wait on the go.
- [ ] **Bath rooms are unfurnished:** the catalog's Ancient pieces hold no bath; `kits/catalog` is owed one.
- [ ] **Single 4 m wall tile on a 230 m tower** reads as noise: `metal.ancient.white.macro` is owed (`core/materials/PROMPTS-NEEDED.md` section 31).
- [ ] **Site:** the sky stands at `core/atmos`'s default site. The valley's own comes with the valley.
- [ ] **The Ledger's reception** is a named room with the antechamber's furniture, in the middle bay of the arcade; the hall round it is still the wide corridor.
- [ ] **Soffits under 200 m** break up in the shell, inside the hero's range: a problem only if the switch is held closer than 300 m.
- [ ] **The soffit's edge** where the Spindle's neck meets the lamp is stepped in the shell under about 200 m: the switch from the side map to the soffit map is a hard test.
- [ ] **Software GL loses the context, on every page here:** on this machine's SwiftShader, `core/host/example/host-example.html` (the host's own small example, nothing of this kit) loses its WebGL context in 3 runs of 3, a fraction of a second in, as this page does. So it is the harness's software GL or this Chromium, not the metropolis page; `tools/harness.py` (the `core-verify` work) owns it. Run this page with `KRATOR_GL=gpu`.
- [ ] **The small flats' baths are long:** a two-bed flat's service end is a closet at the corridor and the bath at the wide end; a one-bed flat's sector is too narrow at the corridor for a closet (under 1.1 m), so its bath still runs about 1 m by 8 m.
- [ ] **The lift's leaf does not open:** the ride carries the walker up the shaft, and the drawn leaf stays shut (it does not block).
