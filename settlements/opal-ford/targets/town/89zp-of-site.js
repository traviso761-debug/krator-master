// ================================================================= ŌPAL-PHŌRḌ — the site, the ground and the plan (settlements/opal-ford/PLAN.md, step OF1)
// [G data] records, no drawing. Runs after every kit def is registered and before the scene (90-scene); 90q draws the ground
// and the river, 90r the plan's buildings, the ford, the weirs and the boats.
//
// THE FRAME. Metres, z up the river (south-east on the map: the Sitār Ḍrāi falls north-west to the Lower Lake at Gihon), x across
// it, +x the north-east bank where the town stands; y over the river's water at the ford (the world's -13 m: OF.Y0). The pin
// (969,1634) is the ford, the page's origin. ofToWorld turns page metres into the world's (east, south, height).
//
// THE GROUND (ofH), from the scale model (PLAN.md sections 1 and 2b): the town stands in the middle of the cataract reach, on a
// bench of flats where the river runs slack for about 4 km; below it the rapids fall 1.2 % toward Gihon, above it 0.9 %, and
// about 3 km up one fall of 20 m (the bow's fall, proposed: the cataract drawn as one fall and its rapids). The river is about
// 52 m wide and 2.4 m deep, at the ford 88 m and 0.6 m. On the north-east bank: the flats (the paddies, 1.6 m over the water),
// a riser of 7 m (the first rise above the flood), the bench (the town, rising 0.8 %), then the slope at 4.5 % (the terraces).
// On the south-west bank: narrow flats, then the spur's steep side. Below the fall the banks stand over the river (its gorge).
//
// THE PLAN: one core/city instance on the bench (OF_TOWN): the high street (the road from Gihon up the valley), the bank street
// on the riser's top, the back lane, cross lanes, the ford street from the high street down to the ford;
// the market square at the ford street's head with the han across it, the temple above it, the toll house and the Golden Tears'
// post at the ford's head; blocks filled by core/city's frontage-courts with the Xanadu kit's houses. Outside the town, placed as
// hosts in the same instance: the footbridge's spans, the watermill on its race, the terraced fields and farmsteads on the
// slope behind, the dugouts drawn up by the ford. At the fall's foot, in its own precinct (OF.PRECINCT; PLAN.md step OF1b): the
// Iridescent Order's house from its blueprint (iridescent/BLUEPRINT.md), hand-placed records on platforms graded into the ground
// (OF.HOUSE, ofH), none of the town's in it.
var OF={SEED:96413,PIN:[969,1634],Y0:-13,DOWN:[-11,-8.5],
 RIVER:{hw:26,depth:2.4,ford:{hw:18,depth:1.8,len:110},meander:[30,1300,200]},
 REACH:{slack:[-1500,2500],slackRise:.0008,down:.012,up:.009,fall:{z:3100,h:20,len:90,gorge:420}},
 NE:{bank:1.6,riser:[260,380],riserH:7.4,benchRise:.008,slopeAt:1100,slope:.045},
 SW:{bank:1.6,flats:130,spur:320,spurK:1800},
 TOWN:{o:[700,0],half:900,bank:460,high:620,back:800,z:[-440,440],cross:[-300,-140,140,300]},
 SQUARE:{x:[470,602],z:[16,128]},
 PRECINCT:{x:[90,560],z:[2580,3045]},
 /* the Iridescent Order's house (settlements/opal-ford/iridescent/BLUEPRINT.md): its site frame is u = z - 2860, v = x - 300;
    the Bow Terrace levelled, the four cell terraces graded 2.2 m apart below it and the pool's ledge below them */
 HOUSE:{z0:2860,x0:300,bow:{u:[20,140],v:[-62,-22]},terr:[-70,-105,-140,-175],cut:2.2,tu:[88,174],ledge:{u:[143,180],v:[-214,-203],below:10},blend:5}};
const ofSm=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);};
const ofD=(v,d)=>v==null?d:v;
// the river: its line (x of the channel's middle at z), its half-width and depth (the ford widens and shoals it)
const ofRiverX=z=>{const M=OF.RIVER.meander;return M[0]*Math.sin((z-M[2])/M[1]);};
const ofFord=z=>Math.exp(-(z*z)/(OF.RIVER.ford.len*OF.RIVER.ford.len));
const ofFallNear=z=>Math.exp(-Math.pow((z-OF.REACH.fall.z)/160,2));
const ofHW=z=>OF.RIVER.hw+OF.RIVER.ford.hw*ofFord(z)-8*ofFallNear(z);
const ofDepth=z=>OF.RIVER.depth-OF.RIVER.ford.depth*ofFord(z);
// the water's surface at z: the slack reach at the town, the rapids below and above it, the bow's fall
function ofW(z){const R=OF.REACH,s=R.slack,F=R.fall;let y;
 if(z<s[0])y=s[0]*R.slackRise+(z-s[0])*R.down;else if(z<=s[1])y=z*R.slackRise;else y=s[1]*R.slackRise+(z-s[1])*R.up;
 return y+F.h*ofSm(F.z-F.len/2,F.z+F.len/2,z);}
