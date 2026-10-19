// ================================================================= HOST — Longsong's views, inspector words and checks, handed to core/host
// The camera, the frame loop, the panel, the inspector, the marks (polygon tool), the minimap, the editor and window._api
// are core/host's (core/host/README.md): this fragment says what this page has.
const gh=(x,z,dy)=>terrainH(x,z)+(dy||0);
const VIEWS=(function(){const V={},PR=LS.PROCRASTINATOR,T=LS.ROCK.top;
 V['Longsong from across the stream (north)']=[-160,62,-640,0,52,40];
 V['The White Palace from the avenue']=[0,gh(0,-120,1.7),-120,0,46,40];
 V['The Great Gate and the bridge']=[70,gh(70,-330,12),-330,0,gh(0,-200,8),-200];
 V['Over the ward from the Eastern Watch']=[96,T+9*4.5+3,118,-40,-4,-120];
 V['The Debate Court']=[24,T+14,26,-6,T+3,58];
 V['The roof: the gilded roofs and the Hall of Hours']=[-90,T+7*4.5+14,62,10,T+7*4.5+6,120];
 V['The drill ground (lightning hands)']=[LS.DRILL.x+26,gh(LS.DRILL.x,LS.DRILL.z,6),LS.DRILL.z-28,LS.DRILL.x,gh(LS.DRILL.x,LS.DRILL.z,1),LS.DRILL.z];
 V['The hermits\' cliff (east face)']=[290,30,60,150,20,90];
 V['The lotus pond and the valley road']=[LS.POND.x+70,LS.POND.y+9,LS.POND.z-70,LS.POND.x,LS.POND.y+1,LS.POND.z];
 V['The open vault (the forbidden depths)']=[16,LS.VAULT_Y+2.2,80,-50,LS.VAULT_Y+2,96];
 V['The Procrastinator']=[PR.x+17,PR.y0+8,PR.z-14,PR.x,PR.y0+12,PR.z];
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
 V['The yak pastures']=[-575,gh(-575,830,9),830,-620,gh(-620,900,1),900];
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
 if(Pn){const w=LS.whereAt(Pn,KHOST_CLOCK_H());words=PEOPLE_DRAWN.ROLE[Pn.role]+' ('+Pn.id+')\nlife · '+Pn.faction+' · '+Pn.sub+' · '+Pn.job+'\nnow: '+w.activity+(w.place?' ('+w.place.name+')':'')+'\nthe day: '+Pn.schedule.filter((a,h)=>h%3===0).map((a,k)=>(k*3)+'h '+a).join(', ');}
 if(best&&best.note)words+='\n'+best.note;
 if(tg&&tg.harvest)words+='\nharvest: wood '+tg.harvest.wood+' · edible '+(tg.harvest.edible.join(', ')||'none')+(tg.harvest.medicinal?' · medicinal':'');
 return words+'\n'+Z.name+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
let _hostH=null;const KHOST_CLOCK_H=()=>_hostH&&_hostH.clock?_hostH.clock.hour:12;

// ---------------------------------------------------------------- the camera: above the ground, or inside the Vault
// The eye may go under the ground only inside a room of the Vault (or the Procrastinator's hall), where it is kept
// within the room's walls: the forbidden depths are visited, not tunnelled into.
function clampCam(pos,target){const R=typeof VAULT_ROOMS!=="undefined"?VAULT_ROOMS.find(r=>pos.x>r.x0-.5&&pos.x<r.x1+.5&&pos.z>r.z0-.5&&pos.z<r.z1+.5&&pos.y>r.y0-1&&pos.y<r.y0+r.h+1):null;
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
 sky:{follow(c){sky.position.copy(c.position);giant.position.copy(c.position).addScaledVector(giantDir,GIANT_DIST);giantRing.position.copy(giant.position);},objects:()=>[sky,giant,giantRing]},
 clock:{hour:12,running:false,scale:1,speeds:[0,1,2,4,8],onSet:h=>{if(typeof placePeople==='function')placePeople(h);}},
 inspect:describe,stats:()=>'inst '+window._instances+(typeof PEOPLE_DRAWN!=='undefined'?' · people '+PEOPLE_DRAWN.shown:''),
 layers:{'flora':{match:o=>!!(o.userData&&o.userData.biome)},'the monastery':{match:o=>!!(o.userData&&o.userData.arch)},
  'the ground (see the Vault)':{match:o=>!!(o.userData&&(o.userData.ground||o.userData.rockface))},'the far land':{match:o=>!!(o.userData&&o.userData.far)},
  'the people':{match:o=>!!(o.userData&&o.userData.people)},'sky':{objects:()=>[sky,giant,giantRing]}},
 exporters:{biome:()=>BIO.export(),plan:()=>({plan:{site:LS.SITE,rock:LS.ROCK,buildings:LS.BUILDINGS,vault:LS.VAULT,procrastinator:LS.PROCRASTINATOR,sealed:LS.SEALED,places:LS.PLACES},people:LS.PEOPLE.map(P=>({id:P.id,role:P.role,faction:P.faction,sub:P.sub,job:P.job,schedule:P.schedule}))})},
 minimap:{title:'Longsong'},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
  get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
  biome:()=>window._biome,far:()=>({rings:FAR.rings,around:FAR.around,water:FAR.water}),bridge:()=>BRIDGE,
  at:(x,z)=>{const o={h:terrainH(x,z),water:waterH(x,z),zone:LS.zoneAt(x,z).zone};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));return o;}}});
