// ================================================================= HOST — stage (station 2b, the Bowl's second: Mantis's green pocket, PLAN-BOWL.md)
// The Bowl's one lush place (the owner, 2026-10-26: a station near Mantis "where the flora actually gets somewhat lush"). On the
// south-west shore of the Bowl's salt lake two green pockets of monsoon forest and savanna (Am, Aw; ~1,000-1,550 mm against the
// shore's 300) hold where springs come up at the foot of the higher ground; Mantis, the oasis town (an Iziz holding grown under
// Yuni's influence, its merchant houses Izani: LORE.md 6.2), stands in the wetter, 2 km from the water. This station stands in
// that pocket, a few kilometres north-east of the town, its edge in view: date groves behind mud walls, gardens and their figs,
// the outlying houses (massing only: the town is a settlement's work). It inherits the Bowl's files (station.json "base") and
// writes over its layout, its passes, its build and its views.
//
// THE MAP (x east, z south; R 3000). The scale model's px ~838,830, the lake's surface -990 m (1.83 atm).
//   north-east          THE LAKE beyond a diagonal shore, its shallows banded as at the delta, the springs' plumes in them
//   the shore           a REED SHORE: salt reed and reeds where the springs' water freshens the edge
//   the springs         four pools at the foot of the rise, each feeding a stream to the lake: GALLERY FOREST along them and
//                       round the pools (swlowlands' rainforest strip: kapok, pillar fig, ribbon gum, cane palm: read in
//                       place), the wettest ground a swamp of knees and lilies
//   between             SAVANNA: tall grass, wadi palms, the kit's dragon and bottle trees in their dense-air forms, mesquite
//   the south-west      the EDGE OF MANTIS: walled date groves, gardens with figs, outlying houses, a merchant house's tower,
//                       a domed shrine; the track to the shore
//   the south-east      the pocket ENDS: saltbush and saxaul, then the reg's gravel (the Bowl's desert, as on its station 2)
// ---------------------------------------------------------------- the layout (data)
var SEDESERT_WATER={hue:.44};   /* the springs' clear teal (50-species: the reed accents) */
const TERR={R:3000};
const LAKE={level:-990,name:'The Bowl lake (hypersaline; its surface 990 m under the sea)'};
const SITE={px:838,py:830};
const WIND=(()=>{const x=.34,z=.94,l=Math.hypot(x,z);return[x/l,z/l];})();
// THE SHORE: diagonal, the lake to the north-east; it keeps going for the far country (87)
function zS(x){return -700+.45*x+90*Math.sin(x*.0011+.4)+40*Math.sin(x*.0037+1.2);}
// u: metres south of the shore (along z; the shore is diagonal, so the true distance is u*.91)
const uOf=(x,z)=>z-zS(x);
// THE TOWN (its centre off the map to the south-west) and its edge: gardens and houses, as records (88 draws them)
const TOWN={x:-3300,z:2500,name:'Mantis (its edge): an Iziz holding under the Izani merchant houses, in the Bowl\'s greenest pocket'};
// THE SPRINGS: pools at the foot of the rise, each feeding a stream to the shore
const SPRINGS=[{x:-1150,z:700,r:46},{x:250,z:1150,r:38},{x:-2100,z:-150,r:34},{x:1250,z:1900,r:30}].map((P,i)=>Object.assign(P,{i,name:'A spring pool (fresh water rising at the rise\'s foot)'}));
// THE POCKET: where the springs' water keeps the ground green (1 inside, 0 in the desert beyond the south-east)
const pocketK=(x,z)=>{const dx=(x+400)/3300,dz=(z-600)/2400,d=Math.hypot(dx,dz)*(1+.12*Math.sin(Math.atan2(dz,dx)*3+1)+.08*(fbm(x*.0009,z*.0009,1801,2)-.5));return smooth(1.12,.82,d);};
// the rise the town and the springs stand under (south-west), and the reg's slope beyond the pocket
const riseK=(x,z)=>smooth(-200,-3200,x-.6*z+600);
function baseH(x,z){const u=uOf(x,z);
 if(u<0){const d=-u;return LAKE.level-.15-.6*smooth(0,700,d)-3.4*smooth(500,4000,d)-(fbm(x*.002,z*.002,1802,2)-.5)*.3*smooth(0,200,d);}
 const n1=fbm(x*.0009+3,z*.0009-1,1803,3)-.5,n2=fbm(x*.006,z*.006,1804,2)-.5,ld=smooth(0,250,u);
 let h=LAKE.level-.15+.6*smooth(0,80,u)+.0045*Math.min(u,1800)+.008*Math.max(0,u-1800)+n1*1.6*ld+n2*.3*ld;
 h+=22*riseK(x,z)*smooth(0,600,u);
 // the spring pools: bowls 2.5 m deep
 for(const P of SPRINGS){const d=Math.hypot(x-P.x,z-P.z);if(d<P.r*2.2)h-=2.6*Math.pow(smooth(P.r*2.1,P.r*.4,d),1.4);}
 return h;}
