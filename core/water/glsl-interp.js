// core/water/glsl-interp.js: the small GLSL interpreter test-water.js and test-rebuild.js run the shaders' own text in (the chunks' subset:
// float/vec2-4, swizzles, inout, if/for, ?:, the builtins below), in doubles. glslProgram(text, env) -> {run(fn, ...args), call, funcs}; env holds
// uniforms and extra functions (texture2D). Not a numbered fragment: no build takes it.
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
module.exports={glslProgram};
