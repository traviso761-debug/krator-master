// ================================================================= IZIZ ORIGINAL — the painting's own structures, ported from the Iziz Ancients Mix
// The outer wall with its tetragonal wedge towers, gatehouses and bridges over the moat; the palace curtain wall in the
// ANCIENT style with sentry towers (Travis, round 2); the barracks wedges; the heroic statues; the observation tower in
// ruined colours; the spaceport, ruined. All parametrised on the city's geometry (wallR, gates, terrainH) so the same
// builders serve the original 235 m plateau and the new 470 m one.
MAT.izWall=new THREE.MeshStandardMaterial({map:TEX.stone,color:0xe07a2a,roughness:.95,side:DS});vWorldUV(MAT.izWall,.25);
MAT.izWallDark=new THREE.MeshStandardMaterial({map:TEX.stone,color:0xa8521a,roughness:.95,side:DS});vWorldUV(MAT.izWallDark,.25);
MAT.izCap=new THREE.MeshStandardMaterial({map:TEX.stone,color:0xf2a24a,roughness:.9,side:DS});vWorldUV(MAT.izCap,.25);
MAT.izSand=new THREE.MeshStandardMaterial({map:TEX.stone,color:0xe2b676,roughness:.95,side:DS});vWorldUV(MAT.izSand,.25);
MAT.izRock=new THREE.MeshStandardMaterial({map:TEX.concrete,color:0x6a4a34,roughness:1,side:DS});vWorldUV(MAT.izRock,.125);
MAT.bronze=new THREE.MeshStandardMaterial({color:0x9a7a3c,roughness:.45,metalness:.7});MAT.bronzeDark=new THREE.MeshStandardMaterial({color:0x6e5428,roughness:.5,metalness:.7});
kdef('izWedge',vnWedgeGeo(.36,.28),MAT.izWall);kdef('izWedgeS',vnWedgeGeo(.36,.28),MAT.izSand);kdef('izWedgeD',vnWedgeGeo(.36,.28),MAT.izWallDark);
kdef('izBoxW',VBOX,MAT.izWall);kdef('izBoxD',VBOX,MAT.izWallDark);kdef('izBoxCap',VBOX,MAT.izCap);kdef('izBoxS',VBOX,MAT.izSand);kdef('izRockB',VBOX,MAT.izRock);
kdef('izFrus',vnWedgeGeo(.86,.9),MAT.izWall);kdef('izFrusS',vnWedgeGeo(.85,.85),MAT.izSand);kdef('izFrusCap',vnWedgeGeo(.9,.9),MAT.izCap);kdef('izPyrS',vnWedgeGeo(.06,.06),MAT.izSand);kdef('izOct',new THREE.CylinderGeometry(.86,1,1,8).rotateY(Math.PI/8).translate(0,.5,0),MAT.izSand);kdef('izOctCap',new THREE.CylinderGeometry(1,1,1,8).rotateY(Math.PI/8).translate(0,.5,0),MAT.izCap);
kdef('izOctR',new THREE.CylinderGeometry(.86,1,1,8).rotateY(Math.PI/8).translate(0,.5,0),MAT.concreteR);kdef('izOctRust',new THREE.CylinderGeometry(.9,1,1,8).rotateY(Math.PI/8).translate(0,.5,0),MAT.rust);
kdef('izBronze',VBOX,MAT.bronze);kdef('izBronzeD',VBOX,MAT.bronzeDark);kdef('izBronzeCyl',new THREE.CylinderGeometry(1,1,1,7).translate(0,.5,0),MAT.bronze);kdef('izBronzeOct',new THREE.OctahedronGeometry(1,0),MAT.bronze);kdef('izBronzeCone',new THREE.ConeGeometry(1,1,4).translate(0,.5,0),MAT.bronzeDark);kdef('izBronzeTor',new THREE.TorusGeometry(1,.08,6,20),MAT.bronzeDark);
kdef('izGlow',VBALL,MAT.bulb);kdef('izSteel',new THREE.CylinderGeometry(1,1,1,12).translate(0,.5,0),MAT.rust);kdef('izSteelBox',VBOX,MAT.rust);kdef('izRustB',VBOX,MAT.rust);
const IZ_ORANGE=vC(0xe07a2a);
// the citadel's board-formed concrete, tinted to the palace's sandstone (Travis: the curtain wall matches the palace)
const IZ_CONC_TINT=vC(0xe8b070);
MAT.izConcOrange=MAT.concrete.clone();MAT.izConcOrange.color=new THREE.Color(0xe0a868);if(MAT.concrete.onBeforeCompile)MAT.izConcOrange.onBeforeCompile=MAT.concrete.onBeforeCompile;

