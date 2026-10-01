// ================================================================= IZIZ CITY — the biome host binding
// BIO.init must run after the terrain function exists (84) and BEFORE the hyperjungle fragments (86-bio-50+), which
// build their textures against BIO.host.THREE at load. The scene arrives later (BIO.setScene in 90b), the mask reads
// the painted canvases, which are baked (cityBakeMasks) before the biome builds. The jungle keeps its own PRNG.
const BIO_OBSTACLES=[];        // {x,z,r} cylinders nothing grows in: bunkers, the spaceport, the gate bridges
const RUIN_RECTS=[];           // ruined ancient clusters (world-space OBBs) where the floor pass creeps back in at low density
function bioMaskFn(x,z){
 if(Math.abs(x)>CITY.WORLD/2-14||Math.abs(z)>CITY.WORLD/2-14)return 0;
 const p=polar(x,z),ro=p.r-wallR(p.t);
 // the jungle: everything not a road, pad or bunker. In the belt the hypertrees are cleared from (ro < 130) the floor
 // thins too — cut-over ground, not full jungle floor right up to the moat (Round 3 issue)
 if(ro>44){return maskAt(x,z)[0]>200?(ro<130?.3+.7*smoothstep(60,130,ro):1):0;}
 if(ro>-20)return 0;                                              // the moat and the wall band
 const m=maskAt(x,z);if(m[1]>200&&m[0]<60)return .85;             // city parks: undergrowth only (the tree pass masks the city out)
 if(!canBuild(x,z))return 0;
 for(const R of RUIN_RECTS){const dx=x-R.x,dz=z-R.z,c=Math.cos(R.ry),s=Math.sin(R.ry);const lx=c*dx-s*dz,lz=s*dx+c*dz;if(Math.abs(lx)<R.hx&&Math.abs(lz)<R.hz)return .28;}
 return 0;}
// the TREE pass must never enter the city: a second mask, swapped in around HYPERJUNGLE.buildTrees (see 90b)
function bioTreeMaskFn(x,z){const p=polar(x,z),ro=p.r-wallR(p.t);if(ro<=44)return 0;const m=bioMaskFn(x,z);return ro<130?m*smoothstep(60,130,ro)*.6:m;}   // the hypertrees stand back from the wall: a cleared belt, saplings only
BIO.init({THREE:THREE,scene:null,terrainH:(x,z)=>terrainH(x,z),mask:bioMaskFn,obstacles:BIO_OBSTACLES,
 ticks:fn=>FRAME_HOOKS_PRE.push(fn),seed:SEED_CITY,origin:[0,0],err:m=>reportErr('biome: '+m),
 stat:(k,tris,inst)=>{const t=TSTAT.by['biome/'+k.replace('jungle/','')]||(TSTAT.by['biome/'+k.replace('jungle/','')]={tris:0,inst:0,meshes:0});t.tris+=tris;t.inst+=inst;}});
