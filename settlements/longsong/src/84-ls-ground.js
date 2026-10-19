// ================================================================= HOST — the ground, the stream and the pond
// Two meshes of the ground: 2 m over the 640 m round the monastery (the rock's faces, the pads, the ward's risers),
// 10 m out to the page's edge (a skirt hides the seam). Painted per vertex from the Oidong kit's zones outside the walls
// (its own painter's colours: biomes/oidong/src/84-host-ground.js) and from the plan inside them (the ward's gravel, the
// paved courts and the avenue, the gardens' soil), with the library's granite on the rock and flagstones on the paving.
const GROUND=(function(){
 const K=hx=>new THREE.Color(hx),c=new THREE.Color(),t=new THREE.Color();
 const LOAM=K(0x4e4a3a),MOSS=K(0x76964a),MOSS2=K(0x92b25a),MEAD=K(0x9cb070),MEAD2=K(0xb4c08a),SAND=K(0xeeeadf),SAND2=K(0xe2dccd),
  WET=K(0x5a7a4a),SAGE=K(0x98a882),OCHRE=K(0xb0a888),GRAN=K(0x8e8a82),GRAN2=K(0x66625c),LITTER=K(0xc0b888),
  GRAVEL=K(0xaaa08a),GRAVEL2=K(0x968c78),PAVE=K(0xb4aea2),SOIL=K(0x6e5e44),KORA=K(0xc2b8a0);
 const colourAt=(x,z,h,slope)=>{const n=fbm(x*.04,z*.04,.3,2)-.5,pav=fbm(x*.012+5,z*.012-2,.7,2),pav2=fbm(x*.025-3,z*.025+8,.9,2);
  const Zn=LS.zoneAt(x,z);let rock=0,pave=0;
  if(Zn.zone==='valley'||Zn.zone==='garden'||Zn.zone==='farm'){const Z=OIDONG.zones(x,z);
   c.copy(MEAD).lerp(MEAD2,smooth(.42,.62,pav)*.8).lerp(LITTER,smooth(.6,.72,pav2)*.3);
   t.copy(SAGE).lerp(OCHRE,smooth(.45,.7,pav2)*.7);c.lerp(t,smooth(.25,.6,Z.up)*.65);
   t.copy(MOSS).lerp(MOSS2,clamp(.5+n*2,0,1)*.6).lerp(LOAM,smooth(.5,.72,pav)*.5);c.lerp(t,clamp(Z.moss*1.4+Z.mistZ*1.2,0,1));
   c.lerp(LITTER,clamp(Z.bamboo*1.3,0,1)*.8);
   t.copy(SAND).lerp(SAND2,smooth(.4,.65,pav2)*.6);c.lerp(t,clamp(Z.flats*1.3,0,1));
   c.lerp(WET,clamp(Z.shore*1.2,0,1)*.6);c.lerp(WET,smooth(.4,.85,FIELD.flow(x,z))*.75);
   if(Zn.zone==='garden'||Zn.zone==='farm')c.lerp(SOIL,Zn.zone==='farm'?.7:.45);
   rock=smooth(.35,.7,FIELD.rock(x,z));
   // the track and the kora: beaten pale ground
   const td=LS.trackD(x,z);c.lerp(KORA,smooth(6,3,td)*.85);
   const kd=Math.abs(Math.hypot((x-LS.KORA.cx)/LS.KORA.a,(z-LS.KORA.cz)/LS.KORA.b)-1)*Math.min(LS.KORA.a,LS.KORA.b);
   if(!LS.inGrounds(x,z,-1))c.lerp(KORA,smooth(LS.KORA.w,LS.KORA.w-2,kd)*.8);}
  else if(Zn.zone==='rock'||Zn.zone==='top'){
   // the granite: grey, darker in its joints, green where it is gentle enough to hold soil (grass, moss, the kit's crag
   // pines); the top is meadow and terrace garden, paved only round the buildings (a pad's apron) and in the courts
   c.copy(GRAN).lerp(GRAN2,clamp(.4+n*1.6,0,1));rock=smooth(.35,.75,slope);
   t.copy(MOSS).lerp(MEAD,smooth(.4,.7,pav)).lerp(LOAM,smooth(.6,.8,pav2)*.3);c.lerp(t,(1-rock)*.85);c.lerp(MOSS,smooth(.55,.75,pav2)*.3*rock);
   if(Zn.zone==='top'){const P=padAt(x,z);if(P){c.lerp(PAVE,P.w);pave=P.w;rock*=1-P.w;}}}
  else{c.copy(GRAVEL).lerp(GRAVEL2,smooth(.4,.7,pav));
   if(Zn.zone==='square'||Zn.zone==='avenue'){c.copy(PAVE);pave=1;}
   if(Zn.zone==='raked'){c.copy(SAND);}}
  return {rock,pave};};
 const mat=new THREE.MeshLambertMaterial({vertexColors:true});
 const pk=n=>(typeof KMAT!=='undefined'&&KMAT.mode==='lib')?KMAT.packed('longsong',n):null;
 const RP=pk('rock'),PP=pk('paving'),RT=RP?KMAT.textures(RP,{aniso:8}).map:(OIDONG.ROCKTEX||null),PT=PP?KMAT.textures(PP,{aniso:8}).map:null;
 const DET=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=232+(fbm(x/9,y/9,5,2)-.5)*32+(BIO.fn.h3(x,y,9)-.5)*20;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
  g.putImageData(id,0,0);});
 DET.wrapS=DET.wrapT=THREE.RepeatWrapping;
 mat.onBeforeCompile=sh=>{sh.uniforms.uDet={value:DET};sh.uniforms.uRock={value:RT};sh.uniforms.uPave={value:PT};
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;attribute vec2 aRP;varying vec2 vRP;')
   .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vRP=aRP;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uDet;'+(RT?'uniform sampler2D uRock;':'')+(PT?'uniform sampler2D uPave;':'')+'varying vec3 vGWP;varying vec2 vRP;')
   .replace('#include <map_fragment>','#include <map_fragment>\n{vec3 dt=texture2D(uDet,vGWP.xz*0.165).rgb*texture2D(uDet,vGWP.xz*0.021+0.37).rgb*1.12;'+
    (RT?'vec3 rt=pow(texture2D(uRock,vGWP.xz*0.14+vGWP.y*0.05).rgb,vec3(2.2))*1.6;dt=mix(dt,rt,vRP.x*0.85);':'')+
    (PT?'vec3 pt=pow(texture2D(uPave,vGWP.xz/3.0).rgb,vec3(2.2))*1.45;dt=mix(dt,pt,vRP.y*0.8);':'')+
    'diffuseColor.rgb*=dt;}');};
 mat.customProgramCacheKey=()=>'ls-ground'+(RT?'r':'')+(PT?'p':'');
 // a square grid S wide, step st, centred on (0, cz); hole: leave out the cells within it of (0, 60) (the inner mesh's);
 // skirt: the edge's vertices dropped 2.5 m (hides the seam with the coarser mesh)
 const mesh=(S,st,cz,hole,skirt)=>{const n=Math.round(S/st)+1,x0=-S/2,z0=cz-S/2,pos=new Float32Array(n*n*3),col=new Float32Array(n*n*3),rp=new Float32Array(n*n*2);
  const H=new Float32Array(n*n);
  for(let j=0;j<n;j++)for(let i=0;i<n;i++)H[j*n+i]=terrainH(x0+i*st,z0+j*st);
  for(let j=0;j<n;j++)for(let i=0;i<n;i++){const k=j*n+i,x=x0+i*st,z=z0+j*st,y=H[k];
   const edge=skirt&&(i===0||j===0||i===n-1||j===n-1);pos[k*3]=x;pos[k*3+1]=y-(edge?2.5:0);pos[k*3+2]=z;
   const hx=H[j*n+Math.min(n-1,i+1)]-H[j*n+Math.max(0,i-1)],hz=H[Math.min(n-1,j+1)*n+i]-H[Math.max(0,j-1)*n+i],slope=clamp(Math.hypot(hx,hz)/(2*st)*1.6,0,1);
   const r=colourAt(x,z,y,slope);c.convertSRGBToLinear();col[k*3]=c.r;col[k*3+1]=c.g;col[k*3+2]=c.b;rp[k*2]=r.rock;rp[k*2+1]=r.pave;}
  const idx=[];
  for(let j=0;j<n-1;j++)for(let i=0;i<n-1;i++){const x=x0+(i+.5)*st,z=z0+(j+.5)*st;if(hole&&Math.abs(x)<hole&&Math.abs(z-60)<hole)continue;
   const a=j*n+i,b=a+n,cc=b+1,d=a+1;idx.push(a,b,d,b,cc,d);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));
  g.setAttribute('aRP',new THREE.BufferAttribute(rp,2));g.setIndex(idx);g.computeVertexNormals();
  const m=new THREE.Mesh(g,mat);m.userData.probeSkip=true;m.userData.ground=true;m.userData.inspectLabel='The ground';scene.add(m);return m;};
 // the inner mesh holds the rock whole (centred 60 m south of the origin); the outer leaves a hole a little smaller
 const inner=mesh(640,2,60,0,true);
 const outer=mesh(TERR.R*2,10,0,318,false);
 return {inner,outer,mat};})();
