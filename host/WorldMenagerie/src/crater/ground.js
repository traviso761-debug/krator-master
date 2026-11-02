// ---------- Crater Lake: the ground of the caldera and round it ----------
// OpenStreetMap maps the park's roads and buildings and almost none of its ground. What is there (C.ground):
//   the walls     inside the rim the caldera drops 150 to 600 m to the water in cliffs of grey andesite, banded
//                 tan, pink and rust where the flows and the ash lie in layers, over long aprons of talus
//   the forest    outside the rim and down to the water where the wall eases: mountain hemlock and Shasta red fir,
//                 dark and close, with meadows along the creeks and open flats of pale pumice between
//   the rim       above `rimH` m over the lake, wind-cut whitebark pine scattered on bare pumice
//   snow          the patches that last the summer on the north-facing ground above `snowH` m; and the winter
//                 (api.ctx.ground.winter(k), 0 to 1), when the park takes some 13 m of snow a year: everything white
//                 but the cliffs too steep to hold it, the trees dusted, the lake left blue
//   tints         [lat, lon, radius, colour, strength]: Wizard Island's red-black cinders, Pumice Castle's orange
// The ground's vertex colours are repainted (and the far backdrop's, for the winter); conifers are planted a tile
// at a time near the camera on the forest and the rim. None of it is in the layout fingerprint.
import {hash3} from '../core/rng.js';

