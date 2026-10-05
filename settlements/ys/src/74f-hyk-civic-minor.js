// ================================================================= HYKKOUSOI — civic, minor: the Library of Ys, the Treasury, the Wet Cells
// Three civic buildings in the shell vocabulary (DESIGN §4, §6 "Civic, minor"), landmark grade. The Library is a nautilus
// whose whorls are reading galleries wound round a stepped spiral drum under a lens dome; the Treasury is a strongroom
// of ribbed shell two metres thick with one nacre-sealed door and vents the size of a fist; the Wet Cells are a grey
// barnacle island reached only by water, its wet door a metre above the tide line. Every opening goes through hykDoor
// and hykWin, every lamp sits on a bracket, every room is data with its spots (DESIGN §7). Seeds 30900–30949.
reseed(30900);
// ---------------------------------------------------------------- helpers shared by the three (prefixed hykLib…)
// The vault section of a whorl or a gallery: a flat floor, steep walls, a round crown. `ps` runs round the section from
// the outer equator (0) over the crown (pi/2) to the inner equator (pi) and under the floor; the superellipse exponent
// blends from .55 below the equator (a flat bottom, vertical walls) to 1 at the crown. Returns [lateral, y].
function hykLibSect(a,yc,bl,bu,ps){const c=Math.cos(ps),s=Math.sin(ps);const e=.55+.45*Math.max(0,s);
 return [Math.sign(c)*Math.pow(Math.abs(c),e)*a,s>=0?yc+bu*Math.pow(s,e):yc-bl*Math.pow(-s,e)];}
// the section parameter at a height y on the upper half of the section (bisection: y climbs with ps there)
function hykLibPsAt(yc,bl,bu,y){let lo=-Math.PI/2,hi=Math.PI/2;for(let i=0;i<24;i++){const m=(lo+hi)/2;if(hykLibSect(1,yc,bl,bu,m)[1]<y)lo=m;else hi=m;}return (lo+hi)/2;}
// a closed tube round a loop of points: a lip that follows a mouth, a rib that follows a section
function hykLibLoop(pts,r,col,mat){hykPut(mat||'hkBone',hykTube(pts.concat([pts[0]]),()=>r,{seg:8,col}));}
// a lens dome: the dome lathe on a base ring, lenses in rings, an inner skin, a fluted nacre spire on the crown
function hykLibDome(cx,cz,yB,R,H,o){o=o||{};const col=o.col||hC(hPick(HPAL.nacre)),mat=o.mat||'hkNacre';
 const D={H,cx,cz,yBase:yB,rFn:y=>R*Math.sqrt(Math.max(0,1-Math.pow(y/H,2.2)))+.05,nu:o.nu||48,nv:o.nv||16,rings:{n:4,amp:.02},col};
 hykPut(mat,hykLathe(D));if(o.inner!==false)hykPut('hkIn',hykLathe(Object.assign({},D,{rFn:y=>D.rFn(y)*.93,flip:true,col:hC(hPick(HPAL.shell),.9)})),true);
 kput('hkLipN',[cx,yB+.03,cz],qEuler(Math.PI/2,0,0),[R*1.03,R*1.03,1.3],col);
 const rings=o.rings||[[12,.3],[7,.62]];let k=0;for(const rg of rings){const n=rg[0],y=rg[1]*H,r=D.rFn(y);
  for(let i=0;i<n;i++){const a=(i+.5*k)/n*TAU;kput('hkLens',[cx+r*Math.cos(a)*.985,yB+y,cz+r*Math.sin(a)*.985],null,o.lensR||.3,hC(hPick(HPAL.lens)));}k++;}
 if(o.spire!==false){const SH=o.spire||H*.8;hykPut(mat,hykLathe({H:SH,cx,cz,yBase:yB+H-.35,rFn:y=>(o.spireR||R*.14)*Math.pow(1-y/SH,.85)+.04,nu:16,nv:10,flute:{n:8,amp:.14,sharp:1.3},twist:.8,col}));}
 return D;}
