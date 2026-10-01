// ================================================================= IZIZ VERNACULAR — guilds
// The Farmers' Guild, the Beast Hunters' Guild, the caravanserai and the
// Forgemaster's Hall where the Empire's surviving Ancient mechs are kept
// walking. Three are civic and carry electric light; the caravanserai is
// trade, middle class, and has only the fire in its braziers. Seeds 7701–7739.
// Local helpers are prefixed vg (the shared vn* set is off limits here).

// ---------------------------------------------------------------- local helpers (LOCAL frame, y = base of the piece)
// cloth banner hanging from a bar at (x,y,z), face normal ry; `sheaf` adds the Farmers' straw-sheaf motif
function vgBanner(x,y,z,ry,w,h,c,sheaf){vB('vWood',x,y-.08,z,w+.3,.08,.08,ry,vC(0x5a4632));vPl('vCloth',x,y-.1-h/2,z,w,h,ry,c||vC(vPick(VPAL.awning)));
 if(sheaf){const p=loc(x,z,0,.05,ry);vB('vThatchB',p[0],y-.1-h*.68,p[1],w*.3,h*.36,.05,ry,vC(0xd8b860));vB('vWood',p[0],y-.1-h*.52,p[1],w*.36,.06,.06,ry,vC(0x5a4632));}}
// feeding trough: board box with a dark bed, on two sleepers
function vgTrough(x,y,z,L,ry,c){vB('vWood',x,y+.2,z,L,.55,.8,ry,c);vB('vDarkB',x,y+.62,z,L-.16,.12,.64,ry);for(const s of[-1,1]){const p=loc(x,z,s*(L/2-.4),0,ry);vB('vWood',p[0],y,p[1],.14,.22,1.0,ry,c);}}
// tethering post with an iron ring
function vgTether(x,z,c){vPst('vPostB',x,-.15,z,.13,1.75,c);vBq('vHoop',x,1.3,z,.2,.2,1,qEuler(Math.PI/2,0,0),vC(0x2e2a26));}
// drying rack with hides (tarp planes tinted hide-brown) over a rail
function vgHideRack(x,z,ry,L,c){for(const s of[-1,1]){const p=loc(x,z,s*L/2,0,ry);vPst('vPost',p[0],0,p[1],.08,2.5,c);}
 const a=loc(x,z,-L/2,0,ry),b=loc(x,z,L/2,0,ry);vBeam([a[0],2.4,a[1]],[b[0],2.4,b[1]],.1,c);
 for(let k=0;k<Math.round(L/1.2);k++){const p=loc(x,z,-L/2+.7+k*1.2,rr(-.03,.03),ry);kput('vTarp',[p[0],1.6,p[1]],vQ(ry,rr(-.08,.08),0),[rr(.8,1.1),rr(1.3,1.7),1],vC(vPick([0x7a5236,0x6a4630,0x8a6244,0x5a3e2c])));}}
// rack of spears / harpoons leaning in a rail
function vgSpearRack(x,z,ry,n,c){const L=n*.42+.4;vB('vWood',x,1.05,z,L,.12,.32,ry,c);for(const s of[-1,1]){const p=loc(x,z,s*(L/2-.1),0,ry);vPst('vPost',p[0],0,p[1],.07,1.15,c);}
 for(let k=0;k<n;k++){const p=loc(x,z,-L/2+.4+k*.42,0,ry);kput('vWood',[p[0],1.6,p[1]],vQ(ry,.1,0),[.06,3.2,.06],vC(0x5a4632));kput('vConeI',[p[0],3.15,p[1]],vQ(ry,.1,0),[.06,.45,.06],vC(0x8a8a8a));}}
// beam balance on a post: pivot, beam, two pans on ropes, sacks on one and iron weights on the other
function vgScale(x,z,c){const iron=vC(0x2e2a26);vB('vStone',x,0,z,1.2,.3,1.2,0,vC(0x8a7a66));vPst('vPostB',x,.3,z,.14,2.6,c);vB('vIron',x,2.85,z,.3,.14,.3,0,iron);
 vB('vWood',x,2.8,z,3.4,.12,.14,0,c);for(const s of[-1,1]){const px=x+s*1.55;for(const q of[-1,1])vPst('vRope',px+q*.3,1.35,z,.02,1.45,vC(0xa89878));
  vPst('vPost',px,1.3,z,.48,.06,c);if(s<0){kput('vSack',[px,1.6,z],null,[.42,.32,.36],vC(0xb8a080));kput('vSack',[px+.1,1.95,z+.1],qEuler(0,.7,0),[.38,.28,.32],vC(0xa89070));}
  else{for(let k=0;k<3;k++)vB('vIron',px-.2+k*.2,1.36,z,.16,.22-k*.05,.16,0,iron);}}}
// two-wheeled farm cart parked with its shafts down
function vgCart(x,z,ry,c){const q=loc(x,z,0,0,ry);vB('vWood',q[0],.75,q[1],1.5,.22,3.0,ry,c);for(const s of[-1,1]){const p=loc(x,z,s*.72,0,ry);vB('vWood',p[0],.97,p[1],.08,.55,3.0,ry,c);}
 for(const e of[-1,1]){const p=loc(x,z,0,e*1.5,ry);vB('vWood',p[0],.97,p[1],1.5,.55,.08,ry,c);}
 for(const s of[-1,1]){const p=loc(x,z,s*.92,.4,ry);kput('vPost',[p[0],.72,p[1]],vQ(ry,0,Math.PI/2),[.7,.1,.7],c.clone().multiplyScalar(.9));vBq('vHoop',p[0],.72,p[1],.74,.74,1,vQ(ry,0,0).multiply(qEuler(0,Math.PI/2,0)),vC(0x2e2a26));}
 {const a=loc(x,z,-1.0,.4,ry),b=loc(x,z,1.0,.4,ry);vBeam([a[0],.72,a[1]],[b[0],.72,b[1]],.06,vC(0x2e2a26),'vPipe');}
 for(const s of[-1,1]){const a=loc(x,z,s*.6,1.5,ry),b=loc(x,z,s*.6,3.6,ry);vBeam([a[0],.9,a[1]],[b[0],.2,b[1]],.08,c);}
 vnSacks(q[0],.97,q[1]-.6,3);}
// courtyard well: stone ring, two posts, a windlass beam, a little corrugate roof, rope and bucket
function vgWell(x,z,wood,st){vPst('vPostS',x,0,z,1.35,1.05,st.clone().multiplyScalar(.7));vB('vDarkB',x,1.05,z,1.7,.08,1.7,0);vB('vStone',x,1.0,z,3.1,.14,3.1,0,st.clone().multiplyScalar(.9));
 for(const s of[-1,1])vPst('vPost',x+s*1.3,0,z,.1,2.8,wood);kput('vPost',[x-1.3,2.55,z],qEuler(0,0,-Math.PI/2),[.12,2.6,.12],wood);vB('vWood',x+1.5,2.5,z,.5,.08,.08,0,wood);
 vnHipRoof('vHipC',x,3.1,z,2.2,2.2,.9,0,null,.5);vPst('vRope',x,1.1,z,.02,1.4,vC(0xa89878));vPst('vBarrel',x+.4,1.05,z+.4,.22,.36,wood);}
// brazier: iron bowl on three legs, embers
function vgBrazier(x,z){const iron=vC(0x2e2a26);for(let k=0;k<3;k++){const a=k/3*TAU;vPst('vPipe',x+Math.cos(a)*.3,0,z+Math.sin(a)*.3,.03,.85,iron,qEuler(Math.sin(a)*.25,0,-Math.cos(a)*.25));}
 vPst('vPipe',x,.8,z,.42,.28,iron);vB('vDarkB',x,1.05,z,.6,.06,.6,0);for(let k=0;k<3;k++)vBall('vEmber',x+rr(-.15,.15),1.1,z+rr(-.15,.15),rr(.08,.14));}
