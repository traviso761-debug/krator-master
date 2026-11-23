// ================================================================= PHĒR — the world: the Krator sky, the painted ground, the lake
// Runs after 90-scene (renderer, scene, camera and lights exist; the sheet's showcase was skipped: window.CITY). The near
// ground (the delta, the hillsides, the shelf) is a mesh at 5 m cells wearing a canvas painted from the plan's records:
// the strand's and the delta's sand, the slope's grass, the stream, every way at its width, the fair ground and the plaza.
// The road is a ribbon of its own draped on the ground, every hairpin to the rim. The far ground is two meshes coloured by
// height and slope: 40 m cells round the town, 300 m to the Lake of the Vale's far shore and the mountains round it (the
// owner, 2026-11-17: "they should be visible"); the lake is a plane at its level (y 0).
// Nothing reads the canvas back (placement is the plan's, never the paint's). [web]: canvas and three.js.
reseed(PH.SEED+1);const PH_T0=performance.now();
for(const f of FRAME_HOOKS_PRE)FRAME_HOOKS.push(f);
// ---------------------------------------------------------------- the sky and its light (KratorSky, as Qiblai's and Erewhon's)
/* the page's day: ?day=N (the year's day), else a fair day (PH.FAIR.day); its weekday decides the fair (89zp phFairDay) */
const PH_DAY=(function(){const v=Number(new URLSearchParams(location.search).get('day'));return isFinite(v)&&v>0?v:PH.FAIR.day;})(),PH_FAIR_TODAY=phFairDay(PH_DAY);
const PH_SKY={hour:9.2,day:PH_DAY,dens:1.1};
/* the reach: the mountains round the lake stand 10-60 km off (as Kirstabal's page: the camera to 90 km, the sky past it) */
camera.near=.6;camera.far=90000;camera.updateProjectionMatrix();
KratorSky.attach(scene,60000).traverse(o=>{o.userData.probeSkip=true;});scene.fog.density=.000014;   /* the lake 60 km across: the far shore's range softened, not lost */
const phHemi=scene.children.find(o=>o.isHemisphereLight);
function phSkyTick(){KratorSky.update(camera.position,PH_SKY.hour,PH_SKY.day,PH_SKY.dens);const L=KratorSky.lighting();
 sun.position.copy(L.sunDir).multiplyScalar(1500).add(camera.position);sun.target.position.copy(camera.position);sun.target.updateMatrixWorld();sun.intensity=L.sunIntensity;sun.color.copy(L.sunColor);
 fill.intensity=.22*L.dayF+.05;if(phHemi)phHemi.intensity=L.ambient;scene.fog.color.copy(L.fog);renderer.setClearColor(L.fog);}
