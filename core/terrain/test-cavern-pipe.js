// node core/terrain/test-cavern-pipe.js — KCAVERN.pipe (39-core-cavern.js): a hollow body on a sloped centreline (the Cliff Lungs),
// each check with a negative. test-cavern.js holds every older kind's meshes to their hashes.
'use strict';
const fs=require('fs'),path=require('path');
global.window=global;
eval(fs.readFileSync(path.join(__dirname,'..','rand','08-core-rand.js'),'utf8'));
eval(fs.readFileSync(path.join(__dirname,'..','walk','20-core-walk.js'),'utf8'));
eval(fs.readFileSync(path.join(__dirname,'39-core-cavern.js'),'utf8'));
let bad=0;const ok=(name,pass,neg)=>{const r=!!pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const throws=f=>{try{f();return false;}catch(e){return true;}};
const ground=()=>0;
/* a lung: a pipe leaving the ground and climbing the face at 30 degrees, then running level, 4 m across, its wall 1 m */
const mk=o=>{const W=KWALK.create(),C=KCAVERN.create({ground,cell:.5,chunk:16,seed:5,walk:W});const P=C.pipe(Object.assign({id:'lung',pts:[[0,2,0],[20,13.5,0],[34,13.5,4]],r:4,wall:1},o||{}));C.build();return {C,W,P};};
const {C,W,P}=mk();
ok('a pipe is a body and a bore, with a door at each open end',P.body.kind==='pipebody'&&P.bore.kind==='bore'&&P.doors.length===2&&P.doors.every(d=>d.kind==='door'),P.doors.length!==2);
const mid=[10,7.75,0];
ok('its bore is open, its wall rock, the air outside it open',C.sdf(mid[0],mid[1],mid[2])>0&&C.inRock(mid[0],mid[1],mid[2]+3.5)&&C.sdf(mid[0],mid[1],mid[2]+6)>0,C.inRock(mid[0],mid[1],mid[2]));
ok('it stands in the air: under its belly, open air',C.sdf(10,1,8)>0&&C.inRock(10,7.75-3.5,0),false);
/* the floor under the centre: scanning up from under the bore, the first open point */
const floorAt=(Cc,x)=>{const c=2+x*11.5/20;let y=c-3.2;while(Cc.inRock(x,y,0)&&y<c+3)y+=.005;return y;},f10=floorAt(C,10);
ok('the bore has a floor under its centre ('+f10.toFixed(2)+'), open air over it to the crown',f10>7.75-3&&f10<7.75-.8&&C.sdf(10,f10+1.5,0)>0,f10>=7.75);
/* stepped: the floor's heights sit on the .35 m risers' levels */
let onStep=0,n=0;for(let x=4;x<18;x+=.25){const y=floorAt(C,x);n++;const r=((y%.35)+.35)%.35;if(r<.03||r>.32)onStep++;}
ok('the floor climbs in risers ('+onStep+' of '+n+' samples on a .35 m level)',onStep>=n*.8,false);
const R0=mk({steps:0});let on0=0;for(let x=4;x<18;x+=.25){const y=floorAt(R0.C,x),r=((y%.35)+.35)%.35;if(r<.03||r>.32)on0++;}
ok('steps 0 is a ramp (its floor mostly off the risers\' levels: '+on0+' of '+n+')',on0<n*.5,on0>=n*.8);
ok('the open ends are open through the cap',C.sdf(-1.5,1.25,0)>0||C.sdf(-.8,1.6,0)>0,false);
const ax=[20/Math.hypot(20,11.5),11.5/Math.hypot(20,11.5)],cap=[-ax[0]*3.5,2-ax[1]*3.5],Cl=mk({open:[false,true]});
ok('a closed end is capped with rock; an open one is not',Cl.C.inRock(cap[0],cap[1],0)&&Cl.P.doors.length===1,C.inRock(cap[0],cap[1],0));
const M=C.meshAll(),tris=M.reduce((n,m)=>n+m.idx.length/3,0);ok('it meshes ('+tris+' triangles)',tris>2000&&M.every(m=>m.pos.every(Number.isFinite)),tris===0);
const st=W.export?W.export():null,strips=JSON.stringify(st||{}).match(/lung:bore#/g)||[];
ok('its floor is written to the walk, a strip a segment ('+strips.length+')',strips.length>=3,strips.length===0);
const E=C.export(),L=KCAVERN.load(JSON.parse(JSON.stringify(E)),{ground,walk:KWALK.create()}).build();
ok('the export loads back to the same meshes',KCAVERN.hash(L.meshAll())===KCAVERN.hash(M)&&E.prims.some(p=>p.kind==='bore'&&p.r1===3&&p.floorK===.6),KCAVERN.hash(mk({r:4.2}).C.meshAll())===KCAVERN.hash(M));
{const T=mk({r1:2.5,wall:.8});ok('a tapered pipe narrows toward its end',!T.C.inRock(34,13.5+3.6,4)&&C.inRock(34,13.5+3.6,4),!C.inRock(34,13.5+3.6,4));}
ok('a wall as thick as r, too few points, no id: refused',throws(()=>KCAVERN.create({ground}).pipe({id:'a',pts:[[0,0,0],[5,0,0]],r:2,wall:2}))&&throws(()=>KCAVERN.create({ground}).pipe({id:'a',pts:[[0,0,0]],r:2}))&&throws(()=>KCAVERN.create({ground}).pipe({pts:[[0,0,0],[5,0,0]]})),
  throws(()=>KCAVERN.create({ground}).pipe({id:'a',pts:[[0,0,0],[5,0,0]],r:2})));
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
