// ================================================================= THE ENGINES — five cyclopean machines of unclear purpose
// Machinery the Ancients left standing on the plain, each the size of a town
// and none with an obvious job. Drawn from the crawler excavators, walker rigs,
// canted bores and piston towers in the engines reference set: heavy plated
// masses, lattice booms, cable stays, rods and rings, all of it stopped.
//
//   THE HARROW   a crawler on four track units, 320 m long, its bucket wheel
//                raised to the sky on a stayed boom. Behind it a furrow runs
//                1.5 km back across the plain.
//   THE STRIDER  a four-legged walker, hull 170 m up, halted mid-stride with
//                one foot lifted. A thin probe runs from its belly to a ring of
//                stones on the ground.
//   THE BREECH   a concrete barrel 90 m across, coming out of the ground at 22
//                degrees in a trunnion cradle. Rods stick out of its mouth.
//                Gun or drill: nobody knows.
//   THE GYRE     a 430 m ring standing on edge in a concrete saddle. A second
//                ring is pivoted inside it, and a green core is slung at the centre.
//   THE PRESS    twin concrete piers 500 m tall. The crosshead hangs mid-stroke
//                with a die 150 m above an anvil that shows one small impression.
//
// Units are metres, x east, z south, y up, like the rest of the kit. Every
// builder is local to its own group at (gx,0,gz). kput is local too, through
// KOFF. The big masses are merged meshes with UVs in metres (enBlk, enTube).
// Detail is instanced (plates, struts, pipes, slots).
//
// Only decay 1 is shown by the `engines` target: dormant, rusted, mossed at
// the foot. The builders take d like any other and pick materials through
// PLATE/CONC/SHELL, so an intact variant is a row change, not a rewrite.

const EN_SITE={};
function enV(a){return new THREE.Vector3(a[0],a[1],a[2]);}
// two unit vectors perpendicular to axis `ax` (and to each other); e2 leans up
function enFrame(ax){const up=Math.abs(ax.y)>.9?new THREE.Vector3(1,0,0):new THREE.Vector3(0,1,0);
 const e1=new THREE.Vector3().crossVectors(ax,up).normalize();const e2=new THREE.Vector3().crossVectors(e1,ax).normalize();return[e1,e2];}
// A box with its UVs in metres (one texture tile per 8 m), pushed onto `acc`
// for one meshMerged call per material. Instanced boxes stretch the texture
// across a 400 m pier, which is why the masses are not kput.
function enBlk(acc,cx,cy,cz,sx,sy,sz){const g=new THREE.BoxGeometry(sx,sy,sz),uv=g.attributes.uv;
 const F=[[sz,sy],[sz,sy],[sx,sz],[sx,sz],[sx,sy],[sx,sy]];
 for(let i=0;i<24;i++){const f=F[i>>2];uv.setXY(i,uv.getX(i)*f[0]/8,uv.getY(i)*f[1]/8);}
 g.translate(cx,cy,cz);acc.push(g);return g;}
