// ---------- walking on the inside of a spun cylinder ----------
// Two pages put you on the floor of a turning drum: Kyrene (src/hab/, spun about x, with country for a floor)
// and Babylon 5's interior (src/babylon5/station.js, spun about y). Up is towards the axis and changes as you
// walk round; forward is some mix of along the axis and round it. They used to do this separately, each with
// its own handedness, so the same drag turned you left on one and right on the other. Here it is once.
//
// The walker's state is { u: along the axis (or whatever `along` names), a: angle round it, yaw, pitch }; yaw 0 looks along +axis and
// pitch up is towards the axis. The page gives `at(u, a)`: where the eye is, in the drum's own frame (Kyrene
// adds the height of the ground there, Babylon 5 the floor's radius). Everything else is worked out from it,
// including which way "right" is, so it cannot come out mirrored.

export function createCylinderWalker(THREE,{axis,at,along='u'}){
  const A=axis.clone().normalize();
  const p=new THREE.Vector3(),p2=new THREE.Vector3(),up=new THREE.Vector3(),round=new THREE.Vector3(),tmp=new THREE.Vector3();
  // the frame where the walker stands: the eye, up (towards the axis) and round (the way `a` increases), and the
  // sign that makes +yaw a turn to the right
  function frame(W){
    p.copy(at(W[along],W.a));
    up.copy(p).addScaledVector(A,-p.dot(A)).negate();const r=up.length()||1;up.divideScalar(r);
    p2.copy(at(W[along],W.a+1e-4));round.copy(p2).sub(p);round.addScaledVector(A,-round.dot(A)).addScaledVector(up,-round.dot(up)).normalize();
    // looking along the axis, the camera's right is A×up; +yaw swings the view towards `round`, so it is a turn to
    // the right when `round` is on that side (+1) and to the left otherwise (-1)
    const right=Math.sign(round.dot(tmp.crossVectors(A,up)))||1;
    return {pos:p,up,round,r,right};}
  function dirOf(W,F,out){return out.copy(A).multiplyScalar(Math.cos(W.yaw)).addScaledVector(F.round,Math.sin(W.yaw)).multiplyScalar(Math.cos(W.pitch)).addScaledVector(F.up,Math.sin(W.pitch)).normalize();}
  return {
    // a drag: right turns right, down looks down (the site's mouse-look, src/core/input.js)
    look(W,dx,dy,rate,maxPitch=1.4){const F=frame(W);W.yaw+=F.right*dx*rate;W.pitch=Math.max(-maxPitch,Math.min(maxPitch,W.pitch-dy*rate));},
    // walk `fw` forward and `st` to the right, `dist` metres for a full step, on the floor
    walk(W,fw,st,dist){if(!fw&&!st)return;const F=frame(W);const side=W.yaw+F.right*Math.PI/2;   // the way right is
      const du=(fw*Math.cos(W.yaw)+st*Math.cos(side))*dist,darc=(fw*Math.sin(W.yaw)+st*Math.sin(side))*dist;
      W[along]+=du;W.a+=darc/F.r;},
    // where to put the camera, in the drum's frame: its position, the point it looks at and its up
    view(W){const F=frame(W),d=dirOf(W,F,new THREE.Vector3());return {pos:F.pos.clone(),dir:d,up:F.up.clone()};},
  };
}
