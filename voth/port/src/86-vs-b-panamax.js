// ================================================================ vsPanamax: a 260 m Panamax container ship
// Built by the container-ship kit in 86-vs-a-feeder.js. Superstructure a
// quarter-length from the stern (a "3/4 aft" house) with the funnel behind
// it; twelve bays forward of it, two aft; six tiers on deck.
//   d=1 ruined    aground by the stern, listing to starboard, holed
//   d=3 reclaimed the TERRACED GARDEN SHIP: the forward stacks cut down into
//                 terraces that step up from the bow to the house, every
//                 terrace a garden (crops, orchards, greenhouses, rain tanks,
//                 windmills), homes cut into the terrace fronts and the
//                 outboard faces, vines hanging down the hull, the two bow
//                 holds filled with earth and planted as orchards, the house
//                 hung with shacks and hanging gardens. Seeds 20510-20514.
const VS_PANAMAX={key:'vsPanamax',name:'Panamax container ship',L:260,B:32,T:12,F:7,sb:.55,sa:.62,fc:3,nu:90,rows:12,hc:1.6,
 boot:MAT.vsBootB,mat:MAT.vsHullG,zones:[[-118,-81],[-54,107.5]],
 tiers:z=>z>80?4:z>50?5:6,
 house:{z:-64,dp:15,w:24,n:8,sh:2.8,step:1.2,bw:32,bdp:7,se:5},
 funnel:{z:-76.5,w:8,dp:6,h:30},
 ruin:{parts:[{roll:-.12,pitch:-.028,sink:-3}],holes:8},ruinTrees:10};
// terrace height (tiers) of a forward bay: two bays per step, rising aft
function vsPmTerr(S,z){const fw=S.bays.filter(b=>b>-60);const j=fw.length-1-fw.indexOf(z);return j<0?-1:Math.floor(j/2);}
// a small wind pump / turbine: mast, nacelle facing yaw, three blades
function vsWindmill(x,y,z,h,yaw){kput('postR',[x,y+h/2,z],null,[.22,h,.22],VS_RAIL);
 const hx=x+Math.sin(yaw)*.9,hz=z+Math.cos(yaw)*.9;kput('boxR',[x,y+h,z],vsQ(yaw),[.7,.7,2],null);
 const a0=rr(0,TAU),L=4.2;for(let k=0;k<3;k++){const a=a0+k*TAU/3,dx=-Math.sin(a)*L/2;
  kput('plank',[hx+Math.cos(yaw)*dx,y+h+Math.cos(a)*L/2,hz-Math.sin(yaw)*dx],vsQ(yaw,0,a),[.35,L,.08],new THREE.Color(0xe8e0d0));}}
// a greenhouse: timber frame and glass, long axis along z
function vsGreenhouse(x,y,z,w,dp){const n=Math.max(2,Math.round(dp/2.4));
 for(let i=0;i<=n;i++){const zz=z-dp/2+i*dp/n;for(const sd of [-1,1])kput('postR',[x+sd*w/2,y+1.1,zz],null,[.06,2.2,.06],VS_RAIL);}
 for(let i=0;i<n;i++){const zz=z-dp/2+(i+.5)*dp/n;for(const sd of [-1,1]){
  kput('pane',[x+sd*w/2,y+1.1,zz],vsQ(Math.PI/2),[dp/n*.96,2.1,1],null);
  kput('pane',[x+sd*w/4,y+2.5,zz],vsQ(Math.PI/2,-sd*1.07,0),[dp/n*.96,w*.58,1],null);}}
 for(let i=0;i<n*2;i++)kput('leafCard',[x+rr(-w*.35,w*.35),y+.5,z+rr(-dp*.45,dp*.45)],qEuler(0,rng()*TAU,0),[rr(.4,.7),rr(.35,.6),rr(.4,.7)],new THREE.Color().setHSL(rr(.22,.32),.5,rr(.45,.6)));}
// a terrace top: soil, crop rows or an orchard, a path, a hedge at the front edge
function vsTerrace(C,S,z,y,w,o){o=o||{};const par=C.at(z);pbBox(par,MAT.vsSoil,0,y+.25,z,w,.5,12.6,0,8);const top=y+.5;
 const kind=o.kind||(rng()<.45?'crops':rng()<.6?'orchard':'glass');
 if(kind==='crops'){for(let x=-w/2+1.4;x<w/2-1;x+=1.6){if(Math.abs(x)<1)continue;for(let k=0;k<4;k++)kput('leafCard',[x+rr(-.2,.2),top+.35,z+rr(-5.6,5.6)],qEuler(0,rng()*TAU,0),[rr(.5,.9),rr(.3,.5),rr(.5,.9)],new THREE.Color().setHSL(rr(.18,.3),rr(.4,.65),rr(.4,.6)));}}
 else if(kind==='orchard'){for(let i=0;i<4;i++)VEG.tree(rr(-w*.38,w*.38),top,z+rr(-4.5,4.5),i%3,rr(4,7.5));portWeeds(-w/2+1,z-5.5,w/2-1,z+5.5,10,top);}
 else{vsGreenhouse(-w*.25,top,z,w*.38,10.4);vsGreenhouse(w*.25,top,z,w*.38,10.4);}
 kput('plank',[0,top+.03,z],null,[1.4,.06,12.4],new THREE.Color(0xb8a888));
 for(let x=-w/2+.6;x<w/2;x+=2.2)kput('hedge',[x+1.1,top+.35,z+6.1],null,[2,.7,.5],new THREE.Color(0x4a7a3a));
 if(rng()<.5)kput('waterButt',[w/2-1.4,top+1.2,z-4.8],null,[1.2,2.4,1.2],null);
 if(rng()<.35)portFigures(0,top,z,3,4);
 return top;}
