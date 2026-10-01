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
window.buildPuebloCompound=buildPuebloCompound;
})();