// A tube round the segment a->b, radius rFn(t) with t in metres from a.
// hole(u,t) drops a quad, like holeFn's predicate.
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
function enTruss(name,a,b,w,bay,bar){const A=enV(a),B=enV(b),ax=B.clone().sub(A),L=ax.length();ax.normalize();const E=enFrame(ax),e1=E[0],e2=E[1];
 const cn=[[1,1],[1,-1],[-1,-1],[-1,1]];
 const P=(t,k)=>{const c=cn[k%4];return A.clone().addScaledVector(ax,t).addScaledVector(e1,c[0]*w/2).addScaledVector(e2,c[1]*w/2).toArray();};
 for(let k=0;k<4;k++)beam(name,P(0,k),P(L,k),bar*1.7,bar*1.7);
 const n=Math.max(1,Math.round(L/bay));
 for(let i=0;i<n;i++){const t0=i*L/n,t1=(i+1)*L/n;
  for(let k=0;k<4;k++){beam(name,i%2?P(t0,k):P(t0,k+1),i%2?P(t1,k+1):P(t1,k),bar,bar);beam(name,P(t1,k),P(t1,k+1),bar,bar);}}}
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
// One crawler track: a stadium loop of shoes round a dark frame, road wheels
// along the bottom run, drive sprockets at the two ends. Long axis x.
function enTrack(cx,cz,len,rad,wid,pl){const st=len-2*rad,per=2*st+TAU*rad,n=Math.round(per/5.2);
 for(let i=0;i<n;i++){const s=i/n*per;let x,y,a;
  if(s<st){x=-st/2+s;y=0;a=0;}
  else if(s<st+Math.PI*rad){a=(s-st)/rad;x=st/2+Math.sin(a)*rad;y=rad-Math.cos(a)*rad;}
  else if(s<2*st+Math.PI*rad){x=st/2-(s-st-Math.PI*rad);y=2*rad;a=Math.PI;}
  else{const q=(s-2*st-Math.PI*rad)/rad;x=-st/2-Math.sin(q)*rad;y=rad+Math.cos(q)*rad;a=Math.PI+q;}
  kput(pl,[cx+x,y+1.2,cz],qEuler(0,0,a),[4.5,2.4,wid]);
  if(i%2===0)kput('boxD',[cx+x,y+1.2,cz],qEuler(0,0,a),[1.2,3.4,wid*.7]);}   // the grouser
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
 const PL=PLATE(d),acc=[],hull=[];
 // four crawler units under four bogie pylons and slewing drums
 const TR=[[-112,-66],[-112,66],[112,-66],[112,66]];
 for(const t of TR){enTrack(t[0],t[1],92,17,34,PL);
  enBlk(hull,t[0],53,t[1],34,38,30);
  kput('pipeR',[t[0],74,t[1]],null,[22,6,22]);
  for(const s of[-1,1])kput('pipeR',[t[0]+s*10,54,t[1]*1.26],null,[3,40,3]);}
 // the chassis and the stepped superstructure
 enBlk(hull,0,86,0,310,20,176);
 for(const s of[-1,1])enBlk(hull,0,70,s*66,200,12,14);
 enDeck(hull,0,96,0,250,42,146,12,9,PL);
 enDeck(hull,-20,138,0,190,34,112,10,8,PL);
 enDeck(hull,-60,172,0,110,30,78,9,7,PL);
 enDeck(hull,58,172,0,46,18,58,8,6,PL);            // the forward cab
 // exhaust stacks, banded
 for(const x of[-95,-70,-45]){kput('pipeR',[x,237,20],null,[5,70,5]);
  for(let y=214;y<270;y+=14)kput('ringR',[x,y,20],qEuler(Math.PI/2,0,0),[5.6,5.6,14]);}
 // the rear counterweight on two truss arms
 for(const s of[-1,1])enTruss('strutR',[-118,146,s*32],[-212,150,s*32],10,10,1.2);
 enBlk(acc,-232,145,0,44,60,100);
 // the A-frame
 const AP=[60,300,0];
 for(const s of[-1,1])enTruss('strutR',[18,172,s*48],AP,8,12,1.1);
 kput('pipeR',AP,qEuler(Math.PI/2,0,0),[5,20,5]);
 // the boom: a pivot at the deck's nose, 250 m at 28 degrees
 const P0=[130,120,0],an=28*Math.PI/180,BL=250;
 const E=[P0[0]+BL*Math.cos(an),P0[1]+BL*Math.sin(an),0];
 kput('pipeR',P0,qEuler(Math.PI/2,0,0),[12,60,12]);
 enTruss('strutR',P0,E,22,14,1.6);
 const BP=t=>[lerp(P0[0],E[0],t),lerp(P0[1],E[1],t),0];
 // stays: apex to the boom, apex back to the counterweight
 for(const t of[.45,.72,.96])for(const s of[-1,1])beam('tube',[AP[0],AP[1],s*3],[BP(t)[0],BP(t)[1],s*11],.7,.7);
 for(const s of[-1,1])beam('tube',[AP[0],AP[1],s*3],[-232,175,s*40],.8,.8);
 // the wheel, beside the boom head, in the boom's plane, raised to the sky
 const WZ=26,WR=52,shell=SHELL(d);
 for(const z of[WZ-8,WZ+8])mesh(new THREE.TorusGeometry(WR,3.2,8,72),shell,G,E[0],E[1],z);
 kput('pipeR',[E[0],E[1],WZ-4],qEuler(Math.PI/2,0,0),[8,36,8]);
 for(let k=0;k<10;k++){const a=k/10*TAU;for(const z of[WZ-8,WZ+8])beam('strutR',[E[0],E[1],z],[E[0]+WR*Math.cos(a),E[1]+WR*Math.sin(a),z],2.2,2.2);}
 for(let k=0;k<16;k++){const a=k/16*TAU,px=E[0]+(WR+5)*Math.cos(a),py=E[1]+(WR+5)*Math.sin(a);
  kput(PL,[px,py,WZ],qEuler(0,0,a),[10,12,20]);
  for(const z of[-6,0,6])kput('boxD',[px+6.5*Math.cos(a+.35),py+6.5*Math.sin(a+.35),WZ+z],qEuler(0,0,a+.35),[4,1.6,2]);}
 // chains hanging off the boom
 const hang=[];for(let i=0;i<9;i++){const t=rr(.12,.92),p=BP(t);hang.push([p[0],p[1]-11,rr(-10,10)]);}
 enHang('tube',hang,20,95,.9);
 meshMerged(hull,MAT.rust,G);meshMerged(acc,CONC(d),G);
 // THE FURROW. A pair of spoil berms and a centre ridge run back 1.5 km from
 // the tracks. Its base sits 0.3 m under the ground, so the red soil shows in
 // the ruts and only the spoil stands proud.
 const X0=-150,X1=-1700;
 mesh(gridSurface((u,v)=>{const x=lerp(X0,X1,u),z=(v-.5)*250,az=Math.abs(z),fade=Math.pow(1-u,.45)*clamp(u*12,0,1);
  const h=(8*Math.exp(-Math.pow((az-98)/10,2))+4.5*Math.exp(-Math.pow(z/15,2))+2.2*Math.exp(-Math.pow((az-44)/5,2)))*fade*(.65+.7*fbm(u*28,v*6,10103,2));
  return[x,h-.3,z];},170,56,{uS:200,vS:30}),MAT.mud,G);
 for(let i=0;i<70;i++){const x=rr(-160,-1100),z=(rng()<.5?-1:1)*rr(88,112),s=rr(1,4)*(1+x/1400);
  kput('rubble',[x,s*.3,z],qEuler(rng()*3,rng()*3,rng()*3),[s*1.4,s*.8,s*1.2],new THREE.Color().setHSL(rr(.05,.08),rr(.2,.35),rr(.3,.45)));}
 // the foot: spoil against the tracks, moss, a few trees, people for scale
 for(const t of TR)rubbleRing(t[0],0,t[1],24,60,22,4);
 scatterMoss(0,0,0,120,300,90,4);trees(0,0,190,480,34);
 figures(170,110,6,9);
 REGISTER({name:'The Harrow: crawler hull',x:0,y:0,z:0,r:175,h:210});
 REGISTER({name:'The Harrow: the wheel',x:E[0],y:E[1]-60,z:WZ,r:62,h:122});
 EN_SITE.harrow={x:gx,z:gz,E:E,WZ:WZ};
 KOFF=[0,0,0];return G;}

