// ================================================================= ALTERNATE HOTEL — THE ATTRACTION
// A hotel as a cluster of thirteen fluted parabolic spires on one arcaded
// podium: a 206 m central spire ringed by balconies under a six-point star,
// four 128 m spires fused to its foot at the diagonals and eight 66 m turrets
// between them. Rooms in the flute troughs, one arched window to a trough, so
// the spires read as ribbed cones of light. (arco2 #47 Gaudi's unbuilt Hotel
// Attraction, the parabolic spire cluster; #43 the Craglorn tower's stacked
// balconied stages; arco1 #6 the hotel slab's sawtooth fins.)
// Ruin: the central spire is snapped at 60% and its upper third lies across the
// plain to the east; one great spire and two turrets are broken; balconies have
// dropped; the arcade is holed and part-fallen. Reclaimed: shacks along the
// surviving balconies, rope bridges between the spires, a market in the arcade.
function buildAltHotel(scene,gx,gz,d){reseed(9825+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0,brk=d===1||d===2,rec=d===2,skin=SHELL(d);
 const PH=14,RP=74,rP=th=>RP*se(th,5);
 REGISTER({name:'The Attraction — hotel ('+ALT_STATE[d]+')',x:0,z:0,r:RP+8,h:PH+230});
 // the spires: x, z, height, base radius, flutes, cut (ruin), registered name
 const SP=[[0,0,206,27,20,brk?124:null,'central spire']];
 for(let k=0;k<4;k++){const a=k/4*TAU+Math.PI/4;SP.push([34*Math.cos(a),34*Math.sin(a),128,14.5,12,brk&&k===1?70:null,'great spire']);}
 for(let k=0;k<8;k++){const a=k/8*TAU+Math.PI/8;SP.push([55*Math.cos(a),55*Math.sin(a),66,8,8,brk&&(k===2||k===5)?(k===2?30:44):null,'turret']);}
 const prof=(H,R0)=>y=>R0*Math.pow(clamp(1-y/H,0,1),.6)*(1+.06*Math.sin(Math.PI*clamp(y/H,0,1)));
 const SK=[],GU=[],BAL=[];
 SP.forEach((S,i)=>{const[x,z,H,R0,fl,cut]=S,rFn=prof(H,R0),hf=holeFn(dd*.8,9826+i,cut,1.2);
  const o={rFn,H,cut,jag:cut?7:0,flutes:fl,amp:.07,sharp:3,nu:fl*4,nv:Math.round(H/5),seed:9827+i,hole:hf};
  SK.push(lathe(o).translate(x,PH,z));
  if(dd)GU.push(lathe({rFn:y=>rFn(y)*.9,H,cut:cut?cut-3:null,nu:fl*2,nv:4}).translate(x,PH,z));
  windowsOnLathe(o,d,i?6:10,(cut||H)-(i?H*.18:34),i>4?9:i?7:6,fl,x,PH,z,i===0);
  // ring balconies on the central and great spires
  if(i<5)for(let y=i?22:24;y<H-(i?30:40);y+=i?20:18){if(cut&&y>cut-4)break;if(brk&&rng()<.28)continue;
   const r=rFn(y)*1.07+2.2;BAL.push([x,PH+y,z,r,i]);
   kput('slab',[x,PH+y,z],null,[r,.7,r],new THREE.Color(dd?0x6a5a4c:0xe8e4dc));
   kput(dd?'ringR':'ringW',[x,PH+y+1.1,z],qEuler(Math.PI/2,0,0),[r,r,9],null);
   if(!dd)stripRing(x,PH+y-.6,z,r-.2,0,Math.round(r*1.6));}
  // finials: the star on the centre, a bead on each of the rest
  if(!cut){if(i===0){kput('finial',[0,PH+H+3,0],null,[4.4,6,4.4],null);
    for(let k=0;k<6;k++){const a=k/6*TAU;beam(dd?'strutR':'strutW',[0,PH+H+5,0],[9*Math.cos(a),PH+H+5+9*Math.sin(a),0],.8,.8);}
    kput(dd?'postR':'postW',[0,PH+H-2,0],null,[.7,14,.7],null);}
   else kput('finial',[x,PH+H+1.2,z],null,[R0*.18,R0*.28,R0*.18],null);}
  REGISTER({name:'The Attraction: '+S[6],x,y:PH,z,r:R0*1.1,h:(cut||H)+4});});
 // THE FALLEN TOP of the central spire, lying east across the plain
 if(brk){const H=206,cut=124,rFn=prof(H,27),F=new THREE.Group();F.rotation.set(.1,.25,-Math.PI/2+.06);F.position.set(150,0,10);G.add(F);
  mesh(lathe({rFn:y=>rFn(y+cut),H:H-cut,cut:H-cut,flutes:20,amp:.07,sharp:3,nu:80,nv:16,hole:holeFn(.9,9830,null,1.2)}),MAT.rust,F,0,-(H-cut)/2,0);
  mesh(lathe({rFn:y=>rFn(y+cut)*.9,H:H-cut,nu:24,nv:3}),MAT.guts,F,0,-(H-cut)/2,0);
  dropFragment(F,0,2);rubbleRing(120,0,10,8,60,60,4);
  REGISTER({name:'The Attraction: fallen spire top',x:150,y:0,z:10,r:48,h:30});}
 // THE PODIUM: superelliptic, arcaded all round, a garden on its roof
 const hp=brk?holeFn(.8,9831,null,1.5):null;
 SK.push(gridSurface((u,v)=>{const th=u*TAU,r=rP(th);return[r*Math.cos(th),v*PH,r*Math.sin(th)];},128,3,{uS:RP*TAU/8,vS:PH/8,hole:hp?(u,v)=>v>.4&&hp(u,v*PH):null}));
 SK.push(gridSurface((u,v)=>{const th=u*TAU,r=rP(th)*1.015;return[r*Math.cos(th),PH+v*1.8,r*Math.sin(th)];},128,1,{uS:RP*TAU/8,vS:.4,hole:hp?(u)=>hp(u,PH*3):null}));
 const roof=gridSurface((u,v)=>{const th=u*TAU,r=rP(th)*v;return[r*Math.cos(th),PH,r*Math.sin(th)];},96,5,{uS:RP*TAU/8,vS:RP/8});
 SK.push(roof);
 const NA=56;
 for(let k=0;k<NA;k++){const th=(k+.5)/NA*TAU,r=rP(th),e=.004,r1=(rP(th+e)-rP(th-e))/(2*e);
  const tx=-r*Math.sin(th)+r1*Math.cos(th),tz=r*Math.cos(th)+r1*Math.sin(th),L=Math.hypot(tx,tz),n=[tz/L,0,-tx/L],q=qFacing(n);
  const p=[r*Math.cos(th),0,r*Math.sin(th)];
  if(brk&&rng()<.22){rubbleRing(p[0],0,p[2],1,8,6,2.2);continue;}
  kput(dd?'archR':'arch',[p[0]+n[0]*.9,0,p[2]+n[2]*.9],q,[.42,.44,.5],null);
  kput('archOpen',[p[0]+n[0]*.3,5.2,p[2]+n[2]*.3],q,[1,1.12,1],null);
  if(rec&&k%3===0){kput('patchTarp',[p[0]+n[0]*4,4.6,p[2]+n[2]*4],q.clone().multiply(qEuler(-1.15,0,0)),[7,6,1],null);
   kput('shantyBox',[p[0]+n[0]*6,1.2,p[2]+n[2]*6],q,[4,2.4,2.6],null);firePit('altHotel',p[0]+n[0]*3,0,p[2]+n[2]*3,.7);}}
 // the porch: a great parabolic arch on the south
 kput(dd?'vaultRibR':'vaultRib',[0,0,rP(Math.PI/2)+3],null,[.36,.5,2.6],null);
 kput('archOpen',[0,9,rP(Math.PI/2)+.2],null,[3.6,2.3,1],null);
 // the roof garden: hedges round each spire, trees between
 for(let k=0;k<70;k++){const a=rng()*TAU,r=rr(16,rP(a)-5),x=r*Math.cos(a),z=r*Math.sin(a);
  if(SP.some(S=>Math.hypot(x-S[0],z-S[1])<S[3]+3))continue;
  if(brk||k%2)VEG.tree(x,PH,z,k%3,brk?rr(6,11):rr(4,6));else kput('hedge',[x,PH+.6,z],qEuler(0,rng()*TAU,0),[rr(2,5),1.2,1.2],null);}
 apron(G,0,0,RP+4,RP+34,dd,1);
 meshMerged(SK,skin,G);if(GU.length)meshMerged(GU,MAT.guts,G);
 if(brk){rubbleRing(0,0,0,RP,RP+40,160,3.5);scatterMoss(0,PH,0,10,RP-6,90,3);mossOnSurface([roof],0,0,0,60,3);
  vinesFromLedge(SK,0,0,0,120,20,0,0);trees(0,0,RP+20,RP+120,30);}
 else{trees(0,0,RP+30,RP+110,14);figures(0,RP+18,14,18);}
 if(rec){
  // shacks along the balconies that survive, rope bridges spire to spire
  for(const B of BAL){const[x,y,z,r]=B,n=B[4]?3:6;for(let j=0;j<n;j++){const a=rng()*TAU,yaw=-a+Math.PI/2;
   if(rng()<.6){kput('shantyBox',[x+(r-1.6)*Math.cos(a),y+1.5,z+(r-1.6)*Math.sin(a)],qEuler(0,yaw,0),[rr(3,5),2.6,2.2],null);
    kput('shantyRoof',[x+(r-1.4)*Math.cos(a),y+2.95,z+(r-1.4)*Math.sin(a)],qEuler(.1,yaw,0),[5.4,1,3],null);
    const nn=[Math.cos(a),0,Math.sin(a)];fireWindow([x+(r-.45)*Math.cos(a),y+1.6,z+(r-.45)*Math.sin(a)],nn,qFacing(nn),1,.8);}
   else kput('waterButt',[x+(r-1.2)*Math.cos(a),y+1.3,z+(r-1.2)*Math.sin(a)],null,[.9,1.8,.9],null);}}
  const main=BAL.filter(B=>B[4]===0),sat=BAL.filter(B=>B[4]>0);
  for(let j=0;j<Math.min(6,sat.length);j++){const S=sat[(j*3)%sat.length],M=main.reduce((a,b)=>Math.abs(b[1]-S[1])<Math.abs(a[1]-S[1])?b:a,main[0]);if(!M)break;
   const ang=Math.atan2(S[2],S[0]),A=[M[3]*Math.cos(ang),M[1]+1,M[3]*Math.sin(ang)],B=[S[0]-S[3]*Math.cos(ang),S[1]+1,S[2]-S[3]*Math.sin(ang)];
   altSag(A,B,3,10,.5,'plank');altSag([A[0],A[1]+1.2,A[2]],[B[0],B[1]+1.2,B[2]],2.6,10,.08);}
  for(let j=0;j<4;j++){const B=BAL[(j*5)%BAL.length],a=rng()*TAU;altRope([B[0]+B[3]*Math.cos(a),B[1],B[2]+B[3]*Math.sin(a)],[B[0]+(B[3]+2)*Math.cos(a),PH,B[2]+(B[3]+2)*Math.sin(a)],.12);}
  KOFF=[gx,0,gz];altReclaim(G,120,PH-1,'altHotel');figures(0,RP+20,26,30);}
 KOFF=[0,0,0];return G;}
