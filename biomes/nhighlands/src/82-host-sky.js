// ================================================================= HOST — sky
// The Krator standard skybox for the NORTHERN HIGHLANDS (from the north-western
// lowlands', and through it the Hexahedron's): a baked dome (haze column,
// cumulus, the Inner Wall's peaks, the flank's receding ridges, the Outer Wall
// far over the lowlands), the sun and the stars drawn analytically on it, the
// gas giant as real geometry, the FAR COUNTRY as a coarse real mesh round the
// map, and the three light modes. Host-only: a biome never touches the sky.
//
// Draw order: dome (-10), giant (-9), ring (-8) all skip the depth buffer, so
// any real geometry -- the map, the far country -- stands in front of them. The
// painted dome only ever shows what lies BEYOND the far country's rim (35 km),
// which fades into the fog; the dome melts into the same fog colour at its foot.
const D2R=Math.PI/180;
const _dirAzAlt=(az,alt)=>new THREE.Vector3(Math.sin(az*D2R)*Math.cos(alt*D2R),Math.sin(alt*D2R),-Math.cos(az*D2R)*Math.cos(alt*D2R));

// ---------------------------------------------------------------- the fog
// The fog's shape lives here (r128 names the varying 'fogDepth', r136+ 'vFogDepth':
// the patch takes either). Not exponential-squared, which leaves the near forest
// crystal clear and walls off the distance: plain exponential out to 4 km, then the optical depth
// grows ever slower (to a 9 km ceiling), so the lowlands and the lake 20 km off
// still read through the haze instead of vanishing into it.
(function(){const C=THREE.ShaderChunk,dv=/vFogDepth/.test(C.fog_fragment)?'vFogDepth':'fogDepth';
 C.fog_fragment=C.fog_fragment.replace(/float fogFactor = 1\.0 - exp\( - fogDensity[^;]*;/,
  'float fogD='+dv+';fogD=fogD<4000.0?fogD:4000.0+5000.0*(1.0-exp(-(fogD-4000.0)/5000.0));\n\t\tfloat fogFactor = 1.0 - exp( - fogDensity * fogD );');})();

// ---------------------------------------------------------------- the dome
// One baked texture, 4096x1024, elevation -6..90 degrees (the sky below that is
// fog): 16 MB, no mipmaps. RGB is the DAY dome in display colour; ALPHA is a
// mask the shader grades the other modes with: a<.5 land (1-2a), a>.5 sky with
// cloud (2a-1). u = ((270-az)/360) mod 1, as the lowlands' dome maps it.
const SKY_EL0=-6,SKY_EL1=90;
const skyTex=(function(){const W=4096,H=1024,DEG=H/(SKY_EL1-SKY_EL0),HZ=SKY_EL1*DEG;
 const vn=BIO.fn.vnoise;
 let _s=90127;const R=()=>{_s=_s+0x6D2B79F5|0;let t=Math.imul(_s^_s>>>15,1|_s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};   // the sky's own stream: the biome's rng stays the biome's
 const RR=(a,b)=>a+(b-a)*R();
 const azU=u=>((270-u*360)%360+360)%360, dAz=(a,b)=>Math.abs(((a-b+540)%360)-180);
 const nzU=(u,f,sd,o)=>{const a=u*TAU,r=f/TAU;return fbm(Math.cos(a)*r+sd*7.1,Math.sin(a)*r-sd*3.7,sd,o);};   // periodic in u: no seam at the wrap
 const cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d');
 const cm=document.createElement('canvas');cm.width=W;cm.height=H;const gm=cm.getContext('2d');gm.fillStyle='#000';gm.fillRect(0,0,W,H);
 const yOf=el=>HZ-el*DEG;
 // --- the column: thinner and bluer than the lowlands' (we stand higher) ----
 const grd=g.createLinearGradient(0,0,0,H);
 [[90,'#5a7ba6'],[62,'#6a88ae'],[40,'#83a0bb'],[24,'#9bb2c3'],[13,'#acbfc8'],[6,'#b6c6ca'],[2,'#b6c5c5'],[0,'#b0bfbe'],[-6,'#a9b8b6']]
  .forEach(s=>grd.addColorStop((SKY_EL1-s[0])/(SKY_EL1-SKY_EL0),s[1]));
 g.fillStyle=grd;g.fillRect(0,0,W,H);
 const wrapE=(x,y,rx,ry,f,ma)=>{g.fillStyle=f;if(ma)gm.fillStyle='rgba(255,0,0,'+ma.toFixed(3)+')';for(let k=-1;k<=1;k++){
  g.beginPath();g.ellipse(x+k*W,y,rx,ry,0,0,TAU);g.fill();if(ma){gm.beginPath();gm.ellipse(x+k*W,y,rx,ry,0,0,TAU);gm.fill();}}};
 // soft blobs: a radial falloff, squashed to an ellipse, wrapped round u; the mask gets the same
 const softE=(x,y,rx,ry,rgb,a,ma)=>{for(const[c,col,m]of[[g,rgb,a],[gm,'255,0,0',ma]]){if(!m)continue;
  for(let k=-1;k<=1;k++){const cx=x+k*W;if(cx+rx<0||cx-rx>W)continue;c.save();c.translate(cx,y);c.scale(1,ry/rx);
   const gr=c.createRadialGradient(0,0,0,0,0,rx);gr.addColorStop(0,'rgba('+col+','+m.toFixed(3)+')');gr.addColorStop(.5,'rgba('+col+','+(m*.75).toFixed(3)+')');gr.addColorStop(1,'rgba('+col+',0)');
   c.fillStyle=gr;c.beginPath();c.arc(0,0,rx,0,TAU);c.fill();c.restore();}}};
 // --- cumulus: fewer, soft, irregular heaps with flat grey bases (clipped flat at
 // the condensation level), building over the range in the SE
 for(let ci=0;ci<56;ci++){const t=Math.pow(R(),1.6);let u=R();
  if(ci<16)u=((270-RR(100,170))/360+1)%1;                                   // the range makes its own weather
  const cy=yOf(3+t*48+(ci<16?11:0)),cx=u*W,cw=RR(60,150)*(.4+1.3*t+RR(0,.3)),ch=cw*RR(.28,.5),ca=(.35+.35*R())*(1-.3*t);
  for(const c of[g,gm]){c.save();c.beginPath();for(let k=-1;k<=1;k++)c.rect(cx+k*W-cw*1.6,cy-ch*3,cw*3.2,ch*3+2);c.clip();}
  const nP=12+Math.floor(R()*10);
  for(let p=0;p<nP;p++){const f=RR(-1,1),px=cx+f*cw*.85,k2=1-Math.abs(f)*.8,pr=ch*(.35+.65*k2)*RR(.6,1.15),py=cy-pr*RR(.1,.6)-ch*k2*RR(0,.5);
   softE(px,py+pr*.35,pr*1.5,pr*.75,'150,160,170',ca*.55,ca*.5);                           // the shaded underside
   softE(px+pr*.1,py-pr*.15,pr*1.3,pr*.95,'248,249,246',ca*RR(.5,.9),ca*.8);}               // the lit tops
  gm.restore();g.restore();}
 // --- stratus and veils: long thin soft sheets, low and high (the mountain air is wet)
 for(let i=0;i<70;i++){const lo=i<34,a=lo?.06+.08*R():.03+.05*R();
  softE(R()*W,yOf(lo?RR(2,14):RR(14,55)),RR(250,1000),lo?RR(5,14):RR(6,20),lo?'226,232,234':'240,245,246',a,a*.8);}
 // --- two small moons, clear of the giant (NE) and the range (SE) ----------
 [[200,34,40,'rgba(226,222,214,'],[250,21,28,'rgba(214,198,192,']].forEach(M=>{const mx=(270-M[0])/360*W,my=yOf(M[1]);
  wrapE(mx,my,M[2],M[2],M[3]+'.55)',.9);wrapE(mx-M[2]*.3,my-M[2]*.3,M[2]*.62,M[2]*.62,M[3]+'.28)',0);});
 // --- THE LAND, per pixel, far to near ---------------------------------------
 const img=g.getImageData(0,0,W,H),D=img.data,LAND=new Float32Array(W*H),c=[0,0,0];
 function layer(E,shade){for(let x=0;x<W;x++){const e=E[x];if(e<=SKY_EL0)continue;
  for(let y=Math.max(0,Math.floor(yOf(e))-1);y<H;y++){const el=(HZ-y-.5)/DEG,cov=clamp((e-el)*DEG+.5,0,1);if(cov<=0)continue;
   shade(x,y,el,e,c);const i=y*W+x,k=i*4;D[k]+=(c[0]-D[k])*cov;D[k+1]+=(c[1]-D[k+1])*cov;D[k+2]+=(c[2]-D[k+2])*cov;if(cov>LAND[i])LAND[i]=cov;}}}
 const E=()=>new Float32Array(W),U=x=>(x+.5)/W;
 // NW: the OUTER WALL, low, pale and far across the lowlands (a straight wall of
 // elevation e0 at azimuth az0 subtends atan(tan(e0)cos(az-az0)) elsewhere)
 const EO=E();for(let x=0;x<W;x++){const u=U(x),cs=Math.cos(dAz(azU(u),315)*D2R);EO[x]=cs<=0?-9:Math.atan(Math.tan(3.1*D2R)*cs)/D2R*(1+.24*(nzU(u,22,9,3)-.5))+(nzU(u,140,10,2)-.5)*.12;}
 layer(EO,(x,y,el,e,o)=>{const f=clamp((e-el)/Math.max(.5,e),0,1),st=.97+.06*vn(x*.01,el*4,7);
  o[0]=(148+30*f)*st;o[1]=(161+28*f)*st;o[2]=(171+22*f)*st;});
 // SE: the INNER WALL's crest, near and big: jagged massifs, snowfields above a
 // ragged snowline, the faces lit from the WNW sun (in u that is the face rising
 // toward +x) and the others in blue shadow, couloirs of rock, haze at the foot
 const EC=E(),SL=E();
 for(let x=0;x<W;x++){const u=U(x),d=dAz(azU(u),135),env=Math.exp(-(d/46)*(d/46));
  const n1=(nzU(u,7,1,3)-.5)*2,pk=Math.pow(Math.max(0,nzU(u,34,2,3)-.45)/.55,1.4),j=1-Math.abs(nzU(u,95,4,2)*2-1),j2=1-Math.abs(nzU(u,22,12,3)*2-1);
  EC[x]=env*(9.5+6*n1+7*pk+11*j2*j2+2.4*(j-.5))+(nzU(u,220,3,2)-.5)*.5*env-(1-env)*2;
  SL[x]=5.5+.34*EC[x]+3*(nzU(u,25,5,2)-.5)*2;}
 // the faces: a spine runs down from every summit (lit face on its -x side, shadow on
 // its +x side), a rock gully down from every notch between two summits, and the
 // silhouette's own small slopes break each face into smaller facets
 const PK=[],DOM=new Int32Array(W),SK=[],GX=[];
 for(let x=0;x<W;x++){const e=EC[x];if(e<2.5)continue;let m=true;for(let q=-16;q<=16&&m;q++)if(q&&EC[(x+q+W)%W]>=e&&!(q<0&&EC[(x+q+W)%W]===e))m=false;if(m){PK.push(x);SK.push(RR(-.55,.55));}}
 for(let i=0;i<PK.length;i++){const a=PK[i],b=i+1<PK.length?PK[i+1]:PK[0]+W;let v=a,ve=1e9;for(let x=a+1;x<b;x++){const e=EC[x%W];if(e<ve){ve=e;v=x;}}
  GX.push([v%W,ve,RR(-.4,.4)]);for(let x=a;x<=v;x++)DOM[x%W]=i;for(let x=v+1;x<b;x++)DOM[x%W]=(i+1)%PK.length;}
 const wd=d=>((d+W/2)%W+W)%W-W/2,slAt=(x,k)=>(EC[(x+k)%W]-EC[(x-k+W)%W])/(2*k)*(W/360);
 layer(EC,(x,y,el,e,o)=>{const dd=e-el;let lit=.6,rk=0;
  if(PK.length){const n=PK.length,gxOf=(i,el)=>{const G=GX[i];return G[0]+(G[1]-el)*DEG*G[2]+(vn(el*1.1,i*5.3,14)-.5)*6;};
   let i=DOM[x];const gr=gxOf(i,el),gl=gxOf((i-1+n)%n,el);                               // the gullies, not the notches' columns, part the faces
   if(wd(x-gr)>0&&el<GX[i][1])i=(i+1)%n;else if(wd(x-gl)<0&&el<GX[(i-1+n)%n][1])i=(i-1+n)%n;
   const xp=PK[i],sp=xp+(EC[xp]-el)*DEG*SK[i]+(vn(el*.9,i*3.1,13)-.5)*10*smooth(0,3,EC[xp]-el);
   lit=smooth(2,-2,wd(x-sp));
   const g1=gxOf(i,el),g0=gxOf((i-1+n)%n,el);
   if(el<GX[i][1]-.15)rk=smooth(1.5+dd*.5,.5,Math.abs(wd(x-g1)));
   if(el<GX[(i-1+n)%n][1]-.15)rk=Math.max(rk,smooth(1.5+dd*.5,.5,Math.abs(wd(x-g0))));}
  const ls=slAt(x,2+Math.min(12,dd*DEG*.3|0));lit=clamp(lit*.75+.25*smooth(-.3,.3,ls)+(vn(x*.05,y*.07,7)-.5)*.3,0,1);
  let sn=smooth(SL[x]-.3,SL[x]+.3,el+(vn(x*.09,y*.12,8)-.5)*1.8)*(1-smooth(2.4,3.6,Math.abs(ls)))*(1-.85*rk);
  sn*=1-.7*smooth(.7,.76,vn(x*.6,y*.022,9))*smooth(.2,.8,dd);                              // a few rock bands and buttresses
  const tx=.9+.12*vn(x*.12,y*.2,9);
  let r=mix(78,128,lit)*tx,gg=mix(90,130,lit)*tx,b=mix(118,136,lit)*tx;                     // rock: blue in shadow
  const sb=1-.07*smooth(0,4,dd);
  r=mix(r,mix(124,240*sb,lit),sn);gg=mix(gg,mix(144,242*sb,lit),sn);b=mix(b,mix(186,246*sb,lit),sn); // snow: blue in shadow
  if(dd<.12&&lit>.5){r*=1.05;gg*=1.05;b*=1.04;}                                              // the lit crest
  const fo=smooth(5,2,el);r=mix(r,92,fo);gg=mix(gg,108,fo);b=mix(b,116,fo);                // forest on the lower slopes, blue with distance
  const hz=.14+.6*smooth(SL[x]+.6,SL[x]-3.5,el);o[0]=mix(r,186,hz);o[1]=mix(gg,198,hz);o[2]=mix(b,206,hz);});
 // NE and SW: the flank's own spurs, receding in misty layers, each farther one
 // paler, the near ones fringed with spire conifers. Open toward the NW; none
 // in front of the range in the SE, where the far country's real slopes stand.
 [{h:6.6,f:10,sd:21,top:[124,143,154],tr:.10},{h:4.6,f:16,sd:22,top:[98,120,126],tr:.17},{h:3.0,f:24,sd:23,top:[70,93,92],tr:.25}].forEach((Ly,li)=>{
  const EL=E(),TR=E();
  for(let x=0;x<W;x++){const u=U(x),az=azU(u),wv=smooth(55,100,dAz(az,315))*smooth(35,75,dAz(az,135)),tr=.75+.35*Math.cos(dAz(az,135)*D2R);
   const rd=1-Math.abs(nzU(u,Ly.f,Ly.sd,3)*2-1);EL[x]=wv<=0?-9:wv*Ly.h*tr*(.4+.75*rd+.25*(nzU(u,Ly.f*4,Ly.sd+5,2)-.5))-(1-wv)*2;}
  if(Ly.tr){for(let x=0;x<W;){const hh=RR(.35,1)*Ly.tr,hw=Math.max(1.2,hh*DEG*.42);
   for(let q=-Math.ceil(hw);q<=Math.ceil(hw);q++){const xx=(x+q+W)%W,v=hh*(1-Math.abs(q)/hw);if(v>TR[xx])TR[xx]=v;}x+=Math.max(2,Math.round(RR(1.6,3.2)*hw));}
   for(let x=0;x<W;x++)if(EL[x]>0)EL[x]+=TR[x]*smooth(0,1.5,EL[x]);}
  const T=Ly.top;
  layer(EL,(x,y,el,e,o)=>{const m=smooth(e-.6-li*.2,e-2.6,el)*.8,st=.93+.09*vn(x*.3,y*.3,11+li);
   o[0]=mix(T[0]*st,196,m);o[1]=mix(T[1]*st,207,m);o[2]=mix(T[2]*st,210,m);});});
 g.putImageData(img,0,0);
 // --- mist wisps hanging on the range and in the flank's valleys ----------
 for(let i=0;i<120;i++){const az=R()<.6?RR(95,175):RR(20,250),u=((270-az)/360+1)%1,el=RR(1,R()<.5?6:12);
  softE(u*W,yOf(el),RR(80,300),RR(5,14),'226,233,236',.07+.1*R(),0);}
 // --- pack: RGB the day dome, A the land/cloud mask ---------------------------
 const F=g.getImageData(0,0,W,H).data,M=gm.getImageData(0,0,W,H).data,out=new Uint8Array(W*H*4);
 for(let i=0;i<W*H;i++){const k=i*4,L=LAND[i];out[k]=F[k];out[k+1]=F[k+1];out[k+2]=F[k+2];
  out[k+3]=Math.round(255*(L>.004?.5*(1-L):.5+.5*Math.min(1,M[k]/255)));}
 const t=new THREE.DataTexture(out,W,H,THREE.RGBAFormat);
 t.wrapS=THREE.RepeatWrapping;t.wrapT=THREE.ClampToEdgeWrapping;t.magFilter=t.minFilter=THREE.LinearFilter;t.generateMipmaps=false;t.needsUpdate=true;
 return t;})();

// the giant first: the dome glows round it at night
const GIANT_ALT=30,GIANT_AZ=66;   // canon NE; raised from 25 so the disc (and the ring's low end) clear the range's NE shoulder
const giantDir=_dirAzAlt(GIANT_AZ,GIANT_ALT).normalize();
// The dome shader: the baked day colour, regraded for dawn and night by the mask;
// the sun disc and glow and the stars drawn here, so one texture serves all
// three modes. Output is display colour (no tone mapping), like the giant.
const SKYU={uTex:{value:skyTex},uFogC:{value:scene.fog.color},uSunDir:{value:new THREE.Vector3().copy(sun.position).normalize()},
 uSunC:{value:new THREE.Color(1,.95,.84)},uGlow:{value:new THREE.Vector3(.45,180,.16)},uSunK:{value:1},uDawn:{value:0},uNight:{value:0},uGDir:{value:giantDir}};
const sky=new THREE.Mesh(new THREE.SphereGeometry(9000,48,24),new THREE.ShaderMaterial({uniforms:SKYU,side:THREE.BackSide,fog:false,depthWrite:false,toneMapped:false,
 vertexShader:'varying vec3 vDir;void main(){vDir=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
 fragmentShader:[
  'uniform sampler2D uTex;uniform vec3 uFogC,uSunDir,uSunC,uGlow,uGDir;uniform float uSunK,uDawn,uNight;varying vec3 vDir;',
  'float hs(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,37.719)))*43758.5453);}',
  'void main(){vec3 d=normalize(vDir);',
  ' float el=degrees(asin(clamp(d.y,-1.0,1.0))),az=degrees(atan(d.x,-d.z));',
  ' vec4 t=texture2D(uTex,vec2(fract((270.0-az)/360.0),clamp(('+SKY_EL1.toFixed(1)+'-el)/'+(SKY_EL1-SKY_EL0).toFixed(1)+',0.0,1.0)));',
  ' float land=clamp(1.0-2.0*t.a,0.0,1.0),cloud=clamp(2.0*t.a-1.0,0.0,1.0);',
  ' vec3 c=t.rgb;float lum=dot(c,vec3(0.3,0.5,0.2));',
  // DAWN: cool slate overhead, amber low and toward the sun; clouds lit gold underneath; the range in alpenglow, its shadows violet
  ' vec3 hd=normalize(vec3(d.x,0.0,d.z)+1e-5),hsn=normalize(vec3(uSunDir.x,0.0,uSunDir.z)+1e-5);',
  ' float side=max(dot(hd,hsn),0.0),low=exp(-max(el,0.0)/11.0);',
  ' vec3 dsk=mix(c*vec3(0.62,0.64,0.80),vec3(0.96,0.72,0.46),clamp(low*(0.42+0.58*side*side),0.0,1.0));',
  ' vec3 dcl=mix(dsk,lum*vec3(1.02,0.80,0.70)+vec3(0.04,0.02,0.04),0.85);',
  ' vec3 dln=mix(lum*vec3(0.60,0.57,0.68),lum*vec3(1.08,0.76,0.66),smoothstep(0.6,0.88,lum));',
  ' vec3 cDawn=mix(mix(dsk,dcl,cloud),dln,land);',
  // NIGHT: deep blue, stars, the giant's glow, clouds and snow faint in giantshine
  ' float gs=max(dot(d,uGDir),0.0);',
  ' vec3 nsk=mix(vec3(0.052,0.070,0.105),vec3(0.012,0.020,0.045),sqrt(clamp(el/90.0,0.0,1.0)))+vec3(0.10,0.13,0.16)*pow(gs,18.0)+vec3(0.03,0.04,0.05)*pow(gs,4.0);',
  ' vec3 sp=d*230.0,ci=floor(sp);vec3 of=vec3(hs(ci+3.1),hs(ci+7.7),hs(ci+1.3))*0.6+0.2;',
  ' float st=step(0.972,hs(ci))*smoothstep(0.24,0.0,length(fract(sp)-of))*(0.35+0.65*hs(ci+9.0))*smoothstep(1.0,8.0,el);',
  ' nsk+=vec3(0.9,0.93,1.0)*st*(1.0-cloud);',
  ' vec3 ncl=lum*vec3(0.09,0.11,0.15);',
  ' vec3 nln=lum*vec3(0.05,0.065,0.095)+smoothstep(0.72,0.92,lum)*vec3(0.05,0.065,0.085);',
  ' vec3 cNight=mix(mix(nsk,ncl,cloud),nln,land);',
  ' vec3 col=mix(mix(c,cDawn,uDawn),cNight,uNight);',
  // the sun: disc, glow, and a broad bloom (behind the painted land, only the bloom)
  ' float cs=max(dot(d,uSunDir),0.0);',
  ' col+=uSunK*uSunC*(smoothstep(0.99982,0.99991,cs)*2.0*(1.0-land)+uGlow.x*pow(cs,uGlow.y)+uGlow.z*pow(cs,6.0)*(1.0-0.6*land));',
  // the foot of the dome melts into the fog the far country fades into (higher under the range, whose foot the far slopes hide)
  ' float dse=abs(mod(az-135.0+540.0,360.0)-180.0),hzt=1.4+5.0*exp(-dse*dse/1444.0);',
  ' col=mix(col,uFogC,smoothstep(hzt,-0.8,el));',
  // dither (+-half a step of 8 bits): the long smooth gradients round the sun would band otherwise
  ' col+=(hs(vec3(gl_FragCoord.xy,uSunK))+hs(vec3(gl_FragCoord.yx*1.37,2.0))-1.0)/255.0;',
  ' gl_FragColor=vec4(col,1.0);}'].join('\n')}));
sky.userData.probeSkip=true;sky.renderOrder=-10;sky.frustumCulled=false;scene.add(sky);

// ---------------------------------------------------------------- the gas giant
// Ported from the lowlands' sky (and Girder's before it): real geometry, bands
// computed in the fragment shader against a world-space spin axis lying in the
// plane of the sky, tilted 23 degrees, so the rings are seen as a hairline.
// Canon: 30 degrees across, azimuth 66 (here at altitude 30, see above).
const GIANT_DIST=6000,GIANT_R=GIANT_DIST*Math.tan(15*D2R);
const _gE1=new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0),giantDir).normalize();
const _gUp=new THREE.Vector3().crossVectors(giantDir,_gE1).normalize();
const GIANT_AXIS=_gUp.clone().multiplyScalar(Math.cos(23*D2R)).addScaledVector(_gE1,Math.sin(23*D2R)).normalize();
const GIANT_B1=new THREE.Vector3().crossVectors(GIANT_AXIS,giantDir).normalize();
const GIANT_B2=new THREE.Vector3().crossVectors(GIANT_AXIS,GIANT_B1).normalize();
const GU={
 uSunDir:{value:new THREE.Vector3().copy(sun.position).normalize()},
 uAxis:{value:GIANT_AXIS},uE1:{value:GIANT_B1},uE2:{value:GIANT_B2},
 uZone:{value:new THREE.Color(0x3c7e91)},uBelt:{value:new THREE.Color(0xd6c9a8)},
 uStormC:{value:new THREE.Color(0xb98a63)},uRimCol:{value:new THREE.Color(0x9fd4ea)},
 uNightC:{value:new THREE.Color(0x4b6f86)},uHazeC:{value:new THREE.Color(0x9fb2c0)},
 uSpin:{value:0},uRingLat:{value:.08},uHazeK:{value:.34},uHazeF:{value:.30},uTint:{value:new THREE.Color(1,1,1)}};
