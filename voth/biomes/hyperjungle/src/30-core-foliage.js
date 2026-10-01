// ================================================================= BIOME CORE — foliage
// What makes a card read as leaves. Ported from Girder's 60-trees.js and the
// Hexahedron's 71b-flora.js, with the three lessons those cost:
//   - LAMBERT, never Standard: a Standard card keeps a 4% specular at any
//     roughness and goes white at grazing angles, i.e. from under the canopy.
//   - two-sided light MIX, not a flip: a leaf seen from below is a lit,
//     translucent leaf, not the ground-hemisphere shadow a flipped normal gives.
//   - low-alpha texels carry the species' MID colour, or mipmapping bleeds a
//     black fringe round every leaf at distance; and alpha is boosted with
//     distance, or the far canopy thins to lace.
BIO.WIND={t:{value:0}};
BIO.SUN={value:null};                 // set by BIO.setSun([x,y,z]); defaults at first use
BIO.setSun=function(v){const T=BIO.host.THREE;if(!BIO.SUN.value)BIO.SUN.value=new T.Vector3();BIO.SUN.value.set(v[0],v[1],v[2]).normalize();};
BIO._windTicked=false;
BIO._tickWind=function(){if(BIO._windTicked)return;BIO._windTicked=true;BIO.host.ticks(dt=>{BIO.WIND.t.value+=dt;});};

// ---------------------------------------------------------------- alpha textures
// draw(g,S) paints GREYSCALE leaves on a transparent canvas; the material's
// per-instance colour tints them. fillRGB fills the transparent texels.
BIO.alphaTex=function(S,draw,fillRGB){const T=BIO.host.THREE;
 const c=document.createElement('canvas');c.width=c.height=S;const g=c.getContext('2d');g.clearRect(0,0,S,S);draw(g,S);
 const d=g.getImageData(0,0,S,S).data,out=new Uint8Array(S*S*4);
 for(let o=0;o<out.length;o+=4){const a=d[o+3];
  if(a<48){out[o]=fillRGB[0];out[o+1]=fillRGB[1];out[o+2]=fillRGB[2];}else{out[o]=d[o];out[o+1]=d[o+1];out[o+2]=d[o+2];}
  out[o+3]=a;}
 const t=new T.DataTexture(out,S,S,T.RGBAFormat);
 t.encoding=T.sRGBEncoding;t.generateMipmaps=true;t.minFilter=T.LinearMipmapLinearFilter;t.magFilter=T.LinearFilter;
 t.anisotropy=4;t.needsUpdate=true;t.wrapS=t.wrapT=T.RepeatWrapping;return t;};
// a COLOUR canvas texture (bark, ground), repeat-wrapped
BIO.canvasTex=function(w,h,fn,rep){const T=BIO.host.THREE;const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');fn(g,w,h);
 const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=8;t.encoding=T.sRGBEncoding;if(rep)t.repeat.set(rep,rep);return t;};
// drawing helpers for leaf textures
BIO.tex={
 grey(l){l=clamp(Math.round(l),0,255);return'rgb('+l+','+l+','+l+')';},
 leaf(g,x,y,len,wid,ang,lum,rib){g.save();g.translate(x,y);g.rotate(ang);
  g.fillStyle=BIO.tex.grey(lum);g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(len*.45,wid,len,0);g.quadraticCurveTo(len*.45,-wid,0,0);g.fill();
  if(rib){g.strokeStyle=BIO.tex.grey(lum*.72);g.lineWidth=1;g.beginPath();g.moveTo(0,0);g.lineTo(len*.92,0);g.stroke();}
  g.restore();},
 cl:[],
 clusters(S,n,k){BIO.tex.cl=[];for(let i=0;i<n;i++){const a=i/n*TAU+rr(-.3,.3),r=S*.5*k*(i%3===0?rr(0,.35):rr(.55,1));BIO.tex.cl.push([S/2+Math.cos(a)*r,S/2+Math.sin(a)*r]);}},
 clPt(S,sd,lim){const c=pick(BIO.tex.cl),a=rr(0,TAU),r=sd*S*Math.sqrt(-2*Math.log(1-rng()*.98))*.6;
  let x=c[0]+Math.cos(a)*r,y=c[1]+Math.sin(a)*r;const d=Math.hypot(x-S/2,y-S/2),m=S*.5*lim;if(d>m){x=S/2+(x-S/2)*m/d;y=S/2+(y-S/2)*m/d;}
  return[x,y,Math.atan2(y-c[1],x-c[0])];},
 discPt(S,k){const a=rr(0,TAU),r=S*.5*k*Math.sqrt(rng());return[S/2+Math.cos(a)*r,S/2+Math.sin(a)*r,a];}
};

