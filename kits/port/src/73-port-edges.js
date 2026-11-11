// ================================================================ PORT EDGES
// The edge treatments every segment needs: paving on the deck, the vertical
// quay wall, the rock revetment, side closure against a neighbour, and a deck
// carried on columns. All take LOCAL coordinates (the builder's KOFF frame)
// and the builder's group G; walls and slabs go into the pbAdd batch (merged
// into one mesh per material when the builder returns), repeated detail goes
// through the kit. None of them draws from anything but the builder's own
// seeded rng(), so they are deterministic inside a builder.
MAT.pkRip=new THREE.MeshStandardMaterial({map:TEX.concrete,color:0x958e84,roughness:1,side:DS});

// ---------------------------------------------------------------- paving
// A paving sheet over [x0,x1] x [z0,z1] at o.y (default DECK+0.03), 4 m slabs.
// At d>=1 slabs are missing (o.broken, default .22 at d=1, .08 at d=3) and the
// ground under them shows - give your apron stamp paint:'soil' at d>=1 so
// what shows is earth, not more paving. o.hole(x,z)->true drops a cell too
// (cut the paving round a basin you dug inside it).
function portPaving(G,x0,z0,x1,z1,d,o){o=Object.assign({y:PORT.DECK+.03,cell:4,tile:16,broken:d===1?.22:d>=3?.08:0},o||{});
 const w=x1-x0,dp=z1-z0;if(w<=0||dp<=0)return;
 const nu=Math.max(1,Math.round(w/o.cell)),nv=Math.max(1,Math.round(dp/o.cell));
 const sd=rr(0,99),br=o.broken;
 const hole=(br>0||o.hole)?(u,v)=>{const x=x0+u*w,z=z0+v*dp;if(o.hole&&o.hole(x,z))return true;
  if(!(br>0))return false;const c=clamp((fbm(x/34+sd,z/34,sd,2)-.38)*4,0,2.2);   // clustered: whole patches go
  return h3(Math.floor(x/4),Math.floor(z/4),sd)<br*c;}:null;
 const plain=!hole;
 pbAdd(gridSurface((u,v)=>[x0+u*w,o.y,z0+v*dp],plain?1:nu,plain?1:nv,{uS:w/o.tile,vS:dp/o.tile,hole}),d>0?MAT.pkPaveR:MAT.pkPave,G);}

