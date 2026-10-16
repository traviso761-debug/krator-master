// ================================================================= bunker: AA battery on the cupola
// `aim` (round 2): the yaw to face, outward over the parapet. The ruin keeps the
// intact mount's facing and its pods sag nose-DOWN on dead elevation gear
// (they used to lie level, pointing anywhere). The rr() draw is kept unused so
// nothing after it moves.
function aaBattery(G,d,x,y,z,s,aim){s=s||1;kput(d>0?'boxR':'boxW',[x,y+1.2*s,z],null,[6*s,2.4*s,6*s],null);kput('tube',[x,y+3.6*s,z],null,[2.2*s,2.4*s,2.2*s],null);
 const yaw0=rr(0,TAU),yaw=aim==null?yaw0:aim,pitch=d>0?(aim==null?.1:-.32):.9;const q=qEuler(0,-yaw,0).multiply(qEuler(0,0,pitch));const bx=x+Math.cos(yaw)*1.5*s,bz=z+Math.sin(yaw)*1.5*s;
 kput(d>0?'boxR':'boxW',[bx,y+5.5*s,bz],q,[8*s,4*s,5*s],null);
 for(let i=0;i<2;i++)for(let j=0;j<4;j++){const off=new THREE.Vector3(0,(i-.5)*1.7*s,(j-1.5)*1.15*s).applyQuaternion(q);const tip=new THREE.Vector3(4.6*s,0,0).applyQuaternion(q);
  kput('tube',[bx+off.x+tip.x*.5,y+5.5*s+off.y+tip.y*.5,bz+off.z+tip.z*.5],q.clone().multiply(qEuler(0,0,-Math.PI/2)),[.7*s,8*s,.7*s],null);}
 kput('tube',[x,y+2.4*s,z],null,[.4*s,7*s,.4*s],null);kput(d>0?'boxR':'boxW',[x,y+6*s,z],qEuler(0,rng()*3,0),[3.5*s,1.6*s,.2*s],null);}

