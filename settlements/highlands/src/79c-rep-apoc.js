// ================================================================= REPUBLICAN — the scrap quarter (round 8)
// Travis: "10 more post-apoc buildings that are still consistent with the overall style, including a scrap warehouse
// roofed in a gigantic curved hull panel, a Scrap Kontor, container/silo/tank housing and shops" (after a sheet of
// stacked-container towers, grain-silo cottages, tank clusters, a crawler camp, a jib-crane garage and a lantern stall).
// The wreck supplies the SHELL — shipping containers in faded paint, corrugated silos, tanks, a crawler's hull, a
// curved panel of rocket hull — and the Highland Republic supplies everything built onto it: frame storeys with their
// brackets and galleries (73b), steep Alpine gables with lace, lattice windows, triskelion balustrades, painted signs.
// All born reclaimed (tags.salvage): no `_reclaimed` twins.
const hri=(a,b)=>a+Math.floor(rng()*(b-a+1));
const HCONT=[0xa8382c,0xc89a30,0x3f7a4a,0x3a6aa8,0x2e8a88,0xb86a2a,0x7a6a5a,0x8a4a6a];
const hContC=()=>hC(vPick(HCONT)).lerp(hC(0x8a7a68),rr(.15,.4));                 // container paint, sun-faded toward grey
kdef('hSiloC',new THREE.CylinderGeometry(1,1,1,28,1).translate(0,.5,0),MAT.corrugate);   // corrugated silo, base at y=0
kdef('hTankCap',VDOME,MAT.rust);
// the vault: a unit arc of hull (radius 1, length 1 along x) spanning `arc` radians about the top; y=0 is the arc's centre
function hlVaultGeo(arc,seg){const pos=[],uv=[],idx=[];for(let i=0;i<=seg;i++){const a=-arc/2+arc*i/seg;for(const x of[-.5,.5]){pos.push(x,Math.cos(a),Math.sin(a));uv.push(x+.5,i/seg);}}
 for(let i=0;i<seg;i++){const b=i*2;idx.push(b,b+2,b+1,b+1,b+2,b+3);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;}
MAT.hHull=hStd({color:0xffffff,roughness:.6,metalness:.35});
kdef('hVault',hlVaultGeo(Math.PI*.84,28),MAT.hHull);kdef('hVaultR',hlVaultGeo(Math.PI*.84,28),MAT.rust);
// a shipping container: corrugated body in faded paint, dark corner posts and rails, the door end at +x (local), windows
// cut in the +z side at the listed positions, or (shop) the whole +z side opened under a striped awning
function hnCont(x,y,z,ry,L,c,o){o=o||{};const H=2.6,D=2.44,dk=c.clone().multiplyScalar(.5);vB('vCorr',x,y,z,L,H,D,ry,c);
 for(const sx of[-1,1])for(const sz of[-1,1]){const p=loc(x,z,sx*(L/2-.06),sz*(D/2-.04),ry);vB('vIron',p[0],y,p[1],.16,H+.02,.16,ry,dk);}
 for(const sz of[-1,1])for(const yy of[0,H-.14]){const p=loc(x,z,0,sz*(D/2+.01),ry);vB('vIron',p[0],y+yy,p[1],L,.14,.05,ry,dk);}
 {const p=loc(x,z,L/2+.02,0,ry);vB('vIron',p[0],y+.15,p[1],.04,H-.3,D-.3,ry,dk);for(const u of[-.75,-.35,.35,.75]){const q=loc(x,z,L/2+.06,u,ry);vB('vIron',q[0],y+.2,q[1],.04,H-.4,.04,ry,hC(0x2e2a26));}}
 for(const u of o.win||[]){const p=loc(x,z,u,D/2+.02,ry);hnLatWin(p[0],y+.95,p[1],ry,1,1,o.kind||'glass',null);}
 if(o.door!=null){const p=loc(x,z,o.door,D/2+.03,ry);vnDoor(p[0],y+.02,p[1],ry,.9,2.05,'hPaint',hC(vPick(HFRAME.post)),hC(vPick(HPAL.tar)),false);}
 if(o.shop){const p=loc(x,z,0,D/2-.02,ry);vB('vDarkB',p[0],y+.1,p[1],L-.5,H-.45,.06,ry);const a=loc(x,z,0,D/2+.75,ry);
  kput('vClothB',[a[0],y+H-.28,a[1]],qEuler(0,ry,0).multiply(qEuler(.35,0,0)),[L-.2,.05,1.6],hC(vPick([0xc03a2a,0x2e8a88,0xd8a030,0x3a6aa8])));
  const k=loc(x,z,0,D/2+.3,ry);vB('vWood',k[0],y,k[1],L-.8,.95,.5,ry,hC(vPick(HPAL.aged)));}}
function hnSolar(x,y,z,ry,w,d){for(const s of[-1,1]){const p=loc(x,z,s*(w/2-.2),0,ry);vB('vIron',p[0],y,p[1],.06,.55,.06,ry,hC(0x3a3430));}
 kput('hPaint',[x,y+.55,z],qEuler(0,ry,0).multiply(qEuler(-.5,0,0)),[w,.05,d],hC(0x1e2a48));kput('hPaint',[x,y+.575,z],qEuler(0,ry,0).multiply(qEuler(-.5,0,0)),[w*.98,.02,.04],hC(0x8a96a8));}
function hnDish(x,y,z,ry,r){vPst('vIron',x,y,z,.05,r*.8,hC(0x3a3430));kput('vDomeS',[x,y+r*.8,z],qEuler(0,ry,0).multiply(qEuler(Math.PI/2+.45,0,0)),[r,r*.32,r],hC(0xd8d4c8));}
function hnMast(x,y,z,w,h,c){c=c||hC(0x4a4440);for(const sx of[-1,1])for(const sz of[-1,1])beam('vIron',[x+sx*w/2,y,z+sz*w/2],[x+sx*w*.2,y+h,z+sz*w*.2],.08,.08,c);
 const n=Math.round(h/2.2);for(let k=1;k<n;k++){const t=k/n,hw=w/2*(1-.8*t)+w*.1*t,yy=y+h*t;for(const [a,b] of[[[-1,-1],[1,-1]],[[1,-1],[1,1]],[[1,1],[-1,1]],[[-1,1],[-1,-1]]])beam('vIron',[x+a[0]*hw,yy,z+a[1]*hw],[x+b[0]*hw,yy,z+b[1]*hw],.05,.05,c);}}
// a paper lantern hung from (x,y,z): furniture, the catalog's (its paper drew a colour); its hook rope ends at y+.3
function hnLantern(x,y,z){rng();return FURNISH('hl_rep_paper_lantern',x,y-.45,z,0,{v:0});}
function hnBunting(a,b,n){hnCable(a,b,hC(0x3a3028));for(let i=1;i<n;i++){const t=i/n,p=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t-Math.sin(t*Math.PI)*.4,a[2]+(b[2]-a[2])*t];
 kput('hPaint',[p[0],p[1]-.18,p[2]],qEuler(0,Math.atan2(b[0]-a[0],b[2]-a[2])+Math.PI/2,0),[.3,.36,.02],hC(vPick([0xc0302a,0xd8a030,0x2e8a88,0x3a6aa8,0xefe7d6])));}}
