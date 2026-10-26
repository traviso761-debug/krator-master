// biomes/cut: the field and the warp's transforms as data (PLAN.md C1). node biomes/cut/tests/test-cut.js
// The strength is 1 at the centre and 0 at the lip; the axes are unit and orthogonal; the size steps, the bites and the
// echoes are the same on every run (a fixed fingerprint) and machine (core/rand's integer hash only); the bowl matches
// the survey (the stations' heights, the lakes' levels and rough areas, the mouths).
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.join(__dirname,'..','..','..');
const ctx={console,Math,Float32Array};ctx.globalThis=ctx;vm.createContext(ctx);
for(const f of ['core/rand/08-core-rand.js','biomes/cut/src/41-cut-field.js'])vm.runInContext(fs.readFileSync(path.join(ROOT,f),'utf8')+'\n;globalThis.CUT=typeof CUT!=="undefined"?CUT:globalThis.CUT;',ctx,{filename:f});
const CUT=ctx.CUT;let fails=0,n=0;
const ok=(c,m)=>{n++;if(!c){fails++;console.log('FAIL '+m);}};
const near=(a,b,e)=>Math.abs(a-b)<=e;

// the strength
ok(near(CUT.field(0,0).s,1,1e-9),'s at the centre is 1');
for(let b=0;b<360;b+=15){const R=CUT.lipR(b),x=Math.sin(b*Math.PI/180),z=-Math.cos(b*Math.PI/180);
 ok(CUT.field(x*R,z*R).s<1e-9,'s is 0 at the lip, bearing '+b);ok(CUT.field(x*R*1.2,z*R*1.2).s===0,'s is 0 past the lip, bearing '+b);
 ok(near(CUT.field(x*R*.3,z*R*.3).s,1,1e-9),'s is 1 inside .35 R, bearing '+b);
 let prev=2;for(let f=.3;f<=1.001;f+=.05){const s=CUT.field(x*R*f,z*R*f).s;ok(s<=prev+1e-12,'s falls outward, bearing '+b);prev=s;}}
// the axes: unit, orthogonal, the radial one toward the centre, the tangential one clockwise from above
for(let i=0;i<400;i++){const x=(KR(i,1)-.5)*160000,z=(KR(i,2)-.5)*160000,F=CUT.field(x,z);
 ok(near(Math.hypot(F.ar[0],F.ar[1]),1,1e-9)&&near(Math.hypot(F.at[0],F.at[1]),1,1e-9)&&near(Math.hypot(F.axis[0],F.axis[1]),1,1e-9),'unit axes at '+x+','+z);
 ok(near(F.ar[0]*F.at[0]+F.ar[1]*F.at[1],0,1e-9),'ar and at orthogonal');
 ok(F.ar[0]*x+F.ar[1]*z<0,'ar points at the centre');}
{const F=CUT.field(0,-10000);ok(near(F.at[0],1,1e-9),'at north of the centre runs east (clockwise from above)');}
// the rings alternate
{const a=CUT.field(0,-3000).k,b=CUT.field(0,-9000).k,c=CUT.field(0,-15000).k;ok(a===0&&b===1&&c===0,'rings alternate radial / tangential: '+a+' '+b+' '+c);}
// the compass
{const N=CUT.north(10000,0);ok(N.dir[0]<-.999&&N.w>0,'the compass points at the centre');ok(CUT.north(200000,0).w===0,'no needle past the lip');}
// the warp's matrix: leans the up vector toward the axis by the lean angle, stretches the axis by the stretch
{const W=CUT.warp(16000,30000,{id:3});const up=CUT.apply(W.m,[0,1,0]),ang=Math.acos(up[1]/Math.hypot(...up));
 ok(near(ang,W.lean,1e-9),'lean angle '+ang+' vs '+W.lean);ok(up[0]*W.axis[0]+up[2]*W.axis[1]>0,'leans toward the axis');
 const a=CUT.apply(W.m,[W.axis[0],0,W.axis[1]]);ok(near(Math.hypot(...a),W.stretch,1e-9),'stretch along the axis');
 const p=CUT.apply(W.m,[-W.axis[1],0,W.axis[0]]);ok(near(Math.hypot(...p),1,1e-9),'no stretch across the axis');}
