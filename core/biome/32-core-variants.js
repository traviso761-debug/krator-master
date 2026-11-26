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
  BIO.def(n,d.raw||d.geo,m,{label:d.label,attrs:d.attrs,cls:d.cls,kind:d.kind||base,tags:d.tags});names.push(n);});
 if(!BIO._pools){BIO._pools={};const put=BIO.put;
  BIO.put=function(name,pos,q,sc,col,extra){const v=BIO._pools[name];
   if(v&&pos)name=v.names[KRAND.hash(v.salt,Math.floor(pos[0]*2),Math.floor(pos[1]*2),Math.floor(pos[2]*2))%v.names.length];
   return put.call(BIO,name,pos,q,sc,col,extra);};}
 BIO._pools[base]={names:names,salt:salt==null?0x7a11:salt};
 return names;};

// KIN SPECIES (PLAN-LANDS.md H2): a cousin of another kit's species, grown by that kit's own builder.
//   const K = BIO.kin('eastabyss.sigillaria', {key:'rimseal', name:'Rim seal-tree', scale:.6, colour:{leaf:[0x6a7a3c]},
//                     habit:{bloomOn:'none'}, pheno:{drop:'dry'}, tags:{aridity:'dry'}})
//   K.record     the kin's species record: the source's, copied, with the delta (the source record is never changed)
//   K.make(x, y, z, ...)   the source kit's tree record for it (draws from the core stream, as the source's make does)
//   K.grow(T, lv)          that tree, built by the source kit's builder into the source kit's registry
// The delta: key and name (the kin's own); scale (a number, or {H, rb, crownR}) multiplies the size ranges; habit, colour
// and pheno are merged into the record (habit: the builder's own fields; colour: its colour arrays; pheno: phenology, data
// for the host's seasons); tags merge into the source's tags; any other field replaces the source's. tags.kin is the
// source ('eastabyss.sigillaria') and record.kin {from, kit, key}. During make and grow the source kit's SPECIES entry is
// the kin's record (put back after, even on a throw), so whatever the builder reads from it (H, rb, crownR, bark, leaf,
// forks...) is the kin's. A builder that does not read a field takes nothing from it. null (and BIO.err) when the source
// is not on the page or has no builder for the key: the source kit's fragments must be loaded, but need not be built.
const KIN_MERGE={habit:1,colour:1,pheno:1,tags:1,key:1,name:1,scale:1};
BIO.kinRecord=function(S,delta,from){delta=delta||{};const r=Object.assign({},S),sc=delta.scale;
 for(const k in delta)if(!KIN_MERGE[k])r[k]=delta[k];
 if(delta.habit)Object.assign(r,delta.habit);if(delta.colour)Object.assign(r,delta.colour);
 if(delta.pheno)r.pheno=Object.assign({},S.pheno||{},delta.pheno);
 if(sc!=null){const f=typeof sc==='number'?{H:sc,rb:sc,crownR:sc}:sc;
  for(const k of ['H','rb','crownR']){const m=f[k];if(m==null||!r[k])continue;
   if(!(m>0)){BIO.err('BIO.kin: scale.'+k+' must be > 0');continue;}r[k]=r[k].map(v=>v*m);}}
 r.key=delta.key==null?S.key:delta.key;r.name=delta.name==null?S.name:delta.name;
 r.tags=Object.assign({},S.tags||{},delta.tags||{},{kin:from});
 const dot=from.indexOf('.');r.kin={from:from,kit:from.slice(0,dot),key:from.slice(dot+1)};return r;};
BIO.kin=function(ref,delta){const dot=typeof ref==='string'?ref.indexOf('.'):-1;
 if(dot<=0||dot===ref.length-1){BIO.err('BIO.kin: a source is kit.key, not '+ref);return null;}
 const b=BIO.kitBuilder(ref.slice(0,dot),ref.slice(dot+1));
 if(!b||!b.species){BIO.err('BIO.kin: no builder for '+ref+' (is the kit loaded, and does it export SPECIES, make and grow?)');return null;}
 const rec=BIO.kinRecord(b.species,delta,ref),SP=b.api.SPECIES;
 function as(f){if(b.sp<0)return f();const old=SP[b.sp];SP[b.sp]=rec;try{return f();}finally{SP[b.sp]=old;}}
 return{key:rec.key,name:rec.name,from:ref,kit:b.kit,sp:b.sp,record:rec,tags:rec.tags,
  make:function(){const a=arguments,T=as(()=>b.make.apply(null,a));if(T&&typeof T==='object')T.kin=ref;return T;},
  grow:function(T,lv){return as(()=>b.grow(T,lv));}};};
})();
