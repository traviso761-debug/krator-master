// ================================================================ VESSEL: slCarrier (+ the `sl` helpers)
// An Ancient drone carrier, 320 m: a sleek white hull flaring out to carry a
// flight deck with an angled landing strip and an island sponson, the island
// a streamlined stack of white tiers and window bands under a sensor mast,
// two ski-jump drone launch rails running off the bow, deck-edge elevators
// (the port one lowered to the hangar), hangar openings in the hull side.
// Frame (API.md "Vessels"): origin midship on the waterline, bow +z, starboard
// is -x (the island side, moored to the berth's finger pier). Seeds 20600-20604.
//   d=0 intact    white panels, pale deck with its markings, cyan lights, drones
//   d=1 ruined    aground and listing to port, rust, deck and hull holed, the
//                 island's top gone and its mast across the deck, an elevator
//                 hanging into the water, trees and weeds on the deck
//   d=3 reclaimed a market town across the flight deck (shacks, stalls,
//                 awnings, scaffold towers, gardens), the island a tower village,
//                 stair towers and rafts down the port side
// The file also holds the helpers the other sl fragments share (87-sl-b..d).

// ---------------------------------------------------------------- sl helpers
function slSS(a,b,x){const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);}
function slUV(g,s){const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*s,uv.getY(i)*s);return g;}
// A prism: plan polygon pts [[x,z],...] extruded from y0 up by h (world UVs / tile).
function slPrism(pts,y0,h,tile){const s=new THREE.Shape(pts.map(p=>new THREE.Vector2(p[0],-p[1])));
 const g=new THREE.ExtrudeGeometry(s,{depth:h,bevelEnabled:false});g.rotateX(-Math.PI/2);g.translate(0,y0,0);return slUV(g,1/(tile||8));}
// A streamlined plan: superellipse w x l round (cx,cz), exponent nf toward +z (the bow), nb aft.
function slPlan(cx,cz,w,l,nb,nf,N){N=N||24;const o=[];for(let i=0;i<N;i++){const a=i/N*TAU,c=Math.cos(a),s=Math.sin(a);
 const e=s>0?2/nf:2/nb;o.push([cx+w/2*Math.sign(c)*Math.pow(Math.abs(c),e),cz+l/2*Math.sign(s)*Math.pow(Math.abs(s),e)]);}return o;}
// REGISTER in a vessel's frame turned by heading hd (REGISTER itself only adds KOFF).
function slReg(name,x,z,r,h,y,hd){const c=Math.cos(hd||0),s=Math.sin(hd||0);REGISTER({name,x:x*c+z*s,z:-x*s+z*c,r,h,y});}
// A rope from a to b sagging by `sag`, in four straight pieces.
function slRope(a,b,sag,w,col){let p=a;for(let i=1;i<=4;i++){const t=i/4;
 const q=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t-sag*4*t*(1-t),a[2]+(b[2]-a[2])*t];beam('tube',p,q,w||.07,w||.07,col||null);p=q;}}
const SL_ROPE=new THREE.Color(0xb8a888);
// A salvage shack w x dp x h standing at (x,y,z), door on its local +z face.
function slShack(x,y,z,yaw,w,dp,h,o){o=o||{};const c=Math.cos(yaw),s=Math.sin(yaw),q=qEuler(0,yaw,0);
 const L=(lx,lz)=>[x+lx*c+lz*s,z-lx*s+lz*c];
 kput('shantyBox',[x,y+h/2,z],q,[w,h,dp],o.col||new THREE.Color().setHSL(rr(0,1),rr(.08,.35),rr(.45,.78)));
 kput('shantyRoof',[x,y+h+.05,z],qEuler(rr(-.07,.07),yaw,rr(-.07,.07)),[w+.9,1,dp+.9],o.roof||new THREE.Color().setHSL(rr(0,.12),rr(.2,.6),rr(.4,.7)));
 let p=L(rr(-w/4,w/4),dp/2+.03);kput('pkDoor',[p[0],y+1,p[1]],q,[.9,2,1],new THREE.Color().setHSL(rr(0,1),.3,.3));
 const lit=rng()<(o.lit===undefined?.5:o.lit);p=L(w/2+.04,rr(-dp/5,dp/5));
 kput(lit?'dot':'cellD',[p[0],y+Math.min(1.7,h*.6),p[1]],qEuler(0,yaw+Math.PI/2,0),lit?[.7,.6,.12]:[.9,.7,.12],lit?WARM:null);
 if(o.roofy!==false){const r=rng();
  if(r<.22)kput('pkSolar',[x,y+h+.5,z],qEuler(-.4,yaw,0),1,null);
  else if(r<.34)kput('waterButt',[x+rr(-w/4,w/4),y+h+.6,z],null,[.6,1.1,.6],null);
  else if(r<.4)kput('pkDish',[x,y+h,z],qEuler(0,rng()*TAU,0),.8,null);}
 return y+h;}
