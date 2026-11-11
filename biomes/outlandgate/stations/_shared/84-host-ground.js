// ================================================================= HOST — the ground of a later station: its paint and the library layers
// One ground mesh (480 cells over the map: 15.6 m) painted by the station (STAGE.paint: its meadows, sinter, gravels, shores), then over the
// paint core/terrain's ground shader (KGROUND) lays at most three library layers (STAGE.layers, weighted per vertex by STAGE.gl): with the
// paint's map, the horizon, the rain cover and the shadow map that is the page's texture budget (16 units on r128; 98 counts it).
(function(){(STAGE.landmarks||[]).forEach(L=>REGISTER(L));})();
window._groundMs=0;
const TEX_GROUND=(function(){const t0=performance.now(),S=TERR.R*2.2,RES=STAGE.paintRes==null?1280:STAGE.paintRes,c=new THREE.Color();
 let wx=0,wz=0;const f=n=>FC.at(FC.a[n],wx,wz);
 const tex=BIO.canvasTex(RES,RES,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;wx=(x/w-.5)*S;wz=(y/h-.5)*S;
   const n=fbm(x/22,y/22,.3,2)-.5,n2=(BIO.fn.h3(x,y,3)-.5),H=FC.at(FC.a.h,wx,wz);
   STAGE.paint(wx,wz,H,c,f);
   const k=1+n*.10+n2*.05;d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;}
  g.putImageData(id,0,0);});
 window._groundMs=Math.round(performance.now()-t0);return tex;})();
const KG_ON=typeof KGROUND!=='undefined'&&new URLSearchParams(location.search).get('kground')!=='0',KG_RELIEF=KG_ON&&new URLSearchParams(location.search).get('kgrelief')!=='0';
const KGL=(function(){if(!KG_ON)return[];const L=(STAGE.layers||[]).slice(0,3),W=['vGL.x','vGL.y','vGL.z'];
 const out=L.map((l,i)=>KGROUND.layer('ogate',l.fam,{w:W[i],amt:l.amt==null?.5:l.amt,gain:l.gain==null?1.2:l.gain,tint:'diffuse',name:l.name||l.fam}));
 return out.every(x=>x)?out:[];})();
const MAT_GROUND=KG_ON?new THREE.MeshStandardMaterial({map:TEX_GROUND,color:0xb0aaa4,roughness:.96,metalness:0}):new THREE.MeshLambertMaterial({map:TEX_GROUND,color:0xb0aaa4});
MAT_GROUND.onBeforeCompile=sh=>{
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;attribute vec3 aGL;varying vec3 vGL;')
  .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vGL=aGL;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;varying vec3 vGL;')
  .replace('#include <map_fragment>','#include <map_fragment>\n{'+(KGL.length?'/*KGROUND*/':'')+'}');};
if(KG_ON)KGROUND.hook(MAT_GROUND,{layers:KGL,key:'ogate-ground-'+STAGE.key,relief:KG_RELIEF&&KGL.length?{bump:.07,cavity:.8,mesh:1}:null});
const GROUND=(function(){const N=480,S=TERR.R*2.2,cs=S/N,nx=N+1;
 const pos=new Float32Array(nx*nx*3),uv=new Float32Array(nx*nx*2),gl=new Float32Array(nx*nx*3);
 for(let j=0;j<nx;j++)for(let i=0;i<nx;i++){const k=j*nx+i,x=-S/2+i*cs,z=-S/2+j*cs,y=terrainH(x,z);pos[k*3]=x;pos[k*3+1]=y;pos[k*3+2]=z;uv[k*2]=x/S+.5;uv[k*2+1]=.5-z/S;
  const w=STAGE.gl?STAGE.gl(x,z):[0,0,0];gl[k*3]=w[0];gl[k*3+1]=w[1];gl[k*3+2]=w[2];}
 const idx=new Uint32Array(N*N*6);let t=0;
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=j*nx+i,b=a+nx,c=b+1,d=a+1;idx[t++]=a;idx[t++]=b;idx[t++]=d;idx[t++]=b;idx[t++]=c;idx[t++]=d;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));g.setAttribute('aGL',new THREE.BufferAttribute(gl,3));
 g.setIndex(new THREE.BufferAttribute(idx,1));g.computeVertexNormals();const m=new THREE.Mesh(g,MAT_GROUND);if(KG_RELIEF&&KGL.length)KGROUND.cavityMesh(m);
 m.userData.probeSkip=true;m.userData.inspectLabel='The Outland Gate: '+STAGE.title;scene.add(m);return m;})();
// the DRAWN ground: the mesh's own triangles (15.6 m cells), which a camera must stand on and the probe points sit in
const drawnH=(function(){const N=480,S=TERR.R*2.2,cs=S/N,nx=N+1,P=GROUND.geometry.attributes.position.array;
 return(x,z)=>{const u=clamp((x+S/2)/cs,0,N-1e-6),v=clamp((z+S/2)/cs,0,N-1e-6),i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,a=j*nx+i,b=a+nx,c2=b+1,d=a+1;
  const y=k=>P[k*3+1];return fu+fv<1?y(a)+(y(d)-y(a))*fu+(y(b)-y(a))*fv:y(c2)+(y(b)-y(c2))*(1-fu)+(y(d)-y(c2))*(1-fv);};})();
{const P=[];(STAGE.probes||[]).forEach(p=>P.push(p[0],drawnH(p[0],p[2])+(p[1]==null?1:p[1]),p[2]));
 if(P.length){const o=new THREE.Object3D();o.name='landform probe points';o.userData.probePoints=P;scene.add(o);}}
