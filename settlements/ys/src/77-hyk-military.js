// ================================================================= HYKKOUSOI — military: the barracks, the ballista emplacement, the mustering ground
// The Vothic threat made solid (DESIGN §1, §6): three civic-wealth pieces on the southern headland, every one grown in
// the kit's vocabulary (61/62): lathes, pods, bone ribs, lipped holes, fillets where shells meet; no box massing. Every
// opening is a hykDoor/hykWin, every lamp a hykLight on a bracket, every room data with its spots (DESIGN §7). The small
// helpers at the top (hykMil…) are shared with 78-hyk-agri.js. Seeds 30800–30849.
reseed(30849);
// ---------------------------------------------------------------- shared helpers (used by 78-hyk-agri.js too)
// the radius a hykLathe really has at (th, y): the same modulation chain as 61's rAt, so lips, brackets and fillets sit on
// the surface and not on the nominal profile (a flute crest stands up to amp proud of it)
function hykMilLatheR(L,th,y){let r=L.rFn(y);const u=((th/TAU)%1+1)%1;
 if(L.lobes)r*=1+L.lobes.amp*Math.cos(L.lobes.n*th+(L.lobes.ph||0));
 if(L.flute)r*=1+L.flute.amp*Math.pow(.5+.5*Math.cos(L.flute.n*th+(L.twist||0)*y),L.flute.sharp||2);
 if(L.rings)r*=1+L.rings.amp*Math.sin(y/L.H*L.rings.n*TAU);
 if(L.noise)r*=1+L.noise.amp*(fbm(u*(L.noise.su||3)+(L.noise.seed||0),y/(L.noise.sv||2),L.noise.seed||1,2)-.5)*2;
 return Math.max(0,r);}
function hykMilLatheAt(L,th,y){const q=hykLatheAt(L,th,y);const r=hykMilLatheR(L,th,y);return {p:[(L.cx||0)+r*Math.cos(th),(L.yBase||0)+y,(L.cz||0)+r*Math.sin(th)],n:q.n};}
// the elevation at which a hykPod's surface passes height y (for a door whose sill must meet the floor)
function hykMilPodEl(P,y){const b=P.b,e1=P.e1||1,cy=P.cy!=null?P.cy:b*.82;let t=(y-cy)/b;if(t<0&&P.squash)t/=P.squash;t=clamp(t,-.999,.999);return Math.sign(t)*Math.asin(Math.pow(Math.abs(t),1/e1));}
// A closed-in-u hykSurf (lathe, pod, flare, disc) shows a seam where its first and last columns meet: 61 computes the
// normals per quad and does not weld the wrap, so the two coincident columns get different normals and shade as a line
// (down the front of every pod, since a pod's th = 0 is +z). These wrappers weld the seam on the pieces built here.
function hykMilWeld(g,nu,nv){if(!g||!g.attributes.normal)return g;const N=g.attributes.normal.array;const cols=nu+1;
 for(let j=0;j<=nv;j++){const a=(j*cols)*3,b=(j*cols+nu)*3;let x=N[a]+N[b],y=N[a+1]+N[b+1],z=N[a+2]+N[b+2];const l=Math.hypot(x,y,z)||1;x/=l;y/=l;z/=l;N[a]=N[b]=x;N[a+1]=N[b+1]=y;N[a+2]=N[b+2]=z;}
 g.attributes.normal.needsUpdate=true;return g;}
function hykMilLathe(o){return hykMilWeld(hykLathe(o),o.nu||48,o.nv||24);}
function hykMilFlare(c,n,R,f,o){return hykMilWeld(hykFlare(c,n,R,f,o),(o&&o.nu)||40,(o&&o.nv)||8);}
function hykMilPod(o){const p=hykPod(o);hykMilWeld(p.geo,o.nu||56,o.nv||30);if(p.inner)hykMilWeld(p.inner,o.nu||56,o.nv||30);return p;}
// a superellipse polygon (e = 2 is an ellipse; lower is fuller at the corners), n points, optional rotation
function hykMilEllipsePoly(cx,cz,rx,rz,n,e,rot){const P=[];n=n||24;e=e||2;const c=Math.cos(rot||0),s=Math.sin(rot||0);
 for(let i=0;i<n;i++){const a=i/n*TAU;const x=rx*Math.sign(Math.cos(a))*Math.pow(Math.abs(Math.cos(a)),2/e),z=rz*Math.sign(Math.sin(a))*Math.pow(Math.abs(Math.sin(a)),2/e);P.push([cx+x*c-z*s,cz+x*s+z*c]);}return P;}
// a point on a superellipse at bearing a (x = cx + rx cos-ish, z = cz + rz sin-ish)
function hykMilSuperPt(cx,cz,rx,rz,e,a){return [cx+rx*Math.sign(Math.cos(a))*Math.pow(Math.abs(Math.cos(a)),2/e),cz+rz*Math.sign(Math.sin(a))*Math.pow(Math.abs(Math.sin(a)),2/e)];}
// a paved apron: a lobed superelliptic disc, normal up; o:{col,mat,inside,n,e,lobes,curb (a rim sloping to the ground)}
function hykMilPave(cx,cz,rx,rz,y,o){o=o||{};const e=o.e||2,lob=o.lobes||{n:9,amp:.05};const col=o.col||hC(hPick(HPAL.floor));
 const at=(a,k)=>{const q=hykMilSuperPt(cx,cz,rx*k,rz*k,e,a);return [q[0],q[1]];};
 const fn=(u,v)=>{const a=u*TAU;const k=v*(1+lob.amp*Math.cos(lob.n*a)*v);const q=at(a,k);return [q[0],y,q[1]];};
 const g=hykPut(o.mat||'hkFloor',hykSurf(fn,o.n||64,4,{col,uS:TAU*Math.max(rx,rz)/4,vS:Math.max(rx,rz)/4,flip:true}),!!o.inside);
 if(o.curb){const cc=o.curbCol||hC(hPick(HPAL.shell),.9);hykPut(o.curbMat||'hkShell',hykSurf((u,v)=>{const a=u*TAU;const k=(1+lob.amp*Math.cos(lob.n*a))*(1+v*.05);const q=at(a,k);return [q[0],y*(1-v)-.02*v,q[1]];},o.n||64,2,{col:cc,uS:TAU*Math.max(rx,rz)/4,vS:.2,flip:true}),!!o.inside);}
 return g;}
