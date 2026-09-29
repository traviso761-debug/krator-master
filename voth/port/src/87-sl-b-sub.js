// ================================================================ VESSEL: slSub
// An Ancient submarine, 150 m, surfaced: a pale teardrop hull riding low with
// a flat casing along its back, a tall streamlined sail with planes, an
// X-tail and a pump-jet shroud, a cyan light line along the casing.
// Frame: origin midship on the waterline, bow +z. Seeds 20610-20614.
//   d=0 intact    pale grey panels, cyan lights, crew on the casing
//   d=1 ruined    half-sunk, rolled 35 degrees, down by the bow; hull plates
//                 peeled back off a dark interior, a tail fin gone, weed and rust
//   d=3 reclaimed houses on a plank deck over the casing, the sail a lookout
//                 tower with a hut and a flag, rafts lashed alongside, boats
const SLS={L:150,R:6.5,YC:-3.4,Z0:-75,Z1:75,SZ:22};
MAT.slSub=new THREE.MeshStandardMaterial({map:TEX.panel,roughnessMap:TEX.panelRM,metalnessMap:TEX.panelRM,color:0xb4bcc2,metalness:1,roughness:1,side:DS});
function slSubR(z){const R=SLS.R;if(z>40)return R*Math.sqrt(Math.max(0,1-Math.pow((z-40)/35,2)));
 if(z<-25)return Math.max(.7,R*(1-Math.pow((-25-z)/50,1.7)));return R;}
function slSubHull(H,d){const nu=60,nv=24,Z=u=>SLS.Z0+u*(SLS.Z1-SLS.Z0),sh=d>0?MAT.rust:MAT.slSub,sd=rr(0,40);
 const P=(u,v,k)=>{const z=Z(u),r=slSubR(z)*k,a=v*TAU;return[r*Math.cos(a),SLS.YC+r*Math.sin(a),z];};
 const hole=d===1?(u,v)=>{const z=Z(u);return z>-60&&z<62&&fbm(z/11+sd,v*5.5,sd,3)<.34;}:d>=3?(u,v)=>{const z=Z(u);return z>-50&&z<50&&fbm(z/9+sd,v*6,sd,3)<.12;}:null;
 pbAdd(gridSurface((u,v)=>P(u,v,1),nu,nv,{uS:19,vS:5,hole}),sh,H);
 if(hole)pbAdd(gridSurface((u,v)=>P(u,v,.94),nu,nv),MAT.winDead,H,true);
 // the casing along the back and the sail
 pbBox(H,sh,0,SLS.YC+SLS.R+.1,-2,5.2,.6,96,0,8);
 const sz=SLS.SZ,pl=slPlan(0,sz,3.4,19,2.2,1.5,28);
 pbAdd(slPrism(pl,SLS.YC+SLS.R-.4,10.4),sh,H);
 pbAdd(slPrism(slPlan(0,sz,3.52,19.12,2.2,1.5,28),11.8,.8),WIN(d),H);
 for(const s of [-1,1])pbAdd(boxUV(5.2,.35,3.2,8).translate(s*4.2,9.4,sz+4),sh,H);
 // X-tail and the pump-jet shroud
 const tz=-63,tr=slSubR(tz);
 for(let k=0;k<4;k++){if(d===1&&k===1)continue;const a=Math.PI/4+k*Math.PI/2,g=boxUV(.4,5.6,7,8).translate(0,tr+2.6,0);g.rotateZ(a);g.translate(0,SLS.YC,tz);pbAdd(g,sh,H);}
 const sr=new THREE.CylinderGeometry(2.5,2.2,5,18,1,true);sr.rotateX(Math.PI/2);sr.translate(0,SLS.YC,-73);pbAdd(sr,sh,H);
 const hb=new THREE.ConeGeometry(1.2,4,10);hb.rotateX(-Math.PI/2);hb.translate(0,SLS.YC,-75.5);pbAdd(hb,MAT.pkIron,H);
 return hole;}
