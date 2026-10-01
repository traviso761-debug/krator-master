// ================================================================= HYKKOUSOI — HARBOUR (agent F): quays, piers, sheds, the guilds, the pens
// The shore pieces (DESIGN §2, §6): the shell quay, the pier, the wet landing, the boat shed, the boom chain, the
// navy's ship shed and the hexareme's berth, the Navigator's and Pearlmonger's guilds, the aquaculture pens. Every
// harbour builder finds the water in front of it: `sea` is the water's local y (world 0 unless o.sea says otherwise,
// so a piece placed at the quay datum +2.5 sees the water at -2.5), `E` the local z of the shoreline (o.edge, else the
// first metre along +z where the ground drops below the sea; the kit sheet's shore is ~35 m in front of its Harbour
// row). The land part is drawn from just behind the origin to E, the water part beyond it, so on the sheet the
// pieces reach the water and in the city the placer puts the origin on the quay line. Quay walls are shell solids whose
// feet follow the bed (crust at the tideline, weed and barnacle specks), every deck over water is a backbone on stalks
// rooted with flares, every rib ends inside what it meets through a flare and a knuckle, rails wherever people stand.
// Seeds 30700–30759 (brief §3): one builder every six.
// ---------------------------------------------------------------- shared bits
const hykHarbShell=()=>hC(hPick(HPAL.shell));const hykHarbBone=()=>hC(hPick(HPAL.bone));
function hykHarbSea(o){return o&&o.sea!=null?o.sea:-(HYK.cur?(HYK.cur.o.y||0):0);}
function hykHarbShore(sea,o){if(o&&o.edge!=null)return o.edge;for(let z=0;z<=48;z+=1)if(hykSpanGround(0,z)<sea-.3)return Math.max(0,z-1);return 0;}
// a shell wall from a to b ([x,z]), its outward face to the RIGHT of a->b, from the bed (the ground, bedded .6) up to
// `top`, battered, crusted at the tideline, a rounded coping along the top. o:{top,col,mat,batter,coping,nv}
function hykHarbWall(a,b,sea,o){o=o||{};const col=o.col||hykHarbShell();const crust=hC(hPick(HPAL.crust)),barn=hC(hPick(HPAL.barnacle));const top=o.top||0;const L=Math.hypot(b[0]-a[0],b[1]-a[1])||1;const nu=Math.max(3,Math.round(L/1.6)),nv=o.nv||8;
 const dx=(b[0]-a[0])/L,dz=(b[1]-a[1])/L;const nx=-dz,nz=dx;const bat=o.batter!=null?o.batter:.3;
 const bot=u=>Math.min(top-.8,hykSpanGround(a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u)-.6);
 hykPut(o.mat||'hkShell',hykSurf((u,v)=>{const yb=bot(u);const y=yb+(top-yb)*v;const off=bat*(1-v)*(1-v)+.05*Math.sin(u*L*1.7)*(1-v);return [a[0]+(b[0]-a[0])*u+nx*off,y,a[1]+(b[1]-a[1])*u+nz*off];},nu,nv,
  {col:(u,v,p)=>p[1]<sea+.4?crust:p[1]<sea+.95?barn:col,uS:L/4,vS:2,flip:true}));
 if(o.coping!==false)hykPut('hkShell',hykTube([[a[0]+nx*.1,top-.02,a[1]+nz*.1],[(a[0]+b[0])/2+nx*.1,top-.02,(a[1]+b[1])/2+nz*.1],[b[0]+nx*.1,top-.02,b[1]+nz*.1]],()=>.3,{seg:8,col}));
 return {a,b,nx,nz};}
// the quay's paving: a flat plate at y in scale mosaic
function hykHarbApron(x0,x1,z0,z1,y,o){o=o||{};hykPut(o.mat||'hkMosaic',hykSurf((u,v)=>[x0+(x1-x0)*u,y,z0+(z1-z0)*v],Math.max(2,Math.round((x1-x0)/4)),Math.max(2,Math.round((z1-z0)/4)),{col:o.col||hC(hPick(HPAL.shellWarm)),uS:(x1-x0)/4,vS:(z1-z0)/4}));}
// a quay solid: the apron over x0..x1, zb..ze (ze the water side, +z) with its four walls down to the bed
function hykHarbSolid(x0,x1,zb,ze,sea,o){o=o||{};const col=o.col||hykHarbShell();hykHarbApron(x0,x1,zb,ze,0,{col:o.apron});
 hykHarbWall([x0,ze],[x1,ze],sea,{col});hykHarbWall([x1,ze],[x1,zb],sea,{col});hykHarbWall([x0,zb],[x0,ze],sea,{col});hykHarbWall([x1,zb],[x0,zb],sea,{col,coping:false});
 return {x0,x1,zb,ze};}
// a bollard: a knuckle of bone, a short fluted column with a bulb head, rooted with a flare
function hykHarbBollard(x,y,z,col){hykPut('hkBone',hykLathe({H:.9,yBase:y-.05,cx:x,cz:z,rFn:yy=>.24+.08*Math.sin(yy*3.2),nu:12,nv:5,flute:{n:7,amp:.08,sharp:1.3},col}));
 kput('hkBall',[x,y+.95,z],null,[.36,.3,.36],col);hykPut('hkBone',hykFlare([x,y,z],[0,1,0],.3,.3,{col}));}
// a mooring ring on a wall face: a knob on the face, the ring hanging from it in the wall's plane
function hykHarbRing(x,y,z,nx,nz,col){kput('hkBall',[x,y,z],null,[.16,.16,.16],col);kput('hkLip',[x+nx*.06,y-.34,z+nz*.06],qFacing([nx,0,nz]),[.3,.3,.5],col);}
// the tideline on a wall line a->b (outward to the right): barnacle specks about the waterline, weed hanging from it
function hykHarbTide(a,b,sea,o){o=o||{};const L=Math.hypot(b[0]-a[0],b[1]-a[1])||1;const dx=(b[0]-a[0])/L,dz=(b[1]-a[1])/L;const nx=-dz,nz=dx;
 const n=Math.round(L*2.2);for(let i=0;i<n;i++){const t=rng(),y=sea+rr(-.9,.7);const s=rr(.07,.2);
  kput('hkBarnB',[a[0]+(b[0]-a[0])*t+nx*.06,y,a[1]+(b[1]-a[1])*t+nz*.06],null,[s,s*.7,s],hC(hPick(HPAL.barnacle)));}
 const m=Math.round(L/1.6);for(let i=0;i<m;i++){const t=(i+.5)/m+rr(-.1,.1);const h=rr(.8,2.0),w=rr(.4,.9);kput('hkWeedCard',[a[0]+(b[0]-a[0])*t+nx*.12,sea+.35-h/2,a[1]+(b[1]-a[1])*t+nz*.12],qFacing([nx,0,nz]),[w,h,1],hC(hPick(HPAL.weed)));}}
// stalks under a deck's centre line every `every` m, from y down into the bed (rooted with a flare, knuckled at the deck)
function hykHarbStalks(A,B,y,every,o){o=o||{};const col=o.col||hykHarbShell();const bone=hykHarbBone();const L=Math.hypot(B.x-A.x,B.z-A.z)||1;const tx=(B.x-A.x)/L,tz=(B.z-A.z)/L;
 for(let s=every*.5;s<L-every*.3;s+=every){const px=A.x+tx*s,pz=A.z+tz*s;const g=hykSpanGround(px,pz)-.8;if(y-g<.8)continue;const H=y-g;const rb=Math.min(.85,.32+H*.045);
  hykPut('hkShell',hykLathe({H,yBase:g,cx:px,cz:pz,rFn:yy=>rb+(.28-rb)*Math.pow(yy/H,.8),nu:14,nv:Math.max(3,Math.round(H/1.3)),flute:{n:7,amp:.07,sharp:1.3},rings:{n:Math.max(2,Math.round(H/2.5)),amp:.03},col}));
  hykPut('hkShell',hykFlare([px,g,pz],[0,1,0],rb*.98,rb*.8,{col}));kput('hkBall',[px,y,pz],null,[.42,.38,.42],bone);}}
