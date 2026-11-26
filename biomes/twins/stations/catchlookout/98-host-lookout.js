// ================================================================= HOST — Catch-Lookout Spring's views and checks (station 6)
// The views are found in the built scene (the spring, the basins, the cairn, the lip, a pine, the breach), never aimed at arithmetic alone. The
// checks (verify.py --assert) are pure functions of their inputs, each with a negative that must fail.
function STATION_VIEWS(VIEWS){const G=(x,z)=>terrainH(x,z),add=(k,v,mode,o)=>{if(v&&v.every(isFinite))VIEWS[k]=Object.assign({v,mode:mode||'day'},o||{});};
 const sp=OASIS.springs[0],T=TER.treads;
 // the Lookout Spring and the head of the basins
 {const c=eAt(-62,34);add('The Lookout Spring',[c[0],G(c[0],c[1])+2.4,c[1],sp.x,sp.level,sp.z]);}
 // up the soaking basins from below their last dam
 {const q=TER.line[TER.line.length-1],p=TER.line[Math.floor(TER.line.length*.35)],c=[q[0]+EA[0]*10+EN[0]*6,q[1]+EA[1]*10+EN[1]*6];add('The soaking basins',[c[0],G(c[0],c[1])+2.2,c[1],p[0],T[2].y,p[1]]);}
 // from the lookout cairn over the lip: the lower bench and the Catch's pale floor
 {const c=[CAIRN.x-EA[0]*5,CAIRN.z-EA[1]*5],t=eAt(14000,-3000);add('The Catch from the lookout',[c[0],G(c[0],c[1])+1.7,c[1],t[0],SITE_Y-900,t[1]]);}
 {const c=[CAIRN.x-EA[0]*14+EN[0]*5,CAIRN.z-EA[1]*14+EN[1]*5];add('The lookout cairn',[c[0],G(c[0],c[1])+1.7,c[1],CAIRN.x,CAIRN.y+1.6,CAIRN.z]);}
 // the scarp's face from the lower bench
 {const c=eAt(LIP.at(-150)+170,-150),t=eAt(LIP.at(-60),-60);add('The ledge\'s scarp',[c[0],G(c[0],c[1])+1.8,c[1],t[0],LIP.y-15,t[1]]);}
 // down the breach, Route B on its way to the Catch
 {const c=eAt(BREACH.a-70,BREACH.p),t=eAt(BREACH.a+220,BREACH.p+20);add('Route B down the breach',[c[0],G(c[0],c[1])+1.8,c[1],t[0],G(t[0],t[1]),t[1]]);}
 // a dwarf agate-pine, flagged (the nearest crown to the inner pool)
 {const P=itemPositions('kcrown',1),s2=OASIS.springs[1];let best=null,bd=1e18;P.forEach(p=>{const d=Math.hypot(p[0]-s2.x,p[2]-s2.z);if(d<bd){bd=d;best=p;}});
  if(best){add('Dwarf agate-pines',[best[0]+EN[0]*7-EA[0]*3,G(best[0]+EN[0]*7-EA[0]*3,best[2]+EN[1]*7-EA[1]*3)+1.6,best[2]+EN[1]*7-EA[1]*3,best[0],best[1]-.5,best[2]]);}}
 // Route B arriving from the west, the steam over the spring ahead
 {const P=ROUTE.pts,i=P.findIndex(p=>Math.hypot(p[0],p[1])<900),p=P[Math.max(0,i)],q=[sp.x,sp.z];add('Route B arriving',[p[0],G(p[0],p[1])+1.7,p[1],q[0],sp.level+3,q[1]]);}
 add('Night at the spring',(function(){const c=eAt(-110,90);return[c[0],G(c[0],c[1])+3,c[1],sp.x,sp.level+1,sp.z];})(),'night');
 {const c=eAt(-1100,900);add('Overview',[c[0],G(c[0],c[1])+600,c[1],LIP.c[0],SITE_Y-60,LIP.c[1]]);}}
