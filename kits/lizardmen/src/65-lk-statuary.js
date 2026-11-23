// prefix: lks
// ================================================================= MONUMENTAL STATUARY OF BASILISK (65-lk-statuary.js)
// Twelve large, oppressive, strangely shaped cyclopean verdigris-stone and cast-bronze monuments for Basilisk's avenues,
// Coil turns, district courts and Mound (owner, 2026-11-18 — sculptural overhaul & expanded varieties):
//   A. Representative of the Lizardmen:
//      1. lk-colossus-watcher (7725): 19.5 m sculpted archaic Lizardman monolith — coiled osteoderm tail, faceted S-curved
//                                     carapace torso, articulated taloned limbs, 9 bronze dorsal scutes & overhanging taotie skull
//      2. lk-statue-phalanx   (7726): six sculpted cowled Lizardman figures in the 1.25^k caste progression leaning at 75 deg,
//                                     each torso split by its triangular caste portal and threaded by a twisted bronze spine
//      3. lk-statue-conclave  (7731): five hunched faceless Interpreter monoliths leaning inward in silent concert around a
//                                     levitating cast-bronze relief disc of the Rift & shimmering thought-planes
//      4. lk-statue-rebirth   (7732): pathogenic-return monument — a fissured outer stone husk split open along a spiral seam
//                                     as a sleek cast-bronze and jade reborn figure rises out of the cleft
//   B. Representative of the Coil:
//      5. lk-colossus-coil    (7727): 18.0 m cantilevered 3D squared-spiral (leiwen) of bevelled stone-and-bronze girders
//                                     winding at 75/105 deg round a carved whorl-sphere, severed at the Phase Inversion gap
//      6. lk-statue-ouroboros (7728): counter-twisting scale-plated stone & bronze serpent helices flaring overhead into twin
//                                     archaic taotie serpent-jaws around 7 clapperless bianzhong bells and spiral eyes
//      7. lk-statue-gyre      (7733): five colossal nested eccentric bi-discs of verdigris stone and bronze (centres offset,
//                                     after the reliquary's rings) cradled in three cyclopean stone tusks
//      8. lk-statue-chronicle (7734): 17.5 m twisted hexagonal retroactive-glyph stele half-bound in cast-bronze chains,
//                                     clamp collars and stone matting, flanked by a fallen face-down stela
//   C. Strange things only they could understand:
//      9. lk-statue-manifold  (7729): 17.0 m horizontally sheared 75/105 deg rhombic monolith — 7 cantilevered strata with
//                                     shimmer clefts, upside-down stairs beneath overhangs and whorl-spheres emerging from stone
//     10. lk-statue-paradox   (7730): faceted inverted eyed polyhedron poised on a bronze needle-point, pierced clean through
//                                     by three skew 75/105 deg bevelled stone-and-bronze frames
//     11. lk-statue-tesseract (7735): 4D-projected skewed rhombic stone hyper-cage tethering a counter-rotated inner bronze
//                                     cage that suspends a spiked black-lacquer vessel & 20-boss bronze dodecahedron
//     12. lk-statue-chorus    (7736): thirteen leaning asymmetric basalt-and-bronze eye-stalks rising from a fused root-knot,
//                                     each flaring into a hooded spiral oculus with a clapperless bell hung beneath its chin
// Frame: origin on the ground at the plot centre, +z the front.

/* ---------------------------------------------------------------- flat-faceted sculptural mesh & loft primitives */
function lksMesh(mk,fn,col){const pos=[],nor=[],idx=[];
 const tri=(a,b,c)=>{const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];
  let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;const L=Math.hypot(nx,ny,nz);if(L<1e-7)return;nx/=L;ny/=L;nz/=L;
  const s=pos.length/3;pos.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2]);nor.push(nx,ny,nz,nx,ny,nz,nx,ny,nz);idx.push(s,s+1,s+2);};
 const quad4=(a,b,c,d)=>{tri(a,b,c);tri(a,c,d);};
 fn(tri,quad4);if(!idx.length)return;emit(mk,mkGeo(pos,nor,null,idx),null,col);}

/* Loft a closed faceted skin through `rings` (each ring an M-point loop ordered CCW around +T, e.g. x=sin a, z=cos a). */
function lksLoft(mk,rings,col,o){o=o||{};const nr=rings.length;if(nr<2)return;const M=rings[0].length;
 const avg=R=>{let x=0,y=0,z=0;for(const p of R){x+=p[0];y+=p[1];z+=p[2];}return [x/M,y/M,z/M];};
 lksMesh(mk,(tri,quad4)=>{
  for(let r=0;r<nr-1;r++){const A=rings[r],B=rings[r+1];
   for(let j=0;j<M;j++){const j1=(j+1)%M;quad4(A[j],A[j1],B[j1],B[j]);}}
  if(o.capBot!==false){const A=rings[0],c=avg(A);for(let j=0;j<M;j++)tri(c,A[(j+1)%M],A[j]);}
  if(o.capTop!==false){const B=rings[nr-1],c=avg(B);for(let j=0;j<M;j++)tri(c,B[j],B[(j+1)%M]);}},col);}

/* Build a spine-aligned ring at centre `c`, tangent `tVec`, using profile pts `[[sx, fz], ...]` (CCW: +fz front, +sx right). */
function lksRingAt(c,tVec,prof){
 let tx=tVec[0],ty=tVec[1],tz=tVec[2];const tl=Math.hypot(tx,ty,tz)||1;tx/=tl;ty/=tl;tz/=tl;
 /* right-handed basis (Side, T, Front) with Side horizontal where possible and Side x T = Front */
 let sx=-tz,sy=0,sz=tx;
 if(Math.hypot(sx,sz)<1e-4){sx=1;sy=0;sz=0;}
 else{const sl=Math.hypot(sx,sz);sx/=sl;sz/=sl;if(sx<0&&Math.abs(tx)<.25){sx=-sx;sz=-sz;}}
 /* if T points mostly up (+y) along symmetry plane (tx~0), force Side = +x so Front = Side x T = (0, -tz, ty) faces +z */
 if(Math.abs(tx)<.35&&ty>-.3){sx=1;sy=-tx/(Math.max(.35,Math.hypot(ty,tz)));sz=0;const sl=Math.hypot(sx,sy,sz);sx/=sl;sy/=sl;sz/=sl;
  /* orthogonalize Side against T */
  const d=sx*tx+sy*ty+sz*tz;sx-=d*tx;sy-=d*ty;sz-=d*tz;const sl2=Math.hypot(sx,sy,sz)||1;sx/=sl2;sy/=sl2;sz/=sl2;}
 const fx=sy*tz-sz*ty,fy=sz*tx-sx*tz,fz=sx*ty-sy*tx;
 return prof.map(q=>[c[0]+sx*q[0]+fx*q[1],c[1]+sy*q[0]+fy*q[1],c[2]+sz*q[0]+fz*q[1]]);}

/* Faceted octagonal/hexagonal limb segment from `a` to `b` with radii `r0 -> r1` and dorsal ridge factor `keel`. */
function lksLimb(mk,a,b,r0,r1,col,keel){keel=keel||1.25;const t=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],m=[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];
 const mkProf=r=>{const out=[];for(let j=0;j<6;j++){const ang=j/6*TAU,k=(j===0?keel:j===3?.82:1);out.push([Math.sin(ang)*r*.88,Math.cos(ang)*r*k]);}return out;};
 const rm=(r0+r1)*.56;
 lksLoft(mk,[lksRingAt(a,t,mkProf(r0)),lksRingAt(m,t,mkProf(rm)),lksRingAt(b,t,mkProf(r1))],col);}

/* Four-taloned sculpted Lizardman hand/claw at wrist `w`, forward `dir`, spread `side`, scale `sc`. */
function lksClaw(mk,brMk,w,dir,side,sc,stCol,brCol){
 const dl=Math.hypot(dir[0],dir[1],dir[2])||1,dx=dir[0]/dl,dy=dir[1]/dl,dz=dir[2]/dl;
 const sl=Math.hypot(side[0],side[1],side[2])||1,sx=side[0]/sl,sy=side[1]/sl,sz=side[2]/sl;
 const at=(f,u,dn)=>[w[0]+dx*f*sc+sx*u*sc,w[1]+dy*f*sc+sy*u*sc-(dn||0)*sc,w[2]+dz*f*sc+sz*u*sc];
 lksLimb(mk,w,at(.52,0,.04),.22*sc,.17*sc,stCol,1.15);
 for(let f=0;f<4;f++){const u=(f-1.5)*.16,kn=at(.55,u,.05),md=at(.98,u*1.25,.18),tp=at(1.32,u*1.35,.38);
  lksLimb(mk,kn,md,.075*sc,.052*sc,stCol,1.2);lksLimb(brMk,md,tp,.05*sc,.014*sc,brCol,1.3);}}

/* Bevelled rectangular stone-and-bronze girder from `a` to `b` (width `w`, height `h`) with inlaid bronze leiwen flank strips. */
function lksGirder(mk,a,b,w,h,col,brCol){
 const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],L=Math.hypot(dx,dy,dz);if(L<.05)return;
 const t=[dx/L,dy/L,dz/L];
 /* 8-point chamfered rectangular section so light catches sharp bevels along every edge */
 const hw=w/2,hh=h/2,ch=Math.min(hw,hh)*.26;
 const prof=[[hw-ch,hh],[hw,hh-ch],[hw,-hh+ch],[hw-ch,-hh],[-hw+ch,-hh],[-hw,-hh+ch],[-hw,hh-ch],[-hw+ch,hh]];
 const a2=[a[0]-t[0]*w*.18,a[1]-t[1]*w*.18,a[2]-t[2]*w*.18],b2=[b[0]+t[0]*w*.18,b[1]+t[1]*w*.18,b[2]+t[2]*w*.18];
 lksLoft(mk,[lksRingAt(a2,t,prof),lksRingAt(b2,t,prof)],col);
 if(brCol){const bp=[[hw+.018,hh*.28],[hw+.018,-hh*.28],[-hw-.018,-hh*.28],[-hw-.018,hh*.28]];
  for(const s of [-1,1]){const sp=[[s*(hw+.015),hh*.24],[s*(hw+.03),0],[s*(hw+.015),-hh*.24],[s*(hw-.02),0]];
   lksLoft('bronzeC',[lksRingAt(a,t,sp),lksRingAt(b,t,sp)],brCol);}}}

