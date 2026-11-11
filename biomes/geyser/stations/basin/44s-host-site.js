// ================================================================= HOST — STATION 3, THE MOUNTAIN FOREST FIELD (`--station basin`; PLAN-STATIONS.md, station 3)
// Earth basis: Yellowstone's geyser basins (2.2-2.5 km in lodgepole pine), Kamchatka's Valley of Geysers. THE SITE ON SCALE MODEL 5.1 (surveyed
// 2026-11-09): the geyser vent at px 1454,1684 (old canvas 1182,1354): 3,249 m, 1.07 atm, 345 mm a year, mean +9 degC (warmest month +22, coldest -4),
// class Dwc (the monsoon's summer rain, dry cold winters), on a shelf that runs flat 10-20 km west, east and north; a range rises south of it, 4.5 km
// 10 km out and 8.6 km 20 km out (HF). The plan's sites (the rift rim's three vents) went to the Hearths' host (riftrim; the owner, 2026-11-02): this is
// the mountain forest vent left on map 5.1, the nearest of the new eastern vents to the plan's forest.
// THE PAGE: a geyser basin cut a few metres into a forested shelf: lodgepole pine round it (75: FIELDFLORA), the kit's own warm-ground life on the
// floor (the steaming meadow's panic grass and moss), the run-off's mats in their cooler colours, and where the silica run-off spread into the forest,
// stands of dead pines whitened to the knee ("bobby socks": the kit's snags, here lodgepoles); the range's wall south. Summer by default; ?snow=1 is
// the winter, the snow lying on all but the warm ground.
const BASIN_SNOW=new URLSearchParams(location.search).get('snow')==='1';
const STATION_SITE={region:'The mountain forest geyser basin (station 3, ideal type)',fieldName:'The mountain forest basin',px:[1454,1684],
 sky:{px:1182,py:1354,pressure:1.07,humidity:.5,clouds:.35},amb:9,seed:73,wind:[.7,.5],haze:0xc4ccd4,fog:.00016,cold:BASIN_SNOW?.9:.2,wet:.5,
 climate:{cold:true},skyGround:0x2e3a2a,
 field:{x:0,z:-80,r:560,e:.8},
 land:(x,z)=>{const r=Math.hypot(x/1.15,(z+80)),bowl=-6*smooth(900,300,r),n=fbm(x*.0016+2,z*.0016+7,7301,3)-.5,n2=fbm(x*.006,z*.006,7302,2)-.5;
  const range=smooth(1600,12000,z)*1300+smooth(9000,22000,z)*4000;   /* the range south: 4.5 km on the model 10 km out, 8.6 km 20 km out */
  return bowl+28*n*smooth(500,1400,r)+3*n2+range;},
 far:{label:'The forested shelf and the range south',haze:[170,180,190],
  color:(x,z,y,q)=>{const L=a=>a.map(v=>Math.pow(v/255,2.2)),m=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t),n=clamp(fbm(x*.003,z*.003,7303,2),0,1);
   let c=m(L([40,58,36]),L([54,70,44]),n);c=m(c,L([110,106,100]),smooth(900,1600,y));return m(c,L([232,236,240]),smooth(BASIN_SNOW?300:2400,BASIN_SNOW?700:3200,y));}},
 thermal:()=>FIELD_SPEC({seed:73,r:500,e:.8,amb:9,
  geysers:{n:6,H:[10,45],period:[3600,36000],dur:[120,1500],kinds:['cone','fountain','cone'],names:['The Lodge Geyser (a cone geyser)','The Hearth Fountain (a fountain geyser)']},spouters:3,
  springs:{n:13,r:[2.5,7],temp:[.45,1],big:30},acid:{n:1,r:85,mud:6,fumaroles:12},fumaroles:{n:4},dead:{r:150,n:3,f:.95,name:'Bobby-sock pines (the silica run-off killed them)'},runLen:520}),
 passes:['snag'],
 species:SP=>{const S=SP.find(q=>q.key==='snag');S.H=[8,22];S.rb=[.14,.3];S.crownR=[1.5,3.2];S.name='Bobby-sock pine (a lodgepole the silica killed)';},
 flora:{lodgepole:{cell:9,near:750,accept:(x,z)=>{const g=GEYSER.at(x,z),fl=basinK(x,z),sl=FIELD.slope(x,z);if(g.spring>0||g.sinter>.15||g.acid>.1||g.dead>.15||g.film>.1||sl>.75)return 0;
   return .62*smooth(.55,.15,fl)*smooth(THERMAL.amb+5,THERMAL.amb+1.5,g.T);}}},
 take:{build:'geyser-basin',hour:13,   /* 11:00, the owner's view hour, is in the giant's eclipse here (09:30-11:30) */
 title:'Krator biome — the mountain forest geyser basin (station 3)',
  types:{'field/flora':'pass','geyser/trees':'pass','geyser/floor':'pass'},
  baseChecks:['nothing lives on the scalding ground','every geyser erupts on its own cycle','the springs brim at their rims','the dead forest stands dead','every species and plant tagged','preset cameras clear of the ground'],
  baseNegatives:['a fern in the Great Prism','a geyser with no column','a spring 2 m over its rim','a snag out on the open floor','a species with no origin','a camera under the ground'],
  exportProfile:['registry','items','buckets','materials','textures','terrain','stage','atmos','water'],
  hint:"Station 3, the mountain forest field: a geyser basin on a forested shelf at 3,250 m (1.07 atm, 345 mm, Dwc), lodgepole pine round it and a range rising south. Geysers on their own cycles (one to ten hours), a great prismatic spring, the steaming meadow's panic grass and moss on the warm floor, the run-off's mats, and the bobby-sock pines: lodgepoles the silica run-off killed, whitened to the knee. ?snow=1 for the winter, the snow lying on all but the warm ground (ideal type)",
  views:()=>{const g=biggest(LAYOUT.geysers.filter(q=>q.kind!=='spouter'),'H'),s=biggest(LAYOUT.springs,'r'),d=LAYOUT.dead[0];
   return{'The forest basin':fieldView(0,-80,1.9,820,70,0),'The Lodge Geyser':fieldView(g.x,g.z,.9,g.H*3+60,6,g.H*.5),'The great spring':[s.x+s.r+60,s.level+70,s.z+s.r+50,s.x,s.level,s.z],
    'Bobby-sock pines':fieldView(d.x,d.z,Math.atan2(-d.z,-d.x),d.r+50,3,4),'The forest edge':fieldView(0,-80,-.4,700,6,8),'The range south':fieldView(0,-80,-1.6,500,30,300),'From above':[-1000,1150,1200,0,0,-120]};},
  erupt:{'The Lodge Geyser':'g0'},
  checks:(add,P)=>{const F=window._flora||{trees:0},hot=P.filter(p=>p[4]==='geyserfield'&&GEYSER.at(p[0],p[2]).T>THERMAL.amb+6);
   add('the lodgepole forest round the basin, none on the hot ground or the sinter',{ok:F.trees>800&&!hot.length,detail:F.trees+' lodgepoles'+(hot.length?', '+hot.length+' items on hot ground':', none on hot ground')});},
  negatives:(add,P)=>{const L=LAYOUT.springs[0];add('a lodgepole in the great spring',{ok:![[L.x,0,L.z,'biome:fneedle','geyserfield']].some(p=>GEYSER.at(p[0],p[2]).T>THERMAL.amb+6),detail:'a needle clump at the spring'});}}};
