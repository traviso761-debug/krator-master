// ---------- Galaxy class: life round the ship ----------
// Fan work. Star Trek belongs to Paramount; the small craft here are this project's own drawing.
//
// What goes on round a ship that is not the ship doing anything:
//   - Shuttles. Every minute or so, when she is not at warp, one comes home to the main bay at the stern (out of
//     the dark astern, round in a long easy curve, slowing, nose into the bay as its lights come up) or one leaves
//     from bay 2 or 3 in the neck's back, out along the door's line and away aft and up. They fly in the ship's own
//     frame, so at the helm they keep station with her as a real one matches her speed. (Launch a shuttle, on the
//     Events panel, is a separate one out of the main bay.)
//   - Workbees at the starbases: small one-man pods with two arms and a work light, drifting from job to job round
//     the station (the docking arm, the ring, the spindle, and the berth, so a docked Enterprise has two round
//     her), stopping at each with the blue flicker of a cutting torch.
//   - Ships berthed at a starbase's arm: two at each, of the fleet's own classes, clamped on to the truss on short
//     gantries, their lights on.
//   - Running lights on the traffic: a white strobe, a double flash, and a slow red beacon on top, each ship on a
//     beat of its own (a wreck's have failed).
// Everything is made the first time it is wanted (a station is visited, a ship comes into the place you are at) and
// hidden with the place it belongs to.
import {BAYS} from './dims.js';
import {neckSurf,normalAt,NECKY} from './hull.js';
import {fold} from '../starship/parts.js';

const BERTHED=[['USS Calloway','NCC-73114','corvid'],['USS Hesketh','NCC-70291','kestrel'],['USS Mereth','NCC-68730','tamar'],['USS Dunmore','NCC-75402','kestrel'],
  ['USS Ashgrove','NCC-71988','corvid'],['USS Talland','NCC-66045','tamar'],['USS Kerrow','NCC-74511','kestrel'],['USS Fennick','NCC-72207','corvid']];

