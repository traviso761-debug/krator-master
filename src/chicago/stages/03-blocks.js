// ---------- blocks: towers downtown; outside it, Chicago's residential blocks: two rows of narrow lots either side of an alley, houses set back behind their yards, garages on the alley, shopfronts on the commercial streets ----------
await stage('blocks');
// window textures: the facade (light ground, dark panes) and what glows at night (only the panes)
function winTex(glow,cols,rows){const cv=document.createElement('canvas');cv.width=cv.height=64;const g=cv.getContext('2d');g.fillStyle=glow?'#000':'#f2f0ec';g.fillRect(0,0,64,64);
  const R=mkRng(glow?5:9),cw=64/cols,rh=64/rows;for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const lit=R()<0.55;g.fillStyle=glow?(lit?`rgb(${230+R()*25},${200+R()*40},${140+R()*60})`:'#000'):`rgb(${40+R()*30},${52+R()*30},${70+R()*30})`;g.fillRect(i*cw+cw*0.2,j*rh+rh*0.15,cw*0.55,rh*0.62);}
  const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;return t;}
const facadeTex=winTex(false,4,4),glowTex=winTex(true,4,4),houseTex=winTex(false,2,1),houseGlow=winTex(true,2,1);
const bldMats={};   // one material per district: colour × window map, tiled in world units (a window bay every 4 m)
function bldMat(d){if(bldMats[d.key])return bldMats[d.key];const m=new THREE.MeshLambertMaterial({color:d.color,map:facadeTex,emissiveMap:glowTex,emissive:0x000000});m.color.multiplyScalar(1.15);setEnv(m,{K:0.25,id:'bld'+d.key});bldMats[d.key]=m;return m;}
const brickM=new THREE.MeshLambertMaterial({color:0xffffff,map:houseTex,emissiveMap:houseGlow,emissive:0x000000});setEnv(brickM,{K:0.28,id:'brick'});bldMats._brick=brickM;   // houses: two windows per 3.6 m bay, one per storey
const trimM=new THREE.MeshLambertMaterial({color:0xffffff}),roofM=new THREE.MeshLambertMaterial({color:0x4a4644}),garageM=new THREE.MeshLambertMaterial({color:0x5e5a54});
const shopM=new THREE.MeshLambertMaterial({color:0x1e2a34,emissive:0x000000}),awningM=new THREE.MeshLambertMaterial({color:0xffffff}),tankM=new THREE.MeshLambertMaterial({color:0x6a5040});
const BRICK=['#8a4b3a','#9c5a45','#7a4535','#b07a5a','#c9b79a','#a39a8a','#6e5a4e','#b58e6a','#d2c3a8','#8c7b6a','#a8624a','#c2a888'].map(h=>new THREE.Color(h));
const AWNING=['#1f5f3a','#7a1f24','#1f3f6a','#c8a030','#2a2a2a','#a04a20','#3a6a7a'].map(h=>new THREE.Color(h));
const lots=[];   // {x,z,w,dpt,h,ry,kind,district}
const boxG=new THREE.BoxGeometry(1,1,1);boxG.translate(0,0.5,0);
const prismG=(()=>{const g=new THREE.BufferGeometry(),v=[-0.5,0,-0.5, 0.5,0,-0.5, 0,1,-0.5, -0.5,0,0.5, 0.5,0,0.5, 0,1,0.5],idx=[0,2,1, 3,4,5, 0,1,4, 0,4,3, 0,3,5, 0,5,2, 1,2,5, 1,5,4];g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.setIndex(idx);g.computeVertexNormals();return g.toNonIndexed();})();
prismG.computeVertexNormals();
// instances grouped into 700 m tiles, each with bounds from its own instances, so the camera and the shadow pass can skip what is out of view;
// small details (trim, roofs, garages, shopfronts) are also hidden beyond `far` metres from the camera
const CHUNKS=[];
function chunker(geo,mat,shadow,far){const tiles=new Map(),d=new THREE.Object3D(),TS=700;
  return {n:0,add(x,y,z,sx,sy,sz,ry,col){const k=Math.floor(x/TS)+','+Math.floor(z/TS);let t=tiles.get(k);if(!t){t={m:[],c:[],x0:1e9,x1:-1e9,y1:0,z0:1e9,z1:-1e9,s:0};tiles.set(k,t);}
      d.position.set(x,y,z);d.rotation.set(0,ry||0,0);d.scale.set(sx,sy,sz);d.updateMatrix();t.m.push(...d.matrix.elements);t.c.push(col||null);
      t.x0=Math.min(t.x0,x);t.x1=Math.max(t.x1,x);t.z0=Math.min(t.z0,z);t.z1=Math.max(t.z1,z);t.y1=Math.max(t.y1,y+sy);t.s=Math.max(t.s,sx,sz);this.n++;},
    build(){for(const t of tiles.values()){const n=t.c.length,g=new THREE.BufferGeometry();if(geo.index)g.setIndex(geo.index);for(const k in geo.attributes)g.setAttribute(k,geo.attributes[k]);
        const cx=(t.x0+t.x1)/2,cz=(t.z0+t.z1)/2;g.boundingSphere=new THREE.Sphere(new THREE.Vector3(cx,t.y1/2,cz),Math.hypot(t.x1-t.x0,t.z1-t.z0,t.y1)/2+t.s);
        const im=new THREE.InstancedMesh(g,mat,n);im.instanceMatrix.array.set(t.m);if(t.c[0]){for(let i=0;i<n;i++)im.setColorAt(i,t.c[i]||BRICK[0]);}
        im.castShadow=!!shadow;im.receiveShadow=true;im.userData.far=far||0;scene.add(im);CHUNKS.push(im);}}};}
