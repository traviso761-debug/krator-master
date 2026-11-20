// TARGET: city — Marr (Porta Marr). The site table is empty: 90a/90b place everything from the layout;
// the showcase block in 90-scene is skipped (window.CITY). TITLE is read by build.py for the page <title>.
const TITLE = 'Marr — Ring Sea Port & Canal City';
VERN.interiors = typeof KratorInteriors !== 'undefined' && !/[?&]interiors=0\b/.test(location.search);
if (typeof window !== 'undefined') window.MARR_WALK = true;
var IZS_HOLLOW = { temple: VERN.interiors, arena: VERN.interiors, guilds: VERN.interiors, sky: VERN.interiors, apts: VERN.interiors, houses: VERN.interiors, fuel: VERN.interiors, trans: VERN.interiors, alt: VERN.interiors, hotel: VERN.interiors, cultural: VERN.interiors };
const GROUND_C = 0;
const SITES = [];
