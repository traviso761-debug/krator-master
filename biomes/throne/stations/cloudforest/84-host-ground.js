// ================================================================= HOST — the ground, the falls, the streams (the cloud forest)
// Two ground meshes painted from the layout and the fields: the flank (9.5 m) and, sewn into a hole in it, THE RAVINE OF
// THE FALLS' patch (1.9 m: its walls stand near upright and its pools are metres across). The patch's border vertices take
// the coarse mesh's own heights along each edge, so the seam has no cracks. The library's layers over both
// (materials.json): the woods' litter with moss through it, the moss carpet, moss over rock, the ravines' wet walls, their
// gravel beds, the ridge's lichened crags, the trail's packed earth, the lee's heath; far off, the canopy over the woods.
// Then the falls (a curtain at each step, following the wall where it leans out under the lip) and the streams.
RAVINES.forEach(V=>{const x0=-2300,x1=2100,m=ravC(V,0);REGISTER({name:V.name,x:0,z:m,y:flankH(0,m)-80,r:2300,h:200,ravine:V.key});});
REGISTER({name:'The ridge (an old rift ridge; the cloud pours over its crest)',x:0,z:RIDGE.zc(0),y:flankH(0,RIDGE.zc(0))-40,r:2500,h:260,ridge:true});

// ---------------------------------------------------------------- the paint (shared by both meshes)
const K=hx=>new THREE.Color(hx);
const PAINT={LITTER:K(0x3a3626),LITTER2:K(0x4a4630),MOSS:K(0x4a6a2a),MOSS2:K(0x5a7a32),ROCK:K(0x4a4844),WET:K(0x2e302c),LICH:K(0x8a8a6a),BED:K(0x5a5850),PACK:K(0x7a6a4c),HEATH:K(0x6a6a44),HEATH2:K(0x7a6a4a)};
function paintAt(c,x,z,at,n,n2,pav){
 c.copy(PAINT.LITTER).lerp(PAINT.LITTER2,clamp(.5+n*1.8,0,1)).lerp(PAINT.MOSS,smooth(.35,.7,pav)*.6);
 c.lerp(PAINT.MOSS2,at('flow')*.4);
 const ld=at('lee');if(ld>0){const t=new THREE.Color().copy(PAINT.HEATH).lerp(PAINT.HEATH2,clamp(.5+n*2,0,1));c.lerp(t,ld*.9);}
 const rk=at('rock');if(rk>0){const t=new THREE.Color().copy(PAINT.ROCK).lerp(PAINT.LICH,smooth(.4,.7,pav)*.5*ld).lerp(PAINT.WET,(1-ld)*.6);c.lerp(t,rk*.85);}
 c.lerp(PAINT.BED,at('flow')*smooth(.5,.9,at('flow'))*.5);c.lerp(PAINT.PACK,at('path'));
 return c;}
const paintTex=(W,H,x0,z0,SX,SZ,at)=>BIO.canvasTex(W,H,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const c=new THREE.Color();
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const wx=x0+(x/w)*SX,wz=z0+(y/h)*SZ;
  const n=fbm(wx*.04,wz*.04,.3,2)-.5,n2=(BIO.fn.h3(x,y,3)-.5),pav=fbm(wx*.012+5,wz*.012-2,.7,2);
  paintAt(c,wx,wz,k=>at(k,wx,wz),n,n2,pav);const k=1+n*.12+n2*.06;
  d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const atFC=(k,x,z)=>FC.at(FC.a[k],x,z);
const TEX_DETAIL=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=232+(fbm(x/9,y/9,5,2)-.5)*40+(BIO.fn.h3(x,y,9)-.5)*26;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const TEX_MACRO=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,a=fbm(x/40,y/40,7.3,3),b=fbm(x/13,y/13,7.4,2);d[i]=a*255;d[i+1]=b*255;d[i+2]=128;d[i+3]=255;}g.putImageData(id,0,0);});
TEX_MACRO.wrapS=TEX_MACRO.wrapT=THREE.RepeatWrapping;TEX_MACRO.encoding=THREE.LinearEncoding;
const GROUNDU={uNight:{value:0}};
// THE LIBRARY GROUND: eight layers, the later winning, each sampled twice (anti-tiling, as the other stations)
const GL_KEYS=['litter','wetmoss','moss3','rockwet','gravel','lichenrock','packed','shoulder'];
const GLAY=(function(){if(typeof KMAT==='undefined'||KMAT.mode!=='lib')return null;const o={};
 for(const k of GL_KEYS.concat(['canopy'])){const P=KMAT.packed('throne','ground.'+k);if(!P)return null;o[k]={map:KMAT.textures(P,{aniso:8}).map,k:1/P.scale[0]};}return o;})();
