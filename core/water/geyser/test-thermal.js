// node core/water/geyser/test-thermal.js - the geothermal surfaces (geyser/52c-core-water-thermal.js, 52d draw): mud pots, fumaroles, their
// aprons; each check with a broken input that must fail. The shader chunks (mudH, fumSteam, thmMat) are run as TEXT in glsl-interp.js against
// the CPU twins. First: loading the two fragments moves nothing (the export and the queries of a scene made without them are the same after).
require('../../shader/06-core-khook.js');require('../../shader/06b-core-kcolor.js');
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..','..','..');
const {glslProgram}=require('../glsl-interp.js');
const rd=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
global.window=global;
eval(['core/rand/08-core-rand.js','core/terrain/47-core-therm.js','core/atmos/89-atmos-0-core.js','core/atmos/89-atmos-0p-presets.js','core/water/20-core-water.js','core/water/22-core-water-flow.js',
 'core/water/geyser/52-core-water-geyser.js','core/water/geyser/52b-core-water-geyser-draw.js'].map(rd).join('\n')+';global.ATMOS=ATMOS;global.WATER=WATER;');
const W=WATER;
let bad=0;const ok=(name,pass,neg)=>{const r=!!pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const throws=f=>{try{f();return false;}catch(e){return true;}};

// ---------------------------------------------------------------- loading moves nothing
const SP=W.spring({key:'sp',name:'A hot pool',x:0,z:0,r:6,level:3,temp:.8}),GY=W.geyser({key:'g',name:'A cone',x:200,z:0,style:'cone',H:30,period:100,pre:10,dur:20,steam:20,off:5,cone:{r:4,h:2},mound:{r:20,h:1}});
const ST=W.still({name:'A trough',level:1,bounds:[40,40,44,44]});
const X0=JSON.stringify(W.export()),Q0=[[0,0],[42,42],[300,300],[3,1]].map(p=>[W.at(p[0],p[1]),W.heightAt(p[0],p[1],7)]);
eval(['core/water/geyser/52c-core-water-thermal.js','core/water/geyser/52d-core-water-thermal-draw.js'].map(rd).join('\n'));
ok('loading 52c and 52d moves no export and no query of a scene made without them',JSON.stringify(W.export())===X0&&[[0,0],[42,42],[300,300],[3,1]].every((p,i)=>W.at(p[0],p[1])===Q0[i][0]&&W.heightAt(p[0],p[1],7)===Q0[i][1]));
{const mud0=W.mudpot;eval(rd('core/water/geyser/52c-core-water-thermal.js'));ok('loading 52c twice is a no-op (the same functions)',W.mudpot===mud0,W.mudpot!==mud0);}
ok('52d throws clearly without 52b (a fresh WATER with 52c only)',(()=>{try{new Function('WATER','KRAND',rd('core/water/geyser/52d-core-water-thermal-draw.js'))({mudpot:()=>0},KRAND);return false;}catch(e){return/52b/.test(e.message);}})());
ok('52c throws clearly without core/rand',(()=>{try{new Function('WATER','KRAND',rd('core/water/geyser/52c-core-water-thermal.js'))({surfaces:[]},undefined);return false;}catch(e){return/core\/rand/.test(e.message);}})());

// ---------------------------------------------------------------- the mud pot
const M1=W.mudpot({key:'pot1',name:'A mud pot',x:60,z:-20,r:2.4,level:5,temp:.8,thick:.5,world:41});
ok('a mud pot is a surface of kind mud with its slots (3 for a pot), each with 8 hashed places',M1.kind==='mud'&&W.surfaces.includes(M1)&&M1.slots.length===3&&M1.slots.every(L=>L.table.length===8&&L.per>0));
ok('WATER.at answers it inside, not outside; heightAt is level + its surface',W.at(60,-20)===M1&&W.at(60,-17)!==M1&&Math.abs(W.heightAt(60.3,-20.2,4.1)-(5+M1.surfaceAt(60.3,-20.2,4.1)))<1e-12&&W.heightAt(60,-17,0)===null);
{const P2=W.still({name:'A pool over the pot',level:9,bounds:[59,-21,61,-19]});ok('a still pool over a mud pot is still answered first',W.at(60,-20)===P2,W.at(60,-20)===M1);W.surfaces.splice(W.surfaces.indexOf(P2),1);}
{const a=W.mudpot({key:'pot1',x:60,z:-20,r:2.4,level:5,world:41}),b=W.mudpot({key:'pot2',x:60,z:-20,r:2.4,level:5,world:41}),c=W.mudpot({key:'pot1',x:60,z:-20,r:2.4,level:5,world:42});
 const same=JSON.stringify(a.slots)===JSON.stringify(M1.slots);
 ok('the slots are a hash of (world, key): made later, after other surfaces, the same; another key or world differs (a tile built alone shows the same bursts)',same&&JSON.stringify(b.slots)!==JSON.stringify(a.slots)&&JSON.stringify(c.slots)!==JSON.stringify(a.slots));
 ok('(negative) the keys give different places',JSON.stringify(b.slots)!==JSON.stringify(a.slots),false);
 [a,b,c].forEach(S=>W.surfaces.splice(W.surfaces.indexOf(S),1));}
{let inR=true,size=true;for(const L of M1.slots)for(const e of L.table){if(Math.hypot(e[0],e[1])>.62*2.4+1e-9)inR=false;if(!(e[2]>0&&e[2]<=.45*2.4&&e[3]>0))size=false;}
 ok('every bubble place lies within .62 r, its size within .45 r',inR&&size);}
// the GLSL against the twin
{const MU=W.mudUniforms(M1),P=glslProgram(W.mudGLSL(),MU);let worst=0,n=0,mx=0;
 for(let t=-3.7;t<40;t+=.53)for(const [dx,dz] of [[0,0],[.3,-.2],[-.9,.4],[1.2,1.1],[.05,-1.4],[2.2,.3],[1.9,-1.3]]){const a=P.run('mudH',[dx,dz],t),b=M1.surfaceAt(60+dx,-20+dz,t);worst=Math.max(worst,Math.abs(a-b));mx=Math.max(mx,Math.abs(b));n++;}
 ok('the mud GLSL (mudH) equals S.surfaceAt ('+n+' samples, worst '+worst.toExponential(1)+', the surface moving up to '+mx.toFixed(2)+' m)',worst<1e-12&&mx>.1);
 const P2=glslProgram(W.mudGLSL().replace('0.35+0.65','0.3+0.65'),MU);let w2=0;for(let t=0;t<20;t+=.37)for(const [dx,dz] of [[.3,-.2],[-.9,.4]])w2=Math.max(w2,Math.abs(P2.run('mudH',[dx,dz],t)-M1.surfaceAt(60+dx,-20+dz,t)));
 ok('the mud comparison catches a changed bubble radius',w2>1e-6,false);}
ok('the mud is still at the rim and beyond it',Math.abs(M1.surfaceAt(62.4,-20,3.3))<1e-12&&M1.surfaceAt(70,-20,3.3)===0&&Math.abs(M1.surfaceAt(62.39,-20,3.3))<1e-3);
// bursts
{const ev=M1.burstEvents(0,60),exp=M1.slots.reduce((a,L)=>a+60/L.per,0);
 ok('burstEvents gives every pop in the window ('+ev.length+', expected about '+exp.toFixed(1)+'), in time order',Math.abs(ev.length-exp)<=M1.slots.length&&ev.every((e,i)=>!i||ev[i-1].t<=e.t)&&ev.every(e=>e.t>=0&&e.t<60));
 const e=ev[3],before=M1.bursts(e.t-1e-6)[e.slot],after=M1.bursts(e.t+1e-6)[e.slot];
 ok('at a pop the slot turns from swelling to popped, at the event\'s place',!before.popped&&after.popped&&before.cycle===e.cycle&&after.cycle===e.cycle&&Math.abs(after.x-e.x)<1e-12&&before.grow>.99&&Math.abs(before.next)<1e-5);
 const top=M1.surfaceAt(e.x,e.z,e.t-.02),lo=M1.surfaceAt(e.x,e.z,e.t-.8*M1.slots[e.slot].per);
 ok('the bubble stands highest just before it pops ('+top.toFixed(3)+' m, '+lo.toFixed(3)+' m earlier in its cycle)',top>lo&&top>.5*e.amp);
 ok('(negative) a window with nothing in it has no pops',M1.burstEvents(10,10).length===0&&ev.length>0);
 ok('S.state gives the swell and the bursts',typeof M1.state(3).swell==='number'&&M1.state(3).bursts.length===3);}
{const C=W.mudpot({key:'volcano',x:0,z:300,r:2,level:12,kind:'cone',world:41}),F=W.mudpot({key:'flat',x:0,z:400,r:14,level:1,kind:'field',world:41});
 ok('a cone has its flank record and two slots in the crater (.3 r); a field 4 to 8 smaller ones',C.cone&&C.cone.r===2*2.6&&C.slots.length===2&&C.slots.every(L=>L.table.every(e=>Math.hypot(e[0],e[1])<=.6+1e-9))&&F.slots.length>=4&&F.slots.length<=8);
 ok('a bad kind, no level or no radius throws',throws(()=>W.mudpot({x:0,z:0,r:1,level:0,kind:'lake'}))&&throws(()=>W.mudpot({x:0,z:0,r:1}))&&throws(()=>W.mudpot({x:0,z:0,r:0,level:0})));
 ok('thicker mud bubbles slower',W.mudpot({key:'q',x:0,z:0,r:2,level:0,thick:1}).slots[0].per>W.mudpot({key:'q',x:0,z:0,r:2,level:0,thick:0}).slots[0].per);}

// ---------------------------------------------------------------- the fumarole
const slope=(x,z)=>20-.12*x+.02*Math.sin(z*.05);   /* a hillside falling east */
const bowl=(x,z)=>.004*((x-500)*(x-500)+(z-500)*(z-500));   /* a basin round (500, 500) */
const F1=W.fumarole({key:'fum1',name:'A fumarole',x:10,z:5,r:1.5,rate:1,period:9,ground:slope,world:41});
ok('a fumarole is a surface of kind fumarole that wets nothing, at the ground\'s height',F1.kind==='fumarole'&&W.surfaces.includes(F1)&&!F1.contains(10,5)&&F1.heightAt()===null&&Math.abs(F1.y-slope(10,5))<1e-12);
{const c={},a=F1.state(13.3),b=F1.state(13.3+9*4);let lo=9,hi=0;for(let t=0;t<9;t+=.05){F1.state(t,c);lo=Math.min(lo,c.steam);hi=Math.max(hi,c.steam);}
 ok('the steam puffs on its period, between base x rate and rate ('+lo.toFixed(2)+' .. '+hi.toFixed(2)+')',Math.abs(a.steam-b.steam)<1e-9&&Math.abs(lo-.35)<.01&&hi>.98&&hi<=1+1e-12);
 const s0=W.fumarole({key:'steady',x:0,z:0,period:0,rate:.7});ok('period 0 is steady',s0.state(3).steam===.7&&s0.state(77).steam===.7);
 const o1=W.fumarole({key:'h',x:0,z:0,world:3}),o2=W.fumarole({key:'h',x:0,z:0,world:3}),o3=W.fumarole({key:'h2',x:0,z:0,world:3});
 ok('the clock offset is a hash of (world, key)',o1.off===o2.off&&o1.off!==o3.off&&o1.off>=0&&o1.off<9);
 [s0,o1,o2,o3].forEach(S=>W.surfaces.splice(W.surfaces.indexOf(S),1));}
{const P=glslProgram(W.fumGLSL(),{uFum:W.fumUniform(F1)});let worst=0;const c={};for(let t=-20;t<100;t+=.41){F1.state(t,c);worst=Math.max(worst,Math.abs(P.run('fumSteam',t)-c.steam));}
 const S0=W.fumarole({key:'st0',x:0,z:0,period:0,rate:.6}),P0=glslProgram(W.fumGLSL(),{uFum:W.fumUniform(S0)});
 ok('the steam GLSL (fumSteam) equals S.state (worst '+worst.toExponential(1)+'), steady too',worst<1e-12&&P0.run('fumSteam',12)===.6);
 const P2=glslProgram(W.fumGLSL().replace('0.7,u','0.6,u'),{uFum:W.fumUniform(F1)});let w2=0;for(let t=0;t<30;t+=.41){F1.state(t,c);w2=Math.max(w2,Math.abs(P2.run('fumSteam',t)-c.steam));}
 ok('the steam comparison catches a changed puff',w2>1e-4,false);W.surfaces.splice(W.surfaces.indexOf(S0),1);}
// the run-off
{const R=F1.runoff,p=R&&R.flow.pts;let down=!!p;if(p)for(let i=1;i<p.length;i++)if(!(p[i][2]<p[i-1][2]))down=false;
 ok('the run-off runs downhill from the vent ('+(p?p.length:0)+' points, '+(R?R.length:0)+' m, '+(R&&R.why)+'), east on a hill falling east',R&&down&&p[0][0]===10&&p[p.length-1][0]>p[0][0]+30&&R.why==='length'&&R.length<=60+1e-9);
 const FB=W.fumarole({key:'inbowl',x:470,z:500,ground:bowl,runoffLen:200}),pb=FB.runoff.flow.pts,end=pb[pb.length-1];
 ok('...and stops in a basin ('+FB.runoff.why+' after '+FB.runoff.length+' m, '+Math.hypot(end[0]-500,end[1]-500).toFixed(1)+' m from its floor)',FB.runoff.why==='basin'&&Math.hypot(end[0]-500,end[1]-500)<3);
 const fl=W.flow(R.flow);ok('its flow arguments make a WATER.flow on the line',fl.kind==='flow'&&fl.pts.length===p.length&&fl.contains(p[3][0],p[3][1]));W.surfaces.splice(W.surfaces.indexOf(fl),1);
 ok('the stain is a mineral record along the same line, wider; no ground, no run-off',R.stain.kind==='stain'&&R.stain.mineral==='sulfur'&&R.stain.pts.length===p.length&&R.stain.width>R.flow.width&&W.fumarole({key:'ng',x:0,z:0}).runoff===null);
 W.surfaces.splice(W.surfaces.indexOf(FB),1);W.surfaces.pop();}
{const A=W.fumaroleParticles(F1),B=W.fumaroleParticles(F1);let inR=true;for(let i=0;i<A.count;i++)if(Math.abs(A.pos[i*3]-10)>.75+1e-6||Math.abs(A.pos[i*3+2]-5)>.75+1e-6)inR=false;
 ok('the steam particles are deterministic, as many as the budget, within half the vent\'s radius',A.count===F1.budget()&&A.pos.every((v,i)=>v===B.pos[i])&&A.aS.every((v,i)=>v===B.aS[i])&&inR&&!A.aS.some(Number.isNaN));
 const F2=W.fumarole({key:'fum2',x:10,z:5}),C=W.fumaroleParticles(F2);ok('(negative) another key draws other randoms',C.aS[0]!==A.aS[0]);W.surfaces.splice(W.surfaces.indexOf(F2),1);}

// ---------------------------------------------------------------- the mats' colour
{const P=glslProgram(W.matGLSL('sinter'),{});let worst=0;for(let T=0;T<=100;T+=.7){const a=P.run('thmMat',T),b=W.matColour(T,'sinter');for(let k=0;k<3;k++)worst=Math.max(worst,Math.abs(a[k]-b[k]));}
 const P2=glslProgram(W.matGLSL('iron'),{});let w3=0;for(let T=0;T<=100;T+=1.3){const a=P2.run('thmMat',T),b=W.matColour(T,'iron');for(let k=0;k<3;k++)w3=Math.max(w3,Math.abs(a[k]-b[k]));}
 ok('the mats GLSL (thmMat) equals WATER.matColour, sinter and iron ramps (worst '+Math.max(worst,w3).toExponential(1)+')',worst<1e-12&&w3<1e-12);
 const P3=glslProgram(W.matGLSL('sinter').replace('48.0','40.0'),{});let w2=0;for(let T=0;T<=100;T+=.7){const a=P3.run('thmMat',T),b=W.matColour(T,'sinter');for(let k=0;k<3;k++)w2=Math.max(w2,Math.abs(a[k]-b[k]));}
 ok('the mats comparison catches a moved band',w2>1e-3,false);
 const R=W.THERMAL.ramps.sinter,near=(a,b)=>a.every((v,i)=>Math.abs(v-b[i])<1e-9),c90=W.matColour(90),c72=W.matColour(72),c60=W.matColour(60),c48=W.matColour(48),c20=W.matColour(20);
 ok('the bands: white over 80 C, the ramp\'s yellow at 72, orange at 60, green at 48, near black at the cool rim',near(c90,W.MATS.bare)&&near(c72,R.yel)&&near(c60,R.ora)&&near(c48,R.green)&&near(c20,W.MATS.black));}

// ---------------------------------------------------------------- the aprons
{const S2=W.spring({key:'warm',name:'A warm pool',x:-300,z:0,r:5,level:2,temp:.55}),M2=W.mudpot({key:'pot9',x:-300,z:200,r:2,level:1});
 const A=W.thermalAprons({springs:[SP,S2],geysers:[GY],fumaroles:[F1],mudpots:[M2],world:41,name:'The test basin'});
 const by=k=>A.aprons.find(r=>r.key===k);
 ok('one apron per source: sinter round the geyser and the .8 pool, mats round the cooler pool, sulfur round the fumarole, clay round the mud pot',
  by('g:sinter')&&by('sp:mat')&&by('warm:mat')&&by('fum1:sulfur')&&by('pot9:clay')&&A.aprons.length===5,by('sp:sinter'));
 const sp=A.aprons.find(r=>r.source.key==='sp');ok('the .8 pool (under .85, no boil) has a mat apron',sp&&sp.kind==='mat');
 const g=by('g:sinter'),w0=A.apronAt(204,0),wF=A.apronAt(260,0);
 ok('the geyser\'s sinter is whole near the cone and gone past its ring ('+w0.sinter.toFixed(2)+', '+wF.sinter.toFixed(2)+')',w0.sinter===1&&wF.sinter===0&&g.ring.length===32&&g.r1===25);
 const temps=[5.5,6.5,7.5,8.5,9.5].map(d=>A.apronAt(-300+d,0).T);let fall=true;for(let i=1;i<temps.length;i++)if(!(temps[i]<temps[i-1]))fall=false;
 ok('without a field the temperature falls across the warm pool\'s apron ('+temps.map(v=>v.toFixed(0)).join(', ')+' C)',fall&&Math.abs(A.apronAt(-300,0).T-(30+63*.55))<1e-9&&A.apronAt(-200,0).T===12);
 const band=[];for(let d=5;d<14;d+=.25){const w=A.apronAt(-300+d,0);band.push([d,w.mat,w.T]);}
 const mx=Math.max(...band.map(b=>b[1])),at=band.find(b=>b[1]===mx);
 ok('the mats grow in their band across the apron (most '+mx.toFixed(2)+' at '+at[2].toFixed(0)+' C), not past the ring',mx>.5&&at[2]>18&&at[2]<73&&A.apronAt(-300+20,0).mat===0);
 const boil=W.spring({key:'boil',x:-600,z:0,r:4,level:0,temp:1}),A2=W.thermalAprons({springs:[{S:boil,apron:'mat'}],world:41}),wb=A2.apronAt(-600+4.2,0);
 ok('over ~75 C the wet ground is bare sinter, no mat ('+wb.T.toFixed(0)+' C: sinter '+wb.sinter.toFixed(2)+', mat '+wb.mat.toFixed(2)+')',wb.T>80&&wb.sinter>.9&&wb.mat<1e-9);
 const wf=A.apronAt(11,5),wm=A.apronAt(-300,201);
 ok('the fumarole\'s sulfur crust and the mud pot\'s clay',wf.sulfur===1&&wm.clay===1&&wf.clay===0&&wm.sulfur===0);
 const p=F1.runoff.stain.pts[15],wr=A.apronAt(p[0],p[1]);
 ok('its run-off is wet and stained along the line ('+wr.sulfur.toFixed(2)+' sulfur, mat '+wr.mat.toFixed(2)+' at '+wr.T.toFixed(0)+' C), and nothing 10 m off it',wr.wet===1&&wr.sulfur>.3&&wr.mat>0&&A.apronAt(p[0],p[1]+10).wet===0);
 // with a KTHERM field: the bands read the ground's temperature
 const H=KTHERM.create({soil:12,vents:A.thermVents(),detail:{amp:0}}),AT=W.thermalAprons({springs:[S2],therm:H,world:41}),AF=W.thermalAprons({springs:[S2],therm:H.bake({box:[-330,-30,-270,30],cell:2}),world:41});
 const q=[-293,1];ok('with a KTHERM field the temperature is the ground\'s (heatAt '+H.heatAt(q[0],q[1]).toFixed(1)+' C), a baked raster too, and the mats follow it',
  AT.apronAt(q[0],q[1]).T===H.heatAt(q[0],q[1])&&Math.abs(AF.apronAt(q[0],q[1]).T-H.heatAt(q[0],q[1]))<2&&AT.apronAt(q[0],q[1]).T!==A.apronAt(q[0],q[1]).T);
 ok('a therm that is neither throws; so does an unknown apron kind',throws(()=>W.thermalAprons({springs:[S2],therm:{}}))&&throws(()=>W.thermalAprons({springs:[{S:S2,apron:'tar'}]})));
 // the bake
 const F=A.bake({box:[-320,-20,-280,20],cell:4}),w=A.apronAt(-300+8,-20+16);
 ok('the bake holds the weights as bytes on nodes ('+F.nx+' x '+F.nz+'); apronFieldAt reads one back',F.nx===11&&F.nz===11&&F.data.length===11*11*4&&Math.abs(W.apronFieldAt(F,'mat',-292,-4)-Math.round(w.mat*255)/255)<1e-12&&W.apronFieldAt(F,'matT',-300,0)>.4);
 ok('(negative) a fifth channel throws',throws(()=>A.bake({box:[0,0,8,8],channels:['sinter','mat','matT','clay','sulfur']})));
 // the aprons are deterministic and drawn out downhill on a slope
 const SS=W.spring({key:'hill',x:100,z:600,r:4,level:slope(100,600),temp:.6}),D1=W.thermalAprons({springs:[SS],ground:slope,world:41}).aprons[0],D2=W.thermalAprons({springs:[SS],ground:slope,world:41}).aprons[0],D0=W.thermalAprons({springs:[SS],world:41}).aprons[0];
 const mean=c=>{let s=0;for(let k=-4;k<=4;k++)s+=D1.radii[(c+k+32)%32];return s/9-D1.r0;},east=mean(0),west=mean(16);
 ok('an apron is a hash of (world, key) and runs out farther downhill ('+east.toFixed(1)+' m east, '+west.toFixed(1)+' m west on a hill falling east)',JSON.stringify(D1)===JSON.stringify(D2)&&east>west*1.25&&D1.down[0]>.99&&D0.down===null);
 // travertine and WATER.terraces
 eval(rd('core/water/ext/53-core-water-terraces.js'));
 const TV=W.thermalAprons({springs:[{S:SS,apron:'travertine',step:.5}],ground:slope,world:41}).aprons[0],TA=TV.terraces;let desc=TA&&TA.levels.every((v,i)=>!i||v<TA.levels[i-1]);
 ok('a travertine apron on a slope hands WATER.terraces its arguments ('+(TA?TA.levels.length:0)+' treads stepping .5 m)',TV.kind==='travertine'&&TA&&desc&&TA.levels.length>=3&&TA.weights.length===TA.levels.length&&Math.abs(TA.levels[0]-TA.levels[1]-.5)<1e-9);
 let TT=null;try{TT=W.terraces(TA);}catch(e){console.log('  terraces: '+e.message);}
 ok('...and WATER.terraces builds them: a pool per tread, a fall per riser',TT&&TT.pools.length===TA.levels.length&&TT.falls.length===TA.levels.length-1);
 ok('(negative) flat ground gives no terraces',W.thermalAprons({springs:[{S:SS,apron:'travertine'}],ground:()=>5,world:41}).aprons[0].terraces===null);
 ok('thermVents are KTHERM\'s vent records',A.thermVents().every(v=>v.T>0&&v.reach>0&&(v.kind==='point'||v.pts.length>=2)));
 // export
 const X=W.export(),j=JSON.parse(JSON.stringify(X)),xm=X.surfaces[M1.id],xf=X.surfaces[F1.id];
 ok('WATER.export lists a mud pot with its slots, a fumarole with its run-off, the aprons as a group; plain data',xm.kind==='mud'&&xm.slots.length===3&&xm.slots[0].table.length===8&&xm.law&&xf.kind==='fumarole'&&xf.runoff.flow.pts.length>2&&
  X.groups&&X.groups.some(g=>g.kind==='aprons'&&g.aprons.length===5)&&JSON.stringify(j)===JSON.stringify(X));}

// ---------------------------------------------------------------- the drawings, on a three.js stub (no GPU: not judged by eye)
{class V{constructor(...a){this.a=a;['x','y','z','w'].forEach((k,i)=>this[k]=a[i]);}normalize(){return this;}}
 class Color{constructor(r,g,b){this.r=r;this.g=g;this.b=b;}}
 class BG{constructor(){this.attributes={};}setAttribute(k,v){this.attributes[k]=v;}setIndex(i){this.index=i;}computeVertexNormals(){}}
 class F32{constructor(a,n){this.array=Float32Array.from(a);this.itemSize=n;}}
 class Mat{constructor(o){Object.assign(this,o);this.userData={};}}
 class Mesh{constructor(g,m){this.geometry=g;this.material=m;this.userData={};}}
 const T3={Vector2:V,Vector3:V,Vector4:V,Color,BufferGeometry:BG,Float32BufferAttribute:F32,ShaderMaterial:Mat,MeshStandardMaterial:Mat,Mesh,Points:Mesh,
  UniformsUtils:{merge:a=>Object.assign({},...a.map(u=>JSON.parse(JSON.stringify(u))))},UniformsLib:{fog:{fogColor:{value:null},fogDensity:{value:0}}}};
 const scene={children:[],add(m){this.children.push(m);}},U={};ATMOS.hooks=ATMOS.hooks||[];
 const D=W.drawMudpot(M1,{THREE:T3,scene,uniforms:U}),m=D.material,C=W.drawMudpot(W.mudpot({key:'vol2',x:0,z:0,r:2,level:3,kind:'cone'}),{THREE:T3,uniforms:U});
 const pos=D.mesh.geometry.attributes.position.array;let flat=true,inR=true;for(let i=0;i<pos.length;i+=3){if(pos[i+1]!==5)flat=false;if(Math.hypot(pos[i]-60,pos[i+2]+20)>2.4+1e-4)inR=false;}
 ok('drawMudpot: a disc at the level within r, its uniforms the record\'s (64 places, 8 slots), its shader the mudH text; a cone gets its flank',scene.children[0]===D.mesh&&flat&&inR&&
  m.uniforms.uMB.value.length===64&&m.uniforms.uMS.value[0].x===M1.slots[0].per&&m.uniforms.uMS.value[3].z===0&&m.vertexShader.includes(W.mudGLSL())&&m.uniforms.uT===U.uT&&D.cone===null&&C.cone&&C.cone.geometry.attributes.position.array.length>0&&D.tris>100);
 const E=W.drawFumarole(F1,{THREE:T3,scene,uniforms:U});
 ok('drawFumarole: one Points of the particles, the cycle\'s uniform, the fumSteam text',E.count===F1.budget()&&E.points.userData.probeSkip&&E.material.uniforms.uFum.value.x===9&&E.material.vertexShader.includes(W.fumGLSL()));
 ok('(negative) drawing a spring as a mud pot throws',throws(()=>W.drawMudpot(SP,{THREE:T3})));}
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
