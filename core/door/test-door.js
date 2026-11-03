// node core/door/test-door.js — the door registry's contract (and the glass spec's), each check with a broken input that must fail.
const fs=require('fs'),path=require('path');
global.window=global;
eval(fs.readFileSync(path.join(__dirname,'..','walk','20-core-walk.js'),'utf8'));
eval(fs.readFileSync(path.join(__dirname,'10-core-door.js'),'utf8'));
eval(fs.readFileSync(path.join(__dirname,'20-core-glass.js'),'utf8'));
let bad=0;const ok=(name,pass,neg)=>{const r=pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const near=(a,b,e)=>Math.abs(a-b)<(e||1e-9);
const K=KDOOR.create(),W=KWALK.create();
W.floor({rect:[-10,10,-10,10],y:0,name:'yard'});
// a door in a wall along x (its face looks +z, yaw 0), 1 m wide, hinged on its -x jamb
const A=K.add({id:'house.front',at:[0,0,0],hinge:[-.5,0,0],yaw:0,w:1,h:2,t:.07,key:'house'});
const B=K.add({id:'house.cellar',at:[5,0,0],hinge:[4.5,0,0],yaw:0,w:1,h:2,locked:true});
const C=K.add({at:[0,3,0],hinge:[-.5,3,0],w:1,h:2});
ok('a door keeps its stable id; one without gets door.<n>',K.get('house.front')===A&&C.id==='door.2',K.get('house.back')!==null);
let threw=false;try{K.add({id:'house.front',at:[0,0,0],hinge:[0,0,0],w:1,h:2});}catch(e){threw=true;}
ok('a taken id is refused',threw,false);
threw=false;try{K.add({at:[0,0,0],w:1,h:2});}catch(e){threw=true;}
ok('a door without a hinge is refused',threw,false);
ok('the shut leaf stands at its doorway, half its height up',near(A.p0[1],1)&&near(K.pose(A)[0],0)&&near(K.pose(A)[3],0),near(K.pose(A)[3],1));
ok('a locked door does not open',K.open(B)===false&&B.target===0,K.open(A)===false);
ok('open by id, by the record, and toggle back',K.open('house.front',{by:'npc'})&&A.by==='npc'&&K.toggle(A)&&A.target===0,A.target!==0);
ok('nearest finds the unlocked door in reach, not the locked one nor the one a storey up',
  K.nearest(.3,0,.5)===A&&K.nearest(5,0,.2)===null&&K.nearest(0,0,0,.1)===A,K.nearest(0,0,3.5)!==null);
// walk: shut blocks the doorway, open clears it once past half
K.walk(W);
ok('each door puts blocks along its doorway (1 m: 4 of them)',A.blocks.length===4,A.blocks.length===0);
ok('shut, a walker in the doorway is blocked',W.blocked(0,0,0,.2,1.7)!==null,W.blocked(0,0,1.5,.2,1.7)!==null);
K.open(A);let moved=K.step(.3);
ok('a door moving is in step()\'s list',moved.indexOf(A)>=0,moved.indexOf(B)>=0);
ok('a quarter-way door still blocks',A.open<.5&&W.blocked(0,0,0,.2,1.7)!==null,A.open>=.5);
for(let i=0;i<20;i++)K.step(.1);
ok('open, the doorway is clear and the door is at 1',A.open===1&&W.blocked(0,0,0,.2,1.7)===null,A.open<1);
ok('open, the leaf has turned SWING about its hinge into the room',near(K.pose(A)[3],K.SWING)&&near(Math.hypot(K.pose(A)[0]-A.hinge[0],K.pose(A)[2]-A.hinge[2]),.5,1e-6),near(K.pose(A)[3],0));
// auto-close
K.close(A);for(let i=0;i<30;i++)K.step(.1);
K.open(A,{auto:1});for(let i=0;i<20;i++)K.step(.1);const wasOpen=A.open;for(let i=0;i<40;i++)K.step(.1);
ok('an auto door shuts itself after its seconds',wasOpen===1&&A.open===0&&W.blocked(0,0,0,.2,1.7)!==null,A.open!==0);
// a mirrored leaf turns the other way
const M=K.add({id:'hall.r',at:[0,0,6],hinge:[.5,0,6],yaw:0,w:1,h:2,sign:-1});K.open(M);for(let i=0;i<30;i++)K.step(.1);
ok('a right-hand leaf turns the other way',near(K.angle(M),-K.SWING),near(K.angle(M),K.SWING));
// clearDoorways: a room wall standing in a doorway is switched off, one beside it is not
const W2=KWALK.create(),K2=KDOOR.create();
const D2=K2.add({id:'d',at:[0,0,0],hinge:[-.5,0,0],yaw:0,w:1,h:2});K2.walk(W2);
const wallIn=W2.block([-.6,.6,-.1,.1,0,3],'wall'),wallBeside=W2.block([2,3,-.1,.1,0,3],'wall2');
const n=K2.clearDoorways(W2);
ok('a wall across the doorway is switched off, one beside it is kept, the leaf\'s own blocks are back on',
  n>=1&&wallIn.off&&!wallBeside.off&&D2.blocks.every(b=>!b.off),!wallIn.off);
// prune, state, load, export
const keepList=K.list;K.prune(D=>D.id!=='door.2');
ok('prune drops in place (the same array) and frees the id',K.list===keepList&&K.get('door.2')===null&&K.list.length===3,K.list.length!==3);
K.lock(A,true);const st=K.state();
ok('state keeps only the doors changed from shut and as built (one locked since, one open; not the cellar, locked as built)',
  !!st['house.front']&&st['house.front'].locked&&!!st['hall.r']&&st['hall.r'].open===1&&st['house.cellar']===undefined,Object.keys(st).length!==2);
const K3=KDOOR.create();K3.add({id:'house.front',at:[0,0,0],hinge:[-.5,0,0],w:1,h:2});K3.add({id:'hall.r',at:[0,0,6],hinge:[.5,0,6],w:1,h:2,sign:-1});K3.load(st);
ok('load puts the deltas back by id',K3.get('house.front').locked&&K3.get('hall.r').target===1,K3.get('hall.r').target!==1);
const E=K.export();
ok('export is plain records: no blocks, no draw handles',E.format==='krator-doors'&&E.doors.length===3&&!('blocks' in E.doors[0])&&!('draw' in E.doors[0]),E.doors.length!==3);
// glass
ok('every glass kind has a colour and an opacity; panes are transparent, the room card is not',
  KGLASS.kinds().every(k=>typeof KGLASS.SPEC[k].color==='number'&&KGLASS.SPEC[k].opacity>0)&&KGLASS.SPEC.clear.transparent&&!KGLASS.SPEC.room.transparent,KGLASS.SPEC.room.transparent);
ok('the clear pane is Iziz\'s glass (0xb4ccd2, .22)',KGLASS.SPEC.clear.color===0xb4ccd2&&KGLASS.SPEC.clear.opacity===.22,KGLASS.SPEC.clear.opacity!==.22);
threw=false;try{KGLASS.material({},'nope');}catch(e){threw=true;}
ok('an unknown glass kind is refused',threw,false);
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
