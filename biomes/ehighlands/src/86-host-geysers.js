// ================================================================= HOST — the geyser field
// Six vents on the sinter shield: low cones of grey-white sinter with a dark throat, steam rising from each and leaning
// off on the wind, thinning fast in the dry thin air; the biggest (VENTS[0], the Old Kettle) erupts every half-minute or
// so: a white column 20-30 m high that falls back as a shower, then steam. All the steam is one Points mesh (one draw
// call), each puff a soft round sprite that grows and fades as it rises. Host-only: weather, not flora.
const STEAM=(function(){
 const T0=new THREE.CanvasTexture((function(){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);
  gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.45,'rgba(255,255,255,.45)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);return c;})());
 VENTS[0].name='The Old Kettle';
 // the cones
 const coneMat=new THREE.MeshLambertMaterial({color:0xd8d4ca,vertexColors:true});
 VENTS.forEach((V,i)=>{const y=terrainH(V.x,V.z),R=3+5*V.k,H=1+2.2*V.k,pts=[];
  for(let k=0;k<=8;k++){const t=k/8;pts.push(new THREE.Vector2(t<.25?mix(R*.18,R*.24,t/.25):mix(R*.24,R,(t-.25)/.75),t<.25?mix(H-.6,H,t/.25):H*(1-Math.pow((t-.25)/.75,1.4))));}
  const g=new THREE.LatheGeometry(pts,24).toNonIndexed();const p=g.attributes.position.array,c=[];
  for(let j=0;j<p.length;j+=3){const r=Math.hypot(p[j],p[j+2]),k=r<R*.26?.3:mix(1.0,.85,r/R)*(1+.08*Math.sin(Math.atan2(p[j+2],p[j])*9));c.push(k,k*.98,k*.94);}
  g.setAttribute('color',new THREE.Float32BufferAttribute(c,3));g.computeVertexNormals();g.translate(V.x,y-.5,V.z);
  const m=new THREE.Mesh(g,coneMat);m.userData.inspectLabel=V.name||'A steam vent';scene.add(m);V.y=y-.5+H;
  OBSTACLES.push({x:V.x,z:V.z,r:R+1.5,y0:y-2,y1:y+H+2});   // nothing roots on a cone (this runs before the kit builds)
  REGISTER({name:V.name||'A steam vent',x:V.x,z:V.z,y:y-2,r:R*1.3,h:H+30});});
 // the puffs
 const N=VENTS.length*44+260,pos=new Float32Array(N*3),sz=new Float32Array(N),al=new Float32Array(N),P=[];
 for(let i=0;i<N;i++){const vi=i<VENTS.length*44?Math.floor(i/44):0,gey=i>=VENTS.length*44;P.push({v:vi,gey,age:rr(0,1),life:gey?rr(2.5,5):rr(3,7),x:0,y:-1e4,z:0,vx:0,vy:0,vz:0,s0:0});}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('aSize',new THREE.BufferAttribute(sz,1));geo.setAttribute('aAlpha',new THREE.BufferAttribute(al,1));
 const mat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,fog:true,
  uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,{uMap:{value:T0},uScale:{value:innerHeight*.9},uSun:{value:new THREE.Vector3(...SUNP).normalize()}}]),
  vertexShader:['#include <fog_pars_vertex>','attribute float aSize,aAlpha;varying float vA;uniform float uScale;',
   'void main(){vA=aAlpha;vec4 mvPosition=modelViewMatrix*vec4(position,1.0);gl_PointSize=aSize*uScale/max(1.0,-mvPosition.z);gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n'),
  fragmentShader:['#include <fog_pars_fragment>','uniform sampler2D uMap;varying float vA;',
   'void main(){vec4 t=texture2D(uMap,gl_PointCoord);if(t.a*vA<0.01)discard;gl_FragColor=vec4(vec3(0.96,0.97,1.0)*(0.85+0.15*gl_PointCoord.y),t.a*vA);','#include <fog_fragment>','}'].join('\n')});
 mat.uniforms.fogColor.value=scene.fog.color;mat.uniforms.fogDensity.value=scene.fog.density;
 const pts=new THREE.Points(geo,mat);pts.frustumCulled=false;pts.userData.probeSkip=true;pts.renderOrder=3;scene.add(pts);
 const WIND=[.8,.25];   // the steam drifts east-south-east on the plateau's westerly
 let clock=0;const CYCLE=34,BURST=7;   // the Old Kettle: an eruption every 34 s, lasting 7
 function spawn(p){const V=VENTS[p.v];p.age=0;p.x=V.x+rr(-.8,.8)*V.k;p.y=V.y;p.z=V.z+rr(-.8,.8)*V.k;
  if(p.gey){const ph=clock%CYCLE;if(ph>BURST){p.y=-1e4;p.life=rr(.5,1.5);return;}const up=rr(14,24)*(1-ph/BURST*.4);p.vx=rr(-1.2,1.2);p.vy=up;p.vz=rr(-1.2,1.2);p.s0=rr(1.2,2.4);p.life=rr(2,3.6);}
  else{p.vx=rr(-.3,.3);p.vy=rr(1.2,2.6)*(.6+.6*V.k);p.vz=rr(-.3,.3);p.s0=rr(1.5,3)*(.6+.6*V.k);p.life=rr(3,7);}}
 P.forEach(p=>{spawn(p);p.age=rr(0,p.life);});
 TICKS.push(function(dt){clock+=dt;mat.uniforms.uScale.value=innerHeight*.9;
  for(let i=0;i<N;i++){const p=P[i];p.age+=dt;if(p.age>p.life)spawn(p);if(p.y<-1e3){al[i]=0;pos[i*3+1]=-1e4;continue;}
   const t=p.age/p.life;
   if(p.gey){p.vy-=9.8*.75*dt;p.vx+=WIND[0]*dt*.6;p.vz+=WIND[1]*dt*.6;}else{p.vx+=WIND[0]*dt*.5;p.vz+=WIND[1]*dt*.5;p.vy*=1-dt*.15;}
   p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;
   pos[i*3]=p.x;pos[i*3+1]=p.y;pos[i*3+2]=p.z;sz[i]=p.s0*(1+t*(p.gey?2.5:4));al[i]=(p.gey?.55:.4)*smooth(0,.08,t)*(1-smooth(.35,1,t));}
  geo.attributes.position.needsUpdate=true;geo.attributes.aSize.needsUpdate=true;geo.attributes.aAlpha.needsUpdate=true;});
 return{N,cycle:CYCLE};})();
