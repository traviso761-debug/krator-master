// ================================================================= HYKKOUSOI — housing (agent A): nine houses and six grown-on pods
// The Hykkousoi housing set (DESIGN §4, §6, §7): three poor, three middle and three rich free-standing houses, each a
// different shell form, and six pods grown onto a host in the G frame. Everything is a lathe, a pod, a fillet, a rib or
// a disc from 61-hyk-shell.js; every opening goes through hykDoor/hykWin, every lamp through hykLight on a bracket,
// every room through hykRoom + hykSpot. No box anywhere. Seeds 30300–30399, six apart (fifteen builders in one block
// cannot sit eight apart; the sheet builds v = 0 only).
// ---------------------------------------------------------------- shared helpers (prefix hykHouse…)
// the modulated radius of a lathe (61's own formula without the geometry), so an opening sits ON a fluted or lobed shell
function hykHouseLatheR(o,th,y){let r=o.rFn(y);const u=th/TAU,H=o.H;
 if(o.lobes)r*=1+o.lobes.amp*Math.cos(o.lobes.n*th+(o.lobes.ph||0));
 if(o.flute)r*=1+o.flute.amp*Math.pow(.5+.5*Math.cos(o.flute.n*th+(o.twist||0)*y),o.flute.sharp||2);
 if(o.rings)r*=1+o.rings.amp*Math.sin(y/H*o.rings.n*TAU);
 if(o.noise)r*=1+o.noise.amp*(fbm(u*(o.noise.su||3)+(o.noise.seed||0),y/(o.noise.sv||2),o.noise.seed||1,2)-.5)*2;
 return Math.max(0,r);}
// a point and outward normal on a modulated lathe at azimuth th (from +x toward +z; the front is PI/2) and height y
function hykHouseLatheAt(o,th,y){const cx=o.cx||0,cz=o.cz||0,yB=o.yBase||0;th=((th%TAU)+TAU)%TAU;
 const r=hykHouseLatheR(o,th,y),e=.04,et=.012;const ry=hykHouseLatheR(o,th,y+e),rt=hykHouseLatheR(o,th+et,y);
 const P=[cx+r*Math.cos(th),yB+y,cz+r*Math.sin(th)];
 const n=new THREE.Vector3().crossVectors(new THREE.Vector3(rt*Math.cos(th+et)-r*Math.cos(th),0,rt*Math.sin(th+et)-r*Math.sin(th)),new THREE.Vector3((ry-r)*Math.cos(th),e,(ry-r)*Math.sin(th))).normalize();
 if(n.x*Math.cos(th)+n.z*Math.sin(th)<0)n.negate();return {p:P,n:[n.x,n.y,n.z]};}
// an opening record on a lathe: push it into L.ops before the lathe is built
function hykHouseOp(L,th,y,r,ky,kind){const a=hykHouseLatheAt(L,th,y);return {p:a.p,n:a.n,r,ky:ky||1,kind:kind||'window'};}
// a lathe body: the shell, its inner skin (wound inward, into the interior bucket) and the fillet into the ground
function hykHouseLathe(L,mat,o){o=o||{};hykPut(mat,hykLathe(L));
 if(o.inner!==false){const k=o.k||.92;hykPut('hkIn',hykLathe(Object.assign({},L,{rFn:y=>L.rFn(y)*k,flip:true,col:o.inCol||hC(hPick(HPAL.shell),.88),noise:null})),true);}
 if(o.flare!==false){const f=o.flare||L.rFn(0)*.3;const R=L.rFn(f)*(1-(L.lobes?L.lobes.amp:0))*(1-(L.noise?L.noise.amp:0))*.97;
  hykPut(mat,hykFlare([L.cx||0,(L.yBase||0)+.02,L.cz||0],[0,1,0],R,f,{col:L.col}));}}
// the horizontal radius of a superellipsoid pod at height y above the ground
function hykHousePodR(P,y){const cy=P.cy!=null?P.cy:P.b*.82;const s=Math.min(.999,Math.abs((y-cy)/P.b));const sp=Math.pow(s,1/(P.e1||1));const cp=Math.sqrt(Math.max(0,1-sp*sp));return (P.a+P.c)/2*Math.pow(cp,P.e1||1);}
// a pod at (dx,dz): the shell, the inner skin, the openings moved with it, a fillet into the ground unless o.flare === false
function hykHousePod(P,mat,dx,dz,o){o=o||{};dx=dx||0;dz=dz||0;const pod=hykPod(P);pod.geo.translate(dx,0,dz);hykPut(mat,pod.geo);
 if(pod.inner){pod.inner.translate(dx,0,dz);hykPut('hkIn',pod.inner,true);}
 for(const op of pod.openings)op.p=[op.p[0]+dx,op.p[1],op.p[2]+dz];
 pod.cx=dx;pod.cz=dz;pod.at=(th,el)=>{const u=((th/TAU)%1+1)%1,v=clamp(el/Math.PI+.5,.02,.98);const s=pod.surf(u,v);return [s[0]+dx,s[1],s[2]+dz];};
 pod.out=(th,el)=>{const p=pod.at(th,el);const v=[p[0]-dx,p[1]-pod.cy,p[2]-dz];const l=Math.hypot(v[0],v[1],v[2])||1;return [v[0]/l,v[1]/l,v[2]/l];};
 if(o.flare!==false){const f=o.flare||Math.min(P.a,P.c)*.32;hykPut(mat,hykFlare([dx,.02,dz],[0,1,0],hykHousePodR(P,f)*.96,f,{col:P.col}));}
 return pod;}
// the openings of a pod, drawn: doors (kind 'door') and windows, with the door recorded; returns the door op
function hykHouseOpenings(pod,o){o=o||{};let door=null;for(const op of pod.openings){if(op.kind==='door'){door=door||op;hykDoor(op,Object.assign({level:'ground'},o.door||{}));}else hykWin(op,o.win||{});}return door;}
function hykHouseLatheOpenings(L,o){o=o||{};let door=null;for(const op of (L.ops||[])){if(op.kind==='door'){door=door||op;hykDoor(op,Object.assign({level:'ground'},o.door||{}));}else hykWin(op,o.win||{});}return door;}
// a lens dome on a drum top: a lathe dome, lenses set in rings, an optional spire finial. rows: [{y (0..H), n, s}]
function hykHouseDome(cx,cz,yB,R,H,mat,col,o){o=o||{};const D={H,cx,cz,yBase:yB,rFn:y=>R*Math.sqrt(Math.max(0,1-Math.pow(y/H,o.e||2.2)))+.04,nu:o.nu||40,nv:o.nv||12,rings:{n:3,amp:.025},col};
 hykPut(mat,hykLathe(D));kput(o.nacre?'hkLipN':'hkLip',[cx,yB+.02,cz],qEuler(Math.PI/2,0,0),[R*1.04,R*1.04,1.1],col);
 for(const row of (o.rows||[])){const r=D.rFn(row.y);for(let i=0;i<row.n;i++){const a=i/row.n*TAU+(row.off||0);kput('hkLens',[cx+r*Math.cos(a)*.98,yB+row.y,cz+r*Math.sin(a)*.98],null,row.s,hC(hPick(HPAL.lens)));}}
 if(o.spire)hykHouseSpire(cx,cz,yB+H-o.spire*.12,o.spire,o.spireR||R*.2,mat,col,{twist:o.twist});return D;}
// a twisted fluted spire (an urchin spine), base radius r0, height H
function hykHouseSpire(cx,cz,yB,H,r0,mat,col,o){o=o||{};hykPut(mat,hykLathe({H,cx,cz,yBase:yB,rFn:y=>r0*Math.pow(1-y/H,o.pow||.82)+.03,nu:o.nu||16,nv:o.nv||10,flute:{n:o.n||7,amp:o.amp||.14,sharp:1.3},twist:o.twist!=null?o.twist:.8,col}));}
// a spike (a drip cone) rooted in a shell at p, pointing along n: its base sits .15 m inside the surface
function hykHouseSpike(p,n,len,r,col){const N=new THREE.Vector3(n[0],n[1],n[2]).normalize();const q=new THREE.Quaternion().setFromUnitVectors(_UP,N);
 const c=len/2-.15;kput('hkDrip',[p[0]+N.x*c,p[1]+N.y*c,p[2]+N.z*c],q,[r,len,r],col);}
// a lamp half a metre off the shell at p, on a bracket anchored at p (nothing floats)
function hykHouseLamp(p,n,o){o=o||{};const l=Math.hypot(n[0],n[1],n[2])||1;const d=o.d||.5;hykLight(p[0]+n[0]/l*d,p[1]+n[1]/l*d+.12,p[2]+n[2]/l*d,Object.assign({r:.2,bracket:p},o));}
// a straight flight of treads from a up to b, w wide, with a bone string under each edge and a rail (o.rail: true | -1 | 1)
function hykHouseStair(a,b,w,col,o){o=o||{};const rise=.19;const n=Math.max(2,Math.round((b[1]-a[1])/rise));const dx=b[0]-a[0],dz=b[2]-a[2];const L=Math.hypot(dx,dz)||1;const ux=dx/L,uz=dz/L;const rx=-uz,rz=ux;const ang=Math.atan2(ux,uz);
 for(let i=0;i<n;i++){const t=(i+.5)/n;kput('hkTread',[a[0]+dx*t,a[1]+(b[1]-a[1])*(i+1)/n-.06,a[2]+dz*t],qEuler(0,ang,0),[w,.12,L/n*1.08],col);}
 for(const s of [-1,1]){const e0=[a[0]+rx*s*w*.5,a[1]-.1,a[2]+rz*s*w*.5],e1=[b[0]+rx*s*w*.5,b[1]-.1,b[2]+rz*s*w*.5];hykPut('hkBone',hykTube([e0,e1],()=>.11,{seg:6,col}));
  if(o.rail&&(o.rail===true||o.rail===s)){const r0=[e0[0],e0[1]+1.0,e0[2]],r1=[e1[0],e1[1]+1.0,e1[2]];hykPut('hkBone',hykTube([r0,r1],()=>.06,{seg:6,col}));
   for(let i=0;i<=3;i++){const t=i/3;const p=[e0[0]+(e1[0]-e0[0])*t,e0[1]+(e1[1]-e0[1])*t,e0[2]+(e1[2]-e0[2])*t];kput('hkPost',[p[0],p[1]+.5,p[2]],null,[.05,1.0,.05],col);}}}}
// a fillet strip along any curve on the ground: edge(u) -> [x,z], reaching f outward and h up the shell, concave like
// hykFlare. The curve's outward side is the right-hand side of its direction unless o.left.
function hykHouseSkirt(edge,f,h,mat,col,o){o=o||{};const nu=o.nu||48;const N=u=>{const a=edge(Math.max(0,u-.004)),b=edge(Math.min(1,u+.004));let nx=b[1]-a[1],nz=-(b[0]-a[0]);const l=Math.hypot(nx,nz)||1;nx/=l;nz/=l;if(o.left){nx=-nx;nz=-nz;}return [nx,nz];};
 const fn=(u,v)=>{const e=edge(u),n=N(u);const s=v*Math.PI/2;const off=f*(1-Math.sin(s)),up=h*(1-Math.cos(s));return [e[0]+n[0]*off,(o.y||0)+up,e[1]+n[1]*off];};
 const p0=fn(0,0),pu=fn(.01,0),pv=fn(0,.1);const n0=N(0);const nn=new THREE.Vector3().crossVectors(new THREE.Vector3(pv[0]-p0[0],pv[1]-p0[1],pv[2]-p0[2]),new THREE.Vector3(pu[0]-p0[0],pu[1]-p0[1],pu[2]-p0[2]));
 const flip=(nn.x*n0[0]+nn.z*n0[1]+nn.y)<0;hykPut(mat,hykSurf(fn,nu,o.nv||6,{col,flip}));}
// a floor plate with a stairwell cut out of it: the well is the arc a0..a1 at radius > ri
function hykHouseFloorWell(cx,cz,y,R,ri,a0,a1,col){const span=((a1-a0)%TAU+TAU)%TAU;const inArc=a=>(((a-a0)%TAU+TAU)%TAU)<=span;
 hykPut('hkFloor',hykSurf((u,v)=>{const th=u*TAU;return [cx+R*v*Math.cos(th),y,cz+R*v*Math.sin(th)];},36,6,{col,flip:true,hole:(u,v,p)=>{const r=Math.hypot(p[0]-cx,p[2]-cz);return r>ri&&inArc(Math.atan2(p[2]-cz,p[0]-cx));}}),true);}
// the residence spots of a round room: bed at the back, store and food at the sides, a hearth before the bed when asked.
// (cx,cz) the room centre, (dx,dz) the direction to the door, k the room's radius over 3.3. Sizes are DESIGN §7's.
function hykHouseBedSpots(room,cx,cz,dx,dz,k,o){o=o||{};const ph=Math.atan2(dx,dz);const c=Math.cos(ph),s=Math.sin(ph);const W=(px,pz)=>[cx+px*c+pz*s,cz-px*s+pz*c];
 const put=(kind,px,pz,ry,w,d)=>{const p=W(px*k,pz*k);hykSpot(room,kind,p[0],p[1],ph+ry,w,d);};
 put('bed',0,-1.9,0,2.1,1.0);put('store',2.0,.4,Math.PI/2,1.2,.7);put('food',-2.0,.4,0,.8,.8);
 if(o.table){put('hearth',1.5,-.8,0,.8,.8);put('table',-.6,1.1,0,1.4,1.4);}else{if(o.hearth)put('hearth',0,.6,0,.8,.8);if(o.seat)put('seat',0,.95,0,.9,.8);}}
