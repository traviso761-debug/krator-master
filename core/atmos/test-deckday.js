// node core/atmos/test-deckday.js — the cloud deck's day and its air (fx/89-atmos-fx-deckday.js), each check with a negative.
const fs=require('fs'),path=require('path');
const FRAGS=['../shader/06-core-khook.js','../shader/06b-core-kcolor.js'].concat(fs.readdirSync(__dirname).filter(f=>/^89-atmos-.*\.js$/.test(f)).sort());
global.window=global;eval(FRAGS.map(f=>fs.readFileSync(path.join(__dirname,f),'utf8')).join('\n')+';global.ATMOS=ATMOS;');
const A=ATMOS;
let bad=0;const ok=(name,pass,neg)=>{const r=pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const throws=f=>{try{f();return false;}catch(e){return true;}};
ok('without the file there is no deckLevel (it is opt-in)',typeof A.deckLevel==='undefined',false);
eval(fs.readFileSync(path.join(__dirname,'fx','89-atmos-fx-deckday.js'),'utf8'));
const o={y:1000},L=h=>A.deckLevel(h,null,o);
ok('it laps highest after dawn and sinks lowest in the afternoon',Math.abs(L(8)-1060)<1e-9&&Math.abs(L(15.5)-940)<1e-9,Math.abs(L(15.5)-1060)<1e-9);
let mono=true;for(let h=8;h<15.5;h+=.25)if(L(h+.25)>L(h)+1e-9)mono=false;let up=true;for(let h=15.5;h<31.75;h+=.25)if(L(h+.25)<L(h)-1e-9)up=false;
ok('it falls all day and rises all night',mono&&up,false);
ok('the same at 0 and 24, and smooth through midnight',Math.abs(L(0)-L(24))<1e-9&&Math.abs(L(23.99)-L(0.01))<.5,false);
ok('fog and rain raise it',A.deckLevel(12,{fog:1,rain:1},o)===L(12)+65&&A.deckLevel(12,{fog:.5},o)===L(12)+20,A.deckLevel(12,{fog:1},o)<=L(12));
ok('lap 0 and burn 0 is the level all day',A.deckLevel(9,null,{y:500,lap:0,burn:0})===500&&A.deckLevel(18,null,{y:500,lap:0,burn:0})===500,false);
ok('a bad y, hour, lap, or high = low throws',throws(()=>A.deckLevel(1,null,{}))&&throws(()=>A.deckLevel(NaN,null,o))&&throws(()=>A.deckLevel(1,null,{y:0,lap:-1}))&&throws(()=>A.deckLevel(1,null,{y:0,high:8,low:32})),throws(()=>L(3)));
// ---- deckIn: under the billows' top at a point
const t=1234,top=A.deckHeight(100,200,t,1000);
ok('above the billows nothing; deep in them all of it',A.deckIn(100,top+1,200,t,1000)===0&&A.deckIn(100,top-30,200,t,1000)===1&&Math.abs(A.deckIn(100,top-7.5,200,t,1000)-.5)<1e-9,A.deckIn(100,top+1,200,t,1000)>0);
// ---- deckDay on a stand-in deck: one uniform written from the hour
A.hooks=A.hooks||[];   /* ATMOS.init makes it on a page */
const deck={mat:{uniforms:{uY:{value:1000}}},record:{y:1000}},D=A.deckDay(deck,{weather:()=>({fog:1})});
D.tick(0,8);ok('deckDay writes the deck\'s y from the hour and the weather',deck.mat.uniforms.uY.value===1100&&D.level()===1100&&deck.record.day.lap===60,deck.mat.uniforms.uY.value===1000);
D.stop();D.tick(0,15.5);ok('stop leaves it',deck.mat.uniforms.uY.value===1100,false);
ok('deckDay wants a deck',throws(()=>A.deckDay({})),false);
// ---- the air: visibility in the cloud, the page's own elsewhere
const got={},KH={provide:(n,f)=>{got[n]=f;}};A.provideDeck(KH,{level:()=>1000,base:()=>5000});
const V=got.visibility;ok('a sight field: the page\'s above the deck, 25 m deep in it',V&&V(100,top+5,200,t)===5000&&Math.abs(V(100,top-40,200,t)-25)<1e-9&&V(100,top-5,200,t)<600&&V(100,top-5,200,t)>25,V&&V(100,top-40,200,t)===5000);
ok('it needs KHAZ and a level',throws(()=>A.provideDeck({},{level:()=>0}))&&throws(()=>A.provideDeck(KH,{})),false);
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
