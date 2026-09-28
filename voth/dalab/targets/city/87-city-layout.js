// ================================================================= DALAB CITY — the layout: settlements, streets, the highway, the avenue, farms
// Streets are radial from each settlement's plaza (the plaza sits in front of the mound); a ring street ties the
// radials; the highway circuit joins the six outlying towns and leaves the map in the four cardinal directions; the
// live-oak avenue runs from the lab gate to the main plaza. A connectivity pass afterwards guarantees one network.
reseed(SEED_CITY+2);
function nearestRoadPt(x,z,filter){let best=null;for(const r of ROADS){if(filter&&!filter(r))continue;const P=r.pts;
 for(let i=0;i<P.length-1;i++){const ax=P[i][0],az=P[i][1],bx=P[i+1][0],bz=P[i+1][1];const dx=bx-ax,dz=bz-az,l2=dx*dx+dz*dz||1;const t=clamp(((x-ax)*dx+(z-az)*dz)/l2,0,1);
  const qx=ax+dx*t,qz=az+dz*t,d=Math.hypot(x-qx,z-qz);if(!best||d<best.d)best={x:qx,z:qz,d,road:r,seg:i,t};}}return best;}
function connectRoad(x,z,w,cls,filter,zone){const n=nearestRoadPt(x,z,filter);if(!n||n.d<2)return n;road([[x,z],[n.x,n.z]],w,cls,{zone:zone||'link'});return n;}
// a road may not cross water except where a bridge is laid: split at the channel and lay a plank bridge (painted)
const BRIDGES=[];
function bridgeAt(x,z,ry,w){BRIDGES.push({x,z,ry,w});}
// ---- 1. the settlements: mound disc, plaza, radials, ring street(s) ----
for(const S of SETTLE){
 const f=S.face;const fd=[Math.sin(f),Math.cos(f)];                         // the mound's front direction (local +z rotated by face)
 S.mound={x:S.x,z:S.z,ry:f};
 const pc=[S.x+fd[0]*(S.moundR+10+S.plazaR),S.z+fd[1]*(S.moundR+10+S.plazaR)];S.plaza={x:pc[0],z:pc[1],r:S.plazaR};
 disc(S.x,S.z,S.moundR+6,'mound');precinct(S.x,S.z,S.moundR+8,S.name+' mound');
 disc(pc[0],pc[1],S.plazaR,'plaza');precinct(pc[0],pc[1],S.plazaR-2,S.name+' plaza');
 // radials from the plaza centre, skipping the mound's bearing; the first pair frame the mound
 S.radials=[];const n=S.streets;const back=Math.atan2(S.x-pc[0],S.z-pc[1]);   // bearing toward the mound (as ry: dir = sin,cos)
 for(let k=0;k<n;k++){const a=back+Math.PI+(k/n)*TAU;if(angDiff(a,back)<.45)continue;const L=S.main?420:140;
  const pts=[[pc[0]+Math.sin(a)*(S.plazaR-2),pc[1]+Math.cos(a)*(S.plazaR-2)],[pc[0]+Math.sin(a)*L,pc[1]+Math.cos(a)*L]];
  road(pts,S.main?CITY.STREET_W+2:CITY.STREET_W,KL.street,{zone:S.key+':radial'});S.radials.push({a,L,pts});}
 // ring street(s) round the plaza
 const ring=(R,w)=>{const pts=[];for(let i=0;i<=48;i++){const a=i/48*TAU;pts.push([pc[0]+Math.sin(a)*R,pc[1]+Math.cos(a)*R]);}road(pts,w,KL.lane,{zone:S.key+':ring'});};
 ring(S.ringR,CITY.LANE_W);if(S.ringR2)ring(S.ringR2,CITY.LANE_W);
 // a lane round the back of the mound so the houses behind it connect
 {const R=S.moundR+22;const pts=[];for(let i=0;i<=24;i++){const a=back+Math.PI/2+i/24*Math.PI;pts.push([S.x+Math.sin(a)*R,S.z+Math.cos(a)*R]);}road(pts,CITY.LANE_W,KL.lane,{zone:S.key+':moundlane'});
  connectRoad(pts[0][0],pts[0][1],CITY.LANE_W,KL.lane,r=>r.zone&&r.zone.indexOf(S.key)===0&&r.zone.indexOf('moundlane')<0);connectRoad(pts[24][0],pts[24][1],CITY.LANE_W,KL.lane,r=>r.zone&&r.zone.indexOf(S.key)===0&&r.zone.indexOf('moundlane')<0);}
}
// ---- 2. the highway circuit through the outlying plazas, and the four spurs off the map ----
{const T=SETTLE.filter(S=>!S.main);const pts=T.map(S=>[S.plaza.x,S.plaza.z]);pts.push(pts[0]);
 // round the corners: a point outside each plaza on the way in and out, so the highway skirts the plaza edge rather than crossing the mound
 const P=[];for(let i=0;i<T.length;i++){const a=T[i],b=T[(i+1)%T.length];const A=[a.plaza.x,a.plaza.z],B=[b.plaza.x,b.plaza.z];P.push(A);const mx=(A[0]+B[0])/2,mz=(A[1]+B[1])/2;const ox=mx-CITY.RING_C[0],oz=mz-CITY.RING_C[1],m=Math.hypot(ox,oz);P.push([CITY.RING_C[0]+ox/m*(CITY.RING+40),CITY.RING_C[1]+oz/m*(CITY.RING+40)]);}
 P.push(P[0]);road(P,CITY.HIGHWAY_W,KL.highway,{zone:'highway'});
 // spurs: from the circuit's nearest point to each map edge
 const E=CITY.WORLD/2+80;for(const dir of[[0,-1],[1,0],[0,1],[-1,0]]){const far=[CITY.RING_C[0]+dir[0]*E,CITY.RING_C[1]+dir[1]*E];const n=nearestRoadPt(far[0],far[1],r=>r.zone==='highway');road([[n.x,n.z],far],CITY.HIGHWAY_W,KL.highway,{zone:'spur'});}
 // the main settlement joins the circuit by its three outward radials, extended
 const M=SETTLE.find(S=>S.main);for(const R of M.radials){if(angDiff(R.a,M.face)<1.2)continue;const e=R.pts[1];const n=nearestRoadPt(e[0],e[1],r=>r.zone==='highway');if(n&&n.d<900)road([e,[n.x,n.z]],CITY.STREET_W+2,KL.street,{zone:'main:link'});}
 window._highwayPts=P.length;}
