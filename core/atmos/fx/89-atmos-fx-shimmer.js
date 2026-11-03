// ================================================================= ATMOS — fx: the heat shimmer over warm ground (ATMOS.shimmer, ATMOS.shimmerK)
// The Hearths' section 12 (2026-11-03): "the shimmer over the warm ground is the dense-air mirage term the atmos notes promise,
// scaled by the heat" (and the Stills' boiling basins at 1.9 atm). A post pass for core/host's o.draw slot: the scene is drawn
// to a target with its depth, and each pixel whose world point lies over hot ground (a KTHERM bake, or any raster of degrees)
// takes its colour from a little below and beside itself, the offset wavering upward with time: the look of air boiling off
// hot rock. The strength grows with the heat and with distance (a mirage is a path effect: nothing at the eye's feet, all of it
// by `far`), and a master k the kit sets (day only, the work's hours). Opt-in (core/atmos/fx/, listed by path); needs
// 89-atmos-0-core.js (ATMOS.T, the page's THREE). The sky (depth 1) does not shimmer.
//   const S = ATMOS.shimmer({renderer, field (F {x0, z0, cell, nx, nz, T}: KTHERM's H.bake), t0 (degrees where it starts: 25),
//                            t1 (where it is whole: 70), amp (.0035 of the screen's height at whole), near (6 m), far (90 m),
//                            speed (1.2), scale (34: the wavering's cells across the screen)})
//   S.draw(scene, camera, dt)   draws the frame (core/host: o.draw = S.draw)    S.k  {value 0..1}, the master strength (1)
//   S.setSize(w, h)  on resize (draw also follows the renderer's size)          S.dispose()
//   ATMOS.shimmerK(F, x, z, d, o)   the shader's strength at a world point d metres from the eye (0..1), for a probe and Godot
//   ATMOS.shimmerBytes(F, o)        the field as the pass's texture bytes (RGBA8, the strength in r), for Godot's Image
// The target is not multisampled: a page that relies on MSAA loses it under the pass (a WebGLMultisampleRenderTarget cannot
// carry the depth texture in r128). Godot: a full-screen quad shader reading DEPTH_TEXTURE and SCREEN_TEXTURE, the same arithmetic.
(function(){
 'use strict';
 const A=typeof ATMOS!=='undefined'?ATMOS:null;
 if(!A)throw new Error('core/atmos fx/89-atmos-fx-shimmer.js: load 89-atmos-0-core.js first (ATMOS)');
 const ss=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
 const opt=o=>{o=o||{};const F=o.field;if(!F||!(F.nx>=2)||!(F.nz>=2)||!(F.cell>0)||!F.T||F.T.length!==F.nx*F.nz)throw new Error('ATMOS.shimmer: field is {x0, z0, cell, nx, nz, T} (KTHERM bake)');
  const q={F,t0:o.t0==null?25:o.t0,t1:o.t1==null?70:o.t1,amp:o.amp==null?.0035:o.amp,near:o.near==null?6:o.near,far:o.far==null?90:o.far,speed:o.speed==null?1.2:o.speed,scale:o.scale==null?34:o.scale};
  if(!(q.t1>q.t0))throw new Error('ATMOS.shimmer: t1 must be above t0');if(!(q.far>q.near))throw new Error('ATMOS.shimmer: far must be above near');return q;};
 /* the raster's strength at a node, then bilinear: the texture's own filtering does the same between texels */
 const nodeK=(q,i,j)=>ss(q.t0,q.t1,q.F.T[j*q.F.nx+i]);
 A.shimmerBytes=(F,o)=>{const q=opt(Object.assign({},o,{field:F})),out=new Uint8Array(F.nx*F.nz*4);
  for(let j=0;j<F.nz;j++)for(let i=0;i<F.nx;i++){const k=(j*F.nx+i)*4;out[k]=Math.round(nodeK(q,i,j)*255);out[k+3]=255;}return out;};
 A.shimmerK=(F,x,z,d,o)=>{const q=opt(Object.assign({},o,{field:F})),u=Math.max(0,Math.min(F.nx-1,(x-F.x0)/F.cell)),v=Math.max(0,Math.min(F.nz-1,(z-F.z0)/F.cell));
  const i=Math.min(F.nx-2,Math.floor(u)),j=Math.min(F.nz-2,Math.floor(v)),fu=u-i,fv=v-j,B=A.shimmerBytes(F,o),b=(a,c)=>B[((j+c)*F.nx+i+a)*4]/255;
  const h=(b(0,0)*(1-fu)+b(1,0)*fu)*(1-fv)+(b(0,1)*(1-fu)+b(1,1)*fu)*fv;return h*ss(q.near,q.far,d);};
 A.shimmer=o=>{const T=A.T;if(!T)throw new Error('ATMOS.shimmer: run ATMOS.init first (it needs the page\'s THREE)');const q=opt(o),R=o.renderer;if(!R)throw new Error('ATMOS.shimmer: renderer');
  const F=q.F,tex=new T.DataTexture(A.shimmerBytes(F,o),F.nx,F.nz,T.RGBAFormat);tex.magFilter=T.LinearFilter;tex.minFilter=T.LinearFilter;tex.generateMipmaps=false;tex.needsUpdate=true;
  const sz=R.getDrawingBufferSize(new T.Vector2()),rt=new T.WebGLRenderTarget(sz.x,sz.y,{depthBuffer:true});rt.depthTexture=new T.DepthTexture(sz.x,sz.y);rt.depthTexture.type=T.UnsignedIntType;
  const U={tC:{value:rt.texture},tD:{value:rt.depthTexture},tH:{value:tex},uInvP:{value:new T.Matrix4()},uCam:{value:new T.Matrix4()},
   uBox:{value:new T.Vector4(F.x0,F.z0,(F.nx-1)*F.cell,(F.nz-1)*F.cell)},uRamp:{value:new T.Vector2(q.near,q.far)},uAmp:{value:new T.Vector4(q.amp,q.speed,q.scale,sz.x/sz.y)},uT:{value:0},uK:{value:1},
   uTex:{value:new T.Vector2(F.nx,F.nz)}};
  const m=new T.ShaderMaterial({uniforms:U,depthTest:false,depthWrite:false,toneMapped:true,
   vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}',
   fragmentShader:['uniform sampler2D tC;uniform sampler2D tD;uniform sampler2D tH;uniform mat4 uInvP;uniform mat4 uCam;uniform vec4 uBox;uniform vec2 uRamp;uniform vec4 uAmp;uniform float uT;uniform float uK;uniform vec2 uTex;varying vec2 vUv;',
    'float shH(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);vec4 h=fract(sin(vec4(dot(i,vec2(127.1,311.7)),dot(i+vec2(1.0,0.0),vec2(127.1,311.7)),dot(i+vec2(0.0,1.0),vec2(127.1,311.7)),dot(i+vec2(1.0,1.0),vec2(127.1,311.7))))*43758.5453);return mix(mix(h.x,h.y,f.x),mix(h.z,h.w,f.x),f.y);}',
    /* the strength at the pixel's world point: the heat under it times the path's ramp; the sky none */
    'float shK(vec2 uv){float d=texture2D(tD,uv).x;if(d>=0.99999)return 0.0;vec4 v=uInvP*vec4(uv*2.0-1.0,d*2.0-1.0,1.0);v/=v.w;vec3 w=(uCam*vec4(v.xyz,1.0)).xyz;',
    ' vec2 g=(w.xz-uBox.xy)/uBox.zw;if(g.x<0.0||g.y<0.0||g.x>1.0||g.y>1.0)return 0.0;g=(g*(uTex-1.0)+0.5)/uTex;return texture2D(tH,g).x*smoothstep(uRamp.x,uRamp.y,length(v.xyz));}',
    'void main(){float k=shK(vUv)*uK;vec4 c=texture2D(tC,vUv);',
    ' if(k>0.0){vec2 p=vec2(vUv.x*uAmp.w,vUv.y)*uAmp.z;vec2 o=vec2(shH(p+vec2(0.0,-uT*uAmp.y*3.0))-0.5,shH(p*1.7+vec2(5.2,-uT*uAmp.y*4.1))-0.5);',
    '  vec2 uv2=vUv+vec2(o.x*0.5,o.y-0.35)*uAmp.x*k*2.0;if(shK(uv2)>0.0)c=texture2D(tC,uv2);}',
    ' gl_FragColor=c;',
    ' #include <tonemapping_fragment>',
    ' #include <encodings_fragment>',
    '}'].join('\n')});
  const quad=new T.Mesh(new T.PlaneGeometry(2,2),m),cam=new T.OrthographicCamera(-1,1,1,-1,0,1),post=new T.Scene();quad.frustumCulled=false;post.add(quad);
  const setSize=(w,h)=>{rt.setSize(w,h);rt.depthTexture.image.width=w;rt.depthTexture.image.height=h;U.uAmp.value.w=w/h;};
  const S={k:U.uK,uniforms:U,target:rt,setSize,
   draw:(scene,camera,dt)=>{R.getDrawingBufferSize(sz);if(sz.x!==rt.width||sz.y!==rt.height)setSize(sz.x,sz.y);U.uT.value+=dt||0;
    camera.updateMatrixWorld();U.uInvP.value.copy(camera.projectionMatrixInverse);U.uCam.value.copy(camera.matrixWorld);
    R.setRenderTarget(rt);R.render(scene,camera);R.setRenderTarget(null);R.render(post,cam);},
   dispose:()=>{rt.dispose();tex.dispose();m.dispose();quad.geometry.dispose();}};
  A.rec('shimmer',{t0:q.t0,t1:q.t1,amp:q.amp,near:q.near,far:q.far,speed:q.speed,scale:q.scale,field:{x0:F.x0,z0:F.z0,cell:F.cell,nx:F.nx,nz:F.nz}});
  return S;};
})();
