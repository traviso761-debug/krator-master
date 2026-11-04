// ================================================================= 69e5. IZIZ OPENINGS: real doors and real glass (the owner, 2026-10-19)
// "Remove all dark voids and make all windows, doors and portals actual doors or windows that have transparency", and
// "add doors that can open/shut with a keypress nearby or by an NPC". 69c draws a door as a dark recess behind a leaf
// left ajar and a window as an opaque plate (dark glass, or a black backing when unglazed); 69e cut both on a hollow
// face. This wraps vnDoor, vnWin and vnStrip once more (assignment, not redeclaration; 69c stays byte-identical for the
// builds that vendor it, and 69f, loaded after this, still notes every opening as a fixture):
//   a door        a SHUT leaf in the doorway, its own instanced item (vDoorLeaf), registered in IZDOOR: it swings
//                 a quarter turn and more into the room on its -x jamb when opened, by a key (99-start.js: E) or by
//                 anyone who calls IZDOOR.open. A door on a solid body (no interior behind it) is drawn shut and locked.
//   a window      clear glass ('glass', vWinClear), a warm glow pane that is still see-through ('lit', vWinLit), boards
//                 ('shut'), or a clear hole ('open'). On a hollow face it sits in the middle of the wall, the room behind
//                 it. On a solid body it stands in front of a room card (a dim plaster back, the room's colour, not a void).
//   a deco strip  (vnStrip, the old Iziz slot) a glazed slit on a hollow face, glass over a room card on a solid one.
// vnOpening(...) is the same for the openings builders draw as plain boxes (a shop front, a loft door, a hatch, a drum's
// windows): the call sites that drew vB('vDarkB', ...) for an opening call it instead (the troughs, forges and stains
// that use vDarkB as water or soot keep it).
// The doors' records, rules and walk blocks are core/door's (KDOOR, 10-core-door.js, 2026-11-03): IZDOOR is the Vernacular's
// drawing of them, a leaf as an instance of its own item, and keeps its names for the builders and the host that call it.
//   IZDOOR.list   KDOOR.list: [{id, idx (its vDoorLeaf instance), at [x,y,z] (sill, wall middle, world), hinge [x,y,z], yaw
//                  (world, outward), w, h, t, open 0..1, target 0..1, locked, by, key (the def), r0 (its first REG index)}]
//   IZDOOR.leaf(x, y, z, ry, w, h, t, c, o)   o: {locked, mirror (hinged on +x: a double door's right leaf), key, id, and
//                                 core/door's kind, pair, both, spring, swing, roll, walk, preset (KDOOR.add), style (a leaf
//                                 style, core/door's KDOORLEAF: 'panel', 'glazed', 'half', 'louvre'..., where the page carries
//                                 30-core-door-leaf.js; else the plain leaf)}. A pair (or a fold) is one record over the whole doorway,
//                                 w wide, its leaves drawn and posed together. The id is
//                                 stable: o.id, or the def's key, where the placement stands and the door's number in it
//                                 ('iz_house_rich@12,-40.0'), so a save or a quest names the same door when other buildings
//                                 move; outside a placement 'door.<n>'
//   IZDOOR.open(id, o) / close(id, o) / toggle(id, o) / nearest(x, y, z, r)   KDOOR's
//   IZDOOR.finish(W)              once the world is built: drops doors a failed placement unwound (KDOOR.prune), registers
//                                 each door's walk blocks in W (KDOOR.walk: core/walk, shut = blocked, open = clear)
//   IZDOOR.tick(dt)               KDOOR.step (1.6 rad/s), then writes each moved leaf's matrix (FRAME_HOOKS)
// [G data] for the records and the walk; the leaf's matrix (tick) is the draw side.
MAT.izGlass=KGLASS.material(THREE,'clear');   // core/door's clear glass (the values this line had: 0xb4ccd2, .22, rough .05, metal .1)
MAT.warmPane.transparent=true;MAT.warmPane.opacity=.42;MAT.warmPane.depthWrite=false;MAT.warmPane.side=DS;   // a lit pane you see the room through (the day/night swap, 90a, still drives its colour)
MAT.izRoom=KGLASS.material(THREE,'room');   // a room's back, for meshes (79's sentry gallery): KGLASS's card, its colour taken as sRGB as IZ_ROOMC is
kdef('vWinClear',VBOX,MAT.izGlass);kdef('vDoorLeaf',VBOX,MAT.wood);
// the leaf styles as kit items (core/door's KDOORLEAF, where the page carries 30-core-door-leaf.js): 'vDoorLeaf.<style>'
// the leaf in the wood, 'vDoorGlass.<style>' its lights in the clear glass; an item no door used bakes nothing
const IZ_LEAFSTYLES=typeof KDOORLEAF!=='undefined'?KDOORLEAF.STYLES.filter(st=>st!=='flat'):[];
for(const st of IZ_LEAFSTYLES){const G=KDOORLEAF.geometry(THREE,st);kdef('vDoorLeaf.'+st,G.frame,MAT.wood);if(G.glass)kdef('vDoorGlass.'+st,G.glass,MAT.izGlass);}
// (draw calls: the glow pane is vWinLit, the room card a dim vPlaster in IZ_ROOMC, KGLASS.SPEC.room's colour. The leaves are their own item, vDoorLeaf, which 95j
// keeps out of core/lod: a moved instance of a shared, LOD-copied item kept its old pose on screen)
const IZ_ROOMC=vC(0x6e5a46);
const IZDOOR={get list(){return KDOOR.list;},get SWING(){return KDOOR.SWING;},get RATE(){return KDOOR.RATE;},
 // world point / yaw of a local one under the kit transform (KXF, KOFF), as kput places it (69f's W)
 _w(x,y,z){const v=new THREE.Vector3(x,y,z);if(KXF)v.applyMatrix4(KXF.m);return[v.x+KOFF[0],v.y+KOFF[1],v.z+KOFF[2]];},
 _yaw(ry){return KXF?(ry||0)+new THREE.Euler().setFromQuaternion(KXF.q,'YXZ').y:(ry||0);},
 // draw a leaf in the doorway and register it. (x, z): the middle of the doorway's line in the builder's frame; y the sill
 leaf(x,y,z,ry,w,h,t,c,o){o=o||{};if(o.preset!=null)o=Object.assign({},KDOOR.PRESET[o.preset]||{},o);
  if(o.kind==='hatch')throw new Error('IZDOOR.leaf: a hatch is not drawn here');
  const st=o.style&&KIT.defs['vDoorLeaf.'+o.style]?o.style:null,fr=st?'vDoorLeaf.'+st:'vDoorLeaf',gl=st&&KIT.defs['vDoorGlass.'+st]?'vDoorGlass.'+st:null;
  // the shut leaves in the builder's frame: a scratch record at the origin facing +z (KDOOR.leaves, the same rules as the real one)
  const Ks=IZDOOR._k||(IZDOOR._k=KDOOR.create());Ks.clear();
  const S=Ks.add({at:[0,0,0],yaw:0,w,h,t,sign:o.mirror?-1:1,kind:o.kind,pair:o.pair,roll:o.roll}),parts=[],col=c||vC(VPAL.woodMid[0]);
  for(const L of Ks.leaves(S)){const m=loc(x,z,L.p[0],L.p[2],ry),P=[],q=vQ(ry,0,0);
   for(const item of gl?[fr,gl]:[fr]){const it=KIT.items[item],idx=it.length;kput(item,[m[0],y+L.p[1],m[1]],q,L.size,item===gl?null:col);const R=it[idx];if(!R)return null;P.push({item,idx,ref:R});}
   parts.push(P);}
  const R0=parts[0][0].ref,hl=loc(x,z,o.mirror?w/2:-w/2,0,ry),C=VERN.cur,s=KXF&&KXF.s?KXF.s:1;
  let id=o.id;if(id==null&&C){C._door=(C._door||0)+1;const b=C.D.key+'@'+Math.round(C.x)+','+Math.round(C.z)+'.'+(C._door-1);id=b;for(let k=1;KDOOR.get(id);k++)id=b+'#'+k;}
  return KDOOR.add({id:id==null?'door.'+KDOOR.list.length:id,idx:parts[0][0].idx,ref:R0,parts,
   p0:parts.length===1?R0.p.slice():IZDOOR._w(x,y+h/2,z),q0:R0.q?R0.q.clone():new THREE.Quaternion(),at:IZDOOR._w(x,y,z),hinge:IZDOOR._w(hl[0],y,hl[1]),
   yaw:IZDOOR._yaw(ry),sign:o.mirror?-1:1,w:w*s,h:h*s,t:t*s,locked:!!o.locked,key:C?C.D.key:(o.key||null),r0:C?C.r0:null,
   kind:o.kind,pair:o.pair,both:o.both,spring:o.spring,swing:o.swing,roll:o.roll,walk:o.walk,style:st});},
 get:id=>KDOOR.get(id),open:(id,o)=>KDOOR.open(id,o),close:(id,o)=>KDOOR.close(id,o),toggle:(id,o)=>KDOOR.toggle(id,o),
 nearest:(x,y,z,r)=>KDOOR.nearest(x,y,z,r),
 // the leaves' meshes a door is posed in: the kit's (KIT.meshes) unless bound to others (a chunked bake's own: Erewhon)
 bind(D,meshes){D._meshes=meshes;return D;},
 finish(W){KDOOR.prune(D=>!D.ref||(D.parts||[[{item:'vDoorLeaf',idx:D.idx,ref:D.ref}]]).every(P=>P.every(q=>KIT.items[q.item][q.idx]===q.ref)));   /* a door IZDOOR did not draw (no ref: the Ancients' records in Roketstad) is kept */IZDOOR.W=W||null;KDOOR.walk(W||null);return KDOOR.list.length;},
 tick(dt){if(!KIT.meshes)return;const moved=KDOOR.step(dt);for(const D of moved)IZDOOR._pose(D);IZDOOR._flush();},
 // write a door's leaves (every part: the leaf, its glass) into their meshes as it moves: leaf i at KDOOR.leaves' pose,
 // turned about its axis from its shut rotation, scaled by its shut size times the leaf's own scale (a roller, an iris)
 _pose(D){const M=typeof D._meshes==='function'?D._meshes():D._meshes||KIT.meshes;if(!M)return;const LL=KDOOR.leaves(D),parts=D.parts||[[{item:'vDoorLeaf',idx:D.idx,ref:D.ref}]];
  for(let i=0;i<LL.length&&i<parts.length;i++){const L=LL[i];IZDOOR._p.set(L.p[0],L.p[1],L.p[2]);
   if(L.ax==='y')IZDOOR._ax.set(0,1,0);else IZDOOR._ax.set(L.ax[0],L.ax[1],L.ax[2]);
   for(const q of parts[i]){const im=M[q.item];if(!im)continue;IZDOOR._q.setFromAxisAngle(IZDOOR._ax,L.ang).multiply(q.ref.q||IZDOOR._q0);const S=q.ref.s;
    IZDOOR._s.set(S[0]*L.s[0],S[1]*L.s[1],S[2]*L.s[2]);IZDOOR._m.compose(IZDOOR._p,IZDOOR._q,IZDOOR._s);im.setMatrixAt(q.idx,IZDOOR._m);IZDOOR._dirty.add(im);}}},
 _flush(){IZDOOR._dirty.forEach(im=>{im.instanceMatrix.needsUpdate=true;});IZDOOR._dirty.clear();},
 // the meshes that hold leaves (core/lod keeps its hands off them: they move)
 meshes(M){M=M||KIT.meshes||{};return Object.keys(M).filter(k=>/^vDoor(Leaf|Glass)/.test(k)).map(k=>M[k]);},
 _dirty:new Set(),_ax:new THREE.Vector3(),_q0:new THREE.Quaternion(),
 _p:new THREE.Vector3(),_q:new THREE.Quaternion(),_s:new THREE.Vector3(),_m:new THREE.Matrix4(),_up:new THREE.Vector3(0,1,0)};
