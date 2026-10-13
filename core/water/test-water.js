// node core/water/test-water.js — the water module's contract, each check with a broken input that must fail.
// The CPU twins (20-core-water.js) against THE SHADERS' OWN TEXT: the chunk 50-core-water-draw.js writes (and the
// atmos_waves chunk it includes) is run here by a small GLSL interpreter (the subset the chunks use: float/vec2-4,
// swizzles, inout, if/for, ?:, the builtins below), in doubles, so "the twin equals the shader's sum" is checked on the
// very text the GPU compiles, at sample points. Then the clock's wrap, the Newton inverse, the foam's decay, the bed's
// bytes, the CDLOD selection (tiling, one level between neighbours, no crack where levels meet), riding, flow and still water.
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..','..');
const src=['core/terrain/30-core-field.js','core/mask/25-core-mask.js','core/atmos/89-atmos-0-core.js','core/atmos/89-atmos-0p-presets.js','core/atmos/89-atmos-a-waves.js',
 'core/water/20-core-water.js','core/water/21-core-water-shore.js','core/water/22-core-water-flow.js','core/water/50-core-water-draw.js','core/water/51-core-water-kinds.js']
 .filter(f=>fs.existsSync(path.join(ROOT,f))).map(f=>fs.readFileSync(path.join(ROOT,f),'utf8')).join('\n');
