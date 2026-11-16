// TARGET: city — every lot building's interior, on demand (the owner, 2026-11-15: "work on wiring in kit interiors to all
// buildings"). Each lot's building listed its storey stacks while 90r drew it (QB_SHELLREC, kits/qiblai 89q5s); its shell is
// the biggest that stands on the ground (qnShellOf), its programme its tags' (qnIxProgram: a dwelling, a shop, a workshop, a
// tavern, a temple, a civic hall). Lots that share a key and a shell share a TYPE: planned, drawn and furnished once in the
// building's own frame (qnIxType: kits/interiors' planBuilding and furnishRoom, the kit's textured items), the first time the
// camera comes within QC_LIX_NEAR of a lot of that type; every such lot nearby then takes a clone of it at its pose, its
// pieces registered in core/tags at their place, and hides it again beyond QC_LIX_FAR. One new type and a few clones a frame,
// so the walk never stalls on more than one plan. The four great rooms (90t) are their buildings' own; the ground storey only.
// window._qiblaiLix reports; buildTypes(n) builds the n commonest types (the verify's check).
// Walk in (the owner, 2026-11-16: "unlock the front doors so I can walk in"): the page loads core/walk (KWALK, kit.json), which
// the host's walker (F) stands on and is stopped by. A lot's street door is the one its builder drew (core/door's record, by
// its id: key@x,z.n; qnIxDoorOf), so the plan's street door lies under it and the type is keyed by it too. When a lot takes its
// clone, the door is unlocked (E opens it) and the plan's floors, walls, stairs and entry flight go into KWALK at the lot's
// pose (qnIxWalk); every door's doorway blocks are in KWALK from the start (KDOOR.walk), shut until opened.
// The monks' quarters (the owner, 2026-11-16: "fancy interiors to ... monasteries"): each great monastery's cell ranges (its
// storey stacks 5.5-7.5 m deep, 14 m long or more) are lots of their own here, on the monks' programme (QB_IX_MONKS: a chapel
// by the court door, kitchen, dormitories, a store; dormitories and a reading room above), entered by the door each range has
// to the court (kits/qiblai 89q3). The assembly and gate halls are 90t's.
const QC_LIX_NEAR=34,QC_LIX_FAR=80;
const QC_BULBS=[];   /* every room bulb placed so far, world [x, y, z]: the light pool (90v), the krator-lamps export (91z) */
const QC_LIX=(function(){const S={lots:[],types:{},nTypes:0,built:0,clones:0,noShell:0,noProgram:0,open:0,fails:[],ms:0,byProgram:{},tex:{meshes:0,mapped:0}};
 const report=()=>{window._qiblaiLix={lots:S.lots.length,types:S.nTypes,built:S.built,clones:S.clones,noShell:S.noShell,noProgram:S.noProgram,open:S.open,
  byProgram:S.byProgram,fails:S.fails.slice(0,8),ms:S.ms,tex:S.tex,doors:S.doors,walked:S.walked,ranges:S.ranges,buildTypes:S.buildTypes,walkIn:S.walkIn};};
 if(typeof qnShellOf!=='function'){report();return S;}
 const hosts=new Set(((typeof QC_IX!=='undefined'&&QC_IX.rooms)||[]).map(R=>R.host).filter(Boolean));   /* a lot that holds one of 90t's great rooms keeps that room */
 const byId=new Map();for(const D of KDOOR.list){const m=/^(.*)\.\d+(#\d+)?$/.exec(D.id);if(m)(byId.get(m[1])||byId.set(m[1],[]).get(m[1])).push(D);}   /* a builder's doors by their placement: key@x,z */
 S.doors=0;S.walked=0;S.walk=typeof KWALK!=='undefined'?KWALK:null;
 const addLot=(p,id,sh,prog)=>{const pose={x:p.x,z:p.z,y:qcD(p.o.y,0),ry:p.ry},dr=qnIxDoorOf(sh,pose,byId.get(p.key+'@'+Math.round(p.x)+','+Math.round(p.z)))||(QB_IX_ARCH[p.key]?Object.assign({D:null},QB_IX_ARCH[p.key]):null);if(dr)S.doors++;   /* an archway house: its arch's place (QB_IX_ARCH) */
  const tk=p.key+'|'+sh.sig+'|'+(dr?dr.n.join(',')+','+dr.t+','+dr.w+','+dr.h:'-'),c=loc(p.x,p.z,sh.x,sh.z,p.ry);
  if(!S.types[tk]){S.types[tk]={tk,key:p.key,sh,prog:prog||null,door:dr?{n:dr.n,t:dr.t,w:dr.w,h:dr.h,noPortal:!!dr.noPortal}:null,n:0,T:null,tried:false};S.nTypes++;}S.types[tk].n++;
  S.lots.push({p,id,tk,G:null,x:c[0],z:c[1],pose,D:dr?dr.D:null});};
 /* the gate markets' ranges (their shops) and the caravanserai's (its rooms) likewise (the owner, 2026-11-16: "finish all interiors") */
 const RPROG={monastery:QB_IX_MONKS,market:QB_IX_MARKET,caravanserai:QB_IX_INN};
 S.ranges=0;for(const p of QC_ALL){if(!RPROG[p.kind]||!p.stacks)continue;let i=0;
  for(const s of p.stacks){const dd=Math.min(s.w,s.d);if(dd<5.5||dd>7.5||Math.max(s.w,s.d)<14||s.hs[0]>4.4)continue;const L=Math.max(s.w,s.d);
   /* a gate market's front and back ranges have its passage through their middle: two shells, one each side of it */
   const parts=p.kind==='market'&&Math.abs(s.x)<.5&&L>30?[-1,1].map(e=>{const c=loc(s.x,s.z,e*(L/4+1.15),0,s.ry);return Object.assign({},s,{x:c[0],z:c[1],w:L/2-2.3});}):[s];
   for(const q of parts){const sh=qnShellOf([q]);if(sh){addLot(p,p.id+'.range'+(i++),sh,p.kind==='monastery'&&QSPOKE[p.o.v%8].hospital?QB_IX_HOSPITAL:RPROG[p.kind]);S.ranges++;}}}   /* the White Lily's ranges: its hospital's wards */
  p.stacks=null;}
 for(const p of QC_PLACE){if(p.kind!=='lot')continue;if(QB_IX_OPEN[p.key]||hosts.has(p)){p.stacks=null;S.open++;continue;}const sh=qnShellOf(p.stacks);p.stacks=null;
  if(!sh){S.noShell++;continue;}if(!qnIxProgram(p.key)){S.noProgram++;continue;}
  addLot(p,p.id,sh,null);}
 if(S.walk){KDOOR.walk(S.walk);for(const im of IZDOOR.meshes(KIT.meshes||{}))if(!im.material.transparent)im.renderOrder=-2;}   /* a leaf drawn before the doorway's portal (qnIxType), so a shut one stays in front of it */
 // a type built once (its template is not in the scene: lots take clones of it)
 S.buildType=function(ty){if(ty.tried)return ty.T;ty.tried=true;const t0=performance.now();
  /* a plan whose rooms miss a required piece (the street door where the builder drew it can leave a bedroom too tight for its
     chest) is planned again on the next seed, up to three times; the one with the fewest misses is kept */
  try{let T=null;for(let k=0;k<3;k++){const U=qnIxType(ty.sh,ty.key,qcHash(ty.tk)+k*7919,ty.door,ty.prog);if(!U||!U.G){if(!T)T=U;break;}
    if(!T||!T.G||U.F.fails.length<T.F.fails.length)T=U;if(!T.F.fails.length)break;}
   if(T&&T.G){ty.T=T;S.built++;S.byProgram[T.program]=qcD(S.byProgram[T.program],0)+1;
    if(T.F){S.fails=S.fails.concat(T.F.fails.map(f=>ty.key+': '+f));if(T.F.tex){S.tex.meshes+=T.F.tex.meshes;S.tex.mapped+=T.F.tex.mapped;}}}
   else if(T&&T.error)S.fails.push(ty.key+': '+T.error);}
  catch(e){S.fails.push(ty.key+': '+(e&&e.message||e));}
  S.ms+=Math.round(performance.now()-t0);report();return ty.T;};
 // a lot's clone of its type, at its pose; its pieces registered where they stand
 const T0=()=>KTAGS.page||(KTAGS.page=KTAGS.create({build:'xanadu'}));
 S.place=function(L){const ty=S.types[L.tk],T=ty&&ty.T;if(!T)return;const p=L.p,y=qcD(p.o.y,0),g=T.G.clone();
  g.name='interior:'+L.id;g.position.set(p.x,y,p.z);g.rotation.y=p.ry;scene.add(g);L.G=g;S.clones++;
  for(const b of T.bulbs||[]){const w=loc(p.x,p.z,b[0],b[2],p.ry);QC_BULBS.push([w[0],y+b[1],w[1]]);}
  if(S.walk){const D=L.D,on=D?D.blocks.map(b=>!b.off):[];if(D)S.walk.setBlock(D.blocks,false);   /* the flight's climb test walks through the doorway */
   const a=D?[D.at[0]+Math.sin(D.yaw)*1.2,D.at[2]+Math.cos(D.yaw)*1.2]:[p.x,p.z];
   const ga=S.walk.floorBelow(a[0],a[1],L.pose.y+T.plan.levels[0].y,.1);   /* outside: a monastery's court floor, else the ground */
   try{if(qnIxWalk(T,L.pose,S.walk,Math.max(terrainH(a[0],a[1]),ga?ga[0]:-1e9),'interior:'+L.id))S.walked++;}catch(e){S.fails.push(p.key+' walk: '+(e&&e.message||e));}
   if(D){D.blocks.forEach((b,i)=>S.walk.setBlock(b,on[i]));D.locked=false;}}
  const TG=T0();for(const q of(T.F&&T.F.placed)||[]){const w=loc(p.x,p.z,q.x,q.z,p.ry);
   TG.add({prefix:'ixf','class':'furniture',kind:q.kind,key:q.key,name:q.name,at:[w[0],y+q.y,w[1]],ry:q.ry+p.ry,size:q.size,tags:Object.assign({},q.tags,{building:L.id}),frag:'90u-qc-lot-interiors.js'});}};
 // the walk-in check (verify.py's walk-in): for a lot of each of the n commonest built types with a drawn door, its clone placed, the
 // door shut blocks the doorway, opened (KDOOR.open, eased to the end) clears it, and a walker flooding from the street outside
 // (KWALK.reach, the ground where no floor is) reaches every floor and stair of the house. The doors are shut again after
 S.walkIn=function(n){const out=[];if(!S.walk)return{error:'no core/walk on the page'};
  for(const ty of Object.values(S.types).filter(ty=>ty.T&&ty.door).sort((a,b)=>b.n-a.n).slice(0,n==null?6:n)){
   const L=S.lots.find(L=>L.tk===ty.tk);if(!L)continue;if(!L.G)S.place(L);const tag='interior:'+L.id,P0=L.pose;
   /* the way in: the door record, or an archway house's arch (its place in the type's plan, turned to the lot) */
   const ar=!L.D&&ty.T.door,w0=ar?loc(P0.x,P0.z,ar.at[0],ar.at[1],P0.ry):null,ay=ar?P0.ry+ty.sh.ry+Math.atan2(ty.door.n[0],ty.door.n[1]):0;
   const D=L.D||{at:[w0[0],P0.y+ty.sh.y,w0[1]],yaw:ay,blocks:[]},ox=Math.sin(D.yaw),oz=Math.cos(D.yaw);
   let shut=true,open=true;if(L.D){KDOOR.close(D);for(let i=0;i<40;i++)KDOOR.step(.1);shut=!!S.walk.blocked(D.at[0],D.at[1]+.1,D.at[2],.3,1.6);KDOOR.open(D,{by:'player'});for(let i=0;i<40;i++)KDOOR.step(.1);
    open=!S.walk.blocked(D.at[0],D.at[1]+.1,D.at[2],.3,1.6);}
   const sx=D.at[0]+ox*2.6,sz=D.at[2]+oz*2.6,sf=S.walk.floorBelow(sx,sz,D.at[1],.1),rb=Math.max(ty.sh.w,ty.sh.d)/2+8;
   const R=S.walk.reach([[sx,Math.max(terrainH(sx,sz),sf?sf[0]:-1e9),sz]],{ground:terrainH,box:[L.x-rb,L.x+rb,L.z-rb,L.z+rb]}),mine=F=>F.tag===tag;
   const un=R.unreached.filter(mine).map(F=>F.name.split('.').slice(-3).join('.'));if(L.D){KDOOR.close(D);for(let i=0;i<40;i++)KDOOR.step(.1);}
   out.push({key:ty.key+(ty.prog?' ('+ty.prog.name+')':''),lot:L.id,shut,open,floors:R.reached.filter(mine).length,unreached:un,ok:shut&&open&&!un.length&&R.reached.some(mine)});}
  return out;};
 S.buildTypes=function(n){const L=Object.values(S.types).sort((a,b)=>b.n-a.n).slice(0,n==null?8:n);L.forEach(S.buildType);report();return window._qiblaiLix;};
 // the frame hook: every few frames, the lots near the camera; at most one new type and six clones a pass
 let tick=0;FRAME_HOOKS.push(()=>{if((tick++)%6)return;const P=camera.position;let newType=0,newClone=0;
  for(const L of S.lots){const d=Math.hypot(P.x-L.x,P.z-L.z);
   if(L.G){L.G.visible=d<QC_LIX_FAR;continue;}if(d>=QC_LIX_NEAR)continue;
   const ty=S.types[L.tk];if(!ty.tried){if(newType)continue;newType++;S.buildType(ty);}
   if(ty.T&&newClone<6){S.place(L);newClone++;}}
  if(newClone)report();});
 report();return S;})();
