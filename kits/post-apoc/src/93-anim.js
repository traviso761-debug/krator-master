// ---------------------------------------------------------------- ANIMATION: the clock, smoke, light volumes
// Everything that moves is a pure function of the animation time t (seconds): t = seconds since load, or pinned by ?t=12.5 (screenshots) or ?anim=0 (t = 0).
// window._anim = {time(), pin(t), play(), stats()}. Cloth flutter and glow flicker live in the shaders (22-mat.js animPatch), the pool lights flicker in
// 91n-night.js, spinners turn in 90-scene.js. Nothing here moves a building vertex, so bboxes and footprints stay what the builders drew.
// SMOKE: one instanced billboard mesh (one draw call): puffs rise, drift downwind, grow and fade above every SMOKES source (stovepipe(), fire(), the two
//   big stacks). It hangs off the scene, not WORLD, and is not in any bbox or the registry.
// LIGHT VOLUMES (night): additive, depth-tested, unshadowed shells, one instanced mesh each: a cone of light under every lamp bulb, and a spill wedge out of
//   every front door (rec.front) that the evening schedule has lit (the same uWinFrac as the windows).
// This fragment runs after the first buildWorld() (92-camera.js builds it), so it builds its own pieces once at the end; later builds call animRebuild().
var ANIM_READY=false;
const ANIM={t0:performance.now(),pin:null,smoke:null,cones:null,spills:null};
{const q=new URLSearchParams(location.search);const t=parseFloat(q.get('t'));if(isFinite(t))ANIM.pin=t;if(q.get('anim')==='0')ANIM.pin=0;}
function animTime(now){return ANIM.pin!==null?ANIM.pin:(now-ANIM.t0)/1000;}
ANIMU.uTime.value=animTime(performance.now());
// ---- smoke
const SMOKE_N={stove:10,fire:10,stack:16},SMOKE_KIND={stove:0,fire:1,stack:2};
const smokeMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,fog:false,
 uniforms:{uTime:ANIMU.uTime,uCol:{value:new THREE.Color(.7,.68,.64)},uWind:{value:new THREE.Vector2(.5,-.22)}},
 vertexShader:`attribute vec4 aSrc;attribute vec3 aPuff;uniform float uTime;uniform vec2 uWind;varying vec2 vUv;varying float vA;varying float vSeed;varying float vShade;
void main(){float kind=aPuff.z;float period=(5.5+2.5*fract(sin(dot(aSrc.xyz,vec3(12.9898,78.233,37.719)))*43758.5453))*(kind>1.5?1.5:1.);float life=fract(uTime/period+aPuff.x);
 float H=kind>1.5?11.:kind>.5?5.5:4.5;float rise=life*H;float s=aPuff.y*20.;
 vec3 c=aSrc.xyz-vec3(0.,.15,0.)+vec3(uWind.x,0.,uWind.y)*rise*.6+vec3(sin(uTime*.7+s)*.3*life,rise,cos(uTime*.6+s*.65)*.3*life);
 float size=aSrc.w*2.6*(1.+life*(kind>1.5?2.8:2.2));vShade=kind>1.5?.62:kind>.5?.8:.88;vec4 mv=modelViewMatrix*vec4(c,1.);
 float a=aPuff.y*6.2832+uTime*.25*(fract(aPuff.y*3.7)-.5);mv.xy+=mat2(cos(a),sin(a),-sin(a),cos(a))*position.xy*size;
 vUv=uv;vSeed=aPuff.y;vA=smoothstep(0.,.03,life)*pow(1.-life,1.3)*(1.4-.7*life)*(kind>1.5?.6:kind>.5?.5:.45)*exp(-length(mv.xyz)*.002);gl_Position=projectionMatrix*mv;}`,
 fragmentShader:`uniform vec3 uCol;varying vec2 vUv;varying float vA;varying float vSeed;varying float vShade;
void main(){vec2 p=vUv*2.-1.;float r=dot(p,p);float n=.72+.28*sin(p.x*4.3+vSeed*41.)*sin(p.y*3.7+vSeed*17.);float a=smoothstep(1.,.1,r)*n*vA;if(a<.004)discard;gl_FragColor=vec4(uCol*vShade*(.9+.1*p.y),a);}`});
function smokeBuild(){const list=SMOKES;let n=0;for(const s of list)n+=SMOKE_N[s.kind]||6;if(!n)return null;
 const base=new THREE.PlaneGeometry(1,1);const g=new THREE.InstancedBufferGeometry();g.index=base.index;g.setAttribute('position',base.attributes.position);g.setAttribute('uv',base.attributes.uv);
 const src=new Float32Array(n*4),puff=new Float32Array(n*3);let i=0;
 for(const s of list){const m=SMOKE_N[s.kind]||6,ph=h3(s.x*.71,s.y*.37,s.z*.53);for(let k=0;k<m;k++){src.set([s.x,s.y,s.z,Math.max(.18,s.r)],i*4);puff.set([(k+ph)/m,h3(s.x+k*1.7,s.y,s.z-k*.9),SMOKE_KIND[s.kind]||0],i*3);i++;}}
 g.setAttribute('aSrc',new THREE.InstancedBufferAttribute(src,4));g.setAttribute('aPuff',new THREE.InstancedBufferAttribute(puff,3));g.instanceCount=n;
 const mesh=new THREE.Mesh(g,smokeMat);mesh.frustumCulled=false;mesh.renderOrder=4;mesh.userData.probeSkip=true;return mesh;}
