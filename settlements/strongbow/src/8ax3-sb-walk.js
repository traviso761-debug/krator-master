// ================================================================= STRONGBOW TODAY — the walk up, drawn and walked on the page
// The walk's records (src/32-sb-walk.js, SB_WALK.plan) drawn: the lift cars (one moving group a lift), their gates at every stop,
// the doors (the lobby's, the core's, the neck's and the ring building's at T1, the post's two, the yard's gate) with their
// frames and the panels that close the openings round them, the treads inside the lobby's door, the girder gangways, the landing
// plate in T1's neck, the shaft through the Nock's west wing, the Sultanate's post as walls round a court with a roof. The
// arcology opens what the walk needs from SB_CUTS (sbWalkCuts, set by targets/strongbow-today before the arcology builds); the
// reclamation draws the lift frames, ledges, bridge and yard from the same plan (8ax0).
// ON THE PAGE the walk is run once, on its own core/walk registry: a walk that does not reach the top is an error on the page
// (window._sbWalk, the verify's error panel). The 'walk up (u)' button replays it at eye height: the doors and gates open as the
// walker comes to them, the cars ride. Esc stops.
var SB_WALK_S=null;
function sbWalkPlan(){if(SB_WALK_S)return SB_WALK_S;if(typeof SB_WALK==='undefined'||typeof sbLayout==='undefined')return null;SB_WALK_S=SB_WALK.plan(sbLayout(),STRONGBOW.plan({seed:1647}));return SB_WALK_S;}
function sbWalkCuts(){const S=sbWalkPlan();return S?SB_WALK.cuts(S,STRONGBOW.plan({seed:1647})):null;}

