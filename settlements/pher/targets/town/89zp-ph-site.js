// ================================================================= PHĒR — the site, the ground and the plan (settlements/pher/PLAN.md, steps P3, P8)
// [G data] records, no drawing. Runs after every kit def is registered and before the scene (90-scene); 90q draws the
// ground and the water, 90r the plan's buildings. The owner's answers (2026-11-16): a headland and a cove, a small stream,
// the seat held by the Sultan's heir; (2026-11-17, PLAN.md step P8) "something more like santa cruz la laguna, but with
// dense alleys", done procedurally (core/city's hillside strategy) so other villages take it; the switchbacks clear of the
// gorge and not lined with houses; the Lake of the Vale ringed by mountains (Lake Atitlán's look, the rise gentler); the
// fair ground and the caravanserai on the stream's delta; the plaza and the heir's palace on a shelf of the town's spur.
//
// THE FRAME. Metres, x along the shore (east-south-east on the map), z toward the lake (south-south-west), y over the
// lake's level (the lake is at y 0; the world's height is y - 520). The page's frame is the world's turned by the shore's
// bearing (PH.TURN: the coast at Phēr runs about 17 degrees south of east, edit 7 re-run): see phWorldFrame. The origin is
// on the line the open shore would follow, at the cove's middle.
//
// THE GROUND (phH). Near the town a closed form (phNear): the lake's bed falling fast off the shore; a strand rising 6 m in
// 40 m; the caldera's slope rising 21 % to about 900 m in (the town's hillsides), then 10 % up to about 6.5 km back (~770 m),
// where it meets the scale model's range rising behind the town; the Swīṭ Siṭrīm's delta, a fan about 340 m round the
// cove's head at 5 %; its gorge up the slope (its bed a steady 8.5 % to meet the scale model's valley at the town's edge
// in the world, the walls at 37 degrees: 70-200 m deep); the town's spur east of the gorge and the west spur behind the headland; a gully
// east of the town; a shelf on the town's spur about 620 m in (~135 m up: the plaza, the temple, the heir's palace). From
// 3.4 to 4.6 km round the town's centre (its footprint in the world is 3.9 km) it gives way to the scale model's ground
// (PH_FAR, baked by build.py after edit_517_vale_ring.py), so the page shows the mountains round the lake to its far shore.
//
// THE PLAN: one core/city instance (PH_LOW, in the frame PH_LOW_L):
//   the delta      the quays, the boat slip, the warehouses, the granaries and the grain office, the fair ground (its
//                  stalls; the fair's rows on the fair's days), the caravanserai with its mule yard and pens, the strand
//                  street along the shore crossing the stream on a bridge (the kit's xa_bridge)
//   the hillsides  core/city's hillside strategy (37-city-hillside.js) on two scopes, the town's spur from the strand to
//                  the shelf and the west spur behind the headland: a spine path, contour alleys and stairs, small houses
//                  packed along them, each on its footing
//   the shelf      the plaza, the temple of the Decree, the heir's palace (the Grand Vizier's design, for now: the owner),
//                  its garden court, gate, barracks and watch
//   the road       PH_ROAD: from the plaza up the spur's back in legs of ~400 m and tight hairpins (no houses on it),
//                  clear of the gorge and the gully, to the old rim, where the mule path goes on to Thalaba
// Every lot is a core/city record; 90r draws the records.

var PH={SEED:84391,TURN:17*Math.PI/180,LAKE:0,FAIR:{days:[3,6],week:7,day:122},
 COVE:{x:40,depth:450,half:380},HEAD:{a:[-640,-120],b:[-330,1260],w:170,crest:[62,26]},POINT:{a:[620,-80],b:[760,330],w:110,crest:18},
 SLOPE:{strand:40,low:.21,turn:900,high:.1,top:6500,plain:.007},FAN:{r:340,k:.05},GORGE:{grade:.085,floor:5,wall:.75,channel:2.2},
 SPURS:[{x:470,w:240,lift:16,drift:.05},{x:-470,w:210,lift:20,drift:-.02}],GULLY:{x:1060,w:50,depth:26,drift:.04},
 SHELF:{x:470,d:620,r:150,edge:90},FARBLEND:[3400,4600],STREET_D:36};
const phSm=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);};
const phSeg=(x,z,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],L2=dx*dx+dz*dz;let t=((x-a[0])*dx+(z-a[1])*dz)/L2;t=t<0?0:t>1?1:t;return[Math.hypot(a[0]+dx*t-x,a[1]+dz*t-z),t];};
// the shore's line: z of the waterline at x (the open shore at 0, the cove cut in)
const phShoreZ=x=>-PH.COVE.depth*Math.exp(-Math.pow((x-PH.COVE.x)/PH.COVE.half,2));
// the stream's line: its x at z (from the cove's head inland, drifting a little east up the slope)
const phStreamX=z=>PH.COVE.x+Math.max(0,-z-PH.COVE.depth)*.03;
// a point d metres inland of the waterline at x
const phAt=(x,d)=>[x,phShoreZ(x)-d];
// the cove's head (the fan's centre)
const PH_CH=[PH.COVE.x,-PH.COVE.depth];
// the land's height at inland distance d, before the spurs, the fan, the shelf and the cuts
function phProfile(d){if(d<0){const y=1.2-2.7*phSm(0,6,-d)-.18*(-d)-.0006*d*d;return y>-60?y:-60-300*(1-Math.exp((y+60)/300));}   /* the beach shelving into the water, the bowl falling fast, its floor easing toward ~360 m down */
 const S=PH.SLOPE;return 1.2+6*phSm(0,S.strand,d)+S.low*Math.max(0,Math.min(d,S.turn)-S.strand)+S.high*Math.max(0,Math.min(d,S.top)-S.turn)+S.plain*Math.max(0,d-S.top);}
