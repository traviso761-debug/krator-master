// prefix: yt
// ================================================================= THE STATE, THE FAITH, THE DEAD (PLAN.md section 6, Y4)
// ytRoomDef(c) defines a single-dome building from its measures (ytDomeDims) and an inside (o.inside(D, season) draws the
// room and returns its heat record), with its covered variant and its mouth, so a town can join it to its tunnels.
//   yt_quunsul_hall   the council of the clans: a ribbed stone hall, its benches in a ring round a central stone stove
//                     whose stack rises through the crown; the clans' appliqué hangings
//   yt_chief_hall     the High Chief's hall (Khaay Chiip): a ribbed stone hall raised over a platform with the high seat,
//                     hangings and beadwork, a cold store and the guards' sleeping dome off it
//   yt_song_house     the qaggiq: the town's great pycrete dome, lined, unheated but by its lamps and its crowd; the drum
//   yt_shrine         the spirit house: a small stone dome, carved masks round its wall, a drum, offerings
//   yt_clan_tomb      the clan's dead: a corbelled dry-stone mound, half sunk, a lintel stone over its low door, an inuksuk
function ytRoomDef(c){const [D,DC]=ytDwellPair(c.dims);
 return defBuilding({key:c.key,name:c.name,seed:c.seed,w:D.w+(c.extraW||0),d:D.d,h:c.h||D.h,cut:true,budget:c.budget||120000,tags:c.tags,
  mouth:DC.cz+DC.z1,note:c.note,holes:o=>o.covered?ytDwellHoles(DC,true,true):ytDwellHoles(D,false,true),
  build(o){const season=c.season===false?'winter':YT_SEASONS[(o.v|0)%3],DD=o.covered?DC:D;
   ytDwellDome(DD,season,Object.assign({bare:true,covered:!!o.covered},c.opts||{},{inside:Dm=>c.inside(Dm,season,o)}));
   if(c.after)W(0,0,DD.cz,0,()=>c.after(DD,season,o));}});}
/* a central stone stove with its stack through the crown (a hall's hearth): stands at the room's centre */
function ytHallStove(D){ytStoneStove(0,D.yFl,0,0,1.5,1.5,1.0);const top=D.Ho*1.25+.4;box('slab',0,D.yFl+1.0,0,.6,top-D.yFl-1.0,.6,P('slab'));
 box('slab',0,top-.12,0,.76,.16,.76,P('slab'));smokeAt(0,top+.1,0,{r:.2,kind:'chimney'});
 return {stove:{kind:'mass',mass_t:3.5,burns:'once a day, twice in the coldest months',flueRuns:0,chimney:{h:+(top-D.yFl).toFixed(2),damper:true,collar:false}},lamps:4,fuel:['larch','dung'],crownVent:.6,inlet:'passage and the stove\'s own duct'};}
ytRoomDef({key:'yt_quunsul_hall',name:'Quunsul hall (the council of the clans)',seed:9401,dims:{Rr:6.2,Ho:7.2,kind:'stone',pass:3.4,sink:.7},budget:200000,
 tags:{types:['civic'],wealth:'rich',style:'state',role:'council'},opts:{ribs:10,window:false,vent:false},
 note:'a ribbed stone hall: the clans\' benches in a ring round a central stone stove, its stack through the crown; the clans\' hangings',
 inside(D,season){const h=ytHallStove(D);ytBenchRing(D.Rr-.75,PI*.62,PI*2.38,D.yFl);ytBenchRing(D.Rr-1.6,PI*.7,PI*2.3,D.yFl);
  ytHanging('applique',D.Ri,D.Hi,.4,2.2,PI*1.15,PI*1.45);ytHanging('applique',D.Ri,D.Hi,.4,2.2,PI*1.55,PI*1.85);ytHanging('ob',D.Ri,D.Hi,2.35,2.75,PI*1.1,PI*1.9,.1);
  for(let i=0;i<4;i++){const a=PI*(1.2+i*.2);ytLamp(Math.cos(a)*(D.Rr-.35),D.yFl+.45,Math.sin(a)*(D.Rr-.35),-a-PI/2);}
  ytRug('mosaic',0,D.yFl,2.2,2.4,1.6,0);wkPad(0,0,D.Rr*1.4,D.Rr*1.4,D.yFl);
  FURNISH('generic_writing_supplies',.9,D.yFl,-D.Rr+1.2,0);FURNISH('generic_tea_set',-1.2,D.yFl,-D.Rr+1.3,0);FURNISH('generic_spirits',1.6,D.yFl,-D.Rr+1.5,0);FURNISH('generic_water',-2.0,D.yFl,1.8,0);
  return h;},
 after(D){ytSerge(-2.6,D.Ro+2.4,3.0);ytSerge(2.6,D.Ro+2.4,3.0);}});
