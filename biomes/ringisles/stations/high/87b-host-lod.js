// ================================================================= HOST — the forest's load (station 2, the high isle; before the build, 88; 2026-11-09)
// The high isle plants ~247,000 trees over a 7 km shield, and the kit's LOD levels (the stage's STATION.lod: hero within 230 m of the spine, mid to
// 620 m, far past it) left 41 M triangles in its trees (18 M is the type's budget) and 52 M in the scene (30 M): the borrowed Throne's far trees were
// its icosahedron blobs (11.6 M of them), and every mid tree was built whole however far from the places the views look at. This pass changes what a
// tree DRAWS, never what it draws from the stream (the kit's passes and every builder run as before, with the same random numbers, so no tree moves and
// the floor after them is the same):
//  1. THE FAR TREES AS OCTAHEDRAL IMPOSTORS (core/biome 34): a borrowed Throne tree at the far level is one camera-facing quad of its species (as the
//     Throne's own page draws its far trees) in place of its blobs; the Throne's far builder draws no random numbers, so nothing after it moves. The
//     other kits' far trees keep theirs (eastabyss' far builder draws from the stream; the rest are small).
//  2. THE OUTER MID BAND AS IMPOSTORS: a mid tree (any kit's, the kit's own species too) at STATION.lodTrees.mute metres or more from the spine is
//     built as before (its builder's draws kept) and its drawing then taken back (every kit's stores truncated to where they stood, the charges
//     restored), and its species' impostor is put in its place. Its registered volume stays (the inspector names it; the impostor's instance is in it).
//     The forest's dressing (60: lianas and epiphytes) on those trees is dropped with them (its draws kept).
//  3. FEWER HEROES OUT OF VIEW: a hero or mid tree farther than STATION.lodTrees.near (350 m) from every view's sight line, or farther than its far
//     (2 km) from the camera, is muted the same way (the spine's heroes round the valleys no view stands in; the views from the sea see the impostors).
// Each impostor species is baked once from the first tree of it the pass met (89zz's BIO.bakeImpostors, after every placement). ?lodmute=<m> sets the
// band's start (1e9: none); ?lodview=0 counts every tree in view; ?imp=0 (88) leaves every far tree its blobs and mutes nothing.
(function(){
 const Q=new URLSearchParams(location.search);if(Q.get('imp')==='0'||typeof BIO.impostor!=='function')return;
 const LT=STATION.lodTrees||(STATION.lodTrees={mute:400});const MUTE=Q.has('lodmute')?+Q.get('lodmute'):LT.mute;
 const TREES_T='ringisles/trees';
 // one impostor set for the page (every kit's species on one atlas, one item: one draw call), its item in this kit's registry (the pass puts it)
 const SET=BIO.impostorSet('ringisles.high',{label:'Far trees (the high isle)'});
 {const prev=BIO.kit('ringisles');BIO.impostorItem('impHigh',SET,{label:'Far trees'});const d=BIO.defs.impHigh;if(d){d.cap=600000;d.capWhy='the high isle\'s far and outer mid trees as impostors (ringisles station 2, 87b-host-lod.js)';}BIO.kit(prev);}
 const RECS={},LOG=[],KEYS=[];RINGISLES._lodLog={log:LOG,keys:KEYS,mute:MUTE};
 const keyIx=k=>{let i=KEYS.indexOf(k);if(i<0){i=KEYS.length;KEYS.push(k);}return i;};
 // a species' impostor, registered at its first tree; build() rebuilds that tree at the hero level in its own kit, its registration muted
 const recOf=(kit,key,T0,build)=>{let R=RECS[kit+'.'+key];if(R)return R;
  const at=[T0.x,T0.y0,T0.z],prev=BIO.kit(kit);
  try{const rec=BIO.impostor('high.'+kit+'.'+key,()=>{const reg=BIO.host.register;BIO.host.register=()=>{};try{build();}finally{BIO.host.register=reg;}},{set:SET,at,label:key+' (far)'});
   R=RECS[kit+'.'+key]=rec?{rec,H:(T0.H?T0.H:1)}:{rec:null};}finally{BIO.kit(prev);}
  return R;};
 const yawOf=(T,x,z)=>T&&T.seed!=null?(T.seed%628)/100:(((Math.floor(x*7.31)*73856093^Math.floor(z*3.17)*19349663)>>>0)%628)/100;
 const putImp=(R,x,y,z,H,T)=>{if(!R||!R.rec)return false;const prev=BIO.kit('ringisles');try{BIO.impostorPut('impHigh',R.rec,[x,y,z],yawOf(T,x,z),H/R.H,null);}finally{BIO.kit(prev);}return true;};
 // every kit's stores, their lengths, and back (a muted tree's drawing taken back)
 const F32=BIO.F32;
 function snap(){const S=[];for(const kn in BIO.kits){const R=BIO.kits[kn];
   for(const n of R.order){const it=R.items[n];if(!it)continue;const xs=[];for(const a in it.x)xs.push(it.x[a],it.x[a].length);
    S.push(0,it,it.count,it.m.length,it.c.length,it.n.length,it.c2.length,it.k.length,it.o.length,it.l?it.l.length:-1,xs,R.defs[n],R.defs[n].nPut);}
   for(const f in R.buckets){const K=R.buckets[f];S.push(1,K,K.pos.length,K.nor.length,K.uv.length,K.col.length,K.c2?K.c2.length:-1,K.k.length,K.tris);}}
  const st={};for(const k in BIO.stats)st[k]=[BIO.stats[k].tris,BIO.stats[k].inst,BIO.stats[k].meshes];return{S,st};}
 function back(P){const S=P.S;let i=0;
  while(i<S.length){if(S[i]===0){const it=S[i+1];it.count=S[i+2];it.m.length=S[i+3];it.c.length=S[i+4];it.n.length=S[i+5];it.c2.length=S[i+6];it.k.length=S[i+7];it.o.length=S[i+8];
    if(it.l&&S[i+9]>=0)it.l.length=S[i+9];else if(it.l&&S[i+9]<0)it.l.length=it.count;const xs=S[i+10];for(let j=0;j<xs.length;j+=2)xs[j].length=xs[j+1];S[i+11].nPut=S[i+12];i+=13;}
   else{const K=S[i+1];K.pos.length=S[i+2];K.nor.length=S[i+3];K.uv.length=S[i+4];K.col.length=S[i+5];if(K.c2&&S[i+6]>=0)K.c2.length=S[i+6];K.k.length=S[i+7];K.tris=S[i+8];i+=9;}}
  for(const k in BIO.stats){const v=P.st[k];if(v){BIO.stats[k].tris=v[0];BIO.stats[k].inst=v[1];BIO.stats[k].meshes=v[2];}else{BIO.stats[k].tris=0;BIO.stats[k].inst=0;BIO.stats[k].meshes=0;}}}
 const curTris=()=>BIO.stats[BIO.cur]?BIO.stats[BIO.cur].tris:0;
 const MUTED=[];RINGISLES._muted=MUTED;
 // run a tree's builder; log its cost; when it is muted, take its drawing back and put its impostor
 function run(key,lv,x,z,f,mute,imp){const d=BIO.lodD(x,z),t0=curTris(),P=mute?snap():null;let r;
  try{r=f();}finally{const t=curTris()-t0;LOG.push(keyIx(key),lv,Math.round(d),t,mute?1:0);if(P){back(P);MUTED.push(x,z);imp();}}
  return r;}
 // THE VIEWS' REACH: a tree within NEAR metres of a view's sight line (its camera to its target, on the map) and within FAR of its camera is in view;
 // a hero or mid tree out of every view's reach is muted too (the spine's heroes round valleys no view stands in). STATION.views are the stage's
 // (45), read with 99's helpers' formulas (the cameras only: no draw)
 let SIGHT=null;const NEAR=LT.near==null?350:LT.near,FAR=LT.far==null?2000:LT.far;
 const sights=()=>{if(SIGHT)return SIGHT;SIGHT=[];try{const gh=(x,z,dy)=>terrainH(x,z)+(dy||0),toward=(x,z,tx,tz,d,h,th)=>{const a=Math.atan2(tz-z,tx-x),cx=tx-Math.cos(a)*d,cz=tz-Math.sin(a)*d;
    const wH=(x,z)=>typeof waterH==='function'?waterH(x,z):-1e9;return[cx,Math.max(gh(cx,cz,h),wH(cx,cz)+h),cz,tx,Math.max(gh(tx,tz,th==null?1:th),wH(tx,tz)+.2),tz];};
   const V=STATION.views({gh,toward});for(const k in V){const v=V[k];if(v&&isFinite(v[0])&&isFinite(v[3]))SIGHT.push([v[0],v[2],v[3],v[5]]);}}catch(e){reportErr('87b views: '+e.message);SIGHT=[];}
  return SIGHT;};
 const inView=(x,z)=>{const S=sights();if(!S.length||Q.get('lodview')==='0')return true;
  for(const s of S){const dc=Math.hypot(x-s[0],z-s[1]);if(dc>FAR)continue;const ux=s[2]-s[0],uz=s[3]-s[1],L2=ux*ux+uz*uz||1,t=Math.max(0,Math.min(1,((x-s[0])*ux+(z-s[1])*uz)/L2));
   if(Math.hypot(x-s[0]-ux*t,z-s[1]-uz*t)<NEAR)return true;}return false;};
 // the band's start is from the spine, but a view's camera can stand past it (the great valley's): a mid tree within CAMN metres of a view's camera
// keeps its mesh, so no wall of impostors rises in front of a preset view
 const CAMN=LT.cam==null?600:LT.cam;const camD=(x,z)=>{let m=1e9;for(const s of sights())m=Math.min(m,Math.hypot(x-s[0],z-s[1]));return m;};
 const muteAt=(lv,x,z)=>BIO.cur===TREES_T&&lv>=1&&(lv===1&&BIO.lodD(x,z)>=MUTE&&camD(x,z)>=CAMN||!inView(x,z));
 // the kit's own species (55's B[sp](T, st, lv), called by the pass)
 const B=RINGISLES._B,SP=RINGISLES.SPECIES;
 B.forEach((f0,sp)=>{B[sp]=function(T,st,lv){const key=SP[T.sp].key,T0=Object.assign({},T);
   const R=()=>recOf('ringisles',key,T0,()=>{if(BIO.fn.reseed)BIO.fn.reseed((T0.seed?T0.seed:1)*7919+17);const o=BIO.owner;BIO.owner=[T0.x,T0.z];try{f0(Object.assign({},T0,{lv:2}),{trunk:0,far:0,clumps:0,blooms:0,fruit:0},2);}finally{BIO.owner=o;}});
   const m=muteAt(lv,T.x,T.z);return run(key,lv,T.x,T.z,()=>f0(T,st,lv),m,()=>putImp(R(),T.x,T.y0,T.z,T.H,T));};});
 // the borrowed trees with a make/grow (the Throne's, eastabyss', sedesert's, the Rift's, nwlowlands'): grow(T, lv)
 const done={};
 RINGISLES.BORROW.forEach(Bo=>{if(Bo.small||Bo.treeAt||done[Bo.kit])return;const api=RINGISLES.kitOf(Bo);if(!api||!api.grow)return;done[Bo.kit]=1;
  const g0=api.grow,kit=Bo.kit,SPK=api.SPECIES||[];
  api.grow=function(T,lv){if(BIO.cur!==TREES_T)return g0.apply(this,arguments);const S=SPK[T.sp],key=S?S.key:String(T.sp),T0=Object.assign({},T);
   const R=()=>recOf(kit,key,T0,()=>{if(BIO.fn.reseed)BIO.fn.reseed((T0.seed?T0.seed:1)*7919+17);g0(Object.assign({},T0,{lv:2}),2);});
   if(lv===0&&kit==='throne'){if(!S||!S.far)return null;T.lv=0;if(putImp(R(),T.x,T.y0,T.z,T.H,T)){LOG.push(keyIx(kit+':'+key),0,Math.round(BIO.lodD(T.x,T.z)),2,1);return{far:2};}return g0.apply(this,arguments);}
   const m=muteAt(lv,T.x,T.z);return run(kit+':'+key,lv,T.x,T.z,()=>g0(T,lv),m,()=>{T.lv=lv;putImp(R(),T.x,T.y0,T.z,T.H,T);});};});
 // the hyperjungle's small plants (the understorey palm and the screwpine: f(x, y, z, lv), no record of their own)
 RINGISLES.BORROW.forEach(Bo=>{if(!Bo.small)return;const api=RINGISLES.kitOf(Bo);if(!api||!api.small||typeof api.small[Bo.small]!=='function'||api.small[Bo.small]._high)return;
  const f0=api.small[Bo.small],kit=Bo.kit,key=Bo.small;
  const w=function(x,y,z,lv){if(BIO.cur!==TREES_T)return f0.apply(this,arguments);const T0={x,y0:y,z,H:1};
   const R=()=>recOf(kit,key,T0,()=>{if(BIO.fn.reseed)BIO.fn.reseed(((Math.floor(x*13.1)^Math.floor(z*7.7))>>>0)+17);f0(T0.x,T0.y0,T0.z,2);});
   const m=muteAt(lv,x,z);return run(kit+':'+key,lv,x,z,()=>f0(x,y,z,lv),m,()=>putImp(R(),x,y,z,1,null));};
  w._high=1;w._kit=f0._kit;api.small[Bo.small]=w;});
 // the dressing (60) hangs nothing on a muted tree: its lianas, epiphytes and moss past the band's start or out of every view's reach are not put (their draws are made as before)
 const D0=RINGISLES.buildDressing;
 if(D0)RINGISLES.buildDressing=function(){const P0=BIO.put,drop={liana:1,epiphyte:1,mossclump:1};let dropped=0;
  BIO.put=function(name,pos){if(drop[name]&&(BIO.lodD(pos[0],pos[2])>=MUTE&&camD(pos[0],pos[2])>=CAMN||!inView(pos[0],pos[2]))){dropped++;return;}return P0.apply(this,arguments);};
  try{const r=D0.apply(this,arguments);if(r)r.dropped=dropped;return r;}finally{BIO.put=P0;}};
})();
