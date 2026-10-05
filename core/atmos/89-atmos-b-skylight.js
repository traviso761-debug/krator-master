// ================================================================= ATMOS - skylight: the build's own sky as the light on every standard material
// ATMOS.skylight({renderer, sky, scene, ground, key}) captures `sky` (a scene holding only the sky - dome, sun, giant, stars,
// drawn about the origin, as the 21-sky.js lineage's skyScene is) into a small cube map, prefilters it with three.js's
// PMREMGenerator (r128 core, no addon) and sets it as scene.environment. Every MeshStandardMaterial then reflects the
// world's actual sky: metal and glass show the giant and the sun-side glow, rough stone and wood get a sky-coloured sheen
// at grazing angles instead of reading wet and black between the sun's highlights.
// WHEN: the first frame, then whenever the host's hour moves PRESETS.skylight.stepH hours or key() returns something new
// (an eclipse, the air pressure), at most once every `every` frames. A capture is six tiny renders plus the prefilter.
// DIFFUSE: r128 adds the map's irradiance on top of the hemisphere and ambient lights a build was tuned on, so by default
// (diffuse 0) the map feeds the SPECULAR term only and the tuned diffuse balance is untouched. PRESETS.skylight.diffuse is
// compiled into the standard material chunk: set it before the first frame (1 = physically the sky's own fill).
// GROUND: the lower half of the capture is ground() (a THREE.Color, linear: the host's hemisphere ground colour times its
// intensity, say) times groundK, so walls and the undersides of eaves reflect soil rather than the dome's under-horizon paint.
// The capture renders with the sky as the screen sees it (the target's encoding is the renderer's output encoding), and
// it leaves renderer.info's counts as they were, so a build's draw-call budget does not see it.
// Godot: WorldEnvironment builds this from its Sky resource itself ([G native]); keep for the preview.
(function(){const A=ATMOS;
 A.skylight=function(o){const T=A.T,P=A.PRESETS.skylight,r=o.renderer,sky=o.sky,scene=o.scene||A.h.scene;
  // the diffuse share: one literal in the shared chunk, before any standard material compiles
  const CH=T.ShaderChunk,re=/iblIrradiance\s*\+=\s*getLightProbeIndirectIrradiance\(/;
  if(CH.lights_fragment_maps.indexOf('atmos skylight')<0){
   if(re.test(CH.lights_fragment_maps))CH.lights_fragment_maps='// atmos skylight: diffuse '+A.glf(P.diffuse)+'\n'+CH.lights_fragment_maps.replace(re,'iblIrradiance += '+A.glf(P.diffuse)+' * getLightProbeIndirectIrradiance(');
   else A.err('skylight: no irradiance line in lights_fragment_maps (not r128?); the map lights the diffuse term too');}
  const rt=new T.WebGLCubeRenderTarget(P.size,{format:T.RGBAFormat,type:T.UnsignedByteType,encoding:r.outputEncoding,generateMipmaps:false,minFilter:T.LinearFilter,magFilter:T.LinearFilter});
  const cam=new T.CubeCamera(1,1e5,rt),pm=new T.PMREMGenerator(r);pm.compileCubemapShader();
  // r128's prefilter reads a cube map with x negated, the convention of a cube map loaded from six images; a cube a
  // CubeCamera rendered is not mirrored, so unpatched every reflection shows the sky left-right swapped (measured: the
  // giant's disc reflected at -x). three.js r130 added flipEnvMap for this; here the generator's own shader is unflipped
  const cs=pm._cubemapShader,flip=/vec3\(\s*-\s*vOutputDirection\.x\s*,\s*vOutputDirection\.yz\s*\)/;
  if(cs&&flip.test(cs.fragmentShader)){cs.fragmentShader=cs.fragmentShader.replace(flip,'vOutputDirection');cs.needsUpdate=true;}
  else A.err('skylight: the prefilter cube shader is not r128\'s; check that reflections are not mirrored');
  const gMat=new T.MeshBasicMaterial({color:0,side:T.BackSide,depthTest:false,depthWrite:false,fog:false});
  const gnd=new T.Mesh(new T.SphereGeometry(50,24,8,0,Math.PI*2,Math.PI/2,Math.PI/2),gMat);gnd.renderOrder=-5;gnd.name='atmos:skylightGround';
  const S=A.skyEnv={target:null,captures:0,hour:null,key:null,age:1e9,
   capture(){const c=o.ground?o.ground():null,ri=r.info.render,keep=[ri.calls,ri.triangles,ri.points,ri.lines],ac=r.autoClear;
    if(c){gMat.color.copy(c).multiplyScalar(P.groundK);sky.add(gnd);}
    r.autoClear=true;cam.update(r,sky);r.autoClear=ac;if(c)sky.remove(gnd);
    const out=pm.fromCubemap(rt.texture);if(S.target)S.target.dispose();S.target=out;scene.environment=out.texture;
    ri.calls=keep[0];ri.triangles=keep[1];ri.points=keep[2];ri.lines=keep[3];S.captures++;A.stats.skylight=S.captures;}};
  // the specular share: a standard material's envMapIntensity scales the map's whole contribution
  if(P.specular!==1)scene.traverse(m=>{const ms=m.material?(Array.isArray(m.material)?m.material:[m.material]):[];for(const x of ms)if(x.isMeshStandardMaterial&&!x.envMap)x.envMapIntensity=P.specular;});
  A.hook((t,hour)=>{S.age++;const k=o.key?String(o.key()):'';let dh=S.hour==null?99:Math.abs(hour-S.hour);dh=Math.min(dh,24-dh);
   if(S.age>=P.every&&(dh>=P.stepH||k!==S.key)){S.hour=hour;S.key=k;S.age=0;S.capture();}});
  return S;};
})();