// A timber scaffold stair tower from y0 up to y1 at (x,z): flights of pkStair
// zig-zagging along local z, four posts, braces, a landing per flight.
function slStairTower(x,y0,z,y1,yaw,d){const c=Math.cos(yaw),s=Math.sin(yaw),H=y1-y0;if(H<1)return;
 const L=(lx,lz)=>[x+lx*c+lz*s,z-lx*s+lz*c];const n=Math.max(1,Math.ceil(H/2)),k=H/(2*n);
 const tc=d===1?new THREE.Color(0x7a6a58):null;
 for(const px of [-1.25,1.25])for(const pz of [-1.9,1.9]){const p=L(px,pz);kput('plank',[p[0],y0+(H+1.2)/2,p[1]],qEuler(0,yaw,0),[.22,H+1.2,.22],tc);}
 for(let i=0;i<n;i++){const up=i%2===0,lx=up?-.6:.6,yb=y0+i*2*k;
  const p=L(lx,up?-1.2:1.2);kput('pkStair',[p[0],yb,p[1]],qEuler(0,yaw+(up?0:Math.PI),0),[1.1,k,1],tc);
  const pl=L(0,up?1.75:-1.75);kput('plank',[pl[0],yb+2*k-.06,pl[1]],qEuler(0,yaw,0),[2.7,.12,1.1],tc);
  if(i%2===0)for(const sx of [-1.25,1.25]){const a=L(sx,-1.9),b=L(sx,1.9);beam('plank',[a[0],yb,a[1]],[b[0],yb+2*k*2,b[1]],.1,.1,tc);}}
 const t0=L(0,-1.9),t1=L(0,1.9);kput('pkGuard',[t0[0],y1,t0[1]],qEuler(0,yaw,0),[.5,1,1],null);kput('pkGuard',[t1[0],y1,t1[1]],qEuler(0,yaw,0),[.5,1,1],null);}
// A raft of planks on barrels, lashed at the waterline, sometimes with a shack.
function slRaft(x,z,yaw,w,l,d,o){o=o||{};const q=qEuler(rr(-.02,.02),yaw,rr(-.02,.02)),c=Math.cos(yaw),s=Math.sin(yaw),y0=o.y||0;
 const L=(lx,lz)=>[x+lx*c+lz*s,z-lx*s+lz*c];
 kput('plank',[x,y0+.45,z],q,[w,.3,l],new THREE.Color().setHSL(.08,rr(.2,.35),rr(.35,.5)));
 for(const sx of [-1,1])for(let k=0;k<Math.max(2,Math.round(l/4));k++){const p=L(sx*(w/2-.6),-l/2+2+k*((l-4)/Math.max(1,Math.round(l/4)-1)));
  kput('waterButt',[p[0],y0+.2,p[1]],qEuler(Math.PI/2,yaw,0),[.55,1.3,.55],new THREE.Color().setHSL(rr(0,1),.4,.45));}
 if(o.shack){const p=L(rr(-w/6,w/6),rr(-l/5,l/5));slShack(p[0],y0+.6,p[1],yaw+(rng()<.5?0:Math.PI),Math.min(w-1.2,rr(3,4.5)),rr(3,4.5),rr(2.3,2.9),{lit:.6});}
 if(o.line){const a=L(-w/2+.4,-l/2+.4),b=L(-w/2+.4,l/2-.4);kput('plank',[a[0],y0+1.6,a[1]],null,[.1,2.2,.1],null);kput('plank',[b[0],y0+1.6,b[1]],null,[.1,2.2,.1],null);portWashLine(a[0],a[1],b[0],b[1],y0+2.6,6);}
 if(o.people)portFigures(x,y0+.6,z,o.people,Math.min(w,l)/3);}
// A lattice scaffold mast (reclaimed), with a platform, a hut or a dish, and a flag.
function slLattice(x,y,z,h,w,o){o=o||{};const tc=new THREE.Color(0x8a7458);
 for(const px of [-1,1])for(const pz of [-1,1])kput('plank',[x+px*w/2,y+h/2,z+pz*w/2],null,[.2,h,.2],tc);
 for(let yy=3;yy<h;yy+=3){for(const pz of [-1,1])kput('plank',[x,y+yy,z+pz*w/2],null,[w,.12,.12],tc);for(const px of [-1,1])kput('plank',[x+px*w/2,y+yy,z],null,[.12,.12,w],tc);
  const sd=(yy/3)%2?1:-1;beam('plank',[x-w/2,y+yy-3,z+sd*w/2],[x+w/2,y+yy,z+sd*w/2],.08,.08,tc);}
 kput('plank',[x,y+h,z],null,[w+1.4,.2,w+1.4],tc);
 if(o.hut)slShack(x,y+h+.1,z,rng()*TAU,w+.6,w+.6,2.3,{lit:.7,roofy:false});else kput('pkDish',[x,y+h,z],qEuler(0,rng()*TAU,0),1.2,null);
 kput('plank',[x+w/2,y+h+5,z],null,[.09,10,.09],null);
 kput('pkCloth',[x+w/2+1.1,y+h+9.8,z],qEuler(0,Math.PI/2*(rng()<.5?1:-1)*0+rr(-.3,.3),0),[2.2,1.3,1],new THREE.Color().setHSL(rr(0,.1),.7,.5));}
// A drone: a flying wing 9 m across, 7 m long, nose on local +z, bottom centre at 0.
const slDroneGeo=(()=>{const s=new THREE.Shape([[0,3.6],[4.5,-2.3],[3.3,-3.3],[0,-1.9],[-3.3,-3.3],[-4.5,-2.3]].map(p=>new THREE.Vector2(p[0],-p[1])));
 const g=new THREE.ExtrudeGeometry(s,{depth:.32,bevelEnabled:false});g.rotateX(-Math.PI/2);g.translate(0,.55,0);
 const f=new THREE.SphereGeometry(1,10,6);f.scale(.95,.42,2.4);f.translate(0,.85,.6);
 const l1=new THREE.BoxGeometry(.12,.6,.12).translate(-1.2,.28,-.5),l2=new THREE.BoxGeometry(.12,.6,.12).translate(1.2,.28,-.5),l3=new THREE.BoxGeometry(.12,.6,.12).translate(0,.28,2.2);
 return pkMergeGeo([g,f,l1,l2,l3]);})();