// the stream's bed at inland distance d: its channel across the fan, then PH.GORGE.grade up the slope (the walls of its
// gorge rise from it; at the town's edge in the world, ~6 km in, it meets the scale model's valley of r_pher_swit)
const phStreamBed=d=>{const F=PH.FAN,G=PH.GORGE;return 1.4+F.k*Math.min(Math.max(d,0),F.r)+G.grade*Math.max(0,d-F.r)-G.channel;};
// the slope with its spurs (the shelf's height is read from it)
function phSpurs(x,d,y){for(const S of PH.SPURS){const xs=S.x+S.drift*Math.max(0,d);y+=S.lift*Math.exp(-Math.pow((x-xs)/S.w,2))*phSm(30,160,d);}return y;}
const PH_SHELF_C=(function(){const p=phAt(PH.SHELF.x,PH.SHELF.d);return[p[0],p[1],phSpurs(PH.SHELF.x,PH.SHELF.d,phProfile(PH.SHELF.d))];})();
function phNear(x,z){const d=phShoreZ(x)-z;let y=phProfile(d);
 if(d>-30){y=phSpurs(x,d,y);
  // the delta: the slope's foot eased down to the fan round the cove's head
  const r=Math.hypot(x-PH_CH[0],z-PH_CH[1]),wf=(1-phSm(PH.FAN.r*.65,PH.FAN.r,r))*phSm(-10,10,d);
  if(wf>0)y+=(Math.min(y,1.4+PH.FAN.k*Math.max(0,d))-y)*wf;
  // the shelf on the town's spur: flattened toward its middle's height
  const rs=Math.hypot(x-PH_SHELF_C[0],z-PH_SHELF_C[1]),ws=1-phSm(PH.SHELF.r,PH.SHELF.r+PH.SHELF.edge,rs);if(ws>0)y+=(PH_SHELF_C[2]-y)*ws*.92;
  // the gorge: the stream's own bed (a channel on the fan, then a steady grade up the slope, to meet the scale model's
  // valley at the town's edge) and walls rising from it at G.wall: shallow on the delta, a ravine 70-200 m deep up the slope
  y=Math.min(y,phStreamBed(d)+Math.max(0,Math.abs(x-phStreamX(z))-PH.GORGE.floor)*PH.GORGE.wall);
  // the gully east of the town
  const U=PH.GULLY,gx=x-(U.x+U.drift*Math.max(0,d));y-=U.depth*Math.exp(-Math.pow(gx/U.w,2))*phSm(60,260,d)*(1-phSm(3900,4500,d));}
 // the headland and the east point: ridges joined to the shore, rising out of the lake
 for(const R of[PH.HEAD,PH.POINT]){const q=phSeg(x,z,R.a,R.b),c=Array.isArray(R.crest)?R.crest[0]+(R.crest[1]-R.crest[0])*q[1]:R.crest;
  if(q[0]<R.w*1.8){const u=q[0]/R.w,t=u<1?c*(1-u*u*.6):c*.4-(u-1)/.8*(c*.4+Math.max(3,-y+2));y=Math.max(y,t);}}
 return y;}

// THE WORLD'S FRAME (PLAN.md step P7; core/world/bake_towns.py 'pher' samples phH through it): the page stands on the open
// world turned by the shore's bearing, world = Ry(rot)(page - centre) + the pin (three.js's rotation.y, rot = -PH.TURN), its
// heights lifted by y0 (the lake's level, -520 m). The centre is the page point that stands on the pin (843,1491): the page's
// cove head (COVE.x, -COVE.depth) on the scale model's (842.5,1492: edit_517_pher), so centre = cove head + Ry(-rot)(the pin
// less the cove head, in world metres).
PH.WORLD={pin:[843,1491],coveHeadPx:[842.5,1492],y0:-520};
function phWorldFrame(){const rot=-PH.TURN,W=PH.WORLD,wx=(W.pin[0]-W.coveHeadPx[0])*2000,wz=(W.pin[1]-W.coveHeadPx[1])*2000,c=Math.cos(-rot),s=Math.sin(-rot);
 return{rot,centre:[PH.COVE.x+wx*c+wz*s,-PH.COVE.depth-wx*s+wz*c],y0:W.y0};}
const PH_WF=phWorldFrame();
// page metres to the world's metres from the pin (x east, z south)
function phWorldXZ(x,z){const F=PH_WF,dx=x-F.centre[0],dz=z-F.centre[1],c=Math.cos(F.rot),s=Math.sin(F.rot);return[dx*c+dz*s,-dx*s+dz*c];}
// the far ground: the scale model's height at a page point (page metres over the lake), bilinear in PH_FAR's samples; null
// outside them or without them (a node test without the build's gen/)
const PH_FAR_H=(function(){if(typeof PH_FAR==='undefined')return null;const b=atob(PH_FAR.b64),n=b.length>>1,out=new Int16Array(n);
 for(let i=0;i<n;i++){const v=b.charCodeAt(2*i)|(b.charCodeAt(2*i+1)<<8);out[i]=v>32767?v-65536:v;}return out;})();