// a collar where a bud joins a round body: a fillet on the body's face whose rim lies inside the bud
function hykHouseNeck(A,B,mat,col){const dx=B.cx-A.cx,dy=B.cy-A.cy,dz=B.cz-A.cz;const d=Math.hypot(dx,dy,dz)||1;const n=[dx/d,dy/d,dz/d];
 const sA=A.r-.3,plane=d-B.r*.45;const f=plane-sA;if(f<.25)return;const R=Math.sqrt(Math.max(0,B.r*B.r-Math.pow(B.r*.45,2)))*.9;
 hykPut(mat,hykFlare([A.cx+n[0]*sA,A.cy+n[1]*sA,A.cz+n[2]*sA],n,R,f,{col}));}
// the spots of a hall: hearth, table, food and a seat, for a room of radius 3.6 k
function hykHouseHallSpots(room,cx,cz,dx,dz,k,o){o=o||{};const ph=Math.atan2(dx,dz);const c=Math.cos(ph),s=Math.sin(ph);const W=(px,pz)=>[cx+px*c+pz*s,cz-px*s+pz*c];
 const put=(kind,px,pz,ry,w,d)=>{const p=W(px*k,pz*k);hykSpot(room,kind,p[0],p[1],ph+ry,w,d);};
 put('hearth',1.4,-1.7,0,1.0,1.0);put('table',-.5,-.4,0,1.4,1.4);put('food',2.3,.9,0,.8,.8);put('seat',-2.0,1.4,.4,1.2,.9);if(o.shrine)put('shrine',-2.1,-1.5,-.7,.7,.5);}
// a world bearing (for hykStairSpiral and hykPad rails) from a local azimuth about +x toward +z
function hykHouseWorldA(th){const n=hykN(Math.cos(th),0,Math.sin(th));return Math.atan2(n[2],n[0]);}
// run fn with the building's frame suspended: hykPad and hykStairSpiral take WORLD coordinates, but hykPut and kput
// apply the current frame's transform to everything they are given, so called inside a builder they would move a
// world-placed pad or stair twice (62-hyk-helpers.js: o.landing / hykPad under HYK.cur). Convert with hykW first.
function hykHouseWorld(fn){const cur=HYK.cur,xf=KXF;HYK.cur=null;KXF=null;try{fn();}finally{HYK.cur=cur;KXF=xf;}}
// a lip and a reveal for a passage between two rooms of one house (no mark: it is not a door to the street)
function hykHousePass(op,nacre){const n=new THREE.Vector3(op.n[0],op.n[1],op.n[2]).normalize();const P=op.p,r=op.r,ky=op.ky||1;const q=qFacing([n.x,n.y,n.z]);
 kput(nacre?'hkLipN':'hkLip',[P[0]+n.x*.05,P[1]+n.y*.05,P[2]+n.z*.05],q,[r*1.04,r*1.04*ky,r*1.4],hC(hPick(nacre?HPAL.nacre:HPAL.shell)));
 const d=Math.max(.6,r*.5);kput('hkReveal',[P[0],P[1],P[2]],new THREE.Quaternion().setFromUnitVectors(_UP,n),[r*.985,d,r*.985*ky],null);}
// the elevation (radians) on a pod at which its surface stands at height y (the door's centre: floor + r*ky)
function hykHousePodEl(P,y){const cy=P.cy!=null?P.cy:P.b*.82;const s=clamp((y-cy)/P.b,-.999,.999);return Math.asin(Math.sign(s)*Math.pow(Math.abs(s),1/(P.e1||1)));}
// a fillet that joins a bud to a round body: the contact is sunk by the body's sagitta at the fillet's base radius so
// the base ring lies on the curved face instead of floating off its tangent plane
function hykHouseJoin(p,n,Rs,R,f,mat,col){const rim=R+f;const sag=Rs-Math.sqrt(Math.max(0,Rs*Rs-rim*rim));const l=Math.hypot(n[0],n[1],n[2])||1;
 hykPut(mat,hykFlare([p[0]-n[0]/l*sag,p[1]-n[1]/l*sag,p[2]-n[2]/l*sag],n,R,f+sag,{col}));}
// a small barnacle: a fluted cone with an oblique rim, a lip at the apex, a fillet into the ground. Returns its lathe.
function hykHouseBarnacle(cx,cz,rb,h,mat,col,o){o=o||{};const L={H:h,cx,cz,yBase:-.3,rFn:y=>rb*Math.pow(Math.max(0,1-y/h),o.pow||.7)+.14,nu:o.nu||28,nv:12,flute:{n:o.n||14,amp:.09,sharp:1.5},rings:{n:5,amp:.025},noise:{amp:.03,su:4,sv:1,seed:(cx*7|0)+3},tilt:{amp:o.tilt||.18,dir:o.dir||0},col,ops:o.ops||[]};
 hykPut(mat,hykLathe(L));if(o.inner){hykPut('hkIn',hykLathe(Object.assign({},L,{rFn:y=>L.rFn(y)*.9,flip:true,noise:null,col:hC(hPick(HPAL.barnacle),.85)})),true);}
 hykPut(mat,hykFlare([cx,.02,cz],[0,1,0],rb*.95,rb*.3,{col}));
 const top=h*(1-(o.tilt||.18)*.5)-.3;kput('hkLip',[cx,top+.02,cz],qEuler(Math.PI/2,0,0),[.2,.2,.9],col);kput('hkDisc',[cx,top,cz],qEuler(-Math.PI/2,0,0),[.17,.17,1],null);return L;}
// the spots of a small hall (radius 2.1 k): a hearth, a table, a seat
function hykHouseSmallHall(room,cx,cz,dx,dz,k){const ph=Math.atan2(dx,dz);const c=Math.cos(ph),s=Math.sin(ph);const W=(px,pz)=>[cx+px*c+pz*s,cz-px*s+pz*c];
 const put=(kind,px,pz,ry,w,d)=>{const p=W(px*k,pz*k);hykSpot(room,kind,p[0],p[1],ph+ry,w,d);};put('hearth',.9,-.9,0,.8,.8);put('table',-.3,.2,0,1.0,1.0);put('seat',-1.0,-.8,0,.9,.8);}
// a surface wound so its normal agrees with dir (the first vertex normal is checked, and the surface rebuilt flipped)
function hykHouseSurfFacing(fn,nu,nv,o,dir){let g=hykSurf(fn,nu,nv,Object.assign({},o,{flip:false}));const n=g.attributes.normal;if(n.getX(0)*dir[0]+n.getY(0)*dir[1]+n.getZ(0)*dir[2]<0)g=hykSurf(fn,nu,nv,Object.assign({},o,{flip:true}));return g;}
// ---- grown-on helpers (the G frame: origin on the host's face at the floor datum, +z out of the face, x along it)
// the landing before a pod's door: a railed lily pad on a rib grown out of the face below the pod, the rib rooted
// with a flare and a knuckle. The pad is built with the frame suspended (hykHouseWorld) and recorded on the host.
function hykHouseLanding(o,lx,ly,lz,R,opt){opt=opt||{};const w=hykW(lx,ly,lz);const a0=hykHouseWorldA(-Math.PI/2);const bone=hC(hPick(HPAL.bone));
 hykHouseWorld(()=>hykPad(w[0],w[1],w[2],R,Object.assign({own:o.host.n,rail:{a0,gap:Math.min(2.4,1.6/(R*.9)),col:bone}},opt)));
 o.host.landings.push({x:w[0],y:w[1],z:w[2],r:R,level:o.level,a:o.a});
 const rz=o.faceZ(0,-3.4);hykPut('hkBone',hykRib([0,-3.4,rz-.5],[lx,ly-.45,lz],{rise:-1.4,r0:.36,r1:.26,knuckles:3,col:bone}));
 hykPut('hkBone',hykFlare([0,-3.4,rz+.03],[0,0,1],.4,.7,{col:bone}));kput('hkBall',[0,-3.4,rz+.72],null,[.38,.38,.38],bone);}
// drips hanging from a pod's underside, read off the superellipsoid itself (bases .22 m up inside the shell), clear of the face
function hykHousePodDrips(P,cz,o,col,n){for(let i=0;i<n;i++){const px=rr(-P.a*.72,P.a*.72),pz=cz+rr(-P.c*.6,P.c*.6);if(pz<o.faceZ(px,0)+.3)continue;const u=hykPodUnder(P.a,P.b,P.c,P.e1||1,P.e2||1,px,pz-cz);if(u==null)continue;
 const h=rr(.35,1.0)*P.a*.3;kput('hkDrip',[px,P.cy-u-h/2+.22,pz],qEuler(Math.PI,0,0),[h*.3,h,h*.3],col);}}
// a satellite bud beside a grown pod: a small hollow pod at (x,y) along the face, windows only, rooted with a fillet, drips
function hykHouseSat(o,x,y,R2,mat,col,seed,nacre){const fz=o.faceZ(x,y);const P={a:R2,b:R2*.9,c:R2,e1:.92,e2:.95,cy:y,nu:36,nv:20,noise:{amp:.03,su:4,sv:3,seed},col,hollow:{t:.08,col}};
 P.openings=[{th:0,el:.1,r:R2*.22,kind:'window'},{th:Math.sign(x)*1.1,el:.35,r:R2*.16,kind:'window'}];const pod=hykHousePod(P,mat,x,fz+R2*.35,{flare:false});
 for(const op of pod.openings)hykWin(op,{nacre});hykPut(mat,hykFlare([x,y,fz+.03],[0,0,1],R2*.9,R2*.5,{col}));hykHousePodDrips(P,fz+R2*.35,o,col,3);return pod;}
// a crust of barnacle specks on the host's face round a pod's skirt
function hykHouseCrust(o,R,n,y){for(let i=0;i<n;i++){const a=rr(0,TAU),r=R*rr(1.0,1.35);const x=r*Math.cos(a),yy=y+r*Math.sin(a);const s=rr(.1,.26);kput('hkBarnB',[x,yy,o.faceZ(x,yy-y)+.05],null,[s,s*.75,s*.6],hC(hPick(HPAL.barnacle)));}}
// the spots of a way-in pod about (cx,cz): the axis between its two doors stays clear, the bed lies along one side
function hykHouseWaySpotsAt(room,cx,cz,k,o){o=o||{};const S=(kind,px,pz,ry,w,d)=>hykSpot(room,kind,cx+px*k,cz+pz*k,ry,w,d);S('bed',-1.8,0,Math.PI/2,2.1,1.0);S('store',1.8,.95,Math.PI/2,1.2,.7);S('food',1.8,-1.05,0,.8,.8);
 if(o.hearth)S('hearth',-.3,-.95,0,.8,.8);if(o.table)S('table',.35,.95,0,1.1,1.1);if(o.seat)S('seat',-.2,1.2,0,.9,.8);}
// ---------------------------------------------------------------- POOR 1: the clam house. A low ribbed body, a ribbed lid lifted ajar at the
// front (the slot above the door is the clam's open mouth), two barnacle stores crowded against the back. Grey barnacle shell.
function hykHousePoor1(G,o){reseed(30300+(o.v|0));const col=hC(hPick(HPAL.barnacle)),col2=hC(hPick(HPAL.barnacle));const R=4.3,Hw=2.9;
 const L={H:Hw,cx:0,cz:0,yBase:0,rFn:y=>R*(.95+.05*Math.sin(Math.PI*y/Hw)),nu:56,nv:12,flute:{n:22,amp:.08,sharp:1.3},rings:{n:4,amp:.02},noise:{amp:.02,su:5,sv:1.5,seed:2},col};
 L.ops=[hykHouseOp(L,Math.PI/2,1.3,1.0,1.12,'door'),hykHouseOp(L,Math.PI/2+1.7,1.9,.4,1,'window'),hykHouseOp(L,Math.PI/2-1.7,1.8,.38,1,'window'),hykHouseOp(L,-Math.PI/2,1.9,.34,1,'window')];
 hykHouseLathe(L,'hkBarn',{flare:1.2,inCol:hC(hPick(HPAL.barnacle),.85)});
 // the lid: a ribbed dome pivoted about the wall top, its front edge .9 m up, its back edge bedded into the wall
 const Rl=R*1.03,Hl=2.3;const lid={H:Hl,cx:0,cz:0,yBase:0,rFn:y=>Rl*Math.sqrt(Math.max(0,1-Math.pow(y/Hl,2.4)))+.03,nu:56,nv:14,flute:{n:22,amp:.1,sharp:1.2},rings:{n:3,amp:.02},col:col2};
 const g1=hykLathe(lid);g1.rotateX(-.2);g1.translate(0,Hw-.05,0);hykPut('hkBarn',g1);
 const g2=hykLathe(Object.assign({},lid,{rFn:y=>lid.rFn(y)*.93,flip:true,col:hC(hPick(HPAL.barnacle),.85)}));g2.rotateX(-.2);g2.translate(0,Hw-.05,0);hykPut('hkIn',g2,true);
 kput('hkLip',[0,Hw-.05,0],qEuler(Math.PI/2-.2,0,0),[Rl*1.02,Rl*1.02,1.1],col2);   // the hinge lip round the lid's rim
 kput('hkBall',[0,Hw-.3,-Rl*.9],null,[.7,.5,.6],col2);kput('hkBall',[0,Hw+Hl-.5,-.3],null,[.5,.35,.5],col2);   // the umbo at the hinge, the apex knob
 hykHouseLatheOpenings(L,{});hykFloor(0,0,.12,R*.9,{});
 // the stores: two barnacles leaning against the back, one of them big enough to hold the nets
 hykHouseBarnacle(-4.6,-2.6,1.6,2.9,'hkBarn',col,{dir:2.4,tilt:.22});hykHouseBarnacle(4.2,-3.0,1.25,2.2,'hkBarn',col2,{dir:4.0,tilt:.2});hykHouseBarnacle(-3.0,-4.6,.9,1.5,'hkBarn',col,{dir:3.6});
 const room=hykRoom('bedroom',hykCirclePoly(0,0,3.55,14),.12,2.7,{doors:[[0,R,2.0]],residence:true,wealth:.15});hykHouseBedSpots(room,0,0,0,1,1.07,{hearth:true});
 hykReg('Clam house',0,-.6,7.0,5.3);}
