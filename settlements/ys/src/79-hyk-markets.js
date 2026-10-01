// ================================================================= HYKKOUSOI — markets: the main market, the grown raised plaza, two neighbourhood markets (agent C)
// Seeds 30950–30999. Uses the agent-C helpers in 72-hyk-hospitality.js (hykHospPod, hykHospCone, hykHospCrown, hykHospSpire,
// hykHospLamp, hykHospLanding, hykHospFixDecks, hykHospLocalMembers, hykHospFillet, hykHospPodRay). A market is mostly
// open: a canopy of bone-ribs with the shell stretched between them, stalls as spots (kind 'stall', 2.4 x 1.6) in 'hall'
// and 'court' rooms, the one or two closed pods (a toll house, a tally booth, a keeper's store) carrying the real doors.
// Middle wealth: shell and bone; the main market alone is lit (glow-pearls hung from its ribs).
// ---------------------------------------------------------------- shared bits
// a vault of parabolic bone-ribs across z between x0 and x1 (n ribs, half-width hw, rise), the shell stretched between
// neighbouring ribs and sagging a little, feet flared into the ground, a knuckled crest along the ridge with urchin
// spines, lenses on the flanks. Returns {ribAt(k,t) -> [x,y,z] on rib k at t (0 at -hw)}.
function hykMarketVault(o){const x0=o.x0,x1=o.x1,n=o.n,hw=o.hw,rise=o.rise,y0=o.y0||.05;const bone=o.bone||hC(hPick(HPAL.bone)),col=o.col||hC(hPick(HPAL.shell)),col2=o.col2||hC(hPick(HPAL.shellWarm),.92);
 const xk=k=>x0+(x1-x0)*k/(n-1);const ribAt=(k,t)=>[xk(k),y0+rise*4*t*(1-t),-hw+2*hw*t];
 for(let k=0;k<n;k++){const x=xk(k);hykPut('hkBone',hykRib([x,y0-.6,-hw],[x,y0-.6,hw],{rise:rise+.6,r0:.62,r1:.36,knuckles:6,n:30,seg:10,col:bone}));
  for(const s of [-1,1])hykPut('hkBone',hykFlare([x,y0,s*hw],[0,1,0],.66,.7,{col:bone}));}
 for(let k=0;k<n-1;k++){const xa=xk(k),xb=xk(k+1);
  const fn=(u,v)=>{const t=u;const yr=y0+rise*4*t*(1-t);const sag=(o.sag||.9)*Math.sin(Math.PI*v)*Math.sin(Math.PI*t);const fl=.05*Math.cos(10*Math.PI*v)*Math.sin(Math.PI*t);
   return [xa+(xb-xa)*v,yr-.26-sag+fl,-hw+2*hw*t];};
  hykPut('hkShell',hykSurf(fn,30,10,{col,flip:true,uS:hw*2.6/4,vS:(xb-xa)/4}));hykPut('hkShell',hykSurf(fn,30,10,{col:col2,flip:false,uS:hw*2.6/4,vS:(xb-xa)/4}));
  if(o.lens!==false)for(const t of [.33,.5,.67]){const p=[(xa+xb)/2,y0+rise*4*t*(1-t)-.2,-hw+2*hw*t];kput('hkLens',p,null,.36,hC(hPick(HPAL.lens)));}}
 if(o.crest!==false){const pts=[];const m=Math.round((x1-x0)/2.5);for(let i=0;i<=m;i++)pts.push([x0+(x1-x0)*i/m,y0+rise-.02,0]);
  hykPut('hkBone',hykTube(pts,t=>.3*(1+.3*Math.max(0,Math.cos(t*m*TAU/2))),{seg:8,col:bone}));
  for(let i=1;i<m;i+=1){const h=rr(.7,1.4);kput('hkDrip',[pts[i][0]+rr(-.3,.3),y0+rise+h/2-.22,rr(-.2,.2)],null,[h*.28,h,h*.28],bone);}}
 return {ribAt,xk};}
