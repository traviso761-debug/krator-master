// ================================================================= HOST — the ground, the water, the mist
// One ground mesh painted by the kit's zones (so they read from any distance): bright moss under the woods, soft
// green-gold meadow, pale sand on the flats, wet dark green at the shores and the stream, sage and ochre on the
// terraces, pale granite on the crags and the rock, dark olive under the pools. Then the four pools, mirror-still, and
// the mist at the valley's head and over the water in the morning.
// THE RAKED FLATS: the ground shader lays ripples over the flats (aFlat): parallel ripples the wind combs, and round each
// standing-stone group concentric rings, as a monk would rake them (the valley rakes its own; nobody has).
POOLS.forEach(P=>REGISTER({name:P.name,x:P.x,z:P.z,y:P.l-8,r:P.r*1.5,h:30}));
REGISTER({name:KNOLL.name,x:KNOLL.x,z:KNOLL.z,y:floor0(KNOLL.x)-5,r:KNOLL.r*1.1,h:KNOLL.h+40});
REGISTER({name:'The cataract at the valley\'s head',x:CATARACT.x,z:CATARACT.z,y:floor0(1900)-5,r:220,h:120});
FANS.forEach((F,i)=>REGISTER({name:'The flats (a gravel fan, raked by the wind)',x:F.x,z:F.z,y:floor0(F.x)-4,r:F.rx,h:14}));

// ---------------------------------------------------------------- the ground
const TEX_GROUND=BIO.canvasTex(1536,1536,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const S=TERR.R*2.2;
 const c=new THREE.Color(),t=new THREE.Color(),K=hx=>new THREE.Color(hx);
 const LOAM=K(0x4e4a3a),MOSS=K(0x76964a),MOSS2=K(0x92b25a),MOSSD=K(0x56722e),MEAD=K(0x9cb070),MEAD2=K(0xb4c08a),SAND=K(0xeeeadf),SAND2=K(0xe2dccd),
  WET=K(0x5a7a4a),SAGE=K(0x98a882),OCHRE=K(0xb0a888),GRAN=K(0xb0aca4),GRAN2=K(0x8a8884),BED=K(0x4e5e44),LITTER=K(0xc0b888),MARBLE=K(0xe8dce4);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const wx=(x/w-.5)*S,wz=(y/h-.5)*S;
  const n=fbm(x/24,y/24,.3,2)-.5,n2=(BIO.fn.h3(x,y,3)-.5),pav=fbm(x/80+5,y/80-2,.7,2),pav2=fbm(x/40-3,y/40+8,.9,2);
  const Z=OIDONG.zones(wx,wz),rock=FC.at(FC.a.rock,wx,wz),slope=FC.at(FC.a.slope,wx,wz);
  // the meadow: soft green-gold, paler swales
  c.copy(MEAD).lerp(MEAD2,smooth(.42,.62,pav)*.8).lerp(LITTER,smooth(.6,.72,pav2)*.3);c.lerp(MEAD,clamp(.5+n*1.6,0,1)*.15);
  // the terraces above: sage and ochre
  t.copy(SAGE).lerp(OCHRE,smooth(.45,.7,pav2)*.7);c.lerp(t,smooth(.25,.6,Z.up)*.65);
  // the moss woods and the mist: moss over dark loam, brighter where it is wettest
  t.copy(MOSS).lerp(MOSS2,clamp(.5+n*2,0,1)*.6).lerp(LOAM,smooth(.5,.72,pav)*.5).lerp(MOSSD,smooth(.3,.5,pav2)*.5);c.lerp(t,clamp(Z.moss*1.4+Z.mistZ*1.2,0,1));
  // the marble groves: pastel crusts between the moss
  c.lerp(MARBLE,Z.grove*smooth(.25,.6,Z.moss+Z.mistZ)*.45*smooth(.45,.7,pav2));
  // the bamboo groves: leaf litter
  c.lerp(LITTER,clamp(Z.bamboo*1.3,0,1)*.8);
  // the flats: pale sand and gravel
  t.copy(SAND).lerp(SAND2,smooth(.4,.65,pav2)*.6);c.lerp(t,clamp(Z.flats*1.3,0,1));
  // the shores and the stream: dark and wet
  c.lerp(WET,clamp(Z.shore*1.2*smooth(.5,.72,pav),0,1)*.7);c.lerp(WET,smooth(.5,.85,FC.at(FC.a.flow,wx,wz))*.75);
  // the pools' beds
  c.lerp(BED,Z.pool);
  // the granite: the crags, the rock, the walls' steeps; darker in its joints
  t.copy(GRAN).lerp(GRAN2,clamp(.3+n*1.4+smooth(.5,.9,slope)*.45,0,1)).lerp(MOSSD,smooth(.6,.8,FC.at(FC.a.wet,wx,wz))*.4);c.lerp(t,smooth(.3,.65,rock));
  const k=1+n*.08+n2*.04;
  d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const TEX_DETAIL=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=232+(fbm(x/9,y/9,5,2)-.5)*32+(BIO.fn.h3(x,y,9)-.5)*20;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
// TEX_MACRO: three independent SEAMLESS value noises (r, g, b), periodic on their lattice (shighlands')
const TEX_MACRO=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 const vn=(x,y,P,o)=>{const i=Math.floor(x),j=Math.floor(y),fx=x-i,fy=y-j,ux=fx*fx*(3-2*fx),uy=fy*fy*(3-2*fy),a=(p,q)=>BIO.fn.h3(((p%P)+P)%P,((q%P)+P)%P,o);
  return mix(mix(a(i,j),a(i+1,j),ux),mix(a(i,j+1),a(i+1,j+1),ux),uy);};
 const fb=(x,y,o)=>{let v=0,amp=.5,t=0;for(let k=0;k<4;k++){const P=4<<k;v+=amp*vn(x/w*P,y/h*P,P,o+k);t+=amp;amp*=.5;}return v/t;};
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const k=(y*w+x)*4;for(let c=0;c<3;c++)d[k+c]=clamp((fb(x,y,31+c*7)-.5)*2.4+.5,0,1)*255;d[k+3]=255;}
 g.putImageData(id,0,0);});
