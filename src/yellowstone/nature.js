// Yellowstone's land: what grows on it, the water running over it and the steam coming off it. An extra
// (src/engine/stages/06f-extras.js), run once the engine has built the ground, the lakes, the roads and the
// landmarks. It reads ctx.ysLand, the file tools/make-yellowstone.py writes beside the map:
//
//   the ground's colour   the engine colours terrain by height and slope, which on a plateau that is all one
//                         height paints the park one flat green. It is recoloured here from the land cover
//                         grid - lodgepole, meadow, sage, wetland, rock and snow, thermal ground, the 1988 burn -
//                         and the walls of the Grand Canyon of the Yellowstone get their yellow.
//   the forest            eighty per cent of the park is lodgepole pine, which is a hundred million trees. They
//                         are grown in tiles round the camera as it moves, thinned with distance, and dropped when
//                         it has gone; from high up the ground's colour carries it.
//   the rivers            OpenStreetMap's river and stream lines, as ribbons on the ground at their own width.
//   the steam             every basin, every mapped geyser and hot spring and every landmark that asked for it
//                         (ctx.ysSteam), in one set of points animated on the GPU.
//   the small springs     two thousand pools too small to be landmarks, as coloured discs.
//   the boundary          the park's edge, faintly.
import { hash3, mkRng } from '../core/rng.js';
import { softPoints } from './landmarks.js';

