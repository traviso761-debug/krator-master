// ================================================================= EASTERN NOMAD KIT — the pueblo compound
// buildPuebloCompound({cx,cz,cell,storeys,seed}): a U of rooms round a plaza that
// opens to +z. Rooms are cells of `cell` metres; the back row stands `storeys`
// high and the arms step down toward the plaza, so every roof is a terrace for
// the room behind it. T-shaped doors open on the plaza, vigas show below each
// roof, parapets run where a roof meets air, ladders climb terrace to terrace.
// The footprint is the U's bounding rectangle; `cells` lists the rooms (the host
// blocks them in the walkable grid and leaves the plaza open).
(function(){
const K0=NOMAD.kit,DYE=NOMAD.DYE;
const SH=2.7;   // storey height
function buildPuebloCompound({cx=6,cz=6,cell=4,storeys=3,seed=1}={}){
 const K=K0(seed),r=K.rnd,W=cx*cell,D=cz*cell,x0=-W/2,z0=-D/2;
 // the height of every cell (0 = plaza or a gap in the U)
 const H=[];for(let i=0;i<cx;i++){H.push([]);for(let j=0;j<cz;j++){const back=j===0,side=i===0||i===cx-1;let h=0;
  if(back)h=storeys-((i===0||i===cx-1)&&r()<.5?1:0);
  else if(side){h=Math.max(1,Math.round(storeys-(j/(cz-1))*storeys*.9));if(j===cz-1&&r()<.35)h=0;}
  else if(j===1&&r()<.55)h=Math.max(1,storeys-2);      // a few rooms step into the plaza from the back row
  H[i].push(h);}}
 const at=(i,j)=>i<0||j<0||i>=cx||j>=cz?0:H[i][j];
 const wash=[0xd8b48a,0xcfa47a,0xc89a70,0xdcbc94][Math.floor(r()*4)];
 const cells=[];
 for(let i=0;i<cx;i++)for(let j=0;j<cz;j++){const h=at(i,j);if(!h)continue;const x=x0+cell*(i+.5),z=z0+cell*(j+.5),top=h*SH+(r()-.5)*.25;
  cells.push([x-cell/2,z-cell/2,x+cell/2,z+cell/2]);
  K.color(wash,.92+r()*.14);K.block('adobe',x,0,z,cell+.02,top,cell+.02);
  // a parapet wherever this roof meets air or a lower roof
  K.color(wash,1.02);const pt=.28,ph=.55;
  if(at(i,j-1)<h)K.block('adobe',x,top,z-cell/2+pt/2,cell,ph,pt);
  if(at(i,j+1)<h)K.block('adobe',x,top,z+cell/2-pt/2,cell,ph,pt);
  if(at(i-1,j)<h)K.block('adobe',x-cell/2+pt/2,top,z,pt,ph,cell);
  if(at(i+1,j)<h)K.block('adobe',x+cell/2-pt/2,top,z,pt,ph,cell);
  // the face toward the plaza (+z) or a lower neighbour: vigas under each roof line, doors and windows
  const fz=z+cell/2,front=at(i,j+1);
  if(front<h){for(let s=front;s<h;s++){const yv=(s+1)*SH-.35;K.color(0x6a4a32,1);for(let k=0;k<4;k++)K.beam('wood',[x-cell*.38+k*cell*.25,yv,fz-.3],[x-cell*.38+k*cell*.25,yv-.05,fz+.55],.09,5);
    K.color(null,1);
    if(s===front&&s===0){// a T-door at the ground
     K.block('dark',x,0,fz+.02,.6,1.9,.08);K.block('dark',x,1.05,fz+.02,1.05,.85,.08);K.color(0x6a4a32,1);K.block('wood',x,1.92,fz+.06,1.3,.14,.18);}
    else{K.block('dark',x+(r()-.5)*1.2,s*SH+1.1,fz+.02,.5,.55,.08);}}}
  // small windows on the outer faces of the upper storeys
  K.color(null,1);if(h>1&&at(i-1,j)<h-1&&i===0)K.block('dark',x-cell/2-.02,SH*(h-1)+1.1,z,.08,.45,.45);
  if(h>1&&at(i+1,j)<h-1&&i===cx-1)K.block('dark',x+cell/2+.02,SH*(h-1)+1.1,z,.08,.45,.45);
  // a ladder from this roof to the next room up, where the cell behind stands higher
  const behind=at(i,j-1);if(behind>h&&r()<.7){const lx=x+(r()-.5)*cell*.4,lz=z-cell/2+.55,yA=h*SH,yB=yA+SH+.9;K.color(0x5a3e2a,1);
   K.beam('wood',[lx-.3,yA,lz+.5],[lx-.3,yB,lz-.05],.05,5);K.beam('wood',[lx+.3,yA,lz+.5],[lx+.3,yB,lz-.05],.05,5);
   for(let s=1;s<8;s++){const t=s/8;K.beam('wood',[lx-.3,yA+(yB-yA)*t,lz+.5-.55*t],[lx+.3,yA+(yB-yA)*t,lz+.5-.55*t],.035,4);}}
  // a ladder from the plaza to the first terraces
  if(h===1&&j>0&&(i===0||i===cx-1)&&r()<.5){const sx=i===0?1:-1,lx=x+sx*(cell/2+.45),yB=SH+.9;K.color(0x5a3e2a,1);
   K.beam('wood',[lx,0,z-.3],[lx-sx*.4,yB,z-.3],.05,5);K.beam('wood',[lx,0,z+.3],[lx-sx*.4,yB,z+.3],.05,5);
   for(let s=1;s<8;s++){const t=s/8;K.beam('wood',[lx-sx*.4*t,yB*t,z-.3],[lx-sx*.4*t,yB*t,z+.3],.035,4);}}}
 // the plaza: a beehive oven (horno), a ring of stones round a fire, drying racks
 const px=(r()-.5)*W*.2,pz=z0+cell*1.6+D*.25;K.color(wash,.95);
 K.lathe('adobe',px,0,pz,[[1.1,0],[1.15,.5],[.95,1.1],[.55,1.55],[.15,1.75],[0,1.78]],14);K.color(null,1);K.block('dark',px,0,pz+1.02,.45,.5,.1);
 K.color(0x8a7a6a,1);for(let k=0;k<9;k++){const a=k/9*NOMAD.TAU;K.block('stone',px+3+Math.cos(a)*.7,0,pz+Math.sin(a)*.7,.3,.22,.3);}
 K.color(0x6a4a32,1);const rx=-px*.8,rz=pz+1.5;K.beam('wood',[rx-1.4,0,rz],[rx-1.4,1.8,rz],.05);K.beam('wood',[rx+1.4,0,rz],[rx+1.4,1.8,rz],.05);K.beam('wood',[rx-1.5,1.75,rz],[rx+1.5,1.75,rz],.04);
 K.color(DYE.madder,1);for(let k=0;k<6;k++)K.block('canvas',rx-1.2+k*.48,1.2,rz,.25,.5,.04);   // chillies or cloth on the rack
 return K.finish({kind:'building',name:'Stepped adobe pueblo compound',culture:'eastern-nomad',types:['multi-family dwelling'],
  footprint:NOMAD.rect(W,D,false),height:storeys*SH+.6,family:'pueblo',seed:seed>>>0,cells,plaza:[0,z0+D*.62]});}
// buildCliffPueblo({length,rows,storeys,cell,seed}): rooms built against a cliff
// (Mesa Verde): the back row stands `storeys` high against the rock at z = 0
// (the host sets z = 0 inside the face), each row in front a storey or two
// lower, so the roofs step down to the floor as terraces. Now and then a back
// room climbs a storey higher up the face, and a tower stands out in front.
function buildCliffPueblo({length=12,rows=3,storeys=3,cell=3.6,tower=true,climb=true,seed=1}={}){
 const K=K0(seed),r=K.rnd,cx=Math.max(2,Math.round(length/cell)),cz=Math.max(1,rows),L=cx*cell,D=cz*cell,x0=-L/2;
 const H=[];for(let i=0;i<cx;i++){H.push([]);for(let j=0;j<cz;j++){let h=storeys-Math.round(j*(storeys-1)/Math.max(1,cz-1)*.9)-(r()<.25?1:0);
  if(j===0&&r()<.3&&climb)h+=1;                           // a room that climbs the face (not under an alcove's ceiling)
  if(j===cz-1&&r()<.3)h=0;                                  // a gap in the front row: a court
  H[i].push(Math.max(j===0?2:0,h));}}
 const at=(i,j)=>i<0||j<0||i>=cx||j>=cz?(j<0?99:0):H[i][j];   // behind the back row is the rock
 const wash=[0xc89a70,0xbf9068,0xcfa478,0xb88a62][Math.floor(r()*4)],cells=[];
 // the masonry here is rough stone laid in mud: the walls take the carved stone's
 // strata so they match the cliff they stand against, the plaster only patches
 for(let i=0;i<cx;i++)for(let j=0;j<cz;j++){const h=at(i,j);if(!h)continue;const x=x0+cell*(i+.5),z=cell*(j+.5),top=h*SH+(r()-.5)*.25,stone=r()<.45;
  cells.push([x-cell/2,z-cell/2,x+cell/2,z+cell/2]);
  K.color(stone?null:wash,stone?.82+r()*.12:.9+r()*.14);K.block(stone?'stone':'adobe',x,0,z,cell+.02,top,cell+.02);
  K.color(wash,1.02);const pt=.26,ph=.5;
  if(at(i,j+1)<h)K.block('adobe',x,top,z+cell/2-pt/2,cell,ph,pt);
  if(at(i-1,j)<h)K.block('adobe',x-cell/2+pt/2,top,z,pt,ph,cell);
  if(at(i+1,j)<h)K.block('adobe',x+cell/2-pt/2,top,z,pt,ph,cell);
  const fz=z+cell/2,front=at(i,j+1);
  if(front<h){for(let s=front;s<h;s++){const yv=(s+1)*SH-.35;K.color(0x6a4a32,1);for(let k=0;k<3;k++)K.beam('wood',[x-cell*.3+k*cell*.3,yv,fz-.3],[x-cell*.3+k*cell*.3,yv-.05,fz+.5],.08,5);
    K.color(null,1);
    if(s===front&&(s===0||r()<.5)){K.block('dark',x,s*SH,fz+.02,.55,1.75,.08);K.block('dark',x,s*SH+.95,fz+.02,.95,.8,.08);}
    else K.block('dark',x+(r()-.5)*1,s*SH+1.1,fz+.02,.45,.5,.08);}}
  if(j>0&&at(i,j-1)>h&&r()<.55){const lx=x+(r()-.5)*cell*.4,lz=z-cell/2+.5,yA=h*SH,yB=yA+SH+.9;K.color(0x5a3e2a,1);
   K.beam('wood',[lx-.28,yA,lz+.5],[lx-.28,yB,lz-.05],.045,5);K.beam('wood',[lx+.28,yA,lz+.5],[lx+.28,yB,lz-.05],.045,5);
   for(let s2=1;s2<8;s2++){const t=s2/8;K.beam('wood',[lx-.28,yA+(yB-yA)*t,lz+.5-.55*t],[lx+.28,yA+(yB-yA)*t,lz+.5-.55*t],.03,4);}}}
 // a tower in front: round (Mesa Verde's) or square, a storey above its neighbours
 const hasTower=tower&&cx>=3&&r()<.6;
 if(hasTower){const ti=1+Math.floor(r()*(cx-2)),tx=x0+cell*(ti+.5),tz=D+1.4,th=(storeys+1)*SH,round=r()<.6;K.color(null,.86);
  if(round)K.cyl('stone',tx,0,tz,1.5,1.6,th,14);else K.block('stone',tx,0,tz,2.8,th,2.8);
  K.color(wash,1);if(round)K.cyl('adobe',tx,th,tz,1.55,1.55,.4,14);else K.block('adobe',tx,th,tz,3,.4,3);
  K.color(null,1);for(let s=0;s<storeys+1;s++)K.block('dark',tx,s*SH+1.2,tz+(round?1.52:1.42),.35,.4,.1);K.block('dark',tx,0,tz+(round?1.55:1.45),.6,1.6,.1);
  cells.push([tx-1.6,tz-1.6,tx+1.6,tz+1.6]);}
 return K.finish({kind:'building',name:'Cliff dwelling (pueblo against the rock)',culture:'eastern-nomad',types:['multi-family dwelling'],
  footprint:NOMAD.rect(L,D+(tower?3.2:0),true),height:(storeys+(climb?1:0))*SH+.6,family:'cliffpueblo',seed:seed>>>0,cells});}
// buildPuebloTower({storeys,round,radius,seed}): a watch tower, round or square, rough stone, a flat roof and parapet
function buildPuebloTower({storeys=4,round=true,radius=2.6,seed=1}={}){
 const K=K0(seed),r=K.rnd,th=storeys*SH,R=radius;K.color(null,.84);
 if(round)K.cyl('stone',0,0,0,R,R*1.08,th,18);else K.block('stone',0,0,0,R*1.8,th,R*1.8);
 K.color(0xc89a70,1);if(round){K.cyl('adobe',0,th,0,R*1.04,R*1.04,.5,18);for(let k=0;k<12;k++){const a=k/12*NOMAD.TAU;K.block('adobe',Math.sin(a)*R*.95,th+.5,Math.cos(a)*R*.95,.5,.45,.5,a);}}
 else{K.block('adobe',0,th,0,R*1.9,.5,R*1.9);}
 K.color(null,1);K.block('dark',0,0,R*1.07+.02,.7,1.8,.1);K.block('dark',0,1,R*1.07+.02,1.1,.8,.1);
 for(let s=1;s<storeys;s++){const a=s*2.1;K.box('dark',Math.sin(a)*(R*1.02),s*SH+1.2,Math.cos(a)*(R*1.02),.4,.45,.12,a);}
 K.color(0x6a4a32,1);for(let k=0;k<6;k++){const a=k/6*NOMAD.TAU+.3;K.beam('wood',[Math.sin(a)*R*.9,th-.4,Math.cos(a)*R*.9],[Math.sin(a)*(R+.5),th-.42,Math.cos(a)*(R+.5)],.08,5);}
 return K.finish({kind:'building',name:(round?'Round':'Square')+' watch tower',culture:'eastern-nomad',types:['infrastructure'],
  footprint:NOMAD.circle(R*1.3,16),height:th+.95,family:'tower',seed:seed>>>0});}
window.buildPuebloCompound=buildPuebloCompound;window.buildCliffPueblo=buildCliffPueblo;window.buildPuebloTower=buildPuebloTower;
})();
