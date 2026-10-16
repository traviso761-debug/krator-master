// ================================================================= HOST — the fauna (kits/fauna, read as its bundle)
// All fauna is the fauna kit's (biomes/README.md, "A fauna kit"): the isle's animals are its presets as they are, built by
// KratorFauna.build and placed here by the island's own fields (the kit itself places none). The Ring Sea's set on the
// shore and in the water (isle tortoises, shore iguanas, tide foxes, gulls and cormorants; sea turtles, a reef octopus,
// reef fish over the coral, ring sharks off the reef, a giant sea lion on the bench, dolphins offshore), swbay's savanna
// grazers on the savanna (plains grazers and dune hartebeest in herds, a savannah stalker). Each idles, grazes or swims in
// place on the host's clock (KratorFauna.animate). build.py --no-fauna leaves the bundle out, and this places nothing.
const FAUNA=[];let FAUNA_TICK=null;
(function(){if(typeof KratorFauna==='undefined')return;
 reseed(8801);
 // a candidate point: tries a random place in the box until the test (x, z, h, depth) passes
 const find=(box,test,tries)=>{for(let t=0;t<(tries||400);t++){const x=rr(box[0],box[2]),z=rr(box[1],box[3]),h=terrainH(x,z),d=waterH(x,z)-h;if(test(x,z,h,d))return[x,z,h,d];}return null;};
 const ISL=[TERR.X0+200,TERR.Z0+200,TERR.X1-200,TERR.Z1-200];
 const sav=(x,z,h,d)=>d<-.3&&(FIELD['koppen:Aw'](x,z)+FIELD['koppen:XV'](x,z))>.6&&FIELD.slope(x,z)<.4&&FIELD.garden(x,z)<.1;
 const stp=(x,z,h,d)=>d<-.3&&(FIELD['koppen:BSh'](x,z)+FIELD['koppen:XS'](x,z))>.6&&FIELD.slope(x,z)<.4&&FIELD.pan(x,z)<.2;
 const beach=(x,z,h,d)=>d<-.2&&FIELD.beach(x,z)>.5;
 const lagoon=(x,z,h,d)=>d>.9&&d<3.2&&FIELD.lagoon(x,z)>.5;
 const reefOut=(x,z,h,d)=>d>5&&d<20&&reefD(x,z)<-40;
 const deep=(x,z,h,d)=>d>18;
 // one animal: built, placed on the ground or at a depth, turned, its mode for the clock
 function put(key,p,o){if(!KratorFauna.has(key)||!p)return null;o=o||{};let g;try{g=KratorFauna.build(key,{seed:ri(1,99999),variant:o.variant})}catch(e){reportErr('fauna '+key+': '+e.message);return null;}
  const y=o.swim!=null?waterH(p[0],p[1])-o.swim:terrainH(p[0],p[1]);g.position.set(p[0],y,p[1]);g.rotation.y=o.yaw==null?rr(0,TAU):o.yaw;
  g.traverse(m=>{if(m.isMesh){m.userData.probeSkip=true;m.userData.inspectLabel=g.userData.name+' (kits/fauna)';}});g.userData.fauna=true;
  scene.add(g);FAUNA.push({g,key,mode:o.mode||'idle',phase:rr(0,10)});return g;}
 // a herd: n animals round a point, facing roughly one way
 function herd(key,box,test,n,o){const c=find(box,test);if(!c)return;const yaw=rr(0,TAU);
  for(let i=0;i<n;i++){const p=find([c[0]-40,c[1]-40,c[0]+40,c[1]+40],test,60);if(p)put(key,p,Object.assign({yaw:yaw+rr(-.8,.8),mode:rng()<.6?'graze':'idle'},o));}}
 herd('plains-grazer',ISL,sav,9);herd('plains-grazer',ISL,sav,6);herd('dune-hartebeest',ISL,sav,6);
 put('savannah-stalker',find(ISL,sav),{mode:'idle'});
 put('isle-tortoise',find(ISL,stp),{mode:'graze'});put('isle-tortoise',find(ISL,sav),{mode:'graze'});put('isle-tortoise',find(ISL,stp),{mode:'rest'});
 for(let i=0;i<5;i++)put('shore-iguana',find(ISL,beach),{mode:'rest'});
 put('tide-fox',find(ISL,beach),{mode:'idle'});put('tide-fox',find(ISL,beach),{mode:'walk'});
 for(let i=0;i<6;i++)put('seagull',find(ISL,beach),{mode:'idle'});
 const BB=[BENCH.x-BENCH.r,BENCH.z-BENCH.r,BENCH.x+BENCH.r,BENCH.z+BENCH.r],bench=(x,z,h,d)=>d<-.1&&FIELD.bench(x,z)>.5;
 put('giant-sea-lion',find(BB,bench),{mode:'rest'});for(let i=0;i<3;i++)put('ring-cormorant',find(BB,bench),{mode:'idle'});
 // the water: turtles and fish a little under the surface, the octopus on the bottom, sharks and dolphins further out
 put('giant-sea-turtle',find(ISL,lagoon),{swim:.5,mode:'swim'});put('giant-sea-turtle',find(ISL,lagoon),{swim:.7,mode:'swim'});
 {const p=find(ISL,(x,z,h,d)=>d>.6&&d<2.5&&FIELD.reef(x,z)>.3);if(p){for(let i=0;i<8;i++)put('banner-reef-fish',[p[0]+rr(-6,6),p[1]+rr(-6,6)],{swim:rr(.3,Math.max(.4,p[3]-.3)),mode:'swim'});}}
 {const p=find(ISL,lagoon);if(p)put('reef-octopus',p,{mode:'idle'});}
 put('ring-shark',find([TERR.X0,TERR.Z0,TERR.X1,TERR.Z1],reefOut),{swim:2,mode:'swim'});
 put('ring-dolphin',find([TERR.X0,TERR.Z0,TERR.X1,TERR.Z1],deep),{swim:.4,mode:'swim'});put('ring-dolphin',find([TERR.X0,TERR.Z0,TERR.X1,TERR.Z1],deep),{swim:.6,mode:'swim'});
 FAUNA_TICK=(dt,t)=>{for(const F of FAUNA)KratorFauna.animate(F.g,t+F.phase,F.mode);};
})();
_mark('fauna');
