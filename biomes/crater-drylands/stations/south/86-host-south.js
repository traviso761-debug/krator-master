// ================================================================= HOST — station 2, the south: the swap (PLAN-LANDS.md 5.3), its views and checks
// STATION.build (45) calls SOUTH.build from src/88-host-build.js in place of the kit's build alone:
//   1. THE BASE: this kit (prism mallee, frill-tree, sword spire, pyre pillar, ghost gum and the rest) everywhere but the old flows (its mask).
//   2. THE BLACK MALLEE (the owner, 2026-11-09: "black mallee is good"): the prism mallee grown on titanium basalt, only on the old flows. A kin
//      of this kit's own prism mallee (BIO.kin('craterdry.prismmallee')), grown by its builder with the kin's colours: the iridescence violet-
//      black to bronze instead of green to orange-red, the bark smoky; it resprouts out of black cinder (the fire mosaic runs over the flows as
//      over everything: a burnt one is the mallee's black stems and red shoots, on black ground).
//   3. THE SE RIM COMES IN on the wetter northern and eastern edges (reach ~60 km, PLAN-LANDS 5.3): savannarim's rust miombo and incense tree
//      (SAVRIM.builders, read in place) on the open ground there, and its rain rose (savannarim's cousin of sedesert's rose) on the kopjes there.
//   Each by hashed cell (KRAND, world 0x5007), so nothing hangs on a draw order; heroes near the LOD spine, each kit's far form beyond.
//   4. THE AF GALLERY in the north-western gully (45: GULLY): the hyperjungle's trees at .3-.5 of their size along it, as savannarim's gallery
//      forest takes them (HYPERJUNGLE.make / grow, read in place), with the kit's own wash trees.
//   5. THE OAK SCRUB on the topmost ground (the Csa and Csb slopes toward the southern highlands; here the lava step's top, off the flows): a kin
//      of nhighlands' gnarled oak (BIO.kin('nhighlands.gnarloak'), read in place; EXCHANGES.md's row: a scrub oak 3-6 m, small hard dusty
//      leaves), grown by its own gnarl builder without its moss. Its builder knows no fire (it does not resprout on the page: noted).
//   Not here (owed: KNOWN_ISSUES.md): Godstep's red guyed stalk and lava pioneers (Godstep's kit is a plan). ?black=0, ?serim=0, ?gallery=0
//   and ?oak=0 leave each out.
const SOUTH=(function(){const Q=new URLSearchParams(location.search),W=0x5007,E={black:[],serim:[],gallery:[],oak:[]};
 const lava=(x,z)=>FIELD.lava(x,z),wedge=(x,z)=>FIELD.wetedge(x,z);
 const crMask=(x,z)=>1-smooth(.2,.5,lava(x,z));   /* the kit's base keeps off the flows (none past half a flow: the check counts trees over .6) */
 E.crMask=crMask;
 const LOD=()=>BIO.LOD();
 const clear=(x,z,pad,list)=>!CRATERDRY.blocked(x,z,pad)&&!list.some(T=>Math.hypot(T.x-x,T.z-z)<T.crownR*.7+pad);
 // one pass by hashed cell: accept(x,z) -> 0..1, grow(x,y,z,lv,seed) -> the tree (or null)
 function pass(salt,cell,p,pad,accept,grow,list){const R=TERR.R-200,n=Math.ceil(R/cell),L=LOD();let c=0;
  for(let j=-n;j<n;j++)for(let i=-n;i<n;i++){reseed(KRAND.hash(W,salt,i,j));const x=(i+.15+.7*rng())*cell,z=(j+.15+.7*rng())*cell,u=rng(),seed=ri(0,999999);
   if(Math.hypot(x,z)>R)continue;const a=accept(x,z);if(!(a>0)||u>p*a||BIO.mask(x,z)<=0||!clear(x,z,pad,list))continue;
   const y=terrainH(x,z),ld=BIO.lodD(x,z),lv=ld<L.hero?2:(ld<L.mid?1:0),T=grow(x,y,z,lv,seed);if(!T)continue;
   T.x=x;T.z=z;list.push(T);c++;OBSTACLES.push({x,z,r:(T.crownR==null?3:T.crownR)*.6+1,y0:y-3,y1:y+(T.H==null?8:T.H)});
   if(lv>0&&T.name)REGISTER({name:T.name,key:T.key,x,z,y:y-1,r:(T.crownR==null?3:T.crownR)*1.1,h:(T.H==null?8:T.H)+2});}
  return c;}
 function black(q){if(Q.get('black')==='0'||typeof BIO.kin!=='function')return 0;
  const K=BIO.kin('craterdry.prismmallee',{key:'blackmallee',name:'Black mallee (the prism mallee on titanium basalt)',
   colour:{leaf:[0x2e2a34,0x36303c,0x2a2a2a,0x3a3236],irid:[0x7a3a9a,0xa8783a,0x5a2e7a,0xc0904a],bark:[0x3a343c,0x6a5040,0x4a3c48,0x2e2a30,0x8a6a40,0x5a4a3a]},
   tags:{koppen:['BSh'],substrate:'titanium basalt (the old flows)',hybrid:'prismmallee'}});
  if(!K)return 0;E.blackKin=K;
  return pass(1,16,.62*q,1.4,(x,z)=>smooth(.5,.8,lava(x,z)),(x,y,z,lv)=>{const T=K.make(x,y,z);K.grow(T,lv);T.name=K.record.name;T.key='blackmallee';T.lv=lv;return T;},E.black);}
 function serim(q){const out={miombo:0,incense:0,rainrose:0};if(Q.get('serim')==='0'||typeof SAVRIM==='undefined'||typeof BIO.kitBuilder!=='function')return out;
  const MB=BIO.kitBuilder('savannarim','rustmiombo'),IB=BIO.kitBuilder('savannarim','incense'),CO=SAVRIM.LANDS&&SAVRIM.LANDS.southeast?SAVRIM.LANDS.southeast.cousins():{},RR=CO.rainrose;
  const open=(x,z)=>{const Z=CRATERDRY.zones(x,z);return Z.open*(1-smooth(.3,.6,lava(x,z)));};
  const own=(B,key)=>(x,y,z,lv,seed)=>{const T=B.make(x,y,z,seed);B.grow(T,lv);T.name=B.species?B.species.name:key;T.key=key;T.lv=lv;return T;};
  if(MB)out.miombo=pass(2,70,.55*q,8,(x,z)=>smooth(.35,.7,wedge(x,z))*open(x,z),own(MB,'rustmiombo'),E.serim);
  if(IB)out.incense=pass(3,42,.4*q,4,(x,z)=>smooth(.3,.65,wedge(x,z))*Math.max(open(x,z)*.7,CRATERDRY.zones(x,z).kop*.5),own(IB,'incense'),E.serim);
  if(RR)out.rainrose=pass(4,30,.5*q,4,(x,z)=>smooth(.25,.55,wedge(x,z))*CRATERDRY.zones(x,z).kop,(x,y,z,lv)=>{const T=RR.make(x,y,z);RR.grow(T,lv);T.name=RR.record.name;T.key='rainrose';T.lv=lv;return T;},E.serim);
  return out;}
 function gallery(q){if(Q.get('gallery')==='0'||typeof HYPERJUNGLE==='undefined'||!HYPERJUNGLE.make||!HYPERJUNGLE.grow)return 0;const HJ=HYPERJUNGLE,GSP=[0,4,5,0,1,4,5,2,3];
  return pass(5,55,.6*q,7,(x,z)=>smooth(.35,.75,FIELD.gully(x,z)),(x,y,z,lv,seed)=>{const sp=GSP[seed%GSP.length],T=HJ.make(sp,x,y,z),k=.3+.2*((seed>>4)%100)/100;
   T.H*=k;T.rb*=k;T.crownR*=k;HJ.grow(T,Math.max(1,lv));T.name='Gallery forest: a '+HJ.SPECIES[sp].name.toLowerCase()+' (the hyperjungle\'s, at '+k.toFixed(2)+' of its size)';T.key=HJ.SPECIES[sp].key;T.lv=lv;return T;},E.gallery);}
 function oak(q){if(Q.get('oak')==='0'||typeof NHL==='undefined'||typeof BIO.kin!=='function')return 0;const S0=NHL.SPECIES.find(S=>S.key==='gnarloak');if(!S0)return 0;
  const K=BIO.kin('nhighlands.gnarloak',{key:'scruboak',name:'Scrub oak (nhighlands\' gnarled oak, dried to the drylands)',scale:{H:.38,rb:.4,crownR:.42},
   colour:{leaf:[0x6a7050,0x5e6448,0x74785a,0x666a4c]},form:Object.assign({},S0.form,{moss:0}),tags:{koppen:['Csa','Csb','BSh'],aridity:'semiarid'}});
  if(!K)return 0;return pass(6,24,.5*q,2.5,(x,z)=>smooth(14,40,z-stepZ(x))*(1-smooth(.2,.45,lava(x,z))),(x,y,z,lv)=>{const T=K.make(x,y,z);T.wet=.2;K.grow(T,lv);T.name=K.record.name;T.key='scruboak';T.lv=lv;return T;},E.oak);}
 E.build=function(q){let out;
  try{MASK=crMask;out=CRATERDRY.build({R:TERR.R-150,quality:q});}finally{MASK=()=>1;}
  (CRATERDRY.TREES||[]).forEach(T=>OBSTACLES.push({x:T.x,z:T.z,r:T.crownR*.6+1,y0:T.y0-3,y1:T.y0+T.H}));
  try{BIO.cur='south/blackmallee';out.blackmallee=black(q);BIO.cur='south/serim';out.serim=serim(q);BIO.cur='south/gallery';out.gallery=gallery(q);BIO.cur='south/oak';out.oak=oak(q);}catch(e){reportErr('south: '+e.stack);}finally{BIO.cur=null;}
  return out;};
 // the views
 const near=(list,key,x,z,lv)=>{let b=null,bd=1e9;for(const T of list){if((key!=null&&T.key!==key)||(lv!=null&&T.lv<lv))continue;const d=Math.hypot(T.x-x,T.z-z);if(d<bd){bd=d;b=T;}}return b;};
 const tree=T=>Object.assign({y0:terrainH(T.x,T.z),H:T.H==null?8:T.H,crownR:T.crownR==null?3:T.crownR},T);
 E.views=function(h){const V={},c=BIO.center?BIO.center():[0,0];
  const b=near(E.black,'blackmallee',FLOWS[1].pts[2][0],FLOWS[1].pts[2][1],2);if(b)V['The black mallee on an old flow']=h.atTree(tree(b),9,.8,2,.35);
  const m=near(E.serim,'rustmiombo',c[0],c[1]-1500,1);if(m)V['Rust miombo on the wet edge']=h.atTree(tree(m),m.H*1.5,2.2,4,.55);
  const i=near(E.serim,'incense',c[0]+1500,c[1],1);if(i)V['Incense trees']=h.atTree(tree(i),i.H*1.6,1.2,2.4,.5);
  const K0=KOP[0],r=near(E.serim,'rainrose',K0.x,K0.z,1);if(r)V['A rain rose on its kopje']=h.atTree(tree(r),r.H*1.8,2.6,3,.5);
  V['The rose kopje']=h.look(K0.x+K0.r*2.2,K0.z+K0.r*1.4,10,K0.x,K0.z,K0.h*.5);
  const F=FLOWS[0].pts;V['An old flow coming down from the south']=h.look(F[3][0]+260,F[3][1]-120,30,F[1][0],F[1][1],0);
  const gp=GULLY[2],g=near(E.gallery,null,gp[0],gp[1]);if(g)V['The Af gallery in the gully']=h.atTree(tree(g),(g.crownR==null?8:g.crownR)*2.5,.9,3,.45);
  const sx=600,sz=stepZ(600);V['The lava step: titanium basalt in its beds']=h.look(sx+40,sz-140,6,sx,sz,STEP_H*.5);
  const o=near(E.oak,'scruboak',-300,stepZ(-300)+120,1);if(o)V['Scrub oak on the step\'s top']=h.atTree(tree(o),8,1.4,1.6,.4);
  V['The south from above']=h.look(2400,-2300,800,-200,600,0);return V;};
 // the station's checks, each with its broken input
 const CH={black:L=>{const off=L.filter(T=>lava(T.x,T.z)<.4);return{ok:L.length>=40&&!off.length,detail:L.length+' black mallees'+(off.length?', '+off.length+' off the old flows':', all on the old flows')};},
  serim:o=>({ok:o.miombo>=15&&o.incense>=15&&o.rainrose>=3,detail:'rust miombo '+o.miombo+', incense '+o.incense+', rain roses '+o.rainrose+' (the se rim, from savannarim)'}),
  gallery:L=>{const off=L.filter(T=>FIELD.gully(T.x,T.z)<.25);return{ok:L.length>=10&&!off.length,detail:L.length+' gallery trees (the hyperjungle\'s)'+(off.length?', '+off.length+' out of the gully':', all in the north-western gully')};},
  base:T=>{const on=T.filter(t=>lava(t.x,t.z)>.6);return{ok:!on.length,detail:on.length?on.length+' of the kit\'s trees on an old flow':T.length+' trees of the kit\'s base, none on an old flow'};}};
 E.checks=add=>{add('the black mallee on the old flows only',CH.black(E.black));add('the se rim\'s trees on the wet edges',CH.serim((window._biome&&window._biome.serim)||{}));
  add('the kit\'s base off the old flows',CH.base(CRATERDRY.TREES||[]));add('the Af gallery in the gully',CH.gallery(E.gallery));
  add('scrub oak on the step\'s top',{ok:E.oak.length>=30&&E.oak.every(T=>T.z>stepZ(T.x)+10),detail:E.oak.length+' scrub oaks'+(E.oak.every(T=>T.z>stepZ(T.x)+10)?', all on the step\'s top':', some below it')});
  add('the lava step\'s face in its beds',{ok:!!(window._stepFace&&window._stepFace.tris>2000),detail:window._stepFace?window._stepFace.tris+' triangles of tibasalt face':'no face drawn'});};
 E.negatives=add=>{const P=FLOWS[1].pts[2];add('no black mallee',CH.black([]));add('a black mallee off the flows',CH.black(E.black.concat([{x:KOP[0].x,z:KOP[0].z}])));
  add('no se rim',CH.serim({miombo:0,incense:0,rainrose:0}));add('a gallery tree out on the plain',CH.gallery(E.gallery.concat([{x:0,z:0}])));
  {const below=E.oak.concat([{x:0,z:stepZ(0)-200}]);add('a scrub oak below the step',{ok:below.length>=30&&below.every(T=>T.z>stepZ(T.x)+10),detail:below.length+' scrub oaks with one below the step'});}add('a prism mallee on a flow',CH.base([{x:P[0],z:P[1],sp:0}]));};
 return E;})();
/* the export profile's box (verify.py reads window.EXPORT_BOX_STATION): station 1's box lies off this land; the profile needs water, so the
   300 m box centred on this land's seep (SEEP, 45), as station 1's box holds its own seep (2026-11-09) */
window.EXPORT_BOX_STATION=()=>[Math.round(SEEP.x-150),Math.round(SEEP.z-150),Math.round(SEEP.x+150),Math.round(SEEP.z+150)];
