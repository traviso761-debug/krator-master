# Dalab opt-in builders: lake, harbour, copper works, gene-houses and tithe barn

`75-dalab-lake-works.js` holds the sixteen Dalab building definitions requested by `settlements/nulab/PLAN.md` (sections 3.2, 7 and step N4) for Dalab's holds on the West Rift's great lake, rivers and mines:

- **The harbour set:** `nl_boatshed`, `nl_fishracks`, `nl_smokehouse`, `nl_slip`, `nl_ferry`, `nl_jetty`.
- **The copper works:** `nl_oreyard`, `nl_roastbed`, `nl_smelter`, `nl_foundry`, `nl_charcoal`, `nl_adit`.
- **The gene-houses and the tithe:** `nl_halls` (a compact daughter house of the Halls of Reformation), `nl_vats`, `nl_genebeds`, `nl_tithebarn`.

Opt-in (`core/hamlet/dalab/README.md` and `kits/xanadu/src/87k-xa-lake-trades.js` pattern): sitting in `opt/` keeps `settlements/dalab`'s own sheets byte-identical until it chooses to list them, while `settlements/nulab` (and `core/hamlet/dalab`) reads this fragment in place via `kit.json` `"external"`.
