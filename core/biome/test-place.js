// node core/biome/test-place.js: BIO.faceSamples' contract and keep-clear and scatter on core/space's KSPACE
// (40-core-place.js), each check with a negative.
// A plain list of geometries draws exactly what the sampler drew before shells existed (the
// pre-shell sampler is rebuilt below from the same core, so a change to it shows here); shells
// split the samples by share; without shells a big roof takes nearly all of them.
const fs=require('fs'),path=require('path'),vm=require('vm');
const D=__dirname,read=f=>fs.readFileSync(path.join(D,f),'utf8');
function core(placeSrc,space){const ctx={console,Math};vm.createContext(ctx);
 // core/space as a page loads it (a build lists it beside the biome core), or not at all (a settlement that does not)
 if(space)vm.runInContext(fs.readFileSync(path.join(D,'..','space','20-core-space.js'),'utf8'),ctx);
 vm.runInContext(read('10-core-head.js')+'\nthis.BIO=BIO;',ctx);
 // 40 reads qEuler.. from BIO.fn (20-core-kit exports them); this test needs none of them
 vm.runInContext('Object.assign(BIO.fn,{qEuler:null,qFacing:null,qUp:null});',ctx);
 vm.runInContext(placeSrc,ctx);ctx.BIO.host={obstacles:[]};ctx.BIO.__ctx=ctx;return ctx.BIO;}
// a geometry: triangles given as [[x,y,z]x3...], with getX/getY/getZ like a BufferAttribute
function geo(tris){const a=[];tris.forEach(t=>t.forEach(p=>a.push(...p)));
 return{attributes:{position:{count:a.length/3,getX:i=>a[i*3],getY:i=>a[i*3+1],getZ:i=>a[i*3+2]}},index:null};}
