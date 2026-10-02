// ================================================================= HYKKOUSOI — the Archon's Citadel (seeds 30625–30649)
// The terraced arena-fortress on the Citadel stack at the drowned quarter's southern flank (DESIGN §2; refs/civic.jpg E).
// The city's terrain makes the stack (CITY.STACKS[0]); this builder is what crowns it: y = 0 is the stack's top, +z the
// gate. A ring wall, fluted and lobed like the travertine below it, with blind arcades low down and open embrasures along
// its wall-walk; inside, six terraces step down to the arena floor and its ringed pool, with flights up each terrace on
// the east and west; the gate is a flared cutting through the terraces at the front; four urchin towers stand against
// the wall on the diagonals; the Archon's tribunal, a nacre pod on a bastion, sits on the back of the ring and looks
// down the arena to the gate, its spire the Citadel's crown. A bridge door at the west on the wall-walk is the head
// for the span to the Amphitriton (the city lays the span, P3). The Treasury stands in the precinct outside the wall
// (the city places it). Reuses the Amphitriton's annulus, band, radial wall, rail, pad, water and lamp-post helpers,
// and 74c's hykTideAt (a lathe point ON its lobes and flutes).
function hykCitPodEl(P,y){const s=clamp((y-P.cy)/P.b,-.999,.999);return Math.asin(Math.sign(s)*Math.pow(Math.abs(s),1/(P.e1||1)));}
function buildHykCitadel(G,o){reseed(30625+(o.v|0));
 const col=hC(hPick(HPAL.shell)),colW=hC(hPick(HPAL.shellWarm)),nac=hC(hPick(HPAL.nacre)),bone=hC(hPick(HPAL.bone)),teal=hC(hPick(HPAL.teal)),flo=hC(hPick(HPAL.floor)),poolC=hC(hPick(HPAL.teal),.85);
 const RO=34,WY=10.8,WH=13.4,WT=.45;   // the wall's radius, the wall-walk, the wall's top, its thickness
 const LOB={n:9,amp:.025};const lobF=th=>1+LOB.amp*Math.cos(LOB.n*th);
 const FR=Math.PI/2,GA=.12,WEST=Math.PI;   // the gate's bearing (+z) and the cutting's half-angle; the bridge door's bearing
 const ANG=HYK_AMPH_ANG;const TOW=[1,3,5,7].map(k=>k*Math.PI/4);
 // ---- the ring wall: a batter flaring into the rock up to the wall-walk, the gate, blind arcades; a nacre cornice at the
 // walk; above it the parapet (outer and inner faces, the cap, a lip) with open embrasures and the bridge door, gapped at
 // the back where the tribunal sits on the walk
 const wallL={H:WY+.6,yBase:-.6,cx:0,cz:0,rFn:y=>RO+1.8*Math.pow(clamp(1-y/4.5,0,1),2),lobes:LOB,flute:{n:54,amp:.01,sharp:1.3},rings:{n:4,amp:.012},noise:{amp:.006,su:6,sv:1.5,seed:41},nu:160,nv:12,col:colW};
 const gate=Object.assign(hykTideAt(wallL,FR,2.75+.6),{r:2.5,ky:1.1,kind:'door'});
 const arc=[];for(let i=0;i<24;i++){const th=i/24*TAU+TAU/48;if(Math.abs(ANG(th,FR))<.3||TOW.some(t=>Math.abs(ANG(th,t))<.2))continue;arc.push(Object.assign(hykTideAt(wallL,th,6.2+.6),{r:1.0,ky:1.45,kind:'window'}));}
 wallL.ops=[gate].concat(arc);hykPut('hkShell',hykLathe(wallL));for(const w of arc)hykWin(w,{depth:.9});
 hykDoor(gate,{level:'ground',nacre:true,depth:1.4,name:'the Citadel gate'});
 // the wall's inner face where the cutting bares it (the lathe is one-sided): over the gate, holed for it
 hykPut('hkShell',hykAmphBand(0,0,-.2,WY,th=>(RO-WT)*lobF(th),FR-GA,FR+GA,{col:colW,nu:12,nv:14,flip:true,hole:hykHoleOf([{p:[gate.p[0]-gate.n[0]*WT,gate.p[1],gate.p[2]-gate.n[2]*WT],r:gate.r,ky:gate.ky}])}));
 {const pts=[];for(let i=0;i<=160;i++){const a=i/160*TAU;const r=(RO+.12)*lobF(a);pts.push([r*Math.cos(a),WY,r*Math.sin(a)]);}hykPut('hkNacre',hykTube(pts,(u,i)=>.42*(1+.15*Math.max(0,Math.cos(i*1.3))),{seg:8,col:nac}));}
 const BA=.27,P0=-Math.PI/2+BA,P1=-Math.PI/2+TAU-BA;   // the parapet runs from P0 round the front to P1
 const rOut=th=>(RO-.08)*lobF(th),rIn=th=>(RO-WT)*lobF(th);const pAt=(th,y,r,ky)=>{const R=rOut(th);return {p:[R*Math.cos(th),y,R*Math.sin(th)],n:[Math.cos(th),0,Math.sin(th)],r,ky,kind:'window'};};
 const bridge=Object.assign(pAt(WEST,WY+1.25,1.15,1.05),{kind:'door'});
 const emb=[];for(let i=0;i<24;i++){const th=i/24*TAU+TAU/48;if(Math.abs(ANG(th,WEST))<.2||Math.abs(ANG(th,-Math.PI/2))<BA+.12||TOW.some(t=>Math.abs(ANG(th,t))<.14))continue;emb.push(pAt(th,WY+1.45,.42,1.35));}
 const holes=[bridge].concat(emb);const outHole=hykHoleOf(holes),inHole=hykHoleOf(holes.map(op=>({p:[op.p[0]-op.n[0]*(WT-.08),op.p[1],op.p[2]-op.n[2]*(WT-.08)],r:op.r,ky:op.ky})));
 hykPut('hkShell',hykAmphBand(0,0,WY,WH,rOut,P0,P1,{col:colW,nu:150,nv:4,hole:outHole}));
 hykPut('hkShell',hykAmphBand(0,0,WY,WH,rIn,P0,P1,{col:colW,nu:150,nv:4,flip:true,hole:inHole}));
 hykPut('hkShell',hykAmphAnnulus(0,0,WH,RO-WT,RO-.08,P0,P1,{col:colW,lob:LOB,nu:150,nv:1}));
 for(const a of [P0,P1])for(const f of [false,true])hykPut('hkShell',hykAmphRadWall(0,0,a,rIn(a),rOut(a),WY,WH,{col:colW,flip:f}));
 {const pts=[];for(let i=0;i<=150;i++){const a=P0+(P1-P0)*i/150;const r=(RO-WT*.5)*lobF(a);pts.push([r*Math.cos(a),WH+.08,r*Math.sin(a)]);}hykPut('hkNacre',hykTube(pts,(u,i)=>.3*(1+.18*Math.max(0,Math.cos(i*1.3))),{seg:7,col:nac}));}
 for(const w of emb)hykWin(w,{open:true,depth:WT+.1});hykDoor(bridge,{level:'L1',nacre:true,depth:WT+.1,name:'the bridge door'});
 // ---- the terraces: k = 0 is the wall-walk; each 3 m deep and 1.6 m below the last; the arena floor at +1.2
 const TW=3.0,TH=1.6,NT=6,FY=1.2;const ty=k=>WY-k*TH,tOut=k=>RO-WT-k*TW,tIn=k=>tOut(k)-TW;const RA=tIn(NT-1);
 for(let k=0;k<NT;k++){const c=k%2?col:colW;
  hykPut('hkShell',hykAmphAnnulus(0,0,ty(k),tIn(k),tOut(k)+(k?0:.02),FR+GA,FR-GA+TAU,{col:c,lob:LOB,nu:150,nv:2}));
  hykPut('hkShell',hykAmphBand(0,0,k<NT-1?ty(k+1):FY,ty(k),th=>tIn(k)*lobF(th),FR+GA,FR-GA+TAU,{col:colW,nu:140,nv:2,flip:true}));
  for(const s of [-1,1])for(const f of [false,true])hykPut('hkShell',hykAmphRadWall(0,0,FR+s*GA,tIn(k)*lobF(FR+s*GA),tOut(k)*lobF(FR+s*GA),FY,ty(k),{col:colW,flip:f}));}
 // the gate's cutting: a ramp from the ground outside to the arena floor, a nacre kerb either side
 hykPut('hkFloor',hykAmphAnnulus(0,0,0,RA-.05,RO+2.2,FR-GA-.01,FR+GA+.01,{col:flo,nu:6,nv:8,yFn:(u,v)=>FY*clamp(1-(v*(RO+2.25-RA)-.05)/(RO-RA),0,1)}));
 for(const s of [-1,1]){const a=FR+s*(GA-.006);const pts=[];for(let i=0;i<=8;i++){const r=RA+(RO-RA)*i/8;pts.push([r*Math.cos(a),FY*(1-i/8)+.12,r*Math.sin(a)]);}hykPut('hkNacre',hykTube(pts,()=>.16,{seg:6,col:nac}));}
 // ---- the arena: the sand floor, the ringed pool in its middle (mosaic basin, a nacre rimstone lip, the water a hand down)
 const PR=7.5;hykPut('hkFloor',hykAmphAnnulus(0,0,FY,PR,RA+.05,0,TAU,{col:flo,lob:LOB,nu:120,nv:3}));
 hykPut('hkMosaic',hykDisc(0,FY-.75,0,PR,{col:poolC,nu:48}));hykPut('hkMosaic',hykAmphBand(0,0,FY-.75,FY+.02,()=>PR,0,TAU,{col:poolC,nu:64,nv:2,flip:true}));
 {const pts=[];for(let i=0;i<=64;i++){const a=i/64*TAU;pts.push([(PR+.1)*Math.cos(a),FY+.08,(PR+.1)*Math.sin(a)]);}hykPut('hkNacre',hykTube(pts,(u,i)=>.26*(1+.25*Math.max(0,Math.cos(i*1.9))),{seg:7,col:nac}));}
 hykAmphWater(G,[hykDisc(0,FY-.24,0,PR,{col:teal,nu:48})]);
 kput('hkBall',[0,FY-.5,0],null,[1.3,1.0,1.3],nac);   // the pearl stone in the pool
 // ---- the flights: up every terrace at the east and the west, treads against each riser, landing on the terrace above
 const flights=[0,Math.PI];
 for(const th of flights){const ux=Math.cos(th),uz=Math.sin(th);const q=qEuler(0,Math.atan2(ux,uz),0);
  for(let k=0;k<NT;k++){const y0=k<NT-1?ty(k+1):FY,nT=Math.round(TH/.2)-1;
   for(let i=0;i<nT;i++){const top=y0+.2*(i+1),r=tIn(k)-.32*(nT-i)+.16;kput('hkTread',[r*ux,(y0+top)/2,r*uz],q,[2.0,top-y0,.32],bone);}}}
 // ---- the towers: urchin spires on the diagonals, standing against the wall, rooted with a flare, slit-lit near the top
 const TR=4.6,TH0=31;for(const a of TOW){const cx=(RO+TR*.7)*Math.cos(a),cz=(RO+TR*.7)*Math.sin(a);
  const tl={H:TH0,yBase:-.6,cx,cz,rFn:y=>TR*Math.pow(Math.max(0,1-y/TH0),.72)+.3+1.2*Math.pow(clamp(1-y/3,0,1),2),flute:{n:9,amp:.12,sharp:1.3},twist:.7,rings:{n:6,amp:.02},noise:{amp:.02,su:4,sv:2,seed:(a*10|0)+50},nu:54,nv:30,col};
  const tw=[0,1,2].map(i=>{const t=hykTideAt(tl,a+(i-1)*.9,17+i*2.6);return Object.assign(t,{r:.36,ky:1.6,kind:'window'});});tl.ops=tw;
  hykPut('hkShell',hykLathe(tl));for(const w of tw)hykWin(w,{lit:true,depth:.5});
  kput('hkBall',[cx,TH0-.4,cz],null,[.55,.7,.55],nac);}
 // ---- the tribunal: a bastion drum on the back of the ring, the nacre pod on it opening onto the wall-walk and the
 // arena, the crown spire; its room (the Archon's seat, the table of the council, the tide niche)
 const BR=9.5,P={a:12.5,b:10.5,c:8.0,e1:.85,e2:.9,nu:72,nv:34,noise:{amp:.02,su:4,sv:3,seed:45},col:nac,hollow:{t:.09,col:hC(hPick(HPAL.shell),.9)}};P.cy=P.b*.8;const HZ=-(RO+P.c-1.6),BZ=HZ;   // the pod's door lands on the wall-walk
 hykPut('hkShell',hykLathe({H:WY+.6,yBase:-.6,cx:0,cz:BZ,rFn:y=>BR+1.6*Math.pow(clamp(1-y/4,0,1),2)+.4*Math.sin(Math.PI*y/(WY+.6)),flute:{n:22,amp:.02,sharp:1.2},rings:{n:5,amp:.02},noise:{amp:.02,su:5,sv:2,seed:44},nu:72,nv:10,col:colW}));
 hykPut('hkShell',hykDisc(0,WY,BZ,BR+.2,{col:colW,nu:56}));
 const dEl=hykCitPodEl(P,.12+2.8*1.25);P.openings=[{th:0,el:dEl,r:2.8,ky:1.25,kind:'door'}];
 for(let i=0;i<8;i++){const th=(i+.5)/8*TAU;if(Math.abs(ANG(th,0))<.5)continue;P.openings.push({th,el:.32,r:.8,ky:1.3,kind:'window'});}
 P.openings.push({th:Math.PI,el:.95,r:1.1,ky:1,kind:'window'});
 const pod=hykPod(P);pod.geo.translate(0,WY,HZ);hykPut('hkNacre',pod.geo);if(pod.inner){pod.inner.translate(0,WY,HZ);hykPut('hkIn',pod.inner,true);}
 for(const op of pod.openings){op.p=[op.p[0],op.p[1]+WY,op.p[2]+HZ];if(op.kind==='door')hykDoor(op,{level:'L1',nacre:true,depth:.9,name:"the Archon's tribunal"});else hykWin(op,{nacre:true,lit:true});}
 const podR=y=>{const s=Math.min(.999,Math.abs((y-P.cy)/P.b));const cp=Math.sqrt(Math.max(0,1-Math.pow(s,2/P.e1)));return Math.pow(cp,P.e1);};
 hykPut('hkNacre',hykFlare([0,WY+.02,HZ],[0,1,0],P.c*podR(0)*.97,1.4,{col:nac}));hykFloor(0,HZ,WY+.06,P.c*podR(0)-.2,{col:flo});
 const SY=WY+P.cy+P.b*.97;hykPut('hkNacre',hykLathe({H:18,yBase:SY-1.2,cx:0,cz:HZ,rFn:y=>2.6*Math.pow(Math.max(0,1-y/18),.8)+.12,flute:{n:7,amp:.14,sharp:1.3},twist:.9,rings:{n:8,amp:.02},nu:28,nv:20,col:nac}));
 kput('hkLipN',[0,SY-.4,HZ],qEuler(Math.PI/2,0,0),[2.9,2.9,1.2],nac);
 const fr=P.c*podR(0)-.6,fx=P.a*podR(0)-.8;const poly=[];for(let i=0;i<18;i++){const t=i/18*TAU;poly.push([fx*Math.cos(t),HZ+fr*Math.sin(t)]);}   // the floor's ellipse, a pace in
 const hall=hykRoom('hall',poly,WY+.06,7.5,{doors:[[0,HZ+P.c*.93,5.6,'street']],wealth:1});
 hykSpot(hall,'seat',0,HZ-3.3,0,1.2,1.0);hykSpot(hall,'table',0,HZ-.6,0,2.4,1.1);hykSpot(hall,'shrine',-4.3,HZ-2.4,Math.PI/2,.7,.5);hykSpot(hall,'seat',4.1,HZ-2.0,-Math.PI/2,1.0,.9);
 // ---- the bridge head: a pad outside the bridge door, a rail round it open to the door and the span
 const bp=hykAmphPad((RO+3.4)*Math.cos(WEST),WY,(RO+3.4)*Math.sin(WEST),3.2,{col,own:'Citadel bridge head'});
 hykAmphRail(bp.x,WY,bp.z,3.0,[[0,.6],[Math.PI,.6]],{col:bone});
 // ---- lamps (civic: lit): either side of the gate, posts round the wall-walk, the tribunal's door, the pool
 for(const s of [-1,1]){const an=hykTideAt(wallL,FR+s*.11,4.6+.6);hykLight(an.p[0]+an.n[0]*.45,an.p[1]+.1,an.p[2]+an.n[2]*.45,{r:.24,nacre:true,level:'ground',bracket:an.p});}
 for(let i=0;i<10;i++){const a=i/10*TAU+.31;if(Math.abs(ANG(a,-Math.PI/2))<.4||Math.abs(ANG(a,WEST))<.15)continue;const r=tIn(0)+.6;hykAmphLampPost(r*Math.cos(a),WY,r*Math.sin(a),{level:'L1'});}
 for(const s of [-1,1]){const q=pod.surf(((s*.42/TAU)%1+1)%1,clamp((dEl+.12)/Math.PI+.5,.02,.98));const p=[q[0],q[1]+WY,q[2]+HZ];const n=[q[0],q[1]-P.cy,q[2]];const l=Math.hypot(n[0],n[1],n[2])||1;hykLight(p[0]+n[0]/l*.45,p[1]+.1,p[2]+n[2]/l*.45,{r:.22,nacre:true,level:'L1',bracket:p});}
 for(let i=0;i<4;i++){const a=i/4*TAU+Math.PI/4;hykAmphLampPost((PR+1.2)*Math.cos(a),FY,(PR+1.2)*Math.sin(a),{cool:true,bare:true,level:'ground'});}
 hykReg("The Archon's Citadel",0,-4,48,48,{landmark:true});}
HYK.def({key:'hyk_citadel',name:"The Archon's Citadel",family:'civic',row:'Civic',w:84,d:92,h:62,r:48,cls:'landmark',inside:true,tags:{type:['civic','military'],wealth:'civic',lit:true,landmark:true},build:buildHykCitadel});
