// ================================================================= HOST — STATION 2's own life (PLAN-LANDS.md section 2: the savage hyperjungle; J2, 2026-11-08)
// After the kit's forest (88 calls stationBuild before the bake). Every place is a cell of a lattice, its plant made from
// KRAND.hash(world, i, j, salt): nothing the kit placed moves, and a cell's plant depends on no other. The builders are the kit's
// (src/56: HYPERJUNGLE.LANDS.savage); this file decides where.
//   H6          the 480 m old growth: the far impostors' reach (their quads' origins at the feet) to the tallest crown
//   cathedralfig  one a ~2 km^2 cell, on an old host's footprint (a hero of the plain jungle that died: the forest, off the bais)
//   combtree    the emergents through the old canopy, one a ~0.6 km^2 cell where the stand is highest
//   armourpalm  stands on the floor near the bais (trampled where a trail passes)
//   elephantear clumps along the trails and the brook, browsed and broken on the trails
//   bailawn     the bai sedge on every bai (the lawn itself is the ground's paint, 45)
//   skypitcher  in the boughs' gardens (the heroes' perches, 55), most near the Nightwing roosts
//   carrionarum on the darkest floor (under the widest crowns, far from a bai), one a ~5 km^2 cell
//   snareliana  young creepers round the heroes' feet, under the lianas (the near range's heroes)
//   fauna (H8)  kits/fauna's FAUNALANDS: the Riders' beasts wild at savage size (land 'hyperjungle.savage'), registered before drawn;
//               the grazing herds only in the bais. The big ones drawn, within 650 m of the camera (each animal is a dozen meshes)
// ?station=0 grows none of it.
function stationBuild(){
 if(new URLSearchParams(location.search).get('station')==='0')return null;
 const W=8117,L=HYPERJUNGLE.LANDS.savage,LD=HYPERJUNGLE.LOD,LT=LD.tree,out={n:{},plants:0,kin:[]},CEN=BIO.center(),nearC=(x,z,r)=>Math.hypot(x-CEN[0],z-CEN[1])<((r==null?1500:r));
 const cnt=k=>{out.n[k]=((out.n[k]==null?0:out.n[k]))+1;out.plants++;};
 const S=KSPACE.create({cell:60});(HYPERJUNGLE.TREES||[]).forEach(T=>{if(T.hero)S.insert(T,T.x,T.z,((T.rb==null?1:T.rb))*1.6+4);});
 const free=(x,z,r)=>!S.some(x,z,r,()=>true)&&BIO.clearOf(x,z,r);
 const cells=(cell,salt,fn,lim)=>{const N=Math.ceil((lim||TERR.R)/cell);for(let j=-N;j<=N;j++)for(let i=-N;i<=N;i++){const c=HYPERJUNGLE.LANDS.G.cellPt(W,i,j,cell,salt);
  if(Math.max(Math.abs(c[0]),Math.abs(c[1]))>TERR.R-60)continue;fn(c[0],c[1],c[2],c[3]);}};
 const grown=(B,T,lvNear,lvFar,x,z)=>{if(LT){BIO.range=LT;BIO.minRange=0;}try{B.grow(T,lvNear);if(LT){BIO.range=1e9;BIO.minRange=LT;B.grow(Object.assign({},T),lvFar);}}finally{BIO.range=null;BIO.minRange=0;}};
 const forest=(x,z)=>BIO.host.mask?BIO.host.mask(x,z):1;
 BIO.cur='jungle/station';
 try{L.def();}catch(e){reportErr('station defs: '+e.stack);return out;}
 // ---- H6: the far impostors' quads stand at the feet; their drawing reaches the tallest crown
 try{let top=0;(HYPERJUNGLE.TREES||[]).forEach(T=>{top=Math.max(top,T.H+40);});if(BIO.defs.impTrees)BIO.defs.impTrees.reach=Math.ceil(top);out.reach=Math.ceil(top);}
 catch(e){reportErr('station reach: '+e.stack);}
 // ---- THE CATHEDRAL FIGS: one a 1400 m cell, in the closed forest (off the bais, the trails and the brook), clear of the heroes
 try{cells(1400,0x5a10,(x,z,h,u)=>{if(u(3)>.75||forest(x,z)<.95||baiK(x,z)>0||trailD(x,z)<40||!free(x,z,46))return;
   const T=L.cathedralfig.make(x,terrainH(x,z),z,h);REGISTER({name:'Cathedral fig (a strangler round a rotted host)',key:'cathedralfig',kind:'tree',label:'Cathedral fig',x,z,y:T.y0,r:T.R0*1.6,h:T.H+T.crownR*.6});
   grown(L.cathedralfig,T,BIO.lodD(x,z)<1300?2:1,0,x,z);S.insert(T,x,z,T.R0*1.6+6);cnt('cathedralfig');
   if(!out.figAt||Math.hypot(x-CEN[0],z-CEN[1])<Math.hypot(out.figAt.x-CEN[0],out.figAt.z-CEN[1]))out.figAt={x,z,label:'A cathedral fig'};});}
 catch(e){reportErr('station figs: '+e.stack);}
 // ---- THE COMB TREES: emergents (a cousin of the ghostwood, 400-490 m), one a 780 m cell where the plain stand is highest
 try{const K=L.comb();if(K){out.kin.push(K.record);
  cells(780,0x5a20,(x,z,h,u)=>{if(u(3)>.6||forest(x,z)<.95||baiK(x,z)>0||!free(x,z,30))return;
   const T=L.combtree.make(x,terrainH(x,z),z,h);if(!T)return;REGISTER({name:'Comb tree (a cousin of the ghostwood; giant-bee combs)',key:'combtree',kind:'tree',label:'Comb tree',x,z,y:T.y0,r:((T.crownR==null?40:T.crownR))+4,h:T.H+6});
   grown(L.combtree,T,BIO.lodD(x,z)<1300?2:1,0,x,z);S.insert(T,x,z,((T.rb==null?14:T.rb))*1.6+6);cnt('combtree');out.combs=((out.combs==null?0:out.combs))+((T.combs==null?0:T.combs));out.combSegs=((out.combSegs==null?0:out.combSegs))+((T.segN==null?0:T.segN));
   if(!out.combAt&&nearC(x,z,1500))out.combAt={x,y:T.y0+T.H*.78,z,label:'Comb tree: the giant bees\' combs'};});}}
 catch(e){reportErr('station comb trees: '+e.stack);}
 // ---- THE ARMOUR PALMS: in stands near the bais, on the floor (the forest's edge round each lawn, out to 260 m)
 try{cells(34,0x5a30,(x,z,h,u)=>{let d=1e9;for(const B of BAIS)d=Math.min(d,Math.hypot(x-B.x,z-B.z)/B.r);if(d<1.05||d>1.05+260/180)return;
   const k=smooth(1.05+260/180,1.15,d)*(.4+.6*smooth(.2,.6,KN(x,z,.012,660,2)+.5));if(u(3)>k*.55||forest(x,z)<.5||!free(x,z,3))return;
   const T=L.armourpalm.make(x,terrainH(x,z),z,h);REGISTER({name:'Armour palm (black-spined)',key:'armourpalm',kind:'tree',label:'Armour palm',x,z,y:T.y0,r:6,h:T.H+4});
   grown(L.armourpalm,T,BIO.lodD(x,z)<700?2:1,0,x,z);S.insert(T,x,z,3);cnt('armourpalm');},2600);}
 catch(e){reportErr('station armour palms: '+e.stack);}
 // ---- THE ELEPHANT EARS: along the trails (broken and browsed) and the brook's banks (whole)
 try{cells(16,0x5a40,(x,z,h,u)=>{const td=trailD(x,z),bd=brookDist(x,z);const onT=td>0&&td<10,onB=bd>16&&bd<60;if(!onT&&!onB)return;
   if(u(3)>(onT?.32:.14)||baiK(x,z)>.2||!free(x,z,4))return;
   const T=L.elephantear.make(x,terrainH(x,z),z,h,onT&&u(4)<.7);REGISTER({name:'Elephant ear (giant taro)'+(T.broken?', browsed along a trail':''),key:'elephantear',kind:'plant',label:'Elephant ear',x,z,y:T.y0,r:T.L*.8,h:T.L*.8});
   BIO.range=LD.mid||null;try{L.elephantear.grow(T,BIO.lodD(x,z)<LD.floor?2:1);}finally{BIO.range=null;}cnt('elephantear');},2400);}
 catch(e){reportErr('station elephant ears: '+e.stack);}
 // ---- THE BAI SEDGE: a 2.5 m lattice inside each bai near the camera's ring, 6 m out to the mid range (the lawn's paint carries the rest)
 try{BAIS.forEach(B=>{const d0=Math.hypot(B.x-CEN[0],B.z-CEN[1]);if(d0-B.r>((LD.mid==null?1800:LD.mid)))return;
   const near=d0-B.r<((LD.floor==null?800:LD.floor)),cell=near?2.5:6,N=Math.ceil(B.r*1.3/cell);
   for(let j=-N;j<=N;j++)for(let i=-N;i<=N;i++){const h=KRAND.hash(W,i,j,0x5a50+B.i),u=k=>KRAND.unit(KRAND.hash(h,k,0,0x5a50));
    const x=B.x+(i+u(1))*cell,z=B.z+(j+u(2))*cell,k=baiK(x,z);if(k<.5||u(3)>k*.9||wallowK(x,z)>.1||lickK(x,z)>.2)continue;
    const T=L.bailawn.make(x,terrainH(x,z),z,h);BIO.range=Math.hypot(x-CEN[0],z-CEN[1])<((LD.floor==null?800:LD.floor))?LD.floor:LD.mid;try{L.bailawn.grow(T,2);}finally{BIO.range=null;}cnt('bailawn');}
   REGISTER({name:'A bai (a clearing the herds keep open: sedge lawn, wallows, salt licks)',key:'landform.bai',kind:'landform',x:B.x,z:B.z,y:terrainH(B.x,B.z),r:B.r,h:4});});
  WALLOWS.forEach(Wl=>REGISTER({name:Wl.dry?'A wallow (a mud pan dried and cracked)':'A wallow (wet mud)',key:'landform.wallow',kind:'landform',x:Wl.x,z:Wl.z,y:terrainH(Wl.x,Wl.z),r:Wl.r,h:1,ground:true}));
  {const pp=new THREE.Object3D();pp.name='wallow and lick probe points';pp.userData.probePoints=[].concat(...WALLOWS.map(Wl=>[Wl.x,terrainH(Wl.x,Wl.z)+.3,Wl.z]),...LICKS.map(Lk=>[Lk.x,terrainH(Lk.x,Lk.z)+.3,Lk.z]));scene.add(pp);}   /* the pans are painted on the ground mesh the probe skips: one point a wallow (core/host's probePoints) */
  LICKS.forEach(Lk=>REGISTER({name:'A salt lick (red clay chewed into the bank)',key:'landform.lick',kind:'landform',x:Lk.x,z:Lk.z,y:terrainH(Lk.x,Lk.z),r:Lk.r,h:3}));}
 catch(e){reportErr('station bai sedge: '+e.stack);}
 // ---- THE SKY PITCHERS: in the heroes' bough gardens (perches over 60 m), within the trees' near range
 try{(HYPERJUNGLE.TREES||[]).forEach((T,ti)=>{if(!T.hero||!T.perch||BIO.lodD(T.x,T.z)>((LT==null?1200:LT)))return;
   T.perch.forEach((P,pi)=>{const h=KRAND.hash(W,ti,pi,0x5a60);if(P.r<1.2||P.y<T.y0+60||KRAND.unit(h)>.22)return;
    const n=1+Math.floor(KRAND.unit(KRAND.hash(h,1))*3);for(let k=0;k<n;k++){const a=KRAND.unit(KRAND.hash(h,2,k))*TAU,o=P.r*.6;
     const Tp=L.skypitcher.make(P.x+Math.cos(a)*o,P.y-P.r*.6,P.z+Math.sin(a)*o,KRAND.hash(h,3,k));
     if(LT){BIO.owner=[T.x,T.z];BIO.range=LT;}try{L.skypitcher.grow(Tp);}finally{BIO.owner=null;BIO.range=null;}cnt('skypitcher');
     if(!out.pitcherAt&&nearC(T.x,T.z,900))out.pitcherAt={x:Tp.x,y:Tp.y0,z:Tp.z,label:'Sky pitchers in a bough garden'};}
    if(n)REGISTER({name:'Sky pitchers (a pitfall in a bough garden; harmless to people)',key:'skypitcher',kind:'plant',label:'Sky pitcher',x:P.x,z:P.z,y:P.y-3,r:P.r+1.5,h:4});});});}
 catch(e){reportErr('station sky pitchers: '+e.stack);}
 // ---- THE CARRION ARUMS: the darkest floor, far from a bai (a ~5 km^2 cell: rare)
 try{cells(900,0x5a70,(x,z,h,u)=>{if(u(3)>.42)return;let dB=1e9;for(const B of BAIS)dB=Math.min(dB,Math.hypot(x-B.x,z-B.z)-B.r);if(dB<200||forest(x,z)<.98||!free(x,z,6))return;
   const T=L.carrionarum.make(x,terrainH(x,z),z,h);REGISTER({name:'Carrion arum (a corpse flower; a pitfall that can hold a dog-sized animal)',key:'carrionarum',kind:'plant',label:'Carrion arum',x,z,y:T.y0,r:T.H*.4,h:T.H});
   BIO.range=LD.mid||null;try{L.carrionarum.grow(T);}finally{BIO.range=null;}cnt('carrionarum');if(!out.arumAt||Math.hypot(x-CEN[0],z-CEN[1])<Math.hypot(out.arumAt.x-CEN[0],out.arumAt.z-CEN[1]))out.arumAt={x,z,label:'A carrion arum on the dark floor'};});}
 catch(e){reportErr('station carrion arums: '+e.stack);}
 // ---- THE SNARE LIANAS (young): round the heroes' feet, out of the buttresses, near range only
 try{(HYPERJUNGLE.TREES||[]).forEach((T,ti)=>{if(!T.hero||BIO.lodD(T.x,T.z)>((LT==null?1200:LT)))return;const h=KRAND.hash(W,ti,0,0x5a80);if(KRAND.unit(h)>.7)return;
   const n=1+Math.floor(KRAND.unit(KRAND.hash(h,1))*3);for(let k=0;k<n;k++){const a=KRAND.unit(KRAND.hash(h,2,k))*TAU,d=((T.rb==null?14:T.rb))*1.9+4+8*KRAND.unit(KRAND.hash(h,3,k)),x=T.x+Math.cos(a)*d,z=T.z+Math.sin(a)*d;
    if(!BIO.clearOf(x,z,1.5)||forest(x,z)<.5)continue;const Tn=L.snareliana.make(x,terrainH(x,z),z,KRAND.hash(h,4,k));
    BIO.range=LD.floor||null;try{L.snareliana.grow(Tn);}finally{BIO.range=null;}cnt('snareliana');
    REGISTER({name:'Snare liana (young: sticky creeping leaves; a flypaper trap)',key:'snareliana',kind:'plant',label:'Snare liana',x,z,y:Tn.y0,r:Tn.R,h:.6});}});}
 catch(e){reportErr('station snare lianas: '+e.stack);}
 // the other plants on the page (the kit's floor and trees), for the traps' share: every instance of a flora item
 try{let n=0;for(const k in BIO.items){const d=BIO.defs[k];if(!d||/fauna|dart|flitter|sloth|strider|ray|butterfl/i.test(k))continue;n+=(BIO.items[k].count==null?0:BIO.items[k].count);}out.plants=Math.max(out.plants,n);}catch(e){}
 // ---- THE HERDS (H8; kits/fauna fauna-lands.js): the land's plan over the map, registered in core/tags, then drawn near the camera
 try{if(typeof FAUNALANDS!=='undefined'&&typeof KratorFauna!=='undefined'){
  const cat=FAUNALANDS.catalog(KratorFauna.list().map(e=>KratorFauna.entry(e.key)));
  const plan=FAUNALANDS.plan({world:W,land:'hyperjungle.savage',catalog:cat,box:[-TERR.R+200,-TERR.R+200,TERR.R-200,TERR.R-200],cell:400,ground:terrainH,
   where:(role,x,z,key)=>role==='grazer'?baiK(x,z)>.6&&wallowK(x,z)<.2:role==='water'?false:role==='predator'?(baiFringe(x,z)>.2||trailD(x,z)<6||baiK(x,z)>.3):true,
   height:(role,x,z,key,y,u)=>role==='flyer'?Math.max(y+40,HYPERJUNGLE.canopyH(x,z)+20+60*u):y});
  const T=BIO.tagReg();if(T)FAUNALANDS.register(T,plan,{});
  out.fauna={groups:plan.groups,animals:plan.animals,missing:plan.missing};
  /* drawn: the herds, the hunters and the big flyers (over 3 m), eight of a group at most; the small fliers and crawlers stay records (the kit's own darts and
     butterflies, 58, are the page's small life), so the draw calls stay a page's */
  const big=a=>a.role==='grazer'||a.role==='predator'||Math.max(a.size[0],a.size[1],a.size[2])>=3,seen={};
  const drawn=plan.animals.filter(a=>{if(!big(a))return false;seen[a.group]=((seen[a.group]==null?0:seen[a.group]))+1;return seen[a.group]<=8;});   /* at most eight of a group */
  const D=FAUNALANDS.draw(KratorFauna,scene,Object.assign({},plan,{animals:drawn}),{err:reportErr}),R2=650*650;out.faunaDrawn=D.list.length;
  D.list.forEach(it=>{it.g.userData.inspectLabel=it.a.name+' (wild, '+(it.a.scale).toFixed(2)+'x: the savage land)';});
  tick((dt,t)=>{const c=camera.position;for(const it of D.list){const dx=it.a.at[0]-c.x,dz=it.a.at[2]-c.z;it.g.visible=dx*dx+dz*dz<R2;}D.tick(t);});
  const g=plan.groups.find(g=>g.role==='grazer'&&nearC(g.at[0],g.at[2],1500))||plan.groups.find(g=>g.role==='grazer');
  if(g)out.herdAt={x:g.at[0],z:g.at[2],label:'A herd in the bai'};}}
 catch(e){reportErr('station fauna: '+e.stack);}
 BIO.cur=null;return out;}
