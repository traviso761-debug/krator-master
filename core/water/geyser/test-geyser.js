// node core/water/geyser/test-geyser.js [--golden] - the hot spring and geyser kinds (geyser/52-core-water-geyser.js), each check with a
// broken input that must fail. The shader chunks the drawing compiles (the colour ramp, the cycle) are read as TEXT and run
// here as JavaScript (a small transliteration of the subset they use), against the CPU twins. --golden writes
// godot/tests/water/geyser_golden.json: the Old Kettle's data and the states a port replays (GEYSER_STATE).
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..','..','..');
const src=['core/rand/08-core-rand.js','core/atmos/89-atmos-0-core.js','core/atmos/89-atmos-0p-presets.js','core/water/20-core-water.js','core/water/geyser/52-core-water-geyser.js']
 .map(f=>fs.readFileSync(path.join(ROOT,f),'utf8')).join('\n');
global.window=global;eval(src+';global.ATMOS=ATMOS;global.WATER=WATER;');
const W=WATER;
let bad=0;const ok=(name,pass,neg)=>{const r=!!pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};

// GLSL text -> JavaScript: the chunks are float/vec3 functions with ifs, so only the types and the builtins change
function glslFns(text,uniforms){
 let s=text.replace(/\/\/[^\n]*/g,'').replace(/uniform [^;]*;/g,'');
 s=s.replace(/\bvec3\(([^()]*)\)/g,'[$1]');   // literals only (the ramp's constants)
 s=s.replace(/float (\w+)\(((?:float \w+,?)*)\)\{/g,(m,n,a)=>'function '+n+'('+a.replace(/float /g,'')+'){');
 s=s.replace(/vec3 (\w+)\(((?:float \w+,?)*)\)\{/g,(m,n,a)=>'function '+n+'('+a.replace(/float /g,'')+'){');
 s=s.replace(/\bfloat /g,'let ').replace(/\bvec3 /g,'let ').replace(/uCyc\.([xyzw])/g,(m,c)=>'uCyc['+'xyzw'.indexOf(c)+']');
 return s;}
const prelude='const mod=(a,b)=>a-b*Math.floor(a/b),clamp=(x,a,b)=>Math.min(b,Math.max(a,x)),pow=Math.pow,sin=Math.sin,max=Math.max,'+
 'mix=(a,b,k)=>Array.isArray(a)?a.map((v,i)=>v+(b[i]-v)*k):a+(b-a)*k;';

// ---------------------------------------------------------------- the spring
const S1=W.spring({key:'s1',name:'A hot pool',x:10,z:20,r:6,level:3,temp:.8});
ok('a spring is a still surface with a thermal record',S1.kind==='still'&&S1.thermal&&S1.poly.length===24&&W.surfaces.includes(S1));
ok('the queries read it: WATER.at and heightAt over the pool, null beside it',W.at(10,20)===S1&&W.heightAt(10,20,0)===3&&W.heightAt(60,20,0)===null);
ok('(negative) a point outside is not in it',W.at(40,20)!==S1,false);
const ramps=Object.keys(W.THERMAL.ramps);
ok('four mineral ramps, sinter first',ramps.length>=4&&ramps[0]==='sinter');
const near=(a,b,e)=>a.every((v,i)=>Math.abs(v-b[i])<e);
ok('the middle of a boiling pool is the deep stop, the cool rim the rust stop',near(W.springColour({temp:1},0),W.THERMAL.ramps.sinter.deep,1e-12)&&near(W.springColour({temp:.3},1),W.THERMAL.ramps.sinter.rust,1e-12));
ok('a cooler pool turns to the mats earlier: the rim of a .4 pool is not the rim of a 1 pool',!near(W.springColour({temp:.4},.5),W.springColour({temp:1},.5),.05));
ok('a mineral changes the colour',!near(W.springColour({temp:.8,mineral:'sulfur'},.4),W.springColour({temp:.8},.4),.05));
let tintOk=true;{const a=W.springColour({temp:.8,tint:[.5,1,1]},.3),b=W.springColour({temp:.8},.3);tintOk=a[0]<b[0]&&Math.abs(a[1]-b[1])<1e-12;}
ok('a tint multiplies the stops',tintOk);
ok('an unknown mineral throws',(()=>{try{W.spring({x:0,z:0,r:3,level:0,mineral:'cheese'});return false;}catch(e){return true;}})());
// the GLSL chunk against the twin, per ramp, with milky and a tint
{let worst=0,n=0;const cases=[['sinter',0,.9],['sulfur',0,.5],['iron',0,.2],['copper',0,1],['sinter',1,.7],[{deep:[0,0,1],blue:[0,1,1],green:[0,1,0],yel:[1,1,0],ora:[1,.5,0],rust:[1,0,0]},0,.6]];
 for(const [m,milky,temp] of cases){const js=glslFns(W.springGLSL(m),{});
  const f=new Function(prelude+'function sm(a,b,x){let t=clamp((x-a)/(b-a),0.0,1.0);return t*t*(3.0-2.0*t);}'+js+';return thmColour;')();
  for(let i=0;i<=40;i++){const t=i/40,a=f(t,temp,milky),b=W.springColour({temp,milky,mineral:typeof m==='string'?m:'custom',ramp:typeof m==='string'?null:m},t);
   for(let k=0;k<3;k++)worst=Math.max(worst,Math.abs(a[k]-b[k]));n++;}}
 ok('the colour GLSL equals springColour ('+n+' samples, worst '+worst.toExponential(1)+')',worst<1e-12);
 const js=glslFns(W.springGLSL('sinter'),{}).replace('0.78','0.6');
 const f=new Function(prelude+'function sm(a,b,x){let t=clamp((x-a)/(b-a),0.0,1.0);return t*t*(3.0-2.0*t);}'+js+';return thmColour;')();
 let w2=0;for(let i=0;i<=40;i++){const a=f(i/40,.8,0),b=W.springColour({temp:.8},i/40);for(let k=0;k<3;k++)w2=Math.max(w2,Math.abs(a[k]-b[k]));}
 ok('the colour comparison catches a changed band constant',w2>1e-3,false);}
// the steam plan
const S2=W.spring({key:'p',name:'The Great Prism',x:0,z:0,r:30,level:2,temp:.9,kind:'prismatic',milky:true});
ok('a prismatic, milky pool plans three groups of puffs; a quiet one (steam 0) none',S2.thermal.steam.map(p=>p.group).join()==='main,prism,milky'&&W.spring({x:5,z:5,r:4,level:0,steam:0}).thermal.steam.length===0);
ok('boil defaults from temp (over .9 boils)',S1.thermal.boil===0&&W.spring({x:50,z:0,r:3,level:0,temp:.95}).thermal.boil===1);

// ---------------------------------------------------------------- the geyser
const KET={key:'kettle',name:'The Old Kettle (a cone geyser)',style:'cone',vents:[[-120,-300]],top:8,H:52,period:190,pre:24,dur:32,steam:40,off:30,cone:{r:9,h:6.5},mound:{r:36,h:2.6},world:650631};
const G1=W.geyser(KET);
ok('a geyser is a surface of kind geyser that wets nothing',G1.kind==='geyser'&&W.surfaces.includes(G1)&&!G1.contains(-120,-300)&&G1.heightAt()===null&&W.at(-120,-300)===null);
{const P=190,c={};let seq=[],last=null,mx=0,col=0,rest=0,n=1900;
 for(let i=0;i<n;i++){G1.state(30+i/n*P,c);if(c.phase!==last){seq.push(c.phase);last=c.phase;}mx=Math.max(mx,c.water);if(c.phase==='column')col++;if(c.phase==='rest'&&c.water===0)rest++;}
 ok('a period runs pre, column, steam, rest',seq.join()==='pre,column,steam,rest');
 ok('the column reaches its height (>.9 of H), rests with none, and holds its share of the period',mx>.9&&rest>0&&Math.abs(col/n-32/190)<.01);
 const a=G1.state(77.7),b=G1.state(77.7+3*P);ok('the cycle is periodic',a.phase===b.phase&&Math.abs(a.water-b.water)<1e-9&&Math.abs(a.next-b.next)<1e-9);
 ok('columnTop is top + H * water',Math.abs(G1.columnTop(30+24+10)-(8+52*G1.state(30+24+10).water))<1e-12);
 ok('spray falls farther from a taller column and a fountain than a cone',G1.sprayRadius(30+24+10)>G1.ventR&&W.geyser({key:'f',x:0,z:0,style:'fountain',H:52,period:190,pre:24,dur:32,steam:40,pool:8,off:30}).sprayRadius(30+24+10)>G1.sprayRadius(30+24+10));
 ok('next counts down to the column',G1.state(30).next===24&&G1.state(30+23).next<1.001&&G1.state(30+25).next>150);}
// the cycle GLSL against the twin: cone, fountain (the same cycle), spouter
{let worst=0,n=0;
 for(const g of [G1,W.geyser({key:'b',x:0,z:0,style:'fountain',H:26,period:110,pre:14,dur:18,steam:20,off:70,pool:6}),W.geyser({key:'sp',x:0,z:0,style:'spouter',H:4,wob:3.4,pool:2})]){
  const js=glslFns(W.geyserGLSL(),{}),mk=(g2)=>new Function('uCyc','uOff','uKind','uSeed',prelude+js+';return {wat,stm};')([g2.period||60,g2.pre,g2.dur,g2.steam],g2.offAt(),g2.styleKind,g2.wob);
  const f=mk(g),c={};for(let t=-50;t<900;t+=1.37){g.state(t,c);worst=Math.max(worst,Math.abs(f.wat(t)-c.water),Math.abs(f.stm(t)-c.steam));n++;}}
 ok('the cycle GLSL (wat, stm) equals S.state ('+n+' samples, worst '+worst.toExponential(1)+')',worst<1e-12);
 const js=glslFns(W.geyserGLSL(),{}).replace('2.5','3.5'),f=new Function('uCyc','uOff','uKind','uSeed',prelude+js+';return {wat,stm};')([190,24,32,40],30,0,0);
 let w2=0;const c={};for(let t=0;t<400;t+=.7){G1.state(t,c);w2=Math.max(w2,Math.abs(f.wat(t)-c.water));}
 ok('the cycle comparison catches a changed rise time',w2>1e-3,false);}
// the kit's schedule: the Old Kettle's data (45-host-stage.js) reproduced by the kit's own cycle formula (biomes/geyser 46)
{const smooth=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);};
 const old=(g,t)=>{const P=g.period,u=((t-g.off)%P+P)%P,a=g.pre,b=a+g.dur,c=b+g.steam;if(u<a)return[.16*Math.pow(Math.max(0,Math.sin(u*1.9+Math.sin(u*.7)*2)),6)*smooth(0,a*.4,u)*(.5+.5*u/a),.15+.2*u/a];
  if(u<b){const v=u-a;return[smooth(0,2.5,v)*(1-.3*smooth(g.dur*.5,g.dur,v))*smooth(g.dur,g.dur-3,v),1];}if(u<c)return[0,.1+.9*smooth(c,b+2,u)];return[0,.1];};
 let worst=0;const c={};for(let t=0;t<1500;t+=.9){G1.state(t,c);const o=old(KET,t);worst=Math.max(worst,Math.abs(o[0]-c.water),Math.abs(o[1]-c.steam));}
 ok('the schedule equals the kit\'s old cycle for the Old Kettle (worst '+worst.toExponential(1)+')',worst<1e-12);}
