// node core/world/test-relief.js — the relief's P1 (43-world-relief.js: styles for every overlay, caprock benches) on synthetic
// land, each check with an input that must fail it: 41's old terraces on the absolute height ring a hill like a contour map
// and band the heights every step; the benches do neither, lie only on caprock, and still leave treads there.
const fs=require('fs'),path=require('path');
global.window=global;
eval(fs.readFileSync(path.join(__dirname,'..','rand','08-core-rand.js'),'utf8'));
eval(fs.readFileSync(path.join(__dirname,'43-world-relief.js'),'utf8'));
let bad=0;const ok=(name,pass,neg)=>{const r=!!pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const smooth=(a,b,x)=>{let t=(x-a)/(b-a);t=t<0?0:t>1?1:t;return t*t*(3-2*t);};
// 41's old rule (core/world/41-world-fields.js before P1), with its 9 km step noise held at its middle
const oldTerr=(h,S,rel)=>{const tm=S.terr*smooth(40,250,rel)*smooth(4200,1800,rel);if(tm<=.01)return h;
 const step=S.step,t=h/step,fl=Math.floor(t),f=t-fl,k=.14,g=f<1-k?0:smooth(1-k,1,f);return h+(((fl+g)*step)-h)*tm;};
const S={terr:.75,step:55},REL=600;
// a hill's flank: 12 km across, 1.2 km high, a gentle dome (slopes 5-25 %) with a little roll in it
const hill=(x,z)=>{const r=Math.sqrt(x*x+z*z)/12000;return 1200*(1-r*r)*(r<1?1:0)+8*Math.sin(x/700)*Math.cos(z/900);};
WRELIEF.init({ox:2000000,oz:3000000,seed:7});
// find a box on the flank that lies in caprock (cw > .9) and one that has none, scanning 4 km steps
// (the caprock's patches run over ~16 km: search wide, then stand the hill so the box is on its flank, 6 km from its top)
let cap=null,none=null;
for(let x=-80000;x<=80000&&!(cap&&none);x+=2000)for(let z=-80000;z<=80000;z+=2000){
 let full=true,empty=true;for(let a=-1500;a<=1500;a+=750)for(let b=-1500;b<=1500;b+=750){const c=WRELIEF.caprock(x+a,z+b,S,REL);if(c<.95*S.terr)full=false;if(c>.001)empty=false;}
 if(!cap&&full)cap=[x,z];if(!none&&empty)none=[x,z];}
const hillAt=c=>(x,z)=>hill(x-c[0]+6000,z-c[1]);
ok('the test found a caprock box and a bare one on the flank',cap&&none,false);
const N=300,ST=10;
function grid(f,c){f=f.length===3?f:f;const A=new Float64Array(N*N);for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=c[0]-N*ST/2+i*ST,z=c[1]-N*ST/2+j*ST;A[j*N+i]=f(x,z);}return A;}
// the band contrast: max/min of the histogram of height mod s (20 bins), the worst over s = 20..100, where the ground spans 5 s
function bands(A){let worst=1;const lo=Math.min(...A),hi=Math.max(...A);
 for(let s=20;s<=100;s+=5){if(hi-lo<5*s)continue;const H=new Array(20).fill(0);for(const v of A){const f=((v%s)+s)%s/s;H[Math.min(19,Math.floor(f*20))]++;}
  worst=Math.max(worst,Math.max(...H)/Math.max(1,Math.min(...H)));}return worst;}
// treads: the share of samples whose slope is under half the bare slope at the same point (a tread tilts with its bed's dip)
function treads(A,B){let n=0,t=0;for(let j=1;j<N-1;j++)for(let i=1;i<N-1;i++){const k=j*N+i;
 const s=Math.hypot(A[k+1]-A[k-1],A[k+N]-A[k-N]),b=Math.hypot(B[k+1]-B[k-1],B[k+N]-B[k-N]);if(b<.5)continue;n++;if(s<b/2)t++;}return n?t/n:0;}
