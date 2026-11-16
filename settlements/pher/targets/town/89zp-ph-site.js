// ================================================================= PHĒR — the site, the ground and the plan (settlements/pher/PLAN.md, step P3)
// [G data] records, no drawing. Runs after every kit def is registered and before the scene (90-scene); 90q draws the
// ground and the water, 90r the plan's buildings. The owner's answers (2026-11-16): two levels, a headland and a cove, a
// small stream, the seat held by the Sultan's heir.
//
// THE FRAME. Metres, x along the shore (east-south-east on the map), z toward the lake (south-south-west), y over the
// lake's level (the lake is at y 0; the world's height is y - 520). The page's frame is the world's turned by the shore's
// bearing (PH.TURN: the coast at Phēr runs about 17 degrees south of east, edit 7 re-run): page x = east cos t + south
// sin t... see phToWorld. The origin is on the line the open shore would follow, at the cove's middle; the world's pin
// (843,1491) is about 600 m inland of it, on the wall's foot behind the cove (openworld/xanadu-north-shore).
//
// THE GROUND (phH). The survey's profile at the pin (PLAN.md section 1.1), in a closed form: the lake's bed falling fast
// off the shore; a strand of 300 m rising to ~20 m; the caldera wall rising 125 m a km (7 degrees) to the rim about 4 km
// back (~500 m); the rim plain rising 7 m a km beyond. Cut into it: the cove (about 1 km across, its head ~450 m in). On it:
// the headland west of the cove (a ridge 60 m high running 1.5 km into the lake) and the low point east of it. The Swīṭ
// Siṭrīm comes down to the cove's head: a channel on the plain and the strand, a wooded ravine ~30 m deep down the wall.
//
// THE PLAN: two levels (the owner), each a core/city instance in its own frame, and the wall between:
//   Lower Phēr (PH_LOW)  the strand round the cove and the wall's foot: the quays, the strand street, terrace streets along
//                        the wall's contours, cross lanes up it, the stair avenue (the lit avenue's foot); the heir's
//                        palace above the top terrace with its garden court, gate and guard (the owner: grander, the
//                        Sultan's own guard); the water-stair and the heir's barge; the warehouses, boat sheds, the
//                        generator, the pilgrims' house, the bath, the factor house; the watch and light on the headland
//   Upper Phēr (PH_UP)   on the rim: the fair ground, the temple of the Decree, the caravanserai (the kit's new piece, opt-in:
//                        kits/xanadu/extra), the mule yard, the province's granaries, the barracks, the houses round them
//   the wall (PH_WALL)   the lit avenue's switchbacks up the wall (PH_ROAD), its lower legs lined with houses on their
//                        lakeward side (the owner: "houses line lower switchbacks"); a teahouse or a stall row on each turn
// Blocks are filled by core/city's frontage-courts (KCITY.strategies) with the Xanadu kit's houses; the civic pieces are
// placed first as hosts (stamped HARD), the streets laid as ways. Every lot is a core/city record; 90r draws the records.
var PH={SEED:84391,TURN:17*Math.PI/180,UP:[220,-4920],LAKE:0,
 COVE:{x:40,depth:450,half:380},HEAD:{a:[-640,-120],b:[-330,1260],w:170,crest:[62,26]},POINT:{a:[620,-80],b:[760,330],w:110,crest:18},
 WALL:{strand:300,top:4300,rise:.125,plain:.007}};
const phSm=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);};
const phSeg=(x,z,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],L2=dx*dx+dz*dz;let t=((x-a[0])*dx+(z-a[1])*dz)/L2;t=t<0?0:t>1?1:t;return[Math.hypot(a[0]+dx*t-x,a[1]+dz*t-z),t];};
// the shore's line: z of the waterline at x (the open shore at 0, the cove cut in)
const phShoreZ=x=>-PH.COVE.depth*Math.exp(-Math.pow((x-PH.COVE.x)/PH.COVE.half,2));
// the stream's line: its x at z (from the cove's head inland, drifting a little east up the wall)
const phStreamX=z=>PH.COVE.x+Math.max(0,-z-PH.COVE.depth)*.03;
// the land's height at inland distance d (from the waterline)
function phProfile(d){const W=PH.WALL;if(d<0)return 1.2-2.7*phSm(0,6,-d)-.18*(-d)-.0006*d*d;   /* the beach shelving into the water: the waterline about 2.5 m out of the shore line */
 return 1.2+19*phSm(0,W.strand,d)+W.rise*Math.max(0,Math.min(d,W.top)-W.strand)+W.plain*Math.max(0,d-W.top);}
function phH(x,z){const d=phShoreZ(x)-z;let y=phProfile(d);
 // the stream: a channel on the strand and the plain, a ravine down the wall
 if(d>-30){const W=PH.WALL,dx=x-phStreamX(z),wall=phSm(W.strand,W.strand+500,d)*phSm(W.top+400,W.top-200,d);
  const deep=2.4+30*wall,wd=6+50*wall;y-=deep*Math.exp(-(dx*dx)/(wd*wd))*phSm(-30,40,d);}
 // the headland and the east point: ridges joined to the shore, rising out of the lake
 for(const R of[PH.HEAD,PH.POINT]){const q=phSeg(x,z,R.a,R.b),c=Array.isArray(R.crest)?R.crest[0]+(R.crest[1]-R.crest[0])*q[1]:R.crest;
  if(q[0]<R.w*1.8){const u=q[0]/R.w,t=u<1?c*(1-u*u*.6):c*.4-(u-1)/.8*(c*.4+Math.max(3,-y+2));y=Math.max(y,t);}}
 return y;}
