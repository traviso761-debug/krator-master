// ================================================================= HYKKOUSOI — hospitality: the tavern, two grown taverns, the inn, the caravanserai (agent C)
// Seeds 30500–30549. The pod, cone, crown, fillet, lamp and landing helpers here (hykHosp…) are shared by the two other
// agent-C files, 73-hyk-sacred.js and 79-hyk-markets.js. Every shell is a lathe, a pod, a flare, a disc or a tube (no
// box anywhere); every opening goes through hykDoor/hykWin from a point on the shell; every lamp through hykLight with a
// bracket rooted on a shell; rooms and spots are data (DESIGN §7). Local frame: origin at the plot centre on the ground,
// +z the front, metres. Hospitality is lit (the brief): glow-pearls at the doors, a jar at the well.
// ---------------------------------------------------------------- shared helpers
// the elevation (hykPod's `el`) at which a pod's surface passes height y: y = cy + b*sgn(sin el)^e1, the underside squashed by sq
function hykHospEl(cy,b,e1,sq,y){const d=y-cy;const bb=d<0?b*(sq||1):b;const t=Math.min(.985,Math.abs(d)/bb);return Math.sign(d)*Math.asin(Math.pow(t,1/(e1||1)));}
// an ellipse polygon about (cx,cz)
function hykHospEllPoly(cx,cz,rx,rz,n){const P=[];n=n||16;for(let i=0;i<n;i++){const a=i/n*TAU;P.push([cx+rx*Math.cos(a),cz+rz*Math.sin(a)]);}return P;}
// the point where a ray from pod P's centre in direction (dx,dy,dz) meets its (noise-free) surface: the superellipsoid is
// homogeneous of degree 2/e1, so the hit is at k*d with k = f(d)^(-e1/2); the squashed underside is unsquashed first
function hykHospPodRay(P,dx,dy,dz){const dy0=dy<0?dy/(P.sq||1):dy;const f=Math.pow(Math.pow(Math.abs(dx)/P.a,2/P.e2)+Math.pow(Math.abs(dz)/P.c,2/P.e2),P.e2/P.e1)+Math.pow(Math.abs(dy0)/P.b,2/P.e1);
 const k=f>1e-9?Math.pow(f,-P.e1/2):0;return [P.cx+k*dx,P.cy+k*dy,P.cz+k*dz];}
// a fillet that follows a curved face: hykFlare's quarter circle from radius R+f on the face to R at f out, but each rim
// point is slid along n onto the real face (o.recess(p) -> the signed offset along n from the nominal rim point to the
// face), the slide fading to nothing at the top of the arc, so the collar lies on a pod or a round host and does not float
function hykHospFillet(c,n,R,f,o){o=o||{};const N=new THREE.Vector3(n[0],n[1],n[2]).normalize();let E1=new THREE.Vector3(0,1,0);if(Math.abs(E1.dot(N))>.9)E1.set(1,0,0);E1.sub(N.clone().multiplyScalar(E1.dot(N))).normalize();const E2=new THREE.Vector3().crossVectors(N,E1);
 const fn=(u,v)=>{const th=u*TAU;const s=v*Math.PI/2;const r=(R+f*(1-Math.sin(s)))*(1+(o.wobble!=null?o.wobble:.035)*Math.sin(th*5+v*3)),off=f*(1-Math.cos(s));
  const ex=E1.x*Math.cos(th)+E2.x*Math.sin(th),ey=E1.y*Math.cos(th)+E2.y*Math.sin(th),ez=E1.z*Math.cos(th)+E2.z*Math.sin(th);
  const rim=[c[0]+ex*(R+f),c[1]+ey*(R+f),c[2]+ez*(R+f)];const d=o.recess?o.recess(rim)*(1-v):0;
  return [c[0]+ex*r+N.x*(off+d),c[1]+ey*r+N.y*(off+d),c[2]+ez*r+N.z*(off+d)];};
 return hykSurf(fn,o.nu||40,o.nv||8,{col:o.col,uS:TAU*R/4,vS:f/4,flip:o.flip!==undefined?o.flip:true});}
// the fillet where satellite pod B grows out of pod A: the contact on A's surface toward B's centre, the rim snapped to A
function hykHospJoin(A,B,o){o=o||{};const dx=B.cx-A.cx,dz=B.cz-A.cz;const dl=Math.hypot(dx,dz)||1;const nx=dx/dl,nz=dz/dl;const y=o.y!=null?o.y:Math.min(A.cy,B.cy)+.2;
 const S=hykHospPodRay(A,nx*dl,y-A.cy,nz*dl);const c=[S[0]-nx*.35,y,S[2]-nz*.35];const rb=Math.min(B.a,B.c);
 const recess=p=>{const q=hykHospPodRay(A,p[0]-A.cx,p[1]-A.cy,p[2]-A.cz);return (q[0]-p[0])*nx+(q[2]-p[2])*nz;};
 hykPut(B.mat,hykHospFillet(c,[nx,0,nz],o.R||rb*.78,o.f||rb*.42,{col:B.col,recess}));}
// a ground pod at (cx,cz): a squashed superellipsoid standing .3 m into the ground, hollow, with its floor plate, its
// ground skirt and its openings resolved. o:{a,b,c,e1,e2,sq,cy,col,inCol,mat,nacre,seed,noise,nu,nv,floorY,floor,skirt,
// openings:[{th, y|el, r, ky, kind:'door'|'window', main, o:{...hykDoor/hykWin options}}]}
// Returns P = {pod,cx,cz,cy,a,b,c,e1,e2,sq,floorY,col,mat,top,door,doors,wins,surfAt(th,el),elAt(y)}.
function hykHospPod(cx,cz,o){o=o||{};const a=o.a,b=o.b||a*.92,c=o.c||a,e1=o.e1||.88,e2=o.e2||.93,sq=o.sq||.55;const cy=o.cy!=null?o.cy:b*sq-.3;
 const col=o.col||hC(hPick(HPAL.shell)),mat=o.mat||'hkShell';
 const ops=(o.openings||[]).map(op=>Object.assign({},op,{el:op.el!=null?op.el:hykHospEl(cy,b,e1,sq,op.y),ky:op.ky||1}));
 const pod=hykPod({a,b,c,e1,e2,cy,squash:sq,nu:o.nu||52,nv:o.nv||28,noise:{amp:o.noise!=null?o.noise:.022,su:4,sv:3,seed:o.seed||1},col,openings:ops,hollow:{t:.07,col:o.inCol||col}});
 pod.geo.translate(cx,0,cz);hykPut(mat,pod.geo);if(pod.inner){pod.inner.translate(cx,0,cz);hykPut('hkIn',pod.inner,true);}
 const floorY=o.floorY!=null?o.floorY:.12;const rm=Math.min(a,c);
 if(o.floor!==false)hykFloor(cx,cz,floorY,rm*.8,{col:o.floorCol});
 if(o.skirt!==false)hykPut(mat,hykFlare([cx,.02,cz],[0,1,0],rm*.9,o.skirt||rm*.3,{col}));
 const P={pod,cx,cz,cy,a,b,c,e1,e2,sq,floorY,col,mat,door:null,doors:[],wins:[],top:cy+b,
  surfAt:(th,el)=>{const p=pod.surf(((th/TAU)%1+1)%1,clamp(el/Math.PI+.5,.02,.98));return [p[0]+cx,p[1],p[2]+cz];},
  elAt:y=>hykHospEl(cy,b,e1,sq,y)};
 for(const op of pod.openings){op.p=[op.p[0]+cx,op.p[1],op.p[2]+cz];
  if(op.kind==='door'){hykDoor(op,Object.assign({level:'ground',nacre:!!o.nacre},op.o||{}));P.doors.push(op);if(!P.door||op.main)P.door=op;}
  else{hykWin(op,Object.assign({nacre:!!o.nacre},op.o||{}));P.wins.push(op);}}
 return P;}