export function nature(api){
  const {THREE,ctx,C,scene,camera,renderer,animHooks,inWater,roadsNear,POIS,nightF,hour,B}=api;
  const groundH=ctx.ysHeight||api.groundH;   // the fine patches over the grid (landmarks.js)
  const land=ctx.ysLand;if(!land){api.report('nature',new Error('no land file'));return;}
  const Y=C.yellowstone||{};
  const col=h=>new THREE.Color(h);
  const lightNow=()=>0.3+0.7*(1-nightF(hour()));

  // ---- the land cover grid ----
  const cv=land.cover,CN=cv.nx*cv.nz,COVER=new Uint8Array(CN);
  {let k=0;for(let i=0;i<cv.rle.length;i+=2){COVER.fill(cv.rle[i],k,k+cv.rle[i+1]);k+=cv.rle[i+1];}}
  // the terrain grid and the cover grid are the same grid: same origin, same step
  const terr=[];scene.traverse(o=>{if(o.isMesh&&o.name==='terrain')terr.push(o);});
  const X0=B.x0,Z0=B.z0;
  const ST=cv.step;
  const coverAt=(x,z)=>{const i=Math.round((x-X0)/ST),j=Math.round((z-Z0)/ST);if(i<0||j<0||i>=cv.nx||j>=cv.nz)return 0;return COVER[j*cv.nx+i];};
  ctx.coverAt=coverAt;
  const datum=Y.datum||0;   // metres above sea level at y = 0, for the treeline and the snow

  // ---- the Grand Canyon of the Yellowstone: the river from the Upper Falls down to Tower ----
  const canyon=[];for(const w of api.WATERWAYS)if(w.name==='Yellowstone River')for(const p of w.pts){const [la]=ctx.toLatLon(p[0],p[1]);if(la>44.708&&la<44.905)canyon.push(p);}
  const cbb=api.bbox(canyon.length?canyon:[[0,0]]);
  const nearCanyon=(x,z)=>{if(!canyon.length||x<cbb.x0-1500||x>cbb.x1+1500||z<cbb.z0-1500||z>cbb.z1+1500)return 1e9;let d=1e9;for(let i=0;i<canyon.length;i+=2)d=Math.min(d,Math.hypot(x-canyon[i][0],z-canyon[i][1]));return d;};

  // ---- the ground's colour ----
  const PAL={forest:[col('#2a4226'),col('#34502c'),col('#223a22')],meadow:[col('#8c875a'),col('#7a8150'),col('#a09460')],sage:[col('#8f8e72'),col('#a09a78')],
    wet:[col('#5c7446'),col('#6f8450')],rock:[col('#7c756a'),col('#948b7d'),col('#665f56')],snow:col('#eef1f3'),thermal:[col('#b9b3a4'),col('#b39a74'),col('#c6c0b2')],
    burn:[col('#48503a'),col('#3f5c34'),col('#555540')],canyon:[col('#d9b75a'),col('#d69a7c'),col('#e8dcc2'),col('#c58c48')]};
  const cc=new THREE.Color(),tmp=new THREE.Color();
  const mix3=(arr,t,u)=>cc.copy(arr[0]).lerp(arr[1],t).lerp(arr[2]||arr[0],u*0.6);
  function colourAt(x,y,z,ny){
    const slope=Math.sqrt(Math.max(0,1-ny*ny))/Math.max(0.05,ny),abs=y+datum;
    const cov=coverAt(x,z),h1=hash3(Math.round(x/150),Math.round(z/150),3),h2=hash3(Math.round(x/450),Math.round(z/450),5);
    switch(cov){
      case 1:mix3(PAL.meadow,h1,h2);break;
      case 2:mix3(PAL.sage,h1,0);break;
      case 3:mix3(PAL.wet,h1,0);break;
      case 4:mix3(PAL.rock,h1,h2);if(abs>3150&&slope<0.7&&h1>0.35)cc.lerp(PAL.snow,Math.min(1,(abs-3150)/250)*0.85);break;
      case 5:mix3(PAL.thermal,h1*0.5,h2);break;
      case 6:mix3(PAL.burn,h1,h2);break;
      case 7:cc.set('#8a866c');break;   // under a lake, which hides it; what shows is the shore the 150 m grid could not place
      default:mix3(PAL.forest,h1,h2);}
    // steep ground is bare, whatever is on the level either side of it
    if(cov!==7&&slope>0.55)cc.lerp(tmp.copy(PAL.rock[0]).lerp(PAL.rock[2],h1),Math.min(1,(slope-0.55)*1.6));
    // the canyon walls: rhyolite rotted by hot water to yellow, pink and white, in bands
    if(slope>0.3){const dc=nearCanyon(x,z);if(dc<1300){const band=Math.sin(abs*0.09+h1*2)*0.5+0.5;
      tmp.copy(PAL.canyon[0]).lerp(PAL.canyon[1],band).lerp(PAL.canyon[2],h2*0.5).lerp(PAL.canyon[3],h1*0.3);cc.lerp(tmp,Math.min(1,(slope-0.3)*2.5)*(1-dc/1300));}}
    return cc;}
  let recoloured=0;
  for(const t of terr){const g=t.geometry,p=g.attributes.position,n=g.attributes.normal,c=g.attributes.color;
    for(let i=0;i<p.count;i++){colourAt(p.getX(i),p.getY(i),p.getZ(i),n.getY(i));c.setXYZ(i,cc.r,cc.g,cc.b);recoloured++;}
    c.needsUpdate=true;
    // The ground casting shadows on itself does nothing useful here: the shadow box is a kilometre across and
    // the plateau is a hundred, and what it did draw was a dark band of acne across the Upper Geyser Basin.
    t.castShadow=false;}

  // ---- the fine patches: the coarse grid cut away under each, and the patch laid in ----
  for(const P of (groundH.patches||[])){
    for(const t of terr){const g=t.geometry,p=g.attributes.position,ix=g.index.array,keep=[];
      for(let i=0;i<ix.length;i+=3){const a=ix[i],b=ix[i+1],c=ix[i+2],cx=(p.getX(a)+p.getX(b)+p.getX(c))/3,cz=(p.getZ(a)+p.getZ(b)+p.getZ(c))/3;
        if(cx>P.x0&&cx<P.x1&&cz>P.z0&&cz<P.z1)continue;keep.push(a,b,c);}
      if(keep.length!==ix.length)g.setIndex(keep);}
    const pos=new Float32Array(P.nx*P.nz*3),idx=[];
    for(let j=0;j<P.nz;j++)for(let i=0;i<P.nx;i++){const k=j*P.nx+i;pos[k*3]=P.x0+i*P.step;pos[k*3+1]=P.h[k];pos[k*3+2]=P.z0+j*P.step;}
    for(let j=0;j+1<P.nz;j++)for(let i=0;i+1<P.nx;i++){const a=j*P.nx+i;idx.push(a,a+P.nx,a+1,a+1,a+P.nx,a+P.nx+1);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
    const colr=new Float32Array(pos.length),nr=g.attributes.normal;
    for(let k=0;k<P.nx*P.nz;k++){colourAt(pos[k*3],pos[k*3+1],pos[k*3+2],nr.getY(k));colr[k*3]=cc.r;colr[k*3+1]=cc.g;colr[k*3+2]=cc.b;}
    g.setAttribute('color',new THREE.BufferAttribute(colr,3));g.computeBoundingSphere();
    const m=new THREE.Mesh(g,terr[0].material);m.name='terrain';m.userData.wireCat='ground';m.receiveShadow=true;scene.add(m);terr.push(m);}

  // ---- the canopy: from a few hundred metres up a lodgepole forest is a speckle of crowns and gaps, and a flat
  // vertex colour every hundred and fifty metres is a felt blanket. The ground's shader adds the speckle where
  // the ground is forest-coloured, and lets it go before it is finer than a pixel.
  {const m=terr[0].material;m.onBeforeCompile=sh=>{
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWp;').replace('#include <project_vertex>','#include <project_vertex>\nvWp=(modelMatrix*vec4(transformed,1.0)).xyz;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>',`#include <common>
varying vec3 vWp;
float ysH(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float ysN(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(ysH(i),ysH(i+vec2(1,0)),f.x),mix(ysH(i+vec2(0,1)),ysH(i+vec2(1,1)),f.x),f.y);}`)
      .replace('#include <color_fragment>',`#include <color_fragment>
{float forest=clamp((diffuseColor.g-diffuseColor.r)*9.0,0.0,1.0)*clamp(1.0-diffuseColor.g*2.2,0.0,1.0);
 float w=fwidth(vWp.x)+fwidth(vWp.z);
 float crowns=ysN(vWp.xz/7.0)*clamp(1.0-w/10.0,0.0,1.0),clumps=ysN(vWp.xz/60.0+13.0)*clamp(1.0-w/80.0,0.0,1.0),broad=ysN(vWp.xz/400.0+7.0);
 diffuseColor.rgb*=mix(1.0,0.72+0.45*crowns+0.3*(clumps-0.5)+0.2*(broad-0.5),forest);
 diffuseColor.rgb*=1.0+0.12*(ysN(vWp.xz/35.0+3.0)-0.5)*(1.0-forest)*clamp(1.0-w/40.0,0.0,1.0);}`);};
    m.needsUpdate=true;}

  // ---- rivers and streams, as ribbons on the ground ----
  {const pos=[],idx=[];let nv=0;const dec=f=>{const o=[];for(let i=0;i<f.length;i+=2)o.push([f[i]/10,f[i+1]/10]);return o;};
    for(const r of land.rivers){const pts=dec(r.p),w=r.w,stepL=w>10?30:70,lift=w>10?1.6:1.1,res=[];
      for(let i=0;i+1<pts.length;i++){const [ax,az]=pts[i],[bx,bz]=pts[i+1],L=Math.hypot(bx-ax,bz-az),n=Math.max(1,Math.ceil(L/stepL));for(let k=0;k<n;k++)res.push([ax+(bx-ax)*k/n,az+(bz-az)*k/n]);}
      res.push(pts[pts.length-1]);
      let open=false;
      for(let i=0;i<res.length;i++){const [x,z]=res[i];
        // a river running into a lake stops at the shore; the lake is drawn at its own level
        if(inWater(x,z)||!api.inMap(x,z,0)){open=false;continue;}
        const a=res[Math.max(0,i-1)],b=res[Math.min(res.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*w/2,nz=dx/l*w/2,y=groundH(x,z)+lift;
        pos.push(x+nx,y,z+nz,x-nx,y,z-nz);
        if(open)idx.push(nv-2,nv,nv-1,nv-1,nv,nv+1);
        nv+=2;open=true;}}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
    const m=new THREE.Mesh(g,new THREE.MeshPhongMaterial({color:0x3d6e86,specular:0x9fc4e0,shininess:60,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-8}));
    m.name='rivers';m.userData.wireCat='water';m.receiveShadow=true;scene.add(m);
    ctx.details=Object.assign(ctx.details||{},{riverVerts:nv});}

  // ---- the roads through the fine patches, which the engine was not given (tools/make-yellowstone.py) ----
  {const pos=[],colr=[],idx=[];let nv=0;const road=col('#4a4b4f'),trail=col((C.roadColours||{}).trail||'#b8a888');
    for(const r of (land.patchRoads||[])){const pts=[];for(let i=0;i<r.p.length;i+=2)pts.push([r.p[i]/10,r.p[i+1]/10]);
      const res=[];for(let i=0;i+1<pts.length;i++){const [ax,az]=pts[i],[bx,bz]=pts[i+1],L=Math.hypot(bx-ax,bz-az),n=Math.max(1,Math.ceil(L/10));for(let k=0;k<n;k++)res.push([ax+(bx-ax)*k/n,az+(bz-az)*k/n]);}
      res.push(pts[pts.length-1]);const c=r.c==='trail'?trail:road,w=r.w/2;
      for(let i=0;i<res.length;i++){const a=res[Math.max(0,i-1)],b=res[Math.min(res.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*w,nz=dx/l*w,[x,z]=res[i];
        pos.push(x+nx,groundH(x+nx,z+nz)+0.35,z+nz,x-nx,groundH(x-nx,z-nz)+0.35,z-nz);colr.push(c.r,c.g,c.b,c.r,c.g,c.b);
        if(i)idx.push(nv-2,nv,nv-1,nv-1,nv,nv+1);nv+=2;}}
    if(nv){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colr,3));g.setIndex(idx);g.computeVertexNormals();
      const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-6}));m.name='patch roads';m.userData.wireCat='road';m.receiveShadow=true;scene.add(m);}}

  // ---- the park boundary ----
  {const pts=[];for(const r of land.boundary){for(let i=0;i<r.length;i+=2){const x=r[i]/10,z=r[i+1]/10;pts.push(new THREE.Vector3(x,groundH(x,z)+8,z));}}
    if(pts.length){const segs=[];for(let i=0;i+1<pts.length;i++)if(pts[i].distanceTo(pts[i+1])<5000)segs.push(pts[i],pts[i+1]);
      const l=new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(segs),new THREE.LineBasicMaterial({color:0xf0d890,transparent:true,opacity:0.5}));
      l.userData.noWire=true;l.name='park boundary';scene.add(l);}}

  // ---- the small springs: every mapped pool not built as a landmark, a coloured disc ----
  {const LM=new Set(C.landmarks.map(L=>L.name.toLowerCase())),R=mkRng(4410);
    const springs=POIS.filter(p=>(p.kind==='hot_spring'||p.kind==='geyser')&&!LM.has(p.name.toLowerCase()));
    const cols=['#1d6fa8','#2f93b8','#5fb4b8','#8ab870','#d8b040','#d67a34','#b8683c'].map(col);
    const im=new THREE.InstancedMesh(new THREE.CircleGeometry(1,14).rotateX(-Math.PI/2),new THREE.MeshLambertMaterial({polygonOffset:true,polygonOffsetFactor:-5,polygonOffsetUnits:-10}),springs.length);
    const rim=new THREE.InstancedMesh(new THREE.CircleGeometry(1,14).rotateX(-Math.PI/2),new THREE.MeshLambertMaterial({color:0xc9c2b0,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-8}),springs.length);
    const d=new THREE.Object3D();
    springs.forEach((p,i)=>{const r=p.w?Math.max(1.5,p.w*0.55):1.5+R()*4,y=groundH(p.x,p.z)+0.25;d.position.set(p.x,y,p.z);d.scale.set(r,1,r*(0.8+R()*0.3));d.rotation.y=R()*6;d.updateMatrix();
      im.setMatrixAt(i,d.matrix);im.setColorAt(i,cols[p.kind==='geyser'?Math.floor(R()*3):Math.floor(R()*cols.length)]);
      d.position.y=y-0.05;d.scale.multiplyScalar(1.45);d.updateMatrix();rim.setMatrixAt(i,d.matrix);});
    for(const m of [im,rim]){m.receiveShadow=true;m.userData.far=12000;scene.add(m);}
    // every one of them steams, a little
    for(const p of springs){const r=p.w?p.w*0.5:3;ctx.ysSteam.push({x:p.x,y:groundH(p.x,p.z),z:p.z,s:p.kind==='geyser'?0.3:0.22,size:Math.max(3,r),rise:Math.max(8,r*2.5),n:1});}
    ctx.details=Object.assign(ctx.details||{},{smallSprings:springs.length});}

  // ---- the steam ----
  {const V=ctx.ysSteam||[];
    // the basins: vents scattered over the bare ground, as many as the basin is big and busy
    for(const b of land.basins){const bx=b.x/10,bz=b.z/10,n=Math.round((Y.steamPerBasin||90)*b.s*Math.min(3,b.r/800)),R=mkRng(Math.floor(bx+bz));
      for(let k=0;k<n;k++){const a=R()*6.28,r=Math.sqrt(R())*b.r*0.85,x=bx+Math.cos(a)*r,z=bz+Math.sin(a)*r;if(inWater(x,z))continue;
        V.push({x,y:groundH(x,z),z,s:0.25+R()*0.35,size:4+R()*10,rise:15+R()*35,n:1});}}
    let N=0;for(const v of V)N+=v.n||Math.max(2,Math.round(v.s*10));
    const pos=new Float32Array(N*3),seed=new Float32Array(N),prm=new Float32Array(N*4),tint=new Float32Array(N*3),R=mkRng(77);let k=0;
    for(const v of V){const n=v.n||Math.max(2,Math.round(v.s*10)),t=v.tint?col(v.tint):null;
      for(let i=0;i<n;i++){pos[k*3]=v.x;pos[k*3+1]=v.y;pos[k*3+2]=v.z;seed[k]=R();prm[k*4]=v.s;prm[k*4+1]=v.size;prm[k*4+2]=v.rise;prm[k*4+3]=7+R()*7;
        tint[k*3]=t?t.r:0.96;tint[k*3+1]=t?t.g:0.97;tint[k*3+2]=t?t.b:0.98;k++;}}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('aSeed',new THREE.BufferAttribute(seed,1));
    g.setAttribute('aPrm',new THREE.BufferAttribute(prm,4));g.setAttribute('aTint',new THREE.BufferAttribute(tint,3));g.computeBoundingSphere();
    const scaleU={value:600};
    const m=softPoints(THREE,`attribute float aSeed;attribute vec4 aPrm;attribute vec3 aTint;uniform vec2 uWind;uniform float uHumid;
void main(){
 float u=fract(uTime/aPrm.w+aSeed),rise=aPrm.z*uHumid;
 float j=fract(aSeed*91.7)-0.5,j2=fract(aSeed*57.3)-0.5;
 // up, spreading, and leaning away downwind as it goes
 vec3 p=position+vec3(j*aPrm.y*0.5+uWind.x*u*u*rise,u*rise,j2*aPrm.y*0.5+uWind.y*u*u*rise);
 vec4 mvPosition=modelViewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*mvPosition;
 gl_PointSize=clamp(aPrm.y*(0.5+1.6*u)*(0.8+0.4*uHumid)*uScale/-mvPosition.z,0.0,700.0);
 vA=aPrm.x*0.5*smoothstep(0.0,0.12,u)*pow(1.0-u,1.5)*min(1.0,uHumid);vC=aTint;
 #include <fog_vertex>
}`,{uWind:{value:new THREE.Vector2(0.6,0.25)},uHumid:{value:1},uScale:scaleU});
    const pts=new THREE.Points(g,m);pts.name='steam';pts.userData.noShadow=true;pts.userData.noWire=true;pts.renderOrder=2;scene.add(pts);
    // Steam shows best on a cold still morning and hardly at all on a hot afternoon, which is true and also
    // what makes the basins look different at different hours.
    animHooks.push(now=>{const h=hour();m.uniforms.uTime.value=now/1000;m.uniforms.uLight.value=lightNow();
      m.uniforms.uHumid.value=1.35-0.55*Math.max(0,Math.min(1,(h-8)/5))+0.45*Math.max(0,Math.min(1,(h-18)/3));
      scaleU.value=renderer.domElement.clientHeight/(2*Math.tan(camera.fov*Math.PI/360));});
    ctx.details=Object.assign(ctx.details||{},{steamVents:V.length,steamPoints:N});}

  // ---- the forest ----
  // A tree: a bare trunk most of the way up and a narrow crown - lodgepole grow in stands so close they
  // self-prune, which is what the name is from. Heights are scaled per instance, so the geometry is a unit tree.
  const treeGeo=(()=>{const trunk=new THREE.CylinderGeometry(0.018,0.03,0.42,4,1,true).translate(0,0.21,0).toNonIndexed(),
      crown=new THREE.ConeGeometry(0.13,0.72,6,1,true).translate(0,0.64,0).toNonIndexed(),
      pos=[...trunk.attributes.position.array,...crown.attributes.position.array],colr=[];
    for(let i=0;i<trunk.attributes.position.count;i++)colr.push(0.55,0.42,0.34);for(let i=0;i<crown.attributes.position.count;i++)colr.push(1,1,1);
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colr,3));g.computeVertexNormals();return g;})();
  const snagGeo=new THREE.CylinderGeometry(0.007,0.02,1,4,1,true).translate(0,0.5,0);
  const treeM=new THREE.MeshLambertMaterial({vertexColors:true}),snagM=new THREE.MeshLambertMaterial({color:0x6e6960});
  const TILE=Y.forestTile||800,NEAR=Y.forestNear||3200,PER=Y.forestPerTile||3400;
  const tiles=new Map(),greens=['#2e4a2a','#355530','#28422a','#3a5a32','#2c4630'].map(col),young=['#4f7a3a','#5a8440','#46703a'].map(col);
  function buildTile(tx,tz){
    const R=mkRng(tx*73856093^tz*19349663),d=new THREE.Object3D(),M=[],Cs=[],S=[];
    for(let k=0;k<PER;k++){const x=(tx+R())*TILE,z=(tz+R())*TILE,r=R(),cov=coverAt(x,z);
      // how likely a tree is here, by what grows here
      let p=0,young_=false,snag=false;
      if(cov===0)p=0.92;else if(cov===6){if(r<0.6){p=1;young_=true;}else if(r<0.68){p=1;snag=true;}}
      else if(cov===1)p=0.006;else if(cov===2)p=0.01;else if(cov===3)p=0.08;else if(cov===4)p=0.1;
      if(R()>p)continue;
      if(!api.inMap(x,z,20)||inWater(x,z))continue;
      const y=groundH(x,z);if(y+datum>3200)continue;   // the treeline
      if(roadsNear(x,z,5,r=>r.c!=='trail').length)continue;
      const h=young_?3+R()*6:snag?6+R()*8:13+R()*14;
      d.position.set(x,y-0.3,z);d.rotation.set(0,R()*6.28,0);
      if(snag){d.scale.set(h,h,h);d.updateMatrix();S.push(d.matrix.clone());continue;}
      d.scale.set(h*(young_?1.4:1),h,h*(young_?1.4:1));d.updateMatrix();M.push(d.matrix.clone());Cs.push((young_?young:greens)[Math.floor(R()*(young_?3:5))]);}
    const cx=(tx+0.5)*TILE,cz=(tz+0.5)*TILE,sph=new THREE.Sphere(new THREE.Vector3(cx,groundH(cx,cz)+10,cz),TILE*0.75+40);
    const mk=(geo,mat,arr,cols)=>{if(!arr.length)return null;const g=new THREE.BufferGeometry();for(const a in geo.attributes)g.setAttribute(a,geo.attributes[a]);if(geo.index)g.setIndex(geo.index);g.boundingSphere=sph;
      const im=new THREE.InstancedMesh(g,mat,arr.length);arr.forEach((m,i)=>im.setMatrixAt(i,m));if(cols)cols.forEach((c,i)=>im.setColorAt(i,c));
      im.castShadow=false;im.receiveShadow=true;im.userData.noWire=true;im.userData.total=arr.length;scene.add(im);return im;};
    return {t:mk(treeGeo,treeM,M,Cs),s:mk(snagGeo,snagM,S,null),cx,cz,used:0};
  }
  let lastT=0,built=0;
  animHooks.push(now=>{if(now-lastT<200)return;lastT=now;
    const cp=camera.position,above=cp.y-groundH(cp.x,cp.z);
    // from high up the ground's colour is the forest; there is no point drawing trees nobody can see
    const reach=above>4500?0:NEAR*Math.max(0.35,Math.min(1,1.4-above/4000));
    const ti0=Math.floor((cp.x-reach)/TILE),ti1=Math.floor((cp.x+reach)/TILE),tj0=Math.floor((cp.z-reach)/TILE),tj1=Math.floor((cp.z+reach)/TILE);
    let made=0;
    for(let tj=tj0;tj<=tj1&&reach>0;tj++)for(let ti=ti0;ti<=ti1;ti++){const key=ti+','+tj;const cx=(ti+0.5)*TILE,cz=(tj+0.5)*TILE,dist=Math.hypot(cx-cp.x,cz-cp.z);
      if(dist>reach+TILE*0.7)continue;
      let t=tiles.get(key);if(!t){if(made>=2)continue;t=buildTile(ti,tj);tiles.set(key,t);made++;built++;}
      t.used=now;}
    // thin with distance: the instances are in random order, so drawing the first part of them thins evenly
    for(const [key,t] of tiles){const dist=Math.hypot(t.cx-cp.x,t.cz-cp.z),on=reach>0&&dist<=reach+TILE*0.7;
      const f=on?Math.max(0.12,Math.min(1,1.25-dist/(NEAR*0.8))):0;
      for(const im of [t.t,t.s])if(im){im.visible=f>0;im.count=Math.max(1,Math.floor(im.userData.total*f));}
      // drop what has not been near the camera for a minute
      if(!on&&now-t.used>60000){for(const im of [t.t,t.s])if(im){scene.remove(im);im.dispose();}tiles.delete(key);}}
    ctx.details.forestTiles=tiles.size;});
  ctx.details=Object.assign(ctx.details||{},{recoloured,forest:'lodgepole in '+TILE+' m tiles within '+NEAR+' m'});
}
