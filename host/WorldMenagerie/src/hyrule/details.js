// ---------- the small things that make each biome itself ----------
// Fan work: Breath of the Wild belongs to Nintendo, and every shape here is this project's own.
//
//   desert     bleached skeletons of great beasts half in the sand, broken sandstone columns, tumbleweeds rolling
//   canyon     hoodoos - stems of red rock with a wider cap - and natural arches
//   snowfield  drifts against the slopes; the lakes up there frozen over (paint.js); snow falling round you
//   volcanic   vents breathing steam, cracks in the ground glowing with lava
//   jungle     giant red flowers on the forest floor
//   wetland    lily pads on the open water
//   Lost Woods mushrooms glowing blue in the gloom, lanterns hung by the Koroks
//   woods      red-capped toadstools
//   grassland  tufts of tall grass, and on the highlands too
//   tundra     patches of old snow lying in the grass
//   autumn     drifts of fallen leaves, red and gold
// All instanced, a few draw calls each; the moving ones (tumbleweeds, steam, snow) are small pools.
import { mkRng } from '../core/rng.js';
import { biomeKit } from './biomes.js';

export function details(api){
  const {THREE,ctx,scene,animHooks,groundH}=api;
  const PL=ctx.plan;if(!PL)return;
  const R=mkRng(2023),BK=biomeKit(PL);
  const inLake=(x,z)=>{for(const L of (PL.lakes||[])){let c=false;const p=L.poly;for(let i=0,j=p.length-1;i<p.length;j=i++){if((p[i][1]>z)!==(p[j][1]>z)&&x<(p[j][0]-p[i][0])*(z-p[i][1])/(p[j][1]-p[i][1])+p[i][0])c=!c;}if(c)return L;}return null;};
  const onPad=(x,z)=>(PL.pads||[]).some(([px,pz,r])=>Math.hypot(x-px,z-pz)<r);
  const slope=(x,z)=>{const a=groundH(x+6,z)-groundH(x-6,z),b=groundH(x,z+6)-groundH(x,z-6);return Math.hypot(a,b)/12;};
  const dm=new THREE.Object3D(),col=new THREE.Color();
  const kit={};
  const L=(c,o)=>new THREE.MeshLambertMaterial(Object.assign({color:c,flatShading:true},o||{}));
  const part=(name,geo,mat,shadow)=>{kit[name]={geo,mat,list:[],shadow};};
  const put=(name,x,y,z,sx,sy,sz,ry,c,rx,rz)=>kit[name].list.push([x,y,z,sx,sy,sz,ry||0,c,rx||0,rz||0]);
  // the parts
  part('rib',new THREE.TorusGeometry(1,0.06,4,10,Math.PI*0.9),L(0xece6d6),true);
  part('bone',new THREE.CylinderGeometry(0.1,0.12,1,6).rotateZ(Math.PI/2),L(0xe0d8c4));
  part('column',new THREE.CylinderGeometry(1,1.05,1,10).translate(0,0.5,0),L(0xd8b88a),true);
  part('hoodoo',new THREE.LatheGeometry([[0.5,0],[0.55,0.2],[0.38,0.5],[0.42,0.75],[1,0.85],[1.05,0.95],[0.01,1]].map(([r,h])=>new THREE.Vector2(r,h)),9),L(0xb8704a),true);
  part('arch',new THREE.TorusGeometry(1,0.22,6,12,Math.PI),L(0xa85e3e),true);
  part('drift',new THREE.IcosahedronGeometry(1,1),L(0xf6f8fa));
  part('crack',new THREE.BoxGeometry(1,0.12,1),new THREE.MeshBasicMaterial({color:0xff6a1a}));
  part('petal',new THREE.CylinderGeometry(1,0.3,0.2,5).translate(0,0.1,0),L(0xc8303a));
  part('pad',new THREE.CircleGeometry(1,8,0.3,Math.PI*1.8).rotateX(-Math.PI/2),L(0x4a8a3a));
  part('glowcap',new THREE.SphereGeometry(1,8,6,0,Math.PI*2,0,Math.PI/2),new THREE.MeshBasicMaterial({color:0x6ad8ff}));
  part('stalk',new THREE.CylinderGeometry(0.1,0.13,1,5).translate(0,0.5,0),L(0xe8e0cc));
  part('cap',new THREE.SphereGeometry(1,8,6,0,Math.PI*2,0,Math.PI/2),L(0xc83a2a));
  part('lantern',new THREE.SphereGeometry(1,8,6),new THREE.MeshBasicMaterial({color:0xffd27a}));
  part('tuft',(()=>{const g=[];for(let k=0;k<3;k++){const b=new THREE.ConeGeometry(0.12,1,3).translate(0,0.5,0);b.rotateZ((k-1)*0.35);b.rotateY(k*2.1);g.push(b.toNonIndexed());}
    let n=0;for(const b of g)n+=b.attributes.position.count;const pos=new Float32Array(n*3);let o=0;for(const b of g){pos.set(b.attributes.position.array,o);o+=b.attributes.position.array.length;}
    const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.BufferAttribute(pos,3));G.computeVertexNormals();return G;})(),L(0xffffff));
  part('patch',new THREE.CircleGeometry(1,9).rotateX(-Math.PI/2),L(0xffffff));
  const count={};const n=k=>count[k]=(count[k]||0)+1;
  const rx=()=>-6100+R()*12200,rz=()=>-5100+R()*10200;

  // ---- sample the country once, and set down what belongs where each sample lands ----
  for(let k=0;k<160000;k++){const x=rx(),z=rz(),b=BK.at(x,z);const y=groundH(x,z);if(y<1.5||onPad(x,z))continue;const lk=inLake(x,z),r=R();
    if(lk){if(b==='W'&&r<0.5){put('pad',x,lk.level+0.08,z,1.2+R()*1.4,1,1.2+R()*1.4,R()*6,R()<0.15?0xe890b0:null);n('lilypads');}continue;}
    const sl=slope(x,z);
    switch(b){
    case 'D':if(r<0.0008){// a skeleton: a spine and ribs, half sunk, along a random way
        const a=R()*6.28,L_=8+R()*10;for(let i=0;i<9;i++){const t=i/8-0.5,px=x+Math.cos(a)*t*L_,pz=z+Math.sin(a)*t*L_,s=(1-Math.abs(t)*1.2)*3.4+0.6;put('rib',px,groundH(px,pz)-0.4,pz,s,s*1.1,s,-a+Math.PI/2,null,0,0);}
        put('bone',x,y+0.3,z,L_,1.4,1.4,-a);n('skeletons');}
      else if(r<0.002){for(let i=0;i<3+Math.floor(R()*4);i++){const px=x+(R()-0.5)*14,pz=z+(R()-0.5)*14,h=R()<0.5?1+R()*2:3+R()*6;put('column',px,groundH(px,pz)-0.2,pz,0.9,h,0.9,R()*6,null,R()<0.3?1.4:0,0);}n('ruins');}
      break;
    case 'C':if(r<0.02&&sl<0.6){const h=6+R()*14;put('hoodoo',x,y-0.5,z,2+R()*2,h,2+R()*2,R()*6,R()<0.5?0xb8704a:0xc88a5a);n('hoodoos');}
      else if(r<0.0065){const s=8+R()*10;put('arch',x,y-s*0.15,z,s,s*0.9,s*1.4,R()*6);n('arches');}
      break;
    case 'S':if(r<0.03&&y<1200){const s=4+R()*8;put('drift',x,y-s*0.15,z,s*1.4,s*0.35,s,R()*6);n('drifts');}break;
    case 'T':if(r<0.03){put('patch',x,y+0.12,z,4+R()*7,1,3+R()*5,R()*6,0xf2f4f6);n('snowpatches');}
      else if(r<0.09){put('tuft',x,y,z,1.2,0.9+R()*0.6,1.2,R()*6,R()<0.5?0xc8c48a:0xb0b47a);n('tufts');}break;
    case 'V':if(r<0.012&&sl<0.8){const a=R()*6.28;for(let i=0;i<4;i++){const px=x+Math.cos(a)*i*4,pz=z+Math.sin(a)*i*4;put('crack',px,groundH(px,pz)+0.1,pz,5+R()*3,1,0.5+R()*0.6,-a+(R()-0.5)*0.6);}n('cracks');}break;
    case 'J':if(r<0.03){put('petal',x,y+0.1,z,1.3+R(),1,1.3+R(),R()*6,R()<0.7?0xc8303a:0xe86a2a);put('cap',x,y+0.3,z,0.5,0.4,0.5,0,0xf0d040);n('flowers');}break;
    case 'L':if(r<0.03){const s=0.6+R()*0.9;put('stalk',x,y,z,s,s*1.2,s);put('glowcap',x,y+s*1.2,z,s,s*0.6,s,0,R()<0.5?0x6ad8ff:0x8affd8);n('glowshrooms');}
      else if(r<0.034){const ly=y+3+R()*3;put('stalk',x,y,z,0.6,ly-y,0.6);put('lantern',x,ly,z,0.6,0.8,0.6);n('lanterns');}break;
    case 'F':if(r<0.02){const s=0.4+R()*0.6;put('stalk',x,y,z,s,s,s);put('cap',x,y+s,z,s*1.3,s,s*1.3,0,R()<0.7?0xc83a2a:0xe8d8b0);n('toadstools');}break;
    case 'A':if(r<0.03){put('patch',x,y+0.1,z,3+R()*5,1,3+R()*5,R()*6,R()<0.5?0xc8602a:0xe0a040);n('leaves');}break;
    case 'g':case 'H':if(r<(b==='H'?0.12:0.09)&&y<500&&sl<0.6){put('tuft',x,y,z,1.3,1+R()*0.8,1.3,R()*6,R()<0.5?0x7aa84a:0x8ab858);n('tufts');}break;}}

  // ---- build the kit ----
  for(const [name,K] of Object.entries(kit)){if(!K.list.length)continue;const im=new THREE.InstancedMesh(K.geo,K.mat,K.list.length);
    const tint=K.list.some(e=>e[7]!=null);
    K.list.forEach(([x,y,z,sx,sy,sz,ry,c,rxx,rzz],i)=>{dm.position.set(x,y,z);dm.rotation.set(rxx,ry,rzz);dm.scale.set(sx,sy,sz);dm.updateMatrix();im.setMatrixAt(i,dm.matrix);
      if(tint)im.setColorAt(i,c!=null?col.setHex(c):col.copy(K.mat.color));});
    if(im.instanceColor)im.instanceColor.needsUpdate=true;im.castShadow=!!K.shadow;im.receiveShadow=true;im.userData.noFingerprint=true;im.userData.wireCat='veg';scene.add(im);}

  // ---- the moving things: tumbleweeds, steam, snowfall ----
  const tw=[];for(let k=0;k<1200&&tw.length<24;k++){const x=rx(),z=rz();if(BK.at(x,z)!=='D')continue;tw.push({x,z,x0:x,z0:z,v:6+R()*6,ph:R()*6,rot:0});}
  const twI=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1.1,0),L(0x9a8256),Math.max(1,tw.length));twI.frustumCulled=false;twI.userData.noFingerprint=true;twI.castShadow=true;scene.add(twI);
  const steamTex=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);
    gr.addColorStop(0,'rgba(240,240,236,0.85)');gr.addColorStop(1,'rgba(240,240,236,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);})();
  const vents=[];for(let k=0;k<6000&&vents.length<120;k++){const x=rx(),z=rz();if(BK.at(x,z)!=='V'||onPad(x,z))continue;const y=groundH(x,z);if(y<20)continue;
    for(let i=0;i<4;i++){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:steamTex,transparent:true,depthWrite:false,opacity:0}));sp.userData.noFingerprint=true;sp.userData.noWire=true;scene.add(sp);vents.push({sp,x,y,z,ph:i/4+R()*0.1});}}
  const SN=2400,snPos=new Float32Array(SN*3),snG=new THREE.BufferGeometry();snG.setAttribute('position',new THREE.BufferAttribute(snPos,3));
  const snM=new THREE.PointsMaterial({color:0xffffff,size:0.6,transparent:true,opacity:0,depthWrite:false}),snow=new THREE.Points(snG,snM);snow.frustumCulled=false;snow.userData.noFingerprint=true;snow.userData.noWire=true;scene.add(snow);
  for(let i=0;i<SN;i++){snPos[i*3]=(R()-0.5)*240;snPos[i*3+1]=R()*120;snPos[i*3+2]=(R()-0.5)*240;}
  let last=performance.now();
  animHooks.push(now=>{const t=now/1000,dt=Math.min(0.05,(now-last)/1000);last=now;
    for(const w of tw){w.x+=w.v*dt;w.z+=Math.sin(t*0.3+w.ph)*dt*2;if(Math.hypot(w.x-w.x0,w.z-w.z0)>500||BK.at(w.x,w.z)!=='D'){w.x=w.x0;w.z=w.z0;}
      const hop=Math.abs(Math.sin(t*2.4+w.ph))*1.4;w.rot-=w.v*dt/1.1;dm.position.set(w.x,groundH(w.x,w.z)+1.1+hop,w.z);dm.rotation.set(0,0,w.rot);dm.scale.set(1,1,1);dm.updateMatrix();twI.setMatrixAt(tw.indexOf(w),dm.matrix);}
    if(tw.length)twI.instanceMatrix.needsUpdate=true;
    for(const v of vents){const u=(v.ph+t*0.12)%1;v.sp.position.set(v.x+u*8,v.y+2+u*40,v.z);v.sp.scale.setScalar(4+u*22);v.sp.material.opacity=0.55*Math.sin(u*Math.PI);}
    // snow round the camera when it is in the snow country
    const cam=api.camera&&api.camera.position;if(cam){const b=BK.at(cam.x,cam.z),want=(b==='S'||(b==='T'&&cam.y>350))&&cam.y-groundH(cam.x,cam.z)<400?0.9:0;
      snM.opacity+=(want-snM.opacity)*Math.min(1,dt*0.8);if(snM.opacity>0.02){snow.position.set(cam.x,cam.y-60,cam.z);
        for(let i=0;i<SN;i++){snPos[i*3+1]-=dt*(5+(i%7));snPos[i*3]+=Math.sin(t*0.7+i)*dt*1.5;if(snPos[i*3+1]<0)snPos[i*3+1]+=120;}snG.attributes.position.needsUpdate=true;}}});
  ctx.details=Object.assign(ctx.details||{},count,{tumbleweeds:tw.length,vents:vents.length/4});
}
