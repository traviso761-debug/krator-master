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
 {name:'River garden',p:MP(600,650),r:80,wealth:'middle',kind:'park'},
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
 for(const B of GARDEN_BLOCKS){let yb=1e9;for(let a=0;a<B.nr;a++)for(let b=0;b<B.nc;b++)yb=Math.min(yb,Q[B.r0+a][B.c0+b]);for(let a=0;a<B.nr;a++)for(let b=0;b<B.nc;b++)Q[B.r0+a][B.c0+b]=yb;}
 for(let it=0;it<80;it++){let ch=false;for(let r=0;r<NR;r++)for(let c=0;c<NC;c++){if(inB(r,c))continue;for(const [dr,dc] of[[0,1],[1,0],[0,-1],[-1,0]]){const rr2=r+dr,cc=c+dc;if(rr2<0||cc<0||rr2>=NR||cc>=NC)continue;if(Q[r][c]>Q[rr2][cc]+3){Q[r][c]=Q[rr2][cc]+3;ch=true;}}}if(!ch)break;}
 for(const r of GARDEN_AX){Q[r][0]=Q[r][1];Q[r][NC-1]=Q[r][NC-2];}for(const c of GARDEN_CX){Q[0][c]=Q[1][c];Q[NR-1][c]=Q[NR-2][c];}   // the caps sit level with their neighbour
 const G=Q.map(row=>row.slice());
 for(let r=0;r<NR;r++)for(let c=0;c<NC;c++){if(GARDEN_AX.indexOf(r)>=0){if(c<NC-1&&Q[r][c+1]<Q[r][c])G[r][c]=Q[r][c+1];}else if(GARDEN_CX.indexOf(c)>=0){if(r<NR-1&&Q[r+1][c]<Q[r][c])G[r][c]=Q[r+1][c];}}
 return{Q,G,NC,NR,x0,z0,at:(x,z)=>{const c=clamp(Math.floor((x-x0+4)/8),0,NC-1),r=clamp(Math.floor((z-z0+4)/8),0,NR-1);return G[r][c];}};})();
GARDEN_HFN=(x,z)=>inGarden(x,z,11)?GARDEN_G.at(x,z):null;
// ---------------------------------------------------------------- the highway, the avenues and the stream
for(const P of ER_LINES.highway)road(P,12,KL.boulevard,{zone:'highway',lights:true,bench:true});
for(const P of ER_LINES.avenue)road(P,9,KL.boulevard,{zone:'avenue',lights:true,bench:true});
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
// the palace loop: the wall polylines near the palace; its gate at the loop's southernmost point, facing south to the plaza
const PAL=DIST[0];const PALWALL=ER_LINES.wall.filter(P=>P.some(p=>Math.hypot(p[0]-PAL.x,p[1]-PAL.z)<PAL.r+60));
{let best=null;for(const P of PALWALL)for(const p of P)if(!best||p[1]>best[1])best=p;if(best)GATES.push({x:best[0],z:best[1]-2,ry:0,kind:'palace'});}
for(const g of GATES){disc(g.x,g.z,22,'plaza','#c9b48a');precinct(g.x,g.z,20,g.kind+' gate');}
// ---------------------------------------------------------------- the plazas, the markets, the parks (painted; the build fills them)
const PLAZAS=[];
function plaza(x,z,r,name,type){const c=[x,z];disc(x,z,r,type||'plaza');precinct(x,z,r+2,name);PLAZAS.push({x,z,r,name});
 for(const R of ROADS)if(R.pts.some(p=>Math.hypot(p[0]-x,p[1]-z)<r+R.w+40)){cstroke(cg,R.pts,R.w,ROADCOL[R.cls]);cstroke(mg,R.pts,R.w+2,'#000');cstroke(kg,R.pts,R.w+1,KLCOL(R.cls));}}
