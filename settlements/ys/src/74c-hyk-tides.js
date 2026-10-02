// ================================================================= HYKKOUSOI — the Temple of the Tides (landmark B)
// A vaulted hall of fourteen parabolic bone-ribs with the shell stretched between them, on a mosaic plinth; the great
// pearl (a nacre sphere) held in the vault by four ribs that spring from the floor round the tide basin; the sea let
// in through a wet door at the back and a channel into the basin; galleries round the basin at floor level and along
// the flanks at +6, with rails and the stairs that reach them; a lantern of lenses on the oculus; a shrine pod grown
// onto the back-left flank; two barnacle chapels on the flanks. Local frame, +z the front. Seeds 30650–30664.
// Shared by the three agent-E builders (74c, 74d, 74e): hykTideStair, hykTideRail, hykTideAng.
// the shortest signed angle from a to b
function hykTideAng(a,b){return Math.atan2(Math.sin(b-a),Math.cos(b-a));}
// a point and outward normal on a lathe at azimuth th and height y, ON the modulated surface: hykLatheAt reads the bare
// profile, so on a lobed, fluted or ringed shell its point sits off the skin (a crest 5 % proud, a trough 5 % sunk) and
// the lip floats. This scales the point by the lathe's lobe, flute and ring factors (the noise is left out: ±1 %).
function hykTideAt(L,th,y){const q=hykLatheAt(L,th,y);let k=1;
 if(L.lobes)k*=1+L.lobes.amp*Math.cos(L.lobes.n*th+(L.lobes.ph||0));
 if(L.flute)k*=1+L.flute.amp*Math.pow(.5+.5*Math.cos(L.flute.n*th+(L.twist||0)*y),L.flute.sharp||2);
 if(L.rings)k*=1+L.rings.amp*Math.sin(y/L.H*L.rings.n*TAU);
 const cx=L.cx||0,cz=L.cz||0;q.p=[cx+(q.p[0]-cx)*k,q.p[1],cz+(q.p[2]-cz)*k];return q;}
// a straight flight: treads from the lower end a to the upper end b (local points), w wide, rise .19, run from the
// length; a rail tube on posts along o.rails ('both' | 'left' | 'right', seen climbing). o.inside puts the rail in
// the interior bucket.
function hykTideStair(a,b,w,o){o=o||{};const col=o.col||hC(hPick(HPAL.bone));const dy=b[1]-a[1];const n=Math.max(1,Math.round(dy/.19));const dx=b[0]-a[0],dz=b[2]-a[2];const L=Math.hypot(dx,dz)||1;const run=L/n;const yaw=Math.atan2(dx,dz);
 const sx=-dz/L,sz=dx/L;   // the right-hand side seen climbing
 for(let i=1;i<=n;i++){const t=(i-.5)/n;kput('hkTread',[a[0]+dx*t,a[1]+i*(dy/n)-.06,a[2]+dz*t],qEuler(0,yaw,0),[w,.12,run*1.12],col);}
 // the mass under the flight: a soffit ribbon just under the treads and a cheek down each side, so the steps stand on
 // something (o.solid); the cheeks reach half a metre below the foot
 if(o.solid){const g=o.solidCol||hC(hPick(HPAL.shell));hykPut('hkShell',hykDeck([[a[0],a[1]-.02,a[2]],[b[0],b[1]-.14,b[2]]],w,{col:g,nv:1}),o.inside);
  for(const s of [1,-1]){const ox=sx*s*w*.5,oz=sz*s*w*.5;hykPut('hkShell',hykSurf((u,v)=>{const yT=a[1]-.02+(b[1]-.14-a[1]+.02)*u;return [a[0]+dx*u+ox,a[1]-.5+(yT-a[1]+.5)*v,a[2]+dz*u+oz];},6,2,{col:g,flip:s>0}),o.inside);}}
 const sides=o.rails==='both'?[1,-1]:o.rails==='right'?[1]:o.rails==='left'?[-1]:[];
 for(const s of sides){const ox=sx*s*w*.48,oz=sz*s*w*.48;const pts=[];const m=Math.max(2,Math.round(L/1.5));
  for(let i=0;i<=m;i++){const t=i/m;pts.push([a[0]+dx*t+ox,a[1]+dy*t+.98,a[2]+dz*t+oz]);}
  hykPut('hkBone',hykTube(pts,()=>.07,{seg:6,col}),o.inside);
  for(let i=0;i<=m;i+=2){const t=i/m;kput('hkPost',[a[0]+dx*t+ox,a[1]+dy*t+.49,a[2]+dz*t+oz],null,[.06,.98,.06],col);}}}