// a railing on posts round (cx,cz) at radius r, over the given arcs [[a0,a1],...] (bearings from +x toward +z), a knuckle at each end
function hykMarketRail(cx,y,cz,r,arcs,col){const bc=col||hC(hPick(HPAL.bone));for(const A of arcs){const n=Math.max(6,Math.round((A[1]-A[0])*r/1.2));const pts=[];
 for(let i=0;i<=n;i++){const a=A[0]+(A[1]-A[0])*i/n;pts.push([cx+r*Math.cos(a),y+1.15,cz+r*Math.sin(a)]);}
 hykPut('hkBone',hykTube(pts,()=>.07,{seg:6,col:bc}));for(let i=0;i<=n;i+=2){const p=pts[i];kput('hkPost',[p[0],y+.58,p[2]],null,[.06,1.15,.06],bc);}
 for(const i of [0,n]){const p=pts[i];kput('hkBall',p,null,[.2,.18,.2],bc);}}}
// a rib from the host's face (rooted with a flare and a knuckle) to a point under a deck, in the G frame
function hykMarketFaceRib(o,fx,fy,tx,ty,tz,rise){const bone=hC(hPick(HPAL.bone));const fz=o.faceZ(fx,fy);
 hykPut('hkBone',hykRib([fx,fy,fz-.6],[tx,ty,tz],{rise:rise!=null?rise:-1.2,r0:.42,r1:.3,knuckles:4,n:14,col:bone}));
 hykPut('hkBone',hykFlare([fx,fy,fz+.03],[0,0,1],.4,.55,{col:bone}));kput('hkBall',[fx,fy,fz+.5],null,[.56,.56,.56],bone);}
// a stall spot tangential to the arc about (cx,cz) at radius r and bearing b
function hykMarketStallAt(room,cx,cz,r,b){return hykSpot(room,'stall',cx+r*Math.cos(b),cz+r*Math.sin(b),Math.PI/2-b,2.4,1.6);}
// ================================================================= the main market (free-standing, middle, lit, 84 m)
// The market hall by the docks: ten parabolic bone-ribs over a 26 m span, the shell stretched between them, open at
// both ends and along both flanks; stalls in three rows inside and along both aprons; the toll house and the weigh
// house, two lens-crowned pods, flank the front; glow-pearls hang from the ribs.
function hykMarketBuildMain(G,o){reseed(30950+(o.v|0));const col=hC(hPick(HPAL.shell)),col2=hC(hPick(HPAL.shellWarm)),bone=hC(hPick(HPAL.bone));
 const HW=13,RISE=11,X0=-30,X1=30,NR=10;
 // the paving: a long superellipse
 hykPut('hkFloor',hykSurf((u,v)=>{const th=u*TAU;const c=Math.cos(th),s=Math.sin(th);const r=v*(1+.02*Math.cos(13*th)*v);return [38*r*Math.sign(c)*Math.pow(Math.abs(c),.7),.04,22*r*Math.sign(s)*Math.pow(Math.abs(s),.7)];},56,3,{col:hC(hPick(HPAL.floor),.95),flip:true,uS:40,vS:8}));
 const V=hykMarketVault({x0:X0,x1:X1,n:NR,hw:HW,rise:RISE,col,col2,bone});
 // pearls hung from the inner ribs on brackets rooted in the rib
 for(let k=1;k<NR-1;k++)for(const t of [.28,.72]){const p=V.ribAt(k,t);hykLight(p[0],p[1]-1.4,p[2],{r:.2,level:'ground',bracket:p});}
 // the end arches are the hall's ways in: recorded as doors (no shell holds a lip there), the toll and weigh houses carry the real ones
 for(const s of [-1,1]){const w=hykW(s*X1,RISE*.4,0);const nn=hykN(s,0,0);ysMark({bld:HYK.cur.id,key:HYK.cur.key,name:HYK.cur.name,kind:'door',x:w[0],y:w[1],z:w[2],nx:nn[0],nz:nn[2],w:10,h:RISE*.8,level:'ground',room:null,lit:true,into:null,step:[w[0]+nn[0],w[2]+nn[2]],thresh:[w[0]-nn[0],w[2]-nn[2]]});}
 // the toll house and the weigh house at the front corners
 const pods=[];for(const s of [-1,1]){const P=hykHospPod(s*33.5,16.5,{a:3.1,b:2.9,c:3.0,sq:.55,col:s<0?col:col2,seed:s<0?3:5,openings:[{th:0,y:1.42,r:1.08,ky:1.25,kind:'door',main:true},{th:-s*Math.PI/2,y:2.0,r:.42,kind:'window'},{th:Math.PI,y:2.1,r:.4,kind:'window'},{th:s*.5,y:3.2,r:.3,kind:'window'}]});
  hykHospCrown(P.cx,P.cz,P.cy+P.b*.78,1.05,{col:col2,spire:false});hykHospLamp(P,.45,2.6,{level:'ground'});pods.push(P);
  const rm=hykRoom('store',hykCirclePoly(P.cx,P.cz,P.a*.78,14),P.floorY,P.cy+P.b*.9-P.floorY,{doors:[[P.door.p[0],P.door.p[2],2.16,'street']],wealth:.5});
  hykSpot(rm,s<0?'counter':'work',P.cx,P.cz-.3,0,1.6,.7);hykSpot(rm,'store',P.cx-s*1.4,P.cz+.9,Math.PI/2,1.2,.7);}
 // the hall: three rows of stalls under the vault; the aprons: a row along each flank
 const hall=hykRoom('hall',hykHospEllPoly(0,0,31,12.6,28),.04,RISE,{doors:[[X0,0,10,'street'],[X1,0,10,'street']],wealth:.5});
 for(let i=0;i<10;i++){const x=-24.3+i*5.4;hykSpot(hall,'stall',x,-5.6,0,2.4,1.6);hykSpot(hall,'stall',x,5.6,0,2.4,1.6);if(i<9)hykSpot(hall,'stall',x+2.7,0,0,2.4,1.6);}
 const north=hykRoom('court',[[-29,-14.6],[29,-14.6],[29,-20.6],[-29,-20.6]],.04,20,{doors:[],wealth:.5});for(let i=0;i<9;i++)hykSpot(north,'stall',-24+i*6,-17.6,0,2.4,1.6);
 const south=hykRoom('court',[[-28,14.6],[28,14.6],[28,20.6],[-28,20.6]],.04,20,{doors:pods.map(P=>[P.door.p[0],P.door.p[2],2.16,'store']),wealth:.5});for(let i=0;i<9;i++)hykSpot(south,'stall',-24+i*6,17.6,0,2.4,1.6);
 hykSpot(north,'plant',-27.5,-19.3,0,1.4,1.4);hykSpot(south,'plant',27,19.4,0,1.4,1.4);
 hykReg('Main market',0,0,42,RISE+2.5);}
