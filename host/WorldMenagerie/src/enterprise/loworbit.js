// ---------- Galaxy class: low orbit ----------
// Original work.
//
// "Low orbit" (the Events panel, or #low=<km>) takes the ship down from wherever she is over the nearest world to a
// few kilometres over the top of its weather: into a standard orbit if she is not in one, then the orbit's height
// eased down, fast while she is high and slower as she comes into the air, until she skims the edge of it.
//
// What a world looks like from there is not what it looks like from five hundred kilometres. The planet's own
// cloud deck (planets.js) is weather at the scale of the planet: from a few kilometres it is a smooth haze. So under
// the ship there is a deck of its own: a cap of the sphere at the clouds' height, sixty kilometres across, always
// centred under her, whose shader works out the planet's weather exactly as planets.js does (the same noise, the
// same seed, the same drift, in the planet's own turning frame) and then breaks it up into cloud systems a few
// kilometres across, lit by the sun and darker in their bases. Because it is computed in the planet's frame, not
// the ship's, the clouds stay over the ground and the ship passes over them. Its edge fades into the planet's own
// clouds, so where the cap ends nothing shows.
//
// The cap is drawn only while the ship is within thirty kilometres of the air's top, and costs nothing otherwise.
import {NOISE} from './planets.js';

export function lowOrbit(W){
  const {THREE,SYS,ROOT,animHooks}=W,S=W.flight,F=W.fx,V=()=>new THREE.Vector3();
  // the cap: a polar grid of the unit sphere round +y, out to ALPHA radians; scaled to the cloud height and turned
  // to sit under the ship every frame
  const RINGS=48,SEGS=96;
  const geo=(()=>{const pos=[],idx=[];
    for(let i=0;i<=RINGS;i++){const a=Math.pow(i/RINGS,1.6);for(let j=0;j<=SEGS;j++){const b=j/SEGS*Math.PI*2;pos.push(a*Math.cos(b),0,a*Math.sin(b));}}
    for(let i=0;i<RINGS;i++)for(let j=0;j<SEGS;j++){const a=i*(SEGS+1)+j,b=a+SEGS+1;idx.push(a,a+1,b,a+1,b+1,b);}   // wound to face out from the world
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);return g;})();
  const uni={uSun:{value:V()},uSeed:{value:0},uT:{value:0},uK:{value:1},uR:{value:1},uAlpha:{value:0.1},uC:{value:V()},uQ:{value:new THREE.Quaternion()},
    uInv:{value:new THREE.Matrix3()},uFade:{value:0}};
  const mat=new THREE.ShaderMaterial({uniforms:uni,transparent:true,depthWrite:false,
    // the grid is bent onto the sphere here: a point at (a cos b, 0, a sin b) is ALPHA a radians from the pole
    vertexShader:`uniform float uR,uAlpha;uniform vec4 uQ;uniform vec3 uC;varying vec3 vO,vW;varying float vE;
      vec3 rot(vec4 q,vec3 v){return v+2.*cross(q.xyz,cross(q.xyz,v)+q.w*v);}
      void main(){float a=length(position.xz),th=a*uAlpha;vec2 d=a>0.?position.xz/a:vec2(1.,0.);
        vec3 s=vec3(sin(th)*d.x,cos(th),sin(th)*d.y);vec3 w=uC+rot(uQ,s)*uR;vW=w;vE=a;vO=rot(uQ,s);
        gl_Position=projectionMatrix*viewMatrix*vec4(w,1.);}`,
    fragmentShader:`uniform vec3 uSun,uC;uniform float uSeed,uT,uK,uR,uFade;uniform mat3 uInv;varying vec3 vO,vW;varying float vE;${NOISE}
      void main(){
        // the planet's own weather, in its turning frame, as planets.js has it
        vec3 o=normalize(uInv*vO),p=o*2.2+uSeed;
        vec3 q=vec3(fbm(p+vec3(0.,0.,uT*0.004),3),fbm(p+vec3(5.2,1.3,2.8),2),0.);
        float c=fbm(p+q*1.6+vec3(uT*0.003,0.,0.),5);c=smoothstep(0.02,0.5,c)*uK;c*=1.-0.6*smoothstep(0.7,0.95,abs(o.y));
        // broken up into cloud systems a few kilometres across, and those into cells
        vec3 h=o*uR/5200.+uSeed*3.;float d=fbm(h+q*0.6,4),e=snoise(h*3.7);
        float a=smoothstep(0.26,0.72,c*1.1+d*0.38+e*0.05-0.06);
        vec3 n=normalize(vO),v=normalize(cameraPosition-vW);float l=dot(n,uSun),day=smoothstep(-0.08,0.25,l);
        float lit=max(0.,l)*0.92+0.08*day,base=smoothstep(-0.3,0.5,d+e*0.2);
        vec3 col=mix(vec3(1.,.62,.42),vec3(1.),smoothstep(0.,0.3,l))*lit*mix(vec3(.74,.8,.92),vec3(1.04),base);
        // its edge is let go into the planet's own clouds
        a*=(1.-smoothstep(0.62,1.,vE))*uFade;
        gl_FragColor=vec4(col,a*(0.2+0.8*day));}`});
  const cap=new THREE.Mesh(geo,mat);cap.frustumCulled=false;cap.userData.noWire=true;cap.raycast=()=>{};cap.visible=false;cap.renderOrder=1;W.scene.add(cap);

  // the world under the ship: the solid record, its mesh (for its turn and its clouds' uniforms) and its height
  const wc=V(),up=V(),Y=new THREE.Vector3(0,1,0),mq=new THREE.Matrix4();
  function under(){
    const pl=W.herePlace&&W.herePlace();if(!pl||!pl.group.visible)return null;let best=null;
    for(const s of pl.solids){if(!s.orbit||s.station)continue;SYS.localToWorld(wc.copy(s.c));const h=wc.distanceTo(ROOT.position)-s.r;if(!best||h<best.h)best={s,h,c:wc.clone()};}
    if(!best)return null;
    const g=pl.group.children.find(o=>o.userData&&o.userData.spinner&&o.position.distanceToSquared(best.s.c)<1);
    best.g=g;best.clouds=g&&g.userData.clouds;return best;
  }
  let cur=null,curT=0;
  animHooks.push(now=>{
    if(now-curT>500){curT=now;cur=under();}
    const b=cur;
    // the top of the air is six per cent of the radius up (places.js's outer shell); within thirty kilometres of it
    const top=b?b.s.r*0.06:0,show=!!(b&&b.clouds&&!S.warp&&ROOT.visible&&b.h<top+30000);
    cap.visible=show;if(!show)return;
    const cu=b.clouds.material.uniforms,R=b.s.r*1.0086;
    SYS.localToWorld(uni.uC.value.copy(b.s.c));
    up.copy(ROOT.position).sub(uni.uC.value).normalize();uni.uQ.value.setFromUnitVectors(Y,up);
    // sixty kilometres across, or out to the horizon from where the ship is if that is nearer
    const hz=Math.sqrt(2*R*Math.max(500,b.h))+20000;uni.uAlpha.value=Math.min(60000,hz)/R;
    uni.uR.value=R;uni.uSun.value.copy(cu.uSun.value);uni.uSeed.value=cu.uSeed.value;uni.uT.value=cu.uT.value;uni.uK.value=cu.uK.value;
    // the world's turn, from the world into the frame its clouds are drawn in
    b.clouds.updateWorldMatrix(true,false);mq.extractRotation(b.clouds.matrixWorld).invert();uni.uInv.value.setFromMatrix4(mq);
    uni.uFade.value=Math.max(0,Math.min(1,1-(b.h-top-20000)/10000));
  });

  // ---- going down ----
  let descent=null;
  W.lowOrbit=()=>{
    const b=W.orbitable&&W.orbitable();if(!b){F.note&&F.note('Nothing near enough to orbit.');return;}
    if(!S.on)W.startFlight();
    if(!S.orbit)dispatchEvent(new KeyboardEvent('keydown',{key:'o'}));
    if(!S.orbit)return;
    descent={want:b.r*1.052};F.note&&F.note('Taking her down to the top of '+b.name+'\'s air.');
  };
  animHooks.push(()=>{
    if(!descent)return;if(!S.on||!S.orbit||S.warp){descent=null;return;}
    const o=S.orbit,c=o.b.c,d=ROOT.position.distanceTo(c),left=d-descent.want;
    // fast while high, easing into the air; the orbit's own steering brings her down to its height
    o.h=Math.max(descent.want,d-Math.max(400,left*0.5));
    W.setThrottle(left>60000?1:left>15000?0.6:0.3);
    if(left<300){o.h=descent.want;descent=null;F.note&&F.note('Low orbit: '+Math.round((o.h-o.b.r)/1000)+' km over '+o.b.name+', skimming the top of the air.');}
  });
  // #low=<km>: put her there at once, in orbit over the nearest world at that height (for tests and screenshots)
  {const h=new URLSearchParams(location.hash.slice(1));
   if(h.has('low'))setTimeout(()=>{const b=W.nearest&&W.nearest();if(!b)return;if(!S.on)W.startFlight();
     // over the day side, a little towards where she came in; the place is moved to her rather than she to it, so
     // the floating origin has nothing to do
     const km=+(h.get('low')||9),up=W.sun.clone().multiplyScalar(0.85).addScaledVector(ROOT.position.clone().sub(b.c).normalize(),0.5).normalize();
     SYS.position.add(ROOT.position.clone().addScaledVector(up,-(b.r+km*1000)).sub(b.c));SYS.updateMatrixWorld(true);
     // level, flying along the orbit (east, as it were)
     const east=new THREE.Vector3(0,1,0).cross(up);if(east.lengthSq()<1e-6)east.set(1,0,0);east.normalize();
     const m=new THREE.Matrix4().makeBasis(east,up,east.clone().cross(up));ROOT.quaternion.setFromRotationMatrix(m);
     S.vel.copy(east).multiplyScalar(S.v||1000);
     if(!S.orbit)dispatchEvent(new KeyboardEvent('keydown',{key:'o'}));},+(h.get('lowt')||2.5)*1000);}
  return {state:()=>({cap:cap.visible,descent:!!descent})};
}
