// ================================================================= factory additions (called from buildFactory)
function factoryExtras(G,d,skin){
 // three lattice cooling hyperboloids (Babel skins) west of the hall
 [[-150,40],[-150,95],[-105,95]].forEach((p,i)=>{const Hc=70,cut=d>0&&i===1?Hc*.42:null;
  const lat=(u,y)=>{const a=u*TAU*10,b=y*.28;return Math.abs(Math.sin(a+b))>.28&&Math.abs(Math.sin(a-b))>.28;};
  const hole=(u,y)=>lat(u,y)||(d>0&&fbm(u*4,y*.05,60+i,2)<.3*d);
  const rFn=y=>13+9*Math.pow(Math.abs(y/Hc-.6)/.6,1.6);
  mesh(lathe({rFn,H:Hc,cut,jag:cut?4:0,nu:80,nv:40,hole,seed:60+i}),skin,G,p[0],6,p[1]);
  mesh(lathe({rFn:y=>rFn(y)*.88,H:Hc,cut,jag:cut?4:0,nu:32,nv:6,seed:60+i}),MAT.dark,G,p[0],6,p[1]);
  kput(d>0?'ringR':'ringW',[p[0],6+(cut||Hc),p[1]],qEuler(Math.PI/2,0,0),[rFn(cut||Hc)*1.02,rFn(cut||Hc)*1.02,10],null);
  for(let k=0;k<3;k++){const th=k/3*TAU+.3;kput(d>0?'pipeR':'pipe',[p[0]+rFn(0)*.7*Math.cos(th),6,p[1]+rFn(0)*.7*Math.sin(th)],null,[1.2,10,1.2],null);}
  if(cut)rubbleRing(p[0],6,p[1],10,30,60,2.5);});
 // pipe rack from the cooling towers to the hall
 for(let i=0;i<5;i++){const z=30+i*4;kput(d>0?'pipeR':'pipe',[-118,15+i%2*3,z],qEuler(0,0,Math.PI/2),[.9,60,.9],null);}
 for(let x=-140;x<=-95;x+=15)for(let i=0;i<2;i++)kput(d>0?'colR':'colW',[x,6,26+i*20],null,[1,10,1],null);
 kput(d>0?'strutR':'strutW',[-118,16.5,38],null,[50,.6,26],null);
 // tank farm + gantry crane east of the silos
 for(let i=0;i<6;i++){const tx=135+(i%2)*32,tz=10+Math.floor(i/2)*34;const R=11;const gone=d>0&&i===3;
  for(let k=0;k<4;k++){const th=(k+.5)*Math.PI/2;kput(d>0?'colR':'colW',[tx+7*Math.cos(th),6,tz+7*Math.sin(th)],null,[1.2,9,1.2],null);}
  if(!gone)mesh(lathe({rFn:y=>R*Math.sqrt(clamp(1-Math.pow((y-R)/R,2),0,1))+.01,H:2*R,nu:32,nv:14,hole:holeFn(d*.8,70+i,null,2)}),skin,G,tx,15-R*.15,tz);
  else{const fm=mesh(lathe({rFn:y=>R*Math.sqrt(clamp(1-Math.pow((y-R)/R,2),0,1))+.01,H:2*R,nu:32,nv:14,hole:holeFn(1,70+i,null,1.5)}),MAT.rust,G,tx+9,6,tz+6);fm.rotation.set(0.6,0,1.2);dropFragment(fm);}
  kput(d>0?'pipeR':'pipe',[tx,15,tz-R-2],qEuler(Math.PI/2,0,0),[.8,8,.8],null);}
 kput(d>0?'pipeR':'pipe',[150,10,-10],qEuler(0,0,Math.PI/2),[1,90,1],null);kput(d>0?'pipeR':'pipe',[105,10,0],qEuler(Math.PI/2,0,0),[1,60,1],null);
 [[112,-8],[112,96],[184,-8],[184,96]].forEach(p=>{beam(d>0?'strutR':'strutW',[p[0]-6,6,p[1]],[p[0],52,p[1]],3,3);beam(d>0?'strutR':'strutW',[p[0]+6,6,p[1]],[p[0],52,p[1]],3,3);});
 [-8,96].forEach(z=>kput(d>0?'strutR':'strutW',[148,53,z],null,[84,3.5,4],null));
 const cz=d>0?70:30;kput(d>0?'strutR':'strutW',[148,55.5,cz],null,[6,3,110],null);kput(d>0?'strutR':'strutW',[d>0?128:160,53,cz],null,[8,5,8],null);
 factorySilo(G,d,skin);
 // twin hypar furnace shells on the south apron
 luceShells(G,-40,96,60,42,24,d,90,skin);
 if(d>0)rubbleRing(-40,6,96,20,40,40,2.5);}

