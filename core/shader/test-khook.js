// node core/shader/test-khook.js — KHOOK (06-core-khook.js): composition order, the page's slot, no recursion, program keys, a missing
// anchor throws (each rule with its negative), the fallback, kEye, glf, checkPrograms. Compiled against the real three.js r128 (r128.js):
// the shaders carry the real chunk order.
const path=require('path'),R=require('./r128.js'),T=R.THREE;
global.window=global;require('./06-core-khook.js');const K=global.KHOOK;
let bad=0;const ok=(n,p,neg)=>{const r=p&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+n+(neg?' (its negative passed)':''));};
const thrown=f=>{try{f();return null;}catch(e){return e;}};
const L=(tag)=>function(sh){sh.fragmentShader=K.rep(sh.fragmentShader,'#include <dithering_fragment>','#include <dithering_fragment>\n'+tag+';');};
const at=(s,t)=>s.indexOf(t+';');

// 1. order: the page's hook, then the layers as added; o.order moves a layer; a second add of a name is ignored
{const m=new T.MeshLambertMaterial();K.add(m,'a',L('A'));K.add(m,'b',L('B'));m.onBeforeCompile=L('PAGE');K.add(m,'a',L('A2'));
 const c=R.compile(m);
 ok('order: the page\'s hook (assigned after the layers) runs first, then the layers as added; a name added twice runs once',
  at(c.fs,'PAGE')>=0&&at(c.fs,'PAGE')>at(c.fs,'A')&&at(c.fs,'A')>at(c.fs,'B')&&at(c.fs,'A2')<0,at(c.fs,'A2')>=0);
 const m2=new T.MeshLambertMaterial();K.add(m2,'late',L('LATE'),{order:5});K.add(m2,'early',L('EARLY'),{order:-1});K.add(m2,'mid',L('MID'));
 const c2=R.compile(m2);ok('order: o.order sorts the layers (-1, 0, 5), ties as added',at(c2.fs,'EARLY')>at(c2.fs,'MID')&&at(c2.fs,'MID')>at(c2.fs,'LATE'),at(c2.fs,'LATE')>at(c2.fs,'MID'));}

// 2. a page hook that wraps the one it read calls the page hook under it, never the layers again (the NW outer wall's recursion)
{const m=new T.MeshLambertMaterial();m.onBeforeCompile=L('P0');K.add(m,'core',L('CORE'));const prev=m.onBeforeCompile;
 m.onBeforeCompile=function(sh,r){prev.call(this,sh,r);sh.fragmentShader+='\nWRAP;';};
 const e=thrown(()=>R.compile(m)),c=e?null:R.compile(m);
 ok('a wrapper of the read hook: no recursion, the page hook under it once, the layer once, the wrapper\'s text',!e&&(c.fs.match(/P0;/g)||[]).length===1&&(c.fs.match(/CORE;/g)||[]).length===1&&/WRAP;/.test(c.fs),!!e);}

// 3. program keys: the layer keys appended to the key under them; a spec's default key carries its text
{const m=new T.MeshLambertMaterial();m.customProgramCacheKey=()=>'own';K.add(m,'x',L('X'));K.add(m,'y',L('Y'),{key:()=>'y:7'});
 ok('key: the material\'s own key, then each layer\'s (a function key called)',m.customProgramCacheKey()==='own|x|y:7',false);
 const s=g=>{const q=new T.MeshLambertMaterial();K.add(q,'tint',{fragment:{at:[{at:'dithering_fragment',after:g}]}});return q.customProgramCacheKey();};
 ok('key: two specs of one name with different text key different programs (the vWorldUV closures that shared one)',s('gl_FragColor.r=1.0;')!==s('gl_FragColor.r=0.5;'),s('a;')!==s('a;'));
 const p=new T.MeshLambertMaterial();const f=function(sh){sh.fragmentShader+='//P';};p.onBeforeCompile=f;K.add(p,'z',L('Z'));
 ok('key: with no own key, the page hook\'s source (three\'s default), then the layer',p.customProgramCacheKey()===f.toString()+'|z',false);
 const n=new T.MeshLambertMaterial();n.needsUpdate=false;const v0=n.version;K.add(n,'w',L('W'));ok('needsUpdate: adding a layer bumps the material\'s version',n.version>v0,false);}

