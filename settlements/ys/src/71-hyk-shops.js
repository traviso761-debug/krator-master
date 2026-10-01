// ================================================================= HYKKOUSOI — the shops (agent B)
// Ten free-standing stores, their ten grown-on versions and the fishmongers' stall. A shop is a shell whose trade reads
// from the street without a word of signage: the wares hang on the facade (nets and floats, blades, sealed jars, salt
// cones, purple cloth), the kiln glows, the pearl shop's whole face is nacre. Each one is a 'store' or 'workshop' room
// with a counter spot (1.6 x 0.7) and a store spot (1.2 x 0.7), clear of the door swings; none is a residence.
// Every top-level name is prefixed hykShop; seeds 30400–30499 (one builder every 4: reseed(N+(o.v|0)) claims N..N+7
// and build.py only flags overlaps between fragments).
// Shared pieces first: a surface lookup on a pod (where the wares hang), the scallop-fan awning and the ware ledge
// hinged on a shell, a net, a hanging cloth, a sealed jar, a slab on a stalk, a pot; then the two bases (a free-standing
// shell with its room, a grown-on pod in the G frame with its root, drips, landing and room) and the trade dressings,
// each written once and used by both the free-standing and the grown-on version of the trade.
// ---------------------------------------------------------------- helpers
// the point on a pod at azimuth th (from +z toward +x) and local height y, pushed `out` along the outward normal.
// P = {a,b,c,e1,cy,sq} are the pod's parameters; (cx,cz) its translation.
function hykShopPodAt(P,pod,cx,cz,th,y,out){const b=P.b,e1=P.e1||1,sq=P.sq||1;let dy=y-P.cy;if(dy<0)dy/=sq;const t=clamp(dy/b,-.985,.985);
 const el=Math.asin(Math.sign(t)*Math.pow(Math.abs(t),1/e1));const u=((th/TAU)%1+1)%1,v=clamp(el/Math.PI+.5,.02,.98);const p=pod.surf(u,v);const d=1e-3;const pu=pod.surf(u+d,v),pv=pod.surf(u,v+d);
 const n=new THREE.Vector3(pu[0]-p[0],pu[1]-p[1],pu[2]-p[2]).cross(new THREE.Vector3(pv[0]-p[0],pv[1]-p[1],pv[2]-p[2])).normalize();if(n.dot(new THREE.Vector3(p[0],p[1]-P.cy,p[2]))<0)n.negate();
 out=out||0;return {p:[p[0]+cx+n.x*out,p[1]+n.y*out,p[2]+cz+n.z*out],n:[n.x,n.y,n.z]};}
// the same on a lathe L (its own azimuth runs from +x; ours from +z toward +x), on the modulated surface (lobes, flutes,
// rings, noise), not the nominal radius, so a ledge hinged on a fluted cone meets it
function hykShopLatheAt(L,th,y,out){const tl=Math.PI/2-th;const yl=y-(L.yBase||0);const q=hykLatheAt(L,tl,yl);let k=1;const u=((tl/TAU)%1+1)%1;
 if(L.lobes)k*=1+L.lobes.amp*Math.cos(L.lobes.n*tl+(L.lobes.ph||0));if(L.flute)k*=1+L.flute.amp*Math.pow(.5+.5*Math.cos(L.flute.n*tl+(L.twist||0)*yl),L.flute.sharp||2);
 if(L.rings)k*=1+L.rings.amp*Math.sin(yl/L.H*L.rings.n*TAU);if(L.noise)k*=1+L.noise.amp*(fbm(u*(L.noise.su||3)+(L.noise.seed||0),yl/(L.noise.sv||2),L.noise.seed||1,2)-.5)*2;
 const r=L.rFn(yl)*k;const p=[(L.cx||0)+r*Math.cos(tl),q.p[1],(L.cz||0)+r*Math.sin(tl)];out=out||0;return {p:[p[0]+q.n[0]*out,p[1]+q.n[1]*out,p[2]+q.n[2]*out],n:q.n};}
// the horizontal radius factor of a pod at local height y (0..1 of a / c), for floors and room polygons
function hykShopPodK(P,y){const sq=P.sq||1,e1=P.e1||1;let dy=y-P.cy;if(dy<0)dy/=sq;const t=Math.abs(dy)/P.b;if(t>=1)return 0;return Math.pow(1-Math.pow(t,2/e1),e1/2);}
// a scallop fan hinged on a shell: hinge(t), t in -1..1, a point on the shell; dir(t) the outward horizontal direction
// there; `reach` out. Fluted, drooping a little, a bone rim, and (unless o.ribs===false) two ribs under its outer
// corners back into the shell. With o.ledge it is a ware ledge: flat, short, a lip instead of ribs.
function hykShopFan(hinge,dir,reach,o){o=o||{};const col=o.col;const mat=o.mat||'hkShell';const fl=o.flutes!=null?o.flutes:7;const nu=o.nu||22,nv=o.nv||6;const droop=o.droop!=null?o.droop:.28,lift=o.lift||0;
 const fn=(u,v)=>{const t=u*2-1;const H=hinge(t),D=dir(t);const r=v*reach*(1+.05*Math.cos(fl*t*Math.PI)*v);const y=H[1]+lift*v-droop*v*v+(fl?.1*v*Math.pow(.5+.5*Math.cos(fl*t*Math.PI),2):0);return [H[0]+D[0]*r,y,H[2]+D[1]*r];};
 hykPut(mat,hykSurf(fn,nu,nv,{col,uS:2,vS:reach/4}));hykPut(mat,hykSurf((u,v)=>{const p=fn(u,v);return [p[0],p[1]-(o.thick||.09),p[2]];},nu,nv,{col,flip:true,uS:2,vS:reach/4}));
 const bone=hC(hPick(HPAL.bone));const rim=[];for(let i=0;i<=nu;i++){const p=fn(i/nu,1);rim.push([p[0],p[1]-.04,p[2]]);}hykPut('hkBone',hykTube(rim,()=>o.ledge?.06:.08,{seg:6,col:bone}));
 if(o.ribs!==false&&!o.ledge)for(const t of [-.72,.72]){const H=hinge(t),D=dir(t);const E=fn((t+1)/2,.86);
  hykPut('hkBone',hykRib([H[0]-D[0]*.35,H[1]-1.25,H[2]-D[1]*.35],[E[0],E[1]-.14,E[2]],{rise:.3,r0:.13,r1:.09,knuckles:2,n:10,seg:6,col:bone}));kput('hkBall',[E[0],E[1]-.1,E[2]],null,[.14,.12,.14],bone);}
 return fn;}
// a net draped from the line A–B, hanging `drop`, bellying out along `out` (a horizontal direction): a checkerboard of
// dropped quads on the double-sided weed material
function hykShopNet(A,B,drop,o){o=o||{};const nu=o.nu||18,nv=o.nv||12;const bl=o.belly||.3;
 const fn=(u,v)=>{const x=A[0]+(B[0]-A[0])*u,z=A[2]+(B[2]-A[2])*u;const y=A[1]+(B[1]-A[1])*u-drop*v*(1-.15*Math.sin(u*Math.PI));const belly=Math.sin(u*Math.PI)*v*(1-v)*4*bl;return [x+(o.out?o.out[0]*belly:0),y,z+(o.out?o.out[1]*belly:0)];};
 hykPut('hkWeed',hykSurf(fn,nu,nv,{col:o.col||hC(0x9a8a66),hole:(u,v)=>(Math.floor(u*nu)+Math.floor(v*nv))%2===1}));}
// a cloth hanging from the line A–B (a dyed length drying, a banner): two surfaces, a little wave, weighted at the hem
function hykShopCloth(A,B,drop,col,o){o=o||{};const nu=o.nu||8,nv=o.nv||7;const w=o.wave||.08;
 const fn=(u,v)=>{const x=A[0]+(B[0]-A[0])*u,z=A[2]+(B[2]-A[2])*u;const y=A[1]+(B[1]-A[1])*u-drop*v;const s=w*Math.sin(u*Math.PI*3+(o.ph||0))*v;return [x+(o.out?o.out[0]*s:0),y,z+(o.out?o.out[1]*s:s)];};
 hykPut('hkShell',hykSurf(fn,nu,nv,{col}));hykPut('hkShell',hykSurf(fn,nu,nv,{col,flip:true}));}
// a sealed shell jar: a squat body, a lip, a stopper ball; `glow` puts a cool light in it (a bioluminescent jar) on a
// bracket to the shelf under it
function hykShopJar(x,y,z,r,col,o){o=o||{};kput('hkBall',[x,y+r*1.1,z],null,[r,r*1.15,r],col);kput('hkLip',[x,y+r*2.15,z],qEuler(Math.PI/2,0,0),[r*.5,r*.5,.9],col);kput('hkBall',[x,y+r*2.35,z],null,[r*.42,r*.3,r*.42],hC(hPick(HPAL.bone)));
 if(o.glow)hykLight(x,y+r*1.2,z,{cool:true,r:r*.55,bare:true,level:o.level,bracket:[x,y,z]});}
// a slab on a stalk: a lobed top, a domed underside, a lip, the stalk into the ground (the fishmongers' and the potters' tables)
function hykShopSlab(x,y,z,R,col,o){o=o||{};const mat=o.mat||'hkShell';hykPut(mat,hykDisc(x,y,z,R,{col,lobes:{n:7,amp:.07},nu:20}));hykPut(mat,hykDisc(x,y-.14,z,R*.97,{col,sag:-R*.3,down:true,lobes:{n:7,amp:.07},nu:20}));
 kput('hkLip',[x,y,z],qEuler(Math.PI/2,0,0),[R*.98,R*.98,.7],col);kput('hkPost',[x,(y+(o.y0||0))/2-.05,z],null,[R*.22,y-(o.y0||0)+.1,R*.22],col);}