// ---------------------------------------------------------------- the quay wall
// portQuayWall(G, x0,z0, x1,z1, d, o) -> info
// A vertical wall whose FACE runs along the line (x0,z0)->(x1,z1), from o.top
// (default PORT.DECK) down to below the lowest ground in front of it, built
// o.thick (2.5 m) BEHIND the face, i.e. into the deck. The face looks along
// the normal n = (-(z1-z0), x1-x0)/L - so a wall drawn from x=-110 to x=+110
// at z=0 faces +z, the sea - or along o.face=[nx,nz] if given, or the
// opposite of n with o.flip. With the stamp boundary rule (terrain cliffs
// fall on the high side) the wall's thickness hides the ground's cliff.
// Dressing, all optional: white coping blocks (o.cope), a weed band at the
// tide line (o.tide), rubber fenders every o.fenders m (0 = none), ladders
// every o.ladders m, bollards every o.bollards m set o.bollardSet back.
// d=1: coping blocks missing and knocked askew, some fallen to the toe,
// fenders gone or dropped, bollards gone, rust stains, vines, moss.
// d>=3: as ruined but tyres hung where fenders were lost.
// o.gaps=[[s0,s1],...] leaves stretches (metres along the wall) unbuilt.
// Returns {L,t,n,yaw,top,yb,at(s,off)->[x,z],ladders:[[x,z]],bollards:[[x,z]]}.
function portQuayWall(G,x0,z0,x1,z1,d,o){
 o=Object.assign({top:PORT.DECK,thick:2.5,cope:true,tide:true,fenders:12,ladders:44,bollards:22,bollardSet:1.8,gaps:[]},o||{});
 const dx=x1-x0,dz=z1-z0,L=Math.hypot(dx,dz);if(L<.5)return null;
 const tx=dx/L,tz=dz/L;let nx=-tz,nz=tx;
 if(o.face){const f=Math.hypot(o.face[0],o.face[1])||1;nx=o.face[0]/f;nz=o.face[1]/f;}else if(o.flip){nx=-nx;nz=-nz;}
 const at=(s,off)=>[x0+tx*s+nx*(off||0),z0+tz*s+nz*(off||0)];
 let yb=o.bottom;
 if(yb===undefined){let m=1e9;for(let s=0;s<=L+.01;s+=Math.min(3,L/2)){const p=at(Math.min(s,L),1.2);m=Math.min(m,portH(p[0],p[1]));}
  yb=Math.min(m-2,o.top-3);}
 const yaw=Math.atan2(nx,nz);                  // local +z = the face normal, local x runs along the wall
 const q=qEuler(0,yaw,0),qn=qFacing([nx,0,nz]);
 const mat=o.mat||CONC(d),H=o.top-yb,ruin=d>=1;
 // pieces between the gaps
 const gaps=o.gaps.slice().sort((a,b)=>a[0]-b[0]);const pcs=[];let s0=0;
 for(const g of gaps){if(g[0]>s0)pcs.push([s0,Math.min(g[0],L)]);s0=Math.max(s0,g[1]);}if(s0<L)pcs.push([s0,L]);
 const inGap=s=>gaps.some(g=>s>=g[0]-.5&&s<=g[1]+.5);
 for(const [a,b] of pcs){const len=b-a,mid=(a+b)/2;if(len<.2)continue;
  const c=at(mid,-o.thick/2);pbBox(G,mat,c[0],(o.top+yb)/2,c[1],len,H,o.thick,yaw,8,true);
  if(o.tide){const t=at(mid,.07);pbBox(G,MAT.pkTide,t[0],-.45,t[1],len,2.7,.14,yaw,8,true);}}
 const info={L,t:[tx,tz],n:[nx,nz],yaw,top:o.top,yb,at,ladders:[],bollards:[]};
 if(o.cope)for(let s=0;s<L-.3;s+=5){const len=Math.min(5,L-s)-.04,m=s+len/2;if(inGap(m))continue;
  const p=at(m,-.55);
  if(ruin&&rng()<(d===1?.12:.06)){                       // a block gone - sometimes lying at the toe
   if(rng()<.5){const f=at(m+rr(-1,1),rr(2,5));kput('pkCope',[f[0],portH(f[0],f[1])+.4,f[1]],qEuler(rr(-.5,.5),yaw+rr(-.6,.6),rr(-.4,.4)),[len,.4,1.3],new THREE.Color(0x8a857c));}
   continue;}
  const col=ruin?new THREE.Color().setHSL(.08,rr(.04,.1),rr(.46,.6)):null;
  kput('pkCope',[p[0],o.top+.2+(ruin?rr(-.06,.04):0),p[1]],ruin?qEuler(rr(-.03,.03),yaw+rr(-.025,.025),rr(-.04,.04)):q,[len,.4,1.3],col);
  if(ruin&&rng()<.35)kput('moss',[p[0]+rr(-1.5,1.5)*nz,o.top+.42,p[1]-rr(-1.5,1.5)*nx],null,[rr(.4,1.1),.18,rr(.4,.9)],new THREE.Color().setHSL(rr(.22,.3),.4,rr(.08,.14)));}
 if(o.fenders>0)for(let s=o.fenders/2;s<L;s+=o.fenders){if(inGap(s))continue;const p=at(s,.47);
  if(ruin&&rng()<.45){
   if(d>=3){for(let k=0;k<3;k++){const pt=at(s,.32);kput('pkTyre',[pt[0],o.top-1-k*1.05,pt[1]],qn,1,null);}}
   continue;}
  if(ruin&&rng()<.25){kput('pkFender',[p[0],o.top-2.4,p[1]],qEuler(rr(-.25,.25),0,rr(-.25,.25)),[1,4.6,1],null);continue;}
  kput('pkFender',[p[0],o.top-.5,p[1]],null,[1,4.6,1],null);}
 if(o.ladders>0)for(let s=o.ladders/2;s<L;s+=o.ladders){if(inGap(s))continue;const p=at(s,.12);
  info.ladders.push(at(s,0));
  if(d===1&&rng()<.3)continue;
  kput('pkLadder',[p[0],o.top,p[1]],q,[1,(o.top+2.6)/10,1],ruin?new THREE.Color(0x8a5a3a):null);}
 if(o.bollards>0)for(let s=o.bollards/2;s<L;s+=o.bollards){if(inGap(s))continue;const p=at(s,-o.bollardSet);
  info.bollards.push(p);if(ruin&&rng()<(d===1?.3:.12))continue;
  kput('pkBollard',[p[0],o.top,p[1]],qEuler(0,rng()*TAU,0),1,ruin?new THREE.Color(0x9a6040):null);}
 if(ruin){const nS=Math.round(L/9),nV=Math.round(L/(d===1?7:12));
  for(let i=0;i<nS;i++){const s=rr(0,L);if(inGap(s))continue;const p=at(s,.09),len=rr(2.5,Math.max(3,o.top-yb>8?7:4));
   kput('stain',[p[0],o.top-len/2,p[1]],qn,[rr(1.2,3.5),len,1],null);}
  for(let i=0;i<nV;i++){const s=rr(0,L);if(inGap(s))continue;const p=at(s,.3);
   kput('vine',[p[0],o.top+.35,p[1]],qEuler(rr(-.1,.1),rng()*TAU,rr(-.1,.1)),[rr(.8,1.6),rr(2,Math.max(2.5,o.top+.5)),rr(.8,1.6)],null);}}
 return info;}