// a barnacle cone at (cx,cz): a fluted truncated cone with an oblique rim (dipping toward `dir`), its domed lid with the
// vent lip, an inner skin, a floor and a ground skirt; openings are {th (lathe azimuth, 0 = +x), y, r, ky, kind}.
// o:{rb,rt,h,dir,tilt,col,inCol,mat,nacre,seed,openings,floor,lid,vent}. Returns C = {cx,cz,rb,rt,h,L,hAt,col,mat,door,doors,wins,at(th,y)}.
function hykHospCone(cx,cz,o){const rb=o.rb,rt=o.rt||rb*.7,h=o.h;const col=o.col||hC(hPick(HPAL.shell)),mat=o.mat||'hkShell';const tilt=o.tilt!=null?o.tilt:.26;
 const L={H:h,cx,cz,yBase:-.4,rFn:y=>rb+(rt-rb)*Math.pow(Math.max(0,y)/h,.78),nu:o.nu||46,nv:o.nv||18,flute:{n:o.flutes||14,amp:.075,sharp:1.5},rings:{n:6,amp:.022},noise:{amp:.03,su:5,sv:1.2,seed:o.seed||3},tilt:{amp:tilt,dir:o.dir!=null?o.dir:0},col};
 const ops=(o.openings||[]).map(op=>{const q=hykLatheAt(L,op.th,op.y+.4);return Object.assign({},op,{p:q.p,n:q.n,ky:op.ky||1});});
 L.ops=ops;hykPut(mat,hykLathe(L));
 hykPut('hkIn',hykLathe(Object.assign({},L,{rFn:y=>L.rFn(y)*.9,flip:true,col:hC(hPick(HPAL.shell),.86)})),true);
 hykPut(mat,hykFlare([cx,-.3,cz],[0,1,0],rb*.98,rb*.3,{col}));
 const hAt=th=>h*(1-tilt*.5*(1+Math.cos(th-L.tilt.dir)));const rtAt=th=>L.rFn(hAt(th))*(1+L.flute.amp*Math.pow(.5+.5*Math.cos(L.flute.n*th),L.flute.sharp))*(1+L.rings.amp*Math.sin(L.rings.n*TAU));
 if(o.lid!==false){hykPut(mat,hykSurf((u,v)=>{const th=u*TAU;const r=rtAt(th)*v;return [cx+r*Math.cos(th),L.yBase+hAt(th)+rt*.3*(1-v*v)-.04,cz+r*Math.sin(th)];},40,5,{col:hC(hPick(HPAL.shellWarm),.95),flip:true,hole:o.vent===false?null:(u,v)=>v<.2}));
  if(o.vent!==false){const vy=L.yBase+hAt(L.tilt.dir+Math.PI)*.5+hAt(L.tilt.dir)*.5+rt*.28;kput(o.nacre?'hkLipN':'hkLip',[cx,vy,cz],qEuler(Math.PI/2,0,0),[rt*.22,rt*.22,1.1],col);}}
 if(o.floor!==false)hykFloor(cx,cz,.08,rb*.84,{col:hC(hPick(HPAL.floor),.92)});
 const C={cx,cz,rb,rt,h,L,hAt,col,mat,door:null,doors:[],wins:[],at:(th,y)=>hykLatheAt(L,th,y+.4)};
 for(const op of ops){if(op.kind==='door'){hykDoor(op,Object.assign({level:'ground',nacre:!!o.nacre},op.o||{}));C.doors.push(op);if(!C.door||op.main)C.door=op;}else{hykWin(op,Object.assign({nacre:!!o.nacre},op.o||{}));C.wins.push(op);}}
 return C;}
// a lens-dome crown on a pod's top (the middle roof, DESIGN §4): a drum lip, a dome set with two rings of lenses, a fluted
// spire (the hearth's smoke vent when it is a tavern). yB is the dome's base: about .78 b above the pod's centre.
function hykHospCrown(cx,cz,yB,R,o){o=o||{};const col=o.col||hC(hPick(HPAL.shellWarm)),mat=o.mat||'hkShell';const H=R*(o.hk||.95);
 const D={H,cx,cz,yBase:yB,rFn:y=>R*Math.sqrt(Math.max(0,1-Math.pow(y/H,2.2)))+.05,nu:36,nv:12,rings:{n:3,amp:.03},col};
 hykPut(mat,hykLathe(D));kput(o.nacre?'hkLipN':'hkLip',[cx,yB+.02,cz],qEuler(Math.PI/2,0,0),[R*1.06,R*1.06,R*.5],col);
 const lens=hC(hPick(HPAL.lens));
 for(let ring=0;ring<2;ring++){const n=Math.max(5,Math.round(R*(ring?3:5))),y=ring?H*.62:H*.3,r=D.rFn(y)*.98;for(let i=0;i<n;i++){const a=i/n*TAU+ring*.3;kput('hkLens',[cx+r*Math.cos(a),yB+y,cz+r*Math.sin(a)],null,ring?R*.11:R*.14,lens);}}
 let top=yB+H;if(o.spire!==false){const SH=o.spire||R*1.3;hykPut(mat,hykLathe({H:SH,cx,cz,yBase:yB+H*.9,rFn:y=>R*.22*Math.pow(1-y/SH,.8)+.03,nu:14,nv:8,flute:{n:7,amp:.14,sharp:1.3},twist:.9,col}));top=yB+H*.9+SH;}
 return {top};}
