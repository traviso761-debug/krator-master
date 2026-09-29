// ================================================================= REPUBLICAN — salvage-built houses and works (round 7c)
// Travis: "give me a couple more residential and industrial buildings designed from ground up with post-apocalyptic
// vibes but still fitting the general style." Built FROM the Ancients' wreckage rather than dressed with it: a fuel tank
// for a ground floor, a broken concrete block for a plinth, hull plates for walls, a rocket bell for a chimney — but
// framed, bracketed and roofed like the rest of the East Highland Republic (the frame storeys of 73b, Alpine roofs, lace
// bargeboards, lattice windows). They are born reclaimed (tags.salvage), so 88 gives them no `_reclaimed` twin.
kdef('hTankEnd',new THREE.SphereGeometry(1,20,8,0,TAU,0,Math.PI/2).rotateZ(-Math.PI/2),MAT.rust);   // a tank's domed end, bulging toward +x
kdef('hTankC',new THREE.CylinderGeometry(1,1,1,24),MAT.rust);   // a tank body CENTRED on its position (vTankR stands on its base)
kdef('hHullSeg',new THREE.CylinderGeometry(1,1,1,18,1,true,0,Math.PI*.62),MAT.rust);                 // a curved section of hull, open
const HSV={rust:[0x8a5a3a,0x7a4e34,0x96643e,0x6e4a36],conc:[0x9a968c,0x8e8a80,0xa6a296],corr:[0x9a9488,0x8a867a,0xa8a294]};
// the rotor of a salvaged wind charger: three plate blades on a hub facing +z of ry
function hnRotor(x,y,z,ry,r,c){kput('hGold',[x,y,z],null,[.16,.16,.16],hC(0x3a3430));for(let k=0;k<3;k++){const a=k*TAU/3+.4;const p=loc(x,z,Math.cos(a)*r*.55,.08,ry);
 kput('vPlate',[p[0],y+Math.sin(a)*r*.55,p[1]],qEuler(0,ry,a-Math.PI/2),[.3,r,1],c);}vB('vIron',x,y-.1,z,.14,.2,.9,ry,hC(0x3a3430));}
// a cable between two points (guy wires, crane chains)
function hnCable(a,b,c){beam('vRope',a,b,.025,.025,c||hC(0x2e2a26));}