// scrap pile in the smithy idiom: rusted plates, pipe offcuts and ghost-panel scraps within rx × rz
function vgScrap(x,z,rx,rz,n){for(let i=0;i<n;i++){const px=x+rr(-rx,rx),pz=z+rr(-rz,rz);const r=rng();const hgt=Math.pow(rng(),2)*.5;
  if(r<.5)kput('vRustB',[px,hgt+.05,pz],qEuler(rr(-.5,.5),rng()*TAU,rr(-.5,.5)),[rr(.5,1.3),rr(.03,.08),rr(.4,1.1)],null);
  else if(r<.8)kput('vPipeR',[px,hgt+.08,pz],qEuler(Math.PI/2,rng()*TAU,rr(-.3,.3)),[rr(.05,.14),rr(.7,2.2),rr(.05,.14)],null);
  else kput('vPanelB',[px,hgt+.05,pz],qEuler(rr(-.4,.4),rng()*TAU,rr(-.4,.4)),[rr(.5,1.2),.06,rr(.5,1.2)],null);}}
// oil drums: rows standing, a couple lying on top
function vgDrums(x,z,n){for(let k=0;k<n;k++)vPst(k%3===1?'vTankR':'vTank',x+(k%2)*.95,0,z+Math.floor(k/2)*.95,.44,1.15,null);
 if(n>=4)kput('vTank',[x+.47,1.6,z+.47],qEuler(0,0,Math.PI/2),[.44,1.15,.44],null);}
// stylised beast skull, jaw at y, facing +z; scale s (1 = a 2.5 m trophy). Cranium = dome, face plate, void sockets, lathe beak and horns.
function vgSkull(G,x,y,z,s,bone){const B=bone||vC(0xe8dfcc);
 vB('vPlaster',x,y,z,2.3*s,.5*s,2.5*s,0,B);kput('vDomeP',[x,y+.5*s,z-.15*s],null,[1.28*s,1.05*s,1.45*s],B);
 vB('vPlaster',x,y+.5*s,z+.85*s,2.2*s,1.05*s,.7*s,0,B);vB('vPlaster',x,y+1.35*s,z+.75*s,2.5*s,.3*s,1.0*s,0,B.clone().multiplyScalar(.95));   // face plate, brow
 for(const q of[-1,1])vB('vDarkB',x+q*.65*s,y+.75*s,z+1.15*s,.55*s,.5*s,.2*s,0);
 for(let k=0;k<5;k++)vB('vPlaster',x-.7*s+k*.35*s,y-.3*s,z+1.15*s,.12*s,.34*s,.12*s,0,B);                                              // teeth
 const beak=mesh(lathe({rFn:yy=>(.5*(1-yy/(1.9*s))+.04)*s,H:1.9*s,nu:12,nv:4}),MAT.plaster,G,x,y+.62*s,z+1.15*s);beak.rotation.x=Math.PI/2+.28;
 for(const q of[-1,1]){const horn=mesh(lathe({rFn:yy=>(.2*(1-yy/(2.3*s))+.03)*s,H:2.3*s,nu:10,nv:4}),MAT.plaster,G,x+q*.95*s,y+1.25*s,z-.5*s);horn.rotation.set(-.55,0,-q*1.0);}}
// the Ancient walker: ~9 m bipedal mech in ghost-white panel with rust, reverse-jointed legs, one arm (the other lies on a bench). Faces +z.
function vgMech(x,y,z){const white=null,iron=vC(0x2e2a26),dark=vC(0x3a3632);
 for(const s of[-1,1]){const fx=x+s*1.35;
  vB('vPanelB',fx,y,z+.3,1.5,.55,2.7,0,white);for(let k=0;k<3;k++)vB('vRustB',fx-.45+k*.45,y,z+1.7,.3,.4,.5,0,null);                    // foot, toes
  vBall('vBall',fx,y+.95,z+.1,.4,iron);vBeam([fx,y+.95,z+.1],[fx+s*.05,y+3.5,z-1.35],.62,white,'vPanelB');                            // ankle, shin (back to the knee)
  vBall('vBall',fx+s*.05,y+3.5,z-1.35,.5,iron);vB('vRustB',fx+s*.05,y+3.15,z-1.95,.7,.7,.35,0,null);                                 // knee, knee cap
  vBeam([fx+s*.05,y+3.5,z-1.35],[fx+s*.1,y+5.5,z+.35],.78,white,'vPanelB');vB('vRustB',fx+s*.5,y+4.0,z-.6,.3,.9,.5,0,null);        // thigh (forward to the hip), rust
  vBq('vDarkB',fx+s*.42,y+2.3,z-.7,.12,.7,.35,null);}                                                                             // shin vents
 vBq('vPanelB',x,y+5.55,z+.1,3.9,1.15,1.9,null,white);vB('vRustB',x,y+5.2,z+.1,4.1,.25,2.0,0,null);                               // hip block
 vBq('vPanelB',x,y+7.15,z-.1,3.9,2.3,2.3,null,white);vBq('vRustB',x,y+6.55,z+1.05,2.6,1.0,.2,null);vBq('vRustB',x-1.6,y+7.6,z-.4,.5,1.2,1.4,null);   // torso, chest plate, rust
 for(let k=0;k<3;k++)vBq('vDarkB',x+.9,y+7.15+k*.28,z+1.06,.5,.1,.14,null);   // vents
 vBq('vPanelB',x,y+8.75,z+.2,1.35,.95,1.35,null,white);vBq('vWinGlass',x,y+8.75,z+.88,.72,.42,.12,null);vBq('vHoop',x,y+8.75,z+.9,.42,.42,1,null,iron);   // head, the cyclops eye
 vPst('vPipe',x+.35,y+9.2,z-.2,.03,.9,iron);vBq('vIron',x,y+9.3,z-.2,.9,.12,.9,null,dark);
 for(const s of[-1,1]){vBq('vPanelB',x+s*2.4,y+7.9,z-.1,1.1,.9,1.9,null,white);vB('vRustB',x+s*2.4,y+8.3,z-.1,1.15,.14,1.95,0,null);}     // shoulder blocks
 // right arm: shoulder ball, upper arm, elbow, forearm, a two-finger claw
 {const sx=x+2.95;vBall('vBall',sx,y+7.85,z,.42,iron);vBeam([sx,y+7.85,z],[sx+.35,y+5.7,z+.4],.52,white,'vPanelB');vBall('vBall',sx+.35,y+5.7,z+.4,.36,iron);
  vBeam([sx+.35,y+5.7,z+.4],[sx+.5,y+3.6,z+1.5],.46,white,'vPanelB');vB('vRustB',sx+.6,y+4.6,z+1.0,.3,.7,.3,0,null);
  for(const q of[-1,1])kput('vIron',[sx+.5+q*.25,y+3.0,z+1.7],qEuler(.3,0,q*.35),[.16,1.1,.3],dark);}
 // left arm: gone — the empty socket, cable stubs
 vBq('vDarkB',x-2.95,y+7.85,z,.4,.7,.7,null);for(let k=0;k<3;k++)kput('vRope',[x-3.1,y+7.5+k*.2,z-.3+k*.3],qEuler(.4,0,1.3),[.03,.7,.03],vC(0x2a2622));}