HYK.def({key:'hyk_house_poor_1',name:'Clam house',family:'housing',row:'Housing — poor',w:13,d:12,h:5.4,tags:{type:['single-family dwelling'],wealth:'poor',lit:false},build:hykHousePoor1});
// ---------------------------------------------------------------- POOR 2: the stilt pod. A small pod carried 2.6 m up on four knuckled bone legs,
// a lipped deck before the door on a stalk, a straight stair with its rail, drips under the belly. Grey, no lamp.
function hykHousePoor2(G,o){reseed(30306+(o.v|0));const col=hC(hPick(HPAL.barnacle)),bone=hC(hPick(HPAL.bone));const R=3.2,b=2.7,cy=4.0,floorY=cy-b*.5;
 const P={a:R,b,c:R,e1:.9,e2:.92,cy,nu:48,nv:26,noise:{amp:.025,su:4,sv:3,seed:7},col,hollow:{t:.08,col:hC(hPick(HPAL.barnacle),.85)},openings:[]};
 P.openings=[{th:0,el:hykHousePodEl(P,floorY+1.15),r:1.0,ky:1.15,kind:'door'},{th:.95,el:.2,r:.4,kind:'window'},{th:-.95,el:.2,r:.4,kind:'window'},{th:Math.PI,el:.35,r:.42,kind:'window'},{th:.2,el:.95,r:.3,kind:'window'}];
 const pod=hykHousePod(P,'hkBarn',0,0,{flare:false});const door=hykHouseOpenings(pod,{});hykFloor(0,0,floorY,R*.8,{});
 kput('hkLip',[0,cy+b*.92,0],qEuler(Math.PI/2,0,0),[.26,.26,.9],col);   // the smoke vent at the crown
 // the legs: each from a splayed foot to a point read off the belly, rooted at both ends
 for(let i=0;i<4;i++){const th=Math.PI/4+i*Math.PI/2;const fx=Math.sin(th)*3.4,fz=Math.cos(th)*3.4;const tx=Math.sin(th)*2.0,tz=Math.cos(th)*2.0;const under=hykPodUnder(R,b,R,.9,.92,tx,tz)||b*.5;const ty=cy-under;
  hykPut('hkBone',hykRib([fx,-.3,fz],[tx,ty+.3,tz],{rise:0,r0:.3,r1:.22,knuckles:2,n:10,col:bone}));
  hykPut('hkBone',hykFlare([fx,.02,fz],[0,1,0],.32,.6,{col:bone}));const nl=Math.hypot(tx,ty-cy,tz)||1;hykPut('hkBarn',hykFlare([tx,ty,tz],[tx/nl,(ty-cy)/nl,tz/nl],.3,.45,{col}));}
 // the deck before the door on its stalk, and the stair up to it from the right, its top tread level with the deck
 const dz=door.p[2]+1.35,dy=floorY-.08;hykPut('hkBarn',hykDisc(0,dy,dz,1.55,{col,lobes:{n:7,amp:.07}}));hykPut('hkBarn',hykDisc(0,dy-.25,dz,1.5,{col,sag:-.3,down:true,lobes:{n:7,amp:.07}}));
 kput('hkLip',[0,dy+.02,dz],qEuler(Math.PI/2,0,0),[1.55,1.55,.8],col);kput('hkPost',[0,dy/2-.15,dz],null,[.24,dy-.3,.24],bone);hykPut('hkBone',hykFlare([0,.02,dz],[0,1,0],.26,.6,{col:bone}));
 hykHouseStair([4.6,0,dz+.6],[1.45,dy,dz+.2],1.1,bone,{rail:-1});
 // drips under the belly, read off the pod itself
 for(let i=0;i<9;i++){const px=rr(-2.2,2.2),pz=rr(-2.2,2.2);const u=hykPodUnder(R,b,R,.9,.92,px,pz);if(u==null)continue;const h=rr(.3,.8);kput('hkDrip',[px,cy-u-h/2+.2,pz],qEuler(Math.PI,0,0),[h*.3,h,h*.3],col);}
 const room=hykRoom('bedroom',hykCirclePoly(0,0,2.5,14),floorY,b*1.4,{doors:[[0,R,2.0]],residence:true,wealth:.15});hykHouseBedSpots(room,0,0,0,1,.76,{});
 hykReg('Stilt pod',0,.4,5.6,7.0);}
HYK.def({key:'hyk_house_poor_2',name:'Stilt pod',family:'housing',row:'Housing — poor',w:9.4,d:11,h:6.9,tags:{type:['single-family dwelling'],wealth:'poor',lit:false},build:hykHousePoor2});
// ---------------------------------------------------------------- POOR 3: the limpet house. One ringed limpet cone leaning forward, its apex
// over the door, lenses set in its roof, a barnacle store fused into its flank. Grey.
function hykHousePoor3(G,o){reseed(30312+(o.v|0));const col=hC(hPick(HPAL.barnacle)),col2=hC(hPick(HPAL.barnacle));const R=4.7,H=4.6,k=.3;
 const L={H,cx:0,cz:0,yBase:0,rFn:y=>R*Math.pow(Math.max(0,1-y/H),.6)+.06,nu:56,nv:18,flute:{n:18,amp:.06,sharp:1.5},rings:{n:9,amp:.028},noise:{amp:.02,su:4,sv:1.2,seed:5},col};
 const ops=[hykHouseOp(L,Math.PI/2,1.3,1.0,1.12,'door'),hykHouseOp(L,Math.PI/2+1.8,1.7,.4,1,'window'),hykHouseOp(L,Math.PI/2-1.9,1.9,.42,1,'window'),hykHouseOp(L,-Math.PI/2+.5,1.6,.34,1,'window')];L.ops=ops;
 const sh=new THREE.Matrix4().set(1,0,0,0, 0,1,0,0, 0,k,1,0, 0,0,0,1);   // the lean: z grows with y, the apex 1.4 m forward of the base centre
 const g1=hykLathe(L);g1.applyMatrix4(sh);hykPut('hkBarn',g1);const g2=hykLathe(Object.assign({},L,{rFn:y=>L.rFn(y)*.92,flip:true,noise:null,col:hC(hPick(HPAL.barnacle),.85)}));g2.applyMatrix4(sh);hykPut('hkIn',g2,true);
 hykPut('hkBarn',hykFlare([0,.02,0],[0,1,0],L.rFn(1.1)*.95,1.1,{col}));
 for(const op of ops){const p=op.p,n=op.n;const q={p:[p[0],p[1],p[2]+k*p[1]],n:[n[0],n[1]-k*n[2],n[2]],r:op.r,ky:op.ky,kind:op.kind};if(q.kind==='door')hykDoor(q,{level:'ground'});else hykWin(q,{});}
 for(let i=0;i<7;i++){const a=i/7*TAU+.2;const y=2.9;const r=L.rFn(y)*.99;kput('hkLens',[r*Math.cos(a),y,r*Math.sin(a)+k*y],null,.3,hC(hPick(HPAL.lens)));}
 kput('hkBall',[0,H-.1,k*H],null,[.32,.28,.32],col2);   // the apex nub
 hykFloor(0,0,.12,3.6,{});
 // the store: a barnacle fused into the left flank, its own fillet and a knuckle of crust where the two shells meet
 hykHouseBarnacle(-4.4,-1.2,1.6,2.8,'hkBarn',col2,{dir:2.8,tilt:.22});for(let i=0;i<5;i++)kput('hkBarnB',[-3.3+rr(-.3,.3),.5+i*.45,-1.0+rr(-.4,.4)],null,[.2,.14,.2],col2);
 const room=hykRoom('bedroom',hykCirclePoly(0,.2,3.2,14),.12,2.6,{doors:[[0,3.8,2.0]],residence:true,wealth:.15});hykHouseBedSpots(room,0,.2,0,1,.97,{});
 hykReg('Limpet house',-.6,0,6.6,4.8);}
HYK.def({key:'hyk_house_poor_3',name:'Limpet house',family:'housing',row:'Housing — poor',w:12,d:11,h:4.8,tags:{type:['single-family dwelling'],wealth:'poor',lit:false},build:hykHousePoor3});
// ---------------------------------------------------------------- MIDDLE 1: the barnacle tower. One tall twisted barnacle, two storeys: the hall
// below, the sleeping loft above, a stair of bone treads winding up the inside wall through a well in the loft floor; a
// lens cap with a spire. Cream shell, no lamp.
function hykHouseMid1(G,o){reseed(30318+(o.v|0));const col=hC(hPick(HPAL.shell)),col2=hC(hPick(HPAL.shellWarm)),bone=hC(hPick(HPAL.bone));const R0=4.0,Rt=2.5,H=8.2;
 const L={H,cx:0,cz:0,yBase:0,rFn:y=>R0+(Rt-R0)*Math.pow(y/H,.9)+.06*R0*Math.sin(Math.PI*y/H),nu:64,nv:26,flute:{n:14,amp:.07,sharp:1.6},twist:.05,rings:{n:10,amp:.025},noise:{amp:.02,su:4,sv:2,seed:3},col};
 const F=Math.PI/2;L.ops=[hykHouseOp(L,F,1.3,1.05,1.12,'door'),hykHouseOp(L,F+1.6,2.4,.42,1),hykHouseOp(L,F-1.6,2.3,.42,1),hykHouseOp(L,F,5.6,.5,1),hykHouseOp(L,F+1.9,5.9,.4,1),hykHouseOp(L,F-2.1,5.5,.4,1),hykHouseOp(L,-F,6.6,.36,1)];
 hykHouseLathe(L,'hkShell',{flare:1.4});hykHouseLatheOpenings(L,{});
 hykHouseDome(0,0,H-.1,Rt*1.05,1.7,'hkShell',col2,{rows:[{y:.5,n:10,s:.26},{y:1.1,n:6,s:.22,off:.3}],spire:2.4,spireR:.5,twist:.9});
 // the stair: twenty treads up the inside wall from the back-right round to the front-left, a bone string under their
 // inner edge, a rail on posts; the loft floor has its well over the last seven
 const yU=3.9;const n=20,rise=yU/n;const th0=4.4;let th=th0;const inner=[],string=[];const thAt=[];
 for(let i=0;i<=n;i++){const y=i*rise;const rw=L.rFn(y)*.92-.55;const x=rw*Math.cos(th),z=rw*Math.sin(th);thAt.push(th);
  if(i<n)kput('hkTread',[x,y+rise-.06,z],qEuler(0,-th,0),[1.0,.12,.62],bone);
  inner.push([(rw-.5)*Math.cos(th),y+rise+.95,(rw-.5)*Math.sin(th)]);string.push([(rw-.5)*Math.cos(th),y+rise-.14,(rw-.5)*Math.sin(th)]);
  if(i%5===0)kput('hkPost',[(rw-.5)*Math.cos(th),y+rise+.47,(rw-.5)*Math.sin(th)],null,[.05,.95,.05],bone);th+=.5/rw;}
 hykPut('hkBone',hykTube(inner,()=>.06,{seg:6,col:bone}));hykPut('hkBone',hykTube(string,t=>.13*(1+.25*Math.max(0,Math.cos(t*7*TAU))),{seg:7,col:bone}));
 hykFloor(0,0,.12,L.rFn(.12)*.9,{});hykHouseFloorWell(0,0,yU,L.rFn(yU)*.92,L.rFn(yU)*.92-1.3,thAt[13]-.1,thAt[n]+.35,hC(hPick(HPAL.floor)));
 kput('hkLip',[0,yU+.02,0],qEuler(Math.PI/2,0,0),[L.rFn(yU)*.92-1.25,L.rFn(yU)*.92-1.25,.5],col2);   // the well's edge is lipped like every other hole
 const foot=[(L.rFn(0)*.92-.55)*Math.cos(th0),(L.rFn(0)*.92-.55)*Math.sin(th0)],head=[(L.rFn(yU)*.92-.55)*Math.cos(thAt[n]),(L.rFn(yU)*.92-.55)*Math.sin(thAt[n])];
 const hall=hykRoom('hall',hykCirclePoly(0,0,3.3,16),.12,yU-.3,{doors:[[0,R0,2.1],[foot[0],foot[1],1.0,'bedroom']],wealth:.5});hykHouseHallSpots(hall,0,0,0,1,.92,{});
 const loft=hykRoom('bedroom',hykCirclePoly(0,0,2.6,14),yU,H-yU+.6,{doors:[[head[0],head[1],1.0,'hall']],residence:true,wealth:.5});hykHouseBedSpots(loft,0,0,head[0],head[1],.79,{});
 hykReg('Barnacle tower',0,0,5.0,12.2);}