TEX_MACRO.wrapS=TEX_MACRO.wrapT=THREE.RepeatWrapping;TEX_MACRO.encoding=THREE.LinearEncoding;
// THE LIBRARY GROUND (materials.json ground.moss, ground.sand): two layers over the painted ground, blended per vertex
// by the zones (aGL: moss under the woods, sand on the flats), hex-tiled (Mikkelsen 2022, as the southern highlands) so
// no tile repeats; without the pack (?mat=proc, or an open world) the ground is exactly the painted one.
const GLAY=(function(){if(typeof KMAT==='undefined'||KMAT.mode!=='lib')return null;const P=n=>KMAT.packed('oidong',n);
 const m=P('ground.moss'),s=P('ground.sand'),fo=P('ground.forest'),mb=P('stone.marblecliff');if(!m||!s)return null;
 return{moss:KMAT.textures(m,{aniso:8}).map,mossK:1/m.scale[0],sand:KMAT.textures(s,{aniso:8}).map,sandK:1/s.scale[0],forest:fo?KMAT.textures(fo,{aniso:8}).map:null,forestK:fo?1/fo.scale[0]:0,marble:mb?KMAT.textures(mb,{aniso:8}).map:null,marbleK:mb?1/mb.scale[0]:0};})();
// the standing-stone groups, for the raked rings: filled by 88-host-build.js after the floor is placed
const NSTONE=32,STONE_U={value:Array.from({length:NSTONE},()=>new THREE.Vector3(1e6,1e6,0))};
function setStones(groups){for(let i=0;i<NSTONE;i++){const G=groups[i];if(G)STONE_U.value[i].set(G.x,G.z,G.r);else STONE_U.value[i].set(1e6,1e6,0);}}
// THE LIBRARY LAYERS ON KGROUND (43-core-ground.js; BACKPORT.md's ground row, the final rebuild 2026-11-03): the same four surfaces, now hex-tiled, scaled
// with distance and blended by height over the paint, each on its documented mask (the review's first line), the same per-vertex weights as before:
//   moss    aGL.x  the zones' moss woods, the mist at the head and the shores (OIDONG.zones: moss, mistZ, shore), off rock
//   forest  aGL.x times a macro patch (~250 m): the dark forest floor breaking the moss
//   sand    aGL.y  the flats (the gravel fans off the south wall: FANS, the kit's `flat` field), off rock
//   marble  aRock times a macro patch: the paler cliff in veins through the granite (the `rock` field: slope and Longsong's rock)
//   wet     aWet   the water's wet band: WATER.fieldAt's shore distance from the water the eye sees (89z), darkening the ground to the edge
// Standard under KGROUND (roughness high, as dry ground is) so the rain's gloss and the puddles show; ?kground=0 for the old floor (Lambert, the old mix)
const USE_KG=typeof KGROUND!=='undefined'&&new URLSearchParams(location.search).get('kground')!=='0';
const MAT_GROUND=USE_KG?new THREE.MeshStandardMaterial({map:TEX_GROUND,color:0xb4b0a8,roughness:.95,metalness:0}):new THREE.MeshLambertMaterial({map:TEX_GROUND,color:0xb4b0a8});
MAT_GROUND.onBeforeCompile=sh=>{sh.uniforms.uDetail={value:TEX_DETAIL};sh.uniforms.uGran={value:OIDONG.ROCKTEX};sh.uniforms.uMacro={value:TEX_MACRO};sh.uniforms.uStones=STONE_U;if(GLAY){sh.uniforms.uGMoss={value:GLAY.moss};sh.uniforms.uGSand={value:GLAY.sand};if(GLAY.forest)sh.uniforms.uGFor={value:GLAY.forest};if(GLAY.marble)sh.uniforms.uGMar={value:GLAY.marble};}
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;attribute float aRock;varying float vRock;attribute float aFlat;varying float vFlat;attribute vec2 aGL;varying vec2 vGL;attribute float aWet;varying float vWet;')
  .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vRock=aRock;vFlat=aFlat;vGL=aGL;vWet=aWet;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uDetail,uGran;varying vec3 vGWP;varying float vRock;varying float vFlat;varying vec2 vGL;uniform sampler2D uMacro;uniform vec3 uStones['+NSTONE+'];varying float vWet;'+(GLAY&&!USE_KG?'uniform sampler2D uGMoss,uGSand'+(GLAY.forest?',uGFor':'')+(GLAY.marble?',uGMar':'')+';'+
   'vec2 gkHash(vec2 v){return fract(sin(vec2(dot(v,vec2(127.1,311.7)),dot(v,vec2(269.5,183.3))))*43758.5453);}'+
   'vec3 gkSample(sampler2D t,vec2 uv,vec2 dx,vec2 dy,vec2 v){vec2 h=gkHash(v);float a=h.x*6.2831853;mat2 R=mat2(cos(a),sin(a),-sin(a),cos(a));'+
   ' return pow('+(renderer.capabilities.isWebGL2?'textureGrad(t,R*uv+h,R*dx,R*dy)':'texture2D(t,R*uv+h)')+'.rgb,vec3(2.2));}'+
   'vec3 gkLay(sampler2D t,vec2 p,float k){vec2 uv=p*k,dx=dFdx(uv),dy=dFdy(uv);vec2 sk=mat2(1.0,0.0,-0.57735027,1.15470054)*(uv*1.732);'+
   ' vec2 b=floor(sk);vec3 f=vec3(fract(sk),0.0);f.z=1.0-f.x-f.y;float s=step(0.0,-f.z),s2=2.0*s-1.0;'+
   ' vec3 w=vec3(-f.z*s2,s-f.y*s2,s-f.x*s2);w=pow(max(w,0.0),vec3(5.0));w/=(w.x+w.y+w.z);'+
   ' return gkSample(t,uv,dx,dy,b+vec2(s,s))*w.x+gkSample(t,uv,dx,dy,b+vec2(s,1.0-s))*w.y+gkSample(t,uv,dx,dy,b+vec2(1.0-s,s))*w.z;}':''))
  .replace('#include <map_fragment>','#include <map_fragment>\n{vec3 dt=texture2D(uDetail,vGWP.xz*0.165).rgb;vec3 dt2=texture2D(uDetail,vGWP.xz*0.021+0.37).rgb;'+
  'vec3 gr=pow(texture2D(uGran,vGWP.xz*0.11+vGWP.y*0.03).rgb,vec3(2.2));'+
  (USE_KG?'\n/*KGROUND*/\n':'')+(GLAY&&!USE_KG?'{vec3 _pd=diffuseColor.rgb;vec2 p=vGWP.xz;vec3 mc2=texture2D(uMacro,p*0.0039+vec2(0.43,0.19)).rgb;'+
   'float tone=mix(0.8,1.15,mc2.b);vec3 hue=mix(vec3(1.06,0.97,0.9),vec3(0.94,1.04,0.96),smoothstep(0.3,0.7,mc2.r));'+
   'vec3 tm=gkLay(uGMoss,p,'+GLAY.mossK.toFixed(4)+')*tone*mix(vec3(1.0),hue,0.5);'+
   'vec3 ts=gkLay(uGSand,p,'+GLAY.sandK.toFixed(4)+')*mix(0.9,1.08,mc2.b);'+
   /* the dark forest floor (library ground106) breaks the moss where a macro noise runs high; the marble (library marble012) shows through the crags in veins of paler cliff */
   (GLAY.forest?'vec3 tf=gkLay(uGFor,p,'+GLAY.forestK.toFixed(4)+')*mix(0.8,1.15,mc2.b);tm=mix(tm,tf,smoothstep(0.5,0.7,mc2.g)*0.8);':'')+
   'diffuseColor.rgb=mix(diffuseColor.rgb,mix(_pd,diffuse*tm*1.2,0.42),vGL.x);diffuseColor.rgb=mix(diffuseColor.rgb,mix(_pd,diffuse*ts*1.25,0.6),vGL.y);}':'')+
  (GLAY&&GLAY.marble&&!USE_KG?'diffuseColor.rgb=mix(diffuseColor.rgb,diffuse*gkLay(uGMar,vGWP.xz+vec2(vGWP.y*0.7,0.0),'+GLAY.marbleK.toFixed(4)+')*1.5,vRock*smoothstep(0.42,0.62,texture2D(uMacro,vGWP.xz*0.0061+vec2(0.17,0.61)).g)*0.8);':'')+
  'diffuseColor.rgb*=mix(dt*dt2*1.12,gr*2.4,vRock*0.7);diffuseColor.rgb*=mix(vec3(1.0),vec3(0.62,0.62,0.58),vWet);'+
  // THE RAKING: on the flats, parallel ripples combed by the wind (a slow bend so they are not ruled lines), and round
  // each standing-stone group concentric rings that win over the parallel ones within its reach
  '{vec2 p=vGWP.xz;float bend=0.35*sin(p.x*0.011+p.y*0.007);vec2 dir=normalize(vec2(0.22+bend,1.0));float rip=sin(dot(p,dir)*7.5+0.6*sin(p.x*0.09+p.y*0.13));'+
  'float ring=0.0,rk=0.0;for(int i=0;i<'+NSTONE+';i++){vec3 s=uStones[i];float d=distance(p,s.xy);float reach=s.z*2.8;float k=1.0-smoothstep(s.z*0.5,reach,d);'+
  ' if(k>rk){rk=k;ring=sin(d*7.0);}}'+
  'float rake=mix(rip,ring,rk);float vis=vFlat*(0.55+0.45*smoothstep(0.0,1.0,1.0-vRock));'+
  'diffuseColor.rgb*=1.0+vis*(0.07*rake-0.03*abs(rake));}}');};