/* Sculpted archaic Lizardman / Shang taotie oracle head (`sc` = 1 gives ~2.6 m wide, 2.8 m tall, 3.2 m deep).
   Built from faceted planes (lksLoft): split hooked snout, flared jugal cheek-shields, deep orbital brow-ridge, swept temporal
   crests, spiral-eye oculus and twin bronze horns. Origin at neck-socket base, facing +z. */
function lksTaotieHead(sc,o){o=o||{};const stCol=o.col||P('basaltD'),brCol=o.brCol||P('bronze'),hornMk=o.hornMk||'bronzeC';
 /* 10-point symmetrical section per station along the skull axis (from throat/jaw base up-and-forward to brow & crown) */
 const sec=(w,jawW,frontZ,backZ,browOut,cheekOut)=>[
  [0,frontZ],[jawW*.58,frontZ*.86],[w*.88+cheekOut,frontZ*.32+browOut],[w,backZ*.22],[w*.72,backZ],
  [0,backZ*1.08],[-w*.72,backZ],[-w,backZ*.22],[-w*.88-cheekOut,frontZ*.32+browOut],[-jawW*.58,frontZ*.86]];
 const R=[
  lksRingAt([0,-.15*sc,-.1*sc],[0,1,.18],sec(.62*sc,.46*sc,.72*sc,-.68*sc,0,0)),
  lksRingAt([0,.35*sc,.18*sc],[0,1,.25],sec(.98*sc,.74*sc,1.45*sc,-.88*sc,0,.14*sc)),
  lksRingAt([0,.92*sc,.34*sc],[0,1,.15],sec(1.26*sc,.82*sc,1.62*sc,-1.05*sc,-.12*sc,.26*sc)),
  lksRingAt([0,1.48*sc,.42*sc],[0,1,.08],sec(1.42*sc,1.12*sc,1.78*sc,-1.18*sc,.28*sc,.18*sc)),
  lksRingAt([0,1.98*sc,.22*sc],[0,1,-.18],sec(1.18*sc,.84*sc,1.24*sc,-1.36*sc,.12*sc,0)),
  lksRingAt([0,2.38*sc,-.22*sc],[0,1,-.35],sec(.58*sc,.36*sc,.48*sc,-1.12*sc,0,0))];
 lksLoft(o.mk||'stoneP',R,stCol);
 /* cast-bronze Shang median nasal-crest flange & overhanging taotie brow-plate */
 lksLoft('bronzeC',[
  lksRingAt([0,.25*sc,1.42*sc],[0,1,.12],[[0,.24*sc],[.13*sc,.04*sc],[0,-.12*sc],[-.13*sc,.04*sc]]),
  lksRingAt([0,1.55*sc,1.76*sc],[0,1,.06],[[0,.32*sc],[.16*sc,.05*sc],[0,-.14*sc],[-.16*sc,.05*sc]]),
  lksRingAt([0,2.32*sc,.25*sc],[0,.6,-1],[[0,.26*sc],[.11*sc,.03*sc],[0,-.1*sc],[-.11*sc,.03*sc]])],brCol);
 /* swept bronze brow-wings over the sunken eye-planes */
 for(const s of [-1,1]){
  lksLimb('bronzeC',[s*.18*sc,1.52*sc,1.78*sc],[s*1.58*sc,1.66*sc,.72*sc],.22*sc,.14*sc,brCol,1.4);
  /* lateral jugal cheek-spikes */
  lzHorn(s*1.22*sc,.88*sc,.42*sc,s>0?-PI/2+.42:PI/2-.42,1.35*sc,.14*sc,{curl:.45,lean:.32,mk:'stoneP',col:stCol,nt:6,ns:5});
  /* sweeping primary temporal horns */
  lzHorn(s*1.12*sc,1.78*sc,.15*sc,s>0?-PI/2+.26:PI/2-.26,(o.hornL==null?2.8:o.hornL)*sc,.21*sc,{curl:.74,lean:.26,mk:hornMk,col:hornMk==='ivory'?P('tusk'):brCol,nt:8,ns:6});
  /* swept-back occipital crown-crests */
  lzHorn(s*.56*sc,2.15*sc,-.45*sc,PI+s*.18,2.1*sc,.15*sc,{curl:.38,lean:.44,mk:'stoneP',col:stCol,nt:6,ns:5});
  /* sunken lateral eye-slits under the brow */
  W(s*.78*sc,1.22*sc,1.18*sc,s*.48,()=>lzEye(0,0,0,0,.32*sc,{mk:'bronze',glow:!!o.sideGlow}));}
 /* central third-eye spiral oculus on the forehead crest */
 if(o.eye!==false)WX(0,1.78*sc,1.68*sc,-.14,0,0,()=>lzEye(0,0,0,0,.52*sc,{mk:'bronze',glow:!!o.glow}));}

/* Carved round whorl-sphere (after 60-lz-reliquary.js lrSphere) with 4 interlocking relief spirals & bronze oculi. */
function lksWhorlSphere(x,y,z,R,o){o=o||{};const stCol=o.col||P('verd'),brCol=o.brCol||P('bronze');
 W(x,y,z,o.ry||0,()=>{
  sph(o.mk||'stoneP',0,0,0,R,stCol,1,18);
  for(let k=0;k<4;k++)W(0,0,0,k*PI/2,()=>tube('bronzeC',t=>{const a=t*TAU*1.55,ph=.18+t*2.75,r=R*1.01;
   return [Math.cos(a)*Math.sin(ph)*r,Math.cos(ph)*r,Math.sin(a)*Math.sin(ph)*r];},t=>[R*.048,R*.038],20,5,brCol,{caps:true}));
  if(o.eyes)for(const q of [0,PI/2,PI,-PI/2])W(0,0,0,q,()=>lzEye(0,0,R*1.01,0,R*.26,{mk:'bronze',glow:!!o.glow}));});}

/* Pointed Shang clapperless bianzhong bell (elliptical almond section, 3x3 mei bosses on each face, hollow dark mouth). */
function lksBianzhong(x,y,z,h,r,o){o=o||{};const brCol=o.col||P('bronze'),vdCol=P('verd');
 W(x,y,z,o.ry||0,()=>{
  /* hang shackle (`yong` shank) */
  cyl('bronzeC',0,0,0,r*.22,h*.22,brCol,7);ring('bronzeC',0,h*.08,0,r*.28,r*.06,vdCol,0,PI/2,0,10);
  /* almond-shaped body hanging from y=0 down to y=-h */
  const rings=[];
  for(let k=0;k<=4;k++){const v=k/4,yy=-v*h,rx=r*(.52+.48*Math.pow(v,.65)),rz=rx*.66;
   const prof=[];for(let j=0;j<10;j++){const a=j/10*TAU,lens=1+.18*Math.abs(Math.sin(a));prof.push([Math.sin(a)*rx*lens,Math.cos(a)*rz]);}
   rings.push(prof.map(q=>[q[0],yy,q[1]]));}
  lksLoft('bronzeC',rings,brCol,{capBot:false,capTop:true});
  /* dark clapperless interior void */
  box('lacq',0,-h+.04,0,r*1.55,h*.18,r*.88,P('lacq'));
  /* 3x3 archaic bronze `mei` bosses on front & back faces */
  for(const f of [-1,1])for(let row=0;row<3;row++)for(let colI=-1;colI<=1;colI++){
   const yy=-h*(.26+row*.17),zz=f*r*(.38+.22*(.26+row*.17));
   sph('bronzeC',colI*r*.34,yy,zz,r*.065,vdCol,1,6);}});}

/* Three-stepped cyclopean & polished verdigris-basalt plinth (NO flat sky-glaring bronze mirror on top!).
   Features chamfered skew corners, battered dado, recessed bronze leiwen friezes, dark drip-cornice & bronze corner claws. */
function lksPedestal(w,d,h,o){o=o||{};const hw=w/2,hd=d/2,ch=Math.min(hw,hd)*.22;
 const oct=(a,b)=>[[a-ch,-b],[a,-b+ch],[a,b-ch],[a-ch,b],[-a+ch,b],[-a,b-ch],[-a,-b+ch],[-a+ch,-b]];
 /* Step 1: heavy chamfered dark basalt footing */
 prism('stoneP',oct(hw,hd),0,h*.34,P('basaltD'));
 /* Step 2: battered cyclopean verdigris dado */
 const w1=hw-.38,d1=hd-.38,w2=hw-.68,d2=hd-.68;
 lksLoft('cyclo',[oct(w1,d1).map(p=>[p[0],h*.34,p[1]]),oct(w2,d2).map(p=>[p[0],h*.86,p[1]])],o.col||P('verd'));
 /* Recessed bronze leiwen friezes on all four cardinal faces */
 for(const [x,z,ry,L] of [[0,d1-.12,0,w-2.2],[0,-(d1-.12),PI,w-2.2],[w1-.12,0,PI/2,d-2.2],[-(w1-.12),0,-PI/2,d-2.2]]){
  if(L>1.2)WX(x,h*.42,z,ry,-.12,0,()=>lzLeiwen(L,Math.min(.82,h*.38),{cell:.28,mk:'bronze',back:'lacq'}));}
 /* Step 3: overhanging dark basalt cornice + matte cyclopean altar-top (cyclo avoids sky specular glare!) */
 prism('cyclo',oct(w2+.20,d2+.20),h*.86,h*1.0,P('basaltD'));
 prism('cyclo',oct(w2-.16,d2-.16),h*1.0,h*1.08,P('basalt'));
 /* Four cast-bronze corner claw-volutes gripping the cornice */
 for(const sx of [-1,1])for(const sz of [-1,1]){
  const ang=Math.atan2(sx,sz);
  lzHorn(sx*(w2-.05),h*.84,sz*(d2-.05),ang,.62,.085,{curl:.75,lean:.55,mk:'bronzeC',col:P('bronze'),nt:5,ns:5});}
 return h*1.08;}

