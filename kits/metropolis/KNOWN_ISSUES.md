# kits/metropolis: known issues

- [ ] **Software GL loses the page's context.** On SwiftShader the page loses its WebGL context about a second in, on most runs, then restores it blank: the shells
  and impostors are gone and the page shows shader errors with empty logs (the context is dead, not the shader: the same sources compile on a fresh context). It happens with
  the shell bake, the shell draw, the sky and the library maps each switched off (`?nobake`, `?noshell`, `?nosky`, `?mat=proc`), so none of those is the cause, and the cause is not found. **It does not happen on the Arc 140T.**
  Run `verify.py` with `KRATOR_GL=gpu`. CI's software GL will not pass this page until it is found.
- [ ] **One Arc run crashed the page on load** (`Page.goto: Page crashed`), once in about ten; the retry passed. Not understood; it may be the same fault as above.
- [ ] **The shell has no shadow and casts none,** and neither does the hero; the page has no sun shadows. The valley may want them.
- [ ] **Ruin states:** `intact` and `gutted` (crown gone, with breaches) are built, for both buildings, as a test of coverage. The other five are designed in the records and wait on the go.
- [ ] **Bath rooms are unfurnished:** the catalog's Ancient pieces hold no bath; `kits/catalog` is owed one.
- [ ] **Single 4 m wall tile on a 230 m tower** reads as noise: `metal.ancient.white.macro` is owed (`core/materials/PROMPTS-NEEDED.md` section 31).
- [ ] **Site:** the sky stands at `core/atmos`'s default site. The valley's own comes with the valley.
- [ ] **Stairs do not walk:** the lift (the list, or `,` and `.`) is the way between storeys; the stairs are drawn, with no `KWALK` strip. A lift door is a shut leaf: the lift is a jump, not a ride.
- [ ] **The Ledger's reception** is a named room with the antechamber's furniture, in the middle bay of the arcade; the hall round it is still the wide corridor.
- [ ] **Soffits under 200 m** break up in the shell, inside the hero's range: a problem only if the switch is held closer than 300 m.
- [ ] **A hero with its doors:** the street does not block on a closed tower: a walker passes a hero's skin until a storey opens inside it.
