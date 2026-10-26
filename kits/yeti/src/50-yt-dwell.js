// prefix: yt
// ================================================================= DWELLINGS (PLAN.md section 6): the single domes
// One builder, ytDwellDome(D, season, o), draws every single-room dome house from its measures (ytDomeDims):
//   the shell    'pycrete' (a catenary of pycrete coursed outside in one rising spiral, lined with sewn hide on an air
//                gap: warm room, frozen shell) or 'stone' (dry slab in level corbelled courses, the mass facing the room,
//                wrapped outside in moss under turf: the stone house below the pycrete line, and the stone heart of the
//                richer houses);
//   the floor    sunk below the ground, its pit walled in slab;
//   the entry    a cold-trap passage whose floor lies 0.6 m below the room's, so the cold air pools in it;
//   the platform the raised sleeping and working platform over the back of the floor, under musk-ox and caribou robes:
//                solid with the lamp as the room's only fire in a pycrete dome; suspended over flues and a mass heater
//                in a stone house (41-yt-heat.js);
//   the air      in low through the passage, out through the adjustable crown vent (and the chimney in a stone house);
//   the light    an ice lens on the north side (the sun's side at 40 degrees south) over the platform;
//   the season   v: 0 winter (banked with drift snow to the springing), 1 autumn (bare, the shell freshly re-skinned),
//                2 summer (capped in turf, the pycrete dome unheated: PLAN.md section 1).
// Each house's record carries what a heat or economy pass reads (PLAN.md section 4): rec.layers, rec.frost (the frost
// rule for a heated pycrete shell), rec.heat, rec.season. o.bare: no platform, robes or goods (a hall, a works, a store):
// o.inside(D) draws the room and returns its heat record; o.lined false: an unlined pycrete room (a store); o.ribs: n
// stone ribs inside a stone dome; o.window false: no ice lens; o.heated: overrides whether it is heated. o.sides [{ga, arch, wp}]: doorways off the room at floor level (a
// cluster's passages to its satellite domes): arch the passage vault's outer section, wp the gap in the pit wall.
const YT_SEASONS=['winter','autumn','summer'];
/* a dome house's measures from a few choices: Rr the room's radius, Ho the outer height above ground, sink the floor's
   depth, pass the passage's length beyond the shell, kind ('pycrete' or 'stone'); the dome stands back from the plot
   centre (cz) so the dome and its entry together are centred */
function ytDomeDims(c){const S=YT_S,kind=c.kind||'pycrete',stone=kind==='stone',Rr=c.Rr,gap=stone?0:.18,t=stone?.6:.45,
 Ri=Rr+gap+(stone?0:.03),Rs=Ri+t,Ro=stone?Rs+.45:Rs,Ho=c.Ho,Hs=stone?Ho-.42:Ho,Hi=Hs-t*.9,Hl=Hi-.2,yFl=-(c.sink==null?.6:c.sink),
 hw=YT_PASS.hw,hv=YT_PASS.hv,ys=YT_PASS.ys,yF=YT_PASS.yF,tv=stone?.45:.4,z1=Ro+(c.pass==null?2.6:c.pass),zEnd=z1+1.5,
 back=Ro+1.05,front=(c.covered?z1:zEnd)+.3,cz=-(front-back)/2;
 return {S,kind,stone,Rr,gap,Ri,t,Rs,Ro,Ho,Hs,Hi,Hl,yFl,hw,hv,ys,yF,tv,z1,zEnd,cz,zPlat:c.zPlat==null?.2:c.zPlat,yPlat:yFl+.75*S,rVent:.12*S,
  w:2*(Ro+1.1),d:back+front+.4,h:Ho*(stone?1.3:1)+1.9};}
/* the ground holes: the pit to the middle of its wall, the entry trench to the middle of its walls, the stoking chamber */
function ytDwellHoles(D,covered,noChamber){const H=[{circle:[0,D.cz,(D.Rr+D.Ri+(D.stone?.3:0))/2]},{run:[0,D.cz+D.Rr-.2,0,D.cz+(covered?D.z1:D.zEnd),D.hw+.15]}];
 if(D.stone&&!noChamber)H.push({circle:[D.hw+.3+.9,D.cz+D.Ro+1.0,.9]});return H;}
