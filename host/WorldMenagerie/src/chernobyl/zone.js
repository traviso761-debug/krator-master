// ---------- Chernobyl: the ground of the Zone, and the forest come back ----------
// Polesia is flat, sandy and wet: pine on the sand, birch and aspen where the fields were, sedge and reed along the
// Pripyat and its old channels. Forty years without people have let it take everything back. C.zone:
//   the ground  the ground's vertex colours repainted: pine forest; the kolkhozes' fields gone to rank grass and birch
//               scrub (`fields`, a share of the open ground, by a noise); sedge marsh on the low ground near the water
//               (below `marshH` m over the river); bare sand where the noise says; the settlements' open ground
//               (`towns`, [lat, lon, radius]) yards gone to grass and scrub; `tints` ([lat, lon, radius, colour,
//               strength]) for the Red Forest's burnt and dead pine and the drained cooling pond's bed; the plant's
//               yards (`bare`) gravel
//   the trees   a tile at a time near the camera: Scots pine on the forest ground the map has not drawn as wood (the
//               engine plants the mapped woods itself), birch and aspen on the old fields, and inside the towns birch,
//               poplar and maple in every yard, square and courtyard, right up to the walls and through the pavements
//               of the smaller streets (`overgrowth`, a share of the open cells) but not on the roads that are kept
//               open, nor in the buildings
// None of it is in the layout fingerprint.
import {hash3} from '../core/rng.js';