// ---- the outer wall: rampart segments merged per material; wedge towers; rock foundation down through the moat ----
function izOuterWall(scene,wallR,cx,cz,n,H,wb,wt,skipFn,towerEvery){
 const shape=new THREE.Shape();shape.moveTo(-wb/2,0);shape.lineTo(wb/2,0);shape.lineTo(wt/2,H);shape.lineTo(-wt/2,H);shape.closePath();
 const segs=[],G=new THREE.Group();scene.add(G);
 for(let i=0;i<n;i++){const t0=i/n*TAU,t1=(i+1)/n*TAU;if(skipFn&&skipFn((t0+t1)/2))continue;
  const a=[cx+wallR(t0)*Math.cos(t0),cz+wallR(t0)*Math.sin(t0)],b=[cx+wallR(t1)*Math.cos(t1),cz+wallR(t1)*Math.sin(t1)];
  const len=Math.hypot(b[0]-a[0],b[1]-a[1]),ang=Math.atan2(b[1]-a[1],b[0]-a[0]);const base=Math.min(terrainH(a[0],a[1]),terrainH(b[0],b[1]))-3;
  const geo=new THREE.ExtrudeGeometry(shape,{depth:len+1.2,bevelEnabled:false});geo.rotateY(Math.PI/2-ang);geo.translate(a[0],base,a[1]);{const u=geo.attributes.uv.array;for(let k=0;k<u.length;k++)u[k]*=.25;}segs.push(geo);   // extrude UVs are metres; the stone tile is 4 m
  const mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2;
  kput('izRockB',[mx,base-20,mz],qEuler(0,-ang,0),[len+1.4,40.5,wb+3],null);                 // rock foundation down through the moat
  kput('izBoxCap',[mx,base+H+.3,mz],qEuler(0,-ang,0),[len+1.2,1.4,wt+1.2],null);              // parapet band
  if(i%towerEvery===0){const ty=terrainH(a[0],a[1])-3;                                          // tetragonal wedge tower: wide along the wall, pinched to a ridge, blank faces
   kput('izRockB',[a[0],ty-20,a[1]],qEuler(0,-ang,0),[wt+22,40.5,wt+12],null);
   kput('izWedgeD',[a[0],ty,a[1]],qEuler(0,-ang,0),[wt+22,H+22,wt+10],null);
   kput('izBoxCap',[a[0],ty+H+22.45,a[1]],qEuler(0,-ang,0),[(wt+22)*.36+.6,.9,(wt+10)*.28+.6],null);
   REG.push({name:'Outer wall tower '+(i/towerEvery+1|0),x:a[0],y:terrainH(a[0],a[1])-6,z:a[1],r:16,h:H+50,cls:'building',key:'iziz_wall_tower',tags:{culture:'iziz-old',type:['military','infrastructure'],wealth:'civic',lit:false}});}}
 meshMerged(segs,MAT.izWall,G);
 for(let i=0;i<36;i++){const t=i/36*TAU,R=wallR(t);REG.push({name:'Outer wall',x:cx+R*Math.cos(t),y:terrainH(cx+R*Math.cos(t),cz+R*Math.sin(t))-6,z:cz+R*Math.sin(t),r:30,h:H+30,cls:'building',key:'iziz_wall',tags:{culture:'iziz-old',type:['military','infrastructure'],wealth:'civic',lit:false}});}
 return G;}