// a sconce on a bracket: the lamp stands `off` out from an anchor on a shell along the direction d
function hykLibSconce(A,d,off,o){const L=Math.hypot(d[0],d[1],d[2])||1;return hykLight(A[0]+d[0]/L*off,A[1]+d[1]/L*off+.1,A[2]+d[2]/L*off,Object.assign({r:.2,bracket:A},o||{}));}
// ---------------------------------------------------------------- the Library of Ys: a nautilus of reading galleries
// The body is one tube wound 1.8 turns on a log spiral, growing from a 4.6 m gallery at the heart to a 14 m chamber at
// the mouth, each whorl lapping the one inside it; the heart is a drum whose radius follows the innermost whorl (a spiral
// itself, stepped once where the first whorl roots), carrying the lens dome of the reading hall. The mouth is closed by
// a nacre septum with the door through it; the scriptorium is a lens-domed pod grown on the west flank.
function buildHykLibrary(G,o){reseed(30901+(o.v|0));
 const col=hC(hPick(HPAL.shell)),colW=hC(hPick(HPAL.shellWarm)),colN=hC(hPick(HPAL.nacre)),colB=hC(hPick(HPAL.bone)),colF=hC(hPick(HPAL.floor)),colL=hC(hPick(HPAL.lens));
 // the spiral: k sets the whorl pitch so each whorl laps the one inside by 7 % of its width
 const R=6.3,T=2,g=.6,T0=.1,k=(1+Math.exp(-g))/(1-Math.exp(-g))*.93;
 const rho=t=>R*Math.exp(g*T*(t-1)),rad=t=>k*rho(t);const ax=-rad(1)+19.75,az=3.0;   // the spiral's centre: the dome stands at the plot centre, the mouth at x = +20
 const ang=t=>-(1-t)*T*TAU;const cen=t=>[ax+rad(t)*Math.cos(ang(t)),az+rad(t)*Math.sin(ang(t))];const Nrm=t=>[Math.cos(ang(t)),Math.sin(ang(t))];
 const flare=t=>{const q=clamp((t-.93)/.07,0,1);return 1+.14*q*q;};const aOf=t=>rho(t)*flare(t),HOf=t=>(3.2+1.15*rho(t))*flare(t);
 const YC=1.6,BL=1.9,FL=.15;
 const surf=(t,ps,kIn)=>{const C=cen(t),N=Nrm(t);const gr=kIn?1:1+.02*Math.sin(t*90*TAU)+.008*Math.sin(t*310*TAU);let [s,y]=hykLibSect(aOf(t)*gr,YC,BL,HOf(t)-YC,ps);   // growth ridges along the whorl
  if(kIn){s*=kIn;y=FL+kIn*(y-FL);}return [C[0]+s*N[0],y,C[1]+s*N[1]];};
 const opAt=(t,ps,r,ky,kind)=>{const p=surf(t,ps,0),p1=surf(t+1e-3,ps,0),p2=surf(t,ps+1e-3,0);const C=cen(t);
  const n=new THREE.Vector3(p2[0]-p[0],p2[1]-p[1],p2[2]-p[2]).cross(new THREE.Vector3(p1[0]-p[0],p1[1]-p[1],p1[2]-p[2])).normalize();
  if(n.x*(p[0]-C[0])+n.z*(p[2]-C[1])+n.y*(p[1]-YC)<0)n.negate();return {p,n:[n.x,n.y,n.z],r,ky:ky||1,kind};};
 const loop=(t,sc,n0,n1,np)=>{const P=[];const N=np||40;for(let i=0;i<=N;i++){const ps=n0+(n1-n0)*i/N;const p=surf(t,ps,0);const C=cen(t);P.push([C[0]+(p[0]-C[0])*sc,YC+(p[1]-YC)*sc,C[1]+(p[2]-C[1])*sc]);}return P;};
 const arcRate=t=>{const a=cen(t),b=cen(t+.001);return Math.hypot(b[0]-a[0],b[1]-a[1])/.001;};
 // the drum at the heart: its radius follows the innermost whorl's inner wall, a log spiral from the first whorl's root
 // (bearing of T0) once round, stepping back where that whorl roots; the dome on it follows the same outline
 const edgeAt=th=>{const d=((th-ang(T0))%TAU+TAU)%TAU;const t=T0+d/(T*TAU);return (k-1)*rho(t)*.97;};
 const HD=9.2,HM=5.6;const prof=y=>y<HD?1+.035*Math.sin(y*1.1)+.01*Math.sin(y*7):Math.sqrt(Math.max(0,1-Math.pow((y-HD)/HM,2.2)))+.012;
 const drumP=(th,y,kIn)=>{const r=edgeAt(th)*prof(y)*(kIn||1);return [ax+r*Math.cos(th),kIn?FL+kIn*(y-FL):y,az+r*Math.sin(th)];};
 const inDrum=p=>p[1]<HD+HM&&Math.hypot(p[0]-ax,p[2]-az)<edgeAt(Math.atan2(p[2]-az,p[0]-ax))*prof(Math.max(0,p[1]))-.15;
 // openings. The hall door is on the first whorl's inner wall at t .22 (its lip faces the gallery, the reveal runs through
 // both walls into the hall, which cuts its own hole); the galleries' windows sit high on the outer wall of the outer turn,
 // clear of the scriptorium's root at t .74
 const TD=.22,TS=.74,PR=4.2;
 const hallOp=(()=>{const q=opAt(TD,Math.PI,1.0,1.2,'door');const p=surf(TD,Math.PI,.92);const L=Math.hypot(q.n[0],q.n[2])||1;return {p:[p[0],FL+1.2,p[2]],n:[-q.n[0]/L,0,-q.n[2]/L],r:1.0,ky:1.2,kind:'door'};})();
 const hallIn={p:[hallOp.p[0]-hallOp.n[0]*.95,FL+1.2,hallOp.p[2]-hallOp.n[2]*.95],n:hallOp.n,r:1.15,ky:1.2};
 const wins=[.52,.58,.64,.68,.80,.86,.92].map(t=>opAt(t,.35,.72+.3*(t-.5),1.25,'window'))
  .concat([.49,.55,.61,.66,.77,.83,.89,.95].map(t=>opAt(t,.66,.42+.2*(t-.5),1,'window')));   // a second, smaller row high on the vault
 // the scriptorium pod: rooted on the outer whorl's west flank, its back door through the whorl's wall
 const Cs=cen(TS),Ns=Nrm(TS);const sx=Cs[0]+Ns[0]*(aOf(TS)+PR*.78),sz=Cs[1]+Ns[1]*(aOf(TS)+PR*.78);const thB=Math.atan2(-Ns[0],-Ns[1]);
 const pod=hykPod({a:PR,b:3.6,c:PR,cy:2.5,e1:.86,e2:.9,nu:56,nv:30,noise:{amp:.02,su:4,sv:3,seed:7},col:colW,hollow:{t:.07,col:colW},
  openings:[{th:thB,el:-.27,r:1.0,ky:1.2,kind:'door'},{th:thB+Math.PI,el:.12,r:.62,kind:'window'},{th:thB+Math.PI+.95,el:.2,r:.5,kind:'window'},{th:thB+Math.PI-.95,el:.2,r:.5,kind:'window'},{th:thB+Math.PI+.4,el:.9,r:.4,kind:'window'}]});
 pod.geo.translate(sx,0,sz);pod.inner.translate(sx,0,sz);for(const op of pod.openings)op.p=[op.p[0]+sx,op.p[1],op.p[2]+sz];
 const pdo=pod.openings[0];const bodyOps=wins.concat([hallOp,{p:[pdo.p[0]+Ns[0]*.9,pdo.p[1],pdo.p[2]+Ns[1]*.9],n:pdo.n,r:1.1,ky:1.2}]);
 // the body and its inner skin
 const NU=440,NV=36;const hole=hykHoleOf(bodyOps);const sp=t=>T0+t*(1-T0);
 let Lb=0;for(let i=0;i<200;i++){const a=cen(sp(i/200)),b=cen(sp((i+1)/200));Lb+=Math.hypot(b[0]-a[0],b[1]-a[1]);}
 hykPut('hkShell',hykSurf((u,v)=>surf(sp(u),v*TAU,0),NU,NV,{col,uS:Lb/4,vS:9,hole:(u,v,p)=>inDrum(p)||hole(u,v,p)}));
 hykPut('hkIn',hykSurf((u,v)=>surf(sp(u),v*TAU,.92),NU,NV,{col:hC(hPick(HPAL.shell),.92),uS:Lb/4,vS:9,flip:true,hole:(u,v,p)=>inDrum(p)||hole(u,v,p)}));
 // the first whorl's root: a shell cap over its end where it leaves the drum's step
 {const P=loop(T0,1,0,TAU,36);const C=cen(T0);hykPut('hkShell',hykSurf((u,v)=>{const q=P[Math.round(u*36)];return [C[0]+(q[0]-C[0])*v,YC+(q[1]-YC)*v,C[1]+(q[2]-C[1])*v];},36,3,{col:colW,flip:true}));}
 // the drum and the dome, their inner skins, the nacre band at the drum's top, the lens rings, the spire
 // a ring of lipped windows on the drum's band above the whorls' roofs, for the hall's light
 const drumWins=[];for(let i=0;i<9;i++){const th=ang(T0)+.45+i*TAU/9;const p=drumP(th,HD-1.6,0);const e=.03;const p2=drumP(th+e,HD-1.6,0),p3=drumP(th,HD-1.6+e,0);
  const n=new THREE.Vector3(p3[0]-p[0],p3[1]-p[1],p3[2]-p[2]).cross(new THREE.Vector3(p2[0]-p[0],p2[1]-p[1],p2[2]-p[2])).normalize();if(n.x*(p[0]-ax)+n.z*(p[2]-az)<0)n.negate();
  drumWins.push({p,n:[n.x,n.y,n.z],r:.48,ky:1.2,kind:'window'});}
 const drumHole=hykHoleOf([hallIn].concat(drumWins));
 hykPut('hkShell',hykSurf((u,v)=>drumP(u*TAU,-.3+v*(HD+HM+.3),0),96,44,{col:colW,uS:9,vS:3.5,hole:drumHole}));
 hykPut('hkIn',hykSurf((u,v)=>drumP(u*TAU,v*(HD+HM),.9),96,44,{col:hC(hPick(HPAL.shell),.9),uS:9,vS:3.5,flip:true,hole:drumHole}));
 {const P=[];for(let i=0;i<72;i++){const p=drumP(i/72*TAU,HD-.2,0);P.push([ax+(p[0]-ax)*1.015,p[1],az+(p[2]-az)*1.015]);}hykLibLoop(P,.3,colN,'hkNacre');
  for(const rg of [[16,HD+HM*.3],[9,HD+HM*.62]])for(let i=0;i<rg[0];i++){const th=(i+.3)/rg[0]*TAU;const p=drumP(th,rg[1],0);kput('hkLens',[ax+(p[0]-ax)*.985,p[1],az+(p[2]-az)*.985],null,.32,colL);}
  hykPut('hkNacre',hykLathe({H:5.4,cx:ax,cz:az,yBase:HD+HM-.4,rFn:y=>.8*Math.pow(1-y/5.4,.85)+.04,nu:16,nv:10,flute:{n:8,amp:.14,sharp:1.3},twist:.8,col:colN}));
  kput('hkLipN',[ax,HD+HM-.42,az],qEuler(Math.PI/2,0,0),[1.2,1.2,1.2],colN);}
 // the hall's floor (the drum's own outline), the galleries' floors along the spiral
 hykPut('hkFloor',hykSurf((u,v)=>{const th=u*TAU;const r=edgeAt(th)*.93*v;return [ax+r*Math.cos(th),FL,az+r*Math.sin(th)];},72,3,{col:colF,flip:true}),true);
 for(let t=T0+.02;t<=.995;t+=.012){const C=cen(t);hykFloor(C[0],C[1],FL,aOf(t)*.95,{col:colF,nu:20});}
 // the mouth: a nacre lip round the aperture, the septum two metres in with the door and its windows through it (seen
 // from the porch and from the chart room), the porch floor and the shell-paved forecourt, sconces either side of the door
 hykLibLoop(loop(1,1.0,0,TAU,48),.5,colN,'hkNacre');
 const TSEP=.991;const Cm=cen(TSEP),Cm2=cen(TSEP+.004);let tgx=Cm2[0]-Cm[0],tgz=Cm2[1]-Cm[1];{const L=Math.hypot(tgx,tgz)||1;tgx/=L;tgz/=L;}const Nm=Nrm(TSEP);
 const sepOps=[{p:[Cm[0],FL+1.2,Cm[1]],n:[tgx,0,tgz],r:1.05,ky:1.2,kind:'door'},{p:[Cm[0]+Nm[0]*3.8,3.0,Cm[1]+Nm[1]*3.8],n:[tgx,0,tgz],r:.85,ky:1,kind:'window'},
  {p:[Cm[0]-Nm[0]*3.8,3.0,Cm[1]-Nm[1]*3.8],n:[tgx,0,tgz],r:.85,ky:1,kind:'window'},{p:[Cm[0],7.4,Cm[1]],n:[tgx,0,tgz],r:1.5,ky:1,kind:'window'}];
 {const P=loop(TSEP,.985,0,TAU,48);const sepFn=(u,v)=>{const q=P[Math.round(u*48)];return [Cm[0]+(q[0]-Cm[0])*v,YC+(q[1]-YC)*v,Cm[1]+(q[2]-Cm[1])*v];};const sh=hykHoleOf(sepOps);
  hykPut('hkNacre',hykSurf(sepFn,48,6,{col:colN,hole:sh}));hykPut('hkIn',hykSurf(sepFn,48,6,{col:hC(hPick(HPAL.nacre),.9),hole:sh,flip:true}),true);}
 for(const op of sepOps){if(op.kind==='door')hykDoor(op,{level:'ground',nacre:true,depth:.6,room:'chart room'});else hykWin(op,{nacre:true,lit:true});}
 hykPut('hkFloor',hykDisc(Cm[0]+tgx*5.5,.04,Cm[1]+tgz*5.5,7.2,{col:colF,lobes:{n:11,amp:.06}}));
 for(const s of [-1,1]){const A=[Cm[0]+Nm[0]*s*2.3,FL+3.1,Cm[1]+Nm[1]*s*2.3];hykLibSconce(A,[tgx,0,tgz],.45,{nacre:true});}
 // the galleries' openings: lips and reveals on the whorl's wall, the hall door, the scriptorium's door and windows
 for(const w of wins)hykWin(w,{nacre:true,lit:true});for(const w of drumWins)hykWin(w,{nacre:true,lit:true});
 hykDoor(hallOp,{level:'ground',nacre:true,depth:1.3,room:'reading hall'});
 hykPut('hkShell',pod.geo);hykPut('hkIn',pod.inner,true);
 for(const op of pod.openings){if(op.kind==='door')hykDoor(op,{level:'ground',nacre:true,depth:1.4,room:'scriptorium'});else hykWin(op,{nacre:true,lit:true});}
 // the pod's root on the whorl: a fillet that follows the curved wall (a planar flare would stand off its top rim), and
 // its fillet into the ground; the floor; the lens dome on its crown; a sconce beside the windows
 {const RF=2.7,FF=1.1;const bu=HOf(TS)-YC;const rate=arcRate(TS);
  hykPut('hkShell',hykSurf((u,v)=>{const th=u*TAU,s=v*Math.PI/2;const r=(RF+FF*(1-Math.sin(s)))*(1+.03*Math.sin(th*5)),off=FF*(1-Math.cos(s));
   const y=2.4+r*Math.sin(th);const t=TS+r*Math.cos(th)/rate;const ps=hykLibPsAt(YC,BL,bu,y);const w=surf(t,ps,0);const C=cen(t),N=Nrm(t);
   return [w[0]+N[0]*off*.99,y,w[2]+N[1]*off*.99];},40,8,{col:colW,uS:TAU*RF/4,vS:FF/4,flip:true}));}
 hykPut('hkShell',hykFlare([sx,0,sz],[0,1,0],PR*.96,1.3,{col:colW}));hykFloor(sx,sz,FL,PR*.86,{col:colF});
 hykLibDome(sx,sz,5.55,2.2,1.7,{rings:[[9,.35]],lensR:.24,spire:1.6,spireR:.3});
 {const th=thB+Math.PI+.5;const A=[sx+Math.sin(th)*PR*.96,3.3,sz+Math.cos(th)*PR*.96];hykLibSconce(A,[Math.sin(th),0,Math.cos(th)],.45,{nacre:true});}
 // ribs over the outer whorl's roof and arches across the galleries at the room boundaries, both ending in the ground;
 // fillets at the whorl's foot; lenses in a line along each whorl's crown
 for(let t=.44;t<.96;t+=.055)hykPut('hkBone',hykTube(loop(t,1.03,-.85,Math.PI+.85,30),()=>.27,{seg:8,col:colB}));
 for(const t of [.42,.64,.84])hykPut('hkBone',hykTube(loop(t,.95,-.9,Math.PI+.9,30),()=>.2,{seg:8,col:colB}));
 for(let t=.5;t<.98;t+=.05){const C=cen(t);hykPut('hkShell',hykFlare([C[0],.02,C[1]],[0,1,0],aOf(t)*.92,aOf(t)*.3,{col}));}
 for(let t=.14;t<.97;t+=.035){const p=surf(t,Math.PI/2,0);kput('hkLens',[p[0],p[1]-.08,p[2]],null,.27,colL);}
 // sconces inside: on the inner skin of the galleries high on the outer wall, and round the hall
 for(const t of [.2,.33,.48,.6,.72,.83,.93]){const A=surf(t,.5,.92);const N=Nrm(t);hykLibSconce(A,[-N[0],-.2,-N[1]],.5,{nacre:true});}
 for(let i=0;i<4;i++){const th=ang(T0)+.6+i*1.4;const A=drumP(th,4.2,.9);hykLibSconce(A,[ax-A[0],0,az-A[2]],.5,{nacre:true});}
 // rooms: the reading hall (the drum), four galleries along the spiral, the scriptorium. Shelf spots along the gallery
 // walls, reading tables down the middle; every spot a metre clear of the doors and of each other (the probe checks)
 const hallPoly=[];for(let i=0;i<36;i++){const th=i/36*TAU;const r=edgeAt(th)*.86;hallPoly.push([ax+r*Math.cos(th),az+r*Math.sin(th)]);}
 const hall=hykRoom('library',hallPoly,FL,HD-.5,{doors:[[hallOp.p[0],hallOp.p[2],2.0,'tide-tables gallery']],wealth:1});
 hykSpot(hall,'table',ax+.9,az+.4,ang(T0)+.3,1.6,.9);hykSpot(hall,'table',ax-1.1,az-1.0,ang(T0)-.9,1.6,.9);
 {const thD=Math.atan2(hallOp.p[2]-az,hallOp.p[0]-ax);for(let i=0;i<5;i++){const th=ang(T0)+.9+i*1.05;if(Math.abs(Math.atan2(Math.sin(th-thD),Math.cos(th-thD)))<.55)continue;
  const r=edgeAt(th)*.86-.9;hykSpot(hall,'shelf',ax+r*Math.cos(th),az+r*Math.sin(th),-th-Math.PI/2,2.4,.6);}}
 const innerW=t=>Math.min(aOf(t)*.8,rad(t)-edgeAt(ang(t))*prof(1)-.5);
 const strip=(ta,tb)=>{const P=[];const n=24;for(let i=0;i<=n;i++){const t=ta+(tb-ta)*i/n;const C=cen(t),N=Nrm(t);const w=aOf(t)*.8;P.push([C[0]+N[0]*w,C[1]+N[1]*w]);}
  for(let i=n;i>=0;i--){const t=ta+(tb-ta)*i/n;const C=cen(t),N=Nrm(t);const w=innerW(t);P.push([C[0]-N[0]*w,C[1]-N[1]*w]);}return P;};
 const arcT=(ta,s)=>{let t=ta,acc=0;while(acc<s&&t<1){acc+=arcRate(t)*.001;t+=.001;}return t;};
 const arcLen=(ta,tb)=>{let acc=0;for(let t=ta;t<tb;t+=.001)acc+=arcRate(t)*.001;return acc;};
 const galleries=[[.16,.42,'tide-tables gallery'],[.42,.64,'chart gallery'],[.64,.84,'scroll gallery'],[.84,.985,'chart room']];
 galleries.forEach((gy,gi)=>{const [ta,tb,name]=gy;const doors=[];const A=cen(ta),B=cen(tb);
  if(gi>0)doors.push([A[0],A[1],aOf(ta)*1.4,galleries[gi-1][2]]);if(gi<3)doors.push([B[0],B[1],aOf(tb)*1.4,galleries[gi+1][2]]);
  if(gi===0)doors.push([hallOp.p[0],hallOp.p[2],2.0,'reading hall']);if(gi===2)doors.push([pdo.p[0],pdo.p[2],2.0,'scriptorium']);if(gi===3)doors.push([Cm[0],Cm[1],2.1,'street']);
  const rm=hykRoom('library',strip(ta,tb),FL,HOf(ta)-.6,{doors,wealth:1});
  const L=arcLen(ta,tb);const m0=2.6,m1=2.8;const nS=Math.floor((L-m0-m1)/2.3);
  for(let i=0;i<nS;i++){const s=m0+i*2.3+1.15;const t=arcT(ta,s);const C=cen(t),N=Nrm(t);const ry=Math.PI/2-ang(t);
   const w=aOf(t)*.8-.72;if(!(gi===2&&Math.abs(t-TS)<.018))hykSpot(rm,'shelf',C[0]+N[0]*w,C[1]+N[1]*w,ry,2.4,.6);   // .72 in: a straight shelf on a curved, growing wall
   const wi=innerW(t)-.72;if(gi>0&&wi>1.1&&i%2===1)hykSpot(rm,'shelf',C[0]-N[0]*wi,C[1]-N[1]*wi,ry,2.4,.6);}
  const nT=gi===0?1:gi===3?3:2;for(let i=0;i<nT;i++){const s=L*(i+1)/(nT+1);const t=arcT(ta,s);const C=cen(t),N=Nrm(t);const off=gi===0?-(innerW(t)-1.0):0;
   hykSpot(rm,'table',C[0]+N[0]*off,C[1]+N[1]*off,-ang(t),1.6,.9);}});
 const scr=hykRoom('workshop',hykCirclePoly(sx,sz,PR*.74,16),FL,4.6,{doors:[[pdo.p[0],pdo.p[2],2.0,'scroll gallery']],wealth:1});
 for(const da of [-.85,0,.85]){const th=thB+Math.PI+da;const r=PR*.74-.55;hykSpot(scr,'work',sx+Math.sin(th)*r,sz+Math.cos(th)*r,th+Math.PI,1.4,.8);}
 hykSpot(scr,'table',sx-Math.sin(thB+Math.PI)*.7,sz-Math.cos(thB+Math.PI)*.7,thB,1.6,.9);
 {const th=thB+Math.PI/2;hykSpot(scr,'store',sx+Math.sin(th)*(PR*.74-.6),sz+Math.cos(th)*(PR*.74-.6),th,1.2,.7);}
 hykReg('The Library of Ys',-3,0,27,20);}
