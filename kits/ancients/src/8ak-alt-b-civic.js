// ================================================================= ALT DOMESTIC (2 of 3): amphitheater, fuel station, radar, dish
// Same conventions as 8ak-alt-a-houses.js (decay 0 intact, 1 ruined, 2
// reclaimed, 3 rehabilitated; `brk` = parts have come down; `dd` = old fabric).
//
//   THE GARDEN AMPHITHEATER (adAmph)  a lawn bowl raised in an earth berm, its
//        slope crossed by sinuous concrete seat ribbons, a white bandshell over
//        the stage, and a stepped brick gallery wrapping the north rim with a
//        planter at every terrace edge.
//   THE TRESTLE FUEL STATION (adFuel) a lens-shaped canopy 50 m across held
//        20 m up on three raked wall-legs round a glazed lift core.
//   THE ROTOR RADAR TOWER (adRadar)   fourteen cruciform blocks stacked with a
//        quarter-turn twist between them, a cantilevered T-head carrying the
//        radome and the scanner, in a court of crenellated walls.
//   THE FLOWER DISH (adDish)          four thick concrete petals opening out of
//        a round plinth, cupping a ribbed sphere that carries the dish.

// ---------------------------------------------------------------- helpers
// the lawn gone rank: darker, untextured like MAT.lawn (a textured turf shows
// the concrete map's boards as rings on a polar grid)
MAT.adLawn=new THREE.MeshStandardMaterial({color:0x557a34,roughness:1,metalness:0,side:DS});
MAT.adLawnR=new THREE.MeshStandardMaterial({color:0x3a5626,roughness:1,metalness:0,side:DS});
// A loft through closed rings of equal count [[x,y,z],...], flat-shaded, with
// fan caps on the first and last ring (rings must be convex for the caps).
function adLoft(acc,rings,noCaps){const P=[];const tri=(a,b,c)=>P.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2]);
 for(let k=0;k+1<rings.length;k++){const A=rings[k],B=rings[k+1],n=A.length;
  for(let i=0;i<n;i++){const j=(i+1)%n;tri(A[i],B[i],B[j]);tri(A[i],B[j],A[j]);}}
 if(!noCaps)for(const R of[rings[0],rings[rings.length-1]])for(let i=1;i+1<R.length;i++)tri(R[0],R[i],R[i+1]);
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.computeVertexNormals();adUV(g);
 if(acc)acc.push(g);return g;}
// A solid of revolution through a profile polyline [[r,y],...] (smooth shaded).
function adRev(prof,nu,hole){const L=[0];for(let i=1;i<prof.length;i++)L.push(L[i-1]+Math.hypot(prof[i][0]-prof[i-1][0],prof[i][1]-prof[i-1][1]));
 const T=L[L.length-1];const at=v=>{const s=v*T;let i=1;while(i<L.length-1&&L[i]<s)i++;const t=(s-L[i-1])/((L[i]-L[i-1])||1);
  return[lerp(prof[i-1][0],prof[i][0],t),lerp(prof[i-1][1],prof[i][1],t)];};
 return gridSurface((u,v)=>{const p=at(v),th=u*TAU;return[p[0]*Math.cos(th),p[1],p[0]*Math.sin(th)];},nu,Math.max(4,prof.length*3),
  {uS:prof[0][0]*TAU/8||4,vS:T/8,hole});}
// An inclined slab between a bottom and a top centre-line, each a [x,y,z] with
// a half-width along `side` and a thickness along the other horizontal.
function adLeg(acc,b,t,wb,wt,thk,ang){const c=Math.cos(ang),s=Math.sin(ang),q=[-s,c];   // side dir (perp. to ang)
 const ring=(p,w)=>[[p[0]+q[0]*w+c*thk/2,p[1],p[2]+q[1]*w+s*thk/2],[p[0]-q[0]*w+c*thk/2,p[1],p[2]-q[1]*w+s*thk/2],
  [p[0]-q[0]*w-c*thk/2,p[1],p[2]-q[1]*w-s*thk/2],[p[0]+q[0]*w-c*thk/2,p[1],p[2]+q[1]*w-s*thk/2]];
 return adLoft(acc,[ring(b,wb),ring(t,wt)]);}

