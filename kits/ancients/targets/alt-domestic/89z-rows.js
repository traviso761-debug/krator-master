// TARGET: alt-domestic — the from-scratch ALTERNATES of the domestic group's
// types, after the user's arco1/arco2 reference sets (src/8ak-alt-*.js; the
// images each one draws on are listed in targets/alt-domestic/NOTES.md).
//
// One row per builder, running north (+z). Along each row the four decay
// states stand west to east in reading order:
//   intact (x = -s) · rehabilitated (x = 0) · ruined (x = +s) · reclaimed (x = t = 2s)
// SITEX in 90-scene.js puts decay 2 at `t`, which in the kit means "toppled";
// for these builders decay 2 is RECLAIMED (the ruin, overgrown and lived in).
// This is a dev target: the coordinator gives the types their kit rows.
const TITLE='Ancients — alternate domestic types (arco1/arco2)';
const DECAYS=[0,3,1,2];
const ROWS={
 adWave:  {z:   0,s:  80,t: 160,r: 40},
 adBridge:{z: 200,s:  80,t: 160,r: 40},
 adFins:  {z: 450,s: 190,t: 380,r:110},
 adAmph:  {z: 800,s: 170,t: 340,r: 95},
 adFuel:  {z:1100,s: 110,t: 220,r: 55},
 adRadar: {z:1330,s:  90,t: 180,r: 45},
 adDish:  {z:1580,s: 120,t: 240,r: 60},
 adMega:  {z:2350,s: 900,t:1800,r:420},
 adFac:   {z:3200,s: 380,t: 760,r:200},
 adLab:   {z:3800,s: 230,t: 460,r:120},
};
const EXTRA_BUILDERS={};
for(const[k,f]of[['adWave','buildAltWaveHouse'],['adBridge','buildAltBridgeHouse'],['adFins','buildAltFinApartments'],
 ['adAmph','buildAltAmphitheater'],['adFuel','buildAltFuelStation'],['adRadar','buildAltRadar'],['adDish','buildAltDish'],
 ['adMega','buildAltMega'],['adFac','buildAltFactory'],['adLab','buildAltLab']])
 if(typeof self[f]==='function')EXTRA_BUILDERS[k]=self[f];else delete ROWS[k];
const GROUND_C=1900;
// greening under every ruined and reclaimed site
const RUINS=Object.values(ROWS).flatMap(r=>[[r.s,r.z,r.r],[r.t,r.z,r.r*1.2]]);