const quad=(x0,z0,x1,z1,y)=>[[[x0,y,z0],[x0,y,z1],[x1,y,z1]],[[x0,y,z0],[x1,y,z1],[x1,y,z0]]];
const roof=geo(quad(0,0,100,100,20));                                  // 10,000 m^2
const ledges=geo([].concat(...Array.from({length:10},(_,i)=>quad(i*3,-5,i*3+1,-4,5))));   // 10 m^2
let fails=0;const check=(name,ok,detail)=>{console.log((ok?'ok   ':'FAIL ')+name+(detail?'  ('+detail+')':''));if(!ok)fails++;};
const NEW=core(read('40-core-place.js'));
// the pre-shell sampler, FROZEN here as the kits ran it before shells (core/biome at fbcda04), over the
// same core: a plain list must draw exactly what it drew
const PRE_SHELL=`BIO.faceSamples=function(geos,n,filt){const out=[];const F=[];let tot=0;
 for(const g of geos){const p=g.attributes.position;if(!p)continue;const idx=g.index?g.index.array:null;const cnt=idx?idx.length:p.count;
  for(let i=0;i<cnt;i+=3){const a=idx?idx[i]:i,b=idx?idx[i+1]:i+1,c=idx?idx[i+2]:i+2;
   const ax=p.getX(a),ay=p.getY(a),az=p.getZ(a),bx=p.getX(b),by=p.getY(b),bz=p.getZ(b),cx=p.getX(c),cy=p.getY(c),cz=p.getZ(c);
   const ux=bx-ax,uy=by-ay,uz=bz-az,vx=cx-ax,vy=cy-ay,vz=cz-az;
   let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;const l=Math.hypot(nx,ny,nz);if(l<1e-9)continue;nx/=l;ny/=l;nz/=l;
   if(filt&&!filt(nx,ny,nz))continue;
   const ar=l*.5;tot+=ar;F.push([ax,ay,az,bx,by,bz,cx,cy,cz,nx,ny,nz,ar,tot]);}}
 if(!F.length)return out;
 for(let k=0;k<n;k++){const r=rng()*tot;let lo=0,hi=F.length-1;while(lo<hi){const m=(lo+hi)>>1;if(F[m][13]<r)lo=m+1;else hi=m;}
  const f=F[lo];let u=rng(),v=rng();if(u+v>1){u=1-u;v=1-v;}const w=1-u-v;
  out.push({p:[f[0]*w+f[3]*u+f[6]*v,f[1]*w+f[4]*u+f[7]*v,f[2]*w+f[5]*u+f[8]*v],n:[f[9],f[10],f[11]],a:f[12]});}
 return out;};
`;
const OLD=core(read('40-core-place.js'));
vm.runInContext('(function(){const {rng}=BIO.fn;'+PRE_SHELL+'})();',OLD.__ctx);
check('the frozen pre-shell sampler is the one in use',!/geos\.some/.test(OLD.faceSamples.toString()));
NEW.fn.reseed(42);OLD.fn.reseed(42);
const a=NEW.upFaces([roof,ledges],400),b=OLD.upFaces([roof,ledges],400);
check('a plain list draws exactly what the pre-shell sampler drew',JSON.stringify(a)===JSON.stringify(b),a.length+' samples');
const onLedge=s=>s.p[1]<10;
check('without shells, the roof takes nearly all of them (the negative)',a.filter(onLedge).length<10,a.filter(onLedge).length+' of 400 on the ledges');
NEW.fn.reseed(42);
const c=NEW.upFaces([{geos:[roof],share:.2},{geos:[ledges],share:.8}],400),led=c.filter(onLedge).length;
check('shells split the samples by share',c.length===400&&led===320,led+' of '+c.length+' on the ledges');
NEW.fn.reseed(42);
const d=NEW.upFaces([{geos:[roof]},{geos:[ledges]}],401);
check('shells with no share split evenly, the last shell takes the remainder (round(200.5)=201 to the roof, 200 left)',d.length===401&&d.filter(onLedge).length===200,d.filter(onLedge).length+' of '+d.length);
NEW.fn.reseed(42);
const e=NEW.upFaces([{geos:[roof],share:1},ledges],100);
check('a plain geometry beside a shell is a shell of its own',e.length===100&&e.filter(onLedge).length===50,e.filter(onLedge).length+' of '+e.length);
// a shell with no face the filter accepts (a vertical wall asked for up-faces) takes no share
const wall=geo([[[0,0,0],[0,10,0],[10,10,0]],[[0,0,0],[10,10,0],[10,0,0]]]);
NEW.fn.reseed(42);
const g=NEW.upFaces([{geos:[ledges],share:.5},{geos:[wall],share:.5}],100);
check('a shell with no qualifying face gives its share to the others',g.length===100&&g.every(onLedge),g.length+' samples, '+g.filter(onLedge).length+' on the ledges');
NEW.fn.reseed(42);
const g2=NEW.upFaces([{geos:[wall]}],50);
check('only empty shells: no samples (nothing to place, nothing invented)',g2.length===0,g2.length+' samples');
const f=NEW.ledgePoints([{geos:[roof],share:.5},{geos:[ledges],share:.5}],40,2.5);
check('ledgePoints takes shells',Array.isArray(f)&&f.length>0,f.length+' points');
// ---------------------------------------------------------------- keep-clear and scatter on KSPACE
// clearOf, clearOf3 and scatter read a KSPACE grid when the page loads core/space. They must answer exactly what the
// linear scans answered (FROZEN below as they were before the index, over the same core): the same obstacles block,
// the same points pass, the same draws are made, including obstacles pushed after the first query, a swapped array and
// a shorter one. Without core/space on the page the scans run, unchanged.
const LINEAR=`BIO.scatter=function(n,rIn,rOut,minD,fn,opt){opt=opt||{};const o=opt.center||BIO.center(),P=[];let tries=0;
 while(P.length<n&&tries++<n*40){const a=rng()*TAU,u=Math.pow(rng(),opt.pow||1);
  const r=Math.sqrt(lerp(rIn*rIn,rOut*rOut,u)),x=o[0]+Math.cos(a)*r,z=o[1]+Math.sin(a)*r;
  if(rng()>BIO.mask(x,z))continue;if(!BIO.clearOf(x,z,opt.pad||0))continue;
  let ok=true;for(const q of P)if(Math.hypot(x-q[0],z-q[1])<minD){ok=false;break;}
  if(!ok)continue;P.push([x,z]);fn(x,BIO.terrainH(x,z),z,r);}
 return P;};
BIO.clearOf=function(x,z,pad){const O=BIO.host.obstacles;pad=pad||0;
 for(let i=0;i<O.length;i++){const q=O[i];if(Math.hypot(x-q.x,z-q.z)<q.r+pad)return false;}return true;};
BIO.clearOf3=function(x,y,z,rad,vr){const O=BIO.host.obstacles;
 for(let i=0;i<O.length;i++){const q=O[i];if(q.y0!=null&&(y+vr<q.y0||y-vr>q.y1))continue;
  if(Math.hypot(x-q.x,z-q.z)<q.r+rad)return false;}return true;};`;
const IDX=core(read('40-core-place.js'),true),LIN=core(read('40-core-place.js'),true),BARE=core(read('40-core-place.js'),false);
vm.runInContext('(function(){const {TAU,lerp,rng}=BIO.fn;'+LINEAR+'})();',LIN.__ctx);
check('the frozen linear scans are the reference; the indexed core is the one under test',
 !/KSPACE|obstacleIndex/.test(LIN.clearOf.toString()+LIN.clearOf3.toString()+LIN.scatter.toString())&&/obstacleIndex/.test(IDX.clearOf.toString())&&/KSPACE/.test(IDX.scatter.toString()));
