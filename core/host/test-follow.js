// node core/host/test-follow.js: the follow camera's arm (91b-host-follow.js, KHOST.arm, solidFrom, solidGrid), each rule
// with a negative. No browser: the file's taker is not registered without 91-host-loop.js, only its pure parts load.
'use strict';
const path=require('path');
global.KHOST={};
require(path.join(__dirname,'91b-host-follow.js'));
const K=global.KHOST,A=K.arm;
let fails=0,n=0;
function ok(c,msg){n++;if(!c){fails++;console.log('FAIL '+msg);}else console.log('ok   '+msg);}
// a tunnel along -z: 3 m wide, 2.6 m high, floor y 0 (the open is inside the box)
const tunnel=(x,y,z)=>Math.min(1.5-Math.abs(x),y,2.6-y);
// a wall across the tunnel at z = 2.5 (rock from 2.5 to 3.5): the camera behind the walker meets it
const walled=(x,y,z)=>Math.min(tunnel(x,y,z),Math.max(2.5-z,z-3.5)>0?Math.max(2.5-z,z-3.5):-Math.min(z-2.5,3.5-z));
const open=()=>1e9;
// ---- march
ok(Math.abs(A.march(open,[0,1.5,0],[0,0,1],4,.3)-4)<1e-9,'march: open space gives the whole length');
const h=A.march(walled,[0,1.5,0],[0,0,1],4,.3);
ok(h>2.1&&h<=2.2,'march: stops a sphere of 0.3 m before the wall at 2.5 m (got '+h.toFixed(3)+')');
ok(walled(0,1.5,h)>=.3-1e-6,'march: the returned point keeps the radius clear of the solid');
ok(A.march(walled,[0,1.5,0],[0,0,1],4,.3)<A.march(walled,[0,1.5,0],[0,0,1],4,0),'march (negative): a bigger sphere stops sooner');
ok(A.march(tunnel,[0,.1,0],[0,0,1],4,.3)===0,'march: a pivot already inside the radius gives 0');
// ---- step: pull in at once when the spot is in the rock
let S={L:4,free:0,blk:0};
A.step(S,{want:4,hit:2,spotIn:true},1/60,A.P0);ok(Math.abs(S.L-2)<1e-9,'step: the spot in the solid pulls in at once');
// a brief blocker (the spot free, the line blocked) is ignored under `brief`
S={L:4,free:0,blk:0};
for(let i=0;i<6;i++)A.step(S,{want:4,hit:2,spotIn:false},1/60,A.P0);
ok(S.L===4,'step: a blocker for 0.1 s does not shorten the arm');
for(let i=0;i<30;i++)A.step(S,{want:4,hit:2,spotIn:false},1/60,A.P0);
ok(S.L<2.5,'step (negative): a blocker held for 0.6 s does (L '+S.L.toFixed(2)+')');
// push out only after the dwell, then slowly
S={L:2,free:0,blk:0};
for(let i=0;i<20;i++)A.step(S,{want:4,hit:4,spotIn:false},1/60,A.P0);
ok(S.L===2,'step: no push out before 0.4 s free');
for(let i=0;i<10;i++)A.step(S,{want:4,hit:4,spotIn:false},1/60,A.P0);
ok(S.L>2&&S.L<2.5,'step: after the dwell it eases out at 2.5 m/s (L '+S.L.toFixed(2)+')');
// pumping: free and blocked frames alternating never push out
S={L:2,free:0,blk:0};
for(let i=0;i<120;i++)A.step(S,{want:4,hit:i%10<5?4:2,spotIn:false},1/60,A.P0);
ok(S.L<=2+1e-9,'step: a doorway flickering every 5 frames does not pump the arm');
ok(A.step({L:3,free:0,blk:0},{want:1.5,hit:4,spotIn:false},1/60,A.P0)===1.5,'step: a shorter wanted length (the wheel) is taken at once');
// ---- modes
ok(A.mode(3)==='boom'&&A.mode(1)==='shoulder'&&A.mode(.4)==='fp','mode: boom over 1.2 m, shoulder under, first person under 0.6 m');
// ---- ceiling
const low=A.ceiling(tunnel,[0,1.85,0],4,.3);
ok(Math.abs(low.hc-.45)<.02,'ceiling: the roof 0.75 m over the pivot, less the radius (hc '+low.hc.toFixed(2)+')');
ok(low.elevMax<.1&&low.elevMax>0,'ceiling: a low roof keeps the arm near level (elevMax '+low.elevMax.toFixed(3)+')');
ok(A.ceiling(open,[0,1.85,0],4,.3).elevMax===Math.PI/2,'ceiling (negative): no roof, no limit');
// ---- solidFrom: KWALK blocks as boxes, thin left out, off left out
const W={blocks:[{box:[-1,1,4,5,0,2],tag:'pillar'},{box:[-1,1,1,1.2,0,2],tag:'thin'},{box:[-1,1,2,2.2,0,2],tag:'rope thin'},{box:[-1,1,3,3.2,0,2],tag:'door',off:true}]};
const q=K.solidFrom({walk:W,ground:(x,z)=>0});
ok(Math.abs(q(0,1,3.7)-.3)<1e-9,'solidFrom: a block is a box (0.3 m to the pillar)');
ok(q(0,1,1.1)>.9,'solidFrom: a block tagged thin is not solid');
ok(q(0,1,2.1)>.9,'solidFrom: a tag list holding thin is not solid');
ok(q(0,1,3.1)>.5,'solidFrom: a block switched off (an open door) is not solid');
ok(q(0,1,4.5)<0,'solidFrom (negative): inside the pillar is negative');
ok(Math.abs(q(10,2,0)-2)<1e-9,'solidFrom: the ground as a bound (2 m up)');
// ---- the grid: the same answers as the query, near enough
const g=K.solidGrid(walled,{cell:.25,r:3,budget:1e6});g.move(0,1.5,1);
let worst=0;for(let i=0;i<200;i++){const x=-1+(i%7)*.3,y=.5+((i*3)%5)*.3,z=-.5+((i*7)%11)*.3,e=Math.abs(g(x,y,z)-walled(x,y,z));if(e>worst)worst=e;}
ok(worst<.2,'grid: within 0.2 m of the query inside its lattice (worst '+worst.toFixed(3)+')');
ok(g(50,1,50)===walled(50,1,50),'grid: outside its lattice it asks the query itself');
console.log((n-fails)+' of '+n+' passed');process.exit(fails?1:0);
