// ================================================================= EREWHON — the build
// Order: the landmarks on levelled pads (the palace precinct, the temple district, the island, the dockyard, the
// prison, the caves, the lighthouse, the arena and amphitheatres, the guilds, the baths) → the garden district's rill
// grid → the frontage walker along every street, zoned by district wealth → the farms and the mines outside the
// walls → the hanging lights on the avenues → the terrain mesh → the biome → one bake per CHUNK (the runtime LOD).
const BUILD_T0=performance.now();reseed(SEED_ER+7);
const P=(px,py)=>MP(px,py);
const gy=(x,z)=>terrainBase(x,z);
// ---------------------------------------------------------------- 1. the landmarks
// the palace precinct: the Sultan's palace at the loop's crown, the Garden Pleasure Dome beside it, the temple after
// Ortaköy, the Vizier's palace, all on their own pads inside the wall
{const c=P(425,392);planLandmark('xa_palace',c[0],c[1],Math.PI*.9,{v:1,apron:24});
 const d=P(418,432);planLandmark('xa_pleasure_dome',d[0],d[1],Math.PI,{v:0,apron:30});
 const t=P(346,462);planLandmark('xa_temple_ortakoy',t[0],t[1],Math.PI*.5,{v:0,apron:16});
 const v=P(392,486);planLandmark('xa_vizier',v[0],v[1],Math.PI*.75,{v:0,apron:16});
 const g=GATES.find(g=>g.kind==='palace');if(g)planLandmark('xa_palace_gate',g.x,g.z,g.ry+Math.PI,{apron:8,rk:.7});}
// the plaza before the palace gate: a fountain garden tile and the mustering ground beside the military district
{const pl=PLAZAS[0];planLandmark('xa_star_court',pl.x,pl.z,0,{apron:6,rk:.8});}
// the city gates
for(const g of GATES){if(g.kind==='palace')continue;planLandmark('xa_gate',g.x,g.z,g.ry+(g.kind==='east'?Math.PI:0),{v:g.kind==='west'?0:2,apron:10,rk:.8});}
// the military district by the lake: barracks, the fortress, the mustering ground, the city watch
{const D=DIST.find(d=>d.kind==='military');planLandmark('xa_fortress',D.x-20,D.z-30,0,{apron:14});planLandmark('xa_barracks',D.x+50,D.z+10,Math.PI/2,{apron:10});planLandmark('xa_muster',D.x-10,D.z+60,0,{apron:10});planLandmark('xa_watch',D.x+70,D.z+70,Math.PI,{apron:8});}
// the arena hill and the two amphitheatres
{const D=DIST.find(d=>d.kind==='arena');planLandmark('xa_arena',D.x,D.z,0,{apron:20});
 for(const A of DIST.filter(d=>d.kind==='amph'))planLandmark('xa_amphitheatre',A.x,A.z,Math.atan2(-A.x,-A.z),{v:A.z>0?1:0,apron:16});}
// the temple district: the Grand Temple, two monasteries, a temple; the temple garden and baths; the temple market's own temple
{const D=DIST.find(d=>d.kind==='temple');planLandmark('xa_grand_temple',D.x,D.z-10,Math.PI*.1,{apron:18});
 planLandmark('xa_monastery',D.x-80,D.z+30,Math.PI*.4,{v:1,apron:12});planLandmark('xa_monastery',D.x+70,D.z-60,Math.PI*1.3,{v:2,apron:12});planLandmark('xa_temple',D.x+60,D.z+60,Math.PI*.9,{v:2,apron:10});
 const B=DIST.find(d=>d.kind==='baths');planLandmark('xa_bath',B.x-20,B.z-20,Math.PI*1.1,{v:1,apron:12});planLandmark('xa_garden',B.x+30,B.z+30,0,{v:2,apron:12});}