// ---- light volumes
const volMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,fog:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,
 uniforms:{uNightK:ANIMU.uNightK,uWinFrac:ANIMU.uWinFrac,uTime:ANIMU.uTime},
 vertexShader:`attribute float aK;attribute vec3 aC;uniform float uWinFrac;varying float vT;varying float vF;varying float vD;varying vec3 vC;varying float vLit;
void main(){vec4 wp=modelMatrix*instanceMatrix*vec4(position,1.);vec3 n=normalize(mat3(modelMatrix*instanceMatrix)*normal);vec3 vd=cameraPosition-wp.xyz;vD=length(vd);
 vF=abs(dot(n,vd/vD));vT=uv.y;vC=aC;vLit=aK<0.?1.:step(aK,uWinFrac);gl_Position=projectionMatrix*viewMatrix*wp;}`,
 fragmentShader:`uniform float uNightK;uniform float uTime;varying float vT;varying float vF;varying float vD;varying vec3 vC;varying float vLit;
void main(){float a=pow(vF,1.2)*pow(1.-vT,1.3)*.3*uNightK*vLit*exp(-vD*.006);if(a<.002)discard;gl_FragColor=vec4(vC,a);}`});
// a cone under a lamp: apex at the bulb (y=0), open base on the ground (y=-1); uv.y runs 0 at the bulb to 1 at the ground
function volConeGeo(){const g=new THREE.CylinderGeometry(.08,1,1,18,1,true);g.translate(0,-.5,0);const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setY(i,1-uv.getY(i));return g;}
// a spill wedge out of a doorway: the door opening at z=0 (1.1 x 2.05 m), flaring to 2.6 m wide at z=3, sloping to the ground; uv.y 0 at the door, 1 at the far end
function volSpillGeo(){const P=[],U=[],I=[];const nr=[[-.55,0,0],[.55,0,0],[.55,2.05,0],[-.55,2.05,0]],fr=[[-1.3,0,3],[1.3,0,3],[1.3,.2,3],[-1.3,.2,3]];
 const quad=(a,b,c,d,ta,tb,tc,td)=>{const s=P.length/3;P.push(...a,...b,...c,...d);U.push(0,ta,1,tb,1,tc,0,td);I.push(s,s+1,s+2,s,s+2,s+3);};
 quad(nr[3],nr[2],fr[2],fr[3],0,0,1,1);quad(nr[1],fr[1],fr[2],nr[2],0,1,1,0);quad(fr[0],nr[0],nr[3],fr[3],1,0,0,1);quad(nr[0],nr[1],fr[1],fr[0],0,0,1,1);
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));g.setIndex(I);g.computeVertexNormals();return g;}
function volMesh(geo,items){if(!items.length)return null;const m=new THREE.InstancedMesh(geo,volMat,items.length);const k=new Float32Array(items.length),c=new Float32Array(items.length*3);
 items.forEach((it,i)=>{m.setMatrixAt(i,it.m);k[i]=it.k;c.set(it.c,i*3);});geo.setAttribute('aK',new THREE.InstancedBufferAttribute(k,1));geo.setAttribute('aC',new THREE.InstancedBufferAttribute(c,3));
 m.instanceMatrix.needsUpdate=true;m.frustumCulled=false;m.renderOrder=3;m.userData.probeSkip=true;return m;}