ytRoomDef({key:'yt_song_house',name:'Song house (the qaggiq)',seed:9403,dims:{Rr:5.6,Ho:6.2,sink:.5,pass:2.8},budget:160000,
 tags:{types:['civic'],wealth:'middle',style:'state',role:'song house'},
 note:'the town\'s great pycrete dome, lined: no fire but its lamps and its crowd; the drum dancers\' floor in the middle, the benches round the wall',
 inside(D,season){ytBenchRing(D.Rr-.6,PI*.65,PI*2.35,D.yFl);ytDrum(0,D.yFl,-.6,0);ytRug('mosaic',0,D.yFl,.4,2.6,2.6,0);
  for(let i=0;i<6;i++){const a=PI*(.85+i*.26);ytLamp(Math.cos(a)*(D.Rr-.3),D.yFl+.45,Math.sin(a)*(D.Rr-.3),-a-PI/2);}
  wkPad(0,0,D.Rr*1.4,D.Rr*1.4,D.yFl);FURNISH('generic_water',-1.6,D.yFl,-D.Rr+1.0,0);FURNISH('generic_ale',1.6,D.yFl,-D.Rr+1.0,0);FURNISH('generic_tea_set',2.4,D.yFl,1.2,0);FURNISH('generic_snack_bowl',-2.4,D.yFl,1.2,0);
  return {stove:null,lamps:6,fuel:'fat',crowd:true,heated:season!=='summer'};}});
ytRoomDef({key:'yt_shrine',name:'Shrine (the spirit house)',seed:9405,dims:{Rr:2.6,Ho:3.6,kind:'stone',pass:2.4},budget:80000,
 tags:{types:['religious'],wealth:'middle',style:'state',role:'shrine',job:'worship'},opts:{window:false},
 note:'a small stone dome: carved masks round its wall, the shaman\'s drum, offerings on a slab altar under the vent',
 inside(D){ytMaskWall(D.Ri,D.Hi,1.5,PI*1.05,PI*1.95,9);ytMaskWall(D.Ri,D.Hi,2.15,PI*1.15,PI*1.85,6);
  box('soap',0,D.yFl,-D.Rr+.9,1.4,.75,.6,P('ice'));ytLamp(-.4,D.yFl+.75,-D.Rr+.9,0);ytLamp(.4,D.yFl+.75,-D.Rr+.9,0);ytDrum(1.2,D.yFl,0,-.6);
  FURNISH('generic_herb_bundles',.0,D.yFl+.75,-D.Rr+.95,0);FURNISH('generic_candle_supply',-1.1,D.yFl,-.4,0);FURNISH('generic_meal',.0,D.yFl,.6,0);FURNISH('generic_cured_meat',-1.0,D.yFl,.9,0);
  wkPad(0,0,D.Rr*1.3,D.Rr*1.3,D.yFl);return {stove:null,lamps:2,fuel:'fat',heated:false};}});
