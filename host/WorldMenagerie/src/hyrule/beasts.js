// The Divine Beasts, Calamity Ganon, and Death Mountain's fire. Fan work: Breath of the Wild belongs to Nintendo;
// every shape here is this project's own, built from simple solids and nothing from the game.
//
// The four Divine Beasts themselves are in divine.js.
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
    // the western lava field: pools of it lying in the hollows
    const LF=(PL.regions||{}).lavafield;if(LF){for(let k=0;k<9;k++){const a=k*2.3,r=hz(k+3)*0.8,px=LF[0][0]+Math.cos(a)*LF[1]*r,pz=LF[0][1]+Math.sin(a)*LF[2]*r;
      parts.push(mesh(new THREE.CircleGeometry(30+hz(k)*40,16).rotateX(-Math.PI/2),lavaM,px,gh(px,pz)+0.8,pz));}}
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
