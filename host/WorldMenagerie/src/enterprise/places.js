// ---------- Galaxy class: places to warp to ----------
// Fan work. Star Trek belongs to Paramount; every place here is this project's own, made up for the page.
//
// Each place sits on a small star chart (`ly`, light-years east and north of home) and is drawn in its own frame
// when you arrive: +x is the way the ship was heading as it dropped out, so whatever the place is about is ahead
// and a little to one side. A place is either sky data for the page's own sky builder (planets, rings, clouds,
// nebulae: `sky`), or a builder of its own (`build`), or both. Distances inside a place are the page's scale model:
// planets a few hundred kilometres across, a few hundred kilometres off, so that at full impulse you can reach them.
//
// `light` is the star the place is lit by: its colour and strength, the direction it is in (az, el in the place's
// frame), the ambient, and a fill from the other side (a planet's glow, a second star, a nebula).
import {buildSky} from '../starship/page.js';

const D=900000;
const dirOf=(az,el)=>[Math.cos(az)*Math.cos(el),Math.sin(el),Math.sin(az)*Math.cos(el)];

export const PLACES=[
  {id:'home',name:'Home: a class-M world',ly:[0,0],note:'A blue world with its moon, and the star off the port bow.'},
  {id:'giant',name:'A ringed gas giant',ly:[3.1,2.4],note:'A gas giant twelve bands deep, its rings tilted at the sun, two moons.',
    light:{colour:'#fff0d8',intensity:2.1,az:0.9,el:0.32,ambient:0.3,fill:{colour:'#c8a070',intensity:0.5,az:-0.5,el:0.1}},
    sky:{bodies:[{kind:'gas',az:-0.42,el:0.12,dist:0.78,deg:13,seg:160,bands:13,colours:['#c9a878','#e2cfa4','#9a7350','#efe4cc'],rate:3e-5,
        ring:{inner:1.35,outer:2.45,tilt:0.32,bands:18,colour:'#cdbf9e',opacity:0.7}},
      {kind:'rock',az:0.32,el:-0.05,dist:0.42,deg:2.4,seg:40,colours:['#6b5e52','#8a7a68','#a8987e','#d8d0c0'],ice:0.7},
      {kind:'rock',az:-0.9,el:0.22,dist:0.74,deg:1.2,seg:28,colours:['#c8c0b0','#a8a090','#e0dace','#f4f0e8'],ice:0.4}]}},
  {id:'ice',name:'An ice world under a red dwarf',ly:[-4.5,1.8],note:'Frozen oceans under a dim red sun that never sets on its near side.',
    light:{colour:'#ffb490',intensity:1.7,az:1.1,el:0.2,ambient:0.26,fill:{colour:'#7090b0',intensity:0.55,az:-1.2,el:-0.3}},
    sky:{bodies:[{kind:'rock',az:-0.5,el:-0.22,dist:0.5,deg:19,seg:160,colours:['#4f6d84','#c6d5df','#94a8b6','#f4f8fb'],ice:0.32,clouds:true,cloudPuffs:900,cloudSystems:40,rate:1.5e-5}]}},
  {id:'comet',name:'A comet near its sun',ly:[0.4,-0.9],note:'A nucleus a few kilometres across, its coma, and two tails blown straight back from the sun.',
    light:{colour:'#eaf2ff',intensity:2.6,az:2.6,el:0.18,ambient:0.24,fill:{colour:'#4a6a9a',intensity:0.3,az:-0.6,el:-0.2}},build:comet},
  {id:'binary',name:'A binary star',ly:[8.2,-3.5],note:'An orange giant and a hot blue companion, close enough to be stripping it.',
    light:{colour:'#ffc890',intensity:2.2,az:0.42,el:0.14,ambient:0.3,fill:{colour:'#a8c8ff',intensity:1.5,az:0.78,el:0.06}},build:binary},
  {id:'belt',name:'An asteroid belt',ly:[-2.2,-5.1],note:'Rock from a few metres to a few kilometres, strewn tens of kilometres round you.',
    light:{colour:'#ffd2b0',intensity:1.9,az:0.7,el:0.4,ambient:0.3,fill:{colour:'#506070',intensity:0.4,az:-2,el:-0.3}},build:belt},
  {id:'nebula',name:'Inside an emission nebula',ly:[14,6],note:'Gas lit from within by young hot stars, glowing red with hydrogen and teal with oxygen.',
    light:{colour:'#d8e4ff',intensity:1.6,az:0.2,el:0.3,ambient:0.42,fill:{colour:'#c04070',intensity:0.9,az:-1.8,el:-0.2}},
    sky:{nebulae:[{colour:'#9a2f5c',az:0.1,el:0.05,dist:0.32,size:300000,puffs:420,opacity:0.011},{colour:'#2a7a86',az:1.4,el:-0.1,dist:0.28,size:240000,puffs:360,opacity:0.012},
      {colour:'#b0503a',az:-1.6,el:0.2,dist:0.3,size:260000,puffs:360,opacity:0.01},{colour:'#6a2a7a',az:3,el:-0.25,dist:0.34,size:280000,puffs:360,opacity:0.01}]},build:cluster},
  {id:'hole',name:'A black hole',ly:[26,-12],note:'Ten times the Sun\'s mass, feeding: its disc of gas is hotter than any star, and bends its own light over the top.',
    light:{colour:'#ffcf9a',intensity:1.5,az:0.42,el:0.04,ambient:0.22,fill:{colour:'#6a8ac8',intensity:0.25,az:-2,el:0.3}},build:hole},
];
export const DEEP={id:'deep',name:'Interstellar space',note:'Nothing for light-years: the stars, and the dark between them.',
  light:{colour:'#dfe6f2',intensity:0.5,az:0.5,el:0.6,ambient:0.3,fill:{colour:'#405070',intensity:0.25,az:-2,el:-0.4}}};