FRAME_HOOKS.push(phSkyTick);phSkyTick();
// ---------------------------------------------------------------- the near ground's extent and its painted canvas
const PHG={x0:-1100,x1:1400,z0:-1700,z1:1450};PHG.W=PHG.x1-PHG.x0;PHG.H=PHG.z1-PHG.z0;
const PHG_PX=4096/Math.max(PHG.W,PHG.H),pgx=x=>(x-PHG.x0)*PHG_PX,pgz=z=>(z-PHG.z0)*PHG_PX;
const phCv=document.createElement('canvas');phCv.width=Math.ceil(PHG.W*PHG_PX);phCv.height=Math.ceil(PHG.H*PHG_PX);
(function phPaint(){const g=phCv.getContext('2d'),W=phCv.width,H=phCv.height,img=g.createImageData(W,H),D=img.data;
 // the ground's colour by place: lake bed, wet sand, the strand's sand, grass on the wall, the rim's tilled plain; darker on steep ground
 const col=(x,z)=>{const y=phH(x,z),e=6,s=Math.hypot(phH(x+e,z)-phH(x-e,z),phH(x,z+e)-phH(x,z-e))/(2*e),d=phShoreZ(x)-z;
  if(y<-.2)return[86,104,96];if(y<1.6)return[176,160,128];
  const fan=phFanR(x,z)<PH.FAN.r*.92;
  let c=d<0?(y<4?[176,160,128]:[100,112,72]):d<PH.SLOPE.strand*.8?[170,152,118]:fan?[160,146,112]:[96,116,66];   /* the headland and the point (land out in the lake): a beach at the water, grass on top; the delta's gravel and sand */
  if(!fan&&d>60&&d<PH.SLOPE.turn+200){const f=(Math.floor((x+4000)/34)+Math.floor((z+8000)/26))%4;if(f===0)c=[118,118,70];}   /* the milpa terraces between the alleys */
  const r=Math.min(1,Math.max(0,(s-.25)/.35));return[c[0]+(118-c[0])*r,c[1]+(108-c[1])*r,c[2]+(94-c[2])*r];};
 for(let j=0;j<H;j+=2)for(let i=0;i<W;i+=2){const c=col(PHG.x0+(i+1)/PHG_PX,PHG.z0+(j+1)/PHG_PX);
  for(const [a,b] of[[0,0],[1,0],[0,1],[1,1]]){if(i+a>=W||j+b>=H)continue;const k=((j+b)*W+i+a)*4;D[k]=c[0];D[k+1]=c[1];D[k+2]=c[2];D[k+3]=255;}}
 g.putImageData(img,0,0);
 const line=(P,w,closed)=>{g.lineWidth=w*PHG_PX;g.beginPath();P.forEach((p,i)=>i?g.lineTo(pgx(p[0]),pgz(p[1])):g.moveTo(pgx(p[0]),pgz(p[1])));if(closed)g.closePath();g.stroke();};
 g.lineCap='round';g.lineJoin='round';
 // the stream: its water down the channel to the cove
 g.strokeStyle='#3f6f78';const SP=[];for(let z=phShoreZ(PH.COVE.x)+4;z>=PHG.z0;z-=10)SP.push([phStreamX(z),z]);line(SP,7);
 // the fair ground (packed earth), the ways at their widths: the avenues in ashlar, the streets and lanes in cobbles
 for(const [G,c] of[[PH_FAIR,'#a69a84'],[PH_PLAZA,'#b0a690']]){g.fillStyle=c;g.beginPath();[[G.x-G.hw,G.d-G.hd],[G.x+G.hw,G.d-G.hd],[G.x+G.hw,G.d+G.hd],[G.x-G.hw,G.d+G.hd]].forEach((q,i)=>{const p=phAt(q[0],q[1]);i?g.lineTo(pgx(p[0]),pgz(p[1])):g.moveTo(pgx(p[0]),pgz(p[1]));});g.closePath();g.fill();}
 for(const w of PH.ways){if(/the road up the spur/.test(w.tag))continue;g.strokeStyle=w.cls==='avenue'?'#a8a194':w.cls==='main'?'#9b9386':w.cls==='alley'?'#a39886':'#8f887b';line(w.pts,w.w,w.closed);}
 // a dooryard of trodden earth under every building, a shade darker than the ground
 g.fillStyle='rgba(92,80,64,.35)';for(const p of PH_PLACE){const b=p.bo,c=Math.cos(p.ry),s=Math.sin(p.ry),hw=b.hw+2,hd=b.hd+2;
  g.beginPath();[[-hw,-hd],[hw,-hd],[hw,hd],[-hw,hd]].forEach((q,i)=>{const x=p.x+q[0]*c+q[1]*s,z=p.z-q[0]*s+q[1]*c;i?g.lineTo(pgx(x),pgz(z)):g.moveTo(pgx(x),pgz(z));});g.closePath();g.fill();}})();
