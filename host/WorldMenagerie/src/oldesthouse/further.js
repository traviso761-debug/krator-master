// ---------- further: the Foundation, the Investigations Sector and the Oceanview Motel, the Astral Plane ----------
// Fan work after Remedy Entertainment's Control (2019) and its expansions The Foundation and AWE; nothing of theirs
// is used. Built from the kit (kit.js) into the shared Builder; light baked from the fittings registered here.
//
//   the Foundation      under everything: caverns of black rock, faceted, the roof hung with it; the landing where
//                       the Executive's lift shaft comes through the roof, the scaffold and the hoist down; grated
//                       walkways; the Bureau's base camp (tents, crates, work lights, terminals); the chasm and its
//                       bridge; clusters of astral crystal, red and teal; and at the Crossroads the Nail - a black
//                       spike from the floor to the roof, its seams glowing (event: the Nail)
//   Investigations      round rooms on cross axes off a round hub, panelled; the offices, the evidence room; and to
//                       the south the Oceanview Motel: a corridor of numbered doors in blue light, the front desk,
//                       the vending machine, the sign - and one door with a black triangle on it
//   the Astral Plane    a white void over a floor of pale tile; black slabs floating; the great black inverted
//                       pyramid hanging in the white, turning (event: the Board)
// Coordinates: x east, z south, y up. Origins from C.sectors.foundation / investigations / astral.

