// ================================================================= GRĒṬ-ĀIL — the great monastery's great rooms, walked into
// The Order's great monastery (qb_monastery v5, the blue spoke, on the monastery terrace) as Qiblai's city walks into each of its
// own (settlements/qiblai targets/city 90t, the monastery part, here over this page's one): its court on the 1.2 m plinth and
// the flight up to its gate in core/walk; the assembly hall (the kit's qb_ix_assembly, 24 x 17 m, 5 m to its ceiling, at the
// court's head), where the Order's chapter meets, and the gate hall in the gate tower (qb_ix_gatehall, the four guardian kings),
// a door at each end. Each room is the kit's interior piece drawn in place (o.cut false) and furnished by the kit's pass
// (qnFurnishRooms: the catalog's pieces), the first time the camera comes within AD_GR_NEAR, shown while within AD_GR_FAR; its
// floor, walls gapped at its doors and its entry flights are in core/walk from the start, its drawn doors unlocked. The cell
// ranges round the court are 90ai's (the monks' programme). window._adGreat reports; buildAll() and walkIn() are verify.py's.
// [web]: the rooms draw; the walk records are plain data.
reseed(34175);
const AD_GR_NEAR=70,AD_GR_FAR=160;
const AD_GREAT=(function(){const S={rooms:[],built:0,pieces:0,fails:[],byRoom:[],missing:{},tex:{meshes:0,mapped:0,bare:[]},ms:0,bulbs:0};
 const report=()=>{window._adGreat={rooms:S.rooms.map(R=>({name:R.name,key:R.key,built:R.built})),built:S.built,pieces:S.pieces,fails:S.fails.slice(0,8),
  missing:S.missing,tex:S.tex,ms:S.ms,walk:S.walk,bulbs:S.bulbs,buildAll:S.buildAll,walkIn:S.walkIn};};
 const m=AD_PLACE.find(p=>p.id==='great-monastery');
 if(!VERN.defs.qb_ix_assembly||!m||m.key!=='qb_monastery'){S.error='no great monastery or no kit interiors';report();return S;}
 // a room inside the monastery: (lx, lz, ly) the storey's centre and base in its frame; doors [[x, z (+D/2 the front), w]]
 const add=(name,key,lx,lz,ly,o,doors)=>{const p=loc(m.x,m.z,lx,lz,m.ry),by=qcDflt(m.o.y,0);
  S.rooms.push({name,key,x:p[0],z:p[1],ry:m.ry,o:Object.assign({cut:false,y:by+ly},o),cx:p[0],cy:by+ly+o.H/2,cz:p[1],G:null,built:false,
   doors:doors||[[0,o.D/2,3]],portals:[],leaves:[],entries:[]});return S.rooms[S.rooms.length-1];};
 const inset=.9,my=qcDflt(m.o.y,0);
 add('Assembly hall of the Azure Dream','qb_ix_assembly',0,-26+7+2.2+8.5,1.8,{W:24-inset,D:17-inset,H:5.0,v:m.o.v});
 add('Gate hall of the Azure Dream','qb_ix_gatehall',0,26-3.5,1.2,{W:10-inset,D:8-inset,H:4.4,v:m.o.v},[[0,(8-inset)/2,2.6],[0,-(8-inset)/2,2.6]]);
 // the walk records: the court and its gate's flight, then each room's floor, walls (gapped at its doors), doors and entries
 const KW=typeof KWALK!=='undefined'?KWALK:null;S.walk={floors:0,blocks:0,flights:0,doors:0,portals:0};
 const near=(x,y,z,r)=>{let best=null,bd=r*r;for(const D of KDOOR.list){if(Math.abs(D.at[1]-y)>1.3)continue;const d=(D.at[0]-x)**2+(D.at[2]-z)**2;if(d<bd){bd=d;best=D;}}return best;};
 const rect=(x,z,ry,w,d,y,name)=>{const P=[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]].map(q=>loc(x,z,q[0],q[1],ry).concat(y));KW.poly({pts:P,name,tag:name});S.walk.floors++;};
 const flight=(a,b,w,name)=>{KW.strip({a,b,w,name,tag:name});S.walk.flights++;};
 if(KW){const P=1.2,W=52,D=52,tag='monastery:'+m.id;
  rect(m.x,m.z,m.ry,W,D,my+P,tag+'.court');
  const N=Math.max(2,Math.round(P/.17)),z1=D/2+.5,z0=z1+N*.34,a=loc(m.x,m.z,0,z0,m.ry),b=loc(m.x,m.z,0,z1-.3,m.ry);
  flight([a[0],a[1],terrainH(a[0],a[1])],[b[0],b[1],my+P],4,tag+'.gate');
  for(const R of S.rooms){const y=R.o.y+.06,W=R.o.W,D=R.o.D,H=R.o.H,tag='room:'+R.key+'@'+Math.round(R.x)+','+Math.round(R.z),f=(u,v)=>loc(R.x,R.z,u,v,R.ry);
   rect(R.x,R.z,R.ry,W-.6,D-.6,y,tag+'.floor');
   const gaps=R.doors.map(d=>f(d[0],d[1]).concat(d[2]/2+.1)),edges=[[[-W/2,D/2],[W/2,D/2]],[[W/2,D/2],[W/2,-D/2]],[[W/2,-D/2],[-W/2,-D/2]],[[-W/2,-D/2],[-W/2,D/2]]];
   for(const [A,B] of edges){const Ln=Math.hypot(B[0]-A[0],B[1]-A[1]),n=Math.ceil(Ln/.15);
    for(let i=0;i<n;i++){const u=(i+.5)/n,q=f(A[0]+(B[0]-A[0])*u,A[1]+(B[1]-A[1])*u);if(gaps.some(g=>Math.hypot(q[0]-g[0],q[1]-g[1])<g[2]))continue;
     KW.block([q[0]-.075,q[0]+.075,q[1]-.075,q[1]+.075,y-.06,y+H],tag+'.wall');S.walk.blocks++;}}
   for(const d of R.doors){const n0=Math.abs(d[1])>=D/2-.01?[0,d[1]>0?1:-1]:[d[0]>0?1:-1,0],fo=.45,c=Math.cos(R.ry),s=Math.sin(R.ry);
    const nx=n0[0]*c+n0[1]*s,nz=-n0[0]*s+n0[1]*c,face=f(d[0]+n0[0]*fo,d[1]+n0[1]*fo);let at=face,w=d[2];
    const Dd=near(face[0],y-.06,face[1],2.2);if(!Dd)continue;Dd.locked=false;S.walk.doors++;R.portals.push(Dd);R.leaves.push(Dd);at=[Dd.at[0],Dd.at[2]];w=Dd.w;
    R.entries.push({at,n:[nx,nz],y});
    /* outside: the floor there (the court) or the ground; a flight when the sill stands more than a step over it */
    const ox=at[0]+nx*1.5,oz=at[1]+nz*1.5,fb=KW.floorBelow(ox,oz,y,.1),gy=Math.max(terrainH(ox,oz),fb?fb[0]:-1e9),rise=y-gy;
    if(rise>.45&&rise<3.5){const len=Math.max(.9,rise*1.4);flight([at[0]+nx*len,at[1]+nz*len,gy],[at[0]-nx*.6,at[1]-nz*.6,y],Math.min(2,w),tag+'.entry');}}}}
 // a room drawn, baked and furnished: the kit's piece in place, the rooms' bulbs into the light pool (AD_LAMPS, 'bulb')
 S.build=function(R){if(R.built)return R;const t0=performance.now(),G=new THREE.Group();G.name='interior:'+R.key;scene.add(G);
  const r0=QB_ROOMS.length;TSTAT.cur=R.key+'/0';VERN.place(G,R.key,R.x,R.z,R.ry,R.o);TSTAT.cur=null;
  const bulbs=[];QB_BULB_SINK=bulbs;for(const Rm of QB_ROOMS.slice(r0))qnIxBulbs(Rm.poly,Rm.y,Rm.h);QB_BULB_SINK=null;
  for(const b of bulbs){AD_LAMPS.push([b[0],b[1],b[2],'bulb','interior:'+R.key]);S.bulbs++;}
  kbake(G);for(const n in KIT.items)KIT.items[n].length=0;
  const F=qnFurnishRooms(QB_ROOMS.slice(r0),G,{seed:34176+S.rooms.indexOf(R),frag:'90aj-ad-great-rooms.js',name:'furniture:'+R.key,perType:3,passes:2,backtrack:4});
  G.traverse(q=>{if(q.isMesh)q.renderOrder=-2;});   /* drawn before the doorways' portals and the body */
  for(const Dd of R.portals){const n=[Math.sin(Dd.yaw),Math.cos(Dd.yaw)];G.add(qnIxPortal(Dd.at[0]-n[0]*.028,Dd.at[1],Dd.at[2]-n[1]*.028,Dd.yaw,Dd.w,Dd.h));S.walk.portals++;}
  R.G=G;R.built=true;S.built++;S.pieces+=F.pieces;S.fails=S.fails.concat(F.fails);S.byRoom=S.byRoom.concat(F.byRoom);
  for(const k in F.missing)S.missing[k]=qcDflt(S.missing[k],0)+F.missing[k];
  if(F.tex){S.tex.meshes+=F.tex.meshes;S.tex.mapped+=F.tex.mapped;S.tex.bare=S.tex.bare.concat(F.tex.bare).slice(0,12);}
  S.ms+=Math.round(performance.now()-t0);report();return R;};
 S.buildAll=function(){S.rooms.forEach(S.build);return window._adGreat;};
 // the walk-in check: every room's drawn doors and the monastery's gate opened, a walker from the terrace before the gate reaches
 // the court, the gate hall and the assembly hall. The doors are shut again after
 S.walkIn=function(){if(!KW)return{error:'no core/walk on the page'};const all=[].concat(...S.rooms.map(R=>R.leaves)),step=()=>{for(let i=0;i<40;i++)KDOOR.step(.1);};
  for(const Dd of all)KDOOR.open(Dd,{by:'player'});
  const gp=loc(m.x,m.z,0,26.5,m.ry),g=KDOOR.list.find(D=>!D.locked&&D.key===m.key&&Math.hypot(D.at[0]-gp[0],D.at[2]-gp[1])<1.5);if(g){all.push(g);KDOOR.open(g,{by:'player'});}
  step();const mine=(Rr,pre)=>Rr.reached.some(F=>F.tag.indexOf(pre)===0),fl=R=>'room:'+R.key+'@'+Math.round(R.x)+','+Math.round(R.z);
  const s=loc(m.x,m.z,0,26+4,m.ry),r=36,Rr=KW.reach([[s[0],terrainH(s[0],s[1]),s[1]]],{ground:terrainH,box:[m.x-r,m.x+r,m.z-r,m.z+r]});
  const miss=S.rooms.filter(R=>!mine(Rr,fl(R))).map(R=>R.name);if(!mine(Rr,'monastery:'+m.id+'.court'))miss.unshift('the court');
  for(const Dd of all)KDOOR.close(Dd);step();
  return{gate:!!g,doors:all.length,ok:!miss.length,miss,reached:S.rooms.length-miss.length};};
 FRAME_HOOKS.push(()=>{const P=camera.position;for(const R of S.rooms){const d=Math.hypot(P.x-R.cx,P.y-R.cy,P.z-R.cz);
  if(!R.built&&d<AD_GR_NEAR){try{S.build(R);}catch(e){R.built=true;reportErr('azure-dream great room '+R.name+': '+(e&&e.stack||e));}}
  if(R.G)R.G.visible=d<AD_GR_FAR;}});
 report();return S;})();
