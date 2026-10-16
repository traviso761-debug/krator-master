// ================================================================= HOST — the fire history, the ground, the water
// the ground's detail and crack layers from the material library (materials.json groundDetail, groundCrack) when this page
// carries the kit's pack; otherwise the procedural ones, which are painted either way (the random stream is unchanged)
function hostGroundLib(n,fb){const L=(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('craterdry',n):null;if(!L)return fb;
 const c=hostGroundLib.c||(hostGroundLib.c={});return c[n]||(c[n]=KMAT.textures(L,{aniso:8}).map);}
// The kit's fire model runs first (CRATERDRY.fireHistory, 52-fire) with this showcase's recent fires; then one ground
// mesh is painted by the mosaic it made, so the burns read from any distance: black char with grey ash, the bloom's
// green flush and its drifts of pink, orange, violet, yellow and crimson, red soil under young scrub, straw and olive
// in the old scrub; pink-grey granite on the kopjes, pale sand in the washes, green at the seep.
const FIRE=CRATERDRY.fireHistory({R:TERR.R,cell:20,wind:FIRE_WIND,fires:FIRES,old:9,seed:520031});
const ageLabel=a=>a<.15?Math.max(1,Math.round(a*52))+' weeks':a<1.5?Math.round(a*12)+' months':a.toFixed(1)+' years';
// where each recent fire actually burned (its cells' centre and extent), registered so the inspector names a burn
FIRE.fires.forEach((f,fi)=>{if(f.failed||f.ago>7)return;let sx=0,sz=0,n=0;
 for(let k=0;k<FIRE.id.length;k++){if(FIRE.id[k]!==fi)continue;const i=k%FIRE.N,j=(k-i)/FIRE.N;sx+=FIRE.x0+i*FIRE.cs;sz+=FIRE.z0+j*FIRE.cs;n++;}
 if(!n)return;f.cx=sx/n;f.cz=sz/n;f.rad=Math.sqrt(n*FIRE.cs*FIRE.cs/Math.PI);f.left=n;
 REGISTER({name:'A burn '+ageLabel(f.ago)+' old',x:f.cx,z:f.cz,y:terrainH(f.cx,f.cz)-10,r:f.rad*1.15,h:60,burn:fi});
 // the LOD spine (45) was set before the fires were placed: add where each recent burn actually lies, so its stage is
 // built in full detail where the cameras look (the kit reads the spine only when it builds, after this)
 if(f.ago<4)BIO.host.origin.push([f.cx,f.cz]);});
KOP.forEach((K,i)=>REGISTER({name:K.name||'A granite kopje',x:K.x,z:K.z,y:plainH(K.x,K.z)-5,r:K.r*1.05,h:K.h+40}));

// ---------------------------------------------------------------- the ground
const TEX_GROUND=BIO.canvasTex(1536,1536,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const S=TERR.R*2.2;
 const c=new THREE.Color(),t=new THREE.Color(),K=hx=>new THREE.Color(hx);
 const SOIL=K(0x9c6a54),SOIL2=K(0x8a5c48),STRAW=K(0xb0a070),OLIVE=K(0x6a6c40),OLIVE2=K(0x7a7848),GREEN=K(0x6a8a46),GREEN2=K(0x7a9650),
  CHAR=K(0x2a2624),CHAR2=K(0x38322c),ASH=K(0xa8a49c),SCORCH=K(0x6a4a32),GRAN=K(0xb4a89c),GRAN2=K(0x8e847c),SAND=K(0xd8c4a0),SAND2=K(0xc8b08a),SEEP=K(0x5a8a3a),
  DRIFT=CRATERDRY.BLOOM_SETS.map(b=>K(b[1][0]));
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const wx=(x/w-.5)*S,wz=(y/h-.5)*S;
  const n=fbm(x/24,y/24,.3,2)-.5,n2=(BIO.fn.h3(x,y,3)-.5),pav=fbm(x/80+5,y/80-2,.7,2);
  const rock=FC.at(FC.a.rock,wx,wz),flow=FC.at(FC.a.flow,wx,wz),oasis=FC.at(FC.a.oasis,wx,wz),slope=FC.at(FC.a.slope,wx,wz);
  const age=FIRE.ageAt(wx,wz),S4=CRATERDRY.stages(age);
  // the red soil of the plain
  c.copy(SOIL).lerp(SOIL2,clamp(.5+n*1.8,0,1));
  // old scrub: straw grass and olive chaparral in patches
  t.copy(STRAW).lerp(OLIVE,smooth(.42,.62,pav)).lerp(OLIVE2,clamp(.5+n*1.4,0,1)*.4);c.lerp(t,S4.mature*.85);
  // young regrowth: olive patches over the red soil, a little yellow broom
  t.copy(SOIL).lerp(OLIVE2,.42+.45*smooth(.35,.6,pav)).lerp(K(0xc8b040),smooth(.62,.72,pav)*.3*smooth(.3,.7,BIO.fn.h3(x>>1,y>>1,7)));c.lerp(t,S4.regrow*.85);
  // the bloom: a green flush and the drifts' colours (each drift one colour, as the floor plants them)
  if(S4.bloom>0){t.copy(GREEN).lerp(GREEN2,clamp(.5+n*1.6,0,1));t.lerp(SOIL,.35+.3*smooth(.4,.7,pav));const dk=CRATERDRY.driftOf(wx,wz);t.lerp(DRIFT[dk],.22*smooth(1.9,.9,Math.abs(age-1.3)));c.lerp(t,S4.bloom*.9);}
  // the char: black, grey-white ash in drifts, browning toward the edge of its first half-year
  if(S4.char>0){t.copy(CHAR).lerp(CHAR2,clamp(.5+n*2,0,1)).lerp(ASH,smooth(.55,.75,pav+n2*.3)*.75).lerp(SCORCH,smooth(.2,.6,age)*.5);c.lerp(t,S4.char);}
  // the washes' sand, the seep's green, the granite (darker in its joints, by slope)
  t.copy(SAND).lerp(SAND2,clamp(.5+n*1.5,0,1));c.lerp(t,smooth(.3,.7,flow)*(1-oasis)*.85);
  c.lerp(SEEP,smooth(.2,.6,oasis)*.85);
  t.copy(GRAN).lerp(GRAN2,clamp(.3+n*1.4+smooth(.5,.9,slope)*.4,0,1));c.lerp(t,smooth(.3,.65,rock));
  const k=1+n*.10+n2*.05;
  d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const TEX_DETAIL=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=232+(fbm(x/9,y/9,5,2)-.5)*36+(BIO.fn.h3(x,y,9)-.5)*24;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
// THE CARPET: a fine fleck map tiled in world metres. R flowers (round dots), G grass blades, B a variation. The ground
// shader lays the bloom's drift colour on the dots and a green flush on the blades wherever the bloom is (aBloom, aDrift),
// and straw on the blades in the old scrub (aOld): a flower carpet at every distance, at no cost in triangles. From afar
// the mipmaps average it into the drift's tint.
const TEX_CARPET=BIO.canvasTex(256,256,(g,w,h)=>{const R=new Float32Array(w*h),G=new Float32Array(w*h),id=g.createImageData(w,h),d=id.data;
 const dot=(A,cx,cy,r,v)=>{for(let y=Math.floor(cy-r);y<=cy+r;y++)for(let x=Math.floor(cx-r);x<=cx+r;x++){const q=Math.hypot(x-cx,y-cy)/r;if(q>1)continue;const k=((y%h+h)%h)*w+((x%w+w)%w);A[k]=Math.max(A[k],v*(1-q*q*.6));}};
 for(let i=0;i<4200;i++){const cx=rng()*w,cy=rng()*h,a=rr(-.5,.5)-Math.PI/2,L=rr(3,8);for(let t=0;t<=L;t+=.7)dot(G,cx+Math.cos(a)*t,cy+Math.sin(a)*t,.9,rr(.7,1));}
 for(let i=0;i<1500;i++){const cx=rng()*w,cy=rng()*h,r=rr(1.6,3.4);dot(R,cx,cy,r,1);}
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,k=y*w+x;d[i]=R[k]*255;d[i+1]=G[k]*255;d[i+2]=clamp(128+(fbm(x/14,y/14,8,2)-.5)*200,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
TEX_CARPET.wrapS=TEX_CARPET.wrapT=THREE.RepeatWrapping;TEX_CARPET.encoding=THREE.LinearEncoding;TEX_CARPET.anisotropy=4;
// THE LIBRARY GROUND (materials.json ground.burn, ground.redsoil; core/materials/PLAN.md, Crater drylands): two layers over
// the painted ground, blended per vertex by the burn's stage. The char layer (black char, grey-white ash, burnt stubble)
// covers the fresh burns and fades through the bloom's first year; the red soil layer is the ground under the bloom, the
// regrowth and the old scrub, mixed half with the painted colour so the scrub's olive and the straw still show. Without
// the pack (?mat=proc, or an open world) the ground is exactly the painted one.
const GLAY=(function(){if(typeof KMAT==='undefined'||KMAT.mode!=='lib')return null;const P=n=>KMAT.packed('craterdry',n);
 const b=P('ground.burn'),s=P('ground.redsoil');if(!b||!s)return null;
 return{burn:KMAT.textures(b,{aniso:8}).map,burnK:1/b.scale[0],soil:KMAT.textures(s,{aniso:8}).map,soilK:1/s.scale[0]};})();
// THE LIVE FIRE's uniforms and shader text (89-host-fire.js lights the fire and drives them; the ground here and every
// plant material 89 patches share them): the arrival-time map (R the arrival in seconds, G the ground's height: a
// half-float texture, so it filters), the fire's clock (seconds since it was lit), on/off, the grid (x0, z0, cell, N).
// fireCell(xz) -> (seconds since the fire reached xz, or very negative before it does or with no fire; the ground's
// height there). The front is wobbled a few seconds by a smooth noise so it is not the grid's.
const FIREU={uFireTex:{value:null},uFireT:{value:0},uFireOn:{value:0},uFireRT:{value:0},uFireGrid:{value:new THREE.Vector4(0,0,20,1)}};
const FIRE_GLSL='uniform sampler2D uFireTex;uniform float uFireT,uFireOn,uFireRT;uniform vec4 uFireGrid;'+
 'vec2 fireCell(vec2 xz){vec2 uv=((xz-uFireGrid.xy)/uFireGrid.z+0.5)/uFireGrid.w;vec2 g=texture2D(uFireTex,uv).rg;'+
 'g.x+=5.0*sin(xz.x*0.19+2.0*sin(xz.y*0.13))+4.0*sin(xz.y*0.23+1.7*sin(xz.x*0.11));return vec2(uFireOn>0.5?uFireT-g.x:-1e5,g.y);}'+
 'float fireHash(vec3 p){return fract(sin(dot(floor(p),vec3(12.9898,78.233,37.719)))*43758.5453);}\n';
const MAT_GROUND=new THREE.MeshLambertMaterial({map:TEX_GROUND,color:0xa8a29a});
MAT_GROUND.onBeforeCompile=sh=>{sh.uniforms.uDetail={value:hostGroundLib('groundDetail',TEX_DETAIL)};sh.uniforms.uGran={value:CRATERDRY.GRANITE?CRATERDRY.GRANITE.map:CRATERDRY.ROCKTEX};sh.uniforms.uCarpet={value:TEX_CARPET};if(GLAY){sh.uniforms.uGBurn={value:GLAY.burn};sh.uniforms.uGSoil={value:GLAY.soil};}
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;attribute float aRock;varying float vRock;attribute float aBloom,aOld;attribute vec3 aDrift;varying float vBloom,vOld;varying vec3 vDrift;attribute vec2 aGL;varying vec2 vGL;')
  .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vRock=aRock;vBloom=aBloom;vOld=aOld;vDrift=aDrift;vGL=aGL;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uDetail,uGran,uCarpet;varying vec3 vGWP;varying float vRock;varying float vBloom,vOld;varying vec3 vDrift;varying vec2 vGL;'+(GLAY?'uniform sampler2D uGBurn,uGSoil;':'')+FIRE_GLSL)
  .replace('#include <map_fragment>','#include <map_fragment>\n{vec3 dt=texture2D(uDetail,vGWP.xz*0.165).rgb;vec3 dt2=texture2D(uDetail,vGWP.xz*0.021+0.37).rgb;'+
  // the granite's speckle on the kopjes (a custom sampler is not decoded from sRGB: pow 2.2 by hand)
  'vec3 gr=pow(texture2D(uGran,vGWP.xz*0.11+vGWP.y*0.03).rgb,vec3(2.2));'+
  'vec3 _pd=diffuseColor.rgb;'+
  'diffuseColor.rgb*=mix(dt*dt2*1.12,gr*'+(CRATERDRY.GRANITE?(.7/Math.pow(CRATERDRY.GRANITE.mean,2.2)).toFixed(3):'2.6')+',vRock*0.7);'+
  // the library ground: a custom sampler is not decoded from sRGB, so pow 2.2 by hand; the layers take the painted
  // colour's place (not on top of the procedural grain), the soil half and half with it, the char whole
  // ANTI-TILING: each layer is sampled twice, on its own tile and on a larger one turned 37 degrees, blended by a macro
  // noise (the carpet's B channel at ~58 m and ~164 m), so the 3 m repeat never lines up into a grid. The char then
  // varies at that scale too: blacker where the fuel was heaviest, grey-white ash drifts, less of the red soil's warmth
  (GLAY?'{vec2 p=vGWP.xz,q=mat2(0.799,-0.602,0.602,0.799)*p;'+
   'float m1=texture2D(uCarpet,p*0.0173+vec2(0.13,0.71)).b,m2=texture2D(uCarpet,p*0.0061+vec2(0.57,0.29)).b,mt=smoothstep(0.3,0.7,m1);'+
   'vec3 ts=mix(pow(texture2D(uGSoil,p*'+GLAY.soilK.toFixed(4)+').rgb,vec3(2.2)),pow(texture2D(uGSoil,q*'+(GLAY.soilK*.47).toFixed(4)+'+vec2(0.31,0.17)).rgb,vec3(2.2)),mt);'+
   'vec3 tb=mix(pow(texture2D(uGBurn,p*'+GLAY.burnK.toFixed(4)+').rgb,vec3(2.2)),pow(texture2D(uGBurn,q*'+(GLAY.burnK*.47).toFixed(4)+'+vec2(0.31,0.17)).rgb,vec3(2.2)),mt);'+
   'tb=mix(tb,vec3(dot(tb,vec3(0.2126,0.7152,0.0722))),0.35);tb*=mix(0.5,1.25,smoothstep(0.2,0.8,m2));'+
   'tb=mix(tb,vec3(0.36,0.35,0.33),smoothstep(0.62,0.85,m1*0.6+m2*0.5)*0.55);'+
   'diffuseColor.rgb=mix(diffuseColor.rgb,mix(_pd,diffuse*ts*1.25,0.55),vGL.y);diffuseColor.rgb=mix(diffuseColor.rgb,diffuse*tb*1.15,vGL.x);}':'')+
  // the carpet: two scales of the fleck map, so the tiling does not show; colours are linear, times the material's own
  'vec3 c1=texture2D(uCarpet,vGWP.xz*0.41).rgb,c2=texture2D(uCarpet,vGWP.xz*0.157+vec2(0.37,0.61)).rgb;'+
  'float fl=max(c1.r,c2.r*0.85),gb=max(c1.g,c2.g*0.8);'+
  'diffuseColor.rgb=mix(diffuseColor.rgb,diffuse*vec3(0.32,0.6,0.14)*(0.8+0.5*c2.b),gb*vBloom*0.85);'+
  'diffuseColor.rgb=mix(diffuseColor.rgb,diffuse*vDrift*(1.3+0.6*c1.b),fl*vBloom);'+
  'diffuseColor.rgb=mix(diffuseColor.rgb,diffuse*vec3(0.62,0.5,0.26)*(0.8+0.4*c2.b),gb*vOld*0.45);'+
  // THE LIVE FIRE behind its front: the ground goes to char over ten seconds (not on the bare granite)
  '{vec2 fc=fireCell(vGWP.xz);float b=smoothstep(0.0,10.0,fc.x)*(1.0-vRock*0.85);if(b>0.0){vec3 ch='+
  (GLAY?'pow(texture2D(uGBurn,vGWP.xz*'+GLAY.burnK.toFixed(4)+').rgb,vec3(2.2))*0.7':'vec3(0.03,0.028,0.025)')+';diffuseColor.rgb=mix(diffuseColor.rgb,diffuse*ch,b);}}}')
  // the flame line (a flickering orange band a few metres deep at the front) and embers smouldering for minutes behind it,
  // added after the tone map so they glow
  .replace('#include <dithering_fragment>','#include <dithering_fragment>\n{vec2 fc=fireCell(vGWP.xz);float tt=fc.x;if(tt>-6.0&&tt<260.0){'+
   'float fr=smoothstep(-3.0,0.0,tt)*(1.0-smoothstep(1.0,12.0,tt))*pow(0.25+0.75*smoothstep(0.25,0.75,texture2D(uCarpet,vGWP.xz*0.031+vec2(0.71,0.23)).b),2.0);float fl=0.55+0.45*sin(uFireRT*11.0+vGWP.x*0.8+sin(vGWP.z*0.6))*sin(uFireRT*7.3+vGWP.z*0.9);'+
   'float sm=step(0.0,tt)*(1.0-smoothstep(30.0,240.0,tt))*step(0.985,fireHash(vec3(vGWP.xz*1.6,0.0)));'+
   'gl_FragColor.rgb+=vec3(1.0,0.38,0.06)*(fr*fl*0.9+sm*0.55*(0.55+0.45*sin(uFireRT*2.3+vGWP.x*3.0)))*(1.0-vRock);}}');
 Object.assign(sh.uniforms,FIREU);};
const GROUND=(function(){const N=480,S=TERR.R*2.2,cs=S/N,nx=N+1;
 const pos=new Float32Array(nx*nx*3),uv=new Float32Array(nx*nx*2),rk=new Float32Array(nx*nx),bl=new Float32Array(nx*nx),old=new Float32Array(nx*nx),dr=new Float32Array(nx*nx*3);
 const gl=new Float32Array(nx*nx*2);
 const DR=CRATERDRY.BLOOM_SETS.map(b=>{const c=new THREE.Color(b[1][0]).convertSRGBToLinear();return[Math.min(1,c.r*2.3),Math.min(1,c.g*2.3),Math.min(1,c.b*2.3)];});
 for(let j=0;j<nx;j++)for(let i=0;i<nx;i++){const k=j*nx+i,x=-S/2+i*cs,z=-S/2+j*cs,y=terrainH(x,z);pos[k*3]=x;pos[k*3+1]=y;pos[k*3+2]=z;uv[k*2]=x/S+.5;uv[k*2+1]=.5-z/S;
  rk[k]=smooth(.3,.65,FC.at(FC.a.rock,x,z));
  const age=FIRE.ageAt(x,z),S4=CRATERDRY.stages(age),open=(1-rk[k])*(1-smooth(.3,.7,FC.at(FC.a.flow,x,z))*.7);
  bl[k]=S4.bloom*open*smooth(2.2,.9,Math.abs(age-1.3))*(.55+.45*smooth(.3,.7,fbm(x*.02,z*.02,4351,2)));old[k]=S4.mature*open;
  const gr=(1-rk[k])*(1-smooth(.3,.7,FC.at(FC.a.flow,x,z))*.85)*(1-smooth(.2,.6,FC.at(FC.a.oasis,x,z)));
  gl[k*2]=gr*Math.min(1,S4.char+.5*S4.bloom*smooth(1.2,.45,age));gl[k*2+1]=gr*(.5*S4.regrow+.6*S4.bloom+.45*S4.mature);
  const D=DR[CRATERDRY.driftOf(x,z)];dr[k*3]=D[0];dr[k*3+1]=D[1];dr[k*3+2]=D[2];}
 const idx=new Uint32Array(N*N*6);let t=0;
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=j*nx+i,b=a+nx,c=b+1,d=a+1;idx[t++]=a;idx[t++]=b;idx[t++]=d;idx[t++]=b;idx[t++]=c;idx[t++]=d;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
 g.setAttribute('aRock',new THREE.BufferAttribute(rk,1));g.setAttribute('aBloom',new THREE.BufferAttribute(bl,1));g.setAttribute('aOld',new THREE.BufferAttribute(old,1));g.setAttribute('aDrift',new THREE.BufferAttribute(dr,3));g.setAttribute('aGL',new THREE.BufferAttribute(gl,2));
 g.setIndex(new THREE.BufferAttribute(idx,1));g.computeVertexNormals();const m=new THREE.Mesh(g,MAT_GROUND);m.userData.probeSkip=true;m.userData.inspectLabel='The crater drylands';scene.add(m);return m;})();

// ---------------------------------------------------------------- the water (the seep)
const MAT_WATER=new THREE.ShaderMaterial({fog:true,vertexColors:true,
 uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,{uT:{value:0},uSun:{value:new THREE.Vector3(-1000,900,-700).normalize()},uSky:{value:new THREE.Color(0xe4e2da)}}]),
 vertexShader:['#include <fog_pars_vertex>','varying vec3 vWP;varying vec3 vCol;',
  'void main(){vCol=color;vec4 wp=modelMatrix*vec4(position,1.0);vWP=wp.xyz;vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n'),
 fragmentShader:['#include <fog_pars_fragment>','uniform float uT;uniform vec3 uSun,uSky;varying vec3 vWP;varying vec3 vCol;',
  'void main(){',
  ' vec3 n=normalize(vec3(0.03*sin(vWP.x*0.41+uT*1.1)+0.02*sin(vWP.z*0.63-uT*0.7),1.0,0.03*cos(vWP.z*0.37+uT*0.9)));',
  ' vec3 V=normalize(cameraPosition-vWP);float fr=pow(clamp(1.0-max(dot(n,V),0.0),0.0,1.0),3.0);',
  ' vec3 col=mix(vCol,uSky,0.10+fr*0.62);vec3 H=normalize(uSun+V);col+=pow(max(dot(n,H),0.0),140.0)*0.8*vec3(1.0,0.95,0.85);',
  ' gl_FragColor=vec4(col,1.0);','#include <fog_fragment>','}'].join('\n')});
MAT_WATER.uniforms.fogColor.value=scene.fog.color;MAT_WATER.uniforms.fogDensity.value=scene.fog.density;
TICKS.push(dt=>{MAT_WATER.uniforms.uT.value+=dt;});
(function(){const X=SEEP.x,Z=SEEP.z,R=SEEP.r*1.35,L=SEEPL,c0=new THREE.Color(0x2e5a4a).convertSRGBToLinear(),c1=new THREE.Color(0x6a8a6a).convertSRGBToLinear(),PN=32,pos=[X,L,Z],col=[c0.r,c0.g,c0.b],idx=[];
 for(let k=0;k<=PN;k++){const a=k/PN*TAU;pos.push(X+Math.cos(a)*R,L,Z+Math.sin(a)*R);col.push(c1.r,c1.g,c1.b);}for(let k=0;k<PN;k++)idx.push(0,k+2,k+1);
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();
 const m=new THREE.Mesh(g,MAT_WATER);m.userData.probeSkip=true;m.userData.inspectLabel='The seep';m.renderOrder=1;scene.add(m);
 REGISTER({name:'The seep',x:X,z:Z,y:L-5,r:SEEP.r*3,h:30});})();
