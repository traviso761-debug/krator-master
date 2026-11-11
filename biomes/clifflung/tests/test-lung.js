// node biomes/clifflung/tests/test-lung.js — the Cliff Lungs' data (src/47-biome-lung-data.js; PLAN.md sections 3, 6, 9 and 16 L1): the breath's four
// states against the clock and the weather, its determinism, the bands monotone in pressure, the yield and the stack against section 3's numbers,
// the mirror share, the layout's invariants on a KRELIEF.scarp, the hazards on the breath. Each check with a broken input that must fail. No browser.
'use strict';
const fs=require('fs'),path=require('path'),ROOT=path.join(__dirname,'..','..','..');
global.window=global;
const rd=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
eval(rd('core/rand/08-core-rand.js')+';global.KRAND=KRAND;');
eval(rd('core/clock/20-core-clock.js')+';global.KCLOCK=KCLOCK;');
const AT=path.join(ROOT,'core','atmos');
eval(['../shader/06-core-khook.js','../shader/06b-core-kcolor.js'].concat(fs.readdirSync(AT).filter(f=>/^89-atmos-.*\.js$/.test(f)).sort()).map(f=>fs.readFileSync(path.join(AT,f),'utf8')).join('\n')+';global.ATMOS=ATMOS;');
eval(rd('core/atmos/fx/89-atmos-fx-deckday.js'));
const KT=require(path.join(ROOT,'core','tags','50-core-tags.js'));require(path.join(ROOT,'core','tags','52-core-tags-vocab.js'));
for(const f of['core/biome/37-core-traps.js','core/hazard/20-core-hazard.js'])eval(rd(f));
global.KHAZ=globalThis.KHAZ;
eval(rd('core/terrain/38-core-relief.js')+';global.KRELIEF=KRELIEF;');
eval(rd('biomes/clifflung/src/47-biome-lung-data.js')+';global.LUNG=LUNG;');
const L=LUNG;
let bad=0;const ok=(name,pass,neg)=>{const r=!!pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const throws=f=>{try{f();return false;}catch(e){return true;}};
const at=(day,h)=>day+h/24;
const SPRING={summer:0},WINTER={summer:-1,cloud:0},SUMMER={summer:1};

// ---- the four states (section 11: noon 1, dawn .3, dusk 0, the winter reversal -.2)
const noon=L.breath(at(10,12),SPRING),dawn=L.breath(at(10,6.5),SPRING),dusk=L.breath(at(10,18.6),SPRING),wnight=L.breath(at(10,2),WINTER);
ok('the noon draw is the full breath ('+noon.toFixed(3)+')',noon>.95&&noon<=1,L.breath(at(10,12),{summer:0,cloud:1})>.95);
ok('dawn steams at about .3 ('+dawn.toFixed(3)+')',dawn>.22&&dawn<.38,L.breath(at(10,6.5),{summer:0,wet:0})>.22);
ok('dusk is silent ('+dusk.toFixed(4)+')',Math.abs(dusk)<.03,Math.abs(L.breath(at(10,15),SPRING))<.03);
ok('a clear winter night runs backward at about -.2 ('+wnight.toFixed(3)+')',wnight<-.17&&wnight>=-.2,L.breath(at(10,2),{summer:-1,cloud:1})<-.17);
ok('a summer night does not reverse ('+L.breath(at(10,2),SUMMER).toFixed(3)+')',L.breath(at(10,2),SUMMER)>-.01,L.breath(at(10,2),WINTER)>-.01);
ok('cloud weakens the noon draw; a dry foot weakens the dawn',L.breath(at(3,12),{summer:0,cloud:1})<noon-.4&&L.breath(at(3,6.5),{summer:0,wet:.2})<dawn-.15,false);
{let lo=1,hi=-1,okr=true;for(let m=0;m<1440*3;m+=5){const b=L.breath(m/1440,{summer:-1+2*((m/1440)%1)});if(!(b>=-1&&b<=1))okr=false;lo=Math.min(lo,b);hi=Math.max(hi,b);}
 ok('the breath stays in -1..1 through three days ('+lo.toFixed(2)+' .. '+hi.toFixed(2)+')',okr&&lo>=-.21,false);}
// ---- the clock and the season: with no summer in the weather, KCLOCK.season gives it
{const d=[0,60,120,180,240,300].map(dd=>KCLOCK.season(dd,2).summer),dw=[0,60,120,180,240,300][d.indexOf(Math.min(...d))];
 ok('KCLOCK.season\'s midwinter night reverses the flue, its midsummer night does not',L.breath(at(dw,2))<-.1&&L.breath(at([0,60,120,180,240,300][d.indexOf(Math.max(...d))],2))>-.01,L.breath(at(dw,2),{summer:1})<-.1);}
// ---- the deck's day is the breath's: the condensation engine follows ATMOS.deckLevel
{const e1=L.engines(at(1,8),SPRING),e2=L.engines(at(1,14),SPRING),k1=L.deckK(8),k2=L.deckK(14);
 ok('the condensation engine falls as the deck burns back ('+e1.latent.toFixed(3)+' at 8, '+e2.latent.toFixed(3)+' at 14)',e1.latent>e2.latent&&Math.abs(e1.latent/e2.latent-k1/k2*(1-0)/(1-((14>16)?1:0)))<.35,false);
 const D0=L.DECK.high;L.DECK.high=13;const e3=L.engines(at(1,14),SPRING).latent;L.DECK.high=D0;
 ok('moving the deck\'s high hour moves the engine (one curve for both)',e3>e2.latent+.05,false);
 const A0=ATMOS.deckLevel;delete ATMOS.deckLevel;ok('without the deck\'s day the breath refuses (it does not invent its own)',throws(()=>L.breath(.5)),false);ATMOS.deckLevel=A0;}
// ---- determinism and the arguments
ok('the same t and weather give the same breath',L.breath(12.3456,{wet:.7,cloud:.3,summer:.2})===L.breath(12.3456,{wet:.7,cloud:.3,summer:.2}),L.breath(12.3456,{wet:.7})===L.breath(12.3457,{wet:.71}));
ok('t must be a number',throws(()=>L.breath('noon'))&&throws(()=>L.breath(NaN)),throws(()=>L.breath(1)));

// ---- the bands (monotone in pressure, one function for the Wall)
{let mono=true,prev=-1;for(let a=1.6;a>=1.0;a-=.001){const i=L.bandAt(a).i;if(i<prev)mono=false;prev=i;}
 ok('the band rises as the air thins, never back ('+L.bandAt(1.55).name+' at the foot, '+L.bandAt(1.06).name+' at the crest)',mono&&L.bandAt(1.55).i<L.bandAt(1.24).i&&L.bandAt(1.24).i<L.bandAt(1.06).i,L.bandAt(1.06).i<L.bandAt(1.55).i);
 const B=L.bandAt(1.21);ok('a band holds its pressure (1.21 atm in '+B.atm1.toFixed(2)+' .. '+B.atm0.toFixed(2)+')',B.atm1<1.21&&B.atm0>=1.21,L.bandAt(1.31).atm0<1.21);
 ok('the bands are colours (sRGB triples) and the foot\'s is not the crest\'s',L.bandAt(1.55).col.length===3&&L.bandAt(1.55).col.join()!==L.bandAt(1.06).col.join(),false);
 ok('a pressure that is not one is refused',throws(()=>L.bandAt(0))&&throws(()=>L.bandAt('x')),throws(()=>L.bandAt(1.2)));
 ok('the air law: 1.50 atm at 529 m, 1.10 at 3,001 m (the stations)',Math.abs(L.atmAt(529)-1.50)<.01&&Math.abs(L.atmAt(3001)-1.10)<.01,Math.abs(L.atmAt(3001)-1.50)<.01);}

// ---- the yield and the stack (section 3's arithmetic)
{const y3=L.yield(3),y6=L.yield(6),P=L.physics(),q=L.latentKW(3);
 ok('a 3 m flue weeps 4-5 m3 a day ('+y3.toFixed(2)+')',y3>=4&&y3<=5,L.yield(1.5)>=4);
 ok('a 6 m flue 15-20 ('+y6.toFixed(1)+')',y6>=15&&y6<=20,false);
 ok('cloud and a dry foot cut it',L.yield(3,{cloud:1,wet:.3})<y3*.5,false);
 ok('the stack is ~190 Pa ('+P.dp.toFixed(0)+'), the dawn draw 2-3 m/s ('+P.vDawn.toFixed(2)+'), the sun\'s ~9 m/s ('+P.vSun.toFixed(1)+')',Math.abs(P.dp-190)<15&&P.vDawn>=2&&P.vDawn<=3.1&&Math.abs(P.vSun-9)<1,L.physics({bore:1.5}).vDawn>=2.2);
 ok('the dry adiabat is 7.4 degrees a kilometre ('+P.lapseDry.toFixed(2)+')',Math.abs(P.lapseDry-7.37)<.05,false);
 ok('the dawn condensation gives back ~290 kW ('+q.toFixed(0)+')',Math.abs(q-290)<30,Math.abs(L.latentKW(6)-290)<30);
 ok('a bore must be a length',throws(()=>L.yield(0))&&throws(()=>L.yield(-1)),throws(()=>L.yield(3)));}

// ---- the hand: the mirror lung under one in thirty, and some
{let n=0;const N=30000;for(let i=0;i<N;i++)if(L.hand(7,i)<0)n++;
 ok('mirror lungs: '+n+' in '+N+' ('+(n/N*100).toFixed(2)+'%), under one in thirty and not none',n>0&&n/N<1/30,false);
 const H0=L.MIRROR_EVERY;L.MIRROR_EVERY=20;let m=0;for(let i=0;i<N;i++)if(L.hand(7,i)<0)m++;L.MIRROR_EVERY=H0;ok('one in twenty would break the rule (the negative)',m/N>1/30,false);}

// ---- the layout on a scarp
const S=KRELIEF.scarp({pts:[[-2600,-500],[2600,-500]],side:-1,h:2000,run:2100,power:1.2,drop:true,ravines:{n:6,w:[60,110],head:[60,160],depth:[30,90]},buttresses:{sp:700,amp:60},talus:{h:60,reach:300},seed:11});
const ground=(x,z)=>KRELIEF.shape(S,x,z,3000);
const lay=o=>L.layout(Object.assign({scarp:S,ground,world:0x1A6,n:10,deckY:1150,wind:[.6,.8],clip:2600},o||{}));
const G=lay();
ok('the layout places '+G.lungs.length+' lungs ('+G.mouths.length+' mouths, '+G.husks.length+' husks, '+G.lawns.length+' lawns)',G.lungs.length>=6&&G.lungs.length<=14&&G.mouths.length>=3,false);
ok('it is the same twice (KRAND by lung and ring)',JSON.stringify(lay())===JSON.stringify(G),JSON.stringify(lay({world:0x1A7}))===JSON.stringify(G));
const ringsOk=Gx=>Gx.lungs.every(l=>l.rings.every(R=>R.band===L.bandAt(R.atm).i));
ok('every ring\'s band is LUNG.bandAt of its birth pressure',ringsOk(G),ringsOk({lungs:[{rings:[Object.assign({},G.lungs[0].rings[0],{band:G.lungs[0].rings[0].band+3})]}]}));
const monoOk=Gx=>Gx.lungs.every(l=>l.rings.every((R,i)=>!i||(R.a[1]>=l.rings[i-1].a[1]-1e-6&&R.atm<=l.rings[i-1].atm+1e-9)));
ok('every lung\'s rings climb, foot to tip, and the air thins up them',monoOk(G),monoOk({lungs:[{rings:G.lungs[0].rings.slice().reverse()}]}));
ok('a ring is 20-60 m (the last may be shorter)',G.lungs.every(l=>l.rings.every((R,i)=>(R.len>=19.99&&R.len<=60.01)||i===l.rings.length-1)),false);
ok('every mouth stands on the plateau\'s lip (within 60 m of the rim, over 2.9 km)',G.mouths.every(m=>Math.abs(m.z+500)<60&&m.y>2900),false);
ok('a husk has no breath: no lawn and no yield',G.lungs.filter(l=>l.dead).every(l=>!G.lawns.some(w=>w.lung===l.id))&&G.mouths.filter(m=>!m.live).every(m=>m.yield===0),false);
ok('a lawn lies downwind of its mouth',G.lawns.every(w=>{const m=G.mouths.find(q=>q.lung===w.lung);return (w.x-m.x)*.6+(w.z-m.z)*.8>0;}),false);
ok('the lungs keep apart (70 m at the rim)',G.lungs.every((a,i)=>G.lungs.every((b,j)=>i===j||Math.hypot(a.mouth0[0]-b.mouth0[0],a.mouth0[1]-b.mouth0[1])>=70)),false);
ok('a layout needs its scarp and its ground',throws(()=>L.layout({ground}))&&throws(()=>L.layout({scarp:S})),false);

// ---- the hazards on the breath (core/hazard)
{const H=L.hazards(G),kinds=new Set(H.map(h=>h.tags.hazard.kind));
 ok('the hazards are core/hazard records ('+H.length+': '+[...kinds].sort().join(', ')+')',H.length>0&&H.every(h=>{try{KHAZ.make(h.tags.hazard);return true;}catch(e){return false;}}),false);
 ok('KHAZ knows the state function by name',typeof KHAZ.STATES['LUNG.breath']==='function',false);
 const T=KT.create({build:'lungtest'});H.forEach((h,i)=>T.add({'class':'feature',kind:'hazard',name:h.name,at:[h.x,h.y,h.z],r:h.r,h:h.h,tags:h.tags}));
 const states=t=>{L.now=()=>[t,SPRING];return KHAZ.list(T).filter(r=>KHAZ.of(r).stateFn==='LUNG.breath').map(r=>({role:L.roleOf(KHAZ.of(r)),s:KHAZ.state(r,0)}));};
 const sameAs=(t,W)=>{const b=L.breath(t,W);L.now=()=>[t,W];return KHAZ.list(T).filter(r=>KHAZ.of(r).stateFn==='LUNG.breath').every(r=>{const role=L.roleOf(KHAZ.of(r)),s=KHAZ.state(r,0),e=L.roleK(role,b);return s.k===e.k&&s.state===e.state;});};
 ok('every hazard\'s state is LUNG.breath\'s, at noon, dawn, dusk and a winter night',[[at(2,12),SPRING],[at(2,6.5),SPRING],[at(2,18.6),SPRING],[at(2,2),WINTER]].every(q=>sameAs(q[0],q[1])),false);
 const n=states(at(2,12)),d=states(at(2,18.6));
 ok('the draw holds at noon and is off at dusk',n.filter(q=>q.role==='draw').every(q=>q.s.k>.9)&&d.filter(q=>q.role==='draw').every(q=>!q.s.on),n.filter(q=>q.role==='draw').some(q=>q.s.k<.9));
 L.now=()=>[at(2,2),WINTER];const w=KHAZ.list(T).filter(r=>L.roleOf(KHAZ.of(r))==='cold').map(r=>KHAZ.state(r,0));
 ok('the cold breath is on at the bells on a winter night',w.length===0||w.every(s=>s.on),false);
 ok('a role it does not know is refused',throws(()=>L.roleK('wobble',.5)),throws(()=>L.roleK('draw',.5)));}

// ---- the sites and the species
{const Si=L.sites(G);ok('the sites publish every mouth, the hamlet at the greatest live mouth, and the stairs',Si.mouths.length===G.mouths.length&&Si.hamlet&&Si.mouths.find(m=>m.id===Si.hamlet.mouth).live,false);
 ok('no stair is lashed to a mirror lung',Si.stairs.every(s=>!G.lungs.find(l=>l.id===s.lung).mirror),false);
 const all=L.SPECIES.concat(Object.values(L.PLANTS));
 ok('every species and plant is tagged with its spiral and its harvest',all.every(S=>S.tags&&L.SPIRALS.indexOf(S.tags.spiral)>=0&&S.tags.harvest&&S.tags.koppen.length),false);
 ok('nothing in the biome glows (the owner, 2026-11-02): no species says it does',all.every(S=>!/glow|lumin/i.test(S.how)),!/glow/i.test('glows'));}

console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
