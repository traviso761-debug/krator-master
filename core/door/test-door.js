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
threw=false;try{K.add({w:1,h:2});}catch(e){threw=true;}
ok('a door without at is refused',threw,false);
{const Kh=KDOOR.create(),Dh=Kh.add({at:[0,0,0],yaw:0,w:1,h:2}),Dm=Kh.add({at:[3,0,0],yaw:0,w:1,h:2,sign:-1});
 ok('a door without a hinge hangs on its -x jamb (+x when sign -1)',near(Dh.hinge[0],-.5)&&near(Dm.hinge[0],3.5),!near(Dh.hinge[0],-.5));}
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
// a door built open: its walk blocks off from the start; a locked one ignores open
const W4=KWALK.create(),K4=KDOOR.create();W4.floor({rect:[-10,10,-10,10],y:0,name:'yard'});
const G=K4.add({id:'gate',at:[0,0,0],hinge:[-.5,0,0],w:1,h:2,open:1}),Lk=K4.add({id:'cell',at:[4,0,0],hinge:[3.5,0,0],w:1,h:2,locked:true,open:1});
K4.walk(W4);
ok('a door built open stands open, its doorway clear; a locked one is shut whatever it was given',
  G.open===1&&G.target===1&&W4.blocked(0,0,0,.2,1.7)===null&&Lk.open===0&&W4.blocked(4,0,0,.2,1.7)!==null,G.open!==1);
// clearDoorways leaves a locked door's line alone (a solid body's mass), unless asked
const mass=W4.block([3.3,4.7,-.1,.1,0,3],'mass'),wallG=W4.block([-.6,.6,-.1,.1,0,3],'wallG');
K4.clearDoorways(W4);
ok('clearDoorways switches off the wall in an unlocked doorway, not the mass behind a locked one',wallG.off&&!mass.off,mass.off);
K4.clearDoorways(W4,{locked:true});
ok('o.locked true clears the locked doorways too',mass.off,!mass.off);
// the kinds: each opened fully (step to rest), its leaves read
const KK=KDOOR.create(),openFull=(D,o)=>{KK.open(D,o);for(let i=0;i<60;i++)KK.step(.1);return KK.leaves(D);};
{const Dd=KK.add({id:'dbl',preset:'double',at:[0,0,0],yaw:0,w:2,h:2.2});
 const L0=KK.leaves(Dd);
 ok('a double door is two leaves, each half the doorway, shut a quarter-width either side of the middle',
   L0.length===2&&KK.leafSize(Dd)[0]===1&&near(L0[0].p[0],-.5)&&near(L0[1].p[0],.5)&&L0[0].ang===0,L0.length!==2);
 const L=openFull(Dd);
 ok('open, the left leaf turns +SWING about the -x jamb, the right -SWING about the +x jamb, each half its width from its jamb',
   near(L[0].ang,KK.SWING)&&near(L[1].ang,-KK.SWING)&&near(Math.hypot(L[0].p[0]+1,L[0].p[2]),.5,1e-6)&&near(Math.hypot(L[1].p[0]-1,L[1].p[2]),.5,1e-6),near(L[0].ang,0));}
{const Ds=KK.add({id:'sal',preset:'saloon',at:[5,0,0],yaw:0,w:1.2,h:1.1});
 KK.open(Ds,{from:[5,3]});for(let i=0;i<12;i++)KK.step(.1);let L=KK.leaves(Ds);const inward=L[0].ang>0&&L[1].ang<0;for(let i=0;i<60;i++)KK.step(.1);
 ok('a saloon door is a sprung pair: open, then shut by itself',KK.leafCount(Ds)===2&&Ds.open===0,Ds.open!==0);
 KK.open(Ds,{from:[5,-3]});for(let i=0;i<8;i++)KK.step(.1);L=KK.leaves(Ds);
 ok('a double-acting door swings away from its opener: from outside into the room, from inside out',inward&&L[0].ang<0&&L[1].ang>0,!inward);}
{const Dsl=KK.add({id:'pk',preset:'pocket',at:[10,0,0],yaw:0,w:1,h:2}),L=openFull(Dsl);
 ok('a sliding door slides its width along the line toward its hinge jamb, unturned',near(L[0].p[0],9)&&near(L[0].p[2],0)&&L[0].ang===0,near(L[0].p[0],10));}
{const Db=KK.add({id:'bp',preset:'biparting',at:[0,0,10],yaw:0,w:2,h:2}),L=openFull(Db);
 ok('a bi-parting door slides its halves apart, each its own width',near(L[0].p[0],-1.5)&&near(L[1].p[0],1.5),near(L[0].p[0],-.5));}
{const Dp=KK.add({id:'pc',preset:'portcullis',at:[0,0,20],yaw:0,w:3,h:4}),L=openFull(Dp),
   Dr=KK.add({id:'rs',preset:'roller',at:[5,0,20],yaw:0,w:3,h:3}),R=openFull(Dr);
 ok('a portcullis lifts its height; a roller shutter rolls up into its head',near(L[0].p[1],6)&&R[0].s[1]<.05&&R[0].p[1]>2.9,near(L[0].p[1],2));}
{const Df=KK.add({id:'bf',preset:'bifold',at:[0,0,30],yaw:0,w:1.2,h:2}),L=openFull(Df);
  ok('a bifold is two panels a side: they fold to the hinge jamb, the second turned back the other way',
   L.length===2&&near(L[0].ang,-L[1].ang)&&L[0].ang>1.3&&L[1].p[0]<-.4&&L[0].p[2]<29.8&&near(L[1].p[2],L[0].p[2],1e-6),L.length!==2);}
{const Di=KK.add({id:'ir',preset:'iris',at:[0,0,40],yaw:0,w:2,h:2}),L=openFull(Di);
 ok('an iris shrinks to its middle',L[0].s[0]<.05&&near(L[0].p[0],0),L[0].s[0]>.5);}
{const Wh=KWALK.create(),Kh=KDOOR.create(),Dh=Kh.add({id:'tr',preset:'hatch',at:[0,3,0],yaw:0,w:1,h:1,t:.06});Kh.walk(Wh);
 const s0=Kh.leaves(Dh)[0].p.slice();Kh.open(Dh);for(let i=0;i<60;i++)Kh.step(.1);const L=Kh.leaves(Dh)[0];
 ok('a hatch lies in the floor from its hinge edge; open, it turns up about the doorway\'s line (no walk blocks)',
   near(s0[1],3)&&near(s0[2],.5)&&L.p[1]>3.4&&Array.isArray(L.ax)&&Dh.blocks.length===0,L.p[1]<=3);}
