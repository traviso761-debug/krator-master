// node biomes/gills/tests/test-gills.js â€” the Gills' shared life (biomes/gills/PLAN.md sections 3, 6, 16): the breath against the sky model's libration,
// the drift of its hour, the layouts' determinism and invariants. Each check with a broken input that must fail. No browser.
const fs=require('fs'),path=require('path'),ROOT=path.join(__dirname,'..','..','..');
global.window=global;
eval(fs.readFileSync(path.join(ROOT,'core','rand','08-core-rand.js'),'utf8')+';global.KRAND=KRAND;');
const AT=path.join(ROOT,'core','atmos'),FR=['89-atmos-0-core.js','89-atmos-0p-presets.js'].map(f=>path.join(AT,f))
 .concat(fs.readdirSync(path.join(AT,'sky')).filter(f=>/^89-atmos-.*\.js$/.test(f)).sort().map(f=>path.join(AT,'sky',f)));
eval(FR.map(f=>fs.readFileSync(f,'utf8')).join('\n')+';global.ATMOS=ATMOS;');
eval(fs.readFileSync(path.join(__dirname,'..','src','44-gills-life.js'),'utf8')+';global.GILLS=GILLS;');
const G=GILLS,A=ATMOS;
let bad=0;const ok=(name,pass,neg)=>{const r=pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
// the top of the nod by the sky's own function, day d, to a minute
const nodTop=d=>{let bt=d,bn=-2;for(let m=0;m<1440;m++){const t=d+m/1440,n=A.libration(t).nod;if(n>bn){bn=n;bt=t;}}return bt;};
// ---- the breath and the nod are one motion (the owner, 2026-11-02)
{let worst=0;for(let d=0;d<6;d++){const t=nodTop(d);worst=Math.max(worst,Math.abs(G.nodPhase(t)>.5?1-G.nodPhase(t):G.nodPhase(t))*24*60);}
 const shifted=t=>G.breathAt(((G.nodPhase(t)+.25)%1));
 ok('the out-breath\'s middle is the top of the giant\'s nod (ATMOS.libration), within 2 minutes on six days: worst '+worst.toFixed(1)+' min',worst<2&&[0,1,2,3,4,5].every(d=>G.breath(nodTop(d))===1),[0,1,2].every(d=>shifted(nodTop(d))===1));}
{let worst=0;for(let m=0;m<2880;m+=7){const t=m/1440;worst=Math.max(worst,Math.abs(G.breath(A.libration(t))-G.breath(t)));}
 let wneg=0;for(let m=0;m<2880;m+=7){const t=m/1440;wneg=Math.max(wneg,Math.abs(G.breath(A.libration(t+.2))-G.breath(t)));}
 ok('GILLS.breath(ATMOS.libration(t)) is GILLS.breath(t) (worst '+worst.toExponential(1)+')',worst<1e-6,wneg<1e-6);}
{const S=A.SKY.giant.libration;ok('the breath reads the sky\'s own constants (SID and the nod\'s phase)',Math.abs(G.NOD-S.phase)<1e-9,Math.abs(G.NOD+.1-S.phase)<1e-9);}
// ---- the shape: a 3 h plateau, an hour's ramp each side, the in-breath the rest
{const dur=th=>{let n=0;for(let m=0;m<1440;m++)if(G.breath(m/1440)>th)n++;return n/60;};
 const full=dur(.999),half=dur(.5),any=dur(.001);
 ok('the out-breath: full for ~3 h ('+full.toFixed(2)+'), over half for ~4 h ('+half.toFixed(2)+'), any at all for ~5 h ('+any.toFixed(2)+')',Math.abs(full-3)<.1&&Math.abs(half-4)<.1&&Math.abs(any-5)<.1,Math.abs(dur(-1)-3)<.1);}
{const inRange=f=>{for(let m=0;m<1440;m++){const b=f(m/1440);if(!(b>=0&&b<=1))return false;}return true;};ok('the breath stays in 0..1',inRange(G.breath),inRange(t=>G.breath(t)*2));}
// ---- the hour drifts: a sidereal day, so the breath comes ~3.9 minutes earlier each day
{const d0=G.peakHour(10),d1=G.peakHour(11),dd=((d1-d0)*60+1440*3)%1440;const drift=dd>720?dd-1440:dd;
 ok('the out-breath comes '+(-drift).toFixed(2)+' min earlier each day (a sidereal day)',Math.abs(drift+3.93)<.1,Math.abs(0+3.93)<.1);
 ok('peakHour gives the breath\'s middle',G.breath(10+d0/24)===1&&d0>=0&&d0<24,G.breath(10+(d0+12)/24)===1);}
// ---- the layouts: deterministic, keyed by stable ids, the pipes under 90 m, live pipes on live gills only, ice pipes only over the ice line
const opt={centre:[4000,-7000],band:[6400,8000],arc:[1.9,2.4],n:7,dead:2,seed:0x6111};
const L1=G.layout(opt),L2=G.layout(opt),L3=G.layout(Object.assign({},opt,{seed:7}));
ok('the swarm is the same twice from the same seed, and another seed moves it',JSON.stringify(L1)===JSON.stringify(L2)&&JSON.stringify(L1)!==JSON.stringify(L3),JSON.stringify(L1)===JSON.stringify(L3));
const gr=(x,z)=>4000+.4*(x*.496-z*.868),life=o=>G.life(L1,Object.assign({ground:gr,iceH:6000,treeH:5200,wind:[.7,.7]},o||{}));
const R1=life(),R2=life();
ok('the life on it is the same twice ('+R1.pipes.length+' pipes, '+R1.fringes.length+' fringes, '+R1.beads.length+' beads, '+R1.dew.length+' mats)',JSON.stringify(R1)===JSON.stringify(R2)&&R1.pipes.length>100,JSON.stringify(R1)!==JSON.stringify(R2));
{const ids=new Set();let dup=0;for(const k in R1)R1[k].forEach(r=>{if(ids.has(r.id))dup++;ids.add(r.id);});ok('every record has its own stable id',dup===0,false);}
const pipeOk=P=>P.every(p=>p.H<90&&p.H>0);
ok('every pipe under 90 m (tallest '+Math.max(...R1.pipes.map(p=>p.H)).toFixed(1)+')',pipeOk(R1.pipes),pipeOk(R1.pipes.concat([{H:120}])));
const liveOk=(Lg,P)=>P.every(p=>!p.live||Lg.gills.find(g=>g.id===p.gill).alive);
ok('a live pipe stands only on a live gill',liveOk(L1,R1.pipes),liveOk({gills:L1.gills.map(g=>Object.assign({},g,{alive:false}))},R1.pipes));
const iceOk=(P,h)=>P.every(p=>!p.ice||p.y0>h)&&P.every(p=>p.ice||p.y0<=h);
ok('ice pipes stand over the ice line and only there ('+R1.pipes.filter(p=>p.ice).length+' iced)',iceOk(R1.pipes,6000),iceOk(R1.pipes.map((p,i)=>i?p:Object.assign({},p,{ice:!p.ice})),6000));
{const gi=L1.gills[0],a=(gi.a0+gi.a1)/2,x=gi.c[0]+Math.cos(a)*gi.r,z=gi.c[1]+Math.sin(a)*gi.r,h=G.gillAt(L1,x,z),f=G.gillAt(L1,x+Math.cos(a)*gi.w*2,z+Math.sin(a)*gi.w*2);
 ok('gillAt finds a crack\'s floor on its line and nothing two widths off',h&&h.k>.9&&h.g===gi&&!f,!h);}
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