HYK.def({key:'hyk_library',name:'The Library of Ys',family:'civic',row:'Civic',w:54,d:40,h:20,r:27,inside:true,tags:{type:['civic'],wealth:'civic',lit:true},build:buildHykLibrary});
// ---------------------------------------------------------------- a barnacle cone: the Wet Cells' unit (and the Treasury's satellites)
// b:{cx,cz,rb,rt,h,yBase,dir,tilt}; o:{mat,col,ops,inOps,inner (the inner skin's share of r, false for none),flare,bottom,seed}
function hykCellCone(b,o){o=o||{};const mat=o.mat||'hkBarn',col=o.col||hC(hPick(HPAL.barnacle),.8);
 const L={H:b.h,cx:b.cx,cz:b.cz,yBase:b.yBase||0,rFn:y=>b.rb+(b.rt-b.rb)*Math.pow(clamp(y/b.h,0,1),.75),nu:o.nu||44,nv:o.nv||18,flute:{n:o.fl||16,amp:.07,sharp:1.5},rings:{n:7,amp:.02},noise:{amp:.03,su:5,sv:1.2,seed:o.seed||1},tilt:{amp:b.tilt!=null?b.tilt:.2,dir:b.dir||0},col,ops:o.ops};
 hykPut(mat,hykLathe(L));
 if(o.inner!==false)hykPut('hkIn',hykLathe(Object.assign({},L,{rFn:y=>L.rFn(y)*(o.inner||.9),flip:true,col:hC(col.getHex(),.9),ops:o.inOps||o.ops})),true);
 if(o.flare!==false)hykPut(mat,hykFlare([b.cx,L.yBase+.05,b.cz],[0,1,0],b.rb*.98,b.rb*.32,{col}));
 if(o.bottom)hykPut(mat,hykDisc(b.cx,L.yBase+.02,b.cz,b.rb*1.02,{col,down:true}));
 // the lid: a domed plate over the tilted rim (the operculum), the vent at its centre with its lip
 const hAt=th=>b.h*(1-L.tilt.amp*.5*(1+Math.cos(th-L.tilt.dir)));const rtAt=th=>L.rFn(hAt(th))*(1+L.flute.amp*Math.pow(.5+.5*Math.cos(L.flute.n*th),L.flute.sharp));
 hykPut(mat,hykSurf((u,v)=>{const th=u*TAU;const r=rtAt(th)*v;return [b.cx+r*Math.cos(th),L.yBase+hAt(th)+b.rt*.28*(1-v*v)-.04,b.cz+r*Math.sin(th)];},40,5,{col:hC(col.getHex(),.95),flip:true,hole:(u,v)=>v<.22}));
 const vy=L.yBase+hAt(L.tilt.dir+Math.PI)*.5+hAt(L.tilt.dir)*.5+b.rt*.26;kput(o.nacre?'hkLipN':'hkLip',[b.cx,vy,b.cz],qEuler(Math.PI/2,0,0),[b.rt*.24,b.rt*.24,1.2],col);
 return L;}