function phFar(x,z){if(!PH_FAR_H)return null;const w=phWorldXZ(x,z),F=PH_FAR,u=(w[0]-F.x0)/F.step,v=(w[1]-F.z0)/F.step;
 if(u<0||v<0||u>=F.nx-1||v>=F.nz-1)return null;const i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,A=PH_FAR_H,n=F.nx;
 const h=(A[j*n+i]*(1-fu)+A[j*n+i+1]*fu)*(1-fv)+(A[(j+1)*n+i]*(1-fu)+A[(j+1)*n+i+1]*fu)*fv,y=F.h0+h*F.s-PH.WORLD.y0;
 return y+phRelief(w[0],w[1],y);}
// the far ground's relief: the scale model's 2 km cells hold no ribs, so the range would read as smooth domes. A ridged
// field (core/rand's fbm folded at its middle, two scales, in the world's metres) roughens it in proportion to its height
// over the lake (none on the shore and the lake's bed, up to 300 m on the range), so the slopes break into spurs and
// gullies as Atitlán's do. The page's backdrop only: the world's region has its own sub-cell relief (extract_region.py)
function phRelief(wx,wz,y){const k=Math.min(1,Math.max(0,(y-140)/700));if(k<=0)return 0;
 const r1=1-Math.abs(2*KRAND.fbm(wx/4200,wz/4200,.5,4,PH.SEED+7)-1),r2=1-Math.abs(2*KRAND.fbm(wx/1500,wz/1500,1.5,3,PH.SEED+8)-1);
 return k*(300*(r1-.62)+90*(r2-.62));}
// the blend: over the land 3.4-4.6 km round the town's centre; over the water further out (5.4-7.2 km), so the cove's bed,
// the headland and the point stay the page's
function phH(x,z){const r=Math.hypot(x-PH_WF.centre[0],z-PH_WF.centre[1]),B=PH.FARBLEND,k=phSm(-500,0,phShoreZ(x)-z),w=phSm(B[0]+2000*(1-k),B[1]+2600*(1-k),r);
 if(w<=0)return phNear(x,z);const f=phFar(x,z);if(f==null)return phNear(x,z);const n=w>=1?f:phNear(x,z),y=n+(f-n)*w;
 // the stream's gorge holds through the blend and on to the page's edge (its bed meets the scale model's valley ~6 km in)
 const d=phShoreZ(x)-z;return d>0&&d<8000?Math.min(y,phStreamBed(d)+Math.max(0,Math.abs(x-phStreamX(z))-PH.GORGE.floor)*PH.GORGE.wall):y;}
// on the page: the ground every builder and the camera read, and the core/tags registry under the town's name (91t takes it up)
if(typeof VERN!=='undefined'){terrainH=phH;if(typeof KTAGS!=='undefined')KTAGS.page=KTAGS.page||KTAGS.create({build:'pher'});}
// page metres to the world's: metres from the pin (x east, z south) and the world's height
function phToWorld(x,z){const w=phWorldXZ(x,z);return[w[0],w[1],phH(x,z)+PH_WF.y0];}

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
const phTune=half=>({cell:2.5,rasterHalf:half,maxSlope:.95,   /* the hillsides keep their own (ctx.maxSlope): the raster takes the slope as it is */
 exact:true,
 width:{avenue:12,main:8,side:5.5,alley:3,highway:10,lane:4.5},lot:{side:1.6,setback:1.4,rear:3,inset:1,step:3},
 classes:{rich:[['xa_rich_a',0]],middle:[['xa_mid_a',0],['xa_mid_c',0]],poor:[['xa_poor_c',0]]},fallback:{rich:'middle',middle:'poor',poor:null},
 civic:[],civicSpacing:120,voidMax:40,voidIters:0,voidBatch:0,sideSpacing:48,sideMax:200,alleyFrac:.25,blindMax:90,interiorDepth:9,interiorRounds:0,
 avenueSnap:60,ringGap:8,verge:7,wall:{},plazaArt:{},mapHalf:half,stance:'high',stanceOpt:{maxDrop:9}});

// ---------------------------------------------------------------- the level's frame: its origin in the page
const phLevel=(o)=>({o,h:(x,z)=>phH(x+o[0],z+o[1]),P:(x,z)=>[x-o[0],z-o[1]]});
// a contour: the line d metres inland of the waterline, x from x0 to x1 (every step m), in the level's frame
const phContour=(L,d,x0,x1,step)=>{const P=[];for(let x=x0;x<=x1+.1;x+=step)P.push(L.P(x,phShoreZ(x)-d));return P;};
// a polygon in page metres from [x, d] corners (d inland of the waterline), in the level's frame, edges every ~40 m
const phPolyD=(L,C)=>{const P=[];for(let i=0;i<C.length;i++){const a=C[i],b=C[(i+1)%C.length],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/40));
 for(let k=0;k<n;k++){const t=k/n,x=a[0]+(b[0]-a[0])*t,d=a[1]+(b[1]-a[1])*t;P.push(L.P(x,phShoreZ(x)-d));}}return P;};

