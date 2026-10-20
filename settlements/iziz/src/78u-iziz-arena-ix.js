// ================================================================= 78u. THE ARENA'S INTERIOR: the ring of bays behind the shell
// The owner (2026-10-19): interiors for the Ancient civic buildings the city places. The arena (kits/ancients 77z, placed at
// 0.82 on the arena hill) is an elliptical shell with 24 tall openings round it, a wall behind the stands 14 % inside it,
// and the stands within. The interior is the ring between the two, at ground level: 24 bays, one behind each opening
// (the gladiators' barracks, the armoury, the physician, the forge, the shrine, the mess), linked round the ring by a door in
// every partition, and four gate halls where the shell's four portals (IZS_HOLLOW.arena: cut through the shell, no arch
// plate) open, each closed by a double door (IZDOOR). This def is placed on the arena's transform (90a) and draws, from its
// item (kits/interiors/sets/iziz-ancient.js, `arena`, world metres): the floor and ceiling rings, the straight wall behind
// each bay, the radial partitions and their doors, the gates. The rooms are the item's; 95i furnishes them and writes
// their floors and walls into core/walk; the doors' blocks are 95j's.
function buildIzizArenaIx(G,o){reseed(7993);const C=VERN.cur,it=C.ixItem||vnIxItem('iziz_arena_ix');if(!it||!it.arena)return;
 C.r0=REG.length-1;   // the arena's record (TRANS.place pushed it just before)
 if(typeof TRANS!=='undefined')TRANS.groups.push(G);   // its rings merge into the transplants' bake
 const A=it.arena,plC=vC(0xe2cfa8),fl=tsand(0xf1dba6),brz=vC(0x8a6a3a);
 const P=(s,th)=>[A.a*s*Math.cos(th),A.b*s*Math.sin(th)];
 // a ring slab between the ellipses s0 and s1, its top at y, 0.3 thick
 const ring=(s0,s1,y)=>{const sh=new THREE.Shape(),N=144;for(let i=0;i<=N;i++){const p=P(s1,i/N*TAU);if(i)sh.lineTo(p[0],-p[1]);else sh.moveTo(p[0],-p[1]);}
  const h=new THREE.Path();for(let i=0;i<=N;i++){const p=P(s0,-i/N*TAU);if(i)h.lineTo(p[0],-p[1]);else h.moveTo(p[0],-p[1]);}sh.holes.push(h);
  const g=new THREE.ExtrudeGeometry(sh,{depth:.3,bevelEnabled:false,curveSegments:1});g.rotateX(-Math.PI/2);g.translate(0,y-.3,0);const m=mesh(g,fl,G);if(m)m.userData.inspectLabel='arena floor';};
 // a straight wall from a to b (local x, z), y0..y1, with door gaps at fractions along it
 const wall=(a,b,y0,y1,doors)=>{const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz),ry=Math.atan2(-dz,dx);let u=0;
  const seg=(u0,u1,ya,yb)=>{if(u1-u0<.03||yb-ya<.03)return;const m=(u0+u1)/2;vB('vPlaster',a[0]+dx*m/L,ya,a[1]+dz*m/L,u1-u0,yb-ya,.2,ry,plC);};
  for(const d of(doors||[])){const c=d.f*L;seg(u,c-d.w/2,y0,y1);seg(c-d.w/2,c+d.w/2,y0+2.3,y1);u=c+d.w/2;}seg(u,L,y0,y1);};
 const y0=A.y,y1=A.y+A.h,N=A.bays,th=k=>k/N*TAU,gates=new Set(A.gates);
 ring(A.sIn-.03,A.sOut+.015,y0);ring(A.sIn-.03,A.sOut+.015,y1+.3);
 for(let k=0;k<N;k++){
  // the wall behind the bay (toward the stands), straight between the bay's corners; open at a gate's corner, where the passage
  // goes under the stands
  wall(P(A.sIn,th(k)),P(A.sIn,th(k+1)),y0,y1,(gates.has(k)?[{f:0,w:2.4}]:[]).concat(gates.has((k+1)%N)?[{f:1,w:2.4}]:[]));
  // the radial partition at th(k): a door at mid-depth, or (at a gate) the gate itself in the shell
  if(gates.has(k)){const t=th(k),n=[Math.cos(t)/A.a,Math.sin(t)/A.b],nl=Math.hypot(n[0],n[1]),ry=Math.atan2(n[0]/nl,n[1]/nl),g=P(A.sGate,t);
   for(const s of[-1,1]){const q=loc(g[0],g[1],s*A.gateW/4,0,ry);IZDOOR.leaf(q[0],y0,q[1],ry,A.gateW/2-.04,A.gateH-.05,.12,brz,{mirror:s>0});}
   const l=loc(g[0],g[1],0,.1,ry);vB('vStone',l[0],y0+A.gateH,l[1],A.gateW+.6,.5,.9,ry,vC(0xd4a05a));
   // the gate's threshold: a stone sill through the shell, level with the hall's floor, and a step down to the street outside
   {const a=loc(g[0],g[1],0,-.9,ry),b=loc(g[0],g[1],0,.9,ry),m0=loc(g[0],g[1],0,0,ry);vB('vStone',m0[0],0,m0[1],A.gateW+.2,y0,1.8,ry,vC(0xcdb88e));
    if(typeof KWALK!=='undefined'){const q=[[-A.gateW/2,-1.2],[A.gateW/2,-1.2],[A.gateW/2,.9],[-A.gateW/2,.9]].map(([u,v])=>{const r=loc(g[0],g[1],u,v,ry);return IZDOOR._w(r[0],y0,r[1]);});KWALK.poly({pts:q.map(p=>[p[0],p[2],p[1]]),name:'arena gate sill',tag:'interior:iziz_arena'});}}}
  else{const a=P(A.sIn,th(k)),b=P(A.sWall,th(k)),f=(A.sDoor-A.sIn)/(A.sWall-A.sIn);wall(a,b,y0,y1,[{f,w:1.1}]);
   const m=P(A.sDoor,th(k)),ry=Math.atan2(-(b[1]-a[1]),b[0]-a[0]);IZDOOR.leaf(m[0],y0,m[1],ry,1.06,2.2,.06,brz);}}
 // ---- the bowl (the owner, 2026-10-19: "it needs real stairs to get to the seats"): the stands are the kit's six tiers (77z, at
 // kit scale K), each a ring of two halves, the inner a step 2 m (kit) above the outer. Their tops go into core/walk; four
 // aisles of real steps (0.2 m risers) climb from the arena's floor to the top tier on the long and short axes; a passage
 // from each gate hall runs under the stands to the floor (the kit opens the wall and the lowest tier over it).
 const K=A.a/48,W=typeof KWALK!=='undefined'?KWALK:null,tag='interior:iziz_arena',stC=vC(0xd8c4a0);
 const wp=(x,y,z)=>IZDOOR._w(x,y,z),wxz=(x,z,y)=>{const q=wp(x,y,z);return[q[0],q[2],q[1]];};
 const T=[];for(let k=0;k<6;k++){const a=(48-9-k*3.1),b=(40-8-k*2.7);T.push({a,b,y:12-k*2});}
 const tierAt=(r,ax)=>{for(const t of T){const rr=ax?r*t.a/t.b:r;if(rr>=t.a-3.1&&rr<=t.a)return rr<t.a-1.55?t.y+2:t.y;}return null;};   /* kit units: the stands' top at radius r on an axis */
 if(W){for(const t of T)for(const [r0,r1,y] of[[t.a-3.1,t.a-1.55,t.y+2],[t.a-1.55,t.a,t.y]]){const n=96;
   for(let i=0;i<n;i++){if(i%24===0)continue;   /* the aisles' slot (the kit opens the tiers there) */
    const q=[];for(const [rr,tt] of[[r0,i-.5],[r1,i-.5],[r1,i+.5],[r0,i+.5]]){const th=tt/n*TAU;q.push(wxz(rr*K*Math.cos(th),rr*K*t.b/t.a*Math.sin(th),y*K));}W.poly({pts:q,name:'arena stands',tag});}}
  {const q=[];for(let i=0;i<32;i++){const th=i/32*TAU;q.push(wxz(20*K*Math.cos(th),16*K*Math.sin(th),.4*K));}W.poly({pts:q,name:'arena floor',tag});}}
 // the aisles: steps from the floor's edge up to the top tier's raised inner half (its back half is 2 m lower), each a block down to the ground
 for(const [ux,uz] of[[1,0],[-1,0],[0,1],[0,-1]]){const ax=uz!==0,R0=(ax?16.3:20.3)*K,R1=(ax?30:36.6)*K,yTop=14*K,yb=.4*K,run=R1-R0,n=Math.ceil((yTop-yb)/.2),rise=(yTop-yb)/n,dep=run/n,ry=Math.atan2(ux,uz);
  for(let i=0;i<n;i++){const r=R0+dep*(i+.5);vB('vStone',ux*r,0,uz*r,1.8,yb+rise*(i+1),dep+.01,ry,stC);}
  if(W){W.strip({a:wxz(ux*(R0-.3),uz*(R0-.3),yb),b:wxz(ux*R1,uz*R1,yTop),w:1.7,name:'arena aisle',tag});
   const R2=(ax?30.7:37.4)*K,px=-uz,pz=ux;W.poly({pts:[[R1,-.9],[R2,-.9],[R2,.9],[R1,.9]].map(([r,o])=>wxz(ux*r+px*o,uz*r+pz*o,yTop)),name:'arena aisle head',tag});}}   /* the head in the top tier's slot */
 // the passages: from each gate hall's inner door under the stands to the floor
 if(W)for(const g of A.gates){const t=th(g),a=P(A.sIn,t),b=[20*K*Math.cos(t)*.98,16*K*Math.sin(t)*.98];W.strip({a:wxz(a[0]+(b[0]-a[0])*-.02,a[1]+(b[1]-a[1])*-.02,y0),b:wxz(b[0],b[1],.4*K),w:2.2,name:'arena passage',tag});}}
VERN.def({key:'iziz_arena_ix',name:'Arena — the ring of bays',family:'civic',tags:{type:['civic'],wealth:'civic',lit:true},w:82,d:68,h:22,build:buildIzizArenaIx});
