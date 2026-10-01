// ================================================================= THE ENGINES — cyclopean machines of unclear purpose (1 of 2)
// Machinery the Ancients left on the plain, each the size of a town and none
// with an obvious job. Drawn from the crawler excavators, walker rigs, canted
// bores, ring machines and piston towers in the engines reference set: heavy
// plated masses, lattice booms, cable stays, rods and rings, all of it stopped
// and all of it coming apart. This fragment holds the shared helpers and the
// first five; 8ai-engines2.js holds the other five.
//
//   THE HARROW   a crawler on four track units, 320 m long. Its boom snapped
//                and the bucket wheel lies on the plain; one track is thrown,
//                the counterweight is down. A furrow runs 1.5 km behind it.
//   THE STRIDER  a four-legged walker, hull 170 m up, halted mid-stride with
//                one foot lifted. A rear leg has buckled and the hull sags on
//                that corner. A probe runs from its belly to a ring of stones.
//   THE BREECH   a concrete barrel 90 m across, coming out of the ground at 22
//                degrees in a cracked trunnion cradle. Holed along its back;
//                rods stick out of its mouth. Gun or drill: nobody knows.
//   THE GYRE     a 430 m ring standing on edge in a concrete saddle, shedding
//                plates. The pivoted inner ring has broken and a length of it
//                lies on the plain; one buttress is down.
//   THE PRESS    twin concrete piers 500 m tall. The lintel's west end has
//                fallen, taking a counterweight with it. The crosshead hangs
//                jammed mid-stroke over an anvil with one small impression.
//
// Units are metres, x east, z south, y up, like the rest of the kit. Every
// builder is local to its own group at (gx,0,gz). kput is local too, through
// KOFF; a tilted sub-assembly routes its kputs through useGroupXF. The big
// masses are merged meshes with UVs in metres (enBlk, enTube). Detail is
// instanced (plates, struts, pipes, slots).
//
// The `engines` target shows decay 1 only. The builders take d like any other:
// at d 0 the machines are whole and clean (materials through PLATE/CONC/SHELL,
// the ruin pass gated on dd), so an intact variant is a row change.

const EN_SITE={};
// Spoil: the plain's own red soil heaped up (the ground paint is ~rgb 150,82,58),
// a shade darker than the flat so the berms read. The hex is LINEAR (r128 does
// not convert material colours), so it is far darker than it looks. MAT.rock and MAT.mud are
// pale under this sun and read as sand.
const EN_SPOIL=new THREE.MeshStandardMaterial({map:TEX.concrete,color:0x6a2412,roughness:1,side:DS});
function enV(a){return new THREE.Vector3(a[0],a[1],a[2]);}
// two unit vectors perpendicular to axis `ax` (and to each other); e2 leans up
function enFrame(ax){const up=Math.abs(ax.y)>.9?new THREE.Vector3(1,0,0):new THREE.Vector3(0,1,0);
 const e1=new THREE.Vector3().crossVectors(ax,up).normalize();const e2=new THREE.Vector3().crossVectors(e1,ax).normalize();return[e1,e2];}
// a point given in a sub-group's frame, in the builder's frame
function enToW(P,p){P.updateMatrix();return new THREE.Vector3(p[0],p[1],p[2]).applyMatrix4(P.matrix).toArray();}
// A box with its UVs in metres (one texture tile per 8 m), pushed onto `acc`
// for one meshMerged call per material. Instanced boxes stretch the texture
// across a 400 m pier, which is why the masses are not kput.
function enBlk(acc,cx,cy,cz,sx,sy,sz){const g=new THREE.BoxGeometry(sx,sy,sz),uv=g.attributes.uv;
 const F=[[sz,sy],[sz,sy],[sx,sz],[sx,sz],[sx,sy],[sx,sy]];
 for(let i=0;i<24;i++){const f=F[i>>2];uv.setXY(i,uv.getX(i)*f[0]/8,uv.getY(i)*f[1]/8);}
 g.translate(cx,cy,cz);acc.push(g);return g;}
// One such box as its own mesh, placed and turned: a fallen block.
function enRotBlk(parent,mat,p,sz,rx,ry,rz){const a=[];enBlk(a,0,0,0,sz[0],sz[1],sz[2]);
 const m=mesh(a[0],mat,parent,p[0],p[1],p[2]);m.rotation.set(rx||0,ry||0,rz||0);return m;}
// A tube round the segment a->b, radius rFn(t) with t in metres from a.
// hole(u,t) drops a quad, like holeFn's predicate. nu=4 or 6 gives a prism.
function enTube(a,b,rFn,nu,nv,hole){const A=enV(a),B=enV(b),ax=B.clone().sub(A),L=ax.length();ax.normalize();const E=enFrame(ax),e1=E[0],e2=E[1];
 const opt={uS:rFn(0)*TAU/8,vS:L/8};if(hole)opt.hole=(u,v)=>hole(u,v*L);
 return gridSurface((u,v)=>{const th=u*TAU,t=v*L,r=rFn(t),c=Math.cos(th)*r,s=Math.sin(th)*r;
  return[A.x+ax.x*t+e1.x*c+e2.x*s,A.y+ax.y*t+e1.y*c+e2.y*s,A.z+ax.z*t+e1.z*c+e2.z*s];},nu,nv,opt);}
// A flat annulus (or disc, rIn 0) centred on c, facing along `axis`.
function enRing(c,axis,rIn,rOut,nu){const C=enV(c),ax=enV(axis).normalize();const E=enFrame(ax),e1=E[0],e2=E[1];
 return gridSurface((u,v)=>{const th=u*TAU,r=lerp(rIn,rOut,v),co=Math.cos(th)*r,s=Math.sin(th)*r;
  return[C.x+e1.x*co+e2.x*s,C.y+e1.y*co+e2.y*s,C.z+e1.z*co+e2.z*s];},nu,1,{uS:rOut*TAU/8,vS:(rOut-rIn)/8});}