// vertical doors
{const Db=KK.add({id:'bl',preset:'blast',at:[0,0,50],yaw:0,w:4,h:4,t:.5}),S0=KK.leaves(Db).map(L=>L.p[1]);
 ok('a blast door is two halves across the middle height, each h/2: shut they meet at 2 m',KK.leafCount(Db)===2&&KK.leafSize(Db)[1]===2&&near(S0[0],3)&&near(S0[1],1),S0.length!==2);
 KK.open(Db);for(let i=0;i<9;i++)KK.step(.1);const mid=Db.open;for(let i=0;i<60;i++)KK.step(.1);const L=KK.leaves(Db);
 ok('open, the top half rises its height and the bottom sinks into the floor (slowly: rate .35)',near(L[0].p[1],5)&&near(L[1].p[1],-1)&&mid<.5,mid>=.5);}
{const Df=KK.add({id:'fg',preset:'floodgate',at:[10,0,50],yaw:0,w:3,h:2}),L=openFull(Df);
 ok('a floodgate sinks its height into the floor',near(L[0].p[1],-1),near(L[0].p[1],1));}
{const Dp=KK.add({id:'pc2',preset:'portcullis',at:[20,0,50],yaw:0,w:3,h:4,rise:3.4}),L=openFull(Dp);
 ok('a portcullis lifts as far as its rise',near(L[0].p[1],2+3.4),near(L[0].p[1],6));}
{const Dg=KK.add({id:'gar',preset:'garage',at:[30,0,50],yaw:0,w:2.6,h:2.2,t:.06}),L=openFull(Dg);
 ok('an up-and-over door turns about its head line, its foot swung out and up (near level overhead)',
   Array.isArray(L[0].ax)&&L[0].p[1]>2&&L[0].p[2]>50.9&&Math.abs(L[0].ang)>1.4,L[0].p[1]<=1.2);}
threw=false;try{KK.add({preset:'nope',at:[0,0,0],w:1,h:2});}catch(e){threw=true;}
let threw2=false;try{KK.add({kind:'nope',at:[0,0,0],w:1,h:2});}catch(e){threw2=true;}
ok('an unknown preset or kind is refused',threw&&threw2,false);
ok('export carries each door\'s kind, pair and style',KK.export().doors.find(d=>d.id==='sal').kind==='swing'&&KK.export().doors.find(d=>d.id==='sal').pair&&KK.export().doors.find(d=>d.id==='pc').style==='grille',false);
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
{const conv=[];function FakeMat(o){this.color={hex:o.color,convertSRGBToLinear(){conv.push(this.hex);return this;}};this.userData={};}
 const T={MeshStandardMaterial:FakeMat,Color:function(){},DoubleSide:2,FrontSide:0};KGLASS.material(T,'room');KGLASS.material(T,'clear');
 ok('the room card\'s colour is taken as sRGB (converted to linear), the glass kinds\' as given',conv.length===1&&conv[0]===0x6e5a46,conv.length!==1);}
