# settlements/qiblai: known issues

- [ ] **The people by ring are off the plan's table** (estimated per building, `QC_PEOPLE` in `targets/city/89zq-qc-site.js`):
  about 15,200 against ~12,000; the clergy ring holds ~3,600 (plan 2,400: its blocks fill with colleges), the kora ~1,450 (plan
  3,000: the hostels and halls count only their staff), the lay rings ~9,800 (plan 6,000; 8,600 under the hashed gardens, before
  the symmetric fade took 64 garden blocks and 44 courtyards for its 87 gardens). `verify.py` reports it as a budget.
  To calibrate with the owner: the people a building holds, the fade's table (`QC_GARDEN`, `QC_COURT`), the infill's gaps.
- [ ] **The flora is a stand-in.** Xanadu's page carries the Vale of Xanadu biome (ginkgo, cloud pine, flame cypress, cacao...),
  bound here with the city's own mask (the country, the gardens, the odd yard tree) and a wet, lowland climate; the site's Af
  lowland biome kit is still to bind (PLAN.md Q7b). The country's plants thin out far from the LOD origins.
- [ ] **The river is a ribbon.** Nahr ash-Shalalat is a flat water plane in a cut channel; its cataracts as core/water flow, and
  the ground from the open world's cut (`cut_site.py`), are still to do (PLAN.md Q7b). The country is a gentle plane.
- [ ] **The inner gates sit on the upper terrace** with an ashlar block under them; the avenue's climb through each gate is the
  ground's slope, not a stair (`qb_terrace_stair`, PLAN.md Q7a, is not built yet).
- [ ] **The page names its build `erewhon`** in core/host and core/tags' registry when `window.CITY` is set (Xanadu's
  `99-start.js`, `91t-xanadu-tags.js`); the city pre-makes `KTAGS.page` as `qiblai`, but the host's label stays Erewhon's until
  Xanadu's page takes a name from its target.
- [ ] **Life (Q7e), the open world (Q7f), the Godot export and the gallery (Q7g)** are not started.
