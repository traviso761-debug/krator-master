// ================================================================= HOST — Longsong's views, inspector words and checks, handed to core/host
// The camera, the frame loop, the panel, the inspector, the marks (polygon tool), the minimap, the editor and window._api
// are core/host's (core/host/README.md): this fragment says what this page has.
const gh=(x,z,dy)=>terrainH(x,z)+(dy||0);
const VIEWS=(function(){const V={},PR=LS.PROCRASTINATOR,T=LS.ROCK.top;
 V['Longsong from across the stream (north)']=[-160,62,-640,0,52,40];
 V['The White Palace from the avenue']=[0,gh(0,-120,1.7),-120,0,46,40];
 V['The Great Gate and the bridge']=[70,gh(70,-330,12),-330,0,gh(0,-200,8),-200];
 V['Over the ward from the Eastern Watch']=[96,T+11*4.5+5,112,-40,-4,-120];   // over its top (11 storeys), not inside its louvres
 V['The festival: the great thangka from the forecourt']=[104,2,-44,78,14,10];   // ?festival=1 (east of the stair's landing, which hides it from the west)
 V['The pilgrims\' camp (festival days)']=[110,-1.2,-69,150,-4.2,-82];   // between the dairy and the infirmary
 V['The Debate Court']=[16,T+32,34,-4,T+1,54];   // high over the court's south-east corner, clear of the ranges' roofs
 V['The roof: the gilded roofs and the Hall of Hours']=[-90,T+7*4.5+14,62,10,T+7*4.5+6,120];
 V['The drill ground (lightning hands)']=[LS.DRILL.x+26,gh(LS.DRILL.x,LS.DRILL.z,6),LS.DRILL.z-28,LS.DRILL.x,gh(LS.DRILL.x,LS.DRILL.z,1),LS.DRILL.z];
 V['The hermits\' cliff (east face)']=[290,30,60,150,20,90];
 V['The lotus pond and the valley road']=[LS.POND.x+70,LS.POND.y+9,LS.POND.z-70,LS.POND.x,LS.POND.y+1,LS.POND.z];
 V['The open vault (the forbidden depths)']=[16,LS.VAULT_Y+2.2,80,-50,LS.VAULT_Y+2,96];
 V['The Procrastinator']=[PR.x+17,PR.y0+8,PR.z-14,PR.x,PR.y0+12,PR.z];
 V['Through the Warden\'s gate into the open vault']=[44,LS.VAULT_Y+1.8,88,10,LS.VAULT_Y+1.6,88];
 V['Down the Long Stair\'s foot into the hall']=[0,PR.y0+2,128.5,0,PR.y0+6,150];
 V['The Procrastinator from below']=[PR.x-6,PR.y0+1.8,PR.z-20,PR.x,PR.y0+24,PR.z];
 V['From afar (the valley and its walls)']=[-1400,260,-2600,0,40,0];
 // the exterior revision and the farms (ROOMS.md sections 1, 2, 5)
 {const C=LS.COURT;V['The Chapterhouse Court (inside the gate)']=[C.x+26,gh(C.x,C.z,9),C.z-22,C.x,gh(C.x,C.z,1),C.z+6];}
 {const P=LS.building('printing-house'),H=LS.building('hall-of-forms');
  V['The Printing House (a small Archive)']=[P.x+48,LS.baseY(P)+16,P.z-34,P.x,LS.baseY(P)+5,P.z];
  V['The Hall of Forms (the School)']=[H.x-30,LS.baseY(H)+9,H.z-26,H.x,LS.baseY(H)+4,H.z];}
 V['The Assembly drum and the Debate Court\'s arcades']=[0,T+30,-30,0,T+14,70];
 V['The Eastern Watch (the louvre tower)']=[150,T+40,40,96,T+40,118];
 V['The east fields and the chorten garden']=[230,gh(230,-150,40),-170,420,gh(420,60,0),60];
 V['The south terraces and the tea garden']=[0,gh(0,250,60),220,-60,gh(-60,560,0),560];
 V['The Garden of Held Water']=[LS.HELD.x1+8,T+7,LS.HELD.z1-2,LS.HELD.fountain.x,T+2,LS.HELD.fountain.z];
 // the water on core/water (2026-10-19): the canal, its wheels, the rice pools, the stream
 V['The rice pools and the tsampa mill']=[-60,gh(-60,-262,14),-262,-150,gh(-150,-252,0),-252];
 V['The paper mill\'s wheel and its race']=[-130,gh(-130,-184,6),-184,-150,gh(-150,-193.5,1),-193.5];
 V['The stream from the bridge']=[0,BRIDGE.deck+5,BRIDGE.z,-320,BRIDGE.water,-280];
 V['The yak pastures']=[-600,gh(-600,876,2.6),876,-626,gh(-626,904,.8),904];
 // the interiors (P4, 2026-10-19): the eye in a room draws its floor (87); the cutaway (X) opens a palace storey by storey
 {const R=LS.ROOMS.byId,I=(id,f)=>{const r=R[id];return f(r,(r.x0+r.x1)/2,(r.z0+r.z1)/2);};
  V['Inside the Great Assembly Hall (the skylight columns)']=I('wp.assembly',(r,x,z)=>[r.circle.x-3,r.y+3.4,r.circle.z-r.circle.r+1.6,r.circle.x+1,r.y+2.2,r.circle.z+8]);
  V['The Hall of the Founders (the chortens)']=I('rp.k0.founders',(r,x,z)=>[x+6,r.y+3.2,r.z0+1.2,x-2,r.y+1.8,r.z1-3]);
  V['The Chapel of the Lost Monastery']=I('rp.k0.lost-chapel',(r,x,z)=>[r.x1-1,r.y+2.4,r.z1-1,r.x0,r.y+1.3,z]);
  V['Archive Stacks I: the Peoples']=I('rp.k2.stacks-peoples',(r,x,z)=>[r.x1-1.2,r.y+2.6,r.z0+1.2,r.x0+10,r.y+.8,r.z1-12]);
  V['The Catalogue of the Archive']=I('rp.k0.catalogue',(r,x,z)=>[x,r.y+2.4,r.z0+1,x,r.y+1,r.z1-6]);
  V['A lecture hall of the School (the Cataclysm)']=I('wp.k0.w.out.cataclysm',(r,x,z)=>[x+4,r.y+2.8,r.z1-1,x-1,r.y+1,r.z0+1]);
  V['A monk\'s cell']=I('wp.k1.cells-w.a06',(r,x,z)=>[r.x1-.5,r.y+1.7,z+1.2,r.x0,r.y+.6,z-.6]);
  V['The Library\'s reading rooms']=I('wp.k2.library',(r,x,z)=>[r.x0+1,r.y+2.6,r.z0+1,r.x0+20,r.y+1,r.z1-1]);
  V['The refectory']=I('wp.k1.refectory',(r,x,z)=>[r.x1-1,r.y+3,r.z0+1,x-3,r.y+.4,r.z0+22]);
  V['The Council of the Order']=I('rp.k5.council.council',(r,x,z)=>[r.x1-2,r.y+3.4,r.z0+2,x,r.y+.8,z]);
  V['The Chronicle Hall']=I('rp.k7.chronicle',(r,x,z)=>[x+8,r.y+4,r.z1-1.5,x,r.y+1.2,r.z0+4]);
  V['The Hall of Hours (the clocks)']=I('lr.hours',(r,x,z)=>[r.circle.x,r.y+2.4,r.circle.z-r.circle.r+1,r.circle.x,r.y+1.4,r.circle.z+2]);}
 return V;})();