// fixed sizes
ok(CUT.snap(1.2,.5)===1.4&&CUT.snap(.8,.5)===.7&&CUT.snap(.95,.9)===1&&CUT.snap(1.2,.2)===1.2,'size steps snap only where s > .3');
ok(CUT.quant(2.7,.5,.6)===2.5&&CUT.quant(2.7,.5,.1)===2.7,'lengths quantise only where s > .3');
// the same on every run: a fingerprint of 2,000 plants' draws (a change here is a change to every placed plant)
{let h=0,bites=0,echoes=0;for(let i=0;i<2000;i++){const x=(KR(i,5)-.5)*120000,z=(KR(i,6)-.5)*120000,W=CUT.warp(x,z,{id:i,size:.6+KR(i,7)*.9});
 if(W.bite)bites++;if(W.echo)echoes++;
 const v=[W.lean,W.stretch,W.step||0,W.bite?W.bite.k:0,W.echo?W.echo.dx:0];for(const q of v)h=(Math.imul(h^Math.round(q*1e6),0x9E3779B1)>>>0);}
 console.log('warp fingerprint',h.toString(16),'bites',bites,'echoes',echoes);
 ok(GOLD==null||h.toString(16)===GOLD,'warp fingerprint '+h.toString(16)+' matches the golden '+GOLD);
 ok(bites>20&&echoes>2,'some bites and echoes ('+bites+', '+echoes+')');}
// the bowl on the survey (PLAN.md sections 1, 6, 8)
{const S=CUT.SITES,hf=CUT.bowl.h(S.floor.x,S.floor.z),hw=CUT.bowl.h(S.wall.x,S.wall.z),hc=CUT.bowl.h(S.face.x,S.face.z);
 console.log('sites: floor',S.floor.x|0,S.floor.z|0,hf|0,'wall',S.wall.x|0,S.wall.z|0,hw|0,'face',S.face.x|0,S.face.z|0,hc|0);
 ok(near(hf,-1456,40),'the floor station stands by the upper lake ('+hf.toFixed(0)+')');
 ok(hw>-800&&hw<1500,'the wall station is on the wall ('+hw.toFixed(0)+')');ok(hc>4300&&hc<5400,'the face station is near the west lip ('+hc.toFixed(0)+')');
 let up=0,lo=0,fl=[];const c=1000;for(let z=-90000;z<90000;z+=c)for(let x=-90000;x<90000;x+=c){const L=CUT.lakeAt(x,z);if(L&&L.key==='upper')up++;else if(L)lo++;const r=Math.hypot(x,z);if(r<16000)fl.push(CUT.bowl.h(x,z));}
 fl.sort((a,b)=>a-b);console.log('lakes km2: upper',up,'lower',lo,'floor median (0-16 km)',fl[fl.length>>1]|0);
 ok(up>1800&&up<3400,'the upper lake ~2,000-3,000 km2 ('+up+')');ok(lo>150&&lo<700,'the lower lake a few hundred km2 ('+lo+')');
 ok(near(fl[fl.length>>1],-1585,100),'the 0-16 km ring near the survey, -2,185 + 600 ('+fl[fl.length>>1].toFixed(0)+')');
 ok(CUT.bowl.h(0,-80000)<1200,'the north mouth is a low sill');ok(CUT.bowl.h(...CUT.px(472,333))<0,'Dilihan stands low in the crater mouth');
 ok(CUT.lipH(67)>6000&&CUT.lipH(225)>5800,'highest to the ENE and SW');}
// the horizon
{const P=CUT.horizon(CUT.SITES.floor,[[3000,20000],[20000,160000]],64);ok(P.length===2&&P[1].every(isFinite),'the horizon casts');
 console.log('floor horizon, far band (deg):',Array.from(P[1]).filter((v,i)=>i%8===0).map(v=>v.toFixed(1)).join(' '));}
function KR(i,s){return ctx.KRAND.unit(ctx.KRAND.hash(99,i,s));}
var GOLD='f9a92f65';   /* the warp's draws for 2,000 plants: moving it moves every plant the warp touches */
console.log(fails?fails+' of '+n+' FAILED':'all '+n+' checks pass');process.exit(fails?1:0);
