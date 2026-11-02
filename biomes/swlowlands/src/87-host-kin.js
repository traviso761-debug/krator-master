// ================================================================= HOST — the neighbours' cousins and the kit's own two (PLAN-FLORA.md, EXCHANGES.md; the final rebuild, 2026-11-02)
// The lowlands as RECEIVER. Every cousin is wide, branching and red (the owner's rule for what comes in), a kin by BIO.kin (core/biome 32), grown by its own kit's builder (read in
// place: build.py NEIGH), never the source's build. A CUT REPLACES, it does not add (PLAN-FLORA.md, the budget): swlowKinVeto(), before the tree pass, cuts a share of one kit species
// in a zone (SWLOW.veto: the cut tree keeps its place in TREES, and every tree reseeds, so no other tree moves), and growKin() stands the cousin where it stood:
//   swhighlands.latticeoak   -> the red lattice sprawl   <- an eighth of the sprawl oaks in `sub`
//   swhighlands.coralmelon                               <- a sixth of the rattle-pods in `med`
//   nwlowlands.banksia       -> the red candle banksia   <- a sixth of the ember manzanitas in the chaparral
//   nwlowlands.paperbark     -> the red-flake paperbark  <- a quarter of the cane palms on the swamp's margins
//   swbay.puzzle             -> the flat red puzzle      <- a sixth of the jacarandas at the warm end of `med` and `sub`
//   swlowlands.ribbonroot    (the kit's own, 28)         <- a fifth of the knee-cypresses on the swamp's mud
//   swlowlands.springcypress (the kit's own, 27)            two at each clear spring (every tree within 24 m of a pool cut, so no bole stands over one)
//   swhighlands.fishingbridge                               two, over the bayou's channels (every tree within 20 m of a span cut)
// and the bead coral on the floor (`sub`, `med`; KRAND cells). Every cut, cell and tree from KRAND.hash(world, place, salt), never from the stream. A cousin past SWLOW.LOD.tree stands as
// its source's own far blob where that kit has one; a small one ends there, as the kit's small species do. ?kin=0: none of the neighbours' (the kit's own two stay).
// NOT TAKEN at this turn: nhighlands' mossmaple and gnarloak and shighlands' crozier (their vendors' turns come later: EXCHANGES.md says the later of the two wires it, pairs 7 and 12);
// the candelabra puya and the red dust reef (wouterwall is not built).
const KIN_ON=new URLSearchParams(location.search).get('kin')!=='0'&&!!BIO.kin&&typeof SWHI!=='undefined'&&typeof NWLOW!=='undefined'&&typeof SWBAY!=='undefined';
const KIN_W=8127,KIN_SPOTS=[],KIN_BRIDGES=[],KIN_TREES=[];
const kinU=(x,z,salt)=>KRAND.unit(KRAND.hash(KIN_W,Math.round(x),Math.round(z),salt));
const KIN_DEF={
 'swhighlands.latticeoak':{key:'redlattice',name:'Red lattice sprawl',scale:{H:.72,rb:1.15,crownR:1.7},tags:{climate:'subtropic',aridity:'humid'}},
 'swhighlands.coralmelon':{key:'coralmelon',name:'Coral melon',tags:{climate:'temperate',aridity:'semiarid'}},
 'nwlowlands.banksia':{key:'redbanksia',name:'Red candle banksia',scale:{H:.9,crownR:1.6},colour:{bark:[0x8a4a34,0x7a402c,0x9a543a]},tags:{climate:'temperate',aridity:'semiarid'}},
 'nwlowlands.paperbark':{key:'redpaperbark',name:'Red-flake paperbark',scale:{H:.68,rb:1.2,crownR:2},colour:{bark:[0xb0583a,0xa44e34,0xc0684a]},tags:{climate:'subtropic',aridity:'humid',riparian:'yes'}},
 'swbay.puzzle':{key:'redpuzzle',name:'Flat red puzzle',scale:{H:.7,rb:1.1,crownR:1.8},colour:{bark:[0x8a4230,0x7a3a2a,0x9a4c38]},tags:{climate:'subtropic',aridity:'subhumid'}}};
