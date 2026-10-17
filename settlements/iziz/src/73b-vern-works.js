// ================================================================= 73b. THE WORKS: mine head, quarry, watermill, fungus house
// The trades round (2026-10-16), after the Voth census trades: miners, quarrymen and masons, granary keepers and millers,
// mushroom growers (settlements/voth/src/71-industry.js MINE ENTRANCE, QUARRY, MUSHROOM FARM; 65k-granary-mills-ranch.js).
// Iziz is rain-fed hyperjungle over Ancient ruins: the headframe is salvaged pipe, the sheds are roofed in cut Ancient
// panel, the quarry's cut has bared a buried Ancient wall, the mill is fed by a flume off the hill. None is lit (poor and
// middle). Each enclosed body is a vnBody, so the hut, the lodge, the mill house and the fungus house have rooms
// (kits/interiors/sets/iziz.js, after /* @@ag-works@@ */). Seeds 8401-8499. Helpers are vwk*.

// ore heap tints by o.metal (iron by default)
const VWK_ORE={iron:0x8a4630,copper:0x3f8a72,gold:0xc8a24a,tin:0x8a8a84,silver:0xa8a8b0,coal:0x2e2a28};
// a cylinder of a post item (base at y = 0 in the item) from a to b, local frame
function vwkCyl(item,a,b,r,c){const d=new THREE.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]),L=d.length();if(L<1e-3)return;
 kput(item,a,new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize()),[r,L,r],c||null);}
// a heap: one flattened mound and lumps on its flanks (spoil, ore, rubble)
function vwkHeap(x,z,rx,rz,h,c,n){kput('vRock',[x,0,z],null,[rx,h,rz],c);
 for(let i=0;i<n;i++){const a=rng()*TAU,t=Math.sqrt(rng())*.9,px=x+Math.cos(a)*rx*t,pz=z+Math.sin(a)*rz*t,top=h*Math.sqrt(Math.max(0,1-t*t)),s=rr(.12,.34);
  kput('vRock',[px,top-s*.35,pz],qEuler(rr(0,3),rr(0,3),0),[s*rr(.8,1.4),s,s*rr(.8,1.4)],c.clone().multiplyScalar(rr(.7,1.18)));}}
// a wheel standing in the y-z plane (axle along x): rim, spokes, hub
function vwkWheel(x,y,z,r,c,n,th){kput('vHoop',[x,y,z],qEuler(0,Math.PI/2,0),[r,r,th||1.5],c);
 for(let k=0;k<n;k++){const a=k/n*TAU;vBeam([x,y,z],[x,y+Math.sin(a)*r*.97,z+Math.cos(a)*r*.97],Math.max(.04,r*.05),c,'vWood');}
 vwkCyl('vPipe',[x-.2,y,z],[x+.2,y,z],Math.max(.08,r*.09),vC(0x2e2a26));}
// an ore cart (tub on four iron wheels) on a rail line running along local z
function vwkCart(x,z,ry,load){vB('vRustB',x,.42,z,.95,.62,1.3,ry);vB('vIron',x,.3,z,.72,.1,1.15,ry,vC(0x2e2a26));
 for(const s of[-1,1])for(const t of[-1,1]){const a=loc(x,z,s*.42,t*.42,ry),b=loc(x,z,s*.54,t*.42,ry);vwkCyl('vPipe',[a[0],.21,a[1]],[b[0],.21,b[1]],.2,vC(0x2e2a26));}
 if(load)for(let k=0;k<7;k++){const p=loc(x,z,rr(-.3,.3),rr(-.45,.45),ry);kput('vRock',[p[0],1.02,p[1]],qEuler(rr(0,3),rr(0,3),0),[rr(.14,.24),rr(.1,.18),rr(.14,.24)],load.clone().multiplyScalar(rr(.75,1.15)));}}
// a stack of n x m x l cut blocks (bw x bh x bd each) on timber bearers, every block a touch off
function vwkBlocks(x,z,ry,n,m,l,bw,bh,bd,c){const g=.06;for(const s of[-1,1]){const p=loc(x,z,0,s*(m*(bd+g))/3,ry);vB('vWood',p[0],0,p[1],n*(bw+g)+.2,.14,.16,ry,vC(0x6a5a48));}
 for(let k=0;k<l;k++)for(let i=0;i<n-(k&&rng()<.4?1:0);i++)for(let j=0;j<m;j++){const p=loc(x,z,(i-(n-1)/2)*(bw+g)+rr(-.03,.03),(j-(m-1)/2)*(bd+g)+rr(-.03,.03),ry);
  vB('vStone',p[0],.14+k*(bh+.02),p[1],bw,bh,bd,ry+rr(-.03,.03),c.clone().multiplyScalar(rr(.88,1.08)));}}
// a pile of logs along local x: rows of n logs, layers shrinking by one
function vwkLogs(x,z,ry,L,n,layers,r,c){for(let k=0;k<layers;k++)for(let i=0;i<n-k;i++){const lz=(i-(n-k-1)/2)*r*2.05,y=r+k*r*1.75;
  const a=loc(x,z,-L/2+rr(-.1,.1),lz,ry),b=loc(x,z,L/2+rr(-.1,.1),lz,ry);vwkCyl('vPost',[a[0],y,a[1]],[b[0],y,b[1]],r*rr(.85,1.1),c.clone().multiplyScalar(rr(.8,1.1)));}}
// bracket fungi and caps: n small flattened clay balls round a point
function vwkFungi(x,y,z,n,sp){for(let i=0;i<n;i++)kput('vGourd',[x+rr(-sp,sp),y+rr(-sp,sp)*.6,z+rr(-sp,sp)],null,[rr(.05,.11),rr(.025,.045),rr(.05,.11)],vC(vPick([0xe8dcc0,0xe8dcc0,0xe0903a,0xc8a070,0xb87840,0xf0e6d0])));}
// an earth bank against a wall: a sloping slab from the wall foot out `run`, `h` high at the wall, lumps along its crest and toe
function vwkBerm(x,z,L,ry,h,run,c){const a=Math.atan2(h,run),S=Math.hypot(h,run)+.3,p=loc(x,z,0,run/2,ry);
 kput('vClayB',[p[0],h/2-.14,p[1]],vQ(ry,a,0),[L,.34,S],c);
 const n=Math.max(1,Math.round(L/2.4));for(let i=0;i<n;i++){const u=-L/2+(i+.5)*L/n+rr(-.5,.5);
  {const q=loc(x,z,u,.35,ry);kput('vRock',[q[0],h-.12,q[1]],qEuler(0,ry+rr(-.3,.3),0),[rr(1.0,1.5),.16,.5],c.clone().multiplyScalar(rr(.85,1.1)));}   // the crest, rounded over
  if(rng()<.5){const q=loc(x,z,u+rr(-.4,.4),run*rr(.3,.8),ry);kput('rubble',[q[0],h*.3,q[1]],qEuler(rr(0,3),rr(0,3),rr(0,3)),[rr(.2,.35),rr(.15,.25),rr(.2,.35)],vC(0x8a7a68));}}   // a stone in the bank
 {const q=loc(x,z,0,run+.05,ry);kput('vRock',[q[0],0,q[1]],qEuler(0,ry,0),[L/2+.2,.12,.45],c.clone().multiplyScalar(.9));}}   // the toe

