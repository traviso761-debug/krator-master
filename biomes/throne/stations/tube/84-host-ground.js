// ================================================================= HOST — the tube's mesh, the surface, the skylights' shafts
// THE TUBE: one swept mesh per tube (the main and the side passage): the floor strip across it (sampled from floorRel, so
// the kit's plants sit on it) and the arch of the walls and roof (TUBEX), ring by ring every 1.5 m. Where the roof fell in
// (the skylights) and where the passage leaves the tube the mesh has holes. Its material is the library's rock, TRIPLANAR on
// the walls (Godot: uv1_triplanar) and planar on the floor, with per-vertex weights: wet and mossy near the skylights, mineral
// crusts on the walls, glazed and glowing in the hot reach (dull orange by day and night: it is hot, not lit).
// THE SURFACE: the old flow's top over the tube, a band ~1.2 km wide, lit by its own sun shading (the scene's directional
// light is off in the cave), its skylight holes cut by a signed distance per vertex. THE SHAFTS: the pit wall from each hole
// down to the tube's roof.
REGISTER({name:TUBE.name+' (an old tube, ~1.4 km)',x:TUBE.P(560)[0],z:TUBE.P(560)[1],y:TUBE.floor(560)-4,r:760,h:30,tube:true});
REGISTER({name:SIDE.name,x:SIDE.P(95)[0],z:SIDE.P(95)[1],y:SIDE.floor(95)-3,r:110,h:16,side:true});
{const u=(HOT.u0+TUBE.L)/2,p=TUBE.P(u);REGISTER({name:HOT.name,x:p[0],z:p[1],y:TUBE.floor(u)-4,r:(TUBE.L-HOT.u0)/2+20,h:24,hot:true});}
SKY.forEach(S=>REGISTER({name:S.name,x:S.x,z:S.z,y:TUBE.floor(S.u)-3,r:S.r*1.6,h:surfH(S.x,S.z)-TUBE.floor(S.u)+8,sky:S.i}));

// ---------------------------------------------------------------- the materials
const LIBT=k=>{if(typeof KMAT==='undefined'||KMAT.mode!=='lib')return null;const P=KMAT.packed('throne','ground.'+k);if(!P)return null;const t=KMAT.textures(P,{aniso:8}).map;t.wrapS=t.wrapT=THREE.RepeatWrapping;return{t,k:1/P.scale[0]};};
const TT={lava:LIBT('lava'),cliff:LIBT('cliff'),wet:LIBT('rockwet'),veins:LIBT('veins'),lichen:LIBT('lichenrock'),moss:LIBT('moss3')};
const HAS_LIB=Object.values(TT).every(Boolean);
const TUBEU={uNight:{value:0}};
const MAT_TUBE=new THREE.MeshLambertMaterial({color:0xffffff,vertexColors:true,side:THREE.DoubleSide});
MAT_TUBE.onBeforeCompile=sh=>{sh.uniforms.uNight=TUBEU.uNight;if(HAS_LIB)for(const k in TT){sh.uniforms['uT_'+k]={value:TT[k].t};}
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec4 aW;varying vec4 vW;varying vec3 vGWP,vGN;')
  .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvW=aW;vGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vGN=normal;');
 // aW: x wet/moss (near a skylight), y mineral crust, z hot (glazed, glowing), w floor (1) or wall (0)
 let decl='uniform float uNight;varying vec4 vW;varying vec3 vGWP,vGN;',body;
 if(HAS_LIB){decl+='uniform sampler2D '+Object.keys(TT).map(k=>'uT_'+k).join(',')+';'+
   'vec3 _tri(sampler2D t,vec3 p,vec3 n,float k){vec3 w=pow(abs(n),vec3(4.0));w/=w.x+w.y+w.z;return pow(texture2D(t,p.zy*k).rgb*w.x+texture2D(t,p.xz*k).rgb*w.y+texture2D(t,p.xy*k).rgb*w.z,vec3(2.2));}';
  const K=k=>TT[k].k.toFixed(4);
  body='{vec3 n=normalize(vGN),p=vGWP;vec3 wall=_tri(uT_cliff,p,n,'+K('cliff')+');wall=mix(wall,_tri(uT_lichen,p,n,'+K('lichen')+'),vW.y*0.8);'+
   'wall=mix(wall,_tri(uT_wet,p,n,'+K('wet')+'),vW.x*0.7);wall=mix(wall,_tri(uT_moss,p,n,'+K('moss')+'),vW.x*vW.x*0.55*smoothstep(0.2,0.7,n.y));'+
   'vec3 flo=pow(texture2D(uT_lava,p.xz*'+K('lava')+').rgb,vec3(2.2));flo=mix(flo,pow(texture2D(uT_moss,p.xz*'+K('moss')+').rgb,vec3(2.2)),vW.x*vW.x*0.6);'+
   'vec3 c=mix(wall,flo,vW.w);vec3 hv=_tri(uT_veins,p,n,'+K('veins')+');c=mix(c,hv,vW.z*0.7);_E_hot=hv;'+
   'diffuseColor.rgb*=c*1.9;}';}
 else body='{_E_hot=vec3(0.9,0.3,0.05);}';
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+decl)
  .replace('#include <map_fragment>','#include <map_fragment>\nvec3 _E_hot=vec3(0.0);'+body)
  // the hot reach glows by its own heat: the veins' orange, and a dull red over the glazed rock near the floor
  .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n totalEmissiveRadiance+=vW.z*(max(_E_hot*smoothstep(0.05,0.25,_E_hot.r-_E_hot.b)*1.7,vec3(0.0))+vec3(0.35,0.06,0.01)*vW.z)*(0.8+0.2*uNight);');};