// the valley's floor level at z: the water's, but the fall's step taken earlier (the banks stand over the river below it: the gorge)
function ofFloor(z){const F=OF.REACH.fall;return ofW(z)-F.h*ofSm(F.z-F.len/2,F.z+F.len/2,z)+F.h*ofSm(F.z-F.gorge,F.z+F.len/2,z);}
// the ground's height at page (x, z): the channel, then each bank's profile from the channel's edge (e metres out)
// the ground with the Iridescent Order's platforms graded into it (OF.HOUSE): the Bow Terrace levelled at its middle's height,
// the four cell terraces 2.2 m apart below it, the pool's ledge 10 m below it; each a level platform blended into the bank over
// OF.HOUSE.blend metres at its edges (cut where the bank stands higher, filled where it stands lower)
let ofBowY=null;
function ofHouseRects(){const Hh=OF.HOUSE,R=[{u:Hh.bow.u,v:Hh.bow.v,drop:0}];
 Hh.terr.forEach((vt,k)=>R.push({u:Hh.tu,v:[vt-17,vt+(k?18:2)],drop:Hh.cut*(k+1)}));
 R.push({u:Hh.ledge.u,v:Hh.ledge.v,drop:Hh.ledge.below});return R;}
const OF_HOUSE_RECTS=ofHouseRects();
function ofH(x,z){const y=ofHbare(x,z),Hh=OF.HOUSE,u=z-Hh.z0,v=x-Hh.x0;
 if(u<Hh.bow.u[0]-Hh.blend||u>Hh.ledge.u[1]+Hh.blend||v<Hh.ledge.v[0]-Hh.blend||v>Hh.bow.v[1]+Hh.blend)return y;
 if(ofBowY==null)ofBowY=ofHbare(Hh.x0+(Hh.bow.v[0]+Hh.bow.v[1])/2,Hh.z0+(Hh.bow.u[0]+Hh.bow.u[1])/2);
 const b=Hh.blend;let bw=0,bl=0;for(const r of OF_HOUSE_RECTS){if(u<r.u[0]-b||u>r.u[1]+b||v<r.v[0]-b||v>r.v[1]+b)continue;
  const w=ofSm(-b,0,u-r.u[0])*ofSm(-b,0,r.u[1]-u)*ofSm(-b,0,v-r.v[0])*ofSm(-b,0,r.v[1]-v);
  if(w>bw){bw=w;bl=ofBowY-r.drop;}}   /* the platform it stands most within: adjacent terraces meet in a riser */
 return bw>0?y+(bl-y)*bw:y;}
function ofHbare(x,z){const w=ofW(z),c=ofRiverX(z),hw=ofHW(z),d=x-c,a=Math.abs(d);
 if(a<hw){const t=a/hw;return w-ofDepth(z)*(1-t*t);}
 const e=a-hw,L=ofFloor(z),lift=Math.max(0,L-w),N=OF.NE,S=OF.SW;
 let y=w+(lift+N.bank)*ofSm(0,14+2*lift,e);
 if(d>0){y+=N.riserH*ofSm(N.riser[0],N.riser[1],e)+N.benchRise*Math.max(0,Math.min(e,N.slopeAt)-N.riser[1]);
  if(e>N.slopeAt)y+=N.slope*(e-N.slopeAt)*ofSm(N.slopeAt,N.slopeAt+200,e);}
 else y+=S.spur*(1-Math.exp(-Math.max(0,e-S.flats)/S.spurK))*ofSm(S.flats,S.flats+80,e);
 /* a little relief on the slopes (none on the flats or the bench, where the town and the paddies stand level) */
 const rough=d>0?ofSm(N.slopeAt,N.slopeAt+400,e):ofSm(S.flats+60,S.flats+300,e);
 return y+rough*(3.2*Math.sin(x/173+z/241)+2.1*Math.sin(x/97-z/133+1.7));}
// on the page: the ground every builder and the camera read, and the core/tags registry under the town's name (91t takes it up)
if(typeof VERN!=='undefined'){terrainH=ofH;if(typeof KTAGS!=='undefined')KTAGS.page=KTAGS.page||KTAGS.create({build:'opal-ford'});}
// THE WORLD'S FRAME (step OF2 fits the ground to the Siqārp region's; core/world/bake_towns.py will sample ofH through it): page
// +z is the river's way up (the reverse of OF.DOWN on the map, x east and z south), +x the north-east bank; the ford on the pin
function ofToWorld(x,z){const L=Math.hypot(OF.DOWN[0],OF.DOWN[1]),uz=[-OF.DOWN[0]/L,-OF.DOWN[1]/L],ux=[-uz[1],uz[0]];
 return[x*ux[0]+z*uz[0],x*ux[1]+z*uz[1],ofH(x,z)+OF.Y0];}

// ---------------------------------------------------------------- the town's tune record (core/region/data/xan-tune.js, read in place)
const OF_TUNE=(typeof XAN_TUNE!=='undefined'&&XAN_TUNE.opalford)||{id:'sopalford01',people:1500};

