// ---------- what happens in Beach City ----------
// Fan work: Steven Universe belongs to Rebecca Sugar and Cartoon Network, and every shape here is this project's
// own. A quiet beach town, and every minute or two something from the show turns up (src/core/happenings.js: the
// notice, the Go and look button, the Events panel; #event=<name> fires one on arrival).
//
//   handship   the warship, a giant green left hand, comes in over the sea, aims its index finger and fires on the
//              beach, charges and fires a bigger shot, flicks an escape pod off with its thumb, lands on its
//              fingertips in front of the temple and walks on them, rises, turns upright and waves, and closes into
//              a fist and goes
//   redeye     a giant red eye comes down out of the sky towards the town, and the light cannon on the temple's
//              beach shoots it down into the sea
//   tower      far out at sea, the ocean is pulled up into a tower of water a kilometre high: the sea level falls
//              and the sea bed comes out from under the beach; then the tower falls and the sea comes back
//   lion       a big pink lion walks along the beach from the temple to the boardwalk, roars a portal open and
//              walks into it
//   monster    a gem monster comes crawling up the temple's beach, and then it is poofed and bubbled away
//   fireworks  fireworks over Funland
//   dewey      Mayor Dewey's van, which is always going round the town (life.js): this finds it and follows it
import { createHappenings } from '../core/happenings.js';