// THE RELIEF (KGROUND's opt-in relief, core/terrain/GROUND.md; the ground catch-up 2026-11-04): the layers' height bumps the lit normal near the eye,
// the low of it and the mesh's hollows (aKGAO, KGROUND.cavityMesh on the mesh below) lose sky light. No side planes (tri): ?relief=0 none
const KG_REL=new URLSearchParams(location.search).get('relief')!=='0'?{bump:.075,cavity:.8,mesh:1}:null;
if(USE_KG)KGROUND.hook(MAT_GROUND,{key:'oidong-ground',at:'/*KGROUND*/',relief:KG_REL,layers:[
 KGROUND.layer('oidong','ground.moss',{w:'vGL.x',amt:.42,gain:1.2,tint:'diffuse',name:'moss'}),
 KGROUND.layer('oidong','ground.forest',{w:'vGL.x*smoothstep(0.5,0.7,texture2D(uMacro,vGWP.xz*0.0039+vec2(0.43,0.19)).g)',amt:.36,gain:1.0,tint:'diffuse',name:'forest floor'}),
 KGROUND.layer('oidong','ground.sand',{w:'vGL.y',amt:.6,gain:1.25,tint:'diffuse',name:'sand'}),
 KGROUND.layer('oidong','stone.marblecliff',{w:'vRock*smoothstep(0.42,0.62,texture2D(uMacro,vGWP.xz*0.0061+vec2(0.17,0.61)).g)',amt:.8,gain:1.5,tint:'diffuse',name:'marble'})]});