// ---------------------------------------------------------------- the ground's texture: the library's sets over the paint
// As Erewhon's ground (targets/erewhon/90a erGroundShader), from the Vale of Xanadu biome's own pack ('xanadu-bio', which
// Xanadu's page carries): a detail map over everything (two scales), the shore's sand and pebbles on the beach band, the
// stream's gravel down its channel and ravine, and on steep ground the wall's rock (the strata banded by height). Per-vertex
// masks (aGL: sand, pebbles, gravel; aGM: steep) from the ground's closed form, none on a way or under a building (the
// plan's records, through the flora mask's indexes would be dearer: a way's sand is the paint's). [web]: a shader hook.
function phGroundShader(g,m,cx,cz){const T3=THREE,sm=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);},p=g.attributes.position;
 const lay=new Float32Array(p.count*4),gm=new Float32Array(p.count);
 for(let i=0;i<p.count;i++){const x=p.getX(i)+cx,z=-p.getY(i)+cz,d=phShoreZ(x)-z,y=phH(x,z),e=6,s=Math.hypot(phH(x+e,z)-phH(x-e,z),phH(x,z+e)-phH(x,z-e))/(2*e);
  const shore=sm(-12,2,d)*sm(70,10,d),peb=sm(.42,.62,fbm(x*.012+4,z*.012-1,617,2)),sd=Math.abs(x-phStreamX(z));
  lay[i*4]=shore*(1-peb);lay[i*4+1]=shore*peb;lay[i*4+2]=sm(14,4,sd)*(y>-.5?1:0);lay[i*4+3]=0;gm[i]=sm(.32,.7,s);}
 g.setAttribute('aGL',new T3.BufferAttribute(lay,4));g.setAttribute('aGM',new T3.BufferAttribute(gm,1));
 const P=n=>(typeof KMAT!=='undefined'&&KMAT.packed)?KMAT.packed('xanadu-bio',n):null,TX=L=>KMAT.textures(L,{aniso:8}).map;
 const dL=P('groundDetail'),a=P('ground.shore'),b=P('ground.pebble'),c=P('ground.gravel'),LIB=!!(dL&&a&&b&&c);window._phGround={lib:LIB};if(!LIB)return;
 const det=TX(dL);det.wrapS=det.wrapT=T3.RepeatWrapping;const L={shore:TX(a),shoreK:1/a.scale[0],peb:TX(b),pebK:1/b.scale[0],grav:TX(c),gravK:1/c.scale[0]};
 for(const k of['shore','peb','grav']){L[k].wrapS=L[k].wrapT=T3.RepeatWrapping;}
 const f4=v=>v.toFixed(4),tri=(u,k)=>'mix(pow(texture2D('+u+',p*'+f4(k)+').rgb,vec3(2.2)),pow(texture2D('+u+',q*'+f4(k*.47)+'+vec2(0.31,0.17)).rgb,vec3(2.2)),mt)';
 m.onBeforeCompile=sh=>{Object.assign(sh.uniforms,{uDetail:{value:det},uLShore:{value:L.shore},uLPeb:{value:L.peb},uLGrav:{value:L.grav}});
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec4 aGL;attribute float aGM;varying vec4 vGL;varying float vGM;varying vec3 vGWP;')
   .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGL=aGL;vGM=aGM;vGWP=(modelMatrix*vec4(transformed,1.0)).xyz;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uDetail;uniform sampler2D uLShore;uniform sampler2D uLPeb;uniform sampler2D uLGrav;varying vec4 vGL;varying float vGM;varying vec3 vGWP;')
   .replace('#include <map_fragment>',['#include <map_fragment>',
    '{vec3 dt=texture2D(uDetail,vGWP.xz*0.165).rgb;vec3 dt2=texture2D(uDetail,vGWP.xz*0.021+0.37).rgb;diffuseColor.rgb*=mix(vec3(1.0),dt*dt2*1.12,0.8);',
    'vec2 p=vGWP.xz,q=mat2(0.799,-0.602,0.602,0.799)*p;float mt=smoothstep(-0.3,0.3,sin(p.x*0.017+2.0*sin(p.y*0.011))*sin(p.y*0.013+1.3));',
    'vec3 ts='+tri('uLShore',L.shoreK)+';vec3 tp='+tri('uLPeb',L.pebK)+';vec3 tg='+tri('uLGrav',L.gravK)+';',
    'diffuseColor.rgb=mix(diffuseColor.rgb,diffuse*ts*1.3,0.8*vGL.x);diffuseColor.rgb=mix(diffuseColor.rgb,diffuse*tp*1.3,0.8*vGL.y);diffuseColor.rgb=mix(diffuseColor.rgb,diffuse*tg*1.3,0.8*vGL.z);',
    ' float y=vGWP.y+6.0*sin(vGWP.x*0.004+vGWP.z*0.003)+2.0*sin(vGWP.x*0.031);float b1=0.5+0.5*sin(y*0.21),b2=smoothstep(0.6,0.95,sin(y*0.07+1.3));',
    ' vec3 st=mix(vec3(0.34,0.30,0.24),vec3(0.44,0.36,0.26),b1);st=mix(st,vec3(0.28,0.26,0.26),b2*0.7);st*=0.85+0.3*texture2D(uDetail,vec2(vGWP.x+vGWP.z,vGWP.y*3.0)*0.05).r;',
    ' diffuseColor.rgb=mix(diffuseColor.rgb,st,vGM*0.55);}'].join('\n'));};
 m.customProgramCacheKey=()=>'ph-ground';}
