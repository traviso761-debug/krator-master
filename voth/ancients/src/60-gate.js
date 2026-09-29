// ================================================================= MEGASTRUCTURE 2 — "the Gate" (cyclopean lattice arc with an apex tower)
function buildArc(scene,gx,gz,d){reseed(9820+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const skin=SHELL(d);
 const SPAN=640,RISE=300;REGISTER({name:'Megastructure — the Gate ('+STATE(d)+')',x:0,z:0,r:400,h:RISE+140});
 const C=t=>[SPAN*(t-.5),RISE*(1-Math.pow(2*t-1,2))*(1+.06*Math.sin(t*9)),0];         // centreline, slight wobble
 const W=t=>42*(1+.5*Math.pow(Math.abs(2*t-1),3)),D=t=>34*(1+.4*Math.pow(Math.abs(2*t-1),3)); // section grows toward the feet
 const gone=t=>d>0&&t>.1&&t<.19;                                                             // ruined: gap in the west leg
 const N=96;const chords=[[-1,-1],[1,-1],[-1,1],[1,1],[0,-1.3],[0,1.3]];
 // ARC SKIN IN ONE MESH: the chord tubes, the four plated faces and the crest
 // lattice share `skin` and G, so they are collected and merged once (they were
 // 14-20 meshes). The merge is untranslated, so it is pixel-exact.
 const arcSkin=[];
 chords.forEach((c,ci)=>{let pts=[];const flush=()=>{if(pts.length>1)arcSkin.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),pts.length*2,ci<4?5.5:3,8,false));pts=[];};
  for(let i=0;i<=N;i++){const t=i/N;if(gone(t)){flush();continue;}const p=C(t);const tg=[C(t+.001)[0]-p[0],C(t+.001)[1]-p[1]];const L=Math.hypot(tg[0],tg[1]);const nx=-tg[1]/L,ny=tg[0]/L;
   pts.push(new THREE.Vector3(p[0]+nx*c[0]*W(t)/2,p[1]+ny*c[0]*W(t)/2,c[1]*D(t)/2));}flush();});
 for(let i=0;i<N;i+=2){const t=(i+.5)/N;if(gone(t))continue;const p=C(t);const tg=[C(t+.001)[0]-p[0],C(t+.001)[1]-p[1]];const L=Math.hypot(tg[0],tg[1]);const nx=-tg[1]/L,ny=tg[0]/L;
  const w=W(t)/2,dp=D(t)/2;const P4=(a,b)=>[p[0]+nx*a*w,p[1]+ny*a*w,b*dp];
  beam(d>0?'strutR':'strutW',P4(-1,-1),P4(1,1),2.2,2.2);beam(d>0?'strutR':'strutW',P4(1,-1),P4(-1,1),2.2,2.2);
  beam(d>0?'strutR':'strutW',P4(-1,-1),P4(-1,1),2.6,2.6);beam(d>0?'strutR':'strutW',P4(1,-1),P4(1,1),2.6,2.6);
  if(i%6===0){const dn=P4(-1,0);kput('strip',[dn[0],dn[1]-.5,dn[2]],qEuler(0,0,Math.atan2(ny,nx)+Math.PI/2),[dp*1.6,1,1],d>0?(rng()<.1?CYAN:DEAD):CYAN);}}
 // armour plating on all four faces of the box section: full when intact, knocked off in patches (painting) when ruined
 const frame=t=>{const p=C(t);const tg=[C(t+.001)[0]-p[0],C(t+.001)[1]-p[1]];const L=Math.hypot(tg[0],tg[1]);return{p,nx:-tg[1]/L,ny:tg[0]/L};};
 const plateGone=(u,v,f)=>gone(u)||(d>0?fbm(u*16+f*3,v*3,1300+f,3)<.53||fbm(u*40,v*6,1320+f,2)<.28:fbm(u*30,v*5,1300+f,2)<.08);
 const facesA=[[1,0],[-1,0],[0,1],[0,-1]];facesA.forEach((fc,f)=>{arcSkin.push(gridSurface((u,v)=>{const F=frame(u);const w=W(u)/2,dp=D(u)/2;let a,b;if(fc[0]){a=fc[0]*1.03;b=(v-.5)*2;}else{a=(v-.5)*2;b=fc[1]*1.03;}return[F.p[0]+F.nx*a*w,F.p[1]+F.ny*a*w,b*dp];},192,8,{uS:48,vS:3,hole:(u,v)=>plateGone(u,v,f)}));});
 // plate seams: thin ribs every few metres along the extrados and intrados
 for(let i=0;i<N;i+=1){const t=(i+.5)/N;if(gone(t))continue;const F=frame(t);for(const a of [1.04,-1.04]){if(d>0&&plateGone(t,.5,a>0?0:1))continue;kput(PLATE(d),[F.p[0]+F.nx*a*W(t)/2,F.p[1]+F.ny*a*W(t)/2,0],qEuler(0,0,Math.atan2(F.ny,F.nx)),[1.2,.6,D(t)*1.06],null);}}
 // fallen plates scattered below the ruined arc
 if(d>0)for(let k=0;k<90;k++){const t=rr(.05,.95);const F=frame(t);const x=F.p[0]+rr(-60,60),z=rr(-80,80);kput('plateR',[x,rr(.5,2.5),z],qEuler(rr(-.4,.4),rng()*TAU,rr(-.4,.4)),[rr(6,16),.6,rr(5,12)],null);}
 // THE CREST LATTICE along the extrados: a spine of bone vertebrae arching over
 // the top plating, tied rib to rib by sinuous diagonals, so the deck reads as
 // grown rather than plated. One merged mesh; a ruin keeps about two thirds.
 {const cr=[];const V=(F,t,a,b)=>new THREE.Vector3(F.p[0]+F.nx*a*W(t)/2,F.p[1]+F.ny*a*W(t)/2,b*D(t)/2);
  for(let i=1;i<N-1;i+=2){const t=i/N,t2=(i+2)/N;if(gone(t)||gone(t2))continue;if(d>0&&h3(i,3,1340)<.33)continue;const F=frame(t),F2=frame(t2),Fm=frame((t+t2)/2);
   cr.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(F,t,1.02,-1.05),V(F,t,1.24,-.72),V(F,t,1.38,0),V(F,t,1.24,.72),V(F,t,1.02,1.05)]),8,1.1,5,false));
   const s=(i>>1)%2?1:-1;
   cr.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(F,t,1.38,0),V(Fm,(t+t2)/2,1.3,s*.45),V(F2,t2,1.02,s*1.05)]),6,.8,5,false));}
  meshMerged(arcSkin.concat(cr),skin,G);}
 // feet
 for(const t of [0,1]){const p=C(t);apron(G,p[0]+(t?1:-1)*18,0,34,86,d,5);kput(BOXC(d),[p[0],14,0],null,[70,28,50],null);kput(BOXC(d),[p[0]+(t?1:-1)*40,8,0],qEuler(0,0,(t?-1:1)*.35),[60,14,44],null);
  for(let k=0;k<5;k++)kput(d>0?'colR':'colW',[p[0]+(t?1:-1)*(30+k*18),0,-40+k*20],null,[2.5,12,2.5],null);}
 // apex tower: fluted shaft with a cluster of spikes, offset toward one side like the painting
 const ap=C(.56);const TH=170,tcut=d>0?TH*.72:null;const T=new THREE.Group();T.position.set(ap[0],ap[1]-8,0);G.add(T);useGroupXF(T);
 mesh(lathe({rFn:y=>20*(1-.3*y/TH)+1,H:TH,cut:tcut,jag:tcut?4:0,flutes:8,amp:.2,sharp:1.5,nu:48,nv:40,hole:holeFn(d,1310,tcut,1.2)}),skin,T);
 if(d>0){mesh(lathe({rFn:y=>12*(1-.3*y/TH),H:TH,cut:tcut,jag:4,nu:20,nv:6}),MAT.guts,T);civRooms({rFn:y=>20*(1-.3*y/TH)+1,y0:6,y1:tcut,step:12,d,seed:1312,cut:tcut,rIn:.58});}
 for(let y=10;y<(tcut||TH)-6;y+=6)for(let k=0;k<12;k++){const th=(k+.5)/12*TAU,r=20*(1-.3*y/TH)+1.1;civWin(d>0?'winSmD':'winSmI',[r*Math.cos(th),y,r*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[1.6,2.6,1],null);}
 for(let yy=20;yy<(tcut||TH)-10;yy+=30)stripRing(0,yy,0,19*(1-.3*yy/TH),d,24);
 if(!tcut){for(let k=0;k<9;k++){const th=k/9*TAU;const r=rr(4,13),h=rr(20,50);beam(d>0?'strutR':'strutW',[Math.cos(th)*r,TH-4,Math.sin(th)*r],[Math.cos(th)*r*1.4,TH-4+h,Math.sin(th)*r*1.4],rr(1.2,2.6),rr(1.2,2.6));}
  if(d===0)kput('finial',[0,TH+30,0],null,[3,6,3],null);}
 endGroupXF();
 // ruined: the fallen leg section lying below the gap, rubble, moss
 if(d>0){const p=C(.15);const F=new THREE.Group();F.position.set(p[0]+30,10,40);F.rotation.set(.3,.4,1.35);G.add(F);
  // the fallen leg section: four chords, torn plating on two faces and its
  // bracing, set down ON the ground (it used to hang 10 m in the air as four
  // clean cylinders)
  const fl=[];for(const c of chords.slice(0,4))fl.push(new THREE.CylinderGeometry(5.5,5.5,70,8,1,true).translate(c[0]*20,0,c[1]*16));
  for(const sd of [-1,1])fl.push(gridSurface((u,v)=>[sd*21.5,(u-.5)*64,(v-.5)*30],12,4,{uS:8,vS:4,hole:(u,v)=>h3(u*12|0,v*4|0,1330+sd)<.45}));
  meshMerged(fl,MAT.rust,F);dropFragment(F,0,2.5);
  useGroupXF(F);for(let y=-30;y<30;y+=10){beam('strutR',[-20,y,-16],[20,y+10,16],2.2,2.2);if(h3(y,1,1331)<.6)beam('strutR',[20,y,-16],[-20,y+10,16],2.2,2.2);}endGroupXF();
  // the chords torn out of the standing arc's broken end, hanging off it
  {const hg=[];const F0=frame(.192);chords.slice(0,4).forEach((c,ci)=>{const L=[34,62,22,48][ci];const e=new THREE.Vector3(F0.p[0]+F0.nx*c[0]*W(.192)/2,F0.p[1]+F0.ny*c[0]*W(.192)/2,c[1]*D(.192)/2);
    const pts=[e];for(let k=1;k<=4;k++)pts.push(new THREE.Vector3(e.x-6*k/4+3*Math.sin(k+ci),e.y-L*k/4,e.z+2*Math.cos(k*1.7+ci)));
    hg.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),10,ci<2?2.2:1.6,6,false));});meshMerged(hg,MAT.rust,G);}
  rubbleRing(p[0]+20,0,30,10,90,140,4);scatterMoss(0,0,0,0,420,220,3.5);trees(0,0,60,420,40);vinesOnRing(ap[0],ap[1]-20,0,20,20,40);}
 figures(0,120,6,14);KOFF=[0,0,0];return G;}