// ---- outer gate: sloped gatehouse, deco lintel bands, wedge flankers with gun turrets, bridge on piers across the moat ----
function izGate(scene,g,R,plateau,idx){const cx=R*Math.cos(g),cz=R*Math.sin(g);const W=(lx,ly,lz)=>[cx+lx*Math.cos(g)-lz*Math.sin(g),ly,cz+lx*Math.sin(g)+lz*Math.cos(g)];const q=qEuler(0,-g,0);
 const P=(item,lx,ly,lz,sx,sy,sz,c)=>{const p=W(lx,ly,lz);kput(item,[p[0],plateau+ly+sy/2,p[2]],q,[sx,sy,sz],c||null);};
 const F=(item,lx,ly,lz,sx,sy,sz)=>{const p=W(lx,ly,lz);kput(item,[p[0],plateau+ly,p[2]],q,[sx,sy,sz],null);};   // wedge/frustum items: base at y
 [-1,1].forEach(sd=>F('izFrus',0,-2,sd*15.75,28,38,18.5));
 P('izBoxW',0,22,0,26,14,14);F('izFrusCap',0,36,0,24,8,42);
 [-1,1].forEach(sd=>P('izBoxD',0,0,sd*6.7,24,22,.5));P('izBoxD',0,21.6,0,24,.5,13.5);
 P('izRustB',0,29,0,1.4,15,12.6);                                                                   // the door, raised open into the lintel by day
 F('izWedgeD',-2,-2,34,22,52,30);F('izWedgeD',-2,-2,-34,22,52,30);P('izBoxCap',-2,50,34,8.5,.9,9);P('izBoxCap',-2,50,-34,8.5,.9,9);
 [34,-34].forEach(sz=>{const p=W(-2,0,sz);kput('izOct',[p[0],plateau+50.9,p[2]],q,[2.2,1.8,2.2],vC(0x6a5a4a));kput('vBall',[p[0],plateau+53.2,p[2]],null,[1.4,1.4,1.4],vC(0x3a3632));for(const s of[-1,1]){const pp=W(-2+3.2,0,sz+s*.9);kput('vPipe',[pp[0],plateau+52.8,pp[2]],qEuler(0,-g,Math.PI/2-.15),[.3,7,.3],vC(0x2e2a26));}});
 for(let k=0;k<3;k++)P('izBoxCap',14.6-k*.2,22+k*3,0,1,1.4-k*.2,30-k*4);for(let i=-2;i<=2;i++)P('izGlow',14.8,30.5,i*6,.4,2.6,.8);
 P('izRockB',-1,-40,0,32,38.2,52);P('izRockB',10,-40,0,12,38.2,22);
 P('izBoxS',26,-3.2,0,52,3.2,15);P('izBoxCap',26,0,7.2,52,2.2,1.4);P('izBoxCap',26,0,-7.2,52,2.2,1.4);
 for(let i=0;i<4;i++)F('izFrusS',8+i*13,-16,0,6,14,17);
 const gi=idx+1;REG.push({name:'Gatehouse '+gi,x:cx,y:plateau-3,z:cz,r:22,h:52,cls:'building',key:'iziz_gate',tags:{culture:'iziz-old',type:['military','infrastructure'],wealth:'civic',lit:true}});
 [-1,1].forEach((sd,k)=>{const p=W(-2,0,sd*34);REG.push({name:'Gate tower '+(gi*2-1+k),x:p[0],y:plateau-3,z:p[2],r:18,h:58,cls:'building',key:'iziz_gate',tags:{culture:'iziz-old',type:['military'],wealth:'civic',lit:false}});});
 for(const lx of[16,40]){const p=W(lx,0,0);REG.push({name:'Bridge (gate '+gi+')',x:p[0],y:plateau-30,z:p[2],r:15,h:46,cls:'building',key:'iziz_bridge',tags:{culture:'iziz-old',type:['infrastructure'],wealth:'civic',lit:false}});}}
