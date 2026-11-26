// ================================================================= HOST — the neighbours' cousins (PLAN-FLORA.md, EXCHANGES.md; the final rebuild, 2026-10-27)
// The bay as RECEIVER: species of the SW highlands (its fungoid lineage come down to the bay: PLAN-FLORA.md) and of the north-west bay
// (EXCHANGES.md, nwbay -> swbay), each a kin by BIO.kin (core/biome 32), grown by its own kit's builder (read in place: build.py NEIGH),
// never the source kit's build. THE BACKFILL REPLACES, IT DOES NOT ADD (PLAN-FLORA.md, the budget): before the bay's tree pass,
// swbayKinVeto() cuts a share of one bay species in a zone (SWBAY.veto: the cut tree keeps its place in the pass's list and hash, so no
// other tree moves), and growKin() stands the cousin where it stood:
//   swhighlands.stiltpod     <- a seventh of the splay shrubs on the rainforest's slope and the river's banks (the slips and cut banks)
//   swhighlands.beadcone     <- a quarter of the bracket trees in the rainforest (the understorey, with the crown ferns)
//   swhighlands.weepingwisp  <- one crown fern in ten in the rainforest (a few, lit at night)
//   swhighlands.shelfcoral   <- a tenth of the savannah's dragon trees (the rock-eater on the volcano's rubble: its own fresh stones)
//   swhighlands.coralmelon   <- one savannah parasol in fourteen (the dry savannah's succulents)
//   nwbay.cinderpine         <- a fifth of the monkey puzzles on the savannah's high, ashy NE (the lava rubble)
//   nwbay.flamecrown         <- a quarter of the splay shrubs on the shore and the river's lower banks (the bays' shared street tree)
//   swhighlands.fishingbridge   two, over the river's lowland reach below the cataracts (every tree within 20 m of them cut)
// and on the floor (the floor band, KRAND cells, a few): glow tubes and bearded triplets in the jungle, bulb heath and arrowheads among the
// parasols, blue-berry bracts on a tenth of the rainforest's and the jungle's heroes. Every cut, cell and tree from KRAND.hash(world, place,
// salt), never from the stream. Drawn within SWBAY.LOD.tree of the camera as the bay's heroes are; past it the nwbay pair stand as their
// own far blobs, the highland species (5-20 m) end, as the bay's small species do. ?kin=0: none, the bay as it was.
// Not taken: the log crust (the bay's logs are the floor pass's, not records a host can read) and the drip cap on the jetty and tower (the
// dress pass's shells; owed to a later turn)
const SWBAY_KIN=new URLSearchParams(location.search).get('kin')!=='0'&&!!BIO.kin&&typeof SWHI!=='undefined'&&typeof NWBAY!=='undefined';
const KIN_W=8113,KIN_SPOTS=[],KIN_BRIDGES=[];
const kinU=(x,z,salt)=>KRAND.unit(KRAND.hash(KIN_W,Math.round(x),Math.round(z),salt));
// the bridges' banks: across the river's line at two places on the lowland reach (u along the bay's diagonal, as 45 draws it)
function kinBridges(){const out=[];[MOUTH_U+520,MOUTH_U+760].forEach(u=>{const v=vR(u),dv=(vR(u+2)-vR(u-2))/4,n=Math.hypot(1,dv),w=(12-5*smooth(1000,4000,u))+4;
  const a=uvXZ(u-dv/n*w,v+1/n*w),b=uvXZ(u+dv/n*w,v-1/n*w);out.push([a[0],a[1],b[0],b[1]]);});return out;}
