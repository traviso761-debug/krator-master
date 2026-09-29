// ================================================================= ROKETSTAD — the layout: squares, highways, main roads, the port's roads, farm lanes
// Paints the primary network into the canvases (85) and records the ROADS; 88 reserves the big plots and grows the
// chaotic street fabric round them. Nothing is placed here.
reseed(SEED_RK+2);
function arcPts(cx,cz,r,a0,a1,n){const pts=[];for(let i=0;i<=n;i++){const t=a0+(a1-a0)*i/n;pts.push([cx+r*Math.cos(t),cz+r*Math.sin(t)]);}return pts;}
// ---------------------------------------------------------------- road geometry: a spatial hash over every road segment
const RSEG={cell:24,hash:{}};
function rsegAdd(r){const P=r.pts;for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1];const s={a,b,r};const x0=Math.min(a[0],b[0]),x1=Math.max(a[0],b[0]),z0=Math.min(a[1],b[1]),z1=Math.max(a[1],b[1]);
  for(let ix=Math.floor(x0/RSEG.cell);ix<=Math.floor(x1/RSEG.cell);ix++)for(let iz=Math.floor(z0/RSEG.cell);iz<=Math.floor(z1/RSEG.cell);iz++)(RSEG.hash[ix+','+iz]||(RSEG.hash[ix+','+iz]=[])).push(s);}}
const _roadBase=road;
road=function(pts,w,cls,opt){const r=_roadBase(pts,w,cls,opt);rsegAdd(r);return r;};
// nearest point on the network (hash search in rings of cells out to maxD): {x,z,d,road}
function nearestRoadPt(x,z,filter,maxD){maxD=maxD||600;let best=null;const c=RSEG.cell;const ix0=Math.floor(x/c),iz0=Math.floor(z/c);
 for(let ring=0;ring*c<=maxD+c;ring++){for(let ix=ix0-ring;ix<=ix0+ring;ix++)for(let iz=iz0-ring;iz<=iz0+ring;iz++){if(Math.max(Math.abs(ix-ix0),Math.abs(iz-iz0))!==ring)continue;const L=RSEG.hash[ix+','+iz];if(!L)continue;
   for(const s of L){if(filter&&!filter(s.r))continue;const ax=s.a[0],az=s.a[1],dx=s.b[0]-ax,dz=s.b[1]-az,l2=dx*dx+dz*dz||1;const t=clamp(((x-ax)*dx+(z-az)*dz)/l2,0,1);
    const qx=ax+dx*t,qz=az+dz*t,d=Math.hypot(x-qx,z-qz);if(!best||d<best.d)best={x:qx,z:qz,d,road:s.r};}}
  if(best&&best.d<(ring-1)*c)break;}
 return best;}
function connectRoad(x,z,w,cls,filter){const n=nearestRoadPt(x,z,filter);if(!n||n.d<2)return n;road([[x,z],[n.x,n.z]],w,cls);return n;}
// a meandering polyline from a to b: `n` segments, lateral wander `amp` (a road that follows the ground, not a ruler)
function meander(a,b,n,amp,seed){const pts=[a];const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz),px_=-dz/L,pz=dx/L;
 for(let i=1;i<n;i++){const t=i/n,w=amp*Math.sin(t*Math.PI)*(fbm(t*3+seed,seed*.7,1.3,2)-.5)*2;pts.push([a[0]+dx*t+px_*w,a[1]+dz*t+pz*w]);}pts.push(b);return pts;}
// ---------------------------------------------------------------- 0. the port table first (round 9: the town's east end stands on it), then the town over it
const PORTR={star:360*PC.starS,ring:360*PC.starS+16};
disc(PC.x,PC.z,PC.top+6,'port','rgba(0,0,0,0)');cdisc(mg,PC.x,PC.z,PC.top+6,'#000');paintTownMask();
// ---------------------------------------------------------------- 1. the squares
for(const k in SQUARES){const S=SQUARES[k];disc(S.x,S.z,S.r,'plaza',k==='main'||k==='republic'?'#a09078':S.industrial?'#7a7268':'#988a74');precinct(S.x,S.z,S.r+1,k+' square');}
// ---------------------------------------------------------------- 2. the highways: square -> gate -> the country (N, S, W) and the port (E)
// each gate is served from the nearest square: N, S and W from the main square on the hill, E from Scraptown's plaza
const HIGHWAY={};
function squareRimToward(S,x,z){const a=Math.atan2(z-S.z,x-S.x);return[S.x+(S.r+1)*Math.cos(a),S.z+(S.r+1)*Math.sin(a)];}
for(const [name,g] of GATE_LIST){const gin=townPt(g,wallR(g)-14),gout=townPt(g,wallR(g)+26);const S=name==='E'?SQUARES.scrap:SQUARES.main;
 const inner=squareRimToward(S,gin[0],gin[1]);const L=Math.hypot(gin[0]-inner[0],gin[1]-inner[1]);
 road(meander(inner,gin,Math.max(4,Math.round(L/60)),Math.min(30,L*.06),g*3.1),10,KL.highway,{zone:'highway:'+name});
 road([gin,gout],10,KL.highway,{zone:'gate:'+name});HIGHWAY[name]={gin,gout,g};}
{const E=RK.WORLD/2-4;const N=HIGHWAY.N,S=HIGHWAY.S,W=HIGHWAY.W,Ew=HIGHWAY.E;
 HIGHWAY.N.out=meander(N.gout,[N.gout[0]-40,-E],18,70,4.2);road(HIGHWAY.N.out,10,KL.highway,{zone:'highway:N-out'});
 HIGHWAY.S.out=meander(S.gout,[S.gout[0]+40,E],18,70,7.7);road(HIGHWAY.S.out,10,KL.highway,{zone:'highway:S-out'});
 HIGHWAY.W.out=meander(W.gout,[-E,W.gout[1]+60],16,70,5.3);road(HIGHWAY.W.out,10,KL.highway,{zone:'highway:W-out'});
 // the port road: from the east gate into the pentagon between vertices 2 and 3 (the west gap), to the Starport's forecourt
 const gap=[PC.x-PC.P*Math.cos(Math.PI/5)-10,PC.z];HIGHWAY.E.out=meander(Ew.gout,gap,4,10,2.9).concat([[PC.x-150*PC.starS/.3,PC.z]]);
 road(HIGHWAY.E.out,10,KL.highway,{zone:'highway:E-out'});}
