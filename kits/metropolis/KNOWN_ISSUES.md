# kits/metropolis: known issues

- [ ] **Software GL loses the page's context.** On SwiftShader the page loses its WebGL context about a second in, on most runs, then restores it blank: the shells
  and impostors are gone and the page shows shader errors with empty logs (the context is dead, not the shader: the same sources compile on a fresh context). It happens with
  the shell bake, the shell draw, the sky and the library maps each switched off (`?nobake`, `?noshell`, `?nosky`, `?mat=proc`), so none of those is the cause, and the cause is not found. **It does not happen on the Arc 140T.**
  Run `verify.py` with `KRATOR_GL=gpu`. CI's software GL will not pass this page until it is found.
- [ ] **One Arc run crashed the page on load** (`Page.goto: Page crashed`), once in about ten; the retry passed. Not understood; it may be the same fault as above.
- [ ] **Roofs and soffits are not in the map** (`PLAN.md` section 3): a heightfield holds one surface per `(theta, y)`. The disc's top and underside show the rim's colour, seen from
  above or from under. A second map from the top (`y` by `(x, z)`), the ray inside both, would answer the top. Not built.
- [ ] **The shell has no shadow and casts none,** and neither does the hero; the page has no sun shadows. The valley may want them.
- [ ] **A tier switch in the tiers view is hard:** the heroes there share their geometry, and `BIO.lodFade`'s box lives on the geometry, so only the Switch views dither. The pool wants a per-hero
  uniform before a city can walk through the fade.
- [ ] **Ruin states:** `intact` and `gutted` (crown gone, with breaches) are built, for both buildings, as a test of coverage. The other five are designed in the records and wait on the go.
- [ ] **The hero's walk:** the storeys are drawn on demand with their furniture, but no `KWALK` floors are registered, so F (walk) stays on the ground. The views are placed cameras.
- [ ] **`verify.py --assert` fails one check:** the hydroponics storeys' greenhouse recipe wants a `coldFrame` piece this page's bundle does not carry (`spindle L31`, each room). The beds are placed; the rest of the sampled storeys pass.
- [ ] **Bath rooms are unfurnished:** the catalog's Ancient pieces hold no bath; `kits/catalog` is owed one.
- [ ] **The Ledger's lobby:** the arcade storey is the bar plate with a wide corridor, not yet a designed hall with a reception.
- [ ] **The core door:** the Spindle's core has one door to the ring corridor per storey, and lift and stair doors are not cut in the shaft walls.
- [ ] **Single 4 m wall tile on a 230 m tower** reads as noise: `metal.ancient.white.macro` is owed (`core/materials/PROMPTS-NEEDED.md` section 31).
- [ ] **Site:** the sky stands at `core/atmos`'s default site. The valley's own comes with the valley.