export function zone(api){
  const {THREE,C,scene,P,groundH,inWater,animHooks,camera,roadsNear,AREAS,inPoly}=api;const K=C.zone;if(!K)return;
  const WY=api.ctx.waterLevel||0.05,MARSH=K.marshH==null?1.6:K.marshH;
  const vn=(x,z,s,salt=91)=>{const X=x/s,Z=z/s,i=Math.floor(X),j=Math.floor(Z),fx=X-i,fz=Z-j,u=fx*fx*(3-2*fx),v=fz*fz*(3-2*fz),
    a=hash3(i,j,salt),b=hash3(i+1,j,salt),c=hash3(i,j+1,salt),d=hash3(i+1,j+1,salt);return (a*(1-u)+b*u)*(1-v)+(c*(1-u)+d*u)*v;};
  const col=h=>new THREE.Color(h);
  const TOWNS=(K.towns||[]).map(([la,lo,r])=>{const [x,z]=P([la,lo]);return [x,z,r];}),TINTS=(K.tints||[]).map(([la,lo,r,c,s])=>{const [x,z]=P([la,lo]);return [x,z,r,col(c),s==null?0.8:s];});
  const townK=(x,z)=>{let k=0;for(const [tx,tz,r] of TOWNS){const d=Math.hypot(x-tx,z-tz);if(d<r*1.2)k=Math.max(k,d<r?1:1-(d-r)/(r*0.2));}return k;};
  // the map's own woods, in a grid of 50 m cells, so the trees here do not double the engine's; and the ground still
  // kept bare (`bare`, kinds of mapped area: the plant's yards), which gets gravel and no trees
  const WG=50,cells=new Map(),BARE=new Set(K.bare||['industrial']);
  for(const a of AREAS||[]){const v=/^(wood|forest)$/.test(a.kind)?1:BARE.has(a.kind)?2:0;if(!v||!a.bb)continue;
    for(let gx=Math.floor(a.bb.x0/WG);gx<=Math.floor(a.bb.x1/WG);gx++)for(let gz=Math.floor(a.bb.z0/WG);gz<=Math.floor(a.bb.z1/WG);gz++){
      const k=gx*100003+gz;if(cells.get(k)===2)continue;const px=(gx+0.5)*WG,pz=(gz+0.5)*WG;if(inPoly(px,pz,a.o)&&!a.i.some(h=>inPoly(px,pz,h)))cells.set(k,v);}}
  const cellAt=(x,z)=>cells.get(Math.floor(x/WG)*100003+Math.floor(z/WG))||0,inWood=(x,z)=>cellAt(x,z)===1,isBare=(x,z)=>cellAt(x,z)===2;
  const PINE=[col('#263e24'),col('#2c4628'),col('#22381f')],BIRCH=[col('#3e5a2e'),col('#46623a')],FIELD=[col('#6e7646'),col('#7a7c4c'),col('#626e3e'),col('#848250')],
    MARSHC=[col('#6a6c46'),col('#5e6640'),col('#76744e')],SAND=col('#b2a47c'),GRAVEL=col('#8a8678'),YARD=[col('#56663a'),col('#5e6c40'),col('#4e5e36')];
  // what covers a point: 0 pine, 1 old field (grass and birch), 2 marsh, 3 sand, 4 town, 5 bare gravel
  function kind(x,z,h){if(isBare(x,z))return 5;if(townK(x,z)>0.5)return 4;if(h<MARSH&&vn(x,z,300,95)<0.7)return 2;const n=vn(x,z,900)*0.6+vn(x,z,240,92)*0.4;
    if(n<(K.fields==null?0.34:K.fields))return 1;if(n>0.9&&vn(x,z,120,93)>0.55)return 3;return 0;}
  const tmp=new THREE.Color(),c=new THREE.Color();let painted=0;
  const pick=(A,x,z,s,salt)=>A[Math.floor(hash3(Math.floor(x/s),Math.floor(z/s),salt)*A.length)];
  function paint(x,z,y,cc){if(y<WY-0.4||inWater(x,z))return false;const k=kind(x,z,y);
    tmp.copy(k===0?pick(PINE,x,z,30,96):k===1?(vn(x,z,80,97)<0.45?pick(BIRCH,x,z,25,98):pick(FIELD,x,z,60,99)):k===2?pick(MARSHC,x,z,40,100):k===3?SAND:k===5?GRAVEL:pick(YARD,x,z,20,101));
    const t=townK(x,z);if(t>0&&t<1)tmp.lerp(pick(YARD,x,z,20,101),t);
    for(const [tx,tz,r,tc,s] of TINTS){const d=Math.hypot(x-tx,z-tz);if(d<r)tmp.lerp(tc,s*Math.min(1,(1-d/r)*1.6)*(0.7+0.3*vn(x,z,70,102)));}
    tmp.multiplyScalar(0.9+vn(x,z,45,103)*0.2);cc.lerp(tmp,K.strength==null?0.9:K.strength);return true;}
  scene.traverse(m=>{if(!m.isMesh||!(m.name==='terrain'||/^terrain/.test(m.name))||!m.geometry.attributes.color)return;const g=m.geometry,p=g.attributes.position,cl=g.attributes.color;
    for(let i=0;i<p.count;i++){c.setRGB(cl.getX(i),cl.getY(i),cl.getZ(i));if(paint(p.getX(i),p.getZ(i),p.getY(i),c)){cl.setXYZ(i,c.r,c.g,c.b);painted++;}}cl.needsUpdate=true;});

  // ---- the trees ----
  const TILE=K.tile||400,NEAR=K.near||1300,SP=K.spacing||9,TSP=K.townSpacing||6,OVER=K.overgrowth==null?0.8:K.overgrowth;
  function merge(list){const pos=[],cl=[];for(const [g,h] of list){const a=g.toNonIndexed().attributes.position.array,cc=new THREE.Color(h);for(let i=0;i<a.length;i+=3){pos.push(a[i],a[i+1],a[i+2]);cl.push(cc.r,cc.g,cc.b);}}
    const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));ge.setAttribute('color',new THREE.Float32BufferAttribute(cl,3));ge.computeVertexNormals();return ge;}
  // Scots pine: a tall bare orange-brown trunk, a flat crown high up; birch: white, slender, a light crown; poplar: a
  // tall narrow crown (Pripyat's streets were planted with them); a young pine or birch, from the last twenty years
  const pine=merge([[new THREE.CylinderGeometry(0.16,0.3,12,5).translate(0,6,0),'#8a5a3a'],[new THREE.IcosahedronGeometry(2.6,0).scale(1.2,0.55,1.1).translate(0,13,0),'#2a4426'],[new THREE.IcosahedronGeometry(1.9,0).scale(1.1,0.5,1).translate(0.8,15,0.4),'#30482a']]),
    birch=merge([[new THREE.CylinderGeometry(0.1,0.18,8,5).translate(0,4,0),'#e2ded4'],[new THREE.IcosahedronGeometry(2.1,0).scale(0.9,1.4,0.9).translate(0,9,0),'#5a7a36'],[new THREE.IcosahedronGeometry(1.5,0).scale(0.9,1.2,0.9).translate(0.6,11,0.3),'#66843c']]),
    poplar=merge([[new THREE.CylinderGeometry(0.15,0.28,5,5).translate(0,2.5,0),'#6a6458'],[new THREE.IcosahedronGeometry(1.8,0).scale(1,3.6,1).translate(0,11,0),'#4e6e32']]),
    young=merge([[new THREE.CylinderGeometry(0.06,0.1,2.4,4).translate(0,1.2,0),'#7a6a58'],[new THREE.ConeGeometry(1.1,3.2,5).translate(0,3.4,0),'#3a5a2e']]);
  const GEOS=[pine,birch,poplar,young],mat=new THREE.MeshLambertMaterial({vertexColors:true}),o=new THREE.Object3D(),tiles=new Map();let nTrees=0;
  const KEEP=new Set(K.openRoads||['primary','secondary','tertiary','trunk']);
  const onRoad=(x,z,town)=>{const rs=roadsNear?roadsNear(x,z,town?3:7):[];return rs.some(r=>!town||KEEP.has(r.c));};
  // in a building or within 2 m of one: the walls' foot is kept clear
  const inBuilding=(x,z)=>api.buildingsAt?api.buildingsAt(x,z,3).some(b=>[[0,0],[2,0],[-2,0],[0,2],[0,-2]].some(([dx,dz])=>inPoly(x+dx,z+dz,b.ring))):false;
  function plant(L,w,x,z,h,s){o.position.set(x,h-0.2,z);o.rotation.set((hash3(x,z,104)-0.5)*0.08,hash3(x,z,105)*6.28,(hash3(z,x,106)-0.5)*0.08);o.scale.set(s,s*(0.85+hash3(z,x,107)*0.4),s);o.updateMatrix();L[w].push(o.matrix.clone());}
  function build(T){const L=[[],[],[],[]];
    for(let j=0;j<TILE/TSP;j++)for(let i=0;i<TILE/TSP;i++){const x=T.x0+(i+hash3(i,j,T.k))*TSP,z=T.z0+(j+hash3(j,i,T.k+1))*TSP;if(inWater(x,z))continue;
      const t=townK(x,z),h=groundH(x,z);if(h<WY+0.5||isBare(x,z))continue;
      if(t>0.5){   // the towns: dense where it is open ground, through the small streets' pavements
        if(hash3(x,z,108)>OVER||inBuilding(x,z)||onRoad(x,z,true))continue;const r=hash3(x,z,109);plant(L,r<0.4?1:r<0.6?2:r<0.8?3:0,x,z,h,0.6+hash3(x,z,110)*0.7);continue;}
      if((i%2)||(j%2))continue;   // outside the towns, the coarser spacing
      if(inWood(x,z)||onRoad(x,z,false)||inBuilding(x,z))continue;const k=kind(x,z,h);
      if(k===0){if(hash3(x,z,111)<0.85)plant(L,hash3(x,z,112)<0.8?0:3,x,z,h,0.7+hash3(x,z,113)*0.6);}
      else if(k===1){const r=hash3(x,z,114);if(r<0.35)plant(L,r<0.22?1:3,x,z,h,0.6+hash3(x,z,115)*0.6);}
      else if(k===3&&hash3(x,z,116)<0.1)plant(L,0,x,z,h,0.6);}
    const g=new THREE.Group();GEOS.forEach((geo,w)=>{if(!L[w].length)return;const im=new THREE.InstancedMesh(geo,mat,L[w].length);L[w].forEach((m,i)=>im.setMatrixAt(i,m));im.castShadow=true;im.userData.noFingerprint=true;g.add(im);nTrees+=L[w].length;});
    scene.add(g);T.g=g;}
  let next=0;
  animHooks.push(now=>{if(now<next)return;next=now+250;const p=camera.position,ci=Math.floor(p.x/TILE),cj=Math.floor(p.z/TILE),R=Math.ceil(NEAR/TILE),hh=p.y-groundH(p.x,p.z);let built=0;
    for(let dj=-R;dj<=R;dj++)for(let di=-R;di<=R;di++){const k=(ci+di)+','+(cj+dj);if(!tiles.has(k)){const d=Math.hypot(di,dj)*TILE;if(d>NEAR+TILE||hh>NEAR*1.6||built>=2)continue;tiles.set(k,{x0:(ci+di)*TILE,z0:(cj+dj)*TILE,k:(ci+di)*7919+(cj+dj)*104729,g:null});build(tiles.get(k));built++;}}
    for(const T of tiles.values())if(T.g){const d=Math.hypot(T.x0+TILE/2-p.x,T.z0+TILE/2-p.z);T.g.visible=d<NEAR+TILE&&hh<NEAR*1.6;}
    api.ctx.details.zone={painted,cells:cells.size,tiles:tiles.size,trees:nTrees};});
  api.ctx.details=Object.assign(api.ctx.details||{},{zone:{painted,cells:cells.size,tiles:0,trees:0}});
  // the Red Forest as it was in the summer of 1986: the pines dead and rust-red (K.redForest: [lat, lon, r]), for an
  // event to turn on and off: api.ctx.zone.red(k), k from 0 (as painted) to 1
  const RF=(K.redForest||[]).map(([la,lo,r])=>{const [x,z]=P([la,lo]);return [x,z,r];}),rust=new THREE.Color(0x9a4a22),rc=new THREE.Color();let redKept=null;
  api.ctx.zone={red(k){if(!RF.length)return;if(!redKept){redKept=[];scene.traverse(m=>{if(!m.isMesh||!(m.name==='terrain'||/^terrain/.test(m.name))||!m.geometry.attributes.color)return;
      const p=m.geometry.attributes.position,cl=m.geometry.attributes.color,idx=[];for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);let w=0;
        for(const [rx,rz,r] of RF){const d=Math.hypot(x-rx,z-rz);if(d<r)w=Math.max(w,Math.min(1,(1-d/r)*2.5)*(0.75+0.25*vn(x,z,60,120)));}
        if(w>0)idx.push(i,w,cl.getX(i),cl.getY(i),cl.getZ(i));}redKept.push([cl,idx]);});}
    for(const [cl,idx] of redKept){for(let j=0;j<idx.length;j+=5){rc.setRGB(idx[j+2],idx[j+3],idx[j+4]).lerp(rust,idx[j+1]*k);cl.setXYZ(idx[j],rc.r,rc.g,rc.b);}cl.needsUpdate=true;}}};
}