/* ================================================================ A. REPRESENTATIVE OF THE LIZARDMEN */

/* ---------------------------------------------------------------- 1. Colossus of the Watcher (19.5 m sculpted monolith) */
defBuilding({key:'lk-colossus-watcher',name:'Colossus of the Watcher',seed:7725,caste:'all',cut:false,w:12,d:12,h:19.5,budget:95000,
 front:{x:0,z:6,yaw:0},tags:{types:['statue','civic'],wealth:'rich',role:'monument'},
 note:'an oppressive 19.5 m sculpted Lizardman colossus in verdigris stone and cast bronze: heavy osteoderm-plated tail coiled round a chamfered plinth, S-curved faceted carapace torso hunching forward over the avenue, articulated four-taloned hands, nine bronze dorsal scutes and an overhanging Shang taotie oracle skull',
 build(o){const v=((o&&o.v)|0)%5,y0=lksPedestal(9.8,9.8,2.2,{col:v===1?P('jade'):P('verd')});
  const stCol=v===1?P('jade'):v===3?P('basaltD'):P('verd'),dkCol=P('basaltD'),brCol=v%2?P('bronze'):P('verd');
  const janus=v===4?[-1,1]:[1];
  for(const dir of janus)W(0,y0,janus.length>1?-dir*.75:0,dir<0?PI:0,()=>{
   const sc=janus.length>1?.80:1.0;
   /* Sculpted S-curved faceted monolith body: flared pelvis -> narrow keeled waist -> massive hunched carapace shoulders -> forward neck */
   const bodySec=(w,fz,bz,keel,ridge)=>[
    [0,fz*keel],[w*.52,fz*.82],[w,.18*fz],[w*.92,bz*.55],[w*.44,bz],[0,bz*ridge],
    [-w*.44,bz],[-w*.92,bz*.55],[-w,.18*fz],[-w*.52,fz*.82]];
   const spine=[
    [[0,0,-.35*sc],[0,1,0],bodySec(2.15*sc,1.45*sc,-1.65*sc,1.08,1.15)],
    [[0,2.2*sc,-.25*sc],[0,1,.08],bodySec(1.58*sc,1.18*sc,-1.28*sc,1.18,1.22)],
    [[0,4.8*sc,.22*sc],[0,1,.24],bodySec(2.12*sc,1.52*sc,-1.35*sc,1.22,1.28)],
    [[0,7.4*sc,.95*sc],[0,1,.34],bodySec(2.72*sc,1.78*sc,-1.42*sc,1.15,1.32)],
    [[0,9.2*sc,1.55*sc],[0,1,.46],bodySec(1.95*sc,1.35*sc,-1.18*sc,1.1,1.25)],
    [[0,11.4*sc,2.45*sc],[0,1,.52],bodySec(1.08*sc,.92*sc,-.95*sc,1.05,1.18)]];
   lksLoft('cyclo',spine.map(s=>lksRingAt(s[0],s[1],s[2])),stCol);
   /* Overlapping cast-bronze shoulder-carapace mantles (3 stepped plates per shoulder) */
   for(const s of [-1,1])for(let p=0;p<3;p++){const py=(6.6+.68*p)*sc,pz=(.65+.22*p)*sc,pw=(1.35-.14*p)*sc;
    WX(s*(1.95-.18*p)*sc,py,pz,s*.18,.24,-s*.36,()=>prism(p===1?'bronzeC':'stoneP',[[-pw,-.95*sc],[pw,-.85*sc],[pw*.82,.95*sc],[-pw*.82,.95*sc]],0,.26*sc,p===1?brCol:dkCol));}
   /* Sculpted thoracic stone-and-bronze rib-arcs wrapping the Watcher's chest + recessed leiwen sternum */
   for(let rb=0;rb<5;rb++){const ryB=(3.6+.82*rb)*sc,rzB=(.08+.16*rb)*sc,rw=(1.75+.16*rb)*sc;
    for(const s of [-1,1])lksLimb(rb%2?'bronzeC':'stoneP',[0,ryB-.18*sc,rzB+1.58*sc],[s*rw,ryB+.24*sc,rzB-.15*sc],.16*sc,.11*sc,rb%2?brCol:dkCol,1.35);}
   WX(0,5.2*sc,1.92*sc,0,.22,0,()=>lzLeiwen(2.2*sc,2.0*sc,{cell:.28,mk:'bronze',back:'lacq',eye:true}));
   /* Heavy segmented tail sweeping 250 deg round the plinth with bronze osteoderm scutes */
   if(janus.length===1||dir>0){
    const tCurve=t=>{const a=-.35+t*PI*1.42,r=(2.55+1.15*Math.sin(t*PI*.7))*sc*(1-.12*t);return [Math.sin(a)*r,(.85*(1-t)+.18)*sc,-.65*sc-Math.cos(a)*r*.92];};
    tube('stoneP',tCurve,t=>[.86*(1-.68*t)*sc,.64*(1-.62*t)*sc],18,6,dkCol,{caps:true});
    for(let k=1;k<=7;k++){const t=k/8,p=tCurve(t),p2=tCurve(Math.min(1,t+.05));
     lzHorn(p[0],p[1]+.35*(1-t)*sc,p[2],Math.atan2(p[0]-p2[0],p[2]-p2[2]),(.85-.45*t)*sc,.09*sc,{curl:.35,lean:.4,mk:'bronzeC',col:brCol,nt:5,ns:5});}}
   /* Sculpted articulated six-jointed arms & taloned hands */
   for(const s of [-1,1]){
    const sh=[s*2.52*sc,7.55*sc,1.12*sc],el=[s*2.38*sc,4.55*sc,1.62*sc],wr=v===2?[s*.78*sc,5.15*sc,2.68*sc]:[s*.65*sc,5.05*sc,2.42*sc];
    lksLimb('stoneP',sh,el,.52*sc,.38*sc,dkCol,1.3);
    lzHorn(el[0],el[1],el[2],s>0?PI-.3:PI+.3,.95*sc,.11*sc,{curl:.4,lean:.5,mk:'bronzeC',col:brCol,nt:5,ns:5});
    lksLimb('cyclo',el,wr,.38*sc,.28*sc,stCol,1.25);
    lksClaw('stoneP','bronzeC',wr,[-s*.85,-.18,.35],[0,1,.2],.95*sc,dkCol,brCol);}
   /* Variant 2 cradles a carved bronze whorl-sphere of fate between its taloned claws */
   if(v===2)lksWhorlSphere(0,5.15*sc,2.95*sc,.72*sc,{mk:'stoneP',col:P('jade'),brCol,eyes:true,glow:true});
   /*Variant 3 carries twin Bulwark shoulder-tusks */
   if(v===3)for(const s of [-1,1])lzHorn(s*2.35*sc,8.1*sc,1.1*sc,0,3.2*sc,.22*sc,{curl:.55,lean:.32,mk:'ivory',col:P('tusk'),nt:8,ns:6});
   /* Overhanging sculpted Shang taotie oracle head (pitched .22 rad so snout & glowing brow-eye loom straight at viewers) */
   WX(0,11.05*sc,2.35*sc,0,.22,0,()=>lksTaotieHead(1.16*sc,{mk:'cyclo',col:dkCol,brCol,hornMk:v===2?'ivory':'bronzeC',glow:true,sideGlow:v===0||v===3,hornL:3.2}));
   /* Nine (odd!) cast-bronze dorsal crest-blades sweeping down the arched spine */
   for(let i=0;i<9;i++){const u=i/8,ny=lerp(1.6,11.2,u)*sc,nz=lerp(-1.55,1.45,u)*sc-Math.sin(u*PI)*.38*sc;
    lzHorn(0,ny,nz,PI,(1.35+Math.sin(u*PI)*1.65)*sc,.16*sc,{curl:.36,lean:.42,mk:'bronzeC',col:brCol,nt:7,ns:5,flat:.55});}
   /* Variants 1 & 3 plant a colossal 15.6 m ceremonial Shang `ge` dagger-axe standard beside the Watcher */
   if((v===1||v===3)&&janus.length===1){
    lksLimb('bronzeC',[3.15,0,1.65],[3.15,15.2,1.65],.18,.13,P('bronze'),1.1);
    lksMesh('bronzeC',(tri,quad4)=>{
     const z0=1.65,th=.09;
     for(const f of [-1,1]){const zz=z0+f*th,A=[3.15,13.6,zz],B=[1.05,13.95,zz],C=[1.55,13.25,zz],D=[3.15,13.1,zz],E=[3.85,13.75,zz],F=[3.15,15.55,zz];
      if(f>0){quad4(D,C,B,A);tri(D,A,E);tri(A,F,E);}else{quad4(A,B,C,D);tri(E,A,D);tri(E,F,A);}}},P('verd'));}});}});