const BODY=chunker(boxG,brickM,true),TRIM=chunker(boxG,trimM,true,1500),ROOF=chunker(prismG,roofM,true,2200),GARAGE=chunker(boxG,garageM,false,900),SHOP=chunker(boxG,shopM,false,1200),AWN=chunker(boxG,awningM,false,900),TANK=chunker(new THREE.CylinderGeometry(1,1,1,10).translate(0,0.5,0),tankM,true,2000);
function skyline(d,x,z){const dist=Math.hypot(x-SKY_C[0],z-SKY_C[1]),f=Math.pow(Math.max(0,1-dist/1900),1.4),n=0.35+0.65*fbm(x*0.004+3,z*0.004+9);return d.base+(d.tall-d.base)*f*n;}
const lmFoot=C.landmarks.filter(l=>l.kind!=='pier').map(l=>{const [x,z]=P(l.at);return {x,z,r:Math.max(l.w||40,(l.d||0)+(l.gap||0))*0.6+14};});
const nearLandmark=(x,z,r)=>lmFoot.some(f=>Math.hypot(f.x-x,f.z-z)<f.r+r);
const DIAG_SEGS=STREETS.filter(s=>s.axis==='d');
const FOCUS=(C.focus||[]).map(f=>{const [x,z]=P(f.at);return {name:f.name,x,z,r:f.radius};});
const focusAt=(x,z)=>FOCUS.find(f=>Math.hypot(f.x-x,f.z-z)<f.r)||null;
const dry=(x,z)=>!inWater(x,z)&&!parkAt(x,z)&&!onPier(x,z)&&!DIAG_SEGS.some(s=>segDist(x,z,s.a[0],s.a[1],s.b[0],s.b[1])<=s.w/2+5);   // diagonals (Milwaukee, Lake Shore Drive) cut through the grid
const fits=(pts,r)=>pts.every(([x,z])=>inMap(x,z,20)&&dry(x,z)&&!riverAt(x,z,8))&&!nearLandmark(pts[0][0],pts[0][1],r);
section('blocks',()=>{
  const xs=[...new Map(STREETS.filter(s=>s.axis==='x').map(s=>[Math.round(s.at),s])).values()].sort((a,b)=>a.at-b.at);
  const zs=[...new Map(STREETS.filter(s=>s.axis==='z').map(s=>[Math.round(s.at),s])).values()].sort((a,b)=>a.at-b.at);
  const covers=(s,v)=>v>=Math.min(s.a[s.axis==='x'?1:0],s.b[s.axis==='x'?1:0])-1&&v<=Math.max(s.a[s.axis==='x'?1:0],s.b[s.axis==='x'?1:0])+1;   // a street with a range only bounds blocks inside it
  let houses=0,shops=0,alleys=0;
  for(let i=0;i+1<xs.length;i++)for(let j=0;j+1<zs.length;j++){
    const cx0=(xs[i].at+xs[i+1].at)/2,cz0=(zs[j].at+zs[j+1].at)/2;
    let W=xs[i],E=xs[i+1],N=zs[j],S=zs[j+1];
    if(!covers(W,cz0)||!covers(N,cx0))continue;
    let ii=i+1;while(ii<xs.length-1&&!covers(xs[ii],cz0))ii++;E=xs[ii];
    let jj=j+1;while(jj<zs.length-1&&!covers(zs[jj],cx0))jj++;S=zs[jj];
    const walk=3.5;   // sidewalk
    let x0=W.at+W.w/2+walk,x1=E.at-E.w/2-walk,z0=N.at+N.w/2+walk,z1=S.at-S.w/2-walk;
    if(x1-x0<24||z1-z0<24)continue;
    const cx=(x0+x1)/2,cz=(z0+z1)/2;if(!inMap(cx,cz,60))continue;
    const d=districtAt(cx,cz),H=skyline(d,cx,cz),foc=focusAt(cx,cz);
    if(H>30){   // downtown: towers alone or in pairs, midrises two to four
      const n=H>90?1+(rnd()<0.35?1:0):2+Math.floor(rnd()*3),cols=n>=3?2:n,rows=Math.ceil(n/cols);
      for(let k=0;k<n;k++){const ci=k%cols,rj=Math.floor(k/cols);const w=(x1-x0)/cols,dd=(z1-z0)/rows,gx=x0+ci*w,gz=z0+rj*dd;
        const inset=H>90?Math.min(w,dd)*0.1:1+rnd()*2,w2=w-2*inset,d2=dd-2*inset;if(w2<7||d2<7)continue;const lx=gx+w/2,lz=gz+dd/2;
        if(!fits([[lx,lz],[gx+inset,gz+inset],[gx+w-inset,gz+inset],[gx+inset,gz+dd-inset],[gx+w-inset,gz+dd-inset]],Math.max(w2,d2)*0.35))continue;
        let h=H*(0.55+0.9*rnd());if(k>0&&H>90)h*=0.35;h=Math.max(8,Math.min(h,d.tall*1.1));
        lots.push({x:lx,z:lz,w:w2,dpt:d2,h,ry:0,kind:h>120?'tower':'midrise',district:d,fixed:false});}
      continue;}
    // a residential block, long in u; the alley runs down its middle along u; houses face the two long sides, shops face any major street
    const longZ=(z1-z0)>=(x1-x0),U0=longZ?z0:x0,U1=longZ?z1:x1,V0=longZ?x0:z0,V1=longZ?x1:z1,SA=longZ?W:N,SB=longZ?E:S,E0=longZ?N:W,E1=longZ?S:E;
    const at=(u,v)=>longZ?[v,u]:[u,v],Vm=(V0+V1)/2,alleyW=5;
    const shopH=()=>foc?11+rnd()*7:7.5+rnd()*5;
    const shopAt=(u,v,w,depth,face,end)=>{   // (u,v) is the footprint centre; w runs along the street, depth away from it; face points at the street
      const [x,z]=at(u,v),[sx,sz]=(longZ!==!!end)?[depth,w]:[w,depth],h=shopH();
      if(!fits([[x,z],[x-sx/2,z-sz/2],[x+sx/2,z-sz/2],[x-sx/2,z+sz/2],[x+sx/2,z+sz/2]],2))return false;
      const col=BRICK[Math.floor(rnd()*BRICK.length)];BODY.add(x,0,z,sx,h,sz,0,col);TRIM.add(x,h,z,sx+0.6,0.9,sz+0.6,0,new THREE.Color(col).multiplyScalar(0.7));
      // the storefront glass and an awning on the street face
      const [fx,fz]=face;const ox=x+fx*(sx/2+0.2),oz=z+fz*(sz/2+0.2),gw=(fx?sz:sx)-0.8;
      SHOP.add(ox,0.3,oz,fx?0.5:gw,3.8,fz?0.5:gw,0);if(rnd()<0.7)AWN.add(x+fx*(sx/2+1),4.2,z+fz*(sz/2+1),fx?2:gw,0.35,fz?2:gw,0,AWNING[Math.floor(rnd()*AWNING.length)]);
      if(foc&&rnd()<0.25)TANK.add(x+(rnd()-0.5)*sx*0.4,h+2.5,z+(rnd()-0.5)*sz*0.4,2.4,4,2.4,0);
      lots.push({x,z,w:sx,dpt:sz,h,ry:0,kind:'shop',district:d,fixed:false});shops++;return true;};
    // ends that meet a major street become shop rows facing it
    const band0=E0.major?24:0,band1=E1.major?24:0;
    for(const [on,uc,faceU] of [[band0,U0+12,-1],[band1,U1-12,1]]){if(!on)continue;for(let v=V0;v<V1-6;){const w=Math.min(V1-v,7.6+rnd()*4.5);shopAt(uc,v+w/2,w,22,longZ?[0,faceU]:[faceU,0],true);v+=w;}}
    // the alley
    if(V1-V0>50){const [ax,az]=at((U0+band0+U1-band1)/2,Vm),len=U1-U0-band0-band1;g2.fillStyle='#57585b';if(longZ)g2.fillRect(pxX(ax-alleyW/2),pxZ(az-len/2),alleyW*PX,len*PX);else g2.fillRect(pxX(ax-len/2),pxZ(az-alleyW/2),len*PX,alleyW*PX);alleys++;}
    // the two long rows
    for(const [side,street] of [[-1,SA],[1,SB]]){const front=side<0?V0:V1,back=V1-V0>50?Vm+side*(alleyW/2):Vm,faceV=side;const depthMax=Math.abs(front-back);
      for(let u=U0+band0;u<U1-band1-6;){const w=Math.min(U1-band1-u,7.6+rnd()*(street.major?4:3.2)),uc=u+w/2;u+=w;
        if(street.major){shopAt(uc,front-side*11,w,22,longZ?[faceV,0]:[0,faceV]);continue;}
        // a house: front yard, the house, a back yard, a garage on the alley
        const setback=3.5+rnd()*2.5,depth=Math.min(depthMax-setback-9,14+rnd()*8);if(depth<8)continue;
        const vc=front-side*(setback+depth/2),[x,z]=at(uc,vc),ww=w-1.2,[sx,sz]=longZ?[depth,ww]:[ww,depth];
        if(!fits([[x,z],[x-sx/2,z-sz/2],[x+sx/2,z-sz/2],[x-sx/2,z+sz/2],[x+sx/2,z+sz/2]],1))continue;
        const storeys=rnd()<0.55?2:rnd()<0.7?3:1,h=storeys*3.4+0.8,col=BRICK[Math.floor(rnd()*BRICK.length)];
        BODY.add(x,0,z,sx,h,sz,0,col);
        if(rnd()<0.42){ROOF.add(x,h,z,ww,2.2+ww*0.18,depth,longZ?Math.PI/2:0);}   // a frame house: gable to the street
        else TRIM.add(x,h,z,sx+0.4,0.7,sz+0.4,0,new THREE.Color(col).multiplyScalar(0.75));   // a two- or three-flat: flat roof with a cornice
        if(depthMax>30&&rnd()<0.6){const [gx,gz]=at(uc,back-side*(-3.5)),[gsx,gsz]=longZ?[6,Math.min(ww,6.5)]:[Math.min(ww,6.5),6];if(fits([[gx,gz]],0))GARAGE.add(gx,0,gz,gsx,3,gsz,0);}
        lots.push({x,z,w:sx,dpt:sz,h,ry:0,kind:'house',district:d,fixed:false});houses++;}}}
  groundTex.needsUpdate=true;
  ctx.lots=lots.length;ctx.lotList=lots;
  // downtown geometry: towers get setbacks, everything gets a roof box now and then; water tanks on the old loft buildings
  const byD={};for(const l of lots)if(l.kind==='tower'||l.kind==='midrise')(byD[l.district.key]=byD[l.district.key]||[]).push(l);
  const dm=new THREE.Object3D();let total=0;
  for(const key in byD){const L=byD[key],parts=[];
    for(const l of L){if(l.kind==='tower'){const tiers=2+Math.floor(rnd()*2);let y=0,w=l.w,dd=l.dpt;for(let t=0;t<tiers;t++){const hh=l.h*(t===tiers-1?0.35:0.65/(tiers-1));parts.push([l.x,y,l.z,w,hh,dd]);y+=hh;w*=0.78;dd*=0.78;}}
      else parts.push([l.x,0,l.z,l.w,l.h,l.dpt]);
      if(rnd()<0.5)parts.push([l.x+(rnd()-0.5)*l.w*0.3,l.h,l.z+(rnd()-0.5)*l.dpt*0.3,Math.max(3,l.w*0.25),2+rnd()*3,Math.max(3,l.dpt*0.25)]);
      if(l.kind==='midrise'&&l.h<80&&/rivernorth|westloop|southloop|noblesquare/.test(key)&&rnd()<0.3)TANK.add(l.x+(rnd()-0.5)*l.w*0.4,l.h+3,l.z+(rnd()-0.5)*l.dpt*0.4,3,5,3,0);}
    const im=new THREE.InstancedMesh(boxG,bldMat(DIST[key]),parts.length),tint=new THREE.Color();
    parts.forEach((p,i)=>{dm.position.set(p[0],p[1],p[2]);dm.scale.set(p[3],p[4],p[5]);dm.updateMatrix();im.setMatrixAt(i,dm.matrix);
      const k=hash3(p[0],p[2],5);tint.setHSL(0.55+0.5*hash3(p[0],p[2],6),k<0.5?0.05:0.25,0.62+0.5*hash3(p[0],p[2],7));im.setColorAt(i,tint);});   // every building its own shade: glass, stone, brick
    im.castShadow=im.receiveShadow=true;im.userData.district=key;scene.add(im);total+=parts.length;}
  for(const c of [BODY,TRIM,ROOF,GARAGE,SHOP,AWN,TANK])c.build();
  ctx.details=Object.assign(ctx.details||{},{towers:total,houses,shops,alleys,garages:GARAGE.n,tanks:TANK.n});
});
// detail tiles fade in with distance (checked a few times a second)
{let t=0;const c=new THREE.Vector3();animHooks.push(now=>{if(now-t<300)return;t=now;for(const im of CHUNKS){if(!im.userData.far)continue;c.copy(im.geometry.boundingSphere.center);im.visible=camera.position.distanceTo(c)-im.geometry.boundingSphere.radius<im.userData.far;}});}
// windows and shopfronts come on at dusk
animHooks.push(()=>{const w=windowF(hourCur);for(const k in bldMats)bldMats[k].emissive.setRGB(w,w*0.92,w*0.8);shopM.emissive.setRGB(w*0.55,w*0.48,w*0.3);});
