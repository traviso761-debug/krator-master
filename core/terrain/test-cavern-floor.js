// node core/terrain/test-cavern-floor.js — the floor under the eye in a cavern (39d-core-cavern-floor.js: KCAVERN.floorFn, openAt), each check with a negative.
'use strict';
const fs=require('fs'),path=require('path');
global.window=global;
for(const f of['../rand/08-core-rand.js','39-core-cavern.js','39d-core-cavern-floor.js'])eval(fs.readFileSync(path.join(__dirname,f),'utf8'));
let bad=0;const ok=(name,pass,neg)=>{const r=!!pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const throws=f=>{try{f();return false;}catch(e){return true;}};
// a flat shelf at 0 over rock; a hall whose floor is at -40, a room above it whose floor is at -30, a shaft from the hall down to -60
const ground=()=>0;
const C=KCAVERN.create({ground,cell:1,chunk:16,seed:3});
C.hall({id:'h',c:[0,-40,0],rx:20,rz:16,h:14,belly:.2});
C.room({id:'r',poly:[[30,-5],[42,-5],[42,5],[30,5]],y:-30,h:4});
C.shaft({id:'s',c:[0,0],y0:-60,y1:-40,r0:2,r1:2});
C.build();
const F=KCAVERN.floorFn(C,{from:-50,to:-2,fallback:-99});
ok('the hall\'s floor reads its record (-40), off the shaft',Math.abs(F(10,5)+40)<.1,Math.abs(F(10,5)+30)<.1);
ok('the room\'s floor reads its own (-30)',Math.abs(F(36,0)+30)<.1,Math.abs(F(36,0)+40)<.1);
ok('a column of rock reads the fallback',F(-80,-80)===-99,F(10,5)===-99);
ok('the shaft reads the lowest open point at or over `from` (-50: its water would stand over it)',Math.abs(F.at(0,0)+50)<.6,Math.abs(F.at(0,0)+40)<.1);
const F2=KCAVERN.floorFn(C,{from:-70,to:-2,fallback:-99});
ok('from lower, the shaft reads its own foot (-60)',Math.abs(F2.at(0,0)+60)<.1,Math.abs(F2.at(0,0)+50)<.6);
ok('bilinear between nodes (half way between the hall floor and the rock fallback)',Math.abs(F(30.5,0)-(F.at(30,0)+F.at(31,0))/2)<1e-9,false);
ok('each node read once (the cache)',(()=>{const n=F.cache.size;F(10,5);F(10.2,5.1);return F.cache.size===n;})(),false);
ok('openAt: the hall\'s middle open, the rock shut',KCAVERN.openAt(C,0,-35,0,.5)&&!KCAVERN.openAt(C,-80,-35,-80,0),KCAVERN.openAt(C,-80,-35,-80,0));
ok('refuses a bad range or an unbuilt cavern',throws(()=>KCAVERN.floorFn(C,{from:-2,to:-50}))&&throws(()=>KCAVERN.floorFn(null,{from:-50,to:-2}))&&throws(()=>KCAVERN.floorFn(C,{from:-50,to:-2,step:0})),
  throws(()=>KCAVERN.floorFn(C,{from:-50,to:-2})));
ok('the same cavern, the same floor (determinism)',(()=>{const G=KCAVERN.floorFn(C,{from:-50,to:-2,fallback:-99});return [[10,5],[36,0],[3.3,-2.7]].every(p=>G(p[0],p[1])===F(p[0],p[1]));})(),false);
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
