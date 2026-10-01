// The four things on Arrakis that are not just another courtyard house. Fan work - every shape is this
// project's own low-poly geometry, modelled from the description, and no assets from any book, film or game
// are used. Dune belongs to the Herbert estate.
//
// None of this appears in any other city, so it travels with this page rather than living in the shared
// engine, and src/arrakeen/main.js hands it to build() as ctx.models.
import { mkRng } from '../core/rng.js';
import { stoneKit } from './stone.js';

export function landmarks(api){
  const {THREE,ctx,animHooks,scene,nightF,hour,box,group,gh,mergeParts}=api;
  return {

  residency(L,x,z){
    // ---- the Arrakeen Residency ----
    // A fortress pretending to be a house, and the biggest thing anybody has built on the planet: stone masses
    // round a sealed court, the north range stepped up like a ziggurat, every face leaning back from the wind,
    // no windows but slits. The films' designer called it a show of force; it is also a very good way to keep
    // a building cool. To the city it shows a low blind wall with one gate between two pylons. The court is the
    // garden - the obscenity, water and green on a world that would drink a man dry - and there is a landing
    // platform for the thopters on the east wing, because nobody who lives here walks through the town.
    const g0=gh(x,z), A=L.turn||0, parts=[], RR=mkRng(1965);
    const W=420, D=340, CW=160, CD=120;          // (the city file's width and depth were for the old, smaller house)
    const ST=stoneKit(api),c=Math.cos(A),s=Math.sin(A);
    const at=(u,v,y)=>[x+u*c-v*s,y,z+u*s+v*c];
    const m=(u,v,w,d,h,bat,rgb,y0)=>{const [px,,pz]=at(u,v,0);return ST.mass(px,pz,w,d,A,h,bat,rgb,y0===undefined?g0:y0);};
    const S1=[0.72,0.60,0.45],S2=[0.66,0.55,0.42],S3=[0.60,0.50,0.38];
    // the north range: four tiers, each stepped back from the one below
    {let y=g0,dw=W,dd=D/2-CD/2;for(const [h,col] of [[40,S1],[34,S2],[30,S1],[36,S3]]){const r=m(0,-CD/2-dd/2,dw,dd,h,0.18,col,y);y=r.top;dw*=0.78;dd*=0.72;}}
    // the east and west wings, battered, and the landing platform on the east one
    for(const sd of [-1,1]){const wu=(W/2+CW/2)/2*sd,ww=(W-CW)/2;const r=m(wu,0,ww,CD+10,56,0.16,S2);
      if(sd>0){const [px,,pz]=at(wu,10,0);const pad=new THREE.Mesh(new THREE.CylinderGeometry(34,36,2,24),new THREE.MeshLambertMaterial({color:0x3e3a34}));
        pad.position.set(px,r.top+1,pz);parts.push(pad);
        const ring=new THREE.Mesh(new THREE.TorusGeometry(28,0.6,4,32).rotateX(Math.PI/2),new THREE.MeshBasicMaterial({color:0xd8a850}));ring.position.set(px,r.top+2.1,pz);parts.push(ring);
        ctx.residencyPad=[px,r.top+2,pz];}}
    // the front: a low blind wall, one gate, and a pylon either side of it taller than anything else in the town
    for(const sd of [-1,1])m(sd*(W/4+14),CD/2+(D/2-CD/2)/2,W/2-28,D/2-CD/2,30,0.22,S1);
    for(const sd of [-1,1])m(sd*30,CD/2+(D/2-CD/2)/2,26,D/2-CD/2+14,112,0.1,S3);
    m(0,CD/2+(D/2-CD/2)/2,86,D/2-CD/2+20,14,0.02,S2,g0+62);                              // the lintel over the gate
    ST.finish('residency');
    const water=new THREE.MeshPhongMaterial({color:0x2f6a78,specular:0xffffff,shininess:90,transparent:true,opacity:0.86});
    const stone=new THREE.MeshLambertMaterial({color:0xc6ab83,flatShading:true});
    const dark=new THREE.MeshLambertMaterial({color:0x4e4335,flatShading:true});
    const green=new THREE.MeshLambertMaterial({color:0x4f6b39,flatShading:true});
    const bx=(u,v,y,w,h,d,mm)=>{const [px,py,pz]=at(u,v,y);const b=box(px,py,pz,w,h,d,mm);b.rotation.y=-A;return b;};

    // ---- the garden ----
    // The obscenity: open water and things growing in it, under a roof of palm fronds, inside the only
    // walls on the planet nobody is allowed to look over.
    {
      const pool=new THREE.Mesh(new THREE.BoxGeometry(CW*0.5,1.4,CD*0.35),water);
      const [px,py,pz]=at(0,0,g0+2.6);pool.position.set(px,py,pz);pool.rotation.y=-A;parts.push(pool);
      const rim=bx(0,0,g0+1.6,CW*0.55,1.6,CD*0.4,stone);parts.push(rim);
      for(let k=0;k<18;k++){
        const u=(RR()-0.5)*CW*0.85, v=(RR()-0.5)*CD*0.85;if(Math.abs(u)<CW*0.3&&Math.abs(v)<CD*0.22)continue;
        const h=9+RR()*9;
        parts.push(bx(u,v,g0+1.8,1.5,h,1.5,dark));
        const crown=new THREE.Mesh(new THREE.IcosahedronGeometry(3.4+RR()*2.4,0),green);
        const [cx2,cy2,cz2]=at(u,v,g0+1.8+h);crown.position.set(cx2,cy2,cz2);
        crown.scale.set(1.5,0.6,1.5);parts.push(crown);
      }
      for(let k=0;k<26;k++){
        const u=(RR()-0.5)*CW*0.9, v=(RR()-0.5)*CD*0.9;
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
    // The city's lung, and the only civic monument on the planet: a stone tower on a blockhouse, battered like
    // everything else, ribbed up its faces with the metal fins the dew forms on, and crowned with a collar of
    // vanes that turn the wind down into it; a scoop at the top stands into the prevailing wind. The air over
    // Arrakis carries almost no water; this is how you get the almost.
    const H=L.height||150, g0=gh(x,z), A=L.turn||0, parts=[];
    const ST=stoneKit(api),c=Math.cos(A),s=Math.sin(A),at=(u,v)=>[x+u*c-v*s,z+u*s+v*c];
    const metal=new THREE.MeshPhongMaterial({color:0x7c7870,specular:0x9a958a,shininess:30,flatShading:true});
    const dark=new THREE.MeshLambertMaterial({color:0x3a3530,flatShading:true});
    // the blockhouse, and the tower out of it
    ST.mass(x,z,120,96,A,26,0.25,[0.62,0.52,0.40],g0);
    const tw=ST.mass(x,z,56,56,A,H,0.1,[0.66,0.56,0.43],g0+20);
    ST.finish('great-windtrap');
    // the fins: sixteen, up the four faces
    for(let k=0;k<16;k++){const side=Math.floor(k/4),q=(k%4-1.5)*11,off=28-0.1*H*0.5;
      const [u,v]=side===0?[q,off+2]:side===1?[off+2,q]:side===2?[q,-off-2]:[-off-2,q];const [px,pz]=at(u,v);
      const fin=new THREE.Mesh(new THREE.BoxGeometry(side%2?1.2:3,H*0.8,side%2?3:1.2).translate(0,H*0.4,0),metal);fin.position.set(px,g0+24,pz);fin.rotation.set(side===0?-0.05:side===2?0.05:0,-A,side===1?0.05:side===3?-0.05:0);parts.push(fin);}
    // the collar: a ring of angled vanes round the top
    {const [cx,cz]=at(0,0),y=tw.top;
     for(let k=0;k<24;k++){const a=k/24*Math.PI*2;const v=new THREE.Mesh(new THREE.BoxGeometry(14,18,1.2),metal);v.position.set(cx+Math.cos(a)*26,y+6,cz+Math.sin(a)*26);v.rotation.set(0,-a+Math.PI/2+0.45,0.25);parts.push(v);}
     const cap=new THREE.Mesh(new THREE.CylinderGeometry(22,30,6,24),dark);cap.position.set(cx,y+17,cz);parts.push(cap);
     // the scoop, into the wind
     const sc=new THREE.Mesh(new THREE.CylinderGeometry(14,20,26,16,1,true,0,Math.PI).rotateX(Math.PI/2),metal);sc.material=metal.clone();sc.material.side=THREE.DoubleSide;
     const [sx,sz]=at(0,-22);sc.position.set(sx,y+34,sz);sc.rotation.y=-A;parts.push(sc);}
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
