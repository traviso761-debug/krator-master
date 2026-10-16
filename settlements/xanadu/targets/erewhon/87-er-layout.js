// ================================================================= EREWHON — the layout: districts, the highway and the avenues, the walls, contour streets and stairs
// Nothing is placed here: the primary network and the districts are painted and recorded; the placer (88) and the
// build (90b) read them. The map's lines give the highway (purple), the avenues (pink), the walls (red) and the stream
// (blue); the districts are read off the map's labels as centres and radii.
reseed(SEED_ER+2);
// ---------------------------------------------------------------- districts: {name, x,z, r, wealth, kind}
// wealth: poor / middle / rich / civic; kind steers the fill (housing, industry, market, temple, farm, garden, mine)
const DIST=[
 {name:'Palace precinct',p:MP(420,400),r:120,wealth:'civic',kind:'palace'},
 {name:'Garden district',p:MP(500,470),r:120,wealth:'rich',kind:'garden'},
 {name:'Garden market',p:MP(515,555),r:70,wealth:'middle',kind:'market'},
 {name:'Main market',p:MP(705,500),r:80,wealth:'middle',kind:'market'},
 {name:'Industry (west)',p:MP(612,460),r:70,wealth:'poor',kind:'industry'},
 {name:'Industry (east)',p:MP(735,455),r:60,wealth:'poor',kind:'industry'},
 {name:'Industry (south)',p:MP(758,540),r:60,wealth:'poor',kind:'industry'},
 {name:'Dockyard',p:MP(730,405),r:70,wealth:'poor',kind:'dock'},
 {name:'Military',p:MP(512,255),r:80,wealth:'civic',kind:'military'},
 {name:'Arena hill',p:MP(520,368),r:70,wealth:'civic',kind:'arena'},
 {name:'Amphitheatre (west)',p:MP(560,412),r:50,wealth:'civic',kind:'amph'},
 {name:'Slums (west)',p:MP(322,333),r:80,wealth:'poor',kind:'housing'},
 {name:'Slum (east)',p:MP(970,484),r:70,wealth:'poor',kind:'housing'},
 {name:'Lighthouse point',p:MP(860,418),r:40,wealth:'civic',kind:'lighthouse'},
 {name:'Small garden',p:MP(858,455),r:40,wealth:'middle',kind:'park'},
 {name:'Temple district',p:MP(778,632),r:100,wealth:'civic',kind:'temple'},
 {name:'Temple market',p:MP(733,720),r:70,wealth:'middle',kind:'market'},
 {name:'Amphitheatre (south)',p:MP(690,660),r:50,wealth:'civic',kind:'amph'},
 {name:'Temple garden and baths',p:MP(860,725),r:70,wealth:'rich',kind:'baths'},
 {name:'River garden',p:MP(600,650),r:80,wealth:'middle',kind:'garden'},   // a gridded garden now (GRID_GARDENS), not a park
 {name:'Wealthy homes (west)',p:MP(400,690),r:110,wealth:'rich',kind:'housing'},
 {name:'Wealthy homes (east)',p:MP(700,820),r:130,wealth:'rich',kind:'housing'},
 {name:'Middle town (west)',p:MP(470,610),r:70,wealth:'middle',kind:'housing'},
 {name:'Middle town (centre)',p:MP(640,560),r:80,wealth:'middle',kind:'housing'},
 {name:'Middle town (east)',p:MP(820,560),r:70,wealth:'middle',kind:'housing'},
 {name:'Waterfront',p:MP(640,420),r:60,wealth:'middle',kind:'housing'},
 {name:'Monastery',p:MP(245,200),r:60,wealth:'civic',kind:'monastery'},
 {name:'Prison',p:MP(255,770),r:40,wealth:'civic',kind:'prison'},
 {name:'Caves of Ice',p:MP(340,890),r:40,wealth:'civic',kind:'cave'},
 {name:'Mines and quarries',p:MP(1080,760),r:120,wealth:'poor',kind:'mine'},
 {name:'Pleasure island',p:MP(615,200),r:70,wealth:'civic',kind:'island'},
];
for(const D of DIST){D.x=D.p[0];D.z=D.p[1];}
function districtAt(x,z){let best=null,bd=1e9;for(const D of DIST){const d=Math.hypot(x-D.x,z-D.z)-D.r;if(d<bd){bd=d;best=D;}}return{D:best,d:bd};}
// the city proper: everything inside the wall line's convex sweep, approximated as the union of the town districts + the palace
const CITY_DISCS=DIST.filter(D=>!/mine|monastery|prison|cave|island|farm/.test(D.kind));
// the town: the ground inside the walls and up to the avenue rim, read off the map as one polygon (pixels), less the
// garden district's rectangle (its own grid) and the palace loop (its own court)
const CITY_POLY=[[-515.7,-550.7],[-529.1,-539.0],[-613.3,-427.8],[-633.2,-325.8],[-630.6,27.8],[-433.3,327.2],[-334.6,468.1],[-246.5,560.7],[-153.4,621.0],[71.1,632.1],[73.3,606.3],[274.1,530.0],[530.0,362.8],[568.4,212.6],[517.3,133.1],[500.9,52.6],[524.1,11.1],[562.0,12.7],[617.3,34.7],[657.2,-65.0],[690.3,-150.1],[694.6,-385.4],[342.2,-655.0],[46.4,-820.6],[-251.5,-765.1]];   // Travis's bounds (world metres): no street building outside it
function inPoly(P,x,z){let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;}
const GARDEN_RECT=(function(){const c=MP(500,470);return{x:c[0]-8,z:c[1]+8,w:208,d:112};})();   // 26 × 14 tiles of 8 m
function inGarden(x,z,m){m=m||0;return Math.abs(x-GARDEN_RECT.x)<GARDEN_RECT.w/2+m&&Math.abs(z-GARDEN_RECT.z)<GARDEN_RECT.d/2+m;}
function ER_INCITY(x,z){return inPoly(CITY_POLY,x,z);}
// ---------------------------------------------------------------- the garden grid: cell levels
// The rectangle is 26 × 14 cells of 8 m. Q is the water level of a cell (the ground quantised to 1.5 m, relaxed so no
// neighbour differs by more than a cascade); G is the GROUND of a cell — the same, except a cell whose axis drops to
// its downhill neighbour stands at the LOW level (the slope piece carries its own terrace block). The garden's ground
// is G, piecewise constant, out to the ring road; retaining walls stand on every edge where G differs.
const GARDEN_AX=[2,7,11],GARDEN_CX=[4,12,20];
const GARDEN_BLOCKS=[{key:'xa_bath',c0:6,r0:3,nc:4,nr:3,ry:0,v:2},{key:'xa_bath',c0:15,r0:8,nc:4,nr:3,ry:Math.PI,v:1},{key:'xa_teahouse',c0:21,r0:4,nc:2,nr:2,ry:Math.PI/2,v:0}];
const GARDEN_G=(function(){const R=GARDEN_RECT,NC=Math.round(R.w/8),NR=Math.round(R.d/8),x0=R.x-R.w/2+4,z0=R.z-R.d/2+4;
 const Q=[];for(let r=0;r<NR;r++){Q.push([]);for(let c=0;c<NC;c++)Q[r].push(Math.round(terrainBase(x0+c*8,z0+r*8)/1.5)*1.5);}
 const inB=(r,c)=>GARDEN_BLOCKS.some(B=>c>=B.c0&&c<B.c0+B.nc&&r>=B.r0&&r<B.r0+B.nr);
 // no neighbour more than a cascade (3 m) apart. Lowering alone sank the garden toward its lowest cells, up to 47 m
 // under the hill at its upper edge (Travis: "depressed into the terrain"); the midpoint of the lowered and the raised
 // grounds keeps the same limit and sits the garden in the hill's middle: cut at the top, filled at the bottom
 const relax=(Q,dir)=>{for(let it=0;it<80;it++){let ch=false;for(let r=0;r<NR;r++)for(let c=0;c<NC;c++){for(const [dr,dc] of[[0,1],[1,0],[0,-1],[-1,0]]){const rr2=r+dr,cc=c+dc;if(rr2<0||cc<0||rr2>=NR||cc>=NC)continue;
   if(dir<0&&Q[r][c]>Q[rr2][cc]+3){Q[r][c]=Q[rr2][cc]+3;ch=true;}if(dir>0&&Q[r][c]<Q[rr2][cc]-3){Q[r][c]=Q[rr2][cc]-3;ch=true;}}}if(!ch)break;}return Q;};
 {const lo=relax(Q.map(row=>row.slice()),-1),hi=relax(Q.map(row=>row.slice()),1);for(let r=0;r<NR;r++)for(let c=0;c<NC;c++)Q[r][c]=Math.round((lo[r][c]+hi[r][c])/2/1.5)*1.5;
  // a reserved block (a bath, the teahouse) then stands level at its cells' mean on that ground
  for(const B of GARDEN_BLOCKS){let sm=0;for(let a=0;a<B.nr;a++)for(let b=0;b<B.nc;b++)sm+=Q[B.r0+a][B.c0+b];const yb=Math.round(sm/(B.nr*B.nc)/1.5)*1.5;for(let a=0;a<B.nr;a++)for(let b=0;b<B.nc;b++)Q[B.r0+a][B.c0+b]=yb;}
  // then a two-sided clamp, so the cells round a fixed block (a bath) also come within a cascade of it: each free cell
  // between its highest neighbour less 3 and its lowest plus 3 (the midpoint where both cannot hold); levels stay on 1.5
  for(let it=0;it<200;it++){let ch=false;for(let r=0;r<NR;r++)for(let c=0;c<NC;c++){if(inB(r,c))continue;let mx=-1e9,mn=1e9;for(const [dr,dc] of[[0,1],[1,0],[0,-1],[-1,0]]){const rr2=r+dr,cc=c+dc;if(rr2<0||cc<0||rr2>=NR||cc>=NC)continue;mx=Math.max(mx,Q[rr2][cc]);mn=Math.min(mn,Q[rr2][cc]);}
    const a=mx-3,b=mn+3;const v=a<=b?clamp(Q[r][c],a,b):Math.round((a+b)/2/1.5)*1.5;if(v!==Q[r][c]){Q[r][c]=v;ch=true;}}if(!ch)break;}}
 for(const r of GARDEN_AX){Q[r][0]=Q[r][1];Q[r][NC-1]=Q[r][NC-2];}for(const c of GARDEN_CX){Q[0][c]=Q[1][c];Q[NR-1][c]=Q[NR-2][c];}   // the caps sit level with their neighbour
 const G=Q.map(row=>row.slice());
 for(let r=0;r<NR;r++)for(let c=0;c<NC;c++){if(GARDEN_AX.indexOf(r)>=0){if(c<NC-1&&Q[r][c+1]<Q[r][c])G[r][c]=Q[r][c+1];}else if(GARDEN_CX.indexOf(c)>=0){if(r<NR-1&&Q[r+1][c]<Q[r][c])G[r][c]=Q[r+1][c];}}
 return{Q,G,NC,NR,x0,z0,at:(x,z)=>{const c=clamp(Math.floor((x-x0+4)/8),0,NC-1),r=clamp(Math.floor((z-z0+4)/8),0,NR-1);return G[r][c];}};})();