function ytDwellDome(D,season,o){o=o||{};const stone=D.stone,AE={hw:D.hw+D.tv,hv:D.hv+D.tv,ys:D.ys},sides=o.sides||[],
  /* a doorway following an arch grown by d (the coat over a vault), for every passage: the entry and the sides */
  ADS=(d,g)=>[{arch:{hw:AE.hw+d,hv:AE.hv+d,ys:AE.ys},grow:g}].concat(sides.map(q=>({ga:q.ga,arch:{hw:q.arch.hw+d,hv:q.arch.hv+d,ys:q.arch.ys},grow:g})));
 const lined=o.lined!==false,heated=o.heated!==undefined?o.heated:stone||(lined&&season!=='summer');
 CURREC.season=season;
 CURREC.layers=ytLayers(stone?'stone':lined?'pycrete':'store',season,{t:D.t,gap:D.gap});
 CURREC.frost=stone?{ok:true,none:true}:heated?ytFrost(CURREC.layers):{ok:true,unheated:true};
 let inner=null;
 /* the cut-away's base: above the platform and its robes, so nothing on the platform is half opened */
 if(CUTC[3])CUTC=[CUTC[0],CUTC[1],CUTC[2]+Math.max(0,D.yPlat+.25),CUTC[3]];
 W(0,0,D.cz,0,()=>{let heart=null;
  if(!stone){
   /* the shell: block courses outside rising in one spiral, pycrete inside; the lining closed at the crown round the vent */
   ytDome('course',D.Ro,D.Ho,P('ice'),{doors:ADS(0,-.03),rTop:D.rVent+.02,spiral:.5});
   ytDome('pycrete',D.Ri,D.Hi,P('ice'),{doors:ADS(0,-.03),rTop:D.rVent+.02,inward:true});
   if(lined)ytDome('hideCap',D.Rr,D.Hl,P('ice'),{doors:ADS(0,-.03),rTop:D.rVent+.01,inward:true});
   if(o.vent!==false)ytCrownVent(D.rVent,(lined?D.Hl:D.Hi)-.02,D.Ho+.05);}
  else{
   /* the shell: dry slab corbelled in level courses, inside and out, then moss and turf over it; the vent through the crown */
   ytShell('slab',ytCorbelProf(D.Rs,D.Hs,0,.28,D.rVent+.04),P('slab'),{doors:ADS(0,-.03)});
   ytShell('slab',ytCorbelProf(D.Ri,D.Hi,0,.28,D.rVent+.04),P('slab'),{doors:ADS(0,-.03),inward:true});
   ytDome('turfCap',D.Ro,D.Ho,P('ice'),{doors:ADS(.25,-.2),rTop:D.rVent+.3});
   /* in winter the turf lies under snow: a stone house reads as a drifted mound, its chimney and vent standing out of it */
   if(season==='winter')ytDome('snowCap',D.Ro+.14,D.Ho+.14,P('ice'),{doors:ADS(.4,-.2),rTop:D.rVent+.42});
   if(o.ribs)ytRibs('slab',D.Ri-.35,D.Hi-.3,o.ribs,.32,P('slab'),{y0:0,rTop:D.rVent+.1});
   if(o.vent!==false)ytCrownVent(D.rVent,D.Hi-.02,D.Ho+.05);}
  /* the pit: its dry slab wall from the floor to the ground, the floor of packed earth (its side is the step up from the
     passage); the insulation under a heated floor is recorded on the layers, not drawn */
  ytWalkDisc(0,0,D.Rr-.05,D.yFl);ytWalkTarget('room',0,D.yFl,o.bare?D.Rr*.55:(D.zPlat+D.Rr)/2);
  ytPitWall(D.Rr,D.Ri+(stone?.3:0),D.yFl,[{ga:PI/2,w:2*(D.hw+.3)}].concat((o.sides||[]).map(q=>({ga:q.ga,w:q.wp}))));
  cyl('earth',0,D.yF-.1,0,D.Rr,D.yFl-D.yF+.1,P('earth'),40);
  /* a bare room (a hall, a works, a store): the caller draws its inside and its heat (o.inside(D) -> the heat record) */
  if(o.bare){inner=o.inside?o.inside(D):null;}
  else{
  /* the platform: solid in a pycrete dome, suspended over the flues of a mass heater in a stone house; robed */
  if(!stone)prism('slab',ytSegment(D.Rr-.02,D.zPlat,24),D.yFl,D.yPlat,P('slab'));
  else heart=ytHeart({Rr:D.Rr,Ri:D.Ri,Ro:D.Ro,Hi:D.Hi,Ho:D.Ho,yFl:D.yFl,zPlat:D.zPlat,yPlat:D.yPlat,hw:D.hw,yF:D.yF,ys:D.ys,t:D.tv,z1:D.z1,side:1,collar:false,season});
  prism('muskox',ytSegment(D.Rr-.25,D.zPlat-.12,24),D.yPlat,D.yPlat+.07,P('ice'));
  W(-.6,D.yPlat+.07,-1.1,.4,()=>box('caribou',0,0,0,1.5*D.S,.05,1.1*D.S,P('ice')));
  wkPad(0,(D.zPlat-D.Rr)/2+.1,D.Rr*1.5,D.Rr+D.zPlat-.2,D.yPlat+.07);   /* to the platform's front edge: the step meets it */
  /* the step up onto the platform: a slab block at its front (the platform stands 0.9 m over the floor) */
  WKOFF=1;box('slab',0,D.yFl,D.zPlat+.22,1.0,(D.yPlat-D.yFl)/2,.44,P('slab'));WKOFF=0;wkPad(0,D.zPlat+.22,1.0,.44,(D.yFl+D.yPlat)/2);
  ytWalkTarget('platform',0,D.yPlat+.07,(D.zPlat-D.Rr)/2);
  wkPad(0,(D.zPlat+D.Rr)/2,D.Rr*1.2,D.Rr-D.zPlat-.2,D.yFl);
  /* the lamp at the platform's edge; the ice lens on the north side over the platform */
  ytLamp(stone?-.75:.75,D.yPlat+.07,D.zPlat-.3,0);}
  if(o.window!==false)ytIceWindow(D.Ro,D.Ho,Math.min(1.55,D.Ho*.46),-PI/2+(stone?.5:0),D.Ro-D.Rr+.12,.3,season==='summer'&&!stone?.3:0);
  /* the season's coat: drift snow banked to the springing's top in winter, a turf cap over pycrete in summer */
  if(season==='winter'){const r1=ytCatR(D.Ro,D.Ho,1.1);
   ytShell('snow',[[D.Ro+1.05,0],[D.Ro+.55,.4],[r1+.25,1.0],[r1+.02,1.2]],P('snow'),{doors:ADS(.28,-.2),seg:40});}
  if(season==='summer'&&!stone)ytDome('turfCap',D.Ro+.3,D.Ho+.3,P('ice'),{doors:ADS(.25,-.2),rTop:D.rVent+.22});
  /* the entry (in a stone house it opens on the stoking chamber's side) */
  ytEntry({yRoom:D.yFl,z0:ytRoomReach(D.stone?D.Ri:D.Rr,D.stone?D.Hi:D.Hl,D.ys+D.hv+D.tv,D.Rr-.05),z1:D.z1,zEnd:D.zEnd,yF:D.yF,hw:D.hw,hv:D.hv,ys:D.ys,t:D.tv,season,mk:stone?'slab':'course',
   coat:stone?(season==='winter'?'snow':'turf'):undefined,covered:!!o.covered,gap:heart?{side:1,z0:heart.chamber.cz-.5,z1:heart.chamber.cz+.5}:null});
  CURREC.heat=o.bare?Object.assign({stove:null,lamps:0,crownVent:+(D.rVent*2).toFixed(2),inlet:'passage',heated},inner||{}):heart?Object.assign({lamps:1,crownVent:+(D.rVent*2).toFixed(2),inlet:'passage',heated:true},heart,{chamber:undefined})
   :{stove:null,lamps:1,fuel:'fat',crownVent:+(D.rVent*2).toFixed(2),inlet:'passage',heated,floor:{sunk:-D.yFl,onPermafrost:'insulated'}};
  if(o.bare)return;
  /* the household's goods (catalog pieces until the khaayken culture file, Y5) */
  const yP=D.yPlat+.07,s=D.Rr/2.645;
  FURNISH('generic_chest',-1.5*s,yP,-1.4*s,.7);
  FURNISH('generic_tea_set',.2*s,yP,-.6*s,0);
  FURNISH('generic_lamp_oil',1.3*s,yP,-.5*s,-.4);
  FURNISH('generic_stew_pot',1.2*s,D.yFl,1.2*s,-1.2);
  if(!o.small){FURNISH('generic_floor_basket',-1.4*s,D.yFl,1.1*s,1.1);FURNISH('generic_fuel',-.6*s,D.yFl,1.9*s,2.4);}});}