// ---------------------------------------------------------------- card geometries
BIO.geo={};
// leaf clump: a tripod of three tilted unit quads
BIO.geo.clump=function(){const T=BIO.host.THREE,pos=[],uv=[],nor=[];
 for(let k=0;k<3;k++){const az=k/3*TAU+.3,tilt=.92,ca=Math.cos(az),sa=Math.sin(az);
  const n=[Math.sin(tilt)*ca,Math.cos(tilt),Math.sin(tilt)*sa],u=[-sa,0,ca],v=[-Math.cos(tilt)*ca,Math.sin(tilt),-Math.cos(tilt)*sa];
  const c=[n[0]*.10,n[1]*.10-.04,n[2]*.10];
  const P=[[-.5,-.5],[.5,-.5],[.5,.5],[-.5,.5]].map(q=>[c[0]+u[0]*q[0]+v[0]*q[1],c[1]+u[1]*q[0]+v[1]*q[1],c[2]+u[2]*q[0]+v[2]*q[1],q[0]+.5,q[1]+.5]);
  [0,1,2,0,2,3].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(n[0],n[1],n[2]);});}
 return BIO.geo._make(pos,nor,uv);};
BIO.geo._make=function(pos,nor,uv,col){const T=BIO.host.THREE,g=new T.BufferGeometry();
 g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(nor,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
 if(col)g.setAttribute('color',new T.Float32BufferAttribute(col,3));return g;};
// hanging raceme / strand: two crossed quads, local y 0 (hung) .. -1
BIO.geo.hang=function(){const pos=[],uv=[],nor=[];
 for(let k=0;k<2;k++){const ca=Math.cos(k*Math.PI/2+.4),sa=Math.sin(k*Math.PI/2+.4);
  const P=[[-.5,0],[.5,0],[.5,-1],[-.5,-1]].map(q=>[ca*q[0],q[1],sa*q[0],q[0]+.5,-q[1]]);
  [0,2,1,0,3,2].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(-sa,0,ca);});}
 return BIO.geo._make(pos,nor,uv);};
// a hanging RIBBON: origin at the top, running down to y=-1 in nseg tapering
// quads, drifting in z so a curtain of them is not a plank; texture repeats
// once per segment so a long one reads as a chain of leaves
BIO.geo.ribbon=function(nseg,taper,drift){const pos=[],uv=[],nor=[];nseg=nseg||4;taper=taper==null?.55:taper;drift=drift==null?.18:drift;
 const P=[];for(let i=0;i<=nseg;i++){const t=i/nseg,w=.5*lerp(1,taper,t),z=Math.sin(t*3.1)*drift;P.push([-w,-t,z],[w,-t,z]);}
 for(let i=0;i<nseg;i++){const a=P[2*i],b=P[2*i+1],c=P[2*i+2],d=P[2*i+3];
  [[a,0,0],[c,0,1],[b,1,0],[b,1,0],[c,0,1],[d,1,1]].forEach(q=>{pos.push(q[0][0],q[0][1],q[0][2]);uv.push(q[1],q[2]);nor.push(0,0,1);});}
 return BIO.geo._make(pos,nor,uv);};
// an arching FROND: pinned at the origin, arching along +x to x=1 and down
BIO.geo.frond=function(nseg){const pos=[],uv=[],nor=[];nseg=nseg||3;
 const P=[];for(let i=0;i<=nseg;i++){const t=i/nseg,w=.16*Math.sin(t*Math.PI)*.9+.02,y=.32*Math.sin(t*2.2)-.22*t*t;P.push([t,y,-w],[t,y,w]);}
 for(let i=0;i<nseg;i++){const a=P[2*i],b=P[2*i+1],c=P[2*i+2],d=P[2*i+3];
  [[a,0,0],[b,1,0],[c,0,1],[b,1,0],[d,1,1],[c,0,1]].forEach(q=>{pos.push(q[0][0],q[0][1],q[0][2]);uv.push(q[1],q[2]);nor.push(0,1,0);});}
 return BIO.geo._make(pos,nor,uv);};
// a MOSS MAT: a fan of quads in the xz plane, front face UP (winding matters:
// the Hexahedron lost 18k of these to a reversed fan). Flip pi about x for a soffit.
BIO.geo.mat=function(){const pos=[],uv=[],nor=[];const N=7;
 for(let s=0;s<N;s++){const a0=s/N*TAU,a1=(s+1)/N*TAU,r0=rr(.7,1),r1=rr(.7,1);
  const A=[0,0,0],B=[Math.cos(a0)*r0,rr(0,.08),Math.sin(a0)*r0],C=[Math.cos(a1)*r1,rr(0,.08),Math.sin(a1)*r1];
  [[A,.5,.5],[C,.5+C[0]*.5,.5+C[2]*.5],[B,.5+B[0]*.5,.5+B[2]*.5]].forEach(q=>{pos.push(q[0][0],q[0][1],q[0][2]);uv.push(q[1],q[2]);nor.push(0,1,0);});}
 return BIO.geo._make(pos,nor,uv);};
