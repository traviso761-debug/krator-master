// ================================================================= ATMOS — fx: radiation, a warm glow filling a zone of air (ATMOS.radiation)
// [G shader] + [G data] + [web] (the owner, 2026-11-10: "a visible 'radiation' ambient atmos effect ... fills the affected area with a
// subtle warm glow and heat-haze-like shimmer. it should not obscure anything but should be noticeable from a fair distance").
// A ZONE is a ball of glowing air: centre (x, y, z), radius r, its density 1 at the centre falling to 0 at the edge as 1 - d^2 / r^2.
// What the eye sees along a view ray is the density summed along the ray's chord through the ball, in CLOSED FORM (no marching),
// over the chord straight through the centre (4r/3): 1 looking through the heart of a zone, falling smoothly to 0 at its limb.
// That number times the zone's strength is ADDED to the pixel in the zone's colour: nothing is ever darkened or hidden, a wall
// inside the zone stops the sum at the wall (so near things glow less than the air behind them), and from far off the whole
// chord shows: a soft warm dome on the land. The shimmer is a slow wavering of the glow itself, rising, in bands a few to a zone.
//   ATMOS.radiation({zones: [{x, y, z, r, strength (.16), shimmer (.35), pulse (.3: the zone breathes IN AND OUT: its glow swells and ebbs by this share and its edge moves out and back by half of it, a breath of about 6 s with a slower one under it, each zone out of step; the shimmer's rings swing out and in with it, nothing travels upward)}] (at most 4), colour (display [1, .62, .25])}) -> R
//       R.zones (edit a zone and call R.set()), R.k (a master strength, 1: fade it in and out), R.on(material), R.off
//   ATMOS.radiationScene(scene)   every lit material with fog on takes the glow, once (as heightFogScene): its fragments add the
//                                 chord up to themselves. The sky behind a zone takes it from a shell the call draws at the far
//                                 plane (only where no geometry was drawn), so a zone reads against the sky from a distance
//   ATMOS.radGLSL()               the chunk: atmRadChord, atmRadShim, atmRadOne, atmRad(ro, rd, L)
//   ATMOS.radChord(ro, rd, L, zone)   the JS twin of the chord (0..1)        ATMOS.radGlow(ro, rd, L, zones) the summed strength
//   ATMOS.radAt(zones, x, y, z)       the density at a point (0..1, the largest zone's): placement, a meter, core/hazard
//   ATMOS.radiationHeat(zones, o)     the zones as a raster of degrees {x0, z0, cell, nx, nz, T} for ATMOS.shimmer (fx/89-atmos-fx-
//                                     shimmer.js): a page with that post pass bends the light over the zone too (true heat haze)
//   ATMOS.radiationHaze({renderer, amp (.006 of the screen's height at full), speed (1.2), scale (38: the waver's cells across the
//                         screen)}) -> H   TRUE HEAT HAZE (the owner, 2026-11-10: "try it like a true bent light heat haze"): a
//       post pass. H.draw(render, camera, dt): `render` draws the page's frame as usual (it lands in H's target, with depth); each
//       pixel then takes its colour from a little beside itself, the offset swinging to and fro and swelling with the breath, by how much zone air its ray
//       crosses up to what it shows (ATMOS.radHazeK: the zones' shimmer x chord, summed, capped at 1; the sky the whole chord). So
//       the land and sky BEHIND a zone swim, things in front of it hold still, and it reads from as far as the zone does. H.k
//       {value} is a master strength. The target is not multisampled (the shimmer pass's note). H.setSize, H.dispose
//   ATMOS.radHazeK(ro, rd, L, zones)   the pass's strength along a ray (0..1), for a probe and Godot
// It registers core/hazard's `radiation` field when the page's KHAZ takes one (ATMOS.khaz: false otherwise). A material of the
// page's own (a ShaderMaterial, water) takes ATMOS.radGLSL() and adds atmRad itself, or stays without the glow.
// Godot: the chunk as a .gdshaderinc added in fragment() of the ground and plant shaders (ALBEDO untouched: EMISSION += atm_rad),
// the zones as global uniform arrays; or, with volumetric fog on, a FogVolume ellipsoid a zone with emission and no density.
(function(){const A=ATMOS;
 A.RAD_MAX=4;
 A.radChord=(ro,rd,L,z)=>{const ox=ro[0]-z.x,oy=ro[1]-(z.y==null?0:z.y),oz=ro[2]-z.z,b=ox*rd[0]+oy*rd[1]+oz*rd[2],d2=ox*ox+oy*oy+oz*oz-b*b,R2=z.r*z.r;if(!(z.r>0)||d2>=R2)return 0;
  const h=Math.sqrt(R2-d2),s0=Math.max(-b-h,0)+b,s1=Math.min(-b+h,L)+b;if(s1<=s0)return 0;return((1-d2/R2)*(s1-s0)-(s1*s1*s1-s0*s0*s0)/(3*R2))/(4/3*z.r);};
 A.radGlow=(ro,rd,L,zones)=>zones.reduce((s,z)=>s+(z.strength==null?.16:z.strength)*A.radChord(ro,rd,L,z),0);
 A.radHazeK=(ro,rd,L,zones)=>Math.min(1,zones.reduce((s,z)=>s+(z.shimmer==null?.35:z.shimmer)*A.radChord(ro,rd,L,z),0)*2);
 A.radPulse=(t,pulse,i)=>1+(pulse==null?.3:pulse)*(.65*Math.sin(t*1.1+i*2.1)+.35*Math.sin(t*.43+i*2.1*2.3));   /* the twin of the chunk's pulse: zone i's factor at t seconds */
 A.radAt=(zones,x,y,z)=>zones.reduce((m,q)=>{const dx=x-q.x,dy=y-(q.y==null?0:q.y),dz=z-q.z;return Math.max(m,q.r>0?Math.max(0,1-(dx*dx+dy*dy+dz*dz)/(q.r*q.r)):0);},0);
 A.radiationHeat=(zones,o)=>{o=o||{};const cell=o.cell==null?8:o.cell,t0=o.t0==null?25:o.t0,t1=o.t1==null?70:o.t1;let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9;
  for(const q of zones){x0=Math.min(x0,q.x-q.r);z0=Math.min(z0,q.z-q.r);x1=Math.max(x1,q.x+q.r);z1=Math.max(z1,q.z+q.r);}
  if(!zones.length)return{x0:0,z0:0,cell,nx:1,nz:1,T:new Float32Array(1)};
  const nx=Math.max(2,Math.ceil((x1-x0)/cell)+1),nz=Math.max(2,Math.ceil((z1-z0)/cell)+1),T=new Float32Array(nx*nz);
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=x0+i*cell,z=z0+j*cell;T[j*nx+i]=t0+(t1-t0)*zones.reduce((m,q)=>Math.max(m,Math.max(0,1-((x-q.x)*(x-q.x)+(z-q.z)*(z-q.z))/(q.r*q.r))),0);}   /* by the distance on the plan: the ground under a zone */
  return{x0,z0,cell,nx,nz,T};};
 A.radGLSL=()=>['#ifndef ATM_RAD_CHUNK','#define ATM_RAD_CHUNK',
  'uniform vec4 atmRadZ['+A.RAD_MAX+'];uniform vec4 atmRadK['+A.RAD_MAX+'];uniform vec3 atmRadC;uniform float atmRadT;',
  /* atmRadZ: a zone's centre and radius (0: none); atmRadK: its strength, its shimmer, its pulse (0..1 of the strength), the pulse's phase; atmRadC: the glow, display RGB; atmRadT: seconds */
  'float atmRadChord(vec3 ro,vec3 rd,float L,vec4 z){vec3 oc=ro-z.xyz;float b=dot(oc,rd),d2=dot(oc,oc)-b*b,R2=z.w*z.w;if(z.w<=0.0||d2>=R2)return 0.0;',
  ' float h=sqrt(R2-d2),s0=max(-b-h,0.0)+b,s1=min(-b+h,L)+b;if(s1<=s0)return 0.0;return ((1.0-d2/R2)*(s1-s0)-(s1*s1*s1-s0*s0*s0)/(3.0*R2))/(1.3333333*z.w);}',
  /* the shimmer: rings about the zone's centre that swell out and draw back in (their phase swings, it does not travel), broken round the compass */
  'float atmRadShim(vec3 q,float t,float ph){float r=length(q);return sin(r*11.0-2.6*sin(t*0.9+ph))*(0.6+0.4*sin(q.x*4.0+q.z*3.3+q.y*2.1));}',
  'float atmRadOne(vec3 ro,vec3 rd,float L,int i){vec4 z=atmRadZ[i];float pw=0.65*sin(atmRadT*1.1+atmRadK[i].w)+0.35*sin(atmRadT*0.43+atmRadK[i].w*2.3);z.w*=1.0+0.5*atmRadK[i].z*pw;float c=atmRadChord(ro,rd,L,z);if(c<=0.0)return 0.0;',
  ' vec3 pm=ro+rd*clamp(-dot(ro-z.xyz,rd),0.0,L);float pu=1.0+atmRadK[i].z*pw;return atmRadK[i].x*pu*c*(1.0+atmRadK[i].y*atmRadShim((pm-z.xyz)/z.w,atmRadT,atmRadK[i].w));}',
  'vec3 atmRad(vec3 ro,vec3 rd,float L){float g=0.0;for(int i=0;i<'+A.RAD_MAX+';i++)g+=atmRadOne(ro,rd,L,i);return atmRadC*g;}',
  'float atmRadHazeK(vec3 ro,vec3 rd,float L){float k=0.0;for(int i=0;i<'+A.RAD_MAX+';i++)k+=atmRadK[i].y*atmRadChord(ro,rd,L,atmRadZ[i]);return min(1.0,k*2.0);}',
  '#endif'].join('\n');
 A.radiation=function(o){o=o||{};const T=A.T,U=A.U,N=A.RAD_MAX;
  U.radZ={value:Array.from({length:N},()=>new T.Vector4())};U.radK={value:Array.from({length:N},()=>new T.Vector4())};U.radC={value:new T.Vector3()};U.radT={value:0};
  const R=A.rad={zones:(o.zones||[]).slice(0,N).map(z=>Object.assign({y:0,strength:.16,shimmer:.35,pulse:.3},z)),colour:o.colour||[1,.62,.25],k:1,off:false,shells:[]};
  R.set=()=>{for(let i=0;i<N;i++){const z=R.zones[i],on=z&&!R.off;U.radZ.value[i].set(on?z.x:0,on?z.y:0,on?z.z:0,on?z.r:0);U.radK.value[i].set(on?z.strength*R.k:0,on?z.shimmer:0,on?z.pulse:0,i*2.1);
    const s=R.shells[i];if(s){s.visible=!!on;if(on){s.position.set(z.x,z.y,z.z);s.scale.setScalar(z.r*(1+.5*z.pulse)+1);}}}
   U.radC.value.set(R.colour[0],R.colour[1],R.colour[2]);return R;};
  R.on=m=>A.radiationOn(m);
  /* the sky's share: a shell a zone at the far plane, drawn after the world, so it shows only where nothing else was drawn */
  for(let i=0;i<N;i++){const m=new T.ShaderMaterial({uniforms:{atmRadZ:U.radZ,atmRadK:U.radK,atmRadC:U.radC,atmRadT:U.radT},side:T.BackSide,transparent:true,depthWrite:false,blending:T.AdditiveBlending,fog:false,toneMapped:false,
    vertexShader:'varying vec3 vAtmRadP;void main(){vec4 w=modelMatrix*vec4(position,1.0);vAtmRadP=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;gl_Position.z=gl_Position.w*0.99999;}',
    fragmentShader:A.radGLSL()+'\nvarying vec3 vAtmRadP;void main(){vec3 d=vAtmRadP-cameraPosition;gl_FragColor=vec4(atmRadC*atmRadOne(cameraPosition,normalize(d),1e9,'+i+'),1.0);}'});
   const s=new T.Mesh(new T.SphereGeometry(1,32,16),m);s.name='atmos:radiation-sky-'+i;s.renderOrder=900;s.frustumCulled=false;s.visible=false;A.noRay(s);A.add(s);R.shells.push(s);}
  R.set();A.hook(t=>{U.radT.value=t;});
  A.khaz('radiation',(x,y,z)=>R.off?0:A.radAt(R.zones,x,y,z)*R.k);
  A.rec('radiation',{zones:R.zones.map(z=>({x:z.x,y:z.y,z:z.z,r:z.r,strength:z.strength,shimmer:z.shimmer,pulse:z.pulse})),colour:R.colour,
   note:'additive glow = colour * sum of strength * (the chord integral of 1 - d^2/r^2 through each zone, over 4r/3), wavering by shimmer; nothing is dimmed (fx/89-atmos-fx-radiation.js)'});
  return R;};
 A.radiationHaze=function(o){o=o||{};const T=A.T,U=A.U,R=o.renderer;if(!R)throw new Error('ATMOS.radiationHaze: renderer');if(!U.radZ)throw new Error('ATMOS.radiationHaze: call ATMOS.radiation first');
  const sz=R.getDrawingBufferSize(new T.Vector2()),rt=new T.WebGLRenderTarget(sz.x,sz.y,{depthBuffer:true});rt.depthTexture=new T.DepthTexture(sz.x,sz.y);rt.depthTexture.type=T.UnsignedIntType;
  rt.texture.encoding=R.outputEncoding;   /* the frame lands in the target as it would on the screen (r128 tone-maps and encodes into it); the pass only moves pixels */
  const HU={tC:{value:rt.texture},tD:{value:rt.depthTexture},uInvP:{value:new T.Matrix4()},uCam:{value:new T.Matrix4()},uEye:{value:new T.Vector3()},
   uAmp:{value:new T.Vector4(o.amp==null?.006:o.amp,o.speed==null?1.2:o.speed,o.scale==null?38:o.scale,sz.x/sz.y)},uT:{value:0},uK:{value:1},atmRadZ:U.radZ,atmRadK:U.radK,atmRadC:U.radC,atmRadT:U.radT};
  const m=new T.ShaderMaterial({uniforms:HU,depthTest:false,depthWrite:false,toneMapped:false,
   vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}',
   fragmentShader:[A.radGLSL(),'uniform sampler2D tC;uniform sampler2D tD;uniform mat4 uInvP;uniform mat4 uCam;uniform vec3 uEye;uniform vec4 uAmp;uniform float uT;uniform float uK;varying vec2 vUv;',
    'float hzN(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);vec4 h=fract(sin(vec4(dot(i,vec2(127.1,311.7)),dot(i+vec2(1.0,0.0),vec2(127.1,311.7)),dot(i+vec2(0.0,1.0),vec2(127.1,311.7)),dot(i+vec2(1.0,1.0),vec2(127.1,311.7))))*43758.5453);return mix(mix(h.x,h.y,f.x),mix(h.z,h.w,f.x),f.y);}',
    /* how much zone air lies between the eye and what this pixel shows (the sky: the whole chord) */
    'float hzK(vec2 uv){float d=texture2D(tD,uv).x;vec4 v=uInvP*vec4(uv*2.0-1.0,min(d,0.99999)*2.0-1.0,1.0);v/=v.w;vec3 w=(uCam*vec4(v.xyz,1.0)).xyz-uEye;float L=length(w);return atmRadHazeK(uEye,w/max(L,1e-4),d>=0.99999?1e9:L);}',
    'void main(){float k=hzK(vUv)*uK;vec4 c=texture2D(tC,vUv);',
    /* the bend swings to and fro and swells and ebbs with the breath: no upward drift */
    ' if(k>0.0){vec2 p=vec2(vUv.x*uAmp.w,vUv.y)*uAmp.z;float w=uT*uAmp.y;vec2 q=vec2(hzN(p+0.55*vec2(sin(w*0.9),cos(w*0.7)))-0.5,hzN(p*1.7+vec2(5.2,0.0)+0.55*vec2(cos(w*0.8),sin(w*1.1)))-0.5);',
    '  vec2 uv2=vUv+q*uAmp.x*k*2.0*(0.65+0.35*sin(w*0.9));float k2=hzK(uv2)*uK;if(k2>0.0)c=texture2D(tC,mix(vUv,uv2,min(1.0,k2/k)));}',   /* never pull in a pixel that stands in front of the zone */
    ' gl_FragColor=c;}'].join('\n')});
  const quad=new T.Mesh(new T.PlaneGeometry(2,2),m),cam=new T.OrthographicCamera(-1,1,1,-1,0,1),post=new T.Scene();quad.frustumCulled=false;post.add(quad);
  const setSize=(w,h)=>{rt.setSize(w,h);rt.depthTexture.image.width=w;rt.depthTexture.image.height=h;HU.uAmp.value.w=w/h;};
  const H={k:HU.uK,uniforms:HU,target:rt,setSize,
   draw:(render,camera,dt)=>{R.getDrawingBufferSize(sz);if(sz.x!==rt.width||sz.y!==rt.height)setSize(sz.x,sz.y);HU.uT.value+=dt||0;
    camera.updateMatrixWorld();HU.uInvP.value.copy(camera.projectionMatrixInverse);HU.uCam.value.copy(camera.matrixWorld);HU.uEye.value.setFromMatrixPosition(camera.matrixWorld);
    R.setRenderTarget(rt);render();R.setRenderTarget(null);const ac=R.autoClear;R.autoClear=true;R.render(post,cam);R.autoClear=ac;},
   dispose:()=>{rt.dispose();m.dispose();quad.geometry.dispose();}};
  A.rec('radiationhaze',{amp:HU.uAmp.value.x,speed:HU.uAmp.value.y,scale:HU.uAmp.value.z,note:'a post pass: each pixel reads from an offset that wavers upward, scaled by min(1, 2 x the sum of shimmer x chord) through the zones up to its depth'});
  return H;};
 A.radiationOn=function(mat){if(!mat||!A.U||!A.U.radZ)return mat;const K=A.KH();
  return A.shaderHook(mat,'atmos-radiation',function(sh){const U=A.U;
   if(sh.fragmentShader.indexOf('#include <dithering_fragment>')<0||sh.vertexShader.indexOf('#include <fog_vertex>')<0)return;
   sh.uniforms.atmRadZ=U.radZ;sh.uniforms.atmRadK=U.radK;sh.uniforms.atmRadC=U.radC;sh.uniforms.atmRadT=U.radT;
   /* the eye from the view matrix (r128 gives a Lambert fragment no cameraPosition: the height fog's note) */
   sh.vertexShader='varying vec3 vAtmRadP;varying vec3 vAtmRadE;\n'+K.rep(sh.vertexShader,'#include <fog_vertex>','#include <fog_vertex>\n{vec4 atmRP=vec4(transformed,1.0);\n#ifdef USE_INSTANCING\natmRP=instanceMatrix*atmRP;\n#endif\nvAtmRadP=(modelMatrix*atmRP).xyz;vAtmRadE=-(transpose(mat3(viewMatrix))*viewMatrix[3].xyz);}');
   sh.fragmentShader='varying vec3 vAtmRadP;varying vec3 vAtmRadE;\n'+A.radGLSL()+'\n'+K.rep(sh.fragmentShader,'#include <dithering_fragment>',
    '{vec3 atmRd=vAtmRadP-vAtmRadE;float atmRL=length(atmRd);gl_FragColor.rgb+=atmRad(vAtmRadE,atmRd/max(atmRL,1e-4),atmRL);}\n#include <dithering_fragment>');});};
 A.radiationScene=function(scene,o){o=o||{};const seen=new Set();let n=0;scene.traverse(ob=>{if(!ob.isMesh||!ob.material||ob.userData.noRadiation)return;
  for(const m of(Array.isArray(ob.material)?ob.material:[ob.material])){if(seen.has(m)||m.userData.noRadiation)continue;seen.add(m);
   if(!(m.isMeshLambertMaterial||m.isMeshStandardMaterial||m.isMeshPhongMaterial||(o.basic&&m.isMeshBasicMaterial)))continue;A.radiationOn(m);n++;}});return n;};
})();