/* ---------------------------------------------------------------- 2. Phalanx of the Six Castes (sculpted 1.25^k frieze) */
defBuilding({key:'lk-statue-phalanx',name:'Phalanx of the Six Castes',seed:7726,caste:'all',cut:false,w:14,d:9,h:13.5,budget:90000,
 front:{x:0,z:4.5,yaw:0},tags:{types:['statue','civic'],wealth:'rich',role:'monument'},
 note:'six sculpted cowled Lizardman monoliths fused shoulder-to-shoulder in the exact 1.25x caste progression from Tender to Bulwark, leaning sideways at 75 degrees; each sculpted chest is split by its triangular caste portal and threaded by one twisted cast-bronze umbilical coil',
 build(o){const v=((o&&o.v)|0)%5,dir=v%2?-1:1,y0=lksPedestal(12.6,6.8,1.65,{col:v===2?P('jade'):P('verd')});
  const stCol=v===2?P('jade'):P('verd'),dkCol=P('basaltD'),brCol=P('bronze');
  let curX=-5.05*dir;
  const order=v===4?[1,3,5,6,4,2]:[1,2,3,4,5,6];
  const portalPts=[];
  for(let i=0;i<6;i++){const c=order[i],sc=Math.pow(1.25,c-1),fw=.88+.17*(c-1),fh=2.55*sc,fd=1.35+.18*(c-1);
   const x=curX+dir*fw*.5;curX+=dir*(fw+.15);
   const leanX=-dir*.13*fh,dh=Math.min(fh*.46,1.02*sc),dw=dh*.60;
   portalPts.push([x+leanX*(dh*.42/fh),y0+dh*.42,.12]);
   W(x,y0,0,0,()=>{
    const colHere=i%2?stCol:dkCol;
    /* Two sculpted flank-pillars leaning at 75 deg that frame the clean triangular caste void through the torso, fusing into a hunched shoulder-mantle above */
    for(const s of [-1,1]){
     const xOut=s*fw*.52,xInBot=s*dw*.52,xInApex=0;
     const R0=[[xInBot,-fd*.44],[xOut,-fd*.38],[xOut*1.06,fd*.36],[xInBot,fd*.46]];
     const R1=[[xInApex+leanX*(dh/fh),-fd*.40],[xOut*.98+leanX*(dh/fh),-fd*.34],[xOut*1.08+leanX*(dh/fh),fd*.42],[xInApex+leanX*(dh/fh),fd*.50]];
     if(s<0){R0.reverse();R1.reverse();}
     lksLoft('cyclo',[R0.map(p=>[p[0],0,p[1]]),R1.map(p=>[p[0],dh,p[1]])],colHere);
     /* Bronze portal jamb-lining on the triangular chest cut */
     lksLimb('bronzeC',[s*dw*.5,0,fd*.46],[leanX*(dh/fh),dh,fd*.50],.055*sc,.045*sc,brCol,1.2);}
    /* Sculpted upper thorax & hunched carapace mantle above the triangular void (`dh -> fh`) */
    const uSec=(w,fz,bz)=>[[0,fz*1.14],[w*.62,fz*.82],[w,0],[w*.78,bz],[0,bz*1.18],[-w*.78,bz],[-w,0],[-w*.62,fz*.82]];
    lksLoft('stoneP',[
     lksRingAt([leanX*(dh/fh),dh,.04],[-dir*.13,1,.08],uSec(fw*.54,fd*.48,-fd*.42)),
     lksRingAt([leanX*.82,lerp(dh,fh,.58),.16],[-dir*.13,1,.14],uSec(fw*.62,fd*.56,-fd*.46)),
     lksRingAt([leanX,fh,.26],[-dir*.13,1,.18],uSec(fw*.42,fd*.42,-fd*.38))],colHere);
    /* Folded sculpted forearms & claws below the shoulder mantle */
    for(const s of [-1,1]){
     const sh=[leanX*.82+s*fw*.58,lerp(dh,fh,.62),.18],wr=[leanX*(dh/fh)+s*fw*.16,dh+.12*sc,fd*.54];
     lksLimb('stoneP',sh,wr,.13*sc,.095*sc,dkCol,1.25);}
    /* Arched dorsal bronze crest-spines down the back of each caste figure */
    for(let sp=0;sp<5;sp++){const u=sp/4,sy=lerp(fh*.28,fh*.96,u);
     lzHorn(leanX*(sy/fh),sy,-fd*.44-.04,PI,(.38+.22*Math.sin(u*PI))*sc,.045*sc,{curl:.35,lean:.4,mk:'bronzeC',col:brCol,nt:5,ns:5});}
    /* Sculpted angular taotie head-cowl atop each caste figure (Interpreter c=5 gets glowing oculus & bronze halo) */
    WX(leanX,fh-.05,.28,0,.28,dir*.12,()=>lksTaotieHead(.32*sc,{mk:'cyclo',col:stCol,brCol,glow:c===5,hornMk:c>=5?'bronzeC':'stoneP',hornL:2.2}));
    if(c===5)ring('bronzeC',leanX,fh+.52*sc,.18,.68*sc,.045,P('verd'),0,.25,dir*.12,20);});}
  /* Twisted double-strand cast-bronze umbilical coil threading continuously through all six triangular chest voids */
  for(const st of [-1,1]){
   tube('bronzeC',t=>{const u=t*(portalPts.length-1),i=Math.min(portalPts.length-2,Math.floor(u)),f=u-i;
    const a=portalPts[i],b=portalPts[i+1],ang=t*TAU*5+st*PI;
    return [lerp(a[0],b[0],f),lerp(a[1],b[1],f)+Math.sin(ang)*.11,lerp(a[2],b[2],f)+Math.cos(ang)*.11];},
    t=>[.068,.068],28,6,brCol,{caps:true});}}});

/* ---------------------------------------------------------------- 3. The Silent Concert (5 hunched Interpreters & Rift disc) */
defBuilding({key:'lk-statue-conclave',name:'The Silent Concert',seed:7731,caste:'all',cut:false,w:13,d:13,h:14.0,budget:95000,
 front:{x:0,z:6.5,yaw:0},tags:{types:['statue','civic','religious'],wealth:'rich',role:'monument'},
 note:'five gaunt, faceless Interpreter monoliths arranged in an open crescent-pentagon and leaning inward in silent concert; clearly visible between their bowed horned skulls levitates a cast-bronze relief disc of the Rift veiled in shimmering thought-planes',
 build(o){const v=((o&&o.v)|0)%5,y0=lksPedestal(11.2,11.2,1.75,{col:v===3?P('jade'):P('verd')});
  const stCol=v===3?P('jade'):P('verd'),dkCol=P('basaltD'),brCol=P('bronze');
  /* Central levitating cast-bronze topographic relief disc of the Rift & Great Coil on curved bronze ley-arcs */
  const discY=y0+5.35;
  for(let k=0;k<3;k++){const a=k*TAU/3+.52;
   tube('bronzeC',t=>{const r=lerp(2.75,.35,t),yy=y0+Math.sin(t*PI*.68)*5.35;return [Math.cos(a+t*.55)*r,yy,Math.sin(a+t*.55)*r];},
    t=>[.13*(1-.35*t),.09*(1-.3*t)],14,5,brCol,{caps:true});}
  WX(0,discY,0,v*.4,.28,.12,()=>{
   cyl('bronzeC',0,-.14,0,1.95,.24,brCol,20);ring('cyclo',0,0,0,2.04,.12,P('verd'),0,0,0,24);
   for(let r=0;r<4;r++)ring('bronzeC',.12*(r-1.5),.11,-.08*r,1.60-.34*r,.05,P('verd'),0,0,0,20);
   WX(0,.15,0,0,-PI/2,0,()=>lzEye(0,0,0,0,.52,{mk:'bronze',glow:true}));});
  /* Five (odd!) gaunt, tall, hunched Interpreter monoliths spaced wider on the +z side so the Rift disc commands the front view */
  const angs=[-.76*PI,-.38*PI,0,.38*PI,.76*PI].map(a=>a-PI/2+v*.18);
  for(let i=0;i<5;i++){
   const a=angs[i],rad=3.95+(i===2?-.15:.15),fh=7.8+Math.abs(2-i)*.45+(i===2?1.35:0);
   const fx=Math.cos(a)*rad,fz=Math.sin(a)*rad,faceYaw=Math.atan2(-fx,-fz);
   W(fx,y0,fz,faceYaw,()=>{
    const rSec=(w,fz0,bz0)=>[[0,fz0*1.15],[w*.62,fz0*.78],[w,0],[w*.75,bz0],[0,bz0*1.22],[-w*.75,bz0],[-w,0],[-w*.62,fz0*.78]];
    lksLoft(i%2?'stoneP':'cyclo',[
     lksRingAt([0,0,0],[0,1,0],rSec(1.12,1.0,-1.08)),
     lksRingAt([0,fh*.38,.16],[0,1,.12],rSec(.74,.68,-.78)),
     lksRingAt([0,fh*.74,.68],[0,1,.28],rSec(1.08,.88,-.86)),
     lksRingAt([0,fh*.94,1.18],[0,1,.42],rSec(.56,.54,-.58))],i%2?dkCol:stCol);
    /* Bronze dorsal spine-scutes down every Interpreter's arched back so outer silhouettes read richly */
    for(let sp=0;sp<5;sp++){const u=sp/4,sy=lerp(fh*.24,fh*.90,u),sz=lerp(-.96,-.22,u);
     lzHorn(0,sy,sz,PI,.68+.35*Math.sin(u*PI),.075,{curl:.38,lean:.42,mk:'bronzeC',col:brCol,nt:5,ns:5});}
    /* Raised four-taloned hands held palms-inward toward the floating Rift disc */
    for(const s of [-1,1]){
     const sh=[s*.94,fh*.72,.64],el=[s*.84,fh*.52,1.18],wr=[s*.44,fh*.58,1.72];
     lksLimb('stoneP',sh,el,.21,.15,dkCol,1.2);lksLimb('cyclo',el,wr,.15,.11,stCol,1.2);
     lksClaw('stoneP','bronzeC',wr,[-s*.25,.35,.85],[s,0,-.2],.46,dkCol,brCol);}
    WX(0,fh*.92,1.16,0,.38,0,()=>lksTaotieHead(.56,{mk:'cyclo',col:dkCol,brCol,glow:true,hornL:3.4}));
    if(MAT.lrShim)poly('lrShim',[[0,fh*.96,1.45],[-.28,fh*.64,1.55],[0,discY-y0,rad-.4]],P('glowC'),true);});}}});