// a crag of rough rock: a jumbled core of rubble blocks, w x h x d about (x, z), stepping down to the front (+z) and the ends,
// with boulders at its foot; `keep` = [[x, half-width]] gaps left clear along the front face (an adit, a shaft)
function vwkCrag(x,z,w,h,d,c,keep){const K=1/1.45;kput('rubble',[x,h*.36,z-d*.1],qEuler(0,0,0),[w*.84*K,h*.72*K,d*.7*K],c.clone().multiplyScalar(.82));
 const nx=Math.round(w/2.6);for(let i=0;i<nx;i++){const u=-w/2+(i+.5)*w/nx,e=1-Math.pow(Math.abs(u)/(w/2),2)*.45;
  for(const [fz,fh,fs] of[[-.3,1,1.25],[0,.86,1.15],[.22,.62,1],[.36,.34,.8]]){const px=x+u+rr(-.5,.5),pz=z+fz*d;
   if(fz>.2&&keep.some(k=>Math.abs(px-k[0])<k[1]))continue;const s=Math.min(rr(2.6,3.6)*fs,h*fh*1.1),hh=h*fh*e*rr(.85,1.08);
   kput('rubble',[px,hh-s*.55,pz],qEuler(rr(-.25,.25),rr(0,TAU),rr(-.25,.25)),[s*K*rr(.9,1.3),s*K*rr(.8,1.1),s*K*rr(.8,1.1)],c.clone().multiplyScalar(rr(.78,1.12)));}}
 for(let k=0;k<Math.round(w/1.6);k++){const px=x+rr(-w/2,w/2);if(keep.some(q=>Math.abs(px-q[0])<q[1]+.6))continue;const s=rr(.4,1.0);
  kput('rubble',[px,s*.25,z+d/2+rr(-.1,.5)],qEuler(rr(0,3),rr(0,3),rr(0,3)),[s*K,s*K*.7,s*K],c.clone().multiplyScalar(rr(.7,1.05)));}}