// A square lattice truss from a to b: four chords, a zigzag brace on every face
// of every bay, and a frame at every bay end. `bar` is the brace thickness.
// `miss` (0..1) is the share of braces rusted out; the chords always stand.
function enTruss(name,a,b,w,bay,bar,miss){const A=enV(a),B=enV(b),ax=B.clone().sub(A),L=ax.length();ax.normalize();const E=enFrame(ax),e1=E[0],e2=E[1];
 const cn=[[1,1],[1,-1],[-1,-1],[-1,1]],m=miss||0;
 const P=(t,k)=>{const c=cn[k%4];return A.clone().addScaledVector(ax,t).addScaledVector(e1,c[0]*w/2).addScaledVector(e2,c[1]*w/2).toArray();};
 for(let k=0;k<4;k++)beam(name,P(0,k),P(L,k),bar*1.7,bar*1.7);
 const n=Math.max(1,Math.round(L/bay));
 for(let i=0;i<n;i++){const t0=i*L/n,t1=(i+1)*L/n;
  for(let k=0;k<4;k++){if(!(m&&rng()<m))beam(name,i%2?P(t0,k):P(t0,k+1),i%2?P(t1,k+1):P(t1,k),bar,bar);
   if(!(m&&rng()<m*.6))beam(name,P(t1,k),P(t1,k+1),bar,bar);}}}
// A cubic lattice cage, edge s, centred at (cx,cy,cz): twelve edges and an X on
// each side face.
function enCage(name,cx,cy,cz,s,bar){const h=s/2,V=(i,j,k)=>[cx+i*h,cy+j*h,cz+k*h];
 for(const i of[-1,1])for(const j of[-1,1]){beam(name,V(i,j,-1),V(i,j,1),bar,bar);beam(name,V(i,-1,j),V(i,1,j),bar,bar);beam(name,V(-1,i,j),V(1,i,j),bar,bar);}
 for(const i of[-1,1]){beam(name,V(i,-1,-1),V(i,1,1),bar*.7,bar*.7);beam(name,V(i,-1,1),V(i,1,-1),bar*.7,bar*.7);
  beam(name,V(-1,-1,i),V(1,1,i),bar*.7,bar*.7);beam(name,V(1,-1,i),V(-1,1,i),bar*.7,bar*.7);}}
// A plated deck: one mass, proud ribs every `rib` m on the long faces, and dark
// slot windows every `slot` m of height, round all four sides.
function enDeck(acc,cx,y0,cz,sx,h,sz,rib,slot,pl){enBlk(acc,cx,y0+h/2,cz,sx,h,sz);
 for(let x=cx-sx/2+rib/2;x<cx+sx/2;x+=rib)for(const s of[-1,1])kput(pl,[x,y0+h/2,cz+s*(sz/2+.6)],null,[1.8,h,1.4]);
 for(let y=y0+5;y<y0+h-3;y+=slot)for(const s of[-1,1]){kput('cellD',[cx,y,cz+s*(sz/2+.05)],null,[sx*.86,1.5,1]);
  kput('cellD',[cx+s*(sx/2+.05),y,cz],qEuler(0,Math.PI/2,0),[sz*.8,1.5,1]);}}
// Breaches in a block's two long (+-z) faces round height cy: dark gutted
// recesses, each maybe with a torn plate peeling off below it.
function enBreach(cx,cy,cz,sx,sz,n,pl){for(let i=0;i<n;i++){const s=rng()<.5?-1:1,x=cx+rr(-.4,.4)*sx,y=cy+rr(-6,6),w=rr(8,26),h=rr(5,13);
 kput('boxD',[x,y,cz+s*(sz/2+.2)],null,[w,h,1]);
 if(rng()<.6)kput(pl,[x+rr(-w/3,w/3),y-h/2-rr(2,5),cz+s*(sz/2+2.2)],qEuler(s*rr(.3,.9),0,rr(-.4,.4)),[w*.5,h*.8,.8]);}}
// Rubble and plate shards scattered round a fall site, r m across.
function enDebris(x,z,r,n,pl){for(let i=0;i<n;i++){const a=rng()*TAU,q=Math.sqrt(rng())*r,s=rr(2,9),px=x+q*Math.cos(a),pz=z+q*Math.sin(a);
 if(rng()<.55)kput(pl,[px,s*.12,pz],qEuler(rr(-.5,.5),rng()*TAU,rr(-.5,.5)),[s*rr(1,2.2),s*.18,s*rr(.8,1.6)]);
 else kput('rubble',[px,s*.3,pz],qEuler(rng()*3,rng()*3,rng()*3),[s*.8,s*.5,s*.7],new THREE.Color().setHSL(rr(.05,.09),rr(.1,.3),rr(.3,.5)));}}
// The plain taking a machine back: moss on what faces the sky, vines off the
// ledges, stains down the walls. geos are in the frame kput is in right now.
function enOvergrow(geos,n,vl,cx,cz){mossOnSurface(geos,0,0,0,n,5);vinesFromLedge(geos,0,0,0,Math.round(n*.5),vl,cx,cz);
 stainsFromLedge(geos,0,0,0,Math.round(n*.6),vl*1.4,cx,cz);}
// A low heap of spoil round (x,z): radius r, height h.
function enHeap(G,x,z,r,h,seed){mesh(gridSurface((u,v)=>{const th=u*TAU,rr0=v*r*(1+.15*fbm(u*6,1.7,seed,2)),px=rr0*Math.cos(th),pz=rr0*Math.sin(th);
 const q=clamp(1-rr0/r,0,1);return[x+px,h*q*q*(3-2*q)*(.7+.6*fbm(px/30,pz/30,seed+1,3))-.6,z+pz];},48,14,{uS:r/8,vS:r/16}),EN_SPOIL,G);}
