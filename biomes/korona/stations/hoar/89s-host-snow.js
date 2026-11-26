// ================================================================= HOST (the hoar table only) - snow that lies
// core/atmos/fx/89-atmos-fx-snowcover.js (the owner, 2026-10-25: "add snow cover to the hoar station"): the table stands above
// 3,500 m in the high cold country, so old snow and hoar frost lie on whatever faces the sky: the pavement's flat tops, the
// cushions' crowns, the boulders' upper faces, patchy at the edges (the module's noise), the steep faces and the cliffs bare.
// The page has no weather (KNOWN_ISSUES.md, "No night"), so the cover is a base (SNOW_BASE), not a fall that builds; the air is
// frozen, so a fall added later will not melt by day. window._snowDepth(d) adds fresh snow over the base (a winter view).
const SNOW_BASE=.32;
if(!ATMOS.snow){ATMOS.snowCover({base:SNOW_BASE,frozen:true});ATMOS.snowOnScene(scene);}   /* the weather (89a: ATMOS.bindWeather, STAGE.climate cold and frozen, STAGE.snowBase) starts the cover first, falls building on it */
window._snowDepth=d=>{ATMOS.snow.depth=d;};