const base=(c)=>grid(hillAt(c),c);
const oldG=c=>{const H=hillAt(c);return grid((x,z)=>oldTerr(H(x,z),S,REL),c);},newG=c=>{const H=hillAt(c);return grid((x,z)=>WRELIEF.bench(H(x,z),x,z,S,REL,0),c);};
if(cap&&none){
 const B=base(cap),O=oldG(cap),Nw=newG(cap);
 const bo=bands(O),bn=bands(Nw),bb=bands(B);
 console.log('      in caprock: band contrast bare %s, old terraces %s, benches %s'.replace(/%s/g,'%s'),bb.toFixed(2),bo.toFixed(2),bn.toFixed(2));
 ok('the benches do not band the heights every step (contrast under 1.6 at every step from 20 to 100 m)',bn<1.6,bo<1.6);
 const to=treads(O,B),tn=treads(Nw,B);console.log('      in caprock: treads old %s %%, benches %s %%',(to*100).toFixed(0),(tn*100).toFixed(0));
 ok('in caprock the benches still leave treads (over 10 % of the slope at under half its bare slope)',tn>.1,treads(B,B)>.1);
 // the bench levels are irregular: the gaps between the distinct tread heights along a line down the flank vary
 const Hc=hillAt(cap),lv=[];for(let s=-1500;s<1500;s+=5){const x=cap[0]+s,z=cap[1],a=WRELIEF.bench(Hc(x,z),x,z,S,REL,0),b=WRELIEF.bench(Hc(x+5,z),x+5,z,S,REL,0);
  const c0=Hc(x,z),c1=Hc(x+5,z);if(Math.abs(a-b)<.5*Math.abs(c1-c0)&&(!lv.length||Math.abs(lv[lv.length-1]-a)>4))lv.push(a);}
 const gaps=lv.slice(1).map((v,i)=>Math.abs(v-lv[i])),mg=gaps.reduce((a,b)=>a+b,0)/Math.max(1,gaps.length),sd=Math.sqrt(gaps.reduce((a,b)=>a+(b-mg)*(b-mg),0)/Math.max(1,gaps.length));
 console.log('      tread levels down 3 km of the flank: %d, gaps %s m mean, %s m spread',lv.length,mg.toFixed(0),sd.toFixed(0));
 ok('the treads stand at irregular heights (the gaps between them vary by over a quarter)',lv.length>=3&&sd/mg>.25,false);
 const Bn=base(none),Nn=newG(none);let same=true;for(let k=0;k<Bn.length;k++)if(Bn[k]!==Nn[k]){same=false;break;}
 ok('where no caprock lies the ground is exactly as it was',same,false);
 const On=oldG(none);let moved=false;for(let k=0;k<Bn.length;k++)if(On[k]!==Bn[k]){moved=true;break;}
 ok('(and there the old rule had terraced it)',moved,false);
}
// continuity: 1 m steps down lines across the flank never jump
{let worst=0;const c=cap||[0,0],Hc=hillAt(c);for(let a=0;a<12;a++){const ux=Math.cos(a*.5),uz=Math.sin(a*.5);let p=null;
  for(let s=0;s<3000;s++){const x=c[0]+s*ux,z=c[1]+s*uz,q=WRELIEF.bench(Hc(x,z),x,z,S,REL,0);if(p!==null)worst=Math.max(worst,Math.abs(q-p));p=q;}}
 console.log('      the steepest 1 m step: %s m',worst.toFixed(2));
 ok('the ground is continuous (no 1 m step over 3 m: a riser, not a cliff of the function)',worst<3,false);}
ok('a far chunk (minWave 600 m and over) skips the benches',WRELIEF.bench(1234,cap?cap[0]:0,cap?cap[1]:0,S,REL,600)===1234,false);
// the frame: the same world point gives the same ground from two cuts' frames
{const A=WRELIEF.init({ox:2000000,oz:3000000,seed:7}).bench(500,1000,2000,S,REL,0),B=WRELIEF.init({ox:2001000,oz:2998000,seed:7}).bench(500,0,4000,S,REL,0);
 WRELIEF.init({ox:2000000,oz:3000000,seed:7});ok('two cuts of one place agree (the frame is world-absolute)',Math.abs(A-B)<1e-9,false);}

// ---- P2: the erosion filter (WRELIEF.erode)
{let e=0;for(let k=0;k<20000;k++){const u=(k*.6180339887)%7-3.5;e=Math.max(e,Math.abs(WRELIEF.cos2pi(u)-Math.cos(2*Math.PI*u)),Math.abs(WRELIEF.sin2pi(u)-Math.sin(2*Math.PI*u)));}
 console.log('      cos2pi and sin2pi against Math: %s worst',e.toExponential(1));ok('the polynomial cosine and sine are within 1e-5 of Math\'s',e<1e-5,false);}
