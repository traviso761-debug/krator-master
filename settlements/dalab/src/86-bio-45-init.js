// ================================================================= DALAB — the biome host binding (southwestern lowlands)
// BIO.init must run after THREE exists and BEFORE the lowlands fragments (86-bio-50+), which build their textures
// against BIO.host.THREE at load. The scene arrives later (BIO.setScene in 94-dalab-light, which also bakes). The
// kit plants nothing by zone here: the gardens ask for species by name at explicit points (SWLOW.treeAt /
// SWLOW.plantAt), so the mask and the fields are constants. The wind tick is queued until FRAME_HOOKS exists.
const BIO_TICKS=[];
BIO.init({THREE:THREE,scene:null,terrainH:(x,z)=>terrainH(x,z),mask:(x,z)=>1,obstacles:[],
 ticks:fn=>BIO_TICKS.push(fn),seed:31,origin:[[0,0]],center:[0,0],
 fields:{wet:(x,z)=>.55,tropic:(x,z)=>.35,dry:(x,z)=>.3,salt:(x,z)=>0,flow:(x,z)=>0,upland:(x,z)=>.2},
 err:m=>reportErr('biome: '+m),
 stat:(k,tris,inst)=>{const t=TSTAT.by['biome/'+k.replace('lowlands/','')]||(TSTAT.by['biome/'+k.replace('lowlands/','')]={tris:0,inst:0,meshes:0});t.tris+=tris;t.inst+=inst;}});
// local -> world for a builder planting in its own frame (VERN.cur carries the plot transform)
function dnWorld(lx,ly,lz){const c=VERN.cur;if(!c)return[lx,ly,lz];const s=c.o.scale||1;const p=loc(c.x,c.z,lx*s,lz*s,c.ry);return[p[0],(c.o.y||0)+ly*s,p[1]];}
// a garden tree registers through the biome's own REGISTER; the entry is adopted as flora of the site (cls 'flora' keeps
// it out of the labels but in the inspector and the tag audit)
function dnTree(species,lx,ly,lz,opt){const w=dnWorld(lx,ly,lz);if(opt&&opt.bias!=null)opt.bias+=VERN.cur?VERN.cur.ry:0;const r0=REG.length;let T=null;
 try{T=SWLOW.treeAt(species,w[0],w[1],w[2],opt);}catch(e){reportErr('tree '+species+': '+e.message);}
 const c=VERN.cur;for(let i=r0;i<REG.length;i++){const r=REG[i];r.cls='flora';if(c){r.key=c.D.key;r.tags=Object.assign({},c.D.tags,{type:['garden'],part:'garden'});}}return T;}
function dnPlant(kind,lx,ly,lz,opt){const w=dnWorld(lx,ly,lz);try{return SWLOW.plantAt(kind,w[0],w[1],w[2],opt);}catch(e){reportErr('plant '+kind+': '+e.message);return false;}}
