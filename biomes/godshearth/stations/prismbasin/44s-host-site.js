// ================================================================= HOST — GODSHEARTH, STATION 1, THE HOT LAKE (`prismbasin`; PLAN.md section 7, 2026-11-09)
// A geyser field on Godshearth's floor (the geyser kit's field stage, read in place: STATION_SITE is its contract, stations/field/45-host-stage.js), with
// the Hearths on KTHERM's heat (47b, 87) and the hot lake (89w).
// THE SITE ON SCALE MODEL 5.1 (PLAN.md sections 1 and 3, read 2026-11-09): the caldera floor on the hot lake's east shore. The plan's pin is 844,1394
// (3,645 m), with the lake "from about 4 km west"; this page's middle is moved 4 km west onto the shore, 842,1394 (old canvas 570,1064), so the lake fills
// the west of the page. The lake: level 3,642 m, bed 3,636 m, 18 cells (~72 km2), centre 839,1394, class WH; the floor round it 3,645-3,740 m, flat
// (median slope 0.8 deg), 1.01 atm. The walls stand 40-90 km off (west 7.9 km high, north 7.6 km, the east rim 5.9 km): out of the far field's 14 km.
// THE AIR: the owner's climate (2026-11-09; PLAN.md section 3), not the model's forced Cfb: the floor's mean +7 degC (warm month +15, cold -2), 16-18 degC
// between day and night, nights to -10 degC in the cold month; 750-925 mm, most of it in summer afternoon storms, so the nights are clear. Cwb (Lhasa's).
// The model holds it since scale model 5.1 edit 1 (f1d1501cf, tools/scale-model/edit_511.py: the floor 7.0 degC, 15/-2, days 24, nights -10).
// THE PAGE (x east, z south, y up in metres over the LAKE'S LEVEL, 3,642 m; TERR.R 1400, the field stage's):
//   THE LAKE      west of a wandering shore at x ~ -350, shelving to 9 m in 500 m; past the square the far field carries it 10 km west, flat and painted
//   THE FIELD     the lake's sinter shore: a geyser field in an ellipse just inland (geysers, a great prismatic spring, hot pools, an acid field, the
//                 fumaroles; the kit's sinter, run-off and mats), on the frost-hardy turf of the floor
//   THE GROVE     a vent line running north-east across the floor 500 m inland (KTHERM, 47b): the hearth trees on its 25-60 degC ground, merging into a
//                 grove along it, the ember mat on its hottest ground, coal moss, stokers at the edge, tallow on the stalks (87)
//   THE DEAD      a dead spring south-east, its vent gone cold: rings of dead stalks standing where the heat was (the plan's ghost rings)
//   THE TERRACES  south of the field, a spring's sinter mound with eight rimstone pools stepping down 6 m to the lake (WATER.terraces, 89w; the
//                 plan's "terraces stepping down to the lake", Mammoth's and Pamukkale's travertine on Earth)
//   THE MEADOW    the floor's frost-hardy turf between (the ground's paint) and hard cushions on it (the geyser field stage's FIELDFLORA: yareta),
//                 off the warm ground, the sinter, the run-off and the beach
const GH_LAKE={level:0,abs:3642,name:'The hot lake (Godshearth; its name is the owner\'s: PLAN.md section 9)'};
// the shore: x of the waterline at z, wandering 90 m on a long wave and 40 m on core/rand's noise
const shoreX=z=>-350+90*Math.sin(z*.0021+1.1)+40*(fbm(3.1,z*.0017,8101,2)-.5);
// the lake's west shore, past the square (the lake is ~10 km across on the model)
const westX=z=>-10400+600*Math.sin(z*.0004+.3);
// the vent line the hearth grove follows (47b), and the dead spring's cold vent
const GH_VLINE=[[380,-760],[700,-470],[960,-150]],GH_DEAD={x:640,z:640,name:'A dead spring (its vent gone cold; rings of dead stalks where the heat was)'};
// the meadow's ground (75: FIELDFLORA's accept): 1 on the cool floor, 0 on ground over 12 degC (KTHERM's discs, the geyser kit's warm ground), the
// sinter, the run-off's film, the acid ground, the springs, the beach and the steep
function ghMeadow(x,z){const g=GEYSER.at(x,z);if(g.spring>0||g.sinter>.15||g.film>.1||g.acid>.1||g.mud>.05||g.dead>.2)return 0;if(x<shoreX(z)+40)return 0;{const q=GH_TER.at(x,z);if(q.s>-60&&q.s<GH_TER.L+30&&Math.abs(q.a)<GH_TER.w/2+40)return 0;}
 const t=Math.max(g.T,typeof GH_HEAT==='function'?GH_HEAT(x,z):STATION_SITE.amb);if(t>12)return 0;return FIELD.slope(x,z)>.6?0:smooth(12,9,t);}