HYK.def({key:'hyk_house_mid_1',name:'Barnacle tower',family:'housing',row:'Housing — middle',w:9.5,d:9.5,h:12.2,tags:{type:['single-family dwelling'],wealth:'middle',lit:false},build:hykHouseMid1});
// ---------------------------------------------------------------- MIDDLE 2: the pod cluster. Three pods of graded sizes on one raised skirt,
// budding off the hall: the sleeping pod at the back, the store pod at the side, a lens crown on the hall, steps up the
// skirt. Cream shell, no lamp.
function hykHouseMid2(G,o){reseed(30324+(o.v|0));const col=hC(hPick(HPAL.shell)),col2=hC(hPick(HPAL.shellWarm)),bone=hC(hPick(HPAL.bone));const Y=.75;
 hykPut('hkShell',hykFlare([0,.02,0],[0,1,0],7.0,Y,{col:col2,wobble:.03}));hykPut('hkFloor',hykDisc(0,Y,0,7.05,{col:hC(hPick(HPAL.floor)),lobes:{n:9,amp:.05}}));kput('hkLip',[0,Y+.02,0],qEuler(Math.PI/2,0,0),[7.0,7.0,.6],col2);
 hykHouseStair([0,0,9.4],[0,Y,7.0],2.0,bone,{});
 // the hall pod and its buds; the passages are holes in both shells with a lip, and a collar where each bud joins
 const hc=[.5,-.5],bc=[-3.9,-2.6],sc=[4.3,1.9];const thTo=(a,b)=>Math.atan2(b[0]-a[0],b[1]-a[1]);
 const Ph={a:3.6,b:3.2,c:3.4,e1:.88,e2:.9,cy:Y+3.2*.82,nu:56,nv:28,noise:{amp:.022,su:4,sv:3,seed:4},col,hollow:{t:.07,col:hC(hPick(HPAL.shell),.9)}};
 Ph.openings=[{th:0,el:hykHousePodEl(Ph,Y+.12+1.15),r:1.05,ky:1.15,kind:'door'},{th:1.5,el:.2,r:.5,kind:'window'},{th:-1.1,el:.25,r:.45,kind:'window'},{th:Math.PI,el:.55,r:.42,kind:'window'},
  {th:thTo(hc,bc),el:hykHousePodEl(Ph,Y+.12+1.1),r:.95,ky:1.1,kind:'pass'},{th:thTo(hc,sc),el:hykHousePodEl(Ph,Y+.12+.95),r:.8,ky:1.0,kind:'pass'}];
 const hall=hykHousePod(Ph,'hkShell',hc[0],hc[1],{flare:1.1});for(const op of hall.openings){if(op.kind==='door')hykDoor(op,{level:'ground'});else if(op.kind==='pass')hykHousePass(op);else hykWin(op,{});}
 hykFloor(hc[0],hc[1],Y+.12,3.0,{});hykHouseDome(hc[0],hc[1],Ph.cy+Ph.b*.86,1.9,1.4,'hkShell',col2,{rows:[{y:.45,n:9,s:.25}],spire:1.7,spireR:.38,twist:1.0});
 const Pb={a:2.8,b:2.5,c:2.8,e1:.9,e2:.92,cy:Y+2.5*.82,nu:44,nv:24,noise:{amp:.028,su:4,sv:3,seed:9},col:col2,hollow:{t:.08,col:col2}};
 Pb.openings=[{th:thTo(bc,hc),el:hykHousePodEl(Pb,Y+.12+1.1),r:.95,ky:1.1,kind:'pass'},{th:thTo(bc,hc)+2.1,el:.2,r:.4,kind:'window'},{th:thTo(bc,hc)-2.3,el:.4,r:.36,kind:'window'}];
 const bed=hykHousePod(Pb,'hkShell',bc[0],bc[1],{flare:.9});for(const op of bed.openings){if(op.kind==='pass')hykHousePass(op);else hykWin(op,{});}hykFloor(bc[0],bc[1],Y+.12,2.3,{});
 const Ps={a:1.9,b:1.7,c:1.9,e1:.92,e2:.94,cy:Y+1.7*.82,nu:36,nv:20,noise:{amp:.03,su:4,sv:3,seed:12},col,hollow:{t:.08,col}};
 Ps.openings=[{th:thTo(sc,hc),el:hykHousePodEl(Ps,Y+.12+.95),r:.8,ky:1.0,kind:'pass'},{th:thTo(sc,hc)+2.4,el:.3,r:.3,kind:'window'}];
 const store=hykHousePod(Ps,'hkShell',sc[0],sc[1],{flare:.7});for(const op of store.openings){if(op.kind==='pass')hykHousePass(op);else hykWin(op,{});}hykFloor(sc[0],sc[1],Y+.12,1.5,{});
 hykHouseNeck({cx:hc[0],cy:Ph.cy,cz:hc[1],r:3.5},{cx:bc[0],cy:Pb.cy,cz:bc[1],r:2.75},'hkShell',col2);hykHouseNeck({cx:hc[0],cy:Ph.cy,cz:hc[1],r:3.5},{cx:sc[0],cy:Ps.cy,cz:sc[1],r:1.85},'hkShell',col);
 kput('hkLip',[hc[0],Ph.cy+Ph.b*.86+1.35,hc[1]],qEuler(Math.PI/2,0,0),[.22,.22,.8],col2);
 const bp=[bc[0]+Math.sin(thTo(bc,hc))*2.4,bc[1]+Math.cos(thTo(bc,hc))*2.4];const hp=[hc[0]+Math.sin(thTo(hc,bc))*3.0,hc[1]+Math.cos(thTo(hc,bc))*3.0];
 const rh=hykRoom('hall',hykCirclePoly(hc[0],hc[1],3.0,16),Y+.12,Ph.b*1.5,{doors:[[hc[0],hc[1]+3.4,2.1],[hp[0],hp[1],1.9,'bedroom']],wealth:.5});hykHouseHallSpots(rh,hc[0],hc[1],0,1,.83,{});
 const rb=hykRoom('bedroom',hykCirclePoly(bc[0],bc[1],2.4,14),Y+.12,Pb.b*1.5,{doors:[[bp[0],bp[1],1.9,'hall']],residence:true,wealth:.5});hykHouseBedSpots(rb,bc[0],bc[1],hc[0]-bc[0],hc[1]-bc[1],.73,{});
 hykReg('Pod cluster',0,-.3,8.0,8.6);}
HYK.def({key:'hyk_house_mid_2',name:'Pod cluster',family:'housing',row:'Housing — middle',w:15.5,d:17,h:8.6,tags:{type:['single-family dwelling'],wealth:'middle',lit:false},build:hykHouseMid2});
// ---------------------------------------------------------------- MIDDLE 3: the stair drum. A lobed drum with a stair winding up its outside to a
// railed roof terrace under a lens cupola; the terrace is a lily pad whose domed underside is the room's ceiling. Cream.
function hykHouseMid3(G,o){reseed(30330+(o.v|0));const col=hC(hPick(HPAL.shell)),col2=hC(hPick(HPAL.shellWarm)),bone=hC(hPick(HPAL.bone));const R=3.9,H=5.2;
 const L={H,cx:0,cz:0,yBase:0,rFn:y=>R*(1+.035*Math.sin(Math.PI*y/H)),nu:64,nv:14,lobes:{n:8,amp:.045,ph:.3},rings:{n:7,amp:.03},noise:{amp:.02,su:5,sv:2,seed:6},col};
 const F=Math.PI/2;L.ops=[hykHouseOp(L,F,1.3,1.05,1.12,'door'),hykHouseOp(L,0,2.6,.5,1),hykHouseOp(L,.7,3.9,.38,1),hykHouseOp(L,F,3.8,.45,1),hykHouseOp(L,Math.PI,4.2,.4,1),hykHouseOp(L,-F+.6,2.2,.42,1)];
 hykHouseLathe(L,'hkShell',{flare:1.3});hykHouseLatheOpenings(L,{});hykFloor(0,0,.12,R*.9,{});
 const w0=hykW(0,0,0);const oy=HYK.cur?(HYK.cur.o.y||0):0;const top=H+.12;const a0=hykHouseWorldA(-F);
 const rAt=y=>hykHouseLatheR(L,0,clamp(y-oy,0,H))*(1+L.lobes.amp)+.02;
 hykHouseWorld(()=>{hykPad(w0[0],oy+top,w0[2],R*1.0,{col:col2,mat:'hkShell',own:'Stair drum',lobes:8,rail:{a0,gap:.42,col:bone}});
  hykStairSpiral(w0[0],w0[2],rAt,oy+top-.19,oy+.19,{a0,dir:1,w:1.1,col:bone});});
 hykHouseDome(0,0,top+.02,1.5,1.2,'hkShell',col2,{rows:[{y:.45,n:8,s:.22}],spire:1.1,spireR:.3,twist:1.2});
 const room=hykRoom('bedroom',hykCirclePoly(0,0,3.4,16),.12,H-.3,{doors:[[0,R,2.1]],residence:true,wealth:.5});hykHouseBedSpots(room,0,0,0,1,1.03,{table:true});
 hykReg('Stair drum',0,0,5.6,7.9);}
