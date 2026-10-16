// ================================================================= VERGE — the water ([draw])
// The upper river (a ribbon down the canyon to the lip), the gorge's plunge basins between the seven cataracts, the
// cataracts themselves (streaked curtains with mist at each plunge), the plunge pool, the lower river (a ribbon along
// VG.RIVL) and the salt lakes far to the east. One vertex-coloured ripple material (Shade's, the sedesert kit's
// look) for every surface; its sky and sun are set by the day/night pass (83).
const WATER={meshes:[],features:[]};
const WCOL=(function(){const U=SEDESERT_WATER.hue,A=EASTABYSS_LAKE.hue,H=(h,s,l)=>new THREE.Color().setHSL(h,s,l);return{
 upShallow:H(U,.45,.42),upDeep:H(U,.55,.24),white:new THREE.Color(0xe8eeee),foam:H(U,.15,.78),
 lkShallow:H(A,.62,.55),lkMid:H(A,.66,.36),lkDeep:H(A,.6,.18),lkPale:H(A+.02,.32,.78),
 river:H((U+A)/2,.38,.3),riverShallow:H((U+A)/2,.32,.44)};})();
const MAT_WATER=new THREE.ShaderMaterial({fog:true,vertexColors:true,
 uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,{uT:{value:0},uSun:{value:new THREE.Vector3(SUNV[0],SUNV[1],SUNV[2]).normalize()},uSky:{value:new THREE.Color(0xdfe6ec)},uSunK:{value:1}}]),
 vertexShader:['#include <fog_pars_vertex>','varying vec3 vWP;varying vec3 vCol;',
  'void main(){vCol=color;vec4 wp=modelMatrix*vec4(position,1.0);vWP=wp.xyz;vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n'),
 fragmentShader:['#include <fog_pars_fragment>','uniform float uT,uSunK;uniform vec3 uSun,uSky;varying vec3 vWP;varying vec3 vCol;',
  'void main(){',
  ' float dcam=length(cameraPosition-vWP);float rk=1.0-smoothstep(160.0,700.0,dcam);',
  ' vec3 n=normalize(vec3(rk*(0.035*sin(vWP.x*0.31+uT*1.1)+0.02*sin(vWP.z*0.53-uT*0.7+vWP.x*0.11)),1.0,rk*(0.035*cos(vWP.z*0.27+uT*0.9)+0.02*sin(vWP.x*0.47+uT*1.3))));',
  ' vec3 V=normalize(cameraPosition-vWP);float fr=pow(clamp(1.0-dot(n,V),0.0,1.0),3.0);',
  ' vec3 col=mix(vCol,uSky,0.10+fr*0.62);',
  ' vec3 H=normalize(uSun+V);col+=pow(clamp(dot(n,H),0.0,1.0),140.0)*0.8*uSunK*vec3(1.0,0.97,0.9);',
  ' gl_FragColor=vec4(col,1.0);','#include <fog_fragment>','}'].join('\n')});