// the old lake's strandlines, as at the delta (core/terrain KBASIN), the same lake and stand
const BASIN=KBASIN.create({seed:1709,age:9000,recession:7000,wind:WIND,strand:{top:7,bottom:1.6,jitter:.45,wmax:1.6,a:.7},yardang:{h:0},
 lakes:[{name:'The Bowl lake at its high stand',kind:'dam',level:-930,sill:-933,ring:2,remnant:LAKE.level,member:()=>1}]});
const _bs={};
function groundH(x,z){return BASIN.land(x,z,baseH(x,z));}
function extraH(x,z,h){return 0;}
// each pool's level: half a metre under its rim
SPRINGS.forEach(P=>{P.level=Math.min(...[0,1,2,3,4,5,6,7].map(k=>groundH(P.x+Math.cos(k*.785)*P.r*1.25,P.z+Math.sin(k*.785)*P.r*1.25)))-.45;});
// THE STREAMS: from each pool down to the lake, wandering; their water from KRELIEF.river under the pool's level
const CHAN=(function(){const out=[];
 SPRINGS.forEach((P,i)=>{const sx=P.x+P.r*.7,sz=P.z-P.r*.5;let x=sx,z=sz;const pts=[[x,z]];
  for(let k=0;k<400;k++){const u=uOf(x,z);if(u<-90)break;const a=Math.atan2(-.91,.41)+.55*Math.sin(k*.09+i*1.7)+.25*Math.sin(k*.31+i);x+=Math.cos(a)*14;z+=Math.sin(a)*14;pts.push([x,z]);}
  out.push({key:'s'+i,name:'A spring stream',w:[12,10,9,8][i],depth:.85,pts});});
 return out;})();
(function(){CHAN.forEach((C,ci)=>{const R=KRELIEF.river(C.pts,groundH,{depth:-.4,sample:6});C.y=R.map(p=>p.y);const top=SPRINGS[ci].level;
 for(let k=0;k<C.y.length;k++){let y=Math.min(C.y[k],top);if(k)y=Math.min(y,C.y[k-1]);C.y[k]=Math.max(y,LAKE.level);}
 const n=C.pts.length;for(let k=n-1;k>=0;k--){const u=uOf(C.pts[k][0],C.pts[k][1]);if(u>100)break;C.y[k]=Math.max(LAKE.level,Math.min(C.y[k],LAKE.level+Math.max(0,u)*.004));}});})();