// an urchin spire: a tall fluted, twisted cone rooted on a shell or the ground at (cx,yB,cz) with its own fillet
function hykHospSpire(cx,cz,yB,H,r,o){o=o||{};const col=o.col||hC(hPick(HPAL.shell)),mat=o.mat||'hkShell';
 hykPut(mat,hykLathe({H,cx,cz,yBase:yB-.2,rFn:y=>r*Math.pow(Math.max(0,1-y/H),o.taper||.85)+.04,nu:o.nu||18,nv:o.nv||14,flute:{n:o.flutes||9,amp:.15,sharp:1.3},twist:o.twist!=null?o.twist:.7,rings:{n:9,amp:.02},col}));
 if(o.recess)hykPut(mat,hykHospFillet([cx,yB,cz],o.n||[0,1,0],r*.95,r*.6,{col,recess:o.recess}));else if(o.flare!==false)hykPut(mat,hykFlare([cx,yB,cz],o.n||[0,1,0],r*.95,r*.6,{col}));return {top:yB+H,rAt:y=>r*Math.pow(Math.max(0,1-(y-yB)/H),o.taper||.85)+.04};}
// an awning over a door: a fluted half-fan grown out of the wall above the opening (its root bedded .9 m into the shell),
// both faces, a lip along its rim
function hykHospHood(P,door,o){o=o||{};const reach=o.reach||door.r*2.0;const n=door.n;const nl=Math.hypot(n[0],n[2])||1;const nx=n[0]/nl,nz=n[2]/nl;
 const top=door.p[1]+door.r*door.ky+.5;const rx=door.p[0]-nx*.9,rz=door.p[2]-nz*.9;const col=o.col||P.col;const tx=-nz,tz=nx;
 const fn=(u,v)=>{const th=u*Math.PI;const rho=v*reach;const fl=1+.05*Math.cos(9*th);const s=Math.cos(th)*fl,f=Math.sin(th)*fl;
  return [rx+tx*rho*s+nx*rho*f,top-.3*rho-.05*v*v*reach+.1*Math.cos(9*th)*v,rz+tz*rho*s+nz*rho*f];};
 hykPut(P.mat,hykSurf(fn,24,6,{col,flip:true}));hykPut(P.mat,hykSurf(fn,24,6,{col:hC(hPick(HPAL.shellWarm),.9),flip:false}));
 const rim=[];for(let i=0;i<=24;i++)rim.push(fn(i/24,1));hykPut(P.mat,hykTube(rim,()=>.1,{seg:6,col}));}
// a glow-pearl on a bracket rooted on pod P's surface at bearing th (from +z toward +x) and height y, standing .5 m off it
function hykHospLamp(P,th,y,o){o=o||{};const A=P.surfAt(th,P.elAt(y));const vx=A[0]-P.cx,vy=A[1]-P.cy,vz=A[2]-P.cz;const vl=Math.hypot(vx,vy,vz)||1;const out=o.out||.5;
 return hykLight(A[0]+vx/vl*out,A[1]+vy/vl*out+.1,A[2]+vz/vl*out,Object.assign({r:.2,bracket:A},o));}
// the same on a cone C (lathe azimuth th, 0 = +x)
function hykHospLampCone(C,th,y,o){o=o||{};const q=C.at(th,y);const out=o.out||.5;return hykLight(q.p[0]+q.n[0]*out,q.p[1]+q.n[1]*out+.1,q.p[2]+q.n[2]*out,Object.assign({r:.2,bracket:q.p},o));}
// world -> local (the inverse of hykW / hykN) for members and landings handed to a builder in world coordinates
function hykHospL(wx,wy,wz){const c=HYK.cur;if(!c)return [wx,wy,wz];const dx=wx-c.x,dz=wz-c.z;const cs=Math.cos(c.ry),sn=Math.sin(c.ry);return [dx*cs-dz*sn,wy-(c.o.y||0),dx*sn+dz*cs];}
function hykHospLDir(nx,ny,nz){const c=HYK.cur;if(!c)return [nx,ny,nz];const cs=Math.cos(c.ry),sn=Math.sin(c.ry);return [nx*cs-nz*sn,ny,nx*sn+nz*cs];}
// a host's members (capsules and head boxes, world) in the local frame, for hykBridge runners drawn in a builder's frame
function hykHospLocalMembers(ms){return (ms||[]).map(m=>m.c?Object.assign({},m,{c:hykHospL(m.c[0],m.c[1],m.c[2]),u:hykHospLDir(m.u[0],m.u[1],m.u[2]),v:hykHospLDir(m.v[0],m.v[1],m.v[2]),w:hykHospLDir(m.w[0],m.w[1],m.w[2])}):Object.assign({},m,{a:hykHospL(m.a[0],m.a[1],m.a[2]),b:hykHospL(m.b[0],m.b[1],m.b[2])}));}
// deck records pushed while drawing in a builder's frame are local: rewrite the ones from index n0 on in world coordinates
function hykHospFixDecks(n0){for(let i=n0;i<NAV_EXTRA.length;i++){const d=NAV_EXTRA[i];
 if(d.a&&d.b){const wa=hykW(d.a[0],d.a[1],d.a[2]),wb=hykW(d.b[0],d.b[1],d.b[2]);d.a=wa;d.b=wb;d.x0=Math.min(wa[0],wb[0])-d.w;d.z0=Math.min(wa[2],wb[2])-d.w;d.x1=Math.max(wa[0],wb[0])+d.w;d.z1=Math.max(wa[2],wb[2])+d.w;d.y=Math.max(wa[1],wb[1]);}
 else if(d.kind!=='pad'){const cx=(d.x0+d.x1)/2,cz=(d.z0+d.z1)/2,r=(d.x1-d.x0)/2;const w=hykW(cx,d.y,cz);d.x0=w[0]-r;d.x1=w[0]+r;d.z0=w[2]-r;d.z1=w[2]+r;d.y=w[1];}}}
// the landing in front of a grown pod's door, in the LOCAL frame. (62's o.landing converts to world first and hykPut/kput
// then apply the frame again, so its pad lands hundreds of metres off; reported. Until it is fixed, the pad is drawn
// here in local coordinates and its deck record and the host's landing entry are written in world coordinates.)
function hykHospLanding(o,lx,ly,lz,R,opt){const n0=NAV_EXTRA.length;hykPad(lx,ly,lz,R,Object.assign({own:o.host.n},opt||{}));hykHospFixDecks(n0);
 const w=hykW(lx,ly,lz);o.host.landings.push({x:w[0],y:w[1],z:w[2],r:R,level:o.level,a:o.a});return {x:lx,y:ly,z:lz,r:R,w};}
