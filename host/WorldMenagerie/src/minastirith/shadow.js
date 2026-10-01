// ---------- the Mountains of Shadow, and the Darkness out of Mordor ----------
// Fan work from Tolkien; every shape and colour here is this project's own.
//
// From the walls the east is closed by the Ephel Duath, the fence of Mordor: a long dark range across the whole
// horizon beyond the Anduin, with the notch of the Morgul Vale in it. And in the siege the sky is not a sky: a
// roof of brown cloud blown out of Mordor over the city, the "Darkness", lit red from underneath in the east
// where the mountain is burning, and running on west over the city and the mountain to a ragged edge low in the
// western sky, under which a band of the west is still clear - so from the Pelennor the city stands under it. It is what every picture of the siege is painted under.
//
// Neither fits in the map. The range is fifty-odd kilometres off and the camera sees twenty-four, and the cloud
// is higher and wider than the sky dome. So both are backdrops: they travel with the camera, sized to the angle
// the real thing would subtend from where it stands, and they are drawn after the sky and before everything else
// with no depth test - the land, the city and anything flying are drawn over them, always, which is what being
// fifty kilometres further away means.
//
// The range is there in peace too, grey-blue in the haze. The cloud, the red under it, the glow of the mountain
// behind the range and the darkening of the light below are the war's.
import { mkRng, makeNoise } from '../core/rng.js';