// an elliptic skirt: the fillet that roots a superellipsoid pod (plan rx by rz, exponent e) into the ground, reaching f out
// and f up, where a round hykFlare would stand off the pod's short sides. rx, rz are the pod's section at height f
function hykMilSkirt(cx,cz,rx,rz,e,f,o){o=o||{};const col=o.col||hC(hPick(HPAL.shell)),y0=o.y0||0,wb=o.wobble!=null?o.wobble:.04;
 const fn=(u,v)=>{const a=u*TAU;const s=v*Math.PI/2;const k=1+(f/Math.min(rx,rz))*(1-Math.sin(s))*(1+wb*Math.sin(a*5+v*3));const q=hykMilSuperPt(cx,cz,rx*k,rz*k,e,a);return [q[0],y0+f*(1-Math.cos(s)),q[1]];};
 return hykPut(o.mat||'hkShell',hykMilWeld(hykSurf(fn,o.nu||48,8,{col,uS:TAU*Math.max(rx,rz)/4,vS:f/4,flip:true}),o.nu||48,8));}
// a rail on posts along a ground polyline (pts carry the ground y): the rail tube at y+h, a post every `every` metres, a knuckle at each end
function hykMilRail(pts,o){o=o||{};const h=o.h||1.1,col=o.col||hC(hPick(HPAL.bone)),every=o.every||1.4;const top=pts.map(p=>[p[0],p[1]+h,p[2]]);
 if(top.length>1)hykPut('hkBone',hykTube(top,()=>o.r||.07,{seg:6,col}));
 let acc=every;for(let i=0;i<pts.length;i++){const p=pts[i];if(i>0)acc+=Math.hypot(p[0]-pts[i-1][0],p[2]-pts[i-1][2]);
  if(acc>=every||i===pts.length-1){acc=0;kput('hkPost',[p[0],p[1]+h/2,p[2]],null,[.06,h,.06],col);}}
 kput('hkBall',top[0],null,[.15,.12,.15],col);kput('hkBall',top[top.length-1],null,[.15,.12,.15],col);}
// a rimstone wall: a knuckled tube along a ground polyline, bedded on a low ridge that fillets it into the ground
function hykMilWall(pts,o){o=o||{};const r=o.r||.32,col=o.col||hC(hPick(HPAL.shell)),mat=o.mat||'hkShell';
 const P=pts.map(p=>[p[0],p[1]+r*.8,p[2]]);let L=0;for(let i=1;i<P.length;i++)L+=Math.hypot(P[i][0]-P[i-1][0],P[i][2]-P[i-1][2]);if(P.length<2)return;
 const kn=Math.max(2,Math.round(L/2.6));hykPut(mat,hykTube(P,t=>r*(1+.16*Math.max(0,Math.cos(t*kn*TAU))),{seg:9,col}));
 const n=pts.length;hykPut(mat,hykSurf((u,v)=>{const i=Math.min(n-1,Math.round(u*(n-1)));const a=pts[Math.max(0,i-1)],b=pts[Math.min(n-1,i+1)];let tx=b[0]-a[0],tz=b[2]-a[2];const l=Math.hypot(tx,tz)||1;tx/=l;tz/=l;
  const s=(v-.5)*2;const c=pts[i];return [c[0]-tz*s*r*2.0,c[1]+r*.95*(1-s*s)+.01,c[2]+tx*s*r*2.0];},n-1,4,{col,uS:L/4,vS:r/2,flip:true}));}
// an arc on the ground about (cx,cz): a polyline of points [x,y,z] from bearing a0 to a1 (x = cx + r cos a, z = cz + r sin a)
function hykMilArc(cx,y,cz,rx,rz,a0,a1,n){const P=[];n=n||Math.max(6,Math.round(Math.abs(a1-a0)*Math.max(rx,rz)/1.0));for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n;P.push([cx+rx*Math.cos(a),y,cz+rz*Math.sin(a)]);}return P;}
// a barnacle cone: a fluted lathe cut on the slant, lidded (a dome with a level crown and a lipped vent), rooted with a
// fillet, hollow with its inner skin. s:{cx,cz,rb,rt,h,dir,tilt,mat,col,ops,nu,nv,seed,vent,ventK,dome,nacre}. Returns {L,hAt,rAt}
function hykMilConeL(s){const rb=s.rb,rt=s.rt,h=s.h;return {H:h,cx:s.cx,cz:s.cz,yBase:s.yBase!=null?s.yBase:-.4,rFn:y=>rb+(rt-rb)*Math.pow(clamp(y/h,0,1),s.pow||.8),nu:s.nu||48,nv:s.nv||20,
  flute:{n:s.fluteN||16,amp:s.fluteAmp!=null?s.fluteAmp:.07,sharp:1.5},rings:{n:s.ringsN||7,amp:.025},noise:{amp:.035,su:5,sv:1.2,seed:s.seed||1},tilt:{amp:s.tilt!=null?s.tilt:.2,dir:s.dir!=null?s.dir:rng()*TAU},col:s.col||hC(hPick(HPAL.shell)),ops:s.ops||[]};}
