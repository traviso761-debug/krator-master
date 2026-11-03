// ================================================================= CORE — doors, the host side (core/door)
// What a page does with KDOOR's records: pose each moving leaf in three.js, ease the doors on the frame, and give the
// player a key. The records, the rules and the walk blocks are 10-core-door.js's; nothing here decides anything.
//
//   KDOORHOST.instanced(rec, im, idx, q0, s)   the leaf is instance idx of InstancedMesh im (q0 its shut rotation, a
//                                               THREE.Quaternion; s its scale [x,y,z]): the Vernacular's vDoorLeaf, a kit item
//   KDOORHOST.object(rec, obj)                 the leaf is its own Object3D (turned about y as it opens)
//   KDOORHOST.posed(rec, fn)                   the page poses the leaf itself: fn(rec, pose) each time it moves, pose being
//                                               KDOOR.pose(rec) (a leaf instanced from its hinge, a cloth mat that rolls up,
//                                               a double door's two halves on one record: the Yuni engine's leaves)
//   KDOORHOST.tick(dt)                         KDOOR.step, then pose each door that moved (FRAME_HOOKS / KHOST 'tick')
//   KDOORHOST.near(pos, walk)                  the door within reach of an eye at pos ({x,y,z}): walking, the feet are 1.7
//                                               below it and the reach 2.4 m; flying, 1.2 and 3 m
//   KDOORHOST.toggleNear(pos, walk)            E: open or shut that door (by the player); returns it or null
//   KDOORHOST.tip(getPos, getWalk)             the "E: open the door" line at the foot of the page, refreshed every 8th frame
//                                               (call its returned function from the frame)
(function(root){
  var T=root.THREE;
  var tmp=T?{p:new T.Vector3(),q:new T.Quaternion(),s:new T.Vector3(),m:new T.Matrix4(),up:new T.Vector3(0,1,0)}:null;
  var dirty=new Set();
  function instanced(D,im,idx,q0,s){D.draw={im:im,idx:idx,q0:q0?q0.clone():new T.Quaternion(),s:s||[1,1,1]};return D;}
  function object(D,obj){D.draw={obj:obj,q0:obj.quaternion.clone(),p:obj.position.clone()};return D;}
  function posed(D,fn){D.draw={fn:fn};return D;}
  function poseOne(D){var g=D.draw;if(!g)return;var P=KDOOR.pose(D),a=P[3];
    if(g.fn){g.fn(D,P);return;}
    if(g.obj){g.obj.position.set(P[0],P[1],P[2]);g.obj.quaternion.setFromAxisAngle(tmp.up,a).multiply(g.q0);return;}
    var im=typeof g.im==='function'?g.im():g.im;if(!im)return;
    tmp.p.set(P[0],P[1],P[2]);tmp.q.setFromAxisAngle(tmp.up,a).multiply(g.q0);tmp.s.set(g.s[0],g.s[1],g.s[2]);
    tmp.m.compose(tmp.p,tmp.q,tmp.s);im.setMatrixAt(g.idx,tmp.m);dirty.add(im);}
  function tick(dt){var moved=KDOOR.step(dt);for(var i=0;i<moved.length;i++)poseOne(moved[i]);
    dirty.forEach(function(im){im.instanceMatrix.needsUpdate=true;});dirty.clear();return moved.length;}
  function near(p,walk){return KDOOR.nearest(p.x,p.y-(walk?1.7:1.2),p.z,walk?2.4:3);}
  function toggleNear(p,walk){var D=near(p,walk);if(D)KDOOR.toggle(D,{by:'player'});return D;}
  function tip(getPos,getWalk){
    if(typeof document==='undefined')return function(){};
    var el=document.createElement('div');el.id='kdoortip';
    el.style.cssText='position:fixed;left:50%;bottom:64px;transform:translateX(-50%);padding:4px 10px;border-radius:4px;background:rgba(20,16,12,.72);color:#f3e6cf;font:13px system-ui,sans-serif;pointer-events:none;display:none;z-index:20';
    document.body.appendChild(el);var n=0;
    return function(){if(n++%8)return;var D=KDOOR.list.length?near(getPos(),getWalk&&getWalk()):null;
      if(D){el.textContent='E: '+(D.target>.5?'shut':'open')+' the door';el.style.display='block';}else el.style.display='none';};}
  root.KDOORHOST={instanced:instanced,object:object,posed:posed,pose:poseOne,tick:tick,near:near,toggleNear:toggleNear,tip:tip};
})(typeof window!=='undefined'?window:globalThis);