global.window=global;eval(src+';global.ATMOS=ATMOS;global.WATER=WATER;');
const A=ATMOS,W=WATER,TAU=Math.PI*2;
let bad=0;const ok=(name,pass,neg)=>{const r=!!pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const near=(a,b,e)=>Math.abs(a-b)<(e||1e-9);

// ---------------------------------------------------------------- a GLSL interpreter (the chunks' subset)
function glslProgram(text,env){
 text=text.replace(/\/\/[^\n]*/g,'').replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*#[^\n]*$/gm,'');
 const T=[];const re=/\s*(\d+\.\d*(?:[eE][+-]?\d+)?|\.\d+(?:[eE][+-]?\d+)?|\d+(?:[eE][+-]?\d+)?|[A-Za-z_]\w*|\+=|-=|\*=|\/=|==|!=|<=|>=|&&|\|\||\+\+|--|[-+*\/<>=!?:(){}\[\],;.])/y;
 let m;re.lastIndex=0;while(re.lastIndex<text.length){const at=re.lastIndex;m=re.exec(text);if(!m){if(/^\s*$/.test(text.slice(at)))break;throw new Error('glsl: cannot read at '+text.slice(at,at+30));}T.push(m[1]);}
 let i=0;const peek=()=>T[i],next=()=>T[i++],eat=t=>{if(T[i]!==t)throw new Error('glsl: expected '+t+' got '+T[i]+' near '+T.slice(i-5,i+5).join(' '));i++;};
 const TYPES=new Set(['float','int','bool','vec2','vec3','vec4','void','sampler2D']),QUAL=new Set(['in','out','inout','const','highp','mediump','lowp']);
 const funcs={},globals=new Map();
 // expressions -> closures over a scope (Map chain)
 const BIN=[['||'],['&&'],['==','!='],['<','>','<=','>='],['+','-'],['*','/']];
 function primary(){const t=next();
  if(/^[\d.]/.test(t))return{k:'num',v:parseFloat(t)};
  if(t==='('){const e=expr();eat(')');return e;}
  if(t==='-'||t==='!'||t==='+')return{k:'un',op:t,a:postfix(primary())};
  if(peek()==='('){next();const args=[];if(peek()!==')'){args.push(assign());while(peek()===','){next();args.push(assign());}}eat(')');return{k:'call',f:t,args};}
  return{k:'id',n:t};}
 function postfix(e){for(;;){if(peek()==='.'){next();e={k:'sw',a:e,s:next()};}else if(peek()==='['){next();const x=expr();eat(']');e={k:'ix',a:e,x};}
   else if(peek()==='++'||peek()==='--'){e={k:'post',op:next(),a:e};}else return e;}}
 function unary(){if(peek()==='-'||peek()==='!'||peek()==='+'){const op=next();return{k:'un',op,a:unary()};}if(peek()==='++'||peek()==='--'){const op=next();return{k:'pre',op,a:unary()};}return postfix(primary());}
 function bin(l){if(l===BIN.length)return unary();let a=bin(l+1);while(BIN[l].includes(peek())){const op=next();a={k:'bin',op,a,b:bin(l+1)};}return a;}
 function tern(){const c=bin(0);if(peek()==='?'){next();const a=assign();eat(':');const b=assign();return{k:'tern',c,a,b};}return c;}
 function assign(){const l=tern();if(['=','+=','-=','*=','/='].includes(peek())){const op=next();return{k:'asg',op,l,r:assign()};}return l;}
 function expr(){return assign();}
 // statements
 function decl(type){const out=[];do{const n=next();let init=null;if(peek()==='='){next();init=assign();}out.push({n,init,type});}while(peek()===','&&next());eat(';');return{k:'decl',list:out};}
 function stmt(){const t=peek();
  if(t==='{'){next();const b=[];while(peek()!=='}')b.push(stmt());next();return{k:'block',b};}
  if(t==='if'){next();eat('(');const c=expr();eat(')');const a=stmt();let b=null;if(peek()==='else'){next();b=stmt();}return{k:'if',c,a,b};}
  if(t==='for'){next();eat('(');const init=TYPES.has(peek())?(next(),decl()):(()=>{const e=expr();eat(';');return{k:'ex',e};})();const c=expr();eat(';');const s=expr();eat(')');return{k:'for',init,c,s,body:stmt()};}
  if(t==='return'){next();if(peek()===';'){next();return{k:'ret',e:null};}const e=expr();eat(';');return{k:'ret',e};}
  if(QUAL.has(t)){next();return stmt();}
  if(TYPES.has(t)&&T[i+1]!=='('){next();return decl(t);}
  const e=expr();eat(';');return{k:'ex',e};}
 while(i<T.length){let t=next();
  if(t===';')continue;
  if(t==='uniform'||t==='attribute'||t==='varying'||t==='precision'){while(next()!==';');continue;}
  while(QUAL.has(t))t=next();
  const name=next();
  if(peek()==='('){next();const params=[];while(peek()!==')'){let q='in';while(QUAL.has(peek()))q=next();next();params.push({n:next(),q});if(peek()===',')next();}eat(')');
   if(peek()===';'){next();continue;}eat('{');const b=[];while(peek()!=='}')b.push(stmt());next();funcs[name]={params,b};}
  else{let init=null;if(peek()==='='){next();init=assign();}eat(';');globals.set(name,{init});}}
 // values: numbers or arrays; copy on store
 const cp=v=>Array.isArray(v)?v.slice():v,SW={x:0,y:1,z:2,w:3,r:0,g:1,b:2,a:3,s:0,t:1,p:2,q:3};
 const map2=(a,b,f)=>{if(Array.isArray(a)||Array.isArray(b)){const n=Array.isArray(a)?a.length:b.length;return Array.from({length:n},(_,k)=>f(Array.isArray(a)?a[k]:a,Array.isArray(b)?b[k]:b));}return f(a,b);};
 const ss=(e0,e1,x)=>{const t=Math.min(1,Math.max(0,(x-e0)/(e1-e0)));return t*t*(3-2*t);};
 const flat=args=>args.reduce((o,a)=>o.concat(a),[]);
 // componentwise over any mix of scalars and vectors (GLSL's genType rules)
 const comp=f=>(...a)=>{if(!a.some(Array.isArray))return f(...a);const n=Math.max(...a.map(v=>Array.isArray(v)?v.length:1));return Array.from({length:n},(_,k)=>f(...a.map(v=>Array.isArray(v)?v[k]:v)));};
 const BI={sin:comp(Math.sin),cos:comp(Math.cos),abs:comp(Math.abs),floor:comp(Math.floor),sqrt:comp(Math.sqrt),exp:comp(Math.exp),
  fract:comp(x=>x-Math.floor(x)),sign:comp(Math.sign),pow:comp(Math.pow),min:comp(Math.min),max:comp(Math.max),
  mod:comp((x,y)=>x-y*Math.floor(x/y)),clamp:comp((x,a,b)=>Math.min(Math.max(x,a),b)),mix:comp((a,b,t)=>a*(1-t)+b*t),
  step:comp((e,x)=>x<e?0:1),smoothstep:comp(ss),
  dot:(a,b)=>a.reduce((s,v,k)=>s+v*b[k],0),length:a=>Array.isArray(a)?Math.sqrt(a.reduce((s,v)=>s+v*v,0)):Math.abs(a),
  distance:(a,b)=>BI.length(map2(a,b,(p,q)=>p-q)),normalize:a=>{const l=BI.length(a);return a.map(v=>v/l);},
  cross:(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],
  float:a=>+a,int:a=>Math.trunc(a),vec2:(...a)=>{const f=flat(a);return f.length===1?[f[0],f[0]]:f.slice(0,2);},
  vec3:(...a)=>{const f=flat(a);return f.length===1?[f[0],f[0],f[0]]:f.slice(0,3);},vec4:(...a)=>{const f=flat(a);return f.length===1?[f[0],f[0],f[0],f[0]]:f.slice(0,4);}};
 const RET={};
 const look=(sc,n)=>{for(let s=sc;s;s=s.up)if(s.v.has(n))return s;return null;};
 function lval(e,sc){
  if(e.k==='id'){const s=look(sc,e.n)||gsc;return{get:()=>s.v.get(e.n),set:v=>s.v.set(e.n,cp(v))};}
  if(e.k==='sw'){const L=lval(e.a,sc),ix=[...e.s].map(c=>SW[c]);return{get:()=>{const v=L.get();return ix.length===1?v[ix[0]]:ix.map(k=>v[k]);},
   set:v=>{const o=cp(L.get());if(ix.length===1)o[ix[0]]=v;else ix.forEach((k,j)=>o[k]=v[j]);L.set(o);}};}
  if(e.k==='ix'){const L=lval(e.a,sc);return{get:()=>L.get()[ev(e.x,sc)],set:v=>{const o=cp(L.get());o[ev(e.x,sc)]=v;L.set(o);}};}
  throw new Error('glsl: not an lvalue');}
 const OPS={'+':(a,b)=>a+b,'-':(a,b)=>a-b,'*':(a,b)=>a*b,'/':(a,b)=>a/b};
 function ev(e,sc){switch(e.k){
  case'num':return e.v;
  case'id':{const s=look(sc,e.n);if(s)return cp(s.v.get(e.n));if(gsc.v.has(e.n))return cp(gsc.v.get(e.n));if(e.n in env)return cp(env[e.n]);throw new Error('glsl: unknown '+e.n);}
  case'un':{const a=ev(e.a,sc);return e.op==='-'?(Array.isArray(a)?a.map(x=>-x):-a):e.op==='!'?!a:a;}
  case'bin':{if(e.op==='&&')return ev(e.a,sc)&&ev(e.b,sc);if(e.op==='||')return ev(e.a,sc)||ev(e.b,sc);const a=ev(e.a,sc),b=ev(e.b,sc);
   switch(e.op){case'<':return a<b;case'>':return a>b;case'<=':return a<=b;case'>=':return a>=b;case'==':return a===b;case'!=':return a!==b;}return map2(a,b,OPS[e.op]);}
  case'tern':return ev(e.c,sc)?ev(e.a,sc):ev(e.b,sc);
  case'sw':{const v=ev(e.a,sc),ix=[...e.s].map(c=>SW[c]);return ix.length===1?v[ix[0]]:ix.map(k=>v[k]);}
  case'ix':return ev(e.a,sc)[ev(e.x,sc)];
  case'asg':{const L=lval(e.l,sc),r=ev(e.r,sc);L.set(e.op==='='?r:map2(L.get(),r,OPS[e.op[0]]));return L.get();}
  case'post':case'pre':{const L=lval(e.a,sc),o=L.get();L.set(o+(e.op==='++'?1:-1));return e.k==='post'?o:L.get();}
  case'call':{if(funcs[e.f]){const F=funcs[e.f],s={v:new Map(),up:null},outs=[];F.params.forEach((p,k)=>{s.v.set(p.n,cp(ev(e.args[k],sc)));if(p.q!=='in')outs.push([p.n,lval(e.args[k],sc)]);});
    let r;try{run(F.b,s);}catch(x){if(x!==RET)throw x;r=s.ret;}outs.forEach(([n,L])=>L.set(s.v.get(n)));return r;}
   const f=BI[e.f]||env[e.f];if(!f)throw new Error('glsl: unknown function '+e.f);return f(...e.args.map(a=>ev(a,sc)));}}
  throw new Error('glsl: bad node '+e.k);}
 function frame(sc){let s=sc;while(s.up)s=s.up;return s;}
 function run(list,sc){for(const st of list)exec(st,sc);}
 function exec(st,sc){switch(st.k){
  case'block':run(st.b,{v:new Map(),up:sc});return;
  case'decl':for(const d of st.list)sc.v.set(d.n,d.init?cp(ev(d.init,sc)):(d.type==='float'||d.type==='int'?0:null));return;
  case'if':if(ev(st.c,sc))exec(st.a,sc);else if(st.b)exec(st.b,sc);return;
  case'for':{const s={v:new Map(),up:sc};exec(st.init,s);for(let n=0;ev(st.c,s)&&n<1e6;n++){exec(st.body,{v:new Map(),up:s});ev(st.s,s);}return;}
  case'ret':{frame(sc).ret=st.e?ev(st.e,sc):undefined;throw RET;}
  case'ex':ev(st.e,sc);return;}}
 const gsc={v:new Map(),up:null};for(const [n,g] of globals)gsc.v.set(n,g.init?ev(g.init,gsc):null);
 return{call:(f,...args)=>ev({k:'call',f,args:args.map(a=>({k:'num',v:a,get _(){return a;}}))},gsc),funcs,
  run:(f,...args)=>{const F=funcs[f];if(!F)throw new Error('glsl: no function '+f);const s={v:new Map(),up:null};F.params.forEach((p,k)=>s.v.set(p.n,cp(args[k])));try{run(F.b,s);}catch(x){if(x!==RET)throw x;return s.ret;}}};}

// ---------------------------------------------------------------- the surfaces under test
const PW=A.PRESETS.waves,PER=PW.period;
const SEA=W.open({name:'roadstead',swell:'ringsea',field:.5});
const CALM=W.open({name:'calm',level:2,field:1,chop:1,bounds:[-100,-100,100,100]});
const PTS=[[0,0],[17.5,-40.25],[-2500,1800],[812.5,-333],[3100,2900],[-40.25,77],[16000.5,-9000]],TS=[0,7.3,123.4,599.9,1e5+.37];
// the GLSL the shaders get, run with the module clock at t (the atmos chunk is included as three.js resolves it)
const prog=(S,t,extra)=>glslProgram(A.waveGLSL()+'\n'+W.glsl(S),Object.assign({atmWaveT:A.waveWrap(t),atmWaveAmp:PW.amp,wtrLevel:S.levelAt(t),wtrBase:S.base,cameraPosition:[0,0,0]},extra||{}));

// ---- the clock: whole cycles, a seamless wrap
ok('every trochoid runs a whole number of cycles per period ('+SEA.waves.map(w=>w.n).join(', ')+' per '+PER+' s)',SEA.waves.every(w=>Number.isInteger(w.n)&&near(w.tc*PER,w.n,1e-9)),Number.isInteger(SEA.waves[0].n+.5));
ok('...each within 1.5% of its deep-water frequency sqrt(g k)',SEA.waves.every(w=>Math.abs(w.n*TAU/PER/Math.sqrt(9.81*w.k)-1)<.015),Math.abs(1.6/Math.sqrt(9.81*SEA.waves[0].k)-1)<.015);
ok('the open water at t equals it at t+period (the wrap cannot jump)',PTS.every(p=>near(SEA.heightAt(p[0],p[1],37.5),SEA.heightAt(p[0],p[1],37.5+PER),1e-9)&&near(SEA.heightAt(p[0],p[1],37.5),SEA.heightAt(p[0],p[1],37.5+PER*1000),1e-7)),
 PTS.every(p=>near(SEA.heightAt(p[0],p[1],37.5),SEA.heightAt(p[0],p[1],37.5+PER/2),1e-6)));

// ---- the inverse: heightAt lands on the surface the vertex shader draws
{let worst=0,negWorst=0;for(const p of PTS)for(const t of TS){const s=SEA.surfaceAt(p[0],p[1],t,0);worst=Math.max(worst,Math.abs(SEA.heightAt(s[0],s[2],t)-s[1]));negWorst=Math.max(negWorst,Math.abs(SEA.heightAt(p[0],p[1],t)-s[1]));}
 ok('heightAt(x,z) is the drawn height where a rest point lands (Newton; worst '+worst.toExponential(1)+' m)',worst<1e-7,negWorst<1e-3);}
{let peak=0;for(let t=0;t<PER;t+=3.7)for(const p of PTS)peak=Math.max(peak,Math.abs(SEA.heightAt(p[0],p[1],t)));const lim=SEA.waves.reduce((a,w)=>a+w.A,0)+.5*PW.amp*PW.gain.swell*(PW.groupMix.swell[0]+PW.groupMix.swell[1]);
 ok('the sea heaves within its amplitudes ('+peak.toFixed(2)+' of '+lim.toFixed(2)+' m)',peak<=lim&&peak>.3,peak<.01);}

// ---- THE TWIN EQUALS THE SHADER'S SUM (the chunk run by the interpreter)
for(const [S,lab] of [[SEA,'the roadstead (four trochoids, half the field)'],[CALM,'a bounded lake (the field alone, its chop displaced)']]){
 let wS=0,wF=0,wH=0,wN=0,wJ=0,wFo=0;
 for(const t of TS){const P=prog(S,t);for(const p of PTS){
  for(const sp of[0,.5,3,40]){const g=P.run('wtrSurface',[p[0],p[1]],sp),c=S.surfaceAt(p[0],p[1],t,sp);wS=Math.max(wS,Math.abs(g[0]-c[0]),Math.abs(g[1]-c[1]),Math.abs(g[2]-c[2]),Math.abs(g[3]-c[3]));}
  const c=S.surfaceAt(p[0],p[1],t,0);wH=Math.max(wH,Math.abs(P.run('wtrHeight',[c[0],c[2]])-S.heightAt(c[0],c[2],t)));
  for(const mpp of[0,.8,9]){const nj=P.run('wtrTroNJ',[p[0],p[1]],mpp,A.waveWrap(t)),cj=W.troNJ(S,p[0],p[1],t,mpp);wJ=Math.max(wJ,...nj.map((v,k)=>Math.abs(v-cj[k])));
   wFo=Math.max(wFo,Math.abs(P.run('wtrFoam',[p[0],p[1]],mpp,nj[3])-W.foamAt(S,p[0],p[1],t,mpp)));
   const q=S.surfaceAt(p[0],p[1],t,0),cd=230,n=P.run('wtrNormal',nj,[q[0],q[2]],cd,q[3]),cn=S.normalAt(q[0],q[2],t,cd,mpp);wN=Math.max(wN,...n.map((v,k)=>Math.abs(v-cn[k])));}}}
 ok(lab+': the vertex shader\'s wtrSurface equals surfaceAt, displacement faded by spacing too ('+wS.toExponential(1)+')',wS<1e-8,false);
 ok(lab+': the GLSL wtrHeight (3 Newton steps, the wakes) equals heightAt ('+wH.toExponential(1)+' m)',wH<1e-4,false);
 ok(lab+': the fragment\'s frame and Jacobian equal troNJ, faded by the pixel too ('+wJ.toExponential(1)+')',wJ<1e-9,false);
 ok(lab+': the fragment\'s decayed foam equals foamAt ('+wFo.toExponential(1)+')',wFo<1e-9,false);
 ok(lab+': the fragment\'s shading normal equals normalAt ('+wN.toExponential(1)+')',wN<1e-6,false);}
// the negatives of the above: the same comparisons against a chunk written from a broken sea must fail
{const BAD=W.open({name:'broken',swell:[[.28,70,18,0,.32],[.16,43,-34,1.7,.26],[.09,27,71,4.1,.18],[.06,17,-8,2.6,.14]],field:.5}),t=7.3,P=prog(BAD,t);
 const dS=Math.max(...PTS.map(p=>Math.abs(P.run('wtrSurface',[p[0],p[1]],0)[1]-SEA.surfaceAt(p[0],p[1],t,0)[1])));
 const dJ=Math.max(...PTS.map(p=>Math.abs(P.run('wtrTroNJ',[p[0],p[1]],0,A.waveWrap(t))[3]-W.troNJ(SEA,p[0],p[1],t,0)[3])));
 const P2=prog(SEA,t+1),dT=Math.max(...PTS.map(p=>Math.abs(P2.run('wtrSurface',[p[0],p[1]],0)[1]-SEA.surfaceAt(p[0],p[1],t,0)[1])));
 ok('negatives: one amplitude 1 cm and one steepness 0.02 off, or the clock 1 s off, and the chunk no longer matches the twin ('+dS.toFixed(4)+', '+dJ.toFixed(4)+', '+dT.toFixed(3)+' m)',dS>1e-4&&dJ>1e-5&&dT>1e-3,dS<1e-9);
 W.surfaces.pop();}
ok('the chunk reads the one clock (atmWaveT) and no other: no uRsTime, no unwrapped time',/atmWaveT/.test(W.glsl(SEA))&&!/uRsTime|uTime|TIME/.test(W.glsl(SEA)),/uRsTime/.test(W.glsl(SEA)));

// ---- the foam: whitecaps where the Jacobian falls, kept for the decay
{const F=W.PRESETS.foam;let caps=0,kept=0,n=0,hit=null;for(let i=0;i<20000;i++){const x=(i%200)*1.37,z=Math.floor(i/200)*1.91,t=40,J=W.troNJ(SEA,x,z,t,0)[3],f=W.foamAt(SEA,x,z,t,0);n++;
  if(J<F.j[1]){caps+=f>=W.cap(J)-1e-12&&f>0;if(!hit&&J<F.j[0]+.05)hit=[x,z];}else if(f>.02)kept++;}
 ok('foam: on every crest where J < '+F.j[1]+' ('+caps+' points), and kept where the crest has passed ('+kept+' of '+n+')',caps>0&&kept>0,kept===0);
 // a crest passing one water particle: its foam rises with the crest and fades over the decay after it
 const x=hit[0],z=hit[1];let t0=40;while(W.cap(W.troNJ(SEA,x,z,t0,0)[3])>.01)t0+=.05;
 const f1=W.foamAt(SEA,x,z,t0+.3,0),f2=W.foamAt(SEA,x,z,t0+1.2,0),c1=W.cap(W.troNJ(SEA,x,z,t0+.3,0)[3]);
 ok('...the crest gone, its foam fades ('+f1.toFixed(2)+' after 0.3 s, '+f2.toFixed(2)+' after 1.2 s)',c1<.01&&f1>.2&&f2<f1,f2>=f1);}

// ---- the bed: bytes, decode, the GLSL's lookup equal the twin's; the damping calms the shallows
{const beach=(x,z)=>-6+z*.05,LAKE=W.open({name:'beach',level:0,swell:'ringsea',field:.5,bounds:[-200,-200,200,300],bed:beach,bedCell:4}),B=LAKE.bed;
 let e=0;for(let z=-150;z<=100;z+=3.3){const d=W.bedDepth(B,13.7,z),tr=-beach(13.7,z);if(tr>-1.5&&tr<2.5)e=Math.max(e,Math.abs(d-tr));}
 ok('the bed\'s bytes give the depth within 3 cm where the waterline is ('+(e*100).toFixed(1)+' cm)',e<.03,Math.abs(W.bedDepth(B,13.7,0)-0)<.03&&Math.abs(W.bedDepth(B,13.7,0)-(-beach(13.7,0)))>.03);
 const tex=(s,uv)=>{const fx=uv[0]*B.nx-.5,fz=uv[1]*B.nz-.5,i0=Math.floor(fx),j0=Math.floor(fz),ax=fx-i0,az=fz-j0,C=(i,j,k)=>B.data[(Math.min(B.nz-1,Math.max(0,j))*B.nx+Math.min(B.nx-1,Math.max(0,i)))*4+k]/255;
  return[0,1,2,3].map(k=>(C(i0,j0,k)*(1-ax)+C(i0+1,j0,k)*ax)*(1-az)+(C(i0,j0+1,k)*(1-ax)+C(i0+1,j0+1,k)*ax)*az);};
 const t=21.1,P=prog(LAKE,t,{texture2D:tex,wtrBed:'bed'});let wd=0,ws=0,wh=0;
 for(let z=-180;z<=280;z+=7.7)for(const x of[-150,3.3,140]){wd=Math.max(wd,Math.abs(P.run('wtrDepth',[x,z])-LAKE.depthAt(x,z,t)));
  const g=P.run('wtrSurface',[x,z],0),c=LAKE.surfaceAt(x,z,t,0);ws=Math.max(ws,Math.abs(g[1]-c[1]),Math.abs(g[0]-c[0]));wh=Math.max(wh,Math.abs(P.run('wtrHeight',[c[0],c[2]])-LAKE.heightAt(c[0],c[2],t)));}
 const nd=Math.abs(P.run('wtrDepth',[3.3,10])-LAKE.depthAt(3.3,14,t));
 ok('with a bed: the GLSL depth, surface and height equal the twins ('+wd.toExponential(1)+', '+ws.toExponential(1)+', '+wh.toExponential(1)+' m)',wd<1e-9&&ws<1e-8&&wh<2e-3,nd<.1);
 let calm=0,open=0;for(let t2=0;t2<120;t2+=1.3){calm=Math.max(calm,Math.abs(LAKE.heightAt(3,120,t2)));open=Math.max(open,Math.abs(LAKE.heightAt(3,-150,t2)));}
 ok('the damping calms the water at the waterline (heave '+calm.toFixed(3)+' m there, '+open.toFixed(2)+' m out deep)',calm<.02&&open>.2,calm>open);
 W.surfaces.pop();}

// ---- the CDLOD selection: the nodes tile the ground, neighbours differ by one level, levels meet without a crack
const C=W.PRESETS.cdlod;
function cdlodCheck(cam,P){const out=new Float32Array(P.maxNodes*4),n=W.cdlod(cam,0,null,out,P),N=[];for(let k=0;k<n;k++)N.push([out[k*4],out[k*4+1],out[k*4+2],out[k*4+3]]);
 const root=P.leaf*Math.pow(2,P.levels-1),area=N.reduce((s,q)=>s+q[2]*q[2],0);let jump=0,crack=0,pairs=0;
 // the morphed vertices of node q on the line axis=c (0: x=c, 1: z=c) within [lo,hi] along the other axis: "pos|spacing" keys
 const edge=(q,axis,c,lo,hi)=>{const S=new Set();for(let u=0;u<=P.grid;u++){const g=axis===0?[(c-q[0])/q[2],u/P.grid]:[u/P.grid,(c-q[1])/q[2]],a=W.cdlodMorph(g,q,cam,0,P),along=axis===0?a[1]:a[0];
   if(along<lo-1e-6||along>hi+1e-6)continue;S.add(along.toFixed(5)+'|'+a[2].toFixed(5)+'|'+(axis===0?a[0]:a[1]).toFixed(5));}return S;};
 for(let i=0;i<N.length;i++)for(let j=i+1;j<N.length;j++){const q=N[i],r=N[j];
  for(const axis of[0,1]){const o=1-axis,c=q[axis]+q[2]===r[axis]?r[axis]:r[axis]+r[2]===q[axis]?q[axis]:null;if(c==null)continue;
   const lo=Math.max(q[o],r[o]),hi=Math.min(q[o]+q[2],r[o]+r[2]);if(hi-lo<=1e-9)continue;pairs++;jump=Math.max(jump,Math.abs(q[3]-r[3]));
   const A1=edge(q,axis,c,lo,hi),B1=edge(r,axis,c,lo,hi);if(A1.size!==B1.size||[...A1].some(k=>!B1.has(k)))crack++;}}
 return{n,area,root,jump,crack,pairs,leafAtCam:N.some(q=>q[3]===0&&cam[0]>=q[0]&&cam[0]<=q[0]+q[2]&&cam[2]>=q[1]&&cam[2]<=q[1]+q[2])};}
for(const cam of[[3.3,2.2,-7.1],[1234.5,40,-777.7],[20000.25,1.7,9.9]]){const r=cdlodCheck(cam,C);
 ok('CDLOD at ('+cam.join(', ')+'): '+r.n+' nodes tile the root exactly, a leaf under a low camera, '+r.pairs+' neighbour pairs one level apart at most, no crack where levels meet',
  near(r.area,r.root*r.root,1e-3)&&(r.leafAtCam||cam[1]>C.range*C.leaf)&&r.jump<=1&&r.crack===0&&r.n<C.maxNodes,r.n===0);}
{const r=cdlodCheck([3.3,2.2,-7.1],Object.assign({},C,{range:2.6,morph:.85}));
 ok('...and with the range too short for the morph (2.6 node sizes) the same check finds cracks ('+r.crack+')',r.crack>0||r.jump>1,false);}
{const out=new Float32Array(C.maxNodes*4),cam=[0,3,0],all=W.cdlod(cam,0,null,out),half=W.cdlod(cam,0,(x0,z0,s)=>x0+s>0,out);
 ok('a view test drops whole subtrees ('+all+' nodes, '+half+' east of the camera)',half<all*.7&&half>0,half===all);}
{const out=new Float32Array(C.maxNodes*4),lo=W.cdlod([0,2,0],0,null,out),hi=W.cdlod([0,800,0],0,null,out);
 ok('a high camera takes coarser nodes ('+lo+' at 2 m, '+hi+' at 800 m)',hi<lo,hi>=lo);}

// ---- riding: a hull on the twin
{const D={L:40,B:8},r=W.rideAt(D.L,D.B,10,20,.3,7.3,0,(x,z,t)=>SEA.heightAt(x,z,t)),c=Math.cos(.3),s=Math.sin(.3),H=(f,q)=>SEA.heightAt(10+c*f+s*q,20-s*f+c*q,7.3);
 const y=(2*H(0,0)+H(14.4,0)+H(-14.4,0)+H(0,2.24)+H(0,-2.24))/6;
 ok('ride: heave is the mean of five samples on the twin, pitch and roll their slopes',near(r.y,y,1e-12)&&near(r.rz,Math.atan2(H(14.4,0)-H(-14.4,0),28.8),1e-12)&&r.ry===.3,near(r.y,H(0,0),1e-6));
 const f=W.rideAt(D.L,D.B,10,20,0,0,0,()=>1.25);ok('ride on still water: level, upright',f.y===1.25&&f.rx===0&&f.rz===0,f.y!==1.25);
 const G={position:{set(x,y,z){this.v=[x,y,z];}},rotation:{set(x,y,z,o){this.v=[x,y,z,o];}}};W.ride(G,D,10,20,.3,7.3,0,(x,z,t)=>SEA.heightAt(x,z,t));
 ok('ride poses any object with position.set and rotation.set (YXZ)',G.position.v[1]===r.y&&G.rotation.v[3]==='YXZ',G.rotation.v[3]!=='YXZ');}

// ---- the queries over every kind
{const R=W.flow({name:'brook',pts:[[0,0,10],[100,0,8],[100,100,7]],width:8,speed:[2,3,1]}),P=W.still({name:'pool',level:4,bounds:[40,-20,60,20]}),
  F=W.fall({name:'drop',lip:[[0,0,10],[0,6,10]],dir:[1,0],speed:2,drop:5}),SH=W.shore({name:'beach',of:SEA,band:100});
 const v=W.flowAt(50,1.5);ok('flowAt: the current runs along the nearest segment ('+v.slice(0,3).map(x=>x.toFixed(2)).join(', ')+'), none off the water',near(v[0],2.5,1e-9)&&near(v[1],0)&&W.flowAt(50,30)[2]===0,near(v[0],0));
 ok('heightAt over the kinds: the pool inside the brook\'s reach, the brook\'s line, the sea elsewhere',W.heightAt(50,0,0)===4&&near(W.heightAt(100,50,0),7.5,1e-9)&&near(W.heightAt(500,500,3),SEA.heightAt(500,500,3),1e-12),W.heightAt(50,0,0)===9);
 ok('the bounded lake wins inside its box, the sea outside it',near(W.heightAt(0,-50,3),CALM.heightAt(0,-50,3),1e-12)&&near(W.heightAt(0,-150,3),SEA.heightAt(0,-150,3),1e-12),near(W.heightAt(0,-50,3),SEA.heightAt(0,-50,3),1e-12));
 const top=F.curtainAt(.5,0),bot=F.curtainAt(.5,1);ok('a fall arcs: it leaves the lip level and lands drop metres down, carried out by its speed',near(top[1],10)&&near(bot[1],5,1e-9)&&bot[0]>top[0]+1&&near(top[2],3),near(bot[0],top[0]));
 ok('the shore band reads its sea',SH.heightAt(9,9,2)===SEA.heightAt(9,9,2),SH.heightAt(9,9,2)===SEA.heightAt(9,9,3));
 W.tide({amp:.5,period:44712,phase:0});ok('seaLevel(t) follows the tide (half a metre, twice a day) and the sea rides it',near(W.seaLevel(44712/4),.5,1e-12)&&near(SEA.heightAt(5,5,44712/4)-SEA.heightAt(5,5,44712/4+PER*0),.0,1e-12)&&near(SEA.levelAt(44712/4),.5,1e-12),near(W.seaLevel(44712/4),0,1e-12));W.tide(null);
 const X=W.export();ok('export: every surface as plain data',JSON.parse(JSON.stringify(X)).surfaces.length===W.surfaces.length&&X.surfaces.some(s=>s.kind==='flow'&&s.pts.length===3),X.surfaces.some(s=>typeof s.heightAt==='function'));}

// ================================================================ PHASE 2: the shore (21-core-water-shore.js)
// a texture2D over a grid's bytes, as the GPU filters it (bilinear over texel centres, clamped)
const texOf=G=>(s,uv)=>{const fx=uv[0]*G.nx-.5,fz=uv[1]*G.nz-.5,i0=Math.floor(fx),j0=Math.floor(fz),ax=fx-i0,az=fz-j0,C=(i,j,k)=>G.data[(Math.min(G.nz-1,Math.max(0,j))*G.nx+Math.min(G.nx-1,Math.max(0,i)))*4+k]/255;
 return[0,1,2,3].map(k=>(C(i0,j0,k)*(1-ax)+C(i0+1,j0,k)*ax)*(1-az)+(C(i0,j0+1,k)*(1-ax)+C(i0+1,j0+1,k)*ax)*az);};
// ---- the distance transform is exact: against brute force on a random grid
{let seed=7;const rnd=()=>{seed=(seed*1103515245+12345)>>>0;return seed/4294967296;};const nx=37,nz=23,src=new Uint8Array(nx*nz);for(let k=0;k<src.length;k++)src[k]=rnd()<.06?1:0;
 const d=W.edt(src,nx,nz);let worst=0;for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){let b=Infinity;for(let q=0;q<nz;q++)for(let r=0;r<nx;r++)if(src[q*nx+r])b=Math.min(b,(r-i)*(r-i)+(q-j)*(q-j));worst=Math.max(worst,Math.abs(b-d[j*nx+i]));}
 const s2=src.slice();s2[0]=1-s2[0];const d2=W.edt(s2,nx,nz);
 ok('the squared distance transform equals brute force on a 37 x 23 grid (worst '+worst+' cells^2)',worst===0,d2.every((v,k)=>v===d[k]));}
