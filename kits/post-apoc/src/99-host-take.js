// ================================================================= HOST: the set's world, views, inspector words, controls and probe fields, handed to core/host
// The camera, the walk (F, on core/walk: the interiors' floors, stairs and walls with ?interiors=1, the doors' blocks), the frame loop,
// the panel, the polygon tool (L), the keys card (?) and window._api are core/host's (core/host/README.md, "The one key map"); this
// fragment says what the set has. It replaced the kit's own 92-camera.js (orbit, WASD, walk, hover inspector, polygon tool, the frame)
// on 2026-11-09 (TODO.md, Viewers: one walk mode and one set of controls in every viewer; KNOWN_ISSUES.md). The cut-away (X, [ ]) opens
// a building that has an interior set storey by storey (core/engine/91i-interiors.js's units, read by path).
/* the walk: every building's colliders (36-def.js: rec.coll's oriented solids, floors and ramps) as core/walk records, so the host's
   walker (F) stands on decks, climbs ramps and stairs and is stopped by walls; a solid under 0.7 m is a floor a step can reach
   (core/walk/box's rule). Registered after each world build (a culture rebuilds it), the doorways cleared again after them. */
function paWalk(){if(typeof KWALK==='undefined'||typeof KWALKBOX==='undefined')return;
 for(const r of REG){const C=r.coll;if(!C)continue;const tag='pa:'+r.key;
  for(const b of C.solids){const c=Math.cos(b.yaw),s=Math.sin(b.yaw),h=b.y1-b.y0;if(h<=0)continue;
   KWALKBOX.add(KWALK,[c*2*b.hx,0,-s*2*b.hx,0, 0,h,0,0, s*2*b.hz,0,c*2*b.hz,0, b.x,(b.y0+b.y1)/2,b.z,1],{tag});}
  for(const f of C.floors){const c=Math.cos(f.yaw),s=Math.sin(f.yaw),P=[[-1,-1],[1,-1],[1,1],[-1,1]].map(q=>[f.x+q[0]*f.hx*c+q[1]*f.hz*s,f.z-q[0]*f.hx*s+q[1]*f.hz*c,f.y]);
   KWALK.poly({pts:P,name:'floor',tag});}
  for(const m of C.ramps)if(m.w>0&&Math.hypot(m.b[0]-m.a[0],m.b[2]-m.a[2])>.05)KWALK.strip({a:[m.a[0],m.a[2],m.a[1]],b:[m.b[0],m.b[2],m.b[1]],w:m.w,name:'ramp',tag});}
 if(typeof KDOOR!=='undefined')PO.cleared=KDOOR.clearDoorways(KWALK);}
{const paBuildWorld0=buildWorld;buildWorld=function(k){if(typeof KWALK!=='undefined')KWALK.clear();const W=paBuildWorld0(k);paWalk();return W;};}
const startCulture=(new URLSearchParams(location.search)).get('culture')||'generic';buildWorld(startCulture);
const VIEWS=autoViews();
/* verify.py and the probe call setView; the host owns the camera */
function setView(...v){return KHOST.setView(...v);}
/* 35-pa-open.js (shared with the bundles: apoc_bundle.py) reads WALK.on for the door tip; the host's walker answers it */
const WALK={get on(){return !!(KHOST.cam&&KHOST.cam.ctl.walk);}};

// ---------------------------------------------------------------- the inspector's words: name, classification and tags of the smallest record round the point
function paRegAt(p){let best=null,bv=1e18;for(const r of REG){const b=r.bbox;if(p.x>=b.mn[0]-.4&&p.x<=b.mx[0]+.4&&p.z>=b.mn[2]-.4&&p.z<=b.mx[2]+.4&&p.y>=b.mn[1]-.5&&p.y<=b.mx[1]+.5){const v=(b.mx[0]-b.mn[0])*(b.mx[2]-b.mn[2])*(b.mx[1]-b.mn[1]+1);if(v<bv){bv=v;best=r;}}}return best;}
function paInWorld(o){for(;o;o=o.parent)if(o===WORLD)return true;return false;}
function paDescribe(first,hits){const h=hits.find(q=>paInWorld(q.object)&&!(q.object.userData&&q.object.userData.probeSkip));if(!h)return '(nothing)';const p=h.point,r=paRegAt(p);
 const at=p.x.toFixed(1)+', '+p.y.toFixed(1)+', '+p.z.toFixed(1);if(!r)return 'unregistered mesh\n'+at;
 const t=r.tags||{};return r.name+'\n'+(r.cls||'?')+(r.key?'  ·  '+r.key:'')+'\n'+Object.keys(t).map(k=>k+': '+(Array.isArray(t[k])?t[k].join(', '):t[k])).join('\n')+'\n'+at;}