MAT_WATER.uniforms.fogColor.value=scene.fog.color;MAT_WATER.uniforms.fogDensity.value=scene.fog.density;
tick(dt=>{MAT_WATER.uniforms.uT.value+=dt;});
// a ribbon along a centreline: P = [[x, z, y, halfWidth, colourFn(x,z,u)]...], NW+1 vertices across
function waterRibbon(P,label,NW){NW=NW||6;const pos=[],col=[],c=new THREE.Color(),rows=[];
 for(let i=0;i<P.length;i++){const p=P[i],a=P[Math.max(0,i-1)],b=P[Math.min(P.length-1,i+1)],tx=b[0]-a[0],tz=b[1]-a[1],l=Math.hypot(tx,tz)||1,nx=-tz/l,nz=tx/l,row=[];
  for(let k=0;k<=NW;k++){const u=k/NW-.5,o=u*2*p[3],x=p[0]+nx*o,z=p[1]+nz*o;row.push(pos.length/3);p[4](x,z,u,c);c.convertSRGBToLinear();pos.push(x,p[2],z);col.push(c.r,c.g,c.b);}rows.push(row);}
 const idx=[];for(let r=0;r<rows.length-1;r++)for(let k=0;k<NW;k++){const a=rows[r][k],b=rows[r][k+1],cc=rows[r+1][k],dd=rows[r+1][k+1];idx.push(a,b,dd,a,dd,cc);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();
 // a ribbon must face up whichever way its centreline runs
 const nr=g.attributes.normal;let up=0;for(let i=0;i<nr.count;i+=7)up+=nr.getY(i);if(up<0){for(let i=0;i<idx.length;i+=3){const t=idx[i+1];idx[i+1]=idx[i+2];idx[i+2]=t;}g.setIndex(idx);g.computeVertexNormals();}
 const m=new THREE.Mesh(g,MAT_WATER);m.userData.probeSkip=true;m.userData.inspectLabel=label;m.renderOrder=1;scene.add(m);WATER.meshes.push(m);return m;}
const upCol=(x,z,u,c)=>c.copy(WCOL.upShallow).lerp(WCOL.upDeep,1-Math.abs(u)*2).lerp(WCOL.foam,.08);
// the upper river, to the first fall's lip
(function(){const P=[];for(let x=-10200;x<VG.FALLS[0].x;x+=x<-6400?40:6){const xx=Math.min(x,VG.FALLS[0].x-.2);P.push([xx,x<VG.E.LIP_X?VG.rivUZ(xx):VG.gorgeZ(xx),VG.WLU(xx),VG.RIVU.hw+.6,upCol]);}
 waterRibbon(P,'The river (upper)');})();
// the gorge's basins: white water below each fall, clearing toward the next lip
VG.FALLS.forEach((f,i)=>{const nx=i+1<VG.FALLS.length?VG.FALLS[i+1].x:VG.POOL.x-VG.POOL.r+10,P=[];if(i===VG.FALLS.length-1)return;
 for(let x=f.x+.3;x<nx-.2;x+=3)P.push([x,VG.gorgeZ(x),f.bot,VG.gorgeHW(x)-1.5,(xx,zz,u,c)=>{const t=(xx-f.x)/Math.max(1,nx-f.x);return c.copy(WCOL.white).lerp(WCOL.upShallow,smooth(.1,.75,t)).lerp(WCOL.foam,.25*(1-Math.abs(u)*2));}]);
 P.push([nx-.2,VG.gorgeZ(nx-.2),f.bot,VG.gorgeHW(nx-.2)-1.5,(xx,zz,u,c)=>c.copy(WCOL.upShallow)]);
 waterRibbon(P,'The gorge: the basin below '+f.id.replace('falls-','fall '));});
// the plunge pool
(function(){const P=VG.POOL,pos=[P.x,P.y,P.z],col=[],c=new THREE.Color(),PN=64,idx=[];c.copy(WCOL.upDeep).lerp(WCOL.lkMid,.4);c.convertSRGBToLinear();col.push(c.r,c.g,c.b);
 for(let k=0;k<=PN;k++){const a=k/PN*Math.PI*2,r=P.r+9,x=P.x+Math.cos(a)*r,z=P.z+Math.sin(a)*r;pos.push(x,P.y,z);c.copy(WCOL.upShallow).lerp(WCOL.lkShallow,.35);c.convertSRGBToLinear();col.push(c.r,c.g,c.b);}
 for(let k=0;k<PN;k++)idx.push(0,k+2,k+1);
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();
 const m=new THREE.Mesh(g,MAT_WATER);m.userData.probeSkip=true;m.userData.inspectLabel='The plunge pool';m.renderOrder=1;scene.add(m);WATER.meshes.push(m);})();
// the lower river: from the pool east to the salt lakes
(function(){const R=VG.RIVL,P=[];for(let i=0;i<R.pts.length;i+=(R.pts[i][0]>4200?4:1)){const p=R.pts[i];
  P.push([p[0],p[1],VG.WLL(p[2]),R.hw+1.2,(x,z,u,c)=>c.copy(WCOL.riverShallow).lerp(WCOL.river,1-Math.abs(u)*2).lerp(WCOL.lkShallow,smooth(4000,9000,x)*.6)]);}
 waterRibbon(P,'The river (lower)',8);})();
// the salt lakes: discs at their surface, turquoise over pale salt shoals
(function(){for(const L of VG.SALT_LAKES){const pos=[L.x,VG.SALT_Y,L.z],col=[],c=new THREE.Color(),idx=[],NA=96,NR=6,ca=Math.cos(L.a),sa=Math.sin(L.a);
  c.copy(WCOL.lkDeep).lerp(WCOL.lkMid,.4);c.convertSRGBToLinear();col.push(c.r,c.g,c.b);
  for(let r=1;r<=NR;r++)for(let k=0;k<NA;k++){const th=k/NA*Math.PI*2,w=(1+.12*Math.sin(th*5+L.x))*(1+60/Math.min(L.rx,L.rz)),f=r/NR,u=Math.cos(th)*w*f,v=Math.sin(th)*w*f;
   const x=L.x+u*L.rx*ca-v*L.rz*sa,z=L.z+u*L.rx*sa+v*L.rz*ca;pos.push(x,VG.SALT_Y,z);
   const sh=VG.vn(x*.0012,z*.0012,33);c.copy(WCOL.lkDeep).lerp(WCOL.lkMid,smooth(.2,.6,f)).lerp(WCOL.lkShallow,smooth(.6,.95,f)).lerp(WCOL.lkPale,smooth(.55,.75,sh)*f*.8);c.convertSRGBToLinear();col.push(c.r,c.g,c.b);}
  for(let k=0;k<NA;k++)idx.push(0,1+(k+1)%NA,1+k);
  for(let r=1;r<NR;r++)for(let k=0;k<NA;k++){const a=1+(r-1)*NA+k,b=1+(r-1)*NA+(k+1)%NA,cc=1+r*NA+k,dd=1+r*NA+(k+1)%NA;idx.push(a,b,dd,a,dd,cc);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();
  const nr=g.attributes.normal;if(nr.getY(1)<0){for(let i=0;i<idx.length;i+=3){const t=idx[i+1];idx[i+1]=idx[i+2];idx[i+2]=t;}g.setIndex(idx);g.computeVertexNormals();}
  const m=new THREE.Mesh(g,MAT_WATER);m.userData.probeSkip=true;m.userData.inspectLabel='A salt lake';m.renderOrder=1;scene.add(m);WATER.meshes.push(m);
  WATER.features.push({key:'salt_lake',name:'A salt lake of the Abyss',kind:'water',x:L.x,z:L.z,y:VG.SALT_Y-4,r:Math.max(L.rx,L.rz),h:5,tags:{biome:'eastabyss',salt:true}});}})();
// ---------------------------------------------------------------- the cataracts
const TEX_FALL=BIO.canvasTex(128,512,(g,w,h)=>{g.fillStyle='#ffffff';g.fillRect(0,0,w,h);const R=KRAND.stream(KRAND.child(VG.SEED,'falls'));
 for(let i=0;i<300;i++){const x=R.next()*w,l=R.range(40,220);g.strokeStyle='rgba('+(R.next()<.5?'150,190,200':'255,255,255')+','+(.2+R.next()*.5).toFixed(2)+')';g.lineWidth=R.range(1,4);g.beginPath();g.moveTo(x,R.next()*h);g.lineTo(x+R.range(-3,3),R.next()*h+l);g.stroke();}});
const MAT_FALL=new THREE.ShaderMaterial({fog:true,transparent:true,depthWrite:false,side:THREE.DoubleSide,
 uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,{uT:{value:0},uTex:{value:TEX_FALL},uCol:{value:new THREE.Color().setHSL(SEDESERT_WATER.hue,.3,.74)},uLit:{value:1}}]),
 vertexShader:['#include <fog_pars_vertex>','varying vec2 vUv;','void main(){vUv=uv;vec4 wp=modelMatrix*vec4(position,1.0);vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n'),
 fragmentShader:['#include <fog_pars_fragment>','uniform float uT,uLit;uniform sampler2D uTex;uniform vec3 uCol;varying vec2 vUv;',
  'void main(){',
  ' vec3 s1=texture2D(uTex,vec2(vUv.x*2.0,vUv.y*9.0-uT*1.6)).rgb;vec3 s2=texture2D(uTex,vec2(vUv.x*3.1+0.3,vUv.y*6.0-uT*2.3)).rgb;',
  ' float f=(s1.r*s2.g);vec3 col=mix(uCol,vec3(1.0),0.25+0.6*smoothstep(0.35,0.9,f))*uLit;',
  ' float a=(0.4+0.5*smoothstep(0.3,0.9,f))*(0.55+0.45*s1.g);a*=smoothstep(0.0,0.12,vUv.x)*smoothstep(1.0,0.88,vUv.x);',
  ' a*=mix(1.0,0.55,smoothstep(0.6,1.0,vUv.y));',
  ' gl_FragColor=vec4(col,a);','#include <fog_fragment>','}'].join('\n')});
