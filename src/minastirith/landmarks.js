// Minas Tirith: the three things on the top of the rock that the whole city is arranged around. Fan work -
// every shape is this project's own low-poly geometry, modelled from the description, and no assets from any
// book, film or game are used. Tolkien's world belongs to the Tolkien Estate.
//
// None of this appears in any other city, so it travels with this page rather than living in the shared
// engine, and src/minastirith/main.js hands it to build() as ctx.models.
import { mkRng } from '../core/rng.js';

export function landmarks(api){
  const {THREE,animHooks,scene,nightF,hour,box,group,gh,mergeParts}=api;
  return {

  whitetower(L,x,z){   // the Tower of Ecthelion: fifty fathoms of white stone, and the standard on top of it
    const H=L.height||91,base=L.base!==undefined?L.base:gh(x,z),parts=[],TR=mkRng(3019);
    const white=new THREE.MeshLambertMaterial({color:0xeae4d2});
    const shade=new THREE.MeshLambertMaterial({color:0xd8d1bd});
    const lead=new THREE.MeshLambertMaterial({color:0x6c7278});
    const dark=new THREE.MeshLambertMaterial({color:0x1b1a1f});
    // the shaft: a slender octagon, tapering, with a buttress up each of its faces so it reads as fluted
    const oct=(w,h,mat)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.5,1,8,1).rotateY(Math.PI/8).translate(0,0.5,0),mat);
      m.scale.set(w/0.9239,h,w/0.9239);return m;};
    const plinth=oct(30,10,shade);plinth.position.set(x,base,z);parts.push(plinth);
    const SEG=9;
    for(let k=0;k<SEG;k++){const t0=k/SEG,t1=(k+1)/SEG,w=23-7*t0;
      const s=oct(w,H*(t1-t0)*1.02,k%3===2?shade:white);s.position.set(x,base+10+H*t0*0.92,z);parts.push(s);}
    for(let k=0;k<8;k++){const a=k/8*Math.PI*2+Math.PI/8;
      const b=new THREE.Mesh(new THREE.BoxGeometry(2.4,H*0.86,3.4).translate(0,H*0.43,0),white);
      b.position.set(x+Math.cos(a)*10.5,base+10,z+Math.sin(a)*10.5);b.rotation.y=-a;parts.push(b);
      // the slit windows, which are the only openings in the whole thing
      for(let w2=0;w2<5;w2++){const wy=base+22+w2*H*0.15;
        const win=new THREE.Mesh(new THREE.BoxGeometry(0.9,3.4,0.5),dark);
        win.position.set(x+Math.cos(a)*12.2,wy,z+Math.sin(a)*12.2);win.rotation.y=-a;parts.push(win);}}
    // the crown: a corbelled parapet, eight pinnacles and the flagstaff
    const crown=oct(21,5,shade);crown.position.set(x,base+10+H*0.92,z);parts.push(crown);
    const cap=oct(17,7,white);cap.position.set(x,base+15+H*0.92,z);parts.push(cap);
    for(let k=0;k<8;k++){const a=k/8*Math.PI*2;
      const p=new THREE.Mesh(new THREE.ConeGeometry(2.1,11,6),lead);
      p.position.set(x+Math.cos(a)*8.6,base+22+H*0.92,z+Math.sin(a)*8.6);parts.push(p);}
    const staff=box(x,base+22+H*0.92,z,0.7,17,0.7,lead);parts.push(staff);
    // the banner: black, because Denethor is Steward and there is no king to fly a white tree
    const flagM=new THREE.MeshLambertMaterial({color:0x14131a,side:THREE.DoubleSide});
    const flag=new THREE.Mesh(new THREE.PlaneGeometry(9,5,6,1),flagM);
    flag.position.set(x+4.6,base+33+H*0.92,z);scene.add(flag);
    const pos=flag.geometry.attributes.position,base0=pos.array.slice();
    const merged=[mergeParts(parts.filter(p=>p.material===white),white),
      mergeParts(parts.filter(p=>p.material===shade),shade),
      mergeParts(parts.filter(p=>p.material===lead),lead),
      mergeParts(parts.filter(p=>p.material===dark),dark)];
    const g=group(L,merged);
    animHooks.push(now=>{
      const t=now*0.0016;
      for(let i=0;i<pos.count;i++){const px=base0[i*3];
        pos.array[i*3+2]=base0[i*3+2]+Math.sin(t+px*0.55)*Math.max(0,px+4.5)*0.16;}
      pos.needsUpdate=true;
    });
    return g;},

  whitetree(L,x,z){   // the Court of the Fountain: the sward, the fountain, and the dead tree standing in it
    const base=L.base!==undefined?L.base:gh(x,z),parts=[],TR=mkRng(2931);
    const white=new THREE.MeshLambertMaterial({color:0xe6e0ce});
    const bone=new THREE.MeshLambertMaterial({color:0xd9d3c4});
    const sward=new THREE.MeshLambertMaterial({color:0x5f7a46});
    const waterM=new THREE.MeshPhongMaterial({color:0xaecad8,specular:0xffffff,shininess:90,transparent:true,opacity:0.8});
    // the court itself, walled round, and the pavement of it
    const floor=new THREE.Mesh(new THREE.CylinderGeometry(72,72,1.2,40),white);
    floor.position.set(x,base,z);parts.push(floor);
    const grass=new THREE.Mesh(new THREE.CylinderGeometry(52,52,0.6,36),sward);
    grass.position.set(x,base+1.1,z);parts.push(grass);
    for(let k=0;k<36;k++){const a=k/36*Math.PI*2;
      parts.push(box(x+Math.cos(a)*71,base+1,z+Math.sin(a)*71,3,2.6,3,white));}
    // the fountain: a basin, a jet, and the spray coming off it
    const basin=new THREE.Mesh(new THREE.CylinderGeometry(9,9.6,2.4,20),white);
    basin.position.set(x,base+1.4,z);parts.push(basin);
    const water=new THREE.Mesh(new THREE.CylinderGeometry(8.4,8.4,0.5,20),waterM);
    water.position.set(x,base+3.3,z);parts.push(water);
    const jet=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.9,7,8),waterM);
    jet.position.set(x,base+6.6,z);scene.add(jet);
    // the tree: dead, white, and left standing
    const trunk=new THREE.Mesh(new THREE.CylinderGeometry(0.8,2.1,16,7).translate(0,8,0),bone);
    trunk.position.set(x+13,base+2,z+2);parts.push(trunk);
    const limbs=[];
    const grow=(px,py,pz,ax,ay,az,len,rad,depth)=>{
      const m=new THREE.Mesh(new THREE.CylinderGeometry(rad*0.45,rad,len,6).translate(0,len/2,0),bone);
      m.position.set(px,py,pz);m.rotation.set(ax,ay,az);limbs.push(m);
      if(depth<=0)return;
      const ex=px+Math.sin(az)*len*0.9,ey=py+Math.cos(az)*Math.cos(ax)*len*0.92,ez=pz-Math.sin(ax)*len*0.9;
      for(let k=0;k<2;k++)grow(ex,ey,ez,ax+(TR()-0.5)*0.9,ay+(TR()-0.5)*1.4,az+(TR()-0.5)*1.0,
        len*(0.62+TR()*0.16),rad*0.6,depth-1);
    };
    for(let k=0;k<4;k++)grow(x+13,base+17,z+2,(TR()-0.5)*0.5,TR()*6.28,(TR()-0.5)*0.7,9,1.1,3);
    parts.push(...limbs);
    // the guard of the Citadel, one at each end of the court
    const mail=new THREE.MeshLambertMaterial({color:0x2a2c33});
    for(const s of [-1,1])for(const q of [-1,1]){
      parts.push(box(x+q*40,base+1.7,z+s*40,1,1.9,0.7,mail));
      parts.push(box(x+q*40+0.5,base+2.6,z+s*40,0.16,3.4,0.16,mail));}
    const g=group(L,parts);
    animHooks.push(now=>{const t=now*0.002;jet.scale.y=0.92+0.12*Math.sin(t);jet.position.y=base+6.6+0.4*Math.sin(t);});
    return g;},

  greatgate(L,x,z){   // the gate in the first wall: black stone, and the steel doors standing open
    const H=L.height||34,a=L.turn||0,g0=gh(x,z),parts=[];
    const black=new THREE.MeshLambertMaterial({color:0x3c3b3f});
    const steel=new THREE.MeshPhongMaterial({color:0x585f66,specular:0xaab0b8,shininess:40,flatShading:true});
    const ux=Math.cos(a),uz=Math.sin(a);           // out through the gate
    const vx=-uz,vz=ux;                            // along the wall
    // the two towers either side of the opening, and the arch over it
    for(const s of [-1,1]){
      const tx=x+vx*s*17,tz=z+vz*s*17;
      const t=box(tx,g0-6,tz,22,H+14,20,black);t.rotation.y=-a;parts.push(t);
      const cap=box(tx,g0+H+8,tz,26,4,24,black);cap.rotation.y=-a;parts.push(cap);
      for(let k=0;k<5;k++){const m=box(tx+vx*s*(k-2)*4.6,g0+H+12,tz+vz*s*(k-2)*4.6,3,4,3,black);
        m.rotation.y=-a;parts.push(m);}
    }
    const lintel=box(x,g0+H-6,z,14,10,20,black);lintel.rotation.y=-a;parts.push(lintel);
    // the doors, thrown back against the wall inside
    for(const s of [-1,1]){
      const dx=x-ux*7+vx*s*8.5,dz=z-uz*7+vz*s*8.5;
      const d=new THREE.Mesh(new THREE.BoxGeometry(1.6,H-8,15).translate(0,(H-8)/2,0),steel);
      d.position.set(dx,g0,dz);d.rotation.y=-a+s*0.5;parts.push(d);
    }
    return group(L,parts);},

  };
}
