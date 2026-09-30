// ================================================================ SEGMENT: tmHeli
// The heliport. Two raised landing pads over the water, each a disc on six
// splayed legs round a central stair drum (a sea-fort's stance), with a
// safety net, a painted H and rim lights; a walkway on piles runs out from
// the quay to the first drum and on to the second, and a stair climbs each
// drum to its pad. On the land apron: a white vaulted hangar with its doors
// open, a small control cab on a stalk, a bunded fuel store with a pipe run
// to the quay, a ground pad and a windsock. Seeds 20320-20324.
//   d=0 intact   white, cyan/green lights, a craft on pad 1 and one in the hangar
//   d=1 ruined   pad 2 collapsed and tilted into the water on its broken legs,
//                the walkway span between the pads down, pad 1 rusting with a
//                wrecked craft on its side, the cab glass gone, the hangar
//                holed and a door down, a fuel tank toppled
//   d=3 reclaimed pad 1 a garden with shacks and a wind turbine, pad 2 a
//                lookout platform with a timber watchtower, a rope bridge over
//                the lost span, fishing huts on the leg bracing, the hangar a
//                boat shed and market, the fuel tanks the village's water
const TMH={LAND:70,SEA:150,YP:PORT.DECK+13,P:[{x:-16,z:62,R:15},{x:20,z:116,R:13}],RD:3.2,HX:-22,HZ:-40,HW:42,HD:30,HH:13};
function tmHeliStamps(o){const d=o.d,h=o.W/2;
 const s=[{kind:'flat',x0:-h,z0:-TMH.LAND,x1:h,z1:0,y:PORT.DECK,soft:40,paint:d>=1?'soil':'pave'},
  {kind:'dig',x0:-h,z0:0,x1:h,z1:TMH.SEA,y:d===1?-8:-12,soft:30}];
 if(d===1)s.push({kind:'fill',poly:[[6,98],[34,102],[38,128],[16,134],[2,118]],y:-3.5,soft:12,paint:'rock'});
 return s.concat(portEdgeStamps(o,{LAND:TMH.LAND,SEA:TMH.SEA}));}
// ---- kit: the craft (length along +x, skids at y 0), a tank, a windsock, a leg
kdef('tmHeliBody',pkMergeGeo([
 new THREE.LatheGeometry([[0,-3],[.45,-2.9],[1,-2.3],[1.3,-1],[1.32,.6],[1.18,1.9],[.8,3.1],[.25,3.7],[0,3.8]].map(p=>new THREE.Vector2(p[0],p[1])),12).scale(1,1,.85).rotateZ(-Math.PI/2).translate(0,1.75,0),
 new THREE.CylinderGeometry(.22,.4,6.2,8).rotateZ(Math.PI/2).translate(-5.8,2.05,0),
 new THREE.BoxGeometry(1.3,1.8,.12).translate(-8.7,2.8,0),new THREE.BoxGeometry(.8,.1,2.4).translate(-8.2,2.05,0),
 new THREE.BoxGeometry(2.2,.5,1.4).translate(-.3,3.1,0)]),MAT.pkPaint);
kdef('tmHeliGlass',new THREE.SphereGeometry(1,10,6,0,TAU,0,Math.PI/2).scale(1.9,1.1,1.05).rotateZ(-.35).translate(2,2.05,0),MAT.darkGlass);
kdef('tmHeliMech',pkMergeGeo([new THREE.CylinderGeometry(.12,.12,.9,6).translate(0,3.7,0),new THREE.BoxGeometry(11.5,.07,.42).translate(0,4.15,0),
 new THREE.BoxGeometry(.42,.07,11.5).translate(0,4.15,0),new THREE.BoxGeometry(.08,1.8,.25).translate(-9.1,2.9,.2),
 new THREE.CylinderGeometry(.07,.07,5.2,5).rotateZ(Math.PI/2).translate(.2,.08,1.15),new THREE.CylinderGeometry(.07,.07,5.2,5).rotateZ(Math.PI/2).translate(.2,.08,-1.15),
 ...[-1.2,1.5].flatMap(x=>[-1,1].map(z=>new THREE.CylinderGeometry(.05,.05,1.1,4).rotateX(z*.5).translate(x,.55,z*.85)))]),MAT.pkIron);
