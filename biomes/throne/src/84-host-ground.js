// ================================================================= HOST — the ground, the water, the steam
// One ground mesh painted by the kit's flow mosaic (46) and the fields (47), so the ages of the lava read from any
// distance: the new flow glassy black, the young ones dark grey flecked with lichen (or the mat under the plume), the
// old ones brown with soil in their cracks; the shield's old ground red-brown and straw on the shoulder, ash-grey
// under the plume; the cones' red-black cinder, sulphur yellow at the vents, white crust at the acid shores. At night
// the mycelium in the plume's ash glows faintly gold (THRONE's own life). Then the acid lake and the hot pools, and the
// steam of the fumaroles.
FLOWS.flows.forEach(f=>{let sx=0,sz=0,n=0;const F=FLOWS;
 for(let k=0;k<F.id.length;k+=7){if(F.id[k]!==f.fi)continue;const i=k%F.N,j=(k-i)/F.N;sx+=F.x0+i*F.cs;sz+=F.z0+j*F.cs;n++;}
 if(!n)return;f.cx=sx/n;f.cz=sz/n;f.rad=Math.sqrt(n*7*F.cs*F.cs/Math.PI);
 REGISTER({name:f.name+' ('+ageLabel(f.age)+')',x:f.cx,z:f.cz,y:terrainH(f.cx,f.cz)-15,r:f.rad*1.1,h:60,flow:f.fi});});
CONES.forEach(C=>REGISTER({name:C.name,x:C.x,z:C.z,y:slopeH(C.x,C.z)-10,r:C.r*1.05,h:C.h+40}));
REGISTER({name:'The pit crater and its acid lake',x:PIT.x,z:PIT.z,y:PIT.floor-5,r:PIT.r*1.1,h:PIT.depth+40});
{const p=riftPt((FISS.t0+FISS.t1)/2,FISS.l);REGISTER({name:'The fissure',x:p[0],z:p[1],y:terrainH(p[0],p[1])-8,r:(FISS.t1-FISS.t0)/2,h:30});}
POOLS.forEach((P,i)=>REGISTER({name:'A hot pool',x:P.x,z:P.z,y:POOLL[i]-4,r:P.r*2,h:14}));
TUBE.sky.forEach(S=>REGISTER({name:'A skylight into the lava tube',x:S.x,z:S.z,y:terrainH(S.x,S.z)-4,r:S.r*1.3,h:S.d+12}));

