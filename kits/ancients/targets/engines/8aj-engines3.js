// ================================================================= THE ENGINES — cyclopean machines of unclear purpose (3: the industrial set)
// The owner, 2026-11-10: "we will also want to expand the Ancient Engines set; among the industrial landscape will be cyclopean machines of
// unclear and mysterious purpose, colossal relics of sciences long forgotten", with a sheet of references. Six more, after them, each the size
// of a district and none with an obvious job. They use the shared helpers of src/8ah-engines.js (enBlk, enTube, enRing, enTruss, enDebris,
// enHang, enOvergrow) and 8ai's enBlkY, and take d like the others: whole and clean at 0, ruined at 1 (the ruin pass gated on dd). This
// fragment lives in targets/engines/, so it reaches the engines sheet and the pages that read it by path (the Ancient's Valley's Yards), and
// no other target of the kit.
//
//   THE COIL        a stepped drum 220 m across with six leaning sail fins round it; out of it a mast of six pipes and four lattice
//                   towers, threaded through seven ring decks that climb it in a spiral to 300 m. Two decks have slipped and hang tilted;
//                   the pipes are snapped off at the top.
//   THE PROCESSION  five rings in a line, 260 to 180 m across, half sunk in the plain, their inner faces crowded with machinery; the
//                   last has broken and a length of it lies on its side.
//   THE MORTAR      a fortress drum 180 m across under an armoured sphere, two barrels 260 m long raised at the sky, a red slot down
//                   each that still holds a little light. The sphere is split and one barrel is broken off and lies on the ground.
//   THE VIGIL       three capsule towers on one podium (220, 160 and 110 m), white plate with banded rings and a round eye in each,
//                   two still glowing. The smallest is broken at its waist and lies across the podium.
//   THE RECEIVER    a banded drum on braced legs, ending in a sphere with a round mouth; a twin rail on a trestle runs into the mouth
//                   from 300 m out; four slab towers stand behind it in a row. A slab's top is sheared, a span of the trestle is down.
//   THE LOOM        nine columns on a grid, domed, joined by straight tubes and threaded by a ring of tube 240 m across with saucers at
//                   its joints. Two columns are broken and a third of the ring lies on the ground.

// the Hive's plates: a hexagonal prism, unit radius and depth, its axis along z (scaled per plate)
const EN_HEX=(()=>{const g=new THREE.CylinderGeometry(1,1,1,6);g.rotateX(Math.PI/2);return g;})();
// the dark iron of the industrial set (MAT.dark takes a pale library set under the kit's binding, so the Iris came out white)
const EN_IRON=new THREE.MeshStandardMaterial({color:0x2c2a28,roughness:.55,metalness:.55});EN_IRON.name='en.iron';
kdef('enHexW',EN_HEX,MAT.white);
// a fallen plate's extents for its seat (the hexagon is 2 across its corners, 1.73 across its flats; 2.2 m deep), at the plates' scale
const EN_HEX_S=(()=>{EN_HEX.computeBoundingBox();const b=EN_HEX.boundingBox;return[(b.max.x-b.min.x)*6.2,(b.max.y-b.min.y)*6.2,(b.max.z-b.min.z)*2.2];})();kdef('enHexG',EN_HEX,MAT.glass);
// a plate's turn from its face: local z along n (the face's normal), local y as near `up` as it can be (the kit's qEuler turns about the
// world's axes in XYZ order, so a plate on a sphere or a leaning sail cannot be said with it)
function enQn(n,up){const Z=new THREE.Vector3(n[0],n[1],n[2]).normalize(),U=new THREE.Vector3().fromArray(up||(Math.abs(Z.y)>.95?[1,0,0]:[0,1,0]));
 const X=new THREE.Vector3().crossVectors(U,Z).normalize(),Y=new THREE.Vector3().crossVectors(Z,X);return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(X,Y,Z));}
// enSeatY (8ah) seats a piece on its lowest points; 8ah's enDebris now seats its plates with it (the owner, 2026-11-10: "detached pieces
// lie on the ground properly"). en3Debris is that scatter, kept by name for this set's calls
function en3Debris(x,z,r,n,pl){enDebris(x,z,r,n,pl);}