// the test's own generator (not BIO's: the sets must not depend on the code under test)
const mul=s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
let R=mul(9001);const U=(a,b)=>a+(b-a)*R(),withGen=(g,f)=>{const k=R;R=g;try{return f();}finally{R=k;}};
const obst=n=>Array.from({length:n},()=>{const k=R(),o={x:U(-600,600),z:U(-600,600),r:k<.03?U(70,200):k<.07?U(-3,0):U(0,12)};
 if(R()<.5){o.y0=U(-20,40);o.y1=o.y0+U(0,60);}return o;});
const PADS=[0,.5,3,8,40,-2,undefined,NaN,1e4];
const queries=n=>Array.from({length:n},()=>({x:U(-750,750),z:U(-750,750),pad:PADS[Math.floor(R()*PADS.length)],y:U(-30,90),rad:U(-1,15),vr:U(0,10)}));
// how many of qs two cores answer differently (clearOf and clearOf3), and how many the scan blocks
function agree(A,B,qs){let bad=0,blocked=0;for(const q of qs){const a=A.clearOf(q.x,q.z,q.pad),b=B.clearOf(q.x,q.z,q.pad),
  c=A.clearOf3(q.x,q.y,q.z,q.rad,q.vr),d=B.clearOf3(q.x,q.y,q.z,q.rad,q.vr);if(a!==b)bad++;if(c!==d)bad++;if(!b)blocked++;}return{bad,blocked};}
const both=O=>{IDX.host.obstacles=O;LIN.host.obstacles=O;BARE.host.obstacles=O;};
const O1=obst(400);both(O1);
let Q=queries(6000);const r1=agree(IDX,LIN,Q);
check('indexed clearOf/clearOf3 equal the linear scans on a random set',r1.bad===0&&r1.blocked>300&&r1.blocked<5700&&IDX.obstacleIndex()!==null,
 r1.bad+' differ of '+Q.length*2+', '+r1.blocked+' blocked');
const snap=O1.slice(),filed=IDX.__ctx.KSPACE.create({cell:24});snap.forEach(o=>filed.insert(o,o.x,o.z,o.r));   // a stale index
O1.push(...obst(400));Q=queries(6000);const r2=agree(IDX,LIN,Q);
let stale=0;for(const q of Q){const p=q.pad||0;const hit=filed.some(q.x,q.z,p,o=>Math.hypot(q.x-o.x,q.z-o.z)<o.r+p);if(!hit!==LIN.clearOf(q.x,q.z,q.pad))stale++;}
check('obstacles pushed after the first query are filed (lazily) and block',r2.bad===0&&stale>0,
 r2.bad+' differ of '+Q.length*2+' after 400 more were pushed; an index not extended would differ on '+stale);
const O2=obst(120);both(O2);Q=queries(4000);const r3=agree(IDX,LIN,Q);
check('a new obstacles array (a nursery swaps one in) is filed afresh',r3.bad===0&&r3.blocked>0,r3.bad+' differ, '+r3.blocked+' blocked');
O2.length=60;Q=queries(4000);const r4=agree(IDX,LIN,Q);
check('a shorter array is filed afresh',r4.bad===0,r4.bad+' differ');
O2.length=59;O2.push(...obst(1));Q=queries(4000);const r4b=agree(IDX,LIN,Q);
check('an array cut and refilled to the same length is filed afresh (its last entry changed)',r4b.bad===0,r4b.bad+' differ');
// an entry the index cannot file (r a string: the scan concatenates '5'+3 = '53' and compares 53) sends the queries to the scan
const O3=obst(30).concat([{x:0,z:0,r:'5'}]);both(O3);
const r5=agree(IDX,LIN,queries(2000));
check('an entry without numeric x, z, r: the plain scan answers, as before',IDX.clearOf(40,0,3)===false&&LIN.clearOf(40,0,3)===false&&r5.bad===0&&IDX.obstacleIndex()===null,
 'blocked at 40 m by r:"5" with pad 3; '+r5.bad+' differ');
both(obst(30).concat([{x:0,z:0,r:5}]));
check('the same obstacle with a numeric r does not reach 40 m (the negative)',IDX.clearOf(40,0,3)===true&&IDX.obstacleIndex()!==null);
both(O1);let sbad=0;for(const q of queries(500)){const sx=String(q.x),sp=q.pad==null?q.pad:String(q.pad);
 if(IDX.clearOf(sx,q.z,q.pad)!==LIN.clearOf(sx,q.z,q.pad)||IDX.clearOf(q.x,q.z,sp)!==LIN.clearOf(q.x,q.z,sp)||IDX.clearOf3(sx,q.y,q.z,q.rad,q.vr)!==LIN.clearOf3(sx,q.y,q.z,q.rad,q.vr))sbad++;}
