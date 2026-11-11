// ================================================================= HOST — the air and the water: core/atmos bound, the steam, the hot water (forked from biomes/hearths')
// No vent here (6.2 km of rock): no shaft of daylight. The steam rises from the lower storey's water up the feeder wells.
// core/atmos on this page's ticks, ground and camera (no sky: the cave's haze is the scene's fog). Then:
//   THE VENTS' LIGHT   a fading cone down each throat (ATMOS.spotCone), and the spot (49), both by the hour: day 6-18, a grey dusk, none at night
//   THE STEAM          off the hot water in each feeder well and out of its mouth into the chamber (ATMOS.smoke, steam)
//   THE HOT WATER      the storey's water table in each well (core/water's still WATER.open, 55 degC, sulphurous: milky green-grey), at
//                      CAVE.wells' level, 29 m under the drained storey's floor
const hourNow=()=>typeof KHOST!=='undefined'&&KHOST.host?KHOST.host.clock.hour:12;
const daylight=h=>smooth(5.6,7.4,h)*(1-smooth(17.4,19.2,h));
ATMOS.bindHost({THREE,scene,camera,renderer,ticks:TICKS,ground:(x,z)=>terrainH(x,z),hour:hourNow,seed:6551,viewH:()=>innerHeight});
const AIR=(function(){const out={cones:[],steam:null,water:[]};
 // ---- the vents' shafts of daylight
 CAVE.throats.forEach(T=>{const len=T.ground-STOREY_Y+3,o={len,rad:T.r+len*.07,opacity:.06,on:0,off:40,color:GOLD?0xffd890:0xfff1da,glow:4};
  const c=ATMOS.spotCone(T.c[0],T.ground+1,T.c[1],[0,-1,0],o);c.userData.probeSkip=true;c.userData.inspectLabel='Daylight down the vent';out.cones.push({c,o});});
 tick(function ventLight(){const k=daylight(hourNow());out.cones.forEach(q=>{q.o.opacity=Math.max(1e-4,.06*k);});if(VENT_SUN)VENT_SUN.intensity=3.2*k;});
 // ---- the steam: off the scalding pools (KTHERM over the feeders), up each feeder well to its mouth, and up the fumarole's shaft
 const E=[],SC=SITE.therm.scald,WL=CAVE.water?CAVE.water.level:SITE.net.table;
 (CAVE.water?CAVE.water.pools:[]).filter(p=>p.temp>=SC).forEach(p=>{for(let k=0;k<3;k++){const a=k*2.1;E.push([p.c[0]+Math.cos(a)*p.r*.4,WL+.3,p.c[1]+Math.sin(a)*p.r*.4,'steam']);}});
 CAVE.wells.forEach(W=>{E.push([W.c[0],W.level+.4,W.c[1],'steam'],[W.c[0],W.mouth-1,W.c[1],'steam'],[W.c[0],W.mouth+.5,W.c[1],'steam']);});
 if(CAVE.fumarole){const F=CAVE.fumarole;for(let y=F.y0+.5;y<F.ground;y+=6)E.push([F.c[0],y,F.c[1],'steam']);}
 if(E.length){out.steam=ATMOS.smoke(E,{n:22});if(out.steam){out.steam.userData.probeSkip=true;out.steam.userData.inspectLabel='Steam off the hot water';}}
 // ---- the water: the table over the active storey's floor, one still surface flooded from its pools (core/water's shore grid on the floor read
 //      off the cavern: WATER_BED, 49), milky green-grey with sulphur
 const lin=c=>new THREE.Color(c).convertSRGBToLinear();
 if(CAVE.water&&WATER_BED){const Wt=CAVE.water,b=Wt.box;
  const S=WATER.open({name:'The lower storey\'s water (warm, sulphurous: the Epidote-Steam Tarn\'s source)',level:Wt.level,field:.04,bounds:b,bed:WATER_BED,bedBox:b,
   shore:{cell:2,band:12,seeds:Wt.seeds.concat(CAVE.wells.map(w=>w.c)),land:(x,z)=>WATER_BED(x,z)>Wt.level+.2}});
  const D=WATER.draw(S,{renderOrder:1,roughness:.12,metalness:.05,envMapIntensity:0,surf:false,breakers:false,pick:true,shallow:lin(0xa8b4a0),deep:lin(0x56685e)});
  D.mesh.userData.inspectLabel=S.name;D.mesh.userData.probeSkip=true;out.water.push(D);}
 return out;})();
window._air={cones:AIR.cones.length,steam:!!AIR.steam,water:AIR.water.length};
