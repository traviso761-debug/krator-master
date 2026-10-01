// ================================================================= REPUBLICAN — the shipbreakers' yards (round 10c)
// Travis: "add a couple of crashed space ships in the process of deconstruction just northeast of the spaceport outside
// the city walls". A ship that came down short of the port, lying where it ploughed in, and the Salvagers taking it
// apart: the fore hull still plated and scaffolded, the midships stripped to its ribs and stringers with the decks
// showing through, a gantry straddling the cut lifting plates away, a ring section already cut free and lying on
// cribbing, the engines unbolted and laid out on timber sledges, plates sorted in stacks, and a camp of sheds, a forge
// fire and a winch. Variant 0 is a long freighter lying nearly level; variant 1 a squat lander nose-down in its crater.
// Hull kit (hShipC, hShipNose, hShipBell, hShipDisc, hShipCap, hShipB) comes from 79e; the hull axis is local x.
function hlShipBreak(G,o,V){   // the shared body; the two builders below seed it
 const hull=hC(vPick([0xb4b0a6,0xa8a49a,0xbcb6a8])),iron=hC(0x3a3430),rust=hC(vPick(HSV.rust)),log=hC(vPick(HPAL.aged)),plank=hC(vPick(HFRAME.plank)),
  corr=hC(vPick(HSV.corr)),sand=hC(0x8a7658),bell=hC(0x4a4440),lit=vLit()?'lit':'glass';
 // hull geometry: radius R; nose (length NL) toward -x; plated fore section [X0,XC]; stripped midships [XC,XS]; the
 // aft end cut clean at XS (the engines already off); pitch p sinks the nose
 const R=V?5.6:7,NL=V?7:11,X0=V?-16:-30,XC=V?-2:-6,XS=V?10:16,yc=V?R*.55:R*.74,p=V?.16:.035;
 const A=(u,dy,dz)=>[u*Math.cos(p)-(dy||0)*Math.sin(p),yc+u*Math.sin(p)+(dy||0)*Math.cos(p),dz||0];
 const QH=qEuler(0,0,p+Math.PI/2),QR=qEuler(0,0,p).multiply(qEuler(0,Math.PI/2,0));   // hull axis along x; a ring round it
 const name=V?'Shipbreakers — the lander':'Shipbreakers — the freighter';
 vnReg(name,(X0+XS)/2,0,(XS-X0)/2+NL/2,R*2+2);vnReg('Shipbreakers\' camp',V?16:28,-15,8,5);
 // the furrow and the berm it threw up ahead of the nose
 for(let k=0;k<5;k++){const x=X0-NL*.6-k*(V?3:4.5),z=rr(-2,2);hnRCHeap(x,0,z,R*(1.1-k*.15),R*(.7-k*.1),sand,0);}
 for(const s of[-1,1])for(let k=0;k<4;k++)hnRCHeap(X0+k*(V?5:8),0,s*(R+1.4),2.6,1.1,sand,0);
 // the plated fore hull and its nose
 {const L=XC-X0,c=A((X0+XC)/2);kput('hShipC',c,QH,[R,L,R],hull);kput('hShipNose',A(X0),QH,[R,NL,R],hull);
  for(let k=0;k<=Math.round(L/4);k++)kput('vHoop',A(X0+k*L/Math.round(L/4)),QR,[R+.05,R+.05,1.6],hC(0x6a6258));
  for(let k=0;k<Math.floor(L/3);k++){const u=X0+2+k*3,th=1.25;kput('vDarkB',A(u,R*Math.cos(th),R*Math.sin(th)+.05),qEuler(0,0,p).multiply(qEuler(-(Math.PI/2-th),0,0)),[1.4,.5,.12],null);}
  // plates already lifted off the top of the fore hull: dark gaps
  for(let k=0;k<(V?2:4);k++){const u=XC-3-k*3.4;kput('vDarkB',A(u,R+.02,rr(-1.5,1.5)),qEuler(0,0,p),[2.6,.08,rr(2,3.4)],null);}
  // the cut face at XC is hidden by the ribs; a dark disc inside the stripped section reads as the fore bulkhead's openings
  kput('hShipCap',A(XC+.3),qEuler(0,0,p).multiply(qEuler(0,Math.PI/2,0)),[R-.2,R-.2,1],null);}
 // midships stripped to the frame: rib rings, keel and stringers, the decks showing, a few plates still on
 {const L=XS-XC,n=Math.round(L/2.2);for(let k=0;k<=n;k++)kput('vHoop',A(XC+k*L/n),QR,[R,R,2.4],rust);
  for(let k=0;k<10;k++){const th=k/10*TAU;if(th>Math.PI*.8&&th<Math.PI*1.2)continue;const dy=R*Math.cos(th),dz=R*Math.sin(th);beam('vIron',A(XC,dy,dz),A(XS,dy,dz),.22,.22,rust);}
  for(const dy of[-R*.45,R*.15]){const w=2*Math.sqrt(R*R-dy*dy)-.4;kput('hShipB',A((XC+XS)/2,dy,0),qEuler(0,0,p),[L-.4,.3,w],hull.clone().multiplyScalar(.8));
   for(let k=0;k<3;k++)kput('vDarkB',A(XC+1+k*L/3,dy+1.2,rr(-w/3,w/3)),qEuler(0,0,p),[1.6,2,1.6],null);}
  for(let k=0;k<(V?2:4);k++){const u=XC+1.5+k*L/4,th=rr(-1,1);kput('hHullSeg',A(u,0,0),qEuler(0,0,p+Math.PI/2).multiply(qEuler(0,th,0)),[R+.08,1.9,R+.08],hull);}
  kput('hShipCap',A(XS-.2),qEuler(0,0,p).multiply(qEuler(0,-Math.PI/2,0)),[R-.3,R-.3,1],null);}
 // the gantry straddling the cut, lifting a plate away
 {const gx=(XC+XS)/2+1,H=R*2+5,W=R+5;for(const s of[-1,1]){beam('vPipeR',[gx-2.4,0,s*W],[gx,H,s*W],.34,.34);beam('vPipeR',[gx+2.4,0,s*W],[gx,H,s*W],.34,.34);vB('vIron',gx,H*.4,s*W,4.6,.24,.24,0,iron);}
  vB('hPaint',gx,H,0,1,.8,2*W+1.2,0,hC(vPick(HFRAME.post)));vB('hPaint',gx,H+.8,0,1.2,.12,2*W+1.6,0,hC(HPAL.teal));
  const tz=-W*.55;vB('vIron',gx,H-.4,tz,1.4,.4,1.2,0,iron);hnCable([gx-.4,H-.4,tz],[gx-.4,3.8,tz],iron);hnCable([gx+.4,H-.4,tz],[gx+.4,3.8,tz],iron);
  kput('hHullSeg',[gx,2.6,tz],qEuler(0,0,Math.PI/2).multiply(qEuler(0,.4,0)),[R*.6,3,R*.6],hull);}
 // scaffolding up the plated flank: pipe standards, plank lifts, ladders
 {const zs=R+1.4,n=Math.max(2,Math.round((XC-X0)/5));for(let i=0;i<=n;i++){const x=X0+2+i*(XC-X0-3)/n;for(const dz of[0,1.6])vPst('vPipeR',x,0,zs+dz,.06,R*2+1,null);}
  for(let l=1;l<=Math.floor(R*2/3);l++){const y=l*3;vB('vWood',(X0+XC)/2+.5,y,zs+.8,XC-X0-2,.1,1.7,0,plank);beam('vPipeR',[X0+2,y+1,zs+1.6],[XC-1,y+1,zs+1.6],.05,.05);}
  for(let l=0;l<Math.floor(R*2/3);l++){const x=X0+3+(l%2)*4;beam('vWood',[x,l*3,zs+1.9],[x+1.2,l*3+3,zs+1.9],.08,.5,log);}}
 // sheerlegs over the nose
 {const nx=X0-NL*.4,H=R*1.8+4;for(const s of[-1,1])beam('vPipeR',[nx-2,0,s*(R+2)],[nx,H,0],.26,.26);beam('vPipeR',[nx+R+2,0,0],[nx,H,0],.2,.2);hnCable([nx,H,0],[nx+1,R*1.4,0],iron);}
 // what is already off her: a ring section on cribbing, the engines on sledges, the thrust plate on edge, sorted stacks
 {const sx=V?-4:-10,sz=-(R*2+5),L=V?5:7;for(const dx of[-L/2+.8,L/2-.8])for(const dz of[-R*.6,R*.6])vB('hPlankB',sx+dx,0,sz+dz,1,1.1,1.2,0,log);
  kput('hShipC',[sx,R+1.1,sz],qEuler(0,0,Math.PI/2),[R,L,R],hull);for(const e of[-1,1])kput('hShipCap',[sx+e*(L/2-.1),R+1.1,sz],qEuler(0,e*Math.PI/2,0),[R-.1,R-.1,1],null);
  for(let k=0;k<5;k++)kput('vHoop',[sx-L/2+k*L/4,R+1.1,sz],qEuler(0,Math.PI/2,0),[R+.05,R+.05,1.6],hC(0x6a6258));}
 {const ex=XS+(V?6:9),n=V?2:4;for(let k=0;k<n;k++){const z=(k-(n-1)/2)*(V?5:5.6),s=V?2.1:k%3===0?3:2.3;
   for(const dx of[-s,s])vB('hPlankB',ex+dx*.6,0,z,.5,.5,s*2.2,0,log);kput('hShipBell',[ex,s+.5,z],qEuler(0,0,Math.PI/2),[s,s*2.2,s],bell.clone().multiplyScalar(rr(.8,1.1)));}
  kput('hShipDisc',[ex+(V?6:8),0,V?-7:-12],qEuler(Math.PI/2-.12,.3,0),[R-.4,1,R-.4],hull.clone().multiplyScalar(.7));}
 for(let k=0;k<(V?3:5);k++){for(let i=0;i<hri(4,8);i++)hlRngSkip(4);FURNISH('hl_rep_plate_stack',X0+4+k*5.4,0,R*2+5,0,{v:2});}   // stacks of hull plates
 for(let k=0;k<(V?2:3);k++){const x=X0+2+k*6,z=R*2+11;for(let i=0;i<4;i++)kput('hHullSeg',[x,1.2+i*.5,z],qEuler(0,0,Math.PI/2),[2.2,4,2.2],hull.clone().multiplyScalar(rr(.75,.95)));}
 // the camp: sheds of their own salvage, a forge fire under a lean-to, a winch hauling on the hull, carts, lamps, folk
 {const cx=V?16:28,cz=-15;for(const [dx,w,d] of[[0,6,4],[7.5,4.4,3.6]]){vB('vCorr',cx+dx,0,cz,w,2.6,d,0,corr);vnShedRoof(cx+dx,2.6,cz,w+.4,d+.4,.5,0,'vCorr',rust,.3,.08);vnDoor(cx+dx,0,cz+d/2+.02,0,1,2.1,'vWood',log,log,false);vnWin(cx+dx+w/4,1,cz+d/2+.02,0,.8,.6,lit,'vWood',log);}
  const fx=cx-6;rng();FURNISH('hl_rep_salvage_forge',fx,0,cz,0);   // the forge fire under its lean-to
  const wx=XC-4,wz=-(R+6);FURNISH('hl_rep_winch',wx,0,wz,0,{v:1});hnCable([wx,1.1,wz+.5],A(XC-4,0,-R+.2),iron);
  hnRCCart(cx-2,cz+7,.3,log,true);hnRCCart(XS+2,-(R+4),-.6,log,true);hnRBLamps([[cx-3,cz+4],[XC,R+5],[X0,-(R+4)]],3.6);vnFolk((X0+XS)/2,-(R+5),V?5:8,8);vnFolk(cx,cz+5,3,4);}}
function buildHlRepShipBreak(G,o){reseed(22401+(o.v|0));hlShipBreak(G,o,0);}
function buildHlRepShipBreakL(G,o){reseed(22411+(o.v|0));hlShipBreak(G,o,1);}
const HTAG_SHIPBRK={type:['industry','salvage','ruin'],wealth:'poor',lit:false,salvage:true};
HL.def({key:'hl_rep_shipbreak',name:'Shipbreakers\' yard — freighter',branch:'republican',family:'Industry',tags:HTAG_SHIPBRK,w:120,d:58,h:24,build:buildHlRepShipBreak});
HL.def({key:'hl_rep_shipbreak_lander',name:'Shipbreakers\' yard — lander',branch:'republican',family:'Industry',tags:HTAG_SHIPBRK,w:84,d:48,h:18,build:buildHlRepShipBreakL});