// ---------------------------------------------------------------- the ground
const TEX_GROUND=BIO.canvasTex(1536,1536,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const S=TERR.R*2.2;
 const c=new THREE.Color(),t=new THREE.Color(),K=hx=>new THREE.Color(hx);
 const SOIL=K(0x7a5a44),SOIL2=K(0x6a4c3a),STRAW=K(0xa89868),OLIVE=K(0x666a42),ASH=K(0x8c8884),ASH2=K(0x76726e),ASHD=K(0x4e4a48),
  LAVA=K(0x1c1a1a),LAVA2=K(0x2c2a2a),YOUNG=K(0x34302e),YOUNG2=K(0x423c38),OLDF=K(0x4e443c),
  CIN=K(0x5a2a20),CIN2=K(0x7a3a26),CINK=K(0x2a2222),SUL=K(0xd8c040),SULW=K(0xe8e4d4),LIME=K(0x9ad030),GULLY=K(0x54463a),LICH=K(0xc8904a),MAT=K(0x8a2a5a);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const wx=(x/w-.5)*S,wz=(y/h-.5)*S;
  const n=fbm(x/24,y/24,.3,2)-.5,n2=(BIO.fn.h3(x,y,3)-.5),pav=fbm(x/80+5,y/80-2,.7,2);
  const pl=FC.at(FC.a.plume,wx,wz),vent=FC.at(FC.a.vent,wx,wz),acid=FC.at(FC.a.acid,wx,wz),cin=FC.at(FC.a.cinder,wx,wz),gul=FC.at(FC.a.flow,wx,wz),slope=FC.at(FC.a.slope,wx,wz);
  const age=FLOWS.ageAt(wx,wz),S4=THRONE.stages(age),al=smooth(.25,.78,pl);
  // the shield's old ground: red-brown ash soil, straw and olive on the shoulder; grey ash under the plume
  c.copy(SOIL).lerp(SOIL2,clamp(.5+n*1.8,0,1));t.copy(STRAW).lerp(OLIVE,smooth(.42,.62,pav));c.lerp(t,.45+.3*n);
  t.copy(ASH).lerp(ASH2,clamp(.5+n*2,0,1)).lerp(ASHD,smooth(.6,.8,pav)*.4);c.lerp(t,al*.92);
  // the flows by age: old ones brown with soil in the cracks (ash on the lee), young dark, the new one black
  // any flow, however old, still shows as a sheet of darker rock with soil only in its cracks: the mosaic reads from afar
  const thk=FLOWS.thickAt(wx,wz),onF=smooth(.4,2,thk)*(1-smooth(2500,7000,age));
  if(onF>0){t.copy(OLDF).lerp(LAVA2,smooth(.55,.7,fbm(x/7,y/7,.9,2))*.6).lerp(c,.35+.25*n);c.lerp(t,onF*.7);}
  if(S4.mature>0){t.copy(OLDF).lerp(c,.45+.3*n);c.lerp(t,S4.mature*.8);}
  if(S4.young>0){t.copy(YOUNG).lerp(YOUNG2,clamp(.5+n*2,0,1));
   if(BIO.fn.h3(x>>1,y>>1,9)<.12)t.lerp(al>.5?MAT:LICH,.5);t.lerp(ASH,al*.3);c.lerp(t,S4.young);}
  if(S4.fresh>0){t.copy(LAVA).lerp(LAVA2,clamp(.5+n*2.5+n2,0,1));t.lerp(ASH2,al*.12);c.lerp(t,S4.fresh);}
  // the cones' cinder: red and black scoria, redder where it oxidised near the old vents
  t.copy(CIN).lerp(CIN2,clamp(.5+n*2,0,1)).lerp(CINK,smooth(.55,.75,pav+n2*.3)*.6);c.lerp(t,smooth(.3,.7,cin)*.9);
  // the gullies' damper floor
  c.lerp(GULLY,smooth(.35,.75,gul)*.5);
  // sulphur at the vents, white crust and an acid lime film at the acid shores
  t.copy(SUL).lerp(SULW,smooth(.5,.8,n2+.5)*.4);c.lerp(t,smooth(.5,.9,vent+n*.4)*.75);
  t.copy(SULW).lerp(LIME,smooth(.55,.85,acid+n*.5)*.5);c.lerp(t,smooth(.3,.8,acid)*.8);
  const k=1+n*.12+n2*.06-.12*smooth(.5,.9,slope);
  d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const TEX_DETAIL=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=232+(fbm(x/9,y/9,5,2)-.5)*40+(BIO.fn.h3(x,y,9)-.5)*26;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
// the MYCELIUM's veins (ref 7 of the owner's textures, "glowing mycelium on volcanic ash"): a tiled vein map the ground
// shader lights at night where the plume's ground is (aGlow)
const TEX_VEIN=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,a=1-Math.abs(fbm(x/22,y/22,6.1,3)*2-1),b=1-Math.abs(fbm(x/9+3,y/9,6.2,2)*2-1),v=Math.max(smooth(.955,.99,a),smooth(.965,.995,b)*.5);
  d[i]=d[i+1]=d[i+2]=v*255;d[i+3]=255;}g.putImageData(id,0,0);});
