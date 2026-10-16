// ---------- more of the map: the bazaar, the Heroines, the ruins, the springs, the fountains, the laboratory ----------
// Fan work: Breath of the Wild belongs to Nintendo; every shape here is this project's own (kit.js).
//
// bazaar     Kara Kara Bazaar: the desert's oasis - a pool in its stone kerb, palms round it, market stalls under bright
//            peaked cloths, the round striped tent of the inn, rugs and pots, the arch you come in by
// heroines   the Seven Heroines: seven colossal stone women round a stepped platform in the sand - robed, armed with
//            sword or spear or shield - two of them broken, a head lying in the sand
// coliseum   the Coliseum's ruins in Hyrule Field: a ring of arches two storeys high, broken open in places, the tiers
//            of seats inside stepping down to the round floor
// lonlon     Lon Lon Ranch, ruined: the big barn's stone walls and one gable, the round silo with no roof, the house,
//            the oval corral's fence half fallen, hay bales
// springs    the goddess's three springs - Courage in Faron, Wisdom on Mount Lanayru's summit, Power in Akkala: a
//            pool in a stone court, steps down to it, columns round it, the great statue of the goddess in the water,
//            wings at her back and her hands held out
// fairies    three Great Fairies' fountains - Tera in the desert, Mija in Tabantha, Kaysa in Akkala: a huge closed bud
//            in its own colours on a pond, giant leaves round it
// akkalaLab  the Akkala Ancient Tech Lab: the house on its knoll, its great round observatory dome, the telescope
//            out of it, the furnace's chimney and its blue flame
import { kit } from './kit.js';

