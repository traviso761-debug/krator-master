// node core/atmos/test-shimmer.js — the heat shimmer's arithmetic (fx/89-atmos-fx-shimmer.js), each check with a negative. The
// pass itself is checked on SwiftShader by tools/check_shimmer.py (pixels move over hot ground, and only there).
const fs=require('fs'),path=require('path');
const FRAGS=['../shader/06-core-khook.js','../shader/06b-core-kcolor.js'].concat(fs.readdirSync(__dirname).filter(f=>/^89-atmos-.*\.js$/.test(f)).sort());
global.window=global;eval(FRAGS.map(f=>fs.readFileSync(path.join(__dirname,f),'utf8')).join('\n')+';global.ATMOS=ATMOS;');
const A=ATMOS;
let bad=0;const ok=(name,pass,neg)=>{const r=pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const throws=f=>{try{f();return false;}catch(e){return true;}};
ok('without the file there is no shimmer (it is opt-in)',typeof A.shimmer==='undefined',false);
eval(fs.readFileSync(path.join(__dirname,'fx','89-atmos-fx-shimmer.js'),'utf8'));
/* a 9 x 9 field, 10 m a node: 80 degrees in the middle, -5 round it */
const nx=9,T=[];for(let j=0;j<nx;j++)for(let i=0;i<nx;i++)T.push(Math.hypot(i-4,j-4)<1.5?80:-5);const F={x0:-40,z0:-40,cell:10,nx,nz:nx,T};
const B=A.shimmerBytes(F);
ok('the bytes are the strength: whole over the vent, nothing on cold ground',B[(4*nx+4)*4]===255&&B[0]===0&&B.length===nx*nx*4,B[0]===255);
ok('far over the vent the strength is whole; near the eye nothing',Math.abs(A.shimmerK(F,0,0,200)-1)<1e-9&&A.shimmerK(F,0,0,3)===0,A.shimmerK(F,0,0,3)>0);
ok('half way along the ramp it is half',Math.abs(A.shimmerK(F,0,0,48)-.5)<1e-9,false);
ok('cold ground never shimmers',A.shimmerK(F,-38,-38,500)===0&&A.shimmerK(F,-25,30,500)===0,A.shimmerK(F,0,0,500)===0);
ok('t0 and t1 move it: a field all under t0 is still',A.shimmerK(F,0,0,200,{t0:90,t1:100})===0,A.shimmerK(F,0,0,200,{t0:20,t1:30})===0);
ok('a bad field, t1 <= t0 and far <= near throw',throws(()=>A.shimmerBytes({nx:1}))&&throws(()=>A.shimmerK(F,0,0,1,{t0:5,t1:5}))&&throws(()=>A.shimmerK(F,0,0,1,{near:9,far:9})),throws(()=>A.shimmerK(F,0,0,1)));
ok('shimmer needs ATMOS.init (the page\'s THREE)',throws(()=>A.shimmer({field:F,renderer:{}})),false);
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
