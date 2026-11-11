// ================================================================= HOST — the borrowed species, read in place (PLAN.md section 3; BIO.kin, core/biome 32)
// A station names the kits it reads in its stations/<name>/station.json ("kin"; build.py slots their species and trees before this kit, each in
// its own registry) and the rows it grows in LAND.kin: {ref 'kit.key', key, name, cell (m), minR (the keep-clear), accept(Z, x, z) (this kit's
// zones, 55), scale, tags}. Each row is grown by BIO.kin with its own kit's builder, never the source kit's build, so the source pages do not
// change. Placed after the kit's build and before the bake, on a lattice whose every cell is KRAND.hash(world, i, j, salt) and whose tree's
// numbers come from a reseed of the same hash: nothing the kit placed moves. Clear of the kit's trees (core/space), the obstacles and the water.
// A row whose kit is not on the page (its station.json does not list it) grows nothing and says so in window._kin. ?kin=0 grows none.
function growKin(){
 if(new URLSearchParams(location.search).get('kin')==='0'||!BIO.kin||!LAND.kin||!LAND.kin.length)return null;
 const W=6861,out={},missing=[];   /* the kin are unique trees (not variants): within 500 m of the LOD spine only */
 const S=KSPACE.create({cell:40});(RRIM.TREES||[]).forEach(T=>S.insert(T,T.x,T.z,(T.rb==null?.5:T.rb)*1.4+2));
 const clear=(x,z,r)=>!S.some(x,z,r,o=>Math.hypot(x-o.x,z-o.z)<r+((o.rb==null?.5:o.rb)*1.4))&&BIO.clearOf(x,z,r)&&BIO.mask(x,z)>.9&&terrainH(x,z)-waterH(x,z)>.5;
 const R=TERR.R-150;BIO.cur='riftrim/kin';
 LAND.kin.forEach((row,ri)=>{const kit=row.ref.split('.')[0];if(!BIO.kits||!BIO.kits[kit]||!BIO.kits[kit].api){missing.push(row.ref);out[row.key]=0;return;}
  const K=BIO.kin(row.ref,{key:row.key,name:row.name,scale:row.scale,tags:Object.assign({rims:RRIM.rim,borrowed:true},row.tags||{})});if(!K){missing.push(row.ref);out[row.key]=0;return;}
  const cell=row.cell==null?30:row.cell,N=Math.ceil(R/cell),salt=0x6e00+ri;let n=0;
  for(let j=-N;j<=N;j++)for(let i=-N;i<=N;i++){const h=KRAND.hash(W,i,j,salt),u=k=>KRAND.unit(KRAND.hash(h,k,0,salt)),x=(i+u(1))*cell,z=(j+u(2))*cell;
   if(Math.abs(x)>R||Math.abs(z)>R||BIO.lodD(x,z)>BIO.LOD().hero*1.25)continue;const a=row.accept(RRIM.zones(x,z),x,z);if(!(u(3)<a)||!clear(x,z,row.minR==null?3:row.minR))continue;
   reseed(h);const T=K.make(x,terrainH(x,z),z);K.grow(T,2);   /* the hero always, and only within the hero range (ebadlands' finding, and this kit's attach audit, 2026-11-03: past it the vendors' builders draw lite crowns with no boughs, and they float); past it none */
   S.insert(T,x,z,(T.rb==null?1:T.rb)*1.4+2);REGISTER({name:K.name,key:row.key,kind:'tree',label:K.name+' (read in place: '+row.ref+')',x,z,y:T.y0,r:T.crownR==null?3:T.crownR,h:T.H});n++;}
  out[row.key]=n;});
 BIO.cur=null;if(missing.length)out.missing=missing;return out;}
