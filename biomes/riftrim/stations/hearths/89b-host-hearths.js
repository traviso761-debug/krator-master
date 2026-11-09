// ================================================================= HOST — the Hearth field, after the atmosphere is bound (89a): the snow off the warm ground, the pools, the steam,
// the engine, the field's placement (LAND.build, which 89z runs before the bake) and the station's checks (biomes/hearths/PLAN.md sections 6, 11 item 1, 12)
// THE SNOW: the winter's lying snow (89a: LAND.snowBase) never lies on ground over 0 degC (KTHERM's snow mask: ATMOS.snowBare), so the discs and the fissure's
// seam stay bare and dark in a white country, their edge the 0 degree contour. Before the materials compile (the bake and snowOnScene are in 89z).
/* the mask's rows are nx bytes (701 here) and three.js uploads with a 4-byte row alignment by default: a row that is not a multiple of 4 shears the mask
   (the discs came out snowed). core/atmos's snowBare does not set it (KNOWN_ISSUES.md: owed to core); the station sets it on the texture snowBare returns */
if(ATMOS.snowBare){try{const t=ATMOS.snowBare(THERM.snowMask({box:THERM_BOX,cell:4,t0:0,soft:3}));if(t){t.unpackAlignment=1;t.needsUpdate=true;}}catch(e){reportErr('snow bare: '+e.stack);}}
// THE HOT POOLS (core/water/geyser 52, 52b): one WATER.spring on each of the three larger vents' aprons, banded from the middle out by its temperature
// (the Old Hearth's boils: deep blue; the west's sulphur-yellow rim; the east's cooler, its iron mats reaching in). The clock and light are the module's
// (ATMOS.hook, bound in 89a). Each a still surface, so WATER.fields (89z) gives the flora its shore
const HSPRING_MATS=new Map();
const HSPRINGS=STATION.POOLS.map(P=>{try{const S=WATER.spring({key:'hearths-'+P.vent,name:P.name,x:P.x,z:P.z,r:P.r,level:P.level,temp:P.temp,boil:P.temp>.9?1:0,mineral:P.mineral,kind:'pool',steam:0});
  const d=WATER.drawSpring(S,{THREE,scene,fog:scene.fog,mats:HSPRING_MATS,renderOrder:1});d.mesh.userData.inspectLabel=P.name+' (a hot pool, '+Math.round(40+P.temp*55)+' degC)';
  REGISTER({name:P.name+' (scalding)',x:P.x,z:P.z,y:P.level-3,r:P.r*1.3,h:6,spring:S.key,tags:{hazard:{kind:'heat',danger:.9,falloff:'none',shape:{type:'cyl',r:P.r,h:3},soak:{full:4,from:.5,out:20}}}});
  return S;}catch(e){reportErr('pool '+P.name+': '+e.stack);return null;}}).filter(Boolean);
// THE VENTS' HAZARDS (core/tags records before anything is drawn; KHAZ reads them): the fumaroles' heat at each pit, steady
HVENTS.filter(v=>v.kind==='point').forEach(v=>REGISTER({name:v.name+' (fumaroles at '+v.T+' degC; the ground over 25 degC is the hearth trees\')',x:v.x,z:v.z,y:terrainH(v.x,v.z)-2,r:20,h:8,
 tags:{hazard:{kind:'heat',danger:.6,falloff:'linear',shape:{type:'cyl',r:12,h:6},radiant:{reach:6,dose:.4,danger:.4}}}}));
// THE STEAM (core/atmos fx/smokegroups): the fumaroles round each pit and over each pool steady; a thin column over each disc that thickens with the night's work.
// The heat shimmer (fx/shimmer) is not taken: a post pass in the draw slot the sky and the reflections switch share (oidong's reason, the same here)
const HSTEAM=(function(){const vents=[],disc=[];
 HVENTS.filter(v=>v.kind==='point').forEach((v,j)=>{const n=v.reach>200?7:5;for(let k=0;k<n;k++){const a=k/n*TAU+.4+j,r=k?4+3*(k%3):0,x=v.x+Math.cos(a)*r,z=v.z+Math.sin(a)*r;vents.push([x,terrainH(x,z)+.4,z,'steam']);}
  const dr=discR(v)*.45;for(let k=0;k<3;k++){const a=k/3*TAU+1.1+j,x=v.x+Math.cos(a)*dr,z=v.z+Math.sin(a)*dr;disc.push([x,terrainH(x,z)+2,z,'steam']);}});
 STATION.POOLS.forEach(P=>vents.push([P.x,P.level+.3,P.z,'steam']));
 try{return ATMOS.smokeGroups?ATMOS.smokeGroups({vents:{emitters:vents,n:14,k:.75},disc:{emitters:disc,n:10,k:0}}):ATMOS.smoke(vents,{n:14});}catch(e){reportErr('steam: '+e.stack);return null;}})();
// THE ENGINE (HEARTH.work): the fans open flat by night and in an eclipse (ATMOS.sunHidden at this site), fold into silver spindles by day; cloud closes them.
// One write a frame to the breath's shared state; every fan's material reads it (core/biome 35, mode 'breath', shape 'fold')
const HWORK={value:0};
tick(()=>{const d=new THREE.Vector3().subVectors(sun.position,sun.target.position).normalize(),alt=Math.asin(clamp(d.y,-1,1))*180/Math.PI;
 const t=ATMOS.clock?ATMOS.clock.t||0:0,hid=ATMOS.sunHidden?ATMOS.sunHidden(t):0,W=ATMOS.W||null;
 HWORK.value=HEARTH.work(t,{sunAlt:sun.intensity<.02?-20:alt,hidden:hid,W:W?{cloud:W.cloud==null?0:W.cloud}:null,atm:LAND.atm});
 if(BIO.breathState)BIO.breathState('hearths').value=HWORK.value;if(HSTEAM&&HSTEAM.set)HSTEAM.set('disc',.15+.6*HWORK.value);});