// the neighbourhood temples: one by each market and one in each slum, Palopó-painted near the markets
for(const D of DIST.filter(d=>d.kind==='market'))planLandmark('xa_temple_palopo',D.x+D.r*.55,D.z+D.r*.35,Math.atan2(-D.r*.55,-D.r*.35),{v:Math.floor(rng()*3),apron:8});
for(const D of DIST.filter(d=>/Slum/.test(d.name)))planLandmark('xa_temple',D.x+20,D.z-20,Math.PI*.2,{v:Math.floor(rng()*3),apron:8});
// the guilds, along the highway west of the main market; the Spicers' Guild at the main market
{const M=DIST.find(d=>d.name==='Main market');planLandmark('xa_guild_spicer',M.x-70,M.z+50,Math.PI*.05,{apron:10});
 const keys=['xa_guild_gold','xa_guild_alch','xa_guild_mason','xa_guild_farm'];const W=DIST.find(d=>d.name==='Industry (west)');
 keys.forEach((k,i)=>planLandmark(k,W.x-60+i*38,W.z+70,Math.PI,{apron:8,v:i%3}));
 planLandmark('xa_generator',W.x+20,W.z-40,Math.PI/2,{apron:8});}
// the dockyard: quays on the shore, boat sheds, warehouses, the smithy; the lighthouse on its point; the small garden
{const D=DIST.find(d=>d.kind==='dock');const s=nearestOnLines([ER_LINES.stream[0]||[[0,0],[1,1]]],D.x,D.z);
 const shoreZ=x=>{for(let z=D.z+60;z>D.z-300;z-=2)if(terrainBase(x,z)<.4)return z;return D.z-52;};   // the water's edge north of the district
 for(let k=0;k<3;k++){const x=D.x-40+k*32;planLandmark('xa_quay',x,shoreZ(x)-3,Math.PI,{v:k%3,apron:6,y:ER.LAKE+.4});}
 planLandmark('xa_boatshed',D.x+60,shoreZ(D.x+60)-6,Math.PI,{apron:6,y:ER.LAKE+.3});planLandmark('xa_warehouse',D.x-30,D.z-10,0,{apron:8});planLandmark('xa_warehouse',D.x+30,D.z+2,Math.PI*.1,{v:2,apron:8});planLandmark('xa_smithy',D.x+80,D.z-10,Math.PI/2,{apron:6});
 const L=DIST.find(d=>d.kind==='lighthouse');planLandmark('xa_lighthouse',L.x,L.z-20,0,{apron:6,rk:1.2});
 const G=DIST.find(d=>d.kind==='park'&&/Small/.test(d.name));planLandmark('xa_garden',G.x,G.z,Math.PI,{v:1,apron:10});}
// the Pleasure Dome of the Bay on its island, the barge at its dock
{const I=DIST.find(d=>d.kind==='island');planLandmark('xa_pleasure_dome_bay',I.x,I.z-10,Math.PI,{v:0,apron:26,dy:1.6});}
// the monastery on the western headland, the prison in the cliff, the mouth of the Caves of Ice where the stream rises
{const M=DIST.find(d=>d.kind==='monastery');planLandmark('xa_monastery',M.x,M.z,Math.PI*.25,{v:0,apron:14});
 const Pz=DIST.find(d=>d.kind==='prison');planLandmark('xa_prison',Pz.x,Pz.z,Math.PI*.35,{apron:10,rk:.9});
 const S=ER_LINES.stream.reduce((a,b)=>a.concat(b),[]).reduce((a,p)=>p[1]>a[1]?p:a,[0,-1e9]);planLandmark('xa_ice_cave',S[0],S[1]+4,Math.PI,{apron:12,rk:.8});}
