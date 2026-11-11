// ================================================================= HOST — the ground: the floor, the bars, the banks, the road
// One ground mesh (480 cells over the map: 15.6 m) painted by the floor's parts: the Cfa meadow of the flat floor (greener in the old flood
// channels' swales), the gravel of the braid bars, the mud of the channels' lips, the channels' beds under the water, the god's road's
// packed earth. Over the paint, core/terrain's ground shader (KGROUND) lays three library layers: the meadow, the bars' shingle, the
// banks' mud (16 texture units at most on r128: 98 counts them).
REGISTER({name:'Hau-Gel, the Outland Gate River (~470 m3/s at the Narrows; braided)',x:rivX(1200),z:1200,y:LVL(1200)-6,r:MAIN_W,h:14});
BRAIDS.forEach((B,i)=>{const p=B.pts[Math.floor(B.pts.length/2)];REGISTER({name:'A braid of Hau-Gel',x:p[0],z:p[1],y:LVL(p[1])-4,r:B.w,h:10});});
window._groundMs=0;
const TEX_GROUND=(function(){const t0=performance.now(),S=TERR.R*2.2;
 const K=hx=>new THREE.Color(hx),c=new THREE.Color();
 const MEAD=K(0x6e7a46),MEAD2=K(0x5e6e3e),SWALE=K(0x4e6a3a),GRAV=K(0x9a9084),GRAV2=K(0x8a8274),MUD=K(0x5e5440),BED=K(0x4a4a3c),ROAD=K(0x9a8462),EDGE=K(0x8a8458);
 const tex=BIO.canvasTex(1280,1280,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,wx=(x/w-.5)*S,wz=(y/h-.5)*S;
   const n=fbm(x/22,y/22,.3,2)-.5,n2=(BIO.fn.h3(x,y,3)-.5),p1=fbm(x/60+5,y/60-2,.7,2),p2=fbm(x/28-3,y/28+8,.9,2);
   const H=FC.at(FC.a.h,wx,wz),fl=FC.at(FC.a.floor,wx,wz),sw=FC.at(FC.a.swale,wx,wz),bk=FC.at(FC.a.bank,wx,wz),br=FC.at(FC.a.bar,wx,wz),rd=FC.at(FC.a.road,wx,wz);
   c.copy(MEAD).lerp(MEAD2,smooth(.4,.7,p1)*.6).lerp(EDGE,(1-fl)*.45);c.lerp(SWALE,sw*.6);
   c.lerp(GRAV,smooth(.2,.7,br)*.85);c.lerp(GRAV2,smooth(.2,.7,br)*smooth(.45,.7,p2)*.4);c.lerp(MUD,smooth(.55,.95,bk)*.55*(1-br));
   if(H<LVL(wz)-.2)c.lerp(BED,.85);c.lerp(ROAD,rd*.8);
   const k=1+n*.10+n2*.05;d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;}
  g.putImageData(id,0,0);});
 window._groundMs=Math.round(performance.now()-t0);return tex;})();
const KG_ON=typeof KGROUND!=='undefined'&&new URLSearchParams(location.search).get('kground')!=='0',KG_RELIEF=KG_ON&&new URLSearchParams(location.search).get('kgrelief')!=='0';
const KGL=(function(){if(!KG_ON)return[];
 const a=KGROUND.layer('ogate','ground.grass',{w:'vGL.x',amt:.45,gain:1.2,tint:'diffuse',name:'meadow'}),
  b=KGROUND.layer('ogate','ground.shingle',{w:'vGL.y',amt:.65,gain:1.2,tint:'diffuse',name:'bar shingle'}),
  m=KGROUND.layer('ogate','ground.mud',{w:'vGL.z',amt:.55,gain:1.15,tint:'diffuse',name:'bank mud'});
 return a&&b&&m?[a,b,m]:[];})();
const MAT_GROUND=KG_ON?new THREE.MeshStandardMaterial({map:TEX_GROUND,color:0xb0aaa4,roughness:.96,metalness:0}):new THREE.MeshLambertMaterial({map:TEX_GROUND,color:0xb0aaa4});
MAT_GROUND.onBeforeCompile=sh=>{
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;attribute vec3 aGL;varying vec3 vGL;')
  .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vGL=aGL;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;varying vec3 vGL;')
  .replace('#include <map_fragment>','#include <map_fragment>\n{'+(KGL.length?'/*KGROUND*/':'')+'}');};
if(KG_ON)KGROUND.hook(MAT_GROUND,{layers:KGL,key:'ogate-ground',relief:KG_RELIEF&&KGL.length?{bump:.07,cavity:.8,mesh:1}:null});
const GROUND=(function(){const N=480,S=TERR.R*2.2,cs=S/N,nx=N+1;
 const pos=new Float32Array(nx*nx*3),uv=new Float32Array(nx*nx*2),gl=new Float32Array(nx*nx*3);
 for(let j=0;j<nx;j++)for(let i=0;i<nx;i++){const k=j*nx+i,x=-S/2+i*cs,z=-S/2+j*cs,y=terrainH(x,z);pos[k*3]=x;pos[k*3+1]=y;pos[k*3+2]=z;uv[k*2]=x/S+.5;uv[k*2+1]=.5-z/S;
  const br=smooth(.2,.7,FC.at(FC.a.bar,x,z)),bk=smooth(.5,.95,FC.at(FC.a.bank,x,z))*(1-br),m=(1-br)*(1-bk)*(1-FC.at(FC.a.road,x,z));gl[k*3]=m;gl[k*3+1]=br;gl[k*3+2]=bk;}
 const idx=new Uint32Array(N*N*6);let t=0;
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=j*nx+i,b=a+nx,c=b+1,d=a+1;idx[t++]=a;idx[t++]=b;idx[t++]=d;idx[t++]=b;idx[t++]=c;idx[t++]=d;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));g.setAttribute('aGL',new THREE.BufferAttribute(gl,3));
 g.setIndex(new THREE.BufferAttribute(idx,1));g.computeVertexNormals();const m=new THREE.Mesh(g,MAT_GROUND);if(KG_RELIEF&&KGL.length)KGROUND.cavityMesh(m);
 m.userData.probeSkip=true;m.userData.inspectLabel='The Outland Gate: the Narrows\' floor';scene.add(m);return m;})();
// the DRAWN ground: the mesh's own triangles (15.6 m cells), which a camera must stand on
const drawnH=(function(){const N=480,S=TERR.R*2.2,cs=S/N,nx=N+1,P=GROUND.geometry.attributes.position.array;
 return(x,z)=>{const u=clamp((x+S/2)/cs,0,N-1e-6),v=clamp((z+S/2)/cs,0,N-1e-6),i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,a=j*nx+i,b=a+nx,c2=b+1,d=a+1;
  const y=k=>P[k*3+1];return fu+fv<1?y(a)+(y(d)-y(a))*fu+(y(b)-y(a))*fv:y(c2)+(y(b)-y(c2))*(1-fu)+(y(d)-y(c2))*(1-fv);};})();
{const P=[];P.push(rivX(1200),LVL(1200)-1.5,1200);BRAIDS.forEach(B=>{const p=B.pts[Math.floor(B.pts.length/2)];P.push(p[0],LVL(p[1])-1,p[1]);});
 const o=new THREE.Object3D();o.name='river probe points';o.userData.probePoints=P;scene.add(o);}
