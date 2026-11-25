// ================================================================= HOST — stage (the Catch, station 5: THE WHITE PIPE FIELD AND THE CANDLES)
// WHERE (biomes/gills/PLAN.md section 11 item 4 and section 18.2): the LOWEST White Gills, 5.1 px 1015,1430, +3,746 m, 1.00 atm, 110 mm, Dsc,
// +2 degC (15/-11) - the one alien biome a caravan walks straight past, at a pressure a man breathes unadapted. The live ring fissure of station
// gills is 8 px (16 km) up-flank at 1015,1438 and +4,670 m; this page is the ground below it, where the swarm has moved on and left its dead:
//   A DEAD GILL closed by the tide's slow shift of the swarm, its hundreds of bone-white brucite pipes (Phlū) standing silent, fallen ones across
//   the floor, rubble fans of broken rings; BESIDE IT THE DRY GILLS whose gas still runs and burns - blue candle flames (Qãḍal) a metre tall at
//   the throats, invisible at noon and plain at dusk, a black heat crust round each (PLAN.md section 3: "where a throat's gas is dry and fast it
//   burns"). The History Monks' two cells cut into a fallen pipe's base with their ring count in its bore, the caravan stop at the salt cups, the
//   Yuni Geomancers' capped gas-house and the caravans' smelting hearths are PUBLISHED AS SITES and nothing is built for them (section 0, "Out of
//   scope": the hermitage as a building is a settlement's). Behind them to the south the dark arch-rift-basalt COLONNADE SCARP (section 18.2);
//   below to the north the flank's toe falling away toward the Catch's white salt floor at +318 m, 3.4 km down (the far field's, not this ground).
// THE MAP (x east, z south, y up, real metres; R 3300): the bench and the swarm in the middle, the scarp on the south, the toe on the north.
// COMPRESSION, declared: the twins' cones stand 100+ km off at this px, so a true ring crack would be straight across a 6.6 km page. The ring
// centre is drawn in to 18 km so the cracks curve as the plan's picture asks ("ring cracks round the two cones", section 6), the way xanadu's
// gills station compresses its 6.4 km of flank. The gills are carved in the heightfield at their records' 42-88 m, not the plan's 100-400 m
// (biomes/gills/KNOWN_ISSUES.md: KCAVERN trenches are owed).
const TERR={R:3300};
const WIND=(function(){const w=[.72,.70],l=Math.hypot(w[0],w[1]);return[w[0]/l,w[1]/l];})();   /* 6-10 m/s from the north-west (PLAN.md section 6) */
const SITE_H=3746;
// THE DAY: the out-breath at DUSK (PLAN.md section 11 item 4: "blue flames ... invisible at noon, plain at dusk"; item 3 sets the neighbouring
// station at dusk too). The breath's hour walks round the clock once a year (a sidereal day, ~3.9 minutes earlier each day), so a day is chosen.
// DUSK HERE IS 16.5 h, NOT 18.6: at this site (5.1 px 1015,1430, latitude -57.6) the sun sets about 15.7 h, so a page opened at 18.6 h stood in
// full night with the sun 21 degrees under the horizon and drew black. 16.5 h puts the sun 2.4 degrees up - the last light on the mist wall and
// the backlit plumes section 18.2 asks for - with the giant 26 degrees up to nod over it.
const GDUSK=16.5;
function GDAY(){const m=/[?&#]day=([^&#]*)/.exec(location.search+location.hash);if(m){const v=+decodeURIComponent(m[1]);return isFinite(v)?v:0;}   /* not `||0`: day 0 is a real day (CLAUDE.md) */
 if(GDAY.d!=null)return GDAY.d;let b=0,bd=99;for(let d=0;d<400;d++){const e=Math.abs(GILLS.peakHour(d)-GDUSK);if(e<bd){bd=e;b=d;}}return GDAY.d=b;}
// ---------------------------------------------------------------- the swarm (GILLS.layout; the shared life, read in place)
// Two breathing cracks still at the field's south edge (the swarm's live front, climbing toward station gills), seven closed: of those the dry
// ones burn (GILLS.isDry, the hash) and the rest are the silent pipe fields the Monks read.
const CONE={x:-1400,z:18000};
const SG=(function(){const L=GILLS.layout({centre:[CONE.x,CONE.z],band:[15300,20600],arc:[-Math.PI/2-.155,-Math.PI/2+.155],
  n:2,dead:7,seed:0x6111,form:'ring',w:[14,40],d:[42,88],len:[600,2200]});
 return{L,country:'white',dry:.45,seed:0x6113};})();
const GOPT={seed:SG.seed,dry:SG.dry,country:SG.country};
// ---------------------------------------------------------------- the land
// the bench: a travertine-and-serpentinite shelf at the site's height, the flank rising south toward the cones at ~6 per cent, the arch-rift
// colonnade scarp stepping up behind it, the toe falling away north
const SCARP_Z=x=>1080+150*Math.sin(x*.0009+.4)+70*(nz(x,0,.0026,2,41)-.5)*2;
function flankH(x,z){let h=SITE_H+z*.058;                                  /* the flank's grade toward the cones */
 h+=10*(nz(x,z,.0013,3,42)-.5)*2+3.2*(nz(x,z,.0075,2,43)-.5)*2;            /* the flows' roll and the ash beds' grain */
 const bz=-200;h-=4.5*smooth(620,0,Math.abs(z-bz))*smooth(2600,900,Math.abs(x));   /* the bench the caravan trail runs on */
 return h;}
function landH(x,z){let h=flankH(x,z);
 /* THE SCARP: blue-black arch-rift-basalt in 3-7 m colonnade tiers, a step of ~130 m with its talus apron at the foot */
 const sz=SCARP_Z(x),up=smooth(sz-20,sz+320,z);
 const tier=Math.round((z-sz)/5.2),tz=5.2*tier+sz,ledge=1.9*smooth(2.6,0,Math.abs(z-tz))*up;
 h+=up*(132+26*ridgeN(x,z,.0011,3,44)+14*(nz(x,z,.0048,2,45)-.5)*2)+ledge;
 h+=22*smooth(sz+40,sz-240,z)*smooth(sz-520,sz-180,z);                     /* the talus apron spilling off its foot */
 /* THE TOE: the flank breaking away to the north toward the Catch, steepening to the page's edge (the floor itself is the far field's) */
 const t=smooth(-2350,-3300,z);h-=t*(240+120*ridgeN(x,z,.0014,2,46));
 return h;}
// THE GILLS carved into the heightfield (GILLS.gillAt: the crack under a point and its depth share, 1 on the floor)
function gillCut(h,x,z){const g=GILLS.gillAt(SG.L,x,z);if(!g)return h;return h-g.g.d*g.k;}
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=gillCut(landH(x,z),x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
function waterH(x,z){return -1e9;}                                          /* no open water: the only water here is the salt cups' */
const ROCK=[],groundAll=terrainH;
const drawnH=(x,z)=>terrainH(x,z);
// the road climbing toward Lasso (south-east, the 7.3 km pass): the caravans' trail past the field
const ROAD=[[-2400,-1500],[-1500,-900],[-700,-420],[-120,-210],[560,-120],[1340,240],[2050,900],[2700,1760]];
const roadD=(x,z)=>polyD(ROAD,x,z);
const scarpK=(x,z)=>smooth(SCARP_Z(x)-30,SCARP_Z(x)+260,z);

// ---------------------------------------------------------------- the fields (FNAMES, 45-host-scene.js)
// The Catch's own names carry the pipe field's ground: `crust` the carbonate-brucite crust the mist lays, `soda` the lime dust blown downwind,
// `salt` the travertine aprons, `reg` the gravel and the rubble fans, `rock` the colonnade and the gills' walls, `cold` the altitude. `dune` is
// held at 1 so the sedesert kit (read in place) keeps its scrub off this flank, as every Catch stage does; `wet` only in the cracks' floors.
function fieldsAt(x,z,h,slope){const g=GILLS.gillAt(SG.L,x,z),gk=g?g.k:0,sk=scarpK(x,z),rd=roadD(x,z);
 const rock=clamp(Math.max(sk*(.55+.45*smooth(.25,.55,slope)),smooth(.45,.78,slope),gk*.75),0,1);
 const near=smooth(900,80,g?g.dr:1e9);                                      /* how near a crack: the mist falls in a strip downwind of it */
 const mist=clamp(near*(.35+.65*smooth(-.25,.75,(x*WIND[0]+z*WIND[1])*.0004+.4)),0,1);
 /* the field has been laying lime on this ground for centuries, so the crust is HIGH everywhere between the pipes, not only downwind of a live
    crack: the base .45 is the old carbonate pavement, the mist term the fresh fall. Without it the Catch basin's gravel and ochre layers won
    the blend and the White Gills' floor read as red desert. */
 const crust=clamp(.45+mist*.5*(1-rock*.6),0,1);
 return{wet:clamp(gk*.5,0,1),flow:0,upland:clamp((h-3200)/1600,0,1),rock,slope,salt:clamp(mist*.5*(1-rock),0,1),
  sand:0,reg:clamp((1-rock)*(1-crust*.85)*.6,0,1),silt:0,yard:0,crust,
  algal:0,spring:0,trod:clamp(smooth(26,6,rd)*.85,0,1),bed:0,strand:0,dry:1,cold:clamp((h-3000)/2600,0,1),
  soda:clamp(.25+mist*.55*(1-rock*.8),0,1),canyon:0,rim:0,dune:1,oasis:0,abyss:0};}
const SPINE=[[0,-200],[-700,-420],[700,-120],[0,600],[-1500,-900],[1340,240],[0,1300],[2050,900],[-2200,400]];
const BOUND=bindStage({R:TERR.R,N:420,terrainH,waterH,fieldsAt,seed:51,spine:SPINE,
 keep:(x,z)=>Math.max(smooth(22,8,roadD(x,z)),GILLS.gillAt(SG.L,x,z)?smooth(.25,.8,GILLS.gillAt(SG.L,x,z).k):0)});
const FC=BOUND.FC,FIELD=BOUND.FIELD;

const STAGE={
 key:'gills-candles',name:'The Catch: the White pipe field and the candles',title:'Krator biome — the Catch: the White pipe field and the candles',
 seed:51,hour:GILLS.peakHour(GDAY()),
 hint:'The Catch, station 5: the lowest White Gills (Wāiṭ Gīl) at 3,746 m and 1.00 atm, where the swarm has moved on. Hundreds of bone-white brucite breath pipes stand silent over a dead crack, fallen ones across its floor; beside them the dry gills still burn, blue candle flames (Qãḍal) a metre tall at the throats with a black heat crust round each. The History Monks count the pipes day-ring by day-ring from two cells cut into a fallen pipe, and the caravans water at the salt cups on the road to Lasso. The arch-rift-basalt colonnade scarp stands to the south, the Catch floor 3.4 km below to the north. N for night',
 site:{px:1015,py:1430},air:{pressure:1.0,humidity:.3},clouds:{cover:.12,cirrus:.3},fogDensity:0.00009,fogH:{y0:SITE_H-90,H:220,k:.6},siteH:SITE_H,
 // the twins' two cones above on the south, the Catch's white floor far below on the north, the Godthrone's mass west
 ridges:[
  {dist:150000,base:-1.60,amp:9.40,cycles:24,octaves:6,peaks:14,peakAmp:2.2,seed:81,rock:[0.33,0.30,0.30],hz:0.52},
  {dist:26000,base:1.10,amp:11.60,cycles:9,octaves:5,peaks:4,peakAmp:3.4,win:[195,120,1.1],floor:-1,seed:82,rock:[0.30,0.28,0.29],snowH:6200,hz:0.34},
  {dist:60000,base:-3.40,amp:4.20,cycles:16,octaves:5,peaks:8,peakAmp:1.5,win:[20,110,1.3],floor:-1,seed:83,rock:[0.44,0.41,0.38],hz:0.44},
  {dist:11000,base:-0.70,amp:2.30,cycles:30,octaves:5,win:[150,95,1.2],floor:-1,seed:84,rock:[0.38,0.36,0.35],hz:0.20}],
 spine:SPINE,nebkhas:[],expect:[],sedQ:0,stalkers:[],water:[],
 exportBox:[-420,-520,420,320],
 /* THE EXPORT PROFILE for this tile (verify.py EXPORT_PROFILE is the basin stations'): no `buckets`, because this station places no
    merged-geometry kit flora - the gills' life is instanced items (BIO.put) and the breath pipes are the station's own merged host
    meshes carried as KSTACKS chimney records, so they answer under `registry` and `terrain` instead. */
 exportProfile:['registry','items','materials','textures','terrain','stage'],
 registers:[
  {name:'The White pipe field (Phlū-phīlḍ): the dead of a crack the swarm has left',key:'landform.pipefield',x:0,z:-150,y:SITE_H-30,r:1500,h:160},
  {name:'The colonnade scarp (arch-rift-basalt, 3-7 m tiers)',key:'landform.scarp',x:0,z:1200,y:SITE_H+60,r:1600,h:260},
  /* bare ground falls away here, nothing stands on it: what fills the volume is the ground (ground:true, as the field's own record) */
  {name:'The flank toe falling to the Catch floor 3.4 km below',key:'landform.toe',ground:true,x:0,z:-2900,y:SITE_H-260,r:1700,h:420}]};
{const K=h=>new THREE.Color(h),BONE=K(0xd9d2c0),BONE2=K(0xe6e1d2),LIME=K(0xeceadd),BAS=K(0x322f33),BAS2=K(0x45424a),
  GREEN=K(0x7f8f78),GRAV=K(0x8d8679),OCH=K(0x8a5c3a),t=new THREE.Color();
 STAGE.paint=(F,c)=>{const n=nz(F.x,F.z,.018,2,47)-.5;
  c.copy(GRAV).lerp(BONE,clamp(.68+n*1.5,0,1));                            /* the gravel flank, well bleached by the lime */
  c.lerp(BONE2,F.crust*.85);c.lerp(LIME,F.soda*.7);                        /* the carbonate crust and the blown lime dust */
  c.lerp(GREEN,smooth(.35,.9,F.crust)*F.salt*.45);                         /* the grey-green manganese in the seams */
  t.copy(BAS).lerp(BAS2,clamp(.5+n*2.2,0,1));c.lerp(t,F.rock*.92);         /* the blue-black colonnade */
  c.lerp(OCH,F.rock*smooth(.3,.75,nz(F.x,F.z,.004,2,48))*.22);             /* the brick-red baked bolus partings */
  c.lerp(BONE2,F.trod*.3);};
 /* no ground.ochre: the Catch basin's rust set turned the carbonate floor red. The brick-red baked bolus partings stay a paint detail on the
    scarp (below), where they belong, and the floor is the library's crust and soda with gravel only where the lime thins. */
 STAGE.layers=[['ground.crust',F=>F.crust],['ground.soda',F=>F.soda*.9],['ground.rock',F=>F.rock],
  ['ground.gravel',F=>F.reg*(1-F.crust)*.7],['ground.reg',F=>F.reg*.35]];
 STAGE.groundLabel='The pipe field (carbonate crust, lime dust and basalt talus)';}
// THE VIEWS (biomes/gills/PLAN.md section 18.2's dusk cut first). Every camera STANDS ON THE CARAVAN ROAD, which 87-host-gills.js keeps clear of
// pipes and candles: the first cut of this station put the eye wherever the numbers fell and buried it in a pipe wall. `onRoad(i, up)` is the eye at
// road point i, `look` aims it at a point the field actually fills.
const onRoad=(gh,i,up)=>{const p=ROAD[Math.max(0,Math.min(ROAD.length-1,i))];return[p[0],gh(p[0],p[1])+up,p[1]];};
const roadView=(gh,i,up,tx,tz,th)=>{const c=onRoad(gh,i,up);return[c[0],c[1],c[2],tx,gh(tx,tz)+(th==null?8:th),tz];};
STAGE.views=function(gh){
 const site=(typeof CATCH_GILLS_SITE!=='undefined'&&CATCH_GILLS_SITE)?CATCH_GILLS_SITE:null;
 const cand=(typeof GILLS_DRAW!=='undefined'&&GILLS_DRAW.candles&&GILLS_DRAW.candles.length)?GILLS_DRAW.candles[0]:null;
 const big=(typeof GILLS_DRAW!=='undefined'&&GILLS_DRAW.tallest)?GILLS_DRAW.tallest:null;
 /* a camera on the road near a feature, far enough back that the pipes read against the sky */
 const nearRoad=(x,z)=>{let bi=0,bd=1e9;for(let i=0;i<ROAD.length;i++){const d=Math.hypot(ROAD[i][0]-x,ROAD[i][1]-z);if(d<bd){bd=d;bi=i;}}return bi;};
 const atFeature=(f,up,back)=>{if(!f)return null;const i=nearRoad(f.x,f.z),p=ROAD[i],dx=f.x-p[0],dz=f.z-p[1],l=Math.hypot(dx,dz)||1,
   cx=f.x-dx/l*back,cz=f.z-dz/l*back;return[cx,gh(cx,cz)+up,cz,f.x,gh(f.x,f.z)+(f.h?f.h*.6:2),f.z];};
 return{
  'The pipe field at dusk from the caravan bench':roadView(gh,2,2.6,260,-60,14),
  'The dead crack and its fallen pipes':roadView(gh,4,2.4,120,-460,6),
  'A pipe field against the colonnade scarp':roadView(gh,1,3.0,420,760,70),
  'The candles at a dry throat':cand?atFeature(cand,1.8,22):roadView(gh,3,2.4,-500,420,6),
  'Down the road to the Catch floor':roadView(gh,5,12,-400,-2900,-240),
  'Up the flank toward the live fissure':roadView(gh,3,3.0,-200,2400,420),
  'The tallest standing pipe':big?atFeature({x:big.x,z:big.z,h:big.H},2.2,46):null,
  'The hermitage in the fallen pipe':site&&site.hermitage?atFeature(site.hermitage,2.0,26):null,
  'From afar':[2600,SITE_H+620,-2500,-200,SITE_H-40,300]};};