// on the page: the ground every builder and the camera read, and the core/tags registry under the town's name (91t takes it up)
if(typeof VERN!=='undefined'){terrainH=phH;if(typeof KTAGS!=='undefined')KTAGS.page=KTAGS.page||KTAGS.create({build:'pher'});}
// page metres to the world's (x east, z south, metres from the pin's 5.1 frame) and back: the page turned by PH.TURN, its
// origin PH_ORIGIN_WORLD (the cove's middle on the open shore: the pin's spot 600 m out, in the world's frame)
const PH_ORIGIN_WORLD=[0,0];
function phToWorld(x,z){const c=Math.cos(PH.TURN),s=Math.sin(PH.TURN);return[PH_ORIGIN_WORLD[0]+x*c-z*s,PH_ORIGIN_WORLD[1]+x*s+z*c];}

// ---------------------------------------------------------------- the kit: the Xanadu kit's defs (VERN.defs on the page)
const phDims=(key,v)=>{const D=(typeof VERN!=='undefined'&&VERN.defs&&VERN.defs[key])||(typeof PH_KIT_DIMS!=='undefined'&&PH_KIT_DIMS[key]);
 return D?{key,v:v==null?0:v,w:D.w,d:D.d,h:D.h==null?8:D.h}:null;};
// the pools: a quarter of the poor and middling houses are the Palopó shop-houses and cholets (the Andean set: the lake
// towns of Atitlán); the strand's middling are shops and workshops as often as houses
const PH_POOLS={
 strand:[['xa_andean_poor',3],['xa_andean_mid',2],['xa_shops',2],['xa_workshop',2],['xa_poor_c',2],['xa_shop_turk_a',1],['xa_mid_a',1]],
 poor:[['xa_poor_a',2],['xa_poor_b',2],['xa_poor_c',3],['xa_andean_poor',3]],
 middle:[['xa_mid_a',3],['xa_mid_b',2],['xa_mid_c',2],['xa_andean_mid',2],['xa_house_turk_a',2],['xa_shop_turk_b',1]],
 rich:[['xa_rich_a',2],['xa_rich_b',1],['xa_rich_c',2],['xa_andean_rich',2],['xa_house_turk_b',2]],
 fair:[['xa_shops',3],['xa_shop_turk_a',2],['xa_shop_turk_b',2],['xa_teahouse',1],['xa_workshop',1],['xa_mid_a',1]]};
const PH_SMALL={strand:[['xa_poor_c',1]],poor:[['xa_poor_c',1]],middle:[['xa_poor_c',1],['xa_mid_a',1]],rich:[['xa_mid_a',1]],fair:[['xa_poor_c',1]]};
const PH_GAPS={strand:[2,6],poor:[3,7],middle:[4,9],rich:[7,14],fair:[2,5]};
const PH_PEOPLE={xa_poor_a:7,xa_poor_b:7,xa_poor_c:5,xa_andean_poor:6,xa_mid_a:7,xa_mid_b:8,xa_mid_c:9,xa_andean_mid:8,xa_house_turk_a:8,
 xa_rich_a:14,xa_rich_b:16,xa_rich_c:12,xa_andean_rich:12,xa_house_turk_b:10,xa_shops:4,xa_shop_turk_a:4,xa_shop_turk_b:4,xa_workshop:4,xa_teahouse:3};
const phTune=half=>({cell:2.5,rasterHalf:half,maxSlope:.3,exact:true,
 width:{avenue:12,main:8,side:5.5,alley:3,highway:10,lane:4.5},lot:{side:1.6,setback:1.4,rear:3,inset:1,step:3},
 classes:{rich:[['xa_rich_a',0]],middle:[['xa_mid_a',0],['xa_mid_c',0]],poor:[['xa_poor_c',0]]},fallback:{rich:'middle',middle:'poor',poor:null},
 civic:[],civicSpacing:120,voidMax:40,voidIters:0,voidBatch:0,sideSpacing:48,sideMax:200,alleyFrac:.25,blindMax:90,interiorDepth:9,interiorRounds:0,
 avenueSnap:60,ringGap:8,verge:7,wall:{},plazaArt:{},mapHalf:half,stance:'high',stanceOpt:{maxDrop:9}});

// ---------------------------------------------------------------- the level's frame: its origin in the page
const phLevel=(o)=>({o,h:(x,z)=>phH(x+o[0],z+o[1]),P:(x,z)=>[x-o[0],z-o[1]]});
// a contour of the wall: the line d metres inland of the waterline, x from x0 to x1 (every step m), in the level's frame
const phContour=(L,d,x0,x1,step)=>{const P=[];for(let x=x0;x<=x1+.1;x+=step)P.push(L.P(x,phShoreZ(x)-d));return P;};

