// ================================================================= POLICE STATION — "the Watch"
function buildPolice(scene,gx,gz,d){reseed(9230+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 REGISTER({name:'Police station — the Watch ('+STATE(d)+')',x:0,z:0,r:90,h:60});
 kput(SLABC(d),[0,.4,0],null,[80,.8,80],null);
 // main block: battered hex, two storeys, slit windows, a sally-port
 const R0=34,R1=30,HM=12;mesh(lathe({rFn:y=>R0-(R0-R1)*y/HM,H:HM,nu:6,nv:4,hole:holeFn(d*.7,1800,null,1.5)}),CONC(d),G,0,.8,0);if(d>0){mesh(lathe({rFn:y=>(R0-(R0-R1)*y/HM)*.66,H:HM,nu:6,nv:1}),MAT.dark,G,0,.8,0);civRooms({cy:.8,rFn:y=>(R0-(R0-R1)*y/HM)*.84,y0:.3,y1:HM,step:6,d,seed:1805,rIn:.78});}else mesh(lathe({rFn:y=>(R0-(R0-R1)*y/HM)*.9,H:HM,nu:6,nv:1}),MAT.dark,G,0,.8,0);
 kput(SLABC(d),[0,.8+HM,0],null,[R1*.98,.8,R1*.98],null);
 for(let f=0;f<6;f++){const fa=f/6*TAU+Math.PI/6;const n=[Math.cos(fa),0,Math.sin(fa)];const tg=[-n[2],0,n[0]];for(let k=-2;k<=2;k++)for(const yy of [4.5,9.5]){const r=hexR(R0-(R0-R1)*(yy-.8)/HM,fa)+.2;civWin(d>0?'winSmD':'winSmI',[n[0]*r+tg[0]*k*7,yy,n[2]*r+tg[2]*k*7],qFacing(n),[1.2,2.6,1],null);}
  for(let k=-2;k<=2;k++){const r=hexR(R0,fa)+1;beam(BOXC(d),[n[0]*r+tg[0]*k*8,.8,n[2]*r+tg[2]*k*8],[n[0]*(r-4.5)+tg[0]*k*8,.8+HM+2,n[2]*(r-4.5)+tg[2]*k*8],1.6,1.4);}}
 kput('archOpen',[0,4,hexR(R0,Math.PI/2)-.5],qFacing([0,0,1]),[1,1,3],null);kput(BOXC(d),[0,7,hexR(R0,Math.PI/2)+6],null,[16,1,12],null);
 // watch tower: lattice hyperboloid with cupola and light
 const TH=44,tcut=d>0?TH*.6:null;const tx=-22,tz=-18;const rFn=y=>4*Math.sqrt(1+2.5*Math.pow((y-TH*.6)/(TH*.6),2));
 for(let k=0;k<6;k++)for(const dir of [-1,1]){let prev=null;for(let y=0;y<=(tcut||TH);y+=3){const th=k/6*TAU+dir*y*.06;const r=rFn(y);const p=[tx+r*Math.cos(th),.8+HM+y,tz+r*Math.sin(th)];if(prev)beam(d>0?'strutR':'strutW',prev,p,.7,.7);prev=p;}}
 kput('tube',[tx,.8+HM+(tcut||TH)/2,tz],null,[1.6,(tcut||TH),1.6],null);
 // ruin: the tower's head came down - the lantern cupola lies on the forecourt
 // north-west of the block, with a run of its lattice beside it
 if(tcut){const F=new THREE.Group();F.position.set(-58,1,-50);F.rotation.set(.45,.7,2.75);G.add(F);
  mesh(lathe({rFn:y=>8*Math.pow(clamp(1-Math.pow((y-4)/4,2),0,1),.5)+.01,H:8,nu:32,nv:8}),CONC(d),F);dropFragment(F,.8,.6);
  for(let k=0;k<5;k++){const a0=[-48+k*1.2,1.4,-38-k*3.5],a1=[-44+k*1.5,1.2,-40-k*3.5];beam('strutR',a0,[a0[0]+9,1.2+(k%2)*1.5,a0[2]-6],.7,.7);beam('strutR',a1,[a1[0]+8,1.3,a1[2]+5],.7,.7);}
  rubbleRing(-56,.8,-48,4,12,16,1.4);}
 if(!tcut){mesh(lathe({rFn:y=>8*Math.pow(clamp(1-Math.pow((y-4)/4,2),0,1),.5)+.01,H:8,nu:32,nv:8}),CONC(d),G,tx,.8+HM+TH-2,tz);kput('slab',[tx,.8+HM+TH+1.5,tz],null,[7,.6,7],new THREE.Color(0x1a1d22));stripRing(tx,.8+HM+TH+2,tz,6.5,d,16);kput('finial',[tx,.8+HM+TH+8,tz],null,[1.2,2,1.2],null);}
 // vehicle bays wing + perimeter wall with gate
 if(d===0){kput(BOXC(d),[42,5,-10],null,[30,10,50],null);kput('boxD',[42,5,-10],null,[28,9,48],null);}
 else{// RUIN: the south bay's roof has caved into it; its walls stand round the
  // slab and a patrol carrier crushed under it. The rest of the wing is whole.
  kput(BOXC(d),[42,5,-18.5],null,[30,10,33],null);kput('boxD',[42,5,-18.5],null,[28,9,31.2],null);
  kput(BOXC(d),[27.6,5,6.5],null,[1.2,10,17],null);kput(BOXC(d),[42,5,14.4],null,[30,10,1.2],null);kput(BOXC(d),[56.4,7.5,6.5],null,[1.2,5,17],null);
  kput(BOXC(d),[56.4,1.2,1],null,[1.2,2.4,6],null);kput(BOXC(d),[56.4,1.2,12],null,[1.2,2.4,4],null);
  kput('boxCR',[42,5.6,6.5],qEuler(.05,0,-.42),[30,1,15],null);kput('boxD',[46,1.6,6.5],qEuler(0,.3,.08),[9,3,4.2],null);
  rubbleRing(42,.8,6.5,2,12,26,1.6);}for(let k=0;k<3;k++)kput('archOpen',[57.2,3.4,-26+k*16],qFacing([1,0,0]),[.9,.75,1.5],null);
 for(let k=0;k<3;k++){const lit=d>0?rng()<.2:true;kput('strip',[57.4,9.2,-26+k*16],qEuler(0,0,0),[10,1,1],lit?CYAN:DEAD);}
 for(let k=0;k<4;k++){const a=k*Math.PI/2;for(let j=-1;j<=1;j+=2){if(k===0&&j===1)continue;const px=Math.cos(a)*44+(-Math.sin(a))*j*22,pz=Math.sin(a)*44+Math.cos(a)*j*22;
  // ruin: two runs of the perimeter wall lie flat where they fell, outward
  if(d>0&&((k===2&&j===-1)||(k===3&&j===1))){kput('boxCR',[px+Math.cos(a)*2.8,1.4,pz+Math.sin(a)*2.8],qAxis(-Math.sin(a),0,Math.cos(a),-1.45).multiply(qEuler(0,-a,0)),[1.2,5,44],null);continue;}
  kput(BOXC(d),[px,2.5,pz],qEuler(0,-a,0),[1.2,5,44],null);}}
 kput(BOXC(d),[46,6,44],null,[3,12,3],null);kput(BOXC(d),[-46,6,44],null,[3,12,3],null);kput('boxD',[0,3,44],null,[1,6,1],null);
 for(let k=0;k<6;k++){const x=-30+k*12;kput(BOXC(d),[x,.8,60],null,[5,.5,10],null);}
 if(d>0){mossOnRing(0,.8+HM+.5,0,26,20,2);rubbleRing(0,.8,0,36,60,40,2);vinesOnRing(0,.8+HM,0,R1,12,10);}
 figures(0,50,4,6);civFlatten(G);KOFF=[0,0,0];return G;}