// ---------------------------------------------------------------- mine head: adit into the rock, pipe headframe over a shaft, ore cart, heaps, winch, miners' hut
function buildVernMine(G,o){reseed(8401+(o.v|0));const wood=vC(vPick(VPAL.woodPoor)),dark=vC(vPick(VPAL.woodMid)).multiplyScalar(.75),th=vC(vPick(VPAL.thatch));
 const rock=vC(vPick([0xa88a6a,0x9e8064,0xb09070])),ore=vC(VWK_ORE[o.metal]||VWK_ORE.iron),spoil=vC(0x7c7468),rust=vC(vPick([0x8a5a3e,0x7a4a32])),iron=vC(0x3a3632),rope=vC(0xb8a47c);
 const AX=-6,SX=1,SZ=-1.5,HX=8.5,HZ=1.5,HW=7,HD=5.5,FL=.5,HH=2.6;
 vnReg('Mine head (poor)',0,0,13,10.5);
 // the rock mass: a battered hummock of grey-orange stone, crags on its brow and boulders at its foot
 vwkCrag(0,-7.5,24,7.8,7,rock,[[AX,2.6],[SX,0]]);
 // the adit: a dark mouth in the face, three timber sets lagged with boards, dry-stone wing walls
 vB('vDarkB',AX,0,-4.2,2.6,2.75,.7,0);
 for(const z of[-3.95,-2.95,-1.95]){for(const s of[-1,1])vPst('vPostB',AX+s*1.38,0,z,.15,2.8,dark);vB('vWood',AX,2.8,z,3.3,.3,.34,0,dark);}
 for(let k=0;k<8;k++)vB('vWood',AX-1.55+k*.44,3.1,-2.95,.4,.08,2.5,0,wood.clone().multiplyScalar(rr(.8,1.1)));
 for(const s of[-1,1]){vPl('vBoard',AX+s*1.55,.75,-2.95,2.2,1.4,s*Math.PI/2,wood);
  vB('vStone',AX+s*2.5,0,-3.3,1.4,2.4,1.4,0,rock);vB('vStone',AX+s*2.6,0,-2.1,1.2,1.3,1.0,0,rock.clone().multiplyScalar(.9));
  kput('rubble',[AX+s*2.6,3.0,-3.5],qEuler(rr(-.3,.3),rr(0,3),rr(-.3,.3)),[1.3,.8,1.0],rock.clone().multiplyScalar(.92));}
 vB('vWood',AX,3.18,-3.4,3.6,.5,1.3,0,dark.clone().multiplyScalar(.85));                         // head board under the brow
 // the rail line out of the adit to the tip, a cart on it, a stop block
 for(const s of[-1,1])vB('vIron',AX+s*.45,.12,1.4,.07,.09,10.8,0,iron);
 for(let k=0;k<18;k++)vB('vWood',AX+rr(-.05,.05),0,-3.8+k*.6,1.4,.12,.22,rr(-.06,.06),wood.clone().multiplyScalar(rr(.7,1)));
 vB('vWood',AX,0,7.0,1.5,.5,.4,0,dark);vwkCart(AX,1.4,0,ore);
 // the heaps: ore by the tip and in its crib, spoil against the rock, a barrow
 vwkHeap(AX-3.1,6.3,2.1,1.7,1.2,ore,22);vwkHeap(-10.4,.2,2.3,3.0,2.3,spoil,28);vwkHeap(-10.6,4.6,1.6,1.4,.9,spoil.clone().multiplyScalar(1.1),12);
 {const cx=AX+2.6,cz=5.8;for(const [dx,dz,w,d] of[[0,-.9,2.2,.12],[-1.05,0,.12,1.8],[1.05,0,.12,1.8]])vB('vWood',cx+dx,0,cz+dz,w,.9,d,0,wood);
  for(const s of[-1,1])for(const t of[-1,1])vPst('vPost',cx+s*1.05,0,cz+t*.9,.07,1.05,dark);vwkHeap(cx,cz+.1,.95,.8,.75,ore,12);}
 {const bx=AX+2.2,bz=2.4;vB('vRustB',bx,.4,bz,.7,.4,1.0,.3);vwkCyl('vPipe',[bx-.1,.2,bz+.75],[bx+.1,.2,bz+.75],.2,iron);vBeam([bx-.35,.6,bz-.5],[bx-.45,.55,bz-1.3],.05,dark);vBeam([bx+.35,.6,bz-.5],[bx+.25,.55,bz-1.3],.05,dark);}
 // the shaft: a timber collar round the dark well, a four-legged headframe of salvaged pipe, braced; the sheave on top
 for(const s of[-1,1]){vB('vWood',SX,0,SZ+s*1.05,2.5,.45,.4,0,dark);vB('vWood',SX+s*1.05,0,SZ,.4,.45,1.7,0,dark);}vB('vDarkB',SX,0,SZ,1.72,.43,1.72,0);
 const TOP=8.4,leg=(s,t,y)=>{const f=y/TOP;return[SX+s*(1.5-1.05*f),y,SZ+t*(1.5-1.05*f)];};
 for(const s of[-1,1])for(const t of[-1,1]){vwkCyl('vPipeR',leg(s,t,0),leg(s,t,TOP),.12,rust.clone().multiplyScalar(rr(.85,1.1)));vB('vStone',SX+s*1.5,-.1,SZ+t*1.5,.6,.25,.6,0,rock);}
 for(const y of[2.8,5.6]){for(const s of[-1,1]){vBeam(leg(s,-1,y),leg(s,1,y),.12,dark);vBeam(leg(-1,s,y),leg(1,s,y),.12,dark);}}
 for(const s of[-1,1]){vBeam(leg(s,-1,.3),leg(s,1,2.8),.05,iron,'vIron');vBeam(leg(s,1,.3),leg(s,-1,2.8),.05,iron,'vIron');vBeam(leg(s,-1,2.8),leg(s,1,5.6),.05,iron,'vIron');vBeam(leg(-1,s,2.8),leg(1,s,5.6),.05,iron,'vIron');}
 vB('vWood',SX,TOP,SZ,1.4,.16,1.4,0,dark);for(const s of[-1,1])vB('vWood',SX+s*.35,TOP+.16,SZ+.85,.18,.9,.4,0,dark);
 // back stays toward the winch, taking the rope's pull
 for(const s of[-1,1]){vwkCyl('vPipeR',[SX+s*1.3,0,SZ+4.3],[SX+s*.45,TOP-.1,SZ+.45],.1,rust);vB('vStone',SX+s*1.3,-.1,SZ+4.3,.5,.22,.5,0,rock);}
 const CY=TOP+.95,CZ=SZ+.85;vwkWheel(SX,CY,CZ,.85,dark,8,1.4);
 vwkCyl('vRope',[SX,1.95,SZ],[SX,CY,SZ],.025,rope);                                              // down the shaft, to the kibble
 {vPst('vStave',SX,1.0,SZ,.38,.75,rust);vBq('vHoop',SX,1.72,SZ,.39,.39,1,qEuler(Math.PI/2,0,0),iron);vBeam([SX-.36,1.75,SZ],[SX,1.98,SZ],.03,iron,'vIron');vBeam([SX+.36,1.75,SZ],[SX,1.98,SZ],.03,iron,'vIron');
  kput('vRock',[SX,1.72,SZ],null,[.3,.12,.3],ore);}
 // the hand winch under a lean roof of cut Ancient panel: drum on two trestles, crank handles, rope wound on
 const WZ=4.6;vwkCyl('vRope',[SX,CY+.6,CZ+.55],[SX,1.42,WZ-.15],.025,rope);
 for(const s of[-1,1]){vBeam([SX+s*1.25,0,WZ-.5],[SX+s*1.25,1.15,WZ],.12,dark);vBeam([SX+s*1.25,0,WZ+.5],[SX+s*1.25,1.15,WZ],.12,dark);
  vwkCyl('vPipe',[SX+s*1.1,1.1,WZ],[SX+s*1.55,1.1,WZ],.05,iron);vBeam([SX+s*1.55,1.1,WZ],[SX+s*1.55,.65,WZ+.25],.05,iron,'vIron');vwkCyl('vPipe',[SX+s*1.55,.65,WZ+.25],[SX+s*1.9,.65,WZ+.25],.035,dark);}
 vwkCyl('vStave',[SX-1.15,1.1,WZ],[SX+1.15,1.1,WZ],.26,dark);vwkCyl('vRope',[SX-.7,1.1,WZ],[SX+.7,1.1,WZ],.31,rope);
 for(const s of[-1,1]){vPst('vPost',SX+s*1.9,0,3.5,.1,3.85,dark);vPst('vPost',SX+s*1.9,0,6.2,.1,3.15,dark);}
 for(const z of[3.5,6.2])vB('vWood',SX,z<4?3.72:3.02,z,4.0,.16,.16,0,dark);
 kput('vPanelB',[SX,3.5,4.85],vQ(0,Math.atan2(.72,2.7),.02),[4.5,.09,3.1],vC(0xe8e4dc));
 kput('vRustB',[SX-.9,3.48,4.0],vQ(0,Math.atan2(.72,2.7),-.03),[1.4,.1,1.2],null);                // a rusted patch on the panel
 vPl('vBoard',SX-1.98,.8,4.85,2.7,1.5,-Math.PI/2,wood);                                           // board screen on the weather side
 // the miners' hut: a board room on low stilts, one store end and the bunk room, thatch gable, tarp porch
 vnStilts(HX,0,HZ,HW-.6,HD-.6,FL,0,wood,.15);vB('vWood',HX,FL-.18,HZ,HW+.1,.18,HD+.1,0,wood);
 vnBody('vWood',HX,FL,HZ,HW,HH,HD,0,wood.clone().multiplyScalar(.92),{t:.15});
 for(const s of[-1,1])for(const t of[-1,1])vPst('vPost',HX+s*(HW/2+.06),FL,HZ+t*(HD/2+.06),.12,HH,dark);
 vnPatch(HX,FL,HZ-HD/2,Math.PI,HW,HH,3);vnPatch(HX+HW/2,FL,HZ,Math.PI/2,HD,HH,2);
 vnGableRoof(HX,FL+HH,HZ,HW+.24,HD+.24,2.3,0,'vGableT',th,1.0,'vGableW',wood,.45);
 vnDoor(HX-1.6,FL,HZ+HD/2,0,.95,1.95,'vWood',wood,vC(0x6a5a48),false);vB('vWood',HX-1.6,0,HZ+HD/2+.45,1.4,.25,.7,0,wood);
 vnWin(HX+1.5,FL+1.1,HZ+HD/2,0,.9,.7,'open','vWood',wood,true);vnWin(HX+HW/2,FL+1.1,HZ+.6,Math.PI/2,.8,.7,'shut','vWood',wood);
 vnWin(HX-HW/2,FL+1.1,HZ+.4,-Math.PI/2,.8,.7,'open','vWood',wood);vnWin(HX+1,FL+1.2,HZ-HD/2,Math.PI,.8,.6,'open','vWood',wood);
 vnAwning(HX-1.6,FL+2.35,HZ+HD/2,0,2.0,1.2,vC(0xb0a070));vnChimney(HX+2.4,FL+HH+.9,HZ-1.2,1.5,.12,true);
 // the yard: pit props, the water butt, tool rack, crates and sacks, an Ancient panel and a broken Ancient pipe the miners dug out
 vnWaterButt(HX+HW/2+.75,0,HZ+HD/2-.7,.42,1.1);vnCrate(HX+HW/2+.8,0,HZ-1.2,.8,.3,wood);vnSacks(HX-HW/2-.9,0,HZ+2.9,3);
 vwkLogs(5.4,8.6,.1,3.4,5,3,.14,dark);
 for(let k=0;k<4;k++){const x=HX+2.6-k*.45;vBeam([x,0,HZ+HD/2+.35],[x+.1,1.5,HZ+HD/2+.1],.05,dark);vB('vIron',x+.1,1.45,HZ+HD/2+.1,.5,.07,.07,0,iron);}   // picks against the hut
 kput('vPanelB',[5.3,1.65,-4.2],vQ(-.25,-.22,.08),[2.4,3.3,.14],vC(0xd8d4cc));
 vwkCyl('vTankW',[-12.2,.45,9.4],[-8.6,.45,8.4],.5,vC(0xd0ccc4));vB('vDarkB',-12.2,0,9.4,.1,.85,.85,-.27);
 vnFolk(-2.2,6.8,3,2.2);}

