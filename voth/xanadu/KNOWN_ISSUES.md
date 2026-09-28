# Xanadu — known issues

Open items are `- [ ]` lines; build.py prints them.

- [ ] Vendored fragments are copied from `../highlands/src`, which itself carries the Iziz/Ancients drift noted in the Highlands KNOWN_ISSUES; re-vendor all three kits together.
- [ ] `vnStairs` (vendored) centres its run at `run/2` while treads span `steps*.32`; the kit uses its own solid `xnFlight` everywhere instead.
- [ ] Windows placed on a battered face sit on the base plane of the block, so on tall single blocks (the fortress tower, the strong room) the surround boards can be a few centimetres inside the lean; builders offset them by hand (`hw-.05`).