_mark('ground');

// ---------------------------------------------------------------- the water: the Longsong stream and the lotus pond
// The stream is a ribbon down the model's river line at its water's height (WORLD.riverLines), with a slow current
// drawn in the shader; the pond is mirror-still, as the valley's pools are.
const MAT_WATER=new THREE.ShaderMaterial({fog:true,vertexColors:true,
 uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,{uT:{value:0},uSun:{value:new THREE.Vector3(...SUN_POS).normalize()},uSky:{value:new THREE.Color(0xd4dcea)}}]),
 vertexShader:['#include <fog_pars_vertex>','attribute float aFlow;varying float vFlow;varying vec3 vWP;varying vec3 vCol;',
  'void main(){vCol=color;vFlow=aFlow;vec4 wp=modelMatrix*vec4(position,1.0);vWP=wp.xyz;vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n'),
 fragmentShader:['#include <fog_pars_fragment>','uniform float uT;uniform vec3 uSun,uSky;varying float vFlow;varying vec3 vWP;varying vec3 vCol;',
  'void main(){float f=vFlow;',
  ' vec3 n=normalize(vec3(0.012*sin(vWP.x*0.31+uT*0.6)+f*0.05*sin(vWP.x*0.9-uT*2.4+vWP.z*0.4),1.0,0.012*cos(vWP.z*0.27+uT*0.5)+f*0.05*cos(vWP.z*1.1+uT*1.7)));',
  ' vec3 V=normalize(cameraPosition-vWP);float fr=pow(clamp(1.0-max(dot(n,V),0.0),0.0,1.0),2.6);',
  ' vec3 col=mix(vCol,uSky,0.18+fr*0.7);vec3 H=normalize(uSun+V);col+=pow(max(dot(n,H),0.0),220.0)*0.6*vec3(1.0,0.98,0.95);',
  ' gl_FragColor=vec4(col,1.0);','#include <fog_fragment>','}'].join('\n')});
