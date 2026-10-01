// ---------- the things that are only in Venice ----------
// The massing from OpenStreetMap gets the city's shape right and its character not at all: from above it is
// seven thousand boxes with red roofs, which is also Bologna. What makes a photograph of Venice recognisable
// at a glance is the furniture - and all of it is furniture, because the city has no ground to put anything
// on and everything it owns is either floating, bolted to a wall or driven into the mud.
//
//   the comignoli: the bell-mouthed chimney pots, which are that shape because the city is built of wood
//   inside and a spark landing on a roof took out a sestiere; there are thousands and no two are alike
//   the bricole: the mooring posts driven into the mud in threes to mark the channels, because a lagoon is
//   a foot deep everywhere except where it is not
//   the pali: the striped posts outside the palazzi, painted in the house's own colours, which is where
//   the gondola is tied
//   the washing, strung across the calli at second-floor height, and the awnings over the campi
//
// Map data (c) OpenStreetMap contributors, ODbL; the geometry is this project's own.
import { mkRng } from '../core/rng.js';

export function life(api){
  const {THREE,C,ctx,scene,animHooks,groundH,roofAt,buildingsAt,inWater,box,mergeParts,B,WATERWAYS,
         joinChains,polyLen,polyAt,AREAS}=api;
  const K=C.life;if(!K)return;
  const R=mkRng(K.seed||1797);

  const brick=new THREE.MeshLambertMaterial({color:0x9c5a44,flatShading:true});
  const potM=new THREE.MeshLambertMaterial({color:0xb06a4a,flatShading:true});
  const woodM=new THREE.MeshLambertMaterial({color:0x5a4634,flatShading:true});
  const PALI=[0xd8d4c8,0x2f5a8c,0xb43a34,0x2e6b4a,0xd8b13a];
  const paliM=PALI.map(h=>new THREE.MeshLambertMaterial({color:h,flatShading:true}));
  const LAUNDRY=[0xe8e4da,0xd9d2c4,0x9fb8cf,0xcf8c6a,0xb9c4a0];
  const clothM=LAUNDRY.map(h=>new THREE.MeshLambertMaterial({color:h,side:THREE.DoubleSide}));
  const canvasM=[0xd8d2c0,0xb44a3c,0x3f6a9c].map(h=>new THREE.MeshLambertMaterial({color:h,side:THREE.DoubleSide}));
  const gondM=new THREE.MeshLambertMaterial({color:0x1d1c1e});

  const pots=[],posts=[],cloth=[],awnings=[],moored=[];

  // ---- the chimneys ----
  // One in three roofs, which is about right, and the bell on top is what the whole thing is for: it caught
  // the sparks. At this scale they are the only thing that breaks a roofline.
  for(let k=0;k<(K.chimneys||0);k++){
    const x=B.x0+R()*B.w, z=B.z0+R()*B.d;
    const h=roofAt(x,z);if(h<4)continue;
    const st=new THREE.Mesh(new THREE.BoxGeometry(0.9,2.2+R()*2.2,0.9).translate(0,1.1,0),brick);
    st.position.set(x,h,z);pots.push(st);
    const bell=new THREE.Mesh(new THREE.CylinderGeometry(1.15,0.55,1.3,7).translate(0,0.65,0),potM);
    bell.position.set(x,h+2.2+R()*2.2,z);pots.push(bell);
    const cap=new THREE.Mesh(new THREE.BoxGeometry(1.7,0.24,1.7),potM);
    cap.position.set(x,h+3.7+R()*2.2,z);pots.push(cap);
  }

  // ---- the bricole and the pali ----
  // In the lagoon they go in threes, lashed at the top, and they are how you know where the channel is.
  // Along the canals they are single, striped, and belong to whichever door they stand outside.
  {
    const chains=joinChains(WATERWAYS.map(w=>w.pts),6).map(p=>polyLen({pts:p})).filter(r=>r.len>80);
    for(let k=0;k<(K.bricole||0)&&chains.length;k++){
      const r=chains[Math.floor(R()*chains.length)];
      const s=R()*r.len,[x,z,a]=polyAt(r,s);
      const off=(R()<0.5?-1:1)*(3+R()*5);
      const px=x-Math.sin(a)*off, pz=z+Math.cos(a)*off;
      if(R()<0.45){                                   // a triple, for a channel
        for(let i=0;i<3;i++){
          const aa=i/3*Math.PI*2, h=4+R()*2.5;
          const p=new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.26,h,6).translate(0,h/2,0),woodM);
          p.position.set(px+Math.cos(aa)*0.75,-1.2,pz+Math.sin(aa)*0.75);
          p.rotation.set(Math.cos(aa)*0.09,0,Math.sin(aa)*0.09);posts.push(p);
        }
      }else{                                          // a palo, striped, outside somebody's water door
        const h=4.5+R()*2;
        const m=paliM[Math.floor(R()*paliM.length)];
        const p=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.24,h,7).translate(0,h/2,0),m);
        p.position.set(px,-1.2,pz);p.rotation.set((R()-0.5)*0.1,0,(R()-0.5)*0.1);scene.add(p);
        const cap=new THREE.Mesh(new THREE.SphereGeometry(0.3,7,5),m);cap.position.set(px,h-1.2,pz);scene.add(cap);
      }
      // and a gondola tied to about a third of them
      if(R()<0.34){
        const g=new THREE.Group();
        const hull=new THREE.Mesh(new THREE.BoxGeometry(10.5,0.6,1.3),gondM);hull.position.y=0.3;g.add(hull);
        const bow=new THREE.Mesh(new THREE.ConeGeometry(0.55,2.2,5).rotateZ(-Math.PI/2),gondM);
        bow.position.set(5.9,0.45,0);g.add(bow);
        const ferro=new THREE.Mesh(new THREE.BoxGeometry(0.14,1.3,0.45),new THREE.MeshLambertMaterial({color:0xb8a06a}));
        ferro.position.set(6.6,1.2,0);g.add(ferro);
        const cover=new THREE.Mesh(new THREE.BoxGeometry(5,0.5,1.5),new THREE.MeshLambertMaterial({color:0x2a3a4a}));
        cover.position.set(-0.5,0.8,0);g.add(cover);
        g.position.set(px-Math.sin(a)*1.6,0.1,pz+Math.cos(a)*1.6);g.rotation.y=-a;
        scene.add(g);moored.push({g,ph:R()*6.28});
      }
    }
  }

  // ---- the washing ----
  // Across the calli at second-floor height, because there is nowhere else: no gardens, no yards, and the
  // campi are public.
  for(let k=0;k<(K.washing||0);k++){
    const x=B.x0+R()*B.w, z=B.z0+R()*B.d;
    const h=roofAt(x,z);if(h<6)continue;
    const ang=R()*Math.PI, len=5+R()*7, y=4+R()*Math.max(1,h-7);
    const line=new THREE.Mesh(new THREE.BoxGeometry(len,0.07,0.07),woodM);
    line.position.set(x,y,z);line.rotation.y=-ang;posts.push(line);
    const n=2+Math.floor(R()*4);
    for(let i=0;i<n;i++){
      const t=(i+0.7)/(n+0.4), px=x+Math.cos(ang)*(t-0.5)*len, pz=z+Math.sin(ang)*(t-0.5)*len;
      const w=0.6+R()*0.9, dh=0.7+R()*1.2;
      const m=new THREE.Mesh(new THREE.PlaneGeometry(w,dh),clothM[Math.floor(R()*clothM.length)]);
      m.position.set(px,y-dh/2-0.08,pz);m.rotation.y=-ang;scene.add(m);
      cloth.push({m,ph:R()*6.28});
    }
  }

  // ---- the awnings on the campi ----
  for(const a of AREAS.slice(0,(K.awnings||0))){
    if(!a.bb)continue;
    const cx=(a.bb.x0+a.bb.x1)/2, cz=(a.bb.z0+a.bb.z1)/2;
    if(inWater(cx,cz))continue;
    for(let k=0;k<3;k++){
      const px=cx+(R()-0.5)*18, pz=cz+(R()-0.5)*18;
      const g=groundH(px,pz);
      const top=new THREE.Mesh(new THREE.BoxGeometry(3.4,0.2,3.4),canvasM[Math.floor(R()*canvasM.length)]);
      top.position.set(px,g+2.6,pz);top.rotation.y=R();awnings.push(top);
      for(const [dx,dz] of [[-1.5,-1.5],[1.5,-1.5],[-1.5,1.5],[1.5,1.5]])
        awnings.push(box(px+dx,g,pz+dz,0.1,2.6,0.1,woodM));
    }
  }

  const merged=[];
  for(const [list,mat] of [[pots.filter(m=>m.material===brick),brick],[pots.filter(m=>m.material===potM),potM],
                           [posts.filter(m=>m.material===woodM),woodM],
                           [awnings.filter(m=>m.material===woodM),woodM]])
    if(list.length)merged.push(mergeParts(list,mat));
  for(const m of canvasM){const l=awnings.filter(q=>q.material===m);if(l.length)merged.push(mergeParts(l,m));}
  for(const m of merged){m.userData.wireCat='life';scene.add(m);}

  let t0=performance.now();
  animHooks.push(now=>{
    const t=(now-t0)/1000;
    for(const q of cloth)q.m.rotation.z=Math.sin(t*0.8+q.ph)*0.16;
    for(const q of moored){q.g.position.y=0.1+0.09*Math.sin(t*0.9+q.ph);
      q.g.rotation.z=0.035*Math.sin(t*1.1+q.ph);}
  });

  ctx.details=Object.assign(ctx.details||{},{
    comignoli:Math.round(pots.length/3),bricole:posts.length,washing:cloth.length,mooredGondolas:moored.length});
}