TEX_VEIN.wrapS=TEX_VEIN.wrapT=THREE.RepeatWrapping;TEX_VEIN.encoding=THREE.LinearEncoding;
const GROUNDU={uNight:{value:0}};
// THE LIBRARY GROUND (materials.json ground.*; the owner's textures of 2026-10-06): up to eleven layers over the painted
// ground, each a cover weight per vertex, laid in order so the later win: the shoulder's sparse grass, the seam's ember
// grass, the plume's ash gravel, its deep rippled ash and its mycelium; the flows' lava, the new flow's glowing veins;
// the cones' scoria; the glow carpet in the skylights and the plume's gullies; sulphur at the vents, tufa at the acid
// shores. ANTI-TILING: each layer is sampled twice, on its own tile and on a larger one turned 37 degrees, blended by a
// macro noise. At night the veins, the glow carpet and the mycelium light by their own colours. Without the pack
// (?mat=proc, or an open world) the ground is exactly the painted one, with the procedural mycelium veins.
const GL_KEYS=['shoulder','ember','ash','ripples','mycelium','lava','veins','scoria','glowcarpet','sulphur','tufa'];
const GLAY=(function(){if(typeof KMAT==='undefined'||KMAT.mode!=='lib')return null;const o={};
 for(const k of GL_KEYS){const P=KMAT.packed('throne','ground.'+k);if(!P)return null;o[k]={map:KMAT.textures(P,{aniso:8}).map,k:1/P.scale[0]};}return o;})();
const TEX_MACRO=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,a=fbm(x/40,y/40,7.3,3),b=fbm(x/13,y/13,7.4,2);d[i]=a*255;d[i+1]=b*255;d[i+2]=128;d[i+3]=255;}g.putImageData(id,0,0);});
TEX_MACRO.wrapS=TEX_MACRO.wrapT=THREE.RepeatWrapping;TEX_MACRO.encoding=THREE.LinearEncoding;
const MAT_GROUND=new THREE.MeshLambertMaterial({map:TEX_GROUND,color:0xb0aaa4});
MAT_GROUND.onBeforeCompile=sh=>{sh.uniforms.uDetail={value:TEX_DETAIL};sh.uniforms.uNight=GROUNDU.uNight;
 if(GLAY){sh.uniforms.uMacro={value:TEX_MACRO};GL_KEYS.forEach(k=>sh.uniforms['uG_'+k]={value:GLAY[k].map});}else{sh.uniforms.uRock={value:THRONE.ROCKTEX};sh.uniforms.uVein={value:TEX_VEIN};}
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;attribute float aRock,aGlow;varying float vRock,vGlow;attribute vec4 aL0,aL1,aL2;varying vec4 vL0,vL1,vL2;')
  .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vRock=aRock;vGlow=aGlow;vL0=aL0;vL1=aL1;vL2=aL2;');
 const W={shoulder:'vL0.x',ember:'vL0.y',ash:'vL0.z',ripples:'vL0.w',mycelium:'vL1.x',lava:'vL1.y',veins:'vL1.z',scoria:'vL1.w',glowcarpet:'vL2.x',sulphur:'vL2.y',tufa:'vL2.z'};
 let decl='uniform sampler2D uDetail;uniform float uNight;varying vec3 vGWP;varying float vRock,vGlow;varying vec4 vL0,vL1,vL2;',body,emit;
 if(GLAY){decl+='uniform sampler2D uMacro,'+GL_KEYS.map(k=>'uG_'+k).join(',')+';vec3 _lay(sampler2D t,vec2 p,vec2 q,float k,float mt){return pow(mix(texture2D(t,p*k).rgb,texture2D(t,q*k*0.47+vec2(0.31,0.17)).rgb,mt),vec3(2.2));}';
  body='{vec2 p=vGWP.xz,q=mat2(0.799,-0.602,0.602,0.799)*p;float mt=smoothstep(0.3,0.7,texture2D(uMacro,p*0.0061).r);'+
   'vec3 dt=texture2D(uDetail,p*0.023+0.37).rgb;diffuseColor.rgb*=mix(vec3(1.0),dt*1.06,0.6);vec3 L;'+
   GL_KEYS.map(k=>'L=_lay(uG_'+k+',p,q,'+GLAY[k].k.toFixed(4)+',mt);diffuseColor.rgb=mix(diffuseColor.rgb,diffuse*L*1.25,'+W[k]+');'+(k==='veins'||k==='glowcarpet'||k==='mycelium'?'vec3 _E_'+k+'=L;':'')).join('')+'}';
  // the night: the veins' orange, the carpet's blue, the mycelium's gold, each by its own colour
  emit='{totalEmissiveRadiance+=uNight*(_E_veins*smoothstep(0.05,0.25,_E_veins.r-_E_veins.b)*'+W.veins+'*2.2+_E_glowcarpet*smoothstep(0.05,0.3,_E_glowcarpet.b-_E_glowcarpet.r)*'+W.glowcarpet+'*2.0+_E_mycelium*smoothstep(0.08,0.3,_E_mycelium.r-_E_mycelium.b)*'+W.mycelium+'*0.55*vGlow);}';
  // the emissive chunk comes after the map chunk in the same scope only if the layer values are kept: hoist them
  body=body.replace('{vec2 p=','vec3 _E_veins=vec3(0.0),_E_glowcarpet=vec3(0.0),_E_mycelium=vec3(0.0);\n{vec2 p=').replace(/vec3 _E_(\w+)=L;/g,'_E_$1=L;');}
 else{decl+='uniform sampler2D uRock,uVein;';
  body='{vec3 dt=texture2D(uDetail,vGWP.xz*0.17).rgb;vec3 dt2=texture2D(uDetail,vGWP.xz*0.023+0.37).rgb;vec3 rk=pow(texture2D(uRock,vGWP.xz*0.13+vGWP.y*0.04).rgb,vec3(2.2));diffuseColor.rgb*=mix(dt*dt2*1.12,rk*2.2,vRock*0.75);}';
  emit='{float v=max(texture2D(uVein,vGWP.xz*0.11).r,texture2D(uVein,vGWP.xz*0.037+0.41).r*0.7);totalEmissiveRadiance+=vec3(1.0,0.62,0.22)*v*vGlow*uNight*0.32;}';}
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+decl)
  .replace('#include <map_fragment>','#include <map_fragment>\n'+body).replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n'+emit);};