threw=false;try{KGLASS.material({},'nope');}catch(e){threw=true;}
ok('an unknown glass kind is refused',threw,false);
// a stub three.js: enough for KGLASS.material and KDOORHOST.posed (the host's other calls need the real one)
const T0={DoubleSide:2,FrontSide:0,MeshStandardMaterial:function(p){Object.assign(this,p);this.userData={};},Color:function(h){this.hex=h;}};
const gl=KGLASS.material(T0,'lit'),gc=KGLASS.material(T0,'lit',{emissive:0x9fd8ff}),gs=KGLASS.material(T0,'stained',{color:0x336699});
ok('a lit pane glows the kind\'s warm colour; opt.emissive gives another glow (cached apart), the kind\'s colour kept',
  gl.emissive.hex===KGLASS.SPEC.lit.emissive&&gc.emissive.hex===0x9fd8ff&&gc!==gl&&gc.color===KGLASS.SPEC.lit.color&&KGLASS.material(T0,'lit')===gl,gc===gl);
ok('a stained pane still glows its own colour',gs.emissive.hex===0x336699,gs.emissive.hex!==0x336699);
eval(fs.readFileSync(path.join(__dirname,'90-core-door-host.js'),'utf8'));
KDOOR.clear();const P1=KDOOR.add({id:'shop.0.d0',at:[0,0,0],hinge:[-.5,0,0],w:1,h:2});let calls=0,last=null;
KDOORHOST.posed(P1,(D,p)=>{calls++;last=p;});KDOOR.open(P1);for(let i=0;i<30;i++)KDOORHOST.tick(.1);
ok('a posed leaf: the page\'s function is called as the door moves, with KDOOR.pose\'s centre and swing',calls>3&&near(last[3],KDOOR.SWING),calls===0);
calls=0;for(let i=0;i<5;i++)KDOORHOST.tick(.1);
ok('a door at rest is not posed again',calls===0,calls!==0);
// the host (90-core-door-host.js) and the leaves' look (30-core-door-leaf.js): the leaf styles' geometry and a pair's two instances, on the repo's three.js r128 (skipped without it)
{const T3=path.join(__dirname,'..','..','kits','ancients','three.min.js');let THREE=null;
 try{const src=fs.readFileSync(T3,'utf8');if(src.length>100000){const m={exports:{}};new Function('module','exports',src)(m,m.exports);THREE=m.exports;}}catch(e){}
 if(!THREE||!THREE.BoxGeometry)console.log('SKIP  the host checks (no three.js at kits/ancients/three.min.js: git lfs pull it)');
 else{global.THREE=THREE;delete global.KDOORHOST;eval(fs.readFileSync(path.join(__dirname,'90-core-door-host.js'),'utf8'));eval(fs.readFileSync(path.join(__dirname,'30-core-door-leaf.js'),'utf8'));
  const bb=g=>{g.computeBoundingBox();const b=g.boundingBox;return[b.min.x,b.min.y,b.min.z,b.max.x,b.max.y,b.max.z];};
  let allIn=true,glazedOk=false;for(const st of KDOORLEAF.STYLES){const G=KDOORLEAF.geometry(THREE,st),B=bb(G.frame);
   if(B.some(v=>!isFinite(v)||Math.abs(v)>.5001))allIn=false;if(st==='glazed')glazedOk=!!G.glass&&bb(G.glass).every(v=>Math.abs(v)<=.5);}
  ok('every leaf style is a unit leaf (its frame within [-.5, .5]); glazed carries a light of glass',allIn&&glazedOk&&KDOORLEAF.STYLES.length>=9,!allIn);
  const Kh=KDOOR,save=Kh.list.slice();Kh.clear();
  const Dg=Kh.add({id:'glz',preset:'double',style:'glazed',at:[0,0,0],yaw:0,w:2,h:2.2,t:.06}),ms=KDOORLEAF.meshes(THREE,'glazed',{frame:new THREE.MeshStandardMaterial(),glass:new THREE.MeshStandardMaterial()},2);
  KDOORHOST.instanced(Dg,ms,[0,1],new THREE.Quaternion());Kh.open(Dg);for(let i=0;i<40;i++)KDOORHOST.tick(.1);
  const m0=new THREE.Matrix4(),m1=new THREE.Matrix4(),g0=new THREE.Matrix4();ms[0].getMatrixAt(0,m0);ms[0].getMatrixAt(1,m1);ms[1].getMatrixAt(0,g0);
  const p0=new THREE.Vector3().setFromMatrixPosition(m0),p1=new THREE.Vector3().setFromMatrixPosition(m1),sc=new THREE.Vector3().setFromMatrixScale(m0);
  ok('a glazed double door: two leaves posed open about their jambs, each half the doorway, its glass set with its frame',
   ms.length===2&&near(Math.hypot(p0.x+1,p0.z),.5,1e-5)&&near(Math.hypot(p1.x-1,p1.z),.5,1e-5)&&near(sc.x,1,1e-5)&&m0.equals(g0),ms.length!==2);
  Kh.clear();}}
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