// ---------------------------------------------------------------- THE COIL
function buildCoil(scene,gx,gz,d){reseed(10200+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0,conc=CONC(d),PL=PLATE(d),acc=[],TOP=dd?262:300;
 mesh(enTube([0,0,0],[0,18,0],()=>110,56,2),conc,G);mesh(enRing([0,18,0],[0,1,0],0,110,56),conc,G);
 mesh(enTube([0,18,0],[0,34,0],()=>82,48,2),conc,G);mesh(enRing([0,34,0],[0,1,0],0,82,48),conc,G);
 for(let k=0;k<48;k++){const a=k/48*TAU;kput('boxD',[Math.cos(a)*110.4,9,Math.sin(a)*110.4],qEuler(0,-a,0),[1,5,4]);}
 /* the sails: six tall plates leaning out from the upper drum, braced back to it */
 /* each sail stands radially (its face toward the tangent), leaning out 24 degrees from the vertical */
 for(let k=0;k<6;k++){const a=k/6*TAU+.3,c=Math.cos(a),s=Math.sin(a),L=.42,up=[c*Math.sin(L),Math.cos(L),s*Math.sin(L)],q=enQn([-s,0,c],up);
  if(dd&&k===4){kput(PL,[c*150,1.25,s*150],enQn([0,1,0],[c,0,s]),[64,70,3]);continue;}   /* the fallen sail flat on the ground, 0.25 m in */
  kput(PL,[c*(80+40*Math.sin(L)),34+40*Math.cos(L),s*(80+40*Math.sin(L))],q,[66,80,3]);beam('strutR',[c*72,34,s*72],[c*(80+60*Math.sin(L))-s*2,34+60*Math.cos(L),s*(80+60*Math.sin(L))+c*2],2.2,2.2);
  for(let j=0;j<3;j++){const t=12+j*22;kput('boxD',[c*(80+t*Math.sin(L))-s*1.8,34+t*Math.cos(L),s*(80+t*Math.sin(L))+c*1.8],q,[44,1.2,1]);}}
 /* the mast: six pipes on a ring of 22 m, four lattice towers on 58 m */
 for(let k=0;k<6;k++){const a=k/6*TAU;kput('pipeR',[Math.cos(a)*22,34+(TOP-34-(dd&&k%2?40:0))/2,Math.sin(a)*22],null,[4,TOP-34-(dd&&k%2?40:0),4]);}
 for(let k=0;k<4;k++){const a=k/4*TAU+Math.PI/4;enTruss('strutR',[Math.cos(a)*58,34,Math.sin(a)*58],[Math.cos(a)*58,dd&&k===1?170:250,Math.sin(a)*58],7,10,.8,.2*dd);}
 /* the ring decks, climbing in a spiral: each centre swings round the axis */
 for(let i=0;i<7;i++){const y=70+i*34;if(y>TOP)break;const ph=i*.9,ox=Math.cos(ph)*8,oz=Math.sin(ph)*8,slip=dd&&(i===2||i===5);
  const ring=mesh(enRing([0,0,0],[0,1,0],30,58+(i%2)*6,40),MAT.white,G,ox,slip?y-18:y,oz);if(slip)ring.rotation.set(.22,0,-.16);
  const rim=mesh(enTube([0,-3,0],[0,0,0],()=>58+(i%2)*6,40,1),MAT.white,G,ox,slip?y-18:y,oz);if(slip)rim.rotation.copy(ring.rotation);
  for(let k=0;k<10;k++){const a=k/10*TAU+ph;if(!slip)kput('cell',[ox+Math.cos(a)*(58.3+(i%2)*6),y-1.5,oz+Math.sin(a)*(58.3+(i%2)*6)],qEuler(0,-a+Math.PI/2,0),[3,.8,.5],dd&&k%3?DEAD:WARM);}}   /* on the rim's face (a slipped deck's lights are gone with it) */
 if(dd){for(let k=0;k<6;k++){const a=k/6*TAU;const t=TOP-(k%2?40:0);beam('pipeR',[Math.cos(a)*22,t,Math.sin(a)*22],[Math.cos(a)*26+rr(-6,6),t+rr(8,22),Math.sin(a)*26+rr(-6,6)],2.4,2.4);}   /* each stub from its own pipe's broken top */
  en3Debris(120,90,90,40,PL);rubbleRing(0,0,0,112,220,80,6);enOvergrow(acc,60,24,0,0);}
 meshMerged(acc,conc,G);scatterMoss(0,0,0,112,300,60+50*dd,4);figures(0,130,5,10);
 REGISTER({name:'The Coil: drum and sails',x:0,y:0,z:0,r:150,h:110});
 REGISTER({name:'The Coil: mast and decks',x:0,y:30,z:0,r:70,h:TOP});
 EN_SITE.coil={x:gx,z:gz,TOP};
 KOFF=[0,0,0];return G;}

// ---------------------------------------------------------------- THE PROCESSION
function buildProcession(scene,gx,gz,d){reseed(10210+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0,conc=CONC(d),PL=PLATE(d),acc=[],N=5;
 for(let i=0;i<N;i++){const R=130-i*12,x=-340+i*170,cy=R*.78,brk=dd&&i===N-1,arc=brk?TAU*.62:TAU;
  /* the ring: a torus of square section, thick through its depth (z), sunk to 0.22 of its height */
  const T=mesh(new THREE.TorusGeometry(R,13,4,96,arc),MAT.white,G,x,cy,0);T.rotation.set(0,Math.PI/2,brk?2.1:0);T.scale.set(1,1,1);T.rotation.order='YXZ';
  const T2=mesh(new THREE.TorusGeometry(R-12,6,4,96,arc),EN_IRON,G,x,cy,0);T2.rotation.copy(T.rotation);
  /* its inner face crowded with machinery, its outer face plated; the lower 22% is under the plain */
  for(let k=0;k<64;k++){const a=k/64*TAU;if(brk){const t=(((Math.PI-a-2.1)%TAU)+TAU)%TAU;if(t<.12||t>arc-.12)continue;}   /* the broken ring's pieces only where its arc is: the torus's angle t is pi - a, spun 2.1 (its YXZ turn) */const py=cy+Math.sin(a)*R;if(py<2)continue;
   const ci=Math.cos(a),si=Math.sin(a);
   /* Rx(-a) takes a piece's local z to the ring's outward normal (0, sin a, cos a): plates lie on the ring, boxes sit square to it */
   const rz=rr(4,10),rM=R-13-rz/2+.4;kput('boxD',[x+rr(-8,8),cy+si*rM,ci*rM],qEuler(-a,0,0),[rr(8,16),rr(6,14),rz]);   /* against the ring's inner face, inside its depth */
   if(k%2)kput(PL,[x,cy+si*(R+13.4),ci*(R+13.4)],qEuler(-a,0,0),[22,rr(9,13),1.2]);
   if(k%8===0)kput('cell',[x+12.6,cy+si*(R-4),ci*(R-4)],qEuler(0,Math.PI/2,0),[6,1.2,.5],dd?DEAD:CYAN);}
  enBlk(acc,x,2,0,40,4,R*1.6);
  if(brk){const seg=mesh(new THREE.TorusGeometry(R,13,4,30,TAU*.3),MAT.white,G,x+60,12.75,90);seg.rotation.set(Math.PI/2,0,.4);en3Debris(x+40,80,120,40,PL);}}
 if(dd){rubbleRing(0,0,0,40,420,120,6);enOvergrow(acc,60,30,0,0);}
 meshMerged(acc,conc,G);scatterMoss(0,0,0,40,420,70+60*dd,4);figures(-260,40,6,12);
 REGISTER({name:'The Procession: the rings',x:0,y:0,z:0,r:400,h:270});
 EN_SITE.procession={x:gx,z:gz};
 KOFF=[0,0,0];return G;}

// ---------------------------------------------------------------- THE MORTAR
function buildMortar(scene,gx,gz,d){reseed(10220+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0,conc=CONC(d),PL=PLATE(d),acc=[],SY=104,SR=62,EL=.62,AZ=.5;
 /* the fortress drum: two tiers, buttresses, arched slots in the dark */
 mesh(enTube([0,0,0],[0,40,0],()=>90,64,2),conc,G);mesh(enRing([0,40,0],[0,1,0],0,90,64),conc,G);
 mesh(enTube([0,40,0],[0,58,0],()=>72,56,2),conc,G);mesh(enRing([0,58,0],[0,1,0],0,72,56),conc,G);
 for(let k=0;k<16;k++){const a=k/16*TAU,c=Math.cos(a),s=Math.sin(a);enBlkY(acc,c*94,22,s*94,10,44,16,-a);
  kput('boxD',[c*90.4,14,s*90.4],qEuler(0,-a+Math.PI/2,0),[9,16,1]);kput('boxD',[c*90.4,31,s*90.4],qEuler(0,-a+Math.PI/2,0),[6,8,1]);
  kput('cell',[c*72.4,49,s*72.4],qEuler(0,-a+Math.PI/2,0),[5,1,.5],dd&&k%4?DEAD:new THREE.Color(0xff3818));}
 /* the sphere, plated in bands; split in the ruin (a dark gash and plates off) */
 mesh(new THREE.SphereGeometry(SR,40,24),EN_IRON,G,0,SY,0);
 for(let j=1;j<12;j++){const ph=j/12*Math.PI,y=SY-Math.cos(ph)*SR,r=Math.sin(ph)*SR;
  for(let k=0;k<24;k++){const a=k/24*TAU;if(dd&&a>1.4&&a<2.3&&j>3&&j<10)continue;if(dd&&rng()<.12)continue;
   const n=[Math.cos(a)*Math.sin(ph),-Math.cos(ph),Math.sin(a)*Math.sin(ph)];kput(PL,[n[0]*(SR+.6),SY+n[1]*(SR+.6),n[2]*(SR+.6)],enQn(n),[Math.max(4,r*TAU/24*1.05),SR*Math.PI/12*1.05,1.2]);}}
 if(dd)kput('boxD',[Math.cos(1.85)*SR*.97,SY+4,Math.sin(1.85)*SR*.97],qEuler(.2,-1.85+Math.PI/2,.1),[18,70,6]);
 /* two barrels from the sphere, raised EL at azimuth AZ: square-banded tubes with a red slot along each */
 const dir=[Math.cos(AZ)*Math.cos(EL),Math.sin(EL),Math.sin(AZ)*Math.cos(EL)],side=[-Math.sin(AZ),0,Math.cos(AZ)];
 [-1,1].forEach((q,b)=>{const o=[side[0]*q*16,SY+6,side[2]*q*16],L=dd&&b?150:260,end=[o[0]+dir[0]*L,o[1]+dir[1]*L,o[2]+dir[2]*L];
  mesh(enTube(o,end,t=>10-t*.015,6,20),EN_IRON,G);
  for(let t=20;t<L-4;t+=24){const p=[o[0]+dir[0]*t,o[1]+dir[1]*t,o[2]+dir[2]*t];mesh(enTube([p[0]-dir[0]*2,p[1]-dir[1]*2,p[2]-dir[2]*2],[p[0]+dir[0]*2,p[1]+dir[1]*2,p[2]+dir[2]*2],()=>12.5-t*.015,6,1),MAT.rust,G);}
  beam('cell',[o[0]+dir[0]*30,o[1]+dir[1]*30+9.6,o[2]+dir[2]*30],[o[0]+dir[0]*(L-20),o[1]+dir[1]*(L-20)+6.2,o[2]+dir[2]*(L-20)],1.4,.6,dd?new THREE.Color(0x601008):new THREE.Color(0xff3010));
  if(dd&&b){const f=[end[0]+dir[0]*40,4,end[2]+dir[2]*40+30];mesh(enTube([end[0]+20,8.75,end[2]+16],f.map((v,i)=>i===1?8.75:v+(i?60:90)),()=>9,6,10),EN_IRON,G);   /* the broken barrel on its side, 0.25 m in */en3Debris(end[0]+60,end[2]+50,70,30,PL);}});
 if(dd){rubbleRing(0,0,0,94,220,90,6);enOvergrow(acc,70,24,0,0);}
 meshMerged(acc,conc,G);scatterMoss(0,0,0,96,300,70+60*dd,4);figures(0,120,6,10);
 REGISTER({name:'The Mortar: fortress drum',x:0,y:0,z:0,r:104,h:60});
 REGISTER({name:'The Mortar: sphere',x:0,y:SY-SR,z:0,r:SR+4,h:SR*2+4});
 REGISTER({name:'The Mortar: barrels',x:Math.cos(AZ)*110,y:SY,z:Math.sin(AZ)*110,r:120,h:Math.sin(EL)*260+20});
 EN_SITE.mortar={x:gx,z:gz,SY};
 KOFF=[0,0,0];return G;}

// ---------------------------------------------------------------- THE VIGIL
function buildVigil(scene,gx,gz,d){reseed(10230+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0,conc=CONC(d),PL=PLATE(d),acc=[];
 enBlk(acc,0,10,0,220,20,150);for(let x=-100;x<=100;x+=20)kput('boxD',[x,8,75.4],null,[12,6,1]);
 const T=[{x:-40,z:0,r:32,h:220,eye:[0,1]},{x:52,z:-22,r:24,h:160,eye:[.3,1]},{x:44,z:46,r:17,h:110,eye:[-.2,1]}];
 T.forEach((t,i)=>{const brk=dd&&i===2,H=brk?t.h*.45:t.h,y0=20;
  mesh(enTube([t.x,y0,t.z],[t.x,y0+H,t.z],()=>t.r,36,8),MAT.white,G);
  if(!brk){const dome=mesh(new THREE.SphereGeometry(t.r,36,14,0,TAU,0,Math.PI/2),dd&&i===0?EN_IRON:MAT.white,G,t.x,y0+H,t.z);
   if(dd&&i===0)for(let k=0;k<14;k++){const a=rr(0,TAU),ph=rr(.1,1.2);kput(PL,[t.x+Math.cos(a)*Math.sin(ph)*t.r,y0+H+Math.cos(ph)*t.r,t.z+Math.sin(a)*Math.sin(ph)*t.r],qEuler(ph,-a,0),[t.r*.5,t.r*.4,1]);}}
  for(let y=y0+18;y<y0+H-6;y+=26)mesh(enTube([t.x,y,t.z],[t.x,y+3,t.z],()=>t.r+1.2,36,1),MAT.rust,G);
  /* the eye: a round port near the top, its lens lit */
  const ey=y0+H*.78,ea=Math.atan2(t.eye[1],t.eye[0]),ex=t.x+Math.cos(ea)*(t.r+1),ez=t.z+Math.sin(ea)*(t.r+1);
  if(!brk){mesh(enRing([ex,ey,ez],[Math.cos(ea),0,Math.sin(ea)],t.r*.32,t.r*.46,24),MAT.rust,G);mesh(enRing([ex+Math.cos(ea)*.3,ey,ez+Math.sin(ea)*.3],[Math.cos(ea),0,Math.sin(ea)],0,t.r*.32,24),dd&&i===1?EN_IRON:MAT.dot,G);
   if(!(dd&&i===1))kput('cell',[ex+Math.cos(ea)*.6,ey,ez+Math.sin(ea)*.6],qEuler(0,-ea+Math.PI/2,0),[t.r*.4,t.r*.4,.5],new THREE.Color(0xff2a1a));}
  /* pods and pipes up its flank, a gallery ring half way */
  for(let k=0;k<5;k++){const a=ea+Math.PI+rr(-1,1),ry=y0+rr(.1,.7)*H,pr=t.r*rr(.25,.4);mesh(enTube([t.x+Math.cos(a)*(t.r+pr*.6),ry,t.z+Math.sin(a)*(t.r+pr*.6)],[t.x+Math.cos(a)*(t.r+pr*.6),ry+pr*3,t.z+Math.sin(a)*(t.r+pr*.6)],()=>pr,16,2),MAT.white,G);}
  for(let k=0;k<3;k++){const a=ea+Math.PI*.6+k*.35;kput('pipeR',[t.x+Math.cos(a)*(t.r+2),y0+H*.45,t.z+Math.sin(a)*(t.r+2)],null,[1.4,H*.85,1.4]);}
  mesh(enRing([t.x,y0+H*.5,t.z],[0,1,0],t.r,t.r+6,36),MAT.rust,G);
  if(brk){const rb=t.r*.95;mesh(enTube([t.x+10,20+rb-.25,t.z+20],[t.x+70,rb-.25,t.z+95],()=>rb,36,6),MAT.white,G);   /* the broken capsule leaning from the podium's top down to the ground, its open end on the plain */en3Debris(t.x+40,t.z+50,60,30,PL);}});
 if(dd){rubbleRing(0,0,0,100,220,70,5);enOvergrow(acc,50,20,0,0);}
 meshMerged(acc,conc,G);scatterMoss(0,0,0,110,260,50+40*dd,4);figures(0,90,6,10);
 REGISTER({name:'The Vigil: podium',x:0,y:0,z:0,r:134,h:22});
 T.forEach((t,i)=>REGISTER({name:'The Vigil: tower '+(i+1),x:t.x,y:20,z:t.z,r:t.r+8,h:(dd&&i===2?t.h*.45:t.h)+t.r}));
 EN_SITE.vigil={x:gx,z:gz};
 KOFF=[0,0,0];return G;}

// ---------------------------------------------------------------- THE RECEIVER
function buildReceiver(scene,gx,gz,d){reseed(10240+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0,conc=CONC(d),PL=PLATE(d),acc=[],AY=72,DR=50;
 /* the drum along x, banded, on braced legs; the sphere at its east end with its mouth */
 mesh(enTube([-60,AY,0],[50,AY,0],()=>DR,40,8),conc,G);
 for(let x=-52;x<=44;x+=24)mesh(enTube([x,AY,0],[x+7,AY,0],()=>DR+4,40,1),MAT.white,G);
 mesh(new THREE.SphereGeometry(DR+12,40,24),conc,G,62,AY,0);
 mesh(enRing([62+DR+11.6,AY,0],[1,0,0],DR*.5,DR*.72,32),MAT.white,G);mesh(enRing([62+DR+10,AY,0],[1,0,0],0,DR*.5,32),EN_IRON,G);
 for(let k=0;k<8;k++){const a=k/8*TAU;kput('cell',[62+DR+11.2,AY+Math.sin(a)*DR*.6,Math.cos(a)*DR*.6],qEuler(0,Math.PI/2,0),[3,3,.5],dd&&k%2?DEAD:WARM);}
 for(const x of[-44,0,44])for(const s of[-1,1]){beam('strutR',[x,0,s*58],[x,AY-DR*.7,s*DR*.6],6,6);beam('strutR',[x-16,0,s*70],[x+10,AY-DR*.9,s*DR*.3],3.2,3.2);enBlk(acc,x,4,s*60,18,8,18);}
 /* the twin rail on its trestle, rising into the mouth from 300 m east */
 const R0=[420,6],R1=[62+DR+10,AY-6];let dn=dd?3:-1;
 for(let i=0;i<10;i++){const t0=i/10,t1=(i+1)/10,x0=R0[0]+(R1[0]-R0[0])*t0,x1=R0[0]+(R1[0]-R0[0])*t1,y0=R0[1]+(R1[1]-R0[1])*t0,y1=R0[1]+(R1[1]-R0[1])*t1;
  enTruss('strutR',[x0,0,0],[x0,Math.max(1,y0-3),0],5,6,.6,.1*dd);
  if(i===dn){for(const s of[-3,3])beam('pipeR',[x0,2,s],[x1,9,s+6],2,2);continue;}
  for(const s of[-3,3])beam('pipeR',[x0,y0,s],[x1,y1,s],2,2);kput('boxD',[(x0+x1)/2,(y0+y1)/2-1.8,0],qEuler(0,0,Math.atan2(y1-y0,x1-x0)),[Math.hypot(x1-x0,y1-y0),1.4,9]);}
 /* the slab towers behind it in a row */
 [[-150,-70,260],[-150,-10,220],[-150,50,190],[-150,110,150]].forEach((s,i)=>{const H=dd&&i===1?150:s[2];enBlk(acc,s[0],H/2,s[1],34,H,44);
  for(let y=30;y<H-10;y+=9)kput('cellD',[s[0]+17.2,y,s[1]],qEuler(0,Math.PI/2,0),[6,4,1]);
  enBlk(acc,s[0]+8,22,s[1],46,44,52);beam('strutR',[s[0]+17,AY+10,s[1]],[-60,AY+DR*.5,s[1]*.3],4,4);
  if(dd&&i===1){en3Debris(s[0]-40,s[1]-20,60,30,PL);{const q=qEuler(.3,.5,1.2),sc=[30,60,40];kput('boxD',[s[0]-50,enSeatY(q,sc,0),s[1]-30],q,sc);}}});
 if(dd){rubbleRing(0,0,0,70,260,90,6);enOvergrow(acc,70,24,0,0);}
 meshMerged(acc,conc,G);scatterMoss(0,0,0,70,320,70+50*dd,4);figures(80,80,6,10);
 REGISTER({name:'The Receiver: drum and sphere',x:10,y:0,z:0,r:130,h:AY+DR+16});
 REGISTER({name:'The Receiver: trestle',x:270,y:0,z:0,r:160,h:AY});
 REGISTER({name:'The Receiver: slab towers',x:-150,y:0,z:20,r:110,h:262});
 EN_SITE.receiver={x:gx,z:gz,AY};
 KOFF=[0,0,0];return G;}

// ---------------------------------------------------------------- THE LOOM
function buildLoom(scene,gx,gz,d){reseed(10250+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0,conc=CONC(d),PL=PLATE(d),acc=[],P=110,H=220,RY=170,RR=120,cols=[];
 for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){const k=cols.length,brk=dd&&(k===2||k===6),h=brk?H*rr(.35,.55):H;cols.push({x:i*P,z:j*P,h,brk});
  mesh(enTube([i*P,0,j*P],[i*P,h,j*P],()=>12,24,8),MAT.white,G);
  for(let y=16;y<h;y+=14)mesh(enTube([i*P,y,j*P],[i*P,y+1.4,j*P],()=>12.8,24,1),EN_IRON,G);
  if(!brk){mesh(new THREE.SphereGeometry(16,24,10,0,TAU,0,Math.PI/2),EN_IRON,G,i*P,h,j*P);mesh(enTube([i*P,h-6,j*P],[i*P,h,j*P],()=>17,24,1),MAT.rust,G);kput('pipeR',[i*P,h+22,j*P],null,[.8,30,.8]);}
  else for(let k=0;k<4;k++)beam('pipeR',[i*P+rr(-6,6),h,j*P+rr(-6,6)],[i*P+rr(-14,14),h+rr(6,20),j*P+rr(-14,14)],1.4,1.4);
  enBlk(acc,i*P,3,j*P,34,6,34);}
 /* straight tubes between neighbours at 150 m, the saucers at the ring's joints */
 for(let a=0;a<9;a++)for(const b of[a+1,a+3]){if(b>=9||(b===a+1&&a%3===2))continue;const A=cols[a],B=cols[b];if(A.h<150||B.h<150){if(dd)mesh(enTube([A.x,4.75,A.z],[(A.x+B.x)/2+12,4.75,(A.z+B.z)/2+8],()=>5,12,4),MAT.white,G);continue;}
  mesh(enTube([A.x,150,A.z],[B.x,150,B.z],()=>5,12,6),MAT.white,G);for(let t=.2;t<.9;t+=.2)kput('cell',[A.x+(B.x-A.x)*t,150+5.2,A.z+(B.z-A.z)*t],null,[2,.5,2],dd?DEAD:CYAN);}
 const arc=dd?TAU*.68:TAU,ring=mesh(new THREE.TorusGeometry(RR,7,10,120,arc),MAT.white,G,0,RY,0);ring.rotation.set(Math.PI/2,0,dd?.9:0);
 for(let k=0;k<8;k++){const a=k/8*TAU;if(dd&&((a-.9+TAU)%TAU)>arc)continue;const x=Math.cos(a)*RR,z=Math.sin(a)*RR;mesh(enTube([x,RY-4,z],[x,RY+4,z],()=>20,28,1),MAT.white,G);mesh(enRing([x,RY-4,z],[0,-1,0],0,20,28),EN_IRON,G);}
 if(dd){const seg=mesh(new THREE.TorusGeometry(RR,7,10,40,TAU*.3),MAT.white,G,40,6.75,60);seg.rotation.set(Math.PI/2,0,2.8);   /* the fallen third of the ring flat on the plain */en3Debris(60,90,150,50,PL);rubbleRing(0,0,0,40,260,100,6);enOvergrow(acc,60,24,0,0);}
 meshMerged(acc,conc,G);scatterMoss(0,0,0,30,300,70+60*dd,4);figures(0,160,6,12);
 REGISTER({name:'The Loom: columns and ring',x:0,y:0,z:0,r:P*1.45+20,h:H+50});
 EN_SITE.loom={x:gx,z:gz};
 KOFF=[0,0,0];return G;}

// ---------------------------------------------------------------- the owner's second sheet (2026-11-10, "more inspo")
//   THE IRIS        a dark bulb 100 m across with a great eye of concentric rings on its face, standing on eight bent pipes like
//                   legs, a column of conduits rising out of its crown into the haze. The eye is dead; one leg has given.
//   THE HIVE        a hexagonal tower 240 m tall clad in hexagonal plates, a toothed eye-disc in its face, standing on a skirt of
//                   splayed buttresses. Plates have fallen in drifts; a buttress is broken.
//   THE STAR        a sphere on a pedestal drum with ten great cylinders radiating from it, capped and valved, cables looping between
//                   them. Two cylinders are torn off and lie on the ground.
//   THE ABACUS      a column of conduits 160 m tall with spheres clustered at its head, and cables taut from it to the ground far out,
//                   threaded with beads the size of houses. Two cables have parted and their beads lie in the dust.

// ---------------------------------------------------------------- THE IRIS
function buildIris(scene,gx,gz,d){reseed(10260+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0,conc=CONC(d),PL=PLATE(d),acc=[],BY=78,BR=50;
 mesh(new THREE.SphereGeometry(BR,40,26),EN_IRON,G,0,BY,0);
 mesh(enTube([0,BY+BR*.6,0],[0,BY+BR+40,0],t=>BR*.5-t*.2,28,4),EN_IRON,G);
 /* the eye: concentric rings on the +z face, a lens at its centre, ten small ports round it */
 [[.9,.98],[.66,.78],[.42,.52]].forEach((q,i)=>mesh(enRing([0,BY,BR*(.45+i*.12)],[0,0,1],BR*q[0],BR*q[1],48),MAT.rust,G));
 mesh(enRing([0,BY,BR*.86],[0,0,1],0,BR*.36,40),EN_IRON,G);mesh(new THREE.SphereGeometry(BR*.2,24,14),dd?EN_IRON:MAT.glass,G,0,BY,BR*.9);
 for(let k=0;k<10;k++){const a=k/10*TAU,r=BR*.7;mesh(enRing([Math.cos(a)*r,BY+Math.sin(a)*r,Math.sqrt(Math.max(0,BR*BR-r*r))+.5],[Math.cos(a)*.35,Math.sin(a)*.35,1],0,BR*.07,16),MAT.rust,G);}
 /* eight bent pipes for legs: out from the bulb's lower half, down to feet in the ground */
 for(let k=0;k<8;k++){const a=k/8*TAU+.2,c=Math.cos(a),s=Math.sin(a),give=dd&&k===5;
  const p0=[c*BR*.8,BY-BR*.3,s*BR*.8],p1=[c*(BR+30),give?BY-60:BY-20,s*(BR+30)],p2=[c*(BR+52),0,s*(BR+52)];
  mesh(enTube(p0,p1,()=>9,14,4),EN_IRON,G);mesh(enTube(p1,p2,()=>8.5,14,4),EN_IRON,G);mesh(new THREE.SphereGeometry(9.6,14,10),EN_IRON,G,p1[0],p1[1],p1[2]);
  enBlk(acc,p2[0],2,p2[2],22,4,22);
  for(let j=0;j<3;j++){const t0=.2+j*.25,t1=t0+.04;mesh(enTube([p1[0]+(p2[0]-p1[0])*t0,p1[1]+(p2[1]-p1[1])*t0,p1[2]+(p2[2]-p1[2])*t0],[p1[0]+(p2[0]-p1[0])*t1,p1[1]+(p2[1]-p1[1])*t1,p1[2]+(p2[2]-p1[2])*t1],()=>10,14,1),MAT.rust,G);}}
 /* the conduits rising from its crown, leaning away into the haze */
 for(let k=0;k<7;k++){const a=k/7*TAU,r=12+k%3*6,x=Math.cos(a)*r,z=Math.sin(a)*r,top=dd&&k%3===1?BY+BR+60:BY+BR+220;
  mesh(enTube([x,BY+BR*.7,z],[x*1.6,top,z*1.6-20],()=>3+k%2*2,10,6),EN_IRON,G);}
 for(let k=0;k<5;k++)beam('strutR',[rr(-40,40),0,-BR-60],[rr(-20,20),BY+BR+160,-30],3,3);
 if(dd){en3Debris(30,40,60,30,PL);rubbleRing(0,0,0,40,200,70,5);   /* its wreckage within 110 m: a host's pad for it is 135 (AV.ENGINES r + 20), and past a pad the ground falls away */enOvergrow(acc,40,20,0,0);}
 meshMerged(acc,conc,G);figures(0,140,4,8);
 REGISTER({name:'The Iris: bulb and legs',x:0,y:0,z:0,r:BR+60,h:BY+BR});
 REGISTER({name:'The Iris: the conduit column',x:0,y:BY,z:0,r:60,h:BR+230});
 EN_SITE.iris={x:gx,z:gz,BY};
 KOFF=[0,0,0];return G;}

// ---------------------------------------------------------------- THE HIVE
function buildHive(scene,gx,gz,d){reseed(10270+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0,conc=CONC(d),PL=PLATE(d),acc=[],Y0=60,H=240,R=46;
 mesh(new THREE.CylinderGeometry(R,R,H,6,1).translate(0,Y0+H/2,0),EN_IRON,G);
 /* the hexagonal plates in staggered rows on each face (the kit's instanced hexagonal prisms, 2.2 m thick, a quarter of them glazed) */
 for(let f=0;f<6;f++){const a=f/6*TAU+Math.PI/6,c=Math.cos(a),s=Math.sin(a),ap=R*Math.cos(Math.PI/6),w=R;
  for(let row=0;row<20;row++){const y=Y0+8+row*11.6;for(let i=-3;i<=3;i++){const u=i*10.8+(row%2?5.4:0);if(Math.abs(u)>w/2-5)continue;
   if(dd&&(rng()<.18||(f===2&&y>Y0+150)))continue;kput(rng()<.25?'enHexG':'enHexW',[c*(ap+1.2)-s*u,y,s*(ap+1.2)+c*u],qEuler(0,-a+Math.PI/2,0),[6.2,6.2,2.2]);}}}
 /* the eye: a toothed disc on the south face */
 const ex=0,ez=R*.87+3,ey=Y0+H*.55;
 mesh(enRing([ex,ey,ez],[0,0,1],12,26,40),MAT.rust,G);mesh(enRing([ex,ey,ez+.4],[0,0,1],0,12,30),dd?EN_IRON:MAT.glass,G);
 for(let k=0;k<24;k++){const a=k/24*TAU;kput('boxD',[ex+Math.cos(a)*28,ey+Math.sin(a)*28,ez],qEuler(0,0,a),[6,2.4,2]);}
 /* the skirt: splayed buttresses from the base out to the ground */
 for(let k=0;k<18;k++){const a=k/18*TAU,c=Math.cos(a),s=Math.sin(a);if(dd&&k===7){const q=qEuler(.1,-a,0),sc=[70,4,9];kput(PL,[c*90,enSeatY(q,sc,0),s*90],q,sc);continue;}
  beam('plateR',[c*R*.8,Y0+20,s*R*.8],[c*130,0,s*130],8,4);}
 mesh(enTube([0,Y0-20,0],[0,Y0,0],()=>R*.9,6,1),EN_IRON,G);
 if(dd){for(let k=0;k<40;k++){const a=rng()*TAU,r=rr(60,170);const q=qEuler(rr(-1.7,-1.4),rng()*TAU,rr(-.3,.3));kput('enHexW',[Math.cos(a)*r,enSeatY(q,EN_HEX_S,0),Math.sin(a)*r],q,[6.2,6.2,2.2]);}rubbleRing(0,0,0,60,200,60,5);enOvergrow(acc,40,20,0,0);}
 meshMerged(acc,conc,G);figures(0,150,4,8);
 REGISTER({name:'The Hive: tower',x:0,y:Y0,z:0,r:R+4,h:H});
 REGISTER({name:'The Hive: buttress skirt',x:0,y:0,z:0,r:134,h:Y0+20});
 EN_SITE.hive={x:gx,z:gz};
 KOFF=[0,0,0];return G;}

// ---------------------------------------------------------------- THE STAR
function buildStar(scene,gx,gz,d){reseed(10280+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0,conc=CONC(d),PL=PLATE(d),acc=[],SY=110,SR=40;
 mesh(enTube([0,0,0],[0,14,0],()=>70,48,1),conc,G);mesh(enRing([0,14,0],[0,1,0],0,70,48),conc,G);
 for(let k=0;k<12;k++){const a=k/12*TAU;beam('strutR',[Math.cos(a)*44,14,Math.sin(a)*44],[Math.cos(a)*22,SY-SR*.8,Math.sin(a)*22],3,3);}
 mesh(enTube([0,14,0],[0,SY-SR*.6,0],()=>26,24,3),EN_IRON,G);
 mesh(new THREE.SphereGeometry(SR,36,24),MAT.rust,G,0,SY,0);
 /* ten cylinders radiating on the directions of a pentagonal antiprism, each capped and banded */
 const D=[];for(let i=0;i<5;i++){const a=i/5*TAU;D.push([Math.cos(a)*.85,.53,Math.sin(a)*.85]);D.push([Math.cos(a+TAU/10)*.85,-.53,Math.sin(a+TAU/10)*.85]);}
 D.forEach((v,i)=>{const torn=dd&&(i===3||i===8),L=150,a=[v[0]*SR*.9,SY+v[1]*SR*.9,v[2]*SR*.9],b=[v[0]*L,Math.max(16,SY+v[1]*L),v[2]*L];
  mesh(enRing(a,v,0,SR*.32,24),EN_IRON,G);
  if(torn){const fx=v[0]*115,fz=v[2]*115;mesh(enTube([fx,12.75,fz],[fx+v[2]*60,12.75,fz-v[0]*60],()=>13,20,4),MAT.white,G);return;}   /* on its side, 0.25 m in, inside the engine's reach */
  mesh(enTube(a,b,t=>t<20?9:14,20,6),MAT.white,G);mesh(new THREE.SphereGeometry(14,20,12),MAT.white,G,b[0],b[1],b[2]);
  for(const t of[.35,.7]){const p=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];mesh(enTube(p,[p[0]+v[0]*4,p[1]+v[1]*4,p[2]+v[2]*4],()=>16,20,1),EN_IRON,G);}
  const n=D[(i+2)%10],q=[n[0]*L*.8,SY+n[1]*L*.8,n[2]*L*.8];beam('tube',[b[0]*.8,b[1]*.95,b[2]*.8],[(b[0]*.8+q[0])/2,Math.max(6,Math.min(b[1],q[1])-30),(b[2]*.8+q[2])/2],.9,.9);});
 if(dd){en3Debris(0,0,180,40,PL);rubbleRing(0,0,0,70,220,70,5);enOvergrow(acc,40,20,0,0);}
 meshMerged(acc,conc,G);figures(0,110,5,8);
 REGISTER({name:'The Star',x:0,y:0,z:0,r:170,h:SY+150});
 EN_SITE.star={x:gx,z:gz,SY};
 KOFF=[0,0,0];return G;}

// ---------------------------------------------------------------- THE ABACUS
function buildAbacus(scene,gx,gz,d){reseed(10290+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0,conc=CONC(d),acc=[],H=160;
 /* the column: a bundle of conduits on a ring plinth, its foot spread like a root */
 mesh(enTube([0,0,0],[0,6,0],()=>60,40,1),conc,G);mesh(enRing([0,6,0],[0,1,0],0,60,40),conc,G);
 for(let k=0;k<9;k++){const a=k/9*TAU,r=8+k%3*5;mesh(enTube([Math.cos(a)*r*2.2,6,Math.sin(a)*r*2.2],[Math.cos(a)*r,H,Math.sin(a)*r],()=>4+k%3*1.5,12,6),k%2?MAT.rust:EN_IRON,G);}
 for(let y=20;y<H;y+=22)mesh(enTube([0,y,0],[0,y+3,0],()=>20,20,1),EN_IRON,G);
 /* the spheres at its head, banded, and a hooped arc over the largest */
 [[0,H+30,0,32],[34,H+6,20,22],[-30,H+12,-10,18],[18,H-30,-28,16],[-24,H-24,26,14]].forEach(s=>{mesh(new THREE.SphereGeometry(s[3],28,18),MAT.rust,G,s[0],s[1],s[2]);mesh(enTube([s[0],s[1]-s[3]*.3,s[2]],[s[0],s[1]+s[3]*.3,s[2]],()=>s[3]*1.02,28,1),EN_IRON,G);});
 const arc=mesh(new THREE.TorusGeometry(44,3,8,40,Math.PI*1.1),EN_IRON,G,0,H+30,0);arc.rotation.set(0,.4,-.1);
 /* the cables: from the head to anchors 300-420 m out, threaded with beads; parted ones lie with their beads in the dust */
 for(let k=0;k<11;k++){const a=-1.1+k*.22,r=300+(k%3)*60,ax=Math.cos(a)*r,az=Math.sin(a)*r,top=[0,H+20,0],parted=dd&&(k===2||k===7);enBlk(acc,ax,3,az,14,6,14);
  if(parted){beam('tube',[ax,.5,az],[ax*.5,.5,az*.5],.5,.5);for(let j=1;j<5;j++){const t=j/5*.5+.5;const rb=5+j%2*3;mesh(new THREE.SphereGeometry(rb,14,10),MAT.rust,G,ax*t,rb-.25,az*t);}continue;}
  beam('tube',top,[ax,1,az],.5,.5);
  for(let j=1;j<6;j++){const t=j/6,br=(k+j)%3?4:7;mesh(new THREE.SphereGeometry(br,14,10),MAT.rust,G,top[0]+(ax-top[0])*t,top[1]+(1-top[1])*t,top[2]+(az-top[2])*t);}}
 if(dd){rubbleRing(0,0,0,60,200,60,5);enOvergrow(acc,40,20,0,0);}
 meshMerged(acc,conc,G);figures(60,40,4,8);
 REGISTER({name:'The Abacus: column and spheres',x:0,y:0,z:0,r:62,h:H+62});
 REGISTER({name:'The Abacus: the cables',x:180,y:0,z:0,r:260,h:H+20});
 EN_SITE.abacus={x:gx,z:gz};
 KOFF=[0,0,0];return G;}
