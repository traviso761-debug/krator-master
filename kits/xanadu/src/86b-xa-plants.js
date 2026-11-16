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
 // the crown fitted to the def's lot (2026-11-10; xaRoom, 72-xa-helpers.js; opt.r overrides): XANADU.treeAt draws the tree's
 // height, bole and crown radius first, from the biome's own stream; that stream is set to a seed from the kit's, the three
 // draws read, then set back, so the crown the call will draw is known, and a scale shrinks the whole tree to the room
 const room=(opt.r!=null?opt.r:xaRoom(x,z))*sc;let scale,tall=null;
 if(isFinite(room)&&BIO.fn&&BIO.fn.reseed){const s=Math.floor(rng()*4294967296),r=BIO.fn.rr;BIO.fn.reseed(s);
  const tH=r(S.H[0],S.H[1]);r(S.rb[0],S.rb[1]);let cr=r(S.crownR[0],S.crownR[1]);if(H)cr*=Math.min(1.6,H/tH);if(cr>room)scale=room/cr;tall=(H||tH)*(scale==null?1:scale);BIO.fn.reseed(s);}
 // a room so tight it would squeeze the tree under 1.2 m gets none (2026-11-10: a 0.77 m ginkgo in a Palopó yard, an empty volume)
 if(tall!=null&&tall<1.2)return false;
 const T=XANADU.treeAt(v.x,v.y,v.z,sp,{H,lv:2,scale});if(!T)return false;
 if(isFinite(room)&&T.crownR>room*1.01)reportErr('xaPlant: '+S.key+' crown '+T.crownR.toFixed(2)+' m past its room '+room.toFixed(2)+' m (XANADU.treeAt no longer draws H, rb, crownR first?)');
 XA_PLANT_STATS.n++;XA_PLANT_STATS.by[S.key]=(XA_PLANT_STATS.by[S.key]||0)+1;
 if(VERN.cur&&VERN.cur.plants)VERN.cur.plants.push(T);return true;}
window._plants=XA_PLANT_STATS;