// THE GROUND (84): the forest's needle duff, the meadow's grass and moss (the kit's paint), rock, snow (the `sand` channel; ?snow=1), the dead stands'
// and the flats' sinter, the acid clay, the mud; the run-off's mats in cooler colours (more olive and brown, less orange)
const STATION_GROUND={
 paint:(x,z,y,g,c,GA,slope)=>{const warm=smooth(2,9,g.T-THERMAL.amb);GA.sand=BASIN_SNOW?clamp((1-warm)*(1-smooth(.6,.85,slope))*(1-g.film)*(1-g.spring),0,1):0;
  if(BASIN_SNOW){c.lerp(new THREE.Color(.9,.92,.95),GA.sand*.8);GA.r=c.r;GA.g=c.g;GA.b=c.b;}},
 layers:[['st.needles','0.65','vec3(1.0)','needle duff'],['grass','grass*0.9','mix(vec3(1.0),base*3.0,0.3)'],
  ['moss','grass*smoothstep(0.03,0.09,heat)*(1.0-smoothstep(0.2,0.32,heat))*0.8'],['rock','rock'],['st.snow','sand','vec3(1.0)','snow'],
  ['sinter','dead*0.7','vec3(0.78,0.76,0.72)','dead sinter'],['sinter','sin_','mix(vec3(0.74,0.72,0.68),vec3(1.0,0.98,0.94),_sk)'],
  ['clay','acid*0.9','mix(vec3(1.0),base*1.4,0.6)'],['mud','mud*0.95']],
 mats:'vec3 c=vec3(0.3,0.28,0.14);c=mix(c,vec3(0.46,0.28,0.12),smoothstep(0.1,0.17,h));c=mix(c,vec3(0.7,0.42,0.14),smoothstep(0.25,0.32,h));c=mix(c,vec3(0.72,0.66,0.24),smoothstep(0.42,0.47,h));c=mix(c,vec3(0.56,0.66,0.36),smoothstep(0.5,0.55,h));return pow(c,vec3(2.2));'};
