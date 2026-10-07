// ================================================================= HOST — the ground, the streams, the mist (the kipuka)
// One ground mesh painted by the flow mosaic (46) and the fields (47): the kipuka's dark forest floor, the red laterite
// the old flows weather to, the young flows' black rock going green with moss, the new flow black; then the library's
// layers over it (materials.json ground.*). Then the streams' water, and the siphon trees' mist (made after the build,
// 88, from where the kit put them: makeMist).
FLOWS.flows.forEach(f=>{let sx=0,sz=0,n=0;const F=FLOWS;
 for(let k=0;k<F.id.length;k+=7){if(F.id[k]!==f.fi)continue;const i=k%F.N,j=(k-i)/F.N;sx+=F.x0+i*F.cs;sz+=F.z0+j*F.cs;n++;}
 if(!n)return;f.cx=sx/n;f.cz=sz/n;f.rad=Math.sqrt(n*7*F.cs*F.cs/Math.PI);
 REGISTER({name:f.name+' ('+ageLabel(f.age)+')',x:f.cx,z:f.cz,y:terrainH(f.cx,f.cz)-15,r:f.rad*1.1,h:60,flow:f.fi});});
TUBE.sky.forEach(S=>REGISTER({name:'A skylight into the lava tube',x:S.x,z:S.z,y:terrainH(S.x,S.z)-4,r:S.r*1.3,h:S.d+12}));
HILLS.forEach(H=>REGISTER({name:'A kipuka (old forest the flows went round)',x:H.x,z:H.z,y:slopeH(H.x,H.z)-10,r:H.r,h:H.h+40}));

// ---------------------------------------------------------------- the ground
const TEX_GROUND=BIO.canvasTex(1536,1536,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const S=TERR.R*2.2;
 const c=new THREE.Color(),t=new THREE.Color(),K=hx=>new THREE.Color(hx);
 const LITTER=K(0x3e3a26),LITTER2=K(0x4e4630),LAT=K(0x8a4a30),LAT2=K(0x7a3e28),MOSS=K(0x4e6a2a),MOSS2=K(0x5e7a34),LAVA=K(0x1c1a1a),LAVA2=K(0x2a2828),YOUNG=K(0x34302c),BED=K(0x6a6050);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const wx=(x/w-.5)*S,wz=(y/h-.5)*S;
  const n=fbm(x/24,y/24,.3,2)-.5,n2=(BIO.fn.h3(x,y,3)-.5),pav=fbm(x/80+5,y/80-2,.7,2);
  const own=FC.at(FC.a.owned,wx,wz),bank=FC.at(FC.a.flow,wx,wz),sky=FC.at(FC.a.skylight,wx,wz);
  const age=FLOWS.ageAt(wx,wz),S4=THRONE.stages(age);
  // the old ground: the forest floor, dark litter over red earth
  c.copy(LITTER).lerp(LITTER2,clamp(.5+n*1.8,0,1)).lerp(LAT,smooth(.6,.8,pav)*.35);
  // mature flows: weathered to red laterite under moss and fern
  if(S4.mature>0){t.copy(LAT).lerp(LAT2,clamp(.5+n*2,0,1)).lerp(MOSS,smooth(.4,.7,pav)*.5);c.lerp(t,S4.mature*.9);}
  // young flows: dark rock going green
  if(S4.young>0){t.copy(YOUNG).lerp(MOSS,smooth(.35,.75,pav+n)*.6*smooth(15,140,age)).lerp(MOSS2,smooth(.7,.8,BIO.fn.h3(x>>1,y>>1,9))*.4);c.lerp(t,S4.young);}
  if(S4.fresh>0){t.copy(LAVA).lerp(LAVA2,clamp(.5+n*2.5+n2,0,1));c.lerp(t,S4.fresh);}
  c.lerp(BED,smooth(.5,.9,bank)*.5);c.lerp(MOSS,sky*.5);
  const k=1+n*.12+n2*.06;
  d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const TEX_DETAIL=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=232+(fbm(x/9,y/9,5,2)-.5)*40+(BIO.fn.h3(x,y,9)-.5)*26;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const TEX_MACRO=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,a=fbm(x/40,y/40,7.3,3),b=fbm(x/13,y/13,7.4,2);d[i]=a*255;d[i+1]=b*255;d[i+2]=128;d[i+3]=255;}g.putImageData(id,0,0);});