GARDEN_HFN=(x,z)=>inGarden(x,z,11)?GARDEN_G.at(x,z):null;
// the bank above the garden (round 9c, Travis): where the hill stands above the garden's edge, the ground eases up
// from the garden's level to the hill over GARDEN_BANK m past the 11 m margin, not a 35 m wall at the margin
const GARDEN_BANK=60;
// the levelled regions (round 9c, Travis's polygons): the region south of the garden, and the ridge beside it; each
// point takes the garden's level at the nearest point of the garden (its steps carried south), blending from the
// natural ground over the region's blend in from its outer edges (an edge along the garden blends not at all: that
// had left a ridge beside the garden). Where regions overlap the fuller levelling wins
const LEVEL_REGIONS=[{poly:[[-280.0,4.2],[-67.4,7.4],[-100.8,340.8],[-302.9,266.0],[-361.4,183.7],[-351.9,113.5],[-346.9,44.5]],blend:50},
 {poly:[[-130.7,4.5],[-312.0,-2.1],[-333.9,106.6],[-254.2,112.7]],blend:20}];
for(const L of LEVEL_REGIONS){let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const p of L.poly){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);z0=Math.min(z0,p[1]);z1=Math.max(z1,p[1]);}L.box=[x0,x1,z0,z1];
 L.E=[];for(let i=0;i<L.poly.length;i++){const a=L.poly[i],b=L.poly[(i+1)%L.poly.length];if(!inGarden((a[0]+b[0])/2,(a[1]+b[1])/2,25))L.E.push([a,b]);}}