MAT.slDrone=new THREE.MeshStandardMaterial({color:0xe4e7e9,roughness:.42,metalness:.3});
kdef('slDrone',slDroneGeo,MAT.slDrone);
kdef('slDome',new THREE.SphereGeometry(1,12,6,0,TAU,0,Math.PI/2),MAT.pkPaint);
// hull materials: the white panels come from SHELL(d); below the waterline a
// blue-grey anti-fouling skin (ruined: dark rust).
MAT.slLow=new THREE.MeshStandardMaterial({map:TEX.panel,color:0x5d6c78,roughness:.8,metalness:.15,side:DS});
MAT.slLowR=new THREE.MeshStandardMaterial({map:TEX.rust,color:0x6a4a3c,roughness:.95,metalness:.1,side:DS});
// ---------------------------------------------------------------- the flight deck texture
// Mapped 1:1 over the deck: u = (x+40)/80, v = (z+160)/320 (canvas top = the bow).
function slDeckTex(ruin){return canvasTex(256,1024,(g,w,h)=>{
 const M=w/80,X=x=>(x+40)*M,Y=z=>(160-z)*M;
 g.fillStyle=ruin?'#8a847c':'#b9bcbd';g.fillRect(0,0,w,h);
 for(let j=0;j<h;j+=4)for(let i=0;i<w;i+=4){const v=h3(i*.13,j*.07,ruin?7:3)-.5;g.fillStyle=v>0?`rgba(255,255,255,${v*.12})`:`rgba(0,0,0,${-v*.12})`;g.fillRect(i,j,4,4);}
 g.strokeStyle='rgba(70,72,74,.1)';g.lineWidth=1;
 for(let z=-160;z<=160;z+=8){g.beginPath();g.moveTo(0,Y(z));g.lineTo(w,Y(z));g.stroke();}
 const la=ruin?.35:.92;
 // the angled landing strip: centreline dashed, edges solid, the touchdown box
 const a0=[2,-158],a1=[24,24],dx=a1[0]-a0[0],dz=a1[1]-a0[1],Ln=Math.hypot(dx,dz),nx=dz/Ln,nz=-dx/Ln;
 g.strokeStyle=`rgba(245,245,240,${la})`;g.lineWidth=M*.7;
 for(const o of [-12,12]){g.beginPath();g.moveTo(X(a0[0]+nx*o),Y(a0[1]+nz*o));g.lineTo(X(a1[0]+nx*o),Y(a1[1]+nz*o));g.stroke();}
 g.setLineDash([M*6,M*5]);g.beginPath();g.moveTo(X(a0[0]),Y(a0[1]));g.lineTo(X(a1[0]),Y(a1[1]));g.stroke();g.setLineDash([]);
 g.fillStyle=`rgba(245,245,240,${la*.8})`;for(let k=0;k<6;k++){const t=.12+k*.03;const cx=a0[0]+dx*t,cz=a0[1]+dz*t;
  for(const o of [-8,8]){g.beginPath();g.arc(X(cx+nx*o),Y(cz+nz*o),M*.9,0,TAU);g.fill();}}
 // the two launch lanes on the bow and the drone spots along the starboard side
 g.strokeStyle=`rgba(225,205,120,${la})`;g.lineWidth=M*.5;
 for(const x of [-15,-5,1,11]){g.beginPath();g.moveTo(X(x),Y(40));g.lineTo(X(x),Y(150));g.stroke();}
 g.strokeStyle=`rgba(120,215,225,${la})`;g.lineWidth=M*.4;
 for(let z=-132;z<-54;z+=11){g.beginPath();g.arc(X(-17),Y(z),M*4.2,0,TAU);g.stroke();}
 for(let z=66;z<116;z+=11){g.beginPath();g.arc(X(17),Y(z),M*4.2,0,TAU);g.stroke();}
 // the hull number on the bow, read from the stern
 g.save();g.translate(X(-3),Y(126));g.fillStyle=`rgba(245,245,240,${la})`;g.font=`bold ${Math.round(M*15)}px sans-serif`;g.textAlign='center';g.fillText('07',0,0);g.restore();
 if(ruin){for(let i=0;i<900;i++){const x=h3(i,.3,1)*w,y=h3(i,1.7,2)*h,r=(2+h3(i,2.2,3)*18);const t=h3(i,3.1,4);
   g.fillStyle=t<.45?`rgba(110,60,30,${.12+t*.3})`:t<.75?`rgba(40,36,32,${.08+(t-.45)*.4})`:`rgba(70,90,40,${.1+(t-.75)*.5})`;
   g.beginPath();g.ellipse(x,y,r,r*(.4+h3(i,4,5)),h3(i,5,6)*3,0,TAU);g.fill();}}});}
TEX.slDeck=slDeckTex(false);TEX.slDeckR=slDeckTex(true);
MAT.slDeck=new THREE.MeshStandardMaterial({map:TEX.slDeck,color:0xffffff,roughness:.86,metalness:.08,side:DS});
MAT.slDeckR=new THREE.MeshStandardMaterial({map:TEX.slDeckR,color:0xffffff,roughness:.95,metalness:.05,side:DS});

// ---------------------------------------------------------------- the carrier's lines
const SLC={L:320,T:11,HB:20,YM:12,YH:20,YF:21.2,Z0:-154,Z1:150,ZT:70,ZD0:-160,ZD1:160,IX:-24.5,IZ:-22,
 // hangar openings in the hull side [side, z0, z1]; elevators {side,z0,z1,down}
 OPEN:[[-1,22,40],[-1,-80,-62],[1,50,68],[1,-30,-14],[1,-100,-86]],
 EL:[{s:-1,z0:22,z1:40},{s:-1,z0:-80,z1:-62},{s:1,z0:50,z1:68,down:true}]};
function slCarP(z){const Z0=SLC.Z0;if(z<Z0)return 0;if(z<Z0+14)return .84+.16*Math.sqrt((z-Z0)/14);if(z<SLC.ZT)return 1;if(z>=SLC.Z1)return 0;
 const t=(z-SLC.ZT)/(SLC.Z1-SLC.ZT);return Math.pow(Math.max(0,1-t*t),.7);}