function volBuild(){const cones=[],spills=[];const _q=new THREE.Quaternion(),_y=new THREE.Vector3(0,1,0);
 for(const q of HALOS){if(q.kind!=='SphereGeometry'||q.big||q.g<q.r*.5)continue;const h=q.y-terrainH(q.x,q.z);if(h<1.4)continue;const R=clamp(h*.42,.8,2.2);   /* lamp bulbs: warm-white spheres up off the ground */
  cones.push({m:new THREE.Matrix4().compose(new THREE.Vector3(q.x,q.y-.05,q.z),_q.identity(),new THREE.Vector3(R,h-.05,R)),k:-1,c:[1,.72,.4]});}
 for(const r of REG){const f=r.front;if(!f||!f.world||f.source==='default'||!r.doorCount)continue;const w=f.world;
  spills.push({m:new THREE.Matrix4().compose(new THREE.Vector3(w.x+Math.sin(w.yaw)*.12,w.y,w.z+Math.cos(w.yaw)*.12),_q.setFromAxisAngle(_y,w.yaw),new THREE.Vector3(1,1,1)),k:h3(w.x*.29+5.1,w.y,w.z*.31-2.7)*.9,c:[1,.6,.26]});}
 return {cones:volMesh(volConeGeo(),cones),spills:volMesh(volSpillGeo(),spills)};}
// ---- (re)build with the world
function animRebuild(){if(!ANIM_READY)return;for(const k of ['smoke','cones','spills']){const o=ANIM[k];if(o){scene.remove(o);o.geometry.dispose();if(o.dispose)o.dispose();ANIM[k]=null;}}
 ANIM.smoke=smokeBuild();const v=volBuild();ANIM.cones=v.cones;ANIM.spills=v.spills;for(const k of ['smoke','cones','spills'])if(ANIM[k])scene.add(ANIM[k]);}
const _smD=new THREE.Color(.7,.68,.64),_smN=new THREE.Color(.075,.08,.1),_smK=new THREE.Color(.62,.42,.3);
FRAME_HOOKS.push((dt,now)=>{ANIMU.uTime.value=animTime(now);const k=ANIMU.uNightK.value,v=NIGHT.v;
 smokeMat.uniforms.uCol.value.copy(_smD).lerp(_smK,Math.sin(clamp(v,0,1)*PI)*.35).lerp(_smN,k);   /* pale by day, dusk-tinted, dark against the night sky */
 for(const o of [ANIM.cones,ANIM.spills])if(o)o.visible=k>.02;});
window._anim={time:()=>ANIMU.uTime.value,pin(t){ANIM.pin=t;ANIMU.uTime.value=t;},play(){ANIM.t0=performance.now()-ANIMU.uTime.value*1000;ANIM.pin=null;},
 stats:()=>({t:ANIMU.uTime.value,smokeSources:SMOKES.length,puffs:ANIM.smoke?ANIM.smoke.geometry.instanceCount:0,lampCones:ANIM.cones?ANIM.cones.count:0,doorSpills:ANIM.spills?ANIM.spills.count:0,
  winFrac:ANIMU.uWinFrac.value,clock:NIGHT.clock,cloth:Object.keys(MAT).filter(k=>MAT[k].userData.anim==='cloth').length})};
ANIM_READY=true;animRebuild();