export function buildFurther(K){
  const {THREE,C,B,F,lights,dyn,rnd}=K;
  const SEC=C.sectors,FO=SEC.foundation.at,IO=SEC.investigations.at,AO=SEC.astral.at;
  const R=(a,b)=>a+(b-a)*rnd();

  // ---- a faceted rock: an icosahedron, its corners pushed about, scaled and turned; triangles as quads ----
  const icoP=new THREE.IcosahedronGeometry(1,0).toNonIndexed().attributes.position.array;
  function rock(m,x,y,z,sx,sy,sz,j=0.28,yaw=R(0,6.283)){
    const map=new Map(),cy=Math.cos(yaw),sy_=Math.sin(yaw);
    const get=i=>{const px=icoP[i*3],py=icoP[i*3+1],pz=icoP[i*3+2],k=px.toFixed(3)+','+py.toFixed(3)+','+pz.toFixed(3);
      if(!map.has(k)){const f=1+(rnd()-0.5)*2*j,X=px*sx*f,Y=py*sy*f,Z=pz*sz*f;map.set(k,[x+X*cy+Z*sy_,y+Y,z-X*sy_+Z*cy]);}return map.get(k);};
    const cell=B.cell;B.cell=14;   /* rocks are lit coarsely: few cells */
    for(let t=0;t<icoP.length/9;t++){const a=get(t*3),b=get(t*3+1),c=get(t*3+2);
      B.quad(m,a,b,c,c,[(a[0]+b[0]+c[0])/3-x,(a[1]+b[1]+c[1])/3-y,(a[2]+b[2]+c[2])/3-z]);}
    B.cell=cell;}
  // a spike: a faceted tapering column from (x,y,z) up h, base radius r, in n courses, each a little off
  function spike(m,x,y,z,r,h,n=8,sides=7){let px=x,pz=z;const cell=B.cell;B.cell=12;
    for(let k=0;k<n;k++){const r0=r*(1-k/n)+0.4,r1=r*(1-(k+1)/n)+0.4,y0=y+h*k/n,y1=y+h*(k+1)/n,ox=(rnd()-0.5)*r*0.06,oz=(rnd()-0.5)*r*0.06,tw=k*0.21;
      for(let i=0;i<sides;i++){const a=tw+i/sides*6.283,b=tw+(i+1)/sides*6.283,ma=(a+b)/2;
        B.quad(m,[px+Math.cos(a)*r0,y0,pz+Math.sin(a)*r0],[px+Math.cos(b)*r0,y0,pz+Math.sin(b)*r0],[px+ox+Math.cos(b+0.21)*r1,y1,pz+oz+Math.sin(b+0.21)*r1],[px+ox+Math.cos(a+0.21)*r1,y1,pz+oz+Math.sin(a+0.21)*r1],[Math.cos(ma),0,Math.sin(ma)]);}
      px+=ox;pz+=oz;}
    B.cell=cell;}

  // =================================================================== THE FOUNDATION
  {const [fx,fy,fz]=FO,FL=fy-110,RF=fy-3;   /* the cave floor and its roof */
    const W=250,ch={x0:fx-232,x1:fx-40,z0:fz+92,z1:fz+142};   /* the chasm */
    // the floor, round the chasm; the chasm's walls down into the dark
    const fq=(x0,z0,x1,z1)=>B.quad('rock',[x0,FL,z0],[x1,FL,z0],[x1,FL,z1],[x0,FL,z1],[0,1,0]);
    fq(fx-W,fz-W,fx+W,ch.z0);fq(fx-W,ch.z1,fx+W,fz+W);fq(fx-W,ch.z0,ch.x0,ch.z1);fq(ch.x1,ch.z0,fx+W,ch.z1);
    const CB=fy-138;B.quad('black',[ch.x0,CB,ch.z0],[ch.x1,CB,ch.z0],[ch.x1,CB,ch.z1],[ch.x0,CB,ch.z1],[0,1,0]);
    B.quad('rockBlack',[ch.x0,CB,ch.z0],[ch.x1,CB,ch.z0],[ch.x1,FL,ch.z0],[ch.x0,FL,ch.z0],[0,0,1]);
    B.quad('rockBlack',[ch.x0,CB,ch.z1],[ch.x1,CB,ch.z1],[ch.x1,FL,ch.z1],[ch.x0,FL,ch.z1],[0,0,-1]);
    B.quad('rockBlack',[ch.x0,CB,ch.z0],[ch.x0,CB,ch.z1],[ch.x0,FL,ch.z1],[ch.x0,FL,ch.z0],[1,0,0]);
    B.quad('rockBlack',[ch.x1,CB,ch.z0],[ch.x1,CB,ch.z1],[ch.x1,FL,ch.z1],[ch.x1,FL,ch.z0],[-1,0,0]);
    for(let k=0;k<14;k++){const x=R(ch.x0+6,ch.x1-6),s=R(0,1)<0.5?-1:1,z=s<0?ch.z0-R(2,8):ch.z1+R(2,8);rock('rock',x,FL-R(1,4),z,R(5,12),R(3,7),R(5,10));}
    // the walls and the roof: a box of rock to close the cave, a hole in the roof where the lift shaft comes in
    const SH={x:126,z:65,h:7};   /* under the Executive's shaft (executive.js builds it at x 120..132, z 60..70) */
    for(const [k,P0,P1,inw] of [['n',[fx-W,fz-W],[fx+W,fz-W],[0,0,1]],['s',[fx-W,fz+W],[fx+W,fz+W],[0,0,-1]],['w',[fx-W,fz-W],[fx-W,fz+W],[1,0,0]],['e',[fx+W,fz-W],[fx+W,fz+W],[-1,0,0]]])
      B.quad('rockBlack',[P0[0],FL,P0[1]],[P1[0],FL,P1[1]],[P1[0],RF,P1[1]],[P0[0],RF,P0[1]],inw);
    {const hx0=fx+SH.x-SH.h,hx1=fx+SH.x+SH.h,hz0=fz+SH.z-SH.h,hz1=fz+SH.z+SH.h,rq=(x0,z0,x1,z1)=>B.quad('rockBlack:ceil',[x0,RF,z0],[x0,RF,z1],[x1,RF,z1],[x1,RF,z0],[0,-1,0]);
      rq(fx-W,fz-W,fx+W,hz0);rq(fx-W,hz1,fx+W,fz+W);rq(fx-W,hz0,hx0,hz1);rq(hx1,hz0,fx+W,hz1);}
    // boulders heaped along the walls, slabs leaning, rock hanging from the roof
    for(let k=0;k<64;k++){const side=k%4,u=R(-W+20,W-20),d=W-R(8,30),x=fx+(side===0?u:side===1?u:side===2?-d:d),z=fz+(side===0?-d:side===1?d:u);
      rock('rockBlack',x,FL+R(5,40),z,R(14,30),R(16,40),R(12,26));}
    for(let k=0;k<46;k++){let x=fx+R(-W+15,W-15),z=fz+R(-W+15,W-15);if(Math.hypot(x-fx-SH.x,z-fz-SH.z)<26||Math.hypot(x-fx,z-fz)<30)continue;
      rock('rockBlack:ceil',x,RF-R(4,14),z,R(8,20),R(8,22),R(8,18));}
    for(let k=0;k<40;k++){let x=fx+R(-W+30,W-30),z=fz+R(-W+30,W-30);
      if(Math.hypot(x-fx,z-fz)<40||(x>ch.x0-12&&x<ch.x1+12&&z>ch.z0-12&&z<ch.z1+12)||Math.hypot(x-(fx-130),z-(fz-140))<45||Math.hypot(x-fx-SH.x,z-fz-SH.z)<30)continue;
      rock(R(0,1)<0.25?'rockRed':'rock',x,FL+R(0,3),z,R(3,11),R(2,8),R(3,10));}
    // the Nail, at the Crossroads: a black spike from the floor to the roof
    spike('rockBlack',fx,FL-2,fz,15,RF-FL+2,12,7);
    for(let k=0;k<10;k++){const a=k/10*6.283;rock('rockBlack',fx+Math.cos(a)*20,FL+1,fz+Math.sin(a)*20,R(5,9),R(3,6),R(5,9));}
    lights.add([fx,FL+8,fz],0xff3a2a,1.0,70);lights.add([fx,FL+50,fz],0xff4a3a,0.6,60);
    // its seams: glowing lines winding up it, moving things (they pulse)
    const seamM=new THREE.MeshBasicMaterial({color:0xff3a22,fog:true}),seams=[];
    for(let s=0;s<3;s++){const pts=[],H=RF-FL,a0=s*2.1;for(let i=0;i<=60;i++){const t=i/60,y=FL+t*H*0.96,r=15*(1-t)+0.4+0.3,a=a0+t*5.2+Math.sin(t*23+s)*0.12;pts.push(new THREE.Vector3(fx+Math.cos(a)*r,y,fz+Math.sin(a)*r));}
      const m=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),120,0.7,5,false),seamM);m.userData.noFingerprint=true;dyn.add(m);seams.push(m);}
    // the landing under the lift shaft: a grated deck, the shaft's last length of concrete, the scaffold tower
    // and the hoist down to the floor, a ladder
    const LX=fx+SH.x,LZ=fz+SH.z,LY=fy-30;
    B.box('grate',LX-12,LY-0.3,LZ-12,LX+12,LY,LZ+12);
    /* the shaft's last length: four walls, seen from inside and out, open for the bottom three metres */
    for(const [a,b] of [[[-SH.h,-SH.h],[SH.h,-SH.h]],[[SH.h,-SH.h],[SH.h,SH.h]],[[SH.h,SH.h],[-SH.h,SH.h]],[[-SH.h,SH.h],[-SH.h,-SH.h]]])for(const sg of [1,-1])
      B.quad('concrete',[LX+a[0],LY+3,LZ+a[1]],[LX+b[0],LY+3,LZ+b[1]],[LX+b[0],RF,LZ+b[1]],[LX+a[0],RF,LZ+a[1]],[sg*(a[0]+b[0]),0,sg*(a[1]+b[1])]);
    for(const [p,q] of [[[-12,-12],[12,-12]],[[12,-12],[12,12]],[[12,12],[-12,12]]])F.rail([LX+p[0],LY,LZ+p[1]],[LX+q[0],LY,LZ+q[1]]);
    for(const sx of [-10,10])for(const sz of [-10,10])B.blk('steelDark',LX+sx,FL,LZ+sz,0.4,LY-FL,0.4);
    for(let y=FL+8;y<LY;y+=8){B.beam('steelDark',[LX-10,y,LZ-10],[LX+10,y,LZ-10],0.25,0.25);B.beam('steelDark',[LX-10,y,LZ+10],[LX+10,y,LZ+10],0.25,0.25);
      B.beam('steelDark',[LX-10,y,LZ-10],[LX-10,y,LZ+10],0.25,0.25);B.beam('steelDark',[LX+10,y,LZ-10],[LX+10,y,LZ+10],0.25,0.25);
      B.beam('steelDark',[LX-10,y,LZ+10],[LX+10,y+8,LZ+10],0.15,0.15);}
    B.box('yellow',LX-4,FL,LZ-4,LX+4,FL+0.4,LZ+4);B.box('steel',LX-3.6,FL+0.4,LZ-3.6,LX-3.4,FL+3,LZ+3.6);B.box('steel',LX+3.4,FL+0.4,LZ-3.6,LX+3.6,FL+3,LZ+3.6);
    B.box('steel',LX-3.6,FL+3,LZ-3.6,LX+3.6,FL+3.2,LZ+3.6);B.beam('steelDark',[LX,FL+3.2,LZ],[LX,LY+3,LZ],0.08,0.08);
    for(let y=FL;y<LY;y+=0.4)B.box('steelDark',LX+10.4,y,LZ-0.4,LX+10.5,y+0.05,LZ+0.4);
    F.lamp(LX,LY+6,LZ,0xfff0d8,1.0,30);
    // a grated walkway from the landing out over the floor to an overlook on the Nail, on posts
    const wk=[[LX-12,LZ],[fx+60,fz+60],[fx+34,fz+20]];
    for(let i=0;i+1<wk.length;i++){const [a,b]=[wk[i],wk[i+1]],L=Math.hypot(b[0]-a[0],b[1]-a[1]),ux=(b[0]-a[0])/L,uz=(b[1]-a[1])/L,nx=-uz,nz=ux;
      B.quad('grate',[a[0]+nx*1.5,LY,a[1]+nz*1.5],[b[0]+nx*1.5,LY,b[1]+nz*1.5],[b[0]-nx*1.5,LY,b[1]-nz*1.5],[a[0]-nx*1.5,LY,a[1]-nz*1.5],[0,1,0]);
      F.rail([a[0]+nx*1.5,LY,a[1]+nz*1.5],[b[0]+nx*1.5,LY,b[1]+nz*1.5]);F.rail([a[0]-nx*1.5,LY,a[1]-nz*1.5],[b[0]-nx*1.5,LY,b[1]-nz*1.5]);
      for(let t=0;t<=L;t+=14)B.blk('steelDark',a[0]+ux*t,FL,a[1]+uz*t,0.35,LY-FL,0.35);}
    {const [ox,oz]=wk[2];B.box('grate',ox-6,LY-0.3,oz-6,ox+6,LY,oz+6);F.rail([ox-6,LY,oz-6],[ox-6,LY,oz+6]);F.rail([ox-6,LY,oz+6],[ox+6,LY,oz+6]);F.rail([ox-6,LY,oz-6],[ox+6,LY,oz-6]);
      F.lamp(ox+5,LY+2,oz+5,0xfff0d8,0.8,24);}
    // the chasm's bridge: a plank deck on steel, rails, lamps at either end
    {const bx=ch.x0+70,z0=ch.z0-6,z1=ch.z1+6,y=FL+0.4;B.box('steelDark',bx-2.2,y-0.8,z0,bx+2.2,y-0.3,z1);B.box('wood',bx-2,y-0.3,z0,bx+2,y,z1);
      F.rail([bx-2,y,z0],[bx-2,y,z1]);F.rail([bx+2,y,z0],[bx+2,y,z1]);F.lamp(bx+3,FL+3,z0-2,0xfff0d8,0.9,26);F.lamp(bx-3,FL+3,z1+2,0xfff0d8,0.9,26);
      for(let k=0;k<4;k++)B.blk('steelDark',bx,CB,z0+6+k*(z1-z0-12)/3,1,FL-CB-1,1);}
    // the base camp: tents, crates, tables and terminals, work lights on tripods, a generator
    {const cx=fx-130,cz=fz-140;
      const tent=(x,z,yaw,w=6,d=8,h=3.6,m='yellow')=>{B.at(x,FL,z,yaw);B.quad(m,[-w/2,0,-d/2],[0,h,-d/2],[0,h,d/2],[-w/2,0,d/2],[-1,1,0]);B.quad(m,[w/2,0,-d/2],[w/2,0,d/2],[0,h,d/2],[0,h,-d/2],[1,1,0]);
        B.quad(m,[-w/2,0,-d/2],[w/2,0,-d/2],[0,h,-d/2],[0,h,-d/2],[0,0,-1]);B.box('steelDark',-0.05,0,d/2,0.05,h,d/2+0.1);B.pop();};
      tent(cx-14,cz-8,0.3);tent(cx+2,cz-14,-0.2);tent(cx+18,cz-6,0.5,7,9,4,'panel');tent(cx-20,cz+12,1.6);
      for(let k=0;k<22;k++){const x=cx+R(-26,26),z=cz+R(-4,26),s=R(1,1.8);B.blk('wood',x,FL,z,s,s*0.8,s);if(R(0,1)<0.4)B.blk('wood',x,FL+s*0.8,z,s*0.8,s*0.7,s*0.8);}
      for(let k=0;k<3;k++){const x=cx-6+k*7,z=cz+4;B.blk('steel',x,FL+0.75,z,3,0.08,1.4);for(const sx of [-1.3,1.3])B.blk('steelDark',x+sx,FL,z,0.08,0.75,1.2);F.terminal(x,FL+0.83,z-0.3,0);}
      B.blk('yellow',cx+14,FL,cz+14,3,1.8,2);B.blk('steelDark',cx+14,FL+1.8,cz+14,0.4,1.2,0.4);
      for(const [x,z] of [[cx-28,cz-20],[cx+24,cz-22],[cx-6,cz+28],[cx+30,cz+20],[cx-30,cz+20]]){for(let k=0;k<3;k++){const a=k*2.09;B.beam('steelDark',[x+Math.cos(a)*1.4,FL,z+Math.sin(a)*1.4],[x,FL+5,z],0.08,0.08);}
        B.blk('lightWhite',x,FL+5,z,0.9,0.6,0.5);lights.add([x,FL+5,z],0xffffff,1.25,40);}}
    // astral crystals: clusters of spikes, red and teal, glowing, along the walls, at the Nail, over the chasm
    const crystG=new THREE.ConeGeometry(1,1,5).translate(0,0.5,0),dm=new THREE.Object3D(),CR=[],CT=[];
    const cluster=(x,y,z,list,col,n,s)=>{for(let i=0;i<n;i++){dm.position.set(x+R(-2,2)*s/3,y,z+R(-2,2)*s/3);dm.rotation.set(R(-0.7,0.7),R(0,6.28),R(-0.7,0.7));const h=s*R(0.6,1.8);dm.scale.set(s*0.18,h,s*0.18);dm.updateMatrix();list.push(dm.matrix.clone());}
      lights.add([x,y+s,z],col,1.3,34);};
    const spots=[[fx+30,fz-26],[fx-26,fz+24],[fx-18,fz-30],[ch.x0+30,ch.z0-4],[ch.x1-20,ch.z1+6],[fx+200,fz-180],[fx-200,fz-60],[fx+180,fz+190],[fx-60,fz+210],[fx+90,fz-90],[fx-150,fz+60],[fx+220,fz+40],[fx+30,fz+180],[fx-200,fz-200]];
    spots.forEach(([x,z],k)=>{const red=k%2===0;cluster(x,FL,z,red?CR:CT,red?0xff3a3a:0x3affe8,6+k%4,R(4,9));});
    const mkC=(list,c)=>{const im=new THREE.InstancedMesh(crystG,new THREE.MeshBasicMaterial({color:c,fog:true}),list.length);list.forEach((m,i)=>im.setMatrixAt(i,m));im.userData.noFingerprint=true;dyn.add(im);return im;};
    const imR=mkC(CR,0xff4a4a),imT=mkC(CT,0x4affe8);
    // the cave's air: near-black with a teal cast, and its own light
    lights.zone([fx-W,fy-140,fz-W],[fx+W,fy+2,fz+W],0x34403f,0.8);
    /* floodlights on stands round the cave, aimed in */
    for(let k=0;k<12;k++){const a=k/12*6.283+0.2,x=fx+Math.cos(a)*175,z=fz+Math.sin(a)*175;if(x>ch.x0-10&&x<ch.x1+10&&z>ch.z0-10&&z<ch.z1+10)continue;
      B.beam('steelDark',[x,FL,z],[x,FL+9,z],0.15,0.15);B.blk('lightWhite',x,FL+9,z,1.4,0.9,0.6);lights.add([x,FL+9,z],0xf0f4ff,1.5,95);}
    for(const [x,z] of [[fx-160,fz+170],[fx+150,fz-150],[fx+170,fz+60],[fx-60,fz-190]]){B.blk('lightWhite',x,FL+6,z,0.8,0.5,0.5);B.beam('steelDark',[x,FL,z],[x,FL+6,z],0.1,0.1);lights.add([x,FL+6,z],0xfff4e0,1.1,42);}
    K.zones.push({c:[fx,fy-60,fz],r:230,color:'#0c1c20',density:0.0042});
    // the Nail breathes: its seams pulse, the crystals shimmer; the event makes them flare
    const NAIL={flare:0};K.anchors.nail={x:fx,y:FL,z:fz,H:RF-FL};
    K.hooks.push(t=>{const f=NAIL.flare,k=0.55+0.35*Math.sin(t*1.7)+f*1.4;seamM.color.setRGB(Math.min(1,k),0.23*k,0.13*k);
      imR.material.color.setRGB(Math.min(1,0.75+0.15*Math.sin(t*2.3)+f*0.6),0.29+f*0.4,0.29+f*0.3);imT.material.color.setRGB(0.29+f*0.5,Math.min(1,0.8+0.15*Math.sin(t*1.9+1)+f*0.4),Math.min(1,0.75+f*0.4));});
    K.cards.fu_foundation={h:'The Foundation',p:'Under the Oldest House, under its concrete: caverns of black rock that the Bureau has only begun to map. Scaffolding and grated walkways, a base camp of tents and work lights, a chasm crossed by a plank bridge, and everywhere clusters of astral crystal glowing red and teal.',sub:'The Executive\'s lift shaft comes down through the roof to the landing.'};
    K.cards.fu_nail={h:'The Nail',p:'At the Crossroads a black spike rises from the cave floor to its roof, onyx-dark and cracked with seams that glow. Some in the Bureau think it is the heart of the House; some that it is a foreign body driven into it; some that it holds the House down.',sub:'Events: the Nail.'};
    K.cards.fu_camp={h:'Base camp',p:'The Bureau\'s foothold in the Foundation: canvas tents, crates of equipment, folding tables with terminals, a generator, and work lights on tripods against the dark.',sub:''};
    K.cards.fu_chasm={h:'The chasm',p:'A rift across the cave floor, too deep for the work lights to find the bottom. A plank bridge on steel crosses it.',sub:''};
    K.cards.fu_landing={h:'The lift landing',p:'Where the shaft from the Executive Sector comes through the cave roof: a grated deck, a scaffold tower and a construction hoist down to the floor, and a walkway out to an overlook on the Nail.',sub:''};
    K.views.push({name:'The Foundation',group:'Further',cut:false,t:[fx-20,FL+30,fz+20],d:230,yaw:0.8,pitch:0.32,card:'fu_foundation'},
      {name:'The Nail',group:'Further',cut:false,t:[fx,FL+40,fz],d:110,yaw:2.3,pitch:0.12,card:'fu_nail'},
      {name:'Base camp',group:'Further',cut:false,t:[fx-130,FL+3,fz-130],d:48,yaw:0.4,pitch:0.28,card:'fu_camp'},
      {name:'The chasm',group:'Further',cut:false,t:[ch.x0+70,FL-6,(ch.z0+ch.z1)/2],d:60,yaw:1.2,pitch:0.22,card:'fu_chasm'},
      {name:'The lift landing',group:'Further',cut:false,t:[LX,LY-10,LZ],d:60,yaw:-0.5,pitch:0.2,card:'fu_landing'});
    K.places.push(['the Nail',[fx,FL+40,fz],40],['the Foundation\'s base camp',[fx-130,FL+5,fz-130],45],['the chasm',[ch.x0+90,FL,(ch.z0+ch.z1)/2],70],['the lift landing',[LX,LY,LZ],22],['the Foundation',[fx,fy-70,fz],300]);
    K.events.push({key:'nail',label:'The Nail',card:'fu_nail',view:{t:[fx,FL+40,fz],d:120,yaw:2.0,pitch:0.15,cut:false},
      start(){let T0=null;return {update(t,dt,camera){if(T0===null)T0=t;const u=t-T0;
        NAIL.flare=u<1.2?u/1.2:u<6?1:Math.max(0,1-(u-6)/3);
        if(u>1&&u<6.5&&camera){const a=0.25*NAIL.flare;camera.position.x+=(Math.random()-0.5)*a;camera.position.y+=(Math.random()-0.5)*a;camera.position.z+=(Math.random()-0.5)*a;}
        if(u>9.5){NAIL.flare=0;return false;}}};}});
  }

  // =================================================================== INVESTIGATIONS, AND THE OCEANVIEW MOTEL
  {const [ix,iy,iz]=IO,H=8,PANEL={floor:'terrazzo',wall:'panel',ceil:'ceiling:ceil'};
    // a round room: walls of panel facing in, doorways at the given angles (width w), a lintel over each; a
    // terrazzo floor, a ceiling, a ring of lights
    const roundRoom=(cx,cz,r,h,doors,w=5,fl='terrazzo')=>{const da=w/r,segs=[];let list=doors.map(a=>((a%6.283)+6.283)%6.283).sort((a,b)=>a-b);
      if(!list.length)B.cyl('panel',cx,iy,cz,r,r,h,28,{inward:true});
      for(let i=0;i<list.length;i++){const a0=list[i]+da/2,a1=list[(i+1)%list.length]-da/2+(i+1===list.length?6.283:0);
        const n=Math.max(2,Math.round((a1-a0)/6.283*28));B.cyl('panel',cx,iy,cz,r,r,h,n,{inward:true,a0,a1});
        B.cyl('panel',cx,iy+3.4,cz,r,r,h-3.4,2,{inward:true,a0:list[i]-da/2,a1:list[i]+da/2});}
      B.ring(fl,cx,iy+0.01,cz,0.01,r,24);B.ring('ceiling:ceil',cx,iy+h,cz,0.01,r,24,true);
      for(let k=0;k<8;k++){const a=k/8*6.283;F.panel(cx+Math.cos(a)*r*0.62,iy+h,cz+Math.sin(a)*r*0.62,1.4,0.6,0.85,r*0.9);}
      B.cyl('concreteDark',cx,iy,cz,r-0.1,r-0.1,0.3,28,{inward:true});};
    // a corridor along an axis between two points, width w, open at both ends
    const corridor=(x0,z0,x1,z1,w=5,h=4)=>{if(x0===x1){const za=Math.min(z0,z1),zb=Math.max(z0,z1);B.room({floor:'carpetGrey',wall:'panel',ceil:'ceiling:ceil'},x0-w/2,iy,za,x0+w/2,iy+h,zb,{n:[[0,w,h]],s:[[0,w,h]]});F.panels(x0,za+2,x0,zb-2,iy+h,6,0.8,10);}
      else{const xa=Math.min(x0,x1),xb=Math.max(x0,x1);B.room({floor:'carpetGrey',wall:'panel',ceil:'ceiling:ceil'},xa,iy,z0-w/2,xb,iy+h,z0+w/2,{w:[[0,w,h]],e:[[0,w,h]]});F.panels(xa+2,z0,xb-2,z0,iy+h,6,0.8,10);}};
    // the hub, the four axes, the round rooms
    const HR=24;roundRoom(ix,iz,HR,12,[-Math.PI/2,0,Math.PI/2,Math.PI],6);
    for(let k=0;k<8;k++){const a=k/8*6.283+0.39;F.pier(ix+Math.cos(a)*15,iy,iz+Math.sin(a)*15,2.4,1.2,12,-a+Math.PI/2);}
    B.cyl('wood',ix,iy,iz,5,5,1.1,20,{caps:true});B.ring('carpet',ix,iy+0.02,iz,6,12,24);
    corridor(ix,iz-160,ix,iz-104,6,5);roundRoom(ix,iz-88,16,8,[-Math.PI/2,Math.PI/2],6);corridor(ix,iz-72,ix,iz-HR,6,5);   /* north: from the Executive corridor */
    corridor(ix+HR,iz,ix+64,iz,5,4);roundRoom(ix+80,iz,16,8,[Math.PI],5);   /* east: the offices */
    corridor(ix-64,iz,ix-HR,iz,5,4);roundRoom(ix-80,iz,16,8,[0],5);   /* west: evidence */
    corridor(ix,iz+HR,ix,iz+62,5,4);   /* south: to the motel */
    // the offices: cubicles in a ring, the evidence room: shelves, cabinets, tables of boxed evidence
    for(let k=0;k<8;k++){const a=k/8*6.283+0.39;F.cubicle(ix+80+Math.cos(a)*9,iy,iz+Math.sin(a)*9,-a-Math.PI/2);}
    for(let k=0;k<10;k++){const a=k/10*6.283;if(Math.abs(Math.sin(a/2))<0.2)continue;F.shelves(ix-80+Math.cos(a)*14.6,iy,iz+Math.sin(a)*14.6,-a+Math.PI/2,4,2.6);}
    for(let k=0;k<3;k++){const x=ix-84+k*4;B.blk('steel',x,iy+0.8,iz,2.4,0.06,4.4);for(const sz of [-2,2])B.blk('steelDark',x,iy,iz+sz,2.2,0.8,0.08);
      for(let b=0;b<4;b++)B.blk(b%2?'paper':'carpetGrey',x+R(-0.8,0.8),iy+0.86,iz+R(-1.6,1.6),R(0.4,0.8),R(0.3,0.6),R(0.4,0.7));}
    for(let k=0;k<6;k++)F.cabinet(ix-80+R(-4,4),iy,iz-8+k*1.0,0);
    // the north room: a reception, the Bureau seal let into the floor (a ring), benches
    B.ring('carpet',ix,iy+0.02,iz-88,4,7,24);B.ring('brass',ix,iy+0.03,iz-88,7,7.4,24);
    for(const s of [-1,1])B.blk('wood',ix+s*9,iy,iz-88,1,0.45,6);
    lights.zone([ix-160,iy-1,iz-160],[ix+160,iy+51,iz+60],0x4a4844,0.3);
    // ---- the Oceanview Motel: the lobby, then the corridor south ----
    const MZ=iz+62,ML=iz+82,MH=3.2;
    B.room({floor:'carpetDark',wall:'motel',ceil:'ceiling:ceil'},ix-12,iy,MZ,ix+12,iy+5,ML,{n:[[9.5,14.5,4]],s:[[9.5,14.5,MH]]});
    B.blk('wood',ix-3,iy,MZ+10,10,1.1,1.6);B.blk('woodDark',ix-3,iy+1.1,MZ+10,10.2,0.06,1.8);   /* the front desk */
    B.blk('woodDark',ix-3,iy+1.4,MZ+4.3,8,2.2,0.15);for(let r=0;r<3;r++)for(let c=0;c<8;c++)B.blk('brass',ix-6.5+c*1,iy+1.8+r*0.6,MZ+4.4,0.08,0.25,0.06);   /* the keys on their board */
    B.blk('brass',ix-5,iy+1.16,MZ+10,0.2,0.12,0.2);   /* the bell */
    B.blk('red',ix+9.5,iy,MZ+14,1.6,2.2,1);B.blk('lightWhite',ix+9.5,iy+0.9,MZ+13.46,1.2,1.1,0.06);lights.add([ix+9.5,iy+1.5,MZ+13],0xd8e8ff,0.6,6);   /* the vending machine */
    B.blk('lightBlue',ix,iy+4.2,MZ+0.3,9,0.6,0.1);for(let k=0;k<9;k++)B.blk('lightWhite',ix-3.6+k*0.9,iy+4.25,MZ+0.38,0.5,0.5,0.06);   /* the sign */
    B.blk('carpetGrey',ix+6,iy,MZ+5,3,0.45,1.2);B.blk('carpetGrey',ix+6,iy+0.45,MZ+4.5,3,0.6,0.2);F.plant(ix+10,iy,MZ+2,1);
    for(const x of [ix-8,ix+2])lights.add([x,iy+4.6,MZ+8],0x7a9aff,1.0,14);
    const CE=iz+152;
    B.room({floor:'carpetDark',wall:'motel',ceil:'ceiling:ceil'},ix-2.5,iy,ML,ix+2.5,iy+MH,CE,{n:[[0,5,MH]]});
    let n=101;for(let z=ML+4;z<CE-3;z+=6){for(const s of [-1,1]){const x=ix+s*2.48,yaw=s>0?Math.PI/2:-Math.PI/2;
        F.doorframe(x,iy,z,yaw,1.1,2.2,'woodDark');B.blk('woodDark',x-s*0.03,iy,z,0.06,2.2,1.1);B.blk('brass',x-s*0.08,iy+1.7,z,0.03,0.18,0.3);
        if(n===113&&s>0){/* the wrong door: a black triangle, point down */B.quad('black',[x-0.1,iy+1.95,z-0.42],[x-0.1,iy+1.95,z+0.42],[x-0.1,iy+1.2,z],[x-0.1,iy+1.2,z],[-1,0,0]);}
        n++;}
      lights.add([ix,iy+3.0,z],0x5a7aff,0.95,9);B.blk('lightBlue',ix,iy+MH-0.08,z,0.8,0.08,0.4);}
    B.blk('lightRed',ix,iy+2.6,CE-0.08,1.4,0.35,0.06);   /* EXIT */
    lights.zone([ix-13,iy-1,MZ],[ix+13,iy+6,CE+1],0x1a2448,0.85);
    K.zones.push({c:[ix,iy+2,(MZ+CE)/2],r:60,color:'#0a1442',density:0.02});
    K.anchors.motelDoor=[ix+2.4,iy+1.6,ML+4+6*6];
    K.cards.fu_investigations={h:'The Investigations Sector',p:'Round rooms on cross axes off a round hub, panelled and lit in rings: the offices with their cubicles, the evidence room of shelves and boxed things, a reception with the Bureau seal let into its floor. Investigations goes out into the world after what the House cannot hold.',sub:'The corridor from the Executive Sector comes in from the north.'};
    K.cards.fu_evidence={h:'The evidence room',p:'Shelving round the curve of the wall, filing cabinets, tables of boxed and bagged evidence waiting to be catalogued, each item an Altered World Event in miniature.',sub:''};
    K.cards.fu_motel={h:'The Oceanview Motel',p:'Down a corridor from Investigations, a motel that should not be inside the House: a lobby with its front desk, its board of keys, a vending machine humming under a blue sign, and a corridor of numbered doors in blue light. Every door opens on the same room. Almost every door.',sub:''};
    K.cards.fu_triangle={h:'Room 113',p:'One door down the corridor carries a black triangle, point down - the Board\'s own mark. Behind it the motel is somewhere else.',sub:''};
    K.views.push({name:'Investigations hub',group:'Further',cut:false,t:[ix,iy+4,iz],d:30,yaw:0.7,pitch:0.32,card:'fu_investigations'},
      {name:'The evidence room',group:'Further',cut:false,t:[ix-80,iy+2,iz],d:16,yaw:-1.0,pitch:0.4,card:'fu_evidence'},
      {name:'The Oceanview Motel',group:'Further',cut:false,t:[ix,iy+1.6,MZ+8],d:12,yaw:-0.5,pitch:0.12,card:'fu_motel'},
      {name:'The black triangle door',group:'Further',cut:false,t:[ix,iy+1.5,ML+4+6*6],d:6,yaw:-1.1,pitch:0.04,card:'fu_triangle'});
    K.places.push(['the Oceanview Motel',[ix,iy+2,(MZ+CE)/2],50],['the evidence room',[ix-80,iy+3,iz],16],['the Investigations offices',[ix+80,iy+3,iz],16],['the Investigations hub',[ix,iy+3,iz],26],['the Investigations Sector',[ix,iy+10,iz],170]);
  }

  // =================================================================== THE ASTRAL PLANE
  {const [ax,ay,az]=AO,GY=ay-200;
    B.quad('tile',[ax-500,GY,az-500],[ax+500,GY,az-500],[ax+500,GY,az+500],[ax-500,GY,az+500],[0,1,0]);
    // black slabs, floating, some upright, some leaning, some lying
    for(let k=0;k<34;k++){const a=R(0,6.283),r=R(70,420),x=ax+Math.cos(a)*r,z=az+Math.sin(a)*r,y=GY+R(10,260),h=R(14,60),w=R(5,16),t=R(1.5,4);
      const lean=R(-0.9,0.9),dir=R(0,6.283),p=[x,y,z],q=[x+Math.sin(lean)*Math.cos(dir)*h,y+Math.cos(lean)*h,z+Math.sin(lean)*Math.sin(dir)*h];B.beam('black',p,q,w,t);}
    for(let k=0;k<6;k++){const x=ax+R(-300,300),z=az+R(-300,300);B.blk('black',x,GY,z,R(4,10),R(30,90),R(4,10));}
    lights.zone([ax-520,ay-320,az-520],[ax+520,ay+320,az+520],0xf4f4f2,1);
    K.zones.push({c:[ax,ay,az],r:700,color:'#eeeeec',density:0.0007});   /* thin, so the pyramid stays black */
    // the pyramid: black, inverted, hanging in the white, turning slowly; a pale ring shows when the Board speaks
    const pyr=new THREE.Mesh(new THREE.ConeGeometry(70,120,4).rotateX(Math.PI),new THREE.MeshLambertMaterial({color:0x080809}));
    pyr.position.set(ax,ay+80,az);pyr.userData.noFingerprint=true;dyn.add(pyr);
    const ringM=new THREE.MeshBasicMaterial({color:0x111114,transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false});
    const ring=new THREE.Mesh(new THREE.RingGeometry(1,1.6,64).rotateX(-Math.PI/2),ringM);ring.position.set(ax,ay+60,az);ring.userData.noFingerprint=true;dyn.add(ring);
    const BOARD={pulse:0};
    K.hooks.push(t=>{pyr.rotation.y=t*0.05;const p=BOARD.pulse;pyr.scale.setScalar(1+0.06*p*Math.abs(Math.sin(t*6)));pyr.position.y=ay+80+Math.sin(t*0.3)*3;
      if(p>0){const u=(t*0.4)%1;ring.scale.setScalar(40+u*400);ringM.opacity=p*0.55*(1-u);}else ringM.opacity=0;});
    K.cards.fu_astral={h:'The Astral Plane',p:'Somewhere that is not inside the building or outside it: a white without end over a floor of pale tile, black slabs hanging in it at every angle, and the great black pyramid turning in the middle of the white. The Board speaks from here.',sub:'Events: the Board.'};
    K.cards.fu_board={h:'The Board',p:'<Welcome>, <Director>. The House is a <Place of Power>. The <Hiss> is a <resonance>, not a <threat>. It is a <threat>. You will <manage> it. Your <Service Weapon> remembers its <Directors>. We remember you. <Hotline> remains <open>. This <conversation> did not <occur>.',sub:'The Board, from the Astral Plane.'};
    K.views.push({name:'The Astral Plane',group:'Further',cut:false,t:[ax,ay-40,az],d:520,yaw:0.5,pitch:0.12,card:'fu_astral'},
      {name:'The Board',group:'Further',cut:false,t:[ax,ay+70,az],d:240,yaw:1.1,pitch:-0.15,card:'fu_board'});
    K.places.push(['the Astral Plane',[ax,ay,az],600]);
    K.events.push({key:'astral',label:'The Astral Plane',card:'fu_board',view:{t:[ax,ay+70,az],d:260,yaw:0.9,pitch:-0.12,cut:false},
      start(){let T0=null;return {update(t){if(T0===null)T0=t;const u=t-T0;BOARD.pulse=u<1?u:u<11?1:Math.max(0,1-(u-11)/2);if(u>13.5){BOARD.pulse=0;return false;}}};}});
  }
}
