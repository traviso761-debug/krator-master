// ================================================================= HOST — the heat: shimmer and mirage over the flat (a screen pass)
// PLAN-BOWL.md section 2: heat shimmer over the flats, mirages over the salt (the far shore floating), strongest at noon, gone
// at a cool dawn. While the heat is up and the eye is near the ground, the frame (the shared sky's pass, then the world:
// SKY.render) is drawn into an offscreen target 1.5 times the screen (its colour and depth: Godot's hint_screen_texture and
// hint_depth_texture), then to the screen through one quad that
//   SHIMMERS: re-reads the frame at an offset that rises and wavers, growing with the distance the depth says (nothing within
//             150 m, full past 2.5 km) and with nearness to the horizon, where the hot air lies along the line of sight;
//   MIRRORS:  under the horizon, where the ground is far (over 2.5 km), a band a few pixels deep shows what stands above the
//             horizon turned over (an inferior mirage: the sky's light bent up off the hot crust), so the far shore and
//             Mantis seem to float on water that is not there.
// The heat follows the hour (0 before 07:30 and after 19:30, full from 11 to 15) and fades out as the eye climbs (60 m).
// Otherwise the frame goes straight to the screen (SKY.render) and keeps its antialiasing.
const HEAT=(function(){const U={uScreen:{value:null},uDepth:{value:null},uRes:{value:new THREE.Vector2(1,1)},uT:{value:0},uK:{value:0},uHy:{value:.5},uNear:{value:1},uFar:{value:9e4},uMir:{value:.006}};
 let rt=null,W=0,H=0;const SS=1.5;
 const quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.ShaderMaterial({depthTest:false,depthWrite:false,toneMapped:false,uniforms:U,
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}',
  fragmentShader:['uniform sampler2D uScreen,uDepth;uniform vec2 uRes;uniform float uT,uK,uHy,uNear,uFar,uMir;varying vec2 vUv;',
   'float dist(vec2 uv){float d=texture2D(uDepth,uv).r;if(d>=0.99999)return 1e7;float z=d*2.0-1.0;return 2.0*uNear*uFar/(uFar+uNear-z*(uFar-uNear));}',
   'void main(){vec2 uv=vUv;float D=dist(uv),hz=exp(-abs(uv.y-uHy)*22.0);',
   ' float k=uK*smoothstep(150.0,2500.0,D)*(0.35+0.65*hz);',
   ' float a=sin(uv.y*uRes.y*0.11+uT*5.3+sin(uv.x*uRes.x*0.013+uT*1.7)*2.0)+0.5*sin(uv.y*uRes.y*0.27-uT*8.1+uv.x*uRes.x*0.031);',
   ' float b=sin(uv.x*uRes.x*0.021+uT*3.7+uv.y*uRes.y*0.05);',
   ' vec2 o=vec2(b*0.35,a)*k*2.2/uRes;vec4 c=texture2D(uScreen,uv+o);',
   ' float below=uHy-uv.y;',
   ' if(below>0.0&&below<uMir*2.0&&D>2500.0){vec2 m=vec2(uv.x,uHy+below*0.8);m+=vec2(0.0,a*1.5/uRes.y);',
   '  float w=uK*smoothstep(uMir*2.0,uMir*0.6,below)*smoothstep(2500.0,6000.0,D)*0.85;c=mix(c,texture2D(uScreen,m),w);}',
   ' gl_FragColor=c;}'].join('\n')}));
 quad.frustumCulled=false;const qs=new THREE.Scene();qs.add(quad);const qc=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
 function ensure(){const s=renderer.getDrawingBufferSize(new THREE.Vector2()),w=Math.floor(s.x*SS),h=Math.floor(s.y*SS);if(rt&&w===W&&h===H)return;
  if(rt){rt.dispose();rt.depthTexture.dispose();}
  rt=new THREE.WebGLRenderTarget(w,h,{type:THREE.UnsignedByteType,encoding:THREE.sRGBEncoding,minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,depthBuffer:true});
  rt.depthTexture=new THREE.DepthTexture(w,h);rt.depthTexture.type=THREE.UnsignedIntType;
  U.uScreen.value=rt.texture;U.uDepth.value=rt.depthTexture;U.uRes.value.set(s.x,s.y);W=w;H=h;}
 // the heat by the hour: 0 at 07:30 and 19:30, full 11:00-15:00
 const byHour=h=>smooth(7.5,11,h)*smooth(19.5,15,h);
 const _v=new THREE.Vector3();
 const H_={
  strength:1.6,   /* pixels of offset at full heat on the horizon (the owner may want more or less) */
  k(){const eye=camera.position,g=terrainH(eye.x,eye.z);return H_.strength*byHour(SKY_CLOCK.hour)*smooth(60,8,eye.y-Math.max(g,LAKE.level));},
  /* the renderer's counters are reset once a frame here (not per render call), so the probe sees the sky, the world and the quad together */
  render(dt){U.uT.value+=dt||.016;const k=H_.k();U.uK.value=k;renderer.info.autoReset=false;renderer.info.reset();
   if(k<.05||H_.off){SKY.render();H_.active=false;return;}
   ensure();
   /* the horizon's height on the screen: a point far ahead at the eye's height */
   _v.set(0,0,-1).applyQuaternion(camera.quaternion);_v.y=0;if(_v.lengthSq()<1e-6)_v.set(0,0,-1);_v.normalize().multiplyScalar(50000).add(camera.position);_v.project(camera);
   U.uHy.value=_v.y*.5+.5;U.uNear.value=camera.near;U.uFar.value=camera.far;U.uMir.value=.0045+.004*smooth(30,2,camera.position.y-terrainH(camera.position.x,camera.position.z));
   renderer.setRenderTarget(rt);SKY.render();renderer.setRenderTarget(null);
   const ac=renderer.autoClear;renderer.autoClear=true;renderer.render(qs,qc);renderer.autoClear=ac;H_.active=true;},
  active:false,off:/[?&#]heat=0/.test(location.search+location.hash),U};
 return H_;})();