const levelEdgeD=(E,x,z)=>{let d=1e9;for(const [a,b] of E){const dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz||1;const t=clamp(((x-a[0])*dx+(z-a[1])*dz)/l2,0,1);d=Math.min(d,Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t));}return d;};
LEVEL_FN=(x,z,b)=>{let k=0;for(const L of LEVEL_REGIONS){const B=L.box;if(x<B[0]||x>B[1]||z<B[2]||z>B[3]||!inPoly(L.poly,x,z))continue;k=Math.max(k,smoothstep(0,L.blend,levelEdgeD(L.E,x,z)));}k*=smoothstep(4,9,streamDist(x,z));if(k<=0)return null;   // the stream keeps its channel
 const R=GARDEN_RECT,t=GARDEN_G.at(clamp(x,R.x-R.w/2,R.x+R.w/2),clamp(z,R.z-R.d/2,R.z+R.d/2));return b+(t-b)*k;};
GARDEN_RAMP=(x,z,b)=>{const R=GARDEN_RECT,dx=Math.max(Math.abs(x-R.x)-R.w/2-11,0),dz=Math.max(Math.abs(z-R.z)-R.d/2-11,0),d=Math.hypot(dx,dz);if(d<=0||d>=GARDEN_BANK)return b;
 const e=GARDEN_G.at(clamp(x,R.x-R.w/2,R.x+R.w/2),clamp(z,R.z-R.d/2,R.z+R.d/2));return b<=e?b:e+(b-e)*smoothstep(0,GARDEN_BANK,d)*smoothstep(4,9,streamDist(x,z));};
// ---------------------------------------------------------------- the highway, the avenues and the stream
for(const P of ER_LINES.highway)road(P,12,KL.boulevard,{zone:'highway',lights:true,bench:true});
// the map traces the highway in pieces (a 60 m gap at the east gate cut the road beyond it off): ends within 100 m join
{const H=ER_LINES.highway;for(let i=0;i<H.length;i++)for(let j=i+1;j<H.length;j++)for(const a of[H[i][0],H[i][H[i].length-1]])for(const b of[H[j][0],H[j][H[j].length-1]]){const d=Math.hypot(a[0]-b[0],a[1]-b[1]);if(d>2&&d<100)road([a.slice(),b.slice()],12,KL.boulevard,{zone:'highway',lights:true,bench:true});}}
for(const P of ER_LINES.avenue)road(P,9,KL.boulevard,{zone:'avenue',lights:true,bench:'lot'});
for(const P of ER_LINES.stream){cstroke(cg,P,7,'#2a8aa0');cstroke(mg,P,14,'#000');cstroke(kg,P,12,KLCOL(KL.water));}
// ---------------------------------------------------------------- the walls and the gates
// a gate stands where the highway crosses a wall line (west and east); the palace gate on the south of the palace loop
function segX(a,b,c,d){const r=[b[0]-a[0],b[1]-a[1]],s=[d[0]-c[0],d[1]-c[1]];const den=r[0]*s[1]-r[1]*s[0];if(Math.abs(den)<1e-9)return null;const t=((c[0]-a[0])*s[1]-(c[1]-a[1])*s[0])/den,u=((c[0]-a[0])*r[1]-(c[1]-a[1])*r[0])/den;
 if(t<0||t>1||u<0||u>1)return null;return[a[0]+r[0]*t,a[1]+r[1]*t,Math.atan2(r[0],r[1])];}
const GATES=[];
for(const Wl of ER_LINES.wall)for(let i=0;i<Wl.length-1;i++)for(const Hw of ER_LINES.highway)for(let j=0;j<Hw.length-1;j++){const X=segX(Hw[j],Hw[j+1],Wl[i],Wl[i+1]);if(X)GATES.push({x:X[0],z:X[1],ry:X[2],kind:X[0]<0?'west':'east'});}
// keep one gate per side (the wall lines are traced in pieces); a side whose traced wall stops short of the highway
// gets its gate at the highway point nearest that wall's end
{const byK={};for(const g of GATES){if(!byK[g.kind]||Math.abs(g.x)>Math.abs(byK[g.kind].x))byK[g.kind]=g;}GATES.length=0;for(const k in byK)GATES.push(byK[k]);
 for(const side of['west','east']){if(GATES.some(g=>g.kind===side))continue;const sx=side==='west'?-1:1;const walls=ER_LINES.wall.filter(P=>P.every(p=>p[0]*sx>200)&&!P.some(p=>Math.hypot(p[0]-DIST[0].x,p[1]-DIST[0].z)<DIST[0].r+60));
  let best=null;for(const P of walls)for(const e of[P[0],P[P.length-1]]){const n=nearestOnLines(ER_LINES.highway,e[0],e[1]);if(n&&(!best||n.d<best.d)){best=n;}}
  if(best){const dx=best.b[0]-best.a[0],dz=best.b[1]-best.a[1];GATES.push({x:best.x,z:best.z,ry:Math.atan2(dx,dz),kind:side});}}}