HYK.def({key:'hyk_house_mid_3',name:'Stair drum',family:'housing',row:'Housing — middle',w:11,d:11,h:7.9,tags:{type:['single-family dwelling'],wealth:'middle',lit:false},build:hykHouseMid3});
// ---------------------------------------------------------------- RICH 1: the conch stair house. A nacre conch whose outer whorl carries a
// stair of bone treads up its flank from the mouth's right lip round the back to a railed crown perch; the mouth is the
// porch with its septum and door, two shallow treads in the lower lip step up from the forecourt; the sleeping pod and
// the study bud off the flanks. Lit: pearls at the door, in the chamber, on the pod.
function hykHouseRich1(G,o){reseed(30336+(o.v|0));const col=hC(hPick(HPAL.nacre)),col2=hC(hPick(HPAL.coral)),bone=hC(hPick(HPAL.bone)),shell=hC(hPick(HPAL.shellWarm));
 const C={R:3.4,turns:2.1,g:.86,flare:.2,apexLift:6.5,flute:{n:12,amp:.05},rings:{n:22,amp:.02},nu:220,nv:30,col};
 const pre=hykConch(C);const cen=pre.cen,rho=pre.rho;const fl=t=>{const k=clamp((t-.92)/.08,0,1);return 1+C.flare*k*k;};const ax=-rho(1)*1.3;
 const tan=t=>{const a=cen(t),b=cen(Math.min(1,t+.002));const dx=b[0]-a[0],dz=b[2]-a[2];const l=Math.hypot(dx,dz)||1;return [dx/l,dz/l];};
 const right=t=>{const d=tan(t);return [d[1],-d[0]];};const outw=t=>{const c=cen(t);const l=Math.hypot(c[0]-ax,c[2])||1;return [(c[0]-ax)/l,c[2]/l];};
 const at=(t,n,k,y)=>{const c=cen(t);return [c[0]+n[0]*k,y!=null?y:c[1],c[2]+n[1]*k];};
 const wall=(t,n,y)=>{const c=cen(t);const r=rho(t)*fl(t);const k=Math.sqrt(Math.max(.2,r*r-(y-c[1])*(y-c[1])));return {p:[c[0]+n[0]*k,y,c[2]+n[1]*k],n:[n[0]*.92,(y-c[1])/r*.4,n[1]*.92]};};
 const floorY=.3;const bedT=.94,stuT=.988;const pw=wall(bedT,right(bedT),floorY+1.05),sw=wall(stuT,right(stuT).map(v=>-v),floorY+1.0);
 const wins=[.76,.83].map(t=>{const w=wall(t,outw(t),cen(t)[1]+rho(t)*.3);return {p:w.p,n:w.n,r:.5,kind:'window'};});
 C.ops=wins.concat([{p:pw.p,n:pw.n,r:.95,ky:1.1,kind:'pass'},{p:sw.p,n:sw.n,r:.85,ky:1.05,kind:'pass'}]);
 const sh=hykConch(C);hykPut('hkNacre',sh.geo);hykPut('hkIn',hykConch(Object.assign({},C,{R:C.R*.92,flip:true,col:hC(hPick(HPAL.shell),.92)})).geo,true);
 for(const w of wins)hykWin(w,{nacre:true,lit:true});hykHousePass(C.ops[2],true);hykHousePass(C.ops[3],true);
 const ap=cen(0);hykHouseSpire(ap[0],ap[2],ap[1]-.8,3.4,.95,'hkNacre',col,{n:9,amp:.12,twist:.7});
 // the mouth: its own lip, the septum a metre in with the real door, the chamber floor and the two treads in the lower lip
 const A=sh.aperture;const Rt=C.R*1.2,dz=-.75,dy=A.p[1]-Rt*.38;
 hykPut('hkNacre',hykSurf((u,v)=>{const th=u*TAU,r=v*Rt;return [A.p[0]+r*Math.cos(th),A.p[1]+r*Math.sin(th),A.p[2]+dz];},44,5,{col:shell,hole:(u,v,p)=>Math.pow(p[0]-A.p[0],2)+Math.pow((p[1]-dy)/1.25,2)<1.1*1.1*1.05}));
 hykDoor({p:[A.p[0],dy,A.p[2]+dz],n:[0,0,1],r:1.1,ky:1.25},{level:'ground',nacre:true,depth:.7});
 kput('hkLipN',[A.p[0],A.p[1]-.15,A.p[2]+.3],qEuler(0,0,0),[A.r*.97,A.r*.97,A.r*1.4],col);
 hykPut('hkFloor',hykDisc(A.p[0],floorY-.02,A.p[2]+1.0,A.r*.9,{col:hC(hPick(HPAL.floor))}));hykHouseStair([0,0,A.r*1.5+.9],[0,floorY,A.r*1.0],2.6,bone,{});
 const hw=t=>{const c=cen(t);const r=rho(t)*fl(t);return Math.sqrt(Math.max(.05,r*r-(c[1]-floorY)*(c[1]-floorY)))*.95;};
 hykPut('hkFloor',hykSurf((u,v)=>{const t=.8+.2*u;const n=right(t);const c=cen(t);const k=hw(t)*(2*v-1);return [c[0]+n[0]*k,floorY,c[2]+n[1]*k];},24,4,{col:hC(hPick(HPAL.floor)),flip:true}),true);
 for(const t of [.3,.55,.78,.97]){const c=cen(t);hykPut('hkNacre',hykFlare([c[0],.02,c[2]],[0,1,0],rho(t)*fl(t)*.95,rho(t)*.4,{col}));}
 hykPut('hkFloor',hykDisc(1.0,.03,5.6,4.6,{col:hC(hPick(HPAL.floor),.88),lobes:{n:11,amp:.06}}));   // the forecourt
 // the stair up the outer flank: a tread every half metre of arc at a rise of .19, cantilevered from the shell, until the
 // flank's shoulder is reached; then the crown perch on the whorl's top, railed, open toward the stair
 const run=.5,rise=.19;let s=0,k=0,t=1.0,last=null,top=null;const outer=[],inner=[];
 while(t>.5){const c=cen(t);const r=rho(t)*fl(t);const ys=floorY+rise*k;if(c[1]+r*.72<ys){top={t,c,r};break;}
  const ph=Math.asin(clamp((ys-c[1])/r,-1,1));const n=outw(t);const q=[c[0]+n[0]*r*Math.cos(ph),ys,c[2]+n[1]*r*Math.cos(ph)];
  if(last){s+=Math.hypot(q[0]-last[0],q[2]-last[2]);}last=q;
  if(s>=run*k){const d=tan(t);kput('hkTread',[q[0]+n[0]*.6,ys-.06,q[2]+n[1]*.6],qEuler(0,Math.atan2(-d[1],-d[0])+Math.PI/2,0),[1.2,.12,.52],bone);
   outer.push([q[0]+n[0]*1.15,ys,q[2]+n[1]*1.15]);inner.push([q[0]+n[0]*.1,ys-.12,q[2]+n[1]*.1]);if(k%4===0)kput('hkPost',[q[0]+n[0]*1.15,ys+.48,q[2]+n[1]*1.15],null,[.05,.95,.05],bone);k++;}
  t-=.0015;}
 if(outer.length>2){hykPut('hkBone',hykTube(outer.map(p=>[p[0],p[1]+.95,p[2]]),()=>.06,{seg:6,col:bone}));hykPut('hkBone',hykTube(inner,u=>.14*(1+.3*Math.max(0,Math.cos(u*9*TAU))),{seg:7,col:bone}));
  const f=inner[0];hykPut('hkBone',hykFlare([f[0],.02,f[2]],[0,1,0],.22,.5,{col:bone}));}
 if(top){const n=outw(top.t);const pc=[top.c[0]+n[0]*top.r*.25,top.c[1]+top.r*.78,top.c[2]+n[1]*top.r*.25];const w=hykW(pc[0],pc[1],pc[2]);const a0=hykHouseWorldA(Math.atan2(n[1],n[0]));
  hykHouseWorld(()=>hykPad(w[0],w[1],w[2],2.3,{col,mat:'hkNacre',own:'Conch stair house',lobes:9,rail:{a0,gap:.6,col:bone}}));}
 // the sleeping pod on the right flank and the study on the left, each budding from the whorl with a collar, lit
 const bc=at(bedT,right(bedT),rho(bedT)*fl(bedT)+2.1);const Pb={a:3.0,b:2.7,c:3.0,e1:.9,e2:.92,nu:48,nv:26,noise:{amp:.025,su:4,sv:3,seed:8},col,hollow:{t:.07,col:hC(hPick(HPAL.shell),.9)}};
 const thB=Math.atan2(pw.p[0]-bc[0],pw.p[2]-bc[2]);Pb.openings=[{th:thB,el:hykHousePodEl(Pb,.12+1.05),r:.95,ky:1.1,kind:'pass'},{th:thB+2.0,el:.2,r:.45,kind:'window'},{th:thB-1.9,el:.35,r:.42,kind:'window'},{th:thB+3.1,el:.8,r:.34,kind:'window'}];
 const bed=hykHousePod(Pb,'hkNacre',bc[0],bc[2],{flare:1.0});for(const op of bed.openings){if(op.kind==='pass')hykHousePass(op,true);else hykWin(op,{nacre:true,lit:true});}hykFloor(bc[0],bc[2],.12,2.5,{});
 hykHouseNeck({cx:cen(bedT)[0],cy:cen(bedT)[1],cz:cen(bedT)[2],r:rho(bedT)*fl(bedT)},{cx:bc[0],cy:Pb.b*.82,cz:bc[2],r:2.9},'hkNacre',col2);
 const lp=bed.at(thB+1.0,.3),ln=bed.out(thB+1.0,.3);hykHouseLamp(lp,ln,{nacre:true});
 const scn=right(stuT).map(v=>-v);const sc=at(stuT,scn,rho(stuT)*fl(stuT)+1.7);const Ps={a:2.3,b:2.1,c:2.3,e1:.9,e2:.93,nu:40,nv:22,noise:{amp:.03,su:4,sv:3,seed:11},col:col2,hollow:{t:.08,col:col2}};
 const thS=Math.atan2(sw.p[0]-sc[0],sw.p[2]-sc[2]);Ps.openings=[{th:thS,el:hykHousePodEl(Ps,.12+1.0),r:.85,ky:1.05,kind:'pass'},{th:thS+2.2,el:.25,r:.4,kind:'window'},{th:thS-2.4,el:.4,r:.36,kind:'window'}];
 const stu=hykHousePod(Ps,'hkNacre',sc[0],sc[2],{flare:.8});for(const op of stu.openings){if(op.kind==='pass')hykHousePass(op,true);else hykWin(op,{nacre:true,lit:true});}hykFloor(sc[0],sc[2],.12,1.9,{});
 hykHouseNeck({cx:cen(stuT)[0],cy:cen(stuT)[1],cz:cen(stuT)[2],r:rho(stuT)*fl(stuT)},{cx:sc[0],cy:Ps.b*.82,cz:sc[2],r:2.2},'hkNacre',col2);
 // lamps: either side of the door on the septum, one in the chamber on the wall
 hykHouseLamp([A.p[0]-1.9,dy+.8,A.p[2]+dz],[0,.15,1],{nacre:true});hykHouseLamp([A.p[0]+1.9,dy+.8,A.p[2]+dz],[0,.15,1],{nacre:true});
 const cl=wall(.9,right(.9).map(v=>-v),cen(.9)[1]+.6);hykHouseLamp(cl.p,cl.n,{nacre:true,d:.4});
 // rooms: the chamber (hall), the sleeping pod, the study
 const poly=[];for(let i=0;i<=9;i++){const t=.82+i/9*.165;const n=right(t);const c=cen(t);const k=hw(t)*.88;poly.push([c[0]+n[0]*k,c[2]+n[1]*k]);}
 for(let i=9;i>=0;i--){const t=.82+i/9*.165;const n=right(t);const c=cen(t);const k=hw(t)*.88;poly.push([c[0]-n[0]*k,c[2]-n[1]*k]);}
 const hall=hykRoom('hall',poly,floorY,3.6,{doors:[[A.p[0],A.p[2]+dz,2.2],[pw.p[0],pw.p[2],1.9,'bedroom'],[sw.p[0],sw.p[2],1.7,'library']],wealth:.9});
 const bear=t=>{const d=tan(t);return Math.atan2(d[0],d[1]);};const S=(kind,t,side,k,w,d)=>{const p=at(t,right(t),side*k);hykSpot(hall,kind,p[0],p[2],bear(t),w,d);};
 S('shrine',.84,0,0,.7,.5);S('hearth',.865,0,0,.9,.9);S('table',.9,0,0,1.2,1.2);S('food',.93,-1,.6,.8,.8);S('seat',.96,-1,.7,1.0,.9);
 const rb=hykRoom('bedroom',hykCirclePoly(bc[0],bc[2],2.55,14),.12,Pb.b*1.5,{doors:[[bed.openings[0].p[0],bed.openings[0].p[2],1.9,'hall']],residence:true,wealth:.9});
 hykHouseBedSpots(rb,bc[0],bc[2],pw.p[0]-bc[0],pw.p[2]-bc[2],.77,{seat:true});
 const rs=hykRoom('library',hykCirclePoly(sc[0],sc[2],1.9,12),.12,Ps.b*1.5,{doors:[[stu.openings[0].p[0],stu.openings[0].p[2],1.7,'hall']],wealth:.9});
 {const ph=Math.atan2(sw.p[0]-sc[0],sw.p[2]-sc[2]);hykSpot(rs,'work',sc[0]-Math.sin(ph)*1.0,sc[2]-Math.cos(ph)*1.0,ph,1.2,.7);hykSpot(rs,'seat',sc[0]+Math.cos(ph)*.9,sc[2]-Math.sin(ph)*.9,ph+Math.PI/2,.8,.8);}
 hykReg('Conch stair house',-2.0,-1.0,10.5,10.5);}
HYK.def({key:'hyk_house_rich_1',name:'Conch stair house',family:'housing',row:'Housing — rich',w:19,d:16,h:10.6,tags:{type:['single-family dwelling'],wealth:'rich',lit:true},build:hykHouseRich1});
// ---------------------------------------------------------------- RICH 2: the urchin house. A lobed nacre dome ringed with long spines and
// crowned with a twisted spire, the sleeping pod and the study budding from its flanks, a shrine bud at the back, a
// paved forecourt; pearls at the door and in the hall. Lit.
function hykHouseRich2(G,o){reseed(30342+(o.v|0));const col=hC(hPick(HPAL.nacre)),col2=hC(hPick(HPAL.seaGreen)),col3=hC(hPick(HPAL.coral)),bone=hC(hPick(HPAL.bone));const R=5.0,Hw=3.2,H=6.6;
 const L={H,cx:0,cz:0,yBase:0,rFn:y=>y<Hw?R*(.96+.04*Math.sin(Math.PI*y/Hw)):R*.96*Math.sqrt(Math.max(0,1-Math.pow((y-Hw)/(H-Hw),2.1)))+.06,nu:72,nv:26,lobes:{n:10,amp:.055,ph:Math.PI/10},flute:{n:30,amp:.025,sharp:1.2},rings:{n:8,amp:.02},noise:{amp:.018,su:5,sv:2,seed:9},col};
 const F=Math.PI/2;const bA=F+2.0,sA=F-2.1,shA=-F;   // the buds' azimuths: sleeping pod left-back, study right-back, shrine at the back
 L.ops=[hykHouseOp(L,F,1.35,1.1,1.15,'door'),hykHouseOp(L,F+.9,2.4,.5,1),hykHouseOp(L,F-.9,2.4,.5,1),hykHouseOp(L,F+.5,4.4,.42,1),hykHouseOp(L,F-.5,4.4,.42,1),hykHouseOp(L,F+2.8,4.6,.4,1),hykHouseOp(L,F-2.8,4.6,.4,1),
  hykHouseOp(L,bA,1.2,1.0,1.1,'pass'),hykHouseOp(L,sA,1.15,.9,1.05,'pass'),hykHouseOp(L,shA,1.1,.8,1.0,'pass')];
 hykHouseLathe(L,'hkNacre',{flare:1.5,k:.93});for(const op of L.ops){if(op.kind==='door')hykDoor(op,{level:'ground',nacre:true});else if(op.kind==='pass')hykHousePass(op,true);else hykWin(op,{nacre:true,lit:true});}
 hykFloor(0,0,.12,R*.92,{});hykHouseSpire(0,0,H-.5,4.2,1.1,'hkNacre',col,{n:9,amp:.13,twist:.6});
 // the spines: long on the shoulder at each lobe crest, shorter in a ring above, each rooted in the shell along its normal
 for(let i=0;i<10;i++){const th=i/10*TAU-Math.PI/10;const a=hykHouseLatheAt(L,th,3.9);hykHouseSpike(a.p,[a.n[0],a.n[1]+.35,a.n[2]],2.6,.26,col2);}
 for(let i=0;i<10;i++){const th=(i+.5)/10*TAU-Math.PI/10;const a=hykHouseLatheAt(L,th,5.3);hykHouseSpike(a.p,[a.n[0],a.n[1]+.5,a.n[2]],1.6,.18,col2);}
 for(let i=0;i<6;i++){const th=i/6*TAU;const a=hykHouseLatheAt(L,th,6.2);hykHouseSpike(a.p,[a.n[0],a.n[1]+.8,a.n[2]],1.0,.12,col2);}
 // the buds: the sleeping pod and the study grown onto the flanks, the shrine niche at the back, each with a collar
 const bud=(th,Rb,b,ops,colB,seed)=>{const a=hykHouseLatheAt(L,th,1.2);const d=R*.97+Rb*.72;const cx=Math.cos(th)*d,cz=Math.sin(th)*d;
  const P={a:Rb,b,c:Rb,e1:.9,e2:.92,nu:44,nv:24,noise:{amp:.028,su:4,sv:3,seed},col:colB,hollow:{t:.08,col:hC(hPick(HPAL.shell),.9)}};
  const thP=Math.atan2(a.p[0]-cx,a.p[2]-cz);P.openings=[{th:thP,el:hykHousePodEl(P,.12+(ops.r||1.0)),r:ops.r||1.0,ky:ops.ky||1.1,kind:'pass'}].concat(ops.wins.map(w=>({th:thP+w[0],el:w[1],r:w[2],kind:'window'})));
  const pod=hykHousePod(P,'hkNacre',cx,cz,{flare:Rb*.3});for(const op of pod.openings){if(op.kind==='pass')hykHousePass(op,true);else hykWin(op,{nacre:true,lit:true});}
  hykFloor(cx,cz,.12,Rb*.82,{});hykHouseNeck({cx:0,cy:1.6,cz:0,r:R*.97},{cx,cy:P.b*.82,cz,r:Rb*.97},'hkNacre',col3);return {pod,cx,cz,thP,wall:a.p};};
 const B=bud(bA,3.0,2.7,{r:1.0,ky:1.1,wins:[[2.1,.2,.45],[-2.0,.3,.42],[3.0,.8,.32]]},col,14);const S=bud(sA,2.4,2.2,{r:.9,ky:1.05,wins:[[2.2,.25,.4],[-2.3,.4,.36]]},col3,15);
 const N=bud(shA,1.6,1.7,{r:.8,ky:1.0,wins:[[Math.PI,.5,.3]]},col2,16);
 hykPut('hkFloor',hykDisc(0,.03,R+3.6,4.2,{col:hC(hPick(HPAL.floor),.88),lobes:{n:9,amp:.06}}));
 // pearls: either side of the door on the shell, one over the hearth, one on the sleeping pod
 for(const s of [-1,1]){const a=hykHouseLatheAt(L,F+s*.42,2.6);hykHouseLamp(a.p,a.n,{nacre:true});}
 {const a=hykHouseLatheAt(L,F+Math.PI,2.8);hykHouseLamp([a.p[0]*.9,a.p[1],a.p[2]*.9],[-a.n[0],.3,-a.n[2]],{nacre:true,d:.4});}
 hykHouseLamp(B.pod.at(B.thP+1.1,.35),B.pod.out(B.thP+1.1,.35),{nacre:true});
 const hall=hykRoom('hall',hykCirclePoly(0,0,4.3,18),.12,5.8,{doors:[[0,R,2.2],[B.wall[0],B.wall[2],2.0,'bedroom'],[S.wall[0],S.wall[2],1.8,'library'],[N.wall[0],N.wall[2],1.6,'shrine']],wealth:.9});
 hykHouseHallSpots(hall,0,0,0,1,1.05,{});hykSpot(hall,'seat',1.6,1.9,-.5,1.0,.9);
 const rb=hykRoom('bedroom',hykCirclePoly(B.cx,B.cz,2.55,14),.12,2.7*1.5,{doors:[[B.pod.openings[0].p[0],B.pod.openings[0].p[2],2.0,'hall']],residence:true,wealth:.9});hykHouseBedSpots(rb,B.cx,B.cz,-B.cx,-B.cz,.77,{seat:true});
 const rs=hykRoom('library',hykCirclePoly(S.cx,S.cz,2.0,12),.12,2.2*1.5,{doors:[[S.pod.openings[0].p[0],S.pod.openings[0].p[2],1.8,'hall']],wealth:.9});
 {const ph=Math.atan2(-S.cx,-S.cz);hykSpot(rs,'work',S.cx-Math.sin(ph)*1.0,S.cz-Math.cos(ph)*1.0,ph,1.2,.7);hykSpot(rs,'seat',S.cx+Math.cos(ph)*.95,S.cz-Math.sin(ph)*.95,ph+Math.PI/2,.8,.8);}
 const rn=hykRoom('shrine',hykCirclePoly(N.cx,N.cz,1.3,10),.12,1.7*1.5,{doors:[[N.pod.openings[0].p[0],N.pod.openings[0].p[2],1.6,'hall']],wealth:.9});hykSpot(rn,'shrine',N.cx,N.cz-.65,Math.PI,.7,.5);
 hykReg('Urchin house',0,-.5,9.6,11.0);}