function hnPole(x,z,h,to){vPst('vPost',x,0,z,.14,h,hC(0x5a4636));vB('vWood',x,h-.6,z,1.4,.12,.12,0,hC(0x5a4636));for(const t of to||[])hnCable([x,h-.55,z],t,null);}

// ---------------------------------------------------------------- 1. the hull-vault warehouse
// A great curved panel of rocket hull, ribbed and riveted, laid as the roof of a long store: its edges on posts capped by
// bracket sets, plank-and-plate walls between the posts, plank ends stepped up under the arc, sliding doors under a
// painted board at the front, two drum ventilators on the crown.
function buildHlRepHullVault(G,o){reseed(21841+(o.v|0));const L=26,R=8.2,arc=Math.PI*.84,he=Math.cos(arc/2)*R,hw=Math.sin(arc/2)*R,eave=3.6,yc=eave-he;
 const rust=hC(vPick(HSV.rust)),hull=hC(vPick([0x9a968c,0x8e8a80,0xa49e90])),post=hC(vPick(HFRAME.postPoor)),plank=hC(vPick(HFRAME.plank)),iron=hC(0x3a3430),lit=vLit()?'lit':'glass';
 vnReg('Hull-vault warehouse',0,0,15,yc+R+1);
 vB('boxCR',0,0,0,L+1,.4,2*hw+1,0,hC(vPick(HSV.conc)));
 kput('hVault',[0,.4+yc,0],null,[L,R,R],hull);                                                                          // the panel
 for(let k=0;k<=8;k++){const x=-L/2+L*k/8;kput('hVaultR',[x,.4+yc,0],null,[.3,R+.06,R+.06],rust);}                      // ribs
 for(const s of[-1,1]){const n=9;for(let i=0;i<=n;i++){const x=-L/2+.3+(L-.6)*i/n,p=[x,s*(hw-.25)];kput('hCol',[p[0],.4,p[1]],null,[.16,eave-.4-.35,.16],post);hnDougong(p[0],eave-.35,p[1],s>0?0:Math.PI,.36);}
  vB('hPlankB',0,.4,s*(hw-.45),L-.4,eave-.9,.12,0,plank);vnPatch(rr(-8,8),.8,s*(hw-.35),s>0?0:Math.PI,5,1.8,6);vnPatch(rr(-8,8),.8,s*(hw-.35),s>0?0:Math.PI,4,1.6,5);
  for(const x of[-9,-3,3,9]){const p=[x,s*(hw-.38)];hnLatWin(p[0],1.6,p[1],s>0?0:Math.PI,1.3,.8,lit,null);}}
 for(const e of[-1,1]){const x=e*(L/2-.1);for(let u=-hw+.4;u<hw;u+=.8){const h=yc+Math.sqrt(Math.max(0,R*R-u*u))-.15;vB('hPlankB',x,.4,u,.14,h,.82,0,plank);}}   // the ends, stepped under the arc
 const fx=L/2+.05;vB('vDarkB',fx,.4,0,.08,5.2,6,0);for(const s of[-1,1])vB('hPlankB',fx+.1,.4,s*2.4,.1,5.2,1.8,0,plank.clone().multiplyScalar(1.15));vB('vIron',fx+.2,5.7,0,.1,.12,8,0,iron);
 hnSignBoard(fx+.08,6.4,0,Math.PI/2,5,1.1,'rocket');
 for(const x of[-6,6]){vnBarrel(x,.4+yc+R-.05,0,.5,.8,rust);kput('vConeI',[x,.4+yc+R+.75,0],null,[.6,.35,.6],iron);}
 for(let k=0;k<4;k++)for(let j=0;j<hri(3,6);j++)hlRngSkip(4);FURNISH('hl_rep_plate_stack',L/2+2.5,0,-hw+3.1,Math.PI/2,{v:0});}   // the plates stacked by the doors