const GROUND=(function(){const N=480,S=TERR.R*2.2,cs=S/N,nx=N+1;
 const pos=new Float32Array(nx*nx*3),uv=new Float32Array(nx*nx*2),rk=new Float32Array(nx*nx),fl=new Float32Array(nx*nx),gl=new Float32Array(nx*nx*2);
 for(let j=0;j<nx;j++)for(let i=0;i<nx;i++){const k=j*nx+i,x=-S/2+i*cs,z=-S/2+j*cs,y=terrainH(x,z);pos[k*3]=x;pos[k*3+1]=y;pos[k*3+2]=z;uv[k*2]=x/S+.5;uv[k*2+1]=.5-z/S;
  const Z=OIDONG.zones(x,z);rk[k]=smooth(.3,.65,FC.at(FC.a.rock,x,z));fl[k]=clamp(Z.flats*1.3,0,1)*(1-rk[k]);
  gl[k*2]=clamp(Z.moss*1.4+Z.mistZ*1.2+Z.shore*.5,0,1)*(1-rk[k]);gl[k*2+1]=fl[k];}
 const idx=new Uint32Array(N*N*6);let t=0;
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=j*nx+i,b=a+nx,c=b+1,d=a+1;idx[t++]=a;idx[t++]=b;idx[t++]=d;idx[t++]=b;idx[t++]=c;idx[t++]=d;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
 g.setAttribute('aRock',new THREE.BufferAttribute(rk,1));g.setAttribute('aFlat',new THREE.BufferAttribute(fl,1));g.setAttribute('aGL',new THREE.BufferAttribute(gl,2));g.setAttribute('aWet',new THREE.BufferAttribute(new Float32Array(nx*nx),1));   /* aWet: 89z fills it from the water's fields */
 g.setIndex(new THREE.BufferAttribute(idx,1));g.computeVertexNormals();const m=new THREE.Mesh(g,MAT_GROUND);m.receiveShadow=true;m.userData.probeSkip=true;m.userData.inspectLabel='The Oidong Valley';if(USE_KG&&KG_REL)KGROUND.cavityMesh(m,{rings:[3,18],depth:[.5,4]});   /* aKGAO: relief.mesh */scene.add(m);return m;})();

