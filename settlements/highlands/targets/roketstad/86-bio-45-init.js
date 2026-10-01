// ================================================================= ROKETSTAD — the biome host binding (NW-lowlands kit, humid-subtropical tract)
// BIO.init runs after the terrain function (84) and BEFORE the biome fragments (86-bio-50+), which build their
// textures against BIO.host.THREE at load. The scene arrives later (BIO.setScene in 90b); the masks read the painted
// canvases, which are baked before the biome builds. The biome keeps its own PRNG.
const BIO_OBSTACLES=[];   // {x,z,r} cylinders nothing grows in
// forest on everything that is not town, road, field, yard or port; the port's ruins take a thin understorey
function bioMaskFn(x,z){if(Math.abs(x)>RK.WORLD/2-12||Math.abs(z)>RK.WORLD/2-12)return 0;
 if(insideWall(x,z,-26))return 0;                                     // the town and a cleared band outside its wall
 const k=klass(x,z);if(k===KL.port){return canBuildRaw(x,z)?.22:0;}   // the port table: understorey creeping into the ruins
 if(k!==0)return 0;                                                   // roads, fields, farms, plazas, buildings, the wall
 return maskAt(x,z)[0]>200?1:0;}
// the port disc is painted unbuildable (so placement stays off it); the raw ground under it for the biome is "not a road
// or a building there" — read from the class canvas alone
function canBuildRaw(x,z){const k=klass(x,z);return k===KL.port;}
// the TREE pass stands back from roads, fields and the town (a mown verge, a field edge, a glacis before the wall)
function bioTreeMaskFn(x,z){const m=bioMaskFn(x,z);if(m<=0)return 0;if(klass(x,z)===KL.port)return 0;
 if(insideWall(x,z,-70))return 0;
 for(const [dx,dz] of[[9,0],[-9,0],[0,9],[0,-9]]){const k=klass(x+dx,z+dz);if(k!==0)return 0;}
 return m;}
const RK_FIELD={
 wet:(x,z)=>.72+.1*(fbm(x*.002+5,z*.002,7.1,2)-.5),
 tropic:(x,z)=>.32+.1*(fbm(x*.0015,z*.0015+9,3.3,2)-.5),
 dry:(x,z)=>.1+.25*smoothstep(600,1700,x),                             // drier toward the mountains' foot
 flow:(x,z)=>0,
 upland:(x,z)=>clamp((terrainH(x,z)-20)/60,0,1)};
BIO.init({THREE:THREE,scene:null,terrainH:(x,z)=>terrainH(x,z),mask:bioMaskFn,obstacles:BIO_OBSTACLES,
 ticks:fn=>FRAME_HOOKS_PRE.push(fn),seed:SEED_RK,origin:[[TC.x,TC.z],[PC.x,PC.z]],center:[0,0],fields:RK_FIELD,err:m=>reportErr('biome: '+m),
 stat:(k,tris,inst)=>{const key='biome/'+k.replace('nwlow/','');const t=TSTAT.by[key]||(TSTAT.by[key]={tris:0,inst:0,meshes:0});t.tris+=tris;t.inst+=inst;}});