// a pod grown on the host's face in the G frame: its centre at (x, dy + .447 R, faceZ + proud R), rooted with a fillet that
// follows the round face, drips read off its own underside, its floor plate, its openings resolved. s:{R,x,dy,proud,b,e1,
// e2,col,inCol,mat,nacre,seed,nu,nv,floor,floorY,drips,openings:[{th,y|el,r,ky,kind,back,main,o}]} (th from +z toward +x)
function hykHospGrownPod(o,s){const R=s.R,x=s.x||0,dy=s.dy||0,proud=s.proud!=null?s.proud:.3;const b=s.b||R*.86,e1=s.e1||.9,e2=s.e2||.94;
 const cy=dy+R*.447;const fz=o.faceZ(x,dy);const cz=fz+R*proud;const col=s.col||hC(hPick(HPAL.shell)),mat=s.mat||'hkShell';
 const ops=(s.openings||[]).map(op=>Object.assign({},op,{el:op.el!=null?op.el:hykHospEl(cy,b,e1,1,op.y),ky:op.ky||1}));
 const pod=hykPod({a:R,b,c:R,e1,e2,cy,nu:s.nu||52,nv:s.nv||28,noise:{amp:.028,su:4,sv:3,seed:s.seed||4},col,openings:ops,hollow:{t:.07,col:s.inCol||col}});
 pod.geo.translate(x,0,cz);hykPut(mat,pod.geo);pod.inner.translate(x,0,cz);hykPut('hkIn',pod.inner,true);
 const floorY=s.floorY!=null?s.floorY:(proud<.1?.05:cy-b*.52);
 if(s.floor!==false)hykFloor(x,cz,floorY,R*.82,{});
 const rs=o.host.rAt(o.y+dy,o.a);const sn=-x/rs,cn=Math.sqrt(Math.max(0,1-sn*sn));const n=[sn,0,cn];   // the face normal at x (the host is round)
 hykPut(mat,hykHospFillet([x,cy,fz],n,R*(proud<.1?.86:.9),R*(proud<.1?.3:.45),{col,recess:p=>(o.faceZ(p[0],p[1]-dy)-fz)*cn}));
 const P={pod,R,a:R,b,c:R,e1,e2,sq:1,cx:x,cz,cy,floorY,col,mat,fz,n,door:null,back:null,doors:[],wins:[],top:cy+b,
  surfAt:(th,el)=>{const p=pod.surf(((th/TAU)%1+1)%1,clamp(el/Math.PI+.5,.02,.98));return [p[0]+x,p[1],p[2]+cz];},elAt:y=>hykHospEl(cy,b,e1,1,y)};
 for(const op of pod.openings){op.p=[op.p[0]+x,op.p[1],op.p[2]+cz];
  if(op.kind==='door'&&op.back){P.back=op;hykDoor(op,Object.assign({level:o.level,name:o.host.n+' way in',into:o.host.n,nacre:!!s.nacre},op.o||{}));}
  else if(op.kind==='door'){hykDoor(op,Object.assign({level:o.level,nacre:!!s.nacre},op.o||{}));P.doors.push(op);if(!P.door||op.main)P.door=op;}
  else{hykWin(op,Object.assign({nacre:!!s.nacre},op.o||{}));P.wins.push(op);}}
 // drips hang from the underside, read off the superellipsoid itself, their bases .22 m up inside the shell, only where the
 // pod stands clear of the face
 const nd=s.drips!=null?s.drips:Math.round(R*2.2);for(let i=0;i<nd;i++){const a2=rr(-1.25,1.25);const ro=rr(.15,.62)*R;const dx=ro*Math.sin(a2),dz=ro*Math.cos(a2);
  if(cz+dz<.4)continue;const under=hykPodUnder(R,b,R,e1,e2,dx,dz);if(under==null)continue;const h=rr(.35,1.1)*R*.3;
  kput('hkDrip',[x+dx,cy-under-h/2+.22,cz+dz],qEuler(Math.PI,0,0),[h*.3,h,h*.3],col);}
 return P;}
// the support rib from the host's face up to a landing's underside, rooted in the face
function hykHospPadRib(o,lx,ly,lz,opt){opt=opt||{};const bone=hC(hPick(HPAL.bone));const rx=lx*.6,y0=ly-(opt.drop||3.6);const fz=o.faceZ(rx,y0);
 hykPut('hkBone',hykRib([rx,y0,fz-.5],[lx,ly-.45,lz],{rise:opt.rise!=null?opt.rise:-1.4,r0:.36,r1:.26,knuckles:3,col:bone}));
 hykPut('hkBone',hykFlare([rx,y0,fz+.03],[0,0,1],.34,.5,{col:bone}));kput('hkBall',[rx,y0,fz+.45],null,[.5,.5,.5],bone);}
// the tavern's programme as spots in a round room about (cx,cz) of radius r: a hearth at the back-left, the counter at the
// back-right, a table with two seats on each side, the food jars by the hearth. `axis` keeps the z axis clear (a way-in pod).
function hykHospTavernSpots(room,cx,cz,r,axis){
 hykSpot(room,'hearth',cx-.54*r,cz-.54*r,0,1.0,1.0);hykSpot(room,'counter',cx+.36*r,cz-.63*r,0,1.6,.7);hykSpot(room,'food',cx-.14*r,cz-.79*r,0,.8,.8);
 hykSpot(room,'table',cx-(axis?.25:0)*r,cz-.1*r,0,1.2,1.2);hykSpot(room,'seat',cx-.54*r,cz+.27*r,0,1.2,.9);hykSpot(room,'seat',cx+.54*r,cz+.27*r,0,1.2,.9);}
