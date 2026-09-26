// ================================================================= IZIZ CITY — the layout: rings, thoroughfares, gate roads, hill tops, parks
// Paints the primary network and the precincts into the canvases (85) and records the ROADS the placer will front
// buildings on. Order matters: everything painted here is "existing network" for the ancient grid (88) and the
// settler streets (90b), which connect to it. Nothing is placed here.
reseed(SEED_CITY+2);
const HILL=CITY.HILLS;
const HILLKEYS=Object.keys(HILL);
function arcPts(cx,cz,r,a0,a1,n){const pts=[];for(let i=0;i<=n;i++){const t=a0+(a1-a0)*i/n;pts.push([cx+r*Math.cos(t),cz+r*Math.sin(t)]);}return pts;}
// a polyline clipped to the plateau: split into runs that stay inside the wall (margin) — ring roads near the wall
function roadInside(pts,w,cls,opt,margin){let run=[];const flush=()=>{if(run.length>1)road(run,w,cls,opt);run=[];};
 for(const p of pts){if(insideWall(p[0],p[1],margin||26))run.push(p);else flush();}flush();}
// nearest point on the existing network (ROADS so far) to (x,z): {x,z,d,road}
function nearestRoadPt(x,z,filter){let best=null;for(const r of ROADS){if(filter&&!filter(r))continue;const P=r.pts;
 for(let i=0;i<P.length-1;i++){const ax=P[i][0],az=P[i][1],bx=P[i+1][0],bz=P[i+1][1];const dx=bx-ax,dz=bz-az,l2=dx*dx+dz*dz||1;const t=clamp(((x-ax)*dx+(z-az)*dz)/l2,0,1);
  const qx=ax+dx*t,qz=az+dz*t,d=Math.hypot(x-qx,z-qz);if(!best||d<best.d)best={x:qx,z:qz,d,road:r};}}return best;}
// connect a point to the network with a straight road (project rule: streets connect unless told otherwise)
function connectRoad(x,z,w,cls,filter){const n=nearestRoadPt(x,z,filter);if(!n||n.d<2)return n;road([[x,z],[n.x,n.z]],w,cls);return n;}

// ---- 1. the three hills: escarpment rock, top surface, ring roads, ramps ----
for(const k of HILLKEYS){const H=HILL[k];
 // rock face: albedo grey-brown, blocked, classed rock; from the top's edge to the escarpment foot
 annulus(cg,H.x,H.z,H.r0-2,H.r0+H.E+3,'#8c7a66');annulus(mg,H.x,H.z,H.r0-3,H.r0+H.E+6,'#000');annulus(kg,H.x,H.z,H.r0-3,H.r0+H.E+6,KLCOL(KL.rock));
 for(let i=0;i<260;i++){const a=rng()*TAU,r=rr(H.r0,H.r0+H.E);cg.beginPath();cg.arc(px(H.x+r*Math.cos(a)),px(H.z+r*Math.sin(a)),rr(1.5,5)*PXS,0,7);cg.fillStyle=vPick(['rgba(70,58,46,.35)','rgba(160,145,125,.4)','rgba(120,100,80,.35)']);cg.fill();}
 // ring road at the foot (boulevard class), clipped to the plateau
 roadInside(arcPts(H.x,H.z,H.ring,0,TAU,120),14,KL.boulevard,{zone:'ring:'+k},24);
 // the ramp: from the ring up the gate bearing onto the top (boulevard, 12 m), the top edge left clear
 const g=H.gate;const r1=H.ring+2,r2=H.r0-10;road([[H.x+r1*Math.cos(g),H.z+r1*Math.sin(g)],[H.x+r2*Math.cos(g),H.z+r2*Math.sin(g)]],12,KL.boulevard,{col:'#7a6656'});
 // unblock the ramp corridor in the mask/class (it crossed the rock band) — repaint as road
 cstroke(mg,[[H.x+r1*Math.cos(g),H.z+r1*Math.sin(g)],[H.x+r2*Math.cos(g),H.z+r2*Math.sin(g)]],14,'#000');
 // the top is a plaza surface by default (the palace top is re-painted as its court below)
 disc(H.x,H.z,H.r0-3,'plaza','#c9a56b');
 precinct(H.x,H.z,H.r0+H.E+2,k+' hill');}