kdef('tmTank',new THREE.LatheGeometry([[0,0],[1,0],[1,.9],[.82,.97],[.4,1],[0,1]].map(p=>new THREE.Vector2(p[0],p[1])),16),MAT.pkPaint);
kdef('tmSock',new THREE.ConeGeometry(.45,2.8,10,1,true).rotateZ(-Math.PI/2).translate(1.4,0,0),MAT.pkCloth);
kdef('tmLeg',new THREE.CylinderGeometry(1,1,1,10),MAT.concrete);kdef('tmLegR',new THREE.CylinderGeometry(1,1,1,10),MAT.concreteR);
// a craft at (x,y,z) heading yaw; d=1 rusted, on its side, rotor gone
function tmCraft(x,y,z,yaw,d,o){o=o||{};let q=qEuler(0,yaw,0),yy=y;
 if(o.side){q=q.multiply(qEuler(1.25,0,0));yy=y+1.1;}
 const c=d>0?new THREE.Color(0x8a6048):(o.col||new THREE.Color(0xf4f2ec));
 kput('tmHeliBody',[x,yy,z],q,1,c);kput('tmHeliGlass',[x,yy,z],q,1,d===1?new THREE.Color(0x303030):null);
 if(!o.side)kput('tmHeliMech',[x,yy,z],q,1,d>0?new THREE.Color(0x7a4a32):null);
 else kput('plank',[x+rr(-4,4),y+.1,z+rr(-4,4)],qEuler(0,rng()*TAU,0),[6,.06,.4],new THREE.Color(0x2a2622));}

