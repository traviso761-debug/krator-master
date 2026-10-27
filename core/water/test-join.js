// node core/water/test-join.js: WATER.join (22-core-water-flow.js), a tributary meeting a main channel as one water
// (biomes/swhighlands, the owner's note of 2026-10-26). Each check with a negative control: the naive line fails it.
const fs=require('fs'),path=require('path');const ROOT=path.join(__dirname,'..','..');
global.window=global;
eval(['core/atmos/89-atmos-0-core.js','core/atmos/89-atmos-0p-presets.js','core/atmos/89-atmos-a-waves.js','core/water/20-core-water.js','core/water/21-core-water-shore.js','core/water/22-core-water-flow.js']
 .map(f=>fs.readFileSync(path.join(ROOT,f),'utf8')).join('\n')+';global.WATER=WATER;');
const W=WATER;let fails=0;const ok=(c,m)=>{console.log((c?'  PASS  ':'  FAIL  ')+m);if(!c)fails++;};
// the main: a river along z at x 0, falling south, 8 m half width; the tributary: from the east, meandering, OVERSHOOTING across it
const main=[];for(let z=-200;z<=200;z+=10)main.push([0,z,10-z*.01]);
const trib=[];for(let x=120;x>=-30;x-=5)trib.push([x,3*Math.sin(x*.1),12+x*.02]);
const near=(p)=>{let b=1e9;for(let k=0;k<main.length-1;k++){const a=main[k],c=main[k+1],dz=c[1]-a[1],t=Math.max(0,Math.min(1,(p[1]-a[1])/dz));b=Math.min(b,Math.hypot(p[0]-a[0],p[1]-(a[1]+dz*t)));}return b;};
const across=L=>L.some(p=>p[0]<0);
const J=W.join(trib,main,{w:8,tuck:.3});
const last=J.pts[J.pts.length-1];
ok(!across(J.pts),'the joined tributary never crosses the main\'s centreline ('+J.pts.length+' points, '+J.cut+' cut)');
ok(across(trib),'negative: the raw tributary does cross it');
ok(Math.abs(near(last)-.3*8)<.05,'it ends on the tuck line, '+near(last).toFixed(2)+' m from the centreline (want 2.40)');
ok(near(trib[Math.floor(trib.length*.6)])>8,'negative: a point of the raw line part way along lies outside the channel (a cut at a bank would stop short)');
const mono=L=>L.every((p,i)=>!i||p[2]<=L[i-1][2]+1e-9);
ok(mono(J.pts),'its surface never climbs');
ok(J.pts.every(p=>p[2]>=J.y+.03-1e-9),'every level at or over the main\'s surface at the join + lift ('+J.y.toFixed(2)+')');
const low=trib.map(p=>[p[0],p[1],p[2]-20]);const J2=W.join(low,main,{w:8});
ok(J2.pts.every(p=>p[2]>=J2.y),'a tributary lower than the main is raised to its surface');
ok(!low.every(p=>p[2]>=J2.y),'negative: the low line was below it');
ok(J.order==='after','it says to draw the tributary after the main');
// a tributary that stops short is left whole and given the main's level floor
const short=trib.filter(p=>p[0]>40);const J3=W.join(short,main,{w:8});
ok(J3.cut===0&&J3.pts.length===short.length,'a line that never reaches the channel keeps every point');
// a width function
const J4=W.join(trib,main,{w:i=>4+i*0,tuck:.5});ok(Math.abs(near(J4.pts[J4.pts.length-1])-2)<.05,'w as a function of the main\'s vertex');
// determinism: the same input gives the same output
ok(JSON.stringify(W.join(trib,main,{w:8}))===JSON.stringify(J),'deterministic');
console.log(fails?'\nFAILED: '+fails:'\nOK');process.exit(fails?1:0);