// Half-width at (z,y): the bow rakes 10 m forward by the main deck, the sides
// flare out above the waterline (strongly at the bow, to carry the deck).
function slCarHw(z,y){const yy=Math.min(y,SLC.YM),rk=z>0?10*clamp((yy+SLC.T)/(SLC.YM+SLC.T),0,1):0,P=slCarP(z-rk);
 if(yy<=0)return SLC.HB*P;return SLC.HB*P*(1+(.18+.35*slSS(SLC.ZT,SLC.Z1+10,z))*yy/SLC.YM);}
function slCarTb(z){return SLC.T*(1-.4*slSS(SLC.ZT+20,SLC.Z1+6,z)-.25*slSS(SLC.Z0+40,SLC.Z0,z));}
// Flight deck edges: starboard (-x) with the island sponson, port (+x) with the angled deck.
function slCarBase(z){return z>60?27-15*Math.pow((z-60)/100,2):27;}
function slCarXS(z){return -(slCarBase(z)+4*slSS(-52,-40,z)*(1-slSS(8,20,z)));}
function slCarXP(z){return slCarBase(z)+12*slSS(-150,-110,z)*(1-slSS(20,55,z));}
function slCarOpen(s,z){return SLC.OPEN.some(o=>o[0]===s&&z>o[1]&&z<o[2]);}

function slCarHull(H,d){const nu=96,zs=SLC.Z0,ze=SLC.ZD1,Z=u=>zs+u*(ze-zs);
 // below the waterline, one surface keel-to-both-sides (superellipse sections)
 pbAdd(gridSurface((u,v)=>{const z=Z(u),a=2*v-1,sg=a<0?-1:1,ph=Math.abs(a)*Math.PI/2;
  const y=-slCarTb(z)*Math.pow(Math.cos(ph),.6);return[sg*slCarHw(z,y)*Math.pow(Math.sin(ph),.5),y,z];},nu,16,{uS:40,vS:6}),d>0?MAT.slLowR:MAT.slLow,H,true);
 // the sides, waterline up to the flight deck's underside, hangar openings cut
 const sd=rr(0,50),th=d===1?.33:d>=3?.2:0,dh=th?(z,y)=>fbm(z/13+sd,y/4.5,sd,3)<th:null;
 for(const sg of [-1,1])pbAdd(gridSurface((u,v)=>{const z=Z(u),y=v*SLC.YH;return[sg*slCarHw(z,y),y,z];},nu,10,{uS:40,vS:SLC.YH/8,
   hole:(u,v)=>{const z=Z(u),y=v*SLC.YH;if(y>SLC.YM&&slCarOpen(sg,z))return true;return !!(dh&&y>2.5&&z<SLC.ZT+30&&z>SLC.Z0+8&&dh(z+sg*300,y));}}),SHELL(d),H);
 // the transom: a fan from the centre to the section outline at Z0
 const out=[];for(let i=10;i>=0;i--)out.push([-slCarHw(zs,i*2),i*2]);
 for(let i=1;i<16;i++){const a=-1+i/8,sg=a<0?-1:1,ph=Math.abs(a)*Math.PI/2,y=-slCarTb(zs)*Math.pow(Math.cos(ph),.6);out.push([sg*slCarHw(zs,y)*Math.pow(Math.sin(ph),.5),y]);}
 for(let i=0;i<=10;i++)out.push([slCarHw(zs,i*2),i*2]);
 pbAdd(gridSurface((u,v)=>{const p=out[Math.round(u*(out.length-1))];return[p[0]*v,6+(p[1]-6)*v,zs];},out.length-1,1),SHELL(d),H);
 kput('boxD',[0,4.5,zs-.2],null,[16,5,.6],null);                                        // the stern gate
 // interior darkness behind the openings and any holes
 pbBox(H,MAT.winDead,0,6.2,-30,38,11.4,200,0,8,true);pbBox(H,MAT.winDead,0,15.9,-30,36,7.8,200,0,8,true);}

function slCarDeck(H,d){const Y=SLC.YF,TH=1.2,nu=96,nv=20,Z=u=>SLC.ZD0+u*(SLC.ZD1-SLC.ZD0),sd=rr(0,40);
 const notch=(x,z)=>SLC.EL.some(e=>e.down&&z>e.z0&&z<e.z1&&x*e.s>slCarHw(z,SLC.YM)-.5);
 const holeXZ=d>0?(x,z)=>fbm(x/16+sd,z/16,sd,3)<.28*(d>=3?HOLES*.6:1)&&Math.abs(z)<140:()=>false;
 const pt=(u,v)=>{const z=Z(u),a=slCarXS(z),b=slCarXP(z);return[a+(b-a)*v,z];};
 const hole=(u,v)=>{const p=pt(u,v);return notch(p[0],p[1])||holeXZ(p[0],p[1]);};
 const top=gridSurface((u,v)=>{const p=pt(u,v);return[p[0],Y,p[1]];},nu,nv,{hole});
 const uv=top.attributes.uv,P=top.attributes.position;for(let i=0;i<uv.count;i++)uv.setXY(i,(P.getX(i)+40)/80,(P.getZ(i)+160)/320);
 pbAdd(top,d>0?MAT.slDeckR:MAT.slDeck,H);
 pbAdd(gridSurface((u,v)=>{const p=pt(u,v);return[p[0],Y-TH,p[1]];},nu,nv,{hole,uS:40,vS:8}),SHELL(d),H);
 // the deck's edge: two long strips and the ends
 for(const f of [slCarXS,slCarXP])pbAdd(gridSurface((u,v)=>{const z=Z(u);return[f(z),Y-TH*v,z];},nu,1,{uS:40,vS:.15,
  hole:(u)=>notch(f(Z(u))*.99,Z(u))}),SHELL(d),H);
 for(const z of [SLC.ZD0,SLC.ZD1])pbAdd(gridSurface((u,v)=>{const x=slCarXS(z)+(slCarXP(z)-slCarXS(z))*u;return[x,Y-TH*v,z];},4,1),SHELL(d),H);
 for(const e of SLC.EL)if(e.down)for(const z of [e.z0,e.z1]){const xa=slCarHw(z,SLC.YM)-.5,xb=slCarXP(z);pbBox(H,SHELL(d),(xa+xb)/2,Y-TH/2,z,xb-xa,TH,.3,0,8);}
 return holeXZ;}