function buildTmHeli(scene,gx,gz,d,opt){reseed(20320+d);
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);KOFF=[gx,0,gz];
 const D=PORT.DECK,h=opt.W/2,gl=[],P1=TMH.P[0],P2=TMH.P[1];
 portPaving(G,-h,-TMH.LAND,h,-1.2,d);
 // the quay wall, with the walkway's root let into it (no coping, no fenders there)
 const xq=-6,sq=xq+h;
 const wall=portQuayWall(G,-h,0,h,0,d,{gaps:[[sq-3,sq+3]]});
 portQuayWall(G,xq-3,0,xq+3,0,d,{cope:false,fenders:0,ladders:0,bollards:0});
 portSideClose(G,opt.nb,d,{z0:-TMH.LAND,z1:0});
 tmHeliHangar(G,d);tmHeliFuel(G,d);
 tmCtlTower(G,32,-18,d,gl,{H:14,rb:2.2,rt:1.7,c0:3.6,c1:4.6,ch:3.3,n:10});
 // ---- the pads, their drums and stairs
 const fallen=d===1;
 tmHeliPad(G,d,P1,false);tmHeliPad(G,d,P2,fallen);
 // ---- the walkway on piles: quay -> drum 1 -> drum 2
 const yw=D+.3,RD=TMH.RD;
 const edge=(P,Q,r)=>{const dx=Q[0]-P[0],dz=Q[1]-P[1],L=Math.hypot(dx,dz);return[P[0]+dx/L*r,yw,P[1]+dz/L*r];};
 const W0=[xq,yw,-2],W1=edge([P1.x,P1.z],[xq,-2],RD+.1);
 tmHeliWalk(G,d,W0,W1,true);
 const W2=edge([P1.x,P1.z],[P2.x,P2.z],RD+.1),W3=edge([P2.x,P2.z],[P1.x,P1.z],RD+.1);
 if(d===0)tmHeliWalk(G,d,W2,W3,true);
 else if(d===1){// the span went down: its first third still on its piles, the rest fallen to the seabed
  const c=[W2[0]+(W3[0]-W2[0])*.3,yw,W2[2]+(W3[2]-W2[2])*.3];tmHeliWalk(G,d,W2,c,true);
  const F=tmFallM(c,W3,.6,.15);tmPut(G,boxUV(3.6,.5,F.L*.95,8).translate(0,-.25,F.L*.95/2),CONC(d),F);
  tmWith(F,()=>{for(let z=2;z<F.L*.9;z+=5)if(rng()<.6)kput('pkGuard',[1.7,0,z],qEuler(0,Math.PI/2,rr(-.3,.3)),1,new THREE.Color(0x8a5a3a));});}
 else tmHeliRope(G,W2,W3);
 REGISTER({name:'Heliport walkway',x:(W0[0]+W1[0])/2,z:(W0[2]+W1[2])/2,r:6,h:5,y:D-2});
 if(d<3)REGISTER({name:'Heliport walkway',x:(W2[0]+W3[0])/2,z:(W2[2]+W3[2])/2,r:6,h:d===1?14:5,y:d===1?-6:D-2});
 // ---- the craft
 if(d===0){tmCraft(P1.x+1,TMH.YP,P1.z,.6,d);tmCraft(TMH.HX+2,D,TMH.HZ+2,Math.PI/2+.1,d,{col:new THREE.Color(0xdfe8f0)});}
 if(d===1)tmCraft(P1.x-2,TMH.YP,P1.z+3,1.9,d,{side:true});
 // ---- the land apron: a ground pad, taxi line, windsock, lamps
 const gp=[8,-30],mk=d>0?new THREE.Color(0x9a948a):new THREE.Color(0xf4f2ea),ye=d>0?new THREE.Color(0x9a8a60):new THREE.Color(0xe8c040);
 kput('tmRingMk',[gp[0],D+.07,gp[1]],null,[8,1,8],ye);
 if(!(d===1&&rng()<.5)){kput('tmLine',[gp[0]-1.8,D+.075,gp[1]],qEuler(0,Math.PI/2,0),[6,1,.8],mk);kput('tmLine',[gp[0]+1.8,D+.075,gp[1]],qEuler(0,Math.PI/2,0),[6,1,.8],mk);kput('tmLine',[gp[0],D+.075,gp[1]],null,[3.6,1,.8],mk);}
 for(let z=-24;z<-4;z+=3)if(!(d===1&&rng()<.5))kput('tmLine',[TMH.HX,D+.07,z],qEuler(0,Math.PI/2,0),[1.8,1,.25],ye);
 kput(d>0?'postR':'postW',[44,D+3,-8],null,[.1,6,.1],null);
 if(d!==1)kput('tmSock',[44,D+5.8,-8],qEuler(0,-.7,-.15),1,new THREE.Color(0xf07030));
 for(const x of [-40,-24,14])portLamp(x,D,-2.4,0,d);
 REGISTER({name:'Ground pad',x:gp[0],z:gp[1],r:8,h:4,y:D});
 if(d===0){portFigures(P1.x,TMH.YP,P1.z,5,6);portFigures(-10,D,-20,10,20);portFigures(W0[0]-3,yw,W0[2]+22,3,2);portBuoy(-40,40);portBuoy(40,70);}
 if(d===1){portWeeds(-h+4,-TMH.LAND+4,h-4,-3,160,D);portTrees(-h+8,-66,-h+30,-58,3,D,4,9);portTrees(0,-66,14,-58,2,D,4,8);
  kput('pkSkiff',[34,-1,30],qEuler(.3,.4,Math.PI*.9),1,new THREE.Color(0x6a4a3a));}
 if(d>=3){
  for(const L of wall.ladders){portSkiff(L[0]+rr(-3,3),L[1]+2.6,Math.PI/2+rr(-.15,.15));}
  for(let i=0;i<6;i++){const a=rng()*TAU,P=TMH.P[i%2];portSkiff(P.x+Math.cos(a)*(P.R*.9+3),P.z+Math.sin(a)*(P.R*.9+3),a+Math.PI/2);}
  for(let i=0;i<5;i++)portSkiff(rr(-h+10,h-10),rr(10,40),rng()*TAU);
  // the old craft hauled onto the apron, a lean-to built against it
  tmCraft(20,D,-12,2.4,1);kput('shantyRoof',[20,D+3.3,-9.5],qEuler(.3,2.4,0),[6,1,3.5],null);portStall(24,D,-8,.4);
  portGarden(8,D,-30,14,10,d);portWashLine(-44,-8,-10,-8,5,9);
  portFigures(-20,D,-20,16,18);portFigures(P1.x,TMH.YP,P1.z,6,8);portFigures(P2.x,TMH.YP,P2.z,4,6);
  portWeeds(-h+4,-TMH.LAND+4,h-4,-3,40,D);}
 if(gl.length)meshMerged(gl,MAT.glass,G);
 KOFF=[0,0,0];return G;}

