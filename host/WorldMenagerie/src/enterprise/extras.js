// ---------- Galaxy class: the rest of it ----------
// Fan work. Star Trek belongs to Paramount. (The starbases are in starbases.js.)
//
//   Hull breaches  a hit on the hull with the shields down can hole it: air vents from the hole as a plume of
//                  freezing crystals and a fire burns behind it, both dying away over half a minute.
//   Escape pods    "Abandon ship": the pods come out of their hatches on the saucer, in rings, and drift off.
//   Self-destruct  a ten-second countdown (pressed again, cancelled), then the warp core lets go: a flash, a ring of
//                  shock running out across the plane of the ship, wreckage; and, a little later, because this is a
//                  page, the ship again.
//   A grand tour   every place on the chart in turn, the camera on the flyby, a while at each.
import {SAUCER} from './dims.js';
import {saucerTop} from './hull.js';
import {PLACES} from './places.js';

export function extras(W){
  const {THREE,ROOT,G,SAU,SYS,animHooks}=W,F=W.fx,S=W.flight,V=()=>new THREE.Vector3();

  // the tour lets go when the helm is taken or the ship leaves the helm, along with anything else flying her
  {const prev=W.cancelAuto;W.cancelAuto=quiet=>{if(tour.on)stopTour();prev&&prev(quiet);};}

  // ================= hull breaches =================
  // A plume of venting air (white crystals pouring out along the hull's normal and spreading as they go) and a
  // flickering fire behind the hole, in the saucer's own frame so they go where the saucer goes.
  W.breach=pW=>{
    const p=SAU.worldToLocal(pW.clone()),n=p.y>0?V().set(p.x/400,1,p.z/400).normalize():V().set(p.x/400,-1,p.z/400).normalize();
    const N=220,pos=new Float32Array(N*3),seed=[];for(let i=0;i<N;i++)seed.push([Math.random(),Math.random()-0.5,Math.random()-0.5]);
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
    const mat=new THREE.PointsMaterial({map:W.glowTex,color:0xdfeaff,size:9,sizeAttenuation:true,transparent:true,opacity:0.7,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false});
    const pts=new THREE.Points(geo,mat);pts.frustumCulled=false;pts.userData.noWire=true;SAU.add(pts);
    const fire=F.sprite(0xff6a20,30,0.9);fire.position.copy(p);SAU.add(fire);
    const t1=V().set(-n.y,n.x,0).normalize(),t2=n.clone().cross(t1);const t0=F.T();
    F.run(t=>{const u=t-t0,life=Math.max(0,1-u/30);
      for(let i=0;i<N;i++){const s=seed[i],f=(s[0]+u*0.6)%1,d=f*140;
        const x=p.x+n.x*d+(t1.x*s[1]+t2.x*s[2])*d*0.6,y=p.y+n.y*d+(t1.y*s[1]+t2.y*s[2])*d*0.6,z=p.z+n.z*d+(t1.z*s[1]+t2.z*s[2])*d*0.6;pos.set([x,y,z],i*3);}
      geo.attributes.position.needsUpdate=true;mat.opacity=0.7*life;
      fire.material.opacity=life*(0.6+0.4*Math.sin(t*23)*Math.sin(t*7.1));fire.scale.setScalar(26+8*Math.sin(t*17));
      if(u>30){SAU.remove(pts,fire);geo.dispose();mat.dispose();return false;}});
  };

  // ================= escape pods =================
  function abandonShip(){
    F.note('All hands, abandon ship.');F.sound('klaxon');
    const pm=new THREE.MeshStandardMaterial({color:0xa89270,metalness:0.3,roughness:0.5,envMap:W.env}),geo=new THREE.CylinderGeometry(2.2,2.6,3.4,10);
    const A=SAUCER.a,B=SAUCER.b,pods=[];
    for(let i=0;i<36;i++){
      const e=[0.57,0.82,0.935][i%3],th=(i*2.39996)%(Math.PI*2),x=e*A*Math.cos(th),z=e*B*Math.sin(th);
      if(x<-100&&Math.abs(z)<160)continue;
      const m=new THREE.Mesh(geo,pm);m.position.set(x,saucerTop(x,z)+0.5,z);m.userData.noWire=true;
      const g=F.sprite(0xffc890,10,0.9);g.position.y=-2.5;m.add(g);
      m.userData.v=V().set(x/A*0.6,1,z/B*0.6).normalize().multiplyScalar(14+Math.random()*10);m.userData.w=V().set(Math.random(),Math.random(),Math.random());
      m.userData.go=0.25*i/3+Math.random()*0.3;SAU.add(m);pods.push(m);}
    const t0=F.T();
    F.run((t,dt)=>{const u=t-t0;
      for(const m of pods){if(u<m.userData.go)continue;const k=Math.min(1,(u-m.userData.go)*2);m.position.addScaledVector(m.userData.v,dt*k);
        m.rotation.x+=m.userData.w.x*dt*0.3;m.rotation.z+=m.userData.w.z*dt*0.3;m.children[0].material.opacity=0.9*Math.max(0,1-(u-m.userData.go)/6);}
      if(u>60){for(const m of pods)SAU.remove(m);pm.dispose();geo.dispose();return false;}});
  }

  // ================= self-destruct =================
  const sd={on:false,left:0,id:null};
  function selfDestruct(){
    if(sd.on){sd.on=false;clearInterval(sd.id);F.note('Self-destruct cancelled.');F.sync();return;}
    sd.on=true;sd.left=10;F.note('Self-destruct in ten seconds.');F.sound('klaxon');
    sd.id=setInterval(()=>{if(!sd.on)return;sd.left--;F.sound(sd.left<=3?'hit':'klaxon');if(sd.left<=0){clearInterval(sd.id);sd.on=false;breach();}},1000);F.sync();
  }
  function breach(){
    const c=F.shipCentre(),q=ROOT.getWorldQuaternion(new THREE.Quaternion());
    F.sound('boom');setTimeout(()=>F.sound('boom'),200);setTimeout(()=>F.sound('boom'),600);
    F.flash(c,0xffffff,4000,1.2);F.flash(c,0xbfe0ff,9000,2.6);F.flash(c,0xff8040,5000,3.5);
    F.debris(c,0xa8adb2,140,420);
    // the shock: a ring out across the ship's own plane, thin and bright at its edge
    const mat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,toneMapped:false,uniforms:{uA:{value:1}},
      vertexShader:`varying vec2 vU;void main(){vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
      fragmentShader:`uniform float uA;varying vec2 vU;void main(){float r=length(vU-0.5)*2.;float k=smoothstep(0.7,0.97,r)*(1.-smoothstep(0.97,1.,r));gl_FragColor=vec4(vec3(0.75,0.88,1.)*k*uA,k*uA);}`});
    const ring=new THREE.Mesh(new THREE.PlaneGeometry(2,2),mat);ring.userData.noWire=true;ring.position.copy(F.toFX(c));
    ring.quaternion.copy(q).multiply(new THREE.Quaternion().setFromAxisAngle(V().set(1,0,0),-Math.PI/2));W.FX.add(ring);
    ROOT.visible=false;S.shake+=60;const t0=F.T();
    F.run(t=>{const u=t-t0;ring.scale.setScalar(200+u*9000);mat.uniforms.uA.value=Math.max(0,1-u/3.2);
      if(u>3.3&&ring.parent){W.FX.remove(ring);mat.dispose();}
      if(u>10){ROOT.visible=true;F.flash(c,0xcfe4ff,1300,0.9);F.sound('warp');F.note('And the ship again: this is only a page.');F.sync();return false;}});
  }

  // ================= a grand tour =================
  const tour={on:false,list:[],timer:null};
  function startTour(){
    if(tour.on){stopTour();return;}
    tour.on=true;const here=W.herePlace().P.id;tour.list=PLACES.filter(p=>p.id!==here);
    if(!S.on)W.startFlight();S.cam='flyby';S.fb=null;W.course.setWarp(9);F.note('A grand tour: every place on the chart.');next();
  }
  function next(){if(!tour.on)return;const P=tour.list.shift();if(!P){stopTour();F.note('That is the tour.');return;}W.course.set(P);}
  function stopTour(){tour.on=false;clearTimeout(tour.timer);if(W.course)W.course.clear();}
  W.onArrive=()=>{if(!tour.on)return;S.cam='flyby';S.fb=null;clearTimeout(tour.timer);
    tour.timer=setTimeout(next,16000);};

  const hud=()=>[sd.on?'SELF-DESTRUCT IN '+sd.left:'',tour.on?'grand tour':''].filter(Boolean).join(' · ');
  return {hud,act:{pods:abandonShip,destruct:selfDestruct,tour:startTour},
    buttons:[['Abandon ship',abandonShip],['Self-destruct',selfDestruct],['Grand tour',startTour]],
    state:()=>({sd:sd.on,tour:tour.on})};
}