// ================================================================= THE GARDEN AMPHITHEATER (adAmph)
// No stepped stone cavea: the audience sits on a LAWN. An earth berm rises in a
// crescent round the north of a stage, its slope crossed by ten sinuous
// concrete seat ribbons that wander across the contours rather than follow
// them. A white bandshell stands behind the stage. Along the north rim a brick
// gallery steps back in three terraces, each edged with a planter whose growth
// hangs over the terrace below. RUIN: the west wing of the gallery has lost its
// two upper terraces down the lawn, the bandshell's east half has fallen onto
// the stage, the ribbons are broken and the bowl is taken by trees.
function buildAltAmphitheater(scene,gx,gz,d){reseed(9865+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0,brk=d===1||d===2,conc=CONC(d),white=SHELL(d);
 REGISTER({name:'The Garden amphitheater ('+AD_STATE[d]+')',x:0,z:-20,r:100,h:28});
 const SZ=30,EX=1.25,RIM=11.9;
 const PT=(a,r)=>[EX*r*Math.cos(a),SZ-r*Math.sin(a)];              // a = pi/2 is due north of the stage
 const wN=a=>{const t=clamp((Math.sin(a)+.1)/.55,0,1);return t*t*(3-2*t);};
 const slope=r=>r<14?0:r<62?(r-14)/48*RIM:r<72?RIM:r<106?RIM*Math.pow(1-(r-72)/34,1.4):0;
 const hf=(a,r)=>.4+slope(r)*wN(a);
 // THE LAWN: one polar height field round the stage
 // it runs out to the berm's foot on the north and only 46 m south of the stage,
 // and its last ring comes down to the ground so it has no lip
 const rMax=a=>lerp(46,106,wN(a));
 mesh(gridSurface((u,v)=>{const a=u*TAU,r=v*rMax(a),p=PT(a,r);return[p[0],v>.97?.02:hf(a,r),p[1]];},96,44),dd?MAT.adLawnR:MAT.adLawn,G);
 const solid=[],brick=[],shell=[],dark=[];
 const hold=holeFn(dd,9865,null,1.5);
 // SEAT RIBBONS: a riser and a tread, on a wobbling radius, base on the lawn
 for(let i=0;i<10;i++){const r0=18+4.4*i,a0=.3+.03*i,a1=Math.PI-.3-.03*i;
  const rad=a=>r0+2.6*Math.sin(3*a+i*.9);
  const gone=(u,v)=>brk&&fbm(u*6+i,v,9866,2)<.38;
  solid.push(gridSurface((u,v)=>{const a=lerp(a0,a1,u),r=rad(a),p=PT(a,r);return[p[0],hf(a,r)+v*.55-.15,p[1]];},64,1,{uS:r0*2.6/8,vS:.1,hole:gone}));
  solid.push(gridSurface((u,v)=>{const a=lerp(a0,a1,u),r=rad(a)+v*.5,p=PT(a,r);return[p[0],hf(a,rad(a))+.4,p[1]];},64,1,{uS:r0*2.6/8,vS:.1,hole:gone}));}
 // THE STAGE and THE BANDSHELL (a stretched quarter-sphere opening north)
 kput(dd?'slabCR':'slabC',[0,.55,SZ],null,[14,.5,12],null);
 const BC=[0,.6,SZ+4],BR=13;
 const shellGone=(u,v)=>brk&&u<.5&&v>.25+.2*fbm(u*8,1,9867,2);
 shell.push(gridSurface((u,v)=>{const al=u*Math.PI,ph=v*Math.PI/2;return[BC[0]+1.3*BR*Math.cos(ph)*Math.cos(al),BC[1]+BR*Math.sin(ph),BC[2]+BR*Math.cos(ph)*Math.sin(al)];},28,10,
  {uS:6,vS:3,hole:(u,v)=>shellGone(u,v)||(hold&&hold(u,v*12))}));
 for(let k=1;k<8;k++){const al=k/8*Math.PI;if(brk&&k<4)continue;
  for(let j=0;j<4;j++){const p0=j/4*Math.PI/2,p1=(j+1)/4*Math.PI/2,P=ph=>[BC[0]+1.3*(BR+.3)*Math.cos(ph)*Math.cos(al),BC[1]+(BR+.3)*Math.sin(ph),BC[2]+(BR+.3)*Math.cos(ph)*Math.sin(al)];
   beam(dd?'strutR':'strutW',P(p0),P(p1),.5,.7);}}
 if(brk){const m=mesh(gridSurface((u,v)=>{const al=u*Math.PI*.5,ph=(.3+v*.7)*Math.PI/2;return[1.3*BR*Math.cos(ph)*Math.cos(al),BR*Math.sin(ph),BR*Math.cos(ph)*Math.sin(al)];},12,6,{uS:3,vS:2}),white,G);
  m.position.set(8,0,SZ-2);m.rotation.set(.9,.4,.5);dropFragment(m,.8,.2);}
 // THE GALLERY: three brick terraces stepping back along the north rim
 const GA0=.36,GA1=Math.PI-.36,RB=90,TY=k=>RIM+4.2*k;
 const fallW=(a,k)=>brk&&k>=1&&a>2.05+.12*(fbm(a*5,k,9868,2)-.5)*2;   // the west wing's upper terraces
 for(let k=0;k<3;k++){const rf=68+6*k,rn=k<2?68+6*(k+1):RB,y0=TY(k),y1=TY(k+1);
  const win=(u,y)=>{const fu=u*48%1,fy=(y-y0)/(y1-y0);return fu>.3&&fu<.72&&fy>.28&&fy<.78;};
  brick.push(gridSurface((u,v)=>{const a=lerp(GA0,GA1,u),p=PT(a,rf);return[p[0],lerp(y0,y1,v),p[1]];},48*4,8,
   {uS:rf*2.4/8,vS:.6,hole:(u,v)=>win(u,lerp(y0,y1,v))||fallW(lerp(GA0,GA1,u),k)||(hold&&hold(u,v*4+k*9))}));
  dark.push(gridSurface((u,v)=>{const a=lerp(GA0,GA1,u),p=PT(a,rf+1.6);return[p[0],lerp(y0,y1,v),p[1]];},64,1,{hole:u=>fallW(lerp(GA0,GA1,u),k)}));
  solid.push(gridSurface((u,v)=>{const a=lerp(GA0,GA1,u),p=PT(a,lerp(rf,rn,v));return[p[0],y1,p[1]];},96,2,
   {uS:rf*2.4/8,vS:(rn-rf)/8,hole:u=>fallW(lerp(GA0,GA1,u),k)||(k<2&&fallW(lerp(GA0,GA1,u),k+1)&&false)}));
  // a planter at every terrace edge, its growth hanging over the facade below
  for(let i=0;i<46;i++){const a=lerp(GA0,GA1,(i+.5)/46);if(fallW(a,k))continue;const p=PT(a,rf+.9),q=qFacing([Math.cos(a)*EX,0,-Math.sin(a)]);
   kput('planter',[p[0],y1+.45,p[1]],q,[EX*rf*(GA1-GA0)/46*.95,.9,1.2],new THREE.Color(dd?0x6a5a4a:0xb08a6a));
   kput('moss',[p[0],y1+1,p[1]],qEuler(0,rng()*3,0),[2.2,.8,1],new THREE.Color().setHSL(rr(.24,.32),.5,dd?.16:.3));
   if(i%2)kput('vine',[PT(a,rf-.1)[0],y1+.6,PT(a,rf-.1)[1]],null,[1.6,rr(1.5,y1-y0-.4),1.6],null);}}
 // the back wall and the two end walls close the gallery
 brick.push(gridSurface((u,v)=>{const a=lerp(GA0,GA1,u),p=PT(a,RB);return[p[0],v*TY(3),p[1]];},64*3,10,
  {uS:RB*2.4/8,vS:TY(3)/8,hole:(u,v)=>{const y=v*TY(3);return(fallW(lerp(GA0,GA1,u),1)&&y>TY(1)+.2)||(u*64%1>.35&&u*64%1<.65&&(y%4.2)>1.6&&(y%4.2)<3.2&&y>2)||(hold&&hold(u,y));}}));
 for(const a of[GA0,GA1])brick.push(gridSurface((u,v)=>{const p=PT(a,lerp(66,RB,u));return[p[0],v*(a>2&&brk?TY(1):TY(3)),p[1]];},8,6,{uS:3,vS:3}));
 meshMerged(solid,conc,G);meshMerged(brick,MAT.brick,G);meshMerged(shell,white,G);meshMerged(dark,MAT.dark,G);
 if(brk){// the fallen terraces lie down the lawn
  for(let i=0;i<70;i++){const a=rr(2.1,GA1),r=rr(50,70),p=PT(a,r),s=rr(.6,2.2);
   kput('rubble',[p[0],hf(a,r)+s*.3,p[1]],qEuler(rng()*3,rng()*3,rng()*3),[s*1.4,s*.7,s],new THREE.Color().setHSL(.04,.35,rr(.3,.45)));}
  for(let i=0;i<8;i++){const a=rr(2.15,2.7),r=rr(56,66),p=PT(a,r);kput('brick',[p[0],hf(a,r)+.6,p[1]],qEuler(rr(-.4,.4),rng()*3,rr(-.3,.3)),[rr(4,9),1.2,rr(2,4)],null);}}
 if(dd){mossOnSurface(G,0,0,0,60,1.4);stainsFromLedge(G,0,0,0,30,5,0,SZ);}
 if(brk){for(let i=0;i<biomeN(26);i++){const a=rr(.3,Math.PI-.3),r=rr(16,64),p=PT(a,r);VEG.tree(p[0],hf(a,r),p[1],i%3,rr(6,13));}}
 if(d===2){
  // a market on the stage, gardens on the terraces, crops on the forecourt
  for(let i=0;i<6;i++){const x=-10+i*4,z=SZ+rr(-4,4);kput('shantyRoof',[x,3.2,z],qEuler(rr(-.1,.1),rr(-.2,.2),0),[3.6,1,3],new THREE.Color().setHSL(rng(),.4,.6));
   for(const s of[-1,1])kput('plank',[x+s*1.6,1.9,z],null,[.15,2.6,.15],null);}
  for(let i=0;i<9;i++)kput('planter',[-40+i*10,.35,SZ+30],null,[7,.6,9],null);
  for(let i=0;i<40;i++)kput('moss',[rr(-44,48),.8,SZ+30+rr(-4,4)],null,[.8,.5,.8],new THREE.Color().setHSL(rr(.22,.32),.55,.32));
  const fires=[];for(let k=0;k<3;k++)for(let i=0;i<48;i++){const a=lerp(GA0,GA1,(i+.5)/48);if(fallW(a,k)||rng()>.16)continue;const p=PT(a,68+6*k+.2);
   fires.push([p[0],TY(k)+2.2,p[1],-Math.cos(a),Math.sin(a),1.6,1.6]);}
  adReclaim(G,{up:50,fires,figs:22,spread:30,cz:SZ,ok:p=>p[1]>RIM+1&&Math.abs((p[1]-RIM)%4.2)<.1});}
 if(d===0||d===3)figures(0,SZ+22,16,24);
 KOFF=[0,0,0];return G;}

// ================================================================= THE TRESTLE FUEL STATION (adFuel)
// A lens 50 m across — flat soffit, rolled rim with a band of round windows, a
// low dome — held 19 m up on three raked wall-legs that land 34 m out, round a
// glazed lift core. Eight pumps stand in a ring under it; a glass kiosk wraps
// the foot of the core; two capsule tanks lie on cradles to the north.
// RUIN: the south-east leg has buckled at a third of its height; the lens has
// swung down on that side about the line of the other two leg heads and lies
// tilted, its low rim down on the broken leg; the core is a stump.
function buildAltFuelStation(scene,gx,gz,d){reseed(9870+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0,brk=d===1||d===2,conc=CONC(d),skin=SHELL(d);
 REGISTER({name:'The Trestle fuel station ('+AD_STATE[d]+')',x:0,z:0,r:40,h:26});
 const CY=19,RD=25,A0=.75,legA=i=>A0+i*TAU/3,LT=i=>[17*Math.cos(legA(i)),CY-.4,17*Math.sin(legA(i))],LB=i=>[34*Math.cos(legA(i)),0,34*Math.sin(legA(i))];
 kput(dd?'slabCR':'slabC',[0,.15,0],null,[42,.3,42],null);
 // LEGS (leg 0 is the one that buckles)
 const solid=[];
 for(let i=0;i<3;i++){const b=LB(i),t=LT(i);
  if(brk&&i===0){const m=[lerp(b[0],t[0],.34),lerp(b[1],t[1],.34)+.6,lerp(b[2],t[2],.34)];adLeg(solid,b,m,4,3.4,1.6,legA(i));
   const g=adLeg(null,m,t,3.4,1.8,1.6,legA(i));g.translate(-m[0],-m[1],-m[2]);const fm=mesh(g,MAT.concreteR,G);
   fm.position.set(b[0]*1.15,0,b[2]*1.15+6);fm.rotation.set(1.2,legA(i)+.4,.3);dropFragment(fm,0,.4);}
  else adLeg(solid,b,t,4,1.8,1.6,legA(i));}
 // THE CORE: concrete shaft in a glass drum (a broken stump in the ruin)
 const coreH=brk?9:CY-.6;
 solid.push(lathe({rFn:()=>2.6,H:coreH,nu:20,nv:3,cut:brk?coreH:null,jag:brk?1.6:0,seed:9871}));
 if(d===0)mesh(lathe({rFn:()=>3.4,H:CY-.6,nu:24,nv:1}),MAT.glass,G);
 // the kiosk: a low glass drum round the core's foot
 if(!brk){mesh(lathe({rFn:()=>8,H:3.6,nu:32,nv:1}),d===0?MAT.glass:MAT.dark,G);kput(dd?'slabCR':'slabC',[0,3.75,0],null,[8.6,.3,8.6],null);}
 else{solid.push(lathe({rFn:()=>8,H:1,nu:32,nv:1}));kput('shantyBox',[0,1.3,0],qEuler(0,.3,0),[9,2.6,6],null);}
 // THE LENS, in a group that swings about the two good leg heads in the ruin
 const D=new THREE.Group();G.add(D);
 if(brk){const t1=LT(1),t2=LT(2),M=new THREE.Vector3((t1[0]+t2[0])/2,(t1[1]+t2[1])/2,(t1[2]+t2[2])/2);
  const ax=new THREE.Vector3(t2[0]-t1[0],0,t2[2]-t1[2]).normalize();
  const tilt=s=>{const q=new THREE.Quaternion().setFromAxisAngle(ax,s*.45);const rim=new THREE.Vector3(RD*Math.cos(legA(0)),CY,RD*Math.sin(legA(0))).sub(M).applyQuaternion(q).add(M);return{q,y:rim.y};};
  const T=tilt(1).y<tilt(-1).y?tilt(1):tilt(-1);D.quaternion.copy(T.q);D.position.copy(M.clone().sub(M.clone().applyQuaternion(T.q)));}
 D.updateMatrix();
 const hold=holeFn(dd,9872,null,1.6);
 const lens=[adRev([[0,CY-.6],[23,CY-.8],[RD,CY+.6],[RD-.6,CY+2.3],[12,CY+3.7],[0,CY+4.2]],96,hold?(u,v)=>v>.55&&hold(u,v*20):null)];
 meshMerged(lens,skin,D);
 useGroupXF(D);
 for(let i=0;i<40;i++){const a=i/40*TAU;kput(d===0?'ovalI':'ovalD',[(RD+.1)*Math.cos(a),CY+.6,(RD+.1)*Math.sin(a)],qFacing([Math.cos(a),0,Math.sin(a)]),[.7,.7,1],null);}
 for(let i=0;i<24;i++){const a=(i+.5)/24*TAU;kput('strip',[21*Math.cos(a),CY-1.05,21*Math.sin(a)],qEuler(0,-a+Math.PI/2,0),[5,1,1],d===0||(d===3&&i%3)?CYAN:DEAD);}
 // a railing round the dome's shoulder
 for(let i=0;i<36;i++){const a=i/36*TAU;kput(dd?'strutR':'strutW',[18*Math.cos(a),CY+3.6,18*Math.sin(a)],null,[.12,1.2,.12],null);}
 endGroupXF();
 // PUMPS in a ring under the lens
 for(let i=0;i<8;i++){const a=(i+.5)/8*TAU,x=12*Math.cos(a),z=12*Math.sin(a),q=qEuler(0,-a,0);if(brk&&i===0)continue;
  kput(dd?'boxCR':'boxC',[x,.4,z],q,[2.6,.5,6.5],null);
  kput(dd?'boxR':'boxW',[x,1.75,z],q,[1,2.4,1.4],null);kput('boxD',[x,2.4,z+.0],q,[1.05,.7,1],null);
  kput('tube',[x+.6*Math.cos(a+1.57),1.5,z+.6*Math.sin(a+1.57)],qEuler(.5,0,0),[.12,2.2,.12],null);}
 // TANKS: two capsules on cradles to the north, a pipe to the core
 for(const x of[-14,6]){const R=4,L=20;
  const g=lathe({rFn:y=>y<R?Math.sqrt(Math.max(0,R*R-(R-y)*(R-y)))+.01:y>L-R?Math.sqrt(Math.max(0,R*R-(y-L+R)*(y-L+R)))+.01:R,H:L,nu:24,nv:14,hole:holeFn(dd,9873+x,null,2)});
  g.rotateZ(-Math.PI/2);g.translate(x,R+1.4,-44);mesh(g,skin,G);
  for(const k of[3,10,17])kput(dd?'boxCR':'boxC',[x+k,.9,-44],null,[1.2,1.8,6.5],null);}
 kput(dd?'pipeR':'pipe',[0,1.2,-22],qEuler(Math.PI/2,0,0),[.5,40,.5],null);
 meshMerged(solid,conc,G);
 if(brk){adRubbleArc(0,0,legA(0)-.35,legA(0)+.35,()=>30,12,40,1.6);adRubbleArc(0,0,0,TAU,()=>4,6,20,1.1);}
 if(dd){mossOnSurface(G,0,0,0,40,1.2);vinesFromLedge(G,0,0,0,20,10,0,0);}
 if(d===1){scatterMoss(0,0,0,10,44,40,1.6);trees(0,0,40,60,9);}
 if(d===2){
  // a caravanserai under the fallen lens: tarps hung from its low rim as walls,
  // the tanks fitted out as houses, a garden on the forecourt
  for(let i=-2;i<=2;i++){const a=legA(0)+i*.22,p=new THREE.Vector3(22*Math.cos(a),CY,22*Math.sin(a)).applyMatrix4(D.matrix);
   kput('patchTarp',[p.x,p.y/2,p.z],qFacing([Math.cos(a),0,Math.sin(a)]),[7,p.y-.5,1],new THREE.Color().setHSL(rr(0,.12),.45,.62));}
  for(let i=0;i<5;i++){const a=legA(0)+Math.PI+rr(-.8,.8),r=rr(8,16);kput('shantyBox',[r*Math.cos(a),1.4,r*Math.sin(a)],qEuler(0,rng()*3,0),[rr(3,5),2.8,rr(3,4)],null);}
  for(const x of[-14,6]){kput('boxD',[x+10,2.6,-39.9],null,[1.6,2.6,.3],null);kput('spipe',[x+14,10,-44],null,[.3,2.6,.3],null);}
  for(let i=0;i<6;i++)kput('planter',[-24+i*4.2,.35,30],null,[3.2,.6,7],null);
  adReclaim(G,{up:20,fires:[[-14,6,-39.6,0,1,1.2,1.4],[6,6,-39.6,0,1,1.2,1.4]],trees:[42,62,10],figs:10,spread:18,minY:.2,
   ok:p=>Math.hypot(p[0],p[2])<18||p[1]>4});
  firePit('adReclaim',4,.3,10,1.2);}
 if(d===0||d===3)figures(0,22,5,8);
 KOFF=[0,0,0];return G;}

// ================================================================= THE ROTOR RADAR TOWER (adRadar)
// Fourteen cruciform blocks, each 3.4 m high with a dark half-metre joint over
// a round core, each turned 15 degrees on the one below, so the shaft reads as
// a slow screw of fins. At 56 m a T-head: a narrow neck, a broad cantilevered
// deck with a crenellated parapet, the radome and the scanner bar on its mast.
// It stands in a 64 m court whose walls are built of blocks of unequal height.
// RUIN: the head and the top four blocks have come down into the court — the
// head on its side, the radome split — and the two highest blocks left standing
// have slewed on their joints. The court wall is breached on the east.
function buildAltRadar(scene,gx,gz,d){reseed(9875+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0,brk=d===1||d===2,conc=CONC(d),skin=SHELL(d);
 REGISTER({name:'The Rotor radar tower ('+AD_STATE[d]+')',x:0,z:0,r:36,h:70});
 const NT=14,TH=3.4,GP=.5,Y0=1.4,yK=k=>Y0+k*(TH+GP),YH=yK(NT),NK=brk?10:NT;
 const plus=(L,h,rot)=>[[L,-h],[L,h],[h,h],[h,L],[-h,L],[-h,h],[-L,h],[-L,-h],[-h,-h],[-h,-L],[h,-L],[h,-h]].map(p=>[p[0]*Math.cos(rot)-p[1]*Math.sin(rot),p[0]*Math.sin(rot)+p[1]*Math.cos(rot)]);
 const solid=[],block=k=>{const L=6.6+.9*Math.sin(k*.9),h=1.25+.2*Math.cos(k*1.3);return adPrism(null,plus(L,h,k*Math.PI/12),0,TH);};
 kput(dd?'boxCR':'boxC',[0,.7,0],qEuler(0,0,0),[18,1.4,18],null);
 solid.push(lathe({rFn:()=>2.3,H:brk?yK(NK)+1:YH,nu:16,nv:2}));
 for(let k=0;k<NK;k++){const g=block(k);let ry=0,dx=0,dz=0;
  if(brk&&k>=NK-2){ry=rr(.15,.35)*(k-NK+3);dx=rr(-.8,.8);dz=rr(-.8,.8);}
  g.rotateY(ry);g.translate(dx,yK(k),dz);solid.push(g);}
 // THE HEAD (built at the origin, then placed: on the shaft, or on its side in the court)
 const head=[];adBox(head,0,2,0,7,4,7);adBox(head,0,6.2,0,17,4.4,17);
 for(let i=0;i<8;i++)for(const s of[-1,1]){adBox(head,-7.5+i*2.15,9.2,s*8.2,1.1,1.6,.6);adBox(head,s*8.2,9.2,-7.5+i*2.15,.6,1.6,1.1);}
 const dome=gridSurface((u,v)=>{const th=u*TAU,ph=v*Math.PI*.62;return[4.8*Math.sin(ph)*Math.cos(th),8.4+4.8-4.8*Math.cos(ph)+0,4.8*Math.sin(ph)*Math.sin(th)];},24,10,
  {uS:4,vS:2,hole:brk?(u,v)=>u<.38&&v>.3:null});
 if(!brk){head.forEach(g=>g.translate(0,YH,0));solid.push(...head);dome.translate(0,YH,0);mesh(dome,skin,G);
  // the scanner bar on its mast, and an aviation light
  kput(dd?'pipeR':'pipe',[0,YH+15,0],null,[.5,4,.5],null);
  kput(dd?'boxR':'boxW',[0,YH+17.4,0],qEuler(0,.6,0),[14,2.2,.7],null);kput('boxD',[0,YH+17.4,.4],qEuler(0,.6,0),[13,1.6,.2],null);
  kput('dot',[0,YH+19,0],null,[.6,.6,.6],d===0?new THREE.Color(0xff5040):DEAD);
  for(let i=0;i<16;i++){const a=i/16*TAU;kput('strip',[8.6*Math.cos(a),YH+6.4,8.6*Math.sin(a)],qEuler(0,-a+Math.PI/2,0),[3,1,1],d===0||(d===3&&i%2)?CYAN:DEAD);}}
 else{const M=new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(.2,.5,2.7)).setPosition(18,9.5,13);head.forEach(g=>g.applyMatrix4(M));solid.push(...head);
  const dm=mesh(dome,skin,G);dm.position.set(-14,0,15);dm.rotation.set(.3,1,2.3);dropFragment(dm,0,1.2);
  // the fallen blocks, scattered where they landed
  for(let k=NK;k<NT;k++){const g=block(k);g.translate(0,-TH/2,0);g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rr(-1.4,1.4),rng()*3,rr(-.4,.4))).setPosition(rr(-22,22),3,rr(4,24)*(k%2?1:-1)));solid.push(g);}
  kput('boxR',[-8,1,24],qEuler(.2,.6,1.4),[14,2.2,.7],null);}
 // THE COURT: walls of unequal blocks with a gate to the south (a breach to the east in the ruin)
 for(let s=0;s<4;s++)for(let i=0;i<16;i++){const t=-30+i*4;const gate=s===0&&(i===7||i===8),breach=brk&&s===1&&i>=6&&i<=10;if(gate)continue;
  const h=breach?rr(.5,1.5):[2.6,4.2,3.2,5.6,2.4,4.8][(i*7+s*3)%6],x=[t,32,t,-32][s],z=[32,t,-32,t][s],w=[4,1.4,4,1.4][s],dp=[1.4,4,1.4,4][s];
  adBox(solid,x,h/2,z,w*.98,h,dp*.98);}
 if(brk)adRubbleLine([32,-8],[32,10],1,0,10,40,1.5);
 meshMerged(solid,conc,G);
 if(brk){adRubbleArc(0,0,0,TAU,()=>7,18,60,1.6);}
 if(dd){mossOnSurface(G,0,0,0,40,1.1);vinesFromLedge(G,0,0,0,26,9,0,0);}
 if(d===1){scatterMoss(0,0,0,8,30,40,1.6);trees(0,0,10,28,8);}
 if(d===2){
  // a lookout: a timber stage on the stump, a ladder up the shaft, a beacon fire
  const top=yK(NK)+.2;
  kput('plank',[0,top+.3,0],qEuler(0,.3,0),[12,.4,12],null);
  for(let i=0;i<4;i++){const a=.3+i*Math.PI/2;kput('plank',[6*Math.cos(a),top+1.4,6*Math.sin(a)],qEuler(0,-a,0),[.3,2.2,8],null);}
  beam('plank',[2.6,0,7.4],[2.6,top,7.4],.25,.25);beam('plank',[3.6,0,7.4],[3.6,top,7.4],.25,.25);
  for(let y=1;y<top;y+=1.2)kput('plank',[3.1,y,7.4],null,[1.2,.12,.12],null);
  firePit('adReclaim',0,top+.5,0,1.8);
  for(let i=0;i<3;i++)kput('patchTarp',[5.5,top+5+i*1.4,0],qEuler(0,0,0),[2.4,1.2,1],new THREE.Color().setHSL(i*.3,.6,.5));
  kput('plank',[5.5,top+4,0],null,[.15,8,.15],null);
  // houses against the inside of the court wall, gardens in the court
  for(let i=0;i<9;i++){const s=i%3,t=rr(-24,24),x=[t,28,t][s],z=[-28,t,28][s];if(s===2&&Math.abs(t)<6)continue;
   kput('shantyBox',[x,1.5,z],null,[s===1?3.4:5,3,s===1?5:3.4],null);kput('shantyRoof',[x,3.2,z],qEuler(.12,0,0),[s===1?4.4:6,1,s===1?6:4.4],null);}
  for(let i=0;i<6;i++)kput('planter',[-20+i*8,.35,-14],null,[6,.6,4],null);
  adReclaim(G,{up:16,trees:[34,56,10],figs:8,spread:20,minY:.2,ok:p=>p[1]<4&&Math.hypot(p[0],p[2])>12});}
 if(d===0||d===3)figures(0,20,4,8);
 KOFF=[0,0,0];return G;}