const KIN_RULES=[
 {from:'sprawloak',to:'swhighlands.latticeoak',share:.125,salt:0x6e01,zone:Z=>Z.sub>.5},
 {from:'rattlepod',to:'swhighlands.coralmelon',share:.16,salt:0x6e02,zone:Z=>Z.med>.5},
 {from:'manzanita',to:'nwlowlands.banksia',share:.16,salt:0x6e03,zone:Z=>Z.med>.5&&Z.chapK>.5},
 {from:'canepalm',to:'nwlowlands.paperbark',share:.25,salt:0x6e04,zone:Z=>Z.swamp>.25&&Z.swamp<.8},
 {from:'jacaranda',to:'swbay.puzzle',share:.16,salt:0x6e05,zone:Z=>Z.med>.4||Z.tropic>.4},
 {from:'cypress',to:'swlowlands.ribbonroot',own:true,share:.2,salt:0x6e06,zone:Z=>Z.swamp>.5&&Z.h>.2}];
// the bridges' banks: across a bayou's channel, read from the ground at build time: the two spans nearest 30 m, 280 m apart at least
function kinBridges(){const out=[],C=[],D=[[1,0],[0,1],[RT2,RT2],[RT2,-RT2]];
 for(let s=-1720;s<-1120;s+=23)for(let t=-760;t<760;t+=31){const a=xzOf(s,t);if(terrainH(a[0],a[1])>-.1)continue;
  for(const d of D){let p=null,q=null;for(let r=2;r<34;r+=2){if(!p&&terrainH(a[0]+d[0]*r,a[1]+d[1]*r)>.6)p=[a[0]+d[0]*r,a[1]+d[1]*r];if(!q&&terrainH(a[0]-d[0]*r,a[1]-d[1]*r)>.6)q=[a[0]-d[0]*r,a[1]-d[1]*r];}
   if(p&&q){const L=Math.hypot(p[0]-q[0],p[1]-q[1]);if(L>=14&&L<=52)C.push({L,p,q,s,t});}}}
 C.sort((a,b)=>Math.abs(a.L-30)-Math.abs(b.L-30)||a.s-b.s||a.t-b.t);
 for(const c of C){if(out.length>=2)break;if(out.some(b=>Math.hypot(b[0]-c.p[0],b[1]-c.p[1])<280))continue;out.push([c.p[0],c.p[1],c.q[0],c.q[1]]);}
 return out;}
// before SWLOW.build: the cuts (only within reach of the heroes: a far tree keeps its impostor, so the far canopy does not thin); the springs' clearing whatever ?kin says
function swlowKinVeto(){const prev=SWLOW.veto;if(!ST&&KIN_ON)KIN_BRIDGES.push(...kinBridges());
 SWLOW.veto=(kind,key,x,z)=>{if(prev&&prev(kind,key,x,z))return true;if(kind!=='tree')return false;
  for(const S of SPRINGS)if(Math.hypot(x-S.x,z-S.z)<S.r+24)return true;
  if(key!=='mangrove'&&key!=='cypress'&&WATER_FN.shore(x,z)<.8)return true;   /* no bole in the water the eye sees (the ribbons, the springs' runs): WATER.edgeAudit's plant-in-water */
  for(const b of KIN_BRIDGES){const mx=(b[0]+b[2])/2,mz=(b[1]+b[3])/2;if(Math.hypot(x-mx,z-mz)<Math.hypot(b[2]-b[0],b[3]-b[1])/2+20)return true;}
  if(BIO.lodD(x,z)>1100)return false;const Z=SWLOW.zones(x,z);
  for(const R of KIN_RULES){if(!R.own&&!KIN_ON)continue;if(R.from===key&&R.zone(Z,x,z)&&kinU(x,z,R.salt)<R.share){KIN_SPOTS.push({to:R.to,own:R.own,x,z,salt:R.salt});return true;}}
  return false;};}