// ---------------------------------------------------------------- the inspector's words: the record under the hit (a
// building, a sealed thing, a person), the plan's zone, a plant's species and harvest
function describe(hit){const p=hit.point,o=hit.object;
 let best=null;for(const r of REG){if(r.r>1500)continue;const dx=p.x-r.x,dz=p.z-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p.y>=(r.y||0)-2&&p.y<=(r.y||0)+r.h+5){if(!best||r.r<best.r)best=r;}}
 const item=o.isInstancedMesh&&o.userData.biome?(o.name||'').replace(/^biome:/,''):null,PLT=item&&OIDONG.plantOfItem(item),S=best&&best.key&&OIDONG.byKey[best.key];
 const tg=S?S.tags:(PLT?PLT.tags:null),Z=LS.zoneAt(p.x,p.z);
 let head=PLT?PLT.name:S?S.name:best?best.name:(o.userData.inspectLabel||item||o.name||'mesh');
 const cls=o.userData.cls||(best&&best.cls)||(tg?'flora':'terrain');
 let words=head+'\n'+cls+(best&&best.tags&&best.tags.culture?' · '+KTAGS.VOCAB.cultureNames[best.tags.culture]:'')+(best&&best.tags&&best.tags.types?' · '+best.tags.types.join(', '):'');
 if(best&&best.sealed){const E=best.sealed;words+='\n'+E.id+' · class '+E.cls+'\n'+E.what+'\nProcedure: '+E.proc;}
 const Pn=o.userData.people?PEOPLE_DRAWN.personOf(o,hit.instanceId):null;
 if(Pn){const w=LS.whereAt(Pn,KHOST_CLOCK_H()),A=PEOPLE_DRAWN.sim.on?SIM.get('actor',Pn.id):null,Pl=A&&A.place?SIM.get('place',A.place):null;   // SIM's answer once it runs
  const now=A?(A.task&&SIM.pose(A,SIM.time()).moving?'walking to '+A.activity:A.activity)+(Pl?' ('+Pl.name+')':''):w.activity+(w.place?' ('+w.place.name+')':'');
  words=PEOPLE_DRAWN.ROLE[Pn.role]+' ('+Pn.id+')\nlife · '+Pn.faction+' · '+Pn.sub+' · '+Pn.job+'\nnow: '+now+'\nthe day: '+Pn.schedule.filter((a,h)=>h%3===0).map((a,k)=>(k*3)+'h '+a).join(', ');}
 if(best&&best.note)words+='\n'+best.note;
 if(tg&&tg.harvest)words+='\nharvest: wood '+tg.harvest.wood+' · edible '+(tg.harvest.edible.join(', ')||'none')+(tg.harvest.medicinal?' · medicinal':'');
 return words+'\n'+Z.name+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
