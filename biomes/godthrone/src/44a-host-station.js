// ================================================================= HOST — the station (the owner, 2026-10-26: the summit in two pages)
// One frame for the whole summit (45-host-stage.js); a station is the 9.6 km square of it a page draws and what it builds
// there. This file is station 1's; stations/wall/44a-host-station.js replaces it for the caldera wall (build.py --station wall).
//   key, title, hint   the page's names
//   centre, R, step    the square (x east, z south: its centre on the summit's frame) and the field's lattice (m)
//   inset              the vent's cone at 2.5 m (a KFIELD inset)
//   vent, portal       what the page builds: the vent (its lava, fume, fountain, hazards: 89b) and the sealed portal (86)
//   site               the scale model's pixel the shared sky stands at (4.23: the summit vent at 577.85, 932.59)
//   spine()            the LOD spine (the views' places), read once the frame is made
const STN={key:'vent',title:'Krator Godthrone: the summit vent',
 hint:'The Godthrone\'s summit vent (station 1): the nested pit 900 m deep in the caldera\'s floor at 22 km, a tenth of an atmosphere; the fissure vent fuming and, now and then, fountaining; the orange and black glass halo; the caldera\'s terraced wall 23 km off. N for night',
 centre:[-15590,15240],R:4800,step:10,inset:true,vent:true,portal:false,site:{px:577.85,py:932.59},
 spine:()=>[[VENT.x,VENT.z],xzOf(PIT.s+PIT.rimR,PIT.t),xzOf(PIT.s,PIT.t+PIT.rimR),xzOf(PIT.s-PIT.rimR,PIT.t),xzOf(PIT.s,PIT.t-PIT.rimR)]};
