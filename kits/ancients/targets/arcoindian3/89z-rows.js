// TARGET: arcoindian3 — Arcoindian III, the sheer cliff-niche arcology over a canyon river, intact (d=0) and ruined (d=1).
// Synthesises the barrel-vaulted stepped arch spine (Ref 1), the clustered vertically-fluted chalice towers and sweeping
// parabolic arch skybridges (Ref 2), and the warm rose-terracotta moon-gate oculus courts with paired emerald-mosaic
// plunge and reflecting pools (Ref 3), with a full [G data] Work/Live/Recreation interior program and modern ruin guide.
const TITLE='Arcoindian III — the cliff-niche arcology';
const GROUND_C=-90;
const DECAYS=[0,1];
/* Each canyon escarpment spans 2 160 m (-1 080 to +1 080); s = 1 550 places 3 100 m between axes (940 m clear gap) */
const ROWS={
 arcoindian3:{z:0,s:1550,r:1050}
};
const RUINS=[
 [-ROWS.arcoindian3.s,80,ROWS.arcoindian3.r*0.48],
 [ ROWS.arcoindian3.s,80,ROWS.arcoindian3.r*0.62]
];
const EXTRA_BUILDERS={arcoindian3:buildArcoindian3};