let _hostH=null;const KHOST_CLOCK_H=()=>_hostH&&_hostH.clock?_hostH.clock.hour:12;

// ---------------------------------------------------------------- the camera: above the ground, or inside the Vault
// The eye may go under the ground only inside a room of the Vault (or the Procrastinator's hall), where it is kept
// within the room's walls: the forbidden depths are visited, not tunnelled into.
// in the Vault the eye stays inside a room, except in a doorway (LS.VAULT_DOORS): there it may pass to the next room
function vaultDoorAt(p){for(const D of LS.VAULT_DOORS){const a=D.axis==='x'?p.x:p.z,s=D.axis==='x'?p.z:p.x;
  if(Math.abs(a-D.at)<.9&&s>Math.min(D.s0,D.s1)+.2&&s<Math.max(D.s0,D.s1)-.2&&p.y>D.y0+.3&&p.y<D.y0+D.h-.2)return D;}return null;}
function clampCam(pos,target){if(typeof VAULT_ROOMS!=="undefined"&&vaultDoorAt(pos))return;
 const R=typeof VAULT_ROOMS!=="undefined"?VAULT_ROOMS.find(r=>pos.x>r.x0-.5&&pos.x<r.x1+.5&&pos.z>r.z0-.5&&pos.z<r.z1+.5&&pos.y>r.y0-1&&pos.y<r.y0+r.h+1):null;
 if(R){pos.x=clamp(pos.x,R.x0+.4,R.x1-.4);pos.z=clamp(pos.z,R.z0+.4,R.z1-.4);pos.y=clamp(pos.y,R.y0+.5,R.y0+R.h-.4);return;}
 const g=Math.max(terrainH(pos.x,pos.z),waterH(pos.x,pos.z))+1.8;if(pos.y<g)pos.y=g;}

// ---------------------------------------------------------------- the probe's budgets and the page's checks (verify.py --assert)
const BUDGET={showcase:{tris:16000000,calls:340},cls:{pass:9000000,host:3000000},type:{'oidong/trees':'pass','oidong/floor':'pass','host':'host'}};
const HCHK={
 // the land is the scale model's away from what the plan shapes
 model(){const pts=[[-900,-700],[900,-900],[-1300,400],[1200,700],[0,-1100]],d=pts.map(q=>Math.abs(terrainH(q[0],q[1])-landH(q[0],q[1])));
  return{ok:Math.max(...d)<.6,detail:'the page\'s ground '+Math.max(...d).toFixed(2)+' m off the model away from the grounds (cached at 16 m)'};},
 // the stream runs in front of the gate: water within 150 m north of the Great Gate, none inside the walls
 stream(){const n=BRIDGE.z,inW=[[0,-150],[-150,-60],[150,-60],[0,100]].filter(q=>waterH(q[0],q[1])>terrainH(q[0],q[1])).length;
  return{ok:n<-200&&n>-350&&inW===0,detail:'the stream crosses the avenue\'s line at z '+n.toFixed(0)+' (the gate at -200); '+inW+' wet points inside the walls'};},
 // the rock: its top TOP over the ward's head, its north face steep, the top level under the White Palace
 rock(top){const t=terrainH(0,60),foot=terrainH(0,-6),face=(terrainH(0,22)-terrainH(0,2))/20;
  return{ok:Math.abs(t-top)<1.5&&foot<2&&face>1,detail:'top '+t.toFixed(1)+' m (plan '+top+'); the north foot '+foot.toFixed(1)+'; the face rises '+face.toFixed(2)+' m per m'};}};
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r));
 add('the land is the scale model\'s',HCHK.model());
 add('the stream in front of the gate, none inside the walls',HCHK.stream());
 add('Longsong\'s rock: 40 m, a steep north face',HCHK.rock(LS.ROCK.top));
 if(typeof monasteryChecks==='function')monasteryChecks(add);
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail});
 add('a rock 25 m high',HCHK.rock(25));
 if(typeof monasteryNegatives==='function')monasteryNegatives(add);
 return R;}