// is the point on a hollow body's face? (69e's vnFaceOf, without the side effect of a cut)
function vnOnHollow(x,y,z,ry){return typeof vnFaceOf==='function'?vnFaceOf(x,y,z,ry):null;}
// an opening a builder draws as a plain box: (x, z) on the face, ry the face's OUTWARD yaw, y its foot, w x h.
// kind: 'door' (a leaf: operable when the face is hollow), 'win' (glass), 'glow' (a lit pane), 'open' (a clear hole on a
// hollow face, a room card on a solid one), 'shut' (boards). d: how deep the old plate stood (its centre that far out).
function vnOpening(x,y,z,ry,w,h,kind,c){kind=kind||'win';
 const cut=typeof vnHole==='function'&&vnHole(x,y,z,ry,w,h,kind==='door');const F=cut?vnOnHollow(x,y,z,ry):null,t=F?F.B.t:.25;
 if(kind==='door'){if(cut){const m=loc(x,z,0,-t/2,ry);IZDOOR.leaf(m[0],y,m[1],ry,w*.96,h-.04,.07,c);vnStoop(x,y,z,ry,w,'vStone',null);}
  else{const m=loc(x,z,0,.04,ry);IZDOOR.leaf(m[0],y,m[1],ry,w,h,.08,c,{locked:true});vnStoop(x,y,z,ry,w,'vStone',null);}return;}   /* a locked door on a solid body is stooped too: it stood in the air */
 if(kind==='shut'){const p=loc(x,z,0,.06,ry);for(let k=0;k<Math.max(1,Math.round(h/.3));k++)vB('vWood',p[0],y+k*.3,p[1],w+.06,Math.min(.26,h-k*.3),.08,ry,c);return;}
 if(!cut){const b=loc(x,z,0,.02,ry);vB('vPlaster',b[0],y,b[1],w,h,.04,ry,IZ_ROOMC);}
 const g=loc(x,z,0,cut?-t/2:.06,ry);
 if(kind==='win')vB('vWinClear',g[0],y,g[1],w,h,.04,ry);else if(kind==='glow')vB('vWinLit',g[0],y,g[1],w,h,.04,ry);}