// THE TERRACES: a straight line from the spring (A) to the shore (B), eight treads at the levels below, 2.2 m risers between (WATER.terraces' own
// layout of equal treads), 22 m wide; the land under them is the spring's built mound: the pools' beds 0.6 m under their levels, rims 0.3 m over,
// the flanks falling to the floor over 60 m (ghLand); the ground there is sinter (STATION_GROUND.paint)
const GH_TER=(function(){const A=[-60,540],z1=575,B=[shoreX(z1)-4,z1],dx=B[0]-A[0],dz=B[1]-A[1],L=Math.hypot(dx,dz),ux=dx/L,uz=dz/L;
 const levels=[6.4,5.6,4.8,4.0,3.2,2.4,1.6,.9],n=levels.length,riser=2.2,w=22,tl=(L-(n-1)*riser)/n;
 const at=(x,z)=>{const rx=x-A[0],rz=z-A[1];return{s:rx*ux+rz*uz,a:-rx*uz+rz*ux};};
 const lv=s=>{const k=Math.max(0,Math.min(L,s)),i=Math.min(n-1,Math.floor(k/(tl+riser))),o=k-i*(tl+riser);
  return o<=tl||i===n-1?{y:levels[i],tread:true,i}:{y:mix(levels[i],levels[i+1],(o-tl)/riser),tread:false,i};};
 return{A,B,L,levels,riser,w,tl,at,lv,name:'The terrace spring\'s rimstone pools (sinter, stepping down to the lake)'};})();
function ghTer(x,z,h){const q=GH_TER.at(x,z),aa=Math.abs(q.a),hw=GH_TER.w/2;if(q.s<-70||q.s>GH_TER.L+40||aa>hw+70)return h;
 const v=GH_TER.lv(q.s),end=smooth(-70,-8,q.s)*smooth(GH_TER.L+40,GH_TER.L+2,q.s);
 const rim=v.y+.3,mound=rim-Math.max(0,aa-hw)*.09-Math.max(0,-q.s)*.06,flank=Math.max(h,mix(h,mound,end*smooth(hw+70,hw,aa)));
 if(aa<hw-1&&q.s>=0&&q.s<=GH_TER.L)return v.tread?v.y-.6:Math.min(flank,v.y-.1);   /* the pool's bed, and the riser's face */
 return flank;}
function ghLand(x,z){return ghTer(x,z,ghLand0(x,z));}
function ghLand0(x,z){const d=x-shoreX(z),n=fbm(x*.0016+4,z*.0016-2,8102,3)-.5,n2=fbm(x*.008,z*.008,8103,2)-.5;
 if(d>=0)return .3+d*.0042+3*smooth(40,520,d)+6*n*smooth(80,600,d)+.5*n2*smooth(0,60,d)+.004*Math.max(0,Math.abs(z)-3000);   /* the floor rises gently inland */
 const w=x-westX(z);   /* the lake: shelving fast at the shore, then a flat bed at about 6-9 m; up again at its west shore */
 if(w>0)return .3+Math.max(-9.3,d*.02)+.6*n2*smooth(-40,0,d);
 return .3+Math.min(-w*.004,40)+.004*Math.max(0,Math.abs(z)-3000);}
