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
      // the monolith: a tall rounded stone, narrower front to back, the swirl of light on its face and the lines
      // running from it like a circuit; the doorway at its foot edged with light; the ring round the platform
      const PR=[[4.6,0],[4.8,1.4],[4.7,4],[4.3,6.6],[3.6,8.8],[2.6,10.3],[1.3,11.1],[0.1,11.3]];
      const mono=mesh(new THREE.LatheGeometry(PR.map(([r,h])=>new THREE.Vector2(r,h)),18),M.sheikah,s.x,y+1.4,s.z,ry);mono.scale.set(0.8,1,1);parts.push(mono);
      const rAt=h=>{for(let i=0;i+1<PR.length;i++){const [r0,h0]=PR[i],[r1,h1]=PR[i+1];if(h<=h1)return r0+(r1-r0)*(h-h0)/(h1-h0);}return 0.1;};
      const face=(w,h)=>{const r=rAt(h),u=Math.sqrt(Math.max(0.01,r*r-w*w))*0.8+0.06,[px_,pz_]=F(u,w);return new THREE.Vector3(px_,y+1.4+h,pz_);};
      {const pts=[];for(let i=0;i<=40;i++){const t=i/40,an=t*Math.PI*2*1.7+0.6,rr=0.3+t*2.1;pts.push(face(Math.cos(an)*rr,5.6+Math.sin(an)*rr));}
        parts.push(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),60,0.17,4,false),g));
        for(const [w0,h0,w1,h1] of [[2.4,5.6,3.4,8.2],[-2.2,4.4,-3.6,2.2],[0.4,8,0.9,10.2],[-1.6,7.4,-2.4,9.4]]){const c=[];for(let i=0;i<=6;i++){const t=i/6;c.push(face(w0+(w1-w0)*t+(i===3?0.4:0),h0+(h1-h0)*t));}
          parts.push(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(c),10,0.11,4,false),g));}}
      parts.push(mesh(new THREE.TorusGeometry(5.6,0.14,4,28).rotateX(Math.PI/2),g,s.x,y+1.45,s.z));
      // the doorway on the front (+u), edged with light, and the pedestal before it
      const [dx,dz]=F(3.8,0);parts.push(blk(dx,y+1.4,dz,1.4,3.6,2.8,M.dark,ry),blk(dx+Math.cos(a)*0.72,y+5,dz+Math.sin(a)*0.72,0.12,0.22,3.1,g,ry));
      for(const w of [-1.5,1.5]){const [ex,ez]=F(4.5,w);parts.push(blk(ex,y+1.4,ez,0.12,3.6,0.22,g,ry));}
      const [px,pz]=F(8.6,0);parts.push(cyl(px,y+0.7,pz,0.7,0.5,1.5,M.sheikah,8),blk(px,y+2.2,pz,1.3,0.25,1,M.sheikah2,ry),blk(px,y+2.46,pz,0.6,0.04,0.5,g,ry));}
    return build(L,parts);
  },

  // ================================================================ the stables
  stables(L,x,z){
    const parts=[],tan=mat(0xc89a62),band=mat(0x8a5a3a),coat=[mat(0x8a5a3a),mat(0x5a3a2a),mat(0xe8e0d0)],green=mat(0x5a8a4a),eye=glowM(0xb08ae8,1);
    const flags=[mat(0xd84a3a),mat(0xe8b830),mat(0x3a7ad0),mat(0x4aa060),mat(0xe07ab0)];
    // a string of little pennants, sagging between a and b
    const bunting=(parts,a,b,n,sag)=>{for(let i=0;i<n;i++){const t=(i+0.5)/n,p=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t-Math.sin(t*Math.PI)*sag,a[2]+(b[2]-a[2])*t];
        const f=mesh(new THREE.ConeGeometry(0.45,1.1,3).rotateX(Math.PI),flags[i%flags.length],p[0],p[1]-0.55,p[2]);f.scale.z=0.25;f.rotation.y=-Math.atan2(b[2]-a[2],b[0]-a[0]);parts.push(f);}};
    for(const s of (PL.stables||[])){const y=gh(s.x,s.z)-0.2,a=hz(s.x)*Math.PI*2,F=frame(s.x,s.z,a),ry=-a,R=rng(s.x+s.z);
      // the tent: a half-drum of canvas along u, banded, its back closed
      const tent=mesh(new THREE.CylinderGeometry(9,9,24,14,1,true,0,Math.PI).rotateZ(Math.PI/2),M.cloth,s.x,y,s.z,ry);parts.push(tent);
      for(let k=-2;k<=2;k++){const [bx,bz]=F(k*5,0);const r=mesh(new THREE.TorusGeometry(9.05,0.22,4,16,Math.PI).rotateY(Math.PI/2),band,bx,y,bz,ry);parts.push(r);}
      {const [ex,ez]=F(-12,0);parts.push(mesh(new THREE.CircleGeometry(9,14,0,Math.PI).rotateY(-Math.PI/2),M.cloth2,ex,y,ez,ry));}
      // a green canvas over the crown of the tent, and the front: the doorway under a timber arch
      parts.push(mesh(new THREE.CylinderGeometry(9.25,9.25,24.4,14,1,true,Math.PI/2-0.7,1.4).rotateZ(Math.PI/2),green,s.x,y,s.z,ry));
      const [fx,fz]=F(12,0);parts.push(mesh(new THREE.CircleGeometry(9,14,0,Math.PI).rotateY(Math.PI/2),M.cloth,fx,y,fz,ry),blk(fx+Math.cos(a)*0.1,y,fz+Math.sin(a)*0.1,0.3,5.4,5,M.dark,ry));
      parts.push(mesh(new THREE.TorusGeometry(9.4,0.6,5,18,Math.PI).rotateY(Math.PI/2),M.wood3,fx+Math.cos(a)*0.3,y,fz+Math.sin(a)*0.3,ry));
      // the neck: a lattice of timber rising high over the tent, banners hanging off it
      const P3=(u,w,h)=>{const [px_,pz_]=F(u,w);return [px_,y+h,pz_];};
      const n0=[[9,-2.2,7],[9,2.2,7]],n1=[[18,-1.6,31],[18,1.6,31]];
      for(let k=0;k<2;k++)parts.push(limb(P3(...n0[k]),P3(...n1[k]),0.55,0.4,M.wood2,6));
      for(let i=0;i<6;i++){const t0=i/6,t1=(i+1)/6,L_=(t,k)=>[n0[k][0]+(n1[k][0]-n0[k][0])*t,n0[k][1]+(n1[k][1]-n0[k][1])*t,n0[k][2]+(n1[k][2]-n0[k][2])*t];
        parts.push(limb(P3(...L_(t0,i%2)),P3(...L_(t1,1-i%2)),0.3,0.3,M.wood,5),limb(P3(...L_(t1,0)),P3(...L_(t1,1)),0.25,0.25,M.wood,5));
        const b=blk(...P3(...L_(t0+0.08,0)).map((v,j)=>j===1?v-3.6:v),0.15,3.6,1.2,flags[i%flags.length],ry);parts.push(b);}
      // the head at the top: bigger than the tent is tall, eyes like lamps, blaze, ears, bridle, a mane of cloth
      const [hx,hz_]=F(21,0),hy=y+33;
      const head=mesh(new THREE.BoxGeometry(11,5.6,5.8),tan,hx,hy,hz_);head.rotation.set(0,ry,-0.28,'YXZ');parts.push(head);
      const [mx,mz]=F(25.6,0);const muz=mesh(new THREE.BoxGeometry(4,4,4.8),tan,mx,hy-1.6,mz);muz.rotation.set(0,ry,-0.28,'YXZ');parts.push(muz);
      const blaze=mesh(new THREE.BoxGeometry(9,0.3,1.4),M.white,hx+Math.cos(a)*0.3,hy+2.9,hz_+Math.sin(a)*0.3);blaze.rotation.set(0,ry,-0.28,'YXZ');parts.push(blaze);
      for(const w of [-1,1]){const [ex,ez]=F(17.6,w*1.9);parts.push(cone(ex,hy+2.6,ez,1,3.6,tan,5));
        const [ix,iz]=F(21.4,w*2.95);parts.push(mesh(new THREE.CylinderGeometry(1.3,1.3,0.3,14).rotateX(Math.PI/2),M.white,ix,hy+0.8,iz,ry),mesh(new THREE.CylinderGeometry(0.7,0.7,0.36,12).rotateX(Math.PI/2),eye,ix,hy+0.8,iz+0,ry));
        const [sx,sz]=F(23,w*2.95);parts.push(blk(sx,hy-2,sz,7,0.5,0.3,M.dark,ry));}
      for(let i=0;i<7;i++){const [cx_,cz_]=F(16.4-i*1.2,0);const st=mesh(new THREE.BoxGeometry(1.2,3+i*0.4,0.2).translate(0,-(3+i*0.4)/2,0),flags[i%flags.length],cx_,hy+3.4-i*2.6,cz_,ry+Math.PI/2);st.rotation.z=0.25;parts.push(st);}
      // bunting from the head down to either side of the tent, and two banner poles by the door
      for(const w of [-10,10])bunting(parts,P3(21,0,29),P3(4,w,6),12,1.6);
      bunting(parts,P3(12.2,-8.8,4.6),P3(12.2,8.8,4.6),10,0.8);
      for(const w of [-7.4,7.4]){const [px_,pz_]=F(15,w);parts.push(blk(px_,y,pz_,0.3,9,0.3,M.wood2),blk(px_,y+6.4,pz_+0,0.1,2.4,1.8,flags[w>0?0:2],ry));}
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
