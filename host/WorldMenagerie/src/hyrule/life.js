// ---------- what moves in Hyrule ----------
// Fan work: Breath of the Wild belongs to Nintendo, and every shape here is this project's own.
//
// Guardian Stalkers walking the fields round the castle on their six legs, the eye's red sight line going over the
// ground in front of them; wild horses grazing in herds on the open plains; hawks circling; and now and then a
// figure in green paragliding down from one of the towers. The Divine Beasts and Ganon move in beasts.js.
import { mkRng } from '../core/rng.js';
import { guardianKit } from './guardian.js';

export function life(api){
  const {THREE,ctx,scene,animHooks,groundH}=api;
  const PL=ctx.plan;if(!PL)return;const S=PL.sites;
  const R=mkRng(1986);
  const mat=c=>new THREE.MeshLambertMaterial({color:c,flatShading:true});
  const nightF=()=>api.nightF&&api.hour?api.nightF(api.hour()):0;
  const wet=(x,z)=>{for(const L of (PL.lakes||[])){let c=false;const p=L.poly;for(let i=0,j=p.length-1;i<p.length;j=i++){if((p[i][1]>z)!==(p[j][1]>z)&&x<(p[j][0]-p[i][0])*(z-p[i][1])/(p[j][1]-p[i][1])+p[i][0])c=!c;}if(c)return true;}
    for(const M of (PL.moats||[])){const d=Math.hypot(x-M.x,z-M.z);if(d>M.r0-8&&d<M.r1+8)return true;}
    for(const Rv of (PL.rivers||[])){const P=Rv.pts;for(let i=0;i+1<P.length;i++){const [ax,az]=P[i],[bx,bz]=P[i+1],dx=bx-ax,dz=bz-az,l=dx*dx+dz*dz,t=l?Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/l)):0;
      if(Math.hypot(x-ax-t*dx,z-az-t*dz)<Rv.width*1.6)return true;}}
    return groundH(x,z)<2;};

  // ---- Guardian Stalkers (guardian.js): walking a loop on six legs, the head turning, the eye's red line sweeping
  // the ground ahead, a red point where it lands ----
  const GK=guardianKit(THREE),lineM=new THREE.MeshBasicMaterial({color:0xff2a2a,transparent:true,opacity:0.7,depthWrite:false}),dotM=new THREE.MeshBasicMaterial({color:0xff4a3a});
  const stalkers=[];
  for(let k=0;k<7;k++){const G=GK.make();G.g.traverse(o=>{o.userData.noFingerprint=true;});scene.add(G.g);
    const beam=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.08,1,4),lineM);beam.userData.noFingerprint=true;beam.userData.noWire=true;scene.add(beam);
    const dot=new THREE.Mesh(new THREE.SphereGeometry(0.5,8,6),dotM);dot.userData.noFingerprint=true;scene.add(dot);
    // a loop that stays on dry ground, legs and all
    let cx,cz,rad;for(let tries=0;tries<40;tries++){const a0=R()*Math.PI*2,r=500+R()*900;cx=S.castle.x+Math.cos(a0)*r;cz=S.castle.z+300+Math.sin(a0)*r*0.7;rad=60+R()*120;
      let dry=true;for(let i=0;i<24&&dry;i++){const b=i/24*Math.PI*2;for(const e of [-12,0,12])if(wet(cx+Math.cos(b)*(rad+e),cz+Math.sin(b)*(rad+e)))dry=false;}if(dry)break;}
    stalkers.push(Object.assign(G,{y0:G.body.position.y,beam,dot,cx,cz,rad,ph:R()*6.28,sp:(0.04+R()*0.03)*(R()<0.5?-1:1)}));}
  ctx.stalkers=stalkers;

  // ---- wild horses: a herd or two on the plains, grazing and wandering ----
  const coats=[0x8a5a3a,0x5a3a2a,0xe8e0d0,0x3a2a22,0xb08860].map(mat),hide=new THREE.Group(),horses=[];
  const horse=(m)=>{const g=new THREE.Group();g.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(2.4,1,0.8),m)));g.children[0].position.y=1.6;
    const neck=new THREE.Mesh(new THREE.BoxGeometry(0.5,1.4,0.5),m);neck.position.set(1.2,2.2,0);neck.rotation.z=-0.6;g.add(neck);
    const head=new THREE.Mesh(new THREE.BoxGeometry(0.9,0.4,0.4),m);head.position.set(1.7,2.7,0);g.add(head);
    for(const [a,b] of [[0.9,0.3],[0.9,-0.3],[-0.9,0.3],[-0.9,-0.3]]){const l=new THREE.Mesh(new THREE.BoxGeometry(0.2,1.2,0.2).translate(0,-0.6,0),m);l.position.set(a,1.2,b);g.add(l);}
    g.userData.neck=neck;g.userData.head=head;return g;};
  for(const [hx,hz,n] of [[S.castletown.x-900,S.castletown.z+900,9],[S.castletown.x+1200,S.castletown.z+1400,7],[S.plateau.x+600,S.plateau.z-1300,6]]){
    for(let k=0;k<n;k++){const x=hx+(R()-0.5)*160,z=hz+(R()-0.5)*160;if(wet(x,z))continue;const g=horse(coats[Math.floor(R()*coats.length)]);
      g.traverse(o=>{o.userData.noFingerprint=true;});scene.add(g);horses.push({g,x,z,a:R()*6.28,ph:R()*6.28,graze:R()<0.6});}}

  // ---- hawks over the country ----
  const birdG=new THREE.BufferGeometry();birdG.setAttribute('position',new THREE.Float32BufferAttribute([-1.6,0.3,0.2, 0,0,-0.4, 0,0,0.4, 1.6,0.3,0.2, 0,0,-0.4, 0,0,0.4],3));birdG.computeVertexNormals();
  const birdM=new THREE.MeshLambertMaterial({color:0x4a3a2a,side:THREE.DoubleSide}),birds=[];
  for(let k=0;k<30;k++){const m=new THREE.Mesh(birdG,birdM);m.userData.noFingerprint=true;m.userData.noWire=true;scene.add(m);
    const c=PL.towers[k%PL.towers.length];birds.push({m,cx:c.x+(R()-0.5)*600,cz:c.z+(R()-0.5)*600,cy:groundH(c.x,c.z)+80+R()*160,r:40+R()*120,w:(R()<0.5?-1:1)*(0.08+R()*0.1),ph:R()*6.28});}

  // ---- a figure in green, paragliding down from a tower, now and then ----
  const glider=(()=>{const g=new THREE.Group(),tunic=mat(0x3a7ad0),skin=mat(0xf0c8a0),hair=mat(0xd8b050),cloth=mat(0xa8603a),pole=mat(0x6a4a30);
    g.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(0.28,0.32,1.1,8),tunic)));g.children[0].position.y=-1.6;
    const head=new THREE.Mesh(new THREE.SphereGeometry(0.24,10,8),skin);head.position.y=-0.85;g.add(head);
    const hr=new THREE.Mesh(new THREE.SphereGeometry(0.26,10,6,0,Math.PI*2,0,Math.PI*0.55),hair);hr.position.y=-0.82;g.add(hr);
    for(const s of [-1,1]){const arm=new THREE.Mesh(new THREE.CylinderGeometry(0.07,0.07,1.2),tunic);arm.position.set(0,-0.6,s*0.3);arm.rotation.x=s*0.25;g.add(arm);}
    const canopy=new THREE.Mesh(new THREE.SphereGeometry(1.8,12,6,0,Math.PI*2,0,Math.PI*0.32),cloth);canopy.scale.set(0.9,0.5,1.4);g.add(canopy);
    g.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,1.4),pole)));
    g.scale.setScalar(3);g.traverse(o=>{if(o.isMesh)o.castShadow=true;o.userData.noFingerprint=true;});g.visible=false;scene.add(g);return g;})();
  ctx.glider=glider;let flight=null;
  const launch=(ti)=>{const T=PL.towers[ti!=null?ti:Math.floor(R()*PL.towers.length)],a=R()*Math.PI*2;
    flight={T,t:0,from:new THREE.Vector3(T.x,groundH(T.x,T.z)+104,T.z),dir:new THREE.Vector3(Math.cos(a),0,Math.sin(a))};glider.visible=true;return flight;};
  ctx.launchGlider=launch;
  let nextFlight=performance.now()/1000+20;

  let last=performance.now();
  animHooks.push(now=>{const t=now/1000,dt=Math.min(0.05,(now-last)/1000);last=now;
    const q=new THREE.Quaternion(),eye=new THREE.Vector3(),fwd=new THREE.Vector3();
    for(const s of stalkers){const a=s.ph+t*s.sp,x=s.cx+Math.cos(a)*s.rad,z=s.cz+Math.sin(a)*s.rad,y=groundH(x,z);
      s.g.position.set(x,y,z);s.g.rotation.y=-(a+(s.sp>0?Math.PI/2:-Math.PI/2));
      // a tripod gait: three legs swing forward lifted while the other three push back on the ground
      const speed=Math.abs(s.sp)*s.rad,ph=t*speed*0.9;
      s.legs.forEach((l,i)=>{const p=ph+(i%2)*Math.PI,lift=Math.max(0,Math.sin(p));l.rotation.y=l.userData.yaw+Math.cos(p)*0.22;l.rotation.z=lift*0.28;});
      s.body.position.y=s.y0+Math.abs(Math.sin(ph))*0.25;
      s.body.rotation.z=Math.sin(ph)*0.03;
      s.head.rotation.y=Math.sin(t*0.7+s.ph)*0.8;s.head.rotation.z=-0.12+Math.sin(t*0.45+s.ph)*0.08;
      // the sight line: from the eye, forward and down onto the ground
      s.eye.getWorldPosition(eye);fwd.set(1,0,0).applyQuaternion(s.head.getWorldQuaternion(q));
      const tx=eye.x+fwd.x*60,tz=eye.z+fwd.z*60,target=new THREE.Vector3(tx,groundH(tx,tz)+0.3,tz),d=target.clone().sub(eye),L=d.length();
      s.beam.scale.set(1,L,1);s.beam.position.copy(eye).addScaledVector(d,0.5);s.beam.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());
      s.dot.position.copy(target);s.dot.scale.setScalar(1+Math.sin(t*10+s.ph)*0.3);}
    lineM.opacity=0.55+Math.sin(t*14)*0.15;
    for(const h of horses){if(!h.graze){h.a+=Math.sin(t*0.1+h.ph)*dt*0.3;const nx=h.x+Math.cos(h.a)*dt*1.2,nz=h.z+Math.sin(h.a)*dt*1.2;if(!wet(nx,nz)){h.x=nx;h.z=nz;}else h.a+=Math.PI;}
      h.g.position.set(h.x,groundH(h.x,h.z),h.z);h.g.rotation.y=-h.a;const down=h.graze?(0.6+Math.sin(t*0.3+h.ph)*0.4):0;h.g.userData.neck.rotation.z=-0.6-down*0.9;h.g.userData.head.position.set(1.7+down*0.2,2.7-down*1.8,0);
      if(Math.sin(t*0.05+h.ph)>0.97)h.graze=!h.graze;}
    for(const b of birds){const a=b.ph+t*b.w;b.m.position.set(b.cx+Math.cos(a)*b.r,b.cy+Math.sin(t*0.4+b.ph)*4,b.cz+Math.sin(a)*b.r);b.m.rotation.y=-a-(b.w>0?0:Math.PI);b.m.scale.y=1+0.4*Math.sin(t*3+b.ph);}
    // the glider: a launch every couple of minutes; it drifts down and away and lands
    if(!flight&&t>nextFlight&&nightF()<0.4){launch();}
    if(flight){flight.t+=dt;const f=flight,u=f.t,p=f.from.clone().addScaledVector(f.dir,u*11);p.y=f.from.y-u*2.6;
      const gy=groundH(p.x,p.z)+1;glider.position.copy(p);glider.rotation.y=-Math.atan2(f.dir.z,f.dir.x);glider.rotation.z=Math.sin(u*0.7)*0.15;
      if(p.y<gy+2){glider.visible=false;flight=null;nextFlight=t+90+R()*90;}}
  });
  ctx.details=Object.assign(ctx.details||{},{stalkers:stalkers.length,horses:horses.length});
}