// ---------------------------------------------------------------- the civic pieces: placed first, each a host (stamped HARD)
// [key, x, z (page), facing: the angle of its front (0: toward +z, the lake), why]
const PH_CIVIC_LOW=[
 ['xa_quay',-150,null,0,'the quay (the cargo boats)'],['xa_quay',-110+120,null,0,'the quay (the launches\' landing)'],['xa_quay',190,null,0,'the quay (the cross-lake run)'],
 ['xa_boatshed',-330,null,0,'the boat slip\'s shed (ph.slip)'],['xa_boatshed',-420,null,0,'the boat slip\'s second shed'],
 ['xa_warehouse',-230,'strand2',0,'a warehouse (the fair\'s goods)'],['xa_warehouse',330,'strand2',0,'a warehouse (the Two Horns\' store)'],
 ['xa_generator',-90,'strand2',0,'the generator (the Sultan\'s oil licence: the lit avenue)'],
 ['xa_temple_ortakoy',470,'strand1',0,'the pilgrims\' house of the Azure Dream, facing Grēṭ-Āil'],
 ['xa_teahouse',260,'strand1',0,'the strand\'s teahouse'],['xa_bath',560,'band2',0,'the bath'],
 ['xa_rich_b',-230,'band3',0,'the Two Horns\' factor house'],
 /* the heir's seat (the owner, 2026-11-16: the seat held by the Sultan's heir; "yes and yes": grander, with a guard of the
    Sultan's own): the palace on the wall above the top terrace, its garden court, its gate, the guard's barracks and watch
    beside it; the water-stair on the cove's east side, the heir's barge moored at it */
 ['xa_cit_vizier',380,'d940',0,'the heir\'s palace: the seat of Nōrth-Shor, held by the Sultan\'s heir (the kit\'s hollow citadel palace, the Grand Vizier\'s design: walk-in with ?interiors=1)'],
 ['xa_rill_garden',318,'d925',0,'the heir\'s garden court'],['xa_palace_gate',380,'d860',0,'the heir\'s gate'],
 ['xa_barracks',560,'d905',0,'the barracks of the Sultan\'s own guard'],['xa_watch',455,'d860',0,'the guard\'s watch at the heir\'s gate'],
 ['xa_quay',320,null,0,'the heir\'s water-stair: the court\'s landing',2],['xa_barge',320,'w22',0,'the heir\'s barge, moored at the water-stair'],
 ['xa_watch',-520,'head',.6,'the watch on the headland'],['xa_lighthouse',-370,'tip',.6,'the harbour light at the headland\'s tip']];
const PH_CIVIC_UP=[
 ['xa_temple',0,-120,0,'the temple of the Decree on the fair ground'],['xa_guild_farm',150,-125,0,'the grain office (Nōrth-Shor\'s tithe)'],
 ['xa_granary',290,-230,0,'a granary'],['xa_granary',315,-230,0,'a granary'],['xa_granary',340,-230,0,'a granary'],['xa_granary',290,-255,0,'a granary'],['xa_granary',315,-255,0,'a granary'],['xa_granary',340,-255,0,'a granary'],
 /* the caravanserai (the owner, 2026-11-16: "build xanadu one": kits/xanadu/extra/88c-xa-caravanserai.js), its gate east
    toward the Thalaba road, the mule yard and pens beside it */
 ['xa_caravanserai',-250,-240,Math.PI/2,'the caravanserai: the Thalaba road\'s and the fair\'s inn'],
 ['xa_corral',-335,-245,0,'the mule yard'],['xa_pens',-335,-205,0,'the mule pens'],['xa_barracks',330,40,Math.PI/2,'the watch\'s barracks'],
 ['xa_bath',-300,60,0,'the rim\'s bath']];

function phPlaceCivic(C,L,spec,where){const K=KCITY.lib,SLx=K.SL,PLAN_=K.plan(),out=[];
 for(const [key,px,pz,ry,why,v0] of spec){const v=v0|0,D=phDims(key,v);if(!D){out.push({key,err:'no def'});continue;}
  let x=px,z=pz;
  if(typeof pz!=='number'){const zs=phShoreZ(px);
   z=pz===null?zs-D.d/2+5:pz==='strand1'?zs-60:pz==='strand2'?zs-108:pz==='band2'?zs-400:pz==='band3'?zs-640:pz==='gov'?zs-900:
    pz==='head'?-40:pz==='tip'?1050:pz[0]==='d'?zs-Number(pz.slice(1)):pz[0]==='w'?zs+Number(pz.slice(1)):zs-60;
   if(pz==='head'||pz==='tip'){const R=PH.HEAD,t=pz==='head'?.15:.82;x=R.a[0]+(R.b[0]-R.a[0])*t;z=R.a[1]+(R.b[1]-R.a[1])*t;}}
  const q=L.P(x,z),u=[Math.cos(ry),-Math.sin(ry)],o=K.obb(q,u,D.w/2,D.d/2);
  const lot={id:PLAN_.lots.length,cls:'landmark',role:why,key,v,slot:0,wealth:1,x:q[0],z:q[1],y:0,ry,w:D.w,d:D.d,h:D.h,lot:o,bo:o,way:-1,side:0,s:0,born:1,died:null,civic:true,why};
  const st=KCITY.stance(o,(a,b)=>L.h(a,b),{maxDrop:24});lot.y=st?st.y:L.h(q[0],q[1]);if(st)lot.drop=st.drop;
  if(key==='xa_quay'||key==='xa_boatshed')lot.y=1.2;   /* on the waterline: the quay's deck at the strand's foot */
  if(key==='xa_barge'){lot.y=PH.LAKE;delete lot.drop;}   /* afloat */
  PLAN_.lots.push(lot);SLx.hashLot(lot);SLx.register(lot);SLx.R.stampPoly(K.obbCorners(K.obb(q,u,D.w/2+3,D.d/2+3)),K.OCC.HARD,lot.id);out.push(lot);}
 return out;}

// ---------------------------------------------------------------- blocks: polygons between two lines, inset from their streets
function phBand(L,dA,dB,x0,x1,inset){const P=[],n=Math.max(2,Math.ceil((x1-x0)/40));
 for(let i=0;i<=n;i++){const x=x0+inset+(x1-x0-2*inset)*i/n;P.push(L.P(x,phShoreZ(x)-dA-inset));}
 for(let i=n;i>=0;i--){const x=x0+inset+(x1-x0-2*inset)*i/n;P.push(L.P(x,phShoreZ(x)-dB+inset));}
 return P;}