// a flight down a quay wall's face to a wet landing: the flight runs along the wall in front of it (xTop at the top,
// descending toward dir), its top tread level with the coping, brackets into the wall every 1.6 m. A = the bottom.
function hykHarbStairWall(xTop,E,yTop,yBot,dir,sea,o){o=o||{};const col=o.col||hykHarbBone();const rise=yTop-yBot;const L=Math.max(2.4,Math.round(rise/.19)*.3);const zc=E+.72;
 const A={x:xTop+dir*L,y:yBot,z:zc},B={x:xTop,y:yTop,z:zc};hykSpanStairStraight(A,B,{w:1.25,rails:dir>0?'left':'right',col});
 for(let s=.8;s<L;s+=1.6){const t=s/L;const x=xTop+dir*s,y=yTop-rise*t-.3;hykPut('hkBone',hykTube([[x,y,zc+.3],[x,y-.25,E+.3],[x,y-.4,E-.3]],()=>.1,{seg:6,col}));hykPut('hkBone',hykFlare([x,y-.32,E+.02],[0,0,1],.12,.28,{col}));}
 return A;}
// a parabolic shell vault along z from zb (the back, capped by an apse) to ze (the mouth, open), half-width hw, the
// crown H above the floor datum, the feet following the bed; an inner skin for the interior, a lip at the mouth, bone
// ribs over the shell every `ribs` m rooted with flares, and lipped openings. o:{col,mat,ribs,ops:[{s,z,r,ky,kind}]}
function hykHarbVault(zb,ze,hw,H,sea,o){o=o||{};const col=o.col||hykHarbShell();const mat=o.mat||'hkShell';const crust=hC(hPick(HPAL.crust));const L=ze-zb;const nu=Math.max(8,Math.round(L/1.1)),nv=28;
 const foot=z=>Math.min(-.5,hykSpanGround(hw,z)-.5,hykSpanGround(-hw,z)-.5);
 const arch=(s,z,k)=>{const yf=foot(z);k=k||1;const ring=1+.02*Math.sin(z*TAU/1.35)+.012*Math.sin(z*TAU/4.1);const fl=1+.025*Math.pow(.5+.5*Math.cos(s*Math.PI*8),2);return [hw*k*s*ring*fl,yf+(H*k-yf)*(1-s*s)*ring*fl,z];};
 const normal=(s,z)=>{const yf=foot(z);const n=new THREE.Vector3(2*(H-yf)*s,hw,0).normalize();return [n.x,n.y,0];};
 const ops=(o.ops||[]).map(op=>{const p=arch(op.s,op.z);return Object.assign({},op,{p,n:normal(op.s,op.z),ky:op.ky||1});});
 const colf=(u,v,p)=>p[1]<sea+.4?crust:col;
 hykPut(mat,hykSurf((u,v)=>arch(2*v-1,zb+L*u),nu,nv,{col:colf,uS:L/4,vS:hw*2.4/4,flip:true,hole:hykHoleOf(ops)}));
 hykPut('hkIn',hykSurf((u,v)=>arch(2*v-1,zb+L*u,.94),nu,nv,{col:hC(hPick(HPAL.shell),.9),uS:L/4,vS:hw*2.4/4,hole:hykHoleOf(ops)}),true);
 const yf0=foot(zb);const B=Math.min(4.5,hw*.6);const cap=k=>hykSurf((u,v)=>{const s=2*u-1;const a=arch(s,zb,k);return [a[0]*v,yf0+(a[1]-yf0)*v,zb-B*k*(1-v*v)];},24,10,{col:k<1?hC(hPick(HPAL.shell),.9):col,flip:k<1});
 hykPut(mat,cap(1));hykPut('hkIn',cap(.94),true);
 const lip=[];for(let i=0;i<=20;i++)lip.push(arch(i/10-1,ze));hykPut(mat,hykTube(lip,(t)=>.34*(1+.12*Math.sin(t*Math.PI)),{seg:8,col}));
 if(o.ribs){const bone=hykHarbBone();for(let z=zb+o.ribs*.6;z<ze-.6;z+=o.ribs){const pts=[];for(let i=0;i<=16;i++)pts.push(arch(i/8-1,z,1.005));const yf=foot(z);
  hykPut('hkBone',hykTube(pts,(t)=>(o.ribR||.3)*(1+.22*Math.max(0,Math.cos(t*7*TAU)))*(1.25-.5*Math.sin(t*Math.PI)),{seg:8,col:bone}));
  for(const s of [-1,1]){const g=hykSpanGround(hw*s,z);hykPut('hkBone',hykFlare([hw*s*1.005,g-.02,z],[0,1,0],(o.ribR||.3)*1.3,(o.ribR||.3)*2,{col:bone}));}}}
 return {arch,normal,foot,ops};}
// ================================================================= the defs
// ---- the quay: 40 m of shell quay wall at the datum, the apron paved in scale mosaic from behind the origin to the edge,
// bollards along the edge, mooring rings on the face, the tideline, and at the east end a flight down the face to a wet
// landing on a stalk, with a jar lamp. Two berths along the face.
function hykHarbDefQuay(G,o){reseed(30700+(o.v|0));const sea=hykHarbSea(o);const E=hykHarbShore(sea,o);const col=hykHarbShell(),bone=hykHarbBone();const W=40;const back=o.back!=null?o.back:-3;
 hykHarbSolid(-W/2,W/2,back,E,sea,{col});
 for(let x=-W/2+3.2;x<W/2-5;x+=6.4)hykHarbBollard(x,0,E-.9,bone);
 for(let x=-W/2+6;x<W/2-6;x+=8)hykHarbRing(x,sea+1.5,E+.34,0,1,bone);
 hykHarbTide([-W/2,E],[W/2,E],sea);
 const wet=sea+1.0,sx=W/2-3.2;const A=hykHarbStairWall(sx,E,.26,wet,-1,sea,{col:bone});
 const padR=2.8;const px=A.x-1.2,pz=E+.9+padR*.9;
 hykSpanPad(px,wet,pz,padR,{col,rail:{a0:Math.atan2(A.z-pz,A.x-px),gap:1.3},own:'quay wet landing',lamp:{a:Math.PI/2+.9,cool:true,level:'wet'}});
 hykSpanMark('door',sx+.6,0,E-1.2,0,1,1.3,2.3,'quay');hykSpanMark('wetdoor',px,wet,pz+padR*.9,0,1,2.4,2.4,'wet');
 for(const bx of [-W/2+8,-W/2+22]){const w=hykW(bx,0,E+3.2);const hd=hykN(1,0,0);BERTHS.push({host:null,x:w[0],z:w[2],heading:Math.atan2(hd[2],hd[0]),kind:'quay'});}
 hykReg('Shell quay',0,(back+E)/2+2,W/2+4,4);}
