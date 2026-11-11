// ================================================================= THE CUT — the warp, applied to a kit read in place
// [draw] The warp's transforms (41-cut-field.js, CUT.warp) laid on what another kit's builders put into the core's stores
// (PLAN.md section 3: "a transform on the instanced record at placement: no per-frame cost"). The read-in kit is not
// edited: CUT.warpKit wraps its tree and floor passes, and while the trees build it watches the core's per-tree key
// (BIO.owner, the foot every runtime-LOD kit sets before it builds a tree): each tree's span of instances and bucket
// triangles is taken about its foot through
//   the dense air's habit (CUT.airScale: half again in height below 0 m), the fixed size step (CUT.snap on the tree's
//   height against its species' mean), the stretch along the field's axis and the lean toward it (CUT.warp's m),
// and with the warp's bite a sphere of its crown's foliage is taken out (the instances inside it; the limbs stay, so the
// branches show through the hole). The floor pass's plants lean and stretch about their own feet (items whose shape stands
// up; mats, pads and carpets stay flat). Godot gets the same result from the same CUT.warp on the same records.
//   CUT.warpKit(api, {toBowl:(x,z)=>[bx,bz], ground:(x,z)=>y, trees:api.TREES, species:api.SPECIES})
//   o.adjust(T, {dx, dz, h, kx}): called after each tree is warped (its top's offset from the foot, its new height, its widening);
//                    o.adjust(T, null) for a tree the kit registered but drew nothing of
//   o.allow: a Set of the read-in species' keys the station keeps (the plan's list for its ring); the rest are taken back
//   o.allowAt(key, x, z): false takes a tree of a kept species back where the station does not want it (pair 10: the face keeps only the rowan inside
//                    the lip, PLAN.md section 12 exchange 5); its volume goes too (o.adjust(T, null))
//   o.stuck {key: {item, share, size, col, where(x, z)}}: (where: only the trees standing where it is true; the face: inside the lip) the stuck fruit (PLAN.md section 3; exchange 5, the rowan): a share of the species' fruit clusters (that
//                    item's instances in the tree's span, a cluster by its 2 m cell) set small and green and stay so; CUT.WARPED.stuck counts them
//   CUT.warpDenied(name): true for a read-in species' name the station does not keep (the host's REGISTER skips its volume)
//   CUT.WARPED  what it did: trees, instances moved, bites, instances bitten, floor instances leaned
(function(){
 const W=CUT.WARPED={trees:0,inst:0,tris:0,bites:0,bitten:0,floor:0,stepped:0};
 // the 4x4 (three.js column-major) of p -> f + L (p - f)
 const affine=(L,f)=>{const t=[f[0]-(L[0]*f[0]+L[1]*f[1]+L[2]*f[2]),f[1]-(L[3]*f[0]+L[4]*f[1]+L[5]*f[2]),f[2]-(L[6]*f[0]+L[7]*f[1]+L[8]*f[2])];
  return[L[0],L[3],L[6],0, L[1],L[4],L[7],0, L[2],L[5],L[8],0, t[0],t[1],t[2],1];};
 const mul4=(a,b,o)=>{for(let c=0;c<4;c++)for(let r=0;r<4;r++){let v=0;for(let k=0;k<4;k++)v+=a[k*4+r]*b[c*4+k];o[c*4+r]=v;}return o;};
 const mul3=(A,B)=>{const M=[];for(let i=0;i<3;i++)for(let j=0;j<3;j++){let v=0;for(let k=0;k<3;k++)v+=A[i*3+k]*B[k*3+j];M.push(v);}return M;};
 const invT=L=>{const a=L[0],b=L[1],c=L[2],d=L[3],e=L[4],f=L[5],g=L[6],h=L[7],i=L[8],A=e*i-f*h,B=-(d*i-f*g),C=d*h-e*g,det=a*A+b*B+c*C||1;
  /* the inverse transpose is the cofactor matrix over the determinant */
  return[A/det,B/det,C/det,-(b*i-c*h)/det,(a*i-c*g)/det,-(a*h-b*g)/det,(b*f-c*e)/det,-(a*f-c*d)/det,(a*e-b*d)/det];};
 const diag=(x,y,z)=>[x,0,0,0,y,0,0,0,z];
 const snapAll=()=>{const S={items:{},buckets:{}};for(const n in BIO.items)S.items[n]=BIO.items[n].count;for(const f in BIO.buckets)S.buckets[f]=BIO.buckets[f].pos.length;return S;};
 const tmp=new Array(16),out=new Array(16);
 function moveInst(it,i0,i1,A){const m=it.m.a;for(let i=i0;i<i1;i++){for(let q=0;q<16;q++)tmp[q]=m[i*16+q];mul4(A,tmp,out);for(let q=0;q<16;q++)m[i*16+q]=out[q];}W.inst+=i1-i0;}
 function moveTris(K,p0,L,N,f){const P=K.pos.a,Q=K.nor.a,n=K.pos.length;for(let j=p0;j<n;j+=3){const x=P[j]-f[0],y=P[j+1]-f[1],z=P[j+2]-f[2];
   P[j]=f[0]+L[0]*x+L[1]*y+L[2]*z;P[j+1]=f[1]+L[3]*x+L[4]*y+L[5]*z;P[j+2]=f[2]+L[6]*x+L[7]*y+L[8]*z;
   const a=Q[j],b=Q[j+1],c=Q[j+2],nx=N[0]*a+N[1]*b+N[2]*c,ny=N[3]*a+N[4]*b+N[5]*c,nz=N[6]*a+N[7]*b+N[8]*c,l=Math.hypot(nx,ny,nz)||1;Q[j]=nx/l;Q[j+1]=ny/l;Q[j+2]=nz/l;}
  W.tris+=(n-p0)/9;}
 // drop the instances [i0, count) whose position is inside the sphere c, r: the tail of every store compacted in place
 function biteInst(it,i0,c,r){const m=it.m.a,keep=[];for(let i=i0;i<it.count;i++){const dx=m[i*16+12]-c[0],dy=m[i*16+13]-c[1],dz=m[i*16+14]-c[2];if(dx*dx+dy*dy+dz*dz>=r*r)keep.push(i);}
  const gone=it.count-i0-keep.length;if(!gone)return 0;
  const stores=[[it.m,16],[it.c,3]];if(it.n.length)stores.push([it.n,3]);if(it.c2.length)stores.push([it.c2,3]);for(const a in it.x)stores.push([it.x[a],4]);
  for(const [S,w] of stores){if(S.length<it.count*w)continue;const A=S.a;keep.forEach((i,j)=>{const d=(i0+j)*w,s=i*w;if(d!==s)for(let q=0;q<w;q++)A[d+q]=A[s+q];});S.length=(i0+keep.length)*w;}
  keep.forEach((i,j)=>{it.k[i0+j]=it.k[i];});it.k.length=i0+keep.length;it.count=i0+keep.length;return gone;}
 const spanOf=new Map();
 // a tree the station does not want (o.allow, the plan's list for its ring): its whole span taken back off the stores
 function drop(sp){let tris=0,inst=0;for(const n in BIO.items){const it=BIO.items[n],i0=sp.S.items[n]||0;if(it.count<=i0)continue;inst+=it.count-i0;
   const stores=[[it.m,16],[it.c,3]];if(it.n.length)stores.push([it.n,3]);if(it.c2.length)stores.push([it.c2,3]);for(const a in it.x)stores.push([it.x[a],4]);
   for(const [S,w] of stores)if(S.length>=it.count*w)S.length=i0*w;tris+=(it.count-i0)*BIO.defs[n].tris;it.k.length=i0;it.count=i0;}
  for(const fm in BIO.buckets){const K=BIO.buckets[fm],p0=sp.S.buckets[fm]||0;if(K.pos.length<=p0)continue;const t=(K.pos.length-p0)/9;tris+=t;
   K.pos.length=p0;K.nor.length=p0;K.col.length=p0;K.uv.length=p0/9*6;K.k.length=p0/9;K.tris-=t;}
  BIO.tally(-tris,-inst,0);W.dropped=(W.dropped||0)+1;}
 function close(sp,o){const T=sp.T;if(!T){return;}const S=o.species[T.sp]||{};if(o.allow&&!o.allow.has(S.key)){drop(sp);return;}
  if(o.allowAt&&!o.allowAt(S.key,T.x,T.z)){drop(sp);if(o.adjust)o.adjust(T,null);W.droppedAt=(W.droppedAt||0)+1;return;}
  if(o.stuck&&o.stuck[S.key]&&(!o.stuck[S.key].where||o.stuck[S.key].where(T.x,T.z)))stuckFruit(sp,o.stuck[S.key],S.key);
  {let any=false;for(const n in BIO.items)if(BIO.items[n].count>(sp.S.items[n]||0)){any=true;break;}if(!any)for(const fm in BIO.buckets)if(BIO.buckets[fm].pos.length>(sp.S.buckets[fm]||0)){any=true;break;}
   if(!any){if(o.adjust)o.adjust(T,null);return;}}   /* the kit registered it but drew nothing (a far snag has no impostor): its volume goes */const f=[T.x,o.ground(T.x,T.z),T.z],b=o.toBowl(T.x,T.z);
  const mean=S.H?(S.H[0]+S.H[1])/2:T.H,Wp=CUT.warp(b[0],b[1],{id:T.seed,salt:31,size:T.H/mean}),air=CUT.airScale(o.alt(f[1])),k=Wp.step==null?1:Wp.step/(T.H/mean);
  if(k!==1)W.stepped++;
  const L=mul3(Wp.m,diag(air[0]*k,air[1]*k,air[0]*k)),N=invT(L),A=affine(L,f);
  for(const n in BIO.items){const it=BIO.items[n],i0=sp.S.items[n]||0;if(it.count>i0)moveInst(it,i0,it.count,A);}
  for(const fm in BIO.buckets){const K=BIO.buckets[fm],p0=sp.S.buckets[fm]||0;if(K.pos.length>p0)moveTris(K,p0,L,N,f);}
  if(Wp.bite&&T.crownR){const H=T.H*air[1]*k,cr=T.crownR*air[0]*k,c=[0,0,0];
   /* the bite's centre: the warped point at (u cr, v H, w cr) above the foot (in the tree's unwarped frame, then through L) */
   const lx=Wp.bite.u*T.crownR,ly=Wp.bite.v*T.H,lz=Wp.bite.w*T.crownR;c[0]=f[0]+L[0]*lx+L[1]*ly+L[2]*lz;c[1]=f[1]+L[3]*lx+L[4]*ly+L[5]*lz;c[2]=f[2]+L[6]*lx+L[7]*ly+L[8]*lz;
   const r=Wp.bite.k*Math.max(cr,H*.3);let gone=0;for(const n in BIO.items){const it=BIO.items[n],i0=sp.S.items[n]||0;if(it.count>i0)gone+=biteInst(it,i0,c,r);}
   if(gone){W.bites++;W.bitten+=gone;(CUT.BITES||(CUT.BITES=[])).push({x:c[0],y:c[1],z:c[2],r,tree:T.seed});}}
  if(o.adjust){const top=[L[1]*T.H,L[4]*T.H,L[7]*T.H];o.adjust(T,{dx:top[0],dz:top[2],h:top[1],kx:air[0]*k});}   /* the tree's registered volume follows it */
  W.trees++;}
 // THE STUCK FRUIT: a share of the clusters (by the 2 m cell an instance stands in, so a cluster sticks whole) shrunk about their own centres and
 // turned unripe green; KRAND by the cell, so the same clusters stick on every run
 function stuckFruit(sp,St,key){const it=BIO.items[St.item];if(!it)return;const i0=sp.S.items[St.item]||0;if(it.count<=i0)return;
  const m=it.m.a,c=it.c.a,share=St.share==null?CUT.STUCK:St.share,k=St.size==null?.55:St.size,col=St.col||[.42,.54,.23];
  for(let i=i0;i<it.count;i++){const x=m[i*16+12],y=m[i*16+13],z=m[i*16+14];
   if(KRAND.hash(CUT.SEED+61,Math.floor(x/2),Math.floor(z/2),Math.floor(y/2))/4294967296>=share)continue;
   for(const q of[0,1,2,4,5,6,8,9,10])m[i*16+q]*=k;if(it.c.length>=it.count*3){c[i*3]=col[0];c[i*3+1]=col[1];c[i*3+2]=col[2];}
   W.stuck=(W.stuck||0)+1;(W.stuckOf||(W.stuckOf={}))[key]=(W.stuckOf[key]||0)+1;}
  (W.fruitOf||(W.fruitOf={}))[key]=(W.fruitOf[key]||0)+(it.count-i0);}
 // the floor pass: every new instance of an upright item leans about its own foot (its matrix's translation)
 function floorLean(S0,o){for(const n in BIO.items){const it=BIO.items[n],i0=S0.items[n]||0;if(it.count<=i0)continue;const def=BIO.defs[n];
   if(def._upright==null){const g=def.geo;g.computeBoundingBox();const bb=g.boundingBox,h=bb.max.y-bb.min.y,w=Math.max(bb.max.x-bb.min.x,bb.max.z-bb.min.z);def._upright=h>w*.6;}
   if(!def._upright)continue;const m=it.m.a;
   for(let i=i0;i<it.count;i++){const f=[m[i*16+12],m[i*16+13],m[i*16+14]],b=o.toBowl(f[0],f[2]),Wp=CUT.warp(b[0],b[1],{id:i,salt:37,bites:false}),air=CUT.airScale(o.alt(f[1]));
    const L=mul3(Wp.m,diag(air[0],air[1],air[0])),A=affine(L,f);for(let q=0;q<16;q++)tmp[q]=m[i*16+q];mul4(A,tmp,out);for(let q=0;q<16;q++)m[i*16+q]=out[q];W.floor++;}}}
 CUT.warpKit=function(api,o){o=Object.assign({trees:api.TREES,species:api.SPECIES,alt:y=>y},o||{});
  if(o.allow){const deny=new Set(o.species.filter(S=>!o.allow.has(S.key)).map(S=>S.name)),prev=CUT.warpDenied;CUT.warpDenied=n=>deny.has(n)||(prev?prev(n):false);}
  const bt=api.buildTrees,bf=api.buildFloor;
  if(bt)api.buildTrees=function(){const desc=Object.getOwnPropertyDescriptor(BIO,'owner');let val=BIO.owner,sp=null,byXZ=null;
   const T=v=>{if(!byXZ){byXZ=new Map();for(const t of o.trees)byXZ.set(t.x+','+t.z,t);}return byXZ.get(v[0]+','+v[1])||null;};
   Object.defineProperty(BIO,'owner',{configurable:true,enumerable:true,get(){return val;},set(v){
    if(sp&&(!v||!sp.v||v[0]!==sp.v[0]||v[1]!==sp.v[1])){close(sp,o);sp=null;}   /* a new foot (or none): the last tree is complete */
    if(v&&!sp)sp={v:[v[0],v[1]],T:T(v),S:snapAll()};val=v;}});
   try{return bt.apply(this,arguments);}finally{if(sp)close(sp,o);delete BIO.owner;if(desc&&'value' in desc)BIO.owner=val;else BIO.owner=null;}};
  if(bf)api.buildFloor=function(){const S0=snapAll();const r=bf.apply(this,arguments);floorLean(S0,o);return r;};
  return api;};
})();