// ---- palace curtain wall in the ANCIENT style: battered board-formed concrete with white-panel cladding bands and cyan
//      strips (the palace still has power), sentry towers — fluted drums with a glass gallery and a light crown ----
function izCurtainWall(scene,rf,cx,cz,n,H,gates,towerEvery,barracksAngles){const G=new THREE.Group();scene.add(G);const segs=[];
 for(let i=0;i<n;i++){const t0=i/n*TAU,t1=(i+1)/n*TAU,tm=(t0+t1)/2;if(gates.some(pg=>angDiff(tm,pg)<.16))continue;if(barracksAngles&&barracksAngles.some(b=>angDiff(tm,b)<.14))continue;
  const a=[cx+rf(t0)*Math.cos(t0),cz+rf(t0)*Math.sin(t0)],b=[cx+rf(t1)*Math.cos(t1),cz+rf(t1)*Math.sin(t1)];const len=Math.hypot(b[0]-a[0],b[1]-a[1]),ang=Math.atan2(b[1]-a[1],b[0]-a[0]);
  const base=Math.min(terrainH(a[0],a[1]),terrainH(b[0],b[1]))-3;const mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2;const q=qEuler(0,-ang,0);
  kput('boxC',[mx,base+H/2,mz],q,[len+.6,H,7],IZ_CONC_TINT);                                      // the concrete rampart, sandstone-tinted
  kput('boxC',[mx,base+H+.5,mz],q,[len+.6,1.0,8.2],IZ_CONC_TINT);
  for(const s of[-1,1]){kput('plateW',[mx-Math.sin(ang)*s*3.6,base+H*.62,mz+Math.cos(ang)*s*3.6],q,[len*.92,H*.36,.3],null);   // panel cladding band, upper half
   kput('strip',[mx-Math.sin(ang)*s*3.75,base+H*.4,mz+Math.cos(ang)*s*3.75],q,[len*.9,1,1],CYAN);}
  if(i%towerEvery===0){const tx=a[0],tz=a[1],ty=terrainH(tx,tz)-3,TH=H+14;
   mesh(lathe({rFn:yy=>4.2*(1-.05*Math.pow(yy/TH,4))*(1+.12*Math.pow(.5+.5*Math.cos(yy*0),1)),H:TH,flutes:12,amp:.09,sharp:2.5,nu:36,nv:8}),MAT.izConcOrange,G,tx,ty,tz);
   mesh(lathe({rFn:()=>4.6,H:2.6,nu:24,nv:1}),MAT.glass,G,tx,ty+TH-3.4,tz);mesh(lathe({rFn:()=>4.2,H:2.6,nu:20,nv:1}),MAT.dark,G,tx,ty+TH-3.4,tz);mullions(tx,ty+TH-3.4,tz,4.6,2.6,14,0);
   kput('slab',[tx,ty+TH-.6,tz],null,[5.2,.6,5.2],vC(0xd8d4cc));stripRing(tx,ty+TH-.2,tz,4.9,0,16);kput('slab',[tx,ty+TH,tz],null,[4.6,.5,4.6],vC(0xd8d4cc));
   mesh(lathe({rFn:yy=>4.0*Math.sqrt(clamp(1-Math.pow(yy/3,2),0,1)),H:3,nu:20,nv:5}),MAT.white,G,tx,ty+TH+.4,tz);kput('finial',[tx,ty+TH+4,tz],null,[.8,1.4,.8],null);
   REG.push({name:'Palace sentry tower',x:tx,y:terrainH(tx,tz)-6,z:tz,r:6,h:TH+8,cls:'building',key:'iziz_curtain_tower',tags:{culture:'ancients',type:['military'],wealth:'civic',lit:true}});}}
 for(let i=0;i<20;i++){const t=i/20*TAU;if(gates.some(pg=>angDiff(t,pg)<.22))continue;REG.push({name:'Palace curtain wall (Ancient)',x:cx+rf(t)*Math.cos(t),y:terrainH(cx+rf(t)*Math.cos(t),cz+rf(t)*Math.sin(t))-6,z:cz+rf(t)*Math.sin(t),r:14,h:H+6,cls:'building',key:'iziz_curtain',tags:{culture:'ancients',type:['military'],wealth:'civic',lit:true}});}
 // gates: an arch through the rampart, strut portico, two lamp-crowned pylons
 for(const pg of gates){const R=rf(pg),gx=cx+R*Math.cos(pg),gz=cz+R*Math.sin(pg),gy=terrainH(gx,gz)-3;const q=qEuler(0,-pg,0);
  kput('boxC',[gx,gy+H/2+2,gz],q,[13,H+4,16],IZ_CONC_TINT);kput('archOpen',[gx,gy+5.5,gz],qFacing([Math.cos(pg),0,Math.sin(pg)]),[1.4,1.2,15],null);
  for(const s of[-1,1]){const px=gx-Math.sin(pg)*s*9.5,pz=gz+Math.cos(pg)*s*9.5;kput('colW',[px,gy,pz],null,[1.6,H+9,1.6],null);kput('finial',[px,gy+H+9.6,pz],null,[.9,1.4,.9],null);
   for(let k=-1;k<=1;k++)kput('strip',[gx+Math.cos(pg)*k*3.4,gy+H+2.6,gz+Math.sin(pg)*k*3.4],q,[11,1,1],CYAN);}
  REG.push({name:'Palace gate',x:gx,y:terrainH(gx,gz)-4,z:gz,r:14,h:H+12,cls:'building',key:'iziz_palace_gate',tags:{culture:'ancients',type:['military','civic'],wealth:'civic',lit:true}});}
 return G;}