// what a place is made of: its group, the solid things in it (to keep the ship out of, and to orbit), a per-frame
// update, and its light as directions
export function makePlace(THREE,P,kit){
  const g=new THREE.Group(),solids=[],ups=[];
  if(P.sky){
    let s=P.seed||(P.id.length*7919+1701);const rnd=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};
    const tmp=new THREE.Group();
    const out=buildSky(THREE,tmp,{far:D,stars:1,starSize:1,nebulae:P.sky.nebulae||[],bodies:P.sky.bodies||[]},rnd);
    const st=tmp.children.find(o=>o.isPoints);if(st){tmp.remove(st);st.geometry.dispose();st.material.dispose();}
    for(const o of tmp.children.slice())g.add(o);
    for(const q of out.bodies){const b=q.b,d=(b.dist||0.6)*D;solids.push({name:bodyName(P,b),c:q.g.position.clone(),r:Math.tan((b.deg||6)*Math.PI/180)*d,orbit:true});
      if(b.rate)ups.push(()=>{q.g.rotation.y+=b.rate;});}
  }
  if(P.build){const r=P.build(THREE,g,kit);if(r.solids)solids.push(...r.solids);if(r.update)ups.push(r.update);}
  g.traverse(o=>{o.userData.noWire=true;o.frustumCulled=false;if(o.material)for(const m of [].concat(o.material))m.toneMapped=false;});
  // rock and hull-like surfaces keep the tone mapping the ship has
  g.traverse(o=>{if(o.userData.toned&&o.material)o.material.toneMapped=true;});
  const L=P.light;
  return {P,group:g,solids,update:(t,dt,cam)=>{for(const u of ups)u(t,dt,cam);},
    sun:new THREE.Vector3(...dirOf(L.az,L.el)),fill:new THREE.Vector3(...dirOf(L.fill.az,L.fill.el))};
}
function bodyName(P,b){
  if(P.id==='giant')return b.kind==='gas'?'the gas giant':'a moon';
  if(P.id==='ice')return 'the ice world';
  return b.kind==='gas'?'the giant':'the planet';
}