// ---- 2. thoroughfares: ring to ring, along the line of centres, stopping at each ring ----
function ringToRing(a,b){const A=HILL[a],B=HILL[b];const ang=Math.atan2(B.z-A.z,B.x-A.x);
 road([[A.x+A.ring*Math.cos(ang),A.z+A.ring*Math.sin(ang)],[B.x-B.ring*Math.cos(ang),B.z-B.ring*Math.sin(ang)]],16,KL.boulevard,{zone:'thoroughfare'});}
ringToRing('palace','temple');ringToRing('temple','arena');ringToRing('arena','palace');
// ---- 3. gate roads: each gate to the nearest point of the closest ring road ----
for(const g of GATES){const [gx,gz]=gatePos(g);const ix=(wallR(g)-30)*Math.cos(g),iz=(wallR(g)-30)*Math.sin(g);
 let best=null;for(const k of HILLKEYS){const H=HILL[k];const d=Math.hypot(ix-H.x,iz-H.z)-H.ring;if(!best||d<best.d)best={k,d,H};}
 const H=best.H;const ang=Math.atan2(H.z-iz,H.x-ix);road([[ix,iz],[H.x-H.ring*Math.cos(ang),H.z-H.ring*Math.sin(ang)]],16,KL.boulevard,{zone:'gate:'+Math.round(g*180/Math.PI)});}
// the gate highways run on from the end of each causeway to the nearest edge of the map (Travis): straight, and the
// jungle is kept off them (mask + a line of keep-clear discs for the hypertrees)
for(const g of GATES){const R=wallR(g),p=[(R+240)*Math.cos(g),(R+240)*Math.sin(g)],E=CITY.WORLD/2-2;
 const opts=[[E,p[1]],[-E,p[1]],[p[0],E],[p[0],-E]];let best=opts[0],bd=1e9;for(const q of opts){const d=Math.hypot(q[0]-p[0],q[1]-p[1]);if(d<bd){bd=d;best=q;}}
 road([p,best],14,KL.boulevard,{zone:'highway'});
 for(let t=0;t<=bd;t+=28){const x=p[0]+(best[0]-p[0])*t/bd,z=p[1]+(best[1]-p[1])*t/bd;BIO_OBSTACLES.push({x,z,r:12});}
 for(let t=40;t<=240;t+=28){BIO_OBSTACLES.push({x:(R+t)*Math.cos(g),z:(R+t)*Math.sin(g),r:12});}}
// the north-west causeway runs on to the ruined spaceport
{const g=CITY.SPACEPORT_A,R=wallR(g);road([[(R+240)*Math.cos(g),(R+240)*Math.sin(g)],[SPORT.x-(CITY.SPACEPORT_RAD-10)*Math.cos(g),SPORT.z-(CITY.SPACEPORT_RAD-10)*Math.sin(g)]],12,KL.boulevard,{col:'#4e4a46'});
 cdisc(mg,SPORT.x,SPORT.z,CITY.SPACEPORT_RAD+12,'#000');cdisc(cg,SPORT.x,SPORT.z,CITY.SPACEPORT_RAD+6,'#7a7068');cdisc(kg,SPORT.x,SPORT.z,CITY.SPACEPORT_RAD+6,KLCOL(KL.plaza));}