_onLight.push(m=>{TUBEU.uNight.value=m==='night'?1:0;});

// ---------------------------------------------------------------- the tube meshes
// hole tests: a skylight (the roof above half its height, within the hole's radius widened downward); the passage's mouth
// (the main tube's wall where the passage leaves it); the passage's first metres inside the main tube
function inSkyHole(x,z,v,H){if(v<H*.45)return false;for(const S of SKY){const d=Math.hypot(x-S.x,z-S.z);if(d<skyR(S,Math.atan2(z-S.z,x-S.x))*1.22)return true;}return false;}
function inside(T,x,y,z,k){const a=T.near(x,z);if(a.u<0||a.u>T.L)return false;const f=T.floor(a.u);return Math.abs(a.l)<T.W(a.u)*k&&y>f-1&&y<f+roofAt(T,a.u,a.l)*k;}
const TUBESTATS={tris:0,holes:0};
function tubeMesh(T){const du=1.5,NR=Math.floor(T.L/du)+1,MA=44,NF=16,NV=MA+NF,pos=new Float32Array(NR*NV*3),col=new Float32Array(NR*NV*3),wa=new Float32Array(NR*NV*4),hole=new Uint8Array(NR*NV);
 for(let r=0;r<NR;r++){const u=Math.min(T.L,r*du),p=T.P(u),t=T.tan(u),n=[-t[1],t[0]],f=T.floor(u),hk=T===TUBE?hotK(u):0;
  let wetK=0;if(T===TUBE)for(const S of SKY)wetK=Math.max(wetK,smooth(70,10,Math.abs(u-S.u)));
  for(let k=0;k<NV;k++){let x,y,z,isFloor=0,v=0,H=T.H(u);
   if(k<MA){const a=k/(MA-1)*Math.PI,X=TUBEX(T,u,a);v=X.v;x=p[0]+n[0]*X.l;z=p[1]+n[1]*X.l;y=f+X.v+(1-Math.sin(a))*.6;}
   else{const l=mix(-T.W(u)*1.08,T.W(u)*1.08,(k-MA)/(NF-1));x=p[0]+n[0]*l;z=p[1]+n[1]*l;y=f+floorRel(T,u,l,x,z);isFloor=1;}
   const i=r*NV+k;pos[i*3]=x;pos[i*3+1]=y;pos[i*3+2]=z;
   // the rock's tint: dark basalt, a little warmer low down, greyer up the roof; crusts in patches; glazed black-red when hot
   const crust=smooth(.55,.75,fbm(x*.05,z*.05+y*.08,171,2))*(1-isFloor)*(1-hk),g=.85+.3*fbm(x*.11,z*.11,172,2);
   col[i*3]=.42*g;col[i*3+1]=.39*g;col[i*3+2]=.37*g;
   wa[i*4]=wetK*(isFloor?1:smooth(H*.9,0,v)*.8+.2);wa[i*4+1]=crust;wa[i*4+2]=hk*(isFloor?1:smooth(H*.38,0,v)*(.55+.45*smooth(.4,.7,fbm(x*.04,z*.04+y*.1,177,2))));wa[i*4+3]=isFloor;
   if(k<MA&&T===TUBE&&inSkyHole(x,z,v,H))hole[i]=1;
   if(T===TUBE&&k<MA&&inside(SIDE,x,y,z,.97))hole[i]=1;
   if(T===SIDE&&inside(TUBE,x,y,z,.985))hole[i]=1;}}
 const idx=[];const quad=(a,b,c,d)=>{if(hole[a]||hole[b]||hole[c]||hole[d]){TUBESTATS.holes++;return;}idx.push(a,b,c,b,d,c);};
 for(let r=0;r<NR-1;r++){const A=r*NV,B=(r+1)*NV;for(let k=0;k<MA-1;k++)quad(A+k,A+k+1,B+k,B+k+1);for(let k=MA;k<NV-1;k++)quad(A+k,A+k+1,B+k,B+k+1);}
 // the ends: the upstream end of the main tube a choke of breakdown (a rough plug), the passage's end the same; the
 // downstream end the sump (closed by 86's glow)
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setAttribute('aW',new THREE.BufferAttribute(wa,4));
 g.setIndex(idx);g.computeVertexNormals();TUBESTATS.tris+=idx.length/3;
 const m=new THREE.Mesh(g,MAT_TUBE);m.userData.probeSkip=true;m.userData.inspectLabel=T.name;m.frustumCulled=false;scene.add(m);return m;}