// The island: streamlined tiers, each a white band, window bands between, a sensor mast.
const SLC_TIERS=[ // y0 (above deck), h, w, l, dz, kind
 [0,7,9,34,-1,'s'],[7,1.1,11.4,37,-1.5,'s'],[8.1,4.9,8.6,28,.5,'w'],[13,1,12.4,31,.8,'s'],[14,3.6,10.2,24,2,'b'],[17.6,1,11,25,2.2,'s'],[18.6,5,7,15,-.5,'w'],[23.6,.8,8,16,-.5,'s']];
function slCarIsland(H,d){const Y=SLC.YF,X=SLC.IX,Z=SLC.IZ,keep=d===1?5:SLC_TIERS.length;const sh=SHELL(d);let top=Y;
 SLC_TIERS.forEach((t,i)=>{if(i>=keep)return;const [y0,h,w,l,dz,k]=t;const pl=slPlan(X,Z+dz,w,l,4,2.2);
  if(k==='s')pbAdd(slPrism(pl,Y+y0,h),sh,H);
  else{const bw=k==='b'?.85:.35,y1=y0+h*(k==='b'?.12:.3);
   pbAdd(slPrism(pl,Y+y0,y1-y0),sh,H);pbAdd(slPrism(slPlan(X,Z+dz,w+.12,l+.12,4,2.2),Y+y1,h*bw*.7),WIN(d),H);pbAdd(slPrism(pl,Y+y1+h*bw*.7,h-(y1-y0)-h*bw*.7),sh,H);}
  top=Y+y0+h;});
 // sensor panels on the 3rd tier's corners and cyan edge lines
 for(const [sx,sz] of [[1,1],[-1,1],[1,-1],[-1,-1]]){const px=X+sx*(sz>0?3.95:4.35),pz=Z+.5+sz*7,q=qFacing([sx,0,sz*.7]);
  kput(d>0?'plateR':'plateW',[px,Y+10.4,pz],q,[4.2,4.2,.35],null);
  if(d===0)kput('strip',[px,Y+12.6,pz],q,[4,1,1],CYAN);}
 if(d!==1){const mz=Z-.5,m0=top;
  pbAdd(new THREE.CylinderGeometry(.55,1.3,20,8).translate(X,m0+10,mz),sh,H);
  pbAdd(new THREE.BoxGeometry(11,.4,.5).translate(X,m0+11,mz),sh,H);pbAdd(new THREE.BoxGeometry(7,.35,.45).translate(X,m0+16,mz),sh,H);
  pbAdd(new THREE.SphereGeometry(2.3,14,10).translate(X,m0+6.5,mz-3),sh,H);
  for(const s of [-1,1]){kput('pkDish',[X+s*4.8,m0+11.2,mz],qEuler(0,s*1.3,0),1.4,null);kput('pkDish',[X+s*3,m0+16.2,mz],qEuler(0,s*1.3+Math.PI,0),1,null);}
  kput('dot',[X,m0+20.6,mz],null,[.9,.9,.9],d===0?CYAN:WARM);
  if(d===0){kput('dot',[X+5.4,m0+11.1,mz],null,[.4,.4,.4],new THREE.Color(0xff5040));kput('dot',[X-5.4,m0+11.1,mz],null,[.4,.4,.4],new THREE.Color(0x60ff80));}}
 return top;}

// The kit on the deck: elevators, launch rails, drones, domes, masts, lights.
function slCarRail(H,d,x){const Y=SLC.YF,yr=z=>Y+.9+5.4*Math.pow(clamp((z-50)/118,0,1),2),col=d>0?'strutR':'strutW';
 const broke=d===1?rr(118,150):1e9;
 for(let z=50;z<168;z+=11.8){const z2=Math.min(168,z+11.8);if(z2>broke){
   beam(col,[x-1,yr(z),z],[x-1.3,yr(z)-4,z+8],.5,.5,null);break;}
  for(const s of [-1,1])beam(col,[x+s,yr(z),z],[x+s,yr(z2),z2],.45,.6,null);
  beam(col,[x-1,yr(z),z],[x+1,yr(z),z],.3,.3,null);
  if(z<158)for(const s of [-1,1])beam(col,[x+s*1.4,Y,z],[x+s,yr(z),z],.35,.35,null);}
 if(d===0){kput('dot',[x,yr(168)+.4,168],null,[.5,.5,.5],CYAN);kput('slDrone',[x,yr(58)+.3,58],qEuler(-.05,0,0),1,null);}}