// the public baths and the Grand Baths at the head of the garden district, the teahouse in it
// (their pads are set with the garden grid below)
// ---------------------------------------------------------------- 2. the garden district: the rill grid down the slope
// Three axes of 8 m tiles running east down the hill from the palace wall to the garden market, every tile a rill
// module whose rise follows the ground (straight / step / cascade / waterfall / weir), cross rills between them with
// bends, tees and crosses, and the courts of the garden brief in the bays: the star basin, the plunge pool, the lily
// pond, the cactus court, the pergola walk, the kiosk, the vault pavilion; the Grand Baths at the top, two public
// baths and the teahouse on the axes. Each tile flattens its own pad so the water reads level and the drops are the
// modules'.
const GARDEN={tiles:[]};
(function gardenDistrict(){const R=GARDEN_RECT,GG=GARDEN_G,Q=GG.Q,G=GG.G,NC=GG.NC,NR=GG.NR,x0=GG.x0,z0=GG.z0,AX=GARDEN_AX,CX=GARDEN_CX;const isAx=r=>AX.indexOf(r)>=0,isCx=c=>CX.indexOf(c)>=0;
 const courts=['xa_star_court','xa_plunge_pool','xa_lily_pond','xa_cactus_court','xa_pergola','xa_kiosk','xa_brick_court','xa_bath_pool','xa_vault_pavilion','xa_rill_jets'];let ci=0;
 const blocked=(r,c)=>GARDEN_BLOCKS.find(B=>c>=B.c0&&c<B.c0+B.nc&&r>=B.r0&&r<B.r0+B.nr);
 const tile=(key,x,z,ry,y,o)=>{const P=plan(key,x,z,ry,Object.assign({v:0,y},o||{}),{h:6,garden:true});P.y=y;GARDEN.tiles.push(P);return P;};
 // the water piece for a drop d between a cell and its downhill neighbour; its origin is the LOW level and its high
 // end (local +z) faces uphill
 const piece=d=>d<.1?'xa_rill':d<1.2?'xa_rill_weir':d<2.2?'xa_rill_step':'xa_rill_cascade';
 for(let r=0;r<NR;r++)for(let c=0;c<NC;c++){const x=x0+c*8,z=z0+r*8,y=Q[r][c];const B=blocked(r,c);
  if(B){if(r===B.r0&&c===B.c0){const bx=x0+(B.c0+B.nc/2-.5)*8,bz=z0+(B.r0+B.nr/2-.5)*8;planLandmark(B.key,bx,bz,B.ry,{v:B.v,apron:3,y:Q[B.r0][B.c0],ppad:0});}continue;}
  let key=null,ry=0,yy=y;
  if(isAx(r)&&isCx(c)){key='xa_rill_cross';ry=0;}
  else if(isAx(r)){if(c===0){key='xa_rill_fountain';ry=Math.PI/2;}else if(c===NC-1){key='xa_rill_pool';ry=-Math.PI/2;}
   else{const dE=Q[r][c]-Q[r][c+1];if(dE>.1){key=piece(dE);ry=-Math.PI/2;yy=Q[r][c+1];}else if(dE<-.1){key=piece(-dE);ry=Math.PI/2;yy=Q[r][c];}else{key='xa_rill';ry=Math.PI/2;}}}
  else if(isCx(c)){if(r===0){key='xa_rill_pool';ry=0;}else if(r===NR-1){key='xa_rill_pool';ry=Math.PI;}
   else{const dS=Q[r][c]-Q[r+1][c];if(dS>.1){key=piece(dS);ry=Math.PI;yy=Q[r+1][c];}else if(dS<-.1){key=piece(-dS);ry=0;yy=Q[r][c];}else{key='xa_rill';ry=0;}}}
  else if((r+c)%3===0){key=courts[ci%courts.length];ci++;ry=[0,Math.PI/2,Math.PI,-Math.PI/2][(r*3+c)%4];}
  else{key='xa_parterre';ry=[0,Math.PI/2][(r+c)%2];}
  tile(key,x,z,ry,yy,{v:(r+c)%3});}
 // the retaining walls: on every cell edge where the ground steps, a stone wall on the low side, a coping on top
 {const stone=xC(xPick(XPAL.stone));const wall=(x,z,w,d,lo,hi)=>{vB('vStone',x,lo-.4,z,w,hi-lo+.5,d,0,stone);vB('vStone',x,hi+.1,z,w+.2,.14,d+.2,0,stone.clone().multiplyScalar(1.06));};
  for(let r=0;r<NR;r++)for(let c=0;c<NC;c++){const x=x0+c*8,z=z0+r*8;
   if(c<NC-1&&Math.abs(G[r][c]-G[r][c+1])>.05){const lo=Math.min(G[r][c],G[r][c+1]),hi=Math.max(G[r][c],G[r][c+1]);const xe=x+4+(G[r][c]<G[r][c+1]?-.3:.3);wall(xe,z,.6,8.2,lo,hi);}
   if(r<NR-1&&Math.abs(G[r][c]-G[r+1][c])>.05){const lo=Math.min(G[r][c],G[r+1][c]),hi=Math.max(G[r][c],G[r+1][c]);const ze=z+4+(G[r][c]<G[r+1][c]?-.3:.3);wall(x,ze,8.2,.6,lo,hi);}}}
 // the Grand Baths at the head of the middle axis, level with it, facing east down the garden
 planLandmark('xa_grand_bath',R.x-R.w/2-58,z0+AX[1]*8,-Math.PI/2,{apron:18,y:Q[AX[1]][0]});
 // the garden's wall: a low stone wall round the rectangle with an opening at the end of every axis
 {const c=xC(xPick(XPAL.stone)),m=4.5,xa=R.x-R.w/2-m,xb=R.x+R.w/2+m,za=R.z-R.d/2-m,zb=R.z+R.d/2+m;const seg=(a,b)=>{const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/8);for(let k=0;k<n;k++){const p=[a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n],q=[a[0]+(b[0]-a[0])*(k+1)/n,a[1]+(b[1]-a[1])*(k+1)/n];const mm=[(p[0]+q[0])/2,(p[1]+q[1])/2];
   if(AX.some(r=>Math.abs(mm[1]-(z0+r*8))<6&&(Math.abs(mm[0]-xa)<1||Math.abs(mm[0]-xb)<1)))continue;if(CX.some(cc=>Math.abs(mm[0]-(x0+cc*8))<6&&(Math.abs(mm[1]-za)<1||Math.abs(mm[1]-zb)<1)))continue;
   const y=Math.min(terrainH(p[0],p[1]),terrainH(q[0],q[1]))-.3,h=Math.max(terrainH(p[0],p[1]),terrainH(q[0],q[1]))+1.4-y;vB('vStone',mm[0],y,mm[1],Math.hypot(q[0]-p[0],q[1]-p[1])+.3,h,.6,Math.atan2(q[0]-p[0],q[1]-p[1]),c);}};
  seg([xa,za],[xb,za]);seg([xb,za],[xb,zb]);seg([xb,zb],[xa,zb]);seg([xa,zb],[xa,za]);}
 occAdd({x:R.x,z:R.z,hx:R.w/2+3,hz:R.d/2+3,ry:0,pad:0});window._gardenTiles=GARDEN.tiles.length;})();
