// ================================================================= WATER - drawing: the CDLOD water mesh, the open-water material, the GLSL
// [draw] + [G shader]. Needs core/atmos (0-core, 0p-presets, a-waves; b-skylight for the sky in the water) bound with
// ATMOS.init before WATER.draw, and three.js r128. Nothing here runs at load time: a build may list it and never call it.
//
// WATER.draw(S, o) draws an open surface S (20-core-water.js) as ONE instanced mesh:
//  * THE CDLOD MESH (WATER.md section 3 item 1): every node is the same 17x17 grid, instanced; WATER.cdlod picks the nodes
//    each render, for the camera that is rendering (scene.onBeforeRender): a quadtree from a root snapped to the camera
//    (32 km at 13 levels), a node split while the camera is within range*size/2 of it, down to 8 m leaves (0.5 m between
//    vertices), and nodes out of the view dropped. In the vertex shader each vertex morphs toward the next coarser level
//    over the last 15% of its node's range, so levels meet without cracks and nothing pops. The mesh is fine where the
//    camera is, wherever the camera is: a wave is displaced as far as the mesh can carry it (k * spacing < PRESETS.open.lod)
//    and shaded per pixel beyond (no "fades past 600 m").
//  * THE SURFACE: the trochoids plus the shared wave field (#include <atmos_waves>) on one clock (atmWaveT, whole cycles),
//    the vertex at wtrSurface(rest point), the fragment's normal from the trochoids' frame at the rest point plus the field's
//    slope at the moved point (wtrNormal); the CPU twins in 20 compute the same numbers (test-water.js runs this GLSL).
//  * THE SKY IN IT: a MeshStandardMaterial whose environment is ATMOS.skyEnv (b-skylight's capture of the build's own sky):
//    WATER takes the map when it arrives and again when it is recaptured. A build that wants the sky on its water only
//    passes skylight a holder (`scene: {}`) instead of its scene (kits/ringsea does).
//  * FOAM: whitecaps from the trochoids' Jacobian with a 1.8 s decay (WATER.PRESETS.foam), broken by a noise fixed to the
//    water (rest-point space, so it rides the orbits and needs no clock); with a bed, the shallows' tint and a surf lap.
// o: {THREE, scene (default ATMOS's), color, roughness, metalness, envMapIntensity, normalMap + detailSize m + detailCycles
//    [x,z] (a detail normal map scrolled whole cycles per period), normalScale, transparent, shallow, deep (colours with a bed),
//    surf (cycles of the surf lap per period), renderOrder, name}
// -> {mesh, material, uniforms, update(camera), count()} ; mesh.userData.probeSkip and lodSkip, its raycast is off (a build keeps its own
// flat pick plane), name 'water:<name>'.
// WATER.shaderOn(S, sh) gives another material (a wake, a buoy's ring) the surface's uniforms and returns the chunk to inject,
// with wtrHeight(xz) (the height at a world point, 3 Newton steps) for anything drawn on the water.
(function(){const W=WATER;
 const glf=v=>{const q=String(+v);return/[.e]/.test(q)?q:q+'.0';},v3=a=>'vec3('+a.map(glf).join(',')+')';
 const AT=()=>typeof ATMOS!=='undefined'?ATMOS:null;
 // ---- the CDLOD selection (data: no THREE): fills out with [x0, z0, size, level] per node, returns the count.
 // cam [x,y,z]; level the surface's height; inView(x0,z0,size) false drops a node and its children (null: keep all)
 W.cdlod=(cam,level,inView,out,C)=>{C=C||W.PRESETS.cdlod;const root=C.leaf*Math.pow(2,C.levels-1),half=root/2,max=out?out.length/4:C.maxNodes,
   cx=Math.round(cam[0]/half)*half,cz=Math.round(cam[2]/half)*half,dy=cam[1]-level;let n=0;W.cdlodDropped=0;
  const dist=(x0,z0,s)=>{const dx=Math.max(x0-cam[0],0,cam[0]-x0-s),dz=Math.max(z0-cam[2],0,cam[2]-z0-s);return Math.sqrt(dx*dx+dy*dy+dz*dz);};
  const go=(x0,z0,s,l)=>{if(inView&&!inView(x0,z0,s))return;
   if(l>0&&dist(x0,z0,s)<C.range*s/2){const h=s/2;go(x0,z0,h,l-1);go(x0+h,z0,h,l-1);go(x0,z0+h,h,l-1);go(x0+h,z0+h,h,l-1);return;}
   if(n>=max){W.cdlodDropped++;return;}if(out){out[n*4]=x0;out[n*4+1]=z0;out[n*4+2]=s;out[n*4+3]=l;}n++;};
  go(cx-half,cz-half,root,C.levels-1);return n;};
 // the vertex's morph on the CPU (the shader's wtrMorph): [x, z, spacing]
 W.cdlodMorph=(g,node,cam,level,C)=>{C=C||W.PRESETS.cdlod;let x=node[0]+g[0]*node[2],z=node[1]+g[1]*node[2];const d=Math.hypot(cam[0]-x,cam[1]-level,cam[2]-z),e=C.range*node[2],s=e*C.morph,
   m=Math.min(1,Math.max(0,(d-s)/(e-s)));x-=W.fr(g[0]*C.grid*.5)*2/C.grid*node[2]*m;z-=W.fr(g[1]*C.grid*.5)*2/C.grid*node[2]*m;return[x,z,node[2]/C.grid*(1+m)];};

 // ---- THE CHUNK for surface S: functions and its uniforms, the same text in both stages (after #include <atmos_waves>)
 W.glsl=S=>{const P=W.PRESETS,F=P.foam,B=P.bed,C=P.cdlod,A=AT(),f=glf,L=S.lod,X=S.px,wv=S.waves;
  const field=S.field&&A?S.field:0,tilt=A?S.tilt*A.PRESETS.waves.tilt:0,K=w=>v3([w.tx,w.tz,w.tc]);
  const o=['uniform float wtrLevel;uniform float wtrBase;'+(S.bed?'uniform sampler2D wtrBed;':''),
   'float wtrPh(vec2 p,vec3 k,float ph,float t){return 6.283185307*(fract(p.x*k.x)+fract(p.y*k.y)-fract(t*k.z))+ph;}',
   // displacement of the rest point p (vertex): (dx, h, dz), each trochoid faded by k*sp
   'vec3 wtrTroD(vec2 p,float sp){vec3 r=vec3(0.0);float a;float l;'+wv.map(w=>'a=wtrPh(p,'+K(w)+','+f(w.ph)+',atmWaveT);l=1.0-smoothstep('+f(L[0])+','+f(L[1])+','+f(w.k)+'*sp);'+
    'r+=vec3(cos(a)*'+f(w.H*w.dx)+',sin(a)*'+f(w.A)+',cos(a)*'+f(w.H*w.dz)+')*l;').join('')+'return r;}',
   // the frame at the rest point (fragment): normal and Jacobian determinant, each trochoid faded by k*mpp
   'vec4 wtrTroNJ(vec2 p,float mpp,float t){vec3 gx=vec3(1.0,0.0,0.0);vec3 gz=vec3(0.0,0.0,1.0);float a;float c;float s;float l;float q;'+wv.map(w=>'a=wtrPh(p,'+K(w)+','+f(w.ph)+',t);c=cos(a);s=sin(a);'+
    'l=1.0-smoothstep('+f(X[0])+','+f(X[1])+','+f(w.k)+'*mpp);q='+f(w.H*w.k)+'*s*l;gx+=vec3(-q*'+f(w.dx*w.dx)+',c*'+f(w.A*w.k*w.dx)+'*l,-q*'+f(w.dx*w.dz)+');'+
    'gz+=vec3(-q*'+f(w.dx*w.dz)+',c*'+f(w.A*w.k*w.dz)+'*l,-q*'+f(w.dz*w.dz)+');').join('')+'return vec4(normalize(cross(gz,gx)),gx.x*gz.z-gx.z*gz.x);}',
   // the horizontal map's Jacobian (jxx, jxz, jzz) alone: the foam's past taps and the Newton steps
   'vec3 wtrTroJv(vec2 p,float mpp,float t){vec3 j=vec3(1.0,0.0,1.0);float q;'+wv.map(w=>'q='+f(w.H*w.k)+'*sin(wtrPh(p,'+K(w)+','+f(w.ph)+',t))*(1.0-smoothstep('+f(X[0])+','+f(X[1])+','+f(w.k)+'*mpp));'+
    'j-=q*vec3('+f(w.dx*w.dx)+','+f(w.dx*w.dz)+','+f(w.dz*w.dz)+');').join('')+'return j;}',
   'float wtrCap(float j){return 1.0-smoothstep('+f(F.j[0])+','+f(F.j[1])+',j);}',
   'float wtrFoam(vec2 p,float mpp,float j0){float f=wtrCap(j0);vec3 j;'+Array.from({length:F.taps-1},(_,i)=>'j=wtrTroJv(p,mpp,atmWaveT-'+f((i+1)*F.step)+');f=max(f,wtrCap(j.x*j.z-j.y*j.y)*'+f(Math.exp(-(i+1)*F.step/F.decay))+');').join('')+'return f;}',
   // the bed (20's bakeBed): depth below the surface, and the calm it gives the shallows
   S.bed?'float wtrBedDecode(vec2 c){return (c.y>0.004&&c.y<0.996)?'+f(B.fine[0])+'+c.y*'+f(B.fine[1]-B.fine[0])+':'+f(B.deep[0])+'+c.x*c.x*'+f(B.deep[1]-B.deep[0])+';}'+
    // a shore grid's A channel: the depth linear over PRESETS.shore.mid, the deep channel past it (21's bedDecodeShore)
    (S.shore?'float wtrBedDecode4(vec4 c){return c.w<0.996?'+f(W.PRESETS.shore.mid[0])+'+c.w*'+f(W.PRESETS.shore.mid[1]-W.PRESETS.shore.mid[0])+':'+f(B.deep[0])+'+c.x*c.x*'+f(B.deep[1]-B.deep[0])+';}':'')+
    'float wtrDepth(vec2 p){vec2 uv=(p-vec2('+f(S.bed.x0)+','+f(S.bed.z0)+'))*vec2('+f(1/(S.bed.cell*S.bed.nx))+','+f(1/(S.bed.cell*S.bed.nz))+');'+
    'if(uv.x<0.0||uv.y<0.0||uv.x>1.0||uv.y>1.0)return wtrLevel-wtrBase+'+f(B.deep[1])+';return wtrLevel-wtrBase+'+(S.shore?'wtrBedDecode4(texture2D(wtrBed,uv))':'wtrBedDecode(texture2D(wtrBed,uv).xy)')+';}'+
    (S.shore?W.shoreGLSL(S):'float wtrDamp(vec2 p){return smoothstep(0.0,'+f(S.dampDepth)+',wtrDepth(p));}')
    :'float wtrDepth(vec2 p){return 1.0e9;}float wtrDamp(vec2 p){return 1.0;}',
   // the drawn surface at rest point p0 with vertex spacing sp: (x, y, z, damping)
   'vec4 wtrSurface(vec2 p0,float sp){vec3 d=wtrTroD(p0,sp);float m=wtrDamp(p0);vec2 p=p0+d.xz*m;float h=d.y;'+
    (field?'h+='+f(field)+'*atmWaveHeight(p,'+f(S.chop)+'*(1.0-smoothstep('+f(L[0])+','+f(L[1])+','+f(S.kChop)+'*sp)));':'')+'return vec4(p.x,wtrLevel+h*m'+(S.shore?'+wtrSurf(p)':'')+',p.y,m);}',
   // the height at a WORLD point (three Newton steps back to the rest point): wakes and anything drawn on the water
   'float wtrHeight(vec2 p){vec2 p0=p;vec3 d;vec3 j;vec2 r;float m;float a;float b;float c;'+(wv.length?[0,1,2].map(()=>'d=wtrTroD(p0,0.0);j=wtrTroJv(p0,0.0,atmWaveT);m=wtrDamp(p0);'+
    'a=1.0+(j.x-1.0)*m;b=j.y*m;c=1.0+(j.z-1.0)*m;r=p0+d.xz*m-p;p0-=vec2(c*r.x-b*r.y,a*r.y-b*r.x)/(a*c-b*b);').join(''):'')+'return wtrSurface(p0,0.0).y;}',
   // the shading normal: the trochoids' frame plus the field's slope (tilted), calmed by the damping
   'vec3 wtrNormal(vec4 nj,vec2 p,float d,float m){vec2 s=-nj.xz/nj.y;'+(field?'s+=atmWaveSlope(p,d).xy*'+f(field*tilt)+';':'')+'s*=m;'+(S.shore?'s+=wtrSurfSlope(p);':'')+'return normalize(vec3(-s.x,1.0,-s.y));}',
   // the CDLOD morph of grid point g (0..1) in node n (x0, z0, size, level): (x, z, vertex spacing)
   'vec3 wtrMorph(vec2 g,vec4 n){vec2 w=n.xy+g*n.z;float d=distance(cameraPosition,vec3(w.x,wtrLevel,w.y));float e='+f(C.range)+'*n.z;float s=e*'+f(C.morph)+';'+
    'float m=clamp((d-s)/(e-s),0.0,1.0);w-=fract(g*'+f(C.grid*.5)+')*'+f(2/C.grid)+'*n.z*m;return vec3(w,n.z*'+f(1/C.grid)+'*(1.0+m));}'];
  return o.join('\n');};

 // ---- a shore grid's functions (21-core-water-shore.js's twins): the damping with Green's shoaling, the signed shore
 // distance from the bed texture's B channel, the breakers' height, slope and foam, the beach's wetness
 W.shoreGLSL=S=>{const f=glf,G=S.bed,Q=W.PRESETS.shore,H=Q.shoal,U=Q.surf,E=Q.wet,per=W.period(),n=W.surfCycles();
  return['float wtrShoalK(float d){return d>='+f(H.depth)+'?1.0:min('+f(H.max)+',pow('+f(H.depth)+'/max(d,'+f(H.min)+'),0.25));}',
   'float wtrDamp(vec2 p){float d=wtrDepth(p);return smoothstep(0.0,'+f(S.dampDepth)+',d)*wtrShoalK(d);}',
   'float wtrShoreDist(vec2 p){vec2 uv=(p-vec2('+f(G.x0)+','+f(G.z0)+'))*vec2('+f(1/(G.cell*G.nx))+','+f(1/(G.cell*G.nz))+');'+
    'if(uv.x<0.0||uv.y<0.0||uv.x>1.0||uv.y>1.0)return '+f(G.band)+';return (texture2D(wtrBed,uv).z-0.5)*'+f(2*G.band)+';}',
   'bool wtrWet(vec2 p){return wtrShoreDist(p)>'+f(-G.clip*G.cell)+';}',
   'float wtrSurfPh(float d){return 6.283185307*(fract(d*'+f(1/U.lambda)+')+fract(atmWaveT*'+f(n/per)+'));}',
   'float wtrSurfEnv(float d,float dp){return smoothstep('+f(G.band)+','+f(G.band*(1-U.born))+',d)*smoothstep('+f(U.depth[1])+','+f(U.depth[0])+',dp);}',
   'float wtrSurfBrk(float dp){return 1.0-smoothstep('+f(U.depth[0]*.4)+','+f(U.depth[0])+',dp);}',
   'float wtrSurf(vec2 p){float d=wtrShoreDist(p);float dp=wtrDepth(p);float e=wtrSurfEnv(d,dp);float a=wtrSurfPh(d);'+
    'return '+f(U.amp)+'*e*wtrShoalK(dp)*(sin(a)+'+f(U.skew)+'*wtrSurfBrk(dp)*sin(2.0*a));}',
   'vec2 wtrSurfSlope(vec2 p){return vec2(wtrSurf(p+vec2('+f(U.h)+',0.0))-wtrSurf(p-vec2('+f(U.h)+',0.0)),wtrSurf(p+vec2(0.0,'+f(U.h)+'))-wtrSurf(p-vec2(0.0,'+f(U.h)+')))*'+f(1/(2*U.h))+';}',
   'float wtrSurfFoam(vec2 p){float d=wtrShoreDist(p);float dp=wtrDepth(p);float e=wtrSurfEnv(d,dp);float a=wtrSurfPh(d);'+
    'float pr=(sin(a)+'+f(U.skew)+'*sin(2.0*a))*'+f(1/(1+U.skew))+';return '+f(U.foam)+'*wtrSurfBrk(dp)*smoothstep(0.15,0.85,pr)*smoothstep(0.0,0.25,e);}',
   // the beach (the ground's shader): (wet, film) for ground at height gy; the swash runs up and back once per breaker
   'vec2 wtrWetGround(vec2 p,float gy){float d=wtrShoreDist(p);float r=gy-wtrLevel;if(d<'+f(-E.band)+'||r>'+f(E.runup)+')return vec2(0.0);'+
    'float sw='+f(E.runup)+'*(0.2+0.8*(0.5+0.5*sin(6.283185307*fract(atmWaveT*'+f(n/per)+')-0.6)));'+
    'return vec2(smoothstep('+f(E.runup)+','+f(E.runup*.25)+',r)*smoothstep('+f(-E.band)+','+f(-E.band*.6)+',d),r<0.0?0.0:smoothstep(sw,sw-0.12,r));}'].join('');};

 // ---- the uniforms a surface's shaders share (one set per surface: the drawn mesh, its wakes)
 W.uniformsOf=S=>{if(S.U)return S.U;const A=AT(),T=A.T;S.U={wtrLevel:{value:S.levelAt(A.clock?A.clock.t:0)},wtrBase:{value:S.base}};
  if(S.bed){const B=S.bed,tx=new T.DataTexture(B.data,B.nx,B.nz,T.RGBAFormat,T.UnsignedByteType);tx.minFilter=tx.magFilter=T.LinearFilter;tx.wrapS=tx.wrapT=T.ClampToEdgeWrapping;
   tx.generateMipmaps=false;tx.flipY=false;tx.needsUpdate=true;S.U.wtrBed={value:tx};}
  A.hook(t=>{S.U.wtrLevel.value=S.levelAt(t);});return S.U;};
 W.shaderOn=(S,sh)=>{ATMOS.waveUniforms(sh.uniforms);Object.assign(sh.uniforms,W.uniformsOf(S));return'#include <atmos_waves>\n'+W.glsl(S)+'\n';};

 W.drawn=[];
 W.draw=(S,o)=>{o=o||{};const A=ATMOS,T=o.THREE||A.T,scene=o.scene||A.h.scene,C=W.PRESETS.cdlod,F=W.PRESETS.foam,f=glf,N=C.grid;
  // the node: (N+1)^2 vertices on [0,1]^2 in x,z
  const pos=[],uv=[],idx=[];for(let j=0;j<=N;j++)for(let i=0;i<=N;i++){pos.push(i/N,0,j/N);uv.push(i/N,j/N);}
  // one diagonal direction everywhere: a node fully morphed is then exactly the next level's triangles (no flip when it swaps)
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=j*(N+1)+i,b=a+N+1;idx.push(a,b,b+1,a,b+1,a+1);}
  const g=new T.InstancedBufferGeometry();g.setIndex(idx);g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
  const nodes=new Float32Array(C.maxNodes*4),na=new T.InstancedBufferAttribute(nodes,4);na.setUsage(T.DynamicDrawUsage);g.setAttribute('wtrNode',na);g.instanceCount=0;
  const mat=new T.MeshStandardMaterial({color:o.color==null?0x06222e:o.color,roughness:o.roughness==null?.2:o.roughness,metalness:o.metalness==null?.2:o.metalness,
   normalMap:o.normalMap||null,transparent:!!o.transparent,depthWrite:!o.transparent});
  if(o.normalMap)mat.normalScale.set(o.normalScale==null?.5:o.normalScale,o.normalScale==null?.5:o.normalScale);
  if(o.envMapIntensity!=null)mat.envMapIntensity=o.envMapIntensity;
  const U=W.uniformsOf(S),col=c=>v3(c),lin=c=>{const q=new T.Color(c);return[q.r,q.g,q.b];};
  const per=W.period(),dc=o.detailCycles||[3,2],surf=o.surf==null?153:o.surf;
  const fragColor=['float wtrMpp=max(length(fwidth(vWtrP0)),1.0e-4);vec4 wtrNJ=wtrTroNJ(vWtrP0,wtrMpp,atmWaveT);',
   'vec3 wtrN=wtrNormal(wtrNJ,vWtrP,distance(cameraPosition,vec3(vWtrP.x,wtrLevel,vWtrP.y)),vWtrDamp);float wtrDp=wtrDepth(vWtrP);',
   'float wtrFoamK='+f(F.amount)+'*wtrFoam(vWtrP0,wtrMpp,wtrNJ.w)*smoothstep(0.55,0.85,wtrNoise(vWtrP0*'+f(F.noise[0])+')*0.55+wtrNoise(vWtrP0*'+f(F.noise[1])+')*0.45)*mix(1.0,0.45,smoothstep(1.0,6.0,wtrMpp))*vWtrDamp;',
   S.bed?'diffuseColor.rgb=mix('+col(lin(o.shallow==null?0x2a524d:o.shallow))+','+col(lin(o.deep==null?0x0d2c30:o.deep))+',smoothstep(0.5,9.0,wtrDp));'+
    'wtrFoamK=max(wtrFoamK,0.55*(1.0-smoothstep(0.1,1.4,wtrDp))*(0.5+0.5*sin(wtrDp*5.0-6.283185307*fract(atmWaveT*'+f(surf/per)+')+sin(vWtrP.x*0.05)*2.0)));':'',
   o.transparent?'diffuseColor.a*=mix(0.86,0.97,smoothstep(0.0,2.0,wtrDp))*smoothstep(-0.1,0.15,wtrDp);':'',
   S.bounds?'if(vWtrP.x<'+f(S.bounds[0])+'||vWtrP.y<'+f(S.bounds[1])+'||vWtrP.x>'+f(S.bounds[2])+'||vWtrP.y>'+f(S.bounds[3])+')discard;':'',
   S.shore?'if(!wtrWet(vWtrP))discard;wtrFoamK=max(wtrFoamK,wtrSurfFoam(vWtrP));':'',
   'diffuseColor.rgb=mix(diffuseColor.rgb,'+col(F.color)+',wtrFoamK);'].join('\n');
  const VARY='varying vec2 vWtrP0;varying vec2 vWtrP;varying float vWtrDamp;';
  mat.onBeforeCompile=sh=>{const CH=W.shaderOn(S,sh)+VARY;
   sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\n'+CH+'\nattribute vec4 wtrNode;')
    .replace('#include <beginnormal_vertex>','vec3 objectNormal=vec3(0.0,1.0,0.0);')
    .replace('#include <begin_vertex>','vec3 wtrM=wtrMorph(position.xz,wtrNode);vec4 wtrS=wtrSurface(wtrM.xy,wtrM.z);vWtrP0=wtrM.xy;vWtrP=wtrS.xz;vWtrDamp=wtrS.w;vec3 transformed=wtrS.xyz;'+
     (o.normalMap?'\n#ifdef USE_UV\nvUv=(uvTransform*vec3(wtrS.xz*'+f(1/(o.detailSize||46))+',1.0)).xy;\n#endif\n':''));
   sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+CH+'\n'+
     'float wtrHash(vec2 p){vec3 q=fract(vec3(p.xyx)*0.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}\n'+
     'float wtrNoise(vec2 p){vec2 i=floor(p);vec2 u=fract(p);u=u*u*(3.0-2.0*u);return mix(mix(wtrHash(i),wtrHash(i+vec2(1.0,0.0)),u.x),mix(wtrHash(i+vec2(0.0,1.0)),wtrHash(i+vec2(1.0,1.0)),u.x),u.y);}')
    .replace('#include <color_fragment>','#include <color_fragment>\n'+fragColor)
    .replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(roughnessFactor,0.85,wtrFoamK);')
    .replace('#include <metalnessmap_fragment>','#include <metalnessmap_fragment>\nmetalnessFactor*=1.0-wtrFoamK;')
    .replace('#include <normal_fragment_begin>','#include <normal_fragment_begin>\nnormal=normalize((viewMatrix*vec4(wtrN,0.0)).xyz);');};
  const mesh=new T.Mesh(g,mat);mesh.name='water:'+S.name;mesh.frustumCulled=false;mesh.raycast=()=>{};mesh.userData.probeSkip=true;mesh.userData.water=S.id;
  mesh.userData.lodSkip=true;   // the CDLOD mesh is its own level of detail: core/lod's pass must not take it (it would cull or copy the unit grid)
  if(o.renderOrder!=null)mesh.renderOrder=o.renderOrder;scene.add(mesh);
  // the nodes for the camera that is about to render (every render of the scene: the attribute uploads in that render)
  const fu=new T.Frustum(),pm=new T.Matrix4(),box=new T.Box3(),cam=[0,0,0],B=S.bounds;
  const inView=(x0,z0,s)=>{if(B&&(x0>B[2]||z0>B[3]||x0+s<B[0]||z0+s<B[1]))return false;if(S.shore&&!S.wetIn(x0,z0,x0+s,z0+s))return false;const lv=U.wtrLevel.value;box.min.set(x0,lv-S.amp,z0);box.max.set(x0+s,lv+S.amp,z0+s);return fu.intersectsBox(box);};
  const update=camera=>{pm.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);fu.setFromProjectionMatrix(pm);const e=camera.matrixWorld.elements;cam[0]=e[12];cam[1]=e[13];cam[2]=e[14];
   const n=W.cdlod(cam,U.wtrLevel.value,inView,nodes);g.instanceCount=n;na.updateRange.offset=0;na.updateRange.count=n*4;na.needsUpdate=true;D.nodes=n;};
  const prev=scene.onBeforeRender;scene.onBeforeRender=function(r,s,c,rt){if(prev)prev.call(this,r,s,c,rt);if(mesh.visible)update(c);};
  // the sky's light (b-skylight's capture) and the detail normals' scroll, on the module clock
  A.hook(()=>{const E=A.skyEnv,tx=E&&E.target&&E.target.texture;if(tx&&mat.envMap!==tx){mat.envMap=tx;mat.needsUpdate=true;}
   if(o.normalMap){const wt=A.U.waveTime.value;o.normalMap.offset.set(W.fr(wt*dc[0]/per),W.fr(wt*dc[1]/per));}});
  const D={S,mesh,material:mat,uniforms:U,update,nodes:0,count:()=>g.instanceCount};W.drawn.push(D);return D;};
})();
