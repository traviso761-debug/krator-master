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
  'uniform vec3 uMoonDir[2],uMoonC[2];uniform float uMoonR[2];',
  'uniform vec4 uStar['+NS+'];uniform vec3 uStarC['+NS+'];',
  'uniform vec3 uGZone,uGBelt,uGStorm,uGRim,uGNight,uGRing;',
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
  'float atmSkyRingA(float rr){float t=(rr-'+f(G.ringIn)+')/'+f(G.ringOut-G.ringIn)+';if(t<0.0||t>1.0)return 0.0;',
  ' float a=0.62*(0.45+0.55*sin(t*34.0))*(1.0-smoothstep(0.86,1.0,t))*smoothstep(0.0,0.06,t);return a*(1.0-0.55*smoothstep(0.40,0.46,t)*(1.0-smoothstep(0.46,0.52,t)));}',
  'float atmSkyOval(float lat,float lon,vec4 s){float dl=lat-s.x;float dg=mod(lon-s.y+3.14159265,6.28318531)-3.14159265;return (dg*dg)/(s.z*s.z)+(dl*dl)/(s.w*s.w);}',
  // the giant toward d: rgb, and alpha (the disc's coverage); tG its hit distance (unit: the giant's distance)
  'vec4 atmSkyGiant(vec3 d,out float tG){vec3 c=uGiantDir;float r='+f(rg)+',b=dot(d,c),h=b*b-(1.0-r*r);tG=1e9;',
  ' float ang=acos(clamp(b,-1.0,1.0)),cov=1.0-smoothstep('+f(G.diaDeg/2*Math.PI/180)+'-uPixAng*1.2,'+f(G.diaDeg/2*Math.PI/180)+',ang);',
  ' if(b<='+f(cosG*.98)+'||cov<=0.0)return vec4(0.0);h=max(h,0.0);tG=b-sqrt(h);vec3 N=normalize((d*tG-c)/r);',
  ' vec3 e1=normalize(cross(uPole,c)),e2=cross(uPole,e1);float sl=clamp(dot(N,uPole),-1.0,1.0),lat=asin(sl),lon=atan(dot(N,e2),dot(N,e1))+uSpin;',
  ' float wv=0.42*sin(lon*3.0+lat*6.0)+0.24*sin(lon*7.0-2.1)+0.13*sin(lon*13.0+lat*3.0);',
  ' vec3 col=mix(uGZone,uGBelt,smoothstep(-0.45,0.45,sin(lat*10.0+wv)));col*=0.93+0.12*sin(lat*37.0+1.6*sin(lon*2.0+0.7));',
  ' col=mix(col,uGZone*0.70,smoothstep(0.70,1.0,abs(sl)));',
  ' col=mix(uGStorm,col,smoothstep(0.45,1.0,atmSkyOval(lat,lon,vec4(-0.36,1.10,0.40,0.13))));',
  ' col=mix(uGStorm*1.12,col,smoothstep(0.45,1.0,atmSkyOval(lat,lon,vec4(0.21,4.05,0.26,0.085))));',
  ' float ndv=clamp(dot(N,-d),0.0,1.0),limb=pow(max(ndv,0.0015),0.35),ndl=dot(N,uSunDir),day=smoothstep(-0.10,0.14,ndl);',
  // the ring's shadow on the disc: from the point toward the sun, across the ring plane
  ' float dn=dot(uSunDir,uRingN);if(abs(dn)>1e-4){float k=-dot(N,uRingN)/dn;if(k>0.0){vec3 q=N+uSunDir*k;day*=1.0-0.75*atmSkyRingA(length(q));}}',
  ' vec3 o=col*limb*(0.92*day*(1.0-uEclipse*0.0))+col*limb*uGNight*0.10;',
  ' o+=uGRim*pow(max(1.0-ndv,0.0),3.2)*0.16*mix(smoothstep(-0.35,0.45,ndl),1.0,0.15);',
  // the eclipse's main feature (21-sky.js): sunlight bent through the giant's air, a burning ring round the limb, brightest
  // on the side the sun is behind
  ' if(uEclipse>0.0){vec3 np=normalize(N-c*dot(N,c)+1e-5),sp=uSunDir-c*dot(uSunDir,c);float sk=length(sp)>1e-4?0.5+0.5*dot(np,normalize(sp)):1.0;',
  '  o+=vec3(1.0,0.70,0.42)*pow(max(1.0-ndv,0.0),6.0)*uEclipse*(0.6+1.6*sk*sk);}',
  ' return vec4(o,cov);}',
  'vec4 atmSkyRing(vec3 d,float tG,bool hitG){float dn=dot(d,uRingN);if(abs(dn)<1e-6)return vec4(0.0);float t=dot(uGiantDir,uRingN)/dn;if(t<=0.0)return vec4(0.0);',
  ' if(hitG&&t>tG)return vec4(0.0);',                    // the far half: behind the disc
  ' vec3 q=(d*t-uGiantDir)/'+f(rg)+';float rr=length(q),a=atmSkyRingA(rr);if(a<=0.0)return vec4(0.0);',
  ' float b=dot(q,uSunDir),h=b*b-(dot(q,q)-1.0);float lit=(h>0.0&&b<0.0)?0.12:1.0;',   // the giant's shadow across the ring
  ' vec3 c=uGRing*(0.8+0.3*sin((rr-1.3)*41.0))*(0.18+0.82*lit*(1.0-uEclipse));return vec4(c,a);}',
  // ---- 3 the moons
  'vec4 atmSkyMoon(vec3 d,int i){vec3 m=uMoonDir[i];float c=dot(d,m),r=uMoonR[i];float ang=acos(clamp(c,-1.0,1.0));if(ang>r+uPixAng)return vec4(0.0);',
  ' vec3 x=(d-m*c)/sin(r);float xx=min(dot(x,x),1.0);vec3 N=normalize(x-m*sqrt(1.0-xx));float l=max(dot(N,uSunDir),0.0);',
  ' vec3 col=uMoonC[i]*(l*1.05+0.015)+uShineC*uShineI*0.05;return vec4(col,1.0-smoothstep(r-uPixAng,r,ang));}',
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
  ' for(int i=0;i<2;i++){vec4 m=atmSkyMoon(d,i);if(m.a>0.0){bc=mix(bc,m.rgb,m.a);op=max(op,m.a);}}',
  ' float tG;vec4 g=atmSkyGiant(d,tG);if(g.a>0.0){bc=mix(bc,g.rgb,g.a);op=max(op,g.a);}',
  ' vec4 r=atmSkyRing(d,tG,g.a>0.5);if(r.a>0.0){bc=op>0.0?mix(bc,r.rgb,r.a):r.rgb;op=op>0.0?op:r.a;}',
  ' if(op>0.0){float tm=dot(T,vec3(0.33));float hz=clamp(uHazeFloor+(1.0-tm)*0.85+0.35*exp(-max(d.y,0.0)/0.10)*uHazeFloor,0.0,0.94);',
  '  vec3 ob=mix(bc*T,air,hz);col=mix(col,ob,op);}',
  ' vec4 cl=atmSkyClouds(d,air);col=mix(col,cl.rgb,cl.a);',
  ' vec4 rd=atmSkyRidges(d,air);col=mix(col,rd.rgb,rd.a);',
  ' if(d.y<0.0)col=mix(col,uFogC,(1.0-smoothstep(-0.12,0.0,d.y))*(1.0-rd.a));',
  ' return col;}'].join('\n');};
 A.onInit.push(()=>{if(A.T.ShaderChunk)A.T.ShaderChunk.atmos_sky=A.skyGLSL();});
})();
