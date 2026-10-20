// ================================================================= 84. THE PALACE HILL (the palace page's ground)
// [G data] The palace citadel on its own: the palace hill's mesa as the city has it (84-city-geo.js HILLS.palace: a level top
// of radius 96 standing 40 m over the city, an escarpment about 34 m wide), centred on the page's origin with the citadel
// gate to +z, so the citadel's frame (78q IZPAL.frame) is x = v, z = -u. The top's edge wanders a little by bearing (two
// sines: the crags), never inside r 92, so the curtain wall (r 84, 7 m thick) stands on the top. The Mech Gate's cutting
// (BLUEPRINT.md: "the Mech Gate opens on the hill's rear face onto a ramp road") is a notch 22 m wide in the rear face,
// down to the city's level, from the tunnel's end (u 112) out. terrainH is reassigned (10-core.js declares it; the city
// does the same in its 84-city-geo.js).
const PALGEO={cx:0,cz:0,top:40,r0:96,r1:132,gx:0,gz:1,cutHalf:11,cutU:112};
function palGeoS(t){t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);}
function palGeoEdge(a){return PALGEO.r0+2.2*Math.sin(5*a+.7)+1.4*Math.sin(11*a+2.1);}
function palGeoH(x,z){const dx=x-PALGEO.cx,dz=z-PALGEO.cz,r=Math.hypot(dx,dz),a=Math.atan2(dz,dx),e=palGeoEdge(a),w=PALGEO.r1-PALGEO.r0;
 let h=r<=e?PALGEO.top:r>=e+w?0:PALGEO.top*(1-palGeoS((r-e)/w));
 // the cutting: u = -(dx gx + dz gz), v = dx gz - dz gx
 const u=-(dx*PALGEO.gx+dz*PALGEO.gz),v=dx*PALGEO.gz-dz*PALGEO.gx;
 if(u>PALGEO.cutU&&Math.abs(v)<PALGEO.cutHalf)h=0;
 return h;}
terrainH=palGeoH;