// ---------------------------------------------------------------- the cut-away: a building with an interior set, storey by storey (core/engine/91i-interiors.js)
const PA_ITEM=r=>{const it=typeof KratorInteriors!=='undefined'?KratorInteriors.sets.find(r.key):null;return it&&!it.skip?it:null;};
const PA_UNITS=svixUnitsFor(REG,PA_ITEM);

// ---------------------------------------------------------------- the frame, around the host's: the sky and the sun follow the camera, the set's hooks run
KHOST.on(function paFrame(dt){const C=KHOST.cam,now=performance.now();for(const f of FRAME_HOOKS)f(dt,now);
 sky.position.copy(camera.position);giant.position.copy(camera.position).addScaledVector(giantDir,4200);sunDisc.position.copy(camera.position).addScaledVector(SUNDIR,4800);
 const tg=C.ctl.walk?camera.position:C.ctl.target;sun.target.position.set(tg.x,0,tg.z);sun.position.set(tg.x+LIGHTDIR.x*300,LIGHTDIR.y*300,tg.z+LIGHTDIR.z*300);sun.target.updateMatrixWorld();},'view');

// ---------------------------------------------------------------- the page, handed to the host
const PA_TAKE=KHOST.standard({build:'post-apoc',title:TITLE,
 hint:'Pick a view or a culture. '+(PA_UNITS.length?'Cut-away (X) opens the building nearest the view storey by storey ([ ] the storey), Interiors (U) furnishes the rooms; ':'')+
  'Night (N), E opens or shuts the door in reach, F walks; ? lists every key',
 scene,camera,renderer,ground:terrainH,walk:KWALK,walker:{step:.7,drop:1.4,r:.3,h:1.7},clear:1.2,minR:2,maxR:2500,
 views:VIEWS,
 std:{night:{on:()=>{nightSet(NIGHT.v>.5?0:1,true);const s=document.getElementById('timesel');if(s)s.value=NIGHT.v>.5?1:0;},state:()=>NIGHT.v>.5},
  door:{on:()=>{KDOORHOST.toggleNear(camera.position,WALK.on);}},
  interiors:{on:()=>{const q=new URLSearchParams(location.search);if(PAF.interiors)q.delete('interiors');else q.set('interiors','1');location.search=q.toString();},state:()=>!!PAF.interiors},
  shadows:{on:()=>{renderer.shadowMap.enabled=!renderer.shadowMap.enabled;groundMat.needsUpdate=true;for(const k in MAT)MAT[k].needsUpdate=true;},state:()=>renderer.shadowMap.enabled}},
 controls:[{select:Object.keys(CULT.packs).map(k=>[k,'Culture: '+CULT.packs[k].name]),id:'cultsel',on:v=>{buildWorld(v);}}],
 keys:{e:()=>{}},   /* E is 35-pa-open.js's own listener (the bundles' copy too); the camera still rises on it in flight */
 keyNames:{},
 cutaway:PA_UNITS.length?{units:PA_UNITS,cutAt:1.4}:null,
 inspect:paDescribe,
 stats:()=>'records '+REG.length+'  furniture '+PAF.placed.length+(PAF.interiors?'  interiors '+PAF.buildings.length:'')+'\ncalls '+renderer.info.render.calls+'  tris '+(renderer.info.render.triangles/1e6).toFixed(2)+'M',
 api:PA_API});
KHOST.take(PA_TAKE);
{const cs=document.getElementById('cultsel');if(cs)cs.value=CULT.cur.key;}