// ---------------------------------------------------------------- the kit: the Xanadu kit's defs (VERN.defs on the page)
const ofDims=(key,v)=>{const D=(typeof VERN!=='undefined'&&VERN.defs&&VERN.defs[key])||(typeof OF_KIT_DIMS!=='undefined'&&OF_KIT_DIMS[key]);
 return D?{key,v:v==null?0:v,w:D.w,d:D.d,h:D.h==null?8:D.h}:null;};
// the pools (as Phēr's): the bank's ferrymen and fishers in the poor houses and workshops, the high street's shops and middling
// houses, the back streets poor, a few rich houses by the temple; a quarter of the poor and middling the Andean set
const OF_POOLS={
 bank:[['xa_poor_a',2],['xa_poor_b',2],['xa_poor_c',3],['xa_andean_poor',2],['xa_workshop',1]],
 market:[['xa_shops',3],['xa_shop_turk_a',2],['xa_shop_turk_b',1],['xa_teahouse',1],['xa_workshop',1],['xa_mid_a',1]],
 middle:[['xa_mid_a',3],['xa_mid_b',2],['xa_mid_c',2],['xa_andean_mid',2],['xa_house_turk_a',2],['xa_shops',1]],
 rich:[['xa_rich_a',2],['xa_rich_c',2],['xa_andean_rich',1],['xa_house_turk_b',2]],
 poor:[['xa_poor_a',2],['xa_poor_b',2],['xa_poor_c',3],['xa_andean_poor',3]]};
const OF_SMALL={bank:[['xa_poor_c',1]],market:[['xa_poor_c',1]],middle:[['xa_poor_c',1],['xa_mid_a',1]],rich:[['xa_mid_a',1]],poor:[['xa_poor_c',1]]};
const OF_GAPS={bank:[3,7],market:[2,5],middle:[4,9],rich:[8,14],poor:[4,9]};
const OF_PEOPLE={xa_poor_a:7,xa_poor_b:7,xa_poor_c:5,xa_andean_poor:6,xa_mid_a:7,xa_mid_b:8,xa_mid_c:9,xa_andean_mid:8,xa_house_turk_a:8,
 xa_rich_a:14,xa_rich_b:16,xa_rich_c:12,xa_andean_rich:12,xa_house_turk_b:10,xa_shops:4,xa_shop_turk_a:4,xa_shop_turk_b:4,xa_workshop:4,xa_teahouse:3};
const ofTune=half=>({cell:2.5,rasterHalf:half,maxSlope:.3,exact:true,
 width:{avenue:10,main:8,side:5.5,alley:3,highway:10,lane:4.5},lot:{side:1.6,setback:1.4,rear:3,inset:1,step:3},
 classes:{rich:[['xa_rich_a',0]],middle:[['xa_mid_a',0],['xa_mid_c',0]],poor:[['xa_poor_c',0]]},fallback:{rich:'middle',middle:'poor',poor:null},
 civic:[],civicSpacing:120,voidMax:40,voidIters:0,voidBatch:0,sideSpacing:48,sideMax:200,alleyFrac:.25,blindMax:90,interiorDepth:9,interiorRounds:0,
 avenueSnap:60,ringGap:8,verge:7,wall:{},plazaArt:{},mapHalf:half,stance:'high',stanceOpt:{maxDrop:9}});
const OF_L={o:OF.TOWN.o,h:(x,z)=>ofH(x+OF.TOWN.o[0],z+OF.TOWN.o[1]),P:(x,z)=>[x-OF.TOWN.o[0],z-OF.TOWN.o[1]]};

