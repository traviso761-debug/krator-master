// ---------- the garrison: the men of Gondor on the walls ----------
// Fan work from Tolkien; the geometry is this project's own.
//
// A besieged city with nobody on its walls is a model of a city. So in the war every circle's wall is manned:
// thickest on the first wall along the side the host is on, where the men stand shoulder to shoulder behind the
// parapet - spearmen, and archers in their companies; a line on each of the circles above, where the engines
// are; a watch along the battlement of the rock and on the towers of the Great Gate; and patrols walking the
// walls between the posts. The black of the Guard with the silver of their helms, and here and there a white
// standard over a company.
//
// Everything stands on the roof of the wall it is on, and that is read from the engine's own record of what it
// built (buildingsAt), not worked out: the engine lays each stretch of wall as one footprint and puts its whole
// top at the lowest ground under that stretch plus its height, so a top reckoned from the ground under each man
// put every man on a rising stretch in the air over it. A man whose spot is not inside a wall - a gateway, the
// rock - is not put there at all. On a tower he stands on the tower. Static men are instanced once; only the
// patrols move. All of it is the war's (ctx.warParts).
import { mkRng } from '../core/rng.js';

export function garrison(api){
  const {THREE,C,ctx,scene,groundH,animHooks,buildingsAt,inPoly}=api;
  const K=C.life||{},S=(C.hosts&&C.hosts.siege)||{};
  const R_OUT=K.outer||520,STEP=K.step||60,TIERS=K.tiers||7;
  const [A0,A1]=S.arc||[-1.55,1.55];
  const R=mkRng(1418),D=new THREE.Object3D();
  const WAR=ctx.warParts=ctx.warParts||[];
  const SC=1.25;                                     // a little over life size, like everything else seen from afar

  // where the walls are not: the gateways, which alternate round the rock, and the rock itself
  const gateA=k=>k===0?0:(k%2?1:-1)*(0.62+0.20*k);
  const offGate=(k,a)=>{const d=Math.abs(((a-gateA(k))%(Math.PI*2)+Math.PI*3)%(Math.PI*2)-Math.PI);return d>(k?0.085:0.07);};
  const onRock=(x,z)=>{const Kl=ctx.keel;return Kl&&x>Kl.x+100&&x<Kl.EAST+Kl.OVER(Kl.EAST)+6&&Math.abs(z)<Kl.HW(Math.min(x,Kl.EAST))*1.15+10;};
  // the roof of whatever was built here, or null if nothing was
  const roofAt=(x,z)=>{let h=null;for(const b of buildingsAt(x,z,0))if(inPoly(x,z,b.ring)&&(h===null||b.h>h))h=b.h;return h;};
  const facing=a=>Math.atan2(Math.cos(a),Math.sin(a));        // +z of a man towards the outside of the circle

  // ---- who stands where ----
  const posts=[];                                   // [x,y,z,rotY,kind]  kind: 0 spear, 1 bow, 2 standard
  const man=(k,a,kind)=>{if(!offGate(k,a))return;const r=R_OUT-k*STEP-1.2,x=Math.cos(a)*r,z=Math.sin(a)*r;if(onRock(x,z))return;
    const y=roofAt(x,z);if(y===null||y<groundH(x,z)+8)return;       // not on a wall: nothing here, or only a house
    if(((ctx.siege&&ctx.siege.engineSpots)||[]).some(p=>Math.hypot(p[0]-x,p[2]-z)<8))return;   // a tower with an engine on it
    posts.push([x,y,z,facing(a)+(R()-0.5)*0.3,kind]);};
  const inArc=a=>{a=((a+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI;return a>A0&&a<A1;};
  for(let k=0;k<TIERS;k++){
    const r=R_OUT-k*STEP,n=Math.floor(Math.PI*2*r/(k===0?2.1:6.5));
    for(let i=0;i<n;i++){const a=i/n*Math.PI*2+(R()-0.5)*0.004;
      const facingHost=inArc(a);
      // the first wall facing the host is solid with men; round the back of it, and on the walls above, a watch
      if(k===0&&!facingHost&&R()<0.72)continue;
      if(k>0&&!facingHost&&R()<0.6)continue;
      // archers in companies of a dozen, spears between them, and a standard over each company
      const company=Math.floor(i/12);
      man(k,a,(company%3===1)?1:0);
      if(i%12===6&&facingHost&&R()<0.7)man(k,a+0.0015,2);}}
  // the battlement along the top of the rock, and the Gate's towers
  const Kl=ctx.keel;
  if(Kl)for(const sd of [-1,1])for(let u=Kl.EAST-300;u<Kl.EAST;u+=5){const w=Math.max(0,Kl.HW(u)-3),p=Kl.at(u+Kl.OVER(u),sd*w,Kl.TOP);
    posts.push([p[0],Kl.TOP,p[2],sd>0?0:Math.PI,R()<0.4?1:0]);}
  // the Gate's towers are the landmark's (landmarks.js): each is capped by a slab 26 by 24 whose top is 12 m over
  // the height of the gate, and the men stand on it, inside its merlons
  if(ctx.gate){const G=ctx.gate;for(const s of [-1,1])for(let i=0;i<5;i++){const du=(R()-0.5)*16,dv=(R()-0.5)*14;
    const x=G.x+G.ux*du+G.vx*(s*17+dv),z=G.z+G.uz*du+G.vz*(s*17+dv);
    posts.push([x,G.g0+G.H+12,z,Math.atan2(G.ux,G.uz),1]);}}

  // ---- the men ----
  const mail=new THREE.MeshLambertMaterial({color:0x26282f,flatShading:true});
  const helmM=new THREE.MeshPhongMaterial({color:0xc9ced6,specular:0xffffff,shininess:60,flatShading:true});
  const woodM=new THREE.MeshLambertMaterial({color:0x5a4634});
  const flagM=new THREE.MeshLambertMaterial({color:0xefece4,side:THREE.DoubleSide});
  const N=posts.length;
  const body=new THREE.InstancedMesh(new THREE.BoxGeometry(0.72,1.55,0.5).translate(0,0.78,0),mail,N);
  // the helm of the Guard: tall, and winged - a cone with a flare
  const helm=new THREE.InstancedMesh(new THREE.ConeGeometry(0.27,0.62,6).translate(0,1.86,0),helmM,N);
  const spears=posts.filter(p=>p[4]===0).length,bows=posts.filter(p=>p[4]===1).length,stds=posts.filter(p=>p[4]===2).length;
  const spear=new THREE.InstancedMesh(new THREE.BoxGeometry(0.08,3.3,0.08).translate(0.42,1.65,0.05),woodM,Math.max(1,spears));
  const bow=new THREE.InstancedMesh(new THREE.TorusGeometry(0.62,0.035,3,10,Math.PI*0.9).rotateZ(Math.PI*0.55).translate(0.32,1.25,0.28),woodM,Math.max(1,bows));
  const pole=new THREE.InstancedMesh(new THREE.BoxGeometry(0.1,5.2,0.1).translate(0,2.6,0),woodM,Math.max(1,stds));
  const flag=new THREE.InstancedMesh(new THREE.PlaneGeometry(1.8,1.2).translate(0.9,4.5,0),flagM,Math.max(1,stds));
  let si=0,bi=0,fi=0;
  posts.forEach(([x,y,z,ry,kind],i)=>{
    D.position.set(x,y,z);D.rotation.set(0,ry,0);D.scale.setScalar(SC*(0.95+R()*0.1));D.updateMatrix();
    body.setMatrixAt(i,D.matrix);helm.setMatrixAt(i,D.matrix);
    if(kind===0)spear.setMatrixAt(si++,D.matrix);else if(kind===1)bow.setMatrixAt(bi++,D.matrix);else{pole.setMatrixAt(fi,D.matrix);flag.setMatrixAt(fi++,D.matrix);}});
  spear.count=si;bow.count=bi;pole.count=fi;flag.count=fi;
  for(const m of [body,helm,spear,bow,pole,flag]){m.frustumCulled=false;m.userData.noFingerprint=true;m.castShadow=false;scene.add(m);WAR.push(m);}

  // ---- the patrols ----
  // Fours walking the walls between the posts, each on its own circle, turning at the ends of its beat. Walking
  // past the men standing is fine: at this size nobody can tell.
  const P=[];
  for(let q=0;q<26;q++){const k=q<10?0:1+Math.floor(R()*(TIERS-1));const a=A0+(A1-A0)*R(),beat=(k?0.18:0.1)+R()*0.1;P.push({k,a,beat,ph:R()*6.28,v:(1.2+R()*0.4)/(R_OUT-k*STEP)});}
  const pb=new THREE.InstancedMesh(body.geometry,mail,P.length*4),ph=new THREE.InstancedMesh(helm.geometry,helmM,P.length*4);
  pb.frustumCulled=ph.frustumCulled=false;pb.userData.noFingerprint=ph.userData.noFingerprint=true;scene.add(pb,ph);WAR.push(pb,ph);
  // the roof under a patrol, looked up once for each spot it passes and kept
  const pcache=new Map();
  const patrolTop=(k,a,x,z)=>{const key=k*100000+Math.round(a*4000);let y=pcache.get(key);
    if(y===undefined){y=(offGate(k,a)&&!onRock(x,z))?roofAt(x,z):null;if(y!==null&&y<groundH(x,z)+8)y=null;pcache.set(key,y);}return y;};
  let t0=performance.now();
  animHooks.push(now=>{if(ctx.war===false)return;const t=(now-t0)/1000;let i=0;
    for(const q of P){const s=Math.sin(t*q.v/q.beat+q.ph),a0=q.a+q.beat*s,dir=Math.cos(t*q.v/q.beat+q.ph)>0?1:-1;
      for(let m=0;m<4;m++){const a=a0-dir*m*1.6/(R_OUT-q.k*STEP),r=R_OUT-q.k*STEP-2.4,x=Math.cos(a)*r,z=Math.sin(a)*r;
        const y=patrolTop(q.k,a,x,z);
        D.position.set(x,y!==null?y+Math.abs(Math.sin(t*6+m))*0.06:-9999,z);D.rotation.set(0,Math.atan2(-Math.sin(a)*dir,Math.cos(a)*dir),0);D.scale.setScalar(SC);D.updateMatrix();
        pb.setMatrixAt(i,D.matrix);ph.setMatrixAt(i++,D.matrix);}}
    pb.instanceMatrix.needsUpdate=ph.instanceMatrix.needsUpdate=true;});

  ctx.details=Object.assign(ctx.details||{},{garrison:N+P.length*4});
}