// ---------------------------------------------------------------- the page, handed to the host
window._registered=REG.length;
_hostH=KHOST.take({build:'longsong',title:'Longsong',
 hint:'Longsong: the History Monks\' monastery in the Oidong Valley, on its rock over the Longsong stream (the scale model\'s land at 1:1)',
 // depth: the near plane follows the camera's height (core/host 90-host-camera C.depth): with a fixed 0.5 m against 90 km
 // the courts' slabs and the ground fought a kilometre off (2026-10-19)
 scene,camera,renderer,ground:terrainH,clampCam,clear:1.8,registry:REG,views:VIEWS,ticks:TICKS,depth:true,
 // walking (F): the Great Stair's flights and landings and the base's top are floors, their masonry blocks (64 registers
 // them in core/walk as it draws them); elsewhere the walker keeps to the ground (2026-10-20, the owner: it walked through
 // the ramps)
 walk:KWALK,
 sky:{follow(c){sky.position.copy(c.position);giant.position.copy(c.position).addScaledVector(giantDir,GIANT_DIST);giantRing.position.copy(giant.position);},
  // the world hour moves the sun, the light and the lamps (89x)
  hour:h=>LSNIGHT.apply(h),objects:()=>[sky,giant,giantRing]},
 clock:{hour:12,running:false,scale:1,speeds:[0,1,2,4,8],onSet:h=>{LSNIGHT.apply(h);if(typeof placePeople==='function')placePeople(h);}},
 inspect:describe,stats:()=>'inst '+window._instances+(typeof PEOPLE_DRAWN!=='undefined'?' · people '+PEOPLE_DRAWN.shown:''),
 layers:{'flora':{match:o=>!!(o.userData&&o.userData.biome)},'the monastery':{match:o=>!!(o.userData&&o.userData.arch)},
  'the ground (see the Vault)':{match:o=>!!(o.userData&&(o.userData.ground||o.userData.rockface))},'the far land':{match:o=>!!(o.userData&&o.userData.far)},
  'the people':{match:o=>!!(o.userData&&o.userData.people)},'sky':{objects:()=>[sky,giant,giantRing]}},
 exporters:{biome:()=>BIO.export(),plan:()=>({plan:{site:LS.SITE,rock:LS.ROCK,buildings:LS.BUILDINGS,vault:LS.VAULT,procrastinator:LS.PROCRASTINATOR,sealed:LS.SEALED,places:LS.PLACES},people:LS.PEOPLE.map(P=>({id:P.id,role:P.role,faction:P.faction,sub:P.sub,job:P.job,schedule:P.schedule}))})},
 minimap:{title:'Longsong'},
 // the cutaway (X; ] [ a storey up, down): the palaces opened storey by storey, their rooms drawn as the cut shows them (87)
 cutaway:{units:LSIXD.UNITS,show:(u,i)=>LSIXD.cut(u,i)},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
  get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
  biome:()=>window._biome,far:()=>({rings:FAR.rings,around:FAR.around,water:FAR.water}),bridge:()=>BRIDGE,
  at:(x,z)=>{const o={h:terrainH(x,z),water:waterH(x,z),zone:LS.zoneAt(x,z).zone};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));return o;}}});
// ?festival=1: the page opens on the festival of the register (the seventh day of the week: 89y, 40d)
if(new URLSearchParams(location.search).get('festival')==='1'&&_hostH&&_hostH.clock)_hostH.clock.day=LS.FESTIVAL.day;
// the next festival (2026-10-20, the owner): a button after the hour slider jumps the clock to the next festival day at
// eight in the morning (today's, before its thangka is taken down), the people re-placed from their festival schedule
window.LSFEST_NEXT=function(){const c=_hostH&&_hostH.clock;if(!c)return null;let d=c.day||0;
 if(!(LS.isFestival(d)&&c.hour<LS.FESTIVAL.hung[1]))do d++;while(!LS.isFestival(d));
 const h=Math.max(8,LS.isFestival(c.day||0)&&d===(c.day||0)?c.hour:8);c.day=d;c.set(h);LSNIGHT.apply(h);if(typeof placePeople==='function')placePeople(h);
 const hr=document.getElementById('clk-hour');if(hr)hr.value=h;return d;};
{const at=document.getElementById('clk-hour')||document.getElementById('clk-speeds');
 if(at){const b=document.createElement('button');b.id='clk-festival';b.textContent='next festival';
  b.title='jump to the next festival of the register (every seventh day): the thangka hung, the camp pitched';
  b.onclick=()=>LSFEST_NEXT();at.parentNode.insertBefore(b,at.nextSibling);}}
