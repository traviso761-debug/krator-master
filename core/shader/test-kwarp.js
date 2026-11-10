// node core/shader/test-kwarp.js — KWARP (07-core-kwarp.js): each way a Krator material projects takes the warp, on the real r128 chunks and
// the real core/biome, core/water hooks; no install, nothing moves; what cannot bend is named.
const fs=require('fs'),path=require('path'),vm=require('vm'),R=require('./r128.js'),T=R.THREE,ROOT=path.join(__dirname,'..','..');
let bad=0;const ok=(n,p,neg)=>{const r=p&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+n+(neg?' (its negative passed)':''));};
const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const ctx={console,Math,THREE:T,Map,Set,WeakMap};ctx.globalThis=ctx;vm.createContext(ctx);
for(const f of ['core/shader/06-core-khook.js','core/shader/07-core-kwarp.js','core/biome/10-core-head.js','core/biome/20-core-kit.js','core/biome/30-core-foliage.js','core/biome/34-core-impostor.js','core/biome/35-core-anim.js'])
 vm.runInContext(read(f)+(f.endsWith('10-core-head.js')?'\nthis.BIO=BIO;':''),ctx,{filename:f});
const {KHOOK:K,KWARP:W,BIO}=ctx,scene=new T.Scene();BIO.init({THREE:T,scene,seed:3,err:()=>{}});
const G='vec3 kWarp(vec3 p){return p+vec3(0.0,uBend,0.0);}',U={uBend:{value:1}};
const shOf=m=>{const lib=m.isShaderMaterial?null:R.LIB[m.type];const sh=lib?R.shader(lib):{uniforms:m.uniforms,vertexShader:m.vertexShader,fragmentShader:m.fragmentShader};m.onBeforeCompile(sh,R.RENDERER);return sh;};
const compile=m=>{const sh=shOf(m);return{vs:sh.vertexShader,u:sh.uniforms,key:m.customProgramCacheKey()};};
const add=m=>{const o=new T.Mesh(new T.BufferGeometry(),m);scene.add(o);return m;};
const kinds={
 lambert:()=>new T.MeshLambertMaterial(),standard:()=>new T.MeshStandardMaterial(),basic:()=>new T.MeshBasicMaterial(),points:()=>new T.PointsMaterial(),
 'a page hook':()=>{const m=new T.MeshStandardMaterial();m.onBeforeCompile=sh=>{sh.fragmentShader+='//P';};return m;},
 'a KHOOK layer':()=>K.add(new T.MeshLambertMaterial(),'x',{vertex:{at:[{at:'begin_vertex',after:'X;'}]}}),
 'foliage (sway)':()=>BIO.leafMat(null,'k1',{}),'anim':()=>BIO.animMat('k2',{mode:'walk'}),
 'a plain ShaderMaterial':()=>new T.ShaderMaterial({vertexShader:'void main(){vec4 mvPosition=modelViewMatrix*vec4(position,1.0);gl_Position=projectionMatrix*mvPosition;}',fragmentShader:'void main(){}'}),
 'an expression':()=>new T.ShaderMaterial({vertexShader:'void main(){gl_Position=projectionMatrix*viewMatrix*(modelMatrix*vec4(position,1.0));}',fragmentShader:'void main(){}'})};
const before={};for(const k in kinds){const c=compile(add(kinds[k]()));before[k]=c;}
const imp=BIO.impostorSet&&BIO.impostorSet('kw',{}),impM=imp&&add(imp.mat);
const quad=add(new T.ShaderMaterial({vertexShader:'void main(){gl_Position=vec4(position.xy,0.0,1.0);}',fragmentShader:'void main(){}'}));
const raw=add(new T.RawShaderMaterial({vertexShader:'void main(){gl_Position=vec4(0.0);}',fragmentShader:'void main(){}'}));
const sky=add(new T.MeshBasicMaterial({side:T.BackSide,depthWrite:false}));
// no install: the sweep has not run, so a fresh material of each kind is as it was
for(const k in kinds){const c=compile(kinds[k]());ok('no warp: '+k+', the same text and key',c.vs===before[k].vs&&c.key===before[k].key&&!/kWarp/.test(c.vs),false);}
const w=W.install({key:'t',glsl:G,uniforms:U,scene});
const mats=[];scene.traverse(o=>{if(o.material)mats.push(o.material);});
const out=mats.map(m=>({m,c:compile(m)}));
const warped=out.filter(x=>/kWarpV\(/.test(x.c.vs));
const expectN=Object.keys(kinds).length+(impM?1:0);
ok('every world-drawing kind bends: '+warped.length+' of '+expectN,warped.length===expectN,false);
ok('...each takes the shared uniform',warped.every(x=>x.c.u.uBend===U.uBend),false);
ok('...and has it in its program key',warped.every(x=>/warp:t/.test(x.c.key)),false);
ok('...the warp comes after the sway',/kWarpV\(mvPosition\)/.test(compile(mats[Object.keys(kinds).indexOf('foliage (sway)')]).vs),false);
if(impM){const v=compile(impM).vs;ok('the impostors bend, mvPosition and all',/mvPosition=kWarpV\(mvPosition\);gl_Position=projectionMatrix\*mvPosition/.test(v),false);}
ok('a page hook still runs first',/\/\/P$/.test(shOf(mats[Object.keys(kinds).indexOf('a page hook')]).fragmentShader),false);
const r=w.report(),why=m=>(r.left.find(x=>x.type===m.type&&x.reason)||{}).reason;
ok('what cannot bend is named: the quad, the raw shader, the sky',r.left.length===3&&/no world/.test(r.left.find(x=>/no world/.test(x.reason)).reason)&&r.left.some(x=>/raw/.test(x.reason))&&r.left.some(x=>/sky/.test(x.reason)),false);
ok('text: a screen quad is null',W.text('void main(){gl_Position=vec4(0.0);}',G)===null,false);
ok('text: atmQuad is null',W.text('void main(){gl_Position=atmQuad(mv,ps);}',G)===null,false);
const late=add(new T.MeshLambertMaterial());ok('a material added later bends after a sweep',!/kWarpV\(/.test(compile(late).vs)&&(w.sweep(),/kWarpV\(/.test(compile(late).vs)),false);
{const src=add(new T.MeshStandardMaterial());w.sweep();const cl=src.clone();cl.onBeforeCompile=src.onBeforeCompile;add(cl);w.sweep();const v=compile(cl).vs,n=(v.match(/vec4 kWarpV\(/g)||[]).length;
 ok('a clone that took its source\'s composed hook has the warp once ('+n+')',n===1,false);ok('...and the text is unchanged on a second pass',W.text(v,G)===v,false);}
w.remove();ok('remove: the slot is empty and a material recompiles unbent',K.warp===null&&!/kWarp/.test(compile(mats[0]).vs),false);
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