HYK.def({key:'hyk_quay',name:'Shell quay',family:'harbour',row:'Harbour',w:40,d:46,h:4,tags:{type:['infrastructure'],wealth:'civic',lit:true},build:hykHarbDefQuay});
// ---- the pier: a backbone deck 30 m out over the water on stalks, rails, a lily-pad head with a lamp on a post, two
// bollards and a tide ladder down the head's stalk; a quay stub at the root.
function hykHarbDefPier(G,o){reseed(30706+(o.v|0));const sea=hykHarbSea(o);const E=hykHarbShore(sea,o);const col=hykHarbShell(),bone=hykHarbBone();
 hykHarbSolid(-6,6,-3,E,sea,{col});hykHarbTide([-6,E],[6,E],sea);
 const A={x:0,y:.06,z:E-2.5},B={x:0,y:.06,z:E+30};const w=3.0;
 const br=hykBridge(A,B,{w,rise:0,col:bone,own:'pier'});hykSpanDeckTop(br.pts,w);hykHarbStalks(A,B,-.78,5,{col});
 const R=4.2,hz=B.z+R*.55;hykSpanPad(0,.06,hz,R,{col,rail:{a0:-Math.PI/2,gap:2*Math.asin((w/2+.5)/(R*.9))+.12},own:'pier head',ground:hykSpanGround(0,hz)-.8});
 hykSpanLampPost(R*.78,.06,hz+R*.25,{level:'quay',col:bone,h:2.6});
 hykHarbBollard(-R*.7,.06,hz+R*.1,bone);hykHarbBollard(R*.4,.06,hz+R*.72,bone);
 for(let y=sea+.3;y<-.5;y+=.32)kput('hkPost',[0,y,hz+R*.22],qEuler(0,0,Math.PI/2),[.035,.6,.035],bone);   // the tide ladder on the head's stalk
 for(let i=0;i<4;i++)hykHarbRing(R*.92*Math.cos(.4+i*.5),-.5,hz+R*.92*Math.sin(.4+i*.5),Math.cos(.4+i*.5),Math.sin(.4+i*.5),bone);
 hykSpanMark('door',0,.06,E-1.4,0,-1,w,2.3,'quay');hykSpanMark('wetdoor',0,.06,hz+R*.9,0,1,2.4,2.4,'wet');
 const bw=hykW(R+3.5,0,hz-1);const hd=hykN(0,0,1);BERTHS.push({host:null,x:bw[0],z:bw[2],heading:Math.atan2(hd[2],hd[0]),kind:'pier'});
 hykReg('Shell pier',0,E+14,22,5);}
HYK.def({key:'hyk_pier',name:'Shell pier',family:'harbour',row:'Harbour',w:9,d:76,h:5,tags:{type:['infrastructure'],wealth:'civic',lit:true},build:hykHarbDefPier});
// ---- the wet landing: a lily pad at +1 on a stalk against the quay face, a flight up the face to the quay datum, a jar
function hykHarbDefWet(G,o){reseed(30712+(o.v|0));const sea=hykHarbSea(o);const E=hykHarbShore(sea,o);const col=hykHarbShell(),bone=hykHarbBone();const wet=sea+1;
 hykHarbSolid(-6,6,-3,E,sea,{col});hykHarbTide([-6,E],[6,E],sea);hykHarbBollard(-3.5,0,E-.9,bone);hykHarbBollard(3.5,0,E-.9,bone);
 const A=hykHarbStairWall(-4.6,E,.26,wet,1,sea,{col:bone});
 const R=3.2;const px=A.x+1.6,pz=E+.9+R*.9;
 hykSpanPad(px,wet,pz,R,{col,rail:{a0:Math.atan2(A.z-pz,A.x-px)+.35,gap:1.5},own:'wet landing',lamp:{a:Math.PI/2+1.0,cool:true,level:'wet'}});
 hykHarbRing(px+R*.9,wet+.3,pz-.2,1,0,bone);
 hykSpanMark('door',-4.2,0,E-1.2,0,1,1.3,2.3,'quay');hykSpanMark('wetdoor',px,wet,pz+R*.9,0,1,2.4,2.4,'wet');
 const bw=hykW(px,0,pz+R+2.2);const hd=hykN(1,0,0);BERTHS.push({host:null,x:bw[0],z:bw[2],heading:Math.atan2(hd[2],hd[0]),kind:'skiff'});
 hykReg('Wet landing',0,E,10,4);}
HYK.def({key:'hyk_wet_landing',name:'Wet landing',family:'harbour',row:'Harbour',w:12,d:48,h:4,tags:{type:['infrastructure'],wealth:'civic',lit:true},build:hykHarbDefWet});
// ---- the boat shed: a shell vault astride the shore, open to the water, a slip inside between two side walks with
// rails, a crew door and portholes in the flank, a skiff hauled up the slip
function hykHarbDefBoatShed(G,o){reseed(30718+(o.v|0));const sea=hykHarbSea(o);const E=hykHarbShore(sea,o);const col=hykHarbShell(),bone=hykHarbBone();
 const hw=5.2,H=6.2,zb=E-16,ze=E+7;
 const V=hykHarbVault(zb,ze,hw,H,sea,{col,ribs:4.2,ribR:.26,ops:[{s:-.9,z:zb+5,r:1.1,ky:1.25,kind:'door'},{s:.72,z:zb+4,r:.5,kind:'window'},{s:.72,z:zb+9,r:.5,kind:'window'},{s:-.72,z:zb+11,r:.45,kind:'window'}]});
 for(const op of V.ops){if(op.kind==='door')hykDoor(op,{level:'quay',depth:.5});else hykWin(op,{});}
 const sw=3.6;const slip=[[0,.0,zb+1.6],[0,-.2,E-4],[0,sea-.5,ze-.6]];hykPut('hkFloor',hykDeck(slip,sw,{col:hC(hPick(HPAL.floor)),camber:.06,flip:false}),true);
 for(const s of [-1,1]){const wx=s*(sw/2+1.2);hykPut('hkFloor',hykDeck([[wx,-.02,zb+1.4],[wx,-.02,E-2],[wx,-.02,ze-.8]],2.3,{col:hC(hPick(HPAL.floor)),flip:false}),true);
  hykSpanRail([[s*(sw/2+.15),-.02,zb+1.6],[s*(sw/2+.15),-.02,ze-.8]],{col:bone,h:1.0,every:1.6});
  const slipY=z=>z<E-4?-.2*(z-(zb+1.6))/(E-4-zb-1.6):-.2+(sea-.3)*(z-(E-4))/(ze-.6-(E-4));
  hykPut('hkFloor',hykSurf((u,v)=>{const z=zb+1.6+(ze-.8-zb-1.6)*u;const y0=slipY(z);return [s*sw/2,y0+(-.02-y0)*v,z];},16,2,{col:hC(hPick(HPAL.floor),.9),flip:s>0}),true);
  for(let z=zb+4;z<ze-1;z+=3.6){const g=V.foot(z);const wallX=hw*Math.sqrt(Math.max(0,1-(-.8-g)/(H-g)));hykPut('hkBone',hykTube([[wx,-.3,z],[s*(wallX+.3),-.9,z]],()=>.11,{seg:6,col:bone}));hykPut('hkBone',hykFlare([s*wallX*1.0,-.86,z],[-s,0,0],.13,.3,{col:bone}));}}
 portSkiff(0,E-2.5,0,null,-.08);
 hykSpanMark('wetdoor',0,sea+.6,ze-.4,0,1,sw,3,'wet');
 const bw=hykW(0,0,ze+4);const hd=hykN(0,0,1);BERTHS.push({host:null,x:bw[0],z:bw[2],heading:Math.atan2(hd[2],hd[0]),kind:'skiff'});
 hykReg('Boat shed',0,(zb+ze)/2,13,H+1);}