// ---------------------------------------------------------------- the civic pieces: placed first, each a host (stamped HARD)
// [key, x, where, facing (the angle of its front: 0 toward +z, the lake), why, variant]; where: null (at the waterline),
// 'w<m>' (m out in the water), 'd<m>' (m inland of the waterline), 'head' / 'tip' (on the headland), or a page z
const PH_CIVIC=[
 /* the delta and the strand */
 ['xa_quay',-150,null,0,'the quay (the cargo boats)'],['xa_quay',10,null,0,'the quay (the launches\' landing)'],['xa_quay',190,null,0,'the quay (the cross-lake run)'],
 ['xa_boatshed',-330,null,0,'the boat slip\'s shed (ph.slip)'],['xa_boatshed',-420,null,0,'the boat slip\'s second shed'],
 ['xa_warehouse',-230,'d72',0,'a warehouse (the fair\'s goods)'],['xa_warehouse',345,'d72',0,'a warehouse (the Two Horns\' store)'],
 ['xa_generator',-90,'d76',0,'the generator (the Sultan\'s oil licence)'],
 ['xa_guild_farm',-118,'d178',0,'the grain office (Nōrth-Shor\'s tithe)'],
 ['xa_granary',-62,'d160',0,'a granary'],['xa_granary',-40,'d160',0,'a granary'],['xa_granary',-18,'d160',0,'a granary'],
 ['xa_granary',-62,'d184',0,'a granary'],['xa_granary',-40,'d184',0,'a granary'],['xa_granary',-18,'d184',0,'a granary'],
 /* the caravanserai on the delta (the owner, 2026-11-16: "build xanadu one"; 2026-11-17: on the delta), its gate east
    toward the fair ground, the mule yard and pens beside it */
 ['xa_caravanserai',-232,'d266',Math.PI/2,'the caravanserai: the Thalaba road\'s and the fair\'s inn'],
 ['xa_corral',-302,'d272',0,'the mule yard'],['xa_pens',-302,'d244',0,'the mule pens'],
 ['xa_temple_ortakoy',540,'d76',0,'the pilgrims\' house of the Azure Dream, facing Grēṭ-Āil'],
 ['xa_teahouse',268,'d62',0,'the strand\'s teahouse'],['xa_bath',650,'d132',0,'the bath'],
 ['xa_rich_b',-430,'d150',0,'the Two Horns\' factor house'],
 /* the shelf on the town's spur (the owner, 2026-11-17): the plaza (PH_PLAZA), the temple of the Decree on its north
    side, the heir's palace east of it (the kit's hollow citadel palace, the Grand Vizier's design: "can use grand vizier
    palace for now"), its garden court, gate and watch, the barracks of the Sultan's own guard west of the plaza */
 ['xa_temple',450,'d672',0,'the temple of the Decree on the plaza'],
 ['xa_cit_vizier',566,'d652',0,'the heir\'s palace: the seat of Nōrth-Shor, held by the Sultan\'s heir (the Grand Vizier\'s design: walk-in with ?interiors=1)'],
 ['xa_palace_gate',566,'d585',0,'the heir\'s gate on the plaza'],['xa_rill_garden',516,'d640',0,'the heir\'s garden court'],
 ['xa_watch',622,'d575',0,'the guard\'s watch at the heir\'s gate'],['xa_barracks',372,'d662',0,'the barracks of the Sultan\'s own guard'],
 /* the water-stair on the cove's east side and the heir's barge */
 ['xa_quay',320,null,0,'the heir\'s water-stair: the court\'s landing',2],['xa_barge',320,'w22',0,'the heir\'s barge, moored at the water-stair'],
 ['xa_watch',-520,'head',.6,'the watch on the headland'],['xa_lighthouse',-370,'tip',.6,'the harbour light at the headland\'s tip']];
// the fair ground on the delta east of the stream, and the plaza on the shelf: [x, d] centre, half-sizes along x and d
const PH_FAIR={x:190,d:172,hw:100,hd:58},PH_PLAZA={x:450,d:602,hw:40,hd:30};
function phPlaceCivic(C,L,spec){const K=KCITY.lib,SLx=K.SL,PLAN_=K.plan(),out=[];
 for(const [key,px,pz,ry,why,v0] of spec){const v=v0|0,D=phDims(key,v);if(!D){out.push({key,err:'no def'});continue;}
  let x=px,z=pz;
  if(typeof pz!=='number'){const zs=phShoreZ(px);
   z=pz===null?zs-D.d/2+5:pz==='head'?-40:pz==='tip'?1050:pz[0]==='d'?zs-Number(pz.slice(1)):pz[0]==='w'?zs+Number(pz.slice(1)):zs-60;
   if(pz==='head'||pz==='tip'){const R=PH.HEAD,t=pz==='head'?.15:.82;x=R.a[0]+(R.b[0]-R.a[0])*t;z=R.a[1]+(R.b[1]-R.a[1])*t;}}
  const q=L.P(x,z),u=[Math.cos(ry),-Math.sin(ry)],o=K.obb(q,u,D.w/2,D.d/2);
  const lot={id:PLAN_.lots.length,cls:'landmark',role:why,key,v,slot:0,wealth:1,x:q[0],z:q[1],y:0,ry,w:D.w,d:D.d,h:D.h,lot:o,bo:o,way:-1,side:0,s:0,born:1,died:null,civic:true,why};
  const st=KCITY.stance(o,(a,b)=>L.h(a,b),{maxDrop:24});lot.y=st?st.y:L.h(q[0],q[1]);if(st)lot.drop=st.drop;
  if(key==='xa_quay'||key==='xa_boatshed')lot.y=1.2;   /* on the waterline: the quay's deck at the strand's foot */
  if(key==='xa_barge'){lot.y=PH.LAKE;delete lot.drop;}   /* afloat */
  PLAN_.lots.push(lot);SLx.hashLot(lot);SLx.register(lot);SLx.R.stampPoly(K.obbCorners(K.obb(q,u,D.w/2+3,D.d/2+3)),K.OCC.HARD,lot.id);out.push(lot);}
 return out;}