function hykMilCone(s){const mat=s.mat||'hkShell';const rb=s.rb,rt=s.rt,h=s.h;const L=s.L||hykMilConeL(s);const col=L.col,yB=L.yBase;L.ops=s.ops||L.ops||[];
 hykPut(mat,hykMilLathe(L));
 // the inner skin's holes sit on the inner skin (a wall's thickness in along each opening's normal), at a size that
 // clears the reveal: centred on the outer surface they came out smaller and lower, and the lining half-closed the doors
 const inOps=L.ops.map(op=>{const t=Math.hypot(op.p[0]-s.cx,op.p[2]-s.cz)*.1;return Object.assign({},op,{p:[op.p[0]-op.n[0]*t,op.p[1]-op.n[1]*t,op.p[2]-op.n[2]*t],r:op.r*1.04});});
 if(s.inner!==false)hykPut('hkIn',hykMilLathe(Object.assign({},L,{ops:inOps,rFn:y=>L.rFn(y)*.9,flip:true,col:hC(hPick(mat==='hkBarn'?HPAL.barnacle:HPAL.shell),.85)})),true);
 hykPut(mat,hykMilFlare([s.cx,yB+.06,s.cz],[0,1,0],rb*.98,rb*(s.flare||.32),{col}));
 const hAt=th=>h*(1-L.tilt.amp*.5*(1+Math.cos(th-L.tilt.dir)));const hMid=h*(1-L.tilt.amp*.5);
 const rAt=(th,y)=>hykMilLatheR(L,th,y);
 if(s.lid!==false){const dome=s.dome!=null?s.dome:rt*.3,vk=s.ventK||.2;const lidCol=hC(hPick(mat==='hkBarn'?HPAL.barnacle:HPAL.shellWarm),.92);
  hykPut(mat,hykMilWeld(hykSurf((u,v)=>{const th=u*TAU;const r=rAt(th,hAt(th))*v;return [s.cx+r*Math.cos(th),yB+hAt(th)*v+hMid*(1-v)+dome*(1-v*v)-.04,s.cz+r*Math.sin(th)];},L.nu,6,{col:lidCol,flip:true,hole:s.vent===false?null:(u,v)=>v<vk}),L.nu,6));
  if(s.vent!==false)kput(s.nacre?'hkLipN':'hkLip',[s.cx,yB+hMid+dome-.08,s.cz],qEuler(Math.PI/2,0,0),[rt*vk*1.05,rt*vk*1.05,1.2],s.nacre?hC(hPick(HPAL.nacre)):col);}
 return {L,hAt,rAt,hMid};}
// a lamp on a bracket off a lathe's real surface at (th, y), standing `out` metres off it
function hykMilLampOnLathe(L,th,y,o){const A=hykMilLatheAt(L,th,y);const out=(o&&o.out)||.42;return hykLight(A.p[0]+A.n[0]*out,A.p[1]+.14,A.p[2]+A.n[2]*out,Object.assign({r:.2,bracket:A.p},o||{}));}
// a lamp on a bracket off a hykPod's surface at (th, el), the pod translated by (dx,0,dz)
function hykMilLampOnPod(pod,P,th,el,dx,dz,o){const u=((th/TAU)%1+1)%1,v=clamp(el/Math.PI+.5,.02,.98);const sp=pod.surf(u,v);const A=[sp[0]+dx,sp[1],sp[2]+dz];
 const cy=P.cy!=null?P.cy:P.b*.82;const vx=A[0]-dx,vy=A[1]-cy,vz=A[2]-dz;const vl=Math.hypot(vx,vy,vz)||1;const out=(o&&o.out)||.42;
 return hykLight(A[0]+vx/vl*out,A[1]+vy/vl*out+.14,A[2]+vz/vl*out,Object.assign({r:.2,bracket:A},o||{}));}
// a straight flight on two bone stringers from B (the ground) up to A (a rim), treads between, a rail each side. w the width
function hykMilFlight(A,B,o){o=o||{};const w=o.w||1.6,col=o.col||hC(hPick(HPAL.bone)),tcol=o.treadCol||col;const dx=A[0]-B[0],dz=A[2]-B[2];const L=Math.hypot(dx,dz)||1;const tx=dx/L,tz=dz/L;const rx=-tz,rz=tx;
 const n=Math.max(2,Math.round((A[1]-B[1])/.2));const run=L/n;const yaw=Math.atan2(tx,tz);
 for(let i=1;i<=n;i++){const t=i/n;kput('hkTread',[B[0]+dx*t,B[1]+(A[1]-B[1])*t-.06,B[2]+dz*t],qEuler(0,yaw,0),[w,.12,run*1.15],tcol);}
 for(const s of [-1,1]){const a=[B[0]+rx*s*w*.5-tx*.9,B[1]-.3,B[2]+rz*s*w*.5-tz*.9],b=[A[0]+rx*s*w*.5+tx*.4,A[1]-.32,A[2]+rz*s*w*.5+tz*.4];
  const pts=[];for(let i=0;i<=12;i++){const t=i/12;pts.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t]);}
  hykPut('hkBone',hykTube(pts,t=>.14*(1+.25*Math.max(0,Math.cos(t*n/2*TAU)))-.03*t,{seg:8,col}));
  // the stringer surfaces where it crosses the ground: a knuckle and a fillet there, so it reads as rooted
  const te=.3/Math.max(.5,b[1]-a[1]);const ex=a[0]+(b[0]-a[0])*te,ez=a[2]+(b[2]-a[2])*te;
  hykPut('hkBone',hykMilFlare([ex,B[1]+.02,ez],[0,1,0],.22,.45,{col}));kput('hkBall',[ex,B[1]-.08,ez],null,[.4,.34,.4],col);
  const rail=[];for(let i=0;i<=n;i++){const t=i/n;rail.push([B[0]+dx*t+rx*s*w*.5,B[1]+(A[1]-B[1])*t,B[2]+dz*t+rz*s*w*.5]);}hykMilRail(rail,{h:1.0,col,every:1.2});}}