HYK.def({key:'hyk_boat_shed',name:'Boat shed',family:'harbour',row:'Harbour',w:12,d:46,h:7,tags:{type:['infrastructure'],wealth:'middle',lit:false},build:hykHarbDefBoatShed});
// ---- the boom chain: two bone spires standing in the water, a chain of shell floats slung between them, a jar on each
function hykHarbDefBoom(G,o){reseed(30724+(o.v|0));const sea=hykHarbSea(o);const E=hykHarbShore(sea,o);const col=hykHarbShell(),bone=hykHarbBone();const zb=E+9;const X=20;
 const tops=[];for(const s of [-1,1]){const x=s*X;const g=hykSpanGround(x,zb)-.8;const H=sea+5.8-g;
  hykPut('hkBone',hykLathe({H,yBase:g,cx:x,cz:zb,rFn:y=>1.05*Math.pow(1-y/H*.72,1.2)+.18,nu:22,nv:14,flute:{n:9,amp:.12,sharp:1.3},twist:.3,rings:{n:6,amp:.03},col:bone}));
  hykPut('hkBone',hykFlare([x,g,zb],[0,1,0],1.2,1.3,{col:bone}));kput('hkBall',[x,g+H,zb],null,[.42,.36,.42],bone);
  hykLight(x-s*.55,g+H-.9,zb,{r:.2,cool:true,level:'wet',bracket:[x-s*.1,g+H-.3,zb]});
  kput('hkBall',[x-s*.55,sea+1.3,zb],null,[.22,.22,.22],bone);tops.push([x-s*.55,sea+1.3,zb]);}
 const nf=11;const pts=[];const n=nf*6;for(let i=0;i<=n;i++){const t=i/n;const sag=Math.abs(Math.sin(t*nf*Math.PI));const y=t<.03||t>.97?sea+1.3-(sea+1.3-(sea+.05))*Math.min(1,Math.min(t,1-t)/.03):sea+.05-.3*sag;pts.push([tops[0][0]+(tops[1][0]-tops[0][0])*t,y,zb]);}
 hykPut('hkBone',hykTube(pts,(t)=>.1*(1+.55*Math.max(0,Math.cos(t*n*TAU))),{seg:6,col:bone}));
 for(let k=1;k<nf;k++){const t=k/nf;kput('hkBall',[tops[0][0]+(tops[1][0]-tops[0][0])*t,sea+.14,zb],null,[.72,.6,.72],col);}
 hykSpanMark('wetdoor',X-1.2,sea+1,zb,-1,0,6,3,'wet');
 hykReg('Boom chain',0,zb,X+3,7);}
HYK.def({key:'hyk_boom_chain',name:'Boom chain',family:'harbour',row:'Harbour',w:44,d:48,h:7,tags:{type:['infrastructure'],wealth:'civic',lit:true},build:hykHarbDefBoom});
// ---- the navy's ship shed: a 40 m parabolic vault for a trireme, heavy ribs, a slip between railed side walks on
// brackets, portholes, a crew door; the trireme's berth at the mouth
function hykHarbDefShipShed(G,o){reseed(30730+(o.v|0));const sea=hykHarbSea(o);const E=hykHarbShore(sea,o);const col=hykHarbShell(),bone=hykHarbBone();
 const hw=7.2,H=10.5,zb=E-28,ze=E+12;
 const ops=[{s:-.92,z:zb+6,r:1.15,ky:1.3,kind:'door'},{s:-.92,z:zb+30,r:1.15,ky:1.3,kind:'door'}];for(let z=zb+4;z<ze-3;z+=6)for(const s of [-.7,.7])ops.push({s,z,r:.55,kind:'window'});
 const V=hykHarbVault(zb,ze,hw,H,sea,{col,ribs:5,ribR:.42,ops});
 for(const op of V.ops){if(op.kind==='door')hykDoor(op,{level:'quay',depth:.6});else hykWin(op,{});}
 const sw=6.4;const slip=[[0,.0,zb+2],[0,-.3,E-6],[0,sea-.8,ze-.8]];hykPut('hkFloor',hykDeck(slip,sw,{col:hC(hPick(HPAL.floor)),camber:.08,flip:false}),true);
 const slipY=z=>z<E-6?-.3*(z-(zb+2))/(E-6-zb-2):-.3+(sea-.5)*(z-(E-6))/(ze-.8-(E-6));
 for(const s of [-1,1]){const wx=s*(sw/2+1.3);hykPut('hkFloor',hykDeck([[wx,-.02,zb+1.8],[wx,-.02,E-3],[wx,-.02,ze-1]],2.5,{col:hC(hPick(HPAL.floor)),flip:false}),true);
  hykSpanRail([[s*(sw/2+.15),-.02,zb+2],[s*(sw/2+.15),-.02,ze-1]],{col:bone,h:1.0,every:1.6});
  hykPut('hkFloor',hykSurf((u,v)=>{const z=zb+2+(ze-1-zb-2)*u;const y0=slipY(z);return [s*sw/2,y0+(-.02-y0)*v,z];},24,2,{col:hC(hPick(HPAL.floor),.9),flip:s>0}),true);
  for(let z=zb+4;z<ze-1.5;z+=4){const g=V.foot(z);const wallX=hw*Math.sqrt(Math.max(0,1-(-.9-g)/(H-g)));hykPut('hkBone',hykTube([[wx,-.3,z],[s*(wallX+.3),-1.0,z]],()=>.13,{seg:6,col:bone}));hykPut('hkBone',hykFlare([s*wallX,-.96,z],[-s,0,0],.15,.34,{col:bone}));}}
 for(const z of [zb+10,zb+20,zb+30])hykLight(-hw*.62,H*.56,z,{r:.2,cool:true,level:'quay',bracket:[-hw*.7,H*.52,z]});
 hykSpanMark('wetdoor',0,sea+.8,ze-.5,0,1,sw,4,'wet');
 const bw=hykW(0,0,E+2);const hd=hykN(0,0,1);BERTHS.push({host:null,x:bw[0],z:bw[2],heading:Math.atan2(hd[2],hd[0]),kind:'trireme'});
 hykReg('Ship shed',0,(zb+ze)/2,22,H+1);}
