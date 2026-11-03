// node core/biome/test-breath-turn.js — the breath's turn (35b-core-anim-turn.js) on three r128's real chunks, each check with a negative.
require('../shader/06-core-khook.js');require('../shader/06b-core-kcolor.js');
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.join(__dirname,'..','..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8'),THREE=require(path.join(ROOT,'kits','ancients','three.min.js'));
let bad=0;const ok=(name,pass,neg)=>{const r=pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const throws=f=>{try{f();return false;}catch(e){return true;}};
const ctx={console,Math,THREE,btoa:s=>Buffer.from(s,'binary').toString('base64')};ctx.globalThis=ctx;vm.createContext(ctx);
for(const f of['core/biome/10-core-head.js','core/biome/20-core-kit.js','core/biome/30-core-foliage.js','core/biome/35-core-anim.js'])vm.runInContext(read(f)+(f.endsWith('10-core-head.js')?'\nthis.BIO=BIO;':''),ctx,{filename:f});
const BIO=ctx.BIO;BIO.init({THREE,scene:new THREE.Scene(),seed:3,err:()=>{},ticks:()=>{},eye:()=>[0,0,0]});BIO._tickWind();
const run=(o,lib)=>{const L=THREE.ShaderLib[lib||'lambert'],s={uniforms:{},vertexShader:L.vertexShader,fragmentShader:L.fragmentShader};BIO.animHook(o)(s);return s;};
const CASES=[{},{mode:'flit'},{mode:'walk',flap:{},legs:{}},{mode:'breath'},{mode:'breath',breath:{key:'g',shape:'fold',amp:.8,albedo:.5}},{mode:'breath',breath:{shape:'stream',amp:2,top:3}}];
const before=CASES.map(o=>JSON.stringify(run(o)));
vm.runInContext(read('core/biome/35b-core-anim-turn.js'),ctx,{filename:'35b-core-anim-turn.js'});
ok('loaded, it marks the hook',BIO.animHook._turn===true,false);
ok('every material that asks for no turn gets the hook\'s text unchanged',CASES.every((o,i)=>JSON.stringify(run(o))===before[i]),false);

// ---- a turn beside the fold: the Stills' sails fold on the geyser and turn with the sun
const fs2=run({mode:'breath',breath:{key:'geyser',shape:'fold',amp:1.2,turn:{key:'sun',amp:Math.PI}}}),v=fs2.vertexShader;
ok('two keys, two uniforms',fs2.uniforms.uBreath===BIO.breathState('geyser')&&fs2.uniforms.uTurn===BIO.breathState('sun')&&/uniform float uTurn;/.test(v),fs2.uniforms.uTurn===fs2.uniforms.uBreath);
ok('the fold is still there',/cos\(_s\*1\.200\)/.test(v)&&/transformed\.xy =/.test(v),false);
ok('the yaw turns the vertex about y after the fold, before the projection',v.indexOf('transformed.xy =')<v.indexOf('transformed.xz =')&&v.indexOf('transformed.xz =')<v.indexOf('gl_Position = projectionMatrix'),v.indexOf('transformed.xz =')<0);
ok('and turns the normal (fold\'s stay put)',/objectNormal\.xz = /.test(v)&&v.indexOf('objectNormal.xz =')<v.indexOf('vec3 transformedNormal = objectNormal;'),/objectNormal\.xz/.test(run(CASES[4]).vertexShader));
ok('the item\'s own heading aP1.y adds to it; share scales by aP0.w only when asked',/\(uTurn\*3\.1416\+aP1\.y\)/.test(v)&&/uTurn\*1\.0000\*aP0\.w/.test(run({mode:'breath',breath:{turn:{amp:1,share:true}}}).vertexShader),/aP0\.w\+aP1\.y/.test(v));
ok('no amp is a whole turn',/uTurn\*6\.2832/.test(run({mode:'breath',breath:{turn:{}}}).vertexShader),false);

// ---- shape turn: the yaw is the breath
const t1=run({mode:'breath',breath:{key:'sail',shape:'turn',amp:2}}),tv=t1.vertexShader;
ok('shape turn drives the yaw from breath.key and nothing else moves',t1.uniforms.uTurn===BIO.breathState('sail')&&/uTurn\*2\.0000/.test(tv)&&/transformed \+= normal\*_s\*0\.000/.test(tv),!/uTurn/.test(tv));
ok('shape turn with a breath.turn too, a bad turn, a bad amp are refused',throws(()=>BIO.animHook({mode:'breath',breath:{shape:'turn',turn:{}}}))&&throws(()=>BIO.animHook({mode:'breath',breath:{turn:5}}))&&throws(()=>BIO.animHook({mode:'breath',breath:{turn:{amp:'x'}}})),
  throws(()=>BIO.animHook({mode:'breath',breath:{turn:{}}})));
ok('a shader without beginnormal is refused, not drawn wrong',throws(()=>BIO.animHook({mode:'breath',breath:{turn:{}}})({uniforms:{},vertexShader:THREE.ShaderLib.basic.vertexShader.replace('#include <beginnormal_vertex>',''),fragmentShader:THREE.ShaderLib.basic.fragmentShader})),false);
ok('on Standard too',/objectNormal\.xz/.test(run({mode:'breath',breath:{turn:{}}},'standard').vertexShader),false);

// ---- the rotation as arithmetic: +x turned a quarter turn goes to -z (three's rotation.y)
const a=Math.PI/2,x=1,z=0,X=Math.cos(a)*x+Math.sin(a)*z,Z=-Math.sin(a)*x+Math.cos(a)*z,o3=new THREE.Object3D();o3.rotation.y=a;o3.updateMatrixWorld();const p=new THREE.Vector3(1,0,0).applyMatrix4(o3.matrixWorld);
ok('the yaw is three\'s rotation.y',Math.abs(X-p.x)<1e-9&&Math.abs(Z-p.z)<1e-9,Math.abs(X-p.x)>1e-9);
vm.runInContext(read('core/biome/35b-core-anim-turn.js'),ctx,{filename:'again'});
ok('loading it twice does not wrap twice',(run({mode:'breath',breath:{turn:{}}}).vertexShader.match(/uniform float uTurn;/g)||[]).length===1,false);
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