// ---------------------------------------------------------------- R1 — the tank house
// A spent Ancient fuel tank on three concrete cradles is the ground floor: lattice windows cut into its flank, a plank
// porch against it; a frame storey straddles the crown on red stilts, under a steep corrugated gable; a wind charger on
// a mast at one end, a water cistern on legs behind, a stovepipe through the roof.
function buildHlRepTankHouse(G,o){reseed(21801+(o.v|0));const R=2.1,L=9.4,yc=.6+R;
 const rust=hC(vPick(HSV.rust)),conc=hC(vPick(HSV.conc)),iron=hC(0x3a3430),corr=hC(vPick(HSV.corr)),log=hC(vPick(HPAL.aged)),red=hC(vPick(HFRAME.postPoor)),lit=vLit()?'lit':'glass';
 vnReg('Tank house',0,0,7,12.5);
 for(const x of[-3.4,0,3.4]){vB('boxCR',x,0,0,.9,1.2,3.8,0,conc);vB('boxCR',x,0,0,1.3,.3,4.2,0,conc);}              // cradles
 kput('hTankC',[0,yc,0],qEuler(0,0,Math.PI/2),[R,L,R],rust);
 kput('hTankEnd',[L/2,yc,0],null,[R*.42,R,R],rust);kput('hTankEnd',[-L/2,yc,0],qEuler(0,Math.PI,0),[R*.42,R,R],rust);
 for(const x of[-L/2+.3,-1.6,1.6,L/2-.3])kput('vHoop',[x,yc,0],qEuler(0,Math.PI/2,0),[R*.985,R*.985,1],rust.clone().multiplyScalar(.6));          // weld seams
 vnPatch(-2.6,yc-.9,R*.92,0,2.2,1.4,4);vnPatch(3,yc+.2,-R*.92,Math.PI,2,1.2,3);
 for(const x of[-2.8,2.8])hnLatWin(x,yc-.45,R*.99,0,1,1.05,lit,null);                                                      // windows cut in the flank
 hnLatWin(L/2+R*.42-.02,yc-.3,0,Math.PI/2,.8,.9,lit,null);
 // the porch: a plank vestibule against the flank, a door, a corrugated shed roof, two steps
 const pz=R+.7;vB('hPlankB',0,.6,pz,2.6,2.5,1.5,0,hC(vPick(HFRAME.plank)));vnDoor(0,.6,pz+.76,0,1,2.1,'hPaint',red,hC(vPick(HPAL.tar)),false);
 vnShedRoof(0,3.1,pz,2.9,1.7,.45,Math.PI,'vCorr',corr,.3);vnStairs(0,0,pz+1.25,0,1.4,.6,3,'vStone',conc);
 // the straddling storey on stilts and sleepers, the roof, the stovepipe
 const y2=yc+R-.3;for(const x of[-3,0,3])vB('vWood',x,y2-.26,0,.3,.26,5.8,0,log);
 for(const sx of[-1,1])for(const sz of[-1,1])kput('hCol',[sx*3.75,0,sz*2.65],null,[.14,y2-.26,.14],red);
 hnFachBox(0,y2,0,8,2.8,5.4,0,null,null,lit);
 const top=hnGable(0,y2+2.8,0,8,5.4,1.6,0,'vCorr',corr,.7,'vGableW',log);hnBarge(0,y2+2.8,0,8,5.4,1.6*2.7,0,.7,hC(HPAL.white),'lace');
 vnChimney(2.4,y2+2.2,-1.1,top-y2-.6,.15,true);
 // the wind charger and the cistern
 const mx=-L/2-1.3;vPst('vPipeR',mx,0,1.6,.09,11.2,null);for(let k=1;k<4;k++)vB('vIron',mx,k*2.6,1.6,.5,.06,.06,0,iron);hnRotor(mx,11.2,1.6+.2,0,1.9,rust);
 hnCable([mx,10.6,1.6],[mx-3,0,4],null);hnCable([mx,10.6,1.6],[mx-2.6,0,-2.2],null);
 for(const sx of[-1,1])for(const sz of[-1,1])vPst('vPipeR',3.4+sx*.7,0,-4.2+sz*.7,.06,3.4,null);
 vB('vWood',3.4,3.4,-4.2,1.8,.14,1.8,0,log);kput('hTankC',[3.4,3.54+.75,-4.2],null,[.8,1.5,.8],rust);hnCable([3.4,4.5,-3.4],[2.2,y2+1,-2.7],hC(0x4a4038));
 vnBarrel(-1.4,0,R+.9,.3,.8,hC(0x5a4a3e));hnWoodpile(-4.2,0,R+.7,0,1.4,1);
 kput('hRCHeap',[5.8,-.05,2.8],null,[1.2,.5,1],hC(0x5a4a3e));for(let k=0;k<5;k++)kput(vPick(['vPlate','vSheet']),[5.8+rr(-.8,.8),.4,2.8+rr(-.6,.6)],qEuler(-Math.PI/2+rr(-.3,.3),rng()*TAU,0),[rr(.8,1.4),rr(.6,1),1],null);}