// a dismantled mech leg lying on a low trolley
function vgMechLeg(x,z,ry,wood){const iron=vC(0x2e2a26);const q=loc(x,z,0,0,ry);vB('vWood',q[0],.5,q[1],5.0,.3,1.9,ry,wood);
 for(const s of[-1,1])for(const e of[-1,1]){const p=loc(x,z,s*1.8,e*1.05,ry);kput('vPost',[p[0],.45,p[1]],vQ(ry,Math.PI/2,0),[.45,.12,.45],iron);}
 const a=loc(x,z,-2.2,0,ry),b=loc(x,z,.4,.3,ry),c2=loc(x,z,2.3,-.2,ry);vBeam([a[0],1.15,a[1]],[b[0],1.25,b[1]],.62,null,'vPanelB');vBall('vBall',b[0],1.25,b[1],.5,iron);
 vBeam([b[0],1.25,b[1]],[c2[0],1.2,c2[1]],.55,null,'vPanelB');vBq('vDarkB',(a[0]+b[0])/2,1.45,(a[1]+b[1])/2,.9,.25,.4,vQ(ry,0,0));
 kput('vPanelB',[c2[0],1.15,c2[1]],vQ(ry,0,0),[.55,1.4,.6],null);vB('vRustB',(b[0]+c2[0])/2,1.5,(b[1]+c2[1])/2,.5,.12,.6,ry,null);
 const d=loc(x,z,-1.0,1.4,ry);kput('vPanelB',[d[0],.05,d[1]],vQ(ry+.3,0,0),[1.3,.08,.9],null);kput('vRustB',[d[0]+.6,.05,d[1]-.3],vQ(ry-.4,0,0),[.8,.06,.6],null);}

// ---------------------------------------------------------------- Farmers' Guild: half-timber hall on a stone plinth, cross-gabled entrance, raised grain loft, cart shed, weighing yard
function buildVernFarmersGuild(G,o){reseed(7701+(o.v|0));const wood=vC(vPick(VPAL.woodMid)),pl=vC(vPick(VPAL.sand)),sh=vC(vPick([0x8a6a4a,0x6a4e38,0x9a7a56])),st=vC(vPick(VPAL.stone)),stD=vC(vPick(VPAL.stoneDark)),trim=vC(vPick(VPAL.trim)),th=vC(vPick(VPAL.thatch)),iron=vC(0x2e2a26);
 vnReg("Farmers' Guild hall",0,0,16,14,{type:['civic','farm']});
 const W=16,D=11,HZ=-3.5,H1=3.9,H2=3.0,Y0=.6,FZ=HZ+D/2,Y1=Y0+H1+.32;
 vB('vStone',0,-.1,HZ,W+.7,Y0+.1,D+.7,0,stD);
 // two half-timber storeys: frame, plaster infill, a jettied string course between
 vnFrame(0,Y0,HZ,W,H1,D,0,wood,.18);vB('vPlaster',0,Y0,HZ,W-.16,H1,D-.16,0,pl);
 vB('vWood',0,Y0+H1,HZ,W+.44,.32,D+.44,0,wood);
 vnFrame(0,Y1,HZ,W,H2,D,0,wood,.16);vB('vPlaster',0,Y1,HZ,W-.14,H2,D-.14,0,pl.clone().multiplyScalar(1.04));
 for(const s of[-1,1])for(const z of[HZ-3.6,HZ+.2]){const a=[s*(W/2+.06),Y1+.2,z],b=[s*(W/2+.06),Y1+H2-.2,z+1.6];vBeam(a,b,.14,wood);}    // diagonal braces, upper side panels
 const top=vnCornice('vWood',0,Y1+H2,HZ,W,D,0,wood,2);
 vnGableRoof(0,top,HZ,W,D,5.2,0,'vGableS',sh,1.1,'vGablePl',pl,.2);
 for(const s of[-1,1]){for(let k=-2;k<=2;k++){const z=HZ+k*2.2;const hh=5.2*(1-Math.abs(k*2.2)/(D/2))-.15;if(hh>.3)vB('vWood',s*(W/2+.02),top,z,.16,hh,.16,0,wood);}   // studs on the plaster gables
  vB('vWood',s*(W/2+.02),top+2.3,HZ,.16,.16,D*.55,0,wood);vB('vWood',s*(W/2+1.1),top+5.2-.5,HZ,.4,1.6,.4,0,wood);kput('vThatchB',[s*(W/2+1.1),top+6.5,HZ],null,[.5,.7,.5],vC(0xd8b860));}   // collar, sheaf finials
 // ground floor: lit windows with shutters; upper floor: deco shutter strips
 for(const x of[-6.86,-4.57,4.57,6.86]){vnWin(x,Y0+1.3,FZ,0,x>5||x<-5?1.2:1.3,1.5,'lit','vWood',wood,true);vnStrip(x,Y1+.5,FZ+.02,0,.6,2.0,'vWood',wood);}
 for(const s of[-1,1])for(const z of[HZ-3,HZ,HZ+3]){vnWin(s*W/2,Y0+1.3,z,s*Math.PI/2,1.2,1.5,'lit','vWood',wood,true);if(z!==HZ-3)vnStrip(s*W/2,Y1+.5,z,s*Math.PI/2,.6,2.0,'vWood',wood);}
 for(const x of[-5.7,-1.9,1.9,5.7])vnWin(x,Y0+1.4,HZ-D/2,Math.PI,1.1,1.2,'shut','vWood',wood);vnDoor(-3.8,Y0,HZ-D/2,Math.PI,1.2,2.3,'vWood',wood,trim,false);
 for(const x of[-5.7,-1.9,1.9,5.7])vnStrip(x,Y1+.5,HZ-D/2-.02,Math.PI,.6,2.0,'vWood',wood);
 // entrance bay: full height, its own cross gable, door with steps, upper window, hanging sheaf banners
 {const PW=6.6,PD=2.8,pz=FZ+PD/2-.1;vB('vStone',0,-.1,pz,PW+.7,Y0+.1,PD+.9,0,stD);
  vnFrame(0,Y0,pz,PW,H1,PD,0,wood,.18);vB('vPlaster',0,Y0,pz,PW-.16,H1,PD-.16,0,pl);vB('vWood',0,Y0+H1,pz,PW+.44,.32,PD+.44,0,wood);
  vnFrame(0,Y1,pz,PW,H2,PD,0,wood,.16);vB('vPlaster',0,Y1,pz,PW-.14,H2,PD-.14,0,pl.clone().multiplyScalar(1.04));
  vnCornice('vWood',0,Y1+H2,pz,PW,PD,0,wood,2);
  vnGableRoof(0,top,pz-2.0,PD+4.0,PW,3.4,Math.PI/2,'vGableS',sh,.9,'vGablePl',pl,.2);
  for(let k=-1;k<=1;k++){const hh=3.4*(1-Math.abs(k*2.2)/(PW/2))-.15;vB('vWood',k*2.2,top,pz+PD/2+.02,.16,hh,.16,0,wood);}
  vnDoor(0,Y0,pz+PD/2,0,2.0,3.0,'vWood',wood,trim);vnStairs(0,0,pz+PD/2+1.0,0,3.6,Y0,3,'vStone',stD);
  vnWin(0,Y1+.6,pz+PD/2,0,1.6,1.7,'lit','vWood',wood,true);
  for(const s of[-1,1]){vgBanner(s*2.5,Y0+H1-.02,pz+PD/2+.14,0,1.1,2.5,vC(vPick(VPAL.awning)),true);vBeam([s*1.3,Y1+.2,pz+PD/2+.05],[s*3.0,Y1+H2-.2,pz+PD/2+.05],.14,wood);}
  vnLamp(-3.0,Y0+3.0,pz+PD/2,0);vnLamp(3.0,Y0+3.0,pz+PD/2,0);}
 // granary: a board loft on stilts against the west wall, thatch roof, hatch and ladder, sacks stored underneath; a stave silo beside
 {const lx=-11.8,lz=HZ+.5,LW=5.6,LD=7.2,FL=2.5,LH=3.2;vnStilts(lx,0,lz,LW,LD,FL,0,wood,.2);vB('vWood',lx,FL-.24,lz,LW+.4,.24,LD+.4,0,wood);
  vnFrame(lx,FL,lz,LW,LH,LD,0,wood,.14);vB('vWood',lx,FL,lz,LW-.12,LH,LD-.12,0,wood.clone().multiplyScalar(.9));
  vnGableRoof(lx,FL+LH,lz,LD,LW,2.6,Math.PI/2,'vGableT',th,1.0,'vGableW',wood,.42);
  vB('vDarkB',lx,FL+.4,lz+LD/2-.05,1.1,1.7,.2,0);kput('vWood',[lx+.75,FL+1.25,lz+LD/2+.12],qEuler(0,.85,0),[1.0,1.6,.06],trim);
  for(const s of[-1,1])vnWin(lx+s*LW/2,FL+1.0,lz-1.5,s*Math.PI/2,.9,.7,'shut','vWood',wood);
  vnLadder(lx,0,lz+LD/2+.75,0,FL+.6,wood);vnSacks(lx-.6,0,lz-.4,7);vnSacks(lx+1.2,0,lz+1.4,4);vnCrate(lx+1.5,0,lz-2.2,.9,.2,wood);
  const sx=-12.4,sz=FZ+2.4;vB('vStone',sx,0,sz,3.2,.5,3.2,0,stD);vPst('vStave',sx,.5,sz,1.35,4.2,vC(0xa88a5e));for(const yy of[.6,2.2,3.8])vBq('vHoop',sx,.5+yy,sz,1.38,1.38,1,qEuler(Math.PI/2,0,0),iron);
  vnThatchCone(sx,4.7,sz,1.35,1.8,th);vB('vDarkB',sx,1.2,sz+1.3,.8,.9,.2,0);vB('vWood',sx,1.2,sz+1.4,.75,.85,.06,0,wood);vnLadder(sx+.9,0,sz+1.9,0,1.9,wood);}
 // cart shed: lean-to against the east wall, corrugate roof on three posts, the cart and a plough-less pile of tools
 {const cz=HZ-1,CD2=8;for(const z of[cz-3.6,cz,cz+3.6])vPst('vPostB',W/2+4.4,0,z,.15,3.0,wood);vB('vWood',W/2+4.4,3.0,cz,.18,.18,CD2+.4,0,wood);
  vB('vWood',W/2+.2,4.15,cz,.18,.18,CD2+.4,0,wood);vnShedRoof(W/2+2.3,3.1,cz,CD2,4.4,1.1,Math.PI/2,'vCorr',null,.6,.12);
  vgCart(W/2+2.2,cz+.5,0,wood);vnCrate(W/2+3.6,0,cz-3.0,.8,.3,wood);vnBarrel(W/2+1.0,0,cz-3.2,.4,1.0,wood);}
 // walled yard: low stone wall with a gate, weighing scale, sacks and crates, planters, lamps, banner poles
 {const YL=-9.6,YR=13.2,YF=10.6,hw=1.35;
  for(const x of[YL,YR]){vB('vStone',x,0,(FZ+YF)/2,.5,hw,YF-FZ,0,stD);vB('vStone',x,hw,(FZ+YF)/2,.72,.2,YF-FZ+.2,0,st);}
  vB('vStone',(YL-8)/2,0,FZ+.25,-YL-8,hw,.5,0,stD);vB('vStone',(YR+8)/2,0,FZ+.25,YR-8,hw,.5,0,stD);
  for(const seg of[[YL,-1.9],[1.9,YR]]){const cx=(seg[0]+seg[1])/2,L=seg[1]-seg[0];vB('vStone',cx,0,YF,L,hw,.5,0,stD);vB('vStone',cx,hw,YF,L+.2,.2,.72,0,st);}
  for(const s of[-1,1]){vB('vStone',s*2.2,0,YF,.8,hw+.75,.8,0,st);vB('vWood',s*2.2,hw+.75,YF,1.0,.14,1.0,0,trim);vnBannerPole(s*3.6,0,YF+.9,0,6.5,vC(vPick(VPAL.awning)));vnLampPost(s*5.0,0,YF-1.6,3.4);}
  vnPaving(0,.02,(FZ+2.7+YF)/2,4.2,YF-FZ-2.7,0,stD,10);vnPaving(0,.02,YF+1.6,6,2.6,0,stD,8);
  vgScale(6.8,5.6,wood);vnSacks(9.2,0,7.6,6);vnSacks(4.6,0,8.4,3);vnCrate(11.2,0,4.6,.95,.2,wood);vnCrate(11.2,.76,4.6,.7,.5,wood);vnCrate(9.6,0,3.4,.8,-.3,wood);
  vnPlanter(-6.2,0,YF-1.0,2.8,.9,0,wood);vnPlanter(-3.6,0,FZ+1.2,1.6,.7,0,wood);vnPlanter(5.4,0,FZ+1.2,1.6,.7,0,wood);vnBarrel(-8.6,0,4.2,.42,1.0,wood);vnWaterButt(-8.4,0,6.4,.5,1.1);}
 vnFolk(0,7,4,2.5);vnFolk(0,14,3,2);}