// a pot: a small bulbed lathe with a lip; `h` tall
function hykShopPot(x,y,z,h,col,o){o=o||{};const r=h*(o.k||.42);hykPut('hkShell',hykLathe({H:h,cx:x,cz:z,yBase:y,rFn:yy=>r*(.55+.45*Math.sin(Math.PI*Math.pow(yy/h,.8)))+(yy>h*.9?r*.18*(yy-h*.9)/(h*.1):0),nu:12,nv:7,col}));kput('hkLip',[x,y+h,z],qEuler(Math.PI/2,0,0),[r*.75,r*.75,.6],col);}
// a hanging rack: a bone rail from A to B on which `n` things hang (fish, blades, strings): kind, scale, colours
function hykShopRack(A,B,n,kind,sc,cols,o){o=o||{};hykPut('hkBone',hykTube([A,B],()=>o.r||.06,{seg:6,col:hC(hPick(HPAL.bone))}));
 for(let i=0;i<n;i++){const t=(i+.5)/n;const x=A[0]+(B[0]-A[0])*t,y=A[1]+(B[1]-A[1])*t,z=A[2]+(B[2]-A[2])*t;const s=o.jit?sc.map(v=>v*rr(.8,1.15)):sc;
  kput(kind,[x,y-s[1]/2-.05,z],qEuler(Math.PI,rr(0,TAU),0),s,hC(hPick(cols)));}}
// a lamp hung on a bracket from a shell point q={p,n}: the socket `out` along the normal, a little up
function hykShopLamp(q,o){o=o||{};const out=o.out||.5;hykLight(q.p[0]+q.n[0]*out,q.p[1]+q.n[1]*out+.14,q.p[2]+q.n[2]*out,{r:o.r||.2,cool:o.cool,nacre:o.nacre,level:o.level,bracket:q.p});}
// ---------------------------------------------------------------- the free-standing base
// S:{R, a,c (default R), b, sq (squash the underside), e1,e2, cy, col, inCol, mat, nacre, lit, seed, wins:[{th,el|y,r}],
//    doorR, doorKy, doorY (the door's centre height), skirt, name, room:'store'|'workshop', wealth, dress(F)}
// The pod sits low (cy = .62 b, the underside squashed) so its door opens at the ground and the wall is steep there;
// the skirt roots it. The floor disc and the room polygon are read from the pod's real radius at their heights.
function hykShopPodBase(S){const R=S.R,a=S.a||R,c=S.c||R,b=S.b||R*.95;const col=S.col;const mat=S.mat||'hkShell';const sq=S.sq||.72;const cy=S.cy!=null?S.cy:b*.62;const e1=S.e1||.88;
 const P={a,b,c,e1,cy,sq};const fy=S.floorY!=null?S.floorY:.1;const dyc=S.doorY||fy+1.25;const dr=S.doorR||1.0,dk=S.doorKy||1.2;
 const elOf=y=>{let dy=y-cy;if(dy<0)dy/=sq;const t=clamp(dy/b,-.985,.985);return Math.asin(Math.sign(t)*Math.pow(Math.abs(t),1/e1));};
 const openings=[{th:0,el:elOf(dyc),r:dr,ky:dk,kind:'door'}].concat((S.wins||[]).map(w=>({th:w.th,el:w.y!=null?elOf(w.y):w.el,r:w.r,ky:w.ky,kind:'window'})));
 const pod=hykPod({a,b,c,e1,e2:S.e2||.92,cy,squash:sq,nu:S.nu||56,nv:S.nv||28,noise:S.noise||{amp:.024,su:4,sv:3,seed:S.seed||1},col,openings,hollow:{t:.07,col:S.inCol||col}});
 const cx=S.cx||0,cz=S.cz||0;if(cx||cz){pod.geo.translate(cx,0,cz);pod.inner.translate(cx,0,cz);}
 hykPut(mat,pod.geo);hykPut('hkIn',pod.inner,true);
 hykPut(mat,hykFlare([cx,.02,cz],[0,1,0],a*hykShopPodK(P,.4)*.99,S.skirt||R*.34,{col}));
 let door=null;for(const op of pod.openings){op.p=[op.p[0]+cx,op.p[1],op.p[2]+cz];if(op.kind==='door'){door=op;hykDoor(op,{level:'ground',nacre:S.nacre});}else hykWin(op,{nacre:S.nacre,lit:S.lit});}
 const fR=a*hykShopPodK(P,fy+.05)*.97;hykFloor(cx,cz,fy,fR,{});
 const rR=Math.min(fR,a*hykShopPodK(P,fy+1.2))*.9;
 const room=hykRoom(S.room||'store',hykCirclePoly(cx,cz,rR,14),fy,cy+b*.9-fy,{doors:[[cx,cz+c*hykShopPodK(P,dyc),dr*2]],wealth:S.wealth!=null?S.wealth:.5});
 hykSpot(room,'counter',cx,cz-rR*.25,0,1.6,.7);hykSpot(room,'store',cx-rR*.6,cz+rR*.25,Math.PI/2,1.2,.7);
 hykReg(S.name,cx,cz,Math.max(a,c)*1.25,cy+b+.5);
 const F={kind:'pod',pod,P,R,a,b,c,cx,cz,cy,door,floorY:fy,room,grown:false,level:'ground',top:cy+b,
  at:(th,y,out)=>hykShopPodAt(P,pod,cx,cz,th,y,out),ground:(x,z)=>[x,0,z],col,mat};
 if(S.dress)S.dress(F);return F;}
// a lathe-bodied shop: a barnacle cone, a beehive, a flask. S:{H,rFn,cx,cz,yBase,nu,nv,flute,rings,noise,lobes,tilt,twist,
//   col,inCol,mat,nacre,lit,doorY,doorR,doorKy,wins:[{th,y,r}],skirt,vent,name,room,wealth,clear,dress}
function hykShopLatheBase(S){const col=S.col;const mat=S.mat||'hkShell';const yB=S.yBase!=null?S.yBase:-.3;const cx=S.cx||0,cz=S.cz||0;
 const L={H:S.H,cx,cz,yBase:yB,rFn:S.rFn,nu:S.nu||60,nv:S.nv||24,flute:S.flute,rings:S.rings,noise:S.noise||{amp:.03,su:5,sv:1.4,seed:S.seed||2},lobes:S.lobes,tilt:S.tilt,twist:S.twist,col};
 const fy=S.floorY!=null?S.floorY:.1;const dyc=S.doorY||fy+1.25;const dr=S.doorR||1.0,dk=S.doorKy||1.2;
 const dq=hykShopLatheAt(L,0,dyc);const ops=[{p:dq.p,n:dq.n,r:dr,ky:dk,kind:'door'}];
 for(const w of S.wins||[]){const q=hykShopLatheAt(L,w.th,w.y);ops.push({p:q.p,n:q.n,r:w.r,ky:w.ky,kind:'window'});}
 L.ops=ops;hykPut(mat,hykLathe(L));
 const Li=Object.assign({},L,{rFn:y=>L.rFn(y)*.9,flip:true,col:S.inCol||hC(hPick(HPAL.shell),.86),noise:null});hykPut('hkIn',hykLathe(Li),true);
 hykPut(mat,hykFlare([cx,.02,cz],[0,1,0],L.rFn(.4-yB)*.99,S.skirt||L.rFn(.4-yB)*.32,{col}));
 if(S.vent){const r=L.rFn(S.H);kput('hkLip',[cx,yB+S.H+.02,cz],qEuler(Math.PI/2,0,0),[Math.max(r,.25)*1.1,Math.max(r,.25)*1.1,1.2],col);}
 let door=null;for(const op of ops){if(op.kind==='door'){door=op;hykDoor(op,{level:'ground',nacre:S.nacre});}else hykWin(op,{nacre:S.nacre,lit:S.lit});}
 const fR=L.rFn(fy+.05-yB)*.88;hykFloor(cx,cz,fy,fR,{});
 const rR=Math.min(fR,L.rFn(fy+1.2-yB)*.88)*.9;
 const room=hykRoom(S.room||'workshop',hykCirclePoly(cx,cz,rR,14),fy,S.clear||(yB+S.H*.8-fy),{doors:[[cx,cz+L.rFn(dyc-yB),dr*2]],wealth:S.wealth!=null?S.wealth:.5});
 hykSpot(room,'counter',cx,cz-rR*.25,0,1.6,.7);hykSpot(room,'store',cx-rR*.6,cz+rR*.25,Math.PI/2,1.2,.7);
 hykReg(S.name,cx,cz,L.rFn(1)*1.3,yB+S.H+.6);
 const F={kind:'lathe',L,R:L.rFn(1),cx,cz,door,floorY:fy,room,grown:false,level:'ground',top:yB+S.H,at:(th,y,out)=>hykShopLatheAt(L,th,y,out),ground:(x,z)=>[x,0,z],col,mat};
 if(S.dress)S.dress(F);return F;}
// a lily-pad landing drawn in the LOCAL frame and registered in world space. (o.landing converts to world and calls
// hykPad, whose hykPut and kput then apply the frame again, so the pad lands far from its door: 62-hyk-helpers.js,
// HYK.placeOn `landing`; reported. This mirrors hykPad's geometry until it is fixed.)
function hykShopLanding(o,lx,ly,lz,R,col){const lob={n:9,amp:.08};hykPut('hkShell',hykDisc(lx,ly,lz,R,{col,lobes:lob}));hykPut('hkShell',hykDisc(lx,ly-.3,lz,R*.97,{col,sag:-R*.22,down:true,lobes:lob}));
 kput('hkLip',[lx,ly+.02,lz],qEuler(Math.PI/2,0,0),[R,R,.9],col);
 const w=hykW(lx,ly,lz);ysDeck({x0:w[0]-R,z0:w[2]-R,x1:w[0]+R,z1:w[2]+R,w:R*2,y:w[1],kind:'pad',own:o.host.n});o.host.landings.push({x:w[0],y:w[1],z:w[2],r:R,level:o.level,a:o.a});return {x:w[0],y:w[1],z:w[2],r:R};}
