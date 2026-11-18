// node core/world/test-micro.js — the micro-relief (43m-world-micro.js; core/world/PLAN-MICRO.md), each check with an input
// that must fail it: the hills are continuous and level on the whole; the gullies run downslope as a DEM's do (the drainage
// alignment: cos^2 between the 60-540 m detail's gradient and the large form's, .5 for detail with no direction, a DEM's
// .17-.46) where hills alone read ~.5; no seam (no step between samples 25 cm apart); the ground neither rises nor sinks; a
// far chunk skips what its wavelength cannot show; the grain is smooth on the flat, rough on the steep and stretched down
// the slope; world-absolute (two frames over one place agree); deterministic.
const fs=require('fs'),path=require('path');
global.window=global;
for(const f of [['..','rand','08-core-rand.js'],['40-world-smooth.js'],['43-world-relief.js'],['43m-world-micro.js']])eval(fs.readFileSync(path.join(__dirname,...f),'utf8'));
let bad=0,V=1;const ok=(name,pass,neg)=>{const r=!!pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+'v'+V+' '+name+(neg?' (its negative passed)':''));};
// every check on both versions (PLAN-MICRO.md T0): 1 today's land, 2 the target mean-compensated and the kernel covering everywhere
// the kernel's least total weight on a 5 m grid over 2 km, octave o (the jitter and radius as 43m-world-micro.js's erode draws them)
function minW(ver,o,seed){const lam=[800,400,200,100,50,25][o];let lo=1e9;
 for(let z=0;z<2000;z+=5)for(let x=0;x<2000;x+=5){const ax=x+1e6,az=z+2e6,ci=Math.floor(ax/lam),cj=Math.floor(az/lam);let W=0;
  for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){const i=ci+di,j=cj+dj,hh=KRAND.hash(seed^0x4D45,o,i,j),ju=KRAND.unit(hh),jv=KRAND.unit(KRAND.mix32(hh^0x9E3779B9));
   const px=(i+(ver===2?.25+.5*ju:ju))*lam,pz=(j+(ver===2?.25+.5*jv:jv))*lam,dx=(ax-px)/lam,dz=(az-pz)/lam;let d2=dx*dx+dz*dz;if(ver===2)d2/=1.5625;if(d2<1)W+=(1-d2)*(1-d2);}
  if(W<lo)lo=W;}return lo;}
