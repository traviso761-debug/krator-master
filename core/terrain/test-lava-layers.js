// node core/terrain/test-lava-layers.js — the flows a bake laid, one by one (46b-core-lava-layers.js), each check with a negative.
'use strict';
const fs=require('fs'),path=require('path');
global.window=global;
eval(fs.readFileSync(path.join(__dirname,'..','rand','08-core-rand.js'),'utf8'));
eval(fs.readFileSync(path.join(__dirname,'30-core-field.js'),'utf8'));
eval(fs.readFileSync(path.join(__dirname,'35-core-strata.js'),'utf8'));
eval(fs.readFileSync(path.join(__dirname,'46-core-lava.js'),'utf8'));
let bad=0;const ok=(name,pass,neg)=>{const r=!!pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const throws=f=>{try{f();return false;}catch(e){return true;}};
ok('without the file there is no bakeLayers (it is opt-in)',typeof KLAVA.bakeLayers==='undefined',false);
eval(fs.readFileSync(path.join(__dirname,'46b-core-lava-layers.js'),'utf8'));
/* three eruptions down one slope from the same vent: each runs over the last */
const ground=(x,z)=>-.065*z,o={h:ground,box:[0,0,1580,1580],cell:20,seed:4,dtMin:60,dtMax:60,
  eruptions:[{x:700,z:300,r:20,Q:40,duration:5*3600},{x:700,z:300,r:20,Q:30,duration:4*3600},{x:760,z:340,r:20,Q:40,duration:4*3600}]};
const A=KLAVA.bake(o),B=KLAVA.bakeLayers(o);
const same=(p,q)=>p.length===q.length&&p.every((v,i)=>v===q[i]);
ok('bakeLayers is KLAVA.bake, bit for bit (dh, age, the eruptions\' volumes)',same(A.dh,B.dh)&&same(A.age,B.age)&&A.eruptions.every((e,i)=>e.volume===B.eruptions[i].volume&&e.frozen===B.eruptions[i].frozen),!same(A.dh,B.dh));
ok('one layer an eruption',B.layers.length===3&&B.layers.every(L=>L.length===B.nx*B.nz),B.layers.length!==3);
let worst=0,stacked=0;for(let k=0;k<B.dh.length;k++){let s=0,n=0;B.layers.forEach(L=>{s+=L[k];if(L[k]>.05)n++;});worst=Math.max(worst,Math.abs(s-B.dh[k]));if(n>=2)stacked++;}
ok('the layers add up to dh (worst '+worst.toExponential(2)+')',worst<1e-3,false);
ok('flows lie on flows ('+stacked+' cells hold two or more)',stacked>10,stacked===0);
let tk=-1;for(let k=0;k<B.dh.length;k++){let n=0;B.layers.forEach(L=>{if(L[k]>.05)n++;});if(n>=2&&(tk<0||B.dh[k]>B.dh[tk]))tk=k;}
const x=B.x0+(tk%B.nx)*B.cell,z=B.z0+Math.floor(tk/B.nx)*B.cell,C=KLAVA.column(B,x,z,{ground});
ok('the column there: '+C.map(f=>'#'+f.eruption+' '+f.th.toFixed(2)+' m').join(', '),C.length>=2&&C.every((f,i)=>i===0||f.eruption>C[i-1].eruption)&&Math.abs(C[0].base-ground(x,z))<1e-9,C.length<2);
ok('each flow starts where the one below ends, and the top is the baked ground',C.every((f,i)=>i===0||Math.abs(f.base-C[i-1].top)<.05+1e-9)&&Math.abs(C[C.length-1].top-(ground(x,z)+B.dh[tk]))<.06,false);
ok('the top flow is the one age names',C[C.length-1].eruption+1===B.age[tk],C[0].eruption+1===B.age[tk]&&C.length>1);
ok('nowhere a flow reached, an empty column',KLAVA.column(B,10,1570,{ground}).length===0,false);
ok('column wants a bakeLayers result',throws(()=>KLAVA.column(A,x,z)),throws(()=>KLAVA.column(B,x,z)));
// ---- into KSTRATA: the wall shows the flows
const F=KLAVA.strata(B,x,z,{ground,thick:{at:.0001,recipe:'tibasalt-ponded'}}),S=KSTRATA.create({seed:2,formations:F,warp:[0,0],dip:[1,0,0]});
ok('one formation under the flows and one a flow, bottom up',F.length===C.length+1&&F[0].recipe==='tibasalt'&&F.slice(1).every((f,i)=>f.eruption===C[i].eruption),F.length!==C.length+1);
let hit=true;C.forEach((f,i)=>{const at=S.at(x,(f.base+f.top)/2,z);if(at.formation!==i+1)hit=false;});
ok('KSTRATA.at in each flow\'s middle names that flow\'s formation',hit,S.at(x,ground(x,z)-50,z).formation!==0);
ok('a thick flow takes the ponded recipe, a thin one the plain',KLAVA.strata(B,x,z,{ground,thick:{at:1e9,recipe:'tibasalt-ponded'}}).slice(1).every(f=>f.recipe==='tibasalt')&&F.slice(1).every(f=>f.recipe==='tibasalt-ponded'),false);
ok('a bad depth throws',throws(()=>KLAVA.strata(B,x,z,{depth:0})),false);
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