// ---------------------------------------------------------------- the barracks
// A great fluted barnacle hall (the mess and drill hall) with a crown of spines, two bunk pods grown onto its flanks and an
// armoury pod on its back, each opened into the hall through the shells where they meet; a scale-paved drill yard in front
// inside a bone rail, a standard at its centre. Civic: white shell, nacre lips, glow-pearls on brackets (the lighting rule).
function hykMilBarracks(G,o){reseed(30800+(o.v|0));
 const col=hC(hPick(HPAL.shell)),colW=hC(hPick(HPAL.shellWarm)),bone=hC(hPick(HPAL.bone)),nac=hC(hPick(HPAL.nacre));const FY=.12;
 // ---- the hall
 const HR=7.2,HH=8.4,HX=0,HZ=-2.5;
 const hallOps=[];const podX=10.4,podZ=-.5,armZ=-12.3;
 const hall={cx:HX,cz:HZ,rb:HR,rt:HR*.66,h:HH,pow:1.6,yBase:-.4,dir:-Math.PI/2,tilt:.14,nu:84,nv:28,fluteN:24,fluteAmp:.055,ringsN:10,seed:17,col,dome:1.6,ventK:.14,nacre:true,ops:hallOps,mat:'hkShell'};
 const Lh=hykMilConeL(hall);hall.L=Lh;
 const doorY=FY+1.2-Lh.yBase;   // a 2.4 m door whose sill meets the floor
 const dh=hykMilLatheAt(Lh,Math.PI/2,doorY);hallOps.push({p:dh.p,n:dh.n,r:1.2,ky:1.0,kind:'door'});
 for(const s of [-1,1]){const th=Math.atan2(podZ-HZ,s*podX-HX);const q=hykMilLatheAt(Lh,th,FY+1.15-Lh.yBase);hallOps.push({p:q.p,n:q.n,r:1.15,ky:1.0,kind:'pass',to:s});}
 {const q=hykMilLatheAt(Lh,-Math.PI/2,FY+1.1-Lh.yBase);hallOps.push({p:q.p,n:q.n,r:1.1,ky:1.0,kind:'pass',to:0});}
 for(const [th,y,r] of [[Math.PI/2+1.05,4.2,.6],[Math.PI/2-1.05,4.4,.6],[Math.PI/2+.5,5.6,.42],[Math.PI/2-.5,5.4,.42],[-Math.PI/2+1.3,4.0,.5],[-Math.PI/2-1.3,4.3,.5]]){const q=hykMilLatheAt(Lh,th,y);hallOps.push({p:q.p,n:q.n,r,kind:'window'});}
 const H=hykMilCone(hall);
 for(const op of hallOps){if(op.kind==='door')hykDoor(op,{level:'ground',nacre:true,depth:.85});else if(op.kind==='pass')hykDoor(op,{level:'ground',nacre:true,room:'hall',depth:.5});else hykWin(op,{nacre:true,lit:true});}
 hykFloor(HX,HZ,FY,HR*.88,{lobes:{n:12,amp:.03}});
 // the crown: a ring of urchin spines on the lid's shoulder, leaning out, each rooted with a fillet
 for(let i=0;i<7;i++){const th=i/7*TAU+.3;const rr0=H.rAt(th,H.hAt(th))*.62;const x=HX+rr0*Math.cos(th),z=HZ+rr0*Math.sin(th);const y=Lh.yBase+H.hAt(th)*.62+H.hMid*.38+1.6*(1-.62*.62)-.08;
  const sh=rr(2.0,2.8);hykPut('hkShell',hykMilLathe({H:sh,cx:x,cz:z,yBase:y-.3,rFn:yy=>.34*Math.pow(1-yy/sh,.8)+.03,nu:14,nv:8,flute:{n:7,amp:.16,sharp:1.3},twist:.9,col:colW}));
  hykPut('hkShell',hykMilFlare([x,y-.02,z],[0,1,0],.34,.4,{col:colW}));}
 // lamps: a pearl either side of the door, two inside on the back wall
 hykMilLampOnLathe(Lh,Math.PI/2+.36,3.3,{nacre:true});hykMilLampOnLathe(Lh,Math.PI/2-.36,3.3,{nacre:true});
 for(const th of [-Math.PI/2+.7,-Math.PI/2-.7]){const A=hykMilLatheAt(Lh,th,4.6);const px=HX+(A.p[0]-HX)*.9,pz=HZ+(A.p[2]-HZ)*.9;const ax=[px,A.p[1],pz];
  hykLight(HX+(A.p[0]-HX)*.84,A.p[1]+.12,HZ+(A.p[2]-HZ)*.84,{r:.18,nacre:true,bracket:ax});}
 // ---- the bunk pods, one on each flank, bedded into the hall's wall and opened into it
 const PB={a:4.6,b:3.6,c:4.6,e1:.9,e2:.94};const pcy=PB.b*.82;
 const bunkRooms=[];
 for(const s of [-1,1]){const cx=s*podX,cz=podZ;const thH=Math.atan2(HX-cx,HZ-cz);   // the pod's azimuth toward the hall
  const openings=[{th:0,el:hykMilPodEl(PB,FY+1.15),r:1.05,ky:1.1,kind:'door'},{th:thH,el:hykMilPodEl(PB,FY+1.15),r:1.15,ky:1.0,kind:'pass'},
   {th:s*Math.PI/2,el:.22,r:.55,kind:'window'},{th:s*Math.PI/2+.95,el:.42,r:.4,kind:'window'},{th:s*Math.PI/2-.95,el:.42,r:.4,kind:'window'},{th:s*.35,el:.95,r:.38,kind:'window'},{th:Math.PI-s*.4,el:.3,r:.42,kind:'window'}];
  const pod=hykMilPod(Object.assign({},PB,{nu:60,nv:30,noise:{amp:.026,su:4,sv:3,seed:21+s},col,openings,hollow:{t:.07,col:hC(hPick(HPAL.shell),.9)}}));
  pod.geo.translate(cx,0,cz);hykPut('hkShell',pod.geo);pod.inner.translate(cx,0,cz);hykPut('hkIn',pod.inner,true);
  for(const op of pod.openings){op.p=[op.p[0]+cx,op.p[1],op.p[2]+cz];if(op.kind==='door')hykDoor(op,{level:'ground',nacre:true});else if(op.kind==='pass')hykDoor(op,{level:'ground',nacre:true,room:'hall',depth:.5});else hykWin(op,{nacre:true,lit:true});}
  hykPut('hkShell',hykMilFlare([cx,FY-.1,cz],[0,1,0],PB.a*.9,1.5,{col}));   // .9: inside the pod's section 1.5 m up
  // the fillet where the pod meets the hall, centred on the passage axis
  {const jx=HX+(cx-HX)*(HR-.3)/Math.hypot(cx-HX,cz-HZ),jz=HZ+(cz-HZ)*(HR-.3)/Math.hypot(cx-HX,cz-HZ);const nx=(cx-HX)/Math.hypot(cx-HX,cz-HZ),nz=(cz-HZ)/Math.hypot(cx-HX,cz-HZ);
   hykPut('hkShell',hykMilFlare([jx,pcy-.2,jz],[nx,0,nz],2.7,1.3,{col:colW}));}
  kput('hkBall',[cx,pcy+PB.b-.1,cz],null,[.5,.42,.5],nac);   // a pearl finial on the crown
  hykFloor(cx,cz,FY,PB.a*.84,{});
  hykMilLampOnPod(pod,PB,.42,.18,cx,cz,{nacre:true});
  // the room: five bunks as spokes, the serjeant's at the back, the mess-kit and the kit-store by the door
  const room=hykRoom('bedroom',hykCirclePoly(cx,cz,3.7,16),FY,PB.b*.82*1.3,{doors:[[cx,cz+PB.c,2.1],[cx+PB.a*.95*Math.sin(thH),cz+PB.c*.95*Math.cos(thH),2.3,'hall']],residence:true,wealth:.6});
  for(const bd of [60,-60,120,-120,180]){const a=bd/180*Math.PI;hykSpot(room,'bed',cx+2.2*Math.sin(a),cz+2.2*Math.cos(a),a-Math.PI/2,2.1,1.0);}   // spokes: the long side radial
  for(const [k,bd,w,d] of [['store',22,1.2,.7],['food',-22,.8,.8]]){const a=bd/180*Math.PI;hykSpot(room,k,cx+3.1*Math.sin(a),cz+3.1*Math.cos(a),a,w,d);}   // against the wall, tangential
  bunkRooms.push(room);}
 // ---- the armoury, on the hall's back, opened into it
 {const PA={a:3.8,b:3.2,c:3.4,e1:.9,e2:.92};const cx=0,cz=armZ;const acy=PA.b*.82;
  const openings=[{th:0,el:hykMilPodEl(PA,FY+1.1),r:1.1,ky:1.0,kind:'pass'},{th:Math.PI,el:.3,r:.45,kind:'window'},{th:Math.PI/2+.3,el:.25,r:.4,kind:'window'},{th:-Math.PI/2-.3,el:.25,r:.4,kind:'window'}];
  const pod=hykMilPod(Object.assign({},PA,{nu:48,nv:26,noise:{amp:.03,su:4,sv:3,seed:29},col:colW,openings,hollow:{t:.08,col:colW}}));
  pod.geo.translate(cx,0,cz);hykPut('hkShell',pod.geo);pod.inner.translate(cx,0,cz);hykPut('hkIn',pod.inner,true);
  for(const op of pod.openings){op.p=[op.p[0]+cx,op.p[1],op.p[2]+cz];if(op.kind==='pass')hykDoor(op,{level:'ground',nacre:true,room:'hall',depth:.5});else hykWin(op,{nacre:true});}
  hykPut('hkShell',hykMilFlare([cx,FY-.1,cz],[0,1,0],PA.a*.88,1.2,{col:colW}));hykPut('hkShell',hykMilFlare([HX,acy-.2,HZ-HR+.3],[0,0,-1],2.4,1.1,{col:colW}));
  hykFloor(cx,cz,FY,PA.a*.84,{});
  const room=hykRoom('store',hykCirclePoly(cx,cz,3.0,14),FY,acy*1.3,{doors:[[cx,cz+PA.c*.95,2.2,'hall']],wealth:.6});
  hykSpot(room,'store',cx,cz-2.3,0,1.2,.7);hykSpot(room,'store',cx-2.1,cz-.9,Math.PI/2+.3,1.2,.7);hykSpot(room,'store',cx+2.1,cz-.9,-Math.PI/2-.3,1.2,.7);hykSpot(room,'work',cx,cz-.2,0,1.0,1.0);}
 // the hall's room: the hearth at the back under the vent, two long tables, the mess stores
 const hallRoom=hykRoom('hall',hykCirclePoly(HX,HZ,6.1,18),FY,HH*.8,{doors:[[HX,HZ+HR,2.4],[HX+HR*.95*Math.cos(Math.atan2(podZ-HZ,podX)),HZ+HR*.95*Math.sin(Math.atan2(podZ-HZ,podX)),2.3,'bedroom'],[HX-HR*.95*Math.cos(Math.atan2(podZ-HZ,podX)),HZ+HR*.95*Math.sin(Math.atan2(podZ-HZ,podX)),2.3,'bedroom'],[HX,HZ-HR*.95,2.2,'store']],wealth:.6});
 hykSpot(hallRoom,'hearth',HX,HZ-2.4,0,1.2,1.2);hykSpot(hallRoom,'table',HX-2.6,HZ+.9,0,1.2,3.6);hykSpot(hallRoom,'table',HX+2.6,HZ+.9,0,1.2,3.6);
 hykSpot(hallRoom,'food',HX-4.0,HZ-2.6,.6,.8,.8);hykSpot(hallRoom,'store',HX+4.0,HZ-2.6,-.6,1.2,.7);
 // ---- the drill yard: scale paving in front of the three doors, a bone rail round its far side, the standard at its centre
 const YZ=11.4,YRX=15.5,YRZ=7.6,YE=2.6;hykMilPave(0,YZ,YRX,YRZ,.04,{mat:'hkMosaic',col:hC(hPick(HPAL.shell),.95),n:96,e:YE,lobes:{n:11,amp:.02},curb:true});
 const gap=.16;for(const [a0,a1] of [[Math.PI/2+gap,Math.PI+.35],[TAU-.35,TAU+Math.PI/2-gap]]){const pts=[];const n=40;
  for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n;const q=hykMilSuperPt(0,YZ,YRX*.96,YRZ*.94,YE,a);pts.push([q[0],.04,q[1]]);}hykMilRail(pts,{h:1.05,col:bone,every:1.6});}
 {const sx=0,sz=YZ+.5;kput('hkPost',[sx,3.3,sz],null,[.08,6.6,.08],bone);kput('hkBall',[sx,6.65,sz],null,[.2,.2,.2],nac);hykPut('hkShell',hykMilFlare([sx,.05,sz],[0,1,0],.1,.5,{col}));
  kput('hkWeedCard',[sx+.55,5.9,sz],qEuler(0,Math.PI/2,0),[1.1,.7,1],hC(hPick(HPAL.teal)));}
 hykReg('Barracks',0,-1,20,HH+2.4);}