// ---------------------------------------------------------------- revetment
// portRevetment(G, x0,z0, x1,z1, d, o): a rock-armoured slope - riprap - in a
// band o.width (16 m) wide on the n side of the line (same normal rule as
// portQuayWall; o.face / o.flip). It does NOT shape the ground: stamps did
// that. It lays a rough rock skin 12 cm over whatever ground is there
// between o.toe (-7) and o.top (DECK+0.5), and scatters boulders on it.
// Use it on the slopes a stamp's soft ring leaves round a quay corner, a mole
// or a basin mouth.
function portRevetment(G,x0,z0,x1,z1,d,o){o=Object.assign({width:16,top:PORT.DECK+.5,toe:-7,density:.16,smax:2.2},o||{});
 const dx=x1-x0,dz=z1-z0,L=Math.hypot(dx,dz);if(L<.5)return;
 const tx=dx/L,tz=dz/L;let nx=-tz,nz=tx;
 if(o.face){const f=Math.hypot(o.face[0],o.face[1])||1;nx=o.face[0]/f;nz=o.face[1]/f;}else if(o.flip){nx=-nx;nz=-nz;}
 const P=(s,w)=>[x0+tx*s+nx*w,z0+tz*s+nz*w];
 const nu=Math.max(2,Math.round(L/3)),nv=Math.max(2,Math.round(o.width/2.5));
 pbAdd(gridSurface((u,v)=>{const p=P(u*L,v*o.width);return[p[0],portH(p[0],p[1])+.12+.25*(fbm(p[0]/3,p[1]/3,4.4,2)-.5),p[1]];},nu,nv,
  {uS:L/8,vS:o.width/8,hole:(u,v)=>{const p=P(u*L,v*o.width),h=portH(p[0],p[1]);return h>o.top||h<o.toe;}}),MAT.pkRip,G,true);
 const n=Math.round(L*o.width*o.density);
 for(let i=0;i<n;i++){const s=rr(0,L),w=Math.pow(rng(),.8)*o.width;const p=P(s,w),h=portH(p[0],p[1]);
  if(h>o.top||h<o.toe)continue;const sz=rr(.6,o.smax);
  kput('rubble',[p[0],h+sz*.25,p[1]],qEuler(rng()*3,rng()*3,rng()*3),[sz*rr(.8,1.4),sz*rr(.55,.9),sz*rr(.8,1.3)],
   new THREE.Color().setHSL(rr(.06,.1),rr(.06,.14),rr(.1,.2)));
  if(d>=1&&rng()<.25)kput('moss',[p[0],h+sz*.55,p[1]],null,[sz*.8,sz*.2,sz*.8],new THREE.Color().setHSL(rr(.2,.3),.4,rr(.08,.14)));}}