const SE={gully:1},RE=800,SL=.15,NE=400,DS=5;   /* a plane falling 15 % to the east, 2 km a side at 5 m */
const plane=(x,z)=>500-SL*x;
const erodeD=(x,z,gx,gz,s,rel,mw)=>WRELIEF.erode(plane(x,z),x,z,gx,gz,s||SE,rel==null?RE:rel,mw||0)-plane(x,z);
function aniso(f){let vx=0,vz=0;for(let j=1;j<NE;j++)for(let i=1;i<NE;i++){const x=i*DS,z=j*DS,d=f(x,z);vx+=(d-f(x-DS,z))**2;vz+=(d-f(x,z-DS))**2;}return vz/vx;}
{const D=(x,z)=>erodeD(x,z,-SL,0);
 // the old rule's gullies (41's, ridged noise at 240 m): no direction
 const vn=(x,z,s)=>KRAND.vnoise(x,z,.5,s),fb=(x,z)=>(vn(x,z,1)+.5*vn(2.03*x,2.03*z,2))/1.5,old=(x,z)=>{const g=1-Math.abs(2*fb(x/240,z/240)-1);return -(3+RE*.004)*Math.pow(g,6)*2.2;};
 const a=aniso(D),ao=aniso(old);console.log('      across-slope / down-slope variation: the filter %s, the old gullies %s',a.toFixed(1),ao.toFixed(1));
 /* the finer octaves turn to follow the coarser spurs (the branching), so the filter is not purely across-slope: 3 x, where
    noise with no direction reads about 1 */
 ok('the gullies run down the slope (variation across it over 3 times that along it)',a>3,ao>3);
 let s=0,n=0,lo=0,hi=0;for(let j=0;j<NE;j+=2)for(let i=0;i<NE;i+=2){const d=D(i*DS,j*DS);s+=d;n++;lo=Math.min(lo,d);hi=Math.max(hi,d);}
 console.log('      the gullies cut %s m to %s m, %s m on average',lo.toFixed(1),hi.toFixed(1),(s/n).toFixed(2));
 ok('the land neither rises nor sinks (mean change under 2 m) and is cut to some depth (over 8 m)',Math.abs(s/n)<2&&hi-lo>8,false);
 let worst=0;for(let r=0;r<8;r++){const ux=Math.cos(r*.8),uz=Math.sin(r*.8);let p=D(1000,1000);for(let q=1;q<1500;q++){const v=D(1000+q*ux,1000+q*uz);worst=Math.max(worst,Math.abs(v-p));p=v;}}
 console.log('      the steepest 1 m step in the gullies: %s m',worst.toFixed(2));ok('the gullies are continuous (no 1 m step over 1.5 m)',worst<1.5,false);
 const deep=(sl)=>{let m=0;for(let k=0;k<400;k++){const x=k*13,z=k*7,d=Math.abs(WRELIEF.erode(500-sl*x,x,z,-sl,0,SE,RE,0)-(500-sl*x));m=Math.max(m,d);}return m;};
 ok('deeper gullies on a steeper slope (30 % against 8 %)',deep(.3)>2*deep(.08),false);
 ok('a far chunk (minWave 600 m) skips the finer octaves',erodeD(777,333,-SL,0,SE,RE,600)!==erodeD(777,333,-SL,0,SE,RE,0),false);}
{let flat=true;for(let k=0;k<500;k++)if(WRELIEF.erode(42,k*17,k*29,0,0,SE,RE,0)!==42){flat=false;break;}
 let gentle=true;for(let k=0;k<500;k++)if(WRELIEF.erode(42,k*17,k*29,.01,0,SE,RE,0)!==42){gentle=false;break;}
 ok('flat and near-flat ground (under 2 %) is left as it was',flat&&gentle,WRELIEF.erode(42,17,29,SL,0,SE,RE,0)===42);}
{const A=WRELIEF.init({ox:2000000,oz:3000000,seed:7}).erode(500,1000,2000,-SL,0,SE,RE,0),B=WRELIEF.init({ox:2001000,oz:2998000,seed:7}).erode(500,0,4000,-SL,0,SE,RE,0);
 WRELIEF.init({ox:2000000,oz:3000000,seed:7});ok('two cuts of one place get the same gullies',Math.abs(A-B)<1e-9,false);}
