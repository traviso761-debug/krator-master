# Enterprise: the pile

Improvements to `/enterprise` (`src/enterprise/`), not yet started. The owner wants all of them (2026-11-12); the order
within a section is a rough priority. Take an item out when it is done, and note it in the commit.

Done (2026-11-12): Q1 the mission smoke tests (`tools/test-enterprise.py`, `#mauto`), G2 damaged systems (`systems.js`,
and the `limp` orders), P1 the career (`ent-career`, the service record). Done (2026-11-14): everything else but Q6
and Q7 (the README's "Tenth pass"). Run `tools/test-enterprise.py` after any change
to the orders or the systems they use.

## Quality

- **Q6. Loading faster.** The hull's textures and planets are painted when the page loads. Do the painting in a
  worker, and cache the result in IndexedDB keyed by the code's hash, so a second visit starts at once.
- **Q7. A performance budget.** Frame time and draw calls measured in the busiest places (a starbase with traffic,
  the swarm fight) on a phone and a laptop, with numbers written down and held.
