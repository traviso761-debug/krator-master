// TARGET: forts — the ground as drawn (core/drawn, CORE-IMPROVEMENTS.md item 28): the showcase's meadow (90-scene groundM: a
// 3200 m plane at y -0.05, centred on GROUND_C) registered as a KDRAWN grid, so the verify's eye check measures the eye against the
// drawn ground, and named so the harness finds it. [G data] but for the one name on the mesh.
if(typeof KDRAWN!=='undefined'){KDRAWN.add(KDRAWN.grid({x0:-1600,z0:GROUND_C-1600,dx:3200,dz:3200,nx:1,nz:1,h:[-.05,-.05,-.05,-.05]}));}
if(groundM)groundM.name='ground';