// ---- a lake in a basin, and a LOWER hollow beside it in the same box: the flood keeps the lake out of the hollow
// the ground: a bowl at (0,0) whose floor is 4 m (the lake at 10 m), a ridge to 16 m, and a hollow at (150,0) down to 2 m
const ground=(x,z)=>{const a=Math.hypot(x,z),b=Math.hypot(x-150,z);return Math.min(4+a*a/900,16,2+b*b/400)+ (b<75&&a>90?0:0);};
const LAKE=W.open({name:'tarn',level:10,swell:[[.12,24,20,0,.12],[.07,15,-40,1.1,.08]],field:.5,bounds:[-120,-90,220,90],bed:ground,bedBox:[-120,-90,220,90],bedCell:2,
 shore:{seeds:[[0,0]],band:40}});
{const G=LAKE.bed;ok('the shore grid floods the basin from its seed: '+G.wetCells+' wet cells of '+G.nx*G.nz,LAKE.wetAt(0,0)&&LAKE.wetAt(60,0)&&G.wetCells>3000,!LAKE.wetAt(0,0));
 const hollowBelow=ground(150,0)<10;
 ok('NO LOWER HOLLOW FLOODS: the hollow at (150, 0) is '+(10-ground(150,0)).toFixed(1)+' m under the lake\'s level and the surface is not there (contains false, shore distance '+LAKE.shoreDist(150,0).toFixed(1)+' m)',
  hollowBelow&&!LAKE.wetAt(150,0)&&!LAKE.contains(150,0)&&LAKE.contains(0,0),LAKE.wetAt(150,0));
 const ALL=W.open({name:'unseeded',level:10,bounds:[-120,-90,220,90],bed:ground,bedBox:[-120,-90,220,90],bedCell:2,shore:{seeds:null,band:40}});
 ok('...negative: with no seeds every cell under the level is wet, the hollow too',ALL.wetAt(150,0)&&ALL.contains(150,0),!ALL.wetAt(150,0));W.surfaces.pop();
 // the signed distance: + on the water growing out from the shore, - inland
 const r0=Math.sqrt(900*6);   // the bowl's shoreline radius (4 + r^2/900 = 10)
 ok('the shore distance is signed metres from the shoreline (r '+r0.toFixed(1)+' m): '+LAKE.shoreDist(r0-20,0).toFixed(1)+' at 20 m out on the water, '+LAKE.shoreDist(r0+12,0).toFixed(1)+' at 12 m inland',
  Math.abs(LAKE.shoreDist(r0-20,0)-20)<2.5&&Math.abs(LAKE.shoreDist(r0+12,0)+12)<2.5&&Math.abs(LAKE.shoreDist(0,r0-5)-5)<2.5,LAKE.shoreDist(r0+12,0)>0);}
