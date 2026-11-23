// node core/walk/frame/test-walk-frame.js — floors that ride (KWALKFRAME): each check with a broken input that must fail.
const fs=require('fs'),path=require('path');
global.window=global;
eval(fs.readFileSync(path.join(__dirname,'..','20-core-walk.js'),'utf8'));
eval(fs.readFileSync(path.join(__dirname,'26-core-walk-frame.js'),'utf8'));
let bad=0;const ok=(name,pass,neg)=>{const r=pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const near=(a,b,e)=>Math.abs(a-b)<(e==null?1e-9:e);

// a station: a platform along z = 3..6 beside a track along x; a hall floor away from the track
const W=KWALK.create();
const plat=W.floor({rect:[-50,50,3,6],y:1.1,name:'platform'});
W.floor({rect:[200,220,0,10],y:0,name:'hall'});
W.block([205,206,4,6,0,3],'pillar');
const f0=W.floorsAt;
ok('a registry with no frame keeps its own lookups (nothing wrapped)',W.floorsAt===f0&&!W._frame,W._frame);
const before=JSON.stringify([W.floorsAt(210,5),W.blocked(204.8,0,5),W.push(204.9,0,5)].map(x=>x&&x.map?x.map(y=>Array.isArray(y)?y[0]:y):x&&x.box));

// a car 2.6 m wide and 12 m long, facing +x (yaw pi/2), moving along x at 10 m/s from x=0, its floor 1.1 m up
const V=10,car=t=>({x:V*t,y:0,z:0,yaw:Math.PI/2});
const F=KWALKFRAME.frame(W,{id:'car1',pose:car,source:{ride:'test',k:0}});
F.floor({rect:[-1.3,1.3,-6,6],y:1.1,name:'saloon'});
F.block([-1.5,-1.3,-6.2,6.2,1.1,3.2],'wall-');
const wallR=[F.block([1.3,1.5,-6.2,-0.6,1.1,3.2],'wall+'),F.block([1.3,1.5,0.6,6.2,1.1,3.2],'wall+')];
const door=F.block([1.3,1.5,-0.6,0.6,1.1,3.2],'door');
const plate=F.floor({rect:[1.3,1.65,-0.6,0.6],y:1.1,name:'plate',off:true});
const seatWall=F.block([-1.3,-0.2,4,4.2,1.1,2.2],'seatback');

ok('the static answers away from the car are what they were',JSON.stringify([W.floorsAt(210,5),W.blocked(204.8,0,5),W.push(204.9,0,5)].map(x=>x&&x.map?x.map(y=>Array.isArray(y)?y[0]:y):x&&x.box))===before,false);
KWALKFRAME.at(W,0);
// side +1 of a car facing +x is -z (cos yaw, -sin yaw) = (0,-1): the car's door side faces -z here
ok('the car frame: local +z (forward) is world +x, local +x (side +1) is world -z',
  near(KWALKFRAME.toWorld(F,[0,0,1],0)[0],1)&&near(KWALKFRAME.toWorld(F,[1,0,0],0)[2],-1),near(KWALKFRAME.toWorld(F,[0,0,1],0)[2],1));
ok('round trip world -> car -> world',(()=>{const p=[3.3,1.7,-0.4],q=KWALKFRAME.toWorld(F,KWALKFRAME.toLocal(F,p,2.5),2.5);return near(q[0],p[0])&&near(q[1],p[1])&&near(q[2],p[2]);})(),false);
const on0=W.floorsAt(4,0);
ok('at t=0 the car floor is under (4,0), tagged with its frame',on0.length===1&&near(on0[0][0],1.1)&&on0[0][1].frame===F,W.floorsAt(4,30).length!==0);
KWALKFRAME.at(W,10);
ok('at t=10 the car has gone 100 m: no floor at (4,0), its floor at (104,0)',W.floorsAt(4,0).length===0&&W.floorsAt(104,0).length===1,W.floorsAt(104,0).length===0);
ok('floorBelow stands a walker on the moving floor',W.floorBelow(104,0,1.1)[1].name==='saloon',W.floorBelow(104,0,0.2)!==null);
ok('the far wall blocks a walker in the car',W.blocked(100,1.2,1.35)!==null,W.blocked(100,1.2,0.5)!==null);
ok('a block the walker stands above does not stop it',W.blocked(100,3.4,1.35)===null,W.blocked(100,3.0,1.35)===null);
const pp=W.push(100,1.2,1.15);
ok('push moves a walker out of the moving wall (local x -1.3 + 0.3 = world z 1.0)',near(pp[1],1.0,1e-6)&&near(pp[0],100,1e-6),near(pp[1],1.15));

// the door at a stand: the car halted beside the platform (side +1 toward the platform: yaw -pi/2 makes side +1 = +z)
const W2=KWALK.create();W2.floor({rect:[-50,50,1.65,6],y:1.1,name:'platform'});W2.floor({rect:[-50,50,-10,10],y:0,name:'trackbed'});
const G=KWALKFRAME.frame(W2,{id:'car2',pose:t=>({x:t<20?0:(t-20)*8,y:0,z:0,yaw:-Math.PI/2})});
G.floor({rect:[-1.3,1.3,-6,6],y:1.1,name:'saloon'});
G.block([-1.5,-1.3,-6.2,6.2,1.1,3.2],'wall-');G.block([1.3,1.5,-6.2,-0.6,1.1,3.2],'wall+');G.block([1.3,1.5,0.6,6.2,1.1,3.2],'wall+');
const door2=G.block([1.3,1.5,-0.6,0.6,1.1,3.2],'door');
const plate2=G.floor({rect:[1.3,1.65,-0.6,0.6],y:1.1,name:'plate',off:true});
ok('car 2: side +1 faces the platform (+z)',near(KWALKFRAME.toWorld(G,[1,0,0],0)[2],1),false);
KWALKFRAME.at(W2,5);
const gapAt=[0,1.1,1.5];                                  /* over the step plate, between the car's side and the platform edge */
ok('doors shut: the door blocks the way out',W2.blocked(0,1.2,1.2)!==null,false);
ok('doors shut: the plate is off, so the gap is only the trackbed below',W2.floorBelow(gapAt[0],gapAt[2],1.1)[1].name==='trackbed',W2.floorBelow(gapAt[0],gapAt[2],1.1)[1].name==='plate');
W2.setBlock(door2,false);KWALKFRAME.setFloor(plate2,true);
ok('doors open: the doorway is clear and the plate bridges the gap',W2.blocked(0,1.2,1.2)===null&&W2.floorBelow(0,1.5,1.1)[1].name==='plate',W2.blocked(1.0,1.2,1.2)===null);
const R2=G.walk.reach([[0,1.1,0]],{step:0.45});
ok('every floor of the car is reached from inside its door (in its own frame)',R2.unreached.length===0,false);
W2.setBlock(door2,true);KWALKFRAME.setFloor(plate2,false);
let threw=false;try{KWALKFRAME.setFloor(door2,true);}catch(e){threw=true;}ok('setFloor refuses a block',threw,false);

// carry: a walker standing in the car at t0 is where the car took it at t1, to the millimetre; the negative: a pose read late
const p0=[16.5,1.1,0.4];KWALKFRAME.at(W2,22);
const local=KWALKFRAME.toLocal(G,p0,22),c=KWALKFRAME.carry(W2,p0,22,27),truth=KWALKFRAME.toWorld(G,local,27);
const drift=Math.hypot(c.p[0]-truth[0],c.p[1]-truth[1],c.p[2]-truth[2]);
const late=KWALKFRAME.carry(W2,p0,22,28).p,lateD=Math.hypot(late[0]-truth[0],late[2]-truth[2]);
ok('carry holds the walker in the car (drift under a millimetre over 5 s at 8 m/s)',c.frame===G&&drift<1e-3&&near(c.p[0]-p0[0],40,1e-6),lateD<1e-3);
const st=KWALKFRAME.carry(W2,[10,1.1,4],22,27);
ok('a walker on the platform is not carried',st.frame===null&&st.p[0]===10,st.frame!==null);

// a pitched car on a 4 % grade, turning: heights follow the pitch; carry reports the turn
const W3=KWALK.create(),pitch=Math.atan(0.04);
const H=KWALKFRAME.frame(W3,{id:'car3',pose:t=>({x:0,y:10,z:0,yaw:0.1*t,pitch:pitch})});
H.floor({rect:[-1.3,1.3,-6,6],y:1.1});
KWALKFRAME.at(W3,0);
const exact=KWALKFRAME.toWorld(H,[0,1.1,5],0),got=W3.floorsAt(exact[0],exact[2]);
ok('a pitched floor reads its true height over a world point (within 2 mm)',got.length===1&&near(got[0][0],exact[1],2e-3),near(got[0][0],11.1,2e-3));
const turn=KWALKFRAME.carry(W3,[0,11.1,0],0,2);
ok('carry reports the frame\'s turn (0.2 rad over 2 s)',near(turn.dyaw,0.2),near(turn.dyaw,0));
ok('a pose within 0.1 rad is not counted steep',H.steep===0,false);
const Hs=KWALKFRAME.frame(W3,{id:'steep',pose:()=>({x:500,y:0,z:0,pitch:0.3})});Hs.floor({rect:[-1,1,-1,1],y:0});KWALKFRAME.pose(Hs,1);
ok('a steeper pose is counted, not refused',Hs.steep===1,Hs.steep===0);

// the export: each frame's records in its own coordinates, the switched-off plate marked
const E=KWALKFRAME.export(W);
ok('the export lists the frame with its source, local floors and blocks, the plate off',
  E.format==='krator-walk-frames'&&E.frames.length===1&&E.frames[0].source.ride==='test'&&E.frames[0].floors.length===2&&E.frames[0].floors[1].off===true&&E.frames[0].blocks.length===5,
  E.frames[0].floors[0].off===true);
ok('the world export leaves the frames out (they are not static)',W.export().floors.length===2,W.export().floors.length!==2);

threw=false;try{KWALKFRAME.frame(W,{id:'car1',pose:car});}catch(e){threw=true;}ok('a duplicate frame id is refused',threw,false);
threw=false;try{KWALKFRAME.frame(W,{id:'x'});}catch(e){threw=true;}ok('a frame without a pose is refused',threw,false);
ok('remove takes a frame out of the lookups',KWALKFRAME.remove(W,'car1')&&W.floorsAt(104,0).length===0,KWALKFRAME.frames(W).length!==0);

console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
