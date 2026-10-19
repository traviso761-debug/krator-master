// ================================================================= HOST — the roosts drawn (P2): decks, stalls, shelters, climbs, bridges, the lifts, the Stair
// The plan is PRR's (43-pr-roosts.js, [G data]) on this page's rock; this fragment draws its records and registers each
// one. Girder's vocabulary (settlements/girder 55-arch.js, the roost dressing; the Beast Riders kit's restyle): tarred
// timber, weathered planks, steep shingle with a red eave band, rope; the Stair's cut flights in the bedded red sandstone.
// The maps are the Beast Riders kit's (kits/beast-riders/materials.json, its pack read in place by build.py): grey detail
// maps, so the colour is the vertex colour and the map the grain (the pack's mean divided back out).
//
//   ROOST          the plan: {decks, roosts, shelters, climbs, bridges, lifts, stair, why}
//   ROOST_MESH     {by material: THREE.Mesh}; ROOST_CAGES the lifts' cages (moved by a tick)
const ROOST=(function(){try{const t0=performance.now(),P=PRR.plan({rock:ROCK,K:KSTACKS,PR,ground:groundH});P.ms=Math.round(performance.now()-t0);return P;}
 catch(e){reportErr('roosts: '+e.stack);return {decks:[],roosts:[],shelters:[],climbs:[],bridges:[],lifts:[],stair:null,why:{}};}})();
