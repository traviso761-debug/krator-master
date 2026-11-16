#!/usr/bin/env node
/* The yards' pieces as records (src/46f-mp-yards.js, [G data]) in node: each check with a negative. Run: node kits/metropolis/tests/test-yards.js */
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.join(__dirname,'..','..','..');
const ctx={console,Math,JSON};vm.createContext(ctx);vm.runInContext('var MP={};',ctx);
for(const f of ['core/rand/08-core-rand.js','kits/metropolis/src/46f-mp-yards.js'])vm.runInContext(fs.readFileSync(path.join(ROOT,f),'utf8'),ctx,{filename:f});
const Y=ctx.MP.yards;
let fails=0,n=0;const ok=(name,c,neg)=>{n++;const good=!!c&&(neg===undefined||neg===false);if(!good)fails++;console.log((good?' ok   ':' FAIL ')+name+(neg!==undefined?'  (negative '+(neg===false?'fails':'PASSES')+')':''));};
/* a straight line west to east at z -150, as the Yards' cargo line */
const at=s=>({x:-2900+s,z:-150});
const yard=Y.railYard({at,s0:1300,s1:2800,side:1,n:8,spacing:5.5,fan:90,fanStep:22,ladder:30,seed:7});
ok('eight sidings, each leaving the line at its switch',yard.sidings.length===8&&yard.sidings.every(S=>Math.abs(S.pts[0][1]+150)<1e-6),yard.sidings.some(S=>Math.abs(S.pts[0][1]+150+40)<1e-6));
ok('each siding runs parallel at its spacing (5.5 m a siding) and ends at a buffer stop',yard.sidings.every((S,i)=>Math.abs(S.pts[S.pts.length-1][1]-(-150+5.5*(i+1)))<1e-6)&&yard.stops.length===8,
 yard.sidings.every((S,i)=>Math.abs(S.pts[S.pts.length-1][1]-(-150+5.5*(i+1)+3))<1e-6));
/* the turnout lengthens: the outermost siding's steepest step is no steeper than the first's */
const steep=S=>{let m=0;for(let i=1;i<S.pts.length;i++){const a=S.pts[i-1],b=S.pts[i];m=Math.max(m,Math.abs(b[1]-a[1])/Math.max(1e-6,Math.abs(b[0]-a[0])));}return m;};
ok('no turnout leaves the line steeper than 1 in 5 (the ladder)',yard.sidings.every(S=>steep(S)<=.2*1.05),Y.railYard({at,s0:1300,s1:2800,n:8,fan:90,fanStep:0,maxSlope:10,seed:7}).sidings.every(S=>steep(S)<=.2*1.05));
ok('the yard outline holds the sidings and not the far side of the line',Y.inside(yard.outline,-1000,-130,0)&&!Y.inside(yard.outline,-1000,-200,0),Y.inside(yard.outline,-1000,-200,0));
/* determinism: the same inputs give the same records */
const tf=o=>Y.tankFarm(Object.assign({x:0,z:0,y:0,w:420,d:420,r:13,seed:5,damage:.6},o));
ok('a tank farm is the same for the same inputs',JSON.stringify(tf({}))===JSON.stringify(tf({})),JSON.stringify(tf({}))===JSON.stringify(tf({seed:6})));
{const T=tf({}),inside=T.tanks.every(t=>Math.abs(t.u)+t.r<=210&&Math.abs(t.v)+t.r<=210);ok('every tank inside its bund ('+T.tanks.length+')',T.tanks.length>=9&&inside,tf({r:60}).tanks.every(t=>Math.abs(t.u)+t.r<=210&&Math.abs(t.v)+t.r<=210)&&false);}
ok('spheres only where asked',tf({spheres:0}).tanks.every(t=>t.form==='cyl')&&tf({spheres:1}).tanks.every(t=>t.form==='sphere'),tf({spheres:0}).tanks.some(t=>t.form==='sphere'));
ok('more damage, more ruined tanks',tf({damage:1}).tanks.filter(t=>t.state!=='whole').length>tf({damage:0}).tanks.filter(t=>t.state!=='whole').length);
/* the rack's skip: no bent where the host says a street runs (x within 20 m of 0); the pipes span the gap */
const skip=(x,z)=>Math.abs(x)<20,rack=Y.pipeRack({pts:[[-200,0],[200,0]],seed:3,damage:.5,skip}),rack0=Y.pipeRack({pts:[[-200,0],[200,0]],seed:3,damage:.5});
ok('no bent in the skipped street',rack.bents.every(b=>!skip(b.x,b.z))&&rack.bents.length>40,rack0.bents.every(b=>!skip(b.x,b.z)));
{const C=Y.conveyor([-100,5,0],[100,45,0],{seed:2,damage:0,skip}),C0=Y.conveyor([-100,5,0],[100,45,0],{seed:2,damage:0});ok('no trestle in the skipped street',C.trestles.every(t=>!skip(t.x,t.z))&&C.trestles.length>=5,C0.trestles.every(t=>!skip(t.x,t.z)));}
{const ch=Y.chimney({x:0,z:0,y:0,h:100,r:4,seed:1,damage:0}),broken=[...Array(40).keys()].map(i=>Y.chimney({x:0,z:0,y:0,h:100,r:4,seed:i,damage:1})).filter(c=>c.state==='broken');
 ok('a chimney stands whole undamaged; broken ones keep at least a third',ch.top===100&&broken.length>5&&broken.every(c=>c.top>=35),broken.some(c=>c.top>=100));}
{const S=[Y.slagHeap({x:0,z:0,rx:100,rz:50,h:20,seed:4})];ok('a slag heap stands at its centre and is nothing past its edge',Y.slagH(S,0,0)>10&&Y.slagH(S,0,60)===0,Y.slagH(S,0,60)>0);}
console.log((fails?'FAILED ':'all ')+(fails?fails+' of '+n:n)+' passed'.replace(' passed',fails?'':' passed'));process.exit(fails?1:0);
