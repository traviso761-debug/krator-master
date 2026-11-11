// node core/tags/test-sound.js — the sound record (opt/54-core-tags-sound.js), each check with a negative; --write rewrites
// golden-sound.json, which ksound_test.gd holds ksound.gd to.
'use strict';
const fs=require('fs'),path=require('path');
require('../rand/08-core-rand.js');
const K=require('./50-core-tags.js');require('./52-core-tags-vocab.js');
let bad=0;const ok=(name,pass,neg)=>{const r=!!pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const throws=f=>{try{f();return false;}catch(e){return true;}};
const before=JSON.stringify(K.VOCAB);
ok('  negative: before it is loaded, a sound tag is an unknown key',K.norm({sound:{kind:'edge'}}).problems.length===1,false);
require('./opt/54-core-tags-sound.js');
const after=JSON.parse(JSON.stringify(K.VOCAB));delete after.soundKinds;delete after.keys.sound;
ok('loaded, the vocabulary only gains soundKinds and the sound key',JSON.stringify(after)===before,false);
ok('a sound tag is an object, no problem; a string is one',K.norm({sound:{kind:'edge'}}).problems.length===0&&K.norm({sound:'loud'}).problems.length===1,false);
// ---- the record
const H=K.sound({kind:'bamboo-howl',seed:7}),O=K.sound({kind:'gjar-organ',axis:0,seed:3}),F=K.sound({kind:'rib-flute',axis:Math.PI/2,seed:5});
ok('a preset fills its mode and sizes; the record is plain JSON',H.mode==='cavity'&&O.mode==='pipe'&&F.mode==='edge'&&JSON.stringify(JSON.parse(JSON.stringify(H)))===JSON.stringify(H),false);
ok('the detune is drawn from the seed: the same seed the same, another another',K.sound({kind:'bamboo-howl',seed:7}).detune===H.detune&&K.sound({kind:'bamboo-howl',seed:8}).detune!==H.detune&&Math.abs(H.detune)<=.12,false);
ok('given values win over the row',K.sound({kind:'gjar-organ',L:20,detune:0}).L===20&&K.sound({kind:'gjar-organ',detune:0}).L===40,false);
ok('bad sounds throw (an unknown kind, full under on, no size, no range)',throws(()=>K.sound({kind:'kazoo'}))&&throws(()=>K.sound({on:9,full:4,detune:0}))&&throws(()=>K.sound({kind:'edge',d:0,detune:0}))&&throws(()=>K.sound({range:0,detune:0})),throws(()=>K.sound({kind:'edge',detune:0})));
// ---- the level
const calm={speed:1,dir:0},gale={speed:25,dir:Math.PI/2};
ok('silent under its threshold, full voice at full',!K.soundLevel(H,calm).on&&K.soundLevel(H,{speed:12}).gain===H.gain&&K.soundLevel(H,{speed:7}).gain<H.gain,K.soundLevel(H,calm).on);
const h0=K.soundLevel(K.sound({kind:'bamboo-howl',detune:0}),{speed:10}).pitch;
ok('the howl: a Helmholtz tone near 75 Hz ('+h0.toFixed(1)+'), the same at any wind',h0>60&&h0<95&&K.soundLevel(K.sound({kind:'bamboo-howl',detune:0}),{speed:5}).pitch===h0,false);
const Oz=K.sound({kind:'gjar-organ',axis:0,detune:0}),o1=K.soundLevel(Oz,{speed:15,dir:Math.PI/2});
ok('the gjár: wind across the fissure sounds it, wind along it does not',o1.on&&!K.soundLevel(Oz,{speed:15,dir:0}).on,K.soundLevel(Oz,{speed:15,dir:0}).on);
const f0=331.3*Math.sqrt(1+15/273.15)/(4*(40+.6));
ok('its fundamental is c / 4(L + .6 r) ('+f0.toFixed(2)+' Hz, under hearing), its partials the odd harmonics',Math.abs(o1.partials[0][0]-f0)<1e-9&&o1.partials.every((p,i)=>Math.abs(p[0]-(2*i+1)*f0)<1e-9),false);
const lo=K.soundLevel(Oz,{speed:7,dir:Math.PI/2}),hi=K.soundLevel(Oz,{speed:30,dir:Math.PI/2});
ok('a rising wind overblows it to higher harmonics ('+lo.pitch.toFixed(1)+' Hz to '+hi.pitch.toFixed(1)+')',hi.pitch>lo.pitch*4,false);
ok('a warmer air raises every pipe\'s pitch (the speed of sound)',K.soundLevel(Oz,gale,{T:35}).pitch>K.soundLevel(Oz,gale,{T:-10}).pitch,false);
const Fz=K.sound({kind:'rib-flute',detune:0});
ok('the ribs: an edge tone, rising with the wind (Strouhal .2 u / d), held within lo..hi',Math.abs(K.soundLevel(Fz,{speed:20}).pitch-.2*20/.45)<1e-9&&K.soundLevel(Fz,{speed:1}).pitch===Fz.lo,K.soundLevel(Fz,{speed:20}).pitch===K.soundLevel(Fz,{speed:10}).pitch);
// ---- at a distance
const A=[0,0,0];
ok('full inside ref, falling as ref / distance, silent past range',K.soundAt(H,A,[3,0,0],{speed:12}).gain===H.gain&&Math.abs(K.soundAt(H,A,[60,0,0],{speed:12}).gain-H.gain*H.ref/60)<1e-12&&K.soundAt(H,A,[H.range+1,0,0],{speed:12}).gain===0,K.soundAt(H,A,[H.range+1,0,0],{speed:12}).on);
// ---- a record registered as anything placed is
const T=K.create({build:'test'}),rec=T.add({class:'feature',kind:'sound',key:'gjar',at:[10,0,20],r:30,tags:{sound:O}});
ok('a sound is registered in core/tags as a feature, its sound in its tags, no problem in the audit',rec.tags.sound.mode==='pipe'&&T.audit().unknown===0&&T.query({kind:'sound'}).length===1,false);
// ---- the golden for ksound.gd
const cases=[];const recs=[H,O,F,K.sound({kind:'edge',seed:2}),K.sound({kind:'pipe',axis:1.1,seed:4}),K.sound({kind:'cavity',r:.08,V:.2,seed:9})];
for(let i=0;i<72;i++){const s=recs[i%recs.length],w={speed:(i*1.7)%32,dir:i*.37},o={T:(i*7)%40-5},lst=[(i*13)%500,(i*3)%40,(i*29)%800];
  cases.push({rec:i%recs.length,wind:w,o,listener:lst,at:[5,1,-7],level:K.soundLevel(s,w,o),near:K.soundAt(s,[5,1,-7],lst,w,o)});}
const G=path.join(__dirname,'golden-sound.json'),gold={format:'krator-sound-golden',version:1,recs,cases};
if(process.argv.includes('--write'))fs.writeFileSync(G,JSON.stringify(gold)+'\n');
ok('golden-sound.json is the module\'s output (--write rewrites it)',fs.existsSync(G)&&fs.readFileSync(G,'utf8')===JSON.stringify(gold)+'\n',false);
ok('the fragment uses no THREE, no DOM, no Math.random',!/THREE\.|document\.|Math\.random\(/.test(fs.readFileSync(path.join(__dirname,'opt','54-core-tags-sound.js'),'utf8')),false);
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