// the bridge where the strand street crosses the stream: a lot on the street (not stamped: the street runs over it), its
// deck at the banks' height, along the street
function phBridge(L){const K=KCITY.lib,PLAN_=K.plan(),D=phDims('xa_bridge',1);if(!D)return null;
 let z=phShoreZ(PH.COVE.x)-PH.STREET_D;for(let i=0;i<4;i++)z=phShoreZ(phStreamX(z))-PH.STREET_D;const x=phStreamX(z),q=L.P(x,z),u=[0,1],o=K.obb(q,u,D.w/2,D.d/2);
 const y=Math.max(phH(x-12,z),phH(x+12,z))+.2;
 const lot={id:PLAN_.lots.length,cls:'landmark',role:'the strand street\'s bridge over the Swīṭ Siṭrīm',key:'xa_bridge',v:1,slot:0,wealth:1,x:q[0],z:q[1],y,ry:Math.PI/2,w:D.w,d:D.d,h:D.h,lot:o,bo:o,way:-1,side:0,s:0,born:2,died:null,civic:true,bridge:true,
  why:'the strand street\'s bridge over the Swīṭ Siṭrīm'};PLAN_.lots.push(lot);return lot;}

// ---------------------------------------------------------------- what stays open: the stream's corridor and the gully
// (green: no lot or alley stands on them; a street crosses on its bridge): 14 m either side on the delta, 50 m up the gorge
function phCorridors(R,L,OCC){let a=null;for(let z=phShoreZ(PH.COVE.x)+5;z>=-2600;z-=10){const p=L.P(phStreamX(z),z);
  if(a){const d=phShoreZ(phStreamX(z))-z,band=d<PH.FAN.r*.6?14:50;R.eachNearSeg(a,p,band,k=>{if(R.occ[k]!==OCC.OUT)R.occ[k]=OCC.GREEN;});}a=p;}
 a=null;for(let d=40;d<=2600;d+=20){const U=PH.GULLY,x=U.x+U.drift*d,p=L.P(x,phShoreZ(x)-d);if(a)R.eachNearSeg(a,p,36,k=>{if(R.occ[k]!==OCC.OUT)R.occ[k]=OCC.GREEN;});a=p;}}

// ---------------------------------------------------------------- the road: from the plaza up the spur's back in hairpins
// From the plaza's west side round the barracks to the first turn, then legs across the spur between x 360 and 790 (east
// of the gorge, west of the gully), each ~430 m, climbing about 21 m (5 %), to the high slope ~6.2 km in. There it connects
// (the owner, 2026-11-17: "the switchback road does need to connect in back"): at the Thalaba road's first guide point
// (openworld/xanadu-north-shore 48-world-site.js: PH.THALABA_GUIDE[0], set to the road's top on the east side of the
// gorge), from which the region's road crosses the Swīṭ Siṭrīm upstream (core/world 42b bridges it) and runs up the Qol
// Siṭrīm's valley. No houses on it: it is laid before the hillsides, past the shelf outside their scopes; a teahouse at its
// top turn.
// a world point (metres from the pin, x east, z south) in the page's metres: phWorldXZ's inverse
function phPageXZ(wx,wz){const F=PH_WF,c=Math.cos(F.rot),s=Math.sin(F.rot);return[F.centre[0]+wx*c-wz*s,F.centre[1]+wx*s+wz*c];}
const phPx=(x,z)=>{const w=phWorldXZ(x,z);return[PH.WORLD.pin[0]+w[0]/2000,PH.WORLD.pin[1]+w[1]/2000];};
// the region's link spher0north1 -> shvo49k0y2: its first two guide points (5.1 px). The first is the road's top here
// (phAt(560, 6200), to 0.01 px: the region's spec copies it, and the test holds the road's end to it)
PH.THALABA_GUIDE=[[843.60,1489.29],[838,1487.2]];
function phRoad(){const P=[phAt(PH_PLAZA.x-PH_PLAZA.hw-6,PH_PLAZA.d),phAt(320,612),phAt(340,760)];let d=760,k=0;
 while(d<6000){d=Math.min(6000,d+(d<900?100:215));k++;const w=Math.max(360,phStreamX(phShoreZ(500)-d)+330),e=Math.max(790,w+380);P.push(phAt(k%2?e:w,d));}   /* the west turns kept 330 m east of the gorge's stream */
 const G=PH.THALABA_GUIDE.map(q=>phPageXZ((q[0]-PH.WORLD.pin[0])*2000,(q[1]-PH.WORLD.pin[1])*2000)),top=P[P.length-1];P.push(G[0]);
 return{pts:P,w:8,join:G[0],stops:[{key:'xa_teahouse',x:top[0]+(top[0]>500?36:-36),z:top[1]-10,ry:0,why:'a teahouse at the top turn of the road'}]};}

