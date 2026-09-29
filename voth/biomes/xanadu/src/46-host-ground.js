// ================================================================= HOST — ground and water
// One ground mesh painted by the map's classes and the field cache, a tiled
// detail texture for the grain, and the cliffs' strata drawn in the shader by
// world height (a top-down paint cannot show a cliff face's banding): the
// rock here is the colour of petrified wood, ochre, rust, violet-grey and
// cream, and so is the wood of the Vale's trees. The lake is a plane at y=0;
// the sacred river is its own ribbon following the descending bed, with foam
// where it drops.
const LAKECOL=new THREE.Color().setHSL(XANADU_LAKE.hue,.55,.45);
const TEX_GROUND=BIO.canvasTex(2048,2048,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const SX=TERR.X1-TERR.X0,SZ=TERR.Z1-TERR.Z0;
 const c=new THREE.Color(),t=new THREE.Color();
 const MEAD=new THREE.Color(0x6e8c3c),MEAD2=new THREE.Color(0x86984a),GOLD=new THREE.Color(0xb0a058),LUSH=new THREE.Color(0x4e7a36),
  LIT=new THREE.Color(0x4a3c28),LIT2=new THREE.Color(0x6a4a2c),MOSS=new THREE.Color(0x45662e),
  SAND=new THREE.Color(0xc8bc98),PEB=new THREE.Color(0xa8a494),
  ROSSA=new THREE.Color(0x9a5a3a),ROSSA2=new THREE.Color(0xb07048),LIME=new THREE.Color(0xcfc4a6),SCRUB=new THREE.Color(0x7a8050),
  ROCK=new THREE.Color(0x8a8078),ROCK2=new THREE.Color(0x6e6670),ROCK3=new THREE.Color(0xa89880),SCREE=new THREE.Color(0xb4aca0),SNOW=new THREE.Color(0xe8ecf0),
  GRAV=new THREE.Color(0xbab2a2),SILT=new THREE.Color(0x8a8a6a);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const wx=TERR.X0+(x+.5)/w*SX,wz=TERR.Z0+(y+.5)/h*SZ;
  const n=(BIO.fn.h3(x,y,3)-.5),n3=fbm(wx*.004,wz*.004,4.1,2)-.5;
  const wet=FC.at(FC.a.wet,wx,wz),up=FC.at(FC.a.up,wx,wz),mist=FC.at(FC.a.mist,wx,wz),flow=FC.at(FC.a.flow,wx,wz),sd=FC.at(FC.a.sd,wx,wz),sl=FC.at(FC.a.slope,wx,wz),hh=FC.at(FC.a.h,wx,wz);
  // the vale: meadow, going gold where it is drier, lush by the water
  c.copy(MEAD).lerp(MEAD2,clamp(.5+n3*2.2,0,1)).lerp(GOLD,smooth(.62,.46,wet)*.75).lerp(LUSH,smooth(.72,.9,wet)*.6);
  // the forested flanks: litter and moss under the canopy
  const fk=smooth(.64,.78,wet)*smooth(.3,.12,up)*smooth(0,120,sd)*smooth(.2,.55,fbm(wx*.0026+2,wz*.0026-5,93,2)+.2);
  t.copy(LIT).lerp(LIT2,clamp(.5+n3*2,0,1)).lerp(MOSS,smooth(.8,.95,wet)*.5);c.lerp(t,fk*.8);
  // the uplands: terra rossa, limestone and olive scrub
  const bk=smooth(.18,.36,up)*smooth(.8,.6,up);
  t.copy(ROSSA).lerp(ROSSA2,clamp(.5+n3*2,0,1)).lerp(LIME,smooth(.56,.7,fbm(wx*.009,wz*.009,7,2))*.8).lerp(SCRUB,smooth(.4,.65,fbm(wx*.006+3,wz*.006,8,2))*.45);
  c.lerp(t,bk);
  // the cliffs and the mountains: rock, scree, a little snow on the high tops
  const rk=Math.max(smooth(.55,.8,up),smooth(.7,1.2,sl)*smooth(.1,.3,up));
  t.copy(ROCK).lerp(ROCK2,clamp(.5+n3*2.4,0,1)).lerp(ROCK3,smooth(.55,.7,fbm(wx*.011,wz*.004,9,2))).lerp(SCREE,smooth(.5,.3,sl)*smooth(.8,1,up)*.5);
  c.lerp(t,rk);c.lerp(SNOW,smooth(760,860,hh+40*n3)*smooth(.9,.5,sl)*.85);
  // the mist: moss on everything
  c.lerp(MOSS,mist*smooth(.9,.5,sl)*.55);
  // the shore and the river banks
  c.lerp(SAND.clone().lerp(PEB,clamp(.5+n3*3,0,1)),smooth(70,6,sd)*smooth(-8,4,sd)*.85);
  c.lerp(SILT,smooth(0,-20,sd));
  c.lerp(GRAV,smooth(.55,.95,flow)*.75);
  const k=1+n*.08;
  d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const TEX_DETAIL=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=232+(fbm(x/9,y/9,5,2)-.5)*36+(BIO.fn.h3(x,y,9)-.5)*20;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const MAT_GROUND=new THREE.MeshLambertMaterial({map:TEX_GROUND,color:0x9a9890});
MAT_GROUND.onBeforeCompile=sh=>{sh.uniforms.uDetail={value:TEX_DETAIL};
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;varying vec3 vGWN;').replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vGWN=normalize(mat3(modelMatrix)*objectNormal);');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uDetail;varying vec3 vGWP;varying vec3 vGWN;')
  .replace('#include <map_fragment>',['#include <map_fragment>',
   '{vec3 dt=texture2D(uDetail,vGWP.xz*0.165).rgb;vec3 dt2=texture2D(uDetail,vGWP.xz*0.021+0.37).rgb;diffuseColor.rgb*=mix(vec3(1.0),dt*dt2*1.12,0.85);',
   // the strata: bands by height, wandering a little, in the petrified palette (the map is sRGB-decoded, so these are linear)
   ' float steep=1.0-clamp(vGWN.y,0.0,1.0); float y=vGWP.y+6.0*sin(vGWP.x*0.004+vGWP.z*0.003)+2.0*sin(vGWP.x*0.031);',
   ' float b1=0.5+0.5*sin(y*0.42), b2=smoothstep(0.55,0.95,sin(y*0.11+1.3)), b3=smoothstep(0.7,1.0,sin(y*0.23+vGWP.x*0.001));',
   ' vec3 st=mix(vec3(0.30,0.24,0.20),vec3(0.42,0.26,0.14),b1); st=mix(st,vec3(0.24,0.20,0.28),b2*0.8); st=mix(st,vec3(0.55,0.49,0.38),b3*0.7);',
   ' st*=0.85+0.3*texture2D(uDetail,vec2(vGWP.x+vGWP.z,vGWP.y*3.0)*0.05).r;',
   ' diffuseColor.rgb=mix(diffuseColor.rgb,st,smoothstep(0.42,0.72,steep));}'].join('\n'));};