// the stream's corridor kept open (a green strip: no lot stands on it): 14 m either side on the strand and the plain, 45 m down the wall
function phStreamClear(R,L,OCC){let a=null;for(let z=phShoreZ(PH.COVE.x)+5;z>=PH.UP[1]-700;z-=10){const p=L.P(phStreamX(z),z);
 if(a){const d=phShoreZ(phStreamX(z))-z,band=d<PH.WALL.strand||d>PH.WALL.top?14:45;R.eachNearSeg(a,p,band,k=>{R.occ[k]=OCC.GREEN;});}a=p;}}

// ---------------------------------------------------------------- Lower Phēr
const PH_LOW_L=phLevel([0,-500]);
const PH_X=[-420,-140,140,470,820];               /* the cross lanes (140: the stair avenue) */
const PH_D=[48,280,520,760];                       /* the strand street and the terrace streets, metres inland of the waterline */
function phLowSteps(){const L=PH_LOW_L,K=()=>KCITY.lib;return[
 {name:'the ground',run(C){const k=K(),R=k.SL.R=new k.Raster(C.tune.rasterHalf,C.tune.cell);R.occ.fill(k.OCC.OUT);
   const Z=[];for(let x=-760;x<=1300;x+=40)Z.push(L.P(x,phShoreZ(x)-6));for(let x=1300;x>=-760;x-=40)Z.push(L.P(x,phShoreZ(x)-860));
   k.SL.R.land=KCITY.site.zoneRaster(R,Z,{dry:1,h:L.h});k.SL.minSpacing=KCITY.site.minSpacing();k.plan().zone=Z;
   phStreamClear(R,L,k.OCC);}},
 {name:'the civic pieces',run(C){PH_LOW.civic=phPlaceCivic(C,L,PH_CIVIC_LOW);}},
 {name:'the streets',run(C){const S=K().SL;
   S.addWay('main',phContour(L,PH_D[0],-560,1000,20),3,{tag:'the strand street'});
   for(let i=1;i<PH_D.length;i++)S.addWay('side',phContour(L,PH_D[i],-480,900,20),3,{tag:'terrace '+i});
   for(const x of PH_X){const top=x===140?860:PH_D[PH_D.length-1];const P=[];for(let d=PH_D[0];d<=top+.1;d+=20)P.push(L.P(x+(x===140?0:0),phShoreZ(x)-d));
    S.addWay(x===140?'avenue':'lane',P,3,{tag:x===140?'the stair avenue (the lit avenue\'s foot)':'cross lane '+x});}}},
 {name:'frontage and courts',run(C){const blocks=[];
   for(let j=0;j<PH_D.length-1;j++)for(let i=0;i<PH_X.length-1;i++){const x0=PH_X[i],x1=PH_X[i+1],mid=(x0+x1)/2,near=Math.abs(mid-140)<450;
    const kind=j===0?'strand':j===2?(near?'rich':'middle'):near?'middle':'poor';
    blocks.push({id:'low-'+i+'-'+j,i,j,poly:phBand(L,PH_D[j],PH_D[j+1],x0,x1,j===0?5:4.5),kind,lanes:x1-x0>400});}
   PH_LOW.blocks=blocks;
   PH_LOW.courts=KCITY.strategies['frontage-courts'].run(blocks,{step:6,seed:PH.SEED,focus:L.P(140,-600),pools:PH_POOLS,small:PH_SMALL,gaps:PH_GAPS,garden:{rich:.3,middle:.18,poor:.1},infill:{step:10,yard:.42}});}}];}

