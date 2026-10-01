// TARGET: launch — the Launch Arcology, intact and after it came back down.
//
// SimCity 2000's Launch Arcology: the one that is also a vehicle. A blast table
// with six flame trenches, a skirt held clear of its own pad by twelve
// hold-down clamps, seven bells on a thrust plug, 364 m of occupied body with
// terraces and galleries on it, a gantry collar on six lattice masts whose
// umbilical arms double as the city's front door, and a payload shroud where a
// roof would be. The ruin is the half that earns the type: it went, and it came
// back down, and everything about the site is the consequence of that.
const TITLE='Launch Arcology — the city that meant to leave';
const GROUND_C=0;
const DECAYS=[0,1];
// s=1500 puts 3000 m between the two sites; the berm toe is at 666 and the
// fallen shroud panel lands at 752, so r=820 covers everything either site
// actually occupies without the two paint discs touching.
// Two rows. The near row is the arcology itself; the far row is the SAME pad
// from the same seed with the vehicle left out, so you can walk the blast table
// and see what the gantry actually has to clear. The rows are 2000 m apart and
// each site paints r=820, so the discs clear each other by 360 m.
const ROWS={
 launch:{z:0,s:1500,r:820},
 launchpad:{z:2000,s:1500,r:820},
};
// The intact site is at -s and the ruined one at +s (see SITEX in 90-scene.js).
// The ruin gets the wider greening: it is the one the plain has had time to
// take back, and its debris field reaches 850 m from the axis.
const RUINS=[[-ROWS.launch.s,0,ROWS.launch.r*.80],
             [ROWS.launch.s,0,ROWS.launch.r*1.25],
             [-ROWS.launchpad.s,ROWS.launchpad.z,ROWS.launchpad.r*.80],
             [ROWS.launchpad.s,ROWS.launchpad.z,ROWS.launchpad.r*1.25]];
// the fifth argument is the pad flag: same builder, same seed, no vehicle
const EXTRA_BUILDERS={launch:buildLaunch,
                      launchpad:(sc,x,z,dd2)=>buildLaunch(sc,x,z,dd2,true)};
