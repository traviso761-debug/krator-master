// node core/water/test-water.js — the water module's contract, each check with a broken input that must fail.
// The CPU twins (20-core-water.js) against THE SHADERS' OWN TEXT: the chunk 50-core-water-draw.js writes (and the
// atmos_waves chunk it includes) is run here by a small GLSL interpreter (the subset the chunks use: float/vec2-4,
// swizzles, inout, if/for, ?:, the builtins below), in doubles, so "the twin equals the shader's sum" is checked on the
// very text the GPU compiles, at sample points. Then the clock's wrap, the Newton inverse, the foam's decay, the bed's
// bytes, the CDLOD selection (tiling, one level between neighbours, no crack where levels meet), riding, flow and still water.
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..','..');
const src=['core/atmos/89-atmos-0-core.js','core/atmos/89-atmos-0p-presets.js','core/atmos/89-atmos-a-waves.js','core/water/20-core-water.js','core/water/50-core-water-draw.js']
 .map(f=>fs.readFileSync(path.join(ROOT,f),'utf8')).join('\n');
eval(src+';global.ATMOS=ATMOS;global.WATER=WATER;');
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

console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