// A walkway span on piles from A to B at deck height: slab, white fascia,
// guard rails, low lamp posts, a pile pair every ~11 m.
function tmHeliWalk(G,d,A,B){const M=tmSpanM(A,B),L=M.L,w=3.6;
 tmPut(G,boxUV(w,.5,L,8).translate(0,-.25,L/2),CONC(d),M);
 for(const s of [-1,1])tmPut(G,boxUV(.2,.8,L,8).translate(s*(w/2+.1),-.35,L/2),d>0?MAT.rust:MAT.white,M);
 tmWith(M,()=>{for(let z=2.5;z<L-1;z+=5)for(const s of [-1,1]){if(d===1&&rng()<.3)continue;
  kput('pkGuard',[s*(w/2-.1),0,z],qEuler(0,Math.PI/2,0),1,d>0?new THREE.Color(0x8a5a3a):null);}
  for(let z=6;z<L-2;z+=12){kput(d>0?'postR':'postW',[w/2-.2,.6,z],null,[.07,1.2,.07],null);if(d===0)kput('dot',[w/2-.2,1.25,z],null,[.3,.2,.3],CYAN);}});
 const n=Math.max(1,Math.round(L/11));
 for(let i=1;i<=n;i++){const t=(i-.5)/n,x=A[0]+(B[0]-A[0])*t,z=A[2]+(B[2]-A[2])*t;if(portH(x,z)>A[1]-2)continue;
  const c=Math.cos(Math.atan2(B[0]-A[0],B[2]-A[2])),s=Math.sin(Math.atan2(B[0]-A[0],B[2]-A[2]));
  for(const k of [-1.3,1.3])tmPier(x+k*c,z-k*s,A[1]-.5,.45,d);
  kput(BOXC(d),[x,A[1]-.75,z],qEuler(0,Math.atan2(B[0]-A[0],B[2]-A[2]),0),[4.2,.5,.9],null);}}

// The rope bridge over the lost span (d=3).
function tmHeliRope(G,a,b){const M=tmSpanM(a,b),L=M.L,n=Math.round(L/.6),sag=3;
 tmWith(M,()=>{for(let i=0;i<=n;i++){const t=i/n;kput('plank',[0,-sag*Math.sin(Math.PI*t),t*L],qEuler(-Math.atan(-sag*Math.PI*Math.cos(Math.PI*t)/L),0,0),[2.2,.07,.45],null);}
  for(const sx of [-1.1,1.1])for(let i=0;i<10;i++){const t0=i/10,t1=(i+1)/10;
   beam('plank',[sx,1-sag*Math.sin(Math.PI*t0),t0*L],[sx,1-sag*Math.sin(Math.PI*t1),t1*L],.05,.05,new THREE.Color(0x6a5a44));}});
 REGISTER({name:'Rope bridge',x:(a[0]+b[0])/2,z:(a[2]+b[2])/2,r:5,h:6,y:a[1]-4});}