function groundMat(map){const m=new THREE.MeshLambertMaterial({map,color:0xb0aaa4});
 m.onBeforeCompile=sh=>{sh.uniforms.uDetail={value:TEX_DETAIL};
  if(GLAY){sh.uniforms.uMacro={value:TEX_MACRO};GL_KEYS.concat(['canopy']).forEach(k=>sh.uniforms['uG_'+k]={value:GLAY[k].map});}
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;attribute vec4 aL0,aL1;varying vec4 vL0,vL1;')
   .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vL0=aL0;vL1=aL1;');
  const W={litter:'vL0.x',wetmoss:'vL0.y',moss3:'vL0.z',rockwet:'vL0.w',gravel:'vL1.x',lichenrock:'vL1.y',packed:'vL1.z',shoulder:'vL1.w'};
  let decl='uniform sampler2D uDetail;varying vec3 vGWP;varying vec4 vL0,vL1;',body;
  if(GLAY){decl+='uniform sampler2D uMacro,'+GL_KEYS.concat(['canopy']).map(k=>'uG_'+k).join(',')+';vec3 _lay(sampler2D t,vec2 p,vec2 q,float k,float mt){return pow(mix(texture2D(t,p*k).rgb,texture2D(t,q*k*0.47+vec2(0.31,0.17)).rgb,mt),vec3(2.2));}';
   body='{vec2 p=vGWP.xz,q=mat2(0.799,-0.602,0.602,0.799)*p;float mt=smoothstep(0.3,0.7,texture2D(uMacro,p*0.0061).r);'+
    'vec3 dt=texture2D(uDetail,p*0.023+0.37).rgb;diffuseColor.rgb*=mix(vec3(1.0),dt*1.06,0.6);vec3 L;'+
    GL_KEYS.map(k=>'L=_lay(uG_'+k+',p,q,'+GLAY[k].k.toFixed(4)+',mt);diffuseColor.rgb=mix(diffuseColor.rgb,diffuse*L*1.25,'+W[k]+');').join('')+
    // far off, the woods' floor reads as the canopy over it (the elfin trees have no far impostors)
    'L=_lay(uG_canopy,p,q,'+GLAY.canopy.k.toFixed(4)+',mt);diffuseColor.rgb=mix(diffuseColor.rgb,diffuse*L*1.1,vL0.x*smoothstep(300.0,700.0,length(cameraPosition-vGWP))*0.92);'+'}';}
  else body='{vec3 dt=texture2D(uDetail,vGWP.xz*0.17).rgb;vec3 dt2=texture2D(uDetail,vGWP.xz*0.023+0.37).rgb;diffuseColor.rgb*=dt*dt2*1.12;}';
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+decl).replace('#include <map_fragment>','#include <map_fragment>\n'+body);};
 return m;}