// ---------------------------------------------------------------- 3. the frontage walker: buildings along every street, zoned by district
// what a district offers its streets: [key, weight] by wealth and kind; the Palopó twins carry the market squares
// a third of the residences and shops carry the Palopó paint (six in ten round a market)
const POOL={
 poor:[['xa_poor_a',3],['xa_poor_b',4],['xa_poor_c',3],['xa_andean_poor',3],],
 middle:[['xa_mid_a',4],['xa_mid_b',3],['xa_mid_c',3],['xa_andean_mid',2],['xa_house_turk_a',2],['xa_shops',2],['xa_shop_turk_a',1]],
 rich:[['xa_rich_a',3],['xa_rich_b',3],['xa_rich_c',3],['xa_house_turk_b',2],['xa_andean_rich',2]],
 market:[['xa_shops',4],['xa_shop_turk_a',3],['xa_shop_turk_b',3],['xa_andean_poor',1],['xa_mid_a',2],['xa_workshop',1]],
 industry:[['xa_workshop',4],['xa_smithy',2],['xa_warehouse',2],['xa_poor_b',2],['xa_poor_a',1],['xa_granary',1]],
 dock:[['xa_warehouse',3],['xa_boatshed',1],['xa_poor_b',2],['xa_workshop',2],['xa_poor_c',2]],
 civic:[['xa_mid_a',2],['xa_mid_b',2],['xa_house_turk_a',1]],
};
function pickFor(x,z){const {D,d}=districtAt(x,z);let pool;if(D.kind==='market'&&d<D.r*.5)pool=POOL.market;else if(D.kind==='industry')pool=POOL.industry;else if(D.kind==='dock')pool=POOL.dock;else pool=POOL[D.wealth]||POOL.middle;
 // wealth also climbs with height: the highest streets are the richest
 const h=gy(x,z);if(pool===POOL.poor&&h>150&&rng()<.5)pool=POOL.middle;if(pool===POOL.middle&&h>220&&rng()<.45)pool=POOL.rich;if(pool===POOL.middle&&h<20&&rng()<.4)pool=POOL.poor;
 let tot=0;for(const p of pool)tot+=p[1];let r=rng()*tot;let key=pool[0][0];for(const p of pool){if(r<p[1]){key=p[0];break;}r-=p[1];}
 const tw=key+'_palopo';if(VERN.defs[tw]&&rng()<(pool===POOL.market?.6:.34))key=tw;return{key,D};}