const giantMat=new THREE.ShaderMaterial({fog:false,depthWrite:false,uniforms:GU,
 vertexShader:[
  'varying vec3 vN; varying vec3 vV; varying vec3 vSky;',
  'void main(){vec4 wp=modelMatrix*vec4(position,1.0);',
  ' vN=normalize(mat3(modelMatrix)*normal);',
  ' vV=normalize(cameraPosition-wp.xyz);',
  ' vSky=normalize(wp.xyz-cameraPosition);',
  ' gl_Position=projectionMatrix*viewMatrix*wp;}'].join('\n'),
 fragmentShader:[
  'uniform vec3 uSunDir,uAxis,uE1,uE2,uZone,uBelt,uStormC,uRimCol,uNightC,uHazeC,uTint;',
  'uniform float uSpin,uRingLat,uHazeK,uHazeF;',
  'varying vec3 vN; varying vec3 vV; varying vec3 vSky;',
  'float oval(float lat,float lon,vec4 s){float dl=lat-s.x;',
  ' float dg=mod(lon-s.y+3.14159265,6.28318531)-3.14159265;',
  ' return (dg*dg)/(s.z*s.z)+(dl*dl)/(s.w*s.w);}',
  'void main(){vec3 N=normalize(vN),V=normalize(vV);',
  ' float sLat=clamp(dot(N,uAxis),-1.0,1.0), lat=asin(sLat);',
  ' float lon=atan(dot(N,uE2),dot(N,uE1))+uSpin;',
  ' float wav=0.42*sin(lon*3.0+lat*6.0)+0.24*sin(lon*7.0-2.1)+0.13*sin(lon*13.0+lat*3.0);',
  ' float b=sin(lat*10.0+wav);',
  ' vec3 col=mix(uZone,uBelt,smoothstep(-0.45,0.45,b));',
  ' col*=0.93+0.12*sin(lat*37.0+1.6*sin(lon*2.0+0.7));',
  ' col=mix(col,uZone*0.70,smoothstep(0.70,1.0,abs(sLat)));',
  ' col=mix(uStormC,col,smoothstep(0.45,1.0,oval(lat,lon,vec4(-0.36,1.10,0.40,0.13))));',
  ' col=mix(uStormC*1.12,col,smoothstep(0.45,1.0,oval(lat,lon,vec4(0.21,4.05,0.26,0.085))));',
  ' col*=1.0-0.34*(1.0-smoothstep(0.0,0.075,abs(lat-uRingLat)));',
  ' float ndv=clamp(dot(N,V),0.0,1.0);',            // clamp, not max: pow() of a negative base is undefined
  ' float limb=pow(max(ndv,0.0015),0.35);',
  ' float ndl=dot(N,uSunDir);',
  ' float day=smoothstep(-0.17,0.17,ndl);',
  ' vec3 outc=col*limb*(0.92*day)+col*limb*uNightC*0.11;',
  ' float fres=pow(max(1.0-ndv,0.0),3.2);',
  ' outc+=uRimCol*fres*0.16*mix(smoothstep(-0.35,0.45,ndl),1.0,0.15);',
  // extinction, deeper toward the lower limb, over a floor (the mode sets both: thin at night)
  ' float up=max(vSky.y,0.0);',
  ' outc=mix(outc*uTint,uHazeC,clamp(uHazeF+uHazeK*exp(-up/0.16),0.0,0.86));',
  ' gl_FragColor=vec4(outc,1.0);}'].join('\n')});
