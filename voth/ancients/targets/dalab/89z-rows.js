// TARGET: dalab — the ancient genetic-engineering lab domes at the centre of
// Dalab. DOMES ONLY: no settlement, mounds, streets or life layer.
// Its own target because it belongs to the Dalab world, not to this kit.
const TITLE='Dalab — the ancient lab';
const GROUND_C=0;
const DECAYS=[1];                     // this complex is never shown intact
const ROWS={dalab:{z:0,s:0,r:1730}};   // was 420; the compound is now 4.105x
const RUINS=Object.values(ROWS).flatMap(r=>r.t?[[r.s,r.z,r.r],[r.t,r.z,r.r*1.4]]:[[r.s,r.z,r.r]]);
const EXTRA_BUILDERS={dalab:buildDalab};
