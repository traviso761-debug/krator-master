// ================================================================= STRONGBOW — the cliff arcology: the plan (records)
// The Ancients' city hung down a cliff face. The site is the scarp between the Oidong Valley and Xanadu, beside the cataract (scale
// model 5.1 px 1001,1596; the owner, 2026-11-11, after earlier moves; the design was first drawn for the valley's east end). The owner's
// answers: an 800 m hull for about 40 000 people (since the owner's composition notes, a tower with a landing pad and one Spine, about 27 000), standing in ruin
// on half its stays, the Sultanate below and the Order above, a showcase cliff with a cut bay (targets/strongbow/NOTES.md).
//
// THE FRAME   x east along the face, y up, z SOUTH (out of the rock); the valley floor y = floor (0 on the kit page), the face
//             line z = 0 at the foot, battered back BATTER m by the lip (y = LIP). The plateau is north of the lip.
// THE BAY     a notch quarried into the face, |x| < BAY.w/2, back wall z = -BAY.d, from the lip to the floor.
// THE TOWER   the main hull (the Bow; a sail until the owner's note of 2026-11-11): a slender wedge in plan standing free in the bay,
//             its flat back GAP m off the back wall, two flanks meeting in a sharp prow to the south. At height y (t = 0 at the lip,
//             1 at the foot) the half width w(t) and the depth d(t); a flank point at u (0 the back corner, 1 the prow) is
//             [s w (1-u), back + d (1 - (1-u)^1.25)]. It runs from the crown down to the
//             Nock, whose deck carries the landing pad before its prow.
// THE NOCK    the deck at mid-height that spans the bay and runs into the rock on both sides; the string fans come down to its tips.
// THE SPINE   one column of glazed drums and terraces from the keel to the foot (the owner, 2026-11-11), plumb runs alternating with
//             runs that step out from the rock, a terrace at every turn; the lifts run inside it.
//
// [G data]: no three.js, no DOM. Every choice is KRAND.hash of the plan's seed, a salt and a record's own indices, never a count
// of draws. Records carry stable ids (sb.*); the ruin is a set of deltas by those ids (STRONGBOW.ruin). The drawing (8aw1) decides
// nothing. Metres.
const STRONGBOW={};
STRONGBOW.DIM={LIP:900,BATTER:30,STO:25.6/7,BAY:{w:190,d:90},
 HULL:{top:960,tip:498,W:110,D:170,gap:40,LIT:20,NSEG:8},
 CROWN:{h:10,over:30,pool:[44,16]},MAST:{h:170,rake:12},RAMP:{p0:[-300,-34],c:[-260,190],p2:[-62,40],w:14,pitch:26,back:[[-150,-230],[0,-260],[150,-230]]},
 NOCK:{y:520,th:22,over:96,wing:120,storeys:5,landing:{r:30,at:.52}},
 STRING:{n:12,u:.45,y0:700,y1:880,x0:125,x1:208},
 ANCHORS:[{y:840,n:10,b0:790,b1:880},{y:740,n:10,b0:660,b1:780},{y:620,n:9,b0:540,b1:640}],SOCK:{x0:130,x1:270,u:.62},
 QUIVER:{x:-245,top:400,tip:150,W:100,D:80,n:7},
 // THE SPINE (the owner, 2026-11-11: 'one intermittently sloping column of drums and terraces'): nodes from the
 // keel to the foot, [x, y, z from the keel's centre]; plumb runs and runs that step out from the rock; a terrace at every turn
 SPINE:{r:36,neck:24,drum:26,necks:6,nodes:[[0,497,0],[0,430,0],[40,350,42],[40,290,42],[-34,230,86],[-34,170,86],[0,108,130],[0,36,130]],
  tr:[0,60,70,60,70,60,70],rotor:[2,4],arm:80,rr:26,pad:5,struts:[1,2]},
 GALL:{e:[180,330],w:[340,480],ys:[150,270,390],deep:14,storeys:5},
 PAD:{at:[300,-140],r:45},RIM:{x0:-200,x1:-800,z0:-50,z1:-86,h:28},
 HELIO:{pitch:8,w:6,h:4,post:3,sun:[0,.766,-.643],aim:[0,700,80]},
 TERM:{h:36,lifts:[-12,12]},
 // THE FOOT (the owner, 2026-11-11: 'the bottom portion should be more elaborate and have an actual lobby'): the podium where the
 // Spine lands. The lobby, a glazed rotunda round the Spine's foot; the terminus hall, a vault on the west where the line came in;
 // the west wing (offices), the east wing (works), the back block in the bay's mouth; the forecourt plaza before the lobby
 FOOT:{h:24,lobby:{r:60,gal:[9,18,27],core:14,ribs:36},hall:{x0:-330,x1:-62,z0:40,z1:110,h:22,platforms:3,ribs:20},
  wings:{w:[-160,-62,120,186],e:[62,160,20,186],back:[-56,56,-8,64]},plaza:{x0:-110,x1:110,dz:60,d:74,h:1.5,pools:[-50,50]}},
 // population: the lit band behind glazing, SHARE of it homes, M2 gross a person
 SHARE:.68,M2:45,
 // the ruin (the owner, 2026-11-11): the east stays snapped, the lean, the lower hull fallen, the glazing, the mast, the west Spine
 RUIN:{side:1,lean:-3.5,roll:-2,stringGone:.5,limp:.35,skin:.1,mastKink:.6,mastBend:35,spineBreak:1,helio:.7}};

