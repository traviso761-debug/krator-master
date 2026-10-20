// ================================================================= 78t. THE TEMPLE'S INTERIOR: the sanctum and three levels of priests' offices
// The owner (2026-10-19): "The temple just needs an interior at the very top with a stair down to 3 levels of priest
// offices." The temple is the Ancient Iziz style's pyramid on legs (kits/ancients 77z), placed by the city at 0.72 on the
// temple hill with IZS_HOLLOW.temple set, so it leaves the core out of its upper glass band and opens the crown's door.
// This def is placed on the same transform (90a) and draws what goes inside, from its item in the interior set
// (kits/interiors/sets/iziz-ancient.js, `temple`: every height and radius is there, in world metres):
//   the slabs        the terrace (the sanctum's floor) and L1, L2, L3 under it, each cut to the tier's squircle at its height,
//                    with the stairwell from the level below cut out of it
//   the stair core   a switchback through every level, solid stone (24 risers a level, the landing on the south side)
//   the walls        each level's stair hall and the pinwheel of four offices round it, out to the leaning tier wall (in three
//                    bands, each as long as the wall allows at its height), a door in each office wall (IZDOOR: they open)
//   the sanctum      the crown's door (IZDOOR), its jambs and lintel; a rail round the stairwell on every level
//   the terrace      a parapet round the roof the ramp lands on (open where it lands), and steps from the ramp up onto it
// The rooms (their floors and walls, the furniture) are the item's: 95i plans and furnishes them like any other job. The
// walk (core/walk): the ramp, the steps, the flights and landings as strips and floors, the terrace as a floor, the rails
// and the parapet as blocks; the doors' blocks are 95j's.
function buildIzizTempleIx(G,o){reseed(7991);const C=VERN.cur,it=C.ixItem||vnIxItem('iziz_temple_ix');if(!it||!it.temple)return;
 C.r0=REG.length-1;   // the temple's record (TRANS.place pushed it just before): the furniture's parent
 const T=it.temple,W=typeof KWALK!=='undefined'?KWALK:null,tag='interior:iziz_temple',CX=T.cx,CZ=T.cz,HO=T.hole;
 if(typeof TRANS!=='undefined')TRANS.groups.push(G);   // its slabs merge into the transplants' bake (one draw call with the temple's stone)
 const fl=tsand(0xf1dba6),plC=vC(0xeadfc8),stC=vC(0xd8c4a0),brz=vC(0x8a6a3a),ir=vC(0x3a3632);
 const wp=(x,y,z)=>IZDOOR._w(x,y,z),wxz=(x,z,y)=>{const p=wp(x,y,z);return[p[0],p[2],p[1]];};
 // a world-frame axis box for the walk from a local box (a turned temple takes the box's bounds)
 const wblock=(x0,x1,z0,z1,y0,y1)=>{if(!W)return;const P=[[x0,z0],[x1,z0],[x0,z1],[x1,z1]].map(q=>wp(q[0],y0,q[1]));
  W.block([Math.min(...P.map(p=>p[0])),Math.max(...P.map(p=>p[0])),Math.min(...P.map(p=>p[2])),Math.max(...P.map(p=>p[2])),P[0][1],P[0][1]+(y1-y0)],tag);};
 const sq=(r,th)=>r*se(th,3.5);
 // a slab: the squircle of radius r at its top y, 0.3 thick, less the stairwell (local x0 x1 z0 z1)
 const slab=(r,y,hole)=>{const sh=new THREE.Shape(),N=96;for(let i=0;i<=N;i++){const th=i/N*TAU,k=sq(r,th),X=k*Math.cos(th),Z=k*Math.sin(th);if(i)sh.lineTo(X,-Z);else sh.moveTo(X,-Z);}
  if(hole){const h=new THREE.Path(),[x0,x1,z0,z1]=hole;h.moveTo(x0,-z0);h.lineTo(x1,-z0);h.lineTo(x1,-z1);h.lineTo(x0,-z1);h.lineTo(x0,-z0);sh.holes.push(h);}
  const g=new THREE.ExtrudeGeometry(sh,{depth:.3,bevelEnabled:false,curveSegments:1});g.rotateX(-Math.PI/2);g.translate(0,y-.3+.012,0);const m=mesh(g,fl,G);if(m)m.userData.inspectLabel='temple floor';   /* 12 mm proud: the walls below end at the floor's top */};
 // where the squircle of radius r crosses the line x = a (or z = a) going outward
 const edge=(r,a)=>r*Math.pow(Math.max(0,1-Math.pow(Math.abs(a)/r,3.5)),1/3.5);
 // a straight wall on an axis line from u0 to u1 (along x when alongX, at z = c; else along z at x = c), y0..y1, with door gaps
 const wall=(alongX,c,u0,u1,y0,y1,doors)=>{const lo=Math.min(u0,u1),hi=Math.max(u0,u1);let u=lo;
  const seg=(a,b,ya,yb)=>{if(b-a<.03||yb-ya<.03)return;const m=(a+b)/2;if(alongX)vB('vPlaster',m,ya,c,b-a,yb-ya,.16,0,plC);else vB('vPlaster',c,ya,m,.16,yb-ya,b-a,0,plC);};
  for(const d of(doors||[]).slice().sort((p,q)=>p.u-q.u)){const a=d.u-d.w/2,b=d.u+d.w/2;seg(u,a,y0,y1);seg(a,b,y0+2.2,y1);u=b;}seg(u,hi,y0,y1);};
 // (the walls' walk blocks are the rooms': every wall here is an edge of the item's rooms, which 95i registers, gapped at the doors)
 const door=(x,y,z,ry,w)=>IZDOOR.leaf(x,y,z,ry,w*.96,2.12,.06,brz);
 // a rail .95 high on an axis line, and its walk block
 const rail=(alongX,c,u0,u1,y)=>{const m=(u0+u1)/2,L=Math.abs(u1-u0);if(L<.05)return;
  if(alongX){vB('vIron',m,y+.9,c,L,.06,.06,0,ir);vB('vIron',m,y+.45,c,L,.04,.04,0,ir);for(let k=0;k<=Math.round(L/1.2);k++)vB('vIron',Math.min(u0,u1)+L*k/Math.max(1,Math.round(L/1.2)),y,c,.05,.9,.05,0,ir);wblock(Math.min(u0,u1),Math.max(u0,u1),c-.05,c+.05,y,y+1);}
  else{vB('vIron',c,y+.9,m,.06,.06,L,0,ir);vB('vIron',c,y+.45,m,.04,.04,L,0,ir);for(let k=0;k<=Math.round(L/1.2);k++)vB('vIron',c,y,Math.min(u0,u1)+L*k/Math.max(1,Math.round(L/1.2)),.05,.9,.05,0,ir);wblock(c-.05,c+.05,Math.min(u0,u1),Math.max(u0,u1),y,y+1);}};
 const Ls=T.levels,S=T.sanctum;
 // ---- the slabs: L3 whole, L2 and L1 and the terrace less the stairwell
 slab(Ls[2].rFloor-.05,Ls[2].y,null);slab(Ls[1].rFloor-.05,Ls[1].y,HO);slab(Ls[0].rFloor-.05,Ls[0].y,HO);slab(T.terrace.r-.05,S.y,HO);
 // ---- each level: the stair hall and the pinwheel walls, the doors; the flight up from it; the rail round the well above
 const ups=[[Ls[2],Ls[1].y],[Ls[1],Ls[0].y],[Ls[0],S.y]];
 for(const [Lv,yHi] of ups){const y=Lv.y,top=yHi-.3,hh=top-y;
  wall(true,CZ,-CX,CX,y,top,[{u:0,w:1.0}]);wall(true,-CZ,-CX,CX,y,top,[{u:1.7,w:.9}]);wall(false,CX,-CZ,CZ,y,top,[{u:0,w:1.0}]);wall(false,-CX,-CZ,CZ,y,top,[{u:0,w:1.0}]);
  door(0,y,CZ,0,1.0);door(1.7,y,-CZ,Math.PI,.9);door(CX,y,0,Math.PI/2,1.0);door(-CX,y,0,-Math.PI/2,1.0);
  // the pinwheel: four walls from the hall's corners out to the tier, in three bands (the tier leans in as it rises)
  const rAt=k=>Lv.rFloor+(Lv.rRoom+.4-Lv.rFloor)*(k+1)/3-.08;
  for(let k=0;k<3;k++){const y0=y+hh*k/3,y1=y+hh*(k+1)/3,r=rAt(k);
   wall(false,CX,CZ,edge(r,CX),y0,y1);wall(true,-CZ,CX,edge(r,CZ),y0,y1);wall(false,-CX,-CZ,-edge(r,CX),y0,y1);wall(true,CZ,-CX,-edge(r,CZ),y0,y1);}
  // the switchback: flight 1 up the east half from the north, the landing on the south, flight 2 back up the west half
  const H=yHi-y,r=H/24,t=.27;
  for(let i=0;i<11;i++)vB('vStone',.65,y,1.85-t*(i+.5),1.1,r*(i+1),t,0,stC);
  vB('vStone',0,y,-2.035,2.5,12*r,1.83,0,stC);
  for(let j=0;j<11;j++)vB('vStone',-.65,y,-1.12+t*(j+.5),1.1,r*(13+j),t,0,stC);
  if(W){W.strip({a:wxz(.65,1.85,y),b:wxz(.65,-1.12,y+11*r),w:1.05,name:'temple stair',tag});
   const L0=wp(-1.25,y+12*r,-2.95),L1=wp(1.25,y+12*r,-1.12);W.floor({rect:[L0[0],L1[0],L0[2],L1[2]],y:L0[1],name:'temple landing',tag});
   W.strip({a:wxz(-.65,-1.12,y+12*r),b:wxz(-.65,1.85,yHi),w:1.05,name:'temple stair',tag});}
  // the rail round the well in the floor above (open where flight 2 arrives, x -1.25..0 on the north)
  rail(false,HO[0],HO[2],HO[3],yHi);rail(false,HO[1],HO[2],HO[3],yHi);rail(true,HO[2],HO[0],HO[1],yHi);if(yHi===S.y)rail(true,HO[3],0,HO[1],yHi);}   /* below the sanctum the next flight starts there: no rail across its foot */
 // ---- the sanctum's door in the crown's opening, its jambs and lintel
 {const zf=(S.glass+S.stone)/2,dw=S.door;door(0,S.y,zf,0,dw);for(const s of[-1,1])vB('vStone',s*(dw/2+.19),S.y,zf,.38,3.1,S.stone-S.glass+.2,0,stC);vB('vStone',0,S.y+2.9,zf,dw+.76,.2,S.stone-S.glass+.2,0,stC);}
 // ---- the terrace: its floor for the walk, a parapet round it (open on the front where the ramp lands), steps up from the ramp
 {const R=T.terrace.r-.3,N=48,P=[];for(let i=0;i<N;i++){const th=i/N*TAU,k=sq(R,th);P.push([k*Math.cos(th),k*Math.sin(th)]);}
  if(W)W.poly({pts:P.map(p=>wxz(p[0],p[1],S.y)),name:'temple terrace',tag});
  for(let i=0;i<N;i++){const a=P[i],b=P[(i+1)%N],mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2;if(mz>0&&Math.abs(mx)<3.4)continue;
   const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz);vB('vStone',mx,S.y,mz,L+.05,.9,.25,Math.atan2(-dz,dx),stC);
   wblock(Math.min(a[0],b[0])-.1,Math.max(a[0],b[0])+.1,Math.min(a[1],b[1])-.1,Math.max(a[1],b[1])+.1,S.y,S.y+1);}
  const R0=T.ramp,yT=R0.top[2],rise=(S.y-yT)/9;for(let i=0;i<9;i++)vB('vStone',0,yT,R0.top[1]+.3-i*.3,3.2,rise*(i+1),.3,0,stC);
  if(W){W.strip({a:wxz(R0.foot[0],R0.foot[1],R0.foot[2]),b:wxz(R0.top[0],R0.top[1],R0.top[2]),w:R0.w-.4,name:'temple ramp',tag});
   W.strip({a:wxz(0,R0.top[1]+.3,yT),b:wxz(0,R0.top[1]-2.4,S.y),w:3,name:'temple steps',tag});}}}
VERN.def({key:'iziz_temple_ix',name:'Temple — sanctum and priests\' offices',family:'civic',tags:{type:['religious','civic'],wealth:'civic',lit:true},w:75,d:75,h:60,build:buildIzizTempleIx});