// the citadel (round 9c). Its wall is Travis's polygon (CIT_POLY), resampled every ~8 m so the gate opens one gap.
// Inside: palace grounds on a grid whose unit is a garden tile (CIT_UNIT, aligned with the garden's own grid): the
// palaces, the Pleasure Dome, the temple after Ortaköy, a barracks and three wealthy houses squared to it on whole
// cells (CIT_SITES: each at the free block nearest its target, a one-cell path round it), every other cell a garden
// tile (90b). The cells step like the garden (CIT_G: 1.5 m levels, no neighbour more than a cascade apart, a
// building's cells level at their mean) and the ground inside the wall takes those levels (CIT_HFN). The ground the
// tiles leave (the band along the wall) is park: the biome's undergrowth and a few trees. No streets, stairs or houses
// inside. 90a builds the wall (CIT.loop), 90b the buildings and the tiles (CIT_G)
const PAL=DIST[0];
const CIT_POLY=[[-230.0,-283.6],[-234.7,-152.9],[-233.7,-134.2],[-283.3,-131.8],[-284.7,-67.0],[-285.5,-30.3],[-400.7,-21.4],[-405.1,-68.9],[-444.1,-69.2],
 [-533.9,-69.4],[-516.4,-140.7],[-459.0,-196.4],[-440.7,-213.7],[-438.3,-237.4],[-423.1,-268.2],[-405.0,-290.0],[-394.2,-303.2],[-344.3,-308.8]];
const CIT_UNIT=8,CIT_CLEAR=9;   // a garden tile; a cell's centre at least this far from the wall
const CIT=(function(){const CP=CIT_POLY,loop=[],edge=[];
 for(let i=0;i<CP.length;i++){const a=CP[i],b=CP[(i+1)%CP.length],n=Math.max(1,Math.round(Math.hypot(b[0]-a[0],b[1]-a[1])/8));for(let k=0;k<n;k++){loop.push([a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n]);edge.push(i);}}
 let cx=0,cz=0;for(const p of CP){cx+=p[0];cz+=p[1];}cx/=CP.length;cz/=CP.length;
 const inS=(s,x,z,g)=>{const dx=x-s.p[0],dz=z-s.p[1],c=Math.cos(s.ry),sn=Math.sin(s.ry);return Math.abs(dx*c-dz*sn)<s.hx+g&&Math.abs(dx*sn+dz*c)<s.hz+g;};
 return{c:[cx,cz],loop,edge,inS};})();
function distToLoop(L,x,z){let d=1e9;for(let i=0;i<L.length;i++){const a=L[i],b=L[(i+1)%L.length],dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz||1;const t=clamp(((x-a[0])*dx+(z-a[1])*dz)/l2,0,1);d=Math.min(d,Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t));}return d;}
// inside the citadel's wall, or within m of it
function inCitadel(x,z,m){return inPoly(CIT_POLY,x,z)||(m>0&&distToLoop(CIT_POLY,x,z)<m);}
// the Grand Baths stand OUTSIDE the citadel (round 9c, Travis), on the lot Travis drew south-west of the garden: centred
// on its centroid, the long axis laid along its slanting long edge, then nudged south until it clears the wall by 3 m.
// Streets keep off the lot
const GRAND_BATH_LOT=[[-285.7,-20.9],[-285.4,7.8],[-391.7,26.9],[-391.2,-3.7],[-338.9,-20.7]];
const GRAND_BATH=(function(){const P=GRAND_BATH_LOT;let A=0,cx=0,cz=0;for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length],k=a[0]*b[1]-b[0]*a[1];A+=k;cx+=(a[0]+b[0])*k;cz+=(a[1]+b[1])*k;}A/=2;
 const e=[P[2][0]-P[1][0],P[2][1]-P[1][1]];const B={p:[cx/(6*A),cz/(6*A)],ry:Math.atan2(e[0],e[1]),hx:22,hz:41,m:8};
 const c=Math.cos(B.ry),sn=Math.sin(B.ry),ax=[c,-sn],sg=ax[1]>0?1:-1;
 for(let k=0;k<30;k++){let hit=false;for(const [i,j] of[[-1,-1],[1,-1],[1,1],[-1,1],[0,-1],[0,1],[-1,0],[1,0]]){const x=B.p[0]+i*(B.hx+3)*c+j*(B.hz+3)*sn,z=B.p[1]-i*(B.hx+3)*sn+j*(B.hz+3)*c;if(inCitadel(x,z,3)){hit=true;break;}}if(!hit)break;B.p=[B.p[0]+ax[0]*sg,B.p[1]+ax[1]*sg];}
 return B;})();
CIT.bath=GRAND_BATH;
{let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const p of GRAND_BATH_LOT){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);z0=Math.min(z0,p[1]);z1=Math.max(z1,p[1]);}PRECINCTS.push({x:(x0+x1)/2,z:(z0+z1)/2,rect:{x:(x0+x1)/2,z:(z0+z1)/2,w:x1-x0,d:z1-z0},name:'The Grand Baths'});}
// the buildings on the grid: key, its plot (w × d m, from the def), the variant, and where it wants to stand
const CIT_SITES=[
 {key:'xa_pleasure_dome',w:94,d:94,v:0,t:[-345,-150]},
 {key:'xa_palace',w:60,d:56,v:1,t:[-330,-268]},
 {key:'xa_temple_ortakoy',w:60,d:44,v:0,t:[-470,-108]},
 {key:'xa_vizier',w:44,d:56,v:0,t:[-420,-245]},
 {key:'xa_barracks',w:36,d:34,v:0,t:[-350,-60]},
 {key:'xa_rich_a',w:26,d:30,v:0,t:[-262,-250]},
 {key:'xa_rich_b',w:32,d:26,v:1,t:[-262,-190]},
 {key:'xa_rich_c',w:32,d:18,v:2,t:[-300,-60]}];
