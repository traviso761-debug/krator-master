// node core/terrain/test-rills.js — the rills' contract (38r-core-rills.js, KRELIEF.rills): they cut (never raise), vanish on the flat,
// run down the fall line (long along it, short across it), keep their spacing, and are the same every time.
'use strict';
const fs=require('fs'),path=require('path');
const T=require('../../tools/ktest.js')(__filename);
global.window=global;
eval(fs.readFileSync(path.join(__dirname,'..','rand','08-core-rand.js'),'utf8'));
eval(fs.readFileSync(path.join(__dirname,'38r-core-rills.js'),'utf8'));
const R=KRELIEF.rills({seed:4401});

// a flank falling to +x at slope 1 (gradient (-1, 0): h falls as x grows): the contour runs along z
const G=[-1,0];
{let lo=0,hi=-1e9;for(let q=0;q<4000;q++){const x=(q*.731)%97,z=(q*1.37)%89,d=R.at(x,z,G[0],G[1]);lo=Math.min(lo,d);hi=Math.max(hi,d);}
  T.ok('the rills cut and never raise (dh in [-max, 0]: '+lo.toFixed(3)+' .. '+hi.toFixed(3)+')',hi<=0&&lo>=-R.max-1e-9&&lo<-.4*R.max);}
T.ok('no rills on the flat (a gradient under the start)',[0,.1,.25].every(g=>R.at(13.2,7.7,g,0)===0));
{const a=R.at(10.3,20.1,-1,0),b=KRELIEF.rills({seed:4401}).at(10.3,20.1,-1,0);T.ok('the same rills every time',a===b&&a!==KRELIEF.rills({seed:4402}).at(10.3,20.1,-1,0));}

// down the fall line the wave holds (rills are long); across it, it swings ridge to gully within about half a spacing
const corr=(dx,dz,lag)=>{let s=0,sa=0,sb=0,saa=0,sbb=0,n=0;for(let q=0;q<3000;q++){const x=(q*.913)%211,z=(q*1.618)%197,a=R.wave(x,z,0,1,1.8,R.seeds[0]),b=R.wave(x+dx*lag,z+dz*lag,0,1,1.8,R.seeds[0]);
  s+=a*b;sa+=a;sb+=b;saa+=a*a;sbb+=b*b;n++;}const ma=sa/n,mb=sb/n;return (s/n-ma*mb)/Math.sqrt((saa/n-ma*ma)*(sbb/n-mb*mb));};
const runsDown=c=>c.along>.6&&c.across<.1;
const cAlong=corr(1,0,.9),cAcross=corr(0,1,.9);
T.neg('the rills run down the fall line (correlation .9 m down it '+cAlong.toFixed(2)+', across it '+cAcross.toFixed(2)+'; swapped is caught)',runsDown,
  {along:cAcross,across:cAlong},{along:cAlong,across:cAcross});
// the spacing: across the fall line the wave comes back near one spacing (the lattice's jitter blurs it), not at half
{const c1=corr(0,1,1.8),ch=corr(0,1,.9);T.ok('across the fall line the wave returns near its spacing ('+c1.toFixed(2)+' at 1.8 m against '+ch.toFixed(2)+' at 0.9 m)',c1>ch+.2);}
// the wave has contrast: a blend that averaged the points' waves away would leave a flank as smooth as before
{let s=0,s2=0,n=0;for(let q=0;q<3000;q++){const v=R.wave((q*.913)%211,(q*1.618)%197,0,1,1.8,R.seeds[0]);s+=v;s2+=v*v;n++;}const sd=Math.sqrt(s2/n-(s/n)*(s/n));
  T.neg('the blended wave keeps its contrast (sd '+sd.toFixed(3)+'; a flat wave is caught)',v=>v>.12,.02,sd);}
T.done();
