// ---------- what happens at Shiganshina ----------
// Every minute or two something happens, and the Events button fires any of them now (src/core/happenings.js).
//
//   colossal  the Colossal Titan: lightning out of a clear sky outside the outer gate, a wall of steam, and over the
//             fifty-metre wall the skinless head, looking in; the kick, and the gate's doors are gone; the Titans on the
//             plains turn for the hole. (The doors are back when it is over.)
//   expedition  the Survey Corps comes home: riders in green cloaks in through the outer gate, along the main street,
//             through the inner gate, the town lining the way
//   odm       soldiers on their vertical manoeuvring gear: the anchors into the walls and the eaves, the swing, the gas
import { createHappenings } from '../core/happenings.js';

export function events(api){
  const {THREE,C,scene,groundH,OSM}=api;const S=OSM.shiganshina||{};const R=Math.random;
  let H=null;const run=fn=>H.run(fn),notice=(...a)=>H.notice(...a);
  const tag=o=>{o.traverse(q=>{q.userData.noFingerprint=true;q.userData.noWire=true;});return o;};
  const DR=S.distR||900,WH=S.wallH||50;
  // ---- steam: soft white puffs ----
  const SM=new THREE.MeshLambertMaterial({color:0xf2f2f0,transparent:true,opacity:0.6,depthWrite:false}),puffs=[];
  for(let i=0;i<120;i++){const m=tag(new THREE.Mesh(new THREE.SphereGeometry(1,10,8),SM));m.visible=false;scene.add(m);puffs.push({m,t:0,v:[0,0,0],s:1});}
  let pi=0;const puff=(x,y,z,s,v)=>{const p=puffs[pi++%puffs.length];p.m.visible=true;p.t=0;p.s=s;p.v=v;p.m.position.set(x,y,z);p.m.scale.setScalar(s);};
  api.animHooks.push(()=>{for(const p of puffs)if(p.m.visible){p.t+=0.016;p.m.position.x+=p.v[0]*0.016;p.m.position.y+=p.v[1]*0.016;p.m.position.z+=p.v[2]*0.016;p.m.scale.setScalar(p.s*(1+p.t*0.6));if(p.t>8)p.m.visible=false;}});
  // ---- the Colossal Titan ----
  function colossal(){if(!api.makeTitan)return;const gz=DR+28,ct=tag(api.makeTitan(60,{head:0.85}));
    // skinless: the muscle red, the bands of white tendon
    ct.traverse(o=>{if(o.isMesh&&o.material&&o.material.color&&o.material.color.r>0.7)o.material=new THREE.MeshLambertMaterial({color:0xa83a2e,emissive:0x2a0806});});
    ct.position.set(0,-60,gz+16);ct.rotation.y=Math.PI/2;scene.add(ct);
    const bolt=tag(new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.2,160,6),new THREE.MeshBasicMaterial({color:0xfff6d0})));bolt.position.set(0,80,gz+30);bolt.visible=false;scene.add(bolt);
    const doors=api.WALLS&&api.WALLS.doors;let t=0,kicked=false;const debris=[];
    notice('The Colossal Titan','lightning out of a clear sky at the outer gate, steam, and over the fifty-metre wall a head, skinless, looking in. Then the kick.',
      ()=>[0,24,DR-260,0,WH+10,DR]);
    run((now,dt)=>{t+=dt;bolt.visible=t<0.6||(t>1&&t<1.3);
      if(t>0.5&&t<12&&R()<0.8)puff((R()-0.5)*80,R()*60,gz+20+(R()-0.5)*30,6+R()*8,[(R()-0.5)*4,3+R()*4,(R()-0.5)*4]);
      const rise=Math.min(1,Math.max(0,(t-1)/6));ct.position.y=-60+rise*(60+groundH(0,gz+16)-14);   // up to its full height, the head over the wall
      if(t>16&&!kicked){kicked=true;if(doors){doors.visible=false;for(let i=0;i<40;i++){const m=tag(new THREE.Mesh(new THREE.BoxGeometry(1+R()*3,1+R()*3,0.8),doors.material));m.position.set((R()-0.5)*24,2+R()*28,DR+2);scene.add(m);debris.push({m,v:[(R()-0.5)*20,6+R()*14,-(18+R()*30)]});}}
        for(const T of api.TITANS||[]){T.leader=true;T.head=Math.atan2(DR+40-T.z,-T.x);}}
      for(const d of debris){d.v[1]-=9.8*dt;d.m.position.x+=d.v[0]*dt;d.m.position.y=Math.max(groundH(d.m.position.x,d.m.position.z)+0.4,d.m.position.y+d.v[1]*dt);d.m.position.z+=d.v[2]*dt;d.m.rotation.x+=dt*3;}
      if(t>22){ct.position.y-=dt*40;if(R()<0.6)puff((R()-0.5)*60,R()*40,gz+20,8,[0,5,0]);}   // and gone, in its steam
      if(t>80){scene.remove(ct,bolt);for(const d of debris)scene.remove(d.m);if(doors)doors.visible=true;for(const T of api.TITANS||[])T.leader=false;return false;}return true;});}
  // ---- the Survey Corps comes home ----
  function expedition(){const N=24,riders=[];const cloak=new THREE.MeshLambertMaterial({color:0x2a5a3a}),horse=new THREE.MeshLambertMaterial({color:0x5a3a24}),face=new THREE.MeshLambertMaterial({color:0xe0b090});
    for(let i=0;i<N;i++){const g=new THREE.Group();const b=new THREE.Mesh(new THREE.BoxGeometry(2.2,1.1,0.8),horse);b.position.y=1.5;g.add(b);const n=new THREE.Mesh(new THREE.BoxGeometry(0.5,1.2,0.5),horse);n.position.set(1.2,2.1,0);n.rotation.z=-0.5;g.add(n);
      for(const [lx,lz] of [[-0.8,-0.3],[-0.8,0.3],[0.8,-0.3],[0.8,0.3]]){const l=new THREE.Mesh(new THREE.BoxGeometry(0.2,1.0,0.2),horse);l.position.set(lx,0.5,lz);g.add(l);}
      const r=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.9,0.6),cloak);r.position.set(-0.1,2.5,0);g.add(r);const h=new THREE.Mesh(new THREE.SphereGeometry(0.16,8,6),face);h.position.set(0,3.1,0);g.add(h);
      tag(g);g.traverse(o=>o.castShadow=true);scene.add(g);riders.push({g,off:i*5.5,lane:(i%2?1:-1)*1.6});}
    let t=0;notice('The Survey Corps returns','in through the outer gate from beyond the walls, fewer than went out, along the main street to the inner gate; the town lines the way.',
      ()=>[22,14,DR*0.55,0,3,DR*0.8],()=>{const z=DR+120-t*7;return [0,3,Math.max(-200,z)];});
    run((now,dt)=>{t+=dt;for(const r of riders){const z=DR+160+r.off-t*7;r.g.position.set(r.lane,groundH(r.lane,z),z);r.g.rotation.y=Math.PI/2;r.g.position.y+=Math.abs(Math.sin(t*6+r.off))*0.15;}
      if(t>DR/7+60){for(const r of riders)scene.remove(r.g);return false;}return true;});}
  // ---- ODM gear ----
  function odm(){const N=6,flyers=[],lineM=new THREE.LineBasicMaterial({color:0x2a2a2a});const cloak=new THREE.MeshLambertMaterial({color:0x2a5a3a});
    for(let i=0;i<N;i++){const g=tag(new THREE.Mesh(new THREE.BoxGeometry(0.5,1.6,0.5),cloak));scene.add(g);const geo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]);const line=tag(new THREE.Line(geo,lineM));scene.add(line);
      flyers.push({g,line,a:i/N*Math.PI,r:300+R()*300,ph:R()*6.28,sp:0.25+R()*0.15});}
    let t=0;notice('Vertical manoeuvring','soldiers of the Garrison training on their gear: an anchor into the eaves, the swing, the gas, the next anchor; over the rooftops of the town and up the face of the wall.',
      ()=>[180,70,240,0,30,450]);
    run((now,dt)=>{t+=dt;for(const f of flyers){f.a+=f.sp*dt*0.3;const x=Math.cos(f.a)*f.r,z=Math.sin(f.a)*f.r,y=groundH(x,z)+14+Math.abs(Math.sin(t*1.4+f.ph))*22;
        f.g.position.set(x,y,z);f.g.rotation.z=Math.sin(t*1.4+f.ph)*0.6;
        // the anchor: ahead and above, on a roof or the wall
        const ax=Math.cos(f.a+0.08)*(f.r+20),az=Math.sin(f.a+0.08)*(f.r+20),ay=groundH(ax,az)+12;const p=f.line.geometry.attributes.position;p.setXYZ(0,x,y+0.5,z);p.setXYZ(1,ax,ay,az);p.needsUpdate=true;
        if(R()<0.1)puff(x,y,z,0.6,[0,0.5,0]);}
      if(t>60){for(const f of flyers)scene.remove(f.g,f.line);return false;}return true;});}
  H=createHappenings(api,{events:{colossal:['The Colossal Titan',colossal],expedition:['The Survey Corps returns',expedition],odm:['Vertical manoeuvring',odm]},
    order:['odm','expedition','colossal'],first:(C.shiganshinaEvents||{}).first||40000,every:(C.shiganshinaEvents||{}).every||[70000,120000]});
}