// a sphere of rock: an icosphere pushed in and out by a few octaves of sines (no noise library here)
function rockGeo(THREE,detail,seed,rough){
  // a UV sphere, not an icosphere: it is indexed, so its normals come out smooth
  const g=new THREE.SphereGeometry(1,detail*8,detail*6),p=g.attributes.position,v=new THREE.Vector3();
  const a=seed*1.7,b=seed*2.3,c=seed*0.9;
  for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);
    const n=Math.sin(v.x*2.1+a)*Math.sin(v.y*2.6+b)*Math.sin(v.z*2.3+c)*0.3+Math.sin(v.x*5.3+b)*Math.sin(v.y*4.7+c)*Math.sin(v.z*6.1+a)*0.12*rough+Math.sin(v.x*11+c)*Math.sin(v.y*13+a)*0.04*rough;
    v.multiplyScalar(1+n);p.setXYZ(i,v.x,v.y,v.z);}
  g.computeVertexNormals();return g;
}
const at=(az,el,d)=>dirOf(az,el).map(x=>x*d);

// ---- a comet ----
// The tails point away from the sun, not back along the comet's path: the ion tail straight and blue, the dust
// tail broader, yellower and curved. The particles stream out along them in the shader.
function comet(THREE,g,kit){
  const N=new THREE.Vector3(...at(0.42,0.02,70000));
  const nuc=new THREE.Mesh(rockGeo(THREE,4,3.1,1.4),new THREE.MeshStandardMaterial({color:0x4a443e,roughness:0.95}));
  nuc.scale.set(3200,2300,2600);nuc.position.copy(N);nuc.userData.toned=true;g.add(nuc);
  const coma=kit.sprite(0xcfe8ff,45000,0.35),core=kit.sprite(0xffffff,7000,0.7);coma.position.copy(N);core.position.copy(N);g.add(coma,core);
  const sun=new THREE.Vector3(...dirOf(2.6,0.18)),anti=sun.clone().negate();
  const p1=new THREE.Vector3(0,1,0).cross(anti).normalize(),p2=anti.clone().cross(p1).normalize();
  const n=6000,a=new Float32Array(n*4),pos=new Float32Array(n*3),rnd=kit.rnd;
  for(let i=0;i<n;i++){a[i*4]=rnd();const r=Math.sqrt(-2*Math.log(rnd()+1e-6)),t=rnd()*6.283;a[i*4+1]=r*Math.cos(t);a[i*4+2]=r*Math.sin(t);a[i*4+3]=i%3===0?1:0;}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('a',new THREE.BufferAttribute(a,4));
  const mat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
    uniforms:{uT:{value:0},uN:{value:N},uA:{value:anti},uP1:{value:p1},uP2:{value:p2},uMap:{value:kit.glowTex},uH:{value:800}},
    vertexShader:`attribute vec4 a;uniform float uT,uH;uniform vec3 uN,uA,uP1,uP2;varying vec3 vC;varying float vA;
      void main(){float ion=a.w,s=fract(a.x+uT*(ion>0.5?0.05:0.018));float L=ion>0.5?900000.:520000.;float d=s*L;
        vec3 p=uN+uA*d+uP1*(a.y*(2500.+d*(ion>0.5?0.025:0.09)))+uP2*(a.z*(2500.+d*(ion>0.5?0.025:0.05)));
        if(ion<0.5)p+=uP1*(d*d/L*0.35);
        vC=ion>0.5?vec3(0.45,0.7,1.0):vec3(1.0,0.86,0.62);vA=(1.-s)*(1.-s)*(ion>0.5?0.16:0.11)*smoothstep(0.,0.03,s);
        vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=min(36.,(ion>0.5?2200.:4200.)*(1.+s*2.)*projectionMatrix[1][1]*uH*0.5/-mv.z);}`,
    fragmentShader:`uniform sampler2D uMap;varying vec3 vC;varying float vA;void main(){float k=texture2D(uMap,gl_PointCoord).r;gl_FragColor=vec4(vC*k*vA,k*vA);}`});
  const pts=new THREE.Points(geo,mat);g.add(pts);
  return {solids:[{name:'the comet',c:N.clone(),r:4000,orbit:true}],update:(t,dt,cam,H)=>{mat.uniforms.uT.value=t;mat.uniforms.uH.value=kit.height();}};
}

