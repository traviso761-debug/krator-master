// ================================================================= METROPOLIS — KSHELL, the baked shell: the bake and the draw  [web]
// The host half of KSHELL (43). KSHELL.atlas(size) makes three RGBA8 targets: A colour (gamma) and coverage; B normal and height (radius, or 1 - depth from the face);
// C roughness, metal, window mask. KSHELL.bake(atlas, rec, slot, hero) renders a hero into its slot:
//   polar  a vertex shader writes (theta, y) as the clip position and radius as depth: the outermost surface wins. Three passes, the second and third
//          with theta shifted a turn, so a triangle over the seam lands whole; a triangle torn across the seam is dropped by comparing its theta with the true one.
//   box    one orthographic view per side, a strip of four, in the order round the perimeter.
// KSHELL.draw(atlas, rec, slot, placements, opt) is the cage as an InstancedMesh of a patched MeshStandardMaterial, so a shell is lit by the same lights and
// fogged by the same fog as the hero. The fragment traces the view ray from the cage inward by relaxed sphere tracing on the map; a ray that leaves discards.
(function(){
/* a hull map's height is 0.1 + 0.9 y/H, 0 where nothing is: a surface at the ground (the Spindle's skirt's reveal floor) stands clear of the empty test (0.05), where at
   0.02 over 0.01 the mips' blur at its edge flickered it between solid and air, as spines round the skirt seen from above */
const BV=['uniform float uMode,uH,uA,uWrap,uXs,uYs;uniform vec3 uFaceN;uniform float uFaceD;uniform mat4 uVP;',
 'varying vec2 vUv;varying vec3 vN;varying float vH;varying float vTh;varying vec3 vCol;varying vec2 vXZ;',

 'uniform mat3 uUvT;','void main(){vUv=(uUvT*vec3(uv,1.0)).xy;vCol=vec3(1.0);','#ifdef USE_COLOR','vCol*=color;','#endif','#ifdef USE_INSTANCING_COLOR','vCol*=instanceColor;','#endif',
 '#ifdef USE_INSTANCING','vec4 p=instanceMatrix*vec4(position,1.0);vN=normalize(mat3(instanceMatrix)*(normal/vec3(dot(instanceMatrix[0].xyz,instanceMatrix[0].xyz),dot(instanceMatrix[1].xyz,instanceMatrix[1].xyz),dot(instanceMatrix[2].xyz,instanceMatrix[2].xyz))));',
 '#else','vec4 p=vec4(position,1.0);vN=normal;','#endif',
 'vXZ=p.xz;if(uMode<0.5){float th=uWrap==0.0?atan(p.z,p.x):atan(-p.z,-p.x)+uWrap*3.14159265;vTh=th;float r=length(p.xz);vH=r/uA;gl_Position=vec4(th/3.14159265*uXs,(p.y/uH*2.0-1.0)*uYs,1.0-2.0*vH,1.0);}',
 'else if(uMode<1.5){vTh=0.0;vH=1.0-clamp((uFaceD-dot(p.xyz,uFaceN))/uA,0.0,1.0);gl_Position=uVP*vec4(p.xyz,1.0);}else{vTh=0.0;vH=0.1+0.9*clamp(p.y/uH,0.0,1.0);gl_Position=uVP*vec4(p.xyz,1.0);}}'].join('\n');
// a triangle torn over the seam has theta running the long way round: its interpolated theta and the true theta of the point part company, and it is dropped. The
// wrap passes (+1, -1) cut theta at 0, not at the seam (0..2pi and -2pi..0), so a triangle across the seam is whole in them and fills the slot's edge and gutter: with one
// cut for all three passes a strip at -180 degrees went unbaked (a seam down the shell, 2026-11-03); and each wrap pass keeps to its own side of the cut, or a triangle
// torn across the seam in a wrap pass sweeps through the middle of the slot and writes spikes there
const BF=['uniform float uPass,uRough,uMetal,uWin,uMode,uWrap,uClip;uniform vec3 uFaceN;uniform vec3 uColor;uniform sampler2D uMap;uniform float uHasMap;uniform sampler2D uRMap;uniform float uHasRMap;',
 'varying vec2 vUv;varying vec3 vN;varying float vH;varying float vTh;varying vec3 vCol;varying vec2 vXZ;',
 'void main(){if(uMode<0.5&&((uWrap==0.0?abs(vTh)>2.5:abs(vTh)<2.2)||abs(vTh-(uWrap==0.0?atan(vXZ.y,vXZ.x):atan(-vXZ.y,-vXZ.x)+uWrap*3.14159265))>0.25))discard;if(uMode>1.5&&vH<uClip)discard;',
 ' if(uPass<0.5){vec3 c=uHasMap>0.5?texture2D(uMap,vUv).rgb:vec3(1.0);c*=pow(uColor*vCol,vec3(1.0/2.2));gl_FragColor=vec4(c,1.0);}',
 /* roughness is linear data: it is read with texture() and no sRGB decode (check_source's RAWTEX rule is for colour maps) */
/* a side map's sills and reveals are flat ledges (|ny| == 1) a pixel tall: an up-facing normal there catches a high sun as a bright slit, so in a side map a flat ledge
   takes the wall's normal; sloped roofs and domes (|ny| < 0.99) keep their own */
 ' else if(uPass<1.5){vec3 n=normalize(vN);if(uMode<1.5&&abs(n.y)>0.99)n=uMode<0.5?normalize(vec3(vXZ.x,0.0,vXZ.y)):uFaceN;gl_FragColor=vec4(n*0.5+0.5,vH);}',
 ' else gl_FragColor=vec4(uRough*(uHasRMap>0.5?texture(uRMap,vUv).g:1.0),uMetal,uWin,1.0);}'].join('\n');
function bakeMat(src,P,pass){const m=new THREE.ShaderMaterial({vertexShader:BV,fragmentShader:BF,side:THREE.DoubleSide,vertexColors:!!src.vertexColors,
 uniforms:{uPass:{value:pass},uMode:P.mode,uClip:P.clip,uH:P.H,uA:P.A,uWrap:P.wrap,uXs:P.xs,uYs:P.ys,uFaceN:P.faceN,uFaceD:P.faceD,uVP:P.vp,uRough:{value:src.roughness==null?1:src.roughness},uRMap:{value:src.roughnessMap||null},uHasRMap:{value:src.roughnessMap?1:0},uUvT:{value:(()=>{const t=src.map||src.roughnessMap;if(!t)return new THREE.Matrix3();if(t.matrixAutoUpdate)t.updateMatrix();return t.matrix.clone();})()},uMetal:{value:src.metalness==null?0:src.metalness},uWin:{value:src.userData.win?1:0},uColor:{value:src.color?src.color.clone():new THREE.Color(1,1,1)},uMap:{value:src.map||null},uHasMap:{value:src.map?1:0}}});return m;}
KSHELL.atlas=function(size,renderer){const mk=()=>{const t=new THREE.WebGLRenderTarget(size,size,{depthBuffer:true,format:THREE.RGBAFormat,type:THREE.UnsignedByteType,minFilter:THREE.LinearMipmapLinearFilter,magFilter:THREE.LinearFilter,generateMipmaps:false});return t;};
 const a={size,A:mk(),B:mk(),C:mk(),renderer};const old=renderer.getRenderTarget(),oc=renderer.getClearColor(new THREE.Color()),oa=renderer.getClearAlpha();renderer.setClearColor(0,0);
 [a.A,a.B,a.C].forEach(t=>{renderer.setRenderTarget(t);renderer.clear(true,true,true);});renderer.setRenderTarget(old);renderer.setClearColor(oc,oa);return a;};
KSHELL.bake=function(at,rec,slot,hero,top,bot){const R=at.renderer,f=rec.frame,pad=8,P={mode:{value:f.mode},H:{value:f.H},A:{value:f.mode?f.D:f.a},wrap:{value:0},clip:{value:0},xs:{value:1},ys:{value:1},faceN:{value:new THREE.Vector3(0,0,1)},faceD:{value:0},vp:{value:new THREE.Matrix4()}};
 const sc=new THREE.Scene(),meshes=[];hero.children.forEach(m=>{const k=m.isInstancedMesh?new THREE.InstancedMesh(m.geometry,m.material,m.count):new THREE.Mesh(m.geometry,m.material);if(m.isInstancedMesh){k.instanceMatrix=m.instanceMatrix;k.instanceColor=m.instanceColor;}k.frustumCulled=false;k._src=m.material;sc.add(k);meshes.push(k);});
 const mats=[0,1,2].map(p=>meshes.map(k=>bakeMat(k._src,P,p)));
 const old=R.getRenderTarget(),oAuto=R.autoClear,oc=R.getClearColor(new THREE.Color()),oa=R.getClearAlpha(),tm=R.toneMapping;R.autoClear=false;R.setClearColor(0,0);R.toneMapping=THREE.NoToneMapping;
 const cam=new THREE.Camera(),targets=[at.A,at.B,at.C];
 targets.forEach(function(rt,p){meshes.forEach((k,i)=>{k.material=mats[p][i];});
  const vp=(x,y,w,h)=>{rt.viewport.set(x,y,w,h);rt.scissor.set(x,y,w,h);rt.scissorTest=true;R.setRenderTarget(rt);};
  if(f.mode===0){const x=slot.x-pad,w=slot.w+2*pad,y=slot.y-pad,h=slot.h+2*pad;P.xs.value=slot.w/w;P.ys.value=slot.h/h;vp(x,y,w,h);R.clear(true,true,true);
   [0,1,-1].forEach(wr=>{P.wrap.value=wr;R.render(sc,cam);});}
  else{const W=[2*f.a,2*f.b,2*f.a,2*f.b],tot=W[0]+W[1]+W[2]+W[3],H=f.H,c=new THREE.OrthographicCamera(-1,1,1,-1,.1,4000);
   const faces=[[0,0,1,f.b,1,0,0],[1,0,0,f.a,0,0,-1],[0,0,-1,f.b,-1,0,0],[-1,0,0,f.a,0,0,1]];let s=0;
   faces.forEach(function(q,i){const wPx=W[i]/tot*slot.w,x=Math.round(slot.x+s/tot*slot.w),x1=Math.round(slot.x+(s+W[i])/tot*slot.w);s+=W[i];
    const half=W[i]/2;c.left=-half;c.right=half;c.top=H/2;c.bottom=-H/2;c.position.set(q[0]*(q[3]+1),H/2,q[2]*(q[3]+1));c.up.set(0,1,0);c.lookAt(0,H/2,0);c.near=.5;c.far=q[3]+1+f.D;c.updateProjectionMatrix();c.updateMatrixWorld();
    P.vp.value.multiplyMatrices(c.projectionMatrix,c.matrixWorldInverse);P.faceN.value.set(q[0],q[1],q[2]);P.faceD.value=q[3];vp(x,slot.y,x1-x,slot.h);R.clear(true,true,true);R.render(sc,cam);});}
  /* the hull maps: a plain projection, x and z to the slot, y to depth: from above the highest surface wins, from below the lowest */
  const hm=P.mode.value;[[top,1],[bot,-1]].filter(e=>e[0]).forEach(function(e){const S=e[1];P.vp.value.set(1/rec.hx,0,0,0, 0,0,1/rec.hz,0, 0,-2*S/f.H,0,S, 0,0,0,1);P.mode.value=2;P.clip.value=S<0?.1+.9*rec.soffit/f.H:0;vp(e[0].x,e[0].y,e[0].w,e[0].h);R.clear(true,true,true);R.render(sc,cam);});P.mode.value=hm;
  rt.scissorTest=false;rt.viewport.set(0,0,rt.width,rt.height);});
 R.setRenderTarget(old);R.autoClear=oAuto;R.setClearColor(oc,oa);R.toneMapping=tm;mats.forEach(l=>l.forEach(m=>m.dispose()));return true;};
// the mips, once every slot is baked
KSHELL.finish=function(at){const R=at.renderer,gl=R.getContext(),old=R.getRenderTarget();[at.A,at.B,at.C].forEach(t=>{t.texture.generateMipmaps=true;const tx=R.properties.get(t.texture).__webglTexture;gl.bindTexture(gl.TEXTURE_2D,tx);gl.generateMipmap(gl.TEXTURE_2D);gl.bindTexture(gl.TEXTURE_2D,null);});R.setRenderTarget(old);R.state.reset&&0;};

const DV=['attribute vec4 aSlot;attribute vec4 aFrame;attribute vec4 aTop;attribute vec4 aBot;varying vec4 vMpTop;varying vec4 vMpBot;varying vec3 vMpP;varying vec3 vMpE;varying vec2 vMpRot;varying vec4 vMpSlot;varying vec4 vMpFrame;varying vec2 vLodK;uniform vec3 uBand;'].join('\n');
const DM=['vMpP=position;',
 'vec3 mpC=-(transpose(mat3(viewMatrix))*viewMatrix[3].xyz);vMpE=(inverse(instanceMatrix)*vec4(mpC,1.0)).xyz;vMpRot=instanceMatrix[0].xz;vMpSlot=aSlot;vMpFrame=aFrame;vMpTop=aTop;vMpBot=aBot;',
 '{vec3 c=instanceMatrix[3].xyz,e=mpC;vec2 hb=aFrame.x<0.5?vec2(aFrame.z*.6):vec2(aFrame.z,aFrame.w);if(abs(instanceMatrix[0].x)<0.5)hb=hb.yx;float dx=max(abs(e.x-c.x)-hb.x,0.0),dz=max(abs(e.z-c.z)-hb.y,0.0),dy=max(e.y-aFrame.y,max(-e.y,0.0)),ld=length(vec3(dx,dy,dz));',
 ' vLodK=vec2(uBand.y>0.0?smoothstep(uBand.y*(1.0-uBand.z),uBand.y,ld):0.0,uBand.x>0.0?smoothstep(uBand.x*(1.0-uBand.z),uBand.x,ld):1.0);}'].join('\n');
const DF=['uniform sampler2D uA,uB,uC;uniform float uAt;uniform float uPx;uniform float uTexel;uniform float uDbg;','varying vec3 vMpP;varying vec3 vMpE;varying vec2 vMpRot;varying vec4 vMpSlot;varying vec4 vMpFrame;varying vec2 vLodK;varying vec4 vMpTop;varying vec4 vMpBot;',
 'vec2 mpUV;float mpLod;float mpGeo;vec3 mpHP;vec3 mpRd;float mpBr;float mpCl;vec2 mpTUV;float mpTCl;',MP.ROOM_GLSL,
 // the gap: how far p is outside the surface along the map's axis, and the uv it sampled
 /* a side map is read half a texel (at its mip) inside its slot in height: at the foot the filter blended in the atlas's empty gutter, which took the radius at the ground
    from 46 m to a third of it, so the skirt's outer metres were lost and its rim spiked. Not in angle on a polar map: its gutter holds the wrapped map (the bake's
    three wrap passes), and clamping there drew a stripe down the seam. A box map's perimeter is clamped (its seam is a corner). At a sharp radial cliff (du > 1 m, a root
    fin) or deep horizontal reveal (dv > 1.8 m) the polar map snaps across the 2x2 texel quad and reads mip 0 (mpCl = 1), so a fin is not filtered into a wedge and a reveal
    is not blended into a dark band */
 'float mpGap(vec3 p){vec4 F=vMpFrame;if(p.y>F.y)return 4.0;vec2 hv=exp2(mpLod)*.5/(vMpSlot.zw*uAt);float hv0=.5/(vMpSlot.w*uAt);',
 ' if(F.x<0.5){float u=atan(p.z,p.x)/6.2831853+0.5,v0=clamp(p.y/F.y,hv0,1.0-hv0),v=clamp(p.y/F.y,hv.y,1.0-hv.y);vec2 uv0=vMpSlot.xy+vMpSlot.zw*vec2(u,v0);',
 '  vec2 tp=uv0*uAt-.5,f=fract(tp),b0=(floor(tp)+.5)/uAt,ts=vec2(1.0/uAt,0.0);',
 '  float r00=textureLod(uB,b0,0.0).a,r10=textureLod(uB,b0+ts.xy,0.0).a,r01=textureLod(uB,b0+ts.yx,0.0).a,r11=textureLod(uB,b0+ts.xx,0.0).a;',
 '  float du=max(abs(r10-r00),abs(r11-r01))*F.z,dv=max(abs(r01-r00),abs(r11-r10))*F.z;',
 '  if(du>1.0||dv>1.8){mpCl=1.0;float kx=du>1.0?step(.5,f.x):f.x,r0=mix(r00,r10,kx),r1=mix(r01,r11,kx),ky=abs(r1-r0)*F.z>1.8?(r0>r1?step(.85,f.y):step(.15,f.y)):f.y;mpUV=b0+vec2(kx,ky)/uAt;return length(p.xz)-mix(r0,r1,ky)*F.z;}',
 '  mpCl=0.0;mpUV=vMpSlot.xy+vMpSlot.zw*vec2(u,v);return length(p.xz)-textureLod(uB,mpUV,mpGeo).a*F.z;}',
 ' mpCl=0.0;float v=clamp(p.y/F.y,hv.y,1.0-hv.y),hx=F.z,hz=F.w,D=hz,per=4.0*(hx+hz),dz=hz-abs(p.z),dx=hx-abs(p.x);',
 /* a box is the hull of two of its maps: the long face on the point's side (it reaches the middle) and the end face on its side (it reaches D in). A point is solid only
    inside both; judging by the nearest face alone let a ray over a setback roof read the far face's map. An empty end map deeper than D says nothing, so the long face decides (it returned
    solid with its own empty texel, which drew black bars on a roof) */
 ' float sz=p.z>0.0?(p.x+hx):(2.0*hx+2.0*hz+hx-p.x),sx=p.x>0.0?(2.0*hx+hz-p.z):(4.0*hx+2.0*hz+p.z+hz);',
 ' vec2 uz=vMpSlot.xy+vMpSlot.zw*vec2(clamp(sz/per,hv.x,1.0-hv.x),v),ux=vMpSlot.xy+vMpSlot.zw*vec2(clamp(sx/per,hv.x,1.0-hv.x),v);float az=textureLod(uB,uz,mpGeo).a,ax=textureLod(uB,ux,mpGeo).a;',
 ' float gz=az<0.02?4.0:(1.0-az)*D-dz,gx=ax<0.02?(dx<D?4.0:-1000.0):(1.0-ax)*D-dx;',
 ' if(gz>=gx){mpUV=uz;return gz;}mpUV=ux;return gx;}',
  /* inside: in the side hull and, for a ray from above, under the top. The top map is read on its 2x2 mip-0 quad: across a cliff (am - an > 0.015, e.g. the lamp's disc
    over the shaft or a footprint's edge) low texels dilate to am so the roof's rim does not droop into the wall below, and mpTUV snaps to the high texel center (mpTCl = 1) */
 'bool mpIn(vec3 p,vec3 rd,float mn,float ey,vec2 hxz,out float g,out float ta,out float ty){g=mpGap(p);vec2 h=clamp(p.xz/hxz*.5+.5,0.0,1.0),ut=vMpTop.xy+vMpTop.zw*h;',
 ' vec2 tp0=ut*uAt-.5,tf=fract(tp0),b0=(floor(tp0)+.5)/uAt,ts=vec2(1.0/uAt,0.0);',
 ' float a00=textureLod(uB,b0,0.0).a,a10=textureLod(uB,b0+ts.xy,0.0).a,a01=textureLod(uB,b0+ts.yx,0.0).a,a11=textureLod(uB,b0+ts.xx,0.0).a,am=max(max(a00,a10),max(a01,a11)),an=min(min(a00,a10),min(a01,a11));',
 ' mpTUV=ut;mpTCl=0.0;',
 ' if(am>0.05){if(am-an>.015){mpTCl=1.0;vec2 k0=step(.5,tf);float aN=mix(mix(a00,a10,k0.x),mix(a01,a11,k0.x),k0.y);vec2 kp=aN>=am-.015?k0:(a00>=am?vec2(0.0):a10>=am?vec2(1.0,0.0):a01>=am?vec2(0.0,1.0):vec2(1.0));mpTUV=b0+kp/uAt;}',
 '  float c00=a00<am-.015?am:a00,c10=a10<am-.015?am:a10,c01=a01<am-.015?am:a01,c11=a11<am-.015?am:a11;ta=mix(mix(c00,c10,tf.x),mix(c01,c11,tf.x),tf.y);}else ta=0.0;',
 ' ty=(ta-.1)/.9*vMpFrame.y;return g<mn*.5&&(rd.y>=0.0||(ta>0.05&&p.y<=ty+ey*(vMpFrame.x<0.5&&ty>1.2?2.0:.6)));}',
 /* the top map's colour takes over where the side map shows 1.2 m of air over the hit (a sill or reveal is 0.55 to 0.7 m deep; at 3.5 m the Ledger's hall, stepped 1.8 m, was
    drawn as one dark riser from above), or where */
 /* a roof is where the top map is flat for 1.5 m all round; a sill never is (the wall rises behind it). The side map's air above was the only test, and over a box
    it fails on a low roof past a hall's end: the long face's map extrudes the hall over it, which read the side map there as bars */
 'bool mpFlat(vec2 ut,float ty,vec2 hxz,float ey){vec2 o=vMpTop.zw*1.5/(2.0*hxz);float tol=max(ey,0.5),L=mpLod+1.0;for(int k=0;k<4;k++){vec2 d=k==0?vec2(o.x,0.0):k==1?vec2(-o.x,0.0):k==2?vec2(0.0,o.y):vec2(0.0,-o.y);float a=textureLod(uB,ut+d,L).a;if(a<0.05||abs((a-.1)/.9*vMpFrame.y-ty)>tol)return false;}return true;}',
 'bool mpTrace(){mpBr=0.0;vec3 ro=vMpP,rd=normalize(vMpP-vMpE);mpRd=rd;float dist=length(vMpP-vMpE);mpLod=max(0.0,log2(max(dist*uPx/uTexel,1.0)));mpGeo=mpLod;float t=0.0,tp=0.0,mn=max(0.25,dist*uPx*.6),g,ta,ty;',
 ' vec4 F=vMpFrame;float lim=F.x<0.5?F.z*1.08:0.0;',
 ' vec2 hxz=F.x<0.5?vec2(F.z):F.zw;float ey=F.y/255.0*1.2;',
 ' for(int i=0;i<MP_STEPS;i++){vec3 p=ro+rd*t;if(p.y>F.y+.5||p.y<-.1)return false;',
 /* a hit is found by stepping, which lands anywhere up to a step inside: it is bisected back to the surface between the last point outside and this one,
    so the colour is read at the surface's own height (a deep landing read a skirt's side lower down, as spines, and a roof's map flipped with the camera). On the polar
    skirt (0.65..22 m, where the top map holds recessed reveal rings under the flared wall) only the three portal canopies (7.6..8.7 m, 5 m proud of the wall) take the top
    map; on the lamp (over 231.3 m) the bronze disc (clamped outside the dome's 13.6 m foot) and upper cap take the top map and the steep lower dome takes the side map */
 '  if(mpIn(p,rd,mn,ey,hxz,g,ta,ty)){float a=tp,b=t;for(int j=0;j<5;j++){float m=(a+b)*.5;if(mpIn(ro+rd*m,rd,mn,ey,hxz,g,ta,ty))b=m;else a=m;}',
 '   p=ro+rd*b;mpIn(p,rd,mn,ey,hxz,g,ta,ty);vec2 qxz=F.x<0.5&&p.y>231.3&&p.y<234.05?p.xz*max(1.0,13.6/max(length(p.xz),.1)):p.xz,h=clamp(qxz/hxz*.5+.5,0.0,0.9999),ut=vMpTop.xy+vMpTop.zw*h,ub=vMpBot.xy+vMpBot.zw*h,us=mpUV,tu=F.x<0.5&&p.y>231.3&&p.y<234.05&&length(p.xz)<13.6?ut:mpTUV;float cl=mpCl,tcl=mpTCl;mpHP=p;',
 '   if(F.x<0.5&&p.y>=234.05&&p.y<235.0)us.y=max(us.y,vMpSlot.y+vMpSlot.w*(234.4/F.y));',
 '   bool sk=F.x<0.5&&p.y>0.65&&p.y<22.0,lm=F.x<0.5&&p.y>231.3&&length(p.xz)>1.15;',
 '   float ny=textureLod(uB,tu,mpLod).y,tw=textureLod(uC,tu,0.0).b;',
 '   bool rf=lm?(p.y<234.05||(p.y>238.2&&p.y<240.2)||(p.y>247.5&&ny>0.85&&p.y>ty-ey*2.0)):(sk?(ny>0.95&&ty>7.6&&ty<8.7&&p.y>ty-ey*.6&&mpGap(vec3(p.x,p.y+1.8,p.z))>4.5):(p.y>ty-ey*1.5&&ny>0.85&&(F.x>0.5||tw<0.5)&&(mpGap(vec3(p.x,p.y+ey*2.0,p.z))>1.2||mpFlat(ut,ty,hxz,ey))));',
 '   if(rd.y<0.0&&rf){mpUV=tu;mpBr=1.0;mpCl=tcl;}',
 '   else if(rd.y>0.0&&mpGap(vec3(p.x,p.y-ey*2.0,p.z))>3.5&&textureLod(uB,ub,mpLod).a>0.05){mpUV=ub;mpBr=2.0;mpCl=0.0;}else{mpUV=us;mpCl=cl;}return true;}',
 /* the side map's gap is a horizontal distance: a steep ray stepping by it fell through a flared skirt, so a ray going down over a roof steps no further than the roof's height above it,
    and none past 5 cm over the ground, where a curb or a fin's foot is a row or two of the map; on the lower polar tower a ray also looks ahead in angle for narrow fins */
 '  tp=t;float gs=g;if(F.x<0.5&&p.y<85.0&&g>1.0){float su=(p.x*rd.z-p.z*rd.x>=0.0?1.0:-1.0)*vMpSlot.z,r1=textureLod(uB,mpUV+vec2(su*.009,0.0),0.0).a*F.z,r2=textureLod(uB,mpUV+vec2(su*.02,0.0),0.0).a*F.z,rm=max(r1,r2);if(rm*F.z>0.0&&length(p.xz)-rm<g-1.0)gs=min(g,max(length(p.xz)-rm,0.8));}',
 '  float s=max(gs*.85,mn);if(rd.y<0.0&&ta>0.05){if(g<mn*.5)s=clamp((p.y-ty-ey*.4)/(-rd.y),mn,2.0);else if(p.y>ty-ey)s=min(s,max((p.y-ty)/(-rd.y),mn*.5));}if(rd.y<0.0&&p.y>.05)s=min(s,max((p.y-.05)/(-rd.y),mn*.5));t+=s;',
 '  if(F.x<0.5){vec2 q=p.xz;if(length(q)>lim&&dot(q,rd.xz)>0.0)return false;}else if((abs(p.x)>F.z||abs(p.z)>F.w)&&((abs(p.x)>F.z&&p.x*rd.x>0.0)||(abs(p.z)>F.w&&p.z*rd.z>0.0)))return false;}',
 ' return false;}'].join('\n');
KSHELL.material=function(at,o){o=o||{};const steps=o.steps==null?24:o.steps,m=new THREE.MeshStandardMaterial({color:0xffffff,roughness:1,metalness:0,side:THREE.FrontSide}),U={uA:{value:at.A.texture},uB:{value:at.B.texture},uC:{value:at.C.texture},uAt:{value:at.size},uPx:{value:.0012},uTexel:{value:.33},uBand:{value:new THREE.Vector3(0,0,.15)},uDbg:{value:0}};m.userData.U=U;
 m.onBeforeCompile=function(sh){Object.assign(sh.uniforms,U);
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\n'+DV).replace('#include <begin_vertex>','#include <begin_vertex>\n'+DM);
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n#define MP_STEPS '+steps+'\n'+DF)
   /* the colour is read a quarter mip under the distance's level, and up to 1.25 coarser where the surface is seen edge-on (the distance alone left a grazing face's windows
      sparkling from above); the shape (mpGeo) at the distance's level. Sharper (three quarters, and the shape a level under: 2026-11-03) aliased into a dither */
   .replace('#include <map_fragment>',['{float _lh=fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(0.06711056,0.00583715))));if(_lh<vLodK.x||_lh>=vLodK.y)discard;}','if(!mpTrace())discard;vec2 sUV=mpUV;vec3 gN=mpBr==1.0?vec3(0.0,1.0,0.0):mpBr==2.0?vec3(0.0,-1.0,0.0):vMpFrame.x<0.5?normalize(vec3(mpHP.x,0.0,mpHP.z)):(abs(mpHP.x)/vMpFrame.z>abs(mpHP.z)/vMpFrame.w?vec3(sign(mpHP.x),0.0,0.0):vec3(0.0,0.0,sign(mpHP.z)));float sL=mpCl>0.5?0.0:max(0.0,mpLod-.25+.5*clamp(-log2(max(abs(dot(gN,mpRd)),.05)),0.0,2.5));vec4 mA=textureLod(uA,sUV,sL),mB=textureLod(uB,sUV,sL),mC=textureLod(uC,sUV,sL);diffuseColor.rgb=pow(mA.rgb,vec3(2.2));'].join('\n'))
   .replace('#include <roughnessmap_fragment>','float roughnessFactor=mC.r;').replace('#include <metalnessmap_fragment>','float metalnessFactor=mC.g;')
   .replace('#include <normal_fragment_begin>',['vec3 mN=normalize(mB.xyz*2.0-1.0),mW=vec3(vMpRot.x*mN.x-vMpRot.y*mN.z,mN.y,vMpRot.y*mN.x+vMpRot.x*mN.z);vec3 normal=normalize((viewMatrix*vec4(mW,0.0)).xyz);vec3 geometryNormal=normal;'].join('\n'))
   .replace('#include <normal_fragment_maps>','')
   .replace('#include <dithering_fragment>',['#include <dithering_fragment>','if(uDbg>0.5){if(uDbg<1.5)gl_FragColor=vec4(mA.rgb,1.0);else if(uDbg<2.5)gl_FragColor=vec4(mB.rgb,1.0);else if(uDbg<3.5)gl_FragColor=vec4(mC.rgb,1.0);else gl_FragColor=vec4(mpBr==1.0?1.0:0.0,mpBr==2.0?1.0:0.0,mpBr==0.0?0.6:0.0,1.0);}'].join(String.fromCharCode(10)))
   .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\nif(mC.b>0.5){totalEmissiveRadiance+=mpRoom(mpHP,mpRd,mN,0.0)*(mC.g>.2?0.55:1.0);}');};
 m.customProgramCacheKey=()=>'kshell'+steps;return m;};
// placements: [[x, z, yaw], ...]
KSHELL.draw=function(at,rec,slot,mat,places,top,bot){const g=new THREE.BufferGeometry(),C=rec.cage,S=at.size,f=rec.frame,n=places.length;g.setAttribute('position',new THREE.Float32BufferAttribute(C.pos,3));g.setIndex(C.idx);g.computeVertexNormals();
 const im=new THREE.InstancedMesh(g,mat,Math.max(n,1)),a=new Float32Array(Math.max(n,1)*4),b=new Float32Array(Math.max(n,1)*4),ta=new Float32Array(Math.max(n,1)*4),ba=new Float32Array(Math.max(n,1)*4),M=new THREE.Matrix4(),Q=new THREE.Quaternion(),Y=new THREE.Vector3(0,1,0),one=new THREE.Vector3(1,1,1);
 for(let i=0;i<n;i++){const p=places[i];M.compose(new THREE.Vector3(p[0],0,p[1]),Q.setFromAxisAngle(Y,p[2]==null?0:p[2]),one);im.setMatrixAt(i,M);}
 for(let i=0;i<Math.max(n,1);i++){a.set([slot.x/S,slot.y/S,slot.w/S,slot.h/S],i*4);b.set([f.mode,f.H,f.a,f.b],i*4);ta.set([top.x/S,top.y/S,top.w/S,top.h/S],i*4);ba.set(bot?[bot.x/S,bot.y/S,bot.w/S,bot.h/S]:[0,0,0,0],i*4);}
 g.setAttribute('aSlot',new THREE.InstancedBufferAttribute(a,4));g.setAttribute('aFrame',new THREE.InstancedBufferAttribute(b,4));g.setAttribute('aTop',new THREE.InstancedBufferAttribute(ta,4));g.setAttribute('aBot',new THREE.InstancedBufferAttribute(ba,4));im.count=n;im.frustumCulled=false;im.name='shell.'+rec.id;return im;};
})();