(function(){const SX=TERR.X1-TERR.X0,SZ=TERR.Z1-TERR.Z0,NXg=700,NZg=660,g=new THREE.PlaneGeometry(SX,SZ,NXg,NZg);g.rotateX(-Math.PI/2);g.translate((TERR.X0+TERR.X1)/2,0,(TERR.Z0+TERR.Z1)/2);
 const p=g.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,terrainH(p.getX(i),p.getZ(i)));
 // PlaneGeometry's uv runs v up the plane; the canvas's y runs down it (z south): match them
 const uv=g.attributes.uv;for(let i=0;i<uv.count;i++){uv.setXY(i,(p.getX(i)-TERR.X0)/SX,1-(p.getZ(i)-TERR.Z0)/SZ);}
 g.computeVertexNormals();const m=new THREE.Mesh(g,MAT_GROUND);m.userData.probeSkip=true;m.userData.inspectLabel='The Vale of Xanadu';scene.add(m);})();

// ---------------------------------------------------------------- the lake
const WATER_SHALLOW=new THREE.Color().setHSL(XANADU_LAKE.hue,.50,.55),WATER_MID=new THREE.Color().setHSL(XANADU_LAKE.hue+.02,.58,.34),WATER_DEEP=new THREE.Color().setHSL(XANADU_LAKE.hue+.05,.60,.15),WATER_PALE=new THREE.Color().setHSL(XANADU_LAKE.hue-.02,.45,.70);
function waterMat(label){const m=new THREE.ShaderMaterial({fog:true,vertexColors:true,
 uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,{uT:{value:0},uSun:{value:new THREE.Vector3(-1200,950,-600).normalize()},uSky:{value:new THREE.Color(0xd6e2e0)},uFlow:{value:label==='river'?1:0}}]),
 vertexShader:['#include <fog_pars_vertex>','varying vec3 vWP;varying vec3 vCol;varying vec2 vUv;',
  'void main(){vCol=color;vUv=uv;vec4 wp=modelMatrix*vec4(position,1.0);vWP=wp.xyz;vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n'),
 fragmentShader:['#include <fog_pars_fragment>','uniform float uT,uFlow;uniform vec3 uSun,uSky;varying vec3 vWP;varying vec3 vCol;varying vec2 vUv;',
  'void main(){',
  ' float dcam=length(cameraPosition-vWP);float rk=1.0-smoothstep(120.0,480.0,dcam);',
  ' float fl=uFlow*vUv.y*0.07-uT*uFlow*0.9;',   // the river's ripples run downstream
  ' vec3 n=normalize(vec3(rk*(0.03*sin(vWP.x*0.31+uT*1.1+fl*6.0)+0.018*sin(vWP.z*0.53-uT*0.7+vWP.x*0.11)),1.0,rk*(0.03*cos(vWP.z*0.27+uT*0.9+fl*5.0)+0.018*sin(vWP.x*0.47+uT*1.3))));',
  ' vec3 V=normalize(cameraPosition-vWP);float fr=pow(1.0-max(dot(n,V),0.0),3.0);',
  ' vec3 col=mix(vCol,uSky,0.10+fr*0.62);',
  ' float foam=uFlow*vUv.x*(0.55+0.45*sin(vUv.y*0.9-uT*6.0+sin(vWP.x*0.3)*2.0));',
  ' col=mix(col,vec3(0.93,0.95,0.94),clamp(foam,0.0,0.9));',
  ' vec3 H=normalize(uSun+V);col+=pow(max(dot(n,H),0.0),150.0)*0.6*vec3(1.0,0.96,0.88);',
  ' gl_FragColor=vec4(col,1.0);','#include <fog_fragment>','}'].join('\n')});
 m.uniforms.fogColor.value=scene.fog.color;m.uniforms.fogDensity.value=scene.fog.density;TICKS.push(dt=>{m.uniforms.uT.value+=dt;});return m;}
