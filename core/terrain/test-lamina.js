// node core/terrain/test-lamina.js Ã¢â‚¬â€ the lamina column (35b-core-lamina.js, KSTRATA.lamina): a breath pipe's day-rings, each check
// with a broken input that must fail.
'use strict';
const fs=require('fs'),path=require('path');
global.window=global;
eval(fs.readFileSync(path.join(__dirname,'..','rand','08-core-rand.js'),'utf8'));
eval(fs.readFileSync(path.join(__dirname,'35-core-strata.js'),'utf8'));
eval(fs.readFileSync(path.join(__dirname,'35b-core-lamina.js'),'utf8'));
eval(fs.readFileSync(path.join(__dirname,'37-core-stacks.js'),'utf8'));
const K=KSTRATA;
let bad=0;const ok=(name,pass,neg)=>{const r=!!pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const throws=f=>{try{f();return false;}catch(e){return true;}};

// a Red pipe: 60 m, the glass band 150 years down, the thin years 350 years down
const O={seed:7,H:60,rate:.0003,country:'red',markers:[{kind:'glass',name:'glass-1',age:150},{kind:'thin',name:'thin years',age:350}]};
const L=K.lamina(O);
ok('loads beside KSTRATA, which keeps its recipes',typeof K.lamina==='function'&&!K.RECIPES.lamina&&K.recipe('canyon'),false);
const perYear=.0003*((365-40)+40*2.2);
ok('the column holds about H / a year\'s thickness years ('+L.years+')',Math.abs(L.years-60/perYear)<60/perYear*.12,L.years<100);
ok('its couplets are about its years times 365 ('+L.days+')',L.days>(L.years-1)*365&&L.days<=L.years*365,L.days<L.years*300);

// ---- reading a depth
const a=L.at(0),b=L.at(59.9999);
ok('depth 0 is the lip: the newest year and the last day of the pipe',a.year===0&&a.day===L.days-1&&a.daysAgo===0,b.year===0);
ok('the foot is the oldest year and the pipe\'s first days ('+b.day+')',b.year===L.years-1&&b.day<2,a.day<2);
ok('off the column is null',L.at(-.1)===null&&L.at(60.01)===null&&L.at(NaN)===null,L.at(30)===null);
let mono=true,lastDay=Infinity;for(let z=0;z<=60;z+=.0371){const p=L.at(z);if(p.day>lastDay)mono=false;lastDay=p.day;}
ok('the day only falls going down the column',mono,false);
let rt=true;for(let k=0;k<400;k++){const day=Math.floor(k*L.days/400)+L.firstDay*0,dz=L.depthOf(day);if(dz==null){rt=false;break;}const p=L.at(Math.min(60,dz+1e-7));if(!p||p.day!==day){rt=false;break;}}
ok('depthOf and at agree on 400 days (round trip)',rt,L.depthOf(L.days)!==null);
const c=L.at(10.00011);ok('a couplet is about rate thick and has two halves',c.layer==='couplet'&&Math.abs(c.thick/.0003-1)<.2&&(c.half==='a'||c.half==='b'),c.thick>.001);
let wetN=0,wetThick=true;for(let z=0;z<1;z+=.0001){const p=L.at(z);if(p.wet){wetN++;if(p.thick<.0003*1.8)wetThick=false;}}
ok('the wet season\'s couplets are thicker ('+wetN+' samples)',wetN>0&&wetThick,K.lamina({H:5,wet:false}).at(1).wet);

// ---- the markers
const glass=L.bands({kind:'marker'}).filter(x=>x.kind==='marker'),run=L.bands().filter(x=>x.kind==='run');
ok('the glass band is a layer at its year ('+(glass[0]&&glass[0].year)+')',glass.length===1&&glass[0].year===150&&Math.abs(glass[0].d1-glass[0].d0-.004)<1e-9,glass.length!==1);
const g=L.at((glass[0].d0+glass[0].d1)/2);
ok('at reads the glass layer by name, in its colour',g.layer==='marker'&&g.marker==='glass-1'&&g.colour[0]>.8,g.layer==='couplet');
ok('the thin years are one run of 40 years',run.length===1&&run[0].year===350&&run[0].name==='thin years',run.length!==1);
const aHalf=(z0,z1)=>{for(let z=z0;z<z1;z+=.00003){const p=L.at(z);if(p.half==='a'&&!p.wet)return p;}},tIn=aHalf((run[0].d0+run[0].d1)/2,run[0].d1),tOut=aHalf(run[0].d0-.06,run[0].d0);
ok('their couplets are thin and dark',tIn.thick<tOut.thick*.5&&tIn.marker==='thin years'&&tIn.colour[0]<tOut.colour[0]+.05,tOut.marker==='thin years');
const plain=K.lamina({seed:7,H:60,country:'red'});
ok('the thin years leave more years in the same height',L.years>plain.years,plain.years>=L.years);
ok('a marker by depth starts at the year holding it',K.lamina({seed:7,H:20,markers:[{kind:'glass',depth:5}]}).bands().filter(x=>x.kind==='marker')[0].d0-5<.15,false);
ok('a marker past the foot throws',throws(()=>K.lamina({H:2,markers:[{kind:'glass',age:5000}]})),throws(()=>K.lamina({H:20,markers:[{kind:'glass',age:5}]})));
ok('a marker with both age and depth, or neither, throws',throws(()=>K.lamina({H:20,markers:[{kind:'glass',age:5,depth:1}]}))&&throws(()=>K.lamina({H:20,markers:[{kind:'glass'}]})),false);

// ---- the input checks
ok('H, rate, the wet season, half, jitter and the country are checked',
  throws(()=>K.lamina({}))&&throws(()=>K.lamina({H:5,rate:0}))&&throws(()=>K.lamina({H:5,wet:{at:350,days:40}}))&&throws(()=>K.lamina({H:5,half:1}))&&
  throws(()=>K.lamina({H:5,jitter:1}))&&throws(()=>K.lamina({H:5,country:'blue'}))&&throws(()=>K.lamina({H:5,markers:[{kind:'gold',age:1}]})),
  throws(()=>K.lamina({H:5,country:'white'})));
ok('a column too tall for its rate throws instead of running away',throws(()=>K.lamina({H:1e6,rate:1e-6})),throws(()=>K.lamina({H:60})));

// ---- determinism, the seed, the country
ok('the same options are the same column',JSON.stringify(K.lamina(O).at(33.3))===JSON.stringify(L.at(33.3)),false);
{const S8=K.lamina(Object.assign({},O,{seed:8}));ok('another seed moves the years',S8.at(33.3).day!==L.at(33.3).day,false);}
const wh=K.lamina({seed:7,H:20,country:'white'}).at(5);ok('the White country is pale',wh.colour[0]>.6,L.at(5).colour[0]>.6);
ok('died counts days since the last couplet',K.lamina(Object.assign({},O,{died:1000})).at(0).daysAgo===1000&&K.lamina(Object.assign({},O,{died:1000})).at(0).day===L.days-1,L.at(0).daysAgo===1000);

// ---- the export
const J=L.export(),L2=K.laminaLoad(JSON.parse(JSON.stringify(J)));
ok('export and load give the same column',J.format==='krator-lamina'&&L2.years===L.years&&JSON.stringify(L2.at(41.2))===JSON.stringify(L.at(41.2)),throws(()=>K.laminaLoad({format:'krator-strata'}))===false);

// ---- a pipe
const P=KSTACKS.make({kind:'chimney',id:'p1',form:'pipe',x:0,z:0,H:60,r:3,y0:100,seed:4}),pp=L.atPipe(P,0,130,3);
ok('atPipe reads a standing pipe by height over its foot',pp&&Math.abs(pp.h-30)<1e-9,L.atPipe(P,0,50,3)!==null);
const F=KSTACKS.make({kind:'chimney',id:'p2',form:'pipe',x:0,z:0,H:60,r:3,y0:100,seed:4,state:'fallen',toward:[1,0]}),G=F.fall,pf=L.atPipe(F,G.ax+G.dx*20,G.ay+G.dy*20,G.az+G.dz*20);
ok('a fallen pipe is read along its axis',pf&&Math.abs(pf.h-20)<1e-6,throws(()=>L.atPipe({kind:'mesa'},0,0,0))===false);
const Br=KSTACKS.make({kind:'chimney',id:'p3',form:'pipe',x:0,z:0,H:60,r:3,y0:100,seed:4,state:'broken',cut:.5});
ok('a broken pipe keeps its whole H: its top shows older days',L.atPipe(Br,0,Br.top-.01,3).year>0,L.atPipe(P,0,P.top-.001,3).year>0);

// ---- the bake and the shader's arithmetic
const B=L.bake({res:.01}),n=Math.ceil(60/.01);
ok('the bake covers the column on rows of 256',B.W===256&&B.rows===Math.ceil(n/256)&&B.data.length===256*B.rows*4,throws(()=>L.bake({res:0}))===false);
const k=Math.floor(12.345/.01)*4,p12=L.at(12.345);
ok('a texel is the mean colour there and the couplet\'s thickness',Math.abs(B.data[k]/255-p12.colour[0])<.2&&Math.abs(B.data[k+3]/255*.0012-p12.thick)<.00002,B.data[k+3]===0);
const far=L.shade(12.345,.05,B),near1=L.shade(12.345,1e-6,B),near2=L.shade(12.345+p12.thick*.5,1e-6,B);
ok('from afar the couplets blend; close to, they part',Math.abs(far[0]-B.data[k]/255)<1e-9&&Math.abs(near1[0]-near2[0])>.01,Math.abs(near1[0]-near2[0])<1e-6);
ok('shade wants a bake',throws(()=>L.shade(1,1,{})),false);

console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