// One crawler track: a stadium loop of shoes round a dark frame, road wheels
// along the bottom run, drive sprockets at the two ends. Long axis x.
// brk: the track is THROWN — the upper run is gone off the loop and lies on the
// ground trailing away from the front sprocket.
function enTrack(cx,cz,len,rad,wid,pl,brk){const st=len-2*rad,per=2*st+TAU*rad,n=Math.round(per/5.2);let lost=0;
 for(let i=0;i<n;i++){const s=i/n*per;let x,y,a;
  if(s<st){x=-st/2+s;y=0;a=0;}
  else if(s<st+Math.PI*rad){a=(s-st)/rad;x=st/2+Math.sin(a)*rad;y=rad-Math.cos(a)*rad;}
  else if(s<2*st+Math.PI*rad){x=st/2-(s-st-Math.PI*rad);y=2*rad;a=Math.PI;}
  else{const q=(s-2*st-Math.PI*rad)/rad;x=-st/2-Math.sin(q)*rad;y=rad+Math.cos(q)*rad;a=Math.PI+q;}
  if(brk&&s>st+Math.PI*rad*.6&&s<2*st+Math.PI*rad*1.2){lost++;continue;}
  kput(pl,[cx+x,y+1.2,cz],qEuler(0,0,a),[4.5,2.4,wid]);
  if(i%2===0)kput('boxD',[cx+x,y+1.2,cz],qEuler(0,0,a),[1.2,3.4,wid*.7]);}   // the grouser
 if(brk){let px=cx+st/2+rad+3,pz=cz,h=.25;
  for(let k=0;k<lost;k++){h+=rr(-.12,.12);px+=Math.cos(h)*5.2;pz+=Math.sin(h)*5.2*Math.sign(cz||1);
   kput(pl,[px,1.2,pz],qEuler(rr(-.08,.08),-h*Math.sign(cz||1),rr(-.1,.1)),[4.5,2.4,wid]);}}
 kput('boxD',[cx,rad+1.2,cz],null,[st+rad*.9,rad*1.5,wid*.84]);
 for(let k=0;k<6;k++)kput('pipeR',[cx-st/2+rad*.6+k*(st-rad*1.2)/5,rad*.5+1,cz],qEuler(Math.PI/2,0,0),[rad*.42,wid*.92,rad*.42]);
 for(const e of[-1,1])kput('pipeR',[cx+e*st/2,rad+1.2,cz],qEuler(Math.PI/2,0,0),[rad*.82,wid*.96,rad*.82]);}
// Cables hanging from a point, `n` of them, lengths lo..hi, never through the ground.
// 'tube' is centred and dark (a cable); 'vine' hangs from its origin and is green.
function enHang(name,pts,lo,hi,r){for(const p of pts){const L=Math.min(rr(lo,hi),p[1]-1.5);if(L<2)continue;
 const q=qEuler(rr(-.03,.03),0,rr(-.03,.03));
 if(name==='vine')kput('vine',[p[0],p[1],p[2]],q,[r,L,r],null);else kput(name,[p[0],p[1]-L/2,p[2]],q,[r,L,r],null);}}