// ---- the GLSL equals the twins on the shore surface (the grid's bytes through the texture)
{const P=t=>prog(LAKE,t,{texture2D:texOf(LAKE.bed),wtrBed:'bed'});const ts=[3.3,77.7,1e5+.1];let wS=0,wH=0,wN=0,wD=0,wF=0,wG=0,wW=0,nWet=0,nDry=0,sameWet=0;
 for(const t of ts){const G=P(t);for(let x=-110;x<=210;x+=13.7)for(let z=-80;z<=80;z+=17.1){
  const g=G.run('wtrSurface',[x,z],0),c=LAKE.surfaceAt(x,z,t,0);wS=Math.max(wS,Math.abs(g[0]-c[0]),Math.abs(g[1]-c[1]),Math.abs(g[2]-c[2]),Math.abs(g[3]-c[3]));
  wD=Math.max(wD,Math.abs(G.run('wtrShoreDist',[x,z])-LAKE.shoreDist(x,z)));
  const w=G.run('wtrWet',[x,z]);sameWet+=(!!w)===LAKE.wetAt(x,z);if(w)nWet++;else nDry++;
  wF=Math.max(wF,Math.abs(G.run('wtrSurfFoam',[x,z])-LAKE.surfFoamAt(x,z,t)));
  const gy=ground(x,z),wg=G.run('wtrWetGround',[x,z],gy),cg=LAKE.wetGroundAt(x,z,gy,t);wG=Math.max(wG,Math.abs(wg[0]-cg[0]),Math.abs(wg[1]-cg[1]));
  if(LAKE.wetAt(x,z)){wH=Math.max(wH,Math.abs(G.run('wtrHeight',[c[0],c[2]])-LAKE.heightAt(c[0],c[2],t)));
   const nj=G.run('wtrTroNJ',[x,z],.05,A.waveWrap(t)),n=G.run('wtrNormal',nj,[c[0],c[2]],80,c[3]),cn=LAKE.normalAt(c[0],c[2],t,80,.05);wN=Math.max(wN,...n.map((v,k)=>Math.abs(v-cn[k])));}}}
 ok('shore: the vertex shader\'s surface (breakers and shoaling in) equals surfaceAt ('+wS.toExponential(1)+'), wtrHeight heightAt ('+wH.toExponential(1)+' m), the normal normalAt ('+wN.toExponential(1)+')',wS<1e-8&&wH<2e-3&&wN<1e-6,false);
 ok('shore: the fragment\'s shore distance, wet test, breaker foam and the beach\'s wetness equal their twins ('+wD.toExponential(1)+', '+sameWet+' of '+(nWet+nDry)+' wet tests agree, '+wF.toExponential(1)+', '+wG.toExponential(1)+')',
  wD<1e-9&&sameWet===nWet+nDry&&nWet>20&&nDry>20&&wF<1e-9&&wG<1e-9,false);
 const G1=P(3.3+1);let dT=0;for(let x=10;x<=60;x+=7)dT=Math.max(dT,Math.abs(G1.run('wtrSurf',[x,3])-LAKE.surfAt(x,3,3.3)));
 ok('...negative: the clock 1 s off moves the breakers by up to '+dT.toFixed(3)+' m',dT>1e-3,false);}