// ---- stars, drawn as stars: a limb that darkens, and a boiling surface ----
function starMesh(THREE,R,col,seg){
  const m=new THREE.ShaderMaterial({uniforms:{uC:{value:new THREE.Color(col)},uT:{value:0}},
    vertexShader:`varying vec3 vN,vV,vP;void main(){vP=position;vec4 w=modelMatrix*vec4(position,1.);vN=normalize(mat3(modelMatrix)*normal);vV=normalize(cameraPosition-w.xyz);gl_Position=projectionMatrix*viewMatrix*w;}`,
    fragmentShader:`uniform vec3 uC;uniform float uT;varying vec3 vN,vV,vP;
      void main(){float mu=max(0.,dot(normalize(vN),normalize(vV)));vec3 q=normalize(vP)*9.;
        float gr=sin(q.x*3.1+uT*0.3)*sin(q.y*2.9-uT*0.2)*sin(q.z*3.3+uT*0.25)+0.5*sin(q.x*7.+q.z*5.-uT*0.4)*sin(q.y*6.3+uT*0.3);
        vec3 c=uC*(0.45+0.55*pow(mu,0.45))*(1.+0.08*gr);gl_FragColor=vec4(c*1.6,1.);}`});
  const s=new THREE.Mesh(new THREE.SphereGeometry(R,seg||64,Math.round((seg||64)*0.6)),m);return s;
}
function binary(THREE,g,kit){
  const A=new THREE.Vector3(...at(0.42,0.14,560000)),B=new THREE.Vector3(...at(0.78,0.06,420000));
  const sa=starMesh(THREE,90000,'#ffaa60',96),sb=starMesh(THREE,9000,'#cfe0ff',48);sa.position.copy(A);sb.position.copy(B);g.add(sa,sb);
  const ga=kit.sprite(0xff9a50,700000,0.7),gb=kit.sprite(0xa8c8ff,160000,0.8);ga.position.copy(A);gb.position.copy(B);g.add(ga,gb);
  // the stream: gas pulled off the giant's near side, curling round into a disc about the companion
  const n=5000,a=new Float32Array(n*2),pos=new Float32Array(n*3);for(let i=0;i<n;i++){a[i*2]=kit.rnd();a[i*2+1]=kit.rnd();}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('a',new THREE.BufferAttribute(a,2));
  const AB=B.clone().sub(A),ab=AB.clone().normalize(),side=new THREE.Vector3(0,1,0).cross(ab).normalize(),up=ab.clone().cross(side).normalize();
  const mat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
    uniforms:{uT:{value:0},uA:{value:A.clone().addScaledVector(ab,88000)},uB:{value:B},uS:{value:side},uU:{value:up},uMap:{value:kit.glowTex},uH:{value:800}},
    vertexShader:`attribute vec2 a;uniform float uT,uH;uniform vec3 uA,uB,uS,uU;varying float vA;varying vec3 vC;
      void main(){float s=fract(a.x+uT*0.02);vec3 p;
        if(a.y<0.45){vec3 m=mix(uA,uB,0.5)+uS*190000.;float t=s;p=mix(mix(uA,m,t),mix(m,uB+uS*30000.,t),t);p+=uU*(a.y-0.22)*12000.*(1.-t);vC=mix(vec3(1.,.62,.32),vec3(.8,.85,1.),t);vA=0.14;}
        else{float r=8000.+70000.*pow(a.y-0.45,0.7)*1.8,ang=a.x*6.283+uT*(0.5*60000./r);p=uB+(uS*cos(ang)+cross(uU,uS)*0.15*sin(ang)+uU*sin(ang)*0.12)*r;
          p=uB+uS*cos(ang)*r+normalize(cross(uS,uU))*sin(ang)*r+uU*(fract(a.x*37.)-0.5)*1500.;vC=mix(vec3(.85,.9,1.),vec3(1.,.7,.4),clamp((r-8000.)/80000.,0.,1.));vA=0.22;}
        vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=min(30.,3500.*projectionMatrix[1][1]*uH*0.5/-mv.z);}`,
    fragmentShader:`uniform sampler2D uMap;varying float vA;varying vec3 vC;void main(){float k=texture2D(uMap,gl_PointCoord).r;gl_FragColor=vec4(vC*k*vA,k*vA);}`});
  g.add(new THREE.Points(geo,mat));
  return {solids:[{name:'the giant star',c:A.clone(),r:110000,orbit:true},{name:'the blue star',c:B.clone(),r:20000,orbit:true}],
    update:t=>{sa.material.uniforms.uT.value=t;sb.material.uniforms.uT.value=t*2;mat.uniforms.uT.value=t;mat.uniforms.uH.value=kit.height();}};
}

