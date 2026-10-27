// node core/host/test-seat-probe.js -- the probe's seat sweeps (95b-host-seat.js on 95-host-probe.js, measuring with
// core/terrain/47-core-seat.js) on a real three.js scene: a displaced PlaneGeometry ground and a box rock marked
// userData.seat, a house (solid), flora cards (instanced, not solid), a door, a stair. Each check with a broken input that
// must fail. Needs three.min.js (git lfs pull biomes/sedesert/three.min.js); without it the test says SKIP and passes.
'use strict';
const fs=require('fs'),path=require('path');
const T3=['../../biomes/sedesert/three.min.js'].map(q=>path.join(__dirname,q)).find(q=>fs.existsSync(q)&&fs.statSync(q).size>10000);
if(!T3){console.log('SKIP  no three.min.js (git lfs pull)');process.exit(0);}
const THREE=require(T3);global.window=global;global.THREE=THREE;
const load=f=>eval(fs.readFileSync(path.join(__dirname,f),'utf8'));
load('../rand/08-core-rand.js');load('../space/20-core-space.js');load('../terrain/47-core-seat.js');load('95-host-probe.js');load('95b-host-seat.js');
let bad=0;const ok=(name,pass,neg)=>{const r=pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const K=KHOST,S=KSEAT;

// the scene: ground 200 m square on 20 m cells (a PlaneGeometry laid flat, displaced: what a biome draws)
const hFn=(x,z)=>.15*x+4*Math.sin((z-12)*.05);   /* level across z at the house's door (z 44) */
const gg=new THREE.PlaneGeometry(200,200,10,10);gg.rotateX(-Math.PI/2);
{const P=gg.attributes.position;for(let i=0;i<P.count;i++)P.setY(i,hFn(P.getX(i),P.getZ(i)));}
const ground=new THREE.Mesh(gg,new THREE.MeshBasicMaterial());ground.userData.seat='ground';ground.name='ground';
const rock=new THREE.Mesh(new THREE.BoxGeometry(20,30,20),new THREE.MeshBasicMaterial());rock.position.set(-60,hFn(-60,-60)+5,-60);rock.userData.seat='rock';rock.name='rock';
const hy=hFn(40,40),house=new THREE.Mesh(new THREE.BoxGeometry(10,6,8),new THREE.MeshBasicMaterial());house.position.set(40,hy+2,40);house.name='house';
const cards=new THREE.InstancedMesh(new THREE.PlaneGeometry(2,2),new THREE.MeshBasicMaterial({transparent:true}),40);
{const m=new THREE.Matrix4();for(let i=0;i<40;i++){m.makeTranslation(40+(i%5)-2,hy+1,44.5+Math.floor(i/5)*.2);cards.setMatrixAt(i,m);}}
const scene=new THREE.Scene();scene.add(ground,rock,house,cards);scene.updateMatrixWorld(true);
const drawn=S.lazy([{id:'g',box:[-100,-50,-100,100,50,100],make:()=>S.tris(gg.attributes.position.array,gg.index.array)}]);
const on=(id,x,z,dy,cls)=>({id,'class':cls||'flora',at:[x,S.down(drawn,x,z).y+(dy||0),z],foot:{r:.5}});
const recs=[on('a',10,10),on('b',-20,30),on('c',70,-40),{id:'r1','class':'prop',at:[-60,rock.position.y+15,-60],foot:{}},
 {id:'h1','class':'building',at:[40,hy,40],ry:0,size:[10,8,6]},{id:'road','class':'street',at:[40,hy,46],ry:0,size:[40,6,.2]},
 {id:'door1',kind:'door','class':'part',at:[40,null,44],ry:0,size:[1.2,.6,2.2]}];
recs[recs.length-1].at[1]=S.down(drawn,40,45).y;
let api;
function take(o){K.setView=()=>{};K.go=()=>{};K.probeTake({o:Object.assign({THREE},o),scene,registry:[],views:{},clock:{state:()=>0}});api=global._api;}
take({seat:{records:()=>recs}});

// contact
let c=api.contactSweep();
ok('contact: the placed feet (on the drawn ground, on the rock\'s top) are ok, the control floats ('+c.ok+' of '+c.n+')',c.n===4&&c.ok===4&&c.neg===true,false);
recs.push(on('float',0,-50,1.5),on('sunk',30,-60,-1.2),{id:'inrock','class':'prop',at:[-60,rock.position.y,-60],foot:{}});
c=api.contactSweep();
ok('contact: one floating 1.5 m, one sunk 1.2 m, one in the rock ('+JSON.stringify(c.by)+')',c.by.float===1&&c.by.buried===2&&c.worst.gap>1.3&&c.worst.gap<=1.5,false);
// on hFn (computed) between the 20 m cells, not on the drawn ground: the error the sweep exists to catch
const comp={id:'computed','class':'flora',at:[13,hFn(13,50),50],foot:{tol:.05}},dc=S.down(drawn,13,50).y-hFn(13,50);
ok('contact: a foot on terrainH, '+dc.toFixed(2)+' m off the drawn cell, fails',Math.abs(dc)>.05&&S.contactSweep(K.seatScene(),[comp]).fails.length===1,false);
// no seat surfaces marked: an error, never a pass
ground.userData.seat=null;rock.userData.seat=null;take({seat:{records:()=>recs}});
const none=api.contactSweep();ok('contact: with no seat surfaces marked the sweep reports an error',!!none.error&&none.n===0,false);
ground.userData.seat='ground';rock.userData.seat='rock';take({seat:{records:()=>recs}});
// the scene surface: the house and the cards are not seat surfaces; the house is solid, the cards are not
ok('seatScene: the seat surfaces only ('+K.seatScene().count+'), the solid ones ('+K.seatScene({which:'solid'}).count+')',K.seatScene().count===2&&K.seatScene({which:'solid'}).count===3,false);

// clearance: the house over the road
const cl=api.clearSweep({pairs:[['building','street']]});ok('clear: the house over the road',cl.fails.length===1&&[cl.fails[0].a,cl.fails[0].b].sort().join()==='h1,road',false);

// doors: the house's door on its south face, the skin not cut: blocked. The cards in front of it do not block (not solid)
let d=api.doorSweep();ok('doors: the uncut skin blocks the door',d.n===1&&d.fails.length===1&&d.fails[0].status==='blocked',false);
d=api.doorSweep({doors:()=>[{id:'free',at:[-30,S.down(drawn,-30,60).y,60],ry:0,w:1.2,h:2.2}]});ok('doors: a door in the open is clear',d.ok===1,false);
cards.userData.solid=true;take({seat:{records:()=>recs}});
d=api.doorSweep({doors:()=>[{id:'cards',at:[40,hy,45.5],ry:Math.PI,w:1.2,h:2.2,depth:.2,reach:1}]});
ok('doors: solid instances block when marked solid',d.fails.length===1,false);cards.userData.solid=false;take({seat:{records:()=>recs}});
house.userData.door=true;take({seat:{records:()=>recs}});
ok('doors: a mesh marked door is left out (the leaf)',api.doorSweep().ok===1,false);house.userData.door=false;take({seat:{records:()=>recs}});

// stairs: to the house's roof, and one through it
const roof=hy+5,stairs=[{id:'up',foot:[40,S.down(drawn,40,52).y,52],head:[40,roof,43.6]},{id:'thru',foot:[40,S.down(drawn,40,52).y,52],head:[40,S.down(drawn,40,28).y,28]}];
const st=api.stairSweep({stairs:()=>stairs});
ok('stairs: to the roof clear, through the house into a wall',st.ok===1&&st.fails.length===1&&st.fails[0].id==='thru'&&st.fails[0].status==='into wall',false);

// the summary and the build's own api winning
const all=api.seatSweeps();ok('seatSweeps: all four, failures counted',['contact','clear','doors','stairs'].every(k=>all[k]&&all[k].nFails!=null),false);
take({seat:{records:()=>recs},api:{contactSweep:()=>'own'}});ok('a build\'s own contactSweep in o.api wins',api.contactSweep()==='own',false);

console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
