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
 A.skyGLSL=function(){const f=A.glf,S=A.SKY,G=S.giant,NR=A.SKY_MAX_RIDGES,NS=S.stars.length;
  const rg=Math.sin(G.diaDeg/2*Math.PI/180),cosG=Math.cos(G.diaDeg/2*Math.PI/180);
  return[
  'uniform vec3 uSunDir,uGiantDir,uPole,uRingN,uZen,uHor,uSunHor,uSunC,uExt,uShineC,uCluster,uFogC;',
  'uniform float uSunI,uHazeFloor,uDayStars,uNight,uEclipse,uShineI,uSpin,uPixAng,uTime,uFogD;',
  'uniform mat3 uEq;',                                   // world -> inertial (the stars' sphere)
  // uPole: the giant's spin axis (its bands and ring plane), not Krator's pole
  'uniform vec3 uMoonDir[4],uMoonC[4],uMoonL[4],uMoonV[4];uniform float uMoonR[4],uMoonK[4],uMoonF[4],uMoonT;uniform vec3 uRingT;',   // uMoonT: world hours since game start   // uMoonF: 1 when nearer than the giant   // uMoonL: each moon's sun (its phase); uMoonK: its kind
  'uniform vec4 uStar['+NS+'];uniform vec3 uStarC['+NS+'];',
  'uniform vec3 uGDeep,uGMid,uGPale,uGCloud,uGPlank,uGHaze,uGTeal,uGRim,uGNight,uGRing;',
  'uniform vec4 uCloud;uniform vec4 uCloudH;uniform vec2 uWind;',   // cover, cumulus, cirrus, bank; heights, scale, drift
  'uniform vec3 uNightK;',                               // stars, nebula, galaxy gains
  'uniform sampler2D uRidgeTex;uniform int uRidgeN;uniform vec4 uRidge['+NR+'];uniform vec3 uRidgeRock['+NR+'],uRidgeForest['+NR+'],uRidgeSnow['+NR+'];',
  // ---- the hash and gradient noise (lowbias32; bit-exact across engines)
  'uint atmSkyH(uvec3 c,uint s){uint h=(c.x*1597334677u)^(c.y*3812015801u)^(c.z*2246822519u)^(s*2654435769u);h^=h>>16u;h*=2146121005u;h^=h>>15u;h*=2221713035u;h^=h>>16u;return h;}',
  'float atmSkyU(uvec3 c,uint s){return float(atmSkyH(c,s))/4294967296.0;}',
  'vec3 atmSkyGrad(ivec3 c,uint s){uint h=atmSkyH(uvec3(c),s);return vec3(float(h&1023u),float((h>>10u)&1023u),float((h>>20u)&1023u))/511.5-1.0;}',
  'float atmSkyNoise(vec3 x,uint s){vec3 fl=floor(x);ivec3 i=ivec3(fl);vec3 f=x-fl;vec3 u=f*f*f*(f*(f*6.0-15.0)+10.0);',
  ' float n000=dot(atmSkyGrad(i,s),f),n100=dot(atmSkyGrad(i+ivec3(1,0,0),s),f-vec3(1,0,0)),n010=dot(atmSkyGrad(i+ivec3(0,1,0),s),f-vec3(0,1,0)),n110=dot(atmSkyGrad(i+ivec3(1,1,0),s),f-vec3(1,1,0));',
  ' float n001=dot(atmSkyGrad(i+ivec3(0,0,1),s),f-vec3(0,0,1)),n101=dot(atmSkyGrad(i+ivec3(1,0,1),s),f-vec3(1,0,1)),n011=dot(atmSkyGrad(i+ivec3(0,1,1),s),f-vec3(0,1,1)),n111=dot(atmSkyGrad(i+ivec3(1,1,1),s),f-vec3(1,1,1));',
  ' return mix(mix(mix(n000,n100,u.x),mix(n010,n110,u.x),u.y),mix(mix(n001,n101,u.x),mix(n011,n111,u.x),u.y),u.z);}',
  'float atmSkyFbm(vec3 p,int oct,uint s){float v=0.0,a=0.5,n=0.0;for(int i=0;i<6;i++){if(i>=oct)break;v+=a*atmSkyNoise(p,s+uint(i));n+=a;p=p*2.03+vec3(1.7,9.2,3.1);a*=0.5;}return v/n;}',
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
  ' lanes=0.0;vec3 neb=vec3(0.0);float lit=0.0;',
  ' vec3 bright=vec3(0.0);for(int i=0;i<'+NS+';i++){vec4 st=uStar[i];float c=dot(e,st.xyz);float ang=sqrt(max(0.0,2.0-2.0*c));',
  '  float sg=uPixAng*(0.7+0.45*st.w),w2=st.w*st.w;bright+=uStarC[i]*(0.8*st.w*exp(-ang*ang/(sg*sg))+0.05*w2*exp(-ang/(uPixAng*6.0))+0.010*w2*exp(-ang/(uPixAng*26.0)));',
  '  if(i<14)lit+=st.w*exp(-ang/0.22);}',
  ' if(dust>0.001&&uNightK.y>0.0){vec3 q=e*2.6;vec3 w=vec3(atmSkyFbm(q+vec3(7.1,0.0,0.0),3,40u),atmSkyFbm(q+vec3(0.0,3.3,0.0),3,43u),atmSkyFbm(q+vec3(0.0,0.0,5.9),3,46u));',
  '  float n=atmSkyFbm(q*1.7+w*1.6,5,50u)*0.5+0.5;float fil=1.0-abs(atmSkyFbm(q*3.1+w*2.2,4,60u));',
  '  float den=smoothstep(0.42,0.85,n)*dust;float fl=pow(fil,6.0)*dust*0.8;',
  '  lanes=smoothstep(0.58,0.74,atmSkyFbm(q*2.2+w*0.8,4,70u)*0.5+0.5)*dust*0.9;',
  '  float L=0.20+0.10*lit;neb=(vec3(0.22,0.40,1.0)*den*L*0.55+vec3(0.55,0.68,1.0)*fl*L*0.22)*(1.0-0.8*lanes)*uNightK.y;}',
  ' vec3 field=atmSkyField(e,520.0,0.07+0.25*near,1u)*(0.6+0.5*near)+atmSkyField(e,140.0,0.10+0.30*near,9u)*(0.9+0.8*near);',
  ' field*=mix(vec3(1.0),vec3(0.82,0.9,1.0),near)*uNightK.x;',
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
  'vec3 atmSkyCraters(vec3 q,vec3 c,vec3 rim,uint s){for(int j=0;j<2;j++){float sc=j==0?7.0:19.0;vec3 g=q*sc+vec3(40.0),fl=floor(g);float best=9.0;',
  '  for(int a=0;a<27;a++){vec3 cc=fl+vec3(float(a%3)-1.0,float((a/3)%3)-1.0,float(a/9)-1.0);uvec3 h=uvec3(ivec3(cc));',
  '   best=min(best,length(g-cc-vec3(atmSkyU(h,s+uint(j)),atmSkyU(h,s+10u),atmSkyU(h,s+20u))));}',
  '  c=mix(c,rim,(1.0-smoothstep(0.07,0.20,best))*(j==0?0.85:0.6));}return c;}',
  'vec3 atmSkyMoonSurf(vec3 q,float k){',
  ' if(k<0.5){float n=atmSkyFbm(q*3.0,4,200u)*0.5+0.5;vec3 c=mix(vec3(0.95,0.88,0.58),vec3(0.86,0.64,0.32),smoothstep(0.35,0.75,n));',
  '  float v=atmSkyFbm(q*7.0,3,210u)*0.5+0.5;c=mix(c,vec3(0.72,0.34,0.14),smoothstep(0.64,0.72,v)*0.8);c=mix(c,vec3(0.12,0.08,0.05),smoothstep(0.72,0.79,v));',
  '  return mix(c,vec3(0.97,0.97,0.92),smoothstep(0.72,0.85,atmSkyFbm(q*2.0+4.0,3,220u)*0.5+0.5)*0.6);}',
  ' if(k<1.5)return atmSkyCraters(q,mix(vec3(0.19,0.17,0.15),vec3(0.31,0.28,0.25),atmSkyFbm(q*4.0,4,230u)*0.5+0.5),vec3(0.60,0.58,0.54),240u);',
  ' if(k<2.5)return mix(vec3(0.93,0.87,0.68),vec3(0.99,0.95,0.82),0.5+0.5*atmSkyFbm(vec3(q.xy*1.5,q.z*5.0),3,270u));',
  ' vec3 c=atmSkyCraters(q,mix(vec3(0.33,0.32,0.30),vec3(0.42,0.41,0.39),atmSkyFbm(q*3.5,4,280u)*0.5+0.5),vec3(0.50,0.49,0.47),290u);',
  ' return mix(c,vec3(0.95,0.95,0.92),smoothstep(0.86,0.92,atmSkyFbm(q*5.0,3,300u)*0.5+0.5));}',
  // Day's volcanoes (the owner, 2026-10-25): about half the cells of a lattice on its surface hold a vent, each waking and
  // sleeping on its own cycle in WORLD hours (T), so the face changes from one night to the next. An active vent spreads
  // dark flows that grow and wander, glows at its heart (orange, showing best on the night side) and throws an ash cloud
  // that drifts. Returns (flow, glow, ash, 0)
  'vec4 atmSkyDayVolc(vec3 q,float T){vec3 g=q*5.0+vec3(20.0),fl=floor(g);float flow=0.0,glow=0.0,ash=0.0;',
  ' for(int a=0;a<27;a++){vec3 cc=fl+vec3(float(a%3)-1.0,float((a/3)%3)-1.0,float(a/9)-1.0);uvec3 h=uvec3(ivec3(cc));if(atmSkyU(h,350u)>0.5)continue;',
  '  vec3 dv=g-cc-vec3(atmSkyU(h,351u),atmSkyU(h,352u),atmSkyU(h,353u));float dd=length(dv);if(dd>1.4)continue;',
  '  float act=smoothstep(0.35,0.95,0.5+0.5*sin(T*(0.05+0.25*atmSkyU(h,355u))+6.2832*atmSkyU(h,354u)));',
  '  float wob=atmSkyNoise(dv*2.5+vec3(0.0,0.0,T*0.02),356u);',
  '  flow=max(flow,(1.0-smoothstep(0.10,0.30+0.30*act,dd+0.25*wob))*(0.35+0.65*act));',
  '  float rib=smoothstep(0.55,0.78,atmSkyNoise(dv*6.0+vec3(T*0.05),357u)*0.5+0.5);',
  '  glow=max(glow,act*(1.0-smoothstep(0.03,0.20+0.14*act,dd+0.10*wob))+0.6*act*rib*(1.0-smoothstep(0.0,0.28+0.30*act,dd+0.3*wob)));',
  '  ash=max(ash,act*act*(1.0-smoothstep(0.15,0.85,dd+0.5*atmSkyNoise(dv*1.5+vec3(T*0.03,0.0,0.0),358u)))*0.7);}',
  ' return vec4(flow,glow,ash,0.0);}',
  // Iapetus: the hemisphere that leads in its orbit (V, its velocity) coal-dark, the trailing one bright as snow, the border
  // ragged, bright craters punched into the dark side, and the equatorial ridge (round its orbit's normal, uRingN)
  'vec3 atmSkyIapetus(vec3 N,vec3 V,vec3 q){float n=atmSkyFbm(q*3.0,4,310u);float lead=smoothstep(-0.18,0.22,dot(N,V)+0.22*n);',
  ' vec3 c=mix(atmSkyCraters(q,vec3(0.80,0.78,0.74),vec3(0.92,0.91,0.88),320u),atmSkyCraters(q,vec3(0.11,0.08,0.06),vec3(0.42,0.38,0.34),330u),lead);',
  ' float rg=1.0-smoothstep(0.0,0.05,abs(dot(N,uRingN)+0.02*n));return mix(c,c*(1.0-0.35*lead)+vec3(0.10)*lead,rg*0.7);}',
  'vec4 atmSkyMoon(vec3 d,int i){vec3 m=uMoonDir[i];float c=dot(d,m),r=uMoonR[i];float ang=acos(clamp(c,-1.0,1.0)),k=uMoonK[i];if(ang>(k<0.5?r*1.16:r)+uPixAng)return vec4(0.0);',
  // Day's umbrella plumes standing over its limb, lit on the sunward side, rising and falling with the vents
  ' if(ang>r){vec3 x=normalize(d-m*c);float pa=atan(dot(x,normalize(cross(uRingT,m))),dot(x,uRingT));float hgt=(ang-r)/(0.16*r);',
  '  float pl=smoothstep(0.62,0.92,atmSkyNoise(vec3(cos(pa)*2.6,sin(pa)*2.6,uMoonT*0.06),360u)*0.5+0.5+0.15*atmSkyNoise(vec3(cos(pa)*9.0,sin(pa)*9.0,hgt*3.0+uMoonT*0.1),361u));',
  '  float a=pl*(1.0-smoothstep(0.0,1.0,hgt))*smoothstep(0.0,0.08,hgt+0.08)*0.6;float lit=smoothstep(-0.2,0.5,dot(x,uMoonL[i]));',
  '  return vec4(vec3(0.86,0.82,0.66)*(0.10+0.95*lit),a);}',
  ' vec3 x=(d-m*c)/sin(r);float xx=min(dot(x,x),1.0);vec3 N=normalize(x-m*sqrt(1.0-xx));vec3 L=uMoonL[i];',
  ' vec3 q=vec3(dot(N,uRingT),dot(N,normalize(cross(uRingT,m))),dot(N,m));float ndl=dot(N,L),l=(k>1.5&&k<2.5)?smoothstep(-0.12,0.45,ndl):max(ndl,0.0);',
  ' vec3 alb=k<3.5?atmSkyMoonSurf(q,k):atmSkyIapetus(N,uMoonV[i],q);vec3 em=vec3(0.0);',
  ' if(k<0.5){vec4 dv=atmSkyDayVolc(q,uMoonT);alb=mix(alb,vec3(0.10,0.045,0.025),dv.x);alb=mix(alb,vec3(0.80,0.76,0.62),dv.z*0.8);',
  '  em=vec3(1.0,0.40,0.07)*1.7*dv.y*(1.0-0.6*dv.z)*(0.35+0.65*(1.0-l));}',   // the glow, strongest where the sun is not
  ' vec3 col=alb*uMoonC[i]*(l*1.05+0.012)+uShineC*uShineI*0.04+em;',
  ' if(k>1.5&&k<2.5)col+=vec3(0.9,0.85,0.7)*pow(1.0-max(dot(N,-d),0.0),3.0)*0.25*smoothstep(-0.3,0.2,ndl);',
  ' return vec4(col,1.0-smoothstep(r-uPixAng,r,ang));}',
  // ---- 7 clouds: (rgb, alpha)
  'vec4 atmSkyClouds(vec3 d,vec3 air){if(d.y<0.004||uCloud.x<=0.0)return vec4(0.0);',
  ' vec2 w=uWind*uTime*uCloudH.w;vec3 amb=mix(uZen,uHor,0.55);float cs=max(dot(d,uSunDir),0.0);',
  ' vec3 sunL=uSunC*uSunI*(1.0-uEclipse);vec2 s2=normalize(uSunDir.xz+1e-5);',
  ' vec4 o=vec4(0.0);',
  ' if(uCloud.z>0.0){vec2 p=d.xz/d.y*uCloudH.y/uCloudH.z;vec3 q=vec3(p.x*0.35+w.x*0.5,p.y*1.6+w.y*0.5,3.0);',
  '  float n=atmSkyFbm(q,4,90u)*0.5+0.5;float a=smoothstep(0.58,0.86,n)*uCloud.z*0.5*smoothstep(0.004,0.08,d.y)*exp(-uCloudH.y/max(d.y,0.004)/160000.0);',
  '  vec3 c=sunL*0.42*(0.75+0.5*pow(cs,6.0))+amb*0.85+uShineC*uShineI*0.25;o=vec4(c,a);}',
  ' if(uCloud.y>0.0){vec2 p=d.xz/d.y*uCloudH.x/uCloudH.z;vec3 q=vec3(p+w,0.0);',
  '  float bank=uCloud.w*exp(-d.y*9.0);float n=atmSkyFbm(q,5,100u)*0.5+0.5+bank*0.35;',
  '  float cov=smoothstep(1.0-uCloud.x,1.0-uCloud.x+0.22,n);',
  '  float n2=atmSkyFbm(q+vec3(s2*0.18,0.0),5,100u)*0.5+0.5+bank*0.35;float sh=clamp(0.62+(n-n2)*3.2,0.0,1.0);',
  '  float dist=uCloudH.x/max(d.y,0.004);float a=cov*smoothstep(0.004,0.05,d.y)*exp(-dist/60000.0);',
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
  // ---- the whole sky
  'vec3 atmSky(vec3 d){d=normalize(d);vec3 air=atmSkyAir(d);vec3 T=atmSkyT(d);',
  ' float sky=dot(air,vec3(0.3,0.55,0.15));float vis=clamp(1.0-smoothstep(0.012,0.20,sky)*(1.0-uDayStars*0.8),0.0,1.0);',
  ' vec3 col=air;float lanes;',
  ' if(vis>0.003&&d.y>-0.05){vec3 e=uEq*d;col+=atmSkyDeep(e,lanes)*T*vis;}',
  // the sun's disc
  ' float cs=dot(d,uSunDir),rs='+f(S.sunDiaDeg/2*Math.PI/180)+';float sd=smoothstep(cos(rs*1.08),cos(rs*0.92),cs);',
  ' col+=uSunC*sd*6.0*T*(0.25+0.75*min(uSunI,1.0));',
  // opaque bodies: the moons, then the giant over them, the ring over both on its near half
  ' vec3 bc=vec3(0.0);float op=0.0;',
  ' for(int i=0;i<4;i++){if(uMoonF[i]>0.5)continue;vec4 m=atmSkyMoon(d,i);if(m.a>0.0){bc=mix(bc,m.rgb,m.a);op=max(op,m.a);}}',
  ' float tG;vec4 g=atmSkyGiant(d,tG);if(g.a>0.0){bc=mix(bc,g.rgb,g.a);op=max(op,g.a);}',
  ' vec4 r=atmSkyRing(d,tG,g.a>0.5);if(r.a>0.0){bc=op>0.0?mix(bc,r.rgb,r.a):r.rgb;op=op>0.0?op:r.a;}',
  // a moon nearer than the giant (Day crossing its face) is drawn over it
  ' for(int i=0;i<4;i++){if(uMoonF[i]<0.5)continue;vec4 m=atmSkyMoon(d,i);if(m.a>0.0){bc=op>0.0?mix(bc,m.rgb,m.a):m.rgb;op=max(op,m.a);}}',
  ' if(op>0.0){float tm=dot(T,vec3(0.33));float hz=clamp(uHazeFloor*0.55+(1.0-tm)*0.6+0.35*exp(-max(d.y,0.0)/0.10)*uHazeFloor,0.0,0.94);',
  '  vec3 ob=mix(bc*T,air,hz);col=mix(col,ob,op);}',
  ' vec4 cl=atmSkyClouds(d,air);col=mix(col,cl.rgb,cl.a);',
  ' vec4 rd=atmSkyRidges(d,air);col=mix(col,rd.rgb,rd.a);',
  ' if(d.y<0.0)col=mix(col,uFogC,(1.0-smoothstep(-0.12,0.0,d.y))*(1.0-rd.a));',
  ' return col;}'].join('\n');};
 A.onInit.push(()=>{if(A.T.ShaderChunk)A.T.ShaderChunk.atmos_sky=A.skyGLSL();});
})();