// ---- shoaling, the breakers, the beach
{const Q=W.PRESETS.shore;ok('Green\'s law: the waves grow toward the shore ('+W.shoalK(20).toFixed(2)+' at 20 m deep, '+W.shoalK(3).toFixed(2)+' at 3 m, capped at '+Q.shoal.max+')',
  W.shoalK(20)===1&&W.shoalK(3)>1.3&&W.shoalK(.1)===Q.shoal.max,W.shoalK(3)<=1);
 // a crest moves shoreward: track the phase's zero along the shore distance over a second
 const d0=20,t0=11,a0=W.surfPhase(d0,t0),dt=.5,dn=d0-Q.surf.lambda*W.surfCycles()/W.period()*dt;
 ok('the breakers run in: a crest at '+d0+' m from the shore is at '+dn.toFixed(2)+' m half a second later (the phase holds)',Math.abs(W.fr((W.surfPhase(dn,t0+dt)-a0)/(2*Math.PI)+.5)-.5)<1e-9,dn>=d0);
 const sea=[],near=[];for(let t=0;t<30;t+=.37){sea.push(Math.abs(LAKE.surfAt(LAKE.bed.x0+5,0,t)));near.push(Math.abs(LAKE.surfAt(-Math.sqrt(900*6)+6,0,t)));}
 const r0=Math.sqrt(900*6),mid=[];for(let t=0;t<30;t+=.37)mid.push(Math.abs(LAKE.surfAt(-r0+14,0,t)));
 ok('...born in the band, highest in the breaking depths, gone at the waterline ('+Math.max(...mid).toFixed(2)+' m at 14 m out, '+Math.max(...near).toFixed(2)+' m at 6 m)',
  Math.max(...mid)>.15&&Math.max(...mid)>Math.max(...near)&&LAKE.surfAt(-r0+.2,0,5)<.05,Math.max(...mid)<.01);
 const yg=10.3,w1=LAKE.wetGroundAt(r0+2,0,yg,4),w2=LAKE.wetGroundAt(r0+2,0,13,4),w3=LAKE.wetGroundAt(r0+60,0,10.3,4);
 let film=0,dryf=0;for(let t=0;t<9;t+=.1){const f=LAKE.wetGroundAt(r0+2,0,10.4,t)[1];film=Math.max(film,f);dryf=Math.max(dryf,LAKE.wetGroundAt(r0+2,0,11.15,t)[1]);}
 ok('the beach: wet sand '+w1[0].toFixed(2)+' a 0.3 m step above the water, dry 3 m up ('+w2[0]+') and 60 m inland ('+w3[0]+'); the swash\'s film comes and goes ('+film.toFixed(2)+' at 0.4 m, '+dryf.toFixed(2)+' above the runup)',
  w1[0]>.9&&w2[0]===0&&w3[0]===0&&film>.9&&dryf===0,w2[0]>0);}