// ---------------------------------------------------------------- the meshes: the near ground, the far ground, the lake
(function phTerrain(){const cell=5,NX=Math.round(PHG.W/cell),NZ=Math.round(PHG.H/cell),geo=new THREE.PlaneGeometry(PHG.W,PHG.H,NX,NZ);
 const p=geo.attributes.position,uv=geo.attributes.uv,cx=(PHG.x0+PHG.x1)/2,cz=(PHG.z0+PHG.z1)/2;
 for(let i=0;i<p.count;i++){const x=p.getX(i)+cx,z=-p.getY(i)+cz;p.setZ(i,phH(x,z));uv.setXY(i,pgx(x)/phCv.width,1-pgz(z)/phCv.height);}
 geo.computeVertexNormals();const tex=new THREE.CanvasTexture(phCv);tex.encoding=THREE.sRGBEncoding;tex.anisotropy=8;
 const gmat=new THREE.MeshStandardMaterial({map:tex,roughness:.95,metalness:0});phGroundShader(geo,gmat,cx,cz);
 groundM=new THREE.Mesh(geo,gmat);groundM.rotation.x=-Math.PI/2;groundM.position.set(cx,0,cz);
 groundM.userData.isGround=true;groundM.userData.probeSkip=true;groundM.name='terrain';scene.add(groundM);
 // the far ground: two meshes coloured by height and slope, each a little under the finer one where they meet: 40 m cells
 // round the town (the slope, the rim, the near ridges), 300 m to the lake's far shore and the mountains round it
 const lin=c=>Math.pow(c/255,2.2),colour=(y,s)=>y<0?[86,104,96]:s>.45?[118,112,98]:y<30?[164,150,118]:y<760?[92,112,62]:y<1250?[72,96,56]:y<1650?[104,110,72]:[128,118,98];
 const farMesh=(F,fc,inside,drop,name)=>{const fx=Math.round((F.x1-F.x0)/fc),fz=Math.round((F.z1-F.z0)/fc),fg=new THREE.PlaneGeometry(F.x1-F.x0,F.z1-F.z0,fx,fz);
  const fp=fg.attributes.position,fcx=(F.x0+F.x1)/2,fcz=(F.z0+F.z1)/2,cols=new Float32Array(fp.count*3),e=fc*.5,W=fx+1,Hs=new Float32Array(fp.count);
  for(let i=0;i<fp.count;i++)Hs[i]=phH(fp.getX(i)+fcx,-fp.getY(i)+fcz);
  /* under the finer mesh a vertex takes the lowest of its own and its eight neighbours' heights, less `drop`: a coarse
     cell's plane bridges a hollow between vertices on its slopes (the delta under the far ground's 300 m cells stood 9-30 m
     over the drawn terrain and through the caravanserai, 2026-11-17); every point of a cell is within a cell of each of its
     corners, so the plane stays under the samples round it */
  for(let i=0;i<fp.count;i++){const x=fp.getX(i)+fcx,z=-fp.getY(i)+fcz,h=Hs[i];let y=h;
   if(inside(x,z)){const r=Math.floor(i/W),c0=i%W;for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const rr=r+a,cc=c0+b;if(rr>=0&&cc>=0&&cc<W&&rr*W+cc<fp.count)y=Math.min(y,Hs[rr*W+cc]);}y-=drop;}
   fp.setZ(i,y);
   const sl=Math.hypot(phH(x+e,z)-phH(x-e,z),phH(x,z+e)-phH(x,z-e))/(2*e),c=colour(h,sl);cols[i*3]=lin(c[0]);cols[i*3+1]=lin(c[1]);cols[i*3+2]=lin(c[2]);}
  fg.setAttribute('color',new THREE.BufferAttribute(cols,3));fg.computeVertexNormals();
  const M=new THREE.Mesh(fg,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,metalness:0}));M.rotation.x=-Math.PI/2;M.position.set(fcx,0,fcz);
  M.userData.probeSkip=true;M.name=name;scene.add(M);return M;};
 const MID={x0:-7000,x1:7000,z0:-10000,z1:4000},inBox=(B,m)=>(x,z)=>x>B.x0+m&&x<B.x1-m&&z>B.z0+m&&z<B.z1-m;
 farMesh(MID,40,inBox(PHG,20),3,'mid ground');
 farMesh({x0:-44000,x1:44000,z0:-30000,z1:62000},300,inBox(MID,300),8,'far ground');
 // the road (PH_ROAD): a ribbon draped on the ground, every 6 m along it, its hairpins to the rim and on to the Thalaba road
 {const P=PH_ROAD.pts,hw=PH_ROAD.w/2,pos=[],idx=[];let n=0;
  for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i],L=Math.hypot(b[0]-a[0],b[1]-a[1]),ux=(b[0]-a[0])/L,uz=(b[1]-a[1])/L,nx=-uz,nz=ux;
   for(let t=0;t<=L;t+=6){const x=a[0]+ux*t,z=a[1]+uz*t;for(const sd of[-1,1]){const qx=x+nx*hw*sd,qz=z+nz*hw*sd;pos.push(qx,phH(qx,qz)+.25,qz);}
    if(t>0){idx.push(n-2,n-1,n,n-1,n+1,n);}n+=2;}}
  const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));rg.setIndex(idx);rg.computeVertexNormals();
  const road=new THREE.Mesh(rg,new THREE.MeshStandardMaterial({color:0x9b9386,roughness:.95,metalness:0,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2,side:THREE.DoubleSide}));
  road.userData.probeSkip=true;road.name='the road up the spur';scene.add(road);}
 // the lake at its level: one plane to the far shore and past it
 const lake=new THREE.Mesh(new THREE.PlaneGeometry(160000,160000),new THREE.MeshStandardMaterial({color:0x3d7480,roughness:.1,metalness:.3,transparent:true,opacity:.9}));
 lake.rotation.x=-Math.PI/2;lake.position.set(0,PH.LAKE,30000);lake.userData.probeSkip=true;lake.name='the Lake of the Vale';scene.add(lake);})();
window._worldMs=Math.round(performance.now()-PH_T0);
