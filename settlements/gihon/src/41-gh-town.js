// ================================================================= GIHON — the town on core/city and its forbidden city (records; draws nothing)
// [G data] Step G2 of PLAN.md (section 3, the layout; the owner, 2026-11-17: "it will use the irregular-square city builder
// Kirstabal did but will be much larger and have a second, walled 'forbidden city' inside it"; 2026-11-22: "River corner").
// Kirstabal's town (settlements/kirstabal/src/41-ks-town.js) is the pattern, read and adapted, not shared code: each town's
// layout is its own data.
//
// THE FRAME   the shore frame of 40-gh-ground.js: u along the shore (east), v inland (south). The outer square is core/city's
//             irregular square (KCITY.grid), its inner street 1,060 m a side, the slate wall 16 m outside it, eight cells a side,
//             Chiang Mai's moat; four gates: the Lake Gate (north, the harbour), the Gorge Gate (south, the Opal River's road up
//             to Lāiṭwāl), the Strongwall Gate (west, the bullion road), the River Gate (east, the river front and the bridge).
// THE FORBIDDEN CITY   the outer grid's four south-east cells (i, j = 6, 7), on the rise above the river: a second KCITY.grid
//             square inside them, levelled on a terrace (40's setTerrace), its own moat, its wall the Xanadui fort asset's
//             (kits/xanadu 80f XFORT.plan: a ward on the square's four corners, flanking towers, raised to a royal wall), two
//             gates on its north-south axis; inside, the Mint, the assessors' hall, the treasury, the Golden Tears' head house,
//             the commandant's house, the barracks, the muster ground, the magazine and the granary in its four cells. The outer
//             grid's streets inside it are cut away, and its ground is kept from core/city's infill.
// THE WEALTH  rich on the lakefront either side of the Lake Gate and along the river front, poor toward the Strongwall Gate and
//             the inland edge; the goldsmiths' and lapidaries' row by the River Gate.
//
// GH_TOWN.make({dims, seed}) -> {lots, ways, extra, roads, census, fc, wall, moat, gardens, places, ...}: dims(key, v) -> {w, d, h}
// the kit's boxes (VERN.defs on the page; the test's table in node). Every record keyed by a stable id ('gh.town.' + n,
// 'gh.extra.<what>', 'gh.fc.<what>'), x z in the page's frame.
var GH_TOWN=(function(){
 const G=GH_GROUND,at=(u,v)=>G.at(u,v),face=(d)=>Math.atan2(d[0],d[1]);
 const UX=G.UX,VX=G.VX,NUX=[-UX[0],-UX[1]],NVX=[-VX[0],-VX[1]];
 /* THE OUTER SQUARE: centred on the origin (v 700), its moat Chiang Mai's as Kirstabal's */
 const SQ={c:[0,700],half:530,cells:8,avenues:{u:4,v:4},wallGap:16,out:50,seed:41910,moat:{gap:15,width:16},jitter:.12};
 const GATE_NAMES={'v-':'the Lake Gate','v+':'the Gorge Gate','u-':'the Strongwall Gate','u+':'the River Gate'};
 /* the landmarks' cells [i along the shore, j inland] (the avenues cross at the node between cells 3 and 4) */
 const LANDMARK_CELLS={bazaar:[3,3],temple:[4,3],generator:[3,1],white:[1,4],violet:[5,5],serai:[0,6],goldsmiths:[7,2]};
 const FC_CELLS=[[6,6],[7,6],[6,7],[7,7]];
 /* THE GARDEN SQUARES (Kirstabal's chahar baghs: the owner, 2026-11-17, about a tenth of the walled town), in this order until
    GARDEN_T.share of the zone is garden: [id, name, cell, 'full' or the side it keeps to] */
 const GARDENS=[['commandant','the Commandant’s garden',[6,5],'v+'],['decree','the garden of the Decree',[4,2],'v+'],
  ['lake','the Lake garden',[2,0],'v-'],['river','the River garden',[7,3],'u-'],['west','the West garden',[0,3],'u+'],
  ['gorge','the Gorge garden',[3,7],'v-'],['harbour','the Harbour garden',[5,0],'v-'],['inland','the Inland garden',[1,6],'u+'],
  ['middle','the Middle garden',[2,4],'full'],['south','the South garden',[5,7],'u-'],['quay','the Quay garden',[6,1],'v-'],['bazaar','the Bazaar garden',[2,2],'full']];
 /* THE QUARTERS OUTSIDE THE WALLS: [id, name, [u0, v0, u1, v1], wealth, the road it grows along] */
 const OUTSIDE_Q=[['strongwall','the Strongwall quarter',[-1080,560,-640,820],.3,'strongwall'],
  ['gorge','the Gorge quarter',[-240,1300,180,1480],.25,'gorge']];
 const OUTSIDE_T={vacant:.2,far:.18,bill:.4,seed:41990,rasterHalf:2000};
 const GARDEN_T={share:.10,tile:8,margin:1.5,min:5,aspect:1.8,half:.55};
 const GARDEN_COURTS={grand:['xa_kiosk','xa_star_court','xa_lily_pond','xa_vault_pavilion'],
  other:['xa_star_court','xa_lily_pond','xa_cactus_court','xa_brick_court','xa_plunge_pool','xa_kiosk','xa_pergola','xa_bath_pool']};
 function gardenTiles(nu,nv,courts){const cu=(nu-1)/2,cv=(nv-1)/2,out=[],qc=c=>Math.floor((c+1)/2);
  for(let a=0;a<nu;a++)for(let b=0;b<nv;b++){const du=a-cu,dv=b-cv;let key='xa_parterre',dir='u+';
   if(!du&&!dv)key='xa_rill_cross';
   else if(!dv){dir='u+';key=Math.abs(du)===cu?'xa_rill_pool':Math.abs(du)===2&&cu>=4?'xa_rill_jets':'xa_rill';if(Math.abs(du)===cu)dir=du<0?'u+':'u-';}
   else if(!du){dir='v+';key=Math.abs(dv)===cv?'xa_rill_pool':Math.abs(dv)===2&&cv>=4?'xa_rill_jets':'xa_rill';if(Math.abs(dv)===cv)dir=dv<0?'v+':'v-';}
   else if(cu>=3&&cv>=3&&Math.abs(du)===qc(cu)&&Math.abs(dv)===qc(cv))key=courts[(du<0?0:2)+(dv<0?0:1)];
   out.push([a,b,key,dir]);}
  return out;}
 let GRID=null;
 const grid=()=>GRID||(GRID=KCITY.grid.plan({id:'gh.grid',seed:SQ.seed,c:G.at(SQ.c[0],SQ.c[1]),u:G.UX,v:G.VX,half:SQ.half,cells:SQ.cells,avenues:SQ.avenues,wallGap:SQ.wallGap,out:SQ.out,moat:SQ.moat,jitter:SQ.jitter}));
 const uvOf=p=>[G.u(p[0],p[1]),G.v(p[0],p[1])];
 const cellOf=(i,j)=>grid().cells.find(c=>c.i===i&&c.j===j);
 const cellUV=k=>{const C=cellOf(LANDMARK_CELLS[k][0],LANDMARK_CELLS[k][1]);return uvOf(C.c);};
 /* the forbidden city's box in the shore frame: the four cells' corners (the streets' centre lines round it) */
 const FC_BOX=()=>{const P=[].concat(...FC_CELLS.map(([i,j])=>cellOf(i,j).poly)).map(uvOf);
  return [Math.min(...P.map(p=>p[0])),Math.min(...P.map(p=>p[1])),Math.max(...P.map(p=>p[0])),Math.max(...P.map(p=>p[1]))];};
 /* THE FORBIDDEN CITY'S SQUARE: its inner street 36 m inside the box's edge (the town's street, the moat and the wall between),
    two cells a side, its avenues on the middle lines; its wall 12 m outside its inner street, its moat 12 m wide beyond */
 const FC_T={inset:36,wallGap:12,moat:{gap:9,width:12},cells:2,seed:41940,terrEdge:26,gateW:5.5,curtH:10,curtT:3.5,walk:2.4};
 let FCG=null;
 const fcGrid=()=>{if(FCG)return FCG;const B=FC_BOX(),cu=(B[0]+B[2])/2,cv=(B[1]+B[3])/2,hu=(B[2]-B[0])/2-FC_T.inset,hv=(B[3]-B[1])/2-FC_T.inset;
  FCG=KCITY.grid.plan({id:'gh.fc',seed:FC_T.seed,c:G.at(cu,cv),u:G.UX,v:G.VX,half:[hu,hv],cells:FC_T.cells,avenues:{u:1,v:1},wallGap:FC_T.wallGap,out:6,
   jitter:.04,corner:.012,bow:.006,drop:0,bend:0,moat:FC_T.moat});FCG.box=B;return FCG;};
 const ZONE=[[SQ.c[0]-SQ.half-SQ.wallGap,SQ.c[1]-SQ.half-SQ.wallGap],[SQ.c[0]+SQ.half+SQ.wallGap,SQ.c[1]-SQ.half-SQ.wallGap],
  [SQ.c[0]+SQ.half+SQ.wallGap,SQ.c[1]+SQ.half+SQ.wallGap],[SQ.c[0]-SQ.half-SQ.wallGap,SQ.c[1]+SQ.half+SQ.wallGap]];
 /* the people a building holds (Kirstabal's table); the forbidden city's by piece (FC_PIECES) */
 const PEOPLE={xa_poor_a:6,xa_poor_b:12,xa_poor_c:4,xa_andean_poor:6,xa_mid_a:7,xa_mid_b:9,xa_mid_c:16,xa_house_turk_a:8,xa_rich_a:12,xa_rich_b:16,xa_rich_c:11,
  xa_house_turk_b:10,xa_shops:6,xa_shop_turk_a:8,xa_shop_turk_b:6,xa_teahouse:4,xa_workshop:5,xa_smithy:4,xa_warehouse:2,xa_bath:4,xa_temple:6,xa_granary:0,
  xa_barracks:80,xa_generator:4,xa_monastery:150,xa_monastery_white:140,xa_monastery_violet:140,xa_grand_temple_gold:30,xa_harbour_warehouse:3,xa_drydock:0,xa_slip:0,
  xa_lake_barge:0,xa_launch:0,xa_dugout:0,xa_harbour_quay:0,xa_mole_run:0,xa_river_span:0,xa_garden_wall:0,xa_serai:20,xa_customs_house:12,xa_fish_racks:0,
  xa_boatshed:3,xa_quay:0,xa_lighthouse:2,xa_gate:12,xa_watch:4,xa_garden:0,xa_pens:0,xa_wall:0,xa_bridge:0,xa_barge:0,xa_stall:1};
 for(const k in Object.assign({},PEOPLE))PEOPLE[k+'_badgir']=PEOPLE[k];
 /* the forbidden city's pieces: [id, key, cell [i, j] of its own grid, offset [du, dv] from the cell's centre, people, faces]
    (its north gate opens onto the town; the Mint and the assessors face each other across the axis, the Tears' head house and
    the commandant behind them, the barracks and the muster ground at the back by the south gate) */
 const FC_PIECES=[['mint','xa_mint_hall',[0,0],[-6,-8],70,'axis'],['treasury','xa_treasury',[0,0],[-14,30],20,'axis'],
  ['assessors','xa_assessors_hall',[1,0],[4,-10],70,'axis'],['commandant','xa_rich_b',[1,0],[16,30],40,'axis'],
  ['tears','xa_andean_rich',[0,1],[-10,-16],160,'axis'],['magazine','xa_granary',[0,1],[-24,24],0,'axis'],['granary','xa_granary',[0,1],[8,26],0,'axis'],
  ['barracks.a','xa_barracks',[1,1],[8,-22],220,'axis'],['barracks.b','xa_barracks',[1,1],[8,10],220,'axis'],['barracks.c','xa_barracks',[1,1],[-22,30],200,'axis'],
  ['muster','xa_muster',[0,1],[14,-2],0,'axis']];
 const WALL_T={towerGap:90,clear:12,gateFind:40,thick:3.2,gateTower:5,gatePass:4};
 const tune=()=>({cell:2.5,rasterHalf:1300,maxSlope:.22,exact:true,
  width:{avenue:10,main:7,side:5,alley:3,highway:9,lane:4},
  lot:{side:1.6,setback:1.4,rear:3,inset:1,step:3},
  classes:{manor:[['xa_rich_b',0]],rich:[['xa_rich_a',0],['xa_rich_a_badgir',0],['xa_rich_c_badgir',0],['xa_house_turk_b',0],['xa_house_turk_b_badgir',1]],
   middle:[['xa_mid_a',0],['xa_mid_a_badgir',0],['xa_mid_b_badgir',0],['xa_house_turk_a',0],['xa_house_turk_a_badgir',0]],
   poor:[['xa_poor_a',0],['xa_poor_b',0],['xa_poor_b_badgir',0],['xa_poor_c',0],['xa_andean_poor',0]],
   shop:[['xa_shops',0],['xa_shop_turk_a',0],['xa_shop_turk_b',1],['xa_teahouse',0]],tavern:[['xa_teahouse',0]],industrial:[['xa_workshop',0],['xa_smithy',0],['xa_warehouse',0]]},
  fallback:{manor:'rich',rich:'middle',middle:'poor',shop:'middle',tavern:'shop',industrial:'poor',poor:null},
  civic:[{key:'xa_warehouse',v:0,near:'harbour'},{key:'xa_warehouse',v:0,near:'harbour'},{key:'xa_warehouse',v:0,near:'harbour'},{key:'xa_warehouse',v:0,near:'harbour'},
   {key:'xa_teahouse',v:0,near:'harbour'},{key:'xa_watch',v:0,near:'harbour'},{key:'xa_watch',v:0,near:'gorge'},{key:'xa_bath',v:0,near:'bazaar'},{key:'xa_bath',v:0,near:'river'},
   {key:'xa_granary',v:0,near:'bazaar'},{key:'xa_granary',v:1,near:'bazaar'},{key:'xa_granary',v:0,near:'gorge'},{key:'xa_shops',v:0,near:'bazaar'},{key:'xa_shops',v:0,near:'bazaar'},
   {key:'xa_shops',v:0,near:'river'},{key:'xa_shop_turk_a',v:0,near:'bazaar'},{key:'xa_shop_turk_a',v:1,near:'bazaar'},{key:'xa_shop_turk_a',v:0,near:'river'},
   {key:'xa_workshop',v:0,near:'works'},{key:'xa_workshop',v:0,near:'works'},{key:'xa_workshop',v:0,near:'river'},{key:'xa_workshop',v:0,near:'river'},
   {key:'xa_smithy',v:0,near:'works'},{key:'xa_warehouse',v:0,near:'works'},{key:'xa_warehouse',v:0,near:'gorge'},{key:'xa_temple',v:0,near:'gorge'},{key:'xa_temple',v:1,near:'works'}],
  civicSpacing:34,civicJitter:12,
  voidMax:40,voidIters:12,voidBatch:8,sideSpacing:46,sideMax:180,alleyFrac:.22,blindMax:80,interiorDepth:9,interiorRounds:2,
  avenueSnap:40,ringGap:8,verge:6,mapHalf:1300,plazaArt:{rich:[],middle:[],poor:[],commerce:[]}});
 /* the landmarks the town places itself: [id, key, v, u, v, faces] (inside the wall in their cells; outside, the serai by the
    Strongwall Gate) */
 const LANDMARKS=()=>{const c=cellUV;return [
  ['temple','xa_grand_temple_gold',0,...c('temple'),'bazaar'],   /* the temple of the Decree in gold and opal, beside the bazaar */
  ['generator','xa_generator',0,...c('generator'),'lamp'],     /* the Sultan's licence lights the avenues (T.lit) */
  ['white','xa_monastery_white',0,...c('white'),'bazaar'],     /* the White Monastery's daughter house */
  ['violet','xa_monastery_violet',0,...c('violet'),'fc'],      /* the Violet Storm's daughter house, by the forbidden city */
  ['goldsmiths','xa_shop_turk_a',1,...c('goldsmiths'),'river']];};   /* the goldsmiths' and lapidaries' row's hall by the River Gate */
 const SKIP=['alleys and alley lots'];
 /* a polyline cut by a box (the forbidden city's: the outer grid's streets inside it go); the pieces outside, each of 2+ points */
 function clipOut(pts,B){const inB=p=>p[0]>B[0]&&p[0]<B[2]&&p[1]>B[1]&&p[1]<B[3],out=[];let cur=[];
  const R=[];for(let i=0;i<pts.length;i++){if(i){const a=pts[i-1],b=pts[i],L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.ceil(L/2));for(let k=1;k<n;k++)R.push([a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n]);}R.push(pts[i]);}
  for(const p of R){if(inB(p)){if(cur.length>1)out.push(cur);cur=[];}else cur.push(p);}if(cur.length>1)out.push(cur);
  return out.filter(L=>L.length>=2&&Math.hypot(L[0][0]-L[L.length-1][0],L[0][1]-L[L.length-1][1])>12);}
 function make(o){
  const L=KCITY.lib,SL=L.SL,OCC=L.OCC,Raster=L.Raster,obb=L.obb,obbCorners=L.obbCorners,seed=o.seed==null?41900:o.seed;
  const dims=(k,v)=>{const D=o.dims(k,v);return D?Object.assign({},D,{w:Math.max(D.w,(D.fw||0)+2),d:Math.max(D.d,(D.fd||0)+2)}):null;};
  const xz=([uu,vv])=>at(uu,vv),notes=[],dd=(p,q)=>Math.hypot(p[0]-q[0],p[1]-q[1]);
  const GR=grid(),FG=fcGrid(),FB=FG.box;
  /* the forbidden city's terrace: level at its ground's mean, before anything reads the ground; then the two moats */
  {const pts=[];for(let i=0;i<=6;i++)for(let j=0;j<=6;j++)pts.push(G.base(...xz([FB[0]+(FB[2]-FB[0])*i/6,FB[1]+(FB[3]-FB[1])*j/6])));
   const y=Math.round(pts.reduce((n,p)=>n+p,0)/pts.length*10)/10,a=xz([FB[0]+4,FB[1]+4]),b=xz([FB[2]-4,FB[3]-4]);
   G.setTerrace({box:[Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[0],b[0]),Math.max(a[1],b[1])],y,edge:FC_T.terrEdge});}
  G.setMoats([GR.moat,FG.moat]);
  const BAZAAR=cellUV('bazaar'),gateUV=sd=>{const g=GR.gates.find(q=>q.side===sd);return uvOf([g.x,g.z]);};
  const LAKE_GATE=gateUV('v-'),RIVER_GATE=gateUV('u+'),WEST_GATE=gateUV('u-'),GORGE_GATE=gateUV('v+');
  const avV=GR.ways.find(w=>w.role==='avenue'&&w.line==='v'),lampUV=uvOf(avV.pts[Math.floor(avV.pts.length/4)]);
  const FCC=uvOf(FG.frame.c);
  const toward=(p,what)=>{const q=what==='bazaar'?BAZAAR:what==='gate'?WEST_GATE:what==='lamp'?lampUV:what==='lake'?[p[0],-100]:what==='fc'?FCC:what==='river'?[p[0]+100,p[1]]:BAZAAR;
   const a=xz(p),b=xz(q);return face([b[0]-a[0],b[1]-a[1]]);};
  const zone=GR.zone,GARD=[];
  const box=(c,ry,w,d,m)=>{const u=[Math.cos(ry),-Math.sin(ry)];return obb(c,u,w/2+(m||0),d/2+(m||0));};
  const FC_KEEP=[[FB[0]+5,FB[1]+5],[FB[2]-5,FB[1]+5],[FB[2]-5,FB[3]-5],[FB[0]+5,FB[3]-5]].map(xz);   /* the forbidden city's ground, kept from the outer town's infill */
  const SERAI=[WEST_GATE[0]-90,WEST_GATE[1]-70];
  const steps=[
   {name:'the site and its ground',run(){const R=SL.R=new Raster(L.tune().rasterHalf,L.tune().cell);R.occ.fill(OCC.OUT);
    const P=L.plan();P.site=[{id:0,name:'Build zone',role:'zone',poly:zone}];P.zone=zone;
    const land=KCITY.site.zoneRaster(R,zone,{dry:1.2,maxSlope:L.tune().maxSlope,h:G.h});
    R.stampPoly(FC_KEEP,OCC.OUT,-1);   /* the forbidden city is not the town's to fill */
    SL.minSpacing=KCITY.site.minSpacing();SL.note(0,'the walled square behind the quay street, '+land+' cells; the forbidden city kept out');}},
   {name:'landmarks',run(){const P=L.plan(),CG=L.cg();
    const fixed=(id,key,v,p,ry,role)=>{const D0=dims(key,v);if(!D0)return;const D=Object.assign({},D0,{w:Math.max(D0.w,D0.fw||0),d:Math.max(D0.d,D0.fd||0)}),c=xz(p),ob=box(c,ry,D.w,D.d);
     const Lt={id:P.lots.length,cls:'landmark',role,key,v,slot:0,wealth:1,x:c[0],z:c[1],y:CG.pad(ob),ry,w:D.w,d:D.d,h:D.h,lot:ob,bo:ob,way:-1,side:0,s:0,born:1,died:null,civic:true,ghId:id};
     P.lots.push(Lt);SL.hashLot(Lt);SL.register(Lt);P.landmarks.push(Lt);SL.R.stampPoly(obbCorners(box(c,ry,D.w,D.d,3)),OCC.HARD,Lt.id);};
    for(const [id,key,v,uu,vv,tw] of LANDMARKS())fixed(id,key,v,[uu,vv],toward([uu,vv],tw),id);
    fixed('serai','xa_serai',0,SERAI,toward(SERAI,'gate'),'serai');
    SL.R.stampPoly([[BAZAAR[0]-36,BAZAAR[1]-36],[BAZAAR[0]+36,BAZAAR[1]-36],[BAZAAR[0]+36,BAZAAR[1]+36],[BAZAAR[0]-36,BAZAAR[1]+36]].map(xz),OCC.HARD,-1);
    SL.note(1,P.landmarks.length+' landmarks: the gold-and-opal temple, the generator, the White and the Violet houses, the goldsmiths\' hall, the serai');}},
   {name:'districts',run(){SL.note(2,'the quarters are wealth, not districts');}},
   {name:'avenues',run(){
    SL.addWay('avenue',[[-1000,60],[-600,60],[-300,60],[0,60],[300,60],[640,60]].map(xz),3,{tag:'the quay street'});
    /* the irregular square's streets, but for the runs inside the forbidden city (cut by its box, the box's own edges kept) */
    const B=[FB[0]+10,FB[1]+10,FB[2]-10,FB[3]-10];let cut=0;
    for(const w of GR.ways){const tag=w.role==='avenue'?(w.line==='v'?'the Lamp Way':'the Bullion Way'):w.role==='ring'?'the inner street':'a grid street';
     const parts=clipOut(w.pts.map(uvOf),B);if(parts.length!==1||parts[0].length!==w.pts.length)cut++;
     for(const P2 of parts)SL.addWay(w.kind,P2.map(xz),3,{tag});}
    /* outside the wall: the gorge road on from the Gorge Gate; the Strongwall road from the Strongwall Gate */
    const gOut=uvOf(avV.pts[avV.pts.length-1]),avU=GR.ways.find(w=>w.role==='avenue'&&w.line==='u'),wOut=uvOf(avU.pts[0]);
    SL.addWay('avenue',[gOut,[gOut[0]-20,gOut[1]+120],[gOut[0]-40,1480]].map(xz),3,{tag:'the gorge road'});
    SL.addWay('avenue',[wOut,[wOut[0]-160,wOut[1]+20],[-1100,wOut[1]+60]].map(xz),3,{tag:'the Strongwall road'});
    SL.note(3,'the quay street, the square\'s avenues and '+GR.ways.filter(w=>w.role==='grid').length+' grid streets ('+cut+' cut at the forbidden city), the inner street, the gorge road, the Strongwall road');}},
   {name:'highways',run(){SL.note(4,'the river road leaves the River Gate over the bridge (GH_TOWN roads, not core/city\'s)');}},
   {name:'the wall and its gates',run(){const P=L.plan(),T=WALL_T,ways=P.ways.filter(w=>w.cls==='avenue'&&w.tag!=='the quay street'&&w.tag!=='the gorge road'&&w.tag!=='the Strongwall road');
    const named=GR.gates.map(g=>({x:g.x,z:g.z,marker:g.side,name:GATE_NAMES[g.side]}));
    const Wr=P.wallRec=KCITY.grid.wall(GR,ways,{towerGap:T.towerGap,clear:T.clear,gateFind:T.gateFind,named,side:1,health:2});
    Wr.nodes.forEach(n=>{n.gx=n.x;n.gz=n.z;if(n.kind==='gate'&&n.way)n.towerOff=((L.tune().width[n.way.cls]==null?10:L.tune().width[n.way.cls])+T.gatePass)/2+T.gateTower/2;});
    Wr.corners=GR.corners;Wr.segs=KCITY.site.wallSegs(Wr.nodes.filter(n=>!n.skip));
    KCITY.site.stampWall(Wr,{thick:T.thick,step:5,gateTower:T.gateTower});
    for(const c of GR.corners)SL.R.eachNearSeg([c.x,c.z],[c.x,c.z],12,k=>{if(SL.R.occ[k]===OCC.FREE||SL.R.occ[k]===OCC.LOT)SL.R.occ[k]=OCC.OUT;});
    P.gates=Wr.gates.map(g=>({p:[g.x,g.z],dir:g.name}));
    SL.note(5,Wr.gates.length+' gates ('+Wr.gates.filter(g=>g.named).length+' named), '+Wr.nodes.filter(n=>n.kind==='tower'&&!n.skip).length+' buttresses, 4 corner bastions, '+Wr.segs.length+' runs');}},
   {name:'the garden squares',run(){const R=SL.R,T=GARDEN_T,S=T.tile;let zoneA=0;
    for(let i=0;i<zone.length;i++){const p=zone[i],q=zone[(i+1)%zone.length];zoneA+=(p[0]*q[1]-q[0]*p[1])/2;}zoneA=Math.abs(zoneA)-(FB[2]-FB[0])*(FB[3]-FB[1]);
    const rect=(c,a,b,m)=>[[c[0]-a-m,c[1]-b-m],[c[0]+a+m,c[1]-b-m],[c[0]+a+m,c[1]+b+m],[c[0]-a-m,c[1]+b+m]].map(xz);
    const clear=(c,a,b)=>{let ok=true;R.eachInPoly(rect(c,a,b,T.margin),k=>{if(ok&&R.occ[k]!==OCC.FREE)ok=false;});return ok;};
    let area=0;
    for(const [id,name,[ci,cj],side] of GARDENS){if(area>=T.share*zoneA)break;
     const C=cellOf(ci,cj);if(!C)continue;const P=C.poly.map(uvOf);
     const u0=Math.min(...P.map(p=>p[0])),u1=Math.max(...P.map(p=>p[0])),v0=Math.min(...P.map(p=>p[1])),v1=Math.max(...P.map(p=>p[1])),cc=uvOf(C.c);
     const ax=side==='full'?null:side[0],sg=side==='full'?0:side[1]==='+'?1:-1;
     const cap=Math.max((T.share*zoneA-area)*1.15,T.min*T.min*S*S);
     const maxU=ax==='u'?(u1-u0)*T.half:u1-u0,maxV=ax==='v'?(v1-v0)*T.half:v1-v0,pairs=[];
     for(let nu=T.min;nu*S<=maxU;nu+=2)for(let nv=T.min;nv*S<=maxV;nv+=2)if(Math.max(nu,nv)/Math.min(nu,nv)<=T.aspect&&nu*nv*S*S<=cap)pairs.push([nu,nv]);
     pairs.sort((p,q)=>q[0]*q[1]-p[0]*p[1]||Math.abs(p[0]-p[1])-Math.abs(q[0]-q[1]));
     let got=null;
     for(const [nu,nv] of pairs){const a=nu*S/2,b=nv*S/2,cands=[];
      if(!ax){for(let du=-12;du<=12;du+=2)for(let dv=-12;dv<=12;dv+=2)cands.push([cc[0]+du,cc[1]+dv]);cands.sort((p,q)=>Math.hypot(p[0]-cc[0],p[1]-cc[1])-Math.hypot(q[0]-cc[0],q[1]-cc[1]));}
      else{const lo=ax==='u'?u0:v0,hi=ax==='u'?u1:v1,h=ax==='u'?a:b,mid=ax==='u'?cc[1]:cc[0];
       for(let s=0;s<=(hi-lo)/2;s+=2){const w=sg>0?hi-h-s:lo+h+s;for(let d=0;d<=12;d+=2)for(const e of d?[d,-d]:[0])cands.push(ax==='u'?[w,mid+e]:[mid+e,w]);}}
      for(const c of cands)if(clear(c,a,b)){got={c,nu,nv,a,b};break;}
      if(got)break;}
     if(!got){SL.note(5,name+': no room in cell '+ci+','+cj);continue;}
     const poly=rect(got.c,got.a,got.b,0),Gn=SL.addGreen('garden',poly,5,wealthUV(got.c),'civic',obb(xz(got.c),UX,got.a,got.b));
     R.stampPoly(rect(got.c,got.a,got.b,T.margin),OCC.HARD,-2-Gn.id);Gn.ghId=id;Gn.name=name;
     area+=got.nu*got.nv*S*S;GARD.push({id,name,cell:[ci,cj],side,c:got.c,nu:got.nu,nv:got.nv,green:Gn.id});}
    SL.note(5,GARD.length+' garden squares, '+Math.round(area)+' m2 ('+(100*area/zoneA).toFixed(1)+' % of the walled zone less the forbidden city)');}}
  ].concat(KCITY.defaultSteps().slice(6).filter(st=>(o.skip||SKIP).indexOf(st.name)<0));
  const uv=p=>[G.u(p[0],p[1]),G.v(p[0],p[1])];
  /* the wealth: the lakefront either side of the Lake Gate rich, and the river side by the River Gate; the west toward the
     Strongwall Gate and the inland edge poor */
  const wealthUV=([uu,vv])=>{let w=.5;if(vv<380&&Math.abs(uu-LAKE_GATE[0])>60)w=.88-(vv-160)/600;
   if(uu>300&&vv<900)w=Math.max(w,.62);if(uu<-300&&vv>500)w=Math.min(w,.24);if(vv>1100)w=Math.min(w,.22);if(dd([uu,vv],WEST_GATE)<160)w=.12;return Math.max(0,Math.min(1,w));};
  const rules={
   wealth:p=>wealthUV(uv(p)),
   vacant:(p,rs)=>{const q=uv(p);return rs.chance(q[1]>1100?.1:q[1]<360?.03:.06);},
   near:{harbour:c=>dd(uv(c.p),[LAKE_GATE[0],200])+(uv(c.p)[1]>360?400:0),bazaar:c=>dd(uv(c.p),BAZAAR),works:c=>dd(uv(c.p),[WEST_GATE[0]+70,WEST_GATE[1]]),
    gorge:c=>dd(uv(c.p),[GORGE_GATE[0],GORGE_GATE[1]-70]),river:c=>dd(uv(c.p),[RIVER_GATE[0]-70,RIVER_GATE[1]]),
    rich:c=>{const q=uv(c.p);return Math.abs(q[1]-220)+Math.abs(Math.abs(q[0]-LAKE_GATE[0])-220)*.5;}}};
  const finish=[function(Ci){const P=Ci.plan;let n=0;
   for(const Lt of P.lots){if(Lt.died!=null||!Lt.civic||Lt.cls==='landmark'||!Lt.bo)continue;const D=dims(Lt.key,Lt.v)||{},hw=(D.fw||Lt.w)/2,hd=(D.fd||Lt.d)/2,B=Lt.bo;
    if(P.ways.some(w=>w.died==null&&w.pts.some(p=>{const dx=p[0]-B.c[0],dz=p[1]-B.c[1],m=w.w/2-.6;return Math.abs(dx*B.u[0]+dz*B.u[1])<hw+m&&Math.abs(dx*B.v[0]+dz*B.v[1])<hd+m;}))){Lt.died='finish';n++;}}
   notes.push(n+' civic pieces a street reached, dropped');}];
  const C=KCITY.create({name:'gihon',tune:tune(),seed,rand:'krand',index:{order:'insertion'},ground:{h:G.h},kit:{dims},rules,steps,finish});
  C.run();
  const PL=C.plan;
  const fp=(k,v)=>{const D=dims(k,v)||{};return {fw:D.fw||D.w||0,fd:D.fd||D.d||0};};
  const lots=PL.lots.filter(Lt=>Lt.died==null&&Lt.bo&&Lt.key).map((Lt,n)=>({id:Lt.ghId?'gh.'+Lt.ghId:'gh.town.'+n,key:Lt.key,v:Lt.v|0,cls:Lt.cls,civic:!!Lt.civic,
   x:Lt.x,z:Lt.z,y:Lt.y==null?G.h(Lt.x,Lt.z):Lt.y,ry:Lt.ry,w:Lt.w,d:Lt.d,h:Lt.h,fw:fp(Lt.key,Lt.v).fw,fd:fp(Lt.key,Lt.v).fd,people:PEOPLE[Lt.key]||0,wealth:Lt.wealth}));
  const ways=PL.ways.filter(w=>w.died==null).map(w=>({id:'gh.way.'+w.id,cls:w.cls,w:w.w,tag:w.tag||null,pts:w.pts.map(p=>[p[0],p[1]])}));
  /* ---- the town's own pieces (records the page draws as the lots) */
  const extra=[],put=(id,key,v,p,ry,o2)=>{const D=dims(key,v);if(!D)return null;const c=xz(p);
   const r=Object.assign({id:'gh.extra.'+id,key,v,x:c[0],z:c[1],y:G.h(c[0],c[1]),ry,w:D.w,d:D.d,h:D.h,fw:D.fw||D.w,fd:D.fd||D.d,people:PEOPLE[key]||0,kind:'extra'},o2||{});extra.push(r);return r;};
  const H=G.HARBOUR,QY=1.7,MD=2.4;
  /* the harbour before the Lake Gate (Kirstabal's, kits/xanadu/extra/88f and 88d): the quays along the basin's shore, the mole
     round its west side and mouth, the lighthouse on its head, the boat sheds and the slip west of it, the warehouses behind */
  const Q=dims('xa_harbour_quay',0),qs=Q?Q.w:34,nq=Math.floor((H.u1-H.u0)/qs),q0=H.u0+(H.u1-H.u0-nq*qs)/2+qs/2;
  for(let i=0;i<nq;i++)put('quay.'+i,'xa_harbour_quay',i%3,[q0+i*qs,-4],face(NVX),{y:MD,kind:'quay'});
  const MOLE={a:[H.u0-14,8],b:[H.u0-14,H.v0-14],c:[H.u1-70,H.v0-14],w:16};
  const moles=[[MOLE.a,[MOLE.b[0],MOLE.b[1]+MOLE.w/2]],[[MOLE.b[0]-MOLE.w/2,MOLE.b[1]],MOLE.c]],moleRecs=[];
  for(const [a,b] of moles){const L2=dd(a,b),n=Math.max(1,Math.round(L2/qs)),A=xz(a),B=xz(b),ry=face([B[1]-A[1],-(B[0]-A[0])]);
   moleRecs.push({id:'gh.extra.mole.'+moleRecs.length,a:A,b:B,w:MOLE.w,top:MD-6.4,kind:'mole'});
   for(let i=0;i<n;i++){const t=(i+.5)/n;put('mole.'+moleRecs.length+'.'+i,'xa_mole_run',0,[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t],ry,{y:MD,kind:'mole',len:L2/n});}}
  put('lighthouse','xa_lighthouse',0,[MOLE.c[0],MOLE.c[1]],face(NVX),{y:MD,kind:'lighthouse'});
  for(let i=0;i<4;i++)put('boatshed.'+i,'xa_boatshed',0,[H.u0-46-i*20,-6],face(NVX),{y:Math.max(QY-.4,G.h(...xz([H.u0-46-i*20,4]))),kind:'boatshed'});
  [-260,-205,-150,30,85].forEach((uu,i)=>put('warehouse.'+i,'xa_harbour_warehouse',i%3,[uu,24],face(NVX),{kind:'warehouse'}));
  put('slip','xa_slip',0,[H.u0-140,-6],face(NVX),{y:G.h(...xz([H.u0-140,9]))+.05,kind:'slip'});
  [[-170,'a'],[20,'b']].forEach(([uu,k])=>put('barge.'+k,'xa_lake_barge',1,[uu,-12],face(UX),{y:0,kind:'boat'}));
  for(let i=0;i<2;i++)put('launch.'+i,'xa_launch',1,[H.u0-56-i*20,-26],face(NVX),{y:0,kind:'boat'});
  for(let i=0;i<4;i++)put('dugout.'+i,'xa_dugout',0,[H.u0-44-i*20,-17],face(NVX),{y:0,kind:'boat'});
  put('launch.sail','xa_launch',0,[-80,-560],face(UX),{y:0,kind:'boat'});
  put('dugout.out.a','xa_dugout',1,[260,-620],face(NUX),{y:0,kind:'boat'});put('dugout.out.b','xa_dugout',1,[320,-700],face([-.3,-1]),{y:0,kind:'boat'});
  /* the fish racks along the shore west of the harbour (the old village's trade) */
  for(let i=0;i<3;i++)put('fishracks.'+i,'xa_fish_racks',i%2,[-560-i*34,26],face(NVX),{kind:'works'});
  /* THE RIVER FRONT (PLAN.md section 3): on the Opal River's west bank below the River Gate, the river quays end to end along the
     bank (their fronts to the water), the customs house (88g) facing the bridge's end, warehouses behind; the bridge carries the
     river road east over the river (88f's arch spans: 26 m pieces, a pier under each, an abutment each end) */
  const RV=G.river,riverU=vv=>{let best=null;for(let uu=600;uu<1600;uu+=4){const p=xz([uu,vv]),r=G.riverAt(p[0],p[1]);if(r[0]<RV.width/2+2){best=uu;break;}}return best;};
  const rq=[],RQ=dims('xa_quay',0),rqs=RQ?RQ.w:16;
  for(let vv=180;vv<=1060;vv+=rqs+2){if(Math.abs(vv-RIVER_GATE[1])<rqs/2+16)continue;const ub=riverU(vv);if(ub==null)continue;   /* none under the bridge */const p=[ub-RV.width*0+(-6),vv];
   const y=G.riverAt(...xz([ub+2,vv]))[1]+2.2;const r=put('riverquay.'+rq.length,'xa_quay',0,p,face(UX),{y,kind:'quay'});if(r)rq.push(r);}
  const BRV=RIVER_GATE[1],bu=riverU(BRV)||900,BR={u0:bu-30,u1:bu+RV.width+34,v:BRV};
  const bd=dims('xa_river_span',0),span=bd?bd.d:26,nb=Math.max(1,Math.round((BR.u1-BR.u0)/span)),bmid=(BR.u0+BR.u1)/2,bAt=i=>bmid+(i-(nb-1)/2)*span;
  const deck=Math.max(G.h(...xz([BR.u0-span,BR.v])),G.h(...xz([BR.u1+span,BR.v])),G.riverAt(...xz([bmid,BR.v]))[1]+5);
  for(let i=0;i<nb;i++)put('bridge.'+i,'xa_river_span',0,[bAt(i),BR.v],face(UX),{y:deck,kind:'bridge'});
  put('bridge.abut.a','xa_river_span',1,[bAt(-1),BR.v],face(UX),{y:deck,kind:'bridge'});put('bridge.abut.b','xa_river_span',1,[bAt(nb),BR.v],face(NUX),{y:deck,kind:'bridge'});
  put('customs','xa_customs_house',0,[BR.u0-40,BR.v+48],face(UX),{kind:'customs'});
  [[BR.u0-44,BR.v-70],[BR.u0-44,BR.v+120],[BR.u0-44,BR.v+180],[BR.u0-44,BR.v-130]].forEach((p,i)=>put('riverstore.'+i,'xa_harbour_warehouse',(i+1)%3,p,face(UX),{kind:'warehouse'}));
  /* the moats' bridges (the town's at its four gates; the forbidden city's at its two) */
  const MB=[];const moatBridges=(M,tag)=>{if(!M)return;const bd2=dims('xa_bridge',0),sp=bd2?bd2.d:20,run=M.width+10,nm=Math.max(1,Math.ceil(run/sp));
   for(const b of M.bridges){if(tag==='fc'&&b.side!=='v-'&&b.side!=='v+')continue;const e0=[b.x-b.dir[0]*run/2,b.z-b.dir[1]*run/2],e1=[b.x+b.dir[0]*run/2,b.z+b.dir[1]*run/2],dk=Math.max(G.base(...e0),G.base(...e1))+.15;
    for(let i=0;i<nm;i++){const t=-run/2+(i+.5)*run/nm,c=[b.x+b.dir[0]*t,b.z+b.dir[1]*t];extra.push({id:'gh.extra.moatbridge.'+tag+'.'+b.side+'.'+i,key:'xa_bridge',v:0,x:c[0],z:c[1],y:dk,
     ry:face(b.dir),w:bd2?bd2.w:10,d:bd2?bd2.d:20,h:bd2?bd2.h:4,fw:bd2?bd2.fw||bd2.w:10,fd:bd2?bd2.fd||bd2.d:20,people:0,kind:'bridge'});}
    MB.push({tag,side:b.side,x:b.x,z:b.z,deck:dk});}};
  moatBridges(GR.moat,'town');moatBridges(FG.moat,'fc');
  /* ---- THE FORBIDDEN CITY: its pieces in its own grid's cells, level on the terrace; its wall from the fort asset (XFORT.plan,
     kits/xanadu 80f) on the square's four corners, raised to a royal wall (FC_T), two gates on its north-south axis */
  const TER=G.terrace(),fcRecs=[];
  const fcCell=(i,j)=>FG.cells.find(c=>c.i===i&&c.j===j);
  for(const [id,key,[ci,cj],[du,dv],people,tw] of FC_PIECES){const C2=fcCell(ci,cj);if(!C2)continue;const cc=uvOf(C2.c),p=[cc[0]+du,cc[1]+dv];
   const ry=key==='xa_barracks'||key==='xa_muster'?face(ci?NUX:UX):face(cc[0]<FCC[0]?UX:NUX);   /* faces the axis */
   const r=put('fc.'+id,key,0,p,ry,{kind:'fc',people,y:TER?TER.y:G.h(...xz(p)),fc:true});if(r){r.id='gh.fc.'+id;fcRecs.push(r);}}
  /* the fort asset's ward: an outline in the forbidden city's own frame (x east, z south, from its centre), its corners the
     square's (KCITY.grid corners); the north gate by XFORT.plan's gateEdge, the south gate added as XFORT's own gateOn does */
  const FCW=(function(){if(typeof XFORT==='undefined')return null;const c0=FG.frame.c,corners=FG.corners.map(c=>[c.x-c0[0],c.z-c0[1]]);
   let poly=corners.slice();if(XFORT.area(poly)>0)poly.reverse();
   const mids=poly.map((p,i)=>{const q=poly[(i+1)%poly.length];return(p[1]+q[1])/2;}),north=mids.indexOf(Math.min(...mids)),south=mids.indexOf(Math.max(...mids));
   const P=XFORT.plan({size:'watch',outline:poly,gateEdge:north}),S=XFORT.SIZES.watch;
   P.buildings=[];P.guns=[];P.id='gh.fc.wall';   /* the watch fort's own buildings are not the forbidden city's: its pieces are fcRecs */
   P.stairs=P.curtains.map(c=>({curtain:c.id,u:.3}));   /* a flight up to every curtain's walk, a third along it (XFORT's rule: every walk reaches a stair) */
   const cS=P.curtains.find(c=>c.edge===south);
   if(cS){const g={id:'gate.s',curtain:cS.id,t:.5,kind:'iwan',w:FC_T.gateW,at:[(cS.a[0]+cS.b[0])/2,(cS.a[1]+cS.b[1])/2],ry:Math.atan2(cS.out[0],cS.out[1])};P.gates.push(g);
    const gt=S.gateTower,off=g.w/2+XFORT.half(gt)+.5,reach=off+XFORT.half(gt)+4,L=Math.hypot(cS.b[0]-cS.a[0],cS.b[1]-cS.a[1]),ux=(cS.b[0]-cS.a[0])/L,uz=(cS.b[1]-cS.a[1])/L;
    for(let i=P.towers.length-1;i>=0;i--){const t=P.towers[i];if(t.kind==='interval'&&Math.hypot(t.at[0]-g.at[0],t.at[1]-g.at[1])<reach+XFORT.half(t))P.towers.splice(i,1);}
    for(const s of[-1,1]){const a=[g.at[0]+ux*off*s,g.at[1]+uz*off*s],push=Math.max(0,XFORT.half(gt)-cS.t/2);P.towers.push(Object.assign({id:'gate.s.t'+(s<0?'l':'r'),kind:'gate',at:a,ctr:[a[0]+cS.out[0]*push,a[1]+cS.out[1]*push]},gt));}}
   const gn=P.gates.find(g=>g.id==='gate');if(gn)gn.id='gate.n';
   /* a royal wall (the Sultan's forbidden city, not a watch fort): the curtains raised and thickened, the towers raised with them */
   for(const c of P.curtains){c.h=FC_T.curtH;c.t=FC_T.curtT;c.walk=FC_T.walk;}
   for(const t of P.towers){const k=t.kind==='gate'?1.5:1.35;t.h=Math.round(t.h*k*10)/10;
    if(t.w!=null&&t.kind!=='gate'){const old=t.w/2,nw=t.w*1.2;t.w=nw;const dx=t.ctr[0]-t.at[0],dz=t.ctr[1]-t.at[1],L=Math.hypot(dx,dz);if(L>.01){const k2=(L+(nw/2-old))/L;t.ctr=[t.at[0]+dx*k2,t.at[1]+dz*k2];}}}
   const bad=XFORT.check?XFORT.check(P):[];P.faults=bad;
   return {plan:P,c:[c0[0],c0[1]],y:TER?TER.y:G.h(c0[0],c0[1]),north,south};})();
  const fc={grid:{wall:FG.wall,corners:FG.corners.map(c=>({id:c.id,x:c.x,z:c.z})),gates:FG.gates.filter(g=>g.side==='v-'||g.side==='v+').map(g=>({side:g.side,x:g.x,z:g.z})),zone:FG.zone},
   box:FB,terrace:TER,moat:FG.moat?{line:FG.moat.line,width:FG.moat.width}:null,ward:FCW,pieces:fcRecs.map(r=>r.id)};
  /* the forbidden city's own streets: its two avenues inside its wall (the north-south axis whole, the east-west to the wall) */
  for(const w of FG.ways){if(w.role!=='avenue')continue;const pts=w.pts.filter(p=>KCITY.grid.inside(FG,p[0],p[1]));if(pts.length<2)continue;
   ways.push({id:'gh.fcway.'+w.id,cls:'avenue',w:9,tag:w.line==='v'?'the forbidden city\'s axis':'the forbidden city\'s cross street',pts:pts.map(p=>[p[0],p[1]]),fc:true});}
  /* ---- the garden squares' tiles: each garden one level, its tiles' footings to their lowest corners; their walls */
  const DIR={'u+':UX,'u-':NUX,'v+':VX,'v-':NVX},S=GARDEN_T.tile;
  const gardens=GARD.map((g,gi)=>{const grand=g.nu>=11&&g.nv>=11,pool=GARDEN_COURTS.other.slice(),courts=grand?GARDEN_COURTS.grand.slice():[];
   while(courts.length<4){const k=Math.floor(KRAND.unit(KRAND.hash(SQ.seed,7101,gi,courts.length))*pool.length);courts.push(pool.splice(k,1)[0]);}
   const a=g.nu*S/2,b=g.nv*S/2,u0=g.c[0]-a,v0=g.c[1]-b,hs=[];
   for(let i=0;i<=g.nu;i++)for(let j=0;j<=g.nv;j++)hs.push(G.h(...xz([u0+i*S,v0+j*S])));
   const y=Math.max(...hs),hAt=(i,j)=>hs[i*(g.nv+1)+j],tiles=gardenTiles(g.nu,g.nv,courts);
   for(const [i,j,key,dir] of tiles){const lo=Math.min(hAt(i,j),hAt(i+1,j),hAt(i,j+1),hAt(i+1,j+1));
    put('garden.'+g.id+'.'+i+'.'+j,key,gi%3,[u0+(i+.5)*S,v0+(j+.5)*S],face(DIR[dir]),{y,drop:y-lo+.3,kind:'garden',garden:g.id});}
   const WO=.8,sides=[[g.nu,'v',-1],[g.nu,'v',1],[g.nv,'u',-1],[g.nv,'u',1]];
   for(const [n,ax,sg] of sides)for(let i=0;i<n;i++){const mid=(n-1)/2,end=i===0?-1:i===n-1?1:0,len=S+(end?WO*2:0)*(n===1?2:1),sh=end*WO;
    const t=(i+.5)*S+sh,p=ax==='v'?[u0+t,g.c[1]+sg*(b+WO)]:[g.c[0]+sg*(a+WO),v0+t],out=ax==='v'?(sg<0?NVX:VX):(sg<0?NUX:UX);
    const lo=Math.min(...[-len/2,len/2].map(e=>G.h(...xz(ax==='v'?[p[0]+e,p[1]]:[p[0],p[1]+e]))));
    put('garden.'+g.id+'.wall.'+ax+(sg<0?'-':'+')+'.'+i,'xa_garden_wall',i===mid?1:0,p,face(out),{y,drop:Math.max(0,y-lo)+.3,kind:'gardenwall',garden:g.id,len});}
   return Object.assign({},g,{y,tiles:tiles.length,courts,area:g.nu*g.nv*S*S,poly:[[u0,v0],[u0+2*a,v0],[u0+2*a,v0+2*b],[u0,v0+2*b]].map(xz)});});
  /* ---- the roads beyond: the river road east over the bridge (to Rāis-Ṭeras and Kirstabal), the Strongwall road west, the gorge road south */
  const rgOut=uvOf(GR.ways.find(w=>w.role==='avenue'&&w.line==='u').pts.slice(-1)[0]);
  const roads=[{id:'gh.road.river',cls:'road',w:7,tag:'the river road (east, over the bridge)',pts:[rgOut,[BR.u0-10,BR.v],[BR.u1+10,BR.v],[BR.u1+600,BR.v+80],[BR.u1+2400,BR.v+300]].map(xz)},
   {id:'gh.road.strongwall',cls:'road',w:7,tag:'the Strongwall road (the bullion road)',pts:[[-1100,760],[-1800,900],[-3200,1300],[-5200,1900]].map(xz)},
   {id:'gh.road.gorge',cls:'road',w:7,tag:'the gorge road (up the Opal River to Lāiṭwāl)',pts:[[GORGE_GATE[0]-40,1480],[200,2100],[900,2900],[1700,3900],[2700,4800]].map(xz)}];
  /* ---- THE QUARTERS OUTSIDE THE WALLS: a second core/city instance over three zones (Kirstabal's), the roads they grow along */
  const OQ=(function(){const T0=tune(),Lb=KCITY.lib,OCC2=Lb.OCC,uvb=([u0,v0,u1,v1])=>[[u0,v0],[u1,v0],[u1,v1],[u0,v1]].map(xz),
   road={strongwall:(PL.ways.find(w=>w.tag==='the Strongwall road')||{pts:[]}).pts,gorge:(PL.ways.find(w=>w.tag==='the gorge road')||{pts:[]}).pts};
   const standing=PL.lots.filter(Lt=>Lt.died==null&&Lt.bo&&['serai'].indexOf(Lt.ghId)>=0).map(Lt=>Lt.bo).concat(
    extra.filter(r=>r.kind==='works'||r.kind==='boatshed'||r.kind==='slip'||r.kind==='warehouse').map(r=>box([r.x,r.z],r.ry,r.fw,r.fd)));
   const zoneOf=p=>{const q=uvOf(p);return OUTSIDE_Q.find(Q=>q[0]>=Q[2][0]&&q[0]<=Q[2][2]&&q[1]>=Q[2][1]&&q[1]<=Q[2][3]);};
   const st=[
    {name:'the site and its ground',run(){const R=SL.R=new Raster(OUTSIDE_T.rasterHalf,T0.cell);R.occ.fill(OCC2.OUT);const P=L.plan();
     P.site=OUTSIDE_Q.map((Q,i)=>({id:i,name:Q[1],role:'zone',poly:uvb(Q[2])}));P.zone=uvb(OUTSIDE_Q[0][2]);
     let land=0;for(const Q of OUTSIDE_Q)land+=KCITY.site.zoneRaster(R,uvb(Q[2]),{dry:1.2,maxSlope:T0.maxSlope,h:G.h});
     SL.minSpacing=KCITY.site.minSpacing();SL.note(0,'the quarters outside the walls, '+land+' cells');}},
    {name:'landmarks',run(){for(const B of standing)SL.R.stampPoly(obbCorners(Object.assign({},B,{hw:B.hw+4,hd:B.hd+4})),OCC2.HARD,-1);SL.note(1,standing.length+' pieces outside the wall kept clear');}},
    {name:'districts',run(){SL.note(2,'three quarters by their gates');}},
    {name:'avenues',run(){for(const k in road)if(road[k].length>1)SL.addWay('avenue',road[k],3,{tag:'('+k+' road)'});SL.note(3,'the roads the quarters grow along');}},
    {name:'highways',run(){}},{name:'the wall and its gates',run(){}}
   ].concat(KCITY.defaultSteps().slice(6).filter(x=>SKIP.indexOf(x.name)<0));
   const C2=KCITY.create({name:'gihon-outside',tune:Object.assign({},T0,{civic:[],rasterHalf:OUTSIDE_T.rasterHalf,mapHalf:OUTSIDE_T.rasterHalf}),seed:OUTSIDE_T.seed,rand:'krand',index:{order:'insertion'},ground:{h:G.h},kit:{dims},
    rules:{wealth:p=>{const Q=zoneOf(p);return Q?Q[3]:.3;},vacant:(p,rs)=>rs.chance(.05)},steps:st});
   C2.run();const P2=C2.plan,gateOf={strongwall:WEST_GATE,gorge:GORGE_GATE};
   const out=P2.lots.filter(Lt=>Lt.died==null&&Lt.bo&&Lt.key).map((Lt,n)=>{const Q=zoneOf([Lt.x,Lt.z])||OUTSIDE_Q[0],g=gateOf[Q[4]],d=dd(uvOf([Lt.x,Lt.z]),g),
     home=PEOPLE[Lt.key]>0&&['poor','middle','rich','manor'].indexOf(Lt.cls)>=0,u=KRAND.unit(KRAND.hash(OUTSIDE_T.seed,4127,n)),vac=home&&u<OUTSIDE_T.vacant+(d>200?OUTSIDE_T.far:0);
     return {id:'gh.out.'+n,key:Lt.key,v:Lt.v|0,cls:Lt.cls,civic:false,x:Lt.x,z:Lt.z,y:Lt.y==null?G.h(Lt.x,Lt.z):Lt.y,ry:Lt.ry,w:Lt.w,d:Lt.d,h:Lt.h,fw:fp(Lt.key,Lt.v).fw,fd:fp(Lt.key,Lt.v).fd,
      people:vac?0:PEOPLE[Lt.key]||0,wealth:Lt.wealth,district:Q[0],vacant:vac||undefined,bill:vac&&KRAND.unit(KRAND.hash(OUTSIDE_T.seed,4129,n))<OUTSIDE_T.bill||undefined};});
   const ws=P2.ways.filter(w=>w.died==null&&!/^\(/.test(w.tag||'')).map(w=>({id:'gh.outway.'+w.id,cls:w.cls,w:w.w,tag:w.tag||null,pts:w.pts.map(p=>[p[0],p[1]])}));
   return {lots:out,ways:ws,notes:P2.log||[]};})();
  lots.push(...OQ.lots);ways.push(...OQ.ways);
  const census={buildings:lots.length+extra.length,people:0,byKey:{},byCls:{},fc:0};
  for(const r of lots.concat(extra)){census.people+=r.people;census.byKey[r.key]=(census.byKey[r.key]||0)+1;if(r.fc)census.fc+=r.people;}
  for(const r of lots)census.byCls[r.cls]=(census.byCls[r.cls]||0)+1;
  return {lots,ways,extra,moles:moleRecs,roads,bridge:Object.assign({deck,ry:face(UX)},BR,{a:xz([BR.u0,BR.v]),b:xz([BR.u1,BR.v])}),census,fc,riverQuays:rq.length,
   notes:(PL.log||PL.notes||notes).concat(OQ.notes),zone,instance:C,outside:OUTSIDE_Q.map(Q=>({id:Q[0],name:Q[1],rect:Q[2],lots:OQ.lots.filter(l=>l.district===Q[0]).length,vacant:OQ.lots.filter(l=>l.district===Q[0]&&l.vacant).length})),
   wall:PL.wallRec?{segs:PL.wallRec.segs.map(g=>({ax:g.ax,az:g.az,bx:g.bx,bz:g.bz,health:g.health})),
    nodes:PL.wallRec.nodes.filter(n=>!n.skip&&n.health>0&&n.kind!=='corner').map(n=>({kind:n.kind,x:n.gx,z:n.gz,ry:n.ry,name:n.name||null,named:!!n.named,way:n.way?n.way.cls:null})),
    corners:GR.corners.map(c=>({id:c.id,x:c.x,z:c.z})),line:GR.wall}:null,
   moat:GR.moat?{line:GR.moat.line,width:GR.moat.width,bridges:MB}:null,gardens,
   places:{bazaar:BAZAAR,lakeGate:LAKE_GATE,riverGate:RIVER_GATE,westGate:WEST_GATE,gorgeGate:GORGE_GATE,fc:FCC,centre:SQ.c,half:SQ.half+SQ.wallGap}};}
 return {make,PEOPLE,ZONE,LANDMARKS,SQ,grid,fcGrid,FC_T,FC_PIECES,GARDENS,GARDEN_T,gardenTiles,OUTSIDE_Q,OUTSIDE_T};
})();
