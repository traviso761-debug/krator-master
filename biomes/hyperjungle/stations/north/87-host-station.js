// ================================================================= HOST — STATION 3's own life (PLAN-LANDS.md section 3: Screamer wood, hyperjungle N's jungle; J3, 2026-11-08)
// After the kit's forest (88 calls stationBuild before the bake). Every place is a cell of a lattice, its plant made from
// KRAND.hash(world, i, j, salt): nothing the kit placed moves, and a cell's plant depends on no other. The builders are the kit's
// (src/57: HYPERJUNGLE.LANDS.north); this file decides where.
//   howlbamboo   groves along the valley floor (BIO.bamboo.groveCells on the stage's groveK, times the Cut's reach, H1); each grove's
//                cohort flowers together (the clock's year): green, flowering, dead or regrowing; a grove with bored culms registers a
//                core/tags sound record (H9, kind 'bamboo-howl': it howls in the dusk wind)
//   bonegiant    the kit's hypertrees dead standing where the rain fails: in the savannah gaps and the dry forest's edge
//   watcher      pale stands at the forest's edge (the mask between .2 and .7) and round the gaps
//   handflower   in the understorey's gaps, scattered through the wetter forest
//   bloodwood    the forest and savannah edge (savannarim reads the builder in place for the savannah's side)
//   skullpod     on the floor and round the gaps' rims
//   ghostpipe    the darkest floor, under the bamboo
//   devilsfingers the litter, in the damp hollows
//   blind grass  (savannarim's, read in place when the page carries it: the gaps' cane-grass; J4)
//   fauna (H8)   kits/fauna's FAUNALANDS, land 'hyperjungle.north': hunted thin, few flyers; the big ones drawn within 650 m
// ?station=0 grows none of it.
function stationBuild(){
 if(new URLSearchParams(location.search).get('station')==='0')return null;
 const W=8119,L=HYPERJUNGLE.LANDS.north,G=HYPERJUNGLE.LANDS.G,LD=HYPERJUNGLE.LOD,LT=LD.tree,out={n:{},plants:0,bones:[]},CEN=BIO.center();
 const cnt=(k,m)=>{out.n[k]=((out.n[k]==null?0:out.n[k]))+(m==null?1:m);};
 const dC=(x,z)=>Math.hypot(x-CEN[0],z-CEN[1]),closer=(k,x,z,label)=>{if(!out[k]||dC(x,z)<dC(out[k].x,out[k].z))out[k]={x,z,label};};
 const S=KSPACE.create({cell:60});(HYPERJUNGLE.TREES||[]).forEach(T=>{if(T.hero)S.insert(T,T.x,T.z,((T.rb==null?1:T.rb))*1.6+4);});
 const free=(x,z,r)=>!S.some(x,z,r,()=>true)&&BIO.clearOf(x,z,r);
 const cells=(cell,salt,fn,lim)=>{const N=Math.ceil((lim||TERR.R)/cell);for(let j=-N;j<=N;j++)for(let i=-N;i<=N;i++){const c=G.cellPt(W,i,j,cell,salt);
  if(Math.max(Math.abs(c[0]),Math.abs(c[1]))>TERR.R-60)continue;fn(c[0],c[1],c[2],c[3]);}};
 const grown=(B,T,lvNear,lvFar)=>{if(LT){BIO.range=LT;BIO.minRange=0;}let st;try{st=B.grow(T,lvNear);if(LT){BIO.range=1e9;BIO.minRange=LT;B.grow(Object.assign({},T),lvFar);}}finally{BIO.range=null;BIO.minRange=0;}return st;};
 const forest=(x,z)=>BIO.host.mask?BIO.host.mask(x,z):1;
 BIO.cur='jungle/station';
 try{L.def();}catch(e){reportErr('station defs: '+e.stack);return out;}
 // ---- THE HOWL BAMBOO: one candidate grove a 260 m cell along the valley; near groves full, the far ones on the far tier
 try{const REACH={from:'cut',km:150};out.reach={w:BIO.reachW?BIO.reachW(REACH,CEN[0],CEN[1]):0,far:BIO.reachW?BIO.reachW(REACH,CUT_MOUTH[0]+160000,CUT_MOUTH[1]):0};
  const year=(typeof KHOST!=='undefined'&&KHOST.host&&KHOST.host.clock&&KHOST.host.clock.day!=null)?Math.floor(KHOST.host.clock.day/365):0,B=BIO.bamboo,b=out.bamboo={groves:0,culms:0,holed:0,sprays:0,states:{}};
  if(B){const C=B.groveCells({world:W,cell:260,R:TERR.R-120,salt:0x4c1,keep:.9,weight:(x,z)=>groveK(x,z)*(BIO.reachW?BIO.reachW(REACH,x,z):1)});
   C.forEach(c=>{const d=BIO.lodD(c.x,c.z),lv=d<B.LOD.near+150?2:d<B.LOD.mid?1:0,y=terrainH(c.x,c.z);
    const g=L.grove({seed:c.seed,at:[c.x,y,c.z],ground:terrainH,lv,year,cohort:(c.i+c.j)&1,clear:(x,z,r)=>brookDist(x,z)>14+r&&!S.some(x,z,r+3,()=>true),weight:groveK});
    if(!g||!g.culms)return;b.groves++;b.culms+=g.culms;b.holed+=g.holed;b.sprays+=g.sprays;b.states[g.state]=((b.states[g.state]==null?0:b.states[g.state]))+1;cnt('howlbamboo',g.culms);
    REGISTER({name:'A howl bamboo grove ('+g.culms+' culms, '+g.holed+' bored through; '+g.state+')',key:'howlbamboo',kind:'bamboo',label:'Howl bamboo',x:c.x,z:c.z,y,r:g.grove.r,h:70});
    /* H9: a grove with bored culms howls in the dusk wind (core/tags' sound record, a bamboo-howl cavity; Godot's audio reads it) */
    if(g.holed&&typeof KTAGS!=='undefined'&&KTAGS.sound){const TR=BIO.tagReg();if(TR){try{TR.add({'class':'feature',kind:'sound',key:'howlbamboo.howl',name:'The grove howls in the wind (bored culms)',at:[c.x,y+30,c.z],r:g.grove.r,
     tags:{sound:KTAGS.sound({kind:'bamboo-howl',seed:c.seed>>>0,gain:Math.min(1,.3+g.holed/120)})}});b.sounds=(b.sounds==null?0:b.sounds)+1;}catch(e){reportErr('station sound: '+e.message);}}}
    g.grove.culms.forEach(cm=>S.insert(cm,cm.x,cm.z,1));if(lv===2)closer('groveAt',c.x,c.z,'Howl bamboo (a grove; the culms bored through)');});}}
 catch(e){reportErr('station howl bamboo: '+e.stack);}
 // ---- THE BONE GIANTS: one a 320 m cell, kept by the dryness (none in the wet west), most in the gaps
 try{cells(320,0x5b10,(x,z,h,u)=>{const dk=dryK(x,z),gk=gapK(x,z);if(dk<.3||u(3)>(.15+.55*gk)*smooth(.3,.8,dk)||brookDist(x,z)<40||!free(x,z,22))return;
   const T=L.bonegiant.make(x,terrainH(x,z),z,h);REGISTER({name:'A bone giant (a '+HYPERJUNGLE.SPECIES[T.sp].name.toLowerCase()+' dead standing, hung with widow\'s hair)',key:'bonegiant',kind:'tree',label:'Bone giant',x,z,y:T.y0,r:T.rb*2.4+4,h:T.H});
   const st=grown(L.bonegiant,T,BIO.lodD(x,z)<1400?2:1,0);S.insert(T,x,z,T.rb*2+6);cnt('bonegiant');cnt('widowhair',(st&&st.hair!=null?st.hair:0));out.bones.push({x,z});
   if(BIO.lodD(x,z)<1500&&gk>.5)closer('boneAt',x,z,'Bone giants on the savannah');});}
 catch(e){reportErr('station bone giants: '+e.stack);}
 // ---- THE WATCHERS: pale stands at the forest's edge (a 40 m cell where the mask is between .15 and .75, and round the gaps)
 try{cells(40,0x5b20,(x,z,h,u)=>{const m=forest(x,z),gk=gapK(x,z),edge=smooth(.1,.3,m)*smooth(.8,.55,m)+smooth(.05,.3,gk)*smooth(.95,.6,gk);
   if(u(3)>.06*edge*(.5+smooth(-.05,.15,KN(x,z,.004,720,2)))||groveK(x,z)>.3||!free(x,z,5))return;
   const T=L.watcher.make(x,terrainH(x,z),z,h);REGISTER({name:'A watcher (pale bark, dark eye scars)',key:'watcher',kind:'tree',label:'Watcher',x,z,y:T.y0,r:T.crownR+2,h:T.H+2});
   grown(L.watcher,T,BIO.lodD(x,z)<900?2:1,0);S.insert(T,x,z,T.rb*2+2);cnt('watcher');if(BIO.lodD(x,z)<1000)closer('watcherAt',x,z,'Watchers at the forest\'s edge');},3300);}
 catch(e){reportErr('station watchers: '+e.stack);}
 // ---- THE HAND-FLOWER TREES: understorey gaps in the wetter forest
 try{cells(110,0x5b30,(x,z,h,u)=>{if(forest(x,z)<.35||dryK(x,z)>.75||u(3)>.12||!free(x,z,9))return;
   const T=L.handflower.make(x,terrainH(x,z),z,h);REGISTER({name:'A hand-flower tree (red hands held palm up)',key:'handflower',kind:'tree',label:'Hand-flower tree',x,z,y:T.y0,r:T.crownR+2,h:T.H+2});
   grown(L.handflower,T,BIO.lodD(x,z)<800?2:1,0);S.insert(T,x,z,T.rb*2+3);cnt('handflower');if(BIO.lodD(x,z)<900)closer('handAt',x,z,'A hand-flower tree');},3300);}
 catch(e){reportErr('station hand-flowers: '+e.stack);}
 // ---- THE BLOODWOODS: the forest and savannah edge (the gaps' rims, the dry forest)
 try{cells(90,0x5b40,(x,z,h,u)=>{const gk=gapK(x,z),rim=smooth(.02,.25,gk)*smooth(.9,.5,gk)+.25*smooth(.5,.9,dryK(x,z))*(1-gk);if(u(3)>.3*rim||!free(x,z,8))return;
   const T=L.bloodwood.make(x,terrainH(x,z),z,h);REGISTER({name:'A bloodwood (red sap: dye and body paint)',key:'bloodwood',kind:'tree',label:'Bloodwood',x,z,y:T.y0,r:T.crownR+2,h:T.H+2});
   grown(L.bloodwood,T,BIO.lodD(x,z)<800?2:1,0);S.insert(T,x,z,T.rb*2+3);cnt('bloodwood');if(BIO.lodD(x,z)<900)closer('bloodAt',x,z,'A bloodwood');},3300);}
 catch(e){reportErr('station bloodwoods: '+e.stack);}
 // ---- THE FLOOR: skull-pods (the floor and the gaps' rims), ghost pipes (the darkest floor, under the bamboo), devil's fingers (the
 // damp litter); near and mid ranges only
 try{const R1=((LD.mid==null?1800:LD.mid))+50;
  cells(18,0x5b50,(x,z,h,u)=>{if(dC(x,z)>R1)return;const gk=gapK(x,z),m=forest(x,z),k=.02*smooth(.2,.6,m)+.09*smooth(.02,.2,gk)*smooth(.9,.5,gk);if(u(3)>k||!BIO.clearOf(x,z,2))return;
   const T=L.skullpod.make(x,terrainH(x,z),z,h);BIO.range=dC(x,z)<((LD.floor==null?800:LD.floor))?LD.floor:LD.mid;let st;try{st=L.skullpod.grow(T,dC(x,z)<((LD.floor==null?800:LD.floor))?2:1);}finally{BIO.range=null;}
   cnt('skullpod');REGISTER({name:'A skull-pod (its seed pods dry into small skulls)',key:'skullpod',kind:'plant',label:'Skull-pod',x,z,y:T.y0,r:T.H*.5,h:T.H});},R1);
  cells(14,0x5b60,(x,z,h,u)=>{if(dC(x,z)>((LD.floor==null?800:LD.floor))+60)return;const g=groveK(x,z);if(u(3)>.08*smooth(.3,.8,g)||!BIO.clearOf(x,z,1))return;
   const T=L.ghostpipe.make(x,terrainH(x,z),z,h);BIO.range=LD.floor||null;try{L.ghostpipe.grow(T);}finally{BIO.range=null;}cnt('ghostpipe');closer('pipeAt',x,z,'Ghost pipes under the bamboo');
   REGISTER({name:'Ghost pipes (waxy white, no green; they blacken at a touch)',key:'ghostpipe',kind:'plant',label:'Ghost pipe',x,z,y:T.y0,r:1,h:2});},((LD.floor==null?800:LD.floor))+60);
  cells(16,0x5b70,(x,z,h,u)=>{if(dC(x,z)>((LD.floor==null?800:LD.floor))+60)return;const m=forest(x,z),damp=smooth(.0,.25,KN(x,z,.006,730,2));if(u(3)>.03*m*damp||!BIO.clearOf(x,z,1))return;
   const T=L.devilsfingers.make(x,terrainH(x,z),z,h);BIO.range=LD.floor||null;try{L.devilsfingers.grow(T);}finally{BIO.range=null;}cnt('devilsfingers');
   REGISTER({name:'Devil\'s fingers (a stinkhorn: red fingers out of a pale egg)',key:'devilsfingers',kind:'fungus',label:'Devil\'s fingers',x,z,y:T.y0,r:1.4,h:1.2});},((LD.floor==null?800:LD.floor))+60);}
 catch(e){reportErr('station floor: '+e.stack);}
 // ---- THE BLIND GRASS (savannarim's, read in place: J4) in the gaps; none when the page does not carry the savannah kit
 try{if(typeof SAVRIM!=='undefined'&&SAVRIM.blindGrass){const r=SAVRIM.blindGrass({world:W,R:TERR.R-80,center:CEN,lod:LD,ground:terrainH,weight:(x,z)=>gapK(x,z)*(1-groveK(x,z)),clear:(x,z)=>brookDist(x,z)>20&&!S.some(x,z,2,()=>true)});cnt('blindgrass',r.n);}}
 catch(e){reportErr('station blind grass: '+e.stack);}
 // ---- THE FAUNA (H8): the north's land, hunted thin
 try{if(typeof FAUNALANDS!=='undefined'&&typeof KratorFauna!=='undefined'){
  const cat=FAUNALANDS.catalog(KratorFauna.list().map(e=>KratorFauna.entry(e.key)));
  const D0=(FAUNALANDS.LANDS['hyperjungle.north']||{}).density||{},thin={grazer:(D0.grazer==null?.25:D0.grazer)*.5,predator:(D0.predator==null?.08:D0.predator)*.5,flyer:(D0.flyer==null?.05:D0.flyer)*.5};   /* hunted thin: half the land's own */
  const plan=FAUNALANDS.plan({world:W,land:'hyperjungle.north',catalog:cat,box:[-TERR.R+200,-TERR.R+200,TERR.R-200,TERR.R-200],cell:400,ground:terrainH,density:thin,
   where:(role,x,z)=>role==='water'?false:true,height:(role,x,z,key,y,u)=>role==='flyer'?Math.max(y+30,HYPERJUNGLE.canopyH(x,z)+15+40*u):y});
  const T=BIO.tagReg();if(T)FAUNALANDS.register(T,plan,{});out.fauna={groups:plan.groups,animals:plan.animals,missing:plan.missing,thin:true};
  const big=a=>a.role==='grazer'||a.role==='predator'||Math.max(a.size[0],a.size[1],a.size[2])>=3,seen={};
  const drawn=plan.animals.filter(a=>{if(!big(a))return false;seen[a.group]=((seen[a.group]==null?0:seen[a.group]))+1;return seen[a.group]<=6;});
  const D=FAUNALANDS.draw(KratorFauna,scene,Object.assign({},plan,{animals:drawn}),{err:reportErr}),R2=650*650;out.faunaDrawn=D.list.length;
  tick((dt,t)=>{const c=camera.position;for(const it of D.list){const dx=it.a.at[0]-c.x,dz=it.a.at[2]-c.z;it.g.visible=dx*dx+dz*dz<R2;}D.tick(t);});}}
 catch(e){reportErr('station fauna: '+e.stack);}
 BIO.cur=null;return out;}