const GROUND=(function(){const N=560,S=TERR.R*2.2,cs=S/N,nx=N+1;
 const pos=new Float32Array(nx*nx*3),uv=new Float32Array(nx*nx*2),rk=new Float32Array(nx*nx),gw=new Float32Array(nx*nx),L0=new Float32Array(nx*nx*4),L1=new Float32Array(nx*nx*4),L2=new Float32Array(nx*nx*4);
 for(let j=0;j<nx;j++)for(let i=0;i<nx;i++){const k=j*nx+i,x=-S/2+i*cs,z=-S/2+j*cs,y=terrainH(x,z);pos[k*3]=x;pos[k*3+1]=y;pos[k*3+2]=z;uv[k*2]=x/S+.5;uv[k*2+1]=.5-z/S;
  rk[k]=smooth(.3,.7,FC.at(FC.a.rock,x,z));
  const age=FLOWS.ageAt(x,z),pl=FC.at(FC.a.plume,x,z),al=smooth(.25,.78,pl),S4=THRONE.stages(age),th=FLOWS.thickAt(x,z),onF=smooth(.4,2,th)*(1-smooth(2500,7000,age));
  gw[k]=smooth(.4,.85,pl)*smooth(20,160,age)*(1-rk[k]);
  const vent=FC.at(FC.a.vent,x,z),acid=FC.at(FC.a.acid,x,z),cin=FC.at(FC.a.cinder,x,z),gul=FC.at(FC.a.flow,x,z),sky=FC.at(FC.a.skylight,x,z),slope=FC.at(FC.a.slope,x,z);
  const n1=fbm(x*.006+3,z*.006-4,8431,2),n2=fbm(x*.011-7,z*.011+2,8432,2),soilK=1-onF*(S4.fresh+S4.young+.6*S4.mature);
  const W=[ (1-al)*soilK*.85, 4*al*(1-al)*soilK*.8, al*soilK*.8, al*smooth(.75,1,pl)*smooth(.45,.65,n1)*(1-smooth(.4,.7,slope))*soilK,
   al*soilK*smooth(.45,.65,n2)*(S4.mature+S4.old)*.85, onF*(S4.fresh+S4.young+.8*S4.mature+.45*S4.old), onF*S4.fresh*.85, smooth(.3,.7,cin)*.9,
   Math.max(smooth(.78,.97,sky)*.85,smooth(.5,.85,gul)*al*.45), smooth(.45,.85,vent+(n2-.5)*.3)*.85, smooth(.35,.8,acid)*.85,0];
  for(let c=0;c<4;c++){L0[k*4+c]=W[c];L1[k*4+c]=W[4+c];L2[k*4+c]=W[8+c];}}
 const idx=new Uint32Array(N*N*6);let t=0;
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=j*nx+i,b=a+nx,c=b+1,d=a+1;idx[t++]=a;idx[t++]=b;idx[t++]=d;idx[t++]=b;idx[t++]=c;idx[t++]=d;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
 g.setAttribute('aRock',new THREE.BufferAttribute(rk,1));g.setAttribute('aGlow',new THREE.BufferAttribute(gw,1));
 g.setAttribute('aL0',new THREE.BufferAttribute(L0,4));g.setAttribute('aL1',new THREE.BufferAttribute(L1,4));g.setAttribute('aL2',new THREE.BufferAttribute(L2,4));
 g.setIndex(new THREE.BufferAttribute(idx,1));g.computeVertexNormals();const m=new THREE.Mesh(g,MAT_GROUND);m.userData.probeSkip=true;m.userData.inspectLabel='The Throne\'s south-east shoulder';scene.add(m);return m;})();