export function life(W){
  const {THREE,G,animHooks}=W,F=W.fx,S=W.flight,V=()=>new THREE.Vector3();
  const std=(c,m,r)=>new THREE.MeshStandardMaterial({color:c,metalness:m,roughness:r,envMap:W.env,envMapIntensity:1.1});
  const M={hull:std(0xc8ccd0,0.3,0.5),dark:std(0x3a3f46,0.4,0.6),bee:std(0xd8c690,0.3,0.55),
    lit:new THREE.MeshBasicMaterial({color:0xffe0a0,toneMapped:false}),blue:new THREE.MeshBasicMaterial({color:0x6fb0ff,toneMapped:false})};
  const fin=g=>{g.traverse(o=>{o.userData.noWire=true;if(o.isMesh){o.castShadow=false;o.receiveShadow=false;}});return g;};
  // the small craft are built of parts and folded to one mesh a material (parts.js), so a workbee is three draws
  const box=(L,w,h,d,m,x,y,z)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);b.position.set(x||0,y||0,z||0);L.push(b);return b;};
  const smooth=u=>u<0?0:u>1?1:u*u*(3-2*u);

  // ================= shuttles =================
  // a boxy shuttle of this page's own (+x forward), about nine metres: body, sloped nose, two engine pods
  const shuttleProto=(()=>{const L=[];box(L,8.5,3,4.6,M.hull);
    const nose=new THREE.Mesh(new THREE.CylinderGeometry(0.01,2.3,2.4,4,1),M.hull);nose.rotation.z=-Math.PI/2;nose.rotation.x=Math.PI/4;nose.scale.set(1,1,0.7);nose.position.x=5.4;L.push(nose);
    for(const z of [-2.9,2.9]){box(L,7,1.2,1.1,M.hull,-0.6,-0.4,z);box(L,5,0.35,0.15,M.blue,-0.6,-0.4,z+Math.sign(z)*0.6);}
    box(L,0.2,0.8,3.2,M.lit,4.3,0.6,0);box(L,0.3,2.2,3.6,M.dark,-4.3,0,0);
    return fin(fold(THREE,new THREE.Group(),L));})();
  const shuttles=[];
  function shuttle(home){
    const g=shuttleProto.clone(),eng=F.sprite(0xff6a3a,10,0.9),nav=F.sprite(0xffffff,5,0);eng.position.set(-4.8,-0.2,0);nav.position.set(0,1.8,0);g.add(eng,nav);
    g.userData.info={name:'A shuttlecraft',info:home?'Coming home to the main shuttlebay at the stern.':'Out of one of the shuttlebays in the neck, on an errand of its own.'};
    const sd=Math.random()<0.5?1:-1,B=BAYS.main;let path;
    if(home){
      // from out of the dark astern, round, in: a cubic, slowing all the way
      path=[V().set(B.x-2400,B.y+(Math.random()-0.3)*500,sd*(700+Math.random()*500)),V().set(B.x-700,B.y+60,sd*260),V().set(B.x-160,B.y,0),V().set(B.x+6,B.y,0)];
    }else{
      // out of bay 2 or 3 along its door's line, then away aft and up
      const U=BAYS.upper,u=(U.y-NECKY[0])/(NECKY[1]-NECKY[0]),p={x:0,y:0,z:0},n={x:0,y:0,z:0};neckSurf(u,0.5,p);normalAt(neckSurf,u,0.5,n,false);
      const d=V().set(p.x,p.y,sd*U.z);path=[d.clone().addScaledVector(V().set(n.x,n.y,0),-2),d.clone().addScaledVector(V().set(n.x,n.y,0),120),
        d.clone().add(V().set(-700,380,sd*240)),d.clone().add(V().set(-2600,900,sd*900))];
    }
    const at=(t,o)=>{const s=1-t;return o.set(0,0,0).addScaledVector(path[0],s*s*s).addScaledVector(path[1],3*s*s*t).addScaledVector(path[2],3*s*t*t).addScaledVector(path[3],t*t*t);};
    G.add(g);W.pickable(g);g.position.copy(path[0]);
    shuttles.push({g,home,at,t:0,D:home?42:34,eng,nav});
  }
  const p1=V(),p2=V(),X1=new THREE.Vector3(1,0,0),qq=new THREE.Quaternion();
  let nextShuttle=performance.now()+25000+Math.random()*20000;
  function shuttleFrame(now,dt){
    if(now>nextShuttle){nextShuttle=now+45000+Math.random()*40000;
      const quiet=!S.warp&&!W.spooling&&W.ROOT.visible&&(!W.saucer||!W.saucer.home||W.saucer.home())&&shuttles.length<2;
      if(quiet)shuttle(Math.random()<0.55);}
    for(let i=shuttles.length-1;i>=0;i--){const s=shuttles[i];
      // home: eased so it comes in slowly at the end; away: speeding up
      s.t+=dt/s.D;const u=s.home?1-Math.pow(1-Math.min(1,s.t),1.7):Math.pow(Math.min(1,s.t),1.4);
      s.at(u,p1);s.at(Math.min(1,u+0.004),p2);s.g.position.copy(p1);
      if(p2.distanceToSquared(p1)>1e-6){qq.setFromUnitVectors(X1,p2.sub(p1).normalize());s.g.quaternion.slerp(qq,Math.min(1,dt*3));}
      s.nav.material.opacity=(now%1300)<90?1:0;s.eng.material.opacity=s.home?0.5+0.5*(1-u):0.9;
      if(s.home&&W.bayGlow)W.bayGlow.material.opacity=Math.max(W.bayGlow.material.opacity,0.25+0.6*smooth((u-0.7)/0.3));
      // gone: into the bay, or away into the dark (or the ship has gone to warp, or the saucer has left)
      if(s.t>=1||S.warp){G.remove(s.g);const j=W.pick.indexOf(s.g);if(j>=0)W.pick.splice(j,1);shuttles.splice(i,1);}}
  }

  // ================= workbees =================
  const beeProto=(()=>{const L=[];box(L,3.2,2.6,2.6,M.bee);box(L,0.2,1.4,1.8,M.lit,1.65,0.3,0);
    for(const z of [-0.8,0.8]){const a=box(L,2.6,0.35,0.35,M.dark,2.4,-1,z);a.rotation.z=-0.35;}
    box(L,1.2,0.6,2.8,M.dark,-1.6,-1.1,0);return fin(fold(THREE,new THREE.Group(),L));})();
  // the jobs round a station, in its frame: along the arm, round the ring, on the spindle, at the berth
  const JOBS=[[300,-490,30],[620,-548,-30],[980,-490,20],[1400,-548,-25],[1580,-500,40],[900,40,40],[-640,60,-640],[0,0,930],[140,-300,90],[-130,300,-90],
    [1050,-430,330],[1150,-610,330],[880,-500,560],[1250,-500,120]];
  const bees=new Map();
  function beesFor(st){
    const list=[],seedOf=k=>{let x=Math.sin((st.n*97+k)*12.9898)*43758.5453;return x-Math.floor(x);};
    for(let i=0;i<5;i++){const g=beeProto.clone(),lt=F.sprite(0xffb050,8,1),torch=F.sprite(0xbfe0ff,14,1),wl=F.sprite(0xfff4d8,26,0.35);torch.visible=false;
      lt.position.set(0,1.6,0);torch.position.set(3.8,-1.6,0);wl.position.set(2.2,0.3,0);g.add(lt,torch,wl);
      g.userData.info={name:'A workbee',info:'A one-man work pod of '+st.name+': two arms, a cutting torch and a work light, going from job to job round the station.'};
      // two of the five keep to the berth, so a ship docked there has them round her
      const jobs=i<2?[10,11,12,13]:[0,1,2,3,4,5,6,7,8,9];
      const b={g,lt,torch,jobs,j:Math.floor(seedOf(i)*jobs.length),from:V(),to:V(),t0:0,D:1,dwell:0,ph:seedOf(i+20)*1000};
      const J=JOBS[b.jobs[b.j]];b.to.set(J[0]+(seedOf(i+5)-0.5)*60,J[1]+(seedOf(i+6)-0.5)*40,J[2]+(seedOf(i+7)-0.5)*60);g.position.copy(b.to);b.from.copy(b.to);
      st.g.add(g);W.pickable(g);list.push(b);}
    bees.set(st,list);return list;
  }
  const look=V();
  function beeFrame(now,dt,st){
    const list=bees.get(st)||beesFor(st);
    for(const b of list){
      const u=(now-b.t0)/b.D;
      if(u>=1){
        if(b.dwell<=0){b.dwell=now+7000+Math.random()*9000;}
        // at work: the torch flickers on and off
        const tc=((now+b.ph)%2600)<1400;b.torch.visible=tc;if(tc)b.torch.material.opacity=0.5+0.5*Math.random();
        if(now>b.dwell){b.dwell=0;b.torch.visible=false;b.from.copy(b.g.position);b.j=(b.j+1+Math.floor(Math.random()*2))%b.jobs.length;const J=JOBS[b.jobs[b.j]];
          b.to.set(J[0]+(Math.random()-0.5)*60,J[1]+(Math.random()-0.5)*40,J[2]+(Math.random()-0.5)*60);b.t0=now;b.D=Math.max(8000,b.from.distanceTo(b.to)/9*1000);}
      }else{const k=smooth(u);b.g.position.lerpVectors(b.from,b.to,k);b.g.lookAt(st.g.localToWorld(look.copy(b.to)));b.g.rotateY(-Math.PI/2);}
      b.lt.material.opacity=((now+b.ph)%1100)<120?1:0.15;}
  }

  // ================= ships berthed at the arm =================
  const berthed=new Set();
  function berth(st){
    if(berthed.has(st)||!W.traffic||!W.traffic.make)return;berthed.add(st);
    const gant=new THREE.MeshStandardMaterial({color:0x6a7078,metalness:0.5,roughness:0.5,envMap:W.env});
    // two berths on the truss nearer the spindle than the Enterprise's: one each side
    [[430,-110],[400,125]].forEach(([x,z],k)=>{
      const [name,reg,cls]=BERTHED[(st.n*3+k*5)%BERTHED.length],g=W.traffic.make(cls);
      g.position.set(x,-520,z);g.rotation.y=Math.PI;
      g.userData.info={name:name+' ('+reg+')',info:(W.traffic.classTitle(cls)||'A starship')+', berthed at '+st.name+': clamped to the docking arm, taking on stores, her crew ashore.'};
      st.g.add(g);W.pickable(g);
      // the gantry from the truss to her side
      const gl=Math.abs(z)-13-(cls==='corvid'?30:cls==='tamar'?18:24);
      if(gl>4){const m=new THREE.Mesh(new THREE.BoxGeometry(8,6,gl),gant);m.position.set(x,-520,Math.sign(z)*(13+gl/2));m.userData.noWire=true;st.g.add(m);}
      // a ship at a berth keeps her navigation lights burning
      const s=F.sprite(0xffffff,10,0.9);s.position.set(x,-500,z);st.g.add(s);});
  }

  // ================= running lights on the traffic =================
  const lit=new WeakMap(),boxes={};
  const boxOf=t=>{if(boxes[t.cls])return boxes[t.cls];const bb=new THREE.Box3();
    for(const o of t.g.children)if(o.isMesh&&o.geometry){if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();bb.union(o.geometry.boundingBox.clone().applyMatrix4(o.matrix));}
    if(bb.isEmpty())bb.set(V().set(-60,-10,-30),V().set(60,10,30));return boxes[t.cls]=bb;};
  function lightsFor(t){
    let L=lit.get(t);if(L)return L;
    // the class's size and its highest point, in its own frame, from its meshes (once a class)
    const bb=boxOf(t);
    const R=Math.max(bb.max.x-bb.min.x,bb.max.z-bb.min.z)*0.5,st=F.sprite(0xffffff,Math.max(8,R*0.14),0),bc=F.sprite(0xff2a1a,Math.max(6,R*0.1),0);
    st.position.set(bb.min.x+R*0.05,(bb.min.y+bb.max.y)*0.5,0);bc.position.set((bb.min.x+bb.max.x)*0.5,bb.max.y+2,0);st.visible=bc.visible=false;t.g.add(st,bc);
    L={st,bc,ph:Math.random()*3000};lit.set(t,L);return L;
  }
  function trafficFrame(now){
    for(const t of W.traffic.here()){if(!t.g.visible)continue;const L=lightsFor(t),dead=t.task&&t.task.kind==='wreck';
      // a double flash every two seconds and a slow red beat
      const s=(now+L.ph)%2000,on=!dead&&(s<70||(s>220&&s<290));L.st.visible=on;if(on)L.st.material.opacity=1;
      const b=((now+L.ph*0.7)%2600)/2600,k=dead?0:Math.max(0,Math.sin(b*Math.PI*2));L.bc.visible=k>0.02;L.bc.material.opacity=k;}
  }

  let last=null;
  animHooks.push(now=>{const dt=last==null?0:Math.min(0.1,(now-last)/1000);last=now;
    shuttleFrame(now,dt);
    const here=W.herePlace&&W.herePlace();
    if(here&&here.group.visible)for(const st of (W.stations||[]))if(st.place===here){
      // the station's own bees and berths only when the camera could see it: within forty kilometres
      const d=st.g.getWorldPosition(look).distanceTo(W.api.camera.position);
      if(d<40000)berth(st);
      // the bees are three metres long: past eight kilometres they are less than a pixel, and not drawn
      const near=d<8000,L=bees.get(st);if(near)beeFrame(now,dt,st);else if(L&&L[0].g.visible!==near)for(const b of L)b.g.visible=false;
      if(near&&L&&!L[0].g.visible)for(const b of L)b.g.visible=true;}
    if(W.traffic)trafficFrame(now);
  });
  return {state:()=>({shuttles:shuttles.length,bees:[...bees.values()].reduce((a,l)=>a+l.length,0),berthed:berthed.size}),
    act:{shuttlehome:()=>shuttle(true),shuttleout:()=>shuttle(false)}};
}
