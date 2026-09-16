// ---------- blocks: every grid cell becomes lots; towers rise with the skyline field and light up at night ----------
await stage('blocks');
// window textures: the facade (light ground, dark panes) and what glows at night (only the panes)
function winTex(glow){const cv=document.createElement('canvas');cv.width=cv.height=64;const g=cv.getContext('2d');g.fillStyle=glow?'#000':'#f2f0ec';g.fillRect(0,0,64,64);
  const R=mkRng(glow?5:9);for(let j=0;j<4;j++)for(let i=0;i<4;i++){const lit=R()<0.55;g.fillStyle=glow?(lit?`rgb(${230+R()*25},${200+R()*40},${140+R()*60})`:'#000'):`rgb(${40+R()*30},${52+R()*30},${70+R()*30})`;g.fillRect(i*16+3,j*16+2,9,11);}
  const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;return t;}
const facadeTex=winTex(false),glowTex=winTex(true);
const bldMats={};   // one material per district: colour × window map, tiled in world units (a window bay every 4 m)
function bldMat(d){if(bldMats[d.key])return bldMats[d.key];const m=new THREE.MeshLambertMaterial({color:d.color,map:facadeTex,emissiveMap:glowTex,emissive:0x000000});m.color.multiplyScalar(1.15);setEnv(m,{K:0.25,id:'bld'+d.key});bldMats[d.key]=m;return m;}
const lots=[];   // {x,z,w,dpt,h,ry,kind,district}
const boxG=new THREE.BoxGeometry(1,1,1);boxG.translate(0,0.5,0);
const LOOP_C={x:0,z:-100};
function skyline(d,x,z){const dist=Math.hypot(x-LOOP_C.x,z-LOOP_C.z),f=Math.pow(Math.max(0,1-dist/1700),1.5),n=0.35+0.65*fbm(x*0.004+3,z*0.004+9);return d.base+(d.tall-d.base)*f*n;}
const lmFoot=C.landmarks.map(l=>({x:l.x,z:l.z,r:Math.max(l.w||40,l.d||40,l.kind==='pier'?0:0)*0.75+20}));
const nearLandmark=(x,z)=>lmFoot.some(f=>Math.hypot(f.x-x,f.z-z)<f.r);
const elBand=(x,z)=>(Math.abs(x-EL.east)<14||Math.abs(x-EL.west)<14)&&z>EL.north-14&&z<EL.south+14||(Math.abs(z-EL.north)<14||Math.abs(z-EL.south)<14)&&x>EL.west-14&&x<EL.east+14;
section('blocks',()=>{
  const half=GRID.street/2;
  for(let bx=-WORLD/2;bx<SHORE-GRID.pitchX;bx+=GRID.pitchX)for(let bz=-WORLD/2;bz<WORLD/2-GRID.pitchZ;bz+=GRID.pitchZ){
    const cx=bx+GRID.pitchX/2,cz=bz+GRID.pitchZ/2;
    if(inWater(cx,cz)||parkAt(cx,cz)||nearLandmark(cx,cz))continue;
    if(cx>C.beach.x0-60&&cz>C.beach.z0&&cz<C.beach.z1)continue;
    // shrink the block away from wide streets and the river
    let x0=bx+half,x1=bx+GRID.pitchX-half,z0=bz+half,z1=bz+GRID.pitchZ-half;
    for(const m of MAJOR){const e=m.w/2+2;if(m.axis==='x'){if(m.at>x0-half&&m.at<x1+half){if(m.at<cx)x0=Math.max(x0,m.at+e);else x1=Math.min(x1,m.at-e);}}else{if(m.at>z0-half&&m.at<z1+half){if(m.at<cz)z0=Math.max(z0,m.at+e);else z1=Math.min(z1,m.at-e);}}}
    if(inRiver(x0,cz)||inRiver(x1,cz)||inRiver(cx,z0)||inRiver(cx,z1)||x1-x0<30||z1-z0<30)continue;
    const d=districtAt(cx,cz),H=skyline(d,cx,cz);
    // lots: one tower on a corner, or two to four buildings filling the block
    const n=H>90?1+(rnd()<0.35?1:0):H>35?2+Math.floor(rnd()*2):4;
    const cols=n>=3?2:n,rows=Math.ceil(n/cols);
    for(let k=0;k<n;k++){const i=k%cols,j=Math.floor(k/cols);const w=(x1-x0)/cols,dd=(z1-z0)/rows;const gx=x0+i*w,gz=z0+j*dd;
      const inset=H>90?w*0.12:2+rnd()*3,w2=w-2*inset,d2=dd-2*inset;if(w2<8||d2<8)continue;
      let h=H*(0.55+0.9*rnd());if(k>0&&H>90)h*=0.35;h=Math.max(6,Math.min(h,d.tall*1.1));
      if(elBand(gx+w/2,gz+dd/2))h=Math.min(h,d.base*0.8);
      lots.push({x:gx+w/2,z:gz+dd/2,w:w2,dpt:d2,h,ry:0,kind:h>120?'tower':h>35?'midrise':'low',district:d,fixed:false});}}
  ctx.lots=lots.length;ctx.lotList=lots;
  // geometry: towers get setbacks, everything gets a roof box now and then
  const byD={};for(const l of lots){(byD[l.district.key]=byD[l.district.key]||[]).push(l);}
  const dm=new THREE.Object3D();let total=0;
  for(const key in byD){const L=byD[key],parts=[];
    for(const l of L){if(l.kind==='tower'){const tiers=2+Math.floor(rnd()*2);let y=0,w=l.w,d=l.dpt;for(let t=0;t<tiers;t++){const hh=l.h*(t===tiers-1?0.35:0.65/(tiers-1));parts.push([l.x,y,l.z,w,hh,d]);y+=hh;w*=0.78;d*=0.78;}}
      else parts.push([l.x,0,l.z,l.w,l.h,l.dpt]);
      if(rnd()<0.5)parts.push([l.x+(rnd()-0.5)*l.w*0.3,l.h,l.z+(rnd()-0.5)*l.dpt*0.3,Math.max(3,l.w*0.25),2+rnd()*3,Math.max(3,l.dpt*0.25)]);}
    const im=new THREE.InstancedMesh(boxG,bldMat(DIST[key]),parts.length),tint=new THREE.Color();
    parts.forEach((p,i)=>{dm.position.set(p[0],p[1],p[2]);dm.scale.set(p[3],p[4],p[5]);dm.updateMatrix();im.setMatrixAt(i,dm.matrix);
      const k=hash3(p[0],p[2],5);tint.setHSL(0.55+0.5*hash3(p[0],p[2],6),k<0.5?0.05:0.25,0.62+0.5*hash3(p[0],p[2],7));im.setColorAt(i,tint);});   // every building its own shade: glass, stone, brick
    im.castShadow=im.receiveShadow=true;im.userData.district=key;scene.add(im);total+=parts.length;}
  ctx.details={buildings:total,lots:lots.length};
});
// windows come on at dusk
animHooks.push(()=>{const w=windowF(hourCur);for(const k in bldMats)bldMats[k].emissive.setRGB(w,w*0.92,w*0.8);});