// ---------------------------------------------------------------- quarry: a stepped cut in a block of orange stone, shear legs, sledge ramp, block stacks, masons' lodge
function buildVernQuarry(G,o){reseed(8411+(o.v|0));const wood=vC(vPick(VPAL.woodMid)),dark=vC(vPick(VPAL.woodPoor)).multiplyScalar(.85),pl=vC(vPick(VPAL.sand)),trim=vC(vPick(VPAL.trim));
 const st=vC(vPick([0xd08a4a,0xc8803e,0xd89a5a,0xcc8444])),st2=st.clone().multiplyScalar(.9),soil=vC(0x6a4e36),rope=vC(0xb8a47c),iron=vC(0x2e2a26);
 const LX=8.5,LZ=6,LW=8,LD=5.5,LY=.35,LH=3.0;
 vnReg('Quarry and mason\'s lodge (middle)',0,0,14,10);
 // the uncut flanks either side of the cut, with overburden on their brows
 for(const s of[-1,1]){vwkCrag(s*10.5,-7.5,7.4,8.2,9,st,[]);
  for(let k=0;k<4;k++)kput('vRock',[s*rr(8.6,12),rr(7.3,7.8),-7.5+rr(-2.6,2.6)],qEuler(0,rr(0,3),0),[rr(1.2,1.8),rr(.6,1.1),rr(1.2,1.7)],(k%2?soil:st2).clone().multiplyScalar(rr(.85,1.1)));
  for(let k=0;k<3;k++)kput('vRock',[s*rr(7.6,13),.1,rr(-3.3,-2.6)],qEuler(rr(0,3),rr(0,3),0),[rr(.4,.8),rr(.3,.5),rr(.4,.7)],st2);}
 // the cut: three benches stepping back, each face with bedding lines and drill grooves, part-cut blocks on the benches
 const T=[[2.6,-3.5],[5.2,-6.2],[7.6,-8.9]];
 T.forEach(([y,zf],i)=>{const d=-12-zf,c=i%2?st2:st;vB('vStone',0,0,(zf-12)/2,14.2,y,-d,0,c);
  for(let k=1;k<4;k++)vB('vStone',0,y*k/4-.03,zf+.01,14.2,.06,.04,0,c.clone().multiplyScalar(.78));      // bedding lines
  for(let k=0;k<11;k++){const x=-6.5+k*1.3+rr(-.2,.2);vB('vDarkB',x,y-rr(.6,1.3),zf+.02,.05,rr(.5,1.2),.04,0);}   // half-drill grooves
  if(i<2)for(let k=0;k<2;k++){const x=(k?-1:1)*rr(1.5,5.5);vB('vDarkB',x,y,T[i+1][1]+1.05,1.9,.04,1.05,0);      // a block being parted from the bench
   vB('vStone',x,y,T[i+1][1]+.55,1.7,.85,.9,0,c.clone().multiplyScalar(1.06));vB('vIron',x+.4,y+.85,T[i+1][1]+.5,.06,.18,.06,0,iron);vB('vIron',x-.3,y+.85,T[i+1][1]+.5,.06,.18,.06,0,iron);}});
 kput('vRock',[0,7.6,-10.9],null,[6.5,.7,1.4],soil);for(let k=0;k<5;k++)kput('vRock',[-5+k*2.5+rr(-.4,.4),7.65,-10.6+rr(-.5,.5)],qEuler(0,rr(0,3),0),[rr(.9,1.5),rr(.4,.7),rr(.8,1.2)],soil.clone().multiplyScalar(rr(.8,1.2)));
 // the cut has bared a buried Ancient wall in the +x flank: ghost-white panels standing proud of the stone
 for(let k=0;k<3;k++)kput('vPanelB',[7.05+k*.02,1.6+k*2.1,-3.8-k*.9],vQ(Math.PI/2,0,rr(-.04,.04)),[2.4-k*.5,1.9,.16],vC(0xe0dcd4));
 // the shear legs: two poles splayed over the bottom bench, a guy rope forward, the tackle with a block slung, a windlass at the foot
 const SX=-3.5,AP=[SX,7.3,-4.3];for(const s of[-1,1])vwkCyl('vPost',[SX+s*1.7,0,-1.3],AP,.15,dark);
 vB('vIron',SX,AP[1]-.1,AP[2],.5,.2,.3,0,iron);vwkCyl('vRope',[SX,AP[1],AP[2]],[SX,0,7.5],.025,rope);vPst('vPost',SX,0,7.5,.08,.5,dark);
 vwkCyl('vRope',[SX,3.85,-4.3],[SX,AP[1]-.1,AP[2]],.03,rope);vB('vIron',SX,3.7,-4.3,.3,.3,.2,0,iron);
 vBeam([SX-.55,3.0,-4.3],[SX,3.75,-4.3],.03,iron,'vIron');vBeam([SX+.55,3.0,-4.3],[SX,3.75,-4.3],.03,iron,'vIron');
 vB('vStone',SX,2.62,-4.3,1.3,.7,.75,.06,st.clone().multiplyScalar(1.05));
 vwkCyl('vStave',[SX-1.2,.95,-1.5],[SX+1.2,.95,-1.5],.22,dark);vwkCyl('vRope',[SX-.5,.95,-1.5],[SX+.5,.95,-1.5],.26,rope);vwkCyl('vRope',[SX,1.2,-1.5],[SX,AP[1]-.15,AP[2]+.05],.025,rope);
 for(const s of[-1,1]){vBeam([SX+s*1.25,0,-1.9],[SX+s*1.25,1.0,-1.5],.1,dark);vBeam([SX+s*1.25,0,-1.1],[SX+s*1.25,1.0,-1.5],.1,dark);vBeam([SX+s*1.2,.95,-1.5],[SX+s*1.3,.5,-1.1],.05,iron,'vIron');}
 // the sledge ramp: dry-stone fill stepping down from the bench, two skid timbers with sleepers, a sledge with a block at its foot
 const RX=1.8,RA=Math.atan2(2.6,7.6),RL=Math.hypot(2.6,7.6);
 vB('vStone',RX,0,-2.3,2.6,2.0,2.4,0,st2);vB('vStone',RX,0,.2,2.6,1.15,2.6,0,st2.clone().multiplyScalar(.95));vB('vStone',RX,0,2.4,2.6,.45,1.8,0,st2.clone().multiplyScalar(.9));
 kput('vStone',[RX,1.3-.12,.3],vQ(0,RA,0),[2.6,.22,RL],st2.clone().multiplyScalar(1.05));
 for(const s of[-1,1])kput('vWood',[RX+s*.7,1.3+.1,.3],vQ(0,RA,0),[.26,.2,RL],dark);
 for(let k=0;k<9;k++){const t=(k+.5)/9,z=-3.5+7.6*t;vB('vWood',RX,2.6*(1-t)+.04,z,1.9,.1,.2,0,dark.clone().multiplyScalar(.85));}
 {const z=5.4;for(const s of[-1,1])vB('vWood',RX+s*.55,0,z,.2,.25,2.2,0,dark);vB('vWood',RX,.25,z,1.4,.1,1.9,0,wood);vB('vStone',RX,.35,z,1.2,.7,1.4,0,st);vwkCyl('vRope',[RX,.15,z+1.15],[RX-.2,.05,z+2.4],.03,rope);}
 // the blocks stacked by size on bearers: big, middling, ashlar, and a heap of rubble and spalls
 vwkBlocks(-10,1.4,0,2,2,2,1.8,.85,.9,st);vwkBlocks(-6.6,1.6,0,3,2,3,1.1,.55,.6,st2);vwkBlocks(-10.4,5.4,.05,4,3,3,.6,.32,.35,st);
 vwkBlocks(-6.6,5.6,-.04,3,2,2,1.0,.5,.55,st.clone().multiplyScalar(1.04));vwkHeap(-11.6,9.4,1.6,1.4,.8,st2,22);vwkHeap(-3,9.6,1.3,1,.45,st,14);
 // quarry floor: chippings and slabs underfoot
 vnPaving(-2,.03,2.6,20,6,0,st2.clone().multiplyScalar(.9),14);
 for(let k=0;k<60;k++)kput('vRock',[rr(-12.5,6),.02,rr(-3,10)],qEuler(0,rr(0,3),0),[rr(.06,.18),rr(.03,.07),rr(.06,.16)],st.clone().multiplyScalar(rr(.8,1.15)));
 // the masons' lodge: plaster on a stone plinth, corrugate gable with orange fascias, the banker benches under its front lean-to
 vB('vStone',LX,-.1,LZ,LW+.4,LY+.1,LD+.4,0,vC(vPick(VPAL.stoneDark)));
 vnBody('vPlaster',LX,LY,LZ,LW,LH,LD,0,pl,{t:.25});
 for(const s of[-1,1])for(const t of[-1,1])vPst('vPost',LX+s*(LW/2+.04),LY,LZ+t*(LD/2+.04),.14,LH,wood);
 const top=vnCornice('vWood',LX,LY+LH,LZ,LW,LD,0,wood,1);
 vnGableRoof(LX,top,LZ,LW,LD,1.9,0,'vGableC',null,.9,'vGablePl',pl,.16);
 for(const t of[-1,1])vB('vWood',LX,top-.7,LZ+t*(LD/2+1.0),LW+1.9,.22,.08,0,trim);                  // orange fascias
 vnDoor(LX-2.2,LY,LZ+LD/2,0,1.1,2.2,'vWood',wood,trim,false);
 vnWin(LX+1.6,LY+1.1,LZ+LD/2,0,1.2,1.1,'open','vWood',trim,true);vnWin(LX+LW/2,LY+1.1,LZ,Math.PI/2,1.0,1.0,'open','vWood',trim,true);
 vnWin(LX-LW/2,LY+1.1,LZ-.6,-Math.PI/2,1.0,1.0,'shut','vWood',trim);vnWin(LX+.8,LY+1.2,LZ-LD/2,Math.PI,1.0,.9,'shut','vWood',trim);
 vnStrip(LX-.4,LY+.9,LZ+LD/2,0,.5,1.7,'vWood',wood);
 // the lean-to and its bankers (a dressing stone on a stout timber stand), a half-dressed block on each
 {const z0=LZ+LD/2,dz=2.4;for(const x of[LX-LW/2+.3,LX+.4,LX+LW/2-.3])vPst('vPost',x,0,z0+dz,.1,2.55,wood);
  kput('vCorr',[LX,2.85,z0+dz/2],vQ(0,Math.atan2(.55,dz),0),[LW+.6,.06,dz+.6],null);vB('vWood',LX,2.45,z0+dz,LW,.16,.16,0,wood);
  for(const x of[LX+1.5,LX+3.2]){vB('vWood',x,0,z0+1.2,.9,.75,.7,0,dark);vB('vStone',x,.75,z0+1.2,.8,.45,.55,rr(-.2,.2),st.clone().multiplyScalar(1.08));
   vB('vIron',x+.3,1.2,z0+1.25,.05,.22,.05,0,iron);vB('vWood',x-.3,1.2,z0+1.1,.24,.12,.12,.4,dark);}
  vB('vWood',LX-.6,0,z0+1.9,1.6,.42,.4,0,dark);}                                                    // a bench for the masons
 vnSign(LX+LW/2,LY+2.4,LZ+LD/2-.6,Math.PI/2,trim);vnWaterButt(LX-LW/2-.7,0,LZ+LD/2-.5,.42,1.1);vnBarrel(LX-LW/2-.8,0,LZ-1.4,.38,.95,wood);
 vnCrate(LX+LW/2+.7,0,LZ-1.6,.8,.2,wood);vB('vStone',LX+LW/2+.8,0,LZ+1.6,.7,.5,.5,.3,st);vnFolk(0,7.5,4,3);}