// ---------------------------------------------------------------- Upper Phēr: on the rim, round the fair ground
const PH_UP_L=phLevel(PH.UP);
const PH_FAIR={hw:120,hd:80};                           /* the fair ground's half-size: about 240 x 160 m */
function phUpSteps(){const L=PH_UP_L,K=()=>KCITY.lib,FX=[-420,-140,140,420],FZ=[-340,-110,110,340];return[
 {name:'the ground',run(C){const k=K(),R=k.SL.R=new k.Raster(C.tune.rasterHalf,C.tune.cell);R.occ.fill(k.OCC.OUT);
   const Z=[[-540,-460],[540,-460],[540,460],[-540,460]];k.SL.R.land=KCITY.site.zoneRaster(R,Z,{dry:1,h:L.h});k.SL.minSpacing=KCITY.site.minSpacing();k.plan().zone=Z;
   R.stampPoly([[-PH_FAIR.hw,-PH_FAIR.hd],[PH_FAIR.hw,-PH_FAIR.hd],[PH_FAIR.hw,PH_FAIR.hd],[-PH_FAIR.hw,PH_FAIR.hd]],k.OCC.GREEN,-1);
   phStreamClear(R,L,k.OCC);
   k.plan().greens.push({id:0,kind:'plaza',poly:[[-PH_FAIR.hw,-PH_FAIR.hd],[PH_FAIR.hw,-PH_FAIR.hd],[PH_FAIR.hw,PH_FAIR.hd],[-PH_FAIR.hw,PH_FAIR.hd]],district:'the fair ground',born:2});}},
 {name:'the civic pieces',run(C){PH_UP.civic=phPlaceCivic(C,{P:(x,z)=>[x,z],h:L.h},PH_CIVIC_UP);}},
 {name:'the streets',run(C){const S=K().SL,ring=[[-PH_FAIR.hw-8,-PH_FAIR.hd-8],[PH_FAIR.hw+8,-PH_FAIR.hd-8],[PH_FAIR.hw+8,PH_FAIR.hd+8],[-PH_FAIR.hw-8,PH_FAIR.hd+8]];
   S.addWay('main',ring,3,{closed:true,tag:'round the fair ground'});
   for(const z of FZ)S.addWay(Math.abs(z)<200?'main':'side',[[-520,z],[520,z]],3,{tag:'street z'+z});
   for(const x of FX)S.addWay('side',[[x,-440],[x,440]],3,{tag:'street x'+x});
   /* the lit avenue arrives from the wall at the south edge, on the fair ground's axis */
   S.addWay('avenue',[[0,PH_FAIR.hd+8],[0,450]],3,{tag:'the lit avenue (from the wall)'});
   /* north from the fair ground: the mule path straight up the scarp to Thalaba (the owner, 2026-11-16, in the Thalaba
      session: "Yes, a mule path"; settlements/thalaba). The carts go west along the plain to the Qol valley (105 km) */
   S.addWay('avenue',[[0,-PH_FAIR.hd-8],[0,-450]],3,{tag:'the mule path to Thalaba'});}},
 {name:'frontage and courts',run(C){const blocks=[],X=FX,Z=FZ;
   for(let j=0;j<Z.length-1;j++)for(let i=0;i<X.length-1;i++){const x0=X[i],x1=X[i+1],z0=Z[j],z1=Z[j+1],cx=(x0+x1)/2,cz=(z0+z1)/2;
    if(Math.abs(cx)<PH_FAIR.hw&&Math.abs(cz)<PH_FAIR.hd)continue;   /* the fair ground */
    const inner=Math.abs(cx)<300&&Math.abs(cz)<250,kind=inner?'fair':Math.hypot(cx,cz)<450?'middle':'poor';
    const e=5,poly=[[x0+e,z0+e],[x1-e,z0+e],[x1-e,z1-e],[x0+e,z1-e]];
    /* the avenue's two halves cut the middle column: split it */
    if(x0<0&&x1>0){blocks.push({id:'up-'+i+'-'+j+'w',i:i*2,j,poly:[[x0+e,z0+e],[-6-e,z0+e],[-6-e,z1-e],[x0+e,z1-e]],kind,lanes:false});
     blocks.push({id:'up-'+i+'-'+j+'e',i:i*2+1,j,poly:[[6+e,z0+e],[x1-e,z0+e],[x1-e,z1-e],[6+e,z1-e]],kind,lanes:false});continue;}
    blocks.push({id:'up-'+i+'-'+j,i:i*2,j,poly,kind,lanes:(x1-x0)>250&&(z1-z0)>200});}
   PH_UP.blocks=blocks;
   PH_UP.courts=KCITY.strategies['frontage-courts'].run(blocks,{step:6,seed:PH.SEED+1,focus:[0,0],pools:PH_POOLS,small:PH_SMALL,gaps:{fair:[2,5],middle:[8,15],poor:[9,18]},garden:{middle:.3,poor:.35},infill:{step:13,yard:.5}});}}];}

// ---------------------------------------------------------------- the lit avenue up the wall: switchbacks from the stair avenue's top to the rim
// legs across the wall at about 6 % (each 900 m along x for ~55 m of rise), from Lower's top (page 140, shore-1180) to
// Upper's south edge (PH.UP + [0, 450]); a teahouse and a shrine on alternate turns
function phRoad(){const P=[],x0=140,xa=-260,xb=560,top=PH.UP[1]+450,zs=phShoreZ(x0)-860;const legs=Math.max(2,Math.round((zs-top)/430));
 P.push([x0,zs]);for(let k=1;k<=legs;k++){const z=zs+(top-zs)*k/legs;P.push([k===legs?PH.UP[0]:(k%2?xb:xa),z]);}
 const stops=[];for(let k=1;k<P.length-1;k++){const p=P[k],side=p[0]>200?1:-1;stops.push({key:k%2?'xa_teahouse':'xa_shops',x:p[0]+side*30,z:p[1],ry:side>0?-Math.PI/2:Math.PI/2,why:k%2?'a teahouse on the avenue\'s turn':'a stall row on the avenue\'s turn'});}
 return{pts:P,w:12,stops};}


// ---------------------------------------------------------------- the wall: the lower switchbacks lined with houses (the owner, 2026-11-16)
// A third core/city instance round the avenue's lower legs (PH_WALL_LEGS of them): the avenue laid as its way, the civic
// pieces of Lower Phēr that reach into its raster stamped HARD, the stream kept clear, and a strip on each leg's lakeward
// side (the view over the cove) filled by frontage-courts, its ends left open at the turns (40 m) for the stalls there.
// The uphill side stays the wall's terraced gardens.
const PH_WALL_LEGS=3,PH_WALL_L=phLevel([150,-1900]);
function phWallSteps(){const L=PH_WALL_L,K=()=>KCITY.lib;return[
 {name:'the ground',run(C){const k=K(),R=k.SL.R=new k.Raster(C.tune.rasterHalf,C.tune.cell);R.occ.fill(k.OCC.OUT);
   const P=PH_ROAD.pts.slice(0,PH_WALL_LEGS+1),xs=P.map(q=>q[0]),zs=P.map(q=>q[1]),x0=Math.min(...xs)-80,x1=Math.max(...xs)+80,z0=Math.min(...zs)-80,z1=Math.max(...zs)+80;
   const Z=[L.P(x0,z0),L.P(x1,z0),L.P(x1,z1),L.P(x0,z1)];k.SL.R.land=KCITY.site.zoneRaster(R,Z,{dry:1,h:L.h});k.SL.minSpacing=KCITY.site.minSpacing();k.plan().zone=Z;
   phStreamClear(R,L,k.OCC);
   for(const c of PH_LOW.civic||[]){if(!c.bo)continue;const q=L.P(c.x+PH_LOW_L.o[0],c.z+PH_LOW_L.o[1]);R.stampPoly(k.obbCorners(k.obb(q,c.bo.u,c.bo.hw+3,c.bo.hd+3)),k.OCC.HARD,-1);}}},
 {name:'the avenue',run(C){K().SL.addWay('avenue',PH_ROAD.pts.slice(0,PH_WALL_LEGS+2).map(q=>L.P(q[0],q[1])),3,{tag:'the lit avenue\'s lower switchbacks'});}},
 {name:'frontage and courts',run(C){const blocks=[];
   for(let k=1;k<=PH_WALL_LEGS;k++){const a=PH_ROAD.pts[k-1],b=PH_ROAD.pts[k],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),u=[dx/len,dz/len];let n=[-u[1],u[0]];if(n[1]<0)n=[-n[0],-n[1]];
    const e=40,i0=7,i1=46,pt=(p,s,o)=>L.P(p[0]+u[0]*s+n[0]*o,p[1]+u[1]*s+n[1]*o);
    blocks.push({id:'wall-'+k,i:k,j:0,poly:[pt(a,e,i0),pt(a,len-e,i0),pt(a,len-e,i1),pt(a,e,i1)],kind:k===1?'middle':'poor',lanes:false});}
   PH_WALL.blocks=blocks;
   PH_WALL.courts=KCITY.strategies['frontage-courts'].run(blocks,{step:6,seed:PH.SEED+2,focus:L.P(140,-1300),pools:PH_POOLS,small:PH_SMALL,gaps:{middle:[6,12],poor:[6,12]},garden:{middle:.3,poor:.3}});}}];}

