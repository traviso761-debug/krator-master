// ================================================================= GRĒṬ-ĀIL — walking into the monastery's buildings, on demand
// The Hall of Dreaming has its own walk (90ag). Every other building with a storey of its own is walked into as Qiblai's city
// walks into its lots (settlements/qiblai targets/city 90u, the same host over this page's AD_PLACE): each building listed its
// storey stacks while 90ae drew it (QB_SHELLREC, kits/qiblai 89q5s); its shell is the biggest that stands on the ground
// (qnShellOf), its programme its tags' (qnIxProgram: a dwelling, a workshop, a temple, a civic hall...). Buildings that share a key
// and a shell share a TYPE, planned, drawn and furnished once in the building's own frame (qnIxType: kits/interiors' planBuilding
// and furnishRoom, the catalog's textured pieces; kit.json "interiors") the first time the camera comes within AD_IX_NEAR, then
// cloned to each such building nearby and hidden beyond AD_IX_FAR. The great monastery's cell ranges are buildings of their own
// on the monks' programme (QB_IX_MONKS), entered from its court. A building's street door is the one its builder drew (core/door,
// qnIxDoorOf): unlocked when it takes its clone, the plan's floors, walls and stairs going into core/walk (qnIxWalk); every door
// is already a walk block (90ag). window._adIx reports; buildTypes(n) builds the n commonest; walkIn(n) is verify.py's check.
// [web]: three.js clones; the plans and their walk records are the kit's [G data].
reseed(34173);
const AD_IX_NEAR=40,AD_IX_FAR=90;
const AD_IX=(function(){const S={lots:[],types:{},nTypes:0,built:0,clones:0,noShell:0,noProgram:0,skipped:0,fails:[],ms:0,byProgram:{},tex:{meshes:0,mapped:0},doors:0,walked:0,ranges:0};
 const report=()=>{window._adIx={lots:S.lots.length,types:S.nTypes,built:S.built,clones:S.clones,noShell:S.noShell,noProgram:S.noProgram,skipped:S.skipped,noStorey:S.noStorey|0,
  byProgram:S.byProgram,fails:S.fails.slice(0,8),ms:S.ms,tex:S.tex,doors:S.doors,walked:S.walked,ranges:S.ranges,buildTypes:S.buildTypes,walkIn:S.walkIn};};
 if(typeof qnShellOf!=='function'||typeof qnIxType!=='function'){S.error='the Qiblai kit\'s interiors (89q5s) are not on the page';report();return S;}
 const hash=s=>{let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0;}return h;};
 const byId=new Map();for(const D of KDOOR.list){const m=/^(.*)\.\d+(#\d+)?$/.exec(D.id);if(m)(byId.get(m[1])||byId.set(m[1],[]).get(m[1])).push(D);}   /* a builder's doors by their placement: key@x,z */
 S.walk=typeof KWALK!=='undefined'?KWALK:null;
 const addLot=(p,id,sh,prog)=>{const pose={x:p.x,z:p.z,y:qcDflt(p.o.y,0),ry:p.ry},dr=qnIxDoorOf(sh,pose,byId.get(p.key+'@'+Math.round(p.x)+','+Math.round(p.z)))||(QB_IX_ARCH[p.key]?Object.assign({D:null},QB_IX_ARCH[p.key]):null);if(dr)S.doors++;
  const tk=p.key+'|'+sh.sig+'|'+(prog?prog.name:'')+'|'+(dr?dr.n.join(',')+','+dr.t+','+dr.w+','+dr.h:'-'),c=loc(p.x,p.z,sh.x,sh.z,p.ry);
  if(!S.types[tk]){S.types[tk]={tk,key:p.key,sh,prog:prog||null,door:dr?{n:dr.n,t:dr.t,w:dr.w,h:dr.h,noPortal:!!dr.noPortal}:null,n:0,T:null,tried:false};S.nTypes++;}S.types[tk].n++;
  S.lots.push({p,id,tk,G:null,x:c[0],z:c[1],pose,D:dr?dr.D:null});};
 /* the great monastery's cell ranges (each storey stack 5.5-7.5 m deep, 14 m long or more): the monks' quarters */
 for(const p of AD_PLACE){if(p.key!=='qb_monastery'||!p.stacks)continue;let i=0;
  for(const s of p.stacks){const dd=Math.min(s.w,s.d);if(dd<5.5||dd>7.5||Math.max(s.w,s.d)<14||s.hs[0]>4.4)continue;const sh=qnShellOf([s]);if(sh){addLot(p,p.id+'.range'+(i++),sh,QB_IX_MONKS);S.ranges++;}}
  p.stacks=null;}
 for(const p of AD_PLACE){if(!p.stacks)continue;if(!p.stacks.length){p.stacks=null;S.noStorey=(S.noStorey|0)+1;continue;}   /* a stair, a jetty, racks, a chorten: no storey to walk into */
  if(p.id==='hall-of-dreaming'||QB_IX_OPEN[p.key]){p.stacks=null;S.skipped++;continue;}   /* the Hall: its own walk (90ag) */
  const sh=qnShellOf(p.stacks);p.stacks=null;if(!sh){S.noShell++;continue;}if(!qnIxProgram(p.key)){S.noProgram++;continue;}
  addLot(p,p.id,sh,null);}
 if(typeof IZDOOR!=='undefined'&&IZDOOR.meshes)for(const im of IZDOOR.meshes(KIT.meshes||{}))if(!im.material.transparent)im.renderOrder=-2;   /* a shut leaf drawn before the doorway's portal */
 // a type built once (its template is not in the scene: buildings take clones of it); a plan short of a required piece is
 // planned again on the next seed, up to three times, and the one with the fewest misses kept
 S.buildType=function(ty){if(ty.tried)return ty.T;ty.tried=true;const t0=performance.now();
  try{let T=null;for(let k=0;k<3;k++){const U=qnIxType(ty.sh,ty.key,hash(ty.tk)+k*7919,ty.door,ty.prog);if(!U||!U.G){if(!T)T=U;break;}
    if(!T||!T.G||U.F.fails.length<T.F.fails.length)T=U;if(!T.F.fails.length)break;}
   if(T&&T.G){ty.T=T;S.built++;S.byProgram[T.program]=qcDflt(S.byProgram[T.program],0)+1;
    if(T.F){S.fails=S.fails.concat(T.F.fails.map(f=>ty.key+': '+f));if(T.F.tex){S.tex.meshes+=T.F.tex.meshes;S.tex.mapped+=T.F.tex.mapped;}}}
   else if(T&&T.error)S.fails.push(ty.key+': '+T.error);}
  catch(e){S.fails.push(ty.key+': '+(e&&e.message||e));}
  S.ms+=Math.round(performance.now()-t0);report();return ty.T;};
 const T0=()=>KTAGS.page||(KTAGS.page=KTAGS.create({build:'xanadu'}));
 S.place=function(L){const ty=S.types[L.tk],T=ty&&ty.T;if(!T)return;const p=L.p,y=qcDflt(p.o.y,0),g=T.G.clone();
  g.name='interior:'+L.id;g.position.set(p.x,y,p.z);g.rotation.y=p.ry;scene.add(g);L.G=g;S.clones++;
  for(const b of T.bulbs||[]){const w=loc(p.x,p.z,b[0],b[2],p.ry);AD_LAMPS.push([w[0],y+b[1],w[1],'bulb','interior:'+L.id]);}
  if(S.walk){const D=L.D,on=D?D.blocks.map(b=>!b.off):[];if(D)S.walk.setBlock(D.blocks,false);   /* the flight's climb test walks through the doorway */
   const a=D?[D.at[0]+Math.sin(D.yaw)*1.2,D.at[2]+Math.cos(D.yaw)*1.2]:[p.x,p.z];
   const ga=S.walk.floorBelow(a[0],a[1],L.pose.y+T.plan.levels[0].y,.1);
   try{if(qnIxWalk(T,L.pose,S.walk,Math.max(terrainH(a[0],a[1]),ga?ga[0]:-1e9),'interior:'+L.id))S.walked++;}catch(e){S.fails.push(p.key+' walk: '+(e&&e.message||e));}
   if(D){D.blocks.forEach((b,i)=>S.walk.setBlock(b,on[i]));D.locked=false;}}
  const TG=T0();for(const q of(T.F&&T.F.placed)||[]){const w=loc(p.x,p.z,q.x,q.z,p.ry);
   TG.add({prefix:'ixf','class':'furniture',kind:q.kind,key:q.key,name:q.name,at:[w[0],y+q.y,w[1]],ry:q.ry+p.ry,size:q.size,tags:Object.assign({},q.tags,{building:L.id}),frag:'90ai-ad-interiors.js'});}};
 // the walk-in check: for a building of each of the n commonest built types with a drawn door, its clone placed: the door shut
 // blocks the doorway, opened clears it, and a walker from outside reaches every floor and stair of it. The doors shut again after
 S.walkIn=function(n){const out=[];if(!S.walk)return{error:'no core/walk on the page'};
  for(const ty of Object.values(S.types).filter(ty=>ty.T&&ty.door).sort((a,b)=>b.n-a.n).slice(0,n==null?6:n)){
   const L=S.lots.find(L=>L.tk===ty.tk);if(!L)continue;if(!L.G)S.place(L);const tag='interior:'+L.id,P0=L.pose;
   const ar=!L.D&&ty.T.door,w0=ar?loc(P0.x,P0.z,ar.at[0],ar.at[1],P0.ry):null,ay=ar?P0.ry+ty.sh.ry+Math.atan2(ty.door.n[0],ty.door.n[1]):0;
   const D=L.D||{at:[w0[0],P0.y+ty.sh.y,w0[1]],yaw:ay,blocks:[]},ox=Math.sin(D.yaw),oz=Math.cos(D.yaw);
   let shut=true,open=true;if(L.D){KDOOR.close(D);for(let i=0;i<40;i++)KDOOR.step(.1);shut=!!S.walk.blocked(D.at[0],D.at[1]+.1,D.at[2],.3,1.6);KDOOR.open(D,{by:'player'});for(let i=0;i<40;i++)KDOOR.step(.1);
    open=!S.walk.blocked(D.at[0],D.at[1]+.1,D.at[2],.3,1.6);}
   const sx=D.at[0]+ox*2.6,sz=D.at[2]+oz*2.6,sf=S.walk.floorBelow(sx,sz,D.at[1],.1),rb=Math.max(ty.sh.w,ty.sh.d)/2+8;
   const R=S.walk.reach([[sx,Math.max(terrainH(sx,sz),sf?sf[0]:-1e9),sz]],{ground:terrainH,box:[L.x-rb,L.x+rb,L.z-rb,L.z+rb]}),mine=F=>F.tag===tag;
   const un=R.unreached.filter(mine).map(F=>F.name.split('.').slice(-3).join('.'));if(L.D){KDOOR.close(D);for(let i=0;i<40;i++)KDOOR.step(.1);}
   out.push({key:ty.key+(ty.prog?' ('+ty.prog.name+')':''),lot:L.id,shut,open,floors:R.reached.filter(mine).length,unreached:un,ok:shut&&open&&!un.length&&R.reached.some(mine)});}
  return out;};
 S.buildTypes=function(n){Object.values(S.types).sort((a,b)=>b.n-a.n).slice(0,n==null?8:n).forEach(S.buildType);report();return window._adIx;};
 // the frame hook: every few frames, the buildings near the camera; at most one new type and six clones a pass
 let tick=0;FRAME_HOOKS.push(()=>{if((tick++)%6)return;const P=camera.position;let newType=0,newClone=0;
  for(const L of S.lots){const d=Math.hypot(P.x-L.x,P.z-L.z);
   if(L.G){L.G.visible=d<AD_IX_FAR;continue;}if(d>=AD_IX_NEAR)continue;
   const ty=S.types[L.tk];if(!ty.tried){if(newType)continue;newType++;S.buildType(ty);}
   if(ty.T&&newClone<6){S.place(L);newClone++;}}
  if(newClone)report();});
 report();return S;})();
