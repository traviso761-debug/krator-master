// ================================================================= ATMOS — fx: radiation, a warm glow filling a zone of air (ATMOS.radiation)
// [G shader] + [G data] + [web] (the owner, 2026-11-10: "a visible 'radiation' ambient atmos effect ... fills the affected area with a
// subtle warm glow and heat-haze-like shimmer. it should not obscure anything but should be noticeable from a fair distance").
// A ZONE is a ball of glowing air: centre (x, y, z), radius r, its density 1 at the centre falling to 0 at the edge as 1 - d^2 / r^2.
// What the eye sees along a view ray is the density summed along the ray's chord through the ball, in CLOSED FORM (no marching),
// over the chord straight through the centre (4r/3): 1 looking through the heart of a zone, falling smoothly to 0 at its limb.
// That number times the zone's strength is ADDED to the pixel in the zone's colour: nothing is ever darkened or hidden, a wall
// inside the zone stops the sum at the wall (so near things glow less than the air behind them), and from far off the whole
// chord shows: a soft warm dome on the land. The shimmer is a slow wavering of the glow itself, rising, in bands a few to a zone.
//   ATMOS.radiation({zones: [{x, y, z, r, strength (.16), shimmer (.35)}] (at most 4), colour (display [1, .62, .25])}) -> R
//       R.zones (edit a zone and call R.set()), R.k (a master strength, 1: fade it in and out), R.on(material), R.off
//   ATMOS.radiationScene(scene)   every lit material with fog on takes the glow, once (as heightFogScene): its fragments add the
//                                 chord up to themselves. The sky behind a zone takes it from a shell the call draws at the far
//                                 plane (only where no geometry was drawn), so a zone reads against the sky from a distance
//   ATMOS.radGLSL()               the chunk: atmRadChord, atmRadShim, atmRadOne, atmRad(ro, rd, L)
//   ATMOS.radChord(ro, rd, L, zone)   the JS twin of the chord (0..1)        ATMOS.radGlow(ro, rd, L, zones) the summed strength
//   ATMOS.radAt(zones, x, y, z)       the density at a point (0..1, the largest zone's): placement, a meter, core/hazard
//   ATMOS.radiationHeat(zones, o)     the zones as a raster of degrees {x0, z0, cell, nx, nz, T} for ATMOS.shimmer (fx/89-atmos-fx-
//                                     shimmer.js): a page with that post pass bends the light over the zone too (true heat haze)
// It registers core/hazard's `radiation` field when the page's KHAZ takes one (ATMOS.khaz: false otherwise). A material of the
// page's own (a ShaderMaterial, water) takes ATMOS.radGLSL() and adds atmRad itself, or stays without the glow.
// Godot: the chunk as a .gdshaderinc added in fragment() of the ground and plant shaders (ALBEDO untouched: EMISSION += atm_rad),
// the zones as global uniform arrays; or, with volumetric fog on, a FogVolume ellipsoid a zone with emission and no density.
(function(){const A=ATMOS;
 A.RAD_MAX=4;
 A.radChord=(ro,rd,L,z)=>{const ox=ro[0]-z.x,oy=ro[1]-(z.y==null?0:z.y),oz=ro[2]-z.z,b=ox*rd[0]+oy*rd[1]+oz*rd[2],d2=ox*ox+oy*oy+oz*oz-b*b,R2=z.r*z.r;if(!(z.r>0)||d2>=R2)return 0;
  const h=Math.sqrt(R2-d2),s0=Math.max(-b-h,0)+b,s1=Math.min(-b+h,L)+b;if(s1<=s0)return 0;return((1-d2/R2)*(s1-s0)-(s1*s1*s1-s0*s0*s0)/(3*R2))/(4/3*z.r);};
 A.radGlow=(ro,rd,L,zones)=>zones.reduce((s,z)=>s+(z.strength==null?.16:z.strength)*A.radChord(ro,rd,L,z),0);
 A.radAt=(zones,x,y,z)=>zones.reduce((m,q)=>{const dx=x-q.x,dy=y-(q.y==null?0:q.y),dz=z-q.z;return Math.max(m,q.r>0?Math.max(0,1-(dx*dx+dy*dy+dz*dz)/(q.r*q.r)):0);},0);
 A.radiationHeat=(zones,o)=>{o=o||{};const cell=o.cell==null?8:o.cell,t0=o.t0==null?25:o.t0,t1=o.t1==null?70:o.t1;let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9;
  for(const q of zones){x0=Math.min(x0,q.x-q.r);z0=Math.min(z0,q.z-q.r);x1=Math.max(x1,q.x+q.r);z1=Math.max(z1,q.z+q.r);}
  if(!zones.length)return{x0:0,z0:0,cell,nx:1,nz:1,T:new Float32Array(1)};
  const nx=Math.max(2,Math.ceil((x1-x0)/cell)+1),nz=Math.max(2,Math.ceil((z1-z0)/cell)+1),T=new Float32Array(nx*nz);
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=x0+i*cell,z=z0+j*cell;T[j*nx+i]=t0+(t1-t0)*zones.reduce((m,q)=>Math.max(m,Math.max(0,1-((x-q.x)*(x-q.x)+(z-q.z)*(z-q.z))/(q.r*q.r))),0);}   /* by the distance on the plan: the ground under a zone */
  return{x0,z0,cell,nx,nz,T};};
 A.radGLSL=()=>['#ifndef ATM_RAD_CHUNK','#define ATM_RAD_CHUNK',
  'uniform vec4 atmRadZ['+A.RAD_MAX+'];uniform vec4 atmRadK['+A.RAD_MAX+'];uniform vec3 atmRadC;uniform float atmRadT;',
  /* atmRadZ: a zone's centre and radius (0: none); atmRadK: its strength, its shimmer, 0, 0; atmRadC: the glow, display RGB; atmRadT: seconds */
  'float atmRadChord(vec3 ro,vec3 rd,float L,vec4 z){vec3 oc=ro-z.xyz;float b=dot(oc,rd),d2=dot(oc,oc)-b*b,R2=z.w*z.w;if(z.w<=0.0||d2>=R2)return 0.0;',
  ' float h=sqrt(R2-d2),s0=max(-b-h,0.0)+b,s1=min(-b+h,L)+b;if(s1<=s0)return 0.0;return ((1.0-d2/R2)*(s1-s0)-(s1*s1*s1-s0*s0*s0)/(3.0*R2))/(1.3333333*z.w);}',
  'float atmRadShim(vec3 q,float t){return sin(q.x*5.0+1.7*sin(q.y*7.0-t*1.1)+t*0.3)*sin(q.z*4.6+q.y*9.0-t*1.6);}',
  'float atmRadOne(vec3 ro,vec3 rd,float L,int i){vec4 z=atmRadZ[i];float c=atmRadChord(ro,rd,L,z);if(c<=0.0)return 0.0;',
  ' vec3 pm=ro+rd*clamp(-dot(ro-z.xyz,rd),0.0,L);return atmRadK[i].x*c*(1.0+atmRadK[i].y*atmRadShim((pm-z.xyz)/z.w,atmRadT));}',
  'vec3 atmRad(vec3 ro,vec3 rd,float L){float g=0.0;for(int i=0;i<'+A.RAD_MAX+';i++)g+=atmRadOne(ro,rd,L,i);return atmRadC*g;}',
  '#endif'].join('\n');
 A.radiation=function(o){o=o||{};const T=A.T,U=A.U,N=A.RAD_MAX;
  U.radZ={value:Array.from({length:N},()=>new T.Vector4())};U.radK={value:Array.from({length:N},()=>new T.Vector4())};U.radC={value:new T.Vector3()};U.radT={value:0};
  const R=A.rad={zones:(o.zones||[]).slice(0,N).map(z=>Object.assign({y:0,strength:.16,shimmer:.35},z)),colour:o.colour||[1,.62,.25],k:1,off:false,shells:[]};
  R.set=()=>{for(let i=0;i<N;i++){const z=R.zones[i],on=z&&!R.off;U.radZ.value[i].set(on?z.x:0,on?z.y:0,on?z.z:0,on?z.r:0);U.radK.value[i].set(on?z.strength*R.k:0,on?z.shimmer:0,0,0);
    const s=R.shells[i];if(s){s.visible=!!on;if(on){s.position.set(z.x,z.y,z.z);s.scale.setScalar(z.r);}}}
   U.radC.value.set(R.colour[0],R.colour[1],R.colour[2]);return R;};
  R.on=m=>A.radiationOn(m);
  /* the sky's share: a shell a zone at the far plane, drawn after the world, so it shows only where nothing else was drawn */
  for(let i=0;i<N;i++){const m=new T.ShaderMaterial({uniforms:{atmRadZ:U.radZ,atmRadK:U.radK,atmRadC:U.radC,atmRadT:U.radT},side:T.BackSide,transparent:true,depthWrite:false,blending:T.AdditiveBlending,fog:false,toneMapped:false,
    vertexShader:'varying vec3 vAtmRadP;void main(){vec4 w=modelMatrix*vec4(position,1.0);vAtmRadP=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;gl_Position.z=gl_Position.w*0.99999;}',
    fragmentShader:A.radGLSL()+'\nvarying vec3 vAtmRadP;void main(){vec3 d=vAtmRadP-cameraPosition;gl_FragColor=vec4(atmRadC*atmRadOne(cameraPosition,normalize(d),1e9,'+i+'),1.0);}'});
   const s=new T.Mesh(new T.SphereGeometry(1,32,16),m);s.name='atmos:radiation-sky-'+i;s.renderOrder=900;s.frustumCulled=false;s.visible=false;A.noRay(s);A.add(s);R.shells.push(s);}
  R.set();A.hook(t=>{U.radT.value=t;});
  A.khaz('radiation',(x,y,z)=>R.off?0:A.radAt(R.zones,x,y,z)*R.k);
  A.rec('radiation',{zones:R.zones.map(z=>({x:z.x,y:z.y,z:z.z,r:z.r,strength:z.strength,shimmer:z.shimmer})),colour:R.colour,
   note:'additive glow = colour * sum of strength * (the chord integral of 1 - d^2/r^2 through each zone, over 4r/3), wavering by shimmer; nothing is dimmed (fx/89-atmos-fx-radiation.js)'});
  return R;};
 A.radiationOn=function(mat){if(!mat||!A.U||!A.U.radZ)return mat;const K=A.KH();
  return A.shaderHook(mat,'atmos-radiation',function(sh){const U=A.U;
   if(sh.fragmentShader.indexOf('#include <dithering_fragment>')<0||sh.vertexShader.indexOf('#include <fog_vertex>')<0)return;
   sh.uniforms.atmRadZ=U.radZ;sh.uniforms.atmRadK=U.radK;sh.uniforms.atmRadC=U.radC;sh.uniforms.atmRadT=U.radT;
   /* once: a material cloned with its source's onBeforeCompile (the composed KHOOK hook, as a fade clone is) runs this hook through the
      source and again as its own layer; the second pass declared the varyings twice and the program did not compile (the valley, 2026-11-10) */
   if(sh.vertexShader.indexOf('varying vec3 vAtmRadP;')>=0)return;
   /* the eye from the view matrix (r128 gives a Lambert fragment no cameraPosition: the height fog's note) */
   sh.vertexShader='varying vec3 vAtmRadP;varying vec3 vAtmRadE;\n'+K.rep(sh.vertexShader,'#include <fog_vertex>','#include <fog_vertex>\n{vec4 atmRP=vec4(transformed,1.0);\n#ifdef USE_INSTANCING\natmRP=instanceMatrix*atmRP;\n#endif\nvAtmRadP=(modelMatrix*atmRP).xyz;vAtmRadE=-(transpose(mat3(viewMatrix))*viewMatrix[3].xyz);}');
   sh.fragmentShader='varying vec3 vAtmRadP;varying vec3 vAtmRadE;\n'+A.radGLSL()+'\n'+K.rep(sh.fragmentShader,'#include <dithering_fragment>',
    '{vec3 atmRd=vAtmRadP-vAtmRadE;float atmRL=length(atmRd);gl_FragColor.rgb+=atmRad(vAtmRadE,atmRd/max(atmRL,1e-4),atmRL);}\n#include <dithering_fragment>');});};
 A.radiationScene=function(scene,o){o=o||{};const seen=new Set();let n=0;scene.traverse(ob=>{if(!ob.isMesh||!ob.material||ob.userData.noRadiation)return;
  for(const m of(Array.isArray(ob.material)?ob.material:[ob.material])){if(seen.has(m)||m.userData.noRadiation)continue;seen.add(m);
   if(!(m.isMeshLambertMaterial||m.isMeshStandardMaterial||m.isMeshPhongMaterial||(o.basic&&m.isMeshBasicMaterial)))continue;A.radiationOn(m);n++;}});return n;};
})();