// ---------------------------------------------------------------- the hosts: placed first, each stamped HARD
// [key, x, z (page), ry (the front's angle: 0 toward +z, up the river; -PI/2 toward the river), why, v, kind, y (a fixed floor
// over the water's level at z: the spans and the boats)]
const OF_SPAN_Z=-220,OF_DUG_X=z=>ofRiverX(z)+ofHW(z)-1.5;
const OF_HOSTS=(function(){const H=[],P2=Math.PI/2,c=ofRiverX(OF_SPAN_Z);
 H.push(['xa_caravanserai',530,-96,0,'the han at the ford: the opal road\'s stage (road.lw-ks), its gate on the ford street',0,'civic']);
 H.push(['xa_corral',488,-162,0,'the han\'s mule yard',0,'civic']);
 H.push(['xa_temple',705,72,-P2,'the temple of the Decree, above the square',0,'civic']);
 H.push(['xa_guild_farm',705,-80,-P2,'the grain office (the paddies\' tithe)',0,'civic']);
 H.push(['xa_teahouse',486,150,Math.PI,'the square\'s teahouse',0,'civic']);
 H.push(['xa_shops',560,152,Math.PI,'the square\'s bazaar row',0,'civic']);
 H.push(['xa_customs_house',332,-46,0,'the toll house at the ford\'s head: the Sultan\'s factor counts what crosses',1,'civic']);
 H.push(['xa_watch',332,50,Math.PI,'the Golden Tears\' post: the opal\'s escort (T.tears)',0,'civic']);
 for(let i=0;i<4;i++)H.push(['xa_granary',900+(i%2)*26,-420+Math.floor(i/2)*26,0,'a granary (the paddies\' rice)',0,'civic']);
 H.push(['xa_watermill',262,780,-P2,'the watermill on its race from the weir',0,'civic']);
 /* the footbridge for the wet months: three spans over the channel a little below the ford, on the water (its deck over the flood) */
 for(let i=-1;i<=1;i++)H.push(['xa_river_span',c+i*26,OF_SPAN_Z,P2,'the footbridge beside the ford (the wet months)',0,'bridge',2.2]);
 /* the dugouts drawn up on the north-east bank above the ford, bows to the water */
 for(let i=0;i<8;i++){const z=60+i*16;H.push(['xa_dugout',OF_DUG_X(z),z,P2+(i%3-1)*.12,'a dugout drawn up by the ford',2,'boat',.25]);}
 /* the terraced fields on the slope behind the town and their farmsteads (the plan: the terraces on the rise behind) */
 /* in bands along the slope's contours, a field left fallow or kept as orchard here and there, each set a little off its band (KRAND by its cell) */
 for(let j=0;j<13;j++)for(let i=0;i<5;i++){const r=KRAND.hash(OF.SEED,71,i,j);if(r%5===0)continue;
  const x=1210+i*74+((r>>>3)%13)-6,z=-600+j*100+((r>>>7)%25)-12;H.push(['xa_farm',x,z,-P2,'terraced fields on the slope behind the town',0,'farm']);}
 for(const z of[-650,-250,150,550])H.push(['xa_farmhouse',1135,z,-P2,'a farmstead on the slope',0,'farm']);
 return H;})();
function ofPlaceHosts(spec){const K=KCITY.lib,SLx=K.SL,PLAN_=K.plan(),L=OF_L,out=[];
 for(const [key,px,pz,ry,why,v0,kind,fy] of spec){const v=v0|0,D=ofDims(key,v);if(!D){out.push({key,err:'no def'});continue;}
  const q=L.P(px,pz),u=[Math.cos(ry),-Math.sin(ry)],o=K.obb(q,u,D.w/2,D.d/2);
  const lot={id:PLAN_.lots.length,cls:'landmark',role:why,key,v,slot:0,wealth:1,x:q[0],z:q[1],y:0,ry,w:D.w,d:D.d,h:D.h,lot:o,bo:o,way:-1,side:0,s:0,born:1,died:null,civic:true,why,ofKind:kind};
  if(fy!=null)lot.y=ofW(pz)+fy;
  else{const st=KCITY.stance(o,(a,b)=>L.h(a,b),{maxDrop:24});lot.y=st?st.y:L.h(q[0],q[1]);if(st)lot.drop=st.drop;}
  PLAN_.lots.push(lot);SLx.hashLot(lot);SLx.register(lot);SLx.R.stampPoly(K.obbCorners(K.obb(q,u,D.w/2+3,D.d/2+3)),K.OCC.HARD,lot.id);out.push(lot);}
 return out;}

// ---------------------------------------------------------------- the town's steps on core/city
const ofLine=(x0,z0,x1,z1,step)=>{const n=Math.max(1,Math.round(Math.hypot(x1-x0,z1-z0)/step)),P=[];for(let i=0;i<=n;i++)P.push(OF_L.P(x0+(x1-x0)*i/n,z0+(z1-z0)*i/n));return P;};
function ofSteps(){const T=OF.TOWN,K=()=>KCITY.lib,SQ=OF.SQUARE;return[
 {name:'the ground',run(C){const k=K(),R=k.SL.R=new k.Raster(C.tune.rasterHalf,C.tune.cell);R.occ.fill(k.OCC.OUT);
   const Z=[OF_L.P(T.bank-14,T.z[0]),OF_L.P(T.back+14,T.z[0]),OF_L.P(T.back+14,T.z[1]),OF_L.P(T.bank-14,T.z[1])];
   k.SL.R.land=KCITY.site.zoneRaster(R,Z,{dry:1,h:OF_L.h});k.SL.minSpacing=KCITY.site.minSpacing();k.plan().zone=Z;
   const S=[OF_L.P(SQ.x[0],SQ.z[0]),OF_L.P(SQ.x[1],SQ.z[0]),OF_L.P(SQ.x[1],SQ.z[1]),OF_L.P(SQ.x[0],SQ.z[1])];
   R.stampPoly(S,k.OCC.GREEN,-1);k.plan().greens.push({id:0,kind:'plaza',poly:S,district:'the market square',born:1});}},
 {name:'the hosts',run(C){OF_TOWN.hosts=ofPlaceHosts(OF_HOSTS);}},
 {name:'the streets',run(C){const S=K().SL;
   S.addWay('main',ofLine(T.high,T.z[0],T.high,T.z[1],40),3,{tag:'the high street (the road from Gihon up the valley)'});
   S.addWay('side',ofLine(T.bank,T.z[0]+60,T.bank,T.z[1]-60,40),3,{tag:'the bank street'});
   S.addWay('lane',ofLine(T.back,T.z[0]+40,T.back,T.z[1]-40,40),3,{tag:'the back lane'});
   for(const z of T.cross)S.addWay('lane',ofLine(T.bank,z,T.back,z,40),3,{tag:'cross lane '+z});
   S.addWay('avenue',ofLine(T.back,0,T.bank,0,40),3,{tag:'the ford street'});}},
 {name:'frontage and courts',run(C){const blocks=[],X=[T.bank,T.high,T.back],Zs=[T.z[0]+40].concat(T.cross.filter(z=>z<0),[0],T.cross.filter(z=>z>0),[T.z[1]-40]);
   for(let j=0;j<Zs.length-1;j++)for(let i=0;i<X.length-1;i++){const x0=X[i],x1=X[i+1],z0=Zs[j],z1=Zs[j+1],cz=(z0+z1)/2;
    if(i===0&&z0>=0&&z1<=Math.max(SQ.z[1],140))continue;   /* the square */
    const near=Math.abs(cz)<220,kind=i===0?(near?'market':'bank'):(Math.abs(cz)<150?'rich':near?'middle':'poor');
    const e=i===0?5:4.5,poly=[[x0+e,z0+e],[x1-e,z0+e],[x1-e,z1-e],[x0+e,z1-e]].map(p=>OF_L.P(p[0],p[1]));
    blocks.push({id:'of-'+i+'-'+j,i,j,poly,kind,lanes:false});}
   OF_TOWN.blocks=blocks;
   OF_TOWN.courts=KCITY.strategies['frontage-courts'].run(blocks,{step:6,seed:OF.SEED,focus:OF_L.P(560,60),pools:OF_POOLS,small:OF_SMALL,gaps:OF_GAPS,
    garden:{rich:.35,middle:.3,market:.1,bank:.22,poor:.3},infill:{step:12,yard:.5}});}}];}

