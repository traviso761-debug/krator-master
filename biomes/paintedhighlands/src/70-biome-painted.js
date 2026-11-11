// ================================================================= PAINTED HIGHLANDS — build (BIOME-API.md)
// The kit's public surface. The stations order their own passes (88-host-place.js: STATION_BUILD): the floor (PAINTED.buildFloor), the trees of the
// rims and ledges (PAINTED.buildTrees: the eastern badlands' Utah juniper and pinyon, grown by BIO.kin with EBADLANDS' own builder, read in place),
// the stone circles (PAINTED.circles), the seeps' hanging gardens (PAINTED.dress). No fauna here: the fauna kit's (kits/fauna, PLAN.md section 4).
// PAINTED.buildTrees(R, q, o): o.accept(x, z) -> 0..1 the station's tree ground (the rims, the ledges, the canyon's benches), o.keep as the floor's.
PAINTED.KIN=null;
PAINTED.kinRows=function(){if(PAINTED.KIN)return PAINTED.KIN;if(typeof EBADLANDS==='undefined'||!BIO.kin)return null;
 PAINTED.KIN={juniper:BIO.kin('ebadlands.juniper',{key:'paintedjuniper',name:'Painted juniper',scale:{H:.8,crownR:.85},
   tags:{koppen:['BSk','Dsb','Dsc','Cfa'],zone:['rim','ledge'],harvest:{wood:'posts and firewood; incense (the shamans\' smoke)',edible:['berries (spice)'],medicinal:true,note:'The Painted Men\'s juniper: its berries a spice (kits/crops juniper), its smoke the shamans\'.'}}}),
  pinyon:BIO.kin('ebadlands.pinyon',{key:'paintedpinyon',name:'Rim pinyon',scale:{H:.75,crownR:.8},
   tags:{koppen:['BSk','Dsb','Cfa'],zone:['rim','ledge'],harvest:{wood:'firewood; pitch',edible:['pine nuts'],medicinal:false,note:'Pine nuts in autumn (kits/crops pinyon).'}}}),
  /* the wet wall's broadleaves (the cliff town's, Cfa 862 mm): the eastern badlands' Zion-canyon pair, standing in for Korona's western ring species until
     Korona's are read in place (KNOWN_ISSUES.md). The maple in its summer green (ebadlands' own palette is its autumn) */
  oak:BIO.kin('ebadlands.oak',{key:'paintedoak',name:'Wall oak',tags:{koppen:['Cfa','Dsb'],zone:['ledge','talus']}}),
  maple:BIO.kin('ebadlands.maple',{key:'paintedmaple',name:'Seep maple',colour:{leaf:[0x6a8a3a,0x7a9a40,0x5e7e34,0x74943c]},tags:{koppen:['Cfa'],zone:['ledge','seep'],riparian:'both'}})};
 return PAINTED.KIN;};
PAINTED.TREES=[];
PAINTED.buildTrees=function(R,q,o){o=o||{};q=q==null?1:q;const K=PAINTED.kinRows(),st={juniper:0,pinyon:0,oak:0,maple:0};if(!K||!K.juniper)return st;
 const {smooth,reseed}=BIO.fn,W=6113,accept=o.accept||(()=>0),keep=o.keep||(()=>1),cell=o.cell==null?26:o.cell,Lv=BIO.LOD();
 const S=KSPACE.create({cell:40}),N=Math.ceil(R/cell);
 const clear=(x,z,r)=>!S.some(x,z,r,()=>true)&&BIO.clearOf(x,z,r)&&BIO.mask(x,z)>.9&&keep(x,z)>0;
 for(let j=-N;j<=N;j++)for(let i=-N;i<=N;i++){const h=KRAND.hash(W,i,j,0x7a1),u=k=>KRAND.unit(KRAND.hash(h,k,0,0x7a1)),x=(i+u(1))*cell,z=(j+u(2))*cell;
  if(Math.abs(x)>R||Math.abs(z)>R)continue;const ld=BIO.lodD(x,z);if(ld>Lv.far)continue;
  if(u(3)>accept(x,z)*q||!clear(x,z,3))continue;
  const w=o.ecotone?(o.wetAt?o.wetAt(x,z):.5):0,r4=u(4),sp=o.ecotone&&r4<.25+.35*w?(u(5)<.5+.4*w?'maple':'oak'):r4<.7?'juniper':'pinyon',KK=K[sp];if(!KK)continue;reseed(h);
  const T=KK.make(x,BIO.host.terrainH(x,z),z);const g=KK.grow(T,ld<Lv.hero?2:1);if(g===null)continue;
  S.insert(T,x,z,(T.rb==null?.5:T.rb)*1.4+2);PAINTED.TREES.push(T);st[sp]++;
  BIO.register({name:KK.record.name,kind:'tree',label:KK.record.name,x,z,y:T.y0,r:T.crownR==null?3:T.crownR,h:T.H,tags:KK.record.tags});}
 return st;};
// PAINTED.dress(seeps, opt): the hanging gardens round the seeps the host hands over ([{x, y, z, nx, nz}]: a spring at an alcove's back or a seep line's
// foot): wet grass, snow primrose and scarlet beardtongue in a fan below each (the plan's "seeps and hanging gardens"). Returns the plants placed.
PAINTED.dress=function(seeps,opt){opt=opt||{};const {TAU,rr,reseed,qEuler}=BIO.fn,seed=KRAND.child(2000041,'paintedhighlands/seeps');let n=0;
 (seeps||[]).forEach((s,si)=>{for(let k=0;k<(opt.n==null?24:opt.n);k++){reseed(KRAND.hash(seed,si,k));const a=Math.atan2(s.nz,s.nx)+rr(-1,1),d=rr(1,opt.reach==null?14:opt.reach),x=s.x+Math.cos(a)*d,z=s.z+Math.sin(a)*d;
  if(BIO.mask(x,z)<=0&&!opt.anywhere)continue;const y=BIO.host.terrainH(x,z),f=k%3===0?6:k%3===1?1:-1;
  if(f<0)BIO.put('phgrass',[x,y-.04,z],qEuler(0,rr(0,TAU),0),[.5,.6,.5],PAINTED.C(0x8aa86a));
  else BIO.put('phfl'+f,[x,y-.03,z],qEuler(0,rr(0,TAU),0),[.45,.45,.45],PAINTED.C(0xf4f2ec));n++;}});
 return n;};
PAINTED.build=function(opt){opt=opt||{};const R=opt.R==null?2500:opt.R,q=opt.quality==null?1:opt.quality;BIO.cur='paintedhighlands/floor';
 const out=Object.assign({R,quality:q},PAINTED.buildFloor(R,q,opt));BIO.cur='paintedhighlands/trees';out.trees=PAINTED.buildTrees(R,q,opt);BIO.cur=null;return out;};
PAINTED.canopyH=function(x,z){return 1;};
BIO.kitEnd(PAINTED);   // its exports run in its registry; the default kit is current again
