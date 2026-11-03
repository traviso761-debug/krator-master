// node core/biome/test-season-flush.js — the copper flush (30s-core-season-flush.js) on three r128's own Lambert templates, as
// test-foliage.js runs the foliage hooks, each check with a negative. Loading the fragment must leave every shader without
// season.flush as it was, character for character.
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const D=__dirname,{load,compile,shaders,sha}=require('./test-foliage.js');
let fails=0;const check=(name,ok,neg)=>{const r=!!ok&&!neg;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));if(!r)fails++;};
const SRC=fs.readFileSync(path.join(D,'30-core-foliage.js'),'utf8'),FL=fs.readFileSync(path.join(D,'30s-core-season-flush.js'),'utf8');
const pick=s=>s.vertexShader+'\n----\n'+s.fragmentShader;
// ---- loaded, every default and every season material without flush writes the shader it wrote
const A=load(SRC),B=load(SRC+'\n'+FL),T=B.host.THREE,tex=new T.Texture();tex.biomeMean=.5;
const SA=shaders(A),SB=shaders(B),diff=Object.keys(SA).filter(k=>SA[k]!==SB[k]);
check('loaded, every default hook writes the shader it wrote ('+Object.keys(SA).length+' kinds)',diff.length===0,false);
const seasonO={vertexColors:true,ground:true,season:{drop:.8,colour:0xc8a860,k:.9}};
check('  and a season leaf without flush is unchanged',pick(compile(A,A.leafMat(new A.host.THREE.Texture(),'dry',seasonO)))===pick(compile(B,B.leafMat(tex,'dry',seasonO))),false);
// ---- a flush leaf
const s=compile(B,B.leafMat(tex,'miombo',{vertexColors:true,season:{colour:0x9a7040,k:.5,flush:{colour:0xb0502a,k:.9}}})),F=s.fragmentShader;
check('flush: the page-wide uniform is BIO.FLUSH itself, the options a vec2 (k, stagger) and a linear colour',s.uniforms.uSeasonFlush===B.FLUSH&&Math.abs(s.uniforms.uFlK.value.x-.9)<1e-12&&s.uniforms.uFlK.value.y===.5&&s.uniforms.uFlC.value.x>s.uniforms.uFlC.value.z,
  !compile(B,B.leafMat(tex,'plain2',{season:{colour:0x9a7040}})).uniforms.uSeasonFlush===false);
const iS=F.indexOf('float _snD'),iF=F.indexOf('float _flD'),iA=F.indexOf('#include <alphatest_fragment>');
check('flush: its colour step comes after the dry\'s and before the alpha test, with the same hash',iS>0&&iF>iS&&iA>iF&&/_flC \/ max\(vColor/.test(F)&&/uniform float uSeasonFlush;/.test(F),iF<0);
const nf=compile(B,B.leafMat(tex,'noflush',{season:{colour:0x9a7040}}));
check('  negative: a season leaf without flush reads no flush',!/uSeasonFlush/.test(nf.fragmentShader)&&!nf.uniforms.uSeasonFlush,/uSeasonFlush/.test(F)===false);
const only=compile(B,B.leafMat(tex,'flushonly',{season:{flush:true}}));
check('flush alone (no dry colour, no drop) still compiles its step, with the default copper',/float _flD/.test(only.fragmentShader)&&!/_snC/.test(only.fragmentShader)&&Math.abs(only.uniforms.uFlC.value.x-new T.Color(0xb0502a).convertSRGBToLinear().r)<1e-12,false);
// ---- the shader's own formula, in the GLSL interpreter
const {glslProgram}=require(path.join(D,'..','water','glsl-interp.js'));
const fE=(F.match(/float _flD = ([^;]+);/)||[])[1];
const P=glslProgram(B.GLSL_SEASON_HASH+'\nfloat fl(float uSeasonFlush,vec2 uFlK,float _flH){return '+fE+';}',{});
const hs=[0,.1,.5,.9,.999];
check('flush 0: the colour untouched at every hash (exactly x1)',hs.every(h=>P.call('fl',0,[.9,.5],h)===0),false);
check('full flush: every instance coloured by k, the high hashes most (staggered)',hs.every(h=>P.call('fl',1,[1,.5],h)>=.5)&&P.call('fl',.5,[1,.5],.999)>P.call('fl',.5,[1,.5],0),P.call('fl',1,[1,0],0)!==1);
// ---- the page-wide value, and the clock
check('setFlush clamps a number and reads a record\'s flush',B.setFlush(2)===1&&B.setFlush(-1)===0&&B.setFlush({flush:.3})===.3,false);
check('  negative: bindFlush without core/clock binds nothing',B.bindFlush({day:0,hour:0})===false,false);
vm.runInContext(fs.readFileSync(path.join(D,'..','clock','20-core-clock.js'),'utf8'),B.__ctx);
check('  nor with core/clock but not its flush fragment',B.bindFlush({day:0,hour:0})===false,false);
vm.runInContext(fs.readFileSync(path.join(D,'..','clock','opt','21-core-clock-flush.js'),'utf8'),B.__ctx);
const KC=B.__ctx.KCLOCK;let on=null;for(let d=1;d<366;d+=.25)if(KC.season(d-.25,0,{}).wet<.5&&KC.season(d,0,{}).wet>=.5){on=d;break;}
const C=KC.make({hour:0,day:Math.floor(on)+10});B.__ticks=[];
check('bindFlush drives BIO.FLUSH from the clock: full ten days into the rains',B.bindFlush(C)===true&&B.FLUSH.value>.99,false);
C.day=Math.floor(on)+120;B.__ticks.forEach(f=>f(1/60));check('...and follows it each frame (gone four months on)',B.FLUSH.value===0,false);
check('a material\'s options carry the flush to the export',B.leafMat(tex,'exp',{season:{flush:{colour:0xb0502a}}}).userData.bio.opts.season.flush.colour===0xb0502a,false);
console.log(fails?fails+' FAILED':'all passed');process.exit(fails?1:0);