// ---------------------------------------------------------------- side closure
// portSideClose(G, nb, d, o): finish the segment's -x (W) and +x (E) sides
// according to opt.nb. o = {W (defaults to the segment's own registered W), z0:-LAND, z1:0, top:DECK, wall:{...}}:
// z0..z1 is the stretch of the side where YOUR DECK meets the edge (the land
// apron, by default). Per side:
//   seg, dz = 0  flush neighbour: nothing - the deck and the berth continue.
//   seg, dz < 0  neighbour set back |dz| toward the land: your deck sticks
//                out past its quay line, so a quay wall (fenders, ladders)
//                faces its water along your edge from z=dz to z1.
//   seg, dz > 0  neighbour sticks out: it builds the wall. Nothing here.
//   land         natural coast: a short return wall at the corner, then a
//                riprap revetment round the corner over the slopes your
//                stamps' soft rings leave (keep your stamps' soft >= 25).
//   sea          open water: a quay wall along the whole side z0..z1. Add
//                portEdgeStamps(opt,...) to your stamps so there IS water.
// Returns {W:'none'|'wall'|'coast', E:...}.
function portSideClose(G,nb,d,o){o=Object.assign({W:portCurW(),z0:-60,z1:0,top:PORT.DECK,wall:{},landReturn:14},o||{});
 const out={};
 for(const side of ['W','E']){const s=side==='W'?-1:1,xe=s*o.W/2,N=(nb&&nb[side])||{kind:'land',dz:0};
  const wo=Object.assign({face:[s,0],top:o.top},o.wall);
  if(N.kind==='seg'){
   if(N.dz<-.01){portQuayWall(G,xe,Math.max(o.z0,o.z1+N.dz),xe,o.z1,d,wo);out[side]='wall';}else out[side]='none';}
  else if(N.kind==='sea'){portQuayWall(G,xe,o.z0,xe,o.z1,d,wo);portRevetment(G,xe,o.z0+12,xe,o.z0-34,d,{face:[s,0],width:28,top:o.top+.4});out[side]='wall';}
  else{
   portQuayWall(G,xe,o.z1-o.landReturn,xe,o.z1,d,Object.assign({},wo,{fenders:0,ladders:0,bollards:0}));
   portRevetment(G,xe,o.z1+34,xe,o.z1-46,d,{face:[s,0],width:30,top:o.top+.4});
   out[side]='coast';}}
 return out;}
// Stamps a segment adds for its sides (concat them to your stamps() array):
// a dredged strip outside any side whose neighbour is open 'sea'. Nothing for
// 'land' or 'seg'. o = {W, LAND, SEA, y (-12), width (40)}.
function portEdgeStamps(opt,o){o=Object.assign({W:(opt&&opt.W)||PORT.W,LAND:60,SEA:40,y:-12,width:40},o||{});const out=[];
 for(const side of ['W','E']){const N=opt&&opt.nb&&opt.nb[side];if(!N||N.kind!=='sea')continue;const s=side==='W'?-1:1,xe=s*o.W/2;
  out.push({kind:'dig',x0:xe,x1:xe+s*o.width,z0:-o.LAND,z1:o.SEA,y:o.y,soft:30,outside:true});}
 return out;}

