// ================================================================= HOST — Godshearth's air (station 1), after the air is bound (the field stage's 89w-host-sea: ATMOS.init)
// THE TEMPERATURE (PLAN.md section 3, the owner's climate; the model's since scale model 5.1 edit 1): the floor's mean by the season (warm month +15,
// cold -2: KCLOCK's season on the host's clock), 17 degC between day and night (the high at 15:00, the low at 03:00: 24/+6 in summer, +7/-10 in winter),
// 6 degC a km over the floor, and on clear nights the COLD-AIR POOLS: the low ground away from the vents up to 7 degC colder (to -17 in winter). Near
// the ground the warm ground wins (KTHERM's vent line, the geyser kit's springs and run-off). KHAZ.provide('temperature'): a walker freezes on a winter
// night on the open floor and not on the coal moss.
// THE SNOW THAT LIES (core/atmos fx/snowcover; the field stage's bindWeather lays the cover on a cold climate): every lit material holds snow in a
// snowfall, and the warm ground stays bare (ATMOS.snowBare, set here before the first frame compiles the shaders): a mask of
// the hotter of KTHERM's field and the geyser kit's ground, bare over the soil + 3 degC. ?snow=1 opens on a full cover (a winter view).
// THE STEAM, in groups (fx/smokegroups): the vent line's fumaroles, steady; the lake's shore vents (the model's record) and, 6 km out, a column over its
// bed vents, steady; and STEAM BANKS on the hot lake along the shore, which thicken as the air cools (the cold night over warm water: strongest at dawn
// in winter, nearly gone on a summer afternoon).
// THE NIGHT WIND (core/atmos fx/katabatic): on a clear night the cold air drains down the floor to the lake, west (ATMOS.windBase: every plume drifts
// with it), strongest before dawn; by day the lake breeze blows back onshore, east. An overcast night barely drains.
// THE FROST: on a clear night under 1 degC hoar frost whitens the meadow (the snow cover's base, ATMOS.U.snowBase, up to .35: up-facing surfaces, the
// warm ground bare by the same mask as the snow), thickest before dawn, gone by mid-morning; ?frost=0 without it.
// THE ENGINE (HEARTH.work): the fans open flat by night and in an eclipse (ATMOS.sunHidden at this site), fold into silver spindles by day; cloud closes
// them; the floor's air is 1.01 atm, so thin air takes nothing off. One write a frame to the breath's shared state (core/biome 35, mode 'breath').
const GH_AIR=(function(){const q=new URLSearchParams(location.search),mean=STATION_SITE.amb;
 const season=()=>{const C=typeof KHOST!=='undefined'&&KHOST.host&&KHOST.host.clock;return C&&C.season?C.season().summer:0;};
 const hour=()=>{const C=typeof KHOST!=='undefined'&&KHOST.host&&KHOST.host.clock;return C&&C.hour!=null?C.hour:15;};
 const pool=(x,z)=>{const g=landH(x,z),warm=Math.max(GH_HEAT(x,z),GEYSER.at(x,z).T);return smooth(6,0,g)*smooth(STATION_SITE.amb+6,STATION_SITE.amb+1,warm);};   /* the low shore flats away from the warm ground */
 // the air's temperature at (x, y, z) at a season (-1 midwinter .. 1 midsummer) and an hour (0..24)
 const air=(x,y,z,s,h)=>{const m=6.5+8.5*s,day=Math.cos((h-15)/24*TAU),night=smooth(.1,-.6,day);
  return m+8.5*day-6*Math.max(0,y)/1000-7*night*pool(x,z);};
 const at=(x,y,z,s,h)=>{const g=terrainH(x,z),a=air(x,y,z,s,h),warm=Math.max(GH_HEAT(x,z),GEYSER.at(x,z).T);return y-g<3?Math.max(a,mix(warm,a,smooth(0,3,y-g))):a;};
 if(typeof KHAZ!=='undefined'&&KHAZ.provide)KHAZ.provide('temperature',(x,y,z)=>at(x,y,z,season(),hour()));
 // the snow: the bare mask
 let snow=null;
 if(q.get('snow')!=='0'&&ATMOS.snowCover&&ATMOS.snowBare){try{const S=TERR.R*1.1,cell=8,nx=Math.ceil(2*S/cell)+1,data=new Uint8Array(nx*nx),t0=STATION_SITE.amb+3,sf=3;
   for(let j=0;j<nx;j++)for(let i=0;i<nx;i++){const x=-S+i*cell,z=-S+j*cell,T=Math.max(GH_HEAT(x,z),GEYSER.at(x,z).T);data[j*nx+i]=Math.round(255*(1-smooth(t0,t0+sf,T)));}
   ATMOS.snowBare({x0:-S,z0:-S,cell,nx,nz:nx,data});   /* the cover and its hooks are the field stage's (bindWeather on a cold climate); the shaders compile at the first frame, after this */
   snow=ATMOS.snow||null;if(snow&&q.get('snow')==='1')snow.depth=1;}catch(e){reportErr('snow: '+e.stack);}}
 // the steam groups
 const lake=[];for(let z=-TERR.R+80;z<TERR.R;z+=70){const k=KRAND.unit(KRAND.hash(8140,Math.round(z),1)),x=shoreX(z)-30-140*k;lake.push([x,GH_LAKE.level+.3,z,'steam']);}
 const shoreV=[];for(let k=0;k<9;k++){const a=KRAND.unit(KRAND.hash(8141,k,1))*TAU,r=k?20+60*KRAND.unit(KRAND.hash(8141,k,2)):0;shoreV.push([GH_SHORE_V.x+Math.cos(a)*r,GH_LAKE.level+.3,GH_SHORE_V.z+Math.sin(a)*r,'steam']);}
 const bedV=GH_BED_V?[0,1,2,3,4].map(k=>{const a=k/5*TAU,r=k?300:0;return[GH_BED_V.x+Math.cos(a)*r,GH_LAKE.level+.5,GH_BED_V.z+Math.sin(a)*r,'steam'];}):[];
 let steam=null;try{steam=ATMOS.smokeGroups?ATMOS.smokeGroups(Object.assign({vents:{emitters:GH_FUM.map(f=>[f.x,terrainH(f.x,f.z)+.4,f.z,'steam']),n:16,k:.8},lake:{emitters:lake,n:22,k:.5},lakevents:{emitters:shoreV,n:24,k:.9}},bedV.length?{lakebed:{emitters:bedV,n:40,k:1.2}}:{}))
  :ATMOS.smoke(GH_FUM.map(f=>[f.x,terrainH(f.x,f.z)+.4,f.z,'steam']),{n:16});}catch(e){reportErr('steam: '+e.stack);}
 // the night wind
 let kat=null;try{if(ATMOS.katabatic)kat=ATMOS.katabatic({hour,down:[-1,0],speed:1.6,daySpeed:.7});}catch(e){reportErr('katabatic: '+e.stack);}
 // the frost: its depth now, on the open floor's air at 1 m (the shore's pools are colder still, but the cover is one value)
 const frostOn=q.get('frost')!=='0'&&!!(ATMOS.U&&ATMOS.U.snowBase);
 const frostK=(T,cloud,rain)=>.35*smooth(1,-5,T)*(1-smooth(.3,.8,cloud||0))*((rain||0)>.2?0:1);   /* the frost's depth at an air temperature, cloud and rain */
 const frost=()=>{const W=ATMOS.W||{};return frostOn?frostK(air(800,1,600,season(),hour()),W.cloud,W.rain):0;};
 return{air,at,season,hour,pool,snow,steam,kat,frost,frostK,frostOn,lakeEmitters:lake.length,shoreVents:shoreV.length,bedVents:bedV.length};})();
const GH_WORK={value:0};
tick(()=>{const d=new THREE.Vector3().subVectors(sun.position,sun.target.position).normalize(),alt=Math.asin(clamp(d.y,-1,1))*180/Math.PI;
 const t=ATMOS.clock?ATMOS.clock.t||0:0;
 if(GH_AIR.frostOn)ATMOS.U.snowBase.value=GH_AIR.frost();
 if(GH_AIR.steam&&GH_AIR.steam.set){const T=GH_AIR.air(shoreX(0)-60,1,0,GH_AIR.season(),GH_AIR.hour());GH_AIR.steam.set('lake',clamp((16-T)/18,.08,1.1));}   /* the lake's banks with the cold */
 if(typeof HEARTH==='undefined')return;const hid=ATMOS.sunHidden?ATMOS.sunHidden(t):0,W=ATMOS.W||null;
 GH_WORK.value=HEARTH.work(t,{sunAlt:sun.intensity<.02?-20:alt,hidden:hid,W:W?{cloud:W.cloud==null?0:W.cloud}:null,atm:1});
 BIO.breathState('hearths').value=GH_WORK.value;});