const KIN_RULES=[
 {from:'splay',to:'swhighlands.stiltpod',share:.15,salt:0x6c01,zone:Z=>Z.rain>.35||Z.flow>.6},
 {from:'brackettree',to:'swhighlands.beadcone',share:.25,salt:0x6c02,zone:Z=>Z.rain>.35},
 {from:'treefern',to:'swhighlands.weepingwisp',share:.1,salt:0x6c03,zone:Z=>Z.rain>.4},
 {from:'dragon',to:'swhighlands.shelfcoral',share:.1,salt:0x6c04,zone:Z=>Z.sav>.5},
 {from:'parasol',to:'swhighlands.coralmelon',share:.07,salt:0x6c05,zone:Z=>Z.sav>.5},
 {from:'puzzle',to:'nwbay.cinderpine',share:.2,salt:0x6c06,zone:(Z,x,z)=>Z.sav>.5&&Z.up>.7},
 {from:'splay',to:'nwbay.flamecrown',share:.25,salt:0x6c07,zone:Z=>Z.shore>.4||(Z.flow>.5&&Z.up<.15)}];
// before SWBAY.build: the cuts (only within reach of the heroes: a far tree keeps its blob or impostor, so the far canopy does not thin)
// and round the karst springs (45 SPRINGS), on with them whatever ?kin says: no bole stands over a pool (a tree whose bole and flare reach
// within 6 m of the pool's rim is cut; its place in the pass stays, so no other tree moves)
function swbaySpringVeto(){if(!SPRINGS.length)return;const prev=SWBAY.veto;
 SWBAY.veto=(kind,key,x,z)=>{if(prev&&prev(kind,key,x,z))return true;if(kind!=='tree')return false;
  const S=SPRINGS.find(S=>Math.hypot(x-S.x,z-S.z)<S.r+30);if(!S)return false;const sp=SWBAY.byKey[key],rb=sp?sp.rb[1]:1;
  return Math.hypot(x-S.x,z-S.z)<S.r+6+rb*2.2;};}
function swbayKinVeto(){swbaySpringVeto();if(!SWBAY_KIN)return;KIN_BRIDGES.push(...kinBridges());const prev=SWBAY.veto;
 SWBAY.veto=(kind,key,x,z)=>{if(prev&&prev(kind,key,x,z))return true;if(kind!=='tree')return false;
  for(const b of KIN_BRIDGES){const mx=(b[0]+b[2])/2,mz=(b[1]+b[3])/2;if(Math.hypot(x-mx,z-mz)<Math.hypot(b[2]-b[0],b[3]-b[1])/2+20)return true;}
  if(BIO.lodD(x,z)>1100)return false;const Z=SWBAY.zones(x,z);
  for(const R of KIN_RULES)if(R.from===key&&R.zone(Z,x,z)&&kinU(x,z,R.salt)<R.share){KIN_SPOTS.push({to:R.to,x,z,salt:R.salt});return true;}
  return false;};}
