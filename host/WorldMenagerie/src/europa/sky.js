// ---------- the sky over Europa ----------
// The engine draws a graded dome and calls it sky, which is right for a planet with air and wrong here.
// What is actually overhead:
//
//   nothing            no atmosphere at all, so the sky is black at noon and the stars do not twinkle
//   Jupiter            twenty-four times the width of the Moon from Earth, always in the same place in the
//                      sky because Europa is tidally locked - it does not rise or set, it just hangs there
//                      and goes through its phases. This is the single strangest fact about living here.
//   the sun            a twenty-fifth of the light, small and hard, with shadows that have no fill in them
//   the other moons    Io and Ganymede, bright enough to read by when they are up
//
// Jupiter is drawn as a banded sphere with vertex colours. There are no textures anywhere in this project
// and there is no reason to start now: the bands are what you see and they are bands.
import { mkRng } from '../core/rng.js';

export function sky(api){
  const {THREE,C,ctx,scene,animHooks,camera,ENV}=api;
  // Jupiter and the moons are lit by the sun, from wherever it is: they have phases. From the station Jupiter
  // goes from full at local midnight (the sun behind you, lighting its face) to new at local noon, and the
  // light it throws on the ice goes with it.
  const LIT_VS='varying vec3 vC;varying vec3 vN;varying vec3 vV;void main(){\n#ifdef USE_COLOR\nvC=color;\n#else\nvC=vec3(1.0);\n#endif\nvN=normalize(mat3(modelMatrix)*normal);vec4 w=modelMatrix*vec4(position,1.0);vV=normalize(cameraPosition-w.xyz);gl_Position=projectionMatrix*viewMatrix*w;}';
  const LIT_FS='uniform vec3 uSun;uniform vec3 uTint;uniform float uLimb;varying vec3 vC;varying vec3 vN;varying vec3 vV;void main(){vec3 n=normalize(vN);float lit=smoothstep(-0.04,0.22,dot(n,uSun));float limb=pow(max(0.0,dot(n,normalize(vV))),uLimb);gl_FragColor=vec4(vC*uTint*(0.025+0.975*lit)*(0.5+0.5*limb),1.0);}';
  const litMat=(tint,limb,vc)=>new THREE.ShaderMaterial({vertexColors:!!vc,fog:false,vertexShader:LIT_VS,fragmentShader:LIT_FS,
    uniforms:{uSun:{value:new THREE.Vector3(0,1,0)},uTint:{value:new THREE.Color(tint)},uLimb:{value:limb}}});
  const lit=[];
  const K=C.space;if(!K)return;
  const R=mkRng(1610);

  // ---- the stars ----
  // Real ones: a shell of points far enough out that nothing ever gets near it, brighter towards the
  // galactic plane because that is what the sky actually looks like when there is no air in the way.
  {
    const N=K.stars||2600, D=K.far||160000;
    const pos=new Float32Array(N*3), col=new Float32Array(N*3);
    for(let i=0;i<N;i++){
      const u=R()*2-1, th=R()*Math.PI*2, s=Math.sqrt(1-u*u);
      const x=s*Math.cos(th), y=Math.abs(u)*0.85+0.04, z=s*Math.sin(th);
      pos[i*3]=x*D;pos[i*3+1]=y*D;pos[i*3+2]=z*D;
      // a band of extra stars round the plane, and a little colour in the brightest of them
      const b=(0.35+0.65*Math.pow(R(),2.2))*(1+0.5*Math.exp(-Math.pow((Math.abs(u)-0.12)/0.1,2)));
      const warm=R()<0.2;
      col[i*3]=Math.min(1,b*(warm?1.0:0.82));
      col[i*3+1]=Math.min(1,b*0.88);
      col[i*3+2]=Math.min(1,b*(warm?0.78:1.0));
    }
    const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.BufferAttribute(pos,3));
    g.setAttribute('color',new THREE.BufferAttribute(col,3));
    const pts=new THREE.Points(g,new THREE.PointsMaterial({size:K.starSize||420,vertexColors:true,
      sizeAttenuation:true,transparent:true,opacity:0.95,depthWrite:false}));
    pts.userData.noWire=true;pts.userData.noShadow=true;pts.frustumCulled=false;scene.add(pts);
  }

  // ---- Jupiter ----
  // Tidally locked means it does not move. It is drawn at a distance that keeps it behind everything and
  // sized so that it subtends the forty-odd degrees it actually does from the sub-Jovian hemisphere, which
  // is an absurd amount of sky and is the whole reason this page exists.
  {
    const D=(K.far||160000)*0.62, RAD=D*Math.tan((K.jupiterDeg||19)*Math.PI/180);
    const geo=new THREE.SphereGeometry(RAD,64,48);
    const pos=geo.attributes.position, col=[];
    const BANDS=[[0.00,'#d8c4a6'],[0.10,'#c2a88a'],[0.17,'#e0d2bc'],[0.24,'#b08f6e'],[0.31,'#d9c7ae'],
                 [0.38,'#a8815f'],[0.44,'#e6dac6'],[0.52,'#cbb497'],[0.60,'#9d7a59'],[0.68,'#dbcbb2'],
                 [0.76,'#bfa384'],[0.84,'#cbbda4'],[1.00,'#a89680']];
    const c=new THREE.Color(), tmp=new THREE.Color(), spotC=new THREE.Color(0xb4704a);
    for(let i=0;i<pos.count;i++){
      const y=pos.getY(i)/RAD;                        // -1 at the south pole, 1 at the north
      const t=Math.abs(y);
      let cl=BANDS[BANDS.length-1][1];
      for(let b=0;b<BANDS.length;b++)if(t<=BANDS[b][0]){cl=BANDS[b][1];break;}
      c.set(cl);
      // the turbulence at the band edges, and a little noise everywhere
      const n=0.94+0.06*Math.sin(y*46+pos.getX(i)/RAD*7)+0.03*Math.sin(y*113);
      tmp.copy(c).multiplyScalar(n);
      // the Great Red Spot: an oval in the southern tropics, painted in so that it goes dark with the night side
      {const dx=pos.getX(i)/RAD-0.52,dy=(y+0.30)/0.42,dz=pos.getZ(i)/RAD-0.80,e=Math.hypot(dx/0.3,dy/0.3,dz/0.3);
       if(e<1)tmp.lerp(spotC,Math.min(1,(1-e)*2.2));}
      col.push(tmp.r,tmp.g,tmp.b);
    }
    geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
    const jup=new THREE.Mesh(geo,litMat(0xffffff,0.3,true));lit.push(jup.material);
    const a=(K.jupiterAz===undefined?2.1:K.jupiterAz), el=(K.jupiterEl===undefined?0.62:K.jupiterEl);
    jup.position.set(Math.cos(a)*Math.cos(el)*D,Math.sin(el)*D,Math.sin(a)*Math.cos(el)*D);
    jup.lookAt(0,0,0);
    jup.userData.noWire=true;jup.userData.noShadow=true;jup.renderOrder=-2;jup.frustumCulled=false;
    scene.add(jup);
    ctx.details=Object.assign(ctx.details||{},{jupiter:(K.jupiterDeg||19)*2+' degrees across'});
    // the light off it: Jupiter is a real light source here, weak and reddish and from a fixed direction
    const J0=K.jupiterLight===undefined?0.35:K.jupiterLight,jd=jup.position.clone().normalize();
    const jl=new THREE.DirectionalLight(0xffd2a0,J0);
    jl.position.copy(jd).multiplyScalar(4000);scene.add(jl);
    // how much of the face we see lit: the phase angle is between the sun and us, seen from Jupiter
    animHooks.push(()=>{const sd=ENV.izSunDir.value;for(const m of lit)m.uniforms.uSun.value.copy(sd);
      const lf=(1-sd.dot(jd))/2;jl.intensity=J0*(0.08+0.92*lf);});
  }

  // ---- the sun ----
  // A small hard disc, a fifth the size it is from Earth, and only a tight glare round it: the soft halo the
  // engine draws is sunlight scattered by air, and there is none (the city file turns it off, sunGlare 0).
  {const D=(K.far||160000)*0.85;
   const tex=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');const gr=g.createRadialGradient(64,64,0,64,64,64);
     gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(0.1,'rgba(255,255,252,1)');gr.addColorStop(0.14,'rgba(255,250,240,0.35)');gr.addColorStop(0.4,'rgba(255,245,230,0.06)');gr.addColorStop(1,'rgba(255,240,220,0)');
     g.fillStyle=gr;g.fillRect(0,0,128,128);return new THREE.CanvasTexture(c);})();
   const disc=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,fog:false,depthWrite:false,transparent:true,blending:THREE.AdditiveBlending}));
   disc.scale.setScalar(D*Math.tan(0.1*Math.PI/180)*2*7);disc.userData.noWire=true;disc.frustumCulled=false;scene.add(disc);
   animHooks.push(()=>{const d=ENV.izSunDir.value;disc.position.copy(camera.position).addScaledVector(d,D);disc.visible=d.y>-0.02;});}

  // ---- the other moons ----
  {
    const D=(K.far||160000)*0.8;
    for(const [az,el,r,cl] of (K.moons||[[0.6,0.9,0.006,'#d8cbb2'],[4.4,0.44,0.004,'#cfd4d8']])){
      const s=new THREE.Mesh(new THREE.SphereGeometry(D*r,16,12),litMat(cl,0.2,false));lit.push(s.material);
      s.position.set(Math.cos(az)*Math.cos(el)*D,Math.sin(el)*D,Math.sin(az)*Math.cos(el)*D);
      s.userData.noWire=true;s.userData.noShadow=true;s.frustumCulled=false;scene.add(s);
    }
  }

  // the sky itself is not lit from below by anything, so whatever the engine's dome is doing, it should be
  // doing it very quietly
  scene.traverse(o=>{if(o.userData&&o.userData.noWire&&o.material&&o.material.fog!==undefined&&o.geometry
    &&o.geometry.type==='SphereGeometry'&&o.renderOrder===-1)o.material.fog=false;});
}
