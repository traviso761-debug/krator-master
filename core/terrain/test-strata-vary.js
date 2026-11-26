// node core/terrain/test-strata-vary.js — contacts that vary from place to place (35c-core-strata-vary.js), each check with a
// negative, and the golden vectors kstrata_vary.gd is held to (golden-strata-vary.json).
//   node core/terrain/test-strata-vary.js           'all passed'
//   node core/terrain/test-strata-vary.js --write   rewrite golden-strata-vary.json
'use strict';
const fs=require('fs'),path=require('path');
global.window=global;
eval(fs.readFileSync(path.join(__dirname,'..','rand','08-core-rand.js'),'utf8'));
eval(fs.readFileSync(path.join(__dirname,'35-core-strata.js'),'utf8'));
const K=KSTRATA,GOLD=path.join(__dirname,'golden-strata-vary.json');
let bad=0;const ok=(name,pass,neg)=>{const r=!!pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const throws=f=>{try{f();return false;}catch(e){return true;}};
const FLAT={dip:[0,0,0],warp:[0,0]};

// ---- loading it changes nothing in KSTRATA
const S=K.create(Object.assign({seed:11,formations:[{recipe:'tibasalt',base:0,top:200},{recipe:'loess',base:200,top:320},{recipe:'outland-tuff',base:320,top:420}]},FLAT));
const pr=()=>{const o=[];for(let i=0;i<60;i++){const a=S.at(i*13,i*7-30,i*-5);o.push(a.formation,a.bed,a.kind,a.colour.join());}return o.join('|');};
const before=pr();
eval(fs.readFileSync(path.join(__dirname,'35c-core-strata-vary.js'),'utf8'));
ok('loaded, a stack answers exactly as before',pr()===before,false);
const src=fs.readFileSync(path.join(__dirname,'35c-core-strata-vary.js'),'utf8').replace(/\/\/[^\n]*/g,'');
ok('the data side touches no THREE, DOM, Math.random, sin, cos, exp or pow',!/THREE|document\.|Math\.(random|sin|cos|exp|pow)\b/.test(src),!/Math\.(sin)\b/.test('Math.sin(1)'));

// ---- no contacts: the same rock everywhere
const V0=K.vary(S,{contacts:[]});
let same=true;for(let i=0;i<200;i++){const x=i*17-1500,y=(i*31)%440-10,z=i*-11+900,a=S.at(x,y,z),b=V0.at(x,y,z);if(a.formation!==b.formation||a.bed!==b.bed||a.kind!==b.kind)same=false;}
ok('with no contacts moved, V reads exactly as S',same,!same);

// ---- the loess base rises east: a plane
const V=K.vary(S,{contacts:[{at:1,by:{plane:[.05,0]}}]});
ok('the contact rides the plane: 200 at x=0, 250 at x=1000',Math.abs(V.contact(0,0,1)-200)<1e-9&&Math.abs(V.contact(1000,0,1)-250)<1e-9,Math.abs(S.yy(1000,250,0)-250)>1e-9);
ok('above the moved contact, loess; below it, basalt',V.at(1000,255,0).recipe==='loess'&&V.at(1000,245,0).recipe==='tibasalt'&&S.at(1000,245,0).recipe==='loess',V.at(1000,245,0).recipe==='loess');
ok('the loess thins as its base rises under a fixed top (120 m to 70 m)',Math.abs(V.thickness(0,0,1)-120)<1e-9&&Math.abs(V.thickness(1000,0,1)-70)<1e-9,false);
ok('each bed keeps its place in its formation: the loess top is still at 320',V.at(1000,321,0).recipe==='outland-tuff'&&V.at(1000,319,0).recipe==='loess',false);
const fr=(Vv,x,y)=>{const a=Vv.at(x,y,0);return a.yy;};
ok('the remap is monotone in height',(()=>{let p=-Infinity;for(let y=-50;y<500;y+=.5){const v=V.yy(1000,y,0);if(v<p)return false;p=v;}return true;})(),false);

// ---- a contact pushed past the next one pinches its formation out
const Vp=K.vary(S,{contacts:[{at:1,by:{plane:[.2,0]}}]});
ok('pushed past the loess top, the loess pinches out (thickness 0) and the basalt meets the tuff',Vp.thickness(1000,0,1)===0&&Vp.at(1000,315,0).recipe==='tibasalt'&&Vp.at(1000,325,0).recipe==='outland-tuff',Vp.thickness(1000,0,1)>0);
const Vdn=K.vary(S,{contacts:[{at:2,by:{d:-250}}]});
ok('pushed down past the one below, the higher contact wins: the loess is gone, the basalt cut down to 70',Vdn.thickness(0,0,1)===0&&Math.abs(Vdn.contact(0,0,1)-70)<1e-9&&Vdn.at(0,75,0).recipe==='outland-tuff'&&Vdn.at(0,65,0).recipe==='tibasalt',false);

// ---- the other terms: constant, noise, bumps, a grid
const Vn=K.vary(S,{contacts:[{at:1,by:{noise:{amp:15,wl:300}}}]});
let lo=Infinity,hi=-Infinity;for(let i=0;i<400;i++){const c=Vn.contact(i*23,i*-17,1);lo=Math.min(lo,c);hi=Math.max(hi,c);}
ok('noise moves the contact within its amplitude ('+lo.toFixed(1)+'..'+hi.toFixed(1)+')',hi-lo>10&&lo>=185-1e-9&&hi<=215+1e-9,false);
const Vb=K.vary(S,{contacts:[{at:1,by:{pts:[[0,0,40],[100,0,-20]],r:200}}]});
ok('bumps: +40 at their peak, nothing past r, normalised where they overlap',Math.abs(Vb.contact(-150,0,1)-200-40*Math.pow(1-150*150/40000,2))<1e-9&&Vb.contact(600,0,1)===200&&Vb.contact(50,0,1)<240&&Vb.contact(50,0,1)>180,false);
const G={x0:0,z0:0,step:100,nx:2,nz:2,data:[0,10,20,30]};const Vg=K.vary(S,{contacts:[{at:1,by:{grid:G,d:5}}]});
ok('a grid is bilinear and clamped at its edges; terms add',Math.abs(Vg.contact(50,50,1)-(200+15+5))<1e-9&&Math.abs(Vg.contact(-500,-500,1)-205)<1e-9,false);

// ---- drape: the loess laid 30 m under the ground, the land hilly
const ground=(x,z)=>260+40*Math.sin(x/300)*Math.cos(z/250);
const D=K.drape(S,1,ground,{box:[-600,-600,600,600],step:20,th:30,min:5}),Vd=K.vary(S,{contacts:[{at:1,by:D}]});
let worst=0;for(let i=0;i<50;i++){const x=-580+i*23,z=580-i*21;worst=Math.max(worst,Math.abs(Vd.contact(x,z,1)-(ground(x,z)-30)));}
ok('drape: the base follows the land 30 m down (worst '+worst.toFixed(2)+' m, the grid\'s bilinear error)',worst<1.5,false);
ok('so the loess sits 30 m thick over a hill and a hollow alike',Vd.at(0,ground(0,0)-25,0).recipe==='loess'&&Vd.at(0,ground(0,0)-35,0).recipe==='tibasalt'&&Vd.at(471,ground(471,0)-25,0).recipe==='loess',S.at(0,ground(0,0)-35,0).recipe==='tibasalt');
ok('min keeps the drape off the formation below',Math.min(...K.drape(S,1,()=>-500,{box:[0,0,100,100],step:50,th:0,min:5}).grid.data)===5-200,false);

// ---- with the warp and dip on, and the surface, terrace and ledge
const Sw=K.create({seed:3,formations:[{recipe:'tibasalt',base:0,top:200},{recipe:'loess',base:200,top:320}],dip:[.6,.8,.01],warp:[9,2.2]});
const Vw=K.vary(Sw,{contacts:[{at:1,by:{plane:[.03,-.02],noise:{amp:8,wl:200}}}]});
ok('with warp and dip: the world contact plus the warp is the moved stratigraphic contact',(()=>{for(let i=0;i<30;i++){const x=i*41-600,z=i*-29+300,c=Vw.contact(x,z,1);if(Vw.at(x,c+.05,z).recipe!=='loess'||Vw.at(x,c-.05,z).recipe!=='tibasalt')return false;}return true;})(),false);
const su=Vw.surface(100,150,40,.95);ok('surface, terrace and ledge read the remapped column',su.cover&&isFinite(su.wash)&&isFinite(Vw.terrace(100,40,150))&&isFinite(Vw.ledge(100,40,150,.7))&&su.varied!==0,false);

// ---- export and load
const J=JSON.parse(JSON.stringify(Vw.export())),L=K.loadVaried(J);
let eq=true;for(let i=0;i<300;i++){const x=i*7-900,y=(i*13)%340,z=i*-3+200,a=Vw.at(x,y,z),b=L.at(x,y,z);if(a.bed!==b.bed||a.kind!==b.kind||a.colour.join()!==b.colour.join()||a.yy!==b.yy)eq=false;}
ok('export then loadVaried gives the same rock, bit for bit',eq&&J.format==='krator-strata-vary',!eq);
ok('bad contacts throw (no stack, at out of range, bad grid, bad noise, bad bumps)',throws(()=>K.vary(null,{}))&&throws(()=>K.vary(S,{contacts:[{at:9}]}))&&throws(()=>K.vary(S,{contacts:[{at:1,by:{grid:{step:1,nx:2,nz:2,data:[1]}}}]}))&&throws(()=>K.vary(S,{contacts:[{at:1,by:{noise:{amp:1}}}]}))&&throws(()=>K.vary(S,{contacts:[{at:1,by:{pts:[[0,0,1]]}}]}))&&throws(()=>K.loadVaried({format:'krator-strata'})),throws(()=>K.vary(S,{contacts:[{at:1,by:{d:3}}]})));

// ---- the golden vectors for kstrata_vary.gd: Mid Basin's interbedded loess and tuff under a draped loess mantle
const Mid=K.create({seed:4711,formations:[{recipe:'tibasalt',base:0,top:300},{recipe:'outland-tuff',base:300,top:360},{recipe:'loess',base:360,top:420},{recipe:'outland-tuff',base:420,top:470},{recipe:'loess',base:470,top:560}],dip:[.6,.8,.004],warp:[6,1.5]});
const MV=K.vary(Mid,{contacts:[{at:2,by:{noise:{amp:12,wl:400,ch:2},plane:[.01,0]}},{at:3,by:{pts:[[200,100,25],[-300,-200,-15]],r:500}},{at:4,by:{grid:{x0:-400,z0:-400,step:200,nx:5,nz:5,data:[...Array(25)].map((_,i)=>((i*37)%19)-9)},d:4}}]});
const cases=[];for(let i=0;i<120;i++){const x=(i*97)%900-450,z=(i*61)%900-450,y=280+(i*29)%300,a=MV.at(x,y,z);
  cases.push({p:[x,y,z],yy:a.yy,formation:a.formation,bed:a.bed,kid:a.kid,colour:a.colour,varied:a.varied,contact:[1,2,3,4].map(k=>MV.contact(x,z,k)),thickness:[0,1,2,3,4].map(k=>MV.thickness(x,z,k))});}
const gold={format:'krator-strata-vary-golden',version:1,record:MV.export(),cases};
if(process.argv.includes('--write'))fs.writeFileSync(GOLD,JSON.stringify(gold)+'\n');
const G0=fs.existsSync(GOLD)?JSON.parse(fs.readFileSync(GOLD,'utf8')):null;
ok('golden-strata-vary.json is the module\'s output (--write rewrites it)',G0&&JSON.stringify(G0)===JSON.stringify(JSON.parse(JSON.stringify(gold))),false);

console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
