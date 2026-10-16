// ---------- what happens on the peninsula ----------
// Every minute or two something happens, and the Events button fires any of them now (src/core/happenings.js).
//
//   coho     the MV Coho leaves Port Angeles for Victoria across the Strait, as it has since 1959: out past the end
//            of Ediz Hook and north until it is a speck
//   storm    a storm off the Pacific: the cloud comes down, the rain comes in from the west, the coast goes grey,
//            and it clears from the west an hour later
//   elk      Roosevelt elk in the Hoh: a herd of cows and calves out of the trees onto the river flats, the bull
//            behind them
import { createHappenings } from '../core/happenings.js';

export function events(api){
  const {THREE,C,scene,groundH,P}=api;const K=C.olympicEvents||{};
  const R=Math.random;let H=null;const run=fn=>H.run(fn),notice=(...a)=>H.notice(...a);
  const tag=o=>{o.traverse(q=>{q.userData.noFingerprint=true;q.userData.noWire=true;});return o;};
  const M=c=>new THREE.MeshLambertMaterial({color:c});

  // ---- the Coho ----
  function coho(){const [ax,az]=P(K.cohoFrom||[48.1235,-123.4340]),[bx,bz]=P(K.cohoVia||[48.1600,-123.4000]),[cx,cz]=P(K.cohoTo||[48.4300,-123.3900]);
    const ship=new THREE.Group(),L=100;
    const hull=new THREE.Mesh(new THREE.BoxGeometry(18,6,L).translate(0,3,0),M(0x1e3a6a));ship.add(hull);
    const deck=new THREE.Mesh(new THREE.BoxGeometry(16,7,L*0.6).translate(0,9.5,-4),M(0xf2f2ee));ship.add(deck);
    const bridge=new THREE.Mesh(new THREE.BoxGeometry(14,3,8).translate(0,14.5,L*0.15),M(0xf2f2ee));ship.add(bridge);
    const stack=new THREE.Mesh(new THREE.CylinderGeometry(1.8,2,6,10).translate(0,16,-L*0.2),M(0x1e3a6a));ship.add(stack);
    tag(ship);scene.add(ship);let t=0;const path=[[ax,az],[bx,bz],[cx,cz]],seg=[Math.hypot(bx-ax,bz-az),Math.hypot(cx-bx,cz-bz)],SP=K.cohoSpeed||40;
    const at=s=>{const a=s<seg[0]?0:1,u=a?Math.min(1,(s-seg[0])/seg[1]):s/seg[0],[px,pz]=path[a],[qx,qz]=path[a+1];return [px+(qx-px)*u,pz+(qz-pz)*u,Math.atan2(qx-px,qz-pz)];};
    const sub=()=>{const [x,z]=at(t*SP);return [x,6,z];};
    notice('The Coho','the MV Coho sails from Port Angeles for Victoria, ninety minutes across the Strait of Juan de Fuca, as it has every day since 1959.',
      ()=>{const [x,,z]=sub();return [x-260,90,z+340,x,8,z];},sub);
    run((now,dt)=>{t+=dt;const s=t*SP;const [x,z,ry]=at(s);ship.position.set(x,0.5+Math.sin(t*0.8)*0.3,z);ship.rotation.set(Math.sin(t*0.6)*0.01,ry,Math.sin(t*0.5)*0.02);
      if(s>seg[0]+seg[1]){scene.remove(ship);return false;}return true;});}

  // ---- a storm off the Pacific ----
  function storm(){const F=scene.fog;if(!F||F.density===undefined)return;let t=0;const D=80;
    const N=6000,pos=new Float32Array(N*3),g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));
    const rain=new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:0xb8c4cc,transparent:true,opacity:0}));rain.frustumCulled=false;tag(rain);scene.add(rain);
    const seed=new Float32Array(N*3);for(let i=0;i<N*3;i++)seed[i]=R();
    // rain is lines: N/2 drops, each a short slanted segment, in a box round the camera
    notice('A storm','off the Pacific: the cloud comes down onto the ridges, the rain comes in sideways from the west, and the coast goes grey. It clears from the west.',
      ()=>{const [vx,vz]=P(K.stormView||[47.9200,-124.6300]);return [vx,60,vz,vx-4000,40,vz];});
    run((now,dt)=>{t+=dt;const f=t<15?t/15:t<D-15?1:Math.max(0,(D-t)/15);F.density*=1+f*9;F.color.lerp(new THREE.Color(0x8a949a),f*0.8);if(scene.background&&scene.background.isColor)scene.background.lerp(new THREE.Color(0x8a949a),f*0.8);
      const c=api.camera.position;for(let i=0;i<N/2;i++){const x=c.x+(seed[i*3]-0.5)*160,z=c.z+(seed[i*3+1]-0.5)*160,y=c.y+60-((seed[i*3+2]*120+t*40)%120);
        pos.set([x,y,z,x+1.6,y-3,z+0.3],i*6);}
      g.attributes.position.needsUpdate=true;rain.material.opacity=0.5*f;if(t>D){scene.remove(rain);return false;}return true;});}

  // ---- elk in the Hoh ----
  function elk(){const [hx,hz]=P(K.elkAt||[47.8590,-123.9520]),grp=new THREE.Group(),herd=[];const coat=M(0x6a4a30),mane=M(0x3a2618),legs=M(0x2a1c12);
    for(let i=0;i<16;i++){const e=new THREE.Group(),bull=i===0,s=bull?1.25:1;
      e.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.8,0.9,2.0),coat),{}));e.children[0].position.set(0,1.45,0);
      const neck=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.9,0.5),mane);neck.position.set(0,2.0,0.95);neck.rotation.x=-0.5;e.add(neck);
      const head=new THREE.Mesh(new THREE.BoxGeometry(0.35,0.4,0.7),coat);head.position.set(0,2.45,1.35);e.add(head);
      for(const [a,b] of [[-0.3,0.8],[0.3,0.8],[-0.3,-0.8],[0.3,-0.8]]){const l=new THREE.Mesh(new THREE.BoxGeometry(0.15,1.0,0.15),legs);l.position.set(a,0.5,b);e.add(l);}
      if(bull)for(const sd of [-1,1]){const an=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.06,1.4,4),M(0xd8c8a8));an.position.set(sd*0.35,3.1,1.2);an.rotation.set(-0.6,0,sd*0.5);e.add(an);}
      e.scale.setScalar(s);const a=R()*6.28,r=R()*40;e.position.set(hx+Math.cos(a)*r,0,hz+Math.sin(a)*r);e.rotation.y=R()*6.28;grp.add(e);herd.push({e,ph:R()*6});}
    tag(grp);scene.add(grp);let t=0;
    notice('Elk in the Hoh','Roosevelt elk, the largest of the elk, out of the spruce onto the river flats: cows and calves first, the bull behind. They were why the first protection came, in 1909.',
      ()=>[hx+60,groundH(hx+60,hz+40)+12,hz+40,hx,groundH(hx,hz)+2,hz]);
    run((now,dt)=>{t+=dt;for(const q of herd){const e=q.e,a=e.rotation.y;if(Math.sin(t*0.3+q.ph)>0.2){e.position.x+=Math.sin(a)*dt*0.8;e.position.z+=Math.cos(a)*dt*0.8;}else e.rotation.y+=Math.sin(t+q.ph)*dt*0.3;
      e.position.y=groundH(e.position.x,e.position.z);}if(t>120){scene.remove(grp);return false;}return true;});}

  H=createHappenings(api,{events:{coho:['The Coho',coho],storm:['A storm',storm],elk:['Elk in the Hoh',elk]},order:['coho','elk','storm'],first:K.first||40000,every:K.every||[70000,130000]});
}