// a rail round an arc: a bone tube at radius r about (cx,cz) from azimuth a0 to a1 at height y (the hand), posts every
// 1.3 m; o.gaps = [[g0,g1],...] azimuths left open (in the same range as a0..a1); o.inside for the interior bucket
function hykTideRail(cx,cz,r,y,a0,a1,o){o=o||{};const col=o.col||hC(hPick(HPAL.bone));const gaps=o.gaps||[];const inGap=a=>gaps.some(g=>a>g[0]&&a<g[1]);const rA=typeof r==='function'?r:()=>r;
 const n=Math.max(4,Math.round(Math.abs(a1-a0)*rA(a0)/1.3));let seg=[];const flush=()=>{if(seg.length>1)hykPut('hkBone',hykTube(seg,()=>.07,{seg:6,col}),o.inside);seg=[];};
 for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n;const r1=rA(a);const p=[cx+r1*Math.cos(a),y,cz+r1*Math.sin(a)];if(inGap(a)){flush();continue;}seg.push(p);if(i%2===0)kput('hkPost',[p[0],y-.57,p[2]],null,[.06,1.15,.06],col);}flush();}
// a helical flight about (cx,cz): treads w wide centred at radius rAt(y), from y0 up to y1, starting at azimuth a0 and
// turning `dir`; a rail tube on posts along the open side (o.rail 'in' toward the axis, 'out' away from it). Returns
// {a1,y1}: the azimuth and height of the arrival. o.inside for the interior bucket.
function hykTideHelix(cx,cz,rAt,y0,y1,a0,dir,w,o){o=o||{};const col=o.col||hC(hPick(HPAL.bone));const rise=.19,run=.64;const n=Math.max(1,Math.round((y1-y0)/rise));const rail=[];let a=a0,y=y0;
 for(let i=1;i<=n;i++){const yi=y0+i*rise;const r=rAt(yi);a+=dir*run/r;kput('hkTread',[cx+r*Math.cos(a),yi-.06,cz+r*Math.sin(a)],qEuler(0,-a,0),[w,.12,run*1.1],col);
  const ro=r+(o.rail==='out'?1:-1)*(w/2+.08);rail.push([cx+ro*Math.cos(a),yi+.95,cz+ro*Math.sin(a)]);if(i%6===1)kput('hkPost',[cx+ro*Math.cos(a),yi+.45,cz+ro*Math.sin(a)],null,[.05,.95,.05],col);}
 if(rail.length>2&&o.rail)hykPut('hkBone',hykTube(rail,()=>.07,{seg:6,col}),o.inside);return {a1:a,y1:y0+n*rise};}