// ================================================================= THE FLOWER DISH (adDish)
// Four thick concrete petals open out of a round plinth like a flower, each
// 1.4 m thick, cupped across its width and leaning out to 20 m at its tip. In
// the middle a stem carries a ribbed sphere, and the sphere carries the dish:
// a white paraboloid 38 m across, tipped 25 degrees to the south, its feed horn
// on four struts. A long low wall curves round the north of the plinth.
// RUIN: the south-east petal has snapped at mid-height; the dish has torn off
// the sphere and lies on its rim against two petals, half its panels gone; the
// sphere is holed. RECLAIMED: the fallen dish is a roof — rain pools in it and
// a settlement lives in the shade under its lifted rim.
function buildAltDish(scene,gx,gz,d){reseed(9880+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0,brk=d===1||d===2,conc=CONC(d),skin=SHELL(d);
 REGISTER({name:'The Flower dish ('+AD_STATE[d]+')',x:0,z:0,r:44,h:50});
 kput(dd?'slabCR':'slabC',[0,.75,0],null,[24,1.5,24],null);
 const solid=[],hold=holeFn(dd,9880,null,1.8);
 // PETALS: a cupped blade of two skins and an edge band
 const PH=38,THK=1.4;
 const petal=(a,v0,v1)=>{const c=Math.cos(a),s=Math.sin(a),out=[];
  const pt=(u,v,o)=>{const sw=u*2-1,R=5+15*Math.pow(v,1.7),y=1.5+PH*v,w=7*Math.pow(Math.sin(Math.PI*(.08+.92*v)),.7)*(1-.25*v)+.6;
   const r=R-2.2*sw*sw*w/7+o;return[r*c-s*sw*w,y,r*s+c*sw*w];};
  const V=v=>lerp(v0,v1,v);
  for(const o of[0,THK])out.push(gridSurface((u,v)=>pt(u,V(v),o),10,16,{uS:2,vS:(v1-v0)*PH/8}));
  out.push(gridSurface((u,v)=>{const e=u<.5?0:1,t=u<.5?u*2:(u-.5)*2;return pt(e,V(v),t*THK);},2,16,{uS:.4,vS:(v1-v0)*PH/8}));
  out.push(gridSurface((u,v)=>pt(u,V(1),v*THK),10,1));
  return out;};
 for(let i=0;i<4;i++){const a=Math.PI/4+i*Math.PI/2;
  if(brk&&i===0){solid.push(...petal(a,0,.46));const fr=petal(a,.46,1);const m=meshMerged(fr.map(g=>adUV(g)),MAT.concreteR,G);
   m.position.set(26,0,22);m.rotation.set(1.3,.4,.2);dropFragment(m,0,.5);}
  else solid.push(...petal(a,0,1));}
 // THE STEM AND THE SPHERE
 solid.push(lathe({rFn:y=>2.4+1.2*Math.pow(1-y/20,2),H:20,nu:16,nv:3}));
 const SY=26,SR=7;
 mesh(gridSurface((u,v)=>{const th=u*TAU,ph=v*Math.PI;return[SR*Math.sin(ph)*Math.cos(th),SY-SR*Math.cos(ph),SR*Math.sin(ph)*Math.sin(th)];},28,14,
  {uS:6,vS:3,hole:brk?(u,v)=>fbm(u*5,v*4,9881,2)<.4:null}),skin,G);
 for(let k=0;k<12;k++){const th=k/12*TAU;for(let j=0;j<6;j++){const p0=j/6*Math.PI,p1=(j+1)/6*Math.PI,P=ph=>[(SR+.25)*Math.sin(ph)*Math.cos(th),SY-(SR+.25)*Math.cos(ph),(SR+.25)*Math.sin(ph)*Math.sin(th)];
  beam(dd?'strutR':'strutW',P(p0),P(p1),.35,.5);}}
 for(const ph of[Math.PI/3,Math.PI/2,2*Math.PI/3])kput(dd?'ringR':'ringW',[0,SY-SR*Math.cos(ph),0],qEuler(Math.PI/2,0,0),(SR+.25)*Math.sin(ph),null);
 // THE DISH, in its own group: on the sphere and tipped south, or fallen
 const DR=19,F=11,Dg=new THREE.Group();G.add(Dg);
 if(!brk){Dg.position.set(0,SY+SR-.5,0);Dg.rotation.x=.44;}
 else if(d===1){Dg.position.set(-12,0,24);Dg.rotation.set(1.25,-.5,.15);}   // on its rim against two petals
 else{Dg.position.set(-6,0,34);Dg.rotation.set(.3,0,.1);}                  // bowl-up, its rim propped on the snapped petal
 const dishHole=d===1?(u,v)=>v>.35&&fbm(u*6,v*3,9882,2)<.45:d===2?(u,v)=>v>.55&&fbm(u*6,v*3,9882,2)<.4:(hold?(u,v)=>v>.5&&hold(u,v*10):null);
 mesh(gridSurface((u,v)=>{const th=u*TAU,r=v*DR;return[r*Math.cos(th),r*r/(4*F),r*Math.sin(th)];},48,10,{uS:12,vS:3,hole:dishHole}),skin,Dg);
 // the fallen dish is placed BEFORE its ribs are, so the instanced ribs follow it
 if(brk)dropFragment(Dg,0,.6);
 Dg.updateMatrix();
 if(d===2){// rain pooled in the fallen bowl (level, whatever the bowl's tilt)
  const p=new THREE.Vector3(0,2.1,0).applyMatrix4(Dg.matrix);
  mesh(gridSurface((u,v)=>{const th=u*TAU,r=v*7;return[p.x+r*Math.cos(th),p.y,p.z+r*Math.sin(th)];},24,2),MAT.water,G);}
 useGroupXF(Dg);
 for(let k=0;k<16;k++){const th=k/16*TAU;if(brk&&k%3===0)continue;
  for(let j=0;j<4;j++){const r0=j/4*DR,r1=(j+1)/4*DR;beam(dd?'strutR':'strutW',[r0*Math.cos(th),r0*r0/(4*F)-.5,r0*Math.sin(th)],[r1*Math.cos(th),r1*r1/(4*F)-.5,r1*Math.sin(th)],.4,.6);}}
 // the rim: a ring of straight members (a kit torus this big would be 1.7 m thick)
 for(let k=0;k<24;k++){const a0=k/24*TAU,a1=(k+1)/24*TAU,y=DR*DR/(4*F);if(d===1&&k%5===0)continue;
  beam(dd?'strutR':'strutW',[DR*Math.cos(a0),y,DR*Math.sin(a0)],[DR*Math.cos(a1),y,DR*Math.sin(a1)],.6,.9);}
 if(!brk){for(let k=0;k<4;k++){const th=k/4*TAU+.4;beam(dd?'strutR':'strutW',[17*Math.cos(th),17*17/(4*F),17*Math.sin(th)],[0,F,0],.35,.35);}
  kput(dd?'boxR':'boxW',[0,F+.8,0],null,[2.2,2.6,2.2],null);kput(dd?'pipeR':'pipe',[0,F-.9,0],null,[.9,1.4,.9],null);}
 endGroupXF();
 // THE NORTH WALL: long, low, curving
 solid.push(gridSurface((u,v)=>{const a=lerp(Math.PI*1.12,Math.PI*1.88,u);return[40*Math.cos(a),v*4.2,40*Math.sin(a)];},40,2,{uS:10,vS:.5,hole:(u,v)=>brk&&u>.6&&u<.7}));
 solid.push(gridSurface((u,v)=>{const a=lerp(Math.PI*1.12,Math.PI*1.88,u),r=40+v*1.4;return[r*Math.cos(a),4.2,r*Math.sin(a)];},40,1,{hole:u=>brk&&u>.6&&u<.7}));
 solid.push(gridSurface((u,v)=>{const a=lerp(Math.PI*1.12,Math.PI*1.88,u);return[41.4*Math.cos(a),v*4.2,41.4*Math.sin(a)];},40,2,{uS:10,vS:.5,hole:(u,v)=>brk&&u>.6&&u<.7}));
 meshMerged(solid.map(g=>g.attributes.uv?g:adUV(g)),conc,G);
 if(brk){adRubbleArc(0,0,.4,1.2,()=>14,16,40,1.5);adRubbleArc(0,0,0,TAU,()=>3,8,20,1);}
 if(dd){mossOnSurface(G,0,0,0,40,1.2);vinesFromLedge(G,0,0,0,24,9,0,0);}
 if(d===1){scatterMoss(0,0,0,8,40,40,1.6);trees(0,0,46,64,10);}
 if(d===2){
  // a settlement under the fallen dish's lifted rim and round the plinth
  for(let i=0;i<7;i++){const a=rr(1.4,2.6),r=rr(16,30);kput('shantyBox',[r*Math.cos(a),1.5,r*Math.sin(a)],qEuler(0,rng()*3,0),[rr(3,5),3,rr(3,4.5)],null);
   kput('shantyRoof',[r*Math.cos(a),3.2,r*Math.sin(a)],qEuler(.12,rng()*3,0),[5.5,1,5],null);}
  for(let i=0;i<5;i++)kput('planter',[-16+i*7,1.85,-16],null,[5,.7,4],null);
  kput('boxD',[0,22,5.8],null,[2,3,.4],null);
  beam('plank',[0,1.5,9.5],[0,20.6,6.1],.3,1.6);
  adReclaim(G,{up:24,fires:[[0,22,5.9,0,1,1.6,2.4]],trees:[46,64,12],figs:12,spread:22,minY:1.4,ok:p=>p[1]<2.2});}
 if(d===0||d===3)figures(0,30,4,8);
 KOFF=[0,0,0];return G;}