// ---------------------------------------------------------------- the grown-on base (the G frame: origin on the host's face at the floor datum, +z out)
// A pod bedded a fifth into the face when it is the host's way in (o.way: a back door at -z onto the plate), else 70 %
// proud; rooted with a fillet, drips read off its own underside, a lily-pad landing in front of the door on a rib.
// S:{R, col,inCol,mat,nacre,lit, seed, wins, name, room, wealth, dress(F)}
function hykShopGrownBase(o,S){const R=S.R,way=o.way;const col=S.col;const mat=S.mat||'hkShell';const cz=way?-R*.2:R*.3,cy=R*.447;const b=R*.86;
 const P={a:R,b,c:R,e1:.9,cy,sq:1};
 const openings=[{th:0,el:-.06,r:Math.min(1.15,R*.29),ky:1.25,kind:'door'}].concat((S.wins||[{th:.85,el:.1,r:R*.15},{th:-.85,el:.1,r:R*.15},{th:.3,el:.8,r:R*.12}]).map(w=>Object.assign({kind:'window'},w)));
 if(way)openings.push({th:Math.PI,el:-.06,r:1.15,ky:1.3,kind:'door',back:true});
 const pod=hykPod({a:R,b,c:R,e1:.9,e2:.94,cy,nu:52,nv:28,noise:{amp:.028,su:4,sv:3,seed:S.seed||4},col,openings,hollow:{t:.07,col:S.inCol||col}});
 pod.geo.translate(0,0,cz);hykPut(mat,pod.geo);pod.inner.translate(0,0,cz);hykPut('hkIn',pod.inner,true);
 const floorY=way?.05:cy-b*.52;hykFloor(0,cz,floorY,R*.82,{});
 let door=null,back=null;for(const op of pod.openings){op.p=[op.p[0],op.p[1],op.p[2]+cz];
  if(op.kind==='door'&&op.back){back=op;hykDoor(op,{level:o.level,name:o.host.n+' way in',into:o.host.n,nacre:S.nacre});}
  else if(op.kind==='door'){door=op;hykDoor(op,{level:o.level,nacre:S.nacre});}else hykWin(op,{nacre:S.nacre,lit:S.lit});}
 hykPut(mat,hykFlare([0,cy,0],[0,0,1],R*(way?.86:.9),R*(way?.3:.45),{col}));
 // drips off the underside, bases .22 m inside the shell
 const nd=Math.round(R*2.2);for(let i=0;i<nd;i++){const px=rr(-R*.6,R*.6),pz=cz+rr(R*.15,R*.85);if(pz<.4)continue;const under=hykPodUnder(R,b,R,.9,.94,px,pz-cz);if(under==null)continue;const h=rr(.35,1.1)*R*.3;
  kput('hkDrip',[px,cy-under-h/2+.22,pz],qEuler(Math.PI,0,0),[h*.3,h,h*.3],col);}
 const padY=door.p[1]-door.r*door.ky+.12,padZ=door.p[2]+2.6;const padR=2.9;hykShopLanding(o,0,padY,padZ,padR,col);
 hykPut('hkBone',hykRib([0,-3.4,.1],[0,padY-.45,padZ],{rise:-1.4,r0:.36,r1:.26,knuckles:3,col:hC(hPick(HPAL.bone))}));
 const room=hykRoom(S.room||'store',hykCirclePoly(0,cz,R*.78,14),floorY,b*1.3,{doors:[[0,cz+R,door.r*2]].concat(way?[[0,cz-R,2.3,'host']]:[]),wealth:S.wealth!=null?S.wealth:.5});
 if(way){hykSpot(room,'counter',R*.45,cz,Math.PI/2,1.6,.7);hykSpot(room,'store',-R*.45,cz,Math.PI/2,1.2,.7);}
 else{hykSpot(room,'counter',0,cz-R*.25,0,1.6,.7);hykSpot(room,'store',-R*.45,cz+R*.15,Math.PI/2,1.2,.7);}
 hykReg(S.name,0,cz,R*1.2,R*1.85);
 const F={kind:'pod',pod,P,R,a:R,b,c:R,cx:0,cz,cy,door,back,floorY,room,grown:true,level:o.level,way,pad:{x:0,y:padY,z:padZ,r:padR},top:cy+b,
  at:(th,y,out)=>hykShopPodAt(P,pod,0,cz,th,y,out),ground:(x,z)=>[x*.55,padY,padZ+z*.45],col,mat};
 if(S.dress)S.dress(F);return F;}
// ---------------------------------------------------------------- the trade dressings (F from a base: at(th,y,out), door, ground(x,z), R, top ...)
const hykShopQUp=n=>new THREE.Quaternion().setFromUnitVectors(_UP,new THREE.Vector3(n[0],n[1],n[2]).normalize());
// a spine rooted in a shell at q={p,n}: a cone along the normal, its base .2 m inside
function hykShopSpine(q,h,w,col){kput('hkDrip',[q.p[0]+q.n[0]*(h/2-.2),q.p[1]+q.n[1]*(h/2-.2),q.p[2]+q.n[2]*(h/2-.2)],hykShopQUp(q.n),[w,h,w],col);}
// a rail bracketed off a shell between azimuths t0..t1 at height y, standing `out` from it, rooted at both ends
function hykShopRail(F,t0,t1,y,out,o){o=o||{};const pts=[F.at(t0,y,-.15).p,F.at(t0,y,out).p];const n=o.n||4;for(let i=1;i<n;i++)pts.push(F.at(t0+(t1-t0)*i/n,y,out).p);pts.push(F.at(t1,y,out).p,F.at(t1,y,-.15).p);
 hykPut('hkBone',hykTube(pts,()=>o.r||.06,{seg:6,col:hC(hPick(HPAL.bone))}));return pts;}
// the door's top and a ware ledge beside it (left: side -1, right: +1), returning the ledge's fn
function hykShopDoorTop(F){return F.door.p[1]+F.door.r*F.door.ky;}
function hykShopLedge(F,side,y,o){o=o||{};const t0=side*(o.t0||.45),t1=side*(o.t1||1.15);return hykShopFan(t=>F.at(t0+(t1-t0)*(t+1)/2,y,-.12).p,t=>{const th=t0+(t1-t0)*(t+1)/2;return [Math.sin(th),Math.cos(th)];},o.reach||.7,{col:o.col||F.col,mat:o.mat||F.mat,ledge:true,flutes:0,droop:0,thick:.07,nu:10,nv:2});}
// --- the armourer: round shields hung on the shell either side of the door and over it, a helm on a stand, a hauberk on a rail
function hykShopDressArmour(F){const dT=hykShopDoorTop(F);const bone=hC(hPick(HPAL.bone)),grey=hC(hPick(HPAL.barnacle)),coral=hC(hPick(HPAL.coral));
 const shields=[[0,dT+1.0,.55],[-.62,dT-.25,.5],[-1.05,dT-.55,.44],[.62,dT-.25,.5],[1.05,dT-.55,.44],[-.85,dT+.55,.38],[.85,dT+.55,.38]];
 for(const s of shields){const q=F.at(s[0],s[1],.13);const qf=qFacing(q.n);kput('hkBall',q.p,qf,[s[2],s[2],.13],rng()<.5?bone:grey);kput('hkBall',[q.p[0]+q.n[0]*.1,q.p[1]+q.n[1]*.1,q.p[2]+q.n[2]*.1],qf,[s[2]*.28,s[2]*.28,.1],coral);
  kput('hkLip',[q.p[0]+q.n[0]*.04,q.p[1]+q.n[1]*.04,q.p[2]+q.n[2]*.04],qf,[s[2]*.96,s[2]*.96,.5],bone);}
 // the helm on its stand, on the forecourt right of the door
 const g=F.ground(F.R*.78,F.R*.95);kput('hkPost',[g[0],g[1]+.72,g[2]],null,[.07,1.44,.07],bone);kput('hkBall',[g[0],g[1]+.08,g[2]],null,[.36,.1,.36],bone);
 hykPut('hkShell',hykLathe({H:.46,cx:g[0],cz:g[2],yBase:g[1]+1.4,rFn:y=>.31*Math.sqrt(Math.max(0,1-Math.pow(y/.46,2.6)))+.02,nu:18,nv:8,col:grey}));kput('hkLip',[g[0],g[1]+1.41,g[2]],qEuler(Math.PI/2,0,0),[.32,.32,.5],bone);
 kput('hkDrip',[g[0],g[1]+1.98,g[2]],null,[.05,.32,.15],coral);   // the crest
 // a hauberk and greaves hung on a rail left of the door
 const pts=hykShopRail(F,-.5,-1.1,dT-.05,.42,{n:3});for(let i=1;i<4;i++){const p=pts[i];kput('hkBall',[p[0],p[1]-.5,p[2]],null,[.3,.46,.14],i===2?grey:bone);kput('hkBall',[p[0],p[1]-.95,p[2]],null,[.26,.26,.12],grey);}}