// ---- the CDLOD selection drops what the flood never reached
{const out=new Float32Array(C.maxNodes*4),cam=[60,30,0],U2={wtrLevel:{value:10}};let all=0,wetN=0;
 const inB=(x0,z0,s)=>!(x0>220||z0>90||x0+s<-120||z0+s<-90);
 all=W.cdlod(cam,10,inB,out);wetN=W.cdlod(cam,10,(x0,z0,s)=>inB(x0,z0,s)&&LAKE.wetIn(x0,z0,x0+s,z0+s),out);
 let hollowNode=false;for(let k=0;k<wetN;k++){const x0=out[k*4],z0=out[k*4+1],s2=out[k*4+2];if(x0<=150&&x0+s2>=150&&z0<=0&&z0+s2>=0&&s2<=16)hollowNode=true;}
 ok('the mesh drops nodes the water never reaches ('+all+' in the box, '+wetN+' over wet cells; none small over the hollow)',wetN<all&&!hollowNode,wetN===all);
 void U2;}
// ---- the land from core/mask and the ground from a KFIELD
{const M=KMASK.canvas(64,64),cx=M.getContext('2d');cx.fillStyle='#ffffff';cx.fillRect(30,0,4,64);   // a wall of land down the middle (a dike)
 const F=KFIELD.bake((x,z)=>0,[-64,-64,64,64],4),flat=W.shoreGrid({ground:F,level:1,box:[-64,-64,64,64],cell:2,seeds:[[-40,0]],land:W.maskLand(M,(x,z)=>[(x+64)/2,(z+64)/2])});
 const at=(G,x,z)=>G.wet[Math.floor((z-G.z0)/G.cell)*G.nx+Math.floor((x-G.x0)/G.cell)];
 const open2=W.shoreGrid({ground:F,level:1,box:[-64,-64,64,64],cell:2,seeds:[[-40,0]]});
 ok('a core/mask raster marks land: the dike holds the flood west of it ('+flat.wetCells+' wet cells), a KFIELD gives the ground',at(flat,-40,0)&&!at(flat,40,0)&&!at(flat,1,0),!at(open2,40,0));}

// ---- a MASK and a moving shore WINDOW (a sea or a lake at 1:1: little-demo)
{// two basins, each under the level: the mask lets the surface into the west one only (as a world's coarse water raster
 // would); the window follows a camera, re-baked whole or a slice at a time, to the same bytes as a grid baked there
 const ground2=(x,z)=>Math.min(2+Math.hypot(x+300,z)**2/2000,30,1+Math.hypot(x-300,z)**2/2000);
 const md=new Uint8Array(12*6);for(let j=0;j<6;j++)for(let i=0;i<12;i++)md[j*12+i]=i<6?255:0;
 const SEA2=W.open({name:'masked sea',level:10,field:.5,swell:[[.1,20,10,0,.1]],bounds:[-600,-150,600,150],bed:ground2,mask:{x0:-600,z0:-150,cell:100,nx:12,nz:6,data:md},
  shore:{window:400,cell:4,seeds:(x,z)=>W.maskSample({x0:-600,z0:-150,cell:100,nx:12,nz:6,data:md},x,z)>.5,band:40}});
 ok('a window surface starts as open water (no grid yet: deep, far from shore, drawable)',SEA2.bed.blank&&SEA2.depthAt(-300,0,0)>30&&SEA2.wetAt(300,0),!SEA2.bed.blank);
 ok('the mask keeps the surface to its own basin: contains in the west ('+SEA2.contains(-300,0)+'), not in the east basin as deep under the level ('+SEA2.contains(300,0)+')',
  SEA2.contains(-300,0)&&!SEA2.contains(300,0)&&ground2(300,0)<10,SEA2.contains(300,0));
 W.moveShore(SEA2,-250,10);const B1=SEA2.bed,ref=W.shoreGrid({ground:ground2,level:10,box:W.shoreBox(SEA2,-250,10),cell:4,seeds:SEA2.shoreWin.seeds,band:40});
 const job=W.shoreJob(SEA2,-250,10);let steps=0;while(!job.step(0))steps++;const B2=SEA2.bed;
 ok('the window bakes where the camera is ('+B1.nx+' x '+B1.nz+' cells at '+B1.cell+' m), whole or in '+(steps+1)+' slices, to the bytes of a grid baked there',
  B1.data.every((v,k)=>v===ref.data[k])&&B2.data.every((v,k)=>v===ref.data[k])&&steps>2&&B1.x0===ref.x0,B1.blank);
 const shore0=Math.sqrt(2000*8)-300;   // the west basin's shoreline at z = 0 on its east side (2 + r^2/2000 = 10)
 ok('...and now the shore is real: '+SEA2.shoreDist(shore0-20,0).toFixed(1)+' m out on the water 20 m from it, the waves shoal and break',
  Math.abs(SEA2.shoreDist(shore0-20,0)-20)<4&&SEA2.depthAt(shore0-20,0,0)<3,false);
 // the GLSL: the window's box from its uniform, the mask from its texture
 const Mt={x0:-600,z0:-150,cell:100,nx:12,nz:6,data:md},mtex=(s,uv)=>{const fx=uv[0]*12-.5,fz=uv[1]*6-.5,i0=Math.floor(fx),j0=Math.floor(fz),ax=fx-i0,az=fz-j0,C=(i,j)=>md[Math.min(5,Math.max(0,j))*12+Math.min(11,Math.max(0,i))]/255;
  const v=(C(i0,j0)*(1-ax)+C(i0+1,j0)*ax)*(1-az)+(C(i0,j0+1)*(1-ax)+C(i0+1,j0+1)*ax)*az;return[v,0,0,1];};
 const bt=texOf(SEA2.bed),tx=(s,uv)=>s==='mask'?mtex(s,uv):bt(s,uv),G=SEA2.bed;
 const Pg=prog(SEA2,5.5,{texture2D:tx,wtrBed:'bed',wtrMask:'mask',wtrBedBox:[G.x0,G.z0,1/(G.cell*G.nx),1/(G.cell*G.nz)]});
 let wd=0,ws=0,agree=0,n=0;for(let x=-590;x<590;x+=23.3)for(let z=-140;z<140;z+=31.7){n++;
  agree+=(!!Pg.run('wtrMaskOk',[x,z]))===(W.maskSample(Mt,x,z)>.5);wd=Math.max(wd,Math.abs(Pg.run('wtrShoreDist',[x,z])-SEA2.shoreDist(x,z)));
  const g=Pg.run('wtrSurface',[x,z],0),c=SEA2.surfaceAt(x,z,5.5,0);ws=Math.max(ws,Math.abs(g[1]-c[1]));}
 const Pbad=prog(SEA2,5.5,{texture2D:tx,wtrBed:'bed',wtrMask:'mask',wtrBedBox:[G.x0+40,G.z0,1/(G.cell*G.nx),1/(G.cell*G.nz)]}),dbad=Math.abs(Pbad.run('wtrShoreDist',[shore0-20,0])-SEA2.shoreDist(shore0-20,0));
 ok('the GLSL reads the window from its uniform box and the mask from its texture as the twins do ('+agree+' of '+n+' mask tests agree, distance '+wd.toExponential(1)+', surface '+ws.toExponential(1)+' m); negative: the box 40 m off moves the distance '+dbad.toFixed(1)+' m',
  agree===n&&wd<1e-9&&ws<1e-8&&dbad>5,false);
 const out=new Float32Array(C.maxNodes*4),cam=[0,40,0],inB=(x0,z0,s)=>!(x0>600||z0>150||x0+s<-600||z0+s<-150);
 const all=W.cdlod(cam,10,inB,out),own=W.cdlod(cam,10,(x0,z0,s)=>inB(x0,z0,s)&&SEA2.maskIn(x0,z0,x0+s,z0+s),out);let east=0;
 for(let k=0;k<own;k++)if(out[k*4]>=0)east++;
 ok('the CDLOD selection keeps to the mask ('+all+' nodes in the box, '+own+' over the mask, '+east+' wholly east of it)',own<all&&east===0,own===all);
 W.surfaces.splice(W.surfaces.indexOf(SEA2),1);}