const STATION_SITE={region:'Godshearth: the hot lake\'s sinter shore (station 1, ideal type)',fieldName:'The hot lake\'s sinter shore',px:[842,1394],
 sky:{px:570,py:1064,pressure:1.01,humidity:.45,clouds:.3},amb:7,seed:81,wind:[-.8,.3],   /* the night's katabatic drains toward the lake; by day the lake breeze */
 haze:0xc8d0d8,fog:.00012,cold:.25,wet:.45,climate:{cold:true},skyGround:0x3a3a2e,uplandH:30,
 field:{x:40,z:120,r:430,e:.72},
 land:ghLand,
 waterH:(x,z)=>{const q=GH_TER.at(x,z);if(q.s>=0&&q.s<=GH_TER.L&&Math.abs(q.a)<GH_TER.w/2-1)return GH_TER.lv(q.s).y;   /* the terraces' pools */
  if(x>shoreX(z)+80)return -1e9;return ghLand(x,z)<GH_LAKE.level+.2?GH_LAKE.level:-1e9;},
 sink:(x,z)=>x<shoreX(z)+4,   /* the run-off ends in the lake */
 far:{label:'The caldera floor and the hot lake (Godshearth); the walls 40-90 km off, past the haze',haze:[176,184,192],
  h:(x,z)=>{const d=x-shoreX(z),w=x-westX(z);return d<-40&&w>0?GH_LAKE.level-.25:ghLand(x,z);},
  color:(x,z,y,q)=>{const L=a=>a.map(v=>Math.pow(v/255,2.2)),m=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t),n=clamp(fbm(x*.003,z*.003,8104,2),0,1);
   if(y<GH_LAKE.level)return m(L([52,104,110]),L([70,126,128]),n);   /* the lake past the square: its colour, no surface */
   let c=m(L([96,92,60]),L([112,108,70]),n);return m(c,L([98,94,88]),smooth(40,140,y));}},
 thermal:()=>FIELD_SPEC({seed:81,r:430,e:.72,amb:7,
  geysers:{n:5,H:[8,34],period:[2400,21600],dur:[90,900],kinds:['cone','fountain','cone'],names:['The shore geyser (a cone geyser)','The lake fountain (a fountain geyser)']},spouters:3,
  springs:{n:14,r:[2.5,7.5],temp:[.4,1],big:38,minerals:['sinter','sinter','iron','sulfur'],names:['The great prismatic spring on the lake\'s shore (TBD)']},
  acid:{n:1,r:80,mud:6,fumaroles:10},fumaroles:{n:4},runLen:560}),
 passes:[],floor:false,
 /* the yareta cushions only: the geyser kit's ichu is pale straw on the library (st.ichu), white dots on this dark turf (KNOWN_ISSUES.md) */
 flora:{yareta:{cell:7,R:1250,accept:(x,z)=>ghMeadow(x,z)*.22}},   /* none of the geyser kit's hot-country trees or floor: the floor is the high meadow's turf; its life is the Hearths' (87) */
 take:{build:'godshearth',hour:15,guards:false,title:'Krator biome — Godshearth: the hot lake (station 1)',
  types:{'hearths/field':'pass','field/flora':'pass'},
  exportProfile:['registry','items','buckets','materials','textures','terrain','stage','atmos','water'],
  hint:"Godshearth, station 1: the hot lake's east shore on the caldera floor (3,642 m, 1.01 atm: sea-level air inside walls 3-4 km high, out of sight 40-90 km off). The owner's climate: mild days, frosty nights (mean +7 °C; 24 °C summer days, -10 °C winter nights). A geyser field on the lake's sinter shore (geysers, a great prismatic spring, hot pools, an acid field), and inland the Hearths' grove along a vent line: hearth trees on the 25-60 °C ground, their black fans open flat to the night sky and folded into silver spindles by day, the ember mat on the hottest ground, coal moss, stokers, and rings of dead stalks round a dead spring. Try #hour=22 (the fans open) (ideal type)",
  plant:it=>typeof HEARTH!=='undefined'?HEARTH.plantOfItem(it):null,
  views:()=>{const g=biggest(LAYOUT.geysers.filter(q=>q.kind!=='spouter'),'H'),s=biggest(LAYOUT.springs,'r'),T=(window._field&&window._field.trees)||[],m=GH_VLINE[1];
   const near=T.slice().sort((a,b)=>Math.hypot(a.x-m[0],a.z-m[1])-Math.hypot(b.x-m[0],b.z-m[1]))[0]||{x:m[0],z:m[1],y:terrainH(m[0],m[1]),H:6};
   return{'The hot lake\'s shore':fieldView(40,120,.35,900,90,0),'The great prismatic spring':[s.x+s.r+70,s.level+80,s.z+s.r+60,s.x,s.level,s.z],
    'The shore geyser':fieldView(g.x,g.z,.9,g.H*3+60,6,g.H*.5),'The hearth grove on the vent line':fieldView(m[0],m[1],2.4,260,14,4),
    'A hearth tree':[near.x+9,near.y+2,near.z+7,near.x,near.y+near.H*.85,near.z],'Ghost rings round the dead spring':fieldView(GH_DEAD.x,GH_DEAD.z,2.6,170,5,1),
    'The terraces down to the lake':(function(){const T=GH_TER,cx=T.A[0]+55,cz=T.A[1]-35,tx=T.A[0]+(T.B[0]-T.A[0])*.6,tz=T.A[1]+(T.B[1]-T.A[1])*.6;return[cx,terrainH(cx,cz)+26,cz,tx,T.lv(T.L*.6).y,tz];})(),
    'Across the lake':fieldView(shoreX(0)+40,0,0,60,4,-2),'From above':[1100,900,1300,100,0,-100]};},
  erupt:{'The shore geyser':'g0'},
  checks:(add,P)=>{const F=window._field||{trees:[],counts:{}};
   add('the grove placed: hearth trees, fans, ember mat, coal moss, stokers, tallow, dead stalks',GHC.field(F.counts));
   add('hearth trees on 25-60 degC ground only (KTHERM)',GHC.trees(F.trees));
   add('the ember mat on 60-95 degC ground only',GHC.ember(P));
   add('no hearth tree in a spring, on the sinter or in the lake',GHC.wet(F.trees));
   add('the engine: open at night, shut at noon, open in an eclipse (HEARTH.work)',GHC.work());
   add('the meadow\'s cushions off the warm ground, the sinter, the springs and the beach',GHC.meadow(P));
   add('the air: frost on a winter night, mild by day, the cold-air pools colder (KHAZ temperature)',GHC.air());
   add('the terraces: every pool on its tread, each lower than the last, the land holding it',GHC.terr());
   add('the hot lake drawn, its level the model\'s 3,642 m',{ok:!!(window._water&&window._water.lake),detail:window._water&&window._water.lake?'a still WATER.open at 3,642 m over the shore\'s west':'no lake'});},
  negatives:(add,P)=>{add('no stokers',GHC.field(Object.assign({},(window._field||{}).counts,{stoker:0})));
   add('a hearth tree on cold ground',GHC.trees([{x:-900,z:900,heat:7}]));add('an ember mat on cool ground',GHC.ember([[-900,0,900,'biome:hember']]));
   add('a cushion on the vent line',GHC.meadow([[GH_VLINE[1][0],0,GH_VLINE[1][1],'biome:fcushion']]));add('a terrace pool over its rim',GHC.terr(1.5));add('an air with no night',GHC.air(()=>12));
   const s=LAYOUT.springs[0];add('a hearth tree in the great spring',GHC.wet([{x:s.x,z:s.z}]));add('an engine open at noon',GHC.work(()=>1));}}};
