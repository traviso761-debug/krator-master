// ---------- glow layer: soft additive point sprites over every light source ----------
await stage('glow');
section('glow',()=>{
scene.updateMatrixWorld(true);const wp=new THREE.Vector3();
const movesOrSkip=o=>{for(let q=o;q;q=q.parent)if(q.userData.life||q.userData.noGlow)return true;return false;};
scene.traverse(o=>{if(o.isMesh&&!o.isInstancedMesh&&(o.material===glowM||o.userData.glowColor)&&!movesOrSkip(o)){o.getWorldPosition(wp);const sc=Math.max(o.scale.x,o.scale.y,o.scale.z);const c=o.userData.glowColor||[1,0.83,0.3];glowSched[glowPts.length/7]=o.userData.sched===undefined?1:o.userData.sched;glowPush(wp.x,wp.y,wp.z,c[0],c[1],c[2],o.userData.glowSize||Math.min(4+sc*1.2,14),o.userData.lightT);}});
const n=glowPts.length/7;if(!n)return;
const pos=new Float32Array(n*3),colr=new Float32Array(n*3),sz=new Float32Array(n),sch=new Float32Array(n),glt=new Float32Array(n*3).fill(-1);
for(let i=0;i<n;i++){const t=glowT[i];if(t){glt[i*3]=t[0];glt[i*3+1]=t[1];glt[i*3+2]=t[2];}}
for(let i=0;i<n;i++){pos[i*3]=glowPts[i*7];pos[i*3+1]=glowPts[i*7+1];pos[i*3+2]=glowPts[i*7+2];colr[i*3]=glowPts[i*7+3];colr[i*3+1]=glowPts[i*7+4];colr[i*3+2]=glowPts[i*7+5];sz[i]=glowPts[i*7+6];sch[i]=glowSched[i]===undefined?1:glowSched[i];}
const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.BufferAttribute(pos,3));gg.setAttribute('color',new THREE.BufferAttribute(colr,3));gg.setAttribute('psize',new THREE.BufferAttribute(sz,1));gg.setAttribute('sched',new THREE.BufferAttribute(sch,1));gg.setAttribute('izLightT',new THREE.BufferAttribute(glt,3));
const glowTex=(()=>{const cv=document.createElement('canvas');cv.width=cv.height=64;const g=cv.getContext('2d');const gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(0.18,'rgba(255,255,255,0.75)');gr.addColorStop(0.5,'rgba(255,255,255,0.18)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);return new THREE.CanvasTexture(cv);})();
const gm=new THREE.ShaderMaterial({uniforms:{map:{value:glowTex},izHour:ENV.izHour},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
  vertexShader:`attribute float psize;attribute vec3 color;attribute float sched;attribute vec3 izLightT;uniform float izHour;varying vec3 vC;varying float vA;
    ${GLSL_LIT}
    float ss(float a,float b,float x){return smoothstep(a,b,x);}
    void main(){float h=izHour;float night=1.0-ss(5.5,7.2,h)+ss(17.2,18.8,h);float f=1.0;
      if(izLightT.x>0.0)f=izLitAt(h,izLightT);
      else if(sched>0.5&&sched<1.5)f=0.35+0.65*night;
      else if(sched<2.5&&sched>1.5)f=ss(7.7,8.3,h)*(1.0-ss(21.7,22.3,h))*(0.4+0.6*night)+0.1;
      else if(sched<3.5&&sched>2.5)f=ss(17.3,19.2,h)*(1.0-ss(22.0,24.0,h));
      else if(sched>3.5)f=ss(16.8,17.2,h)*(1.0-ss(21.8,22.2,h));
      vec4 mv=modelViewMatrix*vec4(position,1.0);float d=-mv.z;gl_PointSize=clamp(psize*560.0/d*(0.6+0.4*f),2.0,160.0);vA=exp(-d*0.0022)*f;vC=color;gl_Position=projectionMatrix*mv;}`,
  fragmentShader:`uniform sampler2D map;varying vec3 vC;varying float vA;void main(){float a=texture2D(map,gl_PointCoord).a;gl_FragColor=vec4(vC*a*vA*1.7,a*vA);}`});
const pts=new THREE.Points(gg,gm);pts.frustumCulled=false;scene.add(pts);ctx.glow=n;ctx.fx=Object.assign(ctx.fx||{},{glow:pts});
});