// --- the weaponsmith: an urchin spire of spines on the crown, a blade rack left of the door, spears leaning right of it,
// a forge cone grown on the front-right flank with its glowing mouth (the trade keeps a fire)
function hykShopDressWeapon(F){const dT=hykShopDoorTop(F);const bone=hC(hPick(HPAL.bone)),steel=hC(0xb6bcc2),col=F.col;
 // the spire: a fluted twisted lathe on the crown, ringed with spines rooted in the shell
 const H=F.R*1.15;hykPut(F.mat,hykLathe({H,cx:F.cx,cz:F.cz,yBase:F.top-.45,rFn:y=>F.R*.17*Math.pow(1-y/H,.8)+.04,nu:16,nv:9,flute:{n:8,amp:.16,sharp:1.3},twist:.8,col}));
 hykPut(F.mat,hykFlare([F.cx,F.top-.3,F.cz],[0,1,0],F.R*.17,F.R*.2,{col}));
 for(let i=0;i<9;i++){const th=i/9*TAU+.2;const q=F.at(th,F.top-F.R*.28,0);hykShopSpine(q,rr(.7,1.2),.12,col);}
 for(let i=0;i<7;i++){const th=i/7*TAU-.1;const q=F.at(th,F.top-F.R*.58,0);hykShopSpine(q,rr(.5,.8),.1,col);}
 // the blade rack: a bracketed rail left of the door, blades hung point down
 const pts=hykShopRail(F,-.5,-1.15,dT+.05,.4,{n:6});for(let i=1;i<7;i++){const p=pts[i];const L=rr(.8,1.15);kput('hkDrip',[p[0],p[1]-L/2-.06,p[2]],qEuler(Math.PI,0,0),[.075,L,.022],steel);kput('hkBall',[p[0],p[1]-.08,p[2]],null,[.06,.08,.06],bone);}
 // spears leaning on the shell right of the door, their butts on the ground (a grown pod has no ground: a spear rack instead)
 if(!F.grown)for(let i=0;i<3;i++){const th=.55+i*.13;const g=F.ground(F.R*Math.sin(th)*1.1,F.R*Math.cos(th)*1.1);const q=F.at(th,2.6,.1);const dx=q.p[0]-g[0],dy=q.p[1]-g[1],dz=q.p[2]-g[2];const L=Math.hypot(dx,dy,dz);
  const qq=hykShopQUp([dx,dy,dz]);kput('hkPost',[(g[0]+q.p[0])/2,(g[1]+q.p[1])/2,(g[2]+q.p[2])/2],qq,[.03,L,.03],bone);kput('hkDrip',[q.p[0]+dx/L*.22,q.p[1]+dy/L*.22,q.p[2]+dz/L*.22],qq,[.05,.42,.02],steel);}
 else{const pr=hykShopRail(F,.5,1.0,dT+.1,.4,{n:4});for(let i=1;i<5;i++){const p=pr[i];kput('hkPost',[p[0],p[1]-.9,p[2]],null,[.025,1.7,.025],bone);kput('hkDrip',[p[0],p[1]-1.85,p[2]],qEuler(Math.PI,0,0),[.05,.4,.02],steel);}}
 // the forge: a barnacle cone on the front-right flank, rooted with a fillet, its mouth to the front, a fire inside
 const fq=F.at(1.15,1.0,0);const fr=F.R*.36,fh=F.R*.5;const fx=fq.p[0]+fq.n[0]*fr*.85,fz=fq.p[2]+fq.n[2]*fr*.85;const fy0=F.grown?F.floorY-.6:-.3;
 const FL={H:fh,cx:fx,cz:fz,yBase:fy0,rFn:y=>fr*(1-.62*Math.pow(y/fh,1.6)),nu:28,nv:10,flute:{n:10,amp:.07,sharp:1.5},col};
 const mq=hykShopLatheAt(FL,.35,fy0+fh*.3);const mop={p:mq.p,n:mq.n,r:fr*.3,ky:.9,kind:'window'};FL.ops=[mop];hykPut(F.mat,hykLathe(FL));
 hykPut(F.mat,hykFlare([fq.p[0]+fq.n[0]*.05,fq.p[1],fq.p[2]+fq.n[2]*.05],fq.n,fr*.8,fr*.5,{col}));
 if(!F.grown)hykPut(F.mat,hykFlare([fx,.02,fz],[0,1,0],fr*.97,fr*.3,{col}));
 kput('hkLip',[fx,fy0+fh+.02,fz],qEuler(Math.PI/2,0,0),[fr*.4,fr*.4,1.1],col);
 hykWin(mop,{open:true});hykLight(mq.p[0]-mq.n[0]*fr*.5,mq.p[1]-.05,mq.p[2]-mq.n[2]*fr*.5,{r:.3,bare:true,level:F.level,bracket:[fx,fy0+fh*.3-.4,fz]});
 // smoke-blackened barnacle specks round the vent
 for(let i=0;i<10;i++){const a=rng()*TAU;const r=fr*.42+rr(0,.25);kput('hkBarnB',[fx+r*Math.cos(a),fy0+fh-rr(.02,.4),fz+r*Math.sin(a)],null,[.05,.035,.05],hC(0x4a443c));}}
// --- the alchemist: sealed jars on two ledges either side of the door, one of them a bioluminescent jar (the lamp),
// a glass retort in a collar on the crown
function hykShopDressAlchemy(F){const dT=hykShopDoorTop(F);const teal=HPAL.teal,bone=hC(hPick(HPAL.bone));
 const l1=hykShopLedge(F,-1,1.2,{reach:.72});for(let i=0;i<5;i++){const p=l1((i+.5)/5,.5);hykShopJar(p[0],p[1],p[2],rr(.17,.24),hC(hPick(i===2?HPAL.shellWarm:teal)),{glow:i===2,level:F.level});}
 const l2=hykShopLedge(F,1,2.25,{reach:.65,t0:.5,t1:1.05});for(let i=0;i<4;i++){const p=l2((i+.5)/4,.5);hykShopJar(p[0],p[1],p[2],rr(.15,.2),hC(hPick(i===1?HPAL.coral:HPAL.shell)));}
 // a string of small stoppered phials over the door
 for(let i=0;i<5;i++){const th=-.34+i*.17;const q=F.at(th,dT+.45,.2);kput('hkBall',q.p,null,[.09,.13,.09],hC(hPick(teal)));kput('hkBall',[q.p[0],q.p[1]+.14,q.p[2]],null,[.05,.05,.05],bone);
  hykPut('hkBone',hykTube([F.at(th,dT+.62,-.1).p,[q.p[0],q.p[1]+.12,q.p[2]]],()=>.015,{seg:4,col:bone}));}
 // the retort on the crown: a glass bulb in a shell collar, a glass neck bending off it (the flask-bodied shop has its own stopper)
 if(!F.noCrown){const cy=F.top-.35;kput('hkLip',[F.cx,cy-.05,F.cz],qEuler(Math.PI/2,0,0),[.55,.55,1.2],F.col);kput('hkLens',[F.cx,cy+.5,F.cz],null,[.62,.72,.62],hC(hPick(HPAL.lens)));
  kput('hkLens',[F.cx+.5,cy+1.25,F.cz],qEuler(0,0,-.8),[.14,.6,.14],hC(hPick(HPAL.lens)));}
 hykShopLamp(F.at(.45,dT+.15,0),{cool:true,out:.45,level:F.level});}
// --- the food store: an awning over the door with strings of dried fish and smoked strings under it, baskets of eggs
// and shellfish on a ledge, sealed jars by the door
function hykShopDressFood(F){const dT=hykShopDoorTop(F);const bone=hC(hPick(HPAL.bone)),warm=hC(hPick(HPAL.shellWarm));
 const fan=hykShopFan(t=>F.at(t*.8,dT+.5,-.15).p,t=>[Math.sin(t*.8),Math.cos(t*.8)],1.9,{col:F.col,mat:F.mat,flutes:9});
 hykShopRack(fan(.15,.55),fan(.85,.55),8,'hkDrip',[.11,.5,.05],HPAL.barnacle,{jit:true});
 hykShopRack(fan(.1,.9),fan(.9,.9),6,'hkBall',[.09,.36,.09],[0x9b5a48,0x8a4e40],{jit:true});
 const l=hykShopLedge(F,1,1.15,{reach:.75,t0:.5,t1:1.2});for(let i=0;i<3;i++){const p=l((i+.5)/3,.5);kput('hkBall',[p[0],p[1]+.16,p[2]],null,[.3,.18,.3],warm);kput('hkLip',[p[0],p[1]+.3,p[2]],qEuler(Math.PI/2,0,0),[.3,.3,.5],warm);
  for(let k=0;k<4;k++)kput('hkBall',[p[0]+rr(-.12,.12),p[1]+.34,p[2]+rr(-.12,.12)],null,[.07,.06,.07],k%2?bone:hC(hPick(HPAL.barnacle)));}
 const g=F.ground(-F.R*.72,F.R*1.0);for(let i=0;i<3;i++){const a=i*2.1;hykShopJar(g[0]+.42*Math.cos(a),g[1],g[2]+.42*Math.sin(a),.26,hC(hPick(i?HPAL.shellWarm:HPAL.teal)));}
 const g2=F.ground(-F.R*.95,F.R*.55);kput('hkBall',[g2[0],g2[1]+.22,g2[2]],null,[.5,.24,.5],warm);kput('hkLip',[g2[0],g2[1]+.42,g2[2]],qEuler(Math.PI/2,0,0),[.5,.5,.5],warm);}
// --- the general store: a wide awning with goods hung from its rim (coils, gourds, floats), a ledge of mixed wares, a bundle of poles
function hykShopDressGeneral(F){const dT=hykShopDoorTop(F);const bone=hC(hPick(HPAL.bone)),tan=hC(0xb09a74);
 const fan=hykShopFan(t=>F.at(t*1.0,dT+.55,-.15).p,t=>[Math.sin(t),Math.cos(t)],2.2,{col:F.col,mat:F.mat,flutes:11});
 for(let i=0;i<9;i++){const p=fan((i+.5)/9,.92);const k=i%3;const y=p[1]-.1;hykPut('hkBone',hykTube([[p[0],p[1]-.02,p[2]],[p[0],y-.3,p[2]]],()=>.015,{seg:4,col:bone}));
  if(k===0)kput('hkLip',[p[0],y-.45,p[2]],qEuler(0,rr(0,1),0),[.2,.2,.9],tan);else if(k===1)kput('hkBall',[p[0],y-.48,p[2]],null,[.14,.2,.14],hC(hPick(HPAL.coral)));else kput('hkBall',[p[0],y-.46,p[2]],null,[.17,.17,.17],hC(hPick(HPAL.teal)));}
 const l=hykShopLedge(F,-1,1.15,{reach:.75});for(let i=0;i<5;i++){const p=l((i+.5)/5,.5);if(i%2)hykShopJar(p[0],p[1],p[2],.18,hC(hPick(HPAL.shellWarm)));else{kput('hkLip',[p[0],p[1]+.06,p[2]],qEuler(Math.PI/2,0,0),[.2,.2,.8],tan);kput('hkLip',[p[0],p[1]+.16,p[2]],qEuler(Math.PI/2,0,0),[.16,.16,.8],tan);}}
 const g=F.ground(F.R*.8,F.R*.95);for(let i=0;i<4;i++){const a=i*1.6;const L=rr(2.2,2.9);kput('hkPost',[g[0]+.1*Math.cos(a),g[1]+L/2,g[2]+.1*Math.sin(a)],qEuler(.1*Math.cos(a),0,.1*Math.sin(a)),[.03,L,.03],bone);}
 kput('hkLip',[g[0],g[1]+1.2,g[2]],qEuler(Math.PI/2,0,0),[.2,.2,.5],tan);
 const g2=F.ground(F.R*1.05,F.R*.55);kput('hkBall',[g2[0],g2[1]+.3,g2[2]],null,[.42,.32,.42],hC(hPick(HPAL.shellWarm)));kput('hkLip',[g2[0],g2[1]+.58,g2[2]],qEuler(Math.PI/2,0,0),[.38,.38,.5],hC(hPick(HPAL.shellWarm)));}