// ---------------------------------------------------------------- watermill: mill house on a stone plinth, overshot wheel on its +x side fed by a flume off the hill, sack hoist, grain bins
function buildVernMill(G,o){reseed(8421+(o.v|0));const wood=vC(vPick(VPAL.woodMid)),dark=wood.clone().multiplyScalar(.72),pl=vC(vPick(VPAL.sand)),trim=vC(vPick(VPAL.trim)),th=vC(vPick(VPAL.thatch));
 const stn=vC(vPick(VPAL.stoneDark)),stl=vC(vPick(VPAL.stone)),water=vC(0xa8c8b8),rope=vC(0xb8a47c),iron=vC(0x2e2a26);
 const BX=-2.5,W=9,D=8,Y0=1.2,H1=3.2,H2=2.7,Y2=Y0+H1+.3;
 const WX=3.35,WY=3.1,WR=2.8;                                                                      // the wheel: x of its centre plane, axle height, radius
 vnReg('Watermill (middle)',0,0,11,12);
 // the plinth, battered at its foot
 vB('vStone',BX,0,0,W+.8,Y0,D+.8,0,stn);kput('vBatterS',[BX,0,0],null,[W+1.4,.55,D+1.4],stn.clone().multiplyScalar(.9));
 // the mill house: plaster ground storey, timber string course, plaster upper storey, stepped timber cornice, corrugate gable
 vnBody('vPlaster',BX,Y0,0,W,H1,D,0,pl,{t:.3});vnBand('vWood',BX,Y0+H1,0,W+.34,.3,D+.34,0,wood,.47);vnBody('vPlaster',BX,Y2,0,W,H2,D,0,pl.clone().multiplyScalar(1.04),{t:.3});
 for(const sx of[-1,1])for(const sz of[-1,1])vPst('vPost',BX+sx*(W/2-.02),Y0,sz*(D/2-.02),.17,H1+H2+.32,wood);
 const top=vnCornice('vWood',BX,Y2+H2,0,W,D,0,wood,1);
 vnGableRoof(BX,top,0,W,D,2.6,0,'vGableC',null,.95,'vGablePl',pl,.16);
 for(const t of[-1,1])vB('vWood',BX,top-.8,t*(D/2+1.05),W+2.0,.22,.08,0,trim);
 // front: the door up its steps, windows, the taking-in door above under the hoist beam, a sack on the rope
 vnDoor(BX-2.2,Y0,D/2,0,1.15,2.3,'vWood',wood,trim);vnStairs(BX-2.2,0,D/2+.7,0,1.5,Y0,4,'vStone',stl);
 vnWin(BX+.6,Y0+1.1,D/2,0,1.1,1.2,'open','vWood',trim,true);vnWin(BX+3.2,Y0+1.1,D/2,0,1.0,1.2,'shut','vWood',trim);
 vnWin(BX+1.2,Y2+.35,D/2,0,1.2,1.7,'open','vWood',trim);vnWin(BX-2.4,Y2+.8,D/2,0,1.0,1.0,'open','vWood',trim,true);
 {const hy=Y2+H2-.1,hz=D/2;vB('vWood',BX+1.2,hy-.25,hz+.75,.26,.26,1.7,0,dark);vB('vWood',BX+1.2,hy-.7,hz+.2,.2,.6,.2,0,dark);
  vwkWheel(BX+1.2,hy-.4,hz+1.35,.22,dark,4,1);vwkCyl('vRope',[BX+1.2,1.75,hz+1.5],[BX+1.2,hy-.45,hz+1.5],.025,rope);
  kput('vSack',[BX+1.2,1.45,hz+1.5],null,[.32,.45,.3],vC(0xc8b898));}
 for(const x of[BX-3.6,BX+3.6])vnStrip(x,Y2+.4,D/2,0,.6,1.9,'vWood',wood);
 // sides and back
 vnWin(BX-W/2,Y0+1.2,1.6,-Math.PI/2,1.0,1.1,'open','vWood',trim,true);vnWin(BX-W/2,Y2+.8,-1.4,-Math.PI/2,1.0,1.0,'open','vWood',trim,true);
 vnWin(BX+W/2,Y2+.8,-2.4,Math.PI/2,.9,1.0,'shut','vWood',trim);
 vnWin(BX-2,Y0+1.2,-D/2,Math.PI,1.0,1.0,'shut','vWood',trim);vnWin(BX+1.8,Y0+1.2,-D/2,Math.PI,1.0,1.0,'open','vWood',trim,true);vnWin(BX,Y2+.8,-D/2,Math.PI,1.0,1.0,'open','vWood',trim);
 vnChimney(BX-3,top+1.2,-2.1,1.9,.15,false);
 // the wheel pit: a stone channel along the +x wall, its water, the outer wall and the bearing pier; the race goes under at the front
 const C0=-3.6,C1=8.2;vB('vStone',3.35,0,(C0+C1)/2+.1,2.0,.18,C1-C0,0,stn.clone().multiplyScalar(.8));
 vB('vWinGlass',3.35,.18,(C0+C1)/2,1.9,.22,C1-C0-.1,0,water);
 vB('vStone',4.55,0,(C0+C1)/2,.45,.95,C1-C0+.4,0,stn);vB('vStone',3.35,0,C0-.2,2.9,.95,.4,0,stn);
 vB('vStone',3.35,0,C1+.2,2.9,1.15,.45,0,stn);vB('vDarkB',3.35,.2,C1-.02,1.6,.6,.1,0);           // the culvert where the tail race goes under
 vB('vStone',WX+1.45,0,0,.6,WY-.15,1.0,0,stl);vB('vWood',WX+1.45,WY-.2,0,.7,.25,.6,0,dark);
 // the overshot wheel: two rims, spokes, buckets between, the axle into the wall
 for(const s of[-1,1])vwkWheel(WX+s*.5,WY,0,WR,dark,8,2);
 vwkCyl('vStave',[2.0,WY,0],[WX+1.5,WY,0],.2,dark);for(const s of[-1,1])vBq('vHoop',WX+s*.5,WY,0,.32,.32,2,qEuler(0,Math.PI/2,0),iron);
 for(let k=0;k<20;k++){const a=k/20*TAU,ph=Math.PI/2-a;vBq('vWood',WX,WY+Math.sin(a)*(WR-.22),Math.cos(a)*(WR-.22),1.0,.42,.05,qEuler(ph+.35,0,0),wood);
  vBq('vWood',WX,WY+Math.sin(a)*(WR-.04),Math.cos(a)*(WR-.04),1.0,.05,.44,qEuler(ph,0,0),wood.clone().multiplyScalar(.85));}
 // the flume: a board trough on trestles from the stone header at the back of the plot, a sluice board over its head
 const FY=WY+WR+.15,Z0=-9.4,Z1=.35;vB('vWood',WX,FY,(Z0+Z1)/2,1.1,.1,Z1-Z0,0,dark);for(const s of[-1,1])vB('vWood',WX+s*.52,FY,(Z0+Z1)/2,.07,.48,Z1-Z0,0,dark);
 vB('vWinGlass',WX,FY+.1,(Z0+Z1)/2-.2,.95,.2,Z1-Z0-.4,0,water);
 for(let k=0;k<7;k++)vB('vWood',WX,FY+.1,Z0+.4+k*1.5,1.18,.06,.1,0,iron);                        // straps over the trough
 for(const z of[-4.1,-6.8]){for(const s of[-1,1])vPst('vPost',WX+s*.7,0,z,.13,FY,dark);vB('vWood',WX,FY-.24,z,1.7,.22,.24,0,dark);
  vBeam([WX-.7,.2,z],[WX+.7,FY-.4,z],.08,dark);}
 vB('vStone',WX,0,-9.25,2.2,FY+.5,1.3,0,stn);kput('vRock',[WX,FY+.6,-9.4],null,[1.3,.4,.8],stn.clone().multiplyScalar(.85));
 for(const s of[-1,1])vB('vWood',WX+s*.62,FY+.4,-8.4,.12,1.2,.12,0,dark);vB('vWood',WX,FY+1.5,-8.4,1.4,.12,.14,0,dark);vB('vWood',WX,FY+.85,-8.4,1.1,.6,.05,0,wood);
 vBeam([WX+.6,FY+1.5,-8.4],[WX+.9,FY+.9,-7.2],.05,dark);
 // the grain store on -x: a lean-to on posts over slatted bins, a stave bin, sacks on a pallet
 {const x0=BX-W/2-.4,dx=3.0;for(const z of[-3.6,0,3.6])vPst('vPost',x0-dx,0,z,.1,2.6,dark);
  kput('vThatchB',[x0-dx/2,3.0,0],vQ(Math.PI/2,Math.atan2(.9,dx),0),[8.4,.28,dx+.9],th);vB('vWood',x0-dx,2.5,0,.16,.16,7.6,0,dark);
  for(const z of[-2.4,-.9])vB('vWood',x0-1.3,0,z,1.3,1.6,1.3,0,wood.clone().multiplyScalar(rr(.85,1)));
  for(const z of[-2.4,-.9])for(let k=1;k<4;k++)vB('vWood',x0-1.3,k*.4,z+.66,1.34,.05,.04,0,dark);
  vPst('vStave',x0-1.5,0,1.2,.75,2.0,wood);for(const y of[.4,1.6])vBq('vHoop',x0-1.5,y,1.2,.76,.76,1,qEuler(Math.PI/2,0,0),iron);kput('vConeT',[x0-1.5,2.0,1.2],null,[.85,.5,.85],th);
  vB('vWood',x0-1.3,0,2.9,1.4,.14,1.0,0,dark);vnSacks(x0-1.3,.14,2.9,5);}
 // the yard: a cart of sacks under the hoist, worn millstones against the plinth, a water butt, a log pile behind
 {const cx=BX+1.2,cz=D/2+3.2;vB('vWood',cx,.55,cz,1.5,.12,2.4,0,wood);for(const s of[-1,1]){vB('vWood',cx+s*.7,.67,cz,.06,.35,2.4,0,wood);vwkWheel(cx+s*.9,.55,cz,.55,dark,8,1.2);}
  vBeam([cx-.4,.6,cz+1.2],[cx-.4,.35,cz+3.0],.07,dark);vBeam([cx+.4,.6,cz+1.2],[cx+.4,.35,cz+3.0],.07,dark);vnSacks(cx,.67,cz,5);}
 for(const [x,a] of[[BX+3.6,.12],[BX+4.6,-.1]])vwkCyl('vPostS',[x,.72,D/2+.5],[x+Math.sin(a)*.1,.72+.05,D/2+.78],.7,stl.clone().multiplyScalar(.9));
 vnWaterButt(BX-W/2+.2,0,D/2+1.1,.42,1.1);vnBarrel(BX-1,0,-D/2-1,.4,1.0,wood);vwkLogs(BX-1.5,-D/2-2.2,0,3.2,4,3,.16,dark);
 vnPaving(BX-1,.03,D/2+2.8,9,3,0,stn,10);vnFolk(BX-1,D/2+4.6,3,1.6);}

