// ---------- the villages: Kakariko, Hateno, Lurelin, Tarrey Town ----------
// Fan work: Breath of the Wild belongs to Nintendo; every shape here is this project's own (kit.js).
//
// kakariko   in its valley: the path up the middle, wooden houses on stone terraces either side under deep thatched
//            roofs with a small gable on top, lanterns along the path, bamboo fences, the gate at the foot; Impa's
//            house at the head of the valley, raised on its stone platform under two tiers of roof; the Great
//            Fairy's bud by its pond
// hateno     a village of white walls and dark timbers under red and blue tiled roofs, chimneys, along its winding
//            street; fenced fields in rows; the Ancient Tech Lab on the hill above with its telescope and blue flame;
//            Fort Hateno's long wall across the way in, and the Guardians that died against it
// lurelin    fishing huts on stilts under steep thatch by the beach, piers out into the bay, boats drawn up, nets
//            on frames, palms
// tarrey     on its rock in Lake Akkala: round houses in bright colours under domed roofs, the tall golden-roofed
//            hall in the middle, the arch over the way in, the walkway out across the water
import { kit } from './kit.js';
import { guardianKit } from './guardian.js';

export function villages(api){
  const K=kit(api),{THREE,M,mat,glowM,mesh,blk,cyl,cone,sph,dome,limb,lathe,gable,hip,irimoya,frame,wall,windows,house,build,hz,rng,gh}=K;
  const PL=api.ctx.plan||{sites:{}},S=PL.sites,GK=guardianKit(THREE);
  const lamp=glowM(0xffc070,1.2);
  const palm=(parts,x,z,h,lean)=>{const y=gh(x,z),tx=x+lean*h*0.3;parts.push(limb([x,y,z],[tx,y+h,z+lean*0.6],0.45,0.3,M.trunk,6));
    for(let f=0;f<7;f++){const a=f/7*Math.PI*2+lean;parts.push(limb([tx,y+h,z+lean*0.6],[tx+Math.cos(a)*4.6,y+h-1.6,z+lean*0.6+Math.sin(a)*4.6],0.55,0.1,M.leaf2,4));}};
  const fence=(parts,a,b,h,m)=>{const L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.floor(L/2.4));
    for(let k=0;k<=n;k++){const t=k/n,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;parts.push(blk(x,gh(x,z),z,0.25,h,0.25,m||M.wood2));}
    const y=Math.min(gh(...a),gh(...b));wall(parts,a,b,0.18,0.15,m||M.wood2,0,y+h*0.7);wall(parts,a,b,0.18,0.15,m||M.wood2,0,y+h*0.35);};

  return {
  // ================================================================ Kakariko Village
  kakariko(L,x,z){
    const V=S.kakariko,vy=gh(V.x,V.z),parts=[],R=rng(V.x+7),yaw=0.25,F=frame(V.x,V.z,yaw),ry=-yaw;
    // the path up the valley (w from the gate at +80 to Impa's at -78), and the houses either side on their terraces
    const rows=[];for(let k=0;k<8;k++){const w=60-k*17;for(const s of [-1,1]){rows.push([s*(17+R()*4),w+R()*4,s]);if(R()<0.75)rows.push([s*(40+R()*8),w+R()*6,s]);}}
    for(const [u,w,s] of rows){const [hx,hz_]=F(u,w),hy=gh(hx,hz_),tall=Math.abs(u)>30?1.6:0.6,bw=9+R()*3,bd=7+R()*2;
      parts.push(blk(hx,hy-1,hz_,bw+4,1+tall,bd+4,M.stone2,ry));
      house(parts,hx,hy+tall,hz_,bw,bd,3.4,yaw+(s>0?-Math.PI/2:Math.PI/2),{kind:'irimoya',wall:M.wood3,roof:R()<0.5?M.thatch:M.thatch2,rh:6.4,over:1.6,winM:M.paper,doorM:M.paper,chigi:true});
      if(R()<0.5){const [fx,fz]=F(u+s*7,w+4);fence(parts,[fx,fz],F(u+s*7,w-6),1.4,M.bark);}}
    // lanterns along the path, both sides, every ten metres; stepping stones
    for(let w=-70;w<=78;w+=10)for(const s of [-1,1]){const [lx,lz]=F(s*6.5,w),ly=gh(lx,lz);parts.push(blk(lx,ly,lz,0.3,2.6,0.3,M.wood2),blk(lx,ly+2.6,lz,1.3,0.25,1.3,M.wood2,ry));
      parts.push(blk(lx,ly+1.7,lz,0.95,0.95,0.95,lamp,ry));}
    for(let w=-72;w<=80;w+=3.2){const [sx,sz]=F((R()-0.5)*2,w);parts.push(cyl(sx,gh(sx,sz)-0.2,sz,1.2,1.2,0.35,M.stone2,7));}
    // the gate at the foot of the path: two posts, a tie beam, a little roof
    {const [gx,gz]=F(0,86),gy=gh(gx,gz);for(const s of [-1,1]){const [px,pz]=F(s*5,86);parts.push(blk(px,gy,pz,0.9,7,0.9,M.wood2,ry));}
      parts.push(blk(gx,gy+5.6,gz,12,0.6,0.8,M.wood2,ry),gable(gx,gy+7,gz,14,3.2,1.6,M.thatch2,ry));}
    // Impa's house at the head of the valley: a stone platform with steps, the house, a second tier above
    {const [ix,iz]=F(0,-82),iy=gh(ix,iz);parts.push(blk(ix,iy-1,iz,34,4,26,M.stone2,ry));
      for(let k=0;k<3;k++){const [sx,sz]=F(0,-66+k*1.6);parts.push(blk(sx,iy-1,sz,8,3-k,1.6,M.stone2,ry));}
      house(parts,ix,iy+3,iz,26,18,6,yaw+Math.PI,{kind:'hip',wall:M.wood3,roof:M.thatch2,rh:6,over:2.4,winM:M.paper,doorM:M.paper});
      parts.push(blk(ix,iy+15,iz,15,4.5,10,M.wood3,ry));irimoya(parts,ix,iy+19.5,iz,21,15,8,M.thatch2,ry);
      for(const s of [-1,1]){const [lx,lz]=F(s*9,-64);parts.push(blk(lx,gh(lx,lz),lz,1.4,3,1.4,M.stone2,ry),blk(lx,gh(lx,lz)+3,lz,1.8,1.2,1.8,lamp,ry),hip(lx,gh(lx,lz)+4.2,lz,2.6,2.6,1.4,M.stone2,ry));}}
    // trees among the houses, little gardens fenced in rows, and behind Impa's house the cliff and its waterfall
    const crowns=[M.leaf,M.leaf2,mat(0x6a9a46)];
    for(let k=0;k<30;k++){const [tx,tz]=F((R()<0.5?-1:1)*(8+R()*70),-75+R()*160),ty=gh(tx,tz),h=4+R()*3;
      parts.push(limb([tx,ty,tz],[tx,ty+h,tz],0.4,0.3,M.trunk,5),sph(tx,ty+h+1.6,tz,2.6+R()*1.4,crowns[k%3],1.2,0.9,1.2));}
    for(let k=0;k<5;k++){const gu=(k%2?1:-1)*(28+R()*20),gw=-40+k*22,G=frame(...F(gu,gw),yaw);
      for(let r=0;r<4;r++){const [a1,a2]=G(-5,-3+r*2),[b1,b2]=G(5,-3+r*2);wall(parts,[a1,a2],[b1,b2],0.4,0.9,M.leaf2,0,gh(a1,a2)-0.1);}
      fence(parts,G(-6,-4.5),G(6,-4.5),1,M.bark);fence(parts,G(6,-4.5),G(6,4.5),1,M.bark);}
    {const [cx_,cz_]=F(0,-118),cy=gh(cx_,cz_),fallM=mat(0xeaf6ff,{transparent:true,opacity:0.85,emissive:0x203038});
      // the cliff: heaped rock rising behind the house, the water coming over a notch in it
      for(let k=0;k<9;k++){const [rx,rz]=F(-48+k*12+(R()-0.5)*6,-124-R()*8);parts.push(sph(rx,cy+18+R()*16,rz,1,k%2?M.rock:M.rock2,9+R()*5,26+R()*14,9+R()*4,1));}
      for(let k=0;k<6;k++){const [rx,rz]=F(-40+k*16,-136);parts.push(sph(rx,cy+52+R()*10,rz,1,M.rock2,10,18,9,1));}
      const [wx,wz]=F(-12,-109.6);const fall=mesh(new THREE.PlaneGeometry(5,60).translate(0,30,0),fallM,wx,cy,wz,ry);fall.userData.noMerge=true;parts.push(fall);
      const [px_,pz_]=F(-12,-102);parts.push(cyl(px_,cy-0.4,pz_,7,7,0.6,M.blue2,16),sph(px_,cy+0.5,pz_,4,M.white,1.4,0.4,1.4));}
    // the Great Fairy's bud, closed, by its pond in the trees east of the village
    {const [fx,fz]=F(95,-30),fy=gh(fx,fz);parts.push(cyl(fx,fy-0.4,fz,14,14,0.6,M.blue2,20));
      parts.push(lathe([[0.1,0],[5,1],[8,5],[7.6,10],[5,14],[2,16.5],[0.1,17]],M.pink,fx,fy,fz,10),sph(fx,fy+1,fz,9,M.leaf,1.5,0.35,1.5));}
    return build(L,parts);
  },

  // ================================================================ Hateno Village, its laboratory, Fort Hateno
  hateno(L,x,z){
    const V=S.hateno,parts=[],R=rng(V.x+11);
    // the street: a winding line west to east through the village; houses either side facing it
    const street=[];for(let k=0;k<=12;k++){const t=k/12;street.push([V.x-150+t*300,V.z+Math.sin(t*5)*18+(t-0.5)*30]);}
    const roofs=[M.tile,M.tile2,M.tile,M.tileB,M.tile],cream=mat(0xe8d6a4);
    for(let k=0;k<12;k++){const [ax,az]=street[k],[bx,bz]=street[k+1],a=Math.atan2(bz-az,bx-ax);
      for(const s of [-1,1]){if(R()<0.15)continue;const d=16+R()*10,hx=(ax+bx)/2-Math.sin(a)*s*d,hz_=(az+bz)/2+Math.cos(a)*s*d,hy=gh(hx,hz_),two=R()<0.4;
        if(R()<0.15){const r=4+R()*1.5,h=two?8:5.5;parts.push(cyl(hx,hy,hz_,r,r,h,cream,12),cone(hx,hy+h,hz_,r+0.9,r*1.4,M.tile,12),blk(hx,hy,hz_+r,1.4,2.4,0.4,M.wood2));continue;}
        const st=R()<0.6;house(parts,hx,hy,hz_,9+R()*4,7+R()*2,two?6.4:3.6,a+(s>0?Math.PI:0)+Math.PI/2,{kind:'gable',wall:cream,roof:roofs[Math.floor(R()*roofs.length)],timber:!st,chimney:!st&&R()<0.7,stack:st,stackM:cream,plinth:0.6,rh:4.6});
        if(R()<0.4){const ox=hx-Math.sin(a)*s*12,oz=hz_+Math.cos(a)*s*12,oy=gh(ox,oz);house(parts,ox,oy,oz,6,5,2.8,a,{kind:'gable',wall:M.wood,roof:M.thatch,rh:3});}}}
    // the street itself, and lamps along it
    for(let k=0;k<12;k++){const [ax,az]=street[k],[bx,bz]=street[k+1];wall(parts,[ax,az],[bx,bz],0.3,4.5,M.sand3,0,Math.min(gh(ax,az),gh(bx,bz))-0.1);
      if(k%2===0){const ly=gh(ax,az);parts.push(blk(ax+3,ly,az+3,0.3,3.4,0.3,M.iron),blk(ax+3,ly+3,az+3,0.8,0.9,0.8,lamp));}}
    // fields: fenced plots of rows south of the street, wheat and greens
    const wheat=mat(0xd8c060),greens=mat(0x5a9a3a);
    for(let f=0;f<6;f++){const fx=V.x-120+f*48+R()*10,fz=V.z+70+R()*30,fyaw=R()*0.4,G=frame(fx,fz,fyaw);
      for(let r=0;r<7;r++){const [a1,a2]=G(-16,-10+r*3.2),[b1,b2]=G(16,-10+r*3.2);wall(parts,[a1,a2],[b1,b2],0.7,1.4,f%2?wheat:greens,0,gh(fx,fz)-0.2);}
      const c=[G(-18,-12),G(18,-12),G(18,12),G(-18,12)];for(let k=0;k<4;k++)fence(parts,c[k],c[(k+1)%4],1.2);}
    // the Ancient Tech Lab on the hill: a tall house, its telescope out of the roof, the furnace's blue flame
    const T=S.techlab,ty=gh(T.x,T.z),blueFlame=glowM(0x4adfff,1.6);
    house(parts,T.x,ty,T.z,14,10,8,0.2,{kind:'gable',wall:M.plaster,roof:M.slate2,timber:true,plinth:1.2,rh:5.6,chimney:true});
    parts.push(limb([T.x+3,ty+14,T.z],[T.x+16,ty+22,T.z-4],1.3,1.9,M.metal,10),cyl(T.x+16.4,ty+22.2,T.z-4.1,2.2,2.2,0.6,M.gold,10));
    parts.push(cyl(T.x-10,ty,T.z+7,1.6,1.4,3,M.iron,10),cyl(T.x-10,ty+3,T.z+7,0.6,0.6,4,M.iron,6));
    const f=sph(T.x-10,ty+4.2,T.z+7,1.3,blueFlame,1,1.7,1);f.userData.noMerge=true;parts.push(f);
    // Fort Hateno: the long wall across the way in, towers on it, and the Guardians that died against it
    const Fo=S.fort_hateno;for(let k=-8;k<8;k++){const a=[Fo.x+k*12,Fo.z+k*6],b=[Fo.x+(k+1)*12,Fo.z+(k+1)*6];if(k===0)continue;wall(parts,a,b,12,6,M.stone2,1.8);
      if(k%4===0){parts.push(cyl(a[0],gh(...a)-2,a[1],5.4,4.8,20,M.stone,12),cone(a[0],gh(...a)+18,a[1],6,7,M.slate2,12));}}
    for(let k=0;k<9;k++){const gx=Fo.x-100+hz(k)*120,gz=Fo.z+30+hz(k+3)*60;GK.fallen(parts,gx,gh(gx,gz),gz,hz(k+7)*6,k*37+5);}
    return build(L,parts);
  },

  // ================================================================ Lurelin Village
  lurelin(L,x,z){
    const V=S.lurelin,vy=gh(V.x,V.z),parts=[],R=rng(V.x+3);
    // which way is the sea: the lowest ground in a ring round the village
    let best=0,lo=1e9;for(let k=0;k<16;k++){const a=k/16*Math.PI*2,h=gh(V.x+Math.cos(a)*160,V.z+Math.sin(a)*160);if(h<lo){lo=h;best=a;}}
    const F=frame(V.x,V.z,best);   // u toward the sea
    // huts on stilts: a deck on posts, woven walls, a steep thatch, a ladder
    for(let k=0;k<16;k++){const u=-50+R()*80,w=(R()-0.5)*140,[hx,hz_]=F(u,w),hy=gh(hx,hz_);if(hy<0.6)continue;const bw=6+R()*2,bd=5+R()*2,yaw=best+R()*0.4,G=frame(hx,hz_,yaw);
      for(const [a,b] of [[-1,-1],[1,-1],[1,1],[-1,1]]){const [px,pz]=G(a*bw/2,b*bd/2);parts.push(blk(px,gh(px,pz)-0.5,pz,0.35,hy-gh(px,pz)+2.3,0.35,M.wood2));}
      house(parts,hx,hy+1.8,hz_,bw,bd,2.6,yaw,{kind:'hip',wall:M.thatch,roof:M.thatch2,rh:4.4,over:1.2,plinth:0.3,plinthM:M.wood});
      const [lx,lz]=G(bw/2+0.8,0);parts.push(limb([lx+0.6,hy,lz],[lx,hy+2,lz],0.12,0.12,M.wood2,4));}
    // piers out into the bay, boats drawn up on the sand and out on the water
    for(const w of [-30,25]){const a=F(40,w),b=F(110,w+6);const L_=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.floor(L_/5);
      wall(parts,a,b,0.4,3,M.wood,0,0.9);for(let k=0;k<=n;k++){const t=k/n,px=a[0]+(b[0]-a[0])*t,pz=a[1]+(b[1]-a[1])*t;for(const s of [-1.3,1.3])parts.push(blk(px-Math.sin(best)*s,-3,pz+Math.cos(best)*s,0.35,4.2,0.35,M.wood2));}}
    const hullG=new THREE.SphereGeometry(1,10,6,0,Math.PI*2,Math.PI/2,Math.PI/2);
    for(let k=0;k<6;k++){const [bx,bz]=F(k<3?55+R()*20:95+R()*60,(R()-0.5)*120),by=Math.max(gh(bx,bz),0.2);const b=mesh(hullG,k%2?M.wood:M.wood3,bx,by+0.8,bz,-best+R()*0.5);b.scale.set(4,1,1.3);parts.push(b);
      if(k>=3)parts.push(limb([bx,by+0.8,bz],[bx,by+6,bz],0.1,0.08,M.wood2,4));}
    // the big boat moored at the end of the pier: a long hull, a cabin with its roof, two masts with lamps
    {const [bx,bz]=F(112,-36),hull=mesh(hullG,M.wood,bx,0.9,bz,-best);hull.scale.set(12,2.2,3.6);parts.push(hull);
      parts.push(blk(bx,1,bz,10,1.2,5,M.wood3,-best),blk(bx,2.2,bz,6,3,4,M.wood,-best),hip(bx,5.2,bz,7.4,5.4,2.4,M.thatch2,-best));
      for(const u of [-6,6]){const mx=bx+Math.cos(best)*u,mz=bz+Math.sin(best)*u;parts.push(limb([mx,1,mz],[mx,11,mz],0.18,0.12,M.wood2,5),blk(mx,10,mz,0.8,0.9,0.8,lamp));}}
    // nets drying on frames, palms
    for(let k=0;k<4;k++){const [nx,nz]=F(30+R()*10,(R()-0.5)*80),ny=gh(nx,nz);parts.push(blk(nx-1.6,ny,nz,0.2,2.4,0.2,M.wood2),blk(nx+1.6,ny,nz,0.2,2.4,0.2,M.wood2),blk(nx,ny+0.6,nz,3.2,1.6,0.05,M.cloth2));}
    for(let k=0;k<18;k++){const [px,pz]=F(-70+R()*120,(R()-0.5)*200);if(gh(px,pz)>0.8)palm(parts,px,pz,8+R()*6,(R()-0.5)*0.8);}
    return build(L,parts);
  },

  // ================================================================ Tarrey Town, on its rock in Lake Akkala
  tarrey(L,x,z){
    const V=S.tarrey,vy=gh(V.x,V.z),parts=[],R=rng(V.x),lake=(PL.lakes||[]).find(l=>/Lake Akkala/.test(l.name)),lv=lake?lake.level:vy-12;
    const bright=[mat(0xd8503a),mat(0xe8b830),mat(0x3a7ad0),mat(0x4aa060),mat(0xe07a3a),mat(0x9a5ac0)],walls=mat(0xf0ece0);
    // the rock: a stack of pale drums out of the water, a little wider at the top
    parts.push(lathe([[30,lv-6],[34,lv],[32,vy-8],[38,vy-1],[40,vy],[0.1,vy]].map(([r,h])=>[r,h-lv+6]),M.rock,V.x,lv-6,V.z,14));
    // the square: paved, the tall monument in the middle - a slim red-brown shaft on a stepped base, gold at its top
    parts.push(cyl(V.x,vy-0.3,V.z,18,18,0.6,M.stone,16),blk(V.x,vy,V.z,7,1.2,7,M.stone2),blk(V.x,vy+1.2,V.z,5,1,5,M.stone2),blk(V.x,vy+2.2,V.z,2.6,20,2.6,mat(0xa8543a)),cone(V.x,vy+22.2,V.z,1.8,3,M.gold,4));
    // the houses round the square: white, two storeys, green bands at the floor and the eaves, green frames on the
    // corners and round the windows, red hipped roofs; a balcony on some
    const gtrim=mat(0x4a8a5a),redR=mat(0xb04a32);
    for(let k=0;k<7;k++){const a=k/7*Math.PI*2+0.4,r=27,hx=V.x+Math.cos(a)*r,hz_=V.z+Math.sin(a)*r,yaw=a+Math.PI/2,G=frame(hx,hz_,yaw),ry=-yaw,w=11,d=8,h=8.4;
      parts.push(blk(hx,vy,hz_,w,h,d,walls,ry),blk(hx,vy+h*0.48,hz_,w+0.3,0.5,d+0.3,gtrim,ry),blk(hx,vy+h-0.5,hz_,w+0.3,0.5,d+0.3,gtrim,ry),hip(hx,vy+h,hz_,w+1.6,d+1.6,4.2,redR,ry));
      for(const [u,v] of [[-1,-1],[1,-1],[1,1],[-1,1]]){const [cx_,cz_]=G(u*w/2,v*d/2);parts.push(blk(cx_,vy,cz_,0.5,h,0.5,gtrim,ry));}
      for(const fl of [0,1])for(const u of [-3,3]){const [wx,wz]=G(u,-d/2-0.12);parts.push(blk(wx,vy+1.2+fl*4.2,wz,2,2.2,0.2,gtrim,ry),blk(wx,vy+1.5+fl*4.2,wz,1.4,1.6,0.25,M.dark,ry));}
      if(k%2===0){const [bx,bz]=G(0,-d/2-1);parts.push(blk(bx,vy+4.1,bz,6,0.3,2,M.wood,ry),blk(bx,vy+4.4,bz-0,6,1,0.15,M.wood2,ry));}}
    // golden-leaved trees round the rim
    const goldLeaf=mat(0xe8b830),goldLeaf2=mat(0xd89a2a);
    for(let k=0;k<10;k++){const a=k/10*Math.PI*2,tx=V.x+Math.cos(a)*36,tz=V.z+Math.sin(a)*36;parts.push(limb([tx,vy,tz],[tx,vy+5,tz],0.4,0.3,M.trunk,5),sph(tx,vy+7,tz,3.2,k%2?goldLeaf:goldLeaf2,1.2,1,1.2));}
    // the arch over the way in, and the walkway out across the water to the west shore
    const w0=[V.x-38,V.z],w1=[V.x-150,V.z+20];
    for(const s of [-1,1])parts.push(cyl(V.x-36,vy,V.z+s*4,0.8,0.8,9,M.wood,8));
    {const pts=[];for(let k=0;k<=10;k++){const t=k/10;pts.push(new THREE.Vector3(V.x-36,vy+9+Math.sin(t*Math.PI)*3,V.z-4+t*8));}parts.push(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),12,0.6,6),bright[1]));}
    wall(parts,w0,w1,0.5,3,M.wood,0,lv+1.2);
    {const n=12;for(let k=0;k<=n;k++){const t=k/n,px=w0[0]+(w1[0]-w0[0])*t,pz=w0[1]+(w1[1]-w0[1])*t;parts.push(blk(px,lv-3,pz,0.4,4.6,3.4,M.wood2));}}
    return build(L,parts);
  },
  };
}
