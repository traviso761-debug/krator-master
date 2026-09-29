# Xanadu — known issues

Open items are `- [ ]` lines; build.py prints them.

- [ ] Vendored fragments are copied from `../highlands/src`, which itself carries the Iziz/Ancients drift noted in the Highlands KNOWN_ISSUES; re-vendor all three kits together.
- [ ] `vnStairs` (vendored) centres its run at `run/2` while treads span `steps*.32`; the kit uses its own solid `xnFlight` everywhere instead.
- [ ] Windows placed on a battered face sit on the base plane of the block, so on tall single blocks (the fortress tower, the strong room) the surround boards can be a few centimetres inside the lean; builders offset them by hand (`hw-.05`).

## Upstream: world-UV materials share one program (highlands, iziz, ancients)
`vWorldUV` in 69b-vern-mat.js installs an `onBeforeCompile` closure whose `toString()` is the same for every K, and
three.js uses that string as the program cache key — so all world-UV materials render at the K of whichever compiled
first. Xanadu re-hooks them (`xUVKey`, 71-xa-mat.js); the vendored file is left byte-identical. Port upstream by
building the hook with `Function()` or by setting `mat.customProgramCacheKey=()=>'wuv'+K` (and carrying it across
the clone in `kbake`).