// ---------------------------------------------------------------- R2 — the hull-plate tower house
// A shattered block of Ancient concrete (rebar sprouting from the break) is the plinth; two frame storeys stand on it,
// the lower one partly walled in riveted hull plates, the upper jettied; a steep scale gable with lace bargeboards and
// a rocket bell for a chimney; a salvaged antenna mast with its dish at the back corner; a hoist beam out of the gable.
function buildHlRepHulkTower(G,o){reseed(21811+(o.v|0));const S=3.2,W=6.8,W2=7.6;
 const rust=hC(vPick(HSV.rust)),conc=hC(vPick(HSV.conc)),iron=hC(0x3a3430),slate=hC(vPick(HPAL.slate)),log=hC(vPick(HPAL.aged)),beamC=hC(vPick(HPAL.redwood)),cream=hC(vPick(HPAL.stucco)),lit=vLit()?'lit':'glass';
 vnReg('Hull-plate tower house',0,0,6.5,S+9+5);
 vB('boxCR',0,0,0,7.6,S,7.6,0,conc);vB('boxCR',-2.6,S-.02,-2.6,2.6,.5,2.6,.2,conc);                               // the block and a tilted slab on it
 for(let k=0;k<7;k++){const a=rr(-3.6,3.6);kput('vRock',[a,rr(.3,1.2),3.9],qEuler(rng(),rng(),0),[rr(.3,.7),rr(.25,.5),rr(.3,.6)],conc);}   // spall at the foot
 for(let k=0;k<9;k++){const x=3.7,z=rr(-3.4,3.4),h=rr(.4,1.3);beam('vIron',[x,S-.2,z],[x+rr(.1,.5),S-.2+h,z+rr(-.2,.2)],.035,.035,hC(0x6a3a26));}   // rebar out of the break
 const run=10*.32;vnStairs(2.4,0,3.8+run/2,0,1.4,S,10,'vWood',log);vB('vWood',2.4,S-.1,4.2,1.8,.12,1.2,0,log);             // the stair to the landing
 hnFachBox(0,S,0,W,2.8,W,0,null,beamC,lit);
 vnPatch(-W/2-.05,S+.2,0,-Math.PI/2,5.6,2.3,7);vnPatch(0,S+.2,-W/2-.05,Math.PI,5.2,2.2,6);                              // hull plates over the frame
 for(let k=0;k<14;k++){const u=rr(-2.6,2.6),y=S+rr(.3,2.4);const p=loc(0,0,u,-W/2-.1,Math.PI);kput('hPaintBall',[p[0],y,p[1]],null,[.05,.05,.05],iron);}   // rivets
 vnDoor(2.4,S,W/2+.12,0,1,2.1,'hPaint',hC(vPick(HFRAME.post)),hC(vPick(HPAL.tar)),false);
 const y3=S+2.8+.12;hnJetty(0,y3,0,W2,W2,0,beamC,.35);hnFachBox(0,y3,0,W2,2.7,W2,0,null,beamC,lit);
 const yR=y3+2.7,top=hnGable(0,yR,0,W2,W2,1.8,0,'hGableSc',slate,.6,'vGablePl',cream);hnBarge(0,yR,0,W2,W2,1.8*W2/2,0,.6,hC(HPAL.white),'lace');
 hnForm('hFormT',0,yR+1.8,W2/2+.05,0,2,1);
 // the rocket bell chimney: a flared nozzle on a short pipe, through the back slope
 vPst('vPipeR',1.8,yR,-1.8,.28,2.4,null);kput('vConeI',[1.8,yR+2.4+1.5,-1.8],qEuler(Math.PI,0,0),[.75,1.5,.75],rust);kput('vHoop',[1.8,yR+2.4,-1.8],qEuler(Math.PI/2,0,0),[.76,.76,1.4],iron);
 // the hoist out of the gable
 vB('vWood',0,yR+1.2,W2/2+.6,.22,.22,1.6,0,log);hnCable([0,yR+1.2,W2/2+1.3],[0,S+1.4,W2/2+1.3],null);vB('vWood',0,S+.9,W2/2+1.3,.7,.5,.7,0,log);
 // the antenna mast and dish
 const ax=-4.4,az=-4.4;vPst('vPipeR',ax,0,az,.1,top+4,null);for(let k=1;k<7;k++){const y=k*(top+4)/7;vB('vIron',ax,y,az,.9,.05,.05,.78,iron);}
 kput('vDomeS',[ax+.2,top+2.6,az+.45],qEuler(Math.PI/2+.35,0,.2),[1.3,.4,1.3],hC(0xb8b4a8));vPst('vIron',ax+.2,top+2.6,az+.9,.03,.8,iron);
 hnCable([ax,top+3.6,az],[ax-3,0,az+1],null);hnCable([ax,top+3.6,az],[ax+1,0,az-3],null);
 vnBarrel(3.6,0,5.4,.32,.85,hC(0x4a5a4e));vnBarrel(4.2,0,5.9,.32,.85,hC(0x5a4a3e));}

