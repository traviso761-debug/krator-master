// ================================================================= ALTERNATE CULTURAL CENTRE — THE BLOOM
// Not a city of halls but one gesture: a concrete flower 64 m tall, four thick
// cupped petals rising out of a single stem and opening over a ring of seats,
// so the auditorium is the space under the bloom. Round it a ring wall whose
// top swells and dips and rears up at the two gates, and six white drum halls
// pushed out through the wall, each ending in a great round window with
// radial mullions. A causeway climbs to the south gate. (arco1 #51 the Stone
// Flower at Jasenovac, its cupped concrete petals and the curving earth walls;
// arco1 #46 the Ilinden memorial's drums ending in round windows; arco2 #9
// the Kavadarci ossuary's walled precinct.)
// Ruin: one petal has snapped at half height and its blade lies across the
// seats; the others are holed; the wall is breached; two halls have fallen in
// and their windows lie on the grass. Reclaimed: a market in the seats, lean-tos
// against the inside of the wall, lines strung between the petals, gardens.
function buildAltCult(scene,gx,gz,d){reseed(9840+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0,brk=d===1||d===2,rec=d===2,stone=CONC(dd),skin=SHELL(d);
 const RW=82,PY=1.6;
 REGISTER({name:'The Bloom — cultural centre ('+ALT_STATE[d]+')',x:0,z:0,r:RW+30,h:70});
 REGISTER({name:'The Bloom: the flower',x:0,z:0,r:40,h:70});
 const ST=[],WS=[],GL=[];
 // THE PETALS: outer face, inner face, edges, a 1.6 m thick shell
 const NPET=4,BROKE=brk?1:-1;
 const petal=(a,v0,v1,hole,ox,oy,oz)=>{const dir=[Math.cos(a),Math.sin(a)],tg=[-Math.sin(a),Math.cos(a)],A=[];
  const P=(s,v,inn)=>{const c=4+32*Math.pow(v,1.6),w=2.5+14*Math.pow(Math.sin(Math.PI*Math.min(1,v*.85)),.8),y=PY+5+58*v-6*v*v;
   const rad=c-.55*s*s*w*v*(1+v)-(inn?1.6:0),t=s*w*(inn?.97:1);
   return[dir[0]*rad+tg[0]*t-(ox||0),y-(oy||0),dir[1]*rad+tg[1]*t-(oz||0)];};
  const vv=v=>lerp(v0,v1,v);
  for(const inn of[0,1])A.push(gridSurface((u,v)=>P(u*2-1,vv(v),inn),16,24,{uS:4,vS:8,hole:hole?(u,v)=>hole(u,vv(v)):null}));
  for(const s of[-1,1])A.push(gridSurface((u,v)=>{const p=P(s,vv(v),0),q=P(s,vv(v),1);return[lerp(p[0],q[0],u),lerp(p[1],q[1],u),lerp(p[2],q[2],u)];},1,24,{uS:.4,vS:8}));
  A.push(gridSurface((u,v)=>{const p=P(u*2-1,v1,0),q=P(u*2-1,v1,1);return[lerp(p[0],q[0],v),lerp(p[1],q[1],v),lerp(p[2],q[2],v)];},16,1,{uS:4,vS:.4}));
  return A;};
 for(let i=0;i<NPET;i++){const a=i/NPET*TAU+Math.PI/4,hf=brk?holeFn(.6,9841+i,null,1.4):null,hole=hf?(u,v)=>v>.2&&hf(u,v*90):null;
  if(i!==BROKE){ST.push(...petal(a,0,1,hole));continue;}
  ST.push(...petal(a,0,.52,hole));
  // the blade, down across the seats
  const F=new THREE.Group();F.rotation.set(0,-a+Math.PI,0);F.position.set(46*Math.cos(a),0,46*Math.sin(a));G.add(F);
  const H=new THREE.Group();H.rotation.set(0,0,1.25);F.add(H);
  meshMerged(petal(a,.55,1,hole,32*Math.cos(a)*.62,40,32*Math.sin(a)*.62),MAT.concreteR,H);
  H.rotation.y=a;dropFragment(F,0,1.2);
  REGISTER({name:'The Bloom: fallen petal',x:46*Math.cos(a),y:0,z:46*Math.sin(a),r:26,h:22});}
 // the stem
 ST.push(lathe({rFn:y=>4.6+6*Math.pow(clamp(1-y/12,0,1),2),H:12,nu:24,nv:6}).translate(0,PY,0));
 // THE SEATS: fourteen steps rising outward under the petals, a gap on the axis
 const prof=[[22,0]];for(let k=0;k<14;k++){const r=24+k*2.3,y=.4+k*.9;prof.push([r-2.3+.01,y],[r,y]);}
 prof.push([58,13],[58.5,0]);
 ST.push(gridSurface((u,v)=>{const th=u*TAU,i=Math.min(prof.length-1,Math.round(v*(prof.length-1))),p=prof[i];return[p[0]*Math.cos(th),PY+p[1],p[0]*Math.sin(th)];},96,prof.length-1,
  {uS:8,vS:prof.length/2,hole:(u)=>Math.abs(u-.25)<.022}));
 kput(SLABC(d),[0,PY+.3,0],null,[22,.6,22],null);           // the stage round the stem
 // THE PLATFORM, the causeway, the ring wall with its swelling top and its two gates
 kput(SLABC(d),[0,PY/2,0],null,[RW+8,PY,RW+8],null);
 for(let k=0;k<12;k++)kput(BOXC(d),[0,PY*(1-k/12)*.5,RW+8+k*4],null,[16,PY*(1-k/12)+.1,4],null);
 const angD=x=>{x=((x%TAU)+TAU)%TAU;return Math.min(x,TAU-x);},gate=th=>Math.min(angD(th-Math.PI/2),angD(th+Math.PI/2));
 const hTop=th=>PY+8+5*(.5+.5*Math.sin(th*6+.4))+2*Math.sin(th*13)+12*Math.exp(-Math.pow(gate(th)/.2,2));
 const hw=brk?holeFn(.9,9845,null,1.6):null,wHole=(u,y)=>gate(u*TAU)<.065||(hw&&hw(u,y)&&y>PY+3);
 for(const r of[RW-1.5,RW+1.5])ST.push(gridSurface((u,v)=>{const th=u*TAU;return[r*Math.cos(th),lerp(PY,hTop(th),v),r*Math.sin(th)];},240,5,
  {uS:RW*TAU/8,vS:2,hole:(u,v)=>wHole(u,lerp(PY,hTop(u*TAU),v))}));
 ST.push(gridSurface((u,v)=>{const th=u*TAU,r=lerp(RW-1.5,RW+1.5,v);return[r*Math.cos(th),hTop(th),r*Math.sin(th)];},240,1,
  {uS:RW*TAU/8,vS:.4,hole:(u)=>gate(u*TAU)<.065||(hw&&hw(u,hTop(u*TAU)-1))}));
 // THE HALLS: white drums out through the wall, each ending in a great round window
 const HR=12.5,HL=28;
 for(let k=0;k<6;k++){const a=k/6*TAU,c=[Math.cos(a),Math.sin(a)],mid=RW+HL/2-4,yc=PY+HR+1.4,fell=brk&&(k===1||k===4);
  const body=new THREE.CylinderGeometry(HR,HR,HL,36,6,true).rotateZ(Math.PI/2).rotateY(-a).translate(c[0]*mid,yc,c[1]*mid);
  if(!fell)WS.push(body);
  else{// fallen in: a stump of the drum and the window frame lying on the grass in front
   WS.push(gridSurface((u,v)=>{const th=Math.PI*.15+u*Math.PI*.7,x=lerp(-HL/2,HL/2,v);const ry=HR*Math.cos(th)*-1,rz=HR*Math.sin(th);
    return[c[0]*(mid+x)-c[1]*rz,yc+ry*.5-HR*.35,c[1]*(mid+x)+c[0]*rz];},14,6,{uS:6,vS:3,hole:(u,v)=>fbm(u*5,v*4,9846+k,2)<.35}));
   const e=RW+HL+10;kput(dd?'ringR':'ringW',[c[0]*e,1.2,c[1]*e],qEuler(-Math.PI/2+.12,0,0),[HR,HR,14],null);
   for(let j=0;j<5;j++)beam('strutR',[c[0]*e+rr(-9,9),.6,c[1]*e+rr(-9,9)],[c[0]*e+rr(-9,9),.6,c[1]*e+rr(-9,9)],.7,.7);
   rubbleRing(c[0]*mid,0,c[1]*mid,6,26,40,3.2);continue;}
  kput(BOXC(d),[c[0]*mid,PY+.7,c[1]*mid],qEuler(0,-a,0),[HL,1.4,HR*1.4],null);
  // the window at the outer end: frame, inner ring, radial mullions, glass
  const e=RW+HL-4,P=[c[0]*e,yc,c[1]*e],q=qFacing([c[0],0,c[1]]);
  kput(dd?'ringR':'ringW',P,q,[HR+.2,HR+.2,14],null);kput(dd?'ringR':'ringW',[P[0]+c[0]*.4,yc,P[2]+c[1]*.4],q,[HR*.42,HR*.42,10],null);
  for(let j=0;j<12;j++){const b=j/12*TAU;if(brk&&j%3===0)continue;
   const o1=[-c[1]*Math.cos(b),Math.sin(b),c[0]*Math.cos(b)];
   beam(dd?'mullR':'mullW',[P[0]+o1[0]*HR*.42,yc+o1[1]*HR*.42,P[2]+o1[2]*HR*.42],[P[0]+o1[0]*HR,yc+o1[1]*HR,P[2]+o1[2]*HR],.5,.5);}
  if(!dd)GL.push(new THREE.CircleGeometry(HR,32).rotateY(Math.PI/2-a).translate(P[0]-c[0]*.3,yc,P[2]-c[1]*.3));
  else WS.push(new THREE.CircleGeometry(HR,32).rotateY(Math.PI/2-a).translate(P[0]-c[0]*3,yc,P[2]-c[1]*3));
  REGISTER({name:'The Bloom: hall '+(k+1),x:c[0]*mid,y:0,z:c[1]*mid,r:HL/2+1,h:yc+HR});}
 // the plaza between seats and wall: trees and kiosks
 for(let k=0;k<(brk?60:28);k++){const a=rng()*TAU,r=rr(62,RW-5);if(gate(a)<.1)continue;
  if(brk||k%3)VEG.tree(r*Math.cos(a),PY,r*Math.sin(a),k%3,brk?rr(6,13):rr(4,7));else kput('hedge',[r*Math.cos(a),PY+.6,r*Math.sin(a)],qEuler(0,-a,0),[4,1.2,1.2],null);}
 if(!brk)for(let k=0;k<8;k++){const a=(k+.5)/8*TAU,r=RW-8;if(gate(a)<.2)continue;
  WS.push(lathe({rFn:y=>4*Math.pow(clamp(1-y/6,0,1),.5)+.2,H:6,nu:16,nv:4}).translate(r*Math.cos(a),PY+3.2,r*Math.sin(a)));
  kput(dd?'postR':'postW',[r*Math.cos(a),PY+1.6,r*Math.sin(a)],null,[1,3.2,1],null);}
 stripRing(0,PY+.2,0,59,dd,64);
 apron(G,0,0,RW+8,RW+40,dd,PY);
 meshMerged(ST,stone,G);meshMerged(WS,skin,G);if(GL.length)meshMerged(GL,MAT.glass,G);
 if(brk){rubbleRing(0,0,0,RW+2,RW+40,140,3.5);scatterMoss(0,PY,0,24,RW,120,3);vinesFromLedge(ST,0,0,0,120,16,0,0);
  trees(0,0,RW+20,RW+130,40);
  for(let k=0;k<40;k++){const a=rng()*TAU,r=rr(26,56);kput('moss',[r*Math.cos(a),PY+.4+(r-24)*.39,r*Math.sin(a)],null,[rr(1,3),.5,rr(1,3)],new THREE.Color().setHSL(rr(.22,.32),.4,.12));}}
 else{trees(0,0,RW+30,RW+110,16);figures(0,RW+30,16,14);figures(0,40,10,14);}
 if(rec){
  // a market in the seats: stalls under tarps on the treads, each row its own fire
  for(let k=0;k<26;k++){const a=rng()*TAU,st=(rng()*13)|0,r=25+st*2.3,y=PY+.4+st*.9,yaw=-a+Math.PI/2;
   if(Math.abs(((a-Math.PI/2)+TAU)%TAU)<.15)continue;
   kput('patchTarp',[r*Math.cos(a),y+2.6,r*Math.sin(a)],qEuler(-Math.PI/2+.2,yaw,0),[rr(4,6),rr(2.5,3.5),1],null);
   if(k%4===0)firePit('altCult',r*Math.cos(a),y,r*Math.sin(a),.6);
   else kput('planter',[r*Math.cos(a),y+.4,r*Math.sin(a)],qEuler(0,yaw,0),[3,.8,1.4],null);}
  // lean-tos against the inside of the wall
  for(let k=0;k<30;k++){const a=(k+rng()*.6)/30*TAU;if(gate(a)<.12)continue;const r=RW-5,yaw=-a+Math.PI/2;
   kput('shantyBox',[r*Math.cos(a),PY+1.3,r*Math.sin(a)],qEuler(0,yaw,0),[rr(4,6),2.6,3.2],null);
   kput('patchTarp',[(RW-3)*Math.cos(a),PY+4,(RW-3)*Math.sin(a)],qEuler(-Math.PI/2-.5,yaw,0),[6,5,1],null);
   if(k%3===0){const n=[-Math.cos(a),0,-Math.sin(a)];fireWindow([(r-1.65)*Math.cos(a),PY+1.4,(r-1.65)*Math.sin(a)],n,qFacing(n),1,.8);}}
  // lines strung between the petal tips, a ladder up the first petal's back
  for(let i=0;i<NPET;i++){const a=i/NPET*TAU+Math.PI/4,b=(i+1)/NPET*TAU+Math.PI/4;if(i===BROKE||i+1===BROKE)continue;
   altSag([30*Math.cos(a),PY+50,30*Math.sin(a)],[30*Math.cos(b),PY+50,30*Math.sin(b)],8,10,.08);}
  {const a=Math.PI/4+Math.PI;altLadder([20*Math.cos(a),PY+.5,20*Math.sin(a)],[24*Math.cos(a),PY+40,24*Math.sin(a)],[-Math.sin(a),0,Math.cos(a)]);}
  KOFF=[gx,0,gz];altReclaim(G,160,PY+.5,'altCult');figures(0,60,30,50);}
 KOFF=[0,0,0];return G;}