// ---------------------------------------------------------------- THE STRIDER
function buildStrider(scene,gx,gz,d){reseed(10110+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const HY=172,acc=[];
 // the hull: a superelliptic section swept along x, closing to a nose and a
 // tail. It is the white alloy that never rusts, holed where it has spalled.
 const hk=x=>Math.sqrt(Math.max(0,1-Math.pow(Math.abs(x)/92,3)));
 const hole=holeFn(.3*(d>0?1:0),10113,null,1);
 const pw=(c,e)=>Math.sign(c)*Math.pow(Math.abs(c),e);
 mesh(gridSurface((u,v)=>{const x=lerp(-92,92,v),th=u*TAU,k=hk(x),c=Math.cos(th),s=Math.sin(th);
  return[x,HY+pw(s,.55)*30*k*(s<0?.78:1),pw(c,.55)*40*k];},44,64,{uS:30,vS:23,hole:hole?(u,v)=>hole(u,v*184):null}),MAT.white,G);
 mesh(gridSurface((u,v)=>{const x=lerp(-88,88,v),th=u*TAU,k=hk(x)*.9,c=Math.cos(th),s=Math.sin(th);
  return[x,HY+pw(s,.55)*27*k,pw(c,.55)*36*k];},24,24,{uS:20,vS:20}),MAT.guts,G);   // the inner hull behind the holes
 // the eye in the nose
 kput('ovalD',[90.6,HY+2,0],qEuler(0,Math.PI/2,0),[8,8,3]);
 kput('ringR',[90.8,HY+2,0],qEuler(0,Math.PI/2,0),[10,10,20]);
 // decks and a mast on the back
 enDeck(acc,-12,HY+24,0,104,20,48,8,6,'plateW');
 enDeck(acc,-28,HY+44,0,60,16,34,7,5,'plateW');
 enBlk(acc,30,HY+30,0,26,12,30);
 enTruss('strutR',[-40,HY+60,0],[-40,HY+130,0],6,8,.7);
 for(const s of[-1,1])beam('tube',[-40,HY+128,0],[-40+s*40,HY+46,s*24],.35,.35);
 for(const z of[-22,0,22])beam('pipeR',[-78,HY+26,z],[70,HY+26,z],2.4,2.4);
 // the legs: hip, thigh up and out to a high knee, shin down to a pad. The
 // front-right leg is lifted mid-stride and never came down.
 const legs=[[-1,-1,0],[-1,1,0],[1,-1,0],[1,1,1]];
 for(const L of legs){const sx=L[0],sz=L[1],up=L[2];
  const hip=[sx*58,HY-18,sz*34],knee=up?[sx*114,HY+62,sz*90]:[sx*108,HY+42,sz*92];
  const foot=up?[sx*152,48,sz*104]:[sx*132,0,sz*112];
  kput('pipeR',hip,qEuler(Math.PI/2,0,0),[13,30,13]);
  kput('pipeR',knee,qEuler(Math.PI/2,0,0),[11,26,11]);
  beam('plateW',hip,knee,16,12);
  const ank=[foot[0],foot[1]+9,foot[2]];
  beam('plateW',knee,ank,12,10);
  beam('plateR',[lerp(knee[0],ank[0],.5),lerp(knee[1],ank[1],.5),lerp(knee[2],ank[2],.5)],ank,17,15);
  // two rams from the hull to mid-thigh and from the thigh to mid-shin
  const mt=[lerp(hip[0],knee[0],.55),lerp(hip[1],knee[1],.55)+8,lerp(hip[2],knee[2],.55)];
  beam('pipeR',[sx*40,HY-30,sz*26],mt,3.2,3.2);
  beam('pipeR',[lerp(hip[0],knee[0],.7),lerp(hip[1],knee[1],.7)-7,lerp(hip[2],knee[2],.7)],[lerp(knee[0],ank[0],.35),lerp(knee[1],ank[1],.35),lerp(knee[2],ank[2],.35)],2.6,2.6);
  // the pad and three toes
  kput('slabCR',[foot[0],foot[1]+3,foot[2]],null,[18,6,18]);
  const ya=Math.atan2(sz,sx);
  for(const o of[-.6,0,.6]){const a=ya+o;kput('plateR',[foot[0]+22*Math.cos(a),foot[1]+2,foot[2]+22*Math.sin(a)],qEuler(0,-a,0),[16,4,6]);}
  if(!up)rubbleRing(foot[0],0,foot[2],16,40,14,3);}
 // the belly: a gondola, hanging cables, and the probe to the ground
 enDeck(acc,-6,HY-52,0,56,18,28,7,5,'plateW');
 for(const s of[-1,1])beam('strutR',[-6+s*20,HY-34,0],[-6+s*14,HY-24,0],3,3);
 const hang=[];for(let i=0;i<22;i++){const x=rr(-70,70);hang.push([x,HY-22*hk(x),rr(-18,18)*hk(x)]);}
 enHang('tube',hang,25,150,.7);
 const PB=[26,0,4];
 beam('pipeR',[22,HY-26,0],[PB[0],3,PB[2]],2.1,2.1);
 kput('slabCR',[PB[0],.5,PB[2]],null,[8,1,8]);
 for(let k=0;k<11;k++){const a=k/11*TAU,s=rr(1.4,2.4);
  kput('rubble',[PB[0]+14*Math.cos(a),s*.8,PB[2]+14*Math.sin(a)],qEuler(0,a,0),[s,s*2.2,s],new THREE.Color().setHSL(.07,.15,.42));}
 meshMerged(acc,MAT.white,G);
 scatterMoss(0,0,0,40,240,70,3.5);trees(0,0,170,440,26);
 figures(PB[0]-16,PB[2]+20,5,7);
 REGISTER({name:'The Strider: hull',x:0,y:HY-40,z:0,r:95,h:120});
 REGISTER({name:'The Strider: legs',x:0,y:0,z:0,r:175,h:HY});
 EN_SITE.strider={x:gx,z:gz,HY:HY,PB:PB};
 KOFF=[0,0,0];return G;}

// ---------------------------------------------------------------- THE BREECH
function buildBreech(scene,gx,gz,d){reseed(10120+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const an=22*Math.PI/180,ca=Math.cos(an),sa=Math.sin(an),A=[-150,-40,0],BL=380;
 const P=t=>[A[0]+ca*t,A[1]+sa*t,0];
 const AX=[ca,sa,0],UPV=[-sa,ca,0];
 const off=(t,phi,r)=>{const p=P(t);return[p[0]+UPV[0]*Math.cos(phi)*r,p[1]+UPV[1]*Math.cos(phi)*r,Math.sin(phi)*r];};
 const conc=CONC(d),acc=[];
 // the barrel: stepped collars every 38 m, belling out over the last 40
 const bR=t=>44+(((t%38)/38)<.14?5:0)+(t>340?(t-340)*.25:0);
 mesh(enTube(A,P(BL),bR,56,140),conc,G);
 mesh(enRing(P(BL),AX,34,bR(BL),48),conc,G);
 // the bore, the lip, the core drum and the rods
 mesh(enTube(P(BL),P(300),()=>34,40,8),MAT.dark,G);
 mesh(enRing(P(300),AX,0,34,32),MAT.dark,G);
 mesh(enTube(P(372),P(BL+4),()=>35.5,48,2),MAT.verdigris,G);
 mesh(enTube(P(318),P(BL+14),()=>16,32,6),MAT.verdigris,G);
 mesh(enRing(P(BL+14),AX,0,16,24),MAT.verdigris,G);
 for(let k=0;k<8;k++){const ph=k/8*TAU+.2;beam('pipeR',off(340,ph,25),off(470+rr(-20,20),ph,25),2.2,2.2);}
 // two verdigris bands with their faces
 for(const t0 of[190,290]){mesh(enTube(P(t0),P(t0+10),()=>53,56,1),MAT.verdigris,G);
  for(const t of[t0,t0+10])mesh(enRing(P(t),AX,44,53,56),MAT.verdigris,G);}
 // ribs along the top and pipes along the flanks, on brackets
 for(const ph of[-.35,0,.35])beam(PLATE(d),off(120,ph,50),off(360,ph,50),3,3);
 for(const ph of[Math.PI/2,-Math.PI/2]){beam('pipeR',off(110,ph,48.5),off(368,ph,48.5),3.5,3.5);
  for(let t=120;t<368;t+=24)beam('boxD',off(t,ph,44),off(t,ph,49),2,2);}
 // the trunnion cradle
 const T=P(230);
 for(const s of[-1,1]){enBlk(acc,T[0],30,s*68,60,60,24);enBlk(acc,T[0],7,s*72,82,14,36);
  kput('pipeR',[T[0],T[1],s*60],qEuler(Math.PI/2,0,0),[17,26,17]);
  kput('ringR',[T[0],T[1],s*74],null,[18,18,30]);}
 // the gantry tower and the bridge to the barrel's back
 enTruss('strutR',[130,0,-110],[130,190,-110],16,14,1.2);
 enBlk(acc,130,4,-110,26,8,26);
 const BT=off(340,-.25,50);
 enTruss('strutR',[130,182,-102],BT,6,8,.6);
 meshMerged(acc,conc,G);
 // the mound it comes out of
 const MX=-62;
 mesh(gridSurface((u,v)=>{const th=u*TAU,r=v*150*(1+.12*fbm(u*6,1.7,10121,2)),x=r*Math.cos(th),z=r*Math.sin(th);
  const q=clamp(1-r/150,0,1);return[MX+x,34*Math.pow(q,1.6)*(.8+.4*fbm(x/40,z/40,10122,2))-.3,z];},64,20,{uS:40,vS:12}),MAT.mud,G);
 rubbleRing(MX+20,0,0,60,190,110,6);
 scatterMoss(MX,0,0,60,260,90,4);trees(MX,0,160,420,30);
 figures(T[0]+30,90,5,8);
 REGISTER({name:'The Breech: barrel',x:30,y:0,z:0,r:190,h:200});
 REGISTER({name:'The Breech: cradle',x:T[0],y:0,z:0,r:80,h:70});
 EN_SITE.breech={x:gx,z:gz,M:P(BL),AX:AX,T:T};
 KOFF=[0,0,0];return G;}

// ---------------------------------------------------------------- THE GYRE
function buildGyre(scene,gx,gz,d){reseed(10130+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const RC=226,R=196,R2=150,PS=-.66,PL=PLATE(d),acc=[];
 // the outer ring: a dark core torus under sixty plates, a few of them fallen
 mesh(new THREE.TorusGeometry(R,15,10,120),MAT.dark,G,0,RC,0);
 const fallen=[];
 for(let i=0;i<60;i++){const a=i/60*TAU;
  if(d>0&&rng()<.1&&Math.sin(a)>-.3){fallen.push(a);continue;}
  kput(PL,[R*Math.cos(a),RC+R*Math.sin(a),0],qEuler(0,0,a),[40,16.2,42]);
  kput('boxD',[(R+20.4)*Math.cos(a),RC+(R+20.4)*Math.sin(a),0],qEuler(0,0,a),[.8,10,30]);}
 // the inner ring, pivoted on the vertical diameter and turned 38 degrees
 const inner=mesh(new THREE.TorusGeometry(R2,8,8,96),MAT.verdigris,G,0,RC,0);inner.rotation.y=PS;
 const rot=(x,y)=>[x*Math.cos(PS),RC+y,-x*Math.sin(PS)];
 for(let i=0;i<36;i++){const a=i/36*TAU;kput('plateR',rot(R2*Math.cos(a),R2*Math.sin(a)),qEuler(0,PS,a),[20,10,22]);}
 for(const s of[-1,1]){kput('pipeR',[0,RC+s*167,0],null,[7,24,7]);kput('pipeR',[0,RC+s*158,0],null,[11,6,11]);}
 // the core, slung on four spokes
 mesh(new THREE.IcosahedronGeometry(28,1),MAT.verdigris,G,0,RC,0);
 for(const a of[.25,1.25,2.25,3.25].map(q=>q*Math.PI/2))beam('strutR',[0,RC,0],rot((R2-8)*Math.cos(a),(R2-8)*Math.sin(a)),4.5,4.5);
 for(const s of[-1,1])kput('pipeR',[s*18*Math.cos(PS),RC,-s*18*Math.sin(PS)],qEuler(0,PS,Math.PI/2),[9,22,9]);
 // the saddle: stepped concrete blocks each rising to the ring's underside
 const RO=R+21;
 for(let x=-100;x<=100;x+=20){const top=RC-Math.sqrt(RO*RO-x*x);enBlk(acc,x,top/2,0,20.5,top,x===0?80:70);}
 enBlk(acc,0,3,0,260,6,110);
 for(const s of[-1,1])enBlk(acc,s*120,14,0,20,28,90);
 // four trussed buttresses from the ground up to the ring's shoulders
 for(const sx of[-1,1])for(const sz of[-1,1]){const a=sx>0?.26:Math.PI-.26;
  enTruss('strutR',[sx*262,0,sz*118],[RO*Math.cos(a),RC+RO*Math.sin(a),sz*16],10,14,1.1);
  enBlk(acc,sx*262,5,sz*118,26,10,26);}
 // fallen plates on the ground, vines off the upper arc
 for(const a of fallen){const r=rr(230,300),b=a+rr(-.3,.3);
  kput(PL,[r*Math.cos(b),6,rr(-60,60)],qEuler(rr(-.4,.4),rng()*TAU,rr(1.2,1.9)),[40,16,42]);}
 const hang=[];for(let i=0;i<50;i++){const a=rr(.25,Math.PI-.25);hang.push([(R-18)*Math.cos(a),RC+(R-18)*Math.sin(a),rr(-16,16)]);}
 enHang('vine',hang,8,46,6);
 meshMerged(acc,CONC(d),G);
 rubbleRing(0,0,0,110,240,80,5);scatterMoss(0,0,0,60,320,90,4);trees(0,0,280,520,30);
 figures(40,70,6,10);
 REGISTER({name:'The Gyre: ring',x:0,y:0,z:0,r:235,h:460});
 REGISTER({name:'The Gyre: core',x:0,y:RC-30,z:0,r:40,h:60});
 EN_SITE.gyre={x:gx,z:gz,RC:RC,R:R};
 KOFF=[0,0,0];return G;}

// ---------------------------------------------------------------- THE PRESS
function buildPress(scene,gx,gz,d){reseed(10140+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const conc=CONC(d),acc=[],rust=[];
 // plinth, piers, lintel
 enBlk(acc,0,12,0,200,24,160);enBlk(acc,0,30,0,170,12,130);
 for(const s of[-1,1]){enBlk(acc,s*64,246,0,40,420,64);
  enBlk(acc,s*64,60,0,52,48,76);                       // the pier's foot
  for(let k=-2;k<=2;k++)kput(BOXC(d),[s*84.8,246,k*12],null,[3,400,4]);   // fluting on the outer face
  for(let y=48;y<448;y+=18)for(const z of[-1,1])kput('cellD',[s*64,y,z*32.05],null,[30,1.6,1]);
  for(const z of[-1,1])kput('plateR',[s*42.5,246,z*18],null,[3,384,10]);   // the guide rails
  for(const z of[-24,24])kput('pipeR',[s*(64+rr(-6,6)),243,z+ (z>0?9:-9)],null,[2,414,2]);}
 enBlk(acc,0,480,0,220,48,84);
 // the crosshead, the rod and the die, hanging mid-stroke
 enBlk(rust,0,250,0,84,50,56);
 for(const s of[-1,1])for(const z of[-1,1])kput('plateR',[s*38,250,z*18],null,[6,54,14]);
 kput('pipeR',[0,(275+456)/2,0],null,[9,181,9]);
 mesh(new THREE.CylinderGeometry(30,14,70,28),MAT.rust,G,0,190,0);
 kput('ringR',[0,221,0],qEuler(Math.PI/2,0,0),[31,31,40]);
 // the anvil on the plinth, and the one small impression in it
 mesh(new THREE.CylinderGeometry(40,46,10,40),conc,G,0,41,0);
 mesh(new THREE.CylinderGeometry(9,9,.4,24),MAT.dark,G,0,46.1,0);
 // the yoke: an upright loop on the lintel, tipped forward
 const Y=new THREE.Group();Y.position.set(0,504,0);Y.rotation.x=-.35;G.add(Y);
 const yk=[];for(const s of[-1,1])enBlk(yk,s*52,58,0,16,116,22);enBlk(yk,0,108,0,120,16,22);
 meshMerged(yk,MAT.rust,Y);
 // lattice cages on the lintel's ends
 for(const s of[-1,1])enCage('strutR',s*86,522,0,36,1.4);
 // pulleys, chains, counterweights
 for(const s of[-1,1]){kput('pipeR',[s*116,470,0],qEuler(Math.PI/2,0,0),[14,40,14]);
  enBlk(rust,s*130,150,0,26,60,40);
  for(const z of[-12,12])beam('tube',[s*130,469,z],[s*130,180,z],1.3,1.3);}
 // the conveyor gantry off the east pier, running out and down into the ground
 enTruss('strutR',[84,66,0],[360,66,0],12,12,1.1);
 enBlk(acc,372,33,0,30,66,30);
 enTruss('strutR',[372,66,0],[540,-6,0],10,12,1);
 meshMerged(acc,conc,G);meshMerged(rust,MAT.rust,G);
 rubbleRing(0,0,0,102,210,120,7);scatterMoss(0,36,0,40,62,26,3);scatterMoss(0,0,0,110,300,80,4);
 trees(0,0,200,460,32);
 figures(0,112,6,10);
 REGISTER({name:'The Press: piers',x:0,y:0,z:0,r:150,h:600});
 REGISTER({name:'The Press: gantry',x:300,y:0,z:0,r:90,h:80});
 EN_SITE.press={x:gx,z:gz};
 KOFF=[0,0,0];return G;}