function angDiff(a,b){let d=a-b;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;return Math.abs(d);}
// ---- citadel barracks: a real Ancient-style block just inside the curtain wall — three floors, battered concrete with white
//      panel bands, rows of windows (lit: the citadel is electrified), a door under a canopy on the face toward the court,
//      a stair drum at one end, a cyan light strip along the parapet. (x,z) is the block centre, `a` the bearing from the
//      hill centre (the door faces -a), idx numbers it.
function izBarracks(x,z,a,idx){const ty=terrainH(x,z)-.2;const ry=Math.atan2(-Math.cos(a),-Math.sin(a));const q=qEuler(0,ry,0);const W=30,D=14,FL=4.2,NF=3,H=FL*NF;
 const L=(lx,lz)=>loc(x,z,lx,lz,ry);const B=(item,lx,ly,lz,sx,sy,sz,c)=>{const p=L(lx,lz);kput(item,[p[0],ty+ly+sy/2,p[1]],q,[sx,sy,sz],c||null);};
 B('izBoxS',0,0,0,W,H,D);B('izBoxS',0,-1.2,0,W+1.6,1.2,D+1.6);                                   // the block on a low plinth
 for(let f=1;f<=NF;f++)B('izBoxW',0,f*FL-.5,0,W+.4,.6,D+.4);                                     // white panel band at each floor line
 B('izBoxCap',0,H+.1,0,W+.6,.7,D+.6);B('izBoxS',0,H+.8,0,W-2,.9,D-2);                            // parapet, roof upstand
 for(const s of[-1,1])kput('strip',[L(0,s*(D/2+.32))[0],ty+H+.45,L(0,s*(D/2+.32))[1]],q,[W-4,.5,1],CYAN);   // the light strips
 // windows: 6 bays per floor on the court face and the back, 2 on each end; lit panes with a dark reveal
 for(let f=0;f<NF;f++){const wy=f*FL+1.4;
  for(let i=0;i<6;i++){const lx=(i-2.5)*4.4;if(f===0&&(i===2||i===3))continue;                     // the door bay at ground
   for(const s of[-1,1]){B('vDarkB',lx,wy,s*(D/2+.02),1.8,2.2,.3);B('vWinLit',lx,wy+.15,s*(D/2+.1),1.4,1.8,.2);}}
  for(let i=0;i<2;i++)for(const s of[-1,1]){const lz=(i-.5)*5;B('vDarkB',s*(W/2+.02),wy,lz,.3,2.2,1.8);B('vWinLit',s*(W/2+.1),wy+.15,lz,.2,1.8,1.4);}}
 // the door toward the court (+z in the local frame is -a: toward the hill centre), its canopy and steps
 B('vDarkB',0,0,D/2+.05,3.2,3.6,.4);B('izBoxW',0,3.8,D/2+1.2,5.6,.5,2.8);B('izBoxS',0,-1.2,D/2+1.6,5.6,1.2,2.4);B('izBoxS',0,-1.2,D/2+3.2,7,.6,1.4);
 for(const s of[-1,1]){const p=L(s*4.2,D/2+2.4);kput('vPostS',[p[0],ty,p[1]],null,[.45,4.6,.45],vC(0xe2b676));kput('izGlow',[p[0],ty+4.9,p[1]],null,[.45,.45,.45],null);}
 // stair drum at one end, a floor above the roof, with its own strip
 {const p=L(-(W/2+2.2),-D/2+3.5);kput('izOct',[p[0],ty,p[1]],q,[5.2,H+4.6,5.2],null);kput('izBoxCap',[p[0],ty+H+4.7,p[1]],q,[5.6,.5,5.6],null);kput('strip',[p[0],ty+H+4.1,p[1]],q,[4,.4,1],CYAN);}
 REG.push({name:'Citadel barracks '+idx,x,y:ty-2,z,r:Math.hypot(W,D)/2+2,h:H+6,cls:'building',key:'iziz_barracks',tags:{culture:'iziz-old',type:['military','multi-family dwelling'],wealth:'civic',lit:true,state:'intact'}});}
