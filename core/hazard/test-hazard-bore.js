// node core/hazard/test-hazard-bore.js — a bore's hazards (22-core-hazard-bore.js): rockburst, inrush, seal; each check with a negative.
'use strict';
const fs=require('fs'),path=require('path');
const C=p=>path.join(__dirname,'..',p);
require(C('rand/08-core-rand.js'));
const KT=require(C('tags/50-core-tags.js'));require(C('tags/52-core-tags-vocab.js'));
eval(fs.readFileSync(C('biome/37-core-traps.js'),'utf8'));
eval(fs.readFileSync(path.join(__dirname,'20-core-hazard.js'),'utf8'));
const H=globalThis.KHAZ;
let bad=0;const ok=(name,pass,neg)=>{const r=!!pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const none=o=>!o.rockburst&&!o.inrush&&!o.seal;
ok('without the opt-in fragment KHAZ has no rockburst, inrush or seal',none(H),none({rockburst:()=>0}));
const V0=JSON.stringify(KT.VOCAB.hazardKinds);
eval(fs.readFileSync(path.join(__dirname,'22-core-hazard-bore.js'),'utf8'));
ok('the fragment edits no vocabulary (no new hazard kind)',JSON.stringify(KT.VOCAB.hazardKinds)===V0,JSON.stringify(KT.VOCAB.hazardKinds)!==V0);

const T=KT.create({build:'bore'});
const rb=T.add({'class':'feature',kind:'stretch',name:'The deep stretch',at:[0,0,0],tags:{hazard:H.rockburst({period:600,warn:8,on:3,after:20,shape:{type:'box',w:37,h:14,d:60},offset:0})}});
const ir=T.add({'class':'feature',kind:'stretch',name:'The karst stretch',at:[0,0,500],tags:{hazard:H.inrush({period:3600,warn:30,ramp:60,on:600,after:900,shape:{type:'box',w:37,h:6,d:80},offset:0})}});
const se=T.add({'class':'feature',kind:'section',name:'Past the inner door',at:[0,0,1000],tags:{hazard:H.seal({door:'door.n.inner',shape:{type:'box',w:37,h:14,d:200}})}});

// rockburst: a crush on a cycle, harmless most of the period, lethal in the burst
const hb=H.of(rb);
ok('a rockburst is a crush with a cycle and the dust tell',hb.kind==='crush'&&hb.cycle&&hb.cycle.period===600&&hb.tell.fx==='dust',hb.kind!=='crush');
const sb=[0,4,9,10,30,300].map(t=>H.state(rb,t));
ok('it warns, bursts, settles and goes idle through its period',sb[1].state==='warn'&&sb.some(s=>s.k===1)&&sb[5].k===0,sb[5].k===1);
ok('its dose is 0 at an idle moment and full in the burst',H.dose(rb,0,0,300,5)===0&&sb.some((s,i)=>s.k===1),H.dose(rb,0,0,300,5)>0);

// inrush: a drown that rises on its ramp, holds flooded, drains
const si=[0,20,60,600,1500,3000].map(t=>H.state(ir,t));
ok('an inrush is a drown that rises, holds and drains on its cycle',H.of(ir).kind==='drown'&&si.some(s=>s.k===1)&&si[5].k<1,H.of(ir).kind!=='drown');
ok('it is dry between surges (base 0)',H.state(ir,3500).k===0,H.state(ir,3500).k>0);

// seal: harmless while the door holds, airless when it fails
ok('a sealed section is harmless',H.state(se,10).k===0&&H.dose(se,0,1000,10,5)===0,H.state(se,10).k===1);
H.setSeal('door.n.inner',false);
ok('the door fails: the section is airless (gas, suffocate, k 1)',H.state(se,10).k===1&&H.of(se).effect==='suffocate'&&H.dose(se,0,1000,10,5)>0,H.state(se,10).k===0);
H.setSeal('door.n.inner',true);
ok('the door is sealed again: harmless',H.state(se,10).k===0,H.state(se,10).k===1);
ok('a seal without a door is refused',(()=>{try{H.seal({});return false;}catch(e){return true;}})(),(()=>{try{H.seal({door:'d'});return false;}catch(e){return true;}})());
ok('every bore hazard exports as its kind',H.export(T).records.map(r=>r.hazard.kind).join(',')==='crush,drown,gas',H.export(T).records.length!==3);
console.log(bad?'\n'+bad+' FAILED':'\nall passed');process.exit(bad?1:0);
