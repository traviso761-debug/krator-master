/* ============================== 7. THE REGION HOST: core/region on the isles (S0, 2026-11-11) ============================== */
/* [G data] The isle demo's towns on core/simulation are run by core/region (core/region/00-region-core.js, KREGION): its
   parts were this page's 40-49 until core/simulation/PROPOSAL-LONGSONG-PINNACLE.md phase S0 lifted them, unchanged, so a
   second economy (Longsong's valley) runs on the same code. ISLE is their host: every part loaded after this line runs on
   it at once, where the page's own fragments ran before, and the isle's culture stays in ISLE.TUNE.sim (15). */
KREGION.use(ISLE);