// ---------------------------------------------------------------- the temple
function buildHykTempleTides(G,o){reseed(30650+(o.v|0));
 const PL=2.4,R0=23,HD=30,RB=9,NL=14,AY=PL+HD;   // plinth top, dome base radius, dome height, basin radius, ribs (lobes), apex
 const cShell=hC(hPick(HPAL.shell)),cBone=hC(hPick(HPAL.bone)),cNac=hC(hPick(HPAL.nacre)),cFloor=hC(hPick(HPAL.floor)),cIn=hC(hPick(HPAL.shell),.86),cTeal=hC(hPick(HPAL.teal)),cCrust=hC(hPick(HPAL.crust)),cLens=hC(hPick(HPAL.lens));
 const prof=y=>R0*Math.pow(Math.max(0,1-Math.pow(Math.max(0,y)/HD,1.7)),.55)+.15;   // the vault: parabolic, vertical at the springing
 const D={H:HD,yBase:PL,rFn:prof,nu:224,nv:72,lobes:{n:NL,amp:.055},rings:{n:9,amp:.012},noise:{amp:.012,su:5,sv:3,seed:7},col:cShell};
 const P={H:PL,yBase:0,rFn:y=>R0+1.6-1.0*(y/PL),nu:224,nv:6,lobes:{n:NL,amp:.055},col:(u,v)=>v<.28?cCrust:cTeal};   // the plinth: scale mosaic over a tide crust
 const at=(L,th,y)=>hykTideAt(L,th,y);const lob=th=>1+.055*Math.cos(NL*th);
 // ---- the openings on the dome (3D points: the plinth and the inner skin share them)
 const arch=at(D,Math.PI/2,5.0);arch.r=4.8;arch.ky=1.05;                     // the mouth, framed by the two front ribs: 9.6 wide, 10 tall, its foot on the plinth
 const ocu=at(D,Math.PI/2,16.5);ocu.r=3.6;ocu.ky=1;                          // the oculus above the mouth: the pearl shows through it
 const apex={p:[0,AY,0],n:[0,1,0],r:4.3,ky:1};                               // the top, for the lantern
 const wet=at(P,-Math.PI/2,1.9);wet.r=1.65;wet.ky=1.2;                       // the wet door in the plinth's back, sill at the ground
 const shrD=at(D,-3*Math.PI/4,1.6);shrD.r=1.2;shrD.ky=1.3;                   // the door into the shrine pod
 const wins=[];for(let k=0;k<NL;k++){const th=(k+.5)*TAU/NL;if(Math.abs(hykTideAng(th,Math.PI/2))<.5||Math.abs(hykTideAng(th,-Math.PI/2))<.5)continue;
  const w1=at(D,th,12);w1.r=1.35;w1.ky=1.25;wins.push(w1);const w2=at(D,th,20);w2.r=1.0;w2.ky=1.0;wins.push(w2);}
 D.ops=[arch,ocu,apex,wet,shrD].concat(wins);P.ops=[wet];
 hykPut('hkShell',hykLathe(D));hykPut('hkMosaic',hykLathe(P));
 const inward=ops=>ops.map(op=>{const t=.06*Math.hypot(op.p[0],op.p[2]);return {p:[op.p[0]-op.n[0]*t,op.p[1]-op.n[1]*t,op.p[2]-op.n[2]*t],r:op.r,ky:op.ky};});
 hykPut('hkIn',hykLathe(Object.assign({},D,{rFn:y=>prof(y)*.94,flip:true,col:cIn,nu:200,nv:64,ops:inward(D.ops)})),true);
 hykPut('hkShell',hykSurf((u,v)=>{const th=u*TAU;const r=(R0-.4+v*1.2)*lob(th);return [r*Math.cos(th),PL+.01,r*Math.sin(th)];},224,2,{col:cTeal,flip:true,hole:(u,v,p)=>Math.abs(p[0])<2.2&&p[2]<-R0*.8}));   // the plinth's ledge, open over the channel
 // ---- the ribs: along the crests outside and inside, thick at the springing, knuckled, a ball at the foot
 const ribPts=(th,inner)=>{const pts=[];for(let i=0;i<=26;i++){const y=i/26*(HD-2.0);const r=prof(y)*1.055*(inner?.94:1)+(inner?-.3:.3);pts.push([r*Math.cos(th),PL+y,r*Math.sin(th)]);}return pts;};
 for(let k=0;k<NL;k++){const th=k*TAU/NL;
  hykPut('hkBone',hykTube(ribPts(th),t=>(1.05-.6*t)*(1+.18*Math.max(0,Math.cos(t*7*TAU))),{seg:10,col:cBone}));
  hykPut('hkBone',hykTube(ribPts(th,true),t=>(.8-.45*t)*(1+.18*Math.max(0,Math.cos(t*7*TAU))),{seg:8,col:cBone}),true);
  const r0=prof(0)*1.055+.3;kput('hkBall',[r0*Math.cos(th),PL+.45,r0*Math.sin(th)],null,[1.35,1.0,1.35],cBone);
  const r1=prof(0)*.94*1.055-.3;kput('hkBall',[r1*Math.cos(th),PL+.4,r1*Math.sin(th)],null,[1.1,.9,1.1],cBone);}
 // ---- the mouth and the oculus: nacre lips and reveals, then the porch screen with the three doors
 hykWin(arch,{nacre:true,open:true,depth:1.3});hykWin(ocu,{nacre:true,open:true,depth:1.1});
 for(const w of wins)hykWin(w,{nacre:true,lit:true,depth:.06*Math.hypot(w.p[0],w.p[2])+.2});   // the reveal fills the wall's thickness, the lit pane sits in the inner skin
 const scrR=y=>prof(y-PL)*.925;   // inside the wall at the front trough (the skin there is at .945, the inner skin at .89)
 const doors=[{th:Math.PI/2,y:PL+1.6,r:1.15,ky:1.3},{th:Math.PI/2+.15,y:PL+1.45,r:1.0,ky:1.25},{th:Math.PI/2-.15,y:PL+1.45,r:1.0,ky:1.25}].map(d=>{const r=scrR(d.y);return {p:[r*Math.cos(d.th),d.y,r*Math.sin(d.th)],n:[Math.cos(d.th),0,Math.sin(d.th)],r:d.r,ky:d.ky};});
 const scrHole=(u,v,p)=>{const dx=p[0]-arch.p[0],dy=(p[1]-arch.p[1])/arch.ky,dz=p[2]-arch.p[2];if(dx*dx+dy*dy+dz*dz>(arch.r+1.1)*(arch.r+1.1))return true;
  for(const d of doors){const ex=p[0]-d.p[0],ey=(p[1]-d.p[1])/d.ky,ez=p[2]-d.p[2];if(ex*ex+ey*ey+ez*ez<d.r*d.r*1.05)return true;}return false;};
 const scr=(k,flip)=>hykSurf((u,v)=>{const th=Math.PI/2+(u-.5)*.62;const y=v*11.5;const r=prof(y)*k;return [r*Math.cos(th),PL+y,r*Math.sin(th)];},44,34,{col:cNac,hole:scrHole,flip});
 hykPut('hkNacre',scr(.925));hykPut('hkIn',scr(.915,true),true);
 for(const d of doors)hykDoor(d,{level:'ground',nacre:true,depth:1.1});
 // ---- the floor, the basin, the water, the channel out to the wet door
 const RF=prof(0)*.94;   // the inner skin's nominal radius: the floor follows the lobes a hand into it
 hykPut('hkFloor',hykSurf((u,v)=>{const th=u*TAU;const r=RB+.25+v*(RF*lob(th)+.3-RB-.25);return [r*Math.cos(th),PL+.02,r*Math.sin(th)];},112,6,{col:cFloor,flip:true,hole:(u,v,p)=>Math.abs(p[0])<1.9&&p[2]<-RB*.6}),true);
 hykPut('hkIn',hykLathe({H:PL,yBase:0,rFn:y=>RB+.25*(y/PL),nu:96,nv:5,col:hC(hPick(HPAL.shell),.8),flip:true,ops:[{p:[0,1.2,-RB],r:2.0,ky:1}]}),true);   // the basin wall, open at the back for the channel
 hykPut('hkFloor',hykDisc(0,.02,0,RB+.1,{col:hC(hPick(HPAL.teal),.5),nu:64}),true);
 hykPut('hkLens',hykDisc(0,1.0,0,RB+.2,{nu:64}),true);                                                          // the tide, a metre deep
 kput('hkLipN',[0,PL+.03,0],qEuler(Math.PI/2,0,0),[RB+.3,RB+.3,1.4],cNac);                                      // the basin's rim
 const zc0=-RB+1.0,zc1=-(R0+.3),CW=1.7;   // the channel runs from the basin through the plinth to the wet door's reveal, no further: outside, the sea is the channel
 hykPut('hkFloor',hykSurf((u,v)=>[(v-.5)*CW*2,.02,zc0+u*(zc1-zc0)],12,2,{col:hC(hPick(HPAL.teal),.5)}),true);
 hykPut('hkIn',hykSurf((u,v)=>[-CW,v*(PL+.05),zc0+u*(zc1-zc0)],12,3,{col:hC(hPick(HPAL.shell),.8),flip:true}),true);
 hykPut('hkIn',hykSurf((u,v)=>[CW,v*(PL+.05),zc0+u*(zc1-zc0)],12,3,{col:hC(hPick(HPAL.shell),.8)}),true);
 hykPut('hkLens',hykSurf((u,v)=>[(v-.5)*CW*2,1.0,zc0+u*(zc1-zc0)],12,2,{}),true);
 for(const s of [-1,1])hykPut('hkBone',hykTube([[s*CW,PL+.06,zc0+.3],[s*CW,PL+.06,-R0*.95]],()=>.12,{seg:6,col:cBone}),true);   // the channel's curbs
 hykOpening(wet,{kind:'wetdoor',level:'wet',nacre:true,depth:2.4,name:'tide channel'});
 // the basin's gallery rail and the steps down into the tide at the front
 hykTideRail(0,0,RB+1.3,PL+1.15,0,TAU,{col:cBone,gaps:[[Math.PI/2-.27,Math.PI/2+.27],[1.5*Math.PI-.2,1.5*Math.PI+.2]],inside:true});
 hykTideStair([0,.0,RB-3.9],[0,PL,RB+.4],4.0,{col:cBone,rails:'both',inside:true,solid:true,solidCol:cFloor});
 // ---- the pearl, held in the vault by four ribs from the floor and three from the vault
 const PC=[0,PL+20,0],RP=5.5;
 hykPut('hkNacre',hykLathe({H:RP*2,yBase:PC[1]-RP,rFn:y=>Math.sqrt(Math.max(0,RP*RP-(y-RP)*(y-RP)))+.02,nu:72,nv:36,noise:{amp:.006,su:6,sv:4,seed:3},col:cNac}),true);
 const toPearl=(A,rise,r0)=>{const d=[PC[0]-A[0],PC[1]-A[1],PC[2]-A[2]];const L=Math.hypot(d[0],d[1],d[2]);const u=d.map(x=>x/L);
  hykPut('hkBone',hykRib(A,[PC[0]-u[0]*RP*.7,PC[1]-u[1]*RP*.7,PC[2]-u[2]*RP*.7],{rise,r0,r1:r0*.5,knuckles:5,n:24,seg:10,col:cBone}),true);
  kput('hkBall',[PC[0]-u[0]*RP*1.0,PC[1]-u[1]*RP*1.0,PC[2]-u[2]*RP*1.0],null,[r0*1.6,r0*1.4,r0*1.6],cBone);};
 for(let k=0;k<4;k++){const a=Math.PI/4+k*Math.PI/2;const A=[Math.cos(a)*(RB+2.6),PL,Math.sin(a)*(RB+2.6)];toPearl(A,4.5,1.1);
  hykPut('hkBone',hykFlare([A[0],PL+.02,A[2]],[0,1,0],1.1,1.3,{col:cBone}),true);kput('hkBall',[A[0],PL+.55,A[2]],null,[1.5,1.25,1.5],cBone);}
 for(const th of [-Math.PI/2,-Math.PI/2+1.1,-Math.PI/2-1.1]){const q=at(D,th,15);const r=prof(15)*.94-.2;toPearl([r*Math.cos(th),PL+15,r*Math.sin(th)],-1.6,.75);}
 hykLight(0,PC[1]-RP-.75,0,{r:.5,nacre:true,bracket:[0,PC[1]-RP+.25,0]});                                       // the pearl's own glow, hung under it
 // ---- the lantern of lenses on the oculus
 const LY=AY-.6,LR=4.4;const LL={H:3.6,yBase:LY,rFn:y=>LR*(1+.05*Math.sin(y*1.8)),nu:64,nv:12,rings:{n:3,amp:.02},col:cNac};
 const lops=[];for(let i=0;i<8;i++){const q=at(LL,i/8*TAU+Math.PI/8,1.9);q.r=1.0;q.ky=1;lops.push(q);}LL.ops=lops;
 hykPut('hkNacre',hykLathe(LL));hykPut('hkIn',hykLathe(Object.assign({},LL,{rFn:y=>LL.rFn(y)*.9,flip:true,col:cIn,ops:inward(lops)})),true);
 for(const op of lops){hykWin(op,{nacre:true,open:true,depth:.7});kput('hkLens',[op.p[0]-op.n[0]*.22,op.p[1],op.p[2]-op.n[2]*.22],qFacing(op.n),[op.r*.9,op.r*.9,.45],cLens);}
 kput('hkLipN',[0,LY+.02,0],qEuler(Math.PI/2,0,0),[LR*1.06,LR*1.06,1.3],cNac);
 const CY=LY+3.5,CH=2.8;const cap=y=>LR*Math.sqrt(Math.max(0,1-Math.pow(y/CH,2.2)))+.05;
 hykPut('hkNacre',hykLathe({H:CH,yBase:CY,rFn:cap,nu:48,nv:14,col:cNac}));hykPut('hkIn',hykLathe({H:CH,yBase:CY-.05,rFn:y=>cap(y)*.92,nu:48,nv:14,col:cIn,flip:true}),true);
 for(let ring=0;ring<2;ring++){const n=ring?6:12,y=ring?1.7:.8;const r=cap(y);for(let i=0;i<n;i++){const a=i/n*TAU+ring*.26;kput('hkLens',[r*Math.cos(a)*.97,CY+y,r*Math.sin(a)*.97],null,ring?.38:.46,cLens);}}
 hykPut('hkNacre',hykLathe({H:5.5,yBase:CY+CH-.5,rFn:y=>.85*Math.pow(1-y/5.5,.8)+.04,nu:16,nv:10,flute:{n:7,amp:.14,sharp:1.3},twist:.8,col:cNac}));
 // ---- the flank galleries at +6.2: a ribbon deck along each side, a rail on the inner edge, ribs from the floor, a stair at the back end
 const GY=PL+6.2,rg=prof(6.2)*.94-1.6;
 for(const side of [0,Math.PI]){const a0=side-1.1,a1=side+1.1;const pts=[];const n=22;
  for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n;pts.push([rg*Math.cos(a),GY,rg*Math.sin(a)]);}
  hykPut('hkShell',hykDeck(pts,3.0,{col:cFloor,camber:.05}),true);hykPut('hkShell',hykDeck(pts.map(p=>[p[0],p[1]-.45,p[2]]),2.8,{col:cShell,flip:false}),true);
  hykPut('hkBone',hykTube(pts.map(p=>[p[0]*(rg-1.45)/rg,p[1]-.25,p[2]*(rg-1.45)/rg]),t=>.3*(1+.2*Math.max(0,Math.cos(t*9*TAU))),{seg:8,col:cBone}),true);   // the edge rib
  hykTideRail(0,0,rg-1.4,GY+1.15,a0,a1,{col:cBone,inside:true});
  for(let k=0;k<=5;k++){const a=a0+(a1-a0)*k/5;if(Math.abs(hykTideAng(a,-3*Math.PI/4))<.3)continue;   // the shrine door passes under the left gallery
   const A=[(rg+1.3)*Math.cos(a),PL,(rg+1.3)*Math.sin(a)],B=[(rg-1.2)*Math.cos(a),GY-.5,(rg-1.2)*Math.sin(a)];
   hykPut('hkBone',hykRib(A,B,{rise:1.1,r0:.5,r1:.3,knuckles:3,n:12,seg:8,col:cBone}),true);kput('hkBall',[A[0],PL+.3,A[2]],null,[.75,.6,.75],cBone);}
  const ab=side===0?a0:a1,af=side===0?a1:a0,sgn=side===0?-1:1;   // the back end of the arc, and the front end
  const top=[rg*Math.cos(ab),GY,rg*Math.sin(ab)],bot=[16.2*Math.cos(ab+sgn*.25),PL,16.2*Math.sin(ab+sgn*.25)];   // the stair down from the back end, landing clear of the channel
  hykTideStair(bot,top,1.5,{col:cBone,rails:'both',inside:true,solid:true,solidCol:cFloor});
  const e=[rg*Math.cos(af),GY,rg*Math.sin(af)];hykPut('hkBone',hykTube([[e[0]*(rg-1.4)/rg,GY+1.15,e[2]*(rg-1.4)/rg],[e[0]*(rg+1.3)/rg,GY+1.15,e[2]*(rg+1.3)/rg]],()=>.07,{seg:6,col:cBone}),true);}   // the front end is closed
 // ---- the shrine pod on the back-left flank, its door through the dome's wall
 const sa=-3*Math.PI/4;const SC=[(R0+2.2)*Math.cos(sa),(R0+2.2)*Math.sin(sa)];const SR=6.6,SB=5.6,scy=PL+SB*.52;
 const toD=Math.atan2(-SC[0],-SC[1]),tdo=toD+Math.PI;   // pod azimuths (from +z toward +x): toward the hall's door, and outward
 const sp=hykPod({a:SR,b:SB,c:SR,e1:.9,e2:.94,cy:scy,nu:56,nv:30,noise:{amp:.02,su:4,sv:3,seed:5},col:cNac,hollow:{t:.07,col:cIn},
  openings:[{th:toD,el:-.22,r:1.2,ky:1.3,kind:'door'},{th:tdo+.95,el:.3,r:.6,kind:'window'},{th:tdo-.95,el:.3,r:.6,kind:'window'},{th:tdo+.2,el:.9,r:.5,kind:'window'}]});
 sp.geo.translate(SC[0],0,SC[1]);hykPut('hkNacre',sp.geo);sp.inner.translate(SC[0],0,SC[1]);hykPut('hkIn',sp.inner,true);
 for(const op of sp.openings){op.p=[op.p[0]+SC[0],op.p[1],op.p[2]+SC[1]];if(op.kind==='window')hykWin(op,{nacre:true,lit:true});else kput('hkReveal',[op.p[0]-op.n[0]*.3,op.p[1],op.p[2]-op.n[2]*.3],new THREE.Quaternion().setFromUnitVectors(_UP,new THREE.Vector3(op.n[0],op.n[1],op.n[2]).normalize()),[op.r*.985,1.0,op.r*.985*op.ky],null);}
 hykDoor(shrD,{level:'ground',nacre:true,depth:3.4,name:'shrine'});
 hykPut('hkNacre',hykFlare([SC[0],.02,SC[1]],[0,1,0],SR*.9,2.4,{col:cNac}));hykPut('hkNacre',hykFlare([shrD.p[0]+shrD.n[0]*.2,scy,shrD.p[2]+shrD.n[2]*.2],[shrD.n[0],0,shrD.n[2]],4.2,2.2,{col:cNac}));
 hykFloor(SC[0],SC[1],PL+.02,SR*.9,{col:cFloor});
 hykPut('hkNacre',hykLathe({H:2.6,cx:SC[0],cz:SC[1],yBase:scy+SB-.5,rFn:y=>.5*Math.pow(1-y/2.6,.8)+.03,nu:14,nv:8,flute:{n:7,amp:.14,sharp:1.3},twist:1.0,col:cNac}));
 // ---- the chapels: two barnacle domes grown onto the flanks, rooted in the ground and in the dome
 for(const s of [-1,1]){const cx=s*(R0+3.0),cz=-1.5,rb=7.4,hh=11.5;const col=hC(hPick(HPAL.shellWarm));
  const C={H:hh,cx,cz,yBase:-.3,rFn:y=>rb*Math.pow(Math.max(0,1-Math.pow(y/hh,2.4)),.5)*(1-.12*y/hh)+.05,nu:64,nv:24,flute:{n:13,amp:.07,sharp:1.5},rings:{n:8,amp:.02},noise:{amp:.02,su:5,sv:2,seed:s+9},tilt:{amp:.16,dir:s>0?0:Math.PI},col};
  const w1=at(C,s>0?.3:Math.PI-.3,5.2);w1.r=.9;w1.ky=1.1;const w2=at(C,s>0?-.6:Math.PI+.6,6.0);w2.r=.7;w2.ky=1;C.ops=[w1,w2];
  hykPut('hkShell',hykLathe(C));hykWin(w1,{nacre:true,lit:true});hykWin(w2,{nacre:true,lit:true});
  hykPut('hkShell',hykFlare([cx,.02,cz],[0,1,0],rb*.97,2.6,{col}));
  const q=at(D,s>0?0:Math.PI,3.5);hykPut('hkShell',hykFlare([q.p[0]-q.n[0]*.3,q.p[1],q.p[2]-q.n[2]*.3],[q.n[0],q.n[1],q.n[2]],3.2,1.6,{col}));   // rooted in the dome: the ring's edge sinks a hand into the curved skin rather than floating off it
  for(let i=0;i<9;i++){const a=rr(0,TAU),y=rr(.2,2.4);const r=C.rFn(y+.3)+.02;kput('hkBarnB',[cx+r*Math.cos(a),y,cz+r*Math.sin(a)],null,[.3,.22,.3],hC(hPick(HPAL.barnacle)));}}
 // ---- the front steps up the plinth, and the wet landing's jars
 hykTideStair([0,0,R0+1.6+4.4],[0,PL,R0+1.3],9.0,{col:cBone,rails:'both',solid:true,solidCol:cTeal});
 for(const s of [-1,1]){const q=at(P,-Math.PI/2+s*.16,2.0);hykLight(q.p[0]+q.n[0]*.55,q.p[1]+.25,q.p[2]+q.n[2]*.55,{r:.22,cool:true,level:'wet',bracket:q.p});}
 // ---- lights (civic: lit): pearls at the doors, jars on the basin rail, pearls in the shrine
 for(const s of [-1,1]){const y=PL+3.4;const r=scrR(y);const A=[s*2.3,y,Math.sqrt(r*r-2.3*2.3)];hykLight(A[0],A[1]+.3,A[2]+.55,{r:.22,nacre:true,bracket:A});}
 for(let k=0;k<6;k++){const a=k/6*TAU+.32;const r=RB+1.3;hykLight(r*Math.cos(a),PL+1.5,r*Math.sin(a),{r:.2,cool:true,bracket:[r*Math.cos(a),PL+1.15,r*Math.sin(a)]});}
 for(const dth of [.9,-.9]){const u=(((tdo+dth)/TAU)%1+1)%1;const v=clamp(.55/Math.PI+.5,.02,.98);const q=sp.surf(u,v);const A=[q[0]+SC[0],q[1],q[2]+SC[1]];const vx=A[0]-SC[0],vz=A[2]-SC[1];const vl=Math.hypot(vx,vz)||1;
  hykLight(A[0]-vx/vl*.6,A[1]+.1,A[2]-vz/vl*.6,{r:.2,nacre:true,bracket:A});}
 // ---- rooms and spots: the hall round the basin, the shrine
 const hall=hykRoom('hall',hykCirclePoly(0,0,RF-1.6,24),PL+.02,HD-2,{doors:doors.map(d=>[d.p[0],d.p[2],d.r*2,'street']).concat([[shrD.p[0],shrD.p[2],2.4,'shrine']]),wealth:.95});
 hykSpot(hall,'shrine',-4.8,-12.8,Math.PI/4,1.6,.9);hykSpot(hall,'seat',13.2,2.6,Math.PI/2,1.6,.9);hykSpot(hall,'seat',-13.2,2.6,-Math.PI/2,1.6,.9);hykSpot(hall,'seat',4.9,-12.8,-Math.PI/4,1.6,.9);
 const shr=hykRoom('shrine',hykCirclePoly(SC[0],SC[1],SR*.8,14),PL+.02,SB*1.4,{doors:[[SC[0]+Math.sin(toD)*SR,SC[1]+Math.cos(toD)*SR,2.4,'hall']],wealth:.95});
 hykSpot(shr,'shrine',SC[0]-Math.sin(toD)*3.0,SC[1]-Math.cos(toD)*3.0,toD,1.6,.9);hykSpot(shr,'seat',SC[0]+Math.cos(toD)*2.9,SC[1]-Math.sin(toD)*2.9,toD+Math.PI/2,1.4,.9);hykSpot(shr,'store',SC[0]-Math.cos(toD)*2.9,SC[1]+Math.sin(toD)*2.9,toD-Math.PI/2,1.2,.7);
 hykReg('Temple of the Tides',0,-1,34,44);}
HYK.def({key:'hyk_temple_tides',name:'Temple of the Tides',family:'sacred',row:'Sacred',w:62,d:60,h:44,landmark:true,inside:true,tags:{type:['religious'],wealth:'civic',lit:true},build:buildHykTempleTides});