// --- the chandler and netmaker: nets drying from an eave rail either side of the door, a float line along the eave,
// a float cluster by the door, coils of rope on the ground
function hykShopDressChandler(F){const dT=hykShopDoorTop(F);const bone=hC(hPick(HPAL.bone)),tan=hC(0xb09a74),net=hC(0x8d7d5c);
 for(const s of [-1,1]){const pts=hykShopRail(F,s*.42,s*1.25,dT+.6,.42,{n:5,r:.07});const A=pts[1],B=pts[pts.length-2];
  const mid=F.at(s*.83,dT+.6,0);const out=[mid.n[0],mid.n[2]];hykShopNet(A,B,F.grown?2.0:dT+.3,{out,belly:.45,col:net,nu:16,nv:11});
  // the float line: a cord along the rail with cork floats every half metre
  for(let i=1;i<pts.length-1;i++){const p=pts[i];for(let k=0;k<2;k++){const t=(k+.5)/2;const q=pts[i+1];if(!q||i+1>=pts.length-1)break;const x=p[0]+(q[0]-p[0])*t,y=p[1]+(q[1]-p[1])*t,z=p[2]+(q[2]-p[2])*t;
   kput('hkBall',[x,y-.16,z],null,[.13,.17,.13],hC(hPick(k?HPAL.coral:HPAL.teal)));}}}
 // the float cluster hung beside the door, each float on its own cord from one knot
 const k=F.at(.5,dT+.25,.3);kput('hkBall',k.p,null,[.07,.07,.07],bone);hykPut('hkBone',hykTube([F.at(.5,dT+.3,-.1).p,k.p],()=>.02,{seg:4,col:bone}));
 for(let i=0;i<6;i++){const a=i/6*TAU;const r=.28+.1*(i%2);const p=[k.p[0]+r*Math.cos(a),k.p[1]-.45-.12*(i%3),k.p[2]+r*Math.sin(a)*.5+.12];hykPut('hkBone',hykTube([k.p,p],()=>.012,{seg:4,col:bone}));kput('hkBall',p,null,[.16,.2,.16],hC(hPick(i%2?HPAL.coral:HPAL.shellWarm)));}
 // coils of rope stacked on the forecourt, and a basket of net-needles
 const g=F.ground(-F.R*.75,F.R*.95);for(let i=0;i<3;i++)kput('hkLip',[g[0],g[1]+.1+i*.19,g[2]],qEuler(Math.PI/2,0,0),[.55-i*.08,.55-i*.08,1.4],tan);
 const g2=F.ground(-F.R*1.05,F.R*.5);kput('hkLip',[g2[0],g2[1]+.1,g2[2]],qEuler(Math.PI/2,0,0),[.42,.42,1.2],tan);kput('hkLip',[g2[0]+.3,g2[1]+.28,g2[2]-.2],qEuler(Math.PI/2+.4,0,.3),[.34,.34,1.2],tan);}
// --- the pearl and shell-inlay shop (rich, lit, nacre): a fish-scale inlay band round the body, a great pearl in a cup on
// the crown, nacre lamps either side of the door, pearls on open shells on a nacre ledge, a string of pearls over the door
function hykShopDressPearl(F){const dT=hykShopDoorTop(F);const nac=hC(hPick(HPAL.nacre)),teal=hC(hPick(HPAL.teal)),bone=hC(hPick(HPAL.bone));
 // the inlay band: a ribbon of mosaic lying on the shell between two heights, following its surface
 // (u runs with the pod's azimuth and v up, so the outward side is the flipped winding, as a pod's inner skin is)
 const y0=dT-.42,y1=dT-.02;hykPut('hkMosaic',hykSurf((u,v)=>{const q=F.at(u*TAU,y0+(y1-y0)*v,.04);return q.p;},56,2,{col:teal,uS:TAU*F.R/4,vS:.15,flip:true}));
 hykPut('hkMosaic',hykSurf((u,v)=>{const q=F.at(u*TAU,F.top-F.R*.47+(F.R*.17)*v,.04);return q.p;},56,2,{col:teal,uS:TAU*F.R/4,vS:.3,flip:true}));
 // the pearl on the crown
 kput('hkLipN',[F.cx,F.top-.12,F.cz],qEuler(Math.PI/2,0,0),[.62,.62,1.2],nac);kput('hkBall',[F.cx,F.top+.35,F.cz],null,[.5,.5,.5],nac);
 hykShopLamp(F.at(-.5,dT+.15,0),{nacre:true,out:.45,level:F.level});hykShopLamp(F.at(.5,dT+.15,0),{nacre:true,out:.45,level:F.level});
 const l=hykShopLedge(F,-1,1.2,{reach:.72,mat:'hkNacre',col:nac});for(let i=0;i<4;i++){const p=l((i+.5)/4,.5);kput('hkBall',[p[0],p[1]+.05,p[2]],qEuler(-.4,rr(0,TAU),0),[.26,.07,.3],bone);kput('hkBall',[p[0],p[1]+.14,p[2]],null,[.08,.08,.08],nac);
  for(let k=0;k<3;k++)kput('hkBall',[p[0]+rr(-.1,.1),p[1]+.05,p[2]+rr(-.08,.08)],null,[.035,.035,.035],nac);}
 // a string of pearls from lip to lip over the door
 for(let i=0;i<=10;i++){const t=i/10;const th=-.42+.84*t;const q=F.at(th,dT+.28-.3*Math.sin(t*Math.PI),.22);kput('hkBall',q.p,null,[.07,.07,.07],nac);}
 // oyster shells heaped by the door, the shop's refuse
 const g=F.ground(F.R*.8,F.R*.95);for(let i=0;i<9;i++)kput('hkBall',[g[0]+rr(-.4,.4),g[1]+.05+rr(0,.12),g[2]+rr(-.35,.35)],qEuler(rr(-.5,.5),rr(0,TAU),rr(-.5,.5)),[.14,.04,.16],hC(hPick(HPAL.barnacle)));}
// --- the salt and spice shop: white salt cones standing in shallow bins on the forecourt, spice baskets on a ledge, salt
// crust weeping down the skirt
function hykShopDressSalt(F){const dT=hykShopDoorTop(F);const white=hC(0xf8f6f0),warm=hC(hPick(HPAL.shellWarm));
 const bins=[[F.R*.72,F.R*1.0,.7],[F.R*1.1,F.R*.6,.55],[F.R*.95,F.R*.3,.45]];for(const b of bins){const g=F.ground(b[0],b[1]);const r=b[2];kput('hkLip',[g[0],g[1]+.06,g[2]],qEuler(Math.PI/2,0,0),[r*1.15,r*1.15,1.0],warm);
  hykPut('hkShell',hykDisc(g[0],g[1]+.05,g[2],r*1.1,{col:warm,nu:14}));kput('hkDrip',[g[0],g[1]+r*.72,g[2]],null,[r,r*1.45,r],white);}
 const l=hykShopLedge(F,-1,1.15,{reach:.78});const sp=[0xc27a2e,0x9c3b2a,0xd9b060,0x6f7f52,0xb5651d];
 for(let i=0;i<5;i++){const p=l((i+.5)/5,.5);kput('hkBall',[p[0],p[1]+.13,p[2]],null,[.24,.15,.24],warm);kput('hkLip',[p[0],p[1]+.25,p[2]],qEuler(Math.PI/2,0,0),[.24,.24,.5],warm);kput('hkBall',[p[0],p[1]+.28,p[2]],null,[.19,.09,.19],hC(sp[i]));}
 // a second ledge of salt-glazed jars right of the door, and the crust: white specks streaking down the shell
 const l2=hykShopLedge(F,1,1.15,{reach:.7,t0:.5,t1:1.1});for(let i=0;i<3;i++){const p=l2((i+.5)/3,.5);hykShopJar(p[0],p[1],p[2],.21,white);}
 for(let i=0;i<40;i++){const th=rr(-2.4,2.4);const y=rr(F.floorY+.1,dT-.3);const q=F.at(th,y,.0);kput('hkBarnB',q.p,null,[rr(.05,.12),rr(.03,.06),rr(.05,.12)],white);}}
