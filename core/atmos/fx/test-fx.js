// node core/atmos/fx/test-fx.js -- the opt-in effects (core/atmos/fx/): snow's step is pure and does what its preset says; the
// chunks are written (no sin hash, the presets' numbers in them). The drawing is checked in the pages that take them.
'use strict';
const fs=require('fs'),path=require('path');global.window=global;
const src=[path.join(__dirname,'..','89-atmos-0-core.js'),path.join(__dirname,'..','89-atmos-0p-presets.js'),path.join(__dirname,'89-atmos-fx-snowcover.js'),path.join(__dirname,'89-atmos-fx-lava.js')];
eval(src.map(f=>fs.readFileSync(f,'utf8')).join('\n')+';global.ATMOS=ATMOS;');   /* as test-atmos.js loads them: one script */
const A=global.ATMOS;let bad=0;const ok=(n,p,neg)=>{const r=p&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+n+(neg?' (its negative passed)':''));};
const P=A.PRESETS.snowcover;
// a blizzard covers bare ground in 1/rate seconds; a snowfall more slowly; nothing falls: it melts by day, slower at night, not if frozen
const run=(snow,secs,hour,o)=>{const S=Object.assign({depth:0},o||{});for(let t=0;t<secs;t+=.5)A.snowStep(S,{snow},.5,hour);return S.depth;};
ok('a blizzard covers the ground in about 1/rate seconds',run(1,1/P.rate,13)>.99&&run(1,.5/P.rate,13)<.6,run(0,1/P.rate,13)>0);
ok('a snowfall builds more slowly than a blizzard',run(.4,.5/P.rate,13)<run(1,.5/P.rate,13)&&run(.4,.5/P.rate,13)>0,false);
const melt=(hour,frozen)=>{const S={depth:1,frozen};for(let t=0;t<600;t+=1)A.snowStep(S,{snow:0},1,hour);return S.depth;};
ok('it melts by day, slower at night, not at all in frozen air',melt(13)<melt(23)&&melt(23)<1&&melt(13,true)===1,melt(13)===1);
ok('the depth stays in 0..1',run(1,1e5,13)===1&&melt(13)>=0,false);
const g=A.snowGLSL(),l=A.lavaGLSL(A.PRESETS.lava);
ok('the chunks carry no sin hash and the presets\' numbers',!/fract\(\s*sin/.test(g+l)&&g.indexOf('atmSnow(')>0&&l.indexOf(String(A.PRESETS.lava.plates.cell))>0,/fract\(\s*sin/.test(g+l));
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