// the clock offset: a number, a function (a kit sets one off now), and a hash by default
{let o=0;const g=W.geyser({key:'x',x:0,z:0,style:'cone',H:20,period:100,pre:10,dur:12,steam:10,off:()=>o,cone:{r:3,h:2},mound:{r:10,h:1}});
 const w0=g.state(50).water;o=50-10+.01;ok("a function offset moves the cycle (erupt: the column starts a hair after t)",g.state(50).phase==="pre"&&g.state(50).next<.02&&g.state(50.05).phase==="column"&&w0!==undefined);
 const h1=W.geyser({key:'jit',x:0,z:0,H:20,period:100,pre:10,dur:12,steam:10,world:7,cone:{r:3,h:2}}),h2=W.geyser({key:'jit',x:0,z:0,H:20,period:100,pre:10,dur:12,steam:10,world:7,cone:{r:3,h:2}}),h3=W.geyser({key:'jit2',x:0,z:0,H:20,period:100,pre:10,dur:12,steam:10,world:7,cone:{r:3,h:2}}),h4=W.geyser({key:'jit',x:0,z:0,H:20,period:100,pre:10,dur:12,steam:10,world:8,cone:{r:3,h:2}});
 ok('an omitted off is a hash of (world, key): the same twice, different by key and by world, inside the period',h1.offAt()===h2.offAt()&&h1.offAt()!==h3.offAt()&&h1.offAt()!==h4.offAt()&&h1.offAt()>=0&&h1.offAt()<100);
 ok('(negative) the keys give different offsets',h1.offAt()!==h3.offAt(),false);}