TEX_MACRO.wrapS=TEX_MACRO.wrapT=THREE.RepeatWrapping;TEX_MACRO.encoding=THREE.LinearEncoding;
const GROUNDU={uNight:{value:0}};
// THE LIBRARY GROUND (materials.json): the kipuka's leaf litter, the old flows' laterite, the young flows' moss, the lava,
// the skylights' glow carpet; laid in order, the later winning, each sampled twice (anti-tiling, as the plume's edge)
const GL_KEYS=['litter','laterite','wetmoss','lava','glowcarpet'];
const GLAY=(function(){if(typeof KMAT==='undefined'||KMAT.mode!=='lib')return null;const o={};
 for(const k of GL_KEYS){const P=KMAT.packed('throne','ground.'+k);if(!P)return null;o[k]={map:KMAT.textures(P,{aniso:8}).map,k:1/P.scale[0]};}return o;})();
const MAT_GROUND=new THREE.MeshLambertMaterial({map:TEX_GROUND,color:0xb0aaa4});
MAT_GROUND.onBeforeCompile=sh=>{sh.uniforms.uDetail={value:TEX_DETAIL};sh.uniforms.uNight=GROUNDU.uNight;
 if(GLAY){sh.uniforms.uMacro={value:TEX_MACRO};GL_KEYS.forEach(k=>sh.uniforms['uG_'+k]={value:GLAY[k].map});}
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;attribute vec4 aL0;attribute float aL1;varying vec4 vL0;varying float vL1;')
  .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vL0=aL0;vL1=aL1;');
 const W={litter:'vL0.x',laterite:'vL0.y',wetmoss:'vL0.z',lava:'vL0.w',glowcarpet:'vL1'};
 let decl='uniform sampler2D uDetail;uniform float uNight;varying vec3 vGWP;varying vec4 vL0;varying float vL1;',body,emit='';
 if(GLAY){decl+='uniform sampler2D uMacro,'+GL_KEYS.map(k=>'uG_'+k).join(',')+';'+THRONE.GLSL_LAY;   // stochastic tiling: the kit's (70)
  body='vec3 _E_glowcarpet=vec3(0.0);\n{vec2 p=vGWP.xz,q=mat2(0.799,-0.602,0.602,0.799)*p;float mt=smoothstep(0.3,0.7,texture2D(uMacro,p*0.0061).r);'+
   'vec3 dt=texture2D(uDetail,p*0.023+0.37).rgb;diffuseColor.rgb*=mix(vec3(1.0),dt*1.06,0.6);vec3 L;'+
   GL_KEYS.map(k=>'L=_lay(uG_'+k+',p,q,'+GLAY[k].k.toFixed(4)+',mt);diffuseColor.rgb=mix(diffuseColor.rgb,diffuse*L*1.25,'+W[k]+');'+(k==='glowcarpet'?'_E_glowcarpet=L;':'')).join('')+'}';
  emit='{totalEmissiveRadiance+=uNight*_E_glowcarpet*smoothstep(0.05,0.3,_E_glowcarpet.b-_E_glowcarpet.r)*'+W.glowcarpet+'*2.0;}';}
 else body='{vec3 dt=texture2D(uDetail,vGWP.xz*0.17).rgb;vec3 dt2=texture2D(uDetail,vGWP.xz*0.023+0.37).rgb;diffuseColor.rgb*=dt*dt2*1.12;}';
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+decl)
  .replace('#include <map_fragment>','#include <map_fragment>\n'+body).replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n'+emit);};