// ---------------------------------------------------------------- 2. the Scrap Kontor
// Where salvage is weighed, priced and paid for: two containers are the ground floor and the strongroom; a frame storey
// on them (a gallery on the street side most of the time) under a gable; a lookout at one end under a hip; a weighbridge
// and its booth before the door; the scales on a hanging sign and a painted board; a flagpole with the Republic's emblem.
function buildHlRepKontor(G,o){reseed(21851+(o.v|0));const iron=hC(0x3a3430),lit=vLit()?'lit':'glass',slate=hC(vPick(HPAL.slate)),cream=hC(vPick(HPAL.stucco));
 vnReg('Scrap Kontor',0,0,9,14);
 hnCont(0,0,-1.25,0,12,hContC(),{win:[-4,2,4.5]});hnCont(0,0,1.25,0,12,hContC(),{win:[-4.2,3.5],door:0,kind:lit});
 hnFachBox(0,2.6,0,12.4,3,5.4,0,cream,null,lit);const top=hnGable(0,5.6,0,12.4,5.4,1.5,0,'hGableSc',slate,.6,'vGablePl',cream);
 hnBarge(0,5.6,0,12.4,5.4,1.5*2.7,0,.6,hC(HPAL.white),'lace');
 hnFachBox(-4.3,5.6,.2,3.4,2.6,3.4,0,cream,null,lit);vnHipRoof('hHipSc',-4.3,8.2,.2,3.4,3.4,2,0,slate,.5);vPst('vIron',-4.3,10.2,.2,.03,1,iron);vBall('hGold',-4.3,11.2,.2,.14,hC(HPAL.gold[0]));
 hnSignBoard(1.5,2.75,2.6,0,4,.9,'scales');hnSign(6.2,2.3,2.55,0,'gear');
 vB('vIron',0,0,5,4.4,.14,3,0,iron);vB('vIron',0,.14,5,4.2,.02,2.8,0,hC(0x6a6258));                                    // the weighbridge
 vB('hPlankB',3.2,0,5.4,1.4,2.2,1.4,0,hC(vPick(HFRAME.plank)));vnShedRoof(3.2,2.2,5.4,1.6,1.6,.3,0,'vCorr',hC(vPick(HSV.corr)),.2);hnLatWin(3.2,1,6.12,0,.7,.6,lit,null);
 vB('vIron',-6.8,0,-1.2,1.6,2.4,2.6,0,iron);kput('vHoop',[-7.62,1.2,-1.2],qEuler(0,Math.PI/2,0),[.45,.45,2],hC(0x6a6258));  // the strongroom door
 const fx=6.8,fz=4.4;vPst('vPipe',fx,0,fz,.06,9,iron);vB('hPaint',fx+.75,7.6,fz,1.5,1,.03,0,hC(HPAL.red));hnEmblem(fx+.75,8.1,fz+.03,0,.7);
 for(let k=0;k<9;k++)hnLantern(-5.6+k*1.4,2.52,2.62);
 vnStairs(7.3,0,-1,Math.PI/2,1.2,2.6,8,'vWood',hC(vPick(HPAL.aged)));}