// ---- 3. the avenue: lab gate to the main plaza, a live-oak vault (the biome plants the oaks along AVENUE) ----
const M0=SETTLE.find(S=>S.main);
const LAB_GATE=[CITY.LAB.x,CITY.LAB.z+292*4.105*CITY.LAB.scale];   // the compound wall's south point
const AVENUE=[[LAB_GATE[0],LAB_GATE[1]-30],[LAB_GATE[0],LAB_GATE[1]+40],[M0.plaza.x,M0.plaza.z-M0.plazaR-2]];
road(AVENUE,16,KL.avenue,{zone:'avenue'});disc(LAB_GATE[0],LAB_GATE[1]+10,26,'plaza');
// the High Priest's mound, right outside the lab's main entrance, ringed, facing AWAY from the lab (south)
const HIGH_MOUND={x:-190,z:LAB_GATE[1]+120,ry:0};disc(HIGH_MOUND.x,HIGH_MOUND.z,76,'mound');precinct(HIGH_MOUND.x,HIGH_MOUND.z,80,"High Priest's mound");
road([[HIGH_MOUND.x,HIGH_MOUND.z+82],[HIGH_MOUND.x,HIGH_MOUND.z+140],[AVENUE[1][0]-20,AVENUE[1][1]+120]],CITY.STREET_W,KL.street,{zone:'highmound'});
// ---- 4. the farms: wedges of field between the radials, from the settlement's edge outward; a ring of them ----
const FIELDS=[];
(function farms(){reseed(SEED_CITY+3);
 for(const S of SETTLE){const R0=S.main?S.r-20:S.r-30,R1=S.main?S.r+330:S.r+240;const n=S.main?18:12;
  for(let i=0;i<n;i++){const a0=i/n*TAU,a1=(i+1)/n*TAU;const ci=Math.floor(rng()*CROPCOL.length);if(rng()<.18)continue;   // some fallow
   for(let r=R0;r<R1;r+=rr(60,95)){const r2=Math.min(R1,r+rr(55,90));const g=.028;const pts=[[S.plaza.x+Math.sin(a0+g)*r,S.plaza.z+Math.cos(a0+g)*r],[S.plaza.x+Math.sin(a1-g)*r,S.plaza.z+Math.cos(a1-g)*r],[S.plaza.x+Math.sin(a1-g)*r2,S.plaza.z+Math.cos(a1-g)*r2],[S.plaza.x+Math.sin(a0+g)*r2,S.plaza.z+Math.cos(a0+g)*r2]];
    // no fields on water, the avenue, the lab or the highway's line
    let ok=true;for(const p of pts){if(isWater(p[0],p[1])||Math.hypot(p[0]-CITY.LAB.x,p[1]-CITY.LAB.z)<292*4.105*CITY.LAB.scale+60||riverD(p[0],p[1])<50||channelD(p[0],p[1]).d<8)ok=false;}
    if(!ok)continue;field(pts,(ci+Math.round(r/80))%CROPCOL.length,(a0+a1)/2);FIELDS.push({pts,S:S.key,cx:pts.reduce((s,p)=>s+p[0],0)/4,cz:pts.reduce((s,p)=>s+p[1],0)/4});}}}
 window._fields=FIELDS.length;})();