// ---------------------------------------------------------------- fungus house: a long windowless shed banked with earth under heavy thatch, vents on the ridge, inoculated logs and racks
function buildVernFungusShed(G,o){reseed(8431+(o.v|0));const wood=vC(vPick(VPAL.woodPoor)).multiplyScalar(.82),th=vC(vPick(VPAL.thatch)).multiplyScalar(.85),earth=vC(vPick([0x5e4632,0x6a5038,0x544030]));
 const bark=vC(vPick([0x6a5a48,0x5a4c3e,0x7a6650])),rust=vC(0x7a4a32),water=vC(0xa0b8a8);
 const W=13,D=6,FY=.1,H=2.3,Z=-1.5,BH=1.25,BR=1.7;
 vnReg('Fungus house (poor)',0,0,11,5.6);
 // the long dark shed, its walls banked with earth to the eaves on every side but the entrance cutting on -x
 vnBody('vWood',0,FY,Z,W,H,D,0,wood,{t:.2});
 for(const s of[-1,1])for(const t of[-1,1])vPst('vPostB',s*(W/2+.05),0,Z+t*(D/2+.05),.14,FY+H,wood.clone().multiplyScalar(.85));
 vwkBerm(0,Z+D/2,W+.3,0,BH,BR,earth);vwkBerm(0,Z-D/2,W+.3,Math.PI,BH,BR,earth);vwkBerm(W/2,Z,D+.3,Math.PI/2,BH,BR,earth);
 for(const t of[-1,1])vwkBerm(-W/2,Z+t*1.95,2.1,-Math.PI/2,BH,BR,earth);
 for(const s of[-1,1])for(const t of[-1,1])kput('vRock',[s*(W/2+.6),BH*.4,Z+t*(D/2+.6)],qEuler(0,rr(0,3),0),[1.4,BH*.85,1.4],earth.clone().multiplyScalar(rr(.85,1.05)));
 // the cutting down to the door: board revetments either side, a plank floor, a step
 for(const t of[-1,1]){vB('vWood',-W/2-1.0,0,Z+t*.95,2.0,BH,.1,0,wood);vPst('vPost',-W/2-1.95,0,Z+t*.95,.07,BH+.15,wood);}
 vB('vWood',-W/2-1,0,Z,2.0,.08,1.8,0,wood.clone().multiplyScalar(.8));
 vnDoor(-W/2,FY,Z,-Math.PI/2,1.0,1.9,'vWood',wood,vC(0x4a3a2c),false);
 // the heavy thatch: low eaves down on the bank, a thick ridge, vent cowls of rusted pipe
 vnGableRoof(0,FY+H,Z,W,D,2.4,0,'vGableT',th,1.25,'vGableW',wood,.5);
 const RY=FY+H+2.4;for(const x of[-4,0,4]){vPst('vPipeR',x,RY-.6,Z,.24,1.35,rust);kput('vConeI',[x,RY+.72,Z],null,[.44,.36,.44],rust.clone().multiplyScalar(.8));
  for(const s of[-1,1])vB('vIron',x+s*.32,RY+.55,Z,.05,.24,.05,0,vC(0x2e2a26));vB('vDarkB',x,RY+.52,Z,.36,.12,.36,0);}
 // inoculated logs: crib stacks either side of the front, an A-frame of leaning logs, all fruiting
 for(const cx of[-7.6,-4.4]){for(let k=0;k<6;k++){const alongX=k%2===0;for(let i=0;i<4;i++){const u=(i-1.5)*.3,y=.12+k*.22;
    const a=alongX?[cx-.75,y,4.6+u]:[cx+u,y,4.6-.75],b=alongX?[cx+.75,y,4.6+u]:[cx+u,y,4.6+.75];vwkCyl('vPost',a,b,.11,bark.clone().multiplyScalar(rr(.8,1.15)));}}
  for(let k=0;k<5;k++)vwkFungi(cx+rr(-.8,.8),rr(.3,1.2),4.6+(rng()<.5?-.82:.82),3,.1);}
 {const ax=2.6,az=5.0,L=4.4;for(const s of[-1,1]){vBeam([ax+s*L/2,0,az-.45],[ax+s*L/2,1.15,az],.07,wood);vBeam([ax+s*L/2,0,az+.45],[ax+s*L/2,1.15,az],.07,wood);}
  vwkCyl('vPost',[ax-L/2-.1,1.12,az],[ax+L/2+.1,1.12,az],.06,wood);
  for(let i=0;i<9;i++)for(const t of[-1,1]){const x=ax-L/2+.3+i*(L-.6)/8+rr(-.06,.06);vwkCyl('vPost',[x,0,az+t*.95],[x,1.25,az+t*.12],.08,bark.clone().multiplyScalar(rr(.8,1.15)));vwkFungi(x,.6,az+t*.6,2,.06);}}
 // the rack shade: racks of trays and logs under a palm-thatch shade on four posts
 {const rx=8.4,rz=4.6;for(const s of[-1,1])for(const t of[-1,1])vPst('vPost',rx+s*1.4,0,rz+t*1.1,.08,2.4,wood);
  vnGableRoof(rx,2.4,rz,2.8,2.2,.9,0,'vThatchB',th,.5,null,null,.2);
  for(const t of[-1,1]){for(const y of[.4,.95,1.5])vB('vWood',rx,y,rz+t*.55,2.4,.05,.6,0,wood);for(const s of[-1,1])vPst('vPost',rx+s*1.15,0,rz+t*.55,.04,1.6,wood);
   for(const y of[.45,1.0,1.55])for(let k=0;k<4;k++){vwkCyl('vPost',[rx-.9+k*.6,y+.08,rz+t*.55-.25],[rx-.9+k*.6,y+.08,rz+t*.55+.25],.07,bark);vwkFungi(rx-.9+k*.6,y+.16,rz+t*.55,2,.08);}}}
 // the water butt fed off the eaves, the soak trough for fresh logs, baskets of the harvest, logs waiting behind
 vnWaterButt(-W/2-2.4,0,Z+2.1,.45,1.15);vnWaterButt(W/2+1.9,0,Z-2.6,.42,1.05);
 {const tx=-1.4,tz=5.0;vB('vWood',tx,0,tz,2.6,.6,.8,0,wood);vB('vWinGlass',tx,.5,tz,2.4,.08,.6,0,water);for(let k=0;k<3;k++)vwkCyl('vPost',[tx-1.1,.55,tz-.2+k*.2],[tx+1.1,.55,tz-.2+k*.2],.07,bark);}
 for(const [x,z] of[[-9.8,1.6],[-9.6,2.5],[6.2,4.0]]){vPst('vClayPot',x,0,z,.28,.42,vC(vPick([0x9a7a50,0xa8885a])));vwkFungi(x,.48,z,6,.14);}
 vwkLogs(0,Z-D/2-2.6,0,6,4,2,.13,bark);vwkLogs(-7.5,Z-D/2-2.5,0,3,3,2,.12,bark);
 vnFolk(-8.5,6,2,1.2);}

VERN.def({key:'vern_mine',name:'Mine head',family:'industry',tags:{type:['industry'],wealth:'poor',lit:false,role:'mine',job:'mining'},w:26,d:22,h:11,build:buildVernMine});
VERN.def({key:'vern_quarry',name:'Quarry and mason\'s lodge',family:'industry',tags:{type:['industry'],wealth:'middle',lit:false,role:'quarry',job:'masonry'},w:28,d:24,h:10,build:buildVernQuarry});
VERN.def({key:'vern_mill',name:'Watermill',family:'industry',tags:{type:['industry','single-family dwelling'],wealth:'middle',lit:false,role:'mill',job:'milling'},w:22,d:20,h:12,build:buildVernMill});
VERN.def({key:'vern_fungus_shed',name:'Fungus house',family:'farm',tags:{type:['farm'],wealth:'poor',lit:false,role:'fungus house',job:'fungiculture'},w:22,d:14,h:6,build:buildVernFungusShed});