// One landing pad at P {x,z,R}: legs, bracing, drum, stair, the disc and its
// markings. `down` (d=1): the disc lies tilted in the water on broken legs,
// the drum snapped, the stair gone above the break.
function tmHeliPad(G,d,P,down){const D=PORT.DECK,YP=TMH.YP,R=P.R,RD=TMH.RD,x=P.x,z=P.z;
 const leg=d>0?'tmLegR':'tmLeg',legC=d>0?new THREE.Color().setHSL(.07,.08,rr(.5,.62)):null;
 // legs: six, splayed, from the seabed to under the disc; a bracing ring above the water
 const legs=[];for(let k=0;k<6;k++){const a=(k+.5)/6*TAU,gy=portH(x+Math.cos(a)*R*.95,z+Math.sin(a)*R*.95)-1;
  legs.push({a,b:[x+Math.cos(a)*R*.95,gy,z+Math.sin(a)*R*.95],t:[x+Math.cos(a)*R*.55,YP-2.6,z+Math.sin(a)*R*.55]});}
 const at=(L,y)=>{const f=(y-L.b[1])/(L.t[1]-L.b[1]);return[L.b[0]+(L.t[0]-L.b[0])*f,y,L.b[2]+(L.t[2]-L.b[2])*f];};
 legs.forEach((L,k)=>{if(down){const y1=rr(-1,4);if(k%3===1){const p=at(L,-2);beam(leg,[p[0],portH(p[0],p[2])+.5,p[2]],[p[0]+rr(-8,8),portH(p[0],p[2])+.9,p[2]+rr(-8,8)],.75,.75,legC);}
   else beam(leg,L.b,at(L,y1),.75,.75,legC);return;}
  beam(leg,L.b,L.t,.75,.75,legC);});
 if(!down)for(let k=0;k<6;k++){const a=at(legs[k],3),b=at(legs[(k+1)%6],3);if(d===1&&rng()<.3)continue;beam(BOXC(d),a,b,.45,.45,null);}
 // the drum (and its broken stump)
 const top=down?rr(2,4):YP-1.4,gy=portH(x,z)-1;
 pbAdd(lathe({rFn:()=>RD,H:top-gy,cut:down?top-gy:null,jag:down?1.2:0,nu:20,nv:down?3:2,seed:x}).translate(x,gy,z),CONC(d),G,true);
 if(!down)kput(SLABC(d),[x,top-.05,z],null,[RD+.05,.1,RD+.05],null);   // a lid over the drum top (hidden under the disc)
 // the door on the walkway side and the spiral stair up the drum
 const aw=Math.atan2(-z,-6-x);   // toward the quay root
 const aw2=Math.atan2(TMH.P[0].z-z,TMH.P[0].x-x);
 const door=P===TMH.P[0]?aw:aw2;
 if(!down)kput('pkDoor',[x+Math.cos(door)*(RD+.05),D+1.3,z+Math.sin(door)*(RD+.05)],qFacing([Math.cos(door),0,Math.sin(door)]),[1.4,2.4,1],d>0?new THREE.Color(0x5a3a2a):new THREE.Color(0x3a4a5a));
 const rs=RD+.8;let a0=door+.55;
 for(let i=0;i<Math.round((YP-D-.3)/2);i++){const y=D+.3+i*2;if(down&&y>top-1)break;if(d===1&&!down&&i===4)continue;
  const a=a0+i*3.5/rs;kput('pkStair',[x+Math.cos(a)*rs,y,z+Math.sin(a)*rs],qEuler(0,-a,0),[1.2,1,1],d>0?new THREE.Color(0x8a6a50):new THREE.Color(0xe0dcd4));
  const a2=a+2.6/rs;kput('plank',[x+Math.cos(a2)*rs,y+2-.06,z+Math.sin(a2)*rs],qEuler(0,-a2,0),[1.3,.12,1.4],d>0?new THREE.Color(0x7a6a58):new THREE.Color(0xd8d4cc));}
 // the disc, in its own frame (top centre at the origin)
 const M=down?tmM([x+rr(-2,2),-1.2,z+rr(-2,2)],rng()*TAU,-.42,.1):tmM([x,YP,z],0,0,0);
 const hole=d>0?holeFn(d,x*.1,null,1.6):null;
 tmPut(G,new THREE.CylinderGeometry(R,R-.7,1.4,40,1).translate(0,-.7,0),CONC(d),M,down);
 tmPut(G,new THREE.CircleGeometry(R-.3,40).rotateX(-Math.PI/2).translate(0,.03,0),MAT.tmPad,M,down);
 tmPut(G,new THREE.CylinderGeometry(R*.62,R*.62,1.8,24,1,true).translate(0,-2.1,0),CONC(d),M,down);
 tmPut(G,gridSurface((u,v)=>{const a=u*TAU,r=R+.1+v*1.7;return[Math.cos(a)*r,-.3-v*.45,Math.sin(a)*r];},40,2,
  {uS:R,vS:.3,hole:(u,v)=>d>0&&(d===1||hole(u*4,v*9))&&fbm(u*9,v*3,x,2)<(d===1?.62:.4)}),MAT.pkSteel,M,down);
 const g0=RD+2.2,g1=R*.9;
 tmWith(M,()=>{for(let k=0;k<8;k++){const a=k/8*TAU;kput(BOXC(d),[Math.cos(a)*(g0+g1)/2,-1.9,Math.sin(a)*(g0+g1)/2],qEuler(0,-a,0),[g1-g0,1,.6],null);}
  const fade=d>0?.55:0,ye=new THREE.Color(0xe8c040).lerp(new THREE.Color(0x6a6660),fade),wh=new THREE.Color(0xf4f2ea).lerp(new THREE.Color(0x6a6660),fade);
  kput('tmRingMk',[0,.06,0],null,[R*.68,1,R*.68],ye);kput('tmRingMk',[0,.06,0],null,[R-.9,1,R-.9],wh);
  if(!(d===1&&rng()<.4)){kput('tmLine',[-2.2,.07,0],qEuler(0,Math.PI/2,0),[7.5,1,1.1],wh);kput('tmLine',[2.2,.07,0],qEuler(0,Math.PI/2,0),[7.5,1,1.1],wh);}
  kput('tmLine',[0,.07,0],null,[3.3,1,1.1],wh);
  for(let k=0;k<16;k++){const a=k/16*TAU;if(d===1)continue;
   kput(d===0?'dot':'cellD',[Math.cos(a)*(R-.4),.12,Math.sin(a)*(R-.4)],qEuler(0,-a,0),[.3,.2,.3],d===0?(k%2?new THREE.Color(0x40ff90):CYAN):null);}
  if(d===1){for(let k=0;k<Math.round(R*1.5);k++){const a=rng()*TAU,r=Math.sqrt(rng())*(R-1);kput('moss',[Math.cos(a)*r,.1,Math.sin(a)*r],null,[rr(.5,1.8),.12,rr(.5,1.6)],new THREE.Color().setHSL(rr(.2,.3),.4,rr(.08,.14)));}
   if(!down)VEG.tree(rr(-R*.4,R*.4),0,rr(-R*.4,R*.4),1,rr(4,6));
   for(let k=0;k<5;k++){const a=rng()*TAU;kput('vine',[Math.cos(a)*(R-.2),-.2,Math.sin(a)*(R-.2)],null,[1,rr(3,8),1],null);}}});
 if(down){portRubble(x,portH(x,z),z,8,24);}
 if(d>=3)tmHeliPadLife(G,d,P);
 REGISTER({name:down?'Collapsed landing pad':'Landing pad',x,z,r:R+1.6,h:down?12:YP-D+2,y:down?-8:D});}

