// The four things on Arrakis that are not just another courtyard house. Fan work - every shape is this
// project's own low-poly geometry, modelled from the description, and no assets from any book, film or game
// are used. Dune belongs to the Herbert estate.
//
// None of this appears in any other city, so it travels with this page rather than living in the shared
// engine, and src/arrakeen/main.js hands it to build() as ctx.models.
import { mkRng } from '../core/rng.js';

export function landmarks(api){
  const {THREE,ctx,animHooks,scene,nightF,hour,box,group,gh,mergeParts}=api;
  return {

  residency(L,x,z){
    // ---- the Arrakeen Residency ----
    // A fortress that is pretending to be a house. Everything faces inward: a blank battered curtain wall
    // to the street, a single gate, and inside it the courts, the hall, and the garden - which is the
    // point of the whole building. Water is what power looks like here, so the one thing anybody is meant
    // to see is that somebody can afford to pour it on the ground.
    const H=L.height||96, g0=gh(x,z), A=L.turn||0, parts=[], RR=mkRng(1965);
    const wall=new THREE.MeshLambertMaterial({color:0xb09571,flatShading:true});
    const shade=new THREE.MeshLambertMaterial({color:0x8e7758,flatShading:true});
    const stone=new THREE.MeshLambertMaterial({color:0xc6ab83,flatShading:true});
    const dark=new THREE.MeshLambertMaterial({color:0x4e4335,flatShading:true});
    const glass=new THREE.MeshPhongMaterial({color:0x2b3a44,specular:0xa8c0cc,shininess:70});
    const green=new THREE.MeshLambertMaterial({color:0x4f6b39,flatShading:true});
    const water=new THREE.MeshPhongMaterial({color:0x2f6a78,specular:0xffffff,shininess:90,transparent:true,opacity:0.86});
    const at=(u,v,y)=>[x+u*Math.cos(A)-v*Math.sin(A),y,z+u*Math.sin(A)+v*Math.cos(A)];
    const bx=(u,v,y,w,h,d,m)=>{const [px,py,pz]=at(u,v,y);const b=box(px,py,pz,w,h,d,m);b.rotation.y=-A;return b;};

    const W=L.width||300, D=L.depth||230;
    // the curtain: battered, blind, and thick, with a walk along the top
    for(const [u,v,w,d] of [[0,-D/2,W,22],[0,D/2,W,22],[-W/2,0,22,D],[W/2,0,22,D]]){
      parts.push(bx(u,v,g0,w,H*0.42,d,wall));
      parts.push(bx(u,v,g0+H*0.42,w*1.03,H*0.05,d*1.3,shade));
    }
    for(const sd of [-1,1])for(const q of [-1,1])
      parts.push(bx(sd*W/2,q*D/2,g0,42,H*0.62,42,shade));
    // the gate: a deep arch in the south wall with a pylon either side
    for(const sd of [-1,1])parts.push(bx(sd*34,D/2,g0,26,H*0.58,30,shade));
    parts.push(bx(0,D/2,g0+H*0.44,90,H*0.14,34,stone));
    parts.push(bx(0,D/2+2,g0,54,H*0.36,8,dark));

    // the hall: the one big roof in the building, stepped and with a clerestory
    parts.push(bx(-W*0.16,-D*0.14,g0,W*0.44,H*0.7,D*0.44,wall));
    parts.push(bx(-W*0.16,-D*0.14,g0+H*0.7,W*0.34,H*0.1,D*0.34,shade));
    parts.push(bx(-W*0.16,-D*0.14,g0+H*0.8,W*0.2,H*0.12,D*0.2,stone));
    for(let k=0;k<9;k++)parts.push(bx(-W*0.16-W*0.12+k*W*0.03,-D*0.14-D*0.1,g0+H*0.72,W*0.012,H*0.07,D*0.22,glass));
    // the tower: the only thing in Arrakeen that looks at the horizon on purpose
    parts.push(bx(W*0.24,-D*0.3,g0,52,H,52,wall));
    parts.push(bx(W*0.24,-D*0.3,g0+H,64,H*0.08,64,shade));
    for(let k=0;k<4;k++){const a=k/4*Math.PI*2;
      parts.push(bx(W*0.24+Math.cos(a)*26,-D*0.3+Math.sin(a)*26,g0+H*1.08,16,H*0.1,16,stone));}
    // the wings: rooms round two courts, all of them looking in
    for(const sd of [-1,1]){
      parts.push(bx(sd*W*0.3,D*0.22,g0,W*0.3,H*0.38,D*0.3,wall));
      parts.push(bx(sd*W*0.3,D*0.22,g0+H*0.38,W*0.31,H*0.03,D*0.31,shade));
      for(let k=0;k<5;k++)
        parts.push(bx(sd*W*0.3+(k-2)*W*0.05,D*0.22-D*0.15,g0+H*0.18,W*0.02,H*0.12,4,dark));
    }

    // ---- the garden ----
    // The obscenity: open water and things growing in it, under a roof of palm fronds, inside the only
    // walls on the planet nobody is allowed to look over.
    {
      const pool=new THREE.Mesh(new THREE.BoxGeometry(W*0.2,1.4,D*0.14),water);
      const [px,py,pz]=at(0,-D*0.02,g0+2.6);pool.position.set(px,py,pz);pool.rotation.y=-A;parts.push(pool);
      const rim=bx(0,-D*0.02,g0+1.6,W*0.22,1.6,D*0.16,stone);parts.push(rim);
      for(let k=0;k<18;k++){
        const u=(RR()-0.5)*W*0.5, v=-D*0.02+(RR()-0.5)*D*0.3;
        const h=9+RR()*9;
        parts.push(bx(u,v,g0+1.8,1.5,h,1.5,dark));
        const crown=new THREE.Mesh(new THREE.IcosahedronGeometry(3.4+RR()*2.4,0),green);
        const [cx2,cy2,cz2]=at(u,v,g0+1.8+h);crown.position.set(cx2,cy2,cz2);
        crown.scale.set(1.5,0.6,1.5);parts.push(crown);
      }
      for(let k=0;k<26;k++){
        const u=(RR()-0.5)*W*0.56, v=-D*0.02+(RR()-0.5)*D*0.34;
        const b2=new THREE.Mesh(new THREE.IcosahedronGeometry(1.4+RR()*2,0),green);
        const [cx2,cy2,cz2]=at(u,v,g0+2.4);b2.position.set(cx2,cy2,cz2);b2.scale.set(1,0.7,1);parts.push(b2);
      }
    }
    const byMat=new Map();
    for(const m of parts){let a=byMat.get(m.material);if(!a){a=[];byMat.set(m.material,a);}a.push(m);}
    const merged=[];for(const [mat,list] of byMat)merged.push(mergeParts(list,mat));
    return group(L,merged);},

  windtrap(L,x,z){
    // ---- the great windtrap ----
    // The city's lung, and the only piece of civic architecture on the planet: a scoop standing into the
    // prevailing wind, ribbed like a shell, with the precipitator stack behind it and the cistern under
    // that. The air over Arrakis carries almost no water; this is how you get the almost.
    const H=L.height||120, g0=gh(x,z), A=L.turn||0, parts=[];
    const metal=new THREE.MeshPhongMaterial({color:0x8d8c86,specular:0x4a4a46,shininess:24,flatShading:true});
    const rib=new THREE.MeshPhongMaterial({color:0x6f6e68,specular:0x3a3a36,shininess:18,flatShading:true});
    const wall=new THREE.MeshLambertMaterial({color:0xa89070,flatShading:true});
    const dark=new THREE.MeshLambertMaterial({color:0x3d3730,flatShading:true});
    const at=(u,v,y)=>[x+u*Math.cos(A)-v*Math.sin(A),y,z+u*Math.sin(A)+v*Math.cos(A)];

    // the base: a blockhouse, because the working parts are all underground
    {const [px,py,pz]=at(0,0,g0);const b=box(px,py,pz,110,H*0.2,90,wall);b.rotation.y=-A;parts.push(b);}
    for(const sd of [-1,1]){const [px,py,pz]=at(sd*52,0,g0);
      const b=box(px,py,pz,20,H*0.3,100,wall);b.rotation.y=-A;parts.push(b);}
    // the scoop: an arc of curved vanes on a frame, opening downwind
    const RAD=H*0.62;
    for(let k=0;k<13;k++){
      const t=k/12, a=-1.05+t*2.1;
      const w=RAD*0.14;
      const v=new THREE.Mesh(new THREE.BoxGeometry(w,H*0.66,5),metal);
      const [px,py,pz]=at(Math.sin(a)*RAD*0.9,-Math.cos(a)*RAD*0.5-10,g0+H*0.2);
      v.position.set(px,py+H*0.33,pz);v.rotation.set(0,-A-a*0.7,0.08*Math.sin(a));parts.push(v);
    }
    for(let k=0;k<4;k++){
      const y=g0+H*0.2+k*H*0.2;
      const r=new THREE.Mesh(new THREE.TorusGeometry(RAD*0.8,3.4,5,20,2.2),rib);
      const [px,py,pz]=at(0,-14,y);r.position.set(px,py,pz);
      r.rotation.set(Math.PI/2,0,-A+Math.PI/2+1.1);parts.push(r);
    }
    // the stack behind it, and the vent at the top of it
    {const [px,py,pz]=at(0,44,g0);const s=box(px,py,pz,44,H*0.92,44,wall);s.rotation.y=-A;parts.push(s);
     const [cx,cy,cz]=at(0,44,g0+H*0.92);const c=box(cx,cy,cz,58,H*0.06,58,dark);c.rotation.y=-A;parts.push(c);}
    for(let k=0;k<6;k++){const [px,py,pz]=at((k-2.5)*8,44,g0+H*0.98);
      const f=new THREE.Mesh(new THREE.BoxGeometry(5,H*0.1,40),rib);f.position.set(px,py+H*0.05,pz);
      f.rotation.y=-A;parts.push(f);}

    const byMat=new Map();
    for(const m of parts){let a=byMat.get(m.material);if(!a){a=[];byMat.set(m.material,a);}a.push(m);}
    const merged=[];for(const [mat,list] of byMat)merged.push(mergeParts(list,mat));
    return group(L,merged);},

  lighter(L,x,z){
    // ---- a Guild lighter on the field ----
    // Nothing else on this planet is this tall, this clean or this obviously from somewhere else. It stands
    // on its own legs on the fused rock with the gantry run up to it and the cargo out on the apron.
    const H=L.height||210, g0=gh(x,z), A=L.turn||0, parts=[], LR=mkRng(88);
    const hull=new THREE.MeshPhongMaterial({color:0x9aa0a4,specular:0xc8d0d4,shininess:60,flatShading:true});
    const dark=new THREE.MeshPhongMaterial({color:0x4a4f53,specular:0x8a9094,shininess:40,flatShading:true});
    const steel=new THREE.MeshLambertMaterial({color:0x6e7378,flatShading:true});
    const rust=new THREE.MeshLambertMaterial({color:0x7a6a56,flatShading:true});
    const at=(u,v,y)=>[x+u*Math.cos(A)-v*Math.sin(A),y,z+u*Math.sin(A)+v*Math.cos(A)];

    // the pad it stands on, blackened
    {const p=new THREE.Mesh(new THREE.CylinderGeometry(150,158,3,28),dark);
     p.position.set(x,g0+1.5,z);parts.push(p);}
    // the body: a tapering cone on a cylinder, which is what a thing that comes down on its tail looks like
    const R0=H*0.17;
    for(let k=0;k<9;k++){
      const t0=k/9,t1=(k+1)/9;
      const r0=R0*(t0<0.6?1-0.08*t0:1-0.048-1.5*(t0-0.6)), r1=R0*(t1<0.6?1-0.08*t1:1-0.048-1.5*(t1-0.6));
      const seg=new THREE.Mesh(new THREE.CylinderGeometry(Math.max(2,r1),Math.max(2,r0),H/9*1.02,12)
        .translate(0,H/9/2,0),k%3===2?dark:hull);
      seg.position.set(x,g0+3+H*t0,z);parts.push(seg);
    }
    // the legs, and the skirt of the engines between them
    for(let k=0;k<4;k++){
      const a=A+k/4*Math.PI*2+0.4;
      const leg=new THREE.Mesh(new THREE.BoxGeometry(7,H*0.3,12).translate(0,H*0.15,0),steel);
      leg.position.set(x+Math.cos(a)*R0*1.25,g0+3,z+Math.sin(a)*R0*1.25);
      leg.rotation.set(Math.sin(a)*0.22,-a,-Math.cos(a)*0.22);parts.push(leg);
      const foot=box(x+Math.cos(a)*R0*1.5,g0+3,z+Math.sin(a)*R0*1.5,22,5,22,steel);parts.push(foot);
    }
    {const sk=new THREE.Mesh(new THREE.CylinderGeometry(R0*1.02,R0*0.7,H*0.1,12),dark);
     sk.position.set(x,g0+3+H*0.05,z);parts.push(sk);}
    // the gantry: a tower of scaffold with arms run out to the hull
    for(let k=0;k<7;k++){
      const y=g0+3+k*H*0.13;
      const f=box(x+R0*2.3,y,z,26,H*0.13,26,steel);parts.push(f);
      if(k%2===0){const arm=box(x+R0*1.6,y+H*0.06,z,R0*1.4,4,9,steel);parts.push(arm);}
    }
    // cargo on the apron: containers, and the spice in them
    for(let k=0;k<22;k++){
      const a=LR()*6.28, d=180+LR()*160;
      const cx2=x+Math.cos(a)*d, cz2=z+Math.sin(a)*d;
      const c=box(cx2,gh(cx2,cz2),cz2,16+LR()*10,7+LR()*5,9+LR()*5,LR()<0.4?rust:steel);
      c.rotation.y=LR()*3;parts.push(c);
    }
    const byMat=new Map();
    for(const m of parts){let a=byMat.get(m.material);if(!a){a=[];byMat.set(m.material,a);}a.push(m);}
    const merged=[];for(const [mat,list] of byMat)merged.push(mergeParts(list,mat));
    return group(L,merged);},

  sietch(L,x,z){
    // ---- a sietch in the rock ----
    // The whole design is that there is nothing to see. What is built here is the rock: a massif with a
    // few things in it that are not weathering, which is how you find one if you know what to look for -
    // a line of windtrap vents under an overhang, a path worn up a scree, and a hatch that is too straight.
    const g0=gh(x,z), A=L.turn||0, parts=[], SR=mkRng(1979);
    const rock=new THREE.MeshLambertMaterial({color:0x7d7160,flatShading:true});
    const dark=new THREE.MeshLambertMaterial({color:0x5a5147,flatShading:true});
    const shade=new THREE.MeshBasicMaterial({color:0x0d0b09});
    const metal=new THREE.MeshPhongMaterial({color:0x6a6760,specular:0x9a968c,shininess:30,flatShading:true});
    const at=(u,v,y)=>[x+u*Math.cos(A)-v*Math.sin(A),y,z+u*Math.sin(A)+v*Math.cos(A)];

    // the massif: slabs, tilted, all of them the same rock
    for(let k=0;k<34;k++){
      const u=(SR()-0.5)*880, v=(SR()-0.5)*560;
      const h=60+SR()*230*(1-Math.hypot(u/440,v/280));
      if(h<30)continue;
      const m=new THREE.Mesh(new THREE.BoxGeometry(90+SR()*180,h,70+SR()*150).translate(0,h/2,0),
        SR()<0.3?dark:rock);
      const [px,py,pz]=at(u,v,g0-30);
      m.position.set(px,py,pz);m.rotation.set((SR()-0.5)*0.14,-A+SR()*3,(SR()-0.5)*0.16);parts.push(m);
    }
    // the overhang, and the vents under it: the only straight lines on the hill
    {const [px,py,pz]=at(-120,-200,g0+150);
     const o=new THREE.Mesh(new THREE.BoxGeometry(320,40,150),dark);
     o.position.set(px,py,pz);o.rotation.set(0.06,-A,0.03);parts.push(o);
     for(let k=0;k<7;k++){
       const [vx,vy,vz]=at(-240+k*40,-234,g0+112);
       const g2=new THREE.Mesh(new THREE.BoxGeometry(22,16,6),metal);
       g2.position.set(vx,vy,vz);g2.rotation.y=-A;parts.push(g2);
       const s=new THREE.Mesh(new THREE.BoxGeometry(18,12,2),shade);
       s.position.set(vx,vy,vz-3.2);s.rotation.y=-A;parts.push(s);
     }
    }
    // the hatch: a slab of rock on a frame, which is not rock
    {const [px,py,pz]=at(120,-250,g0+52);
     const h2=new THREE.Mesh(new THREE.BoxGeometry(46,54,8),rock);
     h2.position.set(px,py,pz);h2.rotation.set(0.04,-A,0);parts.push(h2);
     const fr=new THREE.Mesh(new THREE.BoxGeometry(54,62,3),metal);
     fr.position.set(px,py,pz+4);fr.rotation.set(0.04,-A,0);parts.push(fr);}
    // the path: worn scree, switchbacking up to the hatch, and stones laid on the turns
    for(let k=0;k<40;k++){
      const t=k/39, sd=Math.floor(t*4)%2?1:-1;
      const [px,py,pz]=at(120+sd*((t*4)%1)*150-60,-250-t*180+90,g0+8+t*46);
      const s=box(px,py,pz,9+SR()*7,2.5,7+SR()*5,SR()<0.4?dark:rock);
      s.rotation.y=SR()*3;parts.push(s);
    }
    const byMat=new Map();
    for(const m of parts){let a=byMat.get(m.material);if(!a){a=[];byMat.set(m.material,a);}a.push(m);}
    const merged=[];for(const [mat,list] of byMat)merged.push(mergeParts(list,mat));
    return group(L,merged);},

  };
}