// ================================================================= the tavern (free-standing, middle, lit)
// A broad squat pod, the taproom, with a lens-dome crown and the hearth's fluted chimney; a store pod grown onto its
// -x flank with a passage between; an awning over the door on glow-pearls; growth rings in the shell.
function hykHospBuildTavern(G,o){reseed(30500+(o.v|0));const col=hC(hPick(HPAL.shell)),col2=hC(hPick(HPAL.shellWarm));
 const A=hykHospPod(.6,-1.0,{a:6.2,b:4.6,c:5.4,sq:.55,col,inCol:hC(hPick(HPAL.shell),.9),seed:5,skirt:1.5,
  openings:[{th:0,y:1.62,r:1.15,ky:1.3,kind:'door',main:true},{th:.75,y:3.2,r:.6,kind:'window'},{th:-.75,y:3.2,r:.58,kind:'window'},{th:2.2,y:3.4,r:.55,kind:'window'},{th:-2.2,y:3.3,r:.52,kind:'window'},{th:Math.PI,y:3.6,r:.5,kind:'window'},{th:.35,y:5.3,r:.42,kind:'window'},
   {th:Math.atan2(-7.2,-1.2),y:1.5,r:.95,ky:1.2,kind:'door',o:{name:'Tavern store door'}}]});
 const B=hykHospPod(-6.6,-2.2,{a:2.9,b:2.7,c:2.7,sq:.55,col:col2,seed:9,openings:[{th:Math.atan2(7.2,1.2),y:1.4,r:.9,ky:1.2,kind:'door',o:{name:'Tavern store door'}},{th:-Math.PI/2+.3,y:1.9,r:.4,kind:'window'},{th:Math.PI,y:1.7,r:.34,kind:'window'}]});
 hykHospJoin(A,B,{});
 hykHospCrown(A.cx,A.cz,A.cy+A.b*.78,2.1,{col:col2,spire:3.0});
 hykHospHood(A,A.door,{reach:2.4});
 hykHospLamp(A,.42,3.0,{level:'ground'});hykHospLamp(A,-.42,3.0,{level:'ground'});
 hykLight(A.cx+1.2,A.cy+A.b*.5,A.cz-1.0,{r:.2,level:'ground',bracket:[A.cx+1.2,A.cy+A.b*.92,A.cz-1.0]});   // over the counter, from the ceiling
 // a few barnacle specks at the skirt
 for(let i=0;i<14;i++){const a=rng()*TAU;const e=rr(.2,1.3);const s=rr(.1,.26);kput('hkBarnB',[A.cx+(A.a*.95+e)*Math.cos(a),.1+rr(0,.5),A.cz+(A.c*.95+e)*Math.sin(a)],null,[s,s*.7,s],hC(hPick(HPAL.barnacle)));}
 // rooms: the taproom and the store
 const tap=hykRoom('tavern',hykHospEllPoly(A.cx,A.cz,A.a*.8,A.c*.8,18),A.floorY,A.cy+A.b*.9-A.floorY,{doors:[[A.door.p[0],A.door.p[2],2.3,'street'],[A.doors[1].p[0],A.doors[1].p[2],1.9,'store']],wealth:.5});
 hykHospTavernSpots(tap,A.cx,A.cz,4.3,false);hykSpot(tap,'seat',A.cx-1.0,A.cz+2.6,0,1.2,.9);hykSpot(tap,'seat',A.cx+1.2,A.cz+2.5,0,1.2,.9);
 const st=hykRoom('store',hykCirclePoly(B.cx,B.cz,B.a*.78,14),B.floorY,B.cy+B.b*.9-B.floorY,{doors:[[B.door.p[0],B.door.p[2],1.8,'tavern']],wealth:.5});
 hykSpot(st,'store',B.cx,B.cz-1.1,0,1.2,.7);hykSpot(st,'store',B.cx-1.0,B.cz+.8,Math.PI/2,1.2,.7);hykSpot(st,'food',B.cx+1.2,B.cz+.6,0,.8,.8);
 hykReg('Tavern',-.6,-1.2,10.2,10.6);}
HYK.def({key:'hyk_tavern_1',name:'Tavern',family:'hospitality',row:'Hospitality',w:21,d:15,h:10.6,tags:{type:['tavern/inn'],wealth:'middle',lit:true},build:hykHospBuildTavern});
// ================================================================= the grown taverns (G frame)
// 1: the way-in tavern, bedded a fifth into the host with its back door onto the plate; a store satellite along the face
// with a passage into the taproom; the lens crown and chimney; the landing on a rib; pearls at the door.
function hykHospBuildPodTavern1(G,o){reseed(30508+(o.v|0));const R=5.2,way=!!o.way;const col=hC(hPick(HPAL.shell)),col2=hC(hPick(HPAL.shellWarm));
 const ops=[{th:0,el:-.06,r:1.2,ky:1.3,kind:'door',main:true},{th:.8,el:.12,r:.62,kind:'window'},{th:-.8,el:.12,r:.62,kind:'window'},{th:1.75,el:.4,r:.48,kind:'window'},{th:-1.75,el:.4,r:.48,kind:'window'},{th:.25,el:.78,r:.5,kind:'window'},
  {th:Math.atan2(6.0,1.9),y:1.5,r:.95,ky:1.2,kind:'door',o:{name:'Grown tavern store door'}}];
 if(way)ops.push({th:Math.PI,el:-.06,r:1.2,ky:1.3,kind:'door',back:true});
 const A=hykHospGrownPod(o,{R,proud:way?-.2:.3,col,seed:4,openings:ops});
 const B=hykHospGrownPod(o,{R:2.5,x:6.0,proud:.6,col:col2,seed:7,drips:4,openings:[{th:Math.atan2(-6.0,-1.9),y:1.4,r:.9,ky:1.2,kind:'door',o:{name:'Grown tavern store door'}},{th:1.2,y:1.9,r:.4,kind:'window'},{th:.2,y:2.3,r:.34,kind:'window'}]});
 hykHospJoin(A,B,{});
 hykHospCrown(A.cx,A.cz,A.cy+A.b*.8,1.7,{col:col2,spire:2.4});
 const padY=A.door.p[1]-A.door.r*A.door.ky+.12,padZ=A.door.p[2]+3.0;const pad=hykHospLanding(o,0,padY,padZ,3.3,{});hykHospPadRib(o,0,padY,padZ,{});
 hykHospLamp(A,.4,A.cy+.9,{level:o.level});hykHospLamp(A,-.4,A.cy+.9,{level:o.level});
 hykLight(A.cx+1.0,A.cy+A.b*.45,A.cz-.8,{r:.2,level:o.level,bracket:[A.cx+1.0,A.cy+A.b*.92,A.cz-.8]});
 const doors=[[A.door.p[0],A.door.p[2],2.4,'landing'],[A.doors[1].p[0],A.doors[1].p[2],1.9,'store']];if(A.back)doors.push([A.back.p[0],A.back.p[2],2.4,'host']);
 const tap=hykRoom('tavern',hykCirclePoly(A.cx,A.cz,R*.78,16),A.floorY,A.b*1.3,{doors,wealth:.5});hykHospTavernSpots(tap,A.cx,A.cz,R*.78,true);
 const sp=hykCirclePoly(B.cx,B.cz,B.R*.78,14).map(p=>[p[0],Math.max(p[1],B.fz+.4)]);
 const st=hykRoom('store',sp,B.floorY,B.b*1.3,{doors:[[B.door.p[0],B.door.p[2],1.8,'tavern']],wealth:.5});
 hykSpot(st,'store',B.cx,B.cz+1.05,0,1.2,.7);hykSpot(st,'food',B.cx+1.1,B.cz-.4,0,.8,.8);
 hykReg('Grown tavern',0,A.cz+1,R*1.6,R*1.9);}
