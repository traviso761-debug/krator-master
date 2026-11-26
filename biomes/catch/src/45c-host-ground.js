// ================================================================= HOST — the painted ground, for any station
// One mesh over 2.2 R, its vertices coloured by the stage's palette from the field cache (STAGE.paint(F, colour), mottled at
// two large scales: STAGE.macro, default .22), with the
// library's ground layers (materials.json ground.*) blended over it per vertex by the stage's weights (STAGE.layers:
// [[family, F => weight], ...], up to twelve). A keep-0 layer multiplies the painted colour by its relief, a keep-1 layer
// shows its own colour, the others mix the two. Without the pack (?mat=proc) the ground is the painted one.
// Anti-tiling: each layer is sampled twice (the second turned 37 degrees, scaled 1.37) and the two blended by a noise
// read from a small texture of core/rand values (KRAND.h3: the same numbers in Godot), never a shader hash.
const GROUND_N=STAGE.groundN||600;
const GL=(function(){if(typeof KMAT==='undefined'||KMAT.mode!=='lib')return null;const L=(STAGE.layers||[]).slice(0,12);
 const P=n=>KMAT.packed('catch',n);if(!L.length||L.some(l=>!P(l[0])))return null;
 return L.map(l=>{const e=P(l[0]);return{name:l[0],w:l[1],tex:KMAT.textures(e,{aniso:8}).map,scale:e.scale[0],keep:e.tint,mean:e.mean};});})();
const GNOISE=(function(){const n=64,d=new Uint8Array(n*n*4);for(let j=0;j<n;j++)for(let i=0;i<n;i++){const k=(j*n+i)*4;
  d[k]=Math.floor(KRAND.h3(i,j,0,811)*255);d[k+1]=Math.floor(KRAND.h3(i,j,1,811)*255);d[k+2]=0;d[k+3]=255;}
 const t=new THREE.DataTexture(d,n,n,THREE.RGBAFormat);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.magFilter=t.minFilter=THREE.LinearFilter;t.needsUpdate=true;return t;})();
const GTEX=['uniform sampler2D uGNoise;',
 'float gNoise(vec2 p){return texture2D(uGNoise,p/64.0).r;}',
 'vec3 gTex(sampler2D s,vec2 p){float n=gNoise(p*0.13)*0.65+gNoise(p*0.41+7.3)*0.35;vec2 q=vec2(p.x*0.7986-p.y*0.6018,p.x*0.6018+p.y*0.7986)*1.37+vec2(0.37,0.71);',
 ' return mix(texture2D(s,p).rgb,texture2D(s,q).rgb,smoothstep(0.3,0.7,n));}'].join('\n');
const MAT_GROUND=new THREE.MeshLambertMaterial({color:0xffffff,vertexColors:true});
// THE LAYERS ON core/terrain's GROUND SHADER (KGROUND, 43-core-ground.js; the final rebuild, pair 11, 2026-11-09): with the pack and without
// ?kground=0, each layer is hex-tiled, read coarser with distance (its tile doubling from 30 m, up to 8x: the coarse read the owner asked for
// on 2026-10-26, so a crust's polygons hold as large shapes) and blended by height (a pebble stands through the silt at an edge), at the
// same weights (aGL*) and the same keep: its colour is t x mix(paint / mean, 1, keep), so a keep-0 layer is the paint times its relief and a
// keep-1 layer its own colour, as before. Past 500 m the layers give way, a little, to the painted ground (_kfd), as before. three r128
// uploads cameraPosition only to Phong and Standard: on this Lambert ground the eye is the view matrix's (KHOOK.EYE's kEye), and KGROUND's
// own read of that name is pointed at it (korona's define, a core finding: core/terrain/43-core-ground.js should use kEye itself)
const KG_ON=!!GL&&typeof KGROUND!=='undefined'&&new URLSearchParams(location.search).get('kground')!=='0';
const KG_EYE='#define '+'camera'+'Position kEye()\n';
const KG_LY=KG_ON?GL.map((l,i)=>({map:l.tex,k:1/l.scale,name:l.name,w:'vGL'+(i>>2)+'.'+'xyzw'[i&3]+'*_kfd',
  tint:'mix(_kb*'+(1/Math.pow(l.mean==null?.78:l.mean,2.2)).toFixed(4)+',vec3(1.0),'+(+l.keep).toFixed(2)+')'})):null;