HYK.def({key:'hyk_house_rich_2',name:'Urchin house',family:'housing',row:'Housing — rich',w:19,d:18,h:11.0,tags:{type:['single-family dwelling'],wealth:'rich',lit:true},build:hykHouseRich2});
// ---------------------------------------------------------------- RICH 3: the scallop court. A ribbed scallop valve stands on its hinge at the
// back and leans forward over the court; the hall pod, the sleeping pod and the study nestle in its hollow; a shrine
// bud sits at the umbo. Nacre on the valve's lip and the pods, pearls at the doors and under the fan. Lit.
function hykHouseRich3(G,o){reseed(30348+(o.v|0));const col=hC(hPick(HPAL.nacre)),col2=hC(hPick(HPAL.shellWarm)),col3=hC(hPick(HPAL.coral)),bone=hC(hPick(HPAL.bone));
 const Rf=7.6,bow=2.2,lean=.3,hz=-4.2,nr=15;   // the valve: radius, its bowl's depth, its lean, the hinge line's z, its ribs
 const valve=(off,flip)=>hykSurf((u,v)=>{const a=u*Math.PI,r=v*Rf*(1+.035*Math.cos(nr*a));const rib=.16*Math.cos(nr*a)*v;const z=hz-bow*(1-v*v)+rib+lean*r*Math.sin(a)+off;return [r*Math.cos(a),Math.max(.0,r*Math.sin(a)),z];},60,22,{col,uS:Rf*Math.PI/4,vS:Rf/4,flip});
 hykPut('hkNacre',valve(0,false));hykPut('hkNacre',valve(-.38,true));
 const rim=[];for(let i=0;i<=40;i++){const a=i/40*Math.PI;const r=Rf*(1+.035*Math.cos(nr*a));rim.push([r*Math.cos(a),r*Math.sin(a),hz-.19+.16*Math.cos(nr*a)+lean*r*Math.sin(a)]);}
 hykPut('hkNacre',hykTube(rim,()=>.24,{seg:8,col}));
 hykHouseSkirt(u=>[(u*2-1)*Rf*1.02,hz-.1],1.1,.8,'hkShell',col2,{nu:30});hykHouseSkirt(u=>[(1-u*2)*Rf*1.02,hz-.3],1.0,.7,'hkShell',col2,{nu:30});
 kput('hkBall',[0,.55,hz-.4],null,[1.3,.8,1.1],col2);   // the umbo at the hinge
 // the pods: the hall in the hollow, the sleeping pod to the right, the study to the left, the shrine bud at the umbo
 const hc=[-.6,-1.2],bc=[4.9,-.2],sc=[-5.6,.4],nc=[0,-3.9];const thTo=(a,b)=>Math.atan2(b[0]-a[0],b[1]-a[1]);
 const mk=(c,Rp,b,ops,colP,seed,flare)=>{const P={a:Rp,b,c:Rp*.96,e1:.88,e2:.9,nu:52,nv:26,noise:{amp:.024,su:4,sv:3,seed},col:colP,hollow:{t:.07,col:hC(hPick(HPAL.shell),.9)}};
  P.openings=ops.map(op=>op.kind==='door'||op.kind==='pass'?{th:op.th,el:hykHousePodEl(P,.12+op.r*(op.ky||1)),r:op.r,ky:op.ky||1,kind:op.kind}:{th:op.th,el:op.el,r:op.r,kind:'window'});
  const pod=hykHousePod(P,'hkNacre',c[0],c[1],{flare});for(const op of pod.openings){if(op.kind==='door')hykDoor(op,{level:'ground',nacre:true});else if(op.kind==='pass')hykHousePass(op,true);else hykWin(op,{nacre:true,lit:true});}
  hykFloor(c[0],c[1],.12,Rp*.82,{});return pod;};
 const hall=mk(hc,3.7,3.3,[{th:0,r:1.1,ky:1.15,kind:'door'},{th:thTo(hc,bc),r:1.0,ky:1.1,kind:'pass'},{th:thTo(hc,sc),r:.9,ky:1.05,kind:'pass'},{th:thTo(hc,nc),r:.8,ky:1.0,kind:'pass'},{th:1.0,el:.55,r:.42},{th:-1.0,el:.55,r:.42},{th:.3,el:1.0,r:.36}],col,21,1.2);
 const bed=mk(bc,2.9,2.6,[{th:thTo(bc,hc),r:1.0,ky:1.1,kind:'pass'},{th:.3,el:.2,r:.45},{th:1.4,el:.3,r:.4},{th:-.6,el:.8,r:.3}],col,22,.9);
 const stu=mk(sc,2.3,2.1,[{th:thTo(sc,hc),r:.9,ky:1.05,kind:'pass'},{th:-.2,el:.25,r:.4},{th:-1.6,el:.35,r:.36}],col3,23,.75);
 const nic=mk(nc,1.5,1.6,[{th:thTo(nc,hc),r:.8,ky:1.0,kind:'pass'},{th:Math.PI,el:.6,r:.26}],col2,24,.5);
 for(const row of [{y:2.4,n:10,s:.3},{y:3.2,n:6,s:.26}]){const r=hykHousePodR({a:3.7,b:3.3,c:3.55,e1:.88,cy:3.3*.82},3.3*.82+row.y);for(let i=0;i<row.n;i++){const a=i/row.n*TAU+.2;kput('hkLens',[hc[0]+r*Math.sin(a)*.99,3.3*.82+row.y,hc[1]+r*Math.cos(a)*.99],null,row.s,hC(hPick(HPAL.lens)));}}
 kput('hkLipN',[hc[0],3.3*.82+3.3*.95,hc[1]],qEuler(Math.PI/2,0,0),[.5,.5,1.0],col);kput('hkBall',[hc[0],3.3*.82+3.3*.98,hc[1]],null,[.42,.3,.42],col);
 hykHouseNeck({cx:hc[0],cy:3.3*.82,cz:hc[1],r:3.6},{cx:bc[0],cy:2.6*.82,cz:bc[1],r:2.85},'hkNacre',col2);hykHouseNeck({cx:hc[0],cy:3.3*.82,cz:hc[1],r:3.6},{cx:sc[0],cy:2.1*.82,cz:sc[1],r:2.25},'hkNacre',col2);
 hykPut('hkFloor',hykDisc(0,.03,5.4,5.2,{col:hC(hPick(HPAL.floor),.88),lobes:{n:13,amp:.05}}));   // the court
 // pearls: either side of the hall door on the pod, two under the valve's lip on brackets off the ribs, one on the study
 for(const s of [-1,1])hykHouseLamp(hall.at(s*.45,.25),hall.out(s*.45,.25),{nacre:true});
 for(const a of [.75,2.4]){const r=Rf*.9;const p=[r*Math.cos(a),r*Math.sin(a),hz-bow*(1-.81)+lean*r*Math.sin(a)+.1];hykHouseLamp(p,[0,-.6,1],{nacre:true,d:.6});}
 hykHouseLamp(stu.at(-1.0,.4),stu.out(-1.0,.4),{nacre:true});
 const rh=hykRoom('hall',hykCirclePoly(hc[0],hc[1],3.1,16),.12,3.3*1.5,{doors:[[hc[0],hc[1]+3.55,2.2],[hall.openings[1].p[0],hall.openings[1].p[2],2.0,'bedroom'],[hall.openings[2].p[0],hall.openings[2].p[2],1.8,'library'],[hall.openings[3].p[0],hall.openings[3].p[2],1.6,'shrine']],wealth:.9});
 {const H=(kind,x,z,ry,w,dd)=>hykSpot(rh,kind,hc[0]+x,hc[1]+z,ry,w,dd);H('hearth',1.6,-1.2,0,.9,.9);H('table',-.9,-.4,0,1.3,1.3);H('food',1.9,.2,0,.8,.8);H('seat',-1.2,1.9,.5,1.0,.9);}   // about the hall pod's centre
 const rb=hykRoom('bedroom',hykCirclePoly(bc[0],bc[1],2.45,14),.12,2.6*1.5,{doors:[[bed.openings[0].p[0],bed.openings[0].p[2],2.0,'hall']],residence:true,wealth:.9});hykHouseBedSpots(rb,bc[0],bc[1],hc[0]-bc[0],hc[1]-bc[1],.74,{seat:true});
 const rs=hykRoom('library',hykCirclePoly(sc[0],sc[1],1.9,12),.12,2.1*1.5,{doors:[[stu.openings[0].p[0],stu.openings[0].p[2],1.8,'hall']],wealth:.9});
 {const ph=thTo(sc,hc);hykSpot(rs,'work',sc[0]-Math.sin(ph)*1.0,sc[1]-Math.cos(ph)*1.0,ph,1.2,.7);hykSpot(rs,'seat',sc[0]+Math.cos(ph)*.9,sc[1]-Math.sin(ph)*.9,ph+Math.PI/2,.8,.8);}
 const rn=hykRoom('shrine',hykCirclePoly(nc[0],nc[1],1.2,10),.12,1.6*1.5,{doors:[[nic.openings[0].p[0],nic.openings[0].p[2],1.6,'hall']],wealth:.9});hykSpot(rn,'shrine',nc[0],nc[1]-.6,Math.PI,.7,.5);
 hykReg('Scallop court',0,-.5,9.5,9.6);}