// ---------------------------------------------------------------- Beast Hunters' Guild: trophy hall with a towering porch, the great skull, a palisaded beast pen, hide racks, a watch platform, a roost on the ridge
function buildVernBeastHunters(G,o){reseed(7711+(o.v|0));const wood=vC(vPick(VPAL.woodRich)),wd2=vC(vPick(VPAL.woodMid)),sh=vC(vPick([0x6a4e38,0x5a4030,0x7a5a44])),st=vC(vPick(VPAL.stone)),stD=vC(vPick(VPAL.stoneDark)),trim=vC(vPick(VPAL.trim)),iron=vC(0x2e2a26),bone=vC(0xe8dfcc);
 vnReg("Beast Hunters' Guild",0,0,17,16,{type:['civic','military']});
 const W=14,D=10,HX=-4.5,HZ=-4,H=4.2,Y0=.7,FZ=HZ+D/2;
 vB('vStone',HX,-.1,HZ,W+.9,Y0-.2,D+.9,0,stD);vB('vStone',HX,Y0-.3,HZ,W+.6,.3,D+.6,0,st);
 vnFrame(HX,Y0,HZ,W,H,D,0,wood,.2);vB('vWood',HX,Y0,HZ,W-.2,H,D-.2,0,wd2);
 const top=vnCornice('vWood',HX,Y0+H,HZ,W,D,0,wood,2);
 vnGableRoof(HX,top,HZ,W,D,3.8,0,'vGableS',sh,1.1,'vGableW',wd2,.2);
 // the roost: crossed timbers off the ridge at either end, lashed where they cross, perch bars between
 {const RY=top+3.8;for(const x of[HX-4.6,HX+4.6]){for(const s of[-1,1])vBeam([x,RY-1.3,HZ+s*2.7],[x,RY+4.6,HZ-s*1.5],.2,wood);vPst('vRope',x,RY+2.15,HZ,.2,.5,vC(0xa89878));}
  for(const s of[-1,1]){vB('vWood',HX,RY+3.7,HZ+s*.93,9.8,.2,.2,0,wood);vB('vWood',HX,RY+.85,HZ+s*1.05,9.8,.18,.18,0,wood);}
  vB('vWood',HX,RY+3.9,HZ,3.0,.12,2.2,0,wd2);vPst('vRope',HX+1.2,RY+.95,HZ+1.05,.03,2.75,vC(0xa89878));}                  // landing board, a hanging tether
 // porch: four tall posts, beams and knee braces, a board screen up to the porch roof where the trophies hang, its own steep gable
 {const PW=9,PD=5,pz=FZ+PD/2,PH=8.4;vB('vStone',HX,-.1,pz,PW+1.6,.35,PD+.7,0,stD);
  for(const sx of[-1,1]){const px=HX+sx*(PW/2-.3);for(const z of[pz+PD/2-.4,FZ+.55]){vPst('vPostB',px,.2,z,.3,PH,wood);vPst('vRope',px,4.6,z,.34,.35,vC(0xa89878));}
   vB('vWood',px,PH-.1,pz,.3,.3,PD+.6,0,wood);vBeam([px,PH-2.4,pz+PD/2-.4],[HX+sx*(PW/2-2.2),PH+.05,pz+PD/2-.4],.16,wood);vBeam([px,PH-2.4,pz+PD/2-.4],[px,PH+.05,pz+PD/2-2.3],.16,wood);}
  vB('vWood',HX,PH-.1,pz+PD/2-.4,PW+.6,.36,.36,0,wood);vB('vWood',HX,PH-.1,FZ+.55,PW+.6,.36,.36,0,wood);
  vB('vWood',HX,top-.3,FZ+.35,PW-.6,PH+.3-(top-.3),.16,0,wd2);for(const sx of[-1,1])vB('vWood',HX+sx*(PW/2-.3),top-.3,FZ+.35,.2,PH+.3-(top-.3),.24,0,wood);   // the screen
  vnGableRoof(HX,PH+.3,FZ+.35+5.55/2,5.55,PW,2.8,Math.PI/2,'vGableS',sh,.9,'vGableW',wd2,.2);
  vgSkull(G,HX,5.0,pz+.3,1.0,bone);for(const s of[-1,1])vPst('vRope',HX+s*.7,6.6,pz+.1,.04,PH-.3-6.6,vC(0xa89878));
  for(const s of[-1,1]){for(const q of[-1,1]){const horn=mesh(lathe({rFn:yy=>.14*(1-yy/1.8)+.02,H:1.8,nu:10,nv:4}),MAT.plaster,G,HX+s*2.6+q*.35,6.9,FZ+.45);horn.rotation.set(.35,0,-q*.75);}
   vB('vStone',HX+s*2.6,6.5,FZ+.45,.9,.5,.2,0,bone);vgSkull(G,HX+s*2.6,7.6,FZ+.6,.3,bone);}                                          // mounted horns and small skulls on the screen
  vnDoor(HX,Y0,FZ,0,2.0,3.0,'vWood',wood,trim);vnStairs(HX,.25,FZ+.9,0,3.6,Y0-.25,2,'vStone',stD);
  for(const s of[-1,1]){vnWin(HX+s*3.0,Y0+1.2,FZ,0,1.2,1.4,'lit','vWood',wood,true);vB('vWood',HX+s*3.2,.25,FZ+2.6,.5,.45,2.6,0,wood);vnLamp(HX+s*(PW/2-.3),4.4,pz+PD/2-.24,0);}
  vgSpearRack(HX+PW/2+.9,FZ+2.2,Math.PI/2,6,wd2);vgSpearRack(HX-PW/2-.9,FZ+2.2,Math.PI/2,5,wd2);}
 // hall windows, side trophies, a back door
 for(const s of[-1,1])for(const z of[HZ-3,HZ,HZ+3])vnWin(HX+s*W/2,Y0+1.3,z,s*Math.PI/2,1.2,1.4,'lit','vWood',wood,true);
 for(const x of[HX-4.5,HX-1.5,HX+1.5,HX+4.5])vnWin(x,Y0+1.4,HZ-D/2,Math.PI,1.1,1.2,'shut','vWood',wood);vnDoor(HX-6.0,Y0,HZ-D/2,Math.PI,1.1,2.2,'vWood',wood,trim,false);
 for(const z of[HZ-1.5,HZ+1.5])for(const q of[-1,1]){const horn=mesh(lathe({rFn:yy=>.12*(1-yy/1.5)+.02,H:1.5,nu:10,nv:4}),MAT.plaster,G,HX+W/2+.15,Y0+H-.6,z+q*.3);horn.rotation.set(0,0,-.95);horn.rotation.y=q*.6;}
 vnChimney(HX-5.5,top+2.2,HZ-3,3.0,.2,true);
 // the beast pen: palisade with a gated front, troughs, tethering posts, hay, a mud wallow, a saddle rack
 {const px=8.4,pz=-1.5,PWd=10.6,PDd=13;vnPalisade(px,0,pz,PWd,PDd,0,2.8,2.8);
  for(const s of[-1,1])vPst('vPostB',px+s*1.7,-.2,pz+PDd/2,.22,4.0,wood);vB('vWood',px,3.6,pz+PDd/2,4.2,.3,.3,0,wood);vgSkull(G,px,3.95,pz+PDd/2,.35,bone);
  kput('vWood',[px-1.4+.7*Math.cos(1.1),1.35,pz+PDd/2-.7*Math.sin(1.1)],qEuler(0,1.1,0),[1.4,2.6,.08],wd2);   // one gate leaf open
  vgTrough(px-3.2,0,pz-4.6,3.2,0,wd2);vgTrough(px+3.0,0,pz-4.6,3.0,0,wd2);
  for(const x of[-3,0,3])vgTether(px+x,pz+.8,wd2);
  kput('vThatchB',[px+3.6,.5,pz-1.2],qEuler(0,.3,0),[1.8,1.0,1.5],vC(vPick(VPAL.thatch)));kput('vThatchB',[px+3.4,1.3,pz-1.0],qEuler(0,-.2,0),[1.2,.7,1.1],vC(vPick(VPAL.thatch)));
  vB('vClayB',px-1.5,-.03,pz+3.0,4.6,.06,3.4,.2,vC(0x6a4a30));vnWaterButt(px-4.2,0,pz+4.4,.5,1.1);
  for(const s of[-1,1])vPst('vPost',px+s*.6,0,pz-2.2,.06,1.2,wd2);vB('vWood',px,1.15,pz-2.2,1.6,.1,.1,0,wd2);kput('vTarpB',[px,1.25,pz-2.2],null,[.9,.25,.7],vC(0x6a4630));}
 // hide racks behind, watch platform at the front corner, lamps, paving, banners
 vgHideRack(-13.6,HZ-3,Math.PI/2,5,wd2);vgHideRack(-13.6,HZ+3.2,Math.PI/2,5,wd2);
 {const tx=-12.4,tz=7.4;for(const sx of[-1,1])for(const sz of[-1,1])vPst('vPostB',tx+sx*1.15,-.2,tz+sz*1.15,.16,6.4,wood,qEuler(sz*.03,0,-sx*.03));
  for(const s of[-1,1]){vB('vWood',tx,2.6,tz+s*1.1,2.5,.12,.12,0,wood);vB('vWood',tx+s*1.1,2.6,tz,.12,.12,2.5,0,wood);}
  vB('vWood',tx,4.9,tz,3.0,.2,3.0,0,wood);for(let k=0;k<10;k++){const a=k/10*TAU;vPst('vPost',tx+Math.cos(a)*1.45,5.1,tz+Math.sin(a)*1.45,.05,.95,wood);}
  vnHipRoof('vHipS',tx,7.0,tz,2.6,2.6,1.2,0,sh,.6);for(const sx of[-1,1])for(const sz of[-1,1])vPst('vPost',tx+sx*1.15,5.1,tz+sz*1.15,.08,1.9,wood);
  vnLadder(tx+.9,0,tz+1.8,0,5.0,wood);}
 vnPaving(HX+3,.02,FZ+5.2,20,7,0,stD,32);vnLampPost(HX-6.5,0,FZ+6.5,3.6);vnLampPost(8.4,0,6.6,3.6);
 vnBannerPole(HX-5.8,0,FZ+3.2,0,7,vC(vPick(VPAL.awning)));vnBannerPole(HX+5.8,0,FZ+3.2,0,7,vC(0x9c2d2d));vnCrate(-10.5,0,FZ+3.5,.9,.3,wd2);vnBarrel(-9.6,0,FZ+3.8,.4,1,wd2);
 vnFolk(HX,FZ+6.5,4,2.5);vnFolk(8,8.5,2,1.2);}

