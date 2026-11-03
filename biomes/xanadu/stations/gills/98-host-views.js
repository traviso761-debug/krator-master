// ================================================================= HOST — STATION gills: the views at Alph's head (found in the built records)
// The page opens at the out-breath's middle (89-host-sky.js); the in-breath views are the same places, read at another hour (#hour= in the panel's clock:
// the breath is a function of the clock, so a view's hour is the clock's). The names say which breath the view was framed for.
const VIEWS={};
(function(){const SG=STATION_GILLS,G=(x,z)=>terrainH(x,z),D=SG.DIR,P=SG.PERP;
 const at=(x,z,up)=>[x,G(x,z)+up,z];
 // a live gill's middle, from its lip downwind (the steam tipping over the meadow toward the camera's left)
 const live=SG.L.gills.filter(g=>g.alive).sort((a,b)=>(b.a1-b.a0)*b.r-(a.a1-a.a0)*a.r)[0];
 if(live){const a=(live.a0+live.a1)/2,x=live.c[0]+Math.cos(a)*live.r,z=live.c[1]+Math.sin(a)*live.r,ox=Math.cos(a)*(live.w*.5+70),oz=Math.sin(a)*(live.w*.5+70),ta=a+.035;
  VIEWS['A breathing gill at the Bhlo (the out-breath)']=[...at(x+ox+40*Math.cos(a+1.57),z+oz+40*Math.sin(a+1.57),28),live.c[0]+Math.cos(ta)*live.r,G(x,z)-10,live.c[1]+Math.sin(ta)*live.r];
  VIEWS['The same gill on the Suq (the in-breath: set the hour 6 h on)']=[...at(x-ox*.6,z-oz*.6,9),x,G(x,z)-live.d*.6,z];}
 // the pipes standing out of the glacier's edge: the highest standing pipe, from below it
 const hi=GILLS_DRAW.pipes.filter(o=>o.p.state==='standing').sort((a,b)=>b.p.y0-a.p.y0)[0];
 if(hi){const cx=hi.p.x-D[0]*120,cz=hi.p.z-D[1]*120;VIEWS['Ice pipes at the glacier\'s edge']=[...at(cx,cz,18),hi.p.x,hi.p.y0+hi.p.H*.6,hi.p.z];}
 // a pipe field: the closed gill's pipes, standing, broken and fallen
 const dead=SG.L.gills.find(g=>!g.alive);if(dead){const a=(dead.a0+dead.a1)/2,x=dead.c[0]+Math.cos(a)*dead.r,z=dead.c[1]+Math.sin(a)*dead.r;
  VIEWS['A pipe field (Phlū-phīlḍ): a closed gill']=[...at(x+Math.cos(a)*90,z+Math.sin(a)*90,35),x,G(x,z)+5,z];}
 // Alph's pool in the amphitheatre, the fountain forced up at the Bhlo
 {const h=SG.HEAD,cx=h[0]-D[0]*360+P[0]*60,cz=h[1]-D[1]*360+P[1]*60;VIEWS['Alph\'s breath: the fountain forced at the Bhlo']=[cx,SG.POOLY+70,cz,h[0],SG.POOLY+45,h[1]];}
 // down the chasm to the wildwood at the foot
 {const h=SG.HEAD,cx=h[0]+D[0]*140,cz=h[1]+D[1]*140;VIEWS['Down Alph\'s chasm to the wildwood']=[cx,G(cx,cz)+40,cz,h[0]-D[0]*1800,G(h[0]-D[0]*1800,h[1]-D[1]*1800),h[1]-D[1]*1800];}
 // the breath meadow, white with lime, downwind of the gills
 if(live){const a=(live.a0+live.a1)/2,x=live.c[0]+Math.cos(a)*(live.r+60),z=live.c[1]+Math.sin(a)*(live.r+60);VIEWS['The breath meadow (dew mats, salt cups, limewood)']=[...at(x+60,z+80,6),x-40,G(x-40,z-60)+2,z-60];}
 // the swarm from the flank above, the Vale in the haze beyond
 VIEWS['The Wāiṭ Gīl from above, the Vale in the haze']=[...at(1900,-2400,260),-1500,2600,3200];
 VIEWS['The wildwood at the foot']=[...at(-2300,2000,40),-1500,G(-1500,1300)+20,1300];
 VIEWS['Krator rising over the twins']=[...at(-600,1200,30),3500,7000,-6500];
})();