// ---------------------------------------------------------------- THE HARROW
function buildHarrow(scene,gx,gz,d){reseed(10100+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const PL=PLATE(d),hull=[],dd=d>0?1:0;
 // four crawler units under four bogie pylons and slewing drums; the front
 // right one has thrown its track
 const TR=[[-112,-66,0],[-112,66,0],[112,-66,0],[112,66,dd]];
 for(const t of TR){enTrack(t[0],t[1],92,17,34,PL,t[2]);
  enBlk(hull,t[0],53,t[1],34,38,30);
  kput('pipeR',[t[0],74,t[1]],null,[22,6,22]);
  for(const s of[-1,1])kput('pipeR',[t[0]+s*10,54,t[1]*1.26],null,[3,40,3]);}
 // the chassis and the stepped superstructure, breached along both flanks
 enBlk(hull,0,86,0,310,20,176);
 for(const s of[-1,1])enBlk(hull,0,70,s*66,200,12,14);
 enDeck(hull,0,96,0,250,42,146,12,9,PL);
 enDeck(hull,-20,138,0,190,34,112,10,8,PL);
 enDeck(hull,-60,172,0,110,30,78,9,7,PL);
 enDeck(hull,58,172,0,46,18,58,8,6,PL);            // the forward cab
 if(dd){enBreach(0,117,0,250,146,9,PL);enBreach(-20,155,0,190,112,6,PL);enBreach(-60,187,0,110,78,3,PL);}
 // exhaust stacks, banded; the third sheared off and lying across deck 2
 for(const x of dd?[-95,-70]:[-95,-70,-45]){kput('pipeR',[x,237,20],null,[5,70,5]);
  for(let y=214;y<270;y+=14)kput('ringR',[x,y,20],qEuler(Math.PI/2,0,0),[5.6,5.6,14]);}
 if(dd){kput('pipeR',[-45,210,20],null,[5,16,5]);beam('pipeR',[-38,177,-26],[34,176,44],5,5);}
 // the rear counterweight on two truss arms; in the ruin one arm has torn and
 // the block lies on the ground, half sunk, where it fell
 if(dd){enTruss('strutR',[-118,146,-32],[-212,150,-32],10,10,1.2,.3);enTruss('strutR',[-118,146,32],[-150,147,32],10,10,1.2,.3);
  enRotBlk(G,MAT.rust,[-238,22,20],[44,60,100],.1,.3,.45);rubbleRing(-238,0,20,34,90,40,5);enDebris(-238,20,80,20,PL);}
 else{for(const s of[-1,1])enTruss('strutR',[-118,146,s*32],[-212,150,s*32],10,10,1.2);
  enBlk(hull,-232,145,0,44,60,100);
  for(let y=121;y<172;y+=10)kput('boxD',[-232,y,0],null,[44.6,1.2,100.6]);}
 // the A-frame
 const AP=[60,300,0];
 for(const s of[-1,1])enTruss('strutR',[18,172,s*48],AP,8,12,1.1,.15*dd);
 kput('pipeR',AP,qEuler(Math.PI/2,0,0),[5,20,5]);
 // the boom: a pivot at the deck's nose, 250 m at 28 degrees
 const P0=[130,120,0],an=28*Math.PI/180,BL=250;
 const E=[P0[0]+BL*Math.cos(an),P0[1]+BL*Math.sin(an),0];
 const BP=t=>[lerp(P0[0],E[0],t),lerp(P0[1],E[1],t),0];
 kput('pipeR',P0,qEuler(Math.PI/2,0,0),[12,60,12]);
 const WZ=26,WR=52,shell=SHELL(d);
 let WC=E;
 if(dd){
  // SNAPPED at 56%: the outer boom hangs straight down off the break on its
  // bottom chords, and the wheel has come off, rolled and lies on its side.
  const S=BP(.56);
  enTruss('strutR',P0,S,22,14,1.6,.12);
  enTruss('strutR',[S[0]+4,S[1]-8,0],[S[0]+34,S[1]-112,8],20,14,1.5,.35);
  beam('tube',[AP[0],AP[1],3],[BP(.45)[0],BP(.45)[1],11],.7,.7);beam('tube',[AP[0],AP[1],-3],[BP(.45)[0],BP(.45)[1],-11],.7,.7);
  enHang('tube',[[AP[0]+4,AP[1]-2,3],[AP[0]+4,AP[1]-2,-3],[AP[0]+6,AP[1]-3,0]],70,150,.7);
  // the fallen wheel, in its own frame so its rims, spokes and buckets tilt as one
  const W=new THREE.Group();W.position.set(400,15,86);W.rotation.set(-1.25,.5,0);G.add(W);
  for(const z of[-8,8])mesh(new THREE.TorusGeometry(WR,3.2,8,72),shell,W,0,0,z);
  useGroupXF(W);
  kput('pipeR',[0,0,-4],qEuler(Math.PI/2,0,0),[8,36,8]);
  for(let k=0;k<10;k++){if(rng()<.25)continue;const a=k/10*TAU;for(const z of[-8,8])beam('strutR',[0,0,z],[WR*Math.cos(a),WR*Math.sin(a),z],2.2,2.2);}
  for(let k=0;k<16;k++){if(rng()<.3)continue;const a=k/16*TAU,px=(WR+5)*Math.cos(a),py=(WR+5)*Math.sin(a);
   kput(PL,[px,py,0],qEuler(0,0,a),[10,12,20]);
   for(const z of[-6,0,6])kput('boxD',[px+6.5*Math.cos(a+.35),py+6.5*Math.sin(a+.35),z],qEuler(0,0,a+.35),[4,1.6,2]);}
  endGroupXF();
  enDebris(400,86,90,40,PL);rubbleRing(400,0,86,40,100,40,5);
  WC=[400,15,86];}
 else{
  enTruss('strutR',P0,E,22,14,1.6);
  for(const t of[.45,.72,.96])for(const s of[-1,1])beam('tube',[AP[0],AP[1],s*3],[BP(t)[0],BP(t)[1],s*11],.7,.7);
  // the wheel, beside the boom head, in the boom's plane, raised to the sky
  for(const z of[WZ-8,WZ+8])mesh(new THREE.TorusGeometry(WR,3.2,8,72),shell,G,E[0],E[1],z);
  kput('pipeR',[E[0],E[1],WZ-4],qEuler(Math.PI/2,0,0),[8,36,8]);
  for(let k=0;k<10;k++){const a=k/10*TAU;for(const z of[WZ-8,WZ+8])beam('strutR',[E[0],E[1],z],[E[0]+WR*Math.cos(a),E[1]+WR*Math.sin(a),z],2.2,2.2);}
  for(let k=0;k<16;k++){const a=k/16*TAU,px=E[0]+(WR+5)*Math.cos(a),py=E[1]+(WR+5)*Math.sin(a);
   kput(PL,[px,py,WZ],qEuler(0,0,a),[10,12,20]);
   for(const z of[-6,0,6])kput('boxD',[px+6.5*Math.cos(a+.35),py+6.5*Math.sin(a+.35),WZ+z],qEuler(0,0,a+.35),[4,1.6,2]);}
  WC=[E[0],E[1],WZ];}
 for(const s of[-1,1])beam('tube',[AP[0],AP[1],s*3],dd&&s>0?[-150,148,34]:[-232,175,s*40],.8,.8);
 // chains hanging off the standing boom
 const hang=[];for(let i=0;i<9;i++){const t=rr(.12,dd?.5:.92),p=BP(t);hang.push([p[0],p[1]-11,rr(-10,10)]);}
 enHang('tube',hang,20,95,.9);
 if(dd)enOvergrow(hull,170,34,0,0);
 meshMerged(hull,MAT.rust,G);
 // THE FURROW. A pair of spoil berms and a centre ridge run back 1.5 km from
 // the tracks. Its base sits under the ground, so the red soil shows in the
 // ruts and only the spoil stands proud.
 const X0=-150,X1=-1700;
 mesh(gridSurface((u,v)=>{const x=lerp(X0,X1,u),z=(v-.5)*250,az=Math.abs(z),fade=Math.pow(1-u,.45)*clamp(u*12,0,1);
  const n=fbm(u*40,v*9,10103,3);
  const h=(13*Math.exp(-Math.pow((az-100)/16,2))+6*Math.exp(-Math.pow(z/20,2))+3*Math.exp(-Math.pow((az-44)/6,2)))*fade*(.45+1.1*n);
  return[x,h-.6,z];},200,64,{uS:200,vS:30}),EN_SPOIL,G);
 for(let i=0;i<70;i++){const x=rr(-160,-1100),z=(rng()<.5?-1:1)*rr(88,112),s=rr(1,4)*(1+x/1400);
  kput('rubble',[x,s*.3,z],qEuler(rng()*3,rng()*3,rng()*3),[s*1.4,s*.8,s*1.2],new THREE.Color().setHSL(rr(.05,.08),rr(.2,.35),rr(.3,.45)));}
 // the foot: spoil against the tracks, plate shed off the flanks, moss, trees,
 // people for scale
 for(const t of TR)rubbleRing(t[0],0,t[1],24,60,22,4);
 if(dd)for(const s of[-1,1])enDebris(0,s*120,120,30,PL);
 scatterMoss(0,0,0,120,300,90+60*dd,4);trees(0,0,160,480,34+40*dd);
 figures(170,110,6,9);
 REGISTER({name:'The Harrow: crawler hull',x:0,y:0,z:0,r:175,h:210});
 REGISTER({name:'The Harrow: the wheel',x:WC[0],y:Math.max(0,WC[1]-60),z:WC[2],r:62,h:122});
 EN_SITE.harrow={x:gx,z:gz,E:E,WC:WC};
 KOFF=[0,0,0];return G;}

// ---------------------------------------------------------------- THE STRIDER
function buildStrider(scene,gx,gz,d){reseed(10110+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const HY=172,dd=d>0?1:0,acc=[];
 // THE BODY is built in its own frame at the hull axis. In the ruin a rear
 // leg has buckled and the frame is rolled and pitched so that corner sags.
 const P=new THREE.Group();P.position.set(0,HY,0);P.rotation.set(-.2*dd,0,.16*dd);G.add(P);
 const W=p=>enToW(P,p);
 // the hull: a superelliptic section swept along x, closing to a nose and a
 // tail. It is the white alloy that never rusts, holed where it has spalled.
 const hk=x=>Math.sqrt(Math.max(0,1-Math.pow(Math.abs(x)/92,3)));
 const hole=holeFn(.55*dd,10113,null,1);
 const pw=(c,e)=>Math.sign(c)*Math.pow(Math.abs(c),e);
 const hullG=gridSurface((u,v)=>{const x=lerp(-92,92,v),th=u*TAU,k=hk(x),c=Math.cos(th),s=Math.sin(th);
  return[x,pw(s,.55)*30*k*(s<0?.78:1),pw(c,.55)*40*k];},44,64,{uS:30,vS:23,hole:hole?(u,v)=>hole(u,v*184):null});
 mesh(hullG,MAT.white,P);
 mesh(gridSurface((u,v)=>{const x=lerp(-88,88,v),th=u*TAU,k=hk(x)*.9,c=Math.cos(th),s=Math.sin(th);
  return[x,pw(s,.55)*27*k,pw(c,.55)*36*k];},24,24,{uS:20,vS:20}),MAT.guts,P);   // the inner hull behind the holes
 useGroupXF(P);
 // the eye in the nose
 kput('ovalD',[90.6,2,0],qEuler(0,Math.PI/2,0),[8,8,3]);
 kput('ringR',[90.8,2,0],qEuler(0,Math.PI/2,0),[10,10,20]);
 // decks and a mast on the back; the mast has snapped and hangs over the side
 enDeck(acc,-12,24,0,104,20,48,8,6,'plateW');
 enDeck(acc,-28,44,0,60,16,34,7,5,'plateW');
 enBlk(acc,30,30,0,26,12,30);
 if(dd){enBreach(-12,34,0,104,48,4,'plateR');
  enTruss('strutR',[-40,60,0],[-40,102,0],6,8,.7,.2);enTruss('strutR',[-40,100,2],[-12,62,34],6,8,.7,.35);}
 else{enTruss('strutR',[-40,60,0],[-40,130,0],6,8,.7);
  for(const s of[-1,1])beam('tube',[-40,128,0],[-40+s*40,46,s*24],.35,.35);}
 for(const z of[-22,0,22])if(!dd||z)beam('pipeR',[-78,26,z],[70,26,z],2.4,2.4);
 // the belly gondola
 enDeck(acc,-6,-52,0,56,18,28,7,5,'plateW');
 for(const s of[-1,1])beam('strutR',[-6+s*20,-34,0],[-6+s*14,-24,0],3,3);
 if(dd)enOvergrow(acc,50,18,0,0);
 mossOnSurface([hullG],0,0,0,90*dd,4);
 endGroupXF();
 meshMerged(acc,MAT.white,P);
 // THE LEGS: hip, thigh up and out to a high knee, shin down to a pad. The
 // front-right leg is lifted mid-stride and never came down. In the ruin the
 // rear-left knee has folded: its thigh runs down to the ground, the shin
 // broke at the knee and lies on the plain with its pad.
 const legs=[[-1,-1,0],[-1,1,0],[1,-1,0],[1,1,1]];
 for(const L of legs){const sx=L[0],sz=L[1],up=L[2],buck=dd&&sx<0&&sz<0;
  const hip=W([sx*58,-18,sz*34]);
  const knee=buck?[-106,12,-88]:up?[sx*114,HY+62,sz*90]:[sx*108,HY+42,sz*92];
  const foot=up?[sx*152,48,sz*104]:[sx*132,0,sz*112];
  kput('pipeR',hip,qEuler(Math.PI/2,0,0),[13,30,13]);
  kput('pipeR',knee,qEuler(Math.PI/2,0,0),[11,26,11]);
  beam('plateW',hip,knee,16,12);
  const mt=[lerp(hip[0],knee[0],.55),lerp(hip[1],knee[1],.55)+8,lerp(hip[2],knee[2],.55)];
  beam('pipeR',W([sx*40,-30,sz*26]),mt,3.2,3.2);
  if(buck){
   beam('plateR',knee,[-120,40,-100],17,15);                       // the jagged stub of the shin
   beam('plateW',[-150,7,-78],[-196,7,-150],12,10);beam('plateR',[-178,9,-122],[-200,9,-158],17,15);
   kput('slabCR',[-206,6,-168],qEuler(.3,0,.9),[18,6,18]);
   enDebris(-150,-110,70,34,'plateW');rubbleRing(-110,0,-90,14,50,26,4);
   continue;}
  const ank=[foot[0],foot[1]+9,foot[2]];
  beam('plateW',knee,ank,12,10);
  beam('plateR',[lerp(knee[0],ank[0],.5),lerp(knee[1],ank[1],.5),lerp(knee[2],ank[2],.5)],ank,17,15);
  beam('pipeR',[lerp(hip[0],knee[0],.7),lerp(hip[1],knee[1],.7)-7,lerp(hip[2],knee[2],.7)],[lerp(knee[0],ank[0],.35),lerp(knee[1],ank[1],.35),lerp(knee[2],ank[2],.35)],2.6,2.6);
  // the pad and three toes
  kput('slabCR',[foot[0],foot[1]+3,foot[2]],null,[18,6,18]);
  const ya=Math.atan2(sz,sx);
  for(const o of[-.6,0,.6]){const a=ya+o;kput('plateR',[foot[0]+22*Math.cos(a),foot[1]+2,foot[2]+22*Math.sin(a)],qEuler(0,-a,0),[16,4,6]);}
  if(!up)rubbleRing(foot[0],0,foot[2],16,40,14,3);}
 // cables hanging from the belly, plumb whatever the hull's lean; the probe
 // to the ground and the ring of stones round its foot
 const hang=[];for(let i=0;i<22;i++){const x=rr(-70,70);hang.push(W([x,-22*hk(x),rr(-18,18)*hk(x)]));}
 enHang('tube',hang,25,150,.7);
 if(dd)for(let i=0;i<8;i++){const a=rng()*TAU,r=rr(10,90);beam('tube',[r*Math.cos(a),.7,r*Math.sin(a)],[r*Math.cos(a)+rr(-40,40),.7,r*Math.sin(a)+rr(-40,40)],.7,.7);}
 const PB=[26,0,4];
 beam('pipeR',W([22,-26,0]),[PB[0],3,PB[2]],2.1,2.1);
 kput('slabCR',[PB[0],.5,PB[2]],null,[8,1,8]);
 for(let k=0;k<11;k++){const a=k/11*TAU,s=rr(1.4,2.4);
  kput('rubble',[PB[0]+14*Math.cos(a),s*.8,PB[2]+14*Math.sin(a)],qEuler(0,a,0),[s,s*2.2,s],new THREE.Color().setHSL(.07,.15,.42));}
 scatterMoss(0,0,0,40,240,70+50*dd,3.5);trees(0,0,150,440,26+30*dd);
 figures(PB[0]-16,PB[2]+20,5,7);
 REGISTER({name:'The Strider: hull',x:0,y:HY-50,z:0,r:95,h:130});
 REGISTER({name:'The Strider: legs',x:0,y:0,z:0,r:175,h:HY});
 EN_SITE.strider={x:gx,z:gz,HY:HY,PB:PB};
 KOFF=[0,0,0];return G;}

// ---------------------------------------------------------------- THE BREECH
function buildBreech(scene,gx,gz,d){reseed(10120+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0,an=22*Math.PI/180,ca=Math.cos(an),sa=Math.sin(an),A=[-150,-40,0],BL=380;
 const P=t=>[A[0]+ca*t,A[1]+sa*t,0];
 const AX=[ca,sa,0],UPV=[-sa,ca,0];
 const off=(t,phi,r)=>{const p=P(t);return[p[0]+UPV[0]*Math.cos(phi)*r,p[1]+UPV[1]*Math.cos(phi)*r,Math.sin(phi)*r];};
 const conc=CONC(d),acc=[];
 // the barrel: stepped collars every 38 m, belling out over the last 40. In
 // the ruin its back is holed between the cradle and the mouth, onto a dark
 // liner inside.
 const bR=t=>44+(((t%38)/38)<.14?5:0)+(t>340?(t-340)*.25:0);
 const hf=holeFn(.5*dd,10124,null,1.4);
 const barrel=enTube(A,P(BL),bR,56,140,hf?(u,t)=>t>150&&t<360&&Math.abs(u-.25)<.22&&hf(u,t):null);
 mesh(barrel,conc,G);
 if(dd)mesh(enTube(P(100),P(372),()=>40,28,30),MAT.dark,G);
 mesh(enRing(P(BL),AX,34,bR(BL),48),conc,G);
 // the bore, the lip, the core drum and the rods
 mesh(enTube(P(BL),P(300),()=>34,40,8),MAT.dark,G);
 mesh(enRing(P(300),AX,0,34,32),MAT.dark,G);
 mesh(enTube(P(372),P(BL+4),()=>35.5,48,2),MAT.verdigris,G);
 mesh(enTube(P(318),P(BL+14),()=>16,32,6),MAT.verdigris,G);
 mesh(enRing(P(BL+14),AX,0,16,24),MAT.verdigris,G);
 for(let k=0;k<8;k++){const ph=k/8*TAU+.2;
  if(dd&&k%3===1){const a=rng()*TAU,r=rr(40,110),x=P(BL)[0]+30+r*Math.cos(a),z=r*Math.sin(a);beam('pipeR',[x,2.2,z],[x+rr(-110,110),2.2,z+rr(-60,60)],2.2,2.2);continue;}
  beam('pipeR',off(340,ph,25),off(470+rr(-20,20),ph,25),2.2,2.2);}
 // two verdigris bands with their faces; the upper one has burst and a length
 // of it lies on the plain
 for(const t0 of[190,290]){const br=dd&&t0===290?(u)=>u>.55&&u<.82:null;
  mesh(enTube(P(t0),P(t0+10),()=>53,56,1,br?(u)=>br(u):null),MAT.verdigris,G);
  for(const t of[t0,t0+10])mesh(enRing(P(t),AX,44,53,56),MAT.verdigris,G);}
 if(dd){const arc=mesh(new THREE.TorusGeometry(53,4.5,6,20,1.7),MAT.verdigris,G,210,4,110);arc.rotation.set(Math.PI/2,0,.6);
  enDebris(200,110,60,24,'plateR');}
 // ribs along the top and pipes along the flanks, on brackets
 for(const ph of[-.35,0,.35])if(!dd||ph)beam(PLATE(d),off(120,ph,50),off(dd&&ph<0?250:360,ph,50),3,3);
 for(const ph of[Math.PI/2,-Math.PI/2]){beam('pipeR',off(110,ph,48.5),off(368,ph,48.5),3.5,3.5);
  for(let t=120;t<368;t+=24)beam('boxD',off(t,ph,44),off(t,ph,49),2,2);}
 // the trunnion cradle; the near pylon has split and its upper half is down
 const T=P(230);
 for(const s of[-1,1]){const split=dd&&s>0;
  if(split){enBlk(acc,T[0],17,s*68,60,34,24);enRotBlk(G,conc,[T[0]+14,15,s*104],[60,26,24],.35,.25,.5);enDebris(T[0],s*110,50,20,'plateR');}
  else enBlk(acc,T[0],30,s*68,60,60,24);
  enBlk(acc,T[0],7,s*72,82,14,36);
  kput('pipeR',[T[0],T[1],s*60],qEuler(Math.PI/2,0,0),[17,26,17]);
  kput('ringR',[T[0],T[1],s*74],null,[18,18,30]);}
 // the gantry tower and the bridge to the barrel's back; in the ruin the
 // tower snapped at 120 m, its top lies on the plain, the bridge hangs
 const BT=off(340,-.25,50);
 if(dd){enTruss('strutR',[130,0,-110],[130,122,-110],16,14,1.2,.25);
  enTruss('strutR',[150,6,-130],[266,8,-214],16,14,1.2,.4);
  enTruss('strutR',BT,[BT[0]-6,BT[1]-58,BT[2]-26],6,8,.6,.3);enDebris(210,-170,70,28,'plateR');}
 else{enTruss('strutR',[130,0,-110],[130,190,-110],16,14,1.2);
  enTruss('strutR',[130,182,-102],BT,6,8,.6);}
 enBlk(acc,130,4,-110,26,8,26);
 if(dd){enOvergrow(acc,40,14,T[0],0);mossOnSurface([barrel],0,0,0,120,5);vinesFromLedge([barrel],0,0,0,50,26,30,0);}
 meshMerged(acc,conc,G);
 // the heap it comes out of
 const MX=-62;
 mesh(gridSurface((u,v)=>{const th=u*TAU,r=v*150*(1+.12*fbm(u*6,1.7,10121,2)),x=r*Math.cos(th),z=r*Math.sin(th);
  const q=clamp(1-r/150,0,1);return[MX+x,52*q*q*(3-2*q)*(.7+.6*fbm(x/30,z/30,10122,3))-.6,z];},72,24,{uS:40,vS:12}),EN_SPOIL,G);
 rubbleRing(MX+20,0,0,60,190,110,6);
 scatterMoss(MX,0,0,60,260,90+50*dd,4);trees(MX,0,160,420,30+30*dd);
 figures(T[0]+30,90,5,8);
 REGISTER({name:'The Breech: barrel',x:30,y:0,z:0,r:190,h:200});
 REGISTER({name:'The Breech: cradle',x:T[0],y:0,z:0,r:80,h:70});
 EN_SITE.breech={x:gx,z:gz,M:P(BL),AX:AX,T:T};
 KOFF=[0,0,0];return G;}

// ---------------------------------------------------------------- THE GYRE
function buildGyre(scene,gx,gz,d){reseed(10130+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0,RC=226,R=196,R2=150,PS=-.66,PL=PLATE(d),acc=[];
 // the outer ring: a dark core torus under sixty plates. In the ruin more
 // than a quarter of them have come off and lie round the saddle.
 mesh(new THREE.TorusGeometry(R,15,10,120),MAT.dark,G,0,RC,0);
 const fallen=[];
 for(let i=0;i<60;i++){const a=i/60*TAU;
  if(dd&&rng()<.28&&Math.sin(a)>-.3){fallen.push(a);continue;}
  kput(PL,[R*Math.cos(a),RC+R*Math.sin(a),0],qEuler(0,0,a),[40,16.2,42]);
  kput('boxD',[(R+20.4)*Math.cos(a),RC+(R+20.4)*Math.sin(a),0],qEuler(0,0,a),[.8,10,30]);}
 // the inner ring, pivoted on the vertical diameter and turned 38 degrees.
 // In the ruin it has broken: a fifth of it is gone from the lower right.
 const ARC=dd?.8:1;
 const inner=mesh(new THREE.TorusGeometry(R2,8,8,96,TAU*ARC),MAT.verdigris,G,0,RC,0);inner.rotation.y=PS;
 const rot=(x,y)=>[x*Math.cos(PS),RC+y,-x*Math.sin(PS)];
 for(let i=0;i<36;i++){const a=i/36*TAU;if(a>TAU*ARC-.05)continue;kput('plateR',rot(R2*Math.cos(a),R2*Math.sin(a)),qEuler(0,PS,a),[20,10,22]);}
 for(const s of[-1,1]){kput('pipeR',[0,RC+s*167,0],null,[7,24,7]);kput('pipeR',[0,RC+s*158,0],null,[11,6,11]);}
 if(dd){const seg=mesh(new THREE.TorusGeometry(R2,8,8,24,TAU*.19),MAT.verdigris,G,70,8,-40);seg.rotation.set(Math.PI/2,0,.3);
  enDebris(150,40,110,40,'plateR');}
 // the core, slung on four spokes (one torn away)
 mesh(new THREE.IcosahedronGeometry(28,1),MAT.verdigris,G,0,RC,0);
 [.25,1.25,2.25,3.25].forEach((q,i)=>{const a=q*Math.PI/2;
  if(dd&&i===3){beam('strutR',[0,RC,0],rot(52*Math.cos(a),52*Math.sin(a)),4.5,4.5);return;}
  beam('strutR',[0,RC,0],rot((R2-8)*Math.cos(a),(R2-8)*Math.sin(a)),4.5,4.5);});
 for(const s of[-1,1])kput('pipeR',[s*18*Math.cos(PS),RC,-s*18*Math.sin(PS)],qEuler(0,PS,Math.PI/2),[9,22,9]);
 // the saddle: stepped concrete blocks each rising to the ring's underside
 const RO=R+21;
 for(let x=-100;x<=100;x+=20){const top=RC-Math.sqrt(RO*RO-x*x);enBlk(acc,x,top/2,0,20.5,top,x===0?80:70);}
 enBlk(acc,0,3,0,260,6,110);
 for(const s of[-1,1])enBlk(acc,s*120,14,0,20,28,90);
 // four trussed buttresses from the ground up to the ring's shoulders; in the
 // ruin the south-west one has fallen flat
 for(const sx of[-1,1])for(const sz of[-1,1]){const a=sx>0?.26:Math.PI-.26;
  if(dd&&sx<0&&sz>0){enTruss('strutR',[sx*262,5,sz*118],[-340,5,420],10,14,1.1,.35);
   beam('strutR',[RO*Math.cos(a),RC+RO*Math.sin(a),sz*16],[RO*Math.cos(a)-10,RC+RO*Math.sin(a)-30,sz*28],3,3);}
  else enTruss('strutR',[sx*262,0,sz*118],[RO*Math.cos(a),RC+RO*Math.sin(a),sz*16],10,14,1.1,.15*dd);
  enBlk(acc,sx*262,5,sz*118,26,10,26);}
 // fallen plates on the ground, vines off the upper arc
 for(const a of fallen){const r=rr(230,320),b=a+rr(-.3,.3);
  kput(PL,[r*Math.cos(b),6,rr(-80,80)],qEuler(rr(-.4,.4),rng()*TAU,rr(1.2,1.9)),[40,16,42]);}
 const hang=[];for(let i=0;i<50+60*dd;i++){const a=rr(.25,Math.PI-.25);hang.push([(R-18)*Math.cos(a),RC+(R-18)*Math.sin(a),rr(-16,16)]);}
 enHang('vine',hang,8,46+30*dd,6);
 if(dd)enOvergrow(acc,70,16,0,0);
 meshMerged(acc,CONC(d),G);
 rubbleRing(0,0,0,110,240,80+60*dd,5);scatterMoss(0,0,0,60,320,90+60*dd,4);trees(0,0,280,520,30+30*dd);
 figures(40,70,6,10);
 REGISTER({name:'The Gyre: ring',x:0,y:0,z:0,r:235,h:460});
 REGISTER({name:'The Gyre: core',x:0,y:RC-30,z:0,r:40,h:60});
 EN_SITE.gyre={x:gx,z:gz,RC:RC,R:R};
 KOFF=[0,0,0];return G;}

// ---------------------------------------------------------------- THE PRESS
function buildPress(scene,gx,gz,d){reseed(10140+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0,conc=CONC(d),acc=[],rust=[];
 // plinth, piers, lintel. The piers are spalled and cracked in the ruin.
 enBlk(acc,0,12,0,200,24,160);enBlk(acc,0,30,0,170,12,130);
 for(const s of[-1,1]){enBlk(acc,s*64,246,0,40,420,64);
  enBlk(acc,s*64,60,0,52,48,76);                       // the pier's foot
  for(let k=-2;k<=2;k++)kput(BOXC(d),[s*84.8,246,k*12],null,[3,400,4]);   // fluting on the outer face
  for(let y=48;y<448;y+=18)for(const z of[-1,1])kput('cellD',[s*64,y,z*32.05],null,[30,1.6,1]);
  for(const z of[-1,1])kput('plateR',[s*42.5,246,z*18],null,[3,384,10]);   // the guide rails
  for(const z of[-24,24])kput('pipeR',[s*(64+rr(-6,6)),243,z+(z>0?9:-9)],null,[2,414,2]);
  if(dd){for(const y of[140,290,400])enBreach(s*64,y,0,40,64,2,'plateR');
   kput('boxD',[s*64+rr(-10,10),300,32.4],null,[1.4,170,.6]);kput('boxD',[s*64+rr(-10,10),210,-32.4],null,[1.4,120,.6]);}}
 // the lintel: its west end has broken off and lies at the foot, cage and all
 if(dd){enBlk(acc,25,480,0,170,48,84);enRotBlk(G,conc,[-170,20,76],[50,48,84],.2,.6,1.15);
  rubbleRing(-170,0,76,24,100,70,7);enDebris(-150,60,110,40,'plateR');}
 else enBlk(acc,0,480,0,220,48,84);
 // the crosshead, the rod and the die, hanging mid-stroke — jammed askew
 if(dd)enRotBlk(G,MAT.rust,[0,250,0],[84,50,56],0,0,.07);else enBlk(rust,0,250,0,84,50,56);
 for(const s of[-1,1])for(const z of[-1,1])kput('plateR',[s*38,250+s*3*dd,z*18],null,[6,54,14]);
 kput('pipeR',[0,(275+456)/2,0],null,[9,181,9]);
 mesh(new THREE.CylinderGeometry(30,14,70,28),MAT.rust,G,0,190,0);
 kput('ringR',[0,221,0],qEuler(Math.PI/2,0,0),[31,31,40]);
 // the anvil on the plinth, and the one small impression in it
 mesh(new THREE.CylinderGeometry(40,46,10,40),conc,G,0,41,0);
 mesh(new THREE.CylinderGeometry(9,9,.4,24),MAT.dark,G,0,46.1,0);
 // the yoke: an upright loop on the lintel, tipped forward. In the ruin its
 // west post is gone and the top bar hangs from the east one.
 const Y=new THREE.Group();Y.position.set(0,504,0);Y.rotation.x=-.35;G.add(Y);
 const yk=[];enBlk(yk,52,58,0,16,116,22);
 if(dd)enRotBlk(Y,MAT.rust,[9,66,0],[120,16,22],0,0,.78);else{enBlk(yk,-52,58,0,16,116,22);enBlk(yk,0,108,0,120,16,22);}
 meshMerged(yk,MAT.rust,Y);
 // lattice cages on the lintel's ends
 for(const s of dd?[1]:[-1,1])enCage('strutR',s*86,522,0,36,1.4);
 // pulleys, chains, counterweights; the west ones fell with the lintel
 for(const s of[-1,1]){if(dd&&s<0){enRotBlk(G,MAT.rust,[-140,12,-44],[26,60,40],1.3,.4,.2);
   beam('tube',[-126,1.2,-24],[-40,1.2,60],1.3,1.3);beam('tube',[-132,1.2,-20],[-70,1.2,-110],1.3,1.3);continue;}
  kput('pipeR',[s*116,470,0],qEuler(Math.PI/2,0,0),[14,40,14]);
  enBlk(rust,s*130,150,0,26,60,40);
  for(const z of[-12,12])beam('tube',[s*130,469,z],[s*130,180,z],1.3,1.3);}
 // the conveyor gantry off the east pier, out and down into the ground; in
 // the ruin its outer span has dropped, one end on the plain
 if(dd){enTruss('strutR',[84,66,0],[226,66,0],12,12,1.1,.25);enTruss('strutR',[238,4,12],[358,62,0],12,12,1.1,.4);}
 else enTruss('strutR',[84,66,0],[360,66,0],12,12,1.1);
 enBlk(acc,372,33,0,30,66,30);
 enTruss('strutR',[372,66,0],[540,-6,0],10,12,1,.3*dd);
 if(dd)enOvergrow(acc,90,40,0,0);
 meshMerged(acc,conc,G);meshMerged(rust,MAT.rust,G);
 rubbleRing(0,0,0,102,210,120+60*dd,7);scatterMoss(0,36,0,40,62,26,3);scatterMoss(0,0,0,110,300,80+60*dd,4);
 trees(0,0,200,460,32+30*dd);
 figures(0,112,6,10);
 REGISTER({name:'The Press: piers',x:0,y:0,z:0,r:150,h:600});
 REGISTER({name:'The Press: gantry',x:300,y:0,z:0,r:90,h:80});
 EN_SITE.press={x:gx,z:gz};
 KOFF=[0,0,0];return G;}