// ---------------------------------------------------------------- the water: the acid lake, the hot pools
const MAT_WATER=new THREE.ShaderMaterial({fog:true,vertexColors:true,
 uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,{uT:{value:0},uSun:{value:new THREE.Vector3(...SUN_POS).normalize()},uSky:{value:new THREE.Color(0xd8d6ce)},uLight:{value:1}}]),
 vertexShader:['#include <fog_pars_vertex>','varying vec3 vWP;varying vec3 vCol;',
  'void main(){vCol=color;vec4 wp=modelMatrix*vec4(position,1.0);vWP=wp.xyz;vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n'),
 fragmentShader:['#include <fog_pars_fragment>','uniform float uT,uLight;uniform vec3 uSun,uSky;varying vec3 vWP;varying vec3 vCol;',
  'void main(){',
  ' vec3 n=normalize(vec3(0.02*sin(vWP.x*0.31+uT*0.8)+0.015*sin(vWP.z*0.53-uT*0.5),1.0,0.02*cos(vWP.z*0.27+uT*0.7)));',
  ' vec3 V=normalize(cameraPosition-vWP);float fr=pow(clamp(1.0-max(dot(n,V),0.0),0.0,1.0),3.0);',
  ' vec3 col=mix(vCol,uSky,0.08+fr*0.55);vec3 H=normalize(uSun+V);col+=pow(max(dot(n,H),0.0),120.0)*0.7*vec3(1.0,0.95,0.85);',
  ' gl_FragColor=vec4(col*uLight,1.0);','#include <fog_fragment>','}'].join('\n')});
MAT_WATER.uniforms.fogColor.value=scene.fog.color;MAT_WATER.uniforms.fogDensity.value=scene.fog.density;
TICKS.push(dt=>{MAT_WATER.uniforms.uT.value+=dt;});
function pond(X,Z,R,Lv,c0,c1,label){const C0=new THREE.Color(c0).convertSRGBToLinear(),C1=new THREE.Color(c1).convertSRGBToLinear(),PN=48,pos=[X,Lv,Z],col=[C0.r,C0.g,C0.b],idx=[];
 for(let k=0;k<=PN;k++){const a=k/PN*TAU;pos.push(X+Math.cos(a)*R,Lv,Z+Math.sin(a)*R);col.push(C1.r,C1.g,C1.b);}for(let k=0;k<PN;k++)idx.push(0,k+2,k+1);
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();
 const m=new THREE.Mesh(g,MAT_WATER);m.userData.probeSkip=true;m.userData.inspectLabel=label;m.renderOrder=1;scene.add(m);return m;}