export function ground(api){
  const {THREE,C,scene,P,groundH,inWater,animHooks,camera,buildingsAt,roadsNear}=api;const K=C.ground;if(!K)return;
  const WY=api.ctx.waterLevel||0.05,RIM=K.rimH==null?520:K.rimH,SNOW=K.snowH==null?560:K.snowH;
  const vn=(x,z,s,salt=91)=>{const X=x/s,Z=z/s,i=Math.floor(X),j=Math.floor(Z),fx=X-i,fz=Z-j,u=fx*fx*(3-2*fx),v=fz*fz*(3-2*fz),
    a=hash3(i,j,salt),b=hash3(i+1,j,salt),c=hash3(i,j+1,salt),d=hash3(i+1,j+1,salt);return (a*(1-u)+b*u)*(1-v)+(c*(1-u)+d*u)*v;};
  const col=h=>new THREE.Color(h),TINTS=(K.tints||[]).map(([la,lo,r,c,s])=>{const [x,z]=P([la,lo]);return [x,z,r,col(c),s==null?0.8:s];});
  const FOREST=[col('#26402a'),col('#2c4830'),col('#223a28')],MEADOW=col('#6e8048'),PUMICE=col('#a49a84'),RIMG=col('#8e8676'),TALUS=col('#8a847a'),
    ROCK=[col('#6e6a64'),col('#8a8074'),col('#857066'),col('#7a6a58'),col('#5e5a56'),col('#9a948a')],SNOWC=col('#eef2f6'),SNOWB=col('#dfe6ee');
  // the lake's centre and how far from it, for telling the caldera's inner wall from the mountain's outer slopes
  const [LX,LZ]=P(K.centre||C.origin),INNER=K.inner||5200;
  // what covers a point: 0 forest, 1 meadow, 2 pumice, 3 rim, 4 talus, 5 cliff
  function kind(x,z,h,slope){const r=Math.hypot(x-LX,z-LZ);
    if(slope>(r<INNER?1.1:1.3))return 5;const n=vn(x,z,700)*0.65+vn(x,z,180,92)*0.35;
    // the inner wall: talus where it is steep, and where it eases, hemlock down to the water (more of it on the
    // south and west walls, which are older and gentler)
    if(r<INNER&&h<RIM+60&&(slope>0.8||(slope>0.42&&vn(x,z,240,98)<0.5)))return 4;if(h>RIM)return 3;if(n<0.22)return 1;if(n>0.78||(slope<0.08&&n>0.62))return 2;return 0;}
  const rockC=(x,z,h)=>ROCK[Math.floor((vn(x*0.2,h*3,1,93)*0.6+vn(x,z,90,94)*0.4)*ROCK.length)%ROCK.length];   // banded by height, the layers of the wall
  const tmp=new THREE.Color();
  function summer(x,z,y,slope,nz,c){const k=kind(x,z,y,slope);
    tmp.copy(k===0?FOREST[Math.floor(hash3(Math.floor(x/30),Math.floor(z/30),95)*3)]:k===1?MEADOW:k===2?PUMICE:k===3?RIMG:k===4?TALUS:rockC(x,z,y));
    for(const [tx,tz,r,tc,s] of TINTS){const d=Math.hypot(x-tx,z-tz);if(d<r)tmp.lerp(tc,s*Math.min(1,(1-d/r)*1.8));}   // full over the inner half, then easing out
    // the summer's snow: north-facing (the normal's z toward +z is south, so north-facing is nz<0) and high
    if(y>SNOW&&k!==5&&nz<-0.15&&vn(x,z,160,96)<0.55+(y-SNOW)/600)tmp.lerp(SNOWB,0.9);
    tmp.multiplyScalar(0.92+vn(x,z,50,97)*0.16);c.lerp(tmp,K.strength==null?0.92:K.strength);}
  function winter(x,z,y,slope,c){const k=kind(x,z,y,slope);
    if(k===5&&slope>1.3){c.lerp(SNOWC,0.25);return;}tmp.copy(k===0?SNOWB:SNOWC);if(k===0)tmp.lerp(FOREST[0],0.35);else if(k===4||k===5)tmp.lerp(TALUS,0.25);c.copy(tmp);}
  // repaint the ground (and keep the winter's colours beside the summer's), and the far backdrop's winter
  let winShown=-1;const MESHES=[];const c=new THREE.Color();let painted=0,gotBack=false;
  // the backdrop arrives later (it is fetched): the clock below takes it when it does
  const capture=m=>{if(!m.isMesh||!m.geometry.attributes.color)return;const isT=m.name==='terrain'||/^terrain/.test(m.name),isB=m.name==='backdrop';if(!isT&&!isB)return;if(isB)gotBack=true;
    m.updateMatrixWorld(true);const g=m.geometry,p=g.attributes.position,cl=g.attributes.color,n=g.attributes.normal,S=new Float32Array(cl.array.length),W=new Float32Array(cl.array.length);
    for(let i=0;i<p.count;i++){let x=p.getX(i),y=p.getY(i),z=p.getZ(i);if(isB){const v=new THREE.Vector3(x,y,z).applyMatrix4(m.matrixWorld);x=v.x;y=v.y;z=v.z;}
      const ny=n?Math.max(0.05,Math.abs(n.getY(i))):1,slope=Math.sqrt(1-ny*ny)/ny,nz=n?n.getZ(i):0;c.setRGB(cl.getX(i),cl.getY(i),cl.getZ(i));
      if(isT&&y>WY-0.5){summer(x,z,y,slope,nz,c);painted++;}S[i*3]=c.r;S[i*3+1]=c.g;S[i*3+2]=c.b;
      if(y>WY-0.5)winter(x,z,y,slope,c);W[i*3]=c.r;W[i*3+1]=c.g;W[i*3+2]=c.b;cl.setXYZ(i,S[i*3],S[i*3+1],S[i*3+2]);}
    cl.needsUpdate=true;MESHES.push({cl,S,W});winShown=-1;};
  scene.traverse(capture);
  // ---- the trees ----
  const TILE=K.tile||400,NEAR=K.near||1400,SP=K.spacing||8;
  function merge(list){const pos=[],cl=[];for(const [g,h] of list){const a=g.toNonIndexed().attributes.position.array,cc=new THREE.Color(h);for(let i=0;i<a.length;i+=3){pos.push(a[i],a[i+1],a[i+2]);cl.push(cc.r,cc.g,cc.b);}}
    const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));ge.setAttribute('color',new THREE.Float32BufferAttribute(cl,3));ge.computeVertexNormals();return ge;}
  // mountain hemlock: narrow, drooping top; red fir: taller, a stiff spire in tiers; whitebark pine: low, spreading, many-stemmed
  const hemlock=merge([[new THREE.CylinderGeometry(0.15,0.3,3,4).translate(0,1.5,0),'#4a3a30'],[new THREE.ConeGeometry(2.2,9,6).translate(0,6.5,0),'#24402c'],[new THREE.ConeGeometry(1.2,4,5).translate(0,11.5,0).rotateZ(0.08),'#2a4830']]),
    fir=merge([[new THREE.CylinderGeometry(0.2,0.4,3,4).translate(0,1.5,0),'#6a3e30'],[new THREE.ConeGeometry(2.8,7,6).translate(0,5.5,0),'#2a4636'],[new THREE.ConeGeometry(2.1,6,6).translate(0,10,0),'#2e4c3a'],[new THREE.ConeGeometry(1.3,5,5).translate(0,14,0),'#325240']]),
    pine=merge([[new THREE.CylinderGeometry(0.25,0.4,2.4,5).translate(0,1.2,0).rotateZ(0.2),'#7a6a5a'],[new THREE.CylinderGeometry(0.2,0.3,2.2,5).translate(0,1.1,0).rotateZ(-0.3),'#7a6a5a'],
      [new THREE.IcosahedronGeometry(2.0,0).scale(1.3,0.6,1.1).translate(0.4,3.0,0),'#3e5634'],[new THREE.IcosahedronGeometry(1.5,0).scale(1.2,0.6,1).translate(-0.8,2.7,0.5),'#46603a']]);
  const mat=new THREE.MeshLambertMaterial({vertexColors:true}),o=new THREE.Object3D(),tiles=new Map();let nTrees=0;
  const slopeAt=(x,z)=>{const e=6,a=groundH(x+e,z)-groundH(x-e,z),b=groundH(x,z+e)-groundH(x,z-e);return Math.hypot(a,b)/(2*e);};
  const CLEAR=(K.clearings||[]).map(([la,lo,r])=>{const [x,z]=P([la,lo]);return [x,z,r];});
  const open=(x,z)=>CLEAR.some(([cx,cz,r])=>(x-cx)**2+(z-cz)**2<r*r)||(buildingsAt&&buildingsAt(x,z,6).length)||(roadsNear&&roadsNear(x,z,7).length);
  function build(T){const L=[[],[],[]];
    for(let j=0;j<TILE/SP;j++)for(let i=0;i<TILE/SP;i++){const x=T.x0+(i+hash3(i,j,T.k))*SP,z=T.z0+(j+hash3(j,i,T.k+1))*SP;if(inWater(x,z)||open(x,z))continue;const h=groundH(x,z);if(h<WY+0.8)continue;
      const k=kind(x,z,h,slopeAt(x,z));let w;if(k===0)w=hash3(x,z,98)<0.55?0:1;else if(k===3&&hash3(x,z,99)<0.12)w=2;else if((k===1||k===2)&&hash3(x,z,100)<0.03)w=0;else if(k===4&&hash3(x,z,101)<0.04)w=0;else continue;
      const s=0.7+hash3(x,z,102)*0.8;o.position.set(x,h-0.3,z);o.rotation.set(0,hash3(x,z,103)*6.28,0);o.scale.set(s,s*(0.85+hash3(z,x,104)*0.5),s);o.updateMatrix();L[w].push(o.matrix.clone());}
    const g=new THREE.Group();[hemlock,fir,pine].forEach((geo,w)=>{if(!L[w].length)return;const im=new THREE.InstancedMesh(geo,mat,L[w].length);L[w].forEach((m,i)=>im.setMatrixAt(i,m));im.castShadow=true;im.userData.noFingerprint=true;g.add(im);nTrees+=L[w].length;});
    scene.add(g);T.g=g;}
  let next=0,WIN=0,winTo=0;
  animHooks.push(now=>{
    if(Math.abs(winTo-WIN)>0.001)WIN+=(winTo-WIN)*0.04;else WIN=winTo;
    if(Math.abs(WIN-winShown)>0.02||(WIN===winTo&&winShown!==WIN)){winShown=WIN;for(const {cl,S,W} of MESHES){const a=cl.array;for(let i=0;i<a.length;i++)a[i]=S[i]+(W[i]-S[i])*WIN;cl.needsUpdate=true;}mat.emissive.setScalar(WIN*0.35);}
    if(now<next)return;next=now+250;if(!gotBack){const b=scene.getObjectByName('backdrop');if(b)capture(b);}const p=camera.position,ci=Math.floor(p.x/TILE),cj=Math.floor(p.z/TILE),R=Math.ceil(NEAR/TILE),hh=p.y-groundH(p.x,p.z);let built=0;
    for(let dj=-R;dj<=R;dj++)for(let di=-R;di<=R;di++){const k=(ci+di)+','+(cj+dj);if(!tiles.has(k)){const d=Math.hypot(di,dj)*TILE;if(d>NEAR+TILE||hh>NEAR*1.6||built>=2)continue;tiles.set(k,{x0:(ci+di)*TILE,z0:(cj+dj)*TILE,k:(ci+di)*7919+(cj+dj)*104729,g:null});build(tiles.get(k));built++;}}
    for(const T of tiles.values())if(T.g){const d=Math.hypot(T.x0+TILE/2-p.x,T.z0+TILE/2-p.z);T.g.visible=d<NEAR+TILE&&hh<NEAR*1.6;}
    api.ctx.details.ground={painted,tiles:tiles.size,trees:nTrees};});
  api.ctx.ground={winter:k=>{winTo=Math.max(0,Math.min(1,k));},winterNow:()=>WIN};
  api.ctx.details=Object.assign(api.ctx.details||{},{ground:{painted,tiles:0,trees:0}});
}