function slCarKit(H,d){const Y=SLC.YF,sh=SHELL(d);
 // elevators: raised ones flush with the deck, the port one down at the hangar
 for(const e of SLC.EL){const zm=(e.z0+e.z1)/2,L=e.z1-e.z0;
  if(e.down){const xa=slCarHw(zm,SLC.YM)-.4,xb=xa+15;
   if(d===1){const g=boxUV(15,.9,L,8).translate(7.5,0,0);g.rotateZ(-.95);g.translate(xa,SLC.YM-.5,zm);pbAdd(g,sh,H);continue;}
   pbBox(H,sh,(xa+xb)/2,SLC.YM-.1,zm,15,.9,L,0,8);
   if(d===0){for(let k=0;k<2;k++)kput('slDrone',[xa+5+k*5.5,SLC.YM+.35,zm+rr(-3,3)],qEuler(0,Math.PI/2+rr(-.2,.2),0),1,null);portFigures(xa+6,SLC.YM+.35,zm,4,4);}
   continue;}
  const xe=e.s<0?slCarXS(zm):slCarXP(zm),xa=xe-e.s*5,xb=xe+e.s*12;
  if(d===1&&e.z0>0){const g=boxUV(17,.9,L,8).translate(-8.5,0,0);g.rotateZ(1.25);g.translate(xe+2*e.s,Y-.8,zm);pbAdd(g,sh,H);continue;}
  pbBox(H,sh,(xa+xb)/2,Y-.5,zm,Math.abs(xb-xa),1.08,L,0,8);}
 // the launch rails (removed by the town at d=3)
 if(d<3){slCarRail(H,d,-10);slCarRail(H,d,6);}
 // domes and whip masts on the sponsons, hawse holes, gallery windows, deck-edge lights
 for(const p of [[-1,-150],[1,-150],[1,-60],[-1,100],[1,100]]){const z=p[1],x=(p[0]<0?slCarXS(z):slCarXP(z))-p[0]*2.2;
  const xo=x+p[0]*5.4,dc=d>0?new THREE.Color(0x8a6a58):null;kput('slDome',[xo,Y-1.6,z],null,[1.6,1.9,1.6],dc);kput(d>0?'boxR':'boxW',[xo,Y-2.2,z],null,[4.4,1.2,4.4],null);
  beam(d>0?'strutR':'strutW',[xo,Y-2.8,z],[xo-p[0]*2.2,Y-6,z],.4,.4,null);}
 for(const z of [-140,-96,-40,46,86]){for(const s of [-1,1]){if(s<0&&z>-50&&z<20)continue;const x=(s<0?slCarXS(z):slCarXP(z))+s*.4;
  if(d===1&&rng()<.5)continue;beam(d>0?'strutR':'strutW',[x,Y-1,z],[x+s*(d===1?6:2.2),Y+(d===1?-4:9),z+rr(-1,1)],.18,.18,null);}}
 for(const s of [-1,1]){const p=[s*slCarHw(136,8)+s*.1,8,136];kput('ovalD',p,qFacing([s,0,.4]),[1.1,1.1,.4],null);}
 for(let z=-136;z<66;z+=6)for(const s of [-1,1]){if(slCarOpen(s,z))continue;const x=s*(slCarHw(z,9)+.06);
  const lit=d===0?rng()<.55:d>=3?rng()<.35:false;kput(lit?'dot':'cellD',[x,9,z],qEuler(0,Math.PI/2,0),lit?[1.2,.45,.12]:[1.2,.5,.12],lit?(d===0?CYAN:WARM):null);}
 if(d===0){for(let z=-156;z<158;z+=9){kput('dot',[slCarXS(z)+.3,Y+.08,z],null,[.3,.14,.3],CYAN);kput('dot',[slCarXP(z)-.3,Y+.08,z],null,[.3,.14,.3],CYAN);}
  for(const s of [-1,1])for(let z=-128;z<60;z+=12)kput('strip',[s*(slCarHw(z,SLC.YM-1.5)+.1),SLC.YM-1.5,z+6],qEuler(0,Math.PI/2,0),[11.6,1,1],CYAN);}}

// d=0: drones parked on their spots, crews, deck tractors.
function slCarDrones(H,d){const Y=SLC.YF;
 for(let z=-132;z<-54;z+=11)kput('slDrone',[-17,Y,z],qEuler(0,.75,0),1,null);
 for(let z=66;z<116;z+=11)kput('slDrone',[17,Y,z],qEuler(0,-.75,0),1,null);
 for(let i=0;i<5;i++)kput('slDrone',[rr(-12,-4),Y,rr(-150,-140)+i*1],qEuler(0,rr(-.3,.3),0),1,null);
 for(let i=0;i<6;i++)kput('boxW',[rr(-16,16),Y+.6,rr(-100,100)],qEuler(0,rng()*TAU,0),[2.2,1.2,3.4],new THREE.Color(0xd8c040));
 portFigures(-14,Y,-90,10,10);portFigures(12,Y,90,8,10);portFigures(-17,Y,-10,6,3);portFigures(0,Y,40,6,12);}