ok('a cone with no period throws; H must be positive',(()=>{try{W.geyser({x:0,z:0,H:10});return false;}catch(e){return true;}})()&&(()=>{try{W.geyser({x:0,z:0,H:0,style:'spouter'});return false;}catch(e){return true;}})());
// the particles
{const A=W.geyserParticles(G1),B=W.geyserParticles(G1),bg=G1.budget();let same=A.count===B.count&&A.pos.every((v,i)=>v===B.pos[i])&&A.aS.every((v,i)=>v===B.aS[i]);
 ok('the particles are deterministic (a hash of world, key, class, index)',same);
 const G2=W.geyser(Object.assign({},KET,{key:'kettle2'}));const C=W.geyserParticles(G2);
 ok('another key draws other randoms; the world seeds them',C.aS[0]!==A.aS[0]&&W.geyserParticles(W.geyser(Object.assign({},KET,{key:'kettle',world:5}))).aS[0]!==A.aS[0]);
 ok('the budget sets the counts (drops, steam, mist) and none is NaN',A.count===bg.drops+bg.steam+bg.mist&&!A.pos.some(Number.isNaN)&&!A.aS.some(Number.isNaN));
 let inR=true;for(let i=0;i<A.count;i++)if(Math.abs(A.pos[i*3]-(-120))>G1.ventR+1e-6||Math.abs(A.pos[i*3+2]-(-300))>G1.ventR+1e-6)inR=false;
 ok('every particle starts within the vent\'s radius, at the vent\'s top',inR&&A.pos[1]===8);
 let u01=true;for(const v of A.aS.slice(0,3000))if(v<0||v>=10)u01=false;ok('randoms are in range',u01);
 const tw=W.geyser({key:'tw',x:0,z:0,style:'cone',H:17,period:70,pre:8,dur:12,steam:12,off:10,vents:[[-3,2],[5,-4]],top:3,top2:4.5,cone:{r:3.6,h:2.3},mound:{r:15,h:.9}}),T=W.geyserParticles(tw);
 let t1=0,t2=0;for(let i=0;i<T.count;i++){if(T.pos[i*3+1]===3)t1++;if(T.pos[i*3+1]===4.5)t2++;}ok('twin vents: half the particles on each top',t1>0&&Math.abs(t1-t2)<=2);}