// ---------------------------------------------------------------- caravanserai: walled court, gatehouse with a two-storey block, arcades of posts under corrugate shed roofs, well, stables, stalls
function buildVernCaravanserai(G,o){reseed(7721+(o.v|0));const wood=vC(vPick(VPAL.woodMid)),pl=vC(vPick(VPAL.sand)),pl2=vC(vPick(VPAL.adobe)),st=vC(vPick(VPAL.stone)),stD=vC(vPick(VPAL.stoneDark)),trim=vC(vPick(VPAL.trim)),iron=vC(0x2e2a26),th=vC(vPick(VPAL.thatch));
 vnReg('Caravanserai',0,0,22,12);
 const CW=34,CD=28,WH=4.4,Y0=.5,T=.6,RD=4.3,PH=3.3,GW=8,GD=6.4,gz=CD/2-GD/2+1.4;
 vB('vStone',0,-.12,0,CW+1.2,.14,CD+1.2,0,vC(0x8a7a66));
 // walls: stone plinth, plaster, stone cap; corner piers with corrugate pyramid caps
 const wall=(x,z,L,ry)=>{vB('vStone',x,-.1,z,L,Y0+.1,T+.4,ry,stD);vB('vPlaster',x,Y0,z,L,WH,T,ry,pl);vB('vStone',x,Y0+WH,z,L+.2,.28,T+.5,ry,st);};
 wall(0,-CD/2+T/2,CW,0);wall(-CW/2+T/2,0,CD,Math.PI/2);wall(CW/2-T/2,0,CD,Math.PI/2);
 for(const s of[-1,1])wall(s*(CW/2+GW/2)/2+s*.2,CD/2-T/2,CW/2-GW/2-.4,0);
 for(const sx of[-1,1])for(const sz of[-1,1]){vB('vStone',sx*(CW/2-.45),0,sz*(CD/2-.45),1.0,Y0+WH+.9,1.0,0,stD);kput('vPyrC',[sx*(CW/2-.45),Y0+WH+.9,sz*(CD/2-.45)],null,[1.3,.9,1.3],null);}
 // gatehouse: battered stone plinth, two plaster storeys with orange timber trim, shutter strips, corrugate hip; a proud stone portal with timber leaves half open
 for(const s of[-1,1]){vnPlinth('vBatterS',s*(1.9+1.45),0,gz,2.9,1.2,GD+1.6,0,stD);vB('vPlaster',s*(1.9+1.05),1.2,gz,2.1,4.4,GD,0,pl2);}vB('vPlaster',0,4.4,gz,3.8,1.2,GD,0,pl2);vB('vWood',0,5.6,gz,GW+.44,.3,GD+.44,0,trim);vB('vPlaster',0,5.9,gz,GW-.2,3.0,GD-.2,0,pl2.clone().multiplyScalar(1.05));
 for(const sx of[-1,1])for(const sz of[-1,1])vPst('vPost',sx*(GW/2-.1),1.2,gz+sz*(GD/2-.1),.16,7.7,trim);
 const gt=vnCornice('vWood',0,8.9,gz,GW-.2,GD-.2,0,trim,2);vnHipRoof('vHipC',0,gt,gz,GW-.2,GD-.2,2.2,0,null,1.0);
 for(const e of[-1,1]){const zp=gz+e*(GD/2+ (e>0?.6:.3));for(const s of[-1,1])vB('vStone',s*2.4,0,zp,1.0,5.0,1.0,0,stD);vB('vStone',0,4.4,zp,5.8,.9,1.2,0,stD);vB('vWood',0,4.3,zp,4.2,.22,1.3,0,trim);}
 kput('vWood',[-.95,2.1,gz+GD/2+1.14],qEuler(0,.08,0),[1.85,4.1,.1],trim);kput('vWood',[1.9-.93*Math.cos(1.25),2.1,gz+GD/2+1.14-.93*Math.sin(1.25)],qEuler(0,-1.25,0),[1.85,4.1,.1],trim);
 for(const yy of[1.0,2.1,3.3]){vB('vIron',-.95,yy,gz+GD/2+1.21,1.7,.1,.04,0,iron);}for(let k=0;k<6;k++)vB('vIron',-1.7+k*.3,2.05,gz+GD/2+1.22,.06,.06,.04,0,iron);
 for(const x of[-2.4,0,2.4])vnStrip(x,6.4,gz+GD/2+.02,0,.6,2.0,'vWood',trim);for(const x of[-2.4,2.4])vnStrip(x,6.4,gz-GD/2-.02,Math.PI,.6,2.0,'vWood',trim);
 for(const s of[-1,1]){vnStrip(s*GW/2,6.4,gz,s*Math.PI/2,.6,2.0,'vWood',trim);vnWin(s*3.0,2.7,gz+GD/2,0,1.0,1.0,'open','vWood',trim,true);vnBannerPole(s*5.4,0,CD/2+1.6,0,7.2,vC(vPick(VPAL.awning)));}
 vnWin(0,6.5,gz-GD/2,Math.PI,1.3,1.4,'open','vWood',trim,true);
 // arcades: a room range on the back and front walls, open bays on the sides; posts on the court edge, corrugate shed roofs down to them
 const arcade=(xc,zc,L,ry,rooms,plc)=>{const zi=RD/2;   // local: -z is the outer wall, +z the court; L along local x
  if(rooms){const p=loc(xc,zc,0,-.1,ry);vB('vStone',p[0],-.05,p[1],L,.45,RD-.2,ry,stD);vB('vPlaster',p[0],.4,p[1],L-.2,PH-.4,RD-.4,ry,plc);}
  const n=Math.max(2,Math.round(L/3.0));for(let i=0;i<=n;i++){const p=loc(xc,zc,-L/2+L*i/n,zi,ry);vPst('vPost',p[0],0,p[1],.16,PH,wood);}
  const b=loc(xc,zc,0,zi,ry);vB('vWood',b[0],PH-.15,b[1],L+.3,.3,.3,ry,wood);vnShedRoof(xc,PH+.15,zc,L,RD,1.3,ry,'vCorr',null,.5,.12);};
 arcade(0,-CD/2+T+RD/2,CW-2*T-.2,0,true,pl);                                                   // back: lodging rooms
 for(const s of[-1,1])arcade(s*(CW/2-T+GW/2+.5)/2,CD/2-T-RD/2,CW/2-T-GW/2-.9,Math.PI,true,pl2);   // front, either side of the gate: stores
 arcade(CW/2-T-RD/2,0,CD-2*T-2*RD-.4,-Math.PI/2,false);                                         // east: stables
 arcade(-CW/2+T+RD/2,0,CD-2*T-2*RD-.4,Math.PI/2,false);                                        // west: stalls
 {const fz=-CD/2+T+RD-.3;for(const x of[-12,-6,0,6,12])vnDoor(x,.4,fz,0,1.1,2.2,'vWood',wood,trim,false);for(const x of[-9,-3,3,9])vnWin(x,1.5,fz,0,1.0,.9,'open','vWood',wood,true);
  vnAwning(-6,PH-.35,fz,0,3.0,1.5,vC(vPick(VPAL.awning)));vnAwning(6,PH-.35,fz,0,3.0,1.5,vC(vPick(VPAL.awning)));}
 {const fz=CD/2-T-RD+.3;for(const s of[-1,1]){for(const x of[7.6,12.4])vnDoor(s*x,.4,fz,Math.PI,1.7,2.4,'vWood',wood,trim,false);vnCrate(s*10,.4,fz-1.0,.9,.2,wood);vnSacks(s*13.5,.4,fz-1.2,3);}}
 {const xw=CW/2-T,xp=xw-RD;for(let k=0;k<5;k++){const z=-8.6+k*3.6;vB('vWood',xw-RD/2,0,z,RD-.3,1.5,.08,0,wood);}                         // stable partitions
  for(let k=0;k<4;k++){const z=-6.8+k*3.6;vgTrough(xw-.6,0,z,2.6,Math.PI/2,wood);kput('vThatchB',[xw-RD/2-.2,.06,z+.6],qEuler(0,rr(-.3,.3),0),[2.8,.12,2.6],th);
   if(k%2===0)kput('vThatchB',[xw-1.2,.6,z-.9],qEuler(0,.4,0),[1.2,.8,1.0],th);vgTether(xp+.5,z,wood);}
  vnWaterButt(xp-.9,0,8.0,.5,1.0);}
 {const xw=-CW/2+T,xp=xw+RD;for(const z of[-6,-1,4])vnStall(xw+1.6,z,Math.PI/2);for(const z of[-6,-1,4])vnAwning(xp,PH-.35,z,Math.PI/2,3.4,1.6,vC(vPick(VPAL.awning)));
  vnBarrel(xw+1.0,0,8.2,.42,1.0,wood);vnBarrel(xw+1.9,0,8.4,.42,1.0,wood);vnBarrel(xw+1.45,1.0,8.3,.42,1.0,wood);}
 // the court: paving, the well and trough, braziers, caravan goods stacked inside the gate
 vnPaving(0,.02,0,22,16,0,stD,64);vgWell(0,-.5,wood,st);vB('vStone',3.4,0,-.5,3.0,.7,1.1,0,stD);vB('vWinGlass',3.4,.6,-.5,2.6,.12,.8,0);
 vgBrazier(-4.5,4.5);vgBrazier(5.5,4.0);
 for(let k=0;k<5;k++)kput('vTarpB',[-7.5+rr(-.4,.4)+ (k%3)*1.1,.45+(k>2?.8:0),6.0+Math.floor(k/3)*.9],qEuler(0,rr(-.3,.3),0),[.9,.8,.7],vC(vPick([0x8a7a5a,0x7a6a4e,0xa08a68])));
 for(let k=0;k<3;k++)vPst('vRope',-7.5+k*1.1,.85,6.0,.02,.9,vC(0x6a5a48));vnCrate(7.5,0,6.2,1.0,.2,wood);vnCrate(7.5,.8,6.2,.8,-.4,wood);vnSacks(6.0,0,7.0,4);vnBarrel(8.8,0,7.0,.42,1.0,wood);
 // outside: a hitching rail and a trough by the gate, high shut windows on the blank walls
 for(const s of[-1,1]){vPst('vPost',s*7.5,0,CD/2+3.0,.08,1.1,wood);}vB('vWood',0,1.0,CD/2+3.0,15.2,.1,.1,0,wood);vgTrough(-10.5,0,CD/2+2.2,2.6,0,wood);
 for(const s of[-1,1])for(const z of[-8,0,8])vnWin(s*CW/2,Y0+2.6,z,s*Math.PI/2,.8,.7,'shut','vWood',wood);
 vnFolk(0,3,6,4);vnFolk(0,CD/2+4.5,3,2.5);}