const giant=new THREE.Mesh(new THREE.SphereGeometry(GIANT_R,96,64),giantMat);
giant.renderOrder=-9;giant.userData.probeSkip=true;giant.frustumCulled=false;scene.add(giant);
// the rings, edge-on. Blended but NOT in the transparent pass (that would draw
// them after, and so over, the far country): custom blending keeps them opaque-
// listed at renderOrder -8, ahead of everything real.
const RINGU={uGC:{value:giant.position},uGR:{value:GIANT_R},uIn:{value:1.30},uOut:{value:2.12},uCol:{value:new THREE.Color(0xbcb09a)},uHazeC:GU.uHazeC,uHazeK:GU.uHazeK,uHazeF:{value:.26},uTint:GU.uTint};
const ringMat=new THREE.ShaderMaterial({fog:false,transparent:false,depthWrite:false,side:THREE.DoubleSide,uniforms:RINGU,
 blending:THREE.CustomBlending,blendEquation:THREE.AddEquation,blendSrc:THREE.SrcAlphaFactor,blendDst:THREE.OneMinusSrcAlphaFactor,
 vertexShader:['varying vec2 vUvR; varying vec3 vSky; varying vec3 vWP;',
  'void main(){vUvR=position.xy/'+GIANT_R.toFixed(1)+';vec4 wp=modelMatrix*vec4(position,1.0);vWP=wp.xyz;',
  ' vSky=normalize(wp.xyz-cameraPosition);',
  ' gl_Position=projectionMatrix*viewMatrix*wp;}'].join('\n'),
 fragmentShader:['uniform float uIn,uOut,uHazeK,uHazeF,uGR;uniform vec3 uCol,uHazeC,uTint,uGC;',
  'varying vec2 vUvR; varying vec3 vSky; varying vec3 vWP;',
  // the far half of the ring goes behind the planet (nothing writes depth up here)
  'bool behind(){vec3 rd=normalize(vWP-cameraPosition),oc=cameraPosition-uGC;float b=dot(oc,rd),h=b*b-dot(oc,oc)+uGR*uGR;return h>0.0&&length(vWP-cameraPosition)>-b-sqrt(h);}',
  'void main(){float r=length(vUvR)/'+GIANT_R.toFixed(2)+';',
  ' float t=(r-uIn)/(uOut-uIn);',
  ' if(t<0.0||t>1.0||behind())discard;',
  ' float a=0.62*(0.45+0.55*sin(t*34.0))*(1.0-smoothstep(0.86,1.0,t));',
  ' a*=smoothstep(0.0,0.06,t);',
  ' a*=1.0-0.55*smoothstep(0.40,0.46,t)*(1.0-smoothstep(0.46,0.52,t));',
  ' vec3 c=uCol*uTint*(0.8+0.3*sin(t*21.0));',
  ' float up=max(vSky.y,0.0);',
  ' c=mix(c,uHazeC,clamp(uHazeF+uHazeK*exp(-up/0.16),0.0,0.86));',
  ' gl_FragColor=vec4(c,a);}'].join('\n')});
