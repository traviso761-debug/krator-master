// TARGET: arcbeam — the bridge city, intact and ruined.
//
// Its own target because it brings its own site: a 3 400 m gorge, a plateau on
// both rims and a graded skirt down to the plain. Nothing about that fits the
// kit's row layout, and the type is a 700 k-triangle megastructure on its own.
const TITLE='Arcbeam — the bridge city';
const GROUND_C=0;
const DECAYS=[0,1];
// The built work reaches x = +/-600 from its own axis and the plateau skirt runs
// to 1 600. s = 1 900 puts 3 800 m between the two axes, which leaves exactly
// 600 m of open plain between the two skirts — they come close but never
// overlap, and no ground-paint disc reaches the other site.
//
// It was 2 100. The scene's fog is FogExp2 at 0.00022, so a camera far enough
// back to frame both cities sat 5 800 m off and the transmittance there is 0.20:
// the comparison shot came back as two ghosts in the haze. 3 800 m apart can be
// framed from 3 470, where it is 0.56.
const ROWS={
 arcbeam:{z:0,s:1900,r:1250},
};
// The intact site is at -s and the ruined one at +s (see SITEX in 90-scene.js).
// The ruin takes the wider greening: the gorge has had time to grow over, and
// its debris fan reaches ~460 m from the axis on the canyon floor.
const RUINS=[[-ROWS.arcbeam.s,0,ROWS.arcbeam.r*.72],
             [ROWS.arcbeam.s,0,ROWS.arcbeam.r*1.10]];
const EXTRA_BUILDERS={arcbeam:buildArcbeam};