_mark('roostplan');
const ROOST_MESH={},ROOST_CAGES=[];
(function(){
 const lin=h=>{const c=new THREE.Color(h).convertSRGBToLinear();return [c.r,c.g,c.b];};
 const COL={tar:lin(0x3e2f24),post:lin(0x56402e),plank:lin(0x8c6c4c),board:lin(0x7a5c40),shingle:lin(0x6a4232),red:lin(0x9a2a1e),gilt:lin(0xc09a46),
  rope:lin(0xa48a5e),straw:lin(0xc4a462),stone:lin(0x9c5c44),stoneDk:lin(0x7a4634),iron:lin(0x3a3634)};
 // ---------------------------------------------------------------- the accumulators: flat-shaded triangles by material
 const MATS=['plank','timber','shingle','rope','straw','stone'],PACKF={plank:'wood',timber:'timber',shingle:'shingle',rope:'rope',straw:'straw',stone:'sandstone'};
 const A={};MATS.forEach(m=>A[m]={p:[],u:[],c:[]});
 const SC={};   // metres per tile, from the pack (1 without it)
 MATS.forEach(m=>{const P=typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed?KMAT.packed('beast-riders',PACKF[m]):null;SC[m]=P&&P.scale?P.scale[0]:1.6;});
 function tri(m,a,b,c,col,ua,ub,uc){const T=A[m],s=1/SC[m];T.p.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2]);
  T.u.push(ua[0]*s,ua[1]*s,ub[0]*s,ub[1]*s,uc[0]*s,uc[1]*s);for(let i=0;i<3;i++)T.c.push(col[0],col[1],col[2]);}
 // a quad a b c d (in order round it), uv in metres: u along a->b, v along a->d
 function quad(m,a,b,c,d,col,uL,vL){const U=uL==null?Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]):uL,V=vL==null?Math.hypot(d[0]-a[0],d[1]-a[1],d[2]-a[2]):vL;
  tri(m,a,b,c,col,[0,0],[U,0],[U,V]);tri(m,a,c,d,col,[0,0],[U,V],[0,V]);}
 // a beam from p0 to p1 (its centre line), w across (horizontal), h up (square to the beam, in its vertical plane)
 function beam(m,p0,p1,w,h,col){const dx=p1[0]-p0[0],dy=p1[1]-p0[1],dz=p1[2]-p0[2],L=Math.hypot(dx,dy,dz)||1e-6,ex=dx/L,ey=dy/L,ez=dz/L;
  let sx=-ez,sz=ex,sl=Math.hypot(sx,sz);if(sl<1e-4){sx=1;sz=0;sl=1;}sx/=sl;sz/=sl;   // across: horizontal, square to the beam
  const ux=ey*sz-ez*0,uy=ez*sx-ex*sz,uz=ex*0-ey*sx;   // up: across x along
  const hw=w/2,hh=h/2,P=(p,a,b)=>[p[0]+sx*a+ux*b,p[1]+uy*b,p[2]+sz*a+uz*b];
  const c0=[P(p0,-hw,-hh),P(p0,hw,-hh),P(p0,hw,hh),P(p0,-hw,hh)],c1=[P(p1,-hw,-hh),P(p1,hw,-hh),P(p1,hw,hh),P(p1,-hw,hh)];
  for(let i=0;i<4;i++){const j=(i+1)%4;quad(m,c0[i],c0[j],c1[j],c1[i],col,null,L);}
  quad(m,c0[0],c0[1],c0[2],c0[3],col);quad(m,c1[0],c1[1],c1[2],c1[3],col);}
 const post=(m,x,y0,z,h,s,col)=>beam(m,[x,y0,z],[x,y0+h,z],s,s,col);
 const lerp3=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
 // a run of steps along a centre line (each point the tread's front, its y the tread's height): treads and risers w wide
 function steps(m,pts,w,col,opt){opt=opt||{};for(let i=0;i+1<pts.length;i++){const p=pts[i],q=pts[i+1],dx=q[0]-p[0],dz=q[2]-p[2],L=Math.hypot(dx,dz);if(L<1e-3)continue;
   const ax=dz/L*w/2,az=-dx/L*w/2,y=p[1],y2=q[1];
   quad(m,[p[0]-ax,y,p[2]-az],[p[0]+ax,y,p[2]+az],[q[0]+ax,y,q[2]+az],[q[0]-ax,y,q[2]-az],col,w,L);
   quad(m,[q[0]-ax,y,q[2]-az],[q[0]+ax,y,q[2]+az],[q[0]+ax,y2,q[2]+az],[q[0]-ax,y2,q[2]-az],col,w,Math.abs(y2-y));
   if(opt.face){const f=opt.face;quad(m,[p[0]+ax,y,p[2]+az],[q[0]+ax,y,q[2]+az],[q[0]+ax,Math.min(y,y2)-f,q[2]+az],[p[0]+ax,Math.min(y,y2)-f,p[2]+az],opt.faceCol||col,L,f);}}}
 // a rope rail along a line of points (posts every `every` points, rope between their heads)
 function rail(pts,every,h,skip){let last=null;for(let i=0;i<pts.length;i+=every){const p=pts[i];if(skip&&skip(p)){last=null;continue;}
   post('timber',p[0],p[1],p[2],h+.1,.16,COL.post);const top=[p[0],p[1]+h,p[2]];if(last)beam('rope',last,top,.06,.06,COL.rope);last=top;}}
 const REGS=[];function reg(o){REGISTER(o);REGS.push(o);}

 // ---------------------------------------------------------------- the decks
 const N=PRR.N,stackName=id=>{const B=ROCK.find(S=>S.id===id);return B&&B.name?B.name:id;};
 const inStall=(D,x,z)=>ROOST.roosts.some(R=>R.plat===D.id&&Math.abs((x-R.fx)*-R.oz+(z-R.fz)*R.ox)<R.w/2+.4&&Math.abs((x-R.fx)*R.ox+(z-R.fz)*R.oz)<1.2);
 const nearHead=(x,z)=>ROOST.bridges.some(B=>Math.hypot(x-B.a.x,z-B.a.z)<4.5||Math.hypot(x-B.b.x,z-B.b.z)<4.5);
 ROOST.decks.forEach(D=>{const y=D.y,th=.6,inH=i=>{if(!D.hatch)return false;for(let k=D.hatch[0];k<=D.hatch[1];k++)if(((k%N)+N)%N===i)return true;return false;};
  const P=i=>{const a=D.inner[i%N],b=D.outer[i%N],L=Math.hypot(b[0]-a[0],b[1]-a[1]),f=Math.min(.45,2.6/Math.max(L,1));return {a,b,m:[a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f],L};};
  for(let i=0;i<N;i++){const p=P(i),q=P(i+1),V=v=>[v[0],y,v[1]],Vb=v=>[v[0],y-th,v[1]];
   if(!inH(i))quad('plank',V(p.a),V(p.m),V(q.m),V(q.a),COL.plank,null,null);
   quad('plank',V(p.m),V(p.b),V(q.b),V(q.m),COL.plank,null,null);
   quad('plank',Vb(p.a),Vb(p.b),Vb(q.b),Vb(q.a),COL.board);
   quad('timber',V(p.b),V(q.b),Vb(q.b),Vb(p.b),COL.tar);
   quad('timber',V(p.a),V(q.a),Vb(q.a),Vb(p.a),COL.tar);
   // the joists and the brackets let into the bed under the deck, every third angle
   if(i%3===0){const j0=[p.a[0],y-th-.2,p.a[1]],j1=[p.b[0],y-th-.2,p.b[1]];beam('timber',j0,j1,.3,.4,COL.tar);
    const ux=(p.a[0]-D.x),uz=(p.a[1]-D.z),ul=Math.hypot(ux,uz)||1,foot=[p.a[0]-ux/ul*.6,y-th-.4-.38*D.W,p.a[1]-uz/ul*.6];
    beam('timber',foot,lerp3(j0,j1,.62),.3,.3,COL.post);}
   // the outer rail, where no stall stands and no bridge lands
   if(i%2===0){const b=p.b,b2=P(i+2).b;if(!inStall(D,b[0],b[1])&&!inStall(D,b2[0],b2[1])&&!nearHead(b[0],b[1])&&!nearHead(b2[0],b2[1])){
     post('timber',b[0],y,b[1],1.2,.18,COL.post);beam('rope',[b[0],y+1.1,b[1]],[b2[0],y+1.1,b2[1]],.07,.07,COL.rope);}}}
  // a lookout's brazier on its post, toward the open side
  if(D.level==='look'){const o=D.outer[0],i0=D.inner[0],m=[(o[0]+i0[0])/2,(o[1]+i0[1])/2];post('timber',m[0],y,m[1],1.6,.3,COL.tar);
   beam('timber',[m[0],y+1.6,m[1]],[m[0],y+2.1,m[1]],.9,.9,COL.iron);}
  reg({name:(D.level==='look'?'A lookout ring on ':'A roost deck on ')+stackName(D.stack)+(D.wing&&D.wing!=='garden'?' (the '+D.wing+'\'s)':D.wing==='garden'?' (the Garden\'s roost)':''),
   key:'roost.'+D.level,x:D.x,z:D.z,y:y-4,r:D.R,h:13});});

 // ---------------------------------------------------------------- the stalls (Girder's frame, PRR.STALL)
 const ST=PRR.STALL,k=(ST.back-ST.eave)/ST.d;
 ROOST.roosts.forEach(R=>{const y=R.y,nx=R.ox,nz=R.oz,tx=-nz,tz=nx,F=(e,q,h)=>[R.fx+nx*e+tx*q,y+h,R.fz+nz*e+tz*q],hw=R.w/2;
  // posts: the front .2 m in, the back at the stall's depth
  [-1,1].forEach(s=>{const f=F(-.2,s*(hw-.15),0),b=F(-ST.d,s*(hw-.15),0);post('timber',f[0],y,f[2],ST.eave,.32,COL.tar);post('timber',b[0],y,b[2],ST.back,.32,COL.tar);
   // the low partition, a plank wall along the stall's side
   const p0=F(-.4,s*(hw-.15),ST.part/2),p1=F(-ST.d+.2,s*(hw-.15),ST.part/2);beam('plank',p0,p1,.14,ST.part,COL.board);});
  // the lean-to: shingle from .6 m out over the edge up to the back, a red eave band
  const rf=F(.6,0,ST.eave-.6*k+.15),rb=F(-ST.d-.4,0,ST.back+.4*k+.15);beam('shingle',rf,rb,R.w+.8,.22,COL.shingle);
  beam('timber',F(.6,-hw-.4,ST.eave-.6*k-.15),F(.6,hw+.4,ST.eave-.6*k-.15),.12,.34,COL.red);
  beam('timber',F(-.2,-hw,ST.eave-.2),F(-.2,hw,ST.eave-.2),.24,.3,COL.tar);beam('timber',F(-ST.d,-hw,ST.back-.2),F(-ST.d,hw,ST.back-.2),.24,.3,COL.tar);
  // the perch beam, from 1.5 m in to 3.4 m out, its top .48 m over the deck, braced under its outer end
  beam('timber',F(-ST.beamIn,0,ST.beamTop-.21),F(ST.beamOut,0,ST.beamTop-.21),.44,.42,COL.post);beam('timber',F(0,0,-1.6),F(2.6,0,ST.beamTop-.4),.24,.24,COL.tar);
  // the straw, and the back rail on the walkway's side
  quad('straw',F(-.3,-hw+.2,.03),F(-.3,hw-.2,.03),F(-ST.d+.2,hw-.2,.03),F(-ST.d+.2,-hw+.2,.03),COL.straw);
  beam('timber',F(-ST.d,-hw,1.05),F(-ST.d,hw,1.05),.12,.12,COL.post);});

 // ---------------------------------------------------------------- the keepers' shelters (feed and tack)
 ROOST.shelters.forEach(S=>{const c=Math.cos(S.ry),s=Math.sin(S.ry),L=(a,b,h)=>[S.x+s*b+c*a,S.y+h,S.z+c*b-s*a],hw=S.w/2,hd=S.d/2,H=2.6,ov=.5,rise=1.7;
  const cs=[[-hw,-hd],[hw,-hd],[hw,hd],[-hw,hd]];
  for(let i=0;i<4;i++){const a=cs[i],b=cs[(i+1)%4];quad('plank',L(a[0],a[1],0),L(b[0],b[1],0),L(b[0],b[1],H),L(a[0],a[1],H),COL.board);}
  cs.forEach(a=>{const p=L(a[0],a[1],0);post('timber',p[0],S.y,p[2],H+.1,.26,COL.tar);});
  // the hip roof: four slopes to a short ridge
  const e=cs.map(a=>L(a[0]*(1+ov/hw),a[1]*(1+ov/hd),H)),r0=L(-hw*.35,0,H+rise),r1=L(hw*.35,0,H+rise);
  quad('shingle',e[0],e[1],r1,r0,COL.shingle);quad('shingle',e[2],e[3],r0,r1,COL.shingle);tri('shingle',e[1],e[2],r1,COL.shingle,[0,0],[S.d,0],[S.d/2,rise]);tri('shingle',e[3],e[0],r0,COL.shingle,[0,0],[S.d,0],[S.d/2,rise]);
  beam('timber',L(-hw-ov,hd+ov,H-.1),L(hw+ov,hd+ov,H-.1),.1,.26,COL.red);
  reg({name:'A keeper\'s shelter (the roost\'s feed and tack store)',key:'roost.shelter',x:S.x,z:S.z,y:S.y,r:4.5,h:5});});

 // ---------------------------------------------------------------- the climbs: stairs hugging the stacks, bracketed into the beds
 ROOST.climbs.forEach(C=>{const P=C.pts,w=C.w;steps('plank',P,w,COL.plank);
  const side=(p,q,s)=>{const dx=q[0]-p[0],dz=q[2]-p[2],L=Math.hypot(dx,dz)||1;return [p[0]+dz/L*s,p[1],p[2]-dx/L*s];};
  // which side is the rock's: the edge nearer the stack's middle
  const B=ROCK.find(S=>'deck-'+S.id===C.deck.replace(/-look$/,''))||ROCK[0],o=P.length>1?side(P[0],P[1],w/2):P[0],inS=Math.hypot(o[0]-B.x,o[2]-B.z)<Math.hypot(P[0][0]-B.x,P[0][2]-B.z)?1:-1;
  const outer=[],inner=[];for(let i=0;i+1<P.length;i++){outer.push(side(P[i],P[i+1],-inS*w/2));inner.push(side(P[i],P[i+1],inS*(w/2+.3)));}
  rail(outer,6,1,null);
  for(let i=0;i<outer.length;i+=8){const a=inner[i],b=outer[i];beam('timber',[a[0],a[1]-1.8,a[2]],[b[0],b[1]-.12,b[2]],.2,.2,COL.tar);}
  for(let i=0;i+6<outer.length;i+=6)beam('timber',[outer[i][0],outer[i][1]-.25,outer[i][2]],[outer[i+6][0],outer[i+6][1]-.25,outer[i+6][2]],.12,.3,COL.tar);});

 // ---------------------------------------------------------------- the bridges: plank and rope between a group's fins
 ROOST.bridges.forEach(B=>{const n=Math.max(12,Math.round(B.L/2.2)),a=[B.a.x,B.a.y,B.a.z],b=[B.b.x,B.b.y,B.b.z],dx=b[0]-a[0],dz=b[2]-a[2],L=Math.hypot(dx,dz),ax=dz/L,az=-dx/L,hw=B.w/2;
  const at=t=>[a[0]+dx*t,PRR.bridgeY(B,t),a[2]+dz*t],E=(t,s,h)=>{const p=at(t);return [p[0]+ax*s,p[1]+h,p[2]+az*s];};
  for(let i=0;i<n;i++){const t0=i/n,t1=(i+1)/n;quad('plank',E(t0,-hw,0),E(t0,hw,0),E(t1,hw,0),E(t1,-hw,0),COL.plank,B.w,B.L/n);
   [-1,1].forEach(s=>{beam('rope',E(t0,s*(hw+.1),1.1),E(t1,s*(hw+.1),1.1),.07,.07,COL.rope);beam('rope',E(t0,s*(hw-.05),-.05),E(t1,s*(hw-.05),-.05),.09,.09,COL.rope);
    if(i%2===0)beam('rope',E(t0,s*(hw+.05),0),E(t0,s*(hw+.1),1.1),.04,.04,COL.rope);});}
  [0,1].forEach(t=>[-1,1].forEach(s=>{const p=E(t,s*(hw+.3),0);post('timber',p[0],p[1]-.6,p[2],3.2,.34,COL.tar);}));
  const m=at(.5);reg({name:'A rope bridge between the fins ('+B.id.replace(/^bridge-/,'').replace('-',' and ')+')',key:'roost.bridge',x:m[0],z:m[2],y:Math.min(B.a.y,B.b.y)-B.sag-2,r:L/2+3,h:Math.abs(B.a.y-B.b.y)+B.sag+6});});

 // ---------------------------------------------------------------- the lifts: a trussed boom over the edge, the cage, the capstan
 ROOST.lifts.forEach(Lf=>{const ca=Math.cos(Lf.a),sa=Math.sin(Lf.a),tx=-sa,tz=ca,R=Lf.root,T=Lf.tip,yb=T.y,yt=yb+2.2;
  const at=(t,s,y)=>[R.x+ca*t+tx*s,y,R.z+sa*t+tz*s],len=Lf.len;
  // the chords and the web: two trusses 1.6 m apart
  [-.8,.8].forEach(s=>{beam('timber',at(0,s,yb),at(len,s,yb),.34,.42,COL.tar);beam('timber',at(0,s,yt),at(len-2,s,yt-.6),.28,.34,COL.tar);
   for(let t=0;t+4<=len;t+=4){beam('timber',at(t,s,yb),at(t,s,yt-.6*t/len),.2,.2,COL.post);beam('timber',at(t,s,yb),at(t+4,s,yt-.6*(t+4)/len),.18,.18,COL.post);}});
  for(let t=0;t<=len;t+=4)beam('timber',at(t,-.8,yb),at(t,.8,yb),.2,.2,COL.post);
  // the A-frame at the root and the king post with its stays to the tip and back to the anchor
  [-2.6,2.6].forEach(s=>beam('timber',at(-1,s,R.y),at(0,s*.3,yt+6),.4,.4,COL.tar));const kp=at(0,0,yt+6);
  beam('rope',kp,at(len,0,yb),.08,.08,COL.rope);beam('rope',kp,at(-14,0,K0(R.x-ca*14,R.z-sa*14)),.08,.08,COL.rope);
  {const an=at(-14,0,0);post('timber',an[0],K0(an[0],an[2])-.4,an[2],1.4,.5,COL.tar);}
  // the pulley head at the tip, the cable to the capstan's drum
  beam('timber',at(len,-.9,yb-.5),at(len,.9,yb-.5),.6,.6,COL.iron);const cp=Lf.capstan;beam('rope',at(0,0,yb),[cp.x,cp.y+1,cp.z],.06,.06,COL.rope);
  // the capstan: an eight-sided drum, four bars, a ring of stones
  for(let i=0;i<8;i++){const a0=i/8*TAU,a1=(i+1)/8*TAU,r=1.1;quad('timber',[cp.x+Math.cos(a0)*r,cp.y,cp.z+Math.sin(a0)*r],[cp.x+Math.cos(a1)*r,cp.y,cp.z+Math.sin(a1)*r],[cp.x+Math.cos(a1)*r,cp.y+1.6,cp.z+Math.sin(a1)*r],[cp.x+Math.cos(a0)*r,cp.y+1.6,cp.z+Math.sin(a0)*r],COL.tar);}
  for(let i=0;i<4;i++){const a=i/4*TAU+.3;beam('timber',[cp.x-Math.cos(a)*cp.r,cp.y+1.05,cp.z-Math.sin(a)*cp.r],[cp.x+Math.cos(a)*cp.r,cp.y+1.05,cp.z+Math.sin(a)*cp.r],.18,.18,COL.post);}
  // the landing at the foot: a timber stage on posts, levelled on the debris slope
  const F=Lf.foot,fy=F.y+.6;for(let i=0;i<4;i++){const s=[[-4,-4],[4,-4],[4,4],[-4,4]][i],p=[F.x+ca*s[0]+tx*s[1],0,F.z+sa*s[0]+tz*s[1]];post('timber',p[0],K0(p[0],p[2])-1,p[2],fy-K0(p[0],p[2])+1,.36,COL.tar);}
  const cr=(a,b)=>[F.x+ca*a+tx*b,fy,F.z+sa*a+tz*b];quad('plank',cr(-4.4,-4.4),cr(4.4,-4.4),cr(4.4,4.4),cr(-4.4,4.4),COL.plank);
  reg({name:Lf.name,key:'roost.lift',x:(R.x+T.x)/2,z:(R.z+T.z)/2,y:F.y-1,r:len/2+16,h:yt+8-F.y});});
 function K0(x,z){return terrainH(x,z);}

 // ---------------------------------------------------------------- the Stair: the cut flights, the built-out returns, the path down the slope
 const S=ROOST.stair;
 if(S){const P=S.pts,w=S.w,head=P.slice(0,S.shoulder+1),run=P.slice(S.shoulder);
  steps('stone',head,w,COL.stone,{face:1.4,faceCol:COL.stoneDk});
  // the flights by k: the cut ones (k even) in stone with a parapet; the returns (k odd) a timber gallery on brackets
  let seg=[];const flush=()=>{if(seg.length<2){seg=[];return;}const k=seg[0][4],odd=k%2===1;
   steps(odd?'plank':'stone',seg,w,odd?COL.plank:COL.stone,odd?null:{face:1.6,faceCol:COL.stoneDk});
   const cx=MESA_B.x,cz=MESA_B.z,out=p=>{const a=Math.atan2(p[2]-cz,p[0]-cx);return [p[0]+Math.cos(a)*w/2,p[1],p[2]+Math.sin(a)*w/2];},inn=p=>{const a=Math.atan2(p[2]-cz,p[0]-cx);return [p[0]-Math.cos(a)*w/2,p[1],p[2]-Math.sin(a)*w/2];};
   if(odd){rail(seg.map(out),6,1,null);for(let i=0;i<seg.length;i+=6){const a=inn(seg[i]),b=out(seg[i]),ar=Math.atan2(seg[i][2]-cz,seg[i][0]-cx);
     beam('timber',[a[0]-Math.cos(ar)*1.6,a[1]-3.4,a[2]-Math.sin(ar)*1.6],[b[0],b[1]-.2,b[2]],.3,.3,COL.tar);beam('timber',[a[0]-Math.cos(ar)*.8,a[1]-.2,a[2]-Math.sin(ar)*.8],[b[0],b[1]-.2,b[2]],.26,.32,COL.tar);}}
   else for(let i=0;i+2<seg.length;i+=2){const a=out(seg[i]),b=out(seg[i+2]);beam('stone',[a[0],a[1]+.45,a[2]],[b[0],b[1]+.45,b[2]],.5,.9,COL.stone);}
   seg=[];};
  run.forEach(p=>{if(seg.length&&seg[seg.length-1][4]!==p[4]){const last=seg[seg.length-1];flush();seg=[last.slice(0,4).concat([p[4]])];}seg.push(p);});flush();
  steps('stone',S.ground.map(p=>[p[0],p[1]+.2,p[2]]),2.4,COL.stone,{face:.8,faceCol:COL.stoneDk});
  // the three gates: posts, a lintel with the red band, a small shingle roof, the leaves open
  S.gates.forEach(G=>{const c=Math.cos(G.ry),s=Math.sin(G.ry),L=(a,h,b)=>[G.x+c*a+s*b,G.y+h,G.z-s*a+c*b],hw=G.w/2;
   [-1,1].forEach(q=>{const p=L(q*(hw+.3),0,0);post('timber',p[0],G.y-.5,p[2],5.1,.5,COL.tar);beam('plank',L(q*(hw+.2),1.8,0),L(q*(hw+.2)+q*-.1,1.8,1.6),.12,3.4,COL.board);});
   beam('timber',L(-hw-.9,4.4,0),L(hw+.9,4.4,0),.5,.5,COL.tar);beam('timber',L(-hw-.9,4.05,.28),L(hw+.9,4.05,.28),.08,.3,COL.red);
   beam('shingle',L(0,5.05,-.9),L(0,5.05,.9),G.w+2.4,.18,COL.shingle);
   reg({name:G.name,key:'roost.gate',x:G.x,z:G.z,y:G.y-1,r:4,h:7});});
  let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9,y0=1e9,y1=-1e9;P.concat(S.ground).forEach(p=>{x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);z0=Math.min(z0,p[2]);z1=Math.max(z1,p[2]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1]);});
  reg({name:S.name,key:'roost.stair',x:(x0+x1)/2,z:(z0+z1)/2,y:y0-2,r:Math.hypot(x1-x0,z1-z0)/2+3,h:y1-y0+6});}

 // ---------------------------------------------------------------- the meshes, one per material, and the registered volumes' anchors
 const c=new THREE.Color();
 MATS.forEach(m=>{const T=A[m];if(!T.p.length)return;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(T.p,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(T.u,2));g.setAttribute('color',new THREE.Float32BufferAttribute(T.c,3));g.computeVertexNormals();
  const P=typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed?KMAT.packed('beast-riders',PACKF[m]):null,tx=P?KMAT.textures(P,{aniso:8}):{};
  const mean=P&&P.mean!=null?P.mean:.5,gain=tx.map?1/Math.max(.05,Math.pow(mean,2.2)):1;
  const mat=new THREE.MeshStandardMaterial({map:tx.map||null,normalMap:tx.normalMap||null,roughness:.92,metalness:0,vertexColors:true,side:THREE.DoubleSide});mat.color.setScalar(gain);
  const me=new THREE.Mesh(g,mat);me.userData.roost=true;me.userData.host=true;
  me.userData.inspectLabel={plank:'Planking (the decks, the stairs, the bridges)',timber:'Tarred timber (posts, brackets, booms)',shingle:'Shingle roofs (the stalls, the shelters, the gates)',
   rope:'Rope (rails, the bridges\' hand lines, the lifts\' cables)',straw:'Straw (the stalls\' bedding)',stone:'The Stair\'s cut steps (red sandstone)'}[m];
  scene.add(me);ROOST_MESH[m]=me;});
 {const An=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({visible:false}),Math.max(1,REGS.length)),M4=new THREE.Matrix4();
  REGS.forEach((r,i)=>{M4.makeTranslation(r.x,r.y+Math.min(r.h/2,4),r.z);An.setMatrixAt(i,M4);});An.count=REGS.length;An.userData.host=true;An.userData.roost=true;An.userData.inspectLabel='roost anchors';An.frustumCulled=false;scene.add(An);}

 // ---------------------------------------------------------------- the cages: up and down their cables, a load every few minutes
 ROOST.lifts.forEach((Lf,i)=>{const g=new THREE.Group(),mat=new THREE.MeshStandardMaterial({color:new THREE.Color(0x56402e).convertSRGBToLinear(),roughness:.9}),bx=(w,h,d,x,y,z)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);g.add(m);};
  bx(3.2,.25,3.2,0,0,0);bx(3.4,.2,3.4,0,2.9,0);[[-1.5,-1.5],[1.5,-1.5],[1.5,1.5],[-1.5,1.5]].forEach(p=>bx(.2,2.9,.2,p[0],1.45,p[1]));bx(3.2,.12,.12,0,1.1,-1.55);bx(3.2,.12,.12,0,1.1,1.55);
  const cab=new THREE.Mesh(new THREE.BoxGeometry(.06,1,.06),new THREE.MeshStandardMaterial({color:new THREE.Color(0xa48a5e).convertSRGBToLinear(),roughness:1}));g.add(cab);
  g.rotation.y=-Lf.a;g.userData.roost=true;g.userData.inspectLabel='The lift\'s cage';g.traverse(o=>{o.userData.roost=true;o.userData.inspectLabel='The lift\'s cage';});scene.add(g);
  const top=Lf.tip.y-4.5,bot=Lf.foot.y+.85,C={g,cab,top,bot,period:240+60*i,ph:i*.37};ROOST_CAGES.push(C);
  const place=t=>{const u=.5-.5*Math.cos(TAU*((t/C.period+C.ph)%1)),y=bot+(top-bot)*Math.min(1,Math.max(0,u*1.25-.125));g.position.set(Lf.tip.x,y,Lf.tip.z);
   const L=Lf.tip.y-.5-(y+2.9);cab.scale.y=Math.max(.1,L);cab.position.set(0,2.9+L/2,0);};
  C.place=place;place(0);});
 tick((dt,t)=>{for(const C of ROOST_CAGES)C.place(t||0);});
})();
_mark('roosts');