// a gridded garden over a polygon: cells of CIT_UNIT inside it at least CLEAR from its edge (and not where skip says),
// SITES squared to it on whole cells, levels stepped as the garden's; at(x,z) the level at a point (null where skipped)
function tileGround(CP,SITES,CLEAR,skip){const U=CIT_UNIT;let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const p of CP){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);z0=Math.min(z0,p[1]);z1=Math.max(z1,p[1]);}
 const ox=GARDEN_G.x0+Math.floor((x0-GARDEN_G.x0)/U)*U,oz=GARDEN_G.z0+Math.floor((z0-GARDEN_G.z0)/U)*U,NC=Math.ceil((x1-ox)/U)+1,NR=Math.ceil((z1-oz)/U)+1;
 const X=c=>ox+c*U,Z=r=>oz+r*U,H=U/2;
 const ok=[];for(let r=0;r<NR;r++){ok.push([]);for(let c=0;c<NC;c++){const x=X(c),z=Z(r);ok[r].push([[-H,-H],[H,-H],[H,H],[-H,H]].every(d=>inPoly(CP,x+d[0],z+d[1]))&&distToLoop(CP,x,z)>=CLEAR&&!(skip&&skip(x,z))&&!inGarden(x,z,12));}}
 const used=ok.map(row=>row.map(()=>null)),blocks=[];
 for(const S of SITES){const nc=Math.ceil(S.w/U),nr=Math.ceil(S.d/U);let best=null,bd=1e9;
  for(let r0=0;r0+nr<=NR;r0++)for(let c0=0;c0+nc<=NC;c0++){const bx=X(c0)+(nc-1)*H,bz=Z(r0)+(nr-1)*H,d=Math.hypot(bx-S.t[0],bz-S.t[1]);if(d>=bd)continue;let fit=true;
   for(let r=r0-1;r<=r0+nr&&fit;r++)for(let c=c0-1;c<=c0+nc;c++){const inner=r>=r0&&r<r0+nr&&c>=c0&&c<c0+nc;if(r<0||c<0||r>=NR||c>=NC){if(inner){fit=false;break;}continue;}
    if(used[r][c]||(inner&&!ok[r][c])){fit=false;break;}}
   if(fit){best={r0,c0,nc,nr,x:bx,z:bz};bd=d;}}
  if(!best){reportErr('citadel: no room for '+S.key);continue;}
  const B=Object.assign({},S,best);blocks.push(B);for(let r=best.r0;r<best.r0+nr;r++)for(let c=best.c0;c<best.c0+nc;c++)used[r][c]=B;}
 // the levels, as the garden's: quantised ground; the midpoint of a lowered and a raised relaxation (no neighbour more
 // than 3 m apart); each building's cells at their mean; then a two-sided clamp round them
 const Q=[];for(let r=0;r<NR;r++){Q.push([]);for(let c=0;c<NC;c++)Q[r].push(ok[r][c]?Math.round(terrainBase(X(c),Z(r))/1.5)*1.5:null);}
 const NB=[[0,1],[1,0],[0,-1],[-1,0]],nb=(r,c,f)=>{for(const [a,b] of NB){const rr2=r+a,cc=c+b;if(rr2>=0&&cc>=0&&rr2<NR&&cc<NC&&ok[rr2][cc])f(rr2,cc);}};
 const relax=(A,dir)=>{for(let it=0;it<120;it++){let ch=false;for(let r=0;r<NR;r++)for(let c=0;c<NC;c++){if(!ok[r][c])continue;nb(r,c,(rr2,cc)=>{if(dir<0&&A[r][c]>A[rr2][cc]+3){A[r][c]=A[rr2][cc]+3;ch=true;}if(dir>0&&A[r][c]<A[rr2][cc]-3){A[r][c]=A[rr2][cc]-3;ch=true;}});}if(!ch)break;}return A;};
 {const lo=relax(Q.map(row=>row.slice()),-1),hi=relax(Q.map(row=>row.slice()),1);for(let r=0;r<NR;r++)for(let c=0;c<NC;c++)if(ok[r][c])Q[r][c]=Math.round((lo[r][c]+hi[r][c])/2/1.5)*1.5;}
 for(const B of blocks){let sm=0;for(let r=B.r0;r<B.r0+B.nr;r++)for(let c=B.c0;c<B.c0+B.nc;c++)sm+=Q[r][c];B.y=Math.round(sm/(B.nr*B.nc)/1.5)*1.5;for(let r=B.r0;r<B.r0+B.nr;r++)for(let c=B.c0;c<B.c0+B.nc;c++)Q[r][c]=B.y;}
 for(let it=0;it<300;it++){let ch=false;for(let r=0;r<NR;r++)for(let c=0;c<NC;c++){if(!ok[r][c]||used[r][c])continue;let mx=-1e9,mn=1e9;nb(r,c,(rr2,cc)=>{mx=Math.max(mx,Q[rr2][cc]);mn=Math.min(mn,Q[rr2][cc]);});if(mn===1e9)continue;
   const a=mx-3,b2=mn+3;const v=a<=b2?clamp(Q[r][c],a,b2):Math.round((a+b2)/2/1.5)*1.5;if(v!==Q[r][c]){Q[r][c]=v;ch=true;}}if(!ch)break;}
 // the level at a point: its cell's, or the nearest cell's (the band along the wall)
 const at=(x,z)=>{if(skip&&skip(x,z))return null;const c0=Math.round((x-ox)/U),r0=Math.round((z-oz)/U);for(let k=0;k<=3;k++){let best=null,bd=1e9;for(let r=r0-k;r<=r0+k;r++)for(let c=c0-k;c<=c0+k;c++){if(r<0||c<0||r>=NR||c>=NC||!ok[r][c])continue;const d=Math.hypot(X(c)-x,Z(r)-z);if(d<bd){bd=d;best=Q[r][c];}}if(best!=null)return best;}return null;};
 return{ox,oz,U,NC,NR,X,Z,ok,used,Q,blocks,at,box:[x0,x1,z0,z1],poly:CP};}
