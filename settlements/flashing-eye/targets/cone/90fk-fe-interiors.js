// ================================================================= THE FLASHING EYE — the interiors (sheets L, H and P), at load
// Every building FE_ROOMS lists (src/32-fe-rooms.js: the Lip Range's four houses, the Hall of the Ember and the Ember Tower's shaft,
// the Eye Post) is planned on its shell, drawn and furnished from the catalog by kits/qiblai's interiors (89q5s qnIxType:
// kits/interiors' planBuilding with the blueprint's programme storey by storey, the linings, stairs and slabs in the Xanadu kit's
// textured items, qnFurnishRooms through the page's furniture bundle), as the Beacon's B8 does (settlements/beacon targets/house
// 90w-bc-interiors.js). The Order's pieces are offered first where FE_ROOMS wants them and kept out of every other building; the
// pieces that make a room are the only Xanadu pieces of their type there (the Ember's hearth in the sanctum, the lecterns). No
// electric light (prog.bulbs false): no oil and no wire on the mountain, the lamps are the catalog's, lit from the Ember.
// The Lip Range's houses are entered at the bench, two storeys over their lowest floor: the record's two doors on L0 (from the
// bench, onto the balcony) are prog.doors, more ways in; the plan's own street door is a shut leaf into the rock at the back of
// L-2. The Eye Post's doorway is run through its thick base; its platform's heliograph and fire basket stand on the lantern's
// floor. Each interior is posed at its building's place, its pieces registered in core/tags (KTAGS.page) where they stand, its
// doors unlocked, its floors, walls and stairs put into core/walk (qnIxWalk) with a flight in at each upper door; the balcony in
// front of the range is a floor. window._feIx reports; FE_IX.walkIn() is verify.py's walk-in check. [web]: three.js.
const FE_IX=(function(){const S={on:false,buildings:[],rooms:0,pieces:0,fails:[],ms:0,placed:{},walked:0,platform:null,balcony:false,T:{},entry:{}};
 const report=()=>{window._feIx={on:S.on,buildings:S.buildings.map(b=>({id:b.id,levels:b.levels,rooms:b.rooms,kinds:b.kinds,pieces:b.pieces,keys:b.keys,fails:b.fails,door:b.door,more:b.more,walk:b.walk,entries:b.entries})),
  rooms:S.rooms,pieces:S.pieces,fails:S.fails.slice(0,10),ms:S.ms,placed:S.placed,walked:S.walked,platform:S.platform,balcony:S.balcony};};
 if(typeof qnIxType!=='function'||typeof KratorInteriors==='undefined'||typeof KratorFurniture==='undefined'){S.fails.push('no interiors on the page');report();return S;}
 S.on=true;const IX=KratorInteriors,W=typeof KWALK!=='undefined'?KWALK:null,T0=KTAGS.page||(KTAGS.page=KTAGS.create({build:'xanadu'})),R2=v=>Math.round(v*100)/100;
 /* the catalog as one building sees it: its wanted pieces first, the Order's others out, the only-pieces alone of their type
    (qnFurnishRooms' perType keeps the first three of a culture's type, in this order) */
 const offered=(want,only,block,fn)=>{const ra=IX.runtimeAdapter;IX.runtimeAdapter=function(){const A=ra.apply(this,arguments),L0=A.list.bind(A);let c=null;
   A.list=function(){if(c)return c;const l=L0(),ot=new Set(only.map(k=>l.find(d=>d.key===k)).filter(Boolean).map(d=>d.culture+'|'+d.type).concat(block));
    c=want.concat(only.filter(k=>want.indexOf(k)<0)).map(k=>l.find(d=>d.key===k)).filter(Boolean)
     .concat(l.filter(d=>FE_ROOMS.OWN.indexOf(d.key)<0&&!ot.has(d.culture+'|'+d.type)));return c;};return A;};
  try{return fn();}finally{IX.runtimeAdapter=ra;}};
 /* every door of the page into core/walk as blocks (its doorway shut while it is shut), once: nothing before this does it */
 if(W&&KDOOR.walk&&!KDOOR.list.some(D=>D.blocks&&D.blocks.length))KDOOR.walk(W);
 const doorsAt=new Map();for(const D of KDOOR.list){const m=/^(.*)\.\d+(#\d+)?$/.exec(D.id);if(m)(doorsAt.get(m[1])||doorsAt.set(m[1],[]).get(m[1])).push(D);}
 /* the door a record drew on a storey of a shell (qnIxDoorOf on the shell raised to that storey), on the face n when given */
 const doorOn=(sh,lev,pose,doors,n)=>{const y=sh.y+sh.hs.slice(0,lev).reduce((a,b)=>a+b,0),c=Math.cos(pose.ry),s=Math.sin(pose.ry);
  const on=(doors||[]).filter(D=>{if(!n)return true;const dx=D.at[0]-pose.x,dz=D.at[2]-pose.z,u=dx*c-dz*s-sh.x,v=dx*s+dz*c-sh.z;
   return n[0]?Math.sign(u)===n[0]&&Math.abs(u)>sh.w/2-.7:Math.sign(v)===n[1]&&Math.abs(v)>sh.d/2-.7;});
  return qnIxDoorOf(Object.assign({},sh,{y}),pose,on);};
 /* drawn with the kit's items into a group of its own, before the page (renderOrder -2), as qnIxType draws */
 const kitDraw=fn=>{const Gd=new THREE.Group(),saveK=KXF;KXF=null;try{fn();}finally{KXF=saveK;}kbake(Gd);for(const k in KIT.items)KIT.items[k].length=0;Gd.traverse(o=>{if(o.isMesh)o.renderOrder=-2;});return Gd;};
 const t0=performance.now(),inst0=window._instances;   /* the page's count of instances is the chunks' (90fg); the interiors' bakes would overwrite it */
 /* the balcony in front of the Lip Range (the roof of its rock-cut floors, inside its parapet): a floor, onto which its houses' L0
    doors open; laid first, so their flights find it */
 {const p=FE_PLACE.find(q=>q.id==='lip-range');if(p&&W){const Y=p.o.y==null?0:p.o.y,L=(p.o.len==null?120:p.o.len)/2-.5;
   W.poly({pts:[[-L,7.05],[L,7.05],[L,9.5],[-L,9.5]].map(q=>loc(p.x,p.z,q[0],q[1],p.ry||0).concat(Y+.02)),name:'lip-range.balcony',tag:'interior:balcony'});S.balcony=true;}}
 FE_ROOMS.buildings.forEach((Bd,bi)=>{const p=FE_PLACE.find(q=>q.id===Bd.part);
  const B={id:Bd.id,name:Bd.name,levels:0,rooms:0,kinds:[],pieces:0,keys:{},fails:[],door:null,more:[],walk:false,entries:0};S.buildings.push(B);
  if(!p){B.fails.push('no place '+Bd.part);return;}
  const pose={x:p.x,z:p.z,y:p.o.y==null?0:p.o.y,ry:p.ry||0},hs=Bd.shell.hs.map(R2);
  const sh=Object.assign({},Bd.shell,{ry:0,hs,h:hs[0],n:hs.length,sig:[Bd.shell.x,Bd.shell.y,Bd.shell.z,Bd.shell.w,Bd.shell.d,0].concat(hs).join(',')});
  const doors=doorsAt.get(p.key+'@'+Math.round(p.x)+','+Math.round(p.z));
  const dr=Bd.door==='drawn'?doorOn(sh,0,pose,doors,null):Object.assign({D:null,noPortal:true},Bd.door);
  if(!dr){B.fails.push('no drawn door');return;}
  B.door={n:dr.n,t:dr.t,w:dr.w,h:dr.h,drawn:!!dr.D};
  const mores=(Bd.more||[]).map(M=>{const d=doorOn(sh,M.level,pose,doors,M.n);if(!d)B.fails.push('no drawn door on storey '+M.level+', face '+M.n.join(','));
   return d?{level:M.level,n:d.n,t:d.t,w:d.w,h:d.h,D:d.D}:null;}).filter(Boolean);
  const prog={name:'flashing-'+Bd.id,wealth:Bd.wealth,program:Bd.levels,bulbs:false,stair:Bd.stair||null,doors:mores.map(M=>({level:M.level,n:M.n,t:M.t,w:M.w,h:M.h}))};
  let T=null;try{T=offered(Bd.want||[],Bd.only||[],Bd.block||[],()=>{let best=null;for(let k=0;k<3;k++){
    const U=qnIxType(sh,'fe.'+Bd.id,FE_ROOMS.seed+bi*31+k*7919,{n:dr.n,t:dr.t,w:dr.w,h:dr.h,noPortal:!!dr.noPortal},prog);
    if(!U||!U.G){if(!best)best=U;break;}if(!best||!best.G||U.F.fails.length<best.F.fails.length)best=U;if(!best.F.fails.length)break;}return best;});}
  catch(e){B.fails.push(String(e&&e.message||e));return;}
  if(!T||!T.G){B.fails.push(T&&T.error||'no plan');return;}
  S.T[Bd.id]=T;const g=T.G;g.name='interior:'+Bd.id;
  const side=dr.n[0]!==0,t=side?T.door.at[1]-sh.z:T.door.at[0]-sh.x,Pt=(off,u)=>side?[sh.x+dr.n[0]*off,sh.z+u]:[sh.x+u,sh.z+dr.n[1]*off],bry=side?Math.PI/2:0;
  /* a door into the rock (the Lip Range's L-2): a shut plank leaf in the plan's street doorway */
  if(Bd.door.leaf){const q=Pt((side?sh.w:sh.d)/2-.4,t);g.add(kitDraw(()=>{vB('qPlankB',q[0],sh.y+.06,q[1],T.door.w,T.door.h,.08,bry,xC(0x6a4a32));}));}
  /* a body thicker than the shell (the Eye Post's battered base): the doorway run from the plan's face out to the body's (jambs, a
     lintel, a threshold), the depth-only portal moved out to the body's face */
  if(Bd.body){const f0=side?sh.w/2:sh.d/2,f1=side?Bd.body.hw:Bd.body.hd,dep=f1-f0+.04,mid=(f0+f1)/2,dw=T.door.w,dh=T.door.h,w0=xC(0xece4d6);
   g.add(kitDraw(()=>{for(const e of[-1,1]){const q=Pt(mid,t+e*(dw/2+.06));vB('xWashB',q[0],sh.y,q[1],.12,dh+.05,dep,bry,w0);}
    const q=Pt(mid,t);vB('xWashB',q[0],sh.y+dh,q[1],dw+.24,.25,dep,bry,w0);vB('qPlankB',q[0],sh.y,q[1],dw,.06,dep,bry,xC(0xf0e8dc));}));
   const pt=g.getObjectByName('portal');if(pt){const q=Pt(f1+.03,t);pt.position.x=q[0];pt.position.z=q[1];}}
  g.position.set(pose.x,pose.y,pose.z);g.rotation.y=pose.ry;scene.add(g);g.updateMatrixWorld(true);
  B.levels=T.plan.levels.length;B.rooms=T.plan.rooms.length;B.kinds=T.plan.levels.map(L=>T.plan.rooms.filter(r=>r.level===L.k).map(r=>r.kind));
  B.more=(T.more||[]).map(M=>({level:M.level,n:M.n,room:M.room}));B.fails=B.fails.concat((T.F.fails||[]).slice(0,4));S.rooms+=B.rooms;
  for(const q of T.F.placed||[]){const w=loc(pose.x,pose.z,q.x,q.z,pose.ry);B.pieces++;S.pieces++;S.placed[q.key]=(S.placed[q.key]|0)+1;if(FE_ROOMS.OWN.indexOf(q.key)>=0)B.keys[q.key]=(B.keys[q.key]|0)+1;
   T0.add({prefix:'ixf','class':'furniture',kind:q.kind,key:q.key,name:q.name,at:[w[0],pose.y+q.y,w[1]],ry:q.ry+pose.ry,size:q.size,tags:Object.assign({},q.tags,{building:Bd.id}),frag:'90fk-fe-interiors.js'});}
  /* the way in the walk-in check takes: the record's door from the bench (the Lip Range's houses), else the street door */
  const ent=mores.find(M=>M.n[1]===-1&&M.D)||(dr.D?dr:null),cw=loc(pose.x,pose.z,sh.x,sh.z,pose.ry);if(ent)S.entry[Bd.id]={D:ent.D,x:cw[0],z:cw[1]};
  /* walk in: the doors' blocks off while the plan and its flights are laid (as Qiblai's lots), then the doors unlocked */
  if(W){const Ds=[dr.D].concat(mores.map(M=>M.D)).filter(Boolean),on=Ds.map(D=>D.blocks.map(b=>!b.off));Ds.forEach(D=>W.setBlock(D.blocks,false));
   const f0=pose.y+T.plan.levels[0].y;let ground=f0;
   if(dr.D){const D=dr.D,a=[D.at[0]+Math.sin(D.yaw)*1.2,D.at[2]+Math.cos(D.yaw)*1.2],ga=W.floorBelow(a[0],a[1],f0,.1);ground=Math.max(terrainH(a[0],a[1]),ga?ga[0]:-1e9);}
   try{if(qnIxWalk(T,pose,W,ground,'interior:'+Bd.id)){B.walk=true;S.walked++;}}catch(e){B.fails.push('walk: '+(e&&e.message||e));}
   /* a flight in at each upper door, from the floor or ground outside it to its storey's floor */
   const c=Math.cos(pose.ry),s=Math.sin(pose.ry);
   for(const M of T.more||[]){const wa=loc(pose.x,pose.z,M.at[0],M.at[1],pose.ry),wn=[M.n[0]*c+M.n[1]*s,-M.n[0]*s+M.n[1]*c],fy=pose.y+M.y;
    const o=[wa[0]+wn[0]*1.2,wa[1]+wn[1]*1.2],ga=W.floorBelow(o[0],o[1],fy+.5,1),gy=Math.max(terrainH(o[0],o[1]),ga?ga[0]:-1e9),i=[wa[0]-wn[0]*.45,wa[1]-wn[1]*.45];
    if(Math.abs(fy-gy)>3.5){B.fails.push('the door on storey '+M.level+' stands '+(fy-gy).toFixed(1)+' m over what is outside it');continue;}
    W.strip({a:[o[0],o[1],gy],b:[i[0],i[1],fy],w:Math.max(.9,M.w-.1),name:'interior:'+Bd.id+'.door.'+M.level+'.'+B.entries,tag:'interior:'+Bd.id});B.entries++;}
   Ds.forEach((D,k)=>{D.blocks.forEach((b,j)=>W.setBlock(b,on[k][j]));D.locked=false;});}});
 S.ms=Math.round(performance.now()-t0);
 /* the Eye Post's platform: the 60 cm heliograph turned to the line (the Beacon at 245 degrees), and the fire basket round the
    record's coals; the catalog's pieces on the lantern's floor, registered where they stand */
 {const P=FE_ROOMS.platform,p=FE_PLACE.find(q=>q.id===P.part);if(p){const Y=(p.o.y==null?0:p.o.y)+P.y,b=KratorFurniture.batch({indexed:true}),out=[];
   for(const q of P.pieces){const at=q.at==='coals'?[-P.lw*.25,-P.lw*.25+.1]:q.at,w=loc(p.x,p.z,at[0],at[1],p.ry||0),ry=q.ry+(p.ry||0),E=KratorFurniture.FURN_BY_KEY[q.key]||{};
    T0.add({prefix:'ixf','class':'furniture',kind:E.type||null,key:q.key,name:E.name||null,at:[w[0],Y,w[1]],ry,size:E.w?[E.w,E.d,E.h]:undefined,
     tags:{setting:'room',culture:'xanadu',tier:E.tier||null,room:'post.platform',building:'post'},frag:'90fk-fe-interiors.js'});
    const r=b.place(q.key,w[0],Y,w[1],ry,{setting:'outdoor',building:'post',room:'post.platform'});out.push({key:q.key,at:[R2(w[0]),R2(Y),R2(w[1])],error:r.error||null});
    S.placed[q.key]=(S.placed[q.key]|0)+1;}
   const g=new THREE.Group();g.name='interior:post.platform';scene.add(g);b.flush(g);S.platform={pieces:out,y:R2(Y)};}}
 window._instances=inst0;
 /* the walk-in check: for each building, the door it is entered by shut blocks the doorway, opened clears it, and a walker from
    outside reaches every floor and stair of it; the doors shut again after. The walker starts 2.6 m out, or nearer where the
    ground the door opens onto ends sooner (the Hall of the Ember's porch, 2 m from its terrace's edge) */
 S.walkIn=function(){const out=[];if(!W)return[{id:'-',ok:false,why:'no core/walk on the page'}];
  for(const b of S.buildings){const E=S.entry[b.id];if(!E){out.push({id:b.id,ok:false,why:'no door to enter by'});continue;}const D=E.D,tag='interior:'+b.id;
   KDOOR.close(D);for(let i=0;i<40;i++)KDOOR.step(.1);const shut=!!W.blocked(D.at[0],D.at[1]+.1,D.at[2],.3,1.6);
   KDOOR.open(D,{by:'player'});for(let i=0;i<40;i++)KDOOR.step(.1);const open=!W.blocked(D.at[0],D.at[1]+.1,D.at[2],.3,1.6);
   const gAt=k=>{const x=D.at[0]+Math.sin(D.yaw)*k,z=D.at[2]+Math.cos(D.yaw)*k,f=W.floorBelow(x,z,D.at[1]+.3,.6);return Math.max(terrainH(x,z),f?f[0]:-1e9);};
   let k=2.6;const g1=gAt(1.2);while(k>1.2&&Math.abs(gAt(k)-g1)>.45)k-=.2;
   const sx=D.at[0]+Math.sin(D.yaw)*k,sz=D.at[2]+Math.cos(D.yaw)*k,sf=W.floorBelow(sx,sz,D.at[1]+.3,.6);
   const R=W.reach([[sx,Math.max(terrainH(sx,sz),sf?sf[0]:-1e9),sz]],{ground:terrainH,box:[E.x-45,E.x+45,E.z-45,E.z+45]}),mine=F=>F.tag===tag;
   const un=R.unreached.filter(mine).map(F=>F.name.split('.').slice(-3).join('.'));KDOOR.close(D);for(let i=0;i<40;i++)KDOOR.step(.1);
   out.push({id:b.id,shut,open,floors:R.reached.filter(mine).length,unreached:un,ok:shut&&open&&!un.length&&R.reached.some(mine)});}
  return out;};
 report();return S;})();
