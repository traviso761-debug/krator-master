// ---------- the peoples' cities: Zora's Domain, Goron City, Gerudo Town ----------
// Fan work: Breath of the Wild belongs to Nintendo; every shape here is this project's own (kit.js).
//
// zora     a round plaza of pale luminous stone with a ring of water, the palace rising from it - a flared, finned
//          spire like a fish leaping, a glowing orb at its point - small domed houses round the rim, lamps of
//          glowing stone, a statue of the princess on the plaza, long arched bridges out over the drop
// goron    on Death Mountain's flank: rock domes with doorways and metal awnings, a lava channel running through in
//          its stone banks, shops under red cloth, chimneys, fire bowls, mine-cart rails out to the workings, the
//          great stone statue of a Goron hero
// gerudo   in the desert: a wall of sandstone round it with merlons and domed corner towers, the gate to the east;
//          inside, packed flat-roofed houses with roof terraces and bright awnings over their doors, little domes;
//          the palace in the middle - tiers of arches, a great tiled dome, four minarets; palms
import { kit } from './kit.js';

export function peoples(api){
  const K=kit(api),{THREE,M,mat,glowM,mesh,slab,blk,cyl,cone,sph,dome,limb,lathe,gable,hip,frame,wall,windows,house,build,hz,rng,gh}=K;
  const PL=api.ctx.plan||{sites:{}},S=PL.sites;
  const lum=glowM(0x5aeaff,1.2),fire=glowM(0xff8a3a,1.4);

  return {
  // ================================================================ Zora's Domain
  zora(L,x,z){
    const Z=S.zora,zy=gh(Z.x,Z.z),parts=[],R=rng(Z.x),water=mat(0x5ab8e0,{transparent:false});
    // the Zora's stone: pale with a blue-green cast, and the deeper teal of the trim
    M.zora=mat(0xcfe6ea);M.zora2=mat(0x4aa8b8);
    // the plaza: a broad disc, a raised rim, a ring of water inside it, the floor round the palace
    parts.push(lathe([[0.1,-6],[52,-6],[56,0],[57,1.6],[54,1.6],[54,0.6],[0.1,0.6]],M.zora,Z.x,zy,Z.z,40));
    parts.push(cyl(Z.x,zy+0.6,Z.z,40,40,0.4,water,32),cyl(Z.x,zy+0.6,Z.z,28,28,0.7,M.zora2,32));
    // the palace: a drum, then the flared spire turned on a lathe, fins round it, the orb at the point
    parts.push(cyl(Z.x,zy+1,Z.z,19,18,10,M.zora2,20));
    parts.push(lathe([[18,0],[22,6],[23,12],[20,18],[14,26],[9,36],[6,48],[3.4,62],[1.2,76],[0.1,82]],M.zora,Z.x,zy+11,Z.z,24));
    for(let k=0;k<6;k++){const a=k/6*Math.PI*2,fx=Z.x+Math.cos(a)*20,fz=Z.z+Math.sin(a)*20;
      const fin=mesh(new THREE.BoxGeometry(1,26,9).translate(0,13,4.5),M.zora2,fx,zy+12,fz,-a+Math.PI/2);fin.rotation.x=-0.35;parts.push(fin);
      parts.push(blk(Z.x+Math.cos(a)*19.4,zy+3,Z.z+Math.sin(a)*19.4,4,6,0.3,M.dark,-a+Math.PI/2));}
    for(const h of [30,52])parts.push(mesh(new THREE.TorusGeometry(h===30?11.6:6.6,0.5,5,28).rotateX(Math.PI/2),lum,Z.x,zy+11+h,Z.z));
    // the crown: from the spire's point a slender stalk, and at its top a cup of petals edged with light
    parts.push(lathe([[1.4,0],[1,10],[0.9,18],[2.4,22],[0.1,23]],M.zora2,Z.x,zy+90,Z.z,10));
    for(let k=0;k<12;k++){const a=k/12*Math.PI*2,pt=mesh(new THREE.BoxGeometry(0.6,14,5).translate(0,7,0),k%2?M.zora:M.zora2,Z.x+Math.cos(a)*2.4,zy+110,Z.z+Math.sin(a)*2.4);
      pt.rotation.set(0,-a,0);pt.rotateZ(-0.55);parts.push(pt);const tip=sph(Z.x+Math.cos(a)*10.5,zy+121.5,Z.z+Math.sin(a)*10.5,0.9,lum);parts.push(tip);}
    {const o=mesh(new THREE.SphereGeometry(3,14,10),lum,Z.x,zy+113,Z.z);parts.push(o);}
    // the colonnade round the plaza: luminous columns and arches between them
    for(let k=0;k<20;k++){const a=k/20*Math.PI*2,b=(k+1)/20*Math.PI*2,r=50,px=Z.x+Math.cos(a)*r,pz=Z.z+Math.sin(a)*r;
      parts.push(cyl(px,zy+1.6,pz,1.3,1,9,k%2?M.zora2:lum,8));
      const mx=Z.x+Math.cos((a+b)/2)*r,mz=Z.z+Math.sin((a+b)/2)*r;const arch=mesh(new THREE.TorusGeometry(r*Math.sin(Math.PI/20),0.7,5,12,Math.PI),M.zora,mx,zy+10.6,mz);arch.rotation.y=-(a+b)/2+Math.PI/2;parts.push(arch);}
    // small domed houses round the rim, between the lamps
    for(let k=0;k<8;k++){const a=k/8*Math.PI*2+0.2;if(k===2)continue;const hx=Z.x+Math.cos(a)*46,hz_=Z.z+Math.sin(a)*46;
      parts.push(cyl(hx,zy+0.6,hz_,5,5,5,M.zora2,12),dome(hx,zy+5.6,hz_,5.6,M.zora,1.1,12),blk(hx-Math.cos(a)*5,zy+0.6,hz_-Math.sin(a)*5,0.3,3,2,M.dark,-a+Math.PI/2));}
    for(let k=0;k<16;k++){const a=k/16*Math.PI*2,lx=Z.x+Math.cos(a)*55,lz=Z.z+Math.sin(a)*55;parts.push(cyl(lx,zy+1.6,lz,0.8,0.6,5,M.zora,6),sph(lx,zy+7,lz,1.2,lum,1,1.4,1));}
    // the princess's statue on the plaza, facing the bridge in
    {const a=2*Math.PI/8+0.2,sx=Z.x+Math.cos(a)*34,sz=Z.z+Math.sin(a)*34;parts.push(cyl(sx,zy+1,sz,3.4,3,3,M.zora2,10));
      parts.push(lathe([[0.1,0],[1.6,0],[1.2,2.4],[1.6,3.6],[1.3,5.2],[0.8,6],[0.9,6.8],[0.5,7.6],[0.1,7.8]],M.zora,sx,zy+4,sz,10),limb([sx+1.4,zy+4,sz],[sx+1.8,zy+13,sz],0.12,0.12,M.zora2,5));}
    // the bridges: long arcs out from the plaza's rim over the drop, a rail of lamps along each
    for(const a of [0.3,2.0,3.9]){const pts=[];for(let k=0;k<=16;k++){const t=k/16;pts.push(new THREE.Vector3(Z.x+Math.cos(a)*(56+t*130),zy-1+Math.sin(t*Math.PI)*18-t*6,Z.z+Math.sin(a)*(56+t*130)));}
      const c=new THREE.CatmullRomCurve3(pts);parts.push(new THREE.Mesh(new THREE.TubeGeometry(c,32,2.2,6),M.zora));
      for(let k=1;k<8;k++){const p=c.getPoint(k/8);parts.push(sph(p.x-Math.sin(a)*3,p.y+2.6,p.z+Math.cos(a)*3,0.8,lum),sph(p.x+Math.sin(a)*3,p.y+2.6,p.z-Math.cos(a)*3,0.8,lum));}
      for(let k=1;k<4;k++){const p=c.getPoint(k/4),g=gh(p.x,p.z);if(p.y-g>4)parts.push(limb([p.x,g-1,p.z],[p.x,p.y,p.z],1.6,1.2,M.zora2,8));}}
    return build(L,parts);
  },

  // ================================================================ Goron City
  goron(L,x,z){
    const G=S.goron,gy=gh(G.x,G.z),parts=[],R=rng(G.x+5),F=frame(G.x,G.z,0.6);
    // the lava channel: a run of glowing lava down through the city between stone banks
    const ch=[];for(let k=0;k<=10;k++){const t=k/10;ch.push(F(-110+t*220,Math.sin(t*4)*14));}
    for(let k=0;k<10;k++){const a=ch[k],b=ch[k+1],y=Math.min(gh(...a),gh(...b));wall(parts,a,b,0.6,5,M.lava,0,y+0.15);
      const n=[-(b[1]-a[1]),b[0]-a[0]],l=Math.hypot(...n);for(const s of [-1,1]){const o=[n[0]/l*s*3.4,n[1]/l*s*3.4];wall(parts,[a[0]+o[0],a[1]+o[1]],[b[0]+o[0],b[1]+o[1]],1.2,1.6,M.rock3,0,y-0.2);}}
    // the houses: rock domes with doorways and metal awnings, a few square-cut stone houses with flat iron roofs
    for(let k=0;k<20;k++){const u=-90+R()*180,w=(R()<0.5?-1:1)*(14+R()*60),[hx,hz_]=F(u,w),hy=gh(hx,hz_),r=5+R()*4,a=Math.atan2(G.z-hz_,G.x-hx);
      if(k%4===3){house(parts,hx,hy,hz_,9,8,4.4,-a+Math.PI/2,{kind:'flat',wall:M.rock2,roof:M.iron,winM:fire});continue;}
      parts.push(sph(hx,hy,hz_,r,k%2?M.rock2:M.rock3,1.2,0.8,1.1,1));
      const dx=hx+Math.cos(a)*r*1.1,dz=hz_+Math.sin(a)*r*1.1;parts.push(blk(dx,hy,dz,2.6,3.6,0.6,M.dark,-a+Math.PI/2),blk(dx+Math.cos(a)*1.2,hy+3.8,dz+Math.sin(a)*1.2,5,0.25,3,M.iron,-a+Math.PI/2));
      if(R()<0.4)parts.push(cyl(hx-Math.cos(a)*r*0.4,hy+r*0.6,hz_-Math.sin(a)*r*0.4,0.9,0.9,6,M.iron,8));}
    // the shops: red cloth on poles over counters
    const redCloth=mat(0xc8402a);for(let k=0;k<4;k++){const [sx,sz]=F(-40+k*26,-8),sy=gh(sx,sz);
      for(const [a,b] of [[-1,-1],[1,-1],[1,1],[-1,1]])parts.push(blk(sx+a*2.6,sy,sz+b*2.2,0.25,3.4,0.25,M.wood2));
      parts.push(blk(sx,sy+3.4,sz,6,0.2,5,redCloth,0.6),blk(sx,sy,sz,4.4,1.1,1.2,M.wood,-0.6));}
    // fire bowls on posts round the city
    for(let k=0;k<12;k++){const [lx,lz]=F(-95+k*17,k%2?24:-24),ly=gh(lx,lz);parts.push(blk(lx,ly,lz,0.5,3,0.5,M.iron),cyl(lx,ly+3,lz,0.4,1.2,0.8,M.iron,8),sph(lx,ly+4.1,lz,0.8,fire,1,1.4,1));}
    // mine-cart rails out to the workings, carts on them
    for(const s of [-1,1]){const pts=[];for(let k=0;k<=8;k++)pts.push(F(s*(60+k*14),s*(30+k*5)));
      for(let k=0;k<8;k++){const a=pts[k],b=pts[k+1],y=Math.min(gh(...a),gh(...b));for(const o of [-0.7,0.7])wall(parts,[a[0],a[1]+o],[b[0],b[1]+o],0.15,0.12,M.iron,0,y+0.3);}
      for(const k of [3,6]){const [cx,cz]=pts[k];parts.push(blk(cx,gh(cx,cz)+0.5,cz,2,1.4,1.6,M.iron));}}
    // the statue of a Goron hero: a great round body, a head, arms akimbo, on a plinth over the city
    {const [sx,sz]=F(0,70),sy=gh(sx,sz);parts.push(blk(sx,sy,sz,14,4,12,M.rock2,-0.6));
      parts.push(lathe([[0.1,0],[5,0],[8,4],[8.6,9],[7,14],[4,16.5],[0.1,17]],M.rock,sx,sy+4,sz,14),sph(sx,sy+23,sz,4.4,M.rock,1,0.9,1));
      for(const s of [-1,1])parts.push(limb([sx+s*7,sy+16,sz],[sx+s*10,sy+10,sz+2],2.2,1.8,M.rock,8));}
    return build(L,parts);
  },

  // ================================================================ Gerudo Town
  gerudo(L,x,z){
    const G=S.gerudo_town,gy=gh(G.x,G.z),parts=[],R=rng(G.x+9),F=frame(G.x,G.z,-0.6),ry=0.6;   // the gate faces the road north-east
    const awn=[mat(0xc8402a),mat(0x3a6ac8),mat(0xe8b830),mat(0x2a9a8a),mat(0xb04ab0)],tileD=mat(0x2a8a9a);
    // the wall: a chamfered square, merlons, domed towers at the corners and either side of the gate
    const ring=[[-140,-120],[-100,-150],[100,-150],[140,-120],[140,120],[100,150],[-100,150],[-140,120]].map(([u,w])=>F(u,w));
    for(let k=0;k<ring.length;k++){const a=ring[k],b=ring[(k+1)%ring.length];
      if(k===3){const m1=[a[0]+(b[0]-a[0])*0.43,a[1]+(b[1]-a[1])*0.43],m2=[a[0]+(b[0]-a[0])*0.57,a[1]+(b[1]-a[1])*0.57];
        wall(parts,a,m1,16,6,M.sand2,2.4);wall(parts,m2,b,16,6,M.sand2,2.4);
        for(const m of [m1,m2])parts.push(cyl(m[0],gy-1,m[1],6,5.6,24,M.sand,12),dome(m[0],gy+23,m[1],6.2,tileD,1,12));
        parts.push(blk((m1[0]+m2[0])/2,gy+12,(m1[1]+m2[1])/2,Math.hypot(m2[0]-m1[0],m2[1]-m1[1]),6,6,M.sand,ry+Math.PI/2));}
      else wall(parts,a,b,16,6,M.sand2,2.4);
      parts.push(cyl(a[0],gy-1,a[1],8,7.4,22,M.sand,14),dome(a[0],gy+21,a[1],8,M.gold,0.9,14));}
    // the houses: packed flat-roofed blocks with parapets, awnings over the doors, a dome here and there
    for(let i=-6;i<=6;i++)for(let j=-5;j<=5;j++){const u=i*19+(R()-0.5)*4,w=j*22+(R()-0.5)*4;if(Math.abs(u)<44&&Math.abs(w)<40)continue;if(R()<0.18)continue;
      if(Math.abs(u)>126||Math.abs(w)>134||(Math.abs(u)>95&&Math.abs(w)>110))continue;
      const [hx,hz_]=F(u,w),hy=gh(hx,hz_),bw=10+R()*6,bd=11+R()*6,h=4+Math.floor(R()*3)*3.4,m=[M.sand,M.sand3,M.plaster][Math.floor(R()*3)];
      parts.push(blk(hx,hy,hz_,bw,h,bd,m,ry),blk(hx,hy+h,hz_,bw+0.4,0.9,bd+0.4,M.sand2,ry));
      const [dx,dz]=F(u,w+bd/2+0.15);parts.push(blk(dx,hy,dz,1.8,2.6,0.3,M.dark,ry));
      const [ax,az]=F(u,w+bd/2+1.4);parts.push(gable(ax,hy+2.9,az,3.4,2.6,0.8,awn[Math.floor(R()*awn.length)],ry));
      if(h>8){windows(parts,F(u-bw/2+1,w+bd/2+0.1),F(u+bw/2-1,w+bd/2+0.1),hy+h-3,2,1.1,1.6,0);}
      if(R()<0.15)parts.push(dome(hx,hy+h+0.9,hz_,Math.min(bw,bd)*0.32,R()<0.5?tileD:M.gold,1,10));}
    // the palace: tiers of arcaded blocks, the great dome on a drum, four minarets
    parts.push(blk(G.x,gy,G.z,70,10,64,M.sand3,ry),blk(G.x,gy+10,G.z,52,10,48,M.sand,ry),blk(G.x,gy+20,G.z,34,8,32,M.sand3,ry));
    for(const [s,t] of [[1,0],[-1,0],[0,1],[0,-1]]){const a=F(s*35-t*30,t*32+s*30),b=F(s*35+t*30,t*32-s*30);windows(parts,a,b,gy+1,9,3,6.5,0);
      const a2=F(s*26-t*22,t*24+s*22),b2=F(s*26+t*22,t*24-s*22);windows(parts,a2,b2,gy+12,7,2.4,5,0);}
    parts.push(cyl(G.x,gy+28,G.z,13,13,6,M.sand,20),dome(G.x,gy+34,G.z,13.6,tileD,1.15,20),cone(G.x,gy+49,G.z,1,6,M.gold,8));
    for(const [s,t] of [[-1,-1],[1,-1],[1,1],[-1,1]]){const [mx,mz]=F(s*31,t*28);parts.push(cyl(mx,gy,mz,3,2.6,46,M.sand,10),cyl(mx,gy+40,mz,3.6,3.6,2,M.sand2,10),dome(mx,gy+46,mz,2.8,tileD,1.3,10),cone(mx,gy+49.6,mz,0.4,4,M.gold,6));}
    // the rock formations north of the town: two great mushroom-shaped stacks, water falling from the top of one
    // into a pool at its foot
    const rockS=mat(0xc89a6a),rockS2=mat(0xb0845a),fallM=mat(0xeaf6ff,{transparent:true,opacity:0.85,emissive:0x203038});
    for(const [u,w,h,sc] of [[-30,-205,78,1],[25,-215,64,0.85]]){const [rx,rz]=F(u,w),rgy=gh(rx,rz)-2;
      parts.push(lathe([[14,0],[9,h*0.3],[7.5,h*0.55],[10,h*0.75],[18,h*0.9],[19,h*0.97],[0.1,h]].map(([r,y_])=>[r*sc,y_]),u<0?rockS:rockS2,rx,rgy,rz,12));
      if(u<0){const [fx,fz]=F(u,w+19.5),fall=mesh(new THREE.PlaneGeometry(6,h*0.9).translate(0,h*0.45,0),fallM,fx,rgy+2,fz,ry);fall.userData.noMerge=true;parts.push(fall);
        const [px_,pz_]=F(u,w+24);parts.push(cyl(px_,gh(px_,pz_)-0.3,pz_,9,9,0.6,mat(0x4ab0d0),16));}}
    // palms outside the gate, either side of the road in
    for(let k=0;k<14;k++){const [px,pz]=F(152+R()*50,(k%2?1:-1)*(14+R()*40));const py=gh(px,pz),h=8+R()*5,lean=(R()-0.5)*0.6,tx=px+lean*h*0.3;
      parts.push(limb([px,py,pz],[tx,py+h,pz],0.45,0.3,M.trunk,6));for(let f=0;f<7;f++){const a=f/7*Math.PI*2;parts.push(limb([tx,py+h,pz],[tx+Math.cos(a)*4.6,py+h-1.6,pz+Math.sin(a)*4.6],0.55,0.1,M.leaf2,4));}}
    return build(L,parts);
  },
  };
}