const giantRing=new THREE.Mesh(new THREE.RingGeometry(GIANT_R*1.30,GIANT_R*2.12,256,1),ringMat);
giantRing.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),GIANT_AXIS.clone().multiplyScalar(Math.cos(1.6*D2R)).addScaledVector(giantDir,-Math.sin(1.6*D2R)).normalize());   // opened 1.6 degrees: a fine ellipse, not a vanishing line
giantRing.renderOrder=-8;giantRing.userData.probeSkip=true;giantRing.frustumCulled=false;scene.add(giantRing);
tick(function(dt){GU.uSpin.value+=dt*0.006;});

// ---------------------------------------------------------------- the far country
// A coarse vertex-coloured skirt from the map's square edge out to 35 km. The
// grid lines are 110 m apart inside +-8250 (so +-3300 falls on them) and widen
// by 6% a line beyond. Inside the square the vertices sit 25 m under terrainH
// (the ground's apron hides the rest); on the edge they ARE terrainH; outside,
// farH continues the flank and is pulled onto the edge within 1.5 km.
//   along the axis (NE, SW)  the same ramp, ridges, scarps and swells, on and on
//   NW (down-axis)           off the foothills onto the lowland plain at -330 m
//                            within ~5 km, low hills, groves, the jade lake
//   SE (up-axis)             the Inner Wall's lower slopes: 2700 m by 13 km,
//                            ridges growing, forest giving way to rock and snow
const FAR=(function(){
 const RIN=TERR.X1,CELL=110,IN2=8250,ROUT=35000,SINK=25;
 const farRamp=s=>s<=-4900?-330*smooth(-4900,-9800,s):s>=4900?1400+1300*smooth(4900,13000,s)+600*smooth(13000,30000,s):rampH(s);
 // the lake: an irregular lobe along the axis, 12-28 km out to the NW; rho<1 is water
 const LK={s:-20000,t:1200,a:8000,b:5000,lev:-355};
 const rimOf=th=>1+.32*(fbm(Math.cos(th)*1.6+4,Math.sin(th)*1.6,91,3)-.5)+.14*(fbm(Math.cos(th)*5+1,Math.sin(th)*5,92,2)-.5);
 const lakeRho=(x,z)=>{const s=(sOf(x,z)-LK.s)/LK.a,t=(tOf(x,z)-LK.t)/LK.b;return Math.hypot(s,t)/rimOf(Math.atan2(t,s));};
 function farH(x,z){const s=sOf(x,z),t=tOf(x,z);
  const k=(1-.5*smooth(-5500,-9500,s))*(1-.45*smooth(9000,20000,Math.max(Math.abs(x),Math.abs(z))));   // the plain is gentler than the flank; far off, the cells are coarse and the grain would alias
  let h=farRamp(s)+k*(baseH(x,z)-rampH(s));
  if(s>4900){const ue=Math.min(2.3,(s+4900)/9800)-1,w=fbm(x*.0007+3,z*.0007-2,61,2)*900;   // the range's spurs grow on
   const rn=1-Math.abs(fbm(t*.0005+w*.0004,s*.00018,66,3)*2-1);
   h+=200*ue*(rn-.55)*1.7+320*ue*(fbm(x*.0003+2,z*.0003,65,3)-.5);}
  if(s<-9000){const rho=lakeRho(x,z);
   if(rho<1.4){const hl=LK.lev+70*(rho-1)-60*smooth(.99,.8,rho)-50*smooth(.8,.3,rho);   /* a shelf, then the deep */h=mix(hl,Math.max(h,LK.lev+12),smooth(1.06,1.4,rho));}}
  return h;}
 const lines=[];for(let i=0;i<=2*IN2/CELL;i++)lines.push(-IN2+i*CELL);
 const out=[];for(let v=IN2,st=CELL;v<ROUT;){st*=1.06;v=Math.min(ROUT,v+st);out.push(v);}
 const GL=[...out.map(a=>-a).reverse(),...lines,...out],N=GL.length;
 const P=new Float32Array(N*N*3),Hh=new Float32Array(N*N);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=GL[i],z=GL[j],k=j*N+i;let h;
  if(Math.abs(x)<=RIN&&Math.abs(z)<=RIN)h=terrainH(x,z)-(Math.abs(x)===RIN||Math.abs(z)===RIN?0:SINK);
  else{const xb=clamp(x,-RIN,RIN),zb=clamp(z,-RIN,RIN),dO=Math.hypot(x-xb,z-zb);h=farH(x,z);
   if(dO<1500)h+=(terrainH(xb,zb)-farH(xb,zb))*smooth(1500,0,dO);}
  Hh[k]=h;P[k*3]=x;P[k*3+1]=h;P[k*3+2]=z;}
 // colour: dark conifer on the flank (temperate low, boreal high), the crowns in
 // blotches; the lowlands gold-green with darker groves; rock and snow up the
 // range; sand round the lake; bluer with distance
 const L=a=>a.map(v=>Math.pow(v/255,2.2));
 const C={temp:L([42,68,38]),bor:L([32,58,50]),crL:L([66,94,48]),crD:L([22,38,26]),fh:L([52,80,40]),
  mea:L([116,136,70]),mea2:L([100,126,60]),grove:L([58,88,44]),rock:L([92,98,110]),snow:L([232,236,242]),sand:L([184,174,136]),bed:L([96,140,120]),far:L([118,138,150])};
 const mixC=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
 const COL=new Float32Array(N*N*3),DET=new Float32Array(N*N),UV=new Float32Array(N*N*2);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const k=j*N+i,x=GL[i],z=GL[j],h=Hh[k],r=Math.hypot(x,z);
  const i0=Math.max(0,i-1),i1=Math.min(N-1,i+1),j0=Math.max(0,j-1),j1=Math.min(N-1,j+1);
  const slope=Math.hypot((Hh[j*N+i1]-Hh[j*N+i0])/(GL[i1]-GL[i0]),(Hh[j1*N+i]-Hh[j0*N+i])/(GL[j1]-GL[j0]));
  const n1=fbm(x*.0031+1,z*.0031-2,96,2),n2=fbm(x*.011,z*.011,97,2);
  let c=mixC(C.temp,C.bor,smooth(450,1150,h));
  c=mixC(c,n1>.5?C.crL:C.crD,Math.min(1,Math.abs(n1-.5)*3.2));
  c=mixC(c,C.fh,smooth(150,-60,h)*.5);                                    // the foothills' broadleaf old growth
  const low=smooth(-80,-230,h);
  if(low>0){const gv=smooth(.40,.56,fbm(x*.0011+5,z*.0011,98,3));let lc=mixC(mixC(C.mea,C.mea2,n2),C.grove,gv);c=mixC(c,lc,low);}
  const rock=Math.max(smooth(1950,2350,h+200*(n1-.5)),smooth(.6,1.0,slope)*smooth(300,900,h));c=mixC(c,C.rock,rock);
  const snow=smooth(2500,2800,h+300*(fbm(x*.0016,z*.0016,99,3)-.5)*2)*(1-smooth(.6,1.0,slope));c=mixC(c,C.snow,snow);
  let wet=0;if(h<-300){const rho=lakeRho(x,z);if(rho<1.25){c=mixC(c,C.sand,.6*smooth(1.07,1.0,rho));if(rho<1){c=mixC(c,C.bed,smooth(1,.9,rho));wet=1;}}}
  c=mixC(c,C.far,.3*smooth(5000,26000,r));
  COL[k*3]=c[0];COL[k*3+1]=c[1];COL[k*3+2]=c[2];
  DET[k]=wet?0:(1-.55*low)*(1-.75*snow)*(1-.4*rock);UV[k*2]=x/170;UV[k*2+1]=z/170;}
 const idx=[];const rr2=(ROUT-500)*(ROUT-500);
 for(let j=0;j<N-1;j++)for(let i=0;i<N-1;i++){const a=j*N+i,b=a+1,c2=a+N,d=c2+1;
  const mr=Math.min(...[[i,j],[i+1,j],[i,j+1],[i+1,j+1]].map(q=>GL[q[0]]*GL[q[0]]+GL[q[1]]*GL[q[1]]));if(mr>rr2)continue;
  idx.push(a,c2,b,b,c2,d);}
 const geo=new THREE.BufferGeometry();
 geo.setAttribute('position',new THREE.BufferAttribute(P,3));geo.setAttribute('color',new THREE.BufferAttribute(COL,3));
 geo.setAttribute('aDet',new THREE.BufferAttribute(DET,1));geo.setAttribute('uv',new THREE.BufferAttribute(UV,2));
 geo.setIndex(idx);geo.computeVertexNormals();
 // the canopy grain: crowns and gaps, multiplied in by aDet (none on water, little on snow)
 let _q=4471;const Q=()=>{_q=(_q*16807)%2147483647;return _q/2147483647;};
 const det=BIO.canvasTex(256,256,(g,w,h)=>{g.fillStyle='rgb(236,236,236)';g.fillRect(0,0,w,h);
  for(let i=0;i<900;i++){const x=Q()*w,y=Q()*h,r=2+Q()*7,dk=Q()<.6;
   g.fillStyle=dk?'rgba(70,70,70,'+(.18+Q()*.3).toFixed(2)+')':'rgba(255,255,255,'+(.2+Q()*.3).toFixed(2)+')';
   for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){g.beginPath();g.arc(x+a*w,y+b*h,r,0,TAU);g.fill();}}});
 det.encoding=THREE.LinearEncoding;det.generateMipmaps=true;det.minFilter=THREE.LinearMipmapLinearFilter;
 // fade to the fog colour by 33.5 km (the dome below the horizon is that colour)
 // and the fog thins up the range's slopes (their snow stands above the valley haze)
 const fade=(m,useDet)=>{m.onBeforeCompile=sh=>{
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying float vFarR,vFarY;'+(useDet?'\nattribute float aDet;\nvarying float vDet;':''))
   .replace('#include <begin_vertex>','#include <begin_vertex>\nvec4 fwp=modelMatrix*vec4(transformed,1.0);vFarR=length(fwp.xz);vFarY=fwp.y;'+(useDet?'vDet=aDet;':''));
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying float vFarR,vFarY;'+(useDet?'\nvarying float vDet;':''))
   .replace('#include <fog_fragment>',THREE.ShaderChunk.fog_fragment.replace(/float fogFactor = ([^;]*);/,'float fogFactor = ($1)*mix(1.0,0.55,smoothstep(1600.0,3200.0,vFarY));fogFactor=max(fogFactor,smoothstep(24000.0,33500.0,vFarR));'));
  if(useDet)sh.fragmentShader=sh.fragmentShader.replace('#include <map_fragment>','#ifdef USE_MAP\n vec4 texelColor=texture2D(map,vUv);\n diffuseColor.rgb*=mix(vec3(1.0),texelColor.rgb*1.12,vDet);\n#endif');};};
 const mat=new THREE.MeshLambertMaterial({vertexColors:true,map:det});fade(mat,true);
 const mesh=new THREE.Mesh(geo,mat);mesh.userData.probeSkip=true;mesh.userData.inspectLabel='Distant country';mesh.frustumCulled=false;scene.add(mesh);
 // the lake: a flat polar mesh at -355 m, reaching a little past the shore so the
 // banks bury its edge (pushed back in depth so they win the near-ties at 20 km)
 const NT=192,RHO=[0,.25,.5,.7,.85,.95,1,1.06,1.12],lp=[],lc=[],li=[];
 const jd=L([34,104,96]),je=L([60,118,106]);
 for(let q=0;q<RHO.length;q++)for(let a=0;a<NT;a++){const th=a/NT*TAU,rm=rimOf(th)*RHO[q],s=LK.s+LK.a*rm*Math.cos(th),t=LK.t+LK.b*rm*Math.sin(th),p=xzOf(s,t);
  lp.push(p[0],LK.lev,p[1]);const cc=mixC(jd,je,smooth(.55,1,RHO[q]));lc.push(cc[0],cc[1],cc[2]);}
 for(let q=0;q<RHO.length-1;q++)for(let a=0;a<NT;a++){const a1=(a+1)%NT,i0=q*NT+a,i1=q*NT+a1,i2=(q+1)*NT+a,i3=(q+1)*NT+a1;li.push(i0,i1,i2,i1,i3,i2);}
 const lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.Float32BufferAttribute(lp,3));lg.setAttribute('color',new THREE.Float32BufferAttribute(lc,3));
 lg.setIndex(li);lg.computeVertexNormals();
 if(lg.attributes.normal.getY(NT)<0){for(let i=0;i<li.length;i+=3){const q=li[i+1];li[i+1]=li[i+2];li[i+2]=q;}lg.setIndex(li);lg.computeVertexNormals();}   // (s,t)->(x,z) is a mirror: face it up
 const lmat=new THREE.MeshPhongMaterial({vertexColors:true,specular:0x26302e,shininess:140,polygonOffset:true,polygonOffsetFactor:0,polygonOffsetUnits:2});fade(lmat,false);
 const lake=new THREE.Mesh(lg,lmat);lake.userData.probeSkip=true;lake.userData.inspectLabel='Distant country · the lowland lake';lake.frustumCulled=false;scene.add(lake);
 return{mesh,lake,mat,lmat,H:farH,lakeRho,LAKE:LK,tris:idx.length/3+li.length/3};})();

