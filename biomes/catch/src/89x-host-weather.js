// ================================================================= HOST — the weather (core/atmos, ATMOS.bindWeather)
// A hot dry basin (PLAN.md section 3): the climate is dry, so the ground never wets (no grounds named) and no snow lies;
// the selector offers core/atmos's five modes (auto, clear, rain, storm, fog: the rare storm off the walls) and the page
// opens clear. The black storms (the karaburan, PLAN.md section 3) are the dust's (89a) at a gale: core/atmos has no
// dust-storm mode yet (KNOWN_ISSUES.md).
ATMOS.bindWeather({climate:{wet:false},sun,hemi:HEMI,fog:scene.fog,mode:'clear'});