// ================================================================ PHASE 3: flow and falls (22-core-water-flow.js, 51-core-water-kinds.js)
const GP=(text,t,extra)=>glslProgram(A.waveGLSL()+'\n'+text,Object.assign({atmWaveT:A.waveWrap(t),atmWaveAmp:PW.amp,cameraPosition:[0,0,0]},extra||{}));
{// a river from KRELIEF.river-shaped points: down a valley, round a bend, over a riffle
 const pts=[];for(let i=0;i<=30;i++){const s=i*20,x=s,z=60*Math.sin(s/140);pts.push({x,z,y:40-s*.012-(i>14&&i<18?(i-14)*1.2:i>=18?3.6:0)});}
 for(let i=1;i<pts.length;i++)pts[i].y=Math.min(pts[i].y,pts[i-1].y);
 const R=W.flow({name:'test river',river:pts,width:18,speed:1.6}),RB=W.ribbon(R,{step:6,across:6,margin:1.5});
 let climb=0,off=0;const N1=RB.across+1;for(let r=0;r<RB.rows;r++){const y=RB.pos[r*N1*3+1];if(r>0)climb=Math.max(climb,y-RB.pos[(r-1)*N1*3+1]);
  const k=r*N1+RB.across/2;off=Math.max(off,Math.abs(R.heightAt(RB.pos[k*3],RB.pos[k*3+2])-RB.pos[k*3+1]));}
 const rowsAtVerts=pts.every(p=>{for(let r=0;r<RB.rows;r++){const k=r*N1+RB.across/2;if(Math.hypot(RB.pos[k*3]-p.x,RB.pos[k*3+2]-p.z)<1e-9&&Math.abs(RB.pos[k*3+1]-p.y)<1e-12)return true;}return false;});
 ok('the ribbon: '+RB.rows+' rows, one at every vertex of the line, its surface never climbs downstream ('+climb+'), the centre row on the twin\'s height ('+off.toExponential(1)+' m)',
  rowsAtVerts&&climb<=0&&off<1e-9&&RB.rows>=pts.length,climb>0);
 let down=0;for(let i=0;i<RB.idx.length;i+=3){const a=RB.idx[i]*3,b=RB.idx[i+1]*3,c=RB.idx[i+2]*3,ny=(RB.pos[b+2]-RB.pos[a+2])*(RB.pos[c]-RB.pos[a])-(RB.pos[b]-RB.pos[a])*(RB.pos[c+2]-RB.pos[a+2]);if(!(ny>0))down++;}
 ok('...every one of its '+RB.idx.length/3+' triangles faces up ('+down+' do not)',down===0,RB.idx.length===0);
 // the banks: distance 0 at the channel's edge, -margin at the ribbon's; the cross-section keeps its width round the bend
 const b0=RB.bank[0],bE=RB.bank[RB.across],bm=RB.bank[1];let wErr=0;
 for(let r=1;r<RB.rows-1;r++){const a=r*N1,c=a+RB.across,k=a+RB.across/2,i=pts.findIndex(p=>Math.hypot(p.x-RB.pos[k*3],p.z-RB.pos[k*3+2])<1e-9);if(i<1)continue;
  const ex=pts[i].x-pts[i-1].x,ez=pts[i].z-pts[i-1].z,L=Math.hypot(ex,ez),nx=-ez/L,nz=ex/L,q=(RB.pos[c*3]-RB.pos[k*3])*nx+(RB.pos[c*3+2]-RB.pos[k*3+2])*nz;wErr=Math.max(wErr,Math.abs(Math.abs(q)-(9+1.5)));}
 ok('...the banks: '+b0+' m at the ribbon\'s edge, '+bm.toFixed(2)+' a step in; at each bend the section is 10.5 m from the line square to the segment it leaves ('+wErr.toExponential(1)+')',b0===-1.5&&bE===-1.5&&Math.abs(bm-(9-10.5*2/3))<1e-9&&wErr<1e-9,b0===0);
 // the advected ripples: the GLSL equals the twin; the pattern moves with the current
 let wN=0,wF=0;for(const t of[2.2,333.3,1e5+.7]){const P=GP(W.flowGLSL(),t);for(const p of[[10,3],[200,40],[431.5,-12.25]])for(const v of[[1.6,0],[.3,-1.1],[0,0]])for(const sl of[0,.03,.2]){
   const g=P.run('wtrFlowN',p,v,sl),c=W.flowNormal(p[0],p[1],v[0],v[1],sl,t);wN=Math.max(wN,...g.map((q,k)=>Math.abs(q-c[k])));
   for(const bk of[-1,.4,5])wF=Math.max(wF,Math.abs(P.run('wtrFlowFoam',sl,bk)-W.flowFoam(sl,bk)));}}
 const Pb=GP(W.flowGLSL(),3.2),dT=Math.abs(Pb.run('wtrFlowN',[10,3],[1.6,0],0)[0]-W.flowNormal(10,3,1.6,0,0,2.2)[0]);
 ok('flow: the fragment\'s advected normal and foam equal the twins ('+wN.toExponential(1)+', '+wF.toExponential(1)+'); negative: one second late differs by '+dT.toFixed(4),wN<1e-9&&wF<1e-12&&dT>1e-4,false);
 const v=[2.5,.8],t0=40,dt=.05,mv=[],st=[];for(const p of[[3,7],[51,-2],[120,33]]){const a=W.flowNormal(p[0],p[1],v[0],v[1],0,t0),b=W.flowNormal(p[0]+v[0]*dt,p[1]+v[1]*dt,v[0],v[1],0,t0+dt),c=W.flowNormal(p[0],p[1],v[0],v[1],0,t0+dt);
  mv.push(Math.hypot(a[0]-b[0],a[2]-b[2]));st.push(Math.hypot(a[0]-c[0],a[2]-c[2]));}
 ok('the ripples ride the current: a point carried '+(Math.hypot(...v)*dt).toFixed(3)+' m downstream keeps its normal ('+Math.max(...mv).toFixed(4)+') where one held still loses it ('+Math.max(...st).toFixed(4)+')',Math.max(...mv)<Math.max(...st)*.25,Math.max(...mv)>=Math.max(...st));
 ok('white water: rapids where the bed steepens ('+W.flowFoam(.1,5).toFixed(2)+' at 10%, '+W.flowFoam(0,5)+' on the flat), edge foam on the bank ('+W.flowFoam(0,0).toFixed(2)+')',W.flowFoam(.1,5)>.7&&W.flowFoam(0,5)===0&&W.flowFoam(0,0)>.4,W.flowFoam(0,5)>0);
 // the slope breaks: the riffle is not a fall; a 12 m step is
 const st2=[];for(let i=0;i<=10;i++)st2.push([i*10,0,i===5?50:i>5?38:50]);st2[5][2]=50;const FL=W.flow({name:'stepped',pts:st2,width:8,speed:2}),FS=W.fallsOf(FL,{minDrop:3}),FR=W.fallsOf(R,{minDrop:3});
 ok('fallsOf finds the 12 m step as one fall (drop '+(FS[0]&&FS[0].drop)+' m, lip across the 8 m channel) and no fall on the riffle ('+FR.length+')',FS.length===1&&FS[0].drop===12&&Math.abs(Math.hypot(FS[0].lip[0][0]-FS[0].lip[1][0],FS[0].lip[0][1]-FS[0].lip[1][1])-8)<1e-9&&FR.length===0,FS.length===0);
 W.surfaces.splice(W.surfaces.indexOf(FL),1);}
{// a fall: the curtain arcs, widens, faces out; the streaks fall with the water; the plunge pool churns
 const F=W.fall({name:'test fall',lip:[[100,-10,60],[100,10,60]],dir:[1,0],speed:3,drop:45}),M=W.curtain(F,{rows:20,cols:4});
 const top=M.pos.slice(0,3),bot=M.pos.slice(20*5*3,20*5*3+3),last=M.pos.slice(-3),mid=M.pos.slice(10*5*3,10*5*3+3);
 const arc=bot[0]-100,half=mid[0]-100;
 ok('the curtain leaves the lip at its height and lands '+F.drop+' m down, '+arc.toFixed(2)+' m out (a parabola: '+half.toFixed(2)+' m out at half the time)',
  Math.abs(top[1]-60)<1e-12&&Math.abs(bot[1]-15)<1e-9&&Math.abs(arc-3*F.tFall)<1e-9&&Math.abs(half-arc/2)<1e-9&&Math.abs(mid[1]-(60-45/4))<1e-9,Math.abs(mid[1]-(60-45/2))<1e-9);
 const wTop=Math.abs(M.pos[4*3+2]-M.pos[2]),wBot=Math.abs(last[2]-bot[2]),nOut=M.nrm.every((v,i)=>i%3===0?(i<15?Math.abs(v)<1e-12:v>0):i%3===1?v>0:true);
 ok('...it widens toward the foot ('+wTop+' m at the lip, '+wBot.toFixed(1)+' m at the foot) and every normal faces up and the way the water goes (straight up on the lip)',wTop===20&&wBot>wTop+1&&nOut,wBot<=wTop);
 let wS=0,wP=0;for(const t of[1.1,250.25,1e5+.3]){const P=GP(W.fallGLSL(F),t);for(const u of[0,.31,.77])for(const fl of[0,.2,.93]){wS=Math.max(wS,Math.abs(P.run('wtrStreak',u,fl)-W.fallStreak(u,fl,t,F)));
   wS=Math.max(wS,Math.abs(P.run('wtrFallFoam',fl,.6)-W.fallFoam(fl,.6)));}
  for(const p of[[103,0],[110,4],[130,-20]]){const g=P.run('wtrPlunge',p),c=W.plungeAt(F,p[0],p[1],t);wP=Math.max(wP,Math.abs(g[0]-c[0]),Math.abs(g[1]-c[1]));}}
 const fall1=[.12,.58,.9].map(u=>Math.abs(W.fallStreak(u,.3+.5/F.tFall,7.5,F)-W.fallStreak(u,.3,7,F))),held=[.12,.58,.9].map(u=>Math.abs(W.fallStreak(u,.3,7.5,F)-W.fallStreak(u,.3,7,F)));
 ok('fall: the fragment\'s streaks, foam and plunge churn equal the twins ('+wS.toExponential(1)+', '+wP.toExponential(1)+'); a streak falls with its water (half a second later it is '+(.5/F.tFall).toFixed(3)+' further down: '+Math.max(...fall1).toExponential(1)+', held: '+Math.max(...held).toFixed(3)+')',
  wS<1e-8&&wP<1e-9&&Math.max(...fall1)<1e-9&&Math.max(...held)>.01,false);
 const pl=W.plunge(F),near=W.plungeAt(F,pl.x+1,pl.z,3)[0],far=W.plungeAt(F,pl.x+pl.r*4,pl.z,3)[0];
 ok('the plunge pool at the curtain\'s foot ('+pl.x.toFixed(1)+', '+pl.y.toFixed(1)+'), white near it ('+near.toFixed(2)+') and calm '+(pl.r*4).toFixed(0)+' m off ('+far.toFixed(3)+')',
  Math.abs(pl.y-15)<1e-9&&Math.abs(pl.x-bot[0])<1e-9&&near>.4&&far<.05,far>near);
 W.surfaces.splice(W.surfaces.indexOf(F),1);}
