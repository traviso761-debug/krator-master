// ================================================================= CORE — a lava flow's surface on a three.js page (KLAVA.surface)
// [G shader] The moving surface of a KLAVA sim (core/terrain/46-core-lava.js): one mesh on the sim's lattice, each vertex at
// the ground plus the lava's thickness, hidden (dropped under the ground, discarded) where there is none. Drawn with
// core/atmos's lava chunk (fx/89-atmos-fx-lava.js: ATMOS.lavaGLSL, the plates, cracks, facets and overturns) when the page
// takes it, its HEAT per vertex from the sim's temperature (sim.heat: the glow), the crust closing and the cracks narrowing
// as it cools; the crust slides with the flow's mean velocity. Without the chunk: vertex colours from the heat.
//
//   const M = KLAVA.surface(sim, o)  -> THREE.Mesh (added to nothing: the page adds it and registers it)
//      o: {name, crust: a texture (the library's lava crust for the grain), sun: [x, y, z], lift (m over the ground: .05),
//          scale (1: the plates' size, times this), crack (1), heat (1: times the glow), preset ('lava'), night: {value},
//          ponds: false (leave a pond's cells undrawn: the page draws its lake itself)}
//   M.update()   rewrites the vertices from the sim (call it after the sim steps; a few times a second is plenty)
//   M.userData.lava  the sim
// Godot: an ArrayMesh rewritten from the same arrays (or a vertex shader reading KLAVA.gpu's texture), the lava
// .gdshaderinc of core/atmos's chunk (core/atmos/GODOT.md, "Lava").
(function(root){
 const K=root.KLAVA||(root.KLAVA={});   /* the data half may load after this one */
 K.surface=function(sim,o){o=o||{};const T=root.THREE,A=root.ATMOS,nx=sim.nx,nz=sim.nz,N=nx*nz,lift=o.lift==null?.05:o.lift;
  const pos=new Float32Array(N*3),heat=new Float32Array(N),show=new Float32Array(N);
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=j*nx+i;pos[k*3]=sim.x0+i*sim.cs;pos[k*3+2]=sim.z0+j*sim.cs;}
  const idx=new Uint32Array((nx-1)*(nz-1)*6);let q=0;
  for(let j=0;j<nz-1;j++)for(let i=0;i<nx-1;i++){const a=j*nx+i,b=a+1,c=a+nx,d=c+1;idx[q++]=a;idx[q++]=c;idx[q++]=b;idx[q++]=b;idx[q++]=c;idx[q++]=d;}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('aHeat',new T.BufferAttribute(heat,1));
  g.setAttribute('aShow',new T.BufferAttribute(show,1));g.setIndex(new T.BufferAttribute(idx,1));
  let mat;const flow=new T.Vector2(0,0);
  if(A&&A.lavaGLSL&&A.PRESETS&&A.PRESETS[o.preset||'lava']){
   const f=v=>A.glf(v),P0=A.PRESETS[o.preset||'lava'],s=o.scale==null?1:o.scale,kc=o.crack==null?1:o.crack;
   const P=Object.assign({},P0,{plates:Object.assign({},P0.plates,{cell:P0.plates.cell*s,warp:P0.plates.warp*s,crack:P0.plates.crack.map(v=>v*kc),eruptCrack:P0.plates.eruptCrack*kc}),
    facets:Object.assign({},P0.facets,{cell:P0.facets.cell*s,warp:P0.facets.warp*s})});
   const sun=o.sun||[.45,.72,-.52];
   mat=new T.ShaderMaterial({fog:true,uniforms:T.UniformsUtils.merge([T.UniformsLib.fog,{uCrust:{value:o.crust||null},uSunDir:{value:new T.Vector3(sun[0],sun[1],sun[2]).normalize()},
     uC:{value:new T.Vector2(sim.x0,sim.z0)},uFlow:{value:flow},uHeat:{value:o.heat==null?1:o.heat}}]),
    vertexShader:['#include <fog_pars_vertex>','attribute float aHeat,aShow;varying float vHeat,vShow;varying vec3 vWP,vN;',
     'void main(){vHeat=aHeat;vShow=aShow;vec4 wp=modelMatrix*vec4(position,1.0);vWP=wp.xyz;vN=normalize(mat3(modelMatrix)*normal);',
     ' vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n'),
    fragmentShader:['#include <fog_pars_fragment>','uniform float uLavaT,uNight,uHeat;uniform sampler2D uCrust;uniform vec3 uSunDir;uniform vec2 uC,uFlow;varying float vHeat,vShow;varying vec3 vWP,vN;',
     A.lavaGLSL(P),
     'void main(){if(vShow<0.5)discard;vec2 lp=vWP.xz-uC;float hk;',
     ' vec3 tex='+(o.crust?'texture2D(uCrust,lp*0.11).rgb;':'vec3(0.5);'),
     /* the heat: the glow (heatK) and the cracks (erupt) both fall as the lava cools; the night raises it, as the lake's */
     ' float h=clamp(vHeat,0.0,1.0),er=clamp(h*1.3-0.35,0.0,1.0);',
     ' vec3 col=lavaSurface(lp,uLavaT,er,uNight,uFlow,normalize(vN),uSunDir,cameraPosition,vWP,tex,uHeat*(0.08+1.3*h*h),hk);',
     ' gl_FragColor=vec4(col,1.0);','#include <fog_fragment>','}'].join('\n')});
   mat.uniforms.uLavaT=A.U.time;mat.uniforms.uNight=o.night||A.U.night;
   if(A.h&&A.h.scene&&A.h.scene.fog){mat.uniforms.fogColor.value=A.h.scene.fog.color;mat.uniforms.fogDensity.value=A.h.scene.fog.density||0;}}
  else{const col=new Float32Array(N*3);g.setAttribute('color',new T.BufferAttribute(col,3));mat=new T.MeshBasicMaterial({vertexColors:true});
   mat.onBeforeCompile=sh=>{sh.vertexShader='attribute float aShow;varying float vShow;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvShow=aShow;');
    sh.fragmentShader='varying float vShow;\n'+sh.fragmentShader.replace('void main() {','void main() {\nif(vShow<0.5)discard;');};}
  const M=new T.Mesh(g,mat);M.name=o.name||'lava flow';M.frustumCulled=false;M.userData.lava=sim;M.userData.inspectLabel=M.name;
  const noPond=o.ponds===false;
  M.update=function(){const hm=sim.hmin,cs=g.attributes.color,po=sim.pondOf;let wx=0,wz=0,wv=0;
   for(let k=0;k<N;k++){const hh=sim.h[k],on=hh>hm&&!(noPond&&po[k]>=0);show[k]=on?1:0;pos[k*3+1]=on?sim.z[k]+hh+lift:sim.z[k]-1.5;const e=sim.heat(k);heat[k]=e;
    if(on){wx+=sim.vx[k]*hh;wz+=sim.vz[k]*hh;wv+=hh;}
    if(cs){const c=cs.array;c[k*3]=.08+.92*e;c[k*3+1]=.05+.5*e*e;c[k*3+2]=.04+.1*e*e*e;}}
   flow.set(wv>0?wx/wv:0,wv>0?wz/wv:0);
   g.attributes.position.needsUpdate=g.attributes.aHeat.needsUpdate=g.attributes.aShow.needsUpdate=true;if(cs)cs.needsUpdate=true;
   g.computeVertexNormals();g.computeBoundingSphere();return M;};
  return M.update();};
})(typeof globalThis!=='undefined'?globalThis:this);