STRONGBOW.h=function(seed,a,b,c,e){return KRAND.unit(KRAND.hash(seed,a|0,b==null?0:b|0,c==null?0:c|0,e==null?0:e|0));};
const lerpSB=(a,b,f)=>a+(b-a)*f;
const SB_SS=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);};

// ---- the frame ----------------------------------------------------------------------------------------------------
// o.lip: the face's height over the floor (default LIP); o.floor: the floor's height (default 0). The open world passes both.
STRONGBOW.frame=function(o){o=o||{};const D=STRONGBOW.DIM,LIP=o.lip==null?D.LIP:o.lip,FL=o.floor==null?0:o.floor,S=o.seed==null?1647:o.seed;
 const k=LIP/D.LIP,H=D.HULL,top=FL+H.top*k,tip=FL+H.tip*k,back=-D.BAY.d+H.gap;
 const F={LIP,FL,k,seed:S,top,tip,back,lipY:FL+LIP,bay:D.BAY};
 // the face: battered back with height, a slow wobble (KRAND value noise: the same on every machine)
 F.faceZ=(x,y)=>-D.BATTER*(y-FL)/LIP+9*(KRAND.vnoise(x/140,(y-FL)/90,0,S+11)-.5)+5*(KRAND.vnoise(x/37,(y-FL)/23,0,S+12)-.5);
 // the scree at the foot: cleared before the bay (the town's ground), heaped beyond it, out to 140 m
 F.screeH=x=>10*SB_SS(200,300,Math.abs(x))+100*SB_SS(380,560,Math.abs(x))*(.8+.4*KRAND.vnoise(x/90,0,0,S+13));
 F.scree=(x,z)=>z<0?F.screeH(x):z>140?0:F.screeH(x)*Math.pow(1-z/140,1.5);
 F.ground=(x,z)=>FL+F.scree(x,z);
 // the hull's plan at t
 F.t=y=>(top-y)/(top-tip);
 // THE TOWER: a slender wedge standing free in the bay, widest at the crown and tapering a little to the Nock, where it ends on
 // the landing deck and the Spine takes it
 F.w=t=>H.W/2*(1-.25*t);
 F.d=t=>H.D*(1-.12*t);
 // a flank runs nearly straight from the back corner to the prow, a little convex: a sharp prow, not a round one
 F.flank=(t,s,u)=>[s*F.w(t)*(1-u),back+F.d(t)*(1-Math.pow(1-u,1.25))];
 F.prowZ=t=>back+F.d(t);
 return F;};