export function shadow(api){
  const {THREE,ctx,scene,camera,sky,sun,hemi,ambient,renderer,animHooks}=api;
  const WAR=ctx.warParts=ctx.warParts||[];
  const R=Math.min(camera.far*0.7,16000);            // how far out the backdrops are drawn
  const DIST=45000;                                  // how far off the range really is, due east
  const NZ=makeNoise(mkRng(1741));

  // ---- the Ephel Duath ----
  // A band across the eastern horizon: its top is the skyline of the range at the angle the real peaks would
  // stand at, and it runs well down below the horizon so the land always meets it. The range runs north-south,
  // so north and south of east it is further away and lower. `k` in the shader is where on the band a vertex
  // is: 0 at the foot, 0.35 at the horizon, 1 on the skyline.
  const skyline=th=>{
    const u=th*9;
    // a sawtooth skyline: broad massifs, sharp peaks standing out of them, and teeth on the ridges
    let h=1500+1100*NZ.fbm(u*0.9+3,1.7)+900*Math.pow(NZ.vn(u*3.1,7.3),3)+260*NZ.vn(u*11,2.1)+90*NZ.vn(u*37,5.5);
    h*=0.85+0.3*Math.pow(Math.abs(Math.sin(u*0.37+0.6)),0.5);
    // the Morgul Vale: the gap the road goes up to Minas Morgul, a little south of east
    h-=900*Math.exp(-Math.pow((th-0.24)/0.035,2));
    return Math.max(300,h);};
  {
    const N=720,A0=-1.35,A1=1.35,P=[],K=[],IDX=[];
    for(let i=0;i<=N;i++){
      const th=A0+(A1-A0)*i/N,c=Math.cos(th),s=Math.sin(th),dist=Math.min(DIST/Math.max(0.2,c),200000);
      const top=skyline(th)/dist;
      for(const [ang,k] of [[-0.14,0],[0,0.35],[top,1]]){P.push(c*R,Math.tan(ang)*R,s*R);K.push(k);}
      if(i<N){const a=i*3;for(let r=0;r<2;r++)IDX.push(a+r,a+3+r,a+4+r,a+r,a+4+r,a+1+r);}}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));
    g.setAttribute('k',new THREE.Float32BufferAttribute(K,1));g.setIndex(IDX);
    var rangeM=new THREE.ShaderMaterial({uniforms:{uHaze:{value:new THREE.Color()},uRock:{value:new THREE.Color(0x4a5262)},uRim:{value:new THREE.Color(0x7d8698)}},
      vertexShader:'attribute float k;varying float vK;void main(){vK=k;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
      // the foot is the land beyond the river, darker than the haze over it; the rock over that; and the rim
      fragmentShader:'uniform vec3 uHaze;uniform vec3 uRock;uniform vec3 uRim;varying float vK;void main(){vec3 foot=mix(uHaze,uRock,0.55);vec3 c=mix(foot,uRock,smoothstep(0.3,0.7,vK));c=mix(c,uRim,smoothstep(0.92,1.0,vK)*0.6);gl_FragColor=vec4(c,1.0);}',
      depthTest:false,depthWrite:false,fog:false,side:THREE.DoubleSide});
    var range=new THREE.Mesh(g,rangeM);range.renderOrder=-0.6;range.frustumCulled=false;
    range.userData.noWire=true;range.userData.noShadow=true;range.userData.noFingerprint=true;scene.add(range);
  }

  // ---- the mountain burning, behind the range ----
  // Orodruin is far beyond the fence and cannot be seen from the city; its fire can, on the underside of the
  // cloud and as a red glow standing up behind the skyline a little north of east.
  const glowM=new THREE.ShaderMaterial({uniforms:{uA:{value:1}},depthTest:false,depthWrite:false,fog:false,transparent:false,
    blending:THREE.CustomBlending,blendSrc:THREE.OneFactor,blendDst:THREE.OneFactor,
    vertexShader:'varying vec2 vU;void main(){vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader:'uniform float uA;varying vec2 vU;void main(){vec2 d=(vU-0.5)*vec2(1.0,2.2);float r=length(d);float a=exp(-r*r*9.0)*uA;gl_FragColor=vec4(vec3(0.75,0.18,0.05)*a,1.0);}'});
  const glow=new THREE.Mesh(new THREE.PlaneGeometry(R*0.9,R*0.35),glowM);
  {const th=-0.12;glow.position.set(Math.cos(th)*R*0.99,R*0.02,Math.sin(th)*R*0.99);glow.lookAt(0,R*0.02,0);}
  glow.renderOrder=-0.7;glow.frustumCulled=false;glow.userData.noWire=true;glow.userData.noFingerprint=true;

  // ---- the Darkness ----
  // A shell over the camera, shaded as a cloud deck: each direction is projected onto a plane overhead, so the
  // billows shrink in perspective towards the horizon the way a real deck does. Cover comes from the east and
  // runs past the zenith to a ragged edge in the western sky, lit from the west on that edge; it drifts west,
  // slowly; and low in the east it is lit red from underneath.
  const pallM=new THREE.ShaderMaterial({
    uniforms:{uT:{value:0},uDark:{value:new THREE.Color(0x1d1916)},uLit:{value:new THREE.Color(0x6b5a4a)},uGlow:{value:new THREE.Color(0x8a2a12)},uEdge:{value:-0.8}},
    depthTest:false,depthWrite:false,fog:false,transparent:false,side:THREE.BackSide,
    blending:THREE.CustomBlending,blendSrc:THREE.SrcAlphaFactor,blendDst:THREE.OneMinusSrcAlphaFactor,
    vertexShader:'varying vec3 vD;void main(){vD=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader:`uniform float uT;uniform vec3 uDark;uniform vec3 uLit;uniform vec3 uGlow;uniform float uEdge;varying vec3 vD;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float vn(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.0-2.0*f);
        return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),u.x),mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),u.x),u.y);}
      float fbm(vec2 p){float s=0.0,a=0.5;for(int k=0;k<4;k++){s+=a*vn(p);p=p*2.03+vec2(1.7,9.2);a*=0.5;}return s;}
      float fbm3(vec2 p){float s=0.0,a=0.5;for(int k=0;k<3;k++){s+=a*vn(p);p=p*2.03+vec2(1.7,9.2);a*=0.5;}return s;}
      void main(){
        vec3 d=normalize(vD);
        if(d.y<-0.03)discard;
        vec2 p=d.xz/(d.y+0.1);
        vec2 q=p*0.9+vec2(-uT*0.006,uT*0.0015);
        float n=fbm(q),n2=fbm3(q*2.3+n*1.8+vec2(3.1,1.3));
        float east=d.x+(n-0.5)*0.55+(n2-0.5)*0.35;
        float cover=smoothstep(uEdge-0.18,uEdge+0.12,east);
        vec3 c=mix(uDark,uDark*1.7,n2);
        float rim=cover*(1.0-cover)*4.0;
        c=mix(c,uLit,rim*0.75*smoothstep(0.35,0.7,n2));
        c=mix(c,uGlow,exp(-max(d.y,0.0)*7.0)*smoothstep(-0.2,0.8,d.x)*0.8*(0.6+0.8*n));
        gl_FragColor=vec4(c,cover*0.97);
      }`});
  const pall=new THREE.Mesh(new THREE.SphereGeometry(R*0.95,48,24,0,Math.PI*2,0,Math.PI*0.54),pallM);
  pall.renderOrder=-0.8;pall.frustumCulled=false;pall.userData.noWire=true;pall.userData.noShadow=true;pall.userData.noFingerprint=true;

  const back=new THREE.Group();back.add(pall,glow);scene.add(back);WAR.push(back);

  // ---- the light under it ----
  // Brown and short: the sun through the cloud is a smudge, and the fog and the horizon go the colour of it.
  // lerpSky sets all of this every frame (01-scene), so this only ever adjusts what it has just set.
  const brown=new THREE.Color(0x4d4238),dusky=new THREE.Color(0x2a241f),hazeC=new THREE.Color();
  const peaceRock=new THREE.Color(0x4a5262),warRock=new THREE.Color(0x1f1a18),peaceRim=new THREE.Color(0x7d8698),warRim=new THREE.Color(0x5a2616);
  let t0=performance.now();
  animHooks.push(now=>{
    const war=ctx.war!==false;
    // the backdrops go where the camera goes; their foot drops a little as the camera climbs, the way the real
    // range's foot sinks below the horizon from higher up
    const cy=camera.position.y;
    for(const o of [range,back])o.position.set(camera.position.x,cy-cy*R/DIST,camera.position.z);
    back.position.y=cy;
    if(war){
      pallM.uniforms.uT.value=(now-t0)/1000;
      sun.intensity*=0.5;hemi.intensity*=0.78;ambient.intensity*=0.9;
      scene.fog.color.lerp(brown,0.45);renderer.setClearColor(scene.fog.color);
      const U=sky.material.uniforms;U.hor.value.lerp(brown,0.4);U.top.value.lerp(dusky,0.35);U.sunA.value*=0.15;}
    hazeC.copy(scene.fog.color);rangeM.uniforms.uHaze.value.copy(hazeC);
    rangeM.uniforms.uRock.value.copy(war?warRock:peaceRock);rangeM.uniforms.uRim.value.copy(war?warRim:peaceRim);
    glowM.uniforms.uA.value=0.55+0.15*Math.sin(now*0.0007)+0.08*Math.sin(now*0.0031);
  });
  ctx.details=Object.assign(ctx.details||{},{ephelDuath:'range at '+DIST/1000+' km',darkness:true});
}