// ---------------------------------------------------------------- the ford, the weirs, the paddies, the roads outside the town
// the paved ford (a causeway under the slack water and stepping stones beside it: the kit has no ford yet, xa_ford is owed: 90r
// draws it from this record); the mill's weir across the river and its race; the fish weirs (stake fences in a V, pointing
// downstream, below the town)
function ofWorks(){const c0=ofRiverX(0),hw0=ofHW(0),W={};
 W.ford={z:0,x0:c0-hw0-4,x1:c0+hw0+4,w:5,top:-.15,stones:{step:1.3,top:.22}};
 const zw=840,cw=ofRiverX(zw),hww=ofHW(zw);W.weir={z:zw,x0:cw-hww-2,x1:cw+hww+2,w:3,top:.5};
 W.race=[[cw+hww+2,zw],[220,812],[244,792]];W.tail=[[262,756],[150,700],[ofRiverX(690)+ofHW(690)-1,690]];
 W.fishWeirs=[-560,-820,-1080].map((z,i)=>{const c=ofRiverX(z),hw=ofHW(z),tip=z-30;return{z,pts:[[c-hw+4,z],[c+(i%2?-8:8),tip],[c+hw-4,z]]};});
 /* the paddies: banded cells on the flats along both banks (each a level basin), the ford street, the toll house, the mill and
    its race left out; the north-east bank's flats 12 to 250 m out of the channel's edge, the south-west's 12 to 120 m */
 const P=[],cell=50;
 for(let z=-1400;z<1400;z+=cell){const z1=z+cell,mid=z+cell/2;
  if(Math.abs(mid)<90||(mid>700&&mid<880)||(mid>OF_SPAN_Z-40&&mid<OF_SPAN_Z+40))continue;
  for(const [side,bands] of[[1,[[14,130],[130,248]]],[-1,[[14,118]]]])for(const [e0,e1] of bands){
   const at=(zz,e)=>{const c=ofRiverX(zz),hw=ofHW(zz);return[c+side*(hw+e),zz];};
   P.push({id:'paddy:'+(side>0?'ne':'sw')+':'+z+':'+e0,side,poly:[at(z+2,e0),at(z+2,e1),at(z1-2,e1),at(z1-2,e0)],y:ofW(mid)+OF.NE.bank-.25});}}
 W.paddies=P;
 /* the roads outside the town, in page metres: the valley road down to Gihon on the north-east bench; the river road up to the
    fall (the precinct's way); the ford street's lower half to the water; and over the ford the road up the south-west bank */
 const T=OF.TOWN,cw0=ofRiverX(0);
 W.roads=[{tag:'the valley road down to Gihon',w:6,pts:[[T.high,T.z[0]],[600,-1100],[560,-1520]]},
  {tag:'the river road up to the fall',w:5,pts:[[T.high,T.z[1]],[580,1180],[500,1800],[430,2400],[400,OF.PRECINCT.z[0]]]},
  {tag:'the ford street to the water',w:8,pts:[[T.bank,0],[300,0],[cw0+hw0+2,0]]},
  {tag:'the opal road up the south-west bank',w:6,pts:[[cw0-hw0-2,0],[-150,120],[-215,700],[-235,1500],[-255,2400],[-300,3500]]}];
 return W;}