HYK.def({key:'hyk_barracks',name:'Barracks',family:'military',row:'Military',w:36,d:36,h:11.4,tags:{type:['military'],wealth:'civic',lit:true},build:hykMilBarracks});
// ---------------------------------------------------------------- the ballista emplacement
// A grown platform: a waisted shell pedestal that flares into a lipped pad, a parapet lip over its seaward half, a bone rail
// over the landward half with a flight of treads on bone stringers up to it; the magazine under the pad behind a lipped
// door. On the pad the one machine the kit allows, in bone and sinew: a fluted bone stand, a knuckled stock, two shell
// cradles for the torsion springs, bone arms, a cord of weed, a shell cup for the shot, a windlass; a shell trough of shot beside it.
function hykMilBallista(G,o){reseed(30810+(o.v|0));
 const col=hC(hPick(HPAL.shell)),colW=hC(hPick(HPAL.shellWarm)),bone=hC(hPick(HPAL.bone)),nac=hC(hPick(HPAL.nacre)),grey=hC(hPick(HPAL.barnacle),.8),weed=hC(hPick(HPAL.weed));
 const PY=2.9,PR=5.0,PZ=2.2;const ss=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
 // ---- the pedestal, flaring into the pad; the magazine door on its landward face
 const L={H:PY+.4,cx:0,cz:PZ,yBase:-.3,rFn:y=>4.3-1.0*ss(y/2.0)+1.9*Math.pow(Math.max(0,(y-1.9)/1.4),2.4),nu:96,nv:34,flute:{n:18,amp:.05,sharp:1.6},rings:{n:8,amp:.02},noise:{amp:.03,su:5,sv:1.1,seed:31},col};
 const ops=[];{const q=hykMilLatheAt(L,-Math.PI/2,.3+.05+1.15);ops.push({p:q.p,n:q.n,r:1.0,ky:1.15,kind:'door'});}
 for(const th of [-Math.PI/2+1.1,-Math.PI/2-1.1]){const q=hykMilLatheAt(L,th,1.9);ops.push({p:q.p,n:q.n,r:.5,kind:'window'});}
 L.ops=ops;hykPut('hkShell',hykMilLathe(L));hykPut('hkIn',hykMilLathe(Object.assign({},L,{rFn:y=>L.rFn(y)*.86,flip:true,col:hC(hPick(HPAL.shell),.85)})),true);
 for(const op of ops){if(op.kind==='door')hykDoor(op,{level:'ground',nacre:true});else hykWin(op,{nacre:true});}
 hykPut('hkShell',hykMilFlare([0,-.24,PZ],[0,1,0],4.3*.98,1.5,{col}));
 for(let i=0;i<26;i++){const a=rng()*TAU,y=rr(-.1,.9);const r=hykMilLatheR(L,a,y+.3)+.03;const s=rr(.08,.2);kput('hkBarnB',[r*Math.cos(a),y,PZ+r*Math.sin(a)],null,[s,s*.7,s],grey);}
 hykFloor(0,PZ,.05,3.1,{});
 // the pad: the top plate, its lip, the parapet lip over the front half (a tapering sausage along the rim), the rail behind
 hykPut('hkShell',hykDisc(0,PY,PZ,PR,{col:colW,nu:64,lobes:{n:9,amp:.015}}));kput('hkLip',[0,PY+.03,PZ],qEuler(Math.PI/2,0,0),[PR*1.03,PR*1.03,.9],col);
 hykPut('hkShell',hykSurf((u,v)=>{const th=u*Math.PI,ph=v*TAU;const k=Math.pow(Math.min(1,u*5,(1-u)*5),.6);const r=PR-.12+.55*k*Math.cos(ph);return [r*Math.cos(th),PY+.4+.46*k*Math.sin(ph),PZ+r*Math.sin(th)];},56,10,{col,uS:Math.PI*PR/4,vS:.8}));
 const AS=Math.PI+1.1;   // the stair lands here (the back-left of the pad)
 for(const [a0,a1] of [[Math.PI+.05,AS-.22],[AS+.22,TAU-.05]])hykMilRail(hykMilArc(0,PY,PZ,PR*.92,PR*.92,a0,a1),{h:1.05,col:bone,every:1.3});
 {const ax=Math.cos(AS),az=Math.sin(AS);const A=[ax*(PR-.4),PY,PZ+az*(PR-.4)];const B=[ax*(PR+5.0),0,PZ+az*(PR+5.0)];hykMilFlight(A,B,{w:1.6,col:bone});}
 // ---- the engine
 const EZ=PZ-.3,K=1.3;const E=(x,y,z)=>[x*K,PY+(y-PY)*K,EZ+(z-EZ)*K],S3=s=>[s[0]*K,s[1]*K,s[2]*K];   // drawn at unit scale about (0,PY,EZ), scaled K
 hykPut('hkBone',hykMilLathe({H:.95*K,cx:0,cz:EZ,yBase:PY,rFn:y=>K*(.5-.1*(y/(.95*K))),nu:18,nv:6,flute:{n:9,amp:.12,sharp:1.4},col:bone}));hykPut('hkBone',hykMilFlare([0,PY+.02,EZ],[0,1,0],.5*K,.45*K,{col:bone}));
 kput('hkBall',E(0,PY+1.02,EZ),null,S3([.3,.26,.3]),bone);
 const S0=E(0,PY+1.2,EZ-2.3),S1=E(0,PY+1.55,EZ+2.5);const stock=[];for(let i=0;i<=10;i++){const t=i/10;stock.push([0,S0[1]+(S1[1]-S0[1])*t,S0[2]+(S1[2]-S0[2])*t]);}
 hykPut('hkBone',hykTube(stock,t=>K*.16*(1-.3*t)*(1+.2*Math.max(0,Math.cos(t*4*TAU))),{seg:8,col:bone}));kput('hkBall',S0,null,S3([.24,.22,.24]),bone);kput('hkBall',S1,null,S3([.14,.14,.14]),bone);
 const th=.72;const SH=[0,S0[1]+(S1[1]-S0[1])*th,S0[2]+(S1[2]-S0[2])*th];
 hykPut('hkBone',hykTube([-1.95,-1.0,0,1.0,1.95].map(x=>[x*K,SH[1],SH[2]]),t=>K*.13*(1+.25*Math.max(0,Math.cos(t*2*TAU))),{seg:8,col:bone}));
 for(const s of [-1,1]){hykPut('hkShell',hykMilLathe({H:.9*K,cx:s*1.45*K,cz:SH[2],yBase:SH[1]-.45*K,rFn:y=>K*.3*(1+.35*Math.sin(Math.PI*y/(.9*K))),nu:16,nv:8,rings:{n:3,amp:.05},col}));   // the torsion cradle
  const a=[s*1.45*K,SH[1]+.4*K,SH[2]],c1=[s*2.3*K,SH[1]+.46*K,SH[2]-.1*K],b=[s*3.0*K,SH[1]+.5*K,SH[2]-1.25*K];const arm=[];
  for(let i=0;i<=10;i++){const t=i/10,u=1-t;arm.push([u*u*a[0]+2*u*t*c1[0]+t*t*b[0],u*u*a[1]+2*u*t*c1[1]+t*t*b[1],u*u*a[2]+2*u*t*c1[2]+t*t*b[2]]);}
  hykPut('hkBone',hykTube(arm,t=>K*(.1-.045*t),{seg:7,col:bone}));kput('hkBall',a,null,S3([.18,.16,.18]),bone);kput('hkBall',b,null,S3([.07,.07,.07]),bone);}
 const SL=E(0,PY+1.42,EZ-.95);hykPut('hkWeed',hykTube([[-3.0*K,SH[1]+.5*K,SH[2]-1.25*K],SL,[3.0*K,SH[1]+.5*K,SH[2]-1.25*K]],()=>.045*K,{seg:6,col:weed}));kput('hkBall',SL,null,S3([.13,.12,.13]),bone);
 hykPut('hkShell',hykMilLathe({H:.28*K,cx:0,cz:EZ-.5*K,yBase:PY+1.5*K,rFn:y=>K*(.12+.22*Math.sqrt(y/(.28*K))),nu:16,nv:5,col:colW}));kput('hkBall',E(0,PY+1.72,EZ-.5),null,S3([.2,.2,.2]),grey);   // the shot cup and its shot
 hykPut('hkBone',hykTube([E(-.55,PY+1.25,EZ-2.0),E(.55,PY+1.25,EZ-2.0)],()=>.14*K,{seg:8,col:bone}));
 for(const s of [-1,1]){const e=E(s*.78,PY+1.25+.42,EZ-1.85);hykPut('hkBone',hykTube([E(s*.55,PY+1.25,EZ-2.0),e],()=>.04*K,{seg:6,col:bone}));kput('hkBall',e,null,S3([.08,.08,.08]),bone);}
 // ---- the shot rack: a lobed shell trough of stone shot
 {const RX=3.9,RZ=PZ-1.2;hykPut('hkShell',hykMilLathe({H:.6,cx:RX,cz:RZ,yBase:PY,rFn:y=>1.05-.2*(1-y/.6),nu:28,nv:5,lobes:{n:2,amp:.28},rings:{n:2,amp:.03},col:colW}));
  hykPut('hkFloor',hykDisc(RX,PY+.12,RZ,.9,{col:hC(hPick(HPAL.floor)),nu:20,lobes:{n:2,amp:.28}}));
  for(let i=0;i<5;i++)kput('hkBall',[RX-.92+i*.46,PY+.34,RZ],null,[.22,.22,.22],grey);for(let i=0;i<4;i++)kput('hkBall',[RX-.69+i*.46,PY+.72,RZ],null,[.22,.22,.22],grey);}
 // the magazine: shot and cord in store, a work spot at the door
 const room=hykRoom('store',hykCirclePoly(0,PZ,2.6,14),.05,2.5,{doors:[[0,PZ-L.rFn(1.5),2.0]],wealth:.6});
 hykSpot(room,'store',-1.5,PZ+.7,.5,1.2,.7);hykSpot(room,'store',1.5,PZ+.7,-.5,1.2,.7);hykSpot(room,'work',0,PZ+1.6,0,1.0,1.0);
 hykReg('Ballista emplacement',0,PZ-1,8.2,PY+3.2);}