// 4. a missing anchor throws, names the layer, is recorded; the fallback; optional
{const m=new T.MeshBasicMaterial();K.add(m,'snowish',{vertex:{at:[{at:'no_such_chunk',after:'X;'}]}});
 const e=thrown(()=>R.compile(m));
 ok('a missing anchor throws, naming the layer and the anchor, and is recorded in KHOOK.failures',!!e&&/snowish/.test(e.message)&&/no_such_chunk/.test(e.message)&&K.failures.some(f=>f.layer==='snowish'),!e);
 const plain=new T.MeshBasicMaterial();plain.onBeforeCompile=function(sh){sh.vertexShader=sh.vertexShader.replace('#include <no_such_chunk>','X;');};
 ok('...where a hand String.replace did nothing, silently (the negative)',!thrown(()=>R.compile(plain)),false);
 const rp=thrown(()=>K.rep('abc','zz','q','who'));ok('KHOOK.rep throws on a missing find (string or RegExp), replaces like String.replace otherwise',!!rp&&!!thrown(()=>K.rep('abc',/z+/,'q','w'))&&K.rep('a$b','$b','[$&]')==='a[$b]',!rp);
 const leaf=new T.MeshLambertMaterial();leaf.onBeforeCompile=function(sh){sh.vertexShader=sh.vertexShader.replace('#include <project_vertex>','SWAY;');};
 K.add(leaf,'snow',{vertex:{at:[{at:'project_vertex',after:'SNOW;',fallback:{at:'fog_vertex',before:'SNOW;'}}]}});const c=R.compile(leaf);
 ok('fallback: a hook that replaced <project_vertex> (a leaf card) gets the layer before <fog_vertex> (the atmos snow on foliage)',c.vs.indexOf('SNOW;\n#include <fog_vertex>')>=0,c.vs.indexOf('SNOW;')<0);
 const pl=new T.MeshLambertMaterial();K.add(pl,'snow',{vertex:{at:[{at:'project_vertex',after:'SNOW;',fallback:{at:'fog_vertex',before:'SNOW;'}}]}});
 ok('...and on a plain material it goes after <project_vertex>',R.compile(pl).vs.indexOf('#include <project_vertex>\nSNOW;')>=0,false);
 const op=new T.MeshLambertMaterial();K.add(op,'opt',{vertex:{at:[{at:'nothing_here',after:'Q;',optional:true}]}});ok('optional: a missing anchor leaves the shader as it was',!thrown(()=>R.compile(op)),false);}