function sbWalkDraw(gx,gz){const S=sbWalkPlan();if(!S)return null;KOFF=[gx,0,gz];const P=STRONGBOW.plan({seed:1647}),F=P.frame,DH=SB_WALK.DOORH;
 const O={cars:{},leaves:{},run:null};
 const std=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:new THREE.Color(c).convertSRGBToLinear(),roughness:.6,metalness:.3},o||{}));
 const BRONZE=std(0xb07a40,{metalness:.6,roughness:.45}),GIRD=std(0x7a3428,{roughness:.7}),DOOR=std(0x6a4a30,{roughness:.8}),GLASS=MAT.sbLobbyGlass||std(0xbfe3ea,{transparent:true,opacity:.5});
 const BOX=new THREE.BoxGeometry(1,1,1);
 const box=(grp,c,s,m,ry)=>{const q=new THREE.Mesh(BOX,m);q.position.set(c[0],c[1],c[2]);q.scale.set(s[0],s[1],s[2]);if(ry)q.rotation.y=ry;q.castShadow=q.receiveShadow=true;grp.add(q);return q;};
 const root=new THREE.Group();root.name='strongbow:walk';root.position.set(gx,0,gz);root.userData.lodSkip=true;scene.add(root);
 const fixed=new THREE.Group();fixed.name='strongbow:walk fixtures';root.add(fixed);
 // ---- the treads inside the lobby's door, the gangways, the plate in T1's neck, the shaft through the Nock ---------------------
 const fl=P.foot.lobby.y0+.25;
 for(const t of S.treads){const r=t.rect;kput('acBox',[(r[0]+r[1])/2,(t.y+fl)/2-.01,(r[2]+r[3])/2],null,[r[1]-r[0],t.y-fl,r[3]-r[2]],new THREE.Color(0xd8d0be));}
 for(const g of S.gangways){const r=g.rect,cx=(r[0]+r[1])/2,cz=(r[2]+r[3])/2,lx=r[1]-r[0],lz=r[3]-r[2];
  kput('acBox',[cx,g.y-.2,cz],null,[lx,.4,lz],new THREE.Color(0x9a8a70));
  for(const s of [-1,1]){if(lx>lz)kput('acBox',[cx,g.y+1.05,cz+s*(lz/2-.05)],null,[lx,.1,.1],new THREE.Color(0x2c3236));else kput('acBox',[cx+s*(lx/2-.05),g.y+1.05,cz],null,[.1,.1,lz],new THREE.Color(0x2c3236));}
  for(const s of [-1,1])if(lx>lz)kput('acBox',[cx,g.y-.6,cz+s*(lz/2-.2)],null,[lx,.6,.3],SB_GIRDER);else kput('acBox',[cx+s*(lx/2-.2),g.y-.6,cz],null,[.3,.6,lz],SB_GIRDER);}
 {const pl=S.plate,sh=new THREE.Shape(),n=48;for(let i=0;i<=n;i++){const a=i/n*Math.PI*2,x=pl.c[0]+pl.r*Math.cos(a),z=pl.c[1]+pl.r*Math.sin(a);i?sh.lineTo(x,z):sh.moveTo(x,z);}
  const h=pl.hole,hp=new THREE.Path();hp.moveTo(h[0]-.3,h[2]-.3);hp.lineTo(h[1]+.3,h[2]-.3);hp.lineTo(h[1]+.3,h[3]+.3);hp.lineTo(h[0]-.3,h[3]+.3);hp.lineTo(h[0]-.3,h[2]-.3);sh.holes.push(hp);
  const g=new THREE.ShapeGeometry(sh);g.rotateX(Math.PI/2);g.translate(0,pl.y,0);const idx=g.index.array;for(let i=0;i<idx.length;i+=3){const t=idx[i+1];idx[i+1]=idx[i+2];idx[i+2]=t;}g.computeVertexNormals();
  const m=new THREE.Mesh(g,MAT.acDeckR||MAT.acDeck);m.receiveShadow=true;m.name='strongbow:T1 landing plate';fixed.add(m);}
 for(const ho of S.holes)if(ho.in==='sb.nock.w'){const r=ho.rect,y0=ho.y0,y1=ho.y1,cy=(y0+y1)/2;
  kput('acBox',[r[0],cy,(r[2]+r[3])/2],null,[.3,y1-y0,r[3]-r[2]],new THREE.Color(0x8a8070));kput('acBox',[r[1],cy,(r[2]+r[3])/2],null,[.3,y1-y0,r[3]-r[2]],new THREE.Color(0x8a8070));
  kput('acBox',[(r[0]+r[1])/2,cy,r[2]],null,[r[1]-r[0],y1-y0,.3],new THREE.Color(0x8a8070));kput('acBox',[(r[0]+r[1])/2,cy,r[3]],null,[r[1]-r[0],y1-y0,.3],new THREE.Color(0x8a8070));}
 // ---- the Sultanate's post: its walls (the walk's), a roof over the court's rim, the cornice, the mast; the yard's wall and gate
 {const po=S.post,r=po.rect,y=po.y;
  for(const w of S.walls)if(w.id==='sb.wall.post'||w.id==='sb.wall.yard'){const b=w.box;kput('acBox',[(b[0]+b[1])/2,(b[4]+b[5])/2,(b[2]+b[3])/2],null,[b[1]-b[0],b[5]-b[4],b[3]-b[2]],
   new THREE.Color(w.id==='sb.wall.post'?0xe2d8c2:0xc8b896));}
  /* the roof: a deck over the post's rim (an open court in the middle, so the walk through it is under the sky) */
  for(const [x0,x1,z0,z1] of [[r[0],r[1],r[2],r[2]+7],[r[0],r[1],r[3]-7,r[3]],[r[0],r[0]+7,r[2]+7,r[3]-7],[r[1]-7,r[1],r[2]+7,r[3]-7]]){
   kput('acBox',[(x0+x1)/2,y+6.2,(z0+z1)/2],null,[x1-x0,.4,z1-z0],new THREE.Color(0xd8cdb4));kput('acBox',[(x0+x1)/2,y+6.6,(z0+z1)/2],null,[x1-x0+.4,.4,z1-z0+.4],SB_RED);}
  kput('acBox',[(r[0]+r[1])/2,y+6.4+6,r[2]+3],null,[.3,12,.3],new THREE.Color(0x5a4630));kput('acBox',[(r[0]+r[1])/2+2,y+16,r[2]+3],null,[4,2.4,.1],SB_RED);}
 // ---- the doors: a frame, the leaf (a moving mesh), and panels closing the opening round it where the opening is wider ---------
 const tan=d=>d.ax==='x'?[1,0]:[0,1],ryOf=d=>d.ax==='x'?0:-Math.PI/2;   /* a box's local x along the wall */
 for(const d of S.doors){if(/^sb\.gate\./.test(d.id))continue;const t=tan(d),w=d.w,y=d.y,c=[d.at[0],y,d.at[1]],ry=ryOf(d);
  for(const s of [-1,1])box(fixed,[c[0]+t[0]*s*(w/2+.15),y+DH/2+.1,c[2]+t[1]*s*(w/2+.15)],[.3,DH+.2,.5],BRONZE,ry);
  box(fixed,[c[0],y+DH+.25,c[2]],[w+.6,.3,.5],BRONZE,ry);
  /* the leaf: hinged at one jamb (a pivot group), swung 85 degrees when opened */
  const pv=new THREE.Group();pv.position.set(c[0]-t[0]*w/2,y,c[2]-t[1]*w/2);pv.rotation.y=ry;fixed.add(pv);
  const lf=new THREE.Mesh(BOX,d.id==='sb.door.lobby'?GLASS:DOOR);lf.scale.set(w,DH,.12);lf.position.set(w/2,DH/2,0);pv.add(lf);O.leaves[d.id]={pv,ry,open:0};
  /* the opening round it: the lobby's glass bay (10 m), the neck's and the ring building's cells (2 to 4 m) */
  const span=d.id==='sb.door.lobby'?2*Math.PI*(P.foot.lobby.r)/P.foot.lobby.ribs:d.ring?3.2*2:0;
  if(span>w+.8){const side=(span-w)/2-.3,top=d.id==='sb.door.lobby'?(P.foot.lobby.y1-P.foot.lobby.y0-1.5)/4+1.5:DH+.6;
   for(const s of [-1,1])box(fixed,[c[0]+t[0]*s*(w/2+.3+side/2),y+top/2-.1,c[2]+t[1]*s*(w/2+.3+side/2)],[side,top,.2],d.id==='sb.door.lobby'?GLASS:std(0xd8d0be),ry);
   if(top>DH+.6)box(fixed,[c[0],y+(DH+.4+top)/2,c[2]],[w+.6,top-DH-.4,.2],GLASS,ry);}}
 // ---- the lift cars and their gates -------------------------------------------------------------------------------------------
 const CAR=S.car;
 for(const l of S.lifts){const g=new THREE.Group();g.name='strongbow:car '+l.id;g.position.set(l.frame[0],l.car.y,l.frame[1]);root.add(g);
  const gateSides=l.stops.map(s=>s.side[0]+','+s.side[1]);
  box(g,[0,-.15,0],[2*CAR,.3,2*CAR],std(0x8a8070));box(g,[0,3.05,0],[2*CAR+.2,.2,2*CAR+.2],BRONZE);
  for(const [dx,dz] of [[-1,-1],[1,-1],[1,1],[-1,1]])box(g,[dx*(CAR-.1),1.45,dz*(CAR-.1)],[.2,2.9,.2],BRONZE);
  for(const sd of [[1,0],[-1,0],[0,1],[0,-1]]){if(gateSides.indexOf(sd[0]+','+sd[1])>=0)continue;
   for(const yy of [.9,1.9,2.7])box(g,[sd[0]*(CAR-.1),yy,sd[1]*(CAR-.1)],sd[0]?[.08,.08,2*CAR]:[2*CAR,.08,.08],BRONZE);}
  O.cars[l.id]={g,l,y:l.car.y};
  for(const st of l.stops){const d=st.gate,t=tan(d),gg=new THREE.Group();gg.position.set(d.at[0],st.y,d.at[1]);gg.rotation.y=ryOf(d);fixed.add(gg);
   for(let k=0;k<7;k++)box(gg,[-1.2+k*.4,DH/2,0],[.07,DH,.07],BRONZE);box(gg,[0,DH,0],[2.6,.12,.12],BRONZE);box(gg,[0,.06,0],[2.6,.12,.12],BRONZE);
   O.leaves[d.id]={pv:gg,slide:true,x0:gg.position.x,z0:gg.position.z,t,open:0};}}
 // ---- the walk on the page: run once (an error if it does not reach the top) ---------------------------------------------------
 if(typeof KWALK!=='undefined'){let R=null;
  try{R=SB_WALK.run(KWALK.create(),S,{ground:(x,z)=>F.ground(x,z)});}catch(e){reportErr('Strongbow: the walk up threw: '+(e&&e.stack||e));}
  if(R){O.run=R;window._sbWalk={ok:R.ok,legs:R.legs.length,route:S.route.length,doors:R.opened.length,lifts:R.rode.slice(),steps:R.path.length,end:R.end&&R.end.map(x=>+x.toFixed(1)),
    fail:R.fail?R.fail.name+(R.fail.msg?': '+R.fail.msg:''):null};
   if(!R.ok)reportErr('Strongbow: the walk up stops at "'+window._sbWalk.fail+'"');}}
 else reportErr('Strongbow: core/walk is not on the page (the walk up cannot be checked)');
 // ---- the replay ----------------------------------------------------------------------------------------------------------------
 const st={on:false,i:0,speed:2.2};
 const reset=()=>{for(const k in O.leaves){const L=O.leaves[k];L.open=0;if(L.slide)L.pv.position.set(L.x0,L.pv.position.y,L.z0);else L.pv.rotation.y=L.ry;}
  for(const k in O.cars){const C=O.cars[k];C.g.position.y=C.l.car.y;}};
 const pose=i=>{const R=O.run,p=R.path,k=Math.min(p.length-1,Math.floor(i)),a=p[k];
  /* the doors opened before this step, the cars where their rides put them */
  for(const e of R.events){if(e.door!=null){const L=O.leaves[e.door];if(L&&k>=e.i&&!L.open){L.open=1;if(L.slide)L.pv.position.set(L.x0+L.t[0]*2.5,L.pv.position.y,L.z0+L.t[1]*2.5);else L.pv.rotation.y=L.ry-1.48;}}
   else if(k>=e.i0){const C=O.cars[e.lift];if(C)C.g.position.y=k>=e.i1?e.to:p[Math.min(k,e.i1-1)][2];}}
  /* the eye: 1.7 m over the feet, looking along the way ahead (out of the car while it rides) */
  let b=p[Math.min(p.length-1,k+14)];if(Math.hypot(b[0]-a[0],b[1]-a[1])<1){let j=k+1;while(j<p.length-1&&Math.hypot(p[j][0]-a[0],p[j][1]-a[1])<3)j++;b=p[j];}
  const dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1;
  ctl.target.set(a[0]+gx+dx/l*6,a[2]+1.6,a[1]+gz+dz/l*6);const cx=a[0]+gx,cy=a[2]+1.7,cz=a[1]+gz,rx=cx-ctl.target.x,ry=cy-ctl.target.y,rz=cz-ctl.target.z;
  ctl.radius=Math.hypot(rx,ry,rz);ctl.theta=Math.atan2(rx,rz);ctl.phi=Math.acos(Math.max(-1,Math.min(1,ry/ctl.radius)));};
 const stop=()=>{st.on=false;if(btn)btn.textContent='walk up (u)';reset();};
 const start=()=>{if(!O.run||!O.run.path.length)return;reset();st.on=true;st.i=0;if(btn)btn.textContent='walking… (Esc stops)';};
 const ui=document.getElementById('ui');let btn=null;
 if(ui){btn=document.createElement('button');btn.textContent='walk up (u)';btn.onclick=()=>st.on?stop():start();ui.appendChild(btn);}
 addEventListener('keydown',e=>{if(e.target&&/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;const k=(e.key||'').toLowerCase();if(k==='u')st.on?stop():start();else if(k==='escape'&&st.on)stop();});
 tick(dt=>{if(!st.on)return;const R=O.run,riding=R.events.some(e=>e.lift&&st.i>=e.i0&&st.i<e.i1);st.i+=st.speed*(riding?3:1)*Math.max(.5,Math.min(3,(dt||.016)*60));
  if(st.i>=R.path.length-1){pose(R.path.length-1);st.on=false;if(btn)btn.textContent='walk up (u)';return;}pose(st.i);});
 /* a view chosen (the list, the probe, a verify's sweep) stops the replay: setView is wrapped on the first frame, after the camera
    fragment (92) has defined it */
 let wrapped=false;tick(()=>{if(wrapped||typeof setView!=='function')return;wrapped=true;const base=setView;
  setView=function(){if(st.on)stop();return base.apply(this,arguments);};});
 O.start=start;O.stop=stop;O.pose=pose;window._sbWalkView=O;return O;}