/* ---------------------------------------------------------------- 4. The Husk and the Return (pathogenic rebirth monument) */
defBuilding({key:'lk-statue-rebirth',name:'The Husk and the Return',seed:7732,caste:'all',cut:false,w:11,d:11,h:15.5,budget:95000,
 front:{x:0,z:5.5,yaw:0},tags:{types:['statue','religious','civic'],wealth:'rich',role:'monument'},
 note:'monument to the Lizardmen\'s pathogenic return (LORE 6.20): five thick, jagged cyclopean outer host-shell shards split violently apart along a spiral seam around an oxblood-and-bronze vortex, while a sleek jade-and-bronze reborn colossus ascends from the cleft with crossed taloned arms',
 build(o){const v=((o&&o.v)|0)%5,chir=v%2?-1:1,y0=lksPedestal(9.2,9.2,1.7,{col:P('basalt')});
  const huskCol=P('basaltD'),inCol=P('oxblood'),jadeCol=v===1?P('verd'):P('jade'),brCol=P('bronze');
  /* Five (odd!) thick, chiseled curved cyclopean host-husk valves (`lksLoft` solid slabs, not paper-thin sheets!) peeling open in a spiral */
  for(let k=0;k<5;k++){
   const baseA=k*TAU/5+.38*chir+v*.22,hValve=5.2+(k%3)*.85;
   const valveRings=[];
   for(let st=0;st<=4;st++){const vv=st/4,a=baseA+vv*.36*chir,rIn=1.18+vv*1.35,th=.48*(1-.42*vv),hw=(.98-.32*vv);
    const ca=Math.cos(a),sa=Math.sin(a),tx=-sa,tz=ca;
    const pts=[
     [ca*rIn-tx*hw,y0+vv*hValve,sa*rIn-tz*hw],
     [ca*(rIn+th)-tx*hw*.92,y0+vv*hValve,sa*(rIn+th)-tz*hw*.92],
     [ca*(rIn+th*1.18),y0+vv*hValve+.08,sa*(rIn+th*1.18)],
     [ca*(rIn+th)+tx*hw*.92,y0+vv*hValve,sa*(rIn+th)+tz*hw*.92],
     [ca*rIn+tx*hw,y0+vv*hValve,sa*rIn+tz*hw],
     [ca*(rIn-.06),y0+vv*hValve-.04,sa*(rIn-.06)]];
    valveRings.push(pts);}
   lksLoft('cyclo',valveRings,k%2?huskCol:P('basalt'));
   /* Oxblood-lacquer inner membrane seam & fossilized bone ribs bursting from each split valve edge */
   const mA=baseA+.18*chir;
   lksLimb('lacqR',[Math.cos(baseA)*1.18,y0+.3,Math.sin(baseA)*1.18],[Math.cos(mA)*2.42,y0+hValve*.92,Math.sin(mA)*2.42],.22,.09,inCol,1.3);
   lzHorn(Math.cos(mA)*2.15,y0+hValve*.68,Math.sin(mA)*2.15,mA+PI/2,1.65,.12,{curl:.62,lean:.42,mk:'bones',col:P('boneO'),nt:6,ns:5});}
  /* Coiling bronze emergence-umbilical swirling up out of the split husk cavity */
  tube('bronzeC',t=>{const a=t*TAU*1.8*chir,r=lerp(1.35,.55,t);return [Math.cos(a)*r,y0+.4+t*5.2,Math.sin(a)*r];},t=>[.18*(1-.4*t),.14*(1-.4*t)],20,6,brCol,{caps:true});
  /* Sleek, luminous reborn jade-and-bronze colossus rising vertically from the split chasm (`y0+1.2 -> y0+12.8`) */
  const ascSec=(w,fz,bz)=>[[0,fz*1.22],[w*.55,fz*.75],[w,0],[w*.72,bz],[0,bz*1.28],[-w*.72,bz],[-w,0],[-w*.55,fz*.75]];
  lksLoft(v%2?'bronzeC':'stoneP',[
   lksRingAt([0,y0+.8,0],[0,1,0],ascSec(.68,.65,-.68)),
   lksRingAt([0,y0+3.8,.08],[0,1,.05],ascSec(.86,.82,-.86)),
   lksRingAt([0,y0+6.9,.22],[0,1,.08],ascSec(1.52,1.14,-1.02)),
   lksRingAt([0,y0+9.5,.34],[0,1,.06],ascSec(1.02,.88,-.84)),
   lksRingAt([0,y0+10.85,.38],[0,1,0],ascSec(.56,.56,-.58))],jadeCol);
  /* Swept cast-bronze dorsal wing-blades unfurling behind the reborn shoulders + crossed taloned forearms over the sternum */
  for(const s of [-1,1]){
   for(let w=0;w<3;w++)lzHorn(s*1.28,y0+7.2+.55*w,-.15,s>0?-PI/2-.28:PI/2+.28,2.6-.35*w,.16,{curl:.48,lean:.22+.14*w,mk:'bronzeC',col:brCol,nt:7,ns:5,flat:.55});
   const sh=[s*1.42,y0+8.6,.28],el=[s*1.58,y0+6.6,.78],wr=[-s*.35,y0+7.6,1.22];
   lksLimb('stoneP',sh,el,.28,.21,jadeCol,1.3);lksLimb('bronzeC',el,wr,.21,.15,brCol,1.3);
   lksClaw('bronzeC','bronzeC',wr,[-s*.55,.55,.35],[0,1,0],.62,brCol,P('verd'));}
  /* Lifted reborn oracle head crowned with 7 radiating bronze spines */
  WX(0,y0+10.75,.38,0,.06,0,()=>{
   lksTaotieHead(.78,{mk:'cyclo',col:jadeCol,brCol,glow:true,sideGlow:true,hornL:3.0});
   for(let k=0;k<7;k++){const a=-PI*.42+k/6*PI*.84;
    lksLimb('bronzeC',[Math.sin(a)*.55,1.85,-.18],[Math.sin(a)*1.85,3.05+Math.cos(a)*.55,-.42],.075,.022,P('verd'),1.2);}});}});

/* ================================================================ B. REPRESENTATIVE OF THE COIL */

/* ---------------------------------------------------------------- 5. Monument of the Fractured Coil (3D bevelled leiwen knot) */
defBuilding({key:'lk-colossus-coil',name:'Monument of the Fractured Coil',seed:7727,caste:'all',cut:false,w:14,d:14,h:18.0,budget:95000,
 front:{x:0,z:7,yaw:0},tags:{types:['statue','civic','religious'],wealth:'rich',role:'monument'},
 note:'a colossal 18 m cantilevered three-dimensional squared spiral (leiwen) of bevelled verdigris-stone and cast-bronze girders mitred at 75 and 105 degree angles around a carved whorl-sphere; at its upper turn one girder is violently severed in mid-air — the Phase Inversion',
 build(o){const v=((o&&o.v)|0)%5,chir=v%2?-1:1,y0=lksPedestal(11.4,11.4,2.05,{col:v===1?P('basalt'):P('verd')});
  const stCol=v===1?P('basaltD'):v===3?P('jade'):P('verd'),brCol=P('bronze');
  /* Three (odd!) battered skew buttress-piers anchoring the cantilevered spiral */
  for(let p=0;p<3;p++){const a=p*TAU/3+.26*chir,px=Math.cos(a)*3.55,pz=Math.sin(a)*3.55,ph=4.6+p*.7;
   W(px,y0,pz,-a+.26*chir,()=>{
    const Tp=lzBatterRoom(2.0,2.3,0,ph,'cyclo',P('basaltD'),{lean:{front:.07,back:-.04,left:-.06,right:.06},inner:false});
    lzSlab(Tp.T,ph,.26,'stoneP',stCol,.12);});}
  /* 13 cantilevered 75/105 deg bevelled rectangular stone-and-bronze girders winding upward & inward */
  const pts=[];let curR=4.65,curY=y0+2.1;
  for(let k=0;k<=13;k++){const a=(k*PI/2+.2618*(k%2))*chir;pts.push([Math.cos(a)*curR,curY,Math.sin(a)*curR]);
   if(k%2===1)curR*=.855;curY+=1.0;}
  for(let k=0;k<pts.length-1;k++){const a=pts[k],b=pts[k+1],gw=1.08-.038*k,gh=.96-.034*k;
   if(k===10){
    /* The deliberate Phase Inversion Fracture: oxblood-lacquered severed girder ends, floating shard & 5 bronze tension filaments */
    const m1=[lerp(a[0],b[0],.30),lerp(a[1],b[1],.30),lerp(a[2],b[2],.30)];
    const m2=[lerp(a[0],b[0],.74),lerp(a[1],b[1],.74),lerp(a[2],b[2],.74)];
    lksGirder('cyclo',a,m1,gw,gh,P('oxblood'),brCol);
    lksGirder('cyclo',m2,b,gw,gh,stCol,brCol);
    const mid=[(m1[0]+m2[0])/2,(m1[1]+m2[1])/2+.14,(m1[2]+m2[2])/2];
    box('lacqR',mid[0],mid[1]-.16,mid[2],.34,.32,.28,P('oxblood'),.5,.3,.2);
    for(let f=-2;f<=2;f++)beam('bronzeC',[m1[0],m1[1]+f*.09,m1[2]],[m2[0],m2[1]-f*.09,m2[2]],.028,P('verd'),true,5);
    if(MAT.lrShim)poly('lrShim',[[m1[0],m1[1]+.42,m1[2]],[m2[0],m2[1]+.42,m2[2]],[mid[0],mid[1]-.55,mid[2]]],P('glowC'),true);
   }else{
    lksGirder(k%4===0?'bronzeC':'stoneP',a,b,gw,gh,k%4===0?brCol:stCol,k%4===0?P('verd'):brCol);
    /* Mitred cast-bronze corner clamp-box with spiral boss at every 75/105 deg turn */
    W(b[0],b[1]-gh*.56,b[2],(k*PI/2+.26)*chir,()=>{
     box('bronzeC',0,0,0,gw*1.18,gh*1.12,gw*1.18,P('verd'));
     if(k%3===0)lzEye(0,gh*.56,gw*.60,0,gh*.32,{mk:'bronze'});});}}
  /* Suspended carved whorl-sphere (DESIGN 2.3a: round whorl inside the squared built spiral) */
  const cy=y0+8.5;
  lksWhorlSphere(0,cy,0,1.72,{mk:'stoneP',col:P('jade'),brCol,eyes:true,glow:true});
  for(let r=0;r<3;r++)ring('bronzeC',0,cy,0,2.15+.14*r,.055,P('verd'),r*1.05,.52+r*.42,0,24);
  for(let p=0;p<3;p++){const a=p*TAU/3+.26*chir;
   beam('bronzeC',[Math.cos(a)*3.55,y0+4.6+p*.7,Math.sin(a)*3.55],[0,cy,0],.065,brCol,true,6);}}});