plaza(MP(340,533)[0],MP(340,533)[1],34,'The plaza');
for(const D of DIST)if(D.kind==='market')plaza(D.x,D.z,D.r*.42,D.name);
for(const D of DIST)if(D.kind==='park')plaza(D.x,D.z,D.r*.7,D.name,'park');
{const R=GARDEN_RECT,pts=[[R.x-R.w/2,R.z-R.d/2],[R.x+R.w/2,R.z-R.d/2],[R.x+R.w/2,R.z+R.d/2],[R.x-R.w/2,R.z+R.d/2]];cpoly(cg,pts,'#3a7a3c');cpoly(mg,pts,'#00ff00');cpoly(kg,pts,KLCOL(KL.park));   // the garden district: a park under its tiles
 const m=7,ring=[[R.x-R.w/2-m,R.z-R.d/2-m],[R.x+R.w/2+m,R.z-R.d/2-m],[R.x+R.w/2+m,R.z+R.d/2+m],[R.x-R.w/2-m,R.z+R.d/2+m],[R.x-R.w/2-m,R.z-R.d/2-m]];road(ring,8,KL.boulevard,{zone:'garden ring',lights:true,bench:true});   // the ring road the rich face the garden from
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
(function streets(){const inside=(x,z)=>{if(!ER_INCITY(x,z))return false;if(inGarden(x,z,9))return false;if(Math.hypot(x-PAL.x,z-PAL.z)<PAL.r-10)return false;const c=erClass(x,z);if(c<1||c>3)return false;const s=erSlope(x,z);return s<.9;};
 // a district's contour interval follows its slope: tight on the steep town, looser on the flats
 let hmin=1e9,hmax=-1e9;for(const D of CITY_DISCS){const h=terrainBase(D.x,D.z);hmin=Math.min(hmin,h);hmax=Math.max(hmax,h);}
 // contours every 3 m of height, THINNED so streets stay ~26 m apart on the ground whatever the slope (Travis: on the
 // steep central slopes a fixed height interval packed the streets too close for a plot between them): a run of a
 // contour is kept only where it is at least GAP from every street already accepted (the highway and avenues count)
 const GAP=34,HC=12,SH={};const hk=(x,z)=>Math.floor(x/HC)+','+Math.floor(z/HC);
 const mark=pts=>{for(const p of pts)for(let t=0;t<1;t+=.34){const q=p;(SH[hk(q[0],q[1])]||(SH[hk(q[0],q[1])]=[])).push(q);}};
 const markLine=pts=>{for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/6));for(let k=0;k<=n;k++){const q=[a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n];(SH[hk(q[0],q[1])]||(SH[hk(q[0],q[1])]=[])).push(q);}}};
 const nearStreet=(x,z)=>{const ix=Math.floor(x/HC),iz=Math.floor(z/HC),R=Math.ceil(GAP/HC);for(let a=-R;a<=R;a++)for(let b=-R;b<=R;b++){const L=SH[(ix+a)+','+(iz+b)];if(!L)continue;for(const q of L)if(Math.hypot(q[0]-x,q[1]-z)<GAP*.6)return true;}return false;};   // a run is cut only when it comes within .6 GAP of a street; between .6 and 1 GAP it stays (fewer fragments)
 for(const R of ROADS)markLine(R.pts);
 for(let h=Math.floor(hmin/3)*3;h<hmax+60;h+=3){const lines=contourLines(h,8,inside);
  for(const L of lines){const s=simplify(L,9);
   // keep clear of the plazas and the palace loop's inside (its own court), then split into the runs far enough from every street
   let run=[];const flush=()=>{if(run.length>=3){let len=0;for(let i=1;i<run.length;i++)len+=Math.hypot(run[i][0]-run[i-1][0],run[i][1]-run[i-1][1]);if(len>=24){const m0=run[Math.floor(run.length/2)],dm=districtAt(m0[0],m0[1]);const r=road(run,5,KL.minor,{zone:'contour',bench:true,lights:dm.D.kind==='market'||(dm.D.wealth==='rich'&&dm.d<0)});STREETS.push(r);markLine(run);}}run=[];};
   for(const p of s){if(inPrecinct(p[0],p[1],6)||Math.hypot(p[0]-PAL.x,p[1]-PAL.z)<PAL.r-10||nearStreet(p[0],p[1]))flush();else run.push(p);}flush();}}
 erBakeMasks();
 // stairs: from points along each contour street, down the gradient until a road or 70 m
 let n=0;for(const R of STREETS){let acc=0;for(let i=1;i<R.pts.length;i++){const a=R.pts[i-1],b=R.pts[i];const L=Math.hypot(b[0]-a[0],b[1]-a[1]);acc+=L;if(acc<42)continue;acc=0;   // an alley or stair down the fall line every ~40 m
  let p=[(a[0]+b[0])/2,(a[1]+b[1])/2];const path=[p.slice()];for(let k=0;k<20;k++){const g=erGrad(p[0],p[1]);const gl=Math.hypot(g[0],g[1]);if(gl<.03)break;p=[p[0]-g[0]/gl*5,p[1]-g[1]/gl*5];path.push(p.slice());if(k>1&&isRoad(p[0],p[1]))break;if(!inside(p[0],p[1]))break;}
  if(path.length>3){road(path,3,KL.stair,{zone:'stair'});n++;}}}
 window._streets=STREETS.length;window._stairs=n;})();
// gate roads: each gate joins the highway (it stands on it); the palace gate joins the plaza
{const g=GATES.find(g=>g.kind==='palace');const pl=PLAZAS[0];if(g&&pl)road([[g.x,g.z],[pl.x,pl.z]],9,KL.boulevard,{zone:'avenue',lights:true});}
erBakeMasks();