// --- the cloth and dye shop (murex purple): purple lengths drying on a frame (free-standing) or a rail off the shell
// (grown), a banner over the door, dye vats by the wall, a heap of murex shells
function hykShopDressCloth(F){const dT=hykShopDoorTop(F);const bone=hC(hPick(HPAL.bone));const purples=[0x7a3f8c,0x8d519e,0x6a3579,0x9a62aa,0x845090];
 if(!F.grown){const A=F.ground(-F.R*1.05,F.R*.95),B=F.ground(F.R*1.05,F.R*.95);const h=3.0;for(const p of [A,B])kput('hkPost',[p[0],p[1]+h/2,p[2]],null,[.09,h,.09],bone);
  hykPut('hkBone',hykTube([[A[0],A[1]+h,A[2]],[(A[0]+B[0])/2,A[1]+h+.25,(A[2]+B[2])/2],[B[0],B[1]+h,B[2]]],t=>.07*(1+.3*Math.max(0,Math.cos(t*4*TAU))),{seg:6,col:bone}));
  for(let i=0;i<4;i++){const t0=.06+i*.24,t1=t0+.19;const a=[A[0]+(B[0]-A[0])*t0,A[1]+h-.02,A[2]+(B[2]-A[2])*t0],b=[A[0]+(B[0]-A[0])*t1,A[1]+h-.02,A[2]+(B[2]-A[2])*t1];hykShopCloth(a,b,rr(2.0,2.6),hC(purples[i]),{ph:i,wave:.1});}}
 else{for(const s of [-1,1]){const pts=hykShopRail(F,s*.5,s*1.3,dT+.55,.8,{n:4,r:.07});for(let i=1;i<pts.length-2;i++){const a=pts[i],b=pts[i+1];hykShopCloth([a[0],a[1]-.03,a[2]],[b[0],b[1]-.03,b[2]],rr(1.7,2.2),hC(purples[(i+s+3)%5]),{ph:i,wave:.08,out:[F.at(s*.9,dT,0).n[0],F.at(s*.9,dT,0).n[2]]});}}}
 // the banner over the door, hung from a cord between the lip's shoulders
 const a=F.at(-.3,dT+.4,.22).p,b=F.at(.3,dT+.4,.22).p;hykPut('hkBone',hykTube([F.at(-.34,dT+.42,-.1).p,a,b,F.at(.34,dT+.42,-.1).p],()=>.02,{seg:4,col:bone}));hykShopCloth(a,b,1.1,hC(purples[1]),{wave:.05,nu:6,nv:5});
 // dye vats: two small shells brimming purple, a heap of murex shells beside them
 for(const v of [[-F.R*.78,F.R*.85,.5],[-F.R*1.02,F.R*.5,.42]]){const g=F.ground(v[0],v[1]);const r=v[2],h=r*1.4;hykPut('hkShell',hykLathe({H:h,cx:g[0],cz:g[2],yBase:g[1],rFn:y=>r*(.75+.25*Math.sin(Math.PI*y/h)),nu:14,nv:6,rings:{n:3,amp:.03},col:F.col}));
  kput('hkLip',[g[0],g[1]+h,g[2]],qEuler(Math.PI/2,0,0),[r*.92,r*.92,.6],F.col);hykPut('hkFloor',hykDisc(g[0],g[1]+h-.05,g[2],r*.86,{col:hC(0x4a1d55),nu:12}));}
 const g=F.ground(-F.R*1.1,F.R*.15);for(let i=0;i<8;i++)kput('hkBall',[g[0]+rr(-.3,.3),g[1]+.06+rr(0,.1),g[2]+rr(-.3,.3)],qEuler(rr(-.6,.6),rr(0,TAU),0),[.1,.08,.14],hC(hPick([0xd9c9c0,0xc9b0b8,0xb8a0a8])));}
// --- the potter and glass shop (lit): a kiln grown on the front-right flank with a glowing mouth and a chimney spire,
// pots on a ledge and on the forecourt, glass lenses in a tray
function hykShopDressPotter(F){const dT=hykShopDoorTop(F);const warm=HPAL.shellWarm,coral=HPAL.coral,col=F.col;
 const fq=F.at(1.1,1.1,0);const kr=F.R*.4,kh=F.R*.62;const kx=fq.p[0]+fq.n[0]*kr*.9,kz=fq.p[2]+fq.n[2]*kr*.9;const ky0=F.grown?F.floorY-.5:-.3;
 const K={H:kh,cx:kx,cz:kz,yBase:ky0,rFn:y=>kr*Math.sqrt(Math.max(0,1-Math.pow(y/kh,2.4)))+.05,nu:30,nv:12,rings:{n:6,amp:.035},col};
 const mq=hykShopLatheAt(K,.25,ky0+kh*.28);const mop={p:mq.p,n:mq.n,r:kr*.32,ky:.95,kind:'window'};K.ops=[mop];hykPut(F.mat,hykLathe(K));
 hykPut(F.mat,hykFlare([fq.p[0]+fq.n[0]*.05,fq.p[1],fq.p[2]+fq.n[2]*.05],fq.n,kr*.85,kr*.5,{col}));if(!F.grown)hykPut(F.mat,hykFlare([kx,.02,kz],[0,1,0],kr*.98,kr*.32,{col}));
 hykWin(mop,{open:true});hykLight(mq.p[0]-mq.n[0]*kr*.55,mq.p[1]-.02,mq.p[2]-mq.n[2]*kr*.55,{r:.32,bare:true,level:F.level,bracket:[kx,ky0+kh*.28-.45,kz]});
 const ch=kr*1.1;hykPut(F.mat,hykLathe({H:ch,cx:kx,cz:kz,yBase:ky0+kh-.15,rFn:y=>kr*.28*Math.pow(1-y/ch,.6)+.09,nu:14,nv:6,col}));kput('hkLip',[kx,ky0+kh+ch-.13,kz],qEuler(Math.PI/2,0,0),[.13,.13,1.2],col);
 for(let i=0;i<8;i++){const a=rng()*TAU;const r=kr*.3;kput('hkBarnB',[kx+r*Math.cos(a),ky0+kh+ch-rr(.1,.5),kz+r*Math.sin(a)],null,[.045,.03,.045],hC(0x4a443c));}
 // pots: a ledge of small ones left of the door, big ones on the forecourt
 const l=hykShopLedge(F,-1,1.15,{reach:.8});for(let i=0;i<6;i++){const p=l((i+.5)/6,i%2?.3:.7);hykShopPot(p[0],p[1],p[2],rr(.32,.5),hC(hPick(i%3?warm:coral)),{k:rr(.36,.48)});}
 const g=F.ground(-F.R*.8,F.R*.95);for(let i=0;i<5;i++){const a=i*1.26;const r=i?(F.grown?.55:.75):0;hykShopPot(g[0]+r*Math.cos(a),g[1],g[2]+r*Math.sin(a)*.8,i?rr(.55,.8):1.05,hC(hPick(i%2?warm:coral)),{k:rr(.34,.44)});}
 // glass: a tray of lenses on the ledge's far end and a lens set over the door
 const l2=hykShopLedge(F,1,2.2,{reach:.6,t0:.5,t1:1.0});for(let i=0;i<4;i++){const p=l2((i+.5)/4,.5);kput('hkLens',[p[0],p[1]+.16,p[2]],null,[.16,.16,.16],hC(hPick(HPAL.lens)));}
 for(let i=0;i<5;i++){const q=F.at(-.36+i*.18,dT+.55,.1);kput('hkLens',q.p,null,[.13,.13,.13],hC(hPick(HPAL.lens)));}}
// --- the fishmongers' stall (poor): slabs on stalks inside and before the mouth, racks of hanging fish, baskets, a wet floor
function hykShopDressFish(F){const dT=hykShopDoorTop(F);const grey=HPAL.barnacle,bone=hC(hPick(HPAL.bone));const D=F.door;
 // the racks: one across the mouth under its lip, one deeper inside
 const a=F.at(-.45,dT-.45,-.1).p,b=F.at(.45,dT-.45,-.1).p;hykShopRack(a,b,9,'hkDrip',[.12,.55,.06],grey,{jit:true,r:.07});
 hykShopRack([-1.6,dT-.9,F.cz-.4],[1.6,dT-.9,F.cz-.4],7,'hkDrip',[.11,.5,.06],grey,{jit:true,r:.06});
 // slabs: two in the mouth, one out front; a gutting block
 for(const s of [[-1.55,.92,F.cz+F.R*.35,1.0],[1.55,.92,F.cz+F.R*.35,1.0],[F.R*.75,.86,F.cz+F.R*1.05,.85]])hykShopSlab(s[0],s[1],s[2],s[3],hC(hPick(grey)),{mat:'hkBarn',y0:F.floorY});
 for(const s of [[-1.55,F.cz+F.R*.35],[1.55,F.cz+F.R*.35]])for(let i=0;i<6;i++)kput('hkDrip',[s[0]+rr(-.5,.5),.98,s[1]+rr(-.4,.4)],qEuler(Math.PI/2,0,rr(0,TAU)),[.1,.5,.05],hC(hPick(grey)));
 kput('hkBall',[-F.R*.8,.3,F.cz+F.R*.9],null,[.5,.3,.5],hC(hPick(grey)));
 const g=F.ground(-F.R*.95,F.R*.5);for(let i=0;i<2;i++){kput('hkBall',[g[0]+i*.9,g[1]+.22,g[2]-i*.3],null,[.45,.24,.45],hC(hPick(grey)));kput('hkLip',[g[0]+i*.9,g[1]+.42,g[2]-i*.3],qEuler(Math.PI/2,0,0),[.45,.45,.5],hC(hPick(grey)));
  for(let k=0;k<5;k++)kput('hkDrip',[g[0]+i*.9+rr(-.2,.2),g[1]+.5,g[2]-i*.3+rr(-.2,.2)],qEuler(Math.PI/2,0,rr(0,TAU)),[.09,.4,.05],hC(hPick(grey)));}
 // the wet floor: puddles on the floor plate and spilling out over the threshold
 for(const p of [[0,F.cz+.3,1.4],[-1.2,F.cz-1.0,.9],[1.0,F.cz+F.R*.75,.8],[.4,F.cz+F.R*1.2,1.1]])hykPut('hkFloor',hykDisc(p[0],(p[1]>F.cz+F.R?.03:F.floorY+.02),p[1],p[2],{col:hC(0x6f8f88),nu:14,lobes:{n:5,amp:.12}}),p[1]<F.cz+F.R);
 // a gull-picked heap of shells and a drain lip
 for(let i=0;i<7;i++)kput('hkBall',[F.R*.9+rr(-.3,.3),.05,F.cz+F.R*.4+rr(-.3,.3)],qEuler(rr(-.5,.5),rr(0,TAU),0),[.12,.04,.14],hC(hPick(grey)));
 kput('hkLip',[.5,F.floorY+.01,F.cz-.8],qEuler(Math.PI/2,0,0),[.3,.3,.4],hC(hPick(HPAL.crust)));}