// a BUSH LOBE: a squat 6-sided dome, origin at the ground
BIO.geo.lobe=function(){const T=BIO.host.THREE;const g=new T.SphereGeometry(1,7,4,0,TAU,0,Math.PI*.55);g.scale(1,.8,1);return g;};
// a BLOOM: a diamond of two quads, origin at the centre
BIO.geo.bloom=function(){const pos=[],uv=[],nor=[];
 for(let k=0;k<2;k++){const ca=Math.cos(k*Math.PI/2),sa=Math.sin(k*Math.PI/2);
  const P=[[-.5,0],[0,.5],[.5,0],[0,-.5]].map(q=>[ca*q[0],q[1],sa*q[0],q[0]+.5,q[1]+.5]);
  [0,1,2,0,2,3].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(-sa,0,ca);});}
 return BIO.geo._make(pos,nor,uv);};
// a POD on its stalk: local y 0 (hung) .. -1, vertex-coloured (stalk dark, pod white)
BIO.geo.pod=function(){const T=BIO.host.THREE;
 const parts=[[new T.CylinderGeometry(.012,.012,.5,3,1,true).translate(0,-.25,0),.16],[new T.SphereGeometry(.15,6,4).scale(1,1.75,1).translate(0,-.735,0),1]];
 const pos=[],nor=[],col=[],uv=[];
 parts.forEach(p=>{const g=p[0].toNonIndexed(),a=g.attributes.position.array,b=g.attributes.normal.array,u=g.attributes.uv.array;
  for(let i=0;i<a.length;i+=3){pos.push(a[i],a[i+1],a[i+2]);nor.push(b[i],b[i+1],b[i+2]);
   const sh=p[1]===1?(.78+.22*Math.sin(Math.atan2(a[i+2],a[i])*5))*lerp(.72,1,clamp((a[i+1]+1)/.5,0,1)):p[1];col.push(sh,sh,sh);}
  for(let j=0;j<u.length;j++)uv.push(u[j]);});
 return BIO.geo._make(pos,nor,uv,col);};
// a unit cylinder along y, centred (for BIO.beam)
BIO.geo.rod=function(n){const T=BIO.host.THREE;return new T.CylinderGeometry(.5,.5,1,n||7);};
// a tapering trunk from y=0 up to y=1
BIO.geo.trunk=function(n){const T=BIO.host.THREE;return new T.CylinderGeometry(.16,.4,1,n||8).translate(0,.5,0);};