// ---------------------------------------------------------------- the hillsides (core/city's hillside strategy)
// the town's spur: from the strand street to the shelf, between the gorge's corridor and the gully, the fair ground and the
// delta's pieces left out; the west spur: behind the headland, between it and the delta
// the hillsides' houses: the kit's smallest (14-16 m: it has none of Santa Cruz's 8-10 m), the Palopó cholets among them
const PH_HILL_POOLS={middle:[['xa_poor_c',3],['xa_mid_a',3],['xa_andean_poor',2]],poor:[['xa_poor_c',4],['xa_andean_poor',2],['xa_mid_a',1]]};
const PH_HILLS=[
 {id:'east',i:0,j:0,kind:'middle',C:[[300,43],[960,43],[985,760],[700,760],[640,560],[300,560],[150,760],[150,250],[300,250]],
  paths:[[[372,45],[PH_PLAZA.x,PH_PLAZA.d-PH_PLAZA.hd-16]],[[760,45],[900,700]],[[310,240],[200,720]]]},
 {id:'west',i:1,j:0,kind:'poor',C:[[-120,330],[-150,43],[-600,43],[-640,620],[-200,620]],paths:[[[-330,45],[-440,560]],[[-560,45],[-580,580]]]}];

// ---------------------------------------------------------------- the town: one instance
const PH_LOW_L=phLevel([0,-500]);
function phTownSteps(){const L=PH_LOW_L,K=()=>KCITY.lib;return[
 {name:'the ground',run(C){const k=K(),R=k.SL.R=new k.Raster(C.tune.rasterHalf,C.tune.cell);R.occ.fill(k.OCC.OUT);
   const Z=phPolyD(L,[[-760,6],[1300,6],[1300,1250],[-760,1250]]);
   k.SL.R.land=KCITY.site.zoneRaster(R,Z,{dry:1,h:L.h});k.SL.minSpacing=KCITY.site.minSpacing();k.plan().zone=Z;
   phCorridors(R,L,k.OCC);
   for(const [nm,G] of[['the fair ground',PH_FAIR],['the plaza',PH_PLAZA]]){const P=phPolyD(L,[[G.x-G.hw,G.d-G.hd],[G.x+G.hw,G.d-G.hd],[G.x+G.hw,G.d+G.hd],[G.x-G.hw,G.d+G.hd]]);
    R.stampPoly(P,k.OCC.GREEN,-1);k.plan().greens.push({id:k.plan().greens.length,kind:'plaza',poly:P,district:nm,born:2});}}},
 {name:'the civic pieces',run(C){PH_LOW.civic=phPlaceCivic(C,L,PH_CIVIC);}},
 {name:'the streets and the road',run(C){const S=K().SL;
   S.addWay('main',phContour(L,PH.STREET_D,-640,1080,20),3,{tag:'the strand street'});
   PH_LOW.bridge=phBridge(L);
   /* round the fair ground, and up from the strand street to it */
   const F=PH_FAIR;S.addWay('side',phPolyD(L,[[F.x-F.hw-6,F.d-F.hd-6],[F.x+F.hw+6,F.d-F.hd-6],[F.x+F.hw+6,F.d+F.hd+6],[F.x-F.hw-6,F.d+F.hd+6]]),3,{closed:true,tag:'round the fair ground'});
   S.addWay('side',[L.P(...phAt(F.x,PH.STREET_D)),L.P(...phAt(F.x,F.d-F.hd-6))],3,{tag:'the fair ground\'s street'});
   /* the caravanserai's lane from the strand street */
   S.addWay('lane',[L.P(...phAt(-180,PH.STREET_D)),L.P(...phAt(-190,232))],3,{tag:'the caravanserai\'s lane'});
   /* the road, as far as the town's raster reaches */
   const inR=PH_ROAD.pts.map(p=>L.P(p[0],p[1])).filter(q=>Math.max(Math.abs(q[0]),Math.abs(q[1]))<C.tune.rasterHalf-10);
   if(inR.length>1)S.addWay('main',inR,3,{tag:'the road up the spur (its hairpins)'});}},
 {name:'the hillsides',run(C){const scopes=PH_HILLS.map(h=>({id:h.id,i:h.i,j:h.j,kind:h.kind,poly:phPolyD(L,h.C),paths:h.paths.map(p=>({foot:L.P(...phAt(...p[0])),head:L.P(...phAt(...p[1]))}))}));
   const R=K().SL.R,OCC=K().OCC;PH_LOW.scopes=scopes;
   PH_LOW.hill=KCITY.strategies.hillside.run(scopes,{h:L.h,seed:PH.SEED,step:6,pools:PH_HILL_POOLS,gaps:{middle:[1,2.5],poor:[.8,2]},margin:.5,setback:2,maxSlope:.8,
    ok:p=>R.at(p[0],p[1])!==OCC.GREEN,spine:{grade:.3,step:8},contour:{every:34,len:[80,280],gap:14},stair:{every:60,len:[20,70]},depth:3,infill:{step:12,reach:16}});}},
 {name:'the delta\'s frontage',run(C){const blocks=[{id:'delta-w',i:0,j:1,kind:'strand',poly:phPolyD(L,[[-150,44],[-28,44],[-28,140],[-150,140]]),lanes:false},
    {id:'delta-e',i:1,j:1,kind:'fair',poly:phPolyD(L,[[66,44],[300,44],[300,104],[66,104]]),lanes:false}];
   PH_LOW.blocks=blocks;PH_LOW.courts=KCITY.strategies['frontage-courts'].run(blocks,{step:6,seed:PH.SEED,focus:L.P(...phAt(40,40)),pools:PH_POOLS,small:PH_SMALL,gaps:PH_GAPS,garden:{strand:.1,fair:.05},infill:{step:10,yard:.4}});}}];}