// THE EDGE OF MANTIS: walled gardens (date groves, fig gardens, kitchen gardens) and outlying houses, each a record drawn from
// its index's hash (core/rand), kept off the streams; the track from the town to the shore
const TOWNREC=(function(){const R=KRAND,h=(i,k)=>R.unit(R.hash(1810,i,k));const gardens=[],houses=[];
 for(let i=0;gardens.length<16&&i<80;i++){const a=-.15+h(i,0)*1.9,d=900+h(i,1)*1500,x=TOWN.x+Math.cos(a)*d,z=TOWN.z-Math.sin(a)*d*.9,w=70+h(i,2)*90,dd=60+h(i,3)*80,rot=.35+(h(i,4)-.5)*.3;
  if(Math.abs(x)>TERR.R-120||Math.abs(z)>TERR.R-120||uOf(x,z)<450)continue;
  if(gardens.some(g=>Math.hypot(g.x-x,g.z-z)<(g.w+w)*.62))continue;
  if(SPRINGS.some(P=>Math.hypot(P.x-x,P.z-z)<P.r*2.6+Math.max(w,dd)*.6))continue;
  const kind=h(i,5)<.5?'dates':h(i,5)<.75?'figs':'kitchen';gardens.push({i,x,z,w,d:dd,rot,kind,name:kind==='dates'?'A walled date grove':kind==='figs'?'A fig garden':'A kitchen garden (melons, greens, henna)'});}
 for(let i=0;houses.length<22&&i<120;i++){const a=-.1+h(i,10)*1.7,d=380+h(i,11)*1000,x=TOWN.x+Math.cos(a)*d,z=TOWN.z-Math.sin(a)*d*.9;
  if(Math.abs(x)>TERR.R-60||Math.abs(z)>TERR.R-60)continue;
  const w=9+h(i,12)*12,dd=8+h(i,13)*10,hh=4+h(i,14)*4;if(houses.some(o=>Math.hypot(o.x-x,o.z-z)<(o.w+w)*.8))continue;if(gardens.some(g=>Math.abs(x-g.x)<g.w*.6+w&&Math.abs(z-g.z)<g.d*.6+dd))continue;
  const kind=houses.length===3?'tower':houses.length===7?'shrine':'house';houses.push({i,x,z,w,d:dd,h:kind==='tower'?22:kind==='shrine'?7:hh,rot:.35+(h(i,15)-.5)*.2,kind,
   name:kind==='tower'?'A merchant house\'s tower (Izani)':kind==='shrine'?'A domed shrine (Yuni\'s look)':'An outlying house (mud brick, whitewashed)'});}
 return{gardens,houses};})();
const inRect=(g,x,z,pad)=>{const c=Math.cos(g.rot),s=Math.sin(g.rot),dx=x-g.x,dz=z-g.z,a=dx*c+dz*s,b=-dx*s+dz*c;return Math.abs(a)<g.w/2+(pad||0)&&Math.abs(b)<g.d/2+(pad||0);};
const gardenK=(x,z)=>{for(const g of TOWNREC.gardens)if(inRect(g,x,z,4))return 1;return 0;};
const STATION={key:'mantis',tags:'sedesert-mantis',seed:3,chanBox:[-3300,-3300,3300,3300],grid:{N:640,M:2,win:{x:[-2400,2300],z:[-2100,2300]}},   /* the streams' window split in two (5.2 m) */
 lod:{hero:560,mid:1250,far:2700,floor:[360,860]},water:[-3300,-3300,3300,3300],sun:[-900,600,700],mantisFar:false,pan:false,   /* no salt pan on the green shore (89w) */
 heat:.45,hour:16.8,
 air:{humidity:.62,turbidity:1.3,dustK:.3},clouds:{cover:.32,cumulus:.8},riverTint:0x5a7a6a,
 pools:SPRINGS.map(P=>({x:P.x,z:P.z,r:P.r,level:P.level,name:P.name})),
 pool:(x,z)=>{for(const P of SPRINGS)if(Math.hypot(x-P.x,z-P.z)<P.r*1.25)return P.level;return -1e9;},
 halo:{saltreed:150,rankgrass:300,glasswort:50,saltbush:30},
 chanReach:190,   /* the gallery forest reads the streams this far out */
 groundLayers:['salt','ochre','efflor','playa','reedbed','popcorn'],   /* with the green two: 8 layers, inside the 16 texture units */
 budget:{tris:21000000,calls:170},cls:{pass:11000000,host:900000}};   /* the owner's ceiling for the Bowl's stations, 2026-10-26 */