// a vertex's layer weights
function layersAt(x,z,h,at,L0,L1,k,slope){const fl=at('flow'),rk=Math.max(at('rock'),slope==null?0:smooth(.7,.95,slope)),ld=at('lee'),cf=at('cforest');
 L0[k*4]=cf*.9;L0[k*4+1]=clamp(cf*.45*smooth(.4,.7,fbm(x*.01,z*.01,4801,2))+fl*.5,0,1);L0[k*4+2]=rk*(1-ld)*.35;L0[k*4+3]=rk*(1-ld)*.8;
 L1[k*4]=fl*smooth(.55,.9,fl)*.85;L1[k*4+1]=rk*ld*.85;L1[k*4+2]=at('path');L1[k*4+3]=ld*(1-rk)*.85;}

// ---------------------------------------------------------------- the flank's mesh, with a hole for the ravine's patch
const GN=600,GS=TERR.R*2.2,GCS=GS/GN,GNX=GN+1,GX0=-GS/2;
const PATCH=(function(){const V=RAVINES.find(r=>r.steps),xa=-1450,xb=1700;let za=1e9,zb=-1e9;for(let x=xa;x<=xb;x+=20){za=Math.min(za,ravC(V,x));zb=Math.max(zb,ravC(V,x));}
 const i0=Math.floor((xa-GX0)/GCS),i1=Math.ceil((xb-GX0)/GCS),j0=Math.floor((za-70-GX0)/GCS),j1=Math.ceil((zb+70-GX0)/GCS);
 return{i0,i1,j0,j1,sub:5,x0:GX0+i0*GCS,z0:GX0+j0*GCS,sx:(i1-i0)*GCS,sz:(j1-j0)*GCS};})();
const GH=new Float32Array(GNX*GNX);
const TEX_GROUND=paintTex(1536,1536,GX0,GX0,GS,GS,atFC);
const GROUND=(function(){const pos=new Float32Array(GNX*GNX*3),uv=new Float32Array(GNX*GNX*2),L0=new Float32Array(GNX*GNX*4),L1=new Float32Array(GNX*GNX*4);
 for(let j=0;j<GNX;j++)for(let i=0;i<GNX;i++){const k=j*GNX+i,x=GX0+i*GCS,z=GX0+j*GCS,y=terrainH(x,z);GH[k]=y;pos[k*3]=x;pos[k*3+1]=y;pos[k*3+2]=z;uv[k*2]=x/GS+.5;uv[k*2+1]=.5-z/GS;
  layersAt(x,z,y,(n,a,b)=>atFC(n,x,z),L0,L1,k);}
 const idx=[];for(let j=0;j<GN;j++)for(let i=0;i<GN;i++){if(i>=PATCH.i0&&i<PATCH.i1&&j>=PATCH.j0&&j<PATCH.j1)continue;const a=j*GNX+i,b=a+GNX,c=b+1,d=a+1;idx.push(a,b,d,b,c,d);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
 g.setAttribute('aL0',new THREE.BufferAttribute(L0,4));g.setAttribute('aL1',new THREE.BufferAttribute(L1,4));
 g.setIndex(idx);g.computeVertexNormals();const m=new THREE.Mesh(g,groundMat(TEX_GROUND));m.userData.probeSkip=true;m.userData.inspectLabel='The Throne\'s west flank in the cloud belt';scene.add(m);return m;})();
_mark('ground');
const TEX_PATCH=paintTex(2048,Math.max(64,Math.round(2048*PATCH.sz/PATCH.sx*4)),PATCH.x0,PATCH.z0,PATCH.sx,PATCH.sz,atFC);
const GROUND_PATCH=(function(){const P=PATCH,nx=(P.i1-P.i0)*P.sub+1,nz=(P.j1-P.j0)*P.sub+1,cs=GCS/P.sub;
 const pos=new Float32Array(nx*nz*3),uv=new Float32Array(nx*nz*2),L0=new Float32Array(nx*nz*4),L1=new Float32Array(nx*nz*4),Hs=new Float32Array(nx*nz);
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=j*nx+i,x=P.x0+i*cs,z=P.z0+j*cs;let y;
  const bi=i===0||i===nx-1,bj=j===0||j===nz-1;
  if(bi||bj){const gi=P.i0+i/P.sub,gj=P.j0+j/P.sub,i0=Math.floor(gi),j0=Math.floor(gj),fi=gi-i0,fj=gj-j0;
   const H=(a,b)=>GH[Math.min(GN,b)*GNX+Math.min(GN,a)];y=bi&&bj?H(i0,j0):bi?mix(H(i0,j0),H(i0,j0+1),fj):mix(H(i0,j0),H(i0+1,j0),fi);}
  else y=terrainH(x,z);Hs[k]=y;pos[k*3]=x;pos[k*3+1]=y;pos[k*3+2]=z;uv[k*2]=(x-P.x0)/P.sx;uv[k*2+1]=1-(z-P.z0)/P.sz;}
 // the patch's own slope (its walls are finer than the field cache): the wet rock where it stands steep
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=j*nx+i,x=P.x0+i*cs,z=P.z0+j*cs,hx=Hs[j*nx+Math.min(nx-1,i+1)]-Hs[j*nx+Math.max(0,i-1)],hz=Hs[Math.min(nz-1,j+1)*nx+i]-Hs[Math.max(0,j-1)*nx+i];
  layersAt(x,z,Hs[k],(n)=>atFC(n,x,z),L0,L1,k,clamp(Math.hypot(hx,hz)/(2*cs),0,1));}
 const idx=new Uint32Array((nx-1)*(nz-1)*6);let t=0;
 for(let j=0;j<nz-1;j++)for(let i=0;i<nx-1;i++){const a=j*nx+i,b=a+nx,c=b+1,d=a+1;idx[t++]=a;idx[t++]=b;idx[t++]=d;idx[t++]=b;idx[t++]=c;idx[t++]=d;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
 g.setAttribute('aL0',new THREE.BufferAttribute(L0,4));g.setAttribute('aL1',new THREE.BufferAttribute(L1,4));
 g.setIndex(new THREE.BufferAttribute(idx,1));g.computeVertexNormals();const m=new THREE.Mesh(g,groundMat(TEX_PATCH));m.userData.probeSkip=true;m.userData.inspectLabel='The ravine of the falls';scene.add(m);return m;})();
