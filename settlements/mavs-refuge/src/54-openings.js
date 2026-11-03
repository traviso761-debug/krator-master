/* ============================== 13d. OPENINGS: real doors and real glass on core/door ==============================
   The owner, 2026-11-03: "remove all dark voids and make all windows, doors and portals actual doors or windows that have
   transparency", doors that open and shut "with a keypress nearby or by an NPC", and "real glass". The records, the rules
   and the walk blocks are core/door's (KDOOR, KGLASS, KDOORHOST); this is Mav's Refuge's drawing of them, after the
   engine's pattern (core/engine/36o-open.js) and the same as Girder's (settlements/girder/src/54-openings.js: the two pages
   fork one engine). No rnd() is drawn here, so every later builder reads the stream it read before.
     goBuilding(id)                  the building the next leaves belong to (a door's id is '<building>.d<n>'); by default
                                     the furniture's open building (53-furnish.js brfIn: 'Bough Two tavern lot 3'), as a slug
     goLeaf(at, n, w, h, o)          a door leaf in the doorway whose sill line's middle is at [x,y,z] (world, the wall's
                                     middle line), n [nx,nz] the way out, w x h the opening. A KDOOR record with a stable id,
                                     drawn as one instance of the 'doorleaf' bucket, posed by KDOORHOST as it swings. o: hinge
                                     [x,z] (the jamb it turns on; default the -x jamb of the face), t (0.07), col, inset (the
                                     leaf's offset into the room from `at`; negative: outside), ajar (radians: how far it stands
                                     open as built; Mav's doors were drawn shut, so they are), out (swings out of the face),
                                     locked (a solid body: nothing behind it), id, draw false (a record only: the leaf the
                                     builder drew stays as drawn, a locked door on a carved front)
     goSectorWins(fam,P,r0,r1,a0,a1,yb,yt,col,opt,wins)   a SECTOR wall with window openings cut: wins [{a, hw, y0, y1}]
                                     (hw the half width in metres at r1); the reveals are the pieces' own faces
   When the kit's buckets are emitted (75-terrain.js), goFlush poses the leaves built open (one InstancedMesh per bucket, kept
   out of core/lod: the leaves move); 98-start.js hands each to KDOORHOST (core/door's host fragment loads after the emit).
   Mav's Refuge has no core/walk yet, so no walk blocks (KNOWN_ISSUES.md). The panes are 81-glow.js's (KGLASS).         */