// THE GROUND (84, the field stage's STATION_GROUND): the floor's turf (the `grass` channel, everywhere the kit's paint leaves it), the washed glass-bead
// sand of the shore (the `sand` channel: Pele's amber, ochre and black, PLAN.md section 2), the coal moss's dark ground on the warm discs (47b's heat),
// the kit's sinter, acid clay and mud; the run-off's mats in the cool field's colours (olive and brown more than orange)
const GH_TURF=new THREE.Color(.36,.34,.2),GH_BEAD=new THREE.Color(.42,.3,.16),GH_COAL=new THREE.Color(.09,.085,.08);
const STATION_GROUND={
 /* the fine meshes: the field's (the field stage's default: its ellipse's box, 2 m) and, abutting it south (the showcase's floor and Stair abut so), the
    terraces' (1 m: 22 m pools on 25 m treads) */
 patches:[{name:'The hot lake\'s sinter shore',x0:-536,z0:-296,x1:616,z1:536,cs:2,tol:.04,fine:true},
  {name:'The terraces',x0:Math.floor(Math.min(GH_TER.A[0],GH_TER.B[0])-48),z0:536,x1:Math.ceil(Math.max(GH_TER.A[0],GH_TER.B[0])+48),z1:Math.ceil(Math.max(GH_TER.A[1],GH_TER.B[1])+48),cs:1,tol:.03,fine:true}],
 paint:(x,z,y,g,c,GA,slope)=>{const tq=GH_TER.at(x,z),ter=smooth(GH_TER.w/2+30,GH_TER.w/2+4,Math.abs(tq.a))*smooth(-50,-10,tq.s)*smooth(GH_TER.L+30,GH_TER.L,tq.s);g=ter>0?Object.assign({},g,{sinter:Math.max(g.sinter,ter)}):g;const d=x-shoreX(z),beach=smooth(70,8,d)*(1-g.sinter)*(1-g.spring),t=typeof GH_HEAT==='function'?GH_HEAT(x,z):STATION_SITE.amb;
  const rock=smooth(.55,.8,slope),warm=smooth(14,30,t),turf=clamp((1-rock)*(1-beach)*(1-g.sinter)*(1-g.acid)*(1-g.mud)*(1-g.terr)*(1-g.spring)*(1-warm),0,1);
  c.lerp(GH_TURF,turf*.75);   /* the high meadow's turf, cured yellow-green */
  c.lerp(GH_BEAD,beach*.85);   /* the bead sand: amber glass and black, washed and sorted by the lake */
  c.lerp(GH_COAL,warm*(1-g.spring)*.8);   /* the warm discs: the coal moss's black ground */
  GA.sinter=Math.max(GA.sinter||0,ter*.95);GA.r=c.r;GA.g=c.g;GA.b=c.b;GA.grass=Math.max(GA.grass||0,turf);GA.sand=Math.max(GA.sand||0,beach);},
 layers:[['litter','0.5'],['grass','grass*0.9','mix(vec3(1.0),base*3.0,0.35)','turf'],
  ['moss','grass*smoothstep(0.03,0.09,heat)*(1.0-smoothstep(0.2,0.32,heat))*0.8'],['rock','rock'],['sand','sand','mix(vec3(1.0),base*2.6,0.55)','bead sand'],
  ['sinter','dead*0.7','vec3(0.78,0.76,0.72)','dead sinter'],['sinter','sin_','mix(vec3(0.74,0.72,0.68),vec3(1.0,0.98,0.94),_sk)'],
  ['clay','acid*0.9','mix(vec3(1.0),base*1.4,0.6)'],['mud','mud*0.95']],
 mats:'vec3 c=vec3(0.3,0.28,0.14);c=mix(c,vec3(0.46,0.28,0.12),smoothstep(0.1,0.17,h));c=mix(c,vec3(0.7,0.42,0.14),smoothstep(0.25,0.32,h));c=mix(c,vec3(0.72,0.66,0.24),smoothstep(0.42,0.47,h));c=mix(c,vec3(0.56,0.66,0.36),smoothstep(0.5,0.55,h));return pow(c,vec3(2.2));'};