export function wonders(api){
  const K=kit(api),{THREE,M,mat,glowM,mesh,slab,blk,cyl,cone,sph,dome,limb,lathe,gable,hip,frame,wall,windows,house,build,hz,rng,gh}=K;
  const PL=api.ctx.plan||{sites:{}},S=PL.sites;
  const water=mat(0x4ab0d0),lamp=glowM(0xffc070,1.2);
  const palm=(parts,x,z,h,lean)=>{const y=gh(x,z),tx=x+lean*h*0.3;parts.push(limb([x,y,z],[tx,y+h,z],0.45,0.3,M.trunk,6));
    for(let f=0;f<7;f++){const a=f/7*Math.PI*2+lean;parts.push(limb([tx,y+h,z],[tx+Math.cos(a)*4.6,y+h-1.6,z+Math.sin(a)*4.6],0.55,0.1,M.leaf2,4));}};
  // a robed figure turned on a lathe, h tall, its head and hair; arms added by the caller
  const figure=(parts,x,y,z,h,m)=>{parts.push(lathe([[0.1,0],[0.24,0],[0.2,0.25],[0.14,0.5],[0.12,0.62],[0.16,0.7],[0.12,0.8],[0.07,0.84],[0.09,0.88],[0.08,0.95],[0.01,0.98]].map(([r,v])=>[r*h,v*h]),m,x,y,z,12));};

  return {
  // ================================================================ Kara Kara Bazaar
  bazaar(L,x,z){
    const B=S.kara_kara,by=gh(B.x,B.z),parts=[],R=rng(B.x),cloth=[mat(0xc8402a),mat(0x3a6ac8),mat(0xe8b830),mat(0x2a9a8a),mat(0xb04ab0),mat(0xe07a3a)];
    // the oasis: a pool in a kerb of stone, palms round it
    parts.push(cyl(B.x,by-0.6,B.z,26,26,1.2,M.sand2,24),cyl(B.x,by-0.3,B.z,23,23,0.9,water,24));
    for(let k=0;k<22;k++){const a=k/22*Math.PI*2+R()*0.2,r=30+R()*30;palm(parts,B.x+Math.cos(a)*r,B.z+Math.sin(a)*r,9+R()*6,(R()-0.5)*0.6);}
    // the stalls: a counter under a peaked cloth on four poles, round the south and east of the pool
    for(let k=0;k<9;k++){const a=-0.4+k*0.36,r=46,sx=B.x+Math.cos(a)*r,sz=B.z+Math.sin(a)*r,sy=gh(sx,sz),G=frame(sx,sz,a),ry=-a;
      for(const [u,w] of [[-2.6,-2.6],[2.6,-2.6],[2.6,2.6],[-2.6,2.6]]){const [px,pz]=G(u,w);parts.push(blk(px,sy,pz,0.25,3.4,0.25,M.wood2));}
      parts.push(hip(sx,sy+3.4,sz,6.6,6.6,2.4,cloth[k%cloth.length],ry),blk(...G(-1.8,0).slice(0,1),sy,G(-1.8,0)[1],1.2,1.1,4.4,M.wood,ry));
      for(let p=0;p<3;p++){const [px,pz]=G(1+p,2.6);parts.push(cyl(px,sy,pz,0.5,0.35,0.9,M.tile2,8));}
      const [rx,rz]=G(3.6,0);parts.push(blk(rx,sy+0.02,rz,2.2,0.06,3.4,cloth[(k+2)%cloth.length],ry));}
    // the inn: a big round tent, striped, on the north side
    {const [ix,iz]=[B.x,B.z-50],iy=gh(ix,iz);for(let k=0;k<12;k++){const a0=k/12*Math.PI*2;const seg=mesh(new THREE.CylinderGeometry(11,11,5,2,1,true,a0,Math.PI*2/12).translate(0,2.5,0),k%2?M.cloth:cloth[0],ix,iy,iz);parts.push(seg);}
      parts.push(cone(ix,iy+5,iz,12.4,8,cloth[1],12),cone(ix,iy+13,iz,0.4,3,M.gold,6),blk(ix,iy,iz+10.9,3,3.4,0.4,M.dark));}
    // the arch you come in by, from the road to the north-east
    {const a=-0.8,ax=B.x+Math.cos(a)*68,az=B.z+Math.sin(a)*68,ay=gh(ax,az),G=frame(ax,az,a+Math.PI/2);
      for(const s of [-1,1]){const [px,pz]=G(s*5,0);parts.push(blk(px,ay,pz,2.4,9,2.4,M.sand,-a));}
      parts.push(blk(ax,ay+9,az,12.8,2.2,2.6,M.sand3,-a-Math.PI/2),dome(ax,ay+11.2,az,2,cloth[3],1,10));}
    return build(L,parts);
  },

  // ================================================================ the Seven Heroines
  heroines(L,x,z){
    const H=S.heroines,hy=gh(H.x,H.z)-0.6,parts=[],stone=mat(0xc8a87a),stone2=mat(0xa88a62);
    parts.push(lathe([[46,0],[46,1.4],[40,1.4],[40,2.8],[34,2.8],[34,4.2],[0.1,4.2]],stone2,H.x,hy,H.z,28));
    for(let k=0;k<7;k++){const a=k/7*Math.PI*2+0.3,r=38,sx=H.x+Math.cos(a)*r,sz=H.z+Math.sin(a)*r,F=frame(sx,sz,a+Math.PI),ry=-(a+Math.PI),h=34;
      parts.push(blk(sx,hy+4.2,sz,8,4,8,stone2,ry));
      const broken=k===2||k===5,top=broken?h*0.62:h;
      if(!broken)figure(parts,sx,hy+8.2,sz,h,stone);
      else parts.push(lathe([[0.1,0],[0.24*h,0],[0.2*h,0.25*h],[0.14*h,0.5*h],[0.13*h,0.62*h],[0.1,0.62*h]],stone,sx,hy+8.2,sz,12));
      // the arms: one raised with a sword or a spear, one at the side or with a shield
      const sh=hy+8.2+h*0.72,[lx,lz]=F(1.2,-3.6),[rx,rz]=F(1.2,3.6);
      if(!broken||k===5){const [ex,ez]=F(3.4,-5.4);parts.push(limb([lx,sh,lz],[ex,sh+6,ez],1.1,0.9,stone,6));
        if(k%3===0){parts.push(limb([ex,sh+6,ez],[ex,sh+26,ez],0.35,0.12,stone2,4),blk(ex,sh+5.4,ez,3,0.6,0.6,stone2,ry));}
        else parts.push(limb([ex,sh+2,ez],[ex,sh+34,ez],0.3,0.3,stone2,4),cone(ex,sh+34,ez,0.9,3.4,stone2,4));}
      if(!broken){const [ex,ez]=F(2.6,5);parts.push(limb([rx,sh,rz],[ex,sh-8,ez],1.1,0.9,stone,6));if(k%2)parts.push(mesh(new THREE.CylinderGeometry(4,4,0.8,12).rotateX(Math.PI/2),stone2,...F(4,5.4).slice(0,1),sh-6,F(4,5.4)[1],ry));}}
    // a fallen head in the sand
    {const fx=H.x+52,fz=H.z+20;parts.push(sph(fx,gh(fx,fz)+1.6,fz,3.6,stone,1,1.1,1),sph(fx-1.4,gh(fx,fz)+3,fz,3.2,stone2,1.1,0.6,1));}
    return build(L,parts);
  },

  // ================================================================ the Coliseum's ruins
  coliseum(L,x,z){
    const C=S.coliseum,cy=gh(C.x,C.z)-0.6,parts=[],R=rng(C.x),N=36,Rr=60;
    // the tiers inside, and the floor
    parts.push(lathe([[0.1,0],[34,0],[34,2],[40,2],[40,5],[46,5],[46,8],[52,8],[52,11],[57,11],[57,0.1]],M.stone2,C.x,cy,C.z,N));
    // the ring of arches: two storeys of piers with arches between, the cornice; gaps where it has fallen
    for(let k=0;k<N;k++){if(k>=9&&k<=12)continue;const a=k/N*Math.PI*2,b=(k+1)/N*Math.PI*2,px=C.x+Math.cos(a)*Rr,pz=C.z+Math.sin(a)*Rr,yaw=-(a+b)/2+Math.PI/2;
      const levels=(k>=20&&k<=24)?1:2;
      for(let l=0;l<levels;l++){const y=cy+l*13;parts.push(blk(px,y,pz,3,13,4,M.stone,-a+Math.PI/2));
        const mx=C.x+Math.cos((a+b)/2)*Rr,mz=C.z+Math.sin((a+b)/2)*Rr,span=2*Rr*Math.sin(Math.PI/N)-3;
        // the lintel over the opening and the arch's ring under it
        parts.push(blk(mx,y+10.4,mz,span,2.6,4,M.stone,yaw),blk(mx,y+12.4,mz,span+3,0.6,4.4,M.stone2,yaw));
        parts.push(mesh(new THREE.TorusGeometry(span/2-0.7,0.8,5,12,Math.PI).scale(1,1,2.4),M.stone,mx,y+6.6,mz,yaw));}}
    for(let k=0;k<30;k++){const a=R()*Math.PI*2,r=Rr+(R()-0.5)*16,rx=C.x+Math.cos(a)*r,rz=C.z+Math.sin(a)*r;parts.push(blk(rx,gh(rx,rz)-0.4,rz,2+R()*3,1+R()*2,2+R()*3,M.stone2,R()*3));}
    return build(L,parts);
  },

  // ================================================================ Lon Lon Ranch, in ruins
  lonlon(L,x,z){
    const C=S.lonlon,parts=[],R=rng(C.x+1),F=frame(C.x,C.z,0.3),ry=-0.3;
    // the corral: an oval of fence, half of it down
    for(let k=0;k<40;k++){if(R()<0.35)continue;const a=k/40*Math.PI*2,b=(k+1)/40*Math.PI*2,p=F(Math.cos(a)*70,Math.sin(a)*45),q=F(Math.cos(b)*70,Math.sin(b)*45);
      for(const e of [p,q])parts.push(blk(e[0],gh(...e)-0.2,e[1],0.35,1.8,0.35,M.wood2));wall(parts,p,q,0.25,0.2,M.wood,0,gh(...p)+1.2);wall(parts,p,q,0.25,0.2,M.wood,0,gh(...p)+0.6);}
    // the barn: long stone walls, one gable end standing, the roof's timbers fallen in
    {const [bx,bz]=F(-30,-62),by=gh(bx,bz)-0.4,G=frame(bx,bz,0.3);
      for(const s of [-1,1]){wall(parts,G(-18,s*9),G(18,s*9),7+R()*2,1.2,M.stone2,0,by);windows(parts,G(-14,s*9.7),G(14,s*9.7),by+3,4,1.4,2.4,0);}
      wall(parts,G(-18,-9),G(-18,9),8,1.2,M.stone2,0,by);parts.push(gable(...G(-18,0).slice(0,1),by+8,G(-18,0)[1],1.2,18.6,7,M.stone2,ry+Math.PI/2*0));
      wall(parts,G(18,-9),G(18,-2),5,1.2,M.stone2,0,by);
      for(let k=0;k<5;k++){const [ax,az]=G(-12+k*6,-9),[cx_,cz_]=G(-10+k*6,4);parts.push(limb([ax,by+8,az],[cx_,by+0.5,cz_],0.3,0.3,M.wood2,4));}}
    // the silo: round, roofless; the house beside the barn
    {const [sx,sz]=F(-2,-74),sy=gh(sx,sz);parts.push(lathe([[6,0],[6,22],[5.4,22],[5.4,0.5],[0.1,0.5]],M.stone,sx,sy-0.5,sz,16));}
    {const [hx,hz_]=F(-62,-50),hy=gh(hx,hz_);house(parts,hx,hy,hz_,12,9,4.4,0.3,{kind:'gable',wall:M.stone2,roof:M.tile2,rh:4,chimney:true});}
    for(let k=0;k<12;k++){const [hx,hz_]=F(-40+R()*80,-40+R()*80);parts.push(mesh(new THREE.CylinderGeometry(1,1,1.6,10).rotateZ(Math.PI/2),M.thatch,hx,gh(hx,hz_)+1,hz_,R()*3));}
    return build(L,parts);
  },

  // ================================================================ the goddess's three springs
  springs(L,x,z){
    const parts=[],stone=mat(0xd8d2c4),stone2=mat(0xb8b0a0),glowW=glowM(0xfff4c8,0.8);
    for(const key of ['spring_courage','spring_wisdom','spring_power']){const C=S[key],y=gh(C.x,C.z)-0.4,a=hz(C.x)*6,F=frame(C.x,C.z,a),ry=-a;
      // the court: a square terrace, the pool sunk in it, steps down from the front
      parts.push(blk(C.x,y,C.z,46,1.6,46,stone2,ry),blk(C.x,y+0.2,C.z,30,1.6,30,water,ry));
      for(let k=0;k<3;k++){const [sx,sz]=F(24+k*1.6,0);parts.push(blk(sx,y-0.4-k*0.4,sz,1.6,1.6,12,stone2,ry));}
      for(const [u,w] of [[-19,-19],[19,-19],[19,19],[-19,19],[0,-19],[-19,0],[0,19]]){const [px,pz]=F(u,w);parts.push(cyl(px,y+1.6,pz,1.4,1.2,12,stone,10),blk(px,y+13.6,pz,3.2,1.2,3.2,stone2,ry));}
      // the goddess in the water: robed, wings at her back, hands held out; a glow in her hands
      const [gx,gz]=F(-4,0);parts.push(blk(gx,y+1,gz,6,2,6,stone2,ry));figure(parts,gx,y+3,gz,22,stone);
      for(const s of [-1,1]){const [wx,wz]=F(-6,s*3);const wing=mesh(new THREE.BoxGeometry(1,14,7).translate(0,7,s*3.5),stone,wx,y+12,wz,ry);wing.rotation.x=s*0.35;parts.push(wing);
        const [hx,hz_]=F(-4+0.6,s*1.6),[ex,ez]=F(1,s*3.4);parts.push(limb([hx,y+18,hz_],[ex,y+15.4,ez],0.8,0.6,stone,6));}
      const [ox,oz]=F(1.6,0);parts.push(sph(ox,y+15.6,oz,1.8,glowW));}
    return build(L,parts);
  },

  // ================================================================ three Great Fairies' fountains
  fairies(L,x,z){
    const parts=[];
    for(const [key,c1,c2] of [['fairy_tera',0xe878c8,0x9a4ab0],['fairy_mija',0xf0c040,0xe07a2a],['fairy_kaysa',0x6ac8e8,0x3a8ab8]]){const C=S[key],y=gh(C.x,C.z)-0.3,m1=mat(c1),m2=mat(c2);
      parts.push(cyl(C.x,y-0.3,C.z,22,22,0.6,water,20),cyl(C.x,y-0.6,C.z,24,24,0.5,M.stone2,20));
      // the bud: a fat closed flower, its petals overlapping round it, the tip twisting up
      parts.push(lathe([[0.1,0],[6,1],[9.6,6],[9.4,12],[7,17],[3.4,21],[1,23.4],[0.1,24]],m1,C.x,y,C.z,12));
      for(let k=0;k<6;k++){const a=k/6*Math.PI*2;const p=mesh(new THREE.SphereGeometry(1,10,8),k%2?m1:m2,C.x+Math.cos(a)*6.4,y+9,C.z+Math.sin(a)*6.4);p.scale.set(4.4,10,2.6);p.rotation.set(0,-a,Math.cos(a)*0.0);p.rotation.order='YXZ';p.rotation.x=0.25;parts.push(p);}
      // the leaves floating round it
      for(let k=0;k<7;k++){const a=k/7*Math.PI*2+0.3,l=mesh(new THREE.CircleGeometry(6,10).rotateX(-Math.PI/2),M.leaf,C.x+Math.cos(a)*14,y+0.15,C.z+Math.sin(a)*14);parts.push(l);}}
    return build(L,parts);
  },

  // ================================================================ the Akkala Ancient Tech Lab
  akkalaLab(L,x,z){
    const T=S.akkala_lab,ty=gh(T.x,T.z)-0.3,parts=[],blueFlame=glowM(0x4adfff,1.6),metal=mat(0x8a8e94);
    house(parts,T.x,ty,T.z,14,10,7,0.4,{kind:'gable',wall:M.plaster,roof:M.slate2,timber:true,plinth:1.2,rh:5});
    parts.push(cyl(T.x+12,ty,T.z-4,9,9,7,M.stone2,16),dome(T.x+12,ty+7,T.z-4,9.4,metal,1,16),blk(T.x+12,ty+7,T.z-4,2.4,9.6,19,M.dark,0.4));
    parts.push(limb([T.x+12,ty+12,T.z-4],[T.x+20,ty+22,T.z-9],1.4,2,M.metal,10),cyl(T.x+20.4,ty+22.2,T.z-9.2,2.3,2.3,0.6,M.gold,10));
    parts.push(cyl(T.x-10,ty,T.z+7,1.8,1.5,3.2,M.iron,10),cyl(T.x-10,ty+3.2,T.z+7,0.7,0.7,6,M.iron,6));
    const f=sph(T.x-10,ty+4.6,T.z+7,1.4,blueFlame,1,1.7,1);f.userData.noMerge=true;parts.push(f);
    return build(L,parts);
  },
  };
}
