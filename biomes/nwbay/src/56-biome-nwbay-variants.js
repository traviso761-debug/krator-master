// ================================================================= NORTH-WEST BAY — tree variants (the nursery)
// biomes/WORLD.md: trees as variants. The pass (55) still decides where every tree stands and how tall it is; it
// no longer builds each one where it stands. For every species the kit GROWS SIX VARIANTS once, alone, at the world's
// origin on a flat neutral stage (the NURSERY: flat ground, nothing to keep clear of, no rim, no wind), at each level
// it draws near (2 the hero, 1 the mid); what a variant wrote is CAPTURED out of the kit's stores: its bark buckets
// become one instanced item per material (a prototype mesh), its leaves, fronds, blooms and epiphytes a list of
// instances. Every placed tree is then that variant, turned, scaled to its height and set on its foot: its bark one
// instance, its items re-put through the tree's transform. Godot draws them the same way (one MultiMesh per variant
// part), and an open world can grow the same six from NWBAY.make / NWBAY.grow.
//   The variants differ by size (spread over the species' height band) and by wet (the quantiles of where the pass
//   put that species: the epiphytes, lianas and beards follow wet); a tree takes the variant nearest its height and
//   wet, with a jitter so neighbours differ. Its turn is random, except where the site says which way: a cliff fig's
//   crown leans out over its rim, a cinder pine's lee is down the salt gradient (both grown facing +x).
//   What stays per tree: the far impostors (lv 0, one blob each), and a cliff fig's ROOT CURTAINS, which must reach
//   its own stack's waterline (the variant keeps where they hang from; NWBAY._figCurtains drops them on placement).
//   Mangroves keep the water level: they are grown standing in water at y=0 and placed without a vertical shift.
(function(){const {TAU,clamp,mix,smooth,reseed,rng,rr,ri,h3}=BIO.fn;
const SP=NWBAY.SPECIES,B=NWBAY.BUILDERS,T3=BIO.host.THREE;
const V=NWBAY.VARIANTS=6;
const GROUND=0,MANGROVE_FOOT=-1.1;   // the nursery's ground; a mangrove stands in 1.1 m of water
const newSt=()=>({trunk:0,limb:0,cups:0,far:0,sapTris:0,clumps:0,blooms:0,pods:0,moss:0,fronds:0,fans:0,epi:0,lianas:0,roots:0,whorls:0,heroes:0,fars:0,figsOnEdge:0});

// ---------------------------------------------------------------- one tree alone (the open world's contract)
// make(sp,x,y,z,o): the pass's own record for species sp with its foot on ground y (size and seed from the kit's
// stream: reseed first for a repeatable variant); o may carry wet. grow(T,lv): build that one tree into this kit's
// buckets and items, lv 0 the far impostor, 1 or 2 the hero; no TREES record, no keep-clear. Returns its stat.
NWBAY.make=function(sp,x,y,z,o){o=o||{};const S=SP[sp];
 return{x:x,z:z,y0:y-.5,sp:sp,H:rr(S.H[0],S.H[1]),rb:rr(S.rb[0],S.rb[1]),crownR:rr(S.crownR[0],S.crownR[1]),seed:ri(0,999999),wet:o.wet==null?.7:o.wet};};
NWBAY.grow=function(T,lv){const st=newSt();T.lv=lv;if(lv===0)NWBAY._buildFar(T,T.seed%7,st);else B[T.sp](T,st,lv);return st;};

// ---------------------------------------------------------------- capture: what a grow wrote, taken out of the stores
function snap(){const b={},it={};
 for(const f in BIO.buckets){const K=BIO.buckets[f];b[f]={n:K.pos.length,k:K.k.length,tris:K.tris};}
 for(const nm of BIO.order){const I=BIO.items[nm],x={};for(const a in I.x)x[a]=I.x[a].length;it[nm]={count:I.count,m:I.m.length,c:I.c.length,n:I.n.length,c2:I.c2.length,x:x};}
 const t=BIO.stats[BIO.cur||'biome'];return{b,it,stat:t?{tris:t.tris,inst:t.inst,meshes:t.meshes}:null};}
function take(s0){const parts=[],items=[];
 for(const f in BIO.buckets){const K=BIO.buckets[f],o=s0.b[f]||{n:0,k:0,tris:0};if(K.pos.length<=o.n)continue;
  const n0=o.n,u0=n0/3*2;parts.push({fam:f,mat:K.mat,P:K.pos.a.slice(n0,K.pos.length),N:K.nor.a.slice(n0,K.nor.length),U:K.uv.a.slice(u0,K.uv.length),C:K.col.a.slice(n0,K.col.length)});
  K.pos.length=K.nor.length=K.col.length=n0;K.uv.length=u0;K.k.length=o.k;K.tris=o.tris;}
 for(const nm of BIO.order){const I=BIO.items[nm],o=s0.it[nm];if(!o||I.count<=o.count)continue;
  const x={};for(const a in I.x){x[a]=I.x[a].a.slice(o.x[a]||0,I.x[a].length);I.x[a].length=o.x[a]||0;}
  items.push({name:nm,count:I.count-o.count,m:I.m.a.slice(o.m,I.m.length),c:I.c.a.slice(o.c,I.c.length),n:I.n.length>o.n?I.n.a.slice(o.n,I.n.length):null,c2:I.c2.length>o.c2?I.c2.a.slice(o.c2,I.c2.length):null,x:x});
  I.m.length=o.m;I.c.length=o.c;I.n.length=o.n;I.c2.length=o.c2;I.k.length=o.count;I.count=o.count;}
 const k=BIO.cur||'biome';if(s0.stat)Object.assign(BIO.stats[k],s0.stat);else delete BIO.stats[k];   // the nursery is not charged; the placements are
 return{parts,items};}

// ---------------------------------------------------------------- the nursery
// The stage: flat ground at GROUND (a mangrove's: its foot in water), no mask, no obstacles, no rim. REGISTER is
// caught (a builder registers its tree; the placement registers each placed one instead).
function nursery(fn,gy){const h=BIO.host,keep={terrainH:h.terrainH,mask:h.mask,obstacles:h.obstacles},reg=[],R0=typeof REGISTER==='function'?REGISTER:null;
 h.terrainH=()=>gy;h.mask=()=>1;h.obstacles=[];if(R0)window.REGISTER=o=>reg.push(o);
 try{return Object.assign(fn()||{},{reg:reg});}finally{Object.assign(h,keep);if(R0)window.REGISTER=R0;}}
const PROTO=new Map();let SEQ=0;
function protoFor(sp,v,lv,wetV){const key=sp+'|'+v+'|'+lv;let P=PROTO.get(key);if(P)return P;
 const S=SP[sp],man=S.key==='mangrove',gy=man?MANGROVE_FOOT+.5:GROUND,s0=snap();let T=null,st=null;
 const r=nursery(()=>{reseed(55031+sp*977+v*131+lv*17);T=NWBAY.make(sp,0,gy,0,{wet:wetV});
  T.H=mix(S.H[0],S.H[1],(v+.5)/V)*rr(.97,1.03);T.nursery=true;
  if(S.key==='clifffig'){T.out=[1,0];T.edgeD=12;T.footY=-1e3;}       // a rim to lean over (+x); the curtains are per site
  if(S.key==='cinderpine')T.lee=[1,0];                                // the wind toward +x
  st=newSt();B[sp](T,st,lv);},gy);
 const cap=take(s0),defs=[];
 // the bark parts become instanced items: one per material, its vertices in the variant's own frame
 cap.parts.forEach(pt=>{const g=new T3.BufferGeometry();g.setAttribute('position',new T3.BufferAttribute(pt.P,3));g.setAttribute('normal',new T3.BufferAttribute(pt.N,3));
  g.setAttribute('uv',new T3.BufferAttribute(pt.U,2));g.setAttribute('color',new T3.BufferAttribute(pt.C,3));
  const name='v'+(SEQ++)+':'+S.key+':'+v+':'+lv+':'+pt.fam;BIO.def(name,g,pt.mat,{label:(BIO.buckets[pt.fam].label||pt.fam)+' ('+S.name+', variant)'});defs.push(name);});
 P={sp,v,lv,H:T.H,wet:wetV,y0:T.y0,spread:T.spread||T.crownR,crownR:T.crownR,rb:T.rb,defs,items:cap.items,reg:r.reg,hangs:T.hangs||null,st,man};
 PROTO.set(key,P);return P;}
NWBAY.PROTOS=PROTO;

// ---------------------------------------------------------------- placement
const _M=new T3.Matrix4(),_I=new T3.Matrix4(),_O=new T3.Matrix4(),_q=new T3.Quaternion(),_p=new T3.Vector3(),_s=new T3.Vector3(),_n=new T3.Vector3(),UP=new T3.Vector3(0,1,0);
function stamp(P,T,st){const S=SP[T.sp];
 // the turn: random by seed, or so the variant's +x faces the site's direction (a fig's rim, a pine's lee)
 const dir=S.key==='clifffig'&&T.out?T.out:S.key==='cinderpine'&&T.lee?T.lee:null,th=dir?Math.atan2(-dir[1],dir[0]):(h3(T.seed,T.sp,7)*TAU);
 const s=T.H/P.H,ty=P.man?0:T.y0-P.y0*s;
 _q.setFromAxisAngle(UP,th);_p.set(T.x,ty,T.z);_s.set(s,s,s);_M.compose(_p,_q,_s);
 // the bark: one instance per part
 P.defs.forEach(nm=>BIO.put(nm,[T.x,ty,T.z],_q,s,null));
 // the items: each captured instance through the tree's transform
 for(const it of P.items){const I=BIO.items[it.name],def=BIO.defs[it.name];
  for(let i=0;i<it.count;i++){_I.fromArray(it.m,i*16);_O.multiplyMatrices(_M,_I);const e=_O.elements;for(let q=0;q<16;q++)I.m.push(e[q]);
   I.c.push(it.c[i*3],it.c[i*3+1],it.c[i*3+2]);
   if(it.n){_n.set(it.n[i*3],it.n[i*3+1],it.n[i*3+2]).applyQuaternion(_q);I.n.push(_n.x,_n.y,_n.z);}
   if(it.c2)I.c2.push(it.c2[i*3],it.c2[i*3+1],it.c2[i*3+2]);
   for(const a in it.x){const X=it.x[a];I.x[a].push(X[i*4],X[i*4+1],X[i*4+2],X[i*4+3]);}
   I.k.push(BIO._lodKey(e[12],e[14]));I.count++;}
  BIO.tally(def.tris*it.count,it.count,0);}
 // the record the rest of the kit reads (the fauna, the probe, canopyH)
 T.variant=P.v;T.spread=P.spread*s;T.crownR=P.crownR*s;T.rb=P.rb*s;
 if(typeof REGISTER==='function')P.reg.forEach(o=>REGISTER(Object.assign({},o,{x:T.x,z:T.z,y:P.man?Math.max(T.y0+.5,0):T.y0,r:(o.r||0)*s,h:(o.h||0)*s})));
 // a cliff fig's curtains: from its own hang points, down its own rim to its own waterline
 if(P.hangs&&T.edgeD!=null){const hw=P.hangs.map(h=>{_p.set(h.x,h.y,h.z).applyMatrix4(_M);return{x:_p.x,y:_p.y,z:_p.z};});NWBAY._figCurtains(T,st,P.lv,hw);}
 for(const k in P.st)if(typeof P.st[k]==='number'&&k in st)st[k]+=P.st[k];}

// plant every placed tree: impostors as before, heroes as variants. Called by the pass (55) once TREES is final.
NWBAY.plantTrees=function(TREES,st){
 // each species' variants: wet at the quantiles of where the pass put it
 const wets=SP.map(()=>[]);TREES.forEach(T=>{if(T.lv>0)wets[T.sp].push(T.wet==null?.7:T.wet);});
 const wetV=wets.map(L=>{L.sort((a,b)=>a-b);const out=[];for(let v=0;v<V;v++)out.push(L.length?L[Math.min(L.length-1,Math.floor((v+.5)/V*L.length))]:.7);return out;});
 const order=[];TREES.forEach((T,i)=>{if(T.lv===0){NWBAY._buildFar(T,i,st);st.fars++;}else order.push(T);st.byS[T.sp]++;});
 order.forEach(T=>{const S=SP[T.sp];let best=0,bs=1e9;
  for(let v=0;v<V;v++){const H=mix(S.H[0],S.H[1],(v+.5)/V),sc=Math.abs(Math.log(T.H/H))*2.2+Math.abs((T.wet==null?.7:T.wet)-wetV[T.sp][v])+.45*h3(T.seed,v,31);if(sc<bs){bs=sc;best=v;}}
  const P=protoFor(T.sp,best,T.lv,wetV[T.sp][best]);
  // the height stays near the tree's own: within 15 % of the variant's, never past the species' band
  T.H=clamp(T.H,P.H*.85,Math.min(P.H*1.15,S.H[1]));stamp(P,T,st);st.heroes++;});
 st.protos=PROTO.size;};
})();
