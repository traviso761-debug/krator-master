// node core/terrain/test-brush.js — the field's brushes (31-core-field-brush.js), each check with an input that must fail.
'use strict';
const K=require('./30-core-field.js');globalThis.KFIELD=K;require('./31-core-field-brush.js');
let bad=0;const ok=(name,pass,neg)=>{const r=!!pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const throws=f=>{try{f();return false;}catch(e){return true;}};
const surf=(x,z)=>2+.1*x+1.5*Math.sin(x*.3)*Math.cos(z*.2);
const mk=()=>K.bake(surf,[-40,-40,40,40],2,{insets:[{box:[0,0,10,10],step:.5,name:'fine'}]});
// raise: the centre up by the strength, nothing outside r moved, the edge smooth
{const f=mk(),h0=f.h(-20,-20),far=f.h(-20,-5),b=K.stroke(f,{mode:'raise',x:-20,z:-20,r:8,strength:3});
 ok('raise: the centre up by the strength (3 m)',Math.abs(f.h(-20,-20)-h0-3)<1e-5,Math.abs(f.h(-20,-20)-h0)<1e-9);
 ok('raise: a point beyond r is not moved',f.h(-20,-5)===far,f.h(-20,-5)!==far);
 const up=d=>f.h(-20+d,-20)-surf(-20+d,-20),u=[0,2,4,6,8].map(up);   // on grid points (the grid is 2 m)
 ok('raise: the rise falls off with distance and is 0 at r (falloff)',u[0]>u[1]&&u[1]>u[2]&&u[2]>u[3]&&u[3]>0&&Math.abs(u[4])<1e-5,!(u[0]>u[1]));
 ok('raise: the box it may have changed',b&&b[0]===-28&&b[3]===-12,!b);}
// lower is raise's opposite
{const f=mk(),h0=f.h(-10,10);K.stroke(f,{mode:'lower',x:-10,z:10,r:6,strength:2});ok('lower: the centre down by the strength',Math.abs(h0-f.h(-10,10)-2)<1e-5,f.h(-10,10)>=h0);}
// flatten: towards the centre's height (or y), never past it
{const f=mk(),y=f.h(-24,0);for(let k=0;k<30;k++)K.stroke(f,{mode:'flatten',x:-24,z:0,r:10,strength:.5});
 const spread=Math.abs(f.h(-27,0)-y)+Math.abs(f.h(-21,2)-y);ok('flatten: repeated strokes bring the middle to the centre\'s height',spread<.05,spread>1);
 const f2=mk();K.stroke(f2,{mode:'flatten',x:0,z:-30,r:6,strength:1,y:10});ok('flatten to a given y: the centre reaches it at strength 1',Math.abs(f2.h(0,-30)-10)<1e-5,Math.abs(f2.h(0,-30)-surf(0,-30))<1e-9);}
// smooth: less roughness, the mean nearly kept
{const rough0=(x,z)=>2+((Math.round(x/2)*7+Math.round(z/2)*13)%5)*.4;   // a spiky ground, rough at the grid's own step
 const f=K.bake(rough0,[-40,-40,40,40],2),pts=[];for(let i=-3;i<=3;i++)for(let j=-3;j<=3;j++)pts.push([-30+i*2,30+j*2]);
 const rough=()=>{let s=0;for(const [x,z] of pts){const n=(f.h(x-2,z)+f.h(x+2,z)+f.h(x,z-2)+f.h(x,z+2))/4;s+=Math.abs(f.h(x,z)-n);}return s;};
 const r0=rough();for(let k=0;k<8;k++)K.stroke(f,{mode:'smooth',x:-30,z:30,r:9,strength:1});ok('smooth: roughness down',rough()<r0*.5,rough()>=r0);}
// the inset is written too (h reads the inset first there)
{const f=mk(),h0=f.h(5,5);K.stroke(f,{mode:'raise',x:5,z:5,r:3,strength:1.5});
 ok('an inset under the stroke is written (h reads it there)',Math.abs(f.h(5,5)-h0-1.5)<1e-5,Math.abs(f.h(5,5)-h0)<1e-9);}
// replay: the same strokes from the snapshot give the same heights; undoing one is a replay without it
{const f=mk(),snap=K.snapshot(f),S=[{mode:'raise',x:-4,z:-4,r:12,strength:2},{mode:'smooth',x:0,z:0,r:10,strength:.7},{mode:'flatten',x:4,z:4,r:5,strength:.8}];
 S.forEach(s=>K.stroke(f,s));const a=Array.from(f.heights),ai=Array.from(f.insets[0].heights);
 K.replay(f,snap,S);ok('replay: the same strokes in the same order give the same heights, insets included',Array.from(f.heights).every((v,k)=>v===a[k])&&Array.from(f.insets[0].heights).every((v,k)=>v===ai[k]),false);
 K.replay(f,snap,S.slice(0,2));const differ=Array.from(f.heights).some((v,k)=>v!==a[k]);ok('replay without the last stroke undoes it',differ,!differ);
 K.restore(f,snap);ok('restore: the baked heights back',Array.from(f.heights).every((v,k)=>v===snap[0][k]),false);
 const g=mk();K.stroke(g,S[1]);K.stroke(g,S[0]);K.stroke(g,S[2]);ok('strokes do not commute (why undo replays)',Array.from(g.heights).some((v,k)=>v!==a[k]),false);}
// a stroke from an edit record, and refusals
{const s=K.strokeOf({key:'raise',at:[1,2,3],r:4,strength:.5});ok('strokeOf: a record\'s key, centre, radius, strength',s.mode==='raise'&&s.x===1&&s.z===3&&s.r===4&&s.strength===.5,false);
 const f=mk();ok('an unknown mode, no radius or no strength throws',throws(()=>K.stroke(f,{mode:'dig',x:0,z:0,r:3,strength:1}))&&throws(()=>K.stroke(f,{mode:'raise',x:0,z:0,r:0,strength:1}))&&throws(()=>K.stroke(f,{mode:'raise',x:0,z:0,r:3})),!throws(()=>K.stroke(f,{mode:'dig',x:0,z:0,r:3,strength:1})));
 ok('a stroke off the field changes nothing (null)',K.stroke(f,{mode:'raise',x:500,z:500,r:5,strength:1})===null,K.stroke(f,{mode:'raise',x:0,z:0,r:5,strength:1})===null);}
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
