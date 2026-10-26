// ================================================================= BIOME CORE — octahedral impostors (R6, 2026-10-26)
// [web] core/biome/34-core-impostor.js: opt-in (a build lists it after 20 and 30 in CORE_BIOME). biomes/DETAIL-RESEARCH.md
// item 3: a far tree drawn as ONE camera-facing quad that shows the species as it looks from the camera's direction, picked
// and blended from views baked once per species. It replaces the blob impostors where a kit asks for it.
//
// THE BAKE. BIO.impostor(key, build, opt) registers a species: build() puts ONE tree at the origin (its foot at 0,0,0) with
// the kit's own builders (BIO.put, BIO.tube, BIO.lathe...), into the kit current at the call. BIO.bakeImpostors(renderer),
// called by the host once after BIO.bake (the stores are empty then), builds each tree into a scratch scene, renders it
// from grid x grid directions over the upper hemisphere (a hemi-octahedral grid: views evenly spread, the top one straight
// down), each into its cell of two atlases: the colour under a flat white ambient (the albedo: map, vertex and instance
// colours, the kit's own shader hooks) and the normal (rgb, from the crown's bent normal aN where the item has one) with the
// coverage (alpha). The tree's draws are undone: its instances, triangles and charges leave no trace in the page, and the
// random numbers it draws come after every placement (call it last). opt: grid (8), cell (128 px: 1024 px atlases, 8 MB
// of the two at RGBA8), label, at ([x, y, z]: where build() puts the tree's foot when it builds it in place, on a real
// tree's spot so its roots meet the ground; default the origin).
//
// THE DRAW. BIO.impostorItem(name, imp, opt) defines an instanced item (BIO.def: a unit quad, the impostor's material) that
// the kit puts in place of a blob: BIO.put(name, [x, y, z], qEuler(0, yaw, 0), scale, colour), scale relative to the baked
// tree, colour a tint (white: as baked). Its vertex shader turns the quad to the camera at the tree's centre, finds the
// three baked views nearest the camera's direction (in the tree's own frame, so its yaw turns it), and projects the quad onto
// each view's plane; the fragment blends the three by their weights and coverage, cuts at half coverage and lights the
// blended normal by the scene's sun, ambient and hemisphere lights (read each frame from the scene), with the scene's fog.
// The quad takes the item's runtime LOD keys like any item (BIO.range, minRange) and BIO.LOD.fade (34 is a ShaderMaterial
// without a GLSL version: BIO.lodFade wraps it).
//
// GODOT: the atlases are DataTextures (an exporter writes them as PNGs: userData.bio {kind:'impostor', key, opts}); the
// same quad, the same hemi-octahedral decode and three-view blend in a `far.gdshader` on a MultiMesh (SIsilicon's
// Octahedral Impostors addon uses the same layout: grid x grid hemi-octahedral views, colour + normal atlases). The bake
// itself is browser-side ([web]); a Godot port reads the baked atlases rather than baking again.
(function(){const T=()=>BIO.host.THREE;
const IMP=BIO.IMP={list:[],grid:8,cell:128};
// a direction (x, y >= 0, z) from the grid's uv in [0,1]^2, and back: the hemi-octahedral map
function dec(u,v){const tx=u*2-1,ty=v*2-1,px=(tx+ty)*.5,pz=(tx-ty)*.5,y=1-Math.abs(px)-Math.abs(pz),l=Math.hypot(px,y,pz)||1;return [px/l,y/l,pz/l];}
function enc(d){const s=Math.abs(d[0])+Math.abs(d[1])+Math.abs(d[2])||1,px=d[0]/s,pz=d[2]/s;return [(px+pz)*.5+.5,(px-pz)*.5+.5];}
// a view's screen axes (right, up) for a direction d from the tree toward the eye: the same in the bake and the shader
function basis(d){const up=Math.abs(d[1])>.999?[0,0,-1]:[0,1,0];
 let r=[up[1]*d[2]-up[2]*d[1],up[2]*d[0]-up[0]*d[2],up[0]*d[1]-up[1]*d[0]];const l=Math.hypot(r[0],r[1],r[2])||1;r=r.map(c=>c/l);
 const u=[d[1]*r[2]-d[2]*r[1],d[2]*r[0]-d[0]*r[2],d[0]*r[1]-d[1]*r[0]];return {r,u};}
IMP.dec=dec;IMP.enc=enc;IMP.basis=basis;

const GLSL_FN=[
 'vec3 impDec(vec2 uv){vec2 t=uv*2.0-1.0;vec2 p=vec2(t.x+t.y,t.x-t.y)*0.5;return normalize(vec3(p.x,1.0-abs(p.x)-abs(p.y),p.y));}',
 'vec2 impEnc(vec3 d){d/=(abs(d.x)+abs(d.y)+abs(d.z));return vec2(d.x+d.z,d.x-d.z)*0.5+0.5;}',
 'void impBasis(vec3 d,out vec3 r,out vec3 u){vec3 up=abs(d.y)>0.999?vec3(0.0,0.0,-1.0):vec3(0.0,1.0,0.0);r=normalize(cross(up,d));u=cross(d,r);}'].join('\n');
const VERT=['uniform float uN;','uniform float uR;','uniform vec3 uC;',
 'varying vec4 vF0;','varying vec4 vF1;','varying vec4 vF2;','varying vec3 vW;','varying vec3 vR0;','varying vec3 vR1;','varying vec3 vR2;','varying vec3 vTint;',
 '#include <fog_pars_vertex>',GLSL_FN,
 'vec4 impFrame(vec2 k,vec3 q,vec3 d){vec3 dk=impDec(k/(uN-1.0)),rk,uk;impBasis(dk,rk,uk);vec3 Q=q-d*(dot(q,dk)/max(dot(d,dk),1e-3));vec2 ab=vec2(dot(Q,rk),dot(Q,uk));',
 ' return vec4((k+ab*0.5+0.5)/uN,ab);}',
 'void main(){',
 '#ifdef USE_INSTANCING',
 ' mat4 IM=instanceMatrix;',
 '#else',
 ' mat4 IM=mat4(1.0);',
 '#endif',
 ' vec3 c0=IM[0].xyz,c1=IM[1].xyz,c2=IM[2].xyz;float s=max(length(c0),max(length(c1),length(c2)));c0=normalize(c0);c1=normalize(c1);c2=normalize(c2);',
 ' vR0=c0;vR1=c1;vR2=c2;',
 ' vec3 O=(modelMatrix*vec4(IM[3].xyz+(c0*uC.x+c1*uC.y+c2*uC.z)*s,1.0)).xyz;',
 ' vec3 dw=normalize(cameraPosition-O),d=vec3(dot(c0,dw),dot(c1,dw),dot(c2,dw));d.y=max(d.y,0.0);d=normalize(d);',
 ' vec3 r,u;impBasis(d,r,u);vec3 q=r*position.x+u*position.y;',
 ' vec2 g=clamp(impEnc(d)*(uN-1.0),0.0,uN-1.0),b=min(floor(g),uN-2.0),f=g-b;',
 ' if(f.x+f.y<1.0){vW=vec3(1.0-f.x-f.y,f.x,f.y);vF0=impFrame(b,q,d);vF1=impFrame(b+vec2(1.0,0.0),q,d);vF2=impFrame(b+vec2(0.0,1.0),q,d);}',
 ' else{vW=vec3(f.x+f.y-1.0,1.0-f.y,1.0-f.x);vF0=impFrame(b+vec2(1.0),q,d);vF1=impFrame(b+vec2(1.0,0.0),q,d);vF2=impFrame(b+vec2(0.0,1.0),q,d);}',
 '#ifdef USE_INSTANCING_COLOR',
 ' vTint=instanceColor;',
 '#else',
 ' vTint=vec3(1.0);',
 '#endif',
 ' vec3 P=O+(c0*q.x+c1*q.y+c2*q.z)*uR*s;',
 ' vec4 mvPosition=viewMatrix*vec4(P,1.0);gl_Position=projectionMatrix*mvPosition;',
 ' #include <fog_vertex>',
 '}'].join('\n');
const FRAG=['uniform sampler2D uAtlas;','uniform sampler2D uNorm;','uniform vec3 uSun;','uniform vec3 uSunCol;','uniform vec3 uAmb;','uniform vec3 uSky;','uniform vec3 uGround;',
 'varying vec4 vF0;','varying vec4 vF1;','varying vec4 vF2;','varying vec3 vW;','varying vec3 vR0;','varying vec3 vR1;','varying vec3 vR2;','varying vec3 vTint;',
 '#include <fog_pars_fragment>',
 'void impTap(vec4 F,float w,inout vec3 c,inout vec3 n,inout float a){if(w<=0.0||abs(F.z)>1.0||abs(F.w)>1.0)return;vec4 C=texture2D(uAtlas,F.xy),N=texture2D(uNorm,F.xy);',
 ' c+=w*C.rgb;n+=w*N.a*(N.rgb*2.0-1.0);a+=w*N.a;}',
 'void main(){vec3 c=vec3(0.0),n=vec3(0.0);float a=0.0;impTap(vF0,vW.x,c,n,a);impTap(vF1,vW.y,c,n,a);impTap(vF2,vW.z,c,n,a);',
 ' float W=vW.x+vW.y+vW.z;if(a<0.5*W)discard;c/=max(a,1e-4);',
 ' vec3 nl=normalize(n+vec3(0.0,1e-4,0.0)),nw=normalize(vR0*nl.x+vR1*nl.y+vR2*nl.z);',
 ' vec3 L=uAmb+mix(uGround,uSky,nw.y*0.5+0.5)+uSunCol*max(dot(nw,uSun),0.0);',
 ' gl_FragColor=vec4(c*vTint*L,1.0);',
 ' #include <tonemapping_fragment>',
 ' #include <encodings_fragment>',
 ' #include <fog_fragment>',
 '}'].join('\n');
IMP.GLSL={fn:GLSL_FN,vertex:VERT,fragment:FRAG};

// the scene's lights, as the impostors' uniforms (refreshed every frame by a tick, once any impostor exists)
const LU={uSun:{value:null},uSunCol:{value:null},uAmb:{value:null},uSky:{value:null},uGround:{value:null}};
function readLights(){const TH=T(),sc=BIO.host.scene;if(!LU.uSun.value){LU.uSun.value=new TH.Vector3(0,1,0);LU.uSunCol.value=new TH.Color(0);LU.uAmb.value=new TH.Color(0);LU.uSky.value=new TH.Color(0);LU.uGround.value=new TH.Color(0);}
 if(!sc)return;let sun=null;const amb=LU.uAmb.value.setRGB(0,0,0),sky=LU.uSky.value.setRGB(0,0,0),gr=LU.uGround.value.setRGB(0,0,0);
 sc.traverseVisible(o=>{if(!o.isLight)return;
  if(o.isDirectionalLight&&!sun)sun=o;
  else if(o.isAmbientLight){amb.r+=o.color.r*o.intensity;amb.g+=o.color.g*o.intensity;amb.b+=o.color.b*o.intensity;}
  else if(o.isHemisphereLight){sky.r+=o.color.r*o.intensity;sky.g+=o.color.g*o.intensity;sky.b+=o.color.b*o.intensity;gr.r+=o.groundColor.r*o.intensity;gr.g+=o.groundColor.g*o.intensity;gr.b+=o.groundColor.b*o.intensity;}});
 if(sun){const p=new TH.Vector3().setFromMatrixPosition(sun.matrixWorld),t=new TH.Vector3().setFromMatrixPosition(sun.target.matrixWorld);LU.uSun.value.copy(p.sub(t).normalize());LU.uSunCol.value.copy(sun.color).multiplyScalar(sun.intensity);}
 else LU.uSunCol.value.setRGB(0,0,0);}
IMP.readLights=readLights;let ticking=false;

// a species to bake: returns {key, mat, ready, radius, centre}
BIO.impostor=function(key,build,opt){opt=opt||{};const TH=T(),N=opt.grid==null?IMP.grid:opt.grid,px=opt.cell==null?IMP.cell:opt.cell;
 if(typeof build!=='function'){BIO.err('BIO.impostor: '+key+': no build function');return null;}
 if(!(N>=2)){BIO.err('BIO.impostor: '+key+': grid under 2');return null;}
 readLights();
 const blank=new TH.DataTexture(new Uint8Array(4),1,1,TH.RGBAFormat);blank.needsUpdate=true;
 const mat=new TH.ShaderMaterial({uniforms:Object.assign(TH.UniformsUtils.clone(TH.UniformsLib.fog),{uAtlas:{value:blank},uNorm:{value:blank},uN:{value:N},uR:{value:1},uC:{value:new TH.Vector3()}},LU),   /* LU: the shared light uniforms, by reference */
  vertexShader:VERT,fragmentShader:FRAG,fog:true,side:TH.DoubleSide});
 mat.userData.bio={kind:'impostor',key:BIO.kitKey(key),opts:{grid:N,cell:px}};
 const rec={key,kit:BIO.kitName||'',build,N,px,mat,ready:false,radius:1,centre:[0,0,0],at:opt.at||[0,0,0],label:opt.label||key};
 IMP.list.push(rec);
 if(!ticking&&BIO.host.ticks){ticking=true;BIO.tick(readLights);}
 return rec;};
// the item a kit puts in place of a far tree
BIO.impostorItem=function(name,imp,opt){opt=opt||{};if(!imp||!imp.mat){BIO.err('BIO.impostorItem: '+name+': no impostor');return;}
 BIO.def(name,new (T().PlaneGeometry)(2,2),imp.mat,{label:opt.label||imp.label,cls:opt.cls||'flora',kind:opt.kind||null,tags:opt.tags||null});};

// one kit's stores as meshes in a scratch group (bake's work, for the capture: nothing is charged, tagged or kept)
function scratchMeshes(R){const TH=T(),G=new TH.Group();
 for(const name of R.order){const it=R.items[name];if(!it.count)continue;const def=R.defs[name],n=it.count,geo=def.geo.clone();
  if(it.n.length)geo.setAttribute('aN',new TH.InstancedBufferAttribute(it.n.a.slice(0,n*3),3));
  if(it.c2.length)geo.setAttribute('aC2',new TH.InstancedBufferAttribute(it.c2.a.slice(0,n*3),3));
  for(const a in it.x)geo.setAttribute(a,new TH.InstancedBufferAttribute(it.x[a].a.slice(0,n*4),4));
  const im=new TH.InstancedMesh(geo,def.mat,n);im.instanceMatrix.array.set(it.m.a.subarray(0,n*16));im.instanceColor=new TH.InstancedBufferAttribute(it.c.a.slice(0,n*3),3);
  im.frustumCulled=false;G.add(im);R.items[name]=BIO._newItem(def.attrs);}
 for(const fam in R.buckets){const K=R.buckets[fam];if(!K.pos.length)continue;const L=K.pos.length;
  const g=BIO.indexedGeo(TH,K.pos.a.subarray(0,L),K.nor.a.subarray(0,L),K.uv.a.subarray(0,L/3*2),K.col.a.subarray(0,L));
  const m=new TH.Mesh(g,K.mat);m.frustumCulled=false;G.add(m);
  K.pos=new BIO.F32();K.nor=new BIO.F32();K.uv=new BIO.F32();K.col=new BIO.F32();K.k=[];K.tris=0;}
 return G;}
// the box of a scratch group, instances included
function boxOf(G){const TH=T(),B=new TH.Box3(),b=new TH.Box3(),M=new TH.Matrix4();
 G.children.forEach(m=>{const g=m.geometry;if(!g.boundingBox)g.computeBoundingBox();
  if(m.isInstancedMesh)for(let i=0;i<m.count;i++){m.getMatrixAt(i,M);b.copy(g.boundingBox).applyMatrix4(M);B.union(b);}else B.union(g.boundingBox);});
 return B;}
// the normal pass's material for a source material: its map's alpha and alpha test, its sides; the bent normal aN if any
const NV=['varying vec3 vN;','varying vec2 vUv;','uniform mat3 uvTransform;','#ifdef IMP_AN','attribute vec3 aN;','#endif',
 'void main(){vUv=(uvTransform*vec3(uv,1.0)).xy;',
 '#ifdef USE_INSTANCING','mat4 M=modelMatrix*instanceMatrix;','#else','mat4 M=modelMatrix;','#endif',
 'vec3 n=normalize(mat3(M)*normal);',
 '#ifdef IMP_AN','n=normalize(mix(n,normalize(aN),0.75));','#endif',
 'vN=n;gl_Position=projectionMatrix*viewMatrix*(M*vec4(position,1.0));}'].join('\n');
const NF=['varying vec3 vN;','varying vec2 vUv;','uniform sampler2D map;','uniform float alphaTest;','uniform float useMap;',
 'void main(){if(useMap>0.5&&texture2D(map,vUv).a<max(alphaTest,0.01))discard;vec3 n=normalize(vN);if(!gl_FrontFacing)n=-n;gl_FragColor=vec4(n*0.5+0.5,1.0);}'].join('\n');
function normalMat(src,hasAN,cache){const k=src.uuid+(hasAN?'|n':'');if(cache.has(k))return cache.get(k);const TH=T(),map=src.map||null;
 if(map&&map.matrixAutoUpdate)map.updateMatrix();
 const m=new TH.ShaderMaterial({uniforms:{map:{value:map},useMap:{value:map?1:0},alphaTest:{value:src.alphaTest||0},uvTransform:{value:map?map.matrix.clone():new TH.Matrix3()}},
  vertexShader:NV,fragmentShader:NF,side:src.side,defines:hasAN?{IMP_AN:''}:{}});cache.set(k,m);return m;}
// one species: build, render the views, read the atlases back
function capture(rec,renderer){const TH=T(),R0=BIO.kits[rec.kit];if(!R0){BIO.err('BIO.impostor: '+rec.key+': no kit '+rec.kit);return false;}
 for(const n of R0.order)if(R0.items[n].count){BIO.err('BIO.impostor: '+rec.key+': kit '+rec.kit+' holds unbaked instances (call BIO.bakeImpostors after BIO.bake)');return false;}
 const save={range:BIO.range,minRange:BIO.minRange,owner:BIO.owner,chunk:BIO.chunk,cur:BIO.cur,stats:JSON.stringify(BIO.stats),tags:BIO.host.tags};
 const prev=BIO.kit(rec.kit);let G;
 try{BIO.range=null;BIO.minRange=0;BIO.owner=null;BIO.chunk=null;BIO.host.tags=null;rec.build();G=scratchMeshes(R0);}
 catch(e){BIO.err('BIO.impostor: '+rec.key+': '+e.message);for(const n of R0.order)R0.items[n]=BIO._newItem(R0.defs[n].attrs);return false;}
 finally{BIO.kit(prev);BIO.range=save.range;BIO.minRange=save.minRange;BIO.owner=save.owner;BIO.chunk=save.chunk;BIO.cur=save.cur;BIO.host.tags=save.tags;
  const st=JSON.parse(save.stats);for(const k in BIO.stats)delete BIO.stats[k];Object.assign(BIO.stats,st);}
 if(!G.children.length){BIO.err('BIO.impostor: '+rec.key+': the build put nothing');return false;}
 const B=boxOf(G),O=B.getCenter(new TH.Vector3()),rad=B.getSize(new TH.Vector3()).length()*.5;
 const N=rec.N,px=rec.px,W=N*px,scene=new TH.Scene();scene.add(G);scene.add(new TH.AmbientLight(0xffffff,1));
 const rtC=new TH.WebGLRenderTarget(W,W,{depthBuffer:true}),rtN=new TH.WebGLRenderTarget(W,W,{depthBuffer:true});
 const cam=new TH.OrthographicCamera(-rad,rad,rad,-rad,rad*.01,rad*4);
 const oldRT=renderer.getRenderTarget(),oldCol=renderer.getClearColor(new TH.Color()),oldA=renderer.getClearAlpha(),oldAuto=renderer.autoClear;
 renderer.setClearColor(0x000000,0);renderer.autoClear=false;
 const pass=(rt,swap)=>{const keep=[];if(swap)G.children.forEach(m=>{keep.push(m.material);m.material=swap(m);});
  rt.scissorTest=false;renderer.setRenderTarget(rt);renderer.clear(true,true,true);
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){const d=dec(i/(N-1),j/(N-1)),bs=basis(d);
   cam.position.set(O.x+d[0]*rad*2,O.y+d[1]*rad*2,O.z+d[2]*rad*2);cam.up.set(bs.u[0],bs.u[1],bs.u[2]);cam.lookAt(O);cam.updateMatrixWorld();
   rt.viewport.set(i*px,j*px,px,px);rt.scissor.set(i*px,j*px,px,px);rt.scissorTest=true;renderer.setRenderTarget(rt);
   renderer.clear(false,true,false);renderer.render(scene,cam);}
  if(swap)G.children.forEach((m,k)=>{m.material=keep[k];});};
 const cache=new Map();
 try{pass(rtC,null);pass(rtN,m=>normalMat(m.material,!!m.geometry.attributes.aN,cache));}
 finally{renderer.setRenderTarget(oldRT);renderer.setClearColor(oldCol,oldA);renderer.autoClear=oldAuto;}
 const read=rt=>{const a=new Uint8Array(W*W*4);rt.scissorTest=false;renderer.readRenderTargetPixels(rt,0,0,W,W,a);
  const t=new TH.DataTexture(a,W,W,TH.RGBAFormat);t.generateMipmaps=true;t.minFilter=TH.LinearMipmapLinearFilter;t.magFilter=TH.LinearFilter;t.needsUpdate=true;return t;};
 const tC=read(rtC),tN=read(rtN);
 rtC.dispose();rtN.dispose();cache.forEach(m=>m.dispose());G.children.forEach(m=>m.geometry.dispose());
 const U=rec.mat.uniforms;U.uAtlas.value=tC;U.uNorm.value=tN;U.uR.value=rad;U.uC.value.set(O.x-rec.at[0],O.y-rec.at[1],O.z-rec.at[2]);
 rec.radius=rad;rec.centre=[O.x,O.y,O.z];rec.ready=true;rec.atlas=tC;rec.normal=tN;
 rec.mat.userData.bio.opts.radius=rad;rec.mat.userData.bio.opts.centre=rec.centre;return true;}
IMP.capture=capture;
// bake every species not baked yet; returns how many were
BIO.bakeImpostors=function(renderer){if(!renderer){BIO.err('BIO.bakeImpostors: no renderer');return 0;}let n=0;
 for(const rec of IMP.list)if(!rec.ready&&!rec.failed){if(capture(rec,renderer))n++;else rec.failed=true;}
 readLights();return n;};
})();
