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
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