// the acid lake: milky turquoise, as Ijen's; the hot pools: deep blue-green with an orange rim of mats
pond(PIT.x,PIT.z,PIT.r*.98,PIT.lake,0x58b8a8,0x8ad0b0,'The acid lake');
POOLS.forEach((P,i)=>pond(P.x,P.z,P.r*1.5,POOLL[i],0x1e7a90,0xc89a40,'A hot pool'));
_onLight.push(m=>{MAT_WATER.uniforms.uLight.value=m==='night'?.18:1;GROUNDU.uNight.value=m==='night'?1:0;});

// ---------------------------------------------------------------- the steam
// Each fumarole breathes a column of soft puffs that rise, swell and thin; the lake and the pools steam too. One Points
// object, its puffs looping in the vertex shader on the clock (no per-frame CPU work).
const STEAMU={uT:{value:0},uScale:{value:innerHeight*.5},uCol:{value:new THREE.Color(0xeeeae4)}};
const STEAM_MAT=new THREE.ShaderMaterial({transparent:true,depthWrite:false,fog:true,uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,STEAMU]),
 vertexShader:['#include <fog_pars_vertex>','attribute vec4 aS;uniform float uT,uScale;varying float vA;',
  'void main(){float ph=fract(uT*aS.y+aS.x);vec3 p=position+vec3(sin(ph*6.0+aS.x*9.0)*aS.z*0.4+ph*aS.z*2.5,ph*aS.w,cos(ph*5.0+aS.x*7.0)*aS.z*0.4+ph*aS.z*1.2);',
  ' vec4 mvPosition=modelViewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*mvPosition;gl_PointSize=uScale*aS.z*(0.6+ph*2.2)/max(1.0,-mvPosition.z);',
  ' vA=smoothstep(0.0,0.12,ph)*(1.0-ph)*0.5;','#include <fog_vertex>','}'].join('\n'),
 fragmentShader:['#include <fog_pars_fragment>','uniform vec3 uCol;varying float vA;',
  'void main(){vec2 q=gl_PointCoord-0.5;float r=length(q);if(r>0.5)discard;gl_FragColor=vec4(uCol,vA*smoothstep(0.5,0.1,r));','#include <fog_fragment>','}'].join('\n')});
STEAM_MAT.uniforms.fogColor.value=scene.fog.color;STEAM_MAT.uniforms.fogDensity.value=scene.fog.density;
// merge() clones its uniforms: point the material back at the shared ones, which the ticks and the light modes change
['uT','uScale','uCol'].forEach(k=>STEAM_MAT.uniforms[k]=STEAMU[k]);
(function(){reseed(8401);const P=[],A=[];
 const add=(x,z,y,n,size,rise,rate)=>{for(let i=0;i<n;i++){P.push(x+rr(-1.5,1.5),y,z+rr(-1.5,1.5));A.push(rng(),rate*rr(.8,1.2),size*rr(.7,1.3),rise*rr(.7,1.3));}};
 STEAM.forEach(S=>add(S.x,S.z,terrainH(S.x,S.z),Math.round(10+18*S.s),4+5*S.s,24+30*S.s,.07));
 for(let k=0;k<26;k++){const a=rr(0,TAU),d=PIT.r*rr(0,.85);add(PIT.x+Math.cos(a)*d,PIT.z+Math.sin(a)*d,PIT.lake,3,5,18,.05);}
 POOLS.forEach((p,i)=>add(p.x,p.z,POOLL[i],8,2.5,10,.09));
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('aS',new THREE.Float32BufferAttribute(A,4));
 const pts=new THREE.Points(g,STEAM_MAT);pts.frustumCulled=false;pts.userData.probeSkip=true;pts.renderOrder=2;scene.add(pts);})();
// the puff's size is in metres: the point size is that over the depth, times the projection's pixels per radian
TICKS.push(dt=>{STEAMU.uT.value+=dt;STEAMU.uScale.value=innerHeight*renderer.getPixelRatio()/(2*Math.tan(camera.fov*Math.PI/360));});
_onLight.push(m=>STEAMU.uCol.value.setHex(m==='night'?0x40444c:0xeeeae4));