// farm lanes: every other wedge boundary gets a lane from the ring street out to the fields' edge (the farm workers' way)
for(const S of SETTLE){const n=S.main?18:12;for(let i=0;i<n;i+=2){const a=i/n*TAU;const R0=S.ringR+4,R1=(S.main?S.r+300:S.r+210);
 road([[S.plaza.x+Math.sin(a)*R0,S.plaza.z+Math.cos(a)*R0],[S.plaza.x+Math.sin(a)*R1,S.plaza.z+Math.cos(a)*R1]],CITY.LANE_W,KL.lane,{zone:S.key+':farmlane'});}}
// ---- 5. the connectivity pass: one network. Components by endpoint proximity; each minor component gets a link to the largest ----
function roadComponents(){const N=ROADS.length,par=[];for(let i=0;i<N;i++)par[i]=i;const find=i=>par[i]===i?i:(par[i]=find(par[i]));const uni=(a,b)=>{par[find(a)]=find(b);};
 for(let i=0;i<N;i++){const A=ROADS[i];for(const e of[A.pts[0],A.pts[A.pts.length-1]]){for(let j=0;j<N;j++){if(i===j)continue;const B=ROADS[j];for(let k=0;k<B.pts.length-1;k++){if(segD(e[0],e[1],B.pts[k],B.pts[k+1])<(A.w+B.w)/2+1.5){uni(i,j);break;}}}}}
 const comp={};for(let i=0;i<N;i++){const c=find(i);(comp[c]||(comp[c]=[])).push(i);}return Object.values(comp);}
(function connectAll(){let guard=0;while(guard++<12){const C=roadComponents();if(C.length<=1){window._roadComponents=1;return;}C.sort((a,b)=>b.length-a.length);const main=new Set(C[0]);
 for(let ci=1;ci<C.length;ci++){let best=null;for(const ri of C[ci]){for(const p of ROADS[ri].pts){const n=nearestRoadPt(p[0],p[1],r=>main.has(r.id));if(n&&(!best||n.d<best.d))best={p,n};}}
  if(best)road([best.p,[best.n.x,best.n.z]],CITY.LANE_W,KL.lane,{zone:'connect'});}}
 window._roadComponents=roadComponents().length;})();
// bridges wherever a road crosses a channel (painted as planks over the water)
(function bridges(){for(const R of ROADS){for(let i=0;i<R.pts.length-1;i++){const a=R.pts[i],b=R.pts[i+1];const L=Math.hypot(b[0]-a[0],b[1]-a[1]);const n=Math.max(2,Math.ceil(L/6));
  for(let k=0;k<=n;k++){const t=k/n;const x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;const c=channelD(x,z);if(c.d<c.w*.5){bridgeAt(x,z,Math.atan2(b[0]-a[0],b[1]-a[1]),R.w);k+=Math.ceil(c.w*2/(L/n));}}}}
 // one bridge per crossing: thin the list
 const B=[];for(const b of BRIDGES){if(!B.some(q=>Math.hypot(q.x-b.x,q.z-b.z)<18))B.push(b);}BRIDGES.length=0;B.forEach(b=>BRIDGES.push(b));window._bridges=BRIDGES.length;})();
cityBakeMasks();
