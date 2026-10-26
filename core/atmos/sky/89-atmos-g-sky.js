// ================================================================= ATMOS — the sky shader: every layer of Krator's sky in one fragment
// [G shader] ATMOS.skyGLSL() returns the chunk `atmos_sky` (registered as #include <atmos_sky> at ATMOS.init, as the
// wave field and the cloud deck are): `vec3 atmSky(vec3 d)` is the sky's display colour toward world direction d.
// The layers are composited back to front IN ONE FRAGMENT (SKY-PLAN.md section 4), which is what keeps the two old
// bugs away by construction: the far half of the giant's ring is tested against the giant's sphere and hidden behind
// it, and nothing celestial can lie over a far ridge, because the ridges are composited last.
//   1 deep sky   the star field (a hash on a cube-face grid), the 64 bright stars, the Pleiades' dust nebula, the galaxy
//   2 the sun    3 the moons (lit by the true sun: their phases)
//   4 the giant  an analytic sphere: bands, storms, spin, the terminator, the ring's shadow on it
//   5 the ring   in the giant's equator; its far half hidden behind the disc, the giant's shadow across it
//   6 the air    the colour script's sky, the sun's glow, extinction and haze over layers 1-5
//   7 clouds     a cumulus and a cirrus layer on sky planes, riding the wind, lit by the sun and giantshine
//   8 ridges     the far land, far to near, from the ridge texture: lit by the sun, hazed by distance
// The integer hash is lowbias32 (the cloud deck's), so the Godot twin (atmos_sky.gdshaderinc) draws the same stars.
// GLSL ES 3 (uint, texelFetch): three r128 compiles a ShaderMaterial as ES 3 on WebGL2.
(function(){const A=ATMOS;
 A.SKY_MAX_RIDGES=4;
 // the hash and the noise read from the volume: shared by the sky and the cloud-shade chunk (atmos_cloudshade)
 const NOISE=[
  'uint atmSkyH(uvec3 c,uint s){uint h=(c.x*1597334677u)^(c.y*3812015801u)^(c.z*2246822519u)^(s*2654435769u);h^=h>>16u;h*=2146121005u;h^=h>>15u;h*=2221713035u;h^=h>>16u;return h;}',
  // the angle between two unit vectors from their chord: exact for small angles, where dot() against cos() loses the
  // last digits (on ANGLE/Direct3D a moon 0.35 degrees across vanished)
  'float atmSkyAng(vec3 a,vec3 b){return 2.0*asin(clamp(0.5*length(a-b),0.0,1.0));}',
  'float atmSkyU(uvec3 c,uint s){return float(atmSkyH(c,s))/4294967296.0;}',
  'vec3 atmSkyGrad(ivec3 c,uint s){uint h=atmSkyH(uvec3(c),s);return vec3(float(h&1023u),float((h>>10u)&1023u),float((h>>20u)&1023u))/511.5-1.0;}',
  // gradient noise read from the volume (period 16 lattice cells): the seed picks one of its four channels and shifts
  // the lookup, so different seeds are different fields
  'float atmSkyNoise(vec3 x,uint s){vec3 o=vec3(float(s*7u%16u),float(s*11u%16u),float(s*13u%16u))+0.37*float(s/4u);',
  ' vec4 t=texture(uNoise,(x+o)/16.0);uint c=s%4u;return (c==0u?t.r:c==1u?t.g:c==2u?t.b:t.a)*2.0-1.0;}',
  'float atmSkyFbm(vec3 p,int oct,uint s){float v=0.0,a=0.5,n=0.0;for(int i=0;i<6;i++){if(i>=oct)break;v+=a*atmSkyNoise(p,s+uint(i));n+=a;p=p*2.03+vec3(1.7,9.2,3.1);a*=0.5;}return v/n;}',];
 // THE CLOUD FIELD, anchored to the world (SKY-PLAN.md 11.1): the cumulus cover at world xz on the cloud plane, drifting
 // on the wind. The sky reads it along each view ray, the ground along the ray toward each light, so a cloud and its
 // shadow are the same cloud. oct: octaves (the sky 5, a shadow 3: a cloud 1.6 km up casts a penumbra ~15 m wide)
 const CLOUDF=[
  'float atmCloudField(vec2 xz,int oct){vec2 w=uWind*uTime*uCloudH.w;return atmSkyFbm(vec3(xz/uCloudH.z+w,0.0),oct,100u)*0.5+0.5;}',
  'float atmCloudCover(float n){return smoothstep(1.0-uCloud.x,1.0-uCloud.x+0.22,n);}'];
 // the shade of the cloud deck on a world point P lit along L (1 in the open, down to 1-0.72 under thick cumulus)
 const SHADE=[
  'float atmCloudShade(vec3 P,vec3 L){if(L.y<0.02||uCloud.x<=0.0||uCloud.y<=0.0)return 1.0;vec2 Q=P.xz+L.xz/L.y*(uCloudH.x-P.y);',
  ' return 1.0-0.72*uCloud.y*atmCloudCover(atmCloudField(Q,3));}'];
 // the chunk any ground or plant material includes (ATMOS.cloudShade): its own uniforms, the noise, the field, the shade
 A.cloudShadeGLSL=function(){return['uniform highp sampler3D uNoise;','uniform vec4 uCloud;','uniform vec4 uCloudH;','uniform vec2 uWind;',
  'uniform float uTime;','uniform float uWet;'].concat(NOISE,CLOUDF,SHADE).join('\n');};
 A.skyGLSL=function(){const f=A.glf,S=A.SKY,G=S.giant,NR=A.SKY_MAX_RIDGES,NS=S.stars.length,NL=A.SKY_MAX_LANDMARKS;
  const rg=Math.sin(G.diaDeg/2*Math.PI/180),cosG=Math.cos(G.diaDeg/2*Math.PI/180);
  return[
  'uniform vec3 uSunDir,uGiantDir,uPole,uRingN,uZen,uHor,uSunHor,uSunC,uExt,uShineC,uCluster,uFogC;',
  'uniform float uSunI,uHazeFloor,uDayStars,uNight,uEclipse,uShineI,uSpin,uPixAng,uTime,uFogD;',
  'uniform mat3 uEq;uniform highp sampler3D uNoise;',   // the noise volume (ATMOS.skyNoiseVolume)                                   // world -> inertial (the stars' sphere)
  // uPole: the giant's spin axis (its bands and ring plane), not Krator's pole
  'uniform sampler2D uMoonMaps;uniform float uMoonMapOn;uniform vec3 uMoonG[6];',   // the moon maps, one atlas, a row a moon (core/materials/library/sky.moon.*); uMoonG: moon to giant
  'uniform vec3 uMoonDir[6],uMoonC[6],uMoonL[6],uMoonV[6];uniform float uMoonR[6],uMoonK[6],uMoonF[6],uMoonLump[6],uMoonT;uniform vec3 uRingT;',   // uMoonT: world hours since game start   // uMoonF: 1 when nearer than the giant   // uMoonL: each moon's sun (its phase); uMoonK: its kind
  'uniform vec4 uStar['+NS+'];uniform vec3 uStarC['+NS+'];uniform vec4 uPN;',   // uPN: the planetary nebula (inertial direction, radius in radians)
  'uniform vec3 uGDeep,uGMid,uGPale,uGCloud,uGPlank,uGHaze,uGTeal,uGRim,uGNight,uGRing;',
  'uniform vec4 uCloud;uniform vec4 uCloudH;uniform vec2 uWind;uniform vec3 uCamPos;',   // uCamPos: the page camera's world position (the clouds are anchored to the world)   // cover, cumulus, cirrus, bank; heights, scale, drift
  'uniform vec3 uNightK;',                               // stars, nebula, galaxy gains
  'uniform sampler2D uRidgeTex;uniform int uRidgeN;uniform vec4 uRidge['+NR+'];uniform vec3 uRidgeRock['+NR+'],uRidgeForest['+NR+'],uRidgeSnow['+NR+'];',
  // the broken station (ATMOS.skyStation): its direction, torus axis and motion; uStaK: ring radius (radians), lit, distance (km), over the horizon
  'uniform vec3 uStaDir,uStaAx,uStaV;uniform vec4 uStaK;',
  'uniform float uRealT,uMeteor;',
  'uniform vec4 uLm['+NL*5+'];uniform float uLmK['+NL+'];uniform int uLmN;',   // the landmarks (ATMOS.skyLandmarks): five vec4 each, their kinds, how many   // uRealT: wall-clock seconds (the meteors keep real time whatever the game clock does); uMeteor: their rate, 0 none, 1 the usual night
  // ---- the hash and gradient noise (lowbias32; bit-exact across engines)
  ...NOISE,
  ...CLOUDF,
  // ---- 1 deep sky, on the inertial sphere e
  // a star field on a cube-face grid of n cells a face: one star at most per cell, kept off the cell's edges
  'vec3 atmSkyField(vec3 e,float n,float dens,uint s){vec3 a=abs(e);float m=max(a.x,max(a.y,a.z));vec2 uv;uint fc;',
  ' if(m==a.x){uv=e.yz/a.x;fc=e.x>0.0?0u:1u;}else if(m==a.y){uv=e.xz/a.y;fc=e.y>0.0?2u:3u;}else{uv=e.xy/a.z;fc=e.z>0.0?4u:5u;}',
  ' vec2 g=(uv*0.5+0.5)*n;vec2 c=floor(g);uvec3 k=uvec3(uvec2(c),fc);',
  ' if(atmSkyU(k,s)>dens)return vec3(0.0);',
  ' vec2 pos=0.25+0.5*vec2(atmSkyU(k,s+1u),atmSkyU(k,s+2u));float ang=length(g-c-pos)*1.6/n/m;',
  ' float u=atmSkyU(k,s+3u);float b=0.010+0.09*pow(u,3.0)+2.2*pow(u,16.0),sg=max(uPixAng*0.75,1.2e-4);',
  ' float t=atmSkyU(k,s+4u);vec3 col=t<0.2?vec3(1.0,0.80,0.60):t<0.55?vec3(1.0,0.96,0.90):vec3(0.78,0.86,1.0);',
  ' return col*b*exp(-ang*ang/(sg*sg));}',
  'vec3 atmSkyDeep(vec3 e,out float lanes){float cc=dot(e,uCluster);',
  ' float near=smoothstep('+f(Math.cos(S.cluster.reach*Math.PI/180))+',1.0,cc),dust=smoothstep('+f(Math.cos(S.cluster.dust*Math.PI/180))+','+f(Math.cos(20*Math.PI/180))+',cc);',
  // the dust's dark lanes: hide what is behind them
  ' lanes=0.0;vec3 neb=vec3(0.0),litC=vec3(0.0);float lit=0.0,blueLit=0.0;',
  ' vec3 bright=vec3(0.0);for(int i=0;i<'+NS+';i++){vec4 st=uStar[i];float ang=length(e-st.xyz);',
  '  float sg=uPixAng*(0.7+0.45*st.w),w2=st.w*st.w;bright+=uStarC[i]*(0.8*st.w*exp(-ang*ang/(sg*sg))+0.05*w2*exp(-ang/(uPixAng*6.0))+0.010*w2*exp(-ang/(uPixAng*26.0)));',
  '  if(i<40){float lw=st.w*exp(-ang/0.22);if(i<14){lit+=lw;litC+=uStarC[i]*lw;}blueLit+=step(uStarC[i].r,0.9)*st.w*exp(-ang/0.09);}}',
  ' if(dust>0.001&&uNightK.y>0.0){vec3 q=e*2.6;vec3 w=vec3(atmSkyFbm(q+vec3(7.1,0.0,0.0),3,40u),atmSkyFbm(q+vec3(0.0,3.3,0.0),3,43u),atmSkyFbm(q+vec3(0.0,0.0,5.9),3,46u));',
  '  float n=atmSkyFbm(q*1.7+w*1.6,5,50u)*0.5+0.5;float fil=1.0-abs(atmSkyFbm(q*3.1+w*2.2,4,60u));',
  '  float den=smoothstep(0.42,0.85,n)*dust;float fl=pow(fil,6.0)*dust*0.8;',
  '  lanes=smoothstep(0.58,0.74,atmSkyFbm(q*2.2+w*0.8,4,70u)*0.5+0.5)*dust*0.9;',
  '  vec3 dc=mix(vec3(1.0,0.66,0.36),litC/max(lit,1e-3),0.55);float hue=atmSkyFbm(q*1.3+vec3(4.0),2,65u)*0.5+0.5;dc=mix(dc,vec3(1.0,0.42,0.56),0.65*smoothstep(0.35,0.70,hue));dc=mix(dc,vec3(0.62,0.42,0.95),0.35*smoothstep(0.70,0.90,hue));',
  '  dc=mix(dc,vec3(0.35,0.62,1.0),clamp(blueLit*0.35,0.0,0.85));',
  '  float L=0.20+0.10*lit;neb=(dc*den*L*0.62+mix(dc,vec3(1.0),0.4)*fl*L*0.24)*(1.0-0.8*lanes)*uNightK.y;}',
  // the planetary nebula: a teal-green glow inside a red rim, ragged, and the hot white dwarf at its heart
  ' {float pa=length(e-uPN.xyz)/uPN.w;if(pa<1.6){float rag=atmSkyNoise(e*90.0,66u);float sh=exp(-pow((pa-1.0+0.12*rag)/0.22,2.0)),inn=exp(-pow(pa/0.75,2.0));',
  '  neb+=(vec3(0.20,0.90,0.72)*inn*0.24+vec3(1.0,0.28,0.34)*sh*0.30)*(0.75+0.25*rag)*uNightK.y;}}',
  ' vec3 field=atmSkyField(e,520.0,0.07+0.25*near,1u)*(0.6+0.5*near)+atmSkyField(e,140.0,0.10+0.30*near,9u)*(0.9+0.8*near);',
  ' field*=mix(vec3(1.0),vec3(1.0,0.90,0.76),near)*uNightK.x;',   // the cluster's faint members, old and yellow
  // the galaxy's faint band, in the half of the sky that looks out of the cluster
  ' float gb=exp(-pow(e.x,2.0)/0.018)*(1.0-near)*(0.5+0.5*atmSkyFbm(e*7.0,3,80u))*uNightK.z;',
  ' return (field+bright*uNightK.x)*(1.0-0.85*lanes)+neb+vec3(0.55,0.58,0.66)*gb*0.05;}',
  // ---- 6 the air: the sky toward d before anything stands in front of it
  'vec3 atmSkyAir(vec3 d){float up=max(d.y,0.0);vec3 c=mix(uZen,uHor,pow(1.0-up,4.0));',
  ' vec2 hd=normalize(d.xz+1e-5),sd=normalize(uSunDir.xz+1e-5);float side=max(dot(hd,sd),0.0);',
  ' c=mix(c,uSunHor,side*side*exp(-up/0.16));',
  ' float cs=max(dot(d,uSunDir),0.0);c+=uSunC*uSunI*0.08*(0.30*pow(cs,8.0)+0.55*pow(cs,60.0)+1.2*pow(cs,900.0))*(1.0-uEclipse)*(0.6+0.4*uExt.z*10.0);',
  ' float gs=max(dot(d,uGiantDir),0.0);c+=uShineC*uShineI*(0.10*pow(gs,14.0)+0.05*pow(gs,4.0));',
  ' if(d.y<0.0)c=mix(c,uFogC,1.0-smoothstep(-0.06,0.0,d.y));return c;}',
  'vec3 atmSkyT(vec3 d){float el=degrees(asin(clamp(d.y,-1.0,1.0)));float am=1.0/(max(d.y,0.0)+0.15*pow(max(el,0.0)+3.885,-1.253));return exp(-uExt*min(am,30.0));}',
  // ---- 4 and 5 the giant and its ring
  // the ring's optical depth across its width (t 0 at ringIn, 1 at ringOut; the 2026-10-25 pass, on Saturn's plan): a faint
  // grey inner ring, a dense bright middle ring, a near-empty gap, an outer ring with a narrow gap of its own, and a thin
  // outermost ringlet; `fine` adds the ringlets (0 where a pixel spans many of them, so they never shimmer)
  'float atmSkyRingTau(float rr,float fine){float t=(rr-'+f(G.ringIn)+')/'+f(G.ringOut-G.ringIn)+';if(t<0.0||t>1.0)return 0.0;',
  ' float tau=0.10*smoothstep(0.0,0.02,t)*(1.0-smoothstep(0.20,0.23,t))',
  '  +(0.55+0.45*smoothstep(0.30,0.48,t))*smoothstep(0.20,0.24,t)*(1.0-smoothstep(0.600,0.610,t))',
  '  +0.03*smoothstep(0.600,0.610,t)*(1.0-smoothstep(0.672,0.682,t))',
  '  +0.50*smoothstep(0.672,0.684,t)*(1.0-smoothstep(0.918,0.930,t))*(1.0-0.95*(1.0-smoothstep(0.003,0.007,abs(t-0.868))))',
  '  +0.40*exp(-pow((t-0.982)/0.004,2.0));',
  ' if(fine>0.0){float n=atmSkyNoise(vec3(t*150.0,0.5,0.5),340u)+0.55*atmSkyNoise(vec3(t*520.0,0.5,0.5),341u)+0.3*atmSkyNoise(vec3(t*1600.0,0.5,0.5),342u);tau*=1.0+fine*1.1*n;}',
  ' return max(tau,0.0);}',
  // its colour across the width: the inner ring grey, the dense ring warm, the outer ring paler
  'vec3 atmSkyRingC(float rr){float t=(rr-'+f(G.ringIn)+')/'+f(G.ringOut-G.ringIn)+';vec3 c=mix(vec3(0.62,0.62,0.66),uGRing*1.12,smoothstep(0.18,0.30,t));',
  ' c=mix(c,uGRing*vec3(1.0,0.99,1.02),smoothstep(0.62,0.70,t));return c*(0.92+0.16*atmSkyNoise(vec3(t*60.0,2.5,0.5),343u));}',
  // the giant's face (2026-10-25 pass, after the owner's ice-giant references): blue zones and belts whose edges waver,
  // sheared by differential rotation; white cloud streaks and filaments torn along the belts (domain-warped noise
  // stretched in longitude, never painted ovals); two vortices that SWIRL the clouds round them, the big one with a
  // dark core and bright companion clouds; a blue-green cast in a few bands, the sky-plankton
  'vec3 atmSkyGiantSurf(float lat,float lon){float lo=lon+uSpin*(1.0+0.18*sin(lat*5.0));vec2 p=vec2(lo,lat);float dark=0.0,comp=0.0;',
  ' for(int k=0;k<2;k++){vec4 V=k==0?vec4(-0.38,1.2,0.17,0.075):vec4(0.31,4.1,0.085,0.045);',
  '  vec2 dv=vec2(mod(p.x-V.y+3.14159265,6.28318531)-3.14159265,p.y-V.x),q=dv/V.zw;float r=length(q);',
  '  float tw=(k==0?2.6:-2.2)*exp(-r*r*0.9),cs=cos(tw),sn=sin(tw);vec2 rq=vec2(cs*q.x-sn*q.y,sn*q.x+cs*q.y);',
  '  p+=(rq-q)*V.zw*(1.0-smoothstep(0.0,2.6,r));float edge=r+0.35*atmSkyNoise(vec3(rq*2.2,float(k)*7.0),130u);',
  '  if(k==0)dark=1.0-smoothstep(0.55,1.0,edge);',
  '  comp=max(comp,smoothstep(0.85,1.05,edge)*(1.0-smoothstep(1.05,1.8,edge))*smoothstep(-0.3,0.6,(k==0?-1.0:1.0)*q.y));}',
  ' float la=p.y,cl=cos(la);vec3 P=vec3(cos(p.x)*cl,sin(p.x)*cl,sin(la)),Q=vec3(P.xy*1.8,P.z*5.0);',
  ' vec3 w=vec3(atmSkyFbm(Q+vec3(3.1,0.0,0.0),3,140u),atmSkyFbm(Q+vec3(0.0,7.7,0.0),3,143u),atmSkyFbm(Q*0.7,2,146u));',
  ' vec3 Qw=Q+vec3(w.xy*1.7,w.z*0.4);vec3 w2=vec3(atmSkyFbm(Qw*1.3+vec3(1.7,9.2,0.0),3,147u),atmSkyFbm(Qw*1.3+vec3(8.3,2.8,0.0),3,148u),0.0);',
  ' vec3 Q2=Q+vec3(w.x*1.2+w2.x*1.1,w.y*1.2+w2.y*1.1,w.z*0.35);float bl=la+0.05*w.z+0.025*atmSkyFbm(Q2*2.0,3,150u);',
  ' float band=sin(bl*9.0+0.7*sin(bl*3.3));vec3 col=mix(uGDeep,uGMid,smoothstep(-0.6,0.6,band));',
  ' col=mix(col,uGPale,smoothstep(0.55,0.95,sin(bl*4.5+0.8))*0.55);col=mix(col,uGDeep*0.85,smoothstep(0.62,0.98,abs(sin(la))));',
  ' float eqw=exp(-pow(la/0.32,2.0)),pn=atmSkyFbm(Q2*1.5,3,160u);',
  ' float plank=(0.30*smoothstep(0.35,0.85,sin(bl*3.0+2.4))+0.70*eqw)*(0.55+0.45*pn);col=mix(col,col*uGPlank,plank*0.8);',
  ' float md=atmSkyFbm(Q2*2.1+w2*0.9+vec3(5.0,1.0,2.0),5,195u)*0.5+0.5,mfil=pow(1.0-abs(atmSkyFbm(Q2*3.6+vec3(2.0),3,197u)),2.5);',
  ' float deck=smoothstep(0.40,0.72,md+0.15*mfil)*(1.0-0.55*smoothstep(0.1,0.9,sin(bl*9.0+1.4)));',
  ' vec3 dc=mix(uGHaze,uGTeal,clamp(eqw*(0.65+0.35*pn)+0.25*plank,0.0,1.0))*(0.82+0.25*mfil);col=mix(col,dc,deck*0.72);',
  ' float tur=atmSkyFbm(Q2*1.7,5,170u)*0.5+0.5,fil=pow(1.0-abs(atmSkyFbm(Q2*3.2+w2*1.5,4,180u)),3.0),belt=smoothstep(-0.1,0.9,sin(bl*9.0+1.4));',
  ' float det=atmSkyFbm(Q2*6.5+w2*2.0,3,190u);float wisp=smoothstep(0.45,0.76,tur+0.12*det)*belt+0.5*fil*belt*smoothstep(0.36,0.60,tur);',
  ' wisp=max(wisp,comp*smoothstep(0.36,0.68,tur+0.25*fil));wisp*=0.82+0.30*det;',
  ' col=mix(col,uGCloud,clamp(wisp,0.0,1.0)*0.9);return mix(col,uGDeep*0.55,dark*(1.0-0.5*wisp));}',
  // the giant toward d: rgb, and alpha (the disc's coverage); tG its hit distance (unit: the giant's distance)
  'vec4 atmSkyGiant(vec3 d,out float tG){vec3 c=uGiantDir;float r='+f(rg)+',b=dot(d,c),h=b*b-(1.0-r*r);tG=1e9;',
  ' float ang=acos(clamp(b,-1.0,1.0)),cov=1.0-smoothstep('+f(G.diaDeg/2*Math.PI/180)+'-uPixAng*1.2,'+f(G.diaDeg/2*Math.PI/180)+',ang);',
  ' if(b<='+f(cosG*.98)+'||cov<=0.0)return vec4(0.0);h=max(h,0.0);tG=b-sqrt(h);vec3 N=normalize((d*tG-c)/r);',
  ' vec3 e1=normalize(cross(uPole,c)),e2=cross(uPole,e1);float sl=clamp(dot(N,uPole),-1.0,1.0),lat=asin(sl),lon=atan(dot(N,e2),dot(N,e1));',
  ' vec3 col=atmSkyGiantSurf(lat,lon);',
  ' float ndv=clamp(dot(N,-d),0.0,1.0),limb=pow(max(ndv,0.0015),0.35),ndl=dot(N,uSunDir),day=smoothstep(-0.10,0.14,ndl);',
  // the ring's shadow on the disc: from the point toward the sun, across the ring plane
  ' float dn=dot(uSunDir,uRingN);if(abs(dn)>1e-4){float k=-dot(N,uRingN)/dn;if(k>0.0){vec3 q=N+uSunDir*k;float rq=length(q);day*=1.0-0.5*(1.0-exp(-atmSkyRingTau(rq,0.0)/max(abs(dn),0.08)));}}',
  ' vec3 o=col*limb*1.15*day+col*limb*uGNight*0.10;',
  ' o+=uGRim*pow(max(1.0-ndv,0.0),2.6)*0.30*mix(smoothstep(-0.35,0.45,ndl),1.0,0.12);',   // the high haze: an ice giant's blue limb
  // the eclipse's main feature (21-sky.js): sunlight bent through the giant's air, a burning ring round the limb, brightest
  // on the side the sun is behind
  ' if(uEclipse>0.0){vec3 np=normalize(N-c*dot(N,c)+1e-5),sp=uSunDir-c*dot(uSunDir,c);float sk=length(sp)>1e-4?0.5+0.5*dot(np,normalize(sp)):1.0;',
  '  o+=vec3(1.0,0.70,0.42)*pow(max(1.0-ndv,0.0),6.0)*uEclipse*(0.6+1.6*sk*sk);}',
  ' return vec4(o,cov);}',
  'vec4 atmSkyRing(vec3 d,float tG,bool hitG){float dn=dot(d,uRingN);if(abs(dn)<1e-6)return vec4(0.0);float t=dot(uGiantDir,uRingN)/dn;if(t<=0.0)return vec4(0.0);',
  ' if(hitG&&t>tG)return vec4(0.0);',                    // the far half: behind the disc
  ' vec3 q=(d*t-uGiantDir)/'+f(rg)+';float rr=length(q);if(rr<'+f(G.ringIn)+'||rr>'+f(G.ringOut)+')return vec4(0.0);',
  ' float fine=1.0-smoothstep(0.0012,0.012,fwidth(rr));float tau=atmSkyRingTau(rr,fine);if(tau<=0.0)return vec4(0.0);',
  // seen at a slant the ring is thicker: optical depth over |cos| of the view angle, so near edge-on it is a crisp line
  ' float a=1.0-exp(-tau/max(abs(dn),0.10));',
  ' float b=dot(q,uSunDir),h=b*b-(dot(q,q)-1.0);float sh=(h>0.0&&b<0.0)?0.06:1.0;',   // the giant's shadow across the ring
  // lit face or back-lit: seen from the sun's side the dense rings are bright; from the other side light comes only
  // through, so the dense ring goes dark and the thin rings and gaps glow
  ' float ls=dot(uSunDir,uRingN),vs=-dot(uGiantDir,uRingN);float face=ls*vs>0.0?1.0:0.0,el=min(1.0,abs(ls)*5.0);',
  ' vec3 base=atmSkyRingC(rr);vec3 c=face>0.5?base*(0.45+0.65*el):base*(0.38+1.3*el*exp(-1.2*tau)*(1.0-exp(-2.5*tau)));',
  ' c*=sh*(1.0-uEclipse);c+=uShineC*uShineI*0.05;return vec4(c,a*0.97);}',
  // ---- 3 the moons, each its own kind (the owner, 2026-10-25): 0 Io-like (sulfur plains, volcanoes, frost), 1 Callisto-like
  // (dark, crowded with bright craters), 2 Venus-like (all cloud, a soft terminator and a glowing limb), 3 Ceres-like (grey,
  // cratered, a few bright salt spots), 4 Iapetus-like (two-faced: see atmSkyMoon). q is a frame
  // fixed to the moon; its light is its own sun (uMoonL), so the lit side always matches its phase
  // the craters as a mask (0..1): ONE call per pixel (the moon code has one call site, so the shader compiles quickly)
  'float atmSkyCraterMask(vec3 q,uint s){float m=0.0;for(int j=0;j<2;j++){float sc=j==0?7.0:19.0;vec3 g=q*sc+vec3(40.0),fl=floor(g),b0=fl+step(0.5,g-fl)-1.0;float best=9.0;',
  '  for(int a=0;a<8;a++){vec3 cc=b0+vec3(float(a&1),float((a>>1)&1),float(a>>2));uvec3 h=uvec3(ivec3(cc));',
  '   best=min(best,length(g-cc-0.2-0.6*vec3(atmSkyU(h,s+uint(j)),atmSkyU(h,s+10u),atmSkyU(h,s+20u))));}',
  '  m=max(m,(1.0-smoothstep(0.07,0.20,best))*(j==0?0.85:0.6));}return m;}',
  'vec3 atmSkyMoonSurf(vec3 q,float k,float cm){',
  ' if(k<0.5){float n=atmSkyFbm(q*3.0,4,200u)*0.5+0.5;vec3 c=mix(vec3(0.95,0.88,0.58),vec3(0.86,0.64,0.32),smoothstep(0.35,0.75,n));',
  '  float v=atmSkyFbm(q*7.0,3,210u)*0.5+0.5;c=mix(c,vec3(0.72,0.34,0.14),smoothstep(0.64,0.72,v)*0.8);c=mix(c,vec3(0.12,0.08,0.05),smoothstep(0.72,0.79,v));',
  '  return mix(c,vec3(0.97,0.97,0.92),smoothstep(0.72,0.85,atmSkyFbm(q*2.0+4.0,3,220u)*0.5+0.5)*0.6);}',
  ' if(k<1.5)return mix(mix(vec3(0.19,0.17,0.15),vec3(0.31,0.28,0.25),atmSkyFbm(q*4.0,4,230u)*0.5+0.5),vec3(0.60,0.58,0.54),cm);',
  ' if(k<2.5)return mix(vec3(0.93,0.87,0.68),vec3(0.99,0.95,0.82),0.5+0.5*atmSkyFbm(vec3(q.xy*1.5,q.z*5.0),3,270u));',
  ' vec3 c=mix(mix(vec3(0.33,0.32,0.30),vec3(0.42,0.41,0.39),atmSkyFbm(q*3.5,4,280u)*0.5+0.5),vec3(0.50,0.49,0.47),cm);',
  ' return mix(c,vec3(0.95,0.95,0.92),smoothstep(0.86,0.92,atmSkyFbm(q*5.0,3,300u)*0.5+0.5));}',
  // Day's volcanoes (the owner, 2026-10-25): about half the cells of a lattice on its surface hold a vent, each waking and
  // sleeping on its own cycle in WORLD hours (T), so the face changes from one night to the next. An active vent spreads
  // dark flows that grow and wander, glows at its heart (orange, showing best on the night side) and throws an ash cloud
  // that drifts. Returns (flow, glow, ash, 0)
  'vec4 atmSkyDayVolc(vec3 q,float T){vec3 g=q*5.0+vec3(20.0),fl=floor(g),b0=fl+step(0.5,g-fl)-1.0;float flow=0.0,glow=0.0,ash=0.0;',
  ' for(int a=0;a<8;a++){vec3 cc=b0+vec3(float(a&1),float((a>>1)&1),float(a>>2));uvec3 h=uvec3(ivec3(cc));if(atmSkyU(h,350u)>0.5)continue;',
  '  vec3 dv=g-cc-0.2-0.6*vec3(atmSkyU(h,351u),atmSkyU(h,352u),atmSkyU(h,353u));float dd=length(dv);if(dd>0.95)continue;',
  '  float act=smoothstep(0.35,0.95,0.5+0.5*sin(T*(0.05+0.25*atmSkyU(h,355u))+6.2832*atmSkyU(h,354u)));',
  '  float wob=atmSkyNoise(dv*2.5+vec3(0.0,0.0,T*0.02),356u);',
  '  flow=max(flow,(1.0-smoothstep(0.10,0.30+0.30*act,dd+0.25*wob))*(0.35+0.65*act));',
  '  float rib=smoothstep(0.20,0.45,wob+0.25*sin(dd*40.0-T*0.3));',
  '  glow=max(glow,act*(1.0-smoothstep(0.03,0.20+0.14*act,dd+0.10*wob))+0.6*act*rib*(1.0-smoothstep(0.0,0.28+0.30*act,dd+0.3*wob)));',
  '  ash=max(ash,act*act*(1.0-smoothstep(0.12,0.65,dd+0.35*atmSkyNoise(dv*1.5+vec3(T*0.03,0.0,0.0),358u)))*0.7);}',
  ' return vec4(flow,glow,ash,0.0);}',
  // the 2-day moon, Mimas-like: grey-white ice, crowded craters, long grooves and cracks, and one crater a third of its
  // width on its leading face (V), with a raised rim, a wall in shadow on the side away from the sun (L) and a central peak
  'vec3 atmSkyMimas(vec3 N,vec3 V,vec3 L,vec3 q,float cm){vec3 c=mix(mix(vec3(0.66,0.66,0.68),vec3(0.80,0.80,0.82),atmSkyFbm(q*3.0,4,370u)*0.5+0.5),vec3(0.90,0.90,0.92),cm);',
  ' float gr=pow(1.0-abs(atmSkyNoise(q*vec3(1.5,9.0,1.5)+vec3(3.0),374u)),18.0)+0.6*pow(1.0-abs(atmSkyNoise(q*vec3(7.0,1.2,2.0)+vec3(9.0),375u)),22.0);c*=1.0-0.35*clamp(gr,0.0,1.0);',
  ' float a=acos(clamp(dot(N,V),-1.0,1.0)),R=0.36,x=a/R;vec3 p=normalize(N-V*dot(N,V)+1e-5),lt=L-N*dot(N,L);',
  ' float rim=exp(-pow((x-1.0)/0.10,2.0)),wall=smoothstep(0.55,0.98,x)*(1.0-smoothstep(0.98,1.04,x)),peak=exp(-pow(x/0.12,2.0));',
  ' c=mix(c,c*0.80,1.0-smoothstep(0.85,1.0,x));c+=vec3(0.16)*rim+vec3(0.20)*peak;c*=1.0+0.9*wall*dot(-p,lt);return c;}',
  // the 4-day moon, a vitriolic world (the Orion's Arm kind, cooler): bright brownish-cream cloud in drifting bands, and
  // through the gaps sulfuric-acid seas (brown with dissolved minerals) and dark red thiogen-covered land
  'vec3 atmSkyVitriol(vec3 q,float T){float land=smoothstep(0.02,0.12,atmSkyFbm(q*2.2+vec3(5.0),5,380u));',
  ' vec3 g=mix(vec3(0.30,0.21,0.10),vec3(0.36,0.12,0.08),land);',
  ' vec3 qc=vec3(q.x*cos(T*0.02)-q.z*sin(T*0.02),q.y,q.x*sin(T*0.02)+q.z*cos(T*0.02));float cl=atmSkyFbm(vec3(qc.xz*2.0,qc.y*6.0),5,390u)*0.5+0.5;',
  ' return g+0.0*cl;}',   // its clouds are atmSkyVitriolCloud, over the map or this
  // the Thirteen, a carbon world (the owner's references, 2026-10-25): rust-orange and ochre crusts crazed with dark lace,
  // black tar seas over about a quarter of it with bitumen shores, thin pale haze drifting over. a = the sea (for its glint)
  'vec4 atmSkyCarbon(vec3 q,float T){float n=atmSkyFbm(q*1.8+vec3(11.0),5,400u);float sea=1.0-smoothstep(-0.13,-0.09,n),shore=1.0-smoothstep(-0.09,-0.02,n);',
  ' float m=atmSkyFbm(q*4.5,4,402u)*0.5+0.5;vec3 c=mix(vec3(0.58,0.26,0.12),vec3(0.80,0.56,0.26),smoothstep(0.35,0.70,m));',
  ' float lace=pow(1.0-abs(atmSkyNoise(q*9.0+vec3(2.0),404u)),10.0);c=mix(c,vec3(0.20,0.10,0.06),lace*0.6);c=mix(c,vec3(0.26,0.13,0.07),shore*0.8);',
  ' c=mix(c,vec3(0.030,0.025,0.022),sea);float hz=smoothstep(0.62,0.85,atmSkyFbm(vec3(q.xz*2.0+T*0.004,q.y*6.0),3,406u)*0.5+0.5);',
  ' return vec4(mix(c,vec3(0.86,0.80,0.72),hz*0.6),sea*(1.0-hz));}',
  // clouds over the two moons with air (the owner, 2026-10-25), in the moon's own frame P (x to the giant, y back from the
  // leading face, z north), zonal and turning with world time T, faster at the equator: the vitriolic world's
  // sulfuric-acid decks, bright cream-yellow banded cloud over about half of it; the carbon world's thin organic smog,
  // tan and orange, with white high wisps. Each returns (colour, cover)
  'vec3 atmSkyCloudP(vec3 P,float T,float rate){float la=asin(clamp(P.z,-1.0,1.0)),lo=atan(P.y,P.x)+T*rate*(1.0+0.35*cos(la*2.0));return vec3(cos(lo)*cos(la),sin(lo)*cos(la),P.z);}',
  'vec4 atmSkyVitriolCloud(vec3 P,float T){vec3 c=atmSkyCloudP(P,T,0.05);vec3 z=vec3(c.xy*2.2,c.z*7.0+T*0.002);',
  ' float n=atmSkyFbm(z+vec3(0.6*atmSkyFbm(z*0.7,2,412u)),5,410u)*0.5+0.5;float cov=smoothstep(0.42,0.66,n+0.12*sin(c.z*8.0));',
  ' vec3 cc=mix(vec3(0.84,0.76,0.52),vec3(0.97,0.94,0.80),smoothstep(0.55,0.9,n));return vec4(cc,cov*0.92);}',
  'vec4 atmSkyCarbonCloud(vec3 P,float T){vec3 c=atmSkyCloudP(P,T,0.035);vec3 z=vec3(c.xy*1.7,c.z*3.6-T*0.003);',
  ' float w=atmSkyFbm(z+vec3(0.5*atmSkyFbm(z*0.8,2,424u)),4,420u)*0.5+0.5,f=pow(1.0-abs(atmSkyFbm(z*2.0+vec3(1.3),3,422u)),3.0);float cov=smoothstep(0.60,0.80,w+0.10*f);',
  ' return vec4(mix(vec3(0.88,0.66,0.44),vec3(0.96,0.92,0.86),smoothstep(0.62,0.9,w+0.1*f)),cov*0.7);}',
  // Iapetus: the hemisphere that leads in its orbit (V, its velocity) coal-dark, the trailing one bright as snow, the border
  // ragged, bright craters punched into the dark side, and the equatorial ridge (round its orbit's normal, uRingN)
  'vec3 atmSkyIapetus(vec3 N,vec3 V,vec3 q,float cm){float n=atmSkyFbm(q*3.0,4,310u);float lead=smoothstep(-0.18,0.22,dot(N,V)+0.22*n);',
  ' vec3 c=mix(mix(vec3(0.80,0.78,0.74),vec3(0.92,0.91,0.88),cm),mix(vec3(0.11,0.08,0.06),vec3(0.42,0.38,0.34),cm),lead);',
  ' float rg=1.0-smoothstep(0.0,0.05,abs(dot(N,uRingN)+0.02*n));return mix(c,c*(1.0-0.35*lead)+vec3(0.10)*lead,rg*0.7);}',
  'vec4 atmSkyMoon(vec3 d,int i){vec3 m=uMoonDir[i];float c=dot(d,m),r=uMoonR[i];float ang=atmSkyAng(d,m),k=uMoonK[i],lp=uMoonLump[i];if(ang>(k<0.5?r*1.16:r*(1.0+lp))+uPixAng)return vec4(0.0);',
  // a lumpy body (the Companion, Vesta-like): its outline wanders round the limb and is squashed along its pole
  ' if(lp>0.0){vec3 xd=normalize(d-m*c+1e-7*uRingT),sN=normalize(cross(uRingT,m)),np=normalize(uRingN-m*dot(uRingN,m));float th=atan(dot(xd,sN),dot(xd,uRingT));',
  '  float sc=(1.0+lp*(0.6*atmSkyNoise(vec3(cos(th)*1.4,sin(th)*1.4,7.0),370u)+0.35*atmSkyNoise(vec3(cos(th)*3.2,sin(th)*3.2,9.0),371u)))*(1.0-0.6*lp*abs(dot(xd,np)));',
  '  if(ang>r*sc+uPixAng)return vec4(0.0);r*=sc;}',
  // Day's umbrella plumes standing over its limb, lit on the sunward side, rising and falling with the vents
  ' if(ang>r&&k<0.5){vec3 x=normalize(d-m*c);float pa=atan(dot(x,normalize(cross(uRingT,m))),dot(x,uRingT));float hgt=(ang-r)/(0.16*r);',
  '  float pl=smoothstep(0.62,0.92,atmSkyNoise(vec3(cos(pa)*2.6,sin(pa)*2.6,uMoonT*0.06),360u)*0.5+0.5+0.15*atmSkyNoise(vec3(cos(pa)*9.0,sin(pa)*9.0,hgt*3.0+uMoonT*0.1),361u));',
  '  float a=pl*(1.0-smoothstep(0.0,1.0,hgt))*smoothstep(0.0,0.08,hgt+0.08)*0.6;float lit=smoothstep(-0.2,0.5,dot(x,uMoonL[i]));',
  '  return vec4(vec3(0.86,0.82,0.66)*(0.10+0.95*lit),a);}',
  ' vec3 x=(d-m*c)/sin(r);float xx=min(dot(x,x),1.0);vec3 N=normalize(x-m*sqrt(1.0-xx));vec3 L=uMoonL[i];',
  ' if(lp>0.0)N=normalize(N+lp*1.3*vec3(atmSkyNoise(N*2.6,372u),atmSkyNoise(N*2.6+3.0,373u),atmSkyNoise(N*2.6+6.0,374u)));',   // and its surface heaves
  ' vec3 q=vec3(dot(N,uRingT),dot(N,normalize(cross(uRingT,m))),dot(N,m));float ndl=dot(N,L),l=((k>1.5&&k<2.5)||k>5.5)?smoothstep(-0.12,0.45,ndl):max(ndl,0.0);',
  ' vec3 nN=normalize(uRingN),fG=uMoonG[i],fP=normalize(fG-nN*dot(fG,nN)),lV=uMoonV[i],lP=normalize(lV-fP*dot(lV,fP)-nN*dot(lV,nN)+1e-5);',
  ' vec3 P=vec3(dot(N,fP),-dot(N,lP),dot(N,nN));vec3 alb;vec4 cb=vec4(0.0);vec3 em=vec3(0.0);',
  ' if(uMoonMapOn>0.5){vec2 muv=vec2(0.5+atan(P.y,P.x)/6.2831853,0.5-asin(clamp(P.z,-1.0,1.0))/3.14159265);',
  '  alb=texture(uMoonMaps,vec2(muv.x,1.0-(float(i)+clamp(muv.y,0.004,0.996))/6.0)).rgb;',
  '  if(k>6.5)cb.a=1.0-smoothstep(0.05,0.13,dot(alb,vec3(0.3,0.55,0.15)));}',   // the tar seas, from the map: its near-black
  ' else{float cm=(k>0.5&&k<5.5&&(k<1.5||k>2.5))?atmSkyCraterMask(q,240u+uint(k)*16u):0.0;if(k>6.5)cb=atmSkyCarbon(q,uMoonT);',
  '  alb=k<3.5?atmSkyMoonSurf(q,k,cm):k<4.5?atmSkyIapetus(N,uMoonV[i],q,cm):k<5.5?atmSkyMimas(N,uMoonV[i],L,q,cm):k<6.5?atmSkyVitriol(q,uMoonT):cb.rgb;}',
  // Vesta's Rheasilvia: a basin over its south pole with a bright rim and a bright central peak
  ' if(lp>0.0){float bz=-P.z;alb*=1.0-0.20*smoothstep(0.55,0.72,bz)*(1.0-smoothstep(0.90,0.96,bz));alb+=vec3(0.10)*exp(-pow((bz-0.58)/0.04,2.0))+vec3(0.14)*smoothstep(0.95,0.995,bz);}',
  ' if(k>5.5&&k<6.5){vec4 vc=atmSkyVitriolCloud(P,uMoonT);alb=mix(alb,vc.rgb,vc.a);}',
  ' if(k>6.5){vec4 cc=atmSkyCarbonCloud(P,uMoonT);alb=mix(alb,vec3(0.80,0.52,0.28),0.10);alb=mix(alb,cc.rgb,cc.a);cb.a*=1.0-cc.a;}',
  ' if(k<0.5){vec4 dv=atmSkyDayVolc(q,uMoonT);alb=mix(alb,vec3(0.10,0.045,0.025),dv.x*(uMoonMapOn>0.5?0.35:1.0));alb=mix(alb,vec3(0.80,0.76,0.62),dv.z*0.8);',
  '  em=vec3(1.0,0.40,0.07)*1.7*dv.y*(1.0-0.6*dv.z)*(0.35+0.65*(1.0-l));}',   // the glow, strongest where the sun is not
  ' vec3 col=alb*uMoonC[i]*(l*1.05+0.012)+uShineC*uShineI*0.04+em;',
  ' if(k>6.5){col+=vec3(1.0,0.92,0.80)*pow(max(dot(reflect(-L,N),-d),0.0),60.0)*1.4*cb.a;col+=vec3(0.95,0.55,0.25)*pow(1.0-max(dot(N,-d),0.0),3.0)*0.22*smoothstep(-0.3,0.2,ndl);}',   // the tar seas glint; a thin orange haze at the limb
  ' if(k>5.5&&k<6.5)col+=vec3(0.62,0.88,0.70)*pow(1.0-max(dot(N,-d),0.0),2.5)*0.35*smoothstep(-0.3,0.2,ndl);',   // the vitriolic world's sulfate haze: a pale green limb
  ' if(k>1.5&&k<2.5)col+=vec3(0.9,0.85,0.7)*pow(1.0-max(dot(N,-d),0.0),3.0)*0.25*smoothstep(-0.3,0.2,ndl);',
  ' return vec4(col,1.0-smoothstep(r-uPixAng,r,ang));}',
  // ---- 7 clouds: (rgb, alpha)
  'vec4 atmSkyClouds(vec3 d,vec3 air){if(d.y<0.004||uCloud.x<=0.0)return vec4(0.0);',
  ' vec2 w=uWind*uTime*uCloudH.w;vec3 amb=mix(uZen,uHor,0.55);float cs=max(dot(d,uSunDir),0.0);',
  ' vec3 sunL=uSunC*uSunI*(1.0-uEclipse);vec2 s2=normalize(uSunDir.xz+1e-5);',
  ' vec4 o=vec4(0.0);',
  ' if(uCloud.z>0.0&&(uCloudH.y-uCamPos.y)/d.y>0.0){vec2 p=(uCamPos.xz+d.xz/d.y*(uCloudH.y-uCamPos.y))/uCloudH.z;vec3 q=vec3(p.x*0.35+w.x*0.5,p.y*1.6+w.y*0.5,3.0);',
  '  float n=atmSkyFbm(q,4,90u)*0.5+0.5;float a=smoothstep(0.58,0.86,n)*uCloud.z*0.5*smoothstep(0.004,0.08,d.y)*exp(-uCloudH.y/max(d.y,0.004)/160000.0);',
  '  vec3 c=sunL*0.42*(0.75+0.5*pow(cs,6.0))+amb*0.85+uShineC*uShineI*0.25;o=vec4(c,a);}',
  ' float hc=uCloudH.x-uCamPos.y;if(uCloud.y>0.0&&hc/d.y>0.0){vec2 xz=uCamPos.xz+d.xz/d.y*hc;',
  '  float bank=uCloud.w*exp(-d.y*9.0);float n=atmCloudField(xz,5)+bank*0.35;',
  '  float cov=atmCloudCover(n);',
  '  float n2=atmCloudField(xz+s2*0.18*uCloudH.z,5)+bank*0.35;float sh=clamp(0.62+(n-n2)*3.2,0.0,1.0);',
  '  float dist=abs(hc/max(abs(d.y),0.004));float a=cov*smoothstep(0.004,0.05,d.y)*exp(-dist/60000.0);',
  '  vec3 c=sunL*0.40*(0.35+0.65*sh)*(1.0+0.6*pow(cs,10.0)*(1.0-cov))+amb*(0.75-0.25*cov)+uShineC*uShineI*0.35*sh;',
  '  c=mix(c,air,1.0-exp(-dist/45000.0));o.rgb=mix(o.rgb,c,a);o.a=o.a+a*(1.0-o.a);}',
  ' return o;}',
  // ---- 8 the ridges: elevation (degrees) of layer i at azimuth fraction u, interpolated between two texels
  'vec2 atmSkyRidgeAt(int i,float u){float x=fract(u)*1024.0;int a=int(floor(x));float t=x-float(a);vec4 p=texelFetch(uRidgeTex,ivec2(a,i),0),q=texelFetch(uRidgeTex,ivec2((a+1)&1023,i),0);return mix(p.rg,q.rg,t);}',
  'vec4 atmSkyRidges(vec3 d,vec3 air){float el=degrees(asin(clamp(d.y,-1.0,1.0))),az=degrees(atan(d.x,-d.z));float u=az/360.0;',
  ' vec4 o=vec4(0.0);',
  ' for(int i=0;i<'+NR+';i++){if(i>=uRidgeN)break;vec2 e=atmSkyRidgeAt(i,u);float aa=uPixAng*57.29578;if(el>e.x+aa)continue;',
  '  float cover=1.0-smoothstep(e.x-aa,e.x+aa,el);vec4 R=uRidge[i];float dist=R.x,hgt=dist*tan(radians(el));',
  '  vec3 ou=normalize(vec3(d.x,0.0,d.z)+1e-5),tt=vec3(-ou.z,0.0,ou.x);',
  '  float gul=atmSkyNoise(vec3(u*900.0,el*1.6,float(i)),110u)+0.5*atmSkyNoise(vec3(u*2600.0,el*5.0,float(i)+3.0),111u);',
  '  vec3 N=normalize(-ou+vec3(0.0,0.55,0.0)-tt*(e.y*1.4+gul*0.6));',
  '  float fr=1.0-smoothstep(R.z-40.0,R.z+40.0,hgt+gul*60.0),sn=smoothstep(R.y-50.0,R.y+50.0,hgt+gul*140.0);',
  '  vec3 base=mix(uRidgeRock[i],uRidgeForest[i],fr);base=mix(base,uRidgeSnow[i],sn*(1.0-fr));',
  '  float L=max(dot(N,uSunDir),0.0)*(1.0-uEclipse);float Lg=max(dot(N,uGiantDir),0.0);',
  '  vec3 c=base*(uSunC*uSunI*0.36*L+mix(uZen,uHor,0.6)*0.85+uShineC*uShineI*0.5*Lg);',
  '  float hz=clamp((1.0-exp(-dist*uFogD*R.w))+0.06,0.0,1.0);vec3 ha=mix(uFogC,air,0.35);c=mix(c,ha,hz);',
  '  o.rgb=mix(o.rgb,c,cover);o.a=max(o.a,cover);}',
  ' return o;}',
  // ---- 3b the broken station (the owner, 2026-10-26): a torus 24 km across, a dozen pixels wide overhead, so its ring is
  // just readable: a sector torn out, a second small break, a hub and spokes (one snapped) that only a long lens shows.
  // Drawn on the plane of the sky about its direction, the ring an ellipse from its axis; lines thinner than a pixel dim
  // rather than flicker. Behind it along its orbit trails its wreckage: specks of sunlit metal (some glinting as they
  // tumble) spreading wider and thinner with distance, in a faint haze of fine dust; all of it dark in Krator's shadow
  'vec4 atmSkyStation(vec3 d,out vec3 deb){deb=vec3(0.0);vec3 c=uStaDir;float cd=dot(d,c);float R=uStaK.x,D=uStaK.z,trail='+f(S.station.trailKm)+'/D;',
  ' if(uStaK.w<0.5||cd<0.0||atmSkyAng(d,c)>trail*1.15+R*2.0+uPixAng*4.0)return vec4(0.0);',
  ' vec3 q=(d/cd-c)*D;float pk=uPixAng*D;vec3 ax=uStaAx,u=cross(c,ax);float ul=length(u);u=ul>1e-4?u/ul:normalize(cross(c,vec3(0.0,1.0,0.0)));',
  ' vec3 w=cross(ax,u),wv=w-c*dot(w,c);float kk=max(length(wv),0.03);vec3 vh=wv/kk;float Rk=R*D;',
  ' float x=dot(q,u),y=dot(q,vh),yk=y/kk,rho=length(vec2(x,yk))/Rk;vec4 o=vec4(0.0);',
  ' if(rho<2.0){float th=atan(yk,x),tube='+f(S.station.tubeKm)+';',
  '  vec2 gr=vec2(x,yk/kk)/(Rk*Rk*max(rho,1e-3));float de=(rho-1.0)/max(length(gr),1e-5);',
  // the torn sector (ragged ends) and a smaller break
  '  float rag=atmSkyU(uvec3(uint(floor((th+3.2)*40.0)),3u,0u),620u);float a1=abs(mod(th-0.95+3.14159265,6.28318531)-3.14159265),a2=abs(mod(th-3.95+3.14159265,6.28318531)-3.14159265);',
  '  float keep=step(0.55+0.10*rag,a1)*step(0.10+0.06*rag,a2);',
  '  float tw=max(tube,0.5*pk);float cov=keep*pow(tube/tw,0.6)*(1.0-smoothstep(tw-0.5*pk,tw+0.5*pk,abs(de)));',
  // the hub and three spokes, the one into the torn sector snapped short
  '  float hub=1.0-smoothstep(1.4-0.5*pk,1.4+0.5*pk,length(vec2(x,y)));float sp=0.0;',
  '  for(int j=0;j<3;j++){float ts=0.40+2.0944*float(j);vec2 e=vec2(cos(ts),sin(ts)*kk)*Rk*(j==0?0.45:0.97);vec2 p=vec2(x,y);float h=clamp(dot(p,e)/dot(e,e),0.0,1.0);',
  '   float sw=max(0.3,0.5*pk);sp=max(sp,(0.3/sw)*(1.0-smoothstep(sw-0.5*pk,sw+0.5*pk,length(p-e*h))));}',
  '  float a=max(cov,max(hub*min(1.0,1.4/max(0.5*pk,1.4)),sp));',
  '  if(a>0.0){vec3 nt=cos(th)*u+sin(th)*w,L=uSunDir;float lam=0.25+0.45*max(dot(nt,L),0.0)+0.30*abs(dot(ax,L));if(cov<a)lam=0.3+0.5*abs(dot(ax,L));',
  '   float pan=0.75+0.35*atmSkyU(uvec3(uint(floor((th+3.2)*14.0)),5u,0u),621u);',   // its hull panels, some scorched darker
  '   vec3 alb=vec3(0.92,0.91,0.88)*pan;o=vec4(alb*(lam*uStaK.y*1.5+0.012)+uShineC*uShineI*0.05,a);}}',
  // the wreckage: along-track distance behind it (true km, undoing the foreshortening) and across it
  ' if(uStaK.y>0.0){vec3 vb=-(uStaV-c*dot(uStaV,c));float vl=max(length(vb),0.05);vb/=vl;vec3 lt=cross(c,vb);',
  '  float s=dot(q,vb)/vl,l=dot(q,lt),cell=2.0;float ci=floor(s/cell);',
  '  if(s>-6.0&&s<'+f(S.station.trailKm)+'+6.0){for(int j=-1;j<=1;j++)for(int m=0;m<3;m++){float cj=ci+float(j);if(cj<-1.0)continue;uvec3 h=uvec3(uint(cj+4.0),uint(m),9u);',
  '    float sc=(cj+atmSkyU(h,630u))*cell,dn=0.22+0.78*exp(-max(sc,0.0)/160.0);if(atmSkyU(h,631u)>dn)continue;',
  '    float wid=0.8+0.11*max(sc,0.0),lc=wid*(atmSkyU(h,632u)+atmSkyU(h,633u)-1.0)*1.6;',
  '    float sz=0.10+0.55*pow(atmSkyU(h,634u),3.0),gl=step(atmSkyU(h,635u),0.3)*pow(max(sin(uRealT*(0.6+2.4*atmSkyU(h,636u))+6.2832*atmSkyU(h,637u)),0.0),40.0)*3.0;',
  '    float ds=(s-sc)*vl,dl=l-lc,sg=0.75*pk;deb+=vec3(0.84,0.82,0.78)*(min(1.2,max(0.06,10.0*sz*sz/(pk*pk)))*(1.0+gl))*exp(-(ds*ds+dl*dl)/(sg*sg));}',
  '   float wd=0.8+0.11*max(s,0.0);deb+=vec3(0.72,0.72,0.74)*0.032*exp(-l*l/(wd*wd))*exp(-max(s,0.0)/180.0)*smoothstep(-4.0,6.0,s);}',
  '  deb*=uStaK.y;}',
  ' return o;}',
  // ---- 3c shooting stars (the owner, 2026-10-26): three channels of time slots in wall-clock seconds; a slot fires with a
  // chance set by uMeteor (about one meteor in 20 s at 1), a streak 6-24 degrees long crossing the sky in under a second,
  // mostly downward, its head green-white and its train orange; the odd one flares. In the air, so over the bodies and under the clouds
  'vec3 atmSkyMeteors(vec3 d){vec3 o=vec3(0.0);if(uMeteor<=0.0||d.y<-0.02)return o;',
  ' for(int j=0;j<3;j++){float per=7.0+3.0*float(j),tt=uRealT/per+0.37*float(j),k=floor(tt),f=fract(tt)*per;uvec3 h=uvec3(uint(k+16.0),uint(j),7u);',
  '  if(atmSkyU(h,600u)>0.15*uMeteor)continue;float dur=0.35+0.8*atmSkyU(h,601u),t0=(per-dur)*atmSkyU(h,602u),p=(f-t0)/dur;if(p<0.0||p>1.0)continue;',
  '  float az=6.2831853*atmSkyU(h,603u),el=radians(22.0+55.0*atmSkyU(h,604u));vec3 s=vec3(sin(az)*cos(el),sin(el),-cos(az)*cos(el));',
  '  vec3 e1=normalize(cross(s,vec3(0.0,1.0,0.0))),e2=cross(e1,s);float pa=4.712389+2.6*(atmSkyU(h,605u)-0.5);vec3 td=cos(pa)*e1+sin(pa)*e2;',
  '  float len=radians(6.0+18.0*atmSkyU(h,606u)),off=asin(clamp(dot(d,normalize(cross(s,td))),-1.0,1.0)),a=atan(dot(d,td),dot(d,s));',
  '  float hd=len*p,tl=max(0.0,hd-len*0.4);if(a<tl-0.02||a>hd+0.02)continue;float w=uPixAng*1.1,x=clamp((a-tl)/max(hd-tl,1e-4),0.0,1.0);',
  '  float br=(0.5+1.3*atmSkyU(h,607u))*pow(sin(3.14159*p),0.7)+step(0.75,atmSkyU(h,608u))*2.2*exp(-pow((p-0.6-0.3*atmSkyU(h,609u))/0.05,2.0));',
  '  float tr=exp(-off*off/(w*w))*pow(x,1.6)*step(a,hd),hg=exp(-((a-hd)*(a-hd)+off*off)/(w*w*2.2));',
  '  o+=mix(vec3(1.0,0.60,0.30),vec3(0.82,1.0,0.88),x)*br*(0.7*tr+1.2*hg);}',
  ' return o;}',
  // ---- 8 the landmarks (ATMOS.skyLandmarks, SKY-PLAN.md 4): plumes, an overcast ceiling, cloud seas and horizon bands, lit by
  // the sun, the sky and the giantshine as the clouds are, hazed toward the air by their own haze; drawn in order, the later over
  'float atmSkyWin(vec3 d,vec4 W,float pw){if(W.w>=3.14)return 1.0;vec2 h=normalize(d.xz+1e-5),c=normalize(W.xz+1e-5);float dz=acos(clamp(dot(h,c),-1.0,1.0));return pow(max(0.0,cos(min(1.5708,dz*1.5708/W.w))),pw);}',
  'vec3 atmSkyLmLight(vec3 c){return c*(uSunC*uSunI*0.25+mix(uZen,uHor,0.55)*0.62+uShineC*uShineI*0.3);}',
  // low: the seas and bands (drawn after the ridges, lapping their feet); else the plumes and ceilings (before the clouds)
  'vec4 atmSkyLandmarks(vec3 d,vec3 air,bool low){vec4 o=vec4(0.0);float el=asin(clamp(d.y,-1.0,1.0));',
  ' for(int i=0;i<'+NL+';i++){if(i>=uLmN)break;float k=uLmK[i];if(k<-0.5||(k>1.5)!=low)continue;vec4 lA=uLm[i*5],lB=uLm[i*5+1],lC=uLm[i*5+2],lD=uLm[i*5+3],lE=uLm[i*5+4];vec4 m=vec4(0.0);',
  // a plume: the nearest point of a quadratic curve through via's pull, sampled in 12 chords; puffs from the noise drifting up it
  '  if(k<0.5){float best=9.0,bt=0.0;vec3 bp=lA.xyz,prev=lA.xyz;',
  '   for(int j=1;j<=12;j++){float t=float(j)/12.0,u=1.0-t;vec3 p=normalize(u*u*lA.xyz+2.0*u*t*lB.xyz+t*t*lC.xyz),sg=p-prev;float h=clamp(dot(d-prev,sg)/max(dot(sg,sg),1e-9),0.0,1.0);vec3 q=prev+sg*h;float dd=length(d-q);if(dd<best){best=dd;bt=(float(j-1)+h)/12.0;bp=q;}prev=p;}',
  '   float w=mix(lA.w,lB.w,bt);if(best<w*1.8){float pr=exp(-best*best/(w*w)*1.3);',
  // billows: two scales of noise riding up the plume; the edge breaks into puffs, the core is thick and its belly dark
  '    vec3 np=d*(2.4/max(w,0.004))+vec3(0.0,-uTime*lE.w,uTime*lE.w*0.6);float n=atmSkyFbm(np,4,700u+uint(i)*7u)*0.5+0.5,n2=atmSkyFbm(np*2.7+vec3(3.1),3,705u+uint(i)*7u)*0.5+0.5;',
  '    float dens=smoothstep(0.42,0.72,0.55*pr+0.55*n+0.15*n2-0.12)*smoothstep(0.03,0.35,pr)*smoothstep(0.0,0.05,bt)*(1.0-smoothstep(0.7,1.0,bt));',
  '    float side=clamp(dot(d-bp,uSunDir)/(w*0.9),-1.0,1.0),th=pr*n;float lt=clamp(0.55+0.35*side+0.45*(n2-0.5)-0.35*th,0.0,1.0);',
  '    vec3 c=atmSkyLmLight(mix(lE.rgb,lD.rgb,lt));m=vec4(mix(c,air,lD.w),clamp(dens*lC.w,0.0,1.0));}}',
  // a ceiling: the underside of a spread plume over the sky above its elevation, lumpy, open low in its gap
  '  else if(k<1.5){if(d.y>lB.x-0.2){float cov=smoothstep(lB.x,lB.x+sin(lB.y),d.y),gap=atmSkyWin(d,lA,1.0)*(1.0-smoothstep(lB.z-0.05,lB.z+0.05,d.y));',
  '   float n=atmSkyFbm(d*4.0+vec3(uTime*0.002,0.0,0.0),4,720u+uint(i))*0.5+0.5;cov*=clamp(1.0-gap*1.2,0.0,1.0)*(1.0-lC.x+lC.x*smoothstep(0.3,0.7,n));',
  '   vec3 c=atmSkyLmLight(mix(lE.rgb,lD.rgb,smoothstep(0.35,0.75,n)));m=vec4(mix(c,air,lD.w*(1.0-d.y)),cov*lB.w);}}',
  // a cloud sea: a billowing floor from its top down, in its window, sunlit on top
  '  else if(k<2.5){float w=atmSkyWin(d,lA,lB.z);if(w>0.0&&d.y<lB.x+lB.y){float az=atan(d.x,-d.z);',
  '   float ne=atmSkyFbm(vec3(cos(az)*14.0,sin(az)*14.0,uTime*0.002),3,741u+uint(i))*0.5+0.5,top=lB.x+lB.y*(ne-0.35)*w;',
  // the billows on the floor in perspective: the floor's coordinates under the eye, so they crowd toward the horizon
  '   vec2 g=d.xz/max(top+0.004-d.y,0.003)*0.35;float n=atmSkyFbm(vec3(g,uTime*0.003),4,740u+uint(i))*0.5+0.5;',
  '   float cov=(1.0-smoothstep(top-0.002,top+0.002,d.y))*w,lt=0.75*smoothstep(0.25,0.8,n)+0.25*smoothstep(-0.03,0.0,d.y-top);',
  '   vec3 c=atmSkyLmLight(mix(lE.rgb,lD.rgb,lt));m=vec4(mix(c,air,lD.w*smoothstep(-0.12,0.0,d.y)),cov*lB.w);}}',
  // a band: a strip between two elevations in its window (a glint, a far lake, a cataract, a cloud belt with noise)
  '  else{float w=atmSkyWin(d,lA,lB.z);if(w>0.0&&el>lB.x-0.01&&el<lB.y+0.01){float sf=max(uPixAng*1.5,(lB.y-lB.x)*0.12);',
  '   float cov=smoothstep(lB.x-sf,lB.x+sf,el)*(1.0-smoothstep(lB.y-sf,lB.y+sf,el))*w;',
  '   if(lC.x>0.0){float n=atmSkyFbm(d*vec3(14.0,40.0,14.0)+vec3(uTime*0.004,0.0,0.0),3,760u+uint(i))*0.5+0.5;cov*=mix(1.0,smoothstep(0.35,0.65,n),lC.x);}',
  '   m=vec4(mix(atmSkyLmLight(lD.rgb),air,lD.w),cov*lB.w);}}',
  '  o.rgb=o.rgb*(1.0-m.a)+m.rgb*m.a;o.a=o.a*(1.0-m.a)+m.a;}',
  ' return o.a>0.0?vec4(o.rgb/o.a,o.a):o;}',
  // ---- the whole sky
  'vec3 atmSky(vec3 d){d=normalize(d);vec3 air=atmSkyAir(d);vec3 T=atmSkyT(d);',
  ' float skyL=dot(air,vec3(0.3,0.55,0.15));float vis=clamp(1.0-smoothstep(0.012,0.20,skyL)*(1.0-uDayStars*0.8),0.0,1.0);',
  ' vec3 col=air;float lanes;',
  ' if(vis>0.003&&d.y>-0.05){vec3 e=uEq*d;col+=atmSkyDeep(e,lanes)*T*vis;}',
  // the sun's disc
  ' float cs=dot(d,uSunDir),rs='+f(S.sunDiaDeg/2*Math.PI/180)+';float sd=1.0-smoothstep(rs*0.92,rs*1.08,atmSkyAng(d,uSunDir));',
  ' col+=uSunC*sd*6.0*T*(0.25+0.75*min(uSunI,1.0));',
  // opaque bodies: the moons, then the giant over them, the ring over both on its near half
  ' vec3 bc=vec3(0.0);float op=0.0;',
  ' int mi=-1;for(int i=0;i<6;i++){float rr=uMoonR[i]*(uMoonK[i]<0.5?1.16:1.0+uMoonLump[i])+uPixAng;if(atmSkyAng(d,uMoonDir[i])<rr&&(mi<0||uMoonF[i]>0.5))mi=i;}',
  ' vec4 mo=mi>=0?atmSkyMoon(d,mi):vec4(0.0);bool mf=mi>=0&&uMoonF[mi]>0.5;',
  ' if(!mf&&mo.a>0.0){bc=mix(bc,mo.rgb,mo.a);op=max(op,mo.a);}',
  ' float tG;vec4 g=atmSkyGiant(d,tG);if(g.a>0.0){bc=mix(bc,g.rgb,g.a);op=max(op,g.a);}',
  ' vec4 r=atmSkyRing(d,tG,g.a>0.5);if(r.a>0.0){bc=op>0.0?mix(bc,r.rgb,r.a):r.rgb;op=op>0.0?op:r.a;}',
  // a moon nearer than the giant (Day crossing its face) is drawn over it
  ' if(mf&&mo.a>0.0){bc=op>0.0?mix(bc,mo.rgb,mo.a):mo.rgb;op=max(op,mo.a);}',
  // the station, nearest of all
  ' vec3 deb;vec4 sta=atmSkyStation(d,deb);if(sta.a>0.0){bc=op>0.0?mix(bc,sta.rgb,sta.a):sta.rgb;op=max(op,sta.a);}',
  ' if(op>0.0){float tm=dot(T,vec3(0.33));float hz=clamp(uHazeFloor*0.55+(1.0-tm)*0.6+0.35*exp(-max(d.y,0.0)/0.10)*uHazeFloor,0.0,0.94);',
  '  vec3 ob=mix(bc*T,air,hz);col=mix(col,ob,op);}',
  ' col+=deb*T*(1.0-0.9*uHazeFloor);',
  ' col+=atmSkyMeteors(d)*T*clamp(1.0-smoothstep(0.03,0.30,skyL),0.0,1.0);',
  ' vec4 lm=uLmN>0?atmSkyLandmarks(d,air,false):vec4(0.0);col=mix(col,lm.rgb,lm.a);',
  ' vec4 cl=atmSkyClouds(d,air);col=mix(col,cl.rgb,cl.a);',
  ' vec4 rd=atmSkyRidges(d,air);col=mix(col,rd.rgb,rd.a);',
  ' vec4 lo=uLmN>0?atmSkyLandmarks(d,air,true):vec4(0.0);col=mix(col,lo.rgb,lo.a);',
  ' if(d.y<0.0)col=mix(col,uFogC,(1.0-smoothstep(-0.12,0.0,d.y))*(1.0-rd.a)*(1.0-lm.a)*(1.0-lo.a));',
  ' return col;}'].join('\n');};
 A.onInit.push(()=>{if(A.T.ShaderChunk)A.T.ShaderChunk.atmos_sky=A.skyGLSL();});
})();