// ---------------------------------------------------------------- 3. main roads between the squares
function squareRim(A,B){const a=Math.atan2(B.z-A.z,B.x-A.x);return[A.x+(A.r+1)*Math.cos(a),A.z+(A.r+1)*Math.sin(a)];}
function mainRoad(a,b,seed){const A=SQUARES[a],B=SQUARES[b];const L=Math.hypot(B.x-A.x,B.z-A.z);road(meander(squareRim(A,B),squareRim(B,A),Math.max(5,Math.round(L/45)),Math.min(26,L*.05),seed),8,KL.main,{zone:'main:'+a+'-'+b});}
mainRoad('main','market',1.3);mainRoad('main','temple',2.6);mainRoad('market','temple',3.9);mainRoad('main','republic',5.1);mainRoad('republic','scrap',6.4);mainRoad('temple','republic',7.2);
// the pomerium: a street just inside the wall, all the way round (broken only by the gates' own roads)
{const pts=[];for(let i=0;i<=300;i++){const t=i/300*TAU;pts.push(townPt(t,wallR(t)-24));}road(pts,6,KL.street,{zone:'pomerium'});}
// ---------------------------------------------------------------- 4. the port: the Starport forecourt ring, spokes to the pads, the precincts
(function portRoads(){
 road(arcPts(PC.x,PC.z,PORTR.ring,0,TAU,80),10,KL.highway,{zone:'port:ring',col:'#5e5c56'});
 for(const P of PENT){const a=P.a;road([[PC.x+PORTR.ring*Math.cos(a),PC.z+PORTR.ring*Math.sin(a)],[P.x-(PAD_R-4)*Math.cos(a),P.z-(PAD_R-4)*Math.sin(a)]],9,KL.highway,{zone:'port:spoke',col:'#5e5c56'});
  precinct(P.x,P.z,PAD_R+4,'launch site '+P.k);}
 precinct(PC.x,PC.z,PORTR.star,'starport');})();
// ---------------------------------------------------------------- 5. farm lanes off the N, S and W highways (the farms themselves go in 90b)
const FARMLANES=[];
(function farmLanes(){reseed(SEED_RK+3);
 for(const key of['N','S','W']){const P=HIGHWAY[key].out;let acc=0,next=rr(80,120);
  for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),ux=(b[0]-a[0])/L,uz=(b[1]-a[1])/L;
   for(let s=0;s<L;s+=10){acc+=10;if(acc<next)continue;acc=0;next=rr(130,200);const x=a[0]+ux*s,z=a[1]+uz*s;
    if(insideWall(x,z,-120))continue;
    for(const side of[-1,1]){if(rng()<.15)continue;const len=rr(180,420);const nx=-uz*side,nz=ux*side;
     const end=[x+nx*len,z+nz*len];if(Math.abs(end[0])>RK.WORLD/2-40||Math.abs(end[1])>RK.WORLD/2-40)continue;
     if(Math.hypot(end[0]-PC.x,end[1]-PC.z)<PC.top+140)continue;if(insideWall(end[0],end[1],-60))continue;
     const pts=meander([x+nx*5,z+nz*5],end,5,18,x*.01+z*.013);FARMLANES.push({pts,key,side});road(pts,4.5,KL.lane,{zone:'farmlane',col:'#8a7a5c'});}}}}})();
// ---------------------------------------------------------------- 6. Scraptown's lanes (round 9: inside the wall now — the east end of the capital)
const SAT=(()=>{reseed(SEED_RK+60);const hub={x:SQUARES.scrap.x,z:SQUARES.scrap.z,R:SQUARES.scrap.r};const lanes=[];
 for(let k=0;k<8;k++){const a=-Math.PI/2+.4+k*TAU/8.6;const L=rr(60,110);const a0=[hub.x+Math.cos(a)*(hub.R+.5),hub.z+Math.sin(a)*(hub.R+.5)],e=[hub.x+Math.cos(a)*(hub.R+L),hub.z+Math.sin(a)*(hub.R+L)];
  if(!insideWall(e[0],e[1],30))continue;lanes.push(road(meander(a0,e,5,12,k*1.7+.3),6,KL.street,{zone:'sat'}));}
 return{hub,lanes};})();