// d=1: the wreck's dressing.
function slCarRuin(H,d,holeXZ){const Y=SLC.YF,ok=(x,z)=>!holeXZ(x,z);
 // the island's mast lies across the deck, the top tiers are rubble
 const mz=SLC.IZ;beam('postR',[SLC.IX+1,Y+18,mz+2],[SLC.IX+30,Y+.8,mz-14],1.1,1.1,null);
 kput('pkDish',[SLC.IX+27,Y+.5,mz-11],qEuler(1.2,.3,.4),1.4,new THREE.Color(0x8a6a58));
 portRubble(SLC.IX+3,Y,mz+8,5,18);portRubble(SLC.IX,Y+18.6,mz,3,8);
 // drones: some left on their spots, rusting, tumbled; one hanging off the edge
 for(let z=-132;z<-54;z+=11){if(rng()<.45)continue;const x=-17+rr(-2,2);if(!ok(x,z))continue;
  kput('slDrone',[x,Y+rr(0,.3),z+rr(-2,2)],qEuler(rr(-.25,.25),.75+rr(-.8,.8),rr(-.3,.3)),1,new THREE.Color(0x9a6a50));}
 kput('slDrone',[slCarXP(80)+1.2,Y-1.6,80],qEuler(.2,-.4,-1.1),1,new THREE.Color(0x8a5a44));
 // green over the deck: weeds and moss everywhere, trees in the lee of the island
 for(let i=0;i<520;i++){const z=rr(-150,140),a=slCarXS(z)+1,b=slCarXP(z)-1,x=rr(a,b);if(!ok(x,z))continue;
  if(rng()<.6)kput('moss',[x,Y+.05,z],qEuler(rng(),rng()*TAU,rng()),[rr(.5,1.6),rr(.2,.5),rr(.5,1.4)],new THREE.Color().setHSL(rr(.2,.3),rr(.3,.45),rr(.06,.11)));
  else kput('leafCard',[x,Y+.4,z],qEuler(0,rng()*TAU,0),[rr(.5,1.2),rr(.4,.8),rr(.5,1.2)],new THREE.Color().setHSL(rr(.18,.3),rr(.35,.55),rr(.35,.55)));}
 for(const c of [[-12,-60,9],[8,-120,7],[-8,20,6],[10,110,5],[-14,-2,5]])for(let i=0;i<c[2];i++){const x=c[0]+rr(-7,7),z=c[1]+rr(-10,10);if(ok(x,z))VEG.tree(x,Y,z,i%3,rr(4,10));}
 // vines down the deck edge, stains down the hull
 for(let i=0;i<70;i++){const z=rr(-155,150),s=rng()<.5?-1:1,x=s<0?slCarXS(z):slCarXP(z);
  kput('vine',[x,Y+.2,z],qEuler(rr(-.08,.08),rng()*TAU,rr(-.08,.08)),[rr(.8,1.8),rr(4,14),rr(.8,1.8)],null);}
 for(let i=0;i<60;i++){const z=rr(-150,120),s=rng()<.5?-1:1,y=rr(4,16);
  kput('stain',[s*(slCarHw(z,y)+.12),y,z],qFacing([s,0,0]),[rr(2,6),rr(4,10),1],null);}
 portRubble(-4,Y,-40,4,10);portRubble(10,Y,60,3,8);}