// ---- 4. the palace top: the court inside the curtain wall (r 82), the triumphal plaza in front of the palace ----
{const H=HILL.palace,g=H.gate;const gx=Math.cos(g),gz=Math.sin(g);
 disc(H.x,H.z,80,'court','#b09070');
 disc(H.x+46*gx,H.z+46*gz,30,'plaza','#d8b47a');   // triumphal plaza: paler slabs, the statue at its centre
 // the axis road from the gate to the palace steps
 road([[H.x+86*gx,H.z+86*gz],[H.x+22*gx,H.z+22*gz]],10,KL.boulevard,{col:'#c8a878'});}
// ---- 5. the temple top: the temple sits back, its plaza forward toward the ramp ----
{const H=HILL.temple,g=H.gate;const gx=Math.cos(g),gz=Math.sin(g);disc(H.x+40*gx,H.z+40*gz,30,'plaza','#d8b47a');}
// ---- 6. the arena top: plaza all round (already), a promenade ring road on the top ----
{const H=HILL.arena,g=H.gate;const gx=Math.cos(g),gz=Math.sin(g);disc(H.x+68*gx,H.z+68*gz,22,'plaza','#d8b47a');}

// ---- 7. parks (undergrowth flora, planted by the biome pass from the mask's green) and civic pads ----
const PARKS=[];
function park(x,z,r,name){disc(x,z,r,'park');precinct(x,z,r+2,name||'park');PARKS.push({x,z,r});
 // roads already through here stay roads (re-stroked over the green)
 for(const R of ROADS)if(R.pts.some(p=>Math.hypot(p[0]-x,p[1]-z)<r+R.w+60)){cstroke(cg,R.pts,R.w,ROADCOL[R.cls]||'#5a5652');cstroke(mg,R.pts,R.w+2.5,'#000');cstroke(kg,R.pts,R.w+1.5,KLCOL(R.cls));}
 // a footpath crossing it stays walkable, and joins the network
 connectRoad(x,z,4,KL.minor);}
// a park near a hill: the first bearing (sweeping from a0) whose disc lies on the plateau, clear of every hill's
// escarpment and skirt foot and of the wall band — a park never climbs a hill side (Travis)
function parkNear(H,a0,r,rad,name){for(let k=0;k<20;k++){const a=a0+(k%2?1:-1)*Math.ceil(k/2)*.22;const x=H.x+r*Math.cos(a),z=H.z+r*Math.sin(a);
  if(!insideWall(x,z,rad+30))continue;let ok=true;for(const kk of HILLKEYS){const Q=HILL[kk];if(Math.hypot(x-Q.x,z-Q.z)<Q.r0+Q.E+rad+8)ok=false;}
  if(!ok)continue;if(inPrecinct(x,z,rad))continue;park(x,z,rad,name);return[x,z];}reportErr('no ground for '+name);return null;}
{const H=HILL.temple,g=H.gate;   // the temple's park district: two parks at the foot, either side of the ramp
 for(const s of[-1,1])parkNear(H,g+s*1.05,H.ring+64,42,'Temple park '+(s<0?'west':'east'));}
{const H=HILL.arena;   // the arena's park district south-east of the hill, beside the amphitheatre
 parkNear(H,Math.PI/4,H.ring+90,44,'Arena park');parkNear(H,Math.PI/2+.3,H.ring+105,30,'Amphitheatre green');}
// the Ancient amphitheatre's pad at the arena's foot (south), levelled
const AMPH={x:HILL.arena.x-10,z:HILL.arena.z+206,r:60};
cityFlat(AMPH.x,AMPH.z,AMPH.r,22,CITY.PLATEAU+.6);disc(AMPH.x,AMPH.z,AMPH.r+4,'plaza','#a8907a');precinct(AMPH.x,AMPH.z,AMPH.r+6,'amphitheatre');
connectRoad(AMPH.x,AMPH.z+AMPH.r+4,10,KL.boulevard);
// the ruined observation tower stands on the arena hill's top, behind the arena (Travis, round 3)
const NEEDLE=(()=>{const H=HILL.arena;const na=H.gate+Math.PI;return{x:H.x+72*Math.cos(na),z:H.z+72*Math.sin(na)};})();
