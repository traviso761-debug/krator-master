// ================================================================= XANADU — the plants of the Vale (biome species in the kit's gardens)
// Travis: the gardens, baths and palaces plant the published Vale of Xanadu biome's species. xaPlant(kind,x,y,z,h)
// takes a builder-local point (through the group transform, like kput) and builds one biome hero there; the kit's
// old primitives (xnTree, xnCypress, the palms and cacti) route through it when the biome is loaded and fall back to
// their boxes and cones when it is not. Species by kind: tree — ginkgo, whorl olive, Persian ironwood, haze blossom,
// strawberry tree, cacao; cypress — flame cypress, cloud pine; palm — bottle palm, traveller's palm, silver fan palm;
// cactus — prickly pear, pitaya, desert rose, barrel frill; shrub — silver scrub, wisteria; shade — arch hornbeam
// pairs are left to the biome's own alleys; willow — frost willow; redwood — dawn redwood.
const XAPLANT={tree:[1,5,10,18,32,13],cypress:[31,31,3],palm:[16,20,25],cactus:[15,14,17,26,15],shrub:[27,27,17,14,15],willow:[19],redwood:[0],lotus:[2],wisteria:[9],olive:[5],ginkgo:[1]};
const XA_PLANT_STATS={n:0,by:{}};
function xaPlant(kind,x,y,z,h,opt){if(typeof XANADU==='undefined'||!XANADU.treeAt||!BIO.host)return false;opt=opt||{};
 const list=XAPLANT[kind]||XAPLANT.tree;const sp=opt.sp!=null?opt.sp:list[Math.floor(rng()*list.length)];const S=XANADU.SPECIES[sp];if(!S)return false;
 const v=new THREE.Vector3(x,y,z);if(KXF)v.applyMatrix4(KXF.m);const sc=(KXF&&KXF.s)||1;
 const H=h?Math.max(S.H[0]*.55,Math.min(S.H[1]*1.15,h*sc*(opt.hk||1.15))):undefined;
 const T=XANADU.treeAt(v.x,v.y,v.z,sp,{H,lv:2});if(!T)return false;
 XA_PLANT_STATS.n++;XA_PLANT_STATS.by[S.key]=(XA_PLANT_STATS.by[S.key]||0)+1;
 if(VERN.cur&&VERN.cur.plants)VERN.cur.plants.push(T);return true;}
window._plants=XA_PLANT_STATS;