const CIT_G=tileGround(CIT_POLY,CIT_SITES,CIT_CLEAR);
// the gridded gardens (round 9c, Travis): garden tiles like the palace's over polygons Travis drew. The River garden
// replaces the river park; the stream keeps its channel through them (no cell within 10 m of it). No streets or
// houses in them
const GRID_GARDENS=[
 {name:'The River garden',poly:[[42.5,368.0],[102.6,228.6],[46.4,205.4],[-19.8,246.1],[-26.0,308.1],[-0.1,344.2]]},
 {name:'The east garden',poly:[[507.8,-125.2],[596.5,-145.4],[610.1,-62.2],[508.6,-79.7]]},
 // the public bath and garden moved here from the temple district, two shrines (the kit's small temple) beside them
 {name:'The baths garden',poly:[[455.6,420.2],[477.7,433.3],[481.7,458.5],[376.4,588.3],[299.5,624.5],[271.7,547.9],[302.1,521.7],[330.5,507.2],[333.1,485.6],[352.6,476.9],[375.1,449.0],[391.7,464.7],[430.5,449.4]],
  sites:[{key:'xa_bath',w:34,d:38,v:1,t:[420,470]},{key:'xa_garden',w:42,d:36,v:2,t:[340,550]},{key:'xa_temple',w:34,d:32,v:0,t:[390,520]},{key:'xa_temple',w:34,d:32,v:1,t:[310,590]}]}];
for(const g of GRID_GARDENS)g.G=tileGround(g.poly,g.sites||[],4,(x,z)=>streamDist(x,z)<10);
function inGridGarden(x,z,m){return GRID_GARDENS.some(g=>inPoly(g.poly,x,z)||(m>0&&distToLoop(g.poly,x,z)<m));}
// the gridded gardens' ground (the citadel's and the River garden's)
CIT_HFN=(x,z)=>{for(const G of[CIT_G].concat(GRID_GARDENS.map(g=>g.G))){const b=G.box;if(x<b[0]||x>b[1]||z<b[2]||z>b[3]||!inPoly(G.poly,x,z))continue;return G.at(x,z);}return null;};
for(const g of GRID_GARDENS){cpoly(cg,g.poly,'#4f7f42');cpoly(mg,g.poly,'#00ff00');cpoly(kg,g.poly,KLCOL(KL.park));}
// the citadel's ground is palace grounds: not buildable; park where the tiles leave it (the biome's undergrowth and a
// few trees; 90b makes every building and tile an obstacle to it)
cpoly(cg,CIT_POLY,'#4f7f42');cpoly(mg,CIT_POLY,'#00ff00');cpoly(kg,CIT_POLY,KLCOL(KL.park));
// the palace gate: on a wall facing the plaza (outward normal toward it), the point of such a wall nearest the plaza,
// clear of the corners, turned to face in
{const pl=MP(340,533),CP=CIT_POLY;let best=null,bd=1e9;CIT.loop.forEach((p,k)=>{const i=CIT.edge[k],a=CP[i],b=CP[(i+1)%CP.length];if(Math.hypot(p[0]-a[0],p[1]-a[1])<14||Math.hypot(p[0]-b[0],p[1]-b[1])<14)return;
  const l=Math.hypot(b[0]-a[0],b[1]-a[1]);let nx=-(b[1]-a[1])/l,nz=(b[0]-a[0])/l;if(inPoly(CP,p[0]+nx*2,p[1]+nz*2)){nx=-nx;nz=-nz;}
  const dx=pl[0]-p[0],dz=pl[1]-p[1],dl=Math.hypot(dx,dz);if((dx*nx+dz*nz)/dl<.7)return;if(dl<bd){bd=dl;best={x:p[0],z:p[1],ry:Math.atan2(-nx,-nz)-Math.PI};}});
 if(best)GATES.push(Object.assign(best,{kind:'palace'}));else reportErr('citadel: no gate toward the plaza');}
for(const g of GATES){disc(g.x,g.z,22,'plaza','#c9b48a');precinct(g.x,g.z,20,g.kind+' gate');}
// ---------------------------------------------------------------- the plazas, the markets, the parks (painted; the build fills them)
const PLAZAS=[];
// a plaza levels its disc (round 9c, Travis: "plazas should deploy a leveling effect"): flat at the mean ground under
// it, blending out over its apron; a park keeps its ground
function plaza(x,z,r,name,type){const c=[x,z];disc(x,z,r,type||'plaza');precinct(x,z,r+2,name);PLAZAS.push({x,z,r,name});
 if(type!=='park'){let sm=0,n=0;for(let a=0;a<12;a++)for(const k of[0,.5,1]){sm+=groundLevel(x+Math.cos(a/12*TAU)*r*k,z+Math.sin(a/12*TAU)*r*k);n++;}PLAZAS[PLAZAS.length-1].y=sm/n;cityFlat(x,z,r,Math.max(8,r*.6),sm/n);}
 for(const R of ROADS)if(R.pts.some(p=>Math.hypot(p[0]-x,p[1]-z)<r+R.w+40)){cstroke(cg,R.pts,R.w,ROADCOL[R.cls]);cstroke(mg,R.pts,R.w+2,'#000');cstroke(kg,R.pts,R.w+1,KLCOL(R.cls));}}