// ================================================================ PHASE 4: still water and W.wet
{const L=W.still({name:'L pool',level:3,poly:[[0,0],[20,0],[20,8],[8,8],[8,20],[0,20]],fountain:[4,4]}),M=W.stillMesh(L);
 let area=0,up=true;for(let i=0;i<M.idx.length;i+=3){const a=M.idx[i]*3,b=M.idx[i+1]*3,c=M.idx[i+2]*3,ux=M.pos[b]-M.pos[a],uz=M.pos[b+2]-M.pos[a+2],vx=M.pos[c]-M.pos[a],vz=M.pos[c+2]-M.pos[a+2],ny=uz*vx-ux*vz;area+=Math.abs(ny)/2;up=up&&ny>0;}
 const Mr=W.stillMesh(W.still({name:'reversed',level:3,poly:[[0,20],[8,20],[8,8],[20,8],[20,0],[0,0]]}));W.surfaces.pop();let upR=true;
 for(let i=0;i<Mr.idx.length;i+=3){const a=Mr.idx[i]*3,b=Mr.idx[i+1]*3,c=Mr.idx[i+2]*3;upR=upR&&((Mr.pos[b+2]-Mr.pos[a+2])*(Mr.pos[c]-Mr.pos[a])-(Mr.pos[b]-Mr.pos[a])*(Mr.pos[c+2]-Mr.pos[a+2]))>0;}
 ok('still: an L-shaped pool in '+M.idx.length/3+' triangles covering its 256 m2 ('+area+'), every one facing up, either winding',area===256&&up&&upR&&M.idx.length===12,area!==256);
 let wN=0;for(const t of[0,77.7,1e5+.9]){const P=GP(W.stillGLSL(L),t);for(const p of[[1,1],[4.3,4.1],[15,6],[6,17]]){const g=P.run('wtrStillN',p),c=L.normalAt(p[0],p[1],t);wN=Math.max(wN,...g.map((q,k)=>Math.abs(q-c[k])));}}
 const calm=Math.hypot(...L.normalAt(15,6,3).filter((v,k)=>k!==1)),ring=Math.hypot(...L.normalAt(4.4,4.2,3).filter((v,k)=>k!==1));
 ok('still: the fragment\'s normal equals the twin ('+wN.toExponential(1)+'): a faint ripple ('+calm.toFixed(3)+') and the fountain\'s rings by the jet ('+ring.toFixed(3)+')',wN<1e-9&&calm<.04&&ring>calm,false);
 ok('still: heightAt is the level inside the polygon and the pool is not in its notch',W.heightAt(4,15,0)===3&&L.contains(4,15)&&!L.contains(15,15),L.contains(15,15));
 W.surfaces.pop();}
{A.W=A.W||{};const was=A.W.wet;A.W.wet=.8;const w=W.wet();A.W.wet=0;const w0=W.wet();A.W.wet=was;
 ok('W.wet: the weather\'s wetness ('+w+'), on what faces up ('+W.wetGroundRain(1,1)+'; a wall '+W.wetGroundRain(1,0)+')',w===.8&&w0===0&&W.wetGroundRain(1,1)===1&&W.wetGroundRain(1,0)===0,w!==.8);}
{const X=W.export(),sh=X.surfaces.find(s=>s.name==='tarn'),rv=X.surfaces.find(s=>s.name==='test river');
 ok('export: the shore grid (band, clip, the flood\'s cells) and the flow\'s ribbon travel as data',sh&&sh.shore&&sh.shore.band===40&&sh.shore.wetCells===LAKE.bed.wetCells&&rv&&rv.pts.length===31&&JSON.parse(JSON.stringify(X)).surfaces.length===W.surfaces.length,!sh);}

console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