HYK.def({key:'hyk_house_rich_3',name:'Scallop court',family:'housing',row:'Housing — rich',w:19,d:16,h:9.6,tags:{type:['single-family dwelling'],wealth:'rich',lit:true},build:hykHouseRich3});
// ---------------------------------------------------------------- GROWN POOR 1: the barnacle bud (a way in). A fluted barnacle cone grown
// sideways out of the host's face, its oblique mouth closed by an operculum plate with the door in it, two smaller
// buds beside it, drips under its belly, a crust of specks round its skirt. The back door opens onto the host's plate.
function hykPodPoor1(G,o){reseed(30354+(o.v|0));const way=o.way;const col=hC(hPick(HPAL.barnacle)),col2=hC(hPick(HPAL.barnacle));const R=3.3,rt=2.75,Ln=5.6,cy=1.5,amp=.2;
 const cone=(x,yc,Rb,rb2,len,seed,inner,ops)=>{const L={H:len,cx:0,cz:0,yBase:0,rFn:y=>Rb+(rb2-Rb)*(y/len),nu:inner?48:28,nv:inner?16:10,flute:{n:16,amp:.075,sharp:1.5},rings:{n:7,amp:.025},noise:{amp:.03,su:5,sv:1.5,seed},tilt:{amp,dir:Math.PI/2},col:inner?col:col2,ops:ops||[]};
  const fz=o.faceZ(x,yc);const g=hykLathe(L);g.rotateX(Math.PI/2);g.translate(x,yc,fz-.15);hykPut('hkBarn',g);
  if(inner){const gi=hykLathe(Object.assign({},L,{rFn:y=>L.rFn(y)*.9,flip:true,noise:null,col:hC(hPick(HPAL.barnacle),.85)}));gi.rotateX(Math.PI/2);gi.translate(x,yc,fz-.15);hykPut('hkIn',gi,true);}
  hykPut('hkBarn',hykFlare([x,yc,fz+.02],[0,0,1],Rb*.92,Rb*.4,{col:col2}));return L;};
 const L=cone(0,cy,R,rt,Ln,1,true);
 // the operculum: the rim is oblique (the lathe's tilt), so the plate lies on the plane z = z0 + s y; the door is a hole in it
 const s=Ln*amp/(2*rt),z0=Ln*(1-amp/2)-Ln*amp*cy/(2*rt)-.15;const zp=y=>z0+s*y;const nl=Math.hypot(s,1);const pn=[0,-s/nl,1/nl];
 hykPut('hkBarn',hykHouseSurfFacing((u,v)=>{const th=u*TAU,r=v*rt*1.0;const x=r*Math.cos(th),y=cy-r*Math.sin(th);return [x,y,zp(y)-.02];},36,5,{col:hC(hPick(HPAL.barnacle),.95),hole:(u,v,p)=>Math.pow(p[0]/1.05,2)+Math.pow((p[1]-1.22)/1.18,2)<1.0},[0,0,1]));
 kput('hkLip',[0,cy,zp(cy)],qFacing(pn),[rt*1.03,rt*1.03*nl,1.3],col);
 const door={p:[0,1.22,zp(1.22)],n:pn,r:1.05,ky:1.12};hykDoor(door,{level:o.level});
 if(way)hykDoor({p:[0,1.22,o.faceZ(0,1.22)-.1],n:[0,0,-1],r:1.05,ky:1.12},{level:o.level,name:o.host.n+' way in',into:o.host.n});
 hykHouseLamp([1.55,2.75,zp(2.75)-.05],[0,.2,1],{cool:true,bare:true,d:.35,level:o.level});   // one jar by the door, poor as it is (a bare jar, no sconce)
 // the floor: a tongue the width of the chord at the datum, from the face to the mouth
 const hw=z=>{const r=(R+(rt-R)*z/Ln)*.9;return Math.sqrt(Math.max(.3,r*r-cy*cy));};
 hykPut('hkFloor',hykHouseSurfFacing((u,v)=>{const z=.1+u*(Ln-.6);return [hw(z)*(2*v-1)*.98,.05,z];},10,4,{col:hC(hPick(HPAL.floor))},[0,1,0]),true);
 for(let i=0;i<6;i++){const px=rr(-2.2,2.2),pz=rr(.8,Ln-.6);const r=(R+(rt-R)*pz/Ln);if(Math.abs(px)>r*.8)continue;const yu=cy-Math.sqrt(r*r-px*px);const h=rr(.3,.9);kput('hkDrip',[px,yu-h/2+.22,pz],qEuler(Math.PI,0,0),[h*.3,h,h*.3],col);}
 cone(-R-1.2,.9,1.3,1.0,2.4,2,false);cone(R+1.3,2.6,1.1,.85,2.0,3,false);hykHouseCrust(o,R*1.1,22,cy);
 hykHouseLanding(o,0,-.08,zp(0)+2.4,2.6,{col,mat:'hkBarn'});
 const poly=[];for(let i=0;i<=5;i++){const z=.3+i/5*(Ln-1.0);poly.push([hw(z)*.9,z]);}for(let i=5;i>=0;i--){const z=.3+i/5*(Ln-1.0);poly.push([-hw(z)*.9,z]);}
 const doors=[[0,zp(1.22),2.1]];if(way)doors.push([0,-.1,2.1,'host']);
 const room=hykRoom('bedroom',poly,.05,cy+rt*.9,{doors,residence:true,wealth:.15});
 hykSpot(room,'bed',-1.3,2.4,Math.PI/2,2.1,1.0);hykSpot(room,'store',1.4,1.6,Math.PI/2,1.2,.7);hykSpot(room,'food',1.5,3.6,0,.8,.8);
 hykReg('Barnacle bud',0,Ln*.5,R*1.3,cy+R);}
HYK.def({key:'hyk_pod_poor_1',name:'Barnacle bud',family:'housing',row:'Grown-on housing',grown:true,into:true,w:6.6,d:6.6,h:5.2,tags:{type:['single-family dwelling'],wealth:'poor',lit:false},build:hykPodPoor1});
// ---------------------------------------------------------------- GROWN POOR 2: the drip pod. A teardrop hung on the face, its point a great
// drip below the floor, smaller drips on its lower flank, a lens in its crown; a small drop beside it. Grey.
function hykPodPoor2(G,o){reseed(30360+(o.v|0));const col=hC(hPick(HPAL.barnacle)),col2=hC(hPick(HPAL.barnacle));const R=3.2,D=2.0,T=3.6,H=D+T,cz=R*.3;
 const prof=s=>1.32*Math.sqrt(Math.max(0,s))*Math.sqrt(Math.max(0,1-Math.pow(s,6)));
 const L={H,cx:0,cz,yBase:-D,rFn:y=>R*prof(y/H)+.04,nu:48,nv:26,flute:{n:12,amp:.03,sharp:1.3},rings:{n:6,amp:.02},noise:{amp:.025,su:4,sv:2,seed:5},col};
 L.ops=[hykHouseOp(L,Math.PI/2,D+1.2,1.0,1.15,'door'),hykHouseOp(L,Math.PI/2+1.3,D+1.9,.4,1),hykHouseOp(L,Math.PI/2-1.3,D+1.9,.4,1),hykHouseOp(L,Math.PI/2+.4,D+2.9,.3,1)];
 hykHouseLathe(L,'hkBarn',{flare:false,k:.92,inCol:hC(hPick(HPAL.barnacle),.85)});for(const op of L.ops){if(op.kind==='door')hykDoor(op,{level:o.level});else hykWin(op,{});}
 hykPut('hkBarn',hykFlare([0,1.6,.02],[0,0,1],3.0,1.2,{col}));kput('hkLens',[0,T-.35,cz],null,.34,hC(hPick(HPAL.lens)));
 hykFloor(0,cz,.05,2.45,{});
 for(let i=0;i<5;i++){const th=rr(-1.2,Math.PI+1.2);const y=rr(.3,.9);const r=hykHouseLatheR(L,th,y)*.98;const h=rr(.35,.9);kput('hkDrip',[r*Math.cos(th),y-D-h/2+.2,cz+r*Math.sin(th)],qEuler(Math.PI,0,0),[h*.28,h,h*.28],col);}
 // the small drop beside it, rooted alike
 {const R2=1.5,D2=1.0,H2=2.5;const L2={H:H2,cx:R+1.5,cz:o.faceZ(R+1.5,0)+R2*.35,yBase:.9-D2,rFn:y=>R2*prof(y/H2)+.03,nu:28,nv:16,noise:{amp:.03,su:4,sv:2,seed:6},col:col2,ops:[]};
  L2.ops=[hykHouseOp(L2,Math.PI/2,D2+.7,.3,1)];hykPut('hkBarn',hykLathe(L2));hykWin(L2.ops[0],{});hykPut('hkBarn',hykFlare([R+1.5,.9+.5,o.faceZ(R+1.5,0)+.02],[0,0,1],R2*.85,R2*.5,{col:col2}));}
 hykHouseCrust(o,R*1.05,18,1.2);hykHouseLanding(o,0,-.08,cz+L.rFn(D+.3)+1.9,2.5,{col,mat:'hkBarn'});
 const room=hykRoom('bedroom',hykCirclePoly(0,cz,2.25,14),.05,T-.5,{doors:[[0,cz+2.7,2.0]],residence:true,wealth:.15});hykHouseBedSpots(room,0,cz,0,1,.68,{});
 hykReg('Drip pod',0,cz,R*1.3,T+D);}
HYK.def({key:'hyk_pod_poor_2',name:'Drip pod',family:'housing',row:'Grown-on housing',grown:true,w:6.4,d:6.4,h:5.6,tags:{type:['single-family dwelling'],wealth:'poor',lit:false},build:hykPodPoor2});
// ---------------------------------------------------------------- GROWN MIDDLE 1: the lens pod (a way in). A round pod with a lens dome and a
// spire on its crown and a deep collar hooding its door, two buds beside, drips below, a railed landing. Cream.
function hykPodMid1(G,o){reseed(30366+(o.v|0));const way=o.way;const col=hC(hPick(HPAL.shell)),col2=hC(hPick(HPAL.shellWarm));const R=4.0,b=R*.92,cy=R*.447,cz=way?-R*.2:R*.3;
 const P={a:R,b,c:R,e1:.9,e2:.94,cy,nu:56,nv:28,noise:{amp:.026,su:4,sv:3,seed:4},col,hollow:{t:.07,col:hC(hPick(HPAL.shell),.9)}};
 P.openings=[{th:0,el:hykHousePodEl(P,.05+1.25),r:1.1,ky:1.15,kind:'door'},{th:.85,el:.15,r:.55,kind:'window'},{th:-.85,el:.15,r:.55,kind:'window'},{th:.3,el:.75,r:.42,kind:'window'}];
 if(way)P.openings.push({th:Math.PI,el:hykHousePodEl(P,.05+1.25),r:1.1,ky:1.15,kind:'door',back:true});
 const pod=hykHousePod(P,'hkShell',0,cz,{flare:false});let door=null;for(const op of pod.openings){if(op.kind==='door'&&op.back)hykDoor(op,{level:o.level,name:o.host.n+' way in',into:o.host.n});else if(op.kind==='door'){door=op;hykDoor(op,{level:o.level});}else hykWin(op,{});}
 hykPut('hkShell',hykFlare([0,cy,0],[0,0,1],R*.9,R*(way?.42:.45),{col}));hykFloor(0,cz,.05,R*.82,{});
 hykHouseDome(0,cz,cy+b*.8,2.2,1.3,'hkShell',col2,{rows:[{y:.4,n:10,s:.28},{y:.85,n:6,s:.22,off:.3}],spire:1.5,spireR:.36,twist:1.0});
 {const n=door.n;const l=Math.hypot(n[0],n[1],n[2])||1;const nn=[n[0]/l,n[1]/l,n[2]/l];hykPut('hkShell',hykFlare([door.p[0]-nn[0]*.75,door.p[1]-nn[1]*.75,door.p[2]-nn[2]*.75],nn,1.55,1.55,{col:col2,wobble:.02}));}   // the hood
 hykHouseSat(o,R*1.15+.6,-.5,R*.42,'hkShell',col,8,false);hykHouseSat(o,-R*1.1-.8,1.5,R*.34,'hkShell',col2,9,false);
 hykHousePodDrips(P,cz,o,col,10);hykHouseCrust(o,R*1.1,14,cy);
 hykHouseLanding(o,0,-.08,door.p[2]+2.7,2.9,{col,mat:'hkShell'});
 const doors=[[0,cz+R,2.5]];if(way)doors.push([0,cz-R,2.5,'host']);const room=hykRoom('bedroom',hykCirclePoly(0,cz,R*.78,14),.05,b*1.4,{doors,residence:true,wealth:.5});
 if(way)hykHouseWaySpotsAt(room,0,cz,1.0,{hearth:true,table:true});else hykHouseBedSpots(room,0,cz,0,1,.94,{table:true});
 hykReg('Lens pod',0,cz,R*1.3,cy+b+2.6);}
HYK.def({key:'hyk_pod_mid_1',name:'Lens pod',family:'housing',row:'Grown-on housing',grown:true,into:true,w:8.0,d:8.0,h:8.4,tags:{type:['single-family dwelling'],wealth:'middle',lit:false},build:hykPodMid1});
// ---------------------------------------------------------------- GROWN MIDDLE 2: the twin pod. Two pods fused side by side along the face,
// the sleeping pod and the hearth pod, a collar at their waist, a lens cupola, drips, the landing. Cream.
function hykPodMid2(G,o){reseed(30372+(o.v|0));const col=hC(hPick(HPAL.shell)),col2=hC(hPick(HPAL.shellWarm));const R=3.5,R2=2.6,X2=4.5;const cy=R*.447,cz=R*.3,cy2=R2*.447,cz2=o.faceZ(X2,0)+R2*.3;
 const P={a:R,b:R*.9,c:R,e1:.9,e2:.93,cy,nu:52,nv:26,noise:{amp:.026,su:4,sv:3,seed:12},col,hollow:{t:.07,col:hC(hPick(HPAL.shell),.9)}};
 P.openings=[{th:0,el:hykHousePodEl(P,.05+1.2),r:1.05,ky:1.15,kind:'door'},{th:-.9,el:.2,r:.5,kind:'window'},{th:.4,el:.8,r:.4,kind:'window'},{th:Math.PI/2,el:hykHousePodEl(P,.05+1.05),r:.95,ky:1.1,kind:'pass'}];
 const pod=hykHousePod(P,'hkShell',0,cz,{flare:false});let door=null;for(const op of pod.openings){if(op.kind==='door'){door=op;hykDoor(op,{level:o.level});}else if(op.kind==='pass')hykHousePass(op);else hykWin(op,{});}
 hykPut('hkShell',hykFlare([0,cy,0],[0,0,1],R*.9,R*.45,{col}));hykFloor(0,cz,.05,R*.8,{});
 const Q={a:R2,b:R2*.9,c:R2,e1:.9,e2:.93,cy:cy2,nu:44,nv:22,noise:{amp:.03,su:4,sv:3,seed:13},col:col2,hollow:{t:.08,col:col2}};
 Q.openings=[{th:-Math.PI/2,el:hykHousePodEl(Q,.05+1.05),r:.95,ky:1.1,kind:'pass'},{th:.2,el:.2,r:.42,kind:'window'},{th:1.3,el:.4,r:.36,kind:'window'}];
 const pod2=hykHousePod(Q,'hkShell',X2,cz2,{flare:false});for(const op of pod2.openings){if(op.kind==='pass')hykHousePass(op);else hykWin(op,{});}
 hykPut('hkShell',hykFlare([X2,cy2,o.faceZ(X2,0)+.02],[0,0,1],R2*.9,R2*.45,{col:col2}));hykFloor(X2,cz2,.05,R2*.78,{});
 hykHouseNeck({cx:0,cy,cz,r:R*.97},{cx:X2,cy:cy2,cz:cz2,r:R2*.97},'hkShell',col2);
 hykHouseDome(0,cz,cy+R*.9*.8,1.5,1.0,'hkShell',col2,{rows:[{y:.35,n:8,s:.22}],spire:1.1,spireR:.28,twist:1.1});
 hykHousePodDrips(P,cz,o,col,8);hykHousePodDrips(Q,cz2,o,col2,4);hykHouseCrust(o,R*1.1,16,cy);
 hykHouseLanding(o,0,-.08,door.p[2]+2.6,2.8,{col,mat:'hkShell'});
 const rb=hykRoom('bedroom',hykCirclePoly(0,cz,2.7,14),.05,R*.9*1.4,{doors:[[0,cz+R,2.3],[2.7,cz,1.9,'hall']],residence:true,wealth:.5});
 hykSpot(rb,'bed',-1.5,cz-.3,Math.PI/2,2.1,1.0);hykSpot(rb,'store',1.1,cz-1.5,0,1.2,.7);hykSpot(rb,'food',-.2,cz-2.0,0,.8,.8);
 const rh=hykRoom('hall',hykCirclePoly(X2,cz2,2.0,12),.05,R2*.9*1.4,{doors:[[X2-2.0,cz2,1.9,'bedroom']],wealth:.5});hykHouseSmallHall(rh,X2,cz2,-1,0,.95);
 hykReg('Twin pod',X2*.5,cz,R*1.9,cy+R*.9+1.6);}