// Reclaimed life on a pad: pad 1 a garden with shacks and a wind turbine,
// pad 2 a lookout with a timber watchtower. Both: fishing huts on the
// bracing ring, boats below.
function tmHeliPadLife(G,d,P){const YP=TMH.YP,x=P.x,z=P.z,R=P.R,first=P===TMH.P[0];
 const ring=u=>[x+Math.cos(u*TAU)*(R-1.4),z+Math.sin(u*TAU)*(R-1.4)];
 tmHedgeRing(ring,Math.round(R*1.6),YP,d,p=>p[1]<z-R*.5&&Math.abs(p[0]-x)<5);
 for(let k=0;k<3;k++){const a=rr(0,TAU),r=R-4;kput('shantyBox',[x+Math.cos(a)*r,YP+1.3,z+Math.sin(a)*r],qEuler(0,-a,0),[rr(3,4.5),2.6,rr(2.6,3.4)],null);
  kput('shantyRoof',[x+Math.cos(a)*r,YP+2.8,z+Math.sin(a)*r],qEuler(rr(.1,.25),-a,0),[5.2,1,4.2],null);kput('dot',[x+Math.cos(a)*(r-1.8),YP+1.6,z+Math.sin(a)*(r-1.8)],qEuler(0,-a,0),[.7,.7,.4],WARM);}
 if(first){portGarden(x,YP,z,14,11,d);portGarden(x+4,YP,z-6,8,4,d);
  // a wind turbine at the rim
  const tx=x+R*.6,tz=z+R*.45;kput('pkCol',[tx,YP,tz],null,[.22,12,.22],new THREE.Color(0xb0a898));kput('boxR',[tx,YP+12.2,tz],null,[.8,.6,1.4],null);
  for(let k=0;k<3;k++){const a=k/3*TAU+.3;kput('plank',[tx+Math.cos(a)*2.1,YP+12.2+Math.sin(a)*2.1,tz+.8],qEuler(0,0,a-Math.PI/2),[.35,4.2,.08],new THREE.Color(0xd8d0c0));}
  portWashLine(x-R*.6,z+2,x+2,z+R*.7,YP+2,8);}
 else{// the watchtower: four timber legs, a deck at 8 m, a hut and a roof, a ladder
  const wx=x-2,wz=z+2;for(const [ox,oz] of [[-1.6,-1.6],[1.6,-1.6],[-1.6,1.6],[1.6,1.6]])kput('pkPile',[wx+ox,YP,wz+oz],qEuler(-oz*.02,0,ox*.02),[.16,8.2,.16],null);
  for(const y of [3,6])for(const [a,b] of [[[-1.6,-1.6],[1.6,1.6]],[[1.6,-1.6],[-1.6,1.6]]])beam('plank',[wx+a[0],YP+y-2.6,wz+a[1]],[wx+b[0],YP+y,wz+b[1]],.1,.1,null);
  kput('plank',[wx,YP+8.1,wz],null,[4.6,.2,4.6],null);kput('shantyBox',[wx,YP+9.4,wz],qEuler(0,.3,0),[3,2.4,3],null);
  kput('shantyRoof',[wx,YP+10.8,wz],qEuler(.12,.3,0),[4.4,1,4.4],null);kput('pkLadder',[wx+1.9,YP+8.2,wz],qEuler(0,Math.PI/2,0),[1,.85,1],null);
  kput('dot',[wx,YP+9.6,wz+1.55],null,[.8,.6,.3],WARM);portFigures(wx,YP+8.2,wz,2,1.2);
  for(let k=0;k<6;k++){const a=k/6*TAU+.2;kput('pkSolar',[x+Math.cos(a)*(R-3),YP+.7,z+Math.sin(a)*(R-3)],qEuler(0,-a,0).multiply(qEuler(-.5,0,0)),[1.4,1,1.4],null);}
  kput('pkDish',[x+R*.5,YP,z-R*.3],qEuler(0,2,0),[2,2,2],null);
  portContainerHouse(G,x+R*.4,YP,z-R*.35,.9,d,{levels:1,big:false});}
 // fishing huts on a plank ring over the bracing, nets hanging
 const yr=3.4;for(let k=0;k<10;k++){const a=k/10*TAU;kput('plank',[x+Math.cos(a)*(R*.62),yr,z+Math.sin(a)*(R*.62)],qEuler(0,-a,0),[2.6,.18,R*.4],null);}
 for(let k=0;k<3;k++){const a=k/3*TAU+.8,r=R*.62;kput('shantyBox',[x+Math.cos(a)*r,yr+1.2,z+Math.sin(a)*r],qEuler(0,-a,0),[3.4,2.2,3],null);
  kput('shantyRoof',[x+Math.cos(a)*r,yr+2.5,z+Math.sin(a)*r],qEuler(.15,-a,0),[4.4,1,4],null);
  kput('pkCloth',[x+Math.cos(a+.5)*(R*.75),yr,z+Math.sin(a+.5)*(R*.75)],qEuler(0,-a-.5,0),[3,2.6,1],new THREE.Color(0x6a7a6a));}}

