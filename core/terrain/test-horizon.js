// node core/terrain/test-horizon.js — the horizon maps' contract (45-core-horizon.js, KHORIZON), each check with a broken input that must fail.
const fs=require('fs'),path=require('path');
global.window=global;
eval(fs.readFileSync(path.join(__dirname,'..','rand','08-core-rand.js'),'utf8'));
eval(fs.readFileSync(path.join(__dirname,'45-core-horizon.js'),'utf8'));
let bad=0;const ok=(name,pass,neg)=>{const r=pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const K=KHORIZON,box=[-2000,-2000,2000,2000];
const sun=(azDeg,elDeg)=>{const a=azDeg*Math.PI/180,e=elDeg*Math.PI/180;return [Math.cos(a)*Math.cos(e),Math.sin(e),Math.sin(a)*Math.cos(e)];};

// ---- a wall 400 m high from x = 500 east: a point at x = 0 sees its crest at atan(400/500) = 38.7 degrees east
const wall=(x,z)=>x>500?400:0,t0=Date.now(),W=K.bake({box,n:128,h:wall}),ms=Date.now()-t0;
const hz=K.horizon(W,0,0,0);
ok('the horizon toward the wall is its crest ('+(Math.asin(hz)*180/Math.PI).toFixed(1)+' degrees; 38.7 by the geometry)',Math.abs(Math.asin(hz)*180/Math.PI-38.7)<2.5,Math.abs(Math.asin(K.horizon(W,0,0,Math.PI))*180/Math.PI-38.7)<2.5);
ok('a low sun behind the wall leaves the foot in shade, a high one or one behind the viewer lights it',K.at(W,0,0,sun(0,20))<.05&&K.at(W,0,0,sun(0,60))>.95&&K.at(W,0,0,sun(180,10))>.95,K.at(W,0,0,sun(0,20))>.95);
ok('the shadow reaches far at a low sun and shortens as it climbs (at 10 degrees from x -1500, at 30 not)',K.at(W,-1500,0,sun(0,8))<.05&&K.at(W,-1500,0,sun(0,30))>.95,false);
ok('the wall\'s own top is lit by the same low sun',K.at(W,1500,0,sun(0,20))>.95,K.at(W,1500,0,sun(0,20))<.05);
ok('outside the box everything is lit',K.at(W,5000,0,sun(0,5))===1&&K.skyAt(W,0,9000)===1,false);
ok('a bake of 128 x 128 x 8 directions takes '+ms+' ms (under 3000)',ms<3000,false);

// ---- sky visibility: a gorge 200 m deep and 200 m wide sees less sky than the open plain
const gorge=(x,z)=>Math.abs(x)<100?-200:0,Gz=K.bake({box,n:128,h:gorge});
const flat=K.bake({box,n:64,h:()=>5});
ok('a gorge\'s floor sees less sky ('+K.skyAt(Gz,0,0).toFixed(2)+') than the plain ('+K.skyAt(Gz,1500,0).toFixed(2)+')',K.skyAt(Gz,0,0)<.75&&K.skyAt(Gz,1500,0)>.97,K.skyAt(flat,0,0)<.97);
ok('a flat plain is open and lit under any sun above it',[0,90,200,300].every(a=>K.at(flat,0,0,sun(a,3))>.95)&&K.skyAt(flat,100,-300)>.99,false);

// ---- a far grid: a range beyond the box still shades it
const farRange=(x,z)=>x>3000&&x<6000?1500:0;
const nf=K.bake({box,n:64,h:()=>0}),wf=K.bake({box,n:64,h:()=>0,far:{h:farRange,box:[-8000,-8000,8000,8000],n:128}});
ok('a range outside the map shades it through the far grid (sun 15 degrees east)',K.at(wf,0,0,sun(0,15))<.05,K.at(nf,0,0,sun(0,15))<.05);

// ---- the packing and the contract
ok('two RGBA8 maps, n*n*4 each, and a sky array',W.A.length===128*128*4&&W.B.length===W.A.length&&W.sky.length===128*128&&W.dirs===8,false);
ok('the same field bakes the same maps',K.hash(W)===K.hash(K.bake({box,n:128,h:wall})),K.hash(W)===K.hash(Gz));
ok('heights given as an array bake as the function does',K.hash(K.bake({box,n:64,H:K.grid(wall,box,64)}))===K.hash(K.bake({box,n:64,h:wall})),false);
let threw=false;try{K.bake({box:[0,0,0,10],h:wall});}catch(e){threw=true;}ok('an empty box is refused',threw,false);
threw=false;try{K.bake({box,n:16});}catch(e){threw=true;}ok('a bake without heights is refused',threw,false);
threw=false;try{K.bake({box,n:16,H:new Float32Array(10)});}catch(e){threw=true;}ok('heights of the wrong count are refused',threw,false);

console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
