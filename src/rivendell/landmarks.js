// The five things in the cleft that are not just another hall. Fan work - every shape is this project's own
// low-poly geometry, modelled from the description, and no assets from any book, film or game are used.
// Tolkien's world belongs to the Tolkien Estate.
//
// The character of this architecture, as far as a massing model can carry it: everything is LONG and LOW and
// has a very steep roof; nothing is symmetrical about a front door, because there is no front - the building
// grew along a ledge; every room that can have a gallery over the drop has one; and the structure is timber
// on stone, so the stone is the ground floor and everything above it is posts and beams.
import { mkRng } from '../core/rng.js';

export function landmarks(api){
  const {THREE,ctx,animHooks,scene,nightF,hour,box,group,gh,mergeParts}=api;

  // the palette the whole valley is built from
  const M=()=>({
    beam:new THREE.MeshLambertMaterial({color:0x7a6a4e,flatShading:true}),
    dark:new THREE.MeshLambertMaterial({color:0x5a4c38,flatShading:true}),
    wall:new THREE.MeshLambertMaterial({color:0xcfc6ae,flatShading:true}),
    stone:new THREE.MeshLambertMaterial({color:0xa49d8e,flatShading:true}),
    slate:new THREE.MeshLambertMaterial({color:0x6a6f6a,flatShading:true}),
    copper:new THREE.MeshLambertMaterial({color:0x5f8a72,flatShading:true}),
    glass:new THREE.MeshPhongMaterial({color:0x3d4a3f,specular:0xd8e4d0,shininess:70}),
  });

  // a steep roof over a rectangle: two slopes meeting at a ridge, with the eaves well out past the wall
  function roof(parts,mat,x,y,z,w,d,pitch,A){
    const h=d*0.5*pitch;
    for(const sd of [-1,1]){
      const slope=new THREE.Mesh(new THREE.BoxGeometry(w*1.12,0.6,Math.hypot(d*0.62,h)),mat);
      slope.position.set(x,y+h/2,z+sd*d*0.29);
      slope.rotation.set(sd*Math.atan2(h,d*0.62),-A,0);
      slope.position.applyAxisAngle(new THREE.Vector3(0,1,0),0);
      parts.push(slope);
    }
    const ridge=box(x,y+h,z,w*1.14,0.7,0.9,mat);ridge.rotation.y=-A;parts.push(ridge);
    return h;
  }

  return {

  house(L,x,z){
    // ---- the Last Homely House ----
    // Six halls of different sizes joined end to end along the ledge, stepping down it, each with its own
    // roof and its own gallery hanging over the water. The whole thing is a corridor with rooms off it and
    // a view on one side, which is what a house built on a shelf has to be.
    const H=L.height||34, g0=gh(x,z), A=L.turn||0, parts=[], RR=mkRng(3441);
    const m=M();
    const at=(u,v,y)=>[x+u*Math.cos(A)-v*Math.sin(A),y,z+u*Math.sin(A)+v*Math.cos(A)];
    const bx=(u,v,y,w,h,d,mat)=>{const [px,py,pz]=at(u,v,y);const b=box(px,py,pz,w,h,d,mat);b.rotation.y=-A;return b;};

    let v=-150;                                        // along the ledge, running down the valley
    for(let k=0;k<6;k++){
      const w=26+RR()*16, d=48+RR()*34, drop=k*3.2;
      const y=g0-drop;
      // the stone undercroft: the ground under this is falling away, so the downhill side is all wall
      parts.push(bx(0,v,y-14,w*1.04,16,d*1.02,m.stone));
      // the hall itself
      parts.push(bx(0,v,y+2,w,H*0.34,d,m.wall));
      // the posts and the beam under the eaves
      for(let i=0;i<Math.round(d/7);i++){
        const vv=v-d/2+4+i*7;
        for(const sd of [-1,1])parts.push(bx(sd*w*0.5,vv,y+2,0.8,H*0.34,0.8,m.beam));
      }
      parts.push(bx(0,v,y+2+H*0.34,w*1.1,1.1,d*1.06,m.beam));
      // the roof, steep
      {const [px,py,pz]=at(0,v,y+2+H*0.34+0.6);
       roof(parts,m.slate,px,py,pz,d*1.02,w*1.1,1.15,A+Math.PI/2);}
      // the gallery over the drop, on the valley side
      parts.push(bx(-w*0.5-5,v,y+1,11,0.8,d*0.86,m.beam));
      for(let i=0;i<Math.round(d/5);i++){
        const vv=v-d*0.43+i*5;
        parts.push(bx(-w*0.5-10,vv,y+1.6,0.5,3.2,0.5,m.beam));
        parts.push(bx(-w*0.5-10,vv,y+4.4,0.5,0.4,5,m.beam));
      }
      // and the posts that hold it up out of nothing
      for(let i=0;i<Math.round(d/11);i++){
        const vv=v-d*0.4+i*11;
        const [px,py,pz]=at(-w*0.5-10,vv,y-16);
        const p=new THREE.Mesh(new THREE.BoxGeometry(0.9,18,0.9).translate(0,9,0),m.beam);
        p.position.set(px,py,pz);p.rotation.set(0,-A,0.06);parts.push(p);
      }
      // windows: tall, narrow, and on the valley side only
      for(let i=0;i<Math.round(d/6);i++){
        const vv=v-d*0.42+i*6;
        parts.push(bx(-w*0.5+0.2,vv,y+5,0.4,H*0.2,2.4,m.glass));
      }
      // a chimney, because there is a fire in every room of this house
      if(RR()<0.8)parts.push(bx(w*0.3,v+d*0.3,y+2+H*0.34,2.2,H*0.3,2.2,m.stone));
      v+=d+6;
    }
    // the tower at the head of it: not tall, just taller than the rest
    parts.push(bx(10,-190,g0,16,H*0.9,16,m.wall));
    parts.push(bx(10,-190,g0-14,17,16,17,m.stone));
    {const [px,py,pz]=at(10,-190,g0+H*0.9);
     const cone=new THREE.Mesh(new THREE.ConeGeometry(13,H*0.5,6),m.slate);
     cone.position.set(px,py+H*0.25,pz);parts.push(cone);}
    // the courtyard at the top end, walled, with the way in through an arch
    for(let k=0;k<9;k++){
      const a=Math.PI*0.2+k/8*Math.PI*1.2;
      parts.push(bx(30+Math.cos(a)*30,-236+Math.sin(a)*30,g0,9,5,3,m.stone));
    }
    const byMat=new Map();
    for(const q of parts){let a=byMat.get(q.material);if(!a){a=[];byMat.set(q.material,a);}a.push(q);}
    const merged=[];for(const [mat,list] of byMat)merged.push(mergeParts(list,mat));
    return group(L,merged);},

  hallfire(L,x,z){
    // ---- the Hall of Fire ----
    // One room: a hearth at each end, a roof carried on two rows of posts, and the whole of the valley side
    // open onto a gallery. Lit from inside at every hour, which is most of what it contributes to the view.
    const H=L.height||22, g0=gh(x,z), A=L.turn||0, parts=[];
    const m=M();
    const at=(u,v,y)=>[x+u*Math.cos(A)-v*Math.sin(A),y,z+u*Math.sin(A)+v*Math.cos(A)];
    const bx=(u,v,y,w,h,d,mat)=>{const [px,py,pz]=at(u,v,y);const b=box(px,py,pz,w,h,d,mat);b.rotation.y=-A;return b;};
    const W=34,D=66;
    parts.push(bx(0,0,g0-13,W*1.06,15,D*1.04,m.stone));
    parts.push(bx(0,0,g0+2,W,H*0.5,D,m.wall));
    for(let i=0;i<10;i++){
      const vv=-D/2+4+i*(D-8)/9;
      for(const sd of [-1,1])parts.push(bx(sd*W*0.46,vv,g0+2,1.2,H*0.5,1.2,m.beam));
    }
    parts.push(bx(0,0,g0+2+H*0.5,W*1.12,1.4,D*1.08,m.beam));
    {const [px,py,pz]=at(0,0,g0+2+H*0.5+0.8);roof(parts,m.copper,px,py,pz,D*1.04,W*1.12,1.2,A+Math.PI/2);}
    // the two hearths, and the light out of them
    const fireM=new THREE.MeshBasicMaterial({color:0xffa844,transparent:true,opacity:0.92,depthWrite:false});
    const fires=[];
    for(const sd of [-1,1]){
      parts.push(bx(W*0.3,sd*D*0.36,g0+2,7,H*0.42,7,m.stone));
      parts.push(bx(W*0.3,sd*D*0.36,g0+2+H*0.42,3,H*0.6,3,m.stone));
      const [px,py,pz]=at(W*0.24,sd*D*0.36,g0+4);
      const f=new THREE.Mesh(new THREE.ConeGeometry(2.2,5,6),fireM);
      f.position.set(px,py,pz);f.userData.noWire=true;scene.add(f);fires.push({f,ph:sd});
      const lamp=new THREE.PointLight(0xffa040,0,70);lamp.position.set(px,py+4,pz);scene.add(lamp);
      fires[fires.length-1].lamp=lamp;
    }
    // the gallery, out over the water
    parts.push(bx(-W*0.5-7,0,g0+1,15,0.9,D*0.9,m.beam));
    for(let i=0;i<14;i++){
      const vv=-D*0.44+i*(D*0.88/13);
      parts.push(bx(-W*0.5-13,vv,g0+1.6,0.6,3.4,0.6,m.beam));
    }
    const g=group(L,(()=>{const byMat=new Map();
      for(const q of parts){let a=byMat.get(q.material);if(!a){a=[];byMat.set(q.material,a);}a.push(q);}
      const merged=[];for(const [mat,list] of byMat)merged.push(mergeParts(list,mat));return merged;})());
    animHooks.push(now=>{const n=nightF(hour());
      const fl=0.75+0.25*Math.sin(now*0.004);
      fireM.opacity=0.7+0.3*fl;
      for(const q of fires){q.f.scale.set(0.9+0.2*Math.sin(now*0.006+q.ph),0.8+0.4*Math.sin(now*0.009+q.ph),1);
        q.lamp.intensity=(1.4+1.8*n)*fl;}});
    return g;},

  bridge(L,x,z){
    // ---- the bridge ----
    // A single span with no parapet worth the name. Timber on two stone piers, and it looks like something
    // that was put up by people who are not worried about falling off things.
    const g0=gh(x,z), A=L.turn||0, parts=[];
    const m=M();
    const at=(u,v,y)=>[x+u*Math.cos(A)-v*Math.sin(A),y,z+u*Math.sin(A)+v*Math.cos(A)];
    const SPAN=L.span||120;
    for(const sd of [-1,1]){
      const [px,py,pz]=at(sd*SPAN*0.46,0,g0-30);
      const p=new THREE.Mesh(new THREE.BoxGeometry(9,42,13).translate(0,21,0),m.stone);
      p.position.set(px,py,pz);p.rotation.y=-A;parts.push(p);
    }
    // the deck: a shallow arch
    for(let k=0;k<17;k++){
      const t=k/16, u=(t-0.5)*SPAN;
      const y=g0+4+8*Math.sin(t*Math.PI);
      const [px,py,pz]=at(u,0,y);
      const d=box(px,py,pz,SPAN/16*1.1,0.7,5.5,m.beam);
      d.rotation.set(0,-A,Math.cos(t*Math.PI)*0.18);parts.push(d);
      if(k%3===0)for(const sd of [-1,1]){
        const [qx,qy,qz]=at(u,sd*2.6,y);
        parts.push(box(qx,qy,qz,0.4,1.6,0.4,m.beam));
      }
    }
    for(const sd of [-1,1]){
      for(let k=0;k<16;k++){
        const t=(k+0.5)/16, u=(t-0.5)*SPAN;
        const y=g0+5.6+8*Math.sin(t*Math.PI);
        const [px,py,pz]=at(u,sd*2.6,y);
        parts.push(box(px,py,pz,SPAN/16,0.24,0.24,m.beam));
      }
    }
    const byMat=new Map();
    for(const q of parts){let a=byMat.get(q.material);if(!a){a=[];byMat.set(q.material,a);}a.push(q);}
    const merged=[];for(const [mat,list] of byMat)merged.push(mergeParts(list,mat));
    return group(L,merged);},

  ford(L,x,z){
    // ---- the Ford of Bruinen ----
    // Gravel, shallow water going fast over it, and a line of stones on either bank where the road comes
    // down and goes up again. The valley's defence is that you have to stand in this to get in.
    const g0=gh(x,z), parts=[], FR=mkRng(1417);
    const m=M();
    const gravel=new THREE.MeshLambertMaterial({color:0x8e8878,flatShading:true});
    for(let k=0;k<160;k++){
      const px=x+(FR()-0.5)*420, pz=z+(FR()-0.5)*220;
      const s=1.2+FR()*4;
      const b=box(px,gh(px,pz)-0.4,pz,s*1.6,s*0.5,s*1.3,FR()<0.4?m.stone:gravel);
      b.rotation.y=FR()*3;parts.push(b);
    }
    // the markers: worn stones set up either side of the crossing
    for(const sd of [-1,1])for(let k=0;k<3;k++){
      const px=x+sd*(150+k*26), pz=z+(k-1)*44;
      const h=3+FR()*3;
      const s=new THREE.Mesh(new THREE.BoxGeometry(2.2,h,1.6).translate(0,h/2,0),m.stone);
      s.position.set(px,gh(px,pz),pz);s.rotation.set((FR()-0.5)*0.1,FR()*3,(FR()-0.5)*0.12);parts.push(s);
    }
    const byMat=new Map();
    for(const q of parts){let a=byMat.get(q.material);if(!a){a=[];byMat.set(q.material,a);}a.push(q);}
    const merged=[];for(const [mat,list] of byMat)merged.push(mergeParts(list,mat));
    return group(L,merged);},

  falls(L,x,z){
    // ---- the falls ----
    // The streams come over the rim and do not touch the wall again until the bottom. Each one is a sheet of
    // white with a plume of mist at the foot of it and a slower veil where the wind takes it sideways.
    const g0=gh(x,z), A=L.turn||0, parts=[];
    const whiteM=new THREE.MeshLambertMaterial({color:0xe8f0f2,transparent:true,opacity:0.8,side:THREE.DoubleSide});
    const mistM=new THREE.MeshLambertMaterial({color:0xdce8ea,transparent:true,opacity:0.16,depthWrite:false});
    const sheets=[],mists=[];
    const N=L.count||6;
    for(let k=0;k<N;k++){
      const u=(k-(N-1)/2)*((L.spread||900)/N)+((k*37)%11-5)*8;
      const px=x+u*Math.cos(A), pz=z+u*Math.sin(A);
      const top=gh(px,pz);
      // find the foot by walking downhill away from the rim
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