/* the clan tomb: a corbelled mound, no room to walk: the dead lie in stone cists round a low inner chamber */
defBuilding({key:'yt_clan_tomb',name:'Clan tomb (corbelled mound)',seed:9407,w:9,d:9.5,h:3.4,cut:true,budget:50000,
 tags:{types:['funerary'],wealth:'middle',style:'state',role:'tomb'},
 note:'a corbelled dry-stone mound half sunk in the ground, turfed; a low door under a lintel stone, stone cists round the chamber; an inuksuk keeps it',
 holes:o=>[{circle:[0,-.5,2.6]}],
 build(o){CURREC.season='winter';CURREC.layers=[{k:'stone',m:.6},{k:'turf',m:.3}];CURREC.heat={stove:null,heated:false,crownVent:0};
  W(0,0,-.5,0,()=>{const R=3.0,H=2.6,dr={arch:{hw:.45,hv:.45,ys:-.1},grow:-.03};
   ytShell('slab',ytCorbelProf(R,H,0,.3,0),P('slab'),{doors:[dr]});ytShell('slab',ytCorbelProf(R-.5,H-.45,0,.3,0),P('slab'),{doors:[dr],inward:true});
   ytDome('turfCap',R+.25,H+.25,P('ice'),{doors:[{arch:{hw:.75,hv:.75,ys:-.1},grow:-.2}]});
   ytPitWall(R-.5,R,-.9,[{ga:PI/2,w:1.0}]);cyl('earth',0,-1.0,0,R-.5,.1,P('earth'),24);
   for(let i=0;i<6;i++){const a=PI*(1.05+i*.18);W(Math.cos(a)*(R-1.0),-.9,Math.sin(a)*(R-1.0),-a,()=>box('slab',0,0,0,.6,.5,1.5,P('slab')));}
   box('slab',0,.45,R-.15,1.6,.35,.6,P('slab'));for(const s of [-1,1])box('slab',s*.62,-.9,R-.1,.3,1.35,.6,P('slab'));
   W(1.6,0,R+1.0,0,()=>{box('slab',0,0,0,.4,.6,.25,P('slab'));box('slab',0,.6,0,.9,.18,.22,P('slab'));box('slab',0,.78,0,.26,.4,.24,P('slab'));box('slab',0,1.18,0,.2,.16,.2,P('slab'));});
   door(0,-.9,R,0,.9);FURNISH('generic_herb_bundles',0,-.9,0,0);FURNISH('generic_candle_supply',.6,-.9,.4,0);FURNISH('generic_meal',-.6,-.9,.4,0);FURNISH('generic_storage_jar',0,-.9,-1.2,0);});}});
/* the High Chief's hall: a ribbed stone hall over a cluster ring (the clan compound's plan, grown) */
const YT_CHIEF_SATS=[['yt_sleep_dome',YT_SLEEP,.22],['yt_store_dome',YT_STORE,PI-.22]];
const [YT_CHIEF,YT_CHIEF_C]=ytDwellPair({Rr:5.0,Ho:6.4,kind:'stone',pass:3.4,zPlat:-1.2,sink:.7}).map(D=>ytClusterPlan(D,YT_CHIEF_SATS));
defBuilding({key:'yt_chief_hall',name:"High Chief's hall (Khaay Chiip)",seed:9409,w:YT_CHIEF.w,d:YT_CHIEF.d,h:YT_CHIEF.D.h,cut:true,budget:320000,
 tags:{types:['civic'],wealth:'rich',style:'state',role:'chief'},mouth:YT_CHIEF_C.D.cz+YT_CHIEF_C.D.z1,
 note:"a ribbed stone hall with the mass heater under its platform, the high seat on it under hangings and beadwork; a cold store and a guards' sleeping dome off its floor; serge at the door",
 holes:o=>o.covered?ytClusterHoles(YT_CHIEF_C,true):ytClusterHoles(YT_CHIEF,false),
 build(o){const C=o.covered?YT_CHIEF_C:YT_CHIEF,D=C.D;ytClusterBuild(C,o);
  W(0,0,D.cz,0,()=>{ytRibs('slab',D.Ri-.35,D.Hi-.3,10,.32,P('slab'),{rTop:D.rVent+.1});
   const yP=D.yPlat+.07;box('larch',0,yP,D.zPlat-1.3,1.4,.55,.9,P('larch'));box('muskox',0,yP+.55,D.zPlat-1.3,1.3,.08,.8,P('ice'));box('carved',0,yP+.55,D.zPlat-1.75,1.4,1.3,.12,P('larch'));
   ytHanging('applique',D.Ri,D.Hi,yP+.4,yP+2.5,PI+.45,PI*1.42);ytHanging('applique',D.Ri,D.Hi,yP+.4,yP+2.5,PI*1.58,TAU-.45);ytHanging('amur',D.Ri,D.Hi,yP+2.65,yP+3.2,PI+.45,TAU-.45,.1);
   box('bead',0,D.yFl+.28,D.zPlat+.04,3.4,.5,.02,P('ice'));ytRug('mosaic',0,D.yFl,D.zPlat+1.6,3.6,2.2,0);
   for(const s of [-1,1]){ytSerge(s*2.8,D.Ro+2.8,3.2);W(0,D.yFl,0,0,()=>ytSerge(s*2.2,D.zPlat+.6,2.6));}
   FURNISH('generic_strongbox',2.2,yP,-2.2,-.6);FURNISH('generic_spirits',-1.4,yP,-1.6,.2);FURNISH('generic_writing_supplies',1.2,yP,-1.8,0);});
  CURREC.riches=['applique','amur','mosaic','bead','serge','high seat'];}});