plaza(MP(340,533)[0],MP(340,533)[1],34,'The plaza');
for(const D of DIST)if(D.kind==='market')plaza(D.x,D.z,D.r*.42,D.name);
// the parks and the island keep no street grid: no contour street or stair runs within their radius (Travis, round 9c)
const PARKS=DIST.filter(D=>D.kind==='park'||D.kind==='island');const inPark=(x,z)=>PARKS.some(D=>Math.hypot(x-D.x,z-D.z)<D.r);
// no houses on the Pleasure Dome's island (Travis, round 9c): the frontage and the infill skip it
const NOHOUSE=DIST.filter(D=>D.kind==='island');const noHouse=(x,z)=>NOHOUSE.some(D=>Math.hypot(x-D.x,z-D.z)<D.r+15)||inCitadel(x,z,6)||inGridGarden(x,z,6);   // nor inside the citadel or a gridded garden
for(const D of DIST)if(D.kind==='park')plaza(D.x,D.z,D.r*.7,D.name,'park');
{const R=GARDEN_RECT,pts=[[R.x-R.w/2,R.z-R.d/2],[R.x+R.w/2,R.z-R.d/2],[R.x+R.w/2,R.z+R.d/2],[R.x-R.w/2,R.z+R.d/2]];cpoly(cg,pts,'#3a7a3c');cpoly(mg,pts,'#00ff00');cpoly(kg,pts,KLCOL(KL.park));   // the garden district: a park under its tiles
 const m=7,ring=[[R.x-R.w/2-m,R.z-R.d/2-m],[R.x+R.w/2+m,R.z-R.d/2-m],[R.x+R.w/2+m,R.z+R.d/2+m],[R.x-R.w/2-m,R.z+R.d/2+m],[R.x-R.w/2-m,R.z-R.d/2-m]];// resampled every 4 m, so its bench follows the garden's stepped edge, not a ramp corner to corner (round 9c)
 const ringD=[];for(let i=0;i<ring.length-1;i++){const a=ring[i],b=ring[i+1],n=Math.max(1,Math.round(Math.hypot(b[0]-a[0],b[1]-a[1])/4));for(let k=0;k<n;k++)ringD.push([a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n]);}ringD.push(ring[ring.length-1].slice());
 road(ringD,8,KL.boulevard,{zone:'garden ring',lights:true,bench:true});   // the ring road the rich face the garden from
 precinct(R.x,R.z,0,'garden district');PRECINCTS[PRECINCTS.length-1].rect=R;}
// ---------------------------------------------------------------- contour streets: the town's own streets follow the ground
// marching squares over an 8 m grid at every ΔH of height inside the city's buildable ground, linked into polylines
// and simplified; then stairs run down the fall line every ~70 m from one contour toward the next
function contourLines(h0,cell,inside){const N=Math.ceil(ER.W/cell),M=Math.ceil(ER.H/cell),segs=[];const X=i=>-ER.W/2+i*cell,Z=j=>-ER.H/2+j*cell;
 const V=[];for(let j=0;j<=M;j++){const row=[];for(let i=0;i<=N;i++)row.push(terrainBase(X(i),Z(j))-h0);V.push(row);}
 const lerpP=(a,b,va,vb)=>{const t=va/(va-vb);return[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];};
 for(let j=0;j<M;j++)for(let i=0;i<N;i++){const c=[[X(i),Z(j)],[X(i+1),Z(j)],[X(i+1),Z(j+1)],[X(i),Z(j+1)]],v=[V[j][i],V[j][i+1],V[j+1][i+1],V[j+1][i]];
  if(!inside((c[0][0]+c[2][0])/2,(c[0][1]+c[2][1])/2))continue;
  const pts=[];for(let e=0;e<4;e++){const a=e,b=(e+1)%4;if((v[a]<0)!==(v[b]<0))pts.push(lerpP(c[a],c[b],v[a],v[b]));}
  if(pts.length===2)segs.push(pts);else if(pts.length===4){segs.push([pts[0],pts[1]]);segs.push([pts[2],pts[3]]);}}
 // link: hash endpoints
 const key=p=>Math.round(p[0]*2)+','+Math.round(p[1]*2);const H={};segs.forEach((s,i)=>{for(const p of s){const k=key(p);(H[k]||(H[k]=[])).push(i);}});
 const used=new Uint8Array(segs.length),lines=[];
 for(let i=0;i<segs.length;i++){if(used[i])continue;used[i]=1;let line=[segs[i][0],segs[i][1]];
  for(const dir of[1,0]){let cur=dir?line[line.length-1]:line[0];for(let guard=0;guard<4000;guard++){const L=H[key(cur)];let nx=-1;if(L)for(const q of L)if(!used[q]){nx=q;break;}if(nx<0)break;used[nx]=1;const s=segs[nx];const other=key(s[0])===key(cur)?s[1]:s[0];if(dir)line.push(other);else line.unshift(other);cur=other;}}
  if(line.length>3)lines.push(line);}
 return lines;}