// ---------------------------------------------------------------- the water
// The pools, the stream and the cataract are core/water's (89w-host-water.js); the records (POOLS, CATARACT, streamOff) are in 45-host-stage.js.

// ---------------------------------------------------------------- the cataract and the mist
// Thin sheets of mist lie over the
// pools, and a few drift along the floor. All drift slowly and keep to the ground's height.
const MIST=(function(){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),id=g.createImageData(128,128);
 for(let y=0;y<128;y++)for(let x=0;x<128;x++){const dx=(x-64)/64,dy=(y-64)/64,r=Math.hypot(dx,dy),a=clamp(1-r,0,1)*(.55+.45*fbm(x/22,y/22,3,3));id.data[(y*128+x)*4]=id.data[(y*128+x)*4+1]=id.data[(y*128+x)*4+2]=255;id.data[(y*128+x)*4+3]=clamp(a*a*255,0,255);}
 g.putImageData(id,0,0);const tex=new THREE.CanvasTexture(c);
 const sheetM=new THREE.MeshBasicMaterial({map:tex,color:0xe8ecf0,transparent:true,opacity:.16,depthWrite:false,side:THREE.DoubleSide});
 const spriteM=new THREE.SpriteMaterial({map:tex,color:0xf0f4f6,transparent:true,opacity:.3,depthWrite:false});
 reseed(84019);const L=[];
 const place=(kind,x,z,lift,sz,op)=>{const h=FC.at(FC.a.h,x,z);let o;
  if(kind==='sheet'){o=new THREE.Mesh(new THREE.PlaneGeometry(rr(100,240),rr(50,120)),sheetM);o.rotation.x=-Math.PI/2;o.rotation.z=rr(0,TAU);}
  else{o=new THREE.Sprite(spriteM.clone());if(op!=null)o.material.opacity=op;const s=sz||rr(60,160);o.scale.set(s,s*rr(.4,.7),1);}
  o.position.set(x,Math.max(h,waterH(x,z))+lift,z);o.userData.probeSkip=true;o.renderOrder=3;scene.add(o);L.push({o,ax:x,az:z,lift,ph:rr(0,TAU),sp:rr(.01,.03),amp:rr(10,40)});};
 // morning mist on the pools: low sheets
 POOLS.forEach(P=>{for(let k=0,m=Math.round(P.r/80);k<m;k++)place('sheet',P.x+rr(-P.r*.6,P.r*.6),P.z+rr(-P.r*.5,P.r*.5),rr(1.5,4));});
 // a few drifting along the floor in the shade
 for(let k=0;k<10;k++){const x=rr(-2300,1800),z=axisZ(x)+rr(-380,380);place('sprite',x,z,rr(3,12),rr(90,200),.14);}
 tick((dt,t)=>{for(const m of L){const x=m.ax+Math.sin(t*m.sp+m.ph)*m.amp,z=m.az+Math.cos(t*m.sp*.7+m.ph)*m.amp*.6;m.o.position.x=x;m.o.position.z=z;m.o.position.y=Math.max(FC.at(FC.a.h,x,z),waterH(x,z))+m.lift;}});
 return{L,sheetM,spriteM};})();