HYK.def({key:'hyk_ship_shed_military',name:'Ship shed',family:'harbour',row:'Harbour',w:17,d:80,h:12,tags:{type:['military','infrastructure'],wealth:'civic',lit:true},build:hykHarbDefShipShed});
// ---- the hexareme's berth: a quay arm 40 m out into the water, the berth face to the east with bollards and rings, a
// crane rib leaning out over it from a socket on the deck (chain and hook), a lamp and a wet landing at the tip
function hykHarbDefHexareme(G,o){reseed(30736+(o.v|0));const sea=hykHarbSea(o);const E=hykHarbShore(sea,o);const col=hykHarbShell(),bone=hykHarbBone();const hw=4.6,ze=E+40;
 hykHarbSolid(-hw,hw,-3,ze,sea,{col});hykHarbTide([hw,ze],[hw,E+1],sea);hykHarbTide([-hw,E+1],[-hw,ze],sea);hykHarbTide([-hw,ze],[hw,ze],sea);
 for(let z=E+3;z<ze-2;z+=5.5)hykHarbBollard(hw-.9,0,z,bone);for(let z=E+6;z<ze-4;z+=8)hykHarbRing(hw+.34,sea+1.5,z,1,0,bone);
 // the crane: a knuckled rib from a flared socket on the deck, over the berth, a chain and hook from its tip, a capstan
 const cz=E+19;const base=[-2.4,0,cz];const rib=[[-2.4,-1.2,cz],base,[-2.2,3.8,cz],[-1.0,7.6,cz],[2.4,10.4,cz],[6.4,11.2,cz],[9.6,10.4,cz]];
 hykPut('hkBone',hykTube(rib,(t)=>(.62-.3*t)*(1+.2*Math.max(0,Math.cos(t*6*TAU))),{seg:9,col:bone}));hykPut('hkBone',hykFlare(base,[0,1,0],.66,1.0,{col:bone}));
 kput('hkBall',[9.6,10.4,cz],null,[.38,.34,.38],bone);
 const ch=[];for(let i=0;i<=14;i++){const t=i/14;ch.push([9.6,10.2-7.2*t,cz]);}hykPut('hkBone',hykTube(ch,(t)=>.07*(1+.6*Math.max(0,Math.cos(t*16*TAU))),{seg:6,col:bone}));
 hykPut('hkBone',hykTube([[9.6,3.0,cz],[9.6,2.4,cz],[9.9,2.0,cz],[10.3,2.2,cz],[10.4,2.7,cz]],()=>.09,{seg:6,col:bone}));kput('hkBall',[9.6,3.0,cz],null,[.2,.2,.2],bone);
 hykPut('hkBone',hykLathe({H:1.1,yBase:0,cx:-1.0,cz:cz+3.2,rFn:y=>.48+.1*Math.sin(y*5),nu:14,nv:5,flute:{n:8,amp:.1,sharp:1.3},col:bone}));kput('hkBall',[-1.0,1.12,cz+3.2],null,[.5,.3,.5],bone);
 hykSpanLampPost(-hw+1.0,0,ze-1.2,{level:'quay',col:bone,h:3.0});
 const wet=sea+1;const A=hykHarbStairWall(-hw+.9,ze,.26,wet,1,sea,{col:bone});const R=2.6;const px=A.x+1.4,pz=ze+.9+R*.9;
 hykSpanPad(px,wet,pz,R,{col,rail:{a0:Math.atan2(A.z-pz,A.x-px)+.3,gap:1.4},own:'berth wet landing'});
 hykSpanMark('door',0,0,E-1.5,0,-1,hw*2-2,2.3,'quay');hykSpanMark('wetdoor',hw,sea+1,cz,1,0,20,3,'wet');hykSpanMark('wetdoor',px,wet,pz+R*.9,0,1,2.4,2.4,'wet');
 const bw=hykW(hw+7,0,cz);const hd=hykN(0,0,1);BERTHS.push({host:null,x:bw[0],z:bw[2],heading:Math.atan2(hd[2],hd[0]),kind:'hexareme'});
 hykReg('Hexareme berth',2,(E+ze)/2,27,13);}
HYK.def({key:'hyk_hexareme_berth',name:'Hexareme berth',family:'harbour',row:'Harbour',w:22,d:86,h:13,tags:{type:['military','infrastructure'],wealth:'civic',lit:true},build:hykHarbDefHexareme});
// ---- the Navigator's Guild: a fluted shell dome with a nacre crown and signal spire (a pearl at its tip), the chart
// hall inside (three chart tables, the tide shrine, chart chests), a lookout pod grown on the west shoulder with lens
// windows all round, its perch reached by a spiral stair hugging the dome round the back
function hykHarbDefNavigators(G,o){reseed(30742+(o.v|0));const col=hykHarbShell(),col2=hC(hPick(HPAL.shellWarm)),nac=hC(hPick(HPAL.nacre)),bone=hykHarbBone();
 const DR=8.2,DH=7.6,cz=1.5;const dome=y=>DR*Math.sqrt(Math.max(0,1-Math.pow(Math.max(0,y)/DH,2.3)))+.12;
 const L={H:DH,cx:0,cz,yBase:-.3,rFn:dome,nu:84,nv:30,flute:{n:16,amp:.045,sharp:1.6},rings:{n:9,amp:.02},noise:{amp:.02,su:5,sv:2,seed:12},col};
 const door=hykLatheAt(L,Math.PI/2,1.35);const ops=[{p:door.p,n:door.n,r:1.2,ky:1.3,kind:'door'}];
 for(const w of [{th:Math.PI/2-.95,y:2.9,r:.55},{th:Math.PI/2+.95,y:2.9,r:.55},{th:.15,y:3.6,r:.6},{th:Math.PI-.15,y:3.6,r:.6},{th:Math.PI/2,y:5.2,r:.5}]){const q=hykLatheAt(L,w.th,w.y);ops.push({p:q.p,n:q.n,r:w.r,ky:1.15,kind:'window'});}
 L.ops=ops;hykPut('hkShell',hykLathe(L));hykPut('hkIn',hykLathe(Object.assign({},L,{rFn:y=>dome(y)*.93,flip:true,col:hC(hPick(HPAL.shell),.9)})),true);
 hykPut('hkShell',hykFlare([0,-.25,cz],[0,1,0],DR*.99,2.2,{col}));
 for(const op of ops){if(op.kind==='door')hykDoor(op,{level:'quay',nacre:true,depth:.7});else hykWin(op,{nacre:true,lit:true});}
 for(const s of [-1,1]){const q=hykLatheAt(L,Math.PI/2+s*.36,2.6);const A=[q.p[0],q.p[1]-.3,q.p[2]];hykLight(A[0]+q.n[0]*.5,A[1]+.15,A[2]+q.n[2]*.5,{r:.2,nacre:true,level:'quay',bracket:A});}
 // the chart hall
 hykFloor(0,cz,.1,DR*.9,{});const hall=hykRoom('hall',hykCirclePoly(0,cz,DR*.86,18),.1,DH-.6,{doors:[[0,cz+DR,2.4]],wealth:.8});
 hykSpot(hall,'table',-3.4,cz-.6,.3,2.0,1.2);hykSpot(hall,'table',3.4,cz-.6,-.3,2.0,1.2);hykSpot(hall,'table',0,cz-3.9,0,2.0,1.2);
 hykSpot(hall,'shrine',0,cz-6.4,0,.9,.6);hykSpot(hall,'store',-5.4,cz+2.4,1.2,1.2,.7);hykSpot(hall,'store',5.4,cz+2.4,-1.2,1.2,.7);hykSpot(hall,'seat',0,cz+1.6,0,1.2,.9);
 // the lookout: a nacre lantern pod bedded into the crown, rooted with a flare, lens windows all round, the signal
 // spire with the pearl on its top, its door at +z onto a perch; the stair starts on the perch's rim and spirals down
 // the dome round the back
 const PR=2.6,pcx=0,pcz=cz;const pcy=DH-.3+PR*.5;const PY=pcy-PR*.86*.52;
 const pod=hykPod({a:PR,b:PR*.86,c:PR,e1:.9,e2:.94,cy:pcy,nu:48,nv:26,noise:{amp:.02,su:4,sv:3,seed:5},col:nac,hollow:{t:.08,col:col2},
  openings:[{th:0,el:-.04,r:.95,ky:1.3,kind:'door'},{th:1.05,el:.08,r:.44,kind:'window'},{th:-1.05,el:.08,r:.44,kind:'window'},{th:2.1,el:.1,r:.44,kind:'window'},{th:-2.1,el:.1,r:.44,kind:'window'},{th:Math.PI,el:.12,r:.44,kind:'window'},{th:.5,el:.62,r:.3,kind:'window'},{th:-2.6,el:.62,r:.3,kind:'window'}]});
 pod.geo.translate(pcx,0,pcz);hykPut('hkNacre',pod.geo);pod.inner.translate(pcx,0,pcz);hykPut('hkIn',pod.inner,true);
 let pdoor=null;for(const op of pod.openings){op.p=[op.p[0]+pcx,op.p[1],op.p[2]+pcz];if(op.kind==='door'){pdoor=op;hykDoor(op,{level:'L1',nacre:true});}else hykWin(op,{nacre:true,lit:true,open:true});}
 const yc=DH*Math.pow(1-Math.pow(3.2/DR,2),1/2.3)-.3;hykPut('hkNacre',hykFlare([0,yc,cz],[0,1,0],2.2,1.5,{col:nac}));   // where the pod's waist meets the crown
 hykPut('hkNacre',hykLathe({H:3.6,cx:0,cz,yBase:pcy+PR*.86*.88,rFn:y=>.42*Math.pow(1-y/3.6,.85)+.04,nu:16,nv:12,flute:{n:8,amp:.14,sharp:1.3},twist:.8,col:nac}));
 hykLight(0,pcy+PR*.86*.88+3.95,cz,{r:.32,nacre:true,level:'L1',bracket:[0,pcy+PR*.86*.88+3.5,cz]});
 hykFloor(pcx,pcz,PY,PR*.8,{});const look=hykRoom('hall',hykCirclePoly(pcx,pcz,PR*.76,12),PY,PR*.86*1.3,{doors:[[pcx,pcz+PR,1.9,'perch']],wealth:.8});
 hykSpot(look,'work',pcx-.8,pcz-.8,0,1.0,.6);hykSpot(look,'seat',pcx+.9,pcz-.7,0,.9,.9);
 const padR=2.0,padX=0,padZ=pdoor.p[2]+padR*.9;const yd=DH*Math.pow(Math.max(0,1-Math.pow((padZ-cz)/DR,2)),1/2.3)-.3;   // the dome's surface under the perch
 hykSpanPad(padX,PY,padZ,padR,{col,rail:{a0:-Math.PI/2-.1,gap:1.5},own:'lookout perch',ground:yd-.3});
 // the stair's top tread on the perch's rim: the tread circle about the dome's axis meets the pad's rim; then down round the back
 const dist=padZ-cz,ang=Math.PI/2;const rc=dome(PY)+.65;const cd=clamp((rc*rc+dist*dist-padR*padR)/(2*rc*dist),-1,1);
 hykSpanStairSpiral(0,cz,(y,a)=>dome(Math.max(0,y)),PY-.1,0.1,{a0:ang+Math.acos(cd),dir:1,w:1.1,col:bone});
 hykSpanMark('door',padX,PY,padZ+padR*.9,0,1,1.3,2.3,'L1');
 hykReg("Navigators' Guild",0,cz,DR+3,DH+7);}
