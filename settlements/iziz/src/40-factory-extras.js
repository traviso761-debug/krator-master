// ================================================================= factory additions (called from buildFactory)
// The Foundry's merge sink. buildFactory used to add one mesh per lobe, stack,
// cap and lining - 109 of them, the heaviest draw-call type in the kit. Each
// surface is now pushed here with its offset baked in and merged per material
// once the builder is done. Opaque materials only: glass stays its own mesh.
function facSink(){const B=new Map();
 return{add(geo,mat,x,y,z){if(x||y||z)geo.translate(x||0,y||0,z||0);if(!B.has(mat))B.set(mat,[]);B.get(mat).push(geo);},
  flush(parent){for(const [mat,gs] of B)meshMerged(gs,mat,parent);B.clear();}};}
function factoryExtras(G,d,skin,M){
 // three lattice cooling hyperboloids (Babel skins) west of the hall. Moved
 // east and slimmed to .85 (were at x=-150/-105, 22 m at the foot): the intact
 // Foundry's tank farm stood inside the rehabilitated one's towers, 330 m east.
 [[-132,40],[-132,92],[-92,102]].forEach((p,i)=>{const Hc=70,cut=d>0&&i===1?Hc*.42:null;
  const lat=(u,y)=>{const a=u*TAU*10,b=y*.28;return Math.abs(Math.sin(a+b))>.28&&Math.abs(Math.sin(a-b))>.28;};
  const hole=(u,y)=>lat(u,y)||(d>0&&fbm(u*4,y*.05,60+i,2)<.3*d);
  const rFn=y=>(13+9*Math.pow(Math.abs(y/Hc-.6)/.6,1.6))*.85;
  M.add(lathe({rFn,H:Hc,cut,jag:cut?4:0,nu:80,nv:40,hole,seed:60+i}),skin,p[0],6,p[1]);
  M.add(lathe({rFn:y=>rFn(y)*.88,H:Hc,cut,jag:cut?4:0,nu:32,nv:6,seed:60+i}),MAT.dark,p[0],6,p[1]);
  kput(d>0?'ringR':'ringW',[p[0],6+(cut||Hc),p[1]],qEuler(Math.PI/2,0,0),[rFn(cut||Hc)*1.02,rFn(cut||Hc)*1.02,10],null);
  for(let k=0;k<3;k++){const th=k/3*TAU+.3;kput(d>0?'pipeR':'pipe',[p[0]+rFn(0)*.7*Math.cos(th),6,p[1]+rFn(0)*.7*Math.sin(th)],null,[1.2,10,1.2],null);}
  if(cut)rubbleRing(p[0],6,p[1],10,30,60,2.5);});
 // pipe rack from the cooling towers to the hall
 // (it follows the towers east: its deck used to run 10 m into the first one)
 for(let i=0;i<5;i++){const z=30+i*4;kput(d>0?'pipeR':'pipe',[-104,15+i%2*3,z],qEuler(0,0,Math.PI/2),[.9,44,.9],null);}
 for(const x of [-112,-90])for(let i=0;i<2;i++)kput(d>0?'colR':'colW',[x,6,26+i*20],null,[1,10,1],null);
 kput(d>0?'strutR':'strutW',[-100,16.5,38],null,[34,.6,26],null);
 // tank farm + gantry crane east of the silos, 16 m further west than they were
 // (see the plinth note in buildFactory); EX is that shift.
 const EX=-16;
 for(let i=0;i<6;i++){const tx=135+EX+(i%2)*32,tz=10+Math.floor(i/2)*34;const R=11;const gone=d>0&&i===3;
  for(let k=0;k<4;k++){const th=(k+.5)*Math.PI/2;kput(d>0?'colR':'colW',[tx+7*Math.cos(th),6,tz+7*Math.sin(th)],null,[1.2,9,1.2],null);}
  if(!gone)M.add(lathe({rFn:y=>R*Math.sqrt(clamp(1-Math.pow((y-R)/R,2),0,1))+.01,H:2*R,nu:32,nv:14,hole:holeFn(d*.8,70+i,null,2)}),skin,tx,15-R*.15,tz);
  else{const fm=mesh(lathe({rFn:y=>R*Math.sqrt(clamp(1-Math.pow((y-R)/R,2),0,1))+.01,H:2*R,nu:32,nv:14,hole:holeFn(1,70+i,null,1.5)}),MAT.rust,G,tx+9,6,tz+6);fm.rotation.set(0.6,0,1.2);dropFragment(fm);}
  kput(d>0?'pipeR':'pipe',[tx,15,tz-R-2],qEuler(Math.PI/2,0,0),[.8,8,.8],null);}
 kput(d>0?'pipeR':'pipe',[124,10,-10],qEuler(0,0,Math.PI/2),[1,70,1],null);kput(d>0?'pipeR':'pipe',[105+EX,10,0],qEuler(Math.PI/2,0,0),[1,60,1],null);
 // legs start at the ground, not the plinth top: the east pair now stand just
 // off the plinth edge
 [[112,-8],[112,96],[184,-8],[184,96]].forEach(p=>{const px=p[0]+EX;beam(d>0?'strutR':'strutW',[px-6,0,p[1]],[px,52,p[1]],3,3);beam(d>0?'strutR':'strutW',[px+6,0,p[1]],[px,52,p[1]],3,3);});
 [-8,96].forEach(z=>kput(d>0?'strutR':'strutW',[148+EX,53,z],null,[84,3.5,4],null));
 const cz=d>0?70:30;kput(d>0?'strutR':'strutW',[148+EX,55.5,cz],null,[6,3,110],null);kput(d>0?'strutR':'strutW',[(d>0?128:160)+EX,53,cz],null,[8,5,8],null);
 factorySilo(G,d,skin,M);
 // twin hypar furnace shells on the south apron
 // (round 2) They stood 60 x 48 m at z=96, i.e. from z=72, eight metres INSIDE
 // the hall's south end wall (z=80), filling its great arched opening from every
 // southern view. Now 44 x 32 m at z=104: 8 m clear of the wall, clear of the
 // nearest cooling tower (x<-73) and inside the plinth's south edge (123).
 luceShells(G,-40,104,44,32,16,d,90,skin);
 if(d>0)rubbleRing(-40,6,104,16,22,40,2.5);}

