// ================================================================= THE ANCIENT'S VALLEY — the feral wrap on a kit read in place, and the tint
// [draw] PLAN.md section 5: the two lowland kits' flora, scaled larger and made more feral by the `feral` field, the species each zone
// keeps, and the red-purple and blue-purple undertones as a shader layer. On the Cut's pattern (biomes/cut/src/46-biome-cut-warp.js):
// the read-in kit is not edited; AV.feralKit wraps its tree and floor passes and watches the core's per-tree key (BIO.owner), and each
// tree's span of instances and bucket triangles is scaled about its foot by 1 + feral x (0.3..1.0) (taller by a little more than wide:
// long-feral growth reaches). The floor pass's upright plants grow the same way about their own feet. A species the station does not
// keep (o.allow) is taken back off the stores. Godot gets the same result from the same fields on the same records.
//   AV.feralKit(api, {ground:(x,z)=>y, feral:(x,z)=>0..1, allow:Set|null, adjust, seed, trees:api.TREES, species:api.SPECIES})
//   AV.feralDenied(name): true for a read-in species' name the station does not keep (the host's REGISTER skips its volume)
//   AV.FERAL  what it did: trees, instances moved, triangles moved, floor instances grown, trees dropped
//   AV.tint(scene, {strength}): the taint's tint on every baked kit material (a KHOOK layer: green pixels turn toward purple by a field of
//     the world position; bark, ground and the towers are untouched). AV.TINTED the materials it reached
(function(){
 const W=AV.FERAL={trees:0,inst:0,tris:0,floor:0,dropped:0,grown:0};
 const affine=(L,f)=>{const t=[f[0]-(L[0]*f[0]+L[1]*f[1]+L[2]*f[2]),f[1]-(L[3]*f[0]+L[4]*f[1]+L[5]*f[2]),f[2]-(L[6]*f[0]+L[7]*f[1]+L[8]*f[2])];
  return[L[0],L[3],L[6],0, L[1],L[4],L[7],0, L[2],L[5],L[8],0, t[0],t[1],t[2],1];};
 const mul4=(a,b,o)=>{for(let c=0;c<4;c++)for(let r=0;r<4;r++){let v=0;for(let k=0;k<4;k++)v+=a[k*4+r]*b[c*4+k];o[c*4+r]=v;}return o;};
 const diag=(x,y,z)=>[x,0,0,0,y,0,0,0,z];
 const snapAll=()=>{const S={items:{},buckets:{}};for(const n in BIO.items)S.items[n]=BIO.items[n].count;for(const f in BIO.buckets)S.buckets[f]=BIO.buckets[f].pos.length;return S;};
 const tmp=new Array(16),out=new Array(16);
 function moveInst(it,i0,i1,A){const m=it.m.a;for(let i=i0;i<i1;i++){for(let q=0;q<16;q++)tmp[q]=m[i*16+q];mul4(A,tmp,out);for(let q=0;q<16;q++)m[i*16+q]=out[q];}W.inst+=i1-i0;}
 /* a pure scale about the foot: the normals keep their directions (anisotropy of 15% is left unrenormalised: it is under a degree) */
 function moveTris(K,p0,L,f){const P=K.pos.a,n=K.pos.length;for(let j=p0;j<n;j+=3){const x=P[j]-f[0],y=P[j+1]-f[1],z=P[j+2]-f[2];P[j]=f[0]+L[0]*x;P[j+1]=f[1]+L[4]*y;P[j+2]=f[2]+L[8]*z;}W.tris+=(n-p0)/9;}
 function drop(sp){let tris=0,inst=0;for(const n in BIO.items){const it=BIO.items[n],i0=sp.S.items[n]||0;if(it.count<=i0)continue;inst+=it.count-i0;
   const stores=[[it.m,16],[it.c,3]];if(it.n.length)stores.push([it.n,3]);if(it.c2.length)stores.push([it.c2,3]);for(const a in it.x)stores.push([it.x[a],4]);
   for(const [S,w] of stores)if(S.length>=it.count*w)S.length=i0*w;tris+=(it.count-i0)*BIO.defs[n].tris;it.k.length=i0;it.o.length=i0;it.count=i0;}
  for(const fm in BIO.buckets){const K=BIO.buckets[fm],p0=sp.S.buckets[fm]||0;if(K.pos.length<=p0)continue;const t=(K.pos.length-p0)/9;tris+=t;
   K.pos.length=p0;K.nor.length=p0;K.col.length=p0;K.uv.length=p0/9*6;K.k.length=p0/9;K.tris-=t;}
  BIO.tally(-tris,-inst,0);W.dropped++;}
 function close(sp,o){const T=sp.T;if(!T)return;const S=o.species[T.sp]||{};if(o.allow&&!o.allow.has(S.key)){drop(sp);return;}
  if(o.keep&&o.keep.has(S.key)){W.kept=(W.kept||0)+1;return;}   /* a species kept at its own size (the gum: its foliage clumps float when it is grown) */
  {let any=false,tris=false;for(const n in BIO.items)if(BIO.items[n].count>(sp.S.items[n]||0)){any=true;break;}for(const fm in BIO.buckets)if(BIO.buckets[fm].pos.length>(sp.S.buckets[fm]||0)){any=true;tris=true;break;}
   if(!any){if(o.adjust)o.adjust(T,null);return;}
   /* a tree whose span holds cards but no triangles draws its trunk later, outside the span (the cane palm): grown, its fronds would leave the trunk
      behind (the core attach audit); it keeps its size. W.kept counts them */
   if(!tris){W.kept=(W.kept||0)+1;return;}}
  const f=[T.x,o.ground(T.x,T.z),T.z],fe=o.feral(T.x,T.z),u=KRAND.unit(KRAND.hash(o.seed|0,T.seed|0,41)),k=1+fe*(.3+.7*u),ky=k*(1+.15*fe*u);
  if(k>1.02)W.grown++;
  const L=diag(k,ky,k),A=affine(L,f);
  for(const n in BIO.items){const it=BIO.items[n],i0=sp.S.items[n]||0;if(it.count>i0)moveInst(it,i0,it.count,A);}
  for(const fm in BIO.buckets){const K=BIO.buckets[fm],p0=sp.S.buckets[fm]||0;if(K.pos.length>p0)moveTris(K,p0,L,f);}
  if(o.adjust)o.adjust(T,{dx:0,dz:0,h:T.H*ky,kx:k});W.trees++;}
 function floorGrow(S0,o){for(const n in BIO.items){const it=BIO.items[n],i0=S0.items[n]||0;if(it.count<=i0)continue;const def=BIO.defs[n];
   if(def._upright==null){const g=def.geo;g.computeBoundingBox();const bb=g.boundingBox,h=bb.max.y-bb.min.y,w=Math.max(bb.max.x-bb.min.x,bb.max.z-bb.min.z);def._upright=h>w*.6;}
   /* not a bloom held on another plant's leaf (onLeaf) nor a free item (a raft, seed fluff): grown apart from what holds them, they would float */
   if(!def._upright||def.onLeaf||def.free)continue;const m=it.m.a;
   for(let i=i0;i<it.count;i++){const f=[m[i*16+12],m[i*16+13],m[i*16+14]],fe=o.feral(f[0],f[2]);if(fe<.05)continue;const k=1+fe*.6*KRAND.unit(KRAND.hash(o.seed|0,i,43));
    const A=affine(diag(k,k*1.1,k),f);for(let q=0;q<16;q++)tmp[q]=m[i*16+q];mul4(A,tmp,out);for(let q=0;q<16;q++)m[i*16+q]=out[q];W.floor++;}}}
 AV.feralKit=function(api,o){o=Object.assign({trees:api.TREES,species:api.SPECIES},o||{});
  if(o.allow){const deny=new Set(o.species.filter(S=>!o.allow.has(S.key)).map(S=>S.name)),prev=AV.feralDenied;AV.feralDenied=n=>deny.has(n)||(prev?prev(n):false);}
  const bt=api.buildTrees,bf=api.buildFloor;
  if(bt)api.buildTrees=function(){const desc=Object.getOwnPropertyDescriptor(BIO,'owner');let val=BIO.owner,sp=null,byXZ=null;
   const T=v=>{if(!byXZ){byXZ=new Map();for(const t of o.trees)byXZ.set(t.x+','+t.z,t);}return byXZ.get(v[0]+','+v[1])||null;};
   Object.defineProperty(BIO,'owner',{configurable:true,enumerable:true,get(){return val;},set(v){
    if(sp&&(!v||!sp.v||v[0]!==sp.v[0]||v[1]!==sp.v[1])){close(sp,o);sp=null;}
    if(v&&!sp)sp={v:[v[0],v[1]],T:T(v),S:snapAll()};val=v;}});
   try{return bt.apply(this,arguments);}finally{if(sp)close(sp,o);delete BIO.owner;if(desc&&'value' in desc)BIO.owner=val;else BIO.owner=null;}};
  /* the floor's plants grow only when asked (o.floor): a clump is several card instances about one centre, and each grown about its own base
     pulls away from the others (the core attach audit called 1.3% of them floating); the trees carry the feral look */
  if(bf&&o.floor)api.buildFloor=function(){const S0=snapAll();const r=bf.apply(this,arguments);floorGrow(S0,o);return r;};
  return api;};
 // ---------------------------------------------------------------- the tint
 const GLSL_HEAD='varying vec3 vAvWP;uniform float uAvTaint;\n'+
  'float avH(vec2 p){vec3 q=fract(vec3(p.xyx)*vec3(.1031,.1030,.0973));q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}\n'+
  'float avN(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(avH(i),avH(i+vec2(1.0,0.0)),f.x),mix(avH(i+vec2(0.0,1.0)),avH(i+vec2(1.0,1.0)),f.x),f.y);}\n'+
  'float avField(vec2 p){return clamp(0.25+0.9*(0.6*avN(p*0.0019+7.1)+0.4*avN(p*0.0071-2.3))-0.2,0.0,1.0);}\n';
 const GLSL_BODY='{float avT=uAvTaint*avField(vAvWP.xz);vec3 avC=diffuseColor.rgb;float avG=clamp((avC.g-max(avC.r,avC.b)*0.92)*7.0,0.0,1.0);\n'+
  ' vec3 avP=vec3(avC.r*1.3+0.05,avC.g*0.58,avC.b*1.5+0.1);vec3 avB=vec3(avC.r*0.85,avC.g*0.66,avC.b*1.7+0.08);vec3 avM=mix(avP,avB,avN(vAvWP.xz*0.009+3.3));\n'+
  ' diffuseColor.rgb=mix(avC,avM,avT*avG*0.8);}';
 AV.TINTED=[];
 AV.tint=function(scene,o){o=o||{};const seen=new Set(),U={uAvTaint:{value:o.strength==null?1:o.strength}};AV.tintU=U;
  scene.traverse(ob=>{if(!ob.isMesh||!ob.userData.biome)return;const ms=Array.isArray(ob.material)?ob.material:[ob.material];
   ms.forEach(m=>{if(!m||seen.has(m)||!(m.isMeshLambertMaterial||m.isMeshStandardMaterial||m.isMeshPhongMaterial))return;seen.add(m);
    KHOOK.add(m,'avtaint',{uniforms:U,
     vertex:{head:'varying vec3 vAvWP;\n',at:[{at:'worldpos_vertex',after:'{vec4 avP=vec4(transformed,1.0);\n#ifdef USE_INSTANCING\navP=instanceMatrix*avP;\n#endif\nvAvWP=(modelMatrix*avP).xyz;}'}]},
     /* a kit hook may have replaced the map chunk already (the fungoid caps, the culms): then after the alpha test, still before the light; a material with neither anchor is left as it is */
     fragment:{head:GLSL_HEAD,at:[{at:'map_fragment',after:GLSL_BODY,fallback:'alphatest_fragment',optional:true}]}},{key:'avtaint',order:5});AV.TINTED.push(m);});});
  return AV.TINTED.length;};
})();