HYK.def({key:'hyk_navigators_guild',name:"Navigators' Guild",family:'harbour',row:'Harbour',w:24,d:22,h:15,inside:true,tags:{type:['civic'],wealth:'civic',lit:true},build:hykHarbDefNavigators});
// ---- the Pearlmonger's Guild: the richest shell on the sheet. A nacre conch (the conch house's pattern, larger, nacre
// wherever the hook plays), pearl lamps on brackets, the sorting hall grown on the whorl (nacre drum and lens dome,
// three sorting tables), a thick-walled vault pod at the back of the whorl, a mosaic forecourt, the pearl sign on the spire
function hykHarbDefPearlmongers(G,o){reseed(30748+(o.v|0));const nac=hC(hPick(HPAL.nacre)),col2=hC(hPick(HPAL.coral)),sg=hC(hPick(HPAL.seaGreen),1.35),bone=hykHarbBone();
 const C={R:4.1,turns:2.6,g:.78,flare:.18,apexLift:7.4,flute:{n:12,amp:.05},rings:{n:30,amp:.02},nu:260,nv:30,col:nac};
 const pre=hykConch(C);
 const outward=t=>{const Cc=pre.cen(t),C2=pre.cen(t+.002);const tx=C2[0]-Cc[0],tz=C2[2]-Cc[2];const L=Math.hypot(tx,tz)||1;let nx=tz/L,nz=-tx/L;
  if((Cc[0]+nx)*(Cc[0]+nx)+(Cc[2]+nz)*(Cc[2]+nz)<(Cc[0]-nx)*(Cc[0]-nx)+(Cc[2]-nz)*(Cc[2]-nz)){nx=-nx;nz=-nz;}return [nx,nz];};
 const wins=[.79,.85,.91].map(t=>{const Cc=pre.cen(t);const r=pre.rho(t);const n=outward(t);return {p:[Cc[0]+n[0]*r*.92,Cc[1]+r*.25,Cc[2]+n[1]*r*.92],n:[n[0]*.9,.35,n[1]*.9],r:.62,kind:'window'};});
 C.ops=wins;const sh=hykConch(C);hykPut('hkNacre',sh.geo);
 hykPut('hkIn',hykConch(Object.assign({},C,{R:C.R*.92,flip:true,col:hC(hPick(HPAL.shell),.92)})).geo,true);
 const ap=sh.cen(0);hykPut('hkNacre',hykLathe({H:4.6,cx:ap[0],cz:ap[2],yBase:ap[1]-.7,rFn:y=>1.05*Math.pow(1-y/4.6,.85)+.05,nu:16,nv:12,flute:{n:9,amp:.12,sharp:1.3},twist:.7,col:nac}));
 hykLight(ap[0],ap[1]+4.3,ap[2],{r:.42,nacre:true,level:'quay',bracket:[ap[0],ap[1]+3.85,ap[2]]});   // the pearl sign
 // the septum and the door, the porch floor, the mouth's lip
 const A=sh.aperture;const Rt=C.R*1.2,dz=-.8,dx=A.p[0],dy=A.p[1]-Rt*.36;const dr=1.2,dky=1.3;
 hykPut('hkNacre',hykSurf((u,v)=>{const th=u*TAU;const r=v*Rt;return [A.p[0]+r*Math.cos(th),A.p[1]+r*Math.sin(th),A.p[2]+dz];},48,5,{col:col2,hole:(u,v,p)=>Math.pow(p[0]-dx,2)+Math.pow((p[1]-dy)/dky,2)<dr*dr*1.05}));
 hykDoor({p:[dx,dy,A.p[2]+dz],n:[0,0,1],r:dr,ky:dky},{level:'quay',nacre:true,depth:.8});
 hykPut('hkFloor',hykDisc(A.p[0],.08,A.p[2]+1.0,A.r*.95,{col:hC(hPick(HPAL.floor))}));kput('hkLipN',[A.p[0],A.p[1]-.2,A.p[2]+.3],qEuler(0,0,0),[A.r*.96,A.r*.96,A.r*1.4],nac);
 for(let t=.46;t<.965;t+=.034){const Cc=sh.cen(t);const r=sh.rho(t);const ox=Cc[0]-(-sh.rho(1)*1.3),oz=Cc[2];const ol=Math.hypot(ox,oz)||1;
  const s=r*.22;kput('hkBall',[Cc[0]+(ox/ol)*r*.72,Cc[1]+r*.78,Cc[2]+(oz/ol)*r*.72],qFacing([ox/ol,.6,oz/ol]),[s,s*.8,s*1.6],nac);}
 for(const w of wins)hykWin(w,{nacre:true,lit:true});
 for(const t of [.3,.55,.78,.97]){const Cc=sh.cen(t);const r=sh.rho(t);hykPut('hkNacre',hykFlare([Cc[0],.02,Cc[2]],[0,1,0],r*.96,r*.45,{col:nac}));}
 hykPut('hkMosaic',hykDisc(0,.03,6.4,5.6,{col:hC(hPick(HPAL.shellWarm)),lobes:{n:11,amp:.06}}));
 for(let i=0;i<=10;i++){const t=.64+i/10*.36;const Cc=sh.cen(t);hykFloor(Cc[0],Cc[2],.3,sh.rho(t)*.8,{nu:16});}
 hykLight(A.p[0]-A.r*.9,A.p[1]+1.0,A.p[2]+.5,{r:.24,nacre:true,level:'quay',bracket:[A.p[0]-A.r*.98,A.p[1]+.6,A.p[2]+.1]});hykLight(A.p[0]+A.r*.9,A.p[1]+1.0,A.p[2]+.5,{r:.24,nacre:true,level:'quay',bracket:[A.p[0]+A.r*.98,A.p[1]+.6,A.p[2]+.1]});
 const Cm=sh.cen(.84);hykLight(Cm[0],Cm[1]+sh.rho(.84)*.5,Cm[2],{r:.22,nacre:true,level:'quay',bracket:[Cm[0],Cm[1]+sh.rho(.84)*.86,Cm[2]]});
 // the chamber: the shop floor, counters and a seat
 const poly=[];for(let i=0;i<=8;i++){const t=.69+i/8*.3;const Cc=sh.cen(t);const r=sh.rho(t)*.74;const n=outward(t);poly.push([Cc[0]-n[0]*r,Cc[2]-n[1]*r]);}
 for(let i=8;i>=0;i--){const t=.69+i/8*.3;const Cc=sh.cen(t);const r=sh.rho(t)*.74;const n=outward(t);poly.push([Cc[0]+n[0]*r,Cc[2]+n[1]*r]);}
 const ch=hykRoom('hall',poly,.3,4.6,{doors:[[A.p[0],A.p[2]+.6,A.r*1.2]],wealth:.95});
 const bd=t=>{const a=sh.cen(t),b=sh.cen(t+.002);return Math.atan2(b[0]-a[0],b[2]-a[2]);};
 const c1=sh.cen(.80),c2=sh.cen(.87),c3=sh.cen(.74);hykSpot(ch,'table',c1[0],c1[2],bd(.80)+Math.PI/2,2.0,1.0);hykSpot(ch,'table',c2[0],c2[2],bd(.87)+Math.PI/2,2.0,1.0);hykSpot(ch,'seat',c3[0],c3[2],bd(.74)+Math.PI/2,1.0,.9);
 // the sorting hall: a nacre drum with a lens dome, grown on the back of the whorl, three sorting tables
 let t0=.6,zb=1e9;for(let t=.5;t<=.8;t+=.01){const c=sh.cen(t);if(c[2]<zb){zb=c[2];t0=t;}}
 const Cc=sh.cen(t0);const rr0=sh.rho(t0);const n0=outward(t0);const nx=n0[0],nz=n0[1];
 const ax=Cc[0]+nx*(rr0+2.6),az=Cc[2]+nz*(rr0+2.6);const DR=3.1,DH=2.6,DY=3.2;
 hykPut('hkNacre',hykLathe({H:DY,cx:ax,cz:az,yBase:0,rFn:y=>DR*(1+.05*Math.sin(y*2)),nu:40,nv:8,rings:{n:5,amp:.03},flute:{n:14,amp:.03,sharp:1.5},col:nac}));
 hykPut('hkIn',hykLathe({H:DY,cx:ax,cz:az,yBase:0,rFn:y=>DR*.93,nu:40,nv:6,flip:true,col:hC(hPick(HPAL.shell),.9)}),true);
 hykPut('hkNacre',hykLathe({H:DH,cx:ax,cz:az,yBase:DY,rFn:y=>DR*Math.sqrt(Math.max(0,1-Math.pow(y/DH,2.3)))+.05,nu:40,nv:12,col:nac}));
 for(let i=0;i<11;i++){const a=i/11*TAU;const r=DR*.93;kput('hkLens',[ax+r*Math.cos(a),DY+1.0,az+r*Math.sin(a)],null,.32,hC(hPick(HPAL.lens)));}
 hykPut('hkNacre',hykLathe({H:2.0,cx:ax,cz:az,yBase:DY+DH-.3,rFn:y=>.4*Math.pow(1-y/2.0,.8)+.03,nu:14,nv:8,flute:{n:7,amp:.14,sharp:1.3},twist:1.1,col:nac}));
 hykPut('hkNacre',hykFlare([ax,0,az],[0,1,0],DR*.98,1.4,{col:col2}));hykPut('hkNacre',hykFlare([Cc[0]+nx*rr0*.96,1.5,Cc[2]+nz*rr0*.96],[nx,0,nz],1.9,1.5,{col:col2}));
 const dw=hykLatheAt({cx:ax,cz:az,yBase:0,rFn:y=>DR},Math.atan2(nz,nx)+1.2,1.7);hykWin({p:dw.p,n:dw.n,r:.55,kind:'window'},{nacre:true,lit:true});
 const dw2=hykLatheAt({cx:ax,cz:az,yBase:0,rFn:y=>DR},Math.atan2(nz,nx)-1.2,1.7);hykWin({p:dw2.p,n:dw2.n,r:.55,kind:'window'},{nacre:true,lit:true});
 hykFloor(ax,az,.12,DR*.9,{});hykLight(ax,DY+.9,az,{r:.2,nacre:true,level:'quay',bracket:[ax,DY+1.3,az]});
 const an=hykRoom('workshop',hykCirclePoly(ax,az,DR*.86,14),.12,DY+DH*.6,{doors:[[Cc[0]+nx*(rr0+.5),Cc[2]+nz*(rr0+.5),1.2,'hall']],wealth:.95});
 // the door is on the whorl side (-n); the tables stand away from it, the store between them by the door's wall
 const sx=-nz,sz=nx;const ra=Math.atan2(nx,nz);hykSpot(an,'table',ax+sx*1.35+nx*.3,az+sz*1.35+nz*.3,ra,1.6,1.0);hykSpot(an,'table',ax-sx*1.35+nx*.3,az-sz*1.35+nz*.3,ra,1.6,1.0);
 hykSpot(an,'table',ax+nx*1.75,az+nz*1.75,ra+Math.PI/2,1.6,1.0);hykSpot(an,'store',ax-nx*.3,az-nz*.3,ra+Math.PI/2,1.2,.7);
 // the vault: a thick pod on the far flank of the whorl, one door from the chamber, two chests
 let t1=.72,xb=-1e9;for(let t=.5;t<=.9;t+=.01){const c=sh.cen(t);const n=outward(t);if(n[0]>.6&&c[0]>xb){xb=c[0];t1=t;}}
 const Cv=sh.cen(t1),rv=sh.rho(t1),nv0=outward(t1);const VR=2.4;const vx=Cv[0]+nv0[0]*(rv+VR*.3),vz=Cv[2]+nv0[1]*(rv+VR*.3);
 const vp=hykPod({a:VR,b:VR*.8,c:VR,e1:.88,e2:.9,cy:VR*.8*.82,nu:40,nv:22,noise:{amp:.02,su:4,sv:3,seed:8},col:sg,hollow:{t:.2,col:sg},openings:[{th:Math.atan2(-nv0[0],-nv0[1]),el:-.05,r:.8,ky:1.3,kind:'door'},{th:Math.atan2(nv0[0],nv0[1]),el:.9,r:.3,kind:'window'}]});
 vp.geo.translate(vx,0,vz);hykPut('hkNacre',vp.geo);vp.inner.translate(vx,0,vz);hykPut('hkIn',vp.inner,true);
 for(const op of vp.openings){op.p=[op.p[0]+vx,op.p[1],op.p[2]+vz];if(op.kind==='door')hykDoor(op,{level:'quay',nacre:true,depth:.9,room:'vault'});else hykWin(op,{nacre:true,lit:true});}
 hykPut('hkNacre',hykFlare([vx,0,vz],[0,1,0],VR*.96,1.1,{col:sg}));hykPut('hkNacre',hykFlare([Cv[0]+nv0[0]*rv*.96,1.3,Cv[2]+nv0[1]*rv*.96],[nv0[0],0,nv0[1]],VR*.7,1.1,{col:sg}));
 hykFloor(vx,vz,.12,VR*.78,{});hykLight(vx,VR*.8*.82+VR*.5,vz,{r:.18,nacre:true,level:'quay',bracket:[vx,VR*.8*.82+VR*.75,vz]});
 const vault=hykRoom('vault',hykCirclePoly(vx,vz,VR*.74,12),.12,VR*.8*1.2,{doors:[[vx-nv0[0]*VR*.8,vz-nv0[1]*VR*.8,1.4,'hall']],wealth:.95});
 const vsx=-nv0[1],vsz=nv0[0];hykSpot(vault,'store',vx+vsx*.9+nv0[0]*.5,vz+vsz*.9+nv0[1]*.5,Math.atan2(nv0[0],nv0[1]),1.2,.7);hykSpot(vault,'store',vx-vsx*.9+nv0[0]*.5,vz-vsz*.9+nv0[1]*.5,Math.atan2(nv0[0],nv0[1]),1.2,.7);
 hykReg("Pearlmongers' Guild",0,-1,12,12);}