// ---- P5: the peaks (WRELIEF.peaks)
{const SP={peak:1},RP=1200,amp=RP*.18,P=(x,z,pk,mw,s)=>WRELIEF.peaks(0,x,z,s||SP,RP,pk==null?1:pk,mw||0);
 let s=0,n=0,lo=0,hi=0;for(let k=0;k<40000;k++){const d=P((k*977)%40000,(k*631)%40000);s+=d;n++;lo=Math.min(lo,d);hi=Math.max(hi,d);}
 console.log('      the peaks crease the land %s m to %s m, %s m on average (amplitude %s m)',lo.toFixed(0),hi.toFixed(0),(s/n).toFixed(1),amp.toFixed(0));
 ok('the peaks crease, not lift (mean under 6 % of the amplitude) and cut deep (over the amplitude end to end)',Math.abs(s/n)<.06*amp&&hi-lo>amp,false);
 /* sharpness: on a ridge the crest's curvature (minus the second difference across it) against its height: the ridged noise's
    crests are sharp, a smooth fbm's of the same amplitude rounded. Read as the 95th percentile of -d2 over the 95th of the height */
 const vn=(x,z,s)=>KRAND.vnoise(x,z,.5,s),fbmS=(x,z)=>{let a=0,w=0,t=1,f=1;for(let o=0;o<4;o++){a+=vn(x*f/1300,z*f/1300,40+o)*t;w+=t;t*=.5;f*=2;}return (a/w-.5)*2*amp;};
 const sharp=f=>{const C=[],Hh=[],st=10;for(let k=0;k<6000;k++){const x=(k*1237)%30000+500,z=(k*2711)%30000+500,h=f(x,z);Hh.push(h);C.push(-(f(x-st,z)+f(x+st,z)+f(x,z-st)+f(x,z+st)-4*h)/(st*st));}
  C.sort((a,b)=>a-b);Hh.sort((a,b)=>a-b);return C[Math.floor(C.length*.95)]/Math.max(1,Hh[Math.floor(Hh.length*.95)]-Hh[Math.floor(Hh.length*.05)]);};
 const sp=sharp((x,z)=>P(x,z)),sf=sharp(fbmS);console.log('      crest sharpness: the peaks %s, a smooth fbm %s',sp.toExponential(2),sf.toExponential(2));
 ok('the crests are sharper than a smooth noise of the same amplitude (1.5 times)',sp>1.5*sf,sf>1.5*sp);
 let none=true;for(let k=0;k<400;k++){if(P(k*37,k*91,0)!==0||WRELIEF.peaks(0,k*37,k*91,{peak:0},RP,1,0)!==0){none=false;break;}}
 ok('no peaks in a valley (peakness 0) or in a style without them (peak 0)',none,P(3700,9100,0)!==0);
 let worst=0;for(let r=0;r<6;r++){const ux=Math.cos(r*1.1),uz=Math.sin(r*1.1);let p=P(5000,5000);for(let q=1;q<2000;q++){const v=P(5000+q*ux,5000+q*uz);worst=Math.max(worst,Math.abs(v-p));p=v;}}
 console.log('      the steepest 1 m step in the peaks: %s m',worst.toFixed(2));ok('the peaks are continuous (no 1 m step over 2 m)',worst<2,false);
 ok('a far chunk (minWave 700 m) skips the finer octaves',P(1777,2333,1,700)!==P(1777,2333,1,0),false);
 const A=WRELIEF.init({ox:2000000,oz:3000000,seed:7}).peaks(0,1000,2000,SP,RP,1,0),B=WRELIEF.init({ox:2001000,oz:2998000,seed:7}).peaks(0,0,4000,SP,RP,1,0);
 WRELIEF.init({ox:2000000,oz:3000000,seed:7});ok('two cuts of one place get the same peaks',Math.abs(A-B)<1e-9,false);}
// ---- P5 v2: rotated-gradient peaks (no negative collar moat) and steep-wall crags (sheer-wall damped)
{WRELIEF.init({ox:2000000,oz:3000000,seed:7,version:2});
 const SP2={peak:1,rock:.5},RP=1400;
 let minP=1e9,maxP=-1e9;
 for(let k=0;k<20000;k++){const d=WRELIEF.peaks(0,(k*977)%40000,(k*631)%40000,SP2,RP,1,0);if(d<minP)minP=d;if(d>maxP)maxP=d;}
 ok('v2 peaks never dig a negative collar moat (min >= 0) and raise crisp summits (> 120 m)',minP>=-1e-9&&maxP>120,minP<-1);
 const cGentle=WRELIEF.crags(500,1200,2400,-.15,0,SP2,RP,0)-500;
 const cSteep=Math.max(...Array.from({length:200},(_,k)=>Math.abs(WRELIEF.crags(500,k*31,k*17,-.85,.25,SP2,RP,0)-500)));
 const cSheer=Math.max(...Array.from({length:200},(_,k)=>Math.abs(WRELIEF.crags(500,k*31,k*17,-6.5,1.5,SP2,RP,0)-500)));
 ok('v2 crags stay zero on gentle (< 20 deg) slopes, carve buttresses/couloirs on 42 deg flanks, and damp on 82 deg walls',cGentle===0&&cSteep>8&&cSheer<cSteep*.25,cGentle!==0);
 const A2=WRELIEF.init({ox:2000000,oz:3000000,seed:7,version:2}).crags(500,1000,2000,-.8,.3,SP2,RP,0);
 const B2=WRELIEF.init({ox:2001000,oz:2998000,seed:7,version:2}).crags(500,0,4000,-.8,.3,SP2,RP,0);
 WRELIEF.init({ox:2000000,oz:3000000,seed:7});
 ok('v2 crags are world-absolute across cuts and skipped when version=1',Math.abs(A2-B2)<1e-9&&WRELIEF.crags(500,1000,2000,-.8,.3,SP2,RP,0)===500,false);}
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