// after the bay's passes, before the bake: the cousins where the cuts stood, the bridges, the floor's few
function growKin(){if(!SWBAY_KIN)return null;const out={trees:{},floor:{},bridges:0};
 const KIN={},kin=ref=>{if(!(ref in KIN)){const k=ref.split('.')[1];KIN[ref]=BIO.kin(ref,{key:k,tags:{climate:'tropic..hypertropic',kin:ref}});}return KIN[ref];};
 const LT=SWBAY.LOD.tree,grow=(K,ref,x,z,salt,extra)=>{const y=terrainH(x,z);if(y<.4)return null;
  reseed(KRAND.hash(KIN_W,Math.round(x),Math.round(z),salt));const T=K.make(x,y,z);if(extra)Object.assign(T,extra);const lv=BIO.lodD(x,z)<700?2:1;
  BIO.owner=[x,z];BIO.range=LT;BIO.minRange=0;K.grow(T,lv);
  if(ref.startsWith('nwbay.')){BIO.range=1e9;BIO.minRange=LT;K.grow(Object.assign({},T),0);}   /* the nwbay pair's own far blob past the heroes' range */
  BIO.owner=null;BIO.range=null;BIO.minRange=0;
  if(lv===2&&!ref.startsWith('nwbay.'))REGISTER({name:K.name,kind:'tree',label:K.name,x,z,y:T.y0,r:Math.max(2,T.crownR||3),h:T.H});   /* nwbay's builders register their own */
  out.trees[K.key]=(out.trees[K.key]||0)+1;return T;};
 BIO.cur='bay/kin';
 KIN_SPOTS.forEach(S=>{const K=kin(S.to);if(K)grow(K,S.to,S.x,S.z,S.salt);});
 const FB=kin('swhighlands.fishingbridge');
 if(FB)KIN_BRIDGES.forEach((b,i)=>{if(grow(FB,'swhighlands.fishingbridge',b[0],b[1],0x6c08+i,{x2:b[2],z2:b[3]}))out.bridges++;});
 // the floor's few: KRAND cells round the camera's reach of the floor band, in the highlands' registry (their items are theirs)
 const prev=BIO.kit('swhighlands'),FR=SWHI.FLOOR_RAINWALL,FC2=SWHI.FLOOR_COAST,PAL2=SWHI.PAL,PK=SWHI.PICK,R=TERR.R-150;
 try{BIO.range=SWBAY.LOD.floor;BIO.minRange=0;
  const cells=(cell,salt,accept,put,key)=>{let n=0;const N=Math.ceil(R/cell);
   for(let j=-N;j<=N;j++)for(let i=-N;i<=N;i++){const h=KRAND.hash(KIN_W,i,j,salt),u=k=>KRAND.unit(KRAND.hash(h,k,0,salt));
    const x=CENTER[0]+(i+u(1))*cell,z=CENTER[1]+(j+u(2))*cell;if(Math.hypot(x-CENTER[0],z-CENTER[1])>R||BIO.lodD(x,z)>SWBAY.LOD.floor)continue;
    const y=terrainH(x,z);if(y<.5||riverD(x,z)<16||!BIO.clearOf(x,z,1)||SWBAY.blocked(x,z,1))continue;
    if(u(3)>accept(SWBAY.zones(x,z)))continue;n+=put(x,y,z,KRAND.stream(h))||1;}
   out.floor[key]=n;};
  cells(48,0x6d01,Z=>Z.hyper*.22,FR.glow,'glow tubes');
  cells(44,0x6d02,Z=>Z.hyper*.2+Z.rain*.08,FR.triplets,'bearded triplets');
  cells(34,0x6d03,Z=>Z.sav*.22,(x,y,z,s)=>{const w=s.range(.6,1.3);BIO.put('bheath',[x,y-.05,z],FL_QE(s.range(0,TAU)),[w,w*s.range(.6,.9),w],PK(PAL2.heath,s.next()),{label:'Bulb heath'});return 1;},'bulb heath');
  if(FC2&&FC2.arrow)cells(44,0x6d04,Z=>Z.sav*.18,FC2.arrow,'arrowheads');
  // the blue-berry bracts: one in ten of the jungle's and the rainforest's heroes, one to three on the bole's lower half
  BIO.range=LT;let nb=0;
  SWBAY.TREES.forEach((T,ti)=>{if(T.cut||T.lv!==2||T.sav>.5||kinU(T.x,T.z,0x6d05)>.1)return;const s=KRAND.stream(KRAND.hash(KIN_W,ti,0,0x6d06)),n=s.int(1,3);BIO.owner=[T.x,T.z];
   for(let k=0;k<n;k++){const a=s.range(0,TAU),u=s.range(.06,.3),r=T.rb*(1+.6*Math.exp(-u*T.H/5))*.95,h=s.range(.6,1.1);
    BIO.put('bract',[T.x+Math.cos(a)*r,T.y0+T.H*u,T.z+Math.sin(a)*r],FL_QE(a),[h,h,h],0xffffff,{label:'Blue-berry bract'});nb++;}});
  BIO.owner=null;out.floor['blue-berry bracts']=nb;}
 finally{BIO.kit(prev);BIO.range=null;BIO.minRange=0;BIO.cur=null;}
 return out;}
function FL_QE(ry){return new THREE.Quaternion().setFromEuler(new THREE.Euler(0,ry,0,'YXZ'));}
