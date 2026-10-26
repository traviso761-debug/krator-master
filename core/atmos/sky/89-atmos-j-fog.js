// ================================================================= ATMOS — the sky: height fog, valley mist and a cloud band (the atmos_fog chunk)
// [G shader] + [G data] (R1 of the final rebuild, HANDOFF-REBUILD.md 4a; biomes/HEIGHT-RESEARCH.md items 1 and 4,
// WEATHER-RESEARCH.md item 4). three.js's FogExp2 has one density at every height and one colour in every direction; this is
// the fog a hooked material draws instead (host/89-atmos-j-heightfog.js: ATMOS.heightFog), in closed form along the view ray
// (Quilez, "better fog": the exponential height-fog integral), three layers:
//   THE AIR     the page's own fog (scene.fog's colour and density, which the sky and the weather already drive) up to a
//               reference height (the ground under the camera, eased), thinning above it by exp(-falloff * (y - ref)): a level
//               view sees the fog it saw before, a view up to a peak sees less, so each ridge stands lighter than the one in
//               front. Its colour is the hour's fog colour, graded toward the sky's zenith colour as the ray climbs (the land
//               fades into the sky behind it) and toward the sun's colour in a forward lobe (the back-lit ridges at dawn)
//   THE MIST    a pool in low ground: full density below a level (o.mist.y, metres), thinning above it over o.mist.depth;
//               its density follows the hour (dawn) and the weather's fog, in patches that drift with the wind and the gusts
//   THE BAND    a layer of cloud at mid-height (o.band.y [bottom, top]), broken by the same drifting noise (o.band.cover)
// Each layer's optical depth is exact for its profile (no ray marching): ~20 operations a fragment, one hash noise per
// layer, no textures. The noise is an integer hash (never sin), so every engine draws the same patches.
//   ATMOS.fogGLSL()         the chunk: uniforms atmFogH, atmFogMist, atmFogBand, atmFogSunDir, atmFogSunC, atmFogZen,
//                           atmFogDrift, atmFogShape and vec4 atmFog(ro, rd, L, fogColour, fogDensity) -> (colour, amount)
//   ATMOS.fogAt(ro, P, F)   the JS twin (tests, a host's own checks): F = {density, colour, falloff, ref, shape, mist:{density,
//                           y, depth, noise}, band:{density, y0, y1, cover}, drift, sunDir, sunC, zen, sun, sky, compress}
//                           -> {amount, colour}
//   ATMOS.fogLayer / fogPool / fogSlab   the three optical-depth integrals, pure (test-sky.js holds the GLSL to them)
// Godot: Environment.fog_height / fog_height_density / fog_sun_scatter / fog_aerial_perspective for the air; the mist and the
// band are this chunk as a .gdshaderinc in the ground and plant shaders (GODOT.md, "Height fog").
(function(){const A=ATMOS;
 // optical depth (per unit density) of exp(-b (y - y0)) along ro + rd t, t in [0, L]
 // (the difference of the two ends' densities over b rdy: no exp(-k) to overflow against a vanishing start density on a long
 // falling ray; the pool calls it only above its level, so neither exponent is positive)
 A.fogLayer=(b,y0,roy,rdy,L)=>{const k=b*rdy*L,e0=Math.exp(-Math.max(-30,b*(roy-y0)));if(Math.abs(k)<1e-4)return e0*L*(1-.5*k);
  return(e0-Math.exp(-Math.max(-30,b*(roy+rdy*L-y0))))/(b*rdy);};
 // a pool: density 1 below lvl, exp(-b (y - lvl)) above it
 A.fogPool=(b,lvl,roy,rdy,L)=>{const y1=roy+rdy*L;if(roy<lvl&&y1<lvl)return L;if(roy>=lvl&&y1>=lvl)return A.fogLayer(b,lvl,roy,rdy,L);
  const tc=(lvl-roy)/rdy;return roy<lvl?tc+A.fogLayer(b,lvl,lvl,rdy,L-tc):A.fogLayer(b,lvl,roy,rdy,tc)+(L-tc);};
 // the length of ro + rd t (t in [0, L]) inside the slab y0 < y < y1, and the parameter of its middle
 A.fogSlab=(y0,y1,roy,rdy,L)=>{if(Math.abs(rdy)<1e-5)return roy>y0&&roy<y1?[L,L*.5]:[0,0];const t0=(y0-roy)/rdy,t1=(y1-roy)/rdy,lo=Math.max(0,Math.min(t0,t1)),hi=Math.min(L,Math.max(t0,t1));return hi>lo?[hi-lo,(lo+hi)*.5]:[0,0];};
 // the patch noise (0..1): value noise on an integer hash (lowbias32), as the snow's
 const hashU=(x,y)=>{let h=(Math.imul(x>>>0,1597334677)^Math.imul(y>>>0,3812015801))>>>0;h^=h>>>16;h=Math.imul(h,2146121005)>>>0;h^=h>>>15;h=Math.imul(h,2221713035)>>>0;h^=h>>>16;return h>>>0;};
 const hash=(x,y)=>(hashU((x+(1<<20))>>>0,(y+(1<<20))>>>0)&65535)/65535;
 A.fogNoise=(x,z)=>{const n=(px,pz)=>{const ix=Math.floor(px),iz=Math.floor(pz);let qx=px-ix,qz=pz-iz;qx=qx*qx*(3-2*qx);qz=qz*qz*(3-2*qz);
   const a=hash(ix,iz),b=hash(ix+1,iz),c=hash(ix,iz+1),d=hash(ix+1,iz+1);return a+(b-a)*qx+(c-a)*qz+(a-b-c+d)*qx*qz;};
  return .65*n(x,z)+.35*n(x*2.03+17,z*2.03+17);};
 A.FOG_CELL=[260,620];   // the mist's and the band's patch sizes (m)
 const ss=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
 A.fogAt=(ro,P,F)=>{const dx=P[0]-ro[0],dy=P[1]-ro[1],dz=P[2]-ro[2],L=Math.hypot(dx,dy,dz)||1e-4,rd=[dx/L,dy/L,dz/L],M=F.mist||{},B=F.band||{},dr=F.drift||[0,0];
  const Lc=F.compress?(L<F.compress[0]?L:F.compress[0]+F.compress[1]*(1-Math.exp(-(L-F.compress[0])/F.compress[1]))):L,s=Lc/L;
  const tA=F.density*A.fogPool(F.falloff||0,F.ref==null?-1e9:F.ref,ro[1],rd[1],L)*s,oA=F.shape==='exp'?tA:tA*tA;
  let tM=0;if(M.density>0){tM=M.density*A.fogPool(1/Math.max(1,M.depth||40),M.y||0,ro[1],rd[1],L);const n=A.fogNoise((P[0]+dr[0])/A.FOG_CELL[0],(P[2]+dr[1])/A.FOG_CELL[0]);tM*=1+(M.noise||0)*(1.6*n-1);}
  let tB=0;if(B.density>0){const q=A.fogSlab(B.y0,B.y1,ro[1],rd[1],L);if(q[0]>0){const x=ro[0]+rd[0]*q[1],z=ro[2]+rd[2]*q[1],n=A.fogNoise((x+dr[0])/A.FOG_CELL[1],(z+dr[1])/A.FOG_CELL[1]),c=B.cover==null?.5:B.cover,k=B.noise==null?1:B.noise;tB=B.density*q[0]*ss(1-c-.15,1-c+.15,.5+(n-.5)*k);}}
  const amount=1-Math.exp(-(oA+tM+tB));
  const up=ss(0,.6,rd[1])*(F.sky||0),sd=F.sunDir||[0,1,0],mie=Math.min(1,(F.sun||0)*Math.pow(Math.max(0,rd[0]*sd[0]+rd[1]*sd[1]+rd[2]*sd[2]),8)*ss(-.05,.05,sd[1]));
  const fc=F.colour||[.5,.5,.5],z=F.zen||fc,sc=F.sunC||[1,1,1];
  const cA=fc.map((v,i)=>{const a=v+(z[i]-v)*up;return a+(sc[i]-a)*mie;}),cM=fc.map((v,i)=>Math.min(1,v*1.06+.04*sc[i])),cB=fc.map((v,i)=>v+(sc[i]*.9-v)*.35);
  const w=oA+tM+tB||1,colour=[0,1,2].map(i=>(cA[i]*oA+cM[i]*tM+cB[i]*tB)/w);
  return{amount,colour};};
 const f=v=>A.glf(v);
 A.fogGLSL=()=>['#ifndef ATM_FOG_CHUNK','#define ATM_FOG_CHUNK',
  'uniform vec4 atmFogH;uniform vec4 atmFogMist;uniform vec4 atmFogBand;uniform vec4 atmFogX;uniform vec3 atmFogSunDir;uniform vec3 atmFogSunC;uniform vec3 atmFogZen;uniform vec2 atmFogDrift;',
  /* atmFogH: falloff, ref, sun, sky; atmFogMist: density, level, 1/depth, noise; atmFogBand: density, bottom, top, cover; atmFogX: shape (1 exp2, 0 exp), compress start, compress scale, band noise */
  'float atmFogLayer(float b,float y0,float roy,float rdy,float L){float k=b*rdy*L;float e0=exp(-max(-30.0,b*(roy-y0)));if(abs(k)<1e-4)return e0*L*(1.0-0.5*k);',
  ' return (e0-exp(-max(-30.0,b*(roy+rdy*L-y0))))/(b*rdy);}',
  'float atmFogPool(float b,float lvl,float roy,float rdy,float L){float y1=roy+rdy*L;if(roy<lvl&&y1<lvl)return L;if(roy>=lvl&&y1>=lvl)return atmFogLayer(b,lvl,roy,rdy,L);',
  ' float tc=(lvl-roy)/rdy;return roy<lvl?tc+atmFogLayer(b,lvl,lvl,rdy,L-tc):atmFogLayer(b,lvl,roy,rdy,tc)+(L-tc);}',
  'vec2 atmFogSlab(float y0,float y1,float roy,float rdy,float L){if(abs(rdy)<1e-5)return (roy>y0&&roy<y1)?vec2(L,0.5*L):vec2(0.0);float t0=(y0-roy)/rdy,t1=(y1-roy)/rdy;float lo=max(0.0,min(t0,t1)),hi=min(L,max(t0,t1));return hi>lo?vec2(hi-lo,0.5*(lo+hi)):vec2(0.0);}',
  'uint atmFogHashU(uvec2 c){uint h=(c.x*1597334677u)^(c.y*3812015801u);h^=h>>16u;h*=2146121005u;h^=h>>15u;h*=2221713035u;h^=h>>16u;return h;}',
  'float atmFogHash(vec2 p){return float(atmFogHashU(uvec2(ivec2(p)+ivec2(1<<20)))&65535u)/65535.0;}',
  'float atmFogN1(vec2 p){vec2 i=floor(p),q=p-i;q=q*q*(3.0-2.0*q);float a=atmFogHash(i),b=atmFogHash(i+vec2(1,0)),c=atmFogHash(i+vec2(0,1)),d=atmFogHash(i+vec2(1,1));return a+(b-a)*q.x+(c-a)*q.y+(a-b-c+d)*q.x*q.y;}',
  'float atmFogNoise(vec2 p){return 0.65*atmFogN1(p)+0.35*atmFogN1(p*2.03+17.0);}',
  'vec4 atmFog(vec3 ro,vec3 rd,float L,vec3 fc,float dens){',
  ' float Lc=atmFogX.z>0.0&&L>atmFogX.y?atmFogX.y+atmFogX.z*(1.0-exp(-(L-atmFogX.y)/atmFogX.z)):L;',
  ' float tA=dens*atmFogPool(atmFogH.x,atmFogH.y,ro.y,rd.y,L)*(Lc/max(L,1e-4));float oA=atmFogX.x>0.5?tA*tA:tA;',
  ' vec3 P=ro+rd*L;float tM=0.0;if(atmFogMist.x>0.0){tM=atmFogMist.x*atmFogPool(atmFogMist.z,atmFogMist.y,ro.y,rd.y,L);tM*=1.0+atmFogMist.w*(1.6*atmFogNoise((P.xz+atmFogDrift)/'+f(A.FOG_CELL[0])+')-1.0);}',
  ' float tB=0.0;if(atmFogBand.x>0.0){vec2 q=atmFogSlab(atmFogBand.y,atmFogBand.z,ro.y,rd.y,L);if(q.x>0.0){vec2 xz=ro.xz+rd.xz*q.y;float n=atmFogNoise((xz+atmFogDrift)/'+f(A.FOG_CELL[1])+');',
  '  tB=atmFogBand.x*q.x*smoothstep(1.0-atmFogBand.w-0.15,1.0-atmFogBand.w+0.15,mix(0.5,n,atmFogX.w));}}',
  ' float amount=1.0-exp(-(oA+tM+tB));',
  ' float up=smoothstep(0.0,0.6,rd.y)*atmFogH.w;float mie=clamp(atmFogH.z*pow(max(dot(rd,atmFogSunDir),0.0),8.0)*smoothstep(-0.05,0.05,atmFogSunDir.y),0.0,1.0);',
  ' vec3 cA=mix(mix(fc,atmFogZen,up),atmFogSunC,mie);vec3 cM=min(vec3(1.0),fc*1.06+0.04*atmFogSunC);vec3 cB=mix(fc,atmFogSunC*0.9,0.35);',
  ' float w=oA+tM+tB;w=w>0.0?w:1.0;return vec4((cA*oA+cM*tM+cB*tB)/w,amount);}',
  '#endif'].join('\n');
})();
