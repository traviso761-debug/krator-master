// ================================================================= THE FLASHING EYE — the interiors (sheets L, H, P, T, M1-M2, E1-E2, F)
// Every building FE_ROOMS lists (src/32-fe-rooms.js: the Lip Range's four houses, the Hall of the Ember and the Ember Tower's shaft,
// the Eye Post at load; the bench's ranges, the Mirror School, the novices' court, the Foot House, the Mirror and Labrang towers
// the Red Monastery, the gatehouses, the Watch's hut and the shrines of the Way of Shrines as the camera comes within 90 m of them)
// is planned on its shell, drawn and furnished from the catalog by kits/qiblai's interiors (89q5s qnIxType:
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
 const report=()=>{window._feIx={on:S.on,buildings:S.buildings.map(b=>({id:b.id,levels:b.levels,rooms:b.rooms,kinds:b.kinds,pieces:b.pieces,keys:b.keys,fails:b.fails,door:b.door,more:b.more,walk:b.walk,entries:b.entries,rows:b.rows|0})),
  rooms:S.rooms,pieces:S.pieces,fails:S.fails.slice(0,10),ms:S.ms,built:S.buildings.length,lazy:S.lazy|0,placed:S.placed,walked:S.walked,platform:S.platform,balcony:S.balcony,parapet:S.parapet|0,ladder:S.ladder||null};};
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
 const doorOn=(sh,lev,pose,doors,n)=>{const y=sh.y+sh.hs.slice(0,lev).reduce((a,b)=>a+b,0),c=Math.cos(pose.ry),s=Math.sin(pose.ry),c2=Math.cos(sh.ry),s2=Math.sin(sh.ry);
  const on=(doors||[]).filter(D=>{if(!n)return true;const dx=D.at[0]-pose.x,dz=D.at[2]-pose.z,u=dx*c-dz*s-sh.x,v=dx*s+dz*c-sh.z,su=u*c2-v*s2,sv=u*s2+v*c2;
   return n[0]?Math.sign(su)===n[0]&&Math.abs(su)>sh.w/2-.7:Math.sign(sv)===n[1]&&Math.abs(sv)>sh.d/2-.7;});
  return qnIxDoorOf(Object.assign({},sh,{y}),pose,on);};
 /* drawn with the kit's items into a group of its own, before the page (renderOrder -2), as qnIxType draws */
 const kitDraw=fn=>{const Gd=new THREE.Group(),saveK=KXF;KXF=null;try{fn();}finally{KXF=saveK;}kbake(Gd);for(const k in KIT.items)KIT.items[k].length=0;Gd.traverse(o=>{if(o.isMesh)o.renderOrder=-2;});return Gd;};
 const inst0=window._instances;   /* the page's count of instances is the chunks' (90fg); the interiors' bakes would overwrite it */
 /* the balcony in front of the Lip Range (the roof of its rock-cut floors, inside its parapet): a floor, onto which its houses' L0
    doors open; laid first, so their flights find it */
 {const p=FE_PLACE.find(q=>q.id==='lip-range');if(p&&W){const Y=p.o.y==null?0:p.o.y,L=(p.o.len==null?120:p.o.len)/2-.5;
   W.poly({pts:[[-L,7.05],[L,7.05],[L,9.5],[-L,9.5]].map(q=>loc(p.x,p.z,q[0],q[1],p.ry||0).concat(Y+.02)),name:'lip-range.balcony',tag:'interior:balcony'});S.balcony=true;
   /* its parapet (the record's, 1.05 m on the lower floors' roof) a wall to the walker, in 2 m blocks */
   let nb=0;for(let x=-L-.5;x<L+.5;x+=2){const a=loc(p.x,p.z,x,9.55,p.ry||0),b=loc(p.x,p.z,Math.min(x+2,L+.5),9.95,p.ry||0);
    W.block([Math.min(a[0],b[0]),Math.max(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[1],b[1]),Y,Y+1.05],'interior:balcony.parapet');nb++;}S.parapet=nb;}}
 const built=new Set();
 const buildOne=(Bd,bi)=>{if(built.has(Bd.id))return;built.add(Bd.id);const tb=performance.now(),p=FE_PLACE.find(q=>q.id===Bd.part);
  const B={id:Bd.id,name:Bd.name,levels:0,rooms:0,kinds:[],pieces:0,keys:{},fails:[],door:null,more:[],walk:false,entries:0};S.buildings.push(B);
  if(!p){B.fails.push('no place '+Bd.part);return;}
  const pose={x:p.x,z:p.z,y:p.o.y==null?0:p.o.y,ry:p.ry||0},S0=typeof Bd.shell==='function'?Bd.shell(p.o):Bd.shell,hs=S0.hs.map(R2),sry=S0.ry||0;
  const sh=Object.assign({},S0,{x:R2(S0.x),z:R2(S0.z),w:R2(S0.w),d:R2(S0.d),ry:sry,hs,h:hs[0],n:hs.length,sig:[S0.x,S0.y,S0.z,S0.w,S0.d,sry].map(R2).concat(hs).join(',')});
  /* a point of the building's frame, and a normal of the shell's, in the world */
  const toW=q=>loc(pose.x,pose.z,q[0],q[1],pose.ry),nW=n=>{const c2=Math.cos(sry),s2=Math.sin(sry),b=[n[0]*c2+n[1]*s2,-n[0]*s2+n[1]*c2],c=Math.cos(pose.ry),s=Math.sin(pose.ry);return[b[0]*c+b[1]*s,-b[0]*s+b[1]*c];};
  const doors=doorsAt.get(p.key+'@'+Math.round(p.x)+','+Math.round(p.z));
  const dr=Bd.door==='drawn'?doorOn(sh,0,pose,doors,null):Object.assign({D:null,noPortal:!!Bd.door.leaf},Bd.door);   /* an open doorway (its portal drawn), or a shut leaf */
  if(!dr){B.fails.push('no drawn door');return;}
  B.door={n:dr.n,t:dr.t,w:dr.w,h:dr.h,drawn:!!dr.D};
  const mores=(Bd.more||[]).map(M=>{if(M.open)return{level:M.level,n:M.n,t:M.t==null?0:M.t,w:M.w==null?1.2:M.w,h:M.h==null?2.3:M.h,D:null};const d=doorOn(sh,M.level,pose,doors,M.n);if(!d)B.fails.push('no drawn door on storey '+M.level+', face '+M.n.join(','));
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
  /* a hall's seats in rows (Bd.rows): kits/interiors stops a room at about nine pieces whatever its size, so a dukhang's rows of
     low seats are laid after it, every dx along and dz deep with an aisle down the middle, facing the storey's shrine (or away
     from the room's door), each clear of the room's walls by `margin`, of every piece and fixture already there and of its doors */
  for(const Rw of Bd.rows||[]){const Lv=T.plan.levels[Rw.level],R=Lv&&T.plan.rooms.find(r=>r.level===Rw.level&&r.kind===Rw.kind),E=KratorFurniture.FURN_BY_KEY[Rw.key];if(!R||!E)continue;
   const cen=P=>{let x=0,z=0;for(const q of P){x+=q[0];z+=q[1];}return[x/P.length,z/P.length];},c0=cen(R.poly),Sh=T.plan.rooms.find(r=>r.level===Rw.level&&r.kind==='shrine');
   let f=Sh?(c=>[c[0]-c0[0],c[1]-c0[1]])(cen(Sh.poly)):R.doors.length?[c0[0]-R.doors[0].at[0],c0[1]-R.doors[0].at[1]]:[0,-1];
   const c2=Math.cos(sry),s2=Math.sin(sry),fu=f[0]*c2-f[1]*s2,fv=f[0]*s2+f[1]*c2;   /* snapped to the shell's axes */
   const ax=Math.abs(fu)>Math.abs(fv)?[Math.sign(fu),0]:[0,Math.sign(fv)];f=[ax[0]*c2+ax[1]*s2,-ax[0]*s2+ax[1]*c2];const gt=[f[1],-f[0]],ry=Math.atan2(f[0],f[1]);
   const pts=(cx,cz,r,w,d)=>{const c=Math.cos(r),s=Math.sin(r);return[[-1,-1],[1,-1],[1,1],[-1,1]].map(([a,b])=>[cx+a*w/2*c+b*d/2*s,cz-a*w/2*s+b*d/2*c]);};
   const sep=(A,B)=>{for(const P of[A,B])for(let i=0;i<4;i++){const a=P[i],b=P[(i+1)%4],n=[b[1]-a[1],a[0]-b[0]];
     const pa=A.map(q=>q[0]*n[0]+q[1]*n[1]),pb=B.map(q=>q[0]*n[0]+q[1]*n[1]);if(Math.max(...pa)<Math.min(...pb)||Math.max(...pb)<Math.min(...pa))return true;}return false;};
   const inP=(P,x,z)=>{let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;};
   const block=(T.F.placed||[]).filter(q=>q.y>=Lv.y-.1&&q.y<Lv.y+Lv.h).map(q=>pts(q.x,q.z,q.ry||0,(q.size||[.8,.8])[0]+.5,(q.size||[.8,.8])[1]+.5))
    .concat(R.fixtures.map(x=>pts(x.x,x.z,x.ry,x.w+.5,x.d+1)));
   const us=R.poly.map(q=>(q[0]-c0[0])*gt[0]+(q[1]-c0[1])*gt[1]),vs=R.poly.map(q=>(q[0]-c0[0])*f[0]+(q[1]-c0[1])*f[1]);
   const b=KratorFurniture.batch({indexed:true});let n=0;
   for(let v=Math.max(...vs)-Rw.margin-E.d/2-(Rw.back==null?1.2:Rw.back);v>Math.min(...vs)+Rw.margin;v-=Rw.dz)for(const sgn of[-1,1])for(let k=0;;k++){
    const u=sgn*(.7+E.w/2+k*Rw.dx);if(u<Math.min(...us)||u>Math.max(...us))break;
    const x=c0[0]+gt[0]*u+f[0]*v,z=c0[1]+gt[1]*u+f[1]*v,me=pts(x,z,ry,E.w,E.d),big=pts(x,z,ry,E.w+2*Rw.margin,E.d+2*Rw.margin);
    if(!big.every(q=>inP(R.poly,q[0],q[1])))continue;if(block.some(B2=>!sep(me,B2)))continue;
    if(R.doors.some(d=>Math.hypot(d.at[0]-x,d.at[1]-z)<d.w/2+E.w/2+1.2))continue;
    const w=loc(pose.x,pose.z,x,z,pose.ry);
    T0.add({prefix:'ixf','class':'furniture',kind:E.type||null,key:Rw.key,name:E.name||null,at:[w[0],pose.y+Lv.y,w[1]],ry:ry+pose.ry,size:[E.w,E.d,E.h],
     tags:{setting:'room',culture:'xanadu',tier:E.tier||null,room:R.id,building:Bd.id},frag:'90fk-fe-interiors.js'});
    b.place(Rw.key,x,Lv.y,z,ry,{variant:0,setting:'indoor',building:Bd.id,room:R.id});block.push(pts(x,z,ry,E.w+.2,E.d+.6));n++;B.pieces++;S.pieces++;S.placed[Rw.key]=(S.placed[Rw.key]|0)+1;}
   if(n){const gr=new THREE.Group();gr.name='rows:'+Bd.id+'.'+Rw.level;b.flush(gr);gr.traverse(o=>{if(o.isMesh)o.renderOrder=-2;});g.add(gr);g.updateMatrixWorld(true);}
   B.rows=(B.rows|0)+n;}
  /* the way in the walk-in check takes: the record's door from the bench (the Lip Range's houses), else the street door */
  const ent=mores.find(M=>M.n[1]===-1&&M.D)||(dr.D?dr:null),cw=toW([sh.x,sh.z]),f0=pose.y+T.plan.levels[0].y;
  if(ent)S.entry[Bd.id]={D:ent.D,x:cw[0],z:cw[1]};
  else if(!Bd.door.leaf){const a=toW(T.door.at),n=nW(dr.n);S.entry[Bd.id]={D:null,at:[a[0],f0,a[1]],yaw:Math.atan2(n[0],n[1]),x:cw[0],z:cw[1]};}   /* an open doorway */
  /* walk in: the doors' blocks off while the plan and its flights are laid (as Qiblai's lots), then the doors unlocked */
  if(W){const Ds=[dr.D].concat(mores.map(M=>M.D)).filter(Boolean),on=Ds.map(D=>D.blocks.map(b=>!b.off));Ds.forEach(D=>W.setBlock(D.blocks,false));
   let ground=f0;
   if(dr.D){const D=dr.D,a=[D.at[0]+Math.sin(D.yaw)*1.2,D.at[2]+Math.cos(D.yaw)*1.2],ga=W.floorBelow(a[0],a[1],f0,.1);ground=Math.max(terrainH(a[0],a[1]),ga?ga[0]:-1e9);}
   else if(!Bd.door.leaf){const w=toW(T.door.at),n=nW(dr.n),a=[w[0]+n[0]*1.2,w[1]+n[1]*1.2],ga=W.floorBelow(a[0],a[1],f0,.1);ground=Math.max(terrainH(a[0],a[1]),ga?ga[0]:-1e9);}
   try{if(qnIxWalk(T,pose,W,ground,'interior:'+Bd.id)){B.walk=true;S.walked++;}}catch(e){B.fails.push('walk: '+(e&&e.message||e));}
   /* a flight in at each upper door, from the floor or ground outside it to its storey's floor */
   for(const M of T.more||[]){const wa=toW(M.at),wn=nW(M.n),fy=pose.y+M.y;
    const o=[wa[0]+wn[0]*1.2,wa[1]+wn[1]*1.2],ga=W.floorBelow(o[0],o[1],fy+.5,1),gy=Math.max(terrainH(o[0],o[1]),ga?ga[0]:-1e9),i=[wa[0]-wn[0]*.45,wa[1]-wn[1]*.45];
    if(Math.abs(fy-gy)>3.5){B.fails.push('the door on storey '+M.level+' stands '+(fy-gy).toFixed(1)+' m over what is outside it');continue;}
    W.strip({a:[o[0],o[1],gy],b:[i[0],i[1],fy],w:Math.max(.9,M.w-.1),name:'interior:'+Bd.id+'.door.'+M.level+'.'+B.entries,tag:'interior:'+Bd.id});B.entries++;}
   Ds.forEach((D,k)=>{D.blocks.forEach((b,j)=>W.setBlock(b,on[k][j]));D.locked=false;});}
  S.ms+=Math.round(performance.now()-tb);};
 /* the sheets' buildings with views (L, H, P: FE_ROOMS.atLoad) at load; the rest when the camera comes within FE_IX_NEAR of them,
    one a pass, as the Azure Dream's types are (90ai); buildAll() builds every one (verify.py) */
 FE_ROOMS.buildings.forEach((Bd,bi)=>{if(FE_ROOMS.atLoad.indexOf(Bd.id)>=0)buildOne(Bd,bi);});
 /* the Eye Post's platform: the 60 cm heliograph turned to the line (the Beacon at 245 degrees), and the fire basket round the
    record's coals; the catalog's pieces on the lantern's floor, registered where they stand */
 {const P=FE_ROOMS.platform,p=FE_PLACE.find(q=>q.id===P.part);if(p){const Y=(p.o.y==null?0:p.o.y)+P.y,b=KratorFurniture.batch({indexed:true}),out=[];
   for(const q of P.pieces){const at=q.at==='coals'?[-P.lw*.25,-P.lw*.25+.1]:q.at,w=loc(p.x,p.z,at[0],at[1],p.ry||0),ry=q.ry+(p.ry||0),E=KratorFurniture.FURN_BY_KEY[q.key]||{};
    T0.add({prefix:'ixf','class':'furniture',kind:E.type||null,key:q.key,name:E.name||null,at:[w[0],Y,w[1]],ry,size:E.w?[E.w,E.d,E.h]:undefined,
     tags:{setting:'room',culture:'xanadu',tier:E.tier||null,room:'post.platform',building:'post'},frag:'90fk-fe-interiors.js'});
    const r=b.place(q.key,w[0],Y,w[1],ry,{setting:'outdoor',building:'post',room:'post.platform'});out.push({key:q.key,at:[R2(w[0]),R2(Y),R2(w[1])],error:r.error||null});
    S.placed[q.key]=(S.placed[q.key]|0)+1;}
   const g=new THREE.Group();g.name='interior:post.platform';scene.add(g);b.flush(g);S.platform={pieces:out,y:R2(Y)};}}
 /* the way up from the Eye Post's Mirror Room to its platform: an iron ladder against a wall of the top storey where the room's
    pieces, its stairwell and its doors leave it 0.6 m, through a hatch in the ceiling (its frame drawn under it, its lid on the
    lantern's floor); in core/walk as rungs 0.4 m apart (as kits/interiors walks a ladder) and the lantern's floor inside its
    parapet, both the post's, so the walk-in check climbs it */
 {const P=FE_ROOMS.platform,Lr=P.ladder,T=S.T[Lr.building],p=FE_PLACE.find(q=>q.id===P.part),B=S.buildings.find(b=>b.id===Lr.building);
  if(T&&p&&B){const Lv=T.plan.levels[Lr.level],pose={x:p.x,z:p.z,y:p.o.y==null?0:p.o.y,ry:p.ry||0},rooms=T.plan.rooms.filter(r=>r.level===Lr.level);
   const inRect=(x,z,cx,cz,ry,w,d,m)=>{const dx=x-cx,dz=z-cz,c=Math.cos(ry),s=Math.sin(ry),u=dx*c-dz*s,v=dx*s+dz*c;return Math.abs(u)<w/2+m&&Math.abs(v)<d/2+m;};
   const pieces=(T.F.placed||[]).filter(q=>q.y>=Lv.y-.1&&q.y<Lv.y+Lv.h);let spot=null;
   for(const R of rooms){for(const Wl of R.walls){if(spot)break;const L=Wl.len;for(let u=.6;u<=L-.6&&!spot;u+=.2){
    const x=Wl.a[0]+Wl.t[0]*u+Wl.n[0]*.35,z=Wl.a[1]+Wl.t[1]*u+Wl.n[1]*.35,fx=x+Wl.n[0]*.5,fz=z+Wl.n[1]*.5;
    if(pieces.some(q=>{const sz=q.size||[.8,.8];return inRect(x,z,q.x,q.z,q.ry||0,sz[0],sz[1],.35)||inRect(fx,fz,q.x,q.z,q.ry||0,sz[0],sz[1],.3);}))continue;
    if(R.fixtures.some(f=>inRect(x,z,f.x,f.z,f.ry,f.w,f.d,.4)||inRect(fx,fz,f.x,f.z,f.ry,f.w,f.d,.3)))continue;
    if(R.doors.some(d=>Math.hypot(d.at[0]-x,d.at[1]-z)<d.w/2+.8))continue;
    spot={x,z,t:Wl.t,n:Wl.n,room:R.id};}}}
   if(spot){const y0=Lv.y,y1=P.y,iron=xC(0x34302c),ry=Math.atan2(-spot.t[1],spot.t[0]);
    T.G.add(kitDraw(()=>{for(const e of[-1,1])vB('vWood',spot.x+spot.t[0]*e*.25,y0,spot.z+spot.t[1]*e*.25,.05,y1-y0+.9,.05,ry,iron);
     for(let y=y0+.3;y<y1;y+=.3)vB('vWood',spot.x,y,spot.z,.5,.035,.035,ry,iron);
     vB('qLacqB',spot.x+spot.n[0]*.1,y0+Lv.h-.32,spot.z+spot.n[1]*.1,.8,.22,.75,ry,xC(0x2a2220));   /* the hatch's frame under the ceiling */
     vB('qPlankB',spot.x+spot.n[0]*.1,y1,spot.z+spot.n[1]*.1,.8,.04,.75,ry,xC(0x5a4030));}));   /* its lid on the lantern's floor */
    T.G.updateMatrixWorld(true);
    if(W){const tag='interior:'+Lr.building,f=toWp=>loc(pose.x,pose.z,toWp[0],toWp[1],pose.ry),a=f([spot.x+spot.n[0]*.5,spot.z+spot.n[1]*.5]),b=f([spot.x,spot.z]);
     const dx=b[0]-a[0],dz=b[1]-a[1],run=Math.hypot(dx,dz),ux=dx/run,uz=dz/run,px=-uz,pz=ux,rise=y1-y0;let n=Math.max(2,Math.ceil(rise/.4));
     while(n<120&&(Math.floor(.2*n/run)+1)*rise/n>.58)n++;
     for(let i=1;i<=n;i++){const u=i/n,cx=a[0]+dx*u,cz=a[1]+dz*u,y=pose.y+y0+rise*u,a0=-.3,a1=Math.hypot(b[0]-cx,b[1]-cz)+.35;
      W.poly({pts:[[cx+ux*a0-px*.25,cz+uz*a0-pz*.25,y],[cx+ux*a1-px*.25,cz+uz*a1-pz*.25,y],[cx+ux*a1+px*.25,cz+uz*a1+pz*.25,y],[cx+ux*a0+px*.25,cz+uz*a0+pz*.25,y]],name:'post.ladder.rung'+i,tag});}
     const h=P.lw/2-.25;W.poly({pts:[[-h,-h],[h,-h],[h,h],[-h,h]].map(q=>f(q).concat(pose.y+y1)),name:'post.platform.floor',tag});}
    S.ladder={room:spot.room,at:[R2(spot.x),R2(spot.z)],n:[R2(spot.n[0]),R2(spot.n[1])],t:[R2(spot.t[0]),R2(spot.t[1])],rungs:true};}
   else B.fails.push('no room for the ladder to the platform');}}
 window._instances=inst0;
 const FE_IX_NEAR=90,lazy=FE_ROOMS.buildings.map((Bd,bi)=>{const p=FE_PLACE.find(q=>q.id===Bd.part);if(!p||built.has(Bd.id))return null;
  const S0=typeof Bd.shell==='function'?Bd.shell(p.o):Bd.shell,c=loc(p.x,p.z,S0.x,S0.z,p.ry||0);return{Bd,bi,x:c[0],z:c[1]};}).filter(Boolean);
 S.lazy=lazy.length;
 S.buildAll=function(){const i0=window._instances;for(const L of lazy)buildOne(L.Bd,L.bi);window._instances=i0;report();return window._feIx;};
 let tick=0;FRAME_HOOKS.push(()=>{if((tick++)%6||built.size>=FE_ROOMS.buildings.length)return;const P=camera.position;
  for(const L of lazy){if(built.has(L.Bd.id)||Math.hypot(P.x-L.x,P.z-L.z)>FE_IX_NEAR)continue;const i0=window._instances;buildOne(L.Bd,L.bi);window._instances=i0;report();break;}});
 /* the walk-in check: for each building, the door it is entered by shut blocks the doorway, opened clears it, and a walker from
    outside reaches every floor and stair of it; the doors shut again after. The walker starts 2.6 m out, or nearer where the
    ground the door opens onto ends sooner (the Hall of the Ember's porch, 2 m from its terrace's edge) or a wall stands */
 S.walkIn=function(){const out=[];if(!W)return[{id:'-',ok:false,why:'no core/walk on the page'}];
  for(const b of S.buildings){const E=S.entry[b.id];if(!E){out.push({id:b.id,ok:false,why:'no door to enter by'});continue;}const D=E.D||{at:E.at,yaw:E.yaw},tag='interior:'+b.id;
   let shut=true,open=true;   /* an open doorway: nothing to shut */
   if(E.D){KDOOR.close(D);for(let i=0;i<40;i++)KDOOR.step(.1);shut=!!W.blocked(D.at[0],D.at[1]+.1,D.at[2],.3,1.6);
    KDOOR.open(D,{by:'player'});for(let i=0;i<40;i++)KDOOR.step(.1);open=!W.blocked(D.at[0],D.at[1]+.1,D.at[2],.3,1.6);}
   const gAt=k=>{const x=D.at[0]+Math.sin(D.yaw)*k,z=D.at[2]+Math.cos(D.yaw)*k,f=W.floorBelow(x,z,D.at[1]+.3,.6);return Math.max(terrainH(x,z),f?f[0]:-1e9);};
   const clear=k=>{const x=D.at[0]+Math.sin(D.yaw)*k,z=D.at[2]+Math.cos(D.yaw)*k;return!W.blocked(x,gAt(k)+.1,z,.35,1.6);};
   let k=2.6;const g1=gAt(1.2);while(k>1.2&&(Math.abs(gAt(k)-g1)>.45||!clear(k)))k-=.2;   /* nearer where the ground ends or a wall stands (a lane behind the Assembly Hall) */
   const sx=D.at[0]+Math.sin(D.yaw)*k,sz=D.at[2]+Math.cos(D.yaw)*k,sf=W.floorBelow(sx,sz,D.at[1]+.3,.6);
   const R=W.reach([[sx,Math.max(terrainH(sx,sz),sf?sf[0]:-1e9),sz]],{ground:terrainH,box:[E.x-45,E.x+45,E.z-45,E.z+45]}),mine=F=>F.tag===tag;
   const un=R.unreached.filter(mine).map(F=>F.name.split('.').slice(-3).join('.'));if(E.D){KDOOR.close(D);for(let i=0;i<40;i++)KDOOR.step(.1);}
   out.push({id:b.id,shut,open,floors:R.reached.filter(mine).length,unreached:un,ok:shut&&open&&!un.length&&R.reached.some(mine)});}
  return out;};
 report();return S;})();