// ---------------------------------------------------------------- THE IRIDESCENT ORDER'S HOUSE (iridescent/BLUEPRINT.md; PLAN.md step OF1b)
// The blueprint's buildings as records in its site frame (u up the river, v north-east: page x = v + 300, z = u + 2860), each
// the kit piece that stands for it: the Qiblai kit's great monastery in the Turquoise dress (o.v 4) for sheets M1-MR, its gate
// north-east and the Hall of the Bow toward the spray; the house of studies as the kit's college, a gate temple and four lodges
// round the debate court (H1, H2: the kit has no 12 m range, the lodges stand for the dormitories); the cells as the kit's kora
// arcades on the four graded terraces (C: no cell-range piece yet), a chorten at each terrace's fall end; the guest house as the
// kit's caravanserai, the infirmary and the Prismarch's Lodge as its lodges, the service court in the Xanadu kit's pieces (G);
// eight chortens down the Way of the Colours; the Bridge of the Spray (two spans) below the pool and the chorten on the far lip.
// [key, u, v, facing ('+u' up the river, '-u' down it, '+v' away from the river, '-v' toward it), why, o.v, fy (a fixed floor
// over the water: the spans)]
const OF_FACE={'+u':0,'-u':Math.PI,'+v':Math.PI/2,'-v':-Math.PI/2};
const OF_HOUSE_SPEC=(function(){
 const S=[],TR=OF.HOUSE.terr;
 S.push(['qb_monastery',50,20,'+v','the great monastery: the Hall of the Bow under the gilt crown, the Gallery of the Bow in moonglass facing the spray (sheets M1, M2, MR)',4]);
 S.push(['qb_wheel_house',36,80,'+u','the forecourt\'s wheel house',0],['qb_wheel_house',64,80,'-u','the forecourt\'s wheel house',0],['qb_chorten',50,86,'-v','the eighth chorten, before the Gate of the White Light',0]);
 S.push(['qb_guild_lodge',107,43,'-u','the Prismarch\'s Lodge: kept for the Prismarch of the Turquoise spoke on his way to Qiblai',0]);
 TR.forEach((vt,k)=>{S.push(['qb_kora_arcade',107.2,vt-4,'-v','terrace '+(k+1)+': the cells (the kit\'s kora arcade stands for the cell range)',0],
  ['qb_kora_arcade',131.6,vt-4,'-v','terrace '+(k+1)+': the cells',0],['qb_chorten',157,vt-5,'-v','terrace '+(k+1)+'\'s shrine, in '+['red','orange and yellow','green and turquoise','blue and violet'][k],0]);});
 S.push(['qb_gate_temple',-110,150,'-v','the Gate of the Novices (the house of studies, sheet H1)',0],['qb_college',-110,201,'-v','the school of the divided light: lecture halls, the library, the scriptorium',0],
  ['qb_guild_lodge',-140,160,'+u','a novices\' lodge (the dormitories, sheet H2)',0],['qb_guild_lodge',-140,200,'+u','a novices\' lodge',0],
  ['qb_guild_lodge',-80,160,'-u','a novices\' lodge',0],['qb_guild_lodge',-80,200,'-u','the masters\' lodge',0],['qb_chorten',-110,171.5,'-v','the prism pillar of the debate court',0]);
 S.push(['qb_gate_temple',-273,111,'-u','the Gate of the Road, on the river road from the town',0],['qb_caravanserai',-229,168,'-v','the guest house: the pilgrims and the opal road\'s travellers, its stable court',0],
  ['qb_guild_lodge',-173,170,'-u','the infirmary',0],['qb_guild_lodge',-173,196,'-u','the apothecary',0],
  ['xa_guild_farm',-46,142,'-v','the monks\' refectory (the Song read at meals)',0],['qb_bakery',-16,142,'-v','the great kitchen',0],
  ['xa_granary',-50,184,'-v','the granary (the town\'s rice tithe)',0],['xa_granary',-28,184,'-v','the stores',0],['qb_workshop',-6,184,'-v','the laundry and dye house',0],
  ['qb_workshop',-50,216,'-v','the Prism Workshop: the Glaziers\' lodge',0],['qb_workshop',-34,216,'-v','the glass store',0]);
 [['xa_poor_c',-140],['xa_poor_a',-121],['xa_poor_b',-100],['xa_poor_c',-81]].forEach(([k,u])=>S.push([k,u,242,'-v','a lay servant\'s house',0]));
 for(let k=0;k<8;k++)S.push(['qb_chorten',-250+23*k,128,'-v','a chorten of the Way of the Colours: '+['red','orange','yellow','green','turquoise','blue','violet','white'][k],0]);
 return S;})();