// ---------------------------------------------------------------- light modes
// setLightMode('day'|'dawn'|'night') sets the lights, the fog, the exposure, the
// dome, the giant and the far country, tells the foliage shader where the key
// light is, then calls every LIGHT_HOOKS fn(mode) (the biome's glow, the host's
// water and mist). DAY is whatever the stage set; DAWN is a low warm sun out of
// the WNW (backlit amber fog through the trunks); NIGHT is giantshine, cool and
// dim, from the giant in the NE.
var LIGHT_HOOKS=window.LIGHT_HOOKS||[];
var LIGHT_MODE='day';
const LIGHT_MODES=(function(){const C=v=>new THREE.Color(v);
 const day={key:sun.position.clone(),sunC:sun.color.clone(),sunI:sun.intensity,hemiS:hemi.color.clone(),hemiG:hemi.groundColor.clone(),hemiI:hemi.intensity,
  fillC:fill.color.clone(),fillI:fill.intensity,fogC:scene.fog.color.clone(),fogD:scene.fog.density,exp:renderer.toneMappingExposure,
  dome:{dawn:0,night:0,sunK:1,sunC:[1,.95,.84],glow:[.45,180,.16]},
  gi:{sun:sun.position.clone().normalize(),haze:C(0x9fb2c0),hF:.30,hK:.34,tint:[1,1,1]},far:[1,1,1]};
 const dk=_dirAzAlt(291,7.5);
 const dawn={key:dk.clone().multiplyScalar(1600),sunC:C(0xffb066),sunI:1.6,hemiS:C(0xb49c88),hemiG:C(0x2c2a22),hemiI:.40,fillC:C(0x6f7fa8),fillI:.14,
  fogC:C(0xb48b5c),fogD:.00021,exp:1.02,
  dome:{dawn:1,night:0,sunK:1,sunC:[1,.78,.50],glow:[.30,90,.14]},
  gi:{sun:dk.clone(),haze:C(0xc4a088),hF:.26,hK:.40,tint:[1.10,.92,.80]},far:[1,.93,.86]};
 const night={key:giantDir.clone().multiplyScalar(1600),sunC:C(0x9cbad6),sunI:.36,hemiS:C(0x34465a),hemiG:C(0x0a0d10),hemiI:.38,fillC:C(0x3a4a62),fillI:.05,
  fogC:C(0x161e2a),fogD:.00018,exp:1.0,
  dome:{dawn:0,night:1,sunK:0,sunC:[0,0,0],glow:[0,1,0]},
  // the sun under the world, nearly behind us: the giant shows almost full
  gi:{sun:giantDir.clone().negate().add(new THREE.Vector3(.35,-.25,.1)).normalize(),haze:C(0x141c28),hF:.03,hK:.10,tint:[.97,1,1.06]},far:[.62,.66,.74]};
 return{day,dawn,night};})();