// d=3: the town on the deck (after boat3: shacks, stalls, awnings, scaffold towers).
function slCarTown(H,d,holeXZ){const Y=SLC.YF,X0=2,ok=(x,z)=>!holeXZ(x,z);
 const inIsland=(x,z)=>x<SLC.IX+9&&z>SLC.IZ-24&&z<SLC.IZ+22;
 const lanes=[-118,-66,-14,40,92];const onLane=z=>lanes.some(l=>Math.abs(z-l)<2.6);
 const cell=6.5;let nH=0;
 for(let z=-154;z<150;z+=cell)for(let x=-30;x<40;x+=cell){const cx=x+cell/2+rr(-.6,.6),cz=z+cell/2+rr(-.6,.6);
  const a=slCarXS(cz)+2.6,b=slCarXP(cz)-2.6;if(cx<a||cx>b)continue;
  if(Math.abs(cx-X0)<4.2||onLane(cz)||inIsland(cx,cz)||!ok(cx,cz))continue;
  if(cz>SLC.EL[0].z0-3&&cz<SLC.EL[0].z1+3&&cx<a+10)continue;
  const r=rng();
  if(r<.56){const w=rr(3.6,5.6),dp=rr(3.4,5.4),h=rr(2.6,3.4),yaw=(Math.abs(cx-X0)<11?(cx>X0?Math.PI/2:-Math.PI/2):rng()<.5?0:Math.PI)+rr(-.12,.12);
   const t=slShack(cx,Y,cz,yaw,w,dp,h);if(rng()<.3)slShack(cx+rr(-.5,.5),t,cz+rr(-.5,.5),yaw+rr(-.3,.3),w*rr(.6,.85),dp*rr(.6,.85),rr(2.3,2.8));}
  else if(r<.64&&nH<18){portContainerHouse(H,cx,Y,cz,rng()<.5?0:Math.PI/2,d,{noReg:true,big:false,levels:rng()<.4?2:1});nH++;}
  else if(r<.72)portGarden(cx,Y,cz,cell-1.2,cell-1.2,d);
  else if(r<.75)slLattice(cx,Y,cz,rr(9,16),2.6,{hut:rng()<.5});
  else if(r<.8){kput('waterButt',[cx,Y+.9,cz],null,[1,1.8,1],null);portWashLine(cx-2.5,cz,cx+2.5,cz+rr(-1,1),Y+2.4,4);}}
 // the main street: stalls both sides, awnings strung over the middle stretch, crowds
 for(let z=-150;z<146;z+=4.2){if(onLane(z))continue;for(const s of [-1,1]){if(rng()<.25)continue;const x=X0+s*3.1;if(!ok(x,z)||inIsland(x,z))continue;
  portStall(x,Y,z,s>0?-Math.PI/2:Math.PI/2);}}
 for(let z=-60;z<70;z+=7){if(!ok(X0,z))continue;kput('pkAwn',[X0,Y+4.4,z],qEuler(rr(-.05,.05),rr(-.1,.1),rr(-.12,.12)),[8.4,1,6.4],new THREE.Color().setHSL(rr(0,1),rr(.3,.6),rr(.5,.72)));
  for(const s of [-1,1])kput('plank',[X0+s*4.1,Y+2.2,z],null,[.12,4.4,.12],null);}
 for(let z=-146;z<146;z+=12)portFigures(X0,Y,z,7,2.4);
 for(const l of lanes)portFigures(X0+rr(-10,10),Y,l,5,6);
 // the island: a tower village clinging to its tiers
 const X=SLC.IX,Z=SLC.IZ;
 let ty0=0;for(const [ty,w,l] of [[8.1,11.4,37],[14,12.4,31],[18.6,11,25]]){const n=Math.round(l/3.2);
  for(let i=0;i<n;i++){const a=i/n*TAU,px=X+Math.cos(a)*(w/2+.7),pz=Z+Math.sin(a)*(l/2+.4);if(px<SLC.IX-5.5&&rng()<.5)continue;
   const sw=rr(2.6,3.6),sd=rr(2.4,3.2),sh=rr(2.2,2.8);slShack(px,Y+ty+.4,pz,-a+Math.PI/2,sw,sd,sh,{lit:.6});
   if(rng()<.35)slShack(px,Y+ty+sh+.5,pz,-a+Math.PI/2+rr(-.3,.3),sw*.8,sd*.8,rr(2,2.5),{lit:.6});
   kput('plank',[px+Math.cos(a)*.9,Y+(ty0+ty)/2,pz+Math.sin(a)*.9],null,[.2,ty-ty0+.4,.2],null);}ty0=ty;}
 for(let i=0;i<5;i++)slShack(X+rr(-2,2),Y+24.4,Z+rr(-5,5),rng()*TAU,rr(2.6,3.6),rr(2.6,3.4),rr(2.3,2.8),{lit:.6});
 slLattice(X,Y+24.4,Z,9,2,{hut:true});
 for(let i=0;i<3;i++){const z=Z-10+i*10;kput('pkCloth',[X+5.3,Y+17,z],qEuler(0,Math.PI/2,0),[3.2,9,1],new THREE.Color().setHSL(rr(0,.06),.7,.45));}
 portWashLine(X+6,Z-14,X+6,Z+14,Y+13.6,14);portWashLine(X-7,Z-12,X-7,Z+10,Y+8,10);
 slStairTower(X+7.5,Y,Z+18,Y+13,Math.PI,d);
 // the lowered elevator is a market platform; the hangar openings glow
 const E=SLC.EL[2],em=(E.z0+E.z1)/2,exa=slCarHw(em,SLC.YM)+.6;
 for(let k=0;k<3;k++)portStall(exa+3+k*4,SLC.YM+.35,em-4,0);for(let k=0;k<3;k++)portStall(exa+3+k*4,SLC.YM+.35,em+4,Math.PI);
 portFigures(exa+7,SLC.YM+.35,em,8,4);
 for(const o of SLC.OPEN){const zm=(o[1]+o[2])/2;for(let k=0;k<3;k++)kput('dot',[o[0]*20.6,SLC.YM+4.5,o[1]+3+k*(o[2]-o[1]-6)/2],null,[.35,.35,.35],WARM);portFigures(o[0]*20.6,SLC.YM,zm,4,Math.min(2,(o[2]-o[1])/2-2));
  if(rng()<.7)kput('pkCloth',[o[0]*(slCarHw(zm,SLC.YM)+.3),19.6,zm],qEuler(0,Math.PI/2,0),[(o[2]-o[1])*.8,rr(2.5,5),1],new THREE.Color().setHSL(rr(0,1),.5,.55));}
 // walkways down the port side to rafts at the waterline, rafts and boats all along
 for(const z of [84,-146]){const x=slCarXP(z)+2;slStairTower(x,1.3,z,Y,0,d);kput('plank',[x-1.2,Y-.05,z],null,[4,.14,2],null);
  slRaft(x+3,z,0,9,16,d,{shack:true,people:4,y:.7});}
 for(const z of [-100,-40,20]){slRaft(slCarHw(z,0)+6,z,rr(-.05,.05),7,14,d,{shack:rng()<.7,line:true,people:3,y:.7});}
 for(let i=0;i<9;i++)portSkiff(rr(26,34),rr(-150,140),rr(-.2,.2));
 for(let z=-120;z<60;z+=30)kput('pkLadder',[slCarHw(z,SLC.YM)+.15,SLC.YH,z],qEuler(0,Math.PI/2,0),[1,2,1],null);
 // salvage patches on the hull, lanterns on poles
 for(let i=0;i<70;i++){const z=rr(-150,120),s=rng()<.5?-1:1,y=rr(1.5,11);
  kput(rng()<.5?'patchPlate':'patchSheet',[s*(slCarHw(z,y)+.1),y,z],qFacing([s,0,0]),[rr(2,5),rr(1.5,3.5),1],null);}
 for(let z=-146;z<146;z+=16){kput('plank',[X0+4.6,Y+2,z],null,[.1,4,.1],null);kput('dot',[X0+4.6,Y+4.1,z],null,[.35,.35,.35],WARM);}}

function buildSlCarrier(scene,gx,gz,d,opt){reseed(20600+d);
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);KOFF=[gx,0,gz];
 const hd=opt.heading||0,H=new THREE.Group();H.rotation.order='YXZ';H.rotation.y=hd;G.add(H);
 if(d===1){H.rotation.z=-.07;H.rotation.x=.016;H.position.y=-3.4;}         // aground, listing to port, down by the bow
 else if(d>=3){H.rotation.z=.01;H.position.y=-.7;}
 H.updateMatrix();useGroupXF(H);
 slCarHull(H,d);const holeXZ=slCarDeck(H,d);const itop=slCarIsland(H,d);slCarKit(H,d);
 if(d===0)slCarDrones(H,d);else if(d===1)slCarRuin(H,d,holeXZ);else slCarTown(H,d,holeXZ);
 endGroupXF();
 const yo=H.position.y;
 for(const z of [-125,-65,-5,55,115])slReg('Drone carrier — hull and flight deck',2,z,32,SLC.YF+SLC.T+2,-SLC.T+yo,hd);
 slReg('Drone carrier — island',SLC.IX,SLC.IZ,18,itop-SLC.YF+(d===1?2:22),SLC.YF+yo,hd);
 if(d<3)slReg('Drone launch rails',-2,120,14,10,SLC.YF+yo,hd);
 KOFF=[0,0,0];return G;}
PORT_VESSEL({key:'slCarrier',name:'Drone carrier',cls:'vessel',W:220,LAND:0,SEA:0,decays:[0,1,3],length:320,beam:68,hullBeam:40,draft:11,
 moorY:10,deckY:SLC.YF,stbd:-39.5,port:39.5,stamps:()=>[],build:buildSlCarrier});