// ---------------------------------------------------------------- the Treasury: the strongroom in the Citadel's court
// A squat ribbed dome two metres thick: a shell within a shell, the one door's reveal running the whole way through,
// its nacre lens-disc seal hinged at the jamb and swung open, and no windows: fist-sized vents only, high in the flute
// troughs. Ten bone ribs run from the skirt to the nacre boss at the crown; the guard's niche is a small barnacle grown
// on the flank beside the door, open to the court.
function buildHykTreasury(G,o){reseed(30921+(o.v|0));
 const col=hC(hPick(HPAL.shell)),colW=hC(hPick(HPAL.shellWarm)),colN=hC(hPick(HPAL.nacre)),colB=hC(hPick(HPAL.bone)),colF=hC(hPick(HPAL.floor));
 const RB=9.2,HB=11.5,FL=.2,TK=.76,NF=14;   // base radius, height, the floor, the inner shell's share of the radius (a 2.2 m wall), flutes
 const rOut=y=>RB*Math.sqrt(Math.max(0,1-Math.pow(clamp(y/HB,0,1),2.4)))*(1+.05*Math.sin(y*1.2))+.03;
 const trR=(th,y)=>rOut(y)*(1+.07*Math.pow(.5+.5*Math.cos(NF*th),1.4))*(1+.018*Math.sin(y*4.9))*(1+.02*(fbm(th*1.6,y*.5,3.3,2)-.5));
 const trP=(th,y,kIn)=>{const r=trR(th,y)*(kIn||1);return [r*Math.cos(th),kIn?FL+kIn*(y-FL):y,r*Math.sin(th)];};
 const trN=(th,y)=>{const p=trP(th,y),p1=trP(th+.01,y),p2=trP(th,y+.02);const n=new THREE.Vector3(p2[0]-p[0],p2[1]-p[1],p2[2]-p[2]).cross(new THREE.Vector3(p1[0]-p[0],p1[1]-p[1],p1[2]-p[2])).normalize();
  if(n.x*p[0]+n.z*p[2]<0)n.negate();return [n.x,n.y,n.z];};
 // the door in the front trough, the vents in the other troughs at two heights, each with its twin on the inner shell
 const thD=Math.PI/2;const door={p:trP(thD,FL+1.2),n:trN(thD,FL+1.2),r:1.0,ky:1.2,kind:'door'};const doorIn={p:trP(thD,FL+1.2,TK),n:[0,0,1],r:1.08,ky:1.2};
 const vents=[],ventsIn=[];for(let m=0;m<NF;m++){if(m===3)continue;const th=(2*m+1)*Math.PI/NF;const y=m%2?6.4:8.1;vents.push({p:trP(th,y),n:trN(th,y),r:.22,ky:1,kind:'window'});ventsIn.push({p:trP(th,y,TK),n:trN(th,y),r:.26,ky:1});}
 const holeOut=hykHoleOf([door].concat(vents)),holeIn=hykHoleOf([doorIn].concat(ventsIn));
 hykPut('hkShell',hykSurf((u,v)=>trP(u*TAU,-.3+v*(HB+.3)),112,48,{col,uS:TAU*RB/4,vS:HB/4,hole:holeOut}));
 hykPut('hkIn',hykSurf((u,v)=>trP(u*TAU,v*HB*.84,TK),112,40,{col:hC(hPick(HPAL.shell),.9),uS:TAU*RB*TK/4,vS:HB/4,flip:true,hole:holeIn}));
 hykPut('hkShell',hykFlare([0,0,0],[0,1,0],RB*.99,2.4,{col}));hykFloor(0,0,FL,RB*TK*.97,{col:colF});
 hykDoor(door,{level:'ground',nacre:true,depth:2.3,room:'vault'});for(const v of vents)hykWin(v,{open:true,depth:2.2});
 // the seal: a nacre lens-disc studded with pearls, hinged on two knuckles at the left jamb and swung open on the court
 {const ph=1.15;const hg=[door.p[0]-1.08,FL+1.2,door.p[2]+.12];const E1=[Math.cos(ph),0,Math.sin(ph)],dn=[-Math.sin(ph),0,Math.cos(ph)];const dc=[hg[0]+E1[0]*1.3,hg[1],hg[2]+E1[2]*1.3];
  hykPut('hkNacre',hykSurf((u,v)=>{const a=u*TAU,b=v*Math.PI;const s=Math.sin(b),c=Math.cos(b);return [dc[0]+E1[0]*1.32*s*Math.cos(a)+dn[0]*.26*c,dc[1]+1.5*s*Math.sin(a),dc[2]+E1[2]*1.32*s*Math.cos(a)+dn[2]*.26*c];},36,12,{col:colN,uS:2,vS:1}));
  for(let i=0;i<10;i++){const a=i/10*TAU;kput('hkBall',[dc[0]+E1[0]*1.05*Math.cos(a)+dn[0]*.25,dc[1]+1.2*Math.sin(a),dc[2]+E1[2]*1.05*Math.cos(a)+dn[2]*.25],null,.1,colN);}
  kput('hkBall',[dc[0]+dn[0]*.3,dc[1],dc[2]+dn[2]*.3],null,[.22,.22,.12],colN);
  for(const dy of [-.95,.95])kput('hkBall',[hg[0],hg[1]+dy,hg[2]],null,.17,colN);}
 // the ribs: ten, from the skirt up the dome into the nacre boss at the crown, knuckled; the boss and its pearl
 for(let i=0;i<10;i++){const th=thD+(i+.5)*TAU/10;const pts=[];for(let y=-.5;y<HB-.7;y+=.5){const p=trP(th,Math.max(0,y));const r=Math.hypot(p[0],p[2])*1.04+.1;pts.push([r*Math.cos(th),y,r*Math.sin(th)]);}
  pts.push([.9*Math.cos(th),HB-.2,.9*Math.sin(th)],[.3*Math.cos(th),HB+.05,.3*Math.sin(th)]);hykPut('hkBone',hykTube(pts,t=>.3*(1-.35*t)*(1+.25*Math.max(0,Math.cos(t*7*TAU))),{seg:8,col:colB}));}
 hykPut('hkNacre',hykLathe({H:1.1,cx:0,cz:0,yBase:HB-.5,rFn:y=>1.5*Math.sqrt(Math.max(0,1-Math.pow(y/1.1,2)))+.05,nu:28,nv:8,col:colN}));kput('hkBall',[0,HB+.75,0],null,.42,colN);
 // the guard's niche: a small barnacle on the flank east of the door, rooted to the shell and the ground, open to the court
 const thN=thD-.62;const nr=2.4,nx=Math.cos(thN)*(RB+1.55),nz=Math.sin(thN)*(RB+1.55);
 const Ln={cx:nx,cz:nz,rb:nr,rt:1.75,h:3.9,yBase:-.2,dir:thN+Math.PI,tilt:.16};
 const nOp=hykLatheAt({cx:nx,cz:nz,yBase:-.2,rFn:y=>Ln.rb+(Ln.rt-Ln.rb)*Math.pow(clamp(y/Ln.h,0,1),.75)},Math.PI/2,FL+1.25);nOp.r=.85;nOp.ky=1.25;nOp.kind='window';
 hykCellCone(Ln,{mat:'hkShell',col:colW,ops:[nOp],inner:.84,fl:12,seed:4,nacre:true});hykWin(nOp,{open:true,nacre:true,depth:.5});
 {const c=trP(thN,1.9);hykPut('hkShell',hykFlare([c[0],1.9,c[2]],[Math.cos(thN),0,Math.sin(thN)],1.7,1.0,{col:colW}));}
 hykFloor(nx,nz,FL,nr*.8,{col:colF});
 // satellites: three blind barnacles at the skirt, each with a vent
 for(const s of [{th:thD+2.1,rb:1.7,h:2.6,d:.3},{th:Math.PI+.5,rb:2.1,h:3.3,d:.5},{th:-Math.PI/2+.8,rb:1.35,h:2.1,d:.2}]){const cx=Math.cos(s.th)*(RB+s.rb*.55),cz=Math.sin(s.th)*(RB+s.rb*.55);
  const b={cx,cz,rb:s.rb,rt:s.rb*.68,h:s.h,yBase:-.3,dir:s.th,tilt:.22};const L2={cx,cz,yBase:-.3,rFn:y=>b.rb+(b.rt-b.rb)*Math.pow(clamp(y/b.h,0,1),.75)};
  const v=hykLatheAt(L2,s.th+.5,s.h*.5);v.r=.2;hykCellCone(b,{mat:'hkShell',col,ops:[v],inner:false,fl:11,seed:(s.th*7|0)+2});hykWin(v,{open:true,depth:.4});}
 // lamps: a pair of nacre sconces either side of the door, four round the vault
 for(const s of [-1,1]){const th=thD+s*.17;const A=trP(th,3.4);hykLibSconce(A,trN(th,3.4),.45,{nacre:true});}
 for(let i=0;i<4;i++){const th=thD+Math.PI/4+i*Math.PI/2;const A=trP(th,3.6,TK);hykLibSconce(A,[-A[0],0,-A[2]],.5,{nacre:true});}
 // rooms: the vault with its chests round the wall, the tally table and two stores; the niche with its seat
 const rv=RB*TK*.9;const vault=hykRoom('vault',hykCirclePoly(0,0,rv,20),FL,HB*.84-.6,{doors:[[0,RB*TK,2.0]],wealth:1});
 for(let i=1;i<8;i++){const th=thD+i*TAU/8;const r=rv-.6;hykSpot(vault,'chest',r*Math.cos(th),r*Math.sin(th),-th-Math.PI/2,1.2,.7);}
 hykSpot(vault,'table',0,-.4,0,1.6,.9);hykSpot(vault,'store',-2.6,2.0,.6,1.2,.7);hykSpot(vault,'store',2.6,2.0,-.6,1.2,.7);
 const niche=hykRoom('hall',hykCirclePoly(nx,nz,nr*.68,14),FL,3.0,{doors:[[nOp.p[0],nOp.p[2],1.7]],wealth:1});hykSpot(niche,'seat',nx,nz-.75,0,1.0,.9);
 hykReg('The Treasury',0,0,13,13);}