function vsPanamaxTown(C,S){const hb=S.hb,yb=S.yb,H=S.house,hs=S.hs,fw=S.bays.filter(b=>b>-60),aft=S.bays.filter(b=>b<=-60);
 // --- forward: terraces stepping up from the bow; bays at level 0 are the hold orchards
 for(const z of fw){C.at(z);const nr=S.rowsAt(z),xw=(nr-1)/2*VS.RP,w=nr*VS.RP+.4,nt=vsPmTerr(S,z);
  if(nt===0){ // the hold, filled with earth to the coaming and planted
   const par=C.at(z);for(const sd of [-1,1]){pbBox(par,MAT.vsRust,sd*(w/2+.2),S.F+1,z,.4,2,12.9,0,8);pbBox(par,MAT.vsRust,0,S.F+1,z+sd*6.5,w+.8,2,.4,0,8);}
   pbBox(par,MAT.vsSoil,0,S.F+1.2,z,w,.4,12.6,0,8);
   for(let i=0;i<5;i++)VEG.tree(rr(-w*.4,w*.4),S.F+1.4,z+rr(-5,5),i%3,rr(7,12));
   portGarden(0,S.F+1.4,z,w*.8,10,3);portFigures(0,S.F+1.4,z,3,5);continue;}
  const q=vsQ(Math.PI/2),zf=z+6.1;let col=null;
  for(let r=0;r<nr;r++){const x=(r-(nr-1)/2)*VS.RP,edge=r===0||r===nr-1;
   for(let t=0;t<nt;t++){const y=yb+t*VS.TP;
    if(edge)vsHome(x,y,z,Math.PI/2,true,{sides:[x>0?1:-1],door:false,lit:.4});
    else{col=vsCC(col);kput('pkCont40R',[x,y,z],q,1,col.clone().lerp(new THREE.Color(0x8a6a50),.25));}}}
  // homes in the terrace FRONT only where this bay is the step (the next bay forward is lower)
  const zn=fw[fw.indexOf(z)+1],step=zn!=null&&vsPmTerr(S,zn)<nt;
  if(step)for(let r=0;r<nr;r++){const x=(r-(nr-1)/2)*VS.RP;for(let t=vsPmTerr(S,zn);t<nt;t++){const y=yb+t*VS.TP;const lit=rng()<.45;
   if(rng()<.8)kput(lit?'dot':'cellD',[x,y+1.45,zf+.08],null,lit?[.8,1.1,.3]:[1,1,.25],lit?WARM:null);
   if(r%3===1&&t===vsPmTerr(S,zn))kput('pkDoor',[x+.6,y+1.05,zf+.06],null,[.9,2,1],new THREE.Color().setHSL(rr(0,1),.35,.35));
   if(r%4===0)kput('pkAwn',[x,y+2.4,zf+.8],vsQ(0,.25),[2.4,1,1.5],vsPaint());}
   for(let k=0;k<5;k++)kput('vine',[rr(-xw,xw),yb+nt*VS.TP+.5,zf+.35],null,[1,rr(1.5,4),1],null);}
  const top=vsTerrace(C,S,z,yb+nt*VS.TP,w,{kind:step&&rng()<.5?'orchard':null});
  // vines down the outboard faces, from the terrace edge
  for(const sd of [-1,1])for(let k=0;k<4;k++)kput('vine',[sd*(w/2+.1),top,z+rr(-5.5,5.5)],null,[1.2,rr(2,nt*VS.TP),1.2],null);}
 // stairs up the centreline, one flight per step
 fw.forEach((z,i)=>{const zn=fw[i+1];if(zn==null)return;const a=vsPmTerr(S,z),b=vsPmTerr(S,zn);if(a<=b)return;
  C.at(z);const yl=b===0?S.F+1.4:yb+b*VS.TP+.5,yh=yb+a*VS.TP+.5;kput('pkStair',[0,yl,z+6.3+(yh-yl)*1.2],vsQ(Math.PI),[1.5,(yh-yl)/2,(yh-yl)*1.2/2.4],null);});
 // windmills and rain tanks on the high terraces
 const hi=fw.filter(z=>vsPmTerr(S,z)>=4);hi.forEach((z,i)=>{C.at(z);const top=yb+vsPmTerr(S,z)*VS.TP+.5;vsWindmill((i%2?1:-1)*(hb-5),top,z-3,rr(9,13),rr(-.4,.4));
  kput('waterButt',[(i%2?-1:1)*(hb-5),top+1.8,z+2],null,[2,3.6,2],null);});
 const fz0=fw[fw.length-1],fz1=fw[0];
 C.reg('Garden ship — terraces',0,(fz0+fz1)/2,(fz1-fz0)/2+7,20,S.F);
 // --- aft of the house: two bays of stacked homes, a garden and a tank on top
 for(const z of aft){C.at(z);const nr=S.rowsAt(z);for(let r=0;r<nr;r++){const x=(r-(nr-1)/2)*VS.RP,nt=3;
   for(let t=0;t<nt;t++)vsHome(x,yb+t*VS.TP,z,Math.PI/2,true,{sides:[1,-1],door:t===0&&rng()<.5,lit:.35});}
  portGarden(0,yb+3*VS.TP,z,nr*VS.RP*.8,10,3);VEG.tree(rr(-5,5),yb+3*VS.TP,z,1,rr(5,8));
  for(let i=0;i<3;i++)vsShack(rr(-.4,.4)*nr*VS.RP,yb+3*VS.TP,z+rr(-4,4),rr(2.4,3.2),rr(2.4,3.2),2.4,rr(0,TAU),{});}
 C.reg('Garden ship — aft homes',0,(aft[0]+aft[aft.length-1])/2,(aft[aft.length-1]-aft[0])/2+7,14,S.F);
 // --- the house: shacks, hanging gardens on every terrace, trees and a windmill on the roof
 vsHouseTown(C,S,hs,H,{dens:.28});
 for(const T of hs.tiers){if(T!==hs.tiers[hs.tiers.length-1])for(let i=0;i<8;i++){const a=rr(0,TAU),r=se(a,H.se);kput('planter',[Math.cos(a)*r*(T.w/2-.6),T.y+T.h+.3,T.cz+Math.sin(a)*r*(T.dp/2-.6)],vsQ(Math.PI/2-a),[2.2,.6,.8],null);
   kput('leafCard',[Math.cos(a)*r*(T.w/2-.6),T.y+T.h+.9,T.cz+Math.sin(a)*r*(T.dp/2-.6)],qEuler(0,rng()*TAU,0),[1,.6,1],new THREE.Color().setHSL(rr(.22,.32),.5,.5));}
  for(let i=0;i<10;i++){const a=rr(0,TAU),r=se(a,H.se);kput('vine',[Math.cos(a)*r*T.w/2*1.03,T.y+T.h,T.cz+Math.sin(a)*r*T.dp/2*1.03],null,[1.3,rr(2,T.h*1.4),1.3],null);}}
 {const y=hs.top,bz=hs.bz;for(let i=0;i<5;i++)VEG.tree(rr(-H.bw*.42,H.bw*.42),y,bz+rr(-2,2),i%3,rr(5,9));
  vsWindmill(0,y,bz-1.5,8,.2);portGarden(-8,y,bz,8,4,3);portGarden(8,y,bz,8,4,3);vsGlow(0,y+2,bz,4);
  vsShack(-12,y,bz-1,3,3,2.4,.1,{});vsShack(12,y,bz,3,3,2.4,-.1,{});portFigures(0,y,bz,4,6);}
 {const fz=S.funnel.z;C.at(fz);kput('waterButt',[0,S.F+30+2.2,fz],null,[3,4.4,3],null);portWashLine(-6,fz-3,-12,H.z-H.dp/2,S.F+9,8);}
 // --- the forecastle: a grove and a lookout; vine curtains down the hull
 {const z=S.L2*.82;C.at(z);const y=S.ydz(z);for(let i=0;i<5;i++)VEG.tree(rr(-.5,.5)*S.bdz(z),S.ydz(z+rr(-6,6)),z+rr(-6,6),i%3,rr(6,10));
  vsShack(0,y,z+10,2.8,2.8,2.4,0,{});portWeeds(-6,z-8,6,z+8,20,y);}
 for(let i=0;i<S.L*.45;i++){const s=rr(-.55,.6),sd=rng()<.5?1:-1,z=s*S.L2;C.at(z);const p=S.side(s,1,sd);
  kput('vine',[p[0]+sd*.25,p[1]+.2,p[2]],qEuler(rr(-.06,.06),0,rr(-.06,.06)),[1.4,rr(2,S.F*.9),1.4],null);}
 vsReclaimHull(C,S,{boats:14});}
Object.assign(VS_PANAMAX,{town:vsPanamaxTown,noHatchAt:(z,S)=>vsPmTerr(S,z)===0});
function buildVsPanamax(scene,gx,gz,d,opt){reseed(20510+d);return vsShip(scene,gx,gz,d,opt,VS_PANAMAX);}
PORT_VESSEL({key:'vsPanamax',name:'Panamax container ship',cls:'vessel',W:220,LAND:0,SEA:0,decays:[0,1,3],length:260,beam:32,draft:12,norepair:true,
 stamps:()=>[],build:buildVsPanamax});