HYK.def({key:'hyk_pod_tavern_1',name:'Grown tavern',family:'hospitality',row:'Hospitality',grown:true,into:true,w:10.4,d:12,h:9.6,tags:{type:['tavern/inn'],wealth:'middle',lit:true},build:hykHospBuildPodTavern1});
// 2: the hanging tavern, proud of the face, taller (an egg), with a railed drinking terrace beside its landing, a jar lamp
// on the terrace rooted in the shell, the store satellite on the -x side.
function hykHospBuildPodTavern2(G,o){reseed(30516+(o.v|0));const R=5.2;const col=hC(hPick(HPAL.shellWarm)),col2=hC(hPick(HPAL.shell));
 const A=hykHospGrownPod(o,{R,b:R*1.0,e1:.82,proud:.3,col,seed:11,openings:[{th:0,el:-.08,r:1.2,ky:1.3,kind:'door',main:true},{th:.85,el:.1,r:.6,kind:'window'},{th:-.85,el:.1,r:.6,kind:'window'},{th:.55,el:.55,r:.42,kind:'window'},{th:-.55,el:.55,r:.42,kind:'window'},{th:1.6,el:.35,r:.5,kind:'window'},
  {th:Math.atan2(-6.0,-1.6),y:1.5,r:.95,ky:1.2,kind:'door',o:{name:'Hanging tavern store door'}}]});
 const B=hykHospGrownPod(o,{R:2.5,x:-6.0,proud:.6,col:col2,seed:13,drips:4,openings:[{th:Math.atan2(6.0,1.6),y:1.4,r:.9,ky:1.2,kind:'door',o:{name:'Hanging tavern store door'}},{th:-1.2,y:1.9,r:.4,kind:'window'},{th:-.2,y:2.3,r:.34,kind:'window'}]});
 hykHospJoin(A,B,{});
 hykHospCrown(A.cx,A.cz,A.cy+A.b*.78,1.5,{col:col2,hk:1.2,spire:3.4});
 const padY=A.door.p[1]-A.door.r*A.door.ky+.12,padZ=A.door.p[2]+2.9;hykHospLanding(o,0,padY,padZ,3.1,{});hykHospPadRib(o,0,padY,padZ,{});
 const TX=5.4,TZ=padZ+.6,TR=3.4;hykHospLanding(o,TX,padY,TZ,TR,{rail:{a0:Math.PI,gap:2*Math.asin(Math.min(1,2.2/TR))+.2}});hykHospPadRib(o,TX,padY,TZ,{drop:4.2,rise:-1.8});
 hykHospLamp(A,.4,A.cy+.9,{level:o.level});hykHospLamp(A,-.4,A.cy+.9,{level:o.level});
 const J=A.surfAt(.95,A.elAt(A.cy+1.6));hykLight(J[0]+1.2,J[1]+.3,J[2]+.9,{r:.2,cool:true,level:o.level,bracket:J});   // the jar over the terrace
 hykLight(A.cx-1.0,A.cy+A.b*.45,A.cz-.8,{r:.2,level:o.level,bracket:[A.cx-1.0,A.cy+A.b*.92,A.cz-.8]});
 const tap=hykRoom('tavern',hykCirclePoly(A.cx,A.cz,R*.78,16),A.floorY,A.b*1.3,{doors:[[A.door.p[0],A.door.p[2],2.4,'landing'],[A.doors[1].p[0],A.doors[1].p[2],1.9,'store']],wealth:.5});
 hykHospTavernSpots(tap,A.cx,A.cz,R*.78,false);
 const sp=hykCirclePoly(B.cx,B.cz,B.R*.78,14).map(p=>[p[0],Math.max(p[1],B.fz+.4)]);
 const st=hykRoom('store',sp,B.floorY,B.b*1.3,{doors:[[B.door.p[0],B.door.p[2],1.8,'tavern']],wealth:.5});
 hykSpot(st,'store',B.cx,B.cz+1.05,0,1.2,.7);hykSpot(st,'food',B.cx-1.1,B.cz-.4,0,.8,.8);
 hykReg('Hanging tavern',1.5,A.cz+1.5,R*1.9,R*2.1);}
