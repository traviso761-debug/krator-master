// What is built in the cleft. Fan work — every shape is this project's own low-poly geometry, modelled from
// the description, and no assets from any book, film or game are used. Tolkien's world belongs to the
// Tolkien Estate.
//
// The architecture has a small number of rules and they are the whole of its character:
//
//   everything is LONG and LOW and has a very steep roof, because the valley is narrow and wet
//   nothing is symmetrical about a front door - the building grew along a ledge and has no front
//   every room that can have a gallery over the drop has one, on slender posts, with the drop under it
//   the structure is timber on stone: the ground floor is masonry and everything above it is frame
//   the openings are POINTED - a pair of leaning members meeting at a peak, never a semicircle
//   the gable is the decorated part: deep bargeboards, a finial standing above the ridge, carved ends
//   the roofs are copper gone green and slate gone grey-violet, over honey-coloured wood
//
// A massing model cannot carve anything, so the carving is geometry: the finials, the bargeboards, the
// posts and the arches are all built out of boxes, and at the size they are on screen that is enough.
import { mkRng } from '../core/rng.js';

export function landmarks(api){
  const {THREE,ctx,animHooks,scene,nightF,hour,box,group,gh,mergeParts}=api;

  // the palette the whole valley is built from
  const M=()=>({
    beam:new THREE.MeshLambertMaterial({color:0x8a7450,flatShading:true}),       // honey timber
    dark:new THREE.MeshLambertMaterial({color:0x5f5138,flatShading:true}),       // the shadowed side of it
    wall:new THREE.MeshLambertMaterial({color:0xd8d0bb,flatShading:true}),       // lime plaster
    stone:new THREE.MeshLambertMaterial({color:0xa8a293,flatShading:true}),      // the masonry under it
    pale:new THREE.MeshLambertMaterial({color:0xc4bda9,flatShading:true}),       // dressed stone
    slate:new THREE.MeshLambertMaterial({color:0x6e6a76,flatShading:true}),      // grey gone violet
    copper:new THREE.MeshLambertMaterial({color:0x5f9080,flatShading:true}),     // verdigris
    gilt:new THREE.MeshPhongMaterial({color:0xbfa055,specular:0xfff0c0,shininess:70,flatShading:true}),
    glass:new THREE.MeshPhongMaterial({color:0x3a4a44,specular:0xdfeee8,shininess:80,transparent:true,opacity:0.7}),
    leaf:new THREE.MeshLambertMaterial({color:0xb08a34,flatShading:true}),
  });

  // ---- the pieces the whole valley is made of ----

  // A steep gabled roof over a rectangle. The ridge runs along the local u axis; `A` turns the whole thing.
  // Built by rotating each slope in its OWN frame after the turn, because offsetting in world axes and then
  // spinning is how the first version came out as a pair of butterfly wings.
  function roof(parts,mat,x,y,z,len,span,pitch,A,eave){
    const h=span*0.5*pitch, E=eave===undefined?1.14:eave;
    const c=Math.cos(A), s=Math.sin(A);
    const slopeLen=Math.hypot(span*0.5,h);
    for(const sd of [-1,1]){
      const sl=new THREE.Mesh(new THREE.BoxGeometry(len*E,0.55,slopeLen*1.06),mat);
      const off=sd*span*0.25;
      sl.position.set(x-s*off,y+h/2,z+c*off);
      sl.rotation.set(0,-A,0);
      sl.rotateX(-sd*Math.atan2(h,span*0.5));
      parts.push(sl);
    }
    return h;
  }

  // The gable end: a deep bargeboard down each slope and a finial standing above the ridge. This is where
  // the decoration is on a building like this, and it is what reads at two hundred metres.
  function gableEnd(parts,m,x,y,z,span,h,A,sd,finial){
    const c=Math.cos(A), s=Math.sin(A);
    const slopeLen=Math.hypot(span*0.5,h);
    for(const q of [-1,1]){
      const bd=new THREE.Mesh(new THREE.BoxGeometry(0.8,0.9,slopeLen*1.04),m.dark);
      const off=q*span*0.25;
      bd.position.set(x-s*off,y+h/2,z+c*off);
      bd.rotation.set(0,-A,0);
      bd.rotateX(-q*Math.atan2(h,span*0.5));
      parts.push(bd);
    }
    if(finial!==false){
      const f=new THREE.Mesh(new THREE.ConeGeometry(0.42,h*0.55,5),m.gilt);
      f.position.set(x,y+h+h*0.27,z);parts.push(f);
      const stem=box(x,y+h-0.4,z,0.3,h*0.4,0.3,m.dark);parts.push(stem);
    }
  }

  // A pointed arch: two leaning members meeting at a peak, on two jambs. Elven building has no round arch
  // anywhere in it, and this one shape - repeated at every size from a doorway to a bridge - is most of
  // what makes the style legible.
  function arch(parts,mat,x,y,z,w,h,A,thick){
    const t=thick||0.34, c=Math.cos(A), s=Math.sin(A);
    for(const sd of [-1,1]){
      const jamb=new THREE.Mesh(new THREE.BoxGeometry(t,h*0.58,t*1.3).translate(0,h*0.29,0),mat);
      jamb.position.set(x-s*sd*w*0.5,y,z+c*sd*w*0.5);jamb.rotation.y=-A;parts.push(jamb);
      const lean=Math.hypot(w*0.5,h*0.42);
      const lm=new THREE.Mesh(new THREE.BoxGeometry(t,lean,t*1.3),mat);
      lm.position.set(x-s*sd*w*0.25,y+h*0.58+h*0.21,z+c*sd*w*0.25);
      lm.rotation.set(0,-A,0);lm.rotateZ(0);
      lm.rotateX(sd*Math.atan2(w*0.5,h*0.42));
      parts.push(lm);
    }
  }

  // A run of slender posts with a moulded head and foot: the arcade that carries every gallery here.
  function colonnade(parts,m,x,y,z,len,n,h,A){
    const c=Math.cos(A), s=Math.sin(A);
    for(let i=0;i<n;i++){
      const u=(i/(n-1)-0.5)*len;
      const px=x+c*u, pz=z+s*u;
      parts.push(box(px,y,pz,0.34,h,0.34,m.beam));
      parts.push(box(px,y+h-0.3,pz,0.62,0.34,0.62,m.pale));     // the capital
      parts.push(box(px,y,pz,0.6,0.28,0.6,m.pale));             // and the base
    }
  }

  // A balustrade: a rail on little turned posts, which is what makes a ledge read as somewhere people stand
  // rather than as the edge of a slab.
  function rail(parts,m,x,y,z,len,A,h){
    const c=Math.cos(A), s=Math.sin(A), H=h||1.05;
    const n=Math.max(2,Math.round(len/1.6));
    for(let i=0;i<=n;i++){
      const u=(i/n-0.5)*len;
      parts.push(box(x+c*u,y,z+s*u,0.16,H,0.16,m.pale));
    }
    const top=new THREE.Mesh(new THREE.BoxGeometry(len,0.18,0.3),m.pale);
    top.position.set(x,y+H,z);top.rotation.y=-A;parts.push(top);
  }

  return {

  house(L,x,z){
    // ---- the Last Homely House ----
    // Not one building: a row of halls of different sizes joined end to end along the ledge and stepping
    // down it, with a court at the upper end, a tower where the ledge widens, and a gallery on the valley
    // side of every single one of them. The plan is a corridor with rooms off it and a view on one side,
    // which is what a house built on a shelf has to be.
    const H=L.height||34, g0=gh(x,z), A=L.turn||0, parts=[], RR=mkRng(3441);
    const m=M();
    const at=(u,v,y)=>[x+u*Math.cos(A)-v*Math.sin(A),y,z+u*Math.sin(A)+v*Math.cos(A)];
    const bx=(u,v,y,w,h,d,mat)=>{const [px,py,pz]=at(u,v,y);const b=box(px,py,pz,w,h,d,mat);b.rotation.y=-A;return b;};

    let v=-170;
    for(let k=0;k<7;k++){
      const w=24+RR()*14, d=40+RR()*30, drop=k*3.4;
      const y=g0-drop;
      const roofM=k%3===1?m.copper:m.slate;
      // the undercroft: the ground under this is falling away, so the downhill side is all masonry
      parts.push(bx(0,v,y-16,w*1.04,18,d*1.02,m.stone));
      for(let i=0;i<Math.round(d/9);i++)                        // and it is buttressed
        parts.push(bx(-w*0.52,v-d/2+5+i*9,y-14,1.6,14,2.4,m.stone));
      // the hall
      parts.push(bx(0,v,y+2,w,H*0.30,d,m.wall));
      // the frame: posts to the eaves and a bressumer across them
      for(let i=0;i<Math.round(d/6);i++){
        const vv=v-d/2+3+i*6;
        for(const sd of [-1,1])parts.push(bx(sd*w*0.5,vv,y+2,0.44,H*0.30,0.44,m.beam));
      }
      parts.push(bx(0,v,y+2+H*0.30,w*1.08,0.8,d*1.04,m.beam));
      // the roof, and the gable at each end of it with its bargeboards and finial
      {
        const [px,py,pz]=at(0,v,y+2+H*0.30+0.5);
        const h2=roof(parts,roofM,px,py,pz,d*1.02,w*1.1,1.35,A+Math.PI/2);
        for(const sd of [-1,1]){
          const [gx,gy,gz]=at(0,v+sd*d*0.51,y+2+H*0.30+0.5);
          gableEnd(parts,m,gx,gy,gz,w*1.1,h2,A+Math.PI/2,sd,true);
          // the tympanum: the triangle of wall under the gable, boarded
          parts.push(bx(0,v+sd*d*0.5,y+2+H*0.30+h2*0.35,w*0.5,h2*0.5,0.4,m.beam));
        }
        // dormers on the uphill slope, because the roof is steep enough to live in
        for(let i=0;i<2;i++){
          const vv=v+(i-0.5)*d*0.42;
          parts.push(bx(w*0.22,vv,y+2+H*0.30+h2*0.22,2.6,2.4,2.2,m.wall));
          const [dx2,dy2,dz2]=at(w*0.22,vv,y+2+H*0.30+h2*0.22+2.4);
          roof(parts,roofM,dx2,dy2,dz2,3.0,2.8,1.3,A+Math.PI/2);
        }
      }
      // the gallery over the drop: a deck on posts, an arcade carrying the eaves, and a rail
      parts.push(bx(-w*0.5-5,v,y+1,11,0.7,d*0.9,m.beam));
      {
        const [cx2,cy2,cz2]=at(-w*0.5-9.4,v,y+1.7);
        colonnade(parts,m,cx2,cy2,cz2,d*0.86,Math.max(4,Math.round(d/7)),H*0.30,A+Math.PI/2);
        const [rx,ry,rz]=at(-w*0.5-10.4,v,y+1.7);
        rail(parts,m,rx,ry,rz,d*0.88,A+Math.PI/2);
      }
      // the posts that hold the gallery out of nothing
      for(let i=0;i<Math.round(d/10);i++){
        const vv=v-d*0.42+i*10;
        const [px,py,pz]=at(-w*0.5-9.4,vv,y-17);
        const p=new THREE.Mesh(new THREE.BoxGeometry(0.8,19,0.8).translate(0,9.5,0),m.beam);
        p.position.set(px,py,pz);p.rotation.set(0,-A,0.05);parts.push(p);
        if(i%2===0){                                            // and the braces back to the undercroft
          const br=new THREE.Mesh(new THREE.BoxGeometry(0.5,9,0.5).translate(0,4.5,0),m.beam);
          const [qx,qy,qz]=at(-w*0.5-9.4,vv,y-9);
          br.position.set(qx,qy,qz);br.rotation.set(0,-A,0.6);parts.push(br);
        }
      }
      // the openings: tall pointed lights on the valley side, a door at one end
      for(let i=0;i<Math.round(d/6.5);i++){
        const vv=v-d*0.42+i*6.5;
        const [ax,ay,az]=at(-w*0.5+0.3,vv,y+2.4);
        arch(parts,m.pale,ax,ay,az,2.0,H*0.26,A+Math.PI/2,0.22);
        parts.push(bx(-w*0.5+0.5,vv,y+2.6,0.3,H*0.2,1.5,m.glass));
      }
      v+=d+7;
    }

    // ---- the tower ----
    // Not tall. Taller than the rest, with a steep cone on it and a light at the top, and it is how you find
    // the house from the rim.
    {
      const tx=12, tz=-214, TH=H*1.05;
      parts.push(bx(tx,tz,g0-16,18,18,18,m.stone));
      parts.push(bx(tx,tz,g0,15,TH,15,m.wall));
      for(const sd of [-1,1])for(const q of [-1,1])
        parts.push(bx(tx+sd*7.2,tz+q*7.2,g0,0.7,TH,0.7,m.beam));
      for(let i=0;i<4;i++){                                     // a band of lights at each floor
        const [ax,ay,az]=at(tx-7.6,tz,g0+6+i*7);
        arch(parts,m.pale,ax,ay,az,2.2,4.6,A+Math.PI/2,0.2);
      }
      parts.push(bx(tx,tz,g0+TH,17.5,1.1,17.5,m.beam));
      {const [cx2,cy2,cz2]=at(tx,tz,g0+TH+1.1);
       const cone=new THREE.Mesh(new THREE.ConeGeometry(13,TH*0.62,8),m.copper);
       cone.position.set(cx2,cy2+TH*0.31,cz2);cone.rotation.y=Math.PI/8;parts.push(cone);
       const f=new THREE.Mesh(new THREE.ConeGeometry(0.7,7,5),m.gilt);
       f.position.set(cx2,cy2+TH*0.62+3.2,cz2);parts.push(f);}
    }

    // ---- the court ----
    // At the upper end, walled on three sides and open to the valley, with a fountain in it and the arch
    // you come in by. This is the only piece of the house that is symmetrical about anything.
    {
      const cxp=26, czp=-250;
      const [fx,fy,fz]=at(cxp,czp,g0);
      const floor=new THREE.Mesh(new THREE.CylinderGeometry(24,24,0.8,24),m.pale);
      floor.position.set(fx,fy+0.4,fz);parts.push(floor);
      for(let k=0;k<11;k++){
        const a=Math.PI*0.18+k/10*Math.PI*1.3;
        const px=cxp+Math.cos(a)*22, pz=czp+Math.sin(a)*22;
        parts.push(bx(px,pz,g0+0.8,1.5,6.5,1.5,m.pale));
        if(k<10){
          const a2=Math.PI*0.18+(k+0.5)/10*Math.PI*1.3;
          const [ax,ay,az]=at(cxp+Math.cos(a2)*22,czp+Math.sin(a2)*22,g0+0.8);
          arch(parts,m.pale,ax,ay,az,3.4,7.4,A-a2,0.26);
        }
      }
      // the fountain: a basin, a stem and the water standing in it
      const basin=new THREE.Mesh(new THREE.CylinderGeometry(4.4,5,1.7,16),m.pale);
      basin.position.set(fx,fy+1.6,fz);parts.push(basin);
      const waterM=new THREE.MeshPhongMaterial({color:0x6fa0ac,specular:0xffffff,shininess:90,transparent:true,opacity:0.85});
      const water=new THREE.Mesh(new THREE.CylinderGeometry(4.0,4.0,0.4,16),waterM);
      water.position.set(fx,fy+2.4,fz);parts.push(water);
      parts.push(box(fx,fy+2.4,fz,1.1,3.4,1.1,m.pale));
      const jet=new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.6,4.4,8),waterM);
      jet.position.set(fx,fy+6.6,fz);jet.userData.noWire=true;scene.add(jet);
      animHooks.push(now=>{const t=now*0.002;jet.scale.y=0.9+0.14*Math.sin(t);jet.position.y=fy+6.6+0.35*Math.sin(t);});
    }

    const byMat=new Map();
    for(const q of parts){let a=byMat.get(q.material);if(!a){a=[];byMat.set(q.material,a);}a.push(q);}
    const merged=[];for(const [mat,list] of byMat)merged.push(mergeParts(list,mat));
    return group(L,merged);},

  hallfire(L,x,z){
    // ---- the Hall of Fire ----
    // One room, and the largest roof in the valley: a hearth at each end, the span carried on two rows of
    // posts, and the whole of the valley side open onto a gallery. Lit from inside at every hour, which is
    // most of what it contributes to the view from anywhere else.
    const H=L.height||22, g0=gh(x,z), A=L.turn||0, parts=[];
    const m=M();
    const at=(u,v,y)=>[x+u*Math.cos(A)-v*Math.sin(A),y,z+u*Math.sin(A)+v*Math.cos(A)];
    const bx=(u,v,y,w,h,d,mat)=>{const [px,py,pz]=at(u,v,y);const b=box(px,py,pz,w,h,d,mat);b.rotation.y=-A;return b;};
    const W=32,D=62;
    parts.push(bx(0,0,g0-15,W*1.06,17,D*1.04,m.stone));
    parts.push(bx(0,0,g0+2,W,H*0.46,D,m.wall));
    for(let i=0;i<12;i++){
      const vv=-D/2+3+i*(D-6)/11;
      for(const sd of [-1,1])parts.push(bx(sd*W*0.47,vv,g0+2,0.8,H*0.46,0.8,m.beam));
    }
    parts.push(bx(0,0,g0+2+H*0.46,W*1.1,1.1,D*1.06,m.beam));
    {
      const [px,py,pz]=at(0,0,g0+2+H*0.46+0.7);
      const h2=roof(parts,m.copper,px,py,pz,D*1.04,W*1.12,1.45,A+Math.PI/2);
      for(const sd of [-1,1]){
        const [gx,gy,gz]=at(0,sd*D*0.52,g0+2+H*0.46+0.7);
        gableEnd(parts,m,gx,gy,gz,W*1.12,h2,A+Math.PI/2,sd,true);
        parts.push(bx(0,sd*D*0.51,g0+2+H*0.46+h2*0.34,W*0.52,h2*0.5,0.4,m.beam));
        // a great pointed light in each gable, which is what you see lit from across the valley
        const [ax,ay,az]=at(0,sd*D*0.5,g0+2+H*0.46+1.2);
        arch(parts,m.pale,ax,ay,az,W*0.34,h2*0.62,A+Math.PI/2,0.3);
        parts.push(bx(0,sd*D*0.49,g0+2+H*0.46+1.6,W*0.3,h2*0.5,0.3,m.glass));
      }
      // a louvre over the ridge, because there are two open fires under it
      parts.push(bx(0,0,g0+2+H*0.46+h2*0.92,4.4,2.4,10,m.copper));
      const [lx,ly,lz]=at(0,0,g0+2+H*0.46+h2*0.92+2.4);
      roof(parts,m.copper,lx,ly,lz,11,5,1.2,A+Math.PI/2);
    }
    // the two hearths, and the light out of them
    const fireM=new THREE.MeshBasicMaterial({color:0xffa844,transparent:true,opacity:0.92,depthWrite:false});
    const fires=[];
    for(const sd of [-1,1]){
      parts.push(bx(W*0.3,sd*D*0.34,g0+2,6.5,H*0.4,6.5,m.stone));
      parts.push(bx(W*0.3,sd*D*0.34,g0+2+H*0.4,2.6,H*0.75,2.6,m.stone));
      const [px,py,pz]=at(W*0.24,sd*D*0.34,g0+4);
      const f=new THREE.Mesh(new THREE.ConeGeometry(2.1,4.6,6),fireM);
      f.position.set(px,py,pz);f.userData.noWire=true;scene.add(f);
      const lamp=new THREE.PointLight(0xffa040,0,80);lamp.position.set(px,py+4,pz);scene.add(lamp);
      fires.push({f,lamp,ph:sd});
    }
    // the gallery, out over the water, on its arcade
    parts.push(bx(-W*0.5-7,0,g0+1,15,0.9,D*0.92,m.beam));
    {
      const [cx2,cy2,cz2]=at(-W*0.5-12,0,g0+1.9);
      colonnade(parts,m,cx2,cy2,cz2,D*0.88,10,H*0.46,A+Math.PI/2);
      const [rx,ry,rz]=at(-W*0.5-13.2,0,g0+1.9);
      rail(parts,m,rx,ry,rz,D*0.9,A+Math.PI/2);
    }
    for(let i=0;i<7;i++){
      const vv=-D*0.42+i*(D*0.84/6);
      const [px,py,pz]=at(-W*0.5-12,vv,g0-16);
      const p=new THREE.Mesh(new THREE.BoxGeometry(0.9,18,0.9).translate(0,9,0),m.beam);
      p.position.set(px,py,pz);p.rotation.set(0,-A,0.05);parts.push(p);
    }
    const g=group(L,(()=>{const byMat=new Map();
      for(const q of parts){let a=byMat.get(q.material);if(!a){a=[];byMat.set(q.material,a);}a.push(q);}
      const merged=[];for(const [mat,list] of byMat)merged.push(mergeParts(list,mat));return merged;})());
    animHooks.push(now=>{const n=nightF(hour());
      const fl=0.75+0.25*Math.sin(now*0.004);
      fireM.opacity=0.7+0.3*fl;
      for(const q of fires){q.f.scale.set(0.9+0.2*Math.sin(now*0.006+q.ph),0.8+0.4*Math.sin(now*0.009+q.ph),1);
        q.lamp.intensity=(1.6+2.0*n)*fl;}});
    return g;},

  pavilion(L,x,z){
    // ---- a pavilion ----
    // The thing this place has that no other settlement here does: a roof on posts, standing on its own at
    // the end of a spur or over a pool, with nothing in it. Eight sides, a steep cone, a finial, and a seat
    // round the inside. There are a number of them and they are what make the valley read as built for
    // pleasure rather than for shelter.
    const g0=gh(x,z), A=L.turn||0, parts=[], R0=L.size||9, H=L.height||9;
    const m=M();
    const floor=new THREE.Mesh(new THREE.CylinderGeometry(R0,R0*1.06,0.9,8),m.pale);
    floor.position.set(x,g0+0.45,z);floor.rotation.y=A;parts.push(floor);
    const step=new THREE.Mesh(new THREE.CylinderGeometry(R0*1.2,R0*1.26,0.5,8),m.pale);
    step.position.set(x,g0+0.1,z);step.rotation.y=A;parts.push(step);
    for(let k=0;k<8;k++){
      const a=A+k/8*Math.PI*2;
      const px=x+Math.cos(a)*R0*0.86, pz=z+Math.sin(a)*R0*0.86;
      parts.push(box(px,g0+0.9,pz,0.38,H,0.38,m.beam));
      parts.push(box(px,g0+0.9+H-0.35,pz,0.66,0.35,0.66,m.pale));
      // a pointed arch between each pair of posts, and a seat under it
      const a2=A+(k+0.5)/8*Math.PI*2;
      const [ax,az]=[x+Math.cos(a2)*R0*0.86,z+Math.sin(a2)*R0*0.86];
      arch(parts,m.beam,ax,g0+0.9,az,R0*0.72,H*0.92,-a2+Math.PI/2,0.22);
      const seat=new THREE.Mesh(new THREE.BoxGeometry(R0*0.66,0.22,0.9),m.beam);
      seat.position.set(x+Math.cos(a2)*R0*0.66,g0+1.4,z+Math.sin(a2)*R0*0.66);
      seat.rotation.y=-a2+Math.PI/2;parts.push(seat);
    }
    const eave=new THREE.Mesh(new THREE.CylinderGeometry(R0*1.18,R0*1.18,0.5,8),m.beam);
    eave.position.set(x,g0+0.9+H,z);eave.rotation.y=A;parts.push(eave);
    const cone=new THREE.Mesh(new THREE.ConeGeometry(R0*1.2,H*1.25,8),L.copper===false?m.slate:m.copper);
    cone.position.set(x,g0+0.9+H+H*0.625,z);cone.rotation.y=A+Math.PI/8;parts.push(cone);
    const fin=new THREE.Mesh(new THREE.ConeGeometry(0.42,H*0.5,5),m.gilt);
    fin.position.set(x,g0+0.9+H+H*1.25+H*0.2,z);parts.push(fin);
    const byMat=new Map();
    for(const q of parts){let a=byMat.get(q.material);if(!a){a=[];byMat.set(q.material,a);}a.push(q);}
    const merged=[];for(const [mat,list] of byMat)merged.push(mergeParts(list,mat));
    return group(L,merged);},

  stair(L,x,z){
    // ---- a stair ----
    // The valley is vertical and the only way anybody gets about in it is on foot, so the stairs are
    // architecture rather than plumbing: flights of dressed stone switching back down the wall, a landing
    // at every turn with a newel post on it, and a balustrade on the outside the whole way.
    const A=L.turn||0, parts=[], m=M();
    const flights=L.flights||5, rise=L.rise||9, run=L.run||13, wide=L.wide||3.4;
    const at=(u,v,y)=>[x+u*Math.cos(A)-v*Math.sin(A),y,z+u*Math.sin(A)+v*Math.cos(A)];
    let y=gh(x,z), u=0, dir=1;
    for(let f=0;f<flights;f++){
      const n=Math.max(6,Math.round(rise/0.42));
      for(let k=0;k<n;k++){
        const v=dir*((k/n)*run-run*0.5), yy=y-rise*(k/n);
        const [px,py,pz]=at(u,v,yy);
        const s=box(px,py,pz,wide,0.42,run/n*1.5,m.pale);s.rotation.y=-A;parts.push(s);
        if(k%3===0){                                          // the balustrade on the drop side
          const [rx,ry,rz]=at(u-wide*0.5,v,yy);
          parts.push(box(rx,ry,rz,0.16,1.0,0.16,m.pale));
          const [tx,ty,tz]=at(u-wide*0.5,v,yy+1.0);
          const t2=box(tx,ty,tz,0.24,0.16,run/n*4.5,m.pale);t2.rotation.set(0,-A,0);
          t2.rotateX(-dir*Math.atan2(rise/n*3,run/n*3));parts.push(t2);
        }
      }
      // the landing, and the newel post on the corner of it
      y-=rise;
      const [lx,ly,lz]=at(u+wide*0.5,dir*run*0.5+dir*wide*0.5,y);
      const land=box(lx,ly,lz,wide*2.2,0.5,wide*1.6,m.pale);land.rotation.y=-A;parts.push(land);
      const [nx,ny,nz]=at(u+wide*1.2,dir*run*0.5+dir*wide*0.7,y);
      parts.push(box(nx,ny,nz,0.5,2.4,0.5,m.pale));
      const nf=new THREE.Mesh(new THREE.ConeGeometry(0.42,1.3,5),m.gilt);
      nf.position.set(nx,ny+2.6,nz);parts.push(nf);
      u+=wide*1.8;dir=-dir;
    }
    const byMat=new Map();
    for(const q of parts){let a=byMat.get(q.material);if(!a){a=[];byMat.set(q.material,a);}a.push(q);}
    const merged=[];for(const [mat,list] of byMat)merged.push(mergeParts(list,mat));
    return group(L,merged);},

  statue(L,x,z){
    // ---- a figure on a plinth ----
    // Nothing here has a face - a massing model cannot carve one and a bad one is worse than none. What it
    // has is the silhouette: a tall standing figure, robed, on a stepped plinth, at the head of a stair or
    // the end of a terrace. Half of them are holding something up.
    const g0=gh(x,z), A=L.turn||0, parts=[], m=M(), S=L.size||1;
    for(let k=0;k<3;k++){
      const w=(3.4-k*0.5)*S;
      parts.push(box(x,g0+k*0.5*S,z,w,0.55*S,w,m.pale));
    }
    const body=new THREE.Mesh(new THREE.CylinderGeometry(0.62*S,1.05*S,5.2*S,8).translate(0,2.6*S,0),m.pale);
    body.position.set(x,g0+1.5*S,z);body.rotation.y=A;parts.push(body);
    const head=new THREE.Mesh(new THREE.SphereGeometry(0.55*S,8,6),m.pale);
    head.position.set(x,g0+7.2*S,z);parts.push(head);
    for(const sd of [-1,1]){                                   // the arms, one of them raised
      const up=sd>0&&(L.raised!==false);
      const arm=new THREE.Mesh(new THREE.BoxGeometry(0.34*S,up?3.4*S:2.8*S,0.34*S).translate(0,up?1.7*S:-1.4*S,0),m.pale);
      arm.position.set(x+Math.cos(A)*sd*0.8*S,g0+6.2*S,z+Math.sin(A)*sd*0.8*S);
      arm.rotation.set(0,A,sd*0.18);parts.push(arm);
    }
    if(L.raised!==false){                                      // and what it is holding up
      const st=new THREE.Mesh(new THREE.ConeGeometry(0.5*S,1.6*S,5),m.gilt);
      st.position.set(x+Math.cos(A)*0.8*S,g0+9.6*S,z+Math.sin(A)*0.8*S);parts.push(st);
    }
    const byMat=new Map();
    for(const q of parts){let a=byMat.get(q.material);if(!a){a=[];byMat.set(q.material,a);}a.push(q);}
    const merged=[];for(const [mat,list] of byMat)merged.push(mergeParts(list,mat));
    return group(L,merged);},

  bridge(L,x,z){
    // ---- a bridge ----
    // A single span on two piers, the deck a shallow arch, a balustrade down each side and a lamp standard
    // at each end. No parapet worth the name in the middle of it, because it was built by people who are
    // not worried about falling off things.
    const g0=gh(x,z), A=L.turn||0, parts=[];
    const m=M();
    const at=(u,v,y)=>[x+u*Math.cos(A)-v*Math.sin(A),y,z+u*Math.sin(A)+v*Math.cos(A)];
    const SPAN=L.span||110, W=L.wide||5.5;
    for(const sd of [-1,1]){
      const [px,py,pz]=at(sd*SPAN*0.46,0,g0-34);
      const p=new THREE.Mesh(new THREE.BoxGeometry(9,46,W*2.2).translate(0,23,0),m.stone);
      p.position.set(px,py,pz);p.rotation.y=-A;parts.push(p);
      // the pier is buttressed and it has a pointed relieving arch in it
      const [ax,ay,az]=at(sd*SPAN*0.46,0,g0-2);
      arch(parts,m.pale,ax,ay,az,W*1.6,9,A+Math.PI/2,0.5);
    }
    const RISE=9;
    for(let k=0;k<19;k++){
      const t=k/18, u=(t-0.5)*SPAN;
      const y=g0+4+RISE*Math.sin(t*Math.PI);
      const [px,py,pz]=at(u,0,y);
      const d=box(px,py,pz,SPAN/18*1.12,0.7,W,m.pale);
      d.rotation.set(0,-A,0);d.rotateZ(Math.cos(t*Math.PI)*0.2);parts.push(d);
    }
    for(const sd of [-1,1]){
      for(let k=0;k<19;k++){
        const t=k/18, u=(t-0.5)*SPAN;
        const y=g0+4+RISE*Math.sin(t*Math.PI);
        const [px,py,pz]=at(u,sd*W*0.46,y);
        if(k%2===0)parts.push(box(px,py,pz,0.18,1.0,0.18,m.pale));
        const [tx,ty,tz]=at(u,sd*W*0.46,y+1.0);
        const r=box(tx,ty,tz,SPAN/18*1.1,0.2,0.3,m.pale);
        r.rotation.set(0,-A,0);r.rotateZ(Math.cos(t*Math.PI)*0.2);parts.push(r);
      }
      // the lamp standards at the ends
      for(const fr of [-1,1]){
        const [lx,ly,lz]=at(fr*SPAN*0.44,sd*W*0.46,g0+4+RISE*Math.sin(0.06*Math.PI));
        parts.push(box(lx,ly,lz,0.3,4.2,0.3,m.beam));
        const cap=new THREE.Mesh(new THREE.ConeGeometry(0.62,1.2,5),m.gilt);
        cap.position.set(lx,ly+4.8,lz);parts.push(cap);
      }
    }
    const byMat=new Map();
    for(const q of parts){let a=byMat.get(q.material);if(!a){a=[];byMat.set(q.material,a);}a.push(q);}
    const merged=[];for(const [mat,list] of byMat)merged.push(mergeParts(list,mat));
    return group(L,merged);},

  ford(L,x,z){
    // ---- the Ford of Bruinen ----
    // Gravel, shallow water going fast over it, and a line of worn stones either side where the road comes
    // down and goes up again. The valley's defence is that you have to stand in this to get in.
    const parts=[], FR=mkRng(1417), m=M();
    const gravel=new THREE.MeshLambertMaterial({color:0x8e8878,flatShading:true});
    for(let k=0;k<180;k++){
      const px=x+(FR()-0.5)*440, pz=z+(FR()-0.5)*240;
      const s=1.2+FR()*4.4;
      const b=box(px,gh(px,pz)-0.4,pz,s*1.6,s*0.5,s*1.3,FR()<0.4?m.stone:gravel);
      b.rotation.y=FR()*3;parts.push(b);
    }
    for(const sd of [-1,1])for(let k=0;k<4;k++){
      const px=x+sd*(140+k*30), pz=z+(k-1.5)*46;
      const h=3.4+FR()*3.4;
      const s=new THREE.Mesh(new THREE.BoxGeometry(2.4,h,1.7).translate(0,h/2,0),m.pale);
      s.position.set(px,gh(px,pz),pz);s.rotation.set((FR()-0.5)*0.1,FR()*3,(FR()-0.5)*0.12);parts.push(s);
    }
    const byMat=new Map();
    for(const q of parts){let a=byMat.get(q.material);if(!a){a=[];byMat.set(q.material,a);}a.push(q);}
    const merged=[];for(const [mat,list] of byMat)merged.push(mergeParts(list,mat));
    return group(L,merged);},

  falls(L,x,z){
    // ---- the falls ----
    // The streams come over the rim and do not touch the wall again until the bottom. Each one is a sheet of
    // white with a plume of mist at the foot of it and a slower veil where the wind takes it sideways. The
    // noise of them is the reason nobody in the house speaks quietly.
    const g0=gh(x,z), A=L.turn||0, parts=[];
    const whiteM=new THREE.MeshLambertMaterial({color:0xe8f0f2,transparent:true,opacity:0.82,side:THREE.DoubleSide});
    const mistM=new THREE.MeshLambertMaterial({color:0xdce8ea,transparent:true,opacity:0.16,depthWrite:false});
    const sheets=[],mists=[];
    const N=L.count||6;
    for(let k=0;k<N;k++){
      const u=(k-(N-1)/2)*((L.spread||900)/N)+((k*37)%11-5)*8;
      const px=x+u*Math.cos(A), pz=z+u*Math.sin(A);
      const top=gh(px,pz);
      let fx=px,fz=pz,foot=top;
      for(let i=1;i<=26;i++){
        const qx=px-Math.sin(A)*i*14, qz=pz+Math.cos(A)*i*14;
        const h=gh(qx,qz);
        if(h<foot){foot=h;fx=qx;fz=qz;}
      }
      const drop=Math.max(30,top-foot);
      const w=6+((k*53)%7);
      const sheet=new THREE.Mesh(new THREE.PlaneGeometry(w,drop,1,6),whiteM);
      sheet.position.set((px+fx)/2,top-drop/2,(pz+fz)/2);
      sheet.rotation.set(0,-A+Math.PI/2,0);
      sheet.userData.noWire=true;scene.add(sheet);
      sheets.push({sheet,base:sheet.geometry.attributes.position.array.slice(),ph:k*1.7});
      for(let i=0;i<4;i++){
        const p=new THREE.Mesh(new THREE.SphereGeometry(7+i*4,8,6),mistM);
        p.position.set(fx,foot+6+i*7,fz);p.userData.noWire=true;scene.add(p);
        mists.push({p,x:fx,y:foot,z:fz,ph:(i+k)/4});
      }
    }
    animHooks.push(now=>{
      const t=now*0.001;
      for(const q of sheets){
        const pos=q.sheet.geometry.attributes.position,b=q.base;
        for(let i=0;i<pos.count;i++){
          const py=b[i*3+1];
          pos.array[i*3+2]=b[i*3+2]+Math.sin(t*3.4+q.ph+py*0.12)*0.9;
        }
        pos.needsUpdate=true;
      }
      for(const q of mists){
        const u=((t*0.12)+q.ph)%1;
        q.p.position.set(q.x+u*10,q.y+6+u*44,q.z+u*6);
        q.p.scale.setScalar(0.6+u*2.4);
        q.p.material.opacity=0.18*(1-u*0.8);
      }
    });
    return group(L,parts.length?parts:[box(x,g0,z,1,1,1,whiteM)]);},

  };
}