HYK.def({key:'hyk_ballista',name:'Ballista emplacement',family:'military',row:'Military',w:12,d:15.5,h:5.6,tags:{type:['military'],wealth:'civic',lit:false},build:hykMilBallista});
// ---------------------------------------------------------------- the mustering ground
// An open court of scale paving inside a rimstone wall, entered through a gate pod (a tunnel through a shell mound between
// two urchin spires); a reviewing stand at the far end (a low lily-pad dais with a rail and treads) under a scallop-fan
// canopy on bone props; bone weapon racks round the edge, spears leaning in them. Mostly ground: light on triangles.
function hykMilRack(x,z,yaw,col,nac){const P=(lx,ly,lz)=>{const q=loc(x,z,lx,lz,yaw);return [q[0],ly,q[1]];};
 hykPut('hkBone',hykRib(P(-.95,.0,0),P(.95,.0,0),{rise:1.55,r0:.1,r1:.07,knuckles:3,n:12,seg:6,col}));
 for(const lx of [-.95,.95]){const q=P(lx,0,0);kput('hkBall',[q[0],.06,q[2]],null,[.18,.14,.18],col);hykPut('hkBone',hykMilFlare([q[0],.03,q[2]],[0,1,0],.1,.3,{col}));}
 for(let i=0;i<5;i++){const lx=-.6+i*.3;const b=P(lx,1.28,.36-.22);kput('hkPost',b,vQ(yaw,-.17,0),[.025,2.6,.025],col);
  const t=P(lx,2.56+.14,.36-.44);kput('hkDrip',t,vQ(yaw,-.17,0),[.07,.32,.07],nac);}}