// ---------------------------------------------------------------- run the town
var PH_LOW={},PH_ROAD=null,PH_PLACE=[],PH_ERR=null;
function phRun(){
 const mk=(name,half,steps,seed,L)=>KCITY.create({name,tune:phTune(half),seed,ground:{h:L.h},kit:{dims:phDims},rand:'krand',index:{order:'insertion'},steps});
 PH_ROAD=phRoad();const A=mk('pher-town',1300,phTownSteps(),PH.SEED,PH_LOW_L);PH_LOW.C=A;PH_LOW.plan=A.run();
 // every standing building in page metres, with its level ('delta', 'shelf', 'east', 'west'), its kind and the floor it stands on
 const L=PH_LOW_L,hill={};for(const T of (PH_LOW.hill&&PH_LOW.hill.lots)||[])hill[T.id]=T.court;
 for(const T of PH_LOW.plan.lots){if(T.died!=null||!T.bo)continue;const q=[T.x+L.o[0],T.z+L.o[1]],d=phShoreZ(q[0])-q[1];
  const lev=hill[T.id]||(Math.hypot(q[0]-PH_SHELF_C[0],q[1]-PH_SHELF_C[1])<PH.SHELF.r+PH.SHELF.edge?'shelf':'delta');
  /* the podium: o.drop makes the kit grow its battered rubble footing down to the plot's low corner (kits/xanadu
     72-xa-helpers XA.def; the owner, 2026-11-17: "make the podium part of these builds"); the hillsides' houses carry their
     carved basement and, where the slope fits, its door from the podium (core/city KCITY.hillside.basement), in page metres */
  const B=T.basement?{storeys:T.basement.storeys,depth:T.basement.depth,door:T.basement.door?Object.assign({},T.basement.door,{x:T.basement.door.x+L.o[0],z:T.basement.door.z+L.o[1]}):null}:null;
  PH_PLACE.push({id:lev+':'+T.id,level:lev,key:T.key,v:T.v|0,x:q[0],z:q[1],ry:T.ry,w:T.w,d:T.d,h:T.h,o:{v:T.v|0,y:T.y==null?phH(q[0],q[1]):T.y,drop:T.bridge?0:T.drop||0},
   kind:T.cls==='landmark'?(T.bridge?'bridge':'civic'):'house',why:T.why||T.role||null,court:T.court||null,bo:{c:q,u:T.bo.u,hw:T.bo.hw,hd:T.bo.hd},drop:T.drop||0,inland:d,basement:B});}
 // the fair's stalls on the fair ground (opt-in kits/xanadu/extra/88e-xa-stall.js): rows 18 m apart facing their aisles in
 // pairs, every 9.5 m along, a crossing aisle left open in the middle; the first two rows the daily market, the rest the
 // fair's (drawn on its days); each stall's trade from its own cell
 {const F=PH_FAIR,D=phDims('xa_stall',0);if(D)for(let r=0;r<6;r++){const dd=F.d-F.hd+10+r*18,ry=r%2?Math.PI:0;
  for(let i=0;i<20;i++){const xo=-F.hw+8+i*9.5;if(Math.abs(xo)<8)continue;const q=phAt(F.x+xo,dd);const v=KRAND.hash(PH.SEED,r,i)%4;
   PH_PLACE.push({id:'fair:'+r+':'+i,level:'delta',key:'xa_stall',v,x:q[0],z:q[1],ry,w:D.w,d:D.d,h:D.h,o:{v,y:phH(q[0],q[1])+.05},kind:'stall',daily:r<2,why:r<2?'a stall of the daily market':'a stall of the fair',
    bo:{c:q,u:[Math.cos(ry),-Math.sin(ry)],hw:D.w/2,hd:D.d/2},drop:0});}}}
 for(const s of PH_ROAD.stops){const D=phDims(s.key,0);if(!D)continue;PH_PLACE.push({id:'road:'+s.key+':'+Math.round(s.z),level:'road',key:s.key,v:0,x:s.x,z:s.z,ry:s.ry,w:D.w,d:D.d,h:D.h,
   o:{v:0,y:phH(s.x,s.z)+.1},kind:'roadside',why:s.why,bo:{c:[s.x,s.z],u:[Math.cos(s.ry),-Math.sin(s.ry)],hw:D.w/2,hd:D.d/2},drop:0});}
 // the ways in page metres, for drawing and the checks (the road whole, beyond the town's raster too)
 PH.ways=PH_LOW.plan.ways.filter(w=>!/the road up the spur/.test(w.tag)).map(w=>({cls:w.cls,w:w.w,tag:w.tag,pts:w.pts.map(p=>[p[0]+L.o[0],p[1]+L.o[1]]),closed:w.closed}))
  .concat([{cls:'main',w:PH_ROAD.w,tag:'the road up the spur (its hairpins)',pts:PH_ROAD.pts}]);
 // the people: each house's household by its key (PLAN.md section 2: ~6,000), the civic pieces none
 let people=0;const byLevel={};for(const p of PH_PLACE){const n=p.kind==='house'?(PH_PEOPLE[p.key]==null?5:PH_PEOPLE[p.key]):0;people+=n;byLevel[p.level]=(byLevel[p.level]||0)+n;}
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
 /* the fair's launches (T.loops fair-west, fair-east): on the fair's days the north shore's towns come in by launch, two each way */
 run('loop.pher.fair-west','fair','the fair\'s launches from the west (Qōqō, Nēṭ, Malbari, Hāibh)',[[10,at(10,30)],[-30,700],[-160,1650],[-9000,1800]],'xa_launch',2);
 run('loop.pher.fair-east','fair','the fair\'s launches from the east (Māuṭh, Ōlḍ-Thalaba, Ḍāiyar)',[[28,at(28,30)],[200,700],[900,1150],[9000,1250]],'xa_launch',2);
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
// is the page's day a fair day (the lake's week: day mod 7 among PH.FAIR.days)
const phFairDay=day=>PH.FAIR.days.indexOf(((Math.floor(day)%PH.FAIR.week)+PH.FAIR.week)%PH.FAIR.week)>=0;
try{phRun();PH_BOATS=phBoats();}catch(e){PH_ERR=String(e&&e.stack||e);if(typeof reportErr==='function')reportErr('Phēr plan: '+PH_ERR);}

// ---------------------------------------------------------------- the flora's mask (the Vale of Xanadu biome Xanadu's page carries)
// From the plan's records, never from pixels: the Swīṭ Siṭrīm's gorge and the gully wooded (1), the headland (.7), the
// slope above the town (.5), the old rim (.25), the delta and the strand bare (.06); inside a block or a hillside the odd
// tree in a yard (.05); never in the lake, on a way or within a building's footprint (core/space's indexes of what the plan places)
function phInPoly(p,P){let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if(((a[1]>p[1])!==(b[1]>p[1]))&&(p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0]))c=!c;}return c;}
function phBioMaskMake(){const S=KCITY.lib.KSPACE,B=S.create({cell:40}),W=S.create({cell:60}),K=S.create({cell:200});
 for(const p of PH_PLACE)B.insert(p,p.x,p.z,Math.hypot(p.bo.hw,p.bo.hd)+1.5);
 for(const w of PH.ways)for(let i=1;i<w.pts.length;i++){const a=w.pts[i-1],b=w.pts[i];W.insert({a,b,r:w.w/2+1.5},(a[0]+b[0])/2,(a[1]+b[1])/2,Math.hypot(b[0]-a[0],b[1]-a[1])/2+w.w);}
 for(const b of (PH_LOW.blocks||[]).concat(PH_LOW.scopes||[])){const L=PH_LOW_L,P=b.poly.map(q=>[q[0]+L.o[0],q[1]+L.o[1]]),xs=P.map(q=>q[0]),zs=P.map(q=>q[1]);
  const cx=(Math.min(...xs)+Math.max(...xs))/2,cz=(Math.min(...zs)+Math.max(...zs))/2;K.insert({P},cx,cz,Math.hypot(Math.max(...xs)-Math.min(...xs),Math.max(...zs)-Math.min(...zs))/2);}
 return function(x,z){if(phH(x,z)<.6)return 0;
  for(const q of W.query(x,z,1)){const dx=q.b[0]-q.a[0],dz=q.b[1]-q.a[1],L2=Math.max(1e-9,dx*dx+dz*dz);let t=((x-q.a[0])*dx+(z-q.a[1])*dz)/L2;t=t<0?0:t>1?1:t;if(Math.hypot(q.a[0]+dx*t-x,q.a[1]+dz*t-z)<q.r)return 0;}
  for(const p of B.query(x,z,1))if(Math.abs((x-p.x)*p.bo.u[0]+(z-p.z)*p.bo.u[1])<p.bo.hw+1.5&&Math.abs(-(x-p.x)*p.bo.u[1]+(z-p.z)*p.bo.u[0])<p.bo.hd+1.5)return 0;
  if(Math.abs(x-phStreamX(z))<6)return 0;                                                       /* the stream's own channel */
  for(const k of K.query(x,z,1))if(phInPoly([x,z],k.P))return .05;                              /* a yard in a block */
  const d=phShoreZ(x)-z,U=PH.GULLY;
  if(Math.abs(x-phStreamX(z))<55&&d>PH.FAN.r*.6)return 1;                                       /* the stream's gorge */
  if(Math.abs(x-(U.x+U.drift*d))<45&&d>60)return 1;                                             /* the gully */
  if(phSeg(x,z,PH.HEAD.a,PH.HEAD.b)[0]<PH.HEAD.w)return .7;                                     /* the headland */
  if(Math.hypot(x-PH_CH[0],z-PH_CH[1])<PH.FAN.r||d<PH.SLOPE.strand)return .06;                  /* the delta, the strand */
  if(d<4500)return .5;return .25;};}
if(typeof BIO!=='undefined'&&BIO.host&&typeof VERN!=='undefined'&&!PH_ERR){
 Object.assign(BIO.host,{mask:phBioMaskMake(),origin:[[PH.COVE.x,-300],[PH.COVE.x+100,-2400],[PH_SHELF_C[0],PH_SHELF_C[1]]],center:[PH.COVE.x,-1400],
  fields:{wet:(x,z)=>Math.min(1,.7+Math.max(0,1-Math.abs(x-phStreamX(z))/90)*.3),salt:()=>0,upland:(x,z)=>phShoreZ(x)-z>4500?.3:0,
   flow:(x,z)=>Math.max(0,1-Math.abs(x-phStreamX(z))/20),mist:()=>0}});}
if(typeof window!=='undefined')window._pher={placed:PH_PLACE.length,err:PH_ERR,people:PH.people,
 civic:PH_PLACE.filter(p=>p.kind==='civic').length,houses:PH_PLACE.filter(p=>p.kind==='house').length,
 blocks:(PH_LOW.blocks||[]).length,scopes:(PH_LOW.scopes||[]).length,alleys:((PH_LOW.hill||{}).alleys||[]).length,ways:(PH.ways||[]).length};