// 5. the spec: uniforms, head, skipIf, run, eye; the result resolves against the real chunks
{const U={value:1};const m=new T.MeshLambertMaterial();
 K.add(m,'fogish',{uniforms:{uK:U},eye:true,fragment:{head:'uniform float uK;\n',at:[{at:'fog_fragment',before:'gl_FragColor.rgb*=uK;'}]},vertex:{at:[{at:'project_vertex',after:'vec3 e=kEye();'}]},run:sh=>{sh.ran=true;}});
 const sh=R.shader('lambert');m.onBeforeCompile(sh,R.RENDERER);
 ok('spec: uniforms set, head first, eye in both stages, the injection, run called',sh.uniforms.uK===U&&sh.fragmentShader.indexOf(K.EYE+'uniform float uK;')===0&&sh.vertexShader.indexOf('vec3 kEye()')>=0&&/gl_FragColor\.rgb\*=uK;\n#include <fog_fragment>/.test(sh.fragmentShader)&&sh.ran===true,false);
 ok('...and it resolves against the real r128 chunks (every anchor a real chunk, nothing left unexpanded)',!/#include/.test(R.resolve(sh.vertexShader)+R.resolve(sh.fragmentShader)),false);
 const sk=new T.MeshLambertMaterial();sk.onBeforeCompile=function(sh){sh.vertexShader='varying vec3 kgWP;\n'+sh.vertexShader;};K.add(sk,'once',{skipIf:/varying vec3 kgWP;/,vertex:{at:[{at:'begin_vertex',after:'TWICE;'}]}});
 ok('skipIf: a shader that already carries the layer is left alone',!/TWICE/.test(R.compile(sk).vs),false);
 ok('kEye is the camera position from the view matrix',(()=>{const c=new T.PerspectiveCamera();c.position.set(13,-7,250);c.lookAt(1,2,3);c.updateMatrixWorld();
  const V=c.matrixWorldInverse.elements,t=[V[12],V[13],V[14]],e=[0,1,2].map(j=>-(t[0]*V[j*4]+t[1]*V[j*4+1]+t[2]*V[j*4+2]));   /* t*mat3(V): column j of R dotted with t */
  return Math.abs(e[0]-13)<1e-6&&Math.abs(e[1]+7)<1e-6&&Math.abs(e[2]-250)<1e-6;})(),false);}

// 6. glf, copy, has/names
{ok('glf: a GLSL float literal; NaN and Infinity throw',K.glf(1)==='1.0'&&K.glf(0.25)==='0.25'&&K.glf(2,3)==='2.000'&&!!thrown(()=>K.glf(NaN))&&!!thrown(()=>K.glf(1/0)),!thrown(()=>K.glf(NaN)));
 const m=new T.MeshLambertMaterial();K.add(m,'a',L('A'));K.add(m,'b',L('B'));const c=m.clone();
 ok('a clone has no layers until KHOOK.copy (r128\'s copy drops hooks), and has them after',!/A;/.test(R.compile(c).fs)&&(K.copy(m,c),/B;[\s\S]*A;/.test(R.compile(c).fs)),false);
 ok('has / names',K.has(m,'a')&&!K.has(m,'zz')&&K.names(m).join()==='a,b',K.has(m,'zz'));}

// 7. checkPrograms: the programs three could not link, with their materials; the anchors missed; [] when clean
{const m=new T.MeshLambertMaterial({name:'broken'}),ok2=new T.MeshLambertMaterial(),prog={name:'MeshLambertMaterial',cacheKey:'k',diagnostics:{runnable:false,programLog:'',vertexShader:{log:''},fragmentShader:{log:'ERROR: 0:12: x undeclared'}}};
 const good={name:'MeshBasicMaterial',cacheKey:'g'};const props=new Map([[m,{program:prog}],[ok2,{program:good}]]);
 const rr={info:{programs:[good,prog]},properties:{get:x=>props.get(x)||{}}};
 const scene={traverse:f=>[{name:'cliff',material:m},{name:'tree',material:[ok2]}].forEach(f)};
 K.failures.length=0;const out=K.checkPrograms(rr,scene);
 ok('checkPrograms: the program that did not link, its log and the material that uses it',out.length===1&&out[0].kind==='program'&&/undeclared/.test(out[0].fragmentLog)&&out[0].materials.length===1&&out[0].materials[0].name==='broken'&&out[0].materials[0].object==='cliff',out.length!==1);
 ok('...[] when every program links',K.checkPrograms({info:{programs:[good]},properties:rr.properties},scene).length===0,false);
 const mm=new T.MeshBasicMaterial();K.add(mm,'gone',{fragment:{at:[{at:'missing_chunk',after:'x;'}]}});thrown(()=>mm.onBeforeCompile(R.shader('basic'),rr));
 const o2=K.checkPrograms();ok('...the anchors missed too, and with no renderer, every renderer a layer compiled on',o2.some(x=>x.kind==='anchor'&&x.layer==='gone')&&o2.some(x=>x.kind==='program'),false);
 const o3=K.checkPrograms(null,null,/^nothing$/);ok('...only: a slice by key and layer (WATER.checkPrograms)',o3.length===0&&K.checkPrograms(null,null,/gone/).every(x=>x.kind==='anchor')&&K.checkPrograms(null,null,/gone/).length===1,false);}

// 8. the warp's slot: empty, nothing moves; installed, it runs last and keys the program
{const mk=()=>K.add(new T.MeshBasicMaterial(),'w',{vertex:{at:[{at:'project_vertex',after:'A;'}]}}),a=mk(),b=mk(),s0=R.compile(a);
 ok('the warp slot: empty by default, the text and the key are the layers alone',K.warp===null&&!/warp/.test(s0.key)&&s0.vs.includes('A;'),false);
 K.warp={key:'t',run(sh){sh.vertexShader=sh.vertexShader.replace('A;','A;WARP;');}};const s1=R.compile(b);K.warp=null;
 ok('...installed: after the layers, and in the program key',s1.vs.includes('A;WARP;')&&s1.key===s0.key+'|warp:t',false);
 ok('...removed: as it was',R.compile(a).vs===s0.vs&&a.customProgramCacheKey()===s0.key,false);}

console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