// ---------------------------------------------------------------- the free-standing stores (row 'Shops')
const hykShopTags=(wealth,lit)=>({type:['market/shop'],wealth:wealth||'middle',lit:!!lit});
// the armourer: a squat fluted barnacle dome hung with shields
function hykShopBuildArmour(G,o){reseed(30400+(o.v|0));const col=hC(hPick(HPAL.shell));const H=6.0;
 hykShopLatheBase({H,rFn:y=>4.3*Math.sqrt(Math.max(0,1-Math.pow(y/H,2.8)))+.05,flute:{n:14,amp:.06,sharp:1.6},rings:{n:8,amp:.025},col,vent:true,seed:3,
  wins:[{th:1.3,y:2.9,r:.45},{th:-1.3,y:2.8,r:.42},{th:Math.PI,y:3.2,r:.4}],name:'Armourer',room:'workshop',dress:hykShopDressArmour});}
HYK.def({key:'hyk_shop_armour',name:'Armourer',family:'shops',row:'Shops',w:11,d:10.5,h:6.4,tags:hykShopTags('middle',false),build:hykShopBuildArmour});
// the weaponsmith: a pod under an urchin spire, a blade rack, a forge cone with its fire
function hykShopBuildWeapon(G,o){reseed(30404+(o.v|0));const col=hC(hPick(HPAL.shell));
 hykShopPodBase({R:3.7,b:3.6,col,lit:true,seed:5,wins:[{th:-.75,y:2.9,r:.45},{th:.9,y:3.1,r:.4},{th:Math.PI,y:3.0,r:.45}],name:'Weaponsmith',room:'workshop',dress:hykShopDressWeapon});}
HYK.def({key:'hyk_shop_weapon',name:'Weaponsmith',family:'shops',row:'Shops',w:10,d:10,h:10.2,tags:hykShopTags('middle',true),build:hykShopBuildWeapon});
// the alchemist: a flask of a building, a glass stopper in its neck, jars on its ledges, one of them alight
function hykShopBuildAlchemy(G,o){reseed(30408+(o.v|0));const col=hC(hPick(HPAL.shellWarm));const H=7.4;
 const F=hykShopLatheBase({H,rFn:y=>1.2+2.3*Math.exp(-Math.pow((y-1.4)/2.1,2))+.45*clamp((y-6.4)/1.0,0,1),rings:{n:12,amp:.02},noise:{amp:.02,su:4,sv:2,seed:7},col,lit:true,seed:7,clear:3.2,
  wins:[{th:1.2,y:2.6,r:.42},{th:-1.2,y:2.7,r:.4},{th:0,y:4.7,r:.32}],name:'Alchemist',room:'workshop',dress:F=>{F.noCrown=true;hykShopDressAlchemy(F);}});
 // the stopper: a lens in the flask's mouth, a nacre collar; the inner skin is a second lathe so the neck is a chimney inside
 const top=F.top;kput('hkLip',[0,top-.05,0],qEuler(Math.PI/2,0,0),[1.7,1.7,1.3],col);kput('hkLens',[0,top+.35,0],null,[1.45,1.0,1.45],hC(hPick(HPAL.lens)));kput('hkBall',[0,top+1.3,0],null,[.4,.3,.4],hC(hPick(HPAL.bone)));}
HYK.def({key:'hyk_shop_alchemy',name:'Alchemist',family:'shops',row:'Shops',w:8.6,d:8.6,h:8.6,tags:hykShopTags('middle',true),build:hykShopBuildAlchemy});
// the food store: a wide low pod with a larder pod grown on its flank, strings of fish under the awning
function hykShopBuildFood(G,o){reseed(30412+(o.v|0));const col=hC(hPick(HPAL.shell)),col2=hC(hPick(HPAL.shellWarm));
 hykShopPodBase({R:4.3,a:4.6,c:4.0,b:3.3,col,seed:9,wins:[{th:.95,y:2.6,r:.42},{th:-1.15,y:2.5,r:.38},{th:Math.PI,y:2.4,r:.4}],name:'Food store',room:'store',dress:hykShopDressFood});
 // the larder: a smaller pod on the -x flank, rooted into the body and the ground, one window
 const B={a:2.2,b:2.1,c:2.0,e1:.9,e2:.92,cy:1.35,squash:.7,nu:36,nv:18,noise:{amp:.03,su:4,sv:3,seed:12},col:col2,hollow:{t:.08,col:col2},openings:[{th:-Math.PI/2,el:.15,r:.36,kind:'window'}]};
 const pb=hykPod(B);pb.geo.translate(-5.2,0,.5);hykPut('hkShell',pb.geo);pb.inner.translate(-5.2,0,.5);hykPut('hkIn',pb.inner,true);
 for(const op of pb.openings){op.p=[op.p[0]-5.2,op.p[1],op.p[2]+.5];hykWin(op,{});}
 hykPut('hkShell',hykFlare([-3.9,1.3,.5],[-1,0,0],1.7,.9,{col:col2}));hykPut('hkShell',hykFlare([-5.2,.02,.5],[0,1,0],2.0,.8,{col:col2}));hykFloor(-5.2,.5,.1,1.7,{});}
HYK.def({key:'hyk_shop_food',name:'Food store',family:'shops',row:'Shops',w:14,d:9.5,h:5.6,tags:hykShopTags('middle',false),build:hykShopBuildFood});
// the general store: a pod under a wide awning hung with goods, lenses round its crown
function hykShopBuildGeneral(G,o){reseed(30416+(o.v|0));const col=hC(hPick(HPAL.shell));
 const F=hykShopPodBase({R:3.9,b:3.7,col,seed:11,wins:[{th:1.0,y:3.0,r:.44},{th:-1.0,y:3.0,r:.44},{th:Math.PI,y:3.2,r:.4},{th:.3,y:4.9,r:.28}],name:'General store',room:'store',dress:hykShopDressGeneral});
 for(let i=0;i<7;i++){const q=F.at(i/7*TAU+.4,F.top-1.1,.02);kput('hkLens',q.p,null,.24,hC(hPick(HPAL.lens)));}}
HYK.def({key:'hyk_shop_general',name:'General store',family:'shops',row:'Shops',w:10.5,d:11,h:6.1,tags:hykShopTags('middle',false),build:hykShopBuildGeneral});
// the chandler and netmaker: a pod with a net-loft grown on its back-right flank, nets drying on its face
function hykShopBuildChandler(G,o){reseed(30420+(o.v|0));const col=hC(hPick(HPAL.shell)),col2=hC(hPick(HPAL.shellWarm));
 hykShopPodBase({R:3.8,b:3.5,col,seed:13,wins:[{th:1.05,y:2.6,r:.4},{th:-1.05,y:2.6,r:.4},{th:Math.PI,y:2.8,r:.4}],name:'Chandler',room:'workshop',dress:hykShopDressChandler});
 const B={a:2.3,b:2.2,c:2.1,e1:.9,e2:.92,cy:1.4,squash:.7,nu:36,nv:18,noise:{amp:.03,su:4,sv:3,seed:14},col:col2,hollow:{t:.08,col:col2},openings:[{th:Math.PI/2,el:.2,r:.36,kind:'window'},{th:1.0,el:.5,r:.28,kind:'window'}]};
 const pb=hykPod(B);pb.geo.translate(4.9,0,-1.6);hykPut('hkShell',pb.geo);pb.inner.translate(4.9,0,-1.6);hykPut('hkIn',pb.inner,true);
 for(const op of pb.openings){op.p=[op.p[0]+4.9,op.p[1],op.p[2]-1.6];hykWin(op,{});}
 hykPut('hkShell',hykFlare([3.5,1.3,-1.4],[1,0,0],1.7,.9,{col:col2}));hykPut('hkShell',hykFlare([4.9,.02,-1.6],[0,1,0],2.1,.8,{col:col2}));hykFloor(4.9,-1.6,.1,1.8,{});}
HYK.def({key:'hyk_shop_chandler',name:'Chandler',family:'shops',row:'Shops',w:13.5,d:10,h:5.9,tags:hykShopTags('middle',false),build:hykShopBuildChandler});
// the pearl and shell-inlay shop (rich): a tall nacre egg on a scalloped collar, inlay bands, a pearl on its crown
function hykShopBuildPearl(G,o){reseed(30424+(o.v|0));const col=hC(hPick(HPAL.nacre));
 hykShopPodBase({R:3.6,b:4.0,e1:.95,e2:.9,col,mat:'hkNacre',nacre:true,lit:true,seed:15,wealth:.9,wins:[{th:1.05,y:3.2,r:.42},{th:-1.05,y:3.2,r:.42},{th:Math.PI,y:3.3,r:.4},{th:.4,y:4.25,r:.28},{th:-.4,y:4.25,r:.28}],name:'Pearl shop',room:'store',dress:hykShopDressPearl});
 // the scalloped collar round the base, in nacre
 hykPut('hkNacre',hykLathe({H:1.1,cx:0,cz:0,yBase:-.05,rFn:y=>3.95-.45*Math.pow(y/1.1,1.6),nu:54,nv:6,lobes:{n:11,amp:.09},col}));hykPut('hkNacre',hykFlare([0,.02,0],[0,1,0],4.25,1.1,{col}));}
HYK.def({key:'hyk_shop_pearl',name:'Pearl shop',family:'shops',row:'Shops',w:9.5,d:9.5,h:7.6,tags:hykShopTags('rich',true),build:hykShopBuildPearl});
// the salt and spice shop: a stepped white beehive, salt cones before it, spice baskets on its ledge
function hykShopBuildSalt(G,o){reseed(30428+(o.v|0));const col=hC(hPick(HPAL.shell));const H=5.6;
 hykShopLatheBase({H,rFn:y=>3.6*Math.sqrt(Math.max(0,1-Math.pow(y/H,2.6)))+.05,rings:{n:9,amp:.045},noise:{amp:.025,su:4,sv:1.5,seed:17},col,vent:true,seed:17,
  wins:[{th:1.15,y:2.7,r:.4},{th:-1.15,y:2.7,r:.4},{th:Math.PI,y:3.0,r:.38}],name:'Salt and spice',room:'store',dress:hykShopDressSalt});}