// ---------------------------------------------------------------- deck on columns
// portDeckOnPiles(G, x0,z0,x1,z1, d, o) -> info
// A slab of o.thick (1.6 m) with its top at o.top (DECK) over the rect, cut
// into bays o.bay (20 m) long along z, carried on concrete columns (radius
// o.colR) every o.colX (18 m) across and at every bay line, each running
// down into the ground below it. White panelled fascia on the long edges
// (rust at d>0). o.collapse = [bay indices] drops those bays: the slab lies
// broken and tilted into the water below, the columns stand as stubs.
// o.guard: a guard rail along the open long edges (true) - skipped over
// collapsed bays. Returns {bays, collapsed:Set, bayZ(i)->[z0,z1], cols:[[x,z]]}.
function portDeckOnPiles(G,x0,z0,x1,z1,d,o){o=Object.assign({top:PORT.DECK,thick:1.6,bay:20,colX:18,colR:.9,collapse:[],guard:true,fascia:true},o||{});
 const W=x1-x0,Ld=z1-z0,nb=Math.max(1,Math.round(Ld/o.bay)),bl=Ld/nb;
 const col=new Set(o.collapse),mat=CONC(d),cx=(x0+x1)/2;
 const nc=Math.max(2,Math.round(W/o.colX)+1),cols=[];
 const info={bays:nb,collapsed:col,bayZ:i=>[z0+i*bl,z0+(i+1)*bl],cols};
 for(let i=0;i<nb;i++){const za=z0+i*bl,zb=za+bl,zm=(za+zb)/2;
  if(col.has(i)){
   // the span broke at one end and swung down into the water
   // hinged at one end, its far end resting on the seabed
   const up=rng()<.5?1:-1,hinge=up>0?za:zb,far=up>0?zb:za,hy=o.top-o.thick/2-rr(.8,2.2),Ls=bl*.96;
   const drop=hy-(portH(cx,far)+o.thick*.6);const ang=Math.asin(clamp(drop/Ls,.12,.98))*up;
   const g=boxUV(W*rr(.55,.9),o.thick,Ls,8).translate(0,0,up*Ls/2);
   g.rotateX(ang);g.rotateY(rr(-.06,.06));g.translate(cx+rr(-W*.1,W*.1),hy,hinge);
   pbAdd(g,mat,G);
   for(let k=0;k<5;k++)kput('rubble',[cx+rr(-W/2,W/2),portH(cx,zm)+.5,zm+rr(-bl/2,bl/2)],qEuler(rng()*3,rng()*3,rng()*3),rr(.8,2.2),new THREE.Color().setHSL(.08,.08,rr(.4,.55)));
   continue;}
  pbBox(G,mat,cx,o.top-o.thick/2,zm,W,o.thick,bl-.08,0,8);
  if(o.fascia)for(const s of [-1,1])pbBox(G,d>0?MAT.rust:MAT.white,s>0?x1+.15:x0-.15,o.top-o.thick/2-.1,zm,.3,o.thick+.5,bl,0,8);
  if(o.guard)for(const s of [-1,1])for(let z=za+2.5;z<zb;z+=5){if(d===1&&rng()<.3)continue;
   kput('pkGuard',[s>0?x1-.3:x0+.3,o.top,z],qEuler(0,Math.PI/2,0),1,d>0?new THREE.Color(0x8a5a3a):null);}}
 // columns on every bay line that has a standing bay on either side
 for(let i=0;i<=nb;i++){const z=z0+i*bl;const sa=i>0&&!col.has(i-1),sb=i<nb&&!col.has(i);
  for(let c=0;c<nc;c++){const x=x0+2+(W-4)*c/(nc-1);cols.push([x,z]);const gy=portH(x,z)-1;
   const full=o.top-o.thick-gy;
   const h=(sa||sb)?full:full*rr(.3,.75);               // under a lost span only a stump stands
   if(h<=0)continue;
   kput('pkCol',[x,gy,z],null,[o.colR,h,o.colR],d>0?new THREE.Color().setHSL(.07,.08,rr(.42,.55)):null);}}
 return info;}

