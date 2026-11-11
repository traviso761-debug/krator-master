// node core/audio/test-sky-sound.js — the sky's light effects heard (24-core-audio-sky.js): the cue records' shape, the event to
// cue mapping, the distance law, and the binding against a stand-in ATMOS (the events reach the cues; KCUE picks when a cue has
// clips; nothing throws without Web Audio). Each check with a negative that must fail.
'use strict';
const fs=require('fs'),path=require('path');global.window=global;
let bad=0;const ok=(n,p,neg)=>{const r=p&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+n+(neg?' (its negative passed)':''));};
const near=(a,b,e)=>Math.abs(a-b)<=(e==null?1e-9:e);
// a stand-in ATMOS: the hooks the binding uses, no three.js
const listeners=[],thunder=[],hooks=[];
global.ATMOS={onSky:fn=>{listeners.push(fn);return fn;},onThunder:fn=>{thunder.push(fn);return fn;},hook:fn=>hooks.push(fn),rec:()=>({}),clock:{t:10},h:{seed:3,camera:{position:{x:0,y:2,z:0}}},skyLevel:{orbs:0,breathe:0}};
eval(fs.readFileSync(path.join(__dirname,'24-core-audio-sky.js'),'utf8'));
const K=global.KSKYSOUND;
const ID=/^[a-z0-9]+(\.[a-z0-9-]+)+$/,BUSES=['sfx','ui','amb','voice','music'];
ok('six cues in KCUE\'s shape: dotted ids, known buses, pitch and gain pairs, empty variants until the catalogue fills them',K.CUES.length===6&&K.CUES.every(c=>ID.test(c.id)&&BUSES.includes(c.bus)&&c.pitch.length===2&&c.gainDb.length===2&&Array.isArray(c.variants)&&c.variants.length===0&&c.notes.length>10),K.CUES.some(c=>!ID.test(c.id)));
ok('every light effect has its cue: thunder, the flash, the pillar, the ascent, the orbs, the breathe; nothing else maps',K.cueFor({kind:'thunder'})==='sfx.sky.thunder'&&K.cueFor({kind:'flash'})==='sfx.sky.flash'&&K.cueFor({kind:'event',event:'pillar'})==='sfx.sky.pillar'&&K.cueFor({kind:'event',event:'ascent'})==='sfx.sky.ascent'&&K.cueFor({kind:'orbs'})==='amb.sky.orbs'&&K.cueFor({kind:'breathe'})==='amb.sky.breathe'&&K.cueFor({kind:'episode'})===null&&K.cueFor(null)===null&&K.CUES.every(c=>c.id===K.cue(c.id).id),K.cueFor({kind:'episode'})!==null);
ok('the sky\'s distance law: full at the eye, half at 2.5 km, a fifth at 10 km; sound travels at 343 m/s',K.gainAt(0)===1&&near(K.gainAt(2500),.5)&&near(K.gainAt(10000),.2)&&near(K.delayAt(343),1)&&K.delayAt(0)===0,K.gainAt(10000)>=K.gainAt(2500));
// the binding without Web Audio: nothing throws, the events reach the cues, the stand-in stays quiet until enabled and a context exists
const B=K.bind({master:.5});
ok('bind: a record against a stand-in ATMOS, disabled until the page says so, no AudioContext here',!!B&&B.enabled===false&&B.ctx===null&&listeners.length===1&&thunder.length===1&&hooks.length===1&&near(B.master,.5),!B);
let threw=null;try{listeners[0]({kind:'flash',x:500,z:0,e:1,t:1});listeners[0]({kind:'event',event:'pillar',x:4000,z:0,dur:1,t:2});listeners[0]({kind:'event',event:'ascent',x:-3000,z:3000,dur:14,t:3});thunder[0]({dist:1200,power:.5});listeners[0]({kind:'episode',episode:2});hooks[0](1);}catch(e){threw=e;}
ok('a flash, a pillar, an ascent, a thunder and an episode go through without Web Audio (four cue fires, the episode none)',threw===null&&B.fires===4&&B.played.length===0,threw!==null);
B.enabled=true;let threw2=null;try{listeners[0]({kind:'flash',x:500,z:0,e:1,t:5});hooks[0](1);}catch(e){threw2=e;}
ok('...and enabled with no AudioContext in this runtime it still plays nothing and throws nothing',threw2===null&&B.played.length===0,threw2!==null);
// with KCUE on the page and a cue given clips, the page's player gets KCUE's pick
{const calls=[];global.KCUE={clean:c=>c,state:()=>({}),fire:(cue,st,t,seed)=>({variant:0,clip:cue.variants[0].clip,pitch:0,gain:1,t,seed})};
 const played=[];const B2=K.bind({play:(f,ev,cue)=>played.push([cue.id,f.clip,ev.kind])});K.cue('sfx.sky.pillar').variants.push({clip:'fs-pillar-1',weight:1});
 listeners[listeners.length-1]({kind:'event',event:'pillar',x:4000,z:0,dur:1,t:2});listeners[listeners.length-1]({kind:'flash',x:500,z:0,e:1,t:1});
 ok('with KCUE and clips the page\'s player gets the pick (the pillar: its clip); a cue without clips falls to the stand-in (the flash: nothing played here)',played.length===1&&played[0][0]==='sfx.sky.pillar'&&played[0][1]==='fs-pillar-1'&&played[0][2]==='event'&&B2.played.length===1,played.length!==1);
 K.cue('sfx.sky.pillar').variants.length=0;delete global.KCUE;}
ok('bind without ATMOS on the page is a plain false',(()=>{const a=global.ATMOS;delete global.ATMOS;const r=K.bind({});global.ATMOS=a;return r===false;})(),false);
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
