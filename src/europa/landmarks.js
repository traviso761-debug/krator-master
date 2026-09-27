// The four things on the ice that people built. Original work; the geology is Europa's and the engineering
// is this project's own.
//
// The design rule for all of it: nothing touches the ice. The surface is at about a hundred and ten kelvin
// and everything warm that sits on it melts its own hole and tips over, so every structure here is on legs
// with a gap under it, and the gap is a design feature rather than an accident.
import { mkRng } from '../core/rng.js';

export function landmarks(api){
  const {THREE,ctx,animHooks,scene,nightF,hour,box,group,gh,mergeParts}=api;

  const P=()=>({
    hull:new THREE.MeshPhongMaterial({color:0x9aa4ac,specular:0xdce4ea,shininess:50,flatShading:true}),
    dark:new THREE.MeshPhongMaterial({color:0x4e565d,specular:0x8a949c,shininess:30,flatShading:true}),
    steel:new THREE.MeshLambertMaterial({color:0x6e767d,flatShading:true}),
    gold:new THREE.MeshPhongMaterial({color:0xd8b45a,specular:0xfff0c0,shininess:80,flatShading:true}),
    glass:new THREE.MeshPhongMaterial({color:0x2a3a44,specular:0xcfe4f0,shininess:90,transparent:true,opacity:0.86}),
    warm:new THREE.MeshBasicMaterial({color:0xffca7a}),
    ice:new THREE.MeshLambertMaterial({color:0xc9d6df,flatShading:true}),
  });

  return {

  habitat(L,x,z){
    // ---- the habitat ----
    // Six pressurised drums on legs round a central hub, linked by covered ways, with the whole thing bermed
    // up to the windows in ice for shielding - Jupiter's radiation belt is the hard part of living here, not
    // the cold. The dome over the hub is the one place anybody can see the sky from inside.
    const H=L.height||26, g0=gh(x,z), A=L.turn||0, parts=[], RR=mkRng(1610);
    const m=P();
    const at=(u,v,y)=>[x+u*Math.cos(A)-v*Math.sin(A),y,z+u*Math.sin(A)+v*Math.cos(A)];

    // the hub: a drum with a dome on it
    {
      const hub=new THREE.Mesh(new THREE.CylinderGeometry(26,26,H*0.7,14).translate(0,H*0.35,0),m.hull);
      hub.position.set(x,g0+4,z);parts.push(hub);
      const dome=new THREE.Mesh(new THREE.SphereGeometry(26,16,8,0,Math.PI*2,0,Math.PI/2),m.glass);
      dome.position.set(x,g0+4+H*0.7,z);parts.push(dome);
      for(let k=0;k<14;k++){
        const a=k/14*Math.PI*2;
        const rib=new THREE.Mesh(new THREE.BoxGeometry(0.7,H*0.7,1.4),m.steel);
        rib.position.set(x+Math.cos(a)*26,g0+4+H*0.35,z+Math.sin(a)*26);rib.rotation.y=-a;parts.push(rib);
      }
      // the berm: ice heaped against it, which is the shielding
      for(let k=0;k<20;k++){
        const a=k/20*Math.PI*2;
        const b=new THREE.Mesh(new THREE.BoxGeometry(12,H*0.42,9),m.ice);
        b.position.set(x+Math.cos(a)*32,g0+H*0.21,z+Math.sin(a)*32);b.rotation.set(0,-a,0.1);parts.push(b);
      }
    }
    // the drums: six of them, radial, each on four legs
    for(let k=0;k<6;k++){
      const a=A+k/6*Math.PI*2+0.26;
      const cx=x+Math.cos(a)*74, cz=z+Math.sin(a)*74;
      const drum=new THREE.Mesh(new THREE.CylinderGeometry(11,11,56,12).rotateZ(Math.PI/2),m.hull);
      drum.position.set(cx,g0+13,cz);drum.rotation.y=-a;parts.push(drum);
      const cap=new THREE.Mesh(new THREE.SphereGeometry(11,12,8),m.hull);
      cap.position.set(cx+Math.cos(a)*28,g0+13,cz+Math.sin(a)*28);parts.push(cap);
      for(let j=0;j<4;j++){
        const u=(j-1.5)*15;
        const px=cx+Math.cos(a)*u, pz=cz+Math.sin(a)*u;
        for(const sd of [-1,1]){
          const leg=new THREE.Mesh(new THREE.BoxGeometry(1.4,11,1.4).translate(0,5.5,0),m.steel);
          leg.position.set(px-Math.sin(a)*sd*8,g0+1,pz+Math.cos(a)*sd*8);
          leg.rotation.set(0,-a,sd*0.1);parts.push(leg);
        }
      }
      // the windows, on the outward side only, and warm
      for(let j=0;j<5;j++){
        const u=(j-2)*11;
        const w=new THREE.Mesh(new THREE.BoxGeometry(3.4,2.6,0.6),m.warm);
        w.position.set(cx+Math.cos(a)*u-Math.sin(a)*11.2,g0+15,cz+Math.sin(a)*u+Math.cos(a)*11.2);
        w.rotation.y=-a;w.userData.noWire=true;parts.push(w);
      }
      // the covered way back to the hub
      const way=new THREE.Mesh(new THREE.BoxGeometry(40,7,7),m.dark);
      way.position.set(x+Math.cos(a)*30,g0+13,z+Math.sin(a)*30);way.rotation.y=-a;parts.push(way);
      // ice bermed over the drum
      for(let j=0;j<7;j++){
        const u=(j-3)*9;
        const b=new THREE.Mesh(new THREE.BoxGeometry(9,7,26),m.ice);
        b.position.set(cx+Math.cos(a)*u,g0+6,cz+Math.sin(a)*u);b.rotation.y=-a;parts.push(b);
      }
    }
    // the mast, and the flag of nobody in particular
    parts.push(box(x+34,g0,z-34,1,H*1.9,1,m.steel));
    const byMat=new Map();
    for(const q of parts){let a=byMat.get(q.material);if(!a){a=[];byMat.set(q.material,a);}a.push(q);}
    const merged=[];for(const [mat,list] of byMat)merged.push(mergeParts(list,mat));
    return group(L,merged);},

  derrick(L,x,z){
    // ---- the bore ----
    // A hot-water drill running a string down through twenty kilometres of ice to the ocean. What you see is
    // the tower, the winch house, the reactor that boils the water, and the plume - because everything you
    // put down the hole comes back up as vapour and freezes in the vacuum before it has got anywhere (the
    // plume itself is in ice.js).
    const H=L.height||70, g0=gh(x,z), A=L.turn||0, parts=[];
    const m=P();
    // the tower: a square lattice, four legs and cross-bracing, because that is what a derrick is
    const W=13;
    for(let k=0;k<9;k++){
      const y=g0+4+k*(H/9), w=W*(1-k*0.052);
      for(const sd of [-1,1])for(const fr of [-1,1]){
        const leg=new THREE.Mesh(new THREE.BoxGeometry(1.1,H/9,1.1).translate(0,H/18,0),m.steel);
        leg.position.set(x+sd*w,y,z+fr*w);leg.rotation.set(0,-A,-sd*0.05);parts.push(leg);
      }
      for(const sd of [-1,1]){
        const br=new THREE.Mesh(new THREE.BoxGeometry(0.6,Math.hypot(H/9,w*2),0.6).translate(0,H/18,0),m.steel);
        br.position.set(x+sd*w,y,z);br.rotation.set(k%2?0.6:-0.6,-A,0);parts.push(br);
        const br2=new THREE.Mesh(new THREE.BoxGeometry(0.6,Math.hypot(H/9,w*2),0.6).translate(0,H/18,0),m.steel);
        br2.position.set(x,y,z+sd*w);br2.rotation.set(0,-A,k%2?0.6:-0.6);parts.push(br2);
      }
      const ring=new THREE.Mesh(new THREE.BoxGeometry(w*2.2,0.7,w*2.2),m.steel);
      ring.position.set(x,y,z);parts.push(ring);
    }
    // the crown block and the travelling block on its cable
    parts.push(box(x,g0+4+H,z,W*1.7,3.4,W*1.7,m.dark));
    parts.push(box(x,g0+4+H*0.6,z,4,5,4,m.dark));
    parts.push(box(x,g0+4+H*0.6,z,0.5,H*0.4,0.5,m.steel));
    // the collar at the top of the hole, and the hole
    {const c=new THREE.Mesh(new THREE.CylinderGeometry(7,8,5,14),m.dark);
     c.position.set(x,g0+2.5,z);parts.push(c);
     const hole=new THREE.Mesh(new THREE.CylinderGeometry(4.6,4.6,6,14,1,true),
       new THREE.MeshBasicMaterial({color:0x05080b,side:THREE.DoubleSide}));
     hole.position.set(x,g0+3,z);parts.push(hole);}
    // the winch house, the reactor and the heat rejection: the reason this works at all
    parts.push(box(x-34,g0+1.6,z+16,24,10,14,m.hull));
    parts.push(box(x+36,g0+1.6,z-12,18,12,18,m.hull));
    for(let k=0;k<5;k++){
      const f=new THREE.Mesh(new THREE.BoxGeometry(1.2,16,26),m.dark);
      f.position.set(x+36,g0+18,z-12+(k-2)*5);parts.push(f);
    }
    // the plume is src/europa/ice.js: particles on ballistic arcs, because in a vacuum nothing billows
    const g=group(L,(()=>{const byMat=new Map();
      for(const q of parts){let a=byMat.get(q.material);if(!a){a=[];byMat.set(q.material,a);}a.push(q);}
      const merged=[];for(const [mat,list] of byMat)merged.push(mergeParts(list,mat));return merged;})());
    return g;},

  pads(L,x,z){
    // ---- the landing field ----
    // Four pads of sintered ice with a blast pit in each, a lander standing on one of them, and the cargo
    // out on the apron. A landing here is silent, which is the thing everybody says about it.
    const g0=gh(x,z), A=L.turn||0, parts=[], RR=mkRng(212);
    const m=P();
    for(let k=0;k<4;k++){
      const a=A+k/4*Math.PI*2+0.4, d=210;
      const px=x+Math.cos(a)*d, pz=z+Math.sin(a)*d;
      const pad=new THREE.Mesh(new THREE.CylinderGeometry(58,62,2.4,20),m.dark);
      pad.position.set(px,gh(px,pz)+1.2,pz);parts.push(pad);
      const pit=new THREE.Mesh(new THREE.CylinderGeometry(15,12,3,14),new THREE.MeshLambertMaterial({color:0x2e353a}));
      pit.position.set(px,gh(px,pz)+1.6,pz);parts.push(pit);
      for(let j=0;j<8;j++){
        const aa=j/8*Math.PI*2;
        parts.push(box(px+Math.cos(aa)*56,gh(px,pz)+2,pz+Math.sin(aa)*56,2.4,3.4,2.4,m.steel));
      }
    }
    // the lander: a squat cone on four legs, which is what something that does this in vacuum looks like
    {
      const a=A+0.4, d=210;
      const px=x+Math.cos(a)*d, pz=z+Math.sin(a)*d, gy=gh(px,pz)+2.4;
      const body=new THREE.Mesh(new THREE.CylinderGeometry(9,13,22,12).translate(0,11,0),m.hull);
      body.position.set(px,gy+7,pz);parts.push(body);
      const top=new THREE.Mesh(new THREE.CylinderGeometry(6,9,7,12).translate(0,3.5,0),m.gold);
      top.position.set(px,gy+29,pz);parts.push(top);
      for(let k=0;k<4;k++){
        const aa=k/4*Math.PI*2+0.5;
        const leg=new THREE.Mesh(new THREE.BoxGeometry(1.4,17,1.4).translate(0,8.5,0),m.steel);
        leg.position.set(px+Math.cos(aa)*10,gy,pz+Math.sin(aa)*10);
        leg.rotation.set(Math.sin(aa)*0.42,0,-Math.cos(aa)*0.42);parts.push(leg);
        parts.push(box(px+Math.cos(aa)*17,gy,pz+Math.sin(aa)*17,5,1.6,5,m.steel));
      }
      for(let k=0;k<4;k++){
        const n=new THREE.Mesh(new THREE.CylinderGeometry(2.6,3.6,5,9),m.dark);
        n.position.set(px+Math.cos(k/4*Math.PI*2)*5,gy+2.5,pz+Math.sin(k/4*Math.PI*2)*5);parts.push(n);
      }
    }
    // cargo on the apron
    for(let k=0;k<20;k++){
      const a=RR()*6.28, d=RR()*320;
      const px=x+Math.cos(a)*d, pz=z+Math.sin(a)*d;
      const c=box(px,gh(px,pz)+0.6,pz,7+RR()*6,4+RR()*3,4+RR()*3,RR()<0.4?m.gold:m.hull);
      c.rotation.y=RR()*3;parts.push(c);
    }
    const byMat=new Map();
    for(const q of parts){let a=byMat.get(q.material);if(!a){a=[];byMat.set(q.material,a);}a.push(q);}
    const merged=[];for(const [mat,list] of byMat)merged.push(mergeParts(list,mat));
    return group(L,merged);},

  array(L,x,z){
    // ---- the power and the ear ----
    // Sunlight at Jupiter is a twenty-fifth of what it is at Earth, so the panels are enormous and they
    // still do not do much; most of the power comes from the reactor and what the panels really are is a
    // hedge. The dishes are pointed at Earth, which from here is a star you need a finder chart for.
    const g0=gh(x,z), A=L.turn||0, parts=[];
    const m=P();
    for(let r=0;r<5;r++){
      for(let k=0;k<9;k++){
        const px=x+(k-4)*46, pz=z+(r-2)*54;
        const gy=gh(px,pz);
        for(const sd of [-1,1])
          parts.push(box(px+sd*16,gy,pz,1.2,7,1.2,m.steel));
        const panel=new THREE.Mesh(new THREE.BoxGeometry(40,0.5,26),
          new THREE.MeshPhongMaterial({color:0x1b2a44,specular:0x9ab0d0,shininess:90,flatShading:true}));
        panel.position.set(px,gy+7.6,pz);panel.rotation.set(-0.7,-A,0);parts.push(panel);
      }
    }
    // the dishes
    for(let k=0;k<3;k++){
      const px=x-180+k*70, pz=z-160;
      const gy=gh(px,pz);
      parts.push(box(px,gy,pz,4,16,4,m.steel));
      const dish=new THREE.Mesh(new THREE.SphereGeometry(16,16,10,0,Math.PI*2,0,Math.PI*0.42),m.hull);
      dish.position.set(px,gy+18,pz);dish.rotation.set(-0.9,0,0.3-k*0.3);parts.push(dish);
      const horn=new THREE.Mesh(new THREE.ConeGeometry(2,8,8),m.steel);
      horn.position.set(px,gy+24,pz+5);horn.rotation.x=1.2;parts.push(horn);
    }
    // the radiators for the reactor: the biggest thing on the site and nobody ever mentions them
    for(let k=0;k<6;k++){
      const px=x+120, pz=z+40+(k-2.5)*22;
      const gy=gh(px,pz);
      const fin=new THREE.Mesh(new THREE.BoxGeometry(70,22,1.6),
        new THREE.MeshLambertMaterial({color:0xd8dce0,flatShading:true}));
      fin.position.set(px,gy+16,pz);fin.rotation.y=-A;parts.push(fin);
      parts.push(box(px,gy,pz,3,16,3,m.steel));
    }
    const byMat=new Map();
    for(const q of parts){let a=byMat.get(q.material);if(!a){a=[];byMat.set(q.material,a);}a.push(q);}
    const merged=[];for(const [mat,list] of byMat)merged.push(mergeParts(list,mat));
    return group(L,merged);},

  };
}
