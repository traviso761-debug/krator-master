// ================================================================= HYKKOUSOI — the Archon's Citadel (seeds 30625–30649)
// The fortress-palace on the Citadel stack at the drowned quarter's southern flank (DESIGN §2). The city's terrain makes
// the stack (CITY.STACKS[0]); this builder is what crowns it: y = 0 is the stack's top, +z the gate toward the city.
// A swept, ridge-backed main mass (a great shell dune: a tall vertical face at the centre sweeping down to both wings in
// concave curves, its body thick at the foot and pinched to a ridge, banded with relief) whose front face is a honeycomb
// of oval windows of varied sizes in thick bone surrounds that touch and merge, the infill between them a teal-and-gold
// mosaic; a vast pointed-arch recess at the centre, bone-rimmed, holds the gilded Tide-Mothers on their dais and opens
// through an oval door into the audience hall (a ribbed vault inside the mass); a broad stair climbs to it from the
// forecourt. Two tall and two short twisted spires and a shallow ribbed dome on its drum rise from the ridge in verdigris
// (the sea-green shell tint: no copper in the kit), gold-tipped; bone tendrils wrap the wings' feet. The forecourt toward
// the gate holds a long reflecting pool with three pearl fountains and its lanterns, a crescent colonnade of fluted bone
// columns under a nacre entablature curving round it, open at the centre for the gate path, and a small domed pavilion
// with a gilded figure to the east. A low lobed rampart with a blind arcade rings the precinct, the gate at +z. The west
// wing dives into a round bastion carrying the Warden's lodge, a nacre pod reached by a flight up the wing's face; its
// west door is the bridge door at the wall-walk height (+10.8) onto the lily-pad bridge head the city's span lands on
// (NAV_EXTRA own 'Citadel bridge head'). Reuses the Amphitriton's annulus, band, rail, pad, water and lamp-post helpers
// and 74c's straight flight.
function hykCitPodEl(P,y){const s=clamp((y-P.cy)/P.b,-.999,.999);return Math.asin(Math.sign(s)*Math.pow(Math.abs(s),1/(P.e1||1)));}
function buildHykCitadel(G,o){reseed(30625+(o.v|0));
 const col=hC(hPick(HPAL.shell)),colW=hC(hPick(HPAL.shellWarm)),coral=hC(hPick(HPAL.coral)),nac=hC(hPick(HPAL.nacre)),bone=hC(hPick(HPAL.bone)),teal=hC(hPick(HPAL.teal)),flo=hC(hPick(HPAL.floor)),poolC=hC(hPick(HPAL.teal),.85);
 const verd=hC(hPick(HPAL.seaGreen)),gold=hC(0xd9b65e),mosT=hC(hPick(HPAL.teal),.9),mosG=hC(0xc9a85a),inC=hC(hPick(HPAL.shell),.9);
 const ANG=HYK_AMPH_ANG;
 // ---- the mass: height h(x) (a plateau at the centre, concave sweeps to the wings, the feet to the ground), half-depth
 // d(x); a section at x is a superellipse quarter stood on the ground, bulging low (E1) and pinched to a ridge (E2)
 const XE=38,HW=33,HP=6,HC=45,HS=12,E1=.75,E2=1.45,MZ=-18,D0=15,Y0=-.8,YS=28,HF=3.6,AW=10,AS=7.5,HZ=-21;
 const hAt=x=>{const ax=Math.abs(x);if(ax<=HP)return HC;if(ax>=XE)return .3;if(ax<=HW){const t=(ax-HP)/(HW-HP);return HS+(HC-HS)*Math.pow(1-t,2.4);}const t=(ax-HW)/(XE-HW);return HS*Math.pow(Math.max(0,1-t*t),.6)+.3;};
 const dAt=x=>D0*(.42+.58*Math.pow(Math.max(0,1-Math.abs(x)/XE),1.1));
 const relief=(x,y)=>1+.014*Math.sin(y*1.35+1.2*Math.sin(x*.21))+.02*(fbm(x*.13,y*.3,23,2)-.5);
 const massPhi=(x,ph,side)=>{const h=hAt(x);const y=Y0+(h-Y0)*Math.pow(Math.sin(ph),E1);return [x,y,MZ+side*dAt(x)*Math.pow(Math.cos(ph),E2)*relief(x,y)];};
 const phiAtY=(x,y)=>{const h=hAt(x);const s=clamp((y-Y0)/(h-Y0),0,.9995);return Math.asin(Math.pow(s,1/E1));};
 const massAtY=(x,y,side)=>massPhi(x,phiAtY(x,y),side);
 const massN=(x,y,side)=>{const p=massAtY(x,y,side),px=massAtY(x+.05,y,side),py=massAtY(x,y+.05,side);
  const n=new THREE.Vector3(py[0]-p[0],py[1]-p[1],py[2]-p[2]).cross(new THREE.Vector3(px[0]-p[0],px[1]-p[1],px[2]-p[2])).normalize();if(n.z*side<0)n.negate();return [n.x,n.y,n.z];};
 const bandCol=(u,v,p)=>{const b=.5+.5*Math.sin(p[1]*1.35+1.2*Math.sin(p[0]*.21));return colW.clone().lerp(coral,.5*b*b*b);};
 const mosCol=(u,v,p)=>fbm(p[0]*.7,p[1]*.7,17,2)>.53?mosG:mosT;
 // ---- the honeycomb: rows of ovals over the front face, sizes and heights varied, packed so their surrounds touch; the
 // great arch's zone and the tall central window's are kept clear; two sparse rows on the back
 const WIN=[];const apex=HF+AS+AW*.866;
 const addWin=(list,x,y,r,ky,side,lit)=>{const P=massAtY(x,y,side),n=massN(x,y,side);const t=new THREE.Vector3(-n[0]*n[1],1-n[1]*n[1],-n[2]*n[1]).normalize();const bx=new THREE.Vector3().crossVectors(t,new THREE.Vector3(n[0],n[1],n[2])).normalize();
  list.push({x,y,r,ky,side,lit,P,n,t:[t.x,t.y,t.z],bx:[bx.x,bx.y,bx.z]});};
 [7.5,13,18.5,24].forEach((wy,k)=>{let x=-XE+5.5+(k%2)*2.2;let r=1.3+rng()*.8;
  while(x<XE-4.5){const ky=1.15+rng()*.5;const top=wy+r*ky,bot=wy-r*ky;
   const okArch=!(Math.abs(x)<AW/2+r+1.4&&bot<apex+1.3);const okTall=!(Math.abs(x)<2.6+r+1.1&&top>24.2);
   if(top<hAt(x)-2.4&&okArch&&okTall)addWin(WIN,x,wy,r,ky,1,rng()<.55);
   const r2=1.25+rng()*.9;x+=r+r2+1.15+rng()*.5;r=r2;}});
 addWin(WIN,0,30.5,2.6,2.1,1,true);
 const WINB=[];for(const wy of [14,24])for(let i=0;i<7;i++){const x=(i-3)*8.5+(wy>20?4.2:0);const r=1.2+rng()*.6,ky=1.2+rng()*.3;if(wy+r*ky<hAt(x)-2.6)addWin(WINB,x,wy,r,ky,-1,rng()<.6);}
 const inWin=(W,p)=>{const dx=p[0]-W.P[0],dy=p[1]-W.P[1],dz=p[2]-W.P[2];const a=(dx*W.bx[0]+dy*W.bx[1]+dz*W.bx[2])/W.r,b=(dx*W.t[0]+dy*W.t[1]+dz*W.t[2])/(W.r*W.ky);return a*a+b*b<1;};
 const inArch=(x,y)=>{const yy=y-HF,ax=Math.abs(x);if(yy<-.3||ax>=AW/2)return false;if(yy<AS)return true;const ex=ax+AW/2,ey=yy-AS;return ex*ex+ey*ey<AW*AW;};
 const holeF=(u,v,p)=>{if(inArch(p[0],p[1]))return true;for(const W of WIN)if(inWin(W,p))return true;return false;};
 const holeB=(u,v,p)=>{for(const W of WINB)if(inWin(W,p))return true;return false;};
 const phS=x=>{const h=hAt(x);return h<=YS?Math.PI/2:phiAtY(x,YS);};
 hykPut('hkMosaic',hykSurf((u,v)=>{const x=-XE+2*XE*u;return massPhi(x,v*phS(x),1);},160,30,{col:mosCol,uS:19,vS:8,flip:true,hole:holeF}));
 hykPut('hkShell',hykSurf((u,v)=>{const x=-XE+2*XE*u;const p0=phS(x);return massPhi(x,p0+(Math.PI/2-p0)*v,1);},160,10,{col:bandCol,uS:19,vS:6,flip:true,hole:holeF}));
 hykPut('hkShell',hykSurf((u,v)=>massPhi(-XE+2*XE*u,v*Math.PI/2,-1),160,26,{col:bandCol,uS:19,vS:12,hole:holeB}));
 // the windows: a nacre lip and reveal (lit panes on some), and the thick bone surround round each, knuckled like cartilage
 // the windows: a reveal, a dark (or lit) pane deep in it, the mark, and the thick bone surround round each, knuckled like
 // cartilage (no torus lip: at 448 triangles an instance, the lips alone were a third of the budget)
 const ring=(P,n,bx,t,r,ky,rad,col,nE)=>{const pts=[];for(let i=0;i<=nE;i++){const a=i/nE*TAU;const ca=Math.cos(a),sa=Math.sin(a);pts.push([P[0]+bx[0]*r*ca+t[0]*r*ky*sa+n[0]*.3,P[1]+bx[1]*r*ca+t[1]*r*ky*sa+n[1]*.3,P[2]+bx[2]*r*ca+t[2]*r*ky*sa+n[2]*.3]);}
  hykPut('hkBone',hykTube(pts,(u)=>rad*(1+.22*Math.max(0,Math.cos(u*TAU*2))),{seg:5,col}));};
 const pane=(P,n,r,ky,depth,lit)=>{const q=qFacing(n),qy=new THREE.Quaternion().setFromUnitVectors(_UP,new THREE.Vector3(n[0],n[1],n[2]));
  kput('hkReveal',[P[0]-n[0]*depth*.45,P[1]-n[1]*depth*.45,P[2]-n[2]*depth*.45],qy,[r*.985,depth,r*.985*ky],null);
  kput('hkDisc',[P[0]-n[0]*depth*.9,P[1]-n[1]*depth*.9,P[2]-n[2]*depth*.9],q,[r*.97,r*.97*ky,1],lit?hC(0xffe2b8):null);};
 for(const W of WIN.concat(WINB)){pane(W.P,W.n,W.r,W.ky,.9,W.lit);hykSpanMark('window',W.P[0],W.P[1],W.P[2],W.n[0],W.n[2],W.r*2,W.r*2*W.ky,'ground',{lit:W.lit});ring(W.P,W.n,W.bx,W.t,W.r*1.08+.3,W.ky,.46,bone,22);}
 // the blind arcade along the foot: small dark arches in thin bone rings, either side of the great stair
 const blind=(P,n,r,ky)=>{const t=new THREE.Vector3(-n[0]*n[1],1-n[1]*n[1],-n[2]*n[1]).normalize();const bx=new THREE.Vector3().crossVectors(t,new THREE.Vector3(n[0],n[1],n[2])).normalize();
  kput('hkDisc',[P[0]-n[0]*.3,P[1]-n[1]*.3,P[2]-n[2]*.3],qFacing(n),[r*.97,r*.97*ky,1],null);ring(P,n,[bx.x,bx.y,bx.z],[t.x,t.y,t.z],r*1.05+.1,ky,.16,bone,14);};
 for(const s of [-1,1])for(let x=9.5;x<XE-3.5;x+=3.1)blind(massAtY(s*x,2.3,1),massN(s*x,2.3,1),.8,1.4);
 // ---- the great arch: the recess (an ogive tunnel from the face to the hall's wall), its floor, the bone surround with
 // its knuckles, the gilded group on the dais at its back, the stair up to it
 const outline=s=>{if(s<.2)return [-AW/2,AS*s/.2];if(s<.5){const a=Math.PI-(Math.PI/3)*(s-.2)/.3;return [AW/2+AW*Math.cos(a),AS+AW*Math.sin(a)];}if(s<.8){const a=Math.PI/3-(Math.PI/3)*(s-.5)/.3;return [-AW/2+AW*Math.cos(a),AS+AW*Math.sin(a)];}return [AW/2,AS*(1-(s-.8)/.2)];};
 const hallR=yy=>10.5*Math.sqrt(Math.max(0,1-Math.pow(Math.max(0,yy)/19,2.2)))+.15;
 const zBack=(x,y)=>{const r=hallR(y-HF);return HZ+Math.sqrt(Math.max(0,r*r-x*x))-.4;};
 hykPut('hkShell',hykSurf((u,v)=>{const q=outline(u);const x=q[0],y=HF+q[1];const zf=massAtY(x,y,1)[2]+.35;return [x,y,zf+(zBack(x,y)-zf)*v];},48,6,{col:colW,uS:12,vS:3}));
 hykPut('hkFloor',hykSurf((u,v)=>{const x=-AW/2+AW*u;const zf=massAtY(x,HF,1)[2]+1.2;return [x,HF+.02,zf+(zBack(x,HF)-zf)*v];},6,4,{col:flo,uS:3,vS:3,flip:true}));
 {const pts=[];for(let i=0;i<=44;i++){const q=outline(i/44);const P=massAtY(q[0],HF+q[1],1),n=massN(q[0],HF+q[1],1);pts.push([P[0]+n[0]*.45,P[1]+n[1]*.45,P[2]+n[2]*.45]);}
  hykPut('hkBone',hykTube(pts,t=>.78*(1+.2*Math.max(0,Math.cos(t*TAU*9))),{seg:8,col:bone}));
  for(const s of [.2,.5,.8]){const q=outline(s);const P=massAtY(q[0],HF+q[1],1),n=massN(q[0],HF+q[1],1);kput('hkBall',[P[0]+n[0]*.5,P[1]+n[1]*.5,P[2]+n[2]*.5],null,[1.05,.9,1.05],bone);}}
 const DZ=zBack(0,HF)+1.6;hykPut('hkNacre',hykDisc(0,HF+.5,DZ,2.6,{col:nac,lobes:{n:9,amp:.06},nu:30}));hykPut('hkNacre',hykAmphBand(0,DZ,HF,HF+.5,th=>2.6*(1+.06*Math.cos(9*th)),0,TAU,{col:nac,nv:1,nu:30}));
 for(const f of [[0,0,4.4],[-1.5,.5,3.5],[1.5,.5,3.5]]){hykPut('hkNacre',hykLathe({H:f[2],yBase:HF+.5,cx:f[0],cz:DZ+f[1],rFn:y=>.5*Math.pow(1-y/f[2],.5)*(1+.3*Math.sin(y*2.3))+.1,flute:{n:5,amp:.16,sharp:1.3},twist:.8,nu:16,nv:12,col:gold}));kput('hkBall',[f[0],HF+.5+f[2]+.1,DZ+f[1]],null,[.32,.4,.32],gold);}
 hykLight(0,HF+6.6,DZ-.4,{r:.26,nacre:true,level:'ground',bracket:[0,HF+8.6,zBack(0,HF+8.6)+.2]});
 hykTideStair([0,.3,11],[0,HF,-2.2],13,{solid:true,solidCol:colW});
 // ---- the audience hall: a ribbed vault hollowed in the mass behind the arch, its oval door at the recess's end
 const hallL={H:19,yBase:HF,cx:0,cz:HZ,rFn:hallR,rings:{n:7,amp:.012},noise:{amp:.012,su:4,sv:2,seed:43},nu:56,nv:20,flip:true,col:inC};
 const hallDoor=Object.assign(hykLatheAt(hallL,Math.PI/2,8.1),{r:5.2,ky:1.6,kind:'door'});hallL.ops=[hallDoor];
 hykPut('hkIn',hykLathe(hallL),true);hykFloor(0,HZ,HF+.02,10.3,{col:flo,nu:48});
 hykDoor(hallDoor,{level:'ground',nacre:true,depth:1.2,name:'the great arch'});
 for(let k=0;k<9;k++){const th=Math.PI/2+(k+1)*TAU/10;const pts=[];for(let i=0;i<=14;i++){const yy=i/14*18.2;const r=hallR(yy)*.97;pts.push([r*Math.cos(th),HF+yy,HZ+r*Math.sin(th)]);}
  hykPut('hkBone',hykTube(pts,t=>.3*(1-.4*t)*(1+.2*Math.max(0,Math.cos(t*TAU*5))),{seg:6,col:bone}),true);}
 hykPut('hkFloor',hykDisc(0,HF+.5,HZ-7,3.4,{col:nac,lobes:{n:9,amp:.06},nu:36}),true);hykPut('hkFloor',hykAmphBand(0,HZ-7,HF,HF+.5,th=>3.4*(1+.06*Math.cos(9*th)),0,TAU,{col:nac,nv:1,nu:36}),true);
 for(const th of [Math.PI/4,3*Math.PI/4,5*Math.PI/4,7*Math.PI/4]){const a=hykLatheAt(hallL,th,6.5);hykLight(a.p[0]-a.n[0]*.5,a.p[1]+.1,a.p[2]-a.n[2]*.5,{r:.24,nacre:true,level:'ground',bracket:a.p});}
 const hall=hykRoom('hall',hykCirclePoly(0,HZ,9.6,18),HF+.02,15,{doors:[[0,HZ+9.9,10.4,'street']],wealth:1});
 hykSpot(hall,'seat',0,HZ-7.4,0,1.2,1.0);hykSpot(hall,'table',0,HZ-3.2,0,2.6,1.1);hykSpot(hall,'shrine',-7.2,HZ-3,Math.PI/2,.7,.5);hykSpot(hall,'seat',6.4,HZ-1.5,-Math.PI/2,1.0,.9);hykSpot(hall,'seat',-5.8,HZ+2.4,Math.PI/2,1.0,.9);
 // ---- the crown: the drum and the shallow ribbed dome at the centre of the ridge, two tall and two short twisted spires
 // on the back slope, each with a knuckle two-thirds up and a gold tip; a collar where each leaves the mass
 const spire=(cx,cz,yB,H,R0,tall)=>{hykPut('hkShell',hykLathe({H,yBase:yB,cx,cz,rFn:y=>R0*Math.pow(1-y/H,.8)+.14+R0*.5*Math.exp(-Math.pow((y-.64*H)/(.055*H),2)),flute:{n:8,amp:.17,sharp:1.3},twist:.33,rings:{n:16,amp:.02},nu:22,nv:28,col:verd}));
  kput('hkBall',[cx,yB+H+.15,cz],null,[.42,.8,.42],gold);if(tall)hykLight(cx,yB+H+1.3,cz,{r:.3,bare:true,level:'L2',bracket:[cx,yB+H+.8,cz]});};
 for(const s of [-1,1]){spire(s*12,-24,22,44,2.7,true);kput('hkBall',[s*12,25.2,-24],null,[3.3,1.4,3.3],verd);spire(s*26,-22,9,27,1.8,false);kput('hkBall',[s*26,11.4,-22],null,[2.3,1.0,2.3],verd);}
 hykPut('hkShell',hykLathe({H:12,yBase:30,cx:0,cz:MZ,rFn:y=>9.2+.3*Math.sin(Math.PI*y/12),flute:{n:18,amp:.025,sharp:1.3},nu:64,nv:6,col:colW}));
 {const pts=[];for(let i=0;i<=64;i++){const a=i/64*TAU;pts.push([9.5*Math.cos(a),42.1,MZ+9.5*Math.sin(a)]);}hykPut('hkNacre',hykTube(pts,(u,i)=>.36*(1+.2*Math.max(0,Math.cos(i*1.3))),{seg:7,col:nac}));}
 hykPut('hkShell',hykLathe({H:4.8,yBase:42,cx:0,cz:MZ,rFn:y=>9.6*Math.sqrt(Math.max(0,1-Math.pow(y/4.8,2)))+.1,flute:{n:24,amp:.045,sharp:1.2},rings:{n:3,amp:.01},nu:64,nv:12,col:verd}));
 hykPut('hkNacre',hykLathe({H:3.2,yBase:46.6,cx:0,cz:MZ,rFn:y=>.7*Math.pow(1-y/3.2,.7)+.1,flute:{n:6,amp:.15,sharp:1.3},twist:.6,nu:14,nv:8,col:gold}));kput('hkBall',[0,49.9,MZ],null,[.4,.55,.4],gold);hykLight(0,50.9,MZ,{r:.28,bare:true,level:'L2',bracket:[0,50.3,MZ]});
 // the tendrils: bone ribs that root the wings' feet, climbing the ends of the mass
 for(const s of [-1,1]){const R=[[[s*(XE-1.5),0,MZ+9],[s*27,12.5,MZ+6.8]],[[s*(XE-3),0,MZ-9],[s*28,13,MZ-5.5]],[[s*(XE+1.2),0,MZ],[s*30.5,10.5,MZ+2.2]]];
  for(const r of R){hykPut('hkBone',hykRib(r[0],r[1],{rise:2.6,r0:.6,r1:.34,knuckles:4,col:bone}));kput('hkBall',r[0],null,[.8,.6,.8],bone);kput('hkBall',r[1],null,[.5,.45,.5],bone);}}
 // ---- the forecourt: the paved floor inside the rampart, the long pool (mosaic basin, rimstone lip, pearl fountains,
 // the water a hand down), its lanterns
 const rE=th=>1/Math.sqrt(Math.pow(Math.cos(th)/41,2)+Math.pow(Math.sin(th)/45,2));const lobF=th=>1+.02*Math.cos(13*th);
 const rW=(th,y)=>rE(th)*lobF(th)*(1+.06*Math.pow(clamp(1-y/3,0,1),2)),rWin=(th,y)=>rW(th,y)-1.3;
 hykPut('hkFloor',hykSurf((u,v)=>{const th=u*TAU;const r=v*(rWin(th,6)-.2);return [r*Math.cos(th),.3,r*Math.sin(th)];},100,4,{col:flo,uS:60,vS:10,flip:true}));
 const PZ=22.5,PA=4,PC=10.5;const pr=th=>1/Math.sqrt(Math.pow(Math.cos(th)/PA,2)+Math.pow(Math.sin(th)/PC,2));
 hykPut('hkMosaic',hykSurf((u,v)=>{const th=u*TAU;const r=v*pr(th);return [r*Math.cos(th),-.5,PZ+r*Math.sin(th)];},64,3,{col:poolC,uS:8,vS:2,flip:true}));
 hykPut('hkMosaic',hykAmphBand(0,PZ,-.5,.34,th=>pr(th),0,TAU,{col:poolC,nu:64,nv:2,flip:true}));
 {const pts=[];for(let i=0;i<=72;i++){const a=i/72*TAU;const r=pr(a)+.12;pts.push([r*Math.cos(a),.42,PZ+r*Math.sin(a)]);}hykPut('hkNacre',hykTube(pts,(u,i)=>.27*(1+.25*Math.max(0,Math.cos(i*1.9))),{seg:7,col:nac}));}
 hykAmphWater(G,[hykSurf((u,v)=>{const th=u*TAU;const r=v*pr(th);return [r*Math.cos(th),.1,PZ+r*Math.sin(th)];},64,2,{col:teal,uS:8,vS:2,flip:true})]);
 for(const dz of [-7.5,0,7.5]){hykPut('hkNacre',hykLathe({H:1.7,yBase:-.3,cx:0,cz:PZ+dz,rFn:y=>.5*Math.pow(1-y/1.7,.6)+.16,flute:{n:7,amp:.14,sharp:1.3},nu:14,nv:6,col:nac}));kput('hkLens',[0,1.65,PZ+dz],null,[.5,.62,.5],hC(hPick(HPAL.lens)));}
 for(const q of [[-6,12.5],[6,12.5],[-6,32.5],[6,32.5]])hykAmphLampPost(q[0],.3,q[1],{level:'ground'});
 // the crescent colonnade: fluted bone columns on an arc round the pool, capitals knuckled, a nacre entablature over them
 // running on across the gap left at the centre for the gate path; a pearl on every fourth column
 const CZ=10,CR=27,CA=1.15,NC=21;const c0=Math.PI/2-CA,c1=Math.PI/2+CA;
 for(let i=0;i<NC;i++){if(i===10)continue;const a=c0+(c1-c0)*i/(NC-1);const cx=CR*Math.cos(a),cz=CZ+CR*Math.sin(a);
  hykPut('hkShell',hykLathe({H:6.6,yBase:.3,cx,cz,rFn:y=>.52+.1*Math.pow(1-y/6.6,2)+.3*Math.pow(Math.max(0,(y-5.6)/1),2),flute:{n:12,amp:.09,sharp:1.5},nu:12,nv:5,col:bone}));
  kput('hkBall',[cx,6.95,cz],null,[.95,.32,.95],bone);kput('hkBall',[cx,.42,cz],null,[.78,.2,.78],bone);
  if(i%4===2)hykLight(cx-Math.cos(a)*.95,5.2,cz-Math.sin(a)*.95,{r:.2,nacre:true,level:'ground',bracket:[cx-Math.cos(a)*.6,4.9,cz-Math.sin(a)*.6]});}
 {const pts=[];for(let i=0;i<=80;i++){const a=c0+(c1-c0)*i/80;pts.push([CR*Math.cos(a),7.35,CZ+CR*Math.sin(a)]);}hykPut('hkNacre',hykTube(pts,(u,i)=>.5*(1+.18*Math.max(0,Math.cos(i*1.6))),{seg:8,col:nac}));
  const pts2=pts.map(p=>[p[0]*1.022,p[1]+.55,CZ+(p[2]-CZ)*1.022]);hykPut('hkNacre',hykTube(pts2,()=>.22,{seg:6,col:nac}));}
 // the pavilion to the east: a lobed plinth, eight columns, a nacre dome, the gilded figure under it
 {const px=31,pz=14;hykPut('hkShell',hykDisc(px,.6,pz,4.4,{col:colW,lobes:{n:8,amp:.05},nu:32}));hykPut('hkShell',hykAmphBand(px,pz,.3,.6,th=>4.4*(1+.05*Math.cos(8*th)),0,TAU,{col:colW,nv:1,nu:32}));
  for(let i=0;i<8;i++){const a=i/8*TAU;const cx=px+3.6*Math.cos(a),cz=pz+3.6*Math.sin(a);hykPut('hkShell',hykLathe({H:4.1,yBase:.6,cx,cz,rFn:y=>.3+.05*Math.pow(1-y/4.1,2)+.2*Math.pow(Math.max(0,(y-3.4)/.7),2),flute:{n:9,amp:.1,sharp:1.5},nu:12,nv:5,col:bone}));kput('hkBall',[cx,4.72,cz],null,[.55,.22,.55],bone);}
  const pts=[];for(let i=0;i<=40;i++){const a=i/40*TAU;pts.push([px+4.3*Math.cos(a),4.85,pz+4.3*Math.sin(a)]);}hykPut('hkNacre',hykTube(pts,()=>.3,{seg:6,col:nac}));
  hykPut('hkNacre',hykLathe({H:3.3,yBase:4.8,cx:px,cz:pz,rFn:y=>4.4*Math.sqrt(Math.max(0,1-Math.pow(y/3.3,2)))+.1,flute:{n:16,amp:.03,sharp:1.3},nu:40,nv:10,col:nac}));kput('hkBall',[px,8.25,pz],null,[.3,.4,.3],gold);
  hykPut('hkNacre',hykLathe({H:3.0,yBase:.9,cx:px,cz:pz,rFn:y=>.5*Math.pow(1-y/3,.5)*(1+.3*Math.sin(y*2.3))+.1,flute:{n:5,amp:.16,sharp:1.3},twist:.8,nu:16,nv:10,col:gold}));kput('hkBall',[px,.75,pz],null,[.9,.3,.9],nac);
  hykAmphLampPost(px+5.6,.3,pz+1.5,{level:'ground'});}
 // ---- the rampart: a low lobed wall (ellipse, battered foot) round the precinct, outer and inner faces, the cap and its
 // nacre parapet lips, a blind arcade along the outer face; the gate at +z with its lamps
 const gateOp={p:[0,2.9,rW(Math.PI/2,2.9)],n:[0,0,1],r:2.4,ky:1.15,kind:'door'};const gIn={p:[0,2.9,rWin(Math.PI/2,2.9)],r:2.4,ky:1.15};
 hykPut('hkShell',hykAmphBand(0,0,-.6,6.4,rW,0,TAU,{col:colW,nu:150,nv:5,hole:hykHoleOf([gateOp])}));
 hykPut('hkShell',hykAmphBand(0,0,-.6,6.4,rWin,0,TAU,{col:colW,nu:150,nv:5,flip:true,hole:hykHoleOf([gIn])}));
 hykPut('hkShell',hykSurf((u,v)=>{const th=u*TAU;const r=rWin(th,6.4)+(rW(th,6.4)-rWin(th,6.4))*v;return [r*Math.cos(th),6.4,r*Math.sin(th)];},150,1,{col:colW,uS:60,vS:1,flip:true}));
 for(const k of [0,1]){const pts=[];for(let i=0;i<=150;i++){const a=i/150*TAU;const r=k?rWin(a,6.4)+.1:rW(a,6.4)-.1;pts.push([r*Math.cos(a),6.55,r*Math.sin(a)]);}hykPut('hkNacre',hykTube(pts,(u,i)=>(k?.22:.34)*(1+.15*Math.max(0,Math.cos(i*1.3))),{seg:6,col:nac}));}
 for(let i=0;i<30;i++){const th=i/30*TAU+TAU/60;if(Math.abs(ANG(th,Math.PI/2))<.22)continue;const r=rW(th,3.0);blind([r*Math.cos(th),3.0,r*Math.sin(th)],[Math.cos(th),0,Math.sin(th)],.8,1.4);}
 hykDoor(gateOp,{level:'ground',nacre:true,depth:1.3,name:'the Citadel gate'});
 for(const s of [-1,1]){const th=Math.PI/2+s*.085;const r=rW(th,4.6);const an=[r*Math.cos(th),4.6,r*Math.sin(th)];hykLight(an[0],an[1]+.1,an[2]+.45,{r:.24,nacre:true,level:'ground',bracket:an});}
 // ---- the west bastion and the Warden's lodge: the wing dives into a round bastion; a flight up the wing's face reaches
 // its top; the nacre pod on it opens east to the flight and west, through the bridge door, onto the lily-pad bridge
 // head the city's span lands on; rails round the bastion top and the pad, open where they are joined
 const BX=-33,BZ=-7,BR=7,WY=10.8;
 hykPut('hkShell',hykLathe({H:WY+.8,yBase:-.8,cx:BX,cz:BZ,rFn:y=>BR+1.2*Math.pow(clamp(1-y/4,0,1),2)+.3*Math.sin(Math.PI*y/(WY+.8)),flute:{n:20,amp:.025,sharp:1.2},rings:{n:5,amp:.02},noise:{amp:.015,su:4,sv:2,seed:44},nu:64,nv:8,col:colW}));
 hykPut('hkShell',hykDisc(BX,WY,BZ,BR+.15,{col:colW,nu:48}));
 {const pts=[];for(let i=0;i<=48;i++){const a=i/48*TAU;pts.push([BX+(BR+.1)*Math.cos(a),WY+.05,BZ+(BR+.1)*Math.sin(a)]);}hykPut('hkNacre',hykTube(pts,(u,i)=>.3*(1+.18*Math.max(0,Math.cos(i*1.3))),{seg:6,col:nac}));}
 const LX=BX+.5,LZ=BZ;const P={a:4.5,b:4.2,c:4.5,e1:.85,e2:.9,nu:32,nv:18,noise:{amp:.02,su:4,sv:3,seed:45},col:nac,hollow:{t:.09,col:inC}};P.cy=P.b*.8;
 const dEl=hykCitPodEl(P,.12+1.2*1.1);P.openings=[{th:-Math.PI/2,el:dEl,r:1.2,ky:1.1,kind:'door',bridge:true},{th:Math.PI/2,el:dEl,r:1.1,ky:1.1,kind:'door'},{th:0,el:.3,r:.7,ky:1.2,kind:'window'},{th:Math.PI,el:.35,r:.6,ky:1.1,kind:'window'},{th:-Math.PI/2,el:1.0,r:.5,ky:1,kind:'window'}];
 const pod=hykPod(P);pod.geo.translate(LX,WY,LZ);hykPut('hkNacre',pod.geo);if(pod.inner){pod.inner.translate(LX,WY,LZ);hykPut('hkIn',pod.inner,true);}
 let bridgeDoor=null;for(const op of pod.openings){op.p=[op.p[0]+LX,op.p[1]+WY,op.p[2]+LZ];if(op.kind==='door'){if(op.bridge){bridgeDoor=op;hykDoor(op,{level:'L1',nacre:true,depth:.9,name:'the bridge door'});}else hykDoor(op,{level:'L1',nacre:true,depth:.9,name:"the Warden's lodge"});}else hykWin(op,{nacre:true,lit:true});}
 const podR=y=>{const s=Math.min(.999,Math.abs((y-P.cy)/P.b));return Math.pow(Math.sqrt(Math.max(0,1-Math.pow(s,2/P.e1))),P.e1);};
 hykPut('hkNacre',hykFlare([LX,WY+.02,LZ],[0,1,0],P.c*podR(0)*.97,1.2,{col:nac}));hykFloor(LX,LZ,WY+.06,P.c*podR(0)-.15,{col:flo});
 hykPut('hkNacre',hykLathe({H:7,yBase:WY+P.cy+P.b*.9,cx:LX,cz:LZ,rFn:y=>1.1*Math.pow(1-y/7,.8)+.1,flute:{n:7,amp:.14,sharp:1.3},twist:.9,nu:20,nv:10,col:nac}));kput('hkBall',[LX,WY+P.cy+P.b*.9+7.1,LZ],null,[.25,.35,.25],gold);
 const lodge=hykRoom('hall',hykCirclePoly(LX,LZ,3.1,14),WY+.06,4.6,{doors:[[LX-P.a*.93,LZ,2.4,'bridge'],[LX+P.a*.93,LZ,2.2,'street']],wealth:1});
 hykSpot(lodge,'seat',LX,LZ-1.9,0,1.0,.9);hykSpot(lodge,'table',LX,LZ+.6,0,1.6,.9);
 // the flight up the wing's face from the forecourt to the bastion top, rails on its open side; the bastion's rail
 hykTideStair([-9,.3,-3.6],[-27.5,WY,BZ+1.6],1.5,{solid:true,solidCol:colW,rails:'left'});
 hykAmphRail(BX,WY,BZ,BR-.3,[[Math.atan2(BZ+1.6-BZ,-27.5-BX),.34],[Math.PI,.62],[-Math.PI/2,1.15]],{col:bone});
 hykAmphLampPost(-11.2,.3,-1.6,{level:'ground'});
 // ---- the bridge head: the lily pad outside the bridge door at the wall-walk height, its rail open to the door and to
 // the west where the span leaves; the city's bridge graph finds it by its `own`
 const bp=hykAmphPad(-39.3,WY,BZ,3.2,{col:colW,own:'Citadel bridge head'});
 hykAmphRail(bp.x,WY,bp.z,3.0,[[0,.62],[Math.PI,.6]],{col:bone});
 hykSpanMark('bridge',bp.x-3.0,WY,bp.z,-1,0,2.6,2.3,'L1',{name:'the Citadel bridge head'});
 {const q=bridgeDoor;const an=[q.p[0]+.35,q.p[1]+1.5,q.p[2]+1.4];hykLight(an[0]-.45,an[1]+.1,an[2],{r:.2,nacre:true,level:'L1',bracket:an});}
 hykReg("The Archon's Citadel",0,-2,48,70,{landmark:true});}
HYK.def({key:'hyk_citadel',name:"The Archon's Citadel",family:'civic',row:'Civic',w:84,d:92,h:68,r:48,cls:'landmark',inside:true,tags:{type:['civic','military'],wealth:'civic',lit:true,landmark:true},build:buildHykCitadel});