function lakeColorAt(x,z,out){const h=terrainH(x,z),d=Math.max(0,-h);
 const shoal=fbm(x*.0031+2,z*.0031-4,505,2);
 out.copy(WATER_SHALLOW).lerp(WATER_PALE,Math.max(smooth(.5,.68,shoal)*smooth(3,.4,d),smooth(.9,.1,d)*.6)).lerp(WATER_MID,smooth(1.5,6,d)).lerp(WATER_DEEP,smooth(8,30,d));return out;}
(function(){const SX=TERR.X1-TERR.X0,SZ=TERR.Z1-TERR.Z0,g=new THREE.PlaneGeometry(SX,SZ,320,300);g.rotateX(-Math.PI/2);g.translate((TERR.X0+TERR.X1)/2,0,(TERR.Z0+TERR.Z1)/2);
 const p=g.attributes.position,col=new Float32Array(p.count*3),c=new THREE.Color();
 for(let i=0;i<p.count;i++){lakeColorAt(p.getX(i),p.getZ(i),c);c.convertSRGBToLinear();col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;}
 g.setAttribute('color',new THREE.BufferAttribute(col,3));
 const m=new THREE.Mesh(g,waterMat('lake'));m.userData.probeSkip=true;m.userData.inspectLabel='The lake';m.renderOrder=1;scene.add(m);})();
// ---------------------------------------------------------------- the river
// A ribbon across the bed at every resample point. Its level is a hand above
// the bed; it reaches out to where the banks rise above that level. uv.y runs
// downstream in metres (the ripples follow it), uv.x carries the foam: the
// cascades, the chasm's rapids.
const RIVER_WATER=(function(){const P=RIV.P,n=P.length,pos=[],col=[],uv=[],idx=[],c=new THREE.Color(),cl=new THREE.Color().setHSL(XANADU_LAKE.hue+.03,.45,.40),cd=new THREE.Color().setHSL(XANADU_LAKE.hue+.05,.5,.24);
 const ACROSS=6;
 for(let i=0;i<n;i++){const a=P[Math.max(0,i-1)],b=P[Math.min(n-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l,nz=dx/l;
  const s=RIV.S[i],g=RIV.gorgeK(s),w=RIV.halfW(s),kf=mix(.06,.35,g),lvl0=RIV.bed[i]+.65,lvl=s/RIV.LEN>.97?Math.min(lvl0,-.06):lvl0,half=w+.8*.65/kf;
  const drop=Math.max(0,(RIV.bed[Math.max(0,i-1)]-RIV.bed[Math.min(n-1,i+1)])/Math.max(1,RIV.S[Math.min(n-1,i+1)]-RIV.S[Math.max(0,i-1)]));
  const foam=clamp(smooth(.03,.16,drop)+g*.25,0,1);
  for(let k=0;k<=ACROSS;k++){const t=k/ACROSS*2-1,x=P[i][0]+nx*half*t,z=P[i][1]+nz*half*t;
   pos.push(x,lvl,z);c.copy(cl).lerp(cd,(1-Math.abs(t))*mix(.3,.8,g));c.convertSRGBToLinear();col.push(c.r,c.g,c.b);uv.push(foam*(.6+.4*Math.abs(t)),s);}}
 for(let i=0;i<n-1;i++)for(let k=0;k<ACROSS;k++){const a=i*(ACROSS+1)+k,b=a+1,c2=a+ACROSS+1,d=c2+1;idx.push(a,c2,b,b,c2,d);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);
 const m=new THREE.Mesh(g,waterMat('river'));m.userData.probeSkip=true;m.userData.inspectLabel='The sacred river';m.renderOrder=2;m.material.side=THREE.DoubleSide;scene.add(m);return m;})();