// ---- an asteroid belt ----
// Instanced rock. Real belts are almost empty (the rocks are hundreds of thousands of kilometres apart); this one
// is a crowded patch of it, as the films would have it, but the rocks are the sizes rocks are.
function belt(THREE,g,kit){
  const n=900,geo=rockGeo(THREE,2,5.3,1.2),mat=new THREE.MeshStandardMaterial({color:0x8a7c6c,roughness:0.95,metalness:0.02});
  const im=new THREE.InstancedMesh(geo,mat,n),m=new THREE.Matrix4(),q=new THREE.Quaternion(),s=new THREE.Vector3(),p=new THREE.Vector3(),e=new THREE.Euler(),solids=[];
  const rnd=kit.rnd,col=new THREE.Color();
  for(let i=0;i<n;i++){
    let x,z;do{x=(rnd()-0.35)*90000;z=(rnd()-0.5)*90000;}while(x*x+z*z<3500*3500);
    const y=(rnd()+rnd()+rnd()-1.5)*2600,big=Math.pow(rnd(),5),r=15+big*1600+(i<6?2500:0);
    p.set(x,y,z);e.set(rnd()*6.3,rnd()*6.3,rnd()*6.3);q.setFromEuler(e);s.set(r*(0.8+rnd()*0.5),r*(0.55+rnd()*0.4),r*(0.7+rnd()*0.5));
    m.compose(p,q,s);im.setMatrixAt(i,m);col.setHSL(0.07+rnd()*0.04,0.1+rnd()*0.12,0.42+rnd()*0.2);im.setColorAt(i,col);
    if(r>120)solids.push({name:'a rock',c:p.clone(),r:r*1.1});}
  im.castShadow=im.receiveShadow=true;im.userData.toned=true;g.add(im);
  // and dust, catching the light
  const dn=3000,dp=new Float32Array(dn*3);for(let i=0;i<dn;i++){dp[i*3]=(rnd()-0.35)*160000;dp[i*3+1]=(rnd()+rnd()-1)*6000;dp[i*3+2]=(rnd()-0.5)*160000;}
  const dg=new THREE.BufferGeometry();dg.setAttribute('position',new THREE.BufferAttribute(dp,3));
  g.add(new THREE.Points(dg,new THREE.PointsMaterial({color:0xb8a890,size:60,sizeAttenuation:true,transparent:true,opacity:0.5,depthWrite:false})));
  // the star, far off
  const sun=kit.sprite(0xffc8a0,60000,0.9);sun.position.set(...at(0.7,0.4,850000));g.add(sun);
  return {solids};
}

// ---- a young cluster, in the nebula ----
function cluster(THREE,g,kit){
  const rnd=kit.rnd,ss=[];
  for(let i=0;i<16;i++){const az=0.2+(rnd()-0.5)*1.2,el=0.3+(rnd()-0.5)*0.5,d=300000+rnd()*300000;
    const s=kit.sprite(i%5===0?0xffe8d0:0xd8e6ff,20000+rnd()*50000,0.9);s.position.set(...at(az,el,d));g.add(s);ss.push(s);}
  const hot=kit.sprite(0xe8f0ff,130000,1);hot.position.set(...at(0.2,0.3,520000));g.add(hot);
  return {update:t=>{for(let i=0;i<ss.length;i++)ss[i].material.opacity=0.75+0.2*Math.sin(t*0.7+i*1.3);}};
}