// a street door's stoop (the owner, 2026-10-20: "fix remaining doors"): a landing level with the sill, 0.9 m out, then steps
// of at most 0.18 m down to the ground (the builder's own ground, y 0), each a block from the ground; the landing and the
// flight go into core/walk (the interiors' entry ramp began at the sill, so a step out of the door fell to it)
function vnStoop(x,y,z,ry,w,item,c,avail){if(y<.1||y>1.5)return;   /* a street door only (an upper storey's door is not stooped from the ground) */
 const n=Math.max(1,Math.ceil(y/.18)),r=y/n;let LD=.9,SD=.3;
 // short of room (another body's wall ahead, avail): shallower treads, then a shorter landing
 if(avail!=null&&LD+(n-1)*SD+.1>avail){SD=.25;LD=Math.max(.45,Math.min(.9,avail-.1-(n-1)*SD));}
 {const p=loc(x,z,0,.05+LD/2,ry);vB(item,p[0],0,p[1],w+.6,y,LD,ry,c);}
 for(let k=1;k<n;k++){const p=loc(x,z,0,.05+LD+SD/2+(k-1)*SD,ry);vB(item,p[0],0,p[1],w+.6,y-k*r,SD,ry,c);}
 if(typeof KWALK==='undefined')return;const W2=(lx,lz,ly)=>{const q=loc(x,z,lx,lz,ry),v=IZDOOR._w(q[0],ly,q[1]);return[v[0],v[2],v[1]];},hw=w/2+.3;
 KWALK.poly({pts:[[-hw,-.3],[hw,-.3],[hw,.05+LD],[-hw,.05+LD]].map(([u,v])=>W2(u,v,y)),name:'stoop',tag:'interior:vern-stoop'});
 if(n>1)KWALK.strip({a:W2(0,.05+LD+(n-1)*SD+.15,0),b:W2(0,.05+LD,y-r*.5),w:w+.4,name:'stoop steps',tag:'interior:vern-stoop'});}