const TUBEMESH=TUBES.map(tubeMesh);
// the end plugs: a rough dome of rock closing each end (the main tube's upstream choke, the passage's choke, the sump)
function endPlug(T,u,dir){const p=T.P(u),t=T.tan(u),f=T.floor(u),W=T.W(u)*1.15,H=T.H(u)*1.1;const g=new THREE.SphereGeometry(1,20,12,0,TAU,0,Math.PI/2);g.rotateX(dir*Math.PI/2);
 const P=g.attributes.position;for(let i=0;i<P.count;i++){const x=P.getX(i),y=P.getY(i),z=P.getZ(i),k=1+.18*(fbm(x*2+u,y*2,173,2)-.5)*2;P.setXYZ(i,x*k,y*k,z*k);}g.computeVertexNormals();
 const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({color:0x2e2a28,side:THREE.DoubleSide}));m.scale.set(W,H,W*.8);m.position.set(p[0],f,p[1]);m.rotation.y=-Math.atan2(t[1],t[0])+Math.PI/2;
 m.userData.probeSkip=true;m.userData.inspectLabel='A choke of breakdown (the tube is blocked)';scene.add(m);return m;}
endPlug(TUBE,2,1);endPlug(SIDE,SIDE.L-2,-1);

// ---------------------------------------------------------------- the surface
// its own sun (N.L with the sun's direction; the scene's directional light is off), the library's lava and lichen, the hole
// cut where the signed distance to a skylight's rim (per vertex) is below zero
const SURFU={uSun:{value:new THREE.Vector3(...SUN_POS).normalize()},uDay:{value:1},uLava:{value:TT.lava&&TT.lava.t},uLich:{value:TT.lichen&&TT.lichen.t}};
const MAT_SURF=new THREE.ShaderMaterial({uniforms:SURFU,side:THREE.DoubleSide,
 vertexShader:'attribute float aHole;varying float vH;varying vec3 vP,vN;void main(){vH=aHole;vP=(modelMatrix*vec4(position,1.0)).xyz;vN=normal;gl_Position=projectionMatrix*viewMatrix*vec4(vP,1.0);}',
 fragmentShader:'uniform vec3 uSun;uniform float uDay;uniform sampler2D uLava,uLich;varying float vH;varying vec3 vP,vN;'+
  'void main(){if(vH<0.0)discard;vec3 n=normalize(vN);float l=max(dot(n,uSun),0.0);'+
  (HAS_LIB?'vec3 a=pow(texture2D(uLava,vP.xz*'+TT.lava.k.toFixed(4)+').rgb,vec3(2.2));vec3 b=pow(texture2D(uLich,vP.xz*'+TT.lichen.k.toFixed(4)+').rgb,vec3(2.2));vec3 c=mix(a,b,0.35)*1.6;':'vec3 c=vec3(0.18,0.16,0.15);')+
  'vec3 lit=c*(0.25+1.15*l)*mix(vec3(0.12,0.14,0.2),vec3(1.0,0.95,0.88),uDay);'+
  'gl_FragColor=vec4(pow(lit,vec3(1.0/2.2)),1.0);}'});