function hykMilMuster(G,o){reseed(30820+(o.v|0));
 const col=hC(hPick(HPAL.shell)),colW=hC(hPick(HPAL.shellWarm)),bone=hC(hPick(HPAL.bone)),nac=hC(hPick(HPAL.nacre));
 const RX=24,RZ=16.5,E=2.4,GZ=RZ*1.08;
 // ---- the court and its wall, open at the gate
 hykMilPave(0,0,RX,RZ,.04,{mat:'hkMosaic',col:hC(hPick(HPAL.shell),.94),n:120,e:E,lobes:{n:13,amp:.015},curb:true});
 {const pts=[];const d=.15,n=120;for(let i=0;i<=n;i++){const a=Math.PI/2+d+(TAU-2*d)*i/n;const q=hykMilSuperPt(0,0,RX*1.08,RZ*1.08,E,a);pts.push([q[0],.0,q[1]]);}hykMilWall(pts,{r:.4,col,mat:'hkShell'});}
 // ---- the gate: a tunnel through a shell mound, a spire either side
 {const PG={a:4.6,b:3.3,c:2.5,e1:.9,e2:.85};const el=hykMilPodEl(PG,.05+1.2);
  const pod=hykMilPod(Object.assign({},PG,{nu:52,nv:26,noise:{amp:.03,su:4,sv:3,seed:41},col,openings:[{th:0,el,r:1.2,ky:1.0,kind:'door'},{th:Math.PI,el,r:1.2,ky:1.0,kind:'back'},{th:Math.PI/2,el:.5,r:.36,kind:'window'},{th:-Math.PI/2,el:.5,r:.36,kind:'window'}],hollow:{t:.08,col}}));
  pod.geo.translate(0,0,GZ);hykPut('hkShell',pod.geo);pod.inner.translate(0,0,GZ);hykPut('hkIn',pod.inner,true);
  for(const op of pod.openings){op.p=[op.p[0],op.p[1],op.p[2]+GZ];if(op.kind==='door')hykDoor(op,{level:'ground',nacre:true,depth:.6});else if(op.kind==='back')hykDoor(op,{level:'ground',nacre:true,depth:.6,room:'court'});else hykWin(op,{nacre:true});}
  hykMilSkirt(0,GZ,PG.a*.9,PG.c*.9,2/PG.e2,1.3,{col,y0:-.05});hykFloor(0,GZ,.05,PG.a*.8,{});kput('hkBall',[0,PG.b*.82+PG.b-.12,GZ],null,[.42,.36,.42],nac);
  for(const s of [-1,1]){const x=s*6.6,SH=6.5;hykPut('hkShell',hykMilLathe({H:SH,cx:x,cz:GZ,yBase:-.2,rFn:y=>.95*Math.pow(1-y/SH,.75)+.04,nu:20,nv:14,flute:{n:8,amp:.2,sharp:1.3},twist:.5,rings:{n:9,amp:.03},col:colW}));
   hykPut('hkShell',hykMilFlare([x,-.02,GZ],[0,1,0],.98,.9,{col:colW}));kput('hkBall',[x,SH-.25,GZ],null,[.12,.12,.12],nac);}}
 // ---- the reviewing stand: a low lily-pad dais railed round the back, treads up its front, under a scallop fan on bone props
 const DZ=-12.0,DY=1.15,DR=4.3;hykPad(0,DY,DZ,DR,{col:colW,rail:{a0:Math.PI/2,gap:1.5,col:bone}});hykPut('hkShell',hykMilFlare([0,.02,DZ],[0,1,0],1.3,1.0,{col:colW}));
 for(let i=0;i<3;i++)kput('hkTread',[0,DY-.28*(i+1)+.06,DZ+DR*.97+.22+.42*i],null,[3.4,.12,.5],bone);
 {const hg=[0,1.35,DZ-3.9],tau=.49,FR=6.0;const up=[0,Math.cos(tau),Math.sin(tau)],nn=[0,-Math.sin(tau),Math.cos(tau)];
  const fan=(sign,off,fc)=>hykSurf((u,v)=>{const t=(u-.5)*2*1.26;const r=.3+(FR-.3)*(1+.04*Math.cos(14*t))*v;const w=.2*Math.cos(14*t)*(r/FR)+off;
   return [hg[0]+r*Math.sin(t)+nn[0]*w,hg[1]+r*Math.cos(t)*up[1]+nn[1]*w,hg[2]+r*Math.cos(t)*up[2]+nn[2]*w];},48,14,{col:fc,uS:3,vS:1.5,flip:sign<0});
  hykPut('hkShell',fan(1,0,colW));hykPut('hkShell',fan(-1,-.1,col));
  kput('hkBall',[hg[0],hg[1]+.05,hg[2]],null,[.5,.42,.5],bone);hykPut('hkBone',hykMilFlare([hg[0],DY+.02,hg[2]],[0,1,0],.4,.5,{col:bone}));
  for(const s of [-1,1]){const t=s*.73,r=4.6;const b=[hg[0]+r*Math.sin(t),hg[1]+r*Math.cos(t)*up[1],hg[2]+r*Math.cos(t)*up[2]];const a=[s*3.5,DY,DZ-1.2];
   hykPut('hkBone',hykRib(a,b,{rise:.5,r0:.2,r1:.12,knuckles:2,n:12,seg:7,col:bone}));kput('hkBall',[a[0],a[1]+.1,a[2]],null,[.3,.26,.3],bone);hykPut('hkBone',hykMilFlare([a[0],DY+.02,a[2]],[0,1,0],.2,.4,{col:bone}));kput('hkBall',b,null,[.22,.2,.22],bone);}}
 // ---- weapon racks round the edge, facing the centre
 for(const a of [1.95,2.55,3.15,3.75,5.65,6.25,6.85,7.45]){const q=hykMilSuperPt(0,0,RX*.9,RZ*.9,E,a);hykMilRack(q[0],q[1],Math.atan2(-q[0],-q[1]),bone,nac);}
 const court=hykRoom('court',hykMilEllipsePoly(0,0,RX*.95,RZ*.95,28,E),.04,6,{doors:[[0,GZ-2.5,2.4,'gate']],wealth:.6});
 hykSpot(court,'work',0,-2,0,1.0,1.0);
 hykReg('Mustering ground',0,0,28,8);}
HYK.def({key:'hyk_muster',name:'Mustering ground',family:'military',row:'Military',w:54,d:40,h:8,tags:{type:['military'],wealth:'civic',lit:false},build:hykMilMuster});