function ofHouse(){const K=KCITY.lib,Hh=OF.HOUSE,out=[],errs=[];
 const put=(key,x,z,ry,why,v0,kind,fy)=>{const v=v0|0,D=ofDims(key,v);if(!D){errs.push(key);return;}
  const u=[Math.cos(ry),-Math.sin(ry)],o=K.obb([x,z],u,D.w/2,D.d/2);let y,drop=0;
  if(fy!=null)y=ofW(z)+fy;else{const st=KCITY.stance(o,ofH,{maxDrop:24});y=st?st.y:ofH(x,z);if(st)drop=st.drop||0;}
  out.push({id:'house:'+out.length,key,v,x,z,ry,w:D.w,d:D.d,h:D.h,o:{v,y},kind,why,court:null,bo:{c:[x,z],u:o.u,hw:D.w/2,hd:D.d/2},drop});};
 for(const [key,su,sv,f,why,v] of OF_HOUSE_SPEC)put(key,sv+Hh.x0,su+Hh.z0,OF_FACE[f],why,v,'order');
 /* the Bridge of the Spray below the pool, and the chorten on the far lip where the kora turns */
 const zb=Hh.z0+165,cb=ofRiverX(zb),hwb=ofHW(zb);
 for(const i of[-1,1])put('xa_river_span',cb+i*13,zb,Math.PI/2,'the Bridge of the Spray: the kora crosses below the pool',0,'bridge',4);
 put('qb_chorten',cb-hwb-34,zb,Math.PI/2,'the chorten on the far lip, facing the fall: the kora turns here',0,'order');
 /* the pavings and the kora's paths, in page metres (drawn by 90q's paint and 90r) */
 const P=(u,v)=>[v+Hh.x0,u+Hh.z0],rect=(us,vs)=>[P(us[0],vs[0]),P(us[1],vs[0]),P(us[1],vs[1]),P(us[0],vs[1])];
 const pav=[{what:'the Bow Terrace',poly:rect(Hh.bow.u,Hh.bow.v)},{what:'the forecourt',poly:rect([30,70],[48,92])},{what:'the pool\'s ledge',poly:rect(Hh.ledge.u,Hh.ledge.v)}]
  .concat(Hh.terr.map((vt,k)=>({what:'terrace '+(k+1)+'\'s walk',poly:rect([92,170],[vt-15,vt-9])})));
 const ways=[{cls:'path',w:6,tag:'the Way of the Colours',pts:[P(-268,110),P(-60,110),P(20,96),P(50,62)]},
  {cls:'path',w:3,tag:'the Kora of the Falls: down the Spray Stair',pts:[P(140,-42),P(166,-48),P(166,-208),P(160,-210)]},
  {cls:'path',w:3,tag:'the kora up the far bank',pts:[[cb-hwb-2,zb],[cb-hwb-30,zb]]}];
 return{place:out,errs,pavings:pav,ways,tank:rect([-60,-20],[72,98]),bridge:{z:zb}};}

// ---------------------------------------------------------------- run the plan
var OF_TOWN={},OF_PLACE=[],OF_WORKS=null,OF_HOUSE=null,OF_ERR=null;
function ofRun(){
 const C=KCITY.create({name:'opal-ford',tune:ofTune(OF.TOWN.half),seed:OF.SEED,ground:{h:OF_L.h},kit:{dims:ofDims},rand:'krand',index:{order:'insertion'},steps:ofSteps()});
 OF_TOWN.C=C;OF_TOWN.plan=C.run();OF_WORKS=ofWorks();
 for(const T of OF_TOWN.plan.lots){if(T.died!=null||!T.bo)continue;const q=[T.x+OF_L.o[0],T.z+OF_L.o[1]];
  OF_PLACE.push({id:'town:'+T.id,key:T.key,v:T.v|0,x:q[0],z:q[1],ry:T.ry,w:T.w,d:T.d,h:T.h,o:{v:T.v|0,y:T.y==null?ofH(q[0],q[1]):T.y},
   kind:T.cls==='landmark'?(T.ofKind||'civic'):'house',why:T.why||T.role||null,court:T.court||null,bo:{c:q,u:T.bo.u,hw:T.bo.hw,hd:T.bo.hd},drop:T.drop||0});}
 OF.ways=OF_TOWN.plan.ways.map(w=>({cls:w.cls,w:w.w,tag:w.tag,pts:w.pts.map(p=>[p[0]+OF_L.o[0],p[1]+OF_L.o[1]]),closed:w.closed}))
  .concat(OF_WORKS.roads.map(r=>({cls:'road',w:r.w,tag:r.tag,pts:r.pts})));
 /* the Iridescent Order's house, after the town (its records in OF_PLACE with kind 'order' and 'bridge', its paths with the ways) */
 OF_HOUSE=ofHouse();for(const p of OF_HOUSE.place)OF_PLACE.push(p);OF.ways=OF.ways.concat(OF_HOUSE.ways);
 /* the people: each house's household by its key (the tune's 1,500, within 25 %), the hosts none */
 let people=0;for(const p of OF_PLACE)if(p.kind==='house')people+=ofD(OF_PEOPLE[p.key],5);
 OF.people={total:people,tune:OF_TUNE.people};
 return OF_PLACE;}
try{ofRun();}catch(e){OF_ERR=String(e&&e.stack||e);if(typeof reportErr==='function')reportErr('Ōpal-Phōrḍ plan: '+OF_ERR);}

