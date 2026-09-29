// TARGET: theodiga — the dam arcology on its own, at the origin.
//
// Split out of the showcase because it is the heaviest single structure in the
// kit and wants its own detail pass (light tunnels, an irregular fin mosaic, a
// rougher canyon — see KNOWN_ISSUES.md). It shares every fragment in src/ with
// the kit target, so a fix to the core lands in both; only the site table and
// the view list differ.
const TITLE='Theodiga — dam arcology';
const GROUND_C=0;            // z centre of the ground plane and its paint
const ROWS={dam:{z:0,s:1150,r:900}};
const RUINS=Object.values(ROWS).flatMap(r=>r.t?[[r.s,r.z,r.r],[r.t,r.z,r.r*1.4]]:[[r.s,r.z,r.r]]);