// ---------------------------------------------------------------- 3. the container stack
// Six containers in three levels, crossed and cantilevered, a frame storey with its gable on top: a stair up the front,
// a plank walkway with a carved balustrade along the first level, a ladder to the second; a cistern, solar panels, a
// dish and a washing line on the roofs.
function buildHlRepContStack(G,o){reseed(21861+(o.v|0));const lit=vLit()?'lit':'glass',log=hC(vPick(HPAL.aged)),corr=hC(vPick(HSV.corr));
 vnReg('Container stack',0,0,8,16);
 hnCont(0,0,-1.25,0,12,hContC(),{win:[-3.5,1.5],door:4.5,kind:lit});hnCont(0,0,1.25,0,12,hContC(),{win:[-4,-1,2],door:4.8,kind:lit});
 hnCont(1.6,2.6,-1.25,0,12,hContC(),{win:[-3,0,3],kind:lit});hnCont(-3,2.6,1.25,0,6,hContC(),{win:[-1.4,1],door:2,kind:lit});
 hnCont(-1.4,5.2,0,Math.PI/2,6,hContC(),{win:[-1.5,1.5],kind:lit});
 hnFachBox(3.6,5.2,0,4.8,2.8,4.8,0,null,null,lit);hnGable(3.6,8,0,4.8,4.8,1.6,0,'vCorr',corr,.5,'vGableW',log);hnBarge(3.6,8,0,4.8,4.8,1.6*2.4,0,.5,hC(HPAL.white),'lace');
 vnStairs(6.9,0,2.9,Math.PI/2,1.1,2.6,8,'vWood',log);                                                                    // up to the walkway
 vB('vWood',1.2,2.52,3.1,10.8,.12,1.3,0,log);for(let i=0;i<5;i++)kput('hCol',[-4+i*2.4,0,3.7],null,[.08,2.52,.08],hC(vPick(HFRAME.postPoor)));
 kput('hRailC',[1.2,3,3.72],null,[10.6,.7,1],log);vnLadder(-4.2,2.6,2.5,0,2.6,log);
 kput('hTankC',[-2.6,7.8+.8,0],null,[.9,1.6,.9],hC(vPick(HSV.rust)));hnSolar(-.6,7.8,-1.2,0,2.2,1.2);hnDish(-.2,7.8,1.6,0,.8);
 hnCable([-3.8,8.5,1.6],[1.1,8.5,1.6]);for(let k=0;k<5;k++)kput('vCloth',[-3.2+k*.9,8.1,1.6],null,[.6,.7,1],hC(vPick([0xefe7d6,0x3a6aa8,0xc0302a,0xd8a030])));}

// ---------------------------------------------------------------- 4. the silo house
// A corrugated grain silo made a house: windows cut in two rings, a red door, a flared shingle cone with a finial; a
// wrap-round porch on bracketed posts; a two-storey frame annex at the side with an outside stair to its balcony.
function buildHlRepSiloHouse(G,o){reseed(21871+(o.v|0));const R=3,H=6.2,lit=vLit()?'lit':'glass',log=hC(vPick(HPAL.aged)),sh=hC(vPick(HPAL.shingle)),post=hC(vPick(HFRAME.post));
 vnReg('Silo house',0,0,7,H+4);
 vB('boxCR',0,0,0,2*R+.6,.4,2*R+.6,0,hC(vPick(HSV.conc)));kput('hSiloC',[0,.4,0],null,[R,H,R],hC(vPick([0xc8c4b8,0xb8b4a8,0xa8a498])));
 for(const y of[1.6,3.8,5.8])kput('vHoop',[0,.4+y,0],qEuler(Math.PI/2,0,0),[R*1.005,R*1.005,1],hC(0x8a8478));
 for(const [a,yy] of[[.4,1.2],[-.6,1.2],[1.4,1.2],[0,3.8],[1,3.8],[-1,3.8],[2.6,3.8]]){const p=[Math.sin(a)*R,Math.cos(a)*R];hnLatWin(p[0],.4+yy,p[1],a,.9,1.05,lit,null);}
 vnDoor(Math.sin(-1.4)*R,.4,Math.cos(-1.4)*R,-1.4,1,2.1,'hPaint',hC(HPAL.red),hC(0xa8302a),false);
 kput('hTentSh',[0,.4+H-.1,0],null,[R*1.35,2.8,R*1.35],sh);vPst('vIron',0,.4+H+2.6,0,.03,1,hC(0x2e2a26));vBall('hGold',0,.4+H+3.6,0,.13,hC(HPAL.gold[0]));
 for(let k=0;k<12;k++){const a=k/12*TAU;hnDougong(Math.sin(a)*R*1.02,.4+H-.5,Math.cos(a)*R*1.02,a,.28);}
 // the porch: five facets on the street side
 const PR=R+1.7;for(let k=0;k<5;k++){const a0=-1.2+k*.6,a1=a0+.6,am=(a0+a1)/2,p0=[Math.sin(a0)*PR,Math.cos(a0)*PR],p1=[Math.sin(a1)*PR,Math.cos(a1)*PR],L=Math.hypot(p1[0]-p0[0],p1[1]-p0[1]);
  const m=[Math.sin(am)*(R+.85),Math.cos(am)*(R+.85)];vB('vWood',m[0],.3,m[1],L+.3,.14,1.8,am,log);
  kput('hCol',[p0[0],.44,p0[1]],null,[.1,2.5,.1],post);hnDougong(p0[0],2.94,p0[1],a0,.25);
  const r=[Math.sin(am)*(PR-.05),Math.cos(am)*(PR-.05)];kput('hRailC',[r[0],.8,r[1]],qEuler(0,am,0),[L-.2,.7,1],log);
  const s=[Math.sin(am)*(R+.95),Math.cos(am)*(R+.95)];kput('vShingleB',[s[0],3.35,s[1]],qEuler(0,am,0).multiply(qEuler(.35,0,0)),[L+.35,.1,2.3],sh);}
 // the annex
 hnFachBox(-5.4,.4,-1,3.6,2.8,4.2,0,null,null,lit);hnFachBox(-5.4,3.2,-1,3.6,2.6,4.2,0,null,null,lit);
 hnGable(-5.4,5.8,-1,4.2,3.6,1.7,Math.PI/2,'vShingleB',sh,.5,'vGableW',log);hnBarge(-5.4,5.8,-1,4.2,3.6,1.7*1.8,Math.PI/2,.5,hC(HPAL.white),'lace');
 vnStairs(-7.8,.4,1.4,Math.PI/2,1,2.8,9,'vWood',log);vnChimney(-6.4,4.5,-2.4,3.4,.12,true);
 for(let k=0;k<6;k++)kput('vClayPot',[rr(-2.4,2.4),.44,PR-.5],null,[.22,.28,.22],hC(0x9a5a3a));}

