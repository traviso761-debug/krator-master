// ================================================================= ISLE DEMO — Nephtos, the Hykkousoi colony of Tethys, on the forest island west
// [G data] settlements/isle-demo PLAN.md section 15 (the owner, 2026-11-09: "Forest island east will have a new element: a
// Hykkousoi colony ... for now we'll use a place holder radial layout"). Sites the colony on the island's coast and lays
// its placeholder radial plan there (settlements/isle-demo 47k ISLE.colonyPlan, read in place by build.py); 48t declares it
// on the sim with the two Islander towns, its villages are 48's (parent 'Nephtos'), 88p draws it.
//   ISLE_COLONY.make()       once: the site, the plan {R, G}, its centre and reach in world metres -> made (or {error})
//   ISLE_COLONY.made         the above
//   ISLE_COLONY.inside(x, z) the colony's ground (its plan's reach and a margin): the villages keep off it, the flora too (88p)
//   ISLE_COLONY.heads()      its roads' heads: the outer ends of its spokes on dry ground, world metres
// THE SITE: SPEC.near is the survey's pick: the west coast of the forest island west, the island north-west of Valapo (the
// owner, 2026-11-09: "i wanted it on the island NW of valapo", its west coast; open water off it: PLAN.md section 15). Round it, on a SPEC.cell grid within SPEC.look, every dry cell with the open
// sea within SHORE m (16 bearings; the water a metre deep 300 m on) is a beach; its plan's ground is the disc of the plan's
// reach round the agora (AGORA.in m inland of the beach), sampled every 30 m: the share of it dry, under SLOPE and clear of
// the towns must be SPEC.dryMin at least; the best share wins, nearest the pick on a tie. Placement reads the world only.
var ISLE_COLONY=(function(){
const SPEC={town:'Nephtos',near:[-56518,20139],look:9000,cell:250,dryMin:.7},SHORE=420,SLOPE=.25,MARGIN=60;
const H=(x,z)=>WORLD.Hland?WORLD.Hland(x,z):WORLD.H(x,z),wet=(x,z)=>WORLD.water(x,z)>H(x,z)-1.2;
const slope=(x,z)=>Math.max(Math.abs(H(x+4,z)-H(x-4,z)),Math.abs(H(x,z+4)-H(x,z-4)))/8;
const dry=(x,z)=>WORLD.inside(x,z)&&!wet(x,z)&&slope(x,z)<SLOPE&&!WORLD.townW(x,z);
const reach=()=>{const C=ISLE.COLONY;return C.AGORA.r+C.ring*C.rings;};
/* the open sea nearest a dry point: {ux, uz, d, x, z (the last dry point)} or null */
function seaward(x,z){let best=null;
 for(let a=0;a<16;a++){const ux=Math.cos(a*Math.PI/8),uz=Math.sin(a*Math.PI/8);let last=[x,z];
  for(let r=30;r<=SHORE;r+=30){const px=x+ux*r,pz=z+uz*r;if(!wet(px,pz)){last=[px,pz];continue;}
   const qx=px+ux*300,qz=pz+uz*300;if(WORLD.water(qx,qz)>H(qx,qz)+1&&(!best||r<best.d))best={ux,uz,d:r,x:last[0],z:last[1]};break;}}
 return best;}
function survey(){const C=ISLE.COLONY,R=reach(),n=Math.floor(SPEC.look/SPEC.cell);let best=null,tried=0;
 for(let j=-n;j<=n;j++)for(let i=-n;i<=n;i++){if(i*i+j*j>n*n)continue;const x=SPEC.near[0]+i*SPEC.cell,z=SPEC.near[1]+j*SPEC.cell;if(!dry(x,z))continue;
  const s=seaward(x,z);if(!s)continue;tried++;const cx=s.x-s.ux*C.AGORA.in,cz=s.z-s.uz*C.AGORA.in;let k=0,m=0;
  for(let dz=-R;dz<=R;dz+=30)for(let dx=-R;dx<=R;dx+=30){if(dx*dx+dz*dz>R*R)continue;m++;if(dry(cx+dx,cz+dz))k++;}
  const share=k/m,d=Math.hypot(x-SPEC.near[0],z-SPEC.near[1]);if(share<SPEC.dryMin)continue;
  if(!best||share>best.share+1e-9||(Math.abs(share-best.share)<=1e-9&&d<best.d))best={beach:[s.x,s.z],sea:[s.ux,s.uz],share,d,centre:[cx,cz]};}
 return best?Object.assign(best,{tried}):{error:'no beach with '+SPEC.dryMin+' of its ground dry within '+SPEC.look+' m of '+SPEC.near.join(','),tried};}
let made=null;
/* the owner's drawing planned (48t: ISLE_TOWNS_W.plans holds Nephtos): the colony's record from that plan, `drawn` */
function fromPlan(P){const F=P.G.frame,R=P.R,L=(R.landings||[])[0],B=L&&(L.berths||[])[0];let cx=0,cz=0;R.lots.forEach(l=>{cx+=l.x;cz+=l.z;});cx/=Math.max(1,R.lots.length);cz/=Math.max(1,R.lots.length);
 const reachD=R.lots.reduce((m,l)=>Math.max(m,Math.hypot(l.x-cx,l.z-cz)+Math.hypot(l.w,l.d)/2),0);
 let sea=[1,0];if(L&&B){const dx=B.x-L.x,dz=B.z-L.z,d=Math.hypot(dx,dz)||1;sea=[dx/d,dz/d];}
 return{town:SPEC.town,drawn:true,site:{beach:L?[F.x+L.x,F.z+L.z]:[F.x+cx,F.z+cz],sea,share:null,tried:0},frame:F,R,G:P.G,plan:{R,G:P.G},centre:[F.x+cx,F.z+cz],reach:reachD+MARGIN,
  census:ISLE.census(R),berth:B?{x:B.x+F.x,z:B.z+F.z,h:B.heading}:null};}
function make(){if(made)return made;const P0=typeof ISLE_TOWNS_W!=='undefined'?ISLE_TOWNS_W.plans.find(p=>p.town===SPEC.town):null;if(P0)return made=fromPlan(P0);
 const s=survey();if(s.error)return made={error:s.error,site:s};
 const TS=ISLE.TUNE.sim.towns[SPEC.town],sea=WORLD.lakeWater(s.beach[0]+s.sea[0]*200,s.beach[1]+s.sea[1]*200),F={x:+s.beach[0].toFixed(2),z:+s.beach[1].toFixed(2),sea};
 const P=ISLE.colonyPlan({town:SPEC.town,seed:4242,frame:F,h:(x,z)=>H(x+F.x,z+F.z)-sea,land:(x,z)=>dry(x+F.x,z+F.z),sea:s.sea,shore:[0,0],households:TS.colony.households});
 const c=P.R.centre,cx=F.x+c[0],cz=F.z+c[1],L=P.R.landings[0],B=L&&L.berths[0];
 made={town:SPEC.town,site:s,frame:F,R:P.R,G:P.G,plan:P,centre:[cx,cz],reach:reach()+MARGIN,census:ISLE.colonyCensus(P.R),
  berth:B?{x:B.x+F.x,z:B.z+F.z,h:B.heading}:null};
 return made;}
const inside=(x,z)=>!!made&&!made.error&&Math.hypot(x-made.centre[0],z-made.centre[1])<made.reach;
/* the outer ends of its spokes (not the harbour's) on dry ground: where its roads start */
function heads(){if(!made||made.error||made.drawn)return[];   /* a drawn Nephtos's heads are the towns' (48r: its avenues' outer ends) */const F=made.frame,c=made.R.centre,out=[];
 made.R.plan.ways.filter(w=>w.cls==='main'&&w.pts.length>1).forEach((w,i)=>{const a=w.pts[0],b=w.pts[w.pts.length-1],e=Math.hypot(a[0]-c[0],a[1]-c[1])>=Math.hypot(b[0]-c[0],b[1]-c[1])?a:b;
  if(Math.hypot(e[0]-c[0],e[1]-c[1])<reach()*0.8)return;const x=F.x+e[0],z=F.z+e[1];if(WORLD.inside(x,z)&&!wet(x,z))out.push({name:SPEC.town+':spoke '+i,x,z});});
 return out;}
return{SPEC,make,inside,heads,seaward,get made(){return made;}};})();