MAT_FALL.uniforms.fogColor.value=scene.fog.color;MAT_FALL.uniforms.fogDensity.value=scene.fog.density;
tick(dt=>{MAT_FALL.uniforms.uT.value+=dt;});
const TEX_MIST=BIO.canvasTex(128,128,(gg,w,h)=>{const gr=gg.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,'rgba(255,255,255,.9)');gr.addColorStop(.45,'rgba(240,246,250,.45)');gr.addColorStop(1,'rgba(240,246,250,0)');gg.fillStyle=gr;gg.fillRect(0,0,w,h);});
const MIST=[];
VG.FALLS.forEach((f,i)=>{const R=KRAND.stream(KRAND.child(VG.SEED,f.id)),H=f.top-f.bot,z0=VG.gorgeZ(f.x),w0=9+2*(6-i)*.3;
 // the curtain leaves the lip and is thrown a few metres clear as it falls (a parabola that steepens)
 const throwX=Math.min(14,4+H*.05),xAt=t=>f.x+throwX*(1-Math.exp(-3*t))/(1-Math.exp(-3)),pos=[],uv=[],idx=[],NS=40;
 for(let s=0;s<=NS;s++){const t=s/NS,y=f.top-H*t,x=xAt(t),w=w0*(1+t*.9);for(let k=-1;k<=1;k+=2){pos.push(x,y,z0+k*w);uv.push(k<0?0:1,t*H/40);}}
 for(let s=0;s<NS;s++){const a=s*2,b=a+1,c=a+2,d=a+3;idx.push(a,c,d,a,d,b);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
 const m=new THREE.Mesh(g,MAT_FALL);m.userData.probeSkip=true;m.userData.inspectLabel='Cataract '+(i+1);m.renderOrder=2;scene.add(m);WATER.meshes.push(m);
 // the mist at the plunge, and a little down the fall
 for(let k=0;k<10;k++){const plunge=k<7,t=plunge?R.range(.92,1):R.range(.35,.85),y=f.top-H*t,x=xAt(t)+(plunge?R.range(2,22):R.range(.5,4)),s=plunge?R.range(12,30):R.range(5,12);
  const sm=new THREE.SpriteMaterial({map:TEX_MIST,transparent:true,depthWrite:false,opacity:plunge?R.range(.22,.42):R.range(.1,.22),fog:true,color:0xf4f8fa});
  const sp=new THREE.Sprite(sm);sp.position.set(x,y+(plunge?R.range(0,10):0),z0+R.range(-9,9));sp.scale.set(s,s*R.range(.7,1.1),1);sp.userData.probeSkip=true;sp.userData.inspectLabel='Spray';
  sp.userData.ph=R.range(0,6.28);sp.userData.y0=sp.position.y;scene.add(sp);MIST.push(sp);}
 WATER.features.push({key:f.id,name:'The '+['first','second','third','fourth','fifth','sixth','seventh'][i]+' cataract',kind:'water',x:f.x+2,z:z0,y:f.bot,r:w0+4,h:H,tags:{height_m:H,top_m:f.top,foot_m:f.bot}});});
tick((dt,t)=>{for(let i=0;i<MIST.length;i++){const s=MIST[i];s.position.y=s.userData.y0+.9*Math.sin(t*.5+s.userData.ph);}});
WATER.features.push({key:'plunge_pool',name:'The plunge pool',kind:'water',x:VG.POOL.x,z:VG.POOL.z,y:VG.POOL.y-VG.POOL.depth,r:VG.POOL.r,h:VG.POOL.depth+1,tags:{depth_m:VG.POOL.depth,surface_m:VG.POOL.y}});
WATER.features.push({key:'gorge',name:'The gorge of the seven cataracts',kind:'terrain',x:(VG.GORGE.x0+VG.GORGE.x1)/2,z:VG.gorgeZ(-1150),y:0,r:(VG.GORGE.x1-VG.GORGE.x0)/2,h:870,tags:{falls:7,drop_m:+(VG.FALLS[0].top-VG.POOL.y).toFixed(1)}});
for(const F of WATER.features)REGISTER({name:F.name,cls:F.kind,x:F.x,z:F.z,y:F.y,r:F.r,h:F.h,tags:F.tags});