STN.counts=B=>B.stones>2000&&B.sedge>300&&B.pines>40&&B.oasisCushions>50&&B.cairns>=40&&B.blocks+B.stones+B.obsidian<320000;
const LCHK={
 // the oasis: the ground over 8 C 500-1,000 m along the bench and 300-650 m across (the plan: 700 x 450)
 size(along,across){const ok=along>500&&along<1000&&across>300&&across<650;return{ok,detail:'warm ground (over 8 C) '+along.toFixed(0)+' m along, '+across.toFixed(0)+' m across (the plan: 700 x 450)'};},
 // the air: +17 C by the pools against the ledge's +2 C mean (PLAN.md section 6)
 air(pool,ledge){const ok=pool>13&&pool<21&&Math.abs(ledge-2)<1.2;return{ok,detail:'by the pools '+pool.toFixed(1)+' C at 1 m, the ledge\'s mean '+ledge.toFixed(1)+' C'};},
 // the basins: eight, each lower than the one above, each pool's level over its floor and under its dams
 basins(T,floor,dam){const bad=[];T.forEach((t,i)=>{if(i&&!(t.y<T[i-1].y))bad.push(i+' not lower');const f=floor(t),d=dam(t);if(!(t.y>f+.3&&t.y<d))bad.push(i+' level '+t.y.toFixed(2)+' floor '+f.toFixed(2)+' dam '+d.toFixed(2));});
  return{ok:T.length>=6&&!bad.length,detail:T.length+' basins, '+(T[0].y-T[T.length-1].y).toFixed(1)+' m from the first to the last'+(bad.length?'; '+bad.slice(0,4).join(', '):'')};},
 // the scarp: 35-60 m from its lip to the lower bench, and the Catch's floor far below (the far country 12-20 km out more than 600 m under the ledge)
 scarp(lip,below,catchY){const h=lip-below,ok=h>35&&h<60&&catchY<lip-600;return{ok,detail:'the lip '+lip.toFixed(0)+' m, the bench below '+below.toFixed(0)+' m ('+h.toFixed(0)+' m); the Catch toward Stair at '+catchY.toFixed(0)+' m'};},
 // the dwarf pines on the warm margins (8-18 C), the sedge on the warm turf (12-36)
 life(pines,sedge,heat){const bp=pines.filter(p=>{const t=heat(p[0],p[2]);return t<7.5||t>18.5;}),bs=sedge.filter(p=>{const t=heat(p[0],p[2]);return t<12||t>36;});
  return{ok:pines.length>40&&sedge.length>100&&!bp.length&&!bs.length,detail:pines.length+' pines ('+bp.length+' off 8-18 C), '+sedge.length+' sedge ('+bs.length+' off 12-36 C)'};},
 // the route goes down the breach: its steepest 25 m step under 40% (no route down the sheer face)
 route(steep,cairns,len){const ok=steep<.4&&cairns>=Math.floor(len/110)-8;return{ok,detail:'its steepest '+(steep*100).toFixed(0)+'%, '+cairns+' cairns over '+(len/1000).toFixed(2)+' km'};}};
function lookoutExtent(){let a0=1e9,a1=-1e9,c0=1e9,c1=-1e9;for(let a=-800;a<=800;a+=10)for(let p=-600;p<=600;p+=10){const q=eAt(a,p);if(OASIS.heatAt(q[0],q[1])>8){a0=Math.min(a0,a);a1=Math.max(a1,a);c0=Math.min(c0,p);c1=Math.max(c1,p);}}return{along:a1-a0,across:c1-c0};}
const terrFloor=t=>{const s=(t.s0+t.s1)/2,i=Math.min(TER.line.length-1,Math.round(s/10));return terrainH(TER.line[i][0],TER.line[i][1]);};
const terrDam=t=>{const i=Math.min(TER.line.length-1,Math.round((t.s1+.3)/10)),a=TER.line[Math.max(0,i-1)],b=TER.line[i],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l,nz=dx/l,hw=TER.w/2+1.3;
 const s=(t.s0+t.s1)/2,j=Math.min(TER.line.length-1,Math.round(s/10)),c=TER.line[j];return Math.min(terrainH(c[0]+nx*hw,c[1]+nz*hw),terrainH(c[0]-nx*hw,c[1]-nz*hw));};
const routeSteep=()=>{let m=0;const P=ROUTE.pts;for(let i=1;i<P.length;i++){const d=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]);if(d>1)m=Math.max(m,Math.abs(terrainH(P[i][0],P[i][1])-terrainH(P[i-1][0],P[i-1][1]))/d);}return m;};
const catchY=()=>{const q=eAt(16000,-4000),v=FAR.at(q[0],q[1]);return v===v?v:baseH(q[0],q[1]);};
function STATION_CHECKS(){const R=[],add=(n,r)=>R.push(Object.assign({name:n},r)),B=window._biome||{};
 {const e=lookoutExtent();add('the oasis: about 700 x 450 m of warm ground',LCHK.size(e.along,e.across));}
 {const c=eAt(-20,60);add('the air: +17 C by the pools, +2 C on the ledge',LCHK.air(oasisTemp(c[0],terrainH(c[0],c[1])+1,c[1])||-99,tempMean(SITE_Y)));}
 add('the soaking basins step down and hold their water',LCHK.basins(TER.treads,terrFloor,terrDam));
 add('the scarp, and the Catch below it',LCHK.scarp(LIP.y,LIP.below,catchY()));
 add('the pines and the sedge on their warm ground',LCHK.life(itemPositions('kcrown',1),itemPositions('sedge',1),OASIS.heatAt));
 add('Route B goes down the breach, cairned',LCHK.route(routeSteep(),B.cairns||0,ROUTE.len));
 return R;}
function STATION_NEGATIVES(){const R=[],add=(n,r)=>R.push({name:n,failed:!r.ok,detail:r.detail});
 add('an oasis the size of the bench',LCHK.size(1600,1200));
 add('the oasis as cold as the ledge',LCHK.air(2,tempMean(SITE_Y)));
 add('a basin above the one before it',LCHK.basins(TER.treads.map((t,i)=>i===3?Object.assign({},t,{y:t.y+2}):t),terrFloor,terrDam));
 add('no scarp',LCHK.scarp(LIP.y,LIP.y-2,catchY()));
 add('pines on the cold bench',LCHK.life(itemPositions('kcrown',1).map(p=>[p[0]+2500,p[1],p[2],p[3]]),itemPositions('sedge',1),OASIS.heatAt));
 add('a route down the sheer face',LCHK.route(1.2,(window._biome||{}).cairns||0,ROUTE.len));
 return R;}
