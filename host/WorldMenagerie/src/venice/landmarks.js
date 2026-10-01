// Venice: the four things on the skyline that are not a box with a roof on it. Everything else in the city
// is its own mapped footprint - five thousand of them - and the engine draws those; these are the ones a
// massing model gets wrong, because what makes them what they are is a shape rather than a height.
//
// Map data (c) OpenStreetMap contributors, ODbL. The geometry here is this project's own, modelled from
// the published dimensions.
import { mkRng } from '../core/rng.js';

export function landmarks(api){
  const {THREE,ctx,animHooks,scene,nightF,hour,box,group,gh,mergeParts}=api;
  return {

  campanile(L,x,z){   // a brick shaft, a belfry, a spire, and on the big one a gilt angel that turns
    const H=L.height||98.6,g0=gh(x,z),parts=[],A=L.turn||0;
    const brick=new THREE.MeshLambertMaterial({color:0x9c5a44,flatShading:true});
    const stone=new THREE.MeshLambertMaterial({color:0xd8d2c2,flatShading:true});
    const roofM=new THREE.MeshLambertMaterial({color:0x5d6a62,flatShading:true});
    const gold=new THREE.MeshPhongMaterial({color:0xc9a23a,specular:0xfff0c0,shininess:80});
    const W=H*0.125;                                    // they are all about eight times as tall as they are wide
    // the shaft: brick, with the flat pilasters that run its whole height
    const sh=box(x,g0,z,W,H*0.72,W,brick);sh.rotation.y=-A;parts.push(sh);
    for(let k=0;k<4;k++){const a=A+k*Math.PI/2;
      for(const off of [-0.28,0.28]){
        const p=box(x+Math.cos(a)*W*0.5-Math.sin(a)*W*off,g0,z+Math.sin(a)*W*0.5+Math.cos(a)*W*off,
          W*0.09,H*0.72,W*0.09,brick);p.rotation.y=-A;parts.push(p);}}
    // the belfry: an open stage with four arches a side, in stone
    const bell=box(x,g0+H*0.72,z,W*1.12,H*0.15,W*1.12,stone);bell.rotation.y=-A;parts.push(bell);
    const dark=new THREE.MeshLambertMaterial({color:0x2e2a26});
    for(let k=0;k<4;k++){const a=A+k*Math.PI/2;
      for(const off of [-0.22,0.22]){
        const o=box(x+Math.cos(a)*W*0.57-Math.sin(a)*W*off,g0+H*0.76,z+Math.sin(a)*W*0.57+Math.cos(a)*W*off,
          W*0.3,H*0.1,W*0.06,dark);o.rotation.y=-A;parts.push(o);}}
    // the attic and the spire
    const att=box(x,g0+H*0.87,z,W*1.0,H*0.07,W*1.0,stone);att.rotation.y=-A;parts.push(att);
    const spire=new THREE.Mesh(new THREE.ConeGeometry(W*0.66,H*0.2,4).translate(0,H*0.1,0),roofM);
    spire.position.set(x,g0+H*0.94,z);spire.rotation.y=A+Math.PI/4;parts.push(spire);
    const g=group(L,parts);
    if(H>90){   // the angel, which is a weathervane and turns with the wind
      const ang=new THREE.Mesh(new THREE.ConeGeometry(W*0.1,H*0.05,6),gold);
      ang.position.set(x,g0+H*1.06,z);scene.add(ang);
      animHooks.push(now=>{ang.rotation.y=now*0.00011;});
    }
    return g;},

  basilica(L,x,z){   // five domes over a Greek cross, which is the one thing an extruded footprint cannot be
    const H=L.height||43,g0=gh(x,z),parts=[],A=L.turn||0.72;
    const stone=new THREE.MeshLambertMaterial({color:0xcfc4ad,flatShading:true});
    const lead=new THREE.MeshLambertMaterial({color:0x7d8a84,flatShading:true});
    const gold=new THREE.MeshPhongMaterial({color:0xb99a44,specular:0xffe9a8,shininess:70});
    const Wd=H*1.7,Dp=H*1.5;
    const body=box(x,g0,z,Wd,H*0.55,Dp,stone);body.rotation.y=-A;parts.push(body);
    // the five domes: one over the crossing and one over each arm
    const dome=(dx,dz,r)=>{
      const c=Math.cos(-A),s=Math.sin(-A),px=x+dx*c-dz*s,pz=z+dx*s+dz*c;
      const drum=new THREE.Mesh(new THREE.CylinderGeometry(r*0.92,r,H*0.14,14),stone);
      drum.position.set(px,g0+H*0.55+H*0.07,pz);parts.push(drum);
      const d=new THREE.Mesh(new THREE.SphereGeometry(r,16,10,0,Math.PI*2,0,Math.PI/2),lead);
      d.scale.y=1.25;d.position.set(px,g0+H*0.69,pz);parts.push(d);
      const fin=new THREE.Mesh(new THREE.ConeGeometry(r*0.12,r*0.5,8),gold);
      fin.position.set(px,g0+H*0.69+r*1.3,pz);parts.push(fin);
    };
    const R0=H*0.32;
    dome(0,0,R0*1.15);dome(Wd*0.3,0,R0);dome(-Wd*0.3,0,R0);dome(0,Dp*0.3,R0);dome(0,-Dp*0.3,R0);
    return group(L,parts);},

  salute(L,x,z){   // the great dome, the small one, and the sixteen scrolls that hold the big one down
    const H=L.height||60,g0=gh(x,z),parts=[],A=L.turn||0;
    const stone=new THREE.MeshLambertMaterial({color:0xd9d3c4,flatShading:true});
    const lead=new THREE.MeshLambertMaterial({color:0x8a938c,flatShading:true});
    const oct=new THREE.Mesh(new THREE.CylinderGeometry(H*0.55,H*0.6,H*0.42,8).translate(0,H*0.21,0),stone);
    oct.position.set(x,g0,z);oct.rotation.y=A;parts.push(oct);
    const drum=new THREE.Mesh(new THREE.CylinderGeometry(H*0.34,H*0.36,H*0.16,16),stone);
    drum.position.set(x,g0+H*0.5,z);parts.push(drum);
    const dome=new THREE.Mesh(new THREE.SphereGeometry(H*0.34,18,12,0,Math.PI*2,0,Math.PI/2),lead);
    dome.scale.y=1.05;dome.position.set(x,g0+H*0.58,z);parts.push(dome);
    const lant=new THREE.Mesh(new THREE.CylinderGeometry(H*0.07,H*0.09,H*0.14,10),stone);
    lant.position.set(x,g0+H*0.92,z);parts.push(lant);
    // the scrolls: sixteen of them, one to each buttress, which is what the building is famous for
    for(let k=0;k<16;k++){const a=A+k/16*Math.PI*2;
      const s=new THREE.Mesh(new THREE.TorusGeometry(H*0.06,H*0.022,5,10,Math.PI),stone);
      s.position.set(x+Math.cos(a)*H*0.46,g0+H*0.44,z+Math.sin(a)*H*0.46);
      s.rotation.set(0,-a,Math.PI/2);parts.push(s);
      parts.push(box(x+Math.cos(a)*H*0.5,g0+H*0.42,z+Math.sin(a)*H*0.5,H*0.05,H*0.1,H*0.05,stone));}
    // the small dome over the sacristy, behind
    const c2=Math.cos(-A),s2=Math.sin(-A),px=x+(-H*0.75)*c2,pz=z+(-H*0.75)*s2;
    parts.push(box(px,g0,pz,H*0.6,H*0.3,H*0.5,stone));
    const d2=new THREE.Mesh(new THREE.SphereGeometry(H*0.2,14,9,0,Math.PI*2,0,Math.PI/2),lead);
    d2.position.set(px,g0+H*0.3,pz);parts.push(d2);
    return group(L,parts);},

  rialto(L,x,z){   // one stone arch over the Grand Canal, with two rows of shops standing on it
    const A=L.turn||0,g0=gh(x,z),parts=[];
    const stone=new THREE.MeshLambertMaterial({color:0xd4cdba,flatShading:true});
    const roofM=new THREE.MeshLambertMaterial({color:0x8a5a46,flatShading:true});
    const SPAN=L.span||28,RISE=L.rise||7.5,W=L.width||22;
    const ux=Math.cos(A),uz=Math.sin(A);
    const N=11;
    for(let k=0;k<N;k++){
      const t=(k+0.5)/N,u=(t-0.5)*SPAN;
      const y=g0+RISE*Math.sin(t*Math.PI)*0.9+1.2;
      const seg=box(x+ux*u,y,z+uz*u,SPAN/N*1.02,2.2,W,stone);seg.rotation.y=-A;parts.push(seg);
      // the arch ring under it
      const arc=box(x+ux*u,y-2.4,z+uz*u,SPAN/N*1.02,1.6,W*0.9,stone);arc.rotation.y=-A;parts.push(arc);
      // the two rows of shops, with the open walk between them
      if(k>0&&k<N-1)for(const sd of [-1,1]){
        const sx=x+ux*u-uz*sd*W*0.3,sz=z+uz*u+ux*sd*W*0.3;
        const sh=box(sx,y+2.2,sz,SPAN/N*0.9,4.2,W*0.28,stone);sh.rotation.y=-A;parts.push(sh);
        const rf=box(sx,y+6.4,sz,SPAN/N*0.95,0.8,W*0.32,roofM);rf.rotation.y=-A;parts.push(rf);
      }
    }
    return group(L,parts);},

  };
}