HYK.def({key:'hyk_market_main',name:'Main market',family:'markets',row:'Markets',inside:true,w:84,d:46,h:14,tags:{type:['market/shop'],wealth:'middle',lit:true},build:hykMarketBuildMain});
// ================================================================= the grown raised plaza (G frame)
// A lily-pad plaza 21 m across grown off the host at the pod level through a short neck, ribs from the face carrying it,
// drips under its rim, a rail round it open at the neck and where a rib bridge leaves for a railed perch cantilevered
// off the nearest strut, runners from the bridge to the host's members; a parasol of lenses on a fluted stalk at its heart,
// nine stalls round it, the tally booth on the deck with the real door.
function hykMarketBuildPlaza(G,o){reseed(30958+(o.v|0));const col=hC(hPick(HPAL.shell)),col2=hC(hPick(HPAL.shellWarm)),bone=hC(hPick(HPAL.bone));
 const PR=10.5,PZ=13.2,NR=4.2,NZ=3.0;const M=hykHospLocalMembers(o.host.members);
 hykHospLanding(o,0,0,NZ,NR,{col});hykHospLanding(o,0,0,PZ,PR,{col,lobes:11});
 // the neck's rails, the plaza's rail with its two gaps (the neck, the bridge)
 for(const s of [-1,1]){const pts=[];for(let i=0;i<=4;i++){const z=.2+i*(NZ+2.0-.2)/4;pts.push([s*2.6,1.15,z]);}hykPut('hkBone',hykTube(pts,()=>.07,{seg:6,col:bone}));for(let i=0;i<=4;i+=2)kput('hkPost',[s*2.6,.58,pts[i][2]],null,[.06,1.15,.06],bone);}
 const BB=.434,BG=.17,NG=.55;hykMarketRail(0,0,PZ,PR*.92,[[-Math.PI/2+NG,BB-BG],[BB+BG,3*Math.PI/2-NG]],bone);
 // the ribs from the face, the drips under the rim
 for(const r of [[4.5,-5.5,5.5,-1.1,11,-1.2],[-4.5,-5.5,-5.5,-1.1,11,-1.2],[9,-4.5,8.5,-.8,16,-1.0],[-9,-4.5,-8.5,-.8,16,-1.0],[1.8,-3.0,1.6,-.6,3.6,-.6],[-1.8,-3.0,-1.6,-.6,3.6,-.6]])hykMarketFaceRib(o,r[0],r[1],r[2],r[3],r[4],r[5]);
 for(let i=0;i<30;i++){const b=rr(-1.05,4.2);const v=rr(.74,.96);const h=rr(.5,1.6);const yu=-.3-.22*PR*(1-v*v);kput('hkDrip',[PR*v*Math.cos(b),yu-h/2+.2,PZ+PR*v*Math.sin(b)],qEuler(Math.PI,0,0),[h*.28,h,h*.28],col);}
 // the parasol: a fluted stalk, a lens dome, a spire
 hykPut('hkShell',hykLathe({H:4.3,cx:0,cz:PZ,yBase:0,rFn:y=>.55*(1+.15*Math.sin(y*2.5)),nu:20,nv:10,flute:{n:9,amp:.12,sharp:1.3},twist:.5,rings:{n:5,amp:.03},col:col2}));
 hykPut('hkShell',hykFlare([0,.02,PZ],[0,1,0],.56,.6,{col:col2}));
 const DR=6.0,DH=2.3,DY=4.0;const dome=y=>DR*Math.sqrt(Math.max(0,1-Math.pow(y/DH,2.2)))+.08;
 hykPut('hkShell',hykLathe({H:DH,cx:0,cz:PZ,yBase:DY,rFn:dome,nu:44,nv:11,rings:{n:4,amp:.03},flute:{n:11,amp:.04,sharp:1.2},col}));
 hykPut('hkShell',hykLathe({H:DH-.1,cx:0,cz:PZ,yBase:DY-.05,rFn:y=>dome(y)*.97,nu:44,nv:11,flip:true,col:hC(hPick(HPAL.shellWarm),.9)}));
 kput('hkLip',[0,DY,PZ],qEuler(Math.PI/2,0,0),[DR*1.03,DR*1.03,1.2],col2);
 for(let ring=0;ring<2;ring++){const n=ring?8:14,y=ring?1.7:1.0,r=dome(y)*.98;for(let i=0;i<n;i++){const a=i/n*TAU+ring*.2;kput('hkLens',[r*Math.cos(a),DY+y,PZ+r*Math.sin(a)],null,ring?.3:.36,hC(hPick(HPAL.lens)));}}
 hykHospSpire(0,PZ,DY+DH-.25,2.4,.5,{col:col2,flutes:7,twist:1.0});
 // the tally booth on the deck, its door toward the parasol
 const bx=5.0,bz=7.5;const bth=Math.atan2(-bx,PZ-bz);
 const B=hykHospPod(bx,bz,{a:2.4,b:2.3,c:2.4,sq:.5,cy:2.3*.5+.05,col:col2,seed:9,skirt:.7,openings:[{th:bth,y:1.35,r:1.05,ky:1.25,kind:'door',main:true},{th:bth+1.6,y:1.9,r:.36,kind:'window'},{th:bth-1.6,y:1.9,r:.36,kind:'window'},{th:bth+Math.PI,y:2.1,r:.3,kind:'window'}]});
 kput('hkLip',[bx,B.top-.25,bz],qEuler(Math.PI/2,0,0),[.45,.45,.9],col);
 const st=hykRoom('store',hykCirclePoly(bx,bz,B.a*.78,14),B.floorY,B.cy+B.b*.9-B.floorY,{doors:[[B.door.p[0],B.door.p[2],2.1,'court']],wealth:.5});
 hykSpot(st,'counter',bx-.1,bz-.6,0,1.6,.7);hykSpot(st,'store',bx+.4,bz+1.0,0,1.2,.7);
 // the bridge to the perch: from the rim at bearing BB to a pad cantilevered off the nearest member, runners to the members
 const A={x:PR*.92*Math.cos(BB),y:0,z:PZ+PR*.92*Math.sin(BB)};const PX=19,PY=-.3,PZ2=22,PRR=3.0;const dx=PX-A.x,dz=PZ2-A.z;const dl=Math.hypot(dx,dz)||1;const ux=dx/dl,uz=dz/dl;
 const Bp={x:PX-ux*(PRR-.4),y:PY,z:PZ2-uz*(PRR-.4)};const n0=NAV_EXTRA.length;
 const br=hykBridge(A,Bp,{w:1.8,rise:.35,own:o.host.n+' plaza bridge',col:bone,deckCol:col,runners:{members:M,reach:12,every:4}});hykHospFixDecks(n0);
 hykHospLanding(o,PX,PY,PZ2,PRR,{col,rail:{a0:Math.atan2(-uz,-ux),gap:2*Math.asin(Math.min(1,1.0/PRR))+.3}});
 let best=null;for(const m of M){const q=hykSegNearest(m,[PX,PY-1,PZ2]);const d=Math.hypot(q.q[0]-PX,q.q[1]-PY,q.q[2]-PZ2);if(!best||d<best.d)best={q:q.q,n:q.n,d};}
 if(best&&best.d<16){const q=best.q,nq=best.n;hykPut('hkBone',hykRib([q[0]-nq[0]*.5,q[1]-nq[1]*.5,q[2]-nq[2]*.5],[PX,PY-.45,PZ2],{rise:-.6,r0:.44,r1:.3,knuckles:3,col:bone}));
  hykPut('hkBone',hykFlare([q[0]+nq[0]*.05,q[1]+nq[1]*.05,q[2]+nq[2]*.05],nq,.42,.7,{col:bone}));kput('hkBall',[q[0]+nq[0]*.6,q[1]+nq[1]*.6,q[2]+nq[2]*.6],null,[.5,.5,.5],bone);}
 else for(const sx of [-3.2,3.2])hykMarketFaceRib(o,PX*.42+sx,PY-4.6,PX+sx*.25,PY-.5,PZ2-.6,-1.8);   // no member in reach: two ribs from the face carry the cantilever
 // the plaza as a court: the stalls round the parasol, the ways off it
 const court=hykRoom('court',hykCirclePoly(0,PZ,PR*.93,22),0,20,{doors:[[0,NZ,4.2,'host'],[B.door.p[0],B.door.p[2],2.1,'store'],[A.x,A.z,1.8,'perch']],wealth:.5});
 for(const b of [-2.3,-.15,.3,.8,1.3,1.8,2.3,2.8,3.3])hykMarketStallAt(court,0,PZ,7.0,b);
 hykSpot(court,'seat',-2.0,PZ-1.6,0,1.4,.9);
 const perch=hykRoom('landing',hykCirclePoly(PX,PZ2,PRR*.8,10),PY,20,{doors:[[Bp.x,Bp.z,1.8,'court']],wealth:.5});hykSpot(perch,'seat',PX+ux*.9,PZ2+uz*.9,Math.atan2(ux,uz),1.4,.9);
 hykReg('Grown plaza',0,PZ,14,DY+DH+2.4);window._plazaBridge={runners:br.runners,branches:br.branches,perchRoot:best?best.d:null};}