// ---------------------------------------------------------------- run the levels and the wall
var PH_LOW={},PH_UP={},PH_WALL={},PH_ROAD=null,PH_PLACE=[],PH_ERR=null;
function phRun(){
 const mk=(name,half,steps,seed,L)=>KCITY.create({name,tune:phTune(half),seed,ground:{h:L.h},kit:{dims:phDims},rand:'krand',index:{order:'insertion'},steps});
 const A=mk('pher-lower',1300,phLowSteps(),PH.SEED,PH_LOW_L),B=mk('pher-upper',700,phUpSteps(),PH.SEED+1,PH_UP_L);
 PH_ROAD=phRoad();PH_LOW.C=A;PH_LOW.plan=A.run();PH_UP.C=B;PH_UP.plan=B.run();
 const W=mk('pher-wall',1100,phWallSteps(),PH.SEED+2,PH_WALL_L);PH_WALL.C=W;PH_WALL.plan=W.run();
 // every standing building in page metres, with its level, its kind and the floor it stands on
 const put=(lev,P,L)=>{for(const T of P.lots){if(T.died!=null||!T.bo)continue;const q=[T.x+L.o[0],T.z+L.o[1]];
   PH_PLACE.push({id:lev+':'+T.id,level:lev,key:T.key,v:T.v|0,x:q[0],z:q[1],ry:T.ry,w:T.w,d:T.d,h:T.h,o:{v:T.v|0,y:T.y==null?phH(q[0],q[1]):T.y},
    kind:T.cls==='landmark'?'civic':'house',why:T.why||T.role||null,court:T.court||null,bo:{c:q,u:T.bo.u,hw:T.bo.hw,hd:T.bo.hd},drop:T.drop||0});}};
 put('lower',PH_LOW.plan,PH_LOW_L);put('upper',PH_UP.plan,PH_UP_L);put('wall',PH_WALL.plan,PH_WALL_L);
 // the fair's stalls on the fair ground (opt-in kits/xanadu/extra/88e-xa-stall.js): rows 20 m apart facing their aisles in
 // pairs, every 9.5 m along, the crossing aisles on the avenue's axis and the Swīṭ Siṭrīm's banks left open; each stall's trade from its own cell
 {const F=PH_FAIR,U=PH.UP,D=phDims('xa_stall',0);if(D)for(let r=0;r<6;r++){const z=-50+r*20,ry=r%2?Math.PI:0;
  for(let i=0;i<22;i++){const x=-100+i*9.5;const q=[U[0]+x,U[1]+z];if(Math.abs(x)<10||Math.abs(z)<8||Math.abs(q[0]-phStreamX(q[1]))<16)continue;const v=KRAND.hash(PH.SEED,r,i)%4;
   PH_PLACE.push({id:'fair:'+r+':'+i,level:'upper',key:'xa_stall',v,x:q[0],z:q[1],ry,w:D.w,d:D.d,h:D.h,o:{v,y:phH(q[0],q[1])+.05},kind:'stall',why:'a stall of the fair',
    bo:{c:q,u:[Math.cos(ry),-Math.sin(ry)],hw:D.w/2,hd:D.d/2},drop:0});}}}
 for(const s of PH_ROAD.stops){const D=phDims(s.key,0);if(!D)continue;PH_PLACE.push({id:'road:'+s.key+':'+Math.round(s.z),level:'road',key:s.key,v:0,x:s.x,z:s.z,ry:s.ry,w:D.w,d:D.d,h:D.h,
   o:{v:0,y:phH(s.x,s.z)+.1},kind:'roadside',why:s.why,bo:{c:[s.x,s.z],u:[Math.cos(s.ry),-Math.sin(s.ry)],hw:D.w/2,hd:D.d/2},drop:0});}
 // the ways in page metres, for drawing and the checks
 PH.ways=[].concat(PH_LOW.plan.ways.map(w=>({cls:w.cls,w:w.w,tag:w.tag,pts:w.pts.map(p=>[p[0]+PH_LOW_L.o[0],p[1]+PH_LOW_L.o[1]]),closed:w.closed})),
  PH_UP.plan.ways.map(w=>({cls:w.cls,w:w.w,tag:w.tag,pts:w.pts.map(p=>[p[0]+PH_UP_L.o[0],p[1]+PH_UP_L.o[1]]),closed:w.closed})),
  [{cls:'avenue',w:PH_ROAD.w,tag:'the lit avenue\'s switchbacks',pts:PH_ROAD.pts}]);
 // the people: each house's household by its key (PLAN.md section 2: ~6,000), the civic pieces none
 let people=0;const byLevel={lower:0,upper:0,wall:0,road:0};for(const p of PH_PLACE){const n=p.kind==='civic'||p.kind==='stall'?0:(PH_PEOPLE[p.key]==null?5:PH_PEOPLE[p.key]);people+=n;byLevel[p.level]+=n;}
 PH.people={total:people,byLevel};
 return PH_PLACE;}