// ---------------------------------------------------------------- the foliage hook
// o: { aN:bool, irid:bool, swayW:'glsl expr', swayA:0.2, axis:0|1, dist:bool }
//   swayW  weight of the displacement per vertex: '1.0' for a clump, '(-position.y)'
//          for something hung from y=0, '(position.x)' for a frond pinned at x=0
//   axis   which instanceMatrix column sets the amplitude (1 for a long thin hang)
BIO.foliageHook=function(o){o=o||{};
 return function(sh){
  sh.uniforms.uWindT=BIO.WIND.t;
  if(!BIO.SUN.value)BIO.setSun([.45,.72,-.52]);
  sh.uniforms.uSunDir=BIO.SUN;
  sh.vertexShader=sh.vertexShader
   .replace('#include <common>','#include <common>\nuniform float uWindT;\nvarying vec3 vFlWP;\nvarying float vFlD;\n'+
    (o.aN?'attribute vec3 aN;\nvarying vec3 vFlN;\n':'')+(o.irid?'attribute vec3 aC2;\nvarying vec3 vFlC2;\n':''))
   .replace('#include <project_vertex>',[
    'vec4 mvPosition = vec4( transformed, 1.0 );',
    'float _sc = 1.0; float _ph = 0.0;',
    '#ifdef USE_INSTANCING',
    '  mvPosition = instanceMatrix * mvPosition;',
    '  _ph = dot(instanceMatrix[3].xyz, vec3(0.131,0.073,0.117));',
    '  _sc = length(instanceMatrix['+(o.axis||0)+'].xyz);',
    '#endif',
    'float _wg = '+(o.swayW||'1.0')+';',
    'mvPosition.xyz += _wg * _sc * vec3(',
    '   sin(uWindT*0.9+_ph) + 0.45*sin(uWindT*2.3+_ph*1.7+position.x*5.0),',
    '   0.40*sin(uWindT*1.6+_ph*0.6+position.z*5.0),',
    '   cos(uWindT*0.7+_ph*1.3) + 0.45*sin(uWindT*2.9+_ph+position.y*5.0) ) * '+(o.swayA==null?.06:o.swayA).toFixed(3)+';',
    'vFlWP = (modelMatrix * mvPosition).xyz;',
    o.aN?'vFlN = aN;':'',o.irid?'vFlC2 = aC2;':'',
    'mvPosition = modelViewMatrix * mvPosition;',
    'vFlD = -mvPosition.z;',
    'gl_Position = projectionMatrix * mvPosition;'].join('\n'));
  // the lighting normal: the clump's own (aN, world space, so it shades as a
  // lit mass), or the card normal bent toward world-up for anything without one
  if(o.aN)sh.vertexShader=sh.vertexShader.replace('#include <defaultnormal_vertex>','vec3 transformedNormal = normalize(normalMatrix * aN);');
  else sh.vertexShader=sh.vertexShader.replace('#include <defaultnormal_vertex>','#include <defaultnormal_vertex>\n'+
   '{vec3 _up=normalize(normalMatrix*vec3(0.0,1.0,0.0)); transformedNormal=normalize(mix(normalize(transformedNormal),_up,0.45));}');
  sh.fragmentShader=sh.fragmentShader
   .replace('#include <common>','#include <common>\nuniform float uWindT;\nuniform vec3 uSunDir;\nvarying vec3 vFlWP;\nvarying float vFlD;\n'+
    (o.aN?'varying vec3 vFlN;\n':'')+(o.irid?'varying vec3 vFlC2;\n':''))
   .replace('#include <map_fragment>','#include <map_fragment>\n diffuseColor.a *= 1.0 + clamp(vFlD/650.0, 0.0, 1.1);')
   .replace('reflectedLight.indirectDiffuse += ( gl_FrontFacing ) ? vIndirectFront : vIndirectBack;','reflectedLight.indirectDiffuse += 0.72*vIndirectFront + 0.28*vIndirectBack;')
   .replace('reflectedLight.directDiffuse = ( gl_FrontFacing ) ? vLightFront : vLightBack;','reflectedLight.directDiffuse = vLightFront + 0.30*vLightBack;');
  // IRIDESCENCE (prism gum): green facing the sun, the second colour away from
  // it and at grazing view angles, shimmering slowly in the wind
  if(o.irid)sh.fragmentShader=sh.fragmentShader.replace('#include <color_fragment>',[
   '#include <color_fragment>',
   '{ vec3 _V = normalize(cameraPosition - vFlWP); vec3 _N = normalize('+(o.aN?'vFlN':'vec3(0.0,1.0,0.0)')+');',
   '  float _fr = 1.0 - abs(dot(_N,_V));',
   '  float _sf = dot(_N, uSunDir)*0.5 + 0.5;',
   '  float _sh = 0.16*sin(uWindT*0.8 + dot(vFlWP, vec3(0.045,0.083,0.037))) + 0.08*sin(uWindT*1.9 + dot(vFlWP, vec3(-0.21,0.13,0.17)));',
   '  float _k = smoothstep(0.22, 0.78, _sf*1.15 - _fr*0.80 + 0.30 + _sh);',
   '  diffuseColor.rgb *= mix(vFlC2, vColor, _k) / max(vColor, vec3(0.004)); }'].join('\n'));
 };};
// a foliage MATERIAL: Lambert, alpha-tested, double-sided, hooked. Each key
// compiles its own program (different hooks on different materials need
// different cache keys or three silently shares one).
BIO.leafMat=function(tex,key,o){const T=BIO.host.THREE;o=o||{};
 const m=new T.MeshLambertMaterial({color:0xffffff,map:tex||null,alphaTest:o.alphaTest==null?.42:o.alphaTest,side:T.DoubleSide,vertexColors:!!o.vertexColors});
 m.onBeforeCompile=BIO.foliageHook(o);m.customProgramCacheKey=function(){return'biofol|'+key;};
 BIO._tickWind();return m;};
// a BARK / WOOD material for merged buckets: Lambert, vertex-coloured, textured
BIO.barkMat=function(tex,col){const T=BIO.host.THREE;return new T.MeshLambertMaterial({color:col==null?0xffffff:col,map:tex||null,vertexColors:true,side:T.DoubleSide});};
// a plain material for instanced solids (rods, lobes, boulders)
BIO.solidMat=function(tex,col){const T=BIO.host.THREE;return new T.MeshLambertMaterial({color:col==null?0xffffff:col,map:tex||null,side:T.DoubleSide});};