// ---- heroic statues: science-fantasy art deco, stepped pedestal, three poses ----
function izStatue(x,z,h,pose,facing,yBase){const y=yBase!==undefined?yBase:terrainH(x,z)-.3;const s=h/20;const q=qEuler(0,facing,0);
 kput('izFrusCap',[x,y,z],q,[h*.55,h*.12,h*.55],vC(0xe2b676));kput('izFrusCap',[x,y+h*.12,z],q,[h*.4,h*.08,h*.4],vC(0xf0d29a));kput('izOct',[x,y+h*.2,z],q,[h*.13,h*.06,h*.13],vC(0x6e5428));
 const fy=y+h*.26;const L=(lx,ly,lz)=>{const p=loc(x,z,lx*s,lz*s,facing);return[p[0],fy+ly*s,p[1]];};
 for(const lx of[-1.4,1.4]){const p=L(lx,0,0);kput('izBronzeCyl',[p[0],p[1],p[2]],q,[1.3*s,9*s,1.3*s],null);}
 {const p=L(0,9,0);kput('izBronzeCyl',[p[0],p[1],p[2]],q,[3.0*s,9*s,3.0*s],null);}{const p=L(0,9,0);kput('izBronzeD',[p[0],p[1]+.7*s,p[2]],q,[4.2*s,1.4*s,2.6*s],null);}
 {const p=L(0,20.3,0);kput('izBronzeOct',[p[0],p[1],p[2]],q,[1.6*s,2.2*s,1.6*s],null);}{const p=L(0,21.6,0);kput('izBronzeCone',[p[0],p[1],p[2]],q,[1.4*s,3*s,.6*s],null);}
 if(pose===0){const a=L(-3.4,11.5,0);kput('izBronzeCyl',[a[0],a[1],a[2]],q,[.8*s,7*s,.8*s],null);const b=L(3.6,17,1.5);kput('izBronzeCyl',[b[0],b[1],b[2]],q.clone().multiply(qEuler(.4,0,-.6)),[.8*s,7*s,.8*s],null);
  const c=L(5.6,5,3);kput('izBronzeD',[c[0],c[1],c[2]],q,[.4*s,30*s,.4*s],null);const d=L(5.6,35,3);kput('izGlow',[d[0],d[1],d[2]],null,[1.2*s,3*s,1.2*s],null);}
 else if(pose===1){const a=L(0,14.5,2.2);kput('izBronze',[a[0],a[1],a[2]],q.clone().multiply(qEuler(0,0,.25)),[7*s,1.6*s,1.6*s],null);const b=L(0,12.8,2.2);kput('izBronze',[b[0],b[1],b[2]],q.clone().multiply(qEuler(0,0,-.25)),[7*s,1.6*s,1.6*s],null);
  for(const sx of[-1,1]){const w=L(sx*4,10,-2.2);kput('izBronzeD',[w[0],w[1]+8*s,w[2]],q.clone().multiply(qEuler(0,0,sx*.35)),[5*s,16*s,.6*s],null);const w2=L(sx*7.5,10,-2.4);kput('izBronze',[w2[0],w2[1]+5.5*s,w2[2]],q.clone().multiply(qEuler(0,0,sx*.55)),[3*s,11*s,.5*s],null);}}
 else{for(const sx of[-1,1]){const a=L(sx*3,17,1.2);kput('izBronzeCyl',[a[0],a[1],a[2]],q.clone().multiply(qEuler(.35,0,-sx*.45)),[.8*s,8*s,.8*s],null);}const o=L(0,26,3);kput('izGlow',[o[0],o[1],o[2]],null,[2.4*s,2.4*s,2.4*s],null);kput('izBronzeTor',[o[0],o[1],o[2]],q,[3.2*s,3.2*s,3.2*s],null);}
 REG.push({name:'Statue — '+(pose===0?'herald':pose===1?'winged guardian':'orb bearer'),x,y:y-1,z,r:h*.35+2,h:h*2.1+3,cls:'furniture',key:'iziz_statue',tags:{culture:'iziz-old',type:['statue'],place:'outdoor'}});}