// The hangar: an elliptic white vault along z, doors open to the sea side.
function tmHeliHangar(G,d){const D=PORT.DECK,x0=TMH.HX-TMH.HW/2,W=TMH.HW,z0=TMH.HZ-TMH.HD/2,Dp=TMH.HD,H=TMH.HH,dh=9;
 const yv=u=>H*Math.pow(Math.max(0,1-Math.pow(Math.abs(2*u-1),2.4)),1/2.4),shell=SHELL(d),hole=d>0?holeFn(d,77,null,1.3):null;
 pbAdd(gridSurface((u,v)=>[x0+u*W,D+yv(u),z0+v*Dp],26,8,{uS:W/8,vS:Dp/8,hole:hole?(u,v)=>hole(u*3,v*60):null}),shell,G);
 for(let k=0;k<=5;k++){const zz=z0+k*Dp/5;pbAdd(gridSurface((u,v)=>{const y=yv(u)+.35;return[x0-.3+u*(W+.6),D+y,zz-.4+v*.8];},26,1,{uS:W/8,vS:.1}),shell,G);}
 // back wall
 pbAdd(gridSurface((u,v)=>[x0+u*W,D+v*yv(u),z0],26,2,{uS:W/8,vS:H/8}),shell,G);
 // front gable over the door, and piers either side of it
 pbAdd(gridSurface((u,v)=>{const y=yv(u);return[x0+u*W,D+Math.min(dh,y)+v*Math.max(0,y-dh),z0+Dp];},26,2,{uS:W/8,vS:.5}),shell,G);
 for(const s of [0,1])pbBox(G,shell,s?x0+W-1.5:x0+1.5,D+dh*.42,z0+Dp-.2,3,dh*.84,.4,0,8);
 if(d===0)kput('strip',[x0+W/2,D+dh+.3,z0+Dp+.1],null,[W-10,1.4,1],CYAN);
 kput(d>0?'plateR':'plateW',[x0+W/2,D+dh+.2,z0+Dp],null,[W-4,.5,.6],null);
 // the doors: four leaves slid open to the sides (d=1 one fallen flat, d=3 tarp curtains)
 const lw=(W-6)/4;
 for(const s of [-1,1])for(let k=0;k<2;k++){const cx=x0+W/2+s*(W/2-3-lw/2-k*.5),cz=z0+Dp+.5+k*.35;
  if(d===1&&s>0&&k===1){kput('plateR',[cx-s*6,D+.25,cz+5],qEuler(0,.15,0),[lw,.4,dh],null);continue;}
  if(d>=3&&k===1){kput('patchTarp',[x0+W/2+s*(lw*.9),D+dh/2,z0+Dp+.6],qEuler(0,0,s*.04),[lw*1.5,dh*.95,1],null);continue;}
  kput(d>0?'plateR':'plateW',[cx,D+dh/2,cz],null,[lw,dh,.3],null);}
 // inside: dark floor band at the back, a workbench
 kput('boxD',[x0+W/2,D+2,z0+1.2],null,[W-6,4,1.6],null);
 if(d===1){portRubble(x0+W*.3,D,z0+Dp*.5,5,12);portWeeds(x0+2,z0+2,x0+W-2,z0+Dp-2,30,D);portTrees(x0+W*.6,z0+Dp*.3,x0+W*.8,z0+Dp*.6,1,D,6,9);}
 if(d>=3){for(let k=0;k<8;k++)portStall(x0+6+k*(W-12)/7,D,z0+Dp-6,Math.PI+rr(-.1,.1));
  for(let k=0;k<3;k++){const bx=x0+8+k*12;kput('pkSkiff',[bx,D+.7,z0+Dp*.4],qEuler(0,rr(-.2,.2),0),1,PK_BOAT_COL[k+1]);
   kput('plank',[bx,D+.35,z0+Dp*.4-1.5],null,[1.4,.7,.3],null);kput('plank',[bx,D+.35,z0+Dp*.4+1.5],null,[1.4,.7,.3],null);}
  kput('dot',[x0+W/2,D+dh-1,z0+Dp-1],null,[1,1,1],WARM);portFigures(x0+W/2,D,z0+Dp-4,10,W*.35);}
 REGISTER({name:'Hangar',x:x0+W*.27,z:TMH.HZ,r:Dp/2,h:H+1,y:D});REGISTER({name:'Hangar',x:x0+W*.73,z:TMH.HZ,r:Dp/2,h:H+1,y:D});}