HYK.def({key:'hyk_shop_salt',name:'Salt and spice',family:'shops',row:'Shops',w:12,d:10,h:5.6,tags:hykShopTags('middle',false),build:hykShopBuildSalt});
// the cloth and dye shop: a pod with the dyer's frame before it, purple lengths drying
function hykShopBuildCloth(G,o){reseed(30432+(o.v|0));const col=hC(hPick(HPAL.shell));
 hykShopPodBase({R:3.6,b:3.5,col,seed:19,wins:[{th:1.0,y:2.8,r:.42},{th:-1.0,y:2.9,r:.4},{th:Math.PI,y:2.9,r:.4}],name:'Cloth and dye',room:'workshop',dress:hykShopDressCloth});}
HYK.def({key:'hyk_shop_cloth',name:'Cloth and dye',family:'shops',row:'Shops',w:12,d:11,h:5.8,tags:hykShopTags('middle',false),build:hykShopBuildCloth});
// the potter and glass shop: a fluted drum under a lens dome, the kiln on its flank glowing, pots everywhere
function hykShopBuildPotter(G,o){reseed(30436+(o.v|0));const col=hC(hPick(HPAL.shellWarm)),col2=hC(hPick(HPAL.shell));const H=3.4;
 hykShopLatheBase({H,rFn:y=>3.6*(1+.04*Math.sin(y*1.7)),flute:{n:18,amp:.05,sharp:1.5},noise:{amp:.02,su:4,sv:2,seed:21},col,lit:true,seed:21,clear:2.9,
  wins:[{th:1.1,y:2.2,r:.4},{th:-1.1,y:2.2,r:.4},{th:Math.PI,y:2.3,r:.4}],name:'Potter and glass',room:'workshop',dress:hykShopDressPotter});
 // the lens dome on the drum, lenses in two rings, an inner dome so the room has a ceiling
 const dy=H-.3-.1,DH=2.5;const D={H:DH,cx:0,cz:0,yBase:dy,rFn:y=>3.72*Math.sqrt(Math.max(0,1-Math.pow(y/DH,2.2)))+.05,nu:48,nv:14,rings:{n:4,amp:.03},col:col2};
 hykPut('hkShell',hykLathe(D));hykPut('hkIn',hykLathe(Object.assign({},D,{rFn:y=>D.rFn(y)*.92,flip:true,col:hC(hPick(HPAL.shell),.86)})),true);
 kput('hkLip',[0,dy+.02,0],qEuler(Math.PI/2,0,0),[3.8,3.8,1.1],col2);
 for(let ring=0;ring<2;ring++){const n=ring?8:14,y=ring?1.55:.7,r=D.rFn(y);for(let i=0;i<n;i++){const a=i/n*TAU+ring*.25;kput('hkLens',[r*Math.cos(a)*.985,dy+y,r*Math.sin(a)*.985],null,ring?.24:.3,hC(hPick(HPAL.lens)));}}
 kput('hkLip',[0,dy+DH-.02,0],qEuler(Math.PI/2,0,0),[.3,.3,1.2],col2);}
HYK.def({key:'hyk_shop_potter',name:'Potter and glass',family:'shops',row:'Shops',w:12.5,d:10,h:6.2,tags:hykShopTags('middle',true),build:hykShopBuildPotter});
// the fishmongers' stall at the fishing docks (poor): a grey barnacle with a great lipped mouth, slabs and racks, a wet floor
function hykShopBuildFish(G,o){reseed(30440+(o.v|0));const col=hC(hPick(HPAL.barnacle));const H=4.8;
 hykShopLatheBase({H,rFn:y=>4.4*Math.sqrt(Math.max(0,1-Math.pow(y/H,2.2)))+.05,flute:{n:16,amp:.08,sharp:1.4},rings:{n:6,amp:.03},noise:{amp:.035,su:5,sv:1.2,seed:23},col,mat:'hkBarn',inCol:hC(hPick(HPAL.barnacle),.85),seed:23,
  doorR:2.2,doorKy:.85,doorY:2.05,wins:[{th:Math.PI,y:2.6,r:.4},{th:1.6,y:2.4,r:.35},{th:-1.6,y:2.4,r:.35}],vent:true,wealth:.15,name:'Fishmonger',room:'store',dress:hykShopDressFish});}
HYK.def({key:'hyk_fishmonger',name:'Fishmonger',family:'shops',row:'Shops',w:11,d:10,h:5.1,tags:hykShopTags('poor',false),build:hykShopBuildFish});
// ---------------------------------------------------------------- the grown-on stores (row 'Grown-on shops', the G frame)
function hykShopBuildPodArmour(G,o){reseed(30444+(o.v|0));hykShopGrownBase(o,{R:3.8,col:hC(hPick(HPAL.shell)),seed:31,name:'Grown armourer',room:'workshop',dress:hykShopDressArmour});}
HYK.def({key:'hyk_pod_shop_armour',name:'Grown armourer',family:'shops',row:'Grown-on shops',grown:true,w:7.6,d:7.6,h:6.9,tags:hykShopTags('middle',false),build:hykShopBuildPodArmour});
function hykShopBuildPodWeapon(G,o){reseed(30448+(o.v|0));hykShopGrownBase(o,{R:3.6,col:hC(hPick(HPAL.shell)),lit:true,seed:32,name:'Grown weaponsmith',room:'workshop',dress:hykShopDressWeapon});}
HYK.def({key:'hyk_pod_shop_weapon',name:'Grown weaponsmith',family:'shops',row:'Grown-on shops',grown:true,w:7.2,d:7.2,h:10,tags:hykShopTags('middle',true),build:hykShopBuildPodWeapon});
function hykShopBuildPodAlchemy(G,o){reseed(30452+(o.v|0));hykShopGrownBase(o,{R:3.6,col:hC(hPick(HPAL.shellWarm)),lit:true,seed:33,name:'Grown alchemist',room:'workshop',dress:hykShopDressAlchemy});}
HYK.def({key:'hyk_pod_shop_alchemy',name:'Grown alchemist',family:'shops',row:'Grown-on shops',grown:true,w:7.2,d:7.2,h:7.6,tags:hykShopTags('middle',true),build:hykShopBuildPodAlchemy});
function hykShopBuildPodFood(G,o){reseed(30456+(o.v|0));hykShopGrownBase(o,{R:4.2,col:hC(hPick(HPAL.shell)),seed:34,name:'Grown food store',room:'store',dress:hykShopDressFood});}
HYK.def({key:'hyk_pod_shop_food',name:'Grown food store',family:'shops',row:'Grown-on shops',grown:true,into:true,w:8.4,d:8.4,h:7.6,tags:hykShopTags('middle',false),build:hykShopBuildPodFood});
function hykShopBuildPodGeneral(G,o){reseed(30460+(o.v|0));hykShopGrownBase(o,{R:4.2,col:hC(hPick(HPAL.shell)),seed:35,name:'Grown general store',room:'store',dress:hykShopDressGeneral});}
HYK.def({key:'hyk_pod_shop_general',name:'Grown general store',family:'shops',row:'Grown-on shops',grown:true,into:true,w:8.4,d:8.4,h:7.6,tags:hykShopTags('middle',false),build:hykShopBuildPodGeneral});
function hykShopBuildPodChandler(G,o){reseed(30464+(o.v|0));hykShopGrownBase(o,{R:4.0,col:hC(hPick(HPAL.shell)),seed:36,name:'Grown chandler',room:'workshop',dress:hykShopDressChandler});}
HYK.def({key:'hyk_pod_shop_chandler',name:'Grown chandler',family:'shops',row:'Grown-on shops',grown:true,w:8,d:8,h:7.2,tags:hykShopTags('middle',false),build:hykShopBuildPodChandler});
function hykShopBuildPodPearl(G,o){reseed(30468+(o.v|0));hykShopGrownBase(o,{R:3.8,col:hC(hPick(HPAL.nacre)),mat:'hkNacre',nacre:true,lit:true,wealth:.9,seed:37,name:'Grown pearl shop',room:'store',
 wins:[{th:.85,el:.08,r:.5},{th:-.85,el:.08,r:.5},{th:.3,el:1.0,r:.4}],dress:hykShopDressPearl});}
HYK.def({key:'hyk_pod_shop_pearl',name:'Grown pearl shop',family:'shops',row:'Grown-on shops',grown:true,w:7.6,d:7.6,h:7.6,tags:hykShopTags('rich',true),build:hykShopBuildPodPearl});
function hykShopBuildPodSalt(G,o){reseed(30472+(o.v|0));hykShopGrownBase(o,{R:3.6,col:hC(hPick(HPAL.shell)),seed:38,name:'Grown salt shop',room:'store',dress:hykShopDressSalt});}
HYK.def({key:'hyk_pod_shop_salt',name:'Grown salt shop',family:'shops',row:'Grown-on shops',grown:true,w:7.2,d:7.2,h:6.6,tags:hykShopTags('middle',false),build:hykShopBuildPodSalt});
function hykShopBuildPodCloth(G,o){reseed(30476+(o.v|0));hykShopGrownBase(o,{R:3.8,col:hC(hPick(HPAL.shell)),seed:39,name:'Grown dyer',room:'workshop',dress:hykShopDressCloth});}
HYK.def({key:'hyk_pod_shop_cloth',name:'Grown dyer',family:'shops',row:'Grown-on shops',grown:true,w:9,d:8,h:6.9,tags:hykShopTags('middle',false),build:hykShopBuildPodCloth});
function hykShopBuildPodPotter(G,o){reseed(30480+(o.v|0));hykShopGrownBase(o,{R:4.0,col:hC(hPick(HPAL.shellWarm)),lit:true,seed:40,name:'Grown potter',room:'workshop',dress:hykShopDressPotter});}
HYK.def({key:'hyk_pod_shop_potter',name:'Grown potter',family:'shops',row:'Grown-on shops',grown:true,w:9,d:8,h:7.6,tags:hykShopTags('middle',true),build:hykShopBuildPodPotter});
