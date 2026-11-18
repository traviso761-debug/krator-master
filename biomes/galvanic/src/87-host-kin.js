// ================================================================= HOST — the Rift's trees, read in place (PLAN.md section 7; BIO.kin, core/biome 32; riftrim's 87-host-kin.js)
// build.py slots the Rift kit's species and trees before this kit, in their own registry (KIN_ALL). Each row is grown by BIO.kin with the Rift's own
// builder, never the Rift's build, so the Rift's pages do not change. On the hills only, where the ground's water is past pH 5.5 (no zinc, no acid): the
// line where the battery's ground stops is the line where the trees start (the probe checks it). A lattice whose every cell is KRAND.hash(world, i, j,
// salt), each tree's numbers from a reseed of the same hash; clear of each other (core/space) and of the water. ?kin=0 grows none.
const KIN_ROWS=[
 {ref:'rift.baobab',key:'baobab',name:'Baobab',cell:70,minR:9,accept:(x,z)=>.5*smooth(.55,.9,FIELD.upland(x,z))*smooth(.35,.15,FIELD.slope(x,z))},
 {ref:'rift.dragon',key:'dragon',name:'Dragon tree',cell:34,minR:4,accept:(x,z)=>.45*smooth(.4,.8,FIELD.upland(x,z))*smooth(.5,.25,FIELD.slope(x,z))}];
const KIN_PH=5.5;
function growKin(){
 if(new URLSearchParams(location.search).get('kin')==='0'||!BIO.kin)return null;
 const W=4403,out={},missing=[];const S=KSPACE.create({cell:40});
 const R=TERR.R-150;BIO.cur='galvanic/kin';window._kinTrees=[];
 KIN_ROWS.forEach((row,ri0)=>{const kit=row.ref.split('.')[0];if(!BIO.kits||!BIO.kits[kit]||!BIO.kits[kit].api){missing.push(row.ref);out[row.key]=0;return;}
  const K=BIO.kin(row.ref,{key:row.key,name:row.name,tags:{borrowed:true,from:'biomes/rift'}});if(!K){missing.push(row.ref);out[row.key]=0;return;}
  const cell=row.cell,N=Math.ceil(R/cell),salt=0x6e40+ri0;let n=0;
  for(let j=-N;j<=N;j++)for(let i=-N;i<=N;i++){const h=KRAND.hash(W,i,j,salt),u=k=>KRAND.unit(KRAND.hash(h,k,0,salt)),x=(i+u(1))*cell,z=(j+u(2))*cell;
   if(Math.abs(x)>R||Math.abs(z)>R||BIO.lodD(x,z)>BIO.LOD().hero*1.25)continue;if(!(u(3)<row.accept(x,z))||PH_AT(x,z)<KIN_PH)continue;
   if(S.some(x,z,row.minR,o=>Math.hypot(x-o.x,z-o.z)<row.minR+o.r)||!BIO.clearOf(x,z,row.minR)||BIO.mask(x,z)<.9)continue;
   reseed(h);const T=K.make(x,terrainH(x,z),z);K.grow(T,2);   /* the hero always, within the hero range (riftrim's finding: past it the vendors' lite crowns float) */
   S.insert({x,z,r:row.minR},x,z,row.minR);window._kinTrees.push([x,z,row.key]);
   REGISTER({name:K.name,key:row.key,kind:'tree',label:K.name+' (read in place: '+row.ref+')',x,z,y:T.y0,r:T.crownR==null?3:T.crownR,h:T.H});n++;}
  out[row.key]=n;});
 BIO.cur=null;if(missing.length)out.missing=missing;return out;}
