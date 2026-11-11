// ================================================================= HOST — the tarn, the springs and the sinter stair on core/water
// The records (WATER_RECS) are made here, then drawn once core/atmos is bound:
//   the TARN       WATER.open with no surf and no breakers (the still-water rule: a lake takes the shared wave field's calm share, its own two
//                  faint swells), over the ground's bed (its depth colour: the warm tarn's green-blue over the deep, pale over the apron's
//                  sinter shelf). The reflections of the land (core/water ext 58, WATER.mirror) are not taken at station 1 (KNOWN_ISSUES.md)
//   the SPRINGS    WATER.drawSpring (core/water/geyser 52b): each a disc banded from its middle out by its heat and mineral (the main
//                  spring's blue throat, the rust and the green pools), the main one churning
//   the STAIR      WATER.drawTerraces (core/water ext 53b): its treads one mesh (milky blue-white over the sinter), its risers' falls two
// The sky in every surface is core/atmos's skylight, a capture of the shared sky at the hour. Forked from biomes/wouterwall's.
// ---------------------------------------------------------------- the water records (core/water): the tarn, the springs, the stair
// Made here, not with the land (47): the springs' and the stair's records are core/water's opt-in fragments (geyser 52, ext 53), which
// slot after the land in the page's order
const WATER_RECS=typeof WATER==='undefined'?null:(function(){const out={};
 // THE TARN (WATER.open over the ground's bed, no surf and no breakers: still water). Its mask: 60 m cells by the model's water cells and their
 // neighbours where the ground lies under the level (+2 m): the outline follows the ground, not the 1 km grid (a 250 m mask drew a stepped shore)
 if(MODEL_LAKE){const G=NEOW_REGION.grid,xs=MODEL_WATER.map(w=>w.x),zs=MODEL_WATER.map(w=>w.z),R2=20000;
  const box=[Math.max(-R2,Math.min(...xs)-G.dx*1.5),Math.max(-R2,Math.min(...zs)-G.dz*1.5),Math.min(R2,Math.max(...xs)+G.dx*1.5),Math.min(R2,Math.max(...zs)+G.dz*1.5)];
  const cell=60,nx=Math.ceil((box[2]-box[0])/cell),nz=Math.ceil((box[3]-box[1])/cell),data=new Uint8Array(nx*nz);
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=box[0]+(i+.5)*cell,z=box[1]+(j+.5)*cell;if(!MODEL_LAKE.near(x,z))continue;
   let lo=1e9;for(const q of [[0,0],[-.5,-.5],[.5,-.5],[-.5,.5],[.5,.5]])lo=Math.min(lo,terrainH(x+q[0]*cell,z+q[1]*cell));if(lo<LAKE_LV+2)data[j*nx+i]=255;}
  out.box=box;
  out.lake=WATER.open({name:(SITE.tarn||'The tarn')+' (warm, '+(BASE+LAKE_LV).toFixed(0)+' m)',level:LAKE_LV,swell:[[.006,4,30,0,.01],[.004,2.5,-60,1.1,.01]],field:0,bounds:box,bed:terrainH,bedCell:40,
   mask:{x0:box[0],z0:box[1],cell,nx,nz,data}});}
 // THE SPRINGS (core/water/geyser 52: WATER.spring, banded by their heat and mineral; the main one boils)
 out.springs=SITE_SPRINGS.map(S=>WATER.spring({key:S.key,name:S.name,x:S.x,z:S.z,r:S.r,level:S.level,temp:S.temp,mineral:S.mineral,milky:.2,boil:S.temp>.9?1:0,steam:0}));
 // THE SINTER STAIR (core/water ext 53: WATER.terraces): a tread a still pool, a riser a fall over its sinter dam
 if(SITE_STAIR){const T=SITE_STAIR,n=T.levels.length,L=T.len;
  out.stair=WATER.terraces({name:'The sinter stair',line:[T.a,T.b],treads:T.levels.map((y,k)=>({s0:k*L/n+.5,s1:(k+.88)*L/n,y,w:T.w})),speed:.5,spread:2});}
 return out;})();
const WATER_DRAW=(function(){if(!WATER_RECS)return null;try{
 {const WENV={environment:null};
  ATMOS.skylight({renderer,sky:SKY.scene,scene:WENV,ground:()=>new THREE.Color(...(SKY.look?SKY.look.hemiG:[.34,.36,.3])).convertSRGBToLinear(),
   key:()=>[SKY_CLOCK.day,Math.round(SKY_CLOCK.hour*4),SKY.look&&SKY.look.cover.toFixed(2)].join()});}
 const lin=h=>new THREE.Color(h).convertSRGBToLinear(),out={};
 if(WATER_RECS.lake){out.lake=WATER.draw(WATER_RECS.lake,{surf:false,breakers:false,renderOrder:1,roughness:.08,metalness:.05,envMapIntensity:.6,
   shallow:lin(0x9ac8bc),deep:lin(0x1c4a52)});
  out.lake.mesh.userData.inspectLabel=WATER_RECS.lake.name;out.lake.mesh.userData.probeSkip=true;}
 const MATS=new Map();out.springs=(WATER_RECS.springs||[]).map(S=>{const d=WATER.drawSpring(S,{THREE,scene,fog:scene.fog,mats:MATS,renderOrder:2});
  d.mesh.userData.inspectLabel=S.name;return d.mesh;});   /* probed: each spring's registered volume holds its disc */
 if(WATER_RECS.stair){out.stair=WATER.drawTerraces(WATER_RECS.stair,{pool:{color:0xffffff,roughness:.06,metalness:.05,envMapIntensity:.55,renderOrder:2,
   gradient:{centre:lin(0x6ab8c4).getHex(),rim:lin(0xe4eee8).getHex(),power:1.3}},fall:{color:lin(0xeaf2f0),opacity:.85,rowStep:1,cols:8,spray:false,plungeR:5,renderOrder:3}});
  [out.stair.pools&&out.stair.pools.mesh,out.stair.falls&&out.stair.falls.mesh,out.stair.falls&&out.stair.falls.plunge].forEach(m=>{if(m)m.userData.inspectLabel='The sinter stair';});}
 return out;}catch(e){reportErr('water: '+(e&&e.stack||e));return null;}})();
_mark('water');