/* each dome house has a covered variant (o.covered: its passage ends at the mouth on a covered way, no open trench) and
   says where that mouth is (mouth: its local z), so a town can join it to its tunnels (ytDoorNetPlan, 42-yt-tunnel.js) */
const ytDwellPair=c=>[ytDomeDims(c),ytDomeDims(Object.assign({covered:true},c))];
/* yt_dome: the poor family's one dome, the igloo grown up, in pycrete where the cold holds it all year (the Yeti Valley) */
const [YT_DOME,YT_DOME_C]=ytDwellPair({Rr:2.3*YT_S,Ho:3.35});
defBuilding({key:'yt_dome',name:"Pycrete dome (a poor family's)",seed:9101,w:YT_DOME.w,d:YT_DOME.d,h:YT_DOME.h,cut:true,budget:70000,
 tags:{types:['dwelling-single'],wealth:'poor',style:'poor',role:'dwelling'},mouth:YT_DOME_C.cz+YT_DOME_C.z1,
 note:'the igloo grown up: catenary pycrete shell coursed in one spiral, hide lining on an air gap, sunk floor, cold-trap entry, lamp-heated platform',
 holes:o=>o.covered?ytDwellHoles(YT_DOME_C,true):ytDwellHoles(YT_DOME,false),
 build(o){ytDwellDome(o.covered?YT_DOME_C:YT_DOME,YT_SEASONS[(o.v|0)%3],{covered:!!o.covered});}});