MAT_GROUND.onBeforeCompile=sh=>{sh.uniforms.uGNoise={value:GNOISE};
 let lay='';
 if(GL&&KG_LY)lay='vec3 _kb=diffuseColor.rgb;float _kfd=1.0-0.3*smoothstep(500.0,3000.0,length(kEye()-vGWP));\n/*KGROUND*/';
 else if(GL){GL.forEach((l,i)=>{sh.uniforms['uGL'+i]={value:l.tex};});
  // the fallback (?kground=0): the page's own blend. A custom sampler is not decoded from sRGB for us: pow 2.2 by hand; a keep-0 layer is its
  // relief over the pack's mean; with distance a layer is read from a second tap six times coarser (25 m to 220 m), so a crust's polygons and a
  // gravel's mottle hold as large shapes instead of averaging to one flat colour (the owner, 2026-10-26: the soda bed read as a blank blob from far
  // and middle distance); only past 500 m does it give way, a little, to the painted ground
  lay='{vec3 _b=diffuseColor.rgb,_a=vec3(0.0);float _s=0.0;vec2 _p=vGWP.xz;float _dc=length(kEye()-vGWP),_fd=1.0-0.3*smoothstep(500.0,3000.0,_dc),_fm=smoothstep(25.0,220.0,_dc);'+GL.map((l,i)=>{const m=Math.pow(l.mean==null?.78:l.mean,2.2).toFixed(4),
    w='vGL'+Math.floor(i/4)+'.'+'xyzw'[i%4];
   return 'if('+w+'>0.003){vec3 t=pow(mix(gTex(uGL'+i+',_p*'+(1/l.scale).toFixed(4)+'),gTex(uGL'+i+',_p*'+(1/(l.scale*6)).toFixed(5)+'),_fm),vec3(2.2));_a+='+w+'*mix(_b*t/'+m+',t,'+l.keep.toFixed(2)+');_s+='+w+';}';}).join('')+
   'diffuseColor.rgb=mix(_b,_a/max(_s,0.001),clamp(_s*_fd,0.0,1.0));}';}
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;'+(GL?'attribute vec4 aGL0,aGL1,aGL2;varying vec4 vGL0,vGL1,vGL2;':''))
  .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;'+(GL?'vGL0=aGL0;vGL1=aGL1;vGL2=aGL2;':''));
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;\n'+KHOOK.EYE+(KG_LY?KG_EYE:'')+(KG_LY?'':GTEX)+(GL?'varying vec4 vGL0,vGL1,vGL2;'+(KG_LY?'':GL.map((l,i)=>'uniform sampler2D uGL'+i+';').join('')):''))
  .replace('#include <color_fragment>','#include <color_fragment>\n'+lay);};