// ---------------------------------------------------------------- 5. the tank-cluster row
// Three standing tanks of different heights, windows cut in rings, domed caps (the tallest crowned with a tent and a
// wind charger), a frame house wedged between them at the foot, plank bridges with carved balustrades between their
// doors at two levels, ladders, pipes.
function buildHlRepTankRow(G,o){reseed(21881+(o.v|0));const lit=vLit()?'lit':'glass',log=hC(vPick(HPAL.aged)),iron=hC(0x3a3430),sh=hC(vPick(HPAL.shingle));
 vnReg('Tank-cluster row',0,0,10,14);
 const T=[{x:-6.5,r:2.5,h:9,c:hC(vPick([0x3f6a4a,0x4a7a5a]))},{x:0,r:2.1,h:7,c:hC(vPick(HSV.rust))},{x:6.5,r:2.8,h:11.5,c:hC(vPick([0x3a5a7a,0x4a6a8a]))}];
 for(const t of T){vB('boxCR',t.x,0,0,2*t.r+.5,.35,2*t.r+.5,0,hC(vPick(HSV.conc)));kput('hTankC',[t.x,.35+t.h/2,0],null,[t.r,t.h,t.r],t.c);kput('hTankCap',[t.x,.35+t.h,0],null,[t.r,t.r*.4,t.r],t.c.clone().multiplyScalar(.9));
  for(let y=2.4;y<t.h-.6;y+=2.8){kput('vHoop',[t.x,.35+y+1.4,0],qEuler(Math.PI/2,0,0),[t.r*1.005,t.r*1.005,1],iron);for(const a of[.35,-.5,1.3])hnLatWin(t.x+Math.sin(a)*t.r,.35+y-.4,Math.cos(a)*t.r,a,.8,.9,lit,null);}
  vnDoor(t.x,.35,t.r+.02,0,.9,2,'hPaint',hC(vPick(HFRAME.postPoor)),hC(vPick(HPAL.tar)),false);}
 {const t=T[2];kput('hTentSh',[t.x,.35+t.h+t.r*.3,0],null,[1.6,2.2,1.6],sh);vPst('vPipeR',t.x+1,.35+t.h+.5,0,.06,4,null);hnRotor(t.x+1,.35+t.h+4.5,.2,0,1.4,hC(vPick(HSV.rust)));}
 // the frame house between the first two, and its gable
 hnFachBox(-3.2,0,2.4,3.4,2.8,3.4,0,null,null,lit);hnGable(-3.2,2.8,2.4,3.4,3.4,1.6,Math.PI/2,'vCorr',hC(vPick(HSV.corr)),.4,'vGableW',log);
 // the bridges, at the second and third ring of windows
 for(const [a,b,y] of[[0,1,3.4],[1,2,3.4],[0,1,6.2],[1,2,6.2]]){if(y>T[a].h||y>T[b].h)continue;const x0=T[a].x+T[a].r-.1,x1=T[b].x-T[b].r+.1,xm=(x0+x1)/2,L=x1-x0;
  vB('vWood',xm,y,0,L,.12,1.2,0,log);for(const s of[-1,1])kput('hRailC',[xm,y+.45,s*.6],null,[L,.7,1],log);}
 beam('spipe',[T[0].x+1,1.2,-T[0].r+.2],[T[2].x-1,1.2,-T[2].r+.2],.18,.18,hC(vPick(HSV.rust)));
 vnLadder(T[1].x+1.6,0,T[1].r+.3,0,3.4,log);}