/* ---------------------------------------------------------------- 6. Twin Serpents of Recurrence (articulated double helix) */
defBuilding({key:'lk-statue-ouroboros',name:'Twin Serpents of Recurrence',seed:7728,caste:'all',cut:false,w:11,d:11,h:15.5,budget:95000,
 front:{x:0,z:5.5,yaw:0},tags:{types:['statue','civic'],wealth:'rich',role:'monument'},
 note:'two scale-plated, dorsal-spined archaic serpents of verdigris stone and cast bronze (clockwise cause, counter-clockwise memory) pinching narrow at the waist and flaring wide overhead into twin Shang taotie jaws around seven clapperless bianzhong bells',
 build(o){const v=((o&&o.v)|0)%5,y0=lksPedestal(8.8,8.8,1.75,{col:v===2?P('jade'):P('verd')}),H=11.6;
  for(const sg of [-1,1]){
   const mk=sg>0?'stoneP':'bronzeC',col=sg>0?P(v===2?'jade':'verd'):P(v%2?'bronze':'verd'),finCol=sg>0?P('bronze'):P('verd');
   const cFn=t=>{const a=sg*(t*TAU*1.42+(sg<0?PI:0)),rad=2.55*(1-.46*Math.sin(t*PI*.82))+.92*t*t;
    return [Math.cos(a)*rad,y0+.35+t*H,Math.sin(a)*rad];};
   /* Hexagonal-keeled segmented serpent body */
   tube(mk,cFn,t=>{const w=.54-.12*Math.sin(t*PI)+.16*t;return [w,w*1.18];},32,6,col,{caps:true});
   /* Rhythmic dorsal osteoderm scute-horns along the outer curve */
   for(let i=2;i<=18;i+=2){const t=i/20,p=cFn(t),a=Math.atan2(p[0],p[2]);
    lzHorn(p[0],p[1],p[2],a,.95+.45*t,.095,{curl:.52,lean:.34,mk:'bronzeC',col:finCol,nt:5,ns:5});}
   /* Flared archaic Shang taotie serpent-head at the top crown (`t = 1`), biting inward toward its twin's tail-coil! */
   const topP=cFn(1),prevP=cFn(.94),yaw=Math.atan2(topP[0]-prevP[0],topP[2]-prevP[2]);
   WX(topP[0],topP[1]-.45,topP[2],yaw,.32,sg*.18,()=>lksTaotieHead(.64,{mk,col,brCol:finCol,glow:sg>0,hornL:2.4}));}
  /* Central vertical black-lacquer spine suspending 7 clapperless Shang bianzhong bells & spiral eyes */
  lksLimb('lacq',[0,y0,0],[0,y0+H+1.2,0],.28,.18,P('lacq'),1.15);
  for(let k=0;k<7;k++){const ey=y0+1.55+k*1.58,rRing=.82+.09*k;
   ring('bronzeC',0,ey,0,rRing,.055,P('verd'),k*.48,0,0,18);
   if(k%2===0)lksBianzhong((k===2?-1:1)*rRing*.72,ey-.06,0,.68,.22,{ry:k*.8});
   lzEye(0,ey,.20,0,.28,{mk:'bronze',glow:k===6});lzEye(0,ey,-.20,PI,.28,{mk:'bronze'});}}});

/* ---------------------------------------------------------------- 7. The Astrolabe of Recurrence (eccentric nested bi-discs) */
defBuilding({key:'lk-statue-gyre',name:'The Astrolabe of Recurrence',seed:7733,caste:'all',cut:false,w:13,d:13,h:16.5,budget:95000,
 front:{x:0,z:6.5,yaw:0},tags:{types:['statue','civic','religious'],wealth:'rich',role:'monument'},
 note:'five monumental nested Shang bi-discs of verdigris jade-stone and cast bronze whose centres deliberately differ (the reliquary\'s eccentric rings built to civic scale), tilted at 75 and 105 degrees inside a cradle of three cyclopean stone tusks',
 build(o){const v=((o&&o.v)|0)%5,y0=lksPedestal(10.6,10.6,1.8,{col:P('verd')});
  const stCol=v===1?P('jade'):P('verd'),dkCol=P('basaltD'),brCol=P('bronze');
  const cy=y0+7.8;
  /* Three (odd!) colossal curved stone tusk-piers cradling the nested gyre from below */
  for(let k=0;k<3;k++){const a=k*TAU/3+v*.22;
   W(Math.cos(a)*3.85,y0,Math.sin(a)*3.85,a+PI,()=>{
    lzHorn(0,0,0,0,9.4,.72,{curl:.58,lean:.14,mk:k===0?'stoneP':'cyclo',col:k===0?dkCol:stCol,nt:12,ns:6,flat:.78});
    lzHorn(0,.4,-.35,PI,3.2,.24,{curl:.45,lean:.38,mk:'bronzeC',col:brCol,nt:6,ns:5});});}
  /* Five colossal flat bevelled *bi*-rings (`sector` discs) with DIFFERENT centres and 75/105 deg tilts */
  const specs=[
   [4.45,3.55,.28,[0,0,0],[.2618,0,.2618],'cyclo',stCol],
   [3.42,2.68,.24,[.28,-.18,.22],[-.2618,.52,-.2618],'bronzeC',brCol],
   [2.56,1.95,.22,[-.24,.26,-.18],[.52,-.34,.2618],'stoneP',P('jade')],
   [1.82,1.34,.19,[.19,.12,-.25],[-.44,.88,-.32],'bronzeC',P('verd')],
   [1.18,.78,.17,[-.14,-.16,.15],[.32,-.52,.64],'lacqR',P('oxblood')]];
  specs.forEach((sp,idx)=>{const [r1,r0,th,off,rot,mk,col]=sp;
   WX(off[0],cy+off[1],off[2],rot[1]+v*.35,rot[0],rot[2],()=>{
    sector(mk,0,0,r0,r1,0,TAU,-th/2,th/2,col,28);
    ring('bronzeC',0,0,0,r1+.03,.045,brCol,0,0,0,28);
    ring('bronzeC',0,0,0,r0-.02,.04,P('verd'),0,0,0,24);
    /* NotchedShang `yazhang` serrations (7 teeth, odd!) around the outer rim of each bi-disc */
    for(let t=0;t<7;t++){const a=t*TAU/7+idx*.4;
     W(Math.cos(a)*r1,0,Math.sin(a)*r1,-a+PI/2,()=>box('bronzeC',0,-.11,0,.26,.22,.32,brCol));}});});
  /* Eccentric levitating whorl-core + 50.6 deg bronze gnomon needle piercing the gyre */
  lksWhorlSphere(-.08,cy+.06,.08,.62,{mk:'bronzeC',col:brCol,brCol:P('verd'),eyes:true,glow:true});
  beam('bronzeC',[-2.85,y0+2.2,-2.35],[2.85,cy+5.8,2.35],.085,brCol,true,8);}});

