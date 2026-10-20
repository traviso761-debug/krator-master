// ================================================================= BIOME CORE — item variant pools
// One plant, several textures. A kit that has a library sheet with many variants of one card (card.jungle.clump.N,
// card.vine.hanging.N) gives each variant its own material (a MAT slot, so BIO.libSwap and materials.json treat it like any
// other) and names them in a pool:
//
//   BIO.variantPool('ucard', [M.under1, M.under2], salt)
//
// defines the items ucard1, ucard2 (the base item's geometry, label, class, kind and tags, one material each) and from then on
// BIO.put('ucard', pos, ...) draws one of ucard, ucard1, ucard2. The choice is KRAND.hash(salt, cell of the position): it is
// never taken from the kit's rng() stream, so the rest of the world is placed exactly as before, and the same spot gets the
// same variant on every machine. With no KRAND (a host that did not load core/rand) the pool is not made.
(function(){
BIO._pools=BIO._pools||null;
BIO.variantPool=function(base,mats,salt){
 const d=BIO.defs[base];if(!d){BIO.err('BIO.variantPool: no item '+base);return[];}
 if(typeof KRAND==='undefined'||!mats||!mats.length)return[];
 const names=[base];
 mats.forEach((m,i)=>{const n=base+(i+1);
  BIO.def(n,d.geo,m,{label:d.label,attrs:d.attrs,cls:d.cls,kind:d.kind||base,tags:d.tags});names.push(n);});
 if(!BIO._pools){BIO._pools={};const put=BIO.put;
  BIO.put=function(name,pos,q,sc,col,extra){const v=BIO._pools[name];
   if(v&&pos)name=v.names[KRAND.hash(v.salt,Math.floor(pos[0]*2),Math.floor(pos[1]*2),Math.floor(pos[2]*2))%v.names.length];
   return put.call(BIO,name,pos,q,sc,col,extra);};}
 BIO._pools[base]={names:names,salt:salt==null?0x7a11:salt};
 return names;};
})();