function buildSlSub(scene,gx,gz,d,opt){reseed(20610+d);
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);KOFF=[gx,0,gz];
 const hd=opt.heading||0,H=new THREE.Group();H.rotation.order='YXZ';H.rotation.y=hd;G.add(H);
 if(d===1){H.rotation.z=.8;H.rotation.x=.06;H.position.y=-2.5;}
 else if(d>=3){H.rotation.z=.02;H.position.y=-.35;}
 H.updateMatrix();useGroupXF(H);
 const hole=slSubHull(H,d);const top=SLS.YC+SLS.R+.4,sz=SLS.SZ,stop=11.8+.8+.55;
 pbAdd(slPrism(slPlan(0,sz,3.6,19.3,2.2,1.5,28),12.6,.5),d>0?MAT.rust:MAT.slSub,H);
 for(let z=-40;z<48;z+=22)for(const s of [-1,1])kput('pkBollard',[s*2.1,top,z],null,.8,d>0?new THREE.Color(0x8a5a40):null);
 if(d!==1){kput('boxD',[0,top+.05,-28],null,[1.6,.2,2.4],null);kput('boxD',[0,top+.05,48],null,[1.6,.2,2.4],null);
  for(const [x,h] of [[0,6],[.9,4.2],[-.9,3.4]])kput('postW',[x,stop+h/2,sz-2+x*2],null,[.22,h,.22],d>0?new THREE.Color(0x9a7a60):null);}
 if(d===0){for(const s of [-1,1])for(let z=-40;z<50;z+=10)kput('strip',[s*2.62,top-.1,z+5],qEuler(0,Math.PI/2,0),[9.6,1,1],CYAN);
  kput('dot',[0,stop+6.2,sz-2],null,[.5,.5,.5],CYAN);
  for(const s of [-1,1])kput('dot',[s*1.6,11.5,sz+8.2],qEuler(0,s*.5,0),[.5,.5,.3],CYAN);
  portFigures(0,top,-10,6,1.6);portFigures(0,top,40,3,1.5);portFigures(0,stop,sz-4,3,1.2);}
 if(d===1){
  // plates sprung and peeled back round the holes; weed on what stands out of the water
  for(let i=0;i<260&&hole;i++){const u=rng(),v=rng();if(!hole(u,v))continue;const z=SLS.Z0+u*SLS.L,r=slSubR(z)+.15,a=v*TAU;
   kput('plateR',[r*Math.cos(a),SLS.YC+r*Math.sin(a),z],qFacing([Math.cos(a),Math.sin(a),rr(-.9,.9)]).multiply(qEuler(rr(-.6,.6),0,rr(-.3,.3))),[rr(1.2,2.6),rr(1,2.2),.1],null);}
  const fz=-63,g=boxUV(.4,5.6,7,8);g.rotateZ(1.3);g.rotateY(.4);g.translate(9,-6,fz+4);pbAdd(g,MAT.rust,H);
  for(let i=0;i<70;i++){const z=rr(-70,40),a=rr(.9,2.3),r=slSubR(z);
   kput('moss',[r*Math.cos(a),SLS.YC+r*Math.sin(a)+.1,z],qEuler(rng(),rng(),rng()),[rr(.5,1.6),rr(.12,.3),rr(.5,1.4)],new THREE.Color().setHSL(rr(.18,.3),rr(.3,.5),rr(.08,.16)));}
  for(let i=0;i<24;i++){const z=rr(-60,40),a=rr(.2,1.2),r=slSubR(z)+.08;kput('stain',[r*Math.cos(a),SLS.YC+r*Math.sin(a),z],qFacing([Math.cos(a),Math.sin(a),0]),[rr(1.5,4),rr(2,5),1],null);}
  for(let i=0;i<14;i++)kput('vine',[rr(-2,2),stop,sz+rr(-8,8)],qEuler(rr(-.1,.1),rng()*TAU,0),[1,rr(2,7),1],null);}
 if(d>=3){
  // a plank deck over the casing and a row of houses on it
  kput('plank',[0,top+.15,-4],null,[8.4,.3,86],new THREE.Color(0x9a8062));
  for(let z=-44;z<38;z+=0){const w=rr(3.4,5),dp=rr(4,6.5);const zc=z+dp/2;if(zc>sz-12&&zc<sz+12){z=sz+12;continue;}
   const x=rr(-1.4,1.4);const t=slShack(x,top+.3,zc,rng()<.5?Math.PI/2:-Math.PI/2,dp,w,rr(2.4,3),{lit:.55});
   if(rng()<.3)slShack(x+rr(-.4,.4),t,zc,rng()*TAU,Math.min(w,dp)*.8,Math.min(w,dp)*.8,rr(2.2,2.6),{lit:.55});z+=dp+rr(.4,1.4);}
  // the sail a lookout: scaffold on top, a hut, a flag, a banner down its flank, lines of flags
  slLattice(0,stop,sz-1,6,2.4,{hut:true});
  kput('pkCloth',[1.85,11.4,sz+1],qEuler(0,Math.PI/2,0),[3,7,1],new THREE.Color(0xa83a2a));
  kput('pkLadder',[-1.75,stop,sz+2],qEuler(0,-Math.PI/2,0),[1,1.05,1],null);
  portWashLine(0,sz+10,0,sz+30,stop+2,10);portWashLine(0,sz-10,0,-24,stop+1,10);
  // rafts lashed alongside, lines to the casing, boats
  for(const s of [-1,1])for(const z of [-42,-6,40]){const x=s*(SLS.R+4.4);
   slRaft(x,z+rr(-3,3),rr(-.04,.04),7,rr(12,16),d,{shack:rng()<.75,line:rng()<.5,people:rng()<.6?3:0,y:.35});
   slRope([s*2.3,top+.4,z-4],[x-s*3.3,.6,z-4],.4,.06,SL_ROPE);slRope([s*2.3,top+.4,z+4],[x-s*3.3,.6,z+4],.4,.06,SL_ROPE);}
  for(let i=0;i<5;i++)portSkiff((rng()<.5?-1:1)*rr(16,22),rr(-70,70),rr(-.3,.3));
  for(let z=-40;z<40;z+=8){kput('plank',[3.9,top+1.6,z],null,[.1,3,.1],null);kput('dot',[3.9,top+3.1,z],null,[.3,.3,.3],WARM);}
  portFigures(0,top+.3,0,12,3);portFigures(0,stop,sz,2,1);}
 endGroupXF();
 const yo=H.position.y;
 for(const z of [-48,0,48])slReg('Submarine — hull',0,z,10,17,SLS.YC-SLS.R+yo,hd);
 slReg('Submarine — sail',0,sz,11,d===1?10:stop+(d>=3?10:5),d===1?0:yo+2,hd);
 KOFF=[0,0,0];return G;}
PORT_VESSEL({key:'slSub',name:'Submarine',cls:'vessel',W:220,LAND:0,SEA:0,decays:[0,1,3],length:150,beam:13,hullBeam:13,draft:10,
 moorY:3,deckY:SLS.YC+SLS.R+.4,stamps:()=>[],build:buildSlSub});
