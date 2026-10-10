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

  const pots=[],posts=[],cloth=[],awnings=[],moored=[],pali=[];

  // ---- the chimneys ----
  // One in three roofs, which is about right, and the bell on top is what the whole thing is for: it caught
  // the sparks. At this scale they are the only thing that breaks a roofline.
  for(let k=0;k<(K.chimneys||0);k++){
    const x=B.x0+R()*B.w, z=B.z0+R()*B.d;
    const h0=roofAt(x,z);if(h0<4)continue;const h=h0+(K.lift||0);   // lift: clear of a pitched roof (src/core/palazzi.js)
    const st=new THREE.Mesh(new THREE.BoxGeometry(0.9,2.2+R()*2.2,0.9).translate(0,1.1,0),brick);
    st.position.set(x,h,z);pots.push(st);
    const bell=new THREE.Mesh(new THREE.CylinderGeometry(1.15,0.55,1.3,7).translate(0,0.65,0),potM);
    bell.position.set(x,h+2.2+R()*2.2,z);pots.push(bell);
    const cap=new THREE.Mesh(new THREE.BoxGeometry(1.7,0.24,1.7),potM);
    cap.position.set(x,h+3.7+R()*2.2,z);pots.push(cap);
    (api.chimneys=api.chimneys||[]).push([x,cap.position.y+0.2,z,R()]);   // for the smoke (src/core/streetlife.js)
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
        p.position.set(px,-1.2,pz);p.rotation.set((R()-0.5)*0.1,0,(R()-0.5)*0.1);pali.push(p);
        const cap=new THREE.Mesh(new THREE.SphereGeometry(0.3,7,5),m);cap.position.set(px,h-1.2,pz);pali.push(cap);   // merged by colour below
      }
      // and a gondola tied to about a third of them
      if(R()<0.34)moored.push({x:px-Math.sin(a)*1.6,z:pz+Math.cos(a)*1.6,ry:-a,ph:R()*6.28});   // drawn as instances below
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
      cloth.push({x:px,y:y-0.08,z:pz,ry:-ang,w,dh,c:LAUNDRY[Math.floor(R()*LAUNDRY.length)],ph:R()*6.28});
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

  // the pali, merged by colour; the moored gondolas and the washing as instances (one draw each, not a thousand)
  for(const m of paliM){const l=pali.filter(q=>q.material===m);if(l.length){const mm=mergeParts(l,m);mm.userData.wireCat='life';scene.add(mm);}}
  const vc=parts=>{const pos=[],nor=[],col=[];for(const [g0,c,x,y,z,rz=0] of parts){const g=g0.toNonIndexed();if(rz)g.rotateZ(rz);g.translate(x,y,z);const p=g.attributes.position,n=g.attributes.normal,cc=new THREE.Color(c);
      for(let i=0;i<p.count;i++){pos.push(p.getX(i),p.getY(i),p.getZ(i));nor.push(n.getX(i),n.getY(i),n.getZ(i));col.push(cc.r,cc.g,cc.b);}}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));return g;};
  const vMat=new THREE.MeshLambertMaterial({vertexColors:true});
  const gm=new THREE.InstancedMesh(vc([[new THREE.BoxGeometry(10.5,0.6,1.3),'#161618',0,0.3,0],[new THREE.ConeGeometry(0.55,2.2,5),'#161618',5.9,0.45,0,-Math.PI/2],[new THREE.BoxGeometry(0.14,1.3,0.45),'#b8a06a',6.6,1.2,0],[new THREE.BoxGeometry(5,0.5,1.5),'#2a3a4a',-0.5,0.8,0]]),vMat,Math.max(1,moored.length));
  gm.frustumCulled=false;scene.add(gm);
  const cm=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1).translate(0,-0.5,0),new THREE.MeshLambertMaterial({side:THREE.DoubleSide}),Math.max(1,cloth.length));cm.frustumCulled=false;scene.add(cm);
  cloth.forEach((q,i)=>cm.setColorAt(i,new THREE.Color(q.c)));
  const dd=new THREE.Object3D();dd.rotation.order='YXZ';
  let t0=performance.now(),fr=0;
  animHooks.push(now=>{
    const t=(now-t0)/1000;if((fr++)&1)return;   // every other frame is plenty for washing and a gentle bob
    cloth.forEach((q,i)=>{dd.position.set(q.x,q.y,q.z);dd.rotation.set(0,q.ry,Math.sin(t*0.8+q.ph)*0.16);dd.scale.set(q.w,q.dh,1);dd.updateMatrix();cm.setMatrixAt(i,dd.matrix);});cm.instanceMatrix.needsUpdate=true;
    dd.scale.set(1,1,1);
    moored.forEach((q,i)=>{dd.position.set(q.x,0.1+0.09*Math.sin(t*0.9+q.ph),q.z);dd.rotation.set(0,q.ry,0.035*Math.sin(t*1.1+q.ph));dd.updateMatrix();gm.setMatrixAt(i,dd.matrix);});gm.instanceMatrix.needsUpdate=true;
  });

  ctx.details=Object.assign(ctx.details||{},{
    comignoli:Math.round(pots.length/3),bricole:posts.length,washing:cloth.length,mooredGondolas:moored.length});
}