// the plan polygon's area and its flank length at t (numerical; the back is not glazed)
STRONGBOW.slice=function(F,t){let A=0,P=0;const N=24;
 for(let i=0;i<N;i++){const a=F.flank(t,1,i/N),b=F.flank(t,1,(i+1)/N);A+=(a[0]+b[0])/2*(b[1]-a[1])*2;P+=2*Math.hypot(b[0]-a[0],b[1]-a[1]);}
 return{A:Math.abs(A),P};};

// ---- the plan -----------------------------------------------------------------------------------------------------
STRONGBOW.plan=function(o){o=o||{};const D=STRONGBOW.DIM,F=STRONGBOW.frame(o),S=F.seed,ST=D.STO,H=D.HULL,LY=F.lipY;
 const h=(a,b,c,e)=>STRONGBOW.h(S,a,b,c,e);
 const P={id:'strongbow',seed:S,dim:D,frame:F,storeys:[],stays:[],drums:[],galleries:[],helio:[],rotors:[],saucers:[]};
 // THE BOW: one record a storey (the drawing lofts the flanks from them)
 const NK=Math.floor((F.top-F.tip)/ST);
 for(let i=0;i<NK;i++){const y0=F.top-(i+1)*ST,y1=y0+ST,t=F.t((y0+y1)/2),sl=STRONGBOW.slice(F,t);
  const lit=Math.min(sl.A,sl.P*H.LIT);P.storeys.push({id:'sb.k.'+i,i,y0,y1,t,A:sl.A,P:sl.P,lit,pop:Math.round(lit*D.SHARE/D.M2)});}
 P.bow={id:'sb.bow',top:F.top,tip:F.tip,back:F.back,storeys:NK,keelZ:F.back+F.d(1)*.32};
 // the crown and the mast
 const C=D.CROWN,cy=F.top+C.h;
 P.crown={id:'sb.crown',y0:F.top,y1:cy,over:C.over,pool:{id:'sb.crown.pool',at:[0,cy,F.prowZ(0)-40],size:C.pool}};
 const rk=D.MAST.rake*Math.PI/180,mf=[0,cy,F.back+20];
 P.mast={id:'sb.mast',foot:mf,head:[0,cy+D.MAST.h*Math.cos(rk),mf[2]+D.MAST.h*Math.sin(rk)],h:D.MAST.h,w0:22,w1:3};
 // the arc ramp: from the plateau west of the bay round the front of the crown to its east side; stays from the mast head
 // (a quadratic curve from the plateau west of the bay, out over the bay's mouth and back onto the crown's west flank)
 {const R=D.RAMP,bz=f=>{const a=(1-f)*(1-f),b=2*f*(1-f),c=f*f;return[a*R.p0[0]+b*R.c[0]+c*R.p2[0],a*R.p0[1]+b*R.c[1]+c*R.p2[1]];};
  let L=0;for(let i=0;i<64;i++){const p=bz(i/64),q=bz((i+1)/64);L+=Math.hypot(q[0]-p[0],q[1]-p[1]);}
  const n=Math.round(L/R.pitch),pts=[];for(let i=0;i<=n;i++){const f=i/n,p=bz(f);pts.push([p[0],LY+(cy-LY)*f,p[1],f]);}
  P.ramp={id:'sb.ramp',pts,w:R.w,len:L};
  for(let i=1;i<pts.length-1;i++)P.stays.push({id:'sb.st.ramp.'+i,fan:'ramp',side:-1,i,a:'mast',b:pts[i].slice(0,3)});
  // the backstays: from the mast head to the plateau behind the bay
  R.back.forEach((b,i)=>{const z=b[1];P.stays.push({id:'sb.st.back.'+i,fan:'back',side:0,i,a:'mast',b:[b[0],LY+.035*(F.faceZ(b[0],LY)-z),z]});});}
 // THE NOCK: centre (in the bay, carried by the hull) and two wings (into the rock)
 {const N=D.NOCK,t=F.t(N.y),wx=D.BAY.w/2+N.wing,zc=F.prowZ(t)+N.over;
  const front=x=>{const q=Math.min(1,Math.abs(x)/wx);return 40+(zc-40)*(1-q*q);};
  P.nock={id:'sb.nock',y:F.FL+N.y*F.k,th:N.th,wx,zc,storeys:N.storeys,front,
   parts:[{id:'sb.nock.w',x0:-wx,x1:-D.BAY.w/2,side:-1},{id:'sb.nock.c',x0:-D.BAY.w/2,x1:D.BAY.w/2,side:0},{id:'sb.nock.e',x0:D.BAY.w/2,x1:wx,side:1}],
   pads:[-1,1].map(s=>({id:'sb.nock.pad.'+(s<0?'w':'e'),at:[s*(D.BAY.w/2+60),F.FL+N.y*F.k,30],size:[60,30]}))};
  // the landing pad: a glazed disc on the deck before the tower's prow, where the flyers come in (the owner's reference)
  const lz=lerpSB(F.prowZ(t),zc,N.landing.at);P.landing={id:'sb.landing',at:[0,P.nock.y,lz],r:N.landing.r};}
 // the stays: the string (hull's upper flank to the Nock's wing tips) and the anchors (hull's flank to sockets in the face)
 const hullPt=(y,s,u)=>{const t=F.t(y),q=F.flank(t,s,u);return[q[0],y,q[1]];};
 for(const s of [-1,1]){const G=D.STRING,sn=s<0?'w':'e';
  for(let i=0;i<G.n;i++){const f=i/(G.n-1),y=G.y0+(G.y1-G.y0)*f,x=s*(G.x0+(G.x1-G.x0)*f);
   P.stays.push({id:'sb.st.str.'+sn+'.'+i,fan:'string',side:s,i,a:hullPt(y,s,G.u),b:[x,P.nock.y,P.nock.front(x)-2]});}
  D.ANCHORS.forEach((A,j)=>{for(let i=0;i<A.n;i++){const f=i/(A.n-1),ya=F.FL+(A.y-30+60*f)*F.k,x=s*(D.SOCK.x0+(D.SOCK.x1-D.SOCK.x0)*(.08+.84*f+.04*(h(101,j,i,s+2)-.5))),yb=F.FL+(A.b0+(A.b1-A.b0)*f)*F.k;
   P.stays.push({id:'sb.st.anc.'+sn+'.'+j+'.'+i,fan:'anchor'+j,side:s,i,a:hullPt(ya,s,D.SOCK.u),b:[x,yb,F.faceZ(x,yb)]});}});}
 // the lower hull: the Quiver, on the face west of the bay, with its own fan to the rock above it
 {const Q=D.QUIVER,top=F.FL+Q.top*F.k,tip=F.FL+Q.tip*F.k;
  P.quiver={id:'sb.quiver',x:Q.x,top,tip,W:Q.W,D:Q.D,back:F.faceZ(Q.x,(top+tip)/2)};
  for(let i=0;i<Q.n;i++){const f=i/(Q.n-1),xa=Q.x+(f-.5)*Q.W*.8,xb=Q.x+(f-.5)*Q.W*1.6,yb=top+40+60*h(102,i);
   P.stays.push({id:'sb.st.q.'+i,fan:'quiver',side:-1,i,a:[xa,top,P.quiver.back+Q.D*.35*(1-Math.abs(f-.5)*2)],b:[xb,yb,F.faceZ(xb,yb)]});}}
 // THE SPINE: drums on necks down each run (stacked plumb, or stepping out where the run slopes), a terrace at every turn
 {const SP=D.SPINE,zk=Math.max(P.bow.keelZ,-D.BAY.d+SP.r+3),pitch=SP.drum+SP.necks,nd=SP.nodes.map(n=>[n[0],F.FL+n[1]*F.k,zk+n[2]]);
  P.spine={id:'sb.spine',nodes:nd,r:SP.r,runs:[],terraces:[]};
  for(let j=0;j<nd.length-1;j++){const a=nd[j],b=nd[j+1],dy=a[1]-b[1],n=Math.max(1,Math.round(dy/pitch)),pp=dy/n,slope=Math.hypot(b[0]-a[0],b[2]-a[2])>1;
   const run={id:'sb.run.'+j,j,slope,drums:[]};P.spine.runs.push(run);
   for(let i=0;i<n;i++){const f=slope?(i+.5)/n:0,y1=a[1]-i*pp-(j>0&&i===0?3:0),y0=Math.max(b[1]+(j<nd.length-2&&i===n-1?3:0),y1-pp+SP.necks);
    const dr={id:'sb.sp.'+j+'.'+i,run:j,i,at:[lerpSB(a[0],b[0],f),y0,lerpSB(a[2],b[2],f)],r:SP.r,h:y1-y0,neck:SP.necks,nr:SP.neck,top:j===0&&i===0};
    P.drums.push(dr);run.drums.push(dr.id);}}
  for(let k=1;k<nd.length-1;k++){const c=nd[k],T={id:'sb.ter.'+k,k,at:c.slice(),r:SP.tr[k]};P.spine.terraces.push(T);P.saucers.push(T);
   if(SP.rotor.indexOf(k)>=0){const s=c[0]>=0?1:-1;P.rotors.push({id:'sb.rot.'+k,terrace:T.id,at:[c[0]+s*T.r*.8,c[1]+4,c[2]],hub:[c[0]+s*SP.arm,c[1]+4,c[2]+40],r:SP.rr,blades:3,ph:h(103,k)*Math.PI*2});}
   if(k===SP.pad)P.spinePad={id:'sb.sp.pad',terrace:T.id,at:[c[0],c[1],c[2]+T.r+32],r:34};
   if(SP.struts.indexOf(k)>=0)T.struts=[-1,1].map(s=>({id:T.id+'.strut.'+(s<0?'w':'e'),a:[c[0]+s*T.r*.9,c[1]-2,c[2]],b:[s*(D.BAY.w/2+14),c[1]-22,F.faceZ(s*(D.BAY.w/2+14),c[1]-22)]}));}
  P.lifts=D.TERM.lifts.map((x,i)=>({id:'sb.lift.'+i,in:'sb.spine',x,y0:F.FL,y1:nd[0][1]}));}
 // the galleries on the face beside the Spine, below the Nock (east by the bay; west beyond the lower hull)
 for(const s of [-1,1])D.GALL.ys.forEach((y,j)=>{const yy=F.FL+y*F.k,sn=s<0?'w':'e',G=D.GALL[sn];
  P.galleries.push({id:'sb.gal.'+sn+'.'+j,side:s,j,x0:s*G[0],x1:s*G[1],y0:yy,y1:yy+D.GALL.storeys*ST,deep:D.GALL.deep});});
 // the pads, the rim gallery, the terminus
 P.pad={id:'sb.pad',at:[D.PAD.at[0],LY,D.PAD.at[1]],r:D.PAD.r,craft:{id:'sb.craft',h:38}};
 P.rim={id:'sb.rim',x0:D.RIM.x1,x1:D.RIM.x0,z0:D.RIM.z1,z1:D.RIM.z0,y0:LY,y1:LY+D.RIM.h};
 // THE FOOT: the lobby round the Spine's foot, the terminus hall, the wings, the plaza (in the bay's mouth and before it)
 {const FT=D.FOOT,nd=P.spine.nodes,zf=nd[nd.length-1][2],L=FT.lobby,H=FT.hall,y0=F.FL,y1=F.FL+D.TERM.h;
  const lobby={id:'sb.lobby',at:[0,y0,zf],r:L.r,y0,y1,core:L.core,ribs:L.ribs,galleries:L.gal.map((y,i)=>({id:'sb.lobby.gal.'+i,y:y0+y,r0:L.r-16,r1:L.r-1})),
   stair:{id:'sb.lobby.stair',r0:L.core+8,r1:L.core+16,turns:2.5}};
  const hall={id:'sb.term',x0:H.x0,x1:H.x1,z0:H.z0,z1:H.z1,y0,y1:y0+H.h,ribs:H.ribs,
   platforms:Array.from({length:H.platforms},(_,i)=>({id:'sb.term.pl.'+i,z:lerpSB(H.z0,H.z1,(i+1)/(H.platforms+1)),x0:H.x0+20,x1:H.x1-8,w:8}))};
  const wing=(k,r,role)=>({id:'sb.foot.'+k,role,x0:r[0],x1:r[1],z0:r[2],z1:r[3],y0,y1:y0+FT.h});
  const wings=[wing('w',FT.wings.w,'offices'),wing('e',FT.wings.e,'works'),wing('back',FT.wings.back,'the back block')];
  const pz=FT.plaza,plaza={id:'sb.plaza',x0:pz.x0,x1:pz.x1,z0:zf+pz.dz,z1:zf+pz.dz+pz.d,y:y0+pz.h,pools:pz.pools.map((x,i)=>({id:'sb.plaza.pool.'+i,at:[x,y0+pz.h,zf+pz.dz+pz.d*.5],r:14}))};
  P.foot={id:'sb.foot',lobby,hall,wings,plaza,
   rects:[[H.x0,H.x1,H.z0,H.z1],[-L.r,L.r,zf-L.r,zf+L.r]].concat(wings.map(w=>[w.x0,w.x1,w.z0,w.z1]),[[plaza.x0,plaza.x1,plaza.z0,plaza.z1]])};
  P.term=hall;
  // the line came in at the hall's west mouth; the valley road ends on the plaza's west side
  P.line={id:'sb.line',pts:[[-1100,F.FL,250],[-600,F.FL,250],[-440,F.FL,75],[H.x0,F.FL,75]],w:12};
  P.road={id:'sb.road',pts:[[-1100,F.FL,330],[-520,F.FL,330],[-260,F.FL,300],[plaza.x0,F.FL,(plaza.z0+plaza.z1)/2]],w:9};}
 // the heliostats: on the lip east of the crown (round the pad) and on the rim gallery's roof; each turned to throw the noon sun
 // (north, 50 degrees up) onto the hull's middle
 {const HL=D.HELIO,sun=HL.sun,aim=[HL.aim[0],F.FL+HL.aim[1]*F.k,HL.aim[2]];
  const put=(x,y,z,row,i,grp)=>{const tx=aim[0]-x,ty=aim[1]-y,tz=aim[2]-z,tl=Math.hypot(tx,ty,tz);
   let nx=sun[0]+tx/tl,ny=sun[1]+ty/tl,nz=sun[2]+tz/tl;const nl=Math.hypot(nx,ny,nz);nx/=nl;ny/=nl;nz/=nl;
   P.helio.push({id:'sb.hel.'+grp+'.'+row+'.'+i,grp,row,i,at:[x,y,z],n:[nx,ny,nz],post:HL.post});};
  [-45,-60,-75].forEach((z,row)=>{for(let i=0,x=200;x<=800;x+=HL.pitch,i++){if(Math.hypot(x-D.PAD.at[0],z-D.PAD.at[1])<D.PAD.r+16)continue;
   put(x,LY+HL.post,z,row,i,'e');}});
  [-60,-76].forEach((z,row)=>{for(let i=0,x=-220;x>=-780;x-=HL.pitch,i++)put(x,P.rim.y1+HL.post,z,row,i,'w');});}
 // the stats
 const pop={bow:P.storeys.reduce((a,k)=>a+k.pop,0)};
 {const Q=P.quiver,n=Math.floor((Q.top-Q.tip)/ST);let q=0;for(let i=0;i<n;i++){const t=(i+.5)/n,w=Q.W/2*Math.pow(1-t,.55),d=Q.D*Math.pow(1-t,.4);
   q+=Math.min(w*d*1.2,2*(w+d)*H.LIT);}pop.quiver=Math.round(q*D.SHARE/D.M2);}
 {const SP=D.SPINE;pop.spine=Math.round(P.drums.reduce((a,d)=>a+Math.PI*d.r*d.r*Math.floor(d.h/ST),0)*.7/D.M2)+Math.round(P.saucers.reduce((a,t)=>a+Math.PI*((t.r-10)*(t.r-10)-SP.r*SP.r)*2,0)*.4/D.M2);}
 pop.galleries=Math.round(P.galleries.reduce((a,g)=>a+Math.abs(g.x1-g.x0)*g.deep*D.GALL.storeys,0)*.7/D.M2);
 pop.rim=Math.round(Math.abs(P.rim.x1-P.rim.x0)*(P.rim.z1-P.rim.z0)*Math.floor(D.RIM.h/ST)*.45/D.M2);
 {const FT=D.FOOT,n=Math.floor(FT.h/ST);pop.foot=Math.round(P.foot.wings.reduce((a,w)=>a+(w.x1-w.x0)*(w.z1-w.z0),0)*n*.3/D.M2);}
 pop.nock=Math.round((2*P.nock.wx)*(P.nock.zc*.6)*D.NOCK.storeys*.45/D.M2);
 P.stats={pop:Object.values(pop).reduce((a,b)=>a+b,0),parts:pop,height:P.mast.head[1]-F.FL,hull:F.top-F.tip,storeys:NK,
  stays:P.stays.length,drums:P.drums.length,helio:P.helio.length};
 return P;};