// ---- the observation tower (the flared needle), in RUINED colours: rusted steel, dead glass, no beacon ----
function izNeedle(scene,x,z,H){const y=terrainH(x,z);const G=new THREE.Group();G.position.set(x,y,z);scene.add(G);
 kput('izSteel',[x,y,z],null,[3.5,H,3.5],null);for(let k=0;k<3;k++){const t=k*TAU/3;kput('izSteel',[x+7*Math.cos(t),y,z+7*Math.sin(t)],qEuler(Math.sin(t)*.32,0,-Math.cos(t)*.32),[1.3,20,1.3],vC(0x6e6a62));}
 for(let k=1;k<8;k++)kput('ringR',[x,y+k*H/8,z],qEuler(Math.PI/2,0,0),[2.6+1.8*(1-k/8)+.1,2.6+1.8*(1-k/8)+.1,2],null);
 mesh(lathe({rFn:yy=>9+6*yy/3.5,H:3.5,nu:24,nv:2}),MAT.rust,G,0,H+.5,0);mesh(lathe({rFn:()=>15,H:3.6,nu:24,nv:1,hole:holeFn(1,31,null,3)}),MAT.winDead,G,0,H+4.5,0);
 for(let k=0;k<24;k++){const t=k/24*TAU;kput('izSteelBox',[x+15.05*Math.cos(t),y+H+6.3,z+15.05*Math.sin(t)],qEuler(0,-t,0),[.35,3.6,.6],null);}
 mesh(lathe({rFn:yy=>15+1.5*yy/.8,H:.8,nu:24,nv:1}),MAT.rust,G,0,H+6.6,0);kput('ringR',[x,y+H+8.2,z],qEuler(Math.PI/2,0,0),[16.3,16.3,1.2],null);
 for(let k=0;k<32;k++){const t=k/32*TAU;if(rng()<.3)continue;kput('izSteelBox',[x+16.3*Math.cos(t),y+H+7.6,z+16.3*Math.sin(t)],null,[.15,1.2,.15],null);}
 mesh(lathe({rFn:yy=>9-3*yy/3,H:3,nu:16,nv:1}),MAT.rust,G,0,H+7,0);mesh(lathe({rFn:yy=>15.6*Math.sqrt(clamp(1-Math.pow(yy/5.2,2),0,1)),H:5.2,nu:28,nv:7}),MAT.rust,G,0,H+8.4,0);   // the roof dome, whole (Travis), rusted
 kput('izSteel',[x,y+H+14,z],qEuler(.12,0,.08),[.4,10,.4],null);
 for(const sx of[-1.5,1.5])kput('izSteelBox',[x+sx,y+(H+7)/2,z+5.2],null,[.3,H+7,.3],null);kput('izSteelBox',[x,y+H*.35,z+5.2],null,[2.6,3.2,2.4],vC(0x8a7a6a));   // the stalled cabin
 kput('izBoxS',[x,y+1.5,z+7.6],null,[4.6,3,2.4],null);kput('vDarkB',[x,y+1.3,z+8.9],null,[1.8,2.6,.3],null);
 rubbleRing(x,y,z,6,16,26,1.6);vinesOnRing(x,y+H+4,z,15,14,H*.4);scatterMoss(x,y,z,3,14,16,1.2);
 REG.push({name:'Observation tower (ruined)',x,y:y-1,z,r:20,h:H+26,cls:'building',key:'iziz_needle',tags:{culture:'iziz-old',type:['civic'],wealth:'civic',lit:false,state:'ruined'}});}