export function events(api){
  const {THREE,ctx,scene,groundH}=api;
  const PL=ctx.plan;if(!PL)return;
  const S=PL.sites,T=S.temple,F=S.funland;
  const R=Math.random;
  let H=null;const run=fn=>H.run(fn),notice=(...a)=>H.notice(...a);
  const mat=(c,o)=>new THREE.MeshLambertMaterial(Object.assign({color:c,flatShading:true},o||{}));
  const glow=(c,o)=>new THREE.MeshBasicMaterial(Object.assign({color:c,transparent:true,depthWrite:false},o||{}));
  const tag=g=>{g.traverse(o=>{o.userData.noFingerprint=true;o.userData.noWire=true;if(o.isMesh)o.castShadow=true;});return g;};
  const beach={x:T.x+75,z:T.z+20};                      // the middle of the temple's beach
  const look=(x,y,z,dx,dy,dz,ty)=>()=>[x+dx,y+dy,z+dz,x,y+(ty||0),z];
  const ease=u=>u<0.5?2*u*u:1-Math.pow(-2*u+2,2)/2;
  const lerp=(a,b,u)=>a+(b-a)*u;

  // ---- sparks: one pool of points for explosions, poofs, splashes and fireworks ----
  const MAXP=6000,ppos=new Float32Array(MAXP*3),pcol=new Float32Array(MAXP*3),pv=new Float32Array(MAXP*3),plife=new Float32Array(MAXP),pgrav=new Float32Array(MAXP);
  const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(ppos,3));pg.setAttribute('color',new THREE.BufferAttribute(pcol,3));
  const sparks=new THREE.Points(pg,new THREE.PointsMaterial({size:2.2,vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));
  sparks.frustumCulled=false;sparks.userData.noFingerprint=true;sparks.userData.noWire=true;scene.add(sparks);
  let pnext=0;for(let i=0;i<MAXP;i++)ppos[i*3+1]=-9999;
  const burst=(x,y,z,n,speed,col,life,grav)=>{const c=new THREE.Color(col);
    for(let k=0;k<n;k++){const i=pnext;pnext=(pnext+1)%MAXP;const u=R()*2-1,a=R()*Math.PI*2,r=Math.sqrt(1-u*u),sp=speed*(0.6+R()*0.4);
      ppos[i*3]=x;ppos[i*3+1]=y;ppos[i*3+2]=z;pv[i*3]=Math.cos(a)*r*sp;pv[i*3+1]=u*sp;pv[i*3+2]=Math.sin(a)*r*sp;
      pcol[i*3]=c.r;pcol[i*3+1]=c.g;pcol[i*3+2]=c.b;plife[i]=life*(0.7+R()*0.6);pgrav[i]=grav;}};
  api.animHooks.push((()=>{let last=performance.now();return now=>{const dt=Math.min(0.05,(now-last)/1000);last=now;let any=false;
    for(let i=0;i<MAXP;i++){if(plife[i]<=0)continue;any=true;plife[i]-=dt;
      if(plife[i]<=0){ppos[i*3+1]=-9999;continue;}
      pv[i*3+1]-=pgrav[i]*dt;ppos[i*3]+=pv[i*3]*dt;ppos[i*3+1]+=pv[i*3+1]*dt;ppos[i*3+2]+=pv[i*3+2]*dt;
      const f=Math.min(1,plife[i]);pcol[i*3]*=0.995+0.005*f;pcol[i*3+1]*=0.995+0.005*f;pcol[i*3+2]*=0.995+0.005*f;}
    if(any){pg.attributes.position.needsUpdate=true;pg.attributes.color.needsUpdate=true;}};})());

  // ---- the hand ship ----
  // The warship is a giant left hand, green and anatomically correct, with a port at the back of the wrist and a
  // skylight over the atrium in the palm. It is drawn palm down, fingers along +x and its back up, so the thumb is
  // on the +z side. Every finger has three joints and the thumb two; a pose is an angle for each, and the ship
  // moves between poses: relaxed in flight, pointing to fire from the index finger (the ship's gun), flicking an
  // escape pod off with thumb and index finger, and landing on its fingertips on the beach in front of the temple.
  const HM={lime:mat(0x9adf3c),lime2:mat(0x86cc32),dark:mat(0x3f7a2c),nail:mat(0xc8f08a),lit:glow(0xe8ff9a,{opacity:0.9}),
    port:new THREE.MeshLambertMaterial({color:0x2a3a22,emissive:0x9aff6a,emissiveIntensity:0.6})};
  // [z across the knuckles, segment lengths, radius] for index, middle, ring, little
  const FINGERS=[[10.5,[10,7,5.5],3.0],[3.5,[11,7.5,6],3.1],[-3.5,[10.5,7,5.5],2.95],[-10.5,[8,5.5,4.5],2.6]];
  const POSES={
    relaxed:{f:[[0.2,0.25,0.15],[0.22,0.28,0.18],[0.26,0.3,0.2],[0.3,0.32,0.22]],t:[0.25,0.2],spread:0.06,tw:0},
    open:   {f:[[0.02,0.04,0.02],[0.02,0.04,0.02],[0.03,0.05,0.03],[0.05,0.06,0.04]],t:[-0.15,0.05],spread:0.16,tw:-0.25},   // flat and spread, for waving
    point:  {f:[[0,0,0],[1.45,1.5,1.0],[1.5,1.5,1.0],[1.5,1.5,1.0]],t:[0.9,0.7],spread:0,tw:0.45},
    cocked: {f:[[1.2,1.3,0.9],[1.45,1.5,1.0],[1.5,1.5,1.0],[1.5,1.5,1.0]],t:[1.0,0.3],spread:0,tw:0.25},   // the index held under the thumb
    flick:  {f:[[-0.15,-0.05,0],[1.45,1.5,1.0],[1.5,1.5,1.0],[1.5,1.5,1.0]],t:[1.0,0.3],spread:0,tw:0.25},
    stand:  {f:[[1.0,-0.25,-0.2],[1.0,-0.25,-0.2],[1.0,-0.25,-0.2],[1.0,-0.25,-0.2]],t:[0.9,-0.2],spread:0.12,tw:0},  // up on its fingertips
    fist:   {f:[[1.5,1.55,1.0],[1.5,1.55,1.0],[1.5,1.55,1.0],[1.5,1.55,1.0]],t:[1.1,0.8],spread:0,tw:0.7}};          // the thumb across the fingers
  function makeHand(){
    const g=new THREE.Group(),joints=[];
    // the back of the hand and the palm: a thick rounded slab, wider at the knuckles
    const palm=new THREE.Mesh(new THREE.CylinderGeometry(1,1,1,10),HM.lime);palm.scale.set(16.5,7,17);g.add(palm);
    const knuck=new THREE.Mesh(new THREE.BoxGeometry(6,6.4,29),HM.lime);knuck.position.set(11,0.2,0);g.add(knuck);
    // the wrist, ending in the port at the back
    const wrist=new THREE.Mesh(new THREE.CylinderGeometry(9.5,11.5,14,10).rotateZ(Math.PI/2),HM.lime2);wrist.position.set(-20,-0.5,-1);g.add(wrist);
    const port=new THREE.Mesh(new THREE.CylinderGeometry(6,6,1.2,16).rotateZ(Math.PI/2),HM.port);port.position.set(-27.4,-0.5,-1);g.add(port);
    const rim=new THREE.Mesh(new THREE.TorusGeometry(7,1.1,6,18).rotateY(Math.PI/2),HM.dark);rim.position.set(-27.2,-0.5,-1);g.add(rim);
    // the skylight over the atrium, and the panel lines of the tubes that run out to each finger
    const sky=new THREE.Mesh(new THREE.CylinderGeometry(5.5,6,1,12),HM.lit);sky.position.set(0,3.6,0);g.add(sky);
    for(const [z] of FINGERS){const l=new THREE.Mesh(new THREE.BoxGeometry(14,0.4,0.9),HM.dark);l.position.set(6,3.7,z*0.75);l.rotation.y=-Math.atan2(z*0.25,14);g.add(l);}
    const belly=new THREE.Mesh(new THREE.CylinderGeometry(8,8,0.8,16),HM.lit);belly.position.y=-3.7;g.add(belly);
    for(let i=0;i<6;i++){const a=i/6*Math.PI*2,l=new THREE.Mesh(new THREE.SphereGeometry(0.9,6,4),HM.lit);l.position.set(Math.cos(a)*13,3.6,Math.sin(a)*13);g.add(l);}
    // a finger: a chain of joints, each a group holding its segment, the next joint at its end
    function finger(base,lens,r,m){const chain=[];let parent=base;
      lens.forEach((L,k)=>{const j=new THREE.Group();if(k)j.position.x=lens[k-1];parent.add(j);
        const seg=new THREE.Mesh(new THREE.CylinderGeometry(r*(0.92-k*0.1),r*(1-k*0.1),L,8).rotateZ(-Math.PI/2).translate(L/2,0,0),m);j.add(seg);
        const kn=new THREE.Mesh(new THREE.SphereGeometry(r*(1.02-k*0.1),8,6),m);j.add(kn);
        if(k===lens.length-1){const nail=new THREE.Mesh(new THREE.BoxGeometry(L*0.45,0.4,r*1.1),HM.nail);nail.position.set(L*0.62,r*(0.88-k*0.1),0);j.add(nail);
          const tip=new THREE.Group();tip.position.x=L;j.add(tip);chain.tip=tip;}
        chain.push(j);parent=j;});
      return chain;}
    FINGERS.forEach(([z,lens,r])=>{const b=new THREE.Group();b.position.set(14,0,z);g.add(b);const c=finger(b,lens,r,HM.lime);c.base=b;c.z=z;joints.push(c);});
    // the thumb: from the side of the palm towards the wrist, angled forward and out on the +z side
    const tb=new THREE.Group();tb.position.set(-2,-1.2,15.5);tb.rotation.y=-0.75;g.add(tb);
    const thumb=finger(tb,[9,7.5],3.3,HM.lime);thumb.base=tb;
    // the gun's muzzle glow, at the index fingertip
    const charge=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),glow(0xf8ff9a,{opacity:0,blending:THREE.AdditiveBlending}));joints[0].tip.add(charge);
    const beam=new THREE.Mesh(new THREE.ConeGeometry(16,90,20,1,true).translate(0,-45,0),glow(0xeaff9a,{opacity:0.15,side:THREE.DoubleSide,blending:THREE.AdditiveBlending}));
    beam.position.y=-3;g.add(beam);
    g.userData={joints,thumb,charge,beam,pose:JSON.parse(JSON.stringify(POSES.relaxed))};
    g.scale.setScalar(1.8);   // the size the show gives it: a hand a hundred metres long
    return tag(g);}
  // set the joints from a pose; lift (per finger) raises a fingertip off the ground, for walking
  function applyPose(g,P,lift){const {joints,thumb}=g.userData;
    joints.forEach((c,i)=>{const l=lift?lift[i]:0;c.forEach((j,k)=>{j.rotation.z=-(P.f[i][k]-(k===0?l:k===1?-l*0.6:0));});c.base.rotation.y=(i-1.5)*P.spread;});   // flexing towards the palm is down, -y
    thumb.base.rotation.y=-0.75-(P.tw||0);                                      // the thumb swings across the palm for a fist
    thumb.forEach((j,k)=>{j.rotation.z=-P.t[k]*0.6;j.rotation.y=-P.t[k]*0.55;});}
  // ease the current pose towards a target one: the fingers one after another, index first and the little finger
  // last, the thumb last of all, so a fist closes like a hand and not like a hinge
  function towards(g,P,k,lift){const c=g.userData.pose;
    for(let i=0;i<4;i++){const ki=Math.min(1,k*(1.35-i*0.22));for(let j=0;j<3;j++)c.f[i][j]+=(P.f[i][j]-c.f[i][j])*ki;}
    const kt=Math.min(1,k*0.6);for(let j=0;j<2;j++)c.t[j]+=(P.t[j]-c.t[j])*kt;c.tw=(c.tw||0)+((P.tw||0)-(c.tw||0))*kt;
    c.spread+=(P.spread-c.spread)*k;applyPose(g,c,lift);}
  const tipWorld=(g,i)=>{const v=new THREE.Vector3();g.userData.joints[i].tip.getWorldPosition(v);return v;};
  // the hand's orientation from where its fingers point (x) and where the back of the hand faces (y)
  const basisQ=(x,yHint)=>{const X=x.clone().normalize(),Y=yHint.clone().addScaledVector(X,-yHint.dot(X)).normalize(),Z=new THREE.Vector3().crossVectors(X,Y);
    return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(X,Y,Z));};

  function handship(){
    const g=makeHand();scene.add(g);applyPose(g,g.userData.pose);
    const sand=(x,z)=>groundH(x,z),UPV=new THREE.Vector3(0,1,0);
    const hx=beach.x+30,hz=beach.z,hoverY=sand(hx,hz)+120;
    const from=new THREE.Vector3(3400,700,-1500),away=new THREE.Vector3(3200,1300,1500);
    const target=new THREE.Vector3(T.x+28,sand(T.x+28,T.z+35)+1,T.z+35);   // where it shoots: the sand in front of the temple
    const toTemple=new THREE.Vector3(-1,0,0);                               // the temple is west of its beach
    // the beams: a thin barrage, and the charged shot; a flash at the muzzle for each
    const barM=glow(0xf4ff8a,{opacity:0,blending:THREE.AdditiveBlending}),bar=new THREE.Mesh(new THREE.CylinderGeometry(0.7,0.7,1,8,1,true),barM);
    const bigM=glow(0xfdffc8,{opacity:0,blending:THREE.AdditiveBlending}),big=new THREE.Mesh(new THREE.CylinderGeometry(3,3,1,12,1,true),bigM);
    for(const b of [bar,big]){b.userData.noFingerprint=true;scene.add(b);}
    const beamTo=(b,a,c)=>{const d=new THREE.Vector3().subVectors(c,a),L=d.length();b.scale.set(1,L,1);b.position.copy(a).addScaledVector(d,0.5);b.quaternion.setFromUnitVectors(UPV,d.normalize());};
    const pod=tag(new THREE.Mesh(new THREE.SphereGeometry(2.6,14,10),new THREE.MeshLambertMaterial({color:0x7acc3a,emissive:0x2a5a10})));let podV=null;
    // the program, in seconds from its arrival
    const P_={IN:36,HOVER:44,AIM:47,FIRE:53,CHARGE:57,SHOT:58.5,COCK:61.5,FLICK:63,OPEN:66,LAND:78,WALK:92,RISE:100,WAVE:108,FIST:111,OUT:138};
    let t=0,said={},recoil=0,walked=0;
    const say=(k,title,text,v,subj)=>{if(!said[k]){said[k]=1;notice(title,text,v,subj);}};
    const Q=new THREE.Quaternion(),aimQ=()=>basisQ(new THREE.Vector3().subVectors(target,tipWorld(g,0)).add(new THREE.Vector3().subVectors(tipWorld(g,0),g.position)),UPV);
    notice('The Hand Ship','The warship - a giant green left hand - is coming in over the sea, towards the temple.',()=>{const p=g.position;return [p.x-170,p.y+30,p.z+210,p.x,p.y,p.z];},()=>g.position);
    g.quaternion.copy(basisQ(new THREE.Vector3(hx-from.x,0,hz-from.z),UPV));
    run((now,dt)=>{t+=dt;const p=g.position,ud=g.userData;
      let pose=POSES.relaxed,k=Math.min(1,dt*2.2),lift=null,turn=Math.min(1,dt*1.2);
      ud.beam.visible=false;barM.opacity=Math.max(0,barM.opacity-dt*6);bigM.opacity=Math.max(0,bigM.opacity-dt*1.5);
      const c=ud.charge;c.material.opacity=Math.max(0,c.material.opacity-dt*3);recoil=Math.max(0,recoil-dt*4);
      if(t<P_.IN){                                                          // flying in, palm down, fingers forward
        const u=ease(t/P_.IN);p.lerpVectors(from,new THREE.Vector3(hx,hoverY,hz),u);
        Q.copy(basisQ(new THREE.Vector3(hx-from.x,(hoverY-from.y)*0.2,hz-from.z).lerp(toTemple.clone().multiplyScalar(1000),u*u),UPV));}
      else if(t<P_.HOVER){                                                  // over the beach, the light going over the sand
        p.set(hx+Math.sin(t*0.5)*6,hoverY+Math.sin(t*0.9)*2,hz);ud.beam.visible=true;ud.beam.rotation.x=Math.sin(t*1.3)*0.3;
        Q.copy(basisQ(toTemple,UPV));
        say('over','The Hand Ship','is over the temple\'s beach, its light going over the sand.',look(hx,hoverY,hz,-170,-40,170,-20));}
      else if(t<P_.SHOT){                                                   // a fist with the index out, aimed: the gun
        pose=POSES.point;Q.copy(aimQ());turn=Math.min(1,dt*2);
        if(t>P_.AIM&&t<P_.FIRE){const pulse=Math.floor(t*7)!==Math.floor((t-dt)*7);
          if(pulse){const a=tipWorld(g,0),j=new THREE.Vector3((R()-0.5)*16,0,(R()-0.5)*16).add(target);beamTo(bar,a,j);barM.opacity=0.95;c.material.opacity=1;c.scale.setScalar(2.2);recoil=1;
            burst(j.x,j.y+0.5,j.z,40,18,0xf8ffb0,0.8,14);}
          say('point','Pointing','A fist with the index finger out, and the finger is a gun: the ship is firing on the beach.',look(hx,hoverY,hz,-150,-30,190,-25));}
        else if(t>=P_.FIRE&&t<P_.CHARGE){const u=(t-P_.FIRE)/(P_.CHARGE-P_.FIRE);c.material.opacity=Math.min(1,u*1.2);c.scale.setScalar(1+6*u+Math.sin(t*30)*0.5);
          say('charge','Charging','The fingertip is glowing brighter and brighter: a single, bigger shot.',null);}
        else if(t>=P_.CHARGE&&!said.shot){said.shot=1;const a=tipWorld(g,0);beamTo(big,a,target);bigM.opacity=1;recoil=2.5;
          burst(target.x,target.y+1,target.z,700,50,0xfff6c0,2.2,20);burst(target.x,target.y+1,target.z,300,24,0xd8c8a0,2.6,25);}}
      else if(t<P_.FLICK){                                                  // the escape pod, flicked off with thumb and index
        pose=t<P_.COCK?POSES.cocked:POSES.flick;k=t<P_.COCK?k:Math.min(1,dt*14);
        Q.copy(basisQ(new THREE.Vector3(1,0.35,0.15),UPV));                    // turned to face the sea, so the pod goes out over the water
        if(!pod.parent)scene.add(pod);
        if(!podV)pod.position.copy(tipWorld(g,0)).add(new THREE.Vector3(0,-3,0));
        if(t>=P_.COCK&&!podV){const dir=new THREE.Vector3(1,0,0).applyQuaternion(g.quaternion);podV=dir.multiplyScalar(90).add(new THREE.Vector3(0,40,0));
          notice('An escape pod','flicked away with the thumb and index finger, the way you would flick a crumb off a table.',look(p.x,p.y,p.z,-160,-20,200,-10));}}
      else if(t<P_.OPEN){pose=POSES.relaxed;Q.copy(basisQ(toTemple,UPV));}
      else if(t<P_.WALK){                                                   // down onto its fingertips, then walking on them
        pose=POSES.stand;Q.copy(basisQ(toTemple,UPV));
        if(t>=P_.LAND){const ph=(t-P_.LAND)*1.7,a=Math.max(0,Math.sin(ph))*0.45,b=Math.max(0,-Math.sin(ph))*0.45;lift=[a,b,a,b];
          walked=Math.min(18,walked+dt*1.3);say('walk','Walking','on its fingertips across the sand towards the temple, like a giant spider.',look(hx,sand(hx,hz),hz,-120,30,140,10));}
        else say('land','Landing','on the beach in front of the temple, up on its fingertips.',look(hx,sand(hx,hz),hz,-120,30,140,10));
        // keep the fingertips on the sand: wherever they are, the hand rises or settles until the lowest is touching
        const u=Math.min(1,(t-P_.OPEN)/(P_.LAND-P_.OPEN));p.x=hx-walked;p.z=hz;
        let low=Infinity;for(let i=0;i<4;i++){const v=tipWorld(g,i);low=Math.min(low,v.y-sand(v.x,v.z));}
        const want=u<1?lerp(hoverY,sand(p.x,p.z)+25,ease(u)):p.y-(low-0.3);p.y+=(want-p.y)*(u<1?1:Math.min(1,dt*3));}
      else if(t<P_.RISE){pose=POSES.relaxed;p.y+=(hoverY-p.y)*Math.min(1,dt*0.5);Q.copy(basisQ(toTemple,UPV));}
      else if(t<P_.WAVE){                                                   // upright, palm to the beach, and a wave goodbye
        pose=POSES.open;const w=Math.sin((t-P_.RISE)*3.2)*0.4;
        Q.copy(basisQ(new THREE.Vector3(Math.sin(w)*0.6,1,Math.cos(w)*0.0+Math.sin(w)),new THREE.Vector3(1,0,0)));
        say('wave','Waving','It has turned upright, palm to the beach, and it is waving. Goodbye.',look(p.x,p.y,p.z,-200,-30,60,0));}
      else if(t<P_.FIST){pose=POSES.fist;Q.copy(basisQ(new THREE.Vector3(away.x-p.x,away.y-p.y,away.z-p.z),UPV));
        say('fist','Leaving','It has closed into a fist and is turning to go.',look(p.x,p.y,p.z,-200,-20,220,0));}
      else if(t<P_.OUT){pose=POSES.fist;const u=ease((t-P_.FIST)/(P_.OUT-P_.FIST));p.lerpVectors(new THREE.Vector3(hx-walked,hoverY,hz),away,u);
        Q.copy(basisQ(new THREE.Vector3(away.x-p.x,away.y-p.y,away.z-p.z),UPV));}
      else{scene.remove(g,bar,big,pod);return false;}
      towards(g,pose,k,lift);g.quaternion.slerp(Q,turn);
      if(recoil>0)p.addScaledVector(new THREE.Vector3(-1,0,0).applyQuaternion(g.quaternion),recoil*dt*14);   // a kick back along the arm
      if(podV&&pod.parent){podV.y-=12*dt;pod.position.addScaledVector(podV,dt);if(pod.position.y<(ctx.sea?ctx.sea.level:0.7)){burst(pod.position.x,1,pod.position.z,60,18,0xe0f4ff,1.4,16);scene.remove(pod);}}});}

  // ---- the red eye ----
  function makeEye(){const g=new THREE.Group();
    g.add(new THREE.Mesh(new THREE.IcosahedronGeometry(26,1),mat(0x3a3438)));
    const ring=new THREE.Mesh(new THREE.TorusGeometry(19,3.2,8,24).rotateY(Math.PI/2),mat(0x5a5258));ring.position.x=20;g.add(ring);
    const iris=new THREE.Mesh(new THREE.SphereGeometry(17,20,14,0,Math.PI*2,0,Math.PI/2).rotateZ(-Math.PI/2),new THREE.MeshLambertMaterial({color:0xff2a2a,emissive:0xd01010,emissiveIntensity:0.9}));
    iris.position.x=9;g.add(iris);
    const pupil=new THREE.Mesh(new THREE.SphereGeometry(7,14,10,0,Math.PI*2,0,Math.PI/2).rotateZ(-Math.PI/2),mat(0x0a0a0a));pupil.position.x=17.5;g.add(pupil);
    for(let i=0;i<8;i++){const a=i/8*Math.PI*2,sp=new THREE.Mesh(new THREE.ConeGeometry(3,14,5),mat(0x2a2428));sp.position.set(-6,Math.cos(a)*24,Math.sin(a)*24);sp.lookAt(-6,Math.cos(a)*60,Math.sin(a)*60);sp.rotateX(Math.PI/2);g.add(sp);}
    return tag(g);}
  function redeye(){
    const g=makeEye();scene.add(g);
    const from=new THREE.Vector3(2600,1500,-900),stop=new THREE.Vector3(T.x+480,330,-80),cannon=new THREE.Vector3(beach.x+20,groundH(beach.x+20,beach.z+30)+3,beach.z+30);
    // the light cannon: a pink barrel on the beach, and its beam
    const gun=tag(new THREE.Group());gun.position.copy(cannon);
    gun.add(new THREE.Mesh(new THREE.CylinderGeometry(2.6,3.4,9,10).rotateZ(Math.PI/2+0.5),mat(0xf2a0c8)));
    gun.add(new THREE.Mesh(new THREE.TorusGeometry(2.4,0.6,6,16).rotateY(Math.PI/2),mat(0xfff0f6)));
    const beamM=glow(0xffb0e0,{opacity:0,blending:THREE.AdditiveBlending});
    const beam=new THREE.Mesh(new THREE.CylinderGeometry(4,4,1,12,1,true),beamM);beam.userData.noFingerprint=true;scene.add(beam);
    let t=0,blown=false;const DOWN=50,AIM=8;
    notice('The Red Eye','Something is coming down out of the sky towards Beach City: a giant red eye.',()=>{const p=g.position;return [p.x-500,p.y-120,p.z+420,p.x,p.y,p.z];},()=>blown?null:g.position);
    run((now,dt)=>{t+=dt;
      if(!blown){const u=Math.min(1,t/DOWN);g.position.lerpVectors(from,stop,ease(u));g.lookAt(-400,0,0);g.rotateY(-Math.PI/2);g.rotation.z+=Math.sin(t)*0.02;
        if(t>DOWN-10&&!gun.parent){scene.add(gun);notice('The light cannon','is on the temple\'s beach, and it is pointing at the eye.',look(cannon.x,cannon.y,cannon.z,60,20,90,40));}
        if(gun.parent)gun.lookAt(g.position),gun.rotateY(-Math.PI/2);
        if(t>DOWN+AIM){blown=true;
          // the beam, and the eye coming apart
          const d=new THREE.Vector3().subVectors(g.position,cannon),L=d.length();beam.scale.set(1,L,1);beam.position.copy(cannon).addScaledVector(d,0.5);
          beam.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());beamM.opacity=0.9;
          const p=g.position;burst(p.x,p.y,p.z,900,90,0xff5a40,3.2,25);burst(p.x,p.y,p.z,500,60,0xffd0e8,2.2,15);
          const bits=[];for(let i=0;i<24;i++){const b=new THREE.Mesh(new THREE.TetrahedronGeometry(3+R()*5),mat(i%3?0x3a3438:0xff2a2a));b.position.copy(p);b.userData.noFingerprint=true;scene.add(b);
            bits.push({b,v:new THREE.Vector3((R()-0.3)*80,R()*60,(R()-0.5)*80),s:new THREE.Vector3(R(),R(),R())});}
          scene.remove(g);
          let tb=0;run((n2,d2)=>{tb+=d2;beamM.opacity=Math.max(0,0.9-tb*0.8);
            for(const o of bits){if(!o.b.parent)continue;o.v.y-=30*d2;o.b.position.addScaledVector(o.v,d2);o.b.rotation.x+=o.s.x*d2*3;o.b.rotation.y+=o.s.y*d2*3;
              if(o.b.position.y<0.7){burst(o.b.position.x,0.8,o.b.position.z,40,14,0xe0f4ff,1.6,18);scene.remove(o.b);}}
            if(tb>3&&gun.parent)scene.remove(gun);
            if(tb>12){scene.remove(beam);for(const o of bits)scene.remove(o.b);return false;}});
          notice('Shot down','The light cannon has hit it. What is left of the eye is coming down in the sea.',look(p.x,p.y-150,p.z,-300,-120,300,-150));}}
      return !blown;});}

  // ---- the water tower out at sea ----
  function tower(){
    const tx=2300,tz=-200;
    const prof=[];for(let i=0;i<=24;i++){const u=i/24;prof.push(new THREE.Vector2(70*(1-u)*(1-u)+14+10*Math.sin(u*9),u*1000));}
    const wm=new THREE.MeshPhongMaterial({color:0x3f9ad0,specular:0xcfeaff,shininess:60,transparent:true,opacity:0.82,flatShading:true});
    const col=new THREE.Mesh(new THREE.LatheGeometry(prof,18),wm);col.userData.noFingerprint=true;
    const spiral=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(Array.from({length:60},(_,i)=>{const u=i/59,a=u*Math.PI*14,r=40*(1-u)+22;return new THREE.Vector3(Math.cos(a)*r,u*1000,Math.sin(a)*r);})),300,4,6),wm);
    const g=tag(new THREE.Group());g.add(col,spiral);g.traverse(o=>{o.castShadow=false;});   // water casts no hard shadow, and a stale one would sit on the sea
    g.position.set(tx,0,tz);g.scale.set(1,0.001,1);scene.add(g);
    let t=0;const UP=25,STAY=40,DOWN=12;
    notice('The ocean is standing up','Far out to sea, the ocean is being pulled up into a tower a kilometre high - and the sea is going out from under the beach.',look(tx,300,tz,-1300,-150,500,0));
    const SEA=ctx.sea||{drain:0};let said=false;SEA._surged=false;
    run((now,dt)=>{t+=dt;let s;
      if(t<UP)s=ease(t/UP);else if(t<UP+STAY)s=1;else if(t<UP+STAY+DOWN){s=1-ease((t-UP-STAY)/DOWN);if(R()<0.6)burst(tx+(R()-0.5)*120,30+R()*80,tz+(R()-0.5)*120,30,30,0xd8f0ff,2.5,20);}
      else{scene.remove(g);SEA.drain=0;return false;}
      g.scale.y=Math.max(0.001,s);g.rotation.y=t*0.15;
      // the water in the tower is the sea's: as it rises the sea level falls, fourteen metres at the most, and the
      // sea bed comes out from under the beach; when it falls back, the sea comes back in
      SEA.drain=14*s;
      if(t>UP*0.6&&!said){said=true;notice('The sea has gone out','The water in the tower is the ocean\'s. The sea bed is bare for hundreds of metres out from the beach.',look(beach.x-300,0,beach.z+250,0,140,420,-10));}
      if(t>=UP+STAY+DOWN-dt&&!SEA._surged){SEA.drain=0;SEA._surged=true;SEA.surge=1;
        // the sea comes back all at once: spray all along the shore, and the foam running up the sand
        for(const line of (PL.surf||[]))for(let k=0;k<line.length;k+=2){const [x,z]=line[k];burst(x,1.5,z,24,10,0xf2faff,1.8,9);}
        notice('The sea is back','The tower has fallen and the ocean has come rushing back in, right up the beach.',look(beach.x-300,0,beach.z+250,0,140,420,-10));}
      if(t<UP&&R()<0.5)burst(tx+(R()-0.5)*160,2,tz+(R()-0.5)*160,20,18,0xd8f0ff,2,16);});}

  // ---- the lion ----
  // Lion: a big pink lion with a huge pale mane, drawn nose to +x, about four metres to the shoulder once scaled
  function makeLion(){const g=new THREE.Group(),pink=mat(0xf29ac0),pink2=mat(0xe888b2),mane=mat(0xfad0e2),dark=mat(0x5a2a3a),white=mat(0xffffff);
    const ball=(r,m,x,y,z,sx,sy,sz)=>{const o=new THREE.Mesh(new THREE.IcosahedronGeometry(r,1),m);o.position.set(x,y,z);o.scale.set(sx||1,sy||1,sz||1);g.add(o);return o;};
    // the torso: a long barrel, deeper at the chest, with the haunches round at the back
    const torso=new THREE.Mesh(new THREE.CylinderGeometry(1.25,1.45,3.4,10).rotateZ(Math.PI/2),pink);torso.position.set(0.1,2.45,0);torso.scale.set(1,1,0.88);g.add(torso);
    ball(1.5,pink,1.5,2.55,0,1,1.05,0.9);                  // the chest
    ball(1.45,pink,-1.55,2.5,0,1,1,0.9);                   // the haunches
    // the mane: a ring of big soft lobes round the head and down onto the shoulders
    for(let k=0;k<12;k++){const a=k/12*Math.PI*2;ball(0.95,mane,2.35,3.55+Math.cos(a)*1.25,Math.sin(a)*1.25,0.9,1,1);}
    ball(1.45,mane,2.0,3.5,0,1,1.05,1.05);ball(1.1,mane,1.3,3.2,0,1,1,1.1);
    // the head: rounded, a muzzle and a nose, eyes and ears
    ball(0.95,pink,3.1,3.55,0,1,0.95,0.95);
    ball(0.55,pink2,3.85,3.2,0,1,0.8,1);
    const nose=new THREE.Mesh(new THREE.BoxGeometry(0.3,0.22,0.36),dark);nose.position.set(4.35,3.4,0);g.add(nose);
    for(const s of [-1,1]){const e=new THREE.Mesh(new THREE.SphereGeometry(0.12,8,6),dark);e.position.set(3.85,3.85,s*0.38);g.add(e);
      const w=new THREE.Mesh(new THREE.SphereGeometry(0.05,6,4),white);w.position.set(3.95,3.9,s*0.38);g.add(w);
      ball(0.32,pink,2.8,4.5,s*0.6,0.6,1,1);}
    // the legs, thick, with big paws
    const legs=[];for(const [a,b] of [[1.5,0.72],[1.5,-0.72],[-1.6,0.72],[-1.6,-0.72]]){const l=new THREE.Group();l.position.set(a,2.2,b);
      const up=new THREE.Mesh(new THREE.CylinderGeometry(0.42,0.36,2.0,8).translate(0,-1,0),pink);l.add(up);
      const paw=new THREE.Mesh(new THREE.IcosahedronGeometry(0.45,1),pink);paw.scale.set(1.3,0.6,1);paw.position.set(0.15,-2.05,0);l.add(paw);
      g.add(l);legs.push(l);}
    // the tail, with a tuft of mane at the end
    const tail=new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.16,2.4,6).translate(0,1.2,0),pink);tail.position.set(-2.7,2.8,0);tail.rotation.z=1.05;g.add(tail);
    ball(0.38,mane,-4.75,4.0,0);
    g.userData.legs=legs;g.scale.setScalar(1.8);return tag(g);}
  function lion(){
    const g=makeLion();scene.add(g);
    const pts=[[beach.x+10,beach.z+100],[T.x-170,200],[T.x-470,205],[-100,200]].map(([x,z])=>new THREE.Vector3(x,0,z));
    const path=new THREE.CatmullRomCurve3(pts),L=path.getLength(),SP=7;let s=0,t=0,stage=0;
    const portal=tag(new THREE.Mesh(new THREE.CircleGeometry(4,24),glow(0xfff0fa,{opacity:0,side:THREE.DoubleSide,blending:THREE.AdditiveBlending})));
    notice('A pink lion','is walking along the beach from the temple towards the boardwalk. Nobody seems surprised.',()=>{const p=g.position;return [p.x-6,p.y+7,p.z+34,p.x,p.y+3,p.z];},()=>g.position);   // from the sea side, to see it walk
    const tmp=new THREE.Vector3();
    run((now,dt)=>{t+=dt;
      if(stage===0){s=Math.min(L,s+SP*dt);const u=s/L;path.getPointAt(u,g.position);g.position.y=groundH(g.position.x,g.position.z);path.getTangentAt(u,tmp);g.rotation.y=Math.atan2(-tmp.z,tmp.x);
        g.userData.legs.forEach((l,i)=>l.rotation.z=Math.sin(t*6+(i%2?Math.PI:0)+(i>1?Math.PI/2:0))*0.5);
        if(s>=L){stage=1;t=0;const p=g.position;portal.position.set(p.x-9,p.y+4,p.z);portal.rotation.y=Math.PI/2;scene.add(portal);
          burst(p.x-4,p.y+4,p.z,200,25,0xffd0ea,1.2,0);notice('Roar','The lion has roared a portal open in the air, and it is walking into it.',look(p.x,p.y,p.z,25,8,30,3));}}
      else{portal.material.opacity=Math.min(0.85,t);if(t>1.5){g.position.x-=SP*dt;g.userData.legs.forEach((l,i)=>l.rotation.z=Math.sin(t*6+(i%2?Math.PI:0))*0.5);}
        if(g.position.x<portal.position.x+1)g.visible=false;
        if(t>5){portal.material.opacity=Math.max(0,0.85-(t-5));}
        if(t>6.5){scene.remove(g);scene.remove(portal);return false;}}});}

  // ---- a gem monster on the temple's beach ----
  function monster(){
    const N=11,segs=[],body=mat(0xe8e070),leg=mat(0x6a4a3a),face=mat(0xf6a0b0);
    const g=tag(new THREE.Group());scene.add(g);
    for(let i=0;i<N;i++){const s=new THREE.Group(),r=i===0?1.9:1.6-i*0.06;
      s.add(new THREE.Mesh(new THREE.IcosahedronGeometry(r,0),i===0?face:body));
      for(const side of [-1,1]){const l=new THREE.Mesh(new THREE.BoxGeometry(0.25,1.6,0.25).translate(0,-0.8,0),leg);l.position.set(0,0,side*r*0.9);l.rotation.x=side*0.6;s.add(l);}
      g.add(s);segs.push({s,hist:[]});}
    tag(g);
    const x0=beach.x+60,z0=beach.z+160;let t=0;const trail=[];
    notice('A gem monster','is crawling up the temple\'s beach - something like a giant centipede.',()=>{const p=segs[0].s.position;return [p.x+30,p.y+16,p.z+30,p.x,p.y,p.z];},()=>segs[0].s.position);
    run((now,dt)=>{t+=dt;
      if(t<40){const x=x0-t*1.6+Math.sin(t*0.5)*8,z=z0-t*3.2+Math.sin(t*0.9)*10,y=groundH(x,z)+1.6;trail.unshift([x,y,z]);if(trail.length>600)trail.pop();
        segs.forEach((o,i)=>{const p=trail[Math.min(trail.length-1,i*9)];o.s.position.set(p[0],p[1]+Math.sin(t*8+i)*0.15,p[2]);o.s.children.forEach((c,k)=>{if(k)c.rotation.x=(k===1?1:-1)*(0.6+Math.sin(t*10+i)*0.3);});});}
      else if(t<41){const p=segs[0].s.position;burst(p.x,p.y,p.z,400,14,0xffffff,1.4,0);g.visible=false;
        // the gem left behind, bubbled, floating up
        const bub=tag(new THREE.Mesh(new THREE.SphereGeometry(1.4,16,12),glow(0xffb8dc,{opacity:0.45,blending:THREE.AdditiveBlending})));
        const gem=tag(new THREE.Mesh(new THREE.OctahedronGeometry(0.5),new THREE.MeshLambertMaterial({color:0xffe060,emissive:0x806010})));bub.add(gem);bub.position.copy(p);scene.add(bub);
        notice('Poofed','and bubbled. The gem it came from floats up and away, to be kept safe in the temple.',look(p.x,p.y,p.z,20,8,20,2));
        let tb=0;run((n2,d2)=>{tb+=d2;bub.position.y+=d2*2;gem.rotation.y+=d2*2;if(tb>3){bub.scale.multiplyScalar(0.96);}if(tb>6){scene.remove(bub);return false;}});
        t=50;}
      else{scene.remove(g);return false;}});}

  // ---- fireworks over Funland ----
  function fireworks(){
    const cols=[0xff5a7a,0x6ad0ff,0xffe06a,0x9aff7a,0xd08aff,0xffffff];let t=0,next=0;
    notice('Fireworks','over Funland, out on the bay. Best after dark.',look(F.x,90,F.z,-160,-60,260,10));
    run((now,dt)=>{t+=dt;if(t>next){next=t+0.5+R()*1.2;const x=F.x+(R()-0.5)*90,z=F.z+(R()-0.5)*70,y=90+R()*70;
        burst(x,y,z,260,30+R()*20,cols[Math.floor(R()*cols.length)],2.4,9);}
      return t<40;});}

  // ---- Mayor Dewey: the van is always going round (life.js); this finds it and follows it ----
  function dewey(){const v=ctx.deweyVan;if(!v)return;
    notice('Mayor Dewey','is out in his van with the loudspeakers on, going round the town, telling everybody to vote for him.',
      ()=>{const p=v.position,a=v.rotation.y;return [p.x-Math.cos(a)*24,p.y+15,p.z+Math.sin(a)*24,p.x,p.y+1.5,p.z];},()=>v.position);}

  H=createHappenings(api,{events:{dewey:['Mayor Dewey',dewey],handship:['The Hand Ship',handship],redeye:['The Red Eye',redeye],tower:['The ocean tower',tower],
      lion:['A pink lion',lion],monster:['A gem monster',monster],fireworks:['Fireworks',fireworks]},
    order:['lion','handship','dewey','fireworks','monster','redeye','tower'],first:30000,every:[60000,110000]});
}
