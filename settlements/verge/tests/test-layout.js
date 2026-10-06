// node settlements/verge/tests/test-layout.js — Verge's layout in node, no browser, no THREE (41-verge-layout.js on
// core/rand). The checks the probe makes in the page that need only the layout, each with a negative control; and a
// digest of the terrain at fixed points, so a change that moves the ground is seen (rewrite with --write).
const load=require('./load.js'),fs=require('fs'),path=require('path');
const C=load(['41-verge-layout.js']),VG=C.__('VG'),T=VG.TRAIL;
let fail=0;const ok=(c,name,detail)=>{console.log((c?'  ok   ':'  FAIL ')+name+(detail?'  ('+detail+')':''));if(!c)fail++;};
function grade(pts){let m=0;for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],d=Math.hypot(b[0]-a[0],b[1]-a[1]);if(d>.5)m=Math.max(m,Math.abs(b[2]-a[2])/d);}return m;}
// the trail
ok(grade(T.pts)<=.16,'trail grade at most 16%','steepest '+(grade(T.pts)*100).toFixed(1)+'%');
ok(!(grade([[0,0,0],[10,0,3]])<=.16),'  negative: a 30% stretch fails');
ok(T.legs>=10&&T.legs<=20&&T.hairpins.length===T.legs-1,'switchbacks: fewer, longer legs',T.legs+' legs');
// irregular, not every x feet: the legs' runs differ (their spread in z is wide), and they are long
const runs=H=>{const z=[T.top[1]].concat(H.map(h=>h.z),[T.bot[1]]);const r=[];for(let i=1;i<z.length;i++)r.push(Math.abs(z[i]-z[i-1]));return r;};
const spread=r=>{const m=r.reduce((a,b)=>a+b,0)/r.length;return Math.sqrt(r.reduce((a,b)=>a+(b-m)*(b-m),0)/r.length);};
const R0=runs(T.hairpins),mean=R0.reduce((a,b)=>a+b,0)/R0.length;
ok(spread(R0)>40&&mean>300,'the legs are long and irregular','mean run '+mean.toFixed(0)+' m, spread '+spread(R0).toFixed(0)+' m');
ok(!(spread(runs(T.hairpins.map((h,i)=>({z:i%2?-80:300}))).slice(1,-1))>40),'  negative: evenly spaced hairpins fail');
ok(T.yTop-T.yBot>800,'the descent is nearly a kilometre',(T.yTop-T.yBot).toFixed(0)+' m');
let mx=0;for(let s=0;s<T.len;s+=10){const p=VG.trailAt(s);mx=Math.max(mx,Math.abs(VG.groundH(p[0],p[1])-p[2]));}
ok(mx<.6,'the ground follows the trail','max '+mx.toFixed(2)+' m');
// the rest stops
const marks=T.rest.map(r=>[r.mark,T.yTop-r.y]);
ok(T.rest.length===4&&marks.every(m=>Math.abs(m[0]-m[1])<40),'rest stops at the 200/400/600/800 m marks',marks.map(m=>m[0]+':'+m[1].toFixed(0)).join(' '));
ok(!([[200,300]].every(m=>Math.abs(m[0]-m[1])<40)),'  negative: a stop 100 m off its mark fails');
// the cataracts
const rims=VG.FALLS.map(f=>{const x=f.x+6,z=VG.gorgeZ(x),hw=VG.gorgeHW(x);return Math.min(VG.groundH(x,z-hw-10),VG.groundH(x,z+hw+10))-f.bot;});
ok(VG.FALLS.length===7&&rims.every(r=>r>8),'seven cataracts, each inside the gorge','rim above plunge: '+rims.map(r=>r.toFixed(0)).join(' '));
ok(VG.FALLS[0].top-VG.POOL.y>800,'the cataracts drop nearly a kilometre',(VG.FALLS[0].top-VG.POOL.y).toFixed(0)+' m');
// the water runs downhill
let up=0;for(let i=1;i<VG.RIVL.pts.length;i++)if(VG.WLL(VG.RIVL.pts[i][2])>VG.WLL(VG.RIVL.pts[i-1][2])+1e-9)up++;
ok(up===0,'the lower river never runs uphill');
let prev=1e9,bad=0;for(let x=-6000;x<VG.GORGE.x1;x+=5){const w=VG.WLG(x);if(w>prev+1e-9)bad++;prev=w;}
ok(bad===0,'the upper river and the cataracts never run uphill');
// the ramps
for(const R of VG.RAMPS)ok(R.grade<.16,'canyon ramp '+R.id+' is rideable',(R.grade*100).toFixed(1)+'%');
// the salt lakes are visible from the lip: below the floor at the city, far to the east
ok(VG.SALT_LAKES.every(L=>L.x>6000)&&VG.SALT_Y<VG.floorH(0,0)-20,'salt lakes far east, below the floor');
// a digest of the ground: the layout's numbers did not move
const pts=[];for(let x=-6000;x<=12000;x+=397)for(let z=-3000;z<=3000;z+=211)pts.push(+VG.groundH(x,z).toFixed(3));
let h=0x811C9DC5;for(const v of pts){const s=String(v);for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),0x01000193);}
const dig=(h>>>0).toString(16),GF=path.join(__dirname,'golden.json');
if(process.argv.includes('--write')){fs.writeFileSync(GF,JSON.stringify({ground:dig,trailLen:+T.len.toFixed(3)},null,1));console.log('  wrote golden.json');}
else if(fs.existsSync(GF)){const G=JSON.parse(fs.readFileSync(GF,'utf8'));ok(G.ground===dig,'the ground digest is unchanged',dig+(G.ground===dig?'':' (was '+G.ground+'; --write after a change you meant)'));}
console.log(fail?fail+' FAILED':'all passed');process.exit(fail?1:0);
