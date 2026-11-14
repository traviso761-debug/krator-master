// ---------- going to warp, for every ship page that does ----------
// Original work. Two pieces any ship page can use:
//
//   starSmear   the star field smeared away from the point ahead, the way a long exposure from a moving car
//               smears street lights: every star drawn as a line from where it is back towards the point the
//               ship is flying at, the line's length a share of its angle from that point. Stars dead ahead hardly
//               move; stars abeam streak furthest; it is done in the vertex shader from the stars' own positions,
//               so it costs one draw of a few thousand lines and nothing on the CPU. It hangs under the star field
//               itself, so it goes wherever the page moves the stars (the Enterprise carries them with the camera).
//   flashScreen a flash over the whole view, blue-white, for the moment of the jump: the page's own element, so a
//               photo leaves it out.
export function starSmear(THREE,stars){
  const sg=stars.geometry,n=sg.attributes.position.count,P=sg.attributes.position.array,Cc=sg.attributes.color?sg.attributes.color.array:null;
  const pos=new Float32Array(n*6),col=new Float32Array(n*6),end=new Float32Array(n*2);
  for(let i=0;i<n;i++){for(let k=0;k<3;k++){pos[i*6+k]=pos[i*6+3+k]=P[i*3+k];col[i*6+k]=col[i*6+3+k]=Cc?Cc[i*3+k]:0.9;}end[i*2+1]=1;}
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setAttribute('aEnd',new THREE.BufferAttribute(end,1));
  const uni={uF:{value:new THREE.Vector3(1,0,0)},uK:{value:0},uA:{value:0}};
  const m=new THREE.ShaderMaterial({uniforms:uni,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false,
    vertexShader:`attribute float aEnd;attribute vec3 color;uniform vec3 uF;uniform float uK,uA;varying vec3 vC;
      void main(){float L=length(position);vec3 d=position/L;float c=clamp(dot(d,uF),-1.,1.),th=acos(c);
        vec3 pp=d-uF*c;float pl=length(pp);pp=pl>1e-5?pp/pl:vec3(0.,1.,0.);
        float t2=th*(1.-uK*aEnd);vec3 p=(uF*cos(t2)+pp*sin(t2))*L;
        // the head as bright as the star, the tail fading out; the stars nearly ahead stay points
        vC=color*uA*(1.-0.9*aEnd)*(0.35+0.65*smoothstep(0.05,0.9,th));
        gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
    fragmentShader:`varying vec3 vC;void main(){gl_FragColor=vec4(vC,1.);}`});
  const L=new THREE.LineSegments(g,m);L.frustumCulled=false;L.userData.noWire=true;L.visible=false;L.raycast=()=>{};stars.add(L);
  const qi=new THREE.Quaternion();
  return {
    // k: how far the tails reach back towards the point ahead (0 none, 1 all the way); a: brightness;
    // fwdWorld: the way the ship is flying, in the world
    set(k,a,fwdWorld){L.visible=k>0.002&&a>0.01;if(!L.visible)return;uni.uK.value=Math.min(0.95,k);uni.uA.value=a;
      stars.getWorldQuaternion(qi).invert();uni.uF.value.copy(fwdWorld).applyQuaternion(qi).normalize();},
    line:L};
}

let flashEl=null;
export function flashScreen(strength,colour){
  if(!flashEl){flashEl=document.createElement('div');
    flashEl.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:3;opacity:0;mix-blend-mode:screen;transition:opacity 0s';
    document.body.appendChild(flashEl);}
  const c=colour||'207,228,255';
  flashEl.style.background=`radial-gradient(ellipse at 50% 50%,rgba(255,255,255,1) 0%,rgba(${c},.85) 22%,rgba(${c},.25) 60%,rgba(${c},0) 100%)`;
  flashEl.style.transition='opacity 0s';flashEl.style.opacity=String(Math.min(1,strength==null?0.9:strength));
  // the next frame, let it go: quick in, slower out
  requestAnimationFrame(()=>requestAnimationFrame(()=>{flashEl.style.transition='opacity .9s ease-out';flashEl.style.opacity='0';}));
}