// export
{const X=W.export(),j=JSON.parse(JSON.stringify(X));
 ok('WATER.export lists every surface; a spring carries its thermal record, a geyser its whole record',X.surfaces.length===W.surfaces.length&&X.surfaces.every((o,i)=>o.kind===W.surfaces[i].kind)&&
  X.surfaces[S1.id].thermal&&X.surfaces[S1.id].thermal.temp===.8&&X.surfaces[G1.id].period===190&&X.surfaces[G1.id].off===30&&X.surfaces[G1.id].vents[0][0]===-120);
 ok('the export is plain data (it survives JSON)',JSON.stringify(j)===JSON.stringify(X));
 ok('geyserRecords lists the geysers',W.geyserRecords().some(r=>r.key==='kettle'&&r.H===52));}
// the golden (GEYSER_STATE)
{const kit=W.geyser(Object.assign({},KET,{key:'kettle-golden'})),gold=W.geyserGolden().find(g=>g.key==='kettle-golden');
 ok('the golden samples the cycle through a period',gold&&gold.samples.length===7&&gold.samples.some(s=>s[1]==='column')&&gold.samples.some(s=>s[1]==='rest'));
 if(process.argv.includes('--golden')){const keep=['kettle-golden'],out={format:'krator-geyser-state',version:1,note:'WATER.geyser twin: S.state(t) -> [t, phase, water, steam, next, columnTop]; u = ((t - off) mod period); see core/water/README.md GEYSER_STATE',
   geysers:W.geyserRecords().filter(r=>keep.includes(r.key)),samples:W.geyserGolden().filter(g=>keep.includes(g.key)),
   spring:{record:W.export().surfaces[S1.id].thermal,colours:[0,.25,.5,.75,1].map(t=>[t,W.springColour(S1,t)])}};
  const dir=path.join(ROOT,'godot','tests','water');fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'geyser_golden.json'),JSON.stringify(out,null,1)+'\n');console.log('wrote godot/tests/water/geyser_golden.json');}}
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
