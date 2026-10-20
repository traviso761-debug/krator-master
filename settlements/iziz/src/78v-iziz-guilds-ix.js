// ================================================================= 78v. THE GUILDS' INTERIORS: the Watch and the Reliquary
// The owner (2026-10-19): interiors for the civic and Ancient buildings the city places. The Mercenary Guild lives in the
// Ancients kit's police station ("the Watch", kits/ancients 73-police.js, placed at 0.45) and the Salvagers' Guild in its
// laboratory ("the Reliquary", 89-lab.js, at 0.5); 77-anc-guilds.js wraps both. In the city they are built open
// (IZS_HOLLOW.guilds: the shell's windows and door cut through, no core and no rings of rooms inside), and the def here is
// placed on the guild's own transform at scale 1 (90b guildIx) to draw what goes inside, from its item (kits/interiors/sets/
// iziz-ancient.js, `tower`: every height and outline is there, in world metres). Both build on the temple's plan of a level (78t):
//   the slabs        each level's floor cut to the shell, the stairwell from the level below cut out of it; a ceiling under
//                    the roof
//   the stair core   the temple's switchback through every level (24 risers a level, the landing on the south side)
//   the walls        each level's stair hall, its four walls run on both ways out to the shell (in bands, each as long as the
//                    shell allows at its top: the Watch leans in, the Reliquary waves storey by storey), so eight rooms round
//                    the hall: a door from the hall into each arm beside it, a door from each arm into the corner room it
//                    turns into (IZDOOR: they open); a rail round the stairwell on every upper level
//   the front door   a double door in the shell's opening (the sally-port; the arcade's front arch), a fanlight over it
// The rooms (their floors and walls, the furniture) are the item's: 95i plans and furnishes them like any other job. The walk
// (core/walk): the flights and landings as strips and floors, the rails as blocks; the doors' blocks are 95j's.
function izGuildIx(G,o,key,seed){reseed(seed);const C=VERN.cur,it=C.ixItem||vnIxItem(key);if(!it||!it.tower)return;
 if(o.r0!=null)C.r0=o.r0;   // the furniture's parent: the guild's kit building (90b guildIx finds it)
 const T=it.tower,W=typeof KWALK!=='undefined'?KWALK:null,tag='interior:'+key,CX=T.cx,CZ=T.cz,HO=T.hole;
 if(typeof TRANS!=='undefined')TRANS.groups.push(G);   // its slabs merge into the transplants' bake
 const fl=tsand(T.floor||0xd8cfc0),plC=vC(T.wall),stC=vC(0xc8b8a0),brz=vC(0x8a6a3a),ir=vC(0x3a3632);
 const wp=(x,y,z)=>IZDOOR._w(x,y,z),wxz=(x,z,y)=>{const p=wp(x,y,z);return[p[0],p[2],p[1]];};
 // a world-frame axis box for the walk from a local box (a turned building takes the box's bounds)
 const wblock=(x0,x1,z0,z1,y0,y1)=>{if(!W)return;const P=[[x0,z0],[x1,z0],[x0,z1],[x1,z1]].map(q=>wp(q[0],y0,q[1]));
  W.block([Math.min(...P.map(p=>p[0])),Math.max(...P.map(p=>p[0])),Math.min(...P.map(p=>p[2])),Math.max(...P.map(p=>p[2])),P[0][1],P[0][1]+(y1-y0)],tag);};
 // a slab: the outline at its top y, t thick, less the stairwell when it has one
 const slab=S=>{const sh=new THREE.Shape(),P=S.poly;P.concat([P[0]]).forEach((p,i)=>{if(i)sh.lineTo(p[0],-p[1]);else sh.moveTo(p[0],-p[1]);});
  if(S.hole){const h=new THREE.Path(),[x0,x1,z0,z1]=HO;h.moveTo(x0,-z0);h.lineTo(x1,-z0);h.lineTo(x1,-z1);h.lineTo(x0,-z1);h.lineTo(x0,-z0);sh.holes.push(h);}
  const g=new THREE.ExtrudeGeometry(sh,{depth:S.t,bevelEnabled:false,curveSegments:1});g.rotateX(-Math.PI/2);g.translate(0,S.y-S.t+.012,0);const m=mesh(g,fl,G);   /* 12 mm proud: the walls below end at the floor's top */if(m)m.userData.inspectLabel=it.name+' floor';};
 // how far from (x, z) along (dx, dz) the outline P is
 const reach=(P,x,z,dx,dz)=>{let best=0;for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length],ex=b[0]-a[0],ez=b[1]-a[1],den=dx*ez-dz*ex;if(Math.abs(den)<1e-9)continue;
  const t=((a[0]-x)*ez-(a[1]-z)*ex)/den,u=((a[0]-x)*dz-(a[1]-z)*dx)/den;if(t>0&&u>=0&&u<=1&&(!best||t<best))best=t;}return best;};
 // a straight wall on an axis line from u0 to u1 (along x when alongX, at z = c; else along z at x = c), y0..y1, with door gaps
 // {u, w, top: the door's head (default y0 + 2.2); a band starting at or above it has no gap}
 // (its walk block is the rooms': every wall here is an edge of the item's rooms, which 95i registers, gapped at the doors)
 const wall=(alongX,c,u0,u1,y0,y1,doors)=>{const lo=Math.min(u0,u1),hi=Math.max(u0,u1);let u=lo;
  const seg=(a,b,ya,yb)=>{if(b-a<.03||yb-ya<.03)return;const m=(a+b)/2;if(alongX)vB('vPlaster',m,ya,c,b-a,yb-ya,.16,0,plC);else vB('vPlaster',c,ya,m,.16,yb-ya,b-a,0,plC);};
  for(const d of(doors||[]).slice().sort((p,q)=>p.u-q.u)){const hd=d.top==null?y0+2.2:d.top;if(hd<=y0+.03)continue;const a=d.u-d.w/2,b=d.u+d.w/2;seg(u,a,y0,y1);seg(a,b,hd,y1);u=b;}seg(u,hi,y0,y1);};
 const door=(x,y,z,ry,w)=>IZDOOR.leaf(x,y,z,ry,w*.96,2.12,.06,brz);
 // a rail .95 high on an axis line, and its walk block
 const rail=(alongX,c,u0,u1,y)=>{const m=(u0+u1)/2,L=Math.abs(u1-u0),n=Math.max(1,Math.round(L/1.2));if(L<.05)return;
  if(alongX){vB('vIron',m,y+.9,c,L,.06,.06,0,ir);vB('vIron',m,y+.45,c,L,.04,.04,0,ir);for(let k=0;k<=n;k++)vB('vIron',Math.min(u0,u1)+L*k/n,y,c,.05,.9,.05,0,ir);wblock(Math.min(u0,u1),Math.max(u0,u1),c-.05,c+.05,y,y+1);}
  else{vB('vIron',c,y+.9,m,.06,.06,L,0,ir);vB('vIron',c,y+.45,m,.04,.04,L,0,ir);for(let k=0;k<=n;k++)vB('vIron',c,y,Math.min(u0,u1)+L*k/n,.05,.9,.05,0,ir);wblock(c-.05,c+.05,Math.min(u0,u1),Math.max(u0,u1),y,y+1);}};
 const Ls=T.levels,IXD=2.0,SDX=1.65,SDW=.8;   // the split doors' offset and the hall's south door (the item's IXD, SDX, SDW)
 // ---- the slabs
 for(const S of T.slabs)slab(S);
 // ---- each level: the stair hall and its doors, the pinwheel in bands; the flight up from it and the rail round the well above
 Ls.forEach((Lv,i)=>{const y=Lv.y,top=y+Lv.h;
  wall(true,CZ,-CX,CX,y,top,[{u:0,w:1.0}]);wall(true,-CZ,-CX,CX,y,top,[{u:SDX,w:SDW}]);wall(false,CX,-CZ,CZ,y,top,[{u:0,w:1.0}]);wall(false,-CX,-CZ,CZ,y,top,[{u:0,w:1.0}]);
  door(0,y,CZ,0,1.0);door(SDX,y,-CZ,Math.PI,SDW);door(CX,y,0,Math.PI/2,1.0);door(-CX,y,0,-Math.PI/2,1.0);
  // the hall's walls run on to the shell both ways: the pinwheel (each arm's far side) and the splits (its near side, with the
  // door into the corner room IXD from the hall's corner)
  const dr=u=>[{u,w:1.0,top:y+2.2}];
  for(const [y0,y1,P] of Lv.bands){
   wall(false,CX,CZ,CZ+reach(P,CX,CZ,0,1),y0,y1);wall(true,-CZ,CX,CX+reach(P,CX,-CZ,1,0),y0,y1);
   wall(false,-CX,-CZ,-CZ-reach(P,-CX,-CZ,0,-1),y0,y1);wall(true,CZ,-CX,-CX-reach(P,-CX,CZ,-1,0),y0,y1);
   wall(false,-CX,CZ,CZ+reach(P,-CX,CZ,0,1),y0,y1,dr(CZ+IXD));wall(true,CZ,CX,CX+reach(P,CX,CZ,1,0),y0,y1,dr(CX+IXD));
   wall(false,CX,-CZ,-CZ-reach(P,CX,-CZ,0,-1),y0,y1,dr(-CZ-IXD));wall(true,-CZ,-CX,-CX-reach(P,-CX,-CZ,-1,0),y0,y1,dr(-CX-IXD));}
  door(-CX,y,CZ+IXD,-Math.PI/2,1.0);door(CX+IXD,y,CZ,0,1.0);door(CX,y,-CZ-IXD,Math.PI/2,1.0);door(-CX-IXD,y,-CZ,Math.PI,1.0);
  if(i===Ls.length-1)return;
  // the switchback: flight 1 up the east half from the north, the landing on the south, flight 2 back up the west half
  const yHi=Ls[i+1].y,H=yHi-y,r=H/24,t=.27;
  for(let k=0;k<11;k++)vB('vStone',.65,y,1.85-t*(k+.5),1.1,r*(k+1),t,0,stC);
  vB('vStone',0,y,-2.035,2.5,12*r,1.83,0,stC);
  for(let j=0;j<11;j++)vB('vStone',-.65,y,-1.12+t*(j+.5),1.1,r*(13+j),t,0,stC);
  if(W){W.strip({a:wxz(.65,1.85,y),b:wxz(.65,-1.12,y+11*r),w:1.05,name:it.name+' stair',tag});
   const L0=wp(-1.25,y+12*r,-2.95),L1=wp(1.25,y+12*r,-1.12);W.floor({rect:[Math.min(L0[0],L1[0]),Math.max(L0[0],L1[0]),Math.min(L0[2],L1[2]),Math.max(L0[2],L1[2])],y:L0[1],name:it.name+' landing',tag});
   W.strip({a:wxz(-.65,-1.12,y+12*r),b:wxz(-.65,1.85,yHi),w:1.05,name:it.name+' stair',tag});}
  // the rail round the well in the floor above (open where flight 2 arrives, x -1.25..0 on the north)
  rail(false,HO[0],HO[2],HO[3],yHi);rail(false,HO[1],HO[2],HO[3],yHi);rail(true,HO[2],HO[0],HO[1],yHi);if(i+1===Ls.length-1)rail(true,HO[3],0,HO[1],yHi);});   /* below the top level the next flight starts there: no rail across its foot */
 // ---- the front door: two leaves in the shell's opening, a transom and a fanlight over them to the opening's head
 {const D=T.door,y=Ls[0].y;for(const s of[-1,1]){const q=loc(D.x,D.z,s*D.w/4,0,D.ry);IZDOOR.leaf(q[0],y,q[1],D.ry,D.w/2-.04,D.h,.1,brz,{mirror:s>0});}
  // its stoop outside, and the floor through the shell's opening to the first room (the rooms stop short of the shell: the door
  // had no floor on either side; the owner, 2026-10-20)
  vnStoop(D.x,y,D.z,D.ry,D.w,'vStone',stC);
  if(W){const q=[[-D.w/2,-2.2],[D.w/2,-2.2],[D.w/2,.1],[-D.w/2,.1]].map(([u,v])=>{const r=loc(D.x,D.z,u,v,D.ry),p=IZDOOR._w(r[0],y,r[1]);return[p[0],p[2],p[1]];});W.poly({pts:q,name:it.name+' doorway',tag});}
  const hT=D.top-(y+D.h);if(hT>.2){vB('vIron',D.x,y+D.h,D.z,D.w+.1,.1,.14,D.ry,ir);vB('vWinClear',D.x,y+D.h+.1,D.z,D.w,hT-.1,.04,D.ry);}}}
VERN.def({key:'anc_mercenary_ix',name:'Mercenary Guild — inside the Watch',family:'civic',tags:{type:['civic','military'],wealth:'civic',lit:true},w:32,d:32,h:6,build:(G,o)=>izGuildIx(G,o,'anc_mercenary_ix',7995)});
VERN.def({key:'anc_salvagers_ix',name:'Salvagers\' Guild — inside the Reliquary',family:'civic',tags:{type:['civic','industry'],wealth:'civic',lit:true},w:36,d:36,h:14,build:(G,o)=>izGuildIx(G,o,'anc_salvagers_ix',7997)});