// The fuel store: three tanks in a bund, a pump house, a pipe run to the quay.
function tmHeliFuel(G,d){const D=PORT.DECK,bx0=18,bx1=44,bz0=-60,bz1=-44,wh=1.3,mat=CONC(d);
 pbBox(G,mat,(bx0+bx1)/2,D+wh/2,bz0,bx1-bx0,wh,.5,0,8);pbBox(G,mat,(bx0+bx1)/2,D+wh/2,bz1,bx1-bx0,wh,.5,0,8);
 pbBox(G,mat,bx0,D+wh/2,(bz0+bz1)/2,.5,wh,bz1-bz0,0,8);pbBox(G,mat,bx1,D+wh/2,(bz0+bz1)/2,.5,wh,bz1-bz0,0,8);
 const tc=d>0?new THREE.Color(0x9a6a50):new THREE.Color(0xf2f0ea);
 [[23.5,-52],[31,-52],[38.5,-52]].forEach(([x,z],k)=>{
  if(d===1&&k===1){kput('tmTank',[x-1,D+2.8,z+1],qEuler(0,.5,Math.PI/2*.97),[2.8,7.5,2.8],tc);return;}
  const c=d>=3?new THREE.Color().setHSL(rr(.5,.6),.25,.55):tc;
  kput('tmTank',[x,D,z],null,[2.8,7.5,2.8],c);kput(d>0?'ringR':'ringW',[x,D+5.8,z],qEuler(Math.PI/2,0,0),[2.85,2.85,2],null);
  if(d===0)kput('strip',[x,D+6.6,z+2.75],null,[2,1,1],CYAN);
  kput('pkLadder',[x+2.85,D+7.6,z],qEuler(0,Math.PI/2,0),[1,.76,1],d>0?new THREE.Color(0x8a5a3a):null);});
 kput(BOXC(d),[41,D+1.5,-40.5],null,[4,3,3.4],null);kput('pkDoor',[39,D+1.1,-40.5],qEuler(0,-Math.PI/2,0),[1,2.1,1],null);
 // the pipe run on a low rack to the quay
 const px=42,za=-44,zb=-3;for(const [o,c] of [[-.35,0],[.35,1]])kput(d>0?'pipeR':'pipe',[px+o,D+1.6,(za+zb)/2],qEuler(Math.PI/2,0,0),[.16,zb-za,.16],null);
 for(let z=za+2;z<zb;z+=5){kput(d>0?'postR':'postW',[px,D+.7,z],null,[.1,1.4,.1],null);kput(BOXC(d),[px,D+1.4,z],null,[1.4,.15,.2],null);}
 if(d===0){tmTruck(34,D,-34,Math.PI/2+.02,d,{box:false,col:new THREE.Color(0xe0dcd0)});kput('tmTank',[34,D+2.6,-37.6],qEuler(Math.PI/2,0,0),[1.2,11,1.2],null);}
 if(d>=3){portGarden(31,D,-40,14,5,d);for(let k=0;k<3;k++)kput('pkCloth',[23.5+k*7.5,D+2.4,-49.2],null,[1.6,1.8,1],new THREE.Color().setHSL(rng(),.4,.55));}
 REGISTER({name:'Fuel store',x:31,z:-52,r:8,h:9,y:D});}

PORT_SEG({key:'tmHeli',name:'Heliport',cls:'seg',W:110,LAND:TMH.LAND,SEA:TMH.SEA,decays:[0,1,3],stamps:tmHeliStamps,build:buildTmHeli});
