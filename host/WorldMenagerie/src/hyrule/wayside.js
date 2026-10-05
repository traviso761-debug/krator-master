// ---------- by the wayside: the shrines and the stables ----------
// Fan work: Breath of the Wild belongs to Nintendo; every shape here is this project's own (kit.js).
//
// shrines   each a dark stone bell on a stepped round platform: a glowing ring round its waist and another round its
//           crown, lines of light running down it, an arched doorway in front edged with light, the little pedestal
//           before it - orange if it has not been done, blue if it has
// stables   each a long canvas tent banded in brown, its front a great horse's head on a neck of timber and canvas -
//           ears, mane, blaze, bridle - the doorway under it, lamps either side, the sign; a corral with two horses
//           in it, a cooking pot on its fire, hitching posts
import { kit } from './kit.js';

export function wayside(api){
  const K=kit(api),{THREE,M,mat,glowM,mesh,blk,cyl,cone,sph,dome,limb,lathe,gable,hip,frame,wall,build,hz,rng,gh}=K;
  const PL=api.ctx.plan||{sites:{}};
  const lamp=glowM(0xffc070,1.2);

  return {
  // ================================================================ the shrines
  shrines(L,x,z){
    const parts=[],orange=glowM(0xff8a2a,1),blue=glowM(0x4ad8ff,1);
    for(const s of (PL.shrines||[])){const y=gh(s.x,s.z)-0.2,g=s.blue?blue:orange,a=hz(s.x+s.z)*Math.PI*2,F=frame(s.x,s.z,a),ry=-a;
      parts.push(lathe([[7.4,0],[7.4,0.7],[6.4,0.7],[6.4,1.4],[5.4,1.4],[0.1,1.4]],M.sheikah2,s.x,y,s.z,16));
      parts.push(lathe([[4.9,0],[5.1,1.6],[4.8,3.8],[4.1,5.6],[3,6.9],[2.1,7.4],[2.1,7.0],[0.1,6.9]],M.sheikah,s.x,y+1.4,s.z,16));
      parts.push(mesh(new THREE.TorusGeometry(5.05,0.16,4,24).rotateX(Math.PI/2),g,s.x,y+3.3,s.z),mesh(new THREE.TorusGeometry(2.1,0.14,4,18).rotateX(Math.PI/2),g,s.x,y+8.85,s.z),
        mesh(new THREE.CircleGeometry(1.1,14).rotateX(-Math.PI/2),g,s.x,y+8.35,s.z));
      for(let k=0;k<6;k++){const b=k/6*Math.PI*2+a+0.5;if(Math.abs(Math.sin((b-a)/2))<0.3)continue;parts.push(limb([s.x+Math.cos(b)*5,y+3.3,s.z+Math.sin(b)*5],[s.x+Math.cos(b)*3.1,y+8.2,s.z+Math.sin(b)*3.1],0.09,0.09,g,4));}
      // the doorway on the front (+u), edged with light, and the pedestal before it
      const [dx,dz]=F(4.7,0);parts.push(blk(dx,y+1.4,dz,1.2,3.6,3,M.dark,ry),blk(dx+Math.cos(a)*0.62,y+5,dz+Math.sin(a)*0.62,0.12,0.22,3.3,g,ry));
      for(const w of [-1.6,1.6]){const [ex,ez]=F(5.3,w);parts.push(blk(ex,y+1.4,ez,0.12,3.6,0.22,g,ry));}
      const [px,pz]=F(8.6,0);parts.push(cyl(px,y+0.7,pz,0.7,0.5,1.5,M.sheikah,8),blk(px,y+2.2,pz,1.3,0.25,1,M.sheikah2,ry),blk(px,y+2.46,pz,0.6,0.04,0.5,g,ry));}
    return build(L,parts);
  },

  // ================================================================ the stables
  stables(L,x,z){
    const parts=[],tan=mat(0xc89a62),mane=mat(0x8a3a2a),band=mat(0x8a5a3a),coat=[mat(0x8a5a3a),mat(0x5a3a2a),mat(0xe8e0d0)];
    for(const s of (PL.stables||[])){const y=gh(s.x,s.z)-0.2,a=hz(s.x)*Math.PI*2,F=frame(s.x,s.z,a),ry=-a,R=rng(s.x+s.z);
      // the tent: a half-drum of canvas along u, banded, its back closed
      const tent=mesh(new THREE.CylinderGeometry(9,9,24,14,1,true,0,Math.PI).rotateZ(Math.PI/2),M.cloth,s.x,y,s.z,ry);parts.push(tent);
      for(let k=-2;k<=2;k++){const [bx,bz]=F(k*5,0);const r=mesh(new THREE.TorusGeometry(9.05,0.22,4,16,Math.PI).rotateY(Math.PI/2),band,bx,y,bz,ry);parts.push(r);}
      {const [ex,ez]=F(-12,0);parts.push(mesh(new THREE.CircleGeometry(9,14,0,Math.PI).rotateY(-Math.PI/2),M.cloth2,ex,y,ez,ry));}
      // the front: the doorway, and over it the great head on its neck
      const [fx,fz]=F(12,0);parts.push(mesh(new THREE.CircleGeometry(9,14,0,Math.PI).rotateY(Math.PI/2),M.cloth,fx,y,fz,ry),blk(fx+Math.cos(a)*0.1,y,fz+Math.sin(a)*0.1,0.3,5.4,5,M.dark,ry));
      const [kx,kz]=F(11,0),neck=mesh(new THREE.BoxGeometry(5,13,5.6).translate(0,6.5,0),tan,kx,y+6,kz);neck.rotation.set(0,ry,-0.35,'YXZ');parts.push(neck);
      const [hx,hz_]=F(15.2,0),hy=y+17.6;
      const head=mesh(new THREE.BoxGeometry(8.4,4.4,4.6),tan,hx,hy,hz_);head.rotation.set(0,ry,-0.42,'YXZ');parts.push(head);
      const [mx,mz]=F(18.4,0);const muz=mesh(new THREE.BoxGeometry(3.4,3.2,3.8),tan,mx,hy-2,mz);muz.rotation.set(0,ry,-0.42,'YXZ');parts.push(muz);
      const blaze=mesh(new THREE.BoxGeometry(6.8,0.3,1.2),M.white,hx+Math.cos(a)*0.3,hy+2.3,hz_+Math.sin(a)*0.3);blaze.rotation.set(0,ry,-0.42,'YXZ');parts.push(blaze);
      for(const w of [-1.6,1.6]){const [ex,ez]=F(13.4,w);parts.push(cone(ex,hy+2.2,ez,0.8,2.8,tan,5));const [ix,iz]=F(15.6,w*1.48);parts.push(sph(ix,hy+0.9,iz,0.55,M.black));
        const [sx,sz]=F(17,w*1.5);parts.push(blk(sx,hy-2.4,sz,5,0.4,0.3,M.dark,ry));}
      const [nx,nz]=F(10.4,0);const mn=mesh(new THREE.BoxGeometry(1.6,12,6.4).translate(0,6,0),mane,nx,y+7,nz);mn.rotation.set(0,ry,-0.35,'YXZ');parts.push(mn);
      // lamps either side of the door, the sign on its posts
      for(const w of [-5.4,5.4]){const [lx,lz]=F(13,w);parts.push(blk(lx,y,lz,0.3,4,0.3,M.wood2),blk(lx,y+3.4,lz,0.9,0.9,0.9,lamp));}
      {const [gx,gz]=F(20,7);parts.push(blk(gx,y,gz,0.3,3,0.3,M.wood2),blk(gx,y+2.2,gz,3,1.4,0.25,M.wood3,ry+Math.PI/2));}
      // the corral beside the tent, two horses in it
      const c=[F(-10,13),F(10,13),F(10,30),F(-10,30)];for(let k=0;k<4;k++){const p=c[k],q=c[(k+1)%4],n=6;
        for(let i=0;i<=n;i++){const t=i/n,px=p[0]+(q[0]-p[0])*t,pz=p[1]+(q[1]-p[1])*t;parts.push(blk(px,gh(px,pz)-0.2,pz,0.3,1.6,0.3,M.wood));}
        wall(parts,p,q,0.2,0.18,M.wood,0,Math.min(gh(...p),gh(...q))+1.1);}
      for(let h=0;h<2;h++){const [hx2,hz2]=F(-4+h*8,20+R()*6),hy2=gh(hx2,hz2),hy_=-a+R()*3,m=coat[Math.floor(R()*coat.length)];
        parts.push(blk(hx2,hy2+1.1,hz2,2.4,1,0.8,m,hy_),blk(hx2+Math.cos(-hy_)*1.2,hy2+1.7,hz2+Math.sin(-hy_)*1.2,0.6,1.5,0.5,m,hy_));
        for(const [u,w] of [[0.9,0.3],[0.9,-0.3],[-0.9,0.3],[-0.9,-0.3]]){const c_=Math.cos(-hy_),s_=Math.sin(-hy_);parts.push(blk(hx2+c_*u-s_*w,hy2,hz2+s_*u+c_*w,0.2,1.1,0.2,m,hy_));}}
      // the cooking pot on its fire, the hitching posts
      {const [px,pz]=F(16,-10);parts.push(cyl(px,y,pz,1.2,1.2,0.3,M.rock3,8),cyl(px,y+0.6,pz,1,0.8,1.1,M.iron,10));}
      for(let k=0;k<3;k++){const [px,pz]=F(18+k*3,-4);parts.push(blk(px,y,pz,0.3,1.3,0.3,M.wood2));}}
    return build(L,parts);
  },
  };
}
