// ================================================================= KIRSTABAL — the town on core/city (records; draws nothing)
// [G data] Step K2 of PLAN.md (section 3, the layout; the owner, 2026-11-16: a lake port of 3,000, "a target on xanadu's page,
// it will use just the normal xanadu kit"). One core/city instance (KCITY.create) on the apron behind the shore; the town's
// own records beside it: the harbour (its quays, the mole, the lighthouse, the boat sheds), the latex house's compound (the
// White Monastery's), the serai, the White Monastery's daughter house, the north gate, and the Strongbow road over the bridge
// across Keb Riwa's mouth (K3). Every piece is a normal Xanadu kit piece; what the kit lacks is composed of its pieces and
// named so. The caravanserai, the latex house, the tea factory and the fermentary are the kit's (kits/xanadu/src/87k-xa-lake-trades.js,
// opt-in: read in place through kit.json).
//
// THE FRAME   the shore frame of 40-ks-ground.js: u along the shore (north-east positive), v inland (south-east). Since
//             2026-11-17 the town is a walled square after Chiang Mai (the owner): core/city's irregular square (KCITY.grid,
//             core/city/37-city-grid.js), its inner street 660 m a side from 100 m behind the shore, the slate wall 16 m outside
//             it with a bastion at each corner, the Lamp Way from the Lake Gate to the Scarp Gate, the Strongbow way from the
//             Works Gate to the Strongbow Gate, a grid of main streets between that wanders, ends in T's and bends; core/city's
//             steps 6-11 fill the blocks (civic pieces by `near`, the lots, side streets). Outside: the quay street, the
//             harbour, the serai, the works and the monastery.
// THE WEALTH  rich on the lakefront inside the wall either side of the Lake Gate, poor by the Works Gate and at the inland edge.
//
// KS_TOWN.make({dims, seed}) -> {lots, ways, extra, roads, census, notes}: dims(key, v) -> {w, d, h} the kit's boxes (VERN.defs on the
// page; the test's table in node). Every record keyed by a stable id ('ks.town.' + n, 'ks.extra.<what>'), x z in the page's frame.
var KS_TOWN=(function(){
 const G=KS_GROUND,at=(u,v)=>G.at(u,v),face=(d)=>Math.atan2(d[0],d[1]);   /* a piece's front toward d (x, z) */
 const UX=G.UX,VX=G.VX,NUX=[-UX[0],-UX[1]],NVX=[-VX[0],-VX[1]];
 /* THE WALLED SQUARE (the owner, 2026-11-17: "make the layout more square, with a wall made of slate similar to the thin brick
    wall of chiang mai ... mostly square, but somewhat irregular, also like chiang mai"): core/city's irregular square
    (KCITY.grid, core/city/37-city-grid.js) in the shore frame, its inner street 660 m a side from 100 m behind the shore, the
    wall 16 m outside it, five grid cells a side, the two avenues on its second lines (the one from the Lake Gate meets the
    harbour; the other runs from the Works Gate to the Strongbow Gate). The quay street, the harbour and the works stay outside
    the wall. Was (2026-11-16) an open comb of streets on a 960 x 440 m zone */
 const SQ={c:[0,440],half:330,cells:5,avenues:{u:2,v:2},wallGap:16,out:50,seed:41710,moat:{gap:15,width:16}};   /* the moat: Chiang Mai's (the owner, 2026-11-17), 16 m wide, its middle 15 m outside the wall */
 const GATE_NAMES={'v-':'the Lake Gate','v+':'the Scarp Gate','u-':'the Works Gate','u+':'the Strongbow Gate'};
 const LANDMARK_CELLS={bazaar:[2,2],temple:[1,2],horns:[2,1],seat:[3,3],generator:[1,0],barracks:[4,1]};   /* [i along the shore, j inland] */
 /* THE GARDEN SQUARES (the owner, 2026-11-17: "strategically add some Xanadu kit garden tiles in groups that form even squares or
    rectangles among the city grid instead of aimless pathways through unfilled squares ... maybe 10% of the city total"): each a
    rectangle of the kit's 8 m garden tiles squared to the shore frame inside one grid cell, a chahar bagh (the rills crossing at
    its middle, a pool cap at each axis's end, a jet allee either side of the cross in the big ones, a court at each quarter's
    middle, parterres between), reserved before core/city's infill so its side streets and lots go round it. In this order until
    GARDEN_T.share of the zone is garden: [id, name, cell [i, j], 'full' or the cell's side it keeps to (u-, u+, v-, v+)] */
 const GARDENS=[['governor','the Governor’s garden',[3,2],'full'],   /* beside the seat [3,3] */
  ['decree','the garden of the Decree',[1,3],'v-'],                     /* across the street from the temple [1,2] */
  ['lake','the Lake garden',[3,0],'v-'],['east','the East garden',[4,3],'u-'],['west','the West garden',[0,2],'u+'],
  ['scarp','the Scarp garden',[2,4],'v-'],['works','the Works garden',[0,0],'u+'],['inland','the Inland garden',[4,4],'u-']];
 const GARDEN_T={share:.10,tile:8,margin:1.5,min:5,aspect:1.8,half:.55};
 const GARDEN_COURTS={grand:['xa_kiosk','xa_star_court','xa_lily_pond','xa_vault_pavilion'],
  other:['xa_star_court','xa_lily_pond','xa_cactus_court','xa_brick_court','xa_plunge_pool','xa_kiosk','xa_pergola','xa_bath_pool']};
 /* a garden's tiles on its nu x nv grid (both odd): [a, b, key, the direction its local +z runs: 'u+' 'u-' 'v+' 'v-'] */
 function gardenTiles(nu,nv,courts){const cu=(nu-1)/2,cv=(nv-1)/2,out=[],qc=c=>Math.floor((c+1)/2);let q=0;
  for(let a=0;a<nu;a++)for(let b=0;b<nv;b++){const du=a-cu,dv=b-cv;let key='xa_parterre',dir='u+';
   if(!du&&!dv)key='xa_rill_cross';
   else if(!dv){dir='u+';key=Math.abs(du)===cu?'xa_rill_pool':Math.abs(du)===2&&cu>=4?'xa_rill_jets':'xa_rill';if(Math.abs(du)===cu)dir=du<0?'u+':'u-';}   /* a cap's pool at its local -z: outward */
   else if(!du){dir='v+';key=Math.abs(dv)===cv?'xa_rill_pool':Math.abs(dv)===2&&cv>=4?'xa_rill_jets':'xa_rill';if(Math.abs(dv)===cv)dir=dv<0?'v+':'v-';}
   else if(cu>=3&&cv>=3&&Math.abs(du)===qc(cu)&&Math.abs(dv)===qc(cv))key=courts[(du<0?0:2)+(dv<0?0:1)];
   out.push([a,b,key,dir]);}
  return out;}
 let GRID=null;
 const grid=()=>GRID||(GRID=KCITY.grid.plan({id:'ks.grid',seed:SQ.seed,c:G.at(SQ.c[0],SQ.c[1]),u:G.UX,v:G.VX,half:SQ.half,cells:SQ.cells,avenues:SQ.avenues,wallGap:SQ.wallGap,out:SQ.out,moat:SQ.moat}));
 const cellUV=k=>{const C=grid().cells.find(c=>c.i===LANDMARK_CELLS[k][0]&&c.j===LANDMARK_CELLS[k][1]);return [G.u(C.c[0],C.c[1]),G.v(C.c[0],C.c[1])];};
 /* the square's bounds in the shore frame (the flora's mask and the gardens' paint read it): the wall's box */
 const ZONE=[[SQ.c[0]-SQ.half-SQ.wallGap,SQ.c[1]-SQ.half-SQ.wallGap],[SQ.c[0]+SQ.half+SQ.wallGap,SQ.c[1]-SQ.half-SQ.wallGap],
  [SQ.c[0]+SQ.half+SQ.wallGap,SQ.c[1]+SQ.half+SQ.wallGap],[SQ.c[0]-SQ.half-SQ.wallGap,SQ.c[1]+SQ.half+SQ.wallGap]];
 /* the people a building holds (households of 5-7, servants in the rich houses, the garrison in its barracks, the monks in the
    daughter house); summed in census and held to PLAN.md's 3,000 by the test */
 const PEOPLE={xa_poor_a:6,xa_poor_b:12,xa_poor_c:4,xa_andean_poor:6,xa_mid_a:7,xa_mid_b:9,xa_mid_c:16,xa_house_turk_a:8,xa_rich_a:12,xa_rich_b:16,xa_rich_c:11,
  xa_house_turk_b:10,xa_shops:6,xa_shop_turk_a:8,xa_shop_turk_b:6,xa_teahouse:4,xa_workshop:5,xa_smithy:4,xa_warehouse:2,xa_bath:4,xa_temple:6,xa_granary:0,
  xa_barracks:80,xa_generator:4,xa_monastery:150,xa_serai:20,xa_latex_house:0,xa_tea_factory:4,xa_fermentary:2,xa_fish_racks:0,xa_boatshed:3,xa_quay:0,xa_lighthouse:2,xa_gate:12,xa_watch:4,xa_garden:0,xa_pens:0,xa_wall:0,xa_bridge:0,xa_barge:0};
 /* the wall's records (core/city 25 KCITY.site.wall): a buttress every 90 m, the gates found within 40 m of the avenues' crossings */
 const WALL_T={towerGap:90,clear:12,gateFind:40,thick:3.2,gateTower:5,gatePass:4};
 const tune=()=>({cell:2.5,rasterHalf:900,maxSlope:.22,exact:true,
  width:{avenue:10,main:7,side:5,alley:3,highway:9,lane:4},
  lot:{side:1.6,setback:1.4,rear:3,inset:1,step:3},
  classes:{manor:[['xa_rich_b',0]],rich:[['xa_rich_a',0],['xa_rich_c',0],['xa_house_turk_b',0],['xa_house_turk_b',1]],
   middle:[['xa_mid_a',0],['xa_mid_b',0],['xa_house_turk_a',0]],   /* no tenements (xa_mid_c): a lake town of 3,000 */poor:[['xa_poor_a',0],['xa_poor_b',0],['xa_poor_c',0],['xa_andean_poor',0]],
   shop:[['xa_shops',0],['xa_shop_turk_a',0],['xa_shop_turk_b',1],['xa_teahouse',0]],tavern:[['xa_teahouse',0]],industrial:[['xa_workshop',0],['xa_smithy',0],['xa_warehouse',0]]},
  fallback:{manor:'rich',rich:'middle',middle:'poor',shop:'middle',tavern:'shop',industrial:'poor',poor:null},
  civic:[{key:'xa_warehouse',v:0,near:'harbour'},{key:'xa_warehouse',v:0,near:'harbour'},{key:'xa_warehouse',v:0,near:'harbour'},{key:'xa_warehouse',v:0,near:'harbour'},
   {key:'xa_teahouse',v:0,near:'harbour'},{key:'xa_watch',v:0,near:'harbour'},{key:'xa_bath',v:0,near:'bazaar'},{key:'xa_granary',v:0,near:'bazaar'},
   {key:'xa_granary',v:1,near:'bazaar'},{key:'xa_granary',v:0,near:'bazaar'},{key:'xa_shops',v:0,near:'bazaar'},{key:'xa_shops',v:0,near:'bazaar'},
   {key:'xa_shop_turk_a',v:0,near:'bazaar'},{key:'xa_shop_turk_a',v:1,near:'bazaar'},{key:'xa_workshop',v:0,near:'works'},
   {key:'xa_workshop',v:0,near:'works'},{key:'xa_smithy',v:0,near:'works'},{key:'xa_warehouse',v:0,near:'works'}],
   /* the four loose xa_garden plots (2026-11-16, "add some gardens and foliage") gave way to the garden squares (GARDENS, 2026-11-17) */
  civicSpacing:34,civicJitter:12,
  voidMax:40,voidIters:12,voidBatch:8,sideSpacing:46,sideMax:180,alleyFrac:.22,blindMax:80,interiorDepth:9,interiorRounds:2,
  avenueSnap:40,ringGap:8,verge:6,mapHalf:900,plazaArt:{rich:[],middle:[],poor:[],commerce:[]}});
 /* the landmarks the town places itself (step 1): [id, key, v (variant), u, v, the way the front faces]. Inside the wall each
    stands in its grid cell (LANDMARK_CELLS: the bazaar's square at the avenues' crossing, the temple of the Decree beside it
    as Chiang Mai's great temple stands at its centre, the Two Horns' factor house on the bazaar, the governor's seat inland
    of it, the generator by the Lamp Way, the barracks by the Strongbow Gate); outside, the serai by the Strongbow Gate and the
    works by the Works Gate */
 const WORKS=[-450,600];
 const LANDMARKS=()=>{const c=cellUV;return [
  ['seat','xa_rich_b',0,...c('seat'),'bazaar'],          /* the governor of the Scarp's house: a hillside manor (the seat) */
  ['barracks','xa_barracks',0,...c('barracks'),'bazaar'],   /* the garrison of about 80 */
  ['generator','xa_generator',0,...c('generator'),'lamp'],    /* the Sultan's licence lights the Lamp Way (T.lit) */
  ['horns','xa_rich_c',0,...c('horns'),'bazaar'],       /* the Brotherhood of the Two Horns' factor house (horns.kirstabal), on the bazaar */
  ['serai','xa_serai',0,420,430,'gate'],         /* the caravanserai outside the Strongbow Gate (kits/xanadu 87k, opt-in) */
  ['tea','xa_tea_factory',0,-470,560,'lake'],      /* the tea factory: the withering lofts and the rolling shed */
  ['ferment.a','xa_fermentary',0,-538,500,'lake'],['ferment.b','xa_fermentary',1,-538,526,'lake'],   /* the cacao fermentaries */
  ['temple','xa_temple',0,...c('temple'),'bazaar']];};   /* the temple of the Decree, beside the bazaar */
 /* the latex house (the White Monastery's; the owner, 2026-11-16): one kit piece (kits/xanadu 87k xa_latex_house: its walled
    court, the drying halls, the sealing room), its gate toward the works road; the box its court's ground is painted in */
 const LATEX={u0:-466,u1:-424,v0:621,v1:663,at:[-445,642]};
 const MONASTERY=[330,840];   /* the White Monastery's daughter house, on the rising ground inland (toward the scarp) */
 /* core/city's steps the town leaves out: the alleys (a town of 3,000 keeps yards and gardens behind its houses; its side
    streets have lots since 2026-11-16) */
 const SKIP=['alleys and alley lots'];
 function make(o){
  const L=KCITY.lib,SL=L.SL,OCC=L.OCC,Raster=L.Raster,obb=L.obb,obbCorners=L.obbCorners,seed=o.seed==null?41600:o.seed;
  /* the kit's boxes as core/city's plots: a plot at least 2 m wider and deeper than the building on it (the teahouse's and the
     temple's buildings fill their defs' plots, so a street on the raster could reach them) */
  const dims=(k,v)=>{const D=o.dims(k,v);return D?Object.assign({},D,{w:Math.max(D.w,(D.fw||0)+2),d:Math.max(D.d,(D.fd||0)+2)}):null;};
  const xz=([uu,vv])=>at(uu,vv),notes=[],uvOf=p=>[G.u(p[0],p[1]),G.v(p[0],p[1])];
  const GR=grid();G.setMoat(GR.moat);   /* the moat's trench in the ground before anything reads it */
  const BAZAAR=cellUV('bazaar'),gateUV=sd=>{const g=GR.gates.find(q=>q.side===sd);return uvOf([g.x,g.z]);};
  const HARBOUR_GATE=gateUV('v-'),NORTH_GATE=gateUV('u+'),WORKS_GATE=gateUV('u-'),SCARP_GATE=gateUV('v+');
  const avU=GR.ways.find(w=>w.role==='avenue'&&w.line==='v'),lampUV=uvOf(avU.pts[Math.floor(avU.pts.length/2)]);
  const toward=(p,what)=>{const q=what==='bazaar'?BAZAAR:what==='gate'?NORTH_GATE:what==='lamp'?lampUV:what==='lake'?[p[0],-100]:BAZAAR;
   const a=xz(p),b=xz(q);return face([b[0]-a[0],b[1]-a[1]]);};
  const zone=GR.zone,GARD=[];   /* the garden squares the step lays (their tiles are put with the town's own pieces) */
  const box=(c,ry,w,d,m)=>{const u=[Math.cos(ry),-Math.sin(ry)];return obb(c,u,w/2+(m||0),d/2+(m||0));};
  const steps=[
   {name:'the site and its ground',run(){const R=SL.R=new Raster(L.tune().rasterHalf,L.tune().cell);R.occ.fill(OCC.OUT);
    const P=L.plan();P.site=[{id:0,name:'Build zone',role:'zone',poly:zone}];P.zone=zone;
    const land=KCITY.site.zoneRaster(R,zone,{dry:1.2,maxSlope:L.tune().maxSlope,h:G.h});
    SL.minSpacing=KCITY.site.minSpacing();SL.note(0,'the walled square behind the quay street, '+land+' cells');}},
   {name:'landmarks',run(){const P=L.plan(),CG=L.cg();
    const fixed=(id,key,v,p,ry,role)=>{const D0=dims(key,v);if(!D0)return;const D=Object.assign({},D0,{w:Math.max(D0.w,D0.fw||0),d:Math.max(D0.d,D0.fd||0)}),c=xz(p),o=box(c,ry,D.w,D.d);   /* a piece wider than its plot (the temple) takes its footprint */
     const Lt={id:P.lots.length,cls:'landmark',role,key,v,slot:0,wealth:1,x:c[0],z:c[1],y:CG.pad(o),ry,w:D.w,d:D.d,h:D.h,lot:o,bo:o,way:-1,side:0,s:0,born:1,died:null,civic:true,ksId:id};
     P.lots.push(Lt);SL.hashLot(Lt);SL.register(Lt);P.landmarks.push(Lt);SL.R.stampPoly(obbCorners(box(c,ry,D.w,D.d,3)),OCC.HARD,Lt.id);};
    for(const [id,key,v,uu,vv,tw] of LANDMARKS())if(id!=='bazaar')fixed(id,key,v,[uu,vv],toward([uu,vv],tw),id.split('.')[0]);
    fixed('latex','xa_latex_house',0,LATEX.at,face(NUX),'latex');
    /* the bazaar square: kept open, in its cell at the avenues' crossing */
    SL.R.stampPoly([[BAZAAR[0]-32,BAZAAR[1]-32],[BAZAAR[0]+32,BAZAAR[1]-32],[BAZAAR[0]+32,BAZAAR[1]+32],[BAZAAR[0]-32,BAZAAR[1]+32]].map(xz),OCC.HARD,-1);
    SL.note(1,P.landmarks.length+' landmarks: the seat, the barracks, the generator, the Two Horns, the temple, the serai, the tea factory, the fermentaries, the latex house');}},
   {name:'districts',run(){SL.note(2,'the quarters are wealth, not districts');}},
   {name:'avenues',run(){
    SL.addWay('avenue',[[-610,48],[-300,48],[0,48],[300,48],[710,48]].map(xz),3,{tag:'the quay street'});
    /* the irregular square's streets (KCITY.grid): its two avenues (the Lamp Way from the Lake Gate to the Scarp Gate, the
       Strongbow way from the Works Gate to the Strongbow Gate), its grid of main streets, its inner street round the wall */
    for(const w of GR.ways)SL.addWay(w.kind,w.pts,3,{tag:w.role==='avenue'?(w.line==='v'?'the Lamp Way':'the Strongbow way'):w.role==='ring'?'the inner street':'a grid street'});
    /* outside the wall: the works road from the Works Gate past the tea factory to the latex house; the road on from the
       Scarp Gate to the monastery */
    const wOut=uvOf(GR.ways.find(w=>w.role==='avenue'&&w.line==='u').pts[0]),sOut=uvOf(avU.pts[avU.pts.length-1]);
    SL.addWay('avenue',[wOut,[-420,wOut[1]+20],[-425,480],[-410,600]].map(xz),3,{tag:'the works road'});
    SL.addWay('main',[sOut,[sOut[0]+90,sOut[1]+40],[250,810],[310,830]].map(xz),3,{tag:'the monastery road'});
    SL.note(3,'the quay street, the square\'s avenues and '+GR.ways.filter(w=>w.role==='grid').length+' grid streets, the inner street, the works road, the monastery road');}},
   {name:'highways',run(){SL.note(4,'the Strongbow road leaves the Strongbow Gate along the shore (KS_TOWN roads, not core/city\'s)');}},
   /* THE WALL (core/city's wall records on the square's line): its gates where the avenues cross it, named by their sides;
      a buttress every 90 m along each side, a bastion at each corner (KCITY.grid.wall keeps them: core/city's walk round the
      whole line cut them off); stamped onto the raster so no lot or street takes its line */
   {name:'the wall and its gates',run(){const P=L.plan(),T=WALL_T,ways=P.ways.filter(w=>w.cls==='avenue'&&w.tag!=='the quay street'&&w.tag!=='the works road');
    const named=GR.gates.map(g=>({x:g.x,z:g.z,marker:g.side,name:GATE_NAMES[g.side]}));
    const Wr=P.wallRec=KCITY.grid.wall(GR,ways,{towerGap:T.towerGap,clear:T.clear,gateFind:T.gateFind,named,side:1,health:2});   /* side by side: the corners kept */
    Wr.nodes.forEach(n=>{n.gx=n.x;n.gz=n.z;if(n.kind==='gate'&&n.way)n.towerOff=((L.tune().width[n.way.cls]==null?10:L.tune().width[n.way.cls])+T.gatePass)/2+T.gateTower/2;});
    Wr.corners=GR.corners;Wr.segs=KCITY.site.wallSegs(Wr.nodes.filter(n=>!n.skip));
    KCITY.site.stampWall(Wr,{thick:T.thick,step:5,gateTower:T.gateTower});
    for(const c of GR.corners)SL.R.eachNearSeg([c.x,c.z],[c.x,c.z],12,k=>{if(SL.R.occ[k]===OCC.FREE||SL.R.occ[k]===OCC.LOT)SL.R.occ[k]=OCC.OUT;});
    P.gates=Wr.gates.map(g=>({p:[g.x,g.z],dir:g.name}));
    SL.note(5,Wr.gates.length+' gates ('+Wr.gates.filter(g=>g.named).length+' named), '+Wr.nodes.filter(n=>n.kind==='tower'&&!n.skip).length+' buttresses, 4 corner bastions, '+Wr.segs.length+' runs');}},
   /* THE GARDEN SQUARES (GARDENS): the biggest rectangle of whole tiles, both counts odd, that fits its cell clear of every street,
      the wall and the landmarks by GARDEN_T.margin; a half garden keeps to its side of the cell and takes at most GARDEN_T.half of
      the cell's depth. Each a core/city green (kind 'garden') stamped HARD, so no street or lot is laid on it */
   {name:'the garden squares',run(){const R=SL.R,T=GARDEN_T,S=T.tile;let zoneA=0;
    for(let i=0;i<zone.length;i++){const p=zone[i],q=zone[(i+1)%zone.length];zoneA+=(p[0]*q[1]-q[0]*p[1])/2;}zoneA=Math.abs(zoneA);
    const rect=(c,a,b,m)=>[[c[0]-a-m,c[1]-b-m],[c[0]+a+m,c[1]-b-m],[c[0]+a+m,c[1]+b+m],[c[0]-a-m,c[1]+b+m]].map(xz);
    const clear=(c,a,b)=>{let ok=true;R.eachInPoly(rect(c,a,b,T.margin),k=>{if(ok&&R.occ[k]!==OCC.FREE)ok=false;});return ok;};
    let area=0;
    for(const [id,name,[ci,cj],side] of GARDENS){if(area>=T.share*zoneA)break;
     const C=GR.cells.find(c=>c.i===ci&&c.j===cj);if(!C)continue;const P=C.poly.map(uvOf);
     const u0=Math.min(...P.map(p=>p[0])),u1=Math.max(...P.map(p=>p[0])),v0=Math.min(...P.map(p=>p[1])),v1=Math.max(...P.map(p=>p[1])),cc=uvOf(C.c);
     const ax=side==='full'?null:side[0],sg=side==='full'?0:side[1]==='+'?1:-1;
     const cap=Math.max((T.share*zoneA-area)*1.15,T.min*T.min*S*S);   /* the last garden takes only what is left of the share */
     const maxU=ax==='u'?(u1-u0)*T.half:u1-u0,maxV=ax==='v'?(v1-v0)*T.half:v1-v0,pairs=[];
     for(let nu=T.min;nu*S<=maxU;nu+=2)for(let nv=T.min;nv*S<=maxV;nv+=2)if(Math.max(nu,nv)/Math.min(nu,nv)<=T.aspect&&nu*nv*S*S<=cap)pairs.push([nu,nv]);
     pairs.sort((p,q)=>q[0]*q[1]-p[0]*p[1]||Math.abs(p[0]-p[1])-Math.abs(q[0]-q[1]));
     let got=null;
     for(const [nu,nv] of pairs){const a=nu*S/2,b=nv*S/2,cands=[];
      if(!ax){for(let du=-12;du<=12;du+=2)for(let dv=-12;dv<=12;dv+=2)cands.push([cc[0]+du,cc[1]+dv]);cands.sort((p,q)=>Math.hypot(p[0]-cc[0],p[1]-cc[1])-Math.hypot(q[0]-cc[0],q[1]-cc[1]));}
      else{const lo=ax==='u'?u0:v0,hi=ax==='u'?u1:v1,h=ax==='u'?a:b,mid=ax==='u'?cc[1]:cc[0];   /* from the side inward, then across */
       for(let s=0;s<=(hi-lo)/2;s+=2){const w=sg>0?hi-h-s:lo+h+s;for(let d=0;d<=12;d+=2)for(const e of d?[d,-d]:[0])cands.push(ax==='u'?[w,mid+e]:[mid+e,w]);}}
      for(const c of cands)if(clear(c,a,b)){got={c,nu,nv,a,b};break;}
      if(got)break;}
     if(!got){SL.note(5,name+': no room in cell '+ci+','+cj);continue;}
     const poly=rect(got.c,got.a,got.b,0),Gn=SL.addGreen('garden',poly,5,wealthUV(got.c),'civic',obb(xz(got.c),UX,got.a,got.b));
     R.stampPoly(rect(got.c,got.a,got.b,T.margin),OCC.HARD,-2-Gn.id);Gn.ksId=id;   /* with its margin: a lot's check shaves a little off its plot */
    Gn.name=name;
     area+=got.nu*got.nv*S*S;GARD.push({id,name,cell:[ci,cj],side,c:got.c,nu:got.nu,nv:got.nv,green:Gn.id});}
    SL.note(5,GARD.length+' garden squares, '+Math.round(area)+' m2 ('+(100*area/zoneA).toFixed(1)+' % of the walled zone): '+GARD.map(g=>g.name+' '+g.nu+'x'+g.nv).join(', '));}}
  ].concat(KCITY.defaultSteps().slice(6).filter(st=>(o.skip||SKIP).indexOf(st.name)<0));
  const uv=p=>[G.u(p[0],p[1]),G.v(p[0],p[1])],dd=(p,q)=>Math.hypot(p[0]-q[0],p[1]-q[1]);
  /* the wealth: the lakefront inside the wall either side of the Lake Gate rich, the middle middling, the quarter by the Works
     Gate and the inland edge poor */
  const wealthUV=([uu,vv])=>{let w=.5;if(vv<250&&Math.abs(uu-HARBOUR_GATE[0])>60)w=.86-(vv-100)/700;
   if(vv>600||uu<-200)w=Math.min(w,.22);if(dd([uu,vv],WORKS_GATE)<130)w=.12;return Math.max(0,Math.min(1,w));};
  const rules={
   wealth:p=>wealthUV(uv(p)),
   vacant:(p,rs)=>{const q=uv(p);return rs.chance(q[1]>580?.1:q[1]<240?.03:.06);},   /* a little frontage left open: the yards and gardens are behind the houses */
   near:{harbour:c=>dd(uv(c.p),[HARBOUR_GATE[0],140])+(uv(c.p)[1]>260?400:0),bazaar:c=>dd(uv(c.p),BAZAAR),works:c=>dd(uv(c.p),[WORKS_GATE[0]+60,WORKS_GATE[1]]),
    gate:c=>dd(uv(c.p),[NORTH_GATE[0]-60,NORTH_GATE[1]]),rich:c=>{const q=uv(c.p);return Math.abs(q[1]-160)+Math.abs(Math.abs(q[0]-HARBOUR_GATE[0])-180)*.5;}}};
  /* the finish: a civic piece is stamped HARD, but a main street routed on the 2.5 m raster can still graze or cross one
     (the exact-streets rule knocks out houses, not civic pieces); any civic piece a street reaches is dropped, and noted */
  const finish=[function(Ci){const P=Ci.plan;let n=0;
   for(const Lt of P.lots){if(Lt.died!=null||!Lt.civic||Lt.cls==='landmark'||!Lt.bo)continue;const D=dims(Lt.key,Lt.v)||{},hw=(D.fw||Lt.w)/2,hd=(D.fd||Lt.d)/2,B=Lt.bo;
    if(P.ways.some(w=>w.died==null&&w.pts.some(p=>{const dx=p[0]-B.c[0],dz=p[1]-B.c[1],m=w.w/2-.6;return Math.abs(dx*B.u[0]+dz*B.u[1])<hw+m&&Math.abs(dx*B.v[0]+dz*B.v[1])<hd+m;}))){Lt.died='finish';n++;}}
   notes.push(n+' civic pieces a street reached, dropped');}];
  const C=KCITY.create({name:'kirstabal',tune:tune(),seed,rand:'krand',index:{order:'insertion'},ground:{h:G.h},kit:{dims},rules,steps,finish});
  C.run();
  const PL=C.plan;
  const fp=(k,v)=>{const D=dims(k,v)||{};return {fw:D.fw||D.w||0,fd:D.fd||D.d||0};};   /* the building's own footprint (the plot less its yard) */
  const lots=PL.lots.filter(Lt=>Lt.died==null&&Lt.bo&&Lt.key).map((Lt,n)=>({id:Lt.ksId?'ks.'+Lt.ksId:'ks.town.'+n,key:Lt.key,v:Lt.v|0,cls:Lt.cls,civic:!!Lt.civic,
   x:Lt.x,z:Lt.z,y:Lt.y==null?G.h(Lt.x,Lt.z):Lt.y,ry:Lt.ry,w:Lt.w,d:Lt.d,h:Lt.h,fw:fp(Lt.key,Lt.v).fw,fd:fp(Lt.key,Lt.v).fd,people:PEOPLE[Lt.key]||0,wealth:Lt.wealth}));
  const ways=PL.ways.filter(w=>w.died==null).map(w=>({id:'ks.way.'+w.id,cls:w.cls,w:w.w,tag:w.tag||null,pts:w.pts.map(p=>[p[0],p[1]])}));
  /* ---- the town's own pieces (records, the page draws them as the lots) */
  const extra=[],put=(id,key,v,p,ry,o2)=>{const D=dims(key,v);if(!D)return null;const c=xz(p);
   const r=Object.assign({id:'ks.extra.'+id,key,v,x:c[0],z:c[1],y:G.h(c[0],c[1]),ry,w:D.w,d:D.d,h:D.h,fw:D.fw||D.w,fd:D.fd||D.d,people:PEOPLE[key]||0,kind:'extra'},o2||{});extra.push(r);return r;};
  const H=G.HARBOUR,QY=1.7;   /* the quays' top, above the lake */
  /* the quays along the harbour's shore (their fronts to the water), the mole out into the lake and along the basin's mouth */
  const Q=dims('xa_quay',0),qs=Q?Q.w:34;
  for(let uu=H.u0+qs/2,i=0;uu<=H.u1-qs/2+1;uu+=qs,i++)put('quay.'+i,'xa_quay',0,[uu,-4],face(NVX),{y:QY,kind:'quay'});
  const MOLE={a:[H.u0-14,8],b:[H.u0-14,H.v0-14],c:[H.u1-70,H.v0-14],w:16};   /* in the shore frame; the basin's mouth between c and the shore's end */
  const moles=[[MOLE.a,MOLE.b],[MOLE.b,MOLE.c]],moleRecs=[];
  for(const [a,b] of moles){const L2=dd(a,b),n=Math.max(1,Math.round(L2/qs)),A=xz(a),B=xz(b),ry=face([B[1]-A[1],-(B[0]-A[0])]);   /* front across the run */
   moleRecs.push({id:'ks.extra.mole.'+moleRecs.length,a:A,b:B,w:MOLE.w,top:QY-.2,kind:'mole'});
   for(let i=0;i<n;i++){const t=(i+.5)/n;put('mole.'+moleRecs.length+'.'+i,'xa_quay',1,[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t],ry,{y:QY,kind:'mole'});}}
  put('lighthouse','xa_lighthouse',0,[MOLE.c[0],MOLE.c[1]],face(NVX),{y:QY,kind:'lighthouse'});
  for(let i=0;i<3;i++)put('boatshed.'+i,'xa_boatshed',0,[H.u0-46-i*20,-6],face(NVX),{y:Math.max(QY-.4,G.h(...xz([H.u0-46-i*20,4]))),kind:'boatshed'});
  put('barge','xa_barge',0,[H.u0+120,-70],face(UX),{y:0,kind:'boat'});   /* the Sultan's barge at its mooring (the kit's pleasure barge) */
  put('monastery','xa_monastery',0,MONASTERY,toward(MONASTERY,'bazaar'),{kind:'monastery'});
  /* the moat's bridges, one at each gate: the kit's street bridge, its deck level with the higher bank, across the moat and its
     slopes along the avenue */
  const MB=[];if(GR.moat){const bd2=dims('xa_bridge',0),sp=bd2?bd2.d:20,run=GR.moat.width+10,nm=Math.max(1,Math.ceil(run/sp));
   for(const b of GR.moat.bridges){const e0=[b.x-b.dir[0]*run/2,b.z-b.dir[1]*run/2],e1=[b.x+b.dir[0]*run/2,b.z+b.dir[1]*run/2],dk=Math.max(G.base(...e0),G.base(...e1))+.15;
    for(let i=0;i<nm;i++){const t=-run/2+(i+.5)*run/nm,c=[b.x+b.dir[0]*t,b.z+b.dir[1]*t],r={id:'ks.extra.moatbridge.'+b.side+'.'+i,key:'xa_bridge',v:0,x:c[0],z:c[1],y:dk,
     ry:face(b.dir),w:bd2?bd2.w:10,d:bd2?bd2.d:20,h:bd2?bd2.h:4,fw:bd2?bd2.fw||bd2.w:10,fd:bd2?bd2.fd||bd2.d:20,people:0,kind:'bridge'};extra.push(r);}
    MB.push({side:b.side,x:b.x,z:b.z,deck:dk});}}
  /* ---- the garden squares' tiles: each garden one level (its highest corner), every tile's footing down to its own lowest
     corner, so the garden reads as one terrace; the courts by garden (the two grand ones the kiosk, star court, lily pond and
     pavilion; the rest four of the others drawn from core/rand by the garden's id) */
  const DIR={'u+':UX,'u-':NUX,'v+':VX,'v-':NVX},S=GARDEN_T.tile;
  const gardens=GARD.map((g,gi)=>{const grand=g.nu>=11&&g.nv>=11,pool=GARDEN_COURTS.other.slice(),courts=grand?GARDEN_COURTS.grand.slice():[];
   while(courts.length<4){const k=Math.floor(KRAND.unit(KRAND.hash(SQ.seed,7101,gi,courts.length))*pool.length);courts.push(pool.splice(k,1)[0]);}
   const a=g.nu*S/2,b=g.nv*S/2,u0=g.c[0]-a,v0=g.c[1]-b,hs=[];
   for(let i=0;i<=g.nu;i++)for(let j=0;j<=g.nv;j++)hs.push(G.h(...xz([u0+i*S,v0+j*S])));
   const y=Math.max(...hs),hAt=(i,j)=>hs[i*(g.nv+1)+j],tiles=gardenTiles(g.nu,g.nv,courts);
   for(const [i,j,key,dir] of tiles){const lo=Math.min(hAt(i,j),hAt(i+1,j),hAt(i,j+1),hAt(i+1,j+1));
    put('garden.'+g.id+'.'+i+'.'+j,key,gi%3,[u0+(i+.5)*S,v0+(j+.5)*S],face(DIR[dir]),{y,drop:y-lo+.3,kind:'garden',garden:g.id});}
   return Object.assign({},g,{y,tiles:tiles.length,courts,area:g.nu*g.nv*S*S,poly:[[u0,v0],[u0+2*a,v0],[u0+2*a,v0+2*b],[u0,v0+2*b]].map(xz)});});
  /* ---- the Strongbow road along the shore and the bridge over Keb Riwa's mouth (the owner, 2026-11-16: "bridge crosses it") */
  const sbOut=uvOf(GR.ways.find(w=>w.role==='avenue'&&w.line==='u').pts.slice(-1)[0]);   /* the Strongbow way's end past the Strongbow Gate */
  const roadUV=[sbOut,[sbOut[0]+120,sbOut[1]-30],[1400,232],[2600,230],[3800,228],[4905,230]],farUV=[[5165,230],[5600,330],[6400,560],[7600,800]];
  const BR={u0:4905,u1:5165,v:230},bd=dims('xa_bridge',0),span=bd?bd.d:20,nb=Math.ceil((BR.u1-BR.u0)/span);
  const deck=Math.max(G.h(...xz([BR.u0,BR.v])),G.h(...xz([BR.u1,BR.v])),G.riverAt(...xz([(BR.u0+BR.u1)/2,BR.v]))[1]+5);
  for(let i=0;i<nb;i++)put('bridge.'+i,'xa_bridge',0,[BR.u0+(i+.5)*(BR.u1-BR.u0)/nb,BR.v],face(UX),{y:deck,kind:'bridge'});
  const roads=[{id:'ks.road.strongbow',cls:'road',w:7,tag:'the Strongbow road',pts:roadUV.map(xz)},{id:'ks.road.strongbow.far',cls:'road',w:7,tag:'the Strongbow road (on to the foot)',pts:farUV.map(xz)}];
  const census={buildings:lots.length+extra.length,people:0,byKey:{},byCls:{}};
  for(const r of lots.concat(extra)){census.people+=r.people;census.byKey[r.key]=(census.byKey[r.key]||0)+1;}
  for(const r of lots)census.byCls[r.cls]=(census.byCls[r.cls]||0)+1;
  return {lots,ways,extra,moles:moleRecs,roads,bridge:Object.assign({deck,ry:face(UX)},BR,{a:xz([BR.u0,BR.v]),b:xz([BR.u1,BR.v])}),latex:LATEX,census,
   notes:PL.notes||notes,zone,instance:C,
   /* the wall: its standing runs, its nodes (the gates named by their sides, the buttresses), the corner bastions */
   wall:PL.wallRec?{segs:PL.wallRec.segs.map(g=>({ax:g.ax,az:g.az,bx:g.bx,bz:g.bz,health:g.health})),
    nodes:PL.wallRec.nodes.filter(n=>!n.skip&&n.health>0&&n.kind!=='corner').map(n=>({kind:n.kind,x:n.gx,z:n.gz,ry:n.ry,name:n.name||null,named:!!n.named,way:n.way?n.way.cls:null})),
    corners:GR.corners.map(c=>({id:c.id,x:c.x,z:c.z})),line:GR.wall}:null,
   moat:GR.moat?{line:GR.moat.line,width:GR.moat.width,bridges:MB}:null,gardens,
   places:{bazaar:BAZAAR,lakeGate:HARBOUR_GATE,strongbowGate:NORTH_GATE,worksGate:WORKS_GATE,scarpGate:SCARP_GATE,centre:SQ.c,half:SQ.half+SQ.wallGap}};}
 return {make,PEOPLE,ZONE,LANDMARKS,LATEX,MONASTERY,SQ,grid,GARDENS,GARDEN_T,gardenTiles};
})();