const GROUND=(function(){const N=560,S=TERR.R*2.2,cs=S/N,nx=N+1;
 const pos=new Float32Array(nx*nx*3),uv=new Float32Array(nx*nx*2),L0=new Float32Array(nx*nx*4),L1=new Float32Array(nx*nx);
 for(let j=0;j<nx;j++)for(let i=0;i<nx;i++){const k=j*nx+i,x=-S/2+i*cs,z=-S/2+j*cs,y=terrainH(x,z);pos[k*3]=x;pos[k*3+1]=y;pos[k*3+2]=z;uv[k*2]=x/S+.5;uv[k*2+1]=.5-z/S;
  const age=FLOWS.ageAt(x,z),S4=THRONE.stages(age),th=FLOWS.thickAt(x,z),onF=smooth(.4,2,th)*(1-smooth(1500,4000,age));
  const own=FC.at(FC.a.owned,x,z),bank=FC.at(FC.a.flow,x,z),sky=FC.at(FC.a.skylight,x,z),n1=fbm(x*.006+3,z*.006-4,8431,2);
  L0[k*4]=own*.9;L0[k*4+1]=Math.max(onF*S4.mature*.85,smooth(.4,.8,bank)*.5,own*smooth(.62,.75,n1)*.4);
  L0[k*4+2]=onF*(S4.young*smooth(10,120,age)*.85+S4.mature*smooth(.45,.65,n1)*.5);L0[k*4+3]=onF*(S4.fresh+S4.young*(1-smooth(20,140,age)*.7))*.9;L1[k]=smooth(.78,.97,sky)*.85;}
 const idx=new Uint32Array(N*N*6);let t=0;
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=j*nx+i,b=a+nx,c=b+1,d=a+1;idx[t++]=a;idx[t++]=b;idx[t++]=d;idx[t++]=b;idx[t++]=c;idx[t++]=d;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
 g.setAttribute('aL0',new THREE.BufferAttribute(L0,4));g.setAttribute('aL1',new THREE.BufferAttribute(L1,1));
 g.setIndex(new THREE.BufferAttribute(idx,1));g.computeVertexNormals();const m=new THREE.Mesh(g,MAT_GROUND);m.userData.probeSkip=true;m.userData.inspectLabel='The Throne\'s windward flank';scene.add(m);return m;})();

// ---------------------------------------------------------------- the streams' water
const MAT_WATER=new THREE.ShaderMaterial({fog:true,vertexColors:true,
 uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,{uT:{value:0},uSun:{value:new THREE.Vector3(...SUN_POS).normalize()},uSky:{value:new THREE.Color(0xd0d8d4)},uLight:{value:1}}]),
 vertexShader:['#include <fog_pars_vertex>','varying vec3 vWP;varying vec3 vCol;',
  'void main(){vCol=color;vec4 wp=modelMatrix*vec4(position,1.0);vWP=wp.xyz;vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n'),
 fragmentShader:['#include <fog_pars_fragment>','uniform float uT,uLight;uniform vec3 uSun,uSky;varying vec3 vWP;varying vec3 vCol;',
  'void main(){',
  ' vec3 n=normalize(vec3(0.05*sin(vWP.x*0.6+uT*3.1)+0.03*sin(vWP.z*0.9-uT*2.3),1.0,0.05*cos(vWP.z*0.5+uT*2.7)));',
  ' vec3 V=normalize(cameraPosition-vWP);float fr=pow(clamp(1.0-max(dot(n,V),0.0),0.0,1.0),3.0);',
  ' vec3 col=mix(vCol,uSky,0.1+fr*0.55);vec3 H=normalize(uSun+V);col+=pow(max(dot(n,H),0.0),90.0)*0.7*vec3(1.0,0.96,0.88);',
  ' gl_FragColor=vec4(col*uLight,1.0);','#include <fog_fragment>','}'].join('\n')});
