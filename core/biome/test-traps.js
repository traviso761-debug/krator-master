// node core/biome/test-traps.js — the carnivorous plants' trap rules (37-core-traps.js), each check with a negative.
'use strict';
const fs=require('fs'),path=require('path');
global.window=global;
eval(fs.readFileSync(path.join(__dirname,'..','rand','08-core-rand.js'),'utf8'));
eval(fs.readFileSync(path.join(__dirname,'37-core-traps.js'),'utf8'));
let bad=0;const ok=(name,pass,neg)=>{const r=pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const T=KTRAPS;
const snap=T.make({kind:'snap',mouth:.35,preyMax:'small'}),pit=T.make({kind:'pitfall',mouth:.2,preyMax:'small'}),dew=T.make({kind:'flypaper',preyMax:'insect'});
let threw=false;try{T.make({kind:'teeth'});}catch(e){threw=true;}ok('an unknown kind is refused',threw,false);
threw=false;try{T.make({kind:'snap',preyMax:'whale'});}catch(e){threw=true;}ok('an unknown prey class is refused',threw,false);
ok('a kind\'s defaults fill the cycle',snap.cycle.shut===.3&&snap.cycle.digest===604800,snap.cycle.shut!==.3);
ok('a pitcher does not move',T.state(pit,123,'p1').k===0&&!pit.moves,pit.moves);
// the cycle: deterministic by id, every phase reached, k within 0..1
const seen={};let kOK=true;for(let t=0;t<5e6;t+=37){const s=T.state(snap,t,'clap-7');seen[s.state]=1;if(s.k<0||s.k>1)kOK=false;}
ok('a snap trap waits, shuts, digests and reopens',seen.open&&seen.shut&&seen.opening&&kOK,false);
let shutting=0;for(let t=0;t<3e6;t+=.05)if(T.state(snap,t,'clap-7',1e5).state==='shutting'){shutting++;}
ok('shutting is caught at a page\'s speed and stays a third of a second',shutting>0,false);
ok('the same id is in the same place in its cycle',T.state(snap,5e5,'clap-7').k===T.state(snap,5e5,'clap-7').k&&T.phase('clap-7')===T.phase('clap-7'),T.phase('clap-7')===T.phase('clap-8'));
const shutLen=sp=>{let n=0,run=0,best=0;for(let t=0;t<4e3;t+=.01){if(T.state(snap,t,'x',sp).state==='shutting'){run++;best=Math.max(best,run);}else run=0;}return best*.01;};
ok('a page\'s speed shortens the wait, not the snap (a shut takes '+shutLen(1e5).toFixed(2)+' s)',Math.abs(shutLen(1e5)-.3)<.02,Math.abs(shutLen(1e5)-.3/1e5)<.02);
// catches: by size class; no harm to a person here; a hand is pinched by a big snap trap only
ok('a fly is caught by a sundew',T.catches(dew,{mass:.001}).caught,T.catches(dew,{mass:.4}).caught);
ok('a frog (0.3 kg) by a pitcher, a monkey (5 kg) not',T.catches(pit,{mass:.3}).caught&&!T.catches(pit,{mass:5}).caught,T.catches(pit,{mass:5}).caught);
ok('a fauna entry is sized by its mass',T.sizeOf({size:{length:.25},data:{mass:.2}})==='small',T.sizeOf({size:{length:.25},data:{mass:.2}})==='insect');
ok('a length alone sizes a prey',T.sizeOf({length:.05})==='insect'&&T.sizeOf({length:2})==='large',false);
const pr=T.catches(snap,'person');ok('a person is pinched by a clapjaw and not held',pr.pinch&&!pr.caught&&pr.harm===0,pr.caught);
ok('a small snap trap does not even pinch',!T.catches(T.make({kind:'snap',mouth:.05}),'person').pinch,false);
ok('a Korona grab with danger holds a person',T.catches(T.make({kind:'grab',preyMax:'person',danger:.6}),'person').caught,T.catches(T.make({kind:'grab',preyMax:'person',danger:0}),'person').caught);
// the shader's function is the same arithmetic (evaluated here by translating its few operations)
const glsl=T.GLSL.replace('float ktrapK(float t,vec4 cyc,float phase){','function ktrapK(t,cyc,phase){').replace(/float /g,'let ').replace(/0\.0/g,'0').replace(/1\.0/g,'1')
  .replace('mod(t+phase*L,L)','((t+phase*L)%L+L)%L').replace(/cyc\.x/g,'cyc[0]').replace(/cyc\.y/g,'cyc[1]').replace(/cyc\.z/g,'cyc[2]').replace(/cyc\.w/g,'cyc[3]');
const kf=eval('('+glsl+')'),sp=1e4,c=snap.cycle,cy=[c.wait/sp,c.shut,c.digest/sp,c.reopen/sp];
let worst=0;for(let t=0;t<200;t+=.013)worst=Math.max(worst,Math.abs(kf(t,cy,T.phase('clap-7'))-T.state(snap,t,'clap-7',sp).k));
ok('KTRAPS.GLSL computes the same k as state()',worst<1e-6,false);
ok('a different phase would be caught',true,(()=>{let w=0;for(let t=0;t<200;t+=.013)w=Math.max(w,Math.abs(kf(t,cy,.5)-T.state(snap,t,'clap-7',sp).k));return w<1e-6;})());
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
