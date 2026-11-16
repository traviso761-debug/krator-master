// TARGET: city — the walk-in interiors, on demand (the owner, 2026-11-15: "work on interiors", walk-in, on demand; PLAN.md
// section 4: "the interiors only on demand (a monastery's hall, the Hall of the Decree, a hostel), not city-wide")
// Four rooms inside their own buildings, each the kit's interior piece drawn in place (kits/qiblai src/89q5: o.cut false, the
// building's storey plan less its walls, its storey height) and furnished by the kit's pass (qnFurnishRooms, 89q5f):
//   the sanctum of the Rainbow Temple   the temple's sanctum storey on the third terrace (qb_temple, 89q4)
//   the council chamber                 the Hall of the Decree's ground storey (qb_hall_decree, the Temple Mountain's NW quarter)
//   the assembly halls                  every great monastery's hall, whole and half, in its spoke's colours (the owner,
//                                       2026-11-16: "fancy interiors to shrines, monasteries, and anything else")
//   the gate halls                      the passage through each whole monastery's gate tower (the four guardian kings)
//   a hostel dormitory                  the ground storey of the pilgrims' hostel nearest the south avenue on the kora
// Nothing is built at load: a room is placed, baked and furnished into a group of its own the first time the camera comes
// within QC_IX_NEAR of it, and shown while within QC_IX_FAR. window._qiblaiIx reports them; buildAll() builds every one (the
// verify's check).
// Walk in (the owner, 2026-11-16: "unlock the front doors so I can walk in"): each room's floor, its walls gapped at its doors,
// in core/walk (KWALK) from the start; the building's drawn door at each gap (core/door's record nearest it) unlocked, so E
// opens it, with a depth-only pane in it (qnIxPortal) once the room is built, so the room shows through the open door; a flight
// up from the ground (or the floor) outside where the sill stands higher than a step. A great monastery's court is a floor on its
// plinth, with a flight up from the street to its gate (whose door opens: the gate hall in a whole one, the low wall's in a half).
const QC_IX_NEAR=70,QC_IX_FAR=160;
const QC_IX=(function(){const S={rooms:[],built:0,pieces:0,fails:[],byRoom:[],missing:{},tex:{meshes:0,mapped:0,bare:[]},ms:0};
 const report=()=>{window._qiblaiIx={rooms:S.rooms.map(R=>({name:R.name,key:R.key,built:R.built,at:[+R.cx.toFixed(1),+R.cy.toFixed(1),+R.cz.toFixed(1)]})),
  built:S.built,pieces:S.pieces,fails:S.fails.slice(0,8),byRoom:S.byRoom,missing:S.missing,tex:S.tex,ms:S.ms,walk:S.walk,buildAll:S.buildAll,walkIn:S.walkIn};};
 if(!VERN.defs.qb_ix_sanctum||!QC_LM){report();return S;}
 // a room inside a building: (bx, bz, bry) the building's plot, (lx, lz, ly) the storey's centre and base in its frame
 const add=(name,key,bx,bz,bry,by,lx,lz,ly,o,host,doors)=>{const p=loc(bx,bz,lx,lz,bry);   /* host: the lot it stands in (90u leaves that lot's own interior out); doors [[x, z (+D/2 the front), w]] */
  S.rooms.push({name,key,x:p[0],z:p[1],ry:bry,o:Object.assign({cut:false,y:by+ly},o),cx:p[0],cy:by+ly+o.H/2,cz:p[1],G:null,built:false,host:host||null,
   doors:doors||[[0,o.D/2,3]],portals:[],arches:[],leaves:[],entries:[],via:null});return S.rooms[S.rooms.length-1];};
 const L=QC_LM,LY=qcD(L.level,0),inset=.9;
 // the temple's sanctum: 28 m square, on the third of three 6 m terraces (each 0.3 m over the last's roof), its storey 5.2 m;
 // the terrace's roof plate runs on under it (0.98 m over the storey's base) and its own roof slab hangs 0.8 m into it, so the
 // room stands on the plate, 3.3 m to its ceiling (measured by a ray down the drawn temple, 2026-11-15)
 add('Sanctum of the Rainbow Temple','qb_ix_sanctum',L.x,L.z,0,LY,0,0,3*(6+.3)+1.0,{W:28-inset,D:28-inset,H:3.3});
 // the Hall of the Decree: at (-100, -100) in the Temple Mountain, its storey 40 x 28 m on a 2.2 m plinth, set 3 m back
 add('Council chamber of the Prismarchy','qb_ix_hall',L.x-100,L.z-100,0,LY,0,-3,2.2,{W:40-inset,D:28-inset,H:6.0,sideDoors:true},null,
  [[0,(28-inset)/2,3.6],[-(40-inset)*.225,(28-inset)/2,1.8],[(40-inset)*.225,(28-inset)/2,1.8]]);
 // every great monastery's assembly hall, in its spoke's colours: a whole one's 24 x 17 m, its storey 5 m on the court's 1.2 m
 // and its own 0.6 m plinth, 8.3 m back; a half's 22 x 12 m, 4.6 m on 1.2 + 0.5 m, 3.4 m back. A whole one's gate hall: the
 // gate tower's ground storey (10 x 8 m on the 1.2 m plinth, its front 26.5 m out), a door at each end
 const halfN={};
 for(const m of QC_PLACE.filter(p=>p.kind==='monastery')){const my=qcD(m.o.y,0),SPn=QSPOKE[m.o.v%8].name;
  if(m.key==='qb_monastery'){add('Assembly hall ('+SPn+')','qb_ix_assembly',m.x,m.z,m.ry,my,0,-26+7+2.2+8.5,1.8,{W:24-inset,D:17-inset,H:5.0,v:m.o.v},m);
   add('Gate hall ('+SPn+')','qb_ix_gatehall',m.x,m.z,m.ry,my,0,26-3.5,1.2,{W:10-inset,D:8-inset,H:4.4,v:m.o.v},m,[[0,(8-inset)/2,2.6],[0,-(8-inset)/2,2.6]]);}
  else{halfN[SPn]=qcD(halfN[SPn],0)+1;add('Assembly hall ('+SPn+', '+(halfN[SPn]===1?'first':'second')+' half)','qb_ix_assembly',m.x,m.z,m.ry,my,0,-3.4,1.7,{W:22-inset,D:12-inset,H:4.6,v:m.o.v},m);}}
 // the hostel nearest the south avenue on the kora: its storey 24 x 14 m, 3.6 m on a 0.7 m plinth, 1 m back
 const hs=QC_PLACE.filter(p=>p.key==='qb_hostel'&&p.z>L.z).sort((a,b)=>(Math.abs(a.x-L.x)-Math.abs(b.x-L.x))||(a.z-b.z));
 if(hs.length){const h=hs[0];add('Hostel dormitory','qb_ix_hostel',h.x,h.z,h.ry,qcD(h.o.y,0),0,-1,.7,{W:24-inset,D:14-inset,H:3.6},h);}
 // the rest (the owner, 2026-11-16: "finish all interiors"). A door's 4th entry: 'arch' (an open way through a gate block's dark
 // passage: a depth-only pane on the block's face, R.o.faceOff past the room's end, and any leaves in it unlocked) or 'in' (a
 // door from another room: a gap only). The treasury's strong room: its ground storey, 24 x 20 m on a 1.6 m plinth, 1 m back,
 // at (-100, +100) in the Temple Mountain, turned to face its court
 add('Treasury strong room','qb_ix_vault',L.x-100,L.z+100,Math.PI,LY,0,-1,1.6,{W:24-inset,D:20-inset,H:4.6},null,[[0,(20-inset)/2,2.2]]);
 // each city gate's passage (26 x 14 m, its arch 6 x 7.5; an inner ring's 16 x 8, 4 x 5) and a guard room either side of it,
 // its door from the passage; the caravanserai's gate passage (4 x 4.2 through its 7.6 m gate block); each gate market's two
 // (3.6 x 3.6 through its front and back ranges)
 for(const g of QC_EXTRA.filter(p=>p.kind==='gate')){const inner=g.o.v===1,W=inner?16:26,D=inner?8:14,pw=inner?4:6,ph=inner?5:7.5,gy=qcD(g.o.y,0),pW=pw-.3,pD=D+.6;
  const P=add('Gate passage ('+g.id+')','qb_ix_passage',g.x,g.z,g.ry,gy,0,0,0,{W:pW,D:pD,H:ph-.1,dh:ph-.3,guard:true,v:g.o.v,faceOff:.112},g,
   [[0,pD/2,pW,'arch'],[0,-pD/2,pW,'arch'],[pW/2,0,1.2,'in'],[-pW/2,0,1.2,'in']]);
  const gw=(W-pw)/2-.9;for(const s of[-1,1]){const R=add('Guard room ('+g.id+(s<0?', west':', east')+')','qb_ix_guardroom',g.x,g.z,g.ry,gy,s*(pw/2+.3+gw/2),0,0,{W:gw,D:D-.9,H:3.4,side:s>0?'w':'e',v:g.o.v},g,[[s>0?-gw/2:gw/2,0,1.2,'in']]);R.via=P;}}
 for(const c of QC_EXTRA.filter(p=>p.kind==='caravanserai'))add('Caravanserai gate passage','qb_ix_passage',c.x,c.z,c.ry,qcD(c.o.y,0),0,22-3.25,.6,{W:3.7,D:7.4,H:4.1,dh:3.9,v:0,faceOff:.112},c,[[0,3.7,3.7,'arch'],[0,-3.7,3.7,'arch']]);
 for(const m of QC_PLACE.filter(p=>p.kind==='market')){const D=m.key==='qb_gate_market_half'?32:44;for(const s of[1,-1])
  add('Gate market passage ('+m.id+(s>0?', front':', back')+')','qb_ix_passage',m.x,m.z,m.ry,qcD(m.o.y,0),0,s*(D/2-3),.5,{W:3.3,D:5.9,H:3.5,dh:3.3,v:0,faceOff:.112},m,[[0,2.95,3.3,'arch'],[0,-2.95,3.3,'arch']]);}
 // the walk records (core/walk): each monastery's court and its gate's flight, then each room's floor, walls, doors and flights
 const KW=typeof KWALK!=='undefined'?KWALK:null;S.walk={floors:0,blocks:0,flights:0,doors:0,portals:0};
 const near=(x,y,z,r)=>{let best=null,bd=r*r;for(const D of KDOOR.list){if(Math.abs(D.at[1]-y)>1.3)continue;const d=(D.at[0]-x)**2+(D.at[2]-z)**2;if(d<bd){bd=d;best=D;}}return best;};
 const rect=(x,z,ry,w,d,y,name)=>{const P=[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]].map(q=>loc(x,z,q[0],q[1],ry).concat(y));KW.poly({pts:P,name,tag:name});S.walk.floors++;};
 const flight=(a,b,w,name)=>{KW.strip({a,b,w,name,tag:name});S.walk.flights++;};
 if(KW){for(const m of QC_PLACE.filter(p=>p.kind==='monastery')){const my=qcD(m.o.y,0),P=1.2,whole=m.key==='qb_monastery',W=whole?52:56,D=whole?52:32,tag='monastery:'+m.id;
   rect(m.x,m.z,m.ry,W,D,my+P,tag+'.court');
   const N=Math.max(2,Math.round(P/.17)),z1=whole?D/2+.5:D/2-.1,z0=z1+N*.34,a=loc(m.x,m.z,0,z0,m.ry),b=loc(m.x,m.z,0,z1-.3,m.ry);
   flight([a[0],a[1],terrainH(a[0],a[1])],[b[0],b[1],my+P],whole?4:4.6,tag+'.gate');
   if(!whole){const g=loc(m.x,m.z,0,D/2-.1,m.ry),Dg=near(g[0],my+P,g[1],1.6);if(Dg){Dg.locked=false;S.walk.doors++;}}}   /* the low wall's gate: no room behind it */
  /* the caravanserai's court (44 m on its 0.6 m plinth) and the flight to its gate; each gate market's court (on 0.5 m) */
  for(const c of QC_EXTRA.filter(p=>p.kind==='caravanserai')){const cy=qcD(c.o.y,0),N=Math.max(2,Math.round(.6/.17)),a=loc(c.x,c.z,0,22.5+N*.34,c.ry),b=loc(c.x,c.z,0,22.2,c.ry);
   rect(c.x,c.z,c.ry,44,44,cy+.6,'caravanserai.court');flight([a[0],a[1],terrainH(a[0],a[1])],[b[0],b[1],cy+.6],5,'caravanserai.gate');}
  /* the terrace stairs before each gate's lower side (90r, kits/qiblai qb_terrace_stair): each landing a floor, each flight a
     strip, in the stair's own layout (qnStairPlan) */
  for(const st of QC_EXTRA.filter(p=>p.kind==='stair')){const sy=qcD(st.o.y,0),w=st.o.w,P=(z)=>loc(st.x,st.z,0,z,st.ry);
   for(const s of qnStairPlan(st.o.rise).segs){if(s.k==='land'){const z0=s.z0?s.z0:-.8;rect(...P((z0+s.z1)/2),st.ry,w,s.z1-z0+.02,sy+s.y,st.id+'.land');continue;}   /* the top landing reaches 0.8 m back into the arch, over the passage floor's inset */
    const a=P(s.z0),b=P(s.z1);flight([a[0],a[1],sy+s.y0],[b[0],b[1],sy+s.y1],w,st.id+'.flight');}}
  for(const m of QC_PLACE.filter(p=>p.kind==='market'))rect(m.x,m.z,m.ry,44,m.key==='qb_gate_market_half'?32:44,qcD(m.o.y,0)+.5,'market:'+m.id+'.court');
  /* the great wheel house (20 m square on 1.4 m, open on its four sides, a flight up the middle of each): its floor, the flights,
     the wheel and the four corner piers as blocks; each lot's wheel house (10 x 10 m on 0.8 m, open at the front): its floor and
     a flight up to its open front */
  {const x=L.x+100,z=L.z-100,P=1.4,run=Math.max(2,Math.round(P/.17))*.34;rect(x,z,0,20,20,LY+P,'greatwheel.floor');
   for(let a=0;a<4;a++){const ry=a*Math.PI/2,f=loc(x,z,0,10+run,ry),h=loc(x,z,0,9.4,ry);flight([f[0],f[1],terrainH(f[0],f[1])],[h[0],h[1],LY+P],5.6,'greatwheel.flight'+a);}
   KW.block([x-4.7,x+4.7,z-4.7,z+4.7,LY+P,LY+P+10],'greatwheel.wheel');for(const sx of[-1,1])for(const sz of[-1,1])KW.block([x+sx*8-1.8,x+sx*8+1.8,z+sz*8-1.8,z+sz*8+1.8,LY+P,LY+P+12],'greatwheel.pier');S.walk.blocks+=5;}
  for(const w of QC_PLACE.filter(p=>p.key==='qb_wheel_house')){const wy=qcD(w.o.y,0),f=loc(w.x,w.z,0,6.2,w.ry),h=loc(w.x,w.z,0,4.2,w.ry),c=loc(w.x,w.z,0,-.8,w.ry);
   rect(...loc(w.x,w.z,0,-.5,w.ry),w.ry,11,10,wy+.8,'wheelhouse:'+w.id+'.floor');flight([f[0],f[1],terrainH(f[0],f[1])],[h[0],h[1],wy+.8],4,'wheelhouse:'+w.id+'.flight');
   KW.block([c[0]-2.3,c[0]+2.3,c[1]-2.3,c[1]+2.3,wy+.8,wy+7],'wheelhouse:'+w.id+'.wheel');S.walk.blocks++;}
  /* the Rainbow Temple's three terraces (kits/qiblai 89q4: 90, 66, 44 m square, 6 m each, 0.3 m apart, the roof plate 0.98 m
     over each) as floors, and the flight up the middle of each face (8 m wide, its run 11.9 m) as a strip from the floor at its
     foot to the terrace's top: so the sanctum's door is walked to */
  if(S.rooms.some(R=>R.key==='qb_ix_sanctum')){const run=Math.max(2,Math.round(6/.17))*.34;let below=null;
   [90,66,44].forEach((w,i)=>{const top=LY+i*6.3+6.98;rect(L.x,L.z,0,w,w,top,'temple.terrace'+i);
    for(let a=0;a<4;a++){const ry=a*Math.PI/2,f=loc(L.x,L.z,0,w/2+run,ry),h=loc(L.x,L.z,0,w/2-.6,ry);flight([f[0],f[1],below==null?terrainH(f[0],f[1]):below],[h[0],h[1],top],7.6,'temple.flight'+i+'.'+a);}
    below=top;});}
  for(const R of S.rooms){const y=R.o.y+.06,W=R.o.W,D=R.o.D,H=R.o.H,tag='room:'+R.key+'@'+Math.round(R.x)+','+Math.round(R.z),f=(u,v)=>loc(R.x,R.z,u,v,R.ry);
   rect(R.x,R.z,R.ry,W-.6,D-.6,y,tag+'.floor');
   const gaps=R.doors.map(d=>f(d[0],d[1]).concat(d[2]/2+.1)),edges=[[[-W/2,D/2],[W/2,D/2]],[[W/2,D/2],[W/2,-D/2]],[[W/2,-D/2],[-W/2,-D/2]],[[-W/2,-D/2],[-W/2,D/2]]];
   for(const [A,B] of edges){const Ln=Math.hypot(B[0]-A[0],B[1]-A[1]),n=Math.ceil(Ln/.15);
    for(let i=0;i<n;i++){const u=(i+.5)/n,q=f(A[0]+(B[0]-A[0])*u,A[1]+(B[1]-A[1])*u);if(gaps.some(g=>Math.hypot(q[0]-g[0],q[1]-g[1])<g[2]))continue;
     KW.block([q[0]-.075,q[0]+.075,q[1]-.075,q[1]+.075,y-.06,y+H],tag+'.wall');S.walk.blocks++;}}
   for(const d of R.doors){const kind=d[3]||null;if(kind==='in')continue;
    const n0=Math.abs(d[1])>=D/2-.01?[0,d[1]>0?1:-1]:[d[0]>0?1:-1,0],fo=R.o.faceOff==null?.45:R.o.faceOff,c=Math.cos(R.ry),s=Math.sin(R.ry);
    const nx=n0[0]*c+n0[1]*s,nz=-n0[0]*s+n0[1]*c,face=f(d[0]+n0[0]*fo,d[1]+n0[1]*fo);let at=face,w=d[2];
    if(kind==='arch'){R.arches.push({x:face[0],y:y-.06,z:face[1],yaw:Math.atan2(nx,nz),w:d[2],h:R.o.dh});
     for(const Dl of KDOOR.list)if(Math.abs(Dl.at[1]-(y-.06))<.6&&Math.hypot(Dl.at[0]-face[0],Dl.at[2]-face[1])<d[2]/2+.8){Dl.locked=false;R.leaves.push(Dl);S.walk.doors++;}}   /* a city gate's leaves */
    else{const Dd=near(face[0],y-.06,face[1],2.2);if(!Dd)continue;Dd.locked=false;S.walk.doors++;R.portals.push(Dd);R.leaves.push(Dd);at=[Dd.at[0],Dd.at[2]];w=Dd.w;}
    R.entries.push({at,n:[nx,nz],y});
    /* outside: the floor there (a court, a terrace) or the ground; a flight when the sill stands more than a step over it */
    const ox=at[0]+nx*1.5,oz=at[1]+nz*1.5,fb=KW.floorBelow(ox,oz,y,.1),gy=Math.max(terrainH(ox,oz),fb?fb[0]:-1e9),rise=y-gy;
    if(rise>.45&&rise<3.5){const len=Math.max(.9,rise*1.4);flight([at[0]+nx*len,at[1]+nz*len,gy],[at[0]-nx*.6,at[1]-nz*.6,y],Math.min(2,w),tag+'.entry');}}}}
 S.build=function(R){if(R.built)return R;const t0=performance.now(),G=new THREE.Group();G.name='interior:'+R.key;scene.add(G);
  const r0=QB_ROOMS.length;TSTAT.cur=R.key+'/0';VERN.place(G,R.key,R.x,R.z,R.ry,R.o);TSTAT.cur=null;
  for(const Rm of QB_ROOMS.slice(r0))qnIxBulbs(Rm.poly,Rm.y,Rm.h);   /* electric light (the owner: "in buildings except in poor areas") */
  kbake(G);for(const n in KIT.items)KIT.items[n].length=0;
  const F=qnFurnishRooms(QB_ROOMS.slice(r0),G,{seed:33861+S.rooms.indexOf(R),frag:'90t-qc-interiors.js',name:'furniture:'+R.key,perType:3,passes:2,backtrack:4});
  G.traverse(q=>{if(q.isMesh)q.renderOrder=-2;});   /* drawn before the doorways' portals and the body */
  for(const Dd of R.portals){const n=[Math.sin(Dd.yaw),Math.cos(Dd.yaw)];G.add(qnIxPortal(Dd.at[0]-n[0]*.028,Dd.at[1],Dd.at[2]-n[1]*.028,Dd.yaw,Dd.w,Dd.h));S.walk.portals++;}
  for(const A of R.arches){G.add(qnIxPortal(A.x,A.y,A.z,A.yaw,A.w,A.h));S.walk.portals++;}   /* an arch's pane on the gate block's face */
  R.G=G;R.built=true;S.built++;S.pieces+=F.pieces;S.fails=S.fails.concat(F.fails);S.byRoom=S.byRoom.concat(F.byRoom);
  for(const k in F.missing)S.missing[k]=qcD(S.missing[k],0)+F.missing[k];
  if(F.tex){S.tex.meshes+=F.tex.meshes;S.tex.mapped+=F.tex.mapped;S.tex.bare=S.tex.bare.concat(F.tex.bare).slice(0,12);}
  S.ms+=Math.round(performance.now()-t0);report();return R;};
 S.buildAll=function(){S.rooms.forEach(S.build);return window._qiblaiIx;};
 // the walk-in check (verify.py's walk-in-rooms): every room's drawn doors opened, a walker flooding from the street before each
 // monastery's gate (KWALK.reach, the ground where no floor is) reaches its court and every room in it (the gate hall, the
 // assembly hall), and one from outside each other room's door reaches its floor. The doors are shut again after
 S.walkIn=function(){if(!KW)return{error:'no core/walk on the page'};const all=[].concat(...S.rooms.map(R=>R.leaves)),step=()=>{for(let i=0;i<40;i++)KDOOR.step(.1);};
  for(const Dd of all)KDOOR.open(Dd,{by:'player'});for(const m of QC_PLACE)if(m.kind==='monastery'){const g=KDOOR.list.find(D=>!D.locked&&D.key===m.key&&Math.hypot(D.at[0]-loc(m.x,m.z,0,m.key==='qb_monastery'?26.5:15.9,m.ry)[0],D.at[2]-loc(m.x,m.z,0,m.key==='qb_monastery'?26.5:15.9,m.ry)[1])<1.5);if(g){all.push(g);KDOOR.open(g,{by:'player'});}}
  step();const out=[],mine=(R,pre)=>R.reached.some(F=>F.tag.indexOf(pre)===0),fl=R=>'room:'+R.key+'@'+Math.round(R.x)+','+Math.round(R.z);
  for(const m of QC_PLACE.filter(p=>p.kind==='monastery')){const whole=m.key==='qb_monastery',D=whole?52:32,s=loc(m.x,m.z,0,D/2+4,m.ry),r=36;
   const Rr=KW.reach([[s[0],terrainH(s[0],s[1]),s[1]]],{ground:terrainH,box:[m.x-r,m.x+r,m.z-r,m.z+r]}),rooms=S.rooms.filter(R=>R.host===m);
   const miss=rooms.filter(R=>!mine(Rr,fl(R))).map(R=>R.name);if(!mine(Rr,'monastery:'+m.id+'.court'))miss.unshift('the court');
   out.push({at:m.id,what:'the street to '+(rooms.map(R=>R.name).join(', ')||'the court'),ok:!miss.length,miss});}
  /* a city gate both ways (2026-11-16): its passage reached from the city side and from the foot of its terrace stair */
  for(const R of S.rooms.filter(R=>R.key==='qb_ix_passage'&&R.host&&R.host.kind==='gate')){const g=R.host,st=QC_EXTRA.find(p=>p.kind==='stair'&&p.gate===g),D=g.o.v===1?8:14,miss=[];
   for(const [side,z] of[['the city side',-(D/2+2.4)],['the foot of its stair',st?D/2+.3+qnStairPlan(st.o.rise).len+2:D/2+2.4]]){const s=loc(g.x,g.z,0,z,g.ry),r=Math.abs(z)+12;
    const Rr=KW.reach([[s[0],terrainH(s[0],s[1]),s[1]]],{ground:terrainH,box:[g.x-r,g.x+r,g.z-r,g.z+r]});if(!mine(Rr,fl(R)))miss.push('from '+side);}
   out.push({at:R.name+' both ways',what:'from the city side and from the foot of its stair',ok:!miss.length,miss});}
  for(const R of S.rooms.filter(R=>!R.host||R.host.kind!=='monastery')){const gd=e=>{const ox=e.at[0]+e.n[0]*2.4,oz=e.at[1]+e.n[1]*2.4,fb=KW.floorBelow(ox,oz,e.y+.2,.6);return Math.abs(Math.max(terrainH(ox,oz),fb?fb[0]:-1e9)-e.y);};
   /* from the side whose ground is nearest the floor: a terrace gate's lower side has no stair yet (qb_terrace_stair) */
   const E=(R.entries.length?R.entries:R.via?R.via.entries:[]).slice().sort((a,b)=>gd(a)-gd(b))[0];if(!E){out.push({at:R.name,what:'no drawn door found',ok:false,miss:[R.name]});continue;}
   const n=E.n,sx=E.at[0]+n[0]*2.4,sz=E.at[1]+n[1]*2.4,fb=KW.floorBelow(sx,sz,E.y+.2,.6),r=Math.max(R.o.W,R.o.D)/2+14;
   const Rr=KW.reach([[sx,Math.max(terrainH(sx,sz),fb?fb[0]:-1e9),sz]],{ground:terrainH,box:[R.x-r,R.x+r,R.z-r,R.z+r]});
   out.push({at:R.name,what:'its door to its floor',ok:mine(Rr,fl(R)),miss:mine(Rr,fl(R))?[]:[R.name]});}
  for(const Dd of all)KDOOR.close(Dd);step();return out;};
 FRAME_HOOKS.push(()=>{const P=camera.position;for(const R of S.rooms){const d=Math.hypot(P.x-R.cx,P.y-R.cy,P.z-R.cz);
  if(!R.built&&d<QC_IX_NEAR){try{S.build(R);}catch(e){R.built=true;reportErr('qiblai interior '+R.name+': '+(e&&e.stack||e));}}
  if(R.G)R.G.visible=d<QC_IX_FAR;}});
 report();return S;})();
