// node core/host/test-feet.js: the walker's pure rules in 90-host-camera.js (KHOST.feet: the floor under a point, the swept step,
// the clipping planes' test), each negative a pair run on the old rule (the fault) and the new (the fix) (BUGS-2026-11-15 C5,
// C6, C8). No browser: the file only defines functions when it loads. The camera's own use of them (F, the stand, the pin, the
// inspector) is checked on the test page: core/host/underground/check.py.
'use strict';
const path=require('path');
const T=require('../../tools/ktest.js')(__filename);
global.KHOST={};
require(path.join(__dirname,'..','walk','20-core-walk.js'));
require(path.join(__dirname,'90-host-camera.js'));
const K=global.KHOST,F=K.feet,KW=global.KWALK;
// the old rules, as 90-host-camera.js had them: F took the highest floor at x, z (or the ground over it); the stand took the
// floor below the feet unless the ground was higher by 0.3 m
const oldF=(W,g,x,z)=>{const fs=W.floorsAt(x,z);return fs.length?Math.max(g(x,z),fs[0][0]):g(x,z);};
const newF=(W,g,x,z,y)=>F.under(W,g,x,z,y,.3,.3);
const oldStand=(W,g,x,z,y,step)=>{const f=W.floorBelow(x,z,y,step);return f&&f[0]>=g(x,z)-.3?f[0]:g(x,z);};
const newStand=(W,g,x,z,y,step)=>F.under(W,g,x,z,y,step,1.7);

// ---- the floor under the eye: Dhelv's case, a tube at y -10 under a town floor at 40, the ground (the surface) at 57 (a forest)
const D=KW.create();D.floor({rect:[-50,50,-2,2],y:-10,name:'the braid'});D.floor({rect:[-5,5,-5,5],y:40,name:'the town'});
const surf=()=>57;
T.neg('F from an eye in the tube (y -8.3) stands on the tube floor, not the surface over it',rule=>rule(D,surf,0,0,-8.3)===-10,oldF,newF);
T.neg('the stand keeps a walker in the tube, not lifted to the surface',rule=>rule(D,surf,0,0,-10,.7)===-10,oldStand,newStand);
T.ok('two floors at one x, z: the one under the eye each time',newF(D,()=>30,0,0,-8.3)===-10&&newF(D,()=>30,0,0,45)===40);
T.ok('no floor under the eye and the ground over it: the ground (the fallback, as before)',newF(D,surf,20,20,-8.3)===57);
T.ok('a constant fallback ground under the floor (the test page, Loj Twenny): the floor',newStand(D,()=>-50,0,0,-10,.7)===-10);
// the surface pages keep the old answer: a cellar floor under the terrain, a deck over it, open ground
const S=KW.create();S.floor({rect:[0,4,0,4],y:-3,name:'cellar'});S.floor({rect:[10,14,0,4],y:3,name:'deck'});
const hill=(x,z)=>x*.1,cases=[[2,2,.2],[12,2,3],[12,2,1.2],[30,2,3],[7,2,.7]];
const same=cases.filter(([x,z,y])=>newStand(S,hill,x,z,y,.7)===oldStand(S,hill,x,z,y,.7)).length;
T.ok('on the surface (open ground, a deck, a slope) the stand is the old one',same===cases.length,same+' of '+cases.length);
T.neg('in a cellar under the terrain (3.2 m of ground over the feet) the walker stays on the cellar floor',
 rule=>rule(S,hill,2,2,-3,.7)===-3,oldStand,newStand);
// the head rule: ground up to the walker's height over the feet still counts (a slope walked up), past it a roof
const Tf=KW.create();Tf.floor({rect:[-5,5,-5,5],y:0,name:'floor'});
T.ok('ground 1.5 m over the feet counts (walked up onto it)',newStand(Tf,()=>1.5,0,0,0,.7)===1.5);
T.ok('ground 2 m over the feet is a roof: the floor',newStand(Tf,()=>2,0,0,0,.7)===0);

// ---- the swept step: a car wall 0.15 m thick across a corridor at x 0 to 0.15; the walker (r .35) 0.6 m before it, a 0.9 m step
const Wl=KW.create();Wl.floor({rect:[-5,5,-2,2],y:0,name:'aisle'});const wall=Wl.block([0,.15,-2,2,0,2.4],'car wall');
const at=()=>0,WK={r:.35,h:1.7,sweep:.3},A=[-.6,0,0];
/* where the stand leaves the walker after the step: the swept fraction of it, then pushed out of whatever it overlaps */
const land=sw=>{const u=sw?F.sweep(Wl,at,A,.3,0,WK):1,x=A[0]+(.3-A[0])*u;return Wl.blocked(x,0,0,.35,1.7)?Wl.push(x,0,0,.35,1.7)[0]:x;};
T.neg('a 0.9 m step (2 fps) ends on the near side of a 0.15 m wall',sw=>land(sw)<0,false,true);
T.ok('the swept walker is clear of the wall',!Wl.blocked(land(true),.05,0,.35,1.65),'x '+land(true).toFixed(2));
T.ok('a step under 0.3 m is left to the push',F.sweep(Wl,at,A,-.35,0,WK)===1);
T.ok('a walker already pressed into a block is left to the push',F.sweep(Wl,at,[.05,0,0],1,0,WK)===1);
T.ok('across the wall stops, along the aisle away from it is free',F.sweep(Wl,at,A,.3,1.5,WK)<1&&F.sweep(Wl,at,A,-1.5,0,WK)===1);
Wl.setBlock(wall,false);
T.ok('an open door (the block switched off) lets the step through',F.sweep(Wl,at,A,.3,0,WK)===1);
Wl.setBlock(wall,true);
// a stair rising on the way: the samples stand on it, so its rise is no block
const St=KW.create();St.strip({a:[0,0,0],b:[3,0,1.5],w:2,name:'stair'});St.block([-1,4,1.2,1.4,0,3],'rail');
const sat=(x,z)=>{const f=St.floorBelow(x,z,1.5,.7);return f?f[0]:0;};
T.ok('up a stair beside a rail the step is free',F.sweep(St,sat,[0,0,0],1.5,0,WK)===1);

// ---- the clipping planes' test (three's rule), the inspector's filter
const P=[{normal:{x:0,y:-1,z:0},constant:5},{normal:{x:1,y:0,z:0},constant:0}];   /* y > 5 cut; x < 0 cut */
T.ok('planesClip: union, a point past any plane is cut',F.planesClip(P,false,1,6,0)&&F.planesClip(P,false,-1,1,0)&&!F.planesClip(P,false,1,1,0));
T.ok('planesClip: intersect (clipIntersection), only past every plane',F.planesClip(P,true,-1,6,0)&&!F.planesClip(P,true,1,6,0));
T.ok('planesClip: no planes cut nothing',!F.planesClip([],false,0,99,0)&&!F.planesClip(null,true,0,0,0));
T.neg('a hit past the cut is filtered out (the inspector before: every hit kept)',filter=>!filter(1,6,0),()=>true,(x,y,z)=>!F.planesClip(P,false,x,y,z));
T.done();