_onLight.push(m=>{SURFU.uDay.value=m==='night'?0:1;});
const SURFMESH=(function(){const d=TUBE.d,n=TUBE.n,c=TUBE.P(TUBE.L/2),LA=TUBE.L/2+500,LB=650,DS=4,NA=Math.ceil(2*LA/DS)+1,NB=Math.ceil(2*LB/DS)+1;
 const pos=new Float32Array(NA*NB*3),hl=new Float32Array(NA*NB);
 for(let j=0;j<NB;j++)for(let i=0;i<NA;i++){const a=-LA+i*DS,b=-LB+j*DS,x=c[0]+d[0]*a+n[0]*b,z=c[1]+d[1]*a+n[1]*b,k=j*NA+i;
  let sd=1e9;for(const S of SKY){const dd=Math.hypot(x-S.x,z-S.z);sd=Math.min(sd,dd-skyR(S,Math.atan2(z-S.z,x-S.x)));}
  // the rim slumps into the hole a little
  const y=surfH(x,z)-2.5*smooth(8,0,sd);pos[k*3]=x;pos[k*3+1]=y;pos[k*3+2]=z;hl[k]=sd;}
 const idx=[];for(let j=0;j<NB-1;j++)for(let i=0;i<NA-1;i++){const a=j*NA+i,b=a+1,c2=a+NA,e=c2+1;idx.push(a,c2,b,b,c2,e);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('aHole',new THREE.BufferAttribute(hl,1));g.setIndex(idx);g.computeVertexNormals();
 const m=new THREE.Mesh(g,MAT_SURF);m.userData.probeSkip=true;m.userData.inspectLabel='The old flow\'s surface (over the tube)';m.frustumCulled=false;scene.add(m);return m;})();
// THE SHAFTS: each hole's pit wall, from the surface's rim down to the tube's roof, widening a little downward (a bell)
const SHAFTS=SKY.map(S=>{const NAa=64,NRr=10,pos=[],col=[],idx=[],f=TUBE.floor(S.u),H=TUBE.H(S.u),yb=f+H*.42;
 for(let r=0;r<NRr;r++){const t=r/(NRr-1);for(let k=0;k<NAa;k++){const a=k/NAa*TAU,R0=skyR(S,a),x0=S.x+Math.cos(a)*R0,z0=S.z+Math.sin(a)*R0,yt=surfH(x0,z0)-2.5;
  let R=R0*(1+.24*t)+.6*(fbm(a*2+S.i,t*4,174,2)-.5),px=S.x+Math.cos(a)*R,pz=S.z+Math.sin(a)*R,y=mix(yt,yb,t);
  // the shaft's lower part kept inside the tube's walls, and its foot meeting the roof where it still stands
  {const c=TUBE.near(px,pz),Wm=TUBE.W(c.u)*.93,k=smooth(.25,.75,t);if(Math.abs(c.l)>Wm){const q=TUBE.P(c.u),tt=TUBE.tan(c.u),l=mix(c.l,Math.sign(c.l)*Wm,k);px=mix(px,q[0]-tt[1]*l,k);pz=mix(pz,q[1]+tt[0]*l,k);}
   const c2=TUBE.near(px,pz),yr=TUBE.floor(c2.u)+roofAt(TUBE,c2.u,c2.l)+.4;if(t>.5)y=mix(y,Math.min(y,yr),smooth(.5,1,t));}
  pos.push(px,y,pz);const g=.75+.3*fbm(a*3,t*5+S.i,175,2);col.push(.4*g,.37*g,.35*g);}}
 for(let r=0;r<NRr-1;r++)for(let k=0;k<NAa;k++){const k1=(k+1)%NAa,a=r*NAa+k,b=r*NAa+k1,c=(r+1)*NAa+k,d=(r+1)*NAa+k1;idx.push(a,c,b,b,c,d);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
 const wa=new Float32Array(pos.length/3*4);for(let i=0;i<wa.length;i+=4){wa[i]=.9;wa[i+1]=.3;}g.setAttribute('aW',new THREE.BufferAttribute(wa,4));
 g.setIndex(idx);g.computeVertexNormals();const m=new THREE.Mesh(g,MAT_TUBE);m.userData.probeSkip=true;m.userData.inspectLabel=S.name;scene.add(m);return m;});
// the fog: the cave's dark while the camera is in the rock's shadow, the open air's thin haze when it is above the surface
const FOG_CAVE={day:new THREE.Color(0x0b0b0d),night:new THREE.Color(0x050608)},FOG_OPEN={day:new THREE.Color(0xc4bdb0),night:new THREE.Color(0x1c2028)};
TICKS.push(()=>{const c=camera.position,out=c.y>surfH(c.x,c.z)-3,m=LIGHT_MODE==='night'?'night':'day';
 scene.fog.color.copy(out?FOG_OPEN[m]:FOG_CAVE[m]);scene.fog.density=out?.00025:.009;});
_mark('ground');