// ---- a black hole ----
// The shadow, the disc round it (hotter inwards, brighter on the side coming towards you, streaked as its inner
// parts lap its outer ones), and the image of the far side of the disc bent up over the top and down under the
// bottom, with the thin bright ring where light has gone round once. Not a ray tracer: a picture of what one shows.
function hole(THREE,g,kit){
  const R=11000,C=new THREE.Vector3(...at(0.42,0.04,190000));
  const sh=new THREE.Mesh(new THREE.SphereGeometry(R,64,40),new THREE.MeshBasicMaterial({color:0x000000}));sh.position.copy(C);g.add(sh);
  const tilt=new THREE.Group();tilt.position.copy(C);tilt.rotation.set(-Math.PI/2+0.16,0,0.12);g.add(tilt);
  const disc=new THREE.Mesh(new THREE.RingGeometry(R*1.6,R*8,256,12),new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,
    uniforms:{uT:{value:0},uR:{value:R}},
    vertexShader:`varying vec3 vW,vL,vTw;void main(){vL=position;vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;vTw=normalize(mat3(modelMatrix)*vec3(-position.y,position.x,0.));gl_Position=projectionMatrix*viewMatrix*w;}`,
    fragmentShader:`uniform float uT,uR;varying vec3 vW,vL,vTw;
      void main(){float r=length(vL.xy)/uR,ph=atan(vL.y,vL.x);float om=1./pow(r,1.5);
        float s=0.8+0.12*sin(ph*5.+r*17.-uT*om*2.)*sin(ph*11.-r*29.-uT*om*2.6)+0.08*sin(ph*23.+r*61.-uT*om*3.)+0.1*sin(r*40.);
        vec3 tw=normalize(vTw);float dop=1.+0.55*dot(tw,normalize(cameraPosition-vW));
        float temp=pow(1.6/r,0.9);vec3 c=mix(vec3(1.,.38,.1),vec3(1.,.86,.62),clamp(temp,0.,1.));c=mix(c,vec3(.85,.9,1.),clamp(temp-1.,0.,1.));
        float a=temp*s*pow(dop,3.)*smoothstep(1.6,1.9,r)*(1.-smoothstep(5.,8.,r));gl_FragColor=vec4(c*a*1.4,a);}`}));
  tilt.add(disc);
  // the lensed far side, and the photon ring: a card that faces the camera
  const card=new THREE.Mesh(new THREE.PlaneGeometry(R*14,R*14),new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
    uniforms:{uT:{value:0},uR:{value:R},uRoll:{value:0}},
    vertexShader:`varying vec2 vP;void main(){vP=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`uniform float uT,uR,uRoll;varying vec2 vP;
      void main(){vec2 p=vP/uR;float r=length(p),a=atan(p.y,p.x)-uRoll;
        float ring=exp(-pow((r-1.06)/0.03,2.))*1.6;
        float arc=smoothstep(1.1,1.35,r)*(1.-smoothstep(1.7,2.6,r))*pow(abs(sin(a)),1.5)*(0.85+0.15*sin(r*18.-uT*1.2));
        vec3 c=vec3(1.,.62,.3)*arc*0.9+vec3(1.,.9,.75)*ring;float k=max(max(c.r,c.g),c.b);gl_FragColor=vec4(c,k);}`}));
  card.position.copy(C);g.add(card);
  const glow=kit.sprite(0xff9a50,R*30,0.35);glow.position.copy(C);g.add(glow);
  const v=new THREE.Vector3(),up=new THREE.Vector3();
  return {solids:[{name:'the black hole',c:C.clone(),r:R*9,orbit:true}],
    update:(t,dt,cam)=>{disc.material.uniforms.uT.value=t;card.material.uniforms.uT.value=t;
      if(!cam)return;card.quaternion.copy(cam.quaternion);if(card.parent&&card.parent.parent)card.quaternion.premultiply(card.parent.getWorldQuaternion(new THREE.Quaternion()).invert());
      // turn the card's arcs to lie across the disc's plane as the camera sees it
      up.set(0,0,1).applyQuaternion(tilt.getWorldQuaternion(new THREE.Quaternion()));v.copy(up).applyQuaternion(cam.quaternion.clone().invert());
      card.material.uniforms.uRoll.value=Math.atan2(v.y,v.x)-Math.PI/2;}};
}
