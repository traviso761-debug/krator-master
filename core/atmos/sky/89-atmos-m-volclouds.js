// ================================================================= ATMOS — volumetric clouds: a raymarched cloudscape (W6)
// [G shader] + [G data] (STAGE-8/G-weather.md W6, the owner's D33: true volumes, not the flat layers made deeper). The Nubis
// approach on three r128, in four passes (host/89-atmos-m-volhost.js runs them):
//   1 the MASK    the sky's own cloud field (atmCloudField, 3 octaves: the octaves the ground's shadows read) with its cover and,
//                 on a page with the weather cells, their coverage map (atmCloudCoverAt), baked each frame into a
//                 PRESETS.volclouds.maskN texture over maskSpan m round the camera: R the footprint (0..1, x the preset's
//                 cumulus), G a storm's dark (its tower: storm cells rise to uVolT.z m more), B the cells' precipitation
//   2 the MARCH   at 1/res of the screen each way, a ray per pixel through the layer [base, base + thick + storm]: where the mask is
//                 empty a step costs one fetch; inside, the density is the mask x a height profile carved by two octaves of the
//                 64^3 noise volume (ATMOS.skyNoiseVolume) and eroded by the 32^3 detail volume (ATMOS.skyDetailVolume: Worley,
//                 wispy at the base, billowed at the top); a short light march toward the key light (the sun, or the giant
//                 at night) gives the self-shadow, a two-lobe Henyey-Greenstein phase the silver lining, three octaves of
//                 multiple scattering the soft bright cores. The ray is jittered each frame (interleaved gradient noise plus a
//                 golden-ratio step) and ends at the far ridges (they stand in front of anything beyond them)
//   3 the RESOLVE reprojects last frame's result through last frame's view and projection at each texel's cloud depth, clamps it
//                 to the new texel's neighbourhood (no ghosts) and blends: the temporal accumulation three r128 has no pass for
//   4 the COMPOSITE draws the result over the world at full resolution, after it: each pixel writes the cloud's depth (the
//                 transmittance-weighted mean distance), so a hill in front of a cloud hides it and a cloud in front of a hill
//                 (flying above the cloud sea, a summit in the cloud) hides the hill; hazed toward the air by its distance
// A texel holds four numbers (r128 has no multiple render targets): the key light's share, the ambient's share, the flash's
// share (all premultiplied by the cloud's opacity), and the depth (m, in steps of 8) with the opacity in its fraction. The
// colours are applied at the composite from the sky's own uniforms, so the hour and the weather move the clouds' light at
// once, whatever the history holds.
// The noise stays on the volumes (SKY-PLAN.md section 10: the sky's compile went from 16.8 s to 2.2 s that way); each pass is its
// own small program, so the sky's own compile is not touched (it gains two uniforms and one condition: uVolOn, uVolMidH).
//   ATMOS.PRESETS.volclouds   the numbers (below); a preset's clouds.volumes overrides them, clouds.quality picks the tier
//   ATMOS.skyDetailVolume(n)  -> Uint8Array n^3 RGBA: inverted Worley at three frequencies (3, 5, 8 cells a period), tiling; KRAND
//   ATMOS.volGLSL.mask(), .march(), .resolve(), .composite()   the passes' fragment shaders
//   ATMOS.volTiers            ['off', 'layers', 'volumes']: off draws no cumulus, layers the flat one (the sky as it was), volumes these
// Godot: the same field in a sky shader's quarter-res pass (godot/shaders/atmos_volclouds.gdshaderinc; GODOT.md "Volumetric clouds").
(function(){const A=ATMOS;
 /* res: the march's divisor of the screen (2 half, 3, 4 quarter); steps, lightSteps: the march; thin, thick: the layer's depth (m)
    over empty and full cover; storm: what a storm's dark adds (m); density: extinction (1/m) at full density; base, detail: the
    noise volumes' periods in the world (m); erode: how much the detail eats; ambient: the base's share of the sky light (the top
    gets all of it); forward: the phase's forward lobe; maxDist: the farthest cloud (m); maskN, maskSpan: the mask; blend: the
    new frame's weight in the history; haze: the air's distance (m) for the clouds' haze; key, amb: the light's gains (the flat
    layer's 0.40 and 0.85, so the two tiers agree in brightness); budget: GPU ms of the cloud passes before the tier steps down */
 A.PRESETS.volclouds=A.PRESETS.volclouds||{res:2,steps:56,lightSteps:5,thin:600,thick:2000,storm:6500,density:.045,base:1300,detail:380,erode:.45,
  ambient:.45,forward:.72,maxDist:60000,maskN:512,maskSpan:100000,maskEvery:4,blend:.14,haze:45000,key:.55,amb:.9,budget:1.0};
 A.volTiers=['off','layers','volumes'];
 // THE DETAIL VOLUME: inverted Worley (1 at a feature point, 0 a cell away) at 3, 5 and 8 cells a period in R, G, B; the
 // feature points from KRAND (one a cell, wrapped so the volume tiles). [G data]: Godot bakes the same bytes (GODOT.md)
 A.skyDetailVolume=function(n){n=n==null?32:n;const out=new Uint8Array(n*n*n*4),F=[3,5,8];
  const pts=F.map((f,c)=>{const P=new Float64Array(f*f*f*3);for(let k=0;k<f;k++)for(let j=0;j<f;j++)for(let i=0;i<f;i++){const h=KRAND.hash(7001+c,i,j,k),q=((k*f+j)*f+i)*3;
   P[q]=i+KRAND.unit(KRAND.hash(h,1));P[q+1]=j+KRAND.unit(KRAND.hash(h,2));P[q+2]=k+KRAND.unit(KRAND.hash(h,3));}return P;});
  for(let z=0;z<n;z++)for(let y=0;y<n;y++)for(let x=0;x<n;x++){const o=((z*n+y)*n+x)*4;
   for(let c=0;c<3;c++){const f=F[c],P=pts[c],px=(x+.5)/n*f,py=(y+.5)/n*f,pz=(z+.5)/n*f,ci=Math.floor(px),cj=Math.floor(py),ck=Math.floor(pz);let best=9;
    for(let dk=-1;dk<=1;dk++)for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){const i=ci+di,j=cj+dj,k=ck+dk,wi=((i%f)+f)%f,wj=((j%f)+f)%f,wk=((k%f)+f)%f,q=((wk*f+wj)*f+wi)*3;
     const ex=P[q]+(i-wi)-px,ey=P[q+1]+(j-wj)-py,ez=P[q+2]+(k-wk)-pz,d=ex*ex+ey*ey+ez*ez;if(d<best)best=d;}
    out[o+c]=Math.round(255*Math.max(0,1-Math.sqrt(best)/.866));}
   out[o+3]=255;}
  return out;};
 const QUAD='varying vec2 vUv;void main(){vUv=position.xy*0.5+0.5;gl_Position=vec4(position.xy,0.0,1.0);}';
 // THE VOLUME, shared by the page's march and the sky's own pass (Godot): the density, the light march, the march; mask names the
 // function that gives the footprint at xz (the page's mask texture, or the field computed in place)
 const CORE=mask=>{const NR=A.SKY_MAX_RIDGES;return[
   // the sky's gradient noise (atmSkyNoise) read with textureLod: a fetch in a loop with no derivatives, so Direct3D keeps the loops
   // as loops (with texture() it unrolls 128 x 8 iterations: a compile of minutes)
   'float atmVNoise(vec3 x,uint s){vec3 o=vec3(float(s*7u%16u),float(s*11u%16u),float(s*13u%16u))+0.37*float(s/4u);',
   ' vec4 t=textureLod(uNoise,(x+o)/16.0,0.0);uint c=s%4u;return (c==0u?t.r:c==1u?t.g:c==2u?t.b:t.a)*2.0-1.0;}',
   // the layer's depth over a point: thin to thick as deep as the field is into the cloud, a storm's tower over it
   'float atmVTh(vec4 M){return mix(uVolT.x,uVolT.y,M.a)+uVolT.z*M.g*M.a*M.a;}',
   // the density (extinction, 1/m) at p: the footprint x the profile, carved by the base noise, eroded by the detail (det)
   'float atmVDens(vec3 p,vec4 M,bool det){if(M.r<=0.003)return 0.0;float h=(p.y-uCloudH.x)/atmVTh(M);if(h<=0.0||h>=1.0)return 0.0;',
   ' float dp=M.r*smoothstep(0.0,0.06,h)*(1.0-smoothstep(0.42,1.0,h));if(dp<=0.003)return 0.0;',
   ' vec3 w=vec3(uWind.x,0.0,uWind.y)*(uTime*uCloudH.w*uCloudH.z);vec3 q=(p-w)/uVolS.x;',
   ' float b=0.65*(atmVNoise(q*vec3(1.0,1.8,1.0),140u)*0.5+0.5)+0.35*(atmVNoise(q*vec3(2.03,3.6,2.03)+vec3(5.1,1.3,7.7),141u)*0.5+0.5);',
   ' b=clamp((b-0.22)/0.56,0.0,1.0);float d=clamp((b-(1.0-dp))/max(dp,1e-3),0.0,1.0);',
   ' if(det&&d>0.0){vec3 r=textureLod(uDetail,(p-w*1.4)/uVolS.y,0.0).rgb;float wv=r.r*0.625+r.g*0.25+r.b*0.125;float e=uVolS.z*mix(1.0-wv,wv,smoothstep(0.0,0.45,h));d=clamp((d-e)/(1.0-e),0.0,1.0);}',
   ' return d*uVolT.w;}',
   'float atmVHG(float c,float g){float g2=g*g;return (1.0-g2)/pow(max(1.0+g2-2.0*g*c,1e-4),1.5);}',
   // the light march: optical depth toward L, the steps doubling (60 m to ~6 km), no detail
   'float atmVTau(vec3 p,vec3 L){float tau=0.0,s=0.0,ds=60.0;for(int i=0;i<8;i++){if(i>=int(uVolS.w/100.0))break;s+=ds;vec3 q=p+L*s;tau+=atmVDens(q,'+mask+'(q.xz),false)*ds;ds*=1.9;}return tau;}',
   'float atmVRidgeEl(int i,float u){float x=fract(u)*1024.0;int a=int(floor(x));float t=x-float(a);return mix(texelFetch(uRidgeTex,ivec2(a,i),0).r,texelFetch(uRidgeTex,ivec2((a+1)&1023,i),0).r,t);}',
   // THE MARCH itself: (key, ambient, flash, opacity) along the ray from o toward d, Z its transmittance-weighted mean depth
   'vec4 atmVMarch(vec3 o,vec3 d,float jit,out float Z){Z=0.0;float hb=uCloudH.x,ht=hb+uVolT.y+uVolT.z,t0,t1;',
   ' if(abs(d.y)<1e-5){if(o.y<hb||o.y>ht)return vec4(0.0);t0=0.0;t1=uVolP.x;}',
   ' else{float a=(hb-o.y)/d.y,b=(ht-o.y)/d.y;t0=max(0.0,min(a,b));t1=min(max(a,b),uVolP.x);}',
   // the far ridges: a ray under a ridge's crest ends at that ridge
   ' float el=degrees(asin(clamp(d.y,-1.0,1.0))),u=degrees(atan(d.x,-d.z))/360.0;',
   ' for(int i=0;i<'+NR+';i++){if(i>=uRidgeN)break;if(el<atmVRidgeEl(i,u))t1=min(t1,uRidge[i].x);}',
   // the steps: from outside the layer, even over the path through it; from inside (flying in the cloud), 25 m at the eye growing
   // 5% a step (to ~35 km in 90 steps), and 1.6 times as many
   ' if(t1<=t0)return vec4(0.0);float N=mod(uVolS.w,100.0);bool ins=t0<1.0;if(ins)N=min(N*1.6,120.0);float du=max((t1-t0)/N,30.0),ds=ins?25.0:du;',
   // the key light: the sun by day, the giant by night
   ' float kd=smoothstep(-0.08,0.02,uSunDir.y);vec3 L=normalize(mix(uGiantDir,uSunDir,kd));float ct=dot(d,L);',
   ' float ph=mix(atmVHG(ct,uVolP.w),atmVHG(ct,-0.2),0.3);',
   ' float t=t0+ds*jit,T=1.0,K=0.0,Am=0.0,F=0.0,Zs=0.0;',
   ' for(int i=0;i<128;i++){if(float(i)>=N||t>t1||T<0.02)break;vec3 p=o+d*t;if(ins)ds=max(25.0,0.05*t);vec4 M='+mask+'(p.xz);',
   '  if(M.r>0.003){float sg=atmVDens(p,M,true);if(sg>0.0){float tau=atmVTau(p,L);float h=clamp((p.y-hb)/atmVTh(M),0.0,1.0);',
   '   float ms=0.0,ka=1.0,kb=1.0,kc=1.0;for(int o2=0;o2<3;o2++){ms+=ka*mix(1.0,ph,kc)*exp(-tau*kb);ka*=0.5;kb*=0.35;kc*=0.5;}',
   '   float Ts=exp(-sg*ds),w=T*(1.0-Ts);K+=w*ms*(1.0-exp(-2.0*sg*120.0)*0.5);Am+=w*(uVolP.z+(1.0-uVolP.z)*h)*(1.0-0.55*M.g);',
   '   if(uBolt.w>0.0){vec2 bd=p.xz-uBolt.xy;F+=w*exp(-dot(bd,bd)/(uBolt.z*uBolt.z))*(1.0-h);}',
   '   Zs+=w*t;T*=Ts;}}',
   '  t+=ds;}',
   ' float al=1.0-T;Z=al>0.002?Zs/al:0.0;return vec4(K,Am,F,al);}']};
 A.volGLSL={vertex:()=>QUAD,
  // 1 THE MASK: the field the shadows read (3 octaves), its cover, the cells' map; x the preset's cumulus (uCloud.y)
  mask:()=>['uniform highp sampler3D uNoise;uniform vec4 uCloud;uniform vec4 uCloudH;uniform vec2 uWind;uniform float uTime;uniform vec4 uMaskBox;',
   A.skyFieldGLSL(),'varying vec2 vUv;',
   'void main(){vec2 xz=uMaskBox.xy+(vUv-0.5)*uMaskBox.z;float n=atmCloudField(xz,3);',
   A.wxOn?' vec4 wm;float m=atmCloudCoverAt(n,xz,wm);float c=clamp(uCloud.x+wm.r*(1.0-uCloud.x),0.0,1.0);n+=0.15*wm.g;':' vec4 wm=vec4(0.0);float m=atmCloudCover(n);float c=uCloud.x;',
   // A: how far into the cloud (the field past the cover's threshold, over a broader ramp than the footprint's): the column's
   // height, so each cloud's top domes over its middle instead of standing flat at the layer's top
   ' gl_FragColor=vec4(m*uCloud.y,wm.g,wm.b,clamp((n-(1.0-c))/0.45,0.0,1.0));}'].join('\n'),
  // 2 THE MARCH, on the page: the mask from its texture
  march:()=>{const NR=A.SKY_MAX_RIDGES;return['uniform highp sampler3D uNoise;uniform highp sampler3D uDetail;uniform sampler2D uMask;',
   'uniform vec4 uCloudH;uniform vec2 uWind;uniform float uTime;uniform vec3 uCamPos;uniform vec3 uSunDir;uniform vec3 uGiantDir;',
   'uniform vec4 uMaskBox;uniform vec4 uVolT;uniform vec4 uVolS;uniform vec4 uVolP;uniform vec4 uBolt;uniform mat4 uInvProj;uniform mat4 uCamRot;',
   'uniform sampler2D uRidgeTex;uniform int uRidgeN;uniform vec4 uRidge['+NR+'];uniform float uVolF;','varying vec2 vUv;',
   // the mask at xz; beyond its edge the mean cover with no shape (uMaskBox.w)
   'vec4 atmVM(vec2 xz){vec2 uv=(xz-uMaskBox.xy)/uMaskBox.z+0.5;float e=max(abs(uv.x-0.5),abs(uv.y-0.5));return mix(textureLod(uMask,uv,0.0),vec4(uMaskBox.w,0.0,0.0,0.5),smoothstep(0.45,0.5,e));}'].concat(CORE('atmVM'),[
   'void main(){vec4 c=uInvProj*vec4(vUv*2.0-1.0,1.0,1.0);vec3 d=normalize((uCamRot*vec4(c.xyz/c.w,0.0)).xyz);',
      // the jitter: interleaved gradient noise whose PATTERN moves each frame (the pixel offset 5.588238 a frame, 64 frames a cycle):
   // with only its value shifted, the same diagonal pattern stood in every frame and the history kept it (a pixelated dither)
   ' vec2 jp=gl_FragCoord.xy+5.588238*uVolF;float Z;vec4 v=atmVMarch(uCamPos,d,fract(52.9829189*fract(dot(jp,vec2(0.06711056,0.00583715)))),Z);',
   ' gl_FragColor=v.a<0.002?vec4(0.0):vec4(v.rgb,floor(Z/8.0)+min(v.a,0.999));}']).join('\n');},
  // THE SKY'S OWN PASS (Godot: a sky shader's quarter-res pass, godot/tools/atmos_volclouds.js): the same march with the mask
  // computed in place from the field (no mask pass, no history, the sky behind everything), lit and hazed as the composite
  // does. Included after the sky chunk (atmos_sky), whose uniforms and field it reads: vec4 atmVolSky(d, eye, jitter) is
  // the premultiplied colour and the opacity
  sky:()=>['uniform highp sampler3D uDetail;uniform vec4 uVolT;uniform vec4 uVolS;uniform vec4 uVolP;uniform vec4 uVolC;uniform vec4 uBolt;uniform vec3 uFlashC;uniform float uFlash;',
   'vec4 atmVSM(vec2 xz){float n=atmCloudField(xz,3);return vec4(atmCloudCover(n)*uCloud.y,0.0,0.0,clamp((n-(1.0-uCloud.x))/0.45,0.0,1.0));}'].concat(CORE('atmVSM'),[
   'vec4 atmVolSky(vec3 d,vec3 o,float jit){float z;vec4 v=atmVMarch(o,d,jit,z);if(v.a<0.002)return vec4(0.0);',
   ' float kd=smoothstep(-0.08,0.02,uSunDir.y);vec3 key=uSunC*uSunI*(1.0-uEclipse)*kd+uShineC*uShineI*0.8*(1.0-kd);vec3 amb=mix(uZen,uHor,0.55);',
   ' vec3 col=key*(uVolC.x*v.r)+amb*(uVolC.y*v.g)+uFlashC*(uFlash*v.b*2.5);vec3 air=mix(uFogC,uZen,smoothstep(0.0,0.45,d.y));col=mix(col,air*v.a,1.0-exp(-z/uVolC.z));',
   ' float fd=1.0-smoothstep(0.75*uVolC.w,uVolC.w,z);return vec4(col*fd,v.a*fd);}']).join('\n'),
  // 3 THE RESOLVE: last frame's result reprojected at this texel's cloud depth, clamped to the new neighbourhood, blended
  resolve:()=>['uniform highp sampler2D uCur;uniform highp sampler2D uHist;uniform mat4 uPrevVP;uniform mat4 uInvProj;uniform mat4 uCamRot;uniform vec3 uCamPos;',
   'uniform float uBlend;uniform float uHistOk;varying vec2 vUv;',
   'vec4 atmVU(vec4 c){float z=floor(c.a);return vec4(c.rgb,c.a-z);}',   // (K, Am, F, alpha)
   'float atmVZ(vec4 c){return floor(c.a)*8.0;}',
   'vec4 atmVHist(vec2 uv,out float z){vec2 sz=vec2(textureSize(uHist,0));vec2 f=uv*sz-0.5;ivec2 i=ivec2(floor(f));vec2 t=fract(f);ivec2 m=ivec2(sz)-1;',
   ' vec4 a=texelFetch(uHist,clamp(i,ivec2(0),m),0),b=texelFetch(uHist,clamp(i+ivec2(1,0),ivec2(0),m),0),c=texelFetch(uHist,clamp(i+ivec2(0,1),ivec2(0),m),0),d=texelFetch(uHist,clamp(i+ivec2(1,1),ivec2(0),m),0);',
   ' vec4 ua=atmVU(a),ub=atmVU(b),uc=atmVU(c),ud=atmVU(d);vec4 r=mix(mix(ua,ub,t.x),mix(uc,ud,t.x),t.y);',
   ' float wa=ua.a*(1.0-t.x)*(1.0-t.y),wb=ub.a*t.x*(1.0-t.y),wc=uc.a*(1.0-t.x)*t.y,wd=ud.a*t.x*t.y;z=(atmVZ(a)*wa+atmVZ(b)*wb+atmVZ(c)*wc+atmVZ(d)*wd)/max(wa+wb+wc+wd,1e-6);return r;}',
   'void main(){ivec2 p=ivec2(gl_FragCoord.xy);ivec2 m=textureSize(uCur,0)-1;vec4 c0=texelFetch(uCur,p,0);vec4 c=atmVU(c0);float z=atmVZ(c0);',
   // the new frame through a 3x3 tent (the march's jitter is noise at the texel scale: blended raw, it shows as a dither), and the
   // history clipped to the neighbourhood's mean +- 1.25 sigma (a min-max box passes the noise's extremes)
   ' vec4 cf=vec4(0.0),m1=vec4(0.0),m2=vec4(0.0);float zw=0.0,zs=0.0;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec4 r=texelFetch(uCur,clamp(p+ivec2(i,j),ivec2(0),m),0);vec4 n=atmVU(r);',
   '  float w=(i==0?2.0:1.0)*(j==0?2.0:1.0);cf+=n*w;m1+=n;m2+=n*n;if(n.a>0.002){zs+=atmVZ(r)*n.a*w;zw+=n.a*w;}}',
   ' cf/=16.0;m1/=9.0;vec4 sd=sqrt(max(m2/9.0-m1*m1,vec4(0.0)));vec4 mn=min(m1-1.25*sd,cf),mx=max(m1+1.25*sd,cf);c=cf;if(c.a>0.002&&zw>0.0&&!(c0.a>=1.0))z=zs/zw;',
   ' vec4 o=c;float zo=z;',
   ' if(uHistOk>0.5){vec4 cc=uInvProj*vec4(vUv*2.0-1.0,1.0,1.0);vec3 d=normalize((uCamRot*vec4(cc.xyz/cc.w,0.0)).xyz);float zz=c.a>0.002?z:20000.0;',
   '  vec4 pc=uPrevVP*vec4(uCamPos+d*zz,1.0);vec2 puv=pc.xy/pc.w*0.5+0.5;',
   '  if(pc.w>0.0&&puv.x>0.0&&puv.y>0.0&&puv.x<1.0&&puv.y<1.0){float zh;vec4 h=clamp(atmVHist(puv,zh),mn,mx);o=mix(h,c,uBlend);zo=c.a>0.002?z:zh;}}',
   ' gl_FragColor=o.a<0.002?vec4(0.0):vec4(o.rgb,floor(zo/8.0)+min(o.a,0.999));}'].join('\n'),
  // 4 THE COMPOSITE, over the world at full resolution: the light from the sky's uniforms, the haze, the cloud's depth
  // With the clouds' mood (A.skyMoodOn: Ancient's Valley) each pixel's cloud takes the mood the flat cumulus took: its place from
  // the march's depth, the dark, the tint (and the sheets' tint by the field's walk there), the glow at night; shaded by the
  // march's lit fraction, as thick as its opacity. The turbulence already shaped the footprint (the mask reads the same field)
  composite:()=>['uniform highp sampler2D uVol;uniform mat4 uInvProj;uniform mat4 uCamRot;uniform mat4 uVP;uniform vec3 uCamPos;uniform float uLogFC;',
   'uniform vec3 uSunDir,uGiantDir,uSunC,uZen,uHor,uShineC,uFogC,uFlashC;uniform float uSunI,uEclipse,uShineI,uFlash;uniform vec4 uVolC;varying vec2 vUv;'].concat(
   A.skyMoodOn?['uniform highp sampler3D uNoise;uniform vec4 uCloud;uniform vec4 uCloudH;uniform vec2 uWind;uniform float uTime;uniform float uNight;uniform float uPixAng;',A.skyFieldGLSL(),A.skyMoodGLSL()]:[],[
   'vec4 atmVU(vec4 c){float z=floor(c.a);return vec4(c.rgb,c.a-z);}',
   'void main(){vec2 sz=vec2(textureSize(uVol,0));vec2 f=vUv*sz-0.5;ivec2 i=ivec2(floor(f));vec2 t=fract(f);ivec2 m=ivec2(sz)-1;',
   ' vec4 a=texelFetch(uVol,clamp(i,ivec2(0),m),0),b=texelFetch(uVol,clamp(i+ivec2(1,0),ivec2(0),m),0),c=texelFetch(uVol,clamp(i+ivec2(0,1),ivec2(0),m),0),e=texelFetch(uVol,clamp(i+ivec2(1,1),ivec2(0),m),0);',
   ' vec4 ua=atmVU(a),ub=atmVU(b),uc=atmVU(c),ue=atmVU(e);vec4 v=mix(mix(ua,ub,t.x),mix(uc,ue,t.x),t.y);if(v.a<0.003)discard;',
   ' float wa=ua.a*(1.0-t.x)*(1.0-t.y),wb=ub.a*t.x*(1.0-t.y),wc=uc.a*(1.0-t.x)*t.y,we=ue.a*t.x*t.y;',
   ' float z=(floor(a.a)*wa+floor(b.a)*wb+floor(c.a)*wc+floor(e.a)*we)*8.0/max(wa+wb+wc+we,1e-6);',
   ' vec4 cc=uInvProj*vec4(vUv*2.0-1.0,1.0,1.0);vec3 d=normalize((uCamRot*vec4(cc.xyz/cc.w,0.0)).xyz);',
   ' float kd=smoothstep(-0.08,0.02,uSunDir.y);vec3 key=uSunC*uSunI*(1.0-uEclipse)*kd+uShineC*uShineI*0.8*(1.0-kd);vec3 amb=mix(uZen,uHor,0.55);',
   ' vec3 col=key*(uVolC.x*v.r)+amb*(uVolC.y*v.g)+uFlashC*(uFlash*v.b*2.5);',
   A.skyMoodOn?' {vec2 cx=uCamPos.xz+d.xz*z;vec2 sw=vec2(0.0);if(uCloudZ.x>0.0){atmCloudField(cx,1);sw=atmSheetW;}float ia=1.0/max(v.a,1e-3);col=atmCloudMood(col*ia,clamp(v.r*ia,0.0,1.0),v.a,cx,sw)*v.a;}':'',
   ' vec3 air=mix(uFogC,uZen,smoothstep(0.0,0.45,d.y));col=mix(col,air*v.a,1.0-exp(-z/uVolC.z));',
   ' float fd=1.0-smoothstep(0.75*uVolC.w,uVolC.w,z);gl_FragColor=vec4(col*fd,v.a*fd);',
   ' vec4 cp=uVP*vec4(uCamPos+d*z,1.0);gl_FragDepth=uLogFC>0.0?log2(max(1.0+cp.w,1e-6))*uLogFC*0.5:clamp(cp.z/cp.w*0.5+0.5,0.0,1.0);}']).join('\n')};
 A.volOn=true;   /* read by the sky's chunk and its host: the flat cumulus's switch (uVolOn) and the shadows' height (uVolMidH) compile in */
})();
