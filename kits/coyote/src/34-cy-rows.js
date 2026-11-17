/* ==================== kits/coyote 34: the Coyote rows in core/hamlet and core/camp (plain data, [G data]) ==================== */
/* PLAN.md sections 6 and 9 (C7). The settled tribes' rows live in core/hamlet/22-hamlet-coyote.js (`coyote`, `coyote_peak`,
   `coyote_tier`) and the nomad herders' row in core/camp/11-camp-coyote.js (`coyote-herder`, `KCAMP.coyoteProgram`). This
   fragment binds the kit's local names to those core rows so the sheet's settlement builders and tests read them in place. */
const CY_ROW_VALLEY = KHAMLET.CULTURES.coyote;
const CY_ROW_PEAK = KHAMLET.CULTURES.coyote_peak;
const CY_ROW_TIER = KHAMLET.CULTURES.coyote_tier;
const CY_CAMP_HERDER = KCAMP.CULTURES['coyote-herder'];
const CY_ROWS = {valley: CY_ROW_VALLEY, peak: CY_ROW_PEAK, tier: CY_ROW_TIER};