// stoops wait for the builder to return (a flight it draws after the door, vnStairs, stands in for one); vnStairs' flights go into
// core/walk as they are drawn
function vnStoopLater(x,y,z,ry,w,item,c){const C=VERN.cur;if(!C||!C.hollow){vnStoop(x,y,z,ry,w,item,c);return;}(C._stoops=C._stoops||[]).push({x,y,z,ry,w,item,c});}
function vnStoopsDraw(C){const SS=C._stairs||[];for(const D of C._stoops||[]){const f=loc(D.x,D.z,0,1.2,D.ry);
  const st=SS.find(S=>Math.hypot(S.x-f[0],S.z-f[1])<D.w/2+1.6&&Math.abs(S.top-D.y)<.35);
  if(!st){// the room ahead: up to 3 m out, till a point falls inside another of this placement's bodies
   let av=null;for(let d=.3;d<=3;d+=.1){const q=loc(D.x,D.z,0,d,D.ry);if((C.hollow||[]).some(B=>{const dx=q[0]-B.x,dz=q[1]-B.z,c2=Math.cos(B.ry),s2=Math.sin(B.ry),lx=dx*c2-dz*s2,lz=dx*s2+dz*c2;return Math.abs(lx)<B.w/2-.05&&Math.abs(lz)<B.d/2-.05;})){av=d;break;}}
   if(av!=null&&av<.7)continue;   /* another of its bodies right ahead: a door between two rooms, no stoop */
   vnStoop(D.x,D.y,D.z,D.ry,D.w,D.item,D.c,av);continue;}
  // a flight stands in front: the floor from the door to its head, level with the sill
  if(typeof KWALK==='undefined')continue;const hd=Math.max(.3,(st.x-D.x)*Math.sin(D.ry)+(st.z-D.z)*Math.cos(D.ry)-st.run/2+.05),hw=D.w/2+.3;
  const W2=(lx,lz)=>{const q=loc(D.x,D.z,lx,lz,D.ry),v=IZDOOR._w(q[0],D.y,q[1]);return[v[0],v[2],v[1]];};
  KWALK.poly({pts:[[-hw,-.3],[hw,-.3],[hw,hd],[-hw,hd]].map(([u,v])=>W2(u,v)),name:'stoop',tag:'interior:vern-stoop'});}
 C._stoops=null;C._stairs=null;}
{const st0=vnStairs;vnStairs=function(x,y,z,ry,w,rise,steps,item,c){st0.apply(this,arguments);const run=steps*.32,C=VERN.cur;
  if(C)(C._stairs=C._stairs||[]).push({x,z,ry,run,top:y+rise});
  if(typeof KWALK==='undefined')return;const W2=(lz,ly)=>{const q=loc(x,z,0,lz,ry),v=IZDOOR._w(q[0],ly,q[1]);return[v[0],v[2],v[1]];};
  KWALK.strip({a:W2(run/2+.2,y),b:W2(-run/2,y+rise),w:Math.max(.6,w-.1),name:'vern stairs',tag:'interior:vern-stairs'});
  {const hw=Math.max(.3,w/2-.05),hd=.7/((C&&C.o&&C.o.scale)||1);KWALK.poly({pts:[[-hw,-run/2+.05],[hw,-run/2+.05],[hw,-run/2-hd],[-hw,-run/2-hd]].map(([u,v])=>{const q=loc(x,z,u,v,ry),p=IZDOOR._w(q[0],y+rise,q[1]);return[p[0],p[2],p[1]];}),name:'vern stairs head',tag:'interior:vern-stairs'});}};}   /* the head: whatever the builder stood the flight against */
