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
function skyline(d,x,z){const dist=Math.hypot(x-SKY_C[0],z-SKY_C[1]),f=Math.pow(Math.max(0,1-dist/1900),1.4),n=0.35+0.65*fbm(x*0.004+3,z*0.004+9);return d.base+(d.tall-d.base)*f*n;}
const lmFoot=C.landmarks.filter(l=>l.kind!=='pier').map(l=>{const [x,z]=P(l.at);return {x,z,r:Math.max(l.w||40,(l.d||0)+(l.gap||0))*0.6+14};});
const nearLandmark=(x,z,r)=>lmFoot.some(f=>Math.hypot(f.x-x,f.z-z)<f.r+r);
const DIAG_SEGS=STREETS.filter(s=>s.axis==='d');
const dry=(x,z)=>!inWater(x,z)&&!parkAt(x,z)&&!onPier(x,z)&&!DIAG_SEGS.some(s=>segDist(x,z,s.a[0],s.a[1],s.b[0],s.b[1])<=s.w/2+3);   // diagonals (Milwaukee, Lake Shore Drive) cut through the grid
section('blocks',()=>{
  // block edges: the centre lines of every axis-aligned street, with the half-width to stay clear of
  const xs=[...new Map(STREETS.filter(s=>s.axis==='x').map(s=>[Math.round(s.at),s])).values()].sort((a,b)=>a.at-b.at);
  const zs=[...new Map(STREETS.filter(s=>s.axis==='z').map(s=>[Math.round(s.at),s])).values()].sort((a,b)=>a.at-b.at);
  const covers=(s,v)=>v>=Math.min(s.a[s.axis==='x'?1:0],s.b[s.axis==='x'?1:0])-1&&v<=Math.max(s.a[s.axis==='x'?1:0],s.b[s.axis==='x'?1:0])+1;   // a street with a range only bounds blocks inside it
  for(let i=0;i+1<xs.length;i++)for(let j=0;j+1<zs.length;j++){
    const cx0=(xs[i].at+xs[i+1].at)/2,cz0=(zs[j].at+zs[j+1].at)/2;
    // a ranged street that does not reach this block does not split it: skip the narrow half-cell, the neighbour covers it
    let W=xs[i],E=xs[i+1],N=zs[j],S=zs[j+1];
    if(!covers(W,cz0)||!covers(N,cx0))continue;
    let ii=i+1;while(ii<xs.length-1&&!covers(xs[ii],cz0))ii++;E=xs[ii];
    let jj=j+1;while(jj<zs.length-1&&!covers(zs[jj],cx0))jj++;S=zs[jj];
    let x0=W.at+W.w/2+1,x1=E.at-E.w/2-1,z0=N.at+N.w/2+1,z1=S.at-S.w/2-1;
    if(x1-x0<24||z1-z0<24)continue;
    const cx=(x0+x1)/2,cz=(z0+z1)/2;if(Math.abs(cx)>HALF-60||Math.abs(cz)>HALF-60)continue;
    const d=districtAt(cx,cz),H=skyline(d,cx,cz);
    // lots: towers alone or in pairs, midrises two to four, low buildings in a row of narrow frontages
    const n=H>90?1+(rnd()<0.35?1:0):H>35?2+Math.floor(rnd()*3):Math.max(2,Math.round((z1-z0)/28));
    const long=(z1-z0)>(x1-x0),cols=H>35?(n>=3?2:n):(long?2:n),rows=H>35?Math.ceil(n/cols):(long?Math.ceil(n/2):1);
    for(let k=0;k<cols*rows&&k<n+ (H<=35?n:0);k++){const ci=k%cols,rj=Math.floor(k/cols);if(rj>=rows)break;const w=(x1-x0)/cols,dd=(z1-z0)/rows,gx=x0+ci*w,gz=z0+rj*dd;
      const inset=H>90?Math.min(w,dd)*0.1:1+rnd()*2,w2=w-2*inset,d2=dd-2*inset;if(w2<7||d2<7)continue;
      const lx=gx+w/2,lz=gz+dd/2,rad=Math.max(w2,d2)/2;
      // every corner and the middle must be dry land, and clear of the river walls, the parks and the landmarks
      const pts=[[lx,lz],[gx+inset,gz+inset],[gx+w-inset,gz+inset],[gx+inset,gz+dd-inset],[gx+w-inset,gz+dd-inset]];
      if(!pts.every(([x,z])=>dry(x,z)&&!riverAt(x,z,8)))continue;
      if(nearLandmark(lx,lz,rad*0.7))continue;
      let h=H*(0.55+0.9*rnd());if(k>0&&H>90)h*=0.35;h=Math.max(5,Math.min(h,d.tall*1.1));
      lots.push({x:lx,z:lz,w:w2,dpt:d2,h,ry:0,kind:h>120?'tower':h>35?'midrise':'low',district:d,fixed:false});}}
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