const NARROW={poor:['xa_poor_c','xa_poor_a','xa_andean_poor'],middle:['xa_mid_a','xa_andean_mid','xa_house_turk_a'],rich:['xa_rich_b','xa_house_turk_b'],civic:['xa_mid_a']};
let NB=0;
(function frontage(){const order=ROADS.slice().sort((a,b)=>(a.cls===KL.boulevard?0:1)-(b.cls===KL.boulevard?0:1));
 for(const R of order){if(R.cls===KL.stair)continue;const inCity=R.pts.some(p=>ER_INCITY(p[0],p[1]));if(!inCity)continue;
  for(const side of[-1,1]){let acc=0,next=6;for(let i=1;i<R.pts.length;i++){const a=R.pts[i-1],b=R.pts[i];const L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<.5)continue;const dx=(b[0]-a[0])/L,dz=(b[1]-a[1])/L;const nx=-dz*side,nz=dx*side;
    let t=next-acc;while(t<L){const rx=a[0]+dx*t,rz=a[1]+dz*t;if(ER_INCITY(rx,rz)){const pk=pickFor(rx+nx*8,rz+nz*8);const D=VERN.defs[pk.key];const H=halfOf(D);
      const P=planFront(pk.key,rx+nx*(R.w/2+.6),rz+nz*(R.w/2+.6),nx,nz,{gap:.6,maxDrop:12,wealth:pk.D.wealth,lit:pk.D.wealth==='rich'||pk.D.wealth==='civic'?rng()<.6:false});
      if(P){NB++;t+=H.hx*2+rr(.6,2.2);}else{const nk=NARROW[pk.D.wealth]||NARROW.middle;const k2=vPick(nk);const H2=halfOf(VERN.defs[k2]);const P2=planFront(k2,rx+nx*(R.w/2+.6),rz+nz*(R.w/2+.6),nx,nz,{gap:.6,maxDrop:14,wealth:pk.D.wealth,lit:false});if(P2){NB++;t+=H2.hx*2+rr(.6,1.6);}else t+=5;}}else t+=12;}next=t;acc+=L;next-=L;}}}
 window._buildings=NB;})();
// the infill: ground the walker left empty inside the bounds gets a house facing its nearest street (the door
// addresses the street: the plot's front is set back from the road point along its outward normal)
function nearestRoad(x,z){let best=null;for(const r of ROADS){if(r.cls===KL.stair)continue;const P=r.pts;for(let i=0;i<P.length-1;i++){const ax=P[i][0],az=P[i][1],bx=P[i+1][0],bz=P[i+1][1];const dx=bx-ax,dz=bz-az,l2=dx*dx+dz*dz||1;const t=clamp(((x-ax)*dx+(z-az)*dz)/l2,0,1);
 const qx=ax+dx*t,qz=az+dz*t,d=Math.hypot(x-qx,z-qz);if(!best||d<best.d)best={x:qx,z:qz,d,road:r};}}return best;}
(function infill(){let n=0;let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const p of CITY_POLY){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);z0=Math.min(z0,p[1]);z1=Math.max(z1,p[1]);}
 for(let z=z0;z<z1;z+=9)for(let x=x0;x<x1;x+=9){const jx=x+rr(-3,3),jz=z+rr(-3,3);if(!ER_INCITY(jx,jz)||!canBuild(jx,jz)||inGarden(jx,jz,10)||inPrecinct(jx,jz,2))continue;
  const nr=nearestRoad(jx,jz);if(!nr||nr.d>34||nr.d<3)continue;const nx=(jx-nr.x)/nr.d,nz=(jz-nr.z)/nr.d;const pk=pickFor(jx,jz);
  let P=planFront(pk.key,nr.x+nx*(nr.road.w/2+.6),nr.z+nz*(nr.road.w/2+.6),nx,nz,{gap:.6,maxDrop:14,wealth:pk.D.wealth,lit:pk.D.wealth==='rich'?rng()<.5:false});
  if(!P){const k2=vPick(NARROW[pk.D.wealth]||NARROW.middle);P=planFront(k2,nr.x+nx*(nr.road.w/2+.6),nr.z+nz*(nr.road.w/2+.6),nx,nz,{gap:.6,maxDrop:14,wealth:pk.D.wealth,lit:false});}
  if(P)n++;}
 window._infill=n;NB+=n;window._buildings=NB;})();