(function(){
 const _strip=vnStrip;
 // the door: the leaf shut in the doorway (no recess); jambs, lintel, step, lamp and the DOORS note as before
 vnDoor=function(x,y,z,ry,w,h,frameItem,c,leafC,step){const F=vnOnHollow(x,y,z,ry);frameItem=frameItem||'vWood';
  if(F){F.B.ops.push({face:F.face,u:F.u,w,y0:y-F.B.y,y1:y-F.B.y+h,door:true});
   // a second body's wall just behind (a wing against the hall): its face is cut too, so the door opens through both
   for(const d of[.3,.6,.9,1.2]){const q=loc(x,z,0,-d,ry),F2=vnOnHollow(q[0],y,q[1],ry+Math.PI);if(F2&&F2.B!==F.B){F2.B.ops.push({face:F2.face,u:F2.u,w,y0:y-F2.B.y,y1:y-F2.B.y+h,door:true});break;}}const m=loc(x,z,0,-F.B.t/2,ry);IZDOOR.leaf(m[0],y,m[1],ry,w*.96,h-.04,.07,leafC||c);}
  else{const m=loc(x,z,0,.07,ry);IZDOOR.leaf(m[0],y,m[1],ry,w*.98,h-.03,.08,leafC||c,{locked:true});}
  for(const s of[-1,1]){const q=loc(x,z,s*(w/2+.09),.12,ry);vB(frameItem,q[0],y,q[1],.18,h+.18,.2,ry,c);}
  const p=loc(x,z,0,.12,ry);vB(frameItem,p[0],y+h+.06,p[1],w+.5,.2,.26,ry,c);
  if(F)vnStoopLater(x,y,z,ry,w,frameItem==='vStone'?'vStone':'vWood',c);   /* every street door, step or no step: a flight the builder draws in front is used instead (vnStoopsDraw) */
  else vnStoop(x,y,z,ry,w,frameItem==='vStone'?'vStone':'vWood',c);
  if(vLit()){vnLamp(x,y+h+.5,z,ry);}
  if(window.DOORS&&VERN.cur){const C=VERN.cur,sc=C.o.scale||1;const wp=loc(C.x,C.z,x*sc,z*sc,C.ry);DOORS.push({x:wp[0],z:wp[1],ry:ry+C.ry,y:(C.o.y||0)+y*sc,key:C.D.key});}};
 // the window: glass, a glow pane, boards or a hole; a room card behind it on a solid body
 vnWin=function(x,y,z,ry,w,h,kind,frameItem,c,shutters){const F=vnOnHollow(x,y,z,ry);
  if(F)F.B.ops.push({face:F.face,u:F.u,w,y0:y-F.B.y,y1:y-F.B.y+h,door:false});
  const t=F?F.B.t:0,g=loc(x,z,0,F?.05-t/2:.06,ry);
  if(!F&&kind!=='shut'){const b=loc(x,z,0,.02,ry);vB('vPlaster',b[0],y,b[1],w,h,.04,ry,IZ_ROOMC);}
  if(kind==='lit')vB('vWinLit',g[0],y,g[1],w,h,.04,ry);else if(kind==='glass')vB('vWinClear',g[0],y,g[1],w,h,.04,ry);
  if(kind==='shut'){const p=loc(x,z,0,.12,ry);for(let k=0;k<Math.round(h/.3);k++)vB('vWood',p[0],y+k*.3,p[1],w+.1,.26,.08,ry,c);}
  frameItem=frameItem||'vWood';const p=loc(x,z,0,.14,ry);
  for(const s of[-1,1]){const q=loc(x,z,s*(w/2+.07),.14,ry);vB(frameItem,q[0],y-.08,q[1],.14,h+.16,.16,ry,c);}
  vB(frameItem,p[0],y+h,p[1],w+.3,.14,.18,ry,c);vB(frameItem,p[0],y-.12,p[1],w+.34,.12,.28,ry,c);
  if(kind==='glass'||kind==='lit'){vB(frameItem,g[0],y,g[1],.06,h,.08,ry,c);vB(frameItem,g[0],y+h*.5,g[1],w,.06,.08,ry,c);}
  if(shutters){for(const s of[-1,1]){const q=loc(x,z,s*(w/2+.15+w*.22),.2,ry);kput('vWood',[q[0],y+h/2,q[1]],vQ(ry,0,0).multiply(qEuler(0,-s*.55,0)),[w*.48,h,.05],c||null);}}};
 // the deco strip: a glazed slit through a hollow wall, glass over a room card on a solid one; its fins as before
 vnStrip=function(x,y,z,ry,w,h,frameItem,c){const cut=typeof vnHole==='function'&&vnHole(x,y,z,ry,w,h,false);const F=cut?vnOnHollow(x,y,z,ry):null;
  if(!cut){const b=loc(x,z,0,.02,ry);vB('vPlaster',b[0],y,b[1],w,h,.04,ry,IZ_ROOMC);}
  const g=loc(x,z,0,cut?-F.B.t/2:.06,ry);vB('vWinClear',g[0],y,g[1],w,h,.04,ry);
  for(const s of[-1,1]){const p=loc(x,z,s*(w/2+.08),.1,ry);vB(frameItem,p[0],y-.1,p[1],.16,h+.2,.22,ry,c);}
  const n=Math.max(2,Math.round(h/.9));for(let k=1;k<n;k++){const p=loc(x,z,0,.12,ry);vB(frameItem,p[0],y+h*k/n-.05,p[1],w+.1,.1,.26,ry,c);}};
})();
// a window a builder draws as a plain plate on a solid mass (a drum's ring, a gable's loft opening, a tower's slit): the
// room card the plate stood for, inside a glass box a little larger, so the face is glass with the room's colour behind it
function vnPlate(x,y,z,w,h,d,ry){vB('vPlaster',x,y,z,w,h,d,ry,IZ_ROOMC);vB('vWinClear',x,y-.01,z,w+.02,h+.02,d+.04,ry);}
// the same with an electric glow pane in front of the room card (a lit window drawn as a plate)
function vnGlowPlate(x,y,z,w,h,d,ry){vB('vPlaster',x,y,z,w,h,d,ry,IZ_ROOMC);vB('vWinLit',x,y-.01,z,w+.02,h+.02,d+.04,ry);}