let sdif=0;for(const q of queries(500))if(q.pad!=null&&LIN.clearOf(q.x,q.z,String(q.pad))!==LIN.clearOf(q.x,q.z,q.pad))sdif++;
check('a query with a string x or pad: the plain scan answers, as before',sbad===0&&sdif>0,sbad+' differ of 1500; a string pad answers differently from the number on '+sdif+' of 500 (the scan concatenates r+"3")');
// without core/space on the page (a settlement that lists the biome core only) the scans run: the same answers
Q=queries(3000);const r6=agree(BARE,LIN,Q);
check('without core/space on the page the scans answer (no KSPACE, the same results)',r6.bad===0&&BARE.obstacleIndex()===null&&IDX.obstacleIndex()!==null,r6.bad+' differ');
// scatter and grid: the same points in the same order, the same calls, the same draws after; obstacles pushed from fn
// (Throne's trees push theirs while their grid runs) block the cells after them
function place(B,kind,arg){B.fn.reseed(77);const log=[],O=obst(150);B.host.obstacles=O;B.host.mask=(x,z)=>.55+.45*Math.sin(x*.013)*Math.cos(z*.011);
 B.host.terrainH=(x,z)=>x*.01;B.host.center=[10,-20];B.host.origin=[[0,0]];B.host.waterH=()=>-1e9;
 const fn=(x,y,z,r)=>{log.push([x,y,z,r]);if(arg.push)O.push({x,z,r:arg.push});};
 const P=kind==='grid'?B.grid(arg.cell,0,arg.R,(x,z,d)=>.8,fn,{pad:arg.pad}):B.scatter(arg.n,arg.rIn||0,arg.R,arg.minD,fn,{pad:arg.pad,pow:arg.pow});
 return JSON.stringify([P,log,B.fn.rng(),O.length]);}
const CASES=[['scatter',{n:3000,R:500,minD:6,pad:2}],['scatter',{n:800,rIn:50,R:400,minD:15,pad:0,pow:1.5}],['scatter',{n:500,R:300,minD:4,pad:3,push:4}],
 ['scatter',{n:1500,R:150,minD:6,pad:1}],['scatter',{n:200,R:300,minD:0}],['scatter',{n:200,R:300}],['grid',{cell:6,R:350,pad:4,push:5}],['grid',{cell:9,R:500,pad:0}]];
// obst() draws from the test's generator: run each case's sides on the same draws
CASES.forEach(([k,a],i)=>{const x=withGen(mul(31+i),()=>place(IDX,k,a)),y=withGen(mul(31+i),()=>place(LIN,k,a)),z=withGen(mul(31+i),()=>place(BARE,k,a)),n=JSON.parse(x)[1].length;
 check(k+' '+JSON.stringify(a)+': the same points, calls and draws as the linear scans (and without core/space)',x===y&&z===y&&n>0,n+' placed'+(n<a.n?' (full: the tries ran out)':''));});
const sp=JSON.parse(withGen(mul(5),()=>place(IDX,'scatter',{n:3000,R:500,minD:6,pad:2})))[0],nosp=JSON.parse(withGen(mul(5),()=>place(IDX,'scatter',{n:3000,R:500,minD:0,pad:2})))[0];
let close=0;for(let i=0;i<nosp.length;i++)for(let j=0;j<i;j++)if(Math.hypot(nosp[i][0]-nosp[j][0],nosp[i][1]-nosp[j][1])<6)close++;
check('without the spacing the points crowd (the negative: the spacing test binds in these cases)',close>0&&JSON.stringify(sp)!==JSON.stringify(nosp),close+' pairs closer than 6 m');
// standAt's defaults (stage 0g): null and undefined take them; a scale or seed given is used as given
IDX.fn.reseed(1);const sa=[[100,200],[-3000,812],[5555,-77]].map(([x,z])=>[IDX.standAt(x,z,4),IDX.standAt(x,z,4,null,null),IDX.standAt(x,z,4,.0017,9483),IDX.standAt(x,z,4,.0017,71)]);
check('standAt: no scale or seed is .0017 and 9483 (as before); another seed is another field (the negative)',sa.every(r=>r[0]===r[1]&&r[1]===r[2])&&sa.some(r=>r[3]!==r[2]),JSON.stringify(sa));
process.exit(fails?1:0);