// ---- the spaceport, RUINED: bunker hub, six pads, fuel farm, control tower stump, broken perimeter, a wrecked freighter ----
function izSpaceport(scene,SP,SPA,y0){const G=new THREE.Group();G.position.set(SP.x,y0,SP.z);scene.add(G);const x=SP.x,z=SP.z;reseed(7777);
 kput('izOctR',[x,y0,z],null,[44,7,44],null);kput('izOctR',[x,y0+7,z],null,[32,5,32],vC(0xb8b0a6));kput('izOctRust',[x,y0+12,z],null,[18,4,18],null);
 mesh(lathe({rFn:yy=>7*Math.sqrt(clamp(1-Math.pow(yy/4,2),0,1)),H:4,nu:20,nv:6,hole:holeFn(1.1,41,null,2.5)}),MAT.concreteR,G,0,16,0);
 for(let i=0;i<8;i++){const t=i/8*TAU+Math.PI/8;kput('vDarkB',[x+18.5*Math.cos(t),y0+2,z+18.5*Math.sin(t)],qEuler(0,-t,0),[4,3,1.2],null);if(rng()<.4)kput('strip',[x+13.6*Math.cos(t),y0+12.2,z+13.6*Math.sin(t)],qEuler(0,-t-Math.PI/2,0),[3,1,1],DEAD);}
 {const ex=-22*Math.cos(SPA),ez=-22*Math.sin(SPA);kput('vDarkB',[x+ex,y0+2.75,z+ez],qEuler(0,Math.PI/2-SPA,0),[10,5.5,3],null);}
 kput('izOctRust',[x+9,y0+12,z-3],qEuler(0,0,.04),[6.5,18,6.5],null);                                          // the control tower, snapped off at 18 m
 kput('izOctRust',[x+28,y0+1.5,z-14],qEuler(Math.PI/2*.92,.4,.3),[6.5,9,6.5],null);kput('vDarkB',[x+28,y0+2.2,z-14],qEuler(Math.PI/2*.92,.4,.3),[6.2,2.4,6.2],null);   // its top, fallen
 for(let i=0;i<6;i++){const t=i/6*TAU+Math.PI/4,px=x+46*Math.cos(t),pz=z+46*Math.sin(t);kput('slabCR',[px,y0+.3,pz],null,[12,.7,12],null);
  if(i%2===0)kput('ringR',[px,y0+.75,pz],qEuler(Math.PI/2,0,0),[11.4,11.4,2],null);for(let k=0;k<4;k++){const a=k/4*TAU+t;if(rng()<.5)kput('izSteelBox',[px+14.5*Math.cos(a),y0+.8,pz+14.5*Math.sin(a)],null,[.7,1.6,.7],null);}
  if(rng()<.5)scatterMoss(px,y0+.7,pz,2,10,12,1.1);
  REG.push({name:'Landing pad '+(i+1)+' (ruined)',x:px,y:y0-1,z:pz,r:15.5,h:8,cls:'building',key:'iziz_spaceport',tags:{culture:'iziz-old',type:['infrastructure'],wealth:'civic',lit:false,state:'ruined'}});}
 {const fa=195*Math.PI/180,fx=x+62*Math.cos(fa),fz=z+62*Math.sin(fa),th=Math.PI/2-fa;kput('boxCR',[fx,y0+.7,fz],qEuler(0,th,0),[34,1.4,22],null);
  for(let i=0;i<6;i++){const lx=-12+(i%3)*12,lz=-5+Math.floor(i/3)*11;const p=loc(fx,fz,lx,lz,th);if(i===2||i===4){kput('vTankR',[p[0]+3,y0+1.4+4.6,p[1]+2],qEuler(Math.PI/2*.95,rng()*.5,0),[4.6,10,4.6],null);}   // two tanks toppled
   else{kput('vTankR',[p[0],y0+1.4,p[1]],null,[4.6,10,4.6],null);kput('vDomeC',[p[0],y0+11.4,p[1]],null,[4.6,2.4,4.6],vC(0x9a8a7a));kput('ringR',[p[0],y0+8.6,p[1]],qEuler(Math.PI/2,0,0),[4.7,4.7,2],null);}}
  REG.push({name:'Fuel farm (ruined)',x:fx,y:y0-1,z:fz,r:20,h:18,cls:'building',key:'iziz_spaceport',tags:{culture:'iziz-old',type:['infrastructure'],wealth:'civic',lit:false,state:'ruined'}});}
 for(let i=0;i<40;i++){const t0=i/40*TAU,t1=(i+1)/40*TAU;if(angDiff((t0+t1)/2,SPA)<.13||angDiff((t0+t1)/2,SPA+Math.PI)<.13)continue;if(rng()<.3)continue;
  const a=[x+88*Math.cos(t0),z+88*Math.sin(t0)],b=[x+88*Math.cos(t1),z+88*Math.sin(t1)];const len=Math.hypot(b[0]-a[0],b[1]-a[1]),ang=Math.atan2(b[1]-a[1],b[0]-a[0]);
  kput('boxCR',[(a[0]+b[0])/2,y0+1.3,(a[1]+b[1])/2],qEuler(0,-ang,0),[len+.5,2.6,1.2],null);if(i%4===0)kput('izSteelBox',[a[0],y0+4.5,a[1]],qEuler(rr(-.1,.1),0,rr(-.1,.1)),[.6,9,.6],null);}
 // the wrecked freighter, nose down in the apron
 {const bx=x+66*Math.cos(15*Math.PI/180),bz=z+66*Math.sin(15*Math.PI/180);const q=qEuler(-.12,.7,.18);kput('izOctRust',[bx,y0+1,bz],q,[20,7,44],null);kput('izOctRust',[bx-3,y0+6,bz-6],q,[12,4,24],null);
  for(const s of[-1,1])kput('izSteelBox',[bx+s*14*Math.cos(.7),y0+3.5,bz-s*14*Math.sin(.7)],q,[14,2.2,22],null);rubbleRing(bx,y0,bz,10,30,40,2.2);scatterMoss(bx,y0,bz,4,26,20,1.4);
  REG.push({name:'Wrecked freighter',x:bx,y:y0-1,z:bz,r:26,h:14,cls:'building',key:'iziz_spaceport',tags:{culture:'iziz-old',type:['infrastructure'],wealth:'civic',lit:false,state:'ruined'}});}
 rubbleRing(x,y0,z,20,60,60,1.8);scatterMoss(x,y0,z,8,84,90,1.6);vinesOnRing(x,y0+7,z,44,20,6);
 REG.push({name:'Spaceport hub (ruined)',x,y:y0-1,z,r:46,h:24,cls:'building',key:'iziz_spaceport',tags:{culture:'iziz-old',type:['infrastructure','civic'],wealth:'civic',lit:false,state:'ruined'}});}
// ---- street furniture of the old set: lamp columns (electric — civic streets), banner poles in orange ----
function izLampColumn(x,z){const y=terrainH(x,z)-.3;kput('vPostS',[x,y,z],null,[.5,6,.5],vC(0xe2b676));kput('izBoxCap',[x,y+6.25,z],null,[1.6,.5,1.6],null);kput('izGlow',[x,y+6.9,z],null,[.5,.5,.5],null);}