_mark('patch');

// ---------------------------------------------------------------- THE FALLS: a curtain at each step of the ravine
// From the lip (just above the step) the water is thrown out and falls, but never inside the wall: where the wall leans out
// under it, the water slides down the wall. Streaked, running on the clock; spray at each foot (85)
const FALLU={uT:{value:0},uLight:{value:1}};
const FALL_MAT=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,fog:true,uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,FALLU]),
 vertexShader:['#include <fog_pars_vertex>','attribute vec2 aF;varying vec2 vF;','void main(){vF=aF;vec4 mvPosition=modelViewMatrix*vec4(position,1.0);gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n'),
 fragmentShader:['#include <fog_pars_fragment>','uniform float uT,uLight;varying vec2 vF;',
  'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
  'float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}',
  'void main(){float s=vF.x,t=vF.y;float streak=n(vec2(s*14.0,t*5.0-uT*2.6))*0.6+n(vec2(s*31.0,t*11.0-uT*4.1))*0.4;',
  ' float edge=smoothstep(0.0,0.18,s)*smoothstep(1.0,0.82,s);float a=edge*(0.35+0.55*smoothstep(0.35,0.75,streak))*(0.75+0.25*t);',
  ' vec3 c=mix(vec3(0.62,0.72,0.74),vec3(0.96,0.98,1.0),smoothstep(0.4,0.8,streak));gl_FragColor=vec4(c*uLight,a);','#include <fog_fragment>','}'].join('\n')});
