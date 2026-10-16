// ================================================================= ROKETSTAD — the biome host binding (the North Highlands kit, its temperate band)
// The biome is biomes/nhighlands with core/biome and core/space, read IN PLACE by build.py (TARGET_BIO); this fragment
// is the only local part. BIO.init runs after the terrain function (84) and BEFORE the kit's fragments (86-bio-50+),
// which build their textures against BIO.host.THREE at load. The scene arrives later (BIO.setScene in 90b), and so does
// the page's tag registry (core/tags: KTAGS.page, made by 89y; 90b hands it in before the forest is placed). The masks
// read the core/mask grids (85: KMASK.canvas, the same in every browser and in Godot), baked before the biome builds.
// The kit keeps its own PRNG (core/biome: a mulberry32 stream, the same numbers as KRAND.stream); its host seed comes
// from KRAND (core/rand), a named child of the town's seed.
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
// THE CLIMATE (BIOME-API.md, "What the host provides"): the kit zones itself from these. Roketstad's shelf is the foot of
// the kit's temperate band: COLD stays low (~.1 west of the town, ~.2 round it) and climbs east with the shelf toward the
// Inner Wall (~.35 at the map's east edge), so the broadleaves lead round the town (the kit's `low`: forest lime, moss
// maple, blue beech, the conifer giants as emergents), the conifers come back eastward and the montane mix (Norway
// spruce, mountain maple) just reaches the east edge. No boreal or alpine band, no stream (flow 0, no water: waterH
// -1e9), the old wood on a few boulder fields (ROCK), mist pooling in the low ground to the west.
// the fields' noise is core/rand's (KRAND.fbm: integer hashing, the same in Godot), not the sin-based fbm of 10-core
const RK_FSEED=KRAND.child(SEED_RK,'climate');
const RK_FIELD={
 wet:(x,z)=>clamp(.78+.2*(KRAND.fbm(x*.002+5,z*.002,7.1,2,RK_FSEED)-.5),0,1),
 cold:(x,z)=>clamp(.13+.17*smoothstep(-700,1700,x+.35*z)+.0018*(terrainH(x,z)-30)+.16*(KRAND.fbm(x*.0018-4,z*.0018+6,4.4,2,RK_FSEED)-.5),0,1),
 rock:(x,z)=>.85*smoothstep(.6,.72,KRAND.fbm(x*.0024+9,z*.0024-1,9.1,2,RK_FSEED)),
 mist:(x,z)=>.55*smoothstep(26,12,terrainH(x,z)),
 flow:(x,z)=>0,
 upland:(x,z)=>clamp((terrainH(x,z)-20)/60,0,1)};
// THE LOD SPINE: the kit draws a tree in full (and plants its near floor) only near the spine, and a far impostor past
// ~560 m of it. The views look out of the town, so the spine is the three gates the highways leave by (N, S, W), each
// 140 m out (past the glacis, where the forest starts), and the port (the E gate opens onto it). A ring of eight such
// points round the wall was tried: ~4.6 M more triangles held and 40% more drawn at the opening view, too heavy here.
const RK_SPINE=[RK.GATES.N,RK.GATES.S,RK.GATES.W].map(g=>townPt(g,wallR(g)+140).map(Math.round));RK_SPINE.push([PC.x,PC.z]);
// the trees the kit registers (BIO.register) go in the town's registry too, as the vendored kit's did, so the inspector
// names them; cls 'flora' keeps them off the building labels. Not the understorey trumpets (a colony's small stems, drawn
// merged): the probe finds no sample inside some of them. Every one is still a core/tags record (BIO.record)
function bioRegister(o){if(o.key==='trumpet'||o.key==='frosttrumpet')return;
 REG.push({name:o.name,x:o.x,y:o.y||0,z:o.z,r:o.r,h:o.h,cls:'flora',key:o.key});}
BIO.init({THREE:THREE,scene:null,terrainH:(x,z)=>terrainH(x,z),waterH:(x,z)=>-1e9,mask:bioMaskFn,obstacles:BIO_OBSTACLES,
 ticks:fn=>FRAME_HOOKS_PRE.push(fn),seed:KRAND.child(SEED_RK,'nhighlands'),origin:RK_SPINE,register:bioRegister,center:[0,0],fields:RK_FIELD,
 tags:'roketstad',err:m=>reportErr('biome: '+m),
 stat:(k,tris,inst)=>{const key='biome/'+k.replace(/^nhighlands\//,'');const t=TSTAT.by[key]||(TSTAT.by[key]={tris:0,inst:0,meshes:0});t.tris+=tris;t.inst+=inst;}});
