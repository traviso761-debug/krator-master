// ---------- Hyrule Castle, Castle Town, the Great Plateau ----------
// Fan work: Breath of the Wild belongs to Nintendo; every shape here is this project's own (kit.js).
//
// castle       on its hill in the moat: the outer curtain wall with round towers and merlons and a gatehouse to the
//              south; two terraces climbing, each walled and turreted; on top the great hall, two wings and the
//              library under steep slate roofs, rows of tall windows; the Sanctum's keep rising out of the middle with
//              its crown of turrets and the tall spire; the observation tower and its bridge; slim towers everywhere;
//              malice on the walls with its eyes
// castletown   the town below the castle, in ruins: its broken ring wall and gates, streets of roofless houses with
//              a gable or a chimney still standing, the plaza and its fountain, the church's shell; dead Guardians
// plateau      the Temple of Time - a nave of bays with tall open windows and buttresses, half its roof fallen, the
//              west front with its rose window and door, the round east end, the bell tower; the ruined wall round
//              the plateau's rim; the Shrine of Resurrection's door in the hill; the old man's cabin
import { kit } from './kit.js';
import { guardianKit } from './guardian.js';

export function castle(api){
  const K=kit(api),{THREE,M,mat:mat_,slab,blk,cyl,cone,sph,dome,limb,gable,hip,frame,wall,windows,house,build,hz,rng,gh,glowM,mesh}=K;
  const PL=api.ctx.plan||{sites:{}},S=PL.sites,GK=guardianKit(THREE);
  const malice=glowM(0xb0185a,1.2),eyeM=glowM(0xff9a2a,1.4),blueGlow=glowM(0x4ad8ff,1.2);
  const deadG=(parts,x,z,yaw)=>GK.fallen(parts,x,gh(x,z),z,yaw||0,Math.floor(Math.abs(x*7.3+z*3.1))%997);
  // a round tower with a cone roof, a band below the roof, slit windows
  const tower=(parts,x,y,z,r,h,roofH,m,roofM)=>{parts.push(cyl(x,y,z,r*1.06,r,h,m||M.stone,12),cyl(x,y+h-r*0.5,z,r*1.18,r*1.18,r*0.5,M.stone2,12),
      cone(x,y+h,z,r*1.3,roofH||r*3.6,roofM||M.slate,12));
    for(let k=0;k<3;k++){const a=k*2.1+x,yy=y+h*(0.35+k*0.18);parts.push(blk(x+Math.cos(a)*(r+0.05),yy,z+Math.sin(a)*(r+0.05),0.8,2.4,0.8,M.dark,-a));}};
  // a ring of merlons round a polygon's rim
  const merlonRing=(parts,pts,y,m,size)=>{for(let k=0;k<pts.length;k++){const a=pts[k],b=pts[(k+1)%pts.length],L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.floor(L/(size*2.2)),yaw=-Math.atan2(b[1]-a[1],b[0]-a[0]);
      for(let i=0;i<n;i++){const u=(i+0.5)/n;parts.push(blk(a[0]+(b[0]-a[0])*u,y,a[1]+(b[1]-a[1])*u,size,size*0.9,size*0.8,m,yaw));}}};
  const octo=(F,ru,rw,ch)=>[[-ru+ch,-rw],[ru-ch,-rw],[ru,-rw+ch],[ru,rw-ch],[ru-ch,rw],[-ru+ch,rw],[-ru,rw-ch],[-ru,-rw+ch]].map(([u,w])=>F(u,w));

  return {
  // ================================================================ Hyrule Castle
  castle(L,x,z){
    const C=S.castle,cx=C.x,cz=C.z,y0=gh(cx,cz),parts=[],yaw=0.1,F=frame(cx,cz,yaw),ry=-yaw;
    // the outer curtain wall: an oval of fourteen lengths, a round tower at each turn, the gatehouse to the south
    const ring=[];for(let k=0;k<14;k++){const a=k/14*Math.PI*2,r=1+hz(k)*0.08;ring.push(F(Math.cos(a)*335*r,Math.sin(a)*280*r));}
    for(let k=0;k<ring.length;k++){const a=ring[k],b=ring[(k+1)%ring.length];
      if(k===3){// the gatehouse: two big towers and the arch between them
        const g=[(a[0]+b[0])/2,(a[1]+b[1])/2],gy=gh(...g)-2,yawG=-Math.atan2(b[1]-a[1],b[0]-a[0]);
        for(const s of [-0.5,0.5]){const tx=g[0]+(b[0]-a[0])*s*0.3,tz=g[1]+(b[1]-a[1])*s*0.3;tower(parts,tx,gy,tz,11,40,26);}
        parts.push(blk(g[0],gy,g[1],Math.hypot(b[0]-a[0],b[1]-a[1])*0.36,30,14,M.stone,yawG),blk(g[0],gy,g[1],9,14,14.4,M.dark,yawG));
        wall(parts,a,[a[0]+(b[0]-a[0])*0.3,a[1]+(b[1]-a[1])*0.3],20,7,M.stone2,2.4);wall(parts,[a[0]+(b[0]-a[0])*0.7,a[1]+(b[1]-a[1])*0.7],b,20,7,M.stone2,2.4);}
      else wall(parts,a,b,20,7,M.stone2,2.4);
      tower(parts,a[0],gh(...a)-2,a[1],8.5,32,20);}
    // the first terrace: an octagon of wall, merlons on its rim, turrets at its corners
    const Y1=y0+28,Y2=y0+56,T1=octo(F,175,140,45),T2=octo(F,108,88,28);
    parts.push(slab(T1,y0-6,Y1-y0+6,M.stone2));
    merlonRing(parts,T1,Y1,M.stone2,2.6);for(const [px,pz] of T1)tower(parts,px,y0-4,pz,7,Y1-y0+18,16);
    parts.push(slab(T2,Y1-1,Y2-Y1+1,M.stone));
    merlonRing(parts,T2,Y2,M.stone,2.2);for(const k of [0,2,4,6]){const [px,pz]=T2[k];tower(parts,px,Y1-1,pz,6,Y2-Y1+26,15);}
    // on top: the great hall along the south, a wing either side going north, the library to the west
    const bldg=(u,w,lu,lw,h,rh,turn)=>{const [bx,bz]=F(u,w);parts.push(blk(bx,Y2,bz,lu,h,lw,M.pale,ry+(turn?Math.PI/2:0)),gable(bx,Y2+h,bz,lu+3,lw+3,rh,M.slate,ry+(turn?Math.PI/2:0)));
      const hu=turn?lw:lu,hw=turn?lu:lw;for(const s of [-1,1]){const a=F(u-hu/2+3,w+s*(hw/2+0.2)),b=F(u+hu/2-3,w+s*(hw/2+0.2));
        if(!turn){windows(parts,a,b,Y2+h*0.25,Math.floor(hu/7),1.8,h*0.45,0);}
        for(let k=0;k<=Math.floor(hu/14);k++){const [px,pz]=F(u-hu/2+k*14,w+s*(hw/2+1.4));parts.push(blk(px,Y2,pz,2.2,h*0.85,2.8,M.stone2,ry));}}};
    bldg(0,38,140,34,34,24,false);bldg(-52,-20,80,30,40,22,true);bldg(54,-14,70,28,30,20,true);bldg(-88,40,46,26,24,16,true);
    // the Sanctum's keep: square, banded, windowed on every face, a crown of merlons and four turrets, the great spire
    const ku=0,kw=-6,[kx,kz]=F(ku,kw),KH=150,KT=Y2+KH,ks=34;
    parts.push(blk(kx,Y2,kz,ks,KH,ks,M.pale,ry));
    for(let k=1;k<5;k++)parts.push(blk(kx,Y2+k*KH/5,kz,ks+2,2.2,ks+2,M.stone2,ry));
    for(const [du,dw] of [[0,1],[0,-1],[1,0],[-1,0]]){const a=F(ku+du*(ks/2+0.1)-dw*(ks/2-5),kw+dw*(ks/2+0.1)+du*(ks/2-5)),b=F(ku+du*(ks/2+0.1)+dw*(ks/2-5),kw+dw*(ks/2+0.1)-du*(ks/2-5));
      for(let k=0;k<5;k++)windows(parts,a,b,Y2+12+k*KH/5,3,2,KH/5*0.45,0);}
    parts.push(blk(kx,KT,kz,ks+6,7,ks+6,M.stone2,ry));
    merlonRing(parts,[F(ku-ks/2-3,kw-ks/2-3),F(ku+ks/2+3,kw-ks/2-3),F(ku+ks/2+3,kw+ks/2+3),F(ku-ks/2-3,kw+ks/2+3)],KT+7,M.stone2,2);
    for(const [a,b] of [[-1,-1],[1,-1],[1,1],[-1,1]]){const [px,pz]=F(ku+a*(ks/2+1),kw+b*(ks/2+1));tower(parts,px,KT-28,pz,5,44,20,M.pale);}
    parts.push(cyl(kx,KT+7,kz,15,13,16,M.pale,8),cone(kx,KT+23,kz,19,92,M.slate2,8),cyl(kx,KT+70,kz,6.4,6.4,3,M.gold,8),cone(kx,KT+114,kz,1.4,14,M.gold,6));
    for(let k=0;k<8;k++){const a=k/8*Math.PI*2+ry;parts.push(gable(kx+Math.cos(a)*15.5,KT+16,kz+Math.sin(a)*15.5,5,4,6,M.slate2,-a+Math.PI/2));}
    // the crown: a ring of thin spires standing round the great one, and taller pinnacles at the keep's corners,
    // so the Sanctum ends in a cluster of points as it does against the sky
    for(let k=0;k<12;k++){const a=k/12*Math.PI*2+ry,r=k%2?21:24,px=kx+Math.cos(a)*r,pz=kz+Math.sin(a)*r,h=k%2?10:16;
      parts.push(cyl(px,KT+7,pz,1.5,1.3,h,M.pale,6),cone(px,KT+7+h,pz,1.9,h*1.6,M.slate2,6));}
    for(let k=0;k<4;k++){const a=k/4*Math.PI*2+Math.PI/4+ry;parts.push(cyl(kx+Math.cos(a)*10,KT+23,kz+Math.sin(a)*10,2.2,1.8,22,M.pale,6),cone(kx+Math.cos(a)*10,KT+45,kz+Math.sin(a)*10,2.6,22,M.slate2,6));}
    // the observation tower, tall and round to the north-east, and its bridge across to the keep
    {const [ox,oz]=F(70,-70);tower(parts,ox,Y1-1,oz,11,KH-10,34,M.pale,M.slate2);const yb=Y2+92;
      parts.push(blk((ox+kx)/2,yb,(oz+kz)/2,Math.hypot(ox-kx,oz-kz)-20,4,6,M.stone2,-Math.atan2(oz-kz,ox-kx)));
      for(let k=1;k<4;k++){const t=k/4;parts.push(limb([kx+(ox-kx)*t,yb,kz+(oz-kz)*t],[kx+(ox-kx)*t,yb-14,kz+(oz-kz)*t],1.2,1.2,M.stone2,6));}}
    // slim towers round the terraces, round under cones and square under hips, at many heights
    const R=rng(cx);for(let k=0;k<12;k++){const a=k/12*Math.PI*2+0.3,r=0.55+R()*0.35,[tx,tz]=F(Math.cos(a)*160*r,Math.sin(a)*125*r),ty=r<0.68?Y2:Y1,h=30+R()*55;
      if(k%4===3){parts.push(blk(tx,ty,tz,11,h,11,M.pale,ry),hip(tx,ty+h,tz,14,14,13,M.slate,ry));windows(parts,F(Math.cos(a)*160*r-4,Math.sin(a)*125*r+5.6),F(Math.cos(a)*160*r+4,Math.sin(a)*125*r+5.6),ty+h*0.6,2,1.4,3,0);}
      else tower(parts,tx,ty,tz,5+R()*3,h,14+R()*10,M.pale);}
    // bridges over the moat, and the causeway in to the gate
    const moat=(PL.moats||[])[0];
    for(const a of [Math.PI/2+0.1,-0.3,Math.PI+0.5]){const r0=moat?moat.r0-12:360,r1=moat?moat.r1+12:470,
        ax=cx+Math.cos(a)*r0,az=cz+Math.sin(a)*r0,bx=cx+Math.cos(a)*r1,bz=cz+Math.sin(a)*r1,y=Math.max(gh(ax,az),gh(bx,bz))+1,yawB=-a;
      parts.push(blk((ax+bx)/2,y-3,(az+bz)/2,Math.hypot(bx-ax,bz-az),3,12,M.stone2,yawB));
      for(let k=1;k<4;k++){const t=k/4,px=ax+(bx-ax)*t,pz=az+(bz-az)*t;parts.push(blk(px,y-22,pz,4,20,10,M.stone2,yawB));}
      for(const s of [-1,1])parts.push(blk((ax+bx)/2-Math.sin(a)*s*5.6,y,(az+bz)/2+Math.cos(a)*s*5.6,Math.hypot(bx-ax,bz-az),1.4,0.8,M.stone,yawB));}
    // the monoliths: great dark slabs of rock standing round the castle, leaning, crusted with malice that glows
    const mono=mat_(0x3a3440),R2=rng(cx+77);
    for(let k=0;k<5;k++){const a=k/5*Math.PI*2+0.5+R2()*0.4,r=270+R2()*50,mx=cx+Math.cos(a)*r,mz=cz+Math.sin(a)*r*0.85,my=gh(mx,mz)-8,h=90+R2()*45,lean=(R2()-0.5)*0.5;
      // a mass of rock in three heaped, leaning lumps, narrowing as it rises
      for(let i=0;i<3;i++){const t=i/3,sx_=(30-i*7)*(0.9+R2()*0.3),sy_=h*0.42,sz_=(22-i*5)*(0.9+R2()*0.3),ox=Math.sin(lean)*h*t*0.6;
        const rk=sph(mx+ox*Math.cos(a),my+h*t+sy_*0.45,mz+ox*Math.sin(a),1,mono,sx_,sy_,sz_);rk.rotation.set(lean*0.6,-a+R2(),(R2()-0.5)*0.3);parts.push(rk);}
      for(let i=0;i<6;i++){const t=0.15+i*0.13,sp=sph(mx+(R2()-0.5)*24,my+h*t,mz+(R2()-0.5)*18,2.5+R2()*3.5,malice,1.8,0.5,1.2);parts.push(sp);}}
    // tendrils of malice: thick strands climbing from the moat over the walls and terraces toward the keep
    for(let k=0;k<9;k++){const a=k/9*Math.PI*2+0.2,pts=[];for(let i=0;i<=6;i++){const t=i/6,r=320-t*220,b=a+Math.sin(t*3+k)*0.25,px=cx+Math.cos(b)*r,pz=cz+Math.sin(b)*r*0.85;
        pts.push(new THREE.Vector3(px,Math.max(gh(px,pz),t<0.3?gh(px,pz):t<0.65?Y1:Y2)+2+Math.sin(t*9+k)*3,pz));}
      const td=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),40,2.2-k*0.08,6),malice);parts.push(td);}
    // malice: the red-black goo on the walls and terraces, with its eyes
    for(let k=0;k<22;k++){const a=hz(k*3.1)*Math.PI*2,r=40+hz(k*7.7)*250,mx=cx+Math.cos(a)*r,mz=cz+Math.sin(a)*r*0.85,my=r<110?Y2:r<170?Y1:gh(mx,mz);
      const b=sph(mx,my,mz,8+hz(k*2.3)*10,malice,1.4,0.35,1.1);parts.push(b);if(k%3===0){parts.push(sph(mx,my+3,mz,2.2,M.white),sph(mx+1.6,my+3.2,mz,1.1,eyeM));}}
    return build(L,parts);
  },

  // ================================================================ Castle Town, in ruins
  castletown(L,x,z){
    const C=S.castletown,parts=[],R=rng(C.x*3+C.z),yaw=0.1,F=frame(C.x,C.z,yaw),ry=-yaw;
    // the town wall: an oval, broken, with gates on the main road
    for(let k=0;k<20;k++){if(k===5||k===15||R()<0.2)continue;const a=k/20*Math.PI*2,b=(k+1)/20*Math.PI*2;
      const p=F(Math.cos(a)*250,Math.sin(a)*170),q=F(Math.cos(b)*250,Math.sin(b)*170);wall(parts,p,q,6+R()*9,4,M.stone2,R()<0.5?1.8:0);
      if(k%4===0)parts.push(cyl(p[0],gh(...p)-1,p[1],5,4.6,10+R()*10,M.stone,10));}
    // the streets: houses in rows either side of the main road and the cross streets, roofless, walls standing to
    // different heights, here a gable end, there a chimney
    const ruin=(u,w,turn)=>{const [hx,hz_]=F(u,w),hy=gh(hx,hz_),bw=8+R()*6,bd=7+R()*5,h=3+R()*7,yawH=ry+(turn?Math.PI/2:0),G=frame(hx,hz_,-yawH);
      const sides=[[[-bw/2,-bd/2],[bw/2,-bd/2]],[[bw/2,-bd/2],[bw/2,bd/2]],[[bw/2,bd/2],[-bw/2,bd/2]],[[-bw/2,bd/2],[-bw/2,-bd/2]]];
      sides.forEach(([a,b],k)=>{if(R()<0.25)return;const A=G(...a),B=G(...b),hh=h*(0.4+R()*0.6),Lw=Math.hypot(B[0]-A[0],B[1]-A[1]);
        if(Lw>9&&R()<0.5){const m1=[A[0]+(B[0]-A[0])*0.4,A[1]+(B[1]-A[1])*0.4],m2=[A[0]+(B[0]-A[0])*0.6,A[1]+(B[1]-A[1])*0.6];wall(parts,A,m1,hh,0.8,M.stone3,0,hy-0.5);wall(parts,m2,B,hh*0.8,0.8,M.stone3,0,hy-0.5);}
        else wall(parts,A,B,hh,0.8,k%2?M.stone2:M.stone3,0,hy-0.5);});
      if(R()<0.3){const A=G(-bw/2,0);parts.push(gable(A[0],hy+h-0.5,A[1],0.8,bd,4,M.stone3,yawH+Math.PI/2));}
      if(R()<0.3){const A=G(bw*0.3,-bd*0.3);parts.push(blk(A[0],hy-0.5,A[1],1.2,h+3,1.2,M.stone2,yawH));}
      if(R()<0.4)parts.push(blk(hx+(R()-0.5)*bw,hy-0.3,hz_+(R()-0.5)*bd,1.5+R()*2,0.8+R(),1.5+R()*2,M.stone2,R()*3));};
    for(let u=-200;u<=200;u+=16){if(Math.abs(u)<36)continue;for(const s of [-1,1]){ruin(u,s*(14+R()*3),false);if(R()<0.7)ruin(u+R()*4,s*(34+R()*8),false);if(R()<0.5)ruin(u,s*(58+R()*30),R()<0.5);}}
    for(let w=-140;w<=140;w+=16){if(Math.abs(w)<36)continue;for(const s of [-1,1])ruin(s*(14+R()*3),w,true);}
    // the plaza and its fountain, and the church's shell on its north side
    const py=gh(C.x,C.z);parts.push(cyl(C.x,py-0.6,C.z,26,26,0.8,M.stone,24),cyl(C.x,py,C.z,8,8,1.4,M.stone2,16),cyl(C.x,py+1.4,C.z,2,1.4,4,M.stone2,8),cyl(C.x,py+5,C.z,3.6,3.6,0.6,M.stone2,10));
    {const [chx,chz]=F(0,-62),cy=gh(chx,chz);for(const s of [-1,1]){const A=F(-22,-62+s*10),B=F(22,-62+s*10);wall(parts,A,B,16,1.6,M.stone,0,cy-1);windows(parts,A,B,cy+6,5,2,7,s*0.9);}
      wall(parts,F(22,-72),F(22,-52),22,1.6,M.stone,0,cy-1);const [bx,bz]=F(-28,-62);parts.push(blk(bx,cy-1,bz,10,34,10,M.stone,ry),hip(bx,cy+33,bz,12,12,10,M.slate,ry));}
    // the Guardians that came through it
    for(let k=0;k<9;k++){const [gx,gz]=F((R()-0.5)*380,(R()-0.5)*240);deadG(parts,gx,gz,R()*6);}
    return build(L,parts);
  },

  // ================================================================ the Great Plateau
  plateau(L,x,z){
    const parts=[],T=S.temple_of_time,ty=gh(T.x,T.z)-0.5,F=frame(T.x,T.z,0),R=rng(T.x);
    // the nave: eight bays along u; a pier at each bay line, the wall low between with the tall window open above it,
    // and the arch's head; buttresses outside each pier
    const NL=64,NW=26,HH=22;
    for(const s of [-1,1]){for(let k=0;k<=8;k++){const u=-NL/2+k*8,[px,pz]=F(u,s*NW/2);const broken=s>0&&(k===5||k===6);
        parts.push(blk(px,ty,pz,2.6,broken?HH*0.5:HH,2.6,M.stone));
        if(!broken){const [bx,bz]=F(u,s*(NW/2+2.4));parts.push(blk(bx,ty,bz,2,HH*0.7,3,M.stone2),blk(bx,ty+HH*0.7,bz,2,3,2,M.stone2));}
        if(k<8){const [mx,mz]=F(u+4,s*NW/2);if(!(s>0&&k===5)){parts.push(blk(mx,ty,mz,5.4,5,1.8,M.stone));
            parts.push(blk(mx,ty+HH-4,mz,5.4,4,1.8,M.stone),gable(mx,ty+HH-6.5,mz,1.6,5.4,2.8,M.stone,Math.PI/2));}}}
      const A=F(-NL/2,s*NW/2),B=F(NL/2,s*NW/2);wall(parts,A,B,1.4,2.4,M.stone2,0,ty+HH);}
    // half the roof still on, over the west bays; the rest is rafters against the sky
    {const [rx,rz]=F(-NL/2+12,0);parts.push(gable(rx,ty+HH+1.4,rz,25,NW+4,12,M.slate));}
    for(let k=0;k<4;k++){const u=4+k*8;for(const s of [-1,1]){const [a1,a2]=F(u,s*NW/2),[b1,b2]=F(u,0);parts.push(limb([a1,ty+HH+1.4,a2],[b1,ty+HH+12,b2],0.5,0.5,M.wood2,5));}}
    // the west front: a gable wall with the rose window and the great door
    {const [fx,fz]=F(-NL/2-1,0);parts.push(blk(fx,ty,fz,2.8,HH+1.4,NW+2.6,M.stone),gable(fx,ty+HH+1.4,fz,2.8,NW+2.6,12,M.stone,Math.PI/2));
      parts.push(mesh(new THREE.TorusGeometry(4.6,0.7,6,20).rotateY(Math.PI/2),M.stone2,fx-1.5,ty+HH-4,fz),mesh(new THREE.CircleGeometry(4.2,20).rotateY(-Math.PI/2),M.dark,fx-1.5,ty+HH-4,fz));
      parts.push(blk(fx-1.5,ty,fz,0.4,9,6,M.dark),gable(fx-1.6,ty+9,fz,0.5,6,2.6,M.dark,Math.PI/2));}
    // the round east end, open to the sky, the goddess's statue before it
    {const [ex,ez]=F(NL/2,0);const ap=mesh(new THREE.CylinderGeometry(NW/2,NW/2,HH*0.8,14,1,true,0,Math.PI).translate(0,HH*0.4,0),M.stone,ex,ty,ez);ap.rotation.y=0;ap.material=M.stone;parts.push(ap);
      const [gx,gz]=F(NL/2-8,0);parts.push(cyl(gx,ty,gz,2.4,2.2,3,M.stone2,8),lathe_goddess(gx,ty+3,gz));}
    // the bell tower, rising from just behind the middle of the west front over the door: square, banded, belfry
    // openings on each face, a tall four-sided spire; a smaller spired tower stands beside it to the south
    const tower2=(u,w,sz,h,sp)=>{const [tx,tz]=F(u,w);parts.push(blk(tx,ty,tz,sz,h,sz,M.stone),blk(tx,ty+h,tz,sz+1.5,1.6,sz+1.5,M.stone2),hip(tx,ty+h+1.6,tz,sz+1.2,sz+1.2,sp,M.slate),cone(tx,ty+h+1.6+sp,tz,0.5,5,M.gold,6));
      for(const [du,dw] of [[1,0],[-1,0],[0,1],[0,-1]]){parts.push(blk(tx+du*(sz/2+0.1),ty+h-11,tz+dw*(sz/2+0.1),du?0.4:sz*0.4,8,dw?0.4:sz*0.4,M.dark),gable(tx+du*(sz/2+0.1),ty+h-3,tz+dw*(sz/2+0.1),du?0.5:sz*0.4,du?sz*0.4:0.5,2,M.dark,0));}
      for(let k=1;k<4;k++)parts.push(blk(tx,ty+k*h/4,tz,sz+0.8,1,sz+0.8,M.stone2));};
    tower2(-NL/2+5,0,12,54,20);tower2(-NL/2+4,NW/2+3,7,40,12);
    // ivy over the walls
    for(let k=0;k<22;k++){const s_=R()<0.5?-1:1,[ix,iz]=F(-NL/2+R()*NL,s_*(NW/2+1.4));parts.push(sph(ix,ty+2+R()*14,iz,1.6+R()*2,M.moss,0.7,2+R()*2,0.5));}
    for(let k=0;k<26;k++){const [rx,rz]=F((R()-0.5)*90,(R()-0.5)*60);parts.push(blk(rx,ty,rz,1.5+R()*3,0.8+R()*2,1.5+R()*3,R()<0.5?M.stone2:M.stone,R()*3));}
    // the wall round the rim of the plateau, with gaps where it has fallen and towers
    const P0=S.plateau;for(let k=0;k<64;k++){if(k%9===4||k%13===0)continue;const a=k/64*Math.PI*2,a2=(k+1)/64*Math.PI*2,r=640,rz=530;
      const A=[P0.x+Math.cos(a)*r,P0.z+Math.sin(a)*rz],B=[P0.x+Math.cos(a2)*r,P0.z+Math.sin(a2)*rz];wall(parts,A,B,9+hz(k)*4,3,M.stone2,1.6);
      if(k%8===0)parts.push(cyl(A[0],gh(...A)-2,A[1],4,3.6,16,M.stone,10),cyl(A[0],gh(...A)+14,A[1],4.4,4.4,1.4,M.stone2,10));}
    // the Shrine of Resurrection: a doorway into the hillside, blue inside
    const Rs=S.resurrection,ry=gh(Rs.x,Rs.z);
    parts.push(sph(Rs.x,ry,Rs.z,16,M.rock2,1.2,0.6,1),blk(Rs.x,ry,Rs.z+12,8,8,4,M.sheikah),blk(Rs.x,ry+0.5,Rs.z+14.1,5,6,0.2,blueGlow));
    // the old man's cabin: a log hut under a thatch, its chimney, a woodpile, a pot on a fire
    const O=S.oldman,oy=gh(O.x,O.z);house(parts,O.x,oy,O.z,8,6,3.4,0.3,{wall:M.wood,roof:M.thatch,rh:3.4,chimney:true});
    for(let k=0;k<4;k++)parts.push(limb([O.x+6,oy+0.4+k*0.5,O.z-2+k*0.2],[O.x+6,oy+0.4+k*0.5,O.z+2+k*0.2],0.25,0.25,M.wood2,5));
    parts.push(cyl(O.x-6,oy,O.z+4,0.9,0.7,1,M.iron,8));
    return build(L,parts);
  },
  };

  // the goddess: a robed figure turned on a lathe, her arms raised
  function lathe_goddess(x,y,z){const g=new THREE.Group();g.position.set(x,y,z);
    g.add(new THREE.Mesh(new THREE.LatheGeometry([[0.01,0],[1.6,0],[1.4,2],[0.9,3.6],[0.7,4.4],[0.55,4.6],[0.6,5.1],[0.45,5.6],[0.01,5.7]].map(([r,h])=>new THREE.Vector2(r,h)),10),M.stone));
    for(const s of [-1,1]){const a=new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.22,2.2,6),M.stone);a.position.set(0.3,4.8,s*0.7);a.rotation.set(s*0.5,0,-0.3);g.add(a);}
    // merged into one mesh so the build pass treats it as one part
    g.updateMatrixWorld(true);const ms=[];g.traverse(o=>{if(o.isMesh){const m=new THREE.Mesh(o.geometry.clone().applyMatrix4(o.matrixWorld),o.material);ms.push(m);}});
    return api.mergeParts(ms,M.stone);}
}