HYK.def({key:'hyk_pearlmongers_guild',name:"Pearlmongers' Guild",family:'harbour',row:'Harbour',w:30,d:28,h:15,inside:true,tags:{type:['market/shop','civic'],wealth:'rich',lit:true},build:hykHarbDefPearlmongers});
// ---- the aquaculture pens: three floating ring pens with net walls, a tender's barnacle hut on a pad, a pontoon
// between them; away from the city, so a quay stub only
function hykHarbDefPens(G,o){reseed(30754+(o.v|0));const sea=hykHarbSea(o);const E=hykHarbShore(sea,o);const col=hykHarbShell(),bone=hykHarbBone(),weed=hC(hPick(HPAL.weed)),grey=hC(hPick(HPAL.barnacle));
 const wet=sea+1;const hutX=9,hutZ=E+7;
 // the tender's hut: a barnacle cone on a lily pad, its door to the pontoon
 hykSpanPad(hutX,wet,hutZ,3.8,{col:grey,mat:'hkBarn',rail:{a0:Math.PI,gap:1.3},own:'tender pad',ground:hykSpanGround(hutX,hutZ)-.8});
 const HL={H:3.4,cx:hutX,cz:hutZ-.4,yBase:wet-.1,rFn:y=>2.3+(1.5-2.3)*Math.pow(y/3.4,.75),nu:36,nv:14,flute:{n:14,amp:.07,sharp:1.5},rings:{n:6,amp:.025},noise:{amp:.03,su:5,sv:1.2,seed:3},tilt:{amp:.2,dir:.4},col:grey};
 const hd=hykLatheAt(HL,Math.PI,1.25);HL.ops=[{p:hd.p,n:hd.n,r:1.0,ky:1.2,kind:'door'}];hykPut('hkBarn',hykLathe(HL));hykPut('hkIn',hykLathe(Object.assign({},HL,{rFn:y=>HL.rFn(y)*.9,flip:true,col:hC(hPick(HPAL.barnacle),.85)})),true);
 hykPut('hkBarn',hykFlare([hutX,wet,hutZ-.4],[0,1,0],2.25,.7,{col:grey}));hykDoor(HL.ops[0],{level:'wet'});
 hykPut('hkBarn',hykSurf((u,v)=>{const th=u*TAU;const r=1.5*v;return [hutX+r*Math.cos(th),wet-.1+3.4*(1-.2*.5*(1+Math.cos(th-.4)))+.4*(1-v*v),hutZ-.4+r*Math.sin(th)];},30,4,{col:hC(hPick(HPAL.barnacle),.9),flip:true}));
 hykFloor(hutX,hutZ-.4,wet+.02,2.0,{});const hut=hykRoom('workshop',hykCirclePoly(hutX,hutZ-.4,1.95,12),wet+.02,2.6,{doors:[[hutX-2.3,hutZ-.4,2.0]],wealth:.15});
 hykSpot(hut,'store',hutX+.7,hutZ-1.3,0,1.2,.7);hykSpot(hut,'work',hutX+.6,hutZ+.6,0,.8,.8);
 // the pontoon from the pad to the pens, and the pens
 const pens=[[-10,E+13,4.6],[1,E+16,4.6],[-6,E+26,4.2]];
 hykSpanPontoon({x:hutX-3.8*.9,y:wet,z:hutZ},{x:pens[1][0]+pens[1][2]+1.2,y:wet,z:pens[1][1]-1.5},{sea,own:'pens pontoon',level:'wet',segL:4.4});
 hykSpanPontoon({x:pens[1][0]+pens[1][2]+1.0,y:wet,z:pens[1][1]-1.2},{x:pens[0][0]+pens[0][2]*.6,y:wet,z:pens[0][1]-pens[0][2]-1.4},{sea,own:'pens pontoon 2',level:'wet',segL:4.4});
 for(const P of pens){const [cx,cz,R]=P;const ring=[];for(let i=0;i<=40;i++){const a=i/40*TAU;ring.push([cx+R*Math.cos(a),sea+.2,cz+R*Math.sin(a)]);}
  hykPut('hkShell',hykTube(ring,(t)=>.26*(1+.3*Math.max(0,Math.cos(t*12*TAU))),{seg:7,col}));
  for(let i=0;i<12;i++){const a=i/12*TAU;kput('hkBall',[cx+R*Math.cos(a),sea+.22,cz+R*Math.sin(a)],null,[.52,.42,.52],col);}
  hykPut('hkWeed',hykSurf((u,v)=>{const a=u*TAU;const r=R*(1-.08*v)+.04*Math.sin(a*9+v*6);return [cx+r*Math.cos(a),sea+.15-3.0*v,cz+r*Math.sin(a)];},40,6,{col:weed,uS:TAU*R/4,vS:1}));
  for(let i=0;i<4;i++){const a=i/4*TAU+.4;hykPut('hkBone',hykTube([[cx+R*Math.cos(a),sea+.25,cz+R*Math.sin(a)],[cx+R*.96*Math.cos(a),sea-3.2,cz+R*.96*Math.sin(a)]],()=>.07,{seg:5,col:bone}));}}
 hykSpanMark('wetdoor',hutX,wet,hutZ+3.6*.9,0,1,2.4,2.4,'wet');
 const bw=hykW(hutX+6,0,hutZ);const hn=hykN(0,0,1);BERTHS.push({host:null,x:bw[0],z:bw[2],heading:Math.atan2(hn[2],hn[0]),kind:'skiff'});
 hykReg('Aquaculture pens',0,E+16,20,5);}
HYK.def({key:'hyk_aquaculture_pen',name:'Aquaculture pens',family:'harbour',row:'Harbour',w:30,d:70,h:5,tags:{type:['infrastructure','farm'],wealth:'poor',lit:false},build:hykHarbDefPens});