// ---------------------------------------------------------------- I1 — the powder works
// Roketstad's trade: three plank sheds (frame walls, steep corrugated gables) separated by earthen blast berms; a boiler
// house where a salvaged tank sits on a rubble firebox, its stack built of stacked pipe sections on guy wires; a narrow
// rail along the front with a powder cart; kegs and crates; red warning flags; a watch post over the gate.
function buildHlRepPowderWorks(G,o){reseed(21821+(o.v|0));
 const rust=hC(vPick(HSV.rust)),corr=hC(vPick(HSV.corr)),log=hC(vPick(HPAL.aged)),iron=hC(0x3a3430),turf=hC(0x6a7a4a),red=hC(HPAL.red),post=hC(vPick(HFRAME.postPoor)),lit=vLit()?'lit':'glass';
 vnReg('Powder works',0,0,17,9);
 for(const x of[-11,0,11]){vB('vStone',x,0,-1,7.6,.3,14.6,0,hC(vPick(HSV.conc)));hnFachBox(x,.3,-1,7,3.2,14,0,null,null,lit);
  hnGable(x,3.5,-1,14,7,1.4,Math.PI/2,'vCorr',corr,.6,'vGableW',log);
  vB('hPlankB',x,.3,6.1,2.8,2.6,.12,0,hC(vPick(HFRAME.plank)));vB('vIron',x,2.95,6.2,3.4,.1,.1,0,iron);                   // the sliding door on its rail
  for(let k=0;k<5;k++)vnBarrel(x+rr(-3,3),0,7.3+rr(0,.8),.3,.8,hC(vPick([0x5a4a3e,0x6a5040,0x4a4038])));
  vPst('vPipe',x+3.2,0,7.6,.04,5,iron);vB('hPaint',x+3.2+.45,4.3,7.6,.9,.6,.03,0,red);}                                    // red warning flags
 for(const x of[-5.5,5.5])kput('hBatterRub',[x,0,-1],null,[3.4,3.8,15],turf);                                            // blast berms
 // the boiler house: rubble firebox, the tank, the glowing mouth, the pipe stack on guys
 const bx=-11,bz=-12.2;vB('hRubB',bx,0,bz,5.6,2.4,4.4,0,hC(vPick(HPAL.rubble)));kput('hTankC',[bx,4,bz],qEuler(0,0,Math.PI/2),[1.6,5,1.6],rust);
 for(const x of[-1.8,0,1.8])kput('vHoop',[bx+x,4,bz],qEuler(0,Math.PI/2,0),[1.62,1.62,1.4],iron);
 vB('vDarkB',bx,.2,bz+2.22,1.2,1,.06,0);kput('vEmber',[bx,.55,bz+2.15],null,[.4,.3,.12]);
 const sx=bx+4.4;for(let k=0;k<4;k++){vPst('vPipeR',sx,k*4,bz,.55-k*.06,4.05,null);kput('vHoop',[sx,k*4,bz],qEuler(Math.PI/2,0,0),[.58-k*.06,.58-k*.06,2],iron);}
 beam('spipe',[bx+1.6,4,bz],[sx,4.5,bz],.4,.4,rust);
 for(const [dx,dz] of[[5,3],[4,-4],[-3,-5]])hnCable([sx,14,bz],[sx+dx,0,bz+dz],null);
 // the rail and the powder cart
 for(const s of[-1,1])vB('vIron',0,.02,9.2+s*.5,34,.12,.08,0,iron);for(let k=0;k<42;k++)vB('vWood',-16.4+k*.8,0,9.2,.22,.06,1.5,0,log);
 vB('vWood',4,.45,9.2,1.8,.7,1.2,0,log);for(const u of[-.6,.6])for(const s of[-1,1])kput('vHoop',[4+u,.35,9.2+s*.55],null,[.28,.28,2],iron);
 for(let k=0;k<3;k++)vnBarrel(3.5+k*.5,1.15,9.2,.22,.5,hC(0x5a4a3e));
 // the watch post over the gate
 const wx=15,wz=10;for(const a of[-1,1])for(const b of[-1,1])kput('hCol',[wx+a*1,0,wz+b*1],null,[.12,4.5,.12],post);
 vB('vWood',wx,4.5,wz,2.6,.16,2.6,0,log);kput('hRailC',[wx,4.95,wz+1.25],null,[2.4,.7,1],log);kput('hRailC',[wx+1.25,4.95,wz],qEuler(0,Math.PI/2,0),[2.4,.7,1],log);
 for(const a of[-1,1])for(const b of[-1,1])kput('hCol',[wx+a*1.1,4.6,wz+b*1.1],null,[.08,2,.08],post);
 hnGable(wx,6.6,wz,2.4,2.4,1.5,0,'vCorr',corr,.4,'vGableW',log);}

