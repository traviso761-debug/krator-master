// ================================================================= HOST — HEAT: shimmer over hot ground (a screen-space refraction)
// The owner's: "a heat blur, Godot friendly", over the tube's lava stream and the caldera's lake. While a station's heat is
// in reach of the camera (HEAT.near), the scene renders into an offscreen target (its colour and its depth: Godot's
// hint_screen_texture and hint_depth_texture), that target is drawn to the screen, and the sheets over the heat are drawn
// on top, each re-reading the frame at an offset that rises and wavers (SCREEN_UV + offset), the offset fading to nothing at
// a sheet's edges, with height and with distance, so a sheet never shows as itself; a sheet behind the scene (by the depth
// target) draws nothing. Out of reach the scene renders straight to the screen as always (and keeps its antialiasing).
// (The screen cannot simply be copied: an antialiased default framebuffer cannot be read into a texture in WebGL.)
const HEAT=(function(){const scene2=new THREE.Scene(),U={uScreen:{value:null},uDepth:{value:null},uRes:{value:new THREE.Vector2(1,1)},uT:{value:0}};let rt=null,W=0,H=0,on=false;
 // the colour target is encoded as the screen is (sRGB, tone-mapped: three r128 does both into a target whose texture says
 // sRGB, and the kit's raw shaders write the same raw values they write to the screen), so the screen quad and the sheets
 // pass its values through untouched
 const OUT='';
 const quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.ShaderMaterial({depthTest:false,depthWrite:false,toneMapped:false,uniforms:{uScreen:U.uScreen},
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}',
  fragmentShader:'uniform sampler2D uScreen;varying vec2 vUv;void main(){gl_FragColor=texture2D(uScreen,vUv);'+OUT+'}'}));
 quad.frustumCulled=false;const qs=new THREE.Scene();qs.add(quad);const qc=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
 const mat=amp=>new THREE.ShaderMaterial({depthWrite:false,depthTest:false,toneMapped:false,side:THREE.DoubleSide,
  uniforms:{uScreen:U.uScreen,uDepth:U.uDepth,uRes:U.uRes,uT:U.uT,uAmp:{value:amp},uFall:{value:.035}},
  vertexShader:'attribute float aK;varying float vK;varying vec3 vP;void main(){vK=aK;vec4 wp=modelMatrix*vec4(position,1.0);vP=wp.xyz;gl_Position=projectionMatrix*viewMatrix*wp;}',
  // aK: how much heat at this vertex (0 at the sheet's edges); the offset in pixels, rising (y - t) and wavering, smaller far off
  fragmentShader:'uniform sampler2D uScreen,uDepth;uniform vec2 uRes;uniform float uT,uAmp,uFall;varying float vK;varying vec3 vP;'+
   'void main(){vec2 uv0=gl_FragCoord.xy/uRes;if(gl_FragCoord.z>texture2D(uDepth,uv0).r)discard;'+   // behind the scene: nothing
   ' float d=length(cameraPosition-vP),k=vK*uAmp/(1.0+d*uFall);'+
   ' float a=sin(vP.x*1.9+sin(vP.z*1.3)*1.5+vP.y*2.4-uT*5.1)+0.6*sin(vP.z*3.7-vP.y*3.1-uT*7.3+vP.x*0.7);'+
   ' float b=sin(vP.z*2.1+sin(vP.x*1.1)*1.7+vP.y*2.9-uT*6.2)+0.6*sin(vP.x*3.3-vP.y*2.6-uT*8.1);'+
   ' gl_FragColor=texture2D(uScreen,uv0+vec2(a,b)*k/uRes);'+OUT+'}'});
 function ensure(){const s=renderer.getDrawingBufferSize(new THREE.Vector2()),w=Math.floor(s.x),h=Math.floor(s.y);if(rt&&w===W&&h===H)return;
  if(rt){rt.dispose();rt.depthTexture.dispose();}
  rt=new THREE.WebGLRenderTarget(w,h,{type:THREE.UnsignedByteType,encoding:THREE.sRGBEncoding,minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,depthBuffer:true});
  rt.depthTexture=new THREE.DepthTexture(w,h);rt.depthTexture.type=THREE.UnsignedIntType;
  U.uScreen.value=rt.texture;U.uDepth.value=rt.depthTexture;U.uRes.value.set(w,h);W=w;H=h;}
 const H_={
  // a sheet: geometry with an aK attribute (the heat at each vertex); amp the shimmer's strength in pixels close by, fall
  // how fast it fades with distance (per metre)
  sheet(g,amp,fall){const m=new THREE.Mesh(g,mat(amp||6));if(fall!=null)m.material.uniforms.uFall.value=fall;m.frustumCulled=false;m.userData.probeSkip=true;scene2.add(m);on=true;return m;},
  // the station says when its heat is in reach of the camera
  near:()=>true,
  // the frame: straight to the screen, or (heat in reach) through the target, the screen quad and the sheets
  render(scene,camera,dt){U.uT.value+=dt||.016;if(!on||!H_.near(camera.position)){renderer.render(scene,camera);H_.active=false;return;}
   ensure();renderer.setRenderTarget(rt);renderer.render(scene,camera);renderer.setRenderTarget(null);
   const ac=renderer.autoClear;renderer.render(qs,qc);renderer.autoClear=false;renderer.render(scene2,camera);renderer.autoClear=ac;H_.active=true;},
  active:false,scene:scene2,U};
 return H_;})();