HYK.def({key:'hyk_pod_tavern_2',name:'Hanging tavern',family:'hospitality',row:'Hospitality',grown:true,w:16,d:15,h:11,tags:{type:['tavern/inn'],wealth:'middle',lit:true},build:hykHospBuildPodTavern2});
// ================================================================= the inn (free-standing, middle, lit)
// A hall pod at the back of a paved court, four guest pods along the court's sides with their doors onto it, the court
// closed at the front by two gate horns under a bone arch and low grown rims; pearls at the hall door and on the horns.
function hykHospBuildInn(G,o){reseed(30524+(o.v|0));const col=hC(hPick(HPAL.shell)),col2=hC(hPick(HPAL.shellWarm));
 const H=hykHospPod(0,-7.5,{a:6.0,b:4.8,c:5.2,sq:.55,col,seed:21,skirt:1.5,openings:[{th:0,y:1.62,r:1.15,ky:1.3,kind:'door',main:true},{th:.8,y:3.4,r:.6,kind:'window'},{th:-.8,y:3.4,r:.6,kind:'window'},{th:2.3,y:3.4,r:.55,kind:'window'},{th:-2.3,y:3.4,r:.55,kind:'window'},{th:Math.PI,y:3.8,r:.5,kind:'window'},{th:.4,y:5.4,r:.45,kind:'window'}]});
 hykHospCrown(H.cx,H.cz,H.cy+H.b*.78,2.2,{col:col2,spire:3.0});hykHospHood(H,H.door,{reach:2.3});
 hykHospLamp(H,.42,3.0,{level:'ground'});hykHospLamp(H,-.42,3.0,{level:'ground'});
 const hall=hykRoom('hall',hykHospEllPoly(H.cx,H.cz,H.a*.8,H.c*.8,18),H.floorY,H.cy+H.b*.9-H.floorY,{doors:[[H.door.p[0],H.door.p[2],2.3,'court']],wealth:.5});
 hykSpot(hall,'hearth',-2.4,-9.6,0,1.0,1.0);hykSpot(hall,'counter',2.6,-9.8,0,1.6,.7);hykSpot(hall,'food',-.2,-11.0,0,.8,.8);
 hykSpot(hall,'table',-1.6,-6.4,0,1.2,1.2);hykSpot(hall,'seat',-1.6,-4.9,0,1.2,.9);hykSpot(hall,'seat',-3.2,-6.4,Math.PI/2,1.2,.9);
 hykSpot(hall,'table',2.0,-6.2,0,1.2,1.2);hykSpot(hall,'seat',2.0,-4.7,0,1.2,.9);hykSpot(hall,'seat',3.6,-6.2,Math.PI/2,1.2,.9);
 // the guest pods: doors toward the court's centre; bed at the back, store and food either side of the door
 const CC=[0,3.0];const beds=[[-9.0,-7.0],[9.0,-7.0],[-8.3,2.6],[8.3,2.6]];const pods=[];
 beds.forEach((p,i)=>{const dx=CC[0]-p[0],dz=CC[1]-p[1];const th=Math.atan2(dx,dz);const dl=Math.hypot(dx,dz)||1;const ux=dx/dl,uz=dz/dl,tx=uz,tz=-ux;
  const B=hykHospPod(p[0],p[1],{a:3.3,b:3.0,c:3.2,sq:.55,col:i%2?col2:col,seed:31+i,openings:[{th,y:1.42,r:1.08,ky:1.25,kind:'door',main:true},{th:th+1.5,y:2.1,r:.42,kind:'window'},{th:th-1.5,y:2.0,r:.4,kind:'window'},{th:th+Math.PI,y:2.3,r:.36,kind:'window'}]});
  pods.push(B);kput('hkLip',[p[0],B.top-.3,p[1]],qEuler(Math.PI/2,0,0),[.5,.5,1.0],col2);   // the vent at the crown
  const rm=hykRoom('bedroom',hykCirclePoly(p[0],p[1],B.a*.78,14),B.floorY,B.cy+B.b*.9-B.floorY,{doors:[[B.door.p[0],B.door.p[2],2.16,'court']],residence:true,wealth:.5});
  hykSpot(rm,'bed',p[0]-ux*1.3,p[1]-uz*1.3,th,2.1,1.0);hykSpot(rm,'store',p[0]+tx*1.5+ux*.3,p[1]+tz*1.5+uz*.3,th+Math.PI/2,1.2,.7);hykSpot(rm,'food',p[0]-tx*1.5+ux*.3,p[1]-tz*1.5+uz*.3,th,.8,.8);});
 hykHospJoin(H,pods[0],{y:1.2,R:1.8,f:1.4});hykHospJoin(H,pods[1],{y:1.2,R:1.8,f:1.4});
 // the court: shell paving, a planting spot at its heart, a bench; the gate horns, their arch and the rims
 hykPut('hkFloor',hykDisc(0,.04,3.0,6.2,{col:hC(hPick(HPAL.floor),.95),lobes:{n:9,amp:.06},nu:40}));
 const bone=hC(hPick(HPAL.bone));
 for(const s of [-1,1]){hykHospSpire(s*3.0,8.6,0,4.8,1.0,{col:col2,flutes:8,twist:1.2});
  hykPut('hkBone',hykTube([[s*3.0,.3,8.6],[s*4.6,.35,7.5],[s*6.0,.3,5.6]],t=>.3*(1+.2*Math.max(0,Math.cos(t*3*TAU))),{seg:8,col:bone}));
  hykPut('hkBone',hykTube([[s*9.0,.3,-3.7],[s*9.6,.4,-2.0],[s*8.9,.3,-.4]],t=>.28,{seg:8,col:bone}));
  const Hp=hykLatheAt({cx:s*3.0,cz:8.6,yBase:-.2,rFn:y=>1.0*Math.pow(Math.max(0,1-y/4.8),.85)+.04},Math.PI/2,2.8);
  hykLight(Hp.p[0]+Hp.n[0]*.45,Hp.p[1]+.1,Hp.p[2]+Hp.n[2]*.45,{r:.18,level:'ground',bracket:Hp.p});}
 hykPut('hkBone',hykRib([-3.0,4.4,8.6],[3.0,4.4,8.6],{rise:1.1,r0:.2,r1:.14,knuckles:3,col:bone}));
 const court=hykRoom('court',hykCirclePoly(0,3.0,5.0,16),.04,20,{doors:[[0,8.6,3.4,'street'],[H.door.p[0],H.door.p[2],2.3,'hall']].concat(pods.map(B=>[B.door.p[0],B.door.p[2],2.16,'bedroom'])),wealth:.5});
 hykSpot(court,'plant',0,3.0,0,1.4,1.4);hykSpot(court,'seat',-2.6,5.4,0,1.4,1.0);hykSpot(court,'seat',2.6,5.4,0,1.4,1.0);
 hykReg('Inn',0,-1.5,13.5,11.2);}
