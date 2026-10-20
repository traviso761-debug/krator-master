// TARGET: city — Iziz. The site table is empty: 90a/90b place everything from the layout; the showcase block in
// 90-scene is skipped (window.CITY). TITLE is read by build.py for the page <title>.
const TITLE='Iziz';
// every building with an item in the Iziz interior sets is hollow (69e-vern-hollow.js): its walls, storeys and stairs are
// drawn and walkable, its doors open (69e5, 95j); the civic and Ancient ones are furnished (95i-iziz-interiors.js).
// ?interiors=0 draws them solid, as the city was before 2026-10-19
VERN.interiors=typeof KratorInteriors!=='undefined'&&!/[?&]interiors=0\b/.test(location.search);
var IZS_HOLLOW={temple:VERN.interiors,arena:VERN.interiors,guilds:VERN.interiors,sky:VERN.interiors,apts:VERN.interiors,houses:VERN.interiors,fuel:VERN.interiors,trans:VERN.interiors,alt:VERN.interiors,hotel:VERN.interiors,cultural:VERN.interiors};   // the temple and the arena are built open for their interiors (77z; 78t, 78u); the two Ancient guilds' lab and station too, set per call (77-anc-guilds.js vqWrapKit; 78v); the skyscrapers, apartments, houses D-F, the fuel kiosk and the Ancient transplants (52-58, 82, 64, 84; 78-transplant.js; 78v/78w)
const GROUND_C=0;
const SITES=[];