// ---------------------------------------------------------------- the boats (PLAN.md step P4): moored, beached, out fishing, on the runs
// From the tune's records (core/region/data/xan-tune.js, which this page does not load; the numbers are copied here and
// named): lake.cross's six carriers between Phēr and Erehwon (PH.FLEET.cross), the two market rounds (round.north-west,
// round.north-east), the pilgrims' launch to Grēṭ-Āil (T.loops loop.pher.pilgrims), and the dugouts of ph.fishing (600 crew,
// two to a dugout: 300; the page draws the ~80 within its ground: beached or out on the near fishing grounds).
//   PH_BOATS.moored  {id, key, v, x, z, ry}: at the quays (launches furled, cargo barges) and drawn up on the cove's beach
//   PH_BOATS.out     {id, key, v, x, z, ry, r (the drift's radius), w (its angular speed)}: the fishing dugouts on the water
//   PH_BOATS.runs    {id, kind, why, pts, boats: [{key, v, phase}], speed (m/s)}: each run a polyline from its quay out to
//                    the edge of the page's lake, out and back; a boat at phase f is f of the way round the loop at time 0
// [G data]: plain records; 90s draws them and moves the runs' boats with the page's clock. Every spot and every station of a
// run is on the water (the checks: tests/test-pher-site.js, verify.py pher-boats).
PH.FLEET={cross:6,rounds:1,pilgrims:1,dugoutsOut:48,dugoutsBeached:30,speed:12/3.6};
function phBoats(){const B={moored:[],out:[],runs:[]},S=KRAND.stream(KRAND.child(PH.SEED,'boats'));
 const zs=phShoreZ,at=(x,front)=>zs(x)+front;
 // moored: two cargo barges at the cargo quay (-150), three launches at the launches' landing (10), one at the cross-lake quay (190)
 [[-165,0],[-140,1]].forEach(([x,i])=>B.moored.push({id:'barge:'+i,key:'xa_lake_barge',v:1,x,z:at(x,10)+i*7,ry:Math.PI/2}));
 [-4,12,28].forEach((x,i)=>B.moored.push({id:'launch:'+i,key:'xa_launch',v:1,x,z:at(x,8),ry:Math.PI/2}));
 B.moored.push({id:'launch:cross',key:'xa_launch',v:1,x:190,z:at(190,8),ry:Math.PI/2});
 // drawn up on the beach between the stream's mouth and the cross-lake quay, bows to the lake
 for(let i=0;i<PH.FLEET.dugoutsBeached;i++){const x=56+i*3.9;B.moored.push({id:'dugout:beach:'+i,key:'xa_dugout',v:2,x,z:zs(x)+.4,ry:(S.next()-.5)*.25});}
 // out fishing: on the near grounds (0.15-2.5 km out, the caldera bowl falling fast under them), each drifting on a small circle
 let n=0,tries=0;while(n<PH.FLEET.dugoutsOut&&tries<4000){tries++;const x=-2500+S.next()*5000,z=150+S.next()*2400,h=phH(x,z);
  if(h>-5)continue;if(B.out.some(o=>Math.hypot(o.x-x,o.z-z)<60))continue;
  B.out.push({id:'dugout:out:'+n,key:'xa_dugout',v:1,x,z,ry:S.next()*Math.PI*2,r:4+S.next()*14,w:(S.next()<.5?-1:1)*(.004+S.next()*.01)});n++;}
 // the runs: from a quay's front out of the cove and on to the page's edge; the boats spaced round the loop
 const run=(id,kind,why,pts,key,count)=>{const boats=[];for(let i=0;i<count;i++)boats.push({key,v:0,phase:(i+.5)/count});B.runs.push({id,kind,why,pts,boats,speed:PH.FLEET.speed});};
 run('lake.cross','cross','the cross-lake run to Erehwon: lake.cross, six carriers',[[190,at(190,30)],[130,420],[90,1300],[420,9000]],'xa_launch',PH.FLEET.cross);
 run('round.north-west','round','the north-west market round (Qōqō, Nēṭ, Malbari, Hāibh)',[[-150,at(-150,30)],[-110,520],[-120,1600],[-9000,1800]],'xa_lake_barge',PH.FLEET.rounds);
 run('round.north-east','round','the north-east market round (Māuṭh, Ōlḍ-Thalaba, Ḍāiyar)',[[-150,at(-150,30)],[-40,620],[700,1000],[9000,1100]],'xa_lake_barge',PH.FLEET.rounds);
 run('loop.pher.pilgrims','pilgrims','the pilgrims\' launch to Grēṭ-Āil (the Azure Dream)',[[10,at(10,30)],[60,600],[220,1500],[1600,9000]],'xa_launch',PH.FLEET.pilgrims);
 return B;}