MAT_GROUND.customProgramCacheKey=()=>'catch-ground|'+(GL?GL.length:0)+(KG_LY?'|kg':'');
if(KG_LY){KGROUND.hook(MAT_GROUND,{key:'catch-ground-'+GL.map(l=>l.name).join(','),layers:KG_LY,at:'/*KGROUND*/',far:{d:30,levels:3}});MAT_GROUND.userData.kgroundOn=true;}
const GROUND=(function(){const N=GROUND_N,S=TERR.R*2.2,cs=S/N,nx=N+1;
 const pos=new Float32Array(nx*nx*3),col=new Float32Array(nx*nx*3),g=GL?[0,1,2].map(()=>new Float32Array(nx*nx*4)):null,F={},c=new THREE.Color();
 for(let j=0;j<nx;j++)for(let i=0;i<nx;i++){const k=j*nx+i,x=-S/2+i*cs,z=-S/2+j*cs,y=terrainH(x,z);pos[k*3]=x;pos[k*3+1]=y;pos[k*3+2]=z;
  FNAMES.forEach(n=>F[n]=FC.at(FC.a[n],x,z));F.x=x;F.z=z;F.h=y;
  STAGE.paint(F,c);{const mk=STAGE.macro==null?.22:STAGE.macro,m=1+mk*((nz(x,z,.0035,2,301)-.5)*1.6+(nz(x,z,.0009,2,302)-.5)*1.2);c.multiplyScalar(m);}c.convertSRGBToLinear();col[k*3]=c.r;col[k*3+1]=c.g;col[k*3+2]=c.b;
  if(GL){let s=0;const w=GL.map(l=>{const v=clamp(l.w(F),0,1);s+=v;return v;}),k1=s>1?1/s:1;for(let q=0;q<12;q++)g[q>>2][k*4+(q&3)]=(w[q]||0)*k1;}}
 const idx=new Uint32Array(N*N*6);let t=0;
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=j*nx+i,b=a+nx,cc=b+1,d=a+1;
  if(pos[a*3+1]+pos[cc*3+1]<pos[b*3+1]+pos[d*3+1]){idx[t++]=a;idx[t++]=b;idx[t++]=cc;idx[t++]=a;idx[t++]=cc;idx[t++]=d;}   /* the lower diagonal: a channel runs down the triangles */
  else{idx[t++]=a;idx[t++]=b;idx[t++]=d;idx[t++]=b;idx[t++]=cc;idx[t++]=d;}}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('color',new THREE.BufferAttribute(col,3));
 if(GL)g.forEach((a,q)=>geo.setAttribute('aGL'+q,new THREE.BufferAttribute(a,4)));
 geo.setIndex(new THREE.BufferAttribute(idx,1));geo.computeVertexNormals();
 const m=new THREE.Mesh(geo,MAT_GROUND);m.userData.probeSkip=true;m.userData.inspectLabel=STAGE.groundLabel||STAGE.name;m.userData.host=true;scene.add(m);return m;})();
// THE FAR APRON: a ring of plain ground from just inside the mesh's edge out to 200 km, at the lowest height round the edge,
// in the floor's own colour (the mean of the mesh's edge vertices). From a high camera the land beyond the 2.2 R mesh was
// a void the sky's ridge layers filled down to the horizon in one flat hazed colour (a slab under the walls); the apron is
// fogged like the ground, so the walls stand on land that fades into the same haze. A stage may set STAGE.apron {dy, col}.
const APRON=(function(){const g=GROUND.geometry,P=g.attributes.position.array,Cl=g.attributes.color.array,N=GROUND_N+1;let lo=1e9,r=0,gg=0,b=0,n=0;
 for(let k=0;k<N*N;k++){const i=k%N,j=Math.floor(k/N);if(i>0&&i<N-1&&j>0&&j<N-1)continue;lo=Math.min(lo,P[k*3+1]);r+=Cl[k*3];gg+=Cl[k*3+1];b+=Cl[k*3+2];n++;}
 const A=STAGE.apron||{},geo=new THREE.RingGeometry(TERR.R*1.02,200000,128,6);geo.rotateX(-Math.PI/2);
 const col=A.col!=null?new THREE.Color(A.col).convertSRGBToLinear():new THREE.Color(r/n,gg/n,b/n);
 const m=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({color:col}));m.position.y=lo-(A.dy==null?10:A.dy);
 m.userData.probeSkip=true;m.userData.host=true;m.userData.inspectLabel=(STAGE.groundLabel||STAGE.name)+' (the far country, plain)';m.renderOrder=-1;scene.add(m);return m;})();