HYK.def({key:'hyk_pod_mid_2',name:'Twin pod',family:'housing',row:'Grown-on housing',grown:true,w:12,d:7,h:7.0,tags:{type:['single-family dwelling'],wealth:'middle',lit:false},build:hykPodMid2});
// ---------------------------------------------------------------- GROWN RICH 1: the urchin pod (a way in). A nacre pod bristling with spines
// about its crown under a twisted spire, a shrine bud joined at its side, a pearl on a bracket by the door, lit
// windows, a railed landing; the back door opens onto the host's plate.
function hykPodRich1(G,o){reseed(30378+(o.v|0));const way=o.way;const col=hC(hPick(HPAL.nacre)),col2=hC(hPick(HPAL.seaGreen)),col3=hC(hPick(HPAL.coral));const R=4.2,b=R*.9,cy=R*.447,cz=way?-R*.2:R*.3;
 const P={a:R,b,c:R,e1:.9,e2:.94,cy,nu:56,nv:28,noise:{amp:.022,su:4,sv:3,seed:17},col,hollow:{t:.07,col:hC(hPick(HPAL.shell),.9)}};
 const X2=R*.95+1.0,R2=1.7;const thS=Math.PI/2;
 P.openings=[{th:0,el:hykHousePodEl(P,.05+1.3),r:1.15,ky:1.15,kind:'door'},{th:.8,el:.15,r:.55,kind:'window'},{th:-.8,el:.15,r:.55,kind:'window'},{th:-.3,el:.7,r:.42,kind:'window'},{th:thS,el:hykHousePodEl(P,.05+.9),r:.8,ky:1.05,kind:'pass'}];
 if(way)P.openings.push({th:Math.PI,el:hykHousePodEl(P,.05+1.3),r:1.15,ky:1.15,kind:'door',back:true});
 const pod=hykHousePod(P,'hkNacre',0,cz,{flare:false});let door=null;for(const op of pod.openings){if(op.kind==='door'&&op.back)hykDoor(op,{level:o.level,nacre:true,name:o.host.n+' way in',into:o.host.n});else if(op.kind==='door'){door=op;hykDoor(op,{level:o.level,nacre:true});}else if(op.kind==='pass')hykHousePass(op,true);else hykWin(op,{nacre:true,lit:true});}
 hykPut('hkNacre',hykFlare([0,cy,0],[0,0,1],R*.9,R*(way?.42:.45),{col:col3}));hykFloor(0,cz,.05,R*.82,{});
 for(let i=0;i<14;i++){const th=-2.3+i/13*4.6;const p=pod.at(th,.62),n=pod.out(th,.62);hykHouseSpike(p,[n[0],n[1]+.25,n[2]],rr(1.5,2.2),.2,col2);}
 for(let i=0;i<8;i++){const th=-1.9+i/7*3.8;const p=pod.at(th,1.05),n=pod.out(th,1.05);hykHouseSpike(p,[n[0],n[1]+.4,n[2]],rr(.9,1.3),.13,col2);}
 hykHouseSpire(0,cz,cy+b*.96-.3,2.8,.7,'hkNacre',col,{n:9,amp:.13,twist:.7});
 // the shrine bud at the side, joined with a collar, its own fillet on the face
 {const fz=o.faceZ(X2,.6);const Q={a:R2,b:R2*.95,c:R2,e1:.92,e2:.95,cy:.6+R2*.4,nu:36,nv:20,noise:{amp:.03,su:4,sv:3,seed:18},col:col3,hollow:{t:.08,col:col3}};
  const cz2=fz+R2*.45;Q.openings=[{th:-Math.PI/2,el:hykHousePodEl(Q,.05+.9),r:.8,ky:1.05,kind:'pass'},{th:.6,el:.3,r:.3,kind:'window'},{th:Math.PI/2,el:.7,r:.22,kind:'window'}];
  const bud=hykHousePod(Q,'hkNacre',X2,cz2,{flare:false});for(const op of bud.openings){if(op.kind==='pass')hykHousePass(op,true);else hykWin(op,{nacre:true,lit:true});}
  hykPut('hkNacre',hykFlare([X2,Q.cy,fz+.02],[0,0,1],R2*.88,R2*.5,{col:col3}));hykFloor(X2,cz2,.05,R2*.8,{});hykHouseNeck({cx:0,cy,cz,r:R*.97},{cx:X2,cy:Q.cy,cz:cz2,r:R2*.97},'hkNacre',col3);hykHousePodDrips(Q,cz2,o,col3,3);
  const rn=hykRoom('shrine',hykCirclePoly(X2,cz2,1.25,10),.05,Q.b*1.4,{doors:[[X2-1.25,cz2,1.6,'bedroom']],wealth:.9});hykSpot(rn,'shrine',X2+.6,cz2,Math.PI/2,.7,.5);}
 hykHouseSat(o,-R*1.1-.7,1.2,R*.36,'hkNacre',col,19,true);hykHousePodDrips(P,cz,o,col,10);hykHouseCrust(o,R*1.1,12,cy);
 {const p=pod.at(.48,.3),n=pod.out(.48,.3);hykHouseLamp(p,n,{nacre:true,level:o.level});}
 hykHouseLanding(o,0,-.08,door.p[2]+2.8,3.0,{col,mat:'hkNacre'});
 const doors=[[0,cz+R,2.6],[R*.78,cz,1.6,'shrine']];if(way)doors.push([0,cz-R,2.6,'host']);const room=hykRoom('bedroom',hykCirclePoly(0,cz,R*.78,14),.05,b*1.4,{doors,residence:true,wealth:.9});
 if(way)hykHouseWaySpotsAt(room,0,cz,1.0,{seat:true});else hykHouseBedSpots(room,0,cz,0,1,.99,{seat:true});
 hykReg('Urchin pod',X2*.3,cz,R*1.5,cy+b+3.0);}
HYK.def({key:'hyk_pod_rich_1',name:'Urchin pod',family:'housing',row:'Grown-on housing',grown:true,into:true,w:8.4,d:8.4,h:9.8,tags:{type:['single-family dwelling'],wealth:'rich',lit:true},build:hykPodRich1});
// ---------------------------------------------------------------- GROWN RICH 2: the scallop pod. A nacre pod under a ribbed scallop hood that
// grows out of the face over its crown and shades the door, a study bud, pearls under the hood, lit windows, a
// railed landing.
function hykPodRich2(G,o){reseed(30384+(o.v|0));const col=hC(hPick(HPAL.nacre)),col2=hC(hPick(HPAL.coral)),col3=hC(hPick(HPAL.shellWarm));const R=3.8,b=R*.9,cy=R*.447,cz=R*.3;
 const P={a:R,b,c:R,e1:.9,e2:.94,cy,nu:56,nv:28,noise:{amp:.022,su:4,sv:3,seed:21},col,hollow:{t:.07,col:hC(hPick(HPAL.shell),.9)}};
 const X2=-(R*.95+.9),R2=1.9;
 P.openings=[{th:0,el:hykHousePodEl(P,.05+1.25),r:1.1,ky:1.15,kind:'door'},{th:.9,el:.1,r:.5,kind:'window'},{th:-.9,el:.1,r:.5,kind:'window'},{th:-Math.PI/2,el:hykHousePodEl(P,.05+.95),r:.85,ky:1.05,kind:'pass'}];
 const pod=hykHousePod(P,'hkNacre',0,cz,{flare:false});let door=null;for(const op of pod.openings){if(op.kind==='door'){door=op;hykDoor(op,{level:o.level,nacre:true});}else if(op.kind==='pass')hykHousePass(op,true);else hykWin(op,{nacre:true,lit:true});}
 hykPut('hkNacre',hykFlare([0,cy,0],[0,0,1],R*.9,R*.45,{col:col2}));hykFloor(0,cz,.05,R*.82,{});
 // the hood: the front half of a ribbed cap a hand's breadth off the pod, its side edges curling back into the face,
 // a lipped rim along its lower edge, a knuckle where each side enters the face
 const Rh=R*1.14,nr=13,e0=.08,e1=1.5;const hood=(off,flip)=>hykSurf((u,v)=>{const ph=-Math.PI/2-.55+u*(Math.PI+1.1),e=e0+v*(e1-e0);const rr2=(Rh+off)*(1+.05*Math.cos(nr*ph));return [rr2*Math.cos(e)*Math.sin(ph),cy+rr2*Math.sin(e),cz+rr2*Math.cos(e)*Math.cos(ph)];},52,16,{col,uS:Rh*Math.PI/4,vS:Rh/4,flip});
 hykPut('hkNacre',hood(0,false));hykPut('hkNacre',hood(-.3,true));
 const rim=[];for(let i=0;i<=40;i++){const ph=-Math.PI/2-.55+i/40*(Math.PI+1.1);const rr2=(Rh-.12)*(1+.05*Math.cos(nr*ph));rim.push([rr2*Math.cos(e0)*Math.sin(ph),cy+rr2*Math.sin(e0),cz+rr2*Math.cos(e0)*Math.cos(ph)]);}
 hykPut('hkNacre',hykTube(rim,()=>.17,{seg:8,col:col2}));for(const p of [rim[0],rim[40]])kput('hkBall',p,null,[.45,.4,.45],col2);
 for(const s of [-1,1]){const i=s<0?12:28;const p=rim[i];hykHouseLamp([p[0],p[1]-.15,p[2]],[0,-.8,.3],{nacre:true,d:.45,level:o.level});}
 // the study bud on the other side, joined with a collar
 {const fz=o.faceZ(X2,.5);const Q={a:R2,b:R2*.95,c:R2,e1:.92,e2:.95,cy:.5+R2*.4,nu:40,nv:22,noise:{amp:.03,su:4,sv:3,seed:22},col:col3,hollow:{t:.08,col:col3}};
  const cz2=fz+R2*.45;Q.openings=[{th:Math.PI/2,el:hykHousePodEl(Q,.05+.95),r:.85,ky:1.05,kind:'pass'},{th:-.4,el:.25,r:.36,kind:'window'},{th:-1.6,el:.5,r:.28,kind:'window'}];
  const bud=hykHousePod(Q,'hkNacre',X2,cz2,{flare:false});for(const op of bud.openings){if(op.kind==='pass')hykHousePass(op,true);else hykWin(op,{nacre:true,lit:true});}
  hykPut('hkNacre',hykFlare([X2,Q.cy,fz+.02],[0,0,1],R2*.88,R2*.5,{col:col3}));hykFloor(X2,cz2,.05,R2*.8,{});hykHouseNeck({cx:0,cy,cz,r:R*.97},{cx:X2,cy:Q.cy,cz:cz2,r:R2*.97},'hkNacre',col2);hykHousePodDrips(Q,cz2,o,col3,3);
  const rs=hykRoom('library',hykCirclePoly(X2,cz2,1.45,12),.05,Q.b*1.4,{doors:[[X2+1.45,cz2,1.7,'bedroom']],wealth:.9});hykSpot(rs,'work',X2-.6,cz2+.3,-Math.PI/2,1.2,.7);hykSpot(rs,'seat',X2-.1,cz2-.85,Math.PI,.7,.7);}
 hykHousePodDrips(P,cz,o,col,9);hykHouseCrust(o,R*1.1,12,cy);
 hykHouseLanding(o,0,-.08,door.p[2]+2.7,2.9,{col,mat:'hkNacre'});
 const room=hykRoom('bedroom',hykCirclePoly(0,cz,R*.78,14),.05,b*1.4,{doors:[[0,cz+R,2.5],[-R*.78,cz,1.7,'library']],residence:true,wealth:.9});
 hykSpot(room,'bed',1.4,cz-.5,Math.PI/2,2.1,1.0);hykSpot(room,'store',-1.0,cz-1.7,0,1.2,.7);hykSpot(room,'food',.3,cz-2.1,0,.8,.8);hykSpot(room,'seat',-.9,cz+1.1,.3,.9,.8);
 hykReg('Scallop pod',X2*.3,cz,R*1.6,cy+Rh+1.0);}
HYK.def({key:'hyk_pod_rich_2',name:'Scallop pod',family:'housing',row:'Grown-on housing',grown:true,w:12,d:8,h:8.2,tags:{type:['single-family dwelling'],wealth:'rich',lit:true},build:hykPodRich2});