// a run's loop: out along its points and back on a lane 30 m to the right; returns its stations and their lengths
function phRunLoop(R){const P=R.pts,out=[];for(let i=0;i<P.length;i++)out.push(P[i]);
 const back=[];for(let i=P.length-1;i>=0;i--){const a=P[Math.max(0,i-1)],b=P[Math.min(P.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz)||1;
  back.push([P[i][0]-dz/L*30,P[i][1]+dx/L*30]);}
 const L=out.concat(back),cum=[0];for(let i=1;i<L.length;i++)cum.push(cum[i-1]+Math.hypot(L[i][0]-L[i-1][0],L[i][1]-L[i-1][1]));
 return{pts:L,cum,len:cum[cum.length-1]};}
// where a run's boat is at time t (s): its spot and heading
function phRunAt(R,loop,b,t){const s=((b.phase*loop.len+t*R.speed)%loop.len+loop.len)%loop.len;let i=1;while(i<loop.cum.length-1&&loop.cum[i]<s)i++;
 const a=loop.pts[i-1],c=loop.pts[i],f=(s-loop.cum[i-1])/Math.max(1e-6,loop.cum[i]-loop.cum[i-1]);return{x:a[0]+(c[0]-a[0])*f,z:a[1]+(c[1]-a[1])*f,ry:Math.atan2(c[0]-a[0],c[1]-a[1])};}
var PH_BOATS=null;
try{phRun();PH_BOATS=phBoats();}catch(e){PH_ERR=String(e&&e.stack||e);if(typeof reportErr==='function')reportErr('Phēr plan: '+PH_ERR);}

// ---------------------------------------------------------------- the flora's mask (the Vale of Xanadu biome Xanadu's page carries)
// From the plan's records, never from pixels: the Swīṭ Siṭrīm's ravine wooded (1), the headland (.7), the wall's grass
// between the terraces (.45), the rim plain's hedgerows (.1), the strand bare (.06); inside a block the odd tree in a yard
// (.05); never in the lake, on a way or within a building's footprint (core/space's indexes of what the plan places)
function phInPoly(p,P){let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if(((a[1]>p[1])!==(b[1]>p[1]))&&(p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0]))c=!c;}return c;}
function phBioMaskMake(){const S=KCITY.lib.KSPACE,B=S.create({cell:40}),W=S.create({cell:60}),K=S.create({cell:200});
 for(const p of PH_PLACE)B.insert(p,p.x,p.z,Math.hypot(p.bo.hw,p.bo.hd)+1.5);
 for(const w of PH.ways)for(let i=1;i<w.pts.length;i++){const a=w.pts[i-1],b=w.pts[i];W.insert({a,b,r:w.w/2+1.5},(a[0]+b[0])/2,(a[1]+b[1])/2,Math.hypot(b[0]-a[0],b[1]-a[1])/2+w.w);}
 for(const [lev,L] of[[PH_LOW,PH_LOW_L],[PH_UP,PH_UP_L]])for(const b of lev.blocks||[]){const P=b.poly.map(q=>[q[0]+L.o[0],q[1]+L.o[1]]),xs=P.map(q=>q[0]),zs=P.map(q=>q[1]);
  const cx=(Math.min(...xs)+Math.max(...xs))/2,cz=(Math.min(...zs)+Math.max(...zs))/2;K.insert({P},cx,cz,Math.hypot(Math.max(...xs)-Math.min(...xs),Math.max(...zs)-Math.min(...zs))/2);}
 return function(x,z){if(phH(x,z)<.6)return 0;
  for(const q of W.query(x,z,1)){const dx=q.b[0]-q.a[0],dz=q.b[1]-q.a[1],L2=Math.max(1e-9,dx*dx+dz*dz);let t=((x-q.a[0])*dx+(z-q.a[1])*dz)/L2;t=t<0?0:t>1?1:t;if(Math.hypot(q.a[0]+dx*t-x,q.a[1]+dz*t-z)<q.r)return 0;}
  for(const p of B.query(x,z,1))if(Math.abs((x-p.x)*p.bo.u[0]+(z-p.z)*p.bo.u[1])<p.bo.hw+1.5&&Math.abs(-(x-p.x)*p.bo.u[1]+(z-p.z)*p.bo.u[0])<p.bo.hd+1.5)return 0;
  if(Math.abs(x-phStreamX(z))<6)return 0;                                                       /* the stream's own channel */
  for(const k of K.query(x,z,1))if(phInPoly([x,z],k.P))return .05;                              /* a yard in a block */
  const d=phShoreZ(x)-z,W_=PH.WALL;
  if(Math.abs(x-phStreamX(z))<55&&d>W_.strand-60)return 1;                                      /* the stream's ravine */
  if(phSeg(x,z,PH.HEAD.a,PH.HEAD.b)[0]<PH.HEAD.w)return .7;                                     /* the headland */
  if(d<W_.strand)return .06;if(d<W_.top)return .45;return .1;};}
if(typeof BIO!=='undefined'&&BIO.host&&typeof VERN!=='undefined'&&!PH_ERR){
 Object.assign(BIO.host,{mask:phBioMaskMake(),origin:[[PH.COVE.x,-300],[PH.COVE.x+100,-2400],[PH.UP[0],PH.UP[1]]],center:[PH.COVE.x,-2400],
  fields:{wet:(x,z)=>Math.min(1,.7+Math.max(0,1-Math.abs(x-phStreamX(z))/90)*.3),salt:()=>0,upland:(x,z)=>phShoreZ(x)-z>PH.WALL.top?.3:0,
   flow:(x,z)=>Math.max(0,1-Math.abs(x-phStreamX(z))/20),mist:()=>0}});}
if(typeof window!=='undefined')window._pher={placed:PH_PLACE.length,err:PH_ERR,people:PH.people,
 civic:PH_PLACE.filter(p=>p.kind==='civic').length,houses:PH_PLACE.filter(p=>p.kind==='house').length,
 blocks:(PH_LOW.blocks||[]).length+(PH_UP.blocks||[]).length,ways:(PH.ways||[]).length};
