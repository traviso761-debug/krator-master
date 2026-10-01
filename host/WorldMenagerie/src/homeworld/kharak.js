// ---------- Kharak, and the sky over it ----------
// Fan work. Homeworld belongs to its makers; nothing from the game is used.
//
// Kharak is a desert world: sand seas in bands, darker rock between them, pale salt flats, and a thin dusty
// air at the limb. In the third mission it is burning - the Taiidan have set the whole world alight - and a
// shader does both, with uBurn between them: under the fire the day side goes black with smoke and the fronts
// of the firestorm crawl across it, and the night side glows. The sky is a painted sphere behind everything,
// the way the game's skies were: a band of dust and gas across the stars, its colours set per mission.
export function makeKharak(api,K){
  const {THREE,scene,animHooks}=api;
  const D=K.dist||600000,R=Math.tan((K.deg||26)*Math.PI/180)*D,az=K.az===undefined?0.6:K.az,el=K.el===undefined?-0.62:K.el;
  const sl=K.sun||[0.9,0.35];
  const L=new THREE.Vector3(Math.cos(sl[0])*Math.cos(sl[1]),Math.sin(sl[1]),Math.sin(sl[0])*Math.cos(sl[1])).normalize();
  const U={uL:{value:L},uBurn:{value:0},uT:{value:0}};
  const mat=new THREE.ShaderMaterial({uniforms:U,
    vertexShader:`varying vec3 vN;varying vec3 vP;varying vec3 vW;void main(){vP=normalize(position);vN=normalize(mat3(modelMatrix)*normal);vec4 w=modelMatrix*vec4(position,1.0);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`,
    fragmentShader:`uniform vec3 uL;uniform float uBurn;uniform float uT;varying vec3 vN;varying vec3 vP;varying vec3 vW;
float h(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float n3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
 return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fb(vec3 p){float s=0.0,a=0.5;for(int i=0;i<6;i++){s+=a*n3(p);p=p*2.03+vec3(1.7,9.2,3.1);a*=0.5;}return s;}
void main(){
 vec3 p=vP;
 // the sand seas: dune bands along the latitudes, sheared by the wind, the great banded desert across the middle
 float w=fb(p*2.5);
 float lat=p.y+0.12*(w-0.5);
 float band=sin(lat*38.0+w*4.0)*0.5+0.5,broad=sin(lat*9.0+w*2.0)*0.5+0.5;
 float rock=smoothstep(0.55,0.68,fb(p*4.5+vec3(4.0)));
 vec3 sand=mix(vec3(0.74,0.50,0.28),vec3(0.92,0.74,0.48),band*0.6+broad*0.4);
 vec3 c=mix(sand,vec3(0.40,0.27,0.18),rock*0.85);
 c=mix(c,vec3(0.94,0.9,0.8),smoothstep(0.7,0.82,fb(p*8.0+vec3(2.0)))*0.55);   // the salt flats of dried seas
 c*=0.88+0.2*fb(p*40.0);
 // the cooler lands towards the poles: less sand, more rock and scrub, greyer and darker, the last of the green
 float temp=smoothstep(0.42,0.66,abs(p.y)+0.08*(w-0.5));
 vec3 cool=mix(vec3(0.46,0.42,0.33),vec3(0.36,0.38,0.28),smoothstep(0.45,0.7,fb(p*7.0+vec3(5.0))));
 c=mix(c,cool*(0.9+0.2*fb(p*25.0)),temp*0.85);
 c=mix(c,vec3(0.95,0.93,0.9),smoothstep(0.86,0.95,abs(p.y)+0.05*w));         // the poles
 float d=dot(normalize(vN),uL),lit=smoothstep(-0.1,0.35,d);
 vec3 day=c*(0.03+0.97*lit);
 // the fire: thin fronts that crawl across a charred world, embers behind them, smoke over the day side,
 // and a glow that does not need the sun
 float f=fb(p*6.0+vec3(uT*0.02,0.0,uT*0.015));
 float front=smoothstep(0.47,0.5,f)*(1.0-smoothstep(0.5,0.535,f));
 float f2=fb(p*13.0-vec3(uT*0.03));
 float front2=smoothstep(0.49,0.5,f2)*(1.0-smoothstep(0.5,0.515,f2));
 float embers=pow(smoothstep(0.6,0.85,fb(p*22.0+vec3(uT*0.04))),2.0)*step(f,0.5);
 vec3 char=mix(vec3(0.07,0.05,0.04),c*0.25,0.35);
 vec3 burnt=char*(0.25+0.75*lit)+vec3(1.0,0.42,0.08)*(front*2.2+front2*1.2)+vec3(0.9,0.22,0.03)*embers*0.8+vec3(0.35,0.06,0.01)*step(f,0.5)*0.35;
 float smoke=smoothstep(0.45,0.8,fb(p*3.5+vec3(uT*0.008,uT*0.004,0.0)));
 burnt=mix(burnt,vec3(0.24,0.2,0.18)*(0.15+0.85*lit)+vec3(0.3,0.08,0.02)*front,smoke*0.6);
 vec3 col=mix(day,burnt,uBurn);
 // the lights of the Kushan cities on the night side, strung along the cooler belts where the people live
 float night=1.0-smoothstep(-0.12,0.08,d);
 float belt=smoothstep(0.3,0.5,abs(p.y))*(1.0-smoothstep(0.78,0.88,abs(p.y)));
 float cities=smoothstep(0.66,0.8,fb(p*38.0))*smoothstep(0.45,0.6,fb(p*9.0+vec3(8.0)));
 col+=vec3(1.0,0.72,0.38)*cities*belt*night*(1.0-uBurn)*1.1;
 vec3 V=normalize(cameraPosition-vW);float rim=pow(1.0-max(0.0,dot(normalize(vN),V)),3.0);
 col+=mix(vec3(0.95,0.66,0.38)*smoothstep(-0.2,0.3,d),vec3(1.0,0.36,0.08),uBurn)*rim*0.6;
 gl_FragColor=vec4(col,1.0);}`});
  const planet=new THREE.Mesh(new THREE.SphereGeometry(R,160,110),mat);
  planet.position.set(Math.cos(az)*Math.cos(el)*D,Math.sin(el)*D,Math.sin(az)*Math.cos(el)*D);planet.rotation.z=0.25;
  planet.userData.noWire=true;planet.frustumCulled=false;scene.add(planet);
  // a halo of the burning air round it, only when it burns
  const haloM=new THREE.MeshBasicMaterial({color:0xff5a18,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.BackSide});
  const halo=new THREE.Mesh(new THREE.SphereGeometry(R*1.035,64,40),haloM);halo.position.copy(planet.position);halo.userData.noWire=true;scene.add(halo);

  // ---- the weather: dust storms dragged out along the latitudes; in the third mission, the smoke ----
  const CU={uL:{value:L},uBurn:U.uBurn,uT:U.uT};
  const cloudM=new THREE.ShaderMaterial({uniforms:CU,transparent:true,depthWrite:false,
    vertexShader:`varying vec3 vN;varying vec3 vP;void main(){vP=normalize(position);vN=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*modelMatrix*vec4(position,1.0);}`,
    fragmentShader:`uniform vec3 uL;uniform float uBurn;uniform float uT;varying vec3 vN;varying vec3 vP;
float h(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float n3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
 return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fb(vec3 p){float s=0.0,a=0.5;for(int i=0;i<5;i++){s+=a*n3(p);p=p*2.1+vec3(1.3,7.7,2.9);a*=0.5;}return s;}
void main(){vec3 p=vP;vec3 q=vec3(p.x*2.2,p.y*9.0,p.z*2.2)+vec3(uT*0.004,0.0,0.0);
 float dust=smoothstep(0.55,0.8,fb(q+fb(p*4.0)*1.5))*(1.0-smoothstep(0.7,0.95,abs(p.y)));
 float smoke=smoothstep(0.42,0.75,fb(p*5.0+vec3(uT*0.006,uT*0.003,0.0)));
 float d=dot(normalize(vN),uL),lit=smoothstep(-0.1,0.3,d);
 vec3 dc=vec3(0.92,0.78,0.58)*(0.05+0.95*lit);
 vec3 sc=vec3(0.16,0.13,0.12)*(0.2+0.8*lit)+vec3(0.5,0.16,0.04)*(1.0-lit)*0.4;
 float a=mix(dust*0.45,smoke*0.7,uBurn);
 gl_FragColor=vec4(mix(dc,sc,uBurn),a);}`});
  const clouds=new THREE.Mesh(new THREE.SphereGeometry(R*1.006,128,80),cloudM);clouds.position.copy(planet.position);clouds.rotation.z=0.25;clouds.userData.noWire=true;clouds.frustumCulled=false;scene.add(clouds);
  // ---- the bright stars, each with its cross of light ----
  {const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');const gr=g.createRadialGradient(64,64,0,64,64,20);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);
   for(const [w,h] of [[128,3],[3,128]]){const lg=g.createLinearGradient(w>h?0:64,w>h?64:0,w>h?128:64,w>h?64:128);lg.addColorStop(0,'rgba(255,255,255,0)');lg.addColorStop(0.5,'rgba(255,255,255,0.9)');lg.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=lg;g.fillRect(64-w/2,64-h/2,w,h);}
   const T=new THREE.CanvasTexture(c),RS=(()=>{let x=91;return ()=>(x=(x*16807)%2147483647)/2147483647;})();
   for(let i=0;i<26;i++){const a=RS()*Math.PI*2,e=(RS()-0.5)*1.4,dd=D*1.45,m=new THREE.Sprite(new THREE.SpriteMaterial({map:T,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,color:[0xffffff,0xcfe0ff,0xffe2c0][i%3]}));
     m.position.set(Math.cos(a)*Math.cos(e)*dd,Math.sin(e)*dd,Math.sin(a)*Math.cos(e)*dd);m.scale.setScalar(dd*(0.006+RS()*0.01));m.userData.noWire=true;scene.add(m);}}

  // ---- the sky ----
  // The galaxy lies flat: its disc edge-on across the whole sky as a level band, the core a swelling of light
  // along it, dust down the middle - the game's backdrop of the Kharak system, out on the galaxy's rim, where
  // that band is the one thing that tells you which way is level.
  const SK={uA:{value:new THREE.Color()},uB:{value:new THREE.Color()},uC:{value:new THREE.Color()},uAxis:{value:new THREE.Vector3(0,1,0)},uCore:{value:new THREE.Vector3(Math.cos(2.9),0,Math.sin(2.9))}};
  const skyM=new THREE.ShaderMaterial({uniforms:SK,side:THREE.BackSide,depthWrite:false,
    vertexShader:`varying vec3 vD;void main(){vD=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader:`uniform vec3 uA;uniform vec3 uB;uniform vec3 uC;uniform vec3 uAxis;uniform vec3 uCore;varying vec3 vD;
float h(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float n3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
 return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fb(vec3 p){float s=0.0,a=0.5;for(int i=0;i<5;i++){s+=a*n3(p);p=p*2.1+vec3(3.1,1.7,5.3);a*=0.5;}return s;}
void main(){vec3 d=normalize(vD);
 // the disc of the galaxy edge-on: a level band, thicker and brighter toward the core, with a lane of dust
 // along its middle, and gas and star-clouds torn along it
 float b=dot(d,uAxis);vec3 fl=normalize(vec3(d.x,0.0,d.z)+1e-5);float toCore=dot(fl,uCore);
 float thick=0.07+0.09*smoothstep(-0.3,1.0,toCore);
 float band=exp(-b*b/(thick*thick));
 float g=fb(d*4.0),g2=fb(d*11.0+vec3(7.0));
 vec3 c=uA*band*(0.45+0.8*g)+uB*pow(band,2.5)*(0.3+0.9*smoothstep(0.4,0.8,g2));
 float core=exp(-pow(acos(clamp(dot(d,uCore),-1.0,1.0))/0.35,2.0));
 c+=uB*core*1.4+vec3(1.0,0.95,0.85)*core*0.6;
 float lane=exp(-pow((b+0.01*(g-0.5))/(thick*0.28),2.0));
 c*=1.0-0.75*lane*smoothstep(0.35,0.6,fb(d*8.0+vec3(3.0)));
 // and faint clouds of the nearer nebula off the band
 c+=uC*0.35*smoothstep(0.62,0.9,fb(d*2.0+vec3(11.0)))*(1.0-band);
 gl_FragColor=vec4(c*0.6,1.0);}`});
  const sky=new THREE.Mesh(new THREE.SphereGeometry(D*1.6,48,32),skyM);sky.renderOrder=-10;sky.userData.noWire=true;sky.frustumCulled=false;scene.add(sky);
  const PAL={1:['#8a7050','#e8c890','#2a3a5a'],3:['#7a3a24','#f08040','#4a1a2a']};
  let burn=0,want=0;const cA=new THREE.Color(),cB=new THREE.Color(),cC=new THREE.Color();
  const setMission=(m,instant)=>{want=m===3?1:0;if(instant)burn=want;};
  let t0=performance.now();
  animHooks.push(now=>{const t=(now-t0)/1000;burn+=(want-burn)*0.01;U.uBurn.value=burn;U.uT.value=t;haloM.opacity=0.25*burn;
    cA.set(PAL[1][0]).lerp(new THREE.Color(PAL[3][0]),burn);cB.set(PAL[1][1]).lerp(new THREE.Color(PAL[3][1]),burn);cC.set(PAL[1][2]).lerp(new THREE.Color(PAL[3][2]),burn);
    SK.uA.value.copy(cA);SK.uB.value.copy(cB);SK.uC.value.copy(cC);planet.rotation.y+=4e-6;clouds.rotation.y+=5.5e-6;});
  planet.userData.info={name:'Kharak',info:'The desert world the Kushan woke on, knowing nothing of where they came from: sand seas in bands, the rock between them, the salt of dried oceans at the poles. In the third mission it is burning: the Taiidan have set the whole planet alight for the crime of building a hyperspace drive.'};
  return {planet,setMission,get burn(){return burn;}};
}