// ---- the ruin: deltas by id ---------------------------------------------------------------------------------------
STRONGBOW.ruin=function(P){const D=P.dim,R=D.RUIN,F=P.frame,S=P.seed,h=(a,b,c,e)=>STRONGBOW.h(S,a,b,c,e);
 const side=R.side,sn=side<0?'w':'e',RU={gone:[],limp:[],skin:[],helio:[],spineGone:[],debris:[]};
 // the stays: every anchor on the failed side, half its string; some hang limp from the hull
 for(const st of P.stays){if(st.side!==side||st.fan==='ramp'||st.fan==='quiver')continue;
  const snap=st.fan.indexOf('anchor')===0||(st.fan==='string'&&h(201,st.i,st.fan.length)<R.stringGone);
  if(!snap)continue;RU.gone.push(st.id);
  if(h(202,st.i,st.fan.length,st.id.length)<R.limp)RU.limp.push({id:st.id,len:40+160*h(203,st.i,st.id.length)});}
 // the Bow's lean about its hinge at the crown's back (degrees about x: out; about z: the roll)
 RU.lean={hinge:[0,F.lipY,F.back],ax:R.lean,az:R.roll*-side};
 // the Nock: the failed side's wing fallen; the centre goes with the hull
 RU.nockGone=['sb.nock.'+sn];
 // the lower hull fallen into the scree in three pieces
 RU.quiver={id:P.quiver.id,pieces:[0,1,2].map(i=>{const x=P.quiver.x+(i-1)*50+(h(210,i)-.5)*16,z=58+16*i+8*h(211,i);
  return{id:'sb.quiver.p'+i,i,at:[x,F.ground(x,z),z],len:[95,70,60][i],tilt:(h(212,i)-.5)*.9,ry:(h(213,i)-.5)*1.6,roll:1.2+h(214,i)};})};
 // the skin: hull panels lost (storey band, side, segment)
 for(const k of P.storeys)for(const s of [-1,1])for(let j=0;j<D.HULL.NSEG;j++)if(h(220,k.i,s+2,j)<R.skin)RU.skin.push('sb.sk.'+k.i+'.'+s+'.'+j);
 // the mast kinked over to the south-east
 RU.mast={kink:R.mastKink,bend:R.mastBend,dir:[.7071,0,.7071]};
 // the Spine broken at its head: as the tower leaned it tore off the top run and the first terrace, which fell; the rest stands
 // (the Sultanate lives in its lower drums), and the gap parts the town from the Order's house above
 for(const d of P.drums)if(d.run<R.spineBreak){RU.spineGone.push(d.id);const x=(d.i?1:-1)*(200+60*h(231,d.i)),z=250+60*h(232,d.i);
  RU.debris.push({id:d.id+'.fallen',kind:'drum',at:[x,F.ground(x,z),z],r:d.r,ry:h(233,d.i)*Math.PI,roll:h(234,d.i)*.6});}
 for(const t of P.spine.terraces)if(t.k<=R.spineBreak)RU.spineGone.push(t.id);
 // the rotors stripped to their hubs
 RU.rotors=P.rotors.map(r=>({id:r.id,blades:RU.spineGone.indexOf(r.terrace)>=0?-1:0}));
 // the town's lamps in the Spine's lower drums
 RU.lit=P.drums.filter(d=>d.run>=3).map(d=>d.id);
 // the foot: the terminus hall's west half crushed by the fallen lower hull; most of the lobby's glazing gone; the east wing's
 // upper floors burned; the plaza's pools dry
 {const H=P.foot.hall;RU.foot={hallCut:lerpSB(H.x0,H.x1,.57),glass:.7,galleries:P.foot.lobby.galleries.map(g=>({id:g.id,lost:.25+.2*h(250,g.y|0)})),
  burned:{id:'sb.foot.e',storeys:2},dry:true};}
 // the heliostats: most fallen or askew
 for(const m of P.helio){const u=h(240,m.row,m.i,m.grp==='e'?1:2);if(u<R.helio)RU.helio.push({id:m.id,fallen:u<R.helio*.6,tilt:(h(241,m.row,m.i)-.5)*1.4});}
 // the east wing's slab in the scree
 RU.debris.push({id:'sb.nock.'+sn+'.fallen',kind:'slab',at:[side*260,F.ground(side*260,90),90],size:[110,12,60],ry:.3*side,roll:.5});
 // who lives there now (the owner, 2026-11-11): the Xanadui town at the foot, the Order's house above
 RU.town=STRONGBOW.town(P,RU.debris);
 RU.order={id:'sb.order',banners:[-1,1].map(s=>({id:'sb.order.banner.'+(s<0?'w':'e'),at:[s*60,P.crown.y1,F.prowZ(0)-20]})),gate:{id:'sb.order.gate',at:P.ramp.pts[1]},lit:[0,1,2,3,4,5]};
 return RU;};