MAT_WATER.uniforms.fogColor.value=scene.fog.color;MAT_WATER.uniforms.fogDensity.value=scene.fog.density;
TICKS.push(dt=>{MAT_WATER.uniforms.uT.value+=dt;});
const WATER=(function(){const out=[],c0=new THREE.Color(0x3a5a52).convertSRGBToLinear(),c1=new THREE.Color(0x6a8a7a).convertSRGBToLinear();
 STREAM.forEach(R=>{const P=R.pts,pos=[],col=[],fl=[],idx=[],hw=R.width/2+3;
  for(let i=0;i<P.length;i++){const a=P[Math.max(0,i-1)],b=P[Math.min(P.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz)||1,nx=-dz/L,nz=dx/L;
   for(const s of [-1,0,1]){pos.push(P[i][0]+nx*hw*s,P[i][2]+.05,P[i][1]+nz*hw*s);const cc=s===0?c0:c1;col.push(cc.r,cc.g,cc.b);fl.push(s===0?1:.4);}
   if(i>0){const o=(i-1)*3;idx.push(o,o+3,o+1,o+1,o+3,o+4,o+1,o+4,o+2,o+2,o+4,o+5);}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
  g.setAttribute('aFlow',new THREE.Float32BufferAttribute(fl,1));g.setIndex(idx);g.computeVertexNormals();
  const m=new THREE.Mesh(g,MAT_WATER);m.material.side=THREE.DoubleSide;m.userData.probeSkip=true;m.userData.inspectLabel=R.name+' (the Longsong stream)';m.renderOrder=1;scene.add(m);out.push(m);});
 // the pond
 {const P=LS.POND,PN=56,pos=[P.x,P.y,P.z],col=[c0.r,c0.g,c0.b],fl=[0],idx=[];
  for(let k=0;k<=PN;k++){const a=k/PN*TAU;pos.push(P.x+Math.cos(a)*(P.r+3),P.y,P.z+Math.sin(a)*(P.r+3));col.push(c1.r,c1.g,c1.b);fl.push(0);}for(let k=0;k<PN;k++)idx.push(0,k+2,k+1);
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setAttribute('aFlow',new THREE.Float32BufferAttribute(fl,1));g.setIndex(idx);
  const m=new THREE.Mesh(g,MAT_WATER);m.userData.probeSkip=true;m.userData.inspectLabel=P.name;m.renderOrder=1;scene.add(m);out.push(m);}
 return out;})();
REGISTER({name:LS.POND.name,cls:'feature',kind:'pond',key:'longsong_pond',x:LS.POND.x,z:LS.POND.z,y:LS.POND.y-4,r:LS.POND.r+2,h:10});
REGISTER({name:'The Longsong stream (Lõsõ-bi Siṭrīm, the scale model\'s r105)',cls:'feature',kind:'river',key:'longsong_stream',x:0,z:BRIDGE.z,y:BRIDGE.water-4,r:60,h:12});
FANS.forEach((F,i)=>REGISTER({name:'A gravel fan the stream left (raked by the wind)',cls:'feature',kind:'flats',key:'longsong_fan_'+i,x:F.x,z:F.z,y:terrainH(F.x,F.z)-4,r:F.rx,h:14}));