// ---------------------------------------------------------------- 6. the crawler house
// A dead tracked hauler from the spaceport, its engine hood still at the front: on its deck a container and a frame
// house with a steep gable, a carved balustrade round the deck, a ladder down, bunting from a mast with a dish.
function buildHlRepCrawler(G,o){reseed(21891+(o.v|0));const rust=hC(vPick(HSV.rust)),dark=hC(0x3a3028),iron=hC(0x3a3430),lit=vLit()?'lit':'glass',log=hC(vPick(HPAL.aged));
 vnReg('Crawler house',0,0,9,11);
 for(const s of[-1,1]){const z=s*2.5;vB('vRustB',0,.25,z,10,1.5,1.2,0,dark);for(const e of[-1,1])kput('hTankC',[e*5,1,z],qEuler(Math.PI/2,0,0),[.78,1.2,.78],dark);
  for(let k=0;k<6;k++)kput('vHoop',[-3.8+k*1.5,.75,z+s*.62],null,[.5,.5,2],iron);for(let k=0;k<20;k++)vB('vIron',-5+k*.52,1.72,z,.2,.06,1.25,0,iron);}
 vB('vRustB',-.4,1.3,0,10.2,1.5,4,0,rust);vB('vRustB',5.8,1.1,0,2.4,1.9,3.6,0,rust);for(let k=0;k<6;k++)vB('vIron',7.02,1.4+k*.24,0,.05,.1,3,0,iron);   // hull and hood, the grille
 vPst('vPipeR',5,3,1.4,.12,2.2,null);kput('vConeI',[5,5.2,1.4],null,[.14,.3,.14],iron);
 vB('vWood',-.4,2.8,0,10.4,.14,4.6,0,log);
 hnCont(-2.8,2.94,-.6,0,6,hContC(),{win:[-1.6,1],door:0,kind:lit});
 hnFachBox(2.2,2.94,0,3.6,2.7,4.2,0,null,null,lit);hnGable(2.2,5.64,0,4.2,3.6,1.7,Math.PI/2,'vCorr',hC(vPick(HSV.corr)),.4,'vGableW',log);
 for(const [a,b] of[[[-5.5,2.2],[4.6,2.2]],[[-5.5,-2.2],[4.6,-2.2]]]){kput('hRailC',[(a[0]+b[0])/2,3.35,a[1]],null,[b[0]-a[0],.7,1],log);}
 vnLadder(4.8,0,2.3,0,2.94,log);
 vPst('vPipeR',-5.2,2.94,-1.8,.06,6,null);hnDish(-5.2,8.9,-1.8,Math.PI/4,.7);hnBunting([-5.2,8.2,-1.8],[2.2,7,0],8);}

// ---------------------------------------------------------------- 7. the salvage garage
// A two-storey frame tower on a plank-and-rubble ground floor, a timber jib crane swung out from its upper storey with
// a pulley, chain and hook; a carport under a shed roof sheltering a wrecked car on blocks; a water tank on a steel
// stand behind; tyres, drums, a red tool chest; the gear on the hanging sign.
function buildHlRepGarage(G,o){reseed(21901+(o.v|0));const lit=vLit()?'lit':'glass',log=hC(vPick(HPAL.aged)),iron=hC(0x3a3430),rust=hC(vPick(HSV.rust)),corr=hC(vPick(HSV.corr));
 vnReg('Salvage garage',0,0,8,14);
 vB('hRubB',-2.4,0,-.5,5,3,5,0,hC(vPick(HPAL.rubble)));vnDoor(-2.4,0,2.02,0,1,2.1,'hPaint',hC(0x3f7a4a),hC(0x3f7a4a),false);hnLatWin(-3.9,1.2,2.01,0,.8,.7,lit,null);
 hnFachBox(-2.4,3,-.5,5,2.8,5,0,null,null,lit);const top=hnGable(-2.4,5.8,-.5,5,5,1.7,0,'vCorr',corr,.5,'vGableW',log);hnBarge(-2.4,5.8,-.5,5,5,1.7*2.5,0,.5,hC(HPAL.white),'lace');
 // the jib
 beam('vWood',[-4.9,5.2,1.2],[-8.6,7.6,1.2],.28,.28,log);beam('vWood',[-4.9,3.4,1.2],[-7.2,6.7,1.2],.2,.2,log);kput('vHoop',[-8.4,7.3,1.2],null,[.3,.3,2],iron);
 hnCable([-8.4,7,1.2],[-8.4,4.2,1.2],iron);kput('vHoop',[-8.4,4,1.2],qEuler(0,Math.PI/2,0),[.2,.2,2.5],iron);
 // the carport and the wreck
 for(const x of[1.2,6.4])for(const z of[-2.6,2.6])kput('hCol',[x,0,z],null,[.12,3,.12],hC(vPick(HFRAME.postPoor)));
 kput('vCorr',[3.8,3.2,0],qEuler(0,0,-.16),[6,.1,6.2],corr);
 vB('vRustB',4,.55,0,4.2,.9,1.9,0,rust);vB('vRustB',3.7,1.45,0,2.2,.7,1.8,0,rust);vB('vDarkB',3.7,1.5,0,2.3,.5,1.82,0);
 for(const x of[2.6,5.4])for(const z of[-.95,.95]){vB('boxCR',x,0,z,.4,.4,.4,0,hC(0x8a8478));}
 FURNISH('pa_tyre_stack',7.6,0,-2,0,{v:1});   // tyres
 // the water tank on its stand, drums, the tool chest, the sign, a lamp
 FURNISH('hl_rep_cistern',-2.4,0,-3.8,0,{v:1});   // the water tank on its steel stand
 hnBarrel(.4,0,2.6,.3,.85);hnBarrel(.9,0,3.1,.3,.85);   // (the red tool chest stood inside the tower's walls: the interiors' room)
 hnSign(.1,2.6,1.6,Math.PI/2,'gear');hnLampPost(8,0,3,4);}

