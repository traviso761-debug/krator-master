// ================================================================= CORE — doors, the host side (core/door)
// What a page does with KDOOR's records: pose each moving leaf in three.js, ease the doors on the frame, and give the
// player a key. The records, the rules and the walk blocks are 10-core-door.js's; nothing here decides anything.
//
//   KDOORHOST.instanced(rec, im, idx, q0, s)   the leaf is instance idx of InstancedMesh im (q0 its shut rotation, a
//                                               THREE.Quaternion; s its scale [x,y,z]): the Vernacular's vDoorLeaf, a kit item.
//                                               im may be a function returning the mesh, or an array of meshes (or functions):
//                                               a glazed leaf's frame and its glass, every one set at the same index. A door
//                                               of several leaves (a pair, a bifold: KDOOR.leafCount) gives idx as an array,
//                                               one index a leaf; s left out is each leaf's own size (KDOOR.leafSize)
//   KDOORHOST.object(rec, obj)                 the leaf is its own Object3D (an array: one a leaf), posed as it opens
//   KDOORHOST.posed(rec, fn)                   the page poses the leaf itself: fn(rec, pose, leaves) each time it moves, pose being
//                                               KDOOR.pose(rec) (a leaf instanced from its hinge, a cloth mat that rolls up,
//                                               a double door's two halves on one record: the Yuni engine's leaves)
//   KDOORHOST.tick(dt)                         KDOOR.step, then pose each door that moved (FRAME_HOOKS / KHOST 'tick')
//   KDOORHOST.near(pos, walk)                  the door within reach of an eye at pos ({x,y,z}): walking, the feet are 1.7
//                                               below it and the reach 2.4 m; flying, 1.2 and 3 m
//   KDOORHOST.toggleNear(pos, walk)            E: open or shut that door (by the player, from where they stand: a
//                                               double-acting door swings away from them); returns it or null
// The leaves' look (panelled, glazed, louvred...) is 30-core-door-leaf.js's (KDOORLEAF), loaded ahead of the builders.
(function(root){
  var T=root.THREE;
  var tmp=T?{p:new T.Vector3(),q:new T.Quaternion(),qa:new T.Quaternion(),s:new T.Vector3(),m:new T.Matrix4(),ax:new T.Vector3(),up:new T.Vector3(0,1,0)}:null;
  var dirty=new Set();
  function arr(x){return Array.isArray(x)?x:[x];}
  function instanced(D,im,idx,q0,s){D.draw={ims:arr(im),idx:arr(idx),q0:q0?q0.clone():new T.Quaternion(),s:s||null};return D;}
  function object(D,obj){var O=arr(obj);D.draw={objs:O,q0s:O.map(function(o){return o.quaternion.clone();})};return D;}
  function posed(D,fn){D.draw={fn:fn};return D;}
  function turn(L,q0,out){if(L.ax==='y')tmp.ax.set(0,1,0);else tmp.ax.set(L.ax[0],L.ax[1],L.ax[2]);return out.setFromAxisAngle(tmp.ax,L.ang).multiply(q0);}
  function poseOne(D){var g=D.draw;if(!g)return;
    if(g.fn){g.fn(D,KDOOR.pose(D),KDOOR.leaves(D));return;}
    var LL=KDOOR.leaves(D),i;
    if(g.objs){for(i=0;i<g.objs.length&&i<LL.length;i++){var o=g.objs[i],L=LL[i];o.position.set(L.p[0],L.p[1],L.p[2]);turn(L,g.q0s[i],o.quaternion);
      if(L.s[0]!==1||L.s[1]!==1||L.s[2]!==1)o.scale.set(L.s[0],L.s[1],L.s[2]);}return;}
    for(i=0;i<LL.length&&i<g.idx.length;i++){var L2=LL[i],b=g.s||L2.size;   /* s given: every leaf's shut size (one leaf's, a pair's half) */
      tmp.p.set(L2.p[0],L2.p[1],L2.p[2]);turn(L2,g.q0,tmp.q);tmp.s.set(b[0]*L2.s[0],b[1]*L2.s[1],b[2]*L2.s[2]);tmp.m.compose(tmp.p,tmp.q,tmp.s);
      for(var k=0;k<g.ims.length;k++){var im=typeof g.ims[k]==='function'?g.ims[k]():g.ims[k];if(!im)continue;im.setMatrixAt(g.idx[i],tmp.m);dirty.add(im);}}}
  function tick(dt){var moved=KDOOR.step(dt);for(var i=0;i<moved.length;i++)poseOne(moved[i]);
    dirty.forEach(function(im){im.instanceMatrix.needsUpdate=true;});dirty.clear();return moved.length;}
  function near(p,walk){return KDOOR.nearest(p.x,p.y-(walk?1.7:1.2),p.z,walk?2.4:3);}
  function toggleNear(p,walk){var D=near(p,walk);if(D)KDOOR.toggle(D,{by:'player',from:[p.x,p.z]});return D;}
  function tip(getPos,getWalk){
    if(typeof document==='undefined')return function(){};
    var el=document.createElement('div');el.id='kdoortip';
    el.style.cssText='position:fixed;left:50%;bottom:64px;transform:translateX(-50%);padding:4px 10px;border-radius:4px;background:rgba(20,16,12,.72);color:#f3e6cf;font:13px system-ui,sans-serif;pointer-events:none;display:none;z-index:20';
    document.body.appendChild(el);var n=0;
    return function(){if(n++%8)return;var D=KDOOR.list.length?near(getPos(),getWalk&&getWalk()):null;
      if(D){el.textContent='E: '+(D.target>.5?'shut':'open')+' the door';el.style.display='block';}else el.style.display='none';};}
  root.KDOORHOST={instanced:instanced,object:object,posed:posed,pose:poseOne,tick:tick,near:near,toggleNear:toggleNear,tip:tip};
})(typeof window!=='undefined'?window:globalThis);