// ---------------------------------------------------------------- land blocks and sea platforms
// portBlockStamps(opt, o) -> stamps for a place:'land' block or a place:'sea'
// platform (concat your own after them). o = {y (DECK), soft (30), paint,
// depth (-12), width (30), mole (true)}.
//   land  a `flat` at deck level over the whole footprint (soft ring out).
//   sea   mole:true - a `fill` to deck level over the footprint, and a dredged
//         strip (outside:true, the one allowed exception to "inside the
//         footprint") beyond every W/E/S stretch no neighbour covers;
//         mole:false - the strips only (put your deck on portDeckOnPiles).
function portBlockStamps(opt,o){const pl=opt.place||portPlaceOf(opt.key),W=opt.W,h=W/2;
 o=Object.assign({y:PORT.DECK,soft:30,depth:-12,width:30,mole:true},o||{});const out=[];
 if(pl==='land'){out.push({kind:'flat',x0:-h,z0:-opt.LAND,x1:h,z1:0,y:o.y,soft:o.soft,paint:o.paint||(opt.d>=1?'soil':'pave')});return out;}
 const z0=0,z1=opt.SEA,w=o.width;
 if(o.mole)out.push({kind:'fill',x0:-h,z0,x1:h,z1,y:o.y,paint:o.paint||(opt.d>=1?'soil':'pave')});
 const side=(nm,a,b,mk)=>{for(const [p,q] of portSideOpen(opt.nb,nm,a,b))out.push(Object.assign({kind:'dig',y:o.depth,soft:o.soft,outside:true},mk(p,q)));};
 side('W',z0,z1,(p,q)=>({x0:-h-w,x1:-h,z0:p,z1:q}));side('E',z0,z1,(p,q)=>({x0:h,x1:h+w,z0:p,z1:q}));
 side('S',-h,h,(p,q)=>({x0:p,x1:q,z0:z1,z1:z1+w}));
 return out;}
// portBlockClose(G, opt, d, o) -> {N,S,W,E: [[a,b,'wall'|'retain'|'face'],...]}
// Finishes all four sides of a land block or a sea platform from opt.nb (see
// "NEIGHBOURS" in 70-port-core.js), stretch by stretch along each side:
//   covered by a neighbour at the same deck  nothing (the deck continues);
//   (sea platform) covered by a coastal      a plain face under the deck
//     segment - the end of a pier's deck     (no coping or fenders);
//   open, sea platform or a 'sea' side       a finished quay wall facing out:
//                                            coping, fenders, ladders, bollards;
//   open, land block                         a retaining wall with coping down
//                                            to the ground outside, no
//                                            fenders: the finished step where a
//                                            neighbour block is set back, or
//                                            the edge on natural land.
// o = {wall:{portQuayWall options for every wall}, sea:{...}, land:{...}}.
function portBlockClose(G,opt,d,o){o=o||{};const pl=opt.place||portPlaceOf(opt.key),h=opt.W/2;
 const z0=pl==='sea'?0:-opt.LAND,z1=pl==='sea'?opt.SEA:0,out={};
 const S={N:{a:-h,b:h,p:s=>[s,z0],face:[0,-1]},S:{a:-h,b:h,p:s=>[s,z1],face:[0,1]},
  W:{a:z0,b:z1,p:s=>[-h,s],face:[-1,0]},E:{a:z0,b:z1,p:s=>[h,s],face:[1,0]}};
 const base=Object.assign({},o.wall||{});
 const seaW=Object.assign({},base,o.sea||{}),landW=Object.assign({tide:false,fenders:0,ladders:0,bollards:0},base,o.land||{});
 for(const nm of ['N','S','W','E']){const s=S[nm],N=opt.nb&&opt.nb[nm];out[nm]=[];
  const wall=(a,b,wo,tag)=>{const A=s.p(a),B=s.p(b);portQuayWall(G,A[0],A[1],B[0],B[1],d,Object.assign({face:s.face},wo));out[nm].push([a,b,tag]);};
  for(const [a,b] of portSideOpen(opt.nb,nm,s.a,s.b)){
   const sea=pl==='sea'||(N&&N.kind==='sea');wall(a,b,sea?seaW:landW,sea?'wall':'retain');}
  if(pl==='sea')for(const l of (N&&N.list)||[])if(l.place==='coast'){const a=Math.max(s.a,l.span[0]),b=Math.min(s.b,l.span[1]);
   if(b-a>.5)wall(a,b,Object.assign({},base,{cope:false,fenders:0,ladders:0,bollards:0,top:PORT.DECK-.2}),'face');}}
 return out;}