HYK.def({key:'hyk_market_plaza',name:'Grown plaza',family:'markets',row:'Markets',grown:true,inside:true,w:26,d:26,h:9,tags:{type:['market/shop'],wealth:'middle',lit:false},build:hykMarketBuildPlaza});
// ================================================================= neighbourhood market 1: the scallop (free-standing, middle)
// A fluted scallop fan rising from the keeper's store pod at the back and spreading forward over five stalls, its rim on
// three bone legs; the fan's underside is the market's ceiling.
function hykMarketBuildNbhd1(G,o){reseed(30966+(o.v|0));const col=hC(hPick(HPAL.shell)),col2=hC(hPick(HPAL.shellWarm),.95),bone=hC(hPick(HPAL.bone));
 const HX=0,HZ=-7.0;const S=hykHospPod(HX,HZ,{a:2.8,b:2.6,c:2.6,sq:.55,col:col2,seed:13,openings:[{th:0,y:1.35,r:1.05,ky:1.2,kind:'door',main:true},{th:1.8,y:1.9,r:.38,kind:'window'},{th:-1.8,y:1.9,r:.38,kind:'window'},{th:Math.PI,y:1.8,r:.34,kind:'window'}]});
 const RF=11,SPREAD=2.6,Y0=3.2;const fan=(u,v)=>{const th=(u-.5)*SPREAD;const rho=v*RF;const fl=.28*Math.cos(14*th)*v;const droop=.9*Math.pow(Math.abs(th)/(SPREAD/2),2.2)*v;
  return [HX+rho*Math.sin(th),Y0+3.9*Math.pow(v,.8)+fl-droop,HZ+rho*Math.cos(th)];};
 hykPut('hkShell',hykSurf(fan,36,12,{col,flip:true,uS:RF*SPREAD/4,vS:RF/4}));hykPut('hkShell',hykSurf((u,v)=>{const p=fan(u,v);return [p[0],p[1]-.22,p[2]];},36,12,{col:col2,flip:false,uS:RF*SPREAD/4,vS:RF/4}));
 const rim=[];for(let i=0;i<=36;i++)rim.push(fan(i/36,1));hykPut('hkShell',hykTube(rim,(t)=>.16*(1+.3*Math.max(0,Math.cos(t*14*Math.PI))),{seg:7,col}));
 hykPut('hkShell',hykHospFillet([HX,Y0+.1,HZ],[0,1,0],1.5,1.1,{col:col2,recess:p=>hykHospPodRay(S,p[0]-S.cx,p[1]-S.cy,p[2]-S.cz)[1]-p[1]}));
 // the legs: bone tubes leaning out at the foot, a flare on the ground, a knuckle into the rim
 for(const th of [-.95,0,.95]){const p=fan(.5+th/SPREAD,.93);const fx=p[0]*1.08,fz=HZ+(p[2]-HZ)*1.08;
  hykPut('hkBone',hykTube([[fx,0,fz],[fx*.98,p[1]*.45,HZ+(fz-HZ)*.98],[p[0],p[1]-.32,p[2]],[p[0],p[1]+.1,p[2]]],t=>.3-.1*t,{seg:8,col:bone}));
  hykPut('hkBone',hykFlare([fx,.02,fz],[0,1,0],.3,.55,{col:bone}));kput('hkBall',[p[0],p[1]-.32,p[2]],null,[.4,.36,.4],bone);}
 // the paving: a fan; the court and its stalls; the store
 hykPut('hkFloor',hykSurf((u,v)=>{const th=(u-.5)*(SPREAD+.4);const rho=v*(RF+.5);return [HX+rho*Math.sin(th),.04,HZ+rho*Math.cos(th)];},24,3,{col:hC(hPick(HPAL.floor),.95),flip:true}));
 const poly=[];for(let i=0;i<=10;i++){const th=(-.5+i/10)*SPREAD;poly.push([HX+10*Math.sin(th),HZ+10*Math.cos(th)]);}for(let i=10;i>=0;i--){const th=(-.5+i/10)*SPREAD;poly.push([HX+2.3*Math.sin(th),HZ+2.3*Math.cos(th)]);}
 const court=hykRoom('court',poly,.04,20,{doors:[[S.door.p[0],S.door.p[2],2.1,'store']],wealth:.5});
 for(const th of [-1.0,-.5,0,.5,1.0])hykSpot(court,'stall',HX+6.5*Math.sin(th),HZ+6.5*Math.cos(th),th,2.4,1.6);
 hykSpot(court,'plant',HX+8.0,HZ+3.4,0,1.2,1.2);hykSpot(court,'plant',HX-8.0,HZ+3.4,0,1.2,1.2);
 const st=hykRoom('store',hykCirclePoly(S.cx,S.cz,S.a*.78,14),S.floorY,S.cy+S.b*.9-S.floorY,{doors:[[S.door.p[0],S.door.p[2],2.1,'court']],wealth:.5});
 hykSpot(st,'store',S.cx,S.cz-1.1,0,1.2,.7);hykSpot(st,'store',S.cx-1.3,S.cz+.5,Math.PI/2,1.2,.7);hykSpot(st,'food',S.cx+1.2,S.cz+.5,0,.8,.8);
 hykReg('Scallop market',0,-1,11.5,8.2);}
