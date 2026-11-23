// node core/world/test-smooth.js — the smoothing's contract (40-world-smooth.js) on synthetic land, each check with an input
// that must fail it: a staircase on a scarp is filled at every angle, the scarp keeps its profile (a plain blur that fills
// the stairs fails that), a smooth scarp is left as it is at every angle (no axis or 45-degree bias), streaks across the
// contours go, a peak stays; a river's curve passes through its vertices with no straight runs, and its meander is seeded
// and the same in any cut.
const fs=require('fs'),path=require('path');
global.window=global;
eval(fs.readFileSync(path.join(__dirname,'..','rand','08-core-rand.js'),'utf8'));
eval(fs.readFileSync(path.join(__dirname,'40-world-smooth.js'),'utf8'));
let bad=0;const ok=(name,pass,neg)=>{const r=!!pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const PX=4,NX=96,NY=96,HT=600;   // 4 cells a model pixel (500 m cells), a 600 m scarp
const rad=d=>d*Math.PI/180;
// a straight scarp at angle phi (its normal (cos, sin)), its rise over w cells, through the grid's centre
const scarpF=(phi,w)=>{const c=Math.cos(rad(phi)),s=Math.sin(rad(phi));return(x,z)=>{const t=((x-NX/2)*c+(z-NY/2)*s)/w;const u=Math.max(0,Math.min(1,t+.5));return HT*u*u*(3-2*u);};};
const grid=f=>{const A=new Float64Array(NX*NY);for(let j=0;j<NY;j++)for(let i=0;i<NX;i++)A[j*NX+i]=f(i,j);return A;};
// the model's pixels: f sampled at each pixel, then upsampled PX times by the cubic B-spline (the extractor's --smooth
// upsample: no overshoot, no box clamp), so a diagonal edge is the staircase the cut gets
function staircase(f){const cw=Math.ceil(NX/PX)+4,ch=Math.ceil(NY/PX)+4,C=new Float64Array(cw*ch);
 for(let b=0;b<ch;b++)for(let a=0;a<cw;a++)C[b*cw+a]=f((a-2)*PX,(b-2)*PX);
 const B=t=>[(1-t)*(1-t)*(1-t)/6,(3*t*t*t-6*t*t+4)/6,(-3*t*t*t+3*t*t+3*t+1)/6,t*t*t/6];
 return grid((i,j)=>{const u=i/PX+2,v=j/PX+2,a=Math.floor(u),b=Math.floor(v),wu=B(u-a),wv=B(v-b);let s=0;
  for(let q=0;q<4;q++)for(let p=0;p<4;p++)s+=wu[p]*wv[q]*C[Math.min(ch-1,Math.max(0,b+q-1))*cw+Math.min(cw-1,Math.max(0,a+p-1))];return s;});}
const bil=(A,u,v)=>{const i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,o=j*NX+i;return (A[o]*(1-fu)+A[o+1]*fu)*(1-fv)+(A[o+NX]*(1-fu)+A[o+NX+1]*fu)*fv;};
// the contour of `level` crossed along lines normal to the scarp, one every cell along it: each crossing's offset (cells)
function crossings(A,phi,level){const c=Math.cos(rad(phi)),s=Math.sin(rad(phi)),out=[];
 for(let q=-26;q<=26;q++){const ox=NX/2-s*q,oz=NY/2+c*q;let prev=null,pr=0,hit=null;
  for(let r=-14;r<=14;r+=.25){const x=ox+c*r,z=oz+s*r;if(x<1||z<1||x>NX-2||z>NY-2){prev=null;continue;}const v=bil(A,x,z)-level;
   if(prev!==null&&(prev<0)!==(v<0)){hit=pr+(r-pr)*prev/(prev-v);break;}prev=v;pr=r;}
  if(hit!==null)out.push([q,hit]);}
 return out;}
// the staircase's size: the RMS of the mid contour's offsets about their straight fit (cells)
function stairs(A,phi){const P=crossings(A,phi,HT/2),n=P.length;let sq=0,sr=0,sqq=0,sqr=0;for(const[q,r]of P){sq+=q;sr+=r;sqq+=q*q;sqr+=q*r;}
 const b=(n*sqr-sq*sr)/(n*sqq-sq*sq),a=(sr-b*sq)/n;let e=0;for(const[q,r]of P)e+=(r-a-b*q)*(r-a-b*q);return Math.sqrt(e/n);}
// the scarp's width: the mean distance from its 10 % contour to its 90 % (cells)
function width(A,phi){const lo=crossings(A,phi,HT*.1),hi=crossings(A,phi,HT*.9),m=new Map(lo);let s=0,n=0;for(const[q,r]of hi)if(m.has(q)){s+=Math.abs(r-m.get(q));n++;}return s/n;}
const OPT=Object.assign({px:PX,cell:500},JSON.parse(process.env.SMOOTH_OPT||'{}'));   /* SMOOTH_OPT: try other settings */
const ANG=[0,8,17,30,45,58,73,90];
const STAIR_MAX=.06;   // cells: 30 m of wobble on a 500 m grid

// ---- the staircase
const rows=ANG.map(phi=>{const f=scarpF(phi,PX),A=staircase(f),B=WSMOOTH.heights(A,NX,NY,OPT);return{phi,A,B,s0:stairs(A,phi),s1:stairs(B,phi),w0:width(A,phi),w1:width(B,phi)};});
for(const r of rows)console.log('      phi %s: stairs %s -> %s cells, width %s -> %s cells'.replace(/%s/g,()=>'%s'),r.phi,r.s0.toFixed(3),r.s1.toFixed(3),r.w0.toFixed(2),r.w1.toFixed(2));
ok('a staircase on a scarp is filled at every angle (mid contour within '+STAIR_MAX+' cell of straight)',rows.every(r=>r.s1<STAIR_MAX),
 ![8,17,30,58,73].every(phi=>rows.find(r=>r.phi===phi).s0>=STAIR_MAX));   // negative: the staircase itself fails it
ok('the scarp keeps its profile (10-90 % width grows under 12 %)',rows.every(r=>r.w1<=r.w0*1.12),false);
// a plain blur strong enough to fill the stairs widens the scarp: it must fail the profile check
{const r=rows.find(r=>r.phi===17);let sg=.5,G;for(;sg<12;sg+=.25){G=WSMOOTH.gauss(r.A,NX,NY,sg);if(stairs(G,17)<STAIR_MAX)break;}
 const wg=width(G,17);console.log('      a plain blur fills phi 17 at sigma %s cells, width %s -> %s',sg,r.w0.toFixed(2),wg.toFixed(2));
 ok('a plain blur that fills the same stairs widens the scarp (so the check tells them apart)',wg>r.w0*1.12,false);}
// ---- no axis or diagonal bias: a smooth scarp moves by the same tiny amount at every angle
{const ch=[];for(let phi=0;phi<180;phi+=7.5){const A=grid(scarpF(phi,PX*1.5)),B=WSMOOTH.heights(A,NX,NY,OPT);let m=0;
  for(let j=24;j<NY-24;j++)for(let i=24;i<NX-24;i++)m=Math.max(m,Math.abs(B[j*NX+i]-A[j*NX+i]));ch.push(m);}
 const mx=Math.max(...ch),mn=Math.min(...ch);console.log('      a smooth scarp moves %s..%s m over 24 angles',mn.toFixed(2),mx.toFixed(2));
 ok('a smooth scarp stays itself at every angle (under 1.5 % of its height)',mx<HT*.015,false);
 ok('and as much at one angle as another (no axis or 45-degree bias: spread under 1 % of the height)',mx-mn<HT*.01,false);}
// ---- streaks along the rows, across a slope's contours
{const c=Math.cos(rad(30)),s=Math.sin(rad(30)),plane=(i,j)=>8*(i*c+j*s),streak=j=>((KRAND.hash(7,j)%1000)/1000-.5)*12;
 const A=grid((i,j)=>plane(i,j)+streak(j)),B=WSMOOTH.heights(A,NX,NY,OPT);
 const rms=X=>{let e=0,n=0;for(let j=12;j<NY-12;j++)for(let i=12;i<NX-12;i++){const d=X[j*NX+i]-plane(i,j);e+=d*d;n++;}return Math.sqrt(e/n);};
 const r0=rms(A),r1=rms(B);console.log('      row streaks on a slope: %s -> %s m RMS',r0.toFixed(2),r1.toFixed(2));
 ok('streaks along the rows across a slope\'s contours go (RMS cut 3 times)',r1<r0/3,rms(A)<r0/3);}
// ---- a peak and a flat
{const A=grid((i,j)=>800*Math.exp(-((i-48)*(i-48)+(j-48)*(j-48))/(2*36))),B=WSMOOTH.heights(A,NX,NY,OPT);
 ok('a peak keeps its height (within 2 %)',B[48*NX+48]>A[48*NX+48]*.98,WSMOOTH.gauss(A,NX,NY,4)[48*NX+48]>A[48*NX+48]*.98);
 const F=new Float64Array(NX*NY).fill(-1287),G=WSMOOTH.heights(F,NX,NY,OPT);ok('a flat stays exactly flat',G.every(v=>v===-1287),false);
 const C=WSMOOTH.heights(rows[2].A,NX,NY,OPT);ok('the same input gives the same heights',C.every((v,k)=>v===rows[2].B[k]),false);}

// ---- the curves
const zig=[];for(let k=0;k<14;k++)zig.push([k*2000,(k%2)*2000,1000+k,-1100-k*3]);   // a D8 run: 45-degree zigzags on 2 km pixels
const P=[[0,0,-1200,80],[1300,400,-1210,80],[2500,300,-1220,80],[3900,1100,-1240,80],[4800,2600,-1250,80],[5400,3900,-1270,80]];
const turn=L=>{let m=0;for(let k=1;k<L.length-1;k++){const ax=L[k][0]-L[k-1][0],az=L[k][1]-L[k-1][1],bx=L[k+1][0]-L[k][0],bz=L[k+1][1]-L[k][1];
 const c=(ax*bx+az*bz)/Math.sqrt((ax*ax+az*az)*(bx*bx+bz*bz));m=Math.max(m,Math.acos(Math.max(-1,Math.min(1,c))));}return m*180/Math.PI;};
const dense=(Q,step)=>{const o=[];for(let i=0;i<Q.length-1;i++){const a=Q[i],b=Q[i+1],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/step);for(let k=0;k<n;k++)o.push([a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n]);}o.push(Q[Q.length-1]);return o;};
{const C=WSMOOTH.curve(P,{step:100}),hit=P.every(p=>C.some(q=>Math.abs(q[0]-p[0])<1e-9&&Math.abs(q[1]-p[1])<1e-9));
 ok('a curve passes through every vertex',hit,false);
 const tc=turn(C),tl=turn(dense(P,100));console.log('      the curve turns at most %s degrees a 100 m step (the polyline %s at its vertices)',tc.toFixed(1),tl.toFixed(1));
 ok('a curve has no corners (under 6 degrees a step), where the straight polyline has',tc<6,tl<6);
 ok('the extras follow along (the bed falls from -1200 to -1270)',C[0][2]===-1200&&C[C.length-1][2]===-1270&&C.every((q,k)=>k===0||q[2]<=C[k-1][2]),false);}
{const L=WSMOOTH.line(zig,{step:250}),tl=turn(L),tz=turn(dense(zig,250));console.log('      a D8 zigzag turns %s degrees a step; its line %s',tz.toFixed(1),tl.toFixed(1));
 let dev=0;for(const q of L)if(q[0]>4000&&q[0]<22000)dev=Math.max(dev,Math.abs(q[1]-1000));
 ok('a D8 zigzag is relaxed to a line along its course (turns under 12 degrees a step)',tl<12&&dev<700,tz<12);}
{const o={width:80,name:'r033',ox:1007*2000,oz:686*2000,step:100},R=WSMOOTH.river(P,o),C=WSMOOTH.curve(P,{step:100});
 let off=0;for(let k=0;k<R.length;k++)off=Math.max(off,Math.hypot(R[k][0]-C[k][0],R[k][1]-C[k][1]));
 ok('a river meanders off its curve (by up to its amplitude, 60 m for 80 m wide)',off>15&&off<=60.001,false);
 ok('and passes through its vertices still',P.every(p=>R.some(q=>Math.abs(q[0]-p[0])<1e-9&&Math.abs(q[1]-p[1])<1e-9)),false);
 ok('and has no corners (under 8 degrees a step)',turn(R)<8,false);
 const D=[3000,-5000],P2=P.map(p=>[p[0]+D[0],p[1]+D[1],p[2],p[3]]),R2=WSMOOTH.river(P2,Object.assign({},o,{ox:o.ox-D[0],oz:o.oz-D[1]}));
 let d=0;for(let k=0;k<R.length;k++)d=Math.max(d,Math.hypot(R2[k][0]-D[0]-R[k][0],R2[k][1]-D[1]-R[k][1]));
 ok('two cuts of one river (frames 5.8 km apart) give it the same meander',d<1e-6,false);
 const R3=WSMOOTH.river(P,Object.assign({},o,{name:'r034'}));let e=0;for(let k=0;k<R.length;k++)e=Math.max(e,Math.hypot(R3[k][0]-R[k][0],R3[k][1]-R[k][1]));
 ok('another river wanders its own way (seeded by its id)',e>5,false);}
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