// the town at the foot (proposed in its parts): houses on a hashed grid before the bay, kept off the terminus, the line, the road
// and the scree; a han where the road ends, a garrison tower
STRONGBOW.town=function(P,debris){const F=P.frame,S=P.seed,h=(a,b,c,e)=>STRONGBOW.h(S,a,b,c,e),T=P.term,out={houses:[]};
 const nearLine=(x,z,pts,w)=>{for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],dx=b[0]-a[0],dz=b[2]-a[2],L2=dx*dx+dz*dz;
  const t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[2])*dz)/L2)),px=a[0]+t*dx-x,pz=a[2]+t*dz-z;if(px*px+pz*pz<w*w)return true;}return false;};
 out.han={id:'sb.town.han',at:[-330,F.FL,390],w:64,d:56};
 out.tower={id:'sb.town.tower',at:[205,F.FL,230],w:14,h:34};
 const C=22;for(let gx=-17;gx<=17;gx++)for(let gz=3;gz<=15;gz++){const u=h(301,gx,gz);if(u>.42)continue;
  const x=gx*C+(h(302,gx,gz)-.5)*8,z=gz*C+(h(303,gx,gz)-.5)*8;
  if(P.foot.rects.some(r=>x>r[0]-14&&x<r[1]+14&&z>r[2]-14&&z<r[3]+14))continue;
  if(nearLine(x,z,P.line.pts,20)||nearLine(x,z,P.road.pts,16))continue;
  if(Math.abs(x-out.han.at[0])<out.han.w/2+10&&Math.abs(z-out.han.at[2])<out.han.d/2+10)continue;
  if(Math.abs(x-out.tower.at[0])<20&&Math.abs(z-out.tower.at[2])<20)continue;
  if(F.scree(x,z)>16)continue;
  if(debris&&debris.some(q=>Math.hypot(q.at[0]-x,q.at[2]-z)<(q.r==null?40:q.r)+14))continue;
  const w=8+8*h(304,gx,gz),d=7+6*h(305,gx,gz),st=1+Math.floor(3*h(306,gx,gz));
  out.houses.push({id:'sb.town.h.'+gx+'.'+gz,at:[x,F.ground(x,z),z],size:[w,st*3.4,d],ry:(h(307,gx,gz)-.5)*.3,storeys:st,colour:Math.floor(4*h(308,gx,gz))});}
 return out;};