['uT','uLight'].forEach(k=>FALL_MAT.uniforms[k]=FALLU[k]);FALL_MAT.uniforms.fogColor.value=scene.fog.color;FALL_MAT.uniforms.fogDensity.value=scene.fog.density;
const FALLS=[];
RAVINES.forEach(V=>(V.steps||[]).forEach((S,si)=>{const dx=-1,dz=0,lx=S.x+1.6,lz=ravC(V,lx),y=terrainH0(lx,lz)+.3,P=POOLS.find(p=>p.key===V.key+'_pool'+si),base=P?P.level:terrainH0(S.x-10,ravC(V,S.x-10)),drop=y-base;
 if(drop<4)return;const w=V.w*.7,nw=8,nr=36,pos=[],aF=[],idx=[],px=0,pz=1;
 for(let r=0;r<=nr;r++){const t=r/nr,dr=drop*t*t,yy=y-dr,ww=w*(1+.4*t);
  let o=2.0*Math.sqrt(2*Math.max(0,dr)/9.8)+.2;for(let s=0;s<40;s+=.4){if(terrainH0(lx+dx*s,lz+dz*s)<yy-.2){o=Math.max(o,s+.4);break;}}
  for(let c=0;c<=nw;c++){const s=(c/nw-.5)*ww;pos.push(lx+dx*o+px*s,yy,lz+dz*o+pz*s);aF.push(c/nw,t*t);}}
 for(let r=0;r<nr;r++)for(let c=0;c<nw;c++){const a=r*(nw+1)+c,b=a+nw+1;idx.push(a,b,a+1,b,b+1,a+1);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('aF',new THREE.Float32BufferAttribute(aF,2));g.setIndex(idx);
 const name='Fall '+(si+1)+' of the ravine ('+Math.round(drop)+' m)',m=new THREE.Mesh(g,FALL_MAT);m.userData.inspectLabel=name;m.renderOrder=2;scene.add(m);
 const F={key:V.key+'_fall'+si,name,x:lx,z:lz,y,drop,dx,dz,w,foot:[lx+dx*Math.max(4,drop*.25),base,lz]};FALLS.push(F);
 REGISTER({name,x:lx-drop*.15,z:lz,y:base-2,r:Math.max(10,drop*.4),h:drop+4,fall:F.key});}));
TICKS.push(dt=>{FALLU.uT.value+=dt;});

// ---------------------------------------------------------------- the streams (on the ravines' floors) and the pools
const STREAM_MAT=new THREE.MeshLambertMaterial({color:0x5a6e68,transparent:true,opacity:.82,side:THREE.DoubleSide});
RAVINES.forEach(V=>{const pos=[],idx=[];let prev=-1;
 for(let x=2120;x>=-2700;x-=4){const c=ravC(V,x);if(Math.abs(c)>TERR.R*1.08||x<-TERR.R*1.08){prev=-1;continue;}
  // the stream breaks at each fall (the curtain carries it down)
  if(V.steps&&V.steps.some(S=>x<S.x+2&&x>S.x-6)){prev=-1;continue;}
  const L=terrainH0(x,c)+.3,w=V.w*.42+.8*Math.sin(x*.05),n=pos.length/3;pos.push(x,L,c-w,x,L,c+w);if(prev>=0)idx.push(prev,prev+1,n,prev+1,n+1,n);prev=n;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
 const m=new THREE.Mesh(g,STREAM_MAT);m.userData.probeSkip=true;m.userData.inspectLabel=V.name+' (its stream)';m.renderOrder=1;scene.add(m);});
POOLS.forEach(P=>{const g=new THREE.CircleGeometry(P.r,28).rotateX(-Math.PI/2);g.translate(P.x,P.level,P.z);
 const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({color:0x3e5650,transparent:true,opacity:.88}));m.userData.inspectLabel=P.name;m.renderOrder=1;scene.add(m);P.mesh=m;
 REGISTER({name:P.name,x:P.x,z:P.z,y:P.level-4,r:P.r,h:8,pool:P.key});});
_onLight.push(m=>{FALLU.uLight.value=m==='night'?.2:1;STREAM_MAT.color.setHex(m==='night'?0x101818:0x5a6e68);POOLS.forEach(P=>P.mesh.material.color.setHex(m==='night'?0x0e1414:0x3e5650));GROUNDU.uNight.value=m==='night'?1:0;});
