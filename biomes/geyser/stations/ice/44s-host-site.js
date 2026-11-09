// ================================================================= HOST — STATION 5, THE ICE FIELD ON XANADU'S WALL (`--station ice`; PLAN-STATIONS.md, station 5)
// Earth basis: Mount Erebus's fumarolic ice towers and ice caves, Kverkfjoll under Vatnajokull. THE SITE ON SCALE MODEL 5.1 (surveyed 2026-11-09): the
// flank vent at px 1024,1485 (old canvas 752,1155) on the cone past the Catch's south-west notch (the vent at px 1042,1498, 8.5 km, 36 km east and
// 26 km south): 7,385 m, 0.64 atm, no rain (the water is the ice's), mean -21 degC (warmest month -8, coldest -34), class HF; the flank falls north to
// 5.9 km 20 km out (EF), 6.9 km east and west (HT). It stands on the lava tube tube_xanadu_se_10 (biomes/STATIONS-MAP-5.1.md). Water boils at ~88 degC.
// THE PAGE: an icefield on the flank (6.5% down to the north), the vent field melted into it as a hollow of bare, warm ash 14 m under the ice's surface,
// its edge an ice cliff; ice towers (fumaroles frozen round their own steam) on the ice round it, ice caves steam-melted into the cliff and lit blue
// from within (core/terrain's KGLACIER drawer), short steaming geysers erupting into frozen air, meltwater pools rimmed with ice, microbial films on the
// warm ground and no plants; the cone's ice rising south-east in the far field.
const ICE_C=[0,-40],ICE_R=360;
const meltK=(x,z)=>{const a=Math.atan2(z-ICE_C[1],x-ICE_C[0]),r=Math.hypot(x-ICE_C[0],(z-ICE_C[1])/.8)/(ICE_R*(1+.12*Math.sin(3*a+.4)+.07*Math.sin(7*a+1.9)+.1*(fbm(x*.006,z*.006,7501,2)-.5)));return smooth(1.04,.97,r);};   /* 1 in the melted hollow */
const STATION_SITE={region:'The ice field on Xanadu\'s south-eastern wall (station 5, ideal type)',fieldName:'The melted hollow',px:[1024,1485],
 sky:{px:752,py:1155,pressure:.64,humidity:.08,clouds:.05},amb:-21,seed:75,wind:[.9,-.3],haze:0xd4dce8,fog:.00005,cold:1,wet:.05,uplandH:200,
 climate:{cold:true,dry:true},skyGround:0xc8d4e0,
 field:{x:ICE_C[0],z:ICE_C[1],r:ICE_R*.85,e:.8},floorK:(x,z)=>meltK(x,z),
 land:(x,z)=>{const n=fbm(x*.002+3,z*.002-1,7502,3)-.5,cone=.065*z+Math.max(0,.04*(x-600));return cone+6*n+14*(1-meltK(x,z))+1.2*(fbm(x*.02,z*.02,7503,2)-.5)*(1-meltK(x,z));},
 far:{label:'The cone\'s icefield past the map (the summit 44 km south-east)',haze:[200,210,224],
  h:(x,z)=>.065*z+Math.max(0,.04*(x-600))+14+60*(fbm(x*.0008,z*.0008,7504,3)-.5),
  color:(x,z,y,q)=>{const L=a=>a.map(v=>Math.pow(v/255,2.2)),m=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t),n=clamp(fbm(x*.002,z*.002,7505,2),0,1);return m(L([214,224,236]),L([150,160,170]),smooth(.62,.75,n)*.6);}},
 thermal:()=>FIELD_SPEC({seed:75,r:300,e:.8,amb:-21,
  geysers:{n:4,H:[4,14],period:[600,3600],dur:[20,120],kinds:['cone','fountain'],names:['The Smoker (a cone geyser)']},spouters:3,
  springs:{n:10,r:[2,6],temp:[.35,.95],minerals:['sinter','sulfur']},acid:{n:1,r:55,mud:3,fumaroles:8},fumaroles:{n:4},dead:null,runLen:280}),
 passes:[],floor:false,
 take:{build:'geyser-ice',guards:false,   /* no plant, so no card: the foliage guards have nothing to hold (the Godthrone's way) */
title:'Krator biome — the ice field on Xanadu\'s wall (station 5)',
  hint:"Station 5, the ice field: a vent field melted into the icefield on a cone's flank at 7,400 m (0.64 atm, no rain, a mean of -21 °C; water boils at ~88 °C). A hollow of bare, warm ash under an ice cliff, short geysers steaming into frozen air, meltwater pools rimmed with ice, ice towers frozen round the fumaroles on the ice, ice caves melted into the cliff and lit blue from within, microbial films on the warm ground and no plants (ideal type)",
  views:()=>{const g=biggest(LAYOUT.geysers.filter(q=>q.kind!=='spouter'),'H'),T=(window._ice&&window._ice.towers)||[],C=(window._ice&&window._ice.caves)||[],t=T[0]||{x:ICE_R,z:0},c=C[0]||{x:0,z:ICE_R,face:0,R:12};
   return{'The hollow in the ice':fieldView(ICE_C[0],ICE_C[1],1.9,620,60,0),'The Smoker':fieldView(g.x,g.z,.8,g.H*4+40,5,g.H*.5),'Ice towers':fieldView(t.x,t.z,Math.atan2(ICE_C[1]-t.z,ICE_C[0]-t.x)+.4,40,4,4),
    'An ice cave':[c.x+Math.cos(c.face)*c.R*2.6,terrainH(c.x+Math.cos(c.face)*c.R*2.6,c.z+Math.sin(c.face)*c.R*2.6)+3,c.z+Math.sin(c.face)*c.R*2.6,c.x,terrainH(c.x,c.z)+c.R*.3,c.z],'From above':[-800,950,1100,0,0,-60]};},
  erupt:{'The Smoker':'g0'},
  checks:(add,P)=>{const I=window._ice||{towers:[],caves:[]},life=P.filter(p=>p[4]!=='geyser'||['biome:bead','biome:sinterknob','biome:stone','biome:boulder','biome:icetower'].indexOf(p[3])<0).filter(p=>p[3]!=='biome:icetower');
   add('no plants (microbial films only, in the ground)',{ok:!life.length,detail:life.length?life.length+' plants ('+[...new Set(life.map(p=>p[3]))].slice(0,3).join(', ')+')':'none'});
   add('ice towers round the fumaroles on the ice (KGLACIER)',{ok:I.towers.length>=8&&I.towers.every(t=>meltK(t.x,t.z)<.5),detail:I.towers.length+' towers'});
   add('ice caves melted into the ice cliff, facing the hollow',{ok:I.caves.length>=2&&I.caves.every(c=>meltK(c.x,c.z)<.6),detail:I.caves.length+' caves'});},
  negatives:(add,P)=>{add('an ice tower on the warm ash',{ok:[{x:ICE_C[0],z:ICE_C[1]}].every(t=>meltK(t.x,t.z)<.5),detail:'a tower at the hollow\'s middle'});}}};