// ---------------------------------------------------------------- 8. the container shop row
// Three containers opened as shops under striped awnings, counters out front, goods piled, a hanging sign each; a frame
// storey with a gable over the middle one, corrugated shed roofs over the other two; bunting and lanterns.
function buildHlRepContShops(G,o){reseed(21911+(o.v|0));const lit=vLit()?'lit':'glass',log=hC(vPick(HPAL.aged)),corr=hC(vPick(HSV.corr));
 vnReg('Container shops',0,0,10,9);
 const syms=['bread','key','boot','fish','candle','flask'];
 for(const [i,x] of[[0,-6.3],[1,0],[2,6.3]]){hnCont(x,0,0,0,6,hContC(),{shop:true});hnSign(x+2.6,2.3,1.3,0,syms[(i*2+hri(0,1))%syms.length]);
  for(let k=0;k<4;k++){const u=x+rr(-2.2,2.2);if(rng()<.5)hnBarrel(u,0,2.2,.25,.7,hC(vPick([0x5a4a3e,0x6a5040])));else hnCrate(u,0,2.2,.6,rr(0,1),log);}
  if(i!==1)vnShedRoof(x,2.6,0,6.2,2.6,.4,0,'vCorr',corr,.3);}
 hnFachBox(0,2.6,0,6,2.6,2.8,0,null,null,lit);hnGable(0,5.2,0,6,2.8,1.6,0,'vCorr',corr,.5,'vGableW',log);hnBarge(0,5.2,0,6,2.8,1.6*1.4,0,.5,hC(HPAL.white),'lace');
 hnBunting([-9.3,2.8,1.4],[-3,4.8,1.4],6);hnBunting([3,4.8,1.4],[9.3,2.8,1.4],6);for(const x of[-7.8,-4.8,4.8,7.8])hnLantern(x,2.55,2.4);}

// ---------------------------------------------------------------- 9. the lantern stall
// A deep open shopfront on red lacquered posts — shelves of pots and jars, a counter, strings of paper lanterns — under a
// red corrugated awning; above it a whitewashed room with lattice windows under a steep red tile gable, a brick stack at
// the side, a rooftop box of greens; a leaning utility pole with lanterns and wires to the eaves.
function buildHlRepLanternStall(G,o){reseed(21921+(o.v|0));const lit=vLit()?'lit':'glass',post=hC(vPick(HFRAME.post)),red=hC(vPick(HPAL.roofRed)),plank=hC(vPick(HFRAME.plank)),log=hC(vPick(HPAL.aged));
 vnReg('Lantern stall',0,0,6,11);
 vB('hPlankB',0,0,-1.6,7,3,.12,0,plank);for(const s of[-1,1])vB('hPlankB',s*3.44,0,0,.12,3,3.3,0,plank);vB('vDarkB',0,.05,-1.5,6.7,2.9,.05,0);
 for(const x of[-3.4,-1.1,1.1,3.4])kput('hCol',[x,0,1.62],null,[.12,3,.12],post);vB('hPaint',0,2.9,1.62,7.1,.22,.2,0,post);
 hlRngSkip(54);   // the shelves of pots and the counter stood in the stall: the interiors' room (the pots drew 54 numbers)
 for(let k=0;k<7;k++)hnLantern(-3+k,2.75,1.9);
 kput('vCorr',[0,3.25,2.2],qEuler(.28,0,0),[7.6,.08,1.9],red);
 vB('vPlaster',0,3,0,6.2,2.8,3.6,0,hC(0xe8e2d4));hnLatWin(-1.5,3.8,1.82,0,1.1,1.1,lit,null);hnLatWin(1.5,3.8,1.82,0,1.1,1.1,lit,null);hnLatWin(3.12,3.8,0,Math.PI/2,.8,.9,lit,null);
 const top=hnGable(0,5.8,0,6.2,3.6,1.8,0,'hGableSc',red,.6,'vGablePl',hC(0xe8e2d4));hnBarge(0,5.8,0,6.2,3.6,1.8*1.8,0,.6,hC(HPAL.white),'lace');
 hnSignBoard(0,5,1.84,0,3,.7,'candle');
 hnStoneChimney(-3.6,0,-.6,9.6,.8);hlRngSkip(6);FURNISH('iziz_vern_planter',1.6,top-.2,.2,0,{v:1});   // the rooftop box of greens
 const px=4.8,pz=2.4;kput('vPost',[px,0,pz],qEuler(0,0,-.05),[.14,7.5,.14],hC(0x5a4636));vB('vWood',px+.3,6.8,pz,1.4,.12,.12,0,hC(0x5a4636));
 hnCable([px,6.9,pz],[3.1,5.4,1.8]);hnCable([px,6.9,pz],[9,6.4,4]);for(const y of[5.4,4.2])hnLantern(px+.5,y,pz);}