function simplify(pts,eps){if(pts.length<3)return pts;const out=[pts[0]];let last=pts[0];for(let i=1;i<pts.length-1;i++){if(Math.hypot(pts[i][0]-last[0],pts[i][1]-last[1])>=eps){out.push(pts[i]);last=pts[i];}}out.push(pts[pts.length-1]);return out;}
erBakeMasks();
const STREETS=[];
(function streets(){const inside=(x,z)=>{if(!ER_INCITY(x,z))return false;if(inGridGarden(x,z,8))return false;if(ISLAND&&ISLAND.edge(x,z)>-15)return false;if(inCitadel(x,z,10))return false;if(inGarden(x,z,9))return false;if(Math.hypot(x-PAL.x,z-PAL.z)<PAL.r-10)return false;const c=erClass(x,z);if(c<1||c>3)return false;const s=erSlope(x,z);return s<.9;};
 // a district's contour interval follows its slope: tight on the steep town, looser on the flats
 let hmin=1e9,hmax=-1e9;for(const D of CITY_DISCS){const h=terrainBase(D.x,D.z);hmin=Math.min(hmin,h);hmax=Math.max(hmax,h);}
 // contours every 3 m of height, THINNED so streets stay ~26 m apart on the ground whatever the slope (Travis: on the
 // steep central slopes a fixed height interval packed the streets too close for a plot between them): a run of a
 // contour is kept only where it is at least GAP from every street already accepted (the highway and avenues count)
 const GAP=34,HC=12,SH={};const hk=(x,z)=>Math.floor(x/HC)+','+Math.floor(z/HC);
 const mark=pts=>{for(const p of pts)for(let t=0;t<1;t+=.34){const q=p;(SH[hk(q[0],q[1])]||(SH[hk(q[0],q[1])]=[])).push(q);}};
 const markLine=pts=>{for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/6));for(let k=0;k<=n;k++){const q=[a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n];(SH[hk(q[0],q[1])]||(SH[hk(q[0],q[1])]=[])).push(q);}}};
 // a point on a street already laid (the contour streets are painted only once the network is final): a marked
 // street point within 5 m
 const onStreet=(x,z)=>{const ix=Math.floor(x/HC),iz=Math.floor(z/HC);for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const L=SH[(ix+a)+','+(iz+b)];if(!L)continue;for(const q of L)if(Math.hypot(q[0]-x,q[1]-z)<5)return true;}return false;};
 const nearStreet=(x,z)=>{const ix=Math.floor(x/HC),iz=Math.floor(z/HC),R=Math.ceil(GAP/HC);for(let a=-R;a<=R;a++)for(let b=-R;b<=R;b++){const L=SH[(ix+a)+','+(iz+b)];if(!L)continue;for(const q of L)if(Math.hypot(q[0]-x,q[1]-z)<GAP*.6)return true;}return false;};   // a run is cut only when it comes within .6 GAP of a street; between .6 and 1 GAP it stays (fewer fragments)
 for(const R of ROADS)markLine(R.pts);
 for(let h=Math.floor(hmin/3)*3;h<hmax+60;h+=3){const lines=contourLines(h,8,inside);
  for(const L of lines){const s=simplify(L,9);
   // keep clear of the plazas and the palace loop's inside (its own court), then split into the runs far enough from every street
   let run=[];const flush=()=>{if(run.length>=3){let len=0;for(let i=1;i<run.length;i++)len+=Math.hypot(run[i][0]-run[i-1][0],run[i][1]-run[i-1][1]);if(len>=24){const m0=run[Math.floor(run.length/2)],dm=districtAt(m0[0],m0[1]);const r=road(run,5,KL.minor,{zone:'contour',bench:'lot',defer:true,lights:dm.D.kind==='market'||(dm.D.wealth==='rich'&&dm.d<0)});STREETS.push(r);markLine(run);}}run=[];};
   for(const p of s){if(inPrecinct(p[0],p[1],6)||inPark(p[0],p[1])||Math.hypot(p[0]-PAL.x,p[1]-PAL.z)<PAL.r-10||nearStreet(p[0],p[1]))flush();else run.push(p);}flush();}}
 // the links (Travis, round 9c): the thinning cuts contour runs short, so their ends stopped dead. Each end joins the
 // nearest other street within 40 m: a lane where the rise allows, a stair where it is steep
 {const ok=(x,z)=>ER_INCITY(x,z)&&!inGarden(x,z,9)&&!inPark(x,z)&&!inPrecinct(x,z,2)&&Math.hypot(x-PAL.x,z-PAL.z)>=PAL.r-10;let nl=0;
  for(const S of STREETS.slice())for(const e of[0,1]){const P=S.pts,E=e?P[P.length-1]:P[0];let best=null;
   for(const R of ROADS){if(R===S||R.cls===KL.stair)continue;const Q=R.pts;for(let i=0;i<Q.length-1;i++){const a=Q[i],b=Q[i+1],dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz||1;const t=clamp(((E[0]-a[0])*dx+(E[1]-a[1])*dz)/l2,0,1);
    const q=[a[0]+dx*t,a[1]+dz*t],d=Math.hypot(E[0]-q[0],E[1]-q[1]);if(!best||d<best.d)best={q,d};}}
   if(!best||best.d>40||best.d<3)continue;let clear=true;for(let t=0;t<=1;t+=.1){const x=E[0]+(best.q[0]-E[0])*t,z=E[1]+(best.q[1]-E[1])*t;if(!ok(x,z)){clear=false;break;}}if(!clear)continue;
   const steep=Math.abs(terrainBase(best.q[0],best.q[1])-terrainBase(E[0],E[1]))/best.d>.3;road([E.slice(),best.q],steep?3:4,steep?KL.stair:KL.minor,{zone:steep?'stair':'link',defer:true});nl++;}
  window._links=nl;}
 erBakeMasks();
 // stairs: from points along each contour street, down the gradient until a road or 70 m
 let n=0;for(const R of STREETS){let acc=0;for(let i=1;i<R.pts.length;i++){const a=R.pts[i-1],b=R.pts[i];const L=Math.hypot(b[0]-a[0],b[1]-a[1]);acc+=L;if(acc<42)continue;acc=0;   // an alley or stair down the fall line every ~40 m
  let p=[(a[0]+b[0])/2,(a[1]+b[1])/2];const path=[p.slice()];for(let k=0;k<20;k++){const g=erGrad(p[0],p[1]);const gl=Math.hypot(g[0],g[1]);if(gl<.03)break;p=[p[0]-g[0]/gl*5,p[1]-g[1]/gl*5];path.push(p.slice());if(k>1&&onStreet(p[0],p[1]))break;if(!inside(p[0],p[1])||inPark(p[0],p[1]))break;}
  if(path.length>3){road(path,3,KL.stair,{zone:'stair',defer:true});n++;}}}
 window._streets=STREETS.length;window._stairs=n;})();
// gate roads: each gate joins the highway (it stands on it); the palace gate joins the plaza
{const g=GATES.find(g=>g.kind==='palace');const pl=PLAZAS[0];if(g&&pl)road([[g.x,g.z],[pl.x,pl.z]],9,KL.boulevard,{zone:'avenue',lights:true});}
erBakeMasks();