// ---------------------------------------------------------------- I2 — the hull-breaker's yard
// Where rocket hulls from the spaceport are cut up: a furnace hall (rubble ground storey, frame upper storey, steep
// corrugated gable with a ridge ventilator, two brick stacks); in the yard a timber gantry crane on A-frames, bracketed
// like a gate, lifting a curved section of hull on chains; heaps of plate, a pipe rack, a spent engine bell on its side;
// a small office; a fence of plates round the yard.
function buildHlRepHullYard(G,o){reseed(21831+(o.v|0));
 const rust=hC(vPick(HSV.rust)),corr=hC(vPick(HSV.corr)),log=hC(vPick(HPAL.aged)),iron=hC(0x3a3430),cream=hC(vPick(HPAL.stucco)),beamC=hC(vPick(HPAL.redwood)),lit=vLit()?'lit':'glass';
 vnReg("Hull-breaker's yard",0,0,17,12);vnReg('Furnace hall',0,-8.5,9,14);
 vnPaving(0,0,5,28,16,0,hC(0x6a6258),50);
 // the furnace hall
 const HZ=-8.5,HW=16,HD=9;vB('hRubB',0,0,HZ,HW,3.6,HD,0,hC(vPick(HPAL.rubble)));vB('vStone',0,3.45,HZ,HW+.2,.18,HD+.2,0,hC(vPick(HPAL.ashlar)));
 vB('vDarkB',0,.1,HZ+HD/2+.02,3.2,2.9,.1,0);for(let k=0;k<3;k++)kput('vEmber',[rr(-1,1),rr(.3,1.2),HZ+HD/2-.3],null,[rr(.3,.5),rr(.2,.4),.3]);   // the furnace mouth
 for(const u of[-5.5,-3,3,5.5])vnWin(u,1.2,HZ+HD/2,0,1,1.5,lit,'vStone',hC(vPick(HPAL.ashlar)));
 hnFachBox(0,3.6,HZ,HW,3.2,HD,0,cream,beamC,lit);
 const top=hnGable(0,6.8,HZ,HW,HD,1.3,0,'vCorr',corr,.7,'vGablePl',cream);
 vB('hPlankB',0,top-.35,HZ,6,1.1,1.6,0,hC(vPick(HFRAME.plank)));kput('hLattA',[0,top+.2,HZ+.82],null,[5.6,.7,1],hC(0x3a2a22));
 hnGable(0,top+.75,HZ,6.4,2.2,1.1,0,'vCorr',corr,.3,'vGableW',log);                                                        // the ridge ventilator
 for(const s of[-1,1])hnStoneChimney(s*(HW/2-1.2),0,HZ-HD/2+.8,15,1.1);
 // the gantry crane: two bracketed A-frames and a girder, trolley, chains, a hull section
 const cz=4.5,red=hC(vPick(HFRAME.post));
 for(const s of[-1,1]){const x=s*12;beam('vWood',[x,0,cz-3],[x,10.6,cz],.4,.4,log);beam('vWood',[x,0,cz+3],[x,10.6,cz],.4,.4,log);vB('vWood',x,4,cz,.3,.3,4.2,0,log);
  hnDougong(x,10.2,cz,s>0?-Math.PI/2:Math.PI/2,.7);}
 vB('hPaint',0,11,cz,25,.6,.5,0,red);vB('hPaint',0,11.6,cz,25.4,.14,.7,0,hC(HPAL.teal));
 vB('vIron',3,10.6,cz,1.4,.4,1,0,iron);for(const s of[-1,1])hnCable([3,10.6,cz+s*.35],[3+s*1.8,6.4,cz],iron);
 kput('hHullSeg',[3,4.4,cz],qEuler(0,0,Math.PI/2).multiply(qEuler(0,-Math.PI*.31,0)),[3,7,3],rust);
 // heaps, the pipe rack, the engine bell, a trolley line of plates
 for(const [x,z,r] of[[-9,3,2.4],[-5,9,2],[9,10,2.2]]){kput('hRCHeap',[x,-.05,z],qEuler(0,rng()*TAU,0),[r,r*.45,r],hC(vPick([0x5a4a3e,0x6a5040])));
  for(let k=0;k<14;k++){const a=rng()*TAU,d=Math.sqrt(rng())*r*.85;kput(vPick(['vPlate','vSheet','vPlateW']),[x+Math.cos(a)*d,Math.max(.1,r*.45*(1-d/r))+.05,z+Math.sin(a)*d],qEuler(-Math.PI/2+rr(-.4,.4),rng()*TAU,0),[rr(.8,1.8),rr(.6,1.3),1],null);}}
 for(const x of[7,11]){vB('vWood',x,0,1.5,.2,1,.2,0,log);vB('vWood',x,0,-1.5,.2,1,.2,0,log);vB('vWood',x,1,0,.24,.14,3.4,0,log);}
 for(let k=0;k<7;k++)kput('spipe',[9,1.24+Math.floor(k/4)*.3,-1.2+(k%4)*.8],qEuler(0,0,Math.PI/2),[.14,5.6,.14],rust);
 kput('vConeI',[-10,1.9,11],qEuler(0,.4,Math.PI/2),[1.9,4.4,1.9],rust);kput('spipe',[-12.3,1.9,11],qEuler(0,.4,Math.PI/2),[.6,1.2,.6],rust);
 // the breaker's office: a small frame house by the gate
 vB('vStone',-11,0,-1,5,.3,4,0,hC(vPick(HSV.conc)));hnFachBox(-11,.3,-1,4.6,2.8,3.6,0,null,beamC,lit);hnGable(-11,3.1,-1,4.6,3.6,1.5,0,'vCorr',corr,.5,'vGableW',log);
 vnChimney(-12.2,2.6,-1.6,2.6,.12,true);
 // the fence of plates on three sides, gap at the front
 for(const [a,b] of[[[-15,-14],[-15,13]],[[15,-14],[15,13]],[[-15,13],[-4,13]],[[4,13],[15,13]]]){const L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.round(L/2.2),ry=Math.atan2(b[0]-a[0],b[1]-a[1])+Math.PI/2;
  for(let i=0;i<n;i++){const t=(i+.5)/n;kput(vPick(['vPlate','vSheet','vPlateW']),[a[0]+(b[0]-a[0])*t,1.05,a[1]+(b[1]-a[1])*t],qEuler(0,ry,rr(-.05,.05)),[L/n+.1,2.1,1],null);}}}

const HTAG_SALV=(wealth,type)=>({type,wealth,lit:false,salvage:true});
HL.def({key:'hl_rep_house_tank',name:'Tank house',branch:'republican',family:'Dwellings',tags:HTAG_SALV('poor',['single-family dwelling']),w:15,d:10,h:13,build:buildHlRepTankHouse});
HL.def({key:'hl_rep_house_hulk',name:'Hull-plate tower house',branch:'republican',family:'Dwellings',tags:HTAG_SALV('middle',['single-family dwelling']),w:11,d:12,h:18,build:buildHlRepHulkTower});
HL.def({key:'hl_rep_powder_works',name:'Powder works',branch:'republican',family:'Industry',tags:HTAG_SALV('poor',['industry']),w:36,d:28,h:16,build:buildHlRepPowderWorks});
HL.def({key:'hl_rep_hull_yard',name:"Hull-breaker's yard",branch:'republican',family:'Industry',tags:HTAG_SALV('poor',['industry']),w:32,d:30,h:17,build:buildHlRepHullYard});