// ---------------------------------------------------------------- 4. the farms and the mines outside the walls
(function farms(){let n=0;const cell=64;for(let z=-ER.H/2+60;z<ER.H/2-60;z+=cell)for(let x=-ER.W/2+60;x<ER.W/2-60;x+=cell){const jx=x+rr(-14,14),jz=z+rr(-14,14);if(ER_INCITY(jx,jz))continue;const c=erClass(jx,jz);if(c!==1&&c!==2)continue;
  const {D}=districtAt(jx,jz);if(/mine|monastery|prison|cave|island/.test(D.kind)&&Math.hypot(jx-D.x,jz-D.z)<D.r)continue;if(rng()>.75)continue;
  const g=erGrad(jx,jz);const ry=Math.atan2(-g[0],-g[1]);const key=rng()<.72?'xa_farm':vPick(['xa_farmhouse','xa_granary','xa_windmill','xa_farmhouse']);const H=halfOf(VERN.defs[key]);const o={x:jx,z:jz,hx:H.hx,hz:H.hz,ry,pad:2};
  if(!groundOK(o,{ignoreMask:false})||!occFree(o,2))continue;const st=stance(o,key==='xa_farm'?30:12);if(!st)continue;occAdd(o);
  plan(key,jx,jz,ry,{v:Math.floor(rng()*3),drop:key==='xa_farm'?0:st.drop,y:key==='xa_farm'?terrainH(jx,jz):st.y},{h:8,obb:o});cdisc(mg,jx,jz,Math.max(H.hx,H.hz)+2,'#000');cdisc(kg,jx,jz,Math.max(H.hx,H.hz)+2,KLCOL(KL.field));n++;}
 window._farms=n;})();
(function mines(){const D=DIST.find(d=>d.kind==='mine');planLandmark('xa_guild_mine',D.x,D.z,Math.PI*.8,{apron:12});
 for(let k=0;k<7;k++){const a=rng()*TAU,r=rr(40,D.r);const x=D.x+Math.cos(a)*r,z=D.z+Math.sin(a)*r;const key=vPick(['xa_workshop','xa_smithy','xa_poor_b','xa_granary']);const H=halfOf(VERN.defs[key]);const o={x,z,hx:H.hx,hz:H.hz,ry:rng()*TAU,pad:2};
  if(!groundOK(o)||!occFree(o,2))continue;const st=stance(o,12);if(!st)continue;occAdd(o);plan(key,x,z,o.ry,{v:Math.floor(rng()*3),drop:st.drop,y:st.y},{h:8,obb:o});}
 for(let k=0;k<12;k++){const a=rng()*TAU,r=rr(20,D.r+40);const x=D.x+Math.cos(a)*r,z=D.z+Math.sin(a)*r;if(erClass(x,z)<1)continue;BIO_OBSTACLES.push({x,z,r:14});kput('xBoulder',[x,terrainH(x,z)-2,z],qEuler(rng(),rng(),0),[rr(8,16),rr(4,8),rr(8,14)],xC(0x8a7a66));}})();
// ---------------------------------------------------------------- 5. the terrain (every pad is levelled now), the water, the biome
erTerrainMesh();erWater();
BIO.setScene(scene);
{const q=ER.QUALITY;let out=null;try{out=XANADU.build({R:1500,quality:q,lakeHue:XANADU_LAKE.hue});}catch(e){reportErr('biome: '+e.stack);}window._biome=out;}
// ---------------------------------------------------------------- 6. the build, chunk by chunk: every chunk bakes into its own group (the runtime LOD)
const CHUNK_GROUPS=[];let ER_INST=0;
function erBakeChunk(key,list){const G=new THREE.Group();G.name='chunk:'+key;scene.add(G);let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9,y1=-1e9,y0=1e9;
 for(const Pl of list){TSTAT.cur=Pl.key+'/'+((Pl.o&&Pl.o.v)||0);const r0=REG.length;const g=VERN.place(G,Pl.key,Pl.x,Pl.z,Pl.ry,Pl.o);if(g)Pl.G=g;for(let i=r0;i<REG.length;i++){REG[i].type=Pl.key;if(Pl.o.y)REG[i].y=(REG[i].y||0);}
  x0=Math.min(x0,Pl.x-40);x1=Math.max(x1,Pl.x+40);z0=Math.min(z0,Pl.z-40);z1=Math.max(z1,Pl.z+40);y0=Math.min(y0,(Pl.o.y||0)-(Pl.o.drop||0));y1=Math.max(y1,(Pl.o.y||0)+(Pl.h||12));}
 TSTAT.cur=null;kbake(G);ER_INST+=window._instances||0;for(const n in KIT.items)KIT.items[n].length=0;
 const e={G,key,sphere:new THREE.Sphere(new THREE.Vector3((x0+x1)/2,(y0+y1)/2,(z0+z1)/2),Math.hypot(x1-x0,y1-y0,z1-z0)/2+20),range:key==='landmark'?1e9:1700,n:list.length};CHUNK_GROUPS.push(e);return e;}