HYK.def({key:'hyk_inn',name:'Inn',family:'hospitality',row:'Hospitality',w:26,d:23,h:11.2,tags:{type:['tavern/inn'],wealth:'middle',lit:true},build:hykHospBuildInn});
// ================================================================= the caravanserai (free-standing, middle, lit, 46 m)
// A round court with a well at its heart; round it, on fourteen slots, the gate lodge (a barnacle cone with an arch through
// it, two urchin spires beside it), six beast-and-cart stalls (open-rimmed barnacle cones) alternating with six guest pods,
// and the keeper's hall at the back. It stands by the main market in the city.
function hykHospBuildCaravanserai(G,o){reseed(30532+(o.v|0));const col=hC(hPick(HPAL.shell)),col2=hC(hPick(HPAL.shellWarm)),bone=hC(hPick(HPAL.bone));
 const RING=19.5,N=14;const slot=k=>{const ph=Math.PI/2-k*TAU/N;return {x:RING*Math.cos(ph),z:RING*Math.sin(ph),ph};};
 hykPut('hkFloor',hykDisc(0,.04,0,15.2,{col:hC(hPick(HPAL.floor),.95),lobes:{n:14,amp:.04},nu:56}));
 const courtDoors=[];
 // the well: a lathe basin, teal water, a lip, a bone hoop over it carrying the jar
 hykPut('hkShell',hykLathe({H:1.0,cx:0,cz:0,yBase:0,rFn:y=>1.7+.22*Math.sin(y*3.2),nu:28,nv:6,rings:{n:3,amp:.03},col}));
 hykPut('hkMosaic',hykLathe({H:1.0,cx:0,cz:0,yBase:0,rFn:y=>1.55+.22*Math.sin(y*3.2),nu:28,nv:6,flip:true,col:hC(hPick(HPAL.teal))}));
 hykPut('hkFloor',hykDisc(0,.72,0,1.6,{col:hC(hPick(HPAL.teal),1.1),nu:24}));kput('hkLip',[0,1.0,0],qEuler(Math.PI/2,0,0),[1.75,1.75,1.0],col);
 hykPut('hkBone',hykRib([-1.8,.9,0],[1.8,.9,0],{rise:2.3,r0:.18,r1:.12,knuckles:2,col:bone}));hykLight(0,2.6,0,{r:.2,cool:true,level:'ground',bracket:[0,3.2,0]});
 // the gate lodge at slot 0 and its spires
 const g=slot(0);const lodge=hykHospCone(g.x,g.z+1.0,{rb:4.3,rt:3.1,h:6.4,tilt:.1,dir:Math.PI/2,col,seed:41,openings:[{th:Math.PI/2,y:1.3,r:1.2,kind:'door',main:true,o:{name:'Caravanserai gate'}},{th:-Math.PI/2,y:1.3,r:1.2,kind:'door',o:{name:'Caravanserai gate, court side'}},{th:0,y:3.2,r:.45,kind:'window'},{th:Math.PI,y:3.2,r:.45,kind:'window'}]});
 hykHospLampCone(lodge,Math.PI/2+.42,3.1,{level:'ground'});hykHospLampCone(lodge,Math.PI/2-.42,3.1,{level:'ground'});hykHospLampCone(lodge,-Math.PI/2+.4,3.0,{level:'ground'});
 for(const s of [-1,1])hykHospSpire(s*6.2,g.z+1.6,0,11,1.5,{col:col2,flutes:9,twist:.6});
 hykPut('hkBone',hykRib([-6.2,6.6,g.z+1.6],[6.2,6.6,g.z+1.6],{rise:2.2,r0:.3,r1:.2,knuckles:4,col:bone}));
 const lr=hykRoom('hall',hykCirclePoly(lodge.cx,lodge.cz,3.3,14),.08,5.4,{doors:[[lodge.door.p[0],lodge.door.p[2],2.4,'street'],[lodge.doors[1].p[0],lodge.doors[1].p[2],2.4,'court']],wealth:.5});
 hykSpot(lr,'seat',lodge.cx+2.2,lodge.cz,Math.PI/2,1.2,.9);hykSpot(lr,'store',lodge.cx-2.2,lodge.cz,Math.PI/2,1.2,.7);
 courtDoors.push([lodge.doors[1].p[0],lodge.doors[1].p[2],2.4,'hall']);
 // the keeper's hall at the back, slot 7
 const hb=slot(7);const H=hykHospPod(hb.x,hb.z,{a:5.0,b:4.2,c:4.6,sq:.55,col,seed:43,skirt:1.3,openings:[{th:0,y:1.6,r:1.15,ky:1.3,kind:'door',main:true},{th:.85,y:3.0,r:.55,kind:'window'},{th:-.85,y:3.0,r:.55,kind:'window'},{th:Math.PI,y:3.2,r:.5,kind:'window'},{th:.3,y:4.8,r:.4,kind:'window'}]});
 hykHospCrown(H.cx,H.cz,H.cy+H.b*.78,1.9,{col:col2,spire:2.8});hykHospHood(H,H.door,{reach:2.2});hykHospLamp(H,.42,2.9,{level:'ground'});hykHospLamp(H,-.42,2.9,{level:'ground'});
 const hall=hykRoom('hall',hykHospEllPoly(H.cx,H.cz,H.a*.8,H.c*.8,18),H.floorY,H.cy+H.b*.9-H.floorY,{doors:[[H.door.p[0],H.door.p[2],2.3,'court']],wealth:.5});
 hykSpot(hall,'hearth',H.cx-2.0,H.cz-2.1,0,1.0,1.0);hykSpot(hall,'counter',H.cx+2.0,H.cz-1.9,0,1.6,.7);hykSpot(hall,'food',H.cx-.2,H.cz-3.1,0,.8,.8);
 hykSpot(hall,'table',H.cx,H.cz+.3,0,1.2,1.2);hykSpot(hall,'seat',H.cx-1.8,H.cz+.9,0,1.2,.9);hykSpot(hall,'seat',H.cx+1.8,H.cz+.9,0,1.2,.9);
 courtDoors.push([H.door.p[0],H.door.p[2],2.3,'hall']);
 // the ring: guest pods on the even slots, stalls on the odd ones
 for(let k=1;k<N;k++){if(k===7)continue;const s=slot(k);const dx=-s.x,dz=-s.z;const dl=Math.hypot(dx,dz)||1;const ux=dx/dl,uz=dz/dl,tx=uz,tz=-ux;
  if(k%2===0){const th=Math.atan2(ux,uz);const B=hykHospPod(s.x,s.z,{a:3.3,b:3.0,c:3.2,sq:.55,col:k%4?col:col2,seed:50+k,openings:[{th,y:1.42,r:1.08,ky:1.25,kind:'door',main:true},{th:th+1.5,y:2.1,r:.42,kind:'window'},{th:th-1.5,y:2.0,r:.4,kind:'window'},{th:th+Math.PI,y:2.3,r:.36,kind:'window'}]});
   kput('hkLip',[s.x,B.top-.3,s.z],qEuler(Math.PI/2,0,0),[.5,.5,1.0],col2);
   const rm=hykRoom('bedroom',hykCirclePoly(s.x,s.z,B.a*.78,14),B.floorY,B.cy+B.b*.9-B.floorY,{doors:[[B.door.p[0],B.door.p[2],2.16,'court']],residence:true,wealth:.5});
   hykSpot(rm,'bed',s.x-ux*1.3,s.z-uz*1.3,th,2.1,1.0);hykSpot(rm,'store',s.x+tx*1.5+ux*.3,s.z+tz*1.5+uz*.3,th+Math.PI/2,1.2,.7);hykSpot(rm,'food',s.x-tx*1.5+ux*.3,s.z-tz*1.5+uz*.3,th,.8,.8);
   courtDoors.push([B.door.p[0],B.door.p[2],2.16,'bedroom']);}
  else{const thL=Math.atan2(uz,ux);const C=hykHospCone(s.x,s.z,{rb:3.4,rt:2.3,h:4.8,tilt:.3,dir:thL+Math.PI,col:k%4===1?col:col2,seed:60+k,openings:[{th:thL,y:1.3,r:1.2,kind:'door',main:true,o:{name:'Caravanserai stall'}},{th:thL+Math.PI,y:2.4,r:.35,kind:'window'}]});
   const rm=hykRoom('store',hykCirclePoly(s.x,s.z,2.6,14),.08,3.8,{doors:[[C.door.p[0],C.door.p[2],2.4,'court']],wealth:.5});
   hykSpot(rm,'stall',s.x-ux*.9,s.z-uz*.9,Math.atan2(ux,uz),2.4,1.6);hykSpot(rm,'food',s.x+tx*1.6+ux*.6,s.z+tz*1.6+uz*.6,0,.8,.8);
   courtDoors.push([C.door.p[0],C.door.p[2],2.4,'store']);}}
 // the court: carts stand in it, palms by the well, benches
 const court=hykRoom('court',hykCirclePoly(0,0,15.5,24),.04,30,{doors:courtDoors,wealth:.5});
 hykSpot(court,'plant',-5.5,3.5,0,1.6,1.6);hykSpot(court,'plant',5.5,3.5,0,1.6,1.6);hykSpot(court,'stall',-8.5,-6.0,.4,2.4,1.6);hykSpot(court,'stall',8.5,-6.0,-.4,2.4,1.6);hykSpot(court,'stall',0,-9.5,0,2.4,1.6);
 hykSpot(court,'seat',-3.4,-.2,Math.PI/2,1.4,.9);hykSpot(court,'seat',3.4,-.2,Math.PI/2,1.4,.9);
 hykReg('Caravanserai',0,0,24.5,12.5);}
HYK.def({key:'hyk_caravanserai',name:'Caravanserai',family:'hospitality',row:'Hospitality',w:47,d:47,h:12.5,tags:{type:['tavern/inn'],wealth:'middle',lit:true},build:hykHospBuildCaravanserai});
