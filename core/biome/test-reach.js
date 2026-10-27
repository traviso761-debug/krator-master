// node core/biome/test-reach.js: a species' reach (PLAN-LANDS.md H1; 40-core-place.js BIO.reachW, BIO.reachField and
// BIO.grid's opt.reach) on a core/mask distance field (27-core-mask-distance.js), each check with a negative.
const fs=require('fs'),path=require('path'),vm=require('vm');
const D=__dirname,read=f=>fs.readFileSync(path.join(D,f),'utf8');
let fails=0;const check=(name,ok,detail)=>{console.log((ok?'ok   ':'FAIL ')+name+(detail?'  ('+detail+')':''));if(!ok)fails++;};
function core(){const ctx={console,Math};vm.createContext(ctx);
 vm.runInContext(fs.readFileSync(path.join(D,'..','mask','25-core-mask.js'),'utf8'),ctx);
 vm.runInContext(fs.readFileSync(path.join(D,'..','mask','27-core-mask-distance.js'),'utf8'),ctx);
 vm.runInContext(read('10-core-head.js')+'\nthis.BIO=BIO;',ctx);
 vm.runInContext('Object.assign(BIO.fn,{qEuler:null,qFacing:null,qUp:null});',ctx);
 vm.runInContext(read('40-core-place.js'),ctx);
 const errs=[];ctx.BIO.host={obstacles:[],err:m=>errs.push(m),mask:()=>1,terrainH:()=>0,center:[0,0],origin:[[0,0]],waterH:()=>-1e9};
 ctx.BIO.__errs=errs;return ctx;}
const ctx=core(),B=ctx.BIO,K=ctx.KMASK;

// ---- a home polygon on a 2 km raster: the west 10 pixels of a 100 x 20 grid (the cut, say); x east from 0
const W=100,H=20,m=new Uint8Array(W*H);for(let j=0;j<H;j++)for(let i=0;i<10;i++)m[j*W+i]=255;
const F=K.distance({width:W,height:H,data:m}),frame={x0:0,z0:0,m:2000};
B.host.distance={cut:B.reachField(F,frame)};
const R={from:'cut',km:60,falloff:'linear'};
// pixel 9's centre (x 19 km) is inside; pixel 9 + k is k pixels (2k km) out
const at=km=>B.reachW(R,19000+km*1000,21000);
check('inside the home polygon the weight is 1',at(0)===1&&B.reachW(R,5000,5000)===1,at(0));
check('linear: 1 - d/km between (20 km out of 60 -> 2/3)',Math.abs(at(20)-2/3)<1e-12&&Math.abs(at(30)-.5)<1e-12,at(20)+', '+at(30));
check('negative: at and past km the weight is 0',at(60)===0&&at(61)===0&&at(150)===0,at(60)+', '+at(150));
check('smooth (the default) is 1 - smoothstep, 1/2 at half the reach and flat at both ends',
 Math.abs(B.reachW({from:'cut',km:60},49000,21000)-.5)<1e-12&&B.reachW({from:'cut',km:60},19000+1000,21000)>at(1),
 B.reachW({from:'cut',km:60},49000,21000));
check('square: (1 - t)^2',Math.abs(B.reachW({from:'cut',km:60,falloff:'square'},49000,21000)-.25)<1e-12);
check('a function falloff is clamped to [0, 1]',B.reachW({from:'cut',km:60,falloff:t=>2-t},49000,21000)===1&&B.reachW({from:'cut',km:60,falloff:t=>-t},49000,21000)===0);
check('a species record holding .reach reads it',B.reachW({key:'howlbamboo',reach:R},19000+30000,21000)===at(30));
// the field is bilinear between pixel centres: half a pixel out is 1 km
check('reachField: metres from the pixel field, bilinear between centres (x 20 km is 1 km out)',
 Math.abs(B.host.distance.cut(20000,21000)-1000)<1e-9&&B.host.distance.cut(19000,21000)===0);
// negatives: what gives 0
B.__errs.length=0;
check('negative: an unknown home, no km, no from, a reach of null give 0',
 B.reachW({from:'nowhere',km:60},40000,0)===0&&B.reachW({from:'cut'},40000,0)===0&&B.reachW({km:60},40000,0)===0&&B.reachW(null,0,0)===0);
check('negative: an unknown falloff gives 0 and says so',B.reachW({from:'cut',km:60,falloff:'cubic'},40000,21000)===0&&B.__errs.length===1,B.__errs[0]);
const keep=B.host.distance;B.host.distance=null;
check('negative: a host with no distance gives 0 (a reach species does not grow where the host cannot say how far it is)',B.reachW(R,19000,21000)===0);
B.host.distance=(from,x,z)=>from==='cut'?Math.max(0,x-20000):null;
check('host.distance may be one function (from, x, z)',B.reachW(R,50000,0)===.5&&B.reachW({from:'x',km:60},50000,0)===0);
B.host.distance=keep;

// ---- BIO.grid: opt.reach is a factor on accept. Without it the same points and draws as before; with it, none past km
function run(opt){B.fn.reseed(91);const pts=[];const n=B.grid(1500,0,90000,()=>1,(x,y,z)=>pts.push([x,z]),Object.assign({patch:0,center:[90000,10000]},opt));
 return{n,pts,after:B.fn.rng()};}
const plain=run({}),withNull=run({reach:null}),reach=run({reach:R});
check('grid without opt.reach: the same points and the same draws after (opt.reach null too)',JSON.stringify(plain)===JSON.stringify(withNull)&&plain.n>0,plain.n+' placed');
const far=reach.pts.filter(p=>p[0]>19000+60000).length,near=reach.pts.filter(p=>p[0]<19000).length,nearPlain=plain.pts.filter(p=>p[0]<19000).length;
check('grid with opt.reach: nothing past the reach, everything inside the home polygon kept',far===0&&near===nearPlain&&near>0,reach.n+' placed, '+near+' inside, '+far+' past 60 km');
check('negative: without the reach the grid fills past 60 km',plain.pts.filter(p=>p[0]>19000+60000).length>0);
check('grid with opt.reach draws the same stream (a zeroed cell costs no draws)',reach.after===plain.after);
const mid=reach.pts.filter(p=>p[0]>19000+15000&&p[0]<19000+45000).length,midPlain=plain.pts.filter(p=>p[0]>19000+15000&&p[0]<19000+45000).length;
check('grid with opt.reach thins with the distance (about half kept 15 to 45 km out)',mid>midPlain*.3&&mid<midPlain*.7,mid+' of '+midPlain);

console.log(fails?fails+' FAILED':'all passed');process.exit(fails?1:0);