/* ---------------------------------------------------------------- 8. The Bound Retroactive Stele (17.5 m chained chronicle) */
defBuilding({key:'lk-statue-chronicle',name:'The Bound Retroactive Stele',seed:7734,caste:'all',cut:false,w:10,d:10,h:17.5,budget:90000,
 front:{x:0,z:5,yaw:0},tags:{types:['statue','religious','civic'],wealth:'rich',role:'monument'},
 note:'a towering 17.5 m twisted hexagonal basalt-and-jade chronicle pillar whose spiral glyphs changed meaning retroactively (DESIGN 2.4): its middle courses are sealed behind petrified reed-mat shrouds and bound in heavy cast-bronze chains, crowned by three horned taotie masks',
 build(o){const v=((o&&o.v)|0)%5,chir=v%2?-1:1,y0=lksPedestal(8.2,8.2,1.65,{col:P('basalt')});
  const stCol=v===2?P('jade'):P('verd'),dkCol=P('basaltD'),brCol=P('bronze');
  const H=13.2,N=15;
  /* 15-course twisted hexagonal/bevelled pillar tapering from r=1.55 m to r=0.92 m */
  const rings=[];
  for(let i=0;i<=N;i++){const u=i/N,r=lerp(1.52,.92,u),tw=u*1.15*chir,prof=[];
   for(let j=0;j<6;j++){const a=j/6*TAU+tw,fl=(j%2===0?1.12:.92);prof.push([Math.sin(a)*r*fl,y0+u*H,Math.cos(a)*r*fl]);}
   rings.push(prof);}
  lksLoft('cyclo',rings,stCol);
  /* Exposed lower & upper glyph-spiral bronze columns (readable both upward and downward) */
  for(let k=0;k<3;k++){const a=k*TAU/3;
   W(0,y0+.5,0,a,()=>W(0,0,1.42,0,()=>lzGlyphSpiral(1.05,3.2,{mk:'bronze',mirror:k%2===1,turns:3})));
   W(0,y0+9.4,0,a+.85*chir,()=>W(0,0,1.06,0,()=>lzGlyphSpiral(.82,2.8,{mk:'bronze',mirror:k%2===0,turns:2})));}
  /* Retroactive censorship shroud (`y0+4.0 .. y0+9.0`): curved petrified mat/hide shroud + bronze clamp-collars & sagging bronze chains */
  withCloth(clothHang(.5,.02),()=>{
   psurf('matW',(u,vv)=>{const a=u*TAU,yy=y0+3.9+vv*5.1,r=lerp(1.42,1.15,vv)+.08*Math.sin(vv*PI*3);
    return [Math.cos(a)*r,yy,Math.sin(a)*r];},18,8,P('reedD'),{flip:true});});
  for(const by of [4.1,5.6,7.2,8.8]){const rr0=lerp(1.46,1.16,(by-3.9)/5.2);
   ring('bronzeC',0,y0+by,0,rr0+.05,.075,brCol,0,.08*chir,0,18);}
  /* Three heavy cast-bronze anchor chains stretched taut from the middle collar down to bronze rings on the plinth! */
  for(let c=0;c<3;c++){const a=c*TAU/3+.52,topA=[Math.cos(a)*1.32,y0+7.2,Math.sin(a)*1.32],botA=[Math.cos(a)*3.15,y0+.08,Math.sin(a)*3.15];
   sagRope('bronzeC',topA,botA,.38,.065,P('verd'),9);
   ring('bronzeC',botA[0],botA[1]+.12,botA[2],.24,.055,brCol,a,PI/3,0,12);}
  /* Fallen face-down stela fragment resting on two stone blocks at the foot ("texts the high castes refuse to read") */
  W(-2.1,y0,2.2,.26,()=>lzStela(0,0,0,2.8,.85,{turned:true,mk:'stoneP',col:dkCol}));
  /* Crown capital at `y0+H`: three outward-staring horned taotie masks under a pointed bronze spire */
  for(let k=0;k<3;k++)WX(0,y0+H-.35,0,k*TAU/3+.9*chir,.18,0,()=>W(0,0,.62,0,()=>lksTaotieHead(.48,{mk:'stoneP',col:dkCol,brCol,glow:k===0,hornL:2.3})));
  cone('bronzeC',0,y0+H+.95,0,.68,1.55,brCol,6);}});

/* ================================================================ C. STRANGE THINGS ONLY THEY COULD UNDERSTAND */

/* ---------------------------------------------------------------- 9. The Sheared Manifold (sliced 75/105 deg rhombic strata) */
defBuilding({key:'lk-statue-manifold',name:'The Sheared Manifold',seed:7729,caste:'all',cut:false,w:13,d:13,h:17.0,budget:95000,
 front:{x:0,z:6.5,yaw:0},tags:{types:['statue','civic','religious'],wealth:'rich',role:'monument'},
 note:'a spacetime-anomaly monolith only the Lizardmen comprehend: seven razor-edged 75/105 degree rhombic strata of verdigris stone and oxblood lacquer sheared laterally into impossible mid-air cantilevers, with shimmer clefts, upside-down stairs beneath the overhangs and whorl-spheres emerging through flat stone',
 build(o){const v=((o&&o.v)|0)%5,chir=v%2?-1:1,y0=lksPedestal(10.2,10.2,1.75,{col:v===1?P('jade'):P('verd')});
  let ox=0,oz=0;
  /* Skew 75/105 deg chamfered parallelogram footprint helper */
  const rhomb=(w,d)=>{const skw=d*.268,hw=w/2,hd=d/2;
   return [[-hw-skw,-hd],[hw-skw,-hd],[hw+skw,hd],[-hw+skw,hd]];};
  for(let i=0;i<7;i++){
   const sh=1.78,sy=y0+i*(sh+.22),sw=4.8-.18*i,sd=4.2-.15*i;
   if(i>=1){const a=(i*1.35+.35)*chir,step=(i===3||i===4)?1.45:.82;
    ox=clamp(ox+Math.cos(a)*step,-2.35,2.35);oz=clamp(oz+Math.sin(a)*step,-2.35,2.35);}
   W(ox,sy,oz,i*.13*chir,()=>{
    const mk=i===3?'lacqR':i%2?'stoneP':'cyclo',col=i===3?P('oxblood'):P(v===1?'jade':i%2?'verd':'basaltD');
    const B=rhomb(sw,sd),T=rhomb(sw-.18,sd-.14);
    lksLoft(mk,[B.map(p=>[p[0],0,p[1]]),T.map(p=>[p[0],sh,p[1]])],col);
    /* Razor-thin cast-bronze shear-plate & spacetime shimmer sheet in the 22 cm levitation gap */
    prism('bronzeC',rhomb(sw+.10,sd+.10),sh-.07,sh+.02,P('bronze'));
    if(i>0){
     for(const px of [-.85,.85])cyl('bronzeC',px,-.22,0,.13,.24,P('bronze'),6);
     if(MAT.lrShim)poly('lrShim',[[-sw*.45,-.11,-sd*.4],[sw*.45,-.11,-sd*.4],[sw*.45,-.11,sd*.4],[-sw*.45,-.11,sd*.4]],P('glowC'),true);}
    /* Upside-down stepped ziggurat staircases descending into empty air from the cantilevered undersides! */
    if(i===2||i===4||i===5){
     for(let st=0;st<6;st++)box('stoneP',-sw*.34+st*.34,-(st+1)*.15,sd*.18,.34,(st+1)*.15,1.05,P('basaltD'));}
    /* Carved whorl-spheres half-emerging right through flat vertical stone walls */
    if(i===1||i===4)lksWhorlSphere(0,sh*.52,sd*.50,.58,{mk:'bronzeC',col:P('verd'),brCol:P('bronze'),eyes:false});
    if(i===6){
     for(const q of [0,PI/2,PI,-PI/2])W(0,sh*.54,0,q,()=>lzEye(0,0,sd*.48,0,.40,{mk:'bronze',glow:true}));
     for(let h=0;h<5;h++){const a2=h*TAU/5;lzHorn(Math.cos(a2)*1.35,sh,Math.sin(a2)*1.35,a2,1.95,.12,{curl:.62,lean:.28,mk:'bronzeC',col:P('verd'),nt:6,ns:5});}}});}
  /* Diagonal 50.6 deg bronze ley-spear piercing clean through all 7 displaced strata */
  beam('bronzeC',[-2.95,y0+.3,-2.4],[2.85,y0+14.1,2.35],.10,P('bronze'),true,8);}});

/* ---------------------------------------------------------------- 10. The Impossible Tusk-Frame (faceted eyed polyhedron) */
defBuilding({key:'lk-statue-paradox',name:'The Impossible Tusk-Frame',seed:7730,caste:'all',cut:false,w:12,d:12,h:16.0,budget:95000,
 front:{x:0,z:6,yaw:0},tags:{types:['statue','civic','religious'],wealth:'rich',role:'monument'},
 note:'a chiseled faceted inverted polyhedron poised on a narrow cast-bronze needle-point and flaring wide overhead, studded with sunken spiral eyes and inward-curling horns, pierced clean through by three skew 75/105 degree bevelled stone-and-bronze frames',
 build(o){const v=((o&&o.v)|0)%5,y0=lksPedestal(9.4,9.4,1.75,{col:P('verd')});
  const stCol=v===3?P('jade'):P('verd'),dkCol=P('basaltD'),brCol=P('bronze');
  /* Central faceted 8-planed asymmetric top-heavy monolith poised on a narrow bronze needle-cone */
  W(0,y0,0,.34+v*.2,()=>{
   cyl('bronzeC',0,0,0,.62,.45,brCol,8,.20);cyl('bronzeC',0,.40,0,.06,1.05,P('verd'),8,.30);
   const octR=(rx,rz,tw)=>{const out=[];for(let j=0;j<8;j++){const a=j/8*TAU+tw,k=(j%2===0?1.08:.88);out.push([Math.sin(a)*rx*k,Math.cos(a)*rz*k]);}return out;};
   lksLoft('cyclo',[
    octR(.28,.28,0).map(p=>[p[0],1.35,p[1]]),
    octR(1.15,1.05,.18).map(p=>[p[0],4.2,p[1]]),
    octR(2.58,2.38,.36).map(p=>[p[0],8.8,p[1]]),
    octR(2.15,2.02,.52).map(p=>[p[0],11.1,p[1]]),
    octR(.85,.82,.65).map(p=>[p[0],11.85,p[1]])],stCol);
   /* Bronze equatorial & shoulder girdle-bands */
   ring('bronzeC',0,8.8,0,2.52,.075,brCol,.36,0,0,8);
   /* Cluster of 7 (odd!) asymmetric spiral eyes staring downward from the overhanging facets */
   const eyeSpecs=[[0,8.4,2.45,.54,true],[.78,6.8,1.92,.34,false],[1.57,9.1,2.35,.46,false],[2.42,7.8,2.22,.48,true],
    [3.18,9.4,2.28,.36,false],[4.12,7.2,2.05,.38,false],[5.08,8.9,2.38,.44,true]];
   for(const [ang,ey,er0,sz,gl] of eyeSpecs){
    W(0,0,0,ang,()=>WX(0,ey,er0,.24,0,0,()=>lzEye(0,0,0,0,sz,{mk:'bronze',glow:gl})));}
   /* Seven horns curling INWARD over the top rim toward a dark central abyss */
   for(let i=0;i<7;i++){const a=i*TAU/7;
    lzHorn(Math.cos(a)*1.95,11.35,Math.sin(a)*1.95,Math.atan2(-Math.cos(a),-Math.sin(a)),2.05,.13,{curl:.74,lean:.36,mk:v%2?'ivory':'bronzeC',col:P(v%2?'tusk':'verd'),nt:7,ns:5});}});
  /* Three giant interpenetrating bevelled triangular portals (at 0, 105 and 210 deg) slicing right through the inverted mass */
  for(let k=0;k<3;k++){const ry=k*1.8326+v*.28,fh=12.8-.85*k,fw=6.6-.45*k;
   W(0,y0,0,ry,()=>{
    const gCol=k===1?brCol:dkCol,inCol=k===1?P('verd'):brCol;
    lksGirder(k===1?'bronzeC':'stoneP',[-fw/2,0,0],[0,fh,0],.48,.44,gCol,inCol);
    lksGirder(k===1?'bronzeC':'stoneP',[fw/2,0,0],[0,fh,0],.48,.44,gCol,inCol);
    lksGirder('bronzeC',[-fw*.36,fh*.26,0],[fw*.36,fh*.26,0],.34,.32,P('verd'),brCol);
    if(MAT.lrShim&&k===0)poly('lrShim',[[-fw*.34,fh*.28,0],[fw*.34,fh*.28,0],[0,fh-.35,0]],P('glowC'),true);});}}});