HYK.def({key:'hyk_treasury',name:'The Treasury',family:'civic',row:'Civic',w:24,d:24,h:13,r:13,inside:true,tags:{type:['civic'],wealth:'civic',lit:true},build:buildHykTreasury});
// ---------------------------------------------------------------- the Wet Cells: the prison, a barnacle island reached only by water
// Local y = 0 is the water datum: the island's rock rises from the bed (o.sink below the datum: 2.6 on the sheet's land
// shelf, the real depth in the city, where it stands at the foot of the Needle) to a top at +1.0 with the tide's crust
// band and weed round it, drowned cell mouths below the line, and the colony on top: the warders' cone at the centre with
// the one wet door at +1 and the one cool lamp, twelve cell cones clinging to its flank, blind barnacles in the gaps and
// on its shoulder. No bridge, no landing above the wet datum, no stair up the outside: a lily-pad landing at +1 at the
// rock's edge, with steps into the water, is the only way in. Travis (Oct 5 2026): bigger and more ominous: the rock
// 15 m across the top, the cone 11 m tall and leaning, darker, and a ring of bone stakes leaning out over the water.
function buildHykWetCells(G,o){reseed(30941+(o.v|0));
 const grey=k=>hC(hPick(HPAL.barnacle),k||.62);const colR=hC(hPick(HPAL.barnacle),.42),colC=hC(hPick(HPAL.crust),.8),colWd=hC(hPick(HPAL.weed),.8),colB=hC(hPick(HPAL.bone),.62),colF=hC(hPick(HPAL.floor),.7);
 const TOP=1.0,FL=1.3,hz=-1.8,SK=Math.max(2.6,+o.sink||0),R0=15.0;   /* R0: the rock's radius at the top; it flares .55 m per metre down to the bed */
 // the rock: a lobed lathe from the sea bed to the top plate, the crust band straddling the waterline, weed hanging from
 // it, barnacle specks, and eight drowned mouths below the line
 const rock={H:TOP+SK,cx:0,cz:0,yBase:-SK,rFn:y=>R0+.55*(TOP+SK-y),nu:96,nv:Math.max(10,Math.round(SK*2.5)),lobes:{n:5,amp:.08,ph:.4},flute:{n:9,amp:.035,sharp:1.3},noise:{amp:.06,su:6,sv:.8,seed:3},col:colR};
 const rAt=y=>rock.rFn(y+SK);   /* the rock's radius at a local y */
 const mouths=[];for(let i=0;i<8;i++){const th=.35+i*TAU/8;const q=hykLatheAt(rock,th,SK-.6);mouths.push({p:q.p,n:q.n,r:.8,ky:1.2,kind:'window'});}
 rock.ops=mouths;hykPut('hkBarn',hykLathe(rock));for(const m of mouths)hykWin(m,{open:true,depth:1.6,level:'wet'});
 hykPut('hkBarn',hykDisc(0,TOP,0,R0-1.4,{col:colR,lobes:{n:5,amp:.08},sag:.25,nu:72}));
 hykPut('hkCrust',hykLathe({H:2.1,yBase:-1.3,cx:0,cz:0,rFn:y=>rAt(y-1.3)*1.0+.12,nu:96,nv:6,lobes:{n:5,amp:.08,ph:.4},noise:{amp:.05,su:7,sv:.6,seed:11},col:colC}));
 for(let i=0;i<56;i++){const a=i/56*TAU+rr(-.1,.1);const r=rAt(.5)*(1+.08*Math.cos(5*a+.4))+.2;const h=rr(1.2,3.0),w=rr(.5,1.1);kput('hkWeedCard',[r*Math.cos(a),.5-h/2,r*Math.sin(a)],qFacing([Math.cos(a),0,Math.sin(a)]),[w,h,1],colWd);}
 for(let i=0;i<180;i++){const a=rng()*TAU,y=rr(-1.2,1.0);const r=rAt(y)*(1+.08*Math.cos(5*a+.4))+.06;const s=rr(.08,.22);kput('hkBarnB',[r*Math.cos(a),y,r*Math.sin(a)],null,[s,s*.7,s],grey(.5));}
 // the stakes: bone stakes round the rim, leaning out over the water, a few snapped
 for(let i=0;i<22;i++){const a=i/22*TAU+rr(-.08,.08);if(Math.abs(a-Math.PI/2)<.5)continue;   /* not across the landing */const r=rAt(TOP)*(1+.08*Math.cos(5*a+.4))-.3;const h=rr(2.2,3.6)*(rng()<.2?.45:1);const lean=rr(.35,.6);
  const p0=[r*Math.cos(a),TOP-.3,r*Math.sin(a)],p1=[(r+lean*h)*Math.cos(a),TOP-.3+h*Math.sqrt(1-lean*lean),(r+lean*h)*Math.sin(a)];
  hykPut('hkBone',hykTube([p0,[(p0[0]+p1[0])/2,(p0[1]+p1[1])/2,(p0[2]+p1[2])/2],p1],t=>.17*(1-t)+.03,{seg:6,col:colB}));}
 // the warders' cone: tall and leaning, the wet door on its front at +1, the cells' doors round it on its inner skin
 const H={cx:0,cz:hz,rb:7.0,rt:4.3,h:11.5,yBase:TOP-.3,dir:Math.PI/2+.4,tilt:.2};const hR=y=>H.rb+(H.rt-H.rb)*Math.pow(clamp((y-H.yBase)/H.h,0,1),.75);
 const Lh={cx:0,cz:hz,yBase:H.yBase,rFn:y=>hR(y+H.yBase)};
 const wet=hykLatheAt(Lh,Math.PI/2,FL+1.2-H.yBase);wet.r=1.0;wet.ky=1.2;wet.kind='door';
 const cells=[];const nC=12;for(let i=0;i<nC;i++){const th=Math.PI/2+.62+i*(TAU-1.24)/(nC-1);const rb=rr(2.3,2.9);const dist=hR(2.4)+rb*.86;
  cells.push({th,rb,rt:rb*.66,h:rr(4.2,5.8),cx:Math.cos(th)*dist,cz:hz+Math.sin(th)*dist,dir:th+rr(-.5,.5),tilt:rr(.16,.26)});}
 const hallOps=[wet],hallIn=[wet];
 for(const c of cells){const rIn=hR(FL+1.05)*.9;c.door={p:[rIn*Math.cos(c.th),FL+1.05,hz+rIn*Math.sin(c.th)],n:[-Math.cos(c.th),0,-Math.sin(c.th)],r:.85,ky:1.25,kind:'door'};hallIn.push(c.door);
  hallOps.push({p:[hR(FL+1.05)*Math.cos(c.th),FL+1.05,hz+hR(FL+1.05)*Math.sin(c.th)],n:c.door.n,r:.9,ky:1.25});}
 hykCellCone(H,{ops:hallOps,inOps:hallIn,inner:.9,fl:18,seed:5,nu:64,nv:24,col:grey(.78)});hykFloor(0,hz,FL,hR(FL)*.9,{col:colF});
 hykDoor(wet,{kind:'wetdoor',level:'wet',room:'warders hall',depth:.7});
 {const A=hykLatheAt(Lh,Math.PI/2+.3,3.7-H.yBase).p;hykLibSconce(A,[Math.cos(Math.PI/2+.3),.1,Math.sin(Math.PI/2+.3)],.45,{cool:true,level:'wet'});}
 // the cells: each a barnacle on the hall's flank with its door through both walls, a vent on its outer side, a bed
 const hall=hykRoom('hall',hykCirclePoly(0,hz,hR(FL)*.82,18),FL,H.h-1.2,{doors:[[0,hz+hR(FL+1.2),2.0]].concat(cells.map(c=>[c.door.p[0],c.door.p[2],1.7,'cell'])),wealth:.3});
 hykSpot(hall,'table',0,hz-.4,0,1.6,.9);hykSpot(hall,'store',-2.1,hz+1.1,.5,1.2,.7);hykSpot(hall,'seat',2.1,hz+.9,-.5,1.0,.9);
 cells.forEach((c,i)=>{const Lc={cx:c.cx,cz:c.cz,yBase:TOP-.25,rFn:y=>c.rb+(c.rt-c.rb)*Math.pow(clamp(y/c.h,0,1),.75)};
  const own=hykLatheAt(Lc,c.th+Math.PI,FL+1.05-Lc.yBase);own.r=.9;own.ky=1.25;const vent=hykLatheAt(Lc,c.th+rr(-.4,.4),3.1-Lc.yBase);vent.r=.22;vent.kind='window';
  hykCellCone(Object.assign({yBase:Lc.yBase},c),{ops:[own,vent],inner:.88,fl:14,seed:i+7,col:grey(rr(.7,.86))});hykFloor(c.cx,c.cz,FL,c.rb*.8,{col:colF});
  hykWin(vent,{open:true,depth:.5,level:'wet'});hykDoor(c.door,{level:'wet',room:'cell '+(i+1),depth:1.5});
  const rm=hykRoom('cell',hykCirclePoly(c.cx,c.cz,c.rb*.75,14),FL,c.h-1.4,{doors:[[own.p[0],own.p[2],1.7,'warders hall']],wealth:.1});
  const d=c.rb*.75-1.0;hykSpot(rm,'bed',c.cx+Math.cos(c.th)*d,c.cz+Math.sin(c.th)*d,-c.th-Math.PI/2,2.1,1.0);});
 // blind barnacles: three in the gaps at the colony's foot, two perched on the hall's shoulder with their own bottoms
 for(const s of [{th:Math.PI/2+.25,r:13.4,rb:1.6,h:2.5},{th:Math.PI+.95,r:13.6,rb:1.9,h:3.1},{th:-Math.PI/2-.3,r:13.8,rb:1.4,h:2.2},{th:-.2,r:13.1,rb:1.2,h:1.9},{th:Math.PI-.4,r:12.6,rb:1.1,h:1.7}]){
  hykCellCone({cx:Math.cos(s.th)*s.r,cz:hz+Math.sin(s.th)*s.r,rb:s.rb,rt:s.rb*.62,h:s.h,yBase:TOP-.2,dir:s.th,tilt:.25},{inner:false,fl:11,seed:(s.th*9|0)+3,col:grey(rr(.68,.84))});}
 for(const s of [{th:Math.PI+.2,y:5.4,rb:1.25,h:2.0},{th:-.45,y:6.0,rb:1.0,h:1.7},{th:Math.PI/2-.9,y:8.2,rb:.9,h:1.6}]){const r=hR(s.y)+s.rb*.45;const cx=Math.cos(s.th)*r,cz=hz+Math.sin(s.th)*r;
  hykCellCone({cx,cz,rb:s.rb,rt:s.rb*.6,h:s.h,yBase:s.y,dir:s.th,tilt:.25},{inner:false,flare:false,bottom:true,fl:10,seed:(s.th*5|0)+9,col:grey(.74)});
  const q=hykLatheAt(Lh,s.th,s.y+.4-H.yBase);hykPut('hkBarn',hykFlare([q.p[0],q.p[1],q.p[2]],[Math.cos(s.th),0,Math.sin(s.th)],s.rb*.8,.7,{col:grey(.74)}));}
 // the landing: a lily pad at +1 half on the rock's edge, rails on its flanks on posts, steps into the water. hykPad's
 // geometry is drawn in the current frame, so it takes local coordinates here; its deck record is put into world below
 {const px=0,pz=rAt(TOP)+2.1,PRd=3.2;hykPad(px,TOP,pz,PRd,{col:grey(.6),mat:'hkBarn',stalk:-SK,lobes:8});
  const d=NAV_EXTRA[NAV_EXTRA.length-1];if(d&&d.kind==='pad'){const w=hykW(px,TOP,pz);d.x0=w[0]-PRd;d.z0=w[2]-PRd;d.x1=w[0]+PRd;d.z1=w[2]+PRd;d.y=w[1];d.own='The Wet Cells';}
  for(const arc of [[.2,1.25],[1.9,2.95]]){const pts=[];const n=8;for(let i=0;i<=n;i++){const a=arc[0]+(arc[1]-arc[0])*i/n;pts.push([px+PRd*.9*Math.cos(a),TOP+1.1,pz+PRd*.9*Math.sin(a)]);}
   hykPut('hkBone',hykTube(pts,()=>.07,{seg:6,col:colB}));for(let i=0;i<=n;i+=2){const p=pts[i];kput('hkPost',[p[0],TOP+.55,p[2]],null,[.06,1.1,.06],colB);}}
  for(let i=0;i<4;i++)kput('hkTread',[px,TOP-.1-i*.3,pz+PRd*.8+.1+i*.5],qEuler(0,0,0),[1.8,.14,.6],colB);}
 hykReg('The Wet Cells',0,0,19,13);}
HYK.def({key:'hyk_wet_cells',name:'The Wet Cells',family:'civic',row:'Civic',w:38,d:42,h:13,r:19,inside:true,tags:{type:['civic'],wealth:'civic',lit:true},build:buildHykWetCells});
