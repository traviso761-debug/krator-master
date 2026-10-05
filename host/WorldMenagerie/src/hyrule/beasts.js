// The Divine Beasts, Calamity Ganon, and Death Mountain's fire. Fan work: Breath of the Wild belongs to Nintendo;
// every shape here is this project's own, built from simple solids and nothing from the game.
//
// Each Divine Beast is a giant stone machine with glowing lines, and each one moves:
//   Vah Ruta      an elephant, standing in the East Reservoir above Zora's Domain, swinging its trunk and spraying
//   Vah Rudania   a salamander, clinging to Death Mountain and crawling round its slope
//   Vah Medoh     a bird, circling high over Rito Village
//   Vah Naboris   a camel, walking back and forth across the Gerudo Desert
// Calamity Ganon is a coil of crimson malice turning round the castle's Sanctum, an eye in it. Death Mountain has a
// lava lake in its crater, lava running down its flanks, and smoke going up.
// The beasts' glowing lines are orange while Ganon holds them; the Divine Beasts event turns them blue (events.js).

export function beasts(api){
  const {THREE,ctx,group,gh,animHooks,scene}=api;
  const PL=ctx.plan||{sites:{}},S=PL.sites;
  const nightF=()=>api.nightF&&api.hour?api.nightF(api.hour()):0;
  const mat=(c,o)=>new THREE.MeshLambertMaterial(Object.assign({color:c,flatShading:true},o||{}));
  const stone=mat(0x9a948a),stone2=mat(0x7a756c),dark=mat(0x4a4642);
  const lineM=()=>{const m=new THREE.MeshLambertMaterial({color:0xff9a3a,emissive:0xff7a1a,emissiveIntensity:0.9});(ctx.beastGlows=ctx.beastGlows||[]).push(m);return m;};
  const mesh=(g,m,x,y,z)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);return o;};
  const ball=(r,m,x,y,z,sx,sy,sz)=>{const o=mesh(new THREE.IcosahedronGeometry(r,1),m,x,y,z);o.scale.set(sx||1,sy||1,sz||1);return o;};
  const UP=new THREE.Vector3(0,1,0);
  const limb=(a,b,r0,r1,m,seg)=>{const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),d=B.clone().sub(A),L=d.length();
    const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r0,L,seg||8),m);o.position.copy(A).addScaledVector(d,0.5);o.quaternion.setFromUnitVectors(UP,d.normalize());return o;};
  const ring=(r,t,m,x,y,z,rx,ry)=>{const o=mesh(new THREE.TorusGeometry(r,t,5,24),m,x,y,z);o.rotation.set(rx||0,ry||0,0);return o;};
  const shadows=g=>{g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});return g;};
  const hz=v=>{const t=Math.sin(v*12.9898)*43758.5453;return t-Math.floor(t);};

  return {
  // ================================================================ Vah Ruta, the elephant
  ruta(L,x,z){
    const R_=S.ruta,lake=(PL.lakes||[]).find(l=>/Reservoir/.test(l.name)),wl=lake?lake.level:gh(R_.x,R_.z),g=new THREE.Group(),glow=lineM();
    g.position.set(R_.x,wl,R_.z);g.scale.setScalar(2);   // the size the game gives them: they tower over the land
    // drawn facing +x: legs in the water, the body, the head with its ears, and the trunk in three joints
    g.add(ball(1,stone,0,38,0,30,20,18));
    for(const [a,b] of [[18,10],[18,-10],[-18,10],[-18,-10]])g.add(limb([a,-6,b],[a,24,b],5.5,5,stone2,8));
    g.add(ball(1,stone2,0,58,0,16,7,13));                                   // the howdah on its back
    g.add(ball(1,stone,30,46,0,11,11,10));
    for(const s of [-1,1]){const e=ball(1,stone2,26,48,s*13,2,12,10);e.rotation.y=s*0.4;g.add(e);g.add(limb([36,40,s*5],[44,34,s*9],1.6,0.6,mat(0xe8e2d4),6));}
    for(const s of [-1,1])g.add(ring(15,0.6,glow,0,38,s*16.5,0,0));
    g.add(ring(9,0.5,glow,31,46,0,0,Math.PI/2));
    const trunk=new THREE.Group();trunk.position.set(39,42,0);g.add(trunk);
    let parent=trunk;const segs=[];
    for(let k=0;k<4;k++){const j=new THREE.Group();if(k)j.position.y=-7;parent.add(j);j.add(limb([0,0,0],[0,-7,0],3.4-k*0.6,3-k*0.6,stone,8));segs.push(j);parent=j;}
    const tip=new THREE.Group();tip.position.y=-7;parent.add(tip);
    // the spray: a fountain of drops from the trunk's tip, arcing out over the reservoir
    const N=400,pos=new Float32Array(N*3),vel=new Float32Array(N*3),life=new Float32Array(N);
    const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pos,3));
    const spray=new THREE.Points(pg,new THREE.PointsMaterial({color:0xdff4ff,size:1.6,transparent:true,opacity:0.8,depthWrite:false}));spray.frustumCulled=false;spray.userData.noFingerprint=true;scene.add(spray);
    shadows(g);const grp=group(L,[g]);
    const v=new THREE.Vector3(),d=new THREE.Vector3();let next=0;
    animHooks.push(now=>{const t=now/1000;
      segs.forEach((j,k)=>{j.rotation.z=0.35+Math.sin(t*0.6+k*0.5)*0.25+(k===0?-1.3:0.25);});
      g.rotation.y=Math.sin(t*0.05)*0.4;
      tip.getWorldPosition(v);d.set(1,0.6,0).applyAxisAngle(UP,g.rotation.y);
      for(let i=0;i<N;i++){if(life[i]<=0){if(t<next)continue;next=t+0.004;life[i]=2.4;pos[i*3]=v.x;pos[i*3+1]=v.y;pos[i*3+2]=v.z;
          vel[i*3]=d.x*40+(Math.random()-0.5)*7;vel[i*3+1]=30+Math.random()*10;vel[i*3+2]=d.z*40+(Math.random()-0.5)*7;}
        life[i]-=0.016;vel[i*3+1]-=9.8*0.016;pos[i*3]+=vel[i*3]*0.016;pos[i*3+1]+=vel[i*3+1]*0.016;pos[i*3+2]+=vel[i*3+2]*0.016;if(pos[i*3+1]<wl)life[i]=0;}
      pg.attributes.position.needsUpdate=true;});
    return grp;
  },

  // ================================================================ Vah Rudania, the salamander
  rudania(L,x,z){
    const D=S.deathmountain,g=new THREE.Group(),glow=lineM(),legs=[];
    g.scale.setScalar(2);
    g.add(ball(1,stone,0,6,0,30,7,13),ball(1,stone2,26,7,0,11,6,9),ball(1,stone,-30,5,0,14,5,8));
    const tail=limb([-40,5,0],[-80,3,0],5,1.2,stone,8);g.add(tail);
    for(const [a,b] of [[16,1],[16,-1],[-18,1],[-18,-1]]){const l=new THREE.Group();l.position.set(a,4,b*12);l.add(limb([0,0,0],[6,-2,b*16],3,2.4,stone2,6),limb([6,-2,b*16],[10,-8,b*20],2.4,2,stone2,6));g.add(l);legs.push(l);}
    for(let k=0;k<5;k++)g.add(ring(5+k*0.4,0.5,glow,-20+k*10,12,0,Math.PI/2,0));
    g.add(ball(1.8,glow,33,9,4),ball(1.8,glow,33,9,-4));
    shadows(g);const grp=group(L,[g]);
    // round the mountain on its upper slope, nose first, keeping to the ground
    const r=760,cy=D.y;
    animHooks.push(now=>{const t=now/1000,a=t*0.006+1.2,px=D.x+Math.cos(a)*r,pz=D.z+Math.sin(a)*r*0.85,py=gh(px,pz)+2;
      g.position.set(px,py,pz);g.rotation.y=-(a+Math.PI/2);
      const up=gh(D.x+Math.cos(a)*(r-30),D.z+Math.sin(a)*(r-30)*0.85)-gh(D.x+Math.cos(a)*(r+30),D.z+Math.sin(a)*(r+30)*0.85);g.rotation.z=0;g.rotation.x=Math.atan2(up,60)*0.6;
      legs.forEach((l,k)=>{l.rotation.y=Math.sin(t*1.4+(k%2?Math.PI:0)+(k>1?Math.PI/2:0))*0.35;});});
    return grp;
  },

  // ================================================================ Vah Medoh, the bird
  medoh(L,x,z){
    const R_=S.rito,g=new THREE.Group(),glow=lineM(),wings=[];
    g.scale.setScalar(2.2);
    g.add(ball(1,stone,0,0,0,26,9,10),ball(1,stone2,26,4,0,8,6,6),limb([30,4,0],[40,0,0],2,0.4,mat(0xe8c060),6),limb([-24,0,0],[-44,4,0],7,1,stone,6));
    g.add(ball(1,dark,0,8,0,16,4,9));                                       // the deck on its back
    for(const s of [-1,1]){const w=new THREE.Group();w.position.set(4,2,s*8);
      const pl=new THREE.Mesh(new THREE.BoxGeometry(34,2,80).translate(0,0,s*40),stone);w.add(pl);
      for(let k=0;k<4;k++){const f=new THREE.Mesh(new THREE.BoxGeometry(10,1.4,24).translate(0,0,s*12),stone2);f.position.set(-12+k*7,0,s*(78+k*2));f.rotation.y=s*(0.2+k*0.12);w.add(f);}
      w.add(new THREE.Mesh(new THREE.BoxGeometry(1,1,74).translate(0,1.2,s*38),glow));g.add(w);wings.push([w,s]);}
    g.add(ball(2,glow,30,6,3),ball(2,glow,30,6,-3));
    shadows(g);const grp=group(L,[g]);
    const alt=Math.max(R_.y,500)+620;
    animHooks.push(now=>{const t=now/1000,a=t*0.035;g.position.set(R_.x+Math.cos(a)*700,alt+Math.sin(t*0.3)*20,R_.z+Math.sin(a)*700);
      g.rotation.set(0,-(a+Math.PI/2),0);g.rotateX(-0.25);
      for(const [w,s] of wings)w.rotation.x=s*Math.sin(t*0.8)*0.12;});
    return grp;
  },

  // ================================================================ Vah Naboris, the camel
  naboris(L,x,z){
    const N=S.naboris,g=new THREE.Group(),glow=lineM(),legs=[];
    g.scale.setScalar(2);
    g.add(ball(1,stone,0,62,0,34,12,14),ball(1,stone2,-10,76,0,10,8,9),ball(1,stone2,14,76,0,10,8,9));
    g.add(limb([30,64,0],[46,90,0],5,3.5,stone,8),ball(1,stone,50,94,0,9,6,6));
    for(const s of [-1,1])g.add(ball(1.6,glow,56,96,s*3.4));
    for(const [a,b] of [[24,8],[24,-8],[-24,8],[-24,-8]]){const l=new THREE.Group();l.position.set(a,58,b);
      l.add(limb([0,0,0],[0,-30,0],3.4,2.6,stone2,8),limb([0,-30,0],[0,-58,0],2.6,3.4,stone2,8),ball(4,stone,0,-58,0,1.3,0.5,1.3));
      l.add(limb([1.6,-4,0],[1.6,-52,0],0.4,0.4,glow,4));g.add(l);legs.push(l);}
    g.add(ring(12,0.6,glow,0,62,14.5,0,0),ring(12,0.6,glow,0,62,-14.5,0,0));
    shadows(g);const grp=group(L,[g]);
    // walking back and forth along the desert, slowly, legs swinging in pairs
    animHooks.push(now=>{const t=now/1000,u=Math.sin(t*0.004),px=N.x+u*900,pz=N.z+Math.sin(t*0.003)*260,dir=Math.cos(t*0.004)>=0?0:Math.PI;
      g.position.set(px,gh(px,pz),pz);g.rotation.y=dir;
      legs.forEach((l,k)=>{l.rotation.z=Math.sin(t*0.9+(k===0||k===3?0:Math.PI))*0.22;});});
    return grp;
  },

  // ================================================================ Calamity Ganon, round the castle
  // Rings of crimson malice turning round the Sanctum's tower, a dark smoke of it rising and swirling, and an eye
  ganon(L,x,z){
    const C=S.castle,base=gh(C.x,C.z)+300,g=new THREE.Group(),rings=[];g.position.set(C.x+5*1.55,base,C.z-12*1.55);   // up the Sanctum's tower (the castle is built at 1.55 times, landmarks.js)
    const mk=(c,o)=>new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:o,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
    for(let k=0;k<5;k++){const r=new THREE.Mesh(new THREE.TorusGeometry(95+k*24,6-k*0.7,6,64),mk(k%2?0xc0184a:0x7a0a3a,0.42));r.rotation.x=Math.PI/2+(k-2)*0.12;g.add(r);rings.push(r);}
    const eye=new THREE.Mesh(new THREE.SphereGeometry(7,16,10),new THREE.MeshBasicMaterial({color:0xffb040}));eye.position.set(0,40,0);g.add(eye);
    const pupil=new THREE.Mesh(new THREE.SphereGeometry(3,10,8),new THREE.MeshBasicMaterial({color:0x200008}));pupil.position.set(4.5,40,0);g.add(pupil);
    // the smoke of it: points spiralling up and round
    const N=900,pos=new Float32Array(N*3),ph=new Float32Array(N);for(let i=0;i<N;i++)ph[i]=Math.random();
    const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pos,3));
    const smoke=new THREE.Points(pg,new THREE.PointsMaterial({color:0xd0204a,size:6,transparent:true,opacity:0.55,depthWrite:false,blending:THREE.AdditiveBlending}));smoke.frustumCulled=false;g.add(smoke);
    g.traverse(o=>{o.userData.noFingerprint=true;o.userData.noWire=true;});scene.add(g);ctx.ganon=g;
    animHooks.push(now=>{const t=now/1000;rings.forEach((r,k)=>{r.rotation.z=t*(0.12+k*0.03)*(k%2?-1:1);r.scale.setScalar(1+Math.sin(t*0.5+k)*0.04);});
      for(let i=0;i<N;i++){const u=(ph[i]+t*0.02)%1,a=u*Math.PI*12+i,r=60+u*90+Math.sin(i)*12;pos[i*3]=Math.cos(a)*r;pos[i*3+1]=-40+u*160;pos[i*3+2]=Math.sin(a)*r;}
      pg.attributes.position.needsUpdate=true;eye.scale.setScalar(1+Math.sin(t*2)*0.1);pupil.position.z=Math.sin(t*0.4)*2.5;});
    return group(L,[]);
  },

  // ================================================================ Death Mountain's fire
  // A lava lake in the crater, lava running down the flanks, smoke going up
  volcano(L,x,z){
    const D=S.deathmountain,parts=[],lavaM=new THREE.MeshBasicMaterial({color:0xff5a1a}),flowM=new THREE.MeshBasicMaterial({color:0xe8401a});
    let cr=Infinity;for(let k=0;k<24;k++){const a=k/24*Math.PI*2;cr=Math.min(cr,gh(D.x+Math.cos(a)*120,D.z+Math.sin(a)*120));}
    const lake=mesh(new THREE.CircleGeometry(200,28).rotateX(-Math.PI/2),lavaM,D.x,Math.min(cr,gh(D.x,D.z)+60),D.z);parts.push(lake);
    // the flows: each runs downhill from the rim, cell by cell, as lava would
    for(let f=0;f<7;f++){let a=f/7*Math.PI*2+0.3,px=D.x+Math.cos(a)*240,pz=D.z+Math.sin(a)*240;const pts=[];
      for(let k=0;k<60;k++){pts.push(new THREE.Vector3(px,gh(px,pz)+1.2,pz));let best=null,by=gh(px,pz);
        for(let b=0;b<12;b++){const aa=b/12*Math.PI*2,qx=px+Math.cos(aa)*24,qz=pz+Math.sin(aa)*24,qy=gh(qx,qz);if(qy<by){by=qy;best=[qx,qz];}}
        if(!best||by<300)break;px=best[0];pz=best[1];}
      if(pts.length>3){const tube=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),pts.length*2,6,5),flowM);tube.scale.y=1;parts.push(tube);}}
    const grp=group(L,parts);
    // smoke from the crater, rising and leaning with the wind
    const tex=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');const gr=g.createRadialGradient(32,32,0,32,32,32);
      gr.addColorStop(0,'rgba(90,80,80,0.75)');gr.addColorStop(1,'rgba(90,80,80,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);})();
    const puffs=[];for(let k=0;k<40;k++){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false,opacity:0.6}));sp.userData.noFingerprint=true;sp.userData.noWire=true;scene.add(sp);puffs.push({sp,ph:k/40});}
    const top=gh(D.x,D.z)+80;
    animHooks.push(now=>{const t=now/1000;for(const p of puffs){const u=(p.ph+t*0.012)%1;p.sp.position.set(D.x+u*500+Math.sin(p.ph*20)*60,top+u*900,D.z-u*300+Math.cos(p.ph*17)*60);
      p.sp.scale.setScalar(120+u*500);p.sp.material.opacity=0.6*(1-u);}
      lavaM.color.setHSL(0.05,1,0.5+Math.sin(t*1.3)*0.05);});
    return grp;
  },
  };
}