/* ---------------------------------------------------------------- 11. The Hyper-Rhombic Reliquary Cage (4D tesseract + relics) */
defBuilding({key:'lk-statue-tesseract',name:'The Hyper-Rhombic Cage',seed:7735,caste:'all',cut:false,w:13,d:13,h:16.0,budget:95000,
 front:{x:0,z:6.5,yaw:0},tags:{types:['statue','religious','civic'],wealth:'rich',role:'monument'},
 note:'a four-dimensional projected hyper-rhombohedron of verdigris stone (every angle 75 or 105 degrees, never 90) tethering a counter-rotated inner bronze cage in mid-air; suspended inside are giant versions of the reliquary\'s spiked black vessel and twenty-boss bronze dodecahedron',
 build(o){const v=((o&&o.v)|0)%5,chir=v%2?-1:1,y0=lksPedestal(10.4,10.4,1.8,{col:P('basalt')});
  const stCol=v===2?P('jade'):P('verd'),brCol=P('bronze');
  /* Skew 75/105 deg 3D rhombohedron vertex generator around `(0, cy, 0)` */
  const rhombVerts=(s,cy,rot)=>{
   const c=Math.cos(rot),sn=Math.sin(rot),sk=.268*chir;
   const raw=[];
   for(const dz of [-1,1])for(const dy of [-1,1])for(const dx of [-1,1]){
    const x=(dx+dy*sk+dz*sk*.6)*s,y=dy*s*1.12,z=(dz-dx*sk*.5)*s;
    raw.push([x*c-z*sn,cy+y,x*sn+z*c]);}
   return raw;};
  const edges=[[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]];
  const cy=y0+6.85,Vout=rhombVerts(2.75,cy,.18),Vin=rhombVerts(1.28,cy+.35,.18+.78*chir);
  /* Four low stone pier-shoes grounding the bottom 4 vertices of the outer hyper-cage */
  for(const idx of [0,1,4,5]){const p=Vout[idx];
   lksLimb('cyclo',[p[0]*.88,y0,p[2]*.88],p,.62,.44,P('basaltD'),1.15);}
  /* 12 outer stone-and-bronze girders + 12 inner cast-bronze girders + 8 diagonal 4D hyper-tethers */
  for(const [i,j] of edges){
   lksGirder('stoneP',Vout[i],Vout[j],.46,.44,stCol,brCol);
   beam('bronzeC',Vin[i],Vin[j],.14,brCol,false,undefined,.14);}
  for(let i=0;i<8;i++){
   beam('bronzeC',Vout[i],Vin[i],.075,P('verd'),true,6);
   sph('bronzeC',Vout[i][0],Vout[i][1],Vout[i][2],.28,brCol,1,8);
   sph('bronzeC',Vin[i][0],Vin[i][1],Vin[i][2],.18,P('verd'),1,7);}
  /* Suspended inside the inner cage: colossal spiked black-lacquer relic vessel + 20-boss bronze dodecahedron (after 60-lz-reliquary.js) */
  const vy=cy-.65;
  lathe('lacq',0,0,[[.12,vy],[.58,vy+.16],[.76,vy+.68],[.82,vy+1.35],[.64,vy+1.95],[.38,vy+2.28],[0,vy+2.28]],16,P('lacq'),{});
  for(let i=0;i<13;i++){const a=i*TAU/13,yy=vy+1.25+.65*Math.sin(i*1.3);
   lzHorn(Math.cos(a)*.74,yy,Math.sin(a)*.74,a,.95,.055,{curl:.22,lean:PI/2-.55,mk:i%2?'horn':'bronzeC',col:P(i%2?'horn':'bronze'),nt:5,ns:5});
   if(i%3===0)lzEye(Math.cos(a)*.78,yy-.35,Math.sin(a)*.78,a,.18,{mk:'bronze',glow:i===0});}
  /* Crown above the outer cage: bronze dodecahedron star tethered by 4 converging bronze apex struts */
  const dyTop=cy+4.55,g=(1+Math.sqrt(5))/2;
  for(const ti of [2,3,6,7])beam('bronzeC',Vout[ti],[0,dyTop,0],.055,brCol,true,6);
  sph('bronzeC',0,dyTop,0,.62,brCol,1,10);
  for(const a of [-1,1])for(const b of [-1,1])for(const p of [[0,a*g,b/g],[a/g,0,b*g],[a*g,b/g,0]]){
   const L=Math.hypot(p[0],p[1],p[2]);
   sph('bronzeC',p[0]/L*.82,dyTop+p[1]/L*.82,p[2]/L*.82,.11,P('verd'),1,6);}
  if(MAT.lrShim)for(const [a,b,c] of [[0,1,3],[4,5,7],[0,4,6]])poly('lrShim',[Vin[a],Vin[b],Vin[c]],P('glowC'),true);}});

/* ---------------------------------------------------------------- 12. The Thirteen Witnesses (organ-cluster of eye-stalks & bells) */
defBuilding({key:'lk-statue-chorus',name:'The Thirteen Witnesses',seed:7736,caste:'all',cut:false,w:12,d:12,h:15.5,budget:95000,
 front:{x:0,z:6,yaw:0},tags:{types:['statue','religious','civic'],wealth:'rich',role:'monument'},
 note:'thirteen leaning, S-curved polygonal stalks of dark basalt and verdigris bronze rising from a knotted root-mass to staggered heights; each stalk flares into an asymmetric oracle cowl housing a downward-staring spiral eye with a silent clapperless bell hung beneath its chin',
 build(o){const v=((o&&o.v)|0)%5,y0=lksPedestal(9.6,9.6,1.7,{col:P('basaltD')});
  const stCol=v===1?P('jade'):P('verd'),dkCol=P('basaltD'),brCol=P('bronze');
  /* Knotted basal root-mound of fused basalt ribs */
  lathe('cyclo',0,0,[[3.45,y0],[3.15,y0+.65],[2.35,y0+1.45],[1.35,y0+2.1],[0,y0+2.15]],14,dkCol,{});
  /* 13 (odd!) phyllotaxis-arranged leaning stalks (golden angle 137.5 deg) rising highest near the core, leaning outward to watch every approach */
  for(let i=0;i<13;i++){
   const a=i*2.39996+v*.45,u=i/12,r0=.45+2.25*Math.sqrt((i+.4)/13);
   const hStalk=lerp(12.2,4.4,Math.pow(u,.72)),lean=(.45+1.35*u);
   const x0=Math.cos(a)*r0,z0=Math.sin(a)*r0;
   const cFn=t=>{const wob=Math.sin(t*PI*1.3+i)*.22,rr=r0+lean*t*t;
    return [Math.cos(a)*rr-Math.sin(a)*wob,y0+.8+t*hStalk,Math.sin(a)*rr+Math.cos(a)*wob];};
   const mk=i%3===0?'bronzeC':i%2?'stoneP':'cyclo',col=i%3===0?brCol:i%2?stCol:dkCol;
   tube(mk,cFn,t=>{const w=.42*(1-.42*t)+.08*(t>.82?(t-.82)*4:0);return [w,w*1.08];},14,6,col,{caps:true});
   /* Sculpted asymmetric oracle-hood at the summit of each stalk, angled downward + outward */
   const top=cFn(1),outYaw=a+Math.sin(i*1.7)*.22;
   WX(top[0],top[1],top[2],-outYaw+PI/2,.32+.16*u,0,()=>{
    const hsc=.44+.26*(1-u);
    const hoodSec=(w,fz,bz)=>[[0,fz*1.25],[w*.75,fz*.65],[w,-.1*fz],[w*.65,bz],[0,bz*1.15],[-w*.65,bz],[-w,-.1*fz],[-w*.75,fz*.65]];
    lksLoft('stoneP',[
     lksRingAt([0,-.2*hsc,0],[0,1,.2],hoodSec(.55*hsc,.52*hsc,-.55*hsc)),
     lksRingAt([0,.55*hsc,.35*hsc],[0,1,.35],hoodSec(1.15*hsc,1.08*hsc,-.78*hsc)),
     lksRingAt([0,1.18*hsc,.52*hsc],[0,1,-.2],hoodSec(.72*hsc,1.25*hsc,-.65*hsc))],i%2?dkCol:stCol);
    /* Staring spiral eye recessed inside the flared oracle hood */
    lzEye(0,.52*hsc,.88*hsc,0,.42*hsc,{mk:'bronze',glow:i===0||i===3||i===7});
    /* Swept dorsal hood-horn */
    lzHorn(0,1.05*hsc,.15*hsc,PI,1.45*hsc,.09*hsc,{curl:.48,lean:.35,mk:'bronzeC',col:P('verd'),nt:5,ns:5});
    /* Silent clapperless bianzhong bell hanging beneath every witness's chin (on the 7 tallest stalks) */
    if(i<7)lksBianzhong(0,-.12*hsc,.72*hsc,.68*hsc,.22*hsc,{col:brCol});});}}});
