// ================================================================= HOST — the final rebuild's air, wet and dust (2026-10-27; every sedesert page)
// One fragment for the kit's page and its three stations (the Bowl, Mantis's pocket, the steppe: they read src/ first), after core/atmos is
// bound (the kit's 89w-host-water.js, the stations' 89a-host-atmos.js) and the build is baked (88). What it reads of a page: scene, camera,
// renderer, MAT_GROUND, terrainH, waterH, FIELD (the stations' fields are a superset of the kit's), TERR. Each look change has its switch.
//   R8 + R7      the foliage sways in core/atmos's wind and its gust fronts (BIO.bindAtmosWind); cut-outs by alpha-to-coverage (BIO.setA2C)
//   R1 (?hfog=0) height fog: the page's dust haze thick at the ground and thinning with height, so the mesas, the Inner Wall's foot and the
//                rims stand out of it (no mist, no band: the desert's air is dry)
//   R10          the rain occlusion map: no rain and no wet ground under a crown or an overhang (rare here: the weather is dry)
//   R9 (?wet=0)  in the rain the ground darkens and glosses and its hollows hold puddles ringed by the drops; none under water
//   DUST (?dust=0) core/atmos's dust (3d-dust): sprites lifted off bare dry ground where the wind passes the threshold, and THE AIR'S LOAD
//                (fx/airload): the dust in mg/m3 the fog is drawn from (a 57 m sight is a 57 m wall), and KHAZ's dust, alkali and
//                visibility fields (core/hazard). THE DUST STORM: ?storm=1 (or the panel's air select) brings in a haboob from upwind
//                over a few seconds: the storm's load over the bare ground and what lies 2 km up the wind, a wall up to ~800 m high
const AIR=(function(){const q=new URLSearchParams(location.search),F=n=>typeof FIELD!=='undefined'&&FIELD[n]?FIELD[n]:null;
 const fv=(n,x,z)=>{const f=F(n);return f?f(x,z):0;},under=(x,z)=>waterH(x,z)>-1e8&&waterH(x,z)>=terrainH(x,z)-.3;
 const out={wind:false,a2c:false,hfog:false,raincover:null,wet:false,dust:false,load:null,storm:0};
 if(typeof BIO.bindAtmosWind==='function'){out.wind=BIO.bindAtmosWind();BIO.setA2C(renderer);out.a2c=true;}
 // the box the wet ground's hollows are baked over: the page's ground square (TERR.R*1.1 each way: the paint's square)
 const R=TERR.R*1.05,BOX=[-R,-R,R,R];
 if(q.get('hfog')!=='0'&&ATMOS.heightFog){ATMOS.heightFog({falloff:1/850,sun:.35,sky:.25});ATMOS.heightFogScene(scene);out.hfog=true;}
 /* STATION.rainCover false (the Bowl, 2026-11-08): its ground takes all nine library layers, and with the occlusion map the cloud shade adds
    to it the fragment shader needed 17 texture units; D3D gives 16 (the GPU verify: the ground did not compile). Rain is rare there */
 if(ATMOS.rainCover&&(typeof STATION==='undefined'||STATION.rainCover!==false)){try{out.raincover=!!ATMOS.rainCover({renderer});}catch(e){reportErr('rain cover: '+e.stack);}}
 // not on the stations (STATION: the Bowl's ground shader, which Mantis and the steppe take, already holds 15 of a fragment shader's 16
 // texture units with its library layers; the wet ground's puddle mask and rain map would push it over and the ground would not compile)
 if(q.get('wet')!=='0'&&WATER.hollows&&MAT_GROUND&&(typeof STATION==='undefined'||STATION.wet===true)){try{
  const H=WATER.hollows({h:(x,z)=>terrainH(x,z),box:BOX,cell:(BOX[2]-BOX[0])/512,blur:25,depth:.5,
   mask:(x,z)=>under(x,z)||fv('flow',x,z)>.5||fv('abyss',x,z)>.3||fv('lake',x,z)>.2?0:1});
  WATER.wetGround(MAT_GROUND,{rain:true,porosity:.55,puddles:H});out.wet=true;}catch(e){reportErr('wet ground: '+e.stack);}}
 // where dust can rise: bare dry ground; most off the dunes, the reg and the salt flats, least off rock, wet ground and the forest's floor
 const MASK=(x,z)=>{if(under(x,z))return 0;const wet=fv('wet',x,z),rock=fv('rock',x,z),ab=fv('abyss',x,z);
  return clamp((.45+.55*Math.max(fv('dune',x,z),fv('salt',x,z),fv('flat',x,z),fv('reg',x,z)*.8,fv('yard',x,z)*.7))*smooth(.5,.2,wet)*(1-.65*rock)*(1-ab),0,1);};
 if(q.get('dust')!=='0'&&ATMOS.dust&&ATMOS.airLoad){try{
  ATMOS.dust({color:[.80,.62,.46],mask:MASK});out.dust=true;
  // the alkali: the salt crust and the soda flats are caustic where the Bowl's dry lake beds lift (the main desert's red sand is not)
  const salty=F('salt')||F('flat');
  out.load=ATMOS.airLoad({alkali:salty?(x,z)=>clamp(.05+.45*Math.max(fv('salt',x,z),fv('flat',x,z)*.8),0,.5):null,colour:[.66,.50,.38]});
  out.storm=+(q.get('storm')||0);out.load.stormTo=clamp(out.storm,0,1);}catch(e){reportErr('dust: '+e.stack);}}
 return out;})();
// the panel's air select (99-host-take.js hands it to the host): a calm day, or a dust storm coming in off the desert
const AIR_CONTROL={select:[['calm','air: calm'],['storm','air: a dust storm (a haboob)']],id:'airsel',
 on:v=>{if(AIR.load)AIR.load.stormTo=v==='storm'?1:0;}};
if(AIR.storm>0)AIR_CONTROL.select.reverse();