// the walls and the mine boulders already sit in KIT.items: they bake first as the world chunk (always drawn)
{const G=new THREE.Group();G.name='chunk:world';scene.add(G);kbake(G);ER_INST+=window._instances||0;for(const n in KIT.items)KIT.items[n].length=0;CHUNK_GROUPS.push({G,key:'world',sphere:new THREE.Sphere(new THREE.Vector3(0,100,0),3000),range:1e9,n:0});}
for(const k in CHUNKS)erBakeChunk(k,CHUNKS[k]);

// the hanging lights on the avenues: wherever two buildings face each other across a lit road within 24 m, a string of
// baskets or umbrellas between their fronts, alternating along the street
(function hangingLights(){let n=0;const G=new THREE.Group();G.name='chunk:lights';scene.add(G);const fronts=PLAN.filter(p=>p.front);
 for(const R of ROADS){if(!R.lights)continue;let acc=0;for(let i=1;i<R.pts.length;i++){const a=R.pts[i-1],b=R.pts[i];const L=Math.hypot(b[0]-a[0],b[1]-a[1]);const dx=(b[0]-a[0])/L,dz=(b[1]-a[1])/L;
   for(let t=acc%16;t<L;t+=16){const rx=a[0]+dx*t,rz=a[1]+dz*t;const nx=-dz,nz=dx;let A=null,B=null,da=1e9,db=1e9;
    for(const p of fronts){const ex=p.front[0]-rx,ez=p.front[1]-rz;const along=Math.abs(ex*dx+ez*dz);if(along>13)continue;const s=(p.x-rx)*nx+(p.z-rz)*nz;const d=Math.abs(ex*nx+ez*nz);if(d>22)continue;if(s>0&&along<da){da=along;A=p;}else if(s<0&&along<db){db=along;B=p;}}
    if(!A||!B)continue;const ya=A.y+Math.min(A.h,9)*.72,yb=B.y+Math.min(B.h,9)*.72;const pa=[A.front[0],ya,A.front[1]],pb=[B.front[0],yb,B.front[1]];
    if(Math.hypot(pa[0]-pb[0],pa[2]-pb[2])>34)continue;if(n%2)xnBasketLights(pa,pb,5);else xnUmbrellaLights(pa,pb,5);n++;}
   acc+=L;}}
 kbake(G);ER_INST+=window._instances||0;for(const k in KIT.items)KIT.items[k].length=0;window._instances=ER_INST;CHUNK_GROUPS.push({G,key:'lights',sphere:new THREE.Sphere(new THREE.Vector3(0,100,0),3000),range:900,n});window._lights=n;})();
// the runtime LOD: a chunk is drawn while it is in the view and within its range; the biome's own chunks tick beside it
const _fr=new THREE.Frustum(),_pm=new THREE.Matrix4();
FRAME_HOOKS.push(()=>{camera.updateMatrixWorld();_pm.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);_fr.setFromProjectionMatrix(_pm);const P=camera.position;let shown=0;
 for(const e of CHUNK_GROUPS){const d=P.distanceTo(e.sphere.center)-e.sphere.radius;const v=d<e.range&&_fr.intersectsSphere(e.sphere);e.G.visible=v;if(v)shown++;}window._chunksShown=shown;
 if(BIO.lodTick)BIO.lodTick(camera);});
const bk=BIO.bake();window._bioBake=bk;
// labels (the atlas over REG) and the accounting
LABELS=new THREE.Group();LABELS.userData.probeSkip=true;scene.add(LABELS);
window._registered=REG.length;window._plan=PLAN.length;window._chunks=CHUNK_GROUPS.length;
window._buildMs=Math.round(performance.now()-BUILD_T0);
