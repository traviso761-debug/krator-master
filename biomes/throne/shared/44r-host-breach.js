// ================================================================= HOST — the Rheoliths' breach in the ground (2026-11-23; biomes/rheolith, PLAN.md section 8)
// THRONE_BREACH(P, h, x, z): the ground h at (x, z) with a breached throat cut into it, the profile the kit's own page cuts (biomes/rheolith
// src/45-host-stage.js, "THE BREACHED THROAT"): a raised collar rim (P.rim), a stepped bench down to -4.8 m, and the conduit's shaft to P.floor,
// fluted, all measured from the ground where it is cut (a host's ground is not the kit's flat floor at 0). P {x, z, r, throatR, floor, rim}; null:
// the ground unchanged. Before the stage (45) and the land (47), which cut it into their terrainH; the kit then lays its wall guilds on the shaft's
// walls (RHEO.build's pitY: the rim's height there). Pure: no THREE, no DOM.
function THRONE_BREACH(P,h,x,z){if(!P)return h;const dx=x-P.x,dz=z-P.z,ang=Math.atan2(dz,dx),r=Math.hypot(dx,dz)/(1+.08*Math.cos(3*ang+.4));
 if(r>=P.r*1.65)return h;const sm=(a,b,v)=>{const t=Math.min(1,Math.max(0,(v-a)/(b-a)));return t*t*(3-2*t);},mx=(a,b,t)=>a+(b-a)*t;
 if(r>=P.r)return h+P.rim*sm(P.r*1.62,P.r*.96,r)*sm(P.r*.58,P.r*.95,r);
 const shelf=mx(-4.8,P.rim*.78,sm(P.throatR*1.55,P.r,r)),shaft=mx(P.floor,-4.8,sm(P.throatR*.52,P.throatR*1.55,r)),
  flute=.45*Math.sin(5*ang+r*.25)*sm(P.r*.9,P.throatR*.7,r)*sm(P.throatR*.4,P.throatR*.8,r);
 return h+(r<P.throatR*1.55?shaft+flute:shelf+flute*.4);}