var GOPEN = { cur:null, n:{}, leaves:0, cleared:0 };
function goBuilding(id){ GOPEN.cur = id; }
/* the smoothstep KDOOR.angle eases by, inverted: the open fraction that stands `rad` open */
function goOpenOf(rad){ var v=Math.min(1,Math.abs(rad)/KDOOR.SWING), lo=0, hi=1; for(var k=0;k<30;k++){ var m=(lo+hi)/2; if(m*m*(3-2*m)<v) lo=m; else hi=m; } return (lo+hi)/2; }
function goLeaf(at, n, w, h, o){
  o = o || {};
  var yaw=Math.atan2(n[0],n[1]), ux=Math.cos(yaw), uz=-Math.sin(yaw), t=o.t==null?0.07:o.t, ins=o.inset==null?0:o.inset;
  var p0=[at[0]-n[0]*ins, at[1], at[2]-n[1]*ins];                         /* the leaf's foot, middle (the box's origin is its base) */
  var mirror = o.hinge ? ((o.hinge[0]-at[0])*ux+(o.hinge[1]-at[2])*uz > 0) : !!o.mirror, hs = mirror ? 1 : -1;
  var hinge=[p0[0]+hs*ux*w/2, at[1], p0[2]+hs*uz*w/2];
  var base = GOPEN.cur || (typeof BRF!=='undefined' && BRF.cur ? 'mavs.'+BRF.cur.name.toLowerCase().replace(/[^a-z0-9]+/g,'-') : 'mavs.free');
  var i = GOPEN.n[base] = GOPEN.n[base]==null ? 0 : GOPEN.n[base]+1;
  var fam = o.fam || 'doorleaf', B = BUCKET['box|'+fam], idx = B ? B.list.length : 0, lw = Math.max(0.2, w-0.04);
  var D = KDOOR.add({ id:o.id==null ? base+'.d'+i : o.id, at:at.slice(), hinge:hinge, p0:p0, yaw:yaw, sign:(mirror?-1:1)*(o.out?-1:1),
    w:w, h:h, t:t, locked:!!o.locked, open:o.ajar && !o.locked ? goOpenOf(o.ajar) : 0, key:base, fam:fam, idx:idx, s:[lw, h-0.02, t] });
  if(o.draw===false){ D.fam=null; GOPEN.leaves++; return D; }
  BOX(p0[0], p0[1], p0[2], lw, h-0.02, t, yaw, o.col==null ? PLANKC[3] : o.col, fam);   /* drawn shut; goFlush poses the open ones */
  GOPEN.leaves++;
  return D;
}
function goSectorWins(fam, P, r0, r1, a0, a1, yb, yt, col, opt, wins){
  opt = opt || {}; var F = opt.faces || 'tbios', cut = [];
  (wins||[]).forEach(function(w){ var ha=w.hw/r1, lo=Math.max(a0,w.a-ha), hi=Math.min(a1,w.a+ha); if(hi-lo>1e-4) cut.push({ lo:lo, hi:hi, y0:Math.max(yb,w.y0), y1:Math.min(yt,w.y1) }); });
  cut.sort(function(p,q){ return p.lo-q.lo; });
  var merged = []; cut.forEach(function(c){ var m=merged[merged.length-1]; if(m && c.lo<=m.hi+1e-4){ m.hi=Math.max(m.hi,c.hi); m.y0=Math.min(m.y0,c.y0); m.y1=Math.max(m.y1,c.y1); } else merged.push(c); });
  function piece(lo, hi, y0, y1, faces){ if(hi-lo<1e-4 || y1-y0<0.01) return; var o2={}; for(var k in opt) o2[k]=opt[k]; o2.faces=faces; SECTOR(fam,P,r0,r1,lo,hi,y0,y1,col,o2); }
  var side = F.replace(/[tbs]/g,''), a = a0;
  merged.forEach(function(c){
    piece(a, c.lo, yb, yt, F.indexOf('s')>=0 ? F : F+'s');
    piece(c.lo, c.hi, yb, c.y0, side+'t'+(F.indexOf('b')>=0?'b':''));      /* under the opening: its top is the sill */
    piece(c.lo, c.hi, c.y1, yt, side+'b'+(F.indexOf('t')>=0?'t':''));      /* over it: its underside is the head */
    a = c.hi; });
  piece(a, a1, yb, yt, merged.length && F.indexOf('s')<0 ? F+'s' : F);
  return merged.length;
}
/* the leaves' buckets, once emitted: each leaf an instance KDOORHOST poses as it swings */
var goEmitKit = emitBuckets;
emitBuckets = function(){ var r = goEmitKit(); goFlush(); return r; };
function goFlush(){
  var q = new THREE.Quaternion(), up = new THREE.Vector3(0,1,0), m4 = new THREE.Matrix4(), meshes = {};
  KDOOR.list.forEach(function(D){
    var B = BUCKET['box|'+D.fam]; if(!B || !B.mesh) return;
    if(!meshes[D.fam]){ meshes[D.fam] = B.mesh; B.mesh.userData.lodSkip = true; B.mesh.userData.doorLeaves = true; B.mesh.userData.inspectLabel = 'Door'; }
    D.im = B.mesh; D.q0 = new THREE.Quaternion().setFromAxisAngle(up, D.yaw);
    if(D.open > 0){ var P = KDOOR.pose(D);   /* as KDOORHOST.pose would: the leaf turned about its hinge */
      m4.compose(new THREE.Vector3(P[0],P[1],P[2]), q.setFromAxisAngle(up, P[3]).multiply(D.q0), new THREE.Vector3(D.s[0],D.s[1],D.s[2])); B.mesh.setMatrixAt(D.idx, m4); }
  });
  for(var k in meshes) meshes[k].instanceMatrix.needsUpdate = true;
}
/* the host side, once core/door's host fragment has loaded (98-start.js) */
function goHost(){ KDOOR.list.forEach(function(D){ if(D.im) KDOORHOST.instanced(D, D.im, D.idx, D.q0, D.s); }); }
/* a drawn door whose sill is within r in plan (and 1.5 m in height) of (x,y,z): the interiors leave its doorway to it */
function goDoorAt(x, y, z, r){ for(var i=0;i<KDOOR.list.length;i++){ var D=KDOOR.list[i]; if(!D.fam) continue;
  var dx=x-D.at[0], dz=z-D.at[2]; if(dx*dx+dz*dz<r*r && Math.abs(y-D.at[1])<1.5) return true; } return false; }
/* E: the door within reach; the tip at the foot of the page; the leaves eased on the frame (98-start.js keys) */
function goWalking(){ return !!(KHOST.cam && KHOST.cam.ctl && KHOST.cam.ctl.walk); }
function goToggleNear(){ return KDOORHOST.toggleNear(camera.position, goWalking()); }
