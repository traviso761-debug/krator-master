// node core/rand/test-rand.js [--write]: core/rand against golden.json (the vectors the GDScript twin krand.gd and the
// Python transliteration test_rand.py are tested against too), and against the lineages' own generators.
// Each check has a negative that must fail. --write regenerates golden.json; do that only when the algorithm is
// meant to change, which moves every build that uses it.
const fs=require('fs'),path=require('path'),crypto=require('crypto');
require(path.join(__dirname,'08-core-rand.js'));const K=globalThis.KRAND;
let bad=0;const ok=(name,pass,neg)=>{const r=pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};

// ---- the vectors (the same recipe is written out in test_rand.py and krand_test.gd)
const SEEDS=[0,1,2,3,7,11,42,99,1234,1234567,2147483647,2147483648,4294967295,2654435769,31337,65536,16777216,271828,314159,8675309];
const NAMES=['trees','rubble','a','','Hykkousoi','über'];
function u32bytes(a){const b=Buffer.alloc(a.length*4);a.forEach((v,i)=>b.writeUInt32LE(v>>>0,i*4));return b;}
function f64bytes(a){const b=Buffer.alloc(a.length*8);a.forEach((v,i)=>b.writeDoubleLE(v,i*8));return b;}
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
function vectors(){
  const out={version:K.version,streams:[],hash:{},noise:{},cell:{},child:[]};
  for(const s of SEEDS){const st=K.stream(s),a=[];for(let i=0;i<1000;i++)a.push(st.u32());out.streams.push({seed:s,first:a.slice(0,8),sha256:sha(u32bytes(a))});}
  let g=K.stream(99);const H1=[],H2=[],H3=[];
  for(let i=0;i<1000;i++){const s=g.u32(),a=g.int(-100000,100000),b=g.int(-100000,100000),c=g.int(-100000,100000);
    H1.push(K.hash(s,a));H2.push(K.hash(s,a,b));H3.push(K.hash(s,a,b,c));}
  for(const [k,a] of [['one',H1],['two',H2],['three',H3]])out.hash[k]={first:a.slice(0,8),sha256:sha(u32bytes(a))};
  g=K.stream(2024);const N={h3:[],vnoise:[],fbm3:[],fbm5:[]};
  for(let i=0;i<1000;i++){const x=g.range(-500,500),y=g.range(-50,50),z=g.range(-500,500),s=i%5;
    N.h3.push(K.h3(x,y,z,s));N.vnoise.push(K.vnoise(x,y,z,s));N.fbm3.push(K.fbm(x,y,z,3,s));N.fbm5.push(K.fbm(x*.01,y*.01,z*.01,5,s));}
  for(const k in N)out.noise[k]={first:N[k].slice(0,4),sha256:sha(f64bytes(N[k]))};
  g=K.stream(7);const C=[];for(let i=0;i<1000;i++)C.push(K.cell(g.u32(),g.int(-5000,5000),g.int(-5000,5000)));
  out.cell={first:C.slice(0,8),sha256:sha(u32bytes(C))};
  for(const s of SEEDS.slice(0,5))for(const n of NAMES)out.child.push([s,n,K.child(s,n)]);
  return out;
}
const GOLD=path.join(__dirname,'golden.json');
const now=vectors();
if(process.argv.includes('--write')){fs.writeFileSync(GOLD,JSON.stringify(now,null,1)+'\n');console.log('wrote golden.json');}
const gold=JSON.parse(fs.readFileSync(GOLD,'utf8'));
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);

ok('streams match golden.json for 20 seeds',same(now.streams,gold.streams),same(now.streams.slice(1),gold.streams.slice(0,-1)));
ok('hash matches golden.json (1, 2 and 3 values)',same(now.hash,gold.hash),same(now.hash.one,gold.hash.two));
ok('h3, vnoise and fbm match golden.json bit for bit',same(now.noise,gold.noise),same(now.noise.fbm3,gold.noise.fbm5));
ok('cell and child seeds match golden.json',same(now.cell,gold.cell)&&same(now.child,gold.child),same(now.child[0],gold.child[1]));

// ---- the stream IS the lineages' rng: same numbers as kits/ancients and core/biome, so adopting it moves nothing
function lineage(file,state){
  const src=fs.readFileSync(path.join(__dirname,'..','..',file),'utf8');
  const fr=src.match(new RegExp('function reseed\\(s\\)\\{'+state+'=s>>>0;\\}')),fg=src.match(/function rng\(\)\{[^\n]*\}/);
  if(!fr||!fg)return null;
  return new Function('let '+state+'=0;'+fr[0]+fg[0]+';return {reseed,rng};')();
}
for(const [file,state] of [['kits/ancients/src/10-core.js','_seed'],['core/biome/10-core-head.js','_bseed']]){
  const L=lineage(file,state);
  if(!L){ok(file+': its reseed/rng was found',false,false);continue;}
  let eq=true;for(const s of [0,1,1234567,4294967295,31337]){L.reseed(s);const st=K.stream(s);for(let i=0;i<2000;i++)if(L.rng()!==st.next()){eq=false;break;}}
  L.reseed(1);const st2=K.stream(2);
  ok('KRAND.stream draws exactly '+file+"'s rng()",eq,L.rng()===st2.next());
}

// ---- behaviour
const st=K.stream(5);st.next();st.next();const sv=st.state(),a=[st.next(),st.next()];st.setState(sv);
ok('a stream resumes from a saved state',st.next()===a[0]&&st.next()===a[1],K.stream(6).next()===a[0]);
ok('the hash ignores the fraction of a float (lattice inputs)',K.hash(3,10.9,-2.2)===K.hash(3,10,-3),K.hash(3,10,-3)===K.hash(3,-3,10));
ok('h3 depends on its seed',K.h3(1,2,3,0)!==K.h3(1,2,3,1),K.h3(1,2,3,0)!==K.h3(1,2,3,0));
ok('vnoise equals h3 at a lattice point',K.vnoise(4,5,6,9)===K.h3(4,5,6,9),K.vnoise(4.5,5,6,9)===K.h3(4,5,6,9));
const vs=[];for(let i=0;i<20000;i++)vs.push(K.fbm(i*.31,i*.017,-i*.23,4,1));
ok('fbm stays in [0,1]',Math.min(...vs)>=0&&Math.max(...vs)<=1,Math.max(...vs)<.5);
ok('a cell seed is fixed by (seed, ix, iz) alone',K.cell(9,-3,4)===K.cell(9,-3,4)&&K.cell(9,-3,4)!==K.cell(9,4,-3),K.cell(9,-3,4)===K.cell(10,-3,4));
ok('child seeds differ by name and by seed',K.child(1,'trees')!==K.child(1,'rubble')&&K.child(1,'trees')!==K.child(2,'trees'),K.child(1,'trees')!==K.child(1,'trees'));
const src=fs.readFileSync(path.join(__dirname,'08-core-rand.js'),'utf8').split('\n').filter(l=>!/^\s*\/\//.test(l)).join('\n');
ok('no engine-dependent library maths (sin, cos, pow, exp, log, random)',!/Math\.(sin|cos|tan|pow|exp|log|random|sqrt|hypot|atan)/.test(src),false);
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
