# Krator Ancients

A procedural architectural kit for the ruined ancient civilisation of Krator —
33 structure types, each a builder that takes a site and a decay level and emits
geometry into a Three.js r128 scene. Cyclopean · Modernist · Organic.

Decay levels: 0 intact, 1 ruined, 2 toppled, 3 repaired, 4 rehabilitated and
still standing (the Projects), 5 **worn** (whole, weathered: `src/69w-worn.js`,
shown by the `worn` target). Any host can show a worn building by running a
builder at decay 0 and then `wornPass(G, wornLens(), plants)`.

```
python build.py                                     # src/ -> dist/ancients-kit.html
python jscheck.py .syntax-kit.js                    # does it PARSE? ~5 s
python verify.py dist/ancients-kit.html --assert    # invariants + budgets
./run.sh mylog --assert --views "Lab,Starport"      # background a screenshot run
python shotdiff.py shots/base shots/r1              # prove a refactor changed nothing
```

**Run `jscheck.py` between the other two, every time.** `build.py` cannot check
syntax — `node` is not installed — so it deliberately refuses to claim the file
parses. `jscheck.py` hands `build.py`'s own `.syntax-<target>.js` to headless
Chromium's `new Function()`, which parses and compiles without executing a line,
and reports the SyntaxError with its line number. Five seconds instead of a
seven-minute verify round that ends in an empty error panel.

A syntax error shows as `PAGE DID NOT INITIALISE` with an **empty** error panel.
**That heuristic does not cover every load-time failure.** A temporal-dead-zone
mistake — using a `const` above its own declaration — PARSES, so `jscheck.py`
passes it, and it fails at run time as a `ReferenceError` with the panel
populated. Empty panel means syntax; a populated one still means read it.

**Neither of them can see a placement error, and no invariant ever will.** A
constant declared inside a block and read outside it, geometry pushed to a merge
list after that list was merged, furniture placed inside a wall instead of on
it, a camera preset quietly aimed at the wrong site — all of these have shipped
here with every invariant green, because `REGISTER` runs before the throw and a
budget counter cannot see where a thing is. **Read the shots. Every round.**

* **`HANDOVER.md`** — work in flight, what stopped it, and how to pick it up.
* **`API.md`** — the contract. Read it before touching `src/`.
* **`KNOWN_ISSUES.md`** — what is broken and what is merely unfinished.
* **`NOTES.md`** — what changed, round by round.

Published: [kit](https://claude.ai/artifact/FSKTzZ3duwQ2zrbdEEqYYf) (current; [older kit build](https://claude.ai/artifact/1V5VxyNVxS2ZsEy9M7QJhE)) · [viewer of the new arcologies and towers](https://claude.ai/artifact/DUmUNgR1mKa66P4zD42X47) · [Theodiga](https://claude.ai/artifact/UT9zLRC3sigZRPbMCuhuQf)

`src/` fragments are concatenated in filename order into a single `<script>`;
every top-level name is shared by every fragment, and fragment order is
load-bearing. `.origin.html` is the single-file kit this repo was split out of,
kept so `build.py --assert-origin` can prove a refactor is output-neutral.
`three.min.js` is a pinned r128 copy that `verify.py` serves in place of the CDN.

## Level of detail (core/lod)

The page takes the shared LOD from `core/lod/` (read `core/lod/README.md`): `build.py` adds `09-lod.js` and
`97-lod-auto.js` to the fragment list, and 97 applies it to the finished scene. Big merged meshes are cut into chunks
that switch to clustered proxies with distance and are drawn combined (one draw per level in view); instanced sets keep
one draw call, drop their smallest instances by screen size and switch detailed shapes to a simplified version far off.
The originals stay the raycast targets, so the inspector and `_api` see full detail (checked: the inspector names the
same thing at nine screen points per view with LOD on and off). The panel (`l`, `measure`) reads draw calls and
triangles; `LOD.enabled=false` or `?lod=0` puts back the exact scene. `verify.py --assert` passes with LOD on.

Measured 2026-10-01, 1000x640, SwiftShader (`LOD.flush()` then `LOD.measure()`: one render of the main scene, so
calls and triangles as three.js counts them; sky passes not included):

| View | LOD off: calls / triangles | LOD on: calls / triangles |
|---|---|---|
| kit: Overview (opening) | 621 / 7.72 M | 571 / 2.09 M |
| kit: The Project foot | 100 / 6.41 M | 54 / 1.64 M |

Every target (worn, spire, canyon, ...) takes it the same way.