const REPORT={},S={hill:40,gully:.8,rough:1};
for(V of [1,2]){
WRELIEF.init({ox:0,oz:0,seed:5});WMICRO.init({ox:1e6,oz:2e6,seed:7,version:V});
// the hills: continuous, never under the floor, the floor over half the ground (so it joins up and drains)
{let worst=0,p=null,neg=0,floor=0,n=0;for(let x=0;x<3000;x+=.25){const v=WMICRO.hills(x,0,S,600,0);if(p!=null)worst=Math.max(worst,Math.abs(v-p));p=v;}
 let top=0;for(let i=0;i<200;i++)for(let j=0;j<200;j++){const v=WMICRO.hills(i*150,j*150,S,600,0);if(v<0)neg++;if(v<1e-9)floor++;top=Math.max(top,v);n++;}
 const A=WMICRO.amount(0,0,S,600);
 ok('the hills: continuous (the steepest 25 cm step '+worst.toFixed(4)+' m), never under the floor ('+neg+' below), the floor '+(100*floor/n).toFixed(0)+' % of the ground, the highest '+top.toFixed(1)+' m (amount '+A.toFixed(1)+' m)',
  worst<.05&&neg===0&&floor/n>.55&&top>A*.5,WMICRO.hills(0,0,{hill:0},600,0)!==0);}
// the drainage alignment on a slope with hills: the eroded ground's detail runs downslope
function grid(fn,n,step){const E=new Float64Array(n*n);for(let j=0;j<n;j++)for(let i=0;i<n;i++)E[j*n+i]=fn(i*step,j*step);return E;}
function align(E,n,step){const g=s=>WSMOOTH.gauss(E,n,n,s/step),G60=g(60),G540=g(540),k=Math.ceil(700/step);let num=0,den=0;
 for(let j=k;j<n-k;j++)for(let i=k;i<n-k;i++){const c=j*n+i,dx=((G60[c+1]-G540[c+1])-(G60[c-1]-G540[c-1]))/(2*step),dz=((G60[c+n]-G540[c+n])-(G60[c-n]-G540[c-n]))/(2*step),
  bx=(G540[c+1]-G540[c-1])/(2*step),bz=(G540[c+n]-G540[c-n])/(2*step),b2=bx*bx+bz*bz,W=dx*dx+dz*dz;if(b2<.03*.03||W<=0)continue;num+=(dx*bx+dz*bz)*(dx*bx+dz*bz)/b2;den+=W;}
 return num/den;}
const n=241,step=12.5;
const large=(x,z)=>.08*x+WMICRO.hills(x,z,S,600,0),e=8;
const eroded=(x,z)=>{const gx=(large(x+e,z)-large(x-e,z))/(2*e),gz=(large(x,z+e)-large(x,z-e))/(2*e);return WMICRO.erode(large(x,z),x,z,gx,gz,S,600,0);};
const noisy=(x,z)=>large(x,z)+6*KRAND.gfbm(x/300,z/300,3,9);   /* the same ground with detail of no direction */
const aE=align(grid(eroded,n,step),n,step),aN=align(grid(noisy,n,step),n,step);
ok('the gullies run downslope: drainage alignment '+aE.toFixed(3)+' (a DEM .17-.46), where detail with no direction reads '+aN.toFixed(3),aE<.42,aN<.42);
// no seam: at the steepest 25 cm step along a line, a 1 cm step is a twenty-fifth of it (a wall, however steep, shrinks with the
// spacing; a seam keeps its height); the slopes in a DEM's range. The negative: a real 5 cm step put in is caught
{const at=(f)=>{let worst=0,w=0,p=null;for(let x=0;x<2400;x+=.25){const v=f(x);if(p!=null&&Math.abs(v-p)>worst){worst=Math.abs(v-p);w=x;}p=v;}return [worst,w];};
 const seam=f=>{const [big,x]=at(f);let small=0;for(let k=0;k<25;k++)small=Math.max(small,Math.abs(f(x-k*.01)-f(x-(k+1)*.01)));return small/big;};   /* the steepest 1 cm step inside the worst 25 cm one */
 const f=x=>eroded(x,777),g=x=>eroded(x,777)+(x>1200.1?.05*20:0);
 const S2=[];for(let x=0;x<2400;x+=2)S2.push(Math.abs(eroded(x+1,777)-eroded(x-1,777))/2);S2.sort((a,b)=>a-b);
 const r=seam(f),p99=S2[S2.length*.99|0];
 ok('no seam: at the steepest 25 cm step a 1 cm step is '+(r*100).toFixed(1)+' % of it (4 % for a wall); slopes p50 '+S2[S2.length/2|0].toFixed(2)+', p99 '+p99.toFixed(2)+' (a DEM p99 .6-.73)',
  r<.06&&p99<.9,seam(g)<.06);}
// level: the gullies take out as much as they leave (mean change over 3 km a small share of its spread)
{let s=0,s2=0,m=0;for(let j=0;j<120;j++)for(let i=0;i<120;i++){const x=i*25+3,z=j*25+5,d=eroded(x,z)-large(x,z);s+=d;s2+=d*d;m++;}
 const mean=s/m,rms=Math.sqrt(s2/m);REPORT[V]={mean,rms};
 ok('the ground neither rises nor sinks: mean change '+mean.toFixed(2)+' m against a spread of '+rms.toFixed(2)+' m ('+(100*mean/rms).toFixed(1)+' %; v2 within 5 %, v1 25 %)',Math.abs(mean)<(V===2?.05:.25)*rms&&rms>1,false);}
// the kernel covers the ground: v2's least weight over .5 (cov 1 everywhere); its negative, v1 (holes: an octave part-faded)
{const w=[0,3,5].map(o=>minW(V,o,(7^0x4D45)>>>0)),w1=V===2?[REPORT[1].minW]:w,lo=Math.min(...w);REPORT[V].minW=lo;
 if(V===2)ok('the kernel covers the ground: least weight '+lo.toFixed(3)+' (v1: '+Math.min(...w1).toFixed(3)+')',lo>.5,Math.min(...w1)>.5);
 else ok('the kernel leaves holes (v1, kept as it is): least weight '+lo.toFixed(3),lo<.5,false);}
// a far chunk: minWave over every octave's half wavelength leaves the ground as it was; over the hills', no hills
{const G=[0,0],h0=WMICRO.erode(100,500,500,.1,.02,S,600,450,G);
 ok('a far chunk skips what it cannot show (erode at minWave 450: '+h0+', hills at 1000: '+WMICRO.hills(500,500,S,600,1000)+')',h0===100&&WMICRO.hills(500,500,S,600,1000)===0,WMICRO.erode(100,500,500,.1,.02,S,600,0)===100);}
// the grain: smooth on the flat, rough on the steep, stretched down the slope (its correlation runs further along than across)
{const rms=(sl,gx,gz)=>{let s=0,m=0;for(let i=0;i<4000;i++){const v=WMICRO.grain(i*1.7,i*.9+40,sl,gx,gz,S,0);s+=v*v;m++;}return Math.sqrt(s/m);};
 const flat=rms(0,0,0),steep=rms(.5,.5,0);
 const corr=(dx,dz)=>{let s=0,a=0,b=0;for(let i=0;i<3000;i++){const x=i*3.1,z=i*2.3,u=WMICRO.grain(x,z,.5,.5,0,S,0),v=WMICRO.grain(x+dx,z+dz,.5,.5,0,S,0);s+=u*v;a+=u*u;b+=v*v;}return s/Math.sqrt(a*b);};
 const along=corr(6,0),across=corr(0,6);
 ok('the grain: '+flat.toFixed(2)+' m on the flat, '+steep.toFixed(2)+' m on a 50 % slope; 6 m down the slope it still correlates '+along.toFixed(2)+', across '+across.toFixed(2),
  steep>3*flat&&along>across+.15,WMICRO.grain(0,0,0,0,0,S,13)!==0);}
// the grain is continuous where the slope turns (its stretch blended over fixed orientations): no 1 mm step over 1 cm along a line
// whose slope direction turns every 250 m; the negative, the coordinates turned by the slope (x ~ 1e6), steps by decimetres
{const sl=.3,dir=x=>x/40,f=x=>WMICRO.grain(x,500,sl,sl*Math.cos(dir(x)),sl*Math.sin(dir(x)),S,0);
 const turned=x=>{const ax=x+1e6,az=500+2e6,ux=Math.cos(dir(x)),uz=Math.sin(dir(x)),u=(ax*ux+az*uz)/3,v=-ax*uz+az*ux;return KRAND.gnoise(u/9,v/9,3);};
 const step=g=>{let w=0,p=null;for(let x=100;x<300;x+=.001){const v=g(x);if(p!=null)w=Math.max(w,Math.abs(v-p));p=v;}return w;};
 const a=step(f),b=step(turned);
 ok('the grain is continuous where the slope turns: the steepest 1 mm step '+a.toFixed(4)+' m (the coordinates turned instead: '+b.toFixed(3)+')',a<.01,b<.01);}
// the crease (G[2], the ground's colour reads it): high where the gullies cut the ground down, low where they left a spur standing
// (it correlates with the eroded-less-large height, negatively); the negative, the crease 2 km off (past every octave), hardly does
{const pts=[];for(let i=0;i<1500;i++)pts.push([(i*97.3)%2400+50,(i*61.7)%2400+50]);
 const cre=(x,z)=>{const G=[0,0,0],gx=(large(x+e,z)-large(x-e,z))/(2*e),gz=(large(x,z+e)-large(x,z-e))/(2*e);WMICRO.erode(large(x,z),x,z,gx,gz,S,600,0,G);return G[2];};
 const corr=(A,B)=>{const n=A.length,ma=A.reduce((s,v)=>s+v,0)/n,mb=B.reduce((s,v)=>s+v,0)/n;let s=0,a=0,b=0;for(let i=0;i<n;i++){s+=(A[i]-ma)*(B[i]-mb);a+=(A[i]-ma)**2;b+=(B[i]-mb)**2;}return s/Math.sqrt(a*b);};
 const D=pts.map(([x,z])=>eroded(x,z)-large(x,z)),C=pts.map(([x,z])=>cre(x,z)),C2=pts.map(([x,z])=>cre(x+1733,z+1291));
 const r=corr(C,D),r2=corr(C2,D);
 ok('the crease marks the gullies: it correlates '+r.toFixed(2)+' with the cut of the drainage (the crease 2 km off: '+r2.toFixed(2)+')',r<-.5&&Math.max(...C)<=1&&Math.min(...C)>=-1,r2<-.5);}
// world-absolute: a frame moved by (dx, dz) reads the same land at the moved point
{const a=WMICRO.erode(50,123,456,.07,.03,S,600,0)+WMICRO.hills(123,456,S,600,0);WMICRO.init({ox:1e6-4000,oz:2e6+2500,seed:7,version:V});
 const b=WMICRO.erode(50,4123,-2044,.07,.03,S,600,0)+WMICRO.hills(4123,-2044,S,600,0);WMICRO.init({ox:1e6,oz:2e6,seed:7,version:V});
 ok('world-absolute: two frames over one place agree ('+a.toFixed(6)+', '+b.toFixed(6)+')',Math.abs(a-b)<1e-9,Math.abs(a-WMICRO.erode(50,123,456,.07,.03,S,600,0))<1e-9&&WMICRO.hills(123,456,S,600,0)!==0&&false);}
ok('deterministic',eroded(321,654)===eroded(321,654)&&WMICRO.hills(9,9,S,600,0)===WMICRO.hills(9,9,S,600,0),false);
}
V=2;WMICRO.init({ox:1e6,oz:2e6,seed:7,version:1});const e1=WMICRO.erode(500,321,654,.08,.01,S,600,0);WMICRO.init({ox:1e6,oz:2e6,seed:7,version:2});
ok('version 2 moves the land (erode at one point: v1 '+e1.toFixed(4)+', v2 '+WMICRO.erode(500,321,654,.08,.01,S,600,0).toFixed(4)+')',e1!==WMICRO.erode(500,321,654,.08,.01,S,600,0),false);
console.log('mean bias (mean / rms): v1 '+(100*REPORT[1].mean/REPORT[1].rms).toFixed(1)+' %, v2 '+(100*REPORT[2].mean/REPORT[2].rms).toFixed(1)+' %; least kernel weight v1 '+REPORT[1].minW.toFixed(3)+', v2 '+REPORT[2].minW.toFixed(3));
console.log(bad?bad+' FAILED':'all passed');
process.exit(bad?1:0);