function setLightMode(mode){const M=LIGHT_MODES[mode];if(!M)return;LIGHT_MODE=mode;
 sun.position.copy(M.key);sun.color.copy(M.sunC);sun.intensity=M.sunI;
 hemi.color.copy(M.hemiS);hemi.groundColor.copy(M.hemiG);hemi.intensity=M.hemiI;fill.color.copy(M.fillC);fill.intensity=M.fillI;
 scene.fog.color.copy(M.fogC);scene.fog.density=M.fogD;renderer.toneMappingExposure=M.exp;
 const d=M.dome;SKYU.uDawn.value=d.dawn;SKYU.uNight.value=d.night;SKYU.uSunK.value=d.sunK;SKYU.uSunC.value.setRGB(d.sunC[0],d.sunC[1],d.sunC[2]);SKYU.uGlow.value.set(d.glow[0],d.glow[1],d.glow[2]);
 SKYU.uSunDir.value.copy(M.key).normalize();
 const G=M.gi;GU.uSunDir.value.copy(G.sun);GU.uHazeC.value.copy(G.haze);GU.uHazeF.value=G.hF;GU.uHazeK.value=G.hK;GU.uTint.value.setRGB(G.tint[0],G.tint[1],G.tint[2]);RINGU.uHazeF.value=Math.max(0,G.hF-.04);
 FAR.mat.color.setRGB(M.far[0],M.far[1],M.far[2]);FAR.lmat.color.setRGB(M.far[0],M.far[1],M.far[2]);
 BIO.setSun([M.key.x,M.key.y,M.key.z]);
 for(const fn of LIGHT_HOOKS){try{fn(mode);}catch(e){reportErr('light hook: '+(e.stack||e));}}}
setLightMode('day');
