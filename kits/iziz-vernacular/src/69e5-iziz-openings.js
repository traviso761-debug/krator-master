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
//   IZDOOR.list   [{id, idx (its vDoorLeaf instance), at [x,y,z] (sill, wall middle, world), hinge [x,y,z], yaw (world,
//                  outward), w, h, t, open 0..1, target 0..1, locked, by, key (the def), r0 (its first REG index)}]
//   IZDOOR.leaf(x, y, z, ry, w, h, t, c, o)   o: {locked, mirror (hinged on +x: a double door's right leaf), key}
//   IZDOOR.open(id, o) / close(id, o) / toggle(id, o)   o: {by: 'player' | 'npc' | name, auto: seconds to shut again}
//   IZDOOR.nearest(x, y, z, r)   the nearest unlocked door whose sill is within r (2.2 m) and 2 m in height, or null
//   IZDOOR.finish(W)              once the world is built: drops doors a failed placement unwound, registers each door's
//                                 walk blocks in W (core/walk: shut = blocked, open = clear)
//   IZDOOR.tick(dt)               eases every moving door (1.6 rad/s) and writes its leaf matrix (FRAME_HOOKS)
// [G data] for the records and the walk; the leaf's matrix (tick) is the draw side.
MAT.izGlass=new THREE.MeshStandardMaterial({color:0xb4ccd2,metalness:.1,roughness:.05,transparent:true,opacity:.22,depthWrite:false,side:DS});
MAT.warmPane.transparent=true;MAT.warmPane.opacity=.42;MAT.warmPane.depthWrite=false;MAT.warmPane.side=DS;   // a lit pane you see the room through (the day/night swap, 90a, still drives its colour)
MAT.izRoom=new THREE.MeshStandardMaterial({color:0x6e5a46,roughness:.94});   // a room's back, for meshes (79's sentry gallery)
kdef('vWinClear',VBOX,MAT.izGlass);kdef('vDoorLeaf',VBOX,MAT.wood);
// (draw calls: the glow pane is vWinLit, the room card a dim vPlaster. The leaves are their own item, vDoorLeaf, which 95j
// keeps out of core/lod: a moved instance of a shared, LOD-copied item kept its old pose on screen)
const IZ_ROOMC=vC(0x6e5a46);
const IZDOOR={list:[],SWING:1.75,RATE:1.6,
 // world point / yaw of a local one under the kit transform (KXF, KOFF), as kput places it (69f's W)
 _w(x,y,z){const v=new THREE.Vector3(x,y,z);if(KXF)v.applyMatrix4(KXF.m);return[v.x+KOFF[0],v.y+KOFF[1],v.z+KOFF[2]];},
 _yaw(ry){return KXF?(ry||0)+new THREE.Euler().setFromQuaternion(KXF.q,'YXZ').y:(ry||0);},
 // draw a leaf in the doorway and register it. (x, z): the middle of the doorway's line in the builder's frame; y the sill
 leaf(x,y,z,ry,w,h,t,c,o){o=o||{};const it=KIT.items.vDoorLeaf,idx=it.length;
  kput('vDoorLeaf',[x,y+h/2,z],vQ(ry,0,0),[w,h,t],c||vC(VPAL.woodMid[0]));const R=it[idx];if(!R)return null;
  const hl=loc(x,z,o.mirror?w/2:-w/2,0,ry),C=VERN.cur,s=KXF&&KXF.s?KXF.s:1;
  const D={id:'door.'+IZDOOR.list.length,idx,ref:R,p0:R.p.slice(),q0:R.q?R.q.clone():new THREE.Quaternion(),at:IZDOOR._w(x,y,z),hinge:IZDOOR._w(hl[0],y,hl[1]),
   yaw:IZDOOR._yaw(ry),sign:o.mirror?-1:1,w:w*s,h:h*s,t:t*s,open:0,target:0,locked:!!o.locked,by:null,auto:0,key:C?C.D.key:(o.key||null),r0:C?C.r0:null,blocks:[]};
  IZDOOR.list.push(D);return D;},
 get(id){return typeof id==='object'?id:IZDOOR.list.find(D=>D.id===id)||null;},
 open(id,o){const D=IZDOOR.get(id);if(!D||D.locked)return false;o=o||{};D.target=1;D.by=o.by||'player';D.auto=o.auto||0;return true;},
 close(id,o){const D=IZDOOR.get(id);if(!D)return false;D.target=0;D.by=(o&&o.by)||D.by;D.auto=0;return true;},
 toggle(id,o){const D=IZDOOR.get(id);if(!D)return false;return D.target>.5?IZDOOR.close(D,o):IZDOOR.open(D,o);},
 nearest(x,y,z,r){r=r==null?2.2:r;let best=null,bd=r*r;for(const D of IZDOOR.list){if(D.locked||Math.abs(y-D.at[1])>2.2)continue;
  const dx=x-D.at[0],dz=z-D.at[2],d=dx*dx+dz*dz;if(d<bd){bd=d;best=D;}}return best;},
 // the walk: each door's doorway as small blocks along its line (a turned door keeps its width), shut = in place
 _walk(D,on){for(const b of D.blocks){if(IZDOOR.W&&IZDOOR.W.setBlock)IZDOOR.W.setBlock(b,on);
   else{if(!b._y)b._y=[b.box[4],b.box[5]];b.box[4]=on?b._y[0]:-1e9;b.box[5]=on?b._y[1]:-1e9;}}},
 finish(W){IZDOOR.list=IZDOOR.list.filter(D=>KIT.items.vDoorLeaf[D.idx]===D.ref);IZDOOR.W=W||null;
  if(W)for(const D of IZDOOR.list){const n=Math.max(2,Math.ceil(D.w/.3)),ux=Math.cos(D.yaw),uz=-Math.sin(D.yaw),hw=D.w/n/2,ht=Math.max(D.t,.3)/2;
   for(let i=0;i<n;i++){const u=-D.w/2+(i+.5)*D.w/n,cx=D.at[0]+ux*u,cz=D.at[2]+uz*u,r=Math.max(hw,ht);
    D.blocks.push(W.block([cx-r,cx+r,cz-r,cz+r,D.at[1],D.at[1]+D.h],'door:'+D.id));}}
  return IZDOOR.list.length;},
 tick(dt){const im=KIT.meshes&&KIT.meshes.vDoorLeaf;if(!im)return;let dirty=false;
  for(const D of IZDOOR.list){if(D.auto&&D.target===1&&D.open>=1){D.auto-=dt;if(D.auto<=0){D.auto=0;D.target=0;}}
   if(D.open===D.target)continue;const was=D.open;D.open=D.target>D.open?Math.min(D.target,D.open+dt*IZDOOR.RATE/IZDOOR.SWING*1.2):Math.max(D.target,D.open-dt*IZDOOR.RATE/IZDOOR.SWING*1.2);
   if((was<.5)!==(D.open<.5)||D.open===0)IZDOOR._walk(D,D.open<.5);
   IZDOOR._pose(D,im);dirty=true;}
  if(dirty)im.instanceMatrix.needsUpdate=true;},
 _pose(D,im){const a=(D.sign||1)*IZDOOR.SWING*(D.open*D.open*(3-2*D.open)),c=Math.cos(a),s=Math.sin(a),H=D.hinge;
  const dx=D.p0[0]-H[0],dz=D.p0[2]-H[2];IZDOOR._p.set(H[0]+dx*c+dz*s,D.p0[1],H[2]-dx*s+dz*c);
  IZDOOR._q.setFromAxisAngle(IZDOOR._up,a).multiply(D.q0);const S=D.ref.s;IZDOOR._s.set(S[0],S[1],S[2]);
  IZDOOR._m.compose(IZDOOR._p,IZDOOR._q,IZDOOR._s);im.setMatrixAt(D.idx,IZDOOR._m);},
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
 if(!cut){const b=loc(x,z,0,.02,ry);vB('vPlaster',b[0],y,b[1],w,h,.04,ry);}
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
  if(!F&&kind!=='shut'){const b=loc(x,z,0,.02,ry);vB('vPlaster',b[0],y,b[1],w,h,.04,ry);}
  if(kind==='lit')vB('vWinLit',g[0],y,g[1],w,h,.04,ry);else if(kind==='glass')vB('vWinClear',g[0],y,g[1],w,h,.04,ry);
  if(kind==='shut'){const p=loc(x,z,0,.12,ry);for(let k=0;k<Math.round(h/.3);k++)vB('vWood',p[0],y+k*.3,p[1],w+.1,.26,.08,ry,c);}
  frameItem=frameItem||'vWood';const p=loc(x,z,0,.14,ry);
  for(const s of[-1,1]){const q=loc(x,z,s*(w/2+.07),.14,ry);vB(frameItem,q[0],y-.08,q[1],.14,h+.16,.16,ry,c);}
  vB(frameItem,p[0],y+h,p[1],w+.3,.14,.18,ry,c);vB(frameItem,p[0],y-.12,p[1],w+.34,.12,.28,ry,c);
  if(kind==='glass'||kind==='lit'){vB(frameItem,g[0],y,g[1],.06,h,.08,ry,c);vB(frameItem,g[0],y+h*.5,g[1],w,.06,.08,ry,c);}
  if(shutters){for(const s of[-1,1]){const q=loc(x,z,s*(w/2+.15+w*.22),.2,ry);kput('vWood',[q[0],y+h/2,q[1]],vQ(ry,0,0).multiply(qEuler(0,-s*.55,0)),[w*.48,h,.05],c||null);}}};
 // the deco strip: a glazed slit through a hollow wall, glass over a room card on a solid one; its fins as before
 vnStrip=function(x,y,z,ry,w,h,frameItem,c){const cut=typeof vnHole==='function'&&vnHole(x,y,z,ry,w,h,false);const F=cut?vnOnHollow(x,y,z,ry):null;
  if(!cut){const b=loc(x,z,0,.02,ry);vB('vPlaster',b[0],y,b[1],w,h,.04,ry);}
  const g=loc(x,z,0,cut?-F.B.t/2:.06,ry);vB('vWinClear',g[0],y,g[1],w,h,.04,ry);
  for(const s of[-1,1]){const p=loc(x,z,s*(w/2+.08),.1,ry);vB(frameItem,p[0],y-.1,p[1],.16,h+.2,.22,ry,c);}
  const n=Math.max(2,Math.round(h/.9));for(let k=1;k<n;k++){const p=loc(x,z,0,.12,ry);vB(frameItem,p[0],y+h*k/n-.05,p[1],w+.1,.1,.26,ry,c);}};
})();
// a window a builder draws as a plain plate on a solid mass (a drum's ring, a gable's loft opening, a tower's slit): the
// room card the plate stood for, inside a glass box a little larger, so the face is glass with the room's colour behind it
function vnPlate(x,y,z,w,h,d,ry){vB('vPlaster',x,y,z,w,h,d,ry);vB('vWinClear',x,y-.01,z,w+.02,h+.02,d+.04,ry);}
// the same with an electric glow pane in front of the room card (a lit window drawn as a plate)
function vnGlowPlate(x,y,z,w,h,d,ry){vB('vPlaster',x,y,z,w,h,d,ry);vB('vWinLit',x,y-.01,z,w+.02,h+.02,d+.04,ry);}