HYK.def({key:'hyk_market_nbhd_1',name:'Scallop market',family:'markets',row:'Markets',inside:true,w:22,d:20,h:8.2,tags:{type:['market/shop'],wealth:'middle',lit:false},build:hykMarketBuildNbhd1});
// ================================================================= neighbourhood market 2: the barnacles (free-standing, middle)
// Three barnacle-cone booths of three heights round a small paved court, each opening onto it through a lipped arch with
// a counter inside; a fluted spine at the court's heart with three open stalls about it.
function hykMarketBuildNbhd2(G,o){reseed(30974+(o.v|0));const col=hC(hPick(HPAL.shell)),col2=hC(hPick(HPAL.shellWarm)),grey=hC(hPick(HPAL.barnacle));
 hykPut('hkFloor',hykDisc(0,.04,0,7.4,{col:hC(hPick(HPAL.floor),.95),lobes:{n:9,amp:.06},nu:36}));
 const booths=[[-6.2,-1.6,3.2,4.8],[6.2,-1.8,3.0,5.4],[0,-7.6,3.4,4.3]];const doors=[];
 booths.forEach((b,i)=>{const dx=-b[0],dz=-b[1];const thL=Math.atan2(dz,dx);const C=hykHospCone(b[0],b[1],{rb:b[2],rt:b[2]*.68,h:b[3],tilt:.3,dir:thL+Math.PI,col:i===1?col2:col,seed:31+i,flutes:12+i*2,openings:[{th:thL,y:1.3,r:1.2,kind:'door',main:true,o:{name:'Barnacle market booth'}},{th:thL+Math.PI,y:2.3,r:.34,kind:'window'},{th:thL+1.6,y:2.0,r:.3,kind:'window'}]});
  const dl=Math.hypot(dx,dz)||1;const ux=dx/dl,uz=dz/dl;
  const rm=hykRoom('store',hykCirclePoly(b[0],b[1],b[2]*.78,14),.08,b[3]*.8,{doors:[[C.door.p[0],C.door.p[2],2.4,'court']],wealth:.5});
  hykSpot(rm,'counter',b[0]+ux*.3,b[1]+uz*.3,Math.atan2(ux,uz),1.6,.7);hykSpot(rm,'store',b[0]-ux*1.3,b[1]-uz*1.3,Math.atan2(ux,uz),1.2,.7);
  doors.push([C.door.p[0],C.door.p[2],2.4,'store']);
  for(let k=0;k<6;k++){const a=rng()*TAU;const r=b[2]+rr(.1,.9);const s=rr(.1,.24);kput('hkBarnB',[b[0]+r*Math.cos(a),.08+rr(0,.4),b[1]+r*Math.sin(a)],null,[s,s*.7,s],grey);}});
 hykHospSpire(0,0,0,5.2,.7,{col:col2,flutes:9,twist:1.1});kput('hkLip',[0,.9,0],qEuler(Math.PI/2,0,0),[1.0,1.0,1.0],col);
 const court=hykRoom('court',hykCirclePoly(0,0,6.8,16),.04,20,{doors,wealth:.5});
 hykSpot(court,'stall',0,3.8,0,2.4,1.6);hykSpot(court,'stall',-3.4,2.2,-.6,2.4,1.6);hykSpot(court,'stall',3.4,2.2,.6,2.4,1.6);hykSpot(court,'plant',-4.4,3.9,0,1.0,1.0);
 hykReg('Barnacle market',0,-2,10.5,7.5);}
HYK.def({key:'hyk_market_nbhd_2',name:'Barnacle market',family:'markets',row:'Markets',inside:true,w:20,d:18,h:7.5,tags:{type:['market/shop'],wealth:'middle',lit:false},build:hykMarketBuildNbhd2});