// ---------------------------------------------------------------- 10. the radome tower house
// Containers stacked four high round a frame storey and a lookout under a hip, beside a steel lattice mast that carries
// a salvaged radome and a dish; a zig-zag stair up the side, solar panels, a cistern.
function buildHlRepRadomeTower(G,o){reseed(21931+(o.v|0));const lit=vLit()?'lit':'glass',log=hC(vPick(HPAL.aged)),slate=hC(vPick(HPAL.slate));
 vnReg('Radome tower house',0,0,8,24);
 hnCont(0,0,-1.25,0,12,hContC(),{win:[-4,-1,3],kind:lit});hnCont(0,0,1.25,0,12,hContC(),{win:[-3.5,0,3.5],door:-5,kind:lit});
 hnFachBox(-1,2.6,0,6,2.8,5,0,null,null,lit);hnCont(3.9,2.6,0,Math.PI/2,6,hContC(),{win:[-1.5,1.5],kind:lit});
 hnCont(-1,5.4,-.4,0,6,hContC(),{win:[-1.5,1.4],kind:lit});hnFachBox(-1,8,-.4,3.4,2.4,2.8,0,null,null,lit);vnHipRoof('hHipSc',-1,10.4,-.4,3.4,2.8,1.8,0,slate,.5);
 hnSolar(3.9,5.2,0,Math.PI/2,2.4,1.4);kput('hTankC',[1.9,5.4+.7,0],null,[.7,1.4,.7],hC(vPick(HSV.rust)));
 hnMast(6.8,0,-3.2,2.4,20);kput('vBallW',[6.8,20+1.9,-3.2],null,[2.1,2.1,2.1],hC(0xe8e4dc));vB('vIron',6.8,19.6,-3.2,1.2,.4,1.2,0,hC(0x3a3430));hnDish(7.6,14,-2.4,Math.PI*.25,1);
 // the zig-zag stair up the +x side
 for(const [y0,z0,dir] of[[0,2.8,-1],[2.6,-2.8,1],[5.2,2.8,-1]]){const zc=z0+dir*1.3;vnStairs(7.3,y0,zc,dir>0?Math.PI:0,1,2.6,8,'vWood',log);vB('vWood',7.3,y0+2.5,z0+dir*2.6+dir*.6,1.2,.12,1.2,0,log);}}

const HTAG_APOC=(wealth,type,more)=>Object.assign({type,wealth,lit:false,salvage:true},more||{});
HL.def({key:'hl_rep_hull_vault',name:'Hull-vault warehouse',branch:'republican',family:'Industry',tags:HTAG_APOC('poor',['industry','warehouse']),w:34,d:20,h:12,build:buildHlRepHullVault});
HL.def({key:'hl_rep_kontor',name:'Scrap Kontor',branch:'republican',family:'Shops and workshops',tags:HTAG_APOC('middle',['market/shop'],{lit:true}),w:17,d:14,h:12,build:buildHlRepKontor});
HL.def({key:'hl_rep_cont_stack',name:'Container stack',branch:'republican',family:'Dwellings',tags:HTAG_APOC('poor',['multi-family dwelling']),w:16,d:9,h:11,build:buildHlRepContStack});
HL.def({key:'hl_rep_silo_house',name:'Silo house',branch:'republican',family:'Dwellings',tags:HTAG_APOC('poor',['single-family dwelling']),w:17,d:12,h:10,build:buildHlRepSiloHouse});
HL.def({key:'hl_rep_tank_row',name:'Tank-cluster row',branch:'republican',family:'Dwellings',tags:HTAG_APOC('poor',['multi-family dwelling']),w:22,d:8,h:15,build:buildHlRepTankRow});
HL.def({key:'hl_rep_crawler',name:'Crawler house',branch:'republican',family:'Dwellings',tags:HTAG_APOC('poor',['single-family dwelling']),w:16,d:7,h:10,build:buildHlRepCrawler});
HL.def({key:'hl_rep_garage',name:'Salvage garage',branch:'republican',family:'Shops and workshops',tags:HTAG_APOC('poor',['market/shop','industry']),w:19,d:10,h:11,build:buildHlRepGarage});
HL.def({key:'hl_rep_cont_shops',name:'Container shops',branch:'republican',family:'Shops and workshops',tags:HTAG_APOC('poor',['market/shop']),w:20,d:6,h:8,build:buildHlRepContShops});
HL.def({key:'hl_rep_lantern_stall',name:'Lantern stall',branch:'republican',family:'Shops and workshops',tags:HTAG_APOC('middle',['market/shop'],{lit:true}),w:11,d:6,h:9,build:buildHlRepLanternStall});
HL.def({key:'hl_rep_radome_tower',name:'Radome tower house',branch:'republican',family:'Dwellings',tags:HTAG_APOC('poor',['multi-family dwelling']),w:17,d:9,h:24,build:buildHlRepRadomeTower});