// ---------------------------------------------------------------- Forgemaster's Hall: tall stone hall with a 9 m opening, copper gable, the gantry and the mech in its cradle, forge, yard
function buildVernForgemasters(G,o){reseed(7731+(o.v|0));const st=vC(vPick(VPAL.stone)),stD=vC(vPick(VPAL.stoneDark)),wood=vC(vPick(VPAL.woodRich)),cu=vC(0xffffff),iron=vC(0x2e2a26),dark=vC(0x3a3632),chain=vC(0x2a2622);
 vnReg("Forgemaster's Hall",0,0,20,18,{type:['civic','industry']});
 const W=30,D=20,HZ=-5,WH=10,Y0=.5,T=1.0,OW=9,OH=9,FZ=HZ+D/2;
 vB('vStone',0,-.1,HZ,W+1.4,Y0+.1,D+1.4,0,stD);vnPaving(0,Y0+.02,HZ,W-2.4,D-2.4,0,st.clone().multiplyScalar(.92),50);
 // walls as slabs so the hall is hollow: back, sides, front pieces, piers and the lintel over the opening
 vB('vStone',0,Y0,HZ-D/2+T/2,W,WH,T,0,st);for(const s of[-1,1])vB('vStone',s*(W/2-T/2),Y0,HZ,T,WH,D,0,st);
 for(const s of[-1,1]){const cx=s*(OW/2+1.6+(W/2-OW/2-1.6)/2);vB('vStone',cx,Y0,FZ-T/2,W/2-OW/2-1.6,WH,T,0,st);vB('vStone',s*(OW/2+.8),Y0,FZ-T/2+.25,1.6,WH,1.7,0,stD);vB('vStone',s*(OW/2+.8),Y0+OH-.35,FZ-T/2+.3,1.9,.35,2.0,0,st);}
 vB('vStone',0,Y0+OH,FZ-T/2,OW+3.2,WH-OH,T+.6,0,stD);vB('vIron',0,Y0+OH-.45,FZ-T/2,OW+1.0,.45,.5,0,dark);      // stone beam + the Ancient girder under it
 const top=vnCornice('vStone',0,Y0+WH,HZ,W,D,0,st,3);
 vnGableRoof(0,top,HZ,D,W,6.0,Math.PI/2,'vGableCu',cu,1.3,'vGableSt',st,.2);for(const s of[-1,1])vBall('vFinial',0,top+6.0+.2,HZ+s*(D/2+1.2),.3);
 // deco strips on the front pieces and the flanks; clerestory lit windows on the flanks; a round window in the front gable
 for(const s of[-1,1])for(const x of[8.2,12.6])vnStrip(s*x,Y0+1.6,FZ+.02,0,.7,6.2,'vStone',stD);
 for(const s of[-1,1])for(let k=0;k<4;k++){const z=HZ-D/2+2.5+k*5;vnWin(s*W/2,Y0+6.4,z,s*Math.PI/2,1.3,1.8,'lit','vStone',st);if(k<3)vnStrip(s*W/2,Y0+1.6,z+2.5,s*Math.PI/2,.7,7.0,'vStone',stD);}
 for(const x of[-9,-3,3,9])vnWin(x,Y0+6.4,HZ-D/2,Math.PI,1.3,1.8,'lit','vStone',st);
 vBq('vHoop',0,top+2.6,FZ+.06,1.15,1.15,1,null,vC(0x8a7a66));vB('vWinLit',0,top+1.55,FZ-.04,2.0,2.1,.1,0);for(const s of[-1,1])vnStrip(s*4.0,top+.6,FZ+.02,0,.6,2.6,'vStone',stD);
 for(const s of[-1,1])vnWin(s*10.4,Y0+8.2,FZ,0,1.3,1.2,'lit','vStone',st);
 for(const s of[-1,1]){vnLamp(s*(OW/2+.8),Y0+6.2,FZ+.4,0);vnLamp(s*(OW/2+.8),Y0+3.6,FZ+.4,0);vPl('vCloth',s*10.4,Y0+5.2,FZ+.16,2.2,5.0,0,vC(vPick(VPAL.awning)));vB('vWood',s*10.4,Y0+7.8,FZ+.14,2.6,.1,.1,0,vC(0x5a4632));}
 for(let k=0;k<3;k++)for(const s of[-1,1])vnLamp(s*(W/2-T),Y0+5.0,HZ-D/2+4+k*6,-s*Math.PI/2);                                       // interior wall lamps
 // the gantry: reclaimed pipe columns, rusted beams, a hoist trolley with chains down to the mech's shoulders; the mech in its cradle
 {const mz=HZ+1.5;for(const sx of[-1,1])for(const sz of[-1,1]){vPst('vPipeR',sx*4.6,Y0,mz+sz*3.4,.26,9.0,null);vB('vRustB',sx*4.6,Y0,mz+sz*3.4,1.2,.4,1.2,0,null);}
  for(const sz of[-1,1])vB('vRustB',0,Y0+8.8,mz+sz*3.4,10.2,.5,.5,0,null);for(const sx of[-1,1])vB('vRustB',sx*4.6,Y0+8.8,mz,.5,.5,7.4,0,null);
  vB('vRustB',0,Y0+9.05,mz-1.0,10.2,.7,.6,0,null);vB('vIron',0,Y0+8.55,mz-1.0,1.4,.5,.9,0,dark);for(const s of[-1,1])vBeam([s*4.6,Y0+6.2,mz-3.4],[s*4.6,Y0+8.8,mz-.6],.2,null,'vPanelB');   // hoist beam + trolley
  for(const s of[-1,1]){vPst('vRope',s*2.4,Y0+8.45,mz-.9,.06,.6,chain);vB('vIron',s*2.4,Y0+8.4,mz-.9,.34,.1,.34,0,iron);vBeam([s*2.4,Y0+9.05,mz-.9],[s*.7,Y0+8.55,mz-1.0],.05,chain,'vRope');}
  for(const s of[-1,1])vB('vRustB',s*3.3,Y0+5.35,mz,2.6,.45,.45,0,null);                                                             // cradle clamps at the hip
  vgMech(0,Y0,mz);
  // the removed arm on a workbench, tools, a step ladder up to the hip
  vB('vWood',-9.5,Y0,mz+2,4.6,.9,1.3,0,wood);kput('vPanelB',[-10.3,Y0+1.2,mz+2],qEuler(0,.05,0),[2.4,.5,.5],null);vBall('vBall',-8.9,Y0+1.2,mz+2,.36,iron);kput('vPanelB',[-7.9,Y0+1.15,mz+2.1],qEuler(0,-.15,0),[1.6,.44,.44],null);
  vB('vRustB',-10.6,Y0+1.45,mz+2,.6,.1,.3,0,null);for(let k=0;k<4;k++)vB('vIron',-11.4+k*.4,Y0+.9,mz+1.6,.05,.5,.05,0,iron);
  vnLadder(-2.6,Y0,mz+2.6,0,5.4,wood);}
 // forge in the back-left corner: hearth, embers, hood, a chimney out through the copper roof; tool wall, drums
 {const fx=-10.5,fz=HZ-D/2+2.6;vB('vStone',fx,Y0,fz,3.2,1.1,2.4,0,stD);vB('vDarkB',fx,Y0+1.2,fz,2.6,.15,1.7,0);for(let k=0;k<6;k++)vBall('vEmber',fx+rr(-.9,.9),Y0+1.32,fz+rr(-.6,.6),rr(.1,.22));
  kput('vRustB',[fx,Y0+3.0,fz],null,[3.0,1.3,2.2],null);kput('vRustB',[fx,Y0+2.3,fz],null,[3.4,.2,2.6],null);vnChimney(fx,Y0+3.6,fz,top+4.6-Y0-3.6,.42,true);
  vPst('vPostB',fx+3.2,Y0,fz+1.2,.36,.8,wood);vB('vIron',fx+3.2,Y0+.8,fz+1.2,1.2,.36,.42,0,iron);vnWaterButt(fx+4.6,Y0,fz+.4,.45,.9);
  vB('vWood',W/2-T-.6,Y0,HZ-D/2+4,1.0,1.0,6.0,0,wood);for(let k=0;k<8;k++)vB('vIron',W/2-T-.6,Y0+1.0,HZ-D/2+1.4+k*.7,.06,.6,.06,0,iron);
  for(let k=0;k<5;k++)vB('vIron',W/2-T-.08,Y0+2.6,HZ-D/2+1.6+k*.9,.12,1.2,.3,0,dark);vgDrums(W/2-T-3.2,HZ+2.2,6);
  for(let k=0;k<3;k++)kput('vPipeR',[W/2-T-.9,Y0+.12+k*.25,HZ+7.2+rr(-.2,.2)],qEuler(Math.PI/2,0,rr(-.05,.05)),[.12,5.0,.12],null);}
 // the yard: paving, the second leg on its trolley, scrap piles, drums, flag pole, lamp posts, bollards
 vnPaving(0,.02,FZ+5.6,W+8,11.4,0,stD,90);
 vgMechLeg(9.5,FZ+6.5,.35,wood);vgScrap(-11.5,FZ+3.5,2.2,2.0,34);vgScrap(15.5,FZ+1.5,1.5,2.4,24);vgDrums(-16.5,FZ+7.5,4);
 for(let i=0;i<8;i++)kput('vIron',[-15.5+rr(-.8,.8),rr(.1,.5),FZ+2.5+rr(-1.5,1.5)],qEuler(rng(),rng()*TAU,rng()),[rr(.3,.9),rr(.2,.5),rr(.3,.9)],iron);
 vnBannerPole(-13.5,0,FZ+10,0,9.5,vC(0xe07a2a));vB('vStone',-13.5,0,FZ+10,1.4,.6,1.4,0,stD);
 for(const s of[-1,1]){vnLampPost(s*7.5,0,FZ+3.2,4.0);vnLampPost(s*14,0,FZ+9.5,4.0);}
 for(let k=0;k<6;k++)vB('vStone',-12.5+k*5,0,FZ+11.0,.6,.9,.6,0,stD);vnCrate(5.2,0,FZ+2.4,1.0,.2,wood);vnCrate(6.4,0,FZ+2.0,.8,.5,wood);
 vnFolk(-6,FZ+6,4,2.5);vnFolk(-7,HZ+6,2,1.2);}

VERN.def({key:'vern_farmers_guild',name:"Farmers' Guild",family:'civic',tags:{type:['civic','farm'],wealth:'civic',lit:true},w:30,d:22,h:14,build:buildVernFarmersGuild});
VERN.def({key:'vern_beast_hunters_guild',name:"Beast Hunters' Guild",family:'civic',tags:{type:['civic','military'],wealth:'civic',lit:true},w:28,d:22,h:15,build:buildVernBeastHunters});
VERN.def({key:'vern_caravanserai',name:'Caravanserai',family:'trade',tags:{type:['tavern/inn','market/shop'],wealth:'middle',lit:false},w:36,d:30,h:12,build:buildVernCaravanserai});
VERN.def({key:'vern_forgemasters_hall',name:"Forgemaster's Hall",family:'civic',tags:{type:['civic','industry'],wealth:'civic',lit:true},w:40,d:32,h:18,build:buildVernForgemasters});