// ---------------------------------------------------------------- the flora's mask (the Vale of Xanadu biome Xanadu's page carries)
// From the plan's records, never from pixels: the south-west spur wooded (.75), the gorge below the fall (.9), the slope behind
// the town between the terraces (.3), the bench's yards (.05), the flats' bunds bare (.04); never in the river, on a way, in a
// paddy, in the precinct's clearing or within a building's footprint (core/space's indexes of what the plan places)
function ofInPoly(p,P){let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if(((a[1]>p[1])!==(b[1]>p[1]))&&(p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0]))c=!c;}return c;}
function ofBioMaskMake(){const S=KCITY.lib.KSPACE,B=S.create({cell:40}),W=S.create({cell:60}),Pd=S.create({cell:60});
 for(const p of OF_PLACE)B.insert(p,p.x,p.z,Math.hypot(p.bo.hw,p.bo.hd)+1.5);
 for(const w of OF.ways)for(let i=1;i<w.pts.length;i++){const a=w.pts[i-1],b=w.pts[i];W.insert({a,b,r:w.w/2+1.5},(a[0]+b[0])/2,(a[1]+b[1])/2,Math.hypot(b[0]-a[0],b[1]-a[1])/2+w.w);}
 for(const q of OF_WORKS.paddies){const xs=q.poly.map(p=>p[0]),zs=q.poly.map(p=>p[1]);Pd.insert(q,(Math.min(...xs)+Math.max(...xs))/2,(Math.min(...zs)+Math.max(...zs))/2,60);}
 const PR=OF.PRECINCT,T=OF.TOWN;
 return function(x,z){const c=ofRiverX(z),hw=ofHW(z),d=x-c,e=Math.abs(d)-hw;if(e<3)return 0;
  for(const q of W.query(x,z,1)){const dx=q.b[0]-q.a[0],dz=q.b[1]-q.a[1],L2=Math.max(1e-9,dx*dx+dz*dz);let t=((x-q.a[0])*dx+(z-q.a[1])*dz)/L2;t=t<0?0:t>1?1:t;if(Math.hypot(q.a[0]+dx*t-x,q.a[1]+dz*t-z)<q.r)return 0;}
  for(const p of B.query(x,z,1))if(Math.abs((x-p.x)*p.bo.u[0]+(z-p.z)*p.bo.u[1])<p.bo.hw+1.5&&Math.abs(-(x-p.x)*p.bo.u[1]+(z-p.z)*p.bo.u[0])<p.bo.hd+1.5)return 0;
  for(const q of Pd.query(x,z,1))if(ofInPoly([x,z],q.poly))return 0;
  if(x>PR.x[0]&&x<PR.x[1]&&z>PR.z[0]&&z<PR.z[1]){                                              /* the house's grounds (sheet S0) */
   const u=z-OF.HOUSE.z0,v=x-OF.HOUSE.x0,inR=(u0,u1,v0,v1)=>u>u0&&u<u1&&v>v0&&v<v1;
   if(inR(-262,-80,-150,96))return .5;if(inR(-262,-150,-210,-158))return .3;if(inR(92,150,66,124))return .22;if(inR(-60,14,-60,60))return .12;return .03;}
  const F=OF.REACH.fall;if(z>F.z-F.gorge-200&&z<F.z+300&&e<160)return .9;                      /* the gorge below the fall and its lip */
  if(d<0)return e<OF.SW.flats?.06:.75;                                                          /* the south-west bank: its flats, the spur */
  if(x>T.bank-20&&x<T.back+20&&z>T.z[0]&&z<T.z[1])return .05;                                    /* a yard in the town */
  if(e<OF.NE.riser[0])return .04;if(e<OF.NE.riser[1]+20)return .35;return e<OF.NE.slopeAt?.12:.3;};}
if(typeof BIO!=='undefined'&&BIO.host&&typeof VERN!=='undefined'&&!OF_ERR){
 Object.assign(BIO.host,{mask:ofBioMaskMake(),origin:[[600,0],[300,1500],[-400,600]],center:[400,800],
  fields:{wet:(x,z)=>Math.min(1,.55+Math.max(0,1-Math.abs(x-ofRiverX(z))/160)*.45),salt:()=>0,upland:(x,z)=>x-ofRiverX(z)>OF.NE.slopeAt?.3:0,
   flow:(x,z)=>Math.max(0,1-(Math.abs(x-ofRiverX(z))-ofHW(z))/30),mist:(x,z)=>Math.max(0,1-Math.hypot(x-ofRiverX(z),z-OF.REACH.fall.z)/220)}});}
if(typeof window!=='undefined')window._opalford={placed:OF_PLACE.length,err:OF_ERR,people:OF.people,
 hosts:OF_PLACE.filter(p=>p.kind!=='house').length,houses:OF_PLACE.filter(p=>p.kind==='house').length,
 blocks:(OF_TOWN.blocks||[]).length,ways:(OF.ways||[]).length,paddies:OF_WORKS?OF_WORKS.paddies.length:0,
 house:OF_HOUSE?{placed:OF_HOUSE.place.length,errs:OF_HOUSE.errs,bow:ofBowY}:null};
