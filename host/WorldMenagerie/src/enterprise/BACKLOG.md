# Enterprise: the pile

Improvements to `/enterprise` (`src/enterprise/`), not yet started. The owner wants all of them (2026-11-12); the order
within a section is a rough priority. Take an item out when it is done, and note it in the commit.

Done (2026-11-12): Q1 the mission smoke tests (`tools/test-enterprise.py`, `#mauto`), G2 damaged systems (`systems.js`,
and the `limp` orders), P1 the career (`ent-career`, the service record). Done (2026-11-14): everything else
(the README's "Tenth pass"), the last two being Q6 (workers and a cache) and Q7 (`BUDGET.md`). The pile is empty.
Run `tools/test-enterprise.py` after any change to the orders or the systems they use, and
`tools/enterprise-budget.py` after any change to what is drawn.
