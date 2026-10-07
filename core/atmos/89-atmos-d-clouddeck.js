// ================================================================= ATMOS - cloud deck: a sea of cloud seen from above, one GLSL chunk and its JS twin
// The dense air of a basin pooled below a wall (the southern highlands look down on the hyperjungle's): a level deck of
// heaped billows, drifting and slowly changing shape. Built the way the wave field is (89-atmos-a-waves.js), so a game
// engine draws the same cloud: the relief is written from PRESETS.clouddeck (no baked mesh, no texture), the GLSL chunk
// is generated from the presets, and ATMOS.deckHeight / deckSlope compute the same field on the CPU (is the camera in
// the cloud? a flyer skimming the tops? the tests). core/atmos/GODOT.md, "The cloud deck", is the port.
//   THE NOISE   gradient noise (Perlin's, quintic fade, with its analytic derivative) on a lattice that repeats every
//               `lattice` cells, each corner's gradient from an INTEGER HASH of the corner (lowbias32): bit-exact in JS
//               (Math.imul), GLSL ES 3 and Godot (uint), so every engine draws the same cloud. No straight crest anywhere
//               (a sum of plane waves, the first version, left parallel lines across the deck).
//   the field   q = p + warp.amp * (nA(p), nB(p)): a second noise bends the billows, drifting its own way (`evolve`), so
//               the cloud changes shape as it goes. S = gain * sum amp*n(q) / sum amp over the billows (drifting `drift`;
//               with `puff`, each octave is billow noise 2|n| - 0.5: rounded domes, sharp creases);
//               u = clamp(0.5 + 0.5*S); the deck's top is  y - down + (up + down) * u^heap.  detail (shading only, at q)
//               adds detailAmp metres of finer noise to the slope, faded by camera distance. Slopes carry the warp's
//               Jacobian back from q to p, so the normals are the height's own.
// ONE SEAMLESS CLOCK: the shaders read atmDeckT, the module clock wrapped at PRESETS.clouddeck.period; drift and evolve
// move every octave a whole number of lattice periods per period, so the wrap is exact. A HOST: after ATMOS.init,
// ATMOS.cloudDeck({y, sun:[x,y,z], bounds}) adds the deck: a grid that follows the camera (snapped, so the billows never
// swim), thinning where the host's ground (init's `ground`) rises through it. It is recorded (A.rec 'clouddeck') for
// ATMOS.export().
// Engine-neutral at load: no browser API until cloudDeck() runs. Godot: the chunk becomes atmos_clouddeck.gdshaderinc
// ([G shader], godot/tools/atmos_clouddeck.js), the deck godot/shaders/clouddeck.gdshader, the twin krator/atmos.gd.
(function(){const A=ATMOS;
 const P0=()=>A.PRESETS.clouddeck;
 A.deckWrap=t=>{const p=P0().period;return(t%p+p)%p;};
 // lowbias32 over a lattice corner and a seed: unsigned 32-bit, the same bits as the GLSL and GDScript ports
 const hash=(x,y,s)=>{let h=(Math.imul(x,1597334677)^Math.imul(y,-482951495)^Math.imul(s,-1640531527))>>>0;
  h=(h^(h>>>16))>>>0;h=Math.imul(h,2146121005)>>>0;h=(h^(h>>>15))>>>0;h=Math.imul(h,-2073254261)>>>0;return(h^(h>>>16))>>>0;};
 // gradient noise at x (lattice units), seed s: [value, d/dx, d/dy]
 const noise=(x,y,s)=>{const m=P0().lattice-1,ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy,x0=ix&m,y0=iy&m,x1=(ix+1)&m,y1=(iy+1)&m;
  const G=(cx,cy)=>{const h=hash(cx,cy,s);return[(h&65535)/32767.5-1,(h>>>16)/32767.5-1];};
  const ga=G(x0,y0),gb=G(x1,y0),gc=G(x0,y1),gd=G(x1,y1);
  const va=ga[0]*fx+ga[1]*fy,vb=gb[0]*(fx-1)+gb[1]*fy,vc=gc[0]*fx+gc[1]*(fy-1),vd=gd[0]*(fx-1)+gd[1]*(fy-1);
  const ux=fx*fx*fx*(fx*(fx*6-15)+10),uy=fy*fy*fy*(fy*(fy*6-15)+10),dux=30*fx*fx*(fx*(fx-2)+1),duy=30*fy*fy*(fy*(fy-2)+1),k=va-vb-vc+vd;
  return[va+ux*(vb-va)+uy*(vc-va)+ux*uy*k,
   ga[0]+ux*(gb[0]-ga[0])+uy*(gc[0]-ga[0])+ux*uy*(ga[0]-gb[0]-gc[0]+gd[0])+dux*(uy*k+vb-va),
   ga[1]+ux*(gb[1]-ga[1])+uy*(gc[1]-ga[1])+ux*uy*(ga[1]-gb[1]-gc[1]+gd[1])+duy*(ux*k+vc-va)];};
 // octaves [div, amp] of cell P.cell/div at world (x,z), drifting dir (whole lattice periods per clock period), clock
 // fraction fr: [sum amp*n / sum amp, its d/dx, d/dz] in world metres; seeds from `seed0` up
 // puff: billow noise 2|n| - 0.5 (its slope 2 sign(n) dn)
 const fbm=(O,x,z,fr,dir,seed0,puff)=>{const P=P0();let s=0,sx=0,sz=0,n=0;
  O.forEach(([div,a],i)=>{const c=P.cell/div,L=P.lattice*div,v=noise(x/c-dir[0]*fr*L,z/c-dir[1]*fr*L,seed0+i),k=puff?(v[0]<0?-2:2):1;
   s+=a*(puff?2*Math.abs(v[0])-.5:v[0]);sx+=a*k*v[1]/c;sz+=a*k*v[2]/c;n+=a;});
  return[s/n,sx/n,sz/n];};
 // the warped point and the warp's Jacobian [q.x, q.z, dqx/dx, dqx/dz, dqz/dx, dqz/dz]: a slope found at q is carried
 // back to p through it
 const warp=(x,z,fr)=>{const P=P0(),W=P.warp,a=fbm([[1,1]],x,z,fr,P.evolve,W.seedA),b=fbm([[1,1]],x,z,fr,P.evolve,W.seedB);
  return[x+W.amp*a[0],z+W.amp*b[0],1+W.amp*a[1],W.amp*a[2],W.amp*b[1],1+W.amp*b[2]];};
 const back=(J,gx,gz)=>[gx*J[2]+gz*J[4],gx*J[3]+gz*J[5]];
 const span=()=>P0().up+P0().down;
 // the heaped crest u^heap (0..1) and its slope in metres per metre (0 where u is clamped)
 const heap=(J,fr)=>{const P=P0(),f=fbm(P.billows,J[0],J[1],fr,P.drift,1,P.puff),r=.5+.5*P.gain*f[0],u=Math.min(1,Math.max(1e-4,r)),
  k=r>1e-4&&r<1?span()*P.heap*Math.pow(u,P.heap-1)*.5*P.gain:0;
  return[Math.pow(u,P.heap)].concat(back(J,f[1]*k,f[2]*k));};
 A.deckHeight=(x,z,t,y)=>{const P=P0(),fr=A.deckWrap(t)/P.period;return y-P.down+span()*heap(warp(x,z,fr),fr)[0];};
 // [dh/dx, dh/dz, the crest 0..1, the detail's crest 0..1] at camera distance d
 A.deckSlope=(x,z,t,d)=>{const P=P0(),fr=A.deckWrap(t)/P.period,J=warp(x,z,fr),h=heap(J,fr),w=1-A.ss(P.fade[0],P.fade[1],d),
  D=fbm(P.detail,J[0],J[1],fr,P.drift,11,P.puff),g=back(J,D[1],D[2]);
  return[h[1]+P.detailAmp*g[0]*w,h[2]+P.detailAmp*g[1]*w,h[0],.5+.5*D[0]];};
 // THE CHUNK, written from the presets so it computes what the twin above does (GLSL ES 3: uint; three r128 compiles
 // ShaderMaterials as GLSL ES 3 on WebGL2, with highp int)
 A.deckGLSL=()=>{const P=P0(),f=A.glf,m=P.lattice-1;
  const fbmFn=(name,O,dir,seed0,puff)=>{const n=O.reduce((s,o)=>s+o[1],0);
   return'vec3 '+name+'(vec2 p,float fr){vec3 r=vec3(0.0);'+O.map(([div,a],i)=>{const c=P.cell/div,L=P.lattice*div;
    return'r+='+f(a/n)+'*atmDeckOct'+(puff?'Puff':'')+'(p,'+f(c)+',vec2('+f(dir[0]*L)+','+f(dir[1]*L)+')*fr,'+(seed0+i)+'u);';}).join('')+'return r;}';};
  return['uniform float atmDeckT;',
   'uint atmDeckHash(uvec2 c,uint s){uint h=(c.x*1597334677u)^(c.y*3812015801u)^(s*2654435769u);h^=h>>16u;h*=2146121005u;h^=h>>15u;h*=2221713035u;h^=h>>16u;return h;}',
   'vec2 atmDeckGrad(ivec2 c,uint s){uint h=atmDeckHash(uvec2(c),s);return vec2(float(h&65535u),float(h>>16u))/32767.5-1.0;}',
   'vec3 atmDeckNoise(vec2 x,uint s){vec2 fl=floor(x);ivec2 i=ivec2(fl);vec2 f=x-fl;ivec2 a=i&ivec2('+m+'),b=(i+ivec2(1))&ivec2('+m+');',
   ' vec2 ga=atmDeckGrad(a,s),gb=atmDeckGrad(ivec2(b.x,a.y),s),gc=atmDeckGrad(ivec2(a.x,b.y),s),gd=atmDeckGrad(b,s);',
   ' float va=dot(ga,f),vb=dot(gb,f-vec2(1.0,0.0)),vc=dot(gc,f-vec2(0.0,1.0)),vd=dot(gd,f-vec2(1.0,1.0)),k=va-vb-vc+vd;',
   ' vec2 u=f*f*f*(f*(f*6.0-15.0)+10.0),du=30.0*f*f*(f*(f-2.0)+1.0);',
   ' return vec3(va+u.x*(vb-va)+u.y*(vc-va)+u.x*u.y*k,ga+u.x*(gb-ga)+u.y*(gc-ga)+u.x*u.y*(ga-gb-gc+gd)+du*(u.yx*k+vec2(vb,vc)-va));}',
   // one octave of cell c at world p, shifted by `off` cells: (value, d/dx, d/dz) in world metres
   'vec3 atmDeckOct(vec2 p,float c,vec2 off,uint s){vec3 n=atmDeckNoise(p/c-off,s);return vec3(n.x,n.yz/c);}',
   // the same as billow noise, 2|n| - 0.5: rounded domes with sharp creases
   'vec3 atmDeckOctPuff(vec2 p,float c,vec2 off,uint s){vec3 n=atmDeckNoise(p/c-off,s);float k=n.x<0.0?-2.0:2.0;return vec3(2.0*abs(n.x)-0.5,k*n.yz/c);}',
   fbmFn('atmDeckBillows',P.billows,P.drift,1,P.puff),fbmFn('atmDeckDetail',P.detail,P.drift,11,P.puff),
   fbmFn('atmDeckWarpA',[[1,1]],P.evolve,P.warp.seedA),fbmFn('atmDeckWarpB',[[1,1]],P.evolve,P.warp.seedB),
   // J's columns are d(q)/dx and d(q)/dz, so a gradient g at q carries back as g*J
   'vec2 atmDeckWarp(vec2 p,float fr,out mat2 J){vec3 a=atmDeckWarpA(p,fr),b=atmDeckWarpB(p,fr);float W='+f(P.warp.amp)+';',
   ' J=mat2(vec2(1.0+W*a.y,W*b.y),vec2(W*a.z,1.0+W*b.z));return p+W*vec2(a.x,b.x);}',
   'vec3 atmDeckHeap(vec2 q,float fr,mat2 J){vec3 f=atmDeckBillows(q,fr);float r=0.5+0.5*'+f(P.gain)+'*f.x;float u=clamp(r,1e-4,1.0);',
   ' float k=(r>1e-4&&r<1.0)?'+f(span()*P.heap*.5*P.gain)+'*pow(u,'+f(P.heap-1)+'):0.0;return vec3(pow(u,'+f(P.heap)+'),(f.yz*k)*J);}',
   'float atmDeckHeight(vec2 p,float y){float fr=atmDeckT/'+f(P.period)+';mat2 J;vec2 q=atmDeckWarp(p,fr,J);return y-'+f(P.down)+'+'+f(span())+'*atmDeckHeap(q,fr,J).x;}',
   'vec4 atmDeckSlope(vec2 p,float d){float fr=atmDeckT/'+f(P.period)+';mat2 J;vec2 q=atmDeckWarp(p,fr,J);vec3 h=atmDeckHeap(q,fr,J);',
   ' float w=1.0-smoothstep('+f(P.fade[0])+','+f(P.fade[1])+',d);vec3 D=atmDeckDetail(q,fr);',
   ' return vec4(h.yz+'+f(P.detailAmp)+'*(D.yz*J)*w,h.x,0.5+0.5*D.x);}',
   'vec3 atmDeckNormal(vec4 s){return normalize(vec3(-s.x*'+f(P.tilt)+',1.0,-s.y*'+f(P.tilt)+'));}'].join('\n');};
 A.deckUniforms=u=>{u.atmDeckT=A.U.deckTime;return u;};
 A.onInit.push(h=>{A.U.deckTime={value:0};
  if(A.T.ShaderChunk)A.T.ShaderChunk.atmos_clouddeck=A.deckGLSL();
  A.hook(t=>{A.U.deckTime.value=A.deckWrap(t);});});

 // ---------------------------------------------------------------- the deck in three.js
 // o: {y (the deck's level, m), sun:[x,y,z] (toward the sun), bounds:[x0,z0,x1,z1] (where the deck is, for the record;
 // the mesh itself follows the camera), name}. Returns {mesh, mat, record, inCloud(x,y,z)}.
 A.cloudDeck=function(o){const T=A.T,P=P0(),M=P.mesh,Cl=P.clear,h=A.h,y=o.y,lo=y-P.down-30,range=span()+90;
  // the grid: `cells` a side over +-radius, denser near the camera (|s|^1.6), so the near billows are smooth and the
  // far ones cheap; the shader lifts each vertex to the deck's height at its world position
  const n=M.cells,R=M.radius,pos=new Float32Array((n+1)*(n+1)*3),idx=[];
  const map=s=>Math.sign(s)*R*Math.pow(Math.abs(s),1.6);
  for(let j=0;j<=n;j++)for(let i=0;i<=n;i++){const k=(j*(n+1)+i)*3;pos[k]=map(i/n*2-1);pos[k+1]=0;pos[k+2]=map(j/n*2-1);}
  for(let j=0;j<n;j++)for(let i=0;i<n;i++){const a=j*(n+1)+i,b=a+n+1;idx.push(a,b,a+1,b,b+1,a+1);}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(pos,3));geo.setIndex(idx);
  // the ground's height round the camera, in one byte over [lo, lo+range]: the shader thins the deck by its clearance
  const S=Cl.size,data=new Uint8Array(S*S*4),clear=new T.DataTexture(data,S,S,T.RGBAFormat);
  clear.magFilter=clear.minFilter=T.LinearFilter;clear.wrapS=clear.wrapT=T.ClampToEdgeWrapping;
  // colours stay display sRGB: the chunk's output is written as it is, as the atmosphere's other shaders do (GODOT.md)
  const sun=new T.Vector3().fromArray(o.sun||[-.6,.55,-.4]).normalize(),col3=c=>new T.Color(c[0],c[1],c[2]);
  const U=A.deckUniforms({uY:{value:y},uSun:{value:sun},uTop:{value:col3(P.top)},uShade:{value:col3(P.shade)},uClear:{value:clear},uClearWin:{value:new T.Vector4(0,0,1/Cl.span,0)},
   uLo:{value:lo},uRange:{value:range},uFade:{value:new T.Vector2(P.ground[0],P.ground[1])}});
  const mat=new T.ShaderMaterial({fog:true,transparent:true,depthWrite:false,uniforms:Object.assign(T.UniformsUtils.clone(T.UniformsLib.fog),U),
   vertexShader:['#include <fog_pars_vertex>','#include <atmos_clouddeck>','uniform float uY;varying vec3 vWP;',
    'void main(){vec4 wp=modelMatrix*vec4(position,1.0);wp.y=atmDeckHeight(wp.xz,uY);vWP=wp.xyz;vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n'),
   fragmentShader:['#include <fog_pars_fragment>','#include <atmos_clouddeck>',
    'uniform vec3 uSun,uTop,uShade;uniform sampler2D uClear;uniform vec4 uClearWin;uniform float uLo,uRange,uY;uniform vec2 uFade;varying vec3 vWP;',
    'void main(){float d=distance(cameraPosition,vWP);vec4 s=atmDeckSlope(vWP.xz,d);vec3 n=atmDeckNormal(s);',
    // lit from the sun's side, blue-grey in the hollows between the heaps, bright on their tops
    ' float l=clamp(dot(n,uSun)*0.55+0.5,0.0,1.0);vec3 col=mix(uShade,uTop,smoothstep(0.15,0.95,l*0.75+s.z*0.55+s.w*0.25-0.3));',
    ' col+=vec3(0.05,0.05,0.04)*pow(1.0-abs(dot(n,normalize(cameraPosition-vWP))),3.0);',
    // where the ground rises through the deck: its clearance under the deck's top thins it, ragged at the edge
    ' vec2 cu=(vWP.xz-uClearWin.xy)*uClearWin.z;float g=(cu.x<0.0||cu.y<0.0||cu.x>1.0||cu.y>1.0)?-1e4:uLo+uRange*texture2D(uClear,cu).r;',
    // the edge frays into puffs (the billows' own crests decide where it thins), not a uniform translucent sheet
    ' float m=smoothstep(uFade.x,uFade.y,vWP.y-g);float a=smoothstep(0.38,0.62,m+(s.z+s.w-1.0)*0.55);',
    ' gl_FragColor=vec4(col,a);','#include <fog_fragment>','}'].join('\n')});
  const fog=h.scene.fog;if(fog){mat.uniforms.fogColor.value=fog.color;if(mat.uniforms.fogDensity)mat.uniforms.fogDensity.value=(fog.density||0)*P.fogK;
   if(mat.uniforms.fogNear){mat.uniforms.fogNear.value=fog.near;mat.uniforms.fogFar.value=fog.far/P.fogK;}}
  const mesh=new T.Mesh(geo,mat);mesh.name=o.name||'clouddeck';mesh.renderOrder=2;mesh.frustumCulled=false;mesh.userData.probeSkip=true;mesh.userData.inspectLabel='The cloud sea';A.root.add(mesh);
  // follow the camera: the grid moves in steps of `snap` (and the ground's height is resampled there)
  let cx=NaN,cz=NaN;
  const sample=(x0,z0)=>{for(let j=0;j<S;j++)for(let i=0;i<S;i++){const gx=x0+(i+.5)/S*Cl.span,gz=z0+(j+.5)/S*Cl.span,v=Math.max(0,Math.min(1,(A.ground(gx,gz)-lo)/range));data[(j*S+i)*4]=Math.round(v*255);data[(j*S+i)*4+3]=255;}
   clear.needsUpdate=true;U.uClearWin.value.set(x0,z0,1/Cl.span,0);};
  const follow=()=>{const c=h.camera.position,sx=Math.round(c.x/M.snap)*M.snap,sz=Math.round(c.z/M.snap)*M.snap;if(sx===cx&&sz===cz)return;cx=sx;cz=sz;
   mesh.position.set(sx,0,sz);sample(sx-Cl.span/2,sz-Cl.span/2);};
  follow();A.hook(follow);
  const record=A.rec('clouddeck',{y,bounds:o.bounds||null,sun:[sun.x,sun.y,sun.z],preset:'clouddeck',
   note:'a level deck at y; its top is y-down+(up+down)*u^heap (presets.clouddeck); follow the camera; thin it where the ground rises through it'});
  return{mesh,mat,record,inCloud:(x,yy,z)=>yy<A.deckHeight(x,z,A.clock.t,y)};};
})();