/* yt_travel_dome: the herder's small dome, one hearth of robes and a lamp, a short passage */
const [YT_TRAVEL,YT_TRAVEL_C]=ytDwellPair({Rr:1.7*YT_S,Ho:2.55,sink:.45,pass:1.4,zPlat:.05});
defBuilding({key:'yt_travel_dome',name:"Herder's travel dome",seed:9103,w:YT_TRAVEL.w,d:YT_TRAVEL.d,h:YT_TRAVEL.h,cut:true,budget:60000,
 tags:{types:['dwelling-single'],wealth:'poor',style:'poor',role:'dwelling'},mouth:YT_TRAVEL_C.cz+YT_TRAVEL_C.z1,
 note:'the small dome of a herding camp: one platform of robes and a lamp, a short cold-trap passage',
 holes:o=>o.covered?ytDwellHoles(YT_TRAVEL_C,true):ytDwellHoles(YT_TRAVEL,false),
 build(o){ytDwellDome(o.covered?YT_TRAVEL_C:YT_TRAVEL,YT_SEASONS[(o.v|0)%3],{covered:!!o.covered,small:true});}});
/* yt_stone_dome: the stone house, where pycrete cannot stand the year or a fire must burn: corbelled slab, the mass inside,
   moss and turf outside; a mass heater stoked from a chamber off the entry, its flues under the suspended platform */
const [YT_STONE,YT_STONE_C]=ytDwellPair({Rr:2.4*YT_S,Ho:3.6,kind:'stone',pass:2.8});
defBuilding({key:'yt_stone_dome',name:'Stone house (mass heater)',seed:9105,w:YT_STONE.w,d:YT_STONE.d,h:YT_STONE.h,cut:true,budget:80000,
 tags:{types:['dwelling-single'],wealth:'middle',style:'common',role:'dwelling'},mouth:YT_STONE_C.cz+YT_STONE_C.z1,
 note:'corbelled dry slab under moss and turf; a mass heater burned once a day, flues under the suspended platform, a chimney a quarter taller for the thin air',
 holes:o=>o.covered?ytDwellHoles(YT_STONE_C,true):ytDwellHoles(YT_STONE,false),
 build(o){ytDwellDome(o.covered?YT_STONE_C:YT_STONE,YT_SEASONS[(o.v|0)%3],{covered:!!o.covered});}});