// THE GROUND (84): the warm hollow's ash, the glacier's ice (the `sand` channel) everywhere the vents do not melt it, rock, the sinter, the acid clay and
// the mud; the run-off's films pale green and brown (microbial only: nothing grows)
const STATION_GROUND={
 paint:(x,z,y,g,c,GA,slope)=>{const m=meltK(x,z),warm=smooth(2,10,g.T-THERMAL.amb),ice=clamp((1-m)*(1-warm)+(1-warm)*smooth(.3,0,g.heat)*.0,0,1);
  c.setRGB(.3,.29,.28);c.lerp(new THREE.Color(.82,.88,.94),ice);GA.r=c.r;GA.g=c.g;GA.b=c.b;GA.sand=ice*(1-g.spring);GA.grass=0;GA.rock=GA.rock*(1-ice);},
 layers:[['st.ash','0.75','vec3(0.8)','ash'],['rock','rock'],['st.ice','sand','vec3(1.0)','glacier ice'],
  ['sinter','sin_','mix(vec3(0.74,0.72,0.68),vec3(1.0,0.98,0.94),_sk)'],['clay','acid*0.9','mix(vec3(1.0),base*1.4,0.6)'],['mud','mud*0.95']],
 mats:'vec3 c=vec3(0.2,0.18,0.12);c=mix(c,vec3(0.34,0.4,0.22),smoothstep(0.08,0.25,h));c=mix(c,vec3(0.5,0.36,0.18),smoothstep(0.3,0.45,h));return pow(c,vec3(2.2));'};