// after the kit's passes, before the bake
function growKin(){const out={trees:{},floor:{},bridges:0},KIN={};
 const kin=ref=>{if(!(ref in KIN))KIN[ref]=BIO.kin(ref,Object.assign({},KIN_DEF[ref]||{key:ref.split('.')[1]}));return KIN[ref];};
 const LT=SWLOW.LOD.tree,prevCur=BIO.cur;BIO.cur='lowlands/trees';
 const place=(x,z,salt,build)=>{const y=terrainH(x,z);reseed(KRAND.hash(KIN_W,Math.round(x),Math.round(z),salt));const lv=BIO.lodD(x,z)<700?2:1;BIO.owner=[x,z];BIO.range=LT;BIO.minRange=0;
  const T=build(y,lv);BIO.owner=null;BIO.range=null;BIO.minRange=0;return T;};
 const growOwn=(key,x,z,salt)=>{const sp=SWLOW.SPECIES.findIndex(S=>S.key===key);return place(x,z,salt,(y,lv)=>{const T=SWLOW.make(sp,x,y,z);SWLOW.TREES.push(T);SWLOW.grow(T,lv);
    BIO.range=1e9;BIO.minRange=LT;SWLOW.grow(Object.assign({},T),0);out.trees[key]=(out.trees[key]||0)+1;return T;});};
 const growKinTree=(ref,x,z,salt,extra)=>{const K=kin(ref);if(!K)return null;return place(x,z,salt,(y,lv)=>{const T=K.make(x,y,z);if(extra)Object.assign(T,extra);K.grow(T,lv);
    REGISTER({name:K.name,kind:'tree',label:K.name,x,z,y:T.y0,r:Math.max(2,T.crownR||3),h:T.H});out.trees[K.key]=(out.trees[K.key]||0)+1;KIN_TREES.push({x,z,r:Math.min(T.rb||.3,.6),name:K.key});return T;});};
 KIN_SPOTS.forEach(S=>{if(S.own)growOwn(S.to.split('.')[1],S.x,S.z,S.salt);else growKinTree(S.to,S.x,S.z,S.salt);});
 /* the spring cypresses: on the pool's bank away from the river, each from its spring's hash */
 SPRINGS.forEach((S,i)=>{[0,1].forEach(k=>{const a=Math.atan2(S.z,S.x)+(k?1.5:-1.2)+KRAND.unit(KRAND.hash(KIN_W,i,k,0x6e10)),d=S.r+7+6*KRAND.unit(KRAND.hash(KIN_W,i,k,0x6e11));growOwn('springcypress',S.x+Math.cos(a)*d,S.z+Math.sin(a)*d,0x6e12+i*2+k);});});
 if(KIN_ON)KIN_BRIDGES.forEach((b,i)=>{if(growKinTree('swhighlands.fishingbridge',b[0],b[1],0x6e20+i,{x2:b[2],z2:b[3]}))out.bridges++;});
 /* the bead coral on the floor: the highlands' item, in their registry */
 if(KIN_ON){const prev=BIO.kit('swhighlands'),PICK=SWHI.PICK,cell=42,R=TERR.R-150,N=Math.ceil(R/cell);let n=0;BIO.cur='lowlands/floor';
  try{BIO.range=SWLOW.LOD.floor;BIO.minRange=0;
   for(let j=-N;j<=N;j++)for(let i=-N;i<=N;i++){const h=KRAND.hash(KIN_W,i,j,0x6e30),u=k=>KRAND.unit(KRAND.hash(h,k,0,0x6e31)),x=(i+u(1))*cell,z=(j+u(2))*cell;
    if(Math.hypot(x,z)>R||BIO.lodD(x,z)>SWLOW.LOD.floor||BIO.mask(x,z)<=0||SWLOW.blocked(x,z,1)||!BIO.clearOf(x,z,1))continue;const Z=SWLOW.zones(x,z);if(u(3)>Z.sub*.14+Z.med*.1)continue;
    const y=drawnH(x,z),s=KRAND.stream(h),e=s.range(.7,1.4);BIO.put('beadcoral',[x,y-.05,z],new THREE.Quaternion().setFromEuler(new THREE.Euler(0,s.range(0,6.283),0,'YXZ')),[e,e*s.range(.85,1.15),e],PICK([0xffffff,0xfff0f8,0xfff4ea],s.next()),{label:'Bead coral'});n++;}
   out.floor['bead coral']=n;}
  finally{BIO.kit(prev);BIO.range=null;BIO.minRange=0;}}
 BIO.cur=prevCur;return out;}