// THE FIELD (biomes/hearths, read in place): one HEARTH.layout per disc on the one KTHERM bake, in the rim's dress (broad fans, few, on tall stalks; the dead
// stalks standing and broken, PLAN.md section 7a); the disc's reach is its vent's, the dead rings outside its 25 degC edge. The glass forest keeps off by LAND.keep
// (45's mask); the field's own mask keeps the water and the pools only. q: the rim's broad crowns at a little under half the Cold Hearths' density (budget)
LAND.build=function(){const Q=new URLSearchParams(location.search),q=(Q.has('q')?+Q.get('q'):1)*.5;HEARTH.parts('rim');
 const mask=(x,z)=>{const w=waterH(x,z);if(w>-1e8&&w>terrainH(x,z)-.3)return 0;for(const P of STATION.POOLS)if(Math.hypot(x-P.x,z-P.z)<P.r+1.2)return 0;return 1;};
 const all={trees:[],counts:{}};BIO.cur='hearths/field';
 HVENTS.filter(v=>v.kind==='point').forEach((v,i)=>{const r=discR(v),F=HEARTH.layout({therm:THERM_F,at:[v.x,v.z],R:r*1.7,dress:'rim',seed:KRAND.hash(7130,525,1400,i),
   toward:{az:0,alt:40},ground:terrainH,mask,deadRings:[r*1.1,r*2.1],q});   /* the dead rings wide: the heat has wandered (section 3's walk), so the rings lie far out */
  all.trees.push(...F.trees);for(const k in F.counts)all.counts[k]=(all.counts[k]||0)+F.counts[k];});
 BIO.cur=null;window._field=all;return{field:all.counts};};
// THE STATION'S CHECKS (99: LAND.checks and LAND.negatives), each with a broken input that must fail: the heat's bands hold every placement
const HC={field:c=>{const need=['hearth','fans','ember','coal','stoker','tallow','dead'],zero=need.filter(k=>!(c&&c[k]>0));return{ok:!zero.length,detail:zero.length?'none: '+zero.join(', '):need.map(k=>k+' '+c[k]).join(', ')};},
 trees:T=>{const bad=T.filter(t=>{const v=t.heat!=null?t.heat:heatAt(t.x,t.z);return v<25||v>60;});return{ok:T.length>0&&!bad.length,detail:bad.length?bad.length+' trees off 25-60 degC (first '+(bad[0].heat==null?heatAt(bad[0].x,bad[0].z):bad[0].heat).toFixed(1)+')':T.length+' hearth trees, all on 25-60 degC'};},
 ember:P=>{const E=P.filter(p=>p[3]==='biome:hember'),bad=E.filter(p=>{const v=heatAt(p[0],p[2]);return v<58||v>97;});return{ok:E.length>0&&!bad.length,detail:bad.length?bad.length+' mats off the hottest ground':E.length+' mats on 60-95 degC'};},
 forest:T=>{const bad=T.filter(t=>heatAt(t.x,t.z)>6);return{ok:T.length>0&&!bad.length,detail:bad.length?bad.length+' glass-forest trees on warm ground (first at '+bad[0].x.toFixed(0)+','+bad[0].z.toFixed(0)+')':T.length+' glass-forest trees, none over 6 degC'};},
 pools:S=>{const bad=S.filter(s=>{const P=STATION.POOLS.find(p=>'hearths-'+p.vent===s.key);return !P||heatAt(P.x,P.z)<45;});return{ok:S.length===3&&!bad.length,detail:S.length+' hot pools'+(bad.length?', '+bad.length+' on ground under 45 degC':', each over its vent (45 degC and over)')};},
 work:f=>{const w=f||((t,o)=>HEARTH.work(t,o)),night=w(0,{sunAlt:-20}),noon=w(0,{sunAlt:50}),ecl=w(0,{sunAlt:50,hidden:1}),cloud=w(0,{sunAlt:-20,W:{cloud:1}});
  const ok=night>.95&&noon<.05&&ecl>.95&&cloud<.5;return{ok,detail:'night '+night.toFixed(2)+', noon '+noon.toFixed(2)+', eclipse '+ecl.toFixed(2)+', overcast night '+cloud.toFixed(2)};}};
LAND.checks=(add,P)=>{const F=window._field||{trees:[],counts:{}};
 add('the Hearth field placed: hearth trees, fans, ember mat, coal moss, stokers, tallow, dead stalks',HC.field(F.counts));
 add('hearth trees on 25-60 degC ground only (KTHERM)',HC.trees(F.trees));
 add('the ember mat on 60-95 degC ground only',HC.ember(P));
 add('the glass forest off the warm ground (no tree over 6 degC)',HC.forest(RRIM.TREES||[]));
 add('three hot pools, each on a vent\'s apron',HC.pools(HSPRINGS));
 add('the engine: open at night, shut at noon, open in an eclipse (HEARTH.work)',HC.work());};
LAND.negatives=(add,P)=>{add('no stokers',HC.field(Object.assign({},(window._field||{}).counts,{stoker:0})));
 add('a hearth tree on cold ground',HC.trees([{x:2500,z:2500,heat:HSOIL}]));add('an ember mat on cool ground',HC.ember([[2500,0,2500,'biome:hember']]));
 add('a frost frill on the Old Hearth',HC.forest([{x:HVENTS[0].x,z:HVENTS[0].z}]));add('a pool off its vent',HC.pools(HSPRINGS.slice(0,2)));
 add('an engine open at noon',HC.work(()=>1));};