// ---------------------------------------------------------------- the fields (cached in 46; these are the definitions)
// The kit's, the Bowl's (lake, shore, flat, salt, delta, halo, reg, yard, damp, fan, ridge, strand, plat) and swlowlands' (tropic,
// dry: its zones read wet, tropic, dry, salt, flow, upland: rain = tropical and wet, swamp, rip by the streams), and the pocket's
// own: lush (the savanna's grass), forest (the closed canopy), garden (the town's walled ground), pocket, spring
function fieldsAt(x,z,h,slope){const u=uOf(x,z),C=CHG.at(x,z,_ch),pk=pocketK(x,z),ga=gardenK(x,z);
 BASIN.sample(x,z,h,_bs);
 const lake=h<LAKE.level-.02&&u<260?1:0,chan=C.id===255?0:1,dm=C.u*C.hw;
 let spring=0;for(const P of SPRINGS){const d=Math.hypot(x-P.x,z-P.z);spring=Math.max(spring,smooth(P.r*7,P.r*1.2,d));}
 const gallery=chan*smooth(170,25,dm),core=smooth(.55,.75,fbm(x*.0012+7,z*.0012-2,1805,2))*smooth(.5,.85,pk);
 const wet=clamp(lake?1:(.18+.5*pk+.42*Math.max(spring,gallery,core*.9))*(1-ga*.3),0,1);
 const forest=smooth(.84,.93,wet)*pk*(1-lake)*(1-ga);
 const shore=smooth(160,0,u)*(1-lake);
 const flat=smooth(-20,40,u)*smooth(700,350,u)*(1-pk)*(1-lake);
 const halo=smooth(.5,.15,pk)*smooth(.02,.12,pk)*(1-lake)*(1-flat*.5);
 const reg=smooth(.18,.02,pk)*(1-lake)*(1-flat);
 const delta=Math.max(chan*smooth(4,1.3,C.u)*(1-lake),shore*.7*pk);
 const damp=Math.max(spring*.6,smooth(LAKE.level+1.2,LAKE.level+.4,h)*(1-lake)*smooth(-10,60,u))*(1-ga);
 const salt=clamp(Math.max(flat,_bs.salt*.3*flat)*(1-pk),0,1);
 const lush=pk*(1-forest)*(1-lake)*(1-ga)*(1-shore*.6);
 return{wet,flow:chan*smooth(1.15,.9,C.u)*(1-lake),upland:0,canyon:chan*smooth(4,1.3,C.u)*(1-lake),rim:0,rock:smooth(.55,.9,slope)*.6,dune:0,oasis:spring,slope,abyss:0,
  lake,shore,flat,salt,delta,halo,reg,yard:0,damp,fan:0,ridge:0,strand:_bs.strand*(1-pk)*(1-lake),plat:0,
  tropic:1,dry:0,lush,forest,garden:ga,pocket:pk,spring};}
const FNAMES=['wet','flow','upland','canyon','rim','rock','dune','oasis','slope','abyss','lake','shore','flat','salt','delta','halo','reg','yard','damp','fan','ridge','strand','plat',
 'tropic','dry','lush','forest','garden','pocket','spring'];
// the LOD spine: along the shore, down the streams, the springs, the town's edge
const SPINE=[];for(let x=-2800;x<=2800;x+=700)SPINE.push([x,zS(x)+150]);
CHAN.forEach(C=>C.pts.filter((p,k)=>k%30===0).forEach(p=>SPINE.push([p[0],p[1]])));SPRINGS.forEach(P=>SPINE.push([P.x,P.z]));SPINE.push([-2300,1800],[-1600,1200],[1800,2400]);
