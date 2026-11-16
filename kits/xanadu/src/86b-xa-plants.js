// ================================================================= XANADU — the plants of the Vale (biome species in the kit's gardens)
// Travis: the gardens, baths and palaces plant the published Vale of Xanadu biome's species. xaPlant(kind,x,y,z,h)
// takes a builder-local point (through the group transform, like kput) and builds one biome hero there; the kit's
// old primitives (xnTree, xnCypress, the palms and cacti) route through it when the biome is loaded and fall back to
// their boxes and cones when it is not. Species by kind: tree — ginkgo, whorl olive, Persian ironwood, haze blossom,
// strawberry tree, cacao; cypress — flame cypress, cloud pine; palm — bottle palm, traveller's palm, silver fan palm;
// cactus — prickly pear, pitaya, desert rose, barrel frill; shrub — silver scrub, wisteria; shade — arch hornbeam
// pairs are left to the biome's own alleys; willow — frost willow; redwood — dawn redwood.
const XAPLANT={tree:[1,5,10,18,32,13],cypress:[31,31,3],palm:[16,20,25],cactus:[15,14,17,26,15],shrub:[27,27,17,14,15],willow:[19],redwood:[0],lotus:[2],wisteria:[9],olive:[5],ginkgo:[1]};
const XA_PLANT_STATS={n:0,by:{},crowded:0},XA_PLANT_GRID=new Map();
function xaPlant(kind,x,y,z,h,opt){if(typeof XANADU==='undefined'||!XANADU.treeAt||!BIO.host)return false;opt=opt||{};
 const list=XAPLANT[kind]||XAPLANT.tree;const sp=opt.sp!=null?opt.sp:list[Math.floor(rng()*list.length)];const S=XANADU.SPECIES[sp];if(!S)return false;
 const v=new THREE.Vector3(x,y,z);if(KXF)v.applyMatrix4(KXF.m);const sc=(KXF&&KXF.s)||1;
 const H=h?Math.max(S.H[0]*.55,Math.min(S.H[1]*1.15,h*sc*(opt.hk||1.15))):undefined;
 // the crown fitted to the def's lot (2026-11-10; xaRoom, 72-xa-helpers.js; opt.r overrides): XANADU.treeAt draws the tree's
 // height, bole and crown radius first, from the biome's own stream; that stream is set to a seed from the kit's, the three
 // draws read, then set back, so the crown the call will draw is known, and a scale shrinks the whole tree to the room
 const room=(opt.r!=null?opt.r:xaRoom(x,z))*sc;let scale,tall=null;
 if(isFinite(room)&&BIO.fn&&BIO.fn.reseed){const s=Math.floor(rng()*4294967296),r=BIO.fn.rr;BIO.fn.reseed(s);
  const tH=r(S.H[0],S.H[1]);r(S.rb[0],S.rb[1]);let cr=r(S.crownR[0],S.crownR[1]);if(H)cr*=Math.min(1.6,H/tH);if(cr>room)scale=room/cr;tall=(H||tH)*(scale==null?1:scale);BIO.fn.reseed(s);}
 // a room so tight it would squeeze the tree under 1.2 m gets none (2026-11-10: a 0.77 m ginkgo in a Palopó yard, an empty volume)
 // A declined plant is 'tight' or 'crowded', truthy: the caller's own cone or box must not stand in for it (2026-11-12: a
 // squeezed cypress fell back to the kit's cones, building geometry beside the Vale's trees). false is only "no biome here"
 if(tall!=null&&tall<1.2)return 'tight';
 // the plants already set (this kit's, world points): a crown within 0.7 of the two crowns' reach of another's is not drawn
 // (2026-11-12: two cypresses in one spot, a forecourt row over a bed's)
 const cr0=isFinite(room)&&tall!=null?Math.min(room,S.crownR[1]*(scale==null?1:scale)):S.crownR[0],G=XA_PLANT_GRID,gk=(i,j)=>i+','+j,ci=Math.floor(v.x/4),cj=Math.floor(v.z/4);
 for(let i=ci-2;i<=ci+2;i++)for(let j=cj-2;j<=cj+2;j++)for(const q of G.get(gk(i,j))||[])if(Math.abs(q.y-v.y)<4&&Math.hypot(q.x-v.x,q.z-v.z)<(q.r+cr0)*.7){XA_PLANT_STATS.crowded++;return 'crowded';}
 /* and the biome's own trees, set by its zone pass before the kit's gardens (2026-11-12: a flame cypress row through a
    twisted ginkgo and a haze blossom by the Grand Baths) */
 if(XANADU.TREES)for(const q of XANADU.TREES){const dx=q.x-v.x;if(dx>14||dx<-14)continue;const dz=q.z-v.z;if(dz>14||dz<-14)continue;
  if(Math.abs((q.y0||v.y)-v.y)<5&&Math.hypot(dx,dz)<((q.crownR||2)+cr0)*.7){XA_PLANT_STATS.crowded++;return 'crowded';}}
 const T=XANADU.treeAt(v.x,v.y,v.z,sp,{H,lv:2,scale});if(!T)return false;
 {const k=gk(ci,cj);(G.get(k)||G.set(k,[]).get(k)).push({x:v.x,y:v.y,z:v.z,r:T.crownR||cr0});}
 /* an obstacle to the biome's zone pass, which runs after the kit's gardens on Erewhon's page */
 if(BIO.host&&BIO.host.obstacles)BIO.host.obstacles.push({x:v.x,z:v.z,r:(T.crownR||cr0)+.5});
 if(isFinite(room)&&T.crownR>room*1.01)reportErr('xaPlant: '+S.key+' crown '+T.crownR.toFixed(2)+' m past its room '+room.toFixed(2)+' m (XANADU.treeAt no longer draws H, rb, crownR first?)');
 XA_PLANT_STATS.n++;XA_PLANT_STATS.by[S.key]=(XA_PLANT_STATS.by[S.key]||0)+1;
 if(VERN.cur&&VERN.cur.plants)VERN.cur.plants.push(T);return true;}
window._plants=XA_PLANT_STATS;
// the gardens' clipped green (2026-11-12, the owner: "the hedges look untextured"): the hedges a box of their own (xHedgeB,
// 85b), and they and the beds' leaf balls (xLeaf) take the Vale's cushion leaves (XANADU.CUSHIONTEX, the biome's clipped box
// domes) where the biome is loaded. The defs' materials are read at bake, when the biome has made the texture; the
// colour is lifted so the kit's dark greens tint the leaves instead of drowning them. Without the biome: the plain moss
MAT.xHedge=xStd({roughness:.9});vWorldUV(MAT.xHedge,1/1.2);kdef('xHedgeB',VBOX,MAT.xHedge);
for(const [name,base] of[['xHedgeB',MAT.xHedge],['xLeaf',MAT.moss]]){const D=KIT.defs[name];if(!D)continue;let W=null;
 Object.defineProperty(D,'mat',{configurable:true,get(){const t=typeof XANADU!=='undefined'&&XANADU.CUSHIONTEX;if(!t)return base;
  if(!W){W=base.clone();if(base.onBeforeCompile)W.onBeforeCompile=base.onBeforeCompile;if(base.customProgramCacheKey)W.customProgramCacheKey=base.customProgramCacheKey;W.map=t;W.color.setScalar(1.7);W.needsUpdate=true;}return W;}});}