MAT_WATER.uniforms.fogColor.value=scene.fog.color;MAT_WATER.uniforms.fogDensity.value=scene.fog.density;
MAT_WATER.side=THREE.DoubleSide;   // the ribbon's winding follows the stream's direction: either face may be up
TICKS.push(dt=>{MAT_WATER.uniforms.uT.value+=dt;});
STREAMS.forEach((S,si)=>{const pos=[],col=[],idx=[],c0=new THREE.Color(0x2e4a3e).convertSRGBToLinear(),c1=new THREE.Color(0x5a7a62).convertSRGBToLinear();let prev=-1;
 for(let s=-3200;s<=3200;s+=5){const p=streamPt(S,s);if(Math.abs(p[0])>TERR.R*1.08||Math.abs(p[1])>TERR.R*1.08||oldAt(p[0],p[1])<.99){prev=-1;continue;}
  const L=streamLevel(S,s),a=Math.atan2(DN[1],DN[0])+Math.PI/2,ox=PERP[0]*S.w*1.15,oz=PERP[1]*S.w*1.15,n=pos.length/3;
  pos.push(p[0]-ox,L,p[1]-oz,p[0]+ox,L,p[1]+oz);col.push(c1.r,c1.g,c1.b,c0.r,c0.g,c0.b);
  if(prev>=0)idx.push(prev,prev+1,n,prev+1,n+1,n);prev=n;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();
 const m=new THREE.Mesh(g,MAT_WATER);m.userData.probeSkip=true;m.userData.inspectLabel='A stream';m.renderOrder=1;scene.add(m);
 const mid=streamPt(S,0);REGISTER({name:'A stream through the kipuka',x:mid[0],z:mid[1],y:terrainH(mid[0],mid[1])-6,r:600,h:30});});

// ---------------------------------------------------------------- the mist (the siphon trees breathing out the tube's air)
const STEAMU={uT:{value:0},uScale:{value:innerHeight},uCol:{value:new THREE.Color(0xf2f4f2)}};
const STEAM_MAT=new THREE.ShaderMaterial({transparent:true,depthWrite:false,fog:true,uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,STEAMU]),
 vertexShader:['#include <fog_pars_vertex>','attribute vec4 aS;uniform float uT,uScale;varying float vA;',
  'void main(){float ph=fract(uT*aS.y+aS.x);vec3 p=position+vec3(sin(ph*6.0+aS.x*9.0)*aS.z*0.4+ph*aS.z*2.0,ph*aS.w,cos(ph*5.0+aS.x*7.0)*aS.z*0.4-ph*aS.z*.6);',
  ' vec4 mvPosition=modelViewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*mvPosition;gl_PointSize=uScale*aS.z*(0.6+ph*2.4)/max(1.0,-mvPosition.z);',
  ' vA=smoothstep(0.0,0.15,ph)*(1.0-ph)*0.4;','#include <fog_vertex>','}'].join('\n'),
 fragmentShader:['#include <fog_pars_fragment>','uniform vec3 uCol;varying float vA;',
  'void main(){vec2 q=gl_PointCoord-0.5;float r=length(q);if(r>0.5)discard;gl_FragColor=vec4(uCol,vA*smoothstep(0.5,0.1,r));','#include <fog_fragment>','}'].join('\n')});
STEAM_MAT.uniforms.fogColor.value=scene.fog.color;STEAM_MAT.uniforms.fogDensity.value=scene.fog.density;
['uT','uScale','uCol'].forEach(k=>STEAM_MAT.uniforms[k]=STEAMU[k]);
// called by the build (88) with the tops of the siphon trees: [x, y, z, radius]
function makeMist(tops){reseed(8411);const P=[],A=[];
 tops.forEach(t=>{for(let i=0;i<22;i++){P.push(t[0]+rr(-1,1)*t[3],t[1],t[2]+rr(-1,1)*t[3]);A.push(rng(),.05*rr(.8,1.2),t[3]*rr(1.5,2.6),rr(10,22));}});
 for(const S of TUBE.sky)for(let i=0;i<6;i++){P.push(S.x+rr(-1,1)*S.r*.5,terrainH(S.x,S.z)+1,S.z+rr(-1,1)*S.r*.5);A.push(rng(),.04*rr(.8,1.2),rr(3,5),rr(8,14));}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('aS',new THREE.Float32BufferAttribute(A,4));
 const pts=new THREE.Points(g,STEAM_MAT);pts.frustumCulled=false;pts.userData.probeSkip=true;pts.renderOrder=2;scene.add(pts);return P.length/3;}
TICKS.push(dt=>{STEAMU.uT.value+=dt;STEAMU.uScale.value=innerHeight*renderer.getPixelRatio()/(2*Math.tan(camera.fov*Math.PI/360));});
_onLight.push(m=>{MAT_WATER.uniforms.uLight.value=m==='night'?.18:1;GROUNDU.uNight.value=m==='night'?1:0;STEAMU.uCol.value.setHex(m==='night'?0x3a4048:0xf2f4f2);});
