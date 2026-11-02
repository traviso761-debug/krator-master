// node core/biome/test-breath.js — BIO.animHook's mode 'breath' (35-core-anim.js) on three r128's real chunks, each check with a negative.
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

// ---- nothing asked, nothing there
const plain=[{},{mode:'flit'},{mode:'walk',flap:{},legs:{}}].map(o=>run(o));
ok('no other mode has a word of it, however the options read',plain.every(s=>!/uBreath|_br\(|vBrK/.test(s.vertexShader+s.fragmentShader)&&!s.uniforms.uBreath),false);
const noMode=run({breath:{amp:2,albedo:.5}});
ok('o.breath without the mode is ignored',!/uBreath/.test(noMode.vertexShader),/uBreath/.test(run({mode:'breath'}).vertexShader)===false);

// ---- the state
const U=BIO.breathState('gills');
ok('a key is one shared uniform; another key another',BIO.breathState('gills')===U&&BIO.breathState('lung')!==U&&U.value===0,false);
const a=run({mode:'breath',breath:{key:'gills'}}),b=run({mode:'breath',breath:{key:'gills',shape:'stream'}});
ok('every material of a key reads the same object, so one write moves them all',a.uniforms.uBreath===U&&b.uniforms.uBreath===U,a.uniforms.uBreath===BIO.breathState('lung'));
ok('no key is the default state',run({mode:'breath'}).uniforms.uBreath===BIO.breathState('breath'),false);

// ---- the shapes
const bu=run({mode:'breath',breath:{amp:.5}}).vertexShader,st=run({mode:'breath',breath:{shape:'stream',amp:2,top:3}}).vertexShader,fo=run({mode:'breath',breath:{shape:'fold',amp:.8}}).vertexShader;
ok('bulge goes along the vertex normal',/transformed \+= normal\*_s\*0\.500/.test(bu),/normal\*_s/.test(st));
ok('stream along the item\'s own vector, rooted by top',/transformed \+= aP0\.xyz\*_s\*2\.000/.test(st)&&/clamp\(position\.y\/3\.000,0\.0,1\.0\)/.test(st),/aP0\.xyz\*_s/.test(bu));
ok('fold turns about the hinge',/cos\(_s\*0\.800\)/.test(fo)&&/transformed\.xy =/.test(fo),/transformed\.xy =/.test(bu));
ok('each item\'s share and lag are its own',/_br\(\)\*aP0\.w/.test(bu)&&/\(uBreath-aP1\.x\)\/max\(1\.0-aP1\.x/.test(bu),false);
ok('a move comes after begin_vertex\'s line, so it reaches the projection',bu.indexOf('vec3 transformed = vec3( position );')<bu.indexOf('transformed += normal')&&bu.indexOf('transformed += normal')<bu.indexOf('gl_Position = projectionMatrix'),false);
ok('an unknown shape is refused',throws(()=>BIO.animHook({mode:'breath',breath:{shape:'wobble'}})),false);
// the shader's lag as arithmetic: starts past the lag, reaches 1 with the state
const lagK=(s,l)=>Math.max(0,Math.min(1,(s-l)/Math.max(1-l,.001)));
ok('a lagging item is still at the lag and whole at a full breath',lagK(.3,.3)===0&&lagK(1,.3)===1&&lagK(.65,.3)>.49,lagK(.3,0)===0);

// ---- the terms on the same uniform
const si=run({mode:'breath',breath:{albedo:.4}}),ps={uniforms:{},vertexShader:THREE.ShaderLib.standard.vertexShader,fragmentShader:THREE.ShaderLib.standard.fragmentShader};
ok('albedo: the colour multiplied, fading with the state',/diffuseColor\.rgb \*= mix\(1\.0,0\.400,vBrK\)/.test(si.fragmentShader)&&/vBrK = _br\(\)/.test(si.vertexShader),/vBrK/.test(a.fragmentShader));
ok('rough on a Lambert (no roughness) throws, not silently nothing',throws(()=>run({mode:'breath',breath:{rough:.3}})),false);
BIO.animHook({mode:'breath',breath:{rough:-.3,band:[2,6]}})(ps);
ok('rough on a Standard: added at the band\'s height alone',/roughnessFactor = clamp\(roughnessFactor\+-0\.300\*vBrK/.test(ps.fragmentShader)&&/smoothstep\(2\.000,2\.600,position\.y\)/.test(ps.vertexShader),/roughnessFactor \+/.test(si.fragmentShader));
const M=BIO.animMat('lung-sheen',{mode:'breath',pbr:{roughness:.6},breath:{rough:-.3}}),Lm=BIO.animMat('lung-plain',{mode:'breath'});
ok('BIO.animMat\'s o.pbr is a Standard; without it Lambert',M.isMeshStandardMaterial&&M.roughness===.6&&Lm.isMeshLambertMaterial,Lm.isMeshStandardMaterial);
ok('the material\'s record carries the breath as data',M.userData.bio.kind==='anim'&&M.userData.bio.opts.breath.rough===-.3&&JSON.stringify(M.userData.bio.opts.breath)==='{"rough":-0.3}',false);

// ---- it compiles: the texts are whole GLSL statements, every name declared
const count=(s,w)=>s.split(w).length-1;
const full=run({mode:'breath',breath:{key:'x',shape:'stream',amp:1,top:2,albedo:.5,band:[0,1]}});
ok('the vertex text declares what it uses (uBreath, vBrK, aP0, aP1) once each',count(full.vertexShader,'uniform float uBreath;')===1&&count(full.vertexShader,'varying float vBrK;')===1&&count(full.vertexShader,'attribute vec4 aP0;')===1,false);
ok('the fragment text declares vBrK once',count(full.fragmentShader,'varying float vBrK;')===1,false);
ok('braces balance',count(full.vertexShader,'{')===count(full.vertexShader,'}'),false);
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
